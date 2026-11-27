import { createSession, json, sameOrigin } from '../../_lib/auth.js'

function constantTimeEqual(left, right) {
  const a = new TextEncoder().encode(left)
  const b = new TextEncoder().encode(right)
  let diff = a.length ^ b.length
  const length = Math.max(a.length, b.length)
  for (let i = 0; i < length; i += 1) diff |= (a[i] || 0) ^ (b[i] || 0)
  return diff === 0
}

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ success: false, error: 'Invalid request origin' }, 403)
  if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD) return json({ success: false, error: 'لم يتم إعداد بيانات دخول المسؤول في Cloudflare.' }, 503)
  let body
  try { body = await request.json() } catch { return json({ success: false, error: 'بيانات تسجيل الدخول غير صالحة' }, 400) }
  const username = typeof body.username === 'string' ? body.username.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  if (!constantTimeEqual(username, env.ADMIN_USERNAME) || !constantTimeEqual(password, env.ADMIN_PASSWORD)) {
    return json({ success: false, authenticated: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' }, 401)
  }
  return createSession(request, env, username)
}
