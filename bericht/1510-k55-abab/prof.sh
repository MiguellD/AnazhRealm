#!/bin/bash
# 1510-k55-abab Serie 2: DAS CPU-PROFIL an Genesis Third je Seite (A main 3406f8bd, B bd38fb16), Folge A1 B1 B2 A2, freie Tiere —
# GC je Frame und der Kreatur-Takt (der Messfolge fehlt an Genesis der Profil-Schritt). Läuft unter dem Schloss der Serie.
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k55abab; R=/c/Users/micha/Desktop/AnazhRealm-OMEN; INS=$R/abab-ibd3; D=$H/prof; mkdir -p $D
export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"
stopp() { $W stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1; sleep 2; }
for N in A1 B1 B2 A2; do
  [ -f $D/$N-profil.txt ] && continue
  case $N in A*) WT=$R/abab-m340;; B*) WT=$R/abab-pbd3;; esac
  echo "$(date +%T) prof $N start" ; stopp
  mkdir -p $D/stand/$N; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $D/stand/$N/ 2>/dev/null
  (cd $WT && PORT=4312 node save-server.js > $D/$N-server.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
  (cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $D/$N-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $D/$N-werkbank.log 2>/dev/null && break; sleep 5; done
  $W fenster 1920 1080 > /dev/null
  $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
  $W umstellen --ort genesis --sicht third > $D/$N-umstellen.txt 2>&1
  $W lauf 40 --ein 10 --regler voll --tiere frei > $D/$N-lauf.txt 2>&1
  $W profil 20 --regler voll --tiere frei --top 150 > $D/$N-profil.txt 2>&1
  $W lauf 20 --ein 2 --regler voll --tiere frei > $D/$N-lauf2.txt 2>&1
  $W eval "const W = r.state.creatures; return { tiere: W.length, ruhend: W.filter((c) => c.userData && c.userData._ruht === true).length }" > $D/$N-tiere.txt 2>&1
  stopp; echo "$(date +%T) prof $N ende"; sleep 60
done
