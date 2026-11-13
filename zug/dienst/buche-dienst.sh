#!/bin/bash
# unter sh.exe neu (Grund und Zahlen: zug-dienst.sh „UNTER sh.exe", 13.11.) — als sh gerufen schaltet die Zeile nur POSIX ab
case "$BASH" in */sh | */sh.exe) set +o posix ;; *) [ -x /usr/bin/sh ] && exec /usr/bin/sh "$0" "$@" ;; esac
# buche-dienst.sh — bucht ohne LLM und ohne Ende am JÜNGSTEN main-Kopf nach JEDER neuen Mess-Scheibe (ein Push auf
# punkte-maschine, der messung/*.json berührt — OMEN, Radeon oder Farm, an welchem Kopf auch immer) und nach jedem neuen Kopf. Nachfolger von buche-je-scheibe.sh, das nach 8 h
# still endete. Die Wand von buche.sh bleibt: fällt die Summe, wird nichts gebucht (ein echter Fall braucht BUCHE_FALL=1 von Hand).
# Log: /tmp/claude/w4/buche-je-scheibe.log — jede Zeile nennt Kopf, Scheibe und das Wort der Buchung.
D=$(cd "$(dirname "$0")" && pwd)
. "$D/gemein.sh"
schloss buche || exit 0
L=$W/buche-je-scheibe.log
echo "$(date +%H:%M) START buche-dienst (folgt main, PID $(cat "$S/buche.pid"))" >>"$L"
alt=""
while true; do
    git -C $R fetch -q origin "+refs/heads/main:refs/remotes/origin/main" "+refs/heads/punkte-maschine:refs/remotes/origin/punkte-maschine" 2>/dev/null
    K=$(git -C $R rev-parse origin/main)
    k8=${K:0:8}
    # JEDE neue Mess-Scheibe zählt, an welchem Kopf auch immer (bis 11.11. nur messung/<jüngster kopf>-*: die Züge landen alle ~30 min,
    # die Karte misst in Fenstern von 15 min — 20:32 behielt die Radeon 16 Stationen (7 GRÜN) am bc0a4aed, main stand seit 20:23 auf
    # df6c4721, die Scheibe löste nie eine Buchung aus). Gebucht wird am jüngsten Kopf aus ALLEN Mess-Dateien; ob eine Messung an einem
    # älteren Kopf noch gilt, urteilt R6 nach Konsum (punkte.cjs), nicht der Dateiname. Auch ein neuer Kopf allein bucht einmal.
    neu=$(git -C $R log -1 --format=%H origin/punkte-maschine -- "meisterkarte-quelle/punkte/messung" 2>/dev/null)
    if [ -n "$neu" ] && [ "$K:$neu" != "$alt" ]; then
        puls buche "bucht am $k8 (Scheibe ${neu:0:8})"
        t_b=$(date +%s)
        out=$(cd $R && BUCHE_KOPF=$K timeout 900 sh "$WZ/buche.sh" 2>&1)
        rc_b=$?
        # DIE VERLIERER STEHEN GANZ IM LOG (12.11. 17:04: „3 Kriterien verlieren“ riss nach 400 Zeichen mitten im zweiten Namen ab —
        # wer den Fall beurteilen soll, las zwei von drei): eine Buchung, die fällt, schreibt bis 2400 Zeichen, jede andere 400
        wort=$(echo "$out" | grep -E 'GEBUCHT|fällt|ROT:|verlieren' | head -3 | tr '\n' ' ')
        case "$wort" in *verlieren*) wort=$(echo "$wort" | cut -c1-2400) ;; *) wort=$(echo "$wort" | cut -c1-400) ;; esac
        # EINE BUCHUNG OHNE WORT IST ROT, NIE STILL (12.11. 01:57–12:10: dreißig Läufe starben am 900-s-Limit, jede Zeile blieb leer,
        # der Blick zeigte zehn Stunden „±0 gebucht“ ohne Grund): das Limit und jedes wortlose Ende stehen beim Namen in der Zeile
        [ -z "$wort" ] && wort="ROT: die Buchung endete ohne Wort nach $(($(date +%s) - t_b)) s (Exit $rc_b$([ "$rc_b" = 124 ] && echo ' = das 900-s-Limit')) — nichts gebucht · zuletzt: $(echo "$out" | grep -v '^\s*$' | tail -1 | cut -c1-160)"
        echo "$(date +%H:%M) Kopf $k8 · Scheibe ${neu:0:8}: $wort" >>"$L"
        alt="$K:$neu"
        puls buche "zuletzt $k8 · ${wort:0:120}"
    else puls buche "wartet auf eine neue Scheibe am $k8${wort:+ · zuletzt ${wort:0:100}}"; fi
    sleep 300
done
