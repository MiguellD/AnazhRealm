#!/bin/bash
# Heil-Kopf n+1 per Plumbing: der Baum des alten Kopfs, zusammengeführt mit origin/main, plus ersetzte Dateien — EIN glatter
# Commit auf origin/main, Autor des alten Kopfs bleibt. Kein Checkout, kein Schub.
# Aufruf: kopf-n.sh <alter-kopf40> <msg-datei> <pfad>=<quell-datei> [...]   → druckt „KOPF <sha40>“ und den Diff gegen den Merge-Baum
set -e
export MSYS_NO_PATHCONV=1
cd C:/Users/micha/AnazhRealm-profiband
ALT=$1; MSG=$2; shift 2
git fetch -q origin main
MAIN=$(git rev-parse origin/main)
MT=$(git merge-tree --write-tree "$MAIN" "$ALT" | head -n 1)
[ ${#MT} = 40 ] || { echo "merge-tree ohne Baum: $MT"; exit 3; }
IDX=$(mktemp); rm -f "$IDX"
export GIT_INDEX_FILE="$IDX"
git read-tree "$MT"
for paar in "$@"; do
    p=${paar%%=*}; q=${paar#*=}
    [ -f "$q" ] || { echo "Quelle fehlt: $q"; exit 4; }
    modus=$(git ls-tree "$MT" -- "$p" | awk '{print $1}'); [ -n "$modus" ] || modus=100644
    b=$(git hash-object -w "$q")
    git update-index --add --cacheinfo "$modus,$b,$p"
done
T=$(git write-tree)
unset GIT_INDEX_FILE; rm -f "$IDX"
export GIT_AUTHOR_NAME="$(git log -1 --format=%an "$ALT")" GIT_AUTHOR_EMAIL="$(git log -1 --format=%ae "$ALT")" GIT_AUTHOR_DATE="$(git log -1 --format=%aI "$ALT")"
K=$(git commit-tree "$T" -p "$MAIN" -F "$MSG")
echo "KOPF $K (auf main ${MAIN:0:8}, Merge-Baum ${MT:0:8})"
echo "-- Diff Merge-Baum → Kopf:"; git diff --stat "$MT" "$K" | cut -c1-140
echo "-- Diff main → Kopf:"; git diff --stat "$MAIN" "$K" | tail -n 1
