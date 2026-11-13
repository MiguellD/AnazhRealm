#!/bin/bash
# unter sh.exe neu (Grund und Zahlen: zug-dienst.sh „UNTER sh.exe", 13.11.) — als sh gerufen schaltet die Zeile nur POSIX ab
case "$BASH" in */sh | */sh.exe) set +o posix ;; *) [ -x /usr/bin/sh ] && exec /usr/bin/sh "$0" "$@" ;; esac
# richter.sh <geraet> — DER RICHTER NACH DER LANDUNG (Blockade B2 des Blatts „großes Bild“, Stufe 1; Auftrag Konto 11, 10.11.).
# WARUM: am 10.11. landeten zwei Züge GRÜN in CI und brachen sieben Kriterien der Meisterkarte (w25-gpu-wahl-2,
# w27-wald-kosten-heim); gefunden Stunden später von Hand, −12 Punkte. Der Richter findet den Fall nach der Mess-Scheibe selbst
# und nennt den Täter beim Namen — ohne LLM.
# WAS: nach einer Mess-Scheibe am main-Kopf K vergleicht er messung/<K8>-<geraet>.json mit dem letzten gebuchten Stand
# (stand.json auf punkte-maschine samt Geschichte, richter-werk.cjs faelle). Jede Station GRÜN → ROT ist ein FALL. Je Fall:
#   1 KONTROLLE: am gebuchten GRÜN P misst die Station HEUTE (heutiger Stations-Code) — nicht GRÜN heißt „kein Fall der Kette“
#     (Station oder Gerät, nicht der Zug) und nennt keinen Täter.
#   2 HALBIERUNG der Erst-Eltern-Kette P..K: `punkte.cjs run --sha X --geraet <g> --nur <station>` je Schritt.
#   3 ZWEI BOOTE JE SEITE: der Täter-Commit und sein Vorgänger werden je ein zweites Mal gemessen; hält eins nicht, heißt die
#     Zeile UNSCHARF und nennt keinen Täter (eine Station, die schwankt, klagt keinen Zweig an).
#   4 EINE Zeile „TÄTER <station>: <sha8> Merge <zweig> (gut P, schlecht K, n Schritte)“ nach koordination zug/richter.txt und,
#     ist der Täter ein Merge, als Abschnitt oben in cloud-post/<zweig>.md des Täter-Zweigs.
# CI VOR MESSUNG, SCHLOSS: jeder Schritt wartet auf die freie Karte. gtx: p3/gpu-schloss.sh (gpu_frei) und gpu-lauf.sh, das
# einem wartenden CI-Job weicht — ein verdrängter Schritt zählt nicht und fährt neu. radeon: wie radeon-bisekt.sh — startet ein
# Runner.Worker, fällt der Schritt samt Baum und fährt neu. Die Mess-Dateien der Schritte werden NIE gepusht oder gebucht: was
# vor dem Schritt im Mess-Baum lag, liegt danach wieder dort; der Beleg des Schritts bleibt unter <zustand>/schritte/. Sein
# Urteil liest der Richter aus der eigenen Ausgabe des Schritts, nie aus der Mess-Datei des (geteilten) Baums.
# Aufruf: richter.sh <gtx|radeon>                       Fälle am jüngsten main-Kopf
#         richter.sh <geraet> --kopf <sha>              Fälle an einem festen Kopf
#         richter.sh <geraet> --fall <station> <gut> <schlecht>   einen genannten Fall halbieren (misst auch <schlecht> nach)
#         richter.sh <geraet> --selbsttest [echt]       Fall-Regel + Halbierung an Schein-Urteilen (ohne Karte, Sekunden);
#                                                       mit „echt“ dazu der bekannte Fall vegetation.K5#2 auf der Karte
# Umgebung: TROCKEN=1 (keine Zeile wird gepusht) · RICHTER_MAX (Fälle je Aufruf, Vorgabe 3) · RICHTER_FRIST_S (je Schritt, 1800)
#           RICHTER_REPO · RICHTER_PM · RICHTER_ZUSTAND (Orte, Vorgabe je Gerät unten)
D=$(cd "$(dirname "$0")" && pwd)
GERAET=$1
shift
case "$GERAET" in
    gtx) # die OMEN
        O=/c/Users/micha/Desktop/AnazhRealm-OMEN
        R=${RICHTER_REPO:-$O/AnazhRealm-mess}
        PM=${RICHTER_PM:-$O/n0611-pm}
        ZU=${RICHTER_ZUSTAND:-$O/p3/dienst-omen/zustand/richter}
        export PUNKTE_GPU_LAUF=${PUNKTE_GPU_LAUF:-$O/p3/gpu-lauf.sh}
        SCHLOSS_LIB=$O/p3/gpu-schloss.sh
        VERDR_LOG=$O/p3/messplatz/dienst.log
        CI_ABBRUCH=0
        ;;
    radeon) # der Laptop
        R=${RICHTER_REPO:-/c/Users/micha/AnazhRealm-profiband}
        PM=${RICHTER_PM:-/tmp/claude/w3/pm}
        ZU=${RICHTER_ZUSTAND:-/tmp/claude/dienst/richter}
        SCHLOSS_LIB=
        VERDR_LOG=
        CI_ABBRUCH=1
        ;;
    *)
        echo "richter.sh <gtx|radeon> [--kopf <sha> | --fall <station> <gut> <schlecht> | --selbsttest [echt]]"
        exit 2
        ;;
