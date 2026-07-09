// diag-silhouetten-zensus.cjs — DIE STEHENDE SILHOUETTEN-LINSE (W6-Rest, Gesetz #0:
// Linse statt Liste-im-Kopf). DONE-Kriterium 3 („null Fremd-Silhouetten") als abzählbare,
// fail-closed Klassifikation: der Zensus traversiert die GANZE Szene (Null-Renderer,
// foundry-ON, GPU-frei) und ordnet JEDEN zeichnenden Emitter GENAU EINEM Regal zu:
//
//   STUDIO     — aus der Studio-Pipeline (fscatter:* Scatter-Gruppen · f:/fimp:-Leaves der
//                platzierten Architektur · das Studio-Gras-Asset [geo.userData.foundryGras]).
//   SUBSTANZ   — Welt-Substanz ohne Studio-Gegenstück, bewusst KEINE Silhouetten-Frage
//                (Terrain-Chunks · Wasser [isHydrosphere] · Himmel/Gestirne · Kreaturen ·
//                Avatar · nicht-vegetative platzierte Architektur).
//   ENTSCHEID  — dokumentierte Schöpfer-Entscheide (glut* [E-E] · start_plattform +
//                fliegende Inseln [E-F]); im Parity-Shot seit W2 versteckt, in der Welt daheim.
//   VERLETZUNG — alles andere: eine Vegetations-/Deko-Silhouette OHNE Studio-Herkunft
//                (Grammatik-Baum/-Strauch/-Fels · Alt-Tuft-Gras · Totholz · Vor-Studio-
//                Kulissen [HORIZON_MANTLE/Canopy-Shell]) ODER ein UNBEKANNTER Emitter —
//                der Fallback ist bewusst FAIL-CLOSED: was die Linse nicht erklären kann,
//                ist rot, bis es klassifiziert wird (die V18.346-Disziplin: die Teilmenge
//                wird über IDENTITÄT klassifiziert, nie über das gemessene Signal selbst).
//
// Erwartung nach W6 (V18.432): 0 VERLETZUNGEN. Exit ≠ 0 bei jeder Verletzung.
// --selftest injiziert NACH dem echten Zensus zwei Fremd-Emitter (eine Grammatik-Baum-
// Gruppe + einen unbekannten nackten Mesh) und beweist, dass BEIDE Fangpfade feuern
// (Namens-Regel + Fail-Closed-Fallback) — sonst wäre das Grün vakuös.
//   node scripts/diag-silhouetten-zensus.cjs [--selftest]
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = Number(process.env.DIAG_PORT || 4517);
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(fp, (err, data) => {
        if (err) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});
