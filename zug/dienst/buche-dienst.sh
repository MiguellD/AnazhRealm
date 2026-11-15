#!/bin/bash
# unter sh.exe neu (Grund und Zahlen: zug-dienst.sh „UNTER sh.exe", 13.11.) — als sh gerufen schaltet die Zeile nur POSIX ab
case "$BASH" in */sh | */sh.exe) set +o posix ;; *) [ -x /usr/bin/sh ] && exec /usr/bin/sh "$0" "$@" ;; esac
# buche-dienst.sh — bucht ohne LLM und ohne Ende am JÜNGSTEN main-Kopf nach JEDER neuen Mess-Scheibe (ein Push auf
# punkte-maschine, der messung/*.json berührt — OMEN, Radeon oder Farm, an welchem Kopf auch immer) und nach jedem neuen Kopf. Nachfolger von buche-je-scheibe.sh, das nach 8 h
# still endete. Geurteilt wird je Kriterium (punkte.cjs buchBilanz, seit 13.11.): ein Gewinn wird gebucht, ein Fall steht beim Namen ROT;
# nur der Massen-Fall (Alarm des Apparats) bucht nichts und braucht BUCHE_FALL=1 von Hand.
# Log: /tmp/claude/w4/buche-je-scheibe.log — jede Zeile nennt Kopf, Scheibe und das Wort der Buchung.
D=$(cd "$(dirname "$0")" && pwd)
. "$D/gemein.sh"
schloss buche || exit 0
L=$W/buche-je-scheibe.log
echo "$(date +%H:%M) START buche-dienst (folgt main, PID $(cat "$S/buche.pid"))" >>"$L"
alt=""
rot=0
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
        # 15.11.: seit dem Urteil je Kriterium (13.11.) heißt die Zeile „BILANZ … Fall N beim Namen ROT“, nicht mehr „verlieren“ — die
        # erste Buchung nach elf Stunden schnitt darum wieder nach 400 Zeichen mitten im dritten Fall ab, und ihr GEBUCHT fehlte ganz.
        # Das Wort des Endes (GEBUCHT oder das ROT des Apparats) steht VORN, die Fälle dahinter; jeder Lauf mit einem Fall schreibt 2400.
        wort=$(echo "$out" | grep -E 'GEBUCHT|\] ROT:' | tail -1)
        wort="$wort $(echo "$out" | grep -E 'fällt|BILANZ|verlieren|STREIT' | head -3 | tr '\n' ' ')"
        wort=${wort# }
        case "$wort" in *verlieren* | *"Fall "[1-9]*) wort=$(echo "$wort" | cut -c1-2400) ;; *) wort=$(echo "$wort" | cut -c1-400) ;; esac
        # EINE BUCHUNG OHNE WORT IST ROT, NIE STILL (12.11. 01:57–12:10: dreißig Läufe starben am 900-s-Limit, jede Zeile blieb leer,
        # der Blick zeigte zehn Stunden „±0 gebucht“ ohne Grund): das Limit und jedes wortlose Ende stehen beim Namen in der Zeile
        [ -z "$wort" ] && wort="ROT: die Buchung endete ohne Wort nach $(($(date +%s) - t_b)) s (Exit $rc_b$([ "$rc_b" = 124 ] && echo ' = das 900-s-Limit')) — nichts gebucht · zuletzt: $(echo "$out" | grep -v '^\s*$' | tail -1 | cut -c1-160)"
        echo "$(date +%H:%M) Kopf $k8 · Scheibe ${neu:0:8}: $wort" >>"$L"
        # ZWEI ROTE BUCHUNGEN IN FOLGE SIND EIN EREIGNIS DER WACHE (15.11.: 54 Läufe ROT in 11 h, jede Zeile stand in diesem Log, an dem
        # kein Wecker hing — der Koordinator las es erst beim Konto-Wechsel). Das Ereignis steht in der Datei, an der sein Wecker hängt
        # (wache-ereignis.log): am zweiten Lauf ohne GEBUCHT und danach an jedem zwölften. Rot ist JEDER Lauf, der nicht bucht (das ROT
        # des Apparats, der Massen-Fall, das wortlose Ende) — die Fälle einer Buchung, die bucht, sind Urteil, kein Ereignis.
        case "$out" in
            *"] GEBUCHT "*) rot=0 ;;
            *)
                rot=$((rot + 1))
                { [ $rot = 2 ] || [ $((rot % 12)) = 0 ]; } && echo "$(date '+%F %H:%M') BUCHUNG ROT seit $rot Läufen am $k8 — ${wort:0:200}" >>"$W/wache-ereignis.log"
                ;;
        esac
        alt="$K:$neu"
        puls buche "zuletzt $k8 · ${wort:0:120}"
    else puls buche "wartet auf eine neue Scheibe am $k8${wort:+ · zuletzt ${wort:0:100}}"; fi
    sleep 300
done
