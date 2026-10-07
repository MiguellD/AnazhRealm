#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-ziel-zensus.cjs — DER ZIEL-ZENSUS ALS WAND (gate:ziel-zensus, 07.10., Auftrag 0710-1 P2 Familie HOST-VRAM)
//
// Befund (OMEN, GTX 1060, V18.534, Mess-Wiese, `werkbank ziele`): von 29 GPU-Texturen des Hosts (108,8 MB) hatten zwei
// keinen Leser — die r8-Farben der Schatten-Kaskaden (kaskade0:farbe, kaskade1:farbe, je 4 MB), geschrieben in k0/k1,
// gelesen von keinem Pass. Jede andere Textur der Post-Kette (Szene, Auflösung, Geschichte, drei Tiefen) hat ihren Leser
// und lebt mit ihren Formgleichen zugleich. Die Wand hält das (scripts/lib/ziel-zensus.cjs):
//   (a) ZENSUS — der echte Frame des Spiels (WebGPU auf swiftshader, Holz `kienspan`), n Frames der Bank-Runde: keine
//       Täter-Klasse fällt (ohne Leser · teilbar · volle Auflösung · Tiefe · Format), jede Textur trägt einen Erzeuger.
//   (b) KARTE OHNE FARBE — eine Schatten-Bühne in der Welt (Richtungslicht, ein r184-Schatten-Knoten durch die Hülle
//       `_kaskadenZiele`, wie jede Kaskade): der Schatten-Pass zeichnet ohne Farb-Anhang (die Farbe der Karte hat keine
//       GPU-Textur), der Schatten fällt (unter der Kiste dunkler als daneben), keine GPU-Validierung meldet sich.
//   (c) SELBSTTEST IM FRAME — je Klasse ein eingeschmuggelter Täter nach jedem `_loopRender` (`__zielSchmuggel`): jeder
//       fällt beim Namen rot, nach dem Abbau steht kein Name des Selbsttests mehr im Zensus.
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): das Urteil an gebauten Läufen — sauber grün, je Klasse ein
// Täter beim Namen.
//   node scripts/diag-ziel-zensus.cjs [--selftest]   (npm run gate:ziel-zensus; Port ZIEL_ZENSUS_PORT, Standard 4597)
// ─────────────────────────────────────────────────────────────────────────
"use strict";

const ZZ = require("./lib/ziel-zensus.cjs");

const N_FRAMES = 8;
// Der Schatten der Bühne: das Pixel unter der Kiste ist um mindestens so viel dunkler (Luma, 0–255) als das freie Licht.
const SCHATTEN_MIN = 12;

// Das Urteil der Wand über einen Lauf (rein).
function urteil(z) {
    const v = [];
    if (z.abbruch) v.push(`ABBRUCH: ${z.abbruch}`);
    for (const x of z.zensusRot || []) v.push("ZENSUS: " + x);
    const k = z.karte || {};
    if (!k.gelaufen) v.push("KARTE: die Schatten-Bühne lief nicht (die Wand ist blind für die Karte ohne Farbe)");
    else {
        if (!k.huelle) v.push("KARTE: der Schatten-Knoten der Bühne trägt die Hülle nicht (die Karte ohne Farbe ist blind)");
        if (k.farbeGpu) v.push("KARTE: die Farbe der Schatten-Karte trägt eine GPU-Textur — sie hat keinen Leser");
        if (!(k.farbAnhaenge === 0)) v.push(`KARTE: der Schatten-Pass zeichnet mit ${k.farbAnhaenge} Farb-Anhängen (Soll 0)`);
        if (!(k.schattenPaesse > 0)) v.push("KARTE: kein Schatten-Pass lief (die Probe ist blind)");
        if (!(k.dunkler >= SCHATTEN_MIN))
            v.push(`KARTE: unter der Kiste ist es nur ${k.dunkler} dunkler als daneben (Soll ≥ ${SCHATTEN_MIN}) — der Schatten fällt nicht`);
    }
    for (const f of z.gpuFehler || []) v.push("GPU: " + f);
    for (const f of z.seitenFehler || []) v.push("SEITE: " + f);
    const s = z.selbst || [];
    if (!s.length) v.push("SELBSTTEST: der Schmuggel lief nicht");
    for (const x of s) if (!x.ok) v.push(`SELBSTTEST: blind für ${x.muss}`);
    if ((z.rest || []).length) v.push(`SELBSTTEST: nach dem Abbau noch im Zensus: ${z.rest.join(", ")}`);
    return v;
}

