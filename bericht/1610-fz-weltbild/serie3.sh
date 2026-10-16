#!/bin/bash
# FZ Teil 3: swiftshader auf 4 Kernen (Prozess-Affinität 0xF; der Chrome-GPU-Prozess setzt sie zurück → affin.ps1 hält sie) wie ein GitHub-Runner (4 vCPU): qA1 qB1 qA2 qB2.
R=/c/Users/micha/Desktop/AnazhRealm-OMEN; H=$R/p3/k1610fz; L=$H/fortschritt.log; A=$R/abab-i1d8; B=$R/abab-p27a
. $R/p3/gpu-schloss.sh
say() { echo "$(date +%T) $*" | tee -a $L; }
for N in qA1 qB1 qA2 qB2; do
  [ -f $H/$N.json ] && { say "$N steht schon"; continue; }
  case $N in qA*) WT=$A;; *) WT=$B;; esac
  schloss_nehmen "omen-fz $N"; say "$N start (4 Kerne)"
  WIN=$(cygpath -w $WT); JS=$(cygpath -w $H/$N.json)
  printf '@echo off
cd /d %s
set LINSE_GPU=software
start "" /affinity F /wait /b node scripts\diag-boot-stage.cjs --kalt --sek 600 --json %s
' "$WIN" "$JS" > $H/$N.cmd
  powershell -NoProfile -ExecutionPolicy Bypass -File "$(cygpath -w $H/affin.ps1)" -frist 1200 > $H/$N-affin.log 2>&1 & AW=$!
  (timeout 1200 cmd.exe //c "$(cygpath -w $H/$N.cmd)" > $H/$N.txt 2>&1); ec=$?
  kill $AW 2>/dev/null
  say "$N exit=$ec affin=$(grep -c gesetzt $H/$N-affin.log) $(grep -a 'KALT-ZEILE' $H/$N.txt | grep -o '— [^·]*· [^·]*' | head -1) $(grep -a 't(Weltbild)' $H/$N.txt | tr -s ' ' | cut -c1-80)"
  schloss_loesen "omen-fz $N"; sleep 30
done
say "FZ3 FERTIG"
