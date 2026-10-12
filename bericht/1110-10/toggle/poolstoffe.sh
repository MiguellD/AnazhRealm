#!/bin/bash
# 1110-10 Der Licht-Pool (K11) in JEDEM Stoff außer dem Boden, in EINER Sitzung auf B (Wiese Gier 0): je Stoff mit
# userData.lichtPool === true wird emissiveNode = em.add(pool) getauscht — aus: em (der linke Operand), pool2: em + der Term mit 2
# Plätzen (`_lichtPoolTerm` aus bP2, himmel null), wie: das Original; je Wechsel needsUpdate (neues Programm).
#   ./poolstoffe.sh wiese
ORT=${1:-buehne}; POSE=${2:-ost}; FOLGE=${3:-pool}
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/abab-b542
WT=$BASE/abab-b542
V=$BASE/p3/bk542
OUT=$V/poolstoffe-$ORT; mkdir -p $OUT; LOG=$OUT/fortschritt.log
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
E() { $W eval "$1" 2>&1 | tr -d '\n' | grep -o '"ergebnis":.*' | cut -c1-600; }
say "POOLSTOFFE START $ORT"
$W lauf 10 --ein 30 --ruhe 300 --tiere frei > $OUT/lauf.txt 2>&1
$W methode _lichtPoolTerm --quelle "$V/bP2-pool2.js" > /dev/null 2>&1
SAMMLE='const boden = r.state.voxelChunkMaterial; const M = new Set(); r.state.scene.traverse((o) => { const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []; for (const m of ms) if (m && m.userData && m.userData.lichtPool === true && m !== boden && m.emissiveNode) { const e = m.emissiveNode; const op = e.isVarNode ? e.node : e; if (op && op.isOperatorNode && op.op === "+" && op.aNode) M.add(m); } }); window.__pm = [...M]; if (!window.__pmOrig) { window.__pmOrig = new Map(); } for (const m of window.__pm) if (!window.__pmOrig.has(m)) window.__pmOrig.set(m, m.emissiveNode); const arten = {}; for (const m of window.__pm) { const k = (m.userData.foundryKind || m.name || m.type); arten[k] = (arten[k] || 0) + 1; } return { stoffe: window.__pm.length, arten };'
say "SAMMLUNG $(E "$SAMMLE")"
setz() { E "$SAMMLE" > /dev/null; E "const Te = THREE.TSL; const atmo = r._ensureAtmoUniforms(); let n = 0; for (const [m, orig] of window.__pmOrig) { const em = (orig.isVarNode ? orig.node : orig).aNode; m.emissiveNode = '$1' === 'wie' ? orig : '$1' === 'aus' ? em : em.add(r._lichtPoolTerm(Te, atmo, null)); m.needsUpdate = true; n++; } return n;" ; }
for VAR in wie aus wie pool2 wie aus wie pool2 wie aus wie pool2 wie; do
  N=$(setz $VAR)
  $W eval "$BL" > /dev/null; $W gpu-bank 120 --runden 2 > /dev/null
  nvidia-smi --query-gpu=clocks.gr,temperature.gpu --format=csv,noheader,nounits -lms 500 > $OUT/smi.csv 2>/dev/null &
  SMI=$!
  B=$(bank)
  kill $SMI 2>/dev/null
  K=$(node $V/smi.cjs $OUT/smi.csv)
  P=$(prog $VAR)
  say "$VAR stoffe $N bank $B takt $K prog $P"
done
setz wie > /dev/null
stopp
say "POOLSTOFFE ENDE"
