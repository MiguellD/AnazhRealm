#!/bin/bash
# hand.sh — DIE LESER-ZEILEN von Hand (Leser 2, 26.11.): die Wand und die Zahl, wie sie in BEGRUENDUNG.txt stehen.
# Aufruf in einem sauberen Baum der Spitze punkte-maschine, origin/main geholt:
#   bash hand.sh <pfad zu leser-zeilen.diff> <scratch-ordner>
set -euo pipefail
DIFF=$(realpath "$1"); T=$(realpath "$2"); mkdir -p "$T"
R=$(git rev-parse --show-toplevel); P="$R/meisterkarte-quelle/punkte"
cd "$P"
git diff --quiet -- . && [ -z "$(git status --porcelain -- .)" ] || { echo "der Baum ist nicht sauber"; exit 1; }
echo "== 1 liste an der Basis $(git rev-parse --short HEAD)"
node punkte.cjs liste > "$T/liste-basis.txt" 2> "$T/liste-basis.err"; tail -1 "$T/liste-basis.txt"
echo "== 2 aus dem Diff nur das Werkzeug und der Selbsttest-Fall in punkte.cjs (die Stationen bleiben Basis)"
(cd "$R" && git apply --include='meisterkarte-quelle/punkte/werkzeug/*' --include='meisterkarte-quelle/punkte/punkte.cjs' "$DIFF")
node werkzeug/leser-zeilen.cjs --selbsttest | tail -1
echo "== 3 vorher gegen origin/main, mit --umstellen (n von m je Datei; --liste nennt jede Angabe)"
node werkzeug/leser-zeilen.cjs --gegen origin/main --liste --umstellen --json "$T/vorher.json" > "$T/vorher.out"; tail -1 "$T/vorher.out"
echo "== 4 die Stationen, die das Werkzeug schrieb = die Stationen des Kandidaten?"
(cd "$R" && git diff -- meisterkarte-quelle/punkte/stationen) > "$T/umstellen.diff"
awk '/^diff --git /{an = ($3 ~ /^a\/meisterkarte-quelle\/punkte\/stationen\//)} an' "$DIFF" > "$T/kandidat-stationen.diff"
cmp "$T/umstellen.diff" "$T/kandidat-stationen.diff" && echo "   byte-gleich ($(grep -c '^-[^-]' "$T/umstellen.diff") Zeilen)"
echo "== 5 liste am Kandidaten = Basis?"
node punkte.cjs liste > "$T/liste-kand.txt" 2> "$T/liste-kand.err"; tail -1 "$T/liste-kand.txt"
cmp "$T/liste-basis.txt" "$T/liste-kand.txt" && cmp "$T/liste-basis.err" "$T/liste-kand.err" && echo "   byte-gleich (stdout und stderr)"
echo "== 6 nachher (zweiter Lauf; übrig nur, was im Abdruck steht, mehrdeutig ist oder fehlt)"
node werkzeug/leser-zeilen.cjs --gegen origin/main --json "$T/nachher.json" | tail -1
