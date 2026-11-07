#!/bin/bash
# messplatz-blick.sh [--einmal] — was OMEN, Radeon, GitHub und der Zug JETZT tun, im Terminal (q beendet). Rumpf: messplatz-blick.cjs, der
# das Token selbst aus git credential holt; dieser Rahmen nur für die Git-Bash. Läuft auf dem Laptop, nie auf der OMEN.
exec node "$(dirname "$0")/messplatz-blick.cjs" "$@"
