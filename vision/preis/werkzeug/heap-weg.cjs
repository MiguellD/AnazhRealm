// heap-weg.cjs — Befund Heap (14.11.): EINE Sitzung faehrt vier Posen und kehrt zur ersten zurueck; je Pose nach zwei GC:
// Heap (usedSize + backingStorage, wie /puffer), VRAM je Erzeuger, Typed-Array-Halter (__heapHalter), Behaelter-Zensus
// (Map/Set/Array-Groessen unter r, r.state, r._foundry) und ein Heap-Schnappschuss ueber CDP (Datei, ausgewertet von heap-snap.cjs).
// Kein Dauer-Werkzeug. Aufruf (im Spiel-Baum, unter gpu-lauf.sh): node heap-weg.cjs <baum> <ausgabe-ordner>
"use strict";
const fs = require("fs"), path = require("path"), http = require("http"), { spawn, spawnSync } = require("child_process");
const [baum, aus] = process.argv.slice(2).map((p) => path.resolve(p));
const S = 7861, W = 27861;
const POSEN = [["wiese", -280.4, -1045.6], ["wiese-ost", -101, -1070.5], ["dorf", 446.8, 457.4], ["west", -713, 617.5], ["wiese-zurueck", -280.4, -1045.6]];
fs.mkdirSync(aus, { recursive: true });
const log = (...a) => { const z = new Date().toISOString().slice(11, 19) + " " + a.join(" "); console.log(z); fs.appendFileSync(path.join(aus, "lauf.log"), z + "\n"); };
const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const ruf = (weg, last, ms = 600000) => new Promise((ja, nein) => {
    const q = http.request({ host: "127.0.0.1", port: W, path: weg, method: "POST", agent: false, headers: { "Content-Type": "application/json" } }, (r) => {
        let d = ""; r.on("data", (c) => (d += c)); r.on("end", () => { try { ja(JSON.parse(d)); } catch (_e) { ja({ roh: d }); } });
    });
    q.setTimeout(ms, () => q.destroy(new Error(weg + " Frist"))); q.on("error", nein); q.end(JSON.stringify(last || {}));
});
const da = (port) => new Promise((r) => http.get("http://127.0.0.1:" + port + "/", (x) => (x.resume(), r(true))).on("error", () => r(false)));
const baumTot = (pid) => spawnSync("taskkill", ["/F", "/T", "/PID", String(pid)], { windowsHide: true });

const ZENSUS = `
const aus = {}, gros = (v) => v instanceof Map || v instanceof Set ? v.size : Array.isArray(v) ? v.length : ArrayBuffer.isView(v) ? -v.byteLength : (v && typeof v === "object" && Object.getPrototypeOf(v) === Object.prototype) ? Object.keys(v).length : null;
for (const [n, o] of [["r", r], ["r.state", r.state], ["r._foundry", r._foundry]]) if (o) for (const k of Object.keys(o)) { let v; try { v = o[k]; } catch { continue; } const g = gros(v); if (g != null && Math.abs(g) >= 16) aus[n + "." + k] = g; }
const st = r.state; let obj = 0, mesh = 0; st.scene.traverse((o) => { obj++; if (o.isMesh || o.isInstancedMesh) mesh++; });
const ri = st.renderer && st.renderer.info ? st.renderer.info.memory : null;
return { zensus: aus, szene: { obj, mesh }, info: ri ? { geometries: ri.geometries, textures: ri.textures } : null, ort: [st.playerMesh.position.x, st.playerMesh.position.z].map((x) => +x.toFixed(1)), chunks: st.voxelChunks ? st.voxelChunks.size : null };`;

let sv = null, wb = null;
async function ab(code) {
    try { if (wb && wb.exitCode == null) { await ruf("/stop", {}, 30000).catch(() => null); for (let i = 0; i < 20 && wb.exitCode == null; i++) await warte(500); } } catch (_e) {}
    if (wb && wb.exitCode == null) baumTot(wb.pid);
    if (sv && sv.exitCode == null) baumTot(sv.pid);
    log("ENDE", code); process.exit(code);
}
process.on("SIGINT", () => ab(130)); process.on("SIGTERM", () => ab(143));

async function schnappschuss(profil, datei) {
    const puppeteer = require(path.join(baum, "node_modules", "puppeteer"));
    const [port, weg] = fs.readFileSync(path.join(profil, "DevToolsActivePort"), "utf8").trim().split(/\r?\n/);
    const b = await puppeteer.connect({ browserWSEndpoint: "ws://127.0.0.1:" + port + weg, defaultViewport: null, protocolTimeout: 1800000 });
    try {
        const seiten = await b.pages();
        const p = seiten.find((x) => x.url().includes("localhost:" + S));
        if (!p) throw new Error("keine Seite an :" + S);
        const c = await p.target().createCDPSession();
        const f = fs.openSync(datei, "w");
        c.on("HeapProfiler.addHeapSnapshotChunk", (e) => fs.writeSync(f, e.chunk));
        await c.send("HeapProfiler.enable");
        await c.send("HeapProfiler.takeHeapSnapshot", { reportProgress: false, captureNumericValue: false });
        fs.closeSync(f);
        await c.send("HeapProfiler.disable").catch(() => null);
        await c.detach();
    } finally { b.disconnect(); }
}

