#!/bin/bash
# 0910-1 Teil A — die Zahl am GTX 1060: VRAM einer Band nach `zerlegen` (A = main 76c9624d, B = welle-m-genesis-linse) und die
# Genesis-Folge im eigenen Boot je Seite. EIN Instrument (B: werkbank + omen-messfolge + lib), die Seite liefert nur die Welt.
# Werkplatz-Ports: save-server 7903, Werkbank 7904.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/welle-m-genesis-linse
OUT=$BASE/p3/genesis/zahl; mkdir -p $OUT
LOG=$OUT/fortschritt.log
A=$BASE/abab-b536
B=$INSTR
export WERKBANK_PORT=7904
W="node $INSTR/scripts/werkbank.cjs"
say() { echo "[$(date +%H:%M:%S)] $*" | tee -a $LOG; }
stopp() {
  $W stop > /dev/null 2>&1
  sleep 3
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
  sleep 2
}
seite() { # $1 = Worktree, $2 = Name
  (cd $1 && PORT=7903 node save-server.js > $OUT/$2-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:7903/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  say "$2 Seite $(curl -s http://localhost:7903/anazhRealm.js | sha256sum | cut -c1-16) (soll $(sha256sum $1/anazhRealm.js | cut -c1-16))"
}
sitzung() { # $1 = Name
  (cd $INSTR && node scripts/werkbank.cjs start --echt --port 7904 --seite http://localhost:7903 > $OUT/$1-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/$1-werkbank.log 2>/dev/null && break; sleep 5; done
  $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
  $W fenster 1920 1080 > /dev/null
  $W umstellen --ort wiese > /dev/null
  $W eval "return window.__buehne()" > /dev/null
}
rahmen() { # die Rahmen-Ziele des Renderers jetzt
  $W eval "const rd = r.state.renderer; let n = 0, b = 0; for (const [t, v] of rd.info.memoryMap) if (t && t.isTexture && t.renderTarget && t.renderTarget.isPostProcessingRenderTarget) { n++; b += typeof v === 'number' ? v : 0; } return { ziele: rd._frameBufferTargets.size, texturen: n, mb: +(b / 1048576).toFixed(2) };" 2>&1 | tr '\n' ' ' | cut -c1-200
}
stopp
say "START  A=$(git -C $A log -1 --format=%h)  B=$(git -C $B log -1 --format=%h) (+ Arbeitsbaum)  Instrument=B"
for X in A B; do
  [ $X = A ] && D=$A || D=$B
  seite $D $X
  sitzung $X-zerlegen
  $W band --ort wiese --datei $OUT/band-vor-$X.json > $OUT/band-vor-$X.txt 2>&1
  say "$X band vor zerlegen: $(head -1 $OUT/band-vor-$X.txt | cut -c1-200)  Rahmen: $(rahmen)"
  $W zerlegen --runden 2 --json $OUT/zerlegen-$X.json > $OUT/zerlegen-$X.txt 2>&1
  say "$X zerlegen exit=$?  Rahmen: $(rahmen)"
  $W band --ort wiese --datei $OUT/band-nach-$X.json > $OUT/band-nach-$X.txt 2>&1
  say "$X band nach zerlegen: $(head -1 $OUT/band-nach-$X.txt | cut -c1-200)  Rahmen: $(rahmen)"
  grep -aE 'r184-ausgabe|LINSE' $OUT/band-nach-$X.txt | head -4 | sed 's/^/      /' | tee -a $LOG
  stopp
  say "$X genesis-Folge (eigener Boot)"
  seite $D $X-genesis
  (cd $INSTR && timeout 1800 node scripts/omen-messfolge.cjs --ort genesis --port 7904 --seite http://localhost:7903 --datei $OUT/genesis-$X.json > $OUT/genesis-$X.log 2>&1)
  say "$X genesis exit=$?  $(grep -aE 'MESS-FOLGE|band:' $OUT/genesis-$X.log | tr '\n' ' ' | cut -c1-260)"
  grep -a 'ROT ' $OUT/genesis-$X.log | head -6 | sed 's/^/      /' | tee -a $LOG
  stopp
  sleep 20
done
say "ENDE"
