// Sonde FAHREN-2 (Auftrag 0710-2): dieselbe headless Welt wie gate:fahr-leben (Null-Renderer, Foundry), ein Fall je Aufruf.
//   node sonde-fahren.cjs <fall> [port]     fall: hangfuss | spalt | orte
// Je Sim-Schritt: Lage, Tempo, Höhe des Wagens gegen die Ebene des Gesetzes (vc.fahrEbene über _fahrBoden), Schub des
// Kontakt-Lösers (Lage − (Lage0 + v·dt)), Luft/Wand des Kerns.
"use strict";
const WT = "C:/Users/micha/Desktop/AnazhRealm-OMEN/" + (process.env.SONDE_WT || "welle-m-fahren");
const puppeteer = require(WT + "/node_modules/puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { softwareWebGpuArgs } = require(WT + "/scripts/lib/software-gpu.cjs");
const [fall = "hangfuss", portArg] = process.argv.slice(2);
const PORT = Number(portArg || 7906);
const root = path.resolve(WT);
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".woff2": "font/woff2" };
const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

async function sonde(arg) {
    const { fall, F } = arg;
    const dl0 = performance.now() + 60000;
    while ((!window.anazhRealm || typeof window.anazhRealm._ensureAssetFoundry !== "function") && performance.now() < dl0)
        await new Promise((r) => setTimeout(r, 100));
    const r = window.anazhRealm;
    const st = r.state;
    const f = r._ensureAssetFoundry();
    const dl = performance.now() + 50000;
    while (performance.now() < dl) {
        if (f && f.ready && f.recipes && f.recipes.gt && st.blueprints && st.blueprints.fahrzeug_gt) break;
        await new Promise((r2) => setTimeout(r2, 80));
    }
    const P = Object.getPrototypeOf(r);
    let tMs = performance.now();
    const frame = () => {
        tMs += 1000 / 60;
        r._gameLoopTick(tMs);
    };
    const hh = (a, b) => r.getTerrainHeightAt(a, b);
    const aus = { fall, log: [], orte: [] };
    // die Welt um den Ort streamen: der Spieler steht dort, bis die Chunks stehen
    st.playerMesh.position.set(F.ort[0], hh(F.ort[0], F.ort[1]) + 2, F.ort[1]);
    for (let i = 0; i < 400; i++) {
        frame();
        if (i % 40 === 39) await new Promise((r3) => setTimeout(r3, 30));
    }
    for (const e of st.architectures || []) {
        if (!e || !e.position) continue;
        const d = Math.hypot(e.position.x - F.ort[0], e.position.z - F.ort[1]);
        if (d > 25) continue;
        aus.orte.push({ name: e.blueprintName || e.name || e.type, x: +e.position.x.toFixed(2), z: +e.position.z.toFixed(2), d: +d.toFixed(1), boxen: (e.blockerAABBs || []).length });
    }
    if (fall === "orte") return aus;
    if (fall === "karte") {
        aus.karte = [];
        for (let dz = -20; dz <= 20; dz += 2) {
            const zeile = [];
            for (let dx = -20; dx <= 20; dx += 2) zeile.push(Math.round(hh(F.ort[0] + dx, F.ort[1] + dz)));
            aus.karte.push(dz + ": " + zeile.join(" "));
        }
        return aus;
    }
    const tasten = (w) => {
        for (const k of ["w", "a", "s", "d", "shift", " "]) st.keys[k] = false;
        st.keys.w = !!w;
    };
    const [sx, sz] = F.start;
    const fahrt = F.gier; // Fahrt-Richtung (sin, cos)
    st.playerMesh.position.set(sx, hh(sx, sz) + 1.2, sz);
    if (st.playerVel) st.playerVel.setValue(0, 0, 0);
    st._fieldVy = 0;
    const e = r.spawnArchitecture("fahrzeug_gt", { x: sx, y: hh(sx, sz) + 0.5, z: sz }, { silent: true, precise: true, rotationY: fahrt - Math.PI / 2 });
    const dlB = performance.now() + 45000;
    while (!e.instanced && !e.mesh && performance.now() < dlB) {
        r._rebuildArchitectureMesh(e);
        if (e.instanced || e.mesh) break;
        await new Promise((r3) => setTimeout(r3, 200));
    }
    const mr = r.mountArchitecture(e);
    if (!mr || !mr.ok) return Object.assign(aus, { fehler: "aufsitzen" });
    tasten(false);
    for (let i = 0; i < 12; i++) frame();
    const VC = window.__vehicleCore;
    let schritt = 0;
    const zug = { x0: 0, z0: 0, vx: 0, vz: 0 };
    r._stepCharacter = function (delta, ct) {
        const m = st.playerMesh.position;
        zug.x0 = m.x;
        zug.z0 = m.z;
        zug.vx = st.playerVel.x();
        zug.vz = st.playerVel.z();
        zug.dt = Math.min(0.1, Math.max(0.0001, delta));
        P._stepCharacter.call(this, delta, ct);
        zug.schub = Math.hypot(m.x - (zug.x0 + zug.vx * zug.dt), m.z - (zug.z0 + zug.vz * zug.dt));
    };
    aus.wand = [];
    r._wandGleiten = function (x0, z0, vx, vz, dt, wand, out) {
        const w0 = vx !== 0 || vz !== 0 ? wand(x0 + vx * dt, z0 + vz * dt, vx, vz) : null;
        const res = P._wandGleiten.call(this, x0, z0, vx, vz, dt, wand, out);
        if (w0 && aus.wand.length < 12) {
            const n = {};
            this._fieldGradient(w0.x, w0.y, w0.z, n);
            const sp = Math.hypot(vx, vz) || 1;
            const nh = Math.hypot(n.x, n.z) || 1;
            aus.wand.push({ schritt: schritt, punkt: [+w0.x.toFixed(2), +w0.y.toFixed(2), +w0.z.toFixed(2)], boden: +hh(w0.x, w0.z).toFixed(2), n: [+n.x.toFixed(3), +n.y.toFixed(3), +n.z.toFixed(3)], nDotFahrt: +((n.x * vx + n.z * vz) / (nh * sp)).toFixed(3), stopp: res.vx === 0 && res.vz === 0 });
        }
        return res;
    };
    r._stepFixedSim = function (simTime, dt) {
        const yaw0 = e._fahr ? e._fahr.yaw : 0; // die Gier, an der der Stand dieses Schritts die Ebene stellt
        P._stepFixedSim.call(this, simTime, dt);
        const fz = e._fahr;
        if (!fz) return;
        const G = e._fahrSatz;
        const eb = G ? VC.fahrEbene(G, r._fahrBoden(e), fz.x, fz.z, yaw0) : null;
        const m = st.playerMesh.position;
        aus.log.push({
            i: schritt++,
            x: +m.x.toFixed(3),
            z: +m.z.toFixed(3),
            v: +Math.hypot(st.playerVel.x(), st.playerVel.z()).toFixed(2),
            y: +fz.y.toFixed(3),
            eb: eb ? +eb.y.toFixed(3) : null,
            unter: eb ? +(eb.y - fz.y).toFixed(3) : null,
            mitte: +(hh(m.x, m.z)).toFixed(3),
            luft: fz.luft,
            vy: +fz.vy.toFixed(3),
            schub: zug.schub !== undefined ? +zug.schub.toFixed(3) : null,
        });
    };
    if (F.v0) {
        st.playerVel.setValue(Math.sin(fahrt) * F.v0, st.playerVel.y(), Math.cos(fahrt) * F.v0);
        if (e._fahr) e._fahr.vlong = F.v0;
    }
    tasten(true);
    for (let i = 0; i < F.frames; i++) {
        if (F.lossNach && i === F.lossNach) tasten(false);
        frame();
    }
    tasten(false);
    delete r._stepCharacter;
    delete r._stepFixedSim;
    delete r._wandGleiten;
    aus.ende = { x: e.position.x, z: e.position.z, y: e._fahr && e._fahr.y };
    return aus;
}

