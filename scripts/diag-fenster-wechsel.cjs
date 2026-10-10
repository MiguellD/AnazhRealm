// diag-fenster-wechsel.cjs — DIE FENSTER-WAND (npm run gate:fenster-wechsel).
//
// Befund 03.10. (echte GPU, Radeon 890M): ein Fenster-Wechsel machte die Welt für immer SCHWARZ — die Textur-Bindung des
// Wassers (des Lesers der Szenen-Tiefe) zog nach `renderer.setSize` nicht nach („Destroyed texture … used in a submit").
// Befund 09.10. (Leben-Schau 2, laufender Loop): 264× „Destroyed texture [Texture "szene:tiefenabbild"]" beim Vergrößern und
// Maximieren (DPR 2) — die Pixel-Ratio stellt die DPR-Kappe (`_applyRenderScale` → `setPixelRatio`) Frames NACH dem resize-
// Ereignis. Die Wurzel beider: die Observer-Diät sah das neu angelegte Tiefen-Abbild nie. Der EINE Schnitt ist der Vorher-
// Textur-Wächter der Diät (`_diaetVorTextur`); der Wasser-Neubau im resize-Handler war sein Zwilling und ist gefallen
// (0910-3 A, Gegenprüfung; der Name steht in gate:altlasten).
//
// Die Wand fährt den ECHTEN Frame: WebGPU auf swiftshader, das Software-Holz (`?holz=kienspan`) mit der Pixel-Kappe des
// Holzes nah (1,25 — die Kappe, die ein DPR-Wechsel trifft), am Ufer des Bachs der Mess-Wiese (das Wasser liest das Tiefen-
// Abbild), der Spiel-Loop LÄUFT. Je Schritt zählt die Wand gerendete Frames (die GPU-Leine), nie die Wanduhr:
//   (dazu das Fern-Wasser, der ruhende Leser des Holzes voll — das Software-Holz schaltet es ab)
//   E1  vergrößern (640×360 → 704×396) — das resize-Ereignis, die Szenen-Tiefe wird neu angelegt
//   E2  DPR 2 — die Kappe stellt die Pixel-Ratio auf 1,25, Frames nach dem Ereignis
//   E3  zurück (640×360, DPR 1)
//   E4  die Pixel-Ratio ALLEIN (1,25, dann 1), wie die Kappe sie stellt, ohne resize-Ereignis
//   je Schritt ROT bei JEDER WebGPU-Validierung beim Namen (Device-Meldung und GPU-Wache des Stamms)
//   E5  nicht vakuös: das Wasser zeichnet, das Abbild wurde je Größe neu angelegt, die Pixel-Ratio folgte DPR und Kappe
//   K   kein Zwilling: der resize-Handler baut keinen Leser der Szenen-Tiefe neu (Quelle, kommentarfrei)
//   ES  Selbsttest am echten Frame: ohne den Wächter (`_diaetVorTextur` → false) MÜSSEN ein Größen- und ein Pixel-Ratio-
//       Schritt „Destroyed texture … szene:tiefenabbild" beim Namen zeigen
//
//   node scripts/diag-fenster-wechsel.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { softwareWebGpuArgs } = require("./lib/software-gpu.cjs");
const { ladeSpec } = require("./lib/band-urteil.cjs");

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

