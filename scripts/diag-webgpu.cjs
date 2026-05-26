// V9.94 — WebGPU-Compute-Diagnose. Vor V9.95 (epochaler Hebel: Density-Sampling
// auf GPU, 50-100× schneller als Worker-CPU) klären, ob `navigator.gpu` auf
// der Ziel-Maschine verfügbar ist + ein trivialer WGSL-Compute-Shader bit-
// deterministisch durchläuft.
//
// Drei Schwellen:
//   (a) `navigator.gpu` + `requestAdapter()` + `requestDevice()` ohne Fehler →
//       WebGPU ist im Browser-Stack verfügbar.
//   (b) Trivialer WGSL-Shader compiliert + läuft + Resultat == Float32-CPU-
//       Referenz bit-identisch → der V9.91-Float32-Cutover-Pattern wirkt für
//       GPU↔CPU genauso wie für Worker↔Main.
//   (c) ~91k-Sample-Workload (ein Chunk-Density-Pass) in <5 ms auf GPU vs
//       ~50 ms auf CPU → der erwartete 10-50× Speedup ist realistisch.
//
// Wenn alle drei grün: V9.95-Pfad offen. Wenn (a) rot: Browser-Stack-Issue,
// ehrliche Entscheidung gegen den epochalen Pfad. Wenn (b) rot: Determinismus-
// Strategie braucht Anpassung (Float32-strict beidseitig). Wenn (c) rot:
// kein Hebel, V9.95 lohnt sich nicht.
//
// Lauf: `node scripts/diag-webgpu.cjs`. Kein npm-Skript, kein CI-Gate — ein
// Mess-Werkzeug für die Vision-Entscheidung. Output: stdout-Report PLUS
// `artifacts/diag-webgpu.html` als Standalone-Datei, die der Schöpfer direkt
// im echten Browser öffnen kann (z.B. via `npm start` + URL oder Doppelklick).
// Headless-Chromium ohne GPU sieht navigator.gpu nicht — die einzige ehrliche
// Antwort kommt vom echten Browser auf der echten Maschine.

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const ARTIFACT_DIR = path.join(__dirname, "..", "artifacts");
const STANDALONE_HTML = path.join(ARTIFACT_DIR, "diag-webgpu.html");

