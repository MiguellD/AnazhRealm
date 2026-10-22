// M18 Halten K2 — Eingabe → erstes Schwung-Bild, wie werkbank latenz: Start = timeStamp des mousedown (CDP
// Input.dispatchMouseEvent, echter Pfad: Zeiger gefangen → break → tryMouseBreak → _beginPlayerSwing), Ende = die Marke des
// präsentierten Bilds (getCurrentTexture am Canvas der Welt), in dem die rechte Hand (rig.armR.wrist, im Leib-Raum) ≥ 1 cm von
// ihrer Lage im letzten Bild vor dem Klick steht. Hit-Stop: ein Tier steht vor dem Spieler (gehalten); je präsentiertem
// Bild die Hand-Lage — ein Plateau (< 1 mm, ≥ 2 Bilder) in der Strike-Phase ist der Hit-Stop im Bild; Gegenprobe Luftschlag.
const fs = require("fs");
const path = require("path");
const { oeffne, klick, warte, WT } = require("./spiel.cjs");
const BAND = require(WT + "/scripts/lib/band-urteil.cjs");
const { pngLesen } = require(WT + "/scripts/lib/abnahme-urteil.cjs");
const S = __dirname;
const PROBEN = Number(process.argv[2] || 30);
const OUT = path.join(S, "roh", "m18-schwung.json");

function hakenAn() {
    const r = window.anazhRealm, st = r.state, rend = st.renderer;
    const pm = st.playerMesh;
    const hand = () => {
        const w = pm.userData.rig.armR.wrist;
        const v = w.getWorldPosition(new pm.position.constructor());
        const y = pm.rotation.y, dx = v.x - pm.position.x, dz = v.z - pm.position.z;
        return [-Math.cos(y) * dx + Math.sin(y) * dz, v.y - pm.position.y, Math.sin(y) * dx + Math.cos(y) * dz];
    };
    const L = (window.__sw = { bilder: [], probe: null, spur: null });
    const gct = GPUCanvasContext.prototype.getCurrentTexture;
    GPUCanvasContext.prototype.getCurrentTexture = function () {
        if (this.canvas === rend.domElement) {
            const t = performance.now(), h = hand(), p = L.probe;
            const sw = st.player && st.player._swing;
            if (p && p.t0 != null && p.regung == null && Math.hypot(h[0] - p.ref[0], h[1] - p.ref[1], h[2] - p.ref[2]) >= 0.001) p.regung = t - p.t0;
            if (p && p.t0 != null && p.swingAm == null && sw) p.swingAm = t - p.t0;
            if (p && p.t0 != null && p.ms == null && Math.hypot(h[0] - p.ref[0], h[1] - p.ref[1], h[2] - p.ref[2]) >= 0.01)
                p.ms = t - p.t0;
            if (L.spur) L.spur.push({ t, h, swT: sw ? +sw.t.toFixed(4) : null, stop: Number.isFinite(st.player._hitStopUntil) && performance.now() / 1000 < st.player._hitStopUntil });
            L.vor = h;
            L.bilder.push(t);
        }
        return gct.call(this);
    };
    window.addEventListener("mousedown", (ev) => {
        const p = L.probe;
        if (p && p.t0 == null) Object.assign(p, { t0: ev.timeStamp, eingabe: performance.now() - ev.timeStamp, ref: L.vor });
    }, true);
    L.bereit = async () => {
        L.probe = null;
        for (let i = 0; i < 400 && st.player._swing; i++) await new Promise((f) => requestAnimationFrame(f));
        for (let i = 0; i < 12; i++) await new Promise((f) => requestAnimationFrame(f));
        await new Promise((f) => setTimeout(f, Math.random() * 17));
        L.probe = {};
        return true;
    };
    L.treffer = async () => {
        for (let i = 0; i < 90 && L.probe.ms == null; i++) await new Promise((f) => requestAnimationFrame(f));
        const p = L.probe; return { ms: p.ms, eingabe: p.eingabe, regung: p.regung, swingBild: p.swingAm };
    };
}

