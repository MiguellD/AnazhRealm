// diag-perf-parity.cjs — DIE PERF-PARITÄTS-LINSE (Schöpfer 09.07.2026: „du machst Performance
// abhängig von mir? es gibt Metriken — teile davon kannst du selbst bemessen, mit Profis
// abgleichen"). Die Antwort als Struktur: das PROFI-HUD-Metrik-Set (FPS/CPU/GPU/VIS/DRW/TRI/
// VRAM — das Referenz-Spiel des Schöpfers) wird auf BEIDEN Seiten gemessen — AnazhRealm UND
// der Studio-Wald (der eingefrorene Maßstab, __phytoView + #waldBtn) — plus das Profi-
// Referenzband als dritte Spalte. Hardware faellt aus dem VERHAELTNIS heraus: gleicher
// Container, gleiche Zaehlweise, der Studio-Wald ist die Benchmark auch fuer PERF.
//   Gemessen (hardware-unabhaengig, Null-Renderer/Zensus wo moeglich):
//   - DRW-Zensus: zeichnende Emitter der Szene (die ehrliche V18.427-Sonde)
//   - TRI gesamt / TRI im Sichtradius (fog.far) -> die VIS-Ratio des Referenz-HUDs
//   - Schatten-Caster-Tris (der zweite Voll-Render)
//   - VRAM-Proxy: Geometrie-Puffer-Bytes (dedupliziert) + Textur-Bytes
//   - Asset-Budget je LOD: buildInstance("eiche", 7, 0/1/2) — BEIDE Seiten, derselbe Generator
//   - Studio zusaetzlich GERENDERT: renderer.info.render nach echtem Frame (deckt den
//     FoliagePass, der nicht im Szenen-Graph lebt — der Zensus allein unterzaehlte das Studio)
//   Erster Lauf = BASELINE (docs/analyse/perf-paritaet-baseline-v18432.md); die Gate-
//   Assertions sind STRUKTURELL (beide Seiten gemessen, Zahlen endlich, Report steht) —
//   Schwellen werden nach der V18.346-Disziplin erst auf der Baseline festgezogen.
//   node scripts/diag-perf-parity.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PERF_PORT || 4409);
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

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}
const fmt = (n) =>
    !Number.isFinite(n)
        ? "—"
        : n >= 1e6
          ? (n / 1e6).toFixed(2) + "M"
          : n >= 1e3
            ? (n / 1e3).toFixed(1) + "k"
            : String(Math.round(n));

// Der geteilte Szenen-Zensus — laeuft als String in BEIDEN Seiten (page.evaluate), damit die
// Zaehlweise per Konstruktion identisch ist (eine Quelle, zwei Welten). Zaehlt: zeichnende
// Emitter (DRW-Zensus) · Tris gesamt/instanz-gewichtet · Tris innerhalb radius (VIS) ·
// Schatten-Caster-Tris · Geometrie-Bytes dedupliziert · Textur-Bytes.
const CENSUS_SRC = `(function census(sceneRoot, camPos, radius) {
    const out = { emitters: 0, tris: 0, trisIn: 0, emittersIn: 0, shadowTris: 0, geomBytes: 0, texBytes: 0, instanced: 0 };
    if (!sceneRoot) return out;
    const seenGeom = new Set();
    const seenTex = new Set();
    sceneRoot.traverse((o) => {
        if (!o.visible) return;
        const g = o.geometry;
        if (!g || !(o.isMesh || o.isInstancedMesh || o.isPoints || o.isBatchedMesh)) return;
        const pos = g.attributes && g.attributes.position;
        if (!pos) return;
        const idxCount = g.index ? g.index.count : pos.count;
        const triPer = Math.floor(idxCount / 3);
        const inst = o.isInstancedMesh ? o.count : 1;
        if (o.isInstancedMesh) out.instanced++;
        const tris = triPer * Math.max(1, inst);
        out.emitters++;
        out.tris += tris;
        if (o.castShadow) out.shadowTris += tris;
        // VIS: Welt-Distanz des Objekt-Ursprungs (Instanz-Wolken: die Gruppe traegt die Region).
        // Engine-neutral: matrixWorld.elements direkt lesen (r184-getWorldPosition verlangt
        // einen echten Vector3; beide Seiten aktualisieren Matrizen im (Null-)Render).
        const e = o.matrixWorld && o.matrixWorld.elements;
        const dx = (e ? e[12] : 0) - camPos.x, dz = (e ? e[14] : 0) - camPos.z;
        if (Math.sqrt(dx * dx + dz * dz) <= radius) { out.trisIn += tris; out.emittersIn++; }
        // VRAM-Proxy: Puffer-Bytes EINMAL je Geometrie (Instanzen teilen den Puffer).
        if (!seenGeom.has(g.uuid || g.id)) {
            seenGeom.add(g.uuid || g.id);
            for (const k in g.attributes) {
                const a = g.attributes[k];
                if (a && a.array && a.array.byteLength) out.geomBytes += a.array.byteLength;
            }
            if (g.index && g.index.array) out.geomBytes += g.index.array.byteLength;
        }
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) {
            if (!m) continue;
            for (const mk of ["map", "normalMap", "roughnessMap", "alphaMap", "bumpMap"]) {
                const t = m[mk];
                const img = t && t.image;
                if (img && img.width && !seenTex.has(t.uuid || t.id)) {
                    seenTex.add(t.uuid || t.id);
                    out.texBytes += img.width * img.height * 4;
                }
            }
        }
    });
    return out;
})`;

