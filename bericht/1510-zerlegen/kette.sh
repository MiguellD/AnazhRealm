#!/bin/bash
# 15.10. die Kette nach der Zerlegung: Loop-Probe Genesis Ego (der Bündel-Befund) → Kalt-Zeile (p3/k1510b/kalt.sh) →
# 1510-k68-abab (p3/k1510k68/serie.sh). Jeder Teil nimmt und löst das GPU-Schloss selbst.
R=/c/Users/micha/Desktop/AnazhRealm-OMEN
until grep -q "ZERLEGEN FERTIG" $R/p3/k1510z/fortschritt.log 2>/dev/null; do sleep 20; done
bash $R/p3/k1510z/loop-probe.sh > $R/p3/k1510z/loop-probe.out 2>&1
bash $R/p3/k1510b/kalt.sh > $R/p3/k1510b/kalt.out 2>&1
bash $R/p3/k1510k68/serie.sh > $R/p3/k1510k68/serie.out 2>&1
