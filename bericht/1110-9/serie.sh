#!/bin/bash
# 1110-9 Teil 1: E am Stand integ-probe da90ee92 auf der GTX 1060 — je Boot frisch, EIN Instrument (omen-messfolge aus
# welle-m-e-messung: Genesis mit Lauf voll, Dorf-Folge, Takt je Lauf und Bank). Wiese ×3, Genesis ×3, Dorf ×2.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/e-mess
SEITE=$BASE/e-mess
OUT=$BASE/e1109; LOG=$OUT/fortschritt.log
export WERKBANK_PORT=4490
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
SOLL=$(sha256sum $SEITE/anazhRealm.js | cut -c1-16)
seite() {
  (cd $SEITE && PORT=4312 node save-server.js > $OUT/$1-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  local ist; ist=$(curl -s http://localhost:4312/anazhRealm.js | sha256sum | cut -c1-16)
  if [ "$ist" != "$SOLL" ]; then say "$1 SEITEN-WACHE ROT: $ist, soll $SOLL"; stopp; exit 3; fi
}
say "SERIE START Seite=$(git -C $SEITE log -1 --format=%h) ($SOLL) Instrument=$(git -C $INSTR log -1 --format=%h)"
for N in w1 g1 d1 w2 g2 d2 w3 g3; do
  case $N in w*) ORT=wiese; T=2700;; g*) ORT=genesis; T=1800;; d*) ORT=dorf; T=1800;; esac
  stopp; seite $N
  (cd $INSTR && timeout $T node scripts/omen-messfolge.cjs --ort $ORT --seite http://localhost:4312 --datei $OUT/$N.json > $OUT/$N.log 2>&1)
  ec=$?
  say "$N ($ORT) exit=$ec $(grep -aE 'laufVoll|lauf-voll|band ' $OUT/$N.log | tr -s ' ' | tail -3 | tr '\n' ' ' | cut -c1-260)"
  sleep 30
done
stopp
say "SERIE ENDE"
