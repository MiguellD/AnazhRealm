#!/bin/bash
# 1610-Nachmessen: Wiese Ego bei Uhr 0,72 mit der GPU-Fehler-Linse (`start --gpu-fehler`): je Kopf eine Welt, A d5deed14 (die Absage
# der 17. Textur) und B 210fe8a7 (G1: jeder Renderer verlangt die Grenzen des Adapters — erwartet 0 Absagen); EIN Instrument
# abab-p210. Läuft unter dem Schloss der Serie.
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1610n; R=/c/Users/micha/Desktop/AnazhRealm-OMEN; L=$H/fortschritt.log; D=$H/bild
INS=$R/abab-p210; export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"; mkdir -p $D
stopp() { $W stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1; sleep 2; }
for N in d5d 210; do
  WT=$R/abab-pd5d; [ $N = 210 ] && WT=$R/abab-p210
  [ -f $D/$N-bild-0.72.txt ] && continue
  echo "$(date +%T) bild $N start" >> $L; stopp
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
  for U in 0.72; do $W bild $P --uhr $U --datei $D/$N-bild-$U.png --w 1280 --h 720 > $D/$N-bild-$U.txt 2>&1; done
  $W gpu-fehler > $D/$N-gpufehler-bild.txt 2>&1
  stopp; echo "$(date +%T) bild $N ende" >> $L; sleep 20
done
echo "$(date +%T) BILD FERTIG" >> $L
