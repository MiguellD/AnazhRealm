#!/bin/bash
# unter sh.exe neu (Grund und Zahlen: zug-dienst.sh „UNTER sh.exe", 13.11.) — als sh gerufen schaltet die Zeile nur POSIX ab
case "$BASH" in */sh | */sh.exe) set +o posix ;; *) [ -x /usr/bin/sh ] && exec /usr/bin/sh "$0" "$@" ;; esac
# fahre.sh <id> <zweig[@sha]>... — fährt EINEN Merge-Zug ohne Koordinator, vom Bau bis zur Punkte-Messung (23.10.: ein Zug kostete
# den Koordinator ~15 Weck-Runden mit vollem Kontext; jede Stufe hier wartet ohne LLM):
#   1 bau gegen origin/main → +integ-probe (kopf und Puls)          2 urteil bis GRUEN (zug.sh gibt EINEN Neulauf, dann ROT)
#   3 ABAB nur mit FAHRT_ABAB=1 (aus seit dem Mess-Kopf, 28.10.)     4 landen (Fast-Forward, nur bei nicht-langsamer)
# LANDUNG ≤ 10 MIN (23.11., der Schöpfer: „Keine 10h max 10min und fertig. Wir messen soviel wie nötig, nicht wie möglich“): am
# Kandidaten urteilen nur kopf und Puls (z695: 0,4 + 4,7 von 29,4 min Wand). Die volle Batterie erbt vom grünen Code-Check am
# Zweig-Kopf (der Einlass zug-dienst.sh bereit verlangt „voll n/n“), die Karten (echt) fahren in keinem Zug — die Stufe 3 „echt auf
# den Karten“ fiel; nach der Landung fährt main die Batterie, ihr Rot nennt die Nachwache (zug.sh nachwache, im Takt des Diensts).
# Punkte misst und bucht der Dienst je Scheibe (radeon-dienst · buche.sh), nie die Fahrt.
# Ein ROT hält den Zug an und nennt sich in der letzten Zeile: FAHRT ROT <stufe>: <grund>. Exit 0 gelandet · 1 ROT · 2 Aufruf.
# Umgebung: ZELLEN (ABAB-Zellen, Standard w-ego,g-third,d-ego,stadt,fahrt).
W=$(cd "$(dirname "$0")" && pwd)
ID="$1"
shift
if [ -z "$ID" ] || [ $# -eq 0 ]; then
    echo "Aufruf: fahre.sh <id> <zweig[@sha]>..."
    exit 2
fi
KOORD=/c/Users/micha/AnazhRealm-profiband/.claude/worktrees/koordination
KZ=/c/Users/micha/AnazhRealm-profiband/.claude/worktrees/koord-zeile
PUNKTE=/c/Users/micha/AnazhRealm-profiband/.claude/worktrees/koordination
export ZUG_PUNKTE="$(cygpath -m "$PUNKTE")"  # die Punkte-Maschine lebt seit 921c6f6e in koordination
ZUGWT=/c/Users/micha/AnazhRealm-zug
ZELLEN=${ZELLEN:-w-ego,d-ego,stadt}
CO="Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
say() { echo "$(date '+%H:%M:%S') [$ID] $*"; }
rot() {
    say "FAHRT ROT $1: $2"
    exit 1
}
TOKEN=$(printf 'protocol=https\nhost=github.com\n\n' | git credential fill 2>/dev/null | sed -n 's/^password=//p')
export TOKEN

# eine Zeile an koordination zug/warteschlange.txt (nur anhängen; dieselbe id nie zweimal)
koord_zeile() {
    # in einem EIGENEN, sauberen Baum (detached): der koordination-Baum trägt während einer Punkte-Messung ungestagte
    # Mess-Dateien — pull --rebase scheiterte dort still und reset --hard warf die laufende Messung weg (24.10.)
    local zid="${1%% *}" i
    [ -e "$KZ/.git" ] || git -C "$KOORD" worktree add -q --detach "$KZ" origin/koordination 2>/dev/null
    for i in 1 2 3 4 5; do
        git -C "$KZ" fetch -q origin koordination && git -C "$KZ" checkout -q --detach --force FETCH_HEAD || { sleep 5; continue; }
        grep -q "^$zid " "$KZ/zug/warteschlange.txt" && return 0
        printf '%s\n' "$1" >>"$KZ/zug/warteschlange.txt"
        git -C "$KZ" add zug/warteschlange.txt
        git -C "$KZ" commit -q -m "zug/warteschlange: $zid (fahre $ID)" -m "$CO"
        git -C "$KZ" push -q origin HEAD:koordination 2>/dev/null && return 0
        sleep 5
    done
    return 1
}

BASIS=$(git ls-remote https://github.com/MiguellD/AnazhRealm.git refs/heads/main | cut -f1)
if [ -n "$FAHRT_KANDIDAT" ]; then
    # Wiederaufnahme an einem Kandidaten, dessen Urteil (kopf und Puls) schon grün ist (23.10.: das ABAB von z9 war wegen des
    # Instruments leer) — nur noch ABAB und landen
    K=$(git -C "$ZUGWT" rev-parse "$FAHRT_KANDIDAT") || rot kandidat "$FAHRT_KANDIDAT unbekannt"
    WERKZEUG=0
    u=$(sh "$W/zug.sh" urteil "$K" --trocken 2>&1) || rot urteil "Wiederaufnahme ohne grünes Urteil an ${K:0:8}: $(echo "$u" | tail -1)"
    say "Wiederaufnahme am Kandidaten $K (Basis main ${BASIS:0:8})"
else
if [ -n "$FAHRT_WEITER" ]; then
    # Wiederaufnahme AB DEM URTEIL (zug-dienst.sh, 10.11.: der Dienst starb mitten im Zug): der Kandidat steht schon auf
    # integ-probe, sein Lauf läuft oder lief — kein zweiter Bau, weiter mit urteil → landen
    K=$FAHRT_WEITER
    WERKZEUG=0
    say "Wiederaufnahme ab dem Urteil am Kandidaten $K (Basis main ${BASIS:0:8})"
else
# 0 einlass: EINMAL, im Dienst (13.11.): zug-dienst.sh bereit() lässt nur Köpfe ein, deren Code-Check GRÜN ist und „voll n/n“ trägt —
# der zweite Blick hier (ein roter Job im eigenen Lauf am SHA, 26.10. gk2-damm) fragte dieselbe API nach demselben Lauf und fiel.
# 1 bau
say "bau gegen main ${BASIS:0:8}: $*"
# direkt nach integ-probe: dort urteilen kopf und Puls — die volle Batterie erbt vom Zweig-Kopf, die Karten fahren im Zug nie
out=$(sh "$W/zug.sh" bau --basis origin/main "$@" --push +integ-probe 2>&1)
# VORAB-STATIK (20.11., z631): die Batterie check:vorab am Kandidaten vor dem Push — ihr Täter steht als „gefallen … VORAB-STATIK ROT“
echo "$out" | grep -E "^(drin|gefallen|schon drin|KANDIDAT|KEIN|PUSH|aufgefrischt|VORAB-STATIK)" | sed "s/^/  /"
K=$(echo "$out" | sed -n 's/^KANDIDAT \([0-9a-f]\{40\}\) .*/\1/p')
[ -n "$K" ] || rot bau "kein Kandidat ($(echo "$out" | tail -1))"
# der Grund steht im Urteil (z447): „zug bau FEHLER: …“ heißt Maschine — zug-dienst.sh gibt die Köpfe frei —, „PUSH URTEIL“ heißt Inhalt
echo "$out" | grep -q "^PUSH ${K:0:8}" || rot bau "Push nach integ-probe abgewiesen — $(echo "$out" | grep -E '^(zug bau FEHLER|PUSH URTEIL)' | tail -1 | cut -c1-500)"
WERKZEUG=0
echo "$out" | grep -q "Werkzeug (kein ABAB)" && WERKZEUG=1
say "Kandidat $K (Werkzeug=$WERKZEUG)"
fi

# 2 urteil (kopf und Puls auf integ-probe, ~5 min): alle 30 s gefragt — der Takt von 120 s lag als bis zu 2 min Leerlauf je Zug
# über einer Wand von 5 min; die Frist bleibt 120 min
for i in $(seq 1 240); do
    u=$(sh "$W/zug.sh" urteil "$K" 2>&1)
    rc=$?
    [ $rc = 0 ] && break
    [ $rc = 1 ] && rot urteil "$(echo "$u" | tail -1) — zug.sh teile $K halbiert"
    sleep 30
done
[ $rc = 0 ] || rot urteil "nach 120 min nicht GRUEN: $(echo "$u" | tail -1)"
# die ganze Zeile: der Lauf, sein Versuch und dass voll vom Zweig-Kopf erbt — oder warum nicht
say "urteil $(echo "$u" | tail -1)"

fi

# 3 ABAB über den Messplatz-Dienst
if [ -n "$FAHRT_ABAB_GLEICH" ]; then
    # ein Neubau, der sich vom schon gemessenen Kandidaten nur im Werkzeug unterscheidet: landen übernimmt dessen Urteil
    say "kein neues ABAB: das Urteil von ${FAHRT_ABAB_GLEICH:0:8} gilt (Werkzeug-Diff, zug.sh landen)"
elif [ $WERKZEUG = 0 ] && [ "${FAHRT_ABAB:-0}" = 1 ]; then
    # DER MESS-KOPF (Luft holen, Rang 1, 28.10.): gewacht wird je Takt am Mess-Kopf (zug/mess-kopf.txt), nicht je Zug — nur auf Zuruf
    koord_zeile "$ID-abab 1 abab A=$BASIS B=$K zellen=$ZELLEN" || rot abab "Zeile nicht in die Warteschlange"
    say "ABAB-Zeile $ID-abab steht in der Warteschlange"
fi

# 4 landen — gelandet wird bei grünem Urteil (kopf und Puls), ohne auf ein ABAB zu warten. „Nachwache“ heißt es im Log nur, wenn
# Stufe 3 eine ABAB-Zeile in die Warteschlange stellte (zug.cjs landen liest sie); sonst steht dort „ohne ABAB“.
NW=--nachwache
[ "${FAHRT_NACHWACHE:-1}" = 0 ] && NW=
l=$(sh "$W/zug.sh" landen "$K" $NW 2>&1)
rc=$?
[ $rc = 0 ] || rot landen "$(echo "$l" | tail -1)"
say "$(echo "$l" | tail -1)"

# Punkte: gemessen wird je Takt vom Radeon- und OMEN-Dienst, gebucht je Scheibe von buche.sh — EINE Buchung, EIN Schreiber im Baum
# koordination. Die Stufe 6 dieser Fahrt (eine zweite Buchung im selben Baum: Merge ohne Seite, kein Wort bei gefallenem Push) stand
# seit dem Mess-Kopf (28.10.) hinter FAHRT_OHNE_PUNKTE=1 und fuhr unter dem Dienst nie; sie fiel am 15.11. mit ihrer Klasse
# (buche.sh „hole“: 54 rote Buchungen an einem Merge ohne Seite).
exit 0
