import { getAdmin, json } from '../../_lib/auth.js'

export async function onRequestGet({ request, env }) {
  const admin = await getAdmin(request, env)
  return json(admin ? { success: true, authenticated: true, username: admin.username } : { success: true, authenticated: false })
}
