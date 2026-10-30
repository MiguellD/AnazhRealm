// w4-stadt-orte — der Null-Renderer-Harness der Welt-Proben (nach bericht/3010-heil-fahrzeug/null-harness.cjs): die Welt headless
// am Null-Renderer (setAnimationLoop an requestAnimationFrame gehängt), der Dorf-Zug ruht; der Spieler steht am Anlauf des
// Messorts `stadt` (400/400) mit dessen Gier und sagt „dorf 7 120" (wie `werkbank umstellen --ort stadt`), wartet, bis die Stadt
// am Anker 663/423 steht, ihr Erlebnis die Orte gelegt hat und das Gehege gemeldet ist, geht an den Ort (609,1/419) — dann je
// Probe-Datei (Argumente ab 4) ihr Rumpf wie `werkbank eval` (r = Welt, T = THREE), die Antwort als Zeile `PROBE <datei> {…}`.
// node orte-null.cjs <repo> <port> <probe.js> [<probe.js> …]
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = process.argv[2];
const PORT = Number(process.argv[3] || 7881);
const PROBEN = process.argv.slice(4);
const { statikServer, nullSeite } = require(path.join(ROOT, "scripts/lib/welt-boot.cjs"));
const server = statikServer();

(async () => {
    await server.lausche(PORT);
    const { browser, page } = await nullSeite({ frist: 3600000 });
    page.on("console", (m) => {
        const t = m.text();
        if (/SIEDLUNG|Gehege|FEHLER|ERROR|Bruch|orte/i.test(t)) console.log("[seite] " + t.slice(0, 300));
    });
    await page.evaluateOnNewDocument(() => (window.__anazhAutoSettlement = false));
    await server.zeige(page);
    await page.evaluate(() => window.__weltDa((x) => x._foundry && x._foundry.ready && x._foundry.recipes && x._foundry.recipes.gt));
    const t0 = Date.now();
    const stand = await page.evaluate(async () => {
        const r = anazhRealm;
        const R = r.state.renderer;
        let id = null;
        R.setAnimationLoop = (cb) => {
            if (id !== null) cancelAnimationFrame(id);
            id = null;
            if (!cb) return;
            const f = (t) => {
                id = requestAnimationFrame(f);
                cb(t);
            };
            id = requestAnimationFrame(f);
        };
        const warte = (ms) => new Promise((res) => setTimeout(res, ms));
        const loop = () => R.setAnimationLoop((t) => r._gameLoopTick(t));
        loop();
        // der Messort stadt (spec/profiband/haushalt.json): Gier aus Spieler → Blick, der Anlauf, das Wort
        r.state.yaw = Math.atan2(662.9 - 609.1, 421.8 - 419);
        r.state.pitch = 0;
        r.state.playerMesh.position.set(400, r._voxelSurfaceY(400, 400) + 1.8, 400);
        await warte(3000);
        r._chatDispatchLegacyCommand("dorf 7 120", [], () => {});
        const zellen = () => Object.values(r.state.worldMeta.settlementCells || {});
        // die Stadt des Worts (Same 7) — wo sie steht (der Anker der Spec gilt unter den Bedingungen der Werkbank, mit Dorf-Zug)
        const steht = () => zellen().find((c) => String(c.seed) === "7" && Math.hypot(c.x - 663, c.z - 423) <= 60);
        const plan = () => [...((r._ortPlaene && r._ortPlaene.values()) || [])].find((p) => p && p.version === 2 && p.ort && Math.hypot(p.ort.x - 663, p.ort.z - 423) <= 60);
        const orteGelegt = () => {
            const wk = r.state.wegeKarte;
            return !!(wk && wk.siedlungen.some((b) => b.formen.some((f) => f.rolle && Math.hypot(f.ax - 663, f.az - 423) < 700)));
        };
        const tw = performance.now();
        let letzt = 0;
        while (performance.now() - tw < 1200000 && !(steht() && orteGelegt() && plan())) {
            await warte(500);
            if (performance.now() - letzt > 20000) {
                letzt = performance.now();
                const p = plan();
                console.log("orte-null warte: steht " + !!steht() + " · orte " + orteGelegt() + " · plan " + (p ? p.slots.length + " " + (p.orte || []).map((o) => o.rolle).join("+") + " nass " + JSON.stringify(p.orteImWasser || null) + " fehlen " + JSON.stringify(p.orteFehlen || null) : "keiner") + " · zellen " + JSON.stringify(zellen().map((c) => [c.seed, Math.round(c.x), Math.round(c.z)])) + " · plaene " + JSON.stringify([...((r._ortPlaene && r._ortPlaene.values()) || [])].map((q) => q.ort && [Math.round(q.ort.x), Math.round(q.ort.z), q.slots.length])));
            }
        }
        const p = plan();
        const aus = {
            steht: !!steht(),
            orteGelegt: orteGelegt(),
            zellen: zellen().map((c) => [c.seed, Math.round(c.x), Math.round(c.z)]),
            plan: p ? { ort: [Math.round(p.ort.x), Math.round(p.ort.z)], slots: p.slots.length, orte: (p.orte || []).map((o) => o.rolle), fehlen: p.orteFehlen || null, imWasser: p.orteImWasser || null } : null,
            gehege: r._gehegeOrte ? r._gehegeOrte.size : 0,
            haeuser: (r.state.architectures || []).filter((e) => /^haus_/.test(e.type)).length,
            sek: Math.round((performance.now() - tw) / 1000),
        };
        // an den Ort (609,1/419): die Welt um die Stadt
        r.state.playerMesh.position.set(609.1, r._voxelSurfaceY(609.1, 419) + 1.8, 419);
        await warte(8000);
        R.setAnimationLoop(null);
        return aus;
    });
    console.log("STAND " + JSON.stringify(Object.assign(stand, { bootSek: Math.round((Date.now() - t0) / 1000) })));
    for (const datei of PROBEN) {
        const code = fs.readFileSync(datei, "utf8");
        const t1 = Date.now();
        let o;
        try {
            o = await page.evaluate((c) => new Function("r", "T", `return (async () => { ${c} })();`)(anazhRealm, THREE), code);
        } catch (e) {
            o = { fehler: String((e && e.message) || e).slice(0, 400) };
        }
        if (o && Array.isArray(o.bilder)) for (const b of o.bilder) delete b.jpg;
        if (o) {
            delete o.spurAuszug;
            delete o.spurDrift;
        }
        console.log("PROBE " + path.basename(datei) + " " + Math.round((Date.now() - t1) / 1000) + "s " + JSON.stringify(o));
    }
    await browser.close();
    server.close();
    process.exit(0);
})().catch((e) => {
    console.error("FEHLER", e && e.stack);
    process.exit(1);
});
