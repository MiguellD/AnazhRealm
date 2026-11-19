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
# DAS GESETZ DER RUNDE (Koordinator 19.11.; vorher DAS ZIEL vom 15.11.: radeon.ziel hielt den begonnenen Kopf höchstens 3600 s, dann
# sprang die Schleife zum jüngsten main — die Geräte trafen sich selten, seit dem 18.11. 03:00 kein Paar am selben Kopf): der Kopf ist
# der Mess-Kopf der Runde in koordination zug/runde.txt (zug/dienst/runde.cjs, dieselbe Datei wie die OMEN; die OMEN legt die erste
# Runde aus ihrem Bestand an). Die Radeon fährt ihre ganze Liste an DIESEM Kopf zu Ende (eingefroren beim Eintritt, ungebucht vor
# gebucht grün, `runde.cjs reihe`), ein Abbruch (CI, Warter, Tod) setzt an derselben Station fort (was gemessen ist, trägt einen Eintrag
# in messung/<kopf8>-radeon.json), danach der Richter der Runde und „durch“; die nächste Runde nimmt den main des Moments, in dem beide
# Geräte durch sind. Ein Gerät ohne Fortschritt > 15 min ist ALARM beim Namen (runde.cjs alarm, je Takt).
RUNDE_CJS=$D/runde.cjs
runde() { node "$RUNDE_CJS" "$@" 2>>"$L"; }
runde_alarm() { runde alarm "$R" "radeon (radeon-dienst)" >>"$L"; }
runde_bg() { node "$RUNDE_CJS" "$@" >>"$L.runde" 2>&1; } # Hintergrund-Schreiber: eigene Datei (node schreibt nicht mit O_APPEND wie MSYS)
# DAS GESETZ DER ROH-BILDER (Koordinator 19.11. 02:50): HIER ist der eine Ort, an dem Roh-Bilder nach punkte-maschine gingen (die OMEN
# pusht aus roh/ nur *.out, gtx-dauer.cjs messDateien) — am 21f279f5 waren 18 Bilder 44,2 von 44,6 MB des Roh-Ordners. Vor jedem
# git add: runde.cjs bilder — ein Bild geht nur nach git, wenn das Urteil seiner Station gegen stand.json WECHSELT (oder ROH_BILD=1);
# sonst zieht es in die Ablage am Gerät (nie gelöscht), nach git geht seine Prüfsumme <bild>.sha256.
BILD_ABLAGE=${BILD_ABLAGE:-$T/w3/roh-bilder}
bilder_halten() { node "$RUNDE_CJS" bilder "$PM" radeon "$1" "$BILD_ABLAGE" >>"$L" 2>&1; }
main_jetzt() { git -C $R ls-remote origin refs/heads/main | cut -f1; }
kopf() { [ -n "$RK" ] && echo "$RK"; } # der Kopf der Runde (takt liest ihn je Takt aus zug/runde.txt)
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
    local p t
    [ -d "$GS" ] || return 1
    # DAS SCHLOSS EINES LAUFENDEN CI-JOBS IST NIE VERWAIST (12.11.: der Start-Hook des Läufers schreibt „ci-runner <lauf>/<versuch> <job>“
    # OHNE pid — die 2-min-Regel unten löschte es dem laufenden Job weg, 40× im Log seit dem 10.11.; 00:32 fiel daran die Probe
    # 43120264912 von w28-stadt-grammatik mit „das GPU-Schloss hält ‚niemand‘, nicht dieser Job“). Solange ein Runner.Worker lebt,
    # gehört ein ci-runner-Schloss ihm; verwaist ist es erst, wenn kein Job mehr läuft.
    case "$(head -1 "$GS/besitzer.txt" 2>/dev/null)" in ci-runner*) ci && return 1 ;; esac
    # die pid nur über schloss_pid (gemein.sh) — mit pid urteilt allein ihr Leben, die 2-min-Regel gilt nur dem Ordner OHNE Halter
    p=$(schloss_pid "$GS/besitzer.txt")
    if [ -z "$p" ]; then t=$(mzeit "$GS") || return 1; [ $(($(date +%s) - t)) -gt 120 ]; else ! tasklist -FI "PID eq $p" -NH 2>/dev/null | grep -qw "$p"; fi
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
# richter <kopf> <vorher|-> <liste> — DER RICHTER DER RUNDE: nur die Stationen GRÜN am vorigen, ROT am jetzigen Mess-Kopf werden über die
# Köpfe dazwischen halbiert (richter.sh --fall); ohne vorigen Mess-Kopf (erste Runde) gegen die letzte Buchung wie bis 19.11.
richter() {
    local s f
    if [ "$2" = - ] || [ -z "$2" ]; then RICHTER_MAX=2 sh "$D/richter.sh" radeon --kopf "$1" >>"$S/richter.out" 2>&1; return; fi
    f=$(runde faelle "$R" radeon "$2" "$1" "$(liste_datei faelle "$3")" | tr '\n' ' ')
    echo "Richter der Runde ${2:0:8} -> ${1:0:8}: frisches ROT ${f:-keins}" >>"$S/richter.out"
    for s in $f; do sh "$D/richter.sh" radeon --fall "$s" "$2" "$1" >>"$S/richter.out" 2>&1; done
}
log() { echo "$(date +%H:%M) $*" >>"$L"; }
iso() { date -u -d "$1" +%Y-%m-%dT%H:%M:%S.%3NZ; }
stationen() { local c; c=$(grep -cE "^  (GRÜN|ROT|OFFEN)" "$W/radeon-nie-leer-lauf.out" 2>/dev/null); echo "${c:-0}"; }
# das Urteil der Punkte-Maschine selbst (run, `meine` leer nach --offen) — die EINE Quelle für „nichts offen“, nie die Zahl der Zeilen
nichts_offen() { grep -q "ist jede Station auf radeon frisch gemessen" "$W/radeon-nie-leer-lauf.out" 2>/dev/null; }
# DER PUSH SCHEITERT NIE MEHR STILL (Koordinator 19.11. 04:16; Fund: der Mess-Baum stand 58 Commits vor und 2 402 hinter
# origin/punkte-maschine, der erste ungepushte „Messung 105c9bd3 radeon“ 16.11. 07:46 — pushe() rebaste, der Konflikt in der GETEILTEN
# referenz-MiguellD.json hielt ihn an, danach „cannot rebase: You have unstaged changes“ 260-mal still in radeon.out, und der Blick
# sagte „RADEON ok“). Jetzt (1) kein Rebase: runde.cjs push-pfade setzt NUR die eigenen Geräte-Pfade aus dem Arbeitsbaum in den frisch
# geholten Ursprungs-Kopf (commit-tree, Push, bei Ablehnung von vorn); (2) die Referenz heißt referenz-radeon.json (PUNKTE_REFERENZ_NAME
# — kein Pfad, den zwei Schreiber teilen); (3) die Linse ungepusht_pruefen: Messungen des Geräts, die der Ursprung nicht trägt, > 15 min
# = ALARM in zug/runde.txt + „RADEON: n Messungen ungepusht seit <Uhr>“ im Puls.
export PUNKTE_REFERENZ_NAME=radeon
UNGEPUSHT_SEIT=$S/radeon.ungepusht
UNGEPUSHT_FRIST_S=${UNGEPUSHT_FRIST_S:-900}
pushe() { node "$RUNDE_CJS" push-pfade "$PM" punkte-maschine radeon "$1" "$2" >>"$L" 2>&1; } # <kopf|-> <botschaft>
# baum_frisch — der Mess-Baum an den Ursprungs-Kopf, nie per Rebase: eigene Commits vor dem Ursprung (aus der Zeit des Rebase-Pushs)
# bleiben als Zweig radeon-ungepusht-<zeit> liegen, ihre Mess-Dateien gehen nach origin, soweit er sie nicht trägt (push-pfade -);
# scheitert das, bleibt der Baum stehen (nichts verworfen) und die Linse meldet es
baum_frisch() {
    local n
    git -C "${PM:?}" fetch -q origin "+refs/heads/punkte-maschine:refs/remotes/origin/punkte-maschine" || return 1
    n=$(git -C "$PM" rev-list --count origin/punkte-maschine..HEAD 2>/dev/null)
    if [ "${n:-0}" -gt 0 ]; then
        git -C "$PM" branch -f "radeon-ungepusht-$(date +%m%d%H%M)" HEAD
        log "RETTUNG: $n eigene Commits vor origin/punkte-maschine (Rebase-Push) — als Zweig radeon-ungepusht-$(date +%m%d%H%M) gesichert"
        pushe - "Radeon: Rettung der Mess-Dateien aus $n ungepushten Commits (Rebase-Push, Gesetz der Runde 19.11.)" || return 1
    elif [ "$(ungepusht_zahl)" != 0 ]; then # ein früherer Push scheiterte: die eigenen Pfade aller Köpfe noch einmal
        pushe "*" "Radeon: Messungen eines gescheiterten Pushs (runde.cjs push-pfade)" && [ "$(ungepusht_zahl)" = 0 ] || { log "der Mess-Baum trägt ungepushte Messungen — nichts verworfen, kein Neuaufsetzen"; return 1; }
    fi
    git -C "$PM" checkout -q -- meisterkarte-quelle/punkte/messung 2>/dev/null
    git -C "$PM" clean -fdq -- meisterkarte-quelle/punkte/messung 2>/dev/null
    git -C "$PM" reset -q --hard origin/punkte-maschine
}
ungepusht_zahl() { UNGEPUSHT=$(node "$RUNDE_CJS" ungepusht "$PM" punkte-maschine radeon "$UNGEPUSHT_SEIT" 2>>"$L"); echo "${UNGEPUSHT%% *}"; }
# ungepusht_pruefen — die Linse: n > 0 seit > UNGEPUSHT_FRIST_S ist EIN Alarm je Stunde (zug/runde.txt Feld alarm + zug/erledigt.txt)
ungepusht_pruefen() {
    local n seit m=$S/radeon.ungepusht.alarm
    n=$(ungepusht_zahl)
    UNGEPUSHT_TEXT=
    [ "${n:-0}" -gt 0 ] || return 0
    seit=${UNGEPUSHT#* }
    UNGEPUSHT_TEXT="RADEON: $n Messungen ungepusht seit $(date -d "$seit" +%H:%M)"
    [ $(($(date +%s) - $(date -d "$seit" +%s))) -gt "$UNGEPUSHT_FRIST_S" ] || return 0
    [ -f "$m" ] && [ $(($(date +%s) - $(mzeit "$m"))) -lt 3600 ] && return 0
    touch "$m"
    runde alarm "$R" "radeon (radeon-dienst)" --geraet radeon --grund "$UNGEPUSHT_TEXT" >>"$L"
}
# behalten <kopf> <bis ISO> <was> — punkte.cjs behalte kappt jeden Eintrag, dessen Lauf nach <bis> endete, hält den Rest und pusht ihn;
# ohne Behaltenes steht die Datei wie im Archiv (Exit 1). Im Baum $PM.
behalten() {
    (cd "$PM/meisterkarte-quelle/punkte" && node punkte.cjs behalte --sha "$1" --geraet radeon --bis "$2" >"$W/radeon-behalte.out" 2>&1)
    if [ $? = 0 ]; then
        bilder_halten "$1"
        pushe "$1" "Messung ${1:0:8} radeon: $3 ($(head -1 "$W/radeon-behalte.out" | cut -c1-80), radeon-dienst)" # die Akten der Meisterkarte 2 reisen mit (eigene Pfade)
        return 0
    fi
    git -C "${PM:?}" checkout -q -- meisterkarte-quelle/punkte/messung 2>/dev/null
    git -C "${PM:?}" clean -fdq -- meisterkarte-quelle/punkte/messung 2>/dev/null
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
karte2_nur() { # die Stationen der Tafel mit einer Zeile „gleich“ (nur sie schreiben eine Akte), je einmal, mit Komma — leer, wenn der Baum keine Tafel trägt
    [ -f "$PM/vision/richter-tafel.json" ] || return 0
    node -e 'const t=require(process.argv[1]);const z=Object.values(t).find((v)=>v&&typeof v==="object"&&Object.values(v).some((e)=>e&&e.station));console.log([...new Set(Object.values(z||{}).filter((e)=>e&&e.richter==="gleich").map((e)=>e.station).filter(Boolean))].join(","))' "$(cygpath -m "$PM/vision/richter-tafel.json")" 2>/dev/null
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
    # was sonst im Baum liegt, stammt von einem Lauf ohne Zeugen: eine halbe Messung ist keine — verwerfen; der Baum an den Ursprung
    # (baum_frisch, nie Rebase) — trägt er ungepushte Messungen, fährt keine Messung (die Linse meldet es)
    baum_frisch || { log "$name am ${K:0:8}: der Mess-Baum ist nicht frisch (ungepusht oder fetch) — keine Fahrt"; return 1; }
    log "$name am ${K:0:8}"
    puls radeon "${UNGEPUSHT_TEXT:+$UNGEPUSHT_TEXT · }misst $name am ${K:0:8} · $(node "$RUNDE_CJS" ablage "$BILD_ABLAGE" 2>/dev/null)"
    PROG=0
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
        # der Stand je Station in zug/runde.txt (Fortschritt für den Alarm der Runde) — im Hintergrund, EIN Schreiber zugleich: ein
        # Push braucht Sekunden, die Wache darf nie auf ihn warten (sonst käme der CI-Abbruch Stationen zu spät)
        c=$(stationen)
        if [ "$c" -gt "${PROG:-0}" ] && ! kill -0 "${PROG_PID:-999999}" 2>/dev/null; then PROG=$c; runde_bg stand "$R" radeon "$K" laeuft --erledigt $((${BASIS:-0} + c)) & PROG_PID=$!; fi
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
    bilder_halten "$K"
    pushe "$K" "Messung ${K:0:8} radeon: $name (radeon-dienst, $g GRÜN von $n, ohne CI daneben)" && log "Messung gepusht"
    [ "$n" != 0 ] && return 0
    nichts_offen && return 3
    log "$name ${K:0:8} OHNE URTEIL: 0 Stationen, die Punkte-Maschine sagte nie ‚frisch gemessen‘ ($(grep -v '^\s*$' "$W/radeon-nie-leer-lauf.out" | tail -1 | cut -c1-160)) — offen bleibt offen, die Fortsetzung misst in der nächsten Lücke"
    return 4
}
zahl() { echo "$1" | tr ',|' '\n\n' | grep -c .; }
# DIE LISTE REIST ALS DATEI (Koordinator 19.11. 05:54; die OMEN fiel beim Live-Gang an „node: Argument list too long“ — 1 428 Stationen
# ≈ 50 000 Zeichen als EIN Argument über der Windows-Grenze 32 767): liste_datei <name> <liste> schreibt sie nach $S/listen/<name>.txt
# (printf ist eingebaut) und nennt „@<datei>“ — so heißt jedes Listen-Argument an runde.cjs. An punkte.cjs (--nur) reist nur ein Teil,
# gekappt auf ≤ 8 000 Zeichen (runde.cjs kappe); der Rest fährt in den nächsten Fahrten derselben Runde.
liste_datei() { mkdir -p "${S:?}/listen" && printf '%s\n' "$2" >"$S/listen/$1.txt" && echo "@$S/listen/$1.txt"; }
# liste_rot <grund> — STILLES SCHEITERN IST ROT: Quelle > 0 und Liste 0 oder ein node der Listen-Kette mit Exit ≠ 0 — die Zeile der Runde
# bleibt (nie `laeuft 0/0`, nie „durch“), EIN Alarm je Stunde in zug/runde.txt + zug/erledigt.txt, der Puls nennt es
liste_rot() {
    local m=$S/liste-rot.alarm
    log "LISTE ROT: $1"
    puls radeon "LISTE ROT: $1 — keine Fahrt"
    [ -f "$m" ] && [ $(($(date +%s) - $(mzeit "$m"))) -lt 3600 ] && return 0
    touch "$m"
    runde alarm "$R" "radeon (radeon-dienst)" --geraet radeon --grund "LISTE ROT: $1" >>"$L"
}
# offen_am <liste> — die Stationen der Liste ohne Eintrag in messung/<RK8>-radeon.json am gepushten Stand (nach dem Rest des Vorläufers)
offen_am() {
    (cd "$PM" && rest_behalten >/dev/null 2>&1)
    git -C "$PM" fetch -q origin "+refs/heads/punkte-maschine:refs/remotes/origin/punkte-maschine" 2>/dev/null
    runde offen "$PM" origin/punkte-maschine radeon "$RK" "$(liste_datei offen "$1")"
}
# takt — EIN Blick der Schleife (je 60 s): verwaiste Schlösser lösen, die Runde lesen, die eigene Liste am Kopf der Runde fahren oder
# fortsetzen; ist sie durch: der Richter der Runde, „durch“, dann auf das andere Gerät warten (Alarm, nie still)
takt() {
    local rc RL U B RU RB G n grp
    if verwaist; then
        log "verwaistes GPU-Schloss gelöst ($(head -1 "$GS/besitzer.txt" 2>/dev/null | tr -d "") · pid=$(schloss_pid "$GS/besitzer.txt"), Halter tot)"
        rm -rf "$GS"
    fi
    RL=$(runde lies "$R" radeon)
    if [ -z "$RL" ]; then
        RK=
        puls radeon "zug/runde.txt nicht lesbar (fetch koordination?) — nächster Takt"
        return 0
    fi
    if [ "$RL" = - ]; then # (Koordinator 03:30, 6a) liegt keine Runde, legt die Radeon sie an: am main-Kopf des Moments (wer zuerst schreibt, gilt)
        runde anlegen "$R" "$(main_jetzt)" >>"$L"
        log "keine Runde in zug/runde.txt — angelegt am main $(main_jetzt | cut -c1-8) (oder eine Runde lag schon: sie gilt)"
        return 0
    fi
    read -r RN RK RV RZ RLISTE <<<"$RL"
    runde_alarm
    ungepusht_pruefen
    if [ "$RZ" = durch ] && [ "$(zahl "$RLISTE")" = 0 ]; then # „durch“ ohne Station war nie eine Messung: zurück auf offen (Notiz)
        runde zurueck "$R" radeon "$RK" "durch 0/0 ohne Liste war ein Listen-Bruch, zurück auf offen" >>"$L"
        RZ=offen RLISTE=-
    fi
    if [ "$RZ" = durch ]; then
        puls radeon "${UNGEPUSHT_TEXT:+$UNGEPUSHT_TEXT · }Runde $RN am ${RK:0:8}: die Radeon ist durch — $(runde weiter "$R" "$(main_jetzt)") · $(node "$RUNDE_CJS" ablage "$BILD_ABLAGE" 2>/dev/null)"
        return 0
    fi
    if [ "$RLISTE" != - ] && [ "$(zahl "$RLISTE")" != 0 ]; then
        U=${RLISTE%%|*} B=${RLISTE#*|}
        RU=$(offen_am "$U") && RB=$(offen_am "$B") || { liste_rot "runde.cjs offen am ${RK:0:8} scheiterte (Exit $?)"; return 0; }
        G=$(zahl "$RLISTE")
        n=$(($(zahl "$RU") + $(zahl "$RB")))
        BASIS=$((G - n))
        if [ $n = 0 ]; then # die ganze Liste trägt am Kopf der Runde einen Eintrag: der Richter der Runde, dann durch
            puls radeon "Richter Runde $RN am ${RK:0:8}"
            richter "$RK" "$RV" "$RLISTE"
            log "Richter Runde $RN ${RK:0:8}: $(grep -E "TÄTER|KEIN FALL|UNSCHARF|Fälle|FALL|frisches ROT" "$S/richter.out" | tail -1 | cut -c1-220)"
            log "Runde $RN am ${RK:0:8}: die Radeon ist durch ($G Stationen) — $(runde durch "$R" radeon "$RK" "$(main_jetzt)" --erledigt "$G")"
            return 0
        fi
    fi
    if frei; then f=$((f + 1)); else
        f=0
        puls radeon "wartet: Karte belegt ($(head -1 "$GS/besitzer.txt" 2>/dev/null || echo CI/Messung/Warter)) — Runde $RN am ${RK:0:8}"
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
        # DIE KARTE 2 IST DER ZÄHLER (15.11.): die Liste sind die Stationen der Tafel (vision/richter-tafel.json im Baum der Punkte-
        # Maschine, Zeilen „gleich“) — beim Eintritt in die Runde gebaut und EINGEFROREN (Feld liste), ungebucht vor gebucht grün
        # auch eine Zeile mit Liste OHNE Station (`liste |`) baut sie neu — die Runde muss dafür nicht neu angelegt werden
        if [ "$RLISTE" = - ] || [ "$(zahl "$RLISTE")" = 0 ]; then
            nur=$(karte2_nur | tr -d '\r')
            if [ -z "$nur" ]; then puls radeon "Runde $RN: der Baum der Punkte-Maschine trägt keine Tafel der Karte 2 — keine Liste"; f=0; return 0; fi
            RLISTE=$(runde reihe "$PM/meisterkarte-quelle/punkte/messung" radeon "$(liste_datei reihe "$nur")")
            rc=$?
            if [ $rc != 0 ] || [ "$(zahl "$RLISTE")" = 0 ]; then liste_rot "Runde $RN am ${RK:0:8}: Tafel $(zahl "$nur"), Reihe $(zahl "$RLISTE") (Exit $rc)"; f=0; return 0; fi
            log "Runde $RN am ${RK:0:8}: die Liste (ungebucht | gebucht grün) $(zahl "${RLISTE%%|*}") | $(zahl "${RLISTE#*|}") Stationen ($S/listen/runde.txt)"
            runde stand "$R" radeon "$RK" laeuft --liste "$(liste_datei runde "$RLISTE")" --gesamt "$(zahl "$RLISTE")" --erledigt 0 >>"$L" ||
                { liste_rot "runde.cjs stand schrieb die Liste nicht (Exit $?)"; f=0; return 0; }
            U=${RLISTE%%|*} B=${RLISTE#*|}
            RU=$(offen_am "$U") && RB=$(offen_am "$B") || { liste_rot "runde.cjs offen am ${RK:0:8} scheiterte (Exit $?)"; f=0; return 0; }
            G=$(zahl "$RLISTE")
            BASIS=$((G - $(zahl "$RU") - $(zahl "$RB")))
        fi
        # 2 DIE REIHE ÜBER DIE AUSWAHL: punkte.cjs fährt eine --nur-Auswahl in der Reihe seiner Stationen — darum zwei Fahrten, erst die
        # ungebuchten, dann die gebucht grünen
        grp=$RU
        [ -n "$grp" ] || grp=$RB
        # an punkte.cjs reist nur ein Teil ≤ 8 000 Zeichen (die Reihe bleibt: der Anfang der Gruppe zuerst, der Rest in der nächsten Fahrt)
        [ -n "$grp" ] && { grp=$(runde kappe "$(liste_datei grp "$grp")" 8000) && [ -n "$grp" ] || { liste_rot "runde.cjs kappe gab keinen Teil"; f=0; return 0; }; }
        if [ -n "$grp" ]; then
            runde stand "$R" radeon "$RK" laeuft --erledigt "$BASIS" --gesamt "$G" >>"$L"
            miss "Runde-Liste" --nur "$grp"
            rc=$?
            T_FAHRT_ENDE=$(date +%s)
            [ $rc = 2 ] && runde stand "$R" radeon "$RK" weicht --erledigt $((BASIS + PROG)) >>"$L"
        fi
        f=0
    elif [ $f -gt 0 ]; then puls radeon "Karte frei seit $f min — misst ab 2"; fi
}

# ── DER SELBSTTEST (ohne Karte): ein Sandkasten mit eigenem Spiel-origin (main + koordination mit zug/runde.txt) und punkte-maschine-
# origin, ein Stummel-punkte.cjs (run --nur misst je 0,1 s die genannten Stationen, behalte kappt nach Endzeit), CI und Warter als
# Marken-Dateien, runde.cjs echt. Jeder Fall beginnt eine eigene Runde (neu). Die Fälle:
# a  der Fall 23:28 in der Runde: 61 Stationen, CI-Job nach 9 → behalten 9, die Fortsetzung am Kopf der Runde misst 52, dann „durch“
# a2 ein Lauf stirbt ohne Zeile → nicht „durch“, die nächste Lücke misst
# a3 der Dienst stirbt mitten im Lauf → der Rest bis zur Wache bleibt, die Fortsetzung misst nur, was fehlt
# b  ein Warter erscheint nach 5 Stationen → der Dienst gibt an der nächsten Grenze frei, beginnt nichts, solange er wartet, setzt fort
# c  ein lebender gpu-lauf-Halter (pid in Zeile 1) seit 300 s bleibt, ein toter Halter (pid in Zeile 2) fällt
# d  nach dem Weichen kein Eintritt, solange die Hand von vorhin steht; eine spätere hält ihn nicht auf
# z  DAS GESETZ DER RUNDE: main springt → am Kopf der Runde zu Ende, ungebucht vor gebucht grün, die nächste Runde erst, wenn beide durch
# Mutanten: von-vorn (die Fortsetzung misst die ganze Gruppe) · rest (kein Rest-Behalten) · warter (blind für Warter) · pid (die alte
# r  DAS GESETZ DER ROH-BILDER: ein Bild bei gehaltenem Urteil bleibt am Gerät (Prüfsumme in git), bei Wechsel geht es nach git
# Mutanten (Forts.): pid-Quelle „^pid=“ · reihe (nach HAND_ZEIT_S vor die Hand von vorhin) · ziel (der Kopf ist der jüngste main, die
# Regel bis 19.11.) · bild (git add -A nimmt jedes Roh-Bild mit, die Regel bis 19.11.) — jede ROT.
st_lauf() { # $1 = Mutante (leer = echt); druckt je Fall „OK <fall> …“ oder „ROT <fall> …“
    local X K j a1 a2 c3 b1 b2 vor mp alt z1 z2
    X=$(mktemp -d)
    R=$X/spiel PM=$X/pm W=$X/w S=$X/s GS=$X/schloss STUB=$X/stub
    L=$W/log WACHE=$S/radeon.wache BILD_ABLAGE=$X/ablage TAKT_S=0.1 BIS_SPIEL_S=0 WEICH_MAX_S=20 HAND_NACH_S=0 HAND_ZEIT_S=9999999999
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
    # das Schloss verschwindet zwischen `-d` und `stat` (16.11. 21:23: stat druckte nichts, „arithmetic syntax error“ an der
    # 2-min-Regel beendete die Schleife, sie stand 30 h): ein Ordner ohne Halter, dessen stat stumm bleibt, ist NICHT verwaist —
    # und der Ruf überlebt (stirbt er, bleibt c3 leer)
    mkdir -p "$GS"
    c3=$(stat() { :; }; verwaist && echo VERWAIST || echo gehalten)
    rm -rf "$GS"
    if [ "$a1" = gehalten ] && [ "$a2" = VERWAIST ] && [ "$c3" = gehalten ]; then echo "OK c  lebender gpu-lauf-Halter nach 300 s gehalten · toter Halter der Punkte-Sitzung gelöst · verschwundenes Schloss überlebt"
    else echo "ROT c  lebender Halter baum-ganz (pid in Zeile 1, 300 s): $a1 (Soll gehalten) · toter Halter (pid in Zeile 2): $a2 (Soll VERWAIST) · Schloss verschwindet vor stat: '${c3:-GESTORBEN}' (Soll gehalten)"; fi
    [ "$1" = pid ] && { command rm -rf "$X"; return; }
    git init -q --bare "$X/spiel.git" && git init -q -b main "$R" && git -C "$R" remote add origin "$X/spiel.git"
    git init -q --bare "$X/pm.git" && git init -q -b punkte-maschine "$PM" && git -C "$PM" remote add origin "$X/pm.git"
    git -C "$R" config core.autocrlf false && git -C "$PM" config core.autocrlf false
    # koordination im Spiel-origin: dort lebt zug/runde.txt (runde.cjs schreibt sie wie im Feld über commit-tree + Push)
    git init -q -b koordination "$X/k" && mkdir -p "$X/k/zug" && echo "# erledigt" >"$X/k/zug/erledigt.txt" &&
        git -C "$X/k" add zug && git -C "$X/k" $A commit -qm koord && git -C "$X/k" push -q "$X/spiel.git" koordination
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
    // --nur (die Runde): genau diese Stationen, wie punkte.cjs — gemessen oder nicht; ohne --nur die alte Fortsetzung
    const nur = a.includes("--nur") ? arg("--nur").split(",").filter(Boolean) : null;
    if (nur) fs.appendFileSync(path.join(S, "nur.log"), nur.join(",") + "\n");
    const m = lies(), offen = nur ? alle.filter((id) => nur.includes(id)) : alle.filter((id) => !m.je[id]);
    if (!offen.length) return console.log("Punkte-Maschine: am " + k8 + " ist jede Station auf radeon frisch gemessen");
    fs.writeFileSync(path.join(S, "pid"), String(process.pid));
    // die Referenz-Ablage wie punkte.cjs referenzAblageVon: je PUNKTE_REFERENZ_NAME, sonst je Rechner
    fs.writeFileSync(path.join(__dirname, "messung", "referenz-" + String(process.env.PUNKTE_REFERENZ_NAME || require("os").hostname()).replace(/[^A-Za-z0-9_-]/g, "_") + ".json"), JSON.stringify({ rechner: "x", fahrten: [] }) + "\n");
    console.log("Punkte-Maschine: " + offen.length + " Station(en) in " + offen.length + " Läufen auf radeon am " + k8 + " (Stummel)");
    let n = 0, ms = Number(marke("ms") || 100);
    for (const id of offen) {
        await schlaf(ms);
        m.je[id] = { ende: Date.now() };
        schreib(m);
        console.log("  GRÜN " + id + " · Stummel · Exit 0 · 0 min");
        // ein Roh-Bild der Station (Gesetz der Roh-Bilder): bild.txt nennt, wer eins schreibt
        if (marke("bild.txt") !== null && marke("bild.txt").split(/\s+/).includes(id)) { const rd = path.join(__dirname, "messung", "roh", k8 + "-radeon"); fs.mkdirSync(rd, { recursive: true }); fs.writeFileSync(path.join(rd, id.replace(/#/g, "_") + "-bild.png"), "PNG " + id); }
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
    karte2_nur() { paste -sd, "$STUB/alle.txt"; } # die Tafel des Sandkastens: alle Stationen des Falls
    case "$1" in
    von-vorn) offen_am() { echo "$1"; } ;; # die Fortsetzung blind: jede Fahrt die ganze Gruppe
    rest) rest_behalten() { rm -f "$WACHE"; } ;;
    warter) warter() { :; } ;;
    ziel) kopf() { main_jetzt; } ;; # die alte Regel: der Takt misst am jüngsten main
    bild) bilder_halten() { :; } ;; # die alte Regel: git add -A nimmt jedes Roh-Bild mit
    liste-als-argument) liste_datei() { echo "$2"; } ;; # die alte Regel: die Liste reist als EIN Argument
    still-push) ungepusht_pruefen() { UNGEPUSHT_TEXT=; } ;; # die alte Regel: ein Push scheitert, niemand sagt es
    referenz-rechner) unset PUNKTE_REFERENZ_NAME ;; # die alte Regel: die Referenz heißt nach dem Rechner (geteilt)
    reihe) vor_mir_da() { return 1; } ;; # die alte Regel: nach HAND_ZEIT_S tritt die Fahrt wieder ein, gleich wer schon wartet
    esac
    # neu <botschaft> — eine Landung auf main und (gespielt) beide Geräte durch: die nächste Runde am neuen Kopf
    geraet_durch() { runde stand "$R" "$1" "$2" laeuft --liste x.K1#1 --gesamt 1 >/dev/null; runde durch "$R" "$1" "$2" "$3" >/dev/null; } # durch nur MIT Liste
    neu() {
        local rl ok
        git -C "$R" $A commit -q --allow-empty -m "$1" && git -C "$R" push -q origin main
        K=$(main_jetzt)
        rl=$(runde lies "$R" radeon)
        if [ "$rl" = - ]; then runde anlegen "$R" "$K" >/dev/null
        else ok=$(echo "$rl" | cut -d' ' -f2); geraet_durch gtx "$ok" "$K"; geraet_durch radeon "$ok" "$K"; fi
    }
    feld() { git -C "$R" fetch -q origin +refs/heads/koordination:refs/t/k && git -C "$R" show refs/t/k:zug/runde.txt | grep "^$1 "; }
    gem() { git -C "$X/pm.git" show "punkte-maschine:meisterkarte-quelle/punkte/messung/${1:0:8}-radeon.json" 2>/dev/null | grep -c '"ende"'; }
    starts() { grep -c "Runde-Liste am ${1:0:8}" "$L"; }
    f=0
    # e — keine Runde liegt (Koordinator 03:30, 6a): der Takt der Radeon legt sie am main-Kopf des Moments an
    git -C "$R" $A commit -q --allow-empty -m null && git -C "$R" push -q origin main
    takt
    if feld runde | grep -q "^runde 1 kopf $(main_jetzt) "; then echo "OK e  keine Runde: der Takt der Radeon legte Runde 1 am main $(main_jetzt | cut -c1-8) an"
    else echo "ROT e  keine Runde: zug/runde.txt trägt „$(feld runde | cut -c1-60)“ (Soll runde 1 am main $(main_jetzt | cut -c1-8))"; fi
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
    f=0 T_FAHRT_ENDE= WEICH_VOR=
    # a — der Fall 23:28 in der Runde: CI-Job nach 9 von 61, die Fortsetzung am Kopf der Runde misst die 52, dann „durch“
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
    z1=$(feld radeon)
    if [ "$a1" = 9 ] && [ "$a2" = 61 ] && grep -q "gemessen ${K:0:8}: 52 Stationen" "$L" && echo "$z1" | grep -q "^radeon durch " && grep -q "ABGEBROCHEN: CI-Job" "$L"; then
        echo "OK a  CI-Job nach $a1 von 61 · die Fortsetzung am Kopf der Runde holte die übrigen $((a2 - a1)) nach · danach „durch“ in zug/runde.txt"
    else echo "ROT a  behalten $a1 (Soll 9), nach der Fortsetzung $a2 (Soll 61, Lauf mit 52: $(grep -c "gemessen ${K:0:8}: 52 Stationen" "$L")), Zeile „$(echo "$z1" | cut -c1-24)“ (Soll durch)"; fi
    # a2 — ein Lauf ohne Zeile ist nicht „durch“
    neu zwei
    printf 'x.K1#1\nx.K2#1\nx.K3#1\nx.K4#1\n' >"$STUB/alle.txt"
    touch "$STUB/absturz"
    takt
    takt
    vor=$(feld radeon | cut -d' ' -f2)
    takt
    takt
    takt
    a2=$(gem "$K")
    if [ "$vor" != durch ] && [ "$a2" = 4 ] && grep -q "OHNE URTEIL" "$L" && feld radeon | grep -q "^radeon durch "; then echo "OK a2 Absturz ohne Zeile: nicht durch ($vor), die nächste Lücke maß $a2 von 4, dann durch"
    else echo "ROT a2 nach dem Absturz „$vor“ (Soll nicht durch), gemessen $a2 von 4"; fi
    # a3 — der Dienst stirbt mitten im Lauf
    neu drei
    seq 1 12 | sed 's/^/tod.K/;s/$/#1/' >"$STUB/alle.txt"
    echo 500 >"$STUB/ms"
    RK=$K
    (miss "Runde-Liste" --nur "$(paste -sd, "$STUB/alle.txt")" >/dev/null 2>&1) &
    mp=$!
    for j in $(seq 1 100); do [ "$(grep -c '"ende"' "$PM/meisterkarte-quelle/punkte/messung/${K:0:8}-radeon.json" 2>/dev/null)" -ge 6 ] 2>/dev/null && break; command sleep 0.1; done
    # der Tod des Dienstes: die Schleife und ihr Mess-Lauf zugleich (start.sh --stopp beendet den Baum)
    taskkill //T //F //PID "$(cat /proc/$mp/winpid)" >/dev/null 2>&1
    taskkill //F //PID "$(cat "$STUB/pid")" >/dev/null 2>&1
    wait $mp 2>/dev/null
    for j in $(seq 1 50); do tasklist //FI "PID eq $(cat "$STUB/pid")" //NH 2>/dev/null | grep -q node || break; command sleep 0.1; done
    rm -f "$STUB/ms"
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
    # z — DAS GESETZ DER RUNDE: main springt mitten in der Runde → die Radeon misst am Kopf der Runde zu Ende, ungebucht vor gebucht grün
    # (z.K1#1 trägt ein grünes Paar), „durch“; erst wenn auch die OMEN durch ist, nimmt die nächste Runde den main des Moments
    neu sechs
    printf 'z.K1#1\nz.K2#1\nz.K3#1\n' >"$STUB/alle.txt"
    echo '{"zeit":"2026-11-18T01:00:00Z","je":{"z.K1#1":{"gruen":true,"zeit":"2026-11-18T01:00:00Z"}}}' >"$PM/meisterkarte-quelle/punkte/messung/bbbbbbbb-gtx.json"
    echo '{"zeit":"2026-11-18T01:00:00Z","je":{"z.K1#1":{"gruen":true,"zeit":"2026-11-18T01:00:00Z"}}}' >"$PM/meisterkarte-quelle/punkte/messung/bbbbbbbb-radeon.json"
    alt=$K
    git -C "$R" $A commit -q --allow-empty -m landung && git -C "$R" push -q origin main
    j=$(wc -l <"$STUB/nur.log")
    for mp in 1 2 3 4 5 6 7 8; do takt; feld radeon | grep -q "^radeon durch " && break; done
    z1=$(tail -n +$((j + 1)) "$STUB/nur.log" | paste -sd' ' -)
    b1=$(gem "$alt") b2=$(gem "$(main_jetzt)")
    vor=$(feld runde)
    geraet_durch gtx "$alt" "$(main_jetzt)" # die OMEN ist auch durch
    takt
    z2=$(kopf)
    if [ "$b1" = 3 ] && [ "$b2" = 0 ] && [ "$z1" = "z.K2#1,z.K3#1 z.K1#1" ] && echo "$vor" | grep -q "kopf $alt " && [ "$z2" = "$(main_jetzt)" ]; then
        echo "OK z  Runde: main sprang, die Radeon maß 3 von 3 am Kopf der Runde ${alt:0:8} (ungebucht zuerst: $z1), 0 am neuen main; beide durch → Runde am main ${z2:0:8}"
    else echo "ROT z  Runde: am Kopf der Runde $b1 von 3, am neuen main $b2 (Soll 0), Fahrten „$z1“ (Soll „z.K2#1,z.K3#1 z.K1#1“), Runde „$(echo "$vor" | cut -c1-30)“, danach Kopf ${z2:0:8} (Soll main)"; fi
    # r — DAS GESETZ DER ROH-BILDER: r.K1#1 gebucht ROT, misst ROT (Urteil hält) → sein Bild bleibt am Gerät, nach git nur die
    # Prüfsumme; r.K2#1 gebucht GRÜN, misst ROT (Täter-Bild) → das Bild geht nach git
    neu sieben
    printf 'r.K1#1\nr.K2#1\n' >"$STUB/alle.txt"
    printf 'r.K1#1 r.K2#1\n' >"$STUB/bild.txt"
    echo '{"je":{"r":{"stationen":[{"id":"r.K1#1","geraet":"radeon","gruen":false,"sha":"x"},{"id":"r.K2#1","geraet":"radeon","gruen":true,"sha":"x"}]}}}' >"$PM/meisterkarte-quelle/punkte/stand.json"
    for mp in 1 2 3 4 5 6; do takt; feld radeon | grep -q "^radeon durch " && break; done
    z1=$(git -C "$X/pm.git" ls-tree -r --name-only punkte-maschine "meisterkarte-quelle/punkte/messung/roh/${K:0:8}-radeon/" | sed "s|.*/||" | tr '\n' ' ')
    if echo "$z1" | grep -q "r.K2_1-bild.png " && ! echo "$z1" | grep -q "r.K1_1-bild.png " && echo "$z1" | grep -q "r.K1_1-bild.png.sha256" && [ -f "$X/ablage/${K:0:8}-radeon/r.K1_1-bild.png" ]; then
        echo "OK r  Roh-Bilder: gehaltenes Urteil (r.K1#1 ROT → ROT) — Bild am Gerät, nur die Prüfsumme in git; Wechsel (r.K2#1 GRÜN → ROT) — das Täter-Bild in git"
    else echo "ROT r  Roh-Bilder: in git „$z1“ (Soll r.K2_1-bild.png und r.K1_1-bild.png.sha256, NICHT r.K1_1-bild.png), am Gerät $([ -f "$X/ablage/${K:0:8}-radeon/r.K1_1-bild.png" ] && echo ja || echo nein)"; fi
    # p — DER PUSH SCHEITERT STILL: der Ursprung lehnt jeden Push ab (pre-receive). Die Messung bleibt im Baum, die Linse meldet
    # „RADEON: n Messungen ungepusht seit <Uhr>“ als ALARM; nimmt der Ursprung wieder an, holt der nächste Takt den Push nach (ohne Rebase)
    neu acht
    printf 'p.K1#1\np.K2#1\n' >"$STUB/alle.txt"
    printf '#!/bin/sh\nexit 1\n' >"$X/pm.git/hooks/pre-receive"
    UNGEPUSHT_FRIST_S=-1
    export RUNDE_PUSH_VERSUCHE=2
    for mp in 1 2 3; do takt; done
    takt
    z1=$(git -C "$R" fetch -q origin +refs/heads/koordination:refs/t/k && git -C "$R" show refs/t/k:zug/erledigt.txt | grep -c "ALARM radeon: RADEON: [0-9]* Messungen ungepusht seit")
    b1=$(gem "$K")
    rm -f "$X/pm.git/hooks/pre-receive"
    for mp in 1 2 3 4; do takt; [ "$(gem "$K")" = 2 ] && break; done
    b2=$(gem "$K")
    UNGEPUSHT_FRIST_S=900
    unset RUNDE_PUSH_VERSUCHE
    zv=$(grep -c "runde.cjs push-pfade Versuch 1/2 gescheitert" "$L") # jeder Versuch steht sofort im Protokoll
    if [ "$z1" -ge 1 ] && [ "${b1:-0}" = 0 ] && [ "$b2" = 2 ] && [ "$zv" -ge 1 ]; then echo "OK p  Push scheitert (Zeile „Versuch 1/2 gescheitert“ sofort im Protokoll): ALARM „RADEON: n Messungen ungepusht seit …“ in zug/erledigt.txt, nichts verworfen; der Ursprung nimmt wieder an → nachgeholt 2 von 2 (ohne Rebase)"
    else echo "ROT p  Push scheitert: Versuch-Zeilen ${zv:-0} (Soll ≥ 1), Alarm-Zeilen $z1 (Soll ≥ 1), am Ursprung während der Ablehnung ${b1:-0} (Soll 0), danach $b2 (Soll 2)"; fi
    # q — ABSENZ: kein Pfad, den zwei Schreiber teilen — die Referenz der Radeon heißt referenz-radeon.json, eine Rechner-Referenz reist nie
    z2=$(git -C "$X/pm.git" ls-tree --name-only punkte-maschine meisterkarte-quelle/punkte/messung/ | sed "s|.*/||" | grep "^referenz-" | tr '\n' ' ')
    if [ "$z2" = "referenz-radeon.json " ]; then echo "OK q  Absenz: am Ursprung nur referenz-radeon.json — kein Pfad eines Rechners oder eines anderen Geräts"
    else echo "ROT q  Absenz: Referenzen am Ursprung „$z2“ (Soll referenz-radeon.json)"; fi
    # t — DIE ECHTE TAFEL an der Radeon (Koordinator 05:58: derselbe Windows-Laptop, dieselbe Grenze 32 767): die Stationen der Tafel des
    # koordination-Kopfs (vision/richter-tafel.json, sie wächst) laufen durch Reihe → runde.txt → offen → kappe bis zur ersten Fahrt;
    # kein node-Aufruf trägt mehr als 30 000 Zeichen in argv, die Liste ≥ Quelle − gebucht, an punkte.cjs reist ein Teil ≤ 8 000 Zeichen
    local quelle lz n1
    neu neun
    git -C "$D/../.." show HEAD:vision/richter-tafel.json 2>/dev/null | node -e 'let s="";process.stdin.on("data",(d)=>(s+=d)).on("end",()=>{const t=JSON.parse(s);console.log([...new Set(t.zeilen.filter((e)=>e.richter==="gleich").map((e)=>e.station))].join("\n"))})' >"$STUB/alle.txt"
    quelle=$(grep -c . "$STUB/alle.txt")
    echo 1 >"$STUB/ms"
    rm -f "$STUB/nur.log"
    node() { local a n=0; for a; do n=$((n + ${#a})); done; [ $n -gt 30000 ] && echo "$n ${2:-$1}" >>"$X/argv-lang"; command node "$@"; }
    takt
    takt
    unset -f node
    rm -f "$STUB/ms"
    lz=$(feld radeon | sed 's/.* liste //' | tr ',|' '\n\n' | grep -c .)
    n1=$(head -n 1 "$STUB/nur.log" 2>/dev/null)
    if [ "$quelle" -ge 1000 ] && [ "$lz" -ge "$quelle" ] && [ -n "$n1" ] && [ "${#n1}" -le 8000 ] && [ ! -s "$X/argv-lang" ]; then
        echo "OK t  die echte Tafel an der Radeon: Quelle $quelle → Liste $lz in zug/runde.txt, die erste Fahrt --nur mit ${#n1} Zeichen (≤ 8 000); kein node-Aufruf über 30 000 Zeichen"
    else echo "ROT t  die echte Tafel: Quelle $quelle (Soll ≥ 1 000), Liste $lz (Soll ≥ Quelle), erste Fahrt ${#n1} Zeichen (Soll 1–8 000), argv über 30 000: $(head -c 120 "$X/argv-lang" 2>/dev/null | tr '\n' ' ')"; fi
    # u — DIE RETTUNG IN EINEM ZUG (Koordinator 06:38: push-pfade „-“ lief an der Radeon > 39 min, je Datei hash-object + Vergleich +
    # update-index — ~36 000 git-Starts für ~12 000 Pfade): 2 400 eigene Mess-Dateien im Baum, die der Ursprung nicht trägt — `ungepusht`
    # zählt sie, `push-pfade -` bringt sie in EINEM hash-object, EINEM ls-tree und EINEM update-index nach origin; Deckel 60 s je Schritt
    local u0 u1 u2 tu1 tu2 nu
    mkdir -p "$PM/meisterkarte-quelle/punkte/messung"
    node -e 'const fs=require("fs"),p=require("path"),d=process.argv[1];for(let i=0;i<2400;i++){const k=(0x10000000+i*7919).toString(16).slice(-8);fs.writeFileSync(p.join(d,k+"-radeon.json"),JSON.stringify({je:{["u.K"+i+"#1"]:{gruen:true}}})+"\n")}' "$(cygpath -m "$PM/meisterkarte-quelle/punkte/messung")"
    tu1=$(date +%s%N)
    u0=$(node "$RUNDE_CJS" ungepusht "$PM" punkte-maschine radeon "$X/u.seit" 2>/dev/null | cut -d' ' -f1)
    tu1=$((($(date +%s%N) - tu1) / 1000000))
    tu2=$(date +%s%N)
    node "$RUNDE_CJS" push-pfade "$PM" punkte-maschine radeon - "Rettung im Selbsttest" >"$X/u.out" 2>&1
    tu2=$((($(date +%s%N) - tu2) / 1000000))
    u1=$(node "$RUNDE_CJS" ungepusht "$PM" punkte-maschine radeon "$X/u.seit" 2>/dev/null | cut -d' ' -f1)
    nu=$(git -C "$X/pm.git" ls-tree --name-only punkte-maschine meisterkarte-quelle/punkte/messung/ | grep -c -- "-radeon.json$")
    if [ "${u0:-0}" -ge 2400 ] && [ "$u1" = 0 ] && [ "$nu" -ge 2400 ] && [ "$tu1" -le 60000 ] && [ "$tu2" -le 60000 ]; then
        echo "OK u  Rettung in einem Zug: ungepusht $u0 in $tu1 ms, push-pfade - brachte $u0 Pfade in $tu2 ms nach origin (Deckel je 60 s), danach 0"
    else echo "ROT u  Rettung: ungepusht vorher ${u0:-?} (Soll ≥ 2 400) in $tu1 ms, push-pfade $tu2 ms (Deckel 60 000), danach $u1 (Soll 0), am Ursprung $nu — $(tail -n 1 "$X/u.out" | cut -c1-100)"; fi
    command rm -rf "$X"
}
selbsttest() {
    local echt m r rot=0 mz=0 mr=0 O
    O=$(mktemp -d)
    # echt und jede Mutante in ihrem eigenen Sandkasten, nebeneinander
    for m in echt von-vorn rest warter pid reihe ziel bild still-push referenz-rechner liste-als-argument; do (st_lauf "${m#echt}" >"$O/$m" 2>&1) & done
    wait
    echt=$(grep -E "^(OK|ROT)" "$O/echt")
    echo "$echt" | sed 's/^/  /'
    echo "$echt" | grep -q "^ROT" && rot=1
    [ "$(echo "$echt" | grep -c "^OK")" = 13 ] || rot=1
    for m in von-vorn rest warter pid reihe ziel bild still-push referenz-rechner liste-als-argument; do
        mz=$((mz + 1))
        r=$(grep "^ROT" "$O/$m" | cut -c1-160)
        if [ -n "$r" ]; then mr=$((mr + 1)); echo "  Mutante „$m“ ROT an: $(echo "$r" | cut -c5-110 | tr '\n' '|' | sed 's/|$//;s/|/ · /g')"; else echo "  Mutante „$m“ bleibt GRÜN"; fi
    done
    rm -rf "$O"
    if [ $rot = 0 ] && [ $mr = $mz ]; then echo "radeon-dienst SELBSTTEST GRÜN: 13 Fälle grün, $mr/$mz Mutanten ROT"; return 0; fi
    echo "radeon-dienst SELBSTTEST ROT: Fälle $([ $rot = 0 ] && echo grün || echo ROT), $mr/$mz Mutanten ROT"
    return 1
}
[ "$1" = --selbsttest ] && { selbsttest; exit $?; }

schloss radeon || exit 0
log "START radeon-dienst (CI und Warter vor Messung, Fortsetzung bis nichts offen, PID $(cat "$S/radeon.pid"))"
f=0
while true; do
    takt
    sleep 60
done
