// diag-v1-pfad.cjs — DIE V1-PFAD-LINSE (Welle L, Familie auge-v1): die Defekte, die die Leben-Prüfung am 06.10. auf dem
// gespielten v1.0-Pfad fand (artifacts/profiband/leben/befund-v1-pfad.md, synthese.md Q14/Q15), je beim NAMEN. Jede
// Probe ruft den Chokepoint selbst (die Methode, in der der Defekt saß) im echten Boot (headless, foundry-ON,
// Null-Renderer der Welt) und misst seine Wirkung — keine Probe ersetzt die Stelle, an der der Defekt sitzt (Q0).
//
//   V-D3 (Q14) — DIE VORSCHAU ZEIGT IHR WERK: die Werkstatt öffnet, die Eiche wird gewählt, die Vorschau zeichnet über
//     `_workshopRender`. Die Linse liest am Vorschau-Renderer, mit welchem Masken-Stand er gerufen wird (der
//     Neben-Renderer ist der Beobachtungs-Punkt — er bekommt den Stand, die GPU-Arbeit bleibt aus), und rechnet mit dem
//     EINEN Masken-Gesetz (`__phytoCore.lodCrossfadeMask`) über die Vertices der Vorschau, welcher Anteil der Eiche
//     im Bild bleibt. Befund: 21 108 Dreiecke in der Szene, 0 im Bild (das Welt-Auge stand 36 m weit).   Soll ≥ 0,99
//     Dazu die Wand: jeder Neben-Renderer zeichnet nur über `_buehneRender`, und der setzt die Maske um den Render aus.
//
//   node scripts/diag-v1-pfad.cjs [--selftest]          Port: V1_PFAD_PORT (Standard 4421)
// Exit: 0 grün · 1 rot · 2 Skript-Fehler.
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { softwareWebGpuArgs } = require("./lib/software-gpu.cjs");

const PORT = Number(process.env.V1_PFAD_PORT || 4421);
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

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

