#!/bin/bash
# 1110-4: der Haus-Wurf im Takt EINER Sitzung (S6 03997b3f, Licht des Auges aus): gpu-bank 240×3 je Blick wie es ist · ohne
# bauWurf (die NUR-WURF-Stufe aus der Szene) · wieder wie es ist.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/abab-b540
WT=$BASE/takt-bisekt
OUT=$BASE/g540/haus; mkdir -p $OUT
export WERKBANK_PORT=4490
W="node $INSTR/scripts/werkbank.cjs"
stopp() { $W stop > /dev/null 2>&1; sleep 2; powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1; powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1; sleep 3; }
stopp
git -C $WT -c core.autocrlf=false checkout -q -- anazhRealm.js; git -C $WT -c core.autocrlf=false checkout -q --detach 03997b3f
sed -i 's/^        scene.add(augenLicht);$/        \/\/ MESS-PATCH 1110-4: das Licht des Auges bleibt aus der Szene/' $WT/anazhRealm.js
(cd $WT && PORT=4312 node save-server.js > $OUT/save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
(cd $INSTR && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $OUT/werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/werkbank.log 2>/dev/null && break; sleep 5; done
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
$W umstellen --ort wiese > /dev/null
$W eval "return window.__buehne()" > /dev/null
$W lauf 20 --ein 20 --regler voll --tiere halten > $OUT/lauf.txt 2>&1
BLICK='r.state.pitch = 0; for (let i = 0; i < 20; i++) { window.__wetterHalten(); if (window.__ortSchritt) window.__ortSchritt(); r._gameLoopTick(performance.now()); await new Promise((s) => setTimeout(s, 16)); } r.state.renderer.setAnimationLoop(null); return r.state.yaw;'
bank() { for g in 0 -0.88; do $W eval "r.state.yaw = $g; $BLICK" > /dev/null; $W gpu-bank 240 --runden 3 > $OUT/$1-bank$g.txt 2>&1; done; }
bank 1-wie
$W eval "let n = 0; const tris = []; r.state.scene.traverse((o) => { if (o.isMesh && /bauWurf/.test(o.name || '') && o.visible) { o.userData.__hausAus = true; o.visible = false; n++; } }); r.state.scene.traverse((o) => { if (o.isBundleGroup) o.needsUpdate = true; }); return n" > $OUT/aus.json 2>&1
bank 2-ohneBauWurf
$W eval "let n = 0; r.state.scene.traverse((o) => { if (o.userData && o.userData.__hausAus) { o.visible = true; delete o.userData.__hausAus; n++; } }); r.state.scene.traverse((o) => { if (o.isBundleGroup) o.needsUpdate = true; }); return n" > $OUT/an.json 2>&1
bank 3-wie
$W zaehlen > $OUT/zaehlen.txt 2>&1
stopp
git -C $WT -c core.autocrlf=false checkout -q -- anazhRealm.js; git -C $WT -c core.autocrlf=false checkout -q --detach 66005ca6
echo HAUS-ENDE
