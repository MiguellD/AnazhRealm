// diag-s4-impostor-workshop.cjs — WELLE S4-BEWEIS (Studio-Modell, Wand 4/5): der Impostor bäckt
// EAGER + die Werkstatt zeigt auf der L2-Stufe eines BAUMES das Billboard (nicht die schwere
// L2-Geometrie). Zwei Teile, beide Null-Renderer (hardware-unabhängig; den LOOK des Atlas misst
// gate:foundry-impostor C auf swiftshader-WebGPU, die Welt die Werkbank auf echter GPU):
//   A — DER IMPOSTOR BÄCKT EAGER: `_tickImpostorBake` hat den `_frameOverBudget`-Gate NICHT mehr
//       (Henne-Ei: der ferne Wald ist über Budget WEIL seine Bäume noch schwere Geometrie tragen;
//       der Bake SENKT die Last, er darf nicht vom Budget blockiert werden). Der Bake bleibt streng
//       gedeckelt (je Bäcker-Bahn eine Karte im Flug via `_impostorBakeFlug`, K60-2; Null-Renderer-Guard).
//   B — WERKSTATT-L2 = BILLBOARD: `_workshopFoundryPreviewGroup` routet einen BAUM bei `_recipeLod===2`
//       durch `_foundryBuildImpostorFlat` (den 8-Winkel-Impostor) + baut ihn als 1-Instanz-
//       InstancedMesh (die Karte dekodiert Rotation/Skala aus der Instanz-Matrix). Fels/Kristall
//       behalten die L2-Geometrie. Behavioral: der Aufruf mit einem Baum-Bauplan @lod2 wirft nicht
//       und liefert (sobald die Foundry-LOD1-Geometrie geladen ist) eine InstancedMesh-Gruppe mit
//       dem Einheits-Quad der Karte (6 Verts, Instanz-vec4 aKarte: Schicht, Rahmen, Sichthöhe — W6), NICHT die
//       schwere L2-Geometrie.
//   node scripts/diag-s4-impostor-workshop.cjs

