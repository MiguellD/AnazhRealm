#!/bin/bash
# wiederhole.sh TAG… — je Lauf reihe.sh, bis er nicht mit 75 (Schloss blockiert) endet; die 75er-Ausgaben bleiben benannt liegen
S=$(dirname $0); O=$(dirname $S)
for t in "$@"; do
  for k in 1 2 3 4 5 6; do
    bash $S/reihe.sh $t > /dev/null 2>&1
    if grep -q "$t EXIT=75" $O/$t.out; then mv $O/$t.out $O/$t-schloss75-w$k.out; else break; fi
  done
done
echo "WIEDERHOLE ENDE $(date +%T)" >> $O/reihe2.log
