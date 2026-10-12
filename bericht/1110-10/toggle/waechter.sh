#!/bin/bash
# 1110-10 Textur-Wächter in EINER Sitzung auf B (a0a05614), Wiese Gier 0: (1) welche Texturen wechseln je Bild (der Wächter
# zählt je Textur, wie oft er einen Refresh auslöst), (2) Wächter aus (`_diaetVorTextur` → false) gegen an, ABAB.
#   ./waechter.sh wiese
ORT=${1:-buehne}; POSE=${2:-ost}; FOLGE=${3:-pool}
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/abab-b542
WT=$BASE/abab-b542
V=$BASE/p3/bk542
OUT=$V/waechter-$ORT; mkdir -p $OUT; LOG=$OUT/fortschritt.log
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
E() { $W eval "$1" 2>&1 | tr -d '\n' | grep -o '"ergebnis":.*' | cut -c1-900; }
say "WAECHTER START $ORT"
E 'if (!window.__wv) window.__wv = r.constructor._diaetVorTextur; return 1' > /dev/null
ZAEHL='const orig = window.__wv; const z = (window.__wz = {}); let frames0 = r.state.renderer.info.render.frame; r.constructor._diaetVorTextur = function (obs, ro) { const a = orig(obs, ro); if (a) { const k = ro.getNodeBuilderState()._anazhGang; const n = (k ? k.texturen : []).map((t) => (t.value ? (t.value.name || "id" + t.value.id) + "@" + t.value.version : "-")).join(","); const key = (ro.object && ro.object.name ? ro.object.name : "?") + " | " + n.replace(/@\d+/g, ""); z[key] = (z[key] || 0) + 1; } return a; }; window.__wf0 = frames0; return 1'
E "$ZAEHL" > /dev/null
$W eval "$BL" > /dev/null
$W gpu-bank 60 --runden 1 > /dev/null
say "ZAEHLUNG (Refreshs durch den Wächter in 60+20 Bildern): $(E 'const z = window.__wz; return Object.entries(z).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => v + "× " + k).join(" ;; ")')"
E 'r.constructor._diaetVorTextur = window.__wv; return 1' > /dev/null
an() { E 'r.constructor._diaetVorTextur = window.__wv; return 1' > /dev/null; }
aus() { E 'r.constructor._diaetVorTextur = () => false; return 1' > /dev/null; }
for VAR in an aus an aus an aus an; do
  $VAR
  nvidia-smi --query-gpu=clocks.gr,temperature.gpu --format=csv,noheader,nounits -lms 500 > $OUT/smi.csv 2>/dev/null &
  SMI=$!
  B=$(bank)
  kill $SMI 2>/dev/null
  K=$(node $V/smi.cjs $OUT/smi.csv)
  say "waechter-$VAR bank $B takt $K"
done
an
stopp
say "WAECHTER ENDE"
