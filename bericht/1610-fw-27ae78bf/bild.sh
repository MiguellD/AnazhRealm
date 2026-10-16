#!/bin/bash
# 1610-FW (1): Wiese Ego mit der GPU-Fehler-Linse (`start --gpu-fehler`) und einem RE-ANKER — je Kopf eine Welt, A 0d6c8bc1 (trägt
# den Fund „Destroyed texture horizont-karte used in a submit“, einmal je Boot) und B 27ae78bf (FW: eine gebundene Textur fällt erst
# nach dem Submit, `_texturAbschied`; Soll 0×). Je Welt: einschwingen an der Wiese · GPU-Fehler (Loop) · Re-Anker: umstellen nach
# Genesis (≈ 1,1 km: der Horizont legt seine Karte neu an) · lauf 10 · zurück an die Wiese · lauf 10 · GPU-Fehler · Bild 0,72 in
# Augenhöhe 80 m voraus. Die Konsole jedes Laufs (`fehler`) zählt die Zeile. EIN Instrument abab-p27a; unter dem Schloss der Serie.
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1610fw; R=/c/Users/micha/Desktop/AnazhRealm-OMEN; L=$H/fortschritt.log; D=$H/bild
INS=$R/abab-p27a; export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"; mkdir -p $D
stopp() { $W stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1; sleep 2; }
for N in 0d6 27a; do
  WT=$R/abab-p0d6; [ $N = 27a ] && WT=$R/abab-p27a
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
  # der Re-Anker: nach Genesis und zurück
  $W umstellen --ort genesis --sicht ego > $D/$N-umstellen-genesis.txt 2>&1
  $W lauf 10 --ein 10 --ruhe 120 --regler voll --tiere frei > $D/$N-genesis.txt 2>&1
  $W umstellen --ort wiese --sicht ego > $D/$N-umstellen-zurueck.txt 2>&1
  $W lauf 10 --ein 10 --ruhe 120 --regler voll --tiere frei > $D/$N-zurueck.txt 2>&1
  $W gpu-fehler > $D/$N-gpufehler-anker.txt 2>&1
  P=$($W eval "const p = r.state.playerMesh.position; const f = r.state.forward || { x: 0, z: -1 }; return [p.x, p.y + 1.6, p.z, p.x + f.x * 80, p.y + 1.6, p.z + f.z * 80].map((v) => +v.toFixed(2)).join(' ')" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s.slice(s.indexOf('{')));console.log(j.ergebnis)})")
  echo "$N Blick $P" >> $D/blick.txt
  $W bild $P --uhr 0.72 --datei $D/$N-bild-0.72.png --w 1280 --h 720 > $D/$N-bild-0.72.txt 2>&1
  $W gpu-fehler > $D/$N-gpufehler-bild.txt 2>&1
  echo "$(date +%T) bild $N: Destroyed-Zeilen $(cat $D/$N-ein.txt $D/$N-genesis.txt $D/$N-zurueck.txt $D/$N-bild-0.72.txt 2>/dev/null | grep -o 'Destroyed texture[^|]*' | sort | uniq -c | tr -s ' ' | tr '\n' ';')" >> $L
  stopp; echo "$(date +%T) bild $N ende" >> $L; sleep 20
done
echo "$(date +%T) BILD FERTIG" >> $L