let ok = true;
const check = (name, cond, detail) => {
    console.log(`  ${cond ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!cond) ok = false;
};

// K: der Körper des resize-Handlers (kommentarfrei) — kein Leser der Szenen-Tiefe wird dort neu gebaut
function resizeKoerper(src) {
    const i = src.indexOf('window.addEventListener("resize"');
    if (i < 0) return null;
    const ende = src.indexOf("});", i);
    return src
        .slice(i, ende)
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/.*$/gm, "");
}

// vor jedem Seiten-Skript — die Device-Meldungen je Schritt (`__fensterEcht.schritt` setzt die Wand)
function fensterSammler() {
    const S = (window.__fensterEcht = { schritt: "boot", gpu: {} });
    if (typeof GPUAdapter === "undefined") return;
    const rd = GPUAdapter.prototype.requestDevice;
    GPUAdapter.prototype.requestDevice = async function (d) {
        const dev = await rd.call(this, d);
        try {
            dev.addEventListener("uncapturederror", (ev) => {
                const k = String((ev.error && ev.error.message) || ev.error)
                    .split("\n")[0]
                    .slice(0, 160);
                const p = S.gpu[S.schritt] || (S.gpu[S.schritt] = {});
                p[k] = (p[k] || 0) + 1;
            });
        } catch (_e) {}
        return dev;
    };
}

// der Spieler am Ufer des Bachs der Mess-Wiese, Blick übers Wasser, die Pixel-Kappe des Holzes nah; zurück, sobald das
// Wasser zeichnet und das Tiefen-Abbild gezogen ist (der Loop läuft)
async function uferStellen(opts) {
    const warte = (ms) => new Promise((q) => setTimeout(q, ms));
    const t0 = performance.now();
    let r = null,
        st = null;
    while (performance.now() - t0 < 300000) {
        r = window.anazhRealm;
        st = r && r.state;
        if (st && st.rendererReady && st.renderer && st.renderer.backend && st.camera && st.playerMesh) break;
        await warte(100);
    }
    if (!st || !st.renderer || !st.renderer.backend) return { fehler: "der Renderer stand nach 300 s nicht" };
    if (st.renderer.backend.isWebGPUBackend !== true) return { fehler: "kein WebGPU-Backend — die Wand wäre blind" };
    st._holzPixelCap = opts.kappe;
    const [mx, mz] = opts.messort;
    let h = null;
    for (let i = 0; i < 600; i++) {
        r._ensureHydroTilesAround(mx, mz, 200);
        h = r._hydroFor(mx, mz);
        if (h && h.ready) break;
        await warte(200);
    }
    let P = null,
        fl = null,
        pi = -1;
    for (const f of (h && h.rivers) || [])
        f.points.forEach((q, i) => {
            const d = Math.hypot(q.x - mx, q.z - mz);
            if (!P || d < P.d) {
                P = { x: q.x, z: q.z, d };
                fl = f;
                pi = i;
            }
        });
    if (!P || P.d > 300) return { fehler: "kein Bach an der Mess-Wiese" };
    const a = fl.points[Math.max(0, pi - 1)],
        b = fl.points[Math.min(fl.points.length - 1, pi + 1)];
    const L = Math.hypot(b.x - a.x, b.z - a.z) || 1;
    let nx = -(b.z - a.z) / L,
        nz = (b.x - a.x) / L;
    if (nx * (mx - P.x) + nz * (mz - P.z) < 0) {
        nx = -nx;
        nz = -nz;
    }
    const ux = P.x + nx * 12,
        uz = P.z + nz * 12;
    st.playerMesh.position.set(ux, r.getTerrainHeightAt(ux, uz) + 1.2, uz);
    if (st.playerVel) st.playerVel.setValue(0, 0, 0);
    st.yaw = Math.atan2(-nx, -nz); // der Blick zum Wasser (`_blickVorn`: vorn = (sin yaw, cos yaw))
    st.pitch = -0.25;
    // DAS RUHENDE WASSER: das Fern-Wasser (`_ensureFarWaterSheet`, EIN Mesh mit dem EINEN Wasser-Stoff jenseits des Chunk-
    // Rings) — der ruhende Leser des Holzes voll, das Standard-Holz der Geräte. Das Software-Holz schaltet es ab
    // (`atmosphere.farWater = false`), sein nahes Wasser zeichnet über den Wasser-Satz, dessen Abschnitte je Pass ohnehin
    // auffrischen: ohne das Fern-Wasser stünde kein Leser im Bild, an dem die Klasse hängt.
    st.atmosphere.farWater = null;
    r._ensureFarWaterSheet();
    const sichtbaresWasser = () => {
        let n = 0;
        st.scene.traverse((o) => {
            if (o.isMesh && o.visible && o.material === st.hydroSurfaceMaterial) n++;
        });
        return n;
    };
    const abbild = () => {
        const t = r._szeneTiefeKnoten && r._szeneTiefeKnoten.value;
        return t && t.image ? t.image.width : 0;
    };
    const t1 = performance.now();
    const fern = () => !!(st.farWater && st.farWater.mesh && st.farWater.mesh.parent);
    while (performance.now() - t1 < 240000 && !(sichtbaresWasser() > 0 && abbild() > 1 && fern())) {
        if (!fern()) r._ensureFarWaterSheet();
        await warte(100);
    }
    return { bach: [Math.round(P.x), Math.round(P.z)], wasser: sichtbaresWasser(), fernWasser: fern() ? st.farWater.quads : 0, abbildBreite: abbild() };
}

// ein Schritt nach der Änderung: `n` gerenderte Frames im laufenden Loop (die GPU-Leine zählt sie) — mit `pr` erst, bis die
// Pixel-Ratio dort steht (höchstens 60 Frames); dann der Stand des Schritts
async function fensterSchritt(o) {
    const r = window.anazhRealm;
    const st = r.state;
    const L = () => (r._gpuLeine ? r._gpuLeine.gerendert : 0);
    const warte = () => new Promise((q) => setTimeout(q, 20));
    const t0 = performance.now();
    if (o.pr != null) {
        const f0 = L();
        while (Math.abs(st.renderer.getPixelRatio() - o.pr) > 1e-6 && L() - f0 < 60 && performance.now() - t0 < 120000)
            await warte();
    }
    const f0 = L();
    // der Selbsttest (`bisMeldung`) endet mit der ersten Meldung des Schritts: nach ihr ist der Befehlspuffer verworfen, die Seite
    // rendert nicht verlässlich weiter
    const W0 = (r._gpuWache || { n: 0 }).n;
    const gemeldet = () =>
        Object.keys(window.__fensterEcht.gpu[window.__fensterEcht.schritt] || {}).length > 0 || (r._gpuWache || { n: 0 }).n > W0;
    const kappe = o.bisMeldung ? 30000 : 120000;
    while (L() - f0 < o.n && performance.now() - t0 < kappe && !(o.bisMeldung && gemeldet())) await warte();
    const t = r._szeneTiefeKnoten && r._szeneTiefeKnoten.value;
    const W = r._gpuWache || { n: 0, meldungen: [] };
    return {
        frames: L() - f0,
        pr: st.renderer.getPixelRatio(),
        dpr: window.devicePixelRatio,
        abbild: t && t.image ? { id: t.id, version: t.version, b: t.image.width, h: t.image.height } : null,
        gpu: window.__fensterEcht.gpu[window.__fensterEcht.schritt] || {},
        wache: W.n,
        wacheKoepfe: W.meldungen.map((m) => `${m.quelle}: ${m.kopf}`),
    };
}

(async () => {
    const T0 = Date.now();
    const log = (z) => console.log(`  [${Math.round((Date.now() - T0) / 1000)} s] ${z}`);
    console.log("=== K — kein Zwilling im resize-Handler (Quelle) ===");
    const koerper = resizeKoerper(fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8"));
    check(
        "K der resize-Handler baut keinen Leser der Szenen-Tiefe neu (die Diät trägt jeden Größenwechsel)",
        koerper !== null &&
            !/_tiefenKnotenTausch|_tiefenLeserNeuBinden|_ensureHydroSurfaceMaterial|_feldPassDispose|hydroSurfaceMaterial\s*=/.test(
                koerper
            ),
        koerper === null ? "resize-Handler nicht gefunden" : ""
    );
    console.log("=== E — der echte Frame mit laufendem Loop (WebGPU auf swiftshader, kienspan, Kappe 1,25, am Bach) ===");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const starte = () => puppeteer.launch({ headless: true, protocolTimeout: 900000, args: softwareWebGpuArgs() });
    const browser = await starte();
    let zweiter = null;
    const seitenFehler = [];
    const seiteAmUfer = async (b) => {
        const p = await b.newPage();
        await p.setViewport({ width: 640, height: 360, deviceScaleFactor: 1 });
        await p.evaluateOnNewDocument(fensterSammler);
        p.on("pageerror", (e) => seitenFehler.push((e.message || String(e)).split("\n")[0]));
        await p.goto(`http://127.0.0.1:${PORT}/index.html?holz=kienspan`, { waitUntil: "domcontentloaded", timeout: 60000 });
        const u = await p.evaluate(uferStellen, { messort: ladeSpec("wiese").ort.spieler, kappe: 1.25 });
        if (u.fehler) throw new Error(u.fehler);
        return { p, u };
    };
    try {
        let { p: page, u } = await seiteAmUfer(browser);
        log(`am Ufer ${JSON.stringify(u)}`);
        const vor = await page.evaluate(fensterSchritt, { n: 3 });
        if (Object.keys(vor.gpu).length) console.log(`  (vor den Schritten: ${JSON.stringify(vor.gpu)})`);
        let wacheVor = vor.wache;
        const schritt = async (name, text, tu, pr, bisMeldung) => {
            await page.evaluate((s) => (window.__fensterEcht.schritt = s), name);
            await tu();
            const kopfVor = await page.evaluate(() => (window.anazhRealm._gpuWache || { meldungen: [] }).meldungen.length);
            // der Selbsttest wartet bis zu 12 Frames (die Device-Meldung kommt asynchron nach dem Submit), endet mit der ersten
            const s = await page.evaluate(fensterSchritt, { n: bisMeldung ? 12 : 3, pr, bisMeldung: !!bisMeldung });
            s.fremd = Object.entries(s.gpu).map(([k, n]) => `${n}× ${k}`);
            s.wacheNeu = s.wache - wacheVor;
            s.wacheKoepfe = s.wacheKoepfe.slice(kopfVor);
            wacheVor = s.wache;
            const abb = s.abbild ? `${s.abbild.b}×${s.abbild.h} v${s.abbild.version}` : "-";
            log(
                `${name} ${text}: Pixel-Ratio ${s.pr}, Abbild ${abb}, ${s.frames} Frames, ` +
                    `${s.fremd.length ? s.fremd.join(" | ") : "0 Meldungen"}, GPU-Wache +${s.wacheNeu}`
            );
            return s;
        };
        const befund = (s) =>
            s.fremd.join(" | ") || (s.wacheNeu ? `GPU-Wache +${s.wacheNeu}: ${s.wacheKoepfe.slice(-2).join(" | ")}` : "");
        const fenster = (w, h, dsf) => () => page.setViewport({ width: w, height: h, deviceScaleFactor: dsf });
        const pixelRatio = (v) => () => page.evaluate((x) => window.anazhRealm.state.renderer.setPixelRatio(x), v);
        const erg = {};
        const SCHRITTE = [
            ["E1", "704×396 DPR 1", fenster(704, 396, 1), null],
            ["E2", "704×396 DPR 2", fenster(704, 396, 2), 1.25],
            ["E3", "640×360 DPR 1", fenster(640, 360, 1), 1],
            ["E4a", "setPixelRatio(1.25)", pixelRatio(1.25), 1.25],
            ["E4b", "setPixelRatio(1)", pixelRatio(1), 1],
        ];
        for (const [name, text, tu, pr] of SCHRITTE) {
            const s = await schritt(name, text, tu, pr);
            erg[name] = s;
            check(`${name} keine WebGPU-Validierung (${text}, laufender Loop)`, !befund(s), befund(s));
        }
        const abbilder = new Set(Object.values(erg).map((s) => s.abbild && s.abbild.id + ":" + s.abbild.version));
        check(
            "E5 nicht vakuös: das Wasser zeichnet, das Abbild wurde je Größe neu angelegt, die Pixel-Ratio folgte DPR und Kappe",
            u.wasser > 0 &&
                u.fernWasser > 0 &&
                abbilder.size >= 5 &&
                erg.E2.pr === 1.25 &&
                erg.E3.pr === 1 &&
                erg.E4a.pr === 1.25 &&
                Object.values(erg).every((s) => s.frames >= 3),
            `Wasser ${u.wasser} (Fern-Wasser ${u.fernWasser} Quads), Abbild-Stände ${abbilder.size}, Pixel-Ratio E2 ${erg.E2.pr} · E3 ${erg.E3.pr} · E4 ` +
                `${erg.E4a.pr}/${erg.E4b.pr}, Frames ${Object.values(erg)
                    .map((s) => s.frames)
                    .join("/")}`
        );
        // ES: der Selbsttest am echten Frame — ohne den Wächter fallen ein Größen- und ein Pixel-Ratio-Schritt beim Namen. Nach
        // den Fehlern eines Schritts rendert die Seite nicht weiter (der Befehlspuffer des Frames ist verworfen): je Weg eine
        // frischer Browser am selben Ufer.
        const ohneWaechter = () =>
            page.evaluate(() => {
                window.anazhRealm.constructor._diaetVorTextur = () => false;
            });
        await ohneWaechter();
        const esa = await schritt("ESa", "704×396 DPR 1 ohne Wächter", fenster(704, 396, 1), null, true);
        // nach den Fehlern steht der GPU-Prozess des Browsers (auch eine frische Seite rendert nicht): ein eigener Browser
        zweiter = await starte();
        ({ p: page } = await seiteAmUfer(zweiter));
        wacheVor = await page.evaluate(() => (window.anazhRealm._gpuWache || { n: 0 }).n);
        await ohneWaechter();
        const esb = await schritt("ESb", "setPixelRatio(1.25) ohne Wächter", pixelRatio(1.25), 1.25, true);
        const TOT = /Destroyed texture \[Texture "szene:tiefenabbild"\]/;
        const faellt = (s) => s.fremd.some((k) => TOT.test(k)) || s.wacheKoepfe.some((k) => TOT.test(k));
        check(
            "ES Selbsttest: ohne den Wächter fällt „Destroyed texture … szene:tiefenabbild“ beim Größen- UND beim Pixel-Ratio-Schritt",
            faellt(esa) && faellt(esb),
            [esa, esb].map((s) => [...s.fremd, ...s.wacheKoepfe].join(" | ") || "0").join(" · ")
        );
        check("E keine Page-Errors", seitenFehler.length === 0, seitenFehler.slice(0, 2).join(" | "));
    } catch (e) {
        check("E Lauf", false, (e && e.message) || String(e));
    }
    await browser.close();
    if (zweiter) await zweiter.close();
    server.close();
    log(ok ? "GRÜN" : "ROT");
    console.log(ok ? "GRÜN fenster-wechsel" : "ROT fenster-wechsel");
    process.exit(ok ? 0 : 1);
})();
