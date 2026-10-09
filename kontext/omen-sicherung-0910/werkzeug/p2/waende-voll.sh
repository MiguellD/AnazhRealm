#!/bin/bash
# Die Wände des Werkplatzes seriell über JEDEN berührten CI-Schritt (Kaskaden-Ziele, Vortiefe, Szenen-Tiefe von Wasser und
# March), je Schritt der Exit-Code (nie hinter einer Pipe). Ports 7900/7905–7909 (7901–7904 tragen die save-server).
cd /c/Users/micha/Desktop/AnazhRealm-OMEN/host-vram
P2=/c/Users/micha/Desktop/AnazhRealm-OMEN/p2
LOG=$P2/waende-voll.log
: > $LOG
schritt() {
    local name=$1; shift
    local t0=$(date +%s)
    "$@" > $P2/wand-$name.txt 2>&1
    local ec=$?
    echo "$(date +%T) SCHRITT $name EXIT=$ec ($(( $(date +%s) - t0 )) s)" | tee -a $LOG
}
echo "$(date +%T) START $(git log -1 --format=%h) $(git status --short | wc -l) geaendert" | tee -a $LOG
schritt format npm run format:check
schritt lint npm run lint
schritt check npm run check
schritt profiband npm run gate:profiband
schritt page-error env PAGE_ERROR_PORT=7905 npm run gate:page-error
schritt fenster-wechsel env FENSTER_PORT=7906 npm run gate:fenster-wechsel
schritt feld-stellvertreter env STELLV_PORT=7907 npm run gate:feld-stellvertreter
schritt schatten-takt env SCHATTEN_PORT=7908 npm run gate:schatten-takt
schritt schatten-werfer env SCHATTEN_WERFER_PORT=7909 npm run gate:schatten-werfer
schritt fluss env FLUSS_PORT=7900 npm run gate:fluss
schritt godray env GODRAY_PORT=7905 npm run gate:godray
schritt luft-sicht env LUFT_PORT=7906 npm run gate:luft-sicht
schritt himmel-tag env HIMMEL_PORT=7907 npm run gate:himmel-tag
schritt gpu-lens env IDLE_GPU_CHURN_PORT=7908 npm run gpu-lens
schritt analog-nah env ANALOG_NAH_PORT=7909 npm run gate:analog-nah
schritt post-kette env POST_KETTE_PORT=7900 npm run gate:post-kette
schritt ziel-zensus env ZIEL_ZENSUS_PORT=7905 npm run gate:ziel-zensus
schritt kamera-treue env KAMERA_TREUE_PORT=7906 npm run gate:kamera-treue
schritt look-lens env LOOK_PHYSICS_PORT=7907 npm run look-lens
schritt look-golden env LOOK_GOLDEN_PORT=7908 npm run look-golden
schritt playtest-fast env FAST_PORT=7909 npm run playtest:fast
# der volle Playtest startet seinen EIGENEN save-server fest auf :4312 — nur, solange keine Messung läuft und :4312 frei ist
schritt playtest npm run playtest
echo "$(date +%T) WAENDE ENDE" | tee -a $LOG