(async () => {
    const ort = BAND.ladeSpec("wiese").ort;
    const o = await oeffne({ profil: path.join(S, "profil-schwung"), vorDoc: [() => { window.__anazhAutoSettlement = false; }] });
    const { page, cdp } = o;
    await klick(cdp);
    await warte(1000);
    const stand = await page.evaluate(async (x, z, gier) => {
        const r = window.anazhRealm, st = r.state;
        window.__wetterSetzen && window.__wetterSetzen("sunny");
        st.yaw = gier; st.pitch = 0;
        st.playerMesh.position.set(x, r._voxelSurfaceY(x, z) + 1.8, z);
        for (const dl = performance.now() + 90000; performance.now() < dl && !(r._weltSteht && r._weltSteht()); ) await new Promise((f) => setTimeout(f, 250));
        return { locked: !!st.isPointerLocked, modus: r.getGameMode && r.getGameMode(), held: st.player && st.player.equipped && st.player.equipped.held, rig: !!(st.playerMesh.userData.rig && st.playerMesh.userData.rig.armR) };
    }, ort.spieler[0], ort.spieler[1], BAND.ortGier(ort));
    if (!stand.locked) { await klick(cdp); await warte(800); stand.locked2 = await page.evaluate(() => !!window.anazhRealm.state.isPointerLocked); }
    await page.evaluate(hakenAn);
    await page.evaluate(fs.readFileSync(path.join(S, "zielen.js"), "utf8"));
    const druck = async () => {
        await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: 960, y: 540, button: "left", clickCount: 1 });
        await warte(30);
        await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: 960, y: 540, button: "left", clickCount: 1 });
    };
    const fps = await page.evaluate(async () => { let n = 0; const t0 = performance.now(); await new Promise((res) => { const f = () => (++n < 120 ? requestAnimationFrame(f) : res()); requestAnimationFrame(f); }); return +(n / ((performance.now() - t0) / 1000)).toFixed(1); });
    const erg = { stand, fpsVor: fps, reihen: {} };
    for (const sicht of ["third", "first"]) {
        await page.evaluate((s) => window.anazhRealm.setCameraMode(s), sicht);
        await warte(800);
        const blick = await page.evaluate(() => window.__zielTier(4)); // ein Tier jenseits der Klinge unter dem Fadenkreuz: der Klick ist ein Hieb (Luftschlag)
        const reihe = [];
        for (let i = 0; i < PROBEN; i++) {
            await page.evaluate(() => window.__sw.bereit());
            await druck();
            const tr = await page.evaluate(() => window.__sw.treffer());
            tr.verb = await page.evaluate(() => window.anazhRealm.state.player._mausVerb);
            reihe.push(tr);
        }
        const ms = reihe.filter((p) => p.ms != null).map((p) => p.ms).sort((a, b) => a - b);
        const q = (v) => (ms.length ? +ms[Math.min(ms.length - 1, Math.ceil(v * ms.length) - 1)].toFixed(1) : null);
        erg.reihen[sicht] = { n: ms.length, fehlt: reihe.length - ms.length, p50: q(0.5), p95: q(0.95), max: q(1), regungMed: +(reihe.map((p) => p.regung || 0).sort((a, b) => a - b)[reihe.length >> 1]).toFixed(1), swingBildMed: +(reihe.map((p) => p.swingBild || 0).sort((a, b) => a - b)[reihe.length >> 1]).toFixed(1), blick, verben: reihe.map((p) => p.verb).join(","), eingabeMed: +(reihe.map((p) => p.eingabe || 0).sort((a, b) => a - b)[reihe.length >> 1]).toFixed(2) };
    }
    // HIT-STOP: Third, ein Tier vor dem Spieler (gehalten), Spur je Bild + Screencast der Bildmitte; Gegenprobe ohne Tier
    await page.evaluate(() => window.anazhRealm.setCameraMode("third"));
    await warte(600);
    const hit = {};
    const versuche = [];
    for (const mitTier of [true, true, true, true, true, false]) {
        if (mitTier && hit.tier && hit.tier.stopBilder > 0) continue;
        const vor = await page.evaluate((m) => window.__zielTier(m ? 0.5 : 4, m ? 0.2 : undefined), mitTier);
        const frames = [];
        const onF = (f) => { cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {}); frames.push({ t: f.metadata.timestamp * 1000, b: f.data }); };
        cdp.on("Page.screencastFrame", onF);
        await cdp.send("Page.startScreencast", { format: "png", everyNthFrame: 1, maxWidth: 960, maxHeight: 540 });
        await page.evaluate(() => { window.__sw.spur = []; });
        await warte(300);
        await page.evaluate(() => window.__sw.bereit());
        await druck();
        await warte(1800);
        await cdp.send("Page.stopScreencast");
        cdp.off("Page.screencastFrame", onF);
        const spur = await page.evaluate(() => { const s = window.__sw.spur; window.__sw.spur = null; return s; });
        const verb = await page.evaluate(() => window.anazhRealm.state.player._mausVerb);
        // Plateaus in der Schwung-Phase: Folgen präsentierter Bilder mit Hand-Weg < 1 mm, solange _swing läuft
        let lauf = 0, maxLauf = 0, stopBilder = 0;
        for (let i = 1; i < spur.length; i++) {
            const a = spur[i - 1], b = spur[i];
            if (b.stop) stopBilder++;
            const d = Math.hypot(b.h[0] - a.h[0], b.h[1] - a.h[1], b.h[2] - a.h[2]);
            if (b.swT != null && a.swT != null && d < 0.001) { lauf++; maxLauf = Math.max(maxLauf, lauf); } else lauf = 0;
        }
        // Bild-Seite: |ΔLuma| im Mittel-Kasten (der Leib im Third) je Screencast-Bild
        const diffs = [];
        let vorL = null;
        for (const f of frames) {
            const p = pngLesen(Buffer.from(f.b, "base64"));
            const L = [];
            for (let y = Math.floor(p.H * 0.35); y < Math.floor(p.H * 0.9); y += 2) for (let x = Math.floor(p.W * 0.35); x < Math.floor(p.W * 0.65); x += 2) { const i = (y * p.W + x) * 4; L.push(0.2126 * p.u8[i] + 0.7152 * p.u8[i + 1] + 0.0722 * p.u8[i + 2]); }
            if (vorL) { let s = 0; for (let k = 0; k < L.length; k++) s += Math.abs(L[k] - vorL[k]); diffs.push({ t: +(f.t).toFixed(1), d: +(s / L.length).toFixed(3) }); }
            vorL = L;
        }
        if (mitTier && frames.length > 4) {
            // das Bild mit dem kleinsten Unterschied mitten im Schwung ablegen
            fs.writeFileSync(path.join(S, "roh", "m18-hitstop-bild.png"), Buffer.from(frames[Math.floor(frames.length / 3)].b, "base64"));
        }
        versuche.push({ mitTier, verb, d: vor.d, stopBilder });
        hit[mitTier ? "tier" : "luft"] = { vor, verb, kreaturen: await page.evaluate(() => window.anazhRealm.state.creatures.length), bilder: spur.length, stopBilder, maxPlateauBilder: maxLauf, screencast: frames.length, diffs };
    }
    erg.hitStop = hit;
    erg.hitVersuche = versuche;
    erg.fehler = o.fehler.slice(0, 5);
    fs.writeFileSync(OUT, JSON.stringify(erg, null, 1));
    console.log(JSON.stringify({ stand: erg.stand, fps, reihen: erg.reihen, tier: { vor: hit.tier.vor, stopBilder: hit.tier.stopBilder, plateau: hit.tier.maxPlateauBilder }, luft: { stopBilder: hit.luft.stopBilder, plateau: hit.luft.maxPlateauBilder } }));
    await o.browser.close();
})().catch((e) => {
    console.error("FEHLER", e && e.stack);
    process.exit(1);
});
