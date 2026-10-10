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
// E — DER ECHTE FRAME MIT LAUFENDEM LOOP (0910-3 A1, Leben-Schau 2: 264× „Destroyed texture [Texture "szene:tiefenabbild"]
// used in a submit" beim Vergrößern und Maximieren, DPR 2; die Werkbank hält den Loop an und sah es nie). WebGPU auf
// swiftshader, holz=nah (Pixel-Kappe 1,25: ein DPR-Wechsel stellt `setPixelRatio` über die Kappe `_applyRenderScale`, Frames
// NACH dem resize-Ereignis), am Ufer des Bachs der Mess-Wiese (das Wasser liest das Tiefen-Abbild), der Spiel-Loop läuft:
//   E1–E4  die Folge der Schau (958×512 → 1010×541 → maximiert → DPR 2 → zurück) im Maßstab 2/3 (swiftshader: ein Frame
//          bei 1280×720 × 1,25 kostet ~16 s): 639×342 → 674×361 → 853×480 → 853×480 bei DPR 2 → 639×342 bei DPR 1, je
//          Schritt ≥ 6 Frames im laufenden Loop — ROT bei JEDER WebGPU-Validierung beim Namen (Device-Meldung und GPU-Wache)
//   E5     die Pixel-Ratio ALLEIN (1,25, dann 1), wie die DPR-Kappe sie stellt, ohne resize-Ereignis — der deterministische
//          Schritt (über setViewport kann je nach Takt der resize-Handler das Wasser vorher neu bauen); ebenso ROT bei jeder
//          Meldung
//   E6     nicht vakuös: das Wasser zeichnet, das Abbild wurde je Größe neu angelegt, die Pixel-Ratio folgte DPR und Kappe
//   ES     Selbsttest am echten Frame: ohne den Vorher-Textur-Wächter der Diät (`_diaetVorTextur` → false) MUSS E5
//          „Destroyed texture … szene:tiefenabbild" beim Namen zeigen
//
//   node scripts/diag-fenster-wechsel.cjs [--ohne-echt]
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

// E: vor jedem Seiten-Skript — die Device-Meldungen je Schritt (`__fensterEcht.schritt` setzt die Wand).
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

// E: der Spieler am Ufer des Bachs der Mess-Wiese, Blick übers Wasser; zurück, sobald das Wasser zeichnet und das
// Tiefen-Abbild gezogen ist (der Loop läuft).
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
    if (st.renderer.backend.isWebGPUBackend !== true) return { fehler: "kein WebGPU-Backend — die Stufe wäre blind" };
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
    const hh = (x, z) => r.getTerrainHeightAt(x, z);
    const ux = P.x + nx * 12,
        uz = P.z + nz * 12;
    st.playerMesh.position.set(ux, hh(ux, uz) + 1.2, uz);
    if (st.playerVel) st.playerVel.setValue(0, 0, 0);
    st.yaw = Math.atan2(-nx, -nz); // der Blick zum Wasser (`_blickVorn`: vorn = (sin yaw, cos yaw))
    st.pitch = -0.25;
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
    while (performance.now() - t1 < 240000 && !(sichtbaresWasser() > 0 && abbild() > 1)) await warte(250);
    return { bach: [Math.round(P.x), Math.round(P.z)], wasser: sichtbaresWasser(), abbildBreite: abbild() };
}

// E: n gerenderte Frames im laufenden Loop (die GPU-Leine zählt sie), mindestens `ms`; dann der Stand des Schritts.
async function fensterSchritt(o) {
    const r = window.anazhRealm;
    const st = r.state;
    const L = () => (r._gpuLeine ? r._gpuLeine.gerendert : 0);
    const f0 = L(),
        t0 = performance.now();
    while ((L() - f0 < o.n || performance.now() - t0 < o.ms) && performance.now() - t0 < 180000)
        await new Promise((q) => setTimeout(q, 50));
    const t = r._szeneTiefeKnoten && r._szeneTiefeKnoten.value;
    const W = r._gpuWache || { n: 0, meldungen: [] };
    let wasserDraws = 0;
    st.scene.traverse((m) => {
        if (m.isMesh && m.visible && m.material === st.hydroSurfaceMaterial) wasserDraws++;
    });
    return {
        frames: L() - f0,
        pr: st.renderer.getPixelRatio(),
        dpr: window.devicePixelRatio,
        innen: [window.innerWidth, window.innerHeight],
        abbild: t && t.image ? { id: t.id, version: t.version, b: t.image.width, h: t.image.height } : null,
        wasser: wasserDraws,
        gpu: window.__fensterEcht.gpu[window.__fensterEcht.schritt] || {},
        wache: W.n,
        wacheKoepfe: W.meldungen.map((m) => `${m.quelle}: ${m.kopf}`),
    };
}