function selbsttest() {
    const fehler = ZZ.selbsttest().map((s) => "Zensus-Urteil: " + s);
    const gruen = {
        zensusRot: [],
        karte: { gelaufen: true, huelle: true, farbeGpu: false, farbAnhaenge: 0, schattenPaesse: 3, dunkler: 60 },
        gpuFehler: [],
        seitenFehler: [],
        selbst: [{ muss: "OHNE LESER", ok: true }],
        rest: [],
    };
    if (urteil(gruen).length) fehler.push("der grüne Lauf fällt rot: " + urteil(gruen).join(" · "));
    const mit = (f) => {
        const z = JSON.parse(JSON.stringify(gruen));
        f(z);
        return z;
    };
    const faelle = [
        { name: "Täter im Zensus", z: mit((z) => (z.zensusRot = ["OHNE LESER: kaskade0:farbe"])), muss: /ZENSUS: OHNE LESER/ },
        { name: "Farbe auf der GPU", z: mit((z) => (z.karte.farbeGpu = true)), muss: /trägt eine GPU-Textur/ },
        { name: "Farb-Anhang im Schatten-Pass", z: mit((z) => (z.karte.farbAnhaenge = 1)), muss: /mit 1 Farb-Anhängen/ },
        { name: "Schatten fällt nicht", z: mit((z) => (z.karte.dunkler = 1)), muss: /der Schatten fällt nicht/ },
        { name: "Hülle fehlt", z: mit((z) => (z.karte.huelle = false)), muss: /trägt die Hülle nicht/ },
        { name: "Bühne blind", z: mit((z) => (z.karte = {})), muss: /lief nicht/ },
        { name: "GPU-Validierung", z: mit((z) => (z.gpuFehler = ["Attachment state mismatch"])), muss: /GPU: Attachment/ },
        { name: "Schmuggel blind", z: mit((z) => (z.selbst = [{ muss: "TEILBAR", ok: false }])), muss: /blind für TEILBAR/ },
        { name: "Schmuggel bleibt", z: mit((z) => (z.rest = ["zensus-selbsttest:bloom"])), muss: /noch im Zensus/ },
    ];
    for (const f of faelle) {
        const v = urteil(f.z);
        const ok = v.some((s) => f.muss.test(s));
        if (!ok) fehler.push(`${f.name}: die Wand nennt den Täter nicht (${f.muss})`);
        console.log(`  ${ok ? "✅" : "❌"} Selbsttest „${f.name}" → ${v.join(" · ") || "(grün)"}`);
    }
    return fehler;
}

if (process.argv.includes("--selftest")) {
    console.log("=== ZIEL-ZENSUS — Selbsttest (ohne Browser) ===");
    const f = selbsttest();
    if (f.length) {
        console.log("\n❌ SELBSTTEST ROT — die Wand ist vakuös: " + f.join(" · "));
        process.exit(1);
    }
    console.log("\n✅ SELBSTTEST GRÜN — das Urteil nennt jeden gebauten Täter beim Namen, der saubere Lauf bleibt grün.");
    process.exit(0);
}

const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { softwareWebGpuArgs } = require("./lib/software-gpu.cjs");
const { vramAbgriff } = require("./lib/vram-abgriff.cjs");
const { FALTE_INSTALL, ZAEHLER_INSTALL } = require("./lib/draw-zaehler.cjs");
const { ZERLEGE_INSTALL } = require("./lib/zerlege-linse.cjs");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.ZIEL_ZENSUS_PORT) || 4597;
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".png": "image/png",
    ".wasm": "application/wasm",
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

