#!/bin/bash
# Schlange nach Bündel 3: (1) w-ego A3 B3 A4 B4 (gpu-bank am Blick +0,24 bei 2σ 0,22 nach 2+2 — erst 4+4 urteilt), (2) FZ p3/k1610fz.
R=/c/Users/micha/Desktop/AnazhRealm-OMEN; L=$R/p3/k1610b3/fortschritt.log
until grep -q "SERIE ENDE" $L; do sleep 30; done
echo "$(date +%T) NACHLAUF w-ego A3 B3 A4 B4" >> $L
KOMBIS=w-ego LAEUFE="A3 B3 A4 B4" bash $R/p3/k1610b3/stehen.sh >> $R/p3/k1610b3/stehen.out 2>&1
echo "$(date +%T) NACHLAUF FERTIG" >> $L
bash $R/p3/k1610fz/serie.sh > $R/p3/k1610fz/serie.out 2>&1
