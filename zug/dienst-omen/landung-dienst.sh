#!/bin/bash
# landung-dienst.sh — die OMEN misst die Stationen der Karte, ohne LLM und ohne Ende (Nachfolger von p3/n0611/stufe/landung.sh, das als
# Kind der App am 10.11. 21:52 mit dem Konto-Wechsel starb: Station 8 von 32 blieb liegen, das GPU-Schloss hing verwaist an pid 11320).
# DAS GESETZ DER RUNDE (Koordinator 19.11.; Befund: seit dem 17.11. begann dieser Dienst an 25 main-Köpfen eine Liste von 54 Stationen,
#   0 von 25 liefen bis zum Ende, Median 5 — jeder neue main-Kopf brach die Liste ab, die Regel SPRUNG vom 11.11./16.11. ist GEFALLEN):
#   1 EIN Mess-Kopf je Runde in EINER Datei: koordination zug/runde.txt (Kopf, Startzeit, Stand je Gerät; geschrieben nur über
#     zug/dienst/runde.cjs — frischer Stand, eigene Zeile, commit-tree, Push, sonst von vorn: zwei Geräte, kein Merge). Die OMEN fährt
#     ihre ganze Liste an DIESEM Kopf zu Ende, keine Landung löst sie ab; die nächste Runde nimmt den main-Kopf des Moments, in dem
#     beide Geräte durch sind (runde.cjs durch/weiter). So steht nach jeder Runde jede Station als Paar am SELBEN Kopf (Karte 2).
#   2 DIE REIHE (runde.cjs reihe, EINE Quelle für beide Geräte): zuerst die Stationen ohne gebucht grünes Paar, dann die gebucht grünen;
#     darin die älteste Messung zuerst, eine Fahrt ≥ 10 min zuletzt. Die Liste wird beim Eintritt in die Runde EINGEFROREN (Feld liste).
#   3 DER RICHTER DER RUNDE (richte_runde): nach der Liste nennt runde.cjs faelle jede Station, die am vorigen Mess-Kopf GRÜN und am
#     jetzigen ROT misst; NUR sie wird über die Köpfe dazwischen halbiert (richter.sh --fall <station> <vorher> <kopf>, Täter beim Namen).
#     Die erste Runde (kein voriger Mess-Kopf) richtet gegen die letzte Buchung (richter.sh --kopf, wie bis 19.11.).
#   4 HALT, WEICHEN, NEUSTART setzen an DERSELBEN Station fort: was gepusht ist, trägt einen Eintrag in messung/<kopf8>-gtx.json
#     (runde.cjs offen), der Rest der eingefrorenen Liste folgt in ihrer Reihe — nie von vorn.
#   5 ALARM: ein Gerät ohne Fortschritt > 15 min in der Runde steht beim Namen in zug/erledigt.txt (runde.cjs alarm, je Takt; dieselbe
#     Zeile erst wieder nach 60 min) — die Runde wartet nicht still.
# Je Station EINE Sitzung (kandidat.sh EINZELN=1), Push nach punkte-maschine + eine Zeile mit der ROHEN Zahl je Station nach
# zug/erledigt.txt (ZAHL=1). CI vor Messung und das Schloss entscheidet kandidat.sh über p3/gpu-schloss.sh (gpu_frei, cpu_ruhe,
# Verdrängung durch gpu-lauf.sh); WEICH AN DER GRENZE (12.11.): GPU_LAUF_WEICH_S 600 s, eine gefallene Station stellt sich ans Ende.
# DIE LISTE: die Tafel der Karte 2 (vision/richter-tafel.json, Zeilen „gleich“, karte2_nur), ohne Tafel gtx-nutzen; profiband.* ruhen.
# PLATTE: unter $PLATTE_UNTEN GB frei beginnt keine Station (platte-dienst.sh hält eine laufende an) — beides ist ein ALARM der Runde
#   mit Zahl (runde.cjs alarm --grund: GB frei, Station, Kopf), danach setzt die Runde an derselben Station fort.
# HALT: Datei zustand/landung.halt — eine laufende Liste endet an der nächsten Stations-Grenze, die Schleife endet, die Flagge BLEIBT
#   liegen, bis der Koordinator sie wegnimmt (rm, dann start.sh); start.sh startet die Landung nicht, solange sie liegt.
# DER MACHER HAT VORRANG (14.11.): wartet ein Lauf am GPU-Schloss oder an der Baum-Sperre (warter_echt), WEICHT die Liste an der nächsten
#   Stations-Grenze (die Grenz-Flagge, kandidat.sh SPRUNG), keine Liste beginnt, solange jemand wartet; danach geht sie weiter (4).
# Beweis: `bash landung-dienst.sh --selbsttest` (Sandkasten mit eigenem origin: main · koordination · punkte-maschine).
D=$(cd "$(dirname "$0")" && pwd)
if [ -f "$D/gemein.sh" ]; then . "$D/gemein.sh"; else . "$D/../dienst/gemein.sh"; fi
# runde.cjs und richter.sh: installiert neben diesem Skript, im Zweig in ../dienst (EINE Quelle beim Laptop)
RUNDE_CJS=$D/runde.cjs
[ -f "$RUNDE_CJS" ] || RUNDE_CJS=$D/../dienst/runde.cjs
RICHTER=$D/richter.sh
[ -f "$RICHTER" ] || RICHTER=$D/../dienst/richter.sh
GERAET=gtx
export ZAHL=1 # je Station die rohe Zahl in der Zeile, auch bei UNGEMESSEN (Koordinator 10.11. 13:25)
TAKT_S=30
log() { echo "$(date '+%F %T') $*" >>"$L"; }
halt() { [ -f "$S/landung.halt" ] && { log "HALT (landung.halt, seit $(date -r "$S/landung.halt" '+%F %H:%M')) — die Flagge bleibt"; puls landung "GEHALTEN (landung.halt) — steht, bis die Flagge fällt"; exit 3; }; }
sag() { melde la "$1" >>"$L" 2>&1; }
# DER WARTENDE AN DER BAUM-SPERRE (14.11., Koordinator 23:16): eine Mess-Sitzung nimmt erst den Spiel-Baum, dann die GPU (punkte.cjs
#   `baumSperre`) — sie wartet am BAUM, den der Lauf der Landung hält, und stand nie am GPU-Schloss. punkte.cjs legt, solange ein Lauf
#   am Baum wartet, eine Marke `<wer>-<pid>` in `punkte-gtx.wartet/`; eine Marke jünger als eine Minute, die nicht der Landung oder
#   dem Wächter gehört, ist ein Wartender wie der am GPU-Schloss.
export PUNKTE_WER=landung
BAUM_WARTET=${BAUM_WARTET:-/c/Users/micha/Desktop/AnazhRealm-OMEN/AnazhRealm-mess/.claude/worktrees/punkte-gtx.wartet}
baum_wartende() { find "$BAUM_WARTET" -maxdepth 1 -type f -mmin -1 2>/dev/null | sed 's|.*/||' | grep -vE '^(landung|dauer)-' | sed 's/^/Baum-Sperre:/'; }
warter_echt() { { schloss_wartende omen punkte- | tr ' ' '\n' | grep -v '^CI-Job'; baum_wartende; } | grep . | tr '\n' ' ' | sed 's/ $//'; }
warter() { warter_echt; }
main_kopf() { git -C "$M" fetch -q origin main 2>/dev/null; git -C "$M" rev-parse origin/main; }
abstand() { local n; n=$(git -C "$M" rev-list --count "$1..origin/main" 2>/dev/null); echo "${n:-?}"; } # Commits des Kopfs hinter main (nur Anzeige)
darf_beginnen() { WT=$(warter); [ -z "$WT" ]; } # HINTEN AN: eine Liste beginnt (oder geht weiter) nur, wenn keiner am Schloss wartet
# gepusht <zeilen vorher> <name> — die STATIONEN, die seit Zeile n gepusht sind (kandidat.sh: „<name>-<k> GEPUSHT (Versuch v) <n> Station(en)“;
# eine Zeile ohne Zahl ist eine Station, wie bis 19.11.)
gepusht() { tail -n +$(($1 + 1)) "$KETTE_LOG" 2>/dev/null | grep -E " $2-[0-9]+ GEPUSHT" | awk '{ if (match($0, /GEPUSHT \(Versuch [0-9]+\) [0-9]+ Station/)) { split(substr($0, RSTART, RLENGTH), a, " "); s += a[4] } else s += 1 } END { print s + 0 }'; }
station_jetzt() { tail -n +$(($1 + 1)) "$KETTE_LOG" 2>/dev/null | sed -n 's/.* Versuch [0-9]* START (\(.*\))$/\1/p' | tail -n 1 | awk -F, '{ print $1 (NF > 1 ? "+" (NF - 1) : "") }'; } # die erste Station der laufenden Sitzung (+ wie viele mit ihr)
zahl() { echo "$1" | tr ',|' '\n\n' | grep -c .; }
# runde <verb> … — zug/dienst/runde.cjs gegen den Klon $RUNDE_REPO (stdout = die Antwort, stderr ins Log)
runde() { node "$RUNDE_CJS" "$@" 2>>"$L"; }
runde_alarm() { runde alarm "$RUNDE_REPO" "$GERAET (landung-dienst)" >>"$L"; }
# runde_bg — für die Schreiber im HINTERGRUND: eine EIGENE Datei. node (ein Windows-Prozess) schreibt nicht mit O_APPEND wie MSYS —
# zwei Schreiber in derselben Log-Datei überschrieben im Selbsttest Zeilen des Dienstes (die Radeon verlor so ihre WEICHT-Zeilen)
runde_bg() { node "$RUNDE_CJS" "$@" >>"$L.runde" 2>&1; }
# DIE KARTE 2 (15.11.): die Stationen der Tafel Station → Sprosse (vision/richter-tafel.json im Baum von punkte-maschine) mit einer
# Zeile „gleich“ — nur sie schreiben eine Akte —, je einmal, mit Komma; leer, wenn der Baum keine Tafel trägt (dann gtx-nutzen).
karte2_nur() {
    [ -f "$PM/vision/richter-tafel.json" ] || return 0
    node -e 'const t=require(process.argv[1]);const z=Object.values(t).find((v)=>v&&typeof v==="object"&&Object.values(v).some((e)=>e&&e.station));console.log([...new Set(Object.values(z||{}).filter((e)=>e&&e.richter==="gleich").map((e)=>e.station).filter(Boolean))].join(","))' "$(cygpath -m "$PM/vision/richter-tafel.json")" 2>/dev/null | tr -d '\r'
}
liste_quelle() { # <kopf> → die Stationen der Runde (vor /band und Reihe); setzt QUELLE
    local a
    a=$(karte2_nur)
    if [ -n "$a" ]; then QUELLE="der Tafel der Karte 2 (Zeilen gleich)"; echo "$a"; return; fi
    QUELLE=gtx-nutzen
    (cd "$PM/meisterkarte-quelle/punkte" && timeout 900 node punkte.cjs gtx-nutzen --kopf "$1" 2>>"$L" | sed -n 's/^nur=//p' | tr -d '\r')
}
ohne_band() { node "$ST/ohne-band.cjs" "$1" 2>>"$L" | tr -d '\r'; }
pm_stand() { node "$N/pm-stand.cjs" "$PM" >>"$L" 2>&1; } # der Stand von punkte-maschine; eine jüngere Messung im Baum überlebt
# offen_am <kopf> <liste> → was an diesem Kopf noch keinen Eintrag trägt, in der Mess-Datei des BAUMS (pm-stand.cjs: eine jüngere Messung
# im Baum überlebt) — so zählt nach einem Tod mitten in einer Sitzung, was sie schon fertig maß; es reist mit dem nächsten Push
offen_am() { runde offen "$PM" - "$GERAET" "$1" "$2"; }
# DIE TEILE DER RUNDE (Koordinator 19.11. 03:30): Stationen EINER Linse in EINER Sitzung. eichtafel_lesen schreibt die Lauf-Tafel der
# Maschine (punkte.cjs eichtafel: je Lauf seine Stationen und sein Deckel), teile_von packt den Rest der Liste in ihrer Reihe zu Sitzungen
# je Σ Deckel ≤ TEIL_BUDGET_S (FAHRT_MAX_S 1 800 − Boot 60 = 1 740 s, die Teil-Größe der Maschine selbst; runde.cjs teile)
TEIL_BUDGET_S=${TEIL_BUDGET_S:-1740}
eichtafel_lesen() { (cd "$PM/meisterkarte-quelle/punkte" && timeout 900 node punkte.cjs eichtafel --geraet "$GERAET" >"$EICHTAFEL" 2>>"$L"); }
teile_von() { runde teile "$EICHTAFEL" "$1" "$TEIL_BUDGET_S"; }
# liste_fahren <K> <NAME> <REST> <r> <BASIS> <GESAMT> — EINE Fahrt über kandidat.sh, je Station eine Sitzung, je gepushte Station der
# Stand in zug/runde.txt; 0 durch · 2 GEWICHEN (ein Lauf wartete am Schloss; BEHALTEN = gepushte Stationen) · 3 GEHALTEN (landung.halt).
# Eine Landung ändert hier nichts: die Liste fährt am Kopf der Runde zu Ende (DAS GESETZ DER RUNDE).
liste_fahren() {
    local K=$1 NAME=$2 REST=$3 r=$4 BASIS=$5 GESAMT=$6 kp t l0 b fb=0 grund= sj sv= TEILE
    GRENZE=${S:?}/landung.grenze
    rm -f "$GRENZE"
    WEICHT_VOR= BEHALTEN=0 PROG_PID= ALARM_PID=
    l0=$(wc -l <"$KETTE_LOG" 2>/dev/null || echo 0)
    TEILE=$(teile_von "$REST")
    log "Runde $RN ${K:0:8}: $r Stationen in $(echo "$TEILE" | tr ';' '\n' | grep -c .) Sitzungen (je Linse EINE, Σ Deckel ≤ $TEIL_BUDGET_S s)"
    KOPF=$K SPRUNG=$GRENZE RUNDE_CJS=$RUNDE_CJS bash "$KANDIDAT" "$NAME" x "$TEILE" >>"$L" 2>&1 &
    kp=$!
    t=0
    while kill -0 $kp 2>/dev/null; do
        puls landung "Runde $RN misst ${K:0:8} ($((BASIS + fb))/$GESAMT, C: $(frei_gb) GB frei, Abstand zu main $(abstand "$K"))${WEICHT_VOR:+ — WEICHT vor $WEICHT_VOR}: $(tail -n 1 "$KETTE_LOG" 2>/dev/null | cut -c1-150)"
        sleep $TAKT_S
        t=$((t + 1))
        b=$(gepusht "$l0" "$NAME")
        # der Stand je Station und der Alarm im Hintergrund, je EIN Schreiber zugleich: ein Push braucht Sekunden, die Wache an der
        # Grenze (Halt, Macher) darf nie auf ihn warten
        sj=$(station_jetzt "$l0")
        if [ -n "$sj" ] && [ "$sj" != "$sv" ]; then sv=$sj; vor_station "$sj"; fi
        if [ "$b" -gt "$fb" ] && ! kill -0 "${PROG_PID:-999999}" 2>/dev/null; then
            fb=$b
            runde_bg stand "$RUNDE_REPO" "$GERAET" "$K" laeuft --erledigt $((BASIS + b)) --gesamt "$GESAMT" --station "$(station_jetzt "$l0")" &
            PROG_PID=$!
        fi
        if [ $((t % 4)) = 0 ] && ! kill -0 "${ALARM_PID:-999999}" 2>/dev/null; then runde_bg alarm "$RUNDE_REPO" "$GERAET (landung-dienst)" & ALARM_PID=$!; fi
        [ -f "$GRENZE" ] && continue
        if [ -f "$S/landung.halt" ]; then
            grund=halt
            touch "$GRENZE"
            log "HALT: landung.halt liegt — die Liste endet nach der laufenden Station und setzt dort wieder an"
            continue
        fi
        WEICHT_VOR=$(warter)
        if [ -n "$WEICHT_VOR" ]; then
            grund=weicht
            touch "$GRENZE"
            log "WEICHT: am Schloss wartet $WEICHT_VOR — die Karte geht an der nächsten Stations-Grenze frei"
            continue
        fi
    done
    wait $kp
    wait ${PROG_PID:-} ${ALARM_PID:-} 2>/dev/null # die Schreiber im Hintergrund zuerst: der Stand danach ist der letzte
    rm -f "$GRENZE"
    BEHALTEN=$(gepusht "$l0" "$NAME")
    case "$grund" in
        weicht) log "ABGEBROCHEN Runde $RN ${K:0:8}: $WEICHT_VOR wartete am Schloss — BEHALTEN $BEHALTEN Station(en), der Rest folgt an derselben Station"; return 2 ;;
        halt) return 3 ;;
    esac
    return 0
}
summe() { echo "$3" >"$ST/liste-$2.txt"; ZEILE_NAME="gpu-stufe $2" ZEILE_DIR=$ST node "$N/zeile-da0e.cjs" "$1" "$ST/liste-$2.txt" >>"$L" 2>&1; }
# richte_runde <kopf> <vorher|-> <liste> — 3 DER RICHTER DER RUNDE: nur die Stationen mit frischem ROT (GRÜN am vorigen Mess-Kopf, ROT
# an diesem) werden über die Köpfe dazwischen halbiert; ohne vorigen Mess-Kopf (erste Runde) richtet richter.sh --kopf gegen die Buchung
richte_runde() {
    local K=$1 V=$2 s rp f
    if [ "$V" = - ]; then
        log "RICHTER Runde $RN: kein voriger Mess-Kopf — richter.sh --kopf ${K:0:8} gegen die letzte Buchung"
        bash "$RICHTER" "$GERAET" --kopf "$K" >>"$L" 2>&1 &
    else
        f=$(runde faelle "$RUNDE_REPO" "$GERAET" "$V" "$K" "$3" | tr '\n' ' ')
        log "RICHTER Runde $RN: frisches ROT ${V:0:8} -> ${K:0:8}: ${f:-keins}"
        [ -n "$f" ] || return 0
        (for s in $f; do bash "$RICHTER" "$GERAET" --fall "$s" "$V" "$K"; done) >>"$L" 2>&1 &
    fi
    rp=$!
    while kill -0 $rp 2>/dev/null; do
        puls landung "Richter Runde $RN am ${K:0:8}: $(tail -n 1 "${RICHTER_ZUSTAND:-$S/richter}/richter.log" 2>/dev/null | cut -c21-170)"
        sleep "$TAKT_S"
    done
    wait $rp
}
# platte_zu — unter $PLATTE_UNTEN GB frei beginnt keine Station; das ist ein ALARM der Runde mit Zahl (runde.cjs alarm --grund), nie still
platte_zu() {
    local f
    f=$(frei_gb)
    kleiner "$f" "$PLATTE_UNTEN" || return 1
    puls landung "wartet: C: $f GB frei < $PLATTE_UNTEN GB — keine Messung, Löschen entscheidet der Schöpfer"
    platte_alarm "$f" "$PLATTE_UNTEN" "keine Station beginnt, Löschen entscheidet der Schöpfer"
    return 0
}
# platte_alarm <gb> <schwelle> <text> — EIN Alarm der Runde je Schwelle und Stunde (zustand/platte-<schwelle>.alarm)
PLATTE_WARN=${PLATTE_WARN:-15}
platte_alarm() {
    local m=$S/platte-$2.alarm
    [ -f "$m" ] && [ $(($(date +%s) - $(mzeit "$m"))) -lt 3600 ] && return 0
    touch "$m"
    runde alarm "$RUNDE_REPO" "$GERAET (landung-dienst)" --geraet "$GERAET" --grund "PLATTE $1 GB frei (< $2 GB) — $3" >>"$L"
}
# vor_station — 4 (Koordinator 02:42): VOR jeder Station der freie Platz als Zahl in der Fahrt-Zeile; unter PLATTE_WARN (15) GB ein
# ALARM an den Koordinator, BEVOR die Platten-Wache bei PLATTE_UNTEN (10) hält
vor_station() {
    local f
    f=$(frei_gb)
    log "Station $1 beginnt · C: $f GB frei"
    kleiner "$f" "$PLATTE_WARN" && platte_alarm "$f" "$PLATTE_WARN" "Warnung: die Platten-Wache hält bei $PLATTE_UNTEN GB, Station $1"
    return 0
}
# runde_takt — EIN Blick der Schleife: die Runde lesen (beim ersten Mal aus dem Bestand anlegen), die eigene Liste am Kopf der Runde
# fahren oder fortsetzen, nach ihr der Richter und „durch“; ist die OMEN durch, auf das andere Gerät warten (Alarm, nie still)
runde_takt() {
    local RL B a n r GESAMT REST NAME
    RL=$(runde lies "$RUNDE_REPO" "$GERAET")
    if [ -z "$RL" ]; then
        puls landung "zug/runde.txt nicht lesbar (fetch koordination?) — nächster Takt"
        return
    fi
    if [ "$RL" = - ]; then # DIE ERSTE RUNDE AUS DEM BESTAND: der jüngste Kopf der main-Linie, an dem die OMEN schon misst
        B=$(runde bestand "$RUNDE_REPO" "$GERAET") || B=$(main_kopf)
        runde anlegen "$RUNDE_REPO" "$B" >>"$L"
        log "RUNDE aus dem Bestand angelegt: Kopf ${B:0:8} (seine Mess-Datei zählt mit)"
        return
    fi
    read -r RN RK RV RZ RLISTE <<<"$RL"
    runde_alarm
    if [ "$RZ" = durch ]; then
        puls landung "Runde $RN am ${RK:0:8}: die OMEN ist durch — $(runde weiter "$RUNDE_REPO" "$(main_kopf)")"
        return
    fi
    if ! darf_beginnen; then
        puls landung "wartet hinten: am GPU-Schloss wartet $WT — der Macher hat Vorrang (Runde $RN am ${RK:0:8}, $RZ)"
        return
    fi
    pm_stand
    if [ "$RLISTE" = - ]; then # der Eintritt in die Runde: die Liste wird gebaut und EINGEFROREN
        a=$(liste_quelle "$RK")
        B=$(ohne_band "$a")
        RLISTE=$(runde reihe "$MESSUNG_DIR" "$GERAET" "$B")
        [ -n "$RLISTE" ] || RLISTE="$B|"
        log "Runde $RN am ${RK:0:8} (Abstand zu main $(abstand "$RK")): $QUELLE $(zahl "$a"), ohne /band $(zahl "$B") — die Liste (ungebucht | gebucht grün): $RLISTE"
        runde stand "$RUNDE_REPO" "$GERAET" "$RK" laeuft --liste "$RLISTE" --gesamt "$(zahl "$RLISTE")" --erledigt 0 >>"$L"
    fi
    GESAMT=$(zahl "$RLISTE")
    REST=$(offen_am "$RK" "$RLISTE")
    r=$(zahl "$REST")
    if [ -n "$REST" ]; then
        NAME=gtx-${RK:0:8}
        [ "$r" != "$GESAMT" ] && NAME=$NAME-w$(date +%H%M%S) # fortgesetzt: eigener Name, damit keine Zeile doppelt heißt
        runde stand "$RUNDE_REPO" "$GERAET" "$RK" laeuft --erledigt $((GESAMT - r)) --gesamt "$GESAMT" >>"$L"
        eichtafel_lesen
        sag "landung Runde $RN am ${RK:0:8}: misst $r von $GESAMT Stationen ($((GESAMT - r)) tragen an diesem Kopf schon einen Eintrag), rohe Zahl je Zeile"
        liste_fahren "$RK" "$NAME" "$REST" "$r" $((GESAMT - r)) "$GESAMT"
        case $? in
            2) runde stand "$RUNDE_REPO" "$GERAET" "$RK" weicht --erledigt $((GESAMT - r + BEHALTEN)) >>"$L"
               sag "landung Runde $RN am ${RK:0:8}: WEICHT — $WEICHT_VOR wartete am GPU-Schloss, BEHALTEN $BEHALTEN, die Liste geht an derselben Station weiter"
               return ;;
            3) runde stand "$RUNDE_REPO" "$GERAET" "$RK" halt --erledigt $((GESAMT - r + BEHALTEN)) >>"$L"
               return ;;
        esac
        pm_stand
        REST=$(offen_am "$RK" "$RLISTE")
        [ -n "$REST" ] && log "Runde $RN am ${RK:0:8}: die Liste ist gefahren, ohne Eintrag blieben $(zahl "$REST"): $REST (kandidat.sh OFFEN nach 4 Versuchen)"
    fi
    summe "$RK" "gtx-${RK:0:8}" "${RLISTE/|/,}"
    richte_runde "$RK" "$RV" "$RLISTE"
    sag "landung Runde $RN am ${RK:0:8}: die OMEN ist durch ($GESAMT Stationen) — $(runde durch "$RUNDE_REPO" "$GERAET" "$RK" "$(main_kopf)" --erledigt $((GESAMT - $(zahl "$REST"))))"
}

