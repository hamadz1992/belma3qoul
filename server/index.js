import http from 'node:http'
import { createReadStream } from 'node:fs'
import { access, readFile, writeFile, stat, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadFacebookData } from './facebook-storage.js'
import { fetchFacebookPosts, fetchFacebookPostById } from './facebook.js'
import {
  facebookLogin,
  facebookCallback,
} from './routes/facebook-auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectRoot = path.resolve(__dirname, '..')
const distDir = path.join(projectRoot, 'dist')
const dataDir = path.join(__dirname, 'data')

const featuredFile = path.join(dataDir, 'featured-posts.json')
const settingsFile = path.join(dataDir, 'settings.json')

const port = Number.parseInt(
  process.env.FACEBOOK_API_PORT || process.env.PORT || '8787',
  10
)

const DEFAULT_SETTINGS = {
  site: {
    name: '',
    description: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    googleMaps: '',
    hours: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    telegram: '',
    youtube: '',
  },
}

async function ensureDataDirectory() {
  await mkdir(dataDir, { recursive: true })
}

async function getSettings() {
  try {
    const data = await readFile(settingsFile, 'utf8')
    return {
      ...DEFAULT_SETTINGS,
      ...JSON.parse(data),
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

async function saveSettings(settings) {
  await ensureDataDirectory()

  await writeFile(
    settingsFile,
    JSON.stringify(settings, null, 2),
    'utf8'
  )

  return settings
}

async function updateSettings(req, res) {
  let body = ''

  req.on('data', (chunk) => {
    body += chunk
  })

  req.on('end', async () => {
    try {
      const settings = JSON.parse(body)

      await saveSettings(settings)

      sendJson(res, 200, {
        success: true,
        settings,
      })
    } catch {
      sendJson(res, 400, {
        success: false,
        error: 'Invalid settings data',
      })
    }
  })
}

async function getFeaturedPosts() {
  try {
    const data = await readFile(featuredFile, 'utf8')
    return JSON.parse(data).posts || []
  } catch {
    return []
  }
}

async function saveFeaturedPosts(posts) {
  await ensureDataDirectory()

  await writeFile(
    featuredFile,
    JSON.stringify({ posts }, null, 2),
    'utf8'
  )
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
}

function getContentType(filePath) {
  return (
    mimeTypes[path.extname(filePath).toLowerCase()] ||
    'application/octet-stream'
  )
}

async function fileExists(filePath) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data)

  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })

  res.end(body)
}

function sendText(res, statusCode, text) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
  })

  res.end(text)
}

async function serveStatic(res, requestPath) {
  let filePath = path.join(distDir, requestPath)

  if (requestPath === '/') {
    filePath = path.join(distDir, 'index.html')
  } else if (await fileExists(filePath)) {
    const fileStats = await stat(filePath)

    if (fileStats.isDirectory()) {
      filePath = path.join(filePath, 'index.html')
    }
  } else if (!path.extname(filePath)) {
    filePath = path.join(distDir, 'index.html')
  } else {
    sendText(res, 404, 'Not found')
    return
  }

  if (!(await fileExists(filePath))) {
    filePath = path.join(distDir, 'index.html')
  }

  const contentType = getContentType(filePath)

  res.writeHead(200, {
    'Content-Type': contentType,
  })

  createReadStream(filePath).pipe(res)
}

async function handleFeaturedPosts(req, res) {
  const posts = await getFeaturedPosts()

  sendJson(res, 200, {
    success: true,
    posts,
  })
}

async function addFeaturedPost(req, res) {
  let body = ''

  req.on('data', (chunk) => {
    body += chunk
  })

  req.on('end', async () => {
    try {
      const post = JSON.parse(body)

      if (!post || !post.id) {
        throw new Error('Invalid post')
      }

      const posts = await getFeaturedPosts()

      const exists = posts.some(
        (item) => item.id === post.id
      )

      if (!exists) {
        posts.unshift(post)
      }

      const updatedPosts = posts.slice(0, 3)

      await saveFeaturedPosts(updatedPosts)

      sendJson(res, 200, {
        success: true,
        posts: updatedPosts,
      })
    } catch {
      sendJson(res, 400, {
        success: false,
        error: 'Invalid data',
      })
    }
  })
}

