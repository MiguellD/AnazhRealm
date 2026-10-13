#!/bin/bash
# 1310-1 (1f): die Reihe der Region-Bündel in EINER Sitzung — WELT (torwurf: SCH=global-zuerst; main: SCH=wahl-zuerst), Ort genesis.
# Je Block: Schalter setzen, ein Aufwärm-Band (verworfen), drei Bänder, eine lange Bank (100×3), zuletzt ein Lauf unter Regler
# voll (fps, Frame p50 — die Kadenz am 120-Hz-Raster). Folge: G, dann ${RUNDEN:-3}× [null, G, l0-wirft, G, zwilling-weg, G].
# l0-wirft = der Zustand von Z (Stufe 0 wirft selbst, kein Zwilling) live. Takt je Band aus nvidia-smi (500 ms).
B=/c/Users/micha/Desktop/AnazhRealm-OMEN; INSTR=$B/abab-i543; WELT=${WELT:-$B/welle-m-e-torwurf}; SCH=${SCH:-global-zuerst}; OUT=${OUT:-$B/p3/tor/erst/s3}
mkdir -p $OUT; LOG=$OUT/fortschritt.log; CSV=$OUT/baender.csv
export WERKBANK_PORT=4490
say() { echo "$(date +%T) $*" | tee -a $LOG; }
ms() { date +%s%3N; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-Process nvidia-smi -ErrorAction SilentlyContinue | Stop-Process -Force" >/dev/null 2>&1
  sleep 3
}
wb() { (cd $INSTR && node scripts/werkbank.cjs "$@"); }
BLOCK=0
band() { # band <zustand> <idx>
  local t0=$(ms); wb band --ort genesis > $OUT/band-b$BLOCK-$2.txt 2>&1; local t1=$(ms)
  local g=$(grep -o 'GPU ms/Frame [0-9.]*' $OUT/band-b$BLOCK-$2.txt | head -1 | awk '{print $3}')
  local c=$(grep -o 'Befehle [0-9]*/' $OUT/band-b$BLOCK-$2.txt | head -1 | tr -dc 0-9)
  echo "$BLOCK,$1,$2,$t0,$t1,${g:-NaN},${c:-NaN},band" >> $CSV
  say "  b$BLOCK $1 #$2 GPU ${g:-?} · Befehle ${c:-?}"
}
bank() { # bank <zustand>
  local t0=$(ms); wb gpu-bank 100 --runden 3 > $OUT/bank-b$BLOCK.txt 2>&1; local t1=$(ms)
  local g=$(grep -o '"gpuJeFrameMs": *[0-9.]*' $OUT/bank-b$BLOCK.txt | head -1 | grep -o '[0-9.]*$')
  echo "$BLOCK,$1,bank,$t0,$t1,${g:-NaN},NaN,bank" >> $CSV
  say "  b$BLOCK $1 Bank 100×3 ${g:-?}"
}
lauf() { # lauf <zustand>: fps in der gpu-Spalte, Frame p50 in der befehle-Spalte
  local t0=$(ms); wb lauf 12 --ein 6 --ruhe 300 --tiere frei --regler voll > $OUT/lauf-b$BLOCK.txt 2>&1; local t1=$(ms)
  local f=$(grep -o '"fps": *[0-9.]*' $OUT/lauf-b$BLOCK.txt | head -1 | grep -o '[0-9.]*$')
  local p=$(node $B/p3/tor/erst/lauf-p50.cjs $OUT/lauf-b$BLOCK.txt)
  echo "$BLOCK,$1,lauf,$t0,$t1,${f:-NaN},${p:-NaN},lauf" >> $CSV
  say "  b$BLOCK $1 Lauf fps ${f:-?} · Frame p50 ${p:-?}"
}
block() { # block <zustand> <schalter-an|-> <schalter-aus|->
  BLOCK=$((BLOCK+1))
  [ "$3" != "-" ] && say "  aus: $(node $B/p3/tor/erst/schalter.cjs 4490 $3 aus)"
  [ "$2" != "-" ] && say "  an:  $(node $B/p3/tor/erst/schalter.cjs 4490 $2 an)"
  say "BLOCK $BLOCK $1"
  for i in 0 1 2 3; do band $1 $i; done
  bank $1
  lauf $1
}
stopp
echo "block,zustand,idx,t0,t1,gpu,befehle,art" > $CSV
nvidia-smi --query-gpu=timestamp,clocks.gr,temperature.gpu,power.draw,clocks_throttle_reasons.active --format=csv,noheader,nounits -lms 500 > $OUT/takt.csv 2>&1 &
(cd $WELT && PORT=4312 node save-server.js > $OUT/save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
(cd $INSTR && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $OUT/werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/werkbank.log 2>/dev/null && break; sleep 5; done
say "START $(grep -m1 'WERKBANK bereit' $OUT/werkbank.log | cut -c1-80) · Welt $WELT · anazhRealm.js $(curl -s http://localhost:4312/anazhRealm.js | sha256sum | cut -c1-16) · porta-core $(curl -s http://localhost:4312/porta-core.js | sha256sum | cut -c1-16)"
wb eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
wb fenster 1920 1080 > /dev/null
wb umstellen --ort genesis > $OUT/umstellen.txt 2>&1
wb eval "return window.__buehne()" > /dev/null
wb lauf 30 --ein 20 --ruhe 300 --tiere frei --regler voll > $OUT/lauf.txt 2>&1
say "eingeschwungen $(grep -o '"fps": [0-9.]*' $OUT/lauf.txt | head -1)"
block grund - -
for r in $(seq 1 ${RUNDEN:-3}); do
  block null reihe-null -;           block grund - reihe-null
  block $SCH $SCH -;                  block grund - $SCH
done
wb stop > /dev/null 2>&1
stopp
node $B/p3/tor/erst/auswertung.cjs $OUT > $OUT/urteil.txt 2>&1; ec=$?
say "SITZUNG ENDE · Urteil EXIT=$ec"
cat $OUT/urteil.txt >> $LOG
