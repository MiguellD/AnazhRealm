#!/bin/bash
# 1110-9 Teil 2: Genesis-ABAB mit Takt — A = vorher (tor-vorher, integ-probe 858ed586), B = nachher (welle-m-e-tor, das
# Detail-Gesetz). Je Boot frisch, EIN Instrument (omen-messfolge aus e-mess / welle-m-e-messung 3ccdcaea: Genesis mit Lauf
# voll und Takt). Folge A B A B A B; die Seiten-Wache prüft je Boot den servierten porta-core.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/e-mess
OUT=$BASE/p3/tor/abab; LOG=$OUT/fortschritt.log
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
  local soll ist; soll=$(sha256sum $2/porta-core.js | cut -c1-16); ist=$(curl -s http://localhost:4312/porta-core.js | sha256sum | cut -c1-16)
  if [ "$ist" != "$soll" ]; then say "$1 SEITEN-WACHE ROT: porta-core $ist, soll $soll"; stopp; exit 3; fi
  HASH=$ist  # global: kein $(…) um seite — der Hintergrund-Server erbt unter Windows die Pipe und hält sie offen
}
say "SERIE START A=$(git -C $BASE/tor-vorher log -1 --format=%h) ($(sha256sum $BASE/tor-vorher/porta-core.js | cut -c1-16)) B=$(git -C $BASE/welle-m-e-tor log -1 --format=%h)+Arbeitsbaum ($(sha256sum $BASE/welle-m-e-tor/porta-core.js | cut -c1-16)) Instrument=$(git -C $INSTR log -1 --format=%h)"
for N in gA1 gB1 gA2 gB2 gA3 gB3; do
  case $N in gA*) WT=$BASE/tor-vorher;; gB*) WT=$BASE/welle-m-e-tor;; esac
  stopp; seite $N $WT; h=$HASH
  (cd $INSTR && timeout 1800 node scripts/omen-messfolge.cjs --ort genesis --seite http://localhost:4312 --datei $OUT/$N.json > $OUT/$N.log 2>&1)
  ec=$?
  say "$N porta-core=$h exit=$ec $(grep -aE 'laufVoll|lauf-voll|band ' $OUT/$N.log | tr -s ' ' | tail -2 | tr '\n' ' ' | cut -c1-260)"
  sleep 30
done
stopp
say "SERIE ENDE"
