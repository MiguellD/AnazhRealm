#!/bin/bash
# unter sh.exe neu (Grund und Zahlen: zug-dienst.sh „UNTER sh.exe", 13.11.) — als sh gerufen schaltet die Zeile nur POSIX ab
case "$BASH" in */sh | */sh.exe) set +o posix ;; *) [ -x /usr/bin/sh ] && exec /usr/bin/sh "$0" "$@" ;; esac
# radeon-dienst.sh — die Radeon misst, ohne LLM und ohne Ende („Radeon nie leer“ 22.10.; Nachfolger von radeon-nie-leer2.sh):
# sobald die Karte 2 min frei ist (bis 11.11. 5: seit ein Abbruch behält, was er maß, kostet ein früher Start nichts — das Fenster zwischen zwei Zügen ist 15–20 min) (kein GPU-Schloss, keine laufende Messung, kein CI-Job, kein Warter am Schloss), misst sie am jüngsten main die offenen
# Stationen (`punkte.cjs run --offen`) und pusht die Mess-Dateien nach punkte-maschine; buche-dienst.sh bucht daraus.
# CI VOR MESSUNG (10.11.: 17:08–17:40 maß sie neben CI-Jobs, ihre ROTs flossen als „echter Fall“ in die Buchung): startet während
# einer Messung ein Runner.Worker-Job, bricht sie ab (taskkill über den Baum) und behält, was vor dem Job endete.
# DIE EINE REGEL DER FORTSETZUNG (12.11., FUND w28-bestand-kennung-pm: an c4010773 endete die Fortsetzung der 61 offenen Proben nach 9
# am CI-Abbruch, 52 standen „die Fahrt riss — offen“, der Lauf an b1531071 starb mit dem Dienst um 01:50 und seine Datei lag ungepusht
# im Baum, den der nächste Start verworfen hätte): eine Fahrt, die endet, ohne dass die Punkte-Maschine selbst „jede Station frisch
# gemessen“ sagt, ist OFFEN — gleich, ob ein CI-Job, ein Warter, ein Absturz ohne Zeile oder der Tod des Dienstes sie beendete. Was bis
# zum Ende allein lief, bleibt (`punkte.cjs behalte`), der Rest misst `--offen` in der nächsten freien Lücke am selben Kopf weiter; auf
# einen neuen main-Kopf wartet der Dienst NUR, wenn `run --offen` am Kopf „jede Station … frisch gemessen“ druckt (nichts_offen).
# WARTER HABEN VORFAHRT WIE DIE CI (12.11.: eine Mess-Sitzung hielt die Karte 81 min, ein Macher wartete mit gpu-lauf.sh davor): wartet
# ein Lauf am Schloss (schloss-puls.cjs: gpu-lauf.sh vor dem Schloss, Vorrang, Start-Hook), beginnt der Dienst keine Fahrt und gibt eine
# laufende an der nächsten Stations-Grenze frei (spätestens nach WEICH_MAX_S) — behalten wie beim CI-Abbruch, dann Fortsetzung.
# Beweis ohne Karte: `bash radeon-dienst.sh --selbsttest` (Sandkasten mit gestelltem Kopf, Stummel-punkte.cjs, CI, Warter, Mutanten).
# Log: /tmp/claude/w4/radeon-nie-leer.log (der Blick liest es).
D=$(cd "$(dirname "$0")" && pwd)
. "$D/gemein.sh"
PM=$T/w3/pm
L=$W/radeon-nie-leer.log
GS="${TEMP:-/tmp}/claude/gpu-schloss"
A="-c user.name=MiguellD -c user.email=87209049+MiguellD@users.noreply.github.com"
WACHE=$S/radeon.wache # Zeile 1 = der Kopf des laufenden Mess-Laufs; die mtime = wann die Wache zuletzt sah: allein (kein CI-Job, kein Warter)
TAKT_S=15             # der Takt der Wache während einer Messung
BIS_SPIEL_S=30        # behalten bis zur letzten Wache − so viel (der Takt 15 s + 15 s Spiel)
WEICH_MAX_S=600       # so lange wartet ein Warter höchstens auf die nächste Stations-Grenze (die längste Probe der Tafel: 282 s; unter
                      # Fremd-Last streckt sie sich — 12.11. endete in 10 min keine; der Start-Hook des Läufers wartet 25 min am Schloss)
HOOK_LOG=/c/actions-runner/hooks/hook.log
HAND_ZEIT_S=300       # so lange gehört die Karte nach einer Fahrt höchstens den Händen, bevor die nächste Fahrt sich ans Schloss stellt
HAND_NACH_S=600       # so lange misst eine Fahrt allein, bevor sie einer wartenden HAND (gpu-lauf eines Machers) an der Grenze weicht —
                      # 12.11. 11:08 · 11:22 · 11:45 nahm „nacht" die Karte nach jeder einzelnen Station; ein CI-Job wartet nie so lange
