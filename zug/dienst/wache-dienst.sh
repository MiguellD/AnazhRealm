#!/bin/bash
# unter sh.exe neu (Grund und Zahlen: zug-dienst.sh „UNTER sh.exe", 13.11.) — als sh gerufen schaltet die Zeile nur POSIX ab
case "$BASH" in */sh | */sh.exe) set +o posix ;; *) [ -x /usr/bin/sh ] && exec /usr/bin/sh "$0" "$@" ;; esac
# wache-dienst.sh — DIE WACHE DER DREI GERÄTE ALS SCHLEIFE DES DIENSTES (14.11.). Bis heute lebte sie als unversioniertes Skript in
# /tmp/claude/w4 (wache-k10.sh · wache-filter.sh · wache-geraete.cjs) und als Kind der Koordinator-Sitzung: sie starb am 10.11. 18:01
# mit ihrer Sitzung, kein Nachfolger schaltete sie scharf, der Messplatz-Blick zeigte 88 h „Wache still“ und Uhren ohne Abdruck — die
# OMEN stand am 14.11. vier Stunden hinter ihrem eigenen Mess-Dienst am Schloss, und der Schöpfer sah es vor dem Koordinator.
# DAS GESETZ: der Abdruck je Gerät (werkzeug/wache-geraete.cjs: FORTSCHRITT statt Belegung, Stand in w4/wache-stand/<GERÄT>.json) wird
# ohne LLM und ohne Ende geschrieben — die Uhr des Blicks liest ihn je Takt. Jedes Ereignis (STILLSTAND · LEERLAUF · VERWAIST · WACHE
# BLIND) steht mit Uhrzeit als EINE Zeile in $W/wache-ereignis.log; der Koordinator hängt seinen Wecker an diese Datei (eine
# Hintergrund-Aufgabe, die bei der ersten neuen Zeile endet) — der Wecker ist ersetzbar, der Abdruck läuft weiter.
# Ende: start.sh --stopp wache.
D=$(cd "$(dirname "$0")" && pwd)
. "$D/gemein.sh"
schloss wache || exit 0
E=$W/wache-ereignis.log
echo "$(date '+%F %H:%M') START wache-dienst (PID $(cat "$S/wache.pid"))" >>"$W/wache-dienst.log"
n=0
while true; do
    # das Token je Stunde neu (git credential), nie in einer Datei, nie in einer Zeile
    [ $((n % 30)) = 0 ] && TOK=$(printf 'protocol=https\nhost=github.com\n\n' | git -C $R credential fill 2>/dev/null | sed -n 's/^password=//p')
    n=$((n + 1))
    m=$(TOK=$TOK timeout 110 node "$WZ/wache-geraete.cjs" 2>&1 | grep -v '^\s*$')
    if [ -n "$m" ]; then
        echo "$m" | while read -r z; do echo "$(date '+%F %H:%M') $z" >>"$E"; done
        puls wache "EREIGNIS: $(echo "$m" | head -1 | cut -c1-140)"
    else
        puls wache "wacht (Runde $n)$([ -s "$E" ] && echo " · zuletzt: $(tail -n 1 "$E" | cut -c1-110)")"
    fi
    sleep 120
done