# ── DER SELBSTTEST (trocken, ohne GPU): ein Sandkasten mit eigenem origin (main · koordination · punkte-maschine) und Klon, ein
# Stummel-kandidat.sh (je Station 0,4 s, prüft die Grenz-Flagge vor jeder Station, schreibt „<kopf>:<station>“ als gepusht und die Zeilen
# START/GEPUSHT wie kandidat.sh), der Warter als Datei. runde.cjs, richter.sh (Schein-Messung RICHTER_SCHEIN_ROT_AB) und
# richter-werk.cjs laufen ECHT gegen den Sandkasten. Die Fälle des Gesetzes:
# a  eine Landung nach Station 2 bricht die Runde NICHT ab: 8 von 8 am Kopf der Runde; die nächste Runde nimmt den main des Moments,
#    in dem beide durch sind (vorher = der alte Kopf)
# b  Halt nach Station 3 → Ende an der Grenze, Stand „halt 3/8“; ohne Flagge geht es an Station 4 weiter, keine doppelt; ebenso ein
#    Macher am Schloss (WEICHT) nach Station 2
# c  Neustart: der Dienst stirbt in Station 4 (kein Push); ein neuer Prozess ohne Gedächtnis setzt an Station 4 fort
# d  frisches ROT: s1 GRÜN am vorigen, ROT am jetzigen Mess-Kopf → NUR s1 wird über die Köpfe dazwischen halbiert, der Täter-Kopf
#    steht in zug/richter.txt; s2 (GRÜN → GRÜN) und s3 (nie GRÜN) nicht
# e  die Reihe: ungebucht (nie gemessen, Paar ROT) vor gebucht grün
# f  ein Gerät ohne Fortschritt > 15 min: EINE Alarm-Zeile mit Namen, nicht doppelt; unter 15 min keine
# g  die Baum-Sperre (14.11.) · h  die Karte 2 (karte2_nur) · i  halt() lässt die Flagge liegen
# k  je Linse EINE Sitzung (runde.cjs teile), nie je Station eine · l  BEHALTEN je Station: das echte kandidat.sh, eine Sitzung fällt nach
#    2 von 4 — die 2 sind gepusht, nur der Rest fährt neu
# j  die Platte unter PLATTE_UNTEN: EIN Alarm mit GB, Station und Kopf (Koordinator 19.11. 02:35), nicht doppelt
# Mutanten (je eine Regel alt): sprung (der Kopf ist der jüngste main, wie bis 19.11.) · von-vorn (Fortsetzung blind: die ganze Liste) ·
#    volle-liste (der Richter nimmt jede Station der Liste) · tafel-reihe (die Reihe der Tafel) · still (kein Alarm) · blind (kein Warter) ·
#    halt-rm (halt() löscht die Flagge) · nur-schloss · tafel-blind · tafel-alle — alle ROT.
st_lauf() { # $1 = Mutante (leer = echt)
    local X n o k0 k1 k2 k2b j e1 e2 f1 f2 f3 z w v t0 w1 w2
    X=$(mktemp -d)
    S=$X/s L=$X/landung.log KETTE_LOG=$X/kette.log KANDIDAT=$X/kandidat.sh TAKT_S=0.05 MESSUNG_DIR=$X/messung
    RUNDE_REPO=$X/klon RICHTER_REPO=$X/klon RICHTER_ZUSTAND=$X/richter RICHTER_PM=$X/klon
    export RICHTER_REPO RICHTER_ZUSTAND RICHTER_PM
    export RICHTER_SCHEIN_ROT_AB=nie # NIE eine echte Messung im Sandkasten: der Richter urteilt nur über die Schein-Messung (d setzt den Täter)
    mkdir -p "$S" "$MESSUNG_DIR"
    : >"$KETTE_LOG"
    # der Sandkasten: origin mit main (k0 … k2, sechs Commits), koordination (zug/erledigt.txt) und punkte-maschine; der Klon kennt ihn
    local A0="-c user.name=t -c user.email=t@t -c core.autocrlf=false"
    git init -q --bare "$X/o.git"
    git init -q -b main "$X/klon" && git -C "$X/klon" remote add origin "$X/o.git"
    for j in 0 1 2 3 4 5; do git -C "$X/klon" $A0 commit -q --allow-empty -m "main $j"; done
    k0=$(git -C "$X/klon" rev-parse HEAD~5) k1=$(git -C "$X/klon" rev-parse HEAD~2) k2b=$(git -C "$X/klon" rev-parse HEAD~1) k2=$(git -C "$X/klon" rev-parse HEAD)
    git -C "$X/klon" push -q origin main
    git init -q -b koordination "$X/k" && mkdir -p "$X/k/zug" && echo "# erledigt" >"$X/k/zug/erledigt.txt" &&
        git -C "$X/k" add zug && git -C "$X/k" $A0 commit -qm koord && git -C "$X/k" push -q "$X/o.git" koordination
    git init -q -b punkte-maschine "$X/p" && git -C "$X/p" $A0 commit -q --allow-empty -m pm && git -C "$X/p" push -q "$X/o.git" punkte-maschine
    echo "$k0" >"$X/main"
    echo "$k2" >"$X/kopf2"
    cat >"$KANDIDAT" <<'STUMMEL'
#!/bin/bash
# kandidat.sh-Stummel: $1 Name, $3 die Teile („;“), KOPF; die Grenz-Flagge vor jeder SITZUNG (wie kandidat.sh), je Station 0,4 s; was eine
# Sitzung fertig misst, steht sofort im „Baum“ (gepusht, je Station), der Push-Zeile je Sitzung mit der Zahl ihrer Stationen
X=$(dirname "$0"); i=0; t=0
IFS=';' read -ra TT <<<"$3"
for T in "${TT[@]}"; do
    [ -n "$SPRUNG" ] && [ -f "$SPRUNG" ] && { echo "$(date +%T) $1 SPRUNG nach $t Teilen" >>"$X/kette.log"; break; }
    t=$((t + 1)); n=0
    echo "$(date +%T) ${KOPF:0:8} $1-$t Versuch 1 START ($T)" >>"$X/kette.log"
    for s in ${T//,/ }; do
        i=$((i + 1))
        [ -f "$X/tod_in" ] && [ "$(cat "$X/tod_in")" = "$i" ] && { rm -f "$X/tod_in"; sleep 2; kill -9 $PPID; exit 9; }
        sleep 0.4
        echo "$KOPF:$s" >>"$X/gepusht"; n=$((n + 1))
        [ -f "$X/warter_nach" ] && [ "$(cat "$X/warter_nach")" = "$i" ] && echo macher-hand >"$X/warter"
        [ -f "$X/halt_nach" ] && [ "$(cat "$X/halt_nach")" = "$i" ] && touch "$X/s/landung.halt"
        [ -f "$X/landung_nach" ] && [ "$(cat "$X/landung_nach")" = "$i" ] && cp "$X/kopf2" "$X/main"
    done
    echo "$(date +%T) $1-$t GEPUSHT (Versuch 1) $n Station(en)" >>"$X/kette.log"
done
STUMMEL
    # die Lauf-Tafel: je Station ein Lauf mit Deckel 100 s, s7+s8 ein Zwilling (100 s); das Budget 250 s → Sitzungen zu zwei Läufen
    EICHTAFEL=$X/eich.txt TEIL_BUDGET_S=250
    printf '  s1 · Deckel 100 s\n  s2 · Deckel 100 s\n  s3 · Deckel 100 s\n  s4 · Deckel 100 s\n  s5 · Deckel 100 s\n  s6 · Deckel 100 s\n  s7+s8 · Deckel 100 s\n' >"$EICHTAFEL"
    eichtafel_lesen() { :; }
    puls() { echo "PULS $*" >>"$L"; }
    sag() { echo "SAG $*" >>"$L"; }
    warter() { cat "$X/warter" 2>/dev/null; }
    main_kopf() { cat "$X/main"; }
    abstand() { echo 0; }
    pm_stand() { :; }
    frei_gb() { echo 50; }
    kleiner() { awk -v a="$1" -v b="$2" 'BEGIN { exit !(a < b) }'; } # wie orte.sh
    summe() { :; }
    liste_quelle() { QUELLE=Stummel; echo s1,s2,s3,s4,s5,s6,s7,s8; }
    ohne_band() { echo "$1"; }
    offen_am() { echo "$2" | tr ',|' '\n\n' | grep . | while read -r s; do grep -qxF "$1:$s" "$X/gepusht" 2>/dev/null || echo "$s"; done | paste -sd, -; }
    am() { grep -c "^$1:" "$X/gepusht" 2>/dev/null; }                       # gepushte Stationen an einem Kopf (sha40)
    eindeutig() { grep "^$1:" "$X/gepusht" 2>/dev/null | sort -u | wc -l; }
    koord() { git -C "$X/klon" fetch -q origin +refs/heads/koordination:refs/t/k && git -C "$X/klon" show "refs/t/k:$1"; }
    feld() { koord zug/runde.txt | grep "^$1 "; }
    nte() { echo "$1" | sed 's/.* liste //' | tr ',|' '\n\n' | grep . | sed -n "$2p"; } # die n-te Station der eingefrorenen Liste
    erst() { tail -n +$(($1 + 1)) "$KETTE_LOG" | sed -n 's/.* Versuch 1 START (\(.*\))$/\1/p' | head -n 1 | cut -d, -f1; } # die erste Station nach Zeile $1 (die erste der Sitzung)
    nach() { date -u -d "@$(($(date -u -d "$1" +%s) + $2 * 60))" +%FT%TZ; }
    case "$1" in
        sprung) runde() { if [ "$1" = lies ]; then node "$RUNDE_CJS" "$@" 2>>"$L" | awk -v m="$(main_kopf)" '{ if (NF >= 2) $2 = m; print }'; else node "$RUNDE_CJS" "$@" 2>>"$L"; fi; } ;;
        von-vorn) offen_am() { echo "$2" | tr '|' ',' | sed 's/,$//'; } ;;
        bild-omen) KANDIDAT_ECHT=$X/kandidat-alt.sh; sed 's|^  node "$RUNDE_CJS" bilder .*$|  :|' "$D/ort/n0611/kandidat.sh" >"$KANDIDAT_ECHT" ;; # die alte Regel: kein Bild wird geprüft
        behalt-gruppe) KANDIDAT_ECHT=$X/kandidat-alt.sh; sed 's|^    rest=$(node "$RUNDE_CJS" offen "$PM" - gtx "$K" "$R" 2>>$L)$|    rest=$R|' "$D/ort/n0611/kandidat.sh" >"$KANDIDAT_ECHT" ;; # die alte Regel: eine gefallene Sitzung verliert alles
        je-station) teile_von() { echo "$1" | tr ',' ';'; } ;; # die alte Regel: je Station eine eigene Sitzung
        volle-liste) richte_runde() { local s; for s in $(echo "$3" | tr ',|' '  '); do bash "$RICHTER" "$GERAET" --fall "$s" "$2" "$1" >>"$L" 2>&1; done; } ;;
        tafel-reihe) runde() { if [ "$1" = reihe ]; then echo "$4|"; else node "$RUNDE_CJS" "$@" 2>>"$L"; fi; } ;;
        still) runde_alarm() { :; }; platte_alarm() { :; } ;; # kein Alarm, weder Fortschritt noch Platte
        blind) warter() { :; } ;;
        halt-rm) halt() { [ -f "$S/landung.halt" ] && { rm -f "$S/landung.halt"; exit 3; }; } ;;
        nur-schloss) baum_wartende() { :; } ;;
        tafel-blind) karte2_nur() { :; } ;;
        tafel-alle) karte2_nur() { [ -f "$PM/vision/richter-tafel.json" ] && grep -o '"station":"[^"]*"' "$PM/vision/richter-tafel.json" | cut -d'"' -f4 | awk '!s[$0]++' | paste -sd, -; } ;;
    esac
    # a — eine Landung nach Station 2, ein Macher nach Station 4: die Liste weicht und geht AM KOPF DER RUNDE weiter, nie am neuen main
    runde_takt # Runde 1 aus dem Bestand (kein Kopf trägt eine Mess-Datei: main k0)
    echo 2 >"$X/landung_nach"
    echo 4 >"$X/warter_nach"
    runde_takt
    rm -f "$X/warter" "$X/warter_nach" "$X/landung_nach"
    runde_takt # main ist jetzt k2
    e1=$(feld gtx)
    runde durch "$RUNDE_REPO" radeon "$k0" "$(main_kopf)" >/dev/null # das andere Gerät ist auch durch → die nächste Runde
    z=$(feld runde)
    # die Sitzungen der Runde 1: je Linse EINE (Teile zu je zwei Läufen, s7+s8 ein Zwilling) — nie je Station eine
    n=$(grep -c " ${k0:0:8} gtx-${k0:0:8}[-w0-9]* Versuch 1 START (.*,.*)" "$KETTE_LOG")
    w=$(grep -c " ${k0:0:8} gtx-${k0:0:8}[-w0-9]* Versuch 1 START (" "$KETTE_LOG")
    if [ "$w" -ge 1 ] && [ "$w" -le 5 ] && [ "$n" = "$w" ]; then echo "OK k  Linse: Runde 1 fuhr 8 Stationen in $w Sitzungen, jede mit mehreren Stationen (Zwilling s7+s8 zusammen) — nie je Station eine"
    else echo "ROT k  Linse: Runde 1 in $w Sitzungen (Soll 1–5), davon mit mehreren Stationen $n (Soll alle)"; fi
    if [ "$(am "$k0")" = 8 ] && [ "$(eindeutig "$k0")" = 8 ] && [ "$(am "$k2")" = 0 ] && echo "$e1" | grep -q "^gtx durch 8/8 " && ! grep -q "SPRUNG: main" "$L" &&
        echo "$z" | grep -qx "runde 2 kopf $k2 start [^ ]* vorher $k0"; then
        echo "OK a  Landung nach Station 2 (main ${k0:0:8} → ${k2:0:8}): die Runde fuhr 8 von 8 am Kopf ${k0:0:8} zu Ende, 0 am neuen main; beide durch → Runde 2 am main des Moments, vorher ${k0:0:8}"
    else echo "ROT a  Landung: am Kopf der Runde $(am "$k0") von 8 (eindeutig $(eindeutig "$k0")), am neuen main $(am "$k2") (Soll 0), Zeile „$(echo "$e1" | cut -c1-24)“ (Soll durch 8/8), Runde „$(echo "$z" | cut -c1-40)“"; fi
    # b — Halt nach Station 3 (Runde 2 am k2): Ende an der Grenze, ohne Flagge weiter an derselben Station
    echo 3 >"$X/halt_nach"
    runde_takt
    e1=$(feld gtx)
    n=$(echo "$e1" | sed -n 's/^gtx halt \([0-9]*\)\/8 .*/\1/p')
    w=$([ -f "$S/landung.halt" ] && echo liegt || echo fort)
    rm -f "$S/landung.halt" "$X/halt_nach"
    j=$(wc -l <"$KETTE_LOG")
    runde_takt
    f1=$(erst "$j")
    e2=$(feld gtx)
    if [ -n "$n" ] && [ "$n" -ge 3 ] && [ "$w" = liegt ] && [ "$f1" = "$(nte "$e1" $((n + 1)))" ] && [ "$(am "$k2")" = 8 ] && [ "$(eindeutig "$k2")" = 8 ] && echo "$e2" | grep -q "^gtx durch 8/8 "; then
        echo "OK b  Halt nach Station 3: Ende an der Grenze („halt $n/8“, Flagge liegt), ohne Flagge weiter an Station $((n + 1)) ($f1), 8 von 8, keine doppelt"
    else echo "ROT b  Halt: Zeile „$(echo "$e1" | cut -c1-24)“ (Soll halt ≥3/8), Flagge $w, weiter an „$f1“ (Soll „$(nte "$e1" $((${n:-0} + 1)))“), am Kopf $(am "$k2") (Soll 8, eindeutig $(eindeutig "$k2"))"; fi
    # b — der Macher am Schloss (Runde 3 am k1): WEICHT an der Grenze, keine Station solange er wartet, dann an derselben Station weiter
    echo "$k1" >"$X/main"
    runde durch "$RUNDE_REPO" radeon "$k2" "$k1" >/dev/null
    echo 2 >"$X/warter_nach"
    runde_takt
    e1=$(feld gtx)
    w=$(am "$k1")
    runde_takt # er wartet noch
    v=$(am "$k1")
    rm -f "$X/warter" "$X/warter_nach"
    j=$(wc -l <"$KETTE_LOG")
    runde_takt
    f1=$(erst "$j")
    if echo "$e1" | grep -q "^gtx weicht [2-7]/8 " && [ "$w" = "$v" ] && [ "$(am "$k1")" = 8 ] && [ "$(eindeutig "$k1")" = 8 ] && [ "$f1" = "$(nte "$e1" $((w + 1)))" ]; then
        echo "OK b  Macher am Schloss nach Station 2: WEICHT („weicht $w/8“), keine Station solange er wartet, weiter an Station $((w + 1)) ($f1), 8 von 8"
    else echo "ROT b  Weichen: Zeile „$(echo "$e1" | cut -c1-24)“ (Soll weicht 2–7/8), während er wartet $w → $v (Soll gleich), weiter an „$f1“, am Kopf $(am "$k1") (Soll 8)"; fi
    # c — Neustart (Runde 4 am k2b): der Dienst stirbt in Station 4 ohne Push, ein neuer Prozess ohne Gedächtnis setzt dort fort
    echo "$k2b" >"$X/main"
    runde durch "$RUNDE_REPO" radeon "$k1" "$k2b" >/dev/null
    echo 4 >"$X/tod_in"
    (runde_takt) >/dev/null 2>&1
    e1=$(feld gtx)
    j=$(wc -l <"$KETTE_LOG")
    (unset RN RK RV RZ RLISTE; runde_takt) # sein Gedächtnis ist die Datei
    f1=$(erst "$j")
    if echo "$e1" | grep -q "^gtx laeuft " && [ "$(am "$k2b")" = 8 ] && [ "$(eindeutig "$k2b")" = 8 ] && [ "$f1" = "$(nte "$e1" 4)" ]; then
        echo "OK c  Neustart: der Dienst starb in Station 4 („$(echo "$e1" | cut -c5-16)“), der neue Prozess setzte an Station 4 fort ($f1), 8 von 8, keine doppelt"
    else echo "ROT c  Neustart: Zeile „$(echo "$e1" | cut -c1-24)“, weiter an „$f1“ (Soll „$(nte "$e1" 4)“), am Kopf $(am "$k2b") (Soll 8, eindeutig $(eindeutig "$k2b"))"; fi
    # d — frisches ROT: s1 GRÜN am k0, ROT am k2; s2 GRÜN → GRÜN; s3 nie GRÜN; der Täter (Schein-Messung) ist k1
    mkdir -p "$X/p/meisterkarte-quelle/punkte/messung"
    echo '{"je":{"s1":{"gruen":true,"zeit":"1"},"s2":{"gruen":true,"zeit":"1"},"s3":{"gruen":false,"zeit":"1"}}}' >"$X/p/meisterkarte-quelle/punkte/messung/${k0:0:8}-gtx.json"
    echo '{"je":{"s1":{"gruen":false,"zahl":"0,4 < 1","zeit":"2"},"s2":{"gruen":true,"zeit":"2"},"s3":{"gruen":false,"zeit":"2"}}}' >"$X/p/meisterkarte-quelle/punkte/messung/${k2:0:8}-gtx.json"
    git -C "$X/p" add -A && git -C "$X/p" $A0 commit -qm mess && git -C "$X/p" push -q "$X/o.git" punkte-maschine
    RN=d
    export RICHTER_SCHEIN_ROT_AB=$k1
    richte_runde "$k2" "$k0" "s1,s2,s3|"
    export RICHTER_SCHEIN_ROT_AB=nie
    o=$(koord zug/richter.txt 2>/dev/null)
    if echo "$o" | grep -q "TÄTER s1: ${k1:0:8} .*(gut ${k0:0:8}, schlecht ${k2:0:8}" && ! echo "$o" | grep -qE " (s2|s3)[: ]" && ! grep -qE "START (s2|s3) " "$X/richter/richter.log" 2>/dev/null; then
        echo "OK d  frisches ROT an s1 (GRÜN am ${k0:0:8}, ROT am ${k2:0:8}): NUR s1 über die Köpfe dazwischen halbiert, TÄTER-Kopf ${k1:0:8} in zug/richter.txt; s2, s3 nicht gefahren"
    else echo "ROT d  Richter: richter.txt „$(echo "$o" | tail -n 2 | cut -c1-110 | tr '\n' '|')“, gestartet „$(grep -oE "START [^ ]+" "$X/richter/richter.log" 2>/dev/null | tr '\n' ' ')“ (Soll nur s1, Täter ${k1:0:8})"; fi
    # e — die Reihe: s1 Paar beide GRÜN (gebucht), s2 Paar ROT, s3 nur gtx GRÜN, s4–s8 nie gemessen
    echo '{"zeit":"2026-11-18T01:00:00Z","je":{"s1":{"gruen":true,"zeit":"2026-11-18T01:00:00Z"},"s2":{"gruen":true,"zeit":"2026-11-18T01:01:00Z"},"s3":{"gruen":true,"zeit":"2026-11-18T01:02:00Z"}}}' >"$MESSUNG_DIR/aaaaaaaa-gtx.json"
    echo '{"zeit":"2026-11-18T01:00:00Z","je":{"s1":{"gruen":true,"zeit":"2026-11-18T01:00:00Z"},"s2":{"gruen":false,"zeit":"2026-11-18T01:01:00Z"}}}' >"$MESSUNG_DIR/aaaaaaaa-radeon.json"
    o=$(runde reihe "$MESSUNG_DIR" gtx s1,s2,s3,s4,s5,s6,s7,s8)
    if [ "$o" = "s4,s5,s6,s7,s8,s2,s3|s1" ]; then echo "OK e  Reihe: ungebucht vor gebucht grün — nie gemessen, Paar ROT, ohne Paar zuerst, das grüne Paar s1 zuletzt ($o)"
    else echo "ROT e  Reihe: „$o“ (Soll s4,s5,s6,s7,s8,s2,s3|s1)"; fi
    # f — Alarm (Runde 4 am k2b: die OMEN durch, das andere Gerät ohne Fortschritt seit dem Start der Runde)
    t0=$(feld runde | sed -n 's/^runde .* start \([^ ]*\) .*/\1/p')
    export RUNDE_JETZT=$(nach "$t0" 10)
    runde_alarm
    f1=$(koord zug/erledigt.txt | grep -c "ALARM")
    RUNDE_JETZT=$(nach "$t0" 20)
    runde_takt # die OMEN ist durch und wartet — ihr Takt sieht das andere Gerät
    RUNDE_JETZT=$(nach "$t0" 25)
    runde_alarm
    unset RUNDE_JETZT
    f2=$(koord zug/erledigt.txt | grep -c "RUNDE 4 ALARM radeon: ohne Fortschritt seit 20 min")
    f3=$(koord zug/erledigt.txt | grep -c "ALARM")
    if [ "$f1" = 0 ] && [ "$f2" = 1 ] && [ "$f3" = 1 ]; then echo "OK f  Alarm: nach 10 min keiner, nach 20 min EINE Zeile „RUNDE 4 ALARM radeon: ohne Fortschritt seit 20 min“, nach 25 min nicht doppelt"
    else echo "ROT f  Alarm: nach 10 min $f1 (Soll 0), nach 20 min $f2 (Soll 1), zusammen $f3 (Soll 1)"; fi
    # j — die Platte (Koordinator 02:35, 02:42): vor der Station die Zahl; unter 15 GB eine Warnung, unter 10 GB der Halt — je EIN
    # ALARM mit Zahl, Station und Kopf, nicht doppelt
    PLATTE_UNTEN=10 PLATTE_WARN=15
    frei_gb() { echo 12.5; }
    vor_station s3
    vor_station s4
    w1=$(koord zug/erledigt.txt | grep -c "ALARM gtx: PLATTE 12.5 GB frei (< 15 GB) — Warnung: die Platten-Wache hält bei 10 GB, Station s3")
    w2=$(grep -c "Station s4 beginnt · C: 12.5 GB frei" "$L")
    frei_gb() { echo 9.4; }
    platte_zu
    j=$?
    platte_zu
    f2=$(koord zug/erledigt.txt | grep -c "ALARM gtx: PLATTE 9.4 GB frei (< 10 GB)")
    f3=$(koord zug/erledigt.txt | grep "ALARM gtx: PLATTE 9.4" | grep -c "Kopf ${k2b:0:8}")
    frei_gb() { echo 50; }
    if [ $j = 0 ] && [ "$f2" = 1 ] && [ "$f3" = 1 ] && [ "$w1" = 1 ] && [ "$w2" = 1 ] && ! platte_zu; then echo "OK j  Platte: vor der Station die Zahl („C: 12.5 GB frei“), bei 12,5 GB EINE Warnung (< 15), bei 9,4 GB EIN Halt-Alarm (< 10) mit Station und Kopf ${k2b:0:8}, nicht doppelt; bei 50 GB nichts"
    else echo "ROT j  Platte: Warnung ${w1} (Soll 1), Zahl vor der Station ${w2} (Soll 1), platte_zu $j (Soll 0), Halt-Zeilen ${f2} (Soll 1), mit Kopf ${f3} (Soll 1)"; fi
    # l — BEHALTEN JE STATION (Koordinator 03:30): das ECHTE kandidat.sh mit Attrappen (punkte-offen.cjs, Schloss, Hook- und Dienst-Log).
    # Die Sitzung „a,b,c,d“ fällt nach 2 Stationen (VERDRÄNGT): gepusht werden a,b, nur der Rest c,d fährt in einer neuen Sitzung, nach „e“
    local KT=$X/kt ke=${KANDIDAT_ECHT:-$D/ort/n0611/kandidat.sh}
    [ -f "$ke" ] || ke=$D/../../p3/n0611/kandidat.sh
    mkdir -p "$KT/n" "$KT/kpm/meisterkarte-quelle/punkte/messung" "$KT/km"
    : >"$KT/hook.log"; : >"$KT/dienst.log"; : >"$KT/n/pm-stand.cjs"; : >"$KT/n/zeile-erledigt.cjs"
    printf 'gpu_frei() { return 0; }\ncpu_ruhe() { :; }\n' >"$KT/schloss.sh"
    cat >"$KT/n/punkte-offen.cjs" <<'ATTRAPPE'
