// Diag — DAS SAUBERE STANDALONE-PERF-PANEL (V18.389, DAS NEUE KLEID P5; Vorlage phytogenesis.js
// Z.2407-2415 — das kleine, IMMER sichtbare top-right Panel mit der EINEN klaren Zeile
// `{fps} fps · {rScale}% · Laub {folRes}% · {dc}dc · {tri}k▲`, statt der HUD-Zeile am Debug-Dump).
//
// HARDWARE-UNABHÄNGIG (Null-Renderer, GPU-frei — reines DOM + State + perfSense-Lesart). Prüft:
//   (a) ein STANDALONE-Panel-Element (#perf-panel) existiert + ist per DEFAULT sichtbar
//       (nicht der PERF-SENSE-Debug-Overlay #perf-overlay, der hinter `perfOverlay` versteckt bleibt);
//   (b) die EINE Zeile trägt fps + rScale% + Laub% + dc + k-tris;
//   (c) SYNERGIE (statisch): `_perfPanelRender` liest `perfSense` + hat KEINEN Parallel-Zähler
//       (kein eigener `renderer.info`-Tap) + wird unbedingt (nicht `perfOverlay`-gegated) gerufen;
//   (d) PERSISTENZ: buildStateSnapshot trägt `perfPanel` + loadState stellt es her (default an).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4421;
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".wasm": "application/wasm",
    ".woff2": "font/woff2",
    ".png": "image/png",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(fp, (err, data) => {
        if (err) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

// ===== (c) SYNERGIE statisch: die EINE Quelle, kein Parallel-Zähler =====
function staticSynergyCheck() {
    const src = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    // die Methoden-Spanne von `_perfPanelRender()` grob extrahieren (bis zur nächsten Methoden-Def).
    const m = src.match(/_perfPanelRender\(\)\s*\{[\s\S]*?\n {4}\}/);
    const body = m ? m[0] : "";
    const readsPerfSense = /this\.state\.perfSense/.test(body);
    // KEIN eigener renderer.info-Tap (der lebt in _loopRender, EINE Quelle) → kein Parallel-Zähler.
    const noParallelCounter = !/renderer\.info/.test(body) && !/\.info\.render/.test(body);
    // wird UNBEDINGT gerufen (nicht hinter `perfOverlay`), im perfSense-Fold.
    const fold = src.match(/_nexusPerfRegulate\(dtSec\);[\s\S]{0,240}?_perfPanelRender\(\);/);
    const calledUnconditionally = !!fold && !/if\s*\(\s*st\.perfPanel[\s\S]*?_perfPanelRender/.test(src);
    return {
        readsPerfSense,
        noParallelCounter,
        calledUnconditionally,
        ok: readsPerfSense && noParallelCounter && calledUnconditionally,
        bodyLen: body.length,
    };
}

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 120000,
        args: ["--disable-gpu", "--disable-software-rasterizer", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    let pageErr = null;
    page.on("pageerror", (e) => {
        pageErr = (e.stack || e.message).split("\n")[0];
    });
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const start = performance.now();
        while (performance.now() - start < 40000) {
            const r = window.anazhRealm;
            if (r && typeof r._perfPanelRender === "function" && r.state && typeof r.buildStateSnapshot === "function")
                break;
            await new Promise((res) => setTimeout(res, 6));
        }
    });

    const report = await page.evaluate(() => {
        const r = window.anazhRealm;
        const st = r.state;
        const out = {};

        // ===== (a) das STANDALONE-Panel existiert + ist per DEFAULT sichtbar =====
        out.defaultPerfPanel = st.perfPanel; // erw true (init default)
        out.defaultPerfOverlay = !!st.perfOverlay; // erw false (Debug-Dump bleibt aus)
        // perfSense mit klaren Werten füllen, dann das Panel EINMAL rendern.
        if (!st.perfSense) st.perfSense = r._perfSenseInit();
        st.perfSense.frameMs = 16.7; // ~60 fps
        st.perfSense.renderCalls = 512; // → 512 dc
        st.perfSense.renderTris = 1234000; // → 1234 k▲
        st._renderScale = 0.8; // → 80%
        st._foliageResScale = 0.75; // → Laub 75%
        if (!st.playerMesh) st.playerMesh = { position: {} };
        st.playerMesh.position.x = 123;
        st.playerMesh.position.y = 45;
        st.playerMesh.position.z = -67;
        r._perfPanelLast = 0; // die 200-ms-Drossel umgehen
        r._perfPanelRender();
        const panel = document.getElementById("perf-panel");
        const overlay = document.getElementById("perf-overlay");
        out.panelExists = !!panel;
        out.panelDistinct = !!panel && panel.id !== "perf-overlay"; // ein eigenes Element
        out.panelVisible = !!panel && panel.style.display !== "none";
        // der Debug-Overlay ist NICHT sichtbar (perfOverlay default aus): entweder nicht gebaut
        // oder auf display:none — jedenfalls NICHT als sichtbares Element.
        out.overlayHidden = !overlay || overlay.style.display === "none" || !overlay.textContent;

        // ===== (b) die EINE Zeile trägt fps + rScale% + Laub% + dc + k-tris =====
        const txt = panel ? panel.textContent || "" : "";
        out.line = txt.slice(0, 200);
        out.hasFps = /\b60\b/.test(txt) && /\bfps\b/.test(txt);
        out.hasRScale = txt.includes("80%");
        out.hasFol = txt.includes("Laub 75%");
        out.hasDc = txt.includes("512dc");
        out.hasTris = txt.includes("1234k▲");

        // ===== (d) PERSISTENZ: Snapshot trägt perfPanel + loadState stellt es her =====
        st.perfPanel = false;
        const snapOff = r.buildStateSnapshot();
        out.snapOff = snapOff.perfPanel; // erw false
        st.perfPanel = true;
        const snapOn = r.buildStateSnapshot();
        out.snapOn = snapOn.perfPanel; // erw true
        // restore: von true → loadState(off) → false
        st.perfPanel = true;
        r._loadStateRestoreSoulAndAtmosphere(snapOff);
        out.restoreOff = st.perfPanel; // erw false
        r._loadStateRestoreSoulAndAtmosphere(snapOn);
        out.restoreOn = st.perfPanel; // erw true
        // Toggle-Methode wirkt
        out.toggleExists = typeof r._togglePerfPanel === "function";
        const before = st.perfPanel;
        r._togglePerfPanel();
        out.toggleFlips = st.perfPanel !== before;
        r._togglePerfPanel(); // zurück
        return out;
    });

    const stat = staticSynergyCheck();

    console.log("\n===== DAS SAUBERE STANDALONE-PERF-PANEL (V18.389 P5) =====\n");
    if (pageErr) console.log("PAGE-ERROR:", pageErr);
    const o = report;

    console.log("  (a) STANDALONE + DEFAULT SICHTBAR:");
    console.log(
        `      perfPanel default ${o.defaultPerfPanel} (erw true) · perfOverlay default ${o.defaultPerfOverlay} (erw false)`
    );
    console.log(
        `      #perf-panel exists ${o.panelExists} · distinct ${o.panelDistinct} · visible ${o.panelVisible} · debug-overlay hidden ${o.overlayHidden}`
    );
    const aOk =
        o.defaultPerfPanel === true &&
        o.defaultPerfOverlay === false &&
        o.panelExists &&
        o.panelDistinct &&
        o.panelVisible &&
        o.overlayHidden;

    console.log("\n  (b) DIE EINE ZEILE (fps · rScale% · Laub% · dc · k-tris):");
    console.log(`      "${(o.line || "").trim()}"`);
    console.log(
        `      fps ${o.hasFps} · rScale% ${o.hasRScale} · Laub% ${o.hasFol} · dc ${o.hasDc} · tris ${o.hasTris}`
    );
    const bOk = o.hasFps && o.hasRScale && o.hasFol && o.hasDc && o.hasTris;

    console.log("\n  (c) SYNERGIE statisch (perfSense-Quelle, kein Parallel-Zähler):");
    console.log(
        `      liest perfSense ${stat.readsPerfSense} · kein renderer.info ${stat.noParallelCounter} · unbedingt gerufen ${stat.calledUnconditionally}`
    );
    const cOk = stat.ok;

    console.log("\n  (d) PERSISTENZ (Snapshot trägt + loadState stellt her, default an):");
    console.log(
        `      snap off ${o.snapOff} · snap on ${o.snapOn} · restore off ${o.restoreOff} · restore on ${o.restoreOn} · toggle ${o.toggleExists}/${o.toggleFlips}`
    );
    const dOk =
        o.snapOff === false &&
        o.snapOn === true &&
        o.restoreOff === false &&
        o.restoreOn === true &&
        o.toggleExists &&
        o.toggleFlips;

    const ok = !pageErr && aOk && bOk && cOk && dOk;
    console.log(
        `\n  (a) ${aOk ? "OK" : "FAIL"} · (b) ${bOk ? "OK" : "FAIL"} · (c) ${cOk ? "OK" : "FAIL"} · (d) ${dOk ? "OK" : "FAIL"}`
    );
    console.log(`\n${ok ? "✅ PERF-PANEL OK" : "❌ PERF-PANEL FAIL"}\n`);
    await browser.close();
    server.close();
    process.exit(ok ? 0 : 1);
})();
