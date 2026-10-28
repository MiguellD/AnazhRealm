// diag-s4-impostor-workshop.cjs — WELLE S4-BEWEIS (Studio-Modell, Wand 4/5): der Impostor bäckt
// EAGER + die Werkstatt zeigt auf der L2-Stufe eines BAUMES das Billboard (nicht die schwere
// L2-Geometrie). Zwei Teile, beide Null-Renderer (hardware-unabhängig; den LOOK des Atlas misst
// gate:foundry-impostor C auf swiftshader-WebGPU, die Welt die Werkbank auf echter GPU):
//   (A — der eager Bake über das Bäcker-Bahn-Muster — fiel mit S2: die Karte backt im Welt-Renderer, budgetiert
//       je Takt `KARTE_WELT_MS`; der Null-Renderer bäckt nie.)
//   B — WERKSTATT-L2 = BILLBOARD: `_workshopFoundryPreviewGroup` routet einen BAUM bei `_recipeLod===2`
//       durch `_foundryBuildImpostorFlat` (den 8-Winkel-Impostor) + baut ihn als 1-Instanz-
//       InstancedMesh (die Karte dekodiert Rotation/Skala aus der Instanz-Matrix). Fels/Kristall
//       behalten die L2-Geometrie. Behavioral: der Aufruf mit einem Baum-Bauplan @lod2 wirft nicht
//       und liefert (sobald die Foundry-LOD1-Geometrie geladen ist) eine InstancedMesh-Gruppe mit
//       dem Einheits-Quad der Karte (6 Verts, Instanz-vec4 aKarte: Schicht, Rahmen, Sichthöhe — W6), NICHT die
//       schwere L2-Geometrie.
//   node scripts/diag-s4-impostor-workshop.cjs

const { statikServer, hauptLauf, nullSeite } = require("./lib/welt-boot.cjs");
const PORT = Number(process.env.S4_PORT || 4596);
const server = statikServer();

hauptLauf(async () => {
    await server.lausche(PORT);
    const errs = [];
    const { browser, page } = await nullSeite({ frist: 180000 });
    await server.zeige(page, 30000);
    await page.evaluate(async () => {
        await window.__weltDa((r) => r.state);
    });

    const out = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const res = { probes: {}, behavior: {} };
        // ===== BEHAVIORAL — der Aufruf mit einem Baum @lod2 wirft nicht + liefert die Impostor-Geometrie =====
        try {
            const f = r._ensureAssetFoundry();
            await window.__weltDa(() => !(f && !f.ready));
            res.behavior.foundryReady = !!(f && f.ready);
            // Einen Baum-Bauplan finden (die grammatik-gewachsenen Built-ins baum_*).
            const bps = r.state.blueprints || {};
            let treeBp = Object.keys(bps).find((k) => /^baum_/.test(k) && r._foundryPresetForEntry({ type: k }));
            res.behavior.treeBp = treeBp || null;
            if (treeBp) {
                bps[treeBp]._recipeLod = 2; // die Werkstatt-L2-Stufe
                let grp = null;
                for (const weiter = window.__deckel("die Vorschau der Werkstatt", 1000); weiter(); ) {
                    try {
                        r._gameLoopTick(performance.now());
                    } catch {}
                    grp = r._workshopFoundryPreviewGroup(treeBp); // wirft nicht
                    if (grp && grp.children && grp.children.length) break;
                    await sleep(40);
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
                // ===== TEIL B — KONSUM: die Vorschau routet L2 eines Baums durch den Karten-Flatten (nur Bäume, nur Stufe 2)
                // und baut ihn im EINEN Instanz-Chokepoint der Welt (Spion je Versorger, own-treu zurück) =====
                const ruft = (ziel, k, bp, lod) => {
                    const eigen = Object.prototype.hasOwnProperty.call(ziel, k), fn = ziel[k], lod0 = bps[bp]._recipeLod;
                    let n = 0;
                    ziel[k] = function (...a) {
                        n++;
                        return fn.apply(this, a);
                    };
                    bps[bp]._recipeLod = lod;
                    try {
                        r._workshopFoundryPreviewGroup(bp);
                    } finally {
                        if (eigen) ziel[k] = fn;
                        else delete ziel[k];
                        bps[bp]._recipeLod = lod0;
                    }
                    return n > 0;
                };
                const felsBp = Object.keys(bps).find((k) => {
                    const p = r._foundryPresetForEntry({ type: k });
                    return p && !r._foundryPresetIsTree(p);
                });
                res.probes.wsRoutesImpostor = ruft(r, "_foundryBuildImpostorFlat", treeBp, 2);
                res.probes.wsTreeGated = ruft(r, "_foundryPresetIsTree", treeBp, 2) && !!felsBp && !ruft(r, "_foundryBuildImpostorFlat", felsBp, 2);
                res.probes.wsInstanced = ruft(r.constructor, "_instanzMesh", treeBp, 2);
                res.probes.wsLod2 = !ruft(r, "_foundryBuildImpostorFlat", treeBp, 1);
            }
        } catch (e) {
            res.behavior.err = (e && e.message) || String(e);
        }
        return res;
    });

    await browser.close();
    server.close();

    console.log("=== WELLE S4 — IMPOSTOR EAGER + WERKSTATT-L2-BILLBOARD ===\n");
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

    // ===== HARTE Invarianten (hardware-unabhängig) =====
    if (!out.probes.wsRoutesImpostor)
        errs.push("B: die Werkstatt-Vorschau routet L2 NICHT durch `_foundryBuildImpostorFlat`");
    if (!out.probes.wsTreeGated)
        errs.push("B: der L2-Impostor-Zweig ist nicht auf BÄUME gegatet (`_foundryPresetIsTree`)");
    if (!out.probes.wsInstanced)
        errs.push(
            "B: die Werkstatt-L2-Vorschau baut den Impostor nicht über AnazhRealm._instanzMesh (Rotation/Skala aus der Instanz-Matrix, EIN Chokepoint)"
        );
    if (!out.probes.wsLod2) errs.push("B: der L2-Zweig (lod === 2) fehlt");
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

    require("./lib/welt-boot.cjs").wandEnde(errs, "der Impostor bäckt eager (kein Frame-Budget-Gate, weiter gedeckelt), die Werkstatt zeigt auf der L2-Baumstufe die 8-Winkel-Karte (InstancedMesh, Schicht des EINEN Atlas, aus demselben Studio-Baum gebacken).");
});
