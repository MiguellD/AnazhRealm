#!/bin/bash
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
OUT=$BASE/zerlegen-kand/ohne-post; mkdir -p $OUT
cd $BASE/AnazhRealm-kandz
W="node scripts/werkbank.cjs"
ZUSTAND="const s=r.state; return {wetter:s.weather, wet:s.weatherEffectTime, tag:s.timeOfDay, saison:s.season, welt:(document.querySelector('[class*=welt], #hud-world')||{}).textContent||null, hud:(document.body.innerText.match(/Welt\s*\S+/)||[null])[0]}"
npm start > $OUT/save.log 2>&1 &
sleep 5
$W start --echt > $OUT/start.log 2>&1 &
for t in $(seq 1 60); do grep -q "WERKBANK bereit" $OUT/start.log 2>/dev/null && break; sleep 5; done
echo "bereit $(git log -1 --format=%h) $(date +%T)"
$W fenster 1920 1080 > $OUT/fenster.json 2>&1
$W umstellen -900 -850 > $OUT/umstellen.json 2>&1
$W eval "r.state.yaw = 0; if (typeof r.state.pitch === 'number') r.state.pitch = 0; return {yaw: r.state.yaw, pitch: r.state.pitch}" > $OUT/blick.json 2>&1
$W lauf 10 --ein 30 --ruhe 300 --tiere frei > $OUT/lauf.json 2>&1
echo "lauf fertig $(date +%T)"
$W eval "$ZUSTAND" > $OUT/zustand-vor-frieren.json 2>&1
$W eval "const b = window.__buehne(); r.state.weatherEffectTime = -1e7; return b" > $OUT/frieren.json 2>&1
$W eval "$ZUSTAND" > $OUT/zustand-anfang.json 2>&1
$W gpu-bank 12 --runden 3 > $OUT/gpubank-vor.json 2>&1
$W zerlegen --selbsttest --nur haupt,schatten,k0,k1,traa,traaKopien,tiefenkopie,nachbild,bloom,godrays,kontrast,baum,tier,busch,boden,streu,nahWiese,bau,einzelstuecke,formationen,himmel,wasser,karten,feldPass,leer > $OUT/selbsttest.txt 2>&1; echo "selbsttest exit $? $(date +%T)"
$W eval "$ZUSTAND" > $OUT/zustand-mitte.json 2>&1
$W zerlegen --runden 6 --nur haupt,schatten,k0,k1,traa,traaKopien,tiefenkopie,nachbild,bloom,godrays,kontrast,baum,tier,busch,boden,streu,nahWiese,bau,einzelstuecke,formationen,himmel,wasser,karten,feldPass,leer --json artifacts/werkbank/zerlegen-omen-kand.json --bilder $OUT/bilder > $OUT/voll.txt 2>&1; echo "voll exit $? $(date +%T)"
$W eval "$ZUSTAND" > $OUT/zustand-ende.json 2>&1
$W gpu-bank 12 --runden 3 > $OUT/gpubank-nach.json 2>&1
$W schirm --datei $OUT/schirm-nach.png > $OUT/schirm.json 2>&1
cp artifacts/werkbank/zerlegen-omen-kand.json $OUT/ 2>/dev/null
$W stop > /dev/null 2>&1
powershell -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
echo "ALLES ENDE $(date +%T)"
