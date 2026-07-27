import { existsSync, readFileSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT_PATH = join(ROOT, 'public', 'steam-screenshots.json')
const ENV_PATH = join(ROOT, '.env')

function loadEnvFile(path) {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = value
  }
}

loadEnvFile(ENV_PATH)

const API_KEY = process.env.STEAM_API_KEY
const VANITY = process.env.STEAM_VANITY || 'horsse'
const PAGE_SIZE = 100

if (!API_KEY) {
  console.error('STEAM_API_KEY is required (set in .env or environment)')
  process.exit(1)
}

function steamUrl(path, params) {
  const url = new URL(`https://api.steampowered.com${path}`)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value))
  }
  return url
}

async function steamGet(path, params) {
  const url = steamUrl(path, { key: API_KEY, ...params })
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`${path} failed: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

async function resolveSteamId(vanity) {
  const data = await steamGet('/ISteamUser/ResolveVanityURL/v1/', {
    vanityurl: vanity,
  })
  const steamid = data?.response?.steamid
  if (!steamid || data.response.success !== 1) {
    throw new Error(`Could not resolve vanity "${vanity}"`)
  }
  return steamid
}

function extractUrl(file) {
  // file_url is full-res; preview_url is a tiny thumb (~10KB)
  return file.file_url || file.preview_url || file.url || ''
}

function toScreenshot(file) {
  const raw = extractUrl(file)
  if (typeof raw !== 'string' || !raw.startsWith('http')) return null

  const url = raw.split('?')[0]
  // Screenshots store captions in short_description; title is almost always empty
  const caption = (
    (typeof file.short_description === 'string' && file.short_description) ||
    (typeof file.title === 'string' && file.title) ||
    ''
  ).trim()
  const game = typeof file.app_name === 'string' ? file.app_name.trim() : ''
  const created = Number(file.time_created)
  const year =
    Number.isFinite(created) && created > 0
      ? new Date(created * 1000).getUTCFullYear()
      : null

  const id = String(file.publishedfileid ?? '').trim()

  return {
    id,
    url,
    caption,
    game,
    year,
  }
}

async function fetchScreenshots(steamid) {
  const byUrl = new Map()
  let page = 1

  for (;;) {
    const data = await steamGet('/IPublishedFileService/GetUserFiles/v1/', {
      steamid,
      filetype: 4,
      numperpage: PAGE_SIZE,
      page,
      return_previews: true,
    })

    const response = data?.response ?? {}
    const files = response.publishedfiledetails ?? response.files ?? []

    for (const file of files) {
      const shot = toScreenshot(file)
      if (shot) byUrl.set(shot.url, shot)
    }

    const total = Number(response.total ?? 0)
    const got = page * PAGE_SIZE
    if (files.length === 0 || (total > 0 && got >= total) || files.length < PAGE_SIZE) {
      break
    }
    page += 1
  }

  return [...byUrl.values()]
}

const steamid = await resolveSteamId(VANITY)
console.log(`Resolved ${VANITY} → ${steamid}`)

const screenshots = await fetchScreenshots(steamid)
console.log(`Collected ${screenshots.length} screenshots`)

await mkdir(dirname(OUT_PATH), { recursive: true })
await writeFile(
  OUT_PATH,
  `${JSON.stringify({ screenshots }, null, 2)}\n`,
  'utf8',
)
console.log(`Wrote ${OUT_PATH}`)
