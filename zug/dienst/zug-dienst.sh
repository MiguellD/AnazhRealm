#!/bin/bash
# zug-dienst.sh — DER EINE ZUG-DIENST, ohne LLM (Konto 11, 10.11. 22:40; Blockade B3 des Blatts „großes Bild“: die
# Integrations-Maschine lebte unversioniert in /tmp und starb am 10.11. 21:52 mit dem Konto-Wechsel mitten im Bau von z374).
# EINE Schleife, ein Zug nach dem anderen: sammeln → bündeln → fahren (zug-sammler7 → fahre.sh) → urteilen und landen (zug-weiter3).
# Sie ersetzt zug-nie-leer → zug-schlange6 → das von Hand je Zug gestartete zug-weiter3 und jedes z<NNN>-hand.sh: niemand wartet mehr
# auf die Log-Zeile eines Vorgängers, und eine Hand-Fahrt neben dem Dienst gibt es nicht (das Schloss weist den Zweiten ab).
#
# BEREIT heißt, alles zugleich: der Kopf-Betreff beginnt mit „Abgabe“ · der Kopf stand noch in keinem Zug (zug-gefahren.txt: ein
# gefahrener Kopf fährt erst mit neuem Kopf wieder — kein Heil-Karussell) und steht nicht in main · Code-Check am Kopf GRÜN ·
# berührt der Zweig das Spiel oder trägt der Betreff [gpu-probe: …], dann die GPU-Probe am Kopf GRÜN („nie sichtbare Änderung ohne
# Bild landen“) · das Bündel ist konfliktfrei und seine WAND-SUMME GRÜN (wand-summe.sh). Nie -pm-Zweige. Höchstens 4 Zweige je Zug.
#
# ZUSTAND (in /tmp/claude/dienst, überlebt jeden Neustart): zug.nr = die jüngste Zug-Nummer · zug.fahrt = „<id> <zweig@sha> …“,
# solange ein Zug unterwegs ist. Stirbt der Dienst mitten im Zug, nimmt der nächste Start ihn wieder auf: mit Kandidat ab dem
# Urteil (FAHRT_WEITER), ohne Kandidat schließt er das Log und gibt die Köpfe frei.
# URTEIL ≠ MASCHINE: stirbt der Bau an der Maschine („zug bau FEHLER“), ist das kein Urteil über die Zweige — ihre Köpfe werden wieder
# frei (z374 am 10.11.: takt-gc und takt-gc-2 standen als „gefahren“, ohne je gebaut zu sein). Drei Maschinen-Fehler in Folge = ALARM
# im Puls, 15 min Halt.
# Aufruf: zug-dienst.sh [--blick]   (--blick druckt, was jetzt führe, und fährt nichts)
#         zug-dienst.sh --frei <zweig> …   (gefahrene Köpfe wieder frei geben: nur nach gemessenem Wackler an main)
# UNTER sh.exe (13.11.): jeder Prozess-Start unter dem installierten bash.exe kostet auf diesem Rechner 1–2,6 s, unter dem
# byte-gleichen sh.exe daneben 30–90 ms (fork-zeit: exec true, Subshell — das Sammeln des Zug-Diensts stand daran 11–18 min je Zug).
# Als sh gerufen schaltet die Zeile nur POSIX ab (volles bash); sonst startet sich das Skript EINMAL unter sh.exe neu.
case "$BASH" in */sh | */sh.exe) set +o posix ;; *) [ -x /usr/bin/sh ] && exec /usr/bin/sh "$0" "$@" ;; esac
D=$(cd "$(dirname "$0")" && pwd)
. "$D/gemein.sh"
L=$W/zug-nie-leer.log
G=$W/zug-gefahren.txt
touch "$G"
ZWEIGE="refs/heads/w27-* refs/heads/w28-*" # die alten w26-Abgaben fuhren und fielen schon — sie führe der Dienst als Karussell
blick="$1"
# --frei <zweig> …: die Köpfe eines Zweigs fahren wieder, ohne neuen Kopf — NUR wenn sein Zug an einer Wand fiel, die gemessen auch an
# main fällt (10.11. 23:45: z375 fiel am echt-Bein der GTX 1050; A main 1 von 2 rot, B Kandidat 1 von 2 rot → kein Täter im Zug)
if [ "$1" = "--frei" ]; then
    shift
    for b in "$@"; do
        grep -v "^$b " "$G" >"$G.neu"
        mv "$G.neu" "$G"
        echo "$(date +%H:%M) $b: Köpfe wieder frei (--frei)" >>"$L"
    done
    exit 0
