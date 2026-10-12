#!/bin/bash
# 1110-10 Toggle des Boden-Stoffs in EINER Sitzung auf B (a0a05614): je Variante `methode _lichtPoolTerm` und `methode
# _buildPbrNodeMaterial --terrain` (baut den EINEN Boden-Stoff neu; jeder andere Stoff behält seinen Pool): wie · ohne Pool ·
# Pool 2 (A-Boden fällt: der Boden-Stoff von main baut in B nicht, sein Tausch setzte den Chunk-Stoff auf null). Je Variante Aufwärmen 120×2,
# drei Bänke 120×6, Takt (nvidia-smi 500 ms), Programme.
#   ./toggle.sh buehne|wiese [pose]
ORT=${1:-buehne}; POSE=${2:-ost}; FOLGE=${3:-pool}
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/abab-b542
WT=$BASE/abab-b542
V=$BASE/p3/bk542
OUT=$V/$ORT-$POSE-$FOLGE; mkdir -p $OUT; LOG=$OUT/fortschritt.log
export WERKBANK_PORT=4490
W="node $INSTR/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() { $W stop > /dev/null 2>&1; sleep 2; powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1; powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1; sleep 3; }
stopp
(cd $WT && PORT=4312 node save-server.js > $OUT/save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
say "Seite $(curl -s http://localhost:4312/anazhRealm.js | sha256sum | cut -c1-16) (soll 3960d575e001be8a)"
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
tausch() { $W methode _lichtPoolTerm --quelle "$V/$1.js" > /dev/null 2>&1; $W methode _buildPbrNodeMaterial --terrain --quelle "$V/$2.js" 2>&1 | tr -d "[:space:]" | grep -o "\"chunksNeu\":[0-9]*"; }
say "TOGGLE START $ORT $POSE"
if [ $FOLGE = pool ]; then VARS="wie ohnePool wie pool2 wie ohnePool wie pool2 wie ohnePool wie pool2 wie"; else VARS="wie ohneFern wie ohneZu wie ohneAlle wie ohneFern wie ohneZu wie ohneAlle wie ohneFern wie ohneZu wie ohneAlle wie"; fi
for VAR in $VARS; do
  case $VAR in wie) Q="b0-wie b0-wie";; ohnePool) Q="bP0-ohnePool b0-wie";; pool2) Q="bP2-pool2 b0-wie";; ohneFern) Q="b0-wie bF0-ohneFernKrone";; ohneZu) Q="b0-wie bZ0-ohneZuwendung";; ohneAlle) Q="bP0-ohnePool bX0-ohneAlle";; esac
  T=$(tausch $Q)
  if ! echo "$T" | grep -qE '"chunksNeu":[1-9]'; then say "$VAR TAUSCH-WACHE ROT: $T"; stopp; exit 4; fi
  nvidia-smi --query-gpu=clocks.gr,temperature.gpu --format=csv,noheader,nounits -lms 500 > $OUT/smi.csv 2>/dev/null &
  SMI=$!
  B=$(bank)
  kill $SMI 2>/dev/null
  K=$(node $V/smi.cjs $OUT/smi.csv)
  P=$(prog $VAR)
  say "$VAR $T bank $B takt $K prog $P"
done
stopp
say "TOGGLE ENDE"
