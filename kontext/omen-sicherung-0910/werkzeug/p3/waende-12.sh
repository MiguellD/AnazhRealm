#!/bin/bash
# Wände für 0710-4 Klasse 1+2 (Masse aus EINER Quelle, Biss durch STOSS) — seriell, je Exit-Code, Ports 7900–7909.
cd /c/Users/micha/Desktop/AnazhRealm-OMEN/welle-m-impuls
P3=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3
LOG=$P3/waende-12.log
: > $LOG
schritt() {
    local name=$1; shift
    local t0=$(date +%s)
    "$@" > $P3/w12-$name.txt 2>&1
    local ec=$?
    echo "$(date +%T) SCHRITT $name EXIT=$ec ($(( $(date +%s) - t0 )) s)" | tee -a $LOG
}
echo "$(date +%T) START $(git log -1 --format=%h) $(git status --short | wc -l) geaendert" | tee -a $LOG
schritt check npm run check
schritt lint npm run lint
schritt format npm run format:check
schritt kampf-gefuehl env KAMPF_GEFUEHL_PORT=7905 npm run gate:kampf-gefuehl
schritt fahr-leben env FAHR_LEBEN_PORT=7906 npm run gate:fahr-leben
schritt vehicle-drive env DRIVE_PORT=7907 npm run gate:vehicle-drive
schritt vehicle-contract npm run gate:vehicle-contract
schritt schmiede-contract npm run gate:schmiede-contract
schritt asset-contract env CONTRACT_PORT=7908 npm run gate:asset-contract
schritt daten-contract npm run gate:daten-contract
schritt ofen-contract npm run gate:ofen-contract
schritt tier-separation env TIER_SEPARATION_PORT=7909 npm run gate:tier-separation
schritt kreatur-leben npm run gate:kreatur-leben
schritt koerper-kern npm run gate:koerper-kern
schritt tier-anatomie npm run gate:tier-anatomie
schritt playtest-fast npm run playtest:fast
echo "$(date +%T) ENDE" | tee -a $LOG
