#!/bin/bash
# zug/eichtafel-gtx.sh — Station (02.11., Koordinator): nach den Eich-Fahrten (zug/eich-nur-gtx.sh) die Zahlen am SHA der Zeile als Deckel
# der GTX in die Deckel-Tafel: `punkte.cjs eichtafel --sha <sha> --geraet gtx --schreibe` (schreibt deckel.json nur, wenn die Fahrt der
# Karte danach hält), deckel.json nach punkte-maschine. Ohne Fahrt, ohne GPU.
set -u
H=$(dirname "$(dirname "$OUT")"); BASE=$(dirname "$(dirname "$H")"); PK=$BASE/koord-punkte; ID=$(basename "$OUT")
S=$(git -C "$BAUM" rev-parse HEAD); s8=${S:0:8}; D=meisterkarte-quelle/punkte/deckel.json; P=meisterkarte-quelle/punkte/punkte.cjs
git -C $PK fetch -q origin punkte-maschine && git -C $PK rebase -q origin/punkte-maschine || { git -C $PK rebase --abort 2>/dev/null; echo "punkte-maschine: Rebase scheiterte — nichts geschrieben"; exit 2; }
(cd $PK && node $P eichtafel --sha $S --geraet gtx --schreibe) > $OUT/eichtafel.out 2>&1; E=$?
if git -C $PK diff --quiet -- $D 2>/dev/null && [ -z "$(git -C $PK status --porcelain -- $D)" ]; then
  echo "EICHTAFEL $s8 gtx ($ID): deckel.json unverändert · $(grep -m1 "DECKEL-TAFEL\|Fahrt" $OUT/eichtafel.out | cut -c1-200) · Exit $E"; exit $E
fi
git -C $PK add $D
git -C $PK -c core.autocrlf=false commit -q -m "Deckel-Tafel gtx aus der Eich-Fahrt $s8 ($ID)

$(grep -m1 "DECKEL-TAFEL" $OUT/eichtafel.out | cut -c1-400)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" && for i in 1 2 3; do
  git -C $PK push -q origin HEAD:punkte-maschine && break
  git -C $PK fetch -q origin punkte-maschine; git -C $PK rebase -q origin/punkte-maschine || git -C $PK rebase --abort
done
cp $PK/$D $OUT/ 2>/dev/null
echo "EICHTAFEL $s8 gtx ($ID): $(grep -m1 "DECKEL-TAFEL" $OUT/eichtafel.out | cut -c1-200) · Exit $E"
exit $E