const FAELLE = {
    // Leben-Schau 07.10.: an (−852/−861,2), Gier 92,3, 9,3 m/s, Glutbrunnen (−848,9/−861,8) — Anlauf 16 m davor
    hangfuss: { ort: [-852, -861.2], start: [-854.5, -861.1], gier: (92.3 * Math.PI) / 180, frames: 240, v0: 9.3 },
    // Spaltkante (−904/−975): Anlauf, Fahrt in die Kante
    spalt: { ort: [-904, -975], start: [-912, -975], gier: Math.PI / 2, frames: 200, v0: 11.4 },
    orte: { ort: [-852, -861.2] },
    karte: { ort: [-904, -975] },
};

(async () => {
    const F = FAELLE[fall];
    if (process.env.SONDE_START) F.start = process.env.SONDE_START.split(",").map(Number);
    if (process.env.SONDE_GIER) F.gier = (Number(process.env.SONDE_GIER) * Math.PI) / 180;
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 300000, args: softwareWebGpuArgs() });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhForceFoundry = true;
        window.__anazhHeadlessNullRenderer = true;
    });
    const fehler = [];
    page.on("pageerror", (e) => fehler.push((e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    let out;
    try {
        out = await page.evaluate(sonde, { fall, F });
    } catch (e) {
        out = { err: String(e && e.message) };
    }
    await browser.close();
    server.close();
    out.seitenFehler = fehler.slice(0, 5);
    const datei = path.join(__dirname, `sonde-${fall}.json`);
    fs.writeFileSync(datei, JSON.stringify(out, null, 1));
    if (out.karte) console.log(["x von -20 bis +20 in 2-m-Schritten"].concat(out.karte).join("\n"));
    if (out.wand) console.log("wand:", JSON.stringify(out.wand));
    console.log(JSON.stringify({ orte: out.orte, ende: out.ende, n: out.log && out.log.length, err: out.err, fehler: out.fehler, seitenFehler: out.seitenFehler }));
    if (out.log) {
        const rot = out.log.filter((s) => s.unter > 0.05 || s.schub > 0.3);
        console.log("auffaellig:", rot.length, JSON.stringify(rot.slice(0, 12)));
        console.log("max unter Gesetz:", Math.max(...out.log.map((s) => s.unter || 0)).toFixed(3), " max schub:", Math.max(...out.log.map((s) => s.schub || 0)).toFixed(3));
    }
})();
