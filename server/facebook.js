function getGraphVersion() {
  return (process.env.META_GRAPH_VERSION || 'v26.0').trim()
}

function getPageId() {
  return (process.env.FACEBOOK_PAGE_ID || '').trim()
}

function getAccessToken() {
  return (process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '').trim()
}
const CACHE_TTL_MS = 1000 * 60 * 5

let cache = {
  key: '',
  updatedAt: 0,
  posts: [],
}

function hasValidConfig() {
  return getPageId().length > 0 && getAccessToken().length > 0
}


function getCacheKey(limit) {
  return `${getGraphVersion()}-${getPageId()}-${limit}`
}

function textOrEmpty(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function extractImageUrl(post) {
  const fullPicture = textOrEmpty(post?.full_picture)
  if (fullPicture) return fullPicture

  const attachments = Array.isArray(post?.attachments?.data) ? post.attachments.data : []
  for (const attachment of attachments) {
    const image =
      textOrEmpty(attachment?.media?.image?.src) ||
      textOrEmpty(attachment?.media?.image?.url) ||
      textOrEmpty(attachment?.url)

    if (image) return image

    const subattachments = Array.isArray(attachment?.subattachments?.data)
      ? attachment.subattachments.data
      : []

    for (const sub of subattachments) {
      const subImage =
        textOrEmpty(sub?.media?.image?.src) ||
        textOrEmpty(sub?.media?.image?.url) ||
        textOrEmpty(sub?.url)

      if (subImage) return subImage
    }
  }

  return ''
}

function normalizePost(post) {
  const id = textOrEmpty(post?.id)
  const message = textOrEmpty(post?.message)
  const createdTime = textOrEmpty(post?.created_time)
  const permalinkUrl = textOrEmpty(post?.permalink_url) || `https://www.facebook.com/${id}`
  const imageUrl = extractImageUrl(post)

  return {
    id,
    message,
    createdTime,
    permalinkUrl,
    imageUrl,
  }
}

export async function fetchFacebookPosts({ limit = 4 } = {}) {
  const safeLimit = Number.isFinite(limit)
    ? Math.max(1, Math.min(20, Math.floor(limit)))
    : 4

  if (!hasValidConfig()) {
    const error = new Error('Facebook configuration is missing.')
    error.code = 'FACEBOOK_CONFIG_MISSING'
    throw error
  }

  const key = getCacheKey(safeLimit)
  const now = Date.now()

  if (cache.key === key && now - cache.updatedAt < CACHE_TTL_MS) {
    return cache.posts
  }

  const endpoint = new URL(
    `https://graph.facebook.com/${getGraphVersion()}/${getPageId()}/feed`
  )

  endpoint.searchParams.set(
    'fields',
    'id,message,created_time,permalink_url,full_picture,attachments{media_type,media,url,subattachments{media_type,media,url}}'
  )

  endpoint.searchParams.set('limit', String(safeLimit))
  endpoint.searchParams.set('access_token', getAccessToken())
  const response = await fetch(endpoint)
  if (!response.ok) {
    const body = await response.text().catch(() => '')
console.error('Facebook API Error:', response.status)
const error = new Error(
  body || 'Unable to fetch Facebook posts.'
)
error.status = response.status
throw error
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