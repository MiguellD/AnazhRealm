// diag-foundry-impostor.cjs — P5/BÄCKER-VEREINIGUNGS-BEWEIS: die Welt-Fernstufe konsumiert den
// STUDIO-Bäcker (Foundry-Worker-Kanal "bake-impostor"), der Welt-RTT-Nachbau + das GL-Bake-iframe
// sind GESCHNITTEN. Zwei Teile:
//   A (Null-Renderer, HART): die MECHANIK — `_foundryEnsureImpostorRecord` legt einen Record mit
//     `foundry:true` + Frame + Fallback-Atlas an; der Bake-Tick spricht den Kanal "bake-impostor"
//     (kein RTT-Nachbau: `_bakeImpostorAtlasRTT` weg); KEIN asset-foundry-iframe im DOM; die drei
//     iframe-Methoden sind weg. Headless enqueued NIE (Silhouetten-Fallback trägt, gate-treu).
//   B (echter swiftshader-Renderer, BEST-EFFORT): der Studio-Bake läuft (`__impostorRttBaked` steigt)
//     ohne page-error. Der LOOK des Atlas bleibt das Schöpfer-Auge (echte GPU); hier zählt „läuft, crasht nicht".
//   node scripts/diag-foundry-impostor.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.FIMP_PORT || 4595);
const root = path.resolve(__dirname, "..");
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

async function bootPage(browser, nullRenderer) {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument((nr) => {
        window.__anazhForceFoundry = true;
        if (nr) window.__anazhHeadlessNullRenderer = true;
    }, nullRenderer);
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const dl = performance.now() + 60000;
        while (
            (!window.anazhRealm ||
                !window.anazhRealm.state ||
                typeof window.anazhRealm._gameLoopTick !== "function" ||
                typeof window.anazhRealm._foundryEnsureImpostorRecord !== "function") &&
            performance.now() < dl
        )
            await new Promise((r) => setTimeout(r, 100));
    });
    return { page, pageErrors };
}

// Wartet, bis der Foundry-Worker ready ist + ein Impostor-Record steht (die LOD1-Geometrie lädt async).
async function driveImpostor(page) {
    return await page.evaluate(async () => {
        const r = window.anazhRealm;
        const out = { ready: false, rec: null, err: null, hasIframe: null, cutMethods: null };
        try {
            const f = r._ensureAssetFoundry();
            const dl = performance.now() + 60000;
            while (f && !f.ready && performance.now() < dl) await new Promise((res) => setTimeout(res, 50));
            out.ready = !!(f && f.ready);
            if (!out.ready) {
                out.err = "Worker nicht ready";
                return out;
            }
            // (die Vereinigungs-Proben unten brauchen den Record — rec bleibt im Scope)
            // Den Impostor-Record treiben: erst lädt die LOD1-Geometrie (null), dann steht der Record.
            let rec = null;
            const dl2 = performance.now() + 45000;
            while (performance.now() < dl2) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                const v = r._foundryEnsureImpostorRecord("eiche", 0, "summer");
                if (v && v !== true) {
                    rec = v;
                    break;
                }
                await new Promise((res) => setTimeout(res, 30));
            }
            if (rec) {
                out.rec = {
                    foundry: rec.foundry === true,
                    hasMap: !!rec.map,
                    hasFrame: !!(rec.frame && rec.frame.halfH > 0),
                    views: rec.views,
                };
            }
            // BÄCKER-VEREINIGUNG: der Bake-Tick spricht den Studio-Kanal, der RTT-Nachbau ist weg.
            const strip = (x) =>
                String(x)
                    .replace(/\/\*[\s\S]*?\*\//g, "")
                    .replace(/\/\/[^\n]*/g, "");
            out.vereinigung = {
                kanalImTick: /bake-impostor|_foundryBakeImpostorRequest/.test(strip(r._tickImpostorBake)),
                requestMethode: typeof r._foundryBakeImpostorRequest === "function",
                payloadKonsument: typeof r._applyStudioImpostorPayload === "function",
                rttNachbau: typeof r._bakeImpostorAtlasRTT,
                bakeLeavesWeg: !(rec && rec._foundryBakeLeaves),
            };
            // Kein asset-foundry-iframe im DOM (das Bake-iframe ist geschnitten).
            out.hasIframe = !!document.querySelector('iframe[src*="asset-foundry"]');
            // Die drei iframe-Methoden sind weg.
            out.cutMethods = {
                requestImpostor: typeof r._foundryRequestImpostor,
                ensureBakeIframe: typeof r._foundryEnsureBakeIframe,
                buildImpostorRecord: typeof r._foundryBuildImpostorRecord,
            };
            out.rttBaked = (typeof window !== "undefined" && window.__impostorRttBaked) || 0;
            // Den Bake-Tick pumpen (echter Renderer bäckt async über mehrere Frames).
            for (let i = 0; i < 40; i++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                await new Promise((res) => setTimeout(res, 30));
                if ((window.__impostorRttBaked || 0) > out.rttBaked) break;
            }
            out.rttBakedAfter = (typeof window !== "undefined" && window.__impostorRttBaked) || 0;
            out.rttErrorAfter = (typeof window !== "undefined" && window.__impostorRttError) || null;
        } catch (e) {
            out.err = (e && e.message) || String(e);
        }
        return out;
    });
}

