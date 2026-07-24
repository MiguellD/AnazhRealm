// blick-kreatur-aktionen.cjs — DIE AUGEN AUF DEM KREATUR-THEATER (Spiegel-Zensus,
// roadmap §0 „Kreatur-Aktions-Feinschliff am Schöpfer-Auge"): die 12 fx.verhalten-
// Aktionen (tetrapoda-core VERHALTEN.aktionen) wurden nur mechanisch getestet, nie
// ANGESCHAUT. Diese Sonde folgt dem diag-blick-Muster (echtes WebGPU via swiftshader-
// Vulkan, RT-Readback statt Composite-Screenshot): sie spawnt wolf/fuchs/baer nah am
// Spieler (task=wait — kein Wandern, keine Aura), STEMPELT je Runde eine Aktion
// direkt an ud._verhaltenAktion (derselbe transiente Overlay, den _tickKreatur-
// Verhalten stempelt und _animateTierBaum trägt) und schießt je Kreatur ein
// 3/4-Profil-PNG — das Schöpfer-Auge urteilt: Kopf im Boden? Winkel unnatürlich?
//
// GEMESSEN (17.07., Runde 1): EIN monolithisches evaluate (Settle + 12 Renders)
// sprengt jeden protocolTimeout — swiftshader braucht ~1 min je Schuss. Darum
// VIELE KLEINE evaluate-Schritte (Settle/Spawn · Stempel · je Schuss einer),
// jede PNG reist sofort zurück und Node loggt den Fortschritt.
//
//   node scripts/blick-kreatur-aktionen.cjs [--out DIR] [--aktionen a,b,c] [--souls s1,s2]
//   Default-Aktionen: grasen,ruhen,playbow,yawn (die Standbild-Posen — bewegte
//   Aktionen wie bound/pounce sind im Einzel-Frame nicht beurteilbar).
//   Ergebnis: PNGs blick-kreatur-<aktion>-<soul>.png in DIR + Exit 0, wenn jeder
//   Schuss Substanz trägt.
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.BLICK_PORT || 4462);
const argOf = (name, dflt) => {
    const i = process.argv.indexOf(name);
    return i > 0 ? process.argv[i + 1] : dflt;
};
const argOut = argOf("--out", root);
const argAkt = argOf("--aktionen", "grasen,ruhen,playbow,yawn").split(",");
const argSouls = argOf("--souls", "wolf,fuchs,baer").split(",");
const argArm = process.argv.includes("--armlaenge"); // je Kreatur zusätzlich der 1.1-m-Schuss
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

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 600000,
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

    // ── Schritt 1: Boot + Settle + Spawn (ein eigener, begrenzter evaluate) ──
    const boot = await page.evaluate(async (souls) => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const dl = performance.now() + 240000;
        while ((!window.anazhRealm || !window.anazhRealm.state) && performance.now() < dl) await sleep(200);
        const r = window.anazhRealm;
        if (!r) return { fatal: "anazhRealm kam nie" };
        // Settle: Chunks-Plateau (das diag-blick-Muster — swiftshader ist zäh).
        let stable = 0,
            last = -1;
        while (performance.now() < dl) {
            const sz = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
            if (sz === last) stable++;
            else {
                stable = 0;
                last = sz;
            }
            if (sz > 20 && stable > 10) break;
            await sleep(500);
        }
        const rend = r.state.renderer;
        if (!rend) return { fatal: "kein Renderer" };
        if (rend._isHeadlessNull) return { fatal: "Renderer fiel auf Null zurück (kein WebGPU)" };
        const pm = r.state.playerMesh && r.state.playerMesh.position;
        if (!r.state.camera || !r.state.scene || !pm) return { fatal: "kein cam/scene/player" };
        // Mittag — die Posen sollen im Tageslicht stehen, nicht im Nacht-Blau.
        try {
            if (r.state.world) r.state.world.timeOfDay = 0.5;
            r.state.timeOfDay = 0.5;
        } catch (_e) {}
        // Die Modelle: nah am Spieler, task=wait (kein Wandern; direkt gesetzt,
        // nie assignCreatureTask — keine Aura im Bild), bodySize 1 (Vergleich).
        window.__blickKre = [];
        for (let k = 0; k < souls.length; k++) {
            const c = r.spawnCreatureAt(pm.x + 7, pm.y + 0.5, pm.z + (k - 1) * 5, "happy", souls[k], {
                bodySize: 1,
            });
            if (!c) return { fatal: "Spawn fiel aus (kalter Kern?): " + souls[k] };
            c.userData.task = { name: "wait", args: {}, since: performance.now() / 1000 };
            c.userData.emotions = null;
            window.__blickKre.push(c);
        }
        // Erden + einschwingen (Terrain-Höhe, Anim-Init).
        for (let i = 0; i < 15; i++) {
            try {
                if (r.state.world) r.state.world.timeOfDay = 0.5;
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            await sleep(30);
        }
        const V = r._tetrapodaVerhalten();
        if (!V || !V.aktionen) return { fatal: "kein VERHALTEN (kalter Kern)" };
        return {
            rendererArt: rend.isWebGPURenderer ? "webgpu" : rend.isWebGLRenderer ? "webgl" : "?",
            katalog: Object.keys(V.aktionen),
        };
    }, argSouls);
    if (!boot || boot.fatal) {
        console.log("FEHLER:", boot ? boot.fatal : "?", "· Page-Errors:", pageErrors.slice(0, 3).join(" | ") || "-");
        await browser.close();
        server.close();
        process.exit(1);
    }
    console.log(`Boot OK · Renderer: ${boot.rendererArt} · Katalog: ${boot.katalog.join(",")}`);

    // ── Schritt 2: je Aktion stempeln, je Kreatur EIN Schuss (kleine evaluates) ──
    let rot = 0;
    for (const akt of argAkt) {
        const st = await page.evaluate(async (aktN) => {
            const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
            const r = window.anazhRealm;
            const V = r._tetrapodaVerhalten();
            const def = V.aktionen[aktN];
            if (!def) return { fehlt: true };
            const nowS = performance.now() / 1000;
            for (const c of window.__blickKre) {
                c.userData._motionZustand = null;
                c.userData._verhaltenAktion = { name: aktN, def, start: nowS, bis: nowS + 600 };
                c.userData._verhaltenNext = nowS + 1200;
            }
            // Anim einschwingen lassen (Profil-Merge + Phase).
            for (let i = 0; i < 25; i++) {
                try {
                    if (r.state.world) r.state.world.timeOfDay = 0.5;
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                await sleep(30);
            }
            return { ok: true };
        }, akt);
        if (st.fehlt) {
            console.log(`❌ ${akt}: Aktion fehlt im Katalog`);
            rot++;
            continue;
        }
        for (let k = 0; k < argSouls.length; k++) {
          for (const nah of argArm ? [false, true] : [false]) {
            const s = await page.evaluate(async (kIdx, nah) => {
                const r = window.anazhRealm;
                const THREE_ = window.THREE;
                const rend = r.state.renderer;
                const cam = r.state.camera;
                const scene = r.state.scene;
                const c = window.__blickKre[kIdx];
                // 3/4-Blick mit Boden im Bild (Kopf-im-Boden ist nur SO beurteilbar).
                // nah = ARMLÄNGE (PFLICHT-OFFEN A: „Wolf auf Armlänge SCHARF") —
                // 1.1 m ans Fell, Auge auf Schulterhöhe, dieselbe Blickachse.
                const box = new THREE_.Box3().setFromObject(c);
                const ctr = box.getCenter(new THREE_.Vector3());
                const size = box.getSize(new THREE_.Vector3());
                const ry = c.rotation.y;
                const fwd = { x: Math.sin(ry), z: Math.cos(ry) };
                const side = { x: Math.cos(ry), z: -Math.sin(ry) };
                const dist = nah ? 1.1 : Math.max(2.4, Math.max(size.x, size.z) * 1.6);
                cam.position.set(
                    ctr.x + side.x * dist + fwd.x * dist * 0.6,
                    ctr.y + size.y * (nah ? 0.45 : 0.55),
                    ctr.z + side.z * dist + fwd.z * dist * 0.6
                );
                // BODEN-KLEMME (GEMESSEN 24.07.: Armlaengen-Schuss ROT, Farben=5 —
                // das Auge stand IM Hang): die Nah-Kamera nie unter die Oberflaeche.
                if (nah && typeof r._terrainMacroSurfaceY === "function") {
                    const gy = r._terrainMacroSurfaceY(cam.position.x, cam.position.z);
                    if (isFinite(gy) && cam.position.y < gy + 0.35) cam.position.y = gy + 0.35;
                }
                cam.lookAt(ctr.x, ctr.y - size.y * (nah ? 0 : 0.15), ctr.z);
                cam.updateMatrixWorld(true);
                const w = 640,
                    h = 360;
                const rt = new THREE_.RenderTarget(w, h, { depthBuffer: true, samples: 0 });
                const prev = rend.getRenderTarget ? rend.getRenderTarget() : null;
                rend.setRenderTarget(rt);
                if (typeof rend.renderAsync === "function") await rend.renderAsync(scene, cam);
                else rend.render(scene, cam);
                let px = null;
                if (typeof rend.readRenderTargetPixelsAsync === "function") {
                    px = await rend.readRenderTargetPixelsAsync(rt, 0, 0, w, h);
                } else if (typeof rend.readRenderTargetPixels === "function") {
                    px = new Uint8Array(w * h * 4);
                    rend.readRenderTargetPixels(rt, 0, 0, w, h, px);
                }
                rend.setRenderTarget(prev);
                rt.dispose && rt.dispose();
                if (!px || !px.length) return { ok: false, grund: "keine Pixel" };
                const u8 = px instanceof Uint8Array ? px : new Uint8Array(px.buffer || px);
                const set = new Set();
                let nonzero = 0;
                for (let i = 0; i < u8.length; i += 4 * 97) {
                    set.add(((u8[i] >> 4) << 8) | ((u8[i + 1] >> 4) << 4) | (u8[i + 2] >> 4));
                    if (u8[i] + u8[i + 1] + u8[i + 2] > 12) nonzero++;
                }
                // Readback ist TOP-DOWN (der diag-blick-Messwert) — kein Y-Flip.
                const cv = document.createElement("canvas");
                cv.width = w;
                cv.height = h;
                const ctx = cv.getContext("2d");
                const img = ctx.createImageData(w, h);
                img.data.set(u8.subarray(0, w * h * 4));
                ctx.putImageData(img, 0, 0);
                return { ok: true, farben: set.size, nonzero, png: cv.toDataURL("image/png") };
            }, k, nah);
            if (!s.ok) {
                console.log(`❌ ${akt}/${argSouls[k]}: ${s.grund}`);
                rot++;
                continue;
            }
            const file = path.join(argOut, `blick-kreatur-${akt}-${argSouls[k]}${nah ? "-armlaenge" : ""}.png`);
            fs.writeFileSync(file, Buffer.from(s.png.split(",")[1], "base64"));
            const substanz = s.farben >= 8 && s.nonzero > 50;
            if (!substanz) rot++;
            console.log(
                `${substanz ? "✅" : "❌"} ${akt}/${argSouls[k]}${nah ? " (Armlänge)" : ""}: ${file} · Farben=${s.farben} · nonzero=${s.nonzero}`
            );
          }
        }
    }

    await browser.close();
    server.close();
    console.log(rot === 0 ? "\n✅ GRÜN — jede Aktion steht im Bild." : `\n❌ ROT — ${rot} Schuss/Schüsse ohne Substanz.`);
    process.exit(rot === 0 ? 0 : 1);
})().catch((e) => {
    console.error("DIAG-FEHLER:", e);
    try {
        server.close();
    } catch (_e) {}
    process.exit(1);
});
