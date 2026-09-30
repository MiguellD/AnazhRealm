// diag-arch-feld.cjs — DIE LINSE „gesetzte Dinge erscheinen" (V18.494, 30.09.): im
// Analog-Pfad ist ein gesetzter Bau nur sichtbar, wenn er einen Feld-Slot bekommt
// (_archZiegelFern). GEMESSEN vor der Heilung: eine gesetzte Eiche + ein Haus blieben
// 300 Takte ohne jeden Versuch (Verhungern in der Listen-Reihenfolge, 4 Bakes/s über
// Budget), und nach vorn gezogen brannte die Eiche nach 8 „leer"-Versuchen aus (das
// Foundry-Mesh lädt asynchron) — dauerhaft unsichtbar, wie 26 von 28 Weltgen-Bauten.
// Die Linse fährt den ECHTEN Renderer (WebGPU/swiftshader — der Null-Renderer ist für
// den ganzen Analog-Pfad blind) auf der Mess-Wiese −900/−850 und prüft:
//   A  gesetzte Eiche UND Haus haben binnen 200 Takten ihren Feld-Slot
//   B  kein Foundry-Bau ist „aufgegeben" ohne Slot (ausgebrannt)
//   C  die Eiche teilt ihren Kapsel-Satz mit der Streu (Schlüssel abaum:eiche:<v>)
// plus je ein Schuss (artifacts/beweis-e/arch-feld-*.png) fürs Auge.
//   node scripts/diag-arch-feld.cjs
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const argOf = (k, d) => {
    const i = process.argv.indexOf(k);
    return i > 0 ? process.argv[i + 1] : d;
};
const PORT = Number(process.env.ARCH_FELD_PORT || 4467);
const OUT = path.resolve(argOf("--out", path.join(root, "artifacts", "beweis-e")));
const W = 640,
    H = 360;
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
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

// Im Seiten-Kontext: EIN Schuss mit der gegebenen Kamera + die Zahlen dieses Renders.
const SCHUSS_FN = async (kam) => {
    const r = window.anazhRealm;
    const THREE_ = window.THREE;
    const rend = r.state.renderer;
    const cam = r.state.camera;
    const scene = r.state.scene;
    cam.position.set(kam.px, kam.py, kam.pz);
    // BODEN-KLEMME: das Auge nie im Hang (der 24.07.-Befund der Kreatur-Sonde).
    const sy = typeof r._voxelSurfaceY === "function" ? r._voxelSurfaceY(kam.px, kam.pz) : null;
    if (typeof sy === "number" && isFinite(sy) && cam.position.y < sy + 0.35) cam.position.y = sy + 0.35;
    cam.lookAt(kam.lx, kam.ly, kam.lz);
    cam.updateMatrixWorld(true);
    // Die March-Uniforms folgen der Kamera über den EINEN Produktions-Pfad (sonst
    // marcht der Pass aus der Kamera des letzten Loop-Takts — falsche Gestalt).
    try {
        if (r.state.fernRing && typeof r._tickFeldPass === "function") r._tickFeldPass(r.state.fernRing);
    } catch (_e) {}
    if (r.state.playerMesh) r.state.playerMesh.visible = false; // der eigene Körper steht nicht im Beweis
    const rt = new THREE_.RenderTarget(640, 360, { depthBuffer: true, samples: 0 });
    const prev = rend.getRenderTarget ? rend.getRenderTarget() : null;
    if (rend.info && typeof rend.info.reset === "function") rend.info.reset();
    rend.setRenderTarget(rt);
    const t0 = performance.now();
    if (typeof rend.renderAsync === "function") await rend.renderAsync(scene, cam);
    else rend.render(scene, cam);
    const renderMs = performance.now() - t0;
    const ri = (rend.info && rend.info.render) || {};
    const zahlen = {
        dc: ri.drawCalls != null ? ri.drawCalls : ri.calls,
        tris: ri.triangles,
        renderMsSwiftshader: Math.round(renderMs),
    };
    let px = null;
    if (typeof rend.readRenderTargetPixelsAsync === "function")
        px = await rend.readRenderTargetPixelsAsync(rt, 0, 0, 640, 360);
    rend.setRenderTarget(prev);
    if (rt.dispose) rt.dispose();
    if (!px || !px.length) return { ok: false, grund: "keine Pixel", zahlen };
    const u8 = px instanceof Uint8Array ? px : new Uint8Array(px.buffer || px);
    const set = new Set();
    let nonzero = 0;
    for (let i = 0; i < u8.length; i += 4 * 97) {
        set.add(((u8[i] >> 4) << 8) | ((u8[i + 1] >> 4) << 4) | (u8[i + 2] >> 4));
        if (u8[i] + u8[i + 1] + u8[i + 2] > 12) nonzero++;
    }
    const cv = document.createElement("canvas");
    cv.width = 640;
    cv.height = 360;
    const ctx = cv.getContext("2d");
    const img = ctx.createImageData(640, 360);
    img.data.set(u8.subarray(0, 640 * 360 * 4)); // WebGPU-Readback ist TOP-DOWN (diag-blick-Messwert)
    ctx.putImageData(img, 0, 0);
    const wm = r.state.weltMarch;
    const fp = r.state.feldPass;
    zahlen.weltMarch = wm
        ? {
              belegt: wm.belegt,
              bricks: wm.brickCache ? wm.brickCache.size : null,
              kapseln: wm.kapselCache ? wm.kapselCache.size : null,
              gesetzBloecke: wm.gesetzBloecke || 0,
          }
        : null;
    zahlen.feldPass = fp ? { sichtbar: !!(fp.mesh && fp.mesh.visible), laeufe: fp.laeufe, pano: fp.panoLaeufe } : null;
    try {
        if (typeof r._analogEMetrologieZeile === "function") zahlen.zeile = String(r._analogEMetrologieZeile());
    } catch (_e) {}
    return { ok: true, farben: set.size, nonzero, png: cv.toDataURL("image/png"), zahlen };
};

