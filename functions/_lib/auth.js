const COOKIE = '__Host-belma3qoul_admin'
const SESSION_TTL_SECONDS = 60 * 60 * 8

function cookieValue(request, name) {
  const cookie = request.headers.get('Cookie') || ''
  for (const part of cookie.split(';')) {
    const index = part.indexOf('=')
    if (index >= 0 && part.slice(0, index).trim() === name) return decodeURIComponent(part.slice(index + 1).trim())
  }
  return ''
}

async function digest(value) {
  const bytes = new TextEncoder().encode(value)
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function createSession(request, env, username) {
  const tokenBytes = crypto.getRandomValues(new Uint8Array(32))
  const token = Array.from(tokenBytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  const tokenHash = await digest(token)
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  await env.DB.prepare('INSERT INTO admin_sessions (token_hash, username, expires_at) VALUES (?, ?, ?)').bind(tokenHash, username, expiresAt).run()
  return new Response(JSON.stringify({ success: true, authenticated: true, username }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Set-Cookie': `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}`,
    },
  })
}

export async function getAdmin(request, env) {
  const token = cookieValue(request, COOKIE)
  if (!token || !env.DB) return null
  const tokenHash = await digest(token)
  const row = await env.DB.prepare('SELECT username, expires_at FROM admin_sessions WHERE token_hash = ?').bind(tokenHash).first()
  if (!row || row.expires_at <= Math.floor(Date.now() / 1000)) {
    if (row) await env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').bind(tokenHash).run()
    return null
  }
  await env.DB.prepare('UPDATE admin_sessions SET expires_at = ? WHERE token_hash = ?').bind(Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS, tokenHash).run()
  return { username: row.username }
}

export async function clearSession(request, env) {
  const token = cookieValue(request, COOKIE)
  if (token) await env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').bind(await digest(token)).run()
  return new Response(JSON.stringify({ success: true, authenticated: false }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Set-Cookie': `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`,
    },
  })
}

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  })
}

export function sameOrigin(request) {
  const origin = request.headers.get('Origin')
  if (!origin) return true
  try { return new URL(origin).host === new URL(request.url).host } catch { return false }
}
