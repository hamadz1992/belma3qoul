import { getAdmin, json, sameOrigin } from '../_lib/auth.js'

const defaults = {
  site: { name: '', description: '', phone: '', whatsapp: '', email: '', address: '', googleMaps: '', hours: '', facebook: '', instagram: '', tiktok: '', telegram: '', youtube: '' },
  social: { facebook: '', instagram: '', tiktok: '', telegram: '', youtube: '', whatsapp: '', messenger: '' },
}

export async function onRequestGet({ env }) {
  const row = await env.DB.prepare("SELECT value FROM site_settings WHERE key = 'main'").first()
  let saved = {}
  try { saved = row?.value ? JSON.parse(row.value) : {} } catch { saved = {} }
  return json({ ...defaults, ...saved, site: { ...defaults.site, ...(saved.site || {}) }, social: { ...defaults.social, ...(saved.social || {}) } })
}

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ success: false, error: 'Invalid request origin' }, 403)
  if (!(await getAdmin(request, env))) return json({ success: false, error: 'Authentication required' }, 401)
  let settings
  try { settings = await request.json() } catch { return json({ success: false, error: 'Invalid settings data' }, 400) }
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) return json({ success: false, error: 'Invalid settings data' }, 400)
  await env.DB.prepare("INSERT INTO site_settings (key, value, updated_at) VALUES ('main', ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at")
    .bind(JSON.stringify(settings), new Date().toISOString()).run()
  return json({ success: true, settings })
}
