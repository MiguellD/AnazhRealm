#!/bin/bash
# bash stempel-kette.sh <zweig> <kopf40> <satz-datei> <stempel-name> — wartet auf das CI-Urteil am Kopf; bei GRÜN baut sie die Abgabe-Nachricht,
# stempelt (stempel.sh prüft Kopf, CI, Röte, Konflikt gegen main, Siegel-Wörter) und prüft das Probe-Tag am Stempel. Bei ROT: nur die roten Jobs.
set -u; cd /c/Users/micha/AnazhRealm-profiband || exit 2; export MSYS_NO_PATHCONV=1
A="C:/Users/micha/AppData/Local/Temp/claude/9fd86081514dce1c/020b359f-6bff-4326-a9cc-a8805834c858/scratchpad"
N="C:/Users/micha/AppData/Local/Temp/claude/9fd86081514dce1c/9c27a074-223e-48c0-a5af-60ae0385359b/scratchpad"
Z=$1; H=$2; SATZ=$3; NAME=$4
date '+%H:%M:%S'
U=$(bash $A/ci/gruen-warte.sh "$Z:$H" 2>&1 | tail -3); echo "$U" | cut -c1-200
date '+%H:%M:%S'
if ! echo "$U" | grep -q " GRÜN ("; then
    echo "--- NICHT GRÜN, kein Stempel. Rote Jobs:"; node $A/ci/ci-rot.cjs $H 2>&1 | grep -v "LÄUFT/WARTET" | head -8 | cut -c1-260; exit 1
fi
bash $A/stempel-msg.sh "$Z" "$H" "$SATZ" "$N/msg-$NAME.txt" "$NAME" | cut -c1-160 || exit 3
OUT=$(bash $A/stempel.sh "$Z" "$H" "$N/msg-$NAME.txt" "$NAME" 2>&1); echo "$OUT" | tail -4 | cut -c1-220
S=$(echo "$OUT" | grep -o -E "GESTEMPELT $NAME [0-9a-f]{40}" | cut -d' ' -f3)
[ -n "$S" ] || { echo "--- KEIN STEMPEL"; exit 4; }
echo "--- probe-tag:"; sh artifacts/profiband/werkzeug/zug.sh probe-tag "$NAME@$S" 2>&1 | tail -2 | cut -c1-220
date '+%H:%M:%S'
