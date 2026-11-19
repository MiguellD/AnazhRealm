// seite.js — der Rumpf in der Seite für vorher.cjs (r, T aus dem /eval der Werkbank; sleep, __loop, __weltDa, __gebautNach aus
// welt-boot). window.__vb hält die Helfer über die Rufe. NUR LESEN am Spiel — gesetzt werden allein Spieler-Ort, Kamera
// (`_loopCamera` für den Schuss, wie p3/n1811/netz/gasse.cjs), Sicht (setCameraMode) und einzelne Häuser über die Wurzel des
// Spiels (spawnArchitecture / removeArchitecture, wie p3/n1811/reib/seite.js den GT setzt).
// KEIN Backtick und kein Dollar-Klammer im Text der Seite (er steht in einem Template-String), keine Backslash-Regexe.
module.exports = {
    install: `
const V = (window.__vb = { kamAlt: null, fov0: null, soloE: null, sichtAlt: null });
const FC = globalThis.__fachwerkCore;
V.e = (id) => (r.state.architectures || []).find((e) => e && e.id === id) || null;
// die Stufe, in der ein Haus JETZT im Bild steht: Mesh/Instanz L0..L2 (entry._lodLevel), Satz im Welt-March (Stufe 3),
// Masse der Stadt-Ferne (Stufe 2 der Ferne, state.stadtFerne.von), sonst ohne Bild
V.stufe = (e) => {
    if (!e) return null;
    if (r._archIsRendered(e)) return "L" + e._lodLevel;
    if (e._ziegelSlot) return "S3-satz";
    const F = r.state.stadtFerne, m = F && F.von ? F.von.get(e) : null;
    return m && m.e && m.e.anH && m.e.anH[m.j] ? "S4-masse" : "ohne-bild";
};
// die Normale der Tür-Wand (haus-lokal, Einheits-Achse): die Wand, an der die Tür-Zeile am weitesten außen liegt
V.norm = (t, ex, ez, ox, oz) => {
    if (!t || !Number.isFinite(t.x) || !Number.isFinite(t.z)) return null;
    const qx = Math.abs(t.x - ox) / Math.max(0.1, ex), qz = Math.abs(t.z - oz) / Math.max(0.1, ez);
    return qz >= qx ? [0, t.z - oz >= 0 ? 1 : -1] : [t.x - ox >= 0 ? 1 : -1, 0];
};
// was der Treiber von einem Haus braucht: Ort, Gier, Kern-Maß W × D (Tür-Zeile des Exports, sonst Grundriss), Grundriss für die
// Frei-Probe, Tür, Kamin-Spitze (haus-lokal), Geschosse und Neigung (Stempel, sonst Kultur-Tafel), Stufe, Alter
V.info = (e, q) => {
    if (!e || !e.position) return null;
    let kultur = (q && q.kultur) || null;
    if (!kultur) { try { kultur = r._foundryPresetForEntry(e) || null; } catch (_e) { kultur = null; } }
    const K = (FC && FC.KULTUR && kultur && FC.KULTUR[kultur]) || {};
    const ov = e.studioOv && typeof e.studioOv === "object" ? e.studioOv : {};
    let fp = null;
    try { fp = r._grundrissVon(e) || r._grundrissVon(e, e.type); } catch (_e) { fp = null; }
    const t = e.tuer || (q && q.tuer) || (fp && fp.tuer) || null;
    const kern = !!(t && Number.isFinite(t.W) && Number.isFinite(t.D));
    const W = kern ? t.W : fp ? 2 * fp.ex : Number.isFinite(ov.W) ? ov.W : K.W || 9;
    const D = kern ? t.D : fp ? 2 * fp.ez : Number.isFinite(ov.D) ? ov.D : K.D || 7;
    const fx = fp ? { ex: fp.ex, ez: fp.ez, ox: fp.ox || 0, oz: fp.oz || 0 } : { ex: W / 2, ez: D / 2, ox: 0, oz: 0 };
    const mx = kern ? 0 : fx.ox, mz = kern ? 0 : fx.oz;
    let alter = null;
    try { alter = r._werkAlter(e); } catch (_e) { alter = null; }
    const hu = e._hausHuelle || null;
    const kq = e.chimney || (e.userData && e.userData.rauchQuelle) || (hu && hu.kamin) || null;
    return {
        id: e.id, type: e.type, kultur, rolle: (q && typeof q.rolle === "string" && q.rolle) || null, seed: e.seed >>> 0,
        x: e.position.x, z: e.position.z, y0: e.position.y - 0.5, phi: e.rotationY || 0, W, D, mx, mz, fx,
        tuer: t && Number.isFinite(t.x) && Number.isFinite(t.z) ? { x: t.x, z: t.z, w: Number.isFinite(t.w) ? t.w : 1 } : null,
        n: V.norm(t, W / 2, D / 2, mx, mz),
        kamin: kq && Number.isFinite(kq.x) && Number.isFinite(kq.y) && Number.isFinite(kq.z) ? { x: kq.x, y: kq.y, z: kq.z } : null,
        st: Number.isFinite(ov.storeys) ? ov.storeys : K.st || 2, pitch: Number.isFinite(ov.pitchDeg) ? ov.pitchDeg : K.pitch || 45,
        stempel: Object.keys(ov).length ? JSON.parse(JSON.stringify(ov)) : null,
        stufe: V.stufe(e), lod: e._lodLevel == null ? null : e._lodLevel, served: e._servedLod == null ? null : e._servedLod, masse: e._masse === true,
        geburt: e.geburt == null ? null : e.geburt, alter, verwitterung: e._alter && e._alter.ov ? e._alter.ov.verwitterung : null,
    };
};
// die Häuser EINER Siedlung (Schlüssel aus r._bewohnerSiedlungen) in der Folge ihrer Lose
V.haeuser = (key) => {
    const S = r._bewohnerSiedlungen && r._bewohnerSiedlungen.get(key);
    if (!S || !S.plan || !S.plan.slots) return [];
    const aus = [];
    for (const q of S.plan.slots) { const e = r._dorfHaus(S.ox + q.x, S.oz + q.z, q.seed >>> 0); if (e) aus.push(V.info(e, q)); }
    return aus;
};
// die Grundrisse ALLER Häuser aller Siedlungen (für die Frei-Probe einer Kamera)
V.alle = () => {
    const aus = [];
    for (const S of (r._bewohnerSiedlungen || new Map()).values()) {
        if (!S || !S.plan || !S.plan.slots) continue;
        for (const q of S.plan.slots) {
            const e = r._dorfHaus(S.ox + q.x, S.oz + q.z, q.seed >>> 0);
            if (!e) continue;
            let fp = null;
            try { fp = r._grundrissVon(e); } catch (_e) { fp = null; }
            const t = e.tuer || q.tuer || null;
            const fx = fp ? { ex: fp.ex, ez: fp.ez, ox: fp.ox || 0, oz: fp.oz || 0 } : { ex: t && t.W ? t.W / 2 : 4.5, ez: t && t.D ? t.D / 2 : 3.5, ox: 0, oz: 0 };
            aus.push({ id: e.id, x: e.position.x, z: e.position.z, phi: e.rotationY || 0, fx });
        }
    }
    return aus;
};
V.naechste = (x, z) => {
    let best = null, bd = Infinity;
    for (const [k, S] of r._bewohnerSiedlungen || new Map()) {
        if (!S || !S.plan || !S.plan.slots || !S.plan.slots.length) continue;
        const d = Math.hypot(S.ox - x, S.oz - z);
        if (d < bd) { bd = d; best = k; }
    }
    return best == null ? null : { key: best, d: bd };
};
// DIE POSE: der Spieler an sp (auf dem Boden), die Kamera für den Schuss an kam → ziel mit fov. kam[1] / ziel[1] null: Höhe
// über dem Boden dort (kamH / zielH). ohneKamera: nur der Spieler (der Schuss stellt die Kamera selbst, /bild).
V.setz = (o) => {
    const st = r.state, p = st.playerMesh.position, by = r._voxelSurfaceY(o.sp[0], o.sp[1]);
    p.set(o.sp[0], by + 1.8, o.sp[1]);
    if (st.playerVel && typeof st.playerVel.setValue === "function") st.playerVel.setValue(0, 0, 0);
    const k = [o.kam[0], o.kam[1] != null ? o.kam[1] : r._voxelSurfaceY(o.kam[0], o.kam[2]) + (o.kamH || 1.7), o.kam[2]];
    const z = [o.ziel[0], o.ziel[1] != null ? o.ziel[1] : r._voxelSurfaceY(o.ziel[0], o.ziel[2]) + (o.zielH || 0), o.ziel[2]];
    st.yaw = Math.atan2(z[0] - o.sp[0], z[2] - o.sp[1]);
    const fov = Number.isFinite(o.fov) ? o.fov : AnazhRealm.KAM_FOV_GRAD;
    const aus = { spieler: [o.sp[0], o.sp[1]], boden: by, kamera: k, ziel: z, fov };
    if (o.sicht === "third") {
        if (V.sichtAlt == null) V.sichtAlt = st.cameraMode || "first";
        r.setCameraMode("third");
        st.playerMesh.rotation.y = Math.atan2(k[0] - o.sp[0], k[2] - o.sp[1]);
    }
    if (o.ohneKamera) return aus;
    if (!V.kamAlt) { V.kamAlt = r._loopCamera; V.fov0 = st.camera.fov; }
    r._loopCamera = function () {
        const s2 = this.state, c = s2.camera;
        if (c.fov !== fov) { c.fov = fov; c.updateProjectionMatrix(); try { if (s2.csmNode && s2.csmNode.camera) s2.csmNode.updateFrustums(); } catch (_e) { /* */ } }
        c.position.set(k[0], k[1], k[2]);
        c.lookAt(z[0], z[1], z[2]);
        c.updateMatrixWorld(true);
    };
    return aus;
};
// die Kamera und die Sicht des Spiels zurück
V.frei = () => {
    const st = r.state, c = st.camera;
    if (V.kamAlt) {
        r._loopCamera = V.kamAlt;
        V.kamAlt = null;
        const f = Number.isFinite(r._kamFovSoll) ? r._kamFovSoll : V.fov0;
        if (Number.isFinite(f) && c.fov !== f) { c.fov = f; c.updateProjectionMatrix(); try { if (st.csmNode && st.csmNode.camera) st.csmNode.updateFrustums(); } catch (_e) { /* */ } }
    }
    if (V.sichtAlt != null) { r.setCameraMode(V.sichtAlt === "third" ? "third" : "first"); V.sichtAlt = null; }
    return 1;
};
// der Loop läuft, bis die Welt nichts mehr offen hat (vier Proben in Folge), mindestens minS, höchstens maxS Sekunden
V.ruhe = async (maxS, minS) => {
    __loop(1);
    let still = 0, i = 0, o = null;
    for (; i < maxS * 4; i++) {
        await sleep(250);
        o = r._weltOffen();
        const auf = Object.values(o).some(Boolean) || !!r._dorfOffen();
        still = auf ? 0 : still + 1;
        if (i >= (minS || 2) * 4 && still >= 4) break;
    }
    __loop();
    return { s: i / 4, ruht: still >= 4, offen: JSON.stringify(o).slice(0, 300) };
};
// der Loop läuft, bis das Haus in einer der Soll-Stufen steht (drei Proben in Folge); ohne Soll: bis es ein Bild trägt
V.warteStufe = async (id, soll, maxS) => {
    __loop(1);
    let s = null, i = 0, gleich = 0, da = false;
    for (; i < maxS * 4; i++) {
        await sleep(250);
        const j = V.stufe(V.e(id));
        gleich = j === s ? gleich + 1 : 0;
        s = j;
        da = soll ? soll.indexOf(s) >= 0 && gleich >= 3 : s !== "ohne-bild" && s != null && gleich >= 6;
        if (da) break;
    }
    __loop();
    return { stufe: s, s: i / 4, erreicht: da };
};
V.lage = () => {
    const st = r.state, c = st.camera, p = st.playerMesh.position, wm = st.worldMeta || {}, g = r._schirm() || {};
    return {
        uhr: st.timeOfDay, weltTag: r._weltTag(), wetter: st.weather, saison: st.season, saisonPhase: st.seasonPhase, sicht: st.cameraMode,
        nassTage: wm.nassTage == null ? null : wm.nassTage, schirm: JSON.parse(JSON.stringify(g)),
        spieler: [p.x, p.y, p.z], kamera: [c.position.x, c.position.y, c.position.z], fov: c.fov, offen: JSON.stringify(r._weltOffen()).slice(0, 300),
    };
};
// die Ferne der Stadt kurz (wie gasse.cjs stadtFerne): Kacheln je Stufe, Massen an
V.ferne = () => {
    const F = r.state.stadtFerne;
    if (!F || !F.je) return null;
    const sum = (a) => { let n = 0; for (const v of a || []) n += v; return n; };
    const je = [...F.je].map(([k, e]) => [k, e.los ? 2 : 1, sum(e.anH)]);
    return { kacheln: je.length, stufe1: je.filter((q) => q[1] === 1).length, stufe2: je.filter((q) => q[1] === 2).length, massenAn: je.reduce((a, q) => a + q[2], 0) };
};
// EIN EINZELNES HAUS einer Kultur an (x, z), die Tür-Wand nach (dx, dz): der Bauplan des Spiels (_slotBauplan), die Wurzel des
// Spiels (spawnArchitecture, silent + precise wie der Wurf eines Orts), mit ov der Stempel eines Studio-Werks (_studioStampFor,
// die Klemme des Vertrags). Das vorige einzelne Haus fällt (removeArchitecture).
V.soloWeg = () => { if (V.soloE) { try { r.removeArchitecture(V.soloE, { still: true }); } catch (_e) { /* */ } V.soloE = null; } return 1; };
V.solo = async (kultur, seed, x, z, dx, dz, ov) => {
    V.soloWeg();
    const f = typeof r._ensureAssetFoundry === "function" ? r._ensureAssetFoundry() : r._foundry;
    await __weltDa(() => f && f.ready && f.recipes && f.recipes[kultur]);
    const name = r._slotBauplan({ kultur }, f);
    if (!name) return { fehler: "kein Bauplan der Kultur " + kultur };
    let stempel = null;
    const befund = {};
    if (ov) {
        stempel = r._studioStampFor(name, ov, befund);
        if (stempel === false) return { fehler: "der Stempel fällt, fremde Regler " + JSON.stringify(befund.fremd), kennt: befund.kennt };
    }
    let fp = null;
    try { fp = r._grundrissVon(stempel ? { seed, studioOv: stempel } : { seed }, name, seed); } catch (_e) { fp = null; }
    const n = (fp && V.norm(fp.tuer, fp.ex, fp.ez, fp.ox || 0, fp.oz || 0)) || [0, 1];
    const phi = Math.atan2(dx, dz) - Math.atan2(n[0], n[1]);
    const y = r.getTerrainHeightAt(x, z);
    let grund = null;
    const opts = { seed, rotationY: phi, silent: true, precise: true, absage: (g) => { grund = g; } };
    if (stempel) opts.studioOv = stempel;
    const e = r.spawnArchitecture(name, { x, y: y + 0.5, z }, opts);
    if (!e) return { fehler: "kein Haus gesetzt (" + kultur + "): " + grund };
    V.soloE = e;
    const takte = await __gebautNach(e);
    return { info: V.info(e, { kultur }), name, takte, stempel, geklemmt: befund.geklemmt || null, kennt: befund.kennt || null, tuerAusGesetz: !!(fp && fp.tuer), boden: y };
};
// die Hauptstraße Ost–West der Kachel-Reihe k über die Kacheln i0..i1 der Stadt s (wörtlich aus gasse.cjs)
window.__haupt = (s, i0, i1, k) => { const M = AnazhRealm._siedlungGesetz().cellM, aus = [];
    for (let i = i0; i <= i1; i++) { const N = FC.kachelNetz(s.seed, i, k), ox = s.x + i * M, oz = s.z + k * M;
        const E = N.edges.filter((e) => e.gen === 0 && Math.abs(e.pts[e.pts.length - 1].x - e.pts[0].x) > Math.abs(e.pts[e.pts.length - 1].z - e.pts[0].z)).sort((a, b) => a.pts[0].x - b.pts[0].x);
        for (const e of E) for (const q of e.pts) { const w = [ox + q.x, oz + q.z], v = aus[aus.length - 1]; if (!v || Math.hypot(w[0] - v[0], w[1] - v[1]) > 0.05) aus.push(w); } }
    return aus; };
return 1;`,
};
