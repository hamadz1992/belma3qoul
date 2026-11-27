import { getAdmin, json, sameOrigin } from '../_lib/auth.js'

function clean(value, max = 2000) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function mapPrize(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url || '',
    details: row.details || '',
    published: Boolean(row.is_published),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url)
  const adminView = url.searchParams.get('admin') === '1'
  if (adminView && !(await getAdmin(request, env))) return json({ success: false, error: 'Authentication required' }, 401)
  const query = adminView
    ? 'SELECT * FROM prizes ORDER BY created_at DESC'
    : 'SELECT * FROM prizes WHERE is_published = 1 ORDER BY created_at DESC'
  const { results } = await env.DB.prepare(query).all()
  return json({ success: true, prizes: (results || []).map(mapPrize) })
}

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ success: false, error: 'Invalid request origin' }, 403)
  if (!(await getAdmin(request, env))) return json({ success: false, error: 'Authentication required' }, 401)
  let body
  try { body = await request.json() } catch { return json({ success: false, error: 'بيانات غير صالحة' }, 400) }
  const title = clean(body.title, 120)
  if (!title) return json({ success: false, error: 'اسم الجائزة مطلوب' }, 400)
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  await env.DB.prepare('INSERT INTO prizes (id, title, description, image_url, details, is_published, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(id, title, clean(body.description, 1500), clean(body.imageUrl, 2000), clean(body.details, 1500), body.published === false ? 0 : 1, now, now).run()
  return json({ success: true, prize: { id, title, description: clean(body.description, 1500), imageUrl: clean(body.imageUrl, 2000), details: clean(body.details, 1500), published: body.published !== false, createdAt: now, updatedAt: now } }, 201)
}

export async function onRequestPut({ request, env }) {
  if (!sameOrigin(request)) return json({ success: false, error: 'Invalid request origin' }, 403)
  if (!(await getAdmin(request, env))) return json({ success: false, error: 'Authentication required' }, 401)
  let body
  try { body = await request.json() } catch { return json({ success: false, error: 'بيانات غير صالحة' }, 400) }
  const id = clean(body.id, 80)
  const title = clean(body.title, 120)
  if (!id || !title) return json({ success: false, error: 'معرّف الجائزة واسمها مطلوبان' }, 400)
  const now = new Date().toISOString()
  const result = await env.DB.prepare('UPDATE prizes SET title = ?, description = ?, image_url = ?, details = ?, is_published = ?, updated_at = ? WHERE id = ?')
    .bind(title, clean(body.description, 1500), clean(body.imageUrl, 2000), clean(body.details, 1500), body.published === false ? 0 : 1, now, id).run()
  if (!result.meta?.changes) return json({ success: false, error: 'الجائزة غير موجودة' }, 404)
  return json({ success: true })
}

export async function onRequestDelete({ request, env }) {
  if (!sameOrigin(request)) return json({ success: false, error: 'Invalid request origin' }, 403)
  if (!(await getAdmin(request, env))) return json({ success: false, error: 'Authentication required' }, 401)
  const id = new URL(request.url).searchParams.get('id')
  if (!id) return json({ success: false, error: 'معرّف الجائزة مطلوب' }, 400)
  await env.DB.prepare('DELETE FROM prizes WHERE id = ?').bind(id).run()
  return json({ success: true })
}
