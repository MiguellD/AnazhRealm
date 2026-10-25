#!/bin/bash
# gpu-lauf.sh <name> <befehl...> — hält das GPU-Schloss um GENAU EINEN Befehl (Regel: das Schloss nur je einzelnem echten Lauf).
# Am 22.10. hielten zwei Macher das Schloss 97 min bzw. über eine Stunde über viele Läufe hinweg; drei Karten verloren ihr Bild.
# Darum hält es jetzt das Werkzeug, nie der Agent: warten (Besitzer alle 60 s gemeldet) → nehmen → EIN Befehl → immer lösen (trap).
# Deckel je Befehl GPU_LAUF_MAX_S (Standard 900 s, höchstens 3300 s: unter der 60-min-Verwaist-Regel, sonst nähme ein Zweiter das
# Schloss mitten im Lauf); beim Deckel fällt der GANZE Prozessbaum (Chrome und Werkbank mit), nie nur das direkte Kind. Warten
# höchstens GPU_LAUF_WARTE_S (Standard 2700 s), dann Exit 75 „SCHLOSS BLOCKIERT von <name>“.
# Verwaist ist ein Schloss, dessen Halter tot ist (besitzer.txt trägt pid=<Windows-PID>), ein ci-runner-Schloss ohne lebenden
# Runner.Worker, oder eines älter als 60 min (kein Befehl darf so lange). Gelöst wird nur nach erneutem Lesen desselben Besitzers.
S="${TEMP:-/tmp}/claude/gpu-schloss"
NAME="$1"
shift
if [ -z "$NAME" ] || [ $# -eq 0 ]; then
    echo "Aufruf: gpu-lauf.sh <name> <befehl...>"
    exit 2
fi
MAX=${GPU_LAUF_MAX_S:-900}
if [ "$MAX" -gt 3300 ]; then
    echo "gpu-lauf: Deckel ${MAX} s über 3300 s — auf 3300 s gesetzt (60-min-Verwaist-Regel)"
    MAX=3300
fi
WARTE=${GPU_LAUF_WARTE_S:-2700}
# -FI statt //FI: unter MSYS2_ARG_CONV_EXCL=* oder MSYS_NO_PATHCONV=1 bliebe //FI stehen, tasklist wiese es ab und die Vorfahrt
# wäre blind (Prüfung 23.10.: fünf g3-Stationen der Punkte-Maschine)
worker() { tasklist -FI "IMAGENAME eq Runner.Worker.exe" 2>/dev/null | grep -qi Runner.Worker; }
lebt() { tasklist -FI "PID eq $1" -NH 2>/dev/null | grep -qw "$1"; }
loese_wenn() { # <besitzer, wie gelesen> — löst nur, wenn das Schloss noch genau diesen Besitzer trägt
    [ "$(tr -d '\r\n' 2>/dev/null <"$S/besitzer.txt")" = "$1" ] && rm -rf "$S"
}
t0=$(date +%s)
letzte=0
mkdir -p "$(dirname "$S")"
# Vorfahrt des echt-Jobs (Läufer radeon-890m, 23.10.): solange ein Runner.Worker lebt, wartet oder hält sein Hook das Schloss —
# zwischen zwei Befehlen der Karten nimmt es sonst die nächste Karte, und der Hook verhungert bis zum Deckel des Jobs.
until ! worker && mkdir "$S" 2>/dev/null; do
    jetzt=$(date +%s)
    b=$(tr -d '\r\n' 2>/dev/null <"$S/besitzer.txt")
    [ -z "$b" ] && [ ! -d "$S" ] && b="Vorfahrt: der echt-Job (Runner.Worker) läuft"
    alt=$((jetzt - $(stat -c %Y "$S" 2>/dev/null || echo "$jetzt")))
    pid=$(printf '%s' "$b" | sed -n 's/.*pid=\([0-9][0-9]*\).*/\1/p')
    grund=""
    if [ -n "$b" ]; then
        case "$b" in "ci-runner "*) worker || grund="ci-runner ohne lebenden Runner.Worker" ;; esac
        [ -z "$grund" ] && [ -n "$pid" ] && ! lebt "$pid" && grund="Halter pid=$pid lebt nicht"
    fi
    [ -z "$grund" ] && [ -d "$S" ] && [ "$alt" -gt 3600 ] && grund="${alt} s alt"
    if [ -n "$grund" ]; then
        echo "SCHLOSS VERWAIST (${b:-?}: $grund) — gelöst"
        loese_wenn "$b"
        continue
    fi
    if [ $((jetzt - t0)) -gt "$WARTE" ]; then
        echo "SCHLOSS BLOCKIERT von ${b:-?} seit ${alt} s"
        exit 75
    fi
    if [ $((jetzt - letzte)) -ge 60 ]; then
        echo "gpu-lauf: warte auf ${b:-?} (${alt} s)"
        letzte=$jetzt
    fi
    sleep 10
done
ICH="$NAME $(date -Iseconds) pid=$(cat /proc/$$/winpid 2>/dev/null || echo $$)"
printf '%s\n' "$ICH" >"$S/besitzer.txt"
KWIN=""
baum_ab() { [ -n "$KWIN" ] && taskkill -F -T -PID "$KWIN" >/dev/null 2>&1; }
trap 'loese_wenn "$ICH"' EXIT
trap 'baum_ab; exit 130' INT
trap 'baum_ab; exit 143' TERM
echo "gpu-lauf: Schloss $NAME nach $(($(date +%s) - t0)) s"
UEBER="$S.ueber.$$"
rm -f "$UEBER"
"$@" &
KIND=$!
KWIN=$(cat /proc/$KIND/winpid 2>/dev/null)
# die Wache tickt in 5 s und endet von selbst, sobald der Befehl endet (kein hängender sleep über den Lauf hinaus)
(
    n=0
    while [ "$n" -lt "$MAX" ]; do
        sleep 5
        n=$((n + 5))
        kill -0 "$KIND" 2>/dev/null || exit 0
    done
    touch "$UEBER"
    taskkill -F -T -PID "$KWIN" >/dev/null 2>&1
) &
WACHE=$!
wait "$KIND"
rc=$?
kill "$WACHE" 2>/dev/null
if [ -e "$UEBER" ]; then
    rm -f "$UEBER"
    echo "GPU-LAUF ÜBER ${MAX} s — beendet samt Prozessbaum (Deckel GPU_LAUF_MAX_S)"
    rc=124
fi
exit $rc
