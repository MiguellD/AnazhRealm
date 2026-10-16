#!/bin/bash
# 1610-ZWEIGIPFEL, die Bau-Klasse zerlegt (nach Lauf 3b an main 210fe8a7: der langsame Gipfel ist die Bau-Klasse, zerlegen
# b2 schnell 1,21 gegen b5 langsam 2,14 ms bei gleichen Befehlen; alle übrigen Klassen gleich). Boots an Genesis Ego (main
# 210fe8a7; ab 16.10. 07:35 an f6fa9f63, abab-pf6f = Seite und Instrument: FW nimmt den leichten Zustand, 7/8 an 210fe8a7), bis je ein langsamer (Durchsatz ≥ 12,3) und ein schneller (≤ 12,0) Boot vorliegt
# (höchstens 8; der leichte Zustand mit 120 fps und „Destroyed texture horizont-karte“ je Frame zählt nicht). Je solchem Boot
# split.cjs: das Inventar der Bau-Objekte und je Teil-Klasse (Tore f:gt:L1, bauSatz, Start-Plattform, Welt-Studios, Esse,
# bauWurf) der Preis an/aus, ABBA × 3. Wartet auf das Ende der FW-Serie, unter dem GPU-Schloss.
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1610bau; HW=$(cygpath -m $H); R=/c/Users/micha/Desktop/AnazhRealm-OMEN; L=$H/fortschritt.log
WT=$R/abab-pf6f; INS=$R/abab-pf6f; export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"; WBW=$(cygpath -m $INS/scripts/werkbank.cjs)
until grep -q "SERIE FERTIG" $R/p3/k1610t2/fortschritt.log 2>/dev/null; do sleep 30; done
. $R/p3/gpu-schloss.sh; schloss_nehmen "omen-genesis-ego bau"; trap 'schloss_loesen "omen-genesis-ego bau"' EXIT
nachtruhe() { while :; do hm=$((10#$(date +%H%M))); if [ $hm -ge 325 ] && [ $hm -lt 415 ]; then sleep 60; else break; fi; done; }
stopp() { $W stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1; sleep 2; }
echo "$(date +%T) BAU-SPLIT START Kopf=$(git -C $WT log -1 --format=%h)" >> $L
langsam=0; schnell=0
for N in 1 2 3 4 5 6 7 8; do
  [ $langsam -ge 1 ] && [ $schnell -ge 1 ] && break
  nachtruhe; stopp
  mkdir -p $H/stand/$N; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $H/stand/$N/ 2>/dev/null
  (cd $WT && PORT=4312 node save-server.js > $H/b$N-server.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
  (cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort genesis > $H/b$N-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $H/b$N-werkbank.log 2>/dev/null && break; sleep 5; done
  $W fenster 1920 1080 > /dev/null
  $W umstellen --ort genesis --sicht ego > $H/b$N-umstellen.txt 2>&1
  $W lauf 10 --ein 30 --ruhe 300 --regler voll --tiere frei > $H/b$N-ein.txt 2>&1
  $W lauf 30 --ein 2 --regler voll --tiere frei > $H/b$N-lauf.txt 2>&1
  Z=$(node -e "const t=require('fs').readFileSync('$HW/b$N-lauf.txt','utf8');const j=JSON.parse(t.slice(t.indexOf('{')));const d=j.gpuDurchsatzMs.p50;const leer=(j.fehler||[]).some(x=>/Destroyed texture/.test(x))||j.fps>110;console.log(leer?'leicht':d>=12.3?'langsam':d<=12.0?'schnell':'mitte')")
  echo "$(date +%T) b$N Zustand $Z ($(grep -o '"fps": [0-9.]*' $H/b$N-lauf.txt | head -1))" >> $L
  if { [ "$Z" = langsam ] && [ $langsam -lt 1 ]; } || { [ "$Z" = schnell ] && [ $schnell -lt 1 ]; }; then
    node $H/split.cjs $WBW $HW/b$N-split-$Z.json > $H/b$N-split-$Z.txt 2>&1
    $W lauf 30 --ein 2 --regler voll --tiere frei > $H/b$N-lauf2.txt 2>&1
    [ "$Z" = langsam ] && langsam=$((langsam + 1)); [ "$Z" = schnell ] && schnell=$((schnell + 1))
    echo "$(date +%T) b$N gespalten ($Z): $(tr '\n' ';' < $H/b$N-split-$Z.txt | tr -s ' ' | cut -c1-600)" >> $L
  fi
  stopp; sleep 30
done
echo "$(date +%T) BAU-SPLIT FERTIG langsam=$langsam schnell=$schnell" >> $L
