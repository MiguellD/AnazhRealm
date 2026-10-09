#!/bin/bash
# Die CI-Schritte 33–75 des playtest-Jobs, die die CI an 884111fc nach dem Flackern in Schritt 32 (Sicht-Arbeit, auch an der
# Basis 6f1aa252) nie erreichte — seriell, je Schritt der Exit-Code, Ports 7900/7905–7909.
cd /c/Users/micha/Desktop/AnazhRealm-OMEN/host-vram
P2=/c/Users/micha/Desktop/AnazhRealm-OMEN/p2
LOG=$P2/waende-rest.log
: > $LOG
schritt() {
    local name=$1; shift
    local t0=$(date +%s)
    "$@" > $P2/rest-$name.txt 2>&1
    local ec=$?
    echo "$(date +%T) SCHRITT $name EXIT=$ec ($(( $(date +%s) - t0 )) s)" | tee -a $LOG
}
echo "$(date +%T) START $(git log -1 --format=%h) $(git status --short | wc -l) geaendert" | tee -a $LOG
schritt foundry-warm env WARM_PORT=7905 npm run gate:foundry-warm
schritt portal-boot env PORTAL_PORT=7906 npm run gate:portal-boot
schritt foundry-deadlock env DEADLOCK_PORT=7907 npm run gate:foundry-deadlock
schritt fernwald env FERNWALD_PORT=7908 npm run gate:fernwald
schritt weg-boden env WEG_PORT=7909 npm run gate:weg-boden
schritt boot-foliage-ring env FOLIRING_PORT=7900 npm run gate:boot-foliage-ring
schritt foundry-impostor env FIMP_PORT=7905 npm run gate:foundry-impostor
schritt v1-resolve env V1_RESOLVE_PORT=7906 npm run gate:v1-resolve
schritt no-second-treebuilder env TREEBUILDER_PORT=7907 npm run gate:no-second-treebuilder
schritt asset-inventory env ASSET_INVENTORY_PORT=7908 npm run gate:asset-inventory
schritt freie-slots env FREIE_SLOTS_PORT=7909 npm run gate:freie-slots
schritt weather-vector env WEATHER_VECTOR_PORT=7900 npm run gate:weather-vector
schritt season-meadow npm run gate:season-meadow
schritt foundry-memory env FOUNDRY_MEMORY_PORT=7905 npm run gate:foundry-memory
schritt s4-impostor-workshop env S4_PORT=7906 npm run gate:s4-impostor-workshop
schritt nervensystem env NERV_PORT=7907 npm run gate:nervensystem
schritt nervensystem-vehicle env NERV_PORT=7908 npm run gate:nervensystem-vehicle
schritt place-policy env PLACE_PORT=7909 npm run gate:place-policy
schritt vehicle-drive env DRIVE_PORT=7900 npm run gate:vehicle-drive
schritt nervensystem-porta env NERV_PORTA_PORT=7905 npm run gate:nervensystem-porta
schritt nervensystem-schmiede env NERV_SCHMIEDE_PORT=7906 npm run gate:nervensystem-schmiede
schritt vehicle-contract npm run gate:vehicle-contract
schritt porta-contract npm run gate:porta-contract
schritt schmiede-contract npm run gate:schmiede-contract
schritt gegenstand-stoff npm run gate:gegenstand-stoff
schritt albedo-tafel env ALBEDO_PORT=7907 npm run gate:albedo-tafel
schritt nervensystem-fachwerk env NERV_FACHWERK_PORT=7908 npm run gate:nervensystem-fachwerk
schritt fachwerk-contract npm run gate:fachwerk-contract
schritt settlement env SETTLEMENT_PORT=7909 npm run gate:settlement
schritt trias env TRIAS_PORT=7900 npm run gate:trias
schritt nervensystem-labs env NERV_LABS_PORT=7905 npm run gate:nervensystem-labs
schritt tier-gang env TIER_GANG_PORT=7906 npm run gate:tier-gang
schritt daten-contract npm run gate:daten-contract
schritt ofen-contract npm run gate:ofen-contract
schritt klang-zensus env KLANG_ZENSUS_PORT=7907 npm run gate:klang-zensus
schritt rezept-katalog env REZEPT_KATALOG_PORT=7908 npm run gate:rezept-katalog
schritt portal-gestalt env PORTAL_GESTALT_PORT=7909 npm run gate:portal-gestalt
schritt portal-konformanz env PORTAL_KONFORMANZ_PORT=7900 npm run gate:portal-konformanz
schritt regler-wirkt env REGLER_WIRKT_PORT=7905 REGLER_WIRKT_OFEN_PORT=7906 npm run gate:regler-wirkt
schritt foundry-crossfade env CROSSFADE_PORT=7907 npm run gate:foundry-crossfade
echo "$(date +%T) REST ENDE" | tee -a $LOG