esac
GS="${TEMP:-/tmp}/claude/gpu-schloss"
WERK=$D/richter-werk.cjs
L=$ZU/richter.log
mkdir -p "$ZU/schritte"
log() { echo "$(date '+%F %T') $*" >>"$L"; }
ci() { tasklist -FI "IMAGENAME eq Runner.Worker.exe" 2>/dev/null | grep -qi Runner.Worker; }
# (die Schloss-Quelle meldet ein gelöstes verwaistes Schloss auf stdout — das gehört ins Log, nie in ein Urteil)
# Frei heißt auch: kein anderer punkte-Lauf hält den Spiel-Baum des Geräts (die Sperre von punkte.cjs) — sonst stünde der Schritt
# IN der Sperre, und eine Verdrängung des fremden Laufs zählte als seine.
# (nur eine Sperre, deren Halter LEBT: am 10.11. 23:19–23:31 standen Landung und Richter 11 min vor der Sperre eines beendeten
# Laufs — punkte.cjs selbst übernimmt eine tote pid, die bloße Ordner-Frage tat es nicht)
sperre_lebt() {
    local p
    p=$(cat "$R/.claude/worktrees/punkte-$GERAET.sperre/pid" 2>/dev/null | tr -dc 0-9)
    [ -n "$p" ] && tasklist -FI "PID eq $p" -NH 2>/dev/null | grep -qw "$p"
}
frei() {
    sperre_lebt && return 1
    if [ -n "$SCHLOSS_LIB" ] && [ -f "$SCHLOSS_LIB" ]; then (. "$SCHLOSS_LIB" && gpu_frei) >>"$L" 2>&1; else [ ! -d "$GS" ] && ! ci; fi
}
# (nur die Verdrängung eines punkte-Laufs zählt — der Spiel-Baum trägt je Gerät EINEN: am 11.11. 01:14 wich ein fremder Lauf
# `omen-hg-ub-a-gipfel` der CI, und der Schritt 87537d3f, der ROT gemessen hatte, fuhr als ABBRUCH neu)
verdr() { if [ -n "$VERDR_LOG" ] && [ -f "$VERDR_LOG" ]; then grep -a "VERDR" "$VERDR_LOG" | grep -ac "punkte"; else echo 0; fi; }
kurz() { git -C "$R" rev-parse "$1" | cut -c1-8; }

