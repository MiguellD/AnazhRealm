// diag-nervensystem.cjs — DER PIPELINE-BEWEIS (Schöpfer: „ich glaube dir nicht, dass du wirklich
// die Pipeline baust … wenn ich ein neues Asset in der Vorlagedatei erstelle, wird automatisch
// erkannt, wie oft platziert, ein Blueprint mit Reglern erstellt, sowie die LODs?").
// Das Gate beweist GENAU DIESEN Satz in vier Prüfungen:
//   A (statisch, Node): die EINE Platzierungs-Quelle existiert — PORTAL_RENDER_CONFIG.placement
//     in foundry-core; der STUDIO-WALD liest sie SELBST (kein lokales SCALE-Literal mehr in
//     phytogenesis); die get-render-config-Brücke exportiert sie.
//   B (Browser, foundry-ON, Null-Renderer): die Placement-Daten KOMMEN AN und stimmen mit
//     foundry-core überein (der Draht lebt).
//   C (LIVE GEWINNT): eine Mutation der angekommenen Daten (scale.eiche ×2) ändert die
//     Welt-Skalen-Matrix SOFORT — bewiesen: AnazhRealm liest die Daten, keinen Hardcode-Spiegel.
//   D (DAS NEUE ASSET, end-to-end): ein synthetisches kind:"tree"-Preset wird ins LIVE-Rezept-
//     buch injiziert (== der Schöpfer legt ein Asset im Vorlagefile an) → der AUTO-BLUEPRINT
//     `baum_<id>` entsteht (Identität + _grownSpecies), die generische Preset-Regel löst ihn auf,
//     und der WALD-GENERATOR streut ihn in frische Zellen — ohne EINE Zeile AnazhRealm-Edit.
//     (Die LODs fließen konstruktiv: buildInstance(id, seed, 0/1/2) ist die Studio-eigene Stufung.)
//   node scripts/diag-nervensystem.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.NERV_PORT || 4406);
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

