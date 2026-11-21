#!/bin/bash
# abliefern.sh <quell-ordner> — legt jede Datei des Ordners als bericht/2111-heap-register/<name> auf origin/koordination (Plumbing, kein Checkout)
set -e
Q="$1"; cd /c/Users/micha/AnazhRealm-altlast
export GIT_INDEX_FILE=$(mktemp -u)
for versuch in 1 2 3; do
  git fetch -q origin koordination
  basis=$(git rev-parse origin/koordination)
  git read-tree "$basis"
  for d in "$Q"/*; do
    b=$(git hash-object -w "$d")
    git update-index --add --cacheinfo 100644,$b,"bericht/2111-heap-register/$(basename "$d")"
  done
  baum=$(git write-tree)
  c=$(printf 'Bericht heap-register: Halter-Tafel, Messung vorher und nachher, Bildpaar, URTEIL\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\n' | git -c user.name=MiguellD -c user.email=87209049+MiguellD@users.noreply.github.com commit-tree "$baum" -p "$basis")
  if git push -q origin "$c:refs/heads/koordination"; then echo "ABGELIEFERT $c"; rm -f "$GIT_INDEX_FILE"; exit 0; fi
done
echo "PUSH GESCHEITERT"; exit 1
