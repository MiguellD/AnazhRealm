#!/bin/bash
# reihe.sh — je Eintrag <seite>:<sprosse>:<lauf> EIN Lauf unter dem Schloss, mit langem Warten; zeilengepuffert ins Log
H=/c/Users/micha/AppData/Local/Temp/claude/a2d6fda3d89c432f/fbfd5778-401f-4a17-bf73-0367303d8996/scratchpad/h
G=/c/Users/micha/AnazhRealm-profiband/artifacts/profiband/werkzeug/gpu-lauf.sh
export PREIS_EXTRA=$H/zensus.js GPU_LAUF_WARTE_S=14400 GPU_LAUF_MAX_S=1500
for e in "$@"; do
  IFS=: read seite s lauf <<<"$e"
  case $s in verkehr) a=karte2_mensch_netz_verkehr_1;; kollektiv) a=karte2_mensch_menge_kollektiv_1;; innen) a=karte2_mensch_bau_innen_1;; stadt) a=vegetation_K4_1;; bild) a="";; esac
  if [ "$seite" = main ]; then B=/c/Users/micha/AnazhRealm-nacht-main; export PREIS_OHNE_HALDE=1; else B=/c/Users/micha/AnazhRealm-altlast; unset PREIS_OHNE_HALDE; fi
  if [ "$s" = bild ]; then
    (cd $B && bash $G heap-register-bild node $H/bild.cjs $seite $B 27904 $H/aus) 2>&1 | grep --line-buffered -v "warte auf"
  else
    (cd $B && bash $G heap-register-$seite node $H/preis.cjs $s-$seite-$lauf $H/$a.argv.json . 27904 $H/aus) 2>&1 | grep --line-buffered -v "warte auf"
  fi
  echo "ENDE $e"
done
echo REIHE-ENDE
