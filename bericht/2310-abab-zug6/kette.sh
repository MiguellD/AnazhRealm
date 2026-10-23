#!/bin/bash
# 2310 Zug 6 im selben Termin: wartet auf das Ende von Zug 5 (M39 an 7c6f4b49), setzt n2010-b2b auf 6579e8f4, dann ABAB-Serie, M36, Herde,
# M39 (Regler frei) und M37 (+ Zusatz fest) am Kandidaten.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; H=$BASE/p3/n2210/zug6; MS=$BASE/p3/n2310/ms
until grep -q "M39-7c6f EXIT" $MS/fortschritt.log 2>/dev/null; do sleep 20; done
git -C $BASE/n2010-b2b checkout -q --detach 6579e8f409c5234276210ace7e19798e63ad423c || exit 9
echo "$(date +%T) KETTE b2b=$(git -C $BASE/n2010-b2b log -1 --format=%h)[$(git -C $BASE/n2010-b2b status --porcelain | wc -l)] b2a=$(git -C $BASE/n2010-b2a log -1 --format=%h)" >> $H/fortschritt.log
cd $H && bash serie.sh > serie.out 2>&1; echo "SERIE EXIT=$?" >> $H/fortschritt.log
cd $H && bash m36.sh > m36.out 2>&1; echo "M36 EXIT=$?" >> $H/fortschritt.log
cd $H && bash herde.sh > herde.out 2>&1; echo "HERDE EXIT=$?" >> $H/fortschritt.log
cd $MS && TAG=6579 WT=$BASE/n2010-b2b bash m39k.sh > m39-6579.out 2>&1; echo "M39-6579 EXIT=$?" >> $H/fortschritt.log
cd $MS && TAG=6579 WT=$BASE/n2010-b2b bash m37k.sh > m37-6579.out 2>&1; echo "M37-6579 EXIT=$?" >> $H/fortschritt.log
echo "$(date +%T) KETTE ENDE" >> $H/fortschritt.log
