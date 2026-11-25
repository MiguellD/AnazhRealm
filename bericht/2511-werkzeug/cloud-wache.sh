#!/bin/bash
# cloud-wache.sh <zweig> [<zweig> …] — wartet, bis EINER der Zweige einen NEUEN Kopf mit Betreff „Vorprüfung …“ trägt.
# Cloud-Sitzungen melden sich nie; ihr Zweig ist die einzige Nachricht. Bei Ankunft fährt die Wache die zwei
# Ankunfts-Prüfungen (merge-tree gegen main, probe-tag) und druckt den Stempel-Satz — dann endet sie (EIN Ereignis je Lauf).
# Gesehene Köpfe stehen in wache-gesehen.txt; ein WIP-Kopf wird gemerkt und übergangen.
set -u
cd /c/Users/micha/AnazhRealm-profiband || exit 2
export MSYS_NO_PATHCONV=1
N="C:/Users/micha/AppData/Local/Temp/claude/9fd86081514dce1c/9c27a074-223e-48c0-a5af-60ae0385359b/scratchpad"
G="$N/wache-gesehen.txt"
touch "$G"
ENDE=$(( $(date +%s) + ${WACHE_S:-20000} ))
while [ "$(date +%s)" -lt "$ENDE" ]; do
    LISTE=$(git ls-remote origin $(for Z in "$@"; do printf 'refs/heads/%s ' "$Z"; done) 2>/dev/null)
    for Z in "$@"; do
        H=$(echo "$LISTE" | grep -E "refs/heads/$Z\$" | cut -f1)
        [ -n "$H" ] || continue
        grep -q "^$Z $H\$" "$G" && continue
        git fetch -q origin "$Z" 2>/dev/null || continue
        B=$(git log -1 --format=%s "$H" 2>/dev/null)
        echo "$Z $H" >> "$G"
        case "$B" in
        "Vorprüfung "*)
            echo "ANKUNFT $(date '+%H:%M') $Z $H"
            echo "  $B" | cut -c1-330
            git fetch -q origin main
            M=$(git merge-tree --write-tree origin/main "$H" 2>&1 | wc -l)
            echo "  merge-tree gegen main $(git rev-parse --short=8 origin/main): $M Zeile(n) (1 = sauber)"
            echo "  main Vorfahr: $(git merge-base --is-ancestor origin/main "$H" && echo ja || echo NEIN)"
            echo "  $(sh artifacts/profiband/werkzeug/zug.sh probe-tag "$Z@$H" 2>&1 | tail -1 | cut -c1-220)"
            echo "  Satz: $(git show "$H:cloud-post/$Z-satz.txt" 2>/dev/null | head -2 | cut -c1-330)"
            echo "  Bericht: $(git show "$H:cloud-post/$Z.md" 2>/dev/null | wc -l) Zeilen · Dateien gegen main: $(git diff --stat origin/main..."$H" 2>/dev/null | tail -1)"
            exit 0
            ;;
        esac
    done
    sleep 240
done
echo "WACHE ZEIT UM $(date '+%H:%M')"
