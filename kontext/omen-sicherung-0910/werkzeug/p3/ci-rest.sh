#!/bin/bash
# Die CI-Schritte 74–86 des playtest-Jobs, die 37675959470 (7f97d339) wegen des 45-min-Job-Deckels nie erreichte — seriell.
cd /c/Users/micha/Desktop/AnazhRealm-OMEN/welle-m-fahren
P3=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3
LOG=$P3/ci-rest.log
: > $LOG
schritt() {
    local name=$1; shift
    local t0=$(date +%s)
    "$@" > $P3/rest-$name.txt 2>&1
    local ec=$?
    echo "$(date +%T) SCHRITT $name EXIT=$ec ($(( $(date +%s) - t0 )) s)" | tee -a $LOG
}
echo "$(date +%T) START $(git log -1 --format=%h) $(git status --short | wc -l) geaendert" | tee -a $LOG
schritt ofen-contract npm run gate:ofen-contract
schritt klang-zensus env KLANG_ZENSUS_PORT=7900 npm run gate:klang-zensus
schritt rezept-katalog env REZEPT_KATALOG_PORT=7905 npm run gate:rezept-katalog
schritt portal-gestalt env PORTAL_GESTALT_PORT=7906 npm run gate:portal-gestalt
schritt foundry-crossfade env CROSSFADE_PORT=7907 npm run gate:foundry-crossfade
schritt v1-pfad npm run gate:v1-pfad
schritt gpu-fehler env GPU_FEHLER_PORT=7908 npm run gate:gpu-fehler
schritt playtest-fast npm run playtest:fast
schritt gpu-lens env IDLE_GPU_CHURN_PORT=7909 npm run gpu-lens
schritt analog-nah env ANALOG_NAH_PORT=7900 npm run gate:analog-nah
schritt post-kette env POST_KETTE_PORT=7905 npm run gate:post-kette
schritt look-lens env LOOK_PHYSICS_PORT=7906 npm run look-lens
schritt look-golden env LOOK_GOLDEN_PORT=7907 npm run look-golden
echo "$(date +%T) ENDE" | tee -a $LOG
