#!/bin/bash
# Ein Boot für 0910-1 B: ./boot.sh <name> <worktree> <seite-port>
# Startet den save-server aus <worktree>, die Werkbank (Instrument: welle-m-host-vram-2, Skripte = main) gegen ihn,
# stellt die Mess-Wiese wie die Messfolge, liest das Ausgabe-Format, fährt band + Ziel-Zensus, den Bild-Satz (Tag, Wasser,
# Wald, Himmel, Nacht, Abend, Ruhe-Paar) und die Bewegung, sammelt GPU-Fehler und stoppt alles.
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/hv2
INS=/c/Users/micha/Desktop/AnazhRealm-OMEN/welle-m-host-vram-2
N=$1; WT=$2; SEITE=$3; export WERKBANK_PORT=7904
W="node $INS/scripts/werkbank.cjs"
D=$H/daten; mkdir -p $D $H/bilder/$N
O=$(cd $H/bilder/$N && pwd -W)
say() { echo "$(date +%T) $N $*" | tee -a $H/boot.log; }
stopp() {
  $W stop > /dev/null 2>&1; sleep 3
  powershell -NoProfile -c "Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | ? { \$_.LocalPort -ge 7900 -and \$_.LocalPort -le 7909 } | % { Stop-Process -Id \$_.OwningProcess -Force -ErrorAction SilentlyContinue }" > /dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil-790' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
  sleep 2
}
stopp
(cd $WT && PORT=$SEITE node save-server.js > $D/$N-server.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:$SEITE/ 2>/dev/null | grep -q 200 && break; sleep 1; done
(cd $INS && node scripts/werkbank.cjs start --echt --port $WERKBANK_PORT --seite http://localhost:$SEITE > $D/$N-werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $D/$N-werkbank.log 2>/dev/null && break; sleep 5; done
say "bereit $(cd $WT && git log --oneline -1 | cut -c1-8) $(cd $WT && git status --short | wc -l) geändert"
$W eval "window.__gf = []; r.state.renderer.backend.device.addEventListener('uncapturederror', (e) => window.__gf.push(String((e.error && e.error.message) || e).slice(0, 200))); return 1" > /dev/null
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
$W umstellen --ort wiese > $D/$N-umstellen.json
$W eval "return window.__buehne()" > /dev/null
$W eval "r.state.yaw = 0; r.state.pitch = 0; return 1" > /dev/null
$W eval "const st = r.state, be = st.renderer.backend; const t = st.scenePass.renderTarget.texture; const g = be.get(t) && be.get(t).texture; const h = st.traaNode && st.traaNode._historyRenderTarget.texture; const gh = h && be.get(h) && be.get(h).texture; return { feature: be.device.features.has('rg11b10ufloat-renderable'), ausgabe: st._ausgabeFormat || null, gpu: g && g.format, groesse: g && [g.width, g.height], geschichte: gh && gh.format, neustartZug: !!r._traaNeustartGpu, rundung: st._ausgabeRundung || null, ausgleich: st._ausgabeAusgleich ? st._ausgabeAusgleich.toArray().map((x) => +x.toFixed(4)) : null, karten: st.csmNode && st.csmNode._anazhKarten, warn: st.logBuffer.filter((l) => /AUSGABE/.test(l)).slice(-2) };" > $D/$N-format.json
say "format $(tr -d '\n ' < $D/$N-format.json | cut -c1-200)"
$W band --ort wiese --datei $(cd $D && pwd -W)/$N-band.json > $D/$N-band.txt 2>&1
say "band $(head -1 $D/$N-band.txt)"
# die Sätze nach dem Band: Inhalt gegen Kapazität (Vertices, Indizes), Verdichtungen und Wachsen (Kandidat 4: die Satz-Kapazität)
$W eval "const out = {}; for (const [art, s] of r.state.chunkSaetze || []) out[art] = { vInhalt: s.vInhalt, vKap: s.vKap, vEnde: s.vEnde, iKap: s.iKap, iEnde: s.iEnde, takt: s.takt, ueberSeit: s.ueberSeit, verdichtet: s.verdichtet || 0, wachse: s.wachse, attr: s.spec.attr.map((a) => a.join(':')).join(','), abschnitte: [...s.abschnitte.entries()].map(([k, a]) => k + ':' + (a.kap | 0) + '/' + (a.hoch | 0)).join(' ') }; return out;" > $D/$N-saetze.json 2>&1
say "saetze wasser $(node -e "const j=require(process.argv[1]).ergebnis||{}; const w=j.wasser||{}; console.log('v '+w.vInhalt+'/'+w.vKap+' i '+w.iEnde+'/'+w.iKap+' takt '+w.takt+' verdichtet '+w.verdichtet)" $(cd $D && pwd -W)/$N-saetze.json 2>&1 | head -1)"
$W ziele --n 12 --json $(cd $D && pwd -W)/$N-ziele.json > $D/$N-ziele.txt 2>&1
say "ziele $(grep -m1 'ZIEL-ZENSUS' $D/$N-ziele.txt) · $(grep -m1 ' output ' $D/$N-ziele.txt | sed 's/  */ /g' | cut -c1-60) · $(grep -m1 '^ROT' $D/$N-ziele.txt || echo 'ROT 0')"
# Bild-Satz: Tiere aus, Wind-, Knoten- und Himmels-Uhr fest (1000), die TRAA-Phase je Aufnahme ab __jitterStart (0)
$W eval "r._loopSkyboxZeit = function () { if (this.state.skyboxUniforms && this.state.skyboxUniforms.time) this.state.skyboxUniforms.time.value = 1000; }; r._loopSkyboxZeit(); window.__jitterStart = 0; const A0 = window.__ausgabeAufnahme; window.__ausgabeAufnahme = function (...a) { if (r.state.traaNode) r.state.traaNode._jitterIndex = window.__jitterStart; return A0.apply(this, a); }; return 1" > /dev/null
$W eval "for (const c of r.state.creatures || []) c.visible = false; const P = Object.getPrototypeOf(r); r._loopRender = function () { return P._loopRender.call(this, 1000); }; const nf = r.state.renderer._nodes.nodeFrame; nf.update = function () { this.frameId++; this.deltaTime = 0; this.time = 1000; }; return 1" > /dev/null
b() { $W bild $2 --w 1920 --h 1080 --datei "$O/$1.png" | tr -d '\n' | sed 's/  */ /g' | cut -c1-110; echo; }
tag() {
  b nord      "-900 +1.7 -850 -900 +0 -880"
  b ost       "-900 +1.7 -850 -870 +0 -850"
  b west      "-900 +1.7 -850 -930 +0 -850"
  b nah       "-900 +1.7 -850 -897 +0 -856"
  phase 16
  b nah-2     "-900 +1.7 -850 -897 +0 -856"
  phase 0
  b naht      "-900 +6 -850 -900 +0 -960"
  b ufer      "-865 +1.7 -752 -862 25.91 -722"
  b see       "-985 +1.7 -812 -995 22.93 -770"
  b wald      "-915 +1.7 -838 -930 +3 -860"
  b himmel    "-900 +1.7 -850 -900 +40 -880"
  phase 16
  b himmel-2  "-900 +1.7 -850 -900 +40 -880"
  phase 0
  b fern      "-900 +25 -850 -900 +0 -1050"
  b fern-ost  "-900 +25 -850 -700 +0 -850"
}
phase() { $W eval "window.__jitterStart = $1; return $1" > /dev/null; }
# Die Uhr der Bühne: die Bühne stellt Mittag; für Nacht und Abend legt sich eine Uhr NACH sie (Himmel, Umgebung, Licht).
uhr() {
  $W eval "const st = r.state; window.__buehneTag = window.__buehneTag || window.__buehne; const o = window.__buehneTag; const T = $1; window.__buehne = T == null ? o : function () { const v = o(); st.timeOfDay = T; if (st.world) st.world.timeOfDay = T; st._skyEnvLastRegenMs = -Infinity; r._ensureSkyEnvironment(false); r._applyDayNightToScene(); return v; }; return T;" > /dev/null
}
tag > $D/$N-bilder.txt 2>&1
uhr 0.0
b n-nord    "-900 +1.7 -850 -900 +0 -880" >> $D/$N-bilder.txt 2>&1
b n-wald    "-915 +1.7 -838 -930 +3 -860" >> $D/$N-bilder.txt 2>&1
b n-himmel  "-900 +1.7 -850 -900 +40 -880" >> $D/$N-bilder.txt 2>&1
b n-ufer    "-865 +1.7 -752 -862 25.91 -722" >> $D/$N-bilder.txt 2>&1
uhr 0.76
b a-west    "-900 +1.7 -850 -930 +0 -850" >> $D/$N-bilder.txt 2>&1
b a-horizont "-900 +1.7 -850 -930 +8 -850" >> $D/$N-bilder.txt 2>&1
b a-ost     "-900 +1.7 -850 -870 +0 -850" >> $D/$N-bilder.txt 2>&1
b a-fern    "-900 +25 -850 -900 +0 -1050" >> $D/$N-bilder.txt 2>&1
b a-fern-ost "-900 +25 -850 -700 +0 -850" >> $D/$N-bilder.txt 2>&1
uhr null
node /c/Users/micha/Desktop/AnazhRealm-OMEN/p2/bewegung.cjs $WERKBANK_PORT $H/bilder/$N-bewegung >> $D/$N-bilder.txt 2>&1
say "bilder $(ls $H/bilder/$N | wc -l) bewegung $(ls $H/bilder/$N-bewegung 2>/dev/null | wc -l) · $(grep -c 'datei' $D/$N-bilder.txt) Aufnahmen"
$W eval "return window.__gf || ['kein Hoerer']" > $D/$N-gpufehler.txt
say "gpu-fehler: $(tr -d '\n ' < $D/$N-gpufehler.txt | cut -c1-160)"
stopp
say "gestoppt"
