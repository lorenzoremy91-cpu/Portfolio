/*
  CommonJS volontaire, et ce dossier n'a PAS de "type": "module" — c'est
  la structure standard d'un studio Sanity v3 : le paquet `sanity/cli`
  n'est publié qu'en CommonJS (package.json exports → "require" seulement),
  donc un fichier lu comme module ES échoue à l'import. La CLI ne cherche
  par ailleurs que sanity.cli.js ou .ts, jamais .cjs.

  L'ID est écrit en dur car la CLI lit cette config AVANT de charger .env.
  Aucun secret : un projectId Sanity est public, il voyage dans le bundle.
*/
const { defineCliConfig } = require('sanity/cli')

module.exports = defineCliConfig({
  api: {
    projectId: 'ycj8nmxr',
    dataset: 'production',
  },
  // Sans cette valeur, `deploy` pose une question et bloque en non-interactif.
  studioHost: 'studio-cesure',
})
