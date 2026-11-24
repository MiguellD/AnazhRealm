#!/bin/bash
# bash vorfahrt-waechter.sh [stunden=3] — DIE VORFAHRT DES ZUGS als Wächter dieser Sitzung (kein Dienst, nichts installiert):
# alle 45 s liest er die GitHub-Schlange (ci/schlange.cjs). Wartet ein Code-Check an integ-probe (der Zug-Kandidat) oder an w28-*
# (ein Stempel) in ZWEI Blicken in Folge auf einen Läufer, bricht er jede andere Batterie ab, die fast ganz wartet
# (wartet ≥ 8, läuft ≤ 4), und merkt sie sich; wartet kein Vorfahrt-Job mehr, stößt er die gemerkten in ihrer Reihenfolge neu an
# (rerun-failed-jobs: nur die abgebrochenen Jobs). Je Lauf höchstens 3 Abbrüche — danach bleibt er stehen (kein Verhungern).
# Jede Handlung ist EINE Zeile auf stdout (Zeit · Tat · Lauf · Zweig).
S="C:/Users/micha/AppData/Local/Temp/claude/9fd86081514dce1c/020b359f-6bff-4326-a9cc-a8805834c858/scratchpad"
cd /c/Users/micha/AnazhRealm-profiband || exit 2
export MSYS_NO_PATHCONV=1
ENDE=$(($(date +%s) + ${1:-3} * 3600))
declare -A MAL
GEMERKT=""
VOR=0
while [ "$(date +%s)" -lt "$ENDE" ]; do
    L=$(node "$S/ci/schlange.cjs" 2>/dev/null | grep 'Code-Check')
    if [ -z "$L" ]; then sleep 45; continue; fi
    P=$(echo "$L" | grep ' integ-probe \| w28-' | grep -v 'wartet 0 ')
    if [ -n "$P" ]; then
        VOR=$((VOR + 1))
        if [ "$VOR" -ge 2 ]; then
            while read -r zeile; do
                [ -z "$zeile" ] && continue
                id=$(echo "$zeile" | awk '{print $1}')
                zw=$(echo "$zeile" | awk '{print $3}')
                lf=$(echo "$zeile" | sed -n 's/.*läuft \([0-9]*\) .*/\1/p')
                wt=$(echo "$zeile" | sed -n 's/.*wartet \([0-9]*\) .*/\1/p')
                case "$zw" in integ-probe | w28-*) continue ;; esac
                [ "${wt:-0}" -ge 8 ] && [ "${lf:-99}" -le 4 ] || continue
                [ "${MAL[$id]:-0}" -ge 3 ] && continue
                node "$S/ci/abbruch.cjs" "$id" >/dev/null 2>&1
                MAL[$id]=$((${MAL[$id]:-0} + 1))
                case " $GEMERKT " in *" $id "*) ;; *) GEMERKT="$GEMERKT $id" ;; esac
                echo "$(date '+%H:%M:%S') ABBRUCH $id $zw (läuft $lf · wartet $wt · Abbruch ${MAL[$id]}) — Vorfahrt für: $(echo "$P" | awk '{print $3}' | tr '\n' ' ')"
            done <<<"$L"
        fi
    else
        VOR=0
        if [ -n "$GEMERKT" ]; then
            for id in $GEMERKT; do
                r=$(node "$S/neulauf.cjs" "$id" 2>&1 | tail -1 | cut -c1-60)
                echo "$(date '+%H:%M:%S') NEULAUF $id → $r"
            done
            GEMERKT=""
        fi
    fi
    sleep 45
done
echo "$(date '+%H:%M:%S') ENDE des Wächters (gemerkt, nicht neu angestoßen: ${GEMERKT:-nichts})"
