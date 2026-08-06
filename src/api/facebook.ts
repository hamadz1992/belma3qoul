export interface FacebookPost {
  id: string
  message: string
  createdTime: string
  permalinkUrl: string
  imageUrl: string
}

interface FacebookResponse {
  source: string
  count: number
  posts: FacebookPost[]
}

export async function getFacebookPosts(limit = 4): Promise<FacebookPost[]> {
  const response = await fetch(`/api/facebook/posts?limit=${limit}`)

  if (!response.ok) {
    throw new Error("Failed to fetch Facebook posts")
  }

  const data: FacebookResponse = await response.json()

  return data.posts
}