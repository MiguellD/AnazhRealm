#!/bin/bash
# orte.sh — die Orte der OMEN (wird NACH zug/dienst/gemein.sh gesourct und überschreibt dessen Laptop-Orte; schloss und puls aus
# gemein.sh lesen $S erst beim Aufruf). Der Zustand des Dienstes (PID, Puls, Manifest, Ausgaben) lebt in p3/dienst-omen/zustand —
# nicht in Temp, damit ein Aufräumen dort kein PID-Schloss löscht und einen Zwilling zulässt.
O=/c/Users/micha/Desktop/AnazhRealm-OMEN
DO=$O/p3/dienst-omen          # die installierten Schleifen
S=$DO/zustand                 # PID · MSYS-PID · Puls · Manifest · <schleife>.out
N=$O/p3/n0611                 # die Werkzeuge der Mess-Kette (kandidat.sh, punkte-offen.cjs, zeile-*.cjs)
ST=$N/stufe                   # melde.cjs, ohne-band.cjs, eich.sh, die Logs landung.log · platte-wache.log
M=$O/AnazhRealm-mess          # der Klon, der origin kennt
PM=$O/n0611-pm                # frischer Stand von punkte-maschine je Lauf
PLATTE_UNTEN=${PLATTE_UNTEN:-10}
PLATTE_OBEN=${PLATTE_OBEN:-15}
mkdir -p "$S"
frei_gb() { df -k /c | awk 'NR==2 { printf "%.1f", $4 / 1048576 }'; }
kleiner() { awk -v a="$1" -v b="$2" 'BEGIN { exit !(a < b) }'; }
# melde <kennung> <text> — EINE Zeile nach koordination zug/erledigt.txt (melde.cjs setzt Datum und Zeit davor)
melde() { printf '%s\n' "$2" >"$S/zeile-$1.txt" && node "$ST/melde.cjs" "$S/zeile-$1.txt"; }
