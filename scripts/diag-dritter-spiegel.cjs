#!/usr/bin/env node
// gate:dritter-spiegel — DIE SEH-PARITÄTS-LINSE (docs/das-feld-zeichnet.md §3).
//
// Der dritte Spiegel: das Terrain-Makro-Gesetz `_terrainMacroSurfaceY` reist
// als WGSL (feld-wgsl.js, f32) — diese Linse beweist die SEH-Parität headless
// auf ECHTEM WebGPU (swiftshader-Vulkan, harness-Muster diag-blick):
//   A) STATIK — index.html trägt den Script-Tag, package.json das Gate + den
//      node --check, das WGSL ist frei von JS-Fallen ("Math."), der
//      Selbsttest-Marker existiert genau einmal.
//   B) PARITÄT — deterministisches 72×72-Proben-Gitter (x,z ∈ [−852,852],
//      Schritt 24 m — ganzzahlig = f32-exakt, innerhalb des Erosions-
//      Heimat-Grids ±1024): je Punkt f64-Referenz (die EINE lebende Quelle
//      `_terrainMacroSurfaceY`) gegen den GPU-Compute-Lauf; Bänder auf
//      meanAbs / p95 / Anteil>2 m / max.
//   C) SELBST-TEST — ein absichtlich verfälschter Shader (cont0-Offset
//      12→15) MUSS die Bänder sprengen, sonst wäre die Linse vakuös.
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.DRITTER_SPIEGEL_PORT || 4462);

let fails = 0;
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) fails++;
}

// ── Proben-Gitter (deterministisch, KEIN Math.random) ──
const N = 72; // 72×72 = 5184 Punkte
const START = -852; // ±852 m — innerhalb des Erosions-Heimat-Grids (±1024)
const STEP = 24; // ganzzahlig → jede Koordinate ist f32-exakt (kein Rundungs-Rauschen)

// ── BÄNDER (GEMESSEN 16.07.2026, swiftshader-Vulkan, Headless-Boot-Seed
//    "anazh-realm-seed", Erosion+Anker+19 Tarns im Pack:
//    meanAbs 0.00086 m · p95 0.00310 m · p99 0.00495 m · max 0.00829 m ·
//    Anteil>2m 0 %; Selbsttest-Verfälschung: meanAbs 2.909 m. Die Bänder
//    liegen bewusst weit über der Messung: Simplex-Zellgrenzen/mesa-Branch-
//    Flips in f32 können SELTENE Ausreißer erzeugen, die dieses eine Gitter
//    nicht zeigt — Doktrin §3: Toleranz-Band, kein Versprechen.) ──
const BAND_MEAN = 0.1; // m
const BAND_P95 = 1.0; // m
const BAND_UEBER2 = 0.01; // Anteil der Punkte mit |Δ| > 2 m
const BAND_MAX = 30; // m

const MARKER = "+ 12.0;"; // cont0-Konstante — der Selbsttest-Griff
const TAMPER = "+ 15.0;";

// ── A) STATIK: Konsum-Proben ──
console.log("===== DRITTER SPIEGEL — A) Statik =====");
require(path.join(root, "feld-wgsl.js"));
const fw = globalThis.__feldWgsl;
check(
    "feld-wgsl.js lädt (Namensraum __feldWgsl: WGSL_MAKRO + spiegelEingaben)",
    !!fw && typeof fw.WGSL_MAKRO === "string" && typeof fw.spiegelEingaben === "function"
);
const wgsl = fw ? fw.WGSL_MAKRO : "";
check('WGSL ohne JS-Falle (kein "Math.")', !wgsl.includes("Math."));
check("WGSL ohne f64 (f32-Seh-Spiegel per Doktrin §3)", !/\bf64\b/.test(wgsl));
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
check(
    "index.html trägt den feld-wgsl-Script-Tag (mit ?v=-Buster, Lehre #10)",
    /<script src="feld-wgsl\.js\?v=[^"]+" defer><\/script>/.test(indexHtml)
);
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
check(
    "package.json trägt gate:dritter-spiegel",
    ((pkg.scripts || {})["gate:dritter-spiegel"] || "").includes("diag-dritter-spiegel")
);
check(
    "npm run check prüft feld-wgsl.js (node --check)",
    ((pkg.scripts || {}).check || "").includes("node --check feld-wgsl.js")
);
const markerAnzahl = wgsl.split(MARKER).length - 1;
check(`Selbsttest-Marker "${MARKER}" genau 1× im WGSL`, markerAnzahl === 1, `gefunden ${markerAnzahl}×`);
if (fails > 0) {
    console.log("\n❌ ROT — Statik gebrochen, Browser-Lauf übersprungen.");
    process.exit(1);
}

