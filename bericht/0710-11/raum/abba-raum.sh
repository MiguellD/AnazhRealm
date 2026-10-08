#!/bin/bash
# 0710-11 (1): DIE ZAHL IN EINER WELT — B-Welt (welle-m-boosts, das Gedächtnis) an der Mess-Wiese, `computeSpatialTags` live
# getauscht: A = die Rechnung ohne Gedächtnis (main 76c9624d), B = das Gedächtnis. Folge A B B A, je Segment takt 1200 (CPU je
# Subsystem) und der Raum-Tag-Zähler über 1200 Takte (Boost-Takte: ms und Spitze, Rufe je Bauplan).
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/welle-m-boosts
ALT=$BASE/abab-b536/anazhRealm.js
OUT=$BASE/p3/boosts/abba; mkdir -p $OUT
export WERKBANK_PORT=7902
W="node $INSTR/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $OUT/fortschritt.log; }
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
i=0
for X in A B B A; do
  i=$((i+1))
  if [ $X = A ]; then $W methode computeSpatialTags --quelle $ALT > $OUT/abba-$i$X-methode.txt 2>&1
  else $W methode computeSpatialTags > $OUT/abba-$i$X-methode.txt 2>&1; fi
  $W eval "return String(Object.getPrototypeOf(r).computeSpatialTags).includes('_raumTagSchluessel') ? 'gedaechtnis' : 'rechnung'" > $OUT/abba-$i$X-wer.txt 2>&1
  $W takt 1200 --extra tickPlayerBoosts,computeSpatialTags,_raumTagsRechnen > $OUT/abba-$i$X-takt.txt 2>&1
  $W eval "delete window.__raumCmd; $(cat $BASE/p3/raum-zaehler.js)" > /dev/null
  $W takt 1200 > /dev/null 2>&1
  $W eval "window.__raumCmd = 'aus'; $(cat $BASE/p3/raum-zaehler.js)" > $OUT/abba-$i$X-raum.json 2>&1
  say "abba $i$X $(tr -d '\n ' < $OUT/abba-$i$X-wer.txt | cut -c1-40) $(tr -d '\n ' < $OUT/abba-$i$X-raum.json | cut -c1-160)"
done
$W stop > /dev/null 2>&1
sleep 3
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server' | ? { \$_.ProcessId -in (Get-NetTCPConnection -State Listen -LocalPort 7901 -ErrorAction SilentlyContinue | % OwningProcess) } | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
say "ABBA ENDE"
