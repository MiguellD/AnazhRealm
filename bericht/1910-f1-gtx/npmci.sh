#!/bin/bash
# 1910 F1: node_modules in beiden Bäumen, nach CPU-Ruhe (CI-Job hat Vorfahrt)
. /c/Users/micha/Desktop/AnazhRealm-OMEN/p3/gpu-schloss.sh
O=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/n1910/f1
for d in n1910-f1a n1910-f1b; do
  cpu_ruhe
  echo "$(date +%T) npm ci $d" >> $O/npmci.log
  (cd /c/Users/micha/Desktop/AnazhRealm-OMEN/$d && npm ci --no-audit --no-fund) >> $O/npmci-$d.log 2>&1; ec=$?
  echo "$(date +%T) npm ci $d EXIT=$ec" >> $O/npmci.log
done
