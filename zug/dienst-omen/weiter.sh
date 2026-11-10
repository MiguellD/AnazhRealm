#!/bin/bash
# weiter.sh — erst die Eichung der OMEN neu (stufe/eich.sh, Gesetz der Fremd-Last 69e5760a), dann die Landungs-Schleife
# (Nachfolger von p3/n0611/stufe/weiter.sh). Start: start.sh --eich. Hält von Anfang an das PID-Schloss „landung“ — neben einer
# Eichung startet keine Landung (die Eichung braucht die stille Karte), und das exec gibt PID und Schloss an die Schleife weiter.
D=$(cd "$(dirname "$0")" && pwd)
. "$D/gemein.sh"
. "$D/orte.sh"
schloss landung || exit 0
puls landung "Eichung (stufe/eich.sh: Leerlauf, neben Last, ABAB ankunft.K1#1), danach die Landungs-Schleife"
bash "$ST/eich.sh"
exec bash "$D/landung-dienst.sh"
