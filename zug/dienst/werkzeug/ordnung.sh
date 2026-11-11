#!/bin/bash
# ordnung.sh <inventur|weg> — Worktrees und lokale Zweige ordnen: weg kommt nur, was sauber ist UND dessen Kopf in origin/main oder
# origin/koordination liegt oder auf origin unter seinem Namen steht (die Arbeit lebt in der Git-Historie bzw. auf origin).
R=/c/Users/micha/AnazhRealm-profiband
OUT="$TEMP/claude/ordnung"
mkdir -p "$OUT"
SCHUTZ='/(koordination|koord-zeile|decke-pruef|heim-z31|heim-z32|siedlung-k5-erstes-haus|mensch-k3-gruen)$'
git -C "$R" fetch -q origin +refs/heads/main:refs/remotes/origin/main +refs/heads/koordination:refs/remotes/origin/koordination
git -C "$R" ls-remote origin 'refs/heads/*' | sed 's#refs/heads/##' > "$OUT/remote.txt"
if [ "$1" = "inventur" ]; then
  : > "$OUT/weg.txt"; : > "$OUT/bleibt.txt"
  git -C "$R" worktree list --porcelain | sed -n 's/^worktree //p' | while read -r wt; do
    case "$wt" in "$R"|C:/Users/micha/AnazhRealm-profiband|*/AnazhRealm-integ|*/AnazhRealm-zug|*/AnazhRealm-zug2) continue ;; esac
    if echo "$wt" | grep -Eq "$SCHUTZ"; then echo "SCHUTZ  $wt" >> "$OUT/bleibt.txt"; continue; fi
    [ -d "$wt" ] || { echo "FEHLT   $wt" >> "$OUT/weg.txt"; continue; }
    kopf=$(git -C "$wt" rev-parse HEAD 2>/dev/null) || { echo "KAPUTT  $wt" >> "$OUT/bleibt.txt"; continue; }
    zweig=$(git -C "$wt" symbolic-ref --short -q HEAD)
    if [ -n "$(git -C "$wt" status --porcelain --untracked-files=normal 2>/dev/null | head -1)" ]; then
      echo "DRECKIG $wt ${zweig:-detached} $(git -C "$wt" status --porcelain | wc -l) Dateien" >> "$OUT/bleibt.txt"; continue
    fi
    if git -C "$R" merge-base --is-ancestor "$kopf" origin/main 2>/dev/null; then grund="in-main"
    elif git -C "$R" merge-base --is-ancestor "$kopf" origin/koordination 2>/dev/null; then grund="in-koordination"
    elif [ -n "$zweig" ] && grep -q "^$kopf	$zweig$" "$OUT/remote.txt"; then grund="auf-origin"
    elif grep -q "^$kopf	" "$OUT/remote.txt"; then grund="auf-origin($(grep -m1 "^$kopf	" "$OUT/remote.txt" | cut -f2))"
    else echo "UNGEPUSHT $wt ${zweig:-detached} ${kopf:0:8}" >> "$OUT/bleibt.txt"; continue; fi
    echo "$grund $wt ${zweig:-detached}" >> "$OUT/weg.txt"
  done
  echo "weg: $(wc -l < "$OUT/weg.txt") · bleibt: $(wc -l < "$OUT/bleibt.txt")"; cut -d' ' -f1 "$OUT/weg.txt" | sed 's/(.*//' | sort | uniq -c; cut -d' ' -f1 "$OUT/bleibt.txt" | sort | uniq -c
elif [ "$1" = "weg" ]; then
  n=0; f=0
  while read -r grund wt zweig; do
    if [ "$grund" = "FEHLT" ]; then continue; fi
    if git -C "$R" worktree remove "$wt" 2>>"$OUT/fehler.txt"; then n=$((n+1)); else f=$((f+1)); fi
  done < "$OUT/weg.txt"
  git -C "$R" worktree prune
  echo "Worktrees entfernt: $n · verweigert: $f (fehler.txt)"
  # lokale Zweige ohne Worktree: weg, wenn in main/koordination oder gleich ihrem origin-Zwilling
  m=0
  for b in $(git -C "$R" for-each-ref --format='%(refname:short)' refs/heads/); do
    git -C "$R" worktree list --porcelain | grep -q "^branch refs/heads/$b$" && continue
    k=$(git -C "$R" rev-parse "refs/heads/$b")
    if git -C "$R" merge-base --is-ancestor "$k" origin/main || git -C "$R" merge-base --is-ancestor "$k" origin/koordination || grep -q "^$k	$b$" "$OUT/remote.txt"; then
      git -C "$R" branch -D -q "$b" && m=$((m+1))
    fi
  done
  echo "lokale Zweige entfernt: $m · übrig: $(git -C "$R" branch | wc -l)"
fi
