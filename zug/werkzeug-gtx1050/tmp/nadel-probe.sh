#!/bin/bash
# EIN Kalt-Boot je Stand mit Programm-Log, Zensus und Fragment-Texten (FREI_SHADER): teilt die Nadel das Programm des Laubs?
#   nadel-probe.sh "<lauf>=<commit> …"   (unter gc-lauf.sh: das Schloss hält der Rufer)
S=/c/AnazhRealm/.git/gtx1050-werkzeug
W=C:/AnazhRealm/.git/gtx1050-werkzeug
mkdir -p "$S/gc/nadel-probe"
cd /c/AnazhRealm || exit 1
ZWEIG=$(git rev-parse --abbrev-ref HEAD)
for st in $1; do
  L=${st%%=*}; C=${st#*=}
  git checkout -q --detach "$C" || exit 1
  rm -rf "$S/gc/nadel-probe/profil-$L"
  FREI_PROFIL="$S/gc/nadel-probe/profil-$L" FREI_ZERLEGE=1 FREI_SHADER=1 FREI_EINGRIFF="$W/tmp/probe-nadel.js" FREI_JSON="$W/gc/nadel-probe/$L.json" CI_KLASSE=gpu LINSE_GPU=karte node "$S/gc/frei-sonde.cjs" > "$S/gc/nadel-probe/$L.log" 2>&1
  echo "$L EXIT=$? · $(head -n 1 "$S/gc/nadel-probe/$L.log" | cut -c38-120)"
  rm -rf "$S/gc/nadel-probe/profil-$L"
done
git checkout -q "$ZWEIG"
