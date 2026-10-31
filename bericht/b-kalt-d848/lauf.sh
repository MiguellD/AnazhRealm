#!/bin/bash
# Station (prio 3) für den Messplatz: die Kalt-Zeile der Ankunft (Pflicht-OFFEN B) am Baum $BAUM, dreimal mit leerem Profil,
# echte GPU über das GPU-Schloss der OMEN. Ergebnis je Lauf: $OUT/kalt-<n>.json + .out, Zusammenfassung $OUT/urteil.txt.
set -u
cd "$BAUM" || exit 2
GL=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/gpu-lauf.sh
for n in 1 2 3; do
    BOOT_STAGE_PORT=$((4460 + n)) GPU_LAUF_MAX_S=600 bash "$GL" ankunft-kalt \
        node scripts/diag-boot-stage.cjs --kalt --echt --sek 90 --json "$OUT/kalt-$n.json" --bild "$OUT/kalt-$n.png" \
        > "$OUT/kalt-$n.out" 2>&1
    echo "lauf $n exit $?" >> "$OUT/urteil.txt"
    grep -E "Weltbild|t\(Weltbild\)|URTEIL|ROT|GRÜN" "$OUT/kalt-$n.out" | tail -4 >> "$OUT/urteil.txt"
done
