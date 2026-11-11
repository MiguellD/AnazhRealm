#!/bin/bash
# Der ZWEIT-BOOT im Wechsel zweier Stände (frei-sonde, FREI_ZERLEGE): je Runde A kalt, A zweit, B kalt, B zweit — je Stand ein frisches
# Profil, der Zweit-Boot im SELBEN Profil mit voller Platte:  gc-zweit-ab.sh <name> <A> <B> [runden=1] [erste Runde=1]
# Lücke 45 s, Schloss, Wache (wartet die CI, endet die Folge nach dem laufenden Lauf). Ergebnis: <werkzeug>/gc/ab-<name>/ (A1-kalt.json …)
S="$(cd "$(dirname "$0")/.." && pwd -W)"
SCHLOSS=/c/Users/User/AppData/Local/Temp/claude/gpu-schloss; HOOK=/c/actions-runner/hooks/hook.log
OUT="$S/gc/ab-$1"; mkdir -p "$OUT"; A=$2; B=$3; N=${4:-1}; AB=${5:-1}
cd /c/AnazhRealm || exit 1
[ -z "$(git status --porcelain)" ] || { echo "Baum nicht sauber"; exit 3; }
ZWEIG=$(git rev-parse --abbrev-ref HEAD)
frei() { [ ! -d "$SCHLOSS" ] && ! tail -n 1 "$HOOK" | grep -q "wartet auf Schloss"; }
n=0; for i in $(seq 1 720); do if frei; then n=$((n + 1)); [ $n -ge 9 ] && break; else n=0; fi; sleep 5; done
[ $n -ge 9 ] || { echo "KEINE LÜCKE"; exit 2; }
mkdir "$SCHLOSS" 2> /dev/null || { echo "SCHLOSS belegt"; exit 2; }
printf 'hand zweit %s (Claude)\npid=%s\n' "$1" "$(cat /proc/$$/winpid)" > "$SCHLOSS/besitzer.txt"
trap 'rm -rf "$SCHLOSS"; git checkout -q "$ZWEIG"; echo "Schloss gelöst $(date +%T), zurück auf $(git rev-parse --abbrev-ref HEAD) ($(git status --short | wc -l) offen)"' EXIT
echo "Wechsel A=$(git rev-parse --short=8 $A) B=$(git rev-parse --short=8 $B), Schloss $(date +%T)"
lauf() { # <datei>
  FREI_ZERLEGE=1 FREI_PLATTE=alles FREI_JSON="$OUT/$1.json" CI_KLASSE=gpu LINSE_GPU=karte node "$S/gc/frei-sonde.cjs" > "$OUT/$1.log" 2>&1
  echo "$1 EXIT=$? · $(head -n 1 "$OUT/$1.log" | cut -c38-110)"
}
for r in $(seq $AB $((AB + N - 1))); do
  for x in A B; do
    if tail -n 1 "$HOOK" | grep -q "wartet auf Schloss von 'hand zweit"; then echo "GEWICHEN $(date +%T) vor $x$r"; exit 4; fi
    [ $x = A ] && C=$A || C=$B
    git checkout -q --detach "$C" || exit 1
    export FREI_PROFIL="$OUT/profil-$x$r"; rm -rf "$FREI_PROFIL"
    lauf "$x$r-kalt"
    lauf "$x$r-zweit"
    rm -rf "$FREI_PROFIL"
  done
done
echo "Ende $(date +%T)"
