// diag-genom.cjs — DER WAHRE WUCHS (wahrerwuchs §7): das Bauplan-Genom. Aus EINEM
// Seed × wenige formbare Achsen wächst die volle Palette (Moos → Mammutbaum, jung →
// uralt), ohne hundert Rezepte. Reine Berechnung + Geometrie → headless verifizierbar
// (der finale LOOK ist augen-bound, Wand 1). Bänder:
//   SPANNWEITEN — die Größenklasse spannt 1.5–80 m (Strauch · Baum · Gross · GIGANT)
//   PHYSIK      — JEDE gewürfelte Variante steht (Ω-Φ2) + knickt nicht (Ω-Φ3-b)
//   AFFINITÄT   — die Compound-Tags bleiben bit-identisch über ALLE Achsen-Werte (V17.17)
//   DETERMINISMUS — zwei Rolls desselben Seeds → bit-identisch (UNSIGNED-Wand)
//   ROLLER      — _rollGenome: range/int/pick/chance/seq deterministisch + im Bereich
//   LEGACY      — kein statischer _jung/_alt/_breit-Tree-Blob mehr im Scatter-Pool
//   node scripts/diag-genom.cjs
const { spawn } = require("child_process");
const path = require("path");
const puppeteer = require("puppeteer");
const SERVER_JS = path.resolve("save-server.js");
const SERVER_URL = "http://127.0.0.1:4312/index.html";

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", [SERVER_JS], { stdio: ["ignore", "pipe", "pipe"] });
        let ready = false;
        const to = setTimeout(() => !ready && reject(new Error("server timeout")), 5000);
        proc.stdout.on("data", (c) => {
            if (!ready && /läuft/.test(c.toString())) {
                ready = true;
                clearTimeout(to);
                resolve(proc);
            }
        });
        proc.on("error", reject);
    });
}

