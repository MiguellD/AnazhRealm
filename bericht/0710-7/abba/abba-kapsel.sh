#!/bin/bash
# 0710-7 (3), die Klasse: DIE ZAHL IN EINER WELT — B-Welt (welle-m-nexus) an der Mess-Wiese, `_stepCharacterStructures` live
# getauscht: A = der Löser von 7c1bd6f2 (Schleife über den 60-m-Umkreis), B = die Nachbarschaft. Folge A B B A, je Segment takt (CPU je Subsystem, Render ruht) und lauf.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/welle-m-nexus
ALT=$BASE/p3/anazhRealm-7c1b.js
OUT=$BASE/p3/seg; mkdir -p $OUT
export WERKBANK_PORT=7902
W="node $INSTR/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $OUT/fortschritt.log; }
(cd $INSTR && PORT=7901 node save-server.js > $OUT/B-save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:7901/ 2>/dev/null | grep -q 200 && break; sleep 1; done
say "B Seite $(curl -s http://localhost:7901/anazhRealm.js | sha256sum | cut -c1-16)"
(cd $INSTR && node scripts/werkbank.cjs start --echt --port 7902 --seite http://localhost:7901 > $OUT/B-werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/B-werkbank.log 2>/dev/null && break; sleep 5; done
say "B Werkbank bereit"
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
$W umstellen --ort wiese > $OUT/B-umstellen.txt 2>&1
$W eval "return window.__buehne()" > /dev/null
say "B an der Wiese, Bühne steht"
$W lauf 20 --ein 10 --regler voll --tiere frei > $OUT/B-lauf.txt 2>&1
i=0
for X in A B B A; do
  i=$((i+1))
  if [ $X = A ]; then $W methode _stepCharacterStructures --quelle $ALT > $OUT/kap-$i$X-methode.txt 2>&1
  else $W methode _stepCharacterStructures > $OUT/kap-$i$X-methode.txt 2>&1; fi
  if [ $i -le 2 ]; then
    $W eval "window.__kapCmd = 'an'; $(cat $BASE/p3/kap-zaehler.js)" > /dev/null
    $W lauf 10 --ein 2 --regler voll --tiere frei > $OUT/kap-$i$X-zaehllauf.txt 2>&1
    $W eval "window.__kapCmd = 'aus'; $(cat $BASE/p3/kap-zaehler.js)" > $OUT/kap-$i$X-zaehler.json 2>&1
  fi
  $W eval "return String(Object.getPrototypeOf(r)._stepCharacterStructures).includes('_blockerNahe') ? 'netz' : 'schleife'" > $OUT/kap-$i$X-wer.txt 2>&1
  $W takt 600 --extra _stepCharacter,_stepCharacterStructures > $OUT/kap-$i$X-takt.txt 2>&1
  $W lauf 20 --ein 5 --regler voll --tiere frei > $OUT/kap-$i$X-lauf.txt 2>&1
  say "kap $i$X $(cat $OUT/kap-$i$X-wer.txt | tr -d '\n ' | cut -c1-60)"
done
$W stop > /dev/null 2>&1
sleep 3
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server' | ? { \$_.ProcessId -in (Get-NetTCPConnection -State Listen -LocalPort 7901 -ErrorAction SilentlyContinue | % OwningProcess) } | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
say "KAPSEL ENDE"
