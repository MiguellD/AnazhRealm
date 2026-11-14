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
# HALT: Datei zustand/landung.halt — eine laufende Liste endet an der nächsten Stations-Grenze, die Schleife endet, und die Flagge
#   BLEIBT liegen, bis der Koordinator sie wegnimmt (rm, dann start.sh); start.sh startet die Landung nicht, solange sie liegt, und
#   --blick zeigt „GEHALTEN seit …“. Bis 14.11. löschte halt() die Flagge selbst — das nächste start.sh (15:31, für puls) startete
#   die Landung wieder.
# DER MACHER HAT VORRANG (14.11.: Landung und Macher teilten das GPU-Schloss, der Macher wartete je Lauf 954–2368 s für 20–550 s
#   Arbeit — zwischen zwei Stationen nahm die nächste Station das Schloss, bevor sein 15-s-Takt griff): wartet ein Lauf am Schloss
#   (schloss_wartende in gemein.sh, die EINE Quelle schloss-puls.cjs wie radeon-dienst.sh; die eigenen punkte-* und der CI-Job —
#   ihn lässt gpu-lauf.sh WEICH an der Grenze vor — zählen nicht), WEICHT die Liste: sie endet an der nächsten Stations-Grenze
#   (kandidat.sh SPRUNG), was gemessen ist, ist gepusht (BEHALTEN), und keine Liste beginnt, solange jemand wartet — die Landung
#   stellt sich HINTEN an und nimmt ihre Liste am selben Kopf auf (offen-am-kopf.cjs). Beweis: `bash landung-dienst.sh --selbsttest`.
# Wartet die Karte, alle 14 min eine Zeile. Gebucht wird am Laptop.
D=$(cd "$(dirname "$0")" && pwd)
if [ -f "$D/gemein.sh" ]; then . "$D/gemein.sh"; else . "$D/../dienst/gemein.sh"; fi
export ZAHL=1 # je Station die rohe Zahl in der Zeile, auch bei UNGEMESSEN (Koordinator 10.11. 13:25)
TAKT_S=30
log() { echo "$(date '+%F %T') $*" >>"$L"; }
halt() { [ -f "$S/landung.halt" ] && { log "HALT (landung.halt, seit $(date -r "$S/landung.halt" '+%F %H:%M')) — die Flagge bleibt"; puls landung "GEHALTEN (landung.halt) — steht, bis die Flagge fällt"; exit 3; }; }
sag() { melde la "$1" >>"$L" 2>&1; }
warter() { schloss_wartende omen punkte- | tr ' ' '\n' | grep -v '^CI-Job' | tr '\n' ' ' | sed 's/ $//'; }
main_kopf() { git -C "$M" fetch -q origin main 2>/dev/null; git -C "$M" rev-parse origin/main; }
darf_beginnen() { WT=$(warter); [ -z "$WT" ]; } # HINTEN AN: eine Liste beginnt nur, wenn keiner am Schloss wartet
gepusht() { tail -n +$(($1 + 1)) "$KETTE_LOG" 2>/dev/null | grep -cE " $2-[0-9]+ GEPUSHT"; } # <zeilen vorher> <name>
# liste_fahren <K> <NAME> <REST> <r> — EINE Liste über kandidat.sh, je Station eine Sitzung; 0 durch · 1 Sprung (main weiter) ·
# 2 GEWICHEN (ein Lauf wartete am Schloss; BEHALTEN = gepushte Stationen) · 3 GEHALTEN (landung.halt)
liste_fahren() {
    local K=$1 NAME=$2 REST=$3 r=$4 kp t l0 K2 grund=
    SPRUNG=$S/landung.sprung
    rm -f "$SPRUNG"
    WEICHT_VOR= BEHALTEN=0
    l0=$(wc -l <"$KETTE_LOG" 2>/dev/null || echo 0)
    KOPF=$K EINZELN=1 SPRUNG=$SPRUNG bash "$KANDIDAT" "$NAME" x "$REST" >>"$L" 2>&1 &
    kp=$!
    t=0
    while kill -0 $kp 2>/dev/null; do
        puls landung "misst main ${K:0:8} ($r Stationen)${WEICHT_VOR:+ — WEICHT vor $WEICHT_VOR}: $(tail -n 1 "$KETTE_LOG" 2>/dev/null | cut -c1-150)"
        sleep $TAKT_S
        t=$((t + 1))
        [ -f "$SPRUNG" ] && continue
        if [ -f "$S/landung.halt" ]; then
            grund=halt
            touch "$SPRUNG"
            log "HALT: landung.halt liegt — die Liste endet nach der laufenden Station"
            continue
        fi
        WEICHT_VOR=$(warter)
        if [ -n "$WEICHT_VOR" ]; then
            grund=weicht
            touch "$SPRUNG"
            log "WEICHT: am Schloss wartet $WEICHT_VOR — die Karte geht an der nächsten Stations-Grenze frei"
            continue
        fi
        if [ $((t % 4)) = 0 ]; then
            K2=$(main_kopf)
            if [ -n "$K2" ] && [ "$K2" != "$K" ]; then
                grund=sprung
                touch "$SPRUNG"
                log "SPRUNG: main ${K:0:8} -> ${K2:0:8}, die Liste endet nach der laufenden Station"
            fi
        fi
    done
    wait $kp
    rm -f "$SPRUNG"
    BEHALTEN=$(gepusht "$l0" "$NAME")
    case "$grund" in
        weicht) log "ABGEBROCHEN main ${K:0:8}: $WEICHT_VOR wartete am Schloss — BEHALTEN $BEHALTEN Station(en), der Rest stellt sich hinten an"; return 2 ;;
        halt) return 3 ;;
        sprung) return 1 ;;
    esac
    return 0
}

