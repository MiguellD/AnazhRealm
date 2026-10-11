#!/bin/bash
# 1110-4: die GPU-Mehrkosten von V18.540 je Merge der ersten Eltern-Linie be1d6e57..27e369d8 — das Licht des Auges ist in jedem
# Stand AUS (Mess-Patch im Mess-Checkout: `scene.add(augenLicht)` fällt; nie committet). Instrument EINS aus B (abab-b540).
# Gang 1 S0→S6, Gang 2 S6→S0 (je Stand eine Messfolge an der Wiese: lauf · gpu-bank Gier 0/−0,88 · band · profil),
# danach je Stand eine Sitzung: zerlegen + EIN Bild (Ausgabe-Pfad, TRAA-Phase und Himmels-Uhr fest).
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/abab-b540
WT=$BASE/takt-bisekt
OUT=$BASE/g540/lang; mkdir -p $OUT
LOG=$OUT/fortschritt.log
export WERKBANK_PORT=4490
W="node $INSTR/scripts/werkbank.cjs"
STAENDE=(be1d6e57 953186f4 9ecb874c 1c47714d 269ecfa8 b0bcb073 03997b3f)
NAMEN=(S0-main S1-pruefbuehne S2-egoschatten S3-haus S4-koerperbild S5-wasser S6-werkstatt)
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() {
  $W stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
stand() { # $1 = SHA, $2 = Name → Mess-Checkout + Patch + Seite :4312
  stopp
  git -C $WT -c core.autocrlf=false checkout -q -- anazhRealm.js 2>/dev/null
  git -C $WT -c core.autocrlf=false checkout -q --detach $1 || { say "$2 checkout ROT"; exit 3; }
  local n; n=$(grep -c "        scene.add(augenLicht);" $WT/anazhRealm.js)
  if [ "$n" = 1 ]; then sed -i 's/^        scene.add(augenLicht);$/        \/\/ MESS-PATCH 1110-4: das Licht des Auges bleibt aus der Szene/' $WT/anazhRealm.js; fi
  local rest; rest=$(grep -c "scene.add(augenLicht)" $WT/anazhRealm.js)
  (cd $WT && PORT=4312 node save-server.js > $OUT/$2-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  local ist; ist=$(curl -s http://localhost:4312/anazhRealm.js | sha256sum | cut -c1-12)
  say "$2 ($1) Seite $ist · Augen-Licht im Stand: $n · nach dem Patch in der Szene: $rest"
}
messfolge() { # $1 = Name, $2 = Gang
  (cd $INSTR && timeout 2700 node scripts/omen-messfolge.cjs --seite http://localhost:4312 --datei $OUT/$1-g$2.json > $OUT/$1-g$2.log 2>&1)
  local ec=$?
  local u; u=$(node -e "try { const j = require(process.argv[1]); console.log(j.urteil + ' | ' + (j.abbruch || '') + ' | ' + j.befunde.slice(0, 3).join(' ; ')); } catch (e) { console.log('KEIN-JSON'); }" $OUT/$1-g$2.json)
  say "$1 g$2 exit=$ec $u $(grep -aE 'gpu-bank Gier' $OUT/$1-g$2.log | sed 's/·.*//' | tr '\n' ' ' | cut -c1-140)"
}
BLICK='r.state.pitch = 0; for (let i = 0; i < 20; i++) { window.__wetterHalten(); if (window.__ortSchritt) window.__ortSchritt(); r._gameLoopTick(performance.now()); await new Promise((s) => setTimeout(s, 16)); } r.state.renderer.setAnimationLoop(null); return r.state.yaw;'
sitzungLang() { # $1 = Name, $2 = Gang
  local N=$1-l$2
  (cd $INSTR && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $OUT/$N-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/$N-werkbank.log 2>/dev/null && break; sleep 5; done
  $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
  $W fenster 1920 1080 > /dev/null
  $W umstellen --ort wiese > /dev/null
  $W eval "return window.__buehne()" > /dev/null
  $W lauf 20 --ein 20 --regler voll --tiere halten > $OUT/$N-lauf.txt 2>&1
  for g in 0 -0.88; do
    $W eval "r.state.yaw = $g; $BLICK" > /dev/null
    $W gpu-bank 240 --runden 3 > $OUT/$N-bank$g.txt 2>&1
  done
  $W eval "r.state.yaw = 0; $BLICK" > /dev/null
  $W zerlegen --runden 12 --json $OUT/$N-zerlegen.json > $OUT/$N-zerlegen.txt 2>&1
  local z; z=$(grep -aE '^(haupt|k0|post) ' $OUT/$N-zerlegen.txt | awk '{print $1, $2}' | tr '\n' ' ')
  local b; b=$(for g in 0 -0.88; do node -e "const t=require('fs').readFileSync(process.argv[1],'utf8');const j=JSON.parse(t.slice(t.indexOf('{')));process.stdout.write(String((j.ergebnis||j).gpuJeFrameMs)+' ')" $OUT/$N-bank$g.txt; done)
  say "$N bank0/bank-0.88 $b · zerlegen $z"
  stopp
}
say "1110-4 LANG START"
for i in 0 1 2 3 4 5 6; do stand ${STAENDE[$i]} ${NAMEN[$i]}; sitzungLang ${NAMEN[$i]} 1; sleep 20; done
for i in 6 5 4 3 2 1 0; do stand ${STAENDE[$i]} ${NAMEN[$i]}; sitzungLang ${NAMEN[$i]} 2; sleep 20; done
stopp
git -C $WT -c core.autocrlf=false checkout -q -- anazhRealm.js; git -C $WT -c core.autocrlf=false checkout -q --detach 66005ca6
say "1110-4 LANG ENDE"
