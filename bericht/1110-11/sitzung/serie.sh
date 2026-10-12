#!/bin/bash
# 1110-11: (1) Wiese ABABABAB mit Takt — A main a0a05614 (abab-b542), B welle-m-birke (der Schnitt), EIN Instrument (abab-i542,
# omen-messfolge); (2) die Linse „Stufe ohne Bild" live in B ×7 und A ×3 (je Boot eingeschwungen an der Wiese), im ersten
# Boot je Seite das Bild der Birke auf 5 m und die Zerlegung baum · boden.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/abab-i542
OUT=$BASE/p3/birke/serie; mkdir -p $OUT; LOG=$OUT/fortschritt.log
A=$BASE/abab-b542; B=$BASE/welle-m-birke
export WERKBANK_PORT=4490
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match '[s]ave-server|[w]erkbank|[o]men-messfolge' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match '[w]erkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
seite() { # $1 Worktree, $2 Soll-Hash, $3 Name
  (cd $1 && PORT=4312 node save-server.js > $OUT/$3-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  local ist; ist=$(curl -s http://localhost:4312/anazhRealm.js | sha256sum | cut -c1-16)
  if [ "$ist" != "$2" ]; then say "$3 SEITEN-WACHE ROT: $ist, soll $2"; stopp; exit 3; fi
}
shaA=$(sha256sum $A/anazhRealm.js | cut -c1-16); shaB=$(sha256sum $B/anazhRealm.js | cut -c1-16)
say "SERIE START A=a0a05614 ($shaA) B=welle-m-birke $(git -C $B log -1 --format=%h)+Arbeitsbaum ($shaB)"
i=0
for X in A B A B A B A B; do
  i=$((i+1)); N=w$i$X
  [ $X = A ] && D=$A && S=$shaA || { D=$B; S=$shaB; }
  stopp; seite $D $S $N
  (cd $INSTR && timeout 2700 node scripts/omen-messfolge.cjs --ort wiese --seite http://localhost:4312 --datei $OUT/$N.json > $OUT/$N.log 2>&1)
  e=$?
  say "$N exit=$e $(node $BASE/abab542/kurz.cjs $OUT/$N.json 2>&1 | cut -c1-300)"
  sleep 30
done
W="node $INSTR/scripts/werkbank.cjs"
linse() { # $1 Name, $2 Bilder+Zerlegung (1/0)
  (cd $INSTR && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $OUT/$1-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/$1-werkbank.log 2>/dev/null && break; sleep 5; done
  $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
  $W fenster 1920 1080 > /dev/null
  $W umstellen --ort wiese > /dev/null 2>&1
  $W eval "window.__buehne(); r.state.yaw = 0; r.state.pitch = 0; return 1" > /dev/null
  $W lauf 10 --ein 30 --ruhe 300 --tiere frei > $OUT/$1-lauf.txt 2>&1
  $W eval "$(cat $BASE/p3/birke/stufe-ohne-bild.js)" > $OUT/$1-linse.json 2>&1
  say "$1 LINSE $(node -e 'const t=require("fs").readFileSync(process.argv[1],"utf8");const j=JSON.parse(t.slice(t.indexOf("{"))).ergebnis;console.log("Instanzen "+j.proben+" · ohne Bild "+j.ohneBild+" · perf "+j.perf+" · "+JSON.stringify(j.namen))' $OUT/$1-linse.json 2>&1 | cut -c1-300)"
  if [ "$2" = 1 ]; then
    $W zerlegen --nur baum,boden --runden 6 --json "$(cd $OUT && pwd -W)/$1-zerlegen.json" > $OUT/$1-zerlegen.txt 2>&1
    say "$1 ZERLEGEN $(grep -E '^(Gesamt|baum|boden)' $OUT/$1-zerlegen.txt | awk '{print $1, $2, $3, $4}' | tr '\n' ' ' | cut -c1-200)"
    $W bild -900 27.9 -850 -902.4 30 -845.7 --datei "$(cd $OUT && pwd -W)/$1-birke-auge.png" --w 960 --h 540 > /dev/null 2>&1
    $W bild -900 26.3 -850 -902.4 33 -845.7 --datei "$(cd $OUT && pwd -W)/$1-birke-krone.png" --w 960 --h 540 > /dev/null 2>&1
  fi
}
i=0
for X in B A B A B A B B B B; do
  i=$((i+1)); N=l$i$X
  [ $X = A ] && D=$A && S=$shaA || { D=$B; S=$shaB; }
  stopp; seite $D $S $N
  [ $i -le 2 ] && linse $N 1 || linse $N 0
  sleep 10
done
stopp
say "SERIE ENDE"