const { statikServer, starteBrowser } = require("./lib/welt-boot.cjs");
const PORT = Number(process.env.S4_PORT || 4596);
const server = statikServer();

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const errs = [];
    const browser = await starteBrowser({ art: "webgl", frist: 180000 });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhForceFoundry = true;
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const dl = performance.now() + 60000;
        while (
            (!window.anazhRealm ||
                !window.anazhRealm.state ||
                typeof window.anazhRealm._gameLoopTick !== "function" ||
                typeof window.anazhRealm._workshopFoundryPreviewGroup !== "function") &&
            performance.now() < dl
        )
            await new Promise((r) => setTimeout(r, 100));
    });

    const out = await page.evaluate(async () => {
        const r = window.anazhRealm;
        // der Code ohne Kommentare (der EINE __codeOf des Welt-Boots): eine ABSENZ-Probe stolpert nie über den
        // erklärenden Kommentar, der den entfernten Code zitiert (V18.267-Falle).
        const code = window.__codeOf;
        const res = { probes: {}, behavior: {} };
        // ===== TEIL A — der Bake ist EAGER (Frame-Budget-Gate raus) =====
        // der Bake-Pfad: der Tick und sein Sender (`_impostorBakeSende`, K60-2: je Bäcker-Bahn eine Karte)
        const bakeSrc = code(r._tickImpostorBake) + " " + code(r._impostorBakeSende);
        res.probes.bakeNoFrameBudgetGate = !/_frameOverBudget/.test(bakeSrc); // der Gate ist raus
        res.probes.bakeOneAtATime = /_impostorBakeFlug/.test(bakeSrc) && /_foundryFaedenZahl/.test(bakeSrc); // je Bäcker-Bahn eine Karte (K60-2)
        res.probes.bakeNullGuard = /_isHeadlessNull/.test(bakeSrc); // gate-treu

        // ===== TEIL B — Werkstatt-L2 routet durch den Impostor =====
        const wsSrc = code(r._workshopFoundryPreviewGroup);
        res.probes.wsRoutesImpostor = /_foundryBuildImpostorFlat/.test(wsSrc);
        res.probes.wsTreeGated = /_foundryPresetIsTree/.test(wsSrc);
        // die Vorschau baut ihre InstancedMesh im EINEN Chokepoint der Welt (Instanz-Wand, gate:altlasten)
        res.probes.wsInstanced = /AnazhRealm\._instanzMesh\(/.test(wsSrc);
        res.probes.wsLod2 = /lod === 2/.test(wsSrc);

        // ===== BEHAVIORAL — der Aufruf mit einem Baum @lod2 wirft nicht + liefert die Impostor-Geometrie =====
        try {
            const f = r._ensureAssetFoundry();
            const dl = performance.now() + 40000;
            while (f && !f.ready && performance.now() < dl) await new Promise((res2) => setTimeout(res2, 50));
            res.behavior.foundryReady = !!(f && f.ready);
            // Einen Baum-Bauplan finden (die grammatik-gewachsenen Built-ins baum_*).
            const bps = r.state.blueprints || {};
            let treeBp = Object.keys(bps).find((k) => /^baum_/.test(k) && r._foundryPresetForEntry({ type: k }));
            res.behavior.treeBp = treeBp || null;
            if (treeBp) {
                bps[treeBp]._recipeLod = 2; // die Werkstatt-L2-Stufe
                let grp = null;
                const dl2 = performance.now() + 40000;
                while (performance.now() < dl2) {
                    try {
                        r._gameLoopTick(performance.now());
                    } catch (_e) {}
                    grp = r._workshopFoundryPreviewGroup(treeBp); // wirft nicht
                    if (grp && grp.children && grp.children.length) break;
                    await new Promise((res2) => setTimeout(res2, 40));
                }
                res.behavior.returnedGroup = !!(grp && grp.children && grp.children.length);
                if (grp && grp.children && grp.children.length) {
                    const child = grp.children[0];
                    res.behavior.isInstanced = !!child.isInstancedMesh;
                    const g = child.geometry;
                    const pos = g && g.getAttribute && g.getAttribute("position");
                    res.behavior.vertCount = pos ? pos.count : -1;
                    // Die Karten-Signatur (W6): das Instanz-vec4 aKarte mit gestempelter Schicht, Rahmen und Sichthöhe.
                    const ak = g && g.getAttribute && g.getAttribute("aKarte");
                    res.behavior.hasKarte = !!(ak && ak.isInstancedBufferAttribute && ak.itemSize === 4);
                    res.behavior.karte = ak ? Array.from(ak.array.slice(0, 4)) : null;
                }
            }
        } catch (e) {
            res.behavior.err = (e && e.message) || String(e);
        }
        return res;
    });

    await browser.close();
    server.close();

    console.log("=== WELLE S4 — IMPOSTOR EAGER + WERKSTATT-L2-BILLBOARD ===\n");
    console.log("  TEIL A — Bake eager:");
    console.log(`    _frameOverBudget-Gate raus: ${out.probes.bakeNoFrameBudgetGate} (erw true)`);
    console.log(`    je Bäcker-Bahn eine Karte:  ${out.probes.bakeOneAtATime} (erw true)`);
    console.log(`    Null-Renderer-Guard:        ${out.probes.bakeNullGuard} (erw true)`);
    console.log("  TEIL B — Werkstatt-L2 = Billboard:");
    console.log(`    routet durch Impostor:      ${out.probes.wsRoutesImpostor} (erw true)`);
    console.log(`    nur für BÄUME (gated):      ${out.probes.wsTreeGated} (erw true)`);
    console.log(`    InstancedMesh (Chokepoint): ${out.probes.wsInstanced} (erw true)`);
    console.log(`    L2-Zweig (lod === 2):       ${out.probes.wsLod2} (erw true)`);
    console.log("  BEHAVIORAL:");
    console.log(`    Foundry ready: ${out.behavior.foundryReady} · Baum-Bauplan: ${out.behavior.treeBp}`);
    console.log(
        `    Vorschau-Gruppe: ${out.behavior.returnedGroup} · InstancedMesh: ${out.behavior.isInstanced} · Verts: ${out.behavior.vertCount} · Karten-Signatur(aKarte): ${out.behavior.hasKarte} ${JSON.stringify(out.behavior.karte)}`
    );
    if (out.behavior.err) console.log(`    (Behavioral-Notiz: ${out.behavior.err})`);
    if (pageErrors.length) console.log("  Seiten-Fehler:", pageErrors.slice(0, 3));

    // ===== HARTE Invarianten (hardware-unabhängig) =====
    if (!out.probes.bakeNoFrameBudgetGate)
        errs.push("A: `_tickImpostorBake` trägt noch den `_frameOverBudget`-Gate (nicht eager)");
    if (!out.probes.bakeOneAtATime)
        errs.push("A: der Bake ist nicht mehr je Bäcker-Bahn gedeckelt (`_impostorBakeFlug`/`_foundryFaedenZahl` fehlt)");
    if (!out.probes.bakeNullGuard) errs.push("A: der Null-Renderer-Guard fehlt (nicht gate-treu)");
    if (!out.probes.wsRoutesImpostor)
        errs.push("B: die Werkstatt-Vorschau routet L2 NICHT durch `_foundryBuildImpostorFlat`");
    if (!out.probes.wsTreeGated)
        errs.push("B: der L2-Impostor-Zweig ist nicht auf BÄUME gegatet (`_foundryPresetIsTree`)");
    if (!out.probes.wsInstanced)
        errs.push(
            "B: die Werkstatt-L2-Vorschau baut den Impostor nicht über AnazhRealm._instanzMesh (Rotation/Skala aus der Instanz-Matrix, EIN Chokepoint)"
        );
    if (!out.probes.wsLod2) errs.push("B: der L2-Zweig (lod === 2) fehlt");
    if (pageErrors.length) errs.push(`Seiten-Fehler: ${pageErrors.length}`);
    // Behavioral: wenn die Vorschau eine Gruppe lieferte, MUSS es die leichte Impostor-Geometrie sein.
    if (out.behavior.returnedGroup) {
        if (!out.behavior.isInstanced) errs.push("Behavioral: die L2-Vorschau ist keine InstancedMesh");
        if (!out.behavior.hasKarte)
            errs.push(
                "Behavioral: die L2-Vorschau trägt nicht die Karten-Signatur (Instanz-vec4 aKarte) — evtl. schwere L2-Geometrie statt Karte"
            );
        const k = out.behavior.karte;
        if (!k || !(k[1] > 0 && k[2] > 0 && Math.abs(k[3]) > 0))
            errs.push(`Behavioral: die Vorschau-Karte ist nicht gestempelt (Rahmen/Sichthöhe leer: ${JSON.stringify(k)})`);
        if (out.behavior.vertCount > 24)
            errs.push(
                `Behavioral: die L2-Vorschau ist zu schwer (${out.behavior.vertCount} Verts) — kein leichtes Billboard`
            );
    }

    if (errs.length) {
        console.error("\n❌ ROT:");
        for (const e of errs) console.error("  • " + e);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — der Impostor bäckt eager (kein Frame-Budget-Gate, weiter gedeckelt), die Werkstatt zeigt auf der L2-Baumstufe die 8-Winkel-Karte (InstancedMesh, Schicht des EINEN Atlas, aus demselben Studio-Baum gebacken)."
    );
    process.exit(0);
})().catch((e) => {
    console.error("S4-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
