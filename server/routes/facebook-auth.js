import dotenv from 'dotenv'

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
    'scope',
    [
      'public_profile',
      'pages_show_list',
      'pages_read_engagement',
      'pages_read_user_content',
      'pages_manage_metadata',
    ].join(',')
  )

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
   const tokenUrl = new URL(
  'https://graph.facebook.com/v26.0/oauth/access_token'
)

tokenUrl.searchParams.set('client_id', APP_ID)
tokenUrl.searchParams.set('client_secret', APP_SECRET)
tokenUrl.searchParams.set('redirect_uri', REDIRECT_URI)
tokenUrl.searchParams.set('code', code)

const tokenResponse = await fetch(tokenUrl.toString())
const tokenData = await readJson(tokenResponse)

console.log('TOKEN STATUS:', tokenResponse.status)
console.log('TOKEN DATA:')
console.log(JSON.stringify(tokenData, null, 2))

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

console.log('USER TOKEN LENGTH:', userAccessToken.length)
console.log('USER TOKEN PREFIX:', userAccessToken.substring(0, 20))

const meResponse = await fetch(
  `https://graph.facebook.com/v26.0/me?access_token=${encodeURIComponent(
    userAccessToken
  )}`
)

const meData = await readJson(meResponse)

console.log('ME STATUS:', meResponse.status)
console.log(JSON.stringify(meData, null, 2))

const accountsUrl = new URL(
  'https://graph.facebook.com/v26.0/me/accounts'
)

accountsUrl.searchParams.set(
  'fields',
  'id,name,access_token,tasks'
)

accountsUrl.searchParams.set(
  'access_token',
  userAccessToken
)

console.log(accountsUrl.toString())

const accountsResponse = await fetch(accountsUrl.toString())
const accountsData = await readJson(accountsResponse)

console.log('ACCOUNTS STATUS:', accountsResponse.status)
console.log(JSON.stringify(accountsData, null, 2))
    console.log(accountsData)
    if (!accountsResponse.ok) {
      res.writeHead(accountsResponse.status, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(
        JSON.stringify(
          {
            ok: false,
            stage: 'pages',
            error: accountsData,
          },
          null,
          2
        )
      )
      return
    }

    const pages = Array.isArray(accountsData.data) ? accountsData.data : []
    const firstPage = pages[0] || null

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(
      JSON.stringify(
        {
          ok: true,
          stage: 'done',
          userAccessToken,
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
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(
      JSON.stringify(
        {
          ok: false,
          stage: 'exception',
          error: err?.message || 'Unexpected error',
        },
        null,
        2
      )
    )
  }
}