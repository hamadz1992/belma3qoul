import dotenv from 'dotenv'

dotenv.config()

const REDIRECT_URI =
  'http://127.0.0.1:8787/auth/facebook/callback'

export async function facebookLogin(req, res) {
  const APP_ID = process.env.FACEBOOK_APP_ID

  console.log('APP_ID =', APP_ID)

  const url = new URL(
    'https://www.facebook.com/v26.0/dialog/oauth'
  )

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
]
  )

  res.writeHead(302, {
    Location: url.toString(),
  })

  res.end()
}

export async function facebookCallback(req, res) {
  const code = req.url.searchParams.get('code')

  if (!code) {
    res.writeHead(400)
    res.end('Facebook login cancelled.')
    return
  }

  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
  })

  res.end(`
    <h1>تم تسجيل الدخول بنجاح ✅</h1>

    <p>
      تم استلام Authorization Code بنجاح.
    </p>
  `)
}