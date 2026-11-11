#!/bin/bash
# die Bilder der Probe (wie gpu-probe `bild_probe`) je Stand und Ort: bild-paar.sh <ausgabe-ordner> <uhr> "<lauf>=<commit> …" "<orte>"
# je Stand EIN Halten des Schlosses (Lücke 45 s, CI hat Vorfahrt), der Baum muss sauber sein
OUT=$1; U=$2; STAENDE=$3; ORTE=$4
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
  printf 'hand bild %s (Claude)\npid=%s\n' "$L" "$(cat /proc/$$/winpid)" > "$SCHLOSS/besitzer.txt"
  git checkout -q --detach "$C" || { rm -rf "$SCHLOSS"; exit 1; }
  echo "Stand $L an $(git rev-parse --short=8 HEAD), Schloss $(date +%T)"
  for o in $ORTE; do
    W=4791; wl="$OUT/werkbank-$L-$o.log"
    LINSE_GPU=karte node scripts/werkbank.cjs start --port $W --ort "$o" > "$wl" 2>&1 &
    wb=$!
    until grep -q "WERKBANK bereit" "$wl"; do kill -0 $wb 2> /dev/null || { echo "$L $o: Werkbank endete"; break; }; sleep 2; done
    node scripts/werkbank.cjs umstellen --ort "$o" --port $W > "$OUT/umstellen-$L-$o.json"
    d=$(node /c/AnazhRealm/.git/gtx1050-werkzeug/tmp/bild-abstand.cjs "$o" "$(cygpath -w "$OUT/umstellen-$L-$o.json")")
    K=$(node scripts/werkbank.cjs eval "for (let i = 0; i < 30; i++) r._loopCamera(performance.now() + i * 100); const c = r.state.camera; const v = c.getWorldDirection(new T.Vector3()).multiplyScalar($d).add(c.position); return [c.position.x, c.position.y, c.position.z, v.x, v.y, v.z].map((x) => x.toFixed(2)).join(' ');" --port $W | sed -n 's/.*"ergebnis": "\(.*\)".*/\1/p')
    echo "$L $o: Kamera ($d m) $K"
    node scripts/werkbank.cjs bild $K --wahl 0 --w 960 --h 540 --datei "$OUT/$L-$o.png" --port $W --uhr "$U" ${SAISON:+--saison "$SAISON"} --ort "$o" > "$OUT/bild-$L-$o.json"
    echo "$L $o: $(grep -oE '"(abnahme|fehler|gesamtMs)": [^,]*' "$OUT/bild-$L-$o.json" | tr '\n' ' ' | cut -c1-200)"
    node scripts/werkbank.cjs stop --port $W > /dev/null 2>&1
    wait $wb 2> /dev/null
    if tail -n 1 "$HOOK" | grep -q "wartet auf Schloss von 'hand bild"; then echo "GEWICHEN $(date +%T) nach $L $o"; break; fi
  done
  git checkout -q "$ZWEIG"
  rm -rf "$SCHLOSS"
  echo "Schloss gelöst $(date +%T)"
done
