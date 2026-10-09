#!/bin/bash
cd /c/Users/micha/Desktop/AnazhRealm-OMEN/welle-m-impuls
for k in 1 2 3; do
  FAHR_LEBEN_PORT=7906 node scripts/diag-fahr-leben.cjs > ../p3/fl-lauf$k.txt 2>&1
  echo "lauf $k EXIT=$?" >> ../p3/fl-dreimal.log
done
