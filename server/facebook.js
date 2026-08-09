import { loadFacebookData } from './facebook-storage.js'

function getGraphVersion() {
  return (process.env.META_GRAPH_VERSION || 'v26.0').trim()
}

async function getFacebookConnection() {
  const stored = await loadFacebookData()

  const useDatabase = Boolean((process.env.DATABASE_URL || '').trim())

  const pageId = (
    stored.pageId ||
    (!useDatabase ? process.env.FACEBOOK_PAGE_ID : '') ||
    ''
  ).trim()

  const accessToken = (
    stored.pageAccessToken ||
    (!useDatabase ? process.env.FACEBOOK_PAGE_ACCESS_TOKEN : '') ||
    ''
  ).trim()

  return { pageId, accessToken }
}

const CACHE_TTL_MS = 1000 * 60 * 5

let cache = {
  key: '',
  updatedAt: 0,
  posts: [],
}

function getCacheKey(limit, pageId) {
  return `${getGraphVersion()}-${pageId}-${limit}`
}

function textOrEmpty(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function extractMedia(post) {
  const attachments = Array.isArray(post?.attachments?.data)
    ? post.attachments.data
    : []

  const candidates = []

  for (const attachment of attachments) {
    candidates.push(attachment)

    const subattachments = Array.isArray(attachment?.subattachments?.data)
      ? attachment.subattachments.data
      : []

    candidates.push(...subattachments)
  }

  let imageUrl = textOrEmpty(post?.full_picture)
  let videoUrl = ''

  for (const attachment of candidates) {
    if (!imageUrl) {
      imageUrl =
        textOrEmpty(attachment?.media?.image?.src) ||
        textOrEmpty(attachment?.media?.image?.url) ||
        textOrEmpty(attachment?.url)
    }

    if (!videoUrl && String(attachment?.media_type || '').toLowerCase() === 'video') {
      videoUrl =
        textOrEmpty(attachment?.media?.source) ||
        textOrEmpty(attachment?.media?.video?.source) ||
        textOrEmpty(attachment?.source)
    }
  }

  return { imageUrl, videoUrl }
}

function normalizePost(post) {
  const id = textOrEmpty(post?.id)
  const message = textOrEmpty(post?.message)
  const createdTime = textOrEmpty(post?.created_time)
  const permalinkUrl =
    textOrEmpty(post?.permalink_url) ||
    `https://www.facebook.com/${id}`
  const { imageUrl, videoUrl } = extractMedia(post)

  return {
    id,
    message,
    createdTime,
    permalinkUrl,
    imageUrl,
    videoUrl,
  }
}

export async function fetchFacebookPosts({ limit = 4 } = {}) {
  const safeLimit = Number.isFinite(limit)
    ? Math.max(1, Math.min(20, Math.floor(limit)))
    : 4

  const connection = await getFacebookConnection()

  if (!connection.pageId || !connection.accessToken) {
    const error = new Error('Facebook is not connected.')
    error.code = 'FACEBOOK_NOT_CONNECTED'
    throw error
  }

  const key = getCacheKey(safeLimit, connection.pageId)
  const now = Date.now()

  if (cache.key === key && now - cache.updatedAt < CACHE_TTL_MS) {
    return cache.posts
  }

  const endpoint = new URL(
    `https://graph.facebook.com/${getGraphVersion()}/${connection.pageId}/feed`
  )

  endpoint.searchParams.set(
    'fields',
    'id,message,created_time,permalink_url,full_picture,attachments{media_type,media{image,source},url,subattachments{media_type,media{image,source},url}}'
  )
  endpoint.searchParams.set('limit', String(safeLimit))
  endpoint.searchParams.set('access_token', connection.accessToken)

  const response = await fetch(endpoint)

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    console.error('Facebook API Error:', response.status)
    console.error(body)

    const error = new Error(body || 'Unable to fetch Facebook posts.')
    error.status = response.status
    throw error
  }

  const payload = await response.json()
  const posts = Array.isArray(payload?.data)
    ? payload.data.map(normalizePost).filter((post) => post.id)
    : []

  cache = {
    key,
    updatedAt: now,
    posts,
  }

  return posts
}
