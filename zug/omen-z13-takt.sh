#!/bin/bash
# Station (OMEN-Forschung, Koordinator 24.10.): z13 — die Zerlegung des Dorf-CPU-Takts (d-ego stehend: C95 4,72 → 4,97) je Methode,
# A = 833bbc24 gegen B = 056330d8 (main), 2+2 Boots, Regler voll, Instrument = die Werkbank von B (main). Serie p3/messplatz/serie.sh,
# Zelle d-takt (takt 60 --wandern aus); Auswertung p3/n2410/z13/takt-delta.cjs (Selbst- und Gesamt-ms je Takt ab p95 und über alle
# Takte, ohne die 0,25-ms-Schwelle) → $OUT/delta.txt + delta.json. Die Roh-Spuren (~2 MB je Boot) bleiben auf der OMEN: p3/n2410/z13/roh/.
set -u
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3
A=833bbc244711329e2e23305ed857d7e53a47e20e; B=056330d8a70fcdc617df8c3ff62ec174c5d33995
TA=$(bash $H/messplatz/messplatz.sh --baum $A) || exit 2
TB=$(bash $H/messplatz/messplatz.sh --baum $B) || exit 2
MP_A=$TA MP_B=$TB MP_OUT=$OUT MP_LOCK=omen-mp MP_INS=B ZELLEN=d-takt bash $H/messplatz/serie.sh > $OUT/serie.out 2>&1
D=$OUT/takt; R=$H/n2410/z13/roh; mkdir -p $R
m() { cygpath -m "$1"; }
node $H/n2410/z13/takt-delta.cjs "$(m $TB)" "$(m $D/d-takt-A1-takt.roh.json),$(m $D/d-takt-A2-takt.roh.json)" \
    "$(m $D/d-takt-B1-takt.roh.json),$(m $D/d-takt-B2-takt.roh.json)" --json "$(m $OUT/delta.json)" > $OUT/delta.txt 2>&1; E=$?
mv $D/*.roh.json $R/ 2>/dev/null
exit $E
