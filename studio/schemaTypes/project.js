import { defineField, defineType } from 'sanity'

/*
  Un projet client.

  PRINCIPE DIRECTEUR : ce document ne contient QUE du sens, jamais de mise
  en page. Pas de `aspect-[4/3]`, pas de `md:col-span-7` — la chorégraphie
  de la grille éditoriale est dérivée par le front-end à partir de la
  position et du drapeau `featured`. Sinon il faudrait choisir une classe
  Tailwind dans un formulaire, et le jour où le design change il faudrait
  ré-éditer chaque projet.
*/
export default defineType({
  name: 'project',
  title: 'Projet',
  type: 'document',
  groups: [
    { name: 'card', title: 'Carte', default: true },
    { name: 'study', title: 'Étude de cas' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Titre du projet',
      type: 'string',
      group: 'card',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Adresse de la page',
      type: 'slug',
      group: 'card',
      description: "Génère l'URL : /projets/mon-projet. Clique sur « Generate ».",
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'string',
      group: 'card',
      description: "Le nom de la marque ou de la personne.",
    }),
    defineField({
      name: 'category',
      title: 'Discipline',
      type: 'string',
      group: 'card',
      /*
        Texte libre, volontairement. C'était une liste fermée de trois
        valeurs ; chaque nouveau type de mission aurait demandé une
        modification du schéma et un redéploiement du studio.

        Conséquence côté site : ce que tu écris ici s'affiche TEL QUEL sur
        la carte et sur la page projet. Il n'y a plus aucune table de
        correspondance — elle est supprimée exprès, car avec un champ libre
        elle réécrirait en silence trois mots magiques (« design » serait
        devenu « Design & Direction Artistique »).

        Écris donc la formulation exacte que tu veux voir, majuscules
        comprises. Ex : « Direction artistique », « Identité visuelle »,
        « Site vitrine ».
      */
      description:
        "S'affiche tel quel sur le site. Ex : Direction artistique, Identité visuelle, Site e-commerce.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'year',
      title: 'Année',
      type: 'number',
      group: 'card',
      validation: (r) => r.min(2000).max(2100),
    }),
    defineField({
      name: 'liveUrl',
      title: 'Site en ligne',
      type: 'url',
      group: 'card',
      description: "L'adresse du site du client. Affichée en bas de l'étude de cas.",
    }),
    defineField({
      name: 'cover',
      title: 'Visuel de couverture',
      type: 'image',
      group: 'card',
      /*
        hotspot : tu choisis le point important de l'image. Les cartes de la
        grille ont des ratios différents (portrait, paysage) — sans hotspot,
        un recadrage automatique coupe souvent au mauvais endroit.
      */
      options: { hotspot: true },
      validation: (r) => r.required(),
      fields: [
        defineField({
          name: 'alt',
          title: 'Description (accessibilité)',
          type: 'string',
          description: "Ce que montre l'image, pour les lecteurs d'écran et le référencement.",
        }),
      ],
    }),
    defineField({
      name: 'coverVideo',
      title: 'Vidéo de couverture (optionnel)',
      type: 'file',
      group: 'card',
      description:
        "Un court enregistrement du site en action. S'il est présent, il remplace l'image sur la carte. MP4, idéalement moins de 3 Mo.",
      options: { accept: 'video/mp4' },
    }),
    defineField({
      name: 'summary',
      title: 'Résumé',
      type: 'text',
      rows: 2,
      group: 'card',
      description:
        "Une phrase. Sert de chapeau à l'étude de cas et de description pour Google et les réseaux sociaux.",
      validation: (r) => r.max(200),
    }),
    defineField({
      name: 'featured',
      title: 'Mettre en avant',
      type: 'boolean',
      group: 'card',
      initialValue: false,
      description:
        "Le projet occupe une place plus large dans la grille. Sémantique, pas une classe CSS : le code décide de la traduction visuelle.",
    }),
    defineField({
      name: 'order',
      title: "Ordre d'affichage",
      type: 'number',
      group: 'card',
      description: 'Petit nombre = affiché en premier. Laisse vide pour classer par année.',
    }),

    defineField({
      name: 'roles',
      title: 'Notre rôle',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'study',
      description: "Ce que le studio a fait. Ex : Direction artistique, Développement front-end.",
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'body',
      title: "Le récit du projet",
      type: 'blockContent',
      group: 'study',
      description: "Le contexte, le problème, ce que tu as fait, le résultat.",
    }),
    defineField({
      name: 'gallery',
      title: 'Galerie',
      type: 'array',
      group: 'study',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Description', type: 'string' }),
            defineField({ name: 'caption', title: 'Légende', type: 'string' }),
          ],
        },
      ],
    }),
    defineField({
      name: 'results',
      title: 'Résultats',
      type: 'array',
      group: 'study',
      description: "Des chiffres concrets. Ex : « Temps de chargement » / « 0,8 s ».",
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Intitulé', type: 'string' }),
            defineField({ name: 'value', title: 'Valeur', type: 'string' }),
          ],
          preview: {
            select: { title: 'value', subtitle: 'label' },
          },
        },
      ],
    }),
  ],

  orderings: [
    {
      title: "Ordre d'affichage",
      name: 'displayOrder',
      by: [
        { field: 'order', direction: 'asc' },
        { field: 'year', direction: 'desc' },
      ],
    },
  ],

  preview: {
    select: { title: 'title', client: 'client', year: 'year', media: 'cover' },
    prepare({ title, client, year, media }) {
      return {
        title,
        subtitle: [client, year].filter(Boolean).join(' — '),
        media,
      }
    },
  },
})
