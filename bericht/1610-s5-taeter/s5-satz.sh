#!/bin/bash
# s5-satz.sh — Frost-S5 Täter (frost-probe = cee33f91 + PROBE v5): F = 36 Schritte nur Welt-Frames (E.leeren = 8× _loopRender, kein
# Regler-Wert, kein Ofen), Z = 36 Regler-Züge; je Lauf die Chunk-Sätze vor/nach und jedes Satz-Array von vorher: tot · aktuell · verwaist
R=/c/Users/micha/Desktop/AnazhRealm-OMEN; O=$R/p3/k1610v/s5v
. $R/p3/gpu-schloss.sh; mkdir -p $O
for L in F Z; do schloss_nehmen "omen-s5-satz $L"
  if [ $L = F ]; then export PROBE_NUR_FRAMES=1; else unset PROBE_NUR_FRAMES; fi
  ( cd $R/frost-probe && t=$(date +%s) && CI=true CI_KLASSE=gpu LINSE_GPU=karte node scripts/diag-weltbild-frost.cjs --echt; echo "EXIT=$? DAUER=$(( $(date +%s) - t )) s" ) > $O/$L.txt 2>&1
  schloss_loesen "omen-s5-satz $L"; echo "$L $(grep -o 'S5 der JS-Speicher.*' $O/$L.txt | cut -c1-120)"; sleep 20; done
echo S5-SATZ FERTIG
