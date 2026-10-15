#!/bin/bash
# 1510-k72-abab: nach der Ratschen-Serie (p3/k1510r2) zuerst die sechs Ratschen prägen (gtx-ratschen-1510, ohne GPU), dann unter
# dem GPU-Schloss stehend Wiese und Genesis × Ego/Third je A1 B1 … A4 B4 (stehen.sh) und die Schatten-Probe (schatten.sh).
# A = main 2031b3e4 (abab-p203), B = integ-probe 02fe5b6d (abab-p02f = Instrument).
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1510k72; R=/c/Users/micha/Desktop/AnazhRealm-OMEN; L=$H/fortschritt.log
until grep -q "SERIE ENDE" $R/p3/k1510r2/fortschritt.log 2>/dev/null; do sleep 20; done
D=$R/p3/k1510r2; cd $R/gtx-ratschen-1510
for o in wiese genesis dorf; do for s in ego third; do
  node scripts/werkbank.cjs ratsche --neu $D/$o-$s-1-erst.json $D/$o-$s-1-zweit.json $D/$o-$s-2-erst.json $D/$o-$s-2-zweit.json > $D/mint-$o-$s.txt 2>&1
  ec=$?; echo "$(date +%T) mint $o-$s exit=$ec" >> $L
done; done
cd $H
. $R/p3/gpu-schloss.sh
schloss_nehmen "omen-abab k72"; trap 'schloss_loesen "omen-abab k72"' EXIT
echo "$(date +%T) SCHLOSS genommen" >> $L
bash $H/stehen.sh >> $H/stehen.out 2>&1
bash $H/schatten.sh >> $L 2>&1
echo "$(date +%T) SERIE FERTIG" >> $L