(async () => {
    fs.mkdirSync(OUT, { recursive: true });
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 900000,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--enable-unsafe-webgpu",
            "--enable-features=Vulkan",
            "--use-vulkan=swiftshader",
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
        ],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: W, height: H });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
    const res = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const dl0 = performance.now() + 300000;
        while (
            (!window.anazhRealm || !window.anazhRealm.state || typeof window.anazhRealm._gameLoopTick !== "function") &&
            performance.now() < dl0
        )
            await sleep(200);
        const r = window.anazhRealm;
        if (!r || !r.state.renderer || r.state.renderer._isHeadlessNull) return { fatal: "kein echter Renderer" };
        const dlB = performance.now() + 90000;
        while (r._foundry && !(r._foundry.ready && r._foundry.recipes) && performance.now() < dlB) await sleep(500);
        const tick = async (n) => {
            for (let i = 0; i < n; i++) {
                try {
                    if (r.state.world) r.state.world.timeOfDay = 0.5;
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                await sleep(40);
            }
        };
        const X = -900,
            Z = -850;
        r.state.playerMesh.position.set(X, r._voxelSurfaceY(X, Z) + 1.8, Z);
        await tick(80);
        const pm = r.state.playerMesh.position;
        const hausName = Object.keys(r.state.blueprints || {})
            .filter((n) => n.startsWith("haus_"))
            .sort()[0];
        const setze = (name, d) => {
            const x = pm.x + d,
                z = pm.z + d * 0.2;
            const y = r._voxelSurfaceY(x, z) + 0.5;
            const e = r.spawnArchitecture(name, { x, y, z }, { rotationY: 0 });
            return { e, x, y, z };
        };
        const B = setze("baum_eiche", 10);
        const Hh = setze(hausName, 26);
        const eb = B.e,
            eh = Hh.e;
        const idx = { baum: r.state.architectures.indexOf(eb), haus: r.state.architectures.indexOf(eh) };
        let slotB = null,
            slotH = null;
        for (let t = 1; t <= 200; t++) {
            await tick(1);
            if (slotB == null && eb && eb._ziegelSlot) slotB = t;
            if (slotH == null && eh && eh._ziegelSlot) slotH = t;
            if (slotB != null && slotH != null && t >= 40) break;
        }
        // B — ausgebrannte Foundry-Bauten (aufgegeben ohne Slot):
        let foundryN = 0,
            ausgebrannt = 0,
            mitSlot = 0;
        for (const a of r.state.architectures) {
            if (!r._archFoundryPreset || !r._archFoundryPreset(a)) continue;
            foundryN++;
            if (a._ziegelSlot) mitSlot++;
            else if (a._ziegelGebacken) ausgebrannt++;
        }
        const wm = r.state.weltMarch;
        const variante = r._foundryVariantFor(eb ? eb.seed : 0);
        window.__afB = B;
        window.__afH = Hh;
        return {
            hausName,
            idx,
            n: r.state.architectures.length,
            slotB,
            slotH,
            versucheB: eb ? eb._ziegelVersuche || 0 : null,
            foundryN,
            mitSlot,
            ausgebrannt,
            geteilt: !!(wm && wm.kapselCache.has("abaum:eiche:" + variante)),
        };
    });
    if (!res || res.fatal) {
        console.log("FEHLER:", res ? res.fatal : "?", "· Page-Errors:", pageErrors.slice(0, 3).join(" | ") || "-");
        await browser.close();
        server.close();
        process.exit(1);
    }
    console.log(`Liste: ${res.n} Bauten · Eiche auf Platz ${res.idx.baum} · ${res.hausName} auf Platz ${res.idx.haus}`);
    const A = res.slotB != null && res.slotH != null;
    const Bk = res.ausgebrannt === 0;
    const C = res.geteilt;
    console.log(`${A ? "✅" : "❌"} A  Feld-Slot: Eiche ab Takt ${res.slotB} · Haus ab Takt ${res.slotH} (Grenze 200)`);
    console.log(
        `${Bk ? "✅" : "❌"} B  Foundry-Bauten: ${res.foundryN} · mit Slot ${res.mitSlot} · ausgebrannt ${res.ausgebrannt}`
    );
    console.log(`${C ? "✅" : "❌"} C  die Eiche teilt den Kapsel-Satz der Streu (abaum:eiche:<v>)`);
    const kam = await page.evaluate(() => {
        const r = window.anazhRealm;
        const pm = r.state.playerMesh.position;
        const g = r._voxelSurfaceY(pm.x, pm.z);
        const B = window.__afB,
            H = window.__afH;
        return {
            baum: { px: pm.x, py: g + 1.7, pz: pm.z, lx: B.x, ly: B.y + 3, lz: B.z },
            haus: { px: pm.x, py: g + 1.7, pz: pm.z, lx: H.x, ly: H.y + 3, lz: H.z },
        };
    });
    for (const k of ["baum", "haus"]) {
        const s = await page.evaluate(SCHUSS_FN, kam[k]);
        if (!s.ok) {
            console.log(`– Schuss ${k}: ${s.grund}`);
            continue;
        }
        const f = path.join(OUT, `arch-feld-${k}.png`);
        fs.writeFileSync(f, Buffer.from(s.png.split(",")[1], "base64"));
        console.log(`  Schuss ${k}: ${path.relative(root, f)} · dc=${s.zahlen.dc} tris=${s.zahlen.tris}`);
    }
    await browser.close();
    server.close();
    const gruen = A && Bk && C && pageErrors.length === 0;
    console.log(
        gruen
            ? "✅ GRÜN — gesetzte Dinge erscheinen im Feld (das Bild urteilt über die Gestalt)."
            : `❌ ROT${pageErrors.length ? " · Page-Errors: " + pageErrors.slice(0, 2).join(" | ") : ""}`
    );
    process.exit(gruen ? 0 : 1);
})().catch((e) => {
    console.error("DIAG-FEHLER:", e);
    try {
        server.close();
    } catch (_e) {}
    process.exit(1);
});
