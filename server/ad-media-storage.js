import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import pg from 'pg'

const { Pool } = pg
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const localDir = path.join(__dirname, 'data', 'ad-media')

let pool = null
let initialized = false

function getPool() {
  if (!process.env.DATABASE_URL) return null
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
  }
  return pool
}

async function ensureDatabase() {
  const database = getPool()
  if (!database) return null
  if (!initialized) {
    await database.query(`
      CREATE TABLE IF NOT EXISTS advertisement_media (
        id UUID PRIMARY KEY,
        mime_type TEXT NOT NULL,
        data BYTEA NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
    initialized = true
  }
  return database
}

export async function saveAdMedia({ mimeType, data }) {
  const id = randomUUID()
  const database = await ensureDatabase()

  if (database) {
    await database.query(
      'INSERT INTO advertisement_media (id, mime_type, data) VALUES ($1, $2, $3)',
      [id, mimeType, data]
    )
    return { id, url: `/api/ads/media/${id}` }
  }

  await mkdir(localDir, { recursive: true })
  const ext = mimeType.split('/')[1]?.replace(/[^a-z0-9]/gi, '') || 'bin'
  await writeFile(path.join(localDir, `${id}.${ext}`), data)
  await writeFile(path.join(localDir, `${id}.json`), JSON.stringify({ mimeType, ext }), 'utf8')
  return { id, url: `/api/ads/media/${id}` }
}

export async function getAdMedia(id) {
  const database = await ensureDatabase()

  if (database) {
    const result = await database.query(
      'SELECT mime_type AS "mimeType", data FROM advertisement_media WHERE id = $1 LIMIT 1',
      [id]
    )
    if (!result.rows.length) return null
    return { mimeType: result.rows[0].mimeType, data: result.rows[0].data }
  }

  try {
    const meta = JSON.parse(await readFile(path.join(localDir, `${id}.json`), 'utf8'))
    const data = await readFile(path.join(localDir, `${id}.${meta.ext}`))
    return { mimeType: meta.mimeType, data }
  } catch {
    return null
  }
}
