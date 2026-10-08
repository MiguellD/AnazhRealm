#!/bin/bash
# 0710-10 Offen: die Raum-Tags an der Mess-Wiese — wer ruft `computeSpatialTags` wie oft, für welche Baupläne, was kostet es
# (B-Welt welle-m-brennglas, der Schnitt; die Resonanz ruft nur noch für die Plätze um den Spieler).
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/welle-m-brennglas
OUT=$BASE/p3/glas/raum; mkdir -p $OUT
export WERKBANK_PORT=7902
W="node $INSTR/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $OUT/fortschritt.log; }
(cd $INSTR && PORT=7901 node save-server.js > $OUT/save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:7901/ 2>/dev/null | grep -q 200 && break; sleep 1; done
say "Seite $(curl -s http://localhost:7901/anazhRealm.js | sha256sum | cut -c1-16)"
(cd $INSTR && node scripts/werkbank.cjs start --echt --port 7902 --seite http://localhost:7901 > $OUT/werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/werkbank.log 2>/dev/null && break; sleep 5; done
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
$W umstellen --ort wiese > $OUT/umstellen.txt 2>&1
$W eval "return window.__buehne()" > /dev/null
say "an der Wiese, Bühne steht"
$W lauf 20 --ein 10 --regler voll --tiere frei > $OUT/lauf-ein.txt 2>&1
$W eval "$(cat $BASE/p3/raum-zaehler.js)" > /dev/null
$W takt 1200 > $OUT/takt.txt 2>&1
$W eval "window.__raumCmd = 'aus'; $(cat $BASE/p3/raum-zaehler.js)" > $OUT/raum.json 2>&1
say "gezählt $(tr -d '\n ' < $OUT/raum.json | cut -c1-200)"
$W stop > /dev/null 2>&1
sleep 3
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server' | ? { \$_.ProcessId -in (Get-NetTCPConnection -State Listen -LocalPort 7901 -ErrorAction SilentlyContinue | % OwningProcess) } | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
say "ENDE"