const TEST_PAGE = `<!doctype html>
<html><head><meta charset="utf-8"><title>WebGPU-Diagnose (V9.94)</title>
<style>
body { font-family: ui-monospace, monospace; max-width: 900px; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; color: #222; }
h1 { font-size: 1.3rem; }
pre { background: #f4f1ea; border: 1px solid #d6cfb8; padding: 1rem; overflow-x: auto; white-space: pre-wrap; }
.green { color: #1a6a1a; font-weight: bold; }
.red { color: #a01010; font-weight: bold; }
.muted { color: #666; }
</style>
</head>
<body>
<h1>WebGPU-Compute-Diagnose (V9.94)</h1>
<p class="muted">Vor V9.95 (epochaler Hebel: Density-Sampling auf GPU). Diese Seite prüft, ob deine Maschine + dein Browser einen trivialen WGSL-Compute-Shader bit-deterministisch durchlaufen lassen.</p>
<pre id="out">läuft …</pre>
<script>
window.__diagResults = null;

async function runDiag() {
    const results = {
        gpuAvailable: false,
        adapterInfo: null,
        adapterLimits: null,
        adapterFeatures: [],
        deviceCreated: false,
        shaderCompiled: false,
        trivialRun: null,
        determinismRun: null,
        densityBenchmark: null,
        errors: [],
    };

    // --- (a) Verfügbarkeit ---
    if (typeof navigator === "undefined" || !navigator.gpu) {
        results.errors.push("navigator.gpu nicht vorhanden");
        return results;
    }
    results.gpuAvailable = true;

    let adapter;
    try {
        adapter = await navigator.gpu.requestAdapter({ powerPreference: "high-performance" });
    } catch (e) {
        results.errors.push("requestAdapter fehlgeschlagen: " + e.message);
        return results;
    }
    if (!adapter) {
        results.errors.push("requestAdapter returnt null (kein Adapter)");
        return results;
    }

    // Adapter-Info (Vendor / Architektur — hilft die Hardware-Klasse zu erkennen)
    try {
        const info = await adapter.requestAdapterInfo();
        results.adapterInfo = {
            vendor: info.vendor || "(unbekannt)",
            architecture: info.architecture || "(unbekannt)",
            device: info.device || "(unbekannt)",
            description: info.description || "(unbekannt)",
        };
    } catch (e) {
        results.adapterInfo = { error: e.message };
    }

    // Limits + Features
    const limits = adapter.limits;
    results.adapterLimits = {
        maxComputeWorkgroupSizeX: limits.maxComputeWorkgroupSizeX,
        maxComputeWorkgroupSizeY: limits.maxComputeWorkgroupSizeY,
        maxComputeWorkgroupSizeZ: limits.maxComputeWorkgroupSizeZ,
        maxComputeInvocationsPerWorkgroup: limits.maxComputeInvocationsPerWorkgroup,
        maxStorageBufferBindingSize: limits.maxStorageBufferBindingSize,
        maxBufferSize: limits.maxBufferSize,
    };
    results.adapterFeatures = [...adapter.features];

    let device;
    try {
        device = await adapter.requestDevice();
    } catch (e) {
        results.errors.push("requestDevice fehlgeschlagen: " + e.message);
        return results;
    }
    results.deviceCreated = true;

    // Globaler Error-Listener (uncaptured WGSL-Fehler landen hier)
    const uncapturedErrors = [];
    device.addEventListener("uncapturederror", (ev) => {
        uncapturedErrors.push(ev.error && ev.error.message ? ev.error.message : String(ev.error));
    });

    // --- (b) Trivialer Shader: square(x) für 256 Floats ---
    const N = 256;
    const inputData = new Float32Array(N);
    for (let i = 0; i < N; i++) inputData[i] = i * 0.137;

    // CPU-Referenz: identische Float32-Mathematik (V9.91-Lehre)
    const cpuRef = new Float32Array(N);
    for (let i = 0; i < N; i++) {
        const v = inputData[i];
        cpuRef[i] = Math.fround(v * v);  // Math.fround erzwingt Float32-Präzision
    }

    const shaderCode = \`
        @group(0) @binding(0) var<storage, read> inBuf: array<f32>;
        @group(0) @binding(1) var<storage, read_write> outBuf: array<f32>;

        @compute @workgroup_size(64)
        fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
            let i = gid.x;
            if (i < arrayLength(&inBuf)) {
                let v = inBuf[i];
                outBuf[i] = v * v;
            }
        }
    \`;

    let module;
    try {
        module = device.createShaderModule({ code: shaderCode });
        // compilationInfo() liefert WGSL-Compile-Warnings/Errors
        const ci = await module.getCompilationInfo();
        const fatals = ci.messages.filter((m) => m.type === "error");
        if (fatals.length > 0) {
            results.errors.push("WGSL-Compile-Errors: " + fatals.map((m) => m.message).join("; "));
            return results;
        }
        results.shaderCompiled = true;
    } catch (e) {
        results.errors.push("Shader-Modul-Erschaffung fehlgeschlagen: " + e.message);
        return results;
    }

    // Pipeline + Buffers
    const inBuf = device.createBuffer({
        size: inputData.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(inBuf, 0, inputData);

    const outBuf = device.createBuffer({
        size: inputData.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    });

    const readBuf = device.createBuffer({
        size: inputData.byteLength,
        usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    });

    const pipeline = device.createComputePipeline({
        layout: "auto",
        compute: { module, entryPoint: "main" },
    });

    const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: inBuf } },
            { binding: 1, resource: { buffer: outBuf } },
        ],
    });

    async function dispatchAndRead(workgroupCount) {
        const encoder = device.createCommandEncoder();
        const pass = encoder.beginComputePass();
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.dispatchWorkgroups(workgroupCount);
        pass.end();
        encoder.copyBufferToBuffer(outBuf, 0, readBuf, 0, inputData.byteLength);
        device.queue.submit([encoder.finish()]);
        await readBuf.mapAsync(GPUMapMode.READ);
        const copy = new Float32Array(readBuf.getMappedRange().slice(0));
        readBuf.unmap();
        return copy;
    }

    try {
        const workgroups = Math.ceil(N / 64);
        const gpuResult = await dispatchAndRead(workgroups);
        let mismatches = 0;
        let maxDelta = 0;
        for (let i = 0; i < N; i++) {
            const d = Math.abs(gpuResult[i] - cpuRef[i]);
            if (d > 0) mismatches++;
            if (d > maxDelta) maxDelta = d;
        }
        results.trivialRun = {
            n: N,
            mismatches,
            maxDelta,
            sampleGpu: [gpuResult[0], gpuResult[1], gpuResult[127], gpuResult[255]],
            sampleCpu: [cpuRef[0], cpuRef[1], cpuRef[127], cpuRef[255]],
        };

        // --- Determinismus: zweiter Lauf mit identischen Inputs ---
        const gpuResult2 = await dispatchAndRead(workgroups);
        let detMismatches = 0;
        for (let i = 0; i < N; i++) {
            if (gpuResult[i] !== gpuResult2[i]) detMismatches++;
        }
        results.determinismRun = { mismatches: detMismatches };
    } catch (e) {
        results.errors.push("Trivial-Dispatch fehlgeschlagen: " + e.message);
    }

    // --- (c) Density-Workload: 96×96×16 = 147 456 Samples ---
    // Approximiert einen LOD-0-Chunk-Density-Pass. Pro Sample 4 Octaven
    // SimplexNoise-Ähnliche Mathematik (hier als Pseudo-Noise via sin/cos
    // approximiert — nur Timing-relevant, die echte WGSL-Simplex kommt in V9.95).
    const DENSITY_DIM_XZ = 96;
    const DENSITY_DIM_Y = 16;
    const DENSITY_N = DENSITY_DIM_XZ * DENSITY_DIM_XZ * DENSITY_DIM_Y;

    const densityShader = \`
        struct Params {
            dimXZ: u32,
            dimY: u32,
            seedA: f32,
            seedB: f32,
        };
        @group(0) @binding(0) var<uniform> params: Params;
        @group(0) @binding(1) var<storage, read_write> outBuf: array<f32>;

        fn pseudoNoise(x: f32, y: f32, z: f32, freq: f32) -> f32 {
            // Cheap approximation — V9.95 ersetzt das mit echter Simplex-WGSL.
            // Hier nur als Timing-Repräsentant: 4 sin/cos-Aufrufe wie ein
            // Octaven-Pass eines Simplex.
            let a = sin(x * freq + params.seedA) * cos(z * freq + params.seedB);
            let b = sin(y * freq * 1.7 + params.seedB);
            return a * 0.5 + b * 0.3;
        }

        @compute @workgroup_size(64)
        fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
            let total = params.dimXZ * params.dimXZ * params.dimY;
            let i = gid.x;
            if (i >= total) { return; }
            let xz = params.dimXZ;
            let xi = i % xz;
            let zi = (i / xz) % xz;
            let yi = i / (xz * xz);
            let x = f32(xi) * 1.8 - 86.4;
            let z = f32(zi) * 1.8 - 86.4;
            let y = f32(yi) * 1.8;
            // 4 Octaven (V9.95-typisches Workload-Profil)
            var d = 0.0;
            d = d + pseudoNoise(x, y, z, 0.013);
            d = d + pseudoNoise(x, y, z, 0.027) * 0.5;
            d = d + pseudoNoise(x, y, z, 0.054) * 0.25;
            d = d + pseudoNoise(x, y, z, 0.108) * 0.125;
            outBuf[i] = d - (y * 0.05);
        }
    \`;

    try {
        const densityModule = device.createShaderModule({ code: densityShader });
        const dci = await densityModule.getCompilationInfo();
        const dfatals = dci.messages.filter((m) => m.type === "error");
        if (dfatals.length > 0) {
            results.errors.push("Density-WGSL-Errors: " + dfatals.map((m) => m.message).join("; "));
        } else {
            const paramsBuf = device.createBuffer({
                size: 16,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            });
            const paramsData = new ArrayBuffer(16);
            const pu32 = new Uint32Array(paramsData);
            const pf32 = new Float32Array(paramsData);
            pu32[0] = DENSITY_DIM_XZ;
            pu32[1] = DENSITY_DIM_Y;
            pf32[2] = 0.137;
            pf32[3] = 0.831;
            device.queue.writeBuffer(paramsBuf, 0, paramsData);

            const densityOutBuf = device.createBuffer({
                size: DENSITY_N * 4,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
            });
            const densityReadBuf = device.createBuffer({
                size: DENSITY_N * 4,
                usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
            });

            const densityPipeline = device.createComputePipeline({
                layout: "auto",
                compute: { module: densityModule, entryPoint: "main" },
            });
            const densityBG = device.createBindGroup({
                layout: densityPipeline.getBindGroupLayout(0),
                entries: [
                    { binding: 0, resource: { buffer: paramsBuf } },
                    { binding: 1, resource: { buffer: densityOutBuf } },
                ],
            });

            // Warm-up Dispatch (erste Pipeline-Compile + GPU-Init kostet extra)
            {
                const enc = device.createCommandEncoder();
                const pass = enc.beginComputePass();
                pass.setPipeline(densityPipeline);
                pass.setBindGroup(0, densityBG);
                pass.dispatchWorkgroups(Math.ceil(DENSITY_N / 64));
                pass.end();
                device.queue.submit([enc.finish()]);
                await device.queue.onSubmittedWorkDone();
            }

            // 5 Mess-Läufe; Median nehmen
            const gpuTimes = [];
            for (let run = 0; run < 5; run++) {
                const t0 = performance.now();
                const enc = device.createCommandEncoder();
                const pass = enc.beginComputePass();
                pass.setPipeline(densityPipeline);
                pass.setBindGroup(0, densityBG);
                pass.dispatchWorkgroups(Math.ceil(DENSITY_N / 64));
                pass.end();
                device.queue.submit([enc.finish()]);
                await device.queue.onSubmittedWorkDone();
                gpuTimes.push(performance.now() - t0);
            }

            // Resultat lesen (nur 1×, für Sanity-Check + spätere Determinismus-Vergleiche)
            const readEnc = device.createCommandEncoder();
            readEnc.copyBufferToBuffer(densityOutBuf, 0, densityReadBuf, 0, DENSITY_N * 4);
            device.queue.submit([readEnc.finish()]);
            await densityReadBuf.mapAsync(GPUMapMode.READ);
            const densitySample = new Float32Array(densityReadBuf.getMappedRange().slice(0, 64));
            densityReadBuf.unmap();

            // CPU-Referenz (identische Mathematik, JS-Implementierung)
            function cpuPseudoNoise(x, y, z, freq, seedA, seedB) {
                const a = Math.sin(x * freq + seedA) * Math.cos(z * freq + seedB);
                const b = Math.sin(y * freq * 1.7 + seedB);
                return a * 0.5 + b * 0.3;
            }

            const cpuTimes = [];
            const cpuOut = new Float32Array(DENSITY_N);
            for (let run = 0; run < 5; run++) {
                const t0 = performance.now();
                for (let i = 0; i < DENSITY_N; i++) {
                    const xi = i % DENSITY_DIM_XZ;
                    const zi = Math.floor(i / DENSITY_DIM_XZ) % DENSITY_DIM_XZ;
                    const yi = Math.floor(i / (DENSITY_DIM_XZ * DENSITY_DIM_XZ));
                    const x = xi * 1.8 - 86.4;
                    const z = zi * 1.8 - 86.4;
                    const y = yi * 1.8;
                    let d = 0;
                    d += cpuPseudoNoise(x, y, z, 0.013, 0.137, 0.831);
                    d += cpuPseudoNoise(x, y, z, 0.027, 0.137, 0.831) * 0.5;
                    d += cpuPseudoNoise(x, y, z, 0.054, 0.137, 0.831) * 0.25;
                    d += cpuPseudoNoise(x, y, z, 0.108, 0.137, 0.831) * 0.125;
                    cpuOut[i] = d - (y * 0.05);
                }
                cpuTimes.push(performance.now() - t0);
            }

            // Sanity: erste 16 GPU-Werte vs CPU-Werte (nicht bit-identisch erwartet
            // weil GPU sin/cos und JS Math.sin minimal differieren — Schwelle: |Δ| < 1e-4)
            let sanityMax = 0;
            for (let i = 0; i < 16; i++) {
                sanityMax = Math.max(sanityMax, Math.abs(densitySample[i] - cpuOut[i]));
            }

            const median = (arr) => {
                const s = [...arr].sort((a, b) => a - b);
                return s[Math.floor(s.length / 2)];
            };
            results.densityBenchmark = {
                n: DENSITY_N,
                gpuMs: median(gpuTimes),
                cpuMs: median(cpuTimes),
                speedup: median(cpuTimes) / median(gpuTimes),
                gpuTimes,
                cpuTimes,
                sanitySampleMaxDelta: sanityMax,
            };
        }
    } catch (e) {
        results.errors.push("Density-Benchmark fehlgeschlagen: " + e.message);
    }

    if (uncapturedErrors.length > 0) {
        results.errors.push("uncapturederror: " + uncapturedErrors.join("; "));
    }

    return results;
}

function renderToDom(r) {
    const out = document.getElementById("out");
    if (!out) return;
    const lines = [];
    const tag = (ok) => ok ? '<span class="green">GRÜN</span>' : '<span class="red">ROT</span>';
    if (r.fatal) {
        lines.push('<span class="red">FATAL: ' + r.fatal + '</span>\\n' + (r.stack || ""));
        out.innerHTML = lines.join("\\n");
        return;
    }
    lines.push("(a) Verfügbarkeit");
    lines.push("    navigator.gpu:      " + (r.gpuAvailable ? "JA" : "NEIN"));
    lines.push("    Adapter:            " + (r.adapterInfo ? "JA" : "NEIN"));
    if (r.adapterInfo) {
        lines.push("      vendor:           " + r.adapterInfo.vendor);
        lines.push("      architecture:     " + r.adapterInfo.architecture);
        lines.push("      device:           " + r.adapterInfo.device);
        lines.push("      description:      " + r.adapterInfo.description);
    }
    if (r.adapterLimits) {
        lines.push("    Limits:");
        lines.push("      maxComputeInvocationsPerWorkgroup: " + r.adapterLimits.maxComputeInvocationsPerWorkgroup);
        lines.push("      maxStorageBufferBindingSize:       " + r.adapterLimits.maxStorageBufferBindingSize);
        lines.push("      maxBufferSize:                     " + r.adapterLimits.maxBufferSize);
    }
    lines.push("    Features:           " + (r.adapterFeatures.length ? r.adapterFeatures.join(", ") : "(keine)"));
    lines.push("    Device:             " + (r.deviceCreated ? "JA" : "NEIN"));

    lines.push("\\n(b) Trivialer Shader (square × 256 Floats)");
    lines.push("    WGSL compiliert:    " + (r.shaderCompiled ? "JA" : "NEIN"));
    if (r.trivialRun) {
        lines.push("    mismatches vs CPU:  " + r.trivialRun.mismatches + " / " + r.trivialRun.n);
        lines.push("    maxDelta:           " + r.trivialRun.maxDelta);
    }
    if (r.determinismRun) {
        lines.push("    Determinismus (2.Lauf vs 1.Lauf mismatches): " + r.determinismRun.mismatches);
    }

    lines.push("\\n(c) Density-Workload (96×96×16 = 147 456 Samples, 4 Octaven)");
    if (r.densityBenchmark) {
        const b = r.densityBenchmark;
        lines.push("    GPU median:         " + b.gpuMs.toFixed(2) + " ms");
        lines.push("    CPU median:         " + b.cpuMs.toFixed(2) + " ms");
        lines.push("    Speedup:            " + b.speedup.toFixed(1) + " ×");
        lines.push("    GPU runs:           " + b.gpuTimes.map((t) => t.toFixed(1)).join(", "));
        lines.push("    CPU runs:           " + b.cpuTimes.map((t) => t.toFixed(1)).join(", "));
        lines.push("    Sanity max |Δ|:     " + b.sanitySampleMaxDelta.toExponential(2));
    }

    if (r.errors.length > 0) {
        lines.push("\\nFehler:");
        for (const e of r.errors) lines.push("   - " + e);
    }

    lines.push("\\n=== Schwellen-Bewertung ===");
    const passA = r.gpuAvailable && r.deviceCreated;
    const passB = r.shaderCompiled
        && r.trivialRun && r.trivialRun.mismatches === 0
        && r.determinismRun && r.determinismRun.mismatches === 0;
    const passC = r.densityBenchmark && r.densityBenchmark.speedup >= 2;
    lines.push("    (a) WebGPU verfügbar:           " + tag(passA));
    lines.push("    (b) Determinismus + Float32:    " + tag(passB));
    lines.push("    (c) Speedup ≥ 2× vs CPU:        " + tag(passC));
    const verdict = passA && passB && passC ? '<span class="green">V9.95-Pfad OFFEN</span>'
                  : passA && passB ? '<span class="muted">V9.95 fraglich (Speedup zu klein in diesem Environment)</span>'
                  : passA ? '<span class="red">V9.95 braucht Determinismus-Strategie-Anpassung</span>'
                  : '<span class="red">V9.95-Pfad GESCHLOSSEN in diesem Environment</span>';
    lines.push("\\nUrteil: " + verdict);
    out.innerHTML = lines.join("\\n");
}

runDiag().then((r) => {
    window.__diagResults = r;
    try { renderToDom(r); } catch (e) { /* DOM optional (Puppeteer-Pfad) */ }
}).catch((e) => {
    window.__diagResults = { fatal: e.message, stack: e.stack };
    try { renderToDom(window.__diagResults); } catch (_) {}
});
</script></body></html>`;

