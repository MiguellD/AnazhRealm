#!/bin/bash
# landung-dienst.sh — die OMEN misst nach jeder Landung, ohne LLM und ohne Ende (Nachfolger von p3/n0611/stufe/landung.sh, das als
# Kind der App am 10.11. 21:52 mit dem Konto-Wechsel starb: Station 8 von 32 blieb liegen, das GPU-Schloss hing verwaist an pid 11320).
# Am JÜNGSTEN main: `punkte.cjs gtx-nutzen --kopf <K>` ohne profiband.* (stufe/ohne-band.cjs), je Station EINE Sitzung
# (kandidat.sh EINZELN=1), Push nach punkte-maschine + eine Zeile mit der ROHEN Zahl je Station nach zug/erledigt.txt (ZAHL=1).
# CI vor Messung und das Schloss entscheidet kandidat.sh über p3/gpu-schloss.sh (gpu_frei, cpu_ruhe, Verdrängung durch gpu-lauf.sh).
# AUFNEHMEN STATT NEU: Stationen, die an diesem Kopf schon einen Eintrag in der gepushten Mess-Datei tragen, fährt ein neu
#   gestarteter Dienst nicht noch einmal (stufe/offen-am-kopf.cjs) — ein Neustart kostet höchstens die Station, die gerade lief.
# PLATTE: unter $PLATTE_UNTEN GB frei beginnt keine Liste (der Platz ist Teil des Messplatzes; platte-dienst.sh hält eine laufende an).
# Halt zwischen zwei Listen: Datei zustand/landung.halt. Wartet die Karte, alle 14 min eine Zeile. Gebucht wird am Laptop.
D=$(cd "$(dirname "$0")" && pwd)
. "$D/gemein.sh"
. "$D/orte.sh"
schloss landung || exit 0
L=$ST/landung.log
export ZAHL=1 # je Station die rohe Zahl in der Zeile, auch bei UNGEMESSEN (Koordinator 10.11. 13:25)
log() { echo "$(date '+%F %T') $*" >>"$L"; }
halt() { [ -f "$S/landung.halt" ] && { log "HALT (landung.halt)"; rm -f "$S/landung.halt"; puls landung "HALT (landung.halt) — steht"; exit 3; }; }
sag() { melde la "$1" >>"$L" 2>&1; }
summe() { echo "$3" >"$ST/liste-$2.txt"; ZEILE_NAME="gpu-stufe $2" ZEILE_DIR=$ST node "$N/zeile-da0e.cjs" "$1" "$ST/liste-$2.txt" >>"$L" 2>&1; }
zahl() { echo "$1" | tr ',' '\n' | grep -c .; }
log "START landung-dienst (PID $(cat "$S/landung.pid"), MSYS $$)"
ALT=
still=$(date +%s)
while :; do
    halt
    f=$(frei_gb)
    if kleiner "$f" "$PLATTE_UNTEN"; then
        puls landung "wartet: C: $f GB frei < $PLATTE_UNTEN GB — keine Messung, Löschen entscheidet der Schöpfer"
        sleep 120
        continue
    fi
    git -C "$M" fetch -q origin main 2>/dev/null
    K=$(git -C "$M" rev-parse origin/main)
    if [ -n "$K" ] && [ "$K" != "$ALT" ]; then
        puls landung "neuer main-Kopf ${K:0:8}: liest gtx-nutzen"
        git -C "$PM" fetch -q origin +refs/heads/punkte-maschine:refs/omen/dauer-pm && git -C "$PM" checkout -q --detach --force refs/omen/dauer-pm
        ALLE=$(cd "$PM/meisterkarte-quelle/punkte" && timeout 900 node punkte.cjs gtx-nutzen --kopf "$K" 2>>"$L" | sed -n 's/^nur=//p' | tr -d '\r')
        BILD=$(node "$ST/ohne-band.cjs" "$ALLE" 2>>"$L" | tr -d '\r')
        REST=$(node "$ST/offen-am-kopf.cjs" "$K" "$BILD" 2>>"$L" | tr -d '\r')
        a=$(zahl "$ALLE")
        n=$(zahl "$BILD")
        r=$(zahl "$REST")
        log "main ${K:0:8}: gtx-nutzen $a, ohne /band $n, davon offen $r: ${REST:-keine}"
        if [ -n "$REST" ]; then
            NAME=gtx-${K:0:8}
            [ "$r" != "$n" ] && NAME=$NAME-w$(date +%H%M) # aufgenommen: eigener Name, damit keine Zeile und keine Ausgabe doppelt heißt
            sag "landung Zwischenstand main ${K:0:8}: misst $r Stationen aus gtx-nutzen ($a) je allein ($((n - r)) tragen an diesem Kopf schon einen Eintrag, $((a - n)) profiband.* ruhen), rohe Zahl je Zeile"
            KOPF=$K EINZELN=1 bash "$N/kandidat.sh" "$NAME" x "$REST" >>"$L" 2>&1 &
            kp=$!
            while kill -0 $kp 2>/dev/null; do
                puls landung "misst main ${K:0:8} ($r Stationen): $(tail -n 1 "$N/kette-0711.log" | cut -c1-150)"
                sleep 30
            done
            wait $kp
            summe "$K" "gtx-${K:0:8}" "$BILD"
        elif [ "$n" -gt 0 ]; then
            log "main ${K:0:8}: alle $n Stationen tragen schon einen Eintrag"
        else
            sag "landung Zwischenstand main ${K:0:8}: gtx-nutzen nennt $a Stationen, nur profiband.* (ruhen) — die GTX wartet"
        fi
        ALT=$K
        still=$(date +%s)
    elif [ $(($(date +%s) - still)) -ge 840 ]; then
        sag "landung Zwischenstand: die GTX wartet auf die nächste Landung (main ${ALT:0:8} gemessen ohne profiband.*)"
        still=$(date +%s)
    fi
    puls landung "wartet auf die nächste Landung (main ${ALT:0:8} gemessen)"
    sleep 60
done