// DIE SCHATTEN-BÜHNE (Seite): ein Richtungslicht mit einem r184-Schatten-Knoten, der durch die Hülle der Kaskaden geht
// (`_kaskadenZiele`), eine Kiste über einem Boden, eine Kamera von oben. Gezählt: die Farb-Anhänge jedes Passes, der in
// die Schatten-Karte zeichnet, und die GPU-Textur ihrer Farbe; das Bild: Luma unter der Kiste gegen freies Licht.
function karteOhneFarbe() {
    return (async () => {
        const r = window.anazhRealm,
            st = r.state,
            T = window.THREE,
            TSL = T.TSL;
        const rend = st.renderer;
        const be = rend.backend;
        const aus = { gelaufen: false };
        const schattenAlt = rend.shadowMap.enabled;
        rend.shadowMap.enabled = true;
        const szene = new T.Scene();
        szene.name = "ziel-zensus:schatten-buehne";
        const licht = new T.DirectionalLight(0xffffff, 3);
        // schräges Licht (von +x): der Schatten der Kiste fällt links neben sie (Boden x ∈ [−8,5; −6]), sichtbar von oben
        licht.position.set(10, 20, 0);
        licht.castShadow = true;
        licht.shadow.mapSize.set(256, 256);
        Object.assign(licht.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 0.5, far: 50 });
        licht.shadow.camera.updateProjectionMatrix();
        const sn = TSL.shadow(licht, licht.shadow);
        licht.shadow.shadowNode = sn;
        r._kaskadenZiele({ _shadowNodes: [sn] });
        aus.huelle = Object.prototype.hasOwnProperty.call(sn, "setupRenderTarget");
        szene.add(licht, licht.target, new T.AmbientLight(0xffffff, 0.2));
        const boden = new T.Mesh(new T.PlaneGeometry(20, 20), new T.MeshStandardNodeMaterial({ color: 0xc8c8c8 }));
        boden.rotation.x = -Math.PI / 2;
        boden.receiveShadow = true;
        const kiste = new T.Mesh(new T.BoxGeometry(4, 4, 4), new T.MeshStandardNodeMaterial({ color: 0x806040 }));
        kiste.position.set(-4, 3, 0);
        kiste.castShadow = true;
        szene.add(boden, kiste);
        const kam = new T.OrthographicCamera(-10, 10, 10, -10, 0.1, 100);
        kam.position.set(0, 40, 0);
        kam.up.set(0, 0, -1);
        kam.lookAt(0, 0, 0);
        kam.updateMatrixWorld(true);
        const ziel = new T.RenderTarget(64, 64, { depthBuffer: true });
        ziel.texture.name = "ziel-zensus:schatten-bild";
        // die Pässe in die Schatten-Karte: ihre Tiefe ist die Karten-Tiefe (DepthTexture des Schatten-Ziels)
        let schattenPaesse = 0,
            farbAnhaenge = 0;
        const CE = GPUCommandEncoder.prototype;
        const brp = CE.beginRenderPass;
        CE.beginRenderPass = function (d) {
            const ds = d && d.depthStencilAttachment;
            const t = ds && window.__viewTex ? window.__viewTex.get(ds.view) : null;
            if (t && /^kaskade\d+:tiefe/.test(String(t.__vramK || "").replace(/^tex:/, ""))) {
                schattenPaesse++;
                farbAnhaenge += ((d && d.colorAttachments) || []).filter(Boolean).length;
            }
            return brp.call(this, d);
        };
        try {
            for (let i = 0; i < 3; i++) {
                rend.setRenderTarget(ziel);
                rend.render(szene, kam);
            }
            rend.setRenderTarget(null);
            await be.device.queue.onSubmittedWorkDone();
            const px = await rend.readRenderTargetPixelsAsync(ziel, 0, 0, 64, 64);
            const u8 = px instanceof Uint8Array ? px : new Uint8Array(px.buffer || px);
            const zeile = u8.length / 64;
            const lum = (x, y) => {
                const i = y * zeile + x * 4;
                return 0.2126 * u8[i] + 0.7152 * u8[i + 1] + 0.0722 * u8[i + 2];
            };
            // Draufsicht (rechts = +x, Spalte = (x + 10) / 20 · 64, Zeile 32 = z 0): der Schatten bei x = −7,25 (Spalte 9),
            // freies Licht bei x = +6 (Spalte 51)
            const schatten = lum(9, 32),
                frei = lum(51, 32);
            aus.dunkler = +(frei - schatten).toFixed(1);
            aus.luma = [+schatten.toFixed(1), +frei.toFixed(1)];
            const map = licht.shadow.map;
            aus.farbeGpu = !!(map && map.texture && be.has(map.texture) && be.get(map.texture).texture);
            aus.schattenPaesse = schattenPaesse;
            aus.farbAnhaenge = farbAnhaenge;
            aus.gelaufen = true;
        } finally {
            CE.beginRenderPass = brp;
            rend.shadowMap.enabled = schattenAlt;
            ziel.dispose();
        }
        return aus;
    })();
}

