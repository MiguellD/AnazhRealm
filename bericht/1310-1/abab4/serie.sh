#!/bin/bash
# 1310-1 (2): der Schnitt „die Reihe der Bündel“ per Boots — A = main bb554abf (abab-b543), B = welle-m-e-torwurf mit dem
# Schnitt (Kopf + Arbeitsbaum), EIN Instrument (abab-i543). Genesis (Lauf voll/frei, Bank an der Gier des Orts mit Takt, Band)
# und Wiese (die Messfolge der Wiese), je 3 + 3 frische Boots im Wechsel; die Seiten-Wache prüft je Boot anazhRealm.js.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/abab-i543
OUT=$BASE/p3/tor/abab4; LOG=$OUT/fortschritt.log
export WERKBANK_PORT=4490
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
seite() { # $1 Boot, $2 Baum
  (cd $2 && PORT=4312 node save-server.js > $OUT/$1-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  local soll ist; soll=$(sha256sum $2/anazhRealm.js | cut -c1-16); ist=$(curl -s http://localhost:4312/anazhRealm.js | sha256sum | cut -c1-16)
  if [ "$ist" != "$soll" ]; then say "$1 SEITEN-WACHE ROT: anazhRealm.js $ist, soll $soll"; stopp; exit 3; fi
  HASH=$ist  # global: kein $(…) um seite — der Hintergrund-Server erbt unter Windows die Pipe und hält sie offen
}
say "SERIE START A=$(git -C $BASE/abab-b543 log -1 --format=%h) ($(sha256sum $BASE/abab-b543/anazhRealm.js | cut -c1-16)) B=$(git -C $BASE/welle-m-e-torwurf log -1 --format=%h)+Arbeitsbaum ($(sha256sum $BASE/welle-m-e-torwurf/anazhRealm.js | cut -c1-16)) Instrument=$(git -C $INSTR log -1 --format=%h)+Genesis-Variante"
for N in gA1 gB1 gA2 gB2 gA3 gB3 wA1 wB1 wA2 wB2 wA3 wB3; do
  case $N in ?A*) WT=$BASE/abab-b543;; ?B*) WT=$BASE/welle-m-e-torwurf;; esac
  case $N in g*) ORT="--ort genesis";; w*) ORT="";; esac
  stopp; seite $N $WT; h=$HASH
  (cd $INSTR && timeout 1800 node scripts/omen-messfolge.cjs $ORT --seite http://localhost:4312 --datei $OUT/$N.json > $OUT/$N.log 2>&1)
  ec=$?
  say "$N anazhRealm=$h exit=$ec $(grep -aE 'laufVoll|band ' $OUT/$N.log | tr -s ' ' | tail -2 | tr '\n' ' ' | cut -c1-200)"
  sleep 30
done
stopp
say "SERIE ENDE"
