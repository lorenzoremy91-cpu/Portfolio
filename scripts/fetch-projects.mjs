/**
 * Récupère les projets depuis Sanity au moment du build et les écrit dans
 * src/data/projects.json, que Vite embarque dans le bundle.
 *
 * Pourquoi au build et non dans le navigateur : le site est un SPA Vite sans
 * SSR. Un chargement asynchrone ferait grandir la page APRÈS que ScrollTrigger
 * a mesuré sa hauteur — les animations au scroll se décaleraient. En résolvant
 * le contenu au build, le coût runtime reste nul.
 *
 * Le script ne fait jamais échouer le build : sans variables d'environnement,
 * ou si Sanity est injoignable, il retombe sur src/data/projects.fallback.json.
 */
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(root, 'src/data/projects.json')
const FALLBACK = resolve(root, 'src/data/projects.fallback.json')

const PROJECT_ID = process.env.SANITY_PROJECT_ID
const DATASET = process.env.SANITY_DATASET || 'production'
const API_VERSION = '2026-02-01'

const QUERY = `*[_type == "project" && !(_id in path("drafts.**"))] | order(orderRank) {
  _id, title, category, year, url, mediaType, videoUrl, format, emphasis, alignment,
  "imageUrl": image.asset->url,
  "lqip": image.asset->metadata.lqip,
  "aspectRatio": image.asset->metadata.dimensions.aspectRatio
}`

function useFallback(reason) {
  console.warn(`[projets] ${reason} — utilisation du contenu de secours.`)
  const data = existsSync(FALLBACK) ? readFileSync(FALLBACK, 'utf8') : '[]'
  writeFileSync(OUT, data)
  process.exit(0)
}

if (!PROJECT_ID) {
  useFallback('SANITY_PROJECT_ID absent')
}

const endpoint =
  `https://${PROJECT_ID}.apicdn.sanity.io/v${API_VERSION}/data/query/${DATASET}` +
  `?query=${encodeURIComponent(QUERY)}`

try {
  const res = await fetch(endpoint, { headers: { Accept: 'application/json' } })
  if (!res.ok) useFallback(`Sanity a répondu ${res.status}`)

  const { result } = await res.json()
  if (!Array.isArray(result) || result.length === 0) {
    useFallback('aucun projet publié dans Sanity')
  }

  // Les images passent par le CDN Sanity, redimensionnées et converties au vol.
  const projects = result.map((p) => ({
    ...p,
    imageUrl: p.imageUrl ? `${p.imageUrl}?w=1600&q=80&auto=format` : null,
  }))

  writeFileSync(OUT, JSON.stringify(projects, null, 2))
  console.log(`[projets] ${projects.length} projet(s) récupéré(s) depuis Sanity.`)
} catch (err) {
  useFallback(`échec de la requête Sanity (${err.message})`)
}
