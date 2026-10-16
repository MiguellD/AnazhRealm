#!/bin/bash
# Bündel-4-Plus beim Namen: CPU-Profil Genesis Ego, A = d9d1db4e (main) gegen B = c03ea075, Folge A1 B1 A2 B2,
# EIN Instrument abab-pc03 (c03ea075). Je Boot: dorf-aus · fenster · umstellen genesis ego · buehne · 120 s · lauf 30 voll --ruhe ·
# profil 20 --regler voll --top 400 (Chrome-Profiler 200 µs, Selbst- und Gesamtzeit je Funktion). GPU-Schloss je Boot.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; H=$BASE/p3/k1610k2/profil-d9c0; L=$H/fortschritt.log; A=$BASE/abab-pd9d; B=$BASE/abab-pc03; INS=$BASE/abab-pc03
mkdir -p $H; . $BASE/p3/gpu-schloss.sh
say() { echo "$(date +%T) $*" | tee -a $L; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3; }
W="node $INS/scripts/werkbank.cjs"; export WERKBANK_PORT=4490
say "PROFIL START A=$(git -C $A log -1 --format=%h) B=$(git -C $B log -1 --format=%h) Instrument=$(git -C $INS log -1 --format=%h)"
for N in ${LAEUFE:-A1 B1 A2 B2}; do
  D=$H/$N; [ -f $D/profil.txt ] && { say "$N steht schon"; continue; }
  case $N in A*) WT=$A;; B*) WT=$B;; esac
  schloss_nehmen "omen-d9c0-profil $N"; stopp; mkdir -p $D/stand
  mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $D/stand/ 2>/dev/null
  (cd $WT && PORT=4312 node save-server.js > $D/save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
  (cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $D/werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $D/werkbank.log 2>/dev/null && break; sleep 5; done
  say "$N start"
  $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
  $W fenster 1920 1080 > /dev/null
  $W umstellen --ort genesis --sicht ego > $D/umstellen.txt 2>&1
  $W eval "return window.__buehne()" > /dev/null 2>&1
  sleep 120
  $W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei > $D/lauf.txt 2>&1
  $W profil 20 --regler voll --top 400 > $D/profil.txt 2>&1
  say "$N ende cpu $(node -e 'const t=require("fs").readFileSync(process.argv[1],"utf8");const j=JSON.parse(t.slice(t.indexOf("{")));console.log(JSON.stringify(j.cpuTaktMs))' $D/lauf.txt 2>/dev/null) profil $(grep -o '"gesampeltMs": [0-9]*\|"frames": [0-9]*' $D/profil.txt | tr '\n' ' ')"
  $W stop > /dev/null 2>&1; stopp
  schloss_loesen "omen-d9c0-profil $N"; sleep 45
done
say "PROFIL FERTIG"
