#!/bin/bash
# GENESIS EGO, DIE ZWEI GIPFEL (Auftrag 16.10. 0:15), Fassung 2 (16.10. ~03:00), Kopf main 015a3f74 (16.10. 05:15: d5deed14 sagt
# je Boot den Boden-Stoff ab, ein dritter Zustand mit −80k Dreiecken bei 120 fps; main trägt den Gipfel 2 von 4 ohne Absage): ab e8a370ad trägt je Boot ein Teil der Welten an
# Genesis Ego den langsamen Zustand (≈ 73 fps, GPU-Durchsatz 13,7 ms) statt ≈ 78 (12,6) — bei gleicher Szene.
# ZUERST ZERLEGEN: Boots desselben Kopfs 015a3f74 (abab-p015 = Seite und Instrument, `start --ort genesis`), bis je ein langsamer
# und ein schneller vorliegt (höchstens 6). JEDER Boot: einschwingen · lauf 30 (der Zustand) · der ZUSTAND der drei Verdächtigen
# aus dem Bündel e8a370ad (Lese-Probe des Codes 16.10.): (D) die Reihe der Region-Bündel in der Szene (K60-T8: die Ankunft der
# Körper ist ein Rennen der Helfer-Fäden; `_buendelReihe` 17b.js:386 ordnet Regionen untereinander nach Ankunft), (A) die Stufe der
# Tore am Ring (K64: Stufe 2 ab 12 m, Hysterese bis 10,8 m, der Genesis-Ring steht bei 11 m), (C) der Regler (loadScale,
# Schatten-Reichweite, CSM maxFar/breaks, Intervall, Godray). Der erste langsame und der erste schnelle Boot dazu: die Zählprobe im
# Loop, die Auflösung, gpu-bank 60 × 6, zerlegen --runden 6, lauf 30.
# DANN SCHALTEN in EINER langsamen Welt, je Schritt lauf 30 und der Zustand, kumulativ, bis die 78 zurückkommt:
#   T1 der Anker der Bündel-Reihe neu (`_buendelAuge = null`: jedes Bündel stellt seine Kinder am heutigen Auge neu)
#   (T2 die Region-Bündel nach Abstand: entfällt — Genesis trägt nur @global und @wahl, deren Rang fest ist; Boot 1 16.10.)
#   T3 die Tore unter 14 m auf Stufe 1 (`_switchArchitectureLOD`)
# und in der schnellen Welt die Gegenprobe: T4 die Tore unter 14 m auf Stufe 2 (wird sie langsam? + gpu-bank), dann T3 zurück.
# Jeder Zustand nennt dazu die Kinder-Folge im @wahl-Bündel (Schlüssel je Gruppe).
# FASSUNG 3 (16.10. ~05:35): an main 015a3f74 sind die Gipfel 79 fps / Durchsatz 12,6 gegen 82,5-84,4 / 11,6-11,9 (Lauf 3:
# gleiche Dreiecke, Befehle, Tore, Regler, @wahl-Folge); Schwelle 12,3 / 12,0, je Lauf der GPU-Takt (nvidia-smi 250 ms),
# in der langsamen Welt T6: die Ziele neu anlegen (Fenster 1918 und zurück) — ist der Gipfel eine Lage der Zuteilung?
# Wartet auf die Freigabe (frei.txt, setzt die L2-Serie an ihrem Ende), unter dem GPU-Schloss.
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1510zg; HW=$(cygpath -m $H); R=/c/Users/micha/Desktop/AnazhRealm-OMEN; L=$H/fortschritt.log
WT=$R/abab-p210; INS=$R/abab-p210; export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"
until [ -f $H/frei.txt ]; do sleep 30; done
. $R/p3/gpu-schloss.sh; schloss_nehmen "omen-genesis-ego zweigipfel"; trap 'schloss_loesen "omen-genesis-ego zweigipfel"' EXIT
nachtruhe() { while :; do hm=$((10#$(date +%H%M))); if [ $hm -ge 325 ] && [ $hm -lt 415 ]; then sleep 60; else break; fi; done; }
stopp() { $W stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1; sleep 2; }
EIN='const rend = r.state.renderer; const dev = rend.backend.device; const q = dev.queue; const Z = (window.__zp = { submits: 0, compute: 0, renders: {}, alt: { s: q.submit, r: rend.render, c: rend.compute } }); q.submit = function () { Z.submits++; return Z.alt.s.apply(this, arguments); }; rend.render = function (scene, cam) { const t = rend.getRenderTarget(); const n = t ? (t.texture && t.texture.name) || t.name || ("rt" + t.width + "x" + t.height) : "leinwand"; const k = n + " | " + ((scene && (scene.name || scene.type)) || "?") + " | " + ((cam && (cam.name || cam.type)) || "?"); Z.renders[k] = (Z.renders[k] || 0) + 1; return Z.alt.r.apply(this, arguments); }; if (Z.alt.c) rend.compute = function () { Z.compute++; return Z.alt.c.apply(this, arguments); }; return true;'
AUS='const rend = r.state.renderer; const q = rend.backend.device.queue; const Z = window.__zp; q.submit = Z.alt.s; rend.render = Z.alt.r; if (Z.alt.c) rend.compute = Z.alt.c; return { submits: Z.submits, compute: Z.compute, renders: Object.entries(Z.renders).sort((a, b) => b[1] - a[1]).slice(0, 30) };'
AUFL='const st = r.state; const rend = st.renderer; const v = new T.Vector2(); rend.getDrawingBufferSize(v); const ziele = {}; for (const [k, x] of Object.entries(st)) { if (x && x.isRenderTarget) ziele[k] = [x.width, x.height]; } return { szeneSkala: st.szeneSkala, pixelRatio: rend.getPixelRatio(), puffer: [v.x, v.y], schattenIntervall: st.schattenIntervall, ziele, kaskaden: st.shadowCascades ? st.shadowCascades.length : null };'
# der Zustand der drei Verdächtigen (D Bündel-Reihe, A Tore, C Regler)
ZUST='const st = r.state; const p = st.playerMesh.position; const eye = typeof r._lodAuge === "function" ? r._lodAuge() || p : p; const nahB = (b) => { let m = 1e30; b.traverse((c) => { const a = c.instanceMatrix && c.instanceMatrix.array; const n = c.count | 0; if (a) for (let i = 0; i < n; i++) { const dx = a[i * 16 + 12] - eye.x, dz = a[i * 16 + 14] - eye.z; const d = dx * dx + dz * dz; if (d < m) m = d; } }); return m < 1e29 ? Math.round(Math.sqrt(m)) : null; }; const buendel = []; st.scene.children.forEach((c, i) => { if (c && c.isBundleGroup && c.userData && c.userData.regionKey != null) buendel.push([i, String(c.userData.regionKey), c.children.length, nahB(c)]); }); let tore = null; try { const f = r._foundry; tore = st.architectures.filter((e) => { if (!e || !e.instFoundry || !f) return false; const rc = f.recipes[r._foundryPresetForEntry(e)]; return rc && rc.kind === "gate"; }).map((e) => [e.id, +Math.hypot(e.position.x - eye.x, e.position.z - eye.z).toFixed(1), e._lodLevel, e._servedLod]); } catch (x) { tore = "fehler: " + x.message; } const csm = st.csmNode; const wb = st.scene.children.find((c) => c && c.isBundleGroup && c.userData && c.userData.regionKey === "@wahl"); const wahl = wb ? wb.children.map((c) => String((c.userData && c.userData.archInstanceKey) || c.name || "?").slice(0, 48)) : null; return { auge: [+eye.x.toFixed(1), +eye.z.toFixed(1)], buendelAuge: r._buendelAuge, wahl, regler: { loadScale: st.perfSense ? st.perfSense.loadScale : null, perfTargetMs: st.perfTargetMs, schattenReichweite: r._shadowRangeApplied, maxFar: csm ? csm.maxFar : null, breaks: csm && csm.breaks ? Array.from(csm.breaks).map((x) => +(+x).toFixed(3)) : null, intervall: st._shadowMinInterval != null ? st._shadowMinInterval : r._shadowMinInterval, godray: st._godrayScale }, buendel, tore };'
# T1: der Anker der Bündel-Reihe neu
T1='r._buendelAuge = null; return { anker: "neu" };'
# T2 / T5: die Region-Bündel nach Abstand (Rang wie `_buendelRang`, dann die nächste Instanz zum Auge), T5 rückwärts
REIHE='const st = r.state; const p = st.playerMesh.position; const eye = typeof r._lodAuge === "function" ? r._lodAuge() || p : p; const nahB = (b) => { let m = 1e30; b.traverse((c) => { const a = c.instanceMatrix && c.instanceMatrix.array; const n = c.count | 0; if (a) for (let i = 0; i < n; i++) { const dx = a[i * 16 + 12] - eye.x, dz = a[i * 16 + 14] - eye.z; const d = dx * dx + dz * dz; if (d < m) m = d; } }); return m; }; const K = st.scene.children; const plaetze = [], bs = []; K.forEach((c, i) => { if (c && c.isBundleGroup && c.userData && c.userData.regionKey != null) { plaetze.push(i); bs.push(c); } }); const rang = (b) => r.constructor._buendelRang(b.userData.regionKey); const d = new Map(bs.map((b) => [b, nahB(b)])); const reihe = bs.slice().sort((x, y) => rang(x) - rang(y) || (RICHTUNG) * (d.get(x) - d.get(y))); for (let k = 0; k < plaetze.length; k++) { K[plaetze[k]] = reihe[k]; reihe[k].needsUpdate = true; } return reihe.map((b) => String(b.userData.regionKey));'
T2=${REIHE//RICHTUNG/1}
# T3 / T4: die Tore unter 14 m auf Stufe 1 / 2 (zweimal: fehlt der Körper, bestellt der erste Ruf ihn)
T3_ROH='const st = r.state; const f = r._foundry; const p = st.playerMesh.position; const eye = typeof r._lodAuge === "function" ? r._lodAuge() || p : p; const tore = st.architectures.filter((e) => { if (!e || !e.instFoundry || !f) return false; const rc = f.recipes[r._foundryPresetForEntry(e)]; return rc && rc.kind === "gate"; }); const aus = []; for (const e of tore) { const d = Math.hypot(e.position.x - eye.x, e.position.z - eye.z); if (d < 14) aus.push([e.id, +d.toFixed(1), e._lodLevel, r._switchArchitectureLOD(e, STUFE, d)]); } return aus;'
T3=${T3_ROH//STUFE/1}; T4=${T3_ROH//STUFE/2}
LAUF="lauf 30 --ein 5 --regler voll --tiere frei"
schritt() { # $1 Boot, $2 Name, $3 JS
  $W eval "$3" > $H/b$1-$2-ruf.txt 2>&1
  { [ $2 = t3 ] || [ $2 = t4 ]; } && { sleep 3; $W eval "$3" > $H/b$1-$2-ruf2.txt 2>&1; }
  $W $LAUF > $H/b$1-$2-lauf.txt 2>&1; $W eval "$ZUST" > $H/b$1-$2-zustand.txt 2>&1
  echo "$(date +%T) b$1 $2: $(node -e "const t=require('fs').readFileSync('$HW/b$1-$2-lauf.txt','utf8');const j=JSON.parse(t.slice(t.indexOf('{')));console.log('fps',j.fps,'durchsatz',j.gpuDurchsatzMs.p50,'cpu p95',j.cpuTaktMs.p95,'k1',JSON.stringify(j.gpuJePassMs&&j.gpuJePassMs.k1))" 2>&1)" >> $L
}
echo "$(date +%T) ZWEIGIPFEL START (Fassung 3b, main 210fe8a7) Kopf=$(git -C $WT log -1 --format=%h)" >> $L
langsam=0; schnell=0  # Fassung 3b: main 210fe8a7 (FF 16.10. ~4:30) — beide Gipfel am selben Kopf zerlegen
for N in 1 2 3 4 5 6; do
  [ $langsam -ge 1 ] && [ $schnell -ge 1 ] && break
  nachtruhe; stopp
  mkdir -p $H/stand/$N; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $H/stand/$N/ 2>/dev/null
  (cd $WT && PORT=4312 node save-server.js > $H/b$N-server.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
  (cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort genesis > $H/b$N-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $H/b$N-werkbank.log 2>/dev/null && break; sleep 5; done
  $W fenster 1920 1080 > /dev/null
  $W umstellen --ort genesis --sicht ego > $H/b$N-umstellen.txt 2>&1
  $W lauf 10 --ein 30 --ruhe 300 --regler voll --tiere frei > $H/b$N-ein.txt 2>&1
  (timeout 34 nvidia-smi --query-gpu=timestamp,clocks.gr,clocks.mem,power.draw,temperature.gpu,clocks_throttle_reasons.active --format=csv,noheader -lms 250 > $H/b$N-smi.csv 2>&1 &)
  $W lauf 30 --ein 2 --regler voll --tiere frei > $H/b$N-lauf.txt 2>&1
  $W eval "$ZUST" > $H/b$N-zustand.txt 2>&1
  Z=$(node -e "const t=require('fs').readFileSync('$HW/b$N-lauf.txt','utf8');const j=JSON.parse(t.slice(t.indexOf('{')));const d=j.gpuDurchsatzMs.p50;console.log(d>=12.3?'langsam':d<=12.0?'schnell':'mitte')")
  echo "$(date +%T) b$N Zustand $Z ($(grep -o '"fps": [0-9.]*' $H/b$N-lauf.txt | head -1))" >> $L
  if { [ "$Z" = langsam ] && [ $langsam -lt 1 ]; } || { [ "$Z" = schnell ] && [ $schnell -lt 1 ]; }; then
    $W eval "$EIN" > /dev/null 2>&1; $W lauf 10 --ein 1 --regler voll --tiere frei > $H/b$N-lauf-zaehl.txt 2>&1; $W eval "$AUS" > $H/b$N-zaehl.txt 2>&1
    $W eval "$AUFL" > $H/b$N-aufloesung.txt 2>&1
    $W gpu-bank 60 --runden 6 > $H/b$N-bank.txt 2>&1
    $W zerlegen --runden 6 --json $H/b$N-zerlegen.json > $H/b$N-zerlegen.txt 2>&1
    $W lauf 30 --ein 2 --regler voll --tiere frei > $H/b$N-lauf2.txt 2>&1
    echo "$(date +%T) b$N zerlegt ($Z)" >> $L
    if [ "$Z" = langsam ]; then
      schritt $N t1 "$T1"
      $W fenster 1918 1080 > $H/b$N-t6-fenster1.txt 2>&1; sleep 3; $W fenster 1920 1080 > $H/b$N-t6-fenster2.txt 2>&1
      (timeout 40 nvidia-smi --query-gpu=timestamp,clocks.gr,clocks.mem,power.draw,temperature.gpu,clocks_throttle_reasons.active --format=csv,noheader -lms 250 > $H/b$N-t6-smi.csv 2>&1 &)
      schritt $N t6 "return { ziele: \"neu\" };"; $W gpu-bank 60 --runden 6 > $H/b$N-t6-bank.txt 2>&1
      schritt $N t3 "$T3"
      $W gpu-bank 60 --runden 6 > $H/b$N-t3-bank.txt 2>&1
      langsam=$((langsam + 1))
    else
      schritt $N t4 "$T4"; $W gpu-bank 60 --runden 6 > $H/b$N-t4-bank.txt 2>&1; schritt $N t3 "$T3"
      schnell=$((schnell + 1))
    fi
    echo "$(date +%T) b$N geschaltet ($Z)" >> $L
  fi
  stopp; sleep 30
done
echo "$(date +%T) ZWEIGIPFEL FERTIG langsam=$langsam schnell=$schnell" >> $L
