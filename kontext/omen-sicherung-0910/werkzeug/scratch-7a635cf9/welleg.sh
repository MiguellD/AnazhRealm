#!/bin/bash
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
OUT=$BASE/welle-g2; mkdir -p $OUT
NUR=haupt,boden,baum,feldPass,karten,post,traa,traaKopien,nachbild,godrays,bloom,kontrast,leer
ZUSTAND="const s=r.state; return {wetter:s.weather, wet:s.weatherEffectTime, tag:s.timeOfDay, saison:s.season}"
stopp() {
  (cd $BASE/AnazhRealm-kandz && node scripts/werkbank.cjs stop >/dev/null 2>&1)
  powershell -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
for X in basis boden feld post; do
  case $X in basis) D=$BASE/AnazhRealm-kandz;; boden) D=$BASE/AnazhRealm-gboden;; feld) D=$BASE/AnazhRealm-gfeldpass;; post) D=$BASE/AnazhRealm-gpost;; esac
  stopp
  cd $D
  W="node scripts/werkbank.cjs"
  (PORT=4312 node save-server.js > $OUT/$X-save.log 2>&1 &)
  sleep 5
  $W start --echt > $OUT/$X-start.log 2>&1 &
  for t in $(seq 1 60); do grep -q "WERKBANK bereit" $OUT/$X-start.log 2>/dev/null && break; sleep 5; done
  echo "$X ($(git log -1 --format=%h)) bereit $(date +%T)"
  $W fenster 1920 1080 > $OUT/$X-fenster.json 2>&1
  $W umstellen -900 -850 > $OUT/$X-umstellen.json 2>&1
  $W eval "r.state.yaw = 0; r.state.pitch = 0; const b = window.__buehne(); r.state.weatherEffectTime = -1e7; return b" > $OUT/$X-frieren.json 2>&1
  $W lauf 10 --ein 30 --ruhe 300 --tiere frei > $OUT/$X-lauf.json 2>&1
  $W eval "$ZUSTAND" > $OUT/$X-zustand-anfang.json 2>&1
  $W zaehlen > $OUT/$X-zaehlen.json 2>&1
  echo "$X lauf fertig $(date +%T)"
  # Der post-Schalter stürzt auf f2361bb1 ab (weak map key) und kann den Zustand verschmutzen: auf basis/boden/feld
  # erst ohne post messen, post zuletzt einzeln probieren; auf dem POST-Zweig alles zusammen (Fallback ohne post).
  if [ $X = post ]; then
    $W zerlegen --nur $NUR --runden 8 --json artifacts/werkbank/zerlegen-$X.json --bilder $OUT/$X-bilder > $OUT/$X-zerlegen.txt 2>&1; RC=$?; echo "$X zerlegen exit $RC $(date +%T)"
    if [ $RC -ne 0 ] && grep -q "weak map key" $OUT/$X-zerlegen.txt; then
      $W zerlegen --nur ${NUR/post,/} --runden 8 --json artifacts/werkbank/zerlegen-$X.json --bilder $OUT/$X-bilder > $OUT/$X-zerlegen-ohne-post.txt 2>&1; echo "$X zerlegen ohne post exit $? $(date +%T)"
    fi
  else
    $W zerlegen --nur ${NUR/post,/} --runden 8 --json artifacts/werkbank/zerlegen-$X.json --bilder $OUT/$X-bilder > $OUT/$X-zerlegen.txt 2>&1; echo "$X zerlegen (ohne post) exit $? $(date +%T)"
  fi
  $W gpu-bank 12 --runden 3 > $OUT/$X-gpubank.json 2>&1
  $W eval "$ZUSTAND" > $OUT/$X-zustand-ende.json 2>&1
  $W schirm --datei $OUT/$X-schirm.png > $OUT/$X-schirm.json 2>&1
  if [ $X != post ]; then $W zerlegen --nur post,leer --runden 4 > $OUT/$X-post-probe.txt 2>&1; echo "$X post-probe exit $? $(date +%T)"; fi
  if [ $X = boden ]; then $W stoff --rauschprobe > $OUT/boden-rauschprobe.txt 2>&1; echo "boden rauschprobe exit $? $(date +%T)"; fi
  cp artifacts/werkbank/zerlegen-$X.json $OUT/ 2>/dev/null
  echo "$X fertig $(date +%T)"
done
stopp
echo "ALLES ENDE $(date +%T)"
