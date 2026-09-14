#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────
#  Prépare le site pour Hostinger.
#
#  À lancer après CHAQUE modification du code :
#      ./deploy-hostinger.sh
#
#  Il produit cesure-hostinger.zip, à décompresser dans public_html/.
#  (Une modification de CONTENU faite dans Sanity n'a pas besoin de ça :
#   elle apparaît toute seule, le site interroge le CMS en direct.)
# ─────────────────────────────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")"

# Node n'est pas dans le PATH par défaut de ce Mac ; on le pointe
# explicitement pour que le script marche depuis n'importe quel terminal.
export PATH="$HOME/.local/node/bin:$PATH"

if [ ! -f .env ]; then
  echo "ERREUR : fichier .env absent — le site serait construit sans"
  echo "l'identifiant Sanity et afficherait les projets de démonstration."
  exit 1
fi

echo "→ Construction du site…"
node node_modules/vite/bin/vite.js build

# Garde-fous : deux erreurs silencieuses qui ne se voient qu'une fois en ligne.
[ -f dist/.htaccess ] || { echo "ERREUR : .htaccess absent de dist/ — les pages projet renverraient 404"; exit 1; }

# L'identifiant est extrait PUIS contrôlé avant de servir de motif. La
# version précédente passait `grep -rq ""` quand .env avait la variable
# vide : le motif vide matche tout, le garde-fou validait donc en vert
# exactement le build sans CMS qu'il prétendait bloquer. L'ancrage ^ écarte
# aussi une ligne commentée résiduelle, et head -1 un doublon.
PID=$(grep -E '^VITE_SANITY_PROJECT_ID=' .env | head -1 | cut -d= -f2 | tr -d ' "'"'"'\r')
if [ -z "$PID" ]; then
  echo "ERREUR : VITE_SANITY_PROJECT_ID est vide dans .env."
  echo "Le site afficherait les projets de démonstration à la place du vrai portfolio."
  exit 1
fi
grep -rq "$PID" dist/assets/*.js \
  || { echo "ERREUR : identifiant Sanity ($PID) absent du build"; exit 1; }

echo "→ Création de l'archive…"
rm -f cesure-hostinger.zip
( cd dist && zip -qr ../cesure-hostinger.zip . -x '.DS_Store' )

echo ""
echo "✓ cesure-hostinger.zip prêt ($(du -h cesure-hostinger.zip | cut -f1))"
echo ""
echo "  1. hPanel > Gestionnaire de fichiers > public_html"
echo "  2. Videz le dossier (supprimez default.php / index.html d'origine)"
echo "  3. Envoyez cesure-hostinger.zip puis clic droit > Extraire"
echo "  4. Vérifiez que .htaccess est bien là (activez « fichiers cachés »)"
echo ""
echo "  RAPPEL — à faire UNE FOIS, avant la première mise en ligne :"
echo "  autoriser le domaine dans Sanity, sinon le site affichera trois"
echo "  projets de démonstration en se faisant passer pour le vrai portfolio."
echo "    cd studio && npx sanity cors add https://VOTRE-DOMAINE.fr --no-credentials"
echo "    cd studio && npx sanity cors add https://www.VOTRE-DOMAINE.fr --no-credentials"
echo ""
echo "  Recette : ouvrez le site, console ouverte. Si vous lisez"
echo "  « Sanity injoignable » ou « Projets (03) » avec Marguerite/Lumière/"
echo "  Interlude, l'autorisation CORS n'est pas passée."
