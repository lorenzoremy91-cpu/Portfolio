/*
  ── LES ÉTUDES DE CAS VIVENT ICI, EN CODE ───────────────────────────────────

  Pourquoi pas dans Sanity : le site est un SPA Vite sans rendu serveur. Un
  contenu chargé depuis le CMS dans le navigateur arrive APRÈS le HTML, donc
  Google reçoit une page vide — c'est exactement ce que mesurait le site en
  ligne avant cette refonte : 2 041 octets, zéro texte visible. En plaçant le
  contenu ici, il est compilé dans le HTML et devient indexable, sans aucun
  coût réseau à l'affichage.

  Trois règles tenues dans tout ce fichier :

  1. AUCUNE INVENTION. Pas un client, pas un témoignage, pas un chiffre qui
     ne soit pas vérifiable. Les faits sur Open The Door proviennent du site
     livré lui-même, relu avant rédaction. Tout ce qui manque est un objet
     { todo: … } rendu en surbrillance à l'écran, jamais une valeur
     plausible qui passerait pour vraie.

  2. LE STATUT EST EXPLICITE. `kind` vaut 'client', 'proposition' ou
     'concept', et la page l'affiche toujours. Une proposition non retenue ne
     doit jamais pouvoir se lire comme une référence acquise.

  3. LA MISE EN PAGE N'EST PAS ICI. Comme pour la grille, le contenu dit le
     sens, le code décide du rendu.
*/

/* Marqueur d'information manquante : visible, jamais silencieux. */
export const todo = (text) => ({ todo: text })

