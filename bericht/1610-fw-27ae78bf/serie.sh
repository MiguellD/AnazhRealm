#!/bin/bash
# 1610-FW (Auftrag 16.10. ~7 Uhr): A = 0d6c8bc1 (L2), B = integ-probe 27ae78bf (= 0d6c8bc1 + B3 Lade-Takt + FW Leser-Texturen). Wartet
# auf das Ende der Zweigipfel-Probe, dann unter dem GPU-Schloss: (1) Wiese Ego mit `--gpu-fehler` und Re-Anker (bild.sh, Soll 0×
# „Destroyed texture horizont-karte“), (2) Kalt 3+3 (kalt.sh), (3) stehend Wiese Ego, Wiese Third, Genesis Third je 2+2 (stehen.sh).
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1610fw; R=/c/Users/micha/Desktop/AnazhRealm-OMEN; L=$H/fortschritt.log
until grep -q "ZWEIGIPFEL FERTIG" $R/p3/k1510zg/fortschritt.log 2>/dev/null; do sleep 30; done
. $R/p3/gpu-schloss.sh
schloss_nehmen "omen-abab fw"; trap 'schloss_loesen "omen-abab fw"' EXIT
echo "$(date +%T) SCHLOSS genommen A=$(git -C $R/abab-p0d6 log -1 --format=%h) B=$(git -C $R/abab-p27a log -1 --format=%h)" >> $L
nachtruhe() { while :; do hm=$((10#$(date +%H%M))); if [ $hm -ge 325 ] && [ $hm -lt 415 ]; then sleep 60; else break; fi; done; }
nachtruhe; bash $H/bild.sh >> $L 2>&1
nachtruhe; bash $H/kalt.sh
bash $H/stehen.sh >> $H/stehen.out 2>&1
echo "$(date +%T) SERIE FERTIG" >> $L
