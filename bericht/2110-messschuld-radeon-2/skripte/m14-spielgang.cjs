// M14 Profiband K5 + M19 Ökologie K5 — EIN Spielgang am Stück an der Radeon (echte GPU, Fenster 1920×1080, Spiel-Loop
// läuft selbst, Klang an). Ablauf: ankommen (frisches Profil) · Zensus A am Start · 10 min gehen mit einem gebundenen Tier
// („folge mir" im Chat, echte Tasten) · GT aufsitzen (E), 6 min Fahrt · absitzen, „setze uhrzeit mitternacht" · ein Bau
// (spawnArchitecture, benannt) · 4 min gehen · zurück an den Start (gesetzt), Zensus B. Gemessen: rAF-Intervalle je Bild
// (Frame p95 erste vs letzte 5 min), VRAM-Abgriff (vram-abgriff.cjs), Puffer-Zensus (draw-zaehler.cjs: ruhend/verwaist),
// JS-Heap nach GC; das Tier: Abstand je Sekunde, Aufgabe, bond.
const fs = require("fs");
const path = require("path");
const { oeffne, klick, taste, warte, WT, klangAn } = require("./spiel.cjs");
const { vramAbgriff } = require(WT + "/scripts/lib/vram-abgriff.cjs");
const DZ = require(WT + "/scripts/lib/draw-zaehler.cjs");
const S = __dirname;
const OUT = path.join(S, "roh", "m14-spielgang.json");
const MIN = (m) => m * 60000;
const GEH1 = Number(process.env.GEH1_MIN || 10), FAHRT = Number(process.env.FAHRT_MIN || 6), GEH2 = Number(process.env.GEH2_MIN || 4);

