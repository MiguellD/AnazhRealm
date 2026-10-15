#!/bin/bash
# 1510-k68-abab, Laub-GPU: DIE GPU-ZERLEGUNG an der Wiese je Ego/Third für B integ-probe 65854e26 (abab-p658) und A main
# a19ca615 (abab-pe8a, code-gleich), Folge A B B A, EIN Instrument abab-p658 (B-Kopf; zerlege-linse.cjs gleich in beiden).
# K68 ändert die Laub-Shader (Kante am TAAU-Rauschen, Kronen-Normale): Posten baum · busch · nahWiese · streu gegen einander.
# Dazu Genesis Ego B A: dort trägt B +19k Dreiecke, +2 Befehle, fps 79,7 → 72,7 (die K68-ABAB). Wartet auf Probe 3
# (p3/k1510z). Unter dem GPU-Schloss.
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1510k68/zerlegen; R=/c/Users/micha/Desktop/AnazhRealm-OMEN; L=$H/fortschritt.log
WT=$R/abab-p658; INS=$R/abab-p658
export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"
until grep -q "PROBE3 FERTIG" $R/p3/k1510z/fortschritt.log 2>/dev/null; do sleep 30; done
. $R/p3/gpu-schloss.sh; schloss_nehmen "omen-zerlegen k68"; trap 'schloss_loesen "omen-zerlegen k68"' EXIT
gpu() { nvidia-smi --query-gpu=pstate,clocks.gr,temperature.gpu --format=csv,noheader; }
stopp() { $W stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1; sleep 2; }
echo "$(date +%T) START Kopf=$(git -C $WT log -1 --format=%h) (K68: B integ-probe 65854e26, A main a19ca615 = abab-pe8a)" >> $L
for K in wiese-ego-A wiese-ego wiese-third wiese-third-A genesis-ego genesis-ego-A; do
  [ -f $H/$K-zerlegen.json ] && continue
  WT=$R/abab-p658; ORT=${K%%-*}; SICHT=${K#*-}; SICHT=${SICHT%-A}; [ "${K%-A}" != "$K" ] && WT=$R/abab-pe8a
  echo "$(date +%T) $K start [$(gpu)]" >> $L; stopp
  mkdir -p $H/stand/$K; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $H/stand/$K/ 2>/dev/null
  (cd $WT && PORT=4312 node save-server.js > $H/$K-server.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
  (cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $H/$K-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $H/$K-werkbank.log 2>/dev/null && break; sleep 5; done
  $W fenster 1920 1080 > /dev/null
  $W umstellen --ort $ORT --sicht $SICHT > $H/$K-umstellen.txt 2>&1
  $W lauf 10 --ein 30 --ruhe 300 --regler voll --tiere frei > $H/$K-ein.txt 2>&1
  $W zerlegen --selbsttest > $H/$K-selbsttest.txt 2>&1; ec=$?; echo "$(date +%T) $K selbsttest exit=$ec" >> $L
  $W zerlegen --runden 6 --json $H/$K-zerlegen.json > $H/$K-zerlegen.txt 2>&1; ec=$?; echo "$(date +%T) $K zerlegen exit=$ec" >> $L
  if [ $K = genesis-third ]; then
    $W lauf 20 --ein 2 --regler voll --tiere frei > $H/$K-lauf.txt 2>&1
    $W profil 20 --regler voll --tiere frei --top 150 > $H/$K-profil.txt 2>&1; echo "$(date +%T) $K profil exit=$?" >> $L
  fi
  stopp; echo "$(date +%T) $K ende" >> $L; sleep 60
done
echo "$(date +%T) ZERLEGEN FERTIG" >> $L