# ── DER SELBSTTEST (trocken, ohne OMEN): ein Temp-Ordner mit Stummel-kandidat.sh (je Station 0,4 s, prüft SPRUNG vor jeder Station,
# schreibt „<name>-<n> GEPUSHT“ wie kandidat.sh und eine Zeile je gepushter Station), der Warter als Datei (er erscheint nach Station 2).
# b  der Warter → die Liste WEICHT an der nächsten Grenze, BEHALTEN = die gepushten (2–7 von 8), keine Liste beginnt, solange er wartet,
#    danach misst die Aufnahme nur den Rest (zusammen 8, keine doppelt)
# c  landung.halt → halt() endet mit Exit 3 und die Flagge BLEIBT; eine Liste endet an der Grenze, wenn die Flagge mitten drin kommt
# Mutanten: „blind“ (warter leer: die Liste fährt durch) · „halt-rm“ (das alte halt(), das die Flagge löscht) — beide ROT.
st_lauf() { # $1 = Mutante (leer = echt)
    local X rc b n alle rest
    X=$(mktemp -d)
    S=$X/s L=$X/landung.log KETTE_LOG=$X/kette.log KANDIDAT=$X/kandidat.sh TAKT_S=0.1
    mkdir -p "$S"
    cat >"$KANDIDAT" <<'STUMMEL'
#!/bin/bash
# kandidat.sh-Stummel: $1 Name, $3 Liste; SPRUNG vor jeder Station (wie kandidat.sh), je Station 0,4 s, gepusht = eine Zeile
X=$(dirname "$0"); i=0
for s in ${3//,/ }; do
    [ -n "$SPRUNG" ] && [ -f "$SPRUNG" ] && { echo "$(date +%T) $1 SPRUNG nach $i" >>"$X/kette.log"; break; }
    i=$((i + 1)); sleep 0.4
    echo "$s" >>"$X/gepusht"; echo "$(date +%T) $1-$i GEPUSHT (Versuch 1)" >>"$X/kette.log"
    [ -f "$X/warter_nach" ] && [ "$(cat "$X/warter_nach")" = "$i" ] && echo macher-hand >"$X/warter"
    [ -f "$X/halt_nach" ] && [ "$(cat "$X/halt_nach")" = "$i" ] && touch "$X/s/landung.halt"
done
STUMMEL
    puls() { echo "PULS $*" >>"$L"; }
    warter() { cat "$X/warter" 2>/dev/null; }
    main_kopf() { echo kopf1; }
    case "$1" in
        blind) warter() { :; } ;;
        halt-rm) halt() { [ -f "$S/landung.halt" ] && { rm -f "$S/landung.halt"; exit 3; }; } ;;
    esac
    alle=s1,s2,s3,s4,s5,s6,s7,s8
    # b
    echo 2 >"$X/warter_nach"
    liste_fahren kopf1 gtx-kopf1 "$alle" 8
    rc=$?
    b=$BEHALTEN
    n=$(wc -l <"$X/gepusht")
    vor=nein
    darf_beginnen || vor=$WT
    rm -f "$X/warter" "$X/warter_nach"
    darf_beginnen || vor=nein
    rest=$(grep -vxF -f "$X/gepusht" <(echo "$alle" | tr ',' '\n') | tr '\n' ',' | sed 's/,$//')
    liste_fahren kopf1 gtx-kopf1-w1 "$rest" "$(echo "$rest" | tr ',' '\n' | grep -c .)"
    rc2=$?
    if [ $rc = 2 ] && [ "$b" -ge 2 ] && [ "$b" -le 7 ] && [ "$n" = "$b" ] && [ "$vor" = macher-hand ] && [ $rc2 = 0 ] && [ "$(sort -u "$X/gepusht" | wc -l)" = 8 ] &&
        [ "$(wc -l <"$X/gepusht")" = 8 ] && grep -q "WEICHT: am Schloss wartet macher-hand" "$L" && grep -q "ABGEBROCHEN main kopf1: macher-hand wartete am Schloss — BEHALTEN $b Station(en)" "$L"; then
        echo "OK b  Warter nach Station 2: WEICHT, an der Grenze ABGEBROCHEN, BEHALTEN $b von 8 (gepusht $n) · solange er wartet, beginnt keine Liste (warter: $vor) · die Aufnahme maß die übrigen $((8 - b)), keine doppelt"
    else echo "ROT b  Warter: Ende $rc (Soll 2), BEHALTEN $b (Soll 2–7, gepusht $n), Beginn gesperrt für $vor (Soll macher-hand), Aufnahme $rc2 (Soll 0), zusammen $(wc -l <"$X/gepusht") / eindeutig $(sort -u "$X/gepusht" | wc -l) (Soll 8/8)"; fi
    # c — die Flagge bleibt
    touch "$S/landung.halt"
    (halt) >/dev/null 2>&1
    rc=$?
    if [ $rc = 3 ] && [ -f "$S/landung.halt" ]; then echo "OK c  halt(): Exit 3, landung.halt liegt weiter"
    else echo "ROT c  halt(): Exit $rc (Soll 3), Flagge $([ -f "$S/landung.halt" ] && echo liegt || echo FORT)"; fi
    rm -f "$S/landung.halt" "$X/gepusht"
    echo 3 >"$X/halt_nach"
    liste_fahren kopf1 gtx-kopf1-h "$alle" 8
    rc=$?
    n=$(wc -l <"$X/gepusht")
    if [ $rc = 3 ] && [ "$n" -ge 3 ] && [ "$n" -le 7 ] && [ -f "$S/landung.halt" ]; then echo "OK c  Flagge mitten in der Liste: Ende an der Grenze nach $n von 8, die Flagge liegt"
    else echo "ROT c  Flagge mitten in der Liste: Ende $rc (Soll 3) nach $n von 8, Flagge $([ -f "$S/landung.halt" ] && echo liegt || echo FORT)"; fi
    command rm -rf "$X"
}
selbsttest() {
    local O m r rot=0 mr=0
    O=$(mktemp -d)
    for m in echt blind halt-rm; do (st_lauf "${m#echt}" >"$O/$m" 2>&1) & done
    wait
    grep -E "^(OK|ROT)" "$O/echt" | sed 's/^/  /'
    grep -q "^ROT" "$O/echt" && rot=1
    [ "$(grep -c "^OK" "$O/echt")" = 3 ] || rot=1
    for m in blind halt-rm; do
        r=$(grep "^ROT" "$O/$m" | cut -c1-140)
        if [ -n "$r" ]; then mr=$((mr + 1)); echo "  Mutante „$m“ ROT an: $(echo "$r" | cut -c5-100 | tr '\n' '|' | sed 's/|$//;s/|/ · /g')"; else echo "  Mutante „$m“ bleibt GRÜN"; fi
    done
    rm -rf "$O"
    if [ $rot = 0 ] && [ $mr = 2 ]; then echo "landung-dienst SELBSTTEST GRÜN: 3 Fälle grün, $mr/2 Mutanten ROT"; return 0; fi
    echo "landung-dienst SELBSTTEST ROT"
    return 1
}
[ "$1" = --selbsttest ] && { selbsttest; exit $?; }

