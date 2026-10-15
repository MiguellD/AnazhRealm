#!/bin/bash
# 1510-zerlegen (durchbruch-1510 Schritt 0): DIE GPU-ZERLEGUNG am Kopf integ-probe a19ca615 (= e8a370ad + Doku; Baum und
# Instrument abab-pe8a) an Wiese und Genesis, je Ego und Third — je Sitzung: Boot, umstellen, einschwingen (lauf 10 --ein 30
# --ruhe 300, freie Tiere), zerlegen --selbsttest, zerlegen --runden 6 --json. An Genesis Third dazu das CPU-Profil (20 s,
# freie Tiere): die Vorher-Zahlen für K71 (_diaetRefresh, updateBeforeNode, needsRefresh je Frame). Unter dem GPU-Schloss,
# wartet auf das Ende der Bündel-Serie (p3/k1510b). Gemessene Sitzungen werden übersprungen. Dazu Genesis Ego auf A (main
# 0bbee8fc, abab-p0bb, dasselbe Instrument): der Bündel-Befund GPU-Durchsatz +1,0 ms nur an Genesis Ego, Posten gegen Posten.
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1510z; R=/c/Users/micha/Desktop/AnazhRealm-OMEN; L=$H/fortschritt.log
WT=$R/abab-pe8a; INS=$R/abab-pe8a
export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"
until grep -q "SERIE FERTIG" $R/p3/k1510b/fortschritt.log 2>/dev/null; do sleep 30; done
. $R/p3/gpu-schloss.sh; schloss_nehmen "omen-zerlegen 1510"; trap 'schloss_loesen "omen-zerlegen 1510"' EXIT
gpu() { nvidia-smi --query-gpu=pstate,clocks.gr,temperature.gpu --format=csv,noheader; }
stopp() { $W stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1; sleep 2; }
echo "$(date +%T) START Kopf=$(git -C $WT log -1 --format=%h) (integ-probe a19ca615 = e8a370ad + Doku)" >> $L
for K in wiese-ego wiese-third genesis-ego genesis-ego-A genesis-third; do
  [ -f $H/$K-zerlegen.json ] && continue
  WT=$R/abab-pe8a; ORT=${K%%-*}; SICHT=${K#*-}; SICHT=${SICHT%-A}; [ "${K%-A}" != "$K" ] && WT=$R/abab-p0bb
  echo "$(date +%T) $K start [$(gpu)]" >> $L; stopp
  mkdir -p $H/stand/$K; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $H/stand/$K/ 2>/dev/null
  (cd $WT && PORT=4312 node save-server.js > $H/$K-server.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
  (cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $H/$K-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $H/$K-werkbank.log 2>/dev/null && break; sleep 5; done
  $W fenster 1920 1080 > /dev/null
  $W umstellen --ort $ORT --sicht $SICHT > $H/$K-umstellen.txt 2>&1
  $W lauf 10 --ein 30 --ruhe 300 --regler voll --tiere frei > $H/$K-ein.txt 2>&1
  $W zerlegen --selbsttest > $H/$K-selbsttest.txt 2>&1; echo "$(date +%T) $K selbsttest exit=$?" >> $L
  $W zerlegen --runden 6 --json $H/$K-zerlegen.json > $H/$K-zerlegen.txt 2>&1; echo "$(date +%T) $K zerlegen exit=$?" >> $L
  if [ $K = genesis-third ]; then
    $W lauf 20 --ein 2 --regler voll --tiere frei > $H/$K-lauf.txt 2>&1
    $W profil 20 --regler voll --tiere frei --top 150 > $H/$K-profil.txt 2>&1; echo "$(date +%T) $K profil exit=$?" >> $L
  fi
  stopp; echo "$(date +%T) $K ende" >> $L; sleep 60
done
echo "$(date +%T) ZERLEGEN FERTIG" >> $L
