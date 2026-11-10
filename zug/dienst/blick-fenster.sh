#!/bin/bash
# blick-fenster.sh — der Messplatz-Blick in EINEM Fenster, das ihn neu startet, wenn er endet (Nachfolger von blick-start2.sh).
# Erbt nie MSYS_NO_PATHCONV (10.11. 15:36: node suchte C:\c\Users\…). Fehler und Neustarts in /tmp/claude/w4/blick-fehler.log.
unset MSYS_NO_PATHCONV MSYS2_ARG_CONV_EXCL
cd /c/Users/micha/AnazhRealm-profiband || exit 1
while true; do
    echo "$(date +%H:%M:%S) START Messplatz-Blick (Fenster)" >>/tmp/claude/w4/blick-fehler.log
    bash /c/Users/micha/AnazhRealm-profiband/artifacts/profiband/werkzeug/messplatz-blick.sh --takt 60 2>>/tmp/claude/w4/blick-fehler.log
    echo "$(date +%H:%M:%S) ENDE Exit $? — Neustart in 3 s" >>/tmp/claude/w4/blick-fehler.log
    sleep 3
done
