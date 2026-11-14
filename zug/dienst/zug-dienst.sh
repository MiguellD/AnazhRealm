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
[ -n "$blick" ] || schloss zug || exit 0

bereit() {
    : >"$W/zug-nie-leer.wartet"
    git -C $R fetch -q origin "+refs/heads/main:refs/remotes/origin/main" "+refs/heads/punkte-maschine:refs/remotes/origin/punkte-maschine" 2>/dev/null
    git -C $R ls-remote origin $ZWEIGE 2>/dev/null >"$W/zug-nie-leer.refs"
    # EIN ABRUF FÜR ALLE ZWEIGE (13.11. z424: das Sammeln stand 14:51:21 → 15:09:46 = 18 min vor einem Zug mit EINEM bereiten Zweig —
    # gemessen 11,2 s je Zweig-Abruf bei 128 Zweigen, alle auf einmal 17,3 s). Der Abruf je Zweig bleibt nur für den Kopf, der
    # zwischen ls-remote und diesem Abruf wanderte (sein Objekt fehlt dann noch).
    local z rs="" kopf=""
    for z in $ZWEIGE; do rs="$rs +$z:refs/remotes/origin/${z#refs/heads/}"; done
    git -C $R fetch -q origin $rs 2>/dev/null
    while read -r sha ref; do
        b=${ref#refs/heads/}
        case "$b" in *-pm) continue ;; esac
        # EIN KOPF FÄHRT EINMAL (14.11. z428: w28-ziel-plan-wip trug denselben Kopf 91ae94fe wie w28-ziel-plan, der Kandidat stand
        # doppelt im Bündel und kostete einen Ruf der Wand): ein -wip-Name weicht dem Zweig ohne -wip mit demselben Kopf, sonst
        # zählt der erste Name der Liste
        case "$b" in *-wip) grep "^$sha	" "$W/zug-nie-leer.refs" | grep -qv -- "-wip$" && continue ;; esac
        case " $kopf " in *" $sha "*) continue ;; esac
        kopf="$kopf $sha"
        grep -q "^$b $sha$" "$G" && continue
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
            *) continue ;;
        esac
        # jede neu gesehene Abgabe steht EINMAL in w3/abgabe.log (der Blick liest ABGABEN und STAU daraus; die alte Abgabe-Wache starb)
        grep -q " ABGABE $b ${sha:0:8} " "$T/w3/abgabe.log" 2>/dev/null || echo "$(date +%H:%M) ABGABE $b ${sha:0:8} ${t#Abgabe }" >>"$T/w3/abgabe.log"
        git -C $R merge-base --is-ancestor "$sha" origin/main 2>/dev/null && continue
        # ein Zweig der Punkte-Maschine OHNE die Endung -pm, der dort schon liegt, ist gelandet — er hat keinen Code-Check (sein Baum
        # trägt keine check.yml) und stand sonst für immer als „Code-Check nicht GRÜN ()“ in der Warteliste (11.11.: w28-r6-konsum
        # eec204c0 lag seit 11:53 in punkte-maschine und galt den ganzen Tag als wartend)
        git -C $R merge-base --is-ancestor "$sha" origin/punkte-maschine 2>/dev/null && continue
        c=$(sh "$D/ci.sh" "$b" </dev/null 2>&1)
        echo "$c" | grep "Code-Check:" | head -1 | grep -q "completed success" || {
            echo "$b ${sha:0:8}: Code-Check nicht GRÜN ($(echo "$c" | grep "Code-Check:" | head -1 | cut -c1-80))" >>"$W/zug-nie-leer.wartet"
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
        # das Bild ist Pflicht, sobald der Zweig das SPIEL berührt — auch ohne Tag im Betreff
        sp=$(git -C $R diff --name-only "origin/main...$sha" 2>/dev/null | grep -cE "^(stamm/|worlds/|index[.]html$|[^/]+[.]js$)")
        case "$t" in *"[gpu-probe:"*) sp=1 ;; esac
        [ "$sp" -gt 0 ] && {
            echo "$c" | grep "GPU-Probe" | head -1 | grep -q "completed success" || {
                echo "$b ${sha:0:8}: GPU-Probe nicht GRÜN ($(echo "$c" | grep "GPU-Probe" | head -1 | cut -c1-110))" >>"$W/zug-nie-leer.wartet"
                # NACHGEGEBEN IST KEIN URTEIL: die Probe wich einem Karten-Job der CI (oder ihr Vorfahrt-Blick scheiterte) und endet als
                # „failure“ — niemand stieß sie neu an, der Zweig wartete für immer (11.11.: w28-stadt-grammatik 4073fb2f mit zwei
                # GRÜNEN Bildern und einem nachgegebenen 100 min, w27-verkehr-leib 314ff351 an einem 502 der API). Sagt der Post am
                # Kopf NACHGEGEBEN, stößt der Dienst die gefallenen Jobs der Probe neu an — je Kopf höchstens alle 20 min.
                if git -C $R fetch -q origin "+refs/heads/koordination:refs/remotes/origin/koordination" 2>/dev/null &&
                    git -C $R show "origin/koordination:probe-post/$b/${sha:0:8}.md" 2>/dev/null | head -1 | grep -q NACHGEGEBEN; then
                    pm="$W/probe-neu-${sha:0:8}"
                    if [ ! -f "$pm" ] || [ $(($(date +%s) - $(stat -c %Y "$pm"))) -gt 1200 ]; then
                        pl=$(awk -F'\t' '$2 ~ /^GPU-Probe/ { print $1; exit }' "$W/ci-runs.tmp" 2>/dev/null)
                        if [ -n "$pl" ]; then
                            PT=$(printf 'protocol=https\nhost=github.com\n\n' | git -C $R credential fill 2>/dev/null | sed -n 's/^password=//p')
                            pc=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Authorization: Bearer $PT" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/MiguellD/AnazhRealm/actions/runs/$pl/rerun-failed-jobs")
                            touch "$pm"
                            echo "$(date +%H:%M) $b ${sha:0:8}: GPU-Probe NACHGEGEBEN → neu angestoßen (Lauf $pl, HTTP $pc)" >>"$L"
                        fi
                    fi
                fi
                continue
            }
        }
        echo "$b"
    done <"$W/zug-nie-leer.refs"
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
buendel() { # zwei Durchgänge: ein Linsen-Zweig, der allein an der Wand fällt, fährt im zweiten mit den Spiel-Zweigen
    local Z="" b u pass
    for pass in 1 2; do
        for b in $1; do
            case " $Z " in *" $b "*) continue ;; esac
            [ "$(echo $Z | wc -w)" -ge 4 ] && break
            # EIN STEHENDER BAUM für alle Rufe des Dienstes (14.11.: je Ruf ein frischer voller Checkout, PHASEN_ZAHL) — das Schloss
            # „zug“ hält genau eine Instanz, also teilt ihn kein Zweiter (die Lehre vom 10.11. bleibt gewahrt)
            u=$(WAND_BAUM=$W/wand-mess-zug sh "$D/wand-summe.sh" --nur-buendel $Z $b 2>&1 | tail -1)
            # WER DRAUSSEN BLEIBT, ERFÄHRT ES (14.11.): der Text der Wand geht je Kopf EINMAL in die cloud-post des Zweigs (heim.sh)
            case "$u" in "BÜNDEL GRÜN"*) Z="$Z $b" ;; *) [ $pass = 2 ] && {
                echo "$b: bleibt draußen — ${u:0:200}" >>"$W/zug-nie-leer.wartet"
                sh "$D/heim.sh" "$b" "$(git -C $R rev-parse "origin/$b" 2>/dev/null)" "${u:0:300}" </dev/null >/dev/null 2>&1
            } ;; esac
        done
    done
    echo $Z
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
    echo "$nw" | grep -q "^NACHWEIS" || echo "$(date +%H:%M) $id nachweis: kein Ergebnis — $(echo "$nw" | tail -1 | cut -c1-200)" >>"$L"
    rm -f "$S/zug.fahrt"
}
# nicht_gelandet — die Zweige, die ein Zug als gefahren führte, ohne dass ihr Kopf in main liegt (zug-nicht-gelandet.txt); eine Zeile
# fällt, sobald ihr Kopf in main liegt oder der Zweig einen neuen Kopf trägt
nicht_gelandet() {
    local f="$W/zug-nicht-gelandet.txt" b s id rest k out=""
    [ -s "$f" ] || return 0
    : >"$f.neu"
    while read -r b s id rest; do
        git -C $R merge-base --is-ancestor "$s" origin/main 2>/dev/null && continue
        k=$(git -C $R rev-parse -q --verify "refs/remotes/origin/$b" 2>/dev/null)
        [ -n "$k" ] && [ "${k:0:8}" != "${s:0:8}" ] && continue
        echo "$b $s $id $rest" >>"$f.neu"
        out="$out $b($id)"
    done <"$f"
    mv "$f.neu" "$f"
    [ -n "$out" ] && echo " · NICHT GELANDET:$out"
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
        (cd $R && FAHRT_WEITER=$K FAHRT_OHNE_PUNKTE=1 sh "$WZ/fahre.sh" "$id" $rest >>"$F" 2>&1)
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
    puls zug "sammelt (jüngster Zug z$n)"
    B=$(bereit | tr "\n" " ")
    B=$(vorn "$B")
    Z=""
    [ -n "$B" ] && Z=$(buendel "$B")
    # EIN ZUG TRÄGT, WAS GLEICH BEREIT IST (12.11. z409: ein Zweig fuhr allein über 60 min, drei weitere standen Minuten vor „bereit“ —
    # jeder Zug kostet jede Karte einen echt-Job von ~15 min; die Mess-Liste der OMEN kam an zwei Köpfen nur 5/30 und 8/31 weit).
    # Steht genau EIN Zweig bereit und laufen für andere noch Check oder Probe, wartet der Dienst höchstens zweimal 5 min auf sie.
    if [ -n "$Z" ] && [ "$(echo $Z | wc -w)" = 1 ] && [ ${einzel:-0} -lt 2 ] && grep -qE "queued|in_progress|angestoßen" "$W/zug-nie-leer.wartet" 2>/dev/null; then
        einzel=$((${einzel:-0} + 1))
        puls zug "ein Zweig bereit ($Z), $(grep -cE "queued|in_progress|angestoßen" "$W/zug-nie-leer.wartet") weitere kurz davor — wartet 5 min ($einzel/2)"
        sleep 300
        continue
    fi
    einzel=0
    if [ -z "$Z" ]; then
        puls zug "wartet auf bereite Abgaben ($(grep -c . "$W/zug-nie-leer.wartet") wartend, jüngster Zug z$n)$(nicht_gelandet)"
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