kopf() { git -C $R ls-remote origin refs/heads/main | cut -f1; }
ci() { tasklist -FI "IMAGENAME eq Runner.Worker.exe" 2>/dev/null | grep -qi Runner.Worker; }
# ci_wartet — der CI-Job steht noch im Start-Hook AM SCHLOSS (letzte Zeile des Hook-Logs „wartet auf Schloss“): er hat die Karte nicht,
# die laufende Station misst allein. Lehre 12.11. (08:50–11:23: neun Fahrten, sieben vom ersten Runner.Worker abgebrochen, 17 Stationen
# in 2,5 h, gebucht ±0): der Job ist dann ein WARTER wie jede Hand — die Karte geht an der nächsten Stations-Grenze frei, nichts fällt weg.
ci_wartet() { tail -1 "$HOOK_LOG" 2>/dev/null | grep -q "wartet auf Schloss"; }
# warter — die Namen der Läufe, die am Schloss warten (leer: keiner). Die eigenen Läufe der Punkte-Maschine (punkte-radeon-*) zählen nie:
# sie reihen sich an deren Baum-Sperre, und die Fortsetzung nimmt das Schloss in einer neuen Sitzung wieder
warter() {
    node "$D/schloss-puls.cjs" --geraet radeon --einmal 2>/dev/null | grep -A8 '"wartende"' | tail -n +2 | grep -oE '^ +"[^"]+"' | tr -d ' "' | grep -v '^punkte-radeon' | tr '\n' ' ' | sed 's/ $//'
}
# DER ORDNER ist das Schloss (atomar mkdir, gpu-schloss.sh) — nie nur besitzer.txt lesen
lauf_da() { ps -ef | grep -q "[p]unkte.cjs run"; }
frei() { [ ! -d "$GS" ] && ! lauf_da && ! ci && [ -z "$(warter)" ]; }
# verwaist: der Halter (pid= in besitzer.txt) lebt nicht mehr, oder der Ordner steht seit > 2 min ohne Halter (10.11. 21:54: der
# Konto-Wechsel beendete die Messung, ihr Schloss hing 35 min an pid 30944 — CI und Messung hätten daran gewartet)
verwaist() {
    local p
    [ -d "$GS" ] || return 1
    # DAS SCHLOSS EINES LAUFENDEN CI-JOBS IST NIE VERWAIST (12.11.: der Start-Hook des Läufers schreibt „ci-runner <lauf>/<versuch> <job>“
    # OHNE pid — die 2-min-Regel unten löschte es dem laufenden Job weg, 40× im Log seit dem 10.11.; 00:32 fiel daran die Probe
    # 43120264912 von w28-stadt-grammatik mit „das GPU-Schloss hält ‚niemand‘, nicht dieser Job“). Solange ein Runner.Worker lebt,
    # gehört ein ci-runner-Schloss ihm; verwaist ist es erst, wenn kein Job mehr läuft.
    case "$(head -1 "$GS/besitzer.txt" 2>/dev/null)" in ci-runner*) ci && return 1 ;; esac
    # die pid nur über schloss_pid (gemein.sh) — mit pid urteilt allein ihr Leben, die 2-min-Regel gilt nur dem Ordner OHNE Halter
    p=$(schloss_pid "$GS/besitzer.txt")
    if [ -z "$p" ]; then [ $(($(date +%s) - $(stat -c %Y "$GS"))) -gt 120 ]; else ! tasklist -FI "PID eq $p" -NH 2>/dev/null | grep -qw "$p"; fi
}
# vor_mir_da — steht noch einer der Warter, denen die letzte Fahrt wich? (Name in VOR_MIR; leer: keiner)
vor_mir_da() {
    local w n
    VOR_MIR=
    [ -n "$WEICH_VOR" ] || return 1
    w=" $(warter) "
    for n in $WEICH_VOR; do case "$w" in *" $n "*) VOR_MIR="$VOR_MIR $n" ;; esac; done
    VOR_MIR=${VOR_MIR# }
    [ -n "$VOR_MIR" ]
}
richter() { RICHTER_MAX=2 sh "$D/richter.sh" radeon --kopf "$1" >>"$S/richter.out" 2>&1; }
log() { echo "$(date +%H:%M) $*" >>"$L"; }
iso() { date -u -d "$1" +%Y-%m-%dT%H:%M:%S.%3NZ; }
stationen() { local c; c=$(grep -cE "^  (GRÜN|ROT|OFFEN)" "$W/radeon-nie-leer-lauf.out" 2>/dev/null); echo "${c:-0}"; }
# das Urteil der Punkte-Maschine selbst (run, `meine` leer nach --offen) — die EINE Quelle für „nichts offen“, nie die Zahl der Zeilen
nichts_offen() { grep -q "ist jede Station auf radeon frisch gemessen" "$W/radeon-nie-leer-lauf.out" 2>/dev/null; }
pushe() {
    local j
    for j in 1 2 3 4 5; do
        git fetch -q origin "+refs/heads/punkte-maschine:refs/remotes/origin/punkte-maschine"
        git rebase -q origin/punkte-maschine && git push -q origin HEAD:punkte-maschine && return 0
        git rebase --abort >/dev/null 2>&1
        sleep 20
    done
    return 1
}
# behalten <kopf> <bis ISO> <was> — punkte.cjs behalte kappt jeden Eintrag, dessen Lauf nach <bis> endete, hält den Rest und pusht ihn;
# ohne Behaltenes steht die Datei wie im Archiv (Exit 1). Im Baum $PM.
behalten() {
    (cd "$PM/meisterkarte-quelle/punkte" && node punkte.cjs behalte --sha "$1" --geraet radeon --bis "$2" >"$W/radeon-behalte.out" 2>&1)
    if [ $? = 0 ]; then
        [ -d vision/richter ] && git add -A vision/richter # die Richter-Akten der Meisterkarte 2 (punkte.cjs richterAkten) reisen mit der Messung
        git add -A meisterkarte-quelle/punkte/messung && git $A commit -qm "Messung ${1:0:8} radeon: $3 ($(head -1 "$W/radeon-behalte.out" | cut -c1-80), radeon-dienst)" >/dev/null 2>&1
        pushe
        return 0
    fi
    git checkout -q -- meisterkarte-quelle/punkte/messung 2>/dev/null
    git clean -fdq meisterkarte-quelle/punkte/messung 2>/dev/null
    return 1
}
# DER REST EINES BEENDETEN LAUFS (12.11.: der Lauf an b1531071 starb 01:50 mit dem Dienst, seine Datei lag ungepusht im Baum): trägt
# die Wache seinen Kopf, bleibt, was bis zu ihrem letzten Blick − BIS_SPIEL_S endete; ohne Wache ist der Rest ohne Zeugen und fällt
rest_behalten() {
    local rk b
    [ -s "$WACHE" ] && [ -n "$(git status --porcelain -- meisterkarte-quelle/punkte/messung)" ] && {
        rk=$(head -1 "$WACHE")
        b=$(($(date -r "$WACHE" +%s%3N) - BIS_SPIEL_S * 1000))
        behalten "$rk" "$(iso "@$((b / 1000)).$(printf %03d $((b % 1000)))")" "Rest des beendeten Laufs bis zur letzten Wache" &&
            log "REST ${rk:0:8} des beendeten Laufs: $(head -1 "$W/radeon-behalte.out" | cut -c1-200)"
    }
    rm -f "$WACHE"
}
miss() { # $1 = Name im Log, Rest = Argumente für punkte.cjs · MK = der gemessene Kopf · 0 gemessen · 2 abgebrochen · 3 nichts offen · 4 ohne Urteil
    local name=$1 K p ab n g bis weich c0 wt plan
    shift
    WEICH_VOR= # die Warter, denen diese Fahrt weicht (vor_mir_da)
    K=$(kopf)
    [ -n "$K" ] || return 1
    MK=$K
    cd "$PM" || return 1
    rest_behalten
    # was sonst im Baum liegt, stammt von einem Lauf ohne Zeugen: eine halbe Messung ist keine — verwerfen
    git checkout -q -- meisterkarte-quelle/punkte/messung 2>/dev/null
    git clean -fdq meisterkarte-quelle/punkte/messung 2>/dev/null
    git fetch -q origin "+refs/heads/punkte-maschine:refs/remotes/origin/punkte-maschine"
    git rebase -q origin/punkte-maschine >/dev/null 2>&1 || git rebase --abort >/dev/null 2>&1
    log "$name am ${K:0:8}"
    puls radeon "misst $name am ${K:0:8}"
    cd "$PM/meisterkarte-quelle/punkte" && { timeout 9000 node punkte.cjs run --sha "$K" --geraet radeon "$@" >"$W/radeon-nie-leer-lauf.out" 2>&1 & }
    p=$!
    ab=
    weich=0
    t_fahrt=$(date +%s)
    while kill -0 $p 2>/dev/null; do
        if ci && ! ci_wartet; then
            ab="CI-Job auf der Karte"
            bis=$(iso "$BIS_SPIEL_S seconds ago")
            break
        fi
        if [ $weich = 0 ]; then
            wt=$(warter)
            case "$wt" in *CI-Job*) ;; *) [ $(($(date +%s) - t_fahrt)) -lt $HAND_NACH_S ] && wt= ;; esac
            if [ -n "$wt" ]; then
                weich=$(date +%s)
                WEICH_VOR=$wt
                c0=$(stationen)
                log "$name WEICHT: am Schloss wartet $wt — die Karte geht an der nächsten Stations-Grenze frei"
            fi
        elif [ "$(stationen)" -gt "$c0" ]; then
            ab="$wt wartete am Schloss" # eine Station endete eben, die nächste hat kein Urteil: alles in der Datei lief allein
            bis=$(iso "1 second")
            break
        elif [ $(($(date +%s) - weich)) -ge $WEICH_MAX_S ]; then
            ab="$wt wartete am Schloss (keine Stations-Grenze in $WEICH_MAX_S s)"
            bis=$(iso "$BIS_SPIEL_S seconds ago")
            break
        fi
        echo "$K" >"$WACHE" # die Wache bezeugt: bis hierher lief der Lauf allein
        if [ $weich = 0 ]; then sleep $TAKT_S; else sleep 2; fi
    done
    if [ -n "$ab" ]; then
        w=$(cat /proc/$p/winpid 2>/dev/null)
        [ -n "$w" ] && taskkill //T //F //PID "$w" >/dev/null 2>&1
        kill $p 2>/dev/null
    fi
    wait $p 2>/dev/null
    cd "$PM" || return 1
    rm -f "$WACHE"
    if [ -n "$ab" ]; then
        verwaist && rm -rf "$GS" # das Schloss des eigenen, beendeten Laufs — die Karte gehört jetzt dem Job oder dem Warter
        # WAS VOR DEM ENDE GEMESSEN WAR, BLEIBT (11.11.: die Züge lassen der Karte Fenster von 15–20 min, die volle Fahrt braucht mehr —
        # 06:55 · 12:07 · 12:41 fiel jedes Mal die GANZE Datei, 12:41 mit 14 fertigen Stationen; die Radeon buchte den Tag über nichts);
        # `--offen` misst beim nächsten Fenster nur, was fehlt
        if behalten "$K" "$bis" "$name bis zur Freigabe: $ab"; then
            log "$name ABGEBROCHEN: $ab — $(head -1 "$W/radeon-behalte.out" | cut -c1-200)"
        else
            log "$name ABGEBROCHEN: $ab — nichts davor gemessen ($(head -1 "$W/radeon-behalte.out" | cut -c1-120))"
        fi
        return 2
    fi
    n=$(stationen)
    g=$(grep -cE "^  GRÜN" "$W/radeon-nie-leer-lauf.out")
    plan=$(grep -m1 -oE "^Punkte-Maschine: [0-9]+ Station" "$W/radeon-nie-leer-lauf.out" | grep -oE "[0-9]+")
    log "$name gemessen ${K:0:8}: $n Stationen (offen ${plan:-?}), $g GRÜN · $(grep -E "^  (GRÜN|ROT)" "$W/radeon-nie-leer-lauf.out" | cut -c1-60 | tr '\n' ' ' | cut -c1-300)"
    [ -d vision/richter ] && git add -A vision/richter # die Richter-Akten der Meisterkarte 2 (punkte.cjs richterAkten) reisen mit der Messung
    git add -A meisterkarte-quelle/punkte/messung && git $A commit -qm "Messung ${K:0:8} radeon: $name (radeon-dienst, $g GRÜN von $n, ohne CI daneben)" >/dev/null 2>&1
    pushe && log "Messung gepusht"
    [ "$n" != 0 ] && return 0
    nichts_offen && return 3
    log "$name ${K:0:8} OHNE URTEIL: 0 Stationen, die Punkte-Maschine sagte nie ‚frisch gemessen‘ ($(grep -v '^\s*$' "$W/radeon-nie-leer-lauf.out" | tail -1 | cut -c1-160)) — offen bleibt offen, die Fortsetzung misst in der nächsten Lücke"
    return 4
}
# takt — EIN Blick der Schleife (je 60 s): verwaiste Schlösser lösen, auf einen neuen Kopf nur warten, wenn am alten nichts offen ist
takt() {
    local rc
    if verwaist; then
        log "verwaistes GPU-Schloss gelöst ($(head -1 "$GS/besitzer.txt" 2>/dev/null | tr -d "") · pid=$(schloss_pid "$GS/besitzer.txt"), Halter tot)"
        rm -rf "$GS"
    fi
    if [ -n "$NEU_AB" ]; then
        [ "$(kopf)" = "$NEU_AB" ] && { puls radeon "nichts offen am ${NEU_AB:0:8} — wartet auf einen neuen main-Kopf"; return 0; }
        NEU_AB=
    fi
    if frei; then f=$((f + 1)); else
        f=0
        puls radeon "wartet: Karte belegt ($(head -1 "$GS/besitzer.txt" 2>/dev/null || echo CI/Messung/Warter))"
    fi
    # DIE HAND VERHUNGERT DIE MESSUNG NICHT (12.11. 11:54–12:11: zwei Macher wechselten sich am Schloss ab, die Karte war nie zwei
    # Takte frei, keine Fahrt begann): hält oder erwartet nur eine HAND die Karte (kein CI-Job, kein eigener Lauf) und liegt die
    # letzte Fahrt HAND_ZEIT_S zurück, beginnt die Fahrt trotzdem — sie stellt sich mit Vorrang ans Schloss (gpu-lauf.sh vorrang_fremd)
    # DIE REIHE DER ANKUNFT (14.11. 04:04–05:02: die Fahrt wich dreimal, trat je nach 5 min wieder mit Vorrang ein, koordinator-auge
    # stand 45 min und fiel mit Exit 75): wieder ein tritt sie erst, wenn KEINER der Warter mehr steht, denen sie zuletzt wich — ihr
    # Vorrang gilt nur gegen Läufe, die NACH ihrem Weichen kamen. Die Vorfahrt der CI bleibt unberührt.
    if [ $f -lt 2 ] && ! lauf_da && ! ci && [ $(($(date +%s) - ${T_FAHRT_ENDE:-0})) -ge $HAND_ZEIT_S ] && vor_mir_da; then
        puls radeon "wartet: vor dem Weichen standen schon $VOR_MIR — die Reihe der Ankunft"
    elif [ $f -lt 2 ] && ! lauf_da && ! ci && [ $(($(date +%s) - ${T_FAHRT_ENDE:-0})) -ge $HAND_ZEIT_S ]; then
        log "die Karte hält nur eine Hand ($(head -1 "$GS/besitzer.txt" 2>/dev/null | cut -c1-40)) — die Fahrt stellt sich mit Vorrang ans Schloss"
        f=2
    fi
    if [ $f -ge 2 ]; then
        miss "offene Stationen" --offen
        rc=$?
        T_FAHRT_ENDE=$(date +%s)
        # DER RICHTER NACH DER LANDUNG (richter.sh der OMEN, B2 Stufe 1): jede Station GRÜN → ROT gegen den gebuchten Stand wird
        # halbiert und nennt ihren Täter in koordination zug/richter.txt — ohne LLM, mit CI-Vorfahrt wie die Messung
        if [ $rc = 0 ]; then
            puls radeon "Richter am ${MK:0:8}"
            richter "$MK"
            log "Richter ${MK:0:8}: $(grep -E "TÄTER|KEIN FALL|UNSCHARF|Fälle|FALL" "$S/richter.out" | tail -1 | cut -c1-220)"
        fi
        [ $rc = 3 ] && NEU_AB=$MK
        f=0
    elif [ $f -gt 0 ]; then puls radeon "Karte frei seit $f min — misst ab 2"; fi
}

