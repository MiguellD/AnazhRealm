// bild.cjs <etikett> <baum> <port> <ausdir> — EIN frischer Boot, je Ort (dorf · genesis, third) das Bild am Schirm, dc/tris und
// p95 eines kurzen Laufs, dann der Heap nach /puffer. Dieselbe Kamera je Seite: der Ort setzt Spieler und Blick.
const { spawn } = require("child_process");
const http = require("http");
const fs = require("fs");
const path = require("path");
const [etikett, baum, portS, aus] = process.argv.slice(2);
const P = Number(portS);
fs.mkdirSync(aus, { recursive: true });
const ruf = (weg, b, ms = 600000) =>
    new Promise((ok, nein) => {
        const q = http.request({ host: "127.0.0.1", port: P, path: weg, method: "POST", agent: false, headers: { "Content-Type": "application/json" } }, (a) => {
            let d = "";
            a.on("data", (c) => (d += c));
            a.on("end", () => {
                try {
                    ok(JSON.parse(d));
                } catch (e) {
                    nein(new Error(weg + ": " + d.slice(0, 200)));
                }
            });
        });
        q.setTimeout(ms, () => q.destroy(new Error(weg + " Frist")));
        q.on("error", nein);
        q.end(JSON.stringify(b || {}));
    });
const t0 = Date.now();
const log = (...a) => console.log("[" + ((Date.now() - t0) / 1000).toFixed(0) + " s] " + etikett, ...a);
(async () => {
    const S = P - 20000;
    const sv = spawn("node", ["save-server.js"], { cwd: baum, windowsHide: true, env: { ...process.env, PORT: String(S) } });
    process.on("exit", () => { try { sv.kill(); } catch {} });
    await new Promise((r) => setTimeout(r, 2500));
    const wb = spawn("node", ["scripts/werkbank.cjs", "start", "--echt", "--port", String(P), "--seite", "http://localhost:" + S, "--ort", "wiese"], { cwd: baum, windowsHide: true });
    let wout = "";
    wb.stdout.on("data", (c) => (wout += c));
    wb.stderr.on("data", (c) => (wout += c));
    process.on("exit", () => { try { wb.kill(); } catch {} });
    while (!/WERKBANK bereit/.test(wout)) {
        if (wb.exitCode != null) throw new Error("werkbank starb: " + wout.slice(-800));
        await new Promise((r) => setTimeout(r, 1000));
    }
    log("bereit");
    const o = { etikett, orte: {} };
    for (const ort of ["dorf", "genesis"]) {
        await ruf("/umstellen", { ort, sicht: "third" });
        const l = await ruf("/lauf", { sek: 8, ein: 20, ruhe: 30 });
        const st = await ruf("/eval", { code: "const ri=r.state.renderer.info; return { dc: ri.render.drawCalls, tris: ri.render.triangles, pos: r.state.playerMesh.position.toArray().map(x=>+x.toFixed(1)) };" });
        const s = await ruf("/schirm", { datei: path.join(aus, etikett + "-" + ort + ".png") });
        const p = await ruf("/puffer", { top: 1 });
        o.orte[ort] = { p95: l.frameMs && l.frameMs.p95, p50: l.frameMs && l.frameMs.p50, ...(st.ergebnis || {}), heap: p.heapMB, bild: s.datei };
        log(ort, JSON.stringify(o.orte[ort]));
    }
    fs.writeFileSync(path.join(aus, etikett + ".bild.json"), JSON.stringify(o, null, 1));
    await ruf("/stop", {}).catch(() => {});
    process.exit(0);
})().catch((e) => {
    console.log("FEHLER " + etikett + " " + (e.stack || e));
    process.exit(1);
});