# miss <sha40> → GRÜN | ROT | OFFEN | ABBRUCH (stdout); die Zahl der Station steht danach in $ZU/schritt.zahl
miss() {
    local x=$1 x8 mj rj d0 p ab=0 w t0 u z ende lauf=0 stand=0
    x8=${x:0:8}
    : >"$ZU/schritt.zahl"
    if [ -n "$RICHTER_SCHEIN_ROT_AB" ]; then # die Schein-Messung des Selbsttests: ROT ab einem genannten Commit, „nie“ = immer GRÜN
        if [ "$RICHTER_SCHEIN_ROT_AB" != nie ] && git -C "$R" merge-base --is-ancestor "$RICHTER_SCHEIN_ROT_AB" "$x"; then echo ROT; else echo GRÜN; fi
        echo "Schein" >"$ZU/schritt.zahl"
        return
    fi
    until frei; do sleep 20; done
    mj=$PM/meisterkarte-quelle/punkte/messung/$x8-$GERAET.json
    rj=$PM/meisterkarte-quelle/punkte/messung/roh/$x8-$GERAET
    # was vor dem Schritt im Mess-Baum lag, wird beiseite gelegt und danach zurückgelegt: der Schritt liest nur sein eigenes Urteil
    rm -rf "$ZU/vor"
    mkdir -p "$ZU/vor"
    [ -e "$mj" ] && cp -p "$mj" "$ZU/vor/m.json"
    [ -d "$rj" ] && cp -rp "$rj" "$ZU/vor/roh"
    rm -rf "$mj" "$rj"
    d0=$(verdr)
    t0=$(date +%s)
    (cd "$PM/meisterkarte-quelle/punkte" && exec node punkte.cjs run --sha "$x" --geraet "$GERAET" --nur "$STATION") >"$ZU/schritt.out" 2>&1 &
    p=$!
    # DIE FRIST zählt die Fahrt des Schritts, nie sein Warten vor dem Spiel-Baum: zwei Schleifen sehen die Karte im selben Takt frei
    # und starten beide, punkte.cjs reiht sie selbst („der Spiel-Baum … ist belegt (pid N), warte“). Am 10.11. 23:35 wartete der
    # Schritt so 1808 s hinter einer Station der Landung, die ihren Deckel riss — `timeout 1800` um den ganzen Lauf beendete ihn
    # ungemessen (OFFEN), ehe er eine Sekunde fuhr. Das Warten trägt eine eigene, weite Frist (RICHTER_WARTE_S).
    while kill -0 $p 2>/dev/null; do
        if [ $CI_ABBRUCH = 1 ] && ci; then ab=1; fi
        if tail -n 1 "$ZU/schritt.out" 2>/dev/null | grep -aq "ist belegt"; then stand=$((stand + 10)); else lauf=$((lauf + 10)); fi
        if [ $ab = 1 ] || [ $lauf -ge "${RICHTER_FRIST_S:-1800}" ] || [ $stand -ge "${RICHTER_WARTE_S:-7200}" ]; then
            w=$(cat /proc/$p/winpid 2>/dev/null)
            [ -n "$w" ] && taskkill //T //F //PID "$w" >/dev/null 2>&1
            kill $p 2>/dev/null
            break
        fi
        sleep 10
    done
    wait $p 2>/dev/null
    # DAS URTEIL steht in der EIGENEN Ausgabe des Schritts (die Zeile „  GRÜN|ROT|OFFEN <station> · <zahl>“ von punkte.cjs), nie in
    # der Mess-Datei des Baums: am 10.11. 23:19 legte ein fremder `checkout --force` im geteilten Mess-Baum die alte, verfolgte Datei
    # zurück, bevor der Schritt las — sein GRÜN (Winter 0,109 × Sommer) wurde als „OFFEN, Deckel gerissen“ vom 08.11. gelesen.
    u=OFFEN
    ende=$(date +%s)
    z=$(grep -a -F -e "  GRÜN $STATION · " -e "  ROT  $STATION · " -e "  ROT $STATION · " -e "  OFFEN $STATION · " "$ZU/schritt.out" | tail -n 1)
    # EINE VERDRÄNGUNG bricht den Schritt nur, wenn er OHNE Urteil endet: gpu-lauf.sh fährt den verdrängten Lauf nach dem CI-Job und
    # der CI-Ruhe ganz neu, sein Urteil ist das einer ganzen Fahrt. Bis 11.11. brach jede VERDRÄNGT-Zeile des Dienst-Logs den Schritt,
    # auch die eines fremden Laufs: 01:15 fuhr 87537d3f mit gemessenem ROT neu (79 min bis zum zweiten Urteil).
    [ "$(verdr)" != "$d0" ] && case "$z" in "  GRÜN "* | "  ROT "*) ;; *) ab=1 ;; esac
    if [ $ab = 0 ]; then
        case "$z" in "  GRÜN "*) u=GRÜN ;; "  ROT "*) u=ROT ;; esac
    fi
    echo "${z#*" · "}" | cut -c1-300 >"$ZU/schritt.zahl"
    [ -n "$z" ] || tail -n 1 "$ZU/schritt.out" | cut -c1-300 >"$ZU/schritt.zahl"
    # die Uhr des Schritts: Dauer, und wie lange der Lauf nach seiner letzten Zeile noch lebte (die Baum-Sperre hält er so lange)
    echo "$((ende - t0)) s (Fahrt $lauf s, vor dem belegten Spiel-Baum $stand s), davon $((ende - $(stat -c %Y "$ZU/schritt.out"))) s nach der letzten Zeile" >"$ZU/schritt.uhr"
    log "    Uhr $x8: $(cat "$ZU/schritt.uhr")"
    [ -e "$mj" ] && cp "$mj" "$ZU/schritte/${STATION//#/_}-$x8-$t0.json" 2>/dev/null
    cp "$ZU/schritt.out" "$ZU/schritte/${STATION//#/_}-$x8-$t0.out" 2>/dev/null
    rm -rf "$mj" "$rj"
    [ -e "$ZU/vor/m.json" ] && cp -p "$ZU/vor/m.json" "$mj"
    [ -d "$ZU/vor/roh" ] && cp -rp "$ZU/vor/roh" "$rj"
    if [ $ab = 1 ]; then echo ABBRUCH; else echo "$u"; fi
}
# mess_fest <sha40> → GRÜN | ROT | OFFEN: ein Abbruch (CI auf der Karte) fährt neu, ein OFFEN (ungemessen) genau einmal
mess_fest() {
    local w n=0
    w=$(miss "$1")
    while [ "$w" = ABBRUCH ]; do
        log "  $(kurz "$1") ABBRUCH (CI auf der Karte) — neu"
        sleep 30
        w=$(miss "$1")
    done
    if [ "$w" = OFFEN ]; then
        log "  $(kurz "$1") OFFEN ($(cat "$ZU/schritt.zahl" | cut -c1-160)) — ein zweiter Versuch"
        w=$(miss "$1")
        while [ "$w" = ABBRUCH ]; do
            sleep 30
            w=$(miss "$1")
        done
    fi
    echo "$w"
}
# messen <sha40> — setzt $w und zählt die Messung (mess_fest läuft in einer Unter-Shell, die nicht zählen kann)
messen() {
    w=$(mess_fest "$1")
    MESSUNGEN=$((MESSUNGEN + 1))
}
# zeile <text> [<zweig> <abschnitt-datei>] — die EINE Zeile nach zug/richter.txt (und der Abschnitt nach cloud-post/<zweig>.md)
zeile() {
    printf '%s\n' "$1" >"$ZU/zeile.txt"
    log "ZEILE $1"
    echo "$1"
    node "$WERK" post "$R" "$ZU/zeile.txt" ${2:+"$2" "$3"} >>"$L" 2>&1
}
# halbiere <station> <gut40> <schlecht40> <schlecht-gemessen 0|1> → 0 TÄTER · 2 kein Fall der Kette · 3 kein Fall · 4 unscharf
halbiere() {
    local P=$2 B=$3 bg=$4 w lo hi m schritte=0 T V subj zweig art zahl unscharf=""
    STATION=$1
    MESSUNGEN=0
    mapfile -t K < <(git -C "$R" rev-list --first-parent --reverse "$P..$B")
    [ ${#K[@]} -gt 0 ] || { log "$STATION: $(kurz "$P") ist kein Vorfahr von $(kurz "$B") auf der Erst-Eltern-Kette — kein Fall der Kette"; return 2; }
    log "START $STATION $GERAET · gut $(kurz "$P") · schlecht $(kurz "$B") · ${#K[@]} Commits auf der Erst-Eltern-Kette"
    messen "$P"
    log "  $(kurz "$P") (gebuchtes GRÜN, heute) → $w · $(cut -c1-160 "$ZU/schritt.zahl")"
    if [ "$w" != GRÜN ]; then
        zeile "KEIN FALL DER KETTE $STATION: am gebuchten GRÜN $(kurz "$P") misst die Station heute $w ($(cut -c1-140 "$ZU/schritt.zahl")) — Station oder Gerät, nicht der Zug (gut $(kurz "$P"), schlecht $(kurz "$B"), $GERAET)"
        return 2
    fi
    if [ "$bg" != 1 ]; then
        messen "$B"
        log "  $(kurz "$B") (genannt schlecht) → $w · $(cut -c1-160 "$ZU/schritt.zahl")"
        if [ "$w" != ROT ]; then
            zeile "KEIN FALL $STATION: am genannten schlechten Kopf $(kurz "$B") misst die Station $w ($(cut -c1-140 "$ZU/schritt.zahl")) — kein Täter (gut $(kurz "$P"), $GERAET)"
            return 3
        fi
    fi
    lo=-1
    hi=$((${#K[@]} - 1))
    while [ $((hi - lo)) -gt 1 ]; do
        m=$(((lo + hi) / 2))
        messen "${K[$m]}"
        schritte=$((schritte + 1))
        log "  Schritt $schritte $(kurz "${K[$m]}") → $w · $(git -C "$R" log -1 --format=%s "${K[$m]}" | cut -c1-70) · $(cut -c1-120 "$ZU/schritt.zahl")"
        case $w in
            GRÜN) lo=$m ;;
            ROT) hi=$m ;;
            *)
                unscharf="ungemessen an $(kurz "${K[$m]}") ($(cut -c1-120 "$ZU/schritt.zahl"))"
                break
                ;;
        esac
    done
    T=${K[$hi]}
    if [ $lo -ge 0 ]; then V=${K[$lo]}; else V=$P; fi
    if [ -z "$unscharf" ]; then
        # ZWEI BOOTE JE SEITE: der Täter und sein Vorgänger je ein zweites Mal
        messen "$T"
        zahl=$(cut -c1-200 "$ZU/schritt.zahl")
        log "  zweites Boot Täter $(kurz "$T") → $w · $zahl"
        [ "$w" = ROT ] || unscharf="die Station schwankt: der Täter-Kandidat $(kurz "$T") misst im zweiten Boot $w"
    fi
    if [ -z "$unscharf" ]; then
        messen "$V"
        log "  zweites Boot Vorgänger $(kurz "$V") → $w · $(cut -c1-160 "$ZU/schritt.zahl")"
        [ "$w" = GRÜN ] || unscharf="die Station schwankt: der Vorgänger $(kurz "$V") misst im zweiten Boot $w"
    fi
    if [ -n "$unscharf" ]; then
        zeile "UNSCHARF $STATION: zwischen $(kurz "$V") und $(kurz "$T") — $unscharf; kein Täter genannt (gut $(kurz "$P"), schlecht $(kurz "$B"), $schritte Schritte, $MESSUNGEN Messungen, $GERAET)"
        return 4
    fi
    subj=$(git -C "$R" log -1 --format=%s "$T")
    zweig=$(printf '%s\n' "$subj" | sed -n 's/^Merge \(.*\) in integ-probe.*$/\1/p' | sed "s/^branch '\(.*\)'$/\1/")
    if [ -n "$zweig" ]; then art="Merge $zweig"; else art=$(printf '%s' "$subj" | cut -c1-90); fi
    if [ -n "$zweig" ]; then
        {
            echo "## $(date '+%d.%m. %H:%M') — RICHTER $GERAET: TÄTER $STATION — der Merge dieses Zweigs ($(kurz "$T")) bricht die Station"
            echo "Gemessen per Halbierung der Erst-Eltern-Kette von main ($schritte Schritte, $MESSUNGEN Messungen, je zwei Boote am Täter und am Vorgänger):"
            echo "GRÜN am Vorgänger $(kurz "$V") · ROT am Merge $(kurz "$T"): $zahl"
            echo "Gebuchtes GRÜN $(kurz "$P") · ROT am Kopf $(kurz "$B") · Gerät $GERAET · Station nachfahren: node meisterkarte-quelle/punkte/punkte.cjs run --sha $(kurz "$T") --geraet $GERAET --nur '$STATION' (Zweig punkte-maschine)."
            echo "Auftrag: den Schnitt an der Wurzel im Diff dieses Zweigs — die Station muss am Kopf wieder GRÜN messen, die Gewinne des Zweigs bleiben."
        } >"$ZU/abschnitt.md"
        zeile "TÄTER $STATION: $(kurz "$T") $art (gut $(kurz "$P"), schlecht $(kurz "$B"), $schritte Schritte) · $GERAET · $MESSUNGEN Messungen, 2 Boote je Seite · GRÜN am Vorgänger $(kurz "$V") · ROT: $zahl" "$zweig" "$ZU/abschnitt.md"
    else
        zeile "TÄTER $STATION: $(kurz "$T") $art (gut $(kurz "$P"), schlecht $(kurz "$B"), $schritte Schritte) · $GERAET · kein Merge · $MESSUNGEN Messungen, 2 Boote je Seite · GRÜN am Vorgänger $(kurz "$V") · ROT: $zahl"
    fi
    return 0
}

git -C "$R" fetch -q origin main integ-probe 2>/dev/null
case "$1" in
    --fall)
        P=$(git -C "$R" rev-parse --verify -q "$3^{commit}") && B=$(git -C "$R" rev-parse --verify -q "$4^{commit}") || { echo "unbekannter Commit: $3 / $4"; exit 2; }
        halbiere "$2" "$P" "$B" 0
        exit $?
        ;;
    --selbsttest)
        fehl=0
        pr() { if [ "$2" = "$3" ]; then echo "  GRÜN $1"; else echo "  ROT  $1 — ist „$2“, soll „$3“"; fehl=$((fehl + 1)); fi; }
        node "$WERK" selbsttest || fehl=$((fehl + 1))
        # die Halbierung an Schein-Urteilen auf der ECHTEN Erst-Eltern-Kette 77265b04..87537d3f (48 Commits), nichts wird gepusht —
        # in einem EIGENEN Zustand (am 11.11. 00:42 schrieb ein Schein-Lauf in Log und Schritt-Dateien eines laufenden echten)
        ZU0=$ZU L0=$L
        ZU=$ZU0/schein
        L=$ZU/richter.log
        mkdir -p "$ZU/schritte"
        export TROCKEN=1
        G0=$(git -C "$R" rev-parse --verify -q 77265b04^{commit}) && B0=$(git -C "$R" rev-parse --verify -q 87537d3f^{commit}) || { echo "  ROT  die Kette 77265b04..87537d3f fehlt im Klon $R"; exit 1; }
        mapfile -t KK < <(git -C "$R" rev-list --first-parent --reverse "$G0..$B0")
        for i in 0 17 $((${#KK[@]} - 1)); do
            t=${KK[$i]}
            a=$(RICHTER_SCHEIN_ROT_AB=$t halbiere schein.K1#1 "$G0" "$B0" 0 | tail -n 1)
            pr "Schein-Täter an Stelle $i der Kette (${t:0:8}) wird beim Namen genannt" "$(printf '%s' "$a" | grep -o "^TÄTER schein.K1#1: ${t:0:8} ")" "TÄTER schein.K1#1: ${t:0:8} "
        done
        m=$(git -C "$R" log --first-parent --format='%H %s' "$G0..$B0" | grep -m1 " Merge .* in integ-probe" | cut -d' ' -f1)
        a=$(RICHTER_SCHEIN_ROT_AB=$m halbiere schein.K1#1 "$G0" "$B0" 0 | tail -n 1)
        z=$(git -C "$R" log -1 --format=%s "$m" | sed -n 's/^Merge \(.*\) in integ-probe.*$/\1/p')
        pr "ein Merge als Täter nennt seinen Zweig ($z)" "$(printf '%s' "$a" | grep -c "^TÄTER schein.K1#1: ${m:0:8} Merge $z (gut 77265b04, schlecht 87537d3f, ")" "1"
        a=$(RICHTER_SCHEIN_ROT_AB=nie halbiere schein.K1#1 "$G0" "$B0" 0 | tail -n 1)
        pr "MUTANTE kein Fall (der schlechte Kopf misst GRÜN): kein Täter" "$(printf '%s' "$a" | grep -c "^KEIN FALL schein.K1#1")$(printf '%s' "$a" | grep -c "TÄTER")" "10"
        a=$(RICHTER_SCHEIN_ROT_AB=$(git -C "$R" rev-parse "$G0^") halbiere schein.K1#1 "$G0" "$B0" 0 | tail -n 1)
        pr "MUTANTE das gebuchte GRÜN misst heute ROT: kein Fall der Kette, kein Täter" "$(printf '%s' "$a" | grep -c "^KEIN FALL DER KETTE schein.K1#1")$(printf '%s' "$a" | grep -c "TÄTER")" "10"
        ZU=$ZU0 L=$L0
        if [ "$2" = echt ]; then
            # der bekannte Fall auf der Karte (OMEN-Messung 10.11.: Rückfall zwischen 77265b04 und 87537d3f) — die Zeile wird gepusht
            unset TROCKEN
            a=$(halbiere "vegetation.K5#2" "$G0" "$B0" 0 | tail -n 1)
            pr "ECHT vegetation.K5#2 $GERAET: der Täter-Merge steht beim Namen" "$(printf '%s' "$a" | grep -c "^TÄTER vegetation.K5#2: [0-9a-f]\{8\} Merge ")" "1"
            echo "  $a"
            t=$(printf '%s' "$a" | sed -n 's/^TÄTER vegetation.K5#2: \([0-9a-f]\{8\}\) .*/\1/p')
            if [ -n "$t" ]; then
                export TROCKEN=1 # die Mutante auf der Karte: dieselbe Station, schlecht = der Vorgänger des Täters (GRÜN) — kein Täter
                a=$(halbiere "vegetation.K5#2" "$G0" "$(git -C "$R" rev-parse "$t^")" 0 | tail -n 1)
                pr "ECHT MUTANTE vegetation.K5#2 bis zum Vorgänger des Täters: kein Täter" "$(printf '%s' "$a" | grep -c "^KEIN FALL vegetation.K5#2")$(printf '%s' "$a" | grep -c "TÄTER")" "10"
                echo "  $a"
            fi
        fi
        [ $fehl = 0 ] && echo "richter Selbsttest GRÜN" || echo "richter Selbsttest ROT ($fehl)"
        exit $fehl
        ;;
esac
# die Fälle am Kopf (jüngster main-Kopf oder --kopf)
if [ "$1" = "--kopf" ]; then KOPF=$(git -C "$R" rev-parse --verify -q "$2^{commit}"); else KOPF=$(git -C "$R" rev-parse origin/main); fi
[ -n "$KOPF" ] || { echo "kein Kopf"; exit 2; }
node "$WERK" faelle "$R" "$GERAET" "$KOPF" >"$ZU/faelle.txt" 2>"$ZU/faelle.err" || { log "faelle scheitert: $(tail -n 1 "$ZU/faelle.err")"; exit 1; }
log "Kopf $(kurz "$KOPF") $GERAET: $(tail -n 1 "$ZU/faelle.err")"
n=0
while IFS=$'\t' read -r st gut schlecht zahl <&3; do
    [ -n "$st" ] || continue
    n=$((n + 1))
    [ $n -le "${RICHTER_MAX:-3}" ] || { log "$st: wartet auf den nächsten Aufruf (mehr als ${RICHTER_MAX:-3} Fälle)"; continue; }
    log "FALL $st $GERAET: gebucht GRÜN an $(kurz "$gut"), ROT an $(kurz "$schlecht") (Kopf $(kurz "$KOPF")): $zahl"
    halbiere "$st" "$gut" "$schlecht" 1
done 3<"$ZU/faelle.txt"
echo "richter $GERAET $(kurz "$KOPF"): $n Fälle"
