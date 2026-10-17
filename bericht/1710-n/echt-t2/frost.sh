#!/bin/bash
# Ein Lauf gate:weltbild-frost:echt wie im CI-Job echt (CI_KLASSE=gpu, LINSE_GPU=karte), mit dem GPU-Schloss NUR um diesen Lauf.
# frost.sh <worktree> <etikett>  ->  roh/<etikett>.log (+ Bilder roh/<etikett>/), letzte Zeile "EXIT=<n>"; Rueckgabe = Exit des Gates
WT="$1"; ET="$2"
ROH=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/n1710/roh-t2
mkdir -p "$ROH/$ET"
. /c/Users/micha/Desktop/AnazhRealm-OMEN/p3/gpu-schloss.sh
schloss_nehmen omen-1710-n
echo "$(date +%T) Schloss omen-1710-n genommen, Kopf $(git -C "$WT" rev-parse --short HEAD)" >> "$ROH/$ET.log"
nvidia-smi --query-gpu=clocks.gr,temperature.gpu,pstate --format=csv,noheader >> "$ROH/$ET.log" 2>&1
( cd "$WT" && CI_KLASSE=gpu LINSE_GPU=karte WELTBILD_FROST_PORT=7901 node scripts/diag-weltbild-frost.cjs --echt --bilder "$ROH/$ET" ) >> "$ROH/$ET.log" 2>&1
ec=$?
schloss_loesen omen-1710-n
echo "$(date +%T) Schloss geloest" >> "$ROH/$ET.log"
echo "EXIT=$ec" >> "$ROH/$ET.log"
exit $ec