fi
# taeter_anstoss <id> <lauf> <fahrt-log> — DIE TÄTER-SUCHE ALS EIGENER PROZESS NEBEN DER SCHLEIFE (20.11.): sie fährt bis zu 4 × 3
# Wände an der Karte (je Lauf GPU_LAUF_MAX_S=600, Frist 90 min über alles in zug.cjs) — hielte sie urteilen() an, stünde der Zug so
# lange. Sie startet wie die Kinder des Richters (richter.sh: `( … ) &` in der verborgenen Konsole der Schleife, kein neues Fenster),
# kehrt sofort zurück, und höchstens EINE läuft zugleich: die Sperre trägt die Windows-PID der Such-Hülle, gelesen von schleife_lebt
# (pid + Start, Abbild sh/bash) — eine tote oder neu vergebene PID zählt nie. TAETER_BEFEHL ersetzt den Ruf nur im Selbsttest.
TAETER_SPERRE=$W/zug-taeter.sperre
TAETER_ZEILEN="^(TÄTER |UNSCHULDIG|OHNE URTEIL|KEIN TÄTER AN DIESER KARTE|KEINE TÄTER-SUCHE|TÄTER-SUCHE ABGEBROCHEN|NEUER KOPF|zug taeter FEHLER)"
taeter_anstoss() {
    local id=$1 lauf=$2 f=$3 p
    p=$(tr -dc 0-9 2>/dev/null <"$TAETER_SPERRE")
    if schleife_lebt "$TAETER_SPERRE"; then
        echo "$(date +%H:%M) $id: Täter-Suche nicht gestartet — eine läuft schon (pid $p)" | tee -a "$W/zug-taeter.txt" >>"$L"
        return 0
    fi
    (
        cat /proc/$BASHPID/winpid >"$TAETER_SPERRE"
        if [ -n "$TAETER_BEFEHL" ]; then tz=$(sh -c "$TAETER_BEFEHL" </dev/null 2>&1)
        else tz=$(sh "$WZ/zug.sh" taeter "$id" --log "$f" --lauf "$lauf" </dev/null 2>&1); fi
        echo "$tz" | sed "s/^/$(date +%H:%M:%S) [$id] /" >>"$f"
        echo "$tz" | grep -E "$TAETER_ZEILEN" | sed "s/^/$(date +%H:%M) $id /" >>"$W/zug-taeter.txt"
        echo "$tz" | grep -E "$TAETER_ZEILEN" | grep -v "^KEINE TÄTER-SUCHE" | cut -c1-330 | sed "s/^/$(date +%H:%M) $id /" >>"$L"
        echo "$tz" | grep -qE "^(TÄTER |UNSCHULDIG|OHNE URTEIL|KEIN TÄTER AN DIESER KARTE|KEINE TÄTER-SUCHE|TÄTER-SUCHE ABGEBROCHEN)" ||
            echo "$(date +%H:%M) $id TÄTER-SUCHE ABGEBROCHEN: kein Urteil — $(echo "$tz" | tail -1 | cut -c1-200)" | tee -a "$W/zug-taeter.txt" >>"$L"
        rm -f "$TAETER_SPERRE"
    ) </dev/null &
    echo "$(date +%H:%M) $id: Täter-Suche angestoßen (eigener Prozess, Sperre $TAETER_SPERRE)" >>"$L"
}
# NACHGEGEBEN IST KEIN URTEIL — AN JEDEM KOPF (22.11.): die Probe wich einem Karten-Job der CI auf demselben Läufer („NACHGEGEBEN:
# Karten-Job „echt omen …“ wartet auf diesen Läufer“) und endet als „failure“ ohne Urteil (11.11.: w28-stadt-grammatik 4073fb2f
# wartete 100 min). Bis heute stieß der Dienst sie nur an Stempel-Köpfen neu an (ein Block in der Schleife von bereit(), der Lauf aus
# der ci.sh-Zeile „lauf:“) — an Vorprüf-Köpfen niemand: 22.11. 08:06 drei Proben (stufe-ein-auge, front-klang-koerper, front-technik),
# 09:31 stern-uhr 14655923, jede von Hand. EIN Takt, EINE Regel für jeden Kopf: nachgeben_neu liest die Probe-Posten der letzten 3 h.
# nachgeben_posten — die Posten in koordination (probe-post/<zweig>/<sha8>.md, gpu-probe.yml „Post nach koordination“), berührt in
# den letzten 3 h, deren ERSTE Zeile „# GPU-PROBE <sha8> — NACHGEGEBEN“ sagt; je Posten „<zweig> <sha8> <lauf>“. Der Lauf ist der,
# den der Posten selbst nennt (dritte Zeile „… · Lauf <url>/actions/runs/<id>“): der Lauf, der ihn schrieb — nie ein gesuchter
# (20.11.: die tote ci-runs.tmp gab den Lauf eines fremden Zweigs, der Anstoß fiel mit 403). Ein git log und ein git grep, je Takt.
NACHGEBEN_FRIST_S=1200
nachgeben_posten() {
    local p
    p=$(git -C $R log --since="3 hours ago" --format= --name-only origin/koordination -- probe-post/ 2>/dev/null |
        grep -E '^probe-post/.+/[0-9a-f]{8}[.]md$' | sort -u)
    [ -n "$p" ] || return 0
    git -C $R grep -n -E -e '^# GPU-PROBE [0-9a-f]{8} ' -e '/actions/runs/[0-9]+$' origin/koordination -- $p 2>/dev/null | awk '
        { s = $0; sub(/^origin\/koordination:/, "", s); i = index(s, ".md:"); f = substr(s, 1, i + 2); r = substr(s, i + 4)
          n = r; sub(/:.*/, "", n); z = substr(r, length(n) + 2) }
        n == 1 && z ~ /^# GPU-PROBE [0-9a-f]+ — NACHGEGEBEN/ { nach[f] = 1 }
        n == 3 { l = z; sub(/.*\/actions\/runs\//, "", l); lauf[f] = l }
        END { for (f in nach) { b = f; sub(/^probe-post\//, "", b); h = b; sub(/.*\//, "", h); sub(/[.]md$/, "", h); sub(/\/[^\/]*$/, "", b); print b, h, lauf[f] } }'
}
# die vier Rufe nach draußen — der Selbsttest ersetzt sie (Funktions-Überschreibung, kein Netz); der Token wird nie gedruckt
koord_abruf() { git -C $R fetch -q origin "+refs/heads/koordination:refs/remotes/origin/koordination" 2>/dev/null; }
# gelandet <sha40> — der Kopf ist Vorfahr von main (sein Stempel fuhr im Zug): seine Probe hat keinen Leser mehr
gelandet() { git -C $R merge-base --is-ancestor "$1" refs/remotes/origin/main 2>/dev/null; }
koepfe_abruf() { git -C $R ls-remote origin "$@" 2>/dev/null; }
lauf_neu() {
    local pt
    pt=$(printf 'protocol=https\nhost=github.com\n\n' | git -C $R credential fill 2>/dev/null | sed -n 's/^password=//p')
    curl -s -o /dev/null -w "%{http_code}" -X POST -H "Authorization: Bearer $pt" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/MiguellD/AnazhRealm/actions/runs/$1/rerun-failed-jobs"
}
# nachgeben_neu — einmal je Takt der Schleife: je NACHGEGEBEN-Posten, dessen Zweig-Kopf am Ursprung NOCH mit <sha8> beginnt (ein
# weitergezogener Kopf trägt seine eigene Probe), die gefallenen Jobs seines Laufs neu — je Kopf höchstens alle 20 min (Marke
# $W/probe-neu-<sha8>, ihre mtime ist die Frist). Ein ls-remote nur für die Zweige der Posten, nur wenn einer nachgab.
# EIN GELANDETER KOPF HAT KEINEN LESER (22.11. 16:26): der Vorprüf-Zweig leib-nah-ganz ecb439e6 blieb nach der Landung seines
# Stempels (z673) am Ursprung stehen, sein Posten sagte NACHGEGEBEN — der Takt stieß die Probe alle 20 min neu an (15:31, 16:26,
# je Anstoß eine Probe an einer Karte, die nachgab oder ohne Leser urteilte). Ein Kopf, der Vorfahr von main ist, fällt aus dem Takt.
nachgeben_neu() {
    local b h voll pl pm pc refs
    koord_abruf || { echo "$(date +%H:%M) nachgeben: Abruf von koordination scheiterte — kein Neu-Anstoß in diesem Takt" >>"$L"; return 0; }
    nachgeben_posten >"$W/nachgeben.posten"
    [ -s "$W/nachgeben.posten" ] || return 0
    refs=$(awk '{ print "refs/heads/" $1 }' "$W/nachgeben.posten")
    koepfe_abruf $refs >"$W/nachgeben.koepfe"
    [ -s "$W/nachgeben.koepfe" ] || { echo "$(date +%H:%M) nachgeben: ls-remote gab keinen Kopf für $(wc -l <"$W/nachgeben.posten") nachgegebene Posten — kein Neu-Anstoß in diesem Takt" >>"$L"; return 0; }
    awk 'FNR == NR { k[$2] = $1; next } substr(k["refs/heads/" $1], 1, 8) == $2 { print $1, $2, k["refs/heads/" $1], $3 }' "$W/nachgeben.koepfe" - <"$W/nachgeben.posten" >"$W/nachgeben.faellig"
    while read -r b h voll pl; do
        pm="$W/probe-neu-$h"
        [ -f "$pm" ] && [ $(($(date +%s) - $(mzeit "$pm"))) -le $NACHGEBEN_FRIST_S ] && continue
        touch "$pm"
        if gelandet "$voll"; then
            echo "$(date +%H:%M) $b $h: GPU-Probe NACHGEGEBEN, der Kopf ist in main gelandet — kein Neu-Anstoß" >>"$L"
            continue
        fi
        if [ -z "$pl" ]; then
            echo "$(date +%H:%M) $b $h: GPU-Probe NACHGEGEBEN, der Posten nennt keinen Lauf — kein Neu-Anstoß" >>"$L"
            continue
        fi
        pc=$(lauf_neu "$pl")
        echo "$(date +%H:%M) $b $h: GPU-Probe NACHGEGEBEN → neu angestoßen (Lauf $pl, HTTP $pc)" >>"$L"
    done <"$W/nachgeben.faellig"
}
# DIE NACHWACHE OHNE GERÄT (LANDUNG ≤ 10 MIN, 23.11.): nach der Landung fährt check.yml auf main die volle Batterie auf ubuntu, nie
# blockierend — der Zug wartet nicht auf sie und hält nie. nachwache_takt fragt höchstens alle NACHWACHE_FRIST_S (zug.sh nachwache:
# das Urteil des jüngsten fertigen Laufs auf main) und schreibt nur ein NEUES Urteil (je Wort und main-Kopf, Marke
# $W/nachwache.letzt): ins Dienst-Log, ein ROT dazu in die Täter-Spur ($W/zug-taeter.txt) — es nennt jede Landung seit dem letzten
# grünen main beim Namen. Den Puls trägt die Zeile, solange das Rot steht (nachwache_rot hängt sie an den Puls der Schleife).
# NACHWACHE_BEFEHL ersetzt den Ruf nur im Selbsttest.
NACHWACHE_FRIST_S=${NACHWACHE_FRIST_S:-300}
nachwache_takt() {
    local m=$W/nachwache.letzt nz k
    [ -f "$m.zeit" ] && [ $(($(date +%s) - $(mzeit "$m.zeit"))) -lt $NACHWACHE_FRIST_S ] && return 0
    touch "$m.zeit"
    if [ -n "$NACHWACHE_BEFEHL" ]; then nz=$(sh -c "$NACHWACHE_BEFEHL" </dev/null 2>&1)
    else nz=$(sh "$WZ/zug.sh" nachwache </dev/null 2>&1); fi
    nz=$(echo "$nz" | grep -E "^(NACHWACHE |zug nachwache FEHLER)" | tail -1 | cut -c1-600)
    [ -n "$nz" ] || return 0
    k=${nz%% (*}
    [ "$k" = "$(head -1 "$m" 2>/dev/null)" ] && return 0
    printf '%s\n%s\n' "$k" "$nz" >"$m"
    echo "$(date +%H:%M) $nz" >>"$L"
    case "$nz" in "NACHWACHE ROT"*) echo "$(date +%H:%M) $nz" >>"$W/zug-taeter.txt" ;; esac
}
# nachwache_rot — „ · NACHWACHE ROT main <sha8> …“ für den Puls, solange das jüngste Urteil der Nachwache rot ist
nachwache_rot() {
    case "$(sed -n 2p "$W/nachwache.letzt" 2>/dev/null)" in "NACHWACHE ROT"*) echo " · $(sed -n 2p "$W/nachwache.letzt" | cut -c1-200)" ;; esac
}
# --selbsttest-nachwache: ohne Netz — ein gestelltes Urteil; dasselbe Urteil schreibt nie zweimal, ein ROT geht in die Täter-Spur und
# an den Puls, die Frist hält den zweiten Ruf, ein neues Urteil am selben Kopf (nur die Klammer anders) schreibt nicht
if [ "$1" = "--selbsttest-nachwache" ]; then
    X=$(mktemp -d)
    W=$X L=$X/log NACHWACHE_FRIST_S=0
    n=0 ok=0
    pr() { n=$((n + 1)); if [ "$2" = 0 ]; then ok=$((ok + 1)); echo "OK   $1"; else echo "ROT  $1"; fi; }
    NACHWACHE_BEFEHL="echo 'NACHWACHE GRÜN main aaaa0000 (voll 18/18, Lauf 1)'"
    nachwache_takt; nachwache_takt
    pr "ein grünes Urteil steht einmal im Log" $([ "$(grep -c "NACHWACHE GRÜN main aaaa0000" "$X/log")" = 1 ] && [ ! -s "$X/zug-taeter.txt" ] && echo 0 || echo 1)
    NACHWACHE_BEFEHL="echo 'NACHWACHE ROT main bbbb0000 (Lauf 2: voll 3/18/Haus der Welt) · Landungen seit grünem main aaaa0000 (Lauf 1): w28-a@11111111'"
    nachwache_takt
    NACHWACHE_BEFEHL="echo 'NACHWACHE ROT main bbbb0000 (Lauf 2: voll 3/18/Haus der Welt) · Landungen seit grünem main aaaa0000 (Lauf 1): w28-a@11111111 · main cccc0000 fährt noch (Lauf 3)'"
    nachwache_takt
    pr "das Rot nennt die Landung in der Täter-Spur, einmal je main-Kopf" $([ "$(grep -c "NACHWACHE ROT main bbbb0000.*w28-a@11111111" "$X/zug-taeter.txt")" = 1 ] && [ "$(grep -c "NACHWACHE ROT" "$X/log")" = 1 ] && echo 0 || echo 1)
    pr "das Rot steht am Puls" $(nachwache_rot | grep -q "^ · NACHWACHE ROT main bbbb0000" && echo 0 || echo 1)
    NACHWACHE_FRIST_S=3600
    NACHWACHE_BEFEHL="echo 'NACHWACHE GRÜN main dddd0000 (voll 18/18, Lauf 4)'"
    nachwache_takt
    pr "die Frist hält den nächsten Ruf" $(grep -q "dddd0000" "$X/log" && echo 1 || echo 0)
    NACHWACHE_FRIST_S=0
    nachwache_takt
    pr "das neue Grün löst das Rot am Puls" $(grep -q "NACHWACHE GRÜN main dddd0000" "$X/log" && [ -z "$(nachwache_rot)" ] && echo 0 || echo 1)
    # ABGEBROCHEN IST KEIN URTEIL (26.11., Läufe 45764758296 und 45776471095; die Zeilen in der Form von zug.cjs nachwacheUrteil, dort
    # am gestellten Lauf geprüft): nur cancelled → eine eigene Zeile, die Täter-Spur bleibt leer, der Puls trägt kein ROT
    : >"$X/zug-taeter.txt"
    NACHWACHE_BEFEHL="echo 'NACHWACHE OHNE URTEIL main c0634d86 (Lauf 45776471095 abgelöst von main a954d698, Lauf 45776999999: 18 von 18 Jobs der Batterie abgebrochen, keiner rot)'"
    nachwache_takt
    pr "nur abgebrochene Jobs: OHNE URTEIL im Log, die Täter-Spur leer, kein ROT am Puls" $(grep -q "NACHWACHE OHNE URTEIL main c0634d86 (Lauf 45776471095 abgelöst von main a954d698" "$X/log" && [ ! -s "$X/zug-taeter.txt" ] && [ -z "$(nachwache_rot)" ] && echo 0 || echo 1)
    NACHWACHE_BEFEHL="echo 'NACHWACHE ROT main eeee0000 (Lauf 5: voll 4/18/Haus der Welt) · Landungen seit grünem main dddd0000 (Lauf 4): w28-b@22222222'"
    nachwache_takt
    pr "abgebrochen und ein failure: ROT am failure in der Täter-Spur und am Puls" $(grep -q "NACHWACHE ROT main eeee0000 (Lauf 5: voll 4/18/Haus der Welt)" "$X/zug-taeter.txt" && nachwache_rot | grep -q "^ · NACHWACHE ROT main eeee0000" && echo 0 || echo 1)
    rm -rf "$X"
    echo "zug-dienst selbsttest-nachwache: $ok von $n grün"
    [ $ok = $n ]
    exit
fi
# --selbsttest-taeter: ohne Karte — eine gestellte Suche (sleep) läuft, der Anstoß kehrt sofort zurück, eine zweite startet nicht,
# nach ihrem Ende (Sperre weg) und an einer toten PID startet sie wieder
if [ "$1" = "--selbsttest-taeter" ]; then
    X=$(mktemp -d)
    W=$X L=$X/log TAETER_SPERRE=$X/sperre
    n=0 ok=0
    pr() { n=$((n + 1)); if [ "$2" = 0 ]; then ok=$((ok + 1)); echo "OK   $1"; else echo "ROT  $1"; fi; }
    TAETER_BEFEHL="sleep 20; echo 'KEIN TÄTER AN DIESER KARTE (radeon): gestellt'"
    t0=$(date +%s)
    taeter_anstoss zT1 1 "$X/f1.log"
    dt=$(($(date +%s) - t0))
    pr "der Anstoß kehrt sofort zurück, während die Suche läuft (${dt} s)" $([ $dt -le 3 ] && echo 0 || echo 1)
    sleep 2
    pr "die Sperre trägt eine lebende PID (sh/bash, pid + Start)" $(schleife_lebt "$X/sperre" && echo 0 || echo 1)
    TAETER_BEFEHL="echo 'TÄTER zweite: darf nie laufen'"
    taeter_anstoss zT2 1 "$X/f2.log"
    sleep 1
    pr "eine zweite Suche startet nicht, solange die erste lebt" $(grep -q "zT2: Täter-Suche nicht gestartet — eine läuft schon" "$X/log" && [ ! -s "$X/f2.log" ] && echo 0 || echo 1)
    i=0; while [ -f "$X/sperre" ] && [ $i -lt 60 ]; do sleep 1; i=$((i + 1)); done
    pr "die erste schreibt ihr Urteil ins Fahrt-Log und gibt die Sperre frei" $(grep -q "\[zT1\] KEIN TÄTER AN DIESER KARTE" "$X/f1.log" && grep -q "zT1 KEIN TÄTER" "$X/zug-taeter.txt" && [ ! -f "$X/sperre" ] && echo 0 || echo 1)
    echo 4 >"$X/sperre"
    TAETER_BEFEHL="echo 'TÄTER-SUCHE ABGEBROCHEN: gestellt'"
    taeter_anstoss zT3 1 "$X/f3.log"
    i=0; while ! grep -q "zT3 TÄTER-SUCHE ABGEBROCHEN" "$X/zug-taeter.txt" 2>/dev/null && [ $i -lt 20 ]; do sleep 1; i=$((i + 1)); done
    pr "eine tote PID in der Sperre zählt nie — die Suche startet" $(grep -q "zT3 TÄTER-SUCHE ABGEBROCHEN: gestellt" "$X/zug-taeter.txt" && echo 0 || echo 1)
    wait
    rm -rf "$X"
    echo "zug-dienst selbsttest-taeter: $ok von $n grün"
    [ $ok = $n ]
    exit
fi
[ -n "$blick" ] || schloss zug || exit 0

# DAS SAMMELN KOSTET JE NEUEM KOPF, NIE JE ZWEIG (21.11.: 278 Stempel-Zweige, je Zweig mindestens ein grep gegen zug-gefahren.txt —
# unter Last kostet ein Prozess-Start am Laptop 1–3 s; das Sammeln stand 06:10 → 06:38 vor zwei bereiten Stempeln, z655 fuhr 38 min
# nach der Landung von z654). offene_koepfe <refs> <gefahren>: EIN awk über alle Zweige, dieselben Regeln wie zuvor je Zweig —
#   · ein -pm-Zweig zählt nie
#   · EIN KOPF FÄHRT EINMAL (14.11. z428: w28-ziel-plan-wip trug denselben Kopf 91ae94fe wie w28-ziel-plan, der Kandidat stand doppelt
#     im Bündel und kostete einen Ruf der Wand): ein -wip-Name weicht dem Zweig ohne -wip mit demselben Kopf, sonst zählt der erste
#     Name der Liste (auch wenn er schon fuhr)
#   · was mit diesem Kopf schon fuhr (zug-gefahren.txt „<zweig> <kopf>“), fällt
#   · was mit diesem Kopf für immer RUHT (zug-kopf-ruht.txt, dieselbe Form), fällt: ein Kopf, der in main oder der Punkte-Maschine
#     liegt, und ein Kopf, dessen Betreff keine Abgabe ist — beides ändert sich an demselben Kopf nie. Ohne das Register kosteten
#     31 solche Köpfe JEDE Runde je drei git-Rufe (cat-file, log, merge-base: am 21.11. je 4–8 s).
# Ausgabe „<kopf> <ref>“ je offenem Kopf, in der Reihe der Liste. Gemessen am lebenden Stand (278 Zweige, 285 gefahren): die Schleife
# je Zweig 187 s, das EINE awk 3 s, dieselben 31 Köpfe byte-gleich.
offene_koepfe() {
    [ -s "$1" ] || return 0
    awk -v G="$2" -v RUHT="$3" '
        BEGIN {
            while ((getline z < G) > 0) { split(z, a, " "); g[a[1] " " a[2]] = 1 }
            if (RUHT != "") while ((getline z < RUHT) > 0) { split(z, a, " "); g[a[1] " " a[2]] = 1 }
        }
        FNR == 1 { lauf++ }
        { b = $2; sub("^refs/heads/", "", b) }
        lauf == 1 { if (b !~ /-wip$/) fest[$1] = 1; next }
        b ~ /-pm$/ { next }
        b ~ /-wip$/ && ($1 in fest) { next }
        ($1 in kopf) { next }
        { kopf[$1] = 1 }
        ((b " " $1) in g) { next }
        { print $1, $2 }
    ' "$1" "$1"
}
# EIN KOPF, EINE ZEILE (21.11., z655/z656: der Puls „fährt“ stand 18 und 9,5 min NACH der Log-Zeile, die Fahrt begann erst danach):
# zug-nicht-gelandet.txt trug 361 Zeilen für 3 Köpfe (w28-ankunft-faden 130×, w28-feld-fuss 128×, w28-licht-kern 103× — jede Fahrt
# z455–z584 hängte denselben Kopf wieder an), `nicht_gelandet` fragte git je ZEILE zweimal: gemessen 564 s, vor JEDER Fahrt und in
# jedem Warte-Takt. Die Datei liest sich als Menge: je (Zweig, Kopf) die erste Zeile — der Preis hängt am Kopf, nie an der Zahl der
# Fahrten, die ihn nannten.
nicht_gelandet_koepfe() {
    [ -s "$1" ] || return 0
    awk '!(($1 " " $2) in g) { g[$1 " " $2] = 1; print }' "$1"
}
# --selbsttest-sammeln: ohne Karte, ohne Netz — die offenen Köpfe an einem gestellten Stand, jede Regel ein Zweig der Liste
if [ "$1" = "--selbsttest-sammeln" ]; then
    n=0 ok=0
    pr() { n=$((n + 1)); if [ "$2" = "$3" ]; then ok=$((ok + 1)); echo "OK   $1"; else echo "ROT  $1: »$2« statt »$3«"; fi; }
    X=$(mktemp -d)
    {
        printf 'aaa\trefs/heads/w28-a\n'          # fuhr schon mit diesem Kopf
        printf 'bbb\trefs/heads/w28-b\n'          # neu
        printf 'bbb\trefs/heads/w28-b-zwilling\n' # derselbe Kopf: der erste Name zählt
        printf 'ccc\trefs/heads/w28-c-wip\n'      # der -wip-Name weicht dem Namen ohne -wip
        printf 'ccc\trefs/heads/w28-c\n'
        printf 'ddd\trefs/heads/w28-d-wip\n'      # ein -wip-Name allein fährt
        printf 'eee\trefs/heads/w28-e-pm\n'       # die Punkte-Maschine fährt nie im Zug
        printf 'aaa\trefs/heads/w28-nach-a\n'     # derselbe Kopf wie der gefahrene erste Name
        printf 'fff\trefs/heads/w28-f\n'          # fuhr mit einem ANDEREN Kopf: der neue fährt
    } >"$X/refs"
    printf 'w28-a aaa\nw28-f f00\n' >"$X/gefahren"
    soll="bbb refs/heads/w28-b|ccc refs/heads/w28-c|ddd refs/heads/w28-d-wip|fff refs/heads/w28-f|"
    pr "die offenen Köpfe am gestellten Stand (9 Zweige, 4 offen)" "$(offene_koepfe "$X/refs" "$X/gefahren" | tr '\n' '|')" "$soll"
    pr "ohne gefahrenen Stand fährt auch der erste Name" "$(offene_koepfe "$X/refs" "$X/fehlt" | tr '\n' '|')" "aaa refs/heads/w28-a|$soll"
    printf 'w28-b bbb\nw28-d-wip d00\n' >"$X/ruht"
    pr "ein Kopf, der ruht, fällt samt seinem Zwilling; ein ANDERER Kopf desselben Zweigs fährt" "$(offene_koepfe "$X/refs" "$X/gefahren" "$X/ruht" | tr '\n' '|')" "ccc refs/heads/w28-c|ddd refs/heads/w28-d-wip|fff refs/heads/w28-f|"
    : >"$X/leer"
    pr "eine leere Liste gibt nichts" "$(offene_koepfe "$X/leer" "$X/gefahren" | tr '\n' '|')" ""
    # der Fall 21.11.: 361 Zeilen für 3 Köpfe — je Kopf die erste Zeile; ein NEUER Kopf desselben Zweigs ist eine eigene Zeile
    i=455
    while [ $i -le 584 ]; do
        echo "w28-ankunft-faden 49c7 z$i nicht im Kandidaten"
        [ $i -ge 456 ] && echo "w28-feld-fuss 92b8 z$i nicht im Kandidaten"
        [ $i -ge 482 ] && echo "w28-licht-kern 1062 z$i nicht im Kandidaten"
        i=$((i + 1))
    done >"$X/nicht"
    echo "w28-feld-fuss 77aa z585 nicht im Kandidaten" >>"$X/nicht"
    pr "nicht gelandet: $(grep -c . "$X/nicht") Zeilen lesen sich als 4 Köpfe, je die erste Fahrt" "$(nicht_gelandet_koepfe "$X/nicht" | cut -d' ' -f1-3 | tr '\n' '|')" "w28-ankunft-faden 49c7 z455|w28-feld-fuss 92b8 z456|w28-licht-kern 1062 z482|w28-feld-fuss 77aa z585|"
    pr "nicht gelandet: keine Datei gibt nichts" "$(nicht_gelandet_koepfe "$X/fehlt" | tr '\n' '|')" ""
    # NACHGEGEBEN AN JEDEM KOPF (22.11.): ein gestelltes koordination (git am Tisch, Posten im Format von gpu-probe.yml), die drei
    # Rufe nach draußen überschrieben — je Fall der Name im ROT. Die Frist läuft über die gestellte mtime der Marke, nie über Warten.
    R=$X/r W=$X/w L=$X/w/log
    mkdir -p "$R" "$W"
    posten() { # <zweig> <sha8> <urteil> <lauf>
        mkdir -p "$R/probe-post/$1"
        printf '# GPU-PROBE %s — %s\n\nZweig `%s` · Kopf %s00000000000000000000000000000000 · Läufer omen · 22.11. 09:31 · Wanduhr ab Push 900 s · Lauf https://github.com/MiguellD/AnazhRealm/actions/runs/%s\n\nRuf: `gate:x`\n\n## Läufer omen — %s\n\nNACHGEGEBEN: Karten-Job „echt omen“ wartet auf diesen Läufer\n' "$2" "$3" "$1" "$2" "$4" "$3" >"$R/probe-post/$1/$2.md"
    }
    git -C "$R" init -q
    posten alt-zweig 77770000 NACHGEGEBEN 100 # älter als 3 h: kein Takt sieht ihn
    git -C "$R" -c core.autocrlf=false add -A && GIT_COMMITTER_DATE="$(($(date +%s) - 4 * 3600)) +0100" git -C "$R" -c user.name=t -c user.email=t@t commit -q -m alt
    posten stern-uhr 14655923 NACHGEGEBEN 101                   # (1) Vorprüf-Kopf auf beliebigem Zweig
    posten w28-stempel bbbb2222 NACHGEGEBEN 102                 # (2) Stempel-Kopf
    posten w28-weiter cccc3333 NACHGEGEBEN 103                  # (3) der Kopf zog weiter
    posten front-rot eeee4444 ROT 104                           # (5) ROT
    posten front-gruen ffff5555 "GRÜN · ROT wie an main (bekannt): x" 105 # (5) GRÜN
    posten cloud/tief 99990000 NACHGEGEBEN 106                  # ein Zweig mit Schrägstrich
    posten leib-gelandet aaaa1111 NACHGEGEBEN 107               # (8) der Kopf ist Vorfahr von main
    git -C "$R" -c core.autocrlf=false add -A && git -C "$R" -c user.name=t -c user.email=t@t commit -q -m neu && git -C "$R" update-ref refs/remotes/origin/koordination HEAD
    koord_abruf() { :; }
    gelandet() { [ "$1" = aaaa111100000000000000000000000000000000 ]; }
    koepfe_abruf() {
        printf '%s\t%s\n' 1465592300000000000000000000000000000000 refs/heads/stern-uhr bbbb222200000000000000000000000000000000 refs/heads/w28-stempel \
            dddd444400000000000000000000000000000000 refs/heads/w28-weiter eeee444400000000000000000000000000000000 refs/heads/front-rot \
            ffff555500000000000000000000000000000000 refs/heads/front-gruen 9999000000000000000000000000000000000000 refs/heads/cloud/tief \
            7777000000000000000000000000000000000000 refs/heads/alt-zweig aaaa111100000000000000000000000000000000 refs/heads/leib-gelandet
    }
    lauf_neu() { echo "$1" >>"$X/neu"; echo 201; }
    : >"$X/neu"
    nachgeben_neu
    hat() { grep -qx "$1" "$X/neu" && echo 0 || echo 1; }
    fehlt() { grep -qx "$1" "$X/neu" && echo 1 || echo 0; }
    pr "nachgeben (1) Vorprüf-Kopf stern-uhr 14655923 NACHGEGEBEN → Neulauf" "$(hat 101)" 0
    pr "nachgeben (1) die Log-Zeile nennt Kopf, Lauf, HTTP" "$(grep -c "stern-uhr 14655923: GPU-Probe NACHGEGEBEN → neu angestoßen (Lauf 101, HTTP 201)" "$L")" 1
    pr "nachgeben (2) Stempel-Kopf w28-stempel NACHGEGEBEN → Neulauf" "$(hat 102)" 0
    pr "nachgeben (3) der Kopf zog weiter (dddd4444 statt cccc3333) → kein Neulauf" "$(fehlt 103)" 0
    pr "nachgeben (5) der Posten sagt ROT → kein Neulauf" "$(fehlt 104)" 0
    pr "nachgeben (5) der Posten sagt GRÜN → kein Neulauf" "$(fehlt 105)" 0
    pr "nachgeben (6) ein Zweig mit Schrägstrich (cloud/tief) → Neulauf" "$(hat 106)" 0
    pr "nachgeben (7) ein Posten älter als 3 h → kein Neulauf" "$(fehlt 100)" 0
    pr "nachgeben (8) der Kopf ist in main gelandet (leib-gelandet aaaa1111) → kein Neulauf" "$(fehlt 107)" 0
    pr "nachgeben (8) die Log-Zeile nennt den gelandeten Kopf" "$(grep -c "leib-gelandet aaaa1111: GPU-Probe NACHGEGEBEN, der Kopf ist in main gelandet — kein Neu-Anstoß" "$L")" 1
    : >"$X/neu"
    nachgeben_neu
    pr "nachgeben (4) zweiter Takt innerhalb von 20 min → kein zweiter Neulauf" "$(grep -c . "$X/neu")" 0
    touch -d "@$(($(date +%s) - 1260))" "$W/probe-neu-14655923"
    nachgeben_neu
    pr "nachgeben (4) nach 21 min (gestellte mtime der Marke) stößt der Takt wieder an" "$(tr '\n' ' ' <"$X/neu")" "101 "
    rm -rf "$X"
    echo "zug-dienst selbsttest-sammeln: $ok von $n grün"
    [ $ok = $n ]
    exit
fi
bereit() {
    : >"$W/zug-nie-leer.wartet"
    git -C $R fetch -q origin "+refs/heads/main:refs/remotes/origin/main" "+refs/heads/punkte-maschine:refs/remotes/origin/punkte-maschine" 2>/dev/null
    git -C $R ls-remote origin $ZWEIGE 2>/dev/null >"$W/zug-nie-leer.refs"
    # EIN ABRUF FÜR ALLE ZWEIGE (13.11. z424: das Sammeln stand 14:51:21 → 15:09:46 = 18 min vor einem Zug mit EINEM bereiten Zweig —
    # gemessen 11,2 s je Zweig-Abruf bei 128 Zweigen, alle auf einmal 17,3 s). Der Abruf je Zweig bleibt nur für den Kopf, der
    # zwischen ls-remote und diesem Abruf wanderte (sein Objekt fehlt dann noch).
    local z rs="" mh vr
    for z in $ZWEIGE; do rs="$rs +$z:refs/remotes/origin/${z#refs/heads/}"; done
    git -C $R fetch -q origin $rs 2>/dev/null
    # DER TÄTER DER VORAB-STATIK WARTET BEIM NAMEN (20.11., z631): zug-vorab-rot.txt trägt „<zweig> <kopf> <main8> <❌-Zeilen>“ — er
    # wurde nicht gefahren; er wird wieder gesammelt, sobald sein Kopf ODER main sich ändert (sein Rot hing an main oder an der
    # Kombination). Eine Zeile zu einem früheren main fällt hier.
    mh=$(git -C $R rev-parse -q --verify origin/main 2>/dev/null)
    if [ -s "$W/zug-vorab-rot.txt" ]; then
        awk -v m="$mh" 'index(m, $3) == 1' "$W/zug-vorab-rot.txt" >"$W/zug-vorab-rot.txt.neu"
        mv "$W/zug-vorab-rot.txt.neu" "$W/zug-vorab-rot.txt"
    fi
    local ruht="$W/zug-kopf-ruht.txt"
    offene_koepfe "$W/zug-nie-leer.refs" "$G" "$ruht" >"$W/zug-nie-leer.offen"
    while read -r sha ref; do
        b=${ref#refs/heads/}
        vr=$(grep "^$b $sha " "$W/zug-vorab-rot.txt" 2>/dev/null | tail -1)
        if [ -n "$vr" ]; then
            echo "$b ${sha:0:8}: VORAB-STATIK ROT am Bündel mit main $(echo "$vr" | cut -d' ' -f3) — fährt wieder mit neuem Kopf oder neuem main: $(echo "$vr" | cut -d' ' -f4- | cut -c1-400)" >>"$W/zug-nie-leer.wartet"
            continue
        fi
        git -C $R cat-file -e "$sha^{commit}" 2>/dev/null || git -C $R fetch -q origin "+$ref:refs/remotes/origin/$b" 2>/dev/null
        t=$(git -C $R log -1 --format=%s "$sha" 2>/dev/null)
        # EIN BETREFF, DER „Abgabe w2…" TRÄGT, ABER NICHT DAMIT BEGINNT, STEHT BEIM NAMEN IN DER WARTELISTE (13.11.: w28-guss-bruch
        # 789feed8 begann mit einem Backtick der PowerShell — der Dienst überging ihn seit dem Morgen wortlos, niemand sah ihn warten)
        case "$t" in
            Abgabe*) ;;
            *"Abgabe w2"*)
                git -C $R merge-base --is-ancestor "$sha" origin/main 2>/dev/null ||
                    echo "$b ${sha:0:8}: der Betreff BEGINNT nicht mit »Abgabe« (er beginnt mit »${t:0:14}«) — der Zug sieht ihn nicht" >>"$W/zug-nie-leer.wartet"
                continue
                ;;
            *)
                # nur ein GELESENER Betreff ruht: ein leerer hieße, der Kopf fehlt noch — er wird wieder angesehen
                [ -n "$t" ] && echo "$b $sha" >>"$ruht"
                continue
                ;;
        esac
        # jede neu gesehene Abgabe steht EINMAL in w3/abgabe.log (der Blick liest ABGABEN und STAU daraus; die alte Abgabe-Wache starb)
        grep -q " ABGABE $b ${sha:0:8} " "$T/w3/abgabe.log" 2>/dev/null || echo "$(date +%H:%M) ABGABE $b ${sha:0:8} ${t#Abgabe }" >>"$T/w3/abgabe.log"
        git -C $R merge-base --is-ancestor "$sha" origin/main 2>/dev/null && { echo "$b $sha" >>"$ruht"; continue; }
        # ein Zweig der Punkte-Maschine OHNE die Endung -pm, der dort schon liegt, ist gelandet — er hat keinen Code-Check (sein Baum
        # trägt keine check.yml) und stand sonst für immer als „Code-Check nicht GRÜN ()“ in der Warteliste (11.11.: w28-r6-konsum
        # eec204c0 lag seit 11:53 in punkte-maschine und galt den ganzen Tag als wartend)
        git -C $R merge-base --is-ancestor "$sha" origin/punkte-maschine 2>/dev/null && { echo "$b $sha" >>"$ruht"; continue; }
        # DER STEMPEL ERBT ÜBER DEN BAUM (26.11., zug-erbt-baum; z747–z749 Stempel → fährt 24 · 44 · 21 min, je Stempel 5 + 3 Jobs in der
        # GitHub-Reihe für ein Urteil, das am Elter schon stand): ein Abgabe-Kopf ohne Inhalt (EIN Elter, derselbe Baum) startet in
        # check.yml und gpu-probe.yml keinen Job mehr — sein Urteil liest `zug.sh erbe` an der Kette (Gesetz und Linse dort). ERBE GRÜN
        # trägt die Zeilen „Code-Check:“ · „voll:“ · „GPU-Probe:“ des Elters in der Form von ci.sh, der Rest unten liest sie wie bisher;
        # ERBE WARTET steht beim Namen (abgebrochen ist kein Urteil); nur ERBE KEINS (Inhalt, Merge) fragt ci.sh am eigenen SHA.
        e=$(sh "$WZ/zug.sh" erbe "$b@$sha" </dev/null 2>&1)
        case "$e" in
        "ERBE GRÜN "*) c=$e ;;
        "ERBE WARTET "*)
            echo "$b ${sha:0:8}: $(echo "$e" | head -1 | cut -c13-400)" >>"$W/zug-nie-leer.wartet"
            continue ;;
        "ERBE KEINS "*) c=$(sh "$D/ci.sh" "$b" </dev/null 2>&1) ;;
        *)
            echo "$b ${sha:0:8}: das Erbe urteilte nicht — $(echo "$e" | tail -1 | cut -c1-200)" >>"$W/zug-nie-leer.wartet"
            continue ;;
        esac
        echo "$c" | grep "Code-Check:" | head -1 | grep -q "completed success" || {
            # ein Abgabe-Kopf MIT Inhalt fährt keine CI (check.yml STEMPEL): der Grund des Erbes steht dabei, der Inhalt gehört in
            # einen Vorprüf-Kopf, der Stempel darauf erbt
            echo "$b ${sha:0:8}: Code-Check nicht GRÜN ($(echo "$c" | grep "Code-Check:" | head -1 | cut -c1-80)) · $(echo "$e" | head -1 | cut -c12-200)" >>"$W/zug-nie-leer.wartet"
            # ein ROTER Check geht sofort heim (heim.sh: der rote Text je Kopf EINMAL in cloud-post/<zweig>.md)
            echo "$c" | grep "Code-Check:" | head -1 | grep -q "completed failure" && sh "$D/heim.sh" "$b" "$sha" </dev/null >/dev/null 2>&1
            continue
        }
        # DIE VOLLE BATTERIE VOR DEM ZUG IST EINE WAND, KEIN WUNSCH (12.11. z407: w28-strauch-gestalt und w28-laub-deckung trugen kein
        # [ci voll], ihr Puls war grün, die volle Batterie sah sie erst im Zug — 67 min, drei Zweige, nichts gelandet). Bereit ist nur,
        # wessen Kopf einen grünen Lauf MIT allen Gruppen der vollen Batterie trägt („voll: n/n“, ci.sh). Fehlt er, stößt der Dienst
        # ihn selbst an (workflow_dispatch fährt voll, check.yml VOLL_WENN) — je Kopf einmal; kein Macher muss an die Marke denken.
        echo "$c" | grep -qE "^    voll: ([1-9][0-9]*)/\1$" || {
            vm="$W/voll-neu-${sha:0:8}"
            if [ ! -f "$vm" ]; then
                PT=$(printf 'protocol=https\nhost=github.com\n\n' | git -C $R credential fill 2>/dev/null | sed -n 's/^password=//p')
                pc=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Authorization: Bearer $PT" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/MiguellD/AnazhRealm/actions/workflows/check.yml/dispatches" -d "{\"ref\":\"$b\"}")
                touch "$vm"
                echo "$(date +%H:%M) $b ${sha:0:8}: der Puls ist grün, die volle Batterie fehlt → angestoßen (HTTP $pc)" >>"$L"
            fi
            echo "$b ${sha:0:8}: die volle Batterie fehlt am Kopf (angestoßen, der Zug wartet auf ihr Urteil)" >>"$W/zug-nie-leer.wartet"
            continue
        }
        # DAS PROBE-TAG AM BAU-PFAD (20.11., z637): fasst der Beitrag Sicht, Tiefe, Siedlung oder Ankunft an, trägt sein [gpu-probe: …]-Tag
        # die Wände, die sonst nur am Kandidaten fahren (echt omen) — die Pfade und Wände stehen an EINER Stelle (zug.cjs PROBE_PFLICHT);
        # fehlt eine, wartet der Kopf mit dem Grund beim Namen, statt einen ganzen Zug an ihr fallen zu lassen
        pt=$(sh "$WZ/zug.sh" probe-tag "$b@$sha" </dev/null 2>&1)
        # mehr als 3 Proben im Tag fallen am Einlass (gpu-probe.yml) — ROT beim Namen, kein Warten: nur ein neuer Kopf heilt es
        case "$pt" in
        "PROBE-TAG OK") ;;
        "PROBE-TAG ROT: "*)
            echo "$b ${sha:0:8}: PROBE-TAG ROT — ${pt#PROBE-TAG ROT: }" >>"$W/zug-nie-leer.wartet"
            grep -q " $b ${sha:0:8} PROBE-TAG ROT" "$L" 2>/dev/null || echo "$b ${sha:0:8} PROBE-TAG ROT — ${pt#PROBE-TAG ROT: }" | sed "s/^/$(date +%H:%M) /" >>"$L"
            continue ;;
        *)
            echo "$b ${sha:0:8}: ${pt#PROBE-TAG FEHLT: }" >>"$W/zug-nie-leer.wartet"
            continue ;;
        esac
        # das Bild ist Pflicht, sobald der Zweig das SPIEL berührt — auch ohne Tag im Betreff
        sp=$(git -C $R diff --name-only "origin/main...$sha" 2>/dev/null | grep -cE "^(stamm/|worlds/|index[.]html$|[^/]+[.]js$)")
        case "$t" in *"[gpu-probe:"*) sp=1 ;; esac
        [ "$sp" -gt 0 ] && {
            echo "$c" | grep "GPU-Probe" | head -1 | grep -q "completed success" || {
                echo "$b ${sha:0:8}: GPU-Probe nicht GRÜN ($(echo "$c" | grep "GPU-Probe" | head -1 | cut -c1-110))" >>"$W/zug-nie-leer.wartet"
                # eine NACHGEGEBENE Probe stößt nachgeben_neu im Takt der Schleife neu an — für jeden Kopf, nicht nur hier
                continue
            }
        }
        echo "$b"
    done <"$W/zug-nie-leer.offen"
}
# vorn <zweige> — DIE VORRANG-LISTE ($W/zug-zuerst.txt, je Zeile ein Zweig): was eine Wand der Züge heilt, fährt im NÄCHSTEN Zug, nie
# hinter dem Alphabet (11.11.: w28-frost-rand heilte die Wand, an der z379 dreimal fiel, und wäre hinter vier w27-Zweigen draußen
# geblieben — der Zug wäre an derselben Stelle wieder gefallen). Ein gelandeter Zweig steht nicht mehr unter den Bereiten.
vorn() {
    # die Reihe der DATEI gilt (11.11. 04:10: bis dahin die Reihe der Bereiten, alphabetisch — w28-frost-rand stand vor w28-wand-zug,
    # fiel allein am alten Gesetz der Wand, und der erste Durchgang füllte den Zug ohne ihn auf vier)
    local v="" r="" b z
    for z in $(cat "$W/zug-zuerst.txt" 2>/dev/null); do case " $1 " in *" $z "*) v="$v $z" ;; esac; done
    for b in $1; do case " $v " in *" $b "*) ;; *) r="$r $b" ;; esac; done
    echo $v $r
}
buendel() { # die ersten acht Bereiten fahren zusammen (15.11.: bis dahin vier, meist fuhr EINER — 30 min je Zug, 7 Abgaben standen davor). Die Vorprüfung an der Wachstums-Wand (wand-summe.sh --nur-buendel) FIEL am
    # 15.11.: die Wand urteilt ohnehin am Kandidaten im Zug, und der Sammler fährt danach noch Statik und playtest:fast am
    # Bündel. (Der Grund im Commit 01d846aa, sie habe dreimal gehangen, war falsch gelesen: ihre Prozesse hängen unter
    # Windows nicht am Elter des Dienstes — sie lief unter Last nur langsam.)
    echo $1 | cut -d' ' -f1-8
}
frei_geben() { # <zweig@sha> … — die Köpfe eines Zugs, über den kein Urteil fiel, fahren wieder
    local z
    for z in "$@"; do grep -v "^${z%@*} ${z#*@}$" "$G" >"$G.neu"; mv "$G.neu" "$G"; done
}
infra=0
urteilen() { # <id> <zweig@sha> … — schreibt das Urteil [<id>w], landet bei GRÜN, gibt bei Maschinen-Fehler die Köpfe frei
    local id=$1 F=$T/fahre-$1.log O=$T/fahre-${1}w.log u
    shift
    if grep -qE "\[$id\] (GELANDET|FAHRT ROT)" "$F" 2>/dev/null; then
        puls zug "$id urteilt"
        sh "$D/zug-weiter3.sh" "$id" >"$T/w3/zug-weiter-$id.out" 2>&1
    else
        echo "$(date +%H:%M:%S) [${id}w] FAHRT ROT ohne Fahrt — $(grep -v EXIT= "$T/w3/kette-$id.out" 2>/dev/null | tail -1 | cut -c1-200)" >>"$O"
    fi
    u=$(grep -E "\[${id}w\] (GELANDET|FAHRT ROT)" "$O" 2>/dev/null | tail -1)
    echo "$(date +%H:%M) $id ende: ${u:0:200}" >>"$L"
    # DER ROTE TEXT STEHT BEIM URTEIL (z380): je rotem Job seine ❌-Zeilen in $W/zug-rot-<id>.txt, die ersten im Protokoll — der Täter
    # ist dann lesbar, bevor jemand halbiert (rot-text.cjs)
    case "$u" in *"FAHRT ROT"*)
        local lauf; lauf=$(grep -hoE "Lauf [0-9]{8,}" "$F" "$O" 2>/dev/null | tail -1 | grep -oE "[0-9]{8,}")
        if [ -n "$lauf" ]; then
            TOKEN=$(printf 'protocol=https\nhost=github.com\n\n' | git -C $R credential fill 2>/dev/null | sed -n 's/^password=//p') \
                node "$D/rot-text.cjs" "$lauf" >"$W/zug-rot-$id.txt" 2>&1
            grep -E "^ROT |❌" "$W/zug-rot-$id.txt" | head -6 | cut -c1-330 | sed "s/^/$(date +%H:%M) $id rot: /" >>"$L"
        fi
        # DER TÄTER AN DEN ECHT-WÄNDEN (20.11., z637: 70 min Handsuche, drei Unschuldige bekamen von Hand neue Köpfe): fiel ein echt-Job,
        # fährt zug.cjs taeter je Stempel allein jede rote echt-Wand an der Radeon (gpu-lauf.sh, Deckel 4 × 3, je Lauf 600 s, Frist 90 min) als eigener Prozess, schreibt je
        # Stempel EINE Zeile TÄTER/UNSCHULDIG ins Fahrt-Log und nach zug-taeter.txt und setzt den Unschuldigen neue Köpfe — nur, wenn ein
        # Täter steht. Ein Abbruch steht als „TÄTER-SUCHE ABGEBROCHEN: <grund>“, und kein Kopf wird gesetzt.
        # LANDUNG ≤ 10 MIN (23.11.): kein Zug-Lauf trägt mehr ein echt-Bein (check.yml: echt nur auf Abruf, gate:ci-deckung (E)) —
        # aus dem Zug stößt diese Zeile nie mehr an; die Suche bleibt der Ruf von Hand (zug.sh taeter) an einem Lauf mit rotem Bein.
        if [ -n "$lauf" ] && grep -q "^ROT echt" "$W/zug-rot-$id.txt" 2>/dev/null; then
            puls zug "$id stößt die Täter-Suche an den echt-Wänden an (Radeon, eigener Prozess)"
            taeter_anstoss "$id" "$lauf" "$F"
        fi ;;
    esac
    if grep -q "zug bau FEHLER" "$F" 2>/dev/null; then
        infra=$((infra + 1))
        frei_geben "$@"
        echo "$(date +%H:%M) $id: der Bau starb an der MASCHINE (kein Urteil über die Zweige) — Köpfe wieder frei: $*" >>"$L"
    elif grep -q "WACHSTUMS-WAND" "$W/zug-rot-$id.txt" 2>/dev/null; then
        # das Fenster des TAGES trug den Zug nicht — es rollt (z378 am 11.11.: Vorprüfung 02:07 GRÜN, Bau 02:16 ROT um 217 Atome). Das ist
        # kein Urteil über die Zweige: die Köpfe fahren wieder, und die Vorprüfung (wand-summe) hält sie draußen, bis der Tag sie trägt.
        # Seit 13.11. urteilt die Wand im Puls am Kandidaten (puls 1 Statik), nicht mehr im Bau — ihr Text steht im roten Text des Zugs
        infra=0
        frei_geben "$@"
        echo " $*" >"$W/zug-wand-fiel.txt" # dasselbe Bündel fährt nicht zweimal an die Wand (die Schleife unten liest die Zeile)
        echo "$(date +%H:%M) $id: fiel am Fenster des Tages (Wachstums-Wand, kein Urteil über die Zweige) — Köpfe wieder frei: $*" >>"$L"
    else infra=0; fi
    # DIE LANDUNG WIRD NACHGEWIESEN, je Zweig (z390, 11.11.: „GELANDET“ über w28-ziel-plan, der an der Statik-Probe fiel und nie im
    # Kandidaten stand — zwei Tage still verloren): GELANDET nur, wessen Kopf Vorfahr von origin/main ist; wer nicht im Kandidaten
    # stand (oder im Kandidaten eines gelandeten Zugs, aber nicht in main), ist FREI — fiel er ALLEIN, war das sein Urteil (kein
    # Karussell, zug.cjs nachweisUrteil) —, beim Namen im Log, sein Kopf fährt wieder, und
    # der Puls nennt ihn (zug-nicht-gelandet.txt), bis er landet oder einen neuen Kopf trägt
    local gl="" nw z
    case "$u" in *GELANDET*) gl=--gelandet ;; esac
    nw=$(sh "$WZ/zug.sh" nachweis $gl --log "$F" --log "$T/w3/kette-$id.out" "$@" 2>&1)
    echo "$nw" | grep "^NACHWEIS FREI" | while read -r _ _ z rest; do
        frei_geben "$z"
        echo "$(date +%H:%M) $id NICHT GELANDET ${z%@*} ${z#*@}: ${rest#— } — Kopf wieder frei" >>"$L"
        echo "${z%@*} ${z#*@} $id ${rest#— }" >>"$W/zug-nicht-gelandet.txt"
    done
    # KOPF-EIGEN GEHT HEIM, NICHT IN DEN KREIS (16.11., z582–z585: drei Köpfe fielen 361-mal am Siegel-Wort ihres eigenen Verlaufs und
    # wurden je Zug wieder frei): zug.cjs nennt den Fall GEURTEILT · kopf-eigen, der Kopf bleibt gefahren und geht EINMAL heim
    echo "$nw" | grep "^NACHWEIS GEURTEILT .* — kopf-eigen: " | while read -r _ _ z rest; do
        sh "$D/heim.sh" "${z%@*}" "${z#*@}" "${rest#— kopf-eigen: }" </dev/null >/dev/null 2>&1
        echo "$(date +%H:%M) $id KOPF-EIGEN ${z%@*} ${z#*@}: ${rest#— kopf-eigen: } — bleibt draussen bis zu einem neuen Kopf" >>"$L"
    done
    # VORAB GEHT NICHT IN DEN KREIS UND NICHT IN „NICHT GELANDET“ (20.11., z631): der Täter der Vorab-Statik wurde nicht gefahren —
    # sein Kopf wird frei, und zug-vorab-rot.txt hält ihn wartend (bereit), bis sein Kopf oder main sich ändert
    echo "$nw" | grep "^NACHWEIS VORAB " | while read -r _ _ z mb _ rest; do
        frei_geben "$z"
        echo "${z%@*} ${z#*@} $mb $rest" >>"$W/zug-vorab-rot.txt"
        echo "$(date +%H:%M) $id VORAB-STATIK ${z%@*} ${z#*@}: nicht gefahren (main $mb) — wartet auf neuen Kopf oder neues main: ${rest:0:300}" >>"$L"
    done
    # main allein rot an der Vorab-Statik: kein Täter im Zug, er fuhr wie bisher — der Puls nennt es, solange main dieser Kopf ist
    grep -h "VORAB-STATIK MAIN ROT" "$F" 2>/dev/null | tail -1 | sed "s/^ *//" >"$W/zug-vorab-main.txt"
    [ -s "$W/zug-vorab-main.txt" ] && echo "$(date +%H:%M) $id $(cut -c1-300 "$W/zug-vorab-main.txt")" >>"$L"
    echo "$nw" | grep -q "^NACHWEIS" || echo "$(date +%H:%M) $id nachweis: kein Ergebnis — $(echo "$nw" | tail -1 | cut -c1-200)" >>"$L"
    rm -f "$S/zug.fahrt"
}
# nicht_gelandet — die Zweige, die ein Zug als gefahren führte, ohne dass ihr Kopf in main liegt (zug-nicht-gelandet.txt); eine Zeile
# fällt, sobald ihr Kopf in main liegt oder der Zweig einen neuen Kopf trägt
nicht_gelandet() {
    local f="$W/zug-nicht-gelandet.txt" b s id rest k out=""
    [ -s "$f" ] || { vorab_main; return 0; }
    nicht_gelandet_koepfe "$f" >"$f.eins"
    : >"$f.neu"
    while read -r b s id rest; do
        git -C $R merge-base --is-ancestor "$s" origin/main 2>/dev/null && continue
        k=$(git -C $R rev-parse -q --verify "refs/remotes/origin/$b" 2>/dev/null)
        [ -n "$k" ] && [ "${k:0:8}" != "${s:0:8}" ] && continue
        echo "$b $s $id $rest" >>"$f.neu"
        out="$out $b($id)"
    done <"$f.eins"
    rm -f "$f.eins"
    mv "$f.neu" "$f"
    [ -n "$out" ] && echo " · NICHT GELANDET:$out"
    vorab_main
}
# vorab_main — main allein rot an der Vorab-Statik (zug-vorab-main.txt, aus dem letzten Bau: „VORAB-STATIK MAIN ROT <main8> …“),
# genannt im Puls, solange main dieser Kopf ist
vorab_main() {
    local vm
    vm=$(cut -d' ' -f4 "$W/zug-vorab-main.txt" 2>/dev/null)
    [ -n "$vm" ] || return 0
    case "$(git -C $R rev-parse -q --verify origin/main 2>/dev/null)" in "$vm"*) echo " · MAIN $vm ROT an der Vorab-Statik:$(cut -d: -f2- "$W/zug-vorab-main.txt" | cut -c1-160)" ;; esac
}

