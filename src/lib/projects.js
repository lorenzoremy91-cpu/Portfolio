import { client, sanityEnabled, urlFor } from './sanity'

/*
  ── LA MISE EN PAGE VIT ICI, PAS DANS LE CMS ────────────────────────────
  Le tableau d'origine stockait `ratio: 'aspect-[4/3]'` et
  `span: 'md:col-span-7'` par projet. Mettre ça dans Sanity obligerait à
  choisir une classe Tailwind dans un formulaire, et un futur changement de
  design imposerait de ré-éditer chaque projet un par un.

  À la place, le CMS ne dit que le SENS (« ce projet est mis en avant ») et
  la composition éditoriale est dérivée ici, à partir de la position dans la
  liste. Le rythme se répète toutes les quatre cartes : large à gauche,
  étroite décalée vers le bas, large à droite, étroite centrée. N'importe
  quel nombre de projets reste composé, et changer la composition de tout le
  site est une modification à un seul endroit.
*/
const RHYTHM = [
  { span: 'md:col-span-7', ratio: 'aspect-[4/3]' },
  { span: 'md:col-span-5 md:mt-32', ratio: 'aspect-[4/5]' },
  { span: 'md:col-span-7 md:col-start-6', ratio: 'aspect-[16/9]' },
  { span: 'md:col-span-5 md:col-start-2 md:mt-16', ratio: 'aspect-[3/4]' },
]

const FEATURED_LAYOUT = { span: 'md:col-span-12', ratio: 'aspect-[21/9]' }

export function layoutFor(index, featured) {
  return featured ? FEATURED_LAYOUT : RHYTHM[index % RHYTHM.length]
}

/*
  Il n'y a délibérément PLUS de table CATEGORY_LABELS ici. Le champ
  « Discipline » du CMS est passé en texte libre, et une table de
  correspondance y devient un piège : elle réécrirait en silence trois
  valeurs particulières (taper « design » aurait affiché « Design &
  Direction Artistique »). Ce que l'éditeur écrit est ce qui s'affiche.
*/

/*
  Données de repli : ce que le site affiche tant que Sanity n'est pas
  branché — et le filet de sécurité si l'API est injoignable au chargement.
  Un portfolio qui affiche une grille vide parce qu'un CMS a hoqueté est
  pire qu'un portfolio sans CMS.
*/
export const FALLBACK_PROJECTS = [
  {
    _id: 'fallback-marguerite',
    title: 'Marguerite',
    slug: 'marguerite',
    client: 'Projet interne',
    category: 'Direction artistique',
    year: 2026,
    summary:
      "L'étude de mouvement qui a donné naissance à l'identité du studio.",
    coverUrl: null,
    coverVideoUrl: '/videos/daisy.mp4',
    coverAlt: 'Marguerite en gros plan',
    featured: false,
  },
  {
    _id: 'fallback-lumiere',
    title: 'Lumière',
    slug: 'lumiere',
    client: 'Projet interne',
    category: 'Direction artistique',
    year: 2025,
    summary: 'Une recherche sur la lumière comme matière première du design.',
    coverUrl: '/images/lumiere.jpg',
    coverVideoUrl: null,
    coverAlt: 'Étude de lumière',
    featured: false,
  },
  {
    _id: 'fallback-interlude',
    title: 'Interlude',
    slug: 'interlude',
    client: 'Projet interne',
    category: 'Développement web',
    year: 2025,
    summary: 'Une expérience web construite autour du silence et du rythme.',
    coverUrl: '/images/interlude.jpg',
    coverVideoUrl: null,
    coverAlt: 'Interface Interlude',
    featured: false,
  },
]

// Champs communs aux deux requêtes — une seule définition à maintenir.
const CARD_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  client,
  category,
  year,
  summary,
  featured,
  "coverAlt": cover.alt,
  cover,
  "coverVideoUrl": coverVideo.asset->url
`

const LIST_QUERY = `*[_type == "project" && defined(slug.current)]
  | order(coalesce(order, 999) asc, year desc) { ${CARD_FIELDS} }`

const ONE_QUERY = `*[_type == "project" && slug.current == $slug][0]{
  ${CARD_FIELDS},
  liveUrl,
  roles,
  results,
  body,
  gallery
}`

function withCoverUrl(doc) {
  if (!doc) return doc
  return { ...doc, coverUrl: doc.cover ? urlFor(doc.cover, { width: 1400 }) : doc.coverUrl ?? null }
}

export async function fetchProjects() {
  if (!sanityEnabled) return FALLBACK_PROJECTS
  try {
    const docs = await client.fetch(LIST_QUERY)
    // Un dataset vide (Sanity branché mais aucun projet publié) ne doit pas
    // afficher une section « Projets (00) » — on garde le repli.
    if (!docs || docs.length === 0) return FALLBACK_PROJECTS
    return docs.map(withCoverUrl)
  } catch (err) {
    console.warn('[Césure] Sanity injoignable, repli sur les projets locaux.', err)
    return FALLBACK_PROJECTS
  }
}

export async function fetchProject(slug) {
  if (!sanityEnabled) {
    return FALLBACK_PROJECTS.find((p) => p.slug === slug) ?? null
  }
  try {
    const doc = await client.fetch(ONE_QUERY, { slug })
    return doc ? withCoverUrl(doc) : (FALLBACK_PROJECTS.find((p) => p.slug === slug) ?? null)
  } catch (err) {
    console.warn('[Césure] Sanity injoignable pour ce projet.', err)
    return FALLBACK_PROJECTS.find((p) => p.slug === slug) ?? null
  }
}
