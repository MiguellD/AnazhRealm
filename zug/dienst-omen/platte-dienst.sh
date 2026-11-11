#!/bin/bash
# platte-dienst.sh — die Wache der Platte, OHNE zu löschen (Nachfolger von p3/n0611/stufe/platte-wache.sh; Koordinator K10,
# 10.11. 21:20: die OMEN-Platte stand bei 0,4 GB, Pushes und z368 lagen still, ohne dass es jemand sah).
# Alle 2 min C: frei. Unter $PLATTE_UNTEN GB: EINE Zeile „PLATTE <n> GB — angehalten“ nach zug/erledigt.txt, die Landungs-Schleife
# wird samt Baum beendet (start.sh --stopp landung löst auch das Schloss, das ihr Baum hielt), danach alle 14 min eine Wartezeile.
# Ab $PLATTE_OBEN GB: „PLATTE <n> GB — weiter“ und start.sh startet die Landung neu (sie nimmt ihre Liste auf).
# Löschen entscheidet nur der Schöpfer. Ende: start.sh --stopp platte.
D=$(cd "$(dirname "$0")" && pwd)
. "$D/gemein.sh"
. "$D/orte.sh"
schloss platte || exit 0
L=$ST/platte-wache.log
log() { echo "$(date '+%F %T') $*" >>"$L"; }
sag() { melde platte "$1" >>"$L" 2>&1; }
log "START platte-dienst (PID $(cat "$S/platte.pid"), MSYS $$) unten $PLATTE_UNTEN GB, oben $PLATTE_OBEN GB, jetzt $(frei_gb) GB"
halt=0
still=0
while :; do
    f=$(frei_gb)
    if [ $halt = 0 ] && kleiner "$f" "$PLATTE_UNTEN"; then
        log "unter $PLATTE_UNTEN GB: $f"
        bash "$D/start.sh" --stopp landung >>"$L" 2>&1
        sag "PLATTE $f GB — angehalten (C: frei < $PLATTE_UNTEN GB; die Landungs-Schleife steht, weiter erst ab $PLATTE_OBEN GB; Löschen entscheidet der Schöpfer)"
        halt=1
        still=$(date +%s)
    elif [ $halt = 1 ] && ! kleiner "$f" "$PLATTE_OBEN"; then
        log "über $PLATTE_OBEN GB: $f — weiter"
        sag "PLATTE $f GB — weiter (ab $PLATTE_OBEN GB; die Landungs-Schleife startet neu und nimmt ihre Liste auf)"
        bash "$D/start.sh" >>"$L" 2>&1
        halt=0
    elif [ $halt = 1 ] && [ $(($(date +%s) - still)) -ge 840 ]; then
        sag "PLATTE $f GB — wartet (unter $PLATTE_OBEN GB; die Landungs-Schleife steht)"
        still=$(date +%s)
    fi
    puls platte "C: $f GB frei (hält unter $PLATTE_UNTEN, weiter ab $PLATTE_OBEN)$([ $halt = 1 ] && echo ' — Landung ANGEHALTEN')"
    sleep 120
done
