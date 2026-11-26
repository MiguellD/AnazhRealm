#!/bin/bash
# hand.sh — K10 gegenwart2-memo VON HAND (Leser 2, 26.11.): die vier Wände des Auftrags (Koordinator 03:15) in EINEM Lauf.
#   bash hand.sh <spiel-baum (origin/main)> <pm-baum (punkte-maschine, sauber an den zwei Dateien)> <scratch>
# Der pm-Baum trägt erst die Basis, dann (git apply, Rückbau per trap) den Kandidaten gegenwart2-memo.diff. Das Memo schreibt die Hand
# NIE in den pm-Baum: PUNKTE_MASCHINE zeigt auf <scratch>/pm/punkte.cjs (die Station nimmt davon nur den Ordner → <scratch>/pm/messung/
# kern-memo/). Die Mutante (planet-core.js + eine Kommentar-Zeile) baut der trap im Spiel-Baum zurück.
set -euo pipefail
H=$(cd "$(dirname "$0")" && pwd); SPIEL=$(realpath "$1"); PM=$(realpath "$2"); T=$(realpath -m "$3")
ST=meisterkarte-quelle/punkte/stationen/k2-zusammenspiel.js; RU=zug/dienst/runde.cjs; MASCHINE=$T/pm/punkte.cjs; MEM=$T/pm/messung/kern-memo
rm -rf "$T"; mkdir -p "$T"
git -C "$PM" diff --quiet -- $ST $RU || { echo "der pm-Baum ist an $ST / $RU nicht sauber"; exit 2; }
git -C "$SPIEL" diff --quiet -- planet-core.js gelaende-core.js || { echo "der Spiel-Baum ist an den Kernen nicht sauber"; exit 2; }
AN=0; cp "$SPIEL/planet-core.js" "$T/planet-core.js.sicher"
rueck() { cp "$T/planet-core.js.sicher" "$SPIEL/planet-core.js"; if [ $AN = 1 ]; then git -C "$PM" apply -R "$H/gegenwart2-memo.diff"; fi; }
trap rueck EXIT
echo "== Köpfe: Spiel $(git -C "$SPIEL" rev-parse --short=10 HEAD) · pm $(git -C "$PM" rev-parse --short=10 HEAD) · node $(node -v) · $(nproc) Kerne"
hand() { node "$H/memo-hand.cjs" "$PM/$ST" "$SPIEL" "$@"; }
feld() { node -e 'const j=JSON.parse(process.argv[1]);console.log(process.argv.slice(2).map(k=>k+" "+JSON.stringify(j[k])).join(" · "))' "$@"; }
WERTE="gipfelProzent landProzent streuung saaten unter95 finger kernAus kernSchluessel faeden msFaecher msHand"

echo; echo "== BASIS (origin/punkte-maschine, der Fächer rechnet jeden Lauf)"
B=$(hand -); echo "   Fächer:  $(feld "$B" $WERTE)"
node "$H/proben-hand.cjs" "$PM/$ST" | sed 's/^/   /' || true
echo "   reise-hand (runde.cjs der Basis):"; bash "$H/reise-hand.sh" "$PM/$RU" "$T/reise-vorher" | sed 's/^/   /'
echo "   runde selbsttest: $( (cd "$T" && node "$PM/$RU" selbsttest 2>&1; echo "Exit $?") | sha256sum | cut -c1-16) (sha256-16 der Ausgabe)"; (cd "$T" && node "$PM/$RU" selbsttest 2>&1 | sed 's/^/      /') || true
t0=$(date +%s); (cd "$PM/meisterkarte-quelle/punkte" && node punkte.cjs liste > "$T/liste-basis.txt" 2> "$T/liste-basis.err") || true
echo "   liste: $(tail -1 "$T/liste-basis.txt") · stderr $(wc -c < "$T/liste-basis.err") B · $(( $(date +%s) - t0 )) s"

git -C "$PM" apply "$H/gegenwart2-memo.diff"; AN=1
echo; echo "== KANDIDAT (gegenwart2-memo.diff auf dem pm-Baum)"
O=$(hand -); echo "   ohne Sitzung (kein PUNKTE_MASCHINE → kein Memo): $(feld "$O" $WERTE)"
L1=$(hand "$MASCHINE"); echo "   Lauf 1 (Sitzung, kein Memo):   $(feld "$L1" $WERTE)"
M=$(ls "$MEM"); echo "   geschrieben: kern-memo/$M · $(wc -c < "$MEM/$M") B"; cp "$MEM/$M" "$T/memo-lauf1.json"
L2=$(hand "$MASCHINE"); echo "   Lauf 2 (Treffer):              $(feld "$L2" $WERTE)"
for x in O L1 L2; do v=${!x}; echo "   Wand 1 $x gegen BASIS: $(node -e 'const [a,b]=process.argv.slice(1).map(JSON.parse),k=["gipfelProzent","landProzent","streuung","saaten","gipfel","konv","land","landKonv","antworten","unter95","finger"];const d=k.filter(n=>JSON.stringify(a[n])!==JSON.stringify(b[n]));console.log(d.length?"WEICHT in "+d.join(","):"bit-gleich ("+k.length+" Felder)")' "$B" "$v")"; done
node -e 'const fs=require("fs"),f=process.argv[1],m=JSON.parse(fs.readFileSync(f,"utf8"));m.schluessel="ffff"+m.schluessel.slice(4);fs.writeFileSync(f,JSON.stringify(m)+"\n")' "$MEM/$M"
F=$(hand "$MASCHINE"); echo "   Wand 2 Memo mit fremdem Schlüssel: $(feld "$F" saaten gipfelProzent kernAus kernSchluessel)"
rm "$MEM/$M"; L3=$(hand "$MASCHINE"); echo "   Lauf 3 (Memo gelöscht, neu gerechnet): $(feld "$L3" kernAus msFaecher finger) · Memo byte-gleich zu Lauf 1: $(cmp -s "$MEM/$M" "$T/memo-lauf1.json" && echo ja || echo NEIN)"
echo "// hand.sh Mutante: ein Byte mehr im Kern" >> "$SPIEL/planet-core.js"
U=$(hand "$MASCHINE"); echo "   Mutante planet-core.js +1 Zeile: $(feld "$U" kernAus kernSchluessel finger msFaecher) · Memos jetzt: $(ls "$MEM" | tr '\n' ' ')"
cp "$T/planet-core.js.sicher" "$SPIEL/planet-core.js"
node "$H/proben-hand.cjs" "$PM/$ST" | sed 's/^/   /' || true
echo "   reise-hand (runde.cjs des Kandidaten):"; bash "$H/reise-hand.sh" "$PM/$RU" "$T/reise-nachher" | sed 's/^/   /'
echo "   runde selbsttest: $( (cd "$T" && node "$PM/$RU" selbsttest 2>&1; echo "Exit $?") | sha256sum | cut -c1-16) (sha256-16 der Ausgabe)"
t0=$(date +%s); (cd "$PM/meisterkarte-quelle/punkte" && node punkte.cjs liste > "$T/liste-kand.txt" 2> "$T/liste-kand.err") || true
echo "   liste: $(tail -1 "$T/liste-kand.txt") · stderr $(wc -c < "$T/liste-kand.err") B · $(( $(date +%s) - t0 )) s · stderr gleich: $(cmp -s "$T/liste-basis.err" "$T/liste-kand.err" && echo ja || echo NEIN)"
node "$H/liste-bloecke.cjs" "$T/liste-basis.txt" "$T/liste-kand.txt" | sed 's/^/   /'
echo; echo "exit 0"
