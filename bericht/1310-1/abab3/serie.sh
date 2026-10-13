#!/bin/bash
# 1310-1 (1b): das Band-Delta der Tore per Boots — vier Seiten an der Genesis, je 3 frische Boots, EIN Instrument (abab-i543:
# omen-messfolge --ort genesis mit Lauf voll/frei, gpu-bank an der Gier des Orts mit Takt, Band). Folge im lateinischen
# Quadrat (M T Z G · G M T Z · Z G M T), die Seiten-Wache prüft je Boot den servierten porta-core.
#   M = main bb554abf (abab-b543)          — die Tore werfen aus Stufe 0, Fernform gesetz
#   T = welle-m-e-torwurf (porta-core von 52ac16d8) — Zwilling aus Stufe 3 + Kosten-Regel, Fernform huelle
#   Z = tw-ohne-zwilling (52ac16d8, Zeile 0 schatten: 0) — Stufe 0 wirft selbst, Fernform huelle
#   G = tw-gesetz (52ac16d8, fernform "gesetz") — Zwilling aus Stufe 3, Fernform gesetz
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/abab-i543
OUT=$BASE/p3/tor/abab3; LOG=$OUT/fortschritt.log
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
baum() { case $1 in M*) echo $BASE/abab-b543;; T*) echo $BASE/welle-m-e-torwurf;; Z*) echo $BASE/tw-ohne-zwilling;; G*) echo $BASE/tw-gesetz;; esac; }
say "SERIE START M=$(git -C $BASE/abab-b543 log -1 --format=%h) ($(sha256sum $BASE/abab-b543/porta-core.js | cut -c1-16)) T=$(git -C $BASE/welle-m-e-torwurf log -1 --format=%h) ($(sha256sum $BASE/welle-m-e-torwurf/porta-core.js | cut -c1-16)) Z ($(sha256sum $BASE/tw-ohne-zwilling/porta-core.js | cut -c1-16)) G ($(sha256sum $BASE/tw-gesetz/porta-core.js | cut -c1-16)) Instrument=$(git -C $INSTR log -1 --format=%h)+Genesis-Variante"
for N in M1 T1 Z1 G1 G2 M2 T2 Z2 Z3 G3 M3 T3; do
  WT=$(baum $N)
  stopp; seite $N $WT; h=$HASH
  (cd $INSTR && timeout 1800 node scripts/omen-messfolge.cjs --ort genesis --seite http://localhost:4312 --datei $OUT/$N.json > $OUT/$N.log 2>&1)
  ec=$?
  say "$N porta-core=$h exit=$ec $(grep -aE 'laufVoll|band ' $OUT/$N.log | tr -s ' ' | tail -2 | tr '\n' ' ' | cut -c1-200)"
  sleep 30
done
stopp
say "SERIE ENDE"
