#!/bin/bash
# 0710-10: DIE ZAHL IN EINER WELT — B-Welt (welle-m-brennglas, der Schnitt) an der Mess-Wiese, die Takte der Klasse live getauscht:
# A = die Schleifen von V18.536 (abab-b536, 76c9624d), B = Verzeichnis und Plätze. Erst der Ziel-Zähler je Seite, dann A B B A,
# je Segment takt (CPU je Subsystem, Render ruht) und lauf.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/welle-m-brennglas
ALT=$BASE/abab-b536/anazhRealm.js
OUT=$BASE/p3/glas/abba; mkdir -p $OUT
export WERKBANK_PORT=7902
W="node $INSTR/scripts/werkbank.cjs"
M="_tickFocusingAffordances _tickRadiatingAffordances _tickBalancingAffordances _tickLiftingAffordances _findNearestAffordanceEntry _updateDorfRauch tickPlayerBoosts"
EXTRA=tickAffordances,_tickFocusingAffordances,_tickRadiatingAffordances,_tickBalancingAffordances,_tickLiftingAffordances,_tickPortalAffordance,_findNearestAffordanceEntry,_updateDorfRauch,tickPlayerBoosts
say() { echo "$(date +%T) $*" | tee -a $OUT/fortschritt.log; }
tausche() { # $1 = A|B, $2 = Datei-Präfix
  for m in $M; do
    if [ $1 = A ]; then $W methode $m --quelle $ALT >> $OUT/$2-methode.txt 2>&1; else $W methode $m >> $OUT/$2-methode.txt 2>&1; fi
  done
  $W eval "const P = Object.getPrototypeOf(r); return '$M'.split(' ').map((m) => /_blockerMit|_blockerUmPlatz/.test(String(P[m])) ? 'B' : 'A').join('')" > $OUT/$2-wer.txt 2>&1
}
(cd $INSTR && PORT=7901 node save-server.js > $OUT/save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:7901/ 2>/dev/null | grep -q 200 && break; sleep 1; done
say "B Seite $(curl -s http://localhost:7901/anazhRealm.js | sha256sum | cut -c1-16)"
(cd $INSTR && node scripts/werkbank.cjs start --echt --port 7902 --seite http://localhost:7901 > $OUT/werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/werkbank.log 2>/dev/null && break; sleep 5; done
say "Werkbank bereit"
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
$W umstellen --ort wiese > $OUT/umstellen.txt 2>&1
$W eval "return window.__buehne()" > /dev/null
say "an der Wiese, Bühne steht"
$W lauf 20 --ein 10 --regler voll --tiere frei > $OUT/lauf-ein.txt 2>&1
# der Ziel-Zähler je Seite (danach fällt seine Hülle wieder)
for X in A B; do
  tausche $X zaehler-$X
  $W eval "window.__zielCmd = 'an'; $(cat $BASE/p3/glas-ziele.js)" > /dev/null
  $W takt 600 > /dev/null 2>&1
  $W eval "window.__zielCmd = 'aus'; $(cat $BASE/p3/glas-ziele.js)" > $OUT/zaehler-$X.json 2>&1
  say "Zähler $X $(cat $OUT/zaehler-$X-wer.txt | tr -d '\n ') $(cat $OUT/zaehler-$X.json | tr -d '\n ' | cut -c1-120)"
done
i=0
for X in A B B A; do
  i=$((i+1))
  tausche $X abba-$i$X
  $W takt 600 --extra $EXTRA > $OUT/abba-$i$X-takt.txt 2>&1
  $W lauf 20 --ein 5 --regler voll --tiere frei > $OUT/abba-$i$X-lauf.txt 2>&1
  say "abba $i$X $(cat $OUT/abba-$i$X-wer.txt | tr -d '\n ' | cut -c1-60)"
done
$W stop > /dev/null 2>&1
sleep 3
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server' | ? { \$_.ProcessId -in (Get-NetTCPConnection -State Listen -LocalPort 7901 -ErrorAction SilentlyContinue | % OwningProcess) } | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
say "ABBA ENDE"
