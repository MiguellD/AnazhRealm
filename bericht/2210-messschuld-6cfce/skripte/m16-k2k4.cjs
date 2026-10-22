// M16 Speicher K2 + K4 auf dem Pfad des Spielers (Host ohne save-server: :7960, isSaveServerHost nur :4312).
// K2: 90 s gehen (W, echte Eingabe), jeder saveState-Ruf mit seiner Haupt-Faden-Zeit (Hülle um den Ruf, performance.now),
//     dazu ein CPU-Profil (CDP Profiler, 100 µs) als Gegenprobe; je präsentiertem Bild (rAF) die Speicher-ms → p95 je Bild.
// K4: Bild-Rundlauf — eine Pose mit Pflicht-Inhalt (ein gesetzter Bau, ein Edit, Wasser im Blick wenn da), Bühne (Mittag,
//     Sonne, Sommer), Ausgabe-Bild A; saveState; Neuladen (selbes Profil = die Wiederkehr); dieselbe Pose aus dem Stand, Bühne,
//     Ausgabe-Bild B; Diff-Anteil der Pixel mit |ΔLuma| > 8 (von 255).
const fs = require("fs");
const path = require("path");
const { oeffne, klick, taste, warte, WT } = require("./spiel.cjs");
const { AUSGABE_INSTALL } = require(WT + "/scripts/lib/ausgabe-aufnahme.cjs");
const png = require("./png.cjs");
const S = __dirname;
const OUT = path.join(S, "roh", "m16-k2k4.json");
const W = 1920, H = 1080;

function hülle() {
    window.__save = [];
    window.__bildSave = [];
    let offen = 0;
    const f = () => { window.__bildSave.push(offen); offen = 0; requestAnimationFrame(f); };
    requestAnimationFrame(f);
    const warte = setInterval(() => {
        const r = window.anazhRealm;
        if (!r || typeof r.saveState !== "function" || r.__gehuellt) return;
        const P = Object.getPrototypeOf(r), org = P.saveState;
        P.saveState = function () { const t = performance.now(); const v = org.apply(this, arguments); const d = performance.now() - t; window.__save.push(d); offen += d; return v; };
        r.__gehuellt = true;
        clearInterval(warte);
    }, 20);
}

async function schuss(page, name) {
    const roh = await page.evaluate(async (W, H) => {
        window.__buehne();
        const { u8 } = await window.__ausgabeAufnahme(W, H);
        let s = ""; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
        return btoa(s);
    }, W, H);
    const u8 = new Uint8Array(Buffer.from(roh, "base64"));
    fs.writeFileSync(path.join(S, "roh", name), png(u8, W, H));
    return u8;
}

