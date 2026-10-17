#!/bin/bash
# Arena-Prüfung 2 (B 6df9c3d4): nach dem stehenden Weltbild und 20 s Lauf — die Lager (`AnazhRealm.__arenen`), ihre Glieder, Ohne/Bruch
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; H=$BASE/p3/k1610b6; INS=$BASE/abab-p6df; WT=$INS
. $BASE/p3/gpu-schloss.sh
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3; }
export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"
schloss_nehmen "omen-arena3 B"; stopp; mkdir -p $H/arena2-stand
mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $H/arena2-stand/ 2>/dev/null
(cd $WT && PORT=4312 node save-server.js > $H/arena2-save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
(cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $H/arena2-werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $H/arena2-werkbank.log 2>/dev/null && break; sleep 5; done
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
$W umstellen --ort genesis --sicht ego > $H/arena2-umstellen.txt 2>&1
$W lauf 10 --ein 5 --regler voll --tiere frei > $H/arena2-lauf.txt 2>&1
$W eval "const K = r.constructor; const reg = K.__arenen || new Map(); let glieder = 0; for (const a of reg.values()) glieder += (a.glieder || []).length; return { version: K.VERSION, weltbild: r.state._weltbildDa || 0, arenaOhne: K.__arenaOhne === undefined ? null : K.__arenaOhne, arenaBruch: K.__arenaBruch === undefined ? null : String(K.__arenaBruch), lager: reg.size, glieder };" > $H/arena3-B.txt 2>&1
echo "$(date +%T) arena3 B $(tr -d '\n ' < $H/arena3-B.txt | cut -c1-220)" >> $H/fortschritt.log
$W stop > /dev/null 2>&1; stopp; schloss_loesen "omen-arena3 B"