async function echteStufe(check) {
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 900000, args: softwareWebGpuArgs() });
    const page = await browser.newPage();
    await page.setViewport({ width: 639, height: 342, deviceScaleFactor: 1 });
    await page.evaluateOnNewDocument(fensterSammler);
    const seitenFehler = [];
    page.on("pageerror", (e) => seitenFehler.push((e.message || String(e)).split("\n")[0]));
    const T0 = Date.now();
    const log = (z) => console.log(`  [${Math.round((Date.now() - T0) / 1000)} s] ${z}`);
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html?holz=nah`, { waitUntil: "domcontentloaded", timeout: 60000 });
        const u = await page.evaluate(uferStellen, { messort: ladeSpec("wiese").ort.spieler });
        if (u.fehler) throw new Error(u.fehler);
        log(`am Ufer ${JSON.stringify(u)}`);
        const vor = await page.evaluate(fensterSchritt, { n: 6, ms: 2000 });
        if (Object.keys(vor.gpu).length) console.log(`  (vor den Schritten: ${JSON.stringify(vor.gpu)})`);
        // ein Schritt: die Änderung, dann Frames im laufenden Loop; jede Device-Meldung und jede neue Zeile der GPU-Wache
        let wacheVor = vor.wache;
        const schritt = async (name, text, tu) => {
            await page.evaluate((s) => (window.__fensterEcht.schritt = s), name);
            await tu();
            const s = await page.evaluate(fensterSchritt, { n: 6, ms: 3000 });
            s.fremd = Object.entries(s.gpu).map(([k, n]) => `${n}× ${k}`);
            s.wacheNeu = s.wache - wacheVor;
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
        const pixelRatio = (v) => page.evaluate((x) => window.anazhRealm.state.renderer.setPixelRatio(x), v);
        // E1–E4 die Folge der Schau: vergrößern, nochmals, DPR 2, zurück (setViewport feuert das resize-Ereignis)
        const SCHRITTE = [
            ["E1", 674, 361, 1],
            ["E2", 853, 480, 1],
            ["E3", 853, 480, 2],
            ["E4", 639, 342, 1],
        ];
        const erg = {};
        for (const [name, w, h, dsf] of SCHRITTE) {
            const s = await schritt(name, `${w}×${h} DPR ${dsf}`, () =>
                page.setViewport({ width: w, height: h, deviceScaleFactor: dsf })
            );
            erg[name] = s;
            check(`${name} keine WebGPU-Validierung (${w}×${h}, DPR ${dsf}, laufender Loop)`, !befund(s), befund(s));
        }
        // E5 die Pixel-Ratio ALLEIN, wie sie die DPR-Kappe stellt (`_applyRenderScale` → `setPixelRatio`), ohne resize-
        // Ereignis: setViewport mit neuem DPR feuert je nach Takt AUCH das resize-Ereignis, dessen Handler das Wasser neu baut
        // (ohne Wächter: in voller Größe 8 Meldungen, im Maßstab 2/3 keine) — dieser Schritt ist der deterministische
        for (const [name, v] of [
            ["E5a", 1.25],
            ["E5b", 1],
        ]) {
            const s = await schritt(name, `setPixelRatio(${v})`, () => pixelRatio(v));
            erg[name] = s;
            check(`${name} keine WebGPU-Validierung (Pixel-Ratio ${v} allein, laufender Loop)`, !befund(s), befund(s));
        }
        const abbilder = new Set(Object.values(erg).map((s) => s.abbild && s.abbild.id + ":" + s.abbild.version));
        const frames = Object.values(erg)
            .map((s) => s.frames)
            .join("/");
        check(
            "E6 nicht vakuös: das Wasser zeichnet, das Abbild wurde je Größe neu angelegt, die Pixel-Ratio folgte DPR und Kappe",
            vor.wasser > 0 &&
                abbilder.size >= 5 &&
                erg.E3.pr > erg.E2.pr &&
                erg.E5a.pr === 1.25 &&
                erg.E5b.pr === 1 &&
                Object.values(erg).every((s) => s.frames >= 4),
            `Wasser ${vor.wasser}, Abbild-Stände ${abbilder.size}, Pixel-Ratio E2 ${erg.E2.pr} → E3 ${erg.E3.pr}, ` +
                `E5 ${erg.E5a.pr}/${erg.E5b.pr}, Frames ${frames}`
        );
        // ES: der Selbsttest am echten Frame — ohne den Vorher-Textur-Wächter fällt E5 beim Namen
        await page.evaluate(() => {
            const KL = window.anazhRealm.constructor;
            window.__fensterEcht.waechter = KL._diaetVorTextur;
            KL._diaetVorTextur = () => false;
        });
        const esa = await schritt("ESa", "setPixelRatio(1.25) ohne Wächter", () => pixelRatio(1.25));
        const esb = await schritt("ESb", "setPixelRatio(1) ohne Wächter", () => pixelRatio(1));
        await page.evaluate(() => {
            window.anazhRealm.constructor._diaetVorTextur = window.__fensterEcht.waechter;
            window.__fensterEcht.schritt = "nach";
        });
        const TOT = /Destroyed texture \[Texture "szene:tiefenabbild"\]/;
        const tot = [esa, esb].some((s) => s.fremd.some((k) => TOT.test(k)) || s.wacheKoepfe.some((k) => TOT.test(k)));
        check(
            "ES Selbsttest: ohne den Vorher-Textur-Wächter fällt „Destroyed texture … szene:tiefenabbild“ beim Namen",
            tot,
            [esa, esb].map((s) => s.fremd.join(" | ") || "0").join(" · ")
        );
        check("E keine Page-Errors", seitenFehler.length === 0, seitenFehler.slice(0, 2).join(" | "));
    } catch (e) {
        check("E Lauf", false, (e && e.message) || String(e));
    }
    await browser.close();
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
    if (!process.argv.includes("--ohne-echt")) {
        console.log("=== E — der echte Frame mit laufendem Loop (WebGPU auf swiftshader, holz=nah, am Bach der Mess-Wiese) ===");
        await echteStufe(check);
    }
    server.close();
    console.log(ok ? "GRÜN fenster-wechsel" : "ROT fenster-wechsel");
    process.exit(ok ? 0 : 1);
})();