(async () => {
    const erg = {};
    const profil = path.join(S, "profil-k2k4");
    let o = await oeffne({ profil, vorDoc: [hülle, () => { window.__anazhAutoSettlement = false; }] });
    await klick(o.cdp);
    await warte(1000);
    await o.page.evaluate(async () => { const r = window.anazhRealm; for (const dl = performance.now() + 90000; performance.now() < dl && !(r._weltSteht && r._weltSteht()); ) await new Promise((f) => setTimeout(f, 250)); });
    // K2: 90 s gehen, Profil mit
    await o.cdp.send("Profiler.enable");
    await o.cdp.send("Profiler.setSamplingInterval", { interval: 100 });
    await o.page.evaluate(() => { window.__save.length = 0; window.__bildSave.length = 0; });
    await o.cdp.send("Profiler.start");
    await taste(o.cdp, "w", "keyDown");
    for (let i = 0; i < 6; i++) { await warte(15000); await o.page.evaluate(() => { window.anazhRealm.state.yaw += 0.7; }); }
    await taste(o.cdp, "w", "keyUp");
    const { profile } = await o.cdp.send("Profiler.stop");
    const k2 = await o.page.evaluate(() => ({ save: window.__save.slice(), bilder: window.__bildSave.slice(), stand: JSON.stringify(window.anazhRealm.buildStateSnapshot()).length }));
    // das Profil: Zeit unter saveState (inklusive Kinder)
    const byId = new Map(profile.nodes.map((n) => [n.id, n]));
    const parent = new Map();
    for (const n of profile.nodes) for (const c of n.children || []) parent.set(c, n.id);
    const unterSave = (id) => { for (let x = id; x != null; x = parent.get(x)) if (byId.get(x).callFrame.functionName === "saveState") return true; return false; };
    let tSave = 0;
    const dts = profile.timeDeltas;
    for (let i = 0; i < profile.samples.length; i++) if (unterSave(profile.samples[i])) tSave += (dts[i + 1] || dts[i] || 0) / 1000;
    const q = (a, p) => { const s = a.slice().sort((x, y) => x - y); return s.length ? +s[Math.min(s.length - 1, Math.ceil(p * s.length) - 1)].toFixed(3) : null; };
    erg.k2 = { rufe: k2.save.length, msJeRuf: { p50: q(k2.save, 0.5), max: q(k2.save, 1) }, summeMs: +k2.save.reduce((a, b) => a + b, 0).toFixed(2), profilMs: +tSave.toFixed(2), bilder: k2.bilder.length, jeBild: { p95: q(k2.bilder, 0.95), p99: q(k2.bilder, 0.99), max: q(k2.bilder, 1), mittel: +(k2.bilder.reduce((a, b) => a + b, 0) / k2.bilder.length).toFixed(4) }, bilderMitSave: k2.bilder.filter((x) => x > 0).length, standBytes: k2.stand };
    console.log("K2", JSON.stringify(erg.k2));
    // K4: Pflicht-Inhalt setzen (Bau + Edit), Pose halten, Bild A
    erg.k4 = await o.page.evaluate(async () => {
        const r = window.anazhRealm, st = r.state, p = st.playerMesh.position;
        const dv = st.camera.getWorldDirection(p.clone()); const l = Math.hypot(dv.x, dv.z) || 1;
        const bx = p.x + (dv.x / l) * 7, bz = p.z + (dv.z / l) * 7;
        const bau = r.spawnArchitecture("stein_block", { x: bx, y: r.getTerrainHeightAt(bx, bz) + 0.5, z: bz }, { precise: true });
        const ex = p.x + (dv.x / l) * 5 - (dv.z / l) * 3, ez = p.z + (dv.z / l) * 5 + (dv.x / l) * 3;
        r.dslRun(["voxel_carve", ex, r._voxelSurfaceY(ex, ez), ez, 2.0], { source: "human" });
        if (st.cameraMode !== "third") r.setCameraMode("third");
        for (let i = 0; i < 240; i++) await new Promise((f) => requestAnimationFrame(f));
        for (const dl = performance.now() + 60000; performance.now() < dl && !(r._weltSteht && r._weltSteht()); ) await new Promise((f) => setTimeout(f, 250));
        return { bau: !!bau, edits: Object.keys(st.worldMeta.voxelEdits || {}).length, pose: [p.x, p.y, p.z, st.yaw, st.pitch], sicht: st.cameraMode };
    });
    await warte(3000);
    const A = await schuss(o.page, "m16-k4-vor.png");
    erg.k4.gespeichert = await o.page.evaluate(() => window.anazhRealm.saveState());
    await warte(2500); // der IDB-Schreiber und der Spiegel kommen an
    await o.browser.close();
    // die Wiederkehr: frischer Prozess, selbes Profil
    o = await oeffne({ profil, neu: false, vorDoc: [() => { window.__anazhAutoSettlement = false; }] });
    await o.page.evaluate(AUSGABE_INSTALL);
    erg.k4.nachher = await o.page.evaluate(async (pose) => {
        const r = window.anazhRealm, st = r.state, p = st.playerMesh.position;
        const geladen = [p.x, p.y, p.z];
        st.yaw = pose[3]; st.pitch = pose[4]; // die Blick-Richtung ist kein Teil des Stands: gesetzt wie vorher
        if (st.cameraMode !== "third") r.setCameraMode("third");
        for (let i = 0; i < 240; i++) await new Promise((f) => requestAnimationFrame(f));
        for (const dl = performance.now() + 60000; performance.now() < dl && !(r._weltSteht && r._weltSteht()); ) await new Promise((f) => setTimeout(f, 250));
        return { geladen, dPose: +Math.hypot(geladen[0] - pose[0], geladen[2] - pose[2]).toFixed(3), edits: Object.keys(st.worldMeta.voxelEdits || {}).length, steinBloecke: (st.architectures || st.placedArchitectures || []).length };
    }, erg.k4.pose);
    await warte(3000);
    const B = await schuss(o.page, "m16-k4-nach.png");
    let anders = 0, n = 0, summe = 0;
    for (let i = 0; i < A.length; i += 4) {
        const la = 0.2126 * A[i] + 0.7152 * A[i + 1] + 0.0722 * A[i + 2], lb = 0.2126 * B[i] + 0.7152 * B[i + 1] + 0.0722 * B[i + 2];
        const d = Math.abs(la - lb); n++; summe += d; if (d > 8) anders++;
    }
    erg.k4.diffAnteil = +(anders / n).toFixed(4);
    erg.k4.mittelDeltaLuma = +(summe / n).toFixed(3);
    erg.fehler = o.fehler.slice(0, 5);
    console.log("K4", JSON.stringify(erg.k4));
    fs.writeFileSync(OUT, JSON.stringify(erg, null, 1));
    await o.browser.close();
})().catch((e) => { console.error("FEHLER", e && e.stack); process.exit(1); });
