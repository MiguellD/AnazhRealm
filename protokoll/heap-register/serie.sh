#!/bin/bash
# serie.sh <seite> <lauf> <baum> sprossen… — je Sprosse EIN Lauf unter dem Schloss
H=/c/Users/micha/AppData/Local/Temp/claude/a2d6fda3d89c432f/fbfd5778-401f-4a17-bf73-0367303d8996/scratchpad/h
SEITE=$1; LAUF=$2; BAUM=$3; shift 3
export PREIS_EXTRA=$H/zensus.js
for s in "$@"; do
  a=""
  case $s in verkehr) a=karte2_mensch_netz_verkehr_1;; kollektiv) a=karte2_mensch_menge_kollektiv_1;; innen) a=karte2_mensch_bau_innen_1;; stadt) a=vegetation_K4_1;; esac
  [ -z "$a" ] && { echo "unbekannt $s"; continue; }
  (cd $BAUM && GPU_LAUF_MAX_S=1500 bash /c/Users/micha/AnazhRealm-profiband/artifacts/profiband/werkzeug/gpu-lauf.sh heap-register-$SEITE node $H/preis.cjs $s-$SEITE-$LAUF $H/$a.argv.json . 27904 $H/aus) 2>&1 | grep -v "^$" | grep -v "warte auf"
done
echo SERIE-ENDE
