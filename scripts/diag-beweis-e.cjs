// diag-beweis-e.cjs — DAS BEWEIS-PAKET E (PFLICHT-OFFEN E): je Klasse (Kreatur ·
// Baum · Haus · Wiese) ein FERN- und ein ARMLÄNGEN-Schuss aus dem ECHTEN Renderer
// (WebGPU via swiftshader-Vulkan, RT-Readback wie diag-blick) + im selben Moment
// die Zahlen dieses einen Renders (renderer.info: Draw-Calls/Dreiecke) + der
// Welt-March-Zustand (Einträge · Kapseln · Bricks · Feld-Pass sichtbar?).
//
// Dieselbe Sonde läuft auf JEDEM Stand (die APIs sind geguardet) → das Bild-PAAR
// vorher↔nachher entsteht, indem man sie in einem Worktree des Mesh-Stands
// (z. B. d7ca0a1f, 19.07.) und auf HEAD fährt:
//
//   node scripts/diag-beweis-e.cjs --tag analog [--out DIR] [--ohne-wiese] [--klassen baum,haus] [--proto-min 40]
//   (im Worktree)  node scripts/diag-beweis-e.cjs --tag mesh --out <HEAD>/artifacts/beweis-e
//
// Zusätzlich misst die Sonde die SICHTBARKEITS-LÜCKE der Analog-Wende: Takte, in
// denen ein Tier sein Mesh schon abgegeben hat (cr.visible=false, Feld besitzt es),
// der March-Pass aber noch nicht sichtbar ist (Panorama nicht gebacken) — in dieser
// Lücke ist das Tier UNSICHTBAR. swiftshader-Zeiten sind keine GPU-Zeiten; die
// Draw-Call-/Dreiecks-Zahlen sind hardware-unabhängig.
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
const PORT = Number(process.env.BEWEIS_PORT || 4463);
const TAG = argOf("--tag", "head");
const OUT = path.resolve(argOf("--out", path.join(root, "artifacts", "beweis-e")));
const KLASSEN = argOf("--klassen", "kreatur,baum,haus,wiese").split(",");
const MIT_WIESE = !process.argv.includes("--ohne-wiese") && KLASSEN.includes("wiese");
// Die Protokoll-Frist je page.evaluate: der Mesh-Stand (Juli) rendert im Wald Millionen Dreiecke
// durch swiftshader — ein Doppel-Render dort sprengte 15 min (GEMESSEN 30.09.).
const PROTO_MS = Number(argOf("--proto-min", "15")) * 60000;
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

// DIE BLICK-WAHL (Befund 30.09.: Kameras standen im Laub, unter dem Bauch des Tiers, hinter Stämmen):
// 12 Azimute um das Objekt, je zwei Renders (die aktive Gestalt an/aus, 160×90, Loop ruht) — der Azimut mit den
// meisten vom Objekt geänderten Pixeln trägt Fern- UND Armlängen-Schuss.
const SICHT_FN = async (a) => {
    const r = window.anazhRealm;
    const THREE_ = window.THREE;
    const rend = r.state.renderer;
    const cam = r.state.camera;
    rend.setAnimationLoop(null);
    window.__buehne(); // Mittag · Sonne · Sommer fest (scripts/lib/ausgabe-aufnahme.cjs)
    // Die AKTIVE Gestalt schalten: nah das Studio-Mesh (Tier / Mesh / Instanzen), fern das Feld.
    let setze = null;
    if (a.klasse === "kreatur") {
        const w = window.__beweisWolf;
        const u = w && w.userData;
        if (w && u && u._kzNah) setze = (an) => (w.visible = an);
        else if (u && u._kzGlieder) setze = (an) => u._kzGlieder.forEach((gl) => r._weltFeldAktiv(gl.handle, an));
    } else {
        const e = a.klasse === "baum" ? window.__beweisBaum : window.__beweisHaus;
        if (e && r._archIsRendered(e)) {
            setze = (an) => {
                if (e.mesh) e.mesh.visible = an;
                else if (!an) r._cullArchitectureMesh(e);
                else if (!r._archIsRendered(e)) r._rebuildArchitectureMesh(e);
            };
        } else if (e && e._ziegelSlot) setze = (an) => r._weltFeldAktiv(e._ziegelSlot, an);
    }
    if (!setze) {
        rend.setAnimationLoop(r._gameLoopTick);
        return { w: a.w0, n: -1, grund: "keine aktive Gestalt" };
    }
    const bild = async () => {
        try {
            if (r.state.fernRing && typeof r._tickFeldPass === "function") r._tickFeldPass(r.state.fernRing);
        } catch (_e) {}
        r._schattenAlleNeu();
        const rt = new THREE_.RenderTarget(160, 90, { depthBuffer: true, samples: 0 });
        const prev = rend.getRenderTarget ? rend.getRenderTarget() : null;
        rend.setRenderTarget(rt);
        if (typeof rend.renderAsync === "function") await rend.renderAsync(r.state.scene, cam);
        else rend.render(r.state.scene, cam);
        const px = await rend.readRenderTargetPixelsAsync(rt, 0, 0, 160, 90);
        rend.setRenderTarget(prev);
        if (rt.dispose) rt.dispose();
        return px instanceof Uint8Array ? px : new Uint8Array(px.buffer || px);
    };
    let best = null;
    for (let k = 0; k < 12; k++) {
        const w = a.w0 + (k * Math.PI) / 6;
        const px = a.ox + Math.cos(w) * a.dist,
            pz = a.oz + Math.sin(w) * a.dist;
        const g = r._voxelSurfaceY(px, pz);
        cam.position.set(px, Math.max(g + 0.35, a.augeY != null ? a.augeY : g + a.augeH), pz);
        cam.lookAt(a.ox, a.zielY, a.oz);
        cam.updateMatrixWorld(true);
        if (r.state.playerMesh) r.state.playerMesh.visible = false;
        setze(true);
        await bild(); // wärmt (Seiten/Listen-Upload)
        const an = await bild();
        setze(false);
        const aus = await bild();
        setze(true);
        let n = 0;
        for (let i = 0; i < an.length; i += 4)
            if (Math.abs(an[i] - aus[i]) + Math.abs(an[i + 1] - aus[i + 1]) + Math.abs(an[i + 2] - aus[i + 2]) > 24)
                n++;
        if (!best || n > best.n) best = { w, n };
    }
    rend.setAnimationLoop(r._gameLoopTick);
    return best;
};