// Das Profi-Referenzband (das Schoepfer-HUD-Beispiel, 09.07.2026 — ein dichtes 60-fps-Spiel):
// TRI ~680k gerendert / ~700k gesamt · DRW 208 · VIS 57/93 (~61 %) · VRAM ~118 MB ·
// CPU 3,8 ms · GPU 18,5 ms. Dient als Groessenordnungs-Anker, nicht als hartes Gate.
const PROFI = { triRendered: 680000, drw: 208, visPct: 61, vramMB: 118 };

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 240000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });

    // ===== SEITE 1: DER STUDIO-WALD (der Massstab; echter WebGL-Render fuer info.render) =====
    console.log("=== STUDIO-WALD (der Massstab) ===");
    const sp = await browser.newPage();
    await sp.setViewport({ width: 800, height: 500 });
    const spErrs = [];
    sp.on("pageerror", (e) => spErrs.push((e.message || String(e)).split("\n")[0]));
    await sp.goto(`http://127.0.0.1:${PORT}/worlds/terrain/index.html?patch-probe=1`, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
    });
    // CSP-WAND: die Seiten verbieten eval (script-src 'self') — der Zensus wird deshalb in NODE
    // in den Top-Level-Evaluate-String komponiert (Runtime.evaluate ist CSP-exempt; EINE Quelle,
    // zwei Kompositionen — die Zaehlweise bleibt per Konstruktion identisch).
    const studio = await sp.evaluate(`(async () => {
            const census = ${CENSUS_SRC};
            const dl = performance.now() + 60000;
            while (!(window.__phytoView && window.__phytoView.scene) && performance.now() < dl)
                await new Promise((r) => setTimeout(r, 150));
            const V = window.__phytoView;
            if (!V || !V.scene) return { err: "kein __phytoView" };
            const res = { lab: null, wald: null, rendered: null, asset: {} };
            // Asset-Budget je LOD (derselbe Generator wie AnazhRealms Foundry — buildInstance ist global):
            try {
                for (const lod of [0, 1, 2]) {
                    const g = window.buildInstance("eiche", 7, lod);
                    let verts = 0;
                    g.traverse((o) => {
                        if (o.isMesh && o.geometry && o.geometry.attributes.position) verts += o.geometry.attributes.position.count;
                    });
                    res.asset["eiche_l" + lod] = verts;
                    g.traverse((o) => {
                        if (o.isMesh && o.geometry) o.geometry.dispose();
                    });
                }
            } catch (e) {
                res.asset.err = e.message;
            }
            // Den begehbaren WALD betreten (der Massstab-Modus): der echte UI-Pfad.
            const wb = document.getElementById("waldBtn");
            if (wb) wb.click();
            // Aufbau abwarten: Instanz-Zahl plateau-basiert (nicht Wall-Clock).
            let last = -1;
            for (let i = 0; i < 120; i++) {
                await new Promise((r) => setTimeout(r, 250));
                let n = 0;
                V.scene.traverse((o) => {
                    if (o.isInstancedMesh) n += o.count;
                });
                if (n > 0 && n === last && i > 8) break;
                last = n;
            }
            const cam = V.camera;
            const camPos = { x: cam.position.x, z: cam.position.z };
            const radius = V.scene.fog && V.scene.fog.far ? V.scene.fog.far : 300;
            res.fogFar = radius;
            res.wald = census(V.scene, camPos, radius);
            // GERENDERT (deckt den FoliagePass, der NICHT im Szenen-Graph lebt): r128 info.render.
            try {
                const info = V.renderer && V.renderer.info;
                if (info) {
                    V.renderPatch();
                    V.renderPatch();
                    res.rendered = { calls: info.render.calls, triangles: info.render.triangles };
                }
            } catch (e) {
                res.renderedErr = e.message;
            }
            return res;
        })()`);
    await sp.close();

    // ===== SEITE 2: ANAZHREALM (Null-Renderer-Zensus, foundry-ON, volle Welt) =====
    console.log("=== ANAZHREALM (Zensus, volle Welt) ===");
    const ap = await browser.newPage();
    await ap.evaluateOnNewDocument(() => {
        window.__anazhHeadlessSkinResCap = 64;
        window.__anazhForceFoundry = true;
        window.__anazhHeadlessNullRenderer = true;
    });
    const apErrs = [];
    ap.on("pageerror", (e) => apErrs.push((e.message || String(e)).split("\n")[0]));
    await ap.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
    const anazh = await ap.evaluate(`(async () => {
            const census = ${CENSUS_SRC};
            const dl0 = performance.now() + 90000;
            while ((!window.anazhRealm || typeof window.anazhRealm._gameLoopTick !== "function") && performance.now() < dl0)
                await new Promise((r) => setTimeout(r, 150));
            const r = window.anazhRealm;
            if (!r) return { err: "kein anazhRealm" };
            // Welt fuellen: Ticks pumpen bis Ring am Ziel + Chunk-Plateau (count-basiert, last-robust).
            let lastChunks = -1;
            for (let i = 0; i < 400; i++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                if ((i & 15) === 0) {
                    const n = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                    if (n > 0 && n === lastChunks && i > 120) break;
                    lastChunks = n;
                    await new Promise((res2) => setTimeout(res2, 30));
                }
            }
            const p = r.state.player ? r.state.player.position || { x: 0, z: 0 } : { x: 0, z: 0 };
            const fogFar = r.state.scene && r.state.scene.fog ? r.state.scene.fog.far : 200;
            const out = { fogFar, chunks: r.state.voxelChunks ? r.state.voxelChunks.size : 0 };
            out.scene = census(r.state.scene, { x: p.x || 0, z: p.z || 0 }, fogFar);
            // Asset-Budget je LOD aus der EINEN Foundry (derselbe Generator wie das Studio):
            out.asset = {};
            try {
                for (const lod of [0, 1, 2]) {
                    const meshes = await Promise.race([
                        r._foundryRequest("eiche", 7, lod, "summer"),
                        new Promise((res3) => setTimeout(() => res3(null), 25000)),
                    ]);
                    let verts = 0;
                    if (Array.isArray(meshes))
                        for (const m of meshes) if (m && m.position && m.position.array) verts += m.position.array.length / 3;
                    out.asset["eiche_l" + lod] = verts;
                }
            } catch (e) {
                out.asset.err = e.message;
            }
            // CPU-Attribution (die vorhandene perfSense-Wahrheit, hardware-relativ aber portabel):
            const s = r.state.perfSense;
            if (s && s.phases) {
                out.cpu = {};
                for (const k in s.phases) if (s.phases[k] && Number.isFinite(s.phases[k].ewma)) out.cpu[k] = +s.phases[k].ewma.toFixed(2);
            }
            return out;
        })()`);
    await ap.close();
    await browser.close();
    server.close();

    // ===== DER VERGLEICH: AnazhRealm · Studio · Profi-Band =====
    const A = anazh && anazh.scene ? anazh.scene : null;
    const S = studio && studio.wald ? studio.wald : null;
    console.log("\n=== DIE DREI SPALTEN (AnazhRealm · Studio-Massstab · Profi-Referenz) ===");
    const row = (name, a, s, p) =>
        console.log(
            `  ${name.padEnd(26)} ${String(a).padStart(10)} ${String(s).padStart(10)} ${String(p).padStart(10)}`
        );
    row("Metrik", "AnazhRealm", "Studio", "Profi");
    if (A && S) {
        row("DRW-Zensus (Emitter)", fmt(A.emitters), fmt(S.emitters), fmt(PROFI.drw));
        row("TRI gesamt", fmt(A.tris), fmt(S.tris), fmt(PROFI.triRendered));
        row("TRI im Sichtradius", fmt(A.trisIn), fmt(S.trisIn), fmt(PROFI.triRendered));
        row(
            "VIS-Ratio %",
            A.emitters ? Math.round((100 * A.emittersIn) / A.emitters) : 0,
            S.emitters ? Math.round((100 * S.emittersIn) / S.emitters) : 0,
            PROFI.visPct
        );
        row("Schatten-Tris", fmt(A.shadowTris), fmt(S.shadowTris), "—");
        row(
            "VRAM-Proxy MB",
            Math.round((A.geomBytes + A.texBytes) / 1048576),
            Math.round((S.geomBytes + S.texBytes) / 1048576),
            PROFI.vramMB
        );
        row("fog.far m", Math.round(anazh.fogFar), Math.round(studio.fogFar || 0), "—");
        if (studio.rendered)
            row(
                "Studio GERENDERT tri/dc",
                "—",
                `${fmt(studio.rendered.triangles)}/${studio.rendered.calls}`,
                `${fmt(PROFI.triRendered)}/${PROFI.drw}`
            );
    }
    if (anazh && anazh.asset && studio && studio.asset) {
        console.log("\n  Asset-Budget eiche (Verts, derselbe Generator — muss ≈ identisch sein):");
        for (const l of ["eiche_l0", "eiche_l1", "eiche_l2"])
            row("  " + l, fmt(anazh.asset[l]), fmt(studio.asset[l]), "—");
    }
    if (anazh && anazh.cpu) {
        const top = Object.entries(anazh.cpu)
            .sort((x, y) => y[1] - x[1])
            .slice(0, 5);
        console.log("\n  CPU-Attribution (perfSense ewma ms, Top 5): " + top.map(([k, v]) => `${k}=${v}`).join(" · "));
    }

    // ===== STRUKTURELLE GATES (Baseline-Lauf; Schwellen folgen der V18.346-Disziplin) =====
    console.log("\n=== GATES (strukturell) ===");
    check(
        "Studio-Wald gemessen (Emitter > 0, Tris endlich)",
        !!(S && S.emitters > 0 && Number.isFinite(S.tris)),
        studio && studio.err
    );
    check(
        "AnazhRealm gemessen (Emitter > 0, Tris endlich)",
        !!(A && A.emitters > 0 && Number.isFinite(A.tris)),
        anazh && anazh.err
    );
    check("AnazhRealm-Welt stand (Chunks > 0)", !!(anazh && anazh.chunks > 0), anazh ? String(anazh.chunks) : "");
    const aL0 = anazh && anazh.asset ? anazh.asset.eiche_l0 : null;
    const sL0 = studio && studio.asset ? studio.asset.eiche_l0 : null;
    check(
        "Asset-Budget-Paritaet L0 (ein Generator, beide Seiten, ±2 %)",
        Number.isFinite(aL0) && Number.isFinite(sL0) && sL0 > 0 && Math.abs(aL0 - sL0) / sL0 < 0.02,
        `anazh=${fmt(aL0)} studio=${fmt(sL0)}`
    );
    check(
        "Studio GERENDERT gemessen (FoliagePass-Deckung)",
        !!(studio && studio.rendered && studio.rendered.triangles > 0),
        studio && studio.renderedErr
    );

    // Baseline-Report minten (einmalig; existiert er, wird er ueberschrieben — die Zahlen sind
    // der lebende Stand, die Chronik traegt die Geschichte).
    const reportPath = path.join(root, "docs/analyse/perf-paritaet-baseline-v18432.md");
    try {
        const lines = [];
        lines.push("# Perf-Paritäts-Baseline V18.432 — AnazhRealm · Studio-Wald · Profi-Referenz");
        lines.push("");
        lines.push("Gemessen von `gate:perf-parity` (gleicher Container, identische Zensus-Quelle beide Seiten;");
        lines.push("Profi-Band = das Schöpfer-HUD-Referenzspiel 09.07.2026: 60 fps · CPU 3,8 ms · GPU 18,5 ms ·");
        lines.push("VIS 57/93 · DRW 208 · TRI 679,7k/698,2k · VRAM 117,7 MB).");
        lines.push("");
        lines.push("| Metrik | AnazhRealm | Studio (Maßstab) | Profi-Band |");
        lines.push("| --- | ---: | ---: | ---: |");
        if (A && S) {
            lines.push(`| DRW-Zensus (Emitter) | ${fmt(A.emitters)} | ${fmt(S.emitters)} | ${PROFI.drw} |`);
            lines.push(`| TRI gesamt | ${fmt(A.tris)} | ${fmt(S.tris)} | ~${fmt(PROFI.triRendered)} gerendert |`);
            lines.push(`| TRI im Sichtradius | ${fmt(A.trisIn)} | ${fmt(S.trisIn)} | ${fmt(PROFI.triRendered)} |`);
            lines.push(
                `| VIS-Ratio | ${A.emitters ? Math.round((100 * A.emittersIn) / A.emitters) : 0} % | ${S.emitters ? Math.round((100 * S.emittersIn) / S.emitters) : 0} % | ~${PROFI.visPct} % |`
            );
            lines.push(`| Schatten-Tris | ${fmt(A.shadowTris)} | ${fmt(S.shadowTris)} | — |`);
            lines.push(
                `| VRAM-Proxy | ${Math.round((A.geomBytes + A.texBytes) / 1048576)} MB | ${Math.round((S.geomBytes + S.texBytes) / 1048576)} MB | ~${PROFI.vramMB} MB |`
            );
            lines.push(`| fog.far | ${Math.round(anazh.fogFar)} m | ${Math.round(studio.fogFar || 0)} m | — |`);
            if (studio.rendered)
                lines.push(
                    `| Studio GERENDERT (inkl. FoliagePass) | — | ${fmt(studio.rendered.triangles)} tri · ${studio.rendered.calls} dc | ${fmt(PROFI.triRendered)} tri · ${PROFI.drw} dc |`
                );
        }
        lines.push("");
        lines.push("Asset-Budget eiche (Verts je LOD — derselbe Generator, Paritäts-Wand ±2 %):");
        lines.push("");
        for (const l of ["eiche_l0", "eiche_l1", "eiche_l2"])
            lines.push(
                `- ${l}: AnazhRealm ${fmt(anazh && anazh.asset ? anazh.asset[l] : NaN)} · Studio ${fmt(studio && studio.asset ? studio.asset[l] : NaN)}`
            );
        if (anazh && anazh.cpu) {
            lines.push("");
            lines.push(
                "CPU-Attribution (perfSense ewma ms, Top 5): " +
                    Object.entries(anazh.cpu)
                        .sort((x, y) => y[1] - x[1])
                        .slice(0, 5)
                        .map(([k, v]) => `${k}=${v}`)
                        .join(" · ")
            );
        }
        lines.push("");
        lines.push("Lesart: die SPALTEN-VERHÄLTNISSE sind die Wahrheit (Hardware fällt heraus). Der nächste");
        lines.push("Schritt je Lücke steht im Plan (`docs/paritaet-vollendung-plan.md`): TRI-Lücke → der");
        lines.push("Dezimierungs-/Dichte-Faden (§4); DRW/VIS → Cull-/Batch-Fäden; Schwellen-Gates folgen der");
        lines.push("V18.346-Disziplin erst auf dieser Baseline.");
        lines.push("");
        fs.writeFileSync(reportPath, lines.join("\n"));
        check("Baseline-Report gemintet", fs.existsSync(reportPath), "docs/analyse/perf-paritaet-baseline-v18432.md");
    } catch (e) {
        check("Baseline-Report gemintet", false, e.message);
    }

    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — DIE PERF-PARITÄT IST MESSBAR OHNE NUTZER: dasselbe Metrik-Set (Profi-HUD) auf AnazhRealm UND dem Studio-Wald, identische Zensus-Quelle, das Verhältnis ist die Zahl. Baseline steht."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Perf-Paritäts-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