export const PROJECTS = [
  // ───────────────────────────────────────────────────────────────────────
  {
    slug: 'club-omnisports-les-ulis',
    title: 'Club Omnisports des Ulis',
    kind: 'proposition',
    /*
      Libellé imposé par le commanditaire pressenti, au mot près. Le Club
      n'est PAS un client : c'est une maquette proposée, et rien dans cette
      page ne doit laisser entendre le contraire.
    */
    badge: 'Proposition de refonte · Club Omnisports des Ulis · 2026',
    projectType: 'Refonte complète — maquette cliquable',
    year: 2026,
    sector: 'Association sportive',
    place: 'Les Ulis, Essonne',
    liveUrl: 'https://maquette-cou-ulis.netlify.app',
    liveLabel: 'Parcourir la maquette',
    featured: true,
    summary:
      "Une maquette cliquable de cinq pages pour rendre lisible, depuis un téléphone, une association de 27 sections et 20 lieux de pratique.",
    cover: {
      src: '/images/projets/cou-ulis/apres-accueil.webp',
      alt: "Page d'accueil de la maquette proposée pour le Club Omnisports des Ulis",
    },
    context: [
      "Le Club Omnisports des Ulis est une association créée en 1977 : 27 sections, 20 lieux de pratique, une Maison Sport-Santé, et ses 50 ans en 2027.",
      "Son site actuel est riche — le contenu existe et il est sérieux — mais il est difficile à parcourir, en particulier depuis un téléphone, qui est pourtant l'écran d'un parent qui cherche un créneau un soir de semaine.",
      "L'enjeu n'était donc pas d'ajouter de l'information, mais de rendre franchissable celle qui est déjà là : permettre à une famille de passer de « je cherche un sport » à « je sais où, quand et comment inscrire mon enfant » sans jamais se perdre.",
    ],
    did: [
      "Cadrage du parcours réel d'une famille, de la recherche à l'inscription",
      "Direction artistique dérivée du logo existant du club, sans le réinventer",
      "Maquette cliquable de 5 pages : accueil, « Trouver mon sport », fiche Basketball, « S'inscrire », « Le club »",
      "Filtres combinables par âge, envie, jour et lieu",
      "Planning qui allume les créneaux correspondant à l'année de naissance saisie",
      "Dossier d'inscription à cocher, qui mémorise les pièces déjà réunies",
      "Frise historique de 1977 à 2027, préparée pour les 50 ans du club",
      "Conception pensée d'abord pour le téléphone, puis élargie à l'ordinateur",
      "Contrastes vérifiés et corps de texte porté à 17 px pour la lisibilité",
    ],
    visuals: {
      desktop: [
        { src: '/images/projets/cou-ulis/apres-accueil.webp', alt: "Page d'accueil : entrée directe vers la recherche de sport", caption: "L'accueil pose une seule question : quel sport, pour qui ?" },
        { src: '/images/projets/cou-ulis/apres-catalogue.webp', alt: 'Page « Trouver mon sport » avec ses filtres par âge, envie, jour et lieu', caption: 'Les filtres se combinent : un enfant de 8 ans, le mercredi, près de chez soi.' },
        { src: '/images/projets/cou-ulis/apres-fiche.webp', alt: 'Fiche Basketball : créneaux, lieux et conditions', caption: 'La fiche d’une section répond aux questions dans l’ordre où elles se posent.' },
        { src: '/images/projets/cou-ulis/apres-inscription.webp', alt: "Page « S'inscrire » avec le dossier à cocher", caption: 'Le dossier retient ce qui est déjà prêt : on peut le quitter et y revenir.' },
        { src: '/images/projets/cou-ulis/apres-club.webp', alt: 'Page « Le club » et sa frise de 1977 à 2027', caption: 'La frise installe les 50 ans du club comme un repère, pas comme une archive.' },
      ],
      mobile: [
        { src: '/images/projets/cou-ulis/apres-m-accueil.webp', alt: "Accueil sur téléphone" },
        { src: '/images/projets/cou-ulis/apres-m-catalogue.webp', alt: 'Recherche de sport sur téléphone' },
        { src: '/images/projets/cou-ulis/apres-m-fiche.webp', alt: 'Fiche Basketball sur téléphone' },
        { src: '/images/projets/cou-ulis/apres-m-inscription.webp', alt: 'Dossier d’inscription sur téléphone' },
      ],
    },
    /*
      Légendes NEUTRES, c'est une demande explicite : on montre une
      proposition, on ne dénigre pas le travail existant. Les deux paires
      comparent des pages équivalentes, pas une page choisie pour flatter.
    */
    beforeAfter: [
      {
        label: 'La fiche d’une section',
        before: { src: '/images/projets/cou-ulis/avant-fiche.webp', alt: 'Page Basketball du site actuel' },
        after: { src: '/images/projets/cou-ulis/apres-fiche.webp', alt: 'Fiche Basketball proposée' },
        note: "Mêmes informations, hiérarchisées par ordre d'usage : quel âge, quel créneau, quel lieu, puis comment s'inscrire.",
      },
      {
        label: 'Trouver un sport',
        before: { src: '/images/projets/cou-ulis/avant-catalogue.webp', alt: 'Page « Sports selon l’âge » du site actuel' },
        after: { src: '/images/projets/cou-ulis/apres-catalogue.webp', alt: 'Page « Trouver mon sport » proposée' },
        note: 'Le choix par âge devient un filtre combinable avec le jour et le lieu.',
      },
      {
        label: 'Sur téléphone',
        before: { src: '/images/projets/cou-ulis/avant-m-fiche.webp', alt: 'Page Basketball actuelle sur téléphone' },
        after: { src: '/images/projets/cou-ulis/apres-m-fiche.webp', alt: 'Fiche Basketball proposée sur téléphone' },
        note: "C'est l'écran sur lequel un parent cherche un créneau un soir de semaine.",
      },
    ],
    deliverables: [
      'Maquette cliquable en ligne, parcourable sans installation',
      'Les 5 pages dessinées dans leurs états ordinateur et téléphone',
      'Direction artistique dérivée du logo du club',
      'Les composants réutilisables pour les 27 sections',
    ],
    autonomy: [
      "Ajouter ou modifier une section sans toucher à la mise en page",
      "Mettre à jour les créneaux d'un planning depuis une interface",
      'Publier une actualité ou un document pour les familles',
    ],
    results: [
      todo("Cette maquette est une proposition : aucun résultat ne peut être mesuré tant qu'elle n'est pas en service. Les chiffres viendront après la mise en ligne."),
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  {
    slug: 'open-the-door',
    title: 'Open The Door',
    kind: 'client',
    badge: 'Client · Open The Door · 2026',
    projectType: 'Site vitrine une page + référencement local',
    year: 2026,
    sector: "Serrurerie d'urgence",
    place: 'Saint-Germain-en-Laye et Île-de-France',
    liveUrl: 'https://serrurieropendoor.fr',
    liveLabel: 'Voir le site en ligne',
    featured: false,
    summary:
      "Un site vitrine conçu pour une seule chose : faire décrocher le téléphone, à toute heure, depuis un écran de téléphone.",
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
      "Mise en avant de la note et des avis Google authentiques du professionnel",
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
      "Rédaction complète des contenus",
      'Balisage de référencement local et données structurées',
      "Fiche d'interventions et zone géographique couverte",
    ],
    autonomy: [
      todo("Préciser ce que le client peut modifier seul sur ce site : tarifs, zones, avis ? S'il n'y a pas d'interface d'administration, il vaut mieux l'écrire franchement que de le laisser deviner."),
    ],
    results: [
      todo("Nombre d'appels reçus depuis la mise en ligne — à relever auprès du client."),
      todo("Position dans les résultats Google sur « serrurier Saint-Germain-en-Laye » — à mesurer."),
      todo("Évolution du nombre d'avis Google depuis la livraison (9 au moment de la rédaction)."),
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  {
    slug: 'maison-verane',
    title: 'Maison Vérane',
    kind: 'concept',
    badge: 'Projet personnel · Concept · 2026',
    projectType: 'Concept de site vitrine — direction artistique',
    year: 2026,
    sector: "Architecture d'intérieur (concept)",
    place: 'Paris',
    liveUrl: null,
    liveLabel: null,
    featured: false,
    summary:
      "Un concept éditorial pour un studio d'architecture d'intérieur : typographie monumentale, or et crème, image unique.",
    cover: {
      src: '/images/projets/maison-verane/cover.webp',
      alt: "Page d'accueil du concept Maison Vérane",
    },
    context: [
      "Maison Vérane n'est pas un client : c'est un projet personnel, un concept mené pour explorer une direction artistique éditoriale appliquée à un studio d'architecture d'intérieur.",
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
        { src: '/images/projets/maison-verane/cover.webp', alt: "Page d'accueil du concept Maison Vérane", caption: "Le titre traverse l'écran ; l'image s'y superpose au lieu de l'illustrer." },
      ],
      mobile: [],
    },
    beforeAfter: [],
    deliverables: [
      'Direction artistique et maquette de la page principale',
    ],
    autonomy: [],
    results: [
      todo("Projet personnel : il n'a pas de résultat commercial à mesurer. S'il doit rester au portfolio, c'est pour la direction artistique."),
    ],
  },
]

export const bySlug = (slug) => PROJECTS.find((p) => p.slug === slug) ?? null

/* Libellés d'état, affichés tels quels sur la carte et sur la page projet. */
export const KIND_LABEL = {
  client: 'Client',
  proposition: 'Proposition',
  concept: 'Projet personnel',
}
