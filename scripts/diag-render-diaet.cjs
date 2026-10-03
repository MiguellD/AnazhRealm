// diag-render-diaet.cjs — V18.475 DIE RENDER-DIÄT (Schöpfer-Trace 14.07.: 1733 dc /
// ~72 ms CPU-Submit; die Schwester-Hälfte der V18.474-Fern-Diät).
//
// DER BEFUND: `_archLeafMaterial` baute je Part-FARBE ein EIGENES MeshStandardNode-
// Material → jede Farbe zersplitterte in eine eigene Material-Familie (WebGPU-Pipeline; bis V18.509 auch
// einen eigenen Batch = Draw-Call).
// DIE HEILUNG: EIN geteiltes Material je TAG-SIGNATUR (`_sharedFoliageMaterial`,
// das bewiesene V18.288-Muster); die Part-Farbe reist als INSTANZ-Farbe über den
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
//   (Block X — die Index-Konsistenz des geteilten BatchedMesh — fiel V18.510 mit dem Batch-Pfad: jedes Leaf
//   ist seine eigene InstancedMesh, gemischte Index-Formen teilen keinen Puffer mehr.)
//
//   node scripts/diag-render-diaet.cjs
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.RENDER_DIAET_PORT || 4444);
const root = path.resolve(__dirname, "..");
// Der nur-sinkende ANKER: die 6-Farben-Fixture darf höchstens SO viele Material-Familien
// erzeugen (heute 1 — EIN geteiltes Material; er darf nie steigen).
const RD_FAMILIEN_ANKER = 1;
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

(async () => {
    // ── Q: die Quell-Proben (Chokepoint-Disziplin, kein Parallelpfad) ──
    const src = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    const hebel = (src.match(/AnazhRealm\.ARCH_LEAF_MAT_SHARED/g) || []).length;
    check(
        "Q: ARCH_LEAF_MAT_SHARED hat genau 2 Code-Vorkommen (Definition + der EINE Konsument _archLeafMaterial)",
        hebel === 2 && src.includes("_archLeafMaterial(part) {"),
        `vorkommen=${hebel}`
    );
    const nahtCalls = (src.match(/this\._archSlotColor\(leaf, tintColor\)/g) || []).length;
    check(
        "Q: die EINE Slot-Farb-Naht — _archSlotColor definiert + in BEIDEN Slot-Schreibern konsumiert",
        src.includes("_archSlotColor(leaf, entryTint) {") && nahtCalls === 2,
        `konsumenten=${nahtCalls}`
    );
    // Kein dritter setColorAt-Pfad in den zwei Slot-Schreibern (die alte
    // useInstanceTint-Direktklammer ist gefallen).
    const fnBody = (name) => {
        const i = src.indexOf(`    ${name}(`);
        if (i < 0) return "";
        const j = src.indexOf("\n    _", i + 8);
        return src.slice(i, j < 0 ? i + 6000 : j);
    };
    const addBody = fnBody("_archInstanceAdd");
    const scatBody = fnBody("_scatterInstanceAdd");
    check(
        "Q: kein zweiter Farb-Pfad — die Slot-Schreiber setzen Farben NUR über die Naht (kein useInstanceTint-gegatetes setColorAt mehr)",
        addBody.length > 0 &&
            scatBody.length > 0 &&
            !/userData\.useInstanceTint\)[\s\S]{0,80}setColorAt/.test(addBody) &&
            !/userData\.useInstanceTint\)[\s\S]{0,80}setColorAt/.test(scatBody)
    );
    // Der Emissiv-SPIEGEL (die Glüh-Frage): der PBR-Bau konsumiert opts.color im
    // Emissiv hinter der −0.5/0.01-Klammer; _archLeafMaterial spiegelt EXAKT diese
    // Klammer (Drift = eine Welt, die glühende Farben verliert oder Graubrei backt).
    check(
        "Q: der Emissiv-Spiegel steht (PBR-Bau `− 0.5` + `> 0.01` ↔ Leaf-Material `− 0.5) > 0.01`)",
        /emissiv\) \|\| 0\) - 0\.5\);/.test(src) &&
            /_glimmen > 0\.01/.test(src) &&
            /emissiv\) \|\| 0\) - 0\.5\) > 0\.01/.test(src)
    );
    check(
        "Q: die Dispose-Wand — der blocked-Pfad in _archFlattenBlueprint lässt geteilte Materialien stehen",
        /l\.mat\.dispose && !\(l\.mat\.userData && l\.mat\.userData\.sharedFoliage\)/.test(src)
    );
    check(
        "Q: der Merge-Pfad (_mergeBlueprintByMaterial) zieht das geteilte Tag-Signatur-Material (dieselbe Klasse)",
        /const mat = this\._sharedFoliageMaterial\(matOpts\);\n[ ]{12}leaves\.push\(\{ geom: merged/.test(src)
    );

    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 300000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const out = await page.evaluate(async () => {
        const res = { boot: false };
        const dl0 = performance.now() + 90000;
        while (
            (!window.anazhRealm || typeof window.anazhRealm._archFlattenBlueprint !== "function") &&
            performance.now() < dl0
        )
            await new Promise((r) => setTimeout(r, 100));
        const r = window.anazhRealm;
        if (!r) return res;
        res.boot = true;
        const AR = r.constructor;
        // Foundry warm ziehen (Produktions-Boot) + den WALD bauen (Scatter-Zellen).
        const f = r._ensureAssetFoundry();
        const dl1 = performance.now() + 60000;
        while (performance.now() < dl1) {
            if (f && f.ready) break;
            await new Promise((r2) => setTimeout(r2, 100));
        }
        const pm = r.state.playerMesh.position;
        const dl2 = performance.now() + 45000;
        let cells = 0;
        while (performance.now() < dl2) {
            r._tickScatterStreaming(pm);
            const map = r.state.scatterRegions;
            cells = 0;
            if (map) for (const reg of map.values()) cells += reg.cells ? reg.cells.length : 0;
            if (cells > 40) break;
            await new Promise((r2) => setTimeout(r2, 30));
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

        // Zähler in UNSEREN Regionen (streaming-fest: nur die Fixture-Regionen): Gruppen (w) und
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
                const regTag = "@p:" + rx + "," + rz;
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
        for (const n of ["rd_fixture_alt", "rd_fixture_neu", "rd_naht", "rd_glut_a", "rd_glut_b"]) {
            delete r.state.blueprints[n];
            if (r.state.archFlattenCache) r.state.archFlattenCache.delete(n);
        }
        return res;
    });

    console.log("=== V18.475 RENDER-DIÄT — EIN Material je Tag-Signatur, die Farbe reist als Instanz-Kanal ===");
    check("Boot + Wald gebaut (Scatter-Zellen)", out.boot && out.cells > 40, `zellen=${out.cells}`);
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
    check("keine Page-Errors während der Probe", pageErrors.length === 0, pageErrors.slice(0, 2).join(" | "));

    await browser.close();
    server.close();
    if (errs.length) {
        console.log(`\n❌ ROT — ${errs.length} Verletzung(en): ${errs.join(" · ")}`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — die Render-Diät steht: EIN geteiltes Material je Tag-Signatur (der Selbst-Test beweist, dass die Linse das alte Je-Farbe-ein-Material-Muster erkannt hätte), die Material-Familien kollabieren je Signatur (Anker nur-sinkend), und jede Instanz trägt ihre Part-Farbe über den EINEN Tint-Kanal — Farb-Wahrheit statt Grau-Einheitsbrei."
    );
})().catch((e) => {
    console.error("DIAG-FEHLER:", e);
    server.close();
    process.exit(1);
});
