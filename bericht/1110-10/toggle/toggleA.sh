#!/bin/bash
# 1110-10 Probe auf A (main 2c8deda9) in EINER Sitzung: bank wie gebootet, dann der Boden-Stoff mit A-s EIGENER Methode neu
# gebaut (ein neuer Stoff bindet seine Daten-Bilder frisch: Wege-Karte, Kronen-Streu) — springt die Bank auf das Mass von B,
# ist der Abstand der Upload der Daten-Bilder (cf9d8395), nicht neuer Code.
#   ./toggleA.sh buehne|wiese [pose]
ORT=${1:-buehne}; POSE=${2:-ost}
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/abab-i542
WT=$BASE/abab-b541
V=$BASE/p3/bk542
OUT=$V/A-$ORT-$POSE; mkdir -p $OUT; LOG=$OUT/fortschritt.log
export WERKBANK_PORT=4490
W="node $INSTR/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() { $W stop > /dev/null 2>&1; sleep 2; powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1; powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1; sleep 3; }
stopp
(cd $WT && PORT=4312 node save-server.js > $OUT/save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
say "Seite $(curl -s http://localhost:4312/anazhRealm.js | sha256sum | cut -c1-16) (soll 6ad641672bb635be)"
(cd $INSTR && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $OUT/werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/werkbank.log 2>/dev/null && break; sleep 5; done
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
if [ $ORT = buehne ]; then $W umstellen --ort buehne --pose $POSE > $OUT/umstellen.txt 2>&1; else $W umstellen --ort wiese > $OUT/umstellen.txt 2>&1; fi
$W eval "return window.__buehne()" > /dev/null
[ $ORT = wiese ] && $W eval "r.state.yaw = 0; r.state.pitch = 0; return 1" > /dev/null
BL='r.state.pitch = 0; for (let i = 0; i < 20; i++) { window.__wetterHalten(); window.__ortSchritt(); r._gameLoopTick(performance.now()); await new Promise((s) => setTimeout(s, 16)); } r.state.renderer.setAnimationLoop(null); return 1;'
bank() { $W eval "$BL" > /dev/null; $W gpu-bank 120 --runden 2 > /dev/null; for i in 1 2 3; do $W gpu-bank 120 --runden 6 2>&1 | grep -o '"gpuJeFrameMs": [0-9.]*' | cut -d' ' -f2; done | tr '\n' ' '; }
prog() { $W zaehlen > $OUT/$1-zaehlen.txt 2>&1; node -e "const t=require('fs').readFileSync(process.argv[1],'utf8');const j=JSON.parse(t.slice(t.indexOf('{')));const p=(j.ergebnis||j).programme;console.log(p.vertex+'/'+p.fragment+'/'+p.familien+'/'+p.pipelines)" $OUT/$1-zaehlen.txt; }
tausch() { $W methode _buildPbrNodeMaterial --terrain --quelle "$V/a0-wie.js" 2>&1 | tr -d "[:space:]" | grep -o "\"chunksNeu\":[0-9]*"; }
say "TOGGLE START $ORT $POSE"
for VAR in gebootet neu1 neu2 neu3; do
  T=""; [ $VAR != gebootet ] && T=$(tausch)
  nvidia-smi --query-gpu=clocks.gr,temperature.gpu --format=csv,noheader,nounits -lms 500 > $OUT/smi.csv 2>/dev/null &
  SMI=$!
  B=$(bank)
  kill $SMI 2>/dev/null
  K=$(node $V/smi.cjs $OUT/smi.csv)
  P=$(prog $VAR)
  say "A $VAR $T bank $B takt $K prog $P"
done
stopp
say "TOGGLE ENDE"
