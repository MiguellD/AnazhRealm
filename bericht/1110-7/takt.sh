#!/bin/bash
# 1110-7: ist der hohe Modus der GPU-Takt? Dieselbe Seite (S3 1c47714d), zwei Sitzungen (gleich warm · nach 3 min Ruhe), je drei
# Bänke an ost, dabei nvidia-smi je 0,5 s (Takt, Speicher-Takt, Temperatur, Leistung, Drossel-Gründe).
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/welle-m-messort-buehne
WT=$BASE/takt-bisekt
OUT=$BASE/p3/bk/takt; mkdir -p $OUT; LOG=$OUT/fortschritt.log
export WERKBANK_PORT=4490
W="node $INSTR/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() { $W stop > /dev/null 2>&1; sleep 2; powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1; powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1; sleep 3; }
BL='r.state.pitch = 0; for (let i = 0; i < 20; i++) { window.__wetterHalten(); window.__ortSchritt(); r._gameLoopTick(performance.now()); await new Promise((s) => setTimeout(s, 16)); } r.state.renderer.setAnimationLoop(null); return 1;'
git -C $WT -c core.autocrlf=false checkout -q -- anazhRealm.js; git -C $WT -c core.autocrlf=false checkout -q --detach 1c47714d
for k in warm kalt; do
  stopp
  if [ $k = kalt ]; then say "Ruhe 180 s $(nvidia-smi --query-gpu=temperature.gpu,clocks.gr,power.draw,pstate --format=csv,noheader)"; sleep 180; fi
  (cd $WT && PORT=4312 node save-server.js > $OUT/$k-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  (cd $INSTR && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $OUT/$k-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/$k-werkbank.log 2>/dev/null && break; sleep 5; done
  $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
  $W fenster 1920 1080 > /dev/null
  $W umstellen --ort buehne --pose ost > /dev/null 2>&1
  $W eval "return window.__buehne()" > /dev/null
  $W eval "$BL" > /dev/null; $W gpu-bank 120 --runden 2 > /dev/null
  nvidia-smi --query-gpu=timestamp,temperature.gpu,clocks.gr,clocks.mem,power.draw,clocks_throttle_reasons.active --format=csv,noheader -lms 500 > $OUT/$k-smi.csv 2>/dev/null &
  SMI=$!
  B=$(for i in 1 2 3; do $W gpu-bank 120 --runden 6 2>&1 | grep -o '"gpuJeFrameMs": [0-9.]*' | cut -d' ' -f2; done | tr '\n' ' ')
  kill $SMI 2>/dev/null
  S=$(awk -F', ' '{t+=$2; c+=$3; m+=$4; p+=$5; n++} END {printf "Temp %.0f Takt %.0f MHz Speicher %.0f MHz Leistung %.1f W (n=%d)", t/n, c/n, m/n, p/n, n}' $OUT/$k-smi.csv)
  say "$k bank $B · $S · Drossel $(cut -d',' -f6 $OUT/$k-smi.csv | sort | uniq -c | tr '\n' ' ')"
done
stopp
git -C $WT -c core.autocrlf=false checkout -q -- anazhRealm.js; git -C $WT -c core.autocrlf=false checkout -q --detach 66005ca6
say "TAKT ENDE"
