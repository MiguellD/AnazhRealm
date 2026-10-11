#!/bin/bash
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/welle-m-messort-buehne
OUT=$BASE/mb/ring; mkdir -p $OUT
export WERKBANK_PORT=4490
W="node $INSTR/scripts/werkbank.cjs"
stopp() { $W stop > /dev/null 2>&1; sleep 2; powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1; powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1; sleep 3; }
stopp
(cd $INSTR && PORT=4312 node save-server.js > $OUT/save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
(cd $INSTR && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $OUT/werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/werkbank.log 2>/dev/null && break; sleep 5; done
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
$W umstellen --ort buehne --pose s5-bucht > $OUT/umstellen.txt 2>&1
$W eval "return window.__buehne()" > /dev/null
# hin: Spieler an (x, z), Blick auf (bx, bz); einschwingen, bis der Chunk-Bestand 15 Takte ruht; die Tore zählen
HIN='const [x, z, bx, bz] = ARGS; const st = r.state; st.playerMesh.position.set(x, r._voxelSurfaceY(x, z) + 1.8, z); st.yaw = Math.atan2(bx - x, bz - z); st.pitch = 0; let stabil = 0, last = -1, t = 0; while (t < 600) { window.__buehne(); window.__wetterHalten(); window.__ortSchritt(); r._gameLoopTick(performance.now()); t++; const n = st.voxelChunks.size; if (n === last) stabil++; else { stabil = 0; last = n; } if (t >= 40 && stabil >= 15) break; await new Promise((s) => setTimeout(s, 30)); } st.renderer.setAnimationLoop(null); let tore = 0; st.scene.traverse((o) => { if (o.isMesh && o.visible) { let k = ""; try { k = r._taeterKlasse(o); } catch (_e) {} if (/^f:(drachentor|maurentor|verkalkt|maschine|kathedrale|ruine|geisttor):/.test(k)) tore++; } }); return { chunks: last, takte: t, tore };'
bank() { $W gpu-bank 60 --runden 1 > /dev/null; for i in 1 2; do $W gpu-bank 120 --runden 6 2>&1 | grep -o '"gpuJeFrameMs": [0-9.]*' | cut -d' ' -f2; done | tr '\n' ' '; }
hin() { $W eval "const ARGS = [$1]; $HIN" 2>&1 | tr -d '\n ' | grep -o '"ergebnis":{[^}]*}'; }
for runde in vor nach; do
  for P in "300, 0, 420, 0" "-300, 0, -420, 0" "0, -260, 0, -380" "0, -140, 0, -170"; do
    echo "$runde [$P] $(hin "$P") bank $(bank)"
  done
  if [ $runde = vor ]; then echo "zum Ring: $(hin '0, 0, 0, 148')"; for i in 1 2 3; do echo "  Ring-Takt $i: $(hin '0, 0, 0, 148')"; done; fi
done
stopp
