#!/bin/bash
# Arena-Prüfung (Koordinator: `r.constructor.__arenaOhne` == null, die Arena läuft wirklich): je Seite ein echter Boot an der Werkbank
# (Instrument abab-p6df), dann die Klassen-Marken der Arena und die Version. GPU-Schloss je Seite.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; H=$BASE/p3/k1610b6; INS=$BASE/abab-p6df
. $BASE/p3/gpu-schloss.sh
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3; }
export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"
for S in A B; do
  case $S in A) WT=$BASE/abab-p3ca;; B) WT=$BASE/abab-p6df;; esac
  schloss_nehmen "omen-arena $S"; stopp; mkdir -p $H/arena-stand-$S
  mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $H/arena-stand-$S/ 2>/dev/null
  (cd $WT && PORT=4312 node save-server.js > $H/arena-$S-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
  (cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $H/arena-$S-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $H/arena-$S-werkbank.log 2>/dev/null && break; sleep 5; done
  sleep 20
  $W eval "const K = r.constructor; return { version: K.VERSION, arenaOhne: K.__arenaOhne === undefined ? null : K.__arenaOhne, arenaBruch: K.__arenaBruch === undefined ? null : K.__arenaBruch, weltbild: r.state._weltbildDa || 0 };" > $H/arena-$S.txt 2>&1
  echo "$(date +%T) arena $S $(tr -d '\n ' < $H/arena-$S.txt | cut -c1-200)" >> $H/fortschritt.log
  $W stop > /dev/null 2>&1; stopp; schloss_loesen "omen-arena $S"; sleep 20
done
bash $H/stehen.sh > $H/stehen.out 2>&1
