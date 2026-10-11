#!/bin/bash
# 1110-9: die Täter des CPU-Takts je Ort (eigene Sitzung, Seite und Instrument e-mess): takt (CPU je Loop-Subsystem) und profil
# (Funktionen unter Regler voll), dazu zaehlen und puffer.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/e-mess
OUT=$BASE/e1109/taeter; mkdir -p $OUT
export WERKBANK_PORT=4490
W="node $INSTR/scripts/werkbank.cjs"
stopp() {
  $W stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
for ORT in genesis wiese; do
  stopp
  (cd $INSTR && PORT=4312 node save-server.js > $OUT/$ORT-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  (cd $INSTR && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $OUT/$ORT-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/$ORT-werkbank.log 2>/dev/null && break; sleep 5; done
  $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
  $W fenster 1920 1080 > /dev/null
  $W umstellen --ort $ORT > $OUT/$ORT-umstellen.txt 2>&1
  $W eval "return window.__buehne()" > /dev/null
  $W lauf 30 --ein 20 --ruhe 300 --tiere frei --regler voll > $OUT/$ORT-lauf.txt 2>&1
  $W profil 12 --regler voll --top 60 > $OUT/$ORT-profil.txt 2>&1
  $W takt 300 > $OUT/$ORT-takt.txt 2>&1
  $W zaehlen > $OUT/$ORT-zaehlen.txt 2>&1
  $W puffer --top 30 > $OUT/$ORT-puffer.txt 2>&1
  echo "$ORT gemessen $(date +%T)"
done
stopp
echo TAETER-ENDE