(async () => {
    const t0 = Date.now();
    sv = spawn(process.execPath, ["save-server.js"], { cwd: baum, env: { ...process.env, PORT: String(S) }, stdio: ["ignore", fs.openSync(path.join(aus, "save.log"), "w"), "ignore"], windowsHide: true });
    for (let i = 0; !(await da(S)); i++) { if (i > 60) return log("save-server steht nicht"), ab(1); await warte(1000); }
    const wl = path.join(aus, "werkbank.log");
    const env = { ...process.env, WERKBANK_PORT: String(W) }; delete env.NODE_OPTIONS;
    wb = spawn(process.execPath, ["scripts/werkbank.cjs", "start", "--echt", "--port", String(W), "--seite", "http://localhost:" + S, "--ort", "wiese"], { cwd: baum, env, stdio: ["ignore", fs.openSync(wl, "w"), fs.openSync(wl + ".err", "w")], windowsHide: true });
    for (let i = 0; !/WERKBANK bereit/.test(fs.readFileSync(wl, "utf8")); i++) { if (wb.exitCode != null || i > 1200) return log("Werkbank startet nicht", wb.exitCode), ab(1); await warte(500); }
    log("Welt bereit nach", ((Date.now() - t0) / 1000).toFixed(0), "s");
    const status = await ruf("/status");
    const profil = status.boot && status.boot.profil;
    log("Profil", profil, "Fehler", JSON.stringify(status.fehler || []).slice(0, 200));
    const ergebnis = [];
    for (const [name, x, z] of POSEN) {
        const tp = Date.now();
        const u = await ruf("/umstellen", { x, z }).catch((e) => ({ fehler: String(e.message) }));
        if (u.fehler) log(name, "umstellen Fehler", String(u.fehler).slice(0, 200));
        let offen = null;
        for (let i = 0; i < 90; i++) {
            const e = await ruf("/eval", { code: "return typeof __einschwingOffen === 'function' ? __einschwingOffen(r) : null;" }).catch(() => null);
            offen = e && e.ergebnis;
            if (!offen || !Object.keys(offen).length) break;
            await warte(2000);
        }
        const lauf = await ruf("/lauf", { sek: 30, ein: 30 }).catch((e) => ({ fehler: String(e.message) }));
        const p95 = lauf && lauf.frame ? lauf.frame.p95 : lauf && lauf.p95;
        const puf = await ruf("/puffer", { top: 60 });
        const halter = (await ruf("/eval", { code: "return __heapHalter(r, 3).filter(([, b]) => b >= 131072).map(([k, b]) => [k, +(b / 1048576).toFixed(2)]);" })).ergebnis;
        const zen = (await ruf("/eval", { code: ZENSUS })).ergebnis;
        const e = { pose: name, x, z, sek: +((Date.now() - tp) / 1000).toFixed(0), offen, heap_mb: puf.heapMB, vram_mb: puf.vram && puf.vram.mb, vram: puf.vram && puf.vram.liste, halter, zen, lauf_kurz: lauf && { fehler: lauf.fehler, schluessel: Object.keys(lauf || {}).slice(0, 30) }, puffer_zensus: puf.puffer };
        fs.writeFileSync(path.join(aus, "pose-" + ergebnis.length + "-" + name + ".json"), JSON.stringify(e, null, 1));
        log(name, "nach GC Heap", puf.heapMB, "MB · VRAM", e.vram_mb, "MB · Typed", halter ? halter.reduce((a, [, b]) => a + b, 0).toFixed(1) : "?", "MB · chunks", zen && zen.chunks, "· obj", zen && zen.szene.obj, "· offen", JSON.stringify(offen));
        if (profil) {
            const ts = Date.now();
            try { await schnappschuss(profil, path.join(aus, "snap-" + ergebnis.length + "-" + name + ".heapsnapshot")); log(name, "Schnappschuss", ((Date.now() - ts) / 1000).toFixed(0), "s"); }
            catch (err) { log(name, "Schnappschuss Fehler", String(err.message).slice(0, 200)); }
        }
        ergebnis.push(e);
    }
    fs.writeFileSync(path.join(aus, "weg.json"), JSON.stringify(ergebnis, null, 1));
    await ab(0);
})().catch((e) => (log("FEHLER", e.stack), ab(1)));
