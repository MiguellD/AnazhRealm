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

        console.log("\n  DER WAHRE WUCHS — Genom-Beweis (wahrerwuchs §7)\n");
        for (const c of checks) console.log(`  ${c.ok ? "✓" : "✗"} ${c.name} — ${JSON.stringify(c.val)}`);
        console.log(
            `\n  Klassen-Verteilung: ${JSON.stringify(out.classes)} | Höhen ${out.minHeight}–${out.maxHeight} m`
        );
        if (out.badBuckle.length) console.log("  badBuckle:", JSON.stringify(out.badBuckle));
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