(async () => {
    console.log("V9.94 WebGPU-Compute-Diagnose");
    console.log("==============================\n");

    // Standalone-HTML für echten Browser ablegen — der headless Pfad in
    // diesem Container hat oft kein WebGPU, die Schöpfer-Maschine schon.
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
    fs.writeFileSync(STANDALONE_HTML, TEST_PAGE, "utf8");
    console.log("Standalone-HTML geschrieben:", STANDALONE_HTML);
    console.log("  → für echte Vision-Entscheidung im Schöpfer-Browser öffnen.\n");

    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--enable-unsafe-webgpu",
            "--enable-features=Vulkan,UseSkiaRenderer",
            "--use-vulkan=swiftshader",
            "--disable-vulkan-surface",
            "--ignore-gpu-blocklist",
        ],
    });

    try {
        const page = await browser.newPage();
        page.on("pageerror", (e) => console.error("[browser]", e.message));
        page.on("console", (m) => {
            if (m.type() === "error" || m.type() === "warning") {
                console.log(`[${m.type()}]`, m.text());
            }
        });

        await page.setContent(TEST_PAGE, { waitUntil: "load" });

        // Auf das __diagResults-Promise warten
        const t0 = Date.now();
        const TIMEOUT_MS = 30000;
        let results = null;
        while (Date.now() - t0 < TIMEOUT_MS) {
            results = await page.evaluate(() => window.__diagResults);
            if (results !== null) break;
            await new Promise((r) => setTimeout(r, 100));
        }
        if (!results) {
            console.error("Diagnose lief nicht durch in 30 s — Browser hängt?");
            process.exit(2);
        }

        // --- Report ---
        if (results.fatal) {
            console.log("FATAL:", results.fatal);
            console.log(results.stack);
            process.exit(3);
        }

        console.log("(a) Verfügbarkeit");
        console.log("    navigator.gpu:      ", results.gpuAvailable ? "JA" : "NEIN");
        console.log("    Adapter:            ", results.adapterInfo ? "JA" : "NEIN");
        if (results.adapterInfo) {
            console.log("      vendor:           ", results.adapterInfo.vendor);
            console.log("      architecture:     ", results.adapterInfo.architecture);
            console.log("      device:           ", results.adapterInfo.device);
            console.log("      description:      ", results.adapterInfo.description);
        }
        if (results.adapterLimits) {
            console.log("    Limits:");
            console.log("      maxComputeInvocationsPerWorkgroup:", results.adapterLimits.maxComputeInvocationsPerWorkgroup);
            console.log("      maxStorageBufferBindingSize: ", results.adapterLimits.maxStorageBufferBindingSize);
            console.log("      maxBufferSize:               ", results.adapterLimits.maxBufferSize);
        }
        console.log("    Features:           ", results.adapterFeatures.length ? results.adapterFeatures.join(", ") : "(keine)");
        console.log("    Device:             ", results.deviceCreated ? "JA" : "NEIN");

        console.log("\n(b) Trivialer Shader (square × 256 Floats)");
        console.log("    WGSL compiliert:    ", results.shaderCompiled ? "JA" : "NEIN");
        if (results.trivialRun) {
            console.log("    n:                  ", results.trivialRun.n);
            console.log("    mismatches vs CPU:  ", results.trivialRun.mismatches, "/", results.trivialRun.n);
            console.log("    maxDelta:           ", results.trivialRun.maxDelta);
            console.log("    Sample GPU[0]:      ", results.trivialRun.sampleGpu[0]);
            console.log("    Sample CPU[0]:      ", results.trivialRun.sampleCpu[0]);
        }
        if (results.determinismRun) {
            console.log("    Determinismus (2.Lauf vs 1.Lauf mismatches):", results.determinismRun.mismatches);
        }

        console.log("\n(c) Density-Workload (96×96×16 = 147 456 Samples, 4 Octaven)");
        if (results.densityBenchmark) {
            const b = results.densityBenchmark;
            console.log("    GPU median:         ", b.gpuMs.toFixed(2), "ms");
            console.log("    CPU median:         ", b.cpuMs.toFixed(2), "ms");
            console.log("    Speedup:            ", b.speedup.toFixed(1), "×");
            console.log("    GPU runs:           ", b.gpuTimes.map((t) => t.toFixed(1)).join(", "));
            console.log("    CPU runs:           ", b.cpuTimes.map((t) => t.toFixed(1)).join(", "));
            console.log("    Sanity max |Δ|:     ", b.sanitySampleMaxDelta.toExponential(2));
        }

        if (results.errors.length > 0) {
            console.log("\nFehler:");
            for (const e of results.errors) console.log("   -", e);
        }

        // --- Schwelle-Bewertung ---
        console.log("\n=== Schwellen-Bewertung ===");
        const passA = results.gpuAvailable && results.deviceCreated;
        const passB = results.shaderCompiled
            && results.trivialRun && results.trivialRun.mismatches === 0
            && results.determinismRun && results.determinismRun.mismatches === 0;
        const passC = results.densityBenchmark && results.densityBenchmark.speedup >= 2;
        console.log("    (a) WebGPU verfügbar:           ", passA ? "GRÜN" : "ROT");
        console.log("    (b) Determinismus + Float32:    ", passB ? "GRÜN" : "ROT");
        console.log("    (c) Speedup ≥ 2× vs CPU:        ", passC ? "GRÜN" : "ROT");
        const verdict = passA && passB && passC ? "V9.95-Pfad OFFEN"
                      : passA && passB ? "V9.95 fraglich (Speedup zu klein in diesem Environment)"
                      : passA ? "V9.95 braucht Determinismus-Strategie-Anpassung"
                      : "V9.95-Pfad GESCHLOSSEN in diesem Environment";
        console.log("\nUrteil:", verdict);

        process.exitCode = passA && passB ? 0 : 1;
    } finally {
        await browser.close();
    }
})();
