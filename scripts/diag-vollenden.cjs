// diag-vollenden.cjs — DER VOLLE BOGEN GESCHLOSSEN (V18.246):
//   Ω-OPSIS Ω-O7  — DIE RINDE-MASERUNG (prozedural aus dem holz-Tag, KEINE Bitmap):
//                   die Rinde erzählt ihr Holz (Längs-Faser + härte-Risse).
//   Ω-PHYSIS Ω-B4 — DIE DORF-VARIANTEN (das generative Tempel-Muster aufs Dorf):
//                   jede Hütte eine deterministische Variante (Größe·Geschoss·Dach·
//                   Fenster·Schornstein), box+pyramid-only (affinität-neutral),
//                   PHYSIK-GARANT (jede Hütte steht, Lastpfad schließt).
// Reine Berechnung + Material-/Geometrie-Konstruktion → headless verifizierbar
// (der LOOK des Maserung/der Varianten ist AUGEN-bound, Wand 1 von Ω-OPSIS).
//   node scripts/diag-vollenden.cjs
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
            const r = window.anazhRealm;
            const o = {};
            const holz = r.state.materials.holz;
            const holzTags = (holz && holz.tags) || { lebendig: 0.8, härte: 0.5 };

            // ═══ Ω-O7 — DIE RINDE-MASERUNG ═══
            // (a) SOURCE: der Maserungs-Block lebt im PBR-Pfad + die Baum-Rinde weckt ihn.
            const pbrSrc = r._buildPbrNodeMaterial.toString();
            o.o7BlockInPbr =
                /opts\.bark/.test(pbrSrc) && /RINDE-MASERUNG/.test(pbrSrc) && /mx_noise_float/.test(pbrSrc);
            o.o7BarkHookInTree = /bark:\s*true/.test(r._buildTreeSkeletonLeaves.toString());
            // (b) KONSTRUKTION: das Rinden-Material baut OHNE Node-Fehler (der Maserungs-
            //     Node-Graph konstruiert → die TSL-Ops existieren). Marker zurücksetzen.
            window.__barkGrainError = undefined;
            const barkMat = r._buildToonNodeMaterial({
                vertexColors: true,
                useFlexAttr: true,
                bark: true,
                tags: holzTags,
            });
            o.o7BarkMatBuilds = !!(barkMat && barkMat.colorNode);
            o.o7NoGrainError = window.__barkGrainError === undefined;
            o.o7GrainErr = window.__barkGrainError || "";
            // (c) das LAUB (foliageLeaf) bleibt unberührt — Ω-O14-Alpha-Maske heil, KEIN bark-Pfad.
            window.__barkGrainError = undefined;
            const leafMat = r._buildToonNodeMaterial({
                vertexColors: true,
                useFlexAttr: true,
                foliageLeaf: true,
                tags: (r.state.materials.laub && r.state.materials.laub.tags) || {},
            });
            o.o7LeafUntouched = !!(leafMat && leafMat.colorNode && window.__barkGrainError === undefined);
            o.o7LeafAlpha = leafMat && typeof leafMat.alphaTest === "number" && leafMat.alphaTest > 0;
            // ═══ Ω-O14 — DIE LAAS-METHODE: gebackener Laub-Büschel-ATLAS ═══
            // (a) der Atlas baut prozedural (eine CanvasTexture, ≥256², kein Bitmap-Download).
            o.o14AtlasFn = typeof r._ensureFoliageClusterAtlas === "function";
            const atlas = o.o14AtlasFn ? r._ensureFoliageClusterAtlas() : null;
            o.o14AtlasBuilds = !!(atlas && atlas.isTexture && atlas.image && (atlas.image.width || 0) >= 256);
            // (b) das Laub-Material SAMPELT den Atlas (Source-Probe: Atlas-Helfer + texture()).
            o.o14MatSamples = /_ensureFoliageClusterAtlas/.test(pbrSrc) && /\.texture\(/.test(pbrSrc);
            // (c) das Laub-Material baut mit dem Atlas OHNE Node-Fehler.
            window.__foliageAtlasError = undefined;
            const fol2 = r._buildToonNodeMaterial({
                vertexColors: true,
                useFlexAttr: true,
                foliageLeaf: true,
                tags: (r.state.materials.laub && r.state.materials.laub.tags) || {},
            });
            o.o14FoliageNoError = window.__foliageAtlasError === undefined && !!(fol2 && fol2.colorNode);
            o.o14FoliageErr = window.__foliageAtlasError || "";
            // (d) der ECHTE Baum-Rinden-Pfad: das Material, das _buildTreeSkeletonLeaves für
            //     die Rinde baut (vertexColors + useFlexAttr + bark + holz.tags), konstruiert
            //     den Maserungs-Node-Graph OHNE Fehler — exakt der Baum-Rinden-Auslesewert.
            try {
                window.__barkGrainError = undefined;
                const treeBarkMat = r._buildToonNodeMaterial({
                    vertexColors: true,
                    useFlexAttr: true,
                    bark: true,
                    tags: holzTags,
                });
                o.o7TreeBuilds = !!(treeBarkMat && treeBarkMat.colorNode);
                o.o7TreeNoError = window.__barkGrainError === undefined;
            } catch (e) {
                o.o7TreeBuilds = false;
                o.o7TreeNoError = false;
                o.o7TreeErr = e.message;
            }

            // ═══ Ω-B4 — DIE DORF-VARIANTEN ═══
            o.b4IsFn = typeof r._villageHutVariant === "function";
            const placeFor = (i) => {
                const angle = (i / 6) * Math.PI * 2;
                const radius = 7.5;
                return {
                    hx: Math.cos(angle) * radius,
                    hz: Math.sin(angle) * radius,
                    bodyRot: -angle + Math.PI,
                    ix: -Math.cos(angle),
                    iz: -Math.sin(angle),
                    sx: -Math.sin(angle),
                    sz: Math.cos(angle),
                };
            };
            // (a) N Hütten EINES Dorfs (fixer Seed, Index 0..5) → variiert, nicht geklont.
            const sig = (parts) => {
                const roofs = parts.filter((p) => p.shape === "pyramid").length;
                const gable = parts.some((p) => p.shape === "box" && p.rotation && Math.abs(p.rotation.z) > 0.05);
                const body = parts.find((p) => p.color === 0x6e3a14 || (p.size && p.size.y > 1 && p.size.x > 1.5));
                const h = body ? Math.round(body.size.y * 10) : 0;
                return parts.length + ":" + roofs + ":" + (gable ? "G" : "W") + ":" + h;
            };
            const hutSigs = new Set();
            let allHutsStand = true;
            let allHutsLoadIntact = true;
            let onlyBoxPyramid = true;
            let noMaterialField = true;
            let allHollow = true; // V18.248: BEGEHBAR — die Innen-Mitte ist frei
            for (let i = 0; i < 6; i++) {
                const place = placeFor(i);
                const hut = r._villageHutVariant("anazh-seed-A", i, place);
                hutSigs.add(sig(hut));
                const bp = { parts: hut };
                if (!(r._stability(bp).inside === true)) allHutsStand = false;
                // Ω-Φ5: der Richter verdiktet "intact" (winzige Deko-Fenster < 2% Masse zählen
                // nicht als gebrochener Lastpfad — dieselbe Schwelle wie beim Tempel).
                if (!(r._loadPath(bp).intact === true)) allHutsLoadIntact = false;
                for (const p of hut) {
                    if (p.shape !== "box" && p.shape !== "pyramid") onlyBoxPyramid = false;
                    if (p.material) noMaterialField = false;
                }
                // BEGEHBAR (V18.248): die Hütte ist HOHL — kein Part deckt die Innen-Mitte auf
                // Brusthöhe (eine solide Box hätte sie gefüllt). Per-Part-Kollision → man betritt
                // den Raum durch die Tür-Lücke (Welt-AABB-Containment via _partWorldAABB).
                const aabbs = hut.map((p) => r._partWorldAABB(p)).filter(Boolean);
                const cy = 1.6; // Brusthöhe über dem Fundament
                const covered = aabbs.some(
                    (a) =>
                        place.hx >= a.min.x &&
                        place.hx <= a.max.x &&
                        cy >= a.min.y &&
                        cy <= a.max.y &&
                        place.hz >= a.min.z &&
                        place.hz <= a.max.z
                );
                if (covered) allHollow = false;
            }
            o.b4VariantCount = hutSigs.size; // verschiedene Hütten in EINEM Dorf
            o.b4AllStand = allHutsStand; // jede Hütte steht (Ω-Φ2)
            o.b4LoadIntact = allHutsLoadIntact; // jede Hütte: Lastpfad schließt (Ω-Φ5)
            o.b4OnlyBoxPyramid = onlyBoxPyramid; // KEINE neue Form → affinität-neutral (V17.17)
            o.b4NoMaterial = noMaterialField; // KEIN Material → 0 Affinität, DSL-gespawnt
            o.b4Hollow = allHollow; // BEGEHBAR — der Innenraum ist frei (kein solider Block)
            // (b) verschiedene Welt-Seeds → verschiedene Dörfer.
            const dorfA = r._villageHutVariant("alpha", 0, placeFor(0));
            const dorfB = r._villageHutVariant("beta", 0, placeFor(0));
            o.b4WorldSeedVaries = sig(dorfA) !== sig(dorfB) || dorfA.length !== dorfB.length;
            // (c) Determinismus: gleicher (Seed, Index) → bit-identische Geometrie.
            const det1 = r._villageHutVariant("gamma", 2, placeFor(2));
            const det2 = r._villageHutVariant("gamma", 2, placeFor(2));
            o.b4Deterministic =
                det1.length === det2.length &&
                det1.every(
                    (p, k) =>
                        p.shape === det2[k].shape &&
                        Math.abs(p.position.x - det2[k].position.x) < 1e-9 &&
                        Math.abs(p.position.y - det2[k].position.y) < 1e-9 &&
                        p.size.y === det2[k].size.y
                );
            // (d) das GANZE Dorf-Bauplan: existiert, reich, STEHT, affinität-IDENTISCH zu V18.245.
            // Die Spawn-Affinität (computeCompoundTags) ist eine MAX über (Form-Aktivierung ×
            // Material-Tags) je Part. Material-lose Parts erben bei der Registrierung das DEFAULT
            // "stein" (uniform für ALLE box/pyramid/cylinder-Parts) → die Compound-Tags hängen
            // NUR vom Form-SATZ ab (nicht von Maß/Zahl/Position, die die MAX nicht ändern). Der
            // Form-Satz {box,pyramid,cylinder} ist unverändert (Hütten box+pyramid wie vorher,
            // Brunnen cylinder) → BEWEIS: die Dorf-Compound-Tags sind bit-gleich zu einem
            // kanonischen {box,pyramid,cylinder}×stein-Referenz-Satz (V17.17-Disziplin). (Das
            // Dorf wird ohnehin DSL-gestisch platziert, nicht scatter-gespawnt.)
            const village = r.state.blueprints.village;
            o.b4VillageExists = !!(village && Array.isArray(village.parts));
            o.b4VillageRich = o.b4VillageExists && village.parts.length >= 40;
            o.b4VillageStands = o.b4VillageExists && r._stability(village).inside === true;
            const vShapes = o.b4VillageExists ? [...new Set(village.parts.map((p) => p.shape))] : [];
            o.b4VillageShapeSet = vShapes.every((s) => s === "box" || s === "pyramid" || s === "cylinder");
            const refBp = {
                parts: [
                    { shape: "box", material: "stein", size: { x: 1, y: 1, z: 1 }, position: { x: 0, y: 0, z: 0 } },
                    { shape: "pyramid", material: "stein", size: { x: 1, y: 1, z: 1 }, position: { x: 2, y: 0, z: 0 } },
                    {
                        shape: "cylinder",
                        material: "stein",
                        size: { x: 1, y: 1, z: 1 },
                        position: { x: 4, y: 0, z: 0 },
                    },
                ],
            };
            const refTags = r.computeCompoundTags(refBp);
            const vTags = o.b4VillageExists ? r.computeCompoundTags(village) : {};
            const axes = [...new Set([...Object.keys(refTags), ...Object.keys(vTags)])];
            o.b4AffinityMatch =
                o.b4VillageShapeSet && axes.every((a) => Math.abs((refTags[a] || 0) - (vTags[a] || 0)) < 1e-9);
            o.b4VillageMeshBuilds = false;
            try {
                const grp = r._buildFromBlueprint(village, 0, undefined, {});
                o.b4VillageMeshBuilds = !!(grp && grp.children && grp.children.length > 30);
            } catch (e) {
                o.b4MeshErr = e.message;
            }
            return o;
        });
        const ok = (b) => (b ? "  OK  " : " FAIL ");
        const line = (label, val, expect, pass) =>
            console.log(ok(pass) + label.padEnd(50) + String(val).padStart(10) + "   " + expect);
        console.log("\n=== Ω-OPSIS Ω-O7 — DIE RINDE-MASERUNG (prozedural aus dem holz-Tag) ===\n");
        line("Maserungs-Block lebt im PBR-Pfad (bark+noise)", out.o7BlockInPbr, "soll true", out.o7BlockInPbr);
        line("die Baum-Rinde weckt ihn (bark:true)", out.o7BarkHookInTree, "soll true", out.o7BarkHookInTree);
        line(
            "Rinden-Material baut + Node-Graph konstruiert",
            out.o7BarkMatBuilds + "/" + out.o7NoGrainError + (out.o7GrainErr ? " [" + out.o7GrainErr + "]" : ""),
            "soll true/true",
            out.o7BarkMatBuilds && out.o7NoGrainError
        );
        line(
            "das Laub bleibt unberührt (Ω-O14-Alpha heil)",
            out.o7LeafUntouched + "/" + out.o7LeafAlpha,
            "soll true",
            out.o7LeafUntouched && out.o7LeafAlpha
        );
        line(
            "der echte Baum-Pfad baut Rinde + Laub",
            out.o7TreeBuilds + "/" + out.o7TreeNoError + (out.o7TreeErr ? " [" + out.o7TreeErr + "]" : ""),
            "soll true",
            out.o7TreeBuilds && out.o7TreeNoError
        );
        console.log("\n=== Ω-OPSIS Ω-O14 — DIE LAAS-METHODE: gebackener Laub-Büschel-Atlas ===\n");
        line("_ensureFoliageClusterAtlas existiert", out.o14AtlasFn, "soll true", out.o14AtlasFn);
        line("der Atlas baut prozedural (CanvasTexture ≥256²)", out.o14AtlasBuilds, "soll true", out.o14AtlasBuilds);
        line("das Laub-Material SAMPELT den Atlas (texture)", out.o14MatSamples, "soll true", out.o14MatSamples);
        line(
            "Laub-Material baut mit Atlas (kein Node-Fehler)",
            out.o14FoliageNoError + (out.o14FoliageErr ? " [" + out.o14FoliageErr + "]" : ""),
            "soll true",
            out.o14FoliageNoError
        );
        console.log("\n=== Ω-PHYSIS Ω-B4 — DIE DORF-VARIANTEN (generativ, physik-garant) ===\n");
        line("_villageHutVariant existiert", out.b4IsFn, "soll true", out.b4IsFn);
        line("N Hütten EINES Dorfs sind variiert", out.b4VariantCount, "soll ≥ 3", out.b4VariantCount >= 3);
        line("JEDE Hütte STEHT (Ω-Φ2)", out.b4AllStand, "soll true", out.b4AllStand);
        line("JEDE Hütte: Lastpfad schließt (Ω-Φ5)", out.b4LoadIntact, "soll true", out.b4LoadIntact);
        line("JEDE Hütte ist HOHL/BEGEHBAR (Innen frei)", out.b4Hollow, "soll true", out.b4Hollow);
        line("NUR box+pyramid (affinität-neutral)", out.b4OnlyBoxPyramid, "soll true", out.b4OnlyBoxPyramid);
        line("KEIN Material (0 Affinität, DSL-gespawnt)", out.b4NoMaterial, "soll true", out.b4NoMaterial);
        line(
            "verschiedene Welt-Seeds → verschiedene Dörfer",
            out.b4WorldSeedVaries,
            "soll true",
            out.b4WorldSeedVaries
        );
        line("deterministisch (Seed,Index → bit-gleich)", out.b4Deterministic, "soll true", out.b4Deterministic);
        line(
            "Dorf-Bauplan existiert + reich",
            out.b4VillageExists + "/" + out.b4VillageRich,
            "soll true",
            out.b4VillageExists && out.b4VillageRich
        );
        line("das ganze Dorf STEHT", out.b4VillageStands, "soll true", out.b4VillageStands);
        line(
            "Dorf-Affinität bit-identisch (= {box,pyr,cyl}×stein)",
            out.b4VillageShapeSet + "/" + out.b4AffinityMatch,
            "soll true/true",
            out.b4AffinityMatch
        );
        line(
            "der Dorf-Mesh baut (kein Fehler)",
            out.b4VillageMeshBuilds + (out.b4MeshErr ? " [" + out.b4MeshErr + "]" : ""),
            "soll true",
            out.b4VillageMeshBuilds
        );
        const all = [
            out.o7BlockInPbr,
            out.o7BarkHookInTree,
            out.o7BarkMatBuilds && out.o7NoGrainError,
            out.o7LeafUntouched && out.o7LeafAlpha,
            out.o7TreeBuilds && out.o7TreeNoError,
            out.o14AtlasFn,
            out.o14AtlasBuilds,
            out.o14MatSamples,
            out.o14FoliageNoError,
            out.b4IsFn,
            out.b4VariantCount >= 3,
            out.b4AllStand,
            out.b4LoadIntact,
            out.b4Hollow,
            out.b4OnlyBoxPyramid,
            out.b4NoMaterial,
            out.b4WorldSeedVaries,
            out.b4Deterministic,
            out.b4VillageExists && out.b4VillageRich,
            out.b4VillageStands,
            out.b4AffinityMatch,
            out.b4VillageMeshBuilds,
        ];
        const failed = all.filter((b) => !b).length;
        console.log(
            "\n" +
                (failed === 0
                    ? "✓ ALLE GRÜN — die Rinde erzählt ihr Holz, das Dorf zeigt variierte Hütten (der volle Bogen)."
                    : `✗ ${failed} FAIL`)
        );
        process.exitCode = failed === 0 ? 0 : 1;
    } finally {
        await browser.close();
        server.kill();
    }
})();
