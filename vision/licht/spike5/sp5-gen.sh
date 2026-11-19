#!/bin/bash
# sp5-gen.sh: schreibt die Befehls-Dateien des Spikes 5 (Zweig: G und F je Ort; main: ein Bild je Ort).
# SPIKE-DATEN (benannt): der Nacht-Maßstab 1 Einheit = 0,26 ÷ 0,224 = 1,1607 cd/m² (NACHT_AUGE.luxJeEinheit, stamm/bild-kosten.js);
# Mond 0,1 lx waagrecht direkt: MOONLIGHT.intensity 0,65 × 0,1 ÷ 0,511 = 0,1272 (heute 0,65 → 0,511 lx im Nacht-Maßstab).
W=/c/AnazhRealm/.git/gtx1050-werkzeug; O=C:/AnazhRealm/.git/gtx1050-werkzeug/gc/strahler/spike5; T=$W/tmp
ORT_W='const st = r.state; r.setSeason("sommer"); window.__wetterSetzen("sunny"); r._naesseTakt(1e6); r.setTimeOfDay(0.5, "regler"); st.playerMesh.position.set(-262, r._voxelSurfaceY(-262, -1050) + 1, -1050); for (let i = 0; i < 300; i++) await __werkTakt(); return "ort";'
ORT_D='const st = r.state; r.setSeason("sommer"); window.__wetterSetzen("sunny"); r._naesseTakt(1e6); r.setTimeOfDay(0.5, "regler"); for (let i = 0; i < 300; i++) await __werkTakt(); return "ort";'
MOND='AnazhRealm.MOONLIGHT = Object.freeze({ ...AnazhRealm.MOONLIGHT, intensity: 0.65 * 0.1 / 0.511 }); return AnazhRealm.MOONLIGHT.intensity;'
NACHT='const A = AnazhRealm.AUGE; const eN = 0.26 / 0.224; const S = 16090 / eN; const K = r._augeKette(); K.U.kE.value = A.kEPuffer / S; K.U.zE.value = (A.zECdM2 / 16090) * S; AnazhRealm.AUGE = Object.freeze({ ...A, einheitCdM2: eN }); return JSON.stringify({ S, kE: K.U.kE.value, zE: K.U.zE.value, einheit: AnazhRealm.AUGE.einheitCdM2 });'
LAVA='r.setTimeOfDay(0, "regler"); r._brandZuenden = () => null; r._lavaGiessen(-248, -1064); r.state.playerMesh.position.set(-243.5, r._voxelSurfaceY(-243.5, -1056) + 1, -1056); for (let i = 0; i < 240; i++) await __werkTakt(); r._leuchtPool.t = -Infinity; for (let i = 0; i < 180; i++) await __werkTakt(); return "lava";'
ev() { echo "eval '$1'"; }
# ruhe "px, py, pz, lx, ly, lz, uhr": das Auge an der Pose zum Fixpunkt führen und halten (G)
ruhe() { echo "eval 'const p = [$1]; r._augeFeld = false; r._augeAus = false; const c = r.state.camera; c.position.set(p[0], p[1], p[2]); c.lookAt(p[3], p[4], p[5] + 1e-4); c.updateMatrixWorld(true); __buehne({ uhr: p[6] }); const spur = []; for (let i = 0; i < 20; i++) { __loopBild(); await new Promise((s) => setTimeout(s, 80)); if (r._augeZ > 0) r._augeZustand = r._augeZ; r._applyDayNightToScene(); spur.push(+(r._augeZ || 0).toPrecision(4)); } r._augeAus = true; const s = r._augeStand(); return JSON.stringify({ spur, zCdM2: s.zCdM2, k: s.k, deckel: s.deckel, m: s.m, bruch: s.bruch });'"; }
# paar <name> "<bild-pose>" "<ruhe-pose>" <uhr>: G und F an derselben Pose
paar() { ruhe "$3, $4"; echo "bild $2 --fuss false --uhr $4 --w 1920 --h 1080 --wahl 0 --datei $O/$1-G.png"; ev 'r._augeFeld = true; return 1;'; echo "bild $2 --fuss false --uhr $4 --w 1920 --h 1080 --wahl 0 --datei $O/$1-F.png"; ev 'r._augeFeld = false; return 1;'; }
eins() { echo "bild $2 --fuss false --uhr $3 --w 1920 --h 1080 --wahl 0 --datei $O/$1-main.png"; ev 'return JSON.stringify({ k: r.state.renderer.toneMappingExposure });'; }
HN="-266.5 28.6 -1052.5 -270 27.6 -1056"; HNr="-266.5, 28.6, -1052.5, -270, 27.6, -1056"
HF="-252 33 -1042 -270 27.6 -1056"; HFr="-252, 33, -1042, -270, 27.6, -1056"
WI="-280.4 +1.7 -1045.6 -300 +1.2 -1025.6"; WIr="-280.4, 29.31, -1045.6, -300, 28.8, -1025.6"
SO="-280.4 +1.7 -1045.6 -280.4 +17.02 -1032.74"; SOr="-280.4, 29.31, -1045.6, -280.4, 44.63, -1032.74"
LA="-243.5 28.6 -1056 -248 27.6 -1064"; LAr="-243.5, 28.6, -1056, -248, 27.6, -1064"
GA="-697.5 45 -882 -707 42.5 -872"; GAr="-697.5, 45, -882, -707, 42.5, -872"
SW="-266.5 28.6 -1052.5 -271.28 27.6 -1051.22"; SWr="-266.5, 28.6, -1052.5, -271.28, 27.6, -1051.22"
# Zweig, Boot 1 (Wiese, Nacht): Herd nah, Herd fern, Vollmond-Wiese (+ m 0,9), Schwenk
{ ev "$ORT_W"; ev "$MOND"; ev "$NACHT"
  paar herd-nah "$HN" "$HNr" 0.0; paar herd-fern "$HF" "$HFr" 0.0; paar mond-wiese "$WI" "$WIr" 0.0
  ev 'r._augeM = 0.9; return r._augeM;'; ruhe "$WIr, 0.0"; echo "bild $WI --fuss false --uhr 0.0 --w 1920 --h 1080 --wahl 0 --datei $O/mond-wiese-m09-G.png"; ev 'r._augeM = AnazhRealm.AUGE.m; return r._augeM;'
} > $T/sp5-z1.bef
# Zweig, Boot 2 (Wiese, Nacht): der Schwenk am Herd, die Lava
{ ev "$ORT_W"; ev "$MOND"; ev "$NACHT"
  ruhe "$HNr, 0.0"
  echo "eval 'const p = [$SWr]; r._augeAus = false; const c = r.state.camera; c.position.set(p[0], p[1], p[2]); c.lookAt(p[3], p[4], p[5]); c.updateMatrixWorld(true); const t0 = performance.now(); const spur = []; while (performance.now() - t0 < 1400) { __loopBild(); r._applyDayNightToScene(); spur.push([+((performance.now() - t0) / 1000).toFixed(3), r._augeK, r._augeZ]); await new Promise((s) => setTimeout(s, 4)); } const bei = (t) => spur.reduce((a, b) => (Math.abs(b[0] - t) < Math.abs(a[0] - t) ? b : a)); r.__schwenk = [spur[0], bei(0.1), bei(0.3), bei(1.0)]; const ende = spur[spur.length - 1]; return JSON.stringify({ n: spur.length, wahl: r.__schwenk, ende, evZumEnde: r.__schwenk.map((q) => +Math.log2(ende[1] / q[1]).toFixed(3)), tau: r._augeStand().tau, jede8: spur.filter((_, i) => i % 8 === 0).map((q) => [q[0], +q[1].toPrecision(4)]) });'"
  for i in 0 1 2 3; do n=(000 010 030 100); ev "r._augeAus = true; r._augeFeld = false; r._augeK = r.__schwenk[$i][1]; return r._augeK;"; echo "bild $SW --fuss false --uhr 0.0 --w 1920 --h 1080 --wahl 0 --datei $O/schwenk-${n[$i]}-G.png"; done
  ev 'r._augeFeld = true; return 1;'; echo "bild $SW --fuss false --uhr 0.0 --w 1920 --h 1080 --wahl 0 --datei $O/schwenk-F.png"; ev 'r._augeFeld = false; r._augeAus = false; return 1;'
  ev "$LAVA"; paar lava "$LA" "$LAr" 0.0
} > $T/sp5-z2.bef
# Zweig, Boot 3 (Dorf, Nacht): die Gasse
{ ev "$ORT_D"; ev "$MOND"; ev "$NACHT"; paar gasse "$GA" "$GAr" 0.0; } > $T/sp5-z3.bef
# main: Wiese (Tag und Nacht, Lava zuletzt), Dorf
{ ev "$ORT_W"; eins wiese-mittag "$WI" 0.5; eins sonne-mittag "$SO" 0.5; ev "$MOND"
  eins herd-nah "$HN" 0.0; eins herd-fern "$HF" 0.0; eins mond-wiese "$WI" 0.0; eins schwenk "$SW" 0.0; ev "$LAVA"; eins lava "$LA" 0.0; } > $T/sp5-m1.bef
{ ev "$ORT_D"; ev "$MOND"; eins gasse "$GA" 0.0; } > $T/sp5-m2.bef
wc -l $T/sp5-z1.bef $T/sp5-z2.bef $T/sp5-z3.bef $T/sp5-m1.bef $T/sp5-m2.bef
