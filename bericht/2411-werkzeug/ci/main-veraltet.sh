#!/bin/bash
# bash main-veraltet.sh [stunden=2] — bricht jede Code-Check-Batterie an einem ÜBERHOLTEN main-Kopf ab (EINE Zeile je Tat).
# GRUND (gemessen 24.11. 10:59): jede Landung stößt eine volle Batterie (22 Jobs) am main-Kopf an — die Nachwache der Landung. Nach der
# NÄCHSTEN Landung deckt die neue Batterie die alte mit ab, die alte bindet aber bis zu 12 der 20 Läufer (z710 f18576b6 lief 62 min im
# vierten Versuch, während Zug und drei Stempel warteten). Die Batterie am AKTUELLEN main-Kopf bleibt unberührt.
# Reihenfolge im Takt: ERST die Schlange lesen, DANN main — landet der Zug dazwischen, fällt nur die alte Batterie, nie die neue.
S="C:/Users/micha/AppData/Local/Temp/claude/9fd86081514dce1c/020b359f-6bff-4326-a9cc-a8805834c858/scratchpad"
cd /c/Users/micha/AnazhRealm-profiband || exit 2
export MSYS_NO_PATHCONV=1
ENDE=$(($(date +%s) + ${1:-2} * 3600))
while [ "$(date +%s)" -lt "$ENDE" ]; do
    L=$(node "$S/ci/schlange.cjs" 2>/dev/null | awk '$2=="Code-Check" && $3=="main" {print $1, $4}')
    M=$(git ls-remote origin refs/heads/main | cut -c1-8)
    if [ -n "$L" ] && [ "${#M}" -eq 8 ]; then
        while read -r id k; do
            [ -z "$id" ] && continue
            [ "$k" = "$M" ] && continue
            r=$(node "$S/ci/abbruch.cjs" "$id" 2>&1 | tail -1 | cut -c1-40)
            echo "$(date '+%H:%M:%S') VERALTET $id main $k (main steht bei $M) → $r"
        done <<<"$L"
    fi
    sleep 90
done
echo "$(date '+%H:%M:%S') ENDE main-veraltet"
