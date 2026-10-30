#!/bin/bash
# zug/dienst-urteil.sh — Station (messplatz.sh fahre_station, 30.10.): setzt das Urteil des Diensts ($H/urteil.cjs) auf koordination
# bericht/2310-omen-runner/messplatz/urteil.cjs (KLAR NACH 2+2: zwei stetige Kern-Größen > 4σ und > 10 % urteilen LANGSAMER ohne 4+4).
# Getauscht wird nur, wenn die OMEN-Kopie dem alten Stand cc1bfc00 gleicht — sonst ABWEICHUNG mit Diff, nichts überschrieben. urteil.cjs
# startet je Serie neu: der Tausch zwischen zwei Aufträgen ist sicher. Die alte Kopie bleibt in $OUT.
H=$(dirname "$(dirname "$OUT")"); NEU="$H/koord/bericht/2310-omen-runner/messplatz/urteil.cjs"; ALT=cc1bfc00847b921e4413a7a967c6734a193af947
ist=$(tr -d '\r' < "$H/urteil.cjs" | git hash-object --stdin); neu=$(tr -d '\r' < "$NEU" | git hash-object --stdin)
echo "OMEN-Kopie $ist · alter Stand $ALT · neuer Stand $neu"; cp "$H/urteil.cjs" "$OUT/urteil.cjs.alt"
[ "$ist" = "$neu" ] && { echo "schon neu"; exit 0; }
if [ "$ist" != "$ALT" ]; then echo "ABWEICHUNG: die OMEN-Kopie ist weder alt noch neu — nichts überschrieben"; diff <(git -C "$H/koord" show $ALT | tr -d '\r') <(tr -d '\r' < "$H/urteil.cjs") | head -n 60; exit 3; fi
cp "$NEU" "$H/urteil.cjs" && node --check "$H/urteil.cjs" && echo "getauscht: KLAR NACH 2+2 aktiv"
