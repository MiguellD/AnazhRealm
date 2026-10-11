// diag-wiese.cjs — DIE WIESEN-LINSE (Pflicht D, gefallen in V18.508 — die Linse bleibt der Richter der
// Wiese): die Wiese ist nur dort ein Beweis, wo Sonne auf flaches Gras fällt. Befund 30.09.: die
// E-Bühne neben dem Wolf liegt im Waldschatten — der Boden dort ist fast schwarz, mit und ohne Halme.
// Die Linse SUCHT deshalb die
// besonnte Wiese: Kandidaten auf Ringen bis 120 m (der geladene Ring) um die Mess-Wiese −900/−850 (flach, trocken), je
// ein Blick senkrecht nach unten (64×36, Mittag, Schatten frisch) — Büschel nach dem Gesetz × Grün × Helligkeit. Dort je ein
// Schuss fern (1,7 m, 10 m voraus) und Armlänge (1,6 m, 0,8 m voraus) + die Halm-Zahl: mittlerer
// Nachbar-Kontrast der unteren Bildhälfte (hochfrequente Struktur = Halme, glatter Boden ≈ 0). Seit V18.508
// steht nah die Nah-Wiese (Studio-Gras im Kamera-Ring); die Aufnahme schwingt sie für jede Kamera ein.
// Die Wind-Uhr steht für jeden Schuss (S3 08.10.); `--stelle x,z` setzt die Stelle fest (Vorher/Nachher an derselben).
//   node scripts/diag-wiese.cjs [--tag name] [--out DIR] [--stelle x,z]
"use strict";
const puppeteer = require("puppeteer");
const { softwareWebGpuArgs } = require("./lib/software-gpu.cjs");
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
const OUT = path.resolve(argOf("--out", path.join(root, "artifacts", "beweis-e")));
const STELLE = argOf("--stelle", null) ? argOf("--stelle").split(",").map(Number) : null;
if (STELLE && !(STELLE.length === 2 && STELLE.every(Number.isFinite))) {
    console.log("❌ --stelle erwartet x,z (z. B. --stelle -809,-903)");
    process.exit(1);
}
const PORT = Number(process.env.WIESE_PORT || 4468);
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

// Im Seiten-Kontext: ein Render in ein RT (Loop ruht, Mittag, Schatten frisch) → Pixel (+ PNG).
const RENDER_FN = async (kam, W, H, png) => {
    const r = window.anazhRealm;
    const THREE_ = window.THREE;
    const rend = r.state.renderer;
    rend.setAnimationLoop(null);
    window.__buehne(); // Mittag · Sonne · Sommer fest (scripts/lib/ausgabe-aufnahme.cjs)
    // Die Wind-Uhr steht (S3 08.10.): die Halme wiegen mit `uWindTime`, die der Takt aus der Seiten-Zeit schreibt — zwei
    // Boots trafen den Wind in verschiedener Phase (im 3-m-Ausschnitt 11,5 je Pixel), ein Vorher/Nachher der Gestalt maß
    // den Wind mit. Die Linse hält die Uhr auf 100 s; ihre Seite zeigt nur Schüsse.
    const wu = r.state.windUniforms && r.state.windUniforms.uWindTime;
    if (wu && !wu.__fest) {
        Object.defineProperty(wu, "value", { get: () => 100, set: () => {}, configurable: true });
        wu.__fest = true;
    }
    const cam = r.state.camera;
    cam.position.set(kam.px, kam.py, kam.pz);
    cam.lookAt(kam.lx, kam.ly, kam.lz);
    cam.updateMatrixWorld(true);
    if (r.state.playerMesh) r.state.playerMesh.visible = false;
    let u8 = null;
    let info = null;
    for (let k = 0; k < 2; k++) {
        try {
            if (r.state.fernRing && typeof r._tickFeldPass === "function") r._tickFeldPass(r.state.fernRing);
        } catch (_e) {}
        r._schattenAlleNeu();
        const auf = await window.__ausgabeAufnahme(W, H, 1); // die EINE Aufnahme: der echte, getonte Frame
        u8 = auf.u8;
        info = auf.info;
    }
    // Die Nah-Wiese (V18.508): Kacheln · Büschel · Dreiecke im Ring um diese Kamera
    // (Welle 6: die Kacheln tragen Daten, gezeichnet wird der Sicht-Satz — je Senke Teil 0 = je Büschel eine Instanz.)
    let buesch = 0;
    let kach = 0;
    if (r.state.nahWiese) {
        kach = r.state.nahWiese.kacheln.size;
        for (const a of r.state.nahWiese.senken.values()) if (/:0$/.test(a.key)) buesch += a.anzahl;
    }
    rend.setAnimationLoop(r._gameLoopTick);
    // Kennzahlen der unteren Bildhälfte (Boden): Helligkeit + Nachbar-Kontrast
    const lum = (i) => 0.2126 * u8[i] + 0.7152 * u8[i + 1] + 0.0722 * u8[i + 2];
    let n = 0,
        l = 0,
        k2 = 0;
    for (let y = Math.floor(H / 2); y < H - 1; y++)
        for (let x = 0; x < W - 1; x++) {
            const i = (y * W + x) * 4;
            const a = lum(i);
            l += a;
            k2 += Math.abs(a - lum(i + 4)) + Math.abs(a - lum(i + W * 4));
            n++;
        }
    let gr = 0;
    for (let i = 0; i < u8.length; i += 4) gr += u8[i + 1] - Math.max(u8[i], u8[i + 2]);
    const out = {
        hell: l / n,
        kontrast: k2 / (2 * n),
        gruen: gr / (u8.length / 4),
        dc: info && info.drawCalls,
        tri: info && info.triangles,
        kacheln: kach,
        bueschel: buesch,
    };
    if (png) {
        const cv = document.createElement("canvas");
        cv.width = W;
        cv.height = H;
        const ctx = cv.getContext("2d");
        const img = ctx.createImageData(W, H);
        img.data.set(u8.subarray(0, W * H * 4));
        ctx.putImageData(img, 0, 0);
        out.png = cv.toDataURL("image/png");
    }
    return out;
};

(async () => {
    fs.mkdirSync(OUT, { recursive: true });
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 900000,
        args: softwareWebGpuArgs(),
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 640, height: 360 });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.evaluate(AUSGABE_INSTALL); // die EINE Aufnahme: der echte Frame, getont wie beim Spieler
    // Umstellen: der Spieler steht an der Stelle, die Welt schwingt ein (Chunks ruhig).
    const umstellen = (x, z) =>
        page.evaluate(
            async (x, z) => {
                const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
                const dl0 = performance.now() + 300000;
                while (
                    (!window.anazhRealm || typeof window.anazhRealm._gameLoopTick !== "function") &&
                    performance.now() < dl0
                )
                    await sleep(200);
                const r = window.anazhRealm;
                if (!r.state.renderer || r.state.renderer._isHeadlessNull) return { fatal: "kein echter Renderer" };
                r.state.playerMesh.position.set(x, r._voxelSurfaceY(x, z) + 1.8, z);
                let stabil = 0,
                    last = -1,
                    takte = 0;
                const dl = performance.now() + 150000;
                while (performance.now() < dl) {
                    try {
                        if (r.state.world) r.state.world.timeOfDay = 0.5;
                        r._gameLoopTick(performance.now());
                    } catch (_e) {}
                    takte++;
                    const sz = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                    if (sz === last) stabil++;
                    else {
                        stabil = 0;
                        last = sz;
                    }
                    // die Nah-Wiese liest das Studio-Buch (Budget, Gras-Vorlagen): ohne Buch fiele die Aufnahme in die
                    // KERN-PFLICHT — die Linse wartet darauf (W7: unter Last kam das Buch nach den 40 Takten)
                    const buch = !!(r._foundry && r._foundry.recipes && r.constructor._studioRenderConfig);
                    // ... und auf die Nah-Wiese selbst: ihre Studio-Vorlagen kommen aus der Foundry (das Profil der Linse
                    // ist frisch, die Platte kalt) — ohne sie zeigte ein Schuss 0 Büschel und die Linse druckte einen
                    // Kontrast des nackten Bodens (S3 08.10., mit `--stelle` ohne die Zeit der Kandidaten-Suche).
                    const nw = r.state.nahWiese;
                    const wiese = !!(nw && nw.offen === 0 && nw.vorlagen.size > 0);
                    if (takte >= 40 && stabil >= 15 && buch && wiese) break;
                    await sleep(50);
                }
                return { takte, chunks: last };
            },
            x,
            z
        );
    const start = await umstellen(-900, -850);
    if (start.fatal) {
        console.log("FEHLER:", start.fatal);
        process.exit(1);
    }
    // Kandidaten: flach (Spanne ≤ 0,8 m über 6 m), trocken — auf Ringen 0…120 m.
    const kand = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = [];
        for (let d = 0; d <= 120; d += 15)
            for (let k = 0; k < (d ? 12 : 1); k++) {
                const w = (k * Math.PI) / 6;
                const x = -900 + Math.cos(w) * d,
                    z = -850 + Math.sin(w) * d;
                if (typeof r._isAboveWaterAt === "function" && !r._isAboveWaterAt(x, z, 0.3)) continue;
                let lo = Infinity,
                    hi = -Infinity;
                for (const [dx, dz] of [
                    [0, 0],
                    [3, 0],
                    [-3, 0],
                    [0, 3],
                    [0, -3],
                ]) {
                    const y = r._voxelSurfaceY(x + dx, z + dz);
                    lo = Math.min(lo, y);
                    hi = Math.max(hi, y);
                }
                if (hi - lo <= 1.2) out.push({ x, z, y: r._voxelSurfaceY(x, z) });
            }
        return out;
    });
    // Die besonnte Stelle: je Kandidat ein Blick senkrecht nach unten (Mittag, Schatten frisch). `--stelle x,z` setzt sie
    // fest (Vorher/Nachher): die Wertung liest Pixel, eine geänderte Gestalt kann sonst eine andere Stelle wählen.
    let best = null;
    if (STELLE) {
        const [x, z] = STELLE;
        best = { x, z, y: await page.evaluate((x, z) => window.anazhRealm._voxelSurfaceY(x, z), x, z), wert: 0 };
    }
    for (const c of best ? [] : kand) {
        const m = await page.evaluate(
            RENDER_FN,
            { px: c.x, py: c.y + 6, pz: c.z + 0.01, lx: c.x, ly: c.y, lz: c.z },
            64,
            36,
            false
        );
        // Wiese = das Gesetz sagt Wiese (Büschel der Nah-Wiese in den 3×3 Kacheln um die Stelle — Licht,
        // Feuchte, Hang, Pfad, Grün-Kanal) UND besonnt von oben. Die Pixel-Wertung allein (Grün × Hell) wählte
        // 01.10. ein graues Geröllfeld mit grünem Hügel am Rand.
        const bueschel = await page.evaluate((k) => {
            const r = window.anazhRealm;
            const NW = r.constructor.NAH_WIESE;
            let n = 0;
            for (let dz = -1; dz <= 1; dz++)
                for (let dx = -1; dx <= 1; dx++) {
                    const b = r._nahWieseKachelBueschel(
                        Math.floor(k.x / NW.kachel) + dx,
                        Math.floor(k.z / NW.kachel) + dz
                    );
                    if (b) n += b.length;
                }
            return n;
        }, c);
        const wert = Math.max(0, m.gruen) * m.hell * bueschel;
        if (wert > 0 && (!best || wert > best.wert))
            best = Object.assign({ hell: m.hell, gruen: m.gruen, bueschel, wert }, c);
    }
    if (!best) {
        console.log("❌ keine besonnte Wiese gefunden (kein Kandidat mit Büscheln nach dem Gesetz)");
        process.exit(1);
    }
    console.log(
        STELLE
            ? `Besonnte Wiese: ${best.x.toFixed(0)}/${best.z.toFixed(0)} · fest gesetzt (--stelle)`
            : `Besonnte Wiese: ${best.x.toFixed(0)}/${best.z.toFixed(0)} · von oben Helligkeit ${best.hell.toFixed(1)}, Grün-Überschuss ${best.gruen.toFixed(1)}, ${best.bueschel} Büschel (3×3 Kacheln) (${kand.length} Kandidaten)`
    );
    // Der Spieler steht 25 m HINTER der Kamera (sie blickt nach +x): an der Stelle selbst stünde die
    // Kamera im eigenen Körper — gemessen 01.10. im Ausgabe-Pfad (Gewand + Füße füllten das Bild).
    const um = await umstellen(best.x - 25, best.z);
    console.log(`  umgestellt: ${um.takte} Takte · ${um.chunks} Chunks`);
    const g = await page.evaluate((b) => window.anazhRealm._voxelSurfaceY(b.x, b.z), best);
    const bericht = { tag: TAG, stelle: best, schuesse: {} };
    for (const [art, kam] of [
        ["fern", { px: best.x, py: g + 1.7, pz: best.z, lx: best.x + 10, ly: g - 1.2, lz: best.z + 0.01 }],
        ["arm", { px: best.x, py: g + 1.6, pz: best.z, lx: best.x + 0.8, ly: g, lz: best.z + 0.01 }],
    ]) {
        const s = await page.evaluate(RENDER_FN, kam, 640, 360, true);
        const f = path.join(OUT, `wiese-${TAG}-${art}.png`);
        fs.writeFileSync(f, Buffer.from(s.png.split(",")[1], "base64"));
        bericht.schuesse[art] = {
            hell: +s.hell.toFixed(1),
            kontrast: +s.kontrast.toFixed(2),
            dc: s.dc,
            tri: s.tri,
            kacheln: s.kacheln,
            bueschel: s.bueschel,
            datei: path.relative(root, f),
        };
        console.log(
            `  ${art}: Boden-Helligkeit ${s.hell.toFixed(1)} · Halm-Kontrast ${s.kontrast.toFixed(2)} · ${s.dc} dc / ${s.tri} Dreiecke · Nah-Wiese ${s.kacheln} Kacheln / ${s.bueschel} Büschel · ${path.relative(root, f)}`
        );
    }
    fs.writeFileSync(path.join(OUT, `wiese-${TAG}.json`), JSON.stringify(bericht, null, 2));
    await browser.close();
    server.close();
    console.log(pageErrors.length ? "Page-Errors: " + pageErrors.slice(0, 3).join(" | ") : "Page-Errors: 0");
    // Ein Schuss ohne Büschel ist kein Beweis der Wiese (die Stelle trägt Büschel nach dem Gesetz): laut, nie ein Kontrast
    // des nackten Bodens als Zahl.
    const leer = Object.entries(bericht.schuesse).filter(([, s]) => !(s.bueschel > 0));
    if (leer.length) {
        console.log(
            `❌ Nah-Wiese leer im Schuss ${leer.map(([a]) => a).join(", ")} — der Kontrast misst den nackten Boden`
        );
        process.exit(1);
    }
    process.exit(0);
})().catch((e) => {
    console.error("DIAG-FEHLER:", e);
    try {
        server.close();
    } catch (_e) {}
    process.exit(1);
});
