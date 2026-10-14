#!/bin/bash
# 1410 Einschub: der NADELWALD-BLICK — von der Wiese (K55) nach −273/−1060 in Kronenhöhe; Bild, Befehle/Dreiecke je Klasse und
# gpu-bank (2 × 120 × 3) an dieser Pose, je Seite eine Sitzung (Instrument abab-if09). ./nadel.sh <name> <baum>
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1410i; N=$1; WT=$2; INS=/c/Users/micha/Desktop/AnazhRealm-OMEN/abab-if09; D=$H/nadel
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
$W umstellen --ort wiese > $D/$N-umstellen.txt 2>&1
$W lauf 30 --ein 10 --regler voll --tiere frei > $D/$N-lauf.txt 2>&1
$W eval "for (const c of r.state.creatures || []) c.visible = false; window.__buehne(); return 1" > /dev/null
POSE="-278 +1.7 -1038 -273 +8 -1060"
$W bild $POSE --w 1920 --h 1080 --datei "$(cd $D && pwd -W)/$N-nadel.png" > $D/$N-bild.txt 2>&1
$W zaehlen $POSE --alle > $D/$N-zaehlen.txt 2>&1
for R in 1 2; do $W gpu-bank 120 --runden 3 > $D/$N-bank-$R.txt 2>&1; done
$W stop > /dev/null 2>&1; sleep 2
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
echo "$N ende"
