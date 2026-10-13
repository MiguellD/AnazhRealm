#!/bin/bash
# 1310-3: die Wände des Genesis-Schnitts (Membran seg 45, indizierte Stufe-3-Hülle) — Puls (ci-lokal) und die Tor-/Portal-Gates.
B=/c/Users/micha/Desktop/AnazhRealm-OMEN; WT=$B/welle-m-e-genesis; OUT=$B/p3/gen/waende; mkdir -p $OUT; SUM=$OUT/summe.txt; : > $SUM
cd $WT
NUR='^puls/' node $B/p3/es/ci-lokal.cjs C:/Users/micha/Desktop/AnazhRealm-OMEN/welle-m-e-genesis C:/Users/micha/Desktop/AnazhRealm-OMEN/p3/gen/waende/puls > $OUT/puls.out 2>&1
ec=$?
echo "$(date +%T) puls (ci-lokal) EXIT=$ec · $(grep -c 'EXIT=0' $OUT/puls/ci-lokal.log) grün · $(grep -E 'EXIT=[1-9]' $OUT/puls/ci-lokal.log | cut -c1-120 | tr '\n' ' ')" >> $SUM
for g in gate:membran-gesetz gate:porta-contract gate:asset-contract gate:tor-fern gate:regler-wirkt gate:portal-membran gate:portal-gestalt gate:foundry-crossfade gate:profiband; do
  t0=$(date +%s); timeout 1200 npm run $g > $OUT/$g.txt 2>&1; ec=$?
  echo "$(date +%T) $g EXIT=$ec $(( $(date +%s)-t0 )) s · $(grep -aE 'GRÜN|GRUEN|ROT|FEHLER|⛔|❌' $OUT/$g.txt | tail -1 | cut -c1-120)" >> $SUM
done
echo "$(date +%T) WAENDE ENDE" >> $SUM
