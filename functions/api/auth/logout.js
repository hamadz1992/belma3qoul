import { clearSession, json, sameOrigin } from '../../_lib/auth.js'

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ success: false, error: 'Invalid request origin' }, 403)
  return clearSession(request, env)
}
