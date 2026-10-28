// diag-render-diaet.cjs — DIE RENDER-DIÄT (die Schwester-Hälfte der Fern-Diät):
// EIN geteiltes Material je TAG-SIGNATUR (`_sharedFoliageMaterial`,
// das bewiesene Muster); die Part-Farbe reist als INSTANZ-Farbe über den
// bestehenden Tint-Kanal (leaf.tint → `_archSlotColor` → setColorAt — EINE Naht,
// die Engine multipliziert instanceColor auf den colorNode). AUSNAHME
// (fail-closed): GLÜHENDE Substanz (das Emissiv im PBR-Bau konsumiert opts.color —
// Glut/Quarz glimmen in der EIGENEN Farbe) behält die Farbe in der Signatur,
// memoisiert teilen identische Parts trotzdem.
//
// BLÖCKE (headless, foundry-ON, Null-Renderer — das diag-scatter-lod/diag-trias-Muster):
//   Q (Quelle): EIN Hebel-Konsument (_archLeafMaterial) · die EINE Slot-Farb-Naht
//     (_archSlotColor in BEIDEN Slot-Schreibern, kein dritter setColorAt-Pfad) ·
//     der Emissiv-Spiegel (PBR-Bau ↔ Leaf-Material: dieselbe −0.5/0.01-Klammer) ·
//     die Dispose-Wand (geteilte Materialien fallen nie).
//   S (Selbst-Test, A/B durch DIESELBE Pipe via ARCH_LEAF_MAT_SHARED): das ALTE
//     Muster (Hebel=false) MUSS die Linse erkennen — 6 Farben = 6 Materialien =
//     6 Material-Familien; erst das beweist, dass der NEU-Block nicht vakuös grün ist.
//   N (Neu): Materialien je Tag-Signatur == 1 (6 Farben → EIN geteiltes weißes
//     Material) · Familien-Zahl 6 → 1 (nur-sinkender Anker: ≤ RD_FAMILIEN_ANKER) ·
//     Slot-Bilanz dicht (Empty-Dispose räumt beide Welten restlos).
//   F (Farb-Wahrheit): Stichproben-Instanzen tragen ihre PART-Farbe über den
//     Instanz-Kanal (getColorAt == _archPartTintColor, ≠ weiß, ≠ untereinander —
//     kein Grau-Einheitsbrei) · die Naht zum Entry-Tint kollidiert nicht (stein
//     ignoriert den Entry-Tint wie immer; erde [useInstanceTint] multipliziert
//     Part × Entry) · die Glüh-Ausnahme (glut: Farbe gebacken, Emissiv lebt,
//     identische Parts teilen memoisiert EIN Material).
//   W (Welt): in der gebauten Dorf-/Wald-Szene stammt JEDES leaf.tint-Material
//     aus dem EINEN _foliageMatCache (Map Signatur→Material ⇒ je Signatur genau
//     EIN Material per Konstruktion); Leaves/Materialien/Gruppen dokumentiert.
//
//   node scripts/diag-render-diaet.cjs
"use strict";
const { statikServer, hauptLauf, nullSeite, pruefer, wandEnde } = require("./lib/welt-boot.cjs");
const stammLib = require("./lib/stamm.cjs");

const PORT = Number(process.env.RENDER_DIAET_PORT || 4444);
// Der nur-sinkende ANKER: die 6-Farben-Fixture darf höchstens SO viele Material-Familien
// erzeugen (heute 1 — EIN geteiltes Material; er darf nie steigen).
const RD_FAMILIEN_ANKER = 1;
const server = statikServer();

const { errs, check } = pruefer();

