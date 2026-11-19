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
# PLATTE: unter $PLATTE_UNTEN GB frei beginnt keine Liste (platte-dienst.sh hält eine laufende an).
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
gepusht() { tail -n +$(($1 + 1)) "$KETTE_LOG" 2>/dev/null | grep -cE " $2-[0-9]+ GEPUSHT"; } # <zeilen vorher> <name>
station_jetzt() { tail -n +$(($1 + 1)) "$KETTE_LOG" 2>/dev/null | sed -n 's/.* Versuch [0-9]* START (\(.*\))$/\1/p' | tail -n 1; }
zahl() { echo "$1" | tr ',|' '\n\n' | grep -c .; }
# runde <verb> … — zug/dienst/runde.cjs gegen den Klon $RUNDE_REPO (stdout = die Antwort, stderr ins Log)
runde() { node "$RUNDE_CJS" "$@" 2>>"$L"; }
runde_alarm() { runde alarm "$RUNDE_REPO" "$GERAET (landung-dienst)" >>"$L"; }
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
offen_am() { runde offen "$PM" refs/omen/dauer-pm "$GERAET" "$1" "$2"; } # <kopf> <liste> → was an diesem Kopf noch keinen Eintrag trägt
# liste_fahren <K> <NAME> <REST> <r> <BASIS> <GESAMT> — EINE Fahrt über kandidat.sh, je Station eine Sitzung, je gepushte Station der
# Stand in zug/runde.txt; 0 durch · 2 GEWICHEN (ein Lauf wartete am Schloss; BEHALTEN = gepushte Stationen) · 3 GEHALTEN (landung.halt).
# Eine Landung ändert hier nichts: die Liste fährt am Kopf der Runde zu Ende (DAS GESETZ DER RUNDE).
liste_fahren() {
    local K=$1 NAME=$2 REST=$3 r=$4 BASIS=$5 GESAMT=$6 kp t l0 b fb=0 grund=
    GRENZE=$S/landung.grenze
    rm -f "$GRENZE"
    WEICHT_VOR= BEHALTEN=0
    l0=$(wc -l <"$KETTE_LOG" 2>/dev/null || echo 0)
    KOPF=$K EINZELN=1 SPRUNG=$GRENZE bash "$KANDIDAT" "$NAME" x "$REST" >>"$L" 2>&1 &
    kp=$!
    t=0
    while kill -0 $kp 2>/dev/null; do
        puls landung "Runde $RN misst ${K:0:8} ($((BASIS + fb))/$GESAMT, Abstand zu main $(abstand "$K"))${WEICHT_VOR:+ — WEICHT vor $WEICHT_VOR}: $(tail -n 1 "$KETTE_LOG" 2>/dev/null | cut -c1-150)"
        sleep $TAKT_S
        t=$((t + 1))
        b=$(gepusht "$l0" "$NAME")
        if [ "$b" -gt "$fb" ]; then
            fb=$b
            runde stand "$RUNDE_REPO" "$GERAET" "$K" laeuft --erledigt $((BASIS + b)) --gesamt "$GESAMT" --station "$(station_jetzt "$l0")" >>"$L"
        fi
        [ $((t % 4)) = 0 ] && runde_alarm
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
    sag "landung Runde $RN am ${RK:0:8}: die OMEN ist durch ($GESAMT Stationen) — $(runde durch "$RUNDE_REPO" "$GERAET" "$RK" "$(main_kopf)")"
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
# Mutanten (je eine Regel alt): sprung (der Kopf ist der jüngste main, wie bis 19.11.) · von-vorn (Fortsetzung blind: die ganze Liste) ·
#    volle-liste (der Richter nimmt jede Station der Liste) · tafel-reihe (die Reihe der Tafel) · still (kein Alarm) · blind (kein Warter) ·
#    halt-rm (halt() löscht die Flagge) · nur-schloss · tafel-blind · tafel-alle — alle ROT.
st_lauf() { # $1 = Mutante (leer = echt)
    local X rc n alle o k0 k1 k2 v w j e1 e2 f1 f2 f3 z
    X=$(mktemp -d)
    S=$X/s L=$X/landung.log KETTE_LOG=$X/kette.log KANDIDAT=$X/kandidat.sh TAKT_S=0.05 MESSUNG_DIR=$X/messung
    RUNDE_REPO=$X/klon RICHTER_REPO=$X/klon RICHTER_ZUSTAND=$X/richter RICHTER_PM=$X/klon
    export RICHTER_REPO RICHTER_ZUSTAND RICHTER_PM
    mkdir -p "$S" "$MESSUNG_DIR"
    : >"$KETTE_LOG"
    # der Sandkasten: origin mit main (k0 → … → k2), koordination (leer bis auf erledigt.txt) und punkte-maschine
    A0="-c user.name=t -c user.email=t@t -c core.autocrlf=false"
    git init -q --bare "$X/o.git" && git init -q -b main "$X/klon" && git -C "$X/klon" remote add origin "$X/o.git"
    for j in 0 1 2 3 4 5; do git -C "$X/klon" $A0 commit -q --allow-empty -m "main $j"; done
    k0=$(git -C "$X/klon" rev-parse HEAD~5) k1=$(git -C "$X/klon" rev-parse HEAD~2) k2=$(git -C "$X/klon" rev-parse HEAD)
    git -C "$X/klon" push -q origin main
    git -C "$X/klon" checkout -q --orphan koordination && mkdir -p "$X/klon/zug" && echo "# erledigt" >"$X/klon/zug/erledigt.txt" &&
        git -C "$X/klon" add zug && git -C "$X/klon" $A0 commit -q -m koord && git -C "$X/klon" push -q origin koordination
    git -C "$X/klon" checkout -q --orphan punkte-maschine && git -C "$X/klon" rm -rq --cached zug && rm -rf "$X/klon/zug" &&
        git -C "$X/klon" $A0 commit -q --allow-empty -m pm && git -C "$X/klon" push -q origin punkte-maschine
    git -C "$X/klon" checkout -q main
    echo "$k0" >"$X/main"
    echo "$k2" >"$X/kopf2"
    cat >"$KANDIDAT" <<'STUMMEL'
#!/bin/bash
# kandidat.sh-Stummel: $1 Name, $3 Liste, KOPF; die Grenz-Flagge vor jeder Station (wie kandidat.sh), je Station 0,4 s
X=$(dirname "$0"); i=0
for s in ${3//,/ }; do
    [ -n "$SPRUNG" ] && [ -f "$SPRUNG" ] && { echo "$(date +%T) $1 SPRUNG nach $i" >>"$X/kette.log"; break; }
    i=$((i + 1))
    echo "$(date +%T) ${KOPF:0:8} $1-$i Versuch 1 START ($s)" >>"$X/kette.log"
    [ -f "$X/tod_in" ] && [ "$(cat "$X/tod_in")" = "$i" ] && { rm -f "$X/tod_in"; kill -9 $PPID; exit 9; }
    sleep 0.4
    echo "$KOPF:$s" >>"$X/gepusht"; echo "$(date +%T) $1-$i GEPUSHT (Versuch 1)" >>"$X/kette.log"
    [ -f "$X/warter_nach" ] && [ "$(cat "$X/warter_nach")" = "$i" ] && echo macher-hand >"$X/warter"
    [ -f "$X/halt_nach" ] && [ "$(cat "$X/halt_nach")" = "$i" ] && touch "$X/s/landung.halt"
    [ -f "$X/landung_nach" ] && [ "$(cat "$X/landung_nach")" = "$i" ] && cp "$X/kopf2" "$X/main"
done
STUMMEL
    puls() { echo "PULS $*" >>"$L"; }
    sag() { echo "SAG $*" >>"$L"; }
    warter() { cat "$X/warter" 2>/dev/null; }
    main_kopf() { cat "$X/main"; }
    abstand() { echo 0; }
    pm_stand() { :; }
    summe() { :; }
    liste_quelle() { QUELLE=Stummel; echo s1,s2,s3,s4,s5,s6,s7,s8; }
    ohne_band() { echo "$1"; }
    offen_am() { echo "$2" | tr ',|' '\n\n' | grep . | while read -r s; do grep -qxF "$1:$s" "$X/gepusht" 2>/dev/null || echo "$s"; done | paste -sd, -; }
    am() { grep -c "^$1:" "$X/gepusht" 2>/dev/null; } # gepushte Stationen an einem Kopf
    feld() { git -C "$X/klon" fetch -q origin koordination && git -C "$X/klon" show FETCH_HEAD:zug/runde.txt | grep "^$1 "; }
    case "$1" in
        sprung) runde_takt_echt() { :; }; eval "$(declare -f runde_takt | sed '1s/runde_takt/runde_takt_echt/')"; runde_takt() { local m; m=$(main_kopf); runde() { if [ "$1" = lies ]; then node "$RUNDE_CJS" "$@" 2>>"$L" | awk -v m="$m" '{ if (NF >= 2) $2 = m; print }'; else node "$RUNDE_CJS" "$@" 2>>"$L"; fi; }; runde_takt_echt; unset -f runde; runde() { node "$RUNDE_CJS" "$@" 2>>"$L"; }; } ;;
        von-vorn) offen_am() { echo "$2" | tr '|' ',' | sed 's/,$//'; } ;;
        volle-liste) richte_runde() { local s; for s in $(echo "$3" | tr ',|' '  '); do bash "$RICHTER" "$GERAET" --fall "$s" "$2" "$1" >>"$L" 2>&1; done; } ;;
        tafel-reihe) runde() { if [ "$1" = reihe ]; then echo "$4|"; else node "$RUNDE_CJS" "$@" 2>>"$L"; fi; } ;;
        still) runde_alarm() { :; } ;;
        blind) warter() { :; } ;;
        halt-rm) halt() { [ -f "$S/landung.halt" ] && { rm -f "$S/landung.halt"; exit 3; }; } ;;
        nur-schloss) baum_wartende() { :; } ;;
        tafel-blind) karte2_nur() { :; } ;;
        tafel-alle) karte2_nur() { [ -f "$PM/vision/richter-tafel.json" ] && grep -o '"station":"[^"]*"' "$PM/vision/richter-tafel.json" | cut -d'"' -f4 | awk '!s[$0]++' | paste -sd, -; } ;;
    esac
    # a — die Landung mitten in der Runde
    runde_takt # legt Runde 1 aus dem Bestand an (kein Kopf trägt eine Mess-Datei: main k0)
    echo 2 >"$X/landung_nach"
    runde_takt
    n=$(am "${k0:0:8}")
    e1=$(feld gtx)
    runde durch "$RUNDE_REPO" radeon "$k0" "$(main_kopf)" >/dev/null # das andere Gerät ist auch durch → die nächste Runde
    z=$(feld runde)
    if [ "$n" = 8 ] && [ "$(am "${k2:0:8}")" = 0 ] && echo "$e1" | grep -q "^gtx durch 8/8 " && ! grep -q SPRUNG "$KETTE_LOG" &&
        [ "$z" = "$(echo "$z" | sed -n "s/^runde 2 kopf $k2 start [^ ]* vorher $k0$/&/p")" ] && [ -n "$z" ]; then
        echo "OK a  Landung nach Station 2: die Runde fuhr 8 von 8 am Kopf ${k0:0:8} zu Ende, kein SPRUNG; beide durch → Runde 2 am main des Moments ${k2:0:8}, vorher ${k0:0:8}"
    else echo "ROT a  Landung nach Station 2: am Kopf der Runde $n von 8, am neuen main $(am "${k2:0:8}") (Soll 0), Zeile gtx „$(echo "$e1" | cut -c1-30)“, SPRUNG $(grep -c SPRUNG "$KETTE_LOG"), Runde „$(echo "$z" | cut -c1-60)“"; fi
    # b — Halt nach Station 3, Weichen nach Station 2 (Runde 2 am k2)
    rm -f "$X/landung_nach"
    echo 3 >"$X/halt_nach"
    (runde_takt)
    rc=$?
    e1=$(feld gtx)
    rm -f "$S/landung.halt" "$X/halt_nach"
    j=$(wc -l <"$KETTE_LOG")
    runde_takt # ohne Flagge: weiter, bis der Macher kommt
    f1=$(tail -n +$((j + 1)) "$KETTE_LOG" | sed -n 's/.* Versuch 1 START (\(.*\))$/\1/p' | head -n 1)
    e2=$(feld gtx)
    if [ $rc = 3 ] && echo "$e1" | grep -q "^gtx halt 3/8 " && [ -f "$X/s/landung.halt" -o "$1" != halt-rm ] && [ "$f1" = "$(echo "$e1" | sed 's/.* liste //' | tr ',|' '\n\n' | grep . | sed -n 4p)" ] &&
        [ "$(am "${k2:0:8}")" = 8 ] && [ "$(grep "^${k2:0:8}" "$X/gepusht" | sort -u | wc -l)" = 8 ] && echo "$e2" | grep -q "^gtx durch 8/8 "; then
        echo "OK b  Halt nach Station 3: Ende an der Grenze („halt 3/8“), ohne Flagge weiter an Station 4 ($f1), 8 von 8, keine doppelt"
    else echo "ROT b  Halt: Ende $rc (Soll 3), Zeile „$(echo "$e1" | cut -c1-24)“, weiter an „$f1“ (Soll die 4. der Liste), am Kopf $(am "${k2:0:8}") (Soll 8, eindeutig $(grep "^${k2:0:8}" "$X/gepusht" | sort -u | wc -l))"; fi
    # b2 — der Macher am Schloss: WEICHT an der Grenze, keine Fahrt solange er wartet, danach an derselben Station weiter (Runde 3)
    runde durch "$RUNDE_REPO" radeon "$k2" "$k1" >/dev/null # main zeigt (gespielt) auf k1: die nächste Runde nimmt ihn
    echo "$k1" >"$X/main"
    echo 2 >"$X/warter_nach"
    runde_takt
    e1=$(feld gtx)
    w=$(am "${k1:0:8}")
    runde_takt # er wartet noch: keine Station
    v=$(am "${k1:0:8}")
    rm -f "$X/warter" "$X/warter_nach"
    j=$(wc -l <"$KETTE_LOG")
    runde_takt
    f1=$(tail -n +$((j + 1)) "$KETTE_LOG" | sed -n 's/.* Versuch 1 START (\(.*\))$/\1/p' | head -n 1)
    if echo "$e1" | grep -q "^gtx weicht [2-7]/8 " && [ "$w" = "$v" ] && [ "$(am "${k1:0:8}")" = 8 ] && [ "$(grep "^${k1:0:8}" "$X/gepusht" | sort -u | wc -l)" = 8 ] &&
        [ "$f1" = "$(echo "$e1" | sed 's/.* liste //' | tr ',|' '\n\n' | grep . | sed -n "$((w + 1))p")" ]; then
        echo "OK b  Macher am Schloss nach Station 2: WEICHT („$(echo "$e1" | cut -c5-14)“), keine Station solange er wartet, weiter an Station $((w + 1)) ($f1), 8 von 8"
    else echo "ROT b  Weichen: Zeile „$(echo "$e1" | cut -c1-24)“ (Soll weicht 2–7/8), während er wartet $w → $v (Soll gleich), weiter an „$f1“, am Kopf $(am "${k1:0:8}") (Soll 8)"; fi
    # c — Neustart: der Dienst stirbt in Station 4 (Runde 4 am k2 … main zeigt wieder auf k2? nein: auf einen neuen Kopf k2~1)
    k2b=$(git -C "$X/klon" rev-parse "$k2~1")
    runde durch "$RUNDE_REPO" radeon "$k1" "$k2b" >/dev/null
    echo "$k2b" >"$X/main"
    echo 4 >"$X/tod_in"
    (runde_takt) >/dev/null 2>&1
    e1=$(feld gtx)
    j=$(wc -l <"$KETTE_LOG")
    (unset RN RK RV RZ RLISTE; runde_takt) # ein neuer Prozess: sein Gedächtnis ist die Datei
    f1=$(tail -n +$((j + 1)) "$KETTE_LOG" | sed -n 's/.* Versuch 1 START (\(.*\))$/\1/p' | head -n 1)
    if echo "$e1" | grep -q "^gtx laeuft 3/8 " && [ "$f1" = "$(echo "$e1" | sed 's/.* liste //' | tr ',|' '\n\n' | grep . | sed -n 4p)" ] &&
        [ "$(am "${k2b:0:8}")" = 8 ] && [ "$(grep "^${k2b:0:8}" "$X/gepusht" | sort -u | wc -l)" = 8 ]; then
        echo "OK c  Neustart: der Dienst starb in Station 4 („laeuft 3/8“), der neue Prozess setzte an Station 4 fort ($f1), 8 von 8, keine doppelt"
    else echo "ROT c  Neustart: Zeile „$(echo "$e1" | cut -c1-24)“ (Soll laeuft 3/8), weiter an „$f1“ (Soll die 4. der Liste), am Kopf $(am "${k2b:0:8}") (Soll 8, eindeutig $(grep "^${k2b:0:8}" "$X/gepusht" | sort -u | wc -l))"; fi
    # d — frisches ROT: s1 GRÜN am k0, ROT am k2; s2 GRÜN → GRÜN; s3 nie GRÜN. Täter (Schein) ist k1
    git -C "$X/klon" checkout -q punkte-maschine
    mkdir -p "$X/klon/meisterkarte-quelle/punkte/messung"
    echo '{"je":{"s1":{"gruen":true,"zeit":"1"},"s2":{"gruen":true,"zeit":"1"},"s3":{"gruen":false,"zeit":"1"}}}' >"$X/klon/meisterkarte-quelle/punkte/messung/${k0:0:8}-gtx.json"
    echo '{"je":{"s1":{"gruen":false,"zahl":"0,4 < 1","zeit":"2"},"s2":{"gruen":true,"zeit":"2"},"s3":{"gruen":false,"zeit":"2"}}}' >"$X/klon/meisterkarte-quelle/punkte/messung/${k2:0:8}-gtx.json"
    git -C "$X/klon" add -A meisterkarte-quelle && git -C "$X/klon" $A0 commit -qm mess && git -C "$X/klon" push -q origin punkte-maschine
    git -C "$X/klon" checkout -q main
    RN=d
    RICHTER_SCHEIN_ROT_AB=$k1 richte_runde "$k2" "$k0" "s1,s2,s3|"
    git -C "$X/klon" fetch -q origin koordination
    o=$(git -C "$X/klon" show FETCH_HEAD:zug/richter.txt 2>/dev/null)
    if echo "$o" | grep -q "TÄTER s1: ${k1:0:8} .*(gut ${k0:0:8}, schlecht ${k2:0:8}" && ! echo "$o" | grep -qE " (s2|s3)[: ]" && ! grep -qE "START (s2|s3) " "$X/richter/richter.log" 2>/dev/null; then
        echo "OK d  frisches ROT an s1 (GRÜN am ${k0:0:8}, ROT am ${k2:0:8}): NUR s1 halbiert über die Köpfe dazwischen, TÄTER-Kopf ${k1:0:8} beim Namen in zug/richter.txt; s2, s3 nicht gefahren"
    else echo "ROT d  Richter: richter.txt „$(echo "$o" | tail -n 2 | cut -c1-120 | tr '\n' '|')“, gestartet $(grep -oE "START [^ ]+" "$X/richter/richter.log" 2>/dev/null | tr '\n' ' ') (Soll nur s1, Täter ${k1:0:8})"; fi
    # e — die Reihe: s1 gebucht grün (Paar am h1 beide GRÜN), s2 Paar ROT, s3 nur gtx GRÜN, s4–s8 nie
    echo '{"zeit":"2026-11-18T01:00:00Z","je":{"s1":{"gruen":true,"zeit":"2026-11-18T01:00:00Z"},"s2":{"gruen":true,"zeit":"2026-11-18T01:01:00Z"},"s3":{"gruen":true,"zeit":"2026-11-18T01:02:00Z"}}}' >"$MESSUNG_DIR/aaaaaaaa-gtx.json"
    echo '{"zeit":"2026-11-18T01:00:00Z","je":{"s1":{"gruen":true,"zeit":"2026-11-18T01:00:00Z"},"s2":{"gruen":false,"zeit":"2026-11-18T01:01:00Z"}}}' >"$MESSUNG_DIR/aaaaaaaa-radeon.json"
    o=$(runde reihe "$MESSUNG_DIR" gtx s1,s2,s3,s4,s5,s6,s7,s8)
    if [ "$o" = "s4,s5,s6,s7,s8,s2,s3|s1" ]; then echo "OK e  Reihe: ungebucht vor gebucht grün — nie gemessen, Paar ROT, ohne Paar zuerst, das grüne Paar s1 zuletzt ($o)"
    else echo "ROT e  Reihe: „$o“ (Soll s4,s5,s6,s7,s8,s2,s3|s1)"; fi
    # f — Alarm: Runde 4 am k2b, gtx durch, das andere Gerät ohne Fortschritt
    o=$(git -C "$X/klon" show FETCH_HEAD:zug/runde.txt | sed -n 's/^runde .* start \([^ ]*\) .*/\1/p')
    f1=$(RUNDE_JETZT=$(date -u -d "$o + 10 minutes" +%FT%TZ) runde_alarm; feld radeon)
    j=$(git -C "$X/klon" show FETCH_HEAD:zug/erledigt.txt | grep -c "ALARM")
    RUNDE_JETZT=$(date -u -d "$o + 20 minutes" +%FT%TZ) runde_takt # die OMEN ist durch und wartet: ihr Takt sieht das andere Gerät
    RUNDE_JETZT=$(date -u -d "$o + 25 minutes" +%FT%TZ) runde_alarm
    git -C "$X/klon" fetch -q origin koordination
    f2=$(git -C "$X/klon" show FETCH_HEAD:zug/erledigt.txt | grep -c "RUNDE 4 ALARM radeon: ohne Fortschritt seit 20 min")
    f3=$(git -C "$X/klon" show FETCH_HEAD:zug/erledigt.txt | grep -c "ALARM")
    if [ "$j" = 0 ] && [ "$f2" = 1 ] && [ "$f3" = 1 ]; then echo "OK f  Alarm: nach 10 min keiner, nach 20 min EINE Zeile „RUNDE 4 ALARM radeon: ohne Fortschritt seit 20 min“, nach 25 min nicht doppelt"
    else echo "ROT f  Alarm: nach 10 min $j (Soll 0), nach 20 min $f2 (Soll 1), zusammen $f3 (Soll 1)"; fi
    # g — die Baum-Sperre
    BAUM_WARTET=$X/wartet
    mkdir -p "$BAUM_WARTET"
    schloss_wartende() { :; }
    unset -f warter
    warter() { warter_echt; }
    [ "$1" = blind ] && warter() { :; }
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
    local e0 h1
    e0=$(karte2_nur)
    mkdir -p "$PM/vision"
    echo '{"lesart":"x","zeilen":[{"station":"a.K1#1","richter":"gleich"},{"station":"b.K2#2","richter":"fehlt"},{"station":"a.K1#1","richter":"gleich"}]}' >"$PM/vision/richter-tafel.json"
    h1=$(karte2_nur)
    if [ -z "$e0" ] && [ "$h1" = "a.K1#1" ]; then echo "OK h  Karte 2: ohne Tafel leer, mit Tafel ihre Stationen mit einer Zeile gleich, je einmal ($h1 — b.K2#2 „fehlt“ fährt nicht)"
    else echo "ROT h  Karte 2: ohne Tafel „$e0“ (Soll leer), mit Tafel „$h1“ (Soll a.K1#1)"; fi
    # i — halt(): die Flagge bleibt
    touch "$S/landung.halt"
    (halt) >/dev/null 2>&1
    rc=$?
    if [ $rc = 3 ] && [ -f "$S/landung.halt" ]; then echo "OK i  halt(): Exit 3, landung.halt liegt weiter"
    else echo "ROT i  halt(): Exit $rc (Soll 3), Flagge $([ -f "$S/landung.halt" ] && echo liegt || echo FORT)"; fi
    command rm -rf "$X"
}
MUTANTEN="sprung von-vorn volle-liste tafel-reihe still blind halt-rm nur-schloss tafel-blind tafel-alle"
selbsttest() {
    local O m r rot=0 mr=0 mz=0
    O=$(mktemp -d)
    for m in echt $MUTANTEN; do (st_lauf "${m#echt}" >"$O/$m" 2>&1) & done
    wait
    grep -E "^(OK|ROT)" "$O/echt" | sed 's/^/  /'
    grep -q "^ROT" "$O/echt" && rot=1
    [ "$(grep -c "^OK" "$O/echt")" = 10 ] || rot=1
    for m in $MUTANTEN; do
        mz=$((mz + 1))
        r=$(grep "^ROT" "$O/$m" | cut -c1-140)
        if [ -n "$r" ]; then mr=$((mr + 1)); echo "  Mutante „$m“ ROT an: $(echo "$r" | cut -c5-100 | tr '\n' '|' | sed 's/|$//;s/|/ · /g')"; else echo "  Mutante „$m“ bleibt GRÜN"; fi
    done
    rm -rf "$O"
    if [ $rot = 0 ] && [ $mr = $mz ]; then echo "landung-dienst SELBSTTEST GRÜN: 10 Fälle grün (a–i), $mr/$mz Mutanten ROT"; return 0; fi
    echo "landung-dienst SELBSTTEST ROT: $(grep -c "^OK" "$O/echt" 2>/dev/null) Fälle OK, $mr/$mz Mutanten ROT"
    return 1
}
[ "$1" = --selbsttest ] && { selbsttest; exit $?; }

. "$D/orte.sh"
KANDIDAT=$N/kandidat.sh
KETTE_LOG=$N/kette-0711.log
RUNDE_REPO=$M                                    # der Klon, der origin kennt (koordination · punkte-maschine · main)
MESSUNG_DIR=$PM/meisterkarte-quelle/punkte/messung # die Reihe liest die Mess-Dateien beider Geräte hier
schloss landung || exit 0
L=$ST/landung.log
log "START landung-dienst (PID $(cat "$S/landung.pid"), MSYS $$) — das Gesetz der Runde, zug/runde.txt"
while :; do
    halt
    f=$(frei_gb)
    if kleiner "$f" "$PLATTE_UNTEN"; then
        puls landung "wartet: C: $f GB frei < $PLATTE_UNTEN GB — keine Messung, Löschen entscheidet der Schöpfer"
        sleep 120
        continue
    fi
    runde_takt
    sleep 60
done