const fs = require("fs"), path = require("path"), [was, K] = process.argv.slice(2), X = process.env.KT_X;
const f = path.join(X, "kpm", "meisterkarte-quelle", "punkte", "messung", K.slice(0, 8) + "-gtx.json");
const lies = () => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : { je: {} });
if (was === "lauf") {
    fs.appendFileSync(path.join(X, "laeufe.log"), process.env.NUR + "\n");
    const m = lies(), vn = path.join(X, "verdr_nach");
    let i = 0;
    for (const s of process.env.NUR.split(",")) {
        if (fs.existsSync(vn) && Number(fs.readFileSync(vn, "utf8")) === i) {
            fs.rmSync(vn);
            fs.appendFileSync(path.join(X, "dienst.log"), "x gpu-lauf omen-punkte-gtx-sitzung VERDRÄNGT 1/3\n");
            fs.appendFileSync(path.join(X, "hook.log"), "x ende 1 echt: fertig\n");
            process.exit(0);
        }
        m.je[s] = { gruen: true, zeit: new Date().toISOString() };
        fs.writeFileSync(f, JSON.stringify(m));
        if (s === "a" || s === "b") { const rd = path.join(path.dirname(f), "roh", K.slice(0, 8) + "-gtx"); fs.mkdirSync(rd, { recursive: true }); fs.writeFileSync(path.join(rd, s + "-bild.png"), "PNG " + s); }
        i++;
    }
} else if (was === "push") fs.appendFileSync(path.join(X, "push.log"), Object.keys(lies().je).sort().join(",") + "\n");
ATTRAPPE
    echo 2 >"$KT/verdr_nach"
    # das Gesetz der Roh-Bilder (6b): a gebucht GRÜN, misst GRÜN (Urteil hält) → Bild in die Ablage; b gebucht ROT, misst GRÜN (Beweis-Bild) → bleibt
    echo '{"je":{"x":{"stationen":[{"id":"a","geraet":"gtx","gruen":true,"sha":"x"},{"id":"b","geraet":"gtx","gruen":false,"sha":"x"}]}}}' >"$KT/kpm/meisterkarte-quelle/punkte/stand.json"
    KANDIDAT_ABLAGE=$KT/ablage KT_X=$KT KOPF=$k0 KANDIDAT_N=$KT/n KANDIDAT_PM=$KT/kpm KANDIDAT_M=$KT/km KANDIDAT_H=$KT/hook.log KANDIDAT_D=$KT/dienst.log \
        KANDIDAT_SCHLOSS=$KT/schloss.sh KANDIDAT_SCHLAF=0 RUNDE_CJS=$RUNDE_CJS bash "$ke" kt x "a,b,c,d;e" >/dev/null 2>&1
    f1=$(paste -sd' ' "$KT/laeufe.log" 2>/dev/null)
    f2=$(head -n 1 "$KT/push.log" 2>/dev/null)
    f3=$(grep -c "kt-1 GEPUSHT (Versuch 1) 2 Station(en) — BEHALTEN je Station, der Rest folgt: c,d" "$KT/n/kette-0711.log" 2>/dev/null)
    if [ "$f1" = "a,b,c,d e c,d" ] && [ "$f2" = "a,b" ] && [ "$f3" = 1 ] && [ "$(tail -n 1 "$KT/push.log")" = "a,b,c,d,e" ]; then
        echo "OK l  BEHALTEN je Station: die Sitzung a,b,c,d fiel nach 2 (VERDRÄNGT) — a,b gepusht, nur c,d fuhr neu (nach e), am Ende a–e"
    else echo "ROT l  BEHALTEN je Station: Sitzungen „$f1“ (Soll „a,b,c,d e c,d“), erster Push „$f2“ (Soll a,b), Zeile BEHALTEN $f3 (Soll 1), letzter Push „$(tail -n 1 "$KT/push.log" 2>/dev/null)“"; fi
    local rd=$KT/kpm/meisterkarte-quelle/punkte/messung/roh/${k0:0:8}-gtx
    if [ -f "$KT/ablage/${k0:0:8}-gtx/a-bild.png" ] && [ ! -f "$rd/a-bild.png" ] && [ -f "$rd/a-bild.png.sha256" ] && [ -f "$rd/b-bild.png" ]; then
        echo "OK m  Roh-Bilder der OMEN: a hält GRÜN — Bild in der Ablage am Gerät, nur a-bild.png.sha256 reist; b wechselt ROT → GRÜN — das Beweis-Bild reist"
    else echo "ROT m  Roh-Bilder: Ablage a $([ -f "$KT/ablage/${k0:0:8}-gtx/a-bild.png" ] && echo ja || echo nein) (Soll ja), im Baum a $([ -f "$rd/a-bild.png" ] && echo ja || echo nein) (Soll nein), Prüfsumme a $([ -f "$rd/a-bild.png.sha256" ] && echo ja || echo nein), b $([ -f "$rd/b-bild.png" ] && echo ja || echo nein) (Soll ja)"; fi
    # g — die Baum-Sperre (14.11.)
    BAUM_WARTET=$X/wartet
    mkdir -p "$BAUM_WARTET"
    schloss_wartende() { :; }
    local w0 w1 w2
    w0=$(warter_echt)
    touch "$BAUM_WARTET/landung-22" "$BAUM_WARTET/dauer-44"
    touch -d '5 minutes ago' "$BAUM_WARTET/macher-33"
    w1=$(warter_echt)
    touch "$BAUM_WARTET/macher-11"
    w2=$(warter_echt)
    if [ -z "$w0" ] && [ -z "$w1" ] && [ "$w2" = "Baum-Sperre:macher-11" ]; then echo "OK g  Baum-Sperre: die frische Marke eines Machers ist ein Wartender ($w2); die der Landung, des Wächters und eine 5 min alte zählen nicht"
    else echo "ROT g  Baum-Sperre: leer „$w0“ (Soll leer), nur Landung · Wächter · alte Marke „$w1“ (Soll leer), mit frischem Macher „$w2“ (Soll Baum-Sperre:macher-11)"; fi
    # h — die Karte 2
    PM=$X/pm
    local h0 h1
    h0=$(karte2_nur)
    mkdir -p "$PM/vision"
    echo '{"lesart":"x","zeilen":[{"station":"a.K1#1","richter":"gleich"},{"station":"b.K2#2","richter":"fehlt"},{"station":"a.K1#1","richter":"gleich"}]}' >"$PM/vision/richter-tafel.json"
    h1=$(karte2_nur)
    if [ -z "$h0" ] && [ "$h1" = "a.K1#1" ]; then echo "OK h  Karte 2: ohne Tafel leer, mit Tafel ihre Stationen mit einer Zeile gleich, je einmal ($h1 — b.K2#2 „fehlt“ fährt nicht)"
    else echo "ROT h  Karte 2: ohne Tafel „$h0“ (Soll leer), mit Tafel „$h1“ (Soll a.K1#1)"; fi
    # i — halt(): die Flagge bleibt
    touch "$S/landung.halt"
    (halt) >/dev/null 2>&1
    j=$?
    if [ $j = 3 ] && [ -f "$S/landung.halt" ]; then echo "OK i  halt(): Exit 3, landung.halt liegt weiter"
    else echo "ROT i  halt(): Exit $j (Soll 3), Flagge $([ -f "$S/landung.halt" ] && echo liegt || echo FORT)"; fi
    command rm -rf "$X"
}
MUTANTEN=${ST_MUTANTEN-"je-station behalt-gruppe bild-omen sprung von-vorn volle-liste tafel-reihe still blind halt-rm nur-schloss tafel-blind tafel-alle"}
selbsttest() {
    local O m r rot=0 mr=0 mz=0
    O=$(mktemp -d)
    for m in echt $MUTANTEN; do (st_lauf "${m#echt}" >"$O/$m" 2>&1) & done
    wait
    grep -E "^(OK|ROT)" "$O/echt" | sed 's/^/  /'
    grep -q "^ROT" "$O/echt" && rot=1
    [ "$(grep -c "^OK" "$O/echt")" = 14 ] || rot=1
    for m in $MUTANTEN; do
        mz=$((mz + 1))
        r=$(grep "^ROT" "$O/$m" | cut -c1-140)
        if [ -n "$r" ]; then mr=$((mr + 1)); echo "  Mutante „$m“ ROT an: $(echo "$r" | cut -c5-100 | tr '\n' '|' | sed 's/|$//;s/|/ · /g')"; else echo "  Mutante „$m“ bleibt GRÜN"; fi
    done
    rm -rf "$O"
    if [ $rot = 0 ] && [ $mr = $mz ]; then echo "landung-dienst SELBSTTEST GRÜN: 14 Fälle grün (a–m), $mr/$mz Mutanten ROT"; return 0; fi
    echo "landung-dienst SELBSTTEST ROT: $(grep -c "^OK" "$O/echt" 2>/dev/null) Fälle OK, $mr/$mz Mutanten ROT"
    return 1
}
[ "$1" = --selbsttest ] && { selbsttest; exit $?; }

. "$D/orte.sh"
KANDIDAT=$N/kandidat.sh
KETTE_LOG=$N/kette-0711.log
RUNDE_REPO=$M                                    # der Klon, der origin kennt (koordination · punkte-maschine · main)
MESSUNG_DIR=$PM/meisterkarte-quelle/punkte/messung # die Reihe liest die Mess-Dateien beider Geräte hier
EICHTAFEL=$ST/eichtafel-gtx.txt                    # die Lauf-Tafel der Maschine je Fahrt (eichtafel_lesen)
schloss landung || exit 0
L=$ST/landung.log
log "START landung-dienst (PID $(cat "$S/landung.pid"), MSYS $$) — das Gesetz der Runde, zug/runde.txt"
while :; do
    halt
    if platte_zu; then
        sleep 120
        continue
    fi
    runde_takt
    sleep 60
done
