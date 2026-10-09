#!/bin/bash
# Bild-Paar „Reiter im Wagen" (0710-4 Klasse 4) am echten Renderer: ./bild-reiter.sh <name> <worktree> <seite-port>
# Eine Werkbank-Welt je Seite (vorher / nachher); je Wagen-Art Seite in Fensterhöhe + schräg vorn oben, aus dem Ausgabe-Pfad.
P3=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3
N=$1; WT=/c/Users/micha/Desktop/AnazhRealm-OMEN/$2; SEITE=$3; export WERKBANK_PORT=7900
W="node $WT/scripts/werkbank.cjs"
OUT=$(cd $P3 && pwd -W)/bilder/$N; mkdir -p $P3/bilder/$N
(cd $WT && PORT=$SEITE node save-server.js > $P3/save-$SEITE.log 2>&1 &)
sleep 3
(cd $WT && node scripts/werkbank.cjs start --echt --port 7900 --seite http://localhost:$SEITE > $P3/werkbank-$N.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $P3/werkbank-$N.log 2>/dev/null && break; sleep 5; done
$W eval "window.__anazhAutoSettlement = false; window.__gpuFehlerP3 = []; r.state.renderer.backend.device.addEventListener('uncapturederror', (e) => window.__gpuFehlerP3.push(String((e.error && e.error.message) || e).slice(0, 200))); return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
$W umstellen --ort wiese > /dev/null
for typ in ${4:-gt supersport limousine suv}; do
  node $P3/reiter-bild.cjs 7900 $typ > $P3/$N-$typ.json
  seite=$(node -e "const o=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')).ergebnis;console.log(o.seite)" $P3/$N-$typ.json)
  schraeg=$(node -e "const o=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')).ergebnis;console.log(o.schraeg)" $P3/$N-$typ.json)
  $W bild $seite --w 1920 --h 1080 --datei "$OUT/$typ-seite.png" > /dev/null
  $W bild $schraeg --w 1920 --h 1080 --datei "$OUT/$typ-schraeg.png" > /dev/null
  $W eval "const a = window.__reiterAbbild; if (a) { a.pm.attach(a.kind); window.__reiterAbbild = null; } return 1" > /dev/null
  echo "$N $typ $(cat $P3/$N-$typ.json | cut -c1-300)"
done
echo "$N gpu-fehler $($W eval 'return window.__gpuFehlerP3' | tr -d '\n')"
$W stop > /dev/null 2>&1; sleep 3
# den Seiten-Server dieses Laufs beenden (der Prozess, der auf SEITE lauscht)
for pid in $(netstat -ano | grep "LISTENING" | grep ":$SEITE " | awk '{print $NF}' | sort -u); do taskkill //PID $pid //F > /dev/null 2>&1; done
