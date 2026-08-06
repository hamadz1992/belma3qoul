import dotenv from 'dotenv'
dotenv.config()
console.log({
  PAGE_ID: process.env.FACEBOOK_PAGE_ID,
  TOKEN: process.env.FACEBOOK_PAGE_ACCESS_TOKEN?.substring(0, 10),
})
import http from 'node:http'
import { createReadStream } from 'node:fs'
import { access, readFile, writeFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { fetchFacebookPosts } from './facebook.js'
import {
  facebookLogin,
  facebookCallback,
} from './routes/facebook-auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const distDir = path.join(projectRoot, 'dist')
const port = Number.parseInt(process.env.FACEBOOK_API_PORT || process.env.PORT || '8787', 10)
const featuredFile = path.join(__dirname, 'featured.json')

async function getFeaturedPosts() {
  try {
    const data = await readFile(featuredFile, 'utf8')
    return JSON.parse(data).posts || []
  } catch {
    return []
  }
}

async function saveFeaturedPosts(posts) {
  await writeFile(
    featuredFile,
    JSON.stringify({ posts }, null, 2),
    'utf8'
  )
}
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2)
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  res.end(body)
}

function sendText(res, statusCode, message) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  res.end(message)
}

function getContentType(filePath) {
  return mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
}

async function fileExists(filePath) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function serveStatic(res, requestPath) {
  if (!(await fileExists(distDir))) {
    sendText(res, 404, 'Build output not found. Run npm run build first.')
    return
  }

  let relativePath = decodeURIComponent(requestPath || '/')
  if (relativePath.startsWith('/')) {
    relativePath = relativePath.slice(1)
  }

  let filePath = path.join(distDir, relativePath)

  const exists = await fileExists(filePath)
  if (exists) {
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
  res.writeHead(200, { 'Content-Type': contentType })
  createReadStream(filePath).pipe(res)
}
async function handleFeaturedPosts(req, res) {
  const posts = await getFeaturedPosts()

  sendJson(res, 200, {
    posts,
  })
}


async function addFeaturedPost(req, res) {
  let body = ''

  req.on('data', chunk => {
    body += chunk
  })

  req.on('end', async () => {
    try {
      const post = JSON.parse(body)

      const posts = await getFeaturedPosts()

      const exists = posts.some(item => item.id === post.id)

      if (!exists) {
        posts.unshift(post)
      }

      await saveFeaturedPosts(posts.slice(0, 3))

      sendJson(res, 200, {
        success: true,
        posts: posts.slice(0, 3),
      })

    } catch (error) {
      sendJson(res, 400, {
        success: false,
        error: 'Invalid data',
      })
    }
  })
}
async function handleFacebookPosts(req, res, url) {
  const limitParam = url.searchParams.get('limit')
  const limit = limitParam ? Number.parseInt(limitParam, 10) : 4

  try {
    const posts = await fetchFacebookPosts({ limit })
    sendJson(res, 200, {
      source: 'facebook',
      count: posts.length,
      posts,
      fetchedAt: new Date().toISOString(),
    })
  } catch (error) {
    const status = typeof error?.status === 'number' ? error.status : 503
    sendJson(res, status, {
      source: 'facebook',
      posts: [],
      error: error?.message || 'Unable to fetch Facebook posts.',
    })
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
  const method = (req.method || 'GET').toUpperCase()
  if (method === 'GET' && url.pathname === '/auth/facebook') {
  await facebookLogin(req, res)
  return
}

if (method === 'GET' && url.pathname === '/auth/facebook/callback') {
  req.url = url
  await facebookCallback(req, res)
  return
}
if (method === 'GET' && url.pathname === '/api/admin/featured-posts') {
  await handleFeaturedPosts(req, res)
  return
}

if (method === 'POST' && url.pathname === '/api/admin/featured-posts') {
  await addFeaturedPost(req, res)
  return
}
  if (method === 'GET' && url.pathname === '/api/facebook/posts') {
    await handleFacebookPosts(req, res, url)
    return
  }

  if (method === 'GET') {
    await serveStatic(res, url.pathname)
    return
  }

  sendText(res, 405, 'Method Not Allowed')
})

server.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`)
})