function rafSpur() {
    window.__spur = { t: [], phase: "boot", phasen: [] };
    const f = (t) => {
        const s = window.__spur;
        s.t.push([t, s.phase]);
        requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
}

(async () => {
    const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
    const o = await oeffne({ profil: path.join(S, "profil-spielgang"), vorDoc: [DZ.FALTE_INSTALL, vramAbgriff, rafSpur, fs.readFileSync(path.join(S, "klanghuelle.js"), "utf8")] });
    const { page, cdp } = o;
    await page.evaluate(DZ.ZAEHLER_INSTALL);
    const phase = (p) => page.evaluate((p) => { window.__spur.phase = p; window.__spur.phasen.push([p, performance.now()]); }, p);
    const zensus = async (name) => {
        await cdp.send("HeapProfiler.collectGarbage");
        return page.evaluate(async (name) => {
            for (let i = 0; i < 3; i++) await new Promise((res) => setTimeout(res, 30));
            await window.__drawZensus({ top: 1 });
            window.__kehrausJetzt();
            window.__texturZensus();
            const puffer = window.__pufferZensus();
            const v = window.__vram || {};
            const mb = (x) => +(x / 1048576).toFixed(2);
            const pm = window.anazhRealm.state.playerMesh.position;
            return { name, vramMB: mb((v.puffer || 0) + (v.texturen || 0)), pufferMB: mb(v.puffer || 0), texturenMB: mb(v.texturen || 0), heapMB: performance.memory ? mb(performance.memory.usedJSHeapSize) : null, halter: puffer && puffer.halter, pos: [pm.x, pm.z], t: performance.now() };
        }, name);
    };
    const erg = { bootMs: o.bootMs, phasen: [], tier: [], fahrt: [] };
    erg.klang = await klangAn(page, cdp);
    const stats = () => page.evaluate(() => { const c = window.anazhRealm.state.symphony.ctx; const p = c && c.playbackStats; return p ? { underrunEvents: p.underrunEvents, underrunDurationS: p.underrunDuration, totalDurationS: p.totalDuration, averageLatency: p.averageLatency } : { fehlt: "ctx.playbackStats fehlt", baseLatency: c && c.baseLatency, outputLatency: c && c.outputLatency }; });
    await klick(cdp);
    await warte(1000);
    // Einschwingen am Ankunfts-Ort, dann Zensus A
    await phase("ein");
    await page.evaluate(async () => { const r = window.anazhRealm; for (const dl = performance.now() + 90000; performance.now() < dl && !(r._weltSteht && r._weltSteht()); ) await new Promise((f) => setTimeout(f, 250)); });
    await warte(20000);
    const start = await page.evaluate(() => { const p = window.anazhRealm.state.playerMesh.position; return [p.x, p.y, p.z]; });
    erg.start = start;
    erg.zensusA = await zensus("A");
    erg.audioA = await stats();
    log("Zensus A", JSON.stringify(erg.zensusA).slice(0, 300));
    if (process.env.NUR_TIER) {
        const BAND = require(WT + "/scripts/lib/band-urteil.cjs"); const ort = BAND.ladeSpec("wiese").ort;
        erg.ort = await page.evaluate(async (x, z, g) => { const r = window.anazhRealm, st = r.state; st.yaw = g; st.pitch = 0; st.playerMesh.position.set(x, r._voxelSurfaceY(x, z) + 1.8, z); for (const dl = performance.now() + 90000; performance.now() < dl && !(r._weltSteht && r._weltSteht()); ) await new Promise((f) => setTimeout(f, 250)); return [x, z]; }, ort.spieler[0], ort.spieler[1], BAND.ortGier(ort));
    }
    // das Tier: 4 m vor dem Spieler gesetzt, dann „folge mir" im Chat (Enter öffnet, Text, Enter sendet)
    erg.tierSetzen = await page.evaluate(async () => {
        const r = window.anazhRealm, st = r.state, pm = st.playerMesh.position;
        const dv = st.camera.getWorldDirection(pm.clone()); const l = Math.hypot(dv.x, dv.z) || 1;
        const x = pm.x - (dv.x / l) * 4, z = pm.z - (dv.z / l) * 4; // hinter dem Spieler: er geht nicht in sein Tier
        const c = r.spawnCreatureAt(x, r._voxelSurfaceY(x, z) + 0.5, z, "happy");
        window.__bund = c;
        for (let i = 0; i < 30; i++) await new Promise((f) => requestAnimationFrame(f));
        return { name: c.userData && c.userData.name, d: +Math.hypot(c.position.x - pm.x, c.position.z - pm.z).toFixed(1), kreaturen: st.creatures.length };
    });
    await taste(cdp, "enter", "keyDown"); await taste(cdp, "enter", "keyUp");
    await warte(400);
    await cdp.send("Input.insertText", { text: "folge mir" });
    await warte(200);
    await taste(cdp, "enter", "keyDown"); await taste(cdp, "enter", "keyUp");
    await warte(1500);
    erg.bindung = await page.evaluate(() => {
        const st = window.anazhRealm.state, c = window.__bund;
        const folger = st.creatures.filter((k) => k.userData && k.userData.task && k.userData.task.name === "follow_player");
        return { task: c.userData.task && c.userData.task.name, bond: c.userData.bond, folger: folger.length, gesetztesFolgt: folger.includes(c), chat: (document.getElementById("chat-output") || {}).textContent.slice(-160) };
    });
    log("Bindung", JSON.stringify(erg.bindung));
    if (!document_ok(erg.bindung)) await klick(cdp); // Zeiger zurück, falls der Chat ihn nahm
    await klick(cdp);
    await warte(500);
    // Tier-Spur je Sekunde
    const tierTakt = setInterval(async () => {
        try {
            erg.tier.push(await page.evaluate(() => {
                const st = window.anazhRealm.state, pm = st.playerMesh.position;
                const fl = st.creatures.filter((k) => k.userData && k.userData.task && k.userData.task.name === "follow_player");
                const c = window.__bund && st.creatures.includes(window.__bund) ? window.__bund : fl[0];
                if (!c) return { t: performance.now(), fehlt: true, p: [pm.x, pm.z] };
                return { t: performance.now(), d: +Math.hypot(c.position.x - pm.x, c.position.z - pm.z).toFixed(2), dy: +(c.position.y - pm.y).toFixed(2), task: c.userData.task && c.userData.task.name, bond: +(c.userData.bond || 0).toFixed(3), p: [+pm.x.toFixed(1), +pm.z.toFixed(1)], phase: window.__spur.phase };
            }));
        } catch (_e) {}
    }, 1000);
    // GEHEN 1 (mit dem Tier): W gehalten, alle 20 s ein Schwenk der Gier (±0,5 rad)
    await phase("gehen1");
    await taste(cdp, "w", "keyDown");
    erg.hindernisse = 0;
    let vorG = await page.evaluate(() => [window.anazhRealm.state.playerMesh.position.x, window.anazhRealm.state.playerMesh.position.z]);
    for (let n = 0, ende = Date.now() + MIN(GEH1); Date.now() < ende; n++) {
        await warte(5000);
        const p = await page.evaluate(() => [window.anazhRealm.state.playerMesh.position.x, window.anazhRealm.state.playerMesh.position.z]);
        // steckt der Spieler (< 2 m in 5 s) an einem Hindernis, dreht er ab (gezählt); sonst alle 20 s ein kleiner Schwenk
        if (Math.hypot(p[0] - vorG[0], p[1] - vorG[1]) < 2) { erg.hindernisse++; await page.evaluate(() => { window.anazhRealm.state.yaw += 1.2 + Math.random(); }); }
        else if (n % 4 === 3) await page.evaluate(() => { window.anazhRealm.state.yaw += (Math.random() - 0.5); });
        vorG = p;
    }
    await taste(cdp, "w", "keyUp");
    clearInterval(tierTakt);
    if (process.env.NUR_TIER) {
        const ds = erg.tier.filter((x) => x.d != null).map((x) => x.d).sort((a, b) => a - b);
        const pfad = erg.tier.map((x) => x.p); let wegG = 0, ymin = Infinity, ymax = -Infinity; for (let i = 1; i < pfad.length; i++) wegG += Math.hypot(pfad[i][0] - pfad[i - 1][0], pfad[i][1] - pfad[i - 1][1]);
        const q = (p) => ds[Math.min(ds.length - 1, Math.ceil(p * ds.length) - 1)];
        erg.tierUrteil = { proben: ds.length, fehlt: erg.tier.filter((x) => x.fehlt).length, p50: q(0.5), p95: q(0.95), max: ds[ds.length - 1], anteilUnter10m: +(ds.filter((d) => d <= 10).length / ds.length).toFixed(3), aufgabeImmerFolgen: erg.tier.every((x) => x.task === "follow_player"), bondEnde: (erg.tier.slice(-1)[0] || {}).bond, spielerWegM: Math.round(wegG), hindernisse: erg.hindernisse, dyMax: Math.max(...erg.tier.map((x) => Math.abs(x.dy || 0))) };
        fs.writeFileSync(path.join(S, "roh", "m19-folgen.json"), JSON.stringify(erg, null, 1));
        console.log(JSON.stringify(erg.tierUrteil));
        await o.browser.close();
        return;
    }
    log("gehen1 Ende, Tier-Proben", erg.tier.length);
    // FAHRT: der GT neben dem Spieler, E sitzt auf
    await phase("fahrt-auf");
    erg.gt = await page.evaluate(async () => {
        const r = window.anazhRealm, p = r.state.playerMesh.position;
        const e = r.spawnArchitecture("fahrzeug_gt", { x: p.x + 3, y: r.getTerrainHeightAt(p.x + 3, p.z) + 0.5, z: p.z }, { silent: true, precise: true });
        window.__gt = e;
        for (let n = 0; n < 600 && e && !e.instanced && !e.mesh; n++) { if (n % 30 === 0) r._rebuildArchitectureMesh(e); await new Promise((f) => requestAnimationFrame(f)); }
        return { da: !!e, inst: !!(e && (e.instanced || e.mesh)) };
    });
    await taste(cdp, "e", "keyDown"); await warte(60); await taste(cdp, "e", "keyUp");
    await warte(1500);
    erg.gt.aufgesessen = await page.evaluate(() => { const st = window.anazhRealm.state; return !!(st.player && st.player.mountedArch); });
    if (!erg.gt.aufgesessen) {
        // die Taste nahm ihn nicht (Abstand?): der Weg des Spiels über mountArchitecture, benannt
        erg.gt.mountWeg = await page.evaluate(() => { const r = window.anazhRealm; const m = r.mountArchitecture(window.__gt); return !!(m && m.ok); });
    }
    await phase("fahrt");
    await taste(cdp, "w", "keyDown");
    let wHalt = true;
    const t0F = Date.now();
    let weg = 0, vorP = null;
    while (Date.now() - t0F < MIN(FAHRT)) {
        const z = await page.evaluate(() => { const st = window.anazhRealm.state, e = window.__gt; const v = st.playerVel ? Math.hypot(st.playerVel.x(), st.playerVel.z()) : 0; return { v, p: e ? [e.position.x, e.position.z] : null }; });
        if (z.p && vorP) weg += Math.hypot(z.p[0] - vorP[0], z.p[1] - vorP[1]);
        vorP = z.p;
        erg.fahrt.push([Date.now() - t0F, +z.v.toFixed(1)]);
        if (z.v > 16 && wHalt) { await taste(cdp, "w", "keyUp"); wHalt = false; }
        else if (z.v < 12 && !wHalt) { await taste(cdp, "w", "keyDown"); wHalt = true; }
        await taste(cdp, "a", "keyDown"); await warte(70); await taste(cdp, "a", "keyUp");
        await warte(900);
    }
    if (wHalt) await taste(cdp, "w", "keyUp");
    erg.fahrtWegM = Math.round(weg);
    await taste(cdp, "e", "keyDown"); await warte(60); await taste(cdp, "e", "keyUp");
    await warte(1500);
    log("Fahrt Weg", erg.fahrtWegM);
    // NACHT (Spieler-Wort) und BAU
    await phase("nacht-bau");
    await taste(cdp, "enter", "keyDown"); await taste(cdp, "enter", "keyUp");
    await warte(400);
    await cdp.send("Input.insertText", { text: "setze uhrzeit mitternacht" });
    await taste(cdp, "enter", "keyDown"); await taste(cdp, "enter", "keyUp");
    await warte(1500);
    erg.nacht = await page.evaluate(() => window.anazhRealm.state.timeOfDay);
    erg.bau = await page.evaluate(() => { const r = window.anazhRealm, p = r.state.playerMesh.position; const e = r.spawnArchitecture("stein_block", { x: p.x + 2, y: r.getTerrainHeightAt(p.x + 2, p.z) + 0.5, z: p.z + 2 }, { precise: true }); return !!e; });
    await klick(cdp);
    // GEHEN 2
    await phase("gehen2");
    await taste(cdp, "w", "keyDown");
    for (const ende = Date.now() + MIN(GEH2); Date.now() < ende; ) {
        await warte(20000);
        await page.evaluate(() => { window.anazhRealm.state.yaw += (Math.random() - 0.5); });
    }
    await taste(cdp, "w", "keyUp");
    // ZURÜCK AM START (gesetzt), einschwingen, Zensus B
    await phase("zurueck");
    await page.evaluate(async (s) => { const r = window.anazhRealm; r.state.playerMesh.position.set(s[0], s[1], s[2]); for (const dl = performance.now() + 90000; performance.now() < dl && !(r._weltSteht && r._weltSteht()); ) await new Promise((f) => setTimeout(f, 250)); }, start);
    await warte(20000);
    erg.zensusB = await zensus("B");
    erg.audioB = await stats();
    const kb = await page.evaluate(() => window.__klangBild);
    const qq = (a, p) => { const s = a.slice().sort((x, y) => x - y); return s.length ? +s[Math.min(s.length - 1, Math.ceil(p * s.length) - 1)].toFixed(3) : null; };
    erg.klangTakt = Object.fromEntries(["gehen1", "fahrt", "gehen2"].map((ph) => { const a = kb.filter((x) => x[1] === ph).map((x) => x[0]); return [ph, { n: a.length, p50: qq(a, 0.5), p95: qq(a, 0.95), max: qq(a, 1) }]; }));
    log("Zensus B", JSON.stringify(erg.zensusB).slice(0, 300));
    // Frame-Spur auswerten
    const spur = await page.evaluate(() => window.__spur);
    const iv = [];
    for (let i = 1; i < spur.t.length; i++) iv.push([spur.t[i][0], spur.t[i][0] - spur.t[i - 1][0], spur.t[i][1]]);
    const spielStart = (spur.phasen.find((p) => p[0] === "gehen1") || [0, 0])[1];
    const spielEnde = (spur.phasen.find((p) => p[0] === "zurueck") || [0, Infinity])[1];
    const q = (a, p) => { const s = a.slice().sort((x, y) => x - y); return s.length ? +s[Math.min(s.length - 1, Math.ceil(p * s.length) - 1)].toFixed(2) : null; };
    const fenster = (a, b) => iv.filter((x) => x[0] >= a && x[0] < b).map((x) => x[1]);
    const erste = fenster(spielStart, spielStart + MIN(5)), letzte = fenster(spielEnde - MIN(5), spielEnde);
    erg.frame = {
        erste5: { n: erste.length, p50: q(erste, 0.5), p95: q(erste, 0.95), p99: q(erste, 0.99) },
        letzte5: { n: letzte.length, p50: q(letzte, 0.5), p95: q(letzte, 0.95), p99: q(letzte, 0.99) },
        jePhase: Object.fromEntries([...new Set(iv.map((x) => x[2]))].map((p) => { const a = iv.filter((x) => x[2] === p).map((x) => x[1]); return [p, { n: a.length, p50: q(a, 0.5), p95: q(a, 0.95), ueber100: a.filter((v) => v > 100).length }]; })),
        jeMinute: (() => { const out = []; for (let t = spielStart; t < spielEnde; t += 60000) { const a = fenster(t, t + 60000); out.push([out.length, q(a, 0.5), q(a, 0.95)]); } return out; })(),
    };
    erg.drift = { p95Faktor: erg.frame.erste5.p95 ? +(erg.frame.letzte5.p95 / erg.frame.erste5.p95).toFixed(3) : null, vramMB: +(erg.zensusB.vramMB - erg.zensusA.vramMB).toFixed(2), heapMB: erg.zensusB.heapMB != null ? +(erg.zensusB.heapMB - erg.zensusA.heapMB).toFixed(2) : null };
    // Tier über die Gehzeit
    const ds = erg.tier.filter((x) => x.phase === "gehen1" && x.d != null).map((x) => x.d);
    const pfad = erg.tier.filter((x) => x.phase === "gehen1").map((x) => x.p);
    let wegG = 0; for (let i = 1; i < pfad.length; i++) wegG += Math.hypot(pfad[i][0] - pfad[i - 1][0], pfad[i][1] - pfad[i - 1][1]);
    erg.tierUrteil = { proben: ds.length, fehlt: erg.tier.filter((x) => x.phase === "gehen1" && x.fehlt).length, p50: q(ds, 0.5), p95: q(ds, 0.95), max: ds.length ? Math.max(...ds) : null, anteilUnter10m: ds.length ? +(ds.filter((d) => d <= 10).length / ds.length).toFixed(3) : null, aufgabeImmerFolgen: erg.tier.filter((x) => x.phase === "gehen1").every((x) => x.task === "follow_player"), bondEnde: (erg.tier.filter((x) => x.phase === "gehen1").slice(-1)[0] || {}).bond, spielerWegM: Math.round(wegG) };
    erg.fehler = o.fehler.slice(0, 8);
    fs.writeFileSync(OUT, JSON.stringify(erg, null, 1));
    console.log(JSON.stringify({ frame: { erste5: erg.frame.erste5, letzte5: erg.frame.letzte5 }, drift: erg.drift, A: { vram: erg.zensusA.vramMB, heap: erg.zensusA.heapMB, halter: erg.zensusA.halter }, B: { vram: erg.zensusB.vramMB, heap: erg.zensusB.heapMB, halter: erg.zensusB.halter }, klangTakt: erg.klangTakt, audioA: erg.audioA, audioB: erg.audioB, tier: erg.tierUrteil, fahrtWegM: erg.fahrtWegM, gt: erg.gt, nacht: erg.nacht, bau: erg.bau }));
    await o.browser.close();
})().catch((e) => {
    console.error("FEHLER", e && e.stack);
    process.exit(1);
});
function document_ok() { return true; }
