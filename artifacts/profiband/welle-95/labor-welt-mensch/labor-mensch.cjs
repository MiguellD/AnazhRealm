// K45-2 Labor-Sonde: das koerperstudio-Labor im echten Browser — die gezählten Dreiecke der gezeigten Gestalt, die Kosten-
// Leiste, je Stufe der sha256 der Bytes (nur das Ofen-Labor), Bilder: Labor-Ansicht (1600×900) und ARMLÄNGE (Kopf 1,82 m =
// 6,42 Lab-Einheiten bei der Welt-Skala 8·PLAYER_KH/6 = 0,2833 m je Einheit, 75°, 1920×1080, Blick auf Kopf − 0,75 m).
//   node labor-mensch.cjs <wurzel> <port> <ordner> <name> [--alt <dir mit koerperstudio.js + index.html>] [--gpu echt|sw]
"use strict";
const path = require("path"),
    fs = require("fs"),
    http = require("http");
const W = path.resolve(process.argv[2]),
    PORT = Number(process.argv[3]),
    OUT = path.resolve(process.argv[4]),
    NAME = process.argv[5];
const opt = (k) => (process.argv.indexOf(k) > 0 ? process.argv[process.argv.indexOf(k) + 1] : null);
const ALT = opt("--alt"),
    GPU = opt("--gpu") || "echt";
