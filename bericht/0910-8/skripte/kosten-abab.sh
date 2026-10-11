#!/bin/bash
# 0910-8 Kosten der Fern-Krone im Boden-Stoff: Toggle in EINER Sitzung an der Bühne (Pose ost), Seite und Instrument
# welle-m-weisse-masse. `werkbank methode _buildPbrNodeMaterial --terrain --quelle <Variante>`: k0 der Kopf, k1 ohne
# `_fernKroneNahMisch` (`_alb = _geo`). Je Variante Aufwärmen 120×2, drei Bänke 120×6, Takt je Variante, zaehlen.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/welle-m-weisse-masse
WT=$INSTR
V=$BASE/p3/wm2/kosten
OUT=$V/abab; mkdir -p $OUT; LOG=$OUT/fortschritt.log
export WERKBANK_PORT=4490
W="node $INSTR/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() { $W stop > /dev/null 2>&1; sleep 2; powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1; powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1; sleep 3; }
stopp
(cd $WT && PORT=4312 node save-server.js > $OUT/save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
(cd $INSTR && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $OUT/werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/werkbank.log 2>/dev/null && break; sleep 5; done
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
$W umstellen --ort buehne --pose ost > $OUT/umstellen.txt 2>&1
$W eval "return window.__buehne()" > /dev/null
BL='r.state.pitch = 0; for (let i = 0; i < 20; i++) { window.__wetterHalten(); window.__ortSchritt(); r._gameLoopTick(performance.now()); await new Promise((s) => setTimeout(s, 16)); } r.state.renderer.setAnimationLoop(null); return 1;'
bank() { $W eval "$BL" > /dev/null; $W gpu-bank 120 --runden 2 > /dev/null; for i in 1 2 3; do $W gpu-bank 120 --runden 6 2>&1 | grep -o '"gpuJeFrameMs": [0-9.]*' | cut -d' ' -f2; done | tr '\n' ' '; }
prog() { $W zaehlen > $OUT/$1-zaehlen.txt 2>&1; node -e "const t=require('fs').readFileSync(process.argv[1],'utf8');const j=JSON.parse(t.slice(t.indexOf('{')));const p=(j.ergebnis||j).programme;console.log(p.vertex+'/'+p.fragment+'/'+p.familien+'/'+p.pipelines)" $OUT/$1-zaehlen.txt; }
tausch() { $W methode _buildPbrNodeMaterial --terrain --quelle "$V/$1.js" 2>&1 | tr -d '\n ' | grep -o '"chunksNeu":[0-9]*'; }
karte() { $W eval "const k = window.anazhRealm.state.fernKroneNah; return k ? [k.U.bereit.value, k.job ? k.job.i : null] : null;" 2>&1 | tr -d '\n ' | grep -o '"ergebnis":[^}]*'; }
say "ABAB START"
for VAR in k0-kopf k1-ohneMisch k0-kopf k1-ohneMisch k0-kopf k1-ohneMisch k0-kopf; do
  T=$(tausch $VAR)
  nvidia-smi --query-gpu=clocks.gr,temperature.gpu --format=csv,noheader,nounits -lms 500 > $OUT/smi.csv 2>/dev/null &
  SMI=$!
  B=$(bank)
  kill $SMI 2>/dev/null
  K=$(node $BASE/p3/bk/smi.cjs $OUT/smi.csv)
  P=$(prog $VAR)
  say "$VAR  tausch $T  bank $B  takt $K  prog $P  karte $(karte)"
done
stopp
say "ABAB ENDE"
