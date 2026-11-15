const st = r.state, THREE = T, W = 1920, H = 1080, t0 = performance.now();
const sl = (ms) => new Promise((f) => setTimeout(f, ms));
const L = (u, k) => 0.2126 * u[k] + 0.7152 * u[k + 1] + 0.0722 * u[k + 2];
const cam = st.camera, pm = st.playerMesh.position, start = pm.clone(), y = (p) => r._voxelSurfaceY(p.x, p.z);
const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion).setY(0).normalize();
st.renderer.setAnimationLoop(null);
window.__buehne({});
const kost = [];
const schuss = async (p) => {
    cam.fov = r.constructor.KAM_FOV_GRAD;
    cam.updateProjectionMatrix();
    cam.position.set(p.x, y(p) + 1.7, p.z);
    cam.lookAt(p.x + fwd.x * 50, y(p) + 1.7, p.z + fwd.z * 50);
    cam.updateMatrixWorld(true);
    const f = await __ausgabeAufnahme(W, H, 1, { satz: "messung" });
    kost.push([f.info.drawCalls, f.info.triangles]);
    return f.u8;
};
const geh = async (p) => {
    pm.set(p.x, y(p) + 0.05, p.z);
    for (let t = 0; t < 12; t++) (r._gameLoopTick(performance.now()), await sl(5));
};
const stufe = (e) => [(e._lodLevel ?? -1) * 7 + (e._lodBandLevel | 0), r._archIsRendered(e)];
const fB = W / (2 * Math.tan((cam.fov * Math.PI) / 360)) * (H / W) * (W / H); // Brennweite in px je Zeile: H / (2 tan(fov/2))
const brenn = H / (2 * Math.tan((r.constructor.KAM_FOV_GRAD * Math.PI) / 360));
// die Gestalt am Schirm: Fuß und Scheitel projiziert, Breite 0,6 × Höhe
const v = new THREE.Vector3();
const proj = (x, yy, z) => (v.set(x, yy, z).project(cam), [((v.x + 1) / 2) * W, ((1 - v.y) / 2) * H, v.z]);
const kasten = (e) => {
    let h = 0;
    try { h = r._lodTreeVisHeight(e) || 0; } catch (_) {}
    if (!(h > 0)) h = (e.scale || 1) * 4;
    const p = e.position, a = proj(p.x, p.y, p.z), b = proj(p.x, p.y + h, p.z);
    const d = Math.hypot(p.x - cam.position.x, p.z - cam.position.z);
    const hp = Math.abs(a[1] - b[1]), wp = 0.6 * hp;
    const vor = a[2] < 1 && a[2] > -1;
    return { h: +h.toFixed(1), d: Math.round(d), px: +((h * brenn) / Math.max(d, 1)).toFixed(1), x0: Math.min(a[0], b[0]) - wp / 2 - 2, x1: Math.max(a[0], b[0]) + wp / 2 + 2, y0: b[1] - 2, y1: a[1] + 2, vor: vor && a[0] > -wp && a[0] < W + wp && b[1] < H };
};
const name = (e) => {
    let pre = null, kind = null;
    try { pre = r._foundryPresetForEntry(e); kind = pre && r._foundry && r._foundry.recipes && r._foundry.recipes[pre] ? r._foundry.recipes[pre].kind : null; } catch (_) {}
    return `${kind || "?"}:${pre || e.type}${e.feldWurf ? ":wurf" : ""}`;
};
// die Klassen im Bild (`_taeterKlasse`): je Klasse ihre Meshes
const klassen = () => {
    const m = new Map();
    st.scene.traverse((o) => {
        if (!o.isMesh || o.visible !== true) return;
        let p = o.parent, sicht = true;
        while (p) { if (p.visible === false) sicht = false; p = p.parent; }
        if (!sicht) return;
        const k = r._taeterKlasse(o).slice(0, 48);
        (m.get(k) || m.set(k, []).get(k)).push(o);
    });
    return m;
};
const masken = async (p, bild, nur) => {
    const m = klassen(), aus = {};
    for (const [k, os] of m) {
        if (nur && !nur.has(k)) continue;
        if (performance.now() - t0 > 420000) { aus.__zeit = 1; break; }
        os.forEach((o) => (o.visible = false));
        window.__bundlesNeu && window.__bundlesNeu();
        const u = await schuss(p);
        os.forEach((o) => (o.visible = true));
        window.__bundlesNeu && window.__bundlesNeu();
        const mk = new Uint8Array(W * H);
        let n = 0;
        for (let i = 0, k4 = 0; i < W * H; i++, k4 += 4) if (u[k4] !== bild[k4] || u[k4 + 1] !== bild[k4 + 1] || u[k4 + 2] !== bild[k4 + 2]) (mk[i] = 1), n++;
        if (n) aus[k] = mk;
    }
    return aus;
};
const out = { brenn: +brenn.toFixed(1), zeilen: r._schirm ? r._schirm().hoehe : null, schritte: [], start: [start.x, start.z] };
let nur = null;
try {
    for (let i = 0; i < 8; i++) {
        const p1 = start.clone().addScaledVector(fwd, (i + 1) / 2);
        await geh(start.clone().addScaledVector(fwd, i / 2));
        const laubA = r._laubRand();
        const vor = new Map(st.architectures.filter(Boolean).map((e) => [e, stufe(e)]));
        const a = await schuss(p1);
        const MA = await masken(p1, a, nur);
        if (!nur) nur = new Set(Object.keys(MA)); // nur Klassen, die im ersten Bild Pixel tragen
        await geh(p1);
        const b = await schuss(p1);
        const s = { laubA, laubB: r._laubRand(), arch: st.architectures.length, pop: 0, ein: [], aus: [], wechsel: [], zeilen: [0, 0, 0, 0, 0, 0], inKasten: 0 };
        const popM = new Uint8Array(W * H);
        let heller = 0;
        for (let i2 = 0, k = 0; i2 < W * H; i2++, k += 4) {
            const d = L(b, k) - L(a, k);
            if (Math.abs(d) > 18) { popM[i2] = 1; s.pop++; s.zeilen[Math.floor((i2 / W / H) * 6)]++; if (d > 0) heller++; }
        }
        s.heller = heller;
        const kaesten = [];
        for (const e of st.architectures) {
            if (!e) continue;
            const w = vor.get(e), jetzt = stufe(e);
            let art = null;
            if (jetzt[1] && !(w && w[1])) art = w ? "ein" : "neu";
            else if (w && w[1] && !jetzt[1]) art = "aus";
            else if (w && w[0] !== jetzt[0]) art = "wechsel";
            if (!art) continue;
            const ka = kasten(e);
            const z = { art, name: name(e), d: ka.d, h: ka.h, px: ka.px, vor: ka.vor, von: w ? w[0] : null, zu: jetzt[0], occ: e._occluded === true };
            (art === "aus" ? s.aus : art === "wechsel" ? s.wechsel : s.ein).push(z);
            if (ka.vor) kaesten.push(ka);
        }
        for (let i2 = 0; i2 < W * H; i2++) {
            if (!popM[i2]) continue;
            const xx = i2 % W, yy = (i2 / W) | 0;
            if (kaesten.some((q) => xx >= q.x0 && xx <= q.x1 && yy >= q.y0 && yy <= q.y1)) s.inKasten++;
        }
        if (s.pop > 300) {
            const MB = await masken(p1, b, nur);
            const kl = {};
            for (const k of new Set([...Object.keys(MA), ...Object.keys(MB)])) {
                if (k === "__zeit") continue;
                let inA = 0, inB = 0;
                const ma = MA[k], mb = MB[k];
                for (let i2 = 0; i2 < W * H; i2++) if (popM[i2]) { if (ma && ma[i2]) inA++; if (mb && mb[i2]) inB++; }
                if (inA + inB > 0) kl[k] = [inA, inB];
            }
            s.klassen = kl;
            s.zeitAus = !!(MA.__zeit || MB.__zeit);
        }
        out.schritte.push(s);
    }
} finally {
    pm.copy(start);
}
out.ms = Math.round(performance.now() - t0);
out.kosten = kost.slice(-1);
return out;
