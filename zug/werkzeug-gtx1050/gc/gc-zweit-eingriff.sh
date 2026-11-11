#!/bin/bash
# Zweit-Boots im BESTEHENDEN Profil einer gc-zweit-n-Reihe, je Lauf ein eigener Eingriff:
#   gc-zweit-eingriff.sh <reihe> <commit> "<lauf>=<eingriff.js>[=<FREI_INIT>] …"     Umgebung reicht durch (FREI_INIT_MS …); =0 schaltet das Ruf-Profil je Lauf ab
# Lücke 45 s, Schloss, Wache. Ergebnis: <werkzeug>/gc/zweitn-<reihe>/<lauf>.json
S="$(cd "$(dirname "$0")/.." && pwd -W)"
SCHLOSS=/c/Users/User/AppData/Local/Temp/claude/gpu-schloss; HOOK=/c/actions-runner/hooks/hook.log
OUT="$S/gc/zweitn-$1"; C=$2
[ -d "$OUT/profil" ] || { echo "kein Profil in $OUT"; exit 3; }
cd /c/AnazhRealm || exit 1
[ -z "$(git status --porcelain)" ] || { echo "Baum nicht sauber"; exit 3; }
ZWEIG=$(git rev-parse --abbrev-ref HEAD)
frei() { [ ! -d "$SCHLOSS" ] && ! tail -n 1 "$HOOK" | grep -q "wartet auf Schloss"; }
n=0; for i in $(seq 1 720); do if frei; then n=$((n + 1)); [ $n -ge 9 ] && break; else n=0; fi; sleep 5; done
[ $n -ge 9 ] || { echo "KEINE LÜCKE"; exit 2; }
mkdir "$SCHLOSS" 2> /dev/null || { echo "SCHLOSS belegt"; exit 2; }
printf 'hand zweite %s (Claude)\npid=%s\n' "$1" "$(cat /proc/$$/winpid)" > "$SCHLOSS/besitzer.txt"
trap 'rm -rf "$SCHLOSS"; git checkout -q "$ZWEIG"; echo "Schloss gelöst $(date +%T), zurück auf $(git rev-parse --abbrev-ref HEAD) ($(git status --short | wc -l) offen)"' EXIT
git checkout -q --detach "$C" || exit 1
echo "Zweit-Boots mit Eingriff an $(git rev-parse --short=8 HEAD), Schloss $(date +%T)"
export FREI_PROFIL="$OUT/profil"
for a in $3; do
  L=${a%%=*}; E=${a#*=}; I=""; case "$E" in *=*) I=${E#*=}; E=${E%%=*};; esac
  if tail -n 1 "$HOOK" | grep -q "wartet auf Schloss von 'hand zweite"; then echo "GEWICHEN $(date +%T) vor $L"; exit 4; fi
  FREI_INIT="${I:-$FREI_INIT}" FREI_EINGRIFF="$S/gc/eingriff/$E" FREI_ZERLEGE=1 FREI_PLATTE=alles FREI_JSON="$OUT/$L.json" CI_KLASSE=gpu LINSE_GPU=karte node "$S/gc/frei-sonde.cjs" > "$OUT/$L.log" 2>&1
  X=$?
  G=$(node -e 'const b=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));const g=(b.lang||[]).filter(e=>e[0]<=b.weltbildMs).sort((x,y)=>y[1]-x[1])[0]||[0,0];console.log(g[1]+" ms ab "+g[0]+" (Buch "+b.buchMs+", Bild "+b.weltbildMs+")")' "$OUT/$L.json" 2> /dev/null)
  echo "$L EXIT=$X · $E · längste Aufgabe $G"
done
echo "Ende $(date +%T)"
