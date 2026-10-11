#!/bin/bash
# 1110-5 Beweisbilder im Software-Holz (holz voll): die Rampe von oben, Sonne 22° aus Azimut 45° (N·L −0,002), mit und ohne
# Schatten, main (abab-b541 2c8deda9) gegen Kopf (welle-m-hang-akne).
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
OUT=$BASE/p3/ak/bilder; mkdir -p $OUT
for S in main kopf; do
  [ $S = main ] && WT=$BASE/abab-b541 || WT=$BASE/welle-m-hang-akne
  cd $WT
  export WERKBANK_PORT=7906
  W="node scripts/werkbank.cjs"
  $W stop > /dev/null 2>&1; sleep 3
  (node scripts/werkbank.cjs start --port 7906 --holz voll > $OUT/$S-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/$S-werkbank.log 2>/dev/null && break; sleep 3; done
  $W umstellen --ort buehne --pose ost > /dev/null 2>&1
  $W umstellen 0 120 > /dev/null 2>&1
  $W eval "$(sed 's/__VARIANTE__/{e:22,az:45}/' $BASE/p3/ak/rampe-az.js | sed 's/if (V.bild)/if (true)/')" > $OUT/$S.json 2>&1
  node -e "const t=require('fs').readFileSync('$OUT/$S.json','utf8');const j=JSON.parse(t.slice(t.indexOf('{')));const e=j.ergebnis;for(const k of ['an','aus'])require('fs').writeFileSync('$OUT/$S-'+k+'.png',Buffer.from(e[k].split(',')[1],'base64'));console.log('$S ok')"
  $W stop > /dev/null 2>&1; sleep 3
done
