#!/bin/bash
# 1810 F6 Schritt 3: EIN Blick nachts an der Mess-Wiese, Ausgabe-Pfad (__ausgabeAufnahme), A und B in derselben Pose und Uhrzeit.
# Je Sitzung: save-server 4312 aus dem Baum der Seite (Seiten-Wache), Werkbank aus A (n1810-f6a), dorf-aus · fenster 1920×1080 ·
# umstellen --ort wiese --sicht ego · lauf 10 --ein 20 --ruhe 300 (die Welt ruht) · Nacht (Uhr ZEIT gehalten, 120 Takte, Uhren fest)
# · zwei Blicke (Messort-Blick WSW, Gegenblick). Folge: A1 B1 A2 B2 (A1↔A2, B1↔B2 = Kontrollpaare). GPU-Schloss um jede Sitzung.
# Seiten nach WEITER: A = n1810-f6m (main f45ee994), B = n1810-f6b (Baum 8e54c6c7 = 018945d5); Instrument n1710-g8 (9b3acc1d).
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
A=$BASE/n1810-f6m; B=$BASE/n1810-f6b; INS=$BASE/n1710-g8
OUT=$BASE/p3/n1810/f6; H=$OUT/nacht; LOG=$H/fortschritt.log; K14=$BASE/p3/k14; mkdir -p $H $OUT/stand
ZEIT=${ZEIT:-0}
export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil|puppeteer' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
beiseite() { mkdir -p $OUT/stand/$1; mv $2/anazhRealmState.json $2/anazhRealmState.json.bak $2/anazhRealmPerf.json $OUT/stand/$1/ 2>/dev/null; return 0; }
. $BASE/p3/gpu-schloss.sh
HW=$(cd $H && pwd -W)
for N in ${LAEUFE:-A1 B1 A2 B2}; do
  case $N in A*) WT=$A;; B*) WT=$B;; esac
  D=$H/$N; mkdir -p $D; DW=$(cd $D && pwd -W)
  schloss_nehmen omen-1710-n; stopp; beiseite nacht-$N $WT
  (cd $WT && PORT=4312 node save-server.js > $D/save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  FP=$(node $K14/fingerabdruck.cjs $WT 2>>$LOG) || { say "$N SEITEN-WACHE ROT"; stopp; schloss_loesen omen-1710-n; exit 3; }
  (cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort wiese > $D/werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $D/werkbank.log 2>/dev/null && break; sleep 5; done
  say "$N bereit $(git -C $WT log --oneline -1 | cut -c1-8) FP=$FP gpu[$(nvidia-smi --query-gpu=clocks.gr,temperature.gpu --format=csv,noheader)]"
  $W eval "window.__gf = []; r.state.renderer.backend.device.addEventListener('uncapturederror', (e) => window.__gf.push(String((e.error && e.error.message) || e).slice(0, 200))); return 1" > /dev/null 2>&1
  $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null 2>&1
  $W fenster 1920 1080 > $D/fenster.txt 2>&1
  $W umstellen --ort wiese --sicht ego > $D/umstellen.txt 2>&1
  $W lauf 10 --ein 20 --ruhe 300 --regler voll --tiere frei > $D/lauf.txt 2>&1
  $W eval "$(sed "s#__ZEIT__#$ZEIT#" $OUT/nacht-stellen.js)" > $D/nacht-stellen.json 2>&1
  say "$N nacht $(tr -d '\n ' < $D/nacht-stellen.json | cut -c1-260)"
  nb() {
    local js; js=$(sed "s#__BLICK__#$2#" $OUT/nacht-bild.js)
    $W eval "$js" > $D/$1.json 2>&1
    node -e "const fs=require('fs'); const t=fs.readFileSync(process.argv[1],'utf8'); const j=JSON.parse(t.slice(t.indexOf('{'))).ergebnis; if(!j||!j.png){console.log('$1 FEHLER '+t.slice(0,200));process.exit(0);} fs.writeFileSync(process.argv[2], Buffer.from(j.png.split(',')[1], 'base64')); delete j.png; fs.writeFileSync(process.argv[1], JSON.stringify(j)); console.log(JSON.stringify(j))" "$DW/$1.json" "$DW/$1.png"
  }
  {
    nb blick  '{"name":"blick","px":-280.4,"py":1.6,"pz":-1045.6,"lx":-289.6,"ly":1.6,"lz":-1049.5}'
    nb gegen  '{"name":"gegen","px":-280.4,"py":1.6,"pz":-1045.6,"lx":-271.2,"ly":1.6,"lz":-1041.7}'
  } > $D/bilder.txt 2>&1
  say "$N bilder $(tr '\n' ' ' < $D/bilder.txt | cut -c1-400)"
  $W eval "return window.__gf || ['kein Hoerer']" > $D/gpufehler.txt 2>&1
  say "$N gpu-fehler: $(tr -d '\n ' < $D/gpufehler.txt | cut -c1-160)"
  $W stop > /dev/null 2>&1
  FP2=$(node $K14/fingerabdruck.cjs $WT 2>>$LOG) || FP2=ROT
  [ "$FP2" = "$FP" ] || say "$N SEITEN-WACHE NACHHER ROT"
  stopp; beiseite nacht-$N-nach $WT; schloss_loesen omen-1710-n; sleep 30
done
say "NACHT ENDE"
