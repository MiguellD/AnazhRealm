#!/bin/bash
# kette.sh — nach Serie B: das Bildpaar main ↔ Kopf (gleiche Orte, gleiche Kamera), dann die CI-Schritte der berührten Familien
H=/c/Users/micha/AppData/Local/Temp/claude/a2d6fda3d89c432f/fbfd5778-401f-4a17-bf73-0367303d8996/scratchpad/h
G=/c/Users/micha/AnazhRealm-profiband/artifacts/profiband/werkzeug/gpu-lauf.sh
until grep -q DONE-B /c/Users/micha/AppData/Local/Temp/claude/9fd86081514dce1c/fbfd5778-401f-4a17-bf73-0367303d8996/tasks/b5b9jv1b6.output 2>/dev/null; do sleep 15; done
(cd /c/Users/micha/AnazhRealm-nacht-main && GPU_LAUF_MAX_S=900 bash $G heap-register-bild node $H/bild.cjs main /c/Users/micha/AnazhRealm-nacht-main 27904 $H/aus)
(cd /c/Users/micha/AnazhRealm-altlast && GPU_LAUF_MAX_S=900 bash $G heap-register-bild node $H/bild.cjs kopf /c/Users/micha/AnazhRealm-altlast 27904 $H/aus)
cd /c/Users/micha/AnazhRealm-altlast
for g in gate:weltbild-frost:echt gate:reload-treue gate:kollision-bild playtest:fast; do
  n=$(echo $g | tr ':' '-')
  echo "== $g"
  GPU_LAUF_MAX_S=1500 bash $G heap-register-ci npm run $g > $H/ci-$n.log 2>&1
  echo "EXIT $g $?"
done
echo DONE-C