const puppeteer = require(path.join(W, "node_modules/puppeteer"));
const { echteWebGpuArgs } = require(path.join(W, "scripts/lib/software-gpu.cjs"));
const MIME = { ".html": "text/html", ".js": "application/javascript", ".json": "application/json", ".css": "text/css" };
const server = http.createServer((req, res) => {
    const p = decodeURIComponent(req.url.split("?")[0]);
    let datei = path.join(W, p);
    if (ALT && p === "/worlds/koerperstudio/koerperstudio.js") datei = path.join(ALT, "koerperstudio.js");
    if (ALT && p === "/worlds/koerperstudio/index.html") datei = path.join(ALT, "index.html");
    fs.readFile(datei, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", MIME[path.extname(p)] || "application/octet-stream");
        res.end(data);
    });
});
const ZAEHL = () => {
    const vis = (o) => {
        for (let p = o; p; p = p.parent) if (p.visible === false) return false;
        return true;
    };
    const wurzel = typeof gestalt !== "undefined" && gestalt ? gestalt.root : character;
    let tris = 0,
        meshes = 0,
        bild = 0;
    const stoffe = new Set();
    wurzel.traverse((o) => {
        if (!o.isMesh || !o.geometry || !vis(o)) return;
        const g = o.geometry;
        let n = g.index ? g.index.count / 3 : g.attributes.position.count / 3;
        if (o.isInstancedMesh) n *= o.count;
        tris += n;
        meshes++;
        const ms = Array.isArray(o.material) ? o.material : [o.material];
        if (ms.some((m) => m.colorWrite !== false)) bild += n;
        ms.forEach((m) => stoffe.add(m.uuid));
    });
    const k = [...document.querySelectorAll(".h-kosten-text")].map((e) => e.textContent.trim());
    return { tris: Math.round(tris), bildTris: Math.round(bild), meshes, stoffe: stoffe.size, kosten: k, stufe: typeof laborStufe === "function" ? laborStufe() : null };
};
const HASH = async () => {
    if (typeof gestalt === "undefined" || !gestalt) return null;
    const res = {};
    for (const [nm, li] of [
        ["L0", gestalt.l0],
        ["L1", gestalt.l1],
    ]) {
        const teile = [];
        let tris = 0;
        for (const m of li) {
            const g = m.geometry;
            for (const a of Object.keys(g.attributes).sort()) {
                const ar = g.attributes[a].array;
                teile.push(new Uint8Array(ar.buffer, ar.byteOffset, ar.byteLength));
            }
            const ix = g.index.array;
            teile.push(new Uint8Array(ix.buffer, ix.byteOffset, ix.byteLength));
            tris += g.index.count / 3;
        }
        let n = 0;
        for (const t of teile) n += t.length;
        const all = new Uint8Array(n);
        let o = 0;
        for (const t of teile) {
            all.set(t, o);
            o += t.length;
        }
        const d = new Uint8Array(await crypto.subtle.digest("SHA-256", all));
        res[nm] = { tris, sha: [...d].map((x) => x.toString(16).padStart(2, "0")).join("").slice(0, 16) };
    }
    return res;
};
(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    fs.mkdirSync(OUT, { recursive: true });
    const args = GPU === "sw" ? ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] : [...echteWebGpuArgs(), "--use-angle=d3d11"];
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 300000, args: [...args, "--window-size=1920,1080"] });
    const out = { name: NAME, alt: !!ALT, fehler: [] };
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1600, height: 900 });
        page.on("pageerror", (e) => out.fehler.push(String((e && e.message) || e).slice(0, 300)));
        page.on("console", (m) => {
            if (m.type() === "error") out.fehler.push("console: " + m.text().slice(0, 300));
        });
        const t0 = Date.now();
        await page.goto(`http://127.0.0.1:${PORT}/worlds/koerperstudio/index.html`, { waitUntil: "load", timeout: 240000 });
        await page.waitForFunction(() => typeof character !== "undefined" && character && character.parent, { timeout: 240000 });
        await new Promise((r) => setTimeout(r, 6000));
        out.ladeS = +((Date.now() - t0) / 1000).toFixed(1);
        out.gl = await page.evaluate(() => {
            const g = renderer.getContext();
            const d = g.getExtension("WEBGL_debug_renderer_info");
            return d ? g.getParameter(d.UNMASKED_RENDERER_WEBGL) : null;
        });
        out.zaehlung = await page.evaluate(ZAEHL);
        out.hash = await page.evaluate(HASH);
        console.log(NAME, JSON.stringify(out.zaehlung), JSON.stringify(out.hash));
        await page.screenshot({ path: path.join(OUT, `${NAME}-labor.png`) });
        // ARMLÄNGE
        await page.setViewport({ width: 1920, height: 1080 });
        await new Promise((r) => setTimeout(r, 1500));
        out.armlaenge = await page.evaluate(() => {
            document.getElementById("ui").style.display = "none";
            const bt = document.getElementById("buildtag");
            if (bt) bt.style.display = "none";
            controls.enabled = false;
            controls.autoRotate = false;
            character.updateMatrixWorld(true);
            const k = new THREE.Vector3();
            headGroup.getWorldPosition(k);
            const E = 1 / ((8 * 0.2125) / 6); // Lab-Einheiten je Meter
            const d = new THREE.Vector3(0.45, 0.08, 1.0).normalize().multiplyScalar(1.82 * E);
            const ziel = new THREE.Vector3(k.x, k.y - 0.75 * E, k.z);
            camera.fov = 75;
            camera.aspect = innerWidth / innerHeight;
            camera.position.copy(k).add(d);
            camera.lookAt(ziel);
            camera.updateProjectionMatrix();
            controls.target.copy(ziel);
            controls.update = function () {};
            return { kopf: [k.x, k.y, k.z].map((v) => +v.toFixed(3)), E: +E.toFixed(3) };
        });
        await new Promise((r) => setTimeout(r, 2000));
        out.armZaehl = await page.evaluate(ZAEHL);
        await page.screenshot({ path: path.join(OUT, `${NAME}-armlaenge.png`) });
        // fern: aus 45 Einheiten (jenseits ab 40 × 1,1) — die Grobstufe trägt das Bild
        out.fern = await page.evaluate(() => {
            const k = new THREE.Vector3();
            headGroup.getWorldPosition(k);
            camera.fov = 35;
            camera.updateProjectionMatrix();
            camera.position.set(k.x + 20, k.y + 6, k.z + 40);
            camera.lookAt(k);
            return true;
        });
        await new Promise((r) => setTimeout(r, 1500));
        out.fernZaehl = await page.evaluate(ZAEHL);
        await page.screenshot({ path: path.join(OUT, `${NAME}-fern.png`) });
    } finally {
        await browser.close();
        server.close();
    }
    fs.writeFileSync(path.join(OUT, `${NAME}-zaehlung.json`), JSON.stringify(out, null, 2));
    console.log("FEHLER", out.fehler.length, JSON.stringify(out.fehler.slice(0, 6)));
})().catch((e) => {
    console.error(e);
    process.exit(2);
});