// ===== TEIL C — DIE KAMERA-KLEBER-WAND (18.07., Schöpfer: „Felsen/Kristalle/Autos/
// Feueresse hängen an der Kamera, drehen mit dem Kopf mit") =====
// Wurzel: _archGroupFree lässt die Null-3×3 mit lebender Translation zurück; der
// Impostor-positionNode baut das Quad aus Translation + Normal-Probe NEU — der
// singulär gewordene Probe (0/0-Normierung des InstanceNode) machte den toten Slot
// zu einem welt-spannenden camera-facing Quad (NaN bzw. _sInst≈1e5). Die Wand:
// _lebt = probe²>1e-12 (false für 0 UND NaN) + select statt Arithmetik (NaN·0=NaN!)
// ⇒ toter Slot: _sInst=0 UND _alpha=0. Diese Probe beweist KONSUM auf echter GPU:
//   (1) SELBSTTEST — ein Monster-Slot (Skala 1000, probe²>1e-12 ⇒ lebt) MUSS den
//       Schirm fluten: die Linse SIEHT Müll, wenn Müll existiert.
//   (2) DIE WAND — derselbe Slot durch den ECHTEN Free-Chokepoint (_archGroupFree)
//       befreit ⇒ ~0 Pixel in seiner Schirm-Hälfte; der lebende Slot zeichnet weiter.
// Läuft in Seite A (Null-Renderer-Spiel) mit FRISCHEM in-page WebGPURenderer —
// exakt das gate:fern-ring-Band-8-Muster (swiftshader-real, deterministisch).
async function kleberProbe(page) {
    return await page.evaluate(async () => {
        const r = window.anazhRealm;
        const out = { err: null };
        try {
            const T = THREE;
            // Record + Material durch die ECHTEN Chokepoints münzen. Eigener Key
            // (frische Material-Signatur) + foundryCrossfade aus, damit die Nah-
            // Ausblendung des Crossfades die Probe nicht maskiert.
            const prevCf = r.state.foundryCrossfade;
            r.state.foundryCrossfade = false;
            const rec = r._ensureImpostorAtlas("gateKleber|0", { totalH: 8, anchors: [{ x: 2, z: 0 }] });
            out.recDa = !!(rec && rec.map && rec.nmap);
            const mat = r._sharedFoliageMaterial({
                vertexColors: true,
                useInstanceTint: true,
                useFlexAttr: true,
                impostorKey: "gateKleber|0",
                side: T.DoubleSide,
            });
            r.state.foundryCrossfade = prevCf;
            out.billboard = !!(mat && mat.userData && mat.userData.impostorBillboard);
            if (!out.billboard) {
                out.err = "Impostor-TSL-Wiring fehlgeschlagen: " + (window.__impostorAtlasError || "unbekannt");
                return out;
            }
            // Achsen-Quad exakt nach dem Impostor-Rezept: Verts AUF der Stammachse,
            // Fläche entsteht NUR über positionNode (aImpX × dekodierte Instanz-Skala).
            const h = 8,
                w = 4;
            const geo = new T.BufferGeometry();
            geo.setAttribute("position", new T.Float32BufferAttribute([0, 0, 0, 0, 0, 0, 0, h, 0, 0, h, 0], 3));
            geo.setAttribute("normal", new T.Float32BufferAttribute([1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0], 3));
            geo.setAttribute("color", new T.Float32BufferAttribute([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], 3));
            geo.setAttribute("uv", new T.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 1, 1], 2));
            geo.setAttribute("aImpX", new T.Float32BufferAttribute([-w, w, -w, w], 1));
            geo.setAttribute("aFlex", new T.Float32BufferAttribute([0, 0, 0, 0], 1));
            geo.setIndex([0, 1, 2, 2, 1, 3]);
            const mesh = new T.InstancedMesh(geo, mat, 2);
            mesh.frustumCulled = false;
            const M = new T.Matrix4();
            // Slot 0 (LEBT): links im Bild.
            M.compose(new T.Vector3(-6, 0, 0), new T.Quaternion(), new T.Vector3(1, 1, 1));
            mesh.setMatrixAt(0, M);
            // Slot 1 (erst MONSTER, dann befreit): rechts im Bild.
            M.compose(new T.Vector3(6, 0, 0), new T.Quaternion(), new T.Vector3(1000, 1000, 1000));
            mesh.setMatrixAt(1, M);
            mesh.count = 2;
            mesh.instanceMatrix.needsUpdate = true;
            const szene = new T.Scene();
            szene.add(mesh);
            szene.add(new T.AmbientLight(0xffffff, 3));
            const cam = new T.PerspectiveCamera(60, 1.5, 0.5, 500);
            cam.position.set(0, 4, 26);
            cam.lookAt(0, 4, 0);
            cam.updateMatrixWorld(true);
            const ren = new T.WebGPURenderer({ antialias: false });
            await ren.init();
            ren.setSize(96, 64, false);
            const rt = new T.RenderTarget(96, 64);
            ren.setRenderTarget(rt);
            const zaehle = async () => {
                await ren.renderAsync(szene, cam);
                const buf = await ren.readRenderTargetPixelsAsync(rt, 0, 0, 96, 64);
                let links = 0,
                    rechts = 0;
                for (let y = 0; y < 64; y++)
                    for (let x = 0; x < 96; x++) {
                        if (buf[(y * 96 + x) * 4 + 3] > 0) {
                            if (x < 48) links++;
                            else rechts++;
                        }
                    }
                return { links, rechts };
            };
            // (1) SELBSTTEST: der Monster-Slot MUSS Pixel fluten (die Linse sieht Müll).
            const vorher = await zaehle();
            out.monsterPx = vorher.links + vorher.rechts;
            // (2) DIE WAND: Slot 1 durch den ECHTEN Free-Chokepoint befreien.
            const fakeG = { mesh, free: [], slotEntry: null, liveCount: 2 };
            r._archGroupFree(fakeG, 1);
            out.freeNull3x3 = (() => {
                const chk = new T.Matrix4();
                mesh.getMatrixAt(1, chk);
                const e = chk.elements;
                return e[0] === 0 && e[5] === 0 && e[10] === 0 && Math.abs(e[12] - 6) < 1e-6;
            })();
            const nachher = await zaehle();
            out.lebtPx = nachher.links;
            out.totPx = nachher.rechts;
            ren.dispose();
        } catch (e) {
            out.err = (e && e.message) || String(e);
        }
        return out;
    });
}

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const errs = [];

    // ===== TEIL A — MECHANIK (Null-Renderer, HART) =====
    const browserA = await puppeteer.launch({
        headless: true,
        protocolTimeout: 180000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const { page: pageA, pageErrors: errA } = await bootPage(browserA, true);
    const A = await driveImpostor(pageA);
    const C = await kleberProbe(pageA);
    await browserA.close();

    console.log("=== P5/BÄCKER-VEREINIGUNG — TEIL A: MECHANIK (Null-Renderer) ===");
    console.log(`  Worker ready: ${A.ready}`);
    console.log(`  Impostor-Record: ${JSON.stringify(A.rec)}`);
    console.log(`  Vereinigung (Kanal/Methoden/kein Nachbau): ${JSON.stringify(A.vereinigung)}`);
    console.log(`  asset-foundry-iframe im DOM: ${A.hasIframe} (erwartet false)`);
    console.log(`  iframe-Methoden (erwartet 3x undefined): ${JSON.stringify(A.cutMethods)}`);
    if (A.err) console.log(`  Fehler: ${A.err}`);
    if (errA.length) console.log("  Seiten-Fehler A:", errA.slice(0, 3));

    if (!A.ready) errs.push("A: der Worker wurde nicht ready");
    if (!A.rec) errs.push("A: kein Impostor-Record entstanden (die LOD1-Geometrie lud nicht?)");
    else {
        if (!A.rec.foundry) errs.push("A: der Record traegt NICHT die foundry-Flagge (falscher Pfad)");
        if (!A.rec.hasMap) errs.push("A: der Record hat keinen Atlas-Fallback (map)");
        if (!A.rec.hasFrame) errs.push("A: der Record hat keinen Frame");
    }
    if (A.vereinigung) {
        if (!A.vereinigung.kanalImTick)
            errs.push("A: `_tickImpostorBake` spricht NICHT den Studio-Kanal (bake-impostor)");
        if (!A.vereinigung.requestMethode) errs.push("A: `_foundryBakeImpostorRequest` fehlt");
        if (!A.vereinigung.payloadKonsument) errs.push("A: `_applyStudioImpostorPayload` fehlt");
        if (A.vereinigung.rttNachbau !== "undefined")
            errs.push(`A: der RTT-Nachbau `+"`_bakeImpostorAtlasRTT`"+` lebt noch (${A.vereinigung.rttNachbau})`);
        if (!A.vereinigung.bakeLeavesWeg) errs.push("A: der Record traegt noch `_foundryBakeLeaves` (totes Bake-Subjekt)");
    } else if (A.ready) errs.push("A: die Vereinigungs-Proben liefen nicht");
    if (A.hasIframe) errs.push("A: ein asset-foundry-iframe LEBT noch im DOM (P3b nicht geschnitten)");
    if (A.cutMethods) {
        for (const [k, v] of Object.entries(A.cutMethods))
            if (v !== "undefined") errs.push(`A: die iframe-Methode ${k} existiert noch (${v})`);
    }
    if (errA.length) errs.push(`A: ${errA.length} Seiten-Fehler`);

    console.log("\n=== TEIL C — DIE KAMERA-KLEBER-WAND (tote Impostor-Slots zeichnen NICHTS) ===");
    console.log(`  Record/Billboard-Wiring: ${C.recDa}/${C.billboard}`);
    console.log(`  Selbsttest Monster-Slot (Skala 1000) Pixel: ${C.monsterPx} (Linse MUSS Müll sehen)`);
    console.log(`  Free-Chokepoint Null-3×3+Translation: ${C.freeNull3x3}`);
    console.log(`  nach _archGroupFree — lebender Slot: ${C.lebtPx} px · toter Slot: ${C.totPx} px`);
    if (C.err) console.log(`  Fehler: ${C.err}`);
    if (C.err) errs.push(`C: Kleber-Probe brach ab — ${C.err}`);
    else {
        if (!C.billboard) errs.push("C: das Impostor-TSL-Wiring kam nicht zustande (kein Billboard-Marker)");
        if (!(C.monsterPx > 200))
            errs.push(`C-SELBSTTEST: der Monster-Slot flutete den Schirm NICHT (${C.monsterPx} px) — die Linse ist blind`);
        if (!C.freeNull3x3) errs.push("C: _archGroupFree schrieb nicht die erwartete Null-3×3 mit lebender Translation");
        if (!(C.lebtPx > 40)) errs.push(`C: der LEBENDE Slot zeichnet zu wenig (${C.lebtPx} px ≤ 40) — die Probe ist blind`);
        if (!(C.totPx <= 8))
            errs.push(`C: der TOTE Slot zeichnet noch ${C.totPx} px (> 8) — die Kamera-Kleber-Wand hält NICHT`);
    }

    // ===== TEIL B — DER RTT-BAKE LÄUFT (echter swiftshader-Renderer, OPT-IN) =====
    // NUR mit P5_REAL_RENDERER=1: zwei swiftshader-Seiten verhungern den Container-Event-Loop
    // (dokumentiert) → per Default aus, damit der Gate deterministisch bleibt. Der RTT-LOOK ist
    // ohnehin das Schöpfer-Auge auf echter GPU; die MECHANIK (Teil A) ist der hardware-unabhängige Beweis.
    if (process.env.P5_REAL_RENDERER) {
        console.log("\n=== P5 — TEIL B: RTT-BAKE auf echtem Renderer (opt-in) ===");
        try {
        const browserB = await puppeteer.launch({
            headless: true,
            protocolTimeout: 180000,
            args: [
                "--use-angle=swiftshader",
                "--enable-unsafe-swiftshader",
                "--no-sandbox",
                "--disable-setuid-sandbox",
            ],
        });
        const { page: pageB, pageErrors: errB } = await bootPage(browserB, false);
        const B = await driveImpostor(pageB);
        await browserB.close();
        console.log(`  Worker ready: ${B.ready} · Record foundry: ${B.rec && B.rec.foundry}`);
        console.log(`  RTT gebacken (nach Pump): ${B.rttBakedAfter} · RTT-Fehler: ${B.rttErrorAfter || "keiner"}`);
        if (errB.length) {
            console.log("  Seiten-Fehler B:", errB.slice(0, 3));
            errs.push(`B: ${errB.length} Seiten-Fehler beim RTT-Pfad`);
        }
        if (B.err) console.log(`  (B-Notiz: ${B.err})`);
            if (B.rttBakedAfter > 0) console.log("  ok — der RTT-Bake lief auf echter GPU-Bahn (Atlas gebacken).");
            else console.log("  (RTT nicht abgeschlossen — swiftshader-fragil; der LOOK ist das Schoepfer-Auge.)");
        } catch (e) {
            console.log(`  (Teil B uebersprungen — Renderer-Start fehlgeschlagen: ${(e && e.message) || e})`);
        }
    } else {
        console.log("\n(Teil B [echter RTT-Bake] per Default aus — mit P5_REAL_RENDERER=1 aktivieren; der LOOK ist das Schoepfer-Auge.)");
    }

    server.close();
    if (errs.length) {
        console.error("\n❌ ROT:");
        for (const e of errs) console.error("  • " + e);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — die Welt-Fernstufe konsumiert den STUDIO-Bäcker (Kanal bake-impostor, foundry-Record + Frame), der Welt-RTT-Nachbau + das GL-Bake-iframe sind geschnitten (kein DOM-iframe, die Methoden weg). Der Atlas-LOOK ist das Schoepfer-Auge auf echter GPU."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Foundry-Impostor-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
