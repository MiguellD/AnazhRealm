#!/bin/bash
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/welle-m-messort-buehne
WT=$BASE/takt-bisekt
OUT=$BASE/mb/schalter; mkdir -p $OUT; LOG=$OUT/fortschritt.log
export WERKBANK_PORT=4490
W="node $INSTR/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() { $W stop > /dev/null 2>&1; sleep 2; powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1; powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1; sleep 3; }
stopp
git -C $WT -c core.autocrlf=false checkout -q -- anazhRealm.js; git -C $WT -c core.autocrlf=false checkout -q --detach 03997b3f
sed -i 's/^        scene.add(augenLicht);$/        \/\/ MESS-PATCH 1110-6: das Licht des Auges bleibt aus der Szene/' $WT/anazhRealm.js
LICHT='const L = []; r.state.scene.traverse((o) => { if (o.isLight) { let v = true; for (let p = o; p; p = p.parent) if (!p.visible) v = false; L.push([o.type, o.name || "-", +o.intensity.toFixed(3), v, o.castShadow ? "wurf" : ""].join(":")); } }); const s = r.state; const m = s.chunkSaetze && s.chunkSaetze.get("boden"); return { lichter: L, hoehle: !!(m && m.hoehle), himmelAmAuge: s.himmelAmAuge, augenLichtImGraph: !!(s.augenLicht && s.augenLicht.parent) };'
BL='r.state.pitch = 0; for (let i = 0; i < 20; i++) { window.__wetterHalten(); window.__ortSchritt(); r._gameLoopTick(performance.now()); await new Promise((s) => setTimeout(s, 16)); } r.state.renderer.setAnimationLoop(null); return 1;'
for k in 1 2 3; do
  stopp
  (cd $WT && PORT=4312 node save-server.js > $OUT/d$k-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  (cd $INSTR && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $OUT/d$k-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/d$k-werkbank.log 2>/dev/null && break; sleep 5; done
  $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
  $W fenster 1920 1080 > /dev/null
  $W umstellen --ort buehne --pose ost > $OUT/d$k-umstellen.txt 2>&1
  $W eval "return window.__buehne()" > /dev/null
  $W eval "$BL" > /dev/null; $W gpu-bank 120 --runden 2 > /dev/null
  B=$(for i in 1 2 3; do $W gpu-bank 120 --runden 6 2>&1 | grep -o '"gpuJeFrameMs": [0-9.]*' | cut -d' ' -f2; done | tr '\n' ' ')
  $W eval "$LICHT" > $OUT/d$k-licht.json 2>&1
  $W zaehlen > $OUT/d$k-zaehlen.txt 2>&1
  $W zerlegen --runden 12 --json $OUT/d$k-zerlegen.json > $OUT/d$k-zerlegen.txt 2>&1
  say "d$k bank $B $(tr -d '\n ' < $OUT/d$k-licht.json | grep -o '"ergebnis":{.*}' | cut -c1-330)"
done
stopp
git -C $WT -c core.autocrlf=false checkout -q -- anazhRealm.js; git -C $WT -c core.autocrlf=false checkout -q --detach 66005ca6
say "SCHALTER ENDE"
