#!/bin/bash
# 0710-1 P2: ABABABAB mit dem EINEN Instrument (omen-messfolge.cjs aus mess-kmw), A = Basis (mess-d 78d66a63 = 6f1aa252),
# B = host-vram (Schnitt). Die Seite liefert nur die Welt (save-server A :7902, B :7901, laufen durch); Werkbank :7900.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/mess-kmw
OUT=$BASE/p2/abab; mkdir -p $OUT
LOG=$OUT/fortschritt.log
A=$BASE/mess-d; B=$BASE/host-vram
MAXWDH=2
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'werkbank|omen-messfolge' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
ruhe() { echo "GPU[$(nvidia-smi --query-gpu=temperature.gpu,clocks.gr,utilization.gpu,pstate --format=csv,noheader 2>/dev/null)]"; }
shaA=$(sha256sum $A/anazhRealm.js | cut -c1-16); shaB=$(sha256sum $B/anazhRealm.js | cut -c1-16)
say "SERIE START A=$(git -C $A log -1 --format=%h) B=$(git -C $B log -1 --format=%h) Instrument=$(git -C $INSTR log -1 --format=%h) | A $shaA B $shaB"
i=0
for X in A B A B A B A B; do
  i=$((i+1)); N=$i$X
  [ $X = A ] && { SEITE=7902; SOLL=$shaA; } || { SEITE=7901; SOLL=$shaB; }
  wdh=0
  while :; do
    stopp
    IST=$(curl -s http://localhost:$SEITE/anazhRealm.js | sha256sum | cut -c1-16)
    if [ "$IST" != "$SOLL" ]; then say "$N SEITEN-WACHE ROT: :$SEITE liefert $IST, soll $SOLL — Abbruch"; exit 3; fi
    say "$N boot (Versuch $((wdh+1))) Seite $X :$SEITE $(ruhe)"
    (cd $INSTR && timeout 2700 node scripts/omen-messfolge.cjs --port 7900 --seite http://localhost:$SEITE --datei $OUT/$N.json > $OUT/$N.log 2>&1)
    ec=$?
    stopp
    U=$(node -e "try{const j=require(process.argv[1]);console.log(j.urteil+' | '+(j.abbruch||'')+' | '+j.befunde.slice(0,4).join(' ; '))}catch(e){console.log('KEIN-JSON | '+e.message)}" $OUT/$N.json)
    say "$N exit=$ec $U"
    grep -E "laufVoll|laufFrei|gpu-bank|band:" $OUT/$N.log | sed "s/^/      /" >> $LOG
    case "$U" in GRUEN*) break;; esac
    wdh=$((wdh+1))
    [ -f $OUT/$N.json ] && mv $OUT/$N.json $OUT/$N-verworfen-$wdh.json
    mv $OUT/$N.log $OUT/$N-verworfen-$wdh.log 2>/dev/null
    if [ $wdh -gt $MAXWDH ]; then say "$N nach $MAXWDH Wiederholungen weiter rot — Slot leer"; break; fi
    say "$N verworfen ($wdh), wiederhole"; sleep 30
  done
  sleep 60
done
stopp
say "ALLES ENDE"