# ── DER SELBSTTEST (ohne Karte): ein Sandkasten mit eigenem Spiel-origin (main) und punkte-maschine-origin, ein Stummel-punkte.cjs
# (run --offen misst je 0,1 s eine Station aus alle.txt, behalte kappt nach Endzeit), CI und Warter als Marken-Dateien. Die Fälle:
# a  der Fall 23:28: 61 offen, CI-Job nach 9 → behalten 9, die Fortsetzung am selben Kopf misst 52, erst dann wartet er auf einen Kopf
# a2 ein Lauf stirbt ohne Zeile → nicht „nichts offen“, die nächste Lücke misst
# a3 der Dienst stirbt mitten im Lauf → der Rest bis zur Wache bleibt, die Fortsetzung misst nur, was fehlt
# b  ein Warter erscheint nach 5 Stationen → der Dienst gibt an der nächsten Grenze frei, beginnt nichts, solange er wartet, setzt fort
# c  ein lebender gpu-lauf-Halter (pid in Zeile 1) seit 300 s bleibt, ein toter Halter (pid in Zeile 2) fällt
# Mutanten: fortsetzung (das alte „0 Zeilen = nichts offen“) · rest (kein Rest-Behalten) · warter (blind für Warter) · pid (die alte
# pid-Quelle „^pid=“: der lebende Halter gilt nach 2 min als tot) · reihe (nach HAND_ZEIT_S tritt die Fahrt vor die Hand von
# vorhin) — jede ROT. d: nach dem Weichen kein Eintritt, solange die Hand von vorhin steht; eine spätere hält ihn nicht auf.
st_lauf() { # $1 = Mutante (leer = echt); druckt je Fall „OK <fall> …“ oder „ROT <fall> …“
    local X K j a1 a2 b1 b2 vor mp
    X=$(mktemp -d)
    R=$X/spiel PM=$X/pm W=$X/w S=$X/s GS=$X/schloss STUB=$X/stub
    L=$W/log WACHE=$S/radeon.wache TAKT_S=0.1 BIS_SPIEL_S=0 WEICH_MAX_S=20 HAND_NACH_S=0 HAND_ZEIT_S=9999999999
    export STUB
    mkdir -p "$W" "$S" "$STUB" "$PM/meisterkarte-quelle/punkte/messung"
    # c — der lebende Halter (14.11. 00:47: baum-ganz verlor das Schloss 2 min nach dem Nehmen): ein gpu-lauf-Schloss (pid in
    # Zeile 1, Halter = diese Shell, lebt) seit 300 s bleibt; ein Schloss der Punkte-Sitzung (pid in Zeile 2) mit totem Halter fällt.
    # Die Mutante „pid“ prüft nur diesen Fall und endet danach (ein fünfter voller Sandkasten streckte a3/b unter Last)
    [ "$1" = pid ] && schloss_pid() { grep -m1 "^pid=" "$1" 2>/dev/null | tr -dc 0-9; } # die alte Quelle bis 14.11.: nur Zeile „pid=…“
    mkdir -p "$GS"
    printf 'baum-ganz %s pid=%s\n' "$(date -Iseconds)" "$(cat /proc/$$/winpid)" >"$GS/besitzer.txt"
    touch -d "-300 seconds" "$GS"
    a1=$(verwaist && echo VERWAIST || echo gehalten)
    rm -rf "$GS"
    mkdir -p "$GS"
    printf 'punkte-radeon-sitzung\npid=%s\n' "$(/usr/bin/sh -c 'cat /proc/$$/winpid')" >"$GS/besitzer.txt"
    a2=$(verwaist && echo VERWAIST || echo gehalten)
    rm -rf "$GS"
    if [ "$a1" = gehalten ] && [ "$a2" = VERWAIST ]; then echo "OK c  lebender gpu-lauf-Halter nach 300 s gehalten · toter Halter der Punkte-Sitzung gelöst"
    else echo "ROT c  lebender Halter baum-ganz (pid in Zeile 1, 300 s): $a1 (Soll gehalten) · toter Halter (pid in Zeile 2): $a2 (Soll VERWAIST)"; fi
    [ "$1" = pid ] && { command rm -rf "$X"; return; }
    git init -q --bare "$X/spiel.git" && git init -q -b main "$R" && git -C "$R" remote add origin "$X/spiel.git"
    git init -q --bare "$X/pm.git" && git init -q -b punkte-maschine "$PM" && git -C "$PM" remote add origin "$X/pm.git"
    git -C "$R" config core.autocrlf false && git -C "$PM" config core.autocrlf false
    cat >"$PM/meisterkarte-quelle/punkte/punkte.cjs" <<'STUMMEL'
const fs = require("fs"), path = require("path"), cp = require("child_process");
const S = process.env.STUB, a = process.argv.slice(2), arg = (n) => a[a.indexOf(n) + 1];
const k8 = arg("--sha").slice(0, 8), rel = "meisterkarte-quelle/punkte/messung/" + k8 + "-radeon.json", d = path.join(__dirname, "messung", k8 + "-radeon.json");
const lies = () => (fs.existsSync(d) ? JSON.parse(fs.readFileSync(d, "utf8")) : { je: {} });
const schreib = (m) => fs.writeFileSync(d, JSON.stringify(m, null, 1) + "\n");
const marke = (n) => (fs.existsSync(path.join(S, n)) ? fs.readFileSync(path.join(S, n), "utf8").trim() : null);
const schlaf = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
    if (a[0] === "behalte") {
        const bis = Date.parse(arg("--bis")), m = lies();
        const z = cp.spawnSync("git", ["show", "HEAD:" + rel], { cwd: __dirname, encoding: "utf8" });
        const alt = z.status === 0 ? JSON.parse(z.stdout).je : {};
        const behalten = [], verworfen = [];
        for (const id of Object.keys(m.je)) if (!alt[id]) (m.je[id].ende <= bis ? behalten : verworfen).push(id);
        for (const id of verworfen) delete m.je[id];
        if (behalten.length) schreib(m);
        else if (z.status === 0) fs.writeFileSync(d, z.stdout);
        else fs.rmSync(d, { force: true });
        console.log("BEHALTEN " + behalten.length + " Station(en), 0 GRÜN (endeten vor " + new Date(bis).toISOString() + ")" + (verworfen.length ? " · verworfen " + verworfen.length : ""));
        process.exitCode = behalten.length ? 0 : 3;
        return;
    }
    if (marke("absturz") !== null) { fs.rmSync(path.join(S, "absturz")); process.exitCode = 1; return; }
    const alle = fs.readFileSync(path.join(S, "alle.txt"), "utf8").split("\n").map((x) => x.trim()).filter(Boolean);
    const m = lies(), offen = alle.filter((id) => !m.je[id]);
    if (!offen.length) return console.log("Punkte-Maschine: am " + k8 + " ist jede Station auf radeon frisch gemessen");
    fs.writeFileSync(path.join(S, "pid"), String(process.pid));
    console.log("Punkte-Maschine: " + offen.length + " Station(en) in " + offen.length + " Läufen auf radeon am " + k8 + " (Stummel)");
    let n = 0, ms = Number(marke("ms") || 100);
    for (const id of offen) {
        await schlaf(ms);
        m.je[id] = { ende: Date.now() };
        schreib(m);
        console.log("  GRÜN " + id + " · Stummel · Exit 0 · 0 min");
        n++;
        if (marke("ci_nach") === String(n)) { fs.rmSync(path.join(S, "ci_nach")); fs.writeFileSync(path.join(S, "ci"), "x"); await schlaf(4000); }
        // nach dem Warter je Station 1,5 s: die Wache des Dienstes braucht unter Last bis ~1 s je Blick, die Grenze bleibt eindeutig
        if (marke("warter_nach") === String(n)) { fs.rmSync(path.join(S, "warter_nach")); fs.writeFileSync(path.join(S, "warter"), "macher-hand"); ms = 1500; }
    }
})();
STUMMEL
    touch "$PM/meisterkarte-quelle/punkte/messung/.leer"
    git -C "$PM" add -A && git -C "$PM" $A commit -qm stummel && git -C "$PM" push -q origin punkte-maschine
    ci() { [ -f "$STUB/ci" ]; }
    ci_wartet() { [ -f "$STUB/ci_wartet" ]; }
    warter() { cat "$STUB/warter" 2>/dev/null; }
    lauf_da() { [ -f "$STUB/pid" ] && tasklist //FI "PID eq $(cat "$STUB/pid")" //NH 2>/dev/null | grep -qi node; } # nur der Stummel DIESES Sandkastens
    richter() { echo "Richter $1: KEIN FALL (Stummel)" >>"$S/richter.out"; }
    sleep() { command sleep 0.1; }
    case "$1" in
    fortsetzung) nichts_offen() { [ "$(stationen)" = 0 ]; } ;;
    rest) rest_behalten() { rm -f "$WACHE"; } ;;
    warter) warter() { :; } ;;
    reihe) vor_mir_da() { return 1; } ;; # die alte Regel: nach HAND_ZEIT_S tritt die Fahrt wieder ein, gleich wer schon wartet
    esac
    neu() { git -C "$R" $A commit -q --allow-empty -m "$1" && git -C "$R" push -q origin main && K=$(kopf); }
    gem() { git -C "$X/pm.git" show "punkte-maschine:meisterkarte-quelle/punkte/messung/${1:0:8}-radeon.json" 2>/dev/null | grep -c '"ende"'; }
    starts() { grep -c "offene Stationen am ${1:0:8}" "$L"; }
    f=0 NEU_AB=
    # d — die Reihe der Ankunft (14.11. 04:04–05:02): nach dem Weichen tritt die Fahrt trotz abgelaufener Hand-Zeit nicht wieder ein,
    # solange die Hand von vorhin steht; eine Hand, die erst danach kam, hält sie nicht auf
    neu fuenf
    seq 1 12 | sed 's/^/reihe.K/;s/$/#1/' >"$STUB/alle.txt"
    echo 5 >"$STUB/warter_nach"
    HAND_ZEIT_S=0
    takt
    vor=$(starts "$K")
    takt
    takt
    a1=$(starts "$K")
    echo spaet-hand >"$STUB/warter"
    takt
    a2=$(starts "$K")
    rm -f "$STUB/warter"
    HAND_ZEIT_S=9999999999
    if [ "$vor" = 1 ] && [ "$a1" = 1 ] && [ "$a2" = 2 ] && grep -q "WEICHT: am Schloss wartet macher-hand" "$L"; then
        echo "OK d  Reihe der Ankunft: nach dem Weichen kein Eintritt vor der Hand von vorhin, die spätere Hand hält die Fahrt nicht auf"
    else echo "ROT d  Reihe der Ankunft: Fahrten bis zum Weichen $vor (Soll 1), solange die Hand von vorhin steht $a1 (Soll 1), mit der späteren Hand $a2 (Soll 2)"; fi
    [ "$1" = reihe ] && { command rm -rf "$X"; return; } # die Mutante prüft nur d
    f=0 NEU_AB= T_FAHRT_ENDE= WEICH_VOR=
    # a — der Fall 23:28
    neu eins
    seq 1 61 | sed 's/^/probe.K/;s/$/#1/' >"$STUB/alle.txt"
    echo 9 >"$STUB/ci_nach"
    takt
    takt
    a1=$(gem "$K")
    rm -f "$STUB/ci"
    takt
    takt
    a2=$(gem "$K")
    takt
    takt
    if [ "$a1" = 9 ] && [ "$a2" = 61 ] && [ "$NEU_AB" = "$K" ] && grep -q "ABGEBROCHEN: CI-Job" "$L"; then
        echo "OK a  CI-Job nach $a1 von 61 · die Fortsetzung am selben Kopf holte $((a2 - a1)) nach · danach wartet er auf einen neuen Kopf"
    else echo "ROT a  behalten $a1 (Soll 9), nach der Fortsetzung $a2 (Soll 61), wartet auf ${NEU_AB:0:8} (Soll ${K:0:8})"; fi
    # a2 — ein Lauf ohne Zeile ist nicht „nichts offen“
    neu zwei
    printf 'x.K1#1\nx.K2#1\nx.K3#1\nx.K4#1\n' >"$STUB/alle.txt"
    touch "$STUB/absturz"
    takt
    takt
    vor=$NEU_AB
    takt
    takt
    a2=$(gem "$K")
    if [ -z "$vor" ] && [ "$a2" = 4 ] && grep -q "OHNE URTEIL" "$L"; then echo "OK a2 Absturz ohne Zeile: kein Warten auf einen Kopf, die nächste Lücke maß $a2 von 4"
    else echo "ROT a2 nach dem Absturz wartet er auf ${vor:0:8} (Soll: keinen Kopf), gemessen $a2 von 4"; fi
    # a3 — der Dienst stirbt mitten im Lauf
    neu drei
    seq 1 12 | sed 's/^/tod.K/;s/$/#1/' >"$STUB/alle.txt"
    echo 500 >"$STUB/ms"
    (miss "offene Stationen" --offen >/dev/null 2>&1) &
    mp=$!
    for j in $(seq 1 100); do [ "$(grep -c '"ende"' "$PM/meisterkarte-quelle/punkte/messung/${K:0:8}-radeon.json" 2>/dev/null)" -ge 6 ] 2>/dev/null && break; command sleep 0.1; done
    # der Tod des Dienstes: die Schleife und ihr Mess-Lauf zugleich (start.sh --stopp beendet den Baum)
    taskkill //T //F //PID "$(cat /proc/$mp/winpid)" >/dev/null 2>&1
    taskkill //F //PID "$(cat "$STUB/pid")" >/dev/null 2>&1
    wait $mp 2>/dev/null
    for j in $(seq 1 50); do tasklist //FI "PID eq $(cat "$STUB/pid")" //NH 2>/dev/null | grep -q node || break; command sleep 0.1; done
    f=0
    takt
    takt
    a2=$(gem "$K")
    b1=$(grep -m1 -oE "REST ${K:0:8} des beendeten Laufs: BEHALTEN [0-9]+" "$L" | grep -oE "[0-9]+$")
    if [ -n "$b1" ] && [ "$b1" -ge 1 ] && [ "$a2" = 12 ] && grep -q "gemessen ${K:0:8}: $((12 - b1)) Stationen" "$L"; then
        echo "OK a3 Tod des Dienstes nach 6 von 12: der Rest $b1 bis zur Wache bleibt, die Fortsetzung maß die übrigen $((12 - b1))"
    else echo "ROT a3 Tod des Dienstes nach 6 von 12: Rest ${b1:-—} (Soll ≥ 1), danach $a2 von 12 ($(grep -c "gemessen ${K:0:8}" "$L") Läufe)"; fi
    # b — ein Warter am Schloss
    neu vier
    seq 1 12 | sed 's/^/hand.K/;s/$/#1/' >"$STUB/alle.txt"
    echo 5 >"$STUB/warter_nach"
    takt
    takt
    b1=$(gem "$K")
    vor=$(starts "$K")
    takt
    takt
    takt
    a1=$(starts "$K")
    rm -f "$STUB/warter"
    takt
    takt
    b2=$(gem "$K")
    if [ -n "$b1" ] && [ "$b1" -ge 5 ] && [ "$b1" -lt 12 ] && [ "$a1" = "$vor" ] && [ "$b2" = 12 ] && grep -q "WEICHT: am Schloss wartet macher-hand" "$L"; then
        echo "OK b  Warter nach 5: frei an der Grenze nach $b1 von 12, keine Fahrt solange er wartet, die Fortsetzung holte $((b2 - b1)) nach"
    else echo "ROT b  Warter: behalten $b1 (Soll 5–11), Fahrten während er wartet $((a1 - vor)) (Soll 0), danach $b2 von 12"; fi
    command rm -rf "$X"
}
selbsttest() {
    local echt m r rot=0 mz=0 mr=0 O
    O=$(mktemp -d)
    # echt und jede Mutante in ihrem eigenen Sandkasten, nebeneinander
    for m in echt fortsetzung rest warter pid reihe; do (st_lauf "${m#echt}" >"$O/$m" 2>&1) & done
    wait
    echt=$(grep -E "^(OK|ROT)" "$O/echt")
    echo "$echt" | sed 's/^/  /'
    echo "$echt" | grep -q "^ROT" && rot=1
    [ "$(echo "$echt" | grep -c "^OK")" = 6 ] || rot=1
    for m in fortsetzung rest warter pid reihe; do
        mz=$((mz + 1))
        r=$(grep "^ROT" "$O/$m" | cut -c1-160)
        if [ -n "$r" ]; then mr=$((mr + 1)); echo "  Mutante „$m“ ROT an: $(echo "$r" | cut -c5-110 | tr '\n' '|' | sed 's/|$//;s/|/ · /g')"; else echo "  Mutante „$m“ bleibt GRÜN"; fi
    done
    rm -rf "$O"
    if [ $rot = 0 ] && [ $mr = $mz ]; then echo "radeon-dienst SELBSTTEST GRÜN: 6 Fälle grün, $mr/$mz Mutanten ROT"; return 0; fi
    echo "radeon-dienst SELBSTTEST ROT: Fälle $([ $rot = 0 ] && echo grün || echo ROT), $mr/$mz Mutanten ROT"
    return 1
}
[ "$1" = --selbsttest ] && { selbsttest; exit $?; }

schloss radeon || exit 0
log "START radeon-dienst (CI und Warter vor Messung, Fortsetzung bis nichts offen, PID $(cat "$S/radeon.pid"))"
f=0
NEU_AB=
while true; do
    takt
    sleep 60
done
