// diag-fenster-wechsel.cjs — DIE FENSTER-WAND (npm run gate:fenster-wechsel).
//
// Befund 03.10. (echte GPU, Radeon 890M): ein Fenster-Wechsel (Ziehen, Vollbild, DevTools) machte die Welt
// für immer SCHWARZ. `renderer.setSize` legt Szene-Tiefe und den Viewport-Tiefen-Klon neu an; das Wasser
// ist der EINE Leser der Viewport-Tiefe (`viewportLinearDepth`), seine Textur-Bindung zog nicht nach — jeder
// Submit des Hauptpasses fiel („Destroyed texture … used in a submit"). Die Heilung sitzt am EINEN
// Chokepoint, dem resize-Handler: `_tiefenLeserNeuBinden` baut den Leser frisch, die Uniform-Werte reisen mit.
//
// Diese Linse (Null-Renderer, GPU-frei) fährt den ECHTEN resize-Handler und prüft den KONSUM:
//   F1  nach dem Wechsel trägt kein Mesh mehr das alte Wasser-Material — weder in der Szene noch in der
//       Chunk-Wasser-Ablage (ein ausgehängtes Mesh nähme es sonst wieder in die Welt)
//   F2  das neue Material ist das EINE `hydroSurfaceMaterial`, alle Wasser-Meshes tragen es
//   F3  die Uniform-Werte reisen mit (ein Probe-Wert überlebt den Neubau)
//   S1  Selbsttest: mit gestubbtem `_tiefenLeserNeuBinden` (no-op) MUSS F1 rot werden
// Den Pixel-Beweis trägt die echte GPU: `werkbank fenster <w> <h>` + `status` (Zähler `zerstoert`).
//
//   node scripts/diag-fenster-wechsel.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.FENSTER_PORT || 4574);
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".css": "text/css",
    ".png": "image/png",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

// Seiten-Probe: ein Wasser-Mesh in der Szene und eines NUR in der Chunk-Wasser-Ablage (ausgehängt), dann
// der echte resize-Handler (Viewport-Wechsel), dann das Urteil.
async function probe(page, w, h, stub) {
    await page.evaluate((stub) => {
        const r = window.anazhRealm;
        const st = r.state;
        const T = window.THREE;
        const alt = r._ensureHydroSurfaceMaterial();
        const geom = new T.BufferGeometry();
        const drin = new T.Mesh(geom, alt);
        const draussen = new T.Mesh(geom, alt);
        drin.name = "fensterProbe";
        st.scene.add(drin);
        if (!st.voxelChunkWaterIso) st.voxelChunkWaterIso = new Map();
        st.voxelChunkWaterIso.set("fensterProbe", draussen);
        const u = st.hydroSurfaceUniforms || {};
        const k = Object.keys(u).find((x) => u[x] && typeof u[x].value === "number");
        if (k) u[k].value = 0.4321;
        window.__fenster = { alt, drin, draussen, k, roh: null };
        if (stub) {
            window.__fenster.roh = Object.getPrototypeOf(r)._tiefenLeserNeuBinden;
            r._tiefenLeserNeuBinden = () => 0;
        }
    }, stub);
    await page.setViewport({ width: w, height: h });
    await new Promise((r) => setTimeout(r, 400));
    return page.evaluate(() => {
        const r = window.anazhRealm;
        const st = r.state;
        const f = window.__fenster;
        let altInSzene = 0;
        st.scene.traverse((o) => {
            if (o.material === f.alt) altInSzene++;
        });
        const neu = st.hydroSurfaceMaterial;
        const u = st.hydroSurfaceUniforms || {};
        const aus = {
            altInSzene,
            altDraussen: f.draussen.material === f.alt ? 1 : 0,
            neuIstEines: !!neu && neu !== f.alt && f.drin.material === neu && f.draussen.material === neu,
            uniform: f.k ? u[f.k] && u[f.k].value : null,
            uniformName: f.k,
        };
        st.scene.remove(f.drin);
        st.voxelChunkWaterIso.delete("fensterProbe");
        if (f.roh) delete r._tiefenLeserNeuBinden;
        return aus;
    });
}

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.message || String(e)).split("\n")[0]));
    let wechsel = 0;
    page.on("console", (m) => {
        if (/Fenstergröße angepasst/.test(m.text())) wechsel++;
    });
    let ok = true;
    const check = (name, cond, detail) => {
        console.log(`  ${cond ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
        if (!cond) ok = false;
    };
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForFunction(
            () => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function" && window.THREE,
            { timeout: 120000 }
        );
        const a = await probe(page, 1600, 900, false);
        console.log("=== Fenster-Wand: 1280×720 → 1600×900 durch den echten resize-Handler ===");
        check("F1 kein Mesh trägt das alte Wasser-Material (Szene)", a.altInSzene === 0, `${a.altInSzene}`);
        check("F1 auch nicht die Chunk-Wasser-Ablage (ausgehängt)", a.altDraussen === 0, `${a.altDraussen}`);
        check("F2 das neue Material ist das EINE hydroSurfaceMaterial", a.neuIstEines);
        check(
            "F3 die Uniform-Werte reisen mit",
            a.uniformName != null && Math.abs(a.uniform - 0.4321) < 1e-6,
            `${a.uniformName} = ${a.uniform}`
        );
        const s = await probe(page, 1280, 720, true);
        console.log("=== Selbsttest: Neubinden gestubbt ===");
        check(
            "S1 die Linse feuert (altes Material bleibt am Mesh)",
            s.altInSzene > 0 && s.altDraussen === 1,
            `${s.altInSzene} / ${s.altDraussen}`
        );
        check("der resize-Handler feuerte (2 Wechsel)", wechsel >= 2, `${wechsel}`);
        check("keine Page-Errors", pageErrors.length === 0, pageErrors.slice(0, 2).join(" | "));
    } catch (e) {
        check("Lauf", false, (e && e.message) || String(e));
    }
    await browser.close();
    server.close();
    console.log(ok ? "GRÜN fenster-wechsel" : "ROT fenster-wechsel");
    process.exit(ok ? 0 : 1);
})();
