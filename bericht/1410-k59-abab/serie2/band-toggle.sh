#!/bin/bash
# 1410-k59-abab: die Band-GPU an Genesis in EINER Welt — B-Seite c6558274, Instrument abab-i17e; A = `_kreaturRuht` gestubbt
# (ein Takt weckt jeden Leib, sein Feld steht), B = das Gesetz (ein Takt: wer außer Bild ruht, dessen Satz ist aus); je Wechsel
# EIN `band` (die Bank der Band-Linse), drei Durchgänge A B je Sicht. ./band-toggle.sh <ego|third>
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k59abab2; R=/c/Users/micha/Desktop/AnazhRealm-OMEN; WT=$R/abab-pc65; INS=$R/abab-i17e
S=${1:-ego}; D=$H/band-toggle/$S; mkdir -p $D
. $R/p3/gpu-schloss.sh; schloss_nehmen "omen-k59 band"; trap 'schloss_loesen "omen-k59 band"' EXIT
export WERKBANK_PORT=7902; W="node $INS/scripts/werkbank.cjs"
toete() { powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? { \$_.CommandLine -match 'save-server|werkbank' -and \$_.CommandLine -match '7900|7902|abab-pc65|abab-i17e' } | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1; }
$W stop > /dev/null 2>&1; sleep 1; toete; sleep 1
mkdir -p $D/stand; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $D/stand/ 2>/dev/null
(cd $WT && PORT=7900 node $WT/save-server.js > $D/server.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:7900/ && break; sleep 1; done
(cd $INS && node $INS/scripts/werkbank.cjs start --echt --port 7902 --seite http://localhost:7900 > $D/werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $D/werkbank.log 2>/dev/null && break; sleep 5; done
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
$W umstellen --ort genesis --sicht $S > $D/umstellen.txt 2>&1
$W eval "if (window.__buehne) window.__buehne(); return 1" > /dev/null
$W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei > $D/warm.txt 2>&1
TAKT="r._loopFrustumCulling(); r.updateCreatures(1 / 60); const W = r.state.creatures; return { tiere: W.length, ruhend: W.filter((c) => c.userData && c.userData._ruht === true).length, feldAktiv: W.filter((c) => c.userData && c.userData._kzGlieder && r.state.weltMarch.listeDaten[c.userData._kzGlieder[0].handle.feld * 32 + 3] !== 0).length };"
for N in 1 2 3; do
  $W eval "r._kreaturRuht = function () { return false; }; $TAKT" > $D/A$N-zustand.txt 2>&1
  $W band > $D/A$N-band.txt 2>&1
  $W eval "delete r._kreaturRuht; $TAKT" > $D/B$N-zustand.txt 2>&1
  $W band > $D/B$N-band.txt 2>&1
done
$W eval "const st = window.__stempelPool ? window.__stempelPool() : null; return st;" > $D/stempel.txt 2>&1
$W stop > /dev/null 2>&1; sleep 2; toete
for f in $D/A?-band.txt $D/B?-band.txt; do echo "$(basename $f) $(grep -o 'GPU ms/Frame [0-9.]*' $f | head -1) $(grep -o 'Befehle [0-9]*' $f | head -1)"; done > $D/zusammen.txt
cat $D/zusammen.txt