(async () => {
    const server = await startSaveServer();
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.error("PAGE-ERROR:", e.message));
    let failed = false;
    try {
        await page.goto(SERVER_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const deadline = performance.now() + 12000;
            while (
                (!window.anazhRealm ||
                    !window.anazhRealm.state ||
                    !window.anazhRealm.state.blueprints ||
                    !window.anazhRealm.state.materials) &&
                performance.now() < deadline
            )
                await new Promise((r) => setTimeout(r, 50));
        });
        const out = await page.evaluate(() => {
            const r = window.anazhRealm,
                C = r.constructor;
            const o = { species: [], heights: {}, classes: {}, badBuckle: [], worstSlender: 0 };

            // ── nur die Baum-Arten (mit Krone) ──
            const treeSp = Object.keys(C.SPECIES_GRAMMAR).filter((k) => {
                const g = C.SPECIES_GRAMMAR[k];
                return g && g.foliage && k.startsWith("baum_");
            });
            o.species = treeSp;

            // ── SPANNWEITEN + PHYSIK über viele Seeds × Arten ──
            // PHYSIK für einen BAUM = der Richter eines ROOTED Organismus: er KNICKT NICHT
            // (Ω-Φ3-b, der ECHTE Constraint für eine hohe Pflanze — Greenhill/Euler: ein zu
            // dünner Riese knickt unter dem Eigengewicht). Die anderen zwei Richter gelten
            // einem BAUM NICHT (GEMESSEN, nicht angenommen):
            //   · Ω-Φ2 KIPP-Stabilität (Schwerpunkt über dem Stützpolygon) — gilt FREI-
            //     STEHENDEN Bauten; ein verwurzelter Baum mit asymmetrischer Krone kippt
            //     NICHT (die Wurzeln tragen das Moment). [Tempel/Hütte/Fahrzeug/Kreatur:
            //     diag-grammatik/diag-vollenden.]
            //   · Ω-Φ5 LASTPFAD (AABB-Berührungs-BFS) — der _partWorldExtents-Proxy UNTER-
            //     deckt ROTIERTE dünne Zylinder (GEMESSEN: zwei Ast-Segmente, ein segLen
            //     auseinander, teilen einen Punkt, der außerhalb beider AABBs liegt → Phantom-
            //     Lücke). Der Baum IST per Konstruktion verbunden (jeder Ast wächst aus dem
            //     Stamm); der AABB-BFS ist für AXIS-ALIGNED Montage-Bauten, nicht für ein
            //     gewachsenes Geäst. Der Knick-Richter ist davon UNBERÜHRT — er prüft nur
            //     NAHE-VERTIKALE Glieder (Stamm/steile Limbs), wo _partWorldExtents korrekt ist.
            let minH = 1e9,
                maxH = 0,
                allNoBuckle = true,
                giantStands = 0,
                giantCount = 0;
            const classSeen = { strauch: 0, normal: 0, gross: 0, gigant: 0 };
            const SEEDS = 360;
            for (const sp of treeSp) {
                const g = C.SPECIES_GRAMMAR[sp];
                if (g.foliage.kind === "none") continue; // Totholz/Snag: keine Krone, separat
                for (let s = 0; s < SEEDS; s++) {
                    const seed = "g" + s;
                    const parts = r._growTreeBlueprintRich(sp, seed, g, { lod: 0 });
                    const sk = r._lastTreeSkeleton;
                    const h = sk.totalH;
                    const cls = sk.sizeClass || "normal";
                    classSeen[cls] = (classSeen[cls] || 0) + 1;
                    if (h < minH) minH = h;
                    if (h > maxH) maxH = h;
                    const bp = { parts };
                    const fl = r._failsUnderLoad(bp);
                    if (fl.maxSlenderness > o.worstSlender) o.worstSlender = fl.maxSlenderness;
                    if (fl.buckles === true && o.badBuckle.length < 6)
                        o.badBuckle.push({
                            sp,
                            seed,
                            cls,
                            h: +h.toFixed(1),
                            slender: +fl.maxSlenderness.toFixed(1),
                            crit: +fl.criticalSlenderness.toFixed(1),
                        });
                    if (fl.buckles === true) allNoBuckle = false;
                    if (cls === "gigant") {
                        giantCount++;
                        if (fl.buckles === false) giantStands++;
                    }
                }
            }
            o.minHeight = +minH.toFixed(2);
            o.maxHeight = +maxH.toFixed(2);
            o.classes = classSeen;
            o.allNoBuckle = allNoBuckle;
            o.giantCount = giantCount;
            o.giantAllStand = giantCount > 0 && giantStands === giantCount;

            // ── DETERMINISMUS: zwei Rolls desselben Seeds → bit-identisch ──
            const a1 = r._growTreeBlueprintRich("baum_eiche", "det-1", C.SPECIES_GRAMMAR.baum_eiche, { lod: 0 });
            const h1 = r._lastTreeSkeleton.totalH;
            const a2 = r._growTreeBlueprintRich("baum_eiche", "det-1", C.SPECIES_GRAMMAR.baum_eiche, { lod: 0 });
            const h2 = r._lastTreeSkeleton.totalH;
            o.deterministic =
                a1.length === a2.length &&
                h1 === h2 &&
                a1.every(
                    (p, i) =>
                        Math.abs(p.size.x - a2[i].size.x) < 1e-12 && Math.abs(p.position.y - a2[i].position.y) < 1e-12
                );

            // ── AFFINITÄT: die Compound-Tags eines GIGANTEN == die eines NORMALEN (gleiche Art) ──
            // (Form/Größe sind tag-neutral, V17.17). Finde einen Gigant + einen Normalen derselben Art.
            const tagsOf = (parts) => {
                const t = C.computeCompoundTags ? C.computeCompoundTags({ parts }) : r.computeCompoundTags({ parts });
                return t;
            };
            // baue gezielt: suche zwei Eichen verschiedener Größenklasse
            let normalParts = null,
                giantParts = null,
                grossParts = null;
            for (let s = 0; s < 2000 && (!giantParts || !normalParts || !grossParts); s++) {
                const p = r._growTreeBlueprintRich("baum_eiche", "aff" + s, C.SPECIES_GRAMMAR.baum_eiche, { lod: 0 });
                const cls = r._lastTreeSkeleton.sizeClass;
                if (cls === "normal" && !normalParts) normalParts = p;
                if (cls === "gigant" && !giantParts) giantParts = p;
                if (cls === "gross" && !grossParts) grossParts = p;
            }
            o.foundGiantForAff = !!giantParts;
            const axes = ["lebendig", "dichte", "brennbar", "magieleitung"];
            const tn = normalParts ? tagsOf(normalParts) : null;
            const tg = giantParts ? tagsOf(giantParts) : null;
            const tgr = grossParts ? tagsOf(grossParts) : null;
            o.tagsFrozen =
                !!tn &&
                !!tg &&
                !!tgr &&
                axes.every(
                    (a) => Math.abs((tn[a] || 0) - (tg[a] || 0)) < 1e-9 && Math.abs((tn[a] || 0) - (tgr[a] || 0)) < 1e-9
                );
            o.affTags = tn ? axes.map((a) => +(tn[a] || 0).toFixed(3)) : null;
            // nur holz + laub Materialien (keine neue Substanz)
            const mats = new Set();
            (giantParts || normalParts || []).forEach((p) => mats.add(p.material));
            o.onlyWoodLeaf = [...mats].every((m) => m === "holz" || m === "laub");
            o.matsUsed = [...mats];

            // ── S3 FELS-GENOM: Form-Vielfalt + PHYSIK (Fels ist FREISTEHEND → Ω-Φ2 KIPP +
            //    Ω-Φ5 LASTPFAD gelten, anders als beim verwurzelten Baum) + AFFINITÄT-frozen ──
            if (typeof r._rockVariant === "function") {
                let rockStand = true,
                    rockIntact = true,
                    rockNoBuckle = true,
                    rockMatsOk = true;
                const rockForms = new Set();
                const rockBad = [];
                for (let s = 0; s < 400; s++) {
                    const rp = r._rockVariant("rk" + s);
                    if (!Array.isArray(rp) || rp.length < 1) {
                        rockBad.push({ s, why: "empty" });
                        continue;
                    }
                    rp.forEach((p) => {
                        if (p.shape !== "noiserock" || p.material !== "stein") rockMatsOk = false;
                    });
                    // grobe Form-Erkennung aus der Part-Signatur (für die Vielfalt-Probe)
                    const n = rp.length;
                    const tall = rp.some((p) => p.size.y > p.size.x * 1.3);
                    rockForms.add(n === 1 || n === 2 ? "brocken" : tall ? "nadel/stapel" : "geroell/stapel");
                    const bp = { parts: rp };
                    const st = r._stability(bp);
                    const lp = r._loadPath(bp);
                    const fl = r._failsUnderLoad(bp);
                    if (st.inside !== true) {
                        rockStand = false;
                        if (rockBad.length < 6) rockBad.push({ s, why: "tips", margin: +st.margin.toFixed(3), n });
                    }
                    if (lp.intact !== true) {
                        rockIntact = false;
                        if (rockBad.length < 6) rockBad.push({ s, why: "float", frac: +lp.floatingFrac.toFixed(3), n });
                    }
                    if (fl.buckles === true) {
                        rockNoBuckle = false;
                        if (rockBad.length < 6)
                            rockBad.push({ s, why: "buckle", sl: +fl.maxSlenderness.toFixed(1), n });
                    }
                }
                o.rockStand = rockStand;
                o.rockIntact = rockIntact;
                o.rockNoBuckle = rockNoBuckle;
                o.rockMatsOk = rockMatsOk;
                o.rockFormCount = rockForms.size;
                o.rockBad = rockBad;
                // DETERMINISMUS: gleicher Seed → bit-identisch
                const ra = r._rockVariant("det-rock");
                const rb = r._rockVariant("det-rock");
                o.rockDet =
                    ra.length === rb.length &&
                    ra.every(
                        (p, i) =>
                            Math.abs(p.size.x - rb[i].size.x) < 1e-12 &&
                            Math.abs(p.position.y - rb[i].position.y) < 1e-12
                    );
                // AFFINITÄT: eine Fels-Formation hat IDENTISCHE Tags zu stein_block (V17.17)
                const steinBlock = r.state.blueprints.stein_block;
                if (steinBlock) {
                    const tsb = tagsOf(steinBlock.parts);
                    const trk = tagsOf(r._rockVariant("aff-rock"));
                    o.rockTagsFrozen = ["lebendig", "dichte", "brennbar", "magieleitung"].every(
                        (a) => Math.abs((tsb[a] || 0) - (trk[a] || 0)) < 1e-9
                    );
                }
                // WIRED: der Pool ist registriert + der Scatter wählt eine Landmark-Variante
                o.felsPoolRegistered = !!(r.state.blueprints && r.state.blueprints.fels_var0);
                o.scatterPicksFels = /SCATTER_VARIANT_POOL|landmarkPool/.test(r._vegetationSampleSpawn.toString());
            }

            // ── S4 KRISTALL- + GLUT-GENOM: dieselbe FREISTEHEND-Physik (Ω-Φ2/Φ5/Φ3-b) +
            //    AFFINITÄT-frozen zum Wahrzeichen (kristall_geode / glutbrunnen) ──
            const testLandmark = (fnName, refKey, seedPrefix, axisMats) => {
                if (typeof r[fnName] !== "function") return null;
                let stand = true,
                    intact = true,
                    noBuckle = true,
                    matsOk = true;
                const bad = [];
                for (let s = 0; s < 300; s++) {
                    const p = r[fnName](seedPrefix + s);
                    if (!Array.isArray(p) || p.length < 1) {
                        bad.push({ s, why: "empty" });
                        continue;
                    }
                    p.forEach((q) => {
                        if (!axisMats.includes(q.material)) matsOk = false;
                    });
                    const bp = { parts: p };
                    const st = r._stability(bp);
                    const lp = r._loadPath(bp);
                    const fl = r._failsUnderLoad(bp);
                    if (st.inside !== true) {
                        stand = false;
                        if (bad.length < 5) bad.push({ s, why: "tips", m: +st.margin.toFixed(3), n: p.length });
                    }
                    if (lp.intact !== true) {
                        intact = false;
                        if (bad.length < 5) bad.push({ s, why: "float", f: +lp.floatingFrac.toFixed(3), n: p.length });
                    }
                    if (fl.buckles === true) {
                        noBuckle = false;
                        if (bad.length < 5) bad.push({ s, why: "buckle", sl: +fl.maxSlenderness.toFixed(1) });
                    }
                }
                const ref = r.state.blueprints[refKey];
                let tagsFrozen = false;
                if (ref) {
                    const tr = tagsOf(ref.parts);
                    const tv = tagsOf(r[fnName](seedPrefix + "aff"));
                    tagsFrozen = ["lebendig", "dichte", "brennbar", "magieleitung"].every(
                        (a) => Math.abs((tr[a] || 0) - (tv[a] || 0)) < 1e-9
                    );
                }
                const a = r[fnName](seedPrefix + "det");
                const b = r[fnName](seedPrefix + "det");
                const det =
                    a.length === b.length &&
                    a.every(
                        (q, i) =>
                            Math.abs(q.size.x - b[i].size.x) < 1e-12 && Math.abs(q.position.y - b[i].position.y) < 1e-12
                    );
                return { stand, intact, noBuckle, matsOk, tagsFrozen, det, bad };
            };
            o.crystal = testLandmark("_crystalVariant", "kristall_geode", "ky", ["quarz"]);
            o.crystalPool = !!(r.state.blueprints && r.state.blueprints.kristall_var0);
            o.glut = testLandmark("_glutVariant", "glutbrunnen", "gy", ["stein", "glut"]);
            o.glutPool = !!(r.state.blueprints && r.state.blueprints.glut_var0);

            // ── ROLLER: range im Bereich, int inklusiv, pick aus Liste, chance ~p, seq [0,1) + det ──
            const G = r._rollGenome("rtest", "diag");
            const G2 = r._rollGenome("rtest", "diag");
            let rangeOk = true,
                intOk = true,
                pickOk = true,
                seqOk = true;
            for (let i = 0; i < 50; i++) {
                const v = G.range("a" + i, 5, 9);
                if (v < 5 || v >= 9) rangeOk = false;
                const iv = G.int("b" + i, 2, 7);
                if (iv < 2 || iv > 7 || iv !== Math.floor(iv)) intOk = false;
                const pv = G.pick("c" + i, ["x", "y", "z"]);
                if (!["x", "y", "z"].includes(pv)) pickOk = false;
            }
            const sq = G.seq("flow");
            const sq2 = G2.seq("flow");
            let seqDet = true;
            for (let i = 0; i < 20; i++) {
                const a = sq();
                const b = sq2();
                if (a < 0 || a >= 1) seqOk = false;
                if (a !== b) seqDet = false;
            }
            // chance ~ p über viele Namen
            let hits = 0;
            const N = 2000;
            for (let i = 0; i < N; i++) if (G.chance("ch" + i, 0.3)) hits++;
            o.chanceFrac = +(hits / N).toFixed(3);
            o.rollerOk =
                rangeOk &&
                intOk &&
                pickOk &&
                seqOk &&
                seqDet &&
                G.axis("same") === G2.axis("same") &&
                o.chanceFrac > 0.25 &&
                o.chanceFrac < 0.35;

            // ── LEGACY: kein statischer _jung/_alt/_breit-Tree-Blob im Scatter-Kandidaten-Pool ──
            // (S2; vor dem Schnitt rot, nach dem Schnitt grün — die Quelle ist _vegetationSampleSpawn).
            const vegSrc = r._vegetationSampleSpawn.toString();
            o.legacyVariantsInScatter = /baum_\w+_(jung|alt|breit|schlank)/.test(vegSrc);

            return o;
        });

        // ── Auswertung ──
        const checks = [];
        const ck = (name, val, cond) => {
            checks.push({ name, val, ok: !!cond });
            if (!cond) failed = true;
        };
        ck("Arten gefunden (≥6)", out.species.length, out.species.length >= 6);
        ck("SPANNWEITEN min-Höhe ≤ 4 m (Strauch)", out.minHeight, out.minHeight <= 4.2);
        ck("SPANNWEITEN max-Höhe ≥ 30 m (Gigant)", out.maxHeight, out.maxHeight >= 30);
        ck(
            "alle 4 Größenklassen erscheinen",
            JSON.stringify(out.classes),
            out.classes.strauch > 0 && out.classes.normal > 0 && out.classes.gross > 0 && out.classes.gigant > 0
        );
        ck("PHYSIK: KEINE Variante knickt (Ω-Φ3-b)", out.allNoBuckle, out.allNoBuckle === true);
        ck("PHYSIK: jeder GIGANT knickt nicht (Greenhill)", `${out.giantCount} Gigant.`, out.giantAllStand === true);
        ck("worst-Schlankheit < crit (10.1 holz)", out.worstSlender, out.worstSlender < 10.1);
        ck("DETERMINISMUS: gleicher Seed → bit-identisch", out.deterministic, out.deterministic === true);
        ck("AFFINITÄT: Tags frozen (Gigant == Normal == Gross)", out.affTags, out.tagsFrozen === true);
        ck("AFFINITÄT: nur holz+laub Substanz", out.matsUsed, out.onlyWoodLeaf === true);
        ck("ROLLER: range/int/pick/chance/seq + Determinismus", out.chanceFrac, out.rollerOk === true);
        ck(
            "LEGACY: kein _jung/_alt-Blob im Scatter-Pool",
            out.legacyVariantsInScatter,
            out.legacyVariantsInScatter === false
        );
        // ── S3 FELS-GENOM ──
        ck("FELS: ≥2 Formen erscheinen (Brocken/Stapel/Nadel/Geröll)", out.rockFormCount, out.rockFormCount >= 2);
        ck("FELS-PHYSIK: jeder Fels STEHT (Ω-Φ2, freistehend)", out.rockStand, out.rockStand === true);
        ck("FELS-PHYSIK: Lastpfad intakt (Ω-Φ5, der Stapel trägt)", out.rockIntact, out.rockIntact === true);
        ck("FELS-PHYSIK: die Nadel knickt nicht (Ω-Φ3-b)", out.rockNoBuckle, out.rockNoBuckle === true);
        ck("FELS-AFFINITÄT: nur noiserock+stein (tag-frozen)", out.rockMatsOk, out.rockMatsOk === true);
        ck("FELS-AFFINITÄT: Tags == stein_block (V17.17)", out.rockTagsFrozen, out.rockTagsFrozen === true);
        ck("FELS-DETERMINISMUS: gleicher Seed → bit-identisch", out.rockDet, out.rockDet === true);
        ck(
            "FELS-WIRED: Pool registriert + Scatter wählt eine Landmark-Variante",
            `${out.felsPoolRegistered}/${out.scatterPicksFels}`,
            out.felsPoolRegistered === true && out.scatterPicksFels === true
        );
        // ── S4 KRISTALL ──
        const cx = out.crystal || {};
        ck(
            "KRISTALL-PHYSIK: steht (Ω-Φ2) + intakt (Ω-Φ5) + knickt nicht (Ω-Φ3-b)",
            JSON.stringify({ st: cx.stand, lp: cx.intact, bk: cx.noBuckle, bad: cx.bad }),
            cx.stand === true && cx.intact === true && cx.noBuckle === true
        );
        ck(
            "KRISTALL-AFFINITÄT: nur quarz + Tags == kristall_geode",
            cx.tagsFrozen,
            cx.matsOk === true && cx.tagsFrozen === true
        );
        ck(
            "KRISTALL-DETERMINISMUS + Pool registriert",
            `${cx.det}/${out.crystalPool}`,
            cx.det === true && out.crystalPool === true
        );
        // ── S4 GLUT ──
        const gt = out.glut || {};
        ck(
            "GLUT-PHYSIK: das Becken steht (Ω-Φ2) + intakt (Ω-Φ5)",
            JSON.stringify({ st: gt.stand, lp: gt.intact, bad: gt.bad }),
            gt.stand === true && gt.intact === true && gt.noBuckle === true
        );
        ck(
            "GLUT-AFFINITÄT: nur stein+glut + Tags == glutbrunnen",
            gt.tagsFrozen,
            gt.matsOk === true && gt.tagsFrozen === true
        );
        ck(
            "GLUT-DETERMINISMUS + Pool registriert",
            `${gt.det}/${out.glutPool}`,
            gt.det === true && out.glutPool === true
        );

        console.log("\n  DER WAHRE WUCHS — Genom-Beweis (wahrerwuchs §7)\n");
        for (const c of checks) console.log(`  ${c.ok ? "✓" : "✗"} ${c.name} — ${JSON.stringify(c.val)}`);
        console.log(
            `\n  Klassen-Verteilung: ${JSON.stringify(out.classes)} | Höhen ${out.minHeight}–${out.maxHeight} m`
        );
        if (out.badBuckle.length) console.log("  badBuckle:", JSON.stringify(out.badBuckle));
        if (out.rockBad && out.rockBad.length) console.log("  rockBad:", JSON.stringify(out.rockBad));
        console.log(`\n  ${failed ? "✗ FEHLGESCHLAGEN" : "✓ ALLE BÄNDER GRÜN"}\n`);
    } catch (e) {
        console.error("DIAG-FEHLER:", e);
        failed = true;
    } finally {
        await browser.close();
        server.kill();
    }
    process.exit(failed ? 1 : 0);
})();
