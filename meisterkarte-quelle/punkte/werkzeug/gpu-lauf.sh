#!/bin/bash
# gpu-lauf.sh <name> <befehl...> — hält das GPU-Schloss um GENAU EINEN Befehl (Laptop und OMEN; das Schloss: gpu-schloss.sh daneben).
# Darum hält es das Werkzeug, nie der Agent (22.10.: zwei Macher hielten das Schloss 97 min über viele Läufe): warten (alle 60 s
# gemeldet) → nehmen → EIN Befehl → immer lösen (trap).
# DIE ART (26.10., Karte gpu-bahnen): GPU_LAUF_ART=zeit (Vorgabe) nimmt das GANZE Schloss — ein Urteil in ms misst nur allein, nach
# der CI-Ruhe; GPU_LAUF_ART=bild nimmt EINEN Platz von GPU_LAUF_PLAETZE (Vorgabe 1: das Ein-Platz-Schloss von vorher) — Bild-Urteile
# vertragen parallele Läufe. Die Punkte-Maschine setzt beides je Station (`zeit`) und Bahn-Zahl (`run --bahnen N`).
# Deckel je Befehl GPU_LAUF_MAX_S (Vorgabe 900 s): am Deckel fällt der GANZE Prozessbaum (taskkill -F -T; 23.10.: Git-Bash-`timeout`
# tötete nur das direkte Kind, Chrome zeichnete weiter), Exit 124. Warten höchstens GPU_LAUF_WARTE_S (Vorgabe 2700 s), dann Exit 75
# „SCHLOSS BLOCKIERT“. Der Herzschlag (herz_schlag, alle 10 s) frischt besitzer.txt und hält am Platz-Schloss den Vertreter lebend;
# die Wache hält keine Ausgabe offen (sonst wartete jeder Leser der Ausgabe auf ihr `sleep`: jede GTX-Station dauerte k × 5 min).
# daneben, auch wenn der Pfad als Windows-Pfad kommt (C:\…\gpu-lauf.sh, path.join der Punkte-Maschine)
case "${BASH_SOURCE[0]}" in */* | *\\*) HIER=${BASH_SOURCE[0]%[/\\]*} ;; *) HIER=. ;; esac
. "$HIER/gpu-schloss.sh"
NAME="$1"
shift
if [ -z "$NAME" ] || [ $# -eq 0 ]; then
    echo "Aufruf: gpu-lauf.sh <name> <befehl...>  (GPU_LAUF_ART=zeit|bild, GPU_LAUF_PLAETZE=N)" >&2
    exit 2
fi
ART=${GPU_LAUF_ART:-zeit}
PLAETZE=${GPU_LAUF_PLAETZE:-1}
case "$ART" in zeit | bild) ;; *) echo "gpu-lauf: GPU_LAUF_ART=$ART - erlaubt sind zeit und bild" >&2 && exit 2 ;; esac
case "$PLAETZE" in '' | *[!0-9]* | 0) echo "gpu-lauf: GPU_LAUF_PLAETZE=$PLAETZE - eine Zahl ab 1" >&2 && exit 2 ;; esac
MAX=${GPU_LAUF_MAX_S:-900}
WARTE=${GPU_LAUF_WARTE_S:-2700}
TAKT=${GPU_LAUF_TAKT_S:-5}
t0=$(date +%s)
letzte=0
nimm() { if [ "$ART" = zeit ]; then ganz_versuch "$NAME"; else platz_versuch "$NAME" "$PLAETZE"; fi; }
[ "$ART" = zeit ] && gs_vorrang "$NAME"
trap 'gs_vorrang_weg' EXIT
until nimm; do
    schloss_verwaist
    jetzt=$(date +%s)
    wer=$(gs_vorfahrt)
    [ -z "$wer" ] && wer=$(schloss_erster)
    if [ $((jetzt - t0)) -gt "$WARTE" ]; then
        echo "SCHLOSS BLOCKIERT von ${wer:-?} nach $((jetzt - t0)) s"
        exit 75
    fi
    if [ $((jetzt - letzte)) -ge 60 ]; then
        echo "gpu-lauf: $NAME ($ART) wartet auf ${wer:-?}" >&2
        letzte=$jetzt
    fi
    sleep "$TAKT"
done
gs_vorrang_weg
if [ "$ART" = zeit ]; then
    trap 'ganz_loesen "$NAME"' EXIT
    ci_ruhe
else
    trap 'platz_loesen "$NAME"' EXIT
fi
echo "gpu-lauf: Schloss $NAME ($ART${GPU_PLATZ:+, Platz $GPU_PLATZ von $PLAETZE}) nach $(($(date +%s) - t0)) s" >&2
UEBER="$GPU_SCHLOSS.ueber.$$"
rm -f "$UEBER"
"$@" &
KIND=$!
KWIN=$(cat /proc/$KIND/winpid 2>/dev/null)
baum_ab() {
    if [ -n "$KWIN" ] && command -v taskkill >/dev/null 2>&1; then taskkill -F -T -PID "$KWIN" >/dev/null 2>&1; else
        pkill -9 -P "$KIND" 2>/dev/null
        kill -9 "$KIND" 2>/dev/null
    fi
}
trap 'baum_ab; exit 130' INT
trap 'baum_ab; exit 143' TERM
(
    n=0
    while kill -0 "$KIND" 2>/dev/null; do
        if [ "$n" -ge "$MAX" ]; then
            touch "$UEBER"
            baum_ab
            exit 0
        fi
        [ $((n % 10)) -eq 0 ] && herz_schlag "$NAME"
        sleep 5
        n=$((n + 5))
    done
) >/dev/null 2>&1 </dev/null &
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
