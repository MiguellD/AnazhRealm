#!/bin/bash
# DAS BAND AM HIMMEL DES DORFS: je Stand das Bild der Probe am Dorf UND der Stand des Rauchs (Teilchen je Satz, sichtbar, Stoff gebaut)
#   rauch-probe.sh <ausgabe-ordner> "<lauf>=<commit> …"     je Lauf EIN Halten des Schlosses (Lücke 45 s, CI hat Vorfahrt)
OUT=$1; STAENDE=$2
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
  printf 'hand rauch %s (Claude)\npid=%s\n' "$L" "$(cat /proc/$$/winpid)" > "$SCHLOSS/besitzer.txt"
  git checkout -q --detach "$C" || { rm -rf "$SCHLOSS"; exit 1; }
  o=dorf; W=4791; wl="$OUT/werkbank-$L.log"
  LINSE_GPU=karte node scripts/werkbank.cjs start --port $W --ort "$o" > "$wl" 2>&1 &
  wb=$!
  until grep -q "WERKBANK bereit" "$wl"; do kill -0 $wb 2> /dev/null || { echo "$L: Werkbank endete"; break; }; sleep 2; done
  node scripts/werkbank.cjs umstellen --ort "$o" --port $W > "$OUT/umstellen-$L.json"
  d=$(node /c/AnazhRealm/.git/gtx1050-werkzeug/tmp/bild-abstand.cjs "$o" "$(cygpath -w "$OUT/umstellen-$L.json")")
  K=$(node scripts/werkbank.cjs eval "for (let i = 0; i < 30; i++) r._loopCamera(performance.now() + i * 100); const c = r.state.camera; const v = c.getWorldDirection(new T.Vector3()).multiplyScalar($d).add(c.position); return [c.position.x, c.position.y, c.position.z, v.x, v.y, v.z].map((x) => x.toFixed(2)).join(' ');" --port $W | sed -n 's/.*"ergebnis": "\(.*\)".*/\1/p')
  node scripts/werkbank.cjs bild $K --wahl 0 --w 960 --h 540 --datei "$OUT/$L-dorf.png" --port $W --uhr 0.5 --ort "$o" > "$OUT/bild-$L.json"
  node scripts/werkbank.cjs eval "const st = r.state; const aus = {}; for (const k of ['dorfRauchSatz', 'brandRauchSatz']) { const R = st[k]; aus[k] = R ? { n: R.mesh.count, sichtbar: R.mesh.visible, inSzene: !!R.mesh.parent, cap: R.cap, opak: R.mat.transparent, version: R.mat.version } : null; } const fehl = (r._bruchBuch ? [...r._bruchBuch.keys()].slice(0, 6) : []); return JSON.stringify({ aus, fehl });" --port $W > "$OUT/rauch-$L.json"
  echo "$L ($(git rev-parse --short=8 HEAD)): $(tr -d '\n' < "$OUT/rauch-$L.json" | cut -c1-400)"
  node scripts/werkbank.cjs stop --port $W > /dev/null 2>&1
  wait $wb 2> /dev/null
  git checkout -q "$ZWEIG"
  rm -rf "$SCHLOSS"
  echo "Schloss gelöst $(date +%T)"
done
