#!/bin/bash
# Messauftrag 1110-8: V18.541 (integ-probe 2c8deda9) gegen main (be1d6e57), mit Takt. EIN Instrument aus B (omen-messfolge mit
# Takt je Bank). Wiese: ABABABAB, A = be1d6e57. Bühne: ABABABAB, A' = 953186f4 (der Merge der Prüfbühne auf V18.539 — be1d6e57
# kennt das Erbgut der Bühne nicht; 953186f4 trägt keine Render-Änderung, 1110-4). Je Slot ein frischer Boot.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/abab-b541
OUT=$BASE/abab541; LOG=$OUT/fortschritt.log
A=$BASE/abab-b539; B=$BASE/abab-b541; AB=$BASE/takt-bisekt
export WERKBANK_PORT=4490
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
seite() { # $1 Worktree, $2 Soll-Hash, $3 Name
  (cd $1 && PORT=4312 node save-server.js > $OUT/$3-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  local ist; ist=$(curl -s http://localhost:4312/anazhRealm.js | sha256sum | cut -c1-16)
  if [ "$ist" != "$2" ]; then say "$3 SEITEN-WACHE ROT: $ist, soll $2"; stopp; exit 3; fi
}
git -C $AB -c core.autocrlf=false checkout -q -- anazhRealm.js 2>/dev/null; git -C $AB -c core.autocrlf=false checkout -q --detach 953186f4
shaA=$(sha256sum $A/anazhRealm.js | cut -c1-16); shaB=$(sha256sum $B/anazhRealm.js | cut -c1-16); shaAB=$(sha256sum $AB/anazhRealm.js | cut -c1-16)
say "SERIE START A=be1d6e57 ($shaA) A'=953186f4 ($shaAB) B=2c8deda9 ($shaB) Instrument=$(git -C $INSTR log -1 --format=%h)"
i=0
for X in A B A B A B A B; do
  i=$((i+1)); N=w$i$X
  [ $X = A ] && D=$A && S=$shaA || { D=$B; S=$shaB; }
  stopp; seite $D $S $N
  (cd $INSTR && timeout 2700 node scripts/omen-messfolge.cjs --seite http://localhost:4312 --datei $OUT/$N.json > $OUT/$N.log 2>&1)
  say "$N exit=$? $(grep -aE 'gpu-bank Gier|laufFrei' $OUT/$N.log | sed 's/ · Tiere.*//; s/render-Wanduhr.*//' | tr -s ' ' | tr '\n' ' ' | cut -c1-240)"
  sleep 30
done
i=0
for X in A B A B A B A B; do
  i=$((i+1)); N=b$i$X
  [ $X = A ] && D=$AB && S=$shaAB || { D=$B; S=$shaB; }
  stopp; seite $D $S $N
  (cd $INSTR && timeout 1800 node scripts/omen-messfolge.cjs --ort buehne --seite http://localhost:4312 --datei $OUT/$N.json > $OUT/$N.log 2>&1)
  say "$N exit=$? $(grep -aE 'gpu-bank Pose' $OUT/$N.log | sed 's/gpu-bank Pose //; s/ ms je Frame (\([^;]*\);.*Takt \([0-9.]*\) MHz.*/ \2MHz/' | tr -s ' ' | tr '\n' ' ' | cut -c1-240)"
  sleep 20
done
stopp
git -C $AB -c core.autocrlf=false checkout -q --detach 66005ca6
say "SERIE ENDE"
