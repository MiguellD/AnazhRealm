#!/bin/bash
# 1510 Bündel-Befund Genesis Ego (fps 78,5 → 73,6, GPU-Durchsatz im Loop +1,0 ms, die Bank-Zerlegung A = B): WAS die GPU im
# ECHTEN Loop zwischen den Frames tut. Je Seite (B a19ca615 = abab-pe8a, A 0bbee8fc = abab-p0bb; EIN Instrument abab-pe8a) eine
# Sitzung an Genesis Ego: einschwingen wie die Zerlegung, lauf 30 (Regler voll, freie Tiere: fps und Durchsatz dieser Sitzung),
# dann 10 s Zähl-Probe im Loop — queue.submit (Aufrufe, Befehls-Puffer), renderer.render je Ziel × Szene, renderer.compute,
# createCommandEncoder — installiert vor einem lauf 10, ausgelesen danach (die Werkbank-Welt ruht zwischen den Befehlen:
# Version 1 zählte 0). Unter dem GPU-Schloss.
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1510z; R=/c/Users/micha/Desktop/AnazhRealm-OMEN; L=$H/fortschritt.log; D=$H/loop2
INS=$R/abab-pe8a; export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"; mkdir -p $D
. $R/p3/gpu-schloss.sh; schloss_nehmen "omen-zerlegen loop-probe2"; trap 'schloss_loesen "omen-zerlegen loop-probe2"' EXIT
stopp() { $W stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1; sleep 2; }
EIN='const rend = r.state.renderer; const dev = rend.backend.device; const q = dev.queue; const Z = (window.__zp = { submits: 0, puffer: 0, enc: 0, compute: 0, renders: {}, frames0: r.state._gameLoopTick || 0, alt: { s: q.submit, e: dev.createCommandEncoder, r: rend.render, c: rend.compute } }); q.submit = function (b) { Z.submits++; Z.puffer += (b && b.length) || 0; return Z.alt.s.apply(this, arguments); }; dev.createCommandEncoder = function () { Z.enc++; return Z.alt.e.apply(this, arguments); }; rend.render = function (scene, cam) { const t = rend.getRenderTarget(); const n = t ? (t.texture && t.texture.name) || t.name || ("rt" + t.width + "x" + t.height) : "leinwand"; const k = n + " | " + ((scene && (scene.name || scene.type)) || "?") + " | " + ((cam && (cam.name || cam.type)) || "?"); Z.renders[k] = (Z.renders[k] || 0) + 1; return Z.alt.r.apply(this, arguments); }; if (Z.alt.c) rend.compute = function () { Z.compute++; return Z.alt.c.apply(this, arguments); }; return { ein: true };'
AUS='const rend = r.state.renderer; const dev = rend.backend.device; const q = dev.queue; const Z = window.__zp; q.submit = Z.alt.s; dev.createCommandEncoder = Z.alt.e; rend.render = Z.alt.r; if (Z.alt.c) rend.compute = Z.alt.c; return { submits: Z.submits, puffer: Z.puffer, encoder: Z.enc, compute: Z.compute, renders: Object.entries(Z.renders).sort((a, b) => b[1] - a[1]).slice(0, 30) };'
for S in B A; do
  WT=$R/abab-pe8a; [ $S = A ] && WT=$R/abab-p0bb
  [ -f $D/$S-probe.txt ] && continue
  echo "$(date +%T) loop-probe2 $S start" >> $L; stopp
  mkdir -p $D/stand/$S; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $D/stand/$S/ 2>/dev/null
  (cd $WT && PORT=4312 node save-server.js > $D/$S-server.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
  (cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $D/$S-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $D/$S-werkbank.log 2>/dev/null && break; sleep 5; done
  $W fenster 1920 1080 > /dev/null
  $W umstellen --ort genesis --sicht ego > $D/$S-umstellen.txt 2>&1
  $W lauf 10 --ein 30 --ruhe 300 --regler voll --tiere frei > $D/$S-ein.txt 2>&1
  $W lauf 30 --ein 2 --regler voll --tiere frei > $D/$S-lauf.txt 2>&1
  $W eval "$EIN" > $D/$S-ein-probe.txt 2>&1
  $W lauf 10 --ein 1 --regler voll --tiere frei > $D/$S-lauf-probe.txt 2>&1
  $W eval "$AUS" > $D/$S-probe.txt 2>&1
  stopp; echo "$(date +%T) loop-probe2 $S ende" >> $L; sleep 30
done
echo "$(date +%T) LOOP-PROBE2 FERTIG" >> $L
