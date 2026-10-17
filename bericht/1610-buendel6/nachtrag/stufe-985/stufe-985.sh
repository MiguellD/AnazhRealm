#!/bin/bash
# stufe-985.sh — EIN Boot Genesis Third an 985a923b (V18.546.7, ohne A1/G1/W3/Wald-Urteil), Instrument abab-p6df wie Bündel 6:
# steht die Fichte in L0 und verkalkt in L2 (die Band-Szene von 6df9c3d4) schon hier, kommt der Stufen-Wechsel aus V18.546.7.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; H=$BASE/p3/k1710a1; O=$H/stufe; WT=$BASE/abab-bbb; INS=$BASE/abab-p6df; L=$H/fortschritt.log
mkdir -p $O/stand; . $BASE/p3/gpu-schloss.sh
say() { echo "$(date +%T) $*" | tee -a $L; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3; }
schloss_nehmen "omen-stufe-985"; stopp
mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $O/stand/ 2>/dev/null
(cd $WT && PORT=4312 node save-server.js > $O/save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
say "STUFE-985 start (Seite $(git -C $WT log -1 --format=%h), Instrument $(git -C $INS log -1 --format=%h))"
(cd $INS && timeout 1500 node scripts/omen-messfolge.cjs --ort genesis --sicht third --seite http://localhost:4312 --datei $O/g-third-985.json > $O/g-third-985.log 2>&1); ec=$?
say "STUFE-985 exit=$ec"
stopp; schloss_loesen "omen-stufe-985"; sleep 30