(async () => {
    console.log("=== ZIEL-ZENSUS — die Wand am echten Frame (WebGPU auf swiftshader) ===");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 900000, args: softwareWebGpuArgs() });
    const page = await browser.newPage();
    await page.setViewport({ width: 320, height: 240 });
    await page.evaluateOnNewDocument(FALTE_INSTALL);
    await page.evaluateOnNewDocument(vramAbgriff);
    const seitenFehler = [];
    page.on("pageerror", (e) => seitenFehler.push((e.stack || e.message || String(e)).split("\n")[0]));
    const T0 = Date.now();
    const log = (z) => console.log(`  [${Math.round((Date.now() - T0) / 1000)} s] ${z}`);
    let out = {};
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html?holz=kienspan`, { waitUntil: "domcontentloaded", timeout: 60000 });
        const bereit = await page.evaluate(async () => {
            const t0 = performance.now();
            while (performance.now() - t0 < 300000) {
                const r = window.anazhRealm;
                const st = r && r.state;
                if (st && st.rendererReady && st.renderer && st.renderer.backend && st.postProcessing && st.camera)
                    return { ok: true, ms: Math.round(performance.now() - t0), webgpu: st.renderer.backend.isWebGPUBackend === true };
                await new Promise((res) => setTimeout(res, 100));
            }
            return { ok: false };
        });
        if (!bereit.ok) throw new Error("Renderer und Post-Kette standen nach 300 s nicht");
        if (!bereit.webgpu) throw new Error("kein WebGPU-Backend — der Zensus liest GPU-Befehle, die Wand wäre blind");
        log(`Renderer und Post-Kette bereit nach ${Math.round(bereit.ms / 1000)} s`);
        await page.evaluate(ZAEHLER_INSTALL);
        await page.evaluate(ZERLEGE_INSTALL);
        await page.evaluate(ZZ.ZIEL_INSTALL);
        await page.evaluate(() => {
            const r = window.anazhRealm;
            r.state.renderer.setAnimationLoop(null);
            window.__gpuFehlerZ = [];
            r.state.renderer.backend.device.addEventListener("uncapturederror", (e) =>
                window.__gpuFehlerZ.push(String((e.error && e.error.message) || e.message || e).slice(0, 240))
            );
        });
        const zensus = async () => {
            const z = await page.evaluate((k) => window.__zielZensus(k), { n: N_FRAMES });
            if (!z || z.fehler) return { z, u: ZZ.zielUrteil(z, []) };
            const ids = z.ziele
                .filter((x) => !x.leinwand && !x.tiefe && x.kopierbar && /^(r|rg|rgba|bgra)(8|16|32)/.test(x.format))
                .map((x) => x.id);
            const lesen = await page.evaluate((k) => window.__zielLesen(k), { ids });
            return { z, u: ZZ.zielUrteil(z, lesen) };
        };
        // (c) der Schmuggel zuerst: jeder Täter beim Namen, danach restlos fort
        const s = await page.evaluate(() => window.__zielSchmuggel(true));
        if (!s || s.fehler) throw new Error("Schmuggel: " + ((s && s.fehler) || "keine Antwort"));
        let mit;
        try {
            mit = await zensus();
        } finally {
            await page.evaluate(() => window.__zielSchmuggel(false));
        }
        const soll = [
            /OHNE LESER: zensus-selbsttest:ohne-leser/,
            /VOLLE AUFLÖSUNG: zensus-selbsttest:bloom/,
            /TEILBAR: zensus-selbsttest:paar-a und zensus-selbsttest:paar-b/,
            /DOPPELTE TIEFE: zensus-selbsttest:tiefe-kopie .* ist eine Kopie von depth,/,
            /FORMAT: zensus-selbsttest:f32 /,
        ];
        out.selbst = soll.map((m) => ({ muss: m.source, ok: mit.u.rot.some((x) => m.test(x)) }));
        log(`Schmuggel: ${out.selbst.filter((x) => x.ok).length} von ${soll.length} Tätern beim Namen`);
        // (a) der Zensus des echten Frames
        const { z, u } = await zensus();
        out.zensusRot = u.rot;
        out.rest = u.zeilen.filter((x) => /zensus-selbsttest/.test(x.name)).map((x) => x.name);
        log(`Zensus: ${u.zeilen.length} Texturen, ${z.frames} Frames, ${u.rot.length} rot, ${u.hinweis.length} Hinweise`);
        if (process.env.ZIEL_ZENSUS_TABELLE) console.log(ZZ.zielTabelle(u, z));
        // (b) die Karte ohne Farbe
        out.karte = await page.evaluate(karteOhneFarbe);
        log(`Karte ohne Farbe: ${JSON.stringify(out.karte)}`);
        out.gpuFehler = await page.evaluate(() => window.__gpuFehlerZ.slice(0, 5));
    } catch (e) {
        out.abbruch = (e && e.message) || String(e);
    }
    await browser.close();
    server.close();
    out.seitenFehler = seitenFehler.slice(0, 5);
    const v = urteil(out);
    if (v.length) {
        console.log(`\n❌ ROT — ${v.length} Verletzung(en):`);
        for (const s of v) console.log("   • " + s);
        process.exit(1);
    }
    console.log(
        `\n✅ GRÜN — kein Ziel ohne Leser, keine Klasse fällt; die Schatten-Karte zeichnet ohne Farbe (${out.karte.schattenPaesse} Pässe, ` +
            `0 Farb-Anhänge, Schatten ${out.karte.dunkler} dunkler); ${out.selbst.length} eingeschmuggelte Täter beim Namen und restlos fort.`
    );
})();
