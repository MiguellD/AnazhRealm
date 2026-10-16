#!/bin/bash
# 1510-a9e: die Zuordnung der Pipeline-Absage (17 gesampelte Texturen > 16 im Fragment, `bild` an der Wiese bei Uhr 0,72 und
# 0,0 in d5deed14): je Kopf eine Welt an Wiese Ego mit der GPU-Fehler-Linse (`start --gpu-fehler`: jede WebGPU-Validierung mit
# Pass und Objekt beim Namen), Bild bei Uhr 0,5 und 0,72; Köpfe d5deed14 (B, + D3-2 + D10) und a9e21f17 (ohne D3-2, mit D10),
# EIN Instrument abab-pd5d. Läuft nach der a9e-Serie, unter dem GPU-Schloss.
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1510a9e; R=/c/Users/micha/Desktop/AnazhRealm-OMEN; L=$H/fortschritt.log; D=$H/bild-probe
INS=$R/abab-pd5d; export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"; mkdir -p $D
until grep -q "SERIE FERTIG" $L 2>/dev/null; do sleep 30; done
. $R/p3/gpu-schloss.sh; schloss_nehmen "omen-abab a9e bild"; trap 'schloss_loesen "omen-abab a9e bild"' EXIT
stopp() { $W stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1; sleep 2; }
for N in d5d a9e; do
  WT=$R/abab-pd5d; [ $N = a9e ] && WT=$R/abab-pa9e
  [ -f $D/$N-bild-0.72.txt ] && continue
  echo "$(date +%T) bild-probe $N start" >> $L; stopp
  mkdir -p $D/stand/$N; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $D/stand/$N/ 2>/dev/null
  (cd $WT && PORT=4312 node save-server.js > $D/$N-server.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
  (cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort wiese --gpu-fehler > $D/$N-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $D/$N-werkbank.log 2>/dev/null && break; sleep 5; done
  $W fenster 1920 1080 > /dev/null
  $W umstellen --ort wiese --sicht ego > $D/$N-umstellen.txt 2>&1
  $W lauf 10 --ein 30 --ruhe 300 --regler voll --tiere frei > $D/$N-ein.txt 2>&1
  $W gpu-fehler > $D/$N-gpufehler-loop.txt 2>&1
  P=$($W eval "const p = r.state.playerMesh.position; const f = r.state.forward || { x: 0, z: -1 }; return [p.x, p.y + 1.6, p.z, p.x + f.x * 40, p.y - 2, p.z + f.z * 40].map((v) => +v.toFixed(2)).join(' ')" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s.slice(s.indexOf('{')));console.log(j.ergebnis)})")
  for U in 0.5 0.72; do $W bild $P --uhr $U --datei $D/$N-bild-$U.png --w 1280 --h 720 > $D/$N-bild-$U.txt 2>&1; done
  $W gpu-fehler > $D/$N-gpufehler-bild.txt 2>&1
  stopp; echo "$(date +%T) bild-probe $N ende" >> $L; sleep 20
done
echo "$(date +%T) BILD-PROBE FERTIG" >> $L
