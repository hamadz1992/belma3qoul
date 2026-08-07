import dotenv from 'dotenv'
import { saveFacebookData } from '../facebook-storage.js'
dotenv.config()

const REDIRECT_URI = 'https://belma3qoul.onrender.com/auth/facebook/callback'

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
    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(
      JSON.stringify(
        {
          ok: false,
          stage: 'oauth',
          error,
          error_reason: url.searchParams.get('error_reason') || '',
          error_description: url.searchParams.get('error_description') || '',
        },
        null,
        2
      )
    )
    return
  }

  if (!code) {
    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(
      JSON.stringify(
        {
          ok: false,
          stage: 'oauth',
          error: 'missing_code',
        },
        null,
        2
      )
    )
    return
  }

  const APP_ID = text(process.env.FACEBOOK_APP_ID)
  const APP_SECRET = text(process.env.FACEBOOK_APP_SECRET)

  if (!APP_ID || !APP_SECRET) {
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(
      JSON.stringify(
        {
          ok: false,
          stage: 'config',
          error: 'Missing FACEBOOK_APP_ID or FACEBOOK_APP_SECRET',
        },
        null,
        2
      )
    )
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
    res.writeHead(tokenResponse.status, {
      'Content-Type': 'application/json; charset=utf-8',
    })

    res.end(
      JSON.stringify(
        {
          ok: false,
          stage: 'user_access_token',
          error: tokenData,
        },
        null,
        2
      )
    )

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

if (!debugData.data) {
  console.log('DEBUG TOKEN INVALID OR EMPTY')
}

const PAGE_ID = '2330896763591463'

  const pageUrl = new URL(
    `https://graph.facebook.com/v26.0/${PAGE_ID}`
  )

pageUrl.searchParams.set(
  'fields',
  'id,name,access_token'
)

  pageUrl.searchParams.set(
    'access_token',
    userAccessToken
  )

  const pageResponse = await fetch(pageUrl.toString())
  const pageData = await readJson(pageResponse)

   if (!pageResponse.ok) {
  res.writeHead(pageResponse.status, {
    'Content-Type': 'application/json; charset=utf-8',
  })

  res.end(
    JSON.stringify(
      {
        ok: false,
        stage: 'page',
        error: pageData,
      },
      null,
      2
    )
  )

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

res.writeHead(200, {
  'Content-Type': 'application/json; charset=utf-8',
})

res.end(
  JSON.stringify(
    {
      ok: true,
      stage: 'done',
      pages: pages.map((page) => ({
        id: page.id || '',
        name: page.name || '',
        accessToken: page.access_token || '',
      })),
      selectedPage: firstPage
        ? {
            id: firstPage.id || '',
            name: firstPage.name || '',
            accessToken: firstPage.access_token || '',
          }
        : null,
    },
    null,
    2
  )
)

} catch (error) {
  console.log('FACEBOOK AUTH ERROR:')
  console.log(error)

  res.writeHead(500, {
    'Content-Type': 'application/json; charset=utf-8',
  })

  res.end(
    JSON.stringify(
      {
        ok: false,
        stage: 'exception',
        error: String(error),
      },
      null,
      2
    )
  )
}
}