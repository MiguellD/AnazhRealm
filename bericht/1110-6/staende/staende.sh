#!/bin/bash
# 1110-6 Abnahme: die Merge-Stände von V18.540 an der Bühne (S1..S6; S0 = main kennt die Bühne nicht), das Licht des Auges
# aus (Mess-Patch im Mess-Checkout, nie committet). Je Stand zwei frische Boots `omen-messfolge --ort buehne` (vor S1→S6, rück
# S6→S1). Danach der Haus-Wurf in EINER Sitzung auf S6: ein Haus (haus_griechisch, Fachwerk-Gesetzbuch) im Blick der Pose ost (fern, NUR-WURF-Stufe),
# Bank mit Haus · ohne bauWurf · mit.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/welle-m-messort-buehne
WT=$BASE/takt-bisekt
OUT=$BASE/mb/staende; mkdir -p $OUT; LOG=$OUT/fortschritt.log
export WERKBANK_PORT=4490
W="node $INSTR/scripts/werkbank.cjs"
STAENDE=(953186f4 9ecb874c 1c47714d 269ecfa8 b0bcb073 03997b3f)
NAMEN=(S1-pruefbuehne S2-egoschatten S3-haus S4-koerperbild S5-wasser S6-werkstatt)
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() {
  $W stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
stand() {
  stopp
  git -C $WT -c core.autocrlf=false checkout -q -- anazhRealm.js 2>/dev/null
  git -C $WT -c core.autocrlf=false checkout -q --detach $1 || { say "$2 checkout ROT"; exit 3; }
  local n; n=$(grep -c "        scene.add(augenLicht);" $WT/anazhRealm.js)
  [ "$n" = 1 ] && sed -i 's/^        scene.add(augenLicht);$/        \/\/ MESS-PATCH 1110-6: das Licht des Auges bleibt aus der Szene/' $WT/anazhRealm.js
  (cd $WT && PORT=4312 node save-server.js > $OUT/$2-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  say "$2 ($1) Augen-Licht im Stand: $n · in der Szene nach dem Patch: $(grep -c 'scene.add(augenLicht)' $WT/anazhRealm.js)"
}
mf() {
  (cd $INSTR && timeout 1800 node scripts/omen-messfolge.cjs --ort buehne --seite http://localhost:4312 --datei $OUT/$1-$2.json > $OUT/$1-$2.log 2>&1)
  say "$1-$2 exit=$? $(grep -aE 'gpu-bank Pose' $OUT/$1-$2.log | sed 's/(.*//; s/gpu-bank Pose //; s/ ms je Frame//' | tr -s ' ' | tr '\n' ' ')"
}
say "1110-6 STAENDE START"
for i in 0 1 2 3 4 5; do stand ${STAENDE[$i]} ${NAMEN[$i]}; mf ${NAMEN[$i]} v; sleep 20; done
for i in 5 4 3 2 1 0; do stand ${STAENDE[$i]} ${NAMEN[$i]}; mf ${NAMEN[$i]} r; sleep 20; done
# der Haus-Wurf auf S6
stand 03997b3f S6-haus
(cd $INSTR && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $OUT/haus-werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/haus-werkbank.log 2>/dev/null && break; sleep 5; done
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
$W umstellen --ort buehne --pose ost > $OUT/haus-umstellen.txt 2>&1
$W eval "return window.__buehne()" > /dev/null
$W eval "let x = 400; const z = 25; while (x > 340 && !(r._voxelSurfaceY(x, z) > r.state.waterLevel + 2)) x -= 10; const e = r.spawnArchitecture('haus_griechisch', { x, y: r._voxelSurfaceY(x, z) + 0.5, z }, { seed: 7 }); window.__hausE = e; for (let i = 0; i < 600 && !(e && r._archIsRendered(e)); i++) { window.__buehne(); window.__ortSchritt(); r._gameLoopTick(performance.now()); await new Promise((s) => setTimeout(s, 50)); } for (let i = 0; i < 40; i++) { window.__ortSchritt(); r._gameLoopTick(performance.now()); await new Promise((s) => setTimeout(s, 30)); } r.state.renderer.setAnimationLoop(null); let w = 0; r.state.scene.traverse((o) => { if (o.isMesh && /bauWurf/.test(o.name || '') && o.visible) w++; }); return { haus: !!e, x, hoehe: +r._voxelSurfaceY(x, z).toFixed(1), typ: e && e.type, gezeichnet: e && r._archIsRendered(e), bauWurf: w };" > $OUT/haus-gesetzt.json 2>&1
BL='r.state.pitch = 0; for (let i = 0; i < 20; i++) { window.__wetterHalten(); window.__ortSchritt(); r._gameLoopTick(performance.now()); await new Promise((s) => setTimeout(s, 16)); } r.state.renderer.setAnimationLoop(null); return 1;'
bank() { $W eval "$BL" > /dev/null; $W gpu-bank 120 --runden 2 > /dev/null; for i in 1 2 3; do $W gpu-bank 120 --runden 6 2>&1 | grep -o '"gpuJeFrameMs": [0-9.]*' | cut -d' ' -f2; done | tr '\n' ' '; }
say "haus mit        $(bank)"
$W eval "let n = 0; r.state.scene.traverse((o) => { if (o.isMesh && /bauWurf/.test(o.name || '') && o.visible) { o.userData.__hausAus = true; o.visible = false; n++; } }); r.state.scene.traverse((o) => { if (o.isBundleGroup) o.needsUpdate = true; }); return n" > $OUT/haus-aus.json 2>&1
say "haus ohne Wurf  $(bank)  ($(grep -o '"ergebnis": [0-9]*' $OUT/haus-aus.json))"
$W eval "r.state.scene.traverse((o) => { if (o.userData && o.userData.__hausAus) { o.visible = true; delete o.userData.__hausAus; } }); r.state.scene.traverse((o) => { if (o.isBundleGroup) o.needsUpdate = true; }); return 1" > /dev/null
say "haus mit        $(bank)"
stopp
git -C $WT -c core.autocrlf=false checkout -q -- anazhRealm.js; git -C $WT -c core.autocrlf=false checkout -q --detach 66005ca6
say "1110-6 STAENDE ENDE"
