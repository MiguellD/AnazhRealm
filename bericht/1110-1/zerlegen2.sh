#!/bin/bash
# Messauftrag 1110-1: V18.539 gegen main (Vorlage 0910-6) — ABABABAB mit EINEM Instrument (omen-messfolge.cjs + werkbank + lib aus B), die Seite
# liefert nur die Welt (:4312, Seiten-Hash-Wache vor jedem Boot). Je Slot nach der Folge eine Hänger-Sitzung (frische Werkbank,
# derselbe Ort, haenger 30 s unter Regler voll); nach dem 4. Boot je Seite zerlegen (Wiese) und Genesis im eigenen Boot (--ort genesis).
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/abab-b539
OUT=$BASE/abab539; mkdir -p $OUT
LOG=$OUT/fortschritt.log
A=$BASE/takt-bisekt   # main 66005ca6 (V18.538)
B=$BASE/abab-b539   # integ-probe be1d6e57 (V18.539)
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
shaA=$(sha256sum $A/anazhRealm.js | cut -c1-16); shaB=$(sha256sum $B/anazhRealm.js | cut -c1-16)
say "ZERLEGEN-NACHLAUF (B A, je eine frische Sitzung)"
for X in B A; do
  [ $X = A ] && D=$A && SOLL=$shaA || { D=$B; SOLL=$shaB; }
  stopp
  seite $D $SOLL zerlegen2-$X
  say "$X zerlegen2  $(ruhe)"
  sitzung zerlegen2-$X
  $W zerlegen --runden 6 --json $OUT/zerlegen2-$X.json > $OUT/zerlegen2-$X.txt 2>&1
  say "$X zerlegen2 exit=$?"
  werkbankStopp
  sleep 60
done
stopp
say "NACHLAUF ENDE"
