#!/bin/bash
# landung-dienst.sh — die OMEN misst nach jeder Landung, ohne LLM und ohne Ende (Nachfolger von p3/n0611/stufe/landung.sh, das als
# Kind der App am 10.11. 21:52 mit dem Konto-Wechsel starb: Station 8 von 32 blieb liegen, das GPU-Schloss hing verwaist an pid 11320).
# Am JÜNGSTEN main: `punkte.cjs gtx-nutzen --kopf <K>` ohne profiband.* (stufe/ohne-band.cjs), je Station EINE Sitzung
# (kandidat.sh EINZELN=1), Push nach punkte-maschine + eine Zeile mit der ROHEN Zahl je Station nach zug/erledigt.txt (ZAHL=1).
# CI vor Messung und das Schloss entscheidet kandidat.sh über p3/gpu-schloss.sh (gpu_frei, cpu_ruhe, Verdrängung durch gpu-lauf.sh).
# WEICH AN DER GRENZE (12.11.): ein CI-Job, der im Start-Hook am Schloss wartet, bekommt die Karte an der Grenze der laufenden Station
#   (gpu-lauf.sh GPU_LAUF_WEICH_S, kandidat.sh setzt 600 s); eine gefallene Station stellt sich ans Ende der Liste (kandidat.sh).
# WAS EINE LANDUNG NICHT TRAF, BLEIBT: gtx-nutzen IST das Frische-Urteil der Buchung (R6 nach Konsum) ∩ „ändert Punkte“ — an f46b9e81
#   40 von 115 offenen (`run --offen --trocken` nennt 115); eine Messung des vorigen Kopfs, deren Konsum der Zug nicht traf, steht nicht
#   in der Liste. 3552f058 → f46b9e81 traf alle fünf Urteile der GTX (`beruehrt`: index.html, scripts/werkbank.cjs, stamm/…).
# AUFNEHMEN STATT NEU: Stationen, die an diesem Kopf schon einen Eintrag in der gepushten Mess-Datei tragen, fährt ein neu
#   gestarteter Dienst nicht noch einmal (stufe/offen-am-kopf.cjs) — ein Neustart kostet höchstens die Station, die gerade lief.
# PLATTE: unter $PLATTE_UNTEN GB frei beginnt keine Liste (der Platz ist Teil des Messplatzes; platte-dienst.sh hält eine laufende an).
# NACH DER LISTE DER RICHTER: richter.sh gtx --kopf <K> (Fälle gegen die letzte Buchung, Halbierung, EINE Zeile TÄTER).
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
# DER RICHTER NACH DER LANDUNG (zug/dienst/richter.sh): GRÜN → ROT gegen die letzte Buchung ist ein FALL, er halbiert und nennt den
# Täter in zug/richter.txt — nach der Liste, vor der nächsten Landung (ein schon genannter Fall wird nicht noch einmal halbiert)
richte() {
    bash "$D/richter.sh" gtx --kopf "$1" >>"$L" 2>&1 &
    local rp=$!
    while kill -0 $rp 2>/dev/null; do
        puls landung "Richter am main ${1:0:8}: $(tail -n 1 "$S/richter/richter.log" 2>/dev/null | cut -c21-170)"
        sleep 30
    done
    wait $rp
}
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
        # DIE REIHE (12.11., stufe/reihe.cjs): wer am längsten ohne Messung ist, zuerst; wessen letzte Fahrt ≥ 10 min lief, zuletzt —
        # jede Landung begann die Liste sonst mit denselben ersten Stationen (3d4ac0ae 5/30, 3552f058 8/31), der Rest fuhr nie
        [ -n "$REST" ] && R2=$(node "$ST/reihe.cjs" "$REST" 2>>"$L" | tr -d '\r') && [ "$(zahl "$R2")" = "$(zahl "$REST")" ] && REST=$R2
        a=$(zahl "$ALLE")
        n=$(zahl "$BILD")
        r=$(zahl "$REST")
        log "main ${K:0:8}: gtx-nutzen $a, ohne /band $n, davon offen $r: ${REST:-keine}"
        if [ -n "$REST" ]; then
            NAME=gtx-${K:0:8}
            [ "$r" != "$n" ] && NAME=$NAME-w$(date +%H%M) # aufgenommen: eigener Name, damit keine Zeile und keine Ausgabe doppelt heißt
            sag "landung Zwischenstand main ${K:0:8}: misst $r Stationen aus gtx-nutzen ($a) je allein ($((n - r)) tragen an diesem Kopf schon einen Eintrag, $((a - n)) profiband.* ruhen), rohe Zahl je Zeile"
            # DER SPRUNG (Koordinator 11.11. 14:33): landet ein Zug, während die Liste läuft, endet sie nach der laufenden Station
            # (kandidat.sh SPRUNG) und die Schleife nimmt den jüngsten Kopf. Am 11.11. maß die GTX 6 von 32 Stationen am 523e3a38,
            # während main seit zwei Stunden e699a834 hieß: die Züge lassen der Karte Fenster von 15–20 min, eine Liste braucht Stunden.
            SPRUNG=$S/landung.sprung
            rm -f "$SPRUNG"
            KOPF=$K EINZELN=1 SPRUNG=$SPRUNG bash "$N/kandidat.sh" "$NAME" x "$REST" >>"$L" 2>&1 &
            kp=$!
            t=0
            while kill -0 $kp 2>/dev/null; do
                puls landung "misst main ${K:0:8} ($r Stationen): $(tail -n 1 "$N/kette-0711.log" | cut -c1-150)"
                sleep 30
                t=$((t + 1))
                if [ $((t % 4)) = 0 ] && [ ! -f "$SPRUNG" ]; then
                    git -C "$M" fetch -q origin main 2>/dev/null
                    K2=$(git -C "$M" rev-parse origin/main)
                    if [ -n "$K2" ] && [ "$K2" != "$K" ]; then
                        touch "$SPRUNG"
                        log "SPRUNG: main ${K:0:8} -> ${K2:0:8}, die Liste endet nach der laufenden Station"
                    fi
                fi
            done
            wait $kp
            if [ -f "$SPRUNG" ]; then
                rm -f "$SPRUNG"
                sag "landung Zwischenstand main ${K:0:8}: die Liste endete am Sprung (main ist weiter) — was gemessen war, ist gepusht; Summe und Richter fahren am jüngsten Kopf"
            else
                summe "$K" "gtx-${K:0:8}" "$BILD"
                richte "$K"
            fi
        elif [ "$n" -gt 0 ]; then
            log "main ${K:0:8}: alle $n Stationen tragen schon einen Eintrag"
            richte "$K"
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
