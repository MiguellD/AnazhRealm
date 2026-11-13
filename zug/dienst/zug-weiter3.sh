#!/bin/bash
# unter sh.exe neu (Grund und Zahlen: zug-dienst.sh „UNTER sh.exe", 13.11.) — als sh gerufen schaltet die Zeile nur POSIX ab
case "$BASH" in */sh | */sh.exe) set +o posix ;; *) [ -x /usr/bin/sh ] && exec /usr/bin/sh "$0" "$@" ;; esac
# zug-weiter.sh <zid> — der Zug, den ein WACKLER abschoss, fährt weiter statt neu (Schöpfer 07.11.: „nach vorn“, Wackler blockieren nicht).
# Wartet auf das Urteil von fahre (/tmp/claude/fahre-<zid>.log). GELANDET → schreibt „[<zid>w] GELANDET“.
# FAHRT ROT → liest die roten Schritte des Laufs (letzter Versuch je Job). Sind ALLE rot nur an benannten Wackel-Wänden
# (ohne Bezug zu den Zweigen), fährt GitHub nur die gefallenen Jobs neu (bis 3×), danach zug.sh landen (echt grün, ff, ABAB-Regel).
# Sonst „[<zid>w] FAHRT ROT <schritte>“. Die nächste Schlange wartet auf <zid>w.
Z="$1"; L=/tmp/claude/fahre-$Z.log; O=/tmp/claude/fahre-${Z}w.log
R=MiguellD/AnazhRealm
# Volle-Bühne-Prädikat (10.11. 23:45, gemessen auf der GTX 1050 je frischer Lauf): main 4e2df19b 1 von 2 rot, Kandidat a2826f12 1 von 2
# rot — in den roten Läufen liefert die Foundry nichts (BIBLIOTHEK warm false, LIEFERUNG 0 von 6). Wackler mit Neulauf, bis der Halter
# beim Namen steht (Auftrag foundry-halter der GTX 1050); danach fällt die Zeile wieder.
WACKEL='Stand-Takt|Fenster-Wand|Fahr-Linse des Lebens|Kreatur-Linse|Mehrspieler-Wand|Erst-Zeichnungs-Wand|Ziel-Zensus|Frost-Wand|Ego-Schatten|Kamera-Leib auf der Karte|Volle-Bühne-Prädikat'
FREI='Fenster-Wand|Kamera-Leib auf der Karte'   # 08.11.: rot ohne je einen Täter → Landung ohne Neulauf (zug.cjs --wackler-frei)
say() { echo "$(date +%H:%M:%S) [${Z}w] $*" | tee -a "$O"; }
TOK=$(printf "protocol=https\nhost=github.com\n\n" | git -C /c/Users/micha/AnazhRealm-profiband credential fill | sed -n 's/^password=//p')
api() { curl -s -H "Authorization: Bearer $TOK" -H "Accept: application/vnd.github+json" "$@"; }
until grep -qE "\[$Z\] (GELANDET|FAHRT ROT)" "$L" 2>/dev/null; do sleep 20; done
if grep -qE "\[$Z\] GELANDET" "$L"; then say "GELANDET (fahre)"; exit 0; fi
K=$(grep -oE "Kandidat [0-9a-f]{40}" "$L" | tail -1 | cut -d' ' -f2)
RUN=$(grep "FAHRT ROT" "$L" | tail -1 | grep -oE "Lauf [0-9]+" | cut -d' ' -f2)
[ -z "$K" ] || [ -z "$RUN" ] && { say "FAHRT ROT ohne Kandidat/Lauf — $(grep 'FAHRT ROT' "$L" | tail -1 | cut -c1-200)"; exit 1; }
rote() {  # rote Schritte im letzten Versuch je Job
    api "https://api.github.com/repos/$R/actions/runs/$RUN/jobs?filter=latest&per_page=100" | node -e '
const j=JSON.parse(require("fs").readFileSync(0));const r=[];
for(const x of j.jobs||[]){if(x.conclusion!=="failure")continue;const s=(x.steps||[]).filter(s=>s.conclusion==="failure"&&!/^URTEIL|Urteil/.test(s.name)).map(s=>s.name);r.push(x.name+": "+(s.join(" | ")||"(ohne Schritt)"))}
console.log(r.join("\n"))'
}
for v in 1 2 3; do
    ROT=$(rote)
    [ -z "$ROT" ] && break
    nf=$(echo "$ROT" | sed 's/^[^:]*: //' | tr '|' '
' | sed 's/^ *//; s/ *$//' | grep -vE "$FREI" | grep -c .)
    if [ "$nf" = 0 ]; then
        l=$(cd /c/Users/micha/AnazhRealm-profiband && sh artifacts/profiband/werkzeug/zug.sh landen "$K" --nachwache --wackler-frei 2>&1 | tail -1)
        case "$l" in GELANDET*) say "GELANDET ${K:0:8} ohne Neulauf (nur $(echo "$ROT" | tr '
' ';' | cut -c1-200)) — $l"; exit 0 ;; *) say "Landung ohne Neulauf abgewiesen: $l — weiter mit Neulauf" ;; esac
    fi
    # 08.11. z328: dieselben Wände nach einem Neulauf wieder rot = kein Wackler (3 Neuläufe kosteten 50 min)
    nfset=$(echo "$ROT" | sed "s/^[^:]*: //" | grep -vE "$FREI" | sort | tr "
" "|")
    if [ -n "$vorig" ] && [ "$nfset" = "$vorig" ]; then say "FAHRT ROT (dieselben Wände nach Neulauf wieder rot, kein Wackler): $(echo "$ROT" | tr "
" ";" | cut -c1-400)"; exit 1; fi
    vorig=$nfset
    fremd=$(echo "$ROT" | grep -vE "$WACKEL")
    if [ -n "$fremd" ]; then say "FAHRT ROT (kein Wackler): $(echo "$ROT" | tr '\n' ';' | cut -c1-400)"; exit 1; fi
    say "nur Wackler rot ($(echo "$ROT" | tr '\n' ';' | cut -c1-300)) — Neulauf der gefallenen Jobs $v/3, Lauf $RUN"
    api -X POST "https://api.github.com/repos/$R/actions/runs/$RUN/rerun-failed-jobs" >/dev/null
    sleep 60
    until [ "$(api "https://api.github.com/repos/$R/actions/runs/$RUN" | node -e 'console.log(JSON.parse(require("fs").readFileSync(0)).status)')" = completed ]; do sleep 30; done
done
ROT=$(rote)
[ -n "$ROT" ] && { say "FAHRT ROT nach 3 Neuläufen: $(echo "$ROT" | tr '\n' ';' | cut -c1-400)"; exit 1; }
l=$(cd /c/Users/micha/AnazhRealm-profiband && sh artifacts/profiband/werkzeug/zug.sh landen "$K" --nachwache 2>&1 | tail -1)
case "$l" in
    GELANDET*) say "GELANDET ${K:0:8} nach Neulauf der Wackler — $l" ;;
    *) say "FAHRT ROT beim Landen: $l"; exit 1 ;;
esac
