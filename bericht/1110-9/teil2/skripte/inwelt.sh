#!/bin/bash
# 1110-9 Teil 2 Bild-Paare in EINER Welt: Sitzung A (tor-vorher) gibt die Tor-Geometrie ab, Sitzung B (welle-m-e-tor) zeigt
# B1 · A1 · B2 · A2 (je der volle Bild-Satz von tor-bild.cjs), der Tausch je Mesh (geo.cjs).
B0=/c/Users/micha/Desktop/AnazhRealm-OMEN; H=$B0/p3/tor/bild; INS=$B0/welle-m-e-tor
export WERKBANK_PORT=7907
W="node $INS/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $H/inwelt.log; }
if [ ! -f $H/geoA/070.json ]; then $H/sitzung.sh WA $B0/tor-vorher
$W fenster 1920 1080 > /dev/null; $W umstellen --ort genesis > $H/daten/WA-umstellen.json 2>&1
say "WA $(node $H/geo.cjs dump 7907 "$(cd $H && pwd -W)/geoA" 2>&1 | tail -1)"
$W stop > /dev/null 2>&1; sleep 3; fi
$H/sitzung.sh WB $B0/welle-m-e-tor
$W fenster 1920 1080 > /dev/null; $W umstellen --ort genesis > $H/daten/WB-umstellen.json 2>&1
say "WB $(node $H/geo.cjs laden 7907 "$(cd $H && pwd -W)/geoA" 2>&1 | tail -1)"
for N in B1 A1 B2 A2; do
  say "WB $(node $H/geo.cjs setze 7907 ${N:0:1} 2>&1 | tail -1)"
  node $H/tor-bild.cjs 7907 "$(cd $H && pwd -W)/W-$N" > $H/daten/W-$N-bild.log 2>&1
  say "W-$N tor-bild exit=$? $(head -1 $H/daten/W-$N-bild.log | cut -c1-160)"
done
$W stop > /dev/null 2>&1; sleep 2
powershell -NoProfile -c "Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | ? { \$_.LocalPort -eq 7907 -or \$_.LocalPort -eq 7908 } | % { Stop-Process -Id \$_.OwningProcess -Force -ErrorAction SilentlyContinue }" > /dev/null 2>&1
say "INWELT ENDE"