[ -n "$blick" ] && {
    B=$(bereit | tr "\n" " ")
    Z=""
    [ -n "$B" ] && Z=$(buendel "$B")
    echo "führe jetzt: ${Z:-nichts} · bereit: ${B:-nichts}"
    echo "wartend:"
    cat "$W/zug-nie-leer.wartet"
    exit 0
}

n=$(cat "$S/zug.nr" 2>/dev/null)
[ -n "$n" ] || n=$(ls $T/fahre-z*.log 2>/dev/null | sed -n 's/.*fahre-z\([0-9]*\)\.log$/\1/p' | sort -n | tail -1)
echo "$(date +%H:%M) zug-dienst START (jüngster Zug z$n, PID $(cat "$S/zug.pid"))" >>"$L"

# WIEDERAUFNAHME: ein Zug war unterwegs, als der Dienst starb
if [ -s "$S/zug.fahrt" ]; then
    read -r id rest <"$S/zug.fahrt"
    F=$T/fahre-$id.log
    if grep -qE "\[$id\] (GELANDET|FAHRT ROT)" "$F" 2>/dev/null; then
        :
    elif K=$(grep -oE "Kandidat [0-9a-f]{40}" "$F" 2>/dev/null | tail -1 | cut -d' ' -f2) && [ -n "$K" ]; then
        echo "$(date +%H:%M) $id WIEDERAUFNAHME am Kandidaten ${K:0:8} (ab dem Urteil)" >>"$L"
        puls zug "$id Wiederaufnahme am Kandidaten ${K:0:8}"
        (cd $R && FAHRT_WEITER=$K sh "$WZ/fahre.sh" "$id" $rest >>"$F" 2>&1)
    else
        echo "$(date +%H:%M:%S) [$id] FAHRT ROT bau: kein Kandidat (zug bau FEHLER: der Dienst endete vor dem Bau)" >>"$F"
    fi
    urteilen "$id" $rest
