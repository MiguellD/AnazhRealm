#!/bin/bash
# 1410-3: das CPU-Profil je Frame an einem Messort (Instrument abab-id47, Orte lokal) — ./prof.sh <name> <baum> <ort> <sicht>
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1410g; N=$1; WT=$2; ORT=$3; SICHT=$4; INS=/c/Users/micha/Desktop/AnazhRealm-OMEN/abab-id47; D=$H/prof
export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"
$W stop > /dev/null 2>&1; sleep 2
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1; sleep 2
mkdir -p $D/stand/$N; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $D/stand/$N/ 2>/dev/null
(cd $WT && PORT=4312 node save-server.js > $D/$N-server.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
(cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $D/$N-werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $D/$N-werkbank.log 2>/dev/null && break; sleep 5; done
$W fenster 1920 1080 > /dev/null
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W umstellen --ort $ORT --sicht $SICHT > $D/$N-umstellen.txt 2>&1
$W lauf 40 --ein 10 --regler voll --tiere frei > $D/$N-lauf.txt 2>&1
$W profil 20 --regler voll --top 80 > $D/$N-profil.txt 2>&1
$W lauf 20 --ein 2 --regler voll --tiere frei > $D/$N-lauf2.txt 2>&1
$W stop > /dev/null 2>&1; sleep 2
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
echo "$N ende"
