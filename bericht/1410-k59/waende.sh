#!/bin/bash
# K59: die Wände lokal am Arbeitsbaum, seriell, je Gate ein Port aus 7903–7909; EXIT je Gate in waende.log
cd /c/Users/micha/Desktop/AnazhRealm-OMEN/takt-kreatur; L=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k59/waende; mkdir -p $L
lauf() { local n=$1; shift; local t0=$(date +%s); env "$@" > $L/$n.txt 2>&1; local e=$?; echo "$n EXIT=$e $(( $(date +%s) - t0 ))s" >> $L/waende.log; }
: > $L/waende.log
lauf betriebsgesetz node scripts/diag-betriebsgesetz.cjs
lauf kreatur-kosten KREATUR_KOSTEN_PORT=7905 node scripts/diag-kreatur-kosten.cjs
lauf playtest-fast FAST_PORT=7903 node scripts/playtest-fast.cjs
lauf kampf-gefuehl KAMPF_GEFUEHL_PORT=7904 node scripts/diag-kampf-gefuehl.cjs
lauf tier-separation TIER_SEPARATION_PORT=7906 node scripts/diag-tier-separation.cjs
lauf tier-gang TIER_GANG_PORT=7907 sh -c "node scripts/diag-tier-gang.cjs --selftest && node scripts/diag-tier-gang.cjs"
lauf kreatur-leben KREATUR_LEBEN_PORT=7908 node scripts/diag-kreatur-leben.cjs
echo ENDE >> $L/waende.log