fi

while true; do
    if [ $infra -ge 3 ]; then
        puls zug "ALARM: 3 Bauten in Folge an der Maschine gestorben — hält 15 min (Log: fahre-z$n.log)"
        sleep 900
        infra=0
    fi
    # DIE PACKS BLEIBEN KLEIN (15.11.: 18 538 Pack-Dateien im Haupt-Klon, jeder git-Ruf 9,2 s — `maintenance.auto=false` lässt je fetch
    # ein Pack zurück, rund 200 je Stunde; nach dem Falten 28 Packs und 0,07 s je Ruf). Über 300 Packs faltet der Dienst zwischen zwei
    # Zügen geometrisch — das löscht nur überzählige Pack-Dateien, kein Objekt.
    packs=$(ls "$R/.git/objects/pack/" 2>/dev/null | grep -c ".pack$")
    if [ "${packs:-0}" -gt 300 ]; then
        puls zug "faltet $packs Pack-Dateien (git repack --geometric)"
        git -C $R -c pack.threads=4 repack --geometric=2 -d --write-midx </dev/null >"$S/repack.log" 2>&1
        echo "$(date +%H:%M) Packs gefaltet: $packs → $(ls "$R/.git/objects/pack/" 2>/dev/null | grep -c ".pack$")" >>"$L"
    fi
    nachgeben_neu
    nachwache_takt
    puls zug "sammelt (jüngster Zug z$n)$(nachwache_rot)"
    B=$(bereit | tr "\n" " ")
    B=$(vorn "$B")
    Z=""
    [ -n "$B" ] && Z=$(buendel "$B")
    # EIN BEREITER ZWEIG FÄHRT SOFORT (LANDUNG ≤ 10 MIN, 23.11.): bis hier wartete ein einzelner bereiter Zweig bis zweimal 5 min auf
    # andere (12.11. z409), weil jeder Zug jede Karte einen echt-Job von ~15 min kostete — die Karten fahren in keinem Zug mehr, ein
    # Zug kostet kopf und Puls (~5 min), der nächste nimmt mit, was dann bereit ist.
    if [ -z "$Z" ]; then
        puls zug "wartet auf bereite Abgaben ($(grep -c . "$W/zug-nie-leer.wartet") wartend, jüngster Zug z$n)$(nicht_gelandet)$(nachwache_rot)"
        sleep 300
        continue
    fi
    # DASSELBE BÜNDEL FÄHRT NICHT ZWEIMAL AN DIE WAND (15.11., z451: drei grüne Abgaben fielen am Linsen-Maß des Zugs — seit die
    # Vorprüfung fiel, wäre dasselbe Bündel im Kreis gefahren, je Runde ~30 min): es fährt wieder, sobald ein Zweig dazukommt (der
    # die Wand heilt oder Spiel mitbringt) oder ein Kopf sich ändert
    key=""
    for b in $Z; do key="$key $b@$(git -C $R rev-parse "origin/$b")"; done
    if [ "$key" = "$(cat "$W/zug-wand-fiel.txt" 2>/dev/null)" ]; then
        puls zug "wartet: dieses Bündel fiel an der Wachstums-Wand — fährt wieder mit einem weiteren Zweig oder neuem Kopf ($Z)"
        sleep 300
        continue
    fi
    n=$((n + 1))
    id=z$n
    echo $n >"$S/zug.nr"
    zs=""
    for b in $Z; do
        s=$(git -C $R rev-parse "origin/$b")
        echo "$b $s" >>"$G"
        zs="$zs $b@$s"
    done
    echo "$id$zs" >"$S/zug.fahrt"
    echo "$(date +%H:%M) $id fährt: $Z · bereit waren: $B · wartend: $(tr "\n" "|" <"$W/zug-nie-leer.wartet" | cut -c1-600)" >>"$L"
    puls zug "$id fährt: $Z$(nicht_gelandet)"
    (cd "$T/w3" && sh "$D/zug-sammler7.sh" "$id" 25 $Z >"$T/w3/kette-$id.out" 2>&1)
    echo "$id EXIT=$?" >>"$T/w3/kette-$id.out"
    urteilen "$id" $zs
done
