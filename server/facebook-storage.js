import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_FILE = path.join(__dirname, 'facebook-data.json')

const DEFAULT_DATA = {
  connected: false,
  pageId: '',
  pageName: '',
  pageAccessToken: '',
  userAccessToken: '',
  connectedAt: '',
  expiresAt: '',
}

export async function loadFacebookData() {
  try {
    const content = await readFile(DATA_FILE, 'utf8')
    return {
      ...DEFAULT_DATA,
      ...JSON.parse(content),
    }
  } catch {
    return DEFAULT_DATA
  }
}

export async function saveFacebookData(data) {
  console.log('Saving Facebook data...')

  const current = await loadFacebookData()

  const updated = {
    ...current,
    ...data,
  }

  console.log('Facebook data saved successfully:', {
  connected: updated.connected,
  pageId: updated.pageId,
  pageName: updated.pageName,
  hasPageAccessToken: Boolean(updated.pageAccessToken),
  hasUserAccessToken: Boolean(updated.userAccessToken),
  connectedAt: updated.connectedAt,
})

  await writeFile(
    DATA_FILE,
    JSON.stringify(updated, null, 2),
    'utf8'
  )

  console.log('Facebook data saved to:', DATA_FILE)

  return updated
}