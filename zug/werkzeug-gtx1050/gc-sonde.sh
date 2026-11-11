#!/bin/bash
# Die Boot-Sonde (boot-sonde.cjs) an einem Stand, frische Läufe, bis einer ROT ist (höchstens <n>): gc-sonde.sh <name> <commit> [n=6]
# Lücke 45 s, Schloss, Wache (wartet die CI, endet die Folge nach dem laufenden Lauf). Ergebnis: <werkzeug>/gc/sonde-<name>/<i>.log
S="$(cd "$(dirname "$0")/.." && pwd -W)"
SCHLOSS=/c/Users/User/AppData/Local/Temp/claude/gpu-schloss; HOOK=/c/actions-runner/hooks/hook.log
OUT="$S/gc/sonde-$1"; rm -rf "$OUT"; mkdir -p "$OUT"; C=$2; N=${3:-6}
cd /c/AnazhRealm || exit 1
[ -z "$(git status --porcelain)" ] || { echo "Baum nicht sauber"; exit 3; }
ZWEIG=$(git rev-parse --abbrev-ref HEAD)
frei() { [ ! -d "$SCHLOSS" ] && ! tail -n 1 "$HOOK" | grep -q "wartet auf Schloss"; }
n=0; for i in $(seq 1 720); do if frei; then n=$((n + 1)); [ $n -ge 9 ] && break; else n=0; fi; sleep 5; done
[ $n -ge 9 ] || { echo "KEINE LÜCKE"; exit 2; }
mkdir "$SCHLOSS" 2> /dev/null || { echo "SCHLOSS belegt"; exit 2; }
printf 'hand sonde %s (Claude)\npid=%s\n' "$1" "$(cat /proc/$$/winpid)" > "$SCHLOSS/besitzer.txt"
trap 'rm -rf "$SCHLOSS"; git checkout -q "$ZWEIG"; echo "Schloss gelöst $(date +%T), zurück auf $(git rev-parse --abbrev-ref HEAD) ($(git status --short | wc -l) offen)"' EXIT
git checkout -q --detach "$C" || exit 1
echo "Sonde an $(git rev-parse --short=8 HEAD), Schloss $(date +%T)"
for i in $(seq 1 $N); do
  if tail -n 1 "$HOOK" | grep -q "wartet auf Schloss von 'hand sonde"; then echo "GEWICHEN $(date +%T) vor Lauf $i"; exit 4; fi
  t0=$(date +%s)
  [ -n "$NETLOG" ] && export SONDE_NETLOG="$OUT/$i.netlog.json"
  [ -n "$SPUR" ] && export FREI_TRACE="$OUT/$i.trace.json"
  export FREI_JSON="$OUT/$i.json"
  [ -n "$CPU" ] && (powershell -NoProfile -ExecutionPolicy Bypass -File "$S/gc/cpu-wache.ps1" "$OUT/$i.cpu.txt" ${CPU} > /dev/null 2>&1 &)
  CI_KLASSE=gpu LINSE_GPU=karte node "$S/gc/${SKRIPT:-boot-sonde.cjs}" > "$OUT/$i.log" 2>&1; e=$?
  echo "Lauf $i EXIT=$e $(( $(date +%s) - t0 )) s · $(head -n 1 "$OUT/$i.log" | cut -c1-200)"
  [ $e -ne 0 ] && [ -z "$ALLE" ] && { echo "ROT gefangen in Lauf $i"; break; }
done
echo "Ende $(date +%T)"
