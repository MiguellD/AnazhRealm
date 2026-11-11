#!/bin/bash
# Der ZWEIT-BOOT am echten Renderer (frei-sonde, FREI_ZERLEGE): je Runde ein frisches Profil, ein Kalt-Boot (füllt Platte, HTTP-
# und Code-Cache), dann je Modus ein Zweit-Boot im SELBEN Profil mit gefegter Platte:  gc-zweit.sh <name> <commit> "<modi>" [runden=2]
#   modi: leer (Platte leer — nur die Caches des Browsers warm) · atlas (nur der Blatt-Atlas liegt) · alles (die volle Platte)
# Lücke 45 s, Schloss, Wache (wartet die CI, endet die Folge nach dem laufenden Lauf). Ergebnis: <werkzeug>/gc/zweit-<name>/
S="$(cd "$(dirname "$0")/.." && pwd -W)"
SCHLOSS=/c/Users/User/AppData/Local/Temp/claude/gpu-schloss; HOOK=/c/actions-runner/hooks/hook.log
OUT="$S/gc/zweit-$1"; rm -rf "$OUT"; mkdir -p "$OUT"; C=$2; MODI=$3; N=${4:-2}
cd /c/AnazhRealm || exit 1
[ -z "$(git status --porcelain)" ] || { echo "Baum nicht sauber"; exit 3; }
ZWEIG=$(git rev-parse --abbrev-ref HEAD)
frei() { [ ! -d "$SCHLOSS" ] && ! tail -n 1 "$HOOK" | grep -q "wartet auf Schloss"; }
n=0; for i in $(seq 1 720); do if frei; then n=$((n + 1)); [ $n -ge 9 ] && break; else n=0; fi; sleep 5; done
[ $n -ge 9 ] || { echo "KEINE LÜCKE"; exit 2; }
mkdir "$SCHLOSS" 2> /dev/null || { echo "SCHLOSS belegt"; exit 2; }
printf 'hand zweit %s (Claude)\npid=%s\n' "$1" "$(cat /proc/$$/winpid)" > "$SCHLOSS/besitzer.txt"
trap 'rm -rf "$SCHLOSS"; git checkout -q "$ZWEIG"; echo "Schloss gelöst $(date +%T), zurück auf $(git rev-parse --abbrev-ref HEAD) ($(git status --short | wc -l) offen)"' EXIT
git checkout -q --detach "$C" || exit 1
echo "Zweit-Boot an $(git rev-parse --short=8 HEAD), Schloss $(date +%T)"
lauf() { # <datei> <platte>
  FREI_ZERLEGE=1 FREI_PLATTE=$2 FREI_JSON="$OUT/$1.json" CI_KLASSE=gpu LINSE_GPU=karte node "$S/gc/frei-sonde.cjs" > "$OUT/$1.log" 2>&1
  echo "$1 EXIT=$? · $(head -n 1 "$OUT/$1.log" | cut -c38-150) · $(grep -o 'Platte gefegt[^·]*' "$OUT/$1.log" | head -n 1)"
}
for r in $(seq 1 $N); do
  for m in $MODI; do
    if tail -n 1 "$HOOK" | grep -q "wartet auf Schloss von 'hand zweit"; then echo "GEWICHEN $(date +%T) vor $m$r"; exit 4; fi
    export FREI_PROFIL="$S/gc/zweit-$1/profil-$m$r"; rm -rf "$FREI_PROFIL"
    lauf "$m$r-kalt" alles
    lauf "$m$r-zweit" "$m"
    rm -rf "$FREI_PROFIL"
  done
done
echo "Ende $(date +%T)"