// Im Seiten-Kontext: EIN Schuss mit der gegebenen Kamera + die Zahlen dieses Renders.
const SCHUSS_FN = async (kam) => {
    const r = window.anazhRealm;
    const THREE_ = window.THREE;
    const rend = r.state.renderer;
    const cam = r.state.camera;
    const scene = r.state.scene;
    // Der Spiel-Loop RUHT während des Schusses (sonst zieht er Kamera, Tageszeit und Cull-Zustand
    // zwischen Setzen und Render weiter); Mittag fest, Lichter einmal nachgeführt.
    rend.setAnimationLoop(null);
    window.__buehne(); // Mittag · Sonne · Sommer fest (scripts/lib/ausgabe-aufnahme.cjs)
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
    // Die Schatten-Map markiert sonst nur der Loop (_loopShadowUpdate) — bei ruhendem Loop bliebe sie für
    // die neue Kamera veraltet (Befund 30.09.: schwarzer Boden).
    r._schattenAlleNeu();
    // DIE EINE AUFNAHME (scripts/lib/ausgabe-aufnahme.cjs): der echte Frame (Post-Pipeline, ACES + sRGB)
    // in ein Render-Target, das der Ausgabe-Puffer IST — ein Warm-Frame, der zweite zählt.
    const auf = await window.__ausgabeAufnahme(640, 360, 1);
    const renderMs = auf.ms;
    const ri = auf.info;
    // Kosten-Herkunft: sichtbare Meshes nach Gruppe (Dreiecke × Instanzen, residente Last).
    const herkunft = {};
    scene.traverseVisible((o) => {
        if (!o.isMesh || !o.geometry) return;
        const g = o.geometry;
        const tri = g.index
            ? g.index.count / 3
            : g.attributes && g.attributes.position
              ? g.attributes.position.count / 3
              : 0;
        const n = o.isInstancedMesh ? o.count : 1;
        let k = (o.userData && (o.userData.inventar || o.userData.kind)) || "";
        if (!k) {
            let p = o;
            while (p && p.parent && p.parent !== scene) p = p.parent;
            k = (p && p.userData && p.userData.inventar) || (p && p.name) || o.name || o.type;
        }
        k = String(k)
            .replace(/[:@][^:@]*$/, "")
            .slice(0, 40);
        herkunft[k] = (herkunft[k] || 0) + tri * n;
    });
    const zahlen = {
        dc: ri.drawCalls != null ? ri.drawCalls : ri.calls,
        tris: ri.triangles,
        renderMsSwiftshader: Math.round(renderMs),
        herkunft: Object.entries(herkunft)
            .sort((x, y) => y[1] - x[1])
            .slice(0, 8)
            .map(([k, v]) => k + " " + Math.round(v)),
    };
    const px = auf.u8;
    rend.setAnimationLoop(r._gameLoopTick);
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
        protocolTimeout: PROTO_MS,
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

    // ── 1: Boot + Settle + Mittag + Buch warm ──
    const boot = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const dl = performance.now() + 300000;
        while ((!window.anazhRealm || !window.anazhRealm.state) && performance.now() < dl) await sleep(200);
        const r = window.anazhRealm;
        if (!r) return { fatal: "anazhRealm kam nie" };
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
        if (!rend || rend._isHeadlessNull) return { fatal: "kein echter Renderer (WebGPU fiel aus)" };
        // Das Studio-Buch (Häuser/Bäume der Foundry) warm abwarten — begrenzt.
        const dlB = performance.now() + 90000;
        while (r._foundry && !(r._foundry.ready && r._foundry.recipes) && performance.now() < dlB) await sleep(500);
        // UPLOAD-LINSE: ein Upload, der mehr liest, als das Array trägt (in-place gewachsen über den
        // GPU-Puffer, oder eine offene updateRange über ein genulltes/kürzeres Array — Befund 30.09.:
        // entlassene Batch-Stagings), sprengt queue.writeBuffer („Number of bytes to write is too large")
        // — die Linse nennt es beim Namen (Objekt · Attribut · Bytes), statt dass der Schuss namenlos stirbt.
        try {
            const au = rend.backend && rend.backend.attributeUtils;
            if (au && !au.__linse) {
                const orig = au.updateAttribute.bind(au);
                au.updateAttribute = (attr) => {
                    const ba = attr && attr.isInterleavedBufferAttribute ? attr.data : attr;
                    const d = ba && rend.backend.get(ba);
                    const rg = (ba && ba.updateRanges) || [];
                    const bis = rg.reduce((m, u) => Math.max(m, (u.start + u.count) * ba.array.BYTES_PER_ELEMENT), 0);
                    if (
                        d &&
                        d.buffer &&
                        ba.array &&
                        (ba.array.byteLength > d.buffer.size || bis > ba.array.byteLength)
                    ) {
                        let wer = "?";
                        r.state.scene.traverse((o) => {
                            const g = o.geometry;
                            if (!g || wer !== "?") return;
                            if (o.instanceMatrix === attr || o.instanceColor === attr)
                                wer = `${o.name || o.type}:instance`;
                            else if (g.index === attr) wer = `${o.name || o.type}:index`;
                            else
                                for (const k in g.attributes)
                                    if (g.attributes[k] === attr) wer = `${o.name || o.type}:${k}`;
                        });
                        (window.__uploadLinse = window.__uploadLinse || []).push(
                            `${wer} Array ${ba.array.byteLength}B · Range bis ${bis}B · GPU ${d.buffer.size}B`
                        );
                    }
                    return orig(attr);
                };
                au.__linse = true;
            }
        } catch (_e) {}
        return {
            version: r.constructor && r.constructor.VERSION,
            renderer: rend.isWebGPURenderer ? "webgpu" : rend.isWebGLRenderer ? "webgl" : "?",
            backendWebGPU: !!(rend.backend && rend.backend.isWebGPUBackend),
            chunks: r.state.voxelChunks ? r.state.voxelChunks.size : 0,
            foundryBereit: !!(r._foundry && r._foundry.ready),
        };
    });
    if (!boot || boot.fatal) {
        console.log("FEHLER:", boot ? boot.fatal : "?", "· Page-Errors:", pageErrors.slice(0, 3).join(" | ") || "-");
        await browser.close();
        server.close();
        process.exit(1);
    }
    console.log(
        `Boot OK · V${boot.version} · ${boot.renderer} (WebGPU-Backend=${boot.backendWebGPU}) · Chunks=${boot.chunks} · Foundry=${boot.foundryBereit}`
    );

    // ── 1b: auf die Mess-Wiese −900/−850 (flach + grün, PFLICHT D). Befund 30.09.: am Spawn
    // stand die Kamera unter der Start-Plattform bzw. im Hang (Bühnen-Spanne bis 13 m) —
    // alle Klassen stehen darum auf der Wiese, wo Bühne und Kamera wirklich eben sind.
    const wieseStart = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const r = window.anazhRealm;
        const X = -900,
            Z = -850;
        r.state.playerMesh.position.set(X, r._voxelSurfaceY(X, Z) + 1.8, Z);
        const dl = performance.now() + 240000;
        let stable = 0,
            last = -1,
            takte = 0;
        while (performance.now() < dl) {
            try {
                if (r.state.world) r.state.world.timeOfDay = 0.5;
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            takte++;
            const sz = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
            if (sz === last) stable++;
            else {
                stable = 0;
                last = sz;
            }
            if (takte > 60 && stable > 25) break;
            await sleep(60);
        }
        return { takte, chunks: last };
    });
    console.log(`Mess-Wiese erreicht: ${wieseStart.takte} Takte · ${wieseStart.chunks} Chunks`);

    // ── 2: Spawn (Wolf · Eiche · Haus) auf flachen Bühnen der Wiese ──
    const spawn = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const r = window.anazhRealm;
        const pm = r.state.playerMesh.position;
        const setzeMittag = () => {
            try {
                if (r.state.world) r.state.world.timeOfDay = 0.5;
                r.state.timeOfDay = 0.5;
            } catch (_e) {}
        };
        setzeMittag();
        const boden = (x, z) => {
            const y = typeof r._voxelSurfaceY === "function" ? r._voxelSurfaceY(x, z) : r.getTerrainHeightAt(x, z);
            return typeof y === "number" && isFinite(y) ? y : pm.y;
        };
        const trocken = (x, z) => (typeof r._isAboveWaterAt === "function" ? r._isAboveWaterAt(x, z, 0.3) : true);
        // DIE BÜHNE: je Klasse ein FLACHER, TROCKENER Platz um die Mess-Wiese —
        // Höhen-Spanne über Mitte + 2 Ringe (r, r/2 × 8 Richtungen) ≤ tol, alle Proben trocken,
        // Abstand zu den schon vergebenen Bühnen. Kamera und Objekt stehen auf DERSELBEN Bühne.
        const vergeben = [];
        const buehne = (minD, maxD, rad, tol, w0) => {
            let best = null;
            for (let d = minD; d <= maxD; d += 9) {
                for (let k = 0; k < 16; k++) {
                    const w = w0 + k * 0.3927;
                    const cx = pm.x + Math.cos(w) * d;
                    const cz = pm.z + Math.sin(w) * d;
                    if (vergeben.some((v) => Math.hypot(v.x - cx, v.z - cz) < v.rad + rad + 4)) continue;
                    let lo = Infinity,
                        hi = -Infinity,
                        nass = false;
                    const proben = [[cx, cz]];
                    for (let j = 0; j < 8; j++) {
                        const a = (j * Math.PI) / 4;
                        proben.push([cx + Math.cos(a) * rad, cz + Math.sin(a) * rad]);
                        proben.push([cx + Math.cos(a) * rad * 0.5, cz + Math.sin(a) * rad * 0.5]);
                    }
                    for (const [x, z] of proben) {
                        if (!trocken(x, z)) {
                            nass = true;
                            break;
                        }
                        const y = boden(x, z);
                        if (y < lo) lo = y;
                        if (y > hi) hi = y;
                    }
                    if (nass) continue;
                    const spanne = hi - lo;
                    if (!best || spanne < best.spanne) best = { x: cx, z: cz, y: boden(cx, cz), spanne, rad };
                    if (spanne <= tol) {
                        vergeben.push(best);
                        return best;
                    }
                }
            }
            if (best) vergeben.push(best);
            return best || { x: pm.x + minD, z: pm.z, y: boden(pm.x + minD, pm.z), spanne: NaN, rad };
        };
        const bps = r.state.blueprints || {};
        const hausName = Object.keys(bps)
            .filter((n) => n.startsWith("haus_"))
            .sort()[0];
        const out = { objekte: {}, hausName: hausName || null };
        // Wolf
        const pw = buehne(8, 50, 6, 1.2, 0.3);
        // Am Kreatur-Limit (Befund 30.09.: spawnCreatureAt=null) weicht das FERNSTE Tier dem Beweis-Wolf.
        if (r.state.creatures.length >= r.state.maxCreatures) {
            let fern = null,
                fd = -1;
            for (const c of r.state.creatures) {
                const d = (c.position.x - pw.x) ** 2 + (c.position.z - pw.z) ** 2;
                if (d > fd) ((fd = d), (fern = c));
            }
            if (fern) r.removeCreature(fern);
        }
        const wolf = r.spawnCreatureAt(pw.x, pw.y + 0.5, pw.z, "happy", "wolf", { bodySize: 1 });
        if (wolf) {
            wolf.userData.task = { name: "wait", args: {}, since: performance.now() / 1000 };
            wolf.userData.emotions = null;
            window.__beweisWolf = wolf;
            out.objekte.kreatur = { x: pw.x, y: pw.y, z: pw.z, spanne: +pw.spanne.toFixed(2) };
        } else out.objekte.kreatur = { fehlt: "spawnCreatureAt=null" };
        // Eiche
        const pb = buehne(12, 60, 16, 2.2, 2.4);
        try {
            const e = r.spawnArchitecture("baum_eiche", { x: pb.x, y: pb.y, z: pb.z }, { rotationY: 0 });
            window.__beweisBaum = e;
            out.objekte.baum = { x: pb.x, y: pb.y, z: pb.z, spanne: +pb.spanne.toFixed(2), ret: e ? typeof e : "null" };
        } catch (err) {
            out.objekte.baum = { fehlt: String(err && err.message) };
        }
        // Haus (das erste Studio-Haus des Buchs)
        if (hausName) {
            const ph = buehne(20, 80, 24, 3.5, 4.3);
            try {
                const e = r.spawnArchitecture(hausName, { x: ph.x, y: ph.y, z: ph.z }, { rotationY: 0 });
                window.__beweisHaus = e;
                out.objekte.haus = {
                    x: ph.x,
                    y: ph.y,
                    z: ph.z,
                    spanne: +ph.spanne.toFixed(2),
                    name: hausName,
                    ret: e ? typeof e : "null",
                };
            } catch (err) {
                out.objekte.haus = { fehlt: String(err && err.message) };
            }
        } else out.objekte.haus = { fehlt: "kein haus_-Bauplan im Buch" };
        // Ab hier halten die Tiere still (Blick-Wahl und Schuss sehen dieselbe Szene).
        window.__tiereHalten();
        // Einschwingen + DIE SICHTBARKEITS-LÜCKE messen (Tier ohne Mesh, Pass unsichtbar).
        const zeit = [];
        let lueckeTakte = 0,
            takte = 0;
        const dl = performance.now() + 120000;
        let fpSichtbarBei = null;
        while (performance.now() < dl) {
            setzeMittag();
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            takte++;
            const fp = r.state.feldPass;
            const fpVis = !!(fp && fp.mesh && fp.mesh.visible);
            const u = wolf && wolf.userData;
            const feldBesitzt = !!(u && (u._kzGlieder || u._kzVersuch));
            if (wolf && !wolf.visible && feldBesitzt && !fpVis) lueckeTakte++;
            if (fpVis && fpSichtbarBei == null) fpSichtbarBei = takte;
            if (takte % 10 === 0)
                zeit.push({
                    t: takte,
                    fpVis,
                    feldBesitzt,
                    meshVis: wolf ? wolf.visible : null,
                    glieder: u && u._kzGlieder ? u._kzGlieder.length : 0,
                });
            // Fertig: Pass sichtbar (oder es gibt keinen Pass) und 40 Takte eingeschwungen.
            if (takte >= 40 && (fpVis || !fp) && (fpSichtbarBei == null || takte - fpSichtbarBei >= 20)) break;
            await sleep(40);
        }
        out.einschwingen = { takte, lueckeTakte, fpSichtbarBei, zeit };
        return out;
    });
    console.log("Spawn:", JSON.stringify(spawn.objekte), "· Haus:", spawn.hausName);
    console.log(
        `Einschwingen: ${spawn.einschwingen.takte} Takte · Feld-Pass sichtbar ab Takt ${spawn.einschwingen.fpSichtbarBei} · Lücke (Tier unsichtbar) ${spawn.einschwingen.lueckeTakte} Takte`
    );

    // ── 3: Kamera je Klasse (Fern + Armlänge) — Objekt-Maße aus der Szene, Azimut aus der Blick-Wahl ──
    const objektInfo = () =>
        page.evaluate(() => {
            const r = window.anazhRealm;
            const THREE_ = window.THREE;
            const k = {};
            const wolf = window.__beweisWolf;
            if (wolf) {
                const box = new THREE_.Box3().setFromObject(wolf);
                const c = box.getCenter(new THREE_.Vector3());
                const sz = box.getSize(new THREE_.Vector3());
                k.kreatur = { x: c.x, y: c.y, z: c.z, sx: sz.x, sy: sz.y, sz: sz.z };
            }
            for (const [name, e] of [
                ["baum", window.__beweisBaum],
                ["haus", window.__beweisHaus],
            ]) {
                if (!e || !e.position) continue;
                const x = e.position.x,
                    z = e.position.z;
                const y = r._voxelSurfaceY(x, z);
                // Maße: der Feld-Satz (lokale Größe) oder die Nenn-Größe
                const kk = e._ziegelSlot && e._ziegelSlot.brick;
                const g = kk && kk.lokalGroesse ? kk.lokalGroesse : null;
                const s = e.scale && isFinite(e.scale) ? e.scale : 1;
                k[name] = {
                    x,
                    y,
                    z,
                    r: g ? (Math.max(g.x, g.z) * s) / 2 : name === "baum" ? 3 : 5,
                    h: g ? g.y * s : name === "baum" ? 9 : 8,
                };
            }
            return k;
        });
    const kameraFuer = (klasse, o, w, art) => {
        const at = (dist, augeH, zielY, augeY) => ({
            dist,
            augeH,
            augeY,
            zielY,
            ox: o.x,
            oz: o.z,
            w0: w,
            px: o.x + Math.cos(w) * dist,
            pz: o.z + Math.sin(w) * dist,
            lx: o.x,
            ly: zielY,
            lz: o.z,
        });
        if (klasse === "kreatur") {
            const m = Math.max(o.sx, o.sz);
            return art === "fern"
                ? at(Math.max(4, m * 2.5), 0, o.y, o.y + o.sy * 0.6 + 0.5)
                : at(Math.max(1.6, m * 0.5 + 1.0), 0, o.y, o.y + o.sy * 0.5 + 0.6);
        }
        if (klasse === "baum")
            return art === "fern" ? at(Math.max(14, o.h * 1.7), 1.7, o.y + o.h * 0.45) : at(2.6, 1.7, o.y + 1.8);
        return art === "fern" ? at(Math.max(20, o.r * 3.2), 1.7, o.y + o.h * 0.35) : at(o.r + 2.5, 1.7, o.y + 1.7);
    };
    // DAS UMSTELLEN: der Spieler steht dort, wo die Kamera steht — der Chunk-Ring, die
    // Foundry-Stufe (Distanz zum Spieler) und der March folgen ihm; eingeschwungen, wenn
    // die Chunk-Zahl 15 Takte ruht (mindestens 40 Takte, höchstens 150 s).
    // voll = true: warten, bis die Mesh-Zone GANZ steht (vor der Blick-Wahl — ein später gebauter Baum darf nicht
    // in die gewählte Sichtlinie wachsen, Befund 30.09.); sonst genügen 60 Takte ohne Fortschritt.
    const umstellen = (kam, voll = false) =>
        page.evaluate(
            async (kam, voll) => {
                const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
                const r = window.anazhRealm;
                const g = typeof r._voxelSurfaceY === "function" ? r._voxelSurfaceY(kam.px, kam.pz) : kam.py;
                r.state.playerMesh.position.set(kam.px, g + 1.8, kam.pz);
                // Beim Einschwingen rendert der Takt NICHT (unter swiftshader kostet ein Voll-Render mit
                // Studio-Meshes Sekunden — die Mesh-Zone würde nie fertig); gerendert wird nur der Schuss.
                const rend = r.state.renderer;
                const origR = rend.render,
                    origRA = rend.renderAsync;
                rend.render = function () {};
                if (typeof origRA === "function") rend.renderAsync = () => Promise.resolve();
                const dl = performance.now() + (voll ? 900000 : 240000);
                let stable = 0,
                    last = -1,
                    takte = 0,
                    offenVor = -1,
                    ohneFortschritt = 0;
                // STUFEN-LINSE: das ZIEL-Objekt (der Bau am Zielpunkt) steht klar im L0-Band, aber noch auf einer
                // gröberen Stufe — der feinere Guss ist unterwegs. Befund aaa9: Haus bei 7,5 m auf L1 (serviert 2),
                // „eingeschwungen" nach 40 Takten, das Bild leer. Vor dem Schuss wird gewartet (≤ 600 Takte).
                let ziel = null,
                    zielD = Infinity;
                for (const e of r.state.architectures) {
                    const d = Math.hypot(e.position.x - kam.ox, e.position.z - kam.oz);
                    if (d < 1.5 && d < zielD) ((ziel = e), (zielD = d));
                }
                const LD = r.constructor && r.constructor.LOD_DISTANCES;
                const L01 = LD && Number.isFinite(LD.thresh01) ? LD.thresh01 : 12;
                const zielOffen = () =>
                    !!ziel &&
                    Number.isFinite(ziel._lodLevel) &&
                    ziel._lodLevel > 0 &&
                    Math.hypot(ziel.position.x - kam.px, ziel.position.z - kam.pz) < 0.85 * L01;
                while (performance.now() < dl) {
                    try {
                        if (r.state.world) r.state.world.timeOfDay = 0.5;
                        r._gameLoopTick(performance.now());
                    } catch (_e) {}
                    takte++;
                    const sz = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                    if (sz === last) stable++;
                    else {
                        stable = 0;
                        last = sz;
                    }
                    // Eingeschwungen = Chunks ruhig UND die Mesh-Zone steht (kein ungebauter Bau im Cull-Radius
                    // mehr — oder 60 Takte ohne Fortschritt: der Rest lädt noch in der Foundry).
                    const rad2 = r.state.architectureCullingRadius * r.state.architectureCullingRadius;
                    let offen = 0;
                    for (const e of r.state.architectures) {
                        const ex = e.position.x - kam.px,
                            ez = e.position.z - kam.pz;
                        if (ex * ex + ez * ez <= rad2 && !r._archIsRendered(e)) offen++;
                    }
                    if (offen === offenVor) ohneFortschritt++;
                    else ohneFortschritt = 0;
                    offenVor = offen;
                    if (
                        takte >= 40 &&
                        stable >= 15 &&
                        (offen === 0 || (!voll && ohneFortschritt >= 60)) &&
                        (!zielOffen() || takte >= 600)
                    )
                        break;
                    await sleep(50);
                }
                rend.render = origR;
                if (typeof origRA === "function") rend.renderAsync = origRA;
                // MESH-ZONEN-LINSE: WARUM steht ein Bau im Cull-Radius noch nicht? Je Typ der Grund —
                // Foundry-Preset · Flat (null = lädt, false = Bake-Lücke, nicht instanzierbar) · LOD-Stufe.
                const warum = {};
                const rad2 = r.state.architectureCullingRadius * r.state.architectureCullingRadius;
                for (const e of r.state.architectures) {
                    const ex = e.position.x - kam.px,
                        ez = e.position.z - kam.pz;
                    if (ex * ex + ez * ez > rad2 || r._archIsRendered(e)) continue;
                    let grund;
                    try {
                        const fp = r._foundryEnabled() ? r._foundryPresetForEntry(e) : null;
                        if (!fp) grund = "klassik";
                        else {
                            const f = r._foundryFlattenFor(e, fp, e._lodLevel);
                            grund =
                                f === null
                                    ? "flat lädt"
                                    : f === false
                                      ? "bake-lücke"
                                      : f && !f.instanceable
                                        ? "nicht instanzierbar"
                                        : "flat bereit";
                            grund += ` L${e._lodLevel}`;
                        }
                    } catch (err) {
                        grund = "wurf " + String(err.message || err).slice(0, 40);
                    }
                    const k = `${e.type} (${grund})`;
                    warum[k] = (warum[k] || 0) + 1;
                }
                // IMPOSTOR-ZENSUS: die L2-Stufe der Bäume IST die gebackene Studio-Karte — backt der Bäcker?
                const z = r._impostorCensus() || {};
                const zensus =
                    `Bühne ${r.state._buehneStand ? "steht" : "OFFEN"} · Karten ${z.atlanten || 0}: gebacken ${z.rttGebacken || 0}` +
                    ` · gescheitert ${z.rttGescheitert || 0} · wartend ${z.silhouetteWartend || 0} · hängend ${z.haengendeBakes || 0}` +
                    ` · Queue ${(r._impostorBakeQueue || []).length}${r._impostorBakePending ? " (Bake in Flug)" : ""}` +
                    (window.__impostorRttError ? ` · Fehler: ${String(window.__impostorRttError).slice(0, 80)}` : "");
                return {
                    takte,
                    chunks: last,
                    offen: offenVor,
                    zielStufe: zielOffen()
                        ? `Ziel L${ziel._lodLevel} (serviert ${ziel._servedLod}) im L0-Band — Stufe AUSSTEHEND`
                        : null,
                    zensus,
                    warum: Object.entries(warum)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 6)
                        .map(([k, n]) => `${n}× ${k}`)
                        .join(" · "),
                };
            },
            kam,
            voll
        );

    // ── 4: Schüsse ──
    const bericht = { tag: TAG, boot, spawn, schuesse: {} };
    let rot = 0;
    const schiesse = async (klasse, art, kam) => {
        let s;
        try {
            s = await page.evaluate(SCHUSS_FN, kam);
        } catch (e) {
            const linse = await page.evaluate(() => window.__uploadLinse || []).catch(() => []);
            s = { ok: false, grund: `Render-Wurf: ${String(e.message || e).split("\n")[0]}` };
            if (linse.length) s.grund += ` · Upload-Linse: ${[...new Set(linse)].slice(0, 4).join(" | ")}`;
        }
        if (!s.ok) {
            console.log(`❌ ${klasse}/${art}: ${s.grund}`);
            rot++;
            bericht.schuesse[`${klasse}-${art}`] = { ok: false, grund: s.grund, zahlen: s.zahlen };
            return;
        }
        const file = path.join(OUT, `e-${TAG}-${klasse}-${art}.png`);
        fs.writeFileSync(file, Buffer.from(s.png.split(",")[1], "base64"));
        const substanz = s.farben >= 8 && s.nonzero > 50;
        if (!substanz) rot++;
        bericht.schuesse[`${klasse}-${art}`] = {
            datei: path.relative(root, file),
            farben: s.farben,
            zahlen: s.zahlen,
            kamera: kam,
        };
        const z = s.zahlen;
        console.log(
            `${substanz ? "✅" : "❌"} ${klasse}/${art}: dc=${z.dc} tris=${z.tris} · Feld=${z.weltMarch ? `belegt ${z.weltMarch.belegt} kapseln ${z.weltMarch.kapseln} bricks ${z.weltMarch.bricks}` : "–"} · Pass=${z.feldPass ? (z.feldPass.sichtbar ? "sichtbar" : "UNSICHTBAR") : "–"} · ${path.relative(root, file)}`
        );
        if (z.herkunft && z.herkunft.length) console.log("      Herkunft (Dreiecke): " + z.herkunft.join(" · "));
    };
    const infos = await objektInfo();
    for (const klasse of ["kreatur", "baum", "haus"].filter((k) => KLASSEN.includes(k))) {
        const o = infos[klasse];
        if (!o) {
            console.log(`– ${klasse}: kein Objekt (${JSON.stringify(spawn.objekte[klasse] || {})})`);
            continue;
        }
        const suche = kameraFuer(klasse, o, 0, "fern");
        // ERST einschwingen, DANN den Blick wählen (Befund 30.09.: die Blick-Wahl vor dem Einschwingen sah eine
        // halb gebaute Mesh-Zone — danach stand ein frisch gebauter Stamm zwischen Kamera und Wolf).
        const um0 = await umstellen(suche, true);
        console.log(
            `  eingeschwungen am ${klasse}: ${um0.takte} Takte · ungebaut in der Mesh-Zone ${um0.offen}${um0.warum ? " — " + um0.warum : ""}\n      Impostor: ${um0.zensus}`
        );
        // Blick-Wahl JE SCHUSS-ART mit ihrer eigenen Distanz (Befund 30.09.: der Arm-Schuss erbte den Fern-Azimut
        // und stand im Busch vor dem Wolf).
        for (const art of ["fern", "arm"]) {
            const wahl = await page.evaluate(SICHT_FN, Object.assign({ klasse }, kameraFuer(klasse, o, 0, art)));
            console.log(
                `  Blick-Wahl ${klasse}/${art}: Azimut ${((wahl.w * 180) / Math.PI).toFixed(0)}° · ${wahl.n} Objekt-Pixel`
            );
            const k = kameraFuer(klasse, o, wahl.w, art);
            // Der Spieler steht an der Kamera (Chunk-Ring, Hand-Blase, Foundry-Stufe folgen ihm).
            const um = await umstellen(k);
            console.log(
                `  umgestellt zu ${klasse}/${art}: ${um.takte} Takte · ${um.chunks} Chunks · ungebaut in der Mesh-Zone ${um.offen}${um.warum ? " — " + um.warum : ""}${um.zielStufe ? " · ⚠ " + um.zielStufe : ""}\n      Impostor: ${um.zensus}`
            );
            const g = await page.evaluate((k) => window.anazhRealm._voxelSurfaceY(k.px, k.pz), k);
            k.py = Math.max(g + 0.35, k.augeY != null ? k.augeY : g + k.augeH);
            await schiesse(klasse, art, k);
            // ZUSTANDS-LINSE: WAS steht im Bild — Studio-Mesh oder Feld-Satz, welche Stufe serviert?
            if (klasse !== "kreatur") {
                const zst = await page.evaluate((klasse) => {
                    const r = window.anazhRealm;
                    const e = klasse === "baum" ? window.__beweisBaum : window.__beweisHaus;
                    if (!e) return "kein Eintrag";
                    const wm = r.state.weltMarch;
                    const slot = e._ziegelSlot;
                    const feldAn = !!(wm && slot && wm.listeDaten[slot.feld * 32 + 3] > 0);
                    const pp = r.state.playerMesh.position;
                    const d = Math.hypot(e.position.x - pp.x, e.position.z - pp.z);
                    return (
                        `${e.type} · ${d.toFixed(1)} m · ${e.mesh ? "Mesh" : e.instanced ? "Instanzen" : "KALT"}` +
                        ` · LOD ${e._lodLevel} (serviert ${e._servedLod}) · Studio ${r._foundryPresetForEntry(e) || "–"}` +
                        ` · Feld-Slot ${slot ? (feldAn ? "AN" : "aus") : "keiner"}`
                    );
                }, klasse);
                console.log(`      Gestalt: ${zst}`);
            }
        }
    }

    // ── 5: DIE WIESE (PFLICHT D) auf der Wolf-Bühne — nachweislich eben (die Mitte der
    // Mess-Wiese liegt im Wald: der Nahschuss dort steckte im Laub). 4 m neben dem Tier,
    // Blick vom Tier weg: fern schräg über die Wiese, Armlänge steil vor die Füße.
    const ko = spawn.objekte.kreatur;
    if (MIT_WIESE && ko && !ko.fehlt) {
        const kam = await page.evaluate((o) => {
            const r = window.anazhRealm;
            const pm = r.state.playerMesh.position;
            let dx = pm.x - o.x,
                dz = pm.z - o.z;
            const l = Math.hypot(dx, dz) || 1;
            dx /= l;
            dz /= l;
            const px = o.x + dx * 4,
                pz = o.z + dz * 4;
            const g = r._voxelSurfaceY(px, pz);
            return {
                fern: { px, py: g + 1.7, pz, lx: px + dx * 12, ly: g - 1.2, lz: pz + dz * 12 },
                arm: { px, py: g + 1.6, pz, lx: px + dx * 0.8, ly: g, lz: pz + dz * 0.8 },
            };
        }, ko);
        const um = await umstellen(kam.fern);
        console.log(`  umgestellt zur Wiese: ${um.takte} Takte · ${um.chunks} Chunks`);
        await schiesse("wiese", "fern", kam.fern);
        await schiesse("wiese", "arm", kam.arm);
        bericht.wiesePos = { x: +kam.fern.px.toFixed(1), z: +kam.fern.pz.toFixed(1) };
    }

    bericht.pageErrors = pageErrors.slice(0, 10);
    bericht.uploadLinse = [...new Set(await page.evaluate(() => window.__uploadLinse || []))].slice(0, 10);
    if (bericht.uploadLinse.length) console.log(`Upload-Linse: ${bericht.uploadLinse.join(" | ")}`);
    const teil = KLASSEN.length < 4 ? "-" + KLASSEN.join("+") : "";
    const jf = path.join(OUT, `beweis-e-${TAG}${teil}.json`);
    fs.writeFileSync(jf, JSON.stringify(bericht, null, 2));
    await browser.close();
    server.close();
    console.log(`\nBericht: ${path.relative(root, jf)} · Page-Errors: ${pageErrors.length}`);
    console.log(
        rot === 0
            ? "✅ GRÜN — jeder Schuss trägt Substanz (das URTEIL über die Gestalt ist das Bild)."
            : `❌ ROT — ${rot} Schuss/Schüsse leer.`
    );
    process.exit(rot === 0 ? 0 : 1);
})().catch((e) => {
    console.error("DIAG-FEHLER:", e);
    try {
        server.close();
    } catch (_e) {}
    process.exit(1);
});