async function removeFeaturedPost(req, res, url) {
  const postId = url.searchParams.get('id')

  if (!postId) {
    sendJson(res, 400, {
      success: false,
      error: 'Post id is required',
    })
    return
  }

  const posts = await getFeaturedPosts()
  const updatedPosts = posts.filter((post) => post.id !== postId)

  await saveFeaturedPosts(updatedPosts)

  sendJson(res, 200, {
    success: true,
    posts: updatedPosts,
  })
}

async function handleFacebookStatus(req, res) {
  try {
    const data = await loadFacebookData()

    sendJson(res, 200, {
      success: true,
      connected: Boolean(data.connected && data.pageAccessToken),
      pageId: data.pageId || '',
      pageName: data.pageName || '',
      connectedAt: data.connectedAt || '',
      expiresAt: data.expiresAt || '',
    })
  } catch (error) {
    sendJson(res, 500, {
      success: false,
      connected: false,
      pageId: '',
      pageName: '',
      connectedAt: '',
      expiresAt: '',
      error: String(error),
    })
  }
}

async function handleFacebookPosts(req, res, url) {
  const limitParam = url.searchParams.get('limit')
  const limit = limitParam
    ? Number.parseInt(limitParam, 10)
    : 4

  try {
    const posts = await fetchFacebookPosts({ limit })

    sendJson(res, 200, {
      source: 'facebook',
      count: posts.length,
      posts,
      fetchedAt: new Date().toISOString(),
    })
  } catch (error) {
    const status =
      typeof error?.status === 'number'
        ? error.status
        : 503

    sendJson(res, status, {
      success: false,
      source: 'facebook',
      posts: [],
      error: error?.message || 'Unable to fetch Facebook posts.',
    })
  }
}

async function handleFacebookReel(req, res, url) {
  const value = url.searchParams.get('id') || url.searchParams.get('url') || ''

  try {
    const post = await fetchFacebookPostById(value)

    sendJson(res, 200, {
      success: true,
      source: 'facebook',
      post,
    })
  } catch (error) {
    const status =
      typeof error?.status === 'number'
        ? error.status
        : 503

    sendJson(res, status, {
      success: false,
      source: 'facebook',
      post: null,
      error: error?.message || 'Unable to fetch Facebook Reel.',
    })
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(
      req.url || '/',
      `http://${req.headers.host || 'localhost'}`
    )

    const method = (req.method || 'GET').toUpperCase()

    // Settings
    if (
      method === 'GET' &&
      url.pathname === '/api/settings'
    ) {
      const settings = await getSettings()

      sendJson(res, 200, settings)
      return
    }

    if (
      method === 'POST' &&
      url.pathname === '/api/settings'
    ) {
      await updateSettings(req, res)
      return
    }

    // Facebook OAuth
    if (
      method === 'GET' &&
      url.pathname === '/auth/facebook'
    ) {
      await facebookLogin(req, res)
      return
    }

    if (
      method === 'GET' &&
      url.pathname === '/auth/facebook/callback'
    ) {
      req.url = url
      await facebookCallback(req, res)
      return
    }

    // Featured posts
    if (
      method === 'GET' &&
      url.pathname === '/api/admin/featured-posts'
    ) {
      await handleFeaturedPosts(req, res)
      return
    }

    if (
      method === 'POST' &&
      url.pathname === '/api/admin/featured-posts'
    ) {
      await addFeaturedPost(req, res)
      return
    }

    if (
      method === 'DELETE' &&
      url.pathname === '/api/admin/featured-posts'
    ) {
      await removeFeaturedPost(req, res, url)
      return
    }

    // Facebook status
    if (
      method === 'GET' &&
      url.pathname === '/api/facebook/status'
    ) {
      await handleFacebookStatus(req, res)
      return
    }

    // Facebook Reel lookup
    if (
      method === 'GET' &&
      url.pathname === '/api/facebook/reel'
    ) {
      await handleFacebookReel(req, res, url)
      return
    }

    // Facebook posts
    if (
      method === 'GET' &&
      url.pathname === '/api/facebook/posts'
    ) {
      await handleFacebookPosts(req, res, url)
      return
    }

    // Static frontend
    if (method === 'GET') {
      await serveStatic(res, url.pathname)
      return
    }

    sendText(res, 405, 'Method Not Allowed')
  } catch (error) {
    console.error('Server request error:', error)

    if (!res.headersSent) {
      sendJson(res, 500, {
        success: false,
        error: 'Internal server error',
      })
    }
  }
})

server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})