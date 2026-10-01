// diag-fell-blick.cjs — DIE FELL-LINSE (30.09.; V18.497 Schalen): was trägt das Fell-Bild eines Welt-Tiers — das
// Fell (seit V18.497 die Schalen auf der Tier-Haut) oder die Haut mit dem Lab-Gesetz (FELL_LOOK)? Echter Renderer
// (WebGPU/swiftshader), Mittag, der Wolf auf der ebenen Bühne der Mess-Wiese, Kamera in mehreren Abständen; je
// Abstand drei Bilder — MIT Fell · OHNE Fell · LEER (ohne Tier, die exakte Tier-Maske) —, dazu das Urteil des
// Fell-Bildschirm-Gesetzes (`_fellBildschirmGesetz`) und die Zahlen im Tier: Pixel · was das Fell ändert · die
// Helligkeit von Fell und Haut (Parität = kein Sprung, wo das Gesetz das Fell abschaltet).
//   node scripts/diag-fell-blick.cjs [--tag name] [--abstaende 1.5,3,6,12]
"use strict";
const puppeteer = require("puppeteer");
const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const argOf = (k, d) => {
    const i = process.argv.indexOf(k);
    return i > 0 ? process.argv[i + 1] : d;
};
const TAG = argOf("--tag", "head");
const ABST = argOf("--abstaende", "1.5,3,6,12").split(",").map(Number);
const OUT = path.join(root, "artifacts", "fell-blick");
const PORT = Number(process.env.FELL_PORT || 4471);
const W = 1280,
    H = 720;
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

// Im Seiten-Kontext: ein Bild aus der gegebenen Kamera (Loop ruht, Mittag, Schatten frisch).
const BILD_FN = async (kam, W, H) => {
    const r = window.anazhRealm;
    const THREE_ = window.THREE;
    const rend = r.state.renderer;
    const cam = r.state.camera;
    rend.setAnimationLoop(null);
    window.__buehne(); // Mittag · Sonne · Sommer fest (scripts/lib/ausgabe-aufnahme.cjs)
    cam.position.set(kam.px, kam.py, kam.pz);
    cam.lookAt(kam.lx, kam.ly, kam.lz);
    cam.updateMatrixWorld(true);
    if (r.state.playerMesh) r.state.playerMesh.visible = false;
    let u8 = null;
    for (let k = 0; k < 2; k++) {
        try {
            if (r.state.fernRing && typeof r._tickFeldPass === "function") r._tickFeldPass(r.state.fernRing);
        } catch (_e) {}
        if (rend.shadowMap) rend.shadowMap.needsUpdate = true;
        u8 = (await window.__ausgabeAufnahme(W, H, 1)).u8; // die EINE Aufnahme: der echte, getonte Frame
    }
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext("2d");
    const img = ctx.createImageData(W, H);
    img.data.set(u8.subarray(0, W * H * 4)); // WebGPU-Readback ist TOP-DOWN (diag-blick-Messwert)
    ctx.putImageData(img, 0, 0);
    return { png: cv.toDataURL("image/png"), rgba: Array.from(img.data) };
};

(async () => {
    fs.mkdirSync(OUT, { recursive: true });
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 1800000,
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
    await page.evaluate(AUSGABE_INSTALL); // die EINE Aufnahme: der echte Frame, getont wie beim Spieler
    // Boot, Mess-Wiese, Foundry bereit, den Wolf auf die ebene Bühne (−893,8/−844,9, Spanne 1,2 m).
    const buehne = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
        const dl = performance.now() + 300000;
        while ((!window.anazhRealm || typeof window.anazhRealm._gameLoopTick !== "function") && performance.now() < dl)
            await sleep(200);
        const r = window.anazhRealm;
        if (!r.state.renderer || r.state.renderer._isHeadlessNull) return { fatal: "kein echter Renderer" };
        const f = r._ensureAssetFoundry();
        while (!(f && f.ready && f.recipeCount > 0) && performance.now() < dl) await sleep(200);
        const bx = -893.8,
            bz = -844.9;
        r.state.playerMesh.position.set(bx - 3, r._voxelSurfaceY(bx - 3, bz) + 1.8, bz);
        let stabil = 0,
            last = -1;
        for (let t = 0; t < 400 && stabil < 20; t++) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            const sz = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
            stabil = sz === last ? stabil + 1 : 0;
            last = sz;
            await sleep(50);
        }
        for (const c of [...r.state.creatures]) {
            const d = Math.hypot(c.position.x - bx, c.position.z - bz);
            if (d < 40) r.removeCreature(c);
        }
        const gy = r._voxelSurfaceY(bx, bz);
        const w = r.spawnCreatureAt(bx, gy + 0.5, bz, "happy", "wolf", { bodySize: 1 });
        if (!w) return { fatal: "Wolf-Spawn scheiterte" };
        w.userData.task = { name: "wait", args: {}, since: performance.now() / 1000 };
        w.userData.emotions = null;
        window.__fellWolf = w;
        for (let t = 0; t < 30; t++) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            await sleep(30);
        }
        const tB = w.userData._tierBaum;
        return {
            x: w.position.x,
            y: w.position.y,
            z: w.position.z,
            f: tB ? tB.f : null,
            straehnen: tB && tB.straehnen ? tB.straehnen.length : null,
            hPx: r.state.renderer.domElement ? r.state.renderer.domElement.height : null,
            fov: r.state.camera.fov,
        };
    });
    if (buehne.fatal) {
        console.log("FEHLER:", buehne.fatal);
        process.exit(1);
    }
    console.log(
        `Bühne: Wolf bei ${buehne.x.toFixed(1)}/${buehne.z.toFixed(1)} · Guss-Skala f=${buehne.f && buehne.f.toFixed(3)} · ${buehne.straehnen} Strähnen-Meshes · Bildhöhe ${buehne.hPx} px · fov ${buehne.fov}°`
    );
    const bericht = { tag: TAG, buehne, schuesse: [] };
    for (const d of ABST) {
        // Kamera seitlich (von −x), Auge etwas über dem Rücken, Blick auf die Körpermitte.
        const kam = {
            px: buehne.x - d,
            py: buehne.y + 0.35 + d * 0.08,
            pz: buehne.z + d * 0.25,
            lx: buehne.x,
            ly: buehne.y + 0.35,
            lz: buehne.z,
        };
        const urteil = await page.evaluate((kam) => {
            const r = window.anazhRealm;
            const w = window.__fellWolf;
            const tB = w.userData._tierBaum;
            const cam = r.state.camera;
            cam.position.set(kam.px, kam.py, kam.pz);
            cam.lookAt(kam.lx, kam.ly, kam.lz);
            cam.updateMatrixWorld(true);
            tB._fellAn = undefined;
            r._fellBildschirmGesetz(w, tB);
            // Die Bildgröße des Tiers: Box der Gestalt → 8 Ecken projiziert
            const box = new window.THREE.Box3().setFromObject(tB.wrap);
            let xa = 1,
                xb = -1,
                ya = 1,
                yb = -1;
            for (let i = 0; i < 8; i++) {
                const v = new window.THREE.Vector3(
                    i & 1 ? box.max.x : box.min.x,
                    i & 2 ? box.max.y : box.min.y,
                    i & 4 ? box.max.z : box.min.z
                ).project(cam);
                xa = Math.min(xa, v.x);
                xb = Math.max(xb, v.x);
                ya = Math.min(ya, v.y);
                yb = Math.max(yb, v.y);
            }
            return {
                an: tB._fellAn,
                hoehePx: Math.round(((Math.min(yb, 1) - Math.max(ya, -1)) / 2) * 720),
                flaechePx: Math.round(
                    ((Math.min(xb, 1) - Math.max(xa, -1)) / 2) * 1280 * ((Math.min(yb, 1) - Math.max(ya, -1)) / 2) * 720
                ),
            };
        }, kam);
        const bilder = {};
        // Vier Schüsse: LEER · MIT Fell · OHNE Fell (die Haut) · LEER — die zwei LEER-Bilder (ohne Tier) liefern die
        // exakte Tier-Maske (die projizierte Box log bei Nähe: „2 px hoch" bei 2 m); wo sie sich unterscheiden,
        // streamte die Szene zwischen den Schüssen (Kronen-LOD) — diese Pixel zählen nicht.
        for (const [art, an] of [
            ["leer", null],
            ["mit", true],
            ["ohne", false],
            ["leer2", null],
        ]) {
            await page.evaluate((an) => {
                const tB = window.__fellWolf.userData._tierBaum;
                if (tB.wrap) tB.wrap.visible = an !== null;
                if (tB.fern) tB.fern.visible = false;
                for (const s of tB.straehnen || []) s.visible = an === true;
            }, an);
            const b = await page.evaluate(BILD_FN, kam, W, H);
            const f = path.join(OUT, `fell-${TAG}-${d}m-${art}.png`);
            fs.writeFileSync(f, Buffer.from(b.png.split(",")[1], "base64"));
            bilder[art] = { datei: path.relative(root, f), rgba: b.rgba };
        }
        // Die Tier-Maske: wo MIT oder OHNE vom (stabilen) LEER-Bild abweicht. Darin: was das Fell ändert und wie hell
        // Fell und Haut lesen (Parität = kein Sprung an der Schwelle des Fell-Bildschirm-Gesetzes).
        const A = bilder.mit.rgba,
            B = bilder.ohne.rgba,
            L0 = bilder.leer.rgba,
            L2 = bilder.leer2.rgba;
        const lum = (a, i) => 0.2126 * a[i] + 0.7152 * a[i + 1] + 0.0722 * a[i + 2];
        const abw = (a, b, i) => Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]);
        let tierPx = 0,
            driftPx = 0,
            diffPx = 0,
            hMit = 0,
            hOhne = 0,
            nMit = 0,
            nOhne = 0,
            ya = H,
            yb = -1;
        for (let i = 0; i < A.length; i += 4) {
            if (abw(L0, L2, i) > 12) {
                driftPx++;
                continue;
            }
            const imMit = abw(A, L0, i) > 12,
                imOhne = abw(B, L0, i) > 12;
            if (!imMit && !imOhne) continue;
            tierPx++;
            const y = (i / 4 / W) | 0;
            if (y < ya) ya = y;
            if (y > yb) yb = y;
            if (Math.abs(lum(A, i) - lum(B, i)) > 12) diffPx++;
            if (imMit) ((hMit += lum(A, i)), nMit++);
            if (imOhne) ((hOhne += lum(B, i)), nOhne++);
        }
        const s = {
            abstand: d,
            gesetz: urteil.an ? "Fell AN" : "Fell AUS",
            tierHoehePx: yb >= ya ? yb - ya + 1 : 0,
            tierFlaechePx: tierPx,
            driftPx,
            geaendertPx: diffPx,
            anteilAmTier: +((100 * diffPx) / Math.max(1, tierPx)).toFixed(1),
            helligkeitFell: +(hMit / Math.max(1, nMit)).toFixed(1),
            helligkeitHaut: +(hOhne / Math.max(1, nOhne)).toFixed(1),
            mit: bilder.mit.datei,
            ohne: bilder.ohne.datei,
            leer: bilder.leer.datei,
        };
        bericht.schuesse.push(s);
        console.log(
            `  ${d} m: Tier ${s.tierHoehePx} px hoch / ${s.tierFlaechePx} px · Fell ändert ${s.geaendertPx} px = ${s.anteilAmTier} % · Helligkeit Fell ${s.helligkeitFell} ↔ Haut ${s.helligkeitHaut} (${(100 * (s.helligkeitFell / Math.max(0.1, s.helligkeitHaut) - 1)).toFixed(0)} %) · Szenen-Drift ${s.driftPx} px · Gesetz → ${s.gesetz}`
        );
    }
    fs.writeFileSync(path.join(OUT, `fell-${TAG}.json`), JSON.stringify(bericht, null, 2));
    await browser.close();
    server.close();
    console.log(pageErrors.length ? "Page-Errors: " + pageErrors.slice(0, 3).join(" | ") : "Page-Errors: 0");
    process.exit(0);
})().catch((e) => {
    console.error("FELL-LINSE-FEHLER:", e);
    try {
        server.close();
    } catch (_e) {}
    process.exit(1);
});
