#!/bin/bash
# 1310-1 (1d): die Genesis zerlegt (GPU je Pass und Klasse, ABBA je Schalter) — M main bb554abf und T welle-m-e-torwurf, je
# zwei frische Boots (M T T M). Instrument abab-i543. Je Boot: dorf-aus, fenster, umstellen --ort genesis, buehne, Lauf voll
# (einschwingen + fps), Band (eingeschwungen), dann zerlegen --runden 6; Takt der ganzen Sitzung aus nvidia-smi.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/abab-i543; OUT=$BASE/p3/tor/zerleg; mkdir -p $OUT; LOG=$OUT/fortschritt.log
export WERKBANK_PORT=4490
W="node $INSTR/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() { $W stop > /dev/null 2>&1; sleep 2; powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match '[s]ave-server|[w]erkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1; powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match '[w]erkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1; powershell -NoProfile -c "Get-Process nvidia-smi -ErrorAction SilentlyContinue | Stop-Process -Force" >/dev/null 2>&1; sleep 3; }
for X in M1 T1 T2 M2; do
  case $X in M*) WT=$BASE/abab-b543;; T*) WT=$BASE/welle-m-e-torwurf;; esac
  stopp
  nvidia-smi --query-gpu=timestamp,clocks.gr,temperature.gpu,power.draw,clocks_throttle_reasons.active --format=csv,noheader,nounits -lms 500 > $OUT/$X-takt.csv 2>&1 &
  (cd $WT && PORT=4312 node save-server.js > $OUT/$X-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  soll=$(sha256sum $WT/porta-core.js | cut -c1-16); ist=$(curl -s http://localhost:4312/porta-core.js | sha256sum | cut -c1-16)
  if [ "$ist" != "$soll" ]; then say "$X SEITEN-WACHE ROT: porta-core $ist, soll $soll"; stopp; exit 3; fi
  say "$X Seite porta-core $ist"
  (cd $INSTR && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $OUT/$X-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/$X-werkbank.log 2>/dev/null && break; sleep 5; done
  $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
  $W fenster 1920 1080 > /dev/null
  $W umstellen --ort genesis > $OUT/$X-umstellen.txt 2>&1
  $W eval "return window.__buehne()" > /dev/null
  $W lauf 30 --ein 20 --ruhe 300 --tiere frei --regler voll > $OUT/$X-lauf.txt 2>&1
  $W band --ort genesis > $OUT/$X-band.txt 2>&1
  say "$X Lauf $(grep -o '"fps": [0-9.]*' $OUT/$X-lauf.txt | head -1) · Band $(grep -o 'GPU ms/Frame [0-9.]*' $OUT/$X-band.txt | head -1) · $(grep -o 'Befehle [0-9]*/' $OUT/$X-band.txt | head -1)"
  $W zerlegen --runden 6 --json "$(cd $OUT && pwd -W)/zerlegen-$X.json" > $OUT/$X-zerlegen.txt 2>&1
  say "$X zerlegen exit=$? $(grep -a -m3 -E 'Σ|Summe|Rest|Gesamt' $OUT/$X-zerlegen.txt | tr '\n' ' ' | cut -c1-220)"
done
stopp
say "ZERLEG ENDE"
