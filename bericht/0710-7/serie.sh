#!/bin/bash
# Auftrag 0710-7 (3), die Zeit: welle-m-nexus gegen V18.535 — ABABABAB mit EINEM Instrument (omen-messfolge.cjs + werkbank + lib
# aus B), die Seite liefert nur die Welt (:4312, Seiten-Wache vor jedem Boot). A (V18.535) kennt die Welt-Akte nicht: die Wache
# WELTAKT nennt dort jeden Schritt „blind" — ein A-Boot zählt, wenn das sein einziger Befund ist (ein Täter „durch" verwirft ihn).
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/abab-b-nexus
OUT=$BASE/abab0710-7; mkdir -p $OUT
LOG=$OUT/fortschritt.log
A=$BASE/abab-b535    # V18.535 c966b9c3 (main)
B=$BASE/abab-b-nexus # welle-m-nexus
MAXWDH=2
export WERKBANK_PORT=4490
say() { echo "$(date +%T) $*" | tee -a $LOG; }

stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
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

say "SERIE START  A=$(git -C $A log -1 --format=%h) (V18.535)  B=$(git -C $B log -1 --format=%h) (welle-m-nexus)  Instrument=$(git -C $INSTR log -1 --format=%h)"
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
    U=$(node -e "
      try {
        const j = require(process.argv[1]);
        const blind = (b) => /^WELTAKT [^:]+: das Spiel nennt keine Welt-Akte/.test(b);
        const rest = j.befunde.filter((b) => !(process.argv[2] === 'A' && blind(b)));
        const u = j.urteil === 'GRUEN' || (!j.abbruch && rest.length === 0 && j.befunde.length > 0) ? 'GRUEN' + (j.urteil === 'GRUEN' ? '' : '(A blind)') : j.urteil;
        console.log(u + ' | ' + (j.abbruch || '') + ' | ' + rest.slice(0, 6).join(' ; '));
      } catch (e) { console.log('KEIN-JSON | ' + e.message); }" $OUT/$N.json $X)
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
  stopp
  say "$N Pause 60 s  $(ruhe)"
  sleep 60
done
stopp
say "ALLES ENDE"
