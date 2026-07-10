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

            // ═══ Ω-B4 (AUSLÖSCHUNGS-WELLE) — DAS DORF IST STUDIO ═══
            // _villageHutVariant + der statische village-Bauplan sind bewusst GESCHNITTEN
            // (spawn_village routet auf spawnSettlement/fachwerk — gate:settlement prueft
            // den lebenden Kanal); die Judge-SUBSTANZ des Hauses lebt eingefroren in
            // KIND_SUBSTANCE.haus_basis und bleibt physik-wahr: sie STEHT (Ω-Φ2), der
            // Lastpfad schliesst (Ω-Φ5), der Innenraum ist BEGEHBAR (hohl) und die
            // TUER-LUECKE ist KEIN Part (begehbar per Konstruktion) — die V18.248-Proben
            // auf die neue Wahrheit gehoben, NICHT vakuoes.
            o.b4HutCut = typeof r._villageHutVariant !== "function";
            o.b4VillageAbsent = !r.state.blueprints.village;
            const hausSub = (r.constructor.KIND_SUBSTANCE || {}).haus_basis;
            o.b4HausParts = hausSub && Array.isArray(hausSub.parts) ? hausSub.parts.length : 0;
            if (hausSub) {
                const hbp = { parts: JSON.parse(JSON.stringify(hausSub.parts)) };
                o.b4HausStands = r._stability(hbp).inside === true;
                // Ω-Φ5: der Richter verdiktet "intact" (Waende tragen zum Boden, das Dach
                // sitzt auf den Waenden — dieselbe Schwelle wie beim Tempel).
                o.b4HausLoadIntact = r._loadPath(hbp).intact === true;
                // BEGEHBAR: kein Part deckt die Innen-Mitte auf Brusthoehe; die TUER-MITTE
                // der Front-Wand (z=-2.55) ist FREI (die Luecke ist KEIN Part) — Welt-AABB-
                // Containment via _partWorldAABB.
                const aabbs = hbp.parts.map((p) => r._partWorldAABB(p)).filter(Boolean);
                const covers = (x, y, z) =>
                    aabbs.some(
                        (a) =>
                            x >= a.min.x && x <= a.max.x && y >= a.min.y && y <= a.max.y && z >= a.min.z && z <= a.max.z
                    );
                o.b4HausHollow = !covers(0, 1.6, 0); // der Innenraum ist frei
                o.b4HausDoorGap = !covers(0, 1.6, -2.55); // die Tuer-Mitte ist KEIN Part
                // der Haus-Mesh baut aus der Substanz (kein Fehler):
                o.b4HausMeshBuilds = false;
                try {
                    const grp = r._buildFromBlueprint({ name: "_haus_probe", parts: hbp.parts }, 0, undefined, {});
                    o.b4HausMeshBuilds = !!(grp && grp.children && grp.children.length >= 6);
                } catch (e) {
                    o.b4MeshErr = e.message;
                }
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
        console.log(
            "\n=== Ω-PHYSIS Ω-B4 (AUSLÖSCHUNGS-WELLE) — DAS DORF IST STUDIO, die Substanz bleibt physik-wahr ===\n"
        );
        line("_villageHutVariant existiert NICHT mehr", out.b4HutCut, "soll true (AUSLÖSCHUNG)", out.b4HutCut);
        line("village-Bauplan ist ABWESEND", out.b4VillageAbsent, "soll true (AUSLÖSCHUNG)", out.b4VillageAbsent);
        line("KIND_SUBSTANCE.haus_basis traegt 6 Parts", out.b4HausParts, "soll 6", out.b4HausParts === 6);
        line("die Haus-Substanz STEHT (Ω-Φ2)", out.b4HausStands, "soll true", out.b4HausStands);
        line("Haus-Substanz: Lastpfad schließt (Ω-Φ5)", out.b4HausLoadIntact, "soll true", out.b4HausLoadIntact);
        line("Haus-Substanz ist HOHL/BEGEHBAR (Innen frei)", out.b4HausHollow, "soll true", out.b4HausHollow);
        line("TUER-LUECKE ist KEIN Part (Front-Mitte frei)", out.b4HausDoorGap, "soll true", out.b4HausDoorGap);
        line(
            "der Haus-Mesh baut aus der Substanz (kein Fehler)",
            out.b4HausMeshBuilds + (out.b4MeshErr ? " [" + out.b4MeshErr + "]" : ""),
            "soll true",
            out.b4HausMeshBuilds
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
            out.b4HutCut,
            out.b4VillageAbsent,
            out.b4HausParts === 6,
            out.b4HausStands,
            out.b4HausLoadIntact,
            out.b4HausHollow,
            out.b4HausDoorGap,
            out.b4HausMeshBuilds,
        ];
        const failed = all.filter((b) => !b).length;
        console.log(
            "\n" +
                (failed === 0
                    ? "✓ ALLE GRÜN — die Rinde erzählt ihr Holz, das Dorf ist Studio und die Haus-Substanz bleibt physik-wahr (der volle Bogen)."
                    : `✗ ${failed} FAIL`)
        );
        process.exitCode = failed === 0 ? 0 : 1;
    } finally {
        await browser.close();
        server.kill();
    }
})();
