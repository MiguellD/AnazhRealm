#!/bin/bash
# DIE GPU-ZEIT JE BILD im Wechsel zweier Stände (werkbank gpu-bank, echte Karte headless, LINSE_GPU=karte):
#   bank-paar.sh <ausgabe-ordner> <ort> "<lauf>=<commit> …"   je Lauf EIN Halten des Schlosses (Lücke 45 s, CI hat Vorfahrt)
# je Lauf: Werkbank-Start am Ort, umstellen, 20 s Ruhe, gpu-bank 240 Bilder × 3 Runden
OUT=$1; ORT=$2; STAENDE=$3
SCHLOSS=/c/Users/User/AppData/Local/Temp/claude/gpu-schloss; HOOK=/c/actions-runner/hooks/hook.log
mkdir -p "$OUT"
cd /c/AnazhRealm || exit 1
[ -z "$(git status --porcelain)" ] || { echo "Baum nicht sauber"; exit 3; }
ZWEIG=$(git rev-parse --abbrev-ref HEAD)
frei() { [ ! -d "$SCHLOSS" ] && ! tail -n 1 "$HOOK" | grep -q "wartet auf Schloss"; }
for st in $STAENDE; do
  L=${st%%=*}; C=${st#*=}
  n=0; for i in $(seq 1 720); do if frei; then n=$((n + 1)); [ $n -ge 9 ] && break; else n=0; fi; sleep 5; done
  [ $n -ge 9 ] || { echo "KEINE LÜCKE"; exit 2; }
  mkdir "$SCHLOSS" 2> /dev/null || { echo "SCHLOSS belegt"; exit 2; }
  printf 'hand bank %s (Claude)\npid=%s\n' "$L" "$(cat /proc/$$/winpid)" > "$SCHLOSS/besitzer.txt"
  git checkout -q --detach "$C" || { rm -rf "$SCHLOSS"; exit 1; }
  W=4793; wl="$OUT/werkbank-$L.log"
  LINSE_GPU=karte node scripts/werkbank.cjs start --port $W --ort "$ORT" > "$wl" 2>&1 &
  wb=$!
  until grep -q "WERKBANK bereit" "$wl"; do kill -0 $wb 2> /dev/null || { echo "$L: Werkbank endete"; break; }; sleep 2; done
  node scripts/werkbank.cjs umstellen --ort "$ORT" --port $W > "$OUT/umstellen-$L.json"
  sleep 20
  node scripts/werkbank.cjs gpu-bank 240 --runden 3 --port $W > "$OUT/bank-$L.json"
  echo "$L ($(git rev-parse --short=8 HEAD)): $(tr -d '\n' < "$OUT/bank-$L.json" | grep -oE '"(median|p95|mittel|ms|runden)[^,}]*' | head -8 | tr '\n' ' ' | cut -c1-220)"
  node scripts/werkbank.cjs stop --port $W > /dev/null 2>&1
  wait $wb 2> /dev/null
  git checkout -q "$ZWEIG"
  rm -rf "$SCHLOSS"
  echo "Schloss gelöst $(date +%T)"
done
