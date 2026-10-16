/*
  ── LES ÉTUDES DE CAS VIVENT ICI, EN CODE ───────────────────────────────────

  Pourquoi pas dans Sanity : le site est un SPA Vite sans rendu serveur. Un
  contenu chargé depuis le CMS dans le navigateur arrive APRÈS le HTML. En le
  plaçant ici, il est compilé dans le bundle et la grille ne grandit plus
  après que ScrollTrigger a mesuré la page.

  Trois règles tenues dans tout ce fichier :

  1. AUCUNE INVENTION. Les faits proviennent des sites et maquettes
     eux-mêmes, ouverts et relus avant rédaction. Ce qui manque est un objet
     { todo: … } rendu en surbrillance à l'écran, jamais une valeur
     plausible qui passerait pour vraie.

  2. LE STATUT EST EXPLICITE ET VÉRIFIABLE. `status` vaut 'en-ligne' ou
     'maquette', et il est affiché sur la carte ET en tête de la page
     projet. Un seul projet est en ligne : Open The Door. Tous les autres
     sont des maquettes, et rien ne doit laisser croire le contraire.

  3. LA MISE EN PAGE N'EST PAS ICI. Le contenu dit le sens, le code décide
     du rendu.
*/

/* Marqueur d'information manquante : visible, jamais silencieux. */
export const todo = (text) => ({ todo: text })