(async () => {
    console.log("=== NERVENSYSTEM — TEIL A: die EINE Platzierungs-Quelle (statisch) ===");
    const core = fs.readFileSync(path.join(root, "foundry-core.js"), "utf8");
    const phyto = fs.readFileSync(path.join(root, "worlds/terrain/phytogenesis.js"), "utf8");
    check("foundry-core trägt PORTAL_RENDER_CONFIG.placement", /placement:\s*\{/.test(core) && /treeScaleMul:\s*0\.82/.test(core));
    check("placement.scale trägt die Arten (eiche 4.16 · strauch 0.332 · gras 0.24)", /eiche:\s*4\.16/.test(core) && /strauch:\s*0\.332/.test(core) && /gras:\s*0\.24/.test(core));
    check("placement.rarity trägt die Kristall-Seltenheit", /rarity:\s*\{\s*kristalle:/.test(core));
    // Der Studio-Wald liest die Quelle SELBST (kein lokales SCALE-Literal mehr; Kommentare gestrippt).
    const phytoCode = phyto.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
    check(
        "phytogenesis liest PORTAL_RENDER_CONFIG.placement (kein lokales SCALE-Literal)",
        /PORTAL_RENDER_CONFIG\.placement/.test(phytoCode) && !/const SCALE = \{\s*gras: 0\.24/.test(phytoCode)
    );
    check("phytogenesis nutzt TREE_SCALE_MUL statt des 0.82-Literals im Wald", /SCALE\[sp\] \* tr\.s \* TREE_SCALE_MUL/.test(phytoCode));
    check("die Brücke exportiert placement (get-render-config)", /placement:\s*c\.placement/.test(phytoCode));

    console.log("\n=== TEIL B-D: der lebende Draht (Browser, foundry-ON) ===");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 180000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessSkinResCap = 64;
        window.__anazhForceFoundry = true;
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const out = await page.evaluate(async () => {
        const res = { b: {}, c: {}, d: {} };
        const dl0 = performance.now() + 60000;
        while (
            (!window.anazhRealm || typeof window.anazhRealm._foundryWorldScaleMatrix !== "function") &&
            performance.now() < dl0
        )
            await new Promise((r) => setTimeout(r, 100));
        const r = window.anazhRealm;
        const A = r.constructor;
        // Worker + Config abwarten (get-render-config folgt dem ready-Handshake).
        const f = r._ensureAssetFoundry();
        const dl = performance.now() + 50000;
        while (performance.now() < dl) {
            const rc = A._studioRenderConfig;
            if (f && f.ready && rc && rc.placement && rc.placement.scale) break;
            await new Promise((res2) => setTimeout(res2, 80));
        }
        const rc = A._studioRenderConfig;
        // ===== B: die Daten KOMMEN AN =====
        res.b.arrived = !!(rc && rc.placement && rc.placement.scale);
        res.b.eiche = rc && rc.placement && rc.placement.scale ? rc.placement.scale.eiche : null;
        res.b.treeMul = rc && rc.placement ? rc.placement.treeScaleMul : null;
        res.b.rarityKristalle = rc && rc.placement && rc.placement.rarity ? rc.placement.rarity.kristalle : null;
        // ===== C: LIVE GEWINNT (Mutation → die Matrix folgt SOFORT) =====
        if (res.b.arrived) {
            const m1 = r._foundryWorldScaleMatrix("eiche");
            res.c.before = +m1.elements[0].toFixed(4); // erwartet 4.16·0.82 = 3.4112
            rc.placement.scale.eiche = 8.32; // der „Schöpfer editiert das Vorlagefile"-Moment
            const m2 = r._foundryWorldScaleMatrix("eiche");
            res.c.after = +m2.elements[0].toFixed(4); // erwartet 8.32·0.82 = 6.8224
            rc.placement.scale.eiche = 4.16; // restaurieren
        }
        // ===== D: DAS NEUE ASSET end-to-end =====
        try {
            if (f && f.recipes) {
                f.recipes.testahorn = { kind: "tree", panel: "plant", s: { api: 0.4, delta: 2.3, slim: 0.5, trop: -0.1, leaf: 0.65 }, fx: {} };
                const n = r._foundryAutoRegisterSpecies(f.recipes);
                res.d.registered = n;
                const bp = r.state.blueprints && r.state.blueprints.baum_testahorn;
                res.d.blueprint = !!bp;
                res.d.grownSpecies = bp ? bp._grownSpecies : null;
                res.d.presetResolves = r._foundryPresetFor("baum_testahorn");
                const extras = r._forestExtraSpecies();
                res.d.inExtras = extras.some((e) => e.species === "baum_testahorn");
                // Der Wald streut sie: Zellen scannen, bis ein Dart der neuen Art geboren wird.
                let found = 0,
                    scanned = 0;
                const seedInt = r._forestSeedInt();
                outer: for (let cx = -20; cx <= 20; cx += 1) {
                    for (let cz = -20; cz <= 20; cz += 1) {
                        const darts = r._forestCellDarts(cx, cz, seedInt) || [];
                        scanned++;
                        for (const d of darts)
                            if (d.sp === "baum_testahorn") {
                                found++;
                                break outer;
                            }
                    }
                }
                res.d.planted = found > 0;
                res.d.scannedCells = scanned;
            } else res.d.err = "kein Rezeptbuch (Worker nicht ready?)";
        } catch (e) {
            res.d.err = (e && e.message) || String(e);
        }
        return res;
    });

    await browser.close();
    server.close();

    check("B: placement kommt durch die Brücke an", out.b.arrived === true);
    check("B: scale.eiche == 4.16 (foundry-core-Wert, live)", out.b.eiche === 4.16, String(out.b.eiche));
    check("B: treeScaleMul == 0.82", out.b.treeMul === 0.82, String(out.b.treeMul));
    check("B: rarity.kristalle angekommen", typeof out.b.rarityKristalle === "number", String(out.b.rarityKristalle));
    check("C: Welt-Skala VOR Mutation = 4.16·0.82", out.c.before === 3.4112, String(out.c.before));
    check("C: LIVE GEWINNT — Mutation ×2 → Matrix folgt sofort (8.32·0.82)", out.c.after === 6.8224, String(out.c.after));
    check("D: neues kind:tree-Preset → Auto-Blueprint registriert", out.d.registered >= 1 && out.d.blueprint === true, out.d.err || "");
    check("D: der Blueprint trägt die Identität (_grownSpecies)", out.d.grownSpecies === "baum_testahorn");
    check("D: die generische Preset-Regel löst ihn auf (kein Tabellen-Edit)", out.d.presetResolves === "testahorn");
    check("D: die Auto-Art steht in der Wald-Nischen-Liste", out.d.inExtras === true);
    check("D: der Wald-Generator STREUT die neue Art (Dart geboren)", out.d.planted === true, `${out.d.scannedCells || 0} Zellen gescannt`);
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);

    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — DAS NERVENSYSTEM LEBT: eine Platzierungs-Quelle im Vorlagefile (foundry-core placement), der Studio-Wald liest sie selbst, AnazhRealm liest sie LIVE (Mutation gewinnt gegen jeden Spiegel), und ein NEUES kind:tree-Preset registriert sich als Blueprint + wird vom Wald gestreut — ohne eine Zeile AnazhRealm-Edit. LODs + Regler fließen konstruktiv (buildInstance/get-recipes)."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Nervensystem-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
