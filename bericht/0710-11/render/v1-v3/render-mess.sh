#!/bin/bash
# 0710-11 (2): WAS MISST DIE render-EWMA? — EINE Welt (welle-m-boosts) an der Mess-Wiese, je Segment lauf 20 s (Regler voll)
# mit dem Render-Zähler (render-Phase je Frame und ihre Zerlegung). Drei Versuche:
#   V1 die Takte der Klasse aus 0710-10 live getauscht (A = main 76c9624d, B = der Schnitt) — A B B A
#   V2 die Dosis: ms Rechnung im Takt vor dem Render (0 · 0,8 · 1,6 · 0,8 · 0), alle Takte B
#   V3 der Ladeschirm: wie er nach der Ankunft steht (A) gegen display:none (B) — A B B A
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/welle-m-boosts
ALT=$BASE/abab-b536/anazhRealm.js
OUT=$BASE/p3/boosts/render; mkdir -p $OUT
export WERKBANK_PORT=7902
W="node $INSTR/scripts/werkbank.cjs"
M="_tickFocusingAffordances _tickRadiatingAffordances _tickBalancingAffordances _tickLiftingAffordances _findNearestAffordanceEntry _updateDorfRauch tickPlayerBoosts"
say() { echo "$(date +%T) $*" | tee -a $OUT/fortschritt.log; }
tausche() { # $1 = A|B
  for m in $M; do
    if [ $1 = A ]; then $W methode $m --quelle $ALT > /dev/null 2>&1; else $W methode $m > /dev/null 2>&1; fi
  done
  $W eval "const P = Object.getPrototypeOf(r); return '$M'.split(' ').map((m) => /_blockerMit|_blockerUmPlatz/.test(String(P[m])) ? 'B' : 'A').join('')"
}
segment() { # $1 = Name, $2 = Spin ms
  $W eval "window.__spinMs = $2; delete window.__renderCmd; $(cat $BASE/p3/render-zaehler.js)" > /dev/null
  $W lauf 20 --ein 5 --regler voll --tiere frei > $OUT/$1-lauf.txt 2>&1
  $W eval "window.__renderCmd = 'aus'; $(cat $BASE/p3/render-zaehler.js)" > $OUT/$1-render.json 2>&1
  say "$1 $(tr -d '\n ' < $OUT/$1-render.json | cut -c1-260)"
}
(cd $INSTR && PORT=7901 node save-server.js > $OUT/save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:7901/ 2>/dev/null | grep -q 200 && break; sleep 1; done
say "B Seite $(curl -s http://localhost:7901/anazhRealm.js | sha256sum | cut -c1-16)"
(cd $INSTR && node scripts/werkbank.cjs start --echt --port 7902 --seite http://localhost:7901 > $OUT/werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/werkbank.log 2>/dev/null && break; sleep 5; done
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
$W umstellen --ort wiese > $OUT/umstellen.txt 2>&1
$W eval "return window.__buehne()" > /dev/null
say "an der Wiese, Bühne steht; Ladeschirm $($W eval "const e = document.getElementById('ladeschirm'); return e ? [e.hidden, getComputedStyle(e).display, getComputedStyle(e).opacity, e.className] : null" | tr -d '\n ')"
$W lauf 20 --ein 10 --regler voll --tiere frei > $OUT/lauf-ein.txt 2>&1
# V1: die Takte der Klasse
i=0
for X in A B B A; do
  i=$((i+1))
  say "V1-$i$X Takte $(tausche $X | tr -d '\n ' | cut -c1-40)"
  segment V1-$i$X 0
done
tausche B > /dev/null
# V2: die Dosis
i=0
for S in 0 0.8 1.6 0.8 0; do
  i=$((i+1))
  segment V2-$i-spin$S $S
done
# V3: der Ladeschirm
i=0
for X in A B B A; do
  i=$((i+1))
  if [ $X = B ]; then $W eval "document.getElementById('ladeschirm').style.display = 'none'; return 1" > /dev/null
  else $W eval "document.getElementById('ladeschirm').style.display = ''; return 1" > /dev/null; fi
  segment V3-$i$X 0
done
$W stop > /dev/null 2>&1
sleep 3
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server' | ? { \$_.ProcessId -in (Get-NetTCPConnection -State Listen -LocalPort 7901 -ErrorAction SilentlyContinue | % OwningProcess) } | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
say "ENDE"
