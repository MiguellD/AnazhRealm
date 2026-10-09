#!/bin/bash
# EINE Welt, die Szenen-Tiefe live getauscht (Abbild ↔ r184-Viewport-Tiefe, umgehängt über _tiefenLeserNeuBinden, den Weg
# des Resize): ABAB je drei Wasser-Blicke bei festen Uhren. ./ab-welt.sh  (Seite :7901 = host-vram, Werkbank :7900)
P2=/c/Users/micha/Desktop/AnazhRealm-OMEN/p2
WT=/c/Users/micha/Desktop/AnazhRealm-OMEN/host-vram
export WERKBANK_PORT=7900
W="node $WT/scripts/werkbank.cjs"
(cd $WT && node scripts/werkbank.cjs start --echt --port 7900 --seite http://localhost:7901 > $P2/werkbank-abwelt.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $P2/werkbank-abwelt.log 2>/dev/null && break; sleep 5; done
$W eval "window.__gpuFehlerP2 = []; r.state.renderer.backend.device.addEventListener('uncapturederror', (e) => window.__gpuFehlerP2.push(String((e.error && e.error.message) || e).slice(0, 200))); window.__anazhAutoSettlement = false; return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
$W umstellen --ort wiese > /dev/null
$W eval "return window.__buehne()" > /dev/null
$W band --datei $P2/abwelt-band.json > $P2/abwelt-band.txt 2>&1
echo "$(date +%T) eingeschwungen $(head -1 $P2/abwelt-band.txt | cut -c1-100)"
R184="r.__abbild = r.__abbild || [r._szeneTiefeKnoten, r._szeneTiefeWert]; r._szeneTiefeKnoten = T.TSL.viewportDepthTexture(); r._szeneTiefeWert = r._szeneTiefeKnoten; return [r._tiefenLeserNeuBinden(), r._szeneTiefeKnoten.constructor.name]"
ABBILD="r._szeneTiefeKnoten = r.__abbild[0]; r._szeneTiefeWert = r.__abbild[1]; return [r._tiefenLeserNeuBinden(), r._szeneTiefeKnoten.value && r._szeneTiefeKnoten.value.name]"
echo "$(date +%T) A1 Abbild $($W eval "return r._szeneTiefeKnoten.value && r._szeneTiefeKnoten.value.name" | tr -d '\n')"
bash $P2/wasser.sh $P2/bilder/ab-a1 7900 > $P2/abwelt.txt 2>&1
echo "$(date +%T) B1 r184 $($W eval "$R184" | tr -d '\n ')"
bash $P2/wasser.sh $P2/bilder/ab-b1 7900 >> $P2/abwelt.txt 2>&1
echo "$(date +%T) A2 Abbild $($W eval "$ABBILD" | tr -d '\n ')"
bash $P2/wasser.sh $P2/bilder/ab-a2 7900 >> $P2/abwelt.txt 2>&1
echo "$(date +%T) B2 r184 $($W eval "$R184" | tr -d '\n ')"
bash $P2/wasser.sh $P2/bilder/ab-b2 7900 >> $P2/abwelt.txt 2>&1
echo "$(date +%T) gpu-fehler $($W eval "return window.__gpuFehlerP2" | tr -d '\n')"
$W eval "$ABBILD" > /dev/null
$W stop > /dev/null 2>&1
echo "$(date +%T) gestoppt"
