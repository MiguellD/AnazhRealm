#!/bin/bash
# 1410 Wiesen-ABAB: der Anteil der Nah-Wiese an der GPU NACH einem Lauf unter Regler voll (wie die Messfolge) — ./gras2.sh <name> <baum>
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1410e; N=$1; WT=$2; INS=/c/Users/micha/Desktop/AnazhRealm-OMEN/abab-i5e2; D=$H/gras2
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
$W umstellen --ort wiese --sicht third > $D/$N-umstellen.txt 2>&1
$W lauf 45 --ein 10 --regler voll --tiere frei > $D/$N-lauf.txt 2>&1
$W eval "for (const c of r.state.creatures || []) c.visible = false; window.__buehne(); return [...r.state.nahWiese.senken.values()].filter((a) => a.mesh).length;" > $D/$N-senken.txt 2>&1
for R in 1 2; do
  $W gpu-bank 120 --runden 3 > $D/$N-mit-$R.txt 2>&1
  $W eval "for (const a of r.state.nahWiese.senken.values()) if (a.mesh) a.mesh.visible = false; return 1" > /dev/null
  $W gpu-bank 120 --runden 3 > $D/$N-ohne-$R.txt 2>&1
  $W eval "for (const a of r.state.nahWiese.senken.values()) if (a.mesh) a.mesh.visible = true; return 1" > /dev/null
done
$W stop > /dev/null 2>&1; sleep 2
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
echo "$N ende"
