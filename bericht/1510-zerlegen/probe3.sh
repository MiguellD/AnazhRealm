#!/bin/bash
# Probe 3 (Bündel-Befund Genesis Ego, fps 78,4 → 74,0 bei gleicher Bank und gleichem Loop-Bau): tragen K60s Werk-Fäden den
# Mehrdurchsatz? (1) B a19ca615 in EINER Welt an Genesis Ego: die Helfer-Fäden ruhen (`h.bereit = false`, die Pumpe nimmt nur
# das Werk) oder arbeiten (bereit + Pumpe), ABBA an · aus · aus · an, je lauf 20 (Regler voll, freie Tiere), dazu je Lauf die
# CPU-Zeit je Chrome-Prozess (cpu-zeit.ps1) und die Foundry-Schlange. (2) A 0bbee8fc in einer Sitzung, zwei Läufe mit
# CPU-Zeit (A hat keine Helfer). EIN Instrument abab-pe8a. Unter dem GPU-Schloss.
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1510z; R=/c/Users/micha/Desktop/AnazhRealm-OMEN; L=$H/fortschritt.log; D=$H/probe3
INS=$R/abab-pe8a; export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"; mkdir -p $D
. $R/p3/gpu-schloss.sh; schloss_nehmen "omen-zerlegen probe3"; trap 'schloss_loesen "omen-zerlegen probe3"' EXIT
stopp() { $W stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1; sleep 2; }
cpu() { powershell -NoProfile -ExecutionPolicy Bypass -File "C:\\Users\\micha\\Desktop\\AnazhRealm-OMEN\\p3\\k1510z\\cpu-zeit.ps1"; }
ZUSTAND='const f = r._foundry; const im = {}; if (f && f.pending) for (const k of f.pending.keys()) { const b = r._foundryBahn(k); im[b] = (im[b] || 0) + 1; } return { helfer: f && f.helfer ? f.helfer.map((h) => ({ k: h.k, bereit: h.bereit })) : null, warte: f && f.warte ? f.warte.length : null, imFlug: im };'
AN='const f = r._foundry; for (const h of f.helfer || []) h.bereit = true; r._foundryPumpe(f); return (f.helfer || []).length;'
AUS='const f = r._foundry; for (const h of f.helfer || []) h.bereit = false; return (f.helfer || []).length;'
boot() { WT=$1; N=$2; stopp
  mkdir -p $D/stand/$N; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $D/stand/$N/ 2>/dev/null
  (cd $WT && PORT=4312 node save-server.js > $D/$N-server.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
  (cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $D/$N-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $D/$N-werkbank.log 2>/dev/null && break; sleep 5; done
  $W fenster 1920 1080 > /dev/null
  $W umstellen --ort genesis --sicht ego > $D/$N-umstellen.txt 2>&1
  $W lauf 10 --ein 30 --ruhe 300 --regler voll --tiere frei > $D/$N-ein.txt 2>&1; }
messe() { # $1 Name
  $W eval "$ZUSTAND" > $D/$1-vor.txt 2>&1; cpu > $D/$1-cpu0.txt
  $W lauf 20 --ein 2 --regler voll --tiere frei > $D/$1-lauf.txt 2>&1
  cpu > $D/$1-cpu1.txt; $W eval "$ZUSTAND" > $D/$1-nach.txt 2>&1; echo "$(date +%T) probe3 $1" >> $L; }
if [ ! -f $D/B-an2-lauf.txt ]; then
  boot $R/abab-pe8a B
  $W eval "$AN" > /dev/null; messe B-an1
  $W eval "$AUS" > /dev/null; messe B-aus1
  messe B-aus2
  $W eval "$AN" > /dev/null; messe B-an2
fi
if [ ! -f $D/A-2-lauf.txt ]; then
  boot $R/abab-p0bb A; messe A-1; messe A-2
fi
stopp; echo "$(date +%T) PROBE3 FERTIG" >> $L
