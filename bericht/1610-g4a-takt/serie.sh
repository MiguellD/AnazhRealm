#!/bin/bash
# G4a CPU-Takt auf der GTX (Koordinator 16.10.), v2: A = integ 1185091c gegen B = integ cee33f91 (G4a Gruppen-Geburt: Rudel und Herden aus
# tetrapoda herde.wurf), Genesis Ego und Wiese Ego, je A1 B1 A2 B2; EIN Instrument (B-Kopf abab-pcee). Je Boot: dorf-aus · fenster ·
# umstellen · buehne · 120 s Einschwingen · lauf 30 --ein 20 --ruhe 300 voll (wie omen-messfolge: misst erst, wenn die Welt 3 s ruht) ·
# Tiere (window.__tierZahl der Werkbank) · takt 300 · Tiere. v1 (Ordner v1/) maß ohne --ruhe mitten im Streaming. GPU-Schloss je Boot.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; H=$BASE/p3/k1610g4; L=$H/fortschritt.log; A=$BASE/abab-p118; B=$BASE/abab-pcee; INS=$B
. $BASE/p3/gpu-schloss.sh
say() { echo "$(date +%T) $*" | tee -a $L; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge|eine-welt' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3; }
gpu() { nvidia-smi --query-gpu=temperature.gpu,clocks.gr,pstate,clocks_throttle_reasons.active --format=csv,noheader 2>/dev/null | tr -d '\n'; }
until grep -q "S5-REIHE FERTIG" $BASE/p3/k1610v/s5-reihe.log 2>/dev/null; do sleep 30; done
export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"
say "G4a v2 START A=$(git -C $A log -1 --format=%h) B=$(git -C $B log -1 --format=%h) Instrument=$(git -C $INS log -1 --format=%h)"
for K in g-ego w-ego; do
  case $K in w-*) ORT=wiese;; g-*) ORT=genesis;; esac
  for N in A1 B1 A2 B2; do
    NAME=$K-$N; D=$H/$NAME; [ -f $D/takt.txt ] && { say "$NAME steht schon"; continue; }
    case $N in A*) WT=$A;; B*) WT=$B;; esac
    schloss_nehmen "omen-g4a $NAME"; stopp; mkdir -p $D/stand
    mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $D/stand/ 2>/dev/null
    (cd $WT && PORT=4312 node save-server.js > $D/save.log 2>&1 &)
    for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
    (cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $D/werkbank.log 2>&1 &)
    for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $D/werkbank.log 2>/dev/null && break; sleep 5; done
    say "$NAME start gpu[$(gpu)]"
    $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
    $W fenster 1920 1080 > /dev/null
    $W umstellen --ort $ORT --sicht ego > $D/umstellen.txt 2>&1
    $W eval "return window.__buehne()" > /dev/null 2>&1
    sleep 120
    $W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei > $D/lauf.txt 2>&1
    $W eval "return window.__tierZahl ? window.__tierZahl() : null" > $D/tiere-vor.txt 2>&1
    $W takt 300 > $D/takt.txt 2>&1
    $W eval "return window.__tierZahl ? window.__tierZahl() : null" > $D/tiere-nach.txt 2>&1
    say "$NAME ende gpu[$(gpu)] cpu $(node -e 'const t=require("fs").readFileSync(process.argv[1],"utf8");const j=JSON.parse(t.slice(t.indexOf("{")));console.log(JSON.stringify(j.cpuTaktMs))' $D/lauf.txt 2>/dev/null) tiere $(tr -d '\n ' < $D/tiere-vor.txt | grep -o '"gesamt":[0-9]*' | head -1)"
    $W stop > /dev/null 2>&1; stopp
    schloss_loesen "omen-g4a $NAME"; sleep 60
  done
done
say "G4a v2 FERTIG"