function ohneKommentare(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`\\])\/\/[^\n]*/g, "$1");
}
function fnBody(src, sigRe) {
    const m = sigRe.exec(src);
    if (!m) return null;
    let i = src.indexOf("{", m.index + m[0].length - 1);
    if (i < 0) return null;
    let depth = 0;
    const start = i;
    for (; i < src.length; i++) {
        if (src[i] === "{") depth++;
        else if (src[i] === "}") {
            depth--;
            if (depth === 0) return src.slice(start, i + 1);
        }
    }
    return null;
}

// ── DIE VERDIKTE (pure Funktionen; Browser-Probe UND Selbst-Test). Rückgabe: die Täter beim Namen. ──
const SOLL = { vorschauAnteil: 0.99 };
function vorschauVerdict(m) {
    if (!m || m.gestartet !== true) return ["start"];
    const out = [];
    if (!(m.renders > 0)) out.push("vorschau zeichnete nie");
    if (!(m.vertices > 0)) out.push("vorschau ohne Werk");
    if (!(m.anteil >= SOLL.vorschauAnteil))
        out.push(`vorschau ${(100 * (m.anteil || 0)).toFixed(1)} % im Bild (Maske ${m.maskeImRender}, Auge ${m.augeAbstand} m)`);
    if (m.maskeDanach !== m.maskeWelt) out.push(`welt-maske nach dem Vorschau-Render ${m.maskeDanach} statt ${m.maskeWelt}`);
    return out;
}

// ── DIE STATISCHE WAND (Node, kommentarfrei). Liefert [name, ok, detail]. ──
function wand(src) {
    const nc = ohneKommentare(src);
    const buehne = fnBody(nc, /\n {4}_buehneRender\(renderer, scene, camera\) \{/) || "";
    // Jeder Neben-Renderer (Werkstatt-Vorschau `p`, Feed/Hof/Ich-Bühne `s`) zeichnet nur über die Bühne.
    const direkt = (nc.match(/\b[ps]\.renderer\.render\(/g) || []).length;
    const ueber = (nc.match(/this\._buehneRender\([ps]\.renderer, [ps]\.scene, [ps]\.camera\)/g) || []).length;
    return [
        [
            "W1 die Bühne zeichnet ungemaskt (`_buehneRender`: uLodMaskOn 0 um den Render, im finally zurück)",
            /lu\.uLodMaskOn\.value = 0;/.test(buehne) && /finally\s*\{[^}]*lu\.uLodMaskOn\.value = an;/.test(buehne),
        ],
        [
            "W2 jeder Neben-Renderer zeichnet über die Bühne (0 direkte p/s.renderer.render, 4 über `_buehneRender`)",
            direkt === 0 && ueber === 4,
            `${direkt} direkt · ${ueber} über die Bühne`,
        ],
    ];
}

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

// ── DIE PROBEN IN DER SEITE (Funktionsrumpf; r = die Welt). ──
async function probe() {
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
    const out = {};
    const dl0 = performance.now() + 90000;
    while (
        (!window.anazhRealm || typeof window.anazhRealm._gameLoopTick !== "function") &&
        performance.now() < dl0
    )
        await sleep(100);
    const r = window.anazhRealm;
    const st = r.state;
    const tick = async (n, ms) => {
        for (let i = 0; i < n; i++) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            await sleep(ms || 30);
        }
    };
    // ── V-D3: die Werkstatt-Vorschau ──
    try {
        const m = { gestartet: false };
        out.vorschau = m;
        const f = r._ensureAssetFoundry();
        const dl = performance.now() + 60000;
        while (performance.now() < dl && !(f && f.ready && f.recipes && f.recipes.eiche && st.blueprints.baum_eiche))
            await sleep(80);
        // Das Welt-Auge steht beim Spieler (der Loop spiegelt es je Frame) — dort, wo der neue Spieler die Werkstatt öffnet.
        await tick(20);
        if (st.uiActiveDrawer !== "werkstatt") r.toggleDrawer("werkstatt");
        const ws = r._ensureWorkshopState();
        const lu = r._ensureLodUniforms();
        // Der Beobachtungs-Punkt, im selben Takt wie das Öffnen (vor dem async init() des Vorschau-Renderers): der
        // Neben-Renderer bekommt den Masken-Stand, die GPU-Arbeit bleibt aus.
        const rec = [];
        if (!ws.preview) throw new Error("keine Vorschau nach dem Öffnen der Werkstatt");
        ws.preview.renderer.render = () => {
            rec.push({
                an: lu.uLodMaskOn.value,
                auge: lu.uLodAuge.value.clone(),
                perf: lu.uLodPerf.value,
                ref: lu.uLodRef.value,
                cfg: { d0: lu.uLodD0.value, d1: lu.uLodD1.value, fade: lu.uLodFade.value, fade0: lu.uLodFade0.value },
            });
        };
        r.selectBlueprintForEdit("baum_eiche");
        const dl2 = performance.now() + 90000;
        while (performance.now() < dl2) {
            const p = ws.preview;
            if (p && p.currentMesh && !r._wsStudioPending && p.currentMesh.children.length) break;
            await tick(1, 80);
        }
        const p = ws.preview;
        if (!p || !p.currentMesh) throw new Error("keine Vorschau-Gestalt");
        p.rendererReady = true;
        m.maskeWelt = lu.uLodMaskOn.value;
        r._workshopRender();
        m.maskeDanach = lu.uLodMaskOn.value;
        m.renders = rec.length;
        m.gestartet = true;
        const R = rec[rec.length - 1];
        if (R) {
            m.maskeImRender = R.an;
            const law = globalThis.__phytoCore.lodCrossfadeMask;
            const v = new THREE.Vector3();
            let n = 0,
                behalten = 0,
                dSum = 0;
            p.currentMesh.updateMatrixWorld(true);
            p.currentMesh.traverse((o) => {
                if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
                const g = o.geometry;
                const pos = g.attributes.position;
                const aL = g.attributes.aLodLevel,
                    aH = g.attributes.aH0,
                    aHL = g.attributes.aH0L;
                const fol = !!(o.material && o.material.userData && /foliage|grass/.test(o.material.userData.foundryKind || ""));
                const schritt = Math.max(1, Math.floor(pos.count / 400));
                for (let j = 0; j < pos.count; j += schritt) {
                    v.fromBufferAttribute(pos, j).applyMatrix4(o.matrixWorld);
                    const stufe = aL ? aL.getX(j) : 0;
                    const cd = Math.hypot(R.auge.x - v.x, R.auge.z - v.z) * R.perf;
                    dSum += cd / R.perf;
                    const lk = Math.min(R.ref / Math.max(aH ? aH.getX(j) : 1, 1e-3), 1);
                    const lkL = Math.min(R.ref / Math.max(aHL ? aHL.getX(j) : 1, 1e-3), 1);
                    let k = 0;
                    for (let d = 0; d < 16; d++) {
                        const dh = (d + 0.5) / 16;
                        let keep = true;
                        if (R.an > 0.5 && stufe > 0.5) {
                            const L = law(cd * lk, dh, R.cfg, stufe > 1.5 ? 1 : 0, fol, cd * lkL);
                            keep = stufe > 2.5 ? L.f1o < dh : L.keep;
                        }
                        if (keep) k++;
                    }
                    behalten += k / 16;
                    n++;
                }
            });
            m.vertices = n;
            m.anteil = n ? behalten / n : 0;
            m.augeAbstand = n ? +(dSum / n).toFixed(1) : null;
        }
    } catch (e) {
        out.vorschau = Object.assign(out.vorschau || {}, { err: (e && e.stack) || String(e) });
    }
    return out;
}

(async () => {
    const quelle = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST: die V1-Pfad-Linse nennt jeden Täter des Befunds ===");
        const gesund = { gestartet: true, renders: 1, vertices: 1200, anteil: 1, maskeImRender: 0, maskeWelt: 1, maskeDanach: 1 };
        check("Selbst-Test V-D3: gesunde Vorschau == 0 Täter", vorschauVerdict(gesund).length === 0);
        for (const [name, bruch, soll] of [
            ["leere Vorschau (21 108 Dreiecke, 0 im Bild)", { anteil: 0, maskeImRender: 1, augeAbstand: 36 }, "vorschau 0.0 %"],
            ["Vorschau zeichnet nie", { renders: 0 }, "vorschau zeichnete nie"],
            ["Welt-Maske bleibt aus", { maskeDanach: 0 }, "welt-maske"],
        ]) {
            const v = vorschauVerdict(Object.assign({}, gesund, bruch));
            check(`Selbst-Test V-D3: ‚${name}' → die Linse nennt ${soll}`, v.some((t) => t.startsWith(soll)), v.join(" · "));
        }
        const gruen = wand(quelle);
        check("Selbst-Test W: der Arbeitsbaum ist grün", gruen.every((w) => w[1]), gruen.filter((w) => !w[1]).map((w) => w[0]).join(" | "));
        const vorStand = quelle
            .replace("const renderResult = this._buehneRender(p.renderer, p.scene, p.camera);", "const renderResult = p.renderer.render(p.scene, p.camera);")
            .replace("if (an !== null) lu.uLodMaskOn.value = 0;", "");
        const rot = wand(vorStand);
        check(
            "Selbst-Test W: der Vor-Stand (Vorschau direkt, Bühne maskiert) → W1 W2 feuern",
            rot.filter((w) => !w[1]).length === 2,
            rot.map((w) => `${w[1] ? "✓" : "✗"} ${w[0].slice(0, 2)}`).join(" ")
        );
        if (errs.length) {
            console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuös.");
            process.exit(1);
        }
        console.log("\n✅ SELBST-TEST GRÜN — die V1-Pfad-Linse nennt ihre Täter beim Namen.");
        process.exit(0);
    }

    console.log("=== W — DIE STATISCHE WAND (Node, kommentarfrei) ===");
    for (const [name, ok, detail] of wand(quelle)) check(name, ok, detail);

    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 600000, args: softwareWebGpuArgs() });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.evaluateOnNewDocument(() => {
        window.__anazhForceFoundry = true;
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const out = await page.evaluate(probe);
    await browser.close();
    server.close();

    console.log("=== V-D3 (Q14) — DIE WERKSTATT-VORSCHAU ZEIGT IHR WERK ===");
    const vm = out.vorschau || {};
    if (vm.err) check("V-D3 Probe ohne Ausnahme", false, vm.err.split("\n")[0]);
    const vV = vorschauVerdict(vm);
    check(
        "V-D3 die Eiche der Werkstatt-Vorschau steht im Bild (Masken-Gesetz über die Vorschau-Vertices ≥ 99 %)",
        vV.length === 0,
        `${vm.vertices || 0} Proben · ${(100 * (vm.anteil || 0)).toFixed(1)} % behalten · Maske im Render ${vm.maskeImRender} · Welt-Auge ${vm.augeAbstand} m${vV.length ? " — Täter: " + vV.join(", ") : ""}`
    );
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);
    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log("\n✅ GRÜN — der v1-Pfad trägt seine benannten Schnitte.");
    process.exit(0);
})().catch((e) => {
    console.error("V1-Pfad-Linse-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
