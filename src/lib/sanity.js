import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'

/*
  Connexion Sanity — optionnelle par construction.

  Tant que VITE_SANITY_PROJECT_ID n'est pas renseigné, `client` vaut null :
  aucune requête réseau n'est tentée et tout le site retombe sur les données
  locales (voir projects.js). Le portfolio fonctionne donc identiquement
  avant et après le branchement du CMS — c'est ce qui permet de livrer
  aujourd'hui sans attendre la création du projet Sanity.
*/
const projectId = import.meta.env.VITE_SANITY_PROJECT_ID
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production'

export const sanityEnabled = Boolean(projectId)

export const client = sanityEnabled
  ? createClient({
      projectId,
      dataset,
      // Date figée : l'API Sanity garantit qu'une version datée ne changera
      // jamais de comportement, donc une mise à jour de leur côté ne peut
      // pas casser le site sans qu'on l'ait décidé.
      apiVersion: '2024-10-01',
      // CDN : réponses mises en cache, largement suffisant pour un
      // portfolio et bien plus rapide que l'API brute.
      useCdn: true,
    })
  : null

// Named export: the default export is deprecated upstream.
const builder = client ? createImageUrlBuilder(client) : null

/*
  Construit une URL d'image dimensionnée à la demande. Sanity redimensionne
  et convertit au format optimal (WebP/AVIF) côté serveur : on ne télécharge
  jamais l'original de 4 Mo pour l'afficher dans une vignette.
*/
export function urlFor(source, { width = 1200, height } = {}) {
  if (!builder || !source) return null
  let img = builder.image(source).width(width).auto('format').fit('crop')
  if (height) img = img.height(height)
  return img.url()
}
