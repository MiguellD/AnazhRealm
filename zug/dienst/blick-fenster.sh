#!/bin/bash
# unter sh.exe neu (Grund und Zahlen: zug-dienst.sh „UNTER sh.exe", 13.11.) — als sh gerufen schaltet die Zeile nur POSIX ab
case "$BASH" in */sh | */sh.exe) set +o posix ;; *) [ -x /usr/bin/sh ] && exec /usr/bin/sh "$0" "$@" ;; esac
# blick-fenster.sh — der Messplatz-Blick in EINEM Fenster, das ihn neu startet, wenn er endet (Nachfolger von blick-start2.sh).
# Der Blick liegt im Dienst-Ordner (artifacts/profiband/dienst), NIE unter artifacts/profiband/werkzeug: dort verfolgt main eine alte
# Fassung (72 957 B) — am 10.11. 22:18 überschrieb ein `git reset` im Haupt-Baum damit die neue (121 716 B, Seiten 0–4 mit der Uhr).
# Erbt nie MSYS_NO_PATHCONV (10.11. 15:36: node suchte C:\c\Users\…). Fehler und Neustarts in /tmp/claude/w4/blick-fehler.log.
unset MSYS_NO_PATHCONV MSYS2_ARG_CONV_EXCL
cd /c/Users/micha/AnazhRealm-profiband || exit 1
while true; do
    echo "$(date +%H:%M:%S) START Messplatz-Blick (Fenster)" >>/tmp/claude/w4/blick-fehler.log
    sh /c/Users/micha/AnazhRealm-profiband/artifacts/profiband/dienst/messplatz-blick.sh --takt 60 2>>/tmp/claude/w4/blick-fehler.log
    echo "$(date +%H:%M:%S) ENDE Exit $? — Neustart in 3 s" >>/tmp/claude/w4/blick-fehler.log
    sleep 3
done