export const PROJECTS = [
  // ───────────────────────────────────────────── 1. LE SEUL EN LIGNE ─────
  {
    slug: 'open-the-door',
    title: 'Open The Door',
    status: 'en-ligne',
    badge: "Serrurier d'urgence · Saint-Germain-en-Laye · 2026",
    projectType: 'Site vitrine une page + référencement local',
    year: 2026,
    sector: "Serrurerie d'urgence",
    place: 'Saint-Germain-en-Laye et Île-de-France',
    liveUrl: 'https://serrurieropendoor.fr',
    liveLabel: 'Voir le site en ligne',
    featured: true,
    summary:
      "Un site conçu pour une seule chose : faire décrocher le téléphone, à toute heure, depuis un écran de téléphone.",
    cover: {
      src: '/images/projets/open-the-door/desktop-accueil.webp',
      alt: "Page d'accueil du site Open The Door, serrurier d'urgence",
    },
    context: [
      "Open The Door est un serrurier d'urgence qui intervient à Saint-Germain-en-Laye et en Île-de-France, 24 heures sur 24.",
      "Dans ce métier, la personne qui cherche est devant une porte fermée, souvent la nuit, sur un téléphone, et elle est méfiante : le secteur traîne une réputation de devis qui doublent une fois le technicien sur place.",
      "L'objectif n'était donc pas de « présenter l'entreprise » mais de produire des appels, en levant la méfiance avant même la première sonnerie.",
    ],
    did: [
      "Cadrage autour d'une action unique : l'appel téléphonique",
      "Bouton d'appel présent en permanence, dans l'en-tête et à chaque section",
      'Mise en avant de la note et des avis Google authentiques du professionnel',
      'Tableau des interventions avec tarif annoncé avant tout déplacement',
      'Rédaction des contenus : prestations, déroulé en trois étapes, zone couverte',
      "Référencement local : données structurées Locksmith, FAQ, avis, horaires et 18 communes déclarées en zone d'intervention",
      'Polices auto-hébergées, sans appel à un service tiers',
      'robots.txt, sitemap.xml, adresse canonique et balises de partage',
    ],
    visuals: {
      desktop: [
        { src: '/images/projets/open-the-door/desktop-accueil.webp', alt: "Accueil : titre, bouton d'appel et note Google", caption: "Le numéro est atteignable sans défiler, de jour comme de nuit." },
        { src: '/images/projets/open-the-door/detail-process.webp', alt: 'Section « Comment ça se passe » en trois étapes', caption: "Le déroulé répond à la vraie question : combien, et quand ?" },
        { src: '/images/projets/open-the-door/detail-avis.webp', alt: 'Section des avis clients Google', caption: 'Les avis Google du professionnel, repris tels quels.' },
      ],
      mobile: [
        { src: '/images/projets/open-the-door/mobile-accueil.webp', alt: "Accueil du site sur téléphone, bouton d'appel visible" },
      ],
    },
    beforeAfter: [],
    deliverables: [
      'Site vitrine une page, livré en ligne et fonctionnel',
      'Rédaction complète des contenus',
      'Balisage de référencement local et données structurées',
      "Fiche d'interventions et zone géographique couverte",
    ],
    autonomy: [
      todo("Préciser ce que le client peut modifier seul : tarifs, zones, avis ? S'il n'y a pas d'interface d'administration, mieux vaut l'écrire franchement que le laisser deviner."),
    ],
    results: [
      todo("Nombre d'appels reçus depuis la mise en ligne — à relever auprès du client."),
      todo("Position dans Google sur « serrurier Saint-Germain-en-Laye » — à mesurer."),
      todo("Évolution du nombre d'avis Google depuis la livraison (9 au moment de la rédaction)."),
    ],
  },

  // ──────────────────────────────────────────────────── 2. MAQUETTE ──────
  {
    slug: 'beret-nettoyeur',
    title: 'Le Béret Nettoyeur',
    status: 'maquette',
    badge: 'Nettoyage professionnel · Paris, 92, 95 et 78 · 2026',
    projectType: 'Maquette complète — 14 pages',
    year: 2026,
    sector: 'Nettoyage et entretien de locaux professionnels',
    place: 'Paris, Hauts-de-Seine, Val-d’Oise et Yvelines',
    liveUrl: null,
    liveLabel: null,
    featured: false,
    summary:
      "Le passage d'une activité de nettoyage chez les particuliers à une offre B2B : quatorze pages, une par prestation, pensées pour être trouvées une par une.",
    cover: {
      src: '/images/projets/beret-nettoyeur/desktop-accueil.webp',
      alt: "Page d'accueil de la maquette Le Béret Nettoyeur",
    },
    context: [
      "Le Béret Nettoyeur est une entreprise de nettoyage qui se repositionne vers les locaux professionnels : bureaux, commerces, locaux d'activité et parties communes.",
      "Un donneur d'ordre professionnel ne cherche pas « une entreprise de nettoyage » : il cherche « lavage de vitres Versailles » ou « nettoyage fin de chantier ». Une page unique qui énumère tout n'est trouvable sur aucune de ces recherches.",
      "La maquette répond à ça par l'architecture : une page par prestation et par zone, chacune autonome, chacune capable de se classer seule.",
    ],
    did: [
      'Architecture de 14 pages : une par prestation, plus un blog et les pages légales',
      "Pages dédiées : lavage de vitres, entretien de locaux, fin de chantier, débarras, textiles et moquettes, terrasses et façades, remise en peinture",
      "Comparateur avant/après glissant, avec le lieu et la durée réelle de l'intervention",
      'Mise en avant de la note Google et des avis du professionnel',
      "Bandeau de réassurance : devis gratuit sous 24 h ouvrées, contrat sans engagement de durée, responsabilité civile professionnelle",
      'Trois articles de blog adossés aux prestations, pour le référencement de longue traîne',
      'Mentions légales et politique de confidentialité rédigées',
      'Construction sous Webflow, avec code personnalisé par page',
    ],
    visuals: {
      desktop: [
        { src: '/images/projets/beret-nettoyeur/desktop-accueil.webp', alt: "Accueil de la maquette : titre, réassurance et comparateur avant/après", caption: "L'accueil annonce la zone couverte dès le titre — c'est la première question d'un gestionnaire de site." },
        { src: '/images/projets/beret-nettoyeur/detail-avant-apres.webp', alt: 'Section « Avant / Après : nos interventions » avec des photos de chantiers réels', caption: "Des photos réelles, situées et datées — pas des images d'illustration." },
        { src: '/images/projets/beret-nettoyeur/detail-prestations.webp', alt: 'Section « Nos prestations pour les entreprises »', caption: 'Chaque prestation ouvre sur sa propre page : c\u2019est ce qui la rend trouvable seule.' },
        { src: '/images/projets/beret-nettoyeur/detail-zone.webp', alt: "Section « Notre zone d'intervention »", caption: "La zone couverte, commune par commune : la moitié du référencement local se joue là." },
        { src: '/images/projets/beret-nettoyeur/detail-devis.webp', alt: 'Section « Demandez votre devis gratuit »', caption: 'Le formulaire de devis, terminus de tout le parcours.' },
      ],
      mobile: [
        { src: '/images/projets/beret-nettoyeur/mobile-accueil.webp', alt: 'Accueil de la maquette sur téléphone' },
      ],
    },
    beforeAfter: [],
    deliverables: [
      'Maquette de 14 pages, navigables',
      'Rédaction des contenus de chaque prestation',
      'Trois articles de blog',
      'Mentions légales et politique de confidentialité',
    ],
    autonomy: [
      'Ajouter un article de blog depuis le gestionnaire de contenu',
      'Mettre à jour les prestations et la zone couverte',
    ],
    results: [
      "Maquette : les résultats se mesureront après une mise en ligne.",
    ],
  },

  // ──────────────────────────────────────────────────── 3. MAQUETTE ──────
  {
    slug: 'ile-o-crepes',
    title: "L'Île O' Crêpes",
    status: 'maquette',
    badge: 'Crêperie · Cinq adresses en Île-de-France · 2026',
    projectType: 'Maquette de refonte — site multi-établissements',
    year: 2026,
    sector: 'Restauration',
    /*
      CORRIGÉ. J'avais d'abord relevé ces communes par une recherche dans le
      HTML, et j'étais tombé sur une liste de villes voisines (référencement
      local), pas sur les restaurants. Les cinq adresses réelles sont lues
      sur la section « Nos escales » de la maquette elle-même.
    */
    place: 'Gif-sur-Yvette, Voisins-le-Bretonneux, Boulogne-Billancourt, Marcoussis et Igny',
    liveUrl: null,
    liveLabel: null,
    featured: false,
    summary:
      "Cinq restaurants sous une seule marque : une refonte qui laisse choisir son adresse sans jamais quitter l'univers de l'enseigne.",
    cover: {
      src: '/images/projets/ile-o-crepes/desktop-accueil.webp',
      alt: "Page d'accueil de la maquette L'Île O' Crêpes",
    },
    context: [
      "L'Île O' Crêpes est une crêperie implantée sur cinq adresses en Île-de-France : Gif-sur-Yvette, Voisins-le-Bretonneux, Boulogne-Billancourt, Marcoussis et Igny.",
      "Un site multi-établissements a un problème propre : le visiteur veut une adresse précise — horaires, terrasse, réservation — mais l'enseigne veut rester une seule marque et non cinq sites juxtaposés.",
      "La maquette tient les deux : un univers commun, et une page par restaurant accessible dès la navigation.",
    ],
    did: [
      'Refonte complète de la direction artistique autour de la carte et des produits',
      'Architecture multi-établissements : une page par restaurant, cinq adresses',
      "Mise en avant des deux actions qui comptent : réserver une table, commander en livraison",
      "Système éditorial reprenant le nom d'île de chaque recette comme fil conducteur",
      'Pages dédiées à la carte, au bar et aux réservations de groupes',
      "Bandeau de services : sur place, à emporter, livraison, terrasses et jardins, animaux acceptés",
      'Guide de styles livré avec la maquette, pour garder la cohérence après livraison',
    ],
    visuals: {
      desktop: [
        { src: '/images/projets/ile-o-crepes/desktop-accueil.webp', alt: "Accueil de la maquette L'Île O' Crêpes", caption: "Les deux actions utiles — réserver, commander — sont au même niveau, avant tout défilement." },
        { src: '/images/projets/ile-o-crepes/detail-coups-de-coeur.webp', alt: 'Section « Nos coups de cœur » présentant les recettes', caption: "Chaque recette porte un nom d'île : le fil conducteur de toute la carte." },
        { src: '/images/projets/ile-o-crepes/detail-adresses.webp', alt: 'Section « Cinq adresses en Île-de-France »', caption: 'Les cinq restaurants, chacun avec sa façade et son adresse.' },
        { src: '/images/projets/ile-o-crepes/detail-bar.webp', alt: 'Section consacrée au bar et aux rhums arrangés', caption: 'Le bar a sa propre entrée : une deuxième raison de venir.' },
        { src: '/images/projets/ile-o-crepes/detail-decor.webp', alt: 'Section « Un décor de vacances, toute l\u2019année »', caption: "La galerie installe l'ambiance que la carte seule ne raconte pas." },
      ],
      mobile: [
        { src: '/images/projets/ile-o-crepes/mobile-accueil.webp', alt: "Accueil de la maquette sur téléphone" },
      ],
    },
    beforeAfter: [],
    deliverables: [
      'Maquette de la page principale et des gabarits de rubrique',
      'Guide de styles : couleurs, typographie, composants',
      'Architecture multi-établissements pour les cinq adresses',
    ],
    autonomy: [
      'Mettre à jour la carte et les horaires de chaque adresse',
      'Publier une actualité ou un évènement',
    ],
    results: [
      "Maquette : les résultats se mesureront après une mise en ligne.",
    ],
  },

  // ──────────────────────────────────────────────────── 4. MAQUETTE ──────
  {
    slug: 'aurae-paris',
    title: 'Auraé Paris',
    status: 'maquette',
    badge: 'Cosmétique de luxe · Bilingue FR/EN · 2026',
    projectType: 'Maquette de site vitrine haut de gamme — développement sur mesure',
    year: 2026,
    sector: 'Cosmétique et parfumerie de luxe',
    place: 'Paris',
    liveUrl: null,
    liveLabel: null,
    featured: false,
    summary:
      "Un site en mode sombre natif, bilingue, développé sur mesure — l'exercice le plus technique du portfolio.",
    cover: {
      src: '/images/projets/aurae-paris/desktop-accueil.webp',
      alt: "Page d'accueil de la maquette Auraé Paris",
    },
    context: [
      "Auraé Paris est une marque de cosmétique haut de gamme dont la collection inaugurale se présente en trois formules.",
      "Le registre du luxe ne pardonne pas l'à-peu-près : une animation qui saute, un texte qui éblouit, une image qui arrive en retard, et la promesse de qualité tombe. La difficulté était donc d'exécution, pas de conception.",
      "Le site est construit en mode sombre natif, en français et en anglais, avec un parcours qui mène à une inscription en liste d'attente plutôt qu'à un paiement.",
    ],
    did: [
      'Développement sur mesure : Next.js 16, React 19, TypeScript en mode strict',
      'Mode sombre natif, avec deux règles tenues partout : jamais de noir pur sur les grandes surfaces, jamais de blanc pur en texte — le fond est un noir minéral, le texte un albâtre chaud',
      'Système de design complet : tous les jetons de couleur, de rythme et de tempo dans une source unique, aucune valeur arbitraire dans le balisage',
      "Hiérarchie des surfaces par la luminance et non par l'ombre portée, qui est invisible sur fond sombre",
      'Défilement inertiel et dé-zoom lié au défilement',
      "Parallaxe des bandes en CSS natif, exécutée hors du fil principal",
      'Images servies en AVIF et WebP, avec aperçus flous générés',
      'Bilingue français / anglais, et parcours jusqu’à l’inscription en liste d’attente',
    ],
    visuals: {
      /*
        Un seul visuel d'ordinateur, et ce n'est pas un oubli : la page monte
        ses panneaux à la demande et son hero se dé-zoome au défilement. Une
        capture automatique n'en voit donc que le premier écran, figé zoomé.
        Les sections basses demandent une capture manuelle.
      */
      desktop: [
        { src: '/images/projets/aurae-paris/desktop-accueil.webp', alt: "Page d'accueil de la maquette Auraé Paris, mode sombre", caption: "Le produit occupe l'écran ; l'interface se retire." },
      ],
      mobile: [
        { src: '/images/projets/aurae-paris/mobile-accueil.webp', alt: 'Auraé Paris sur téléphone' },
      ],
    },
    beforeAfter: [],
    deliverables: [
      'Maquette fonctionnelle, développée et navigable',
      'Système de design documenté',
      'Version française et version anglaise',
    ],
    autonomy: [
      todo("Préciser ce qui serait modifiable sans développeur sur ce projet. En l'état la couche de contenu est locale et typée, prête à basculer vers un CMS ou une API de boutique — à confirmer avant de l'annoncer."),
    ],
    results: [
      "Maquette : les résultats se mesureront après une mise en ligne.",
    ],
  },

  // ──────────────────────────────────────────────────── 5. MAQUETTE ──────
  {
    slug: 'maison-verane',
    title: 'Maison Vérane',
    status: 'maquette',
    badge: "Architecture d'intérieur · Projet personnel · 2026",
    projectType: 'Maquette — recherche de direction artistique',
    year: 2026,
    sector: "Architecture d'intérieur",
    place: 'Paris',
    liveUrl: null,
    liveLabel: null,
    featured: false,
    summary:
      "Une recherche personnelle : tenir une page d'accueil avec un titre, une image et deux lignes de texte.",
    cover: {
      src: '/images/projets/maison-verane/cover.webp',
      alt: "Page d'accueil de la maquette Maison Vérane",
    },
    context: [
      "Maison Vérane est un projet personnel, mené pour explorer une direction artistique éditoriale appliquée à un studio d'architecture d'intérieur.",
      "L'exercice consistait à tenir une page d'accueil avec presque rien — un titre en très grand, une seule image, deux lignes de texte — et à faire porter toute la crédibilité par la composition typographique.",
      "Il sert ici à montrer un registre : celui des marques qui vendent un savoir-faire haut de gamme et pour lesquelles la retenue vaut mieux que l'abondance.",
    ],
    did: [
      'Direction artistique complète : palette, typographie, grille',
      "Composition d'une page d'accueil tenue par le titre et une image unique",
      'Système de numérotation éditoriale et mentions de rubriques',
      "Mise en page pensée pour l'ordinateur et le téléphone",
    ],
    visuals: {
      desktop: [
        { src: '/images/projets/maison-verane/cover.webp', alt: "Page d'accueil de la maquette Maison Vérane", caption: "Le titre traverse l'écran ; l'image s'y superpose au lieu de l'illustrer." },
      ],
      mobile: [],
    },
    beforeAfter: [],
    deliverables: ['Direction artistique et maquette de la page principale'],
    autonomy: [],
    results: [
      "Projet personnel : pas de résultat commercial à mesurer. Il figure ici pour la direction artistique.",
    ],
  },
]

export const bySlug = (slug) => PROJECTS.find((p) => p.slug === slug) ?? null

/*
  Libellés d'état. « En ligne » est une affirmation vérifiable par le
  visiteur : elle n'est portée que par les projets qui ont réellement une
  adresse publique. Tout le reste est une maquette, et le dit.
*/
export const STATUS_LABEL = {
  'en-ligne': 'En ligne',
  maquette: 'Maquette',
}