// ── Server (Muster diag-blick, eigener Port) ──
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
    // VOLLE Vulkan-Flags (wörtlich diag-blick) — das GPUDevice kommt über
    // Weg B (eigenes navigator.gpu-Device, renderer-unabhängig); die Welt
    // bootet mit Null-Renderer (schnell — die Linse braucht nur das GESETZ).
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
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });

    const out = await page.evaluate(
        async (MARKER, TAMPER, N, START, STEP) => {
            const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
            const res = { fehler: [] };
            // Boot-Warte: das Gesetz + worldMeta müssen stehen.
            const dl = performance.now() + 300000;
            while (
                (!window.anazhRealm ||
                    typeof window.anazhRealm._terrainMacroSurfaceY !== "function" ||
                    !window.anazhRealm.state ||
                    !window.anazhRealm.state.worldMeta) &&
                performance.now() < dl
            )
                await sleep(200);
            const r = window.anazhRealm;
            if (!r || !r.state || !r.state.worldMeta) return { fatal: "anazhRealm/worldMeta kam nie" };
            // Weiches Warten auf die Worldgen-Daten (Erosion + Hydro ready) —
            // die Linse soll ALLE Terme prüfen, nicht nur die Noise-Summe.
            const dlWg = performance.now() + 180000;
            while (
                (!r.state.erosion || !r.state.hydrosphere || !r.state.hydrosphere.ready) &&
                performance.now() < dlWg
            )
                await sleep(250);
            if (!window.__feldWgsl) return { fatal: "__feldWgsl kam nie (Script-Tag konsumiert?)" };

            // ── SYNCHRONER Block (keine awaits): Eingaben-Pack + f64-Referenz
            // sehen garantiert DENSELBEN Welt-Stand. ──
            const eingaben = window.__feldWgsl.spiegelEingaben(r);
            const n = N * N;
            const punkte = new Float32Array(n * 2);
            const ref = new Float64Array(n);
            let k = 0;
            for (let j = 0; j < N; j++) {
                for (let i = 0; i < N; i++) {
                    const x = START + i * STEP;
                    const z = START + j * STEP;
                    punkte[k * 2] = x;
                    punkte[k * 2 + 1] = z;
                    ref[k] = r._terrainMacroSurfaceY(x, z); // die EINE lebende f64-Quelle
                    k++;
                }
            }
            res.erosionDa = eingaben.eroDim > 0;
            res.ankerDa = eingaben.hatAnker === 1;
            res.nTarns = eingaben.nTarns;
            res.seed = r.state.worldMeta.seed;

            // ── GPU-Device (harness §2 Weg B: eigenes Device, renderer-frei) ──
            if (!navigator.gpu) return { fatal: "kein navigator.gpu" };
            const adapter = await navigator.gpu.requestAdapter();
            if (!adapter) return { fatal: "kein WebGPU-Adapter (Vulkan-Flags?)" };
            const device = await adapter.requestDevice();
            device.lost.then((info) => res.fehler.push("device lost: " + (info && info.message)));

            const mkStorage = (arr) => {
                const buf = device.createBuffer({
                    size: Math.max(4, arr.byteLength),
                    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
                });
                device.queue.writeBuffer(buf, 0, arr.buffer, arr.byteOffset, arr.byteLength);
                return buf;
            };
            // Uniform: 8×f32 + 4×u32 — exakt die Skalare-Struct-Reihenfolge.
            const uniBytes = new ArrayBuffer(48);
            const uf = new Float32Array(uniBytes, 0, 8);
            const uu = new Uint32Array(uniBytes, 32, 4);
            uf[0] = eingaben.base;
            uf[1] = eingaben.steilheit;
            uf[2] = eingaben.wasser;
            uf[3] = eingaben.includeDetail;
            uf[4] = eingaben.hatAnker;
            uf[5] = eingaben.eroOriginX;
            uf[6] = eingaben.eroOriginZ;
            uf[7] = eingaben.eroCell;
            uu[0] = eingaben.eroDim;
            uu[1] = eingaben.nTarns;
            uu[2] = eingaben.nTal;
            uu[3] = n;
            const uniBuf = device.createBuffer({
                size: 48,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            });
            device.queue.writeBuffer(uniBuf, 0, uniBytes);
            const bufs = [
                mkStorage(eingaben.permVoxel),
                mkStorage(eingaben.permMod12Voxel),
                mkStorage(eingaben.permRidge),
                mkStorage(eingaben.ankerPack),
                mkStorage(eingaben.erosionGrid),
                mkStorage(eingaben.tarnPack),
                mkStorage(punkte),
            ];
            const outBuf = device.createBuffer({
                size: n * 4,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
            });
            const staging = device.createBuffer({
                size: n * 4,
                usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
            });

            const lauf = async (code, name) => {
                device.pushErrorScope("validation");
                const mod = device.createShaderModule({ code });
                const ci = await mod.getCompilationInfo();
                for (const m of ci.messages) {
                    if (m.type === "error") res.fehler.push(`WGSL(${name}) ${m.lineNum}:${m.linePos} ${m.message}`);
                }
                const pipe = device.createComputePipeline({
                    layout: "auto",
                    compute: { module: mod, entryPoint: "main" },
                });
                const bind = device.createBindGroup({
                    layout: pipe.getBindGroupLayout(0),
                    entries: [
                        { binding: 0, resource: { buffer: uniBuf } },
                        { binding: 1, resource: { buffer: bufs[0] } },
                        { binding: 2, resource: { buffer: bufs[1] } },
                        { binding: 3, resource: { buffer: bufs[2] } },
                        { binding: 4, resource: { buffer: bufs[3] } },
                        { binding: 5, resource: { buffer: bufs[4] } },
                        { binding: 6, resource: { buffer: bufs[5] } },
                        { binding: 7, resource: { buffer: bufs[6] } },
                        { binding: 8, resource: { buffer: outBuf } },
                    ],
                });
                const err = await device.popErrorScope();
                if (err) {
                    res.fehler.push(`validation(${name}): ` + err.message);
                    return null;
                }
                const enc = device.createCommandEncoder();
                const pass = enc.beginComputePass();
                pass.setPipeline(pipe);
                pass.setBindGroup(0, bind);
                pass.dispatchWorkgroups(Math.ceil(n / 64));
                pass.end();
                enc.copyBufferToBuffer(outBuf, 0, staging, 0, n * 4);
                device.queue.submit([enc.finish()]);
                await staging.mapAsync(GPUMapMode.READ);
                const werte = Array.from(new Float32Array(staging.getMappedRange().slice(0)));
                staging.unmap();
                return werte;
            };

            // Lauf 1: der GELIEFERTE Shader (aus dem Script-Tag der Seite —
            // beweist den Konsum-Pfad, nicht eine Node-Kopie).
            const original = window.__feldWgsl.WGSL_MAKRO;
            res.gpu = await lauf(original, "original");
            // Lauf 2 (SELBST-TEST): absichtlich verfälschter Shader.
            const verfaelscht = original.replace(MARKER, TAMPER);
            res.verfaelschtGriff = verfaelscht !== original;
            res.gpuBad = await lauf(verfaelscht, "verfaelscht");
            res.ref = Array.from(ref);
            device.destroy();
            return res;
        },
        MARKER,
        TAMPER,
        N,
        START,
        STEP
    );

    await browser.close();
    server.close();

    console.log("\n===== DRITTER SPIEGEL — B) Seh-Parität (echtes WebGPU, headless) =====");
    if (!out || out.fatal) {
        console.log("FEHLER:", out ? out.fatal : "?", "· Page-Errors:", pageErrors.slice(0, 3).join(" | ") || "-");
        process.exit(1);
    }
    console.log(
        `  Welt: seed=${JSON.stringify(out.seed)} · Erosion=${out.erosionDa ? "da" : "FEHLT"} · ` +
            `Anker=${out.ankerDa ? "da" : "fehlt"} · Tarns=${out.nTarns}`
    );
    check("GPU-Lauf ohne Validation-/Compile-Fehler", out.fehler.length === 0, out.fehler.slice(0, 3).join(" | "));
    check("Worldgen-Daten im Pack (Erosions-Heimat-Grid reiste)", out.erosionDa === true);
    check("Makro-Anker im Pack (Ridge-/Tal-/Becken-Pfad wird geprüft)", out.ankerDa === true);
    check("GPU-Ausgabe vorhanden", Array.isArray(out.gpu) && out.gpu.length === N * N);
    if (fails > 0 || !out.gpu) {
        console.log("\n❌ ROT — dritter Spiegel ohne gültigen GPU-Lauf.");
        process.exit(1);
    }

    const statistik = (ref, gpu) => {
        const n = ref.length;
        const absd = new Array(n);
        let sum = 0;
        let max = 0;
        let ueber2 = 0;
        let kaputt = 0;
        for (let i = 0; i < n; i++) {
            const d = Math.abs(gpu[i] - ref[i]);
            if (!Number.isFinite(d)) {
                kaputt++;
                absd[i] = Infinity;
                continue;
            }
            absd[i] = d;
            sum += d;
            if (d > max) max = d;
            if (d > 2) ueber2++;
        }
        absd.sort((a, b) => a - b);
        return {
            meanAbs: sum / n,
            p95: absd[Math.floor(0.95 * (n - 1))],
            p99: absd[Math.floor(0.99 * (n - 1))],
            max,
            anteilUeber2: ueber2 / n,
            kaputt,
        };
    };
    const fmt = (v) => (Number.isFinite(v) ? v.toFixed(5) : String(v));

    const st = statistik(out.ref, out.gpu);
    console.log(
        `  Messung (${N}×${N} Punkte, [${START},${START + (N - 1) * STEP}] m): meanAbs=${fmt(st.meanAbs)} m · ` +
            `p95=${fmt(st.p95)} m · p99=${fmt(st.p99)} m · max=${fmt(st.max)} m · ` +
            `Anteil>2m=${(st.anteilUeber2 * 100).toFixed(3)} %`
    );
    check("keine NaN/Inf in der GPU-Ausgabe", st.kaputt === 0, `${st.kaputt} kaputte Werte`);
    check(`BAND meanAbs <= ${BAND_MEAN} m`, st.meanAbs <= BAND_MEAN, `${fmt(st.meanAbs)} m`);
    check(`BAND p95 <= ${BAND_P95} m`, st.p95 <= BAND_P95, `${fmt(st.p95)} m`);
    check(`BAND Anteil>2m <= ${BAND_UEBER2 * 100} %`, st.anteilUeber2 <= BAND_UEBER2, `${(st.anteilUeber2 * 100).toFixed(3)} %`);
    check(`BAND max <= ${BAND_MAX} m`, st.max <= BAND_MAX, `${fmt(st.max)} m`);

    console.log("\n===== DRITTER SPIEGEL — C) Selbst-Test (Linse nicht vakuös) =====");
    check("Verfälschung griff (Marker ersetzt)", out.verfaelschtGriff === true);
    if (Array.isArray(out.gpuBad)) {
        const stBad = statistik(out.ref, out.gpuBad);
        console.log(
            `  verfälschter Shader: meanAbs=${fmt(stBad.meanAbs)} m · p95=${fmt(stBad.p95)} m · max=${fmt(stBad.max)} m`
        );
        const sprengt =
            stBad.meanAbs > BAND_MEAN ||
            stBad.p95 > BAND_P95 ||
            stBad.anteilUeber2 > BAND_UEBER2 ||
            stBad.max > BAND_MAX;
        check("SELBST-TEST: injizierte Abweichung sprengt die Bänder", sprengt);
    } else {
        check("SELBST-TEST: verfälschter Lauf lieferte Werte", false);
    }

    if (pageErrors.length) {
        console.log(`  (Info) Page-Errors während des Boots: ${pageErrors.length} — ${pageErrors.slice(0, 2).join(" | ")}`);
        check("kein Page-Error aus feld-wgsl.js", !pageErrors.some((e) => e.includes("feld-wgsl")));
    }

    if (fails > 0) {
        console.log(`\n❌ ROT — ${fails} Prüfung(en) gebrochen.`);
        process.exit(1);
    }
    console.log("\n✅ GRÜN — der dritte Spiegel steht: das Makro-Gesetz zeichnet auf der GPU seh-paritätisch.");
    process.exit(0);
})().catch((e) => {
    console.error("DIAG-FEHLER:", e);
    try {
        server.close();
    } catch (_e) {}
    process.exit(1);
});
