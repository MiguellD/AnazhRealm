#!/bin/bash
# Wände für 0710-5 (der Stoß des Leibs im Sim-Schritt, der Playtest-Check auf opts.stoss) — seriell, je Exit-Code,
# Ports 7900–7909; danach der volle Playtest (sein eigener Server).
cd /c/Users/micha/Desktop/AnazhRealm-OMEN/welle-m-impuls
P3=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3
LOG=$P3/waende-05.log
: > $LOG
schritt() {
    local name=$1; shift
    local t0=$(date +%s)
    "$@" > $P3/w05-$name.txt 2>&1
    local ec=$?
    echo "$(date +%T) SCHRITT $name EXIT=$ec ($(( $(date +%s) - t0 )) s)" | tee -a $LOG
}
echo "$(date +%T) START $(git log -1 --format=%h) $(git status --short | wc -l) geaendert" | tee -a $LOG
schritt fahr-leben env FAHR_LEBEN_PORT=7906 npm run gate:fahr-leben
schritt vehicle-drive env DRIVE_PORT=7907 npm run gate:vehicle-drive
schritt vehicle-contract npm run gate:vehicle-contract
schritt schmiede-contract npm run gate:schmiede-contract
schritt asset-contract env CONTRACT_PORT=7908 npm run gate:asset-contract
schritt daten-contract npm run gate:daten-contract
schritt ofen-contract npm run gate:ofen-contract
schritt kreatur-leben npm run gate:kreatur-leben
schritt koerper-kern npm run gate:koerper-kern
schritt tier-anatomie npm run gate:tier-anatomie
schritt playtest-fast env FAST_PORT=7909 npm run playtest:fast
schritt playtest npm run playtest
echo "$(date +%T) ENDE" | tee -a $LOG
