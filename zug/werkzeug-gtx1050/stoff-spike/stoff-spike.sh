#!/bin/bash
# Der Stoff-Spike: je Runde und Fall EIN Paar (Kalt-Boot im frischen Profil, dann Zweit-Boot im selben), die Fälle im Wechsel:
#   stoff-spike.sh <name> "<runden>" <fall …>     fall = Name eines Eingriffs gc/eingriff/stoff-<fall>.js   NACH=<ms nach dem Bild, 22000>
S=/c/AnazhRealm/.git/gtx1050-werkzeug
SCHLOSS=/c/Users/User/AppData/Local/Temp/claude/gpu-schloss; HOOK=/c/actions-runner/hooks/hook.log
NAME=$1; RUNDEN=${2:-1}; shift 2; FAELLE=("$@")
OUT="$S/gc/stoff-$NAME"; mkdir -p "$OUT"
cd /c/AnazhRealm || exit 1
frei() { [ ! -d "$SCHLOSS" ] && ! tail -n 1 "$HOOK" | grep -q "wartet auf Schloss"; }
N=${#FAELLE[@]}
echo "Stoff-Spike $NAME, Arbeitsbaum $(git rev-parse --short=8 HEAD) ($(git status --short | wc -l) offen), $(date +%T)"
for r in $RUNDEN; do
  for j in $(seq 0 $((N - 1))); do
    f=${FAELLE[$(((j + r) % N))]}
    # je Paar ein eigenes Schloss (≈ 3 min): die CI kommt zwischen zwei Paaren an die Reihe
    n=0; for i in $(seq 1 1400); do if frei; then n=$((n + 1)); [ $n -ge 3 ] && break; else n=0; fi; sleep 5; done
    mkdir "$SCHLOSS" 2> /dev/null || { echo "$f$r SCHLOSS belegt"; continue; }
    printf 'hand stoff-spike %s (Claude)\npid=%s\n' "$NAME" "$(cat /proc/$$/winpid)" > "$SCHLOSS/besitzer.txt"
    FREI_EINGRIFF="$S/gc/eingriff/stoff-$f.js" FREI_NACH="${NACH:-22000}" FREI_SHADER=alle node "$S/gc/stoff-paar.cjs" "$OUT" "$f$r"
    rm -f /c/Users/User/AppData/Local/Temp/claude/gpu-schloss/besitzer.txt; rmdir /c/Users/User/AppData/Local/Temp/claude/gpu-schloss
    sleep 6
  done
done
echo "Ende $(date +%T)"
