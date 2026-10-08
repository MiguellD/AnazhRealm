#!/bin/bash
# Auftrag 0710-6: V18.535 gegen main — ABABABAB mit EINEM Instrument (omen-messfolge.cjs + werkbank + lib aus B), die Seite
# liefert nur die Welt (:4312, Seiten-Hash-Wache vor jedem Boot). Je Slot nach der Folge eine Hänger-Sitzung (frische Werkbank,
# derselbe Ort, haenger 30 s unter Regler voll); nach dem 4. Boot je Seite zerlegen (Wiese) + band --ort genesis.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/abab-b535
OUT=$BASE/abab535; mkdir -p $OUT
LOG=$OUT/fortschritt.log
A=$BASE/abab-a535   # main 78ee56da (V18.534 + Hotfix Weltbild-Frost)
B=$BASE/abab-b535   # integ-probe c966b9c3 (V18.535)
MAXWDH=2
export WERKBANK_PORT=4490
W="node $INSTR/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $LOG; }

stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
werkbankStopp() {
  $W stop > /dev/null 2>&1
  sleep 3
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 2
}
ruhe() {
  local g; g=$(nvidia-smi --query-gpu=temperature.gpu,clocks.gr,utilization.gpu,pstate --format=csv,noheader 2>/dev/null)
  local fremd; fremd=$(powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe' or Name='chrome.exe'\" | ? CommandLine -match 'werkbank|save-server|puppeteer' | Measure-Object | % Count" 2>/dev/null | tr -d '\r')
  echo "GPU[$g] eigene-reste=$fremd"
}
seite() { # $1 = Worktree, $2 = Soll-Hash, $3 = Name
  (cd $1 && PORT=4312 node save-server.js > $OUT/$3-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  IST=$(curl -s http://localhost:4312/anazhRealm.js | sha256sum | cut -c1-16)
  if [ "$IST" != "$2" ]; then say "$3 SEITEN-WACHE ROT: geliefert $IST, soll $2 — Abbruch der Serie"; stopp; exit 3; fi
  say "$3 Seite geliefert ($IST)"
}
sitzung() { # eine frische Werkbank am Ort wiese mit Bühne (für Hänger / zerlegen / band genesis)
  (cd $INSTR && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $OUT/$1-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/$1-werkbank.log 2>/dev/null && break; sleep 5; done
  $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
  $W fenster 1920 1080 > /dev/null
  $W umstellen --ort wiese > /dev/null
  $W eval "return window.__buehne()" > /dev/null
}

say "SERIE START  A=$(git -C $A log -1 --format=%h) (main)  B=$(git -C $B log -1 --format=%h) (integ-probe)  Instrument=$(git -C $INSTR log -1 --format=%h)"
shaA=$(sha256sum $A/anazhRealm.js | cut -c1-16); shaB=$(sha256sum $B/anazhRealm.js | cut -c1-16)
say "anazhRealm.js  A=$shaA  B=$shaB"
i=0
for X in A B A B A B A B; do
  i=$((i+1)); N=$i$X
  [ $X = A ] && D=$A && SOLL=$shaA || { D=$B; SOLL=$shaB; }
  wdh=0
  while :; do
    stopp
    say "$N boot (Versuch $((wdh+1)))  $(ruhe)"
    seite $D $SOLL $N
    (cd $INSTR && timeout 2700 node scripts/omen-messfolge.cjs --seite http://localhost:4312 --datei $OUT/$N.json > $OUT/$N.log 2>&1)
    ec=$?
    U=$(node -e "try{const j=require(process.argv[1]);console.log(j.urteil+' | '+(j.abbruch||'')+' | '+j.befunde.slice(0,6).join(' ; '))}catch(e){console.log('KEIN-JSON | '+e.message)}" $OUT/$N.json)
    say "$N exit=$ec  $U"
    grep -E "laufVoll|laufFrei|gpu-bank|band:" $OUT/$N.log | sed "s/^/      /" | tee -a $LOG >/dev/null
    case "$U" in GRUEN*) break;; esac
    stopp
    wdh=$((wdh+1))
    [ -f $OUT/$N.json ] && mv $OUT/$N.json $OUT/$N-verworfen-$wdh.json
    mv $OUT/$N.log $OUT/$N-verworfen-$wdh.log 2>/dev/null
    if [ $wdh -gt $MAXWDH ]; then say "$N nach $MAXWDH Wiederholungen weiter rot — Slot bleibt leer"; break; fi
    say "$N verworfen ($wdh), wiederhole"
    sleep 30
  done
  # die Hänger dieses Slots (frische Werkbank an derselben Seite)
  werkbankStopp
  say "$N haenger-Sitzung  $(ruhe)"
  sitzung $N-haenger
  $W haenger 30 --ein 20 --regler voll --tiere frei --json $OUT/$N-haenger.json > $OUT/$N-haenger.txt 2>&1
  say "$N haenger exit=$?  $(grep -aE 'Hänger|haenger' $OUT/$N-haenger.txt | head -2 | tr '\n' ' ' | cut -c1-200)"
  werkbankStopp
  # nach dem 4. Boot der Seite: zerlegen (Wiese) + band --ort genesis
  if [ $N = 7A ] || [ $N = 8B ]; then
    say "$X zerlegen + band genesis  $(ruhe)"
    sitzung zerlegen-$X
    $W zerlegen --runden 6 --json $OUT/zerlegen-$X.json > $OUT/zerlegen-$X.txt 2>&1
    say "$X zerlegen exit=$?"
    $W band --ort genesis --datei $OUT/band-genesis-$X.json > $OUT/band-genesis-$X.txt 2>&1
    say "$X band genesis exit=$?  $(grep -aE 'Befehle|Dreiecke|VRAM|URTEIL|urteil' $OUT/band-genesis-$X.txt | head -3 | tr '\n' ' ' | cut -c1-240)"
    werkbankStopp
  fi
  stopp
  say "$N Pause 60 s  $(ruhe)"
  sleep 60
done
stopp
say "ALLES ENDE"
