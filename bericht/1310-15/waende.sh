#!/bin/bash
# 1310-15: die Wände des Leib-Schnitts, seriell, je Wand EXIT und die letzten Zeilen. bash waende.sh <baum> <ordner>
WT=$1; OUT=$2; mkdir -p $OUT; SUM=$OUT/summe.txt; : > $SUM
lauf() { local n=$1; shift; (cd $WT && "$@") > $OUT/$n.txt 2>&1; local ec=$?; echo "$(date +%T) $n EXIT=$ec $(tail -2 $OUT/$n.txt | tr '\n' ' ' | cut -c1-200)" >> $SUM; }
lauf asset-contract npm run gate:asset-contract
lauf regler-wirkt npm run gate:regler-wirkt
lauf kreatur-kosten npm run gate:kreatur-kosten
lauf mensch-anatomie npm run gate:mensch-anatomie
lauf koerper-kern npm run gate:koerper-kern
lauf koerper-stand npm run gate:koerper-stand
lauf koerper-bewegung npm run gate:koerper-bewegung
lauf daten-contract npm run gate:daten-contract
lauf ego-schatten npm run gate:ego-schatten
lauf format npm run format:check
lauf lint npm run lint
lauf playtest-fast npm run playtest:fast
echo ENDE >> $SUM
