#!/bin/bash
# 1510-buendel-abab: die GTX-KALT-Zeile je Seite 3 Boots (A B · B A · A B), kalt.cjs (EIN Instrument abab-pe8a, IDB leer),
# 30 s Pause; gemessene Läufe werden übersprungen. Eigenes GPU-Schloss, nach der Zerlegung (p3/k1510z): der erste Lauf in
# der Serie scheiterte am Root des Statik-Servers (403, Schreibweise), verworfen in kalt/verworfen/.
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1510b; R=/c/Users/micha/Desktop/AnazhRealm-OMEN; L=$H/fortschritt.log; D=$H/kalt
A=$R/abab-p0bb; B=$R/abab-pe8a; mkdir -p $D
until grep -q "ZERLEGEN FERTIG" $R/p3/k1510z/fortschritt.log 2>/dev/null; do sleep 30; done
. $R/p3/gpu-schloss.sh; schloss_nehmen "omen-abab buendel kalt"; trap 'schloss_loesen "omen-abab buendel kalt"' EXIT
gpu() { nvidia-smi --query-gpu=pstate,clocks.gr,temperature.gpu --format=csv,noheader; }
k() { [ -f $D/$1.json ] && return
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'kalt-zeile|werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
  echo "$(date +%T) kalt $1 start [$(gpu)]" >> $L
  BOOT_STAGE_PORT=4406 timeout 400 node $H/kalt.cjs $2 $D/$1.json > $D/$1.txt 2>&1; ec=$?; echo "$(date +%T) kalt $1 exit=$ec $(grep -a 't(Weltbild)' $D/$1.txt | tr -s ' ')" >> $L
  sleep 30; }
k A1 $A; k B1 $B; k B2 $B; k A2 $A; k A3 $A; k B3 $B
echo "$(date +%T) KALT FERTIG" >> $L
