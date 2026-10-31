#!/usr/bin/env bash
# messreihe.sh <baum> <etikett> <von> <bis> — je Lauf ein FRISCHER Boot (nachgebaut nach w4-stadt-takt2):
# start --holz voll --ort stadt-voll, fenster 1920×1080, GPU-frei an, umstellen --ort stadt-voll, Zensus der Knoten,
# Takt-Spitze stehend 30 s, dann gehend 30 s (Bahn, der erste Gang nach dem Umstellen), Zensus, stop.
# Ablage: $MESS/<etikett>-<i>-{steht,geht}.json (+ .roh.json), -zensus-{0,1}.json, -ende.txt
# A/B verschränkt (gleiche Bedingungen, Gebot 6): je i erst main, dann der Zweig —
#   for i in 1 2 3; do ./messreihe.sh <main-baum> vorher $i $i; ./messreihe.sh <zweig-baum> nachher $i $i; done
D=$(cd "$(dirname "$0")" && pwd)
MESS=${MESS:-/tmp/stadt-takt3-mess}
mkdir -p "$MESS"
BAUM=$1
cd "$BAUM" || exit 1
ET=$2
VON=${3:-1}
BIS=${4:-3}
for i in $(seq "$VON" "$BIS"); do
    P="$MESS/$ET-$i"
    echo "== $ET Lauf $i start $(date +%T) in $BAUM ($(git log --oneline -1 | cut -c1-12))"
    timeout 30 node scripts/werkbank.cjs stop > /dev/null 2>&1
    (node scripts/werkbank.cjs start --holz voll --ort stadt-voll > "$P-start.log" 2>&1 &)
    for t in $(seq 1 120); do grep -q "WERKBANK bereit" "$P-start.log" 2>/dev/null && break; sleep 3; done
    grep -q "WERKBANK bereit" "$P-start.log" || { echo "START ROT"; cat "$P-start.log"; exit 1; }
    timeout 60 node scripts/werkbank.cjs fenster 1920 1080 > /dev/null 2>&1
    timeout 60 node scripts/werkbank.cjs eval "$(cat "$D/gpu-frei.js")" > /dev/null 2>&1
    timeout 60 node scripts/werkbank.cjs eval '__gpuFrei(true); return r._schirm()' > "$P-schirm.txt" 2>&1
    echo "   bereit $(date +%T)"
    timeout 1700 node scripts/werkbank.cjs umstellen --ort stadt-voll > "$P-umstellen.txt" 2>&1
    echo "   umstellen EXIT=$? $(date +%T) $(grep -o '"takte": [0-9]*' "$P-umstellen.txt") $(grep -o '"steht": [a-z]*' "$P-umstellen.txt")"
    timeout 120 node scripts/werkbank.cjs eval "$(cat "$D/kehraus-zensus.js")" > "$P-zensus-0.json" 2>&1
    echo "   zensus-0 $(tr -d '\n ' < "$P-zensus-0.json" | grep -o '"knoten":[0-9]*' | head -1) $(tr -d '\n ' < "$P-zensus-0.json" | grep -o '"leiber":{[^}]*}')"
    timeout 600 node scripts/werkbank.cjs takt 30 --ein 2 --wandern aus --json "$P-steht.json" > "$P-steht.txt" 2>&1
    echo "   steht EXIT=$? $(head -1 "$P-steht.txt" | cut -c1-120)"
    timeout 600 node scripts/werkbank.cjs takt 30 --ein 2 --wandern bahn --json "$P-geht.json" > "$P-geht.txt" 2>&1
    echo "   geht EXIT=$? $(head -1 "$P-geht.txt" | cut -c1-120)"
    timeout 120 node scripts/werkbank.cjs eval "$(cat "$D/kehraus-zensus.js")" > "$P-zensus-1.json" 2>&1
    echo "   zensus-1 $(tr -d '\n ' < "$P-zensus-1.json" | grep -o '"knoten":[0-9]*' | head -1) $(tr -d '\n ' < "$P-zensus-1.json" | grep -o '"leiber":{[^}]*}')"
    timeout 60 node scripts/werkbank.cjs eval 'return {geschluckt: __gpuFrei(true), offen: r._weltOffen(), bewohner: [...(r._bewohnerSiedlungen||new Map()).values()].reduce((a,S)=>a+(S.liste?S.liste.length:0),0), wagen: [...(r._bewohnerSiedlungen||new Map()).values()].reduce((a,S)=>a+(S.verkehr?S.verkehr.wagen.length:0),0), archs: r.state.architectures.length}' > "$P-ende.txt" 2>&1
    timeout 30 node scripts/werkbank.cjs stop > /dev/null 2>&1
    echo "   ende $(date +%T)"
done
echo "== $ET Ende $(date +%T)"