. "$D/orte.sh"
KANDIDAT=$N/kandidat.sh
KETTE_LOG=$N/kette-0711.log
schloss landung || exit 0
L=$ST/landung.log
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
    K=$(main_kopf)
    if [ -n "$K" ] && [ "$K" != "$ALT" ]; then
        # HINTEN AN: wartet ein Lauf am Schloss, beginnt keine Liste — erst wenn keiner mehr wartet (er hält die Karte oder ist durch),
        # stellt sich die Landung ans Schloss
        if ! darf_beginnen; then
            puls landung "wartet hinten: am GPU-Schloss wartet $WT — der Macher hat Vorrang (main ${K:0:8} offen)"
            sleep 30
            continue
        fi
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
            liste_fahren "$K" "$NAME" "$REST" "$r"
            case $? in
                0) summe "$K" "gtx-${K:0:8}" "$BILD"
                   richte "$K" ;;
                1) sag "landung Zwischenstand main ${K:0:8}: die Liste endete am Sprung (main ist weiter) — was gemessen war, ist gepusht; Summe und Richter fahren am jüngsten Kopf" ;;
                2) sag "landung ABGEBROCHEN main ${K:0:8}: $WEICHT_VOR wartete am GPU-Schloss — BEHALTEN $BEHALTEN Station(en) (gepusht), $((r - BEHALTEN)) stellen sich hinten an"
                   continue ;; # ALT bleibt: die nächste Runde nimmt die Liste am selben Kopf auf, sobald keiner mehr wartet
                3) continue ;; # landung.halt: halt() oben endet die Schleife, die Flagge bleibt
            esac
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
