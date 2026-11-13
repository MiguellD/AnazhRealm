#!/bin/bash
# unter sh.exe neu (Grund und Zahlen: zug-dienst.sh „UNTER sh.exe", 13.11.) — als sh gerufen schaltet die Zeile nur POSIX ab
case "$BASH" in */sh | */sh.exe) set +o posix ;; *) [ -x /usr/bin/sh ] && exec /usr/bin/sh "$0" "$@" ;; esac
# messplatz-blick.sh [--einmal] [--takt <s>] — was OMEN, Radeon und CI gerade tun, als Text im Terminal, alle 60 s (statt der
# Actions-Seite). Rumpf: messplatz-blick.cjs (EIN node-Prozess, ETag gegen das API-Limit). Token wie zug.sh (git credential);
# ohne Token gilt das Limit 60/h und der Blick lässt Jobs und Läufer aus. Läuft auf Laptop, nie auf der OMEN (Zeit-Stationen).
TOKEN=$(printf 'protocol=https\nhost=github.com\n\n' | git credential fill 2>/dev/null | sed -n 's/^password=//p'); export TOKEN
exec node "$(dirname "$0")/messplatz-blick.cjs" "$@"
