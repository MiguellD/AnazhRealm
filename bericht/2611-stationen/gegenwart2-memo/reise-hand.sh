#!/bin/bash
# reise-hand.sh — reist das Kern-Memo mit der Messung? (Leser 2, 26.11.) Die EINE Stelle, über die beide Geräte ihre Mess-Dateien buchen:
# zug/dienst/runde.cjs push-pfade (OMEN: zug/dienst-omen/ort/n0611/kandidat.sh:103 · Radeon: die Runde, Commit „Messung <kopf8> radeon“),
# die Regel `eigen`. Ein nackter Ursprung, zwei Geräte-Bäume (radeon, gtx), je eine Mess-Datei und ein Memo am selben Schlüssel.
#   bash reise-hand.sh <runde.cjs> <scratch>
set -euo pipefail
RUNDE=$(realpath "$1"); T=$(realpath -m "$2"); rm -rf "$T"; mkdir -p "$T"
M=meisterkarte-quelle/punkte/messung; K=0123456789abcdef0123456789abcdef01234567; S16=d211a11b17376097
export GIT_AUTHOR_NAME=probe GIT_AUTHOR_EMAIL=probe@invalid GIT_COMMITTER_NAME=probe GIT_COMMITTER_EMAIL=probe@invalid
git init -q --bare "$T/ursprung.git"
git clone -q "$T/ursprung.git" "$T/saat" 2>/dev/null; (cd "$T/saat" && git checkout -q -b punkte-maschine && mkdir -p $M && echo '{}' > $M/referenz-radeon.json && git add -A && git commit -q -m saat && git push -q origin punkte-maschine)
for g in radeon gtx; do
    git clone -q -b punkte-maschine "$T/ursprung.git" "$T/$g"
    mkdir -p "$T/$g/$M/kern-memo"
    echo "{\"messung\":\"$g\"}" > "$T/$g/$M/${K:0:8}-$g.json"
    echo "{\"schluessel\":\"$S16…\",\"von\":\"$g\"}" > "$T/$g/$M/kern-memo/$S16.json"   # zwei Geräte, verschiedene Bytes: wer überschreibt?
done
for g in radeon gtx; do
    node "$RUNDE" push-pfade "$T/$g" punkte-maschine $g $K "Messung ${K:0:8} $g (reise-hand)" | tail -1
    echo "   Ursprung nach $g: $(git -C "$T/ursprung.git" ls-tree -r --name-only punkte-maschine -- $M | tr '\n' ' ')"
done
echo "   das Memo im Ursprung: $(git -C "$T/ursprung.git" show punkte-maschine:$M/kern-memo/$S16.json 2>/dev/null || echo FEHLT)"
echo "   ungepusht gtx: $(node "$RUNDE" ungepusht "$T/gtx" punkte-maschine gtx "$T/seit" 2>&1 | tr '\n' ' ')"
