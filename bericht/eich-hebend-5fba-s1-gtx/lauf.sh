#!/bin/bash
# zug/eich-nur-gtx.sh — Station (02.11., Koordinator nach OMEN-STAND-2026-11-02): DIE EICH-FAHRT der GTX wie zug/eich-gtx.sh, aber nur
# über die Stationen im Schlüssel `nur=` der EIGENEN Zeile in zug/warteschlange.txt (die Station bekommt nur sha und lauf, also liest sie
# ihre Zeile selbst). Anlass: hebend-5fba-s1 stand 8/8 OFFEN an Deckel/Frist — ein Deckel 10 s heißt „keine GTX-Eichzahl“; die Eich-Fahrt
# (Deckel 90 s je Probe, Fahrt ≤ 1 800 s) liefert die Zahlen, `eichtafel --schreibe` (zug/eichtafel-gtx.sh) macht sie zu Deckeln.
set -u
H=$(dirname "$(dirname "$OUT")"); BASE=$(dirname "$(dirname "$H")"); PK=$BASE/koord-punkte; ID=$(basename "$OUT")
S=$(git -C "$BAUM" rev-parse HEAD); s8=${S:0:8}; M=meisterkarte-quelle/punkte/messung; P=meisterkarte-quelle/punkte/punkte.cjs
NUR=$(awk -v i="$ID" '$1 == i { for (k = 4; k <= NF; k++) if ($k ~ /^nur=/) print substr($k, 5) }' $H/koord/zug/warteschlange.txt | tail -n 1)
[ -n "$NUR" ] || { echo "keine nur= in der Zeile $ID — nichts gefahren"; exit 2; }
git -C $PK fetch -q origin punkte-maschine && git -C $PK rebase -q origin/punkte-maschine || { git -C $PK rebase --abort 2>/dev/null; echo "punkte-maschine: Rebase scheiterte — nichts gefahren"; exit 2; }
grep -q "function eichEintrag" $PK/$P || { echo "punkte-maschine trägt die Eich-Fahrt nicht — nichts gefahren"; exit 3; }
(cd $PK && PUNKTE_GPU_LAUF=$(cygpath -m $BASE/p3/gpu-lauf.sh) node $P run --sha $S --geraet gtx --eich --nur "$NUR") > $OUT/eich.out 2>&1; E=$?
grep -E "^  (EICH|SITZUNG) " $OUT/eich.out > $OUT/eich-zahlen.txt
z="$(grep -c "im Gesetz, das Urteil zählt" $OUT/eich-zahlen.txt) im Gesetz · $(grep -c "über dem Gesetz" $OUT/eich-zahlen.txt) über dem Gesetz · $(grep -c "am Eich-Deckel" $OUT/eich-zahlen.txt) ≥ 90 s"
git -C $PK add $M/$s8-gtx.json
find $PK/$M/roh/$s8-gtx -name "*.out" -size -5M 2>/dev/null | while read -r f; do git -C $PK add "$f"; done
git -C $PK -c core.autocrlf=false commit -q -m "Punkte-Eich-Fahrt $s8 gtx: $z ($ID)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" && for i in 1 2 3; do
  git -C $PK push -q origin HEAD:punkte-maschine && break
  git -C $PK fetch -q origin punkte-maschine; git -C $PK rebase -q origin/punkte-maschine || git -C $PK rebase --abort
done
cp $PK/$M/$s8-gtx.json $OUT/ 2>/dev/null
# der Rest DIESER Scheibe: was eine weitere Eich-Fahrt mit derselben nur= messen würde
(cd $PK && node $P run --sha $S --geraet gtx --eich --nur "$NUR" --trocken) > $OUT/eich-rest.txt 2>&1
echo "EICH $s8 gtx ($ID): $z · Rest: $(tail -n 1 $OUT/eich-rest.txt | cut -c1-160) · run Exit $E"
exit $E
