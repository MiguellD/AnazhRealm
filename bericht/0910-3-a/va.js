// 0910-3 A2: der Aussteige-Ablauf am Bach der Mess-Wiese, Werkbank-Probe. __MODUS__ = roh | fix
const MODUS = "__MODUS__";
const st = r.state, rend = st.renderer, be = rend.backend;
const eigen = {};
if (MODUS === "roh") for (const k of ["copyFramebufferToTexture", "finishRender", "resolveOccludedAsync"]) if (Object.prototype.hasOwnProperty.call(be, k)) { eigen[k] = be[k]; delete be[k]; }
const F = { gpu: [], seite: [], drei: [] };
let phase = "vorher";
const fn = (e) => F.gpu.push(phase + ": " + String(e.error && e.error.message).split("\n")[0].slice(0, 90));
be.device.addEventListener("uncapturederror", fn);
const pe = (e) => F.seite.push(phase + ": " + String((e.reason && e.reason.message) || e.reason).slice(0, 90));
window.addEventListener("unhandledrejection", pe);
const ce = console.error;
console.error = function (...a) { F.drei.push(phase + ": " + a.map(String).join(" ").split("\n")[0].slice(0, 90)); return ce.apply(this, a); };
// Zähler: begonnene Abfragen, Pass-Brüche (und wie viele davon bei offener Abfrage), Renders mit gezählter Abfrage
const Z = { begonnen: 0, bruch: 0, bruchOffen: 0, gezaehlt: 0, ticks: 0, renders: 0 };
const RP = GPURenderPassEncoder.prototype, bQ = RP.beginOcclusionQuery;
RP.beginOcclusionQuery = function (i) { Z.begonnen++; return bQ.call(this, i); };
const bruchVor = be.copyFramebufferToTexture;
be.copyFramebufferToTexture = function (t, k, rr) { Z.bruch++; const d = this.get(k); const o = d && d.lastOcclusionObject; if (o && o.occlusionTest === true) Z.bruchOffen++; return bruchVor.call(this, t, k, rr); };
const E0 = r._erstZeichnungStand(); const warte0 = E0.wartetN, versch0 = E0.verschoben;
Z.proxyDraw = 0; Z.proxyGift = 0;
const dVor = be.draw;
be.draw = function (ro, info) { if (ro.object.occlusionTest === true) { Z.proxyDraw++; if (this.get(ro.pipeline).error === true) Z.proxyGift++; } return dVor.call(this, ro, info); };
const bRVor = be.beginRender;
be.beginRender = function (k) { Z.renders++; if (k.occlusionQueryCount > 0) Z.gezaehlt += k.occlusionQueryCount; return bRVor.call(this, k); };
const taktVor = AnazhRealm.BERG_CULL.queryTakt, cullVor = window.__anazhBergCull;
AnazhRealm.BERG_CULL.queryTakt = 1; // jeder Frame ein Probe-Fenster
window.__anazhBergCull = true;
const aus = { MODUS };
let e = null, bg = null, key = null;
try {
    // der Bach der Mess-Wiese: der nächste Fluss-Punkt zum Spieler (umstellen --ort wiese)
    const p0 = st.playerMesh.position;
    r._ensureHydroTilesAround(p0.x, p0.z, 200);
    const h = r._hydroFor(p0.x, p0.z);
    let P = null, fl = null, pi = -1;
    for (const f of h.rivers || []) f.points.forEach((q, i) => { const d = Math.hypot(q.x - p0.x, q.z - p0.z); if (!P || d < P.d) { P = { x: q.x, z: q.z, d }; fl = f; pi = i; } });
    const a = fl.points[Math.max(0, pi - 1)], b = fl.points[Math.min(fl.points.length - 1, pi + 1)];
    const L = Math.hypot(b.x - a.x, b.z - a.z) || 1;
    let nx = -(b.z - a.z) / L, nz = (b.x - a.x) / L;
    if (nx * (p0.x - P.x) + nz * (p0.z - P.z) < 0) { nx = -nx; nz = -nz; } // die Wiesen-Seite
    const hh = (x, z) => r.getTerrainHeightAt(x, z);
    const nass = (x, z) => { const ws = r._atlasWaterLevelAt(x, z, hh(x, z)); return Number.isFinite(ws) && ws > hh(x, z) - 0.3; };
    let s = 4; while (s < 30 && nass(P.x + nx * s, P.z + nz * s)) s++;
    const ux = P.x + nx * (s + 10), uz = P.z + nz * (s + 10); // 10 m hinter der Uferkante
    aus.bach = { x: Math.round(P.x), z: Math.round(P.z), d: Math.round(P.d), ufer: s, start: [Math.round(ux), Math.round(uz)] };
    // ein Region-Bündel jenseits des Bachs (die Kugel-Kante > minDist): der Cull-Weg baut seinen Stellvertreter
    const R = AnazhRealm.ARCH_REGION_M;
    const fx = P.x - nx * 700, fz = P.z - nz * 700;
    key = Math.floor(fx / R) + "," + Math.floor(fz / R);
    const neu = !(st._regionBundles && st._regionBundles.has(key));
    bg = r._archRegionBundleFor(key);
    aus.region = { key, neu, kugel: bg && bg.userData.cullSphere ? Math.round(bg.userData.cullSphere.radius) : null };
    // der Wagen: setzen, Blick zum Wasser, aufsitzen (aus der Ego-Sicht)
    const f = r._ensureAssetFoundry();
    const dl = performance.now() + 50000;
    while (performance.now() < dl && !(f && f.ready && f.recipes && f.recipes.gt && st.blueprints && st.blueprints.fahrzeug_gt)) await new Promise((q) => setTimeout(q, 80));
    const fahrt = Math.atan2(-nx, -nz); // zum Wasser
    st.playerMesh.position.set(ux, hh(ux, uz) + 1.2, uz);
    if (st.playerVel) st.playerVel.setValue(0, 0, 0);
    r.setCameraMode("first");
    e = r.spawnArchitecture("fahrzeug_gt", { x: ux, y: hh(ux, uz) + 0.5, z: uz }, { silent: true, precise: true, rotationY: fahrt - Math.PI / 2 });
    const dlB = performance.now() + 45000;
    while (e && !e.instanced && !e.mesh && performance.now() < dlB) { r._rebuildArchitectureMesh(e); if (e.instanced || e.mesh) break; await new Promise((q) => setTimeout(q, 200)); }
    const mr = r.mountArchitecture(e);
    aus.aufsitzen = !!(mr && mr.ok);
    const tasten = (w, sb) => { for (const k of ["w", "a", "s", "d", "shift", " "]) st.keys[k] = false; st.keys.w = !!w; st.keys.s = !!sb; };
    let tMs = performance.now();
    const tick = async (n) => { for (let i = 0; i < n; i++) { tMs += 16.7; r._gameLoopTick(tMs); Z.ticks++; if (i % 4 === 3) await new Promise((q) => setTimeout(q, 0)); } };
    phase = "fahrt";
    tasten(true); await tick(24); tasten(false, true); await tick(30); tasten(false);
    const wz = e.position;
    aus.halt = { abstand: Math.round(Math.hypot(wz.x - P.x, wz.z - P.z) * 10) / 10, modus: st.cameraMode };
    phase = "aussteigen";
    const ab = r.dismountArchitecture();
    aus.ausgestiegen = !!(ab && ab.ok);
    st.yaw = fahrt; // der Blick über das Wasser
    await tick(60);
    aus.nach = { modus: st.cameraMode, proxy: !!(bg && bg.userData._occlProxy), proxySichtbar: !!(bg && bg.userData._occlProxy && bg.userData._occlProxy.visible) };
    let w = 0; st.scene.traverse((o) => { if (o.isMesh && o.visible && o.material === st.hydroSurfaceMaterial) w++; }); aus.nach.wasser = w;
} finally {
    phase = "nachher";
    if (st.player && st.player.mountedArch != null) r.dismountArchitecture();
    if (e) r.removeArchitecture(e);
    if (bg && bg.userData._occlProxy) r._bundleQueryProxyTod(bg);
    if (bg && aus.region && aus.region.neu) { st.scene.remove(bg); st._regionBundles.delete(key); }
    AnazhRealm.BERG_CULL.queryTakt = taktVor; window.__anazhBergCull = cullVor;
    RP.beginOcclusionQuery = bQ; be.copyFramebufferToTexture = bruchVor; be.draw = dVor; be.beginRender = bRVor;
    for (const k in eigen) be[k] = eigen[k];
}
await new Promise((q) => setTimeout(q, 400));
be.device.removeEventListener("uncapturederror", fn);
window.removeEventListener("unhandledrejection", pe);
console.error = ce;
const zaehl = (l) => { const m = {}; for (const x of l) m[x] = (m[x] || 0) + 1; return m; };
Z.wartet = r._erstZeichnungStand().wartetN - warte0; Z.verschoben = r._erstZeichnungStand().verschoben - versch0;
return { ...aus, Z, gpuN: F.gpu.length, gpu: zaehl(F.gpu), seiteN: F.seite.length, seite: zaehl(F.seite), drei: zaehl(F.drei) };
