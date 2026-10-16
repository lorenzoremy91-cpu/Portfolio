/*
  SOURCE UNIQUE pour l'identité et les coordonnées du studio.

  Pourquoi ce fichier : l'adresse hello@cesure.studio était écrite en dur à
  quatre endroits, sur un domaine qui n'a jamais existé — tous les mails
  envoyés par des prospects revenaient en erreur, sans que rien ne le
  signale. Une donnée de contact ne doit exister qu'une fois.

  Toute coordonnée affichée sur le site DOIT venir d'ici.
*/

export const CONTACT = {
  email: 'lorenzoremy91@gmail.com',
  // Forme affichée (lisible) et forme technique (pour le lien tel:),
  // séparées : un lien tel: avec des espaces est ignoré par certains mobiles.
  phoneDisplay: '06 88 85 22 47',
  phoneHref: '+33688852247',
  city: 'Bures-sur-Yvette',
  region: 'Essonne',
  // Ce qui s'affiche dans le pied de page et sous le titre.
  location: 'Bures-sur-Yvette, Essonne',
}

export const mailto = `mailto:${CONTACT.email}`
export const telHref = `tel:${CONTACT.phoneHref}`

/*
  L'interlocuteur réel derrière le « nous » du studio. Le site parle au nom
  d'un studio, mais un client qui engage plusieurs milliers d'euros doit
  savoir précisément qui il aura en face de lui, du début à la fin.
*/
export const PRINCIPAL = {
  name: 'Lorenzo Remy',
  statement:
    'Un seul interlocuteur, Lorenzo Remy, du premier rendez-vous à la mise en ligne.',
}

/*
  Informations légales (LCEN art. 6-III et RGPD art. 13). Affichées sur
  /mentions-legales et /confidentialite.
*/
export const LEGAL = {
  editor: 'Lorenzo Remy',
  status: 'Entrepreneur individuel (EI)',
  address: '41 rue de Montjay, 91440 Bures-sur-Yvette',
  siret: '109 946 731 00014',
  publisher: 'Lorenzo Remy',
  host: {
    name: 'Vercel Inc.',
    // Relevée le 16/10/2026 sur vercel.com/legal/privacy-policy, où Vercel
    // écrit « Avenue » en toutes lettres. À revérifier si la page change.
    address: '440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis',
    url: 'https://vercel.com',
  },
}

export const SITE = {
  name: 'Studio Césure',
  // Domaine à accent : les navigateurs et les robots utilisent la forme
  // punycode. On garde la forme lisible pour l'affichage et la forme
  // technique pour les URL canoniques et le sitemap.
  domainDisplay: 'studio-césure.fr',
  origin: 'https://xn--studio-csure-ieb.fr',
}
