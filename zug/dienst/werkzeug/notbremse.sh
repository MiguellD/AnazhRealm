#!/bin/bash
# NOTBREMSE (Schöpfer 12.10.: „bei 98 % Nutzung alles sichern, alle Agenten stoppen und für einen anderen Agenten perfektionieren“).
# Sichert JEDEN Worktree mit Änderungen als WIP-Commit und pusht ihn auf seinen Branch, nur verfolgte Dateien (git add -u);
# unverfolgte Dateien werden NUR gelistet (x-*/tmp-* nie committen). Detached Worktrees (Auge, Prüf-Kopien) werden übersprungen.
# Vorher: alle Workflows per TaskStop anhalten (ein laufender Agent schreibt sonst weiter). Danach: UEBERGABE schreiben (notbremse.md).
# Aufruf: bash notbremse.sh [--trocken]
R=/c/Users/micha/AnazhRealm-profiband
TROCKEN=0; [ "$1" = "--trocken" ] && TROCKEN=1
STEMPEL=$(date +%Y-%m-%d_%H%M)
git -C "$R" worktree list --porcelain | awk '/^worktree /{w=$2} /^branch /{print w"\t"$2} /^detached/{print w"\tDETACHED"}' | while IFS=$'\t' read -r W B; do
  [ "$B" = "DETACHED" ] && { echo "SKIP  $W (detached)"; continue; }
  BR=${B#refs/heads/}
  GEAEND=$(git -C "$W" status --porcelain --untracked-files=no | wc -l)
  UNVERF=$(git -C "$W" status --porcelain | grep -c '^??')
  KOPF=$(git -C "$W" rev-parse --short HEAD)
  if [ "$GEAEND" -gt 0 ]; then
    if [ $TROCKEN -eq 1 ]; then echo "WÜRDE $BR @ $KOPF: $GEAEND geänderte Dateien sichern ($UNVERF unverfolgt)"; continue; fi
    git -C "$W" add -u && git -C "$W" commit -q -m "WIP Notbremse $STEMPEL: $BR - ungeprüfter Zwischenstand beim Wochenlimit [skip ci]" -m "Gesichert vom Koordinator (notbremse.sh). Nächster Schritt: siehe koordination UEBERGABE-$STEMPEL.md." -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" \
      && git -C "$W" push -q origin "HEAD:$BR" && echo "WIP   $BR @ $(git -C "$W" rev-parse --short HEAD) ($GEAEND Dateien, $UNVERF unverfolgt)" || echo "FEHLER $BR in $W"
  else
    echo "SAUBER $BR @ $KOPF ($UNVERF unverfolgt)"
  fi
done
