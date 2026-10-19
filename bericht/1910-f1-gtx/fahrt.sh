#!/bin/bash
# 1910 F1 Schritt 2: FAHRT-ABAB 4+4 mit dem Werkzeug der Radeon (koordination auftrag/1910-omen-f1-abab/boot.sh, aufsitzen.js,
# pruef.js — „nicht nachbauen, dieses nehmen"). boot.sh startet die Werkbank aus dem Baum der Seite auf Port 7979 ohne --seite
# und ohne --echt (headless, die Weiche des Start-Rezepts; die Seite liefert ihr eigener Seiten-Port 7978) — so fuhr die Radeon,
# also misst jede Seite mit ihrem eigenen Werkbank-Stand (werkbank.cjs ist A↔B byte-gleich, methoden.txt).
# Der Wrapper: GPU-Schloss omen-1710-n vor jedem Boot, gelöst danach; Seiten-Wache = HEAD + leerer git status vor und nach dem
# Boot (der Seiten-Port liefert den Baum selbst); nvidia-smi 1 Hz je Boot; Prüfung je Boot (pruef.js + aufsitzen): aufgesessen,
# geritten, Strecke ≥ 60 m — misslang die Fahrt, einmal neu (die Dateien des Fehlversuchs unter verworfen/). 60 s Pause.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
A=$BASE/n1910-f1a; B=$BASE/n1910-f1b
F=$BASE/p3/n1910/f1; OUT=$F/fahrt; LOG=$OUT/fortschritt.log; mkdir -p $OUT/verworfen
BOOT=$BASE/koordination/auftrag/1910-omen-f1-abab/boot.sh
STOPP=$(cygpath -w $F/stopp.ps1)
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() { powershell -NoProfile -ExecutionPolicy Bypass -File "$STOPP" >> $F/stopp.log 2>&1; sleep 3; }
gpu() { nvidia-smi --query-gpu=temperature.gpu,clocks.gr,clocks.mem,pstate,clocks_throttle_reasons.active --format=csv,noheader 2>/dev/null | tr -d '\n'; }
smi_an() { nvidia-smi --query-gpu=timestamp,clocks.gr,clocks.mem,temperature.gpu,power.draw,pstate,clocks_throttle_reasons.active,memory.used --format=csv,noheader -l 1 > $1 2>/dev/null & SMI=$!; }
seite() { echo "$(git -C $1 rev-parse --short=8 HEAD) status=$(git -C $1 status --porcelain | wc -l)"; }
pruefe() { # $1 Name -> "OK …" oder "MISSLUNGEN …"
  node -e '
const fs = require("fs");
const lies = (f) => { try { const t = fs.readFileSync(f, "utf8"); const j = JSON.parse(t.slice(t.indexOf("{"))); return j.ergebnis !== undefined ? j.ergebnis : j; } catch (e) { return null; } };
const [d, n] = process.argv.slice(1);
const auf = lies(d + "/" + n + "-auf.json"), p = lies(d + "/" + n + "-pruef.json"), l = lies(d + "/" + n + "-lauf.json");
const ok = !!(auf && auf.ok && p && p.geritten && p.weg >= 60 && l && l.cpuTaktMs);
console.log((ok ? "OK" : "MISSLUNGEN") + " auf=" + JSON.stringify(auf) + " pruef=" + JSON.stringify(p) + " cpu=" + JSON.stringify(l && l.cpuTaktMs) + " frame=" + JSON.stringify(l && l.frameMs));
' "$(cygpath -m $OUT)" "$1"; }
. $BASE/p3/gpu-schloss.sh
say "FAHRT START A=$(seite $A) B=$(seite $B) Werkzeug=$(sha256sum $BOOT $OUT/aufsitzen.js $OUT/pruef.js | cut -c1-12 | tr '\n' ' ')"
for N in ${FAHRTEN:-A1 B1 A2 B2 A3 B3 A4 B4}; do
  if [ -f $OUT/$N-pruef.json ] && pruefe $N | grep -q "^OK"; then say "$N steht schon"; continue; fi
  case $N in A*) WT=$A;; B*) WT=$B;; esac
  schloss_nehmen omen-1710-n
  for versuch in 1 2; do
    stopp
    S0=$(seite $WT)
    say "$N v$versuch start $S0 gpu[$(gpu)]"
    smi_an $OUT/$N-smi.csv
    FAHRT_AUS=$OUT timeout 1200 bash $BOOT $WT $N; ec=$?
    kill $SMI 2>/dev/null
    S1=$(seite $WT)
    [ "$S1" = "$S0" ] || say "$N SEITEN-WACHE NACHHER ROT ($S0 -> $S1)"
    ERG=$(pruefe $N)
    say "$N v$versuch exit=$ec gpu[$(gpu)] $(grep -a 'linse-gpu' $OUT/$N-start.log | head -1) $ERG"
    if echo "$ERG" | grep -q "^OK" || [ $versuch -eq 2 ]; then break; fi
    for f in $OUT/$N-*; do mv "$f" $OUT/verworfen/v$versuch-$(basename "$f"); done
    say "$N Fahrt misslungen — einmal neu"; sleep 20
  done
  stopp; schloss_loesen omen-1710-n; sleep 60
done
stopp
say "FAHRT ENDE"
