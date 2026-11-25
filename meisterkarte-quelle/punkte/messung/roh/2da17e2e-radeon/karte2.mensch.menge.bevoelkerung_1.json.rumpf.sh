A=$(printf %s 'C:\Users\micha\AppData\Local\Temp\claude\w3\pm\meisterkarte-quelle\punkte\messung\roh\2da17e2e-radeon\karte2.mensch.menge.bevoelkerung_1.json' | tr '\\' /); B="${A%.json}"
S=$(( 7804 )); W=$(( 7804 + 20000 )); export WERKBANK_PORT=$W
L=$(printf %s "${PUNKTE_SITZUNG_LOG:-}" | tr '\\' /); grep -m1 -o '\[linse-gpu\][^[:cntrl:]]*' "$L" 2>/dev/null || echo '[linse-gpu] ungenannt'
node scripts/werkbank.cjs umstellen --ort genesis > "$B-umstellen.txt" 2>&1
node scripts/werkbank.cjs eval 'return await (async function dorfZaehlung(r, T) {
const UHREN = [3, 10, 15, 20], ORTE_N = 5, R_M = 10;
const s = r.state, wm = s.worldMeta, pm = s.playerMesh.position, A = r.constructor;
if (!(wm.settlementCells && wm.settlementCells.start)) {
const W = window, altHook = W.__anazhAutoSettlement;
W.__anazhAutoSettlement = true;
try {
if (typeof r._startDorfBestellen === "function") r._startDorfBestellen(pm);
for (const t0 = Date.now(); (r._autoSettlementPendingKey || !(s.worldMeta.settlementCells && s.worldMeta.settlementCells.start)) && Date.now() - t0 < 120000; ) await new Promise((f) => setTimeout(f, 50));
for (let n = 0; r._autoSettlementQueue && n < 4000; n++) r._tickAutoSettlement(pm), await new Promise((f) => setTimeout(f, 0));
} finally {
W.__anazhAutoSettlement = altHook;
}
}
const zelle = s.worldMeta.settlementCells && s.worldMeta.settlementCells.start;
if (!zelle) return { fehler: "kein Start-Dorf (bestellt, nach dem Zug nicht da: Hoffnungslos " + !!r._autoSettlementStartHopeless + ")" };
s.renderer.setAnimationLoop(null);
if (s.cameraMode !== "third") r.setCameraMode("third");
const cam = s.camera;
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const offen = () => { const o = r._weltOffen(); return !o.leute && !o.leiber; };
const dorf = () => [...(r._bewohnerSiedlungen || new Map()).values()].filter((S) => Array.isArray(S.liste) && S.liste.length).sort((a, b) => Math.hypot(a.ox - zelle.x, a.oz - zelle.z) - Math.hypot(b.ox - zelle.x, b.oz - zelle.z))[0];
await window.__gebautNach("das Start-Dorf der Zählung", { fertig: () => !!dorf() && offen() });
const S = dorf();
if (!S) return { fehler: "keine Bewohner im Start-Dorf" };
const L = S.liste;
const schl = (p) => Math.round(p.x * 10) + "|" + Math.round(p.z * 10);
const amWagen = (b, z) => !!(z && z.ziel && b.wagen && b.wagen.entry && z.ziel === b.wagen.entry.position);
const zielVon = (b, h) => { const z = r._bewohnerSoll(b, h); return z.drinnen || !z.ziel || amWagen(b, z) ? null : z.ziel; };
const summe = new Map();
for (const h of UHREN) for (const b of L) { const z = zielVon(b, h); if (!z) continue; const e = summe.get(schl(z)) || { x: z.x, z: z.z, n: 0 }; e.n++; summe.set(schl(z), e); }
const orte = [];
for (const e of [...summe.values()].sort((a, b) => b.n - a.n)) if (orte.length < ORTE_N && orte.every((o) => Math.hypot(o.x - e.x, o.z - e.z) >= R_M)) orte.push(e);
if (orte.length < ORTE_N) return { fehler: "nur " + orte.length + " Orte mit Soll im Start-Dorf", bewohner: L.length };
const mess = async () => { await window.__seitenTakt(); await window.__seitenTakt(); const p = cam.getWorldPosition(pm.clone()); const d = cam.getWorldDirection(pm.clone()); return { p, d, h: Math.atan2(d.x, d.z), v: Math.asin(Math.max(-1, Math.min(1, d.y))) }; };
const imFrustum = (x, y, z) => { cam.updateMatrixWorld(true); const fr = new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse)); return fr.containsPoint(new T.Vector3(x, y, z)); };
const stelle = async (q, ziel) => {
pm.set(q.x, r.getTerrainHeightAt(q.x, q.z) + A.PLAYER_FOOT_OFFSET, q.z);
if (s._fixedSimPos) s._fixedSimPos.copy(pm);
const zy = r.getTerrainHeightAt(ziel.x, ziel.z) + 0.9;
for (let it = 0; it < 4; it++) {
const m0 = await mess();
const dx = ziel.x - m0.p.x, dy = zy - m0.p.y, dz = ziel.z - m0.p.z;
const hz = Math.atan2(dx, dz), vz = Math.atan2(dy, Math.hypot(dx, dz));
const y0 = s.yaw, p0 = s.pitch;
s.yaw = y0 + 0.1; const m1 = await mess(); const sy = Math.sign(wrap(m1.h - m0.h)) || 1;
s.yaw = y0; s.pitch = p0 + 0.05; const m2 = await mess(); const sp = Math.sign(m2.v - m0.v) || 1;
s.yaw = y0 + sy * wrap(hz - m0.h); s.pitch = p0 + sp * (vz - m0.v);
}
await mess();
const frei = !window.__abnahmeUrteil(window.__abnahmeMessen({})).rot.some((f) => !f.feld.startsWith("bild."));
return frei && imFrustum(ziel.x, zy, ziel.z);
};
const leiber = () => s.scene.children.filter((o) => o && o.userData && o.userData._feldLageVon && o.userData.heim != null);
const gez = (g) => !!g && !g.userData._drinnen && (g.visible || g.userData._satz === true || !!(r._kzBesitztFeld && r._kzBesitztFeld(g)));
const samenDoppelt = L.length - new Set(L.map((b) => b.seed)).size;
const proben = [], fahrer = [], ankunft = [];
let doppelt = 0;
const SITZ_M = 0.01;
const leibVon = (b) => b.leib || leiber().find((x) => x.userData._feldLageVon.b === b) || null;
const drinnenIst = (b) => { const g = leibVon(b); return !!b.drinnen || !!(g && g.userData._drinnen); };
const ANKUNFT_S = 40;
const ortSchl = new Set(orte.map((o) => schl(o)));
const aus = (h) => L.filter((b) => {
const z = r._bewohnerSoll(b, h);
if (z.drinnen) return !drinnenIst(b);
if (amWagen(b, z)) return !b.amSteuer;
if (!z.ziel || !ortSchl.has(schl(z.ziel))) return false;
const g = leibVon(b);
return !g || Math.hypot(g.position.x - z.ziel.x, g.position.z - z.ziel.z) > R_M;
});
for (const h of UHREN) {
r.setTimeOfDay(h / 24, "regler");
const takte = await window.__gebautNach("die Zählung um " + h + " Uhr", { fertig: offen });
let warteS = 0, offenL = aus(h);
{
let uhr = performance.now();
for (let k = 0; offenL.length && warteS < ANKUNFT_S; k++) {
uhr += A.TAKT_DECKEL_S * 1000; r._gameLoopTick(uhr); warteS += A.TAKT_DECKEL_S;
await window.sleep();
if (k % 15 === 14) offenL = aus(h);
}
offenL = aus(h);
}
ankunft.push({ uhr: h, s: +warteS.toFixed(1), offen: offenL.length, wer: offenL.slice(0, 3).map((b) => { const z = r._bewohnerSoll(b, h), g = leibVon(b); return { rolle: b.rolle || b.beruf || null, akt: z && z.akt != null ? String(z.akt) : null, planDrinnen: !!z.drinnen, dZiel: g && z.ziel ? +Math.hypot(g.position.x - z.ziel.x, g.position.z - z.ziel.z).toFixed(1) : null }; }) });
const ziele = new Map();
for (const b of L) { const z = zielVon(b, h); if (z) ziele.set(schl(z), z); }
for (const b of L) {
const z = r._bewohnerSoll(b, h);
if (!amWagen(b, z)) continue;
const W = b.wagen, e = W.entry, g = leibVon(b);
const q = W.gleitJetzt || e.position;
const d = g ? Math.min(Math.hypot(g.position.x - q.x, g.position.z - q.z), Math.hypot(g.position.x - e.position.x, g.position.z - e.position.z)) : null;
fahrer.push({ uhr: h, rolle: b.rolle || b.beruf || null, amSteuer: !!b.amSteuer, leib: !!g, d: d == null ? null : +d.toFixed(2), sitzt: !!b.amSteuer && d != null && d <= SITZ_M });
}
for (let oi = 0; oi < orte.length; oi++) {
const O = orte[oi], ok = schl(O);
let stand = null;
for (const d of [9, 13, 17]) { for (let w = 0; w < 8 && !stand; w++) { const a = (w * Math.PI) / 4, q = { x: O.x + Math.cos(a) * d, z: O.z + Math.sin(a) * d }; const g = r._imGrundriss(q.x, q.z, 0.5); if (g !== "haus" && g !== "bau" && r._landAt(q.x, q.z) && (await stelle(q, O))) stand = q; } if (stand) break; }
let uhr = performance.now();
for (let k = 0; k < Math.round(2 / A.TAKT_DECKEL_S); k++) { uhr += A.TAKT_DECKEL_S * 1000; r._gameLoopTick(uhr); await window.sleep(); }
cam.updateMatrixWorld(true);
const fr = new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
const auge = cam.getWorldPosition(new T.Vector3());
const je = new Map();
let ist = 0, fahrerImKreis = 0;
const amOrt = new Set(),
gezaehlt = [];
for (const g of leiber()) {
const b = g.userData._feldLageVon.b;
je.set(b, (je.get(b) || 0) + 1);
if (!gez(g)) continue;
const dO = Math.hypot(g.position.x - O.x, g.position.z - O.z);
if (dO > R_M) continue;
if (amWagen(b, r._bewohnerSoll(b, h))) { fahrerImKreis++; continue; }
let naechst = true;
for (const [kz, z] of ziele) if (kz !== ok && Math.hypot(g.position.x - z.x, g.position.z - z.z) < dO) naechst = false;
if (!naechst) continue;
amOrt.add(b);
const brust = new T.Vector3(g.position.x, g.position.y + 0.4, g.position.z);
if (!fr.containsPoint(brust)) continue;
const dA = auge.distanceTo(brust);
let frei = true, raus = r._imGrundriss(auge.x, auge.z, 0) !== "haus"; // wie platzAcht: ab dem Rand des Grundrisses unter dem Auge
for (let t = 0.6; t < dA - 0.6 && frei; t += 0.5) { const f = t / dA, h = r._imGrundriss(auge.x + (brust.x - auge.x) * f, auge.z + (brust.z - auge.z) * f, 0) === "haus"; if (!raus) raus = !h; else if (h) frei = false; }
if (frei) ist++, gezaehlt.push(b);
}
doppelt = Math.max(doppelt, [...je.values()].filter((n) => n > 1).length);
const sollL = L.filter((b) => { const z = zielVon(b, h); return z && schl(z) === ok; });
const fehlt = sollL.filter((b) => !amOrt.has(b)).length;
const wer = sollL.filter((b) => !amOrt.has(b)).slice(0, 3).map((b) => {
const g = leiber().find((x) => x.userData._feldLageVon.b === b), z = r._bewohnerSoll(b, h);
return { rolle: b.rolle || b.beruf || b.role || null, leib: !!g, dO: g ? +Math.hypot(g.position.x - O.x, g.position.z - O.z).toFixed(1) : null, gez: gez(g), drinnen: g ? !!g.userData._drinnen : null, plan: z && (z.tat || z.was || z.art || null), posten: !!(z && z.posten) };
});
const imSoll = new Set(sollL);
const mehr = gezaehlt.filter((b) => !imSoll.has(b)).slice(0, 3).map((b) => {
const g = leiber().find((x) => x.userData._feldLageVon.b === b), z = r._bewohnerSoll(b, h);
return { rolle: b.rolle || b.beruf || null, akt: z && z.akt != null ? String(z.akt) : null, planDrinnen: !!(z && z.drinnen), drinnen: !!b.drinnen, dZiel: g && z && z.ziel ? +Math.hypot(g.position.x - z.ziel.x, g.position.z - z.ziel.z).toFixed(1) : null };
});
proben.push({ uhr: h, ort: oi, tod: +s.timeOfDay.toFixed(4), soll: sollL.length, ist, fehlt, imBild: !!stand, stand: stand ? [+stand.x.toFixed(1), +stand.z.toFixed(1)] : null, takte, ...(fahrerImKreis ? { fahrerImKreis } : {}), ...(wer.length ? { wer } : {}), ...(mehr.length ? { mehr } : {}) });
}
}
const spaet = ankunft.filter((a) => a.offen > 0);
const messort = spaet.length ? "die Ankunft nach dem Zeitsprung stand nach " + ANKUNFT_S + " s nicht: " + spaet.map((a) => a.uhr + " Uhr " + a.offen + " unterwegs (" + a.wer.map((w) => (w.rolle || "?") + " " + (w.akt || "?") + (w.planDrinnen ? " Plan drinnen" : "") + (w.dZiel != null ? " " + w.dZiel + " m vom Ziel" : "")).join(", ") + ")").join(" · ") : null;
return { bewohner: L.length, orte: orte.map((o) => [+o.x.toFixed(1), +o.z.toFixed(1), o.n]), rM: R_M, samenDoppelt, doppelt, sicht: s.cameraMode, proben, fahrer, ankunft, ...(messort ? { messort } : {}), version: A.VERSION };
})(r, T);' > "$B-zaehlung.txt" 2>&1
node -e 'const t = require("fs").readFileSync(process.argv[1], "utf8"); let e = null; try { e = JSON.parse(t.slice(t.indexOf("{"))); } catch (x) {} console.log("ZAEHLUNG " + JSON.stringify(e && e.ergebnis ? e.ergebnis : { fehler: String((e && e.fehler) || t.trim().split("\n").pop() || "ohne Antwort").replace(/\s+/g, " ").slice(0, 300) })); if (e && e.ergebnis && e.ergebnis.messort) console.log("@@PUNKTE@@ MESSORT " + String(e.ergebnis.messort).replace(/\s+/g, " ").slice(0, 280))' "$B-zaehlung.txt"