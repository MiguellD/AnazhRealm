#!/bin/bash
# Die Wände des Werkplatzes seriell, je Schritt der Exit-Code (nie hinter einer Pipe).
cd /c/Users/micha/Desktop/AnazhRealm-OMEN/host-vram
LOG=/c/Users/micha/Desktop/AnazhRealm-OMEN/p2/waende.log
: > $LOG
schritt() {
    local name=$1; shift
    local t0=$(date +%s)
    "$@" > /c/Users/micha/Desktop/AnazhRealm-OMEN/p2/wand-$name.txt 2>&1
    local ec=$?
    echo "$(date +%T) SCHRITT $name EXIT=$ec ($(( $(date +%s) - t0 )) s)" | tee -a $LOG
}
schritt format npm run format:check
schritt lint npm run lint
schritt check npm run check
schritt schatten-werfer env SCHATTEN_WERFER_PORT=7906 npm run gate:schatten-werfer
schritt ziel-zensus env ZIEL_ZENSUS_PORT=7905 npm run gate:ziel-zensus
schritt post-kette env POST_KETTE_PORT=7907 npm run gate:post-kette
schritt kamera-treue env KAMERA_TREUE_PORT=7908 npm run gate:kamera-treue
schritt playtest-fast env FAST_PORT=7909 npm run playtest:fast
# der volle Playtest startet seinen EIGENEN save-server fest auf :4312 — nur, solange keine Messung läuft und :4312 frei ist
schritt playtest npm run playtest
powershell -NoProfile -c "Get-NetTCPConnection -LocalPort 4312 -State Listen -ErrorAction SilentlyContinue | % { Stop-Process -Id \$_.OwningProcess -Force }" > /dev/null 2>&1
echo "$(date +%T) WAENDE ENDE" | tee -a $LOG
