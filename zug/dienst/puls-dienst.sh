#!/bin/bash
# unter sh.exe neu (Grund und Zahlen: zug-dienst.sh „UNTER sh.exe", 13.11.) — als sh gerufen schaltet die Zeile nur POSIX ab
case "$BASH" in */sh | */sh.exe) set +o posix ;; *) [ -x /usr/bin/sh ] && exec /usr/bin/sh "$0" "$@" ;; esac
# puls-dienst.sh — die Schleife des Schloss-Pulses (11.11.): schloss-puls.cjs liest je 30 s das GPU-Schloss dieses Geräts (Halter, sein
# Lebenszeichen, wer wartet) und pusht es nach refs/puls/<gerät> — die Uhr des Messplatz-Blicks liest es; ohne diese Schleife heißt das
# Gerät dort BLIND, nie „Frei“. Laptop: zug/dienst/start.sh (Gerät radeon, Klon $R) · OMEN: zug/dienst-omen/start.sh installiert die
# Datei nach p3/dienst-omen und startet sie (orte.sh daneben: Gerät omen, Klon $M) · GTX 1050: PULS_GERAET=gtx1050 PULS_REPO=<klon>.
# Stirbt node, startet die Schleife es nach 30 s neu (die Zeile steht im Puls und in <S>/puls.out). Ende: start.sh --stopp puls.
D=$(cd "$(dirname "$0")" && pwd)
. "$D/gemein.sh"
if [ -f "$D/orte.sh" ]; then
    . "$D/orte.sh"
    G=${PULS_GERAET:-omen}
    K=${PULS_REPO:-$M}
else
    G=${PULS_GERAET:-radeon}
    K=${PULS_REPO:-$R}
fi
schloss puls || exit 0
while true; do
    puls puls "schloss-puls $G aus $K"
    # DER PULS DIESER SCHLEIFE IST DIE LETZTE ZEILE IHRER MESSUNG (14.11.: bis dahin schrieb sie ihn EINMAL beim Start — der Blick
    # zeigte „Puls vor 342 min“ an einer Schleife, die jede Minute maß). Nur eine NEUE Zeile in puls.out erneuert ihn: hängt node,
    # altert der Puls, und der Blick sagt es. Der Blick trägt damit den Halter des GPU-Schlosses.
    node "$D/schloss-puls.cjs" --geraet "$G" --repo "$K" --schleife &
    k=$!
    z=""
    while kill -0 $k 2>/dev/null; do
        sleep 60
        l=$(tail -1 "$S/puls.out" 2>/dev/null | cut -c1-150)
        [ -n "$l" ] && [ "$l" != "$z" ] && puls puls "$l" && z=$l
    done
    wait $k
    puls puls "schloss-puls $G endete mit $? — Neustart in 30 s"
    sleep 30
done