(async () => {
    const selftest = process.argv.includes("--selftest");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 240000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
        window.__anazhHeadlessSkinResCap = 64;
    });
    page.on("pageerror", (e) => console.log("[ERR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const out = await page.evaluate(async (doSelftest) => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        // ── Warmup: Welt bauen (Chunk-Plateau) + Foundry ready + Scatter konvergieren lassen
        // (das bewährte diag-no-second-treebuilder-Rezept — dieselbe Bühne, breiterer Blick).
        const s0 = performance.now();
        while (performance.now() - s0 < 90000) {
            const r0 = window.anazhRealm;
            if (r0 && typeof r0._gameLoopTick === "function") {
                try {
                    r0._gameLoopTick(performance.now());
                } catch (_e) {}
                const sz = r0.state.voxelChunks ? r0.state.voxelChunks.size : 0;
                if (sz >= 25) break;
            }
            await sleep(6);
        }
        const r = window.anazhRealm;
        const o = { foundryEnabled: r._foundryEnabled ? r._foundryEnabled() : false };
        const f = r._ensureAssetFoundry ? r._ensureAssetFoundry() : null;
        const t0 = performance.now();
        while (f && !f.ready && performance.now() - t0 < 30000) await sleep(100);
        o.foundryReady = !!(f && f.ready);
        for (let it = 0; it < 350; it++) {
            r.state._frameOverBudget = false;
            try {
                r._gameLoopTick && r._gameLoopTick(performance.now());
                const pp = r.state.playerMesh && r.state.playerMesh.position;
                if (pp && r._tickScatterStreaming) r._tickScatterStreaming(pp);
            } catch (_e) {}
            await sleep(8);
        }
        try {
            r._drainPendingWaterIso && r._drainPendingWaterIso();
            r._drainPendingGrass && r._drainPendingGrass();
        } catch (_e) {}

        // ── Identitäts-Karten (die Teilmenge wird über IDENTITÄT klassifiziert, V18.346):
        const st = r.state;
        const grassSet = new Set();
        if (st.voxelChunkGrass) for (const m of st.voxelChunkGrass.values()) if (m) grassSet.add(m);
        const waterSet = new Set();
        if (st.voxelChunkWaterIso) for (const m of st.voxelChunkWaterIso.values()) if (m) waterSet.add(m);
        const skySet = new Set(
            [st.skybox, st.sunMesh, st.moonMesh, st.starField, st.waterPlane].filter(Boolean).concat(st.planets || [])
        );
        const islandSet = new Set((st.floatingIslands || []).filter(Boolean));
        const kulissenSet = new Set([st.horizonMantle, st.canopyShell].filter(Boolean));
        // Platzierte/gemergte Architektur: mesh → Bauplan-Name (Wurzel-Objekt des Eintrags).
        const archMeshName = new Map();
        for (const a of st.architectures || []) if (a && a.mesh) archMeshName.set(a.mesh, a.type || "(arch)");
        // Instanz-Gruppen + Batch-Wrapper: mesh → [keys] (ein Batch-Mesh trägt MEHRERE Namen-Keys).
        const meshKeys = new Map();
        if (st.archInstanceGroups)
            for (const [k, g] of st.archInstanceGroups) {
                if (!g || !g.mesh) continue;
                if (!meshKeys.has(g.mesh)) meshKeys.set(g.mesh, []);
                meshKeys.get(g.mesh).push(String(k));
            }

        // ── Die Regeln (erste trifft; Schlüssel = Gruppen-Key `name#leaf[@region]`):
        const VEG =
            /(^|[#@:_])(baum_|strauch|busch|gras|blume|farn|pilz|kiesel|fels|findling|geroell|basalt|sediment|zacken|kristall|stamm_gefallen|totholz|grown_)/i;
        const leafOf = (k) => {
            const i = k.indexOf("#");
            return i >= 0 ? k.slice(i + 1) : "";
        };
        const classifyKey = (k) => {
            if (k.startsWith("fscatter:")) return { b: "studio", why: "fscatter" };
            if (/^(f:|fimp:)/.test(leafOf(k))) return { b: "studio", why: "foundry-leaf" };
            const base = k.split("#")[0];
            if (/glut/i.test(base)) return { b: "entscheid", why: "glut (E-E)" };
            if (/start_plattform/i.test(base)) return { b: "entscheid", why: "start_plattform (E-F)" };
            if (VEG.test(base)) return { b: "verletzung", why: "Grammatik-Vegetation: " + base };
            return { b: "substanz", why: "arch: " + base };
        };
        const classifyName = (nm) => {
            if (/glut/i.test(nm)) return { b: "entscheid", why: "glut (E-E)" };
            if (/start_plattform/i.test(nm)) return { b: "entscheid", why: "start_plattform (E-F)" };
            if (VEG.test(nm)) return { b: "verletzung", why: "Grammatik-Vegetation (merged): " + nm };
            return { b: "substanz", why: "arch-merged: " + nm };
        };
        const chainOf = (node) => {
            const c = [];
            let p = node;
            while (p) {
                c.push(p);
                p = p.parent;
            }
            return c;
        };
        const census = () => {
            const buckets = { studio: 0, substanz: 0, entscheid: 0, verletzung: 0 };
            const detail = { studio: {}, substanz: {}, entscheid: {} };
            const violations = [];
            let emitters = 0,
                leere = 0;
            st.scene.traverse((node) => {
                if (!(node.isMesh || node.isInstancedMesh || node.isBatchedMesh || node.isPoints)) return;
                let vis = node.visible,
                    cur = node.parent;
                while (cur && vis) {
                    if (!cur.visible) vis = false;
                    cur = cur.parent;
                }
                if (!vis) return;
                const g = node.geometry;
                if (!g || !g.attributes || !g.attributes.position) return;
                if (node.isInstancedMesh && !(node.count > 0)) {
                    leere++;
                    return; // leerer Instanz-Pool zeichnet nichts
                }
                emitters++;
                const chain = chainOf(node);
                const tally = (b, label) => {
                    buckets[b]++;
                    if (b === "verletzung") {
                        const keys = meshKeys.get(node) || [];
                        violations.push({
                            label,
                            keys: keys.slice(0, 4),
                            name: node.name || "",
                            type: node.isBatchedMesh
                                ? "batch"
                                : node.isInstancedMesh
                                  ? "inst×" + node.count
                                  : node.isPoints
                                    ? "points"
                                    : "mesh",
                            verts: g.attributes.position.count,
                            userDataKeys: Object.keys(node.userData || {}).slice(0, 6),
                            parents: chain
                                .slice(1)
                                .map((p) => p.name || p.type)
                                .slice(0, 3),
                        });
                    } else {
                        detail[b][label] = (detail[b][label] || 0) + 1;
                    }
                };
                // 1) Gruppen-Schlüssel (Scatter + platzierte Architektur-Instanzen + Batches):
                const keys = meshKeys.get(node);
                if (keys && keys.length) {
                    // Ein Batch-Mesh trägt mehrere Keys — die SCHLECHTESTE Klasse gewinnt
                    // (fail-closed: eine Verletzung im geteilten Batch macht den Batch rot).
                    let worst = null;
                    const rank = { studio: 0, substanz: 1, entscheid: 2, verletzung: 3 };
                    for (const k of keys) {
                        const c = classifyKey(k);
                        if (!worst || rank[c.b] > rank[worst.b]) worst = { b: c.b, why: c.why + " [" + k + "]" };
                    }
                    return tally(worst.b, worst.why);
                }
                // 2) Welt-Substanz-Identitäten:
                if ((node.userData && node.userData.isHydrosphere) || waterSet.has(node))
                    return tally("substanz", "wasser");
                if (node.userData && node.userData.voxelChunkX !== undefined) return tally("substanz", "terrain-chunk");
                if (grassSet.has(node)) {
                    // Studio-Gras trägt den Bäcker-Stempel; ein Gras-Mesh OHNE ihn wäre der
                    // Alt-Tuft-Nachbau (der W6-Fail-Open) → Verletzung.
                    if (g.userData && g.userData.foundryGras) return tally("studio", "gras (foundryGras)");
                    return tally("verletzung", "Gras ohne foundryGras-Stempel (Alt-Tuft?)");
                }
                if (chain.some((p) => skySet.has(p) || (p.userData && p.userData.skyOffset)))
                    return tally("substanz", "himmel/gestirn");
                if (chain.some((p) => p.userData && p.userData.kind === "creature"))
                    return tally("substanz", "kreatur");
                if (st.playerMesh && chain.includes(st.playerMesh)) return tally("substanz", "avatar");
                if (chain.some((p) => islandSet.has(p))) return tally("entscheid", "fliegende Insel (E-F)");
                if (chain.some((p) => kulissenSet.has(p)))
                    return tally("verletzung", "Vor-Studio-Kulisse (Mantle/Shell) im Studio-Regime sichtbar");
                for (const p of chain) {
                    const nm = archMeshName.get(p);
                    if (nm) {
                        const c = classifyName(nm);
                        return tally(c.b, c.why);
                    }
                }
                // 3) FALLBACK — fail-closed: ein Emitter, den keine Identität erklärt, ist rot.
                return tally("verletzung", "UNBEKANNTER Emitter (keine Identität)");
            });
            return { buckets, detail, violations, emitters, leere };
        };

        o.zensus = census();

        // ── Positiv-Beweis: die Linse misst eine LEBENDE Studio-Streu (sonst vakuös).
        o.studioScatterGroups = 0;
        if (st.archInstanceGroups)
            for (const [k, g2] of st.archInstanceGroups)
                if (String(k).startsWith("fscatter:") && g2 && g2.mesh && g2.mesh.count > 0) o.studioScatterGroups++;

        // ── Selbst-Test: zwei injizierte Fremd-Emitter → beide Fangpfade müssen feuern.
        if (doSelftest) {
            const injected = [];
            try {
                const geo = new THREE.BoxGeometry(1, 3, 1);
                const mat = new THREE.MeshBasicMaterial();
                const fake1 = new THREE.InstancedMesh(geo, mat, 4);
                fake1.count = 4;
                fake1.userData.archInstanceKey = "baum_eiche#0@3,3";
                // In die Gruppen-Karte einhängen, wie eine echte Grammatik-Gruppe es wäre:
                if (st.archInstanceGroups)
                    st.archInstanceGroups.set("baum_eiche#0@3,3", { key: "baum_eiche#0@3,3", mesh: fake1 });
                st.scene.add(fake1);
                injected.push(fake1);
                const fake2 = new THREE.Mesh(geo, mat); // nackter Unbekannter → Fallback-Pfad
                st.scene.add(fake2);
                injected.push(fake2);
                // meshKeys ist ein Schnappschuss von VOR der Injektion → fake1 fällt (wie
                // fake2) in den Fail-Closed-Fallback: beide MÜSSEN als +2 Verletzungen
                // zählen. Der Namens-Regel-Pfad (Grammatik-Baum-Key → verletzung) wird
                // zusätzlich PUR über classifyKey geprüft — beide Fangpfade bewiesen:
                const c1 = classifyKey("baum_eiche#0@3,3");
                const c2 = classifyKey("fscatter:eiche:2:0#0@1,1");
                const c3 = classifyKey("tempel#2");
                o.selftestRules = {
                    grammarTreeCaught: c1.b === "verletzung",
                    fscatterStudio: c2.b === "studio",
                    archSubstanz: c3.b === "substanz",
                };
                const z2 = census();
                o.selftest = {
                    before: o.zensus.buckets.verletzung,
                    after: z2.buckets.verletzung,
                    fired: z2.buckets.verletzung === o.zensus.buckets.verletzung + 2,
                };
            } finally {
                for (const m of injected) st.scene.remove(m);
                if (st.archInstanceGroups) st.archInstanceGroups.delete("baum_eiche#0@3,3");
            }
        }
        return o;
    }, selftest);
    await browser.close();
    server.close();

    console.log("=== SILHOUETTEN-ZENSUS (Null-Renderer, foundry-ON) ===");
    console.log(`  foundryEnabled: ${out.foundryEnabled} · foundryReady: ${out.foundryReady}`);
    const z = out.zensus;
    console.log(
        `  Emitter gesamt: ${z.emitters} (leere Pools übersprungen: ${z.leere}) · Studio-Scatter-Gruppen bestückt: ${out.studioScatterGroups}`
    );
    console.log(
        `  STUDIO ${z.buckets.studio} · SUBSTANZ ${z.buckets.substanz} · ENTSCHEID ${z.buckets.entscheid} · VERLETZUNG ${z.buckets.verletzung}`
    );
    for (const b of ["studio", "substanz", "entscheid"]) {
        const rows = Object.entries(z.detail[b]).sort((a, c) => c[1] - a[1]);
        if (rows.length) {
            console.log(`  ── ${b.toUpperCase()}:`);
            for (const [k, n] of rows.slice(0, 12)) console.log(`     ${String(n).padStart(5)} × ${k}`);
            if (rows.length > 12) console.log(`     … (${rows.length - 12} weitere Klassen)`);
        }
    }
    if (z.violations.length) {
        console.log("  ── VERLETZUNGEN (Fremd-Silhouetten):");
        for (const v of z.violations.slice(0, 20)) console.log("     ❌ " + JSON.stringify(v));
        if (z.violations.length > 20) console.log(`     … (${z.violations.length - 20} weitere)`);
    }

    const fails = [];
    if (!out.foundryReady) fails.push("Foundry nicht ready (Linse misst die falsche Welt)");
    if (!(out.studioScatterGroups > 0)) fails.push("keine bestückte fscatter:-Gruppe (Linse misst nichts)");
    if (z.buckets.verletzung > 0) fails.push(`${z.buckets.verletzung} Fremd-Silhouetten (VERLETZUNG)`);
    if (selftest) {
        console.log(
            `  Selbst-Test: Regeln ${JSON.stringify(out.selftestRules)} · Injektion vorher=${out.selftest.before} nachher=${out.selftest.after} → ${out.selftest.fired ? "feuert ✅" : "feuert NICHT ❌"}`
        );
        if (!out.selftest.fired) fails.push("Selbst-Test: injizierte Fremd-Emitter nicht gefangen");
        if (
            !out.selftestRules ||
            !out.selftestRules.grammarTreeCaught ||
            !out.selftestRules.fscatterStudio ||
            !out.selftestRules.archSubstanz
        )
            fails.push("Selbst-Test: Klassifikations-Regeln fehlerhaft");
    }
    if (fails.length) {
        console.log(`\n❌ SILHOUETTEN-ZENSUS ROT: ${fails.join(" · ")}`);
        process.exit(1);
    }
    console.log(
        `\n✅ SILHOUETTEN-ZENSUS GRÜN — ${z.emitters} Emitter erklärt, 0 Fremd-Silhouetten (Studio ${z.buckets.studio} · Substanz ${z.buckets.substanz} · Entscheid ${z.buckets.entscheid}).`
    );
    process.exit(0);
})().catch((e) => {
    console.error("Zensus-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
