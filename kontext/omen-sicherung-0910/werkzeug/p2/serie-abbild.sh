#!/bin/bash
# Abbild-Serie nach dem Skalar-Schnitt: Wasser f/k/f, dann voll k/f/k/f (7901 = host-vram mit Abbild, 7904 = host-vram-kopf 7e5180d0)
P2=/c/Users/micha/Desktop/AnazhRealm-OMEN/p2
cd $P2
echo "$(date +%T) serie-abbild START" >> boot.log
bash boot-wasser.sh f1 7901
bash boot-wasser.sh k2 7904
bash boot-wasser.sh f2 7901
bash boot.sh k4 7904
bash boot.sh f3 7901
bash boot.sh k5 7904
bash boot.sh f4 7901
echo "$(date +%T) serie-abbild ENDE" >> boot.log