hauptLauf(async () => {
    // ── Q: die Quell-Absenz über den EINEN Helfer (Chokepoint-Disziplin, kein Parallelpfad): kein dritter setColorAt-Pfad
    // in den zwei Slot-Schreibern (die alte useInstanceTint-Direktklammer ist gefallen; ein totes Glied wirft).
    check(
        "Q: kein zweiter Farb-Pfad — die Slot-Schreiber setzen Farben NUR über die Naht (kein useInstanceTint-gegatetes setColorAt mehr)",
        stammLib.fehlt(["_archInstanceAdd", "_scatterInstanceAdd"], /userData\.useInstanceTint\)[\s\S]{0,80}setColorAt/),
        stammLib.fehlt.wo
    );
    await server.lausche(PORT);
    const { browser, page } = await nullSeite({ frist: 300000 });
    await server.zeige(page, 30000);

    const out = await page.evaluate(async () => {
        const res = {};
        const r = await window.__weltDa();
        const AR = r.constructor;
        // Foundry warm ziehen (Produktions-Boot) + den WALD bauen (Scatter-Zellen).
        const f = r._ensureAssetFoundry();
        await window.__weltDa(() => f && f.ready);
        const pm = r.state.playerMesh.position;
        let cells = 0;
        for (const weiter = window.__deckel("die Streu-Zellen", 1500); weiter(); ) {
            r._tickScatterStreaming(pm);
            const map = r.state.scatterRegions;
            cells = 0;
            if (map) for (const reg of map.values()) cells += reg.cells ? reg.cells.length : 0;
            if (cells > 40) break;
            await sleep(30);
        }
        res.cells = cells;

        // ── Fixturen: das DORF-Deko-Muster durch die ECHTE Pipe (instanced-Bauplan,
        //    Per-Part-Pfad — 6 Parts, EIN Material [stein], 6 FARBEN) ──
        const FARBEN = [0xcc3322, 0x2266cc, 0x22aa44, 0xddaa22, 0x8844cc, 0x555555];
        const mkBp = (name, material, farben) => {
            const parts = farben.map((c, i) => ({
                shape: "box",
                material,
                color: c,
                size: { x: 0.8, y: 0.8, z: 0.8 },
                position: { x: (i % 3) - 1, y: 0.4 + Math.floor(i / 3), z: 0 },
            }));
            r.state.blueprints[name] = { name, label: name, builtIn: false, instanced: true, parts };
            return r.state.blueprints[name];
        };

        // Zähler UNSERER Fixturen (streaming-fest: nur die Gruppen des Fixtur-Bauplans): Gruppen (w) und
        // Material-Familien (b = verschiedene Materialien ihrer Meshes = Pipelines).
        const zaehle = (regTag) => {
            let w = 0;
            const fam = new Set();
            if (r.state.archInstanceGroups)
                for (const [k, g] of r.state.archInstanceGroups)
                    if (k.includes(regTag)) {
                        w++;
                        if (g && g.mesh && g.mesh.material) fam.add(g.mesh.material);
                    }
            return { w, b: fam.size };
        };
        const R = AR.ARCH_REGION_M;
        // EINE Welt = Hebel + eigener Bauplan-Name + eigene Region (kein Cache-Kontakt).
        const welt = (shared, name, rx, rz) => {
            AR.ARCH_LEAF_MAT_SHARED = shared;
            const o = { name };
            try {
                mkBp(name, "stein", FARBEN);
                const flat = r._archFlattenBlueprint(name);
                o.instanceable = !!(flat && flat.instanceable);
                if (!o.instanceable) {
                    o.reason = flat && flat.reason;
                    return o;
                }
                const mats = new Set(flat.leaves.map((l) => l.mat));
                o.leaves = flat.leaves.length;
                o.mats = mats.size; // Materialien je Tag-Signatur (alle 6 Parts = stein)
                o.tints = flat.leaves.filter((l) => l.tint !== undefined).length;
                // der platzierte Bau ist global — die Fixtur zählt über ihren EIGENEN Bauplan-Namen
                const regTag = name + "#";
                const vor = zaehle(regTag);
                const entries = [];
                for (let i = 0; i < 4; i++) {
                    const e = {
                        type: name,
                        seed: 7 + i,
                        scale: 1,
                        position: { x: rx * R + 8 + i * 3, y: 0, z: rz * R + 8 },
                    };
                    r._archInstanceAdd(e, flat);
                    entries.push(e);
                }
                const mit = zaehle(regTag);
                o.familien = mit.b - vor.b;
                o.wrappers = mit.w - vor.w;
                o.entries = entries;
                o.probeFlat = flat;
                o.drain = () => {
                    for (const e of entries) r._archInstanceRemove(e);
                    const nach = zaehle(regTag);
                    return { leckB: nach.b - vor.b, leckW: nach.w - vor.w };
                };
            } catch (e) {
                o.err = String((e && e.message) || e);
            }
            return o;
        };

        // ── S: das ALTE Muster (Hebel=false) — die Linse MUSS es erkennen ──
        const alt = welt(false, "rd_fixture_alt", 953, 947);
        res.alt = {
            instanceable: alt.instanceable,
            leaves: alt.leaves,
            mats: alt.mats,
            tints: alt.tints,
            familien: alt.familien,
            wrappers: alt.wrappers,
            err: alt.err || null,
        };
        if (alt.drain) res.alt.leck = alt.drain();

        // ── N: das NEUE Muster (Produktions-Hebel) durch DIESELBE Pipe ──
        const neu = welt(true, "rd_fixture_neu", 953, 949);
        res.neu = {
            instanceable: neu.instanceable,
            leaves: neu.leaves,
            mats: neu.mats,
            tints: neu.tints,
            familien: neu.familien,
            wrappers: neu.wrappers,
            err: neu.err || null,
        };
        // Struktur des EINEN geteilten Materials: weiß + leafTint + sharedFoliage.
        if (neu.probeFlat) {
            const m0 = neu.probeFlat.leaves[0].mat;
            res.neu.matWeiss = m0 && m0.color && m0.color.getHex() === 0xffffff;
            res.neu.matMarker = !!(m0 && m0.userData && m0.userData.leafTint && m0.userData.sharedFoliage);
        }

        // ── F: die FARB-WAHRHEIT am lebenden Slot (bevor die NEU-Welt drainiert) ──
        try {
            const farbe = {};
            const flat = neu.probeFlat;
            const e0 = neu.entries[0];
            const les = (slotRef) => {
                const g = r.state.archInstanceGroups.get(slotRef.key);
                const c = r._archTmpTintColor.clone().set(0xffffff);
                g.mesh.getColorAt(slotRef.slot, c);
                return { c, kind: g.kind || "inst" };
            };
            const erwarte = (part) => r._archTmpTintColor.clone().set(0xffffff).setHex(r._archPartTintColor(part));
            const bp = r.state.blueprints["rd_fixture_neu"];
            const p0 = les(e0.instSlots[0]);
            const p1 = les(e0.instSlots[1]);
            const soll0 = erwarte(bp.parts[0]);
            const soll1 = erwarte(bp.parts[1]);
            const nah = (a, b) =>
                Math.abs(a.r - b.r) < 1e-3 && Math.abs(a.g - b.g) < 1e-3 && Math.abs(a.b - b.b) < 1e-3;
            farbe.kanal = p0.kind;
            farbe.part0 = nah(p0.c, soll0);
            farbe.part1 = nah(p1.c, soll1);
            const weiss = r._archTmpTintColor.clone().setRGB(1, 1, 1);
            farbe.nichtWeiss = !nah(p0.c, weiss) && !nah(p1.c, weiss);
            farbe.verschieden = !nah(p0.c, p1.c);
            farbe.ist0 = [p0.c.r.toFixed(3), p0.c.g.toFixed(3), p0.c.b.toFixed(3)].join(",");
            // Naht-Kollision: der ENTRY-Tint trifft NUR useInstanceTint-Materialien.
            // stein (kein Tint-Marker) ignoriert ihn (Parität mit der alten Welt);
            // erde (lebendig>0.5, glüht nicht) multipliziert Part × Entry.
            mkBp("rd_naht", "erde", [0xcc3322]);
            const nahtFlat = r._archFlattenBlueprint("rd_naht");
            const eT = {
                type: "rd_naht",
                seed: 3,
                scale: 1,
                tintH: 0.5,
                tintS: 0.6,
                tintV: 0.7,
                position: { x: 953 * R + 40, y: 0, z: 949 * R + 40 },
            };
            r._archInstanceAdd(eT, nahtFlat);
            const eS = {
                type: "rd_fixture_neu",
                seed: 4,
                scale: 1,
                tintH: 0.5,
                tintS: 0.6,
                tintV: 0.7,
                position: { x: 953 * R + 46, y: 0, z: 949 * R + 40 },
            };
            r._archInstanceAdd(eS, flat);
            const erdeMat = nahtFlat.instanceable && nahtFlat.leaves[0].mat;
            farbe.erdeKanaele = !!(
                erdeMat &&
                erdeMat.userData &&
                erdeMat.userData.leafTint &&
                erdeMat.userData.useInstanceTint
            );
            const gotErde = les(eT.instSlots[0]).c;
            const sollErde = erwarte(r.state.blueprints["rd_naht"].parts[0]).multiply(
                r._archTmpTintColor.clone().setRGB(0.5, 0.6, 0.7)
            );
            farbe.erdeProdukt = nah(gotErde, sollErde);
            const gotStein = les(eS.instSlots[0]).c;
            farbe.steinIgnoriertEntry = nah(gotStein, soll0);
            r._archInstanceRemove(eT);
            r._archInstanceRemove(eS);
            // Die GLÜH-Ausnahme: glut backt die Farbe (Emissiv in der eigenen Farbe),
            // identische Parts teilen memoisiert trotzdem EIN Material.
            mkBp("rd_glut_a", "glut", [0xff5a14]);
            mkBp("rd_glut_b", "glut", [0xff5a14]);
            const ga = r._archFlattenBlueprint("rd_glut_a");
            const gb = r._archFlattenBlueprint("rd_glut_b");
            const gm = ga.instanceable && ga.leaves[0].mat;
            farbe.glutGebacken = !!(gm && (!gm.userData || !gm.userData.leafTint) && gm.color.getHex() !== 0xffffff);
            farbe.glutEmissiv = !!(gm && gm.emissive && gm.emissive.r + gm.emissive.g + gm.emissive.b > 0.01);
            farbe.glutGeteilt = !!(gb.instanceable && gb.leaves[0].mat === gm);
            res.farbe = farbe;
        } catch (e) {
            res.farbe = { err: String((e && e.message) || e) };
        }
        // ── Q am Ruf: die EINE Slot-Farb-Naht in beiden Slot-Schreibern, der Merge-Pfad zieht
        // das geteilte Material, der blockierte Pfad lässt es stehen (die Glüh-Antwort misst F am Slot)
        if (neu.probeFlat) {
            const zaehl = (k, fn) => {
                let n = 0;
                r[k] = function (...a) { n++; return AR.prototype[k].apply(this, a); };
                try { fn(); } finally { delete r[k]; }
                return n;
            };
            const eK = { type: "rd_fixture_neu", seed: 11, scale: 1, position: { x: 953 * R + 60, y: 0, z: 949 * R + 60 } };
            res.nahtAdd = zaehl("_archSlotColor", () => r._archInstanceAdd(eK, neu.probeFlat)) > 0;
            r._archInstanceRemove(eK);
            let sl = null;
            res.nahtScatter = zaehl("_archSlotColor", () => (sl = r._scatterInstanceAdd("rd_fixture_neu", 953 * R + 70, 0, 949 * R + 70, 0, 1, null, "953,949", neu.probeFlat))) === neu.probeFlat.leaves.length;
            if (sl) r._scatterFreeSlots(sl);
            mkBp("rd_merge", "stein", [0x8a5a2b, 0x8a5a2b]);
            res.mergeGeteilt = zaehl("_sharedFoliageMaterial", () => r._mergeBlueprintByMaterial(r.state.blueprints.rd_merge)) > 0;
            mkBp("rd_block", "stein", [0xcc3322]);
            r.state.blueprints.rd_block.parts.push({ shape: "box", material: "stein", color: 0xcc3322, animate: "water_wave", size: { x: 1, y: 1, z: 1 }, position: { x: 0, y: 0, z: 0 } });
            const geteilt = r._archLeafMaterial(r.state.blueprints.rd_block.parts[0]);
            let weg = 0;
            const h = () => weg++;
            geteilt.addEventListener("dispose", h);
            const fl = r._archFlattenBlueprint("rd_block");
            geteilt.removeEventListener("dispose", h);
            res.disposeWand = !!fl && fl.reason === "water_wave" && weg === 0;
        }
        if (neu.drain) res.neu.leck = neu.drain();

        // ── W: der WELT-ZENSUS in der gebauten Dorf-/Wald-Szene ──
        // Jedes leaf.tint-Material MUSS aus dem EINEN _foliageMatCache stammen
        // (Map Signatur→Material ⇒ je Tag-Signatur GENAU EIN Material, per Konstruktion).
        try {
            const cacheMats = new Set(r.state._foliageMatCache ? [...r.state._foliageMatCache.values()] : []);
            let leafTintLeaves = 0;
            let fremde = 0;
            const mats = new Set();
            if (r.state.archFlattenCache)
                for (const resF of r.state.archFlattenCache.values()) {
                    if (!resF || !Array.isArray(resF.leaves)) continue;
                    for (const l of resF.leaves) {
                        if (!l || l.tint === undefined || !l.mat) continue;
                        leafTintLeaves++;
                        mats.add(l.mat);
                        if (!cacheMats.has(l.mat)) fremde++;
                    }
                }
            res.welt = {
                leafTintLeaves,
                mats: mats.size,
                fremde,
                cacheMats: cacheMats.size,
                wrappers: r.state.archInstanceGroups ? r.state.archInstanceGroups.size : 0,
            };
        } catch (e) {
            res.welt = { err: String((e && e.message) || e) };
        }

        // Aufräumen: Hebel auf Produktion, Fixturen fallen (kein Debris im Baum).
        AR.ARCH_LEAF_MAT_SHARED = true;
        for (const n of ["rd_fixture_alt", "rd_fixture_neu", "rd_naht", "rd_glut_a", "rd_glut_b", "rd_merge", "rd_block"]) {
            delete r.state.blueprints[n];
            if (r.state.archFlattenCache) r.state.archFlattenCache.delete(n);
        }
        return res;
    });

    console.log("=== V18.475 RENDER-DIÄT — EIN Material je Tag-Signatur, die Farbe reist als Instanz-Kanal ===");
    check("Q: die EINE Slot-Farb-Naht — beide Slot-Schreiber rufen _archSlotColor", out.nahtAdd === true && out.nahtScatter === true, `add=${out.nahtAdd} streu=${out.nahtScatter}`);
    check("Q: der Merge-Pfad (_mergeBlueprintByMaterial) zieht das geteilte Tag-Signatur-Material", out.mergeGeteilt === true);
    check("Q: die Dispose-Wand — der blockierte Pfad in _archFlattenBlueprint lässt das geteilte Material stehen", out.disposeWand === true);
    check("Wald gebaut (Scatter-Zellen)", out.cells > 40, `zellen=${out.cells}`);
    if (out.alt) {
        check(
            "S (Selbst-Test): die Linse ERKENNT das alte Muster — 6 Farben = 6 Materialien (je Farbe eins)",
            out.alt.instanceable === true && out.alt.leaves === 6 && out.alt.mats === 6 && out.alt.tints === 0,
            out.alt.err || `mats=${out.alt.mats} tints=${out.alt.tints}`
        );
        check(
            "S (Selbst-Test): das alte Muster zersplittert in 6 Material-Familien (je Farbe eine Pipeline)",
            out.alt.familien === 6,
            `familien=${out.alt.familien} wrappers=${out.alt.wrappers}`
        );
        check(
            "S: Slot-Bilanz der ALT-Welt dicht (Empty-Dispose räumt restlos)",
            !!out.alt.leck && out.alt.leck.leckB === 0 && out.alt.leck.leckW === 0,
            out.alt.leck ? `leckB=${out.alt.leck.leckB} leckW=${out.alt.leck.leckW}` : "kein drain"
        );
    } else check("S: ALT-Block erreicht", false);
    if (out.neu) {
        check(
            "N: Materialien je Tag-Signatur == 1 (6 Farben → EIN geteiltes Material, alle 6 Leaves tragen leaf.tint)",
            out.neu.instanceable === true && out.neu.leaves === 6 && out.neu.mats === 1 && out.neu.tints === 6,
            out.neu.err || `mats=${out.neu.mats} tints=${out.neu.tints}`
        );
        check(
            "N: das geteilte Material ist WEISS + trägt leafTint/sharedFoliage (die Farbe lebt im Instanz-Kanal)",
            out.neu.matWeiss === true && out.neu.matMarker === true
        );
        check(
            `N: DIE DIÄT — Material-Familien der 6-Farben-Fixture: vorher ${out.alt ? out.alt.familien : "?"} → nachher ${out.neu.familien} (nur-sinkender Anker ≤ ${RD_FAMILIEN_ANKER})`,
            Number.isFinite(out.neu.familien) &&
                out.neu.familien >= 1 &&
                out.neu.familien <= RD_FAMILIEN_ANKER &&
                out.alt &&
                out.alt.familien > out.neu.familien,
            `wrappers ${out.alt ? out.alt.wrappers : "?"}→${out.neu.wrappers}`
        );
        check(
            "N: Slot-Bilanz der NEU-Welt dicht (Empty-Dispose räumt restlos)",
            !!out.neu.leck && out.neu.leck.leckB === 0 && out.neu.leck.leckW === 0,
            out.neu.leck ? `leckB=${out.neu.leck.leckB} leckW=${out.neu.leck.leckW}` : "kein drain"
        );
    } else check("N: NEU-Block erreicht", false);
    if (out.farbe && !out.farbe.err) {
        check(
            "F: die Stichproben-Instanz trägt ihre PART-Farbe über den Instanz-Kanal (getColorAt == _archPartTintColor)",
            out.farbe.part0 === true && out.farbe.part1 === true,
            `kanal=${out.farbe.kanal} ist0=${out.farbe.ist0}`
        );
        check(
            "F: kein Grau-Einheitsbrei — die Slot-Farben sind nicht weiß und untereinander verschieden",
            out.farbe.nichtWeiss === true && out.farbe.verschieden === true
        );
        check(
            "F: EINE Naht, keine Kollision — stein ignoriert den Entry-Tint (Parität), erde (useInstanceTint) trägt Part × Entry",
            out.farbe.steinIgnoriertEntry === true && out.farbe.erdeProdukt === true && out.farbe.erdeKanaele === true
        );
        check(
            "F: die Glüh-Ausnahme — glut backt die Farbe (Emissiv lebt in der eigenen Farbe), identische Parts teilen EIN memoisiertes Material",
            out.farbe.glutGebacken === true && out.farbe.glutEmissiv === true && out.farbe.glutGeteilt === true
        );
    } else check("F: Farb-Wahrheits-Block erreicht", false, out.farbe && out.farbe.err);
    if (out.welt && !out.welt.err) {
        check(
            `W: Welt-Zensus — JEDES leaf.tint-Material stammt aus dem EINEN _foliageMatCache (je Signatur EIN Material; ${out.welt.leafTintLeaves} Leaves → ${out.welt.mats} Materialien)`,
            out.welt.leafTintLeaves > 0 && out.welt.fremde === 0,
            `fremde=${out.welt.fremde} cacheMats=${out.welt.cacheMats} wrappers=${out.welt.wrappers}`
        );
    } else check("W: Welt-Zensus erreicht", false, out.welt && out.welt.err);

    await browser.close();
    server.close();
    wandEnde(errs, "die Render-Diät steht: EIN geteiltes Material je Tag-Signatur (der Selbst-Test beweist, dass die Linse das alte Je-Farbe-ein-Material-Muster erkannt hätte), die Material-Familien kollabieren je Signatur (Anker nur-sinkend), und jede Instanz trägt ihre Part-Farbe über den EINEN Tint-Kanal — Farb-Wahrheit statt Grau-Einheitsbrei.");
});
