#!/bin/bash
# 1510-a9e-abab, D10-ZERLEGUNG: frisst der Spiegel-Takt (D10, wasser-gesetz-strahl: Strahlen in 1/4 Auflösung gegen ein
# Spiegel-Feld im voxel-worker, läuft auch ohne Wasser im Bild) den CPU-Takt? A = ffe0e956 (vor D10, abab-pffe), B = d5deed14
# (abab-pd5d = Instrument, + D3-2 EINE Atmosphäre), an Wiese Ego und Genesis Third, je Folge A B B A: Boot (`start --ort`), umstellen, einschwingen,
# lauf 30 (CPU-Takt p50/p95), dann die Takt-Linse 300 Takte (Render ruht) mit jeder `_spiegel*`- und `_atmo*`-Methode (A hat sie nicht:
# die Linse überspringt sie). Je Ort (Wiese, Genesis, Dorf) zwei Bilder von B bei Uhr 0,72 und 0,0. Läuft unter dem
# Schloss der Serie.
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1510a9e; R=/c/Users/micha/Desktop/AnazhRealm-OMEN; L=$H/fortschritt.log; D=$H/d10
INS=$R/abab-pd5d; export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"; mkdir -p $D
EXTRA=_spiegelPass,_spiegelPassWach,_spiegelPassRechne,_spiegelPassZeichne,_spiegelFeld,_spiegelFeldAuftraege,_spiegelWasserImBild,_spiegelKronen,_spiegelLeser,_spiegelZielMass,_spiegelHoechsteAller,_spiegelStreuGestalt,_atmoAugeKm,_atmoGesetz,_atmoKern,_atmoLutBau,_atmoMedium,_atmoMediumJetzt,_atmoRechnung,_atmoSonne,_atmoSternenLicht,_atmoTakt,_atmoZeichne
stopp() { $W stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1; sleep 2; }
# je Ort zwei Bilder von B aus dem Ausgabe-Pfad in den Messblick (Auge des Spielers, 40 m voraus): Uhr 0,72 und 0,0 (D3-2: die
# Nacht mit Mond und Sternen-Licht ist neu)
bilder() {
  local P
  P=$($W eval "const p = r.state.playerMesh.position; const f = r.state.forward || { x: 0, z: -1 }; return [p.x, p.y + 1.6, p.z, p.x + f.x * 40, p.y - 2, p.z + f.z * 40].map((v) => +v.toFixed(2)).join(' ')" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s.slice(s.indexOf('{')));console.log(j.ergebnis)})")
  for U in 0.72 0.0; do $W bild $P --uhr $U --datei $D/$1-bild-$U.png --w 1280 --h 720 > $D/$1-bild-$U.txt 2>&1; done
}
for OS in wiese-ego genesis-third; do
  ORT=${OS%-*}; SICHT=${OS#*-}
  for N in A1 B1 B2 A2; do
    [ -f $D/$OS-$N-takt.txt ] && continue
    WT=$R/abab-pffe; [ ${N:0:1} = B ] && WT=$R/abab-pd5d
    echo "$(date +%T) d10 $OS-$N start" >> $L; stopp
    mkdir -p $D/stand/$OS-$N; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $D/stand/$OS-$N/ 2>/dev/null
    (cd $WT && PORT=4312 node save-server.js > $D/$OS-$N-server.log 2>&1 &)
    for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
    (cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort $ORT > $D/$OS-$N-werkbank.log 2>&1 &)
    for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $D/$OS-$N-werkbank.log 2>/dev/null && break; sleep 5; done
    $W fenster 1920 1080 > /dev/null
    $W umstellen --ort $ORT --sicht $SICHT > $D/$OS-$N-umstellen.txt 2>&1
    $W lauf 10 --ein 30 --ruhe 300 --regler voll --tiere frei > $D/$OS-$N-ein.txt 2>&1
    $W lauf 30 --ein 2 --regler voll --tiere frei > $D/$OS-$N-lauf.txt 2>&1
    $W takt 300 --extra $EXTRA > $D/$OS-$N-takt.txt 2>&1
    [ $N = B1 ] && bilder $OS-$N
    stopp; echo "$(date +%T) d10 $OS-$N ende" >> $L; sleep 30
  done
done
# der Dorf-Ort: nur die Bilder von B (die Nacht ist neu, D3-2)
if [ ! -f $D/dorf-B1-bild-0.0.png ]; then
  WT=$R/abab-pd5d; echo "$(date +%T) d10 dorf-B1 start (Bilder)" >> $L; stopp
  mkdir -p $D/stand/dorf-B1; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $D/stand/dorf-B1/ 2>/dev/null
  (cd $WT && PORT=4312 node save-server.js > $D/dorf-B1-server.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
  (cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort dorf > $D/dorf-B1-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $D/dorf-B1-werkbank.log 2>/dev/null && break; sleep 5; done
  $W fenster 1920 1080 > /dev/null
  $W umstellen --ort dorf --sicht ego > $D/dorf-B1-umstellen.txt 2>&1
  $W lauf 10 --ein 30 --ruhe 300 --regler voll --tiere frei > $D/dorf-B1-ein.txt 2>&1
  bilder dorf-B1
  stopp; echo "$(date +%T) d10 dorf-B1 ende" >> $L
fi
echo "$(date +%T) D10 FERTIG" >> $L
