#!/bin/bash
# 1610-ZWEIGIPFEL, der Bau-Satz zerlegt (split2.cjs): Genesis Ego, je Kopf EINE Welt — f6fa9f63 (abab-pf6f, an Genesis Ego 8/8 langsam)
# und main 27ae78bf (abab-p27a); je Welt die Zeichen-Reihe des Bau-Satzes (renderOrder 0/+10/−10) und je Bau-Satz-Mesh der Preis.
# Je Kopf höchstens 3 Boots, bis ein Boot im erwarteten Zustand steht (f6fa: langsam; 27ae: schnell, sonst der erste).
# Wartet auf die V2-Serie, unter dem GPU-Schloss (vor dem Mint, der auf seine Freigabe wartet).
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1610bau; HW=$(cygpath -m $H); R=/c/Users/micha/Desktop/AnazhRealm-OMEN; L=$H/fortschritt2.log
export WERKBANK_PORT=4490
until grep -q "SERIE FERTIG" $R/p3/k1610v2/fortschritt.log 2>/dev/null; do sleep 30; done
. $R/p3/gpu-schloss.sh; schloss_nehmen "omen-genesis-ego satz"; trap 'schloss_loesen "omen-genesis-ego satz"' EXIT
nachtruhe() { while :; do hm=$((10#$(date +%H%M))); if [ $hm -ge 325 ] && [ $hm -lt 415 ]; then sleep 60; else break; fi; done; }
for KOPF in f6f 27a; do
  WT=$R/abab-p$KOPF; [ $KOPF = f6f ] && WT=$R/abab-pf6f; INS=$WT; W="node $INS/scripts/werkbank.cjs"; WBW=$(cygpath -m $INS/scripts/werkbank.cjs)
  stopp() { $W stop > /dev/null 2>&1; sleep 2
    powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
    powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1; sleep 2; }
  echo "$(date +%T) SATZ $KOPF START Kopf=$(git -C $WT log -1 --format=%h)" >> $L
  for N in 1 2 3; do
    nachtruhe; stopp; T=$H/s2-$KOPF-b$N
    mkdir -p $H/stand2/$KOPF-$N; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $H/stand2/$KOPF-$N/ 2>/dev/null
    (cd $WT && PORT=4312 node save-server.js > $T-server.log 2>&1 &)
    for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
    (cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort genesis > $T-werkbank.log 2>&1 &)
    for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $T-werkbank.log 2>/dev/null && break; sleep 5; done
    $W fenster 1920 1080 > /dev/null
    $W umstellen --ort genesis --sicht ego > $T-umstellen.txt 2>&1
    $W lauf 10 --ein 30 --ruhe 300 --regler voll --tiere frei > $T-ein.txt 2>&1
    $W lauf 30 --ein 2 --regler voll --tiere frei > $T-lauf.txt 2>&1
    Z=$(node -e "const t=require('fs').readFileSync('$HW/s2-$KOPF-b$N-lauf.txt','utf8');const j=JSON.parse(t.slice(t.indexOf('{')));const d=j.gpuDurchsatzMs.p50;const leer=(j.fehler||[]).some(x=>/Destroyed texture/.test(x))||j.fps>110;console.log(leer?'leicht':d>=12.3?'langsam':d<=12.0?'schnell':'mitte')")
    echo "$(date +%T) $KOPF b$N Zustand $Z ($(grep -o '"fps": [0-9.]*' $T-lauf.txt | head -1))" >> $L
    WILL=langsam; [ $KOPF = 27a ] && WILL=schnell
    if [ "$Z" = "$WILL" ] || { [ $N = 3 ] && [ "$Z" != leicht ]; }; then
      node $H/split2.cjs $WBW $HW/s2-$KOPF-b$N-$Z.json > $T-$Z.txt 2>&1
      $W lauf 30 --ein 2 --regler voll --tiere frei > $T-lauf2.txt 2>&1
      echo "$(date +%T) $KOPF b$N zerlegt ($Z): $(tr '\n' ';' < $T-$Z.txt | tr -s ' ' | cut -c1-900)" >> $L
      stopp; break
    fi
    stopp; sleep 30
  done
done
echo "$(date +%T) SATZ FERTIG" >> $L
