#!/bin/bash
# ordnung-remote.sh <inventur|weg> — Zweige auf origin, deren Kopf ganz in origin/main oder origin/koordination liegt (die Arbeit lebt
# in deren Historie). Geschützt: die Stamm- und Mess-Zweige, die laufenden Züge, der Zweig des Haupt-Checkouts.
R=/c/Users/micha/AnazhRealm-profiband
OUT="$TEMP/claude/ordnung"
mkdir -p "$OUT"
SCHUTZ='^(main|integ-probe|integ-zug|koordination|punkte-maschine|heim-z31|heim-z32|claude/profi-band-pflanzen|gh-pages)$'
if [ "$1" = "inventur" ]; then
  git -C "$R" fetch -q --prune origin '+refs/heads/*:refs/remotes/origin/*'
  : > "$OUT/remote-weg.txt"; : > "$OUT/remote-bleibt.txt"
  git -C "$R" for-each-ref --format='%(objectname) %(refname:lstrip=3) %(committerdate:short)' refs/remotes/origin/ | while read -r k b d; do
    [ "$b" = "HEAD" ] && continue
    if echo "$b" | grep -Eq "$SCHUTZ"; then echo "SCHUTZ $b" >> "$OUT/remote-bleibt.txt"; continue; fi
    if git -C "$R" merge-base --is-ancestor "$k" origin/main 2>/dev/null; then echo "in-main $b $d" >> "$OUT/remote-weg.txt"
    elif git -C "$R" merge-base --is-ancestor "$k" origin/koordination 2>/dev/null; then echo "in-koordination $b $d" >> "$OUT/remote-weg.txt"
    else echo "offen $b $d $(git -C "$R" rev-list --count origin/main.."$k" 2>/dev/null)" >> "$OUT/remote-bleibt.txt"; fi
  done
  echo "remote weg: $(wc -l < "$OUT/remote-weg.txt") · bleibt: $(wc -l < "$OUT/remote-bleibt.txt")"; cut -d' ' -f1 "$OUT/remote-weg.txt" | sort | uniq -c
elif [ "$1" = "weg" ]; then
  cut -d' ' -f2 "$OUT/remote-weg.txt" > "$OUT/remote-weg-namen.txt"
  n=0
  while mapfile -t -n 40 teil && [ ${#teil[@]} -gt 0 ]; do
    git -C "$R" push -q origin --delete "${teil[@]}" 2>>"$OUT/remote-fehler.txt" && n=$((n + ${#teil[@]}))
  done < "$OUT/remote-weg-namen.txt"
  echo "remote gelöscht: $n · übrig: $(git -C "$R" ls-remote origin 'refs/heads/*' | wc -l)"
fi
