import dotenv from 'dotenv'
import { saveFacebookData } from '../facebook-storage.js'
dotenv.config()

const REDIRECT_URI = text(process.env.FACEBOOK_REDIRECT_URI) || 'https://belma3qoul.onrender.com/auth/facebook/callback'

function redirectToFacebookPage(res, params = {}) {
  const base = text(process.env.FACEBOOK_ADMIN_REDIRECT) || 'https://belma3qoul.onrender.com/admin/facebook'
  const target = new URL(base)
  for (const [key, value] of Object.entries(params)) {
    if (value) target.searchParams.set(key, value)
  }
  res.writeHead(302, { Location: target.toString() })
  res.end()
}


function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

async function readJson(response) {
  const raw = await response.text()
  try {
    return JSON.parse(raw)
  } catch {
    return { raw }
  }
}

export async function facebookLogin(req, res) {
  const APP_ID = text(process.env.FACEBOOK_APP_ID)

  if (!APP_ID) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Missing FACEBOOK_APP_ID')
    return
  }

  const url = new URL('https://www.facebook.com/v26.0/dialog/oauth')
  url.searchParams.set('client_id', APP_ID)
  url.searchParams.set('redirect_uri', REDIRECT_URI)
  url.searchParams.set(
  'config_id',
  '1726342991977666'
  )
/*
url.searchParams.set(
  'scope',
  [
    'public_profile',
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_posts',
    'pages_manage_metadata',
    'business_management'
  ].join(',')
)
*/

  res.writeHead(302, {
    Location: url.toString(),
  })
  res.end()
}

export async function facebookCallback(req, res) {
  const url = new URL(req.url || '/', 'http://localhost')
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')

  if (error) {
    redirectToFacebookPage(res, {
      facebook: 'error',
      message: url.searchParams.get('error_description') || error,
    })
    return
  }

  if (!code) {
    redirectToFacebookPage(res, {
      facebook: 'error',
      message: 'missing_code',
    })
    return
  }

  const APP_ID = text(process.env.FACEBOOK_APP_ID)
  const APP_SECRET = text(process.env.FACEBOOK_APP_SECRET)

  if (!APP_ID || !APP_SECRET) {
    redirectToFacebookPage(res, { facebook: 'error', message: 'Missing Facebook app configuration' })
    return
  }

  try {
  console.log('FACEBOOK AUTH VERSION: 4 - PAGE TOKEN FIX')

  const tokenUrl = new URL(
    'https://graph.facebook.com/v26.0/oauth/access_token'
  )

  tokenUrl.searchParams.set('client_id', APP_ID)
  tokenUrl.searchParams.set('client_secret', APP_SECRET)
  tokenUrl.searchParams.set('redirect_uri', REDIRECT_URI)
  tokenUrl.searchParams.set('code', code)

  const tokenResponse = await fetch(tokenUrl.toString())
  const tokenData = await readJson(tokenResponse)
  if (!tokenResponse.ok) {
    redirectToFacebookPage(res, { facebook: 'error', message: tokenData?.error?.message || 'تعذر الحصول على رمز الدخول' })
    return
  }

  const userAccessToken = text(tokenData.access_token)

  const debugUrl = new URL(
    'https://graph.facebook.com/v26.0/debug_token'
  )

  debugUrl.searchParams.set(
    'input_token',
    userAccessToken
  )

  debugUrl.searchParams.set(
    'access_token',
    `${APP_ID}|${APP_SECRET}`
  )

 const debugResponse = await fetch(debugUrl.toString())
const debugData = await readJson(debugResponse)

const pagesUrl = new URL(
  'https://graph.facebook.com/v26.0/me/accounts'
)

pagesUrl.searchParams.set(
  'fields',
  'id,name,access_token'
)

pagesUrl.searchParams.set(
  'access_token',
  userAccessToken
)

const pagesResponse = await fetch(pagesUrl.toString())
const pagesData = await readJson(pagesResponse)

if (!pagesResponse.ok) {
  redirectToFacebookPage(res, { facebook: 'error', message: pagesData?.error?.message || 'تعذر جلب صفحات Facebook' })
  return
}

const configuredPageId = text(process.env.FACEBOOK_PAGE_ID)
const pageData = configuredPageId
  ? pagesData.data.find((page) => page.id === configuredPageId)
  : pagesData.data[0]

if (!pageData) {
  redirectToFacebookPage(res, { facebook: 'error', message: 'لم يتم العثور على صفحة Facebook المطلوبة' })
  return
}
const pages = [pageData]
const firstPage = pageData

await saveFacebookData({
  connected: true,
  pageId: firstPage.id || '',
  pageName: firstPage.name || '',
  pageAccessToken: firstPage.access_token || '',
  userAccessToken,
  connectedAt: new Date().toISOString(),
  expiresAt: debugData?.data?.expires_at
    ? new Date(debugData.data.expires_at * 1000).toISOString()
    : '',
})
console.log(
  JSON.stringify(
    {
      id: firstPage.id || '',
      name: firstPage.name || '',
      hasPageToken: Boolean(firstPage.access_token),
    },
    null,
    2
  )
)

redirectToFacebookPage(res, { facebook: 'connected' })

} catch (error) {
  console.log('FACEBOOK AUTH ERROR:')
  console.log(error)

  redirectToFacebookPage(res, { facebook: 'error', message: String(error) })
}
}