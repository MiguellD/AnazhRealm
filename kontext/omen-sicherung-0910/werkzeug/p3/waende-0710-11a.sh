#!/bin/bash
# 0710-11 (1): die Wände des Raum-Tag-Gedächtnisses (seriell, Ports 7905–7909; der volle Playtest auf seinem :4312)
cd /c/Users/micha/Desktop/AnazhRealm-OMEN/welle-m-boosts
P3=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3
LOG=$P3/waende-0710-11a.log; : > $LOG
schritt() { local name=$1; shift; local t0=$(date +%s); "$@" > $P3/boosts/w-$name.txt 2>&1; echo "$(date +%T) SCHRITT $name EXIT=$? ($(( $(date +%s) - t0 )) s)" | tee -a $LOG; }
schritt raum-tags env RAUM_TAGS_PORT=7905 npm run gate:raum-tags
schritt brennglas-takt env BRENNGLAS_TAKT_PORT=7906 npm run gate:brennglas-takt
schritt takt env TAKT_PORT=7907 npm run gate:takt
schritt werkstatt-weg env WERKSTATT_WEG_PORT=7908 npm run gate:werkstatt-weg
schritt klang-zensus env KLANG_ZENSUS_PORT=7909 npm run gate:klang-zensus
schritt nervensystem-labs env NERV_LABS_PORT=7905 npm run gate:nervensystem-labs
schritt nervensystem-schmiede env NERV_SCHMIEDE_PORT=7906 npm run gate:nervensystem-schmiede
schritt playtest-fast env FAST_PORT=7907 npm run playtest:fast
schritt playtest npm run playtest
echo "$(date +%T) ENDE" | tee -a $LOG
