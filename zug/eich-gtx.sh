#!/bin/bash
# zug/eich-gtx.sh — Station (30.10., w4-sitzung-eichen): DIE EICH-FAHRT der GTX am SHA der Zeile. takt25c-gtx (6b3da705) riss 36 von 38
# Proben am geschätzten Deckel (10, 15, die Kappe 33 s) und stand UNGEMESSEN — die Zahl, die die Schätzung ersetzen soll, war zensiert.
# `punkte.cjs run --eich` fährt EINE Sitzung (eine warme Welt, das ganze Schloss, die Fahrt ≤ 1 800 s) mit dem Deckel 90 s je Probe (die
# Ausnahme-Grenze) und trägt je Probe ihre Sekunden in die Mess-Datei (`eich`); ein Urteil zählt nur im Gesetz (≤ 45 s, mit ausnahme
# ≤ 90 s), darüber steht die Probe UNGEMESSEN beim Namen samt Urteil und Zahl. Gewählt wird jede GTX-Probe ohne frische Messung und ohne
# Eich-Zahl am SHA — dieselbe Zeile mit neuer id misst den Rest, bis eich-rest.txt „nichts zu eichen“ nennt.
# Wie fahre_punkte (p3/messplatz/messplatz.sh): aus koord-punkte (Zweig punkte-maschine), die Mess-Datei und die Roh-Ausgaben nach
# punkte-maschine; nach $OUT (bericht/<id>/ auf koordination) das Log, die Zahlen und der Rest.
set -u
H=$(dirname "$(dirname "$OUT")"); BASE=$(dirname "$(dirname "$H")"); PK=$BASE/koord-punkte; ID=$(basename "$OUT")
S=$(git -C "$BAUM" rev-parse HEAD); s8=${S:0:8}; M=meisterkarte-quelle/punkte/messung; P=meisterkarte-quelle/punkte/punkte.cjs
git -C $PK fetch -q origin punkte-maschine && git -C $PK rebase -q origin/punkte-maschine || { git -C $PK rebase --abort 2>/dev/null; echo "punkte-maschine: Rebase scheiterte — nichts gefahren"; exit 2; }
# ohne die Eich-Fahrt im Zweig führe `run --eich` eine GEWÖHNLICHE Sitzung über jede GTX-Probe (das alte run kennt --eich nicht)
grep -q "function eichEintrag" $PK/$P || { echo "punkte-maschine trägt die Eich-Fahrt nicht (w4-sitzung-eichen ungemergt) — nichts gefahren"; exit 3; }
(cd $PK && PUNKTE_GPU_LAUF=$(cygpath -m $BASE/p3/gpu-lauf.sh) node $P run --sha $S --geraet gtx --eich) > $OUT/eich.out 2>&1; E=$?
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
# der Rest: was die nächste Eich-Fahrt messen würde (die Fahrt ≤ 1 800 s erreicht nicht jede Probe)
(cd $PK && node $P run --sha $S --geraet gtx --eich --trocken) > $OUT/eich-rest.txt 2>&1
echo "EICH $s8 gtx: $z · Rest: $(tail -n 1 $OUT/eich-rest.txt | cut -c1-160) · run Exit $E"
exit $E
