// diag-place-policy.cjs — N5 (Nervensystem-Plan Phase δ): DIE PLACE-POLICY-LINSE (H8).
// Beweist headless (foundry-ON, Null-Renderer), dass die EINE Place-Auflösung (`_placePolicyFor`)
// + der EINE Dispatch-Chokepoint (`_placeDispatch`) die Buch-Arten korrekt in die Welt weichen —
// und dass HEUTE kein Verhalten kippt (byte-gleiche Wald-Nischen):
//   (a) Rezept OHNE place + kind tree  → mode "forest"; die testahorn-Nische entsteht wie heute —
//       die Extras-Liste ist IDENTISCH zur alten direkten placeExtra-Regel (vorher/nachher-Identität,
//       im Test als Referenz nachgerechnet) + der Wald-Generator streut die Art (Dart geboren).
//   (b) Rezept OHNE place + kind vehicle → mode "none" (kein Worldgen-Eintrag, keine fahrzeug_-Nische).
//   (c) synthetisches fx.place {mode:"none"} auf einem tree-Preset → Katalog JA (Auto-Blueprint
//       entsteht), Wald-Nische NEIN — der H8-Kern: none vs forest DISJUNKT.
//   (d) synthetisches site-Rezept (N5.6, über eine injizierte KIND_POLICY-Zeile = die N2-Dritter-
//       Kern-Mechanik, 0 Stamm-Diff) → registriert + siteTag als Daten lesbar + streut NICHT
//       (site verhält sich heute wie none; die Welt-Nische ist der benannte ε-Anschluss/Porta).
//   (e) must-ignore/must-preserve: unbekannte place-Felder crashen nicht + reisen unangetastet mit;
//       ein unbekannter mode fällt GESCHLOSSEN auf "none"; ein malformter Block → Ableitung.
// --selftest (Verletzungs-Injektion, macht die Linse nicht-vakuös): der Dispatch wird auf
// „immer forest" verbogen → die none-Art MUSS in den Nischen erscheinen (die Detektion feuert),
// sonst rot („Selbst-Test vakuös").
//   node scripts/diag-place-policy.cjs --selftest
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const SELFTEST = process.argv.includes("--selftest");
const PORT = Number(process.env.PLACE_PORT || 4421);
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
    console.log(`=== N5 PLACE-POLICY (H8) — foundry-ON, Null-Renderer${SELFTEST ? " · mit Selbst-Test" : ""} ===`);
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

    const out = await page.evaluate(async (selftest) => {
        const res = { a: {}, b: {}, c: {}, d: {}, e: {}, st: {} };
        const dl0 = performance.now() + 60000;
        while (
            (!window.anazhRealm || typeof window.anazhRealm._placePolicyFor !== "function") &&
            performance.now() < dl0
        )
            await new Promise((r) => setTimeout(r, 100));
        const r = window.anazhRealm;
        if (!r) return { fatal: "anazhRealm bootet nicht" };
        const A = r.constructor;
        // Worker + Rezeptbuch abwarten (get-recipes folgt dem ready-Handshake).
        const f = r._ensureAssetFoundry();
        const dl = performance.now() + 50000;
        while (performance.now() < dl) {
            if (f && f.ready && f.recipes && f.recipes.eiche) break;
            await new Promise((res2) => setTimeout(res2, 80));
        }
        if (!f || !f.recipes || !f.recipes.eiche) return { fatal: "kein Rezeptbuch (Worker nicht ready?)" };
        const BASE = { eiche: 1, fichte: 1, tanne: 1, birke: 1, weide: 1, mammut: 1 };
        // Die ALTE Regel (direkter placeExtra-Griff, Stand N1) als REFERENZ im Test nachgerechnet —
        // die Identität beweist: die neue Auflösung ändert die heutige Nischen-Liste byte-nicht.
        const oldRule = () => {
            const out2 = [];
            for (const id of Object.keys(f.recipes).sort()) {
                const rec = f.recipes[id];
                const pol = rec && A.KIND_POLICY[rec.kind];
                if (!pol || pol.placeExtra !== "forest" || BASE[id]) continue;
                let h = 2166136261 >>> 0;
                for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619) >>> 0;
                out2.push({ species: pol.prefix + id, w0: 0.18, center: 0.05 + (h % 1000) / 1110 });
            }
            return out2;
        };
        const freshExtras = () => {
            r._forestExtraCache = null; // Buch-Identität bleibt bei Injektionen gleich → Cache explizit leeren
            return r._forestExtraSpecies();
        };
        try {
            // ===== (a) Rezept OHNE place + kind tree → forest, Nische byte-gleich =====
            f.recipes.testahorn = {
                kind: "tree",
                panel: "plant",
                s: { api: 0.4, delta: 2.3, slim: 0.5, trop: -0.1, leaf: 0.65 },
                fx: {},
            };
            r._foundryAutoRegisterSpecies(f.recipes);
            const pa = r._placePolicyFor(f.recipes.testahorn);
            res.a.mode = pa.mode;
            res.a.dispatch = r._placeDispatch(pa, { id: "testahorn" });
            const extrasA = freshExtras();
            res.a.identical = JSON.stringify(extrasA) === JSON.stringify(oldRule());
            res.a.inExtras = extrasA.some((e) => e.species === "baum_testahorn");
            // ===== (b) Rezept OHNE place + kind vehicle → none =====
            const vid = Object.keys(f.recipes).find((id) => f.recipes[id] && f.recipes[id].kind === "vehicle");
            res.b.vid = vid || null;
            if (vid) {
                const pb = r._placePolicyFor(f.recipes[vid]);
                res.b.mode = pb.mode;
                res.b.dispatch = r._placeDispatch(pb, { id: vid });
            }
            res.b.noVehicleNiche = !extrasA.some((e) => String(e.species).indexOf("fahrzeug_") === 0);
            // ===== (c) fx.place {mode:"none"} auf tree → Katalog JA, Nische NEIN (H8-Kern) =====
            f.recipes.testnone = {
                kind: "tree",
                panel: "plant",
                s: { api: 0.5, delta: 2.2, slim: 0.6, trop: 0.1, leaf: 0.5 },
                fx: { place: { mode: "none" } },
            };
            r._foundryAutoRegisterSpecies(f.recipes);
            res.c.katalog = !!(r.state.blueprints && r.state.blueprints.baum_testnone);
            const pc = r._placePolicyFor(f.recipes.testnone);
            res.c.mode = pc.mode;
            res.c.dispatch = r._placeDispatch(pc, { id: "testnone" });
            const extrasC = freshExtras();
            res.c.inExtras = extrasC.some((e) => e.species === "baum_testnone");
            res.c.forestStillThere = extrasC.some((e) => e.species === "baum_testahorn");
            // ===== (d) site-Rezept über injizierte KIND_POLICY-Zeile (N2-Mechanik, 0 Stamm-Diff) =====
            const KP0 = A.KIND_POLICY;
            try {
                A.KIND_POLICY = Object.freeze(
                    Object.assign({}, KP0, {
                        tor: Object.freeze({
                            prefix: "tor_",
                            donor: "fahrzeug_wagen",
                            grown: false,
                            builtIn: false,
                            placeExtra: null,
                        }),
                    })
                );
                f.recipes.probetor = { kind: "tor", panel: "tor", s: {}, fx: { place: { mode: "site", siteTag: "tor" } } };
                const nTor = r._foundryAutoRegisterSpecies(f.recipes);
                res.d.registered = nTor >= 1 && !!(r.state.blueprints && r.state.blueprints.tor_probetor);
                const pd = r._placePolicyFor(f.recipes.probetor);
                res.d.mode = pd.mode;
                res.d.siteTag = pd.siteTag;
                res.d.dispatch = r._placeDispatch(pd, { id: "probetor" });
                res.d.inExtras = freshExtras().some((e) => e.species === "tor_probetor");
            } finally {
                A.KIND_POLICY = KP0; // die injizierte Zeile war Test-seitig — restaurieren (Gate-Hook-Lehre)
            }
            // ===== Verhaltens-Tiefe: der Wald-Generator streut testahorn, NIE testnone/probetor =====
            {
                let ahorn = false;
                let forbidden = null;
                const seedInt = r._forestSeedInt();
                outer: for (let cx = -20; cx <= 20; cx += 1) {
                    for (let cz = -20; cz <= 20; cz += 1) {
                        const darts = r._forestCellDarts(cx, cz, seedInt) || [];
                        for (const d of darts) {
                            if (d.sp === "baum_testnone" || d.sp === "tor_probetor") forbidden = d.sp;
                            if (d.sp === "baum_testahorn") ahorn = true;
                        }
                        if (ahorn) break outer;
                    }
                }
                res.a.planted = ahorn;
                res.c.forbiddenDart = forbidden;
            }
            // ===== (e) must-ignore / must-preserve =====
            const uPlace = { mode: "forest", layer: "boden", fremdFeld: { tief: [1, 2] }, nochEins: "x" };
            const recU = { kind: "tree", fx: { place: uPlace } };
            const p1 = r._placePolicyFor(recU);
            res.e.mode = p1.mode;
            res.e.preserved =
                JSON.stringify(p1.fremdFeld) === JSON.stringify({ tief: [1, 2] }) &&
                p1.nochEins === "x" &&
                p1.layer === "boden";
            res.e.origUntouched =
                JSON.stringify(recU.fx.place) ===
                JSON.stringify({ mode: "forest", layer: "boden", fremdFeld: { tief: [1, 2] }, nochEins: "x" });
            res.e.unknownMode = r._placePolicyFor({ kind: "tree", fx: { place: { mode: "quantenschaum" } } }).mode;
            res.e.malformed = r._placePolicyFor({ kind: "tree", fx: { place: 5 } }).mode; // Ableitung: tree → forest
            res.e.nullRec = r._placePolicyFor(null).mode;
            // ===== Selbst-Test: Verletzungs-Injektion — die none-Art erscheint doch in den Nischen =====
            if (selftest) {
                const proto = Object.getPrototypeOf(r);
                r._placeDispatch = () => "forest"; // die Verletzung: der Dispatch weicht ALLES in den Wald
                try {
                    res.st.detected = freshExtras().some((e) => e.species === "baum_testnone");
                } finally {
                    delete r._placeDispatch; // Instanz-Schatten weg → die Prototyp-Methode trägt wieder
                    res.st.restored = r._placeDispatch === proto._placeDispatch;
                    freshExtras(); // den sauberen Zustand zurücklassen
                }
            }
        } catch (e) {
            res.err = (e && e.stack) || (e && e.message) || String(e);
        }
        return res;
    }, SELFTEST);

    await browser.close();
    server.close();

    if (out.fatal) {
        console.error(`❌ FATAL: ${out.fatal}`);
        process.exit(2);
    }
    if (out.err) check("Auswertung ohne Wurf", false, out.err.split("\n")[0]);
    check('a: tree ohne place → mode "forest"', out.a.mode === "forest", String(out.a.mode));
    check('a: Dispatch weicht in den Wald-Kanal ("forest")', out.a.dispatch === "forest", String(out.a.dispatch));
    check("a: Nischen-Liste IDENTISCH zur alten placeExtra-Regel (vorher/nachher)", out.a.identical === true);
    check("a: die testahorn-Nische entsteht wie heute", out.a.inExtras === true);
    check("a: der Wald-Generator streut testahorn (Dart geboren)", out.a.planted === true);
    check('b: vehicle ohne place → mode "none"', out.b.vid !== null && out.b.mode === "none", `${out.b.vid}: ${out.b.mode}`);
    check("b: vehicle-Dispatch → kein Worldgen-Kanal (null)", out.b.dispatch === null, String(out.b.dispatch));
    check("b: keine fahrzeug_-Nische in der Wald-Liste", out.b.noVehicleNiche === true);
    check("c: fx.place {mode:none} auf tree → Katalog JA (Auto-Blueprint)", out.c.katalog === true);
    check('c: … → mode "none" + Dispatch null', out.c.mode === "none" && out.c.dispatch === null, `${out.c.mode}/${out.c.dispatch}`);
    check("c: H8-Kern — none-Art NICHT in der Wald-Nische (disjunkt)", out.c.inExtras === false);
    check("c: … während die forest-Art (testahorn) drin bleibt", out.c.forestStillThere === true);
    check("c: kein verbotener Dart (testnone/probetor) im Zellen-Scan", out.c.forbiddenDart == null, String(out.c.forbiddenDart));
    check("d: site-Rezept über KIND_POLICY-Zeile registriert (tor_probetor)", out.d.registered === true);
    check('d: Auflösung erkennt mode "site" + siteTag lesbar', out.d.mode === "site" && out.d.siteTag === "tor", `${out.d.mode}/${out.d.siteTag}`);
    check("d: site streut NICHT (Dispatch null + keine Nische)", out.d.dispatch === null && out.d.inExtras === false);
    check('e: unbekannte place-Felder reisen unangetastet mit (must-preserve)', out.e.mode === "forest" && out.e.preserved === true);
    check("e: das Rezept selbst bleibt unberührt (kein Strip am Original)", out.e.origUntouched === true);
    check('e: unbekannter mode fällt geschlossen auf "none"', out.e.unknownMode === "none", String(out.e.unknownMode));
    check("e: malformter place-Block → Ableitung (tree → forest), kein Crash", out.e.malformed === "forest", String(out.e.malformed));
    check('e: rec null → "none", kein Crash', out.e.nullRec === "none", String(out.e.nullRec));
    if (SELFTEST) {
        check(
            "SELBST-TEST: die Verletzung (Dispatch → immer forest) macht die none-Art sichtbar — die Linse ist nicht vakuös",
            out.st.detected === true
        );
        check("SELBST-TEST: der Dispatch ist restauriert (Prototyp trägt wieder)", out.st.restored === true);
    }
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);

    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en): die Place-Policy-Weiche (N5/H8) hält nicht.`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — N5 PLACE-POLICY: die EINE Auflösung (_placePolicyFor: Rezept-fx.place führt, sonst placeExtra-Ableitung) + der EINE Dispatch-Chokepoint (_placeDispatch) weichen die Buch-Arten korrekt — forest byte-gleich zur alten Regel, none/hand/site/settlement ohne Worldgen (site trägt den siteTag als Daten), unbekannte Felder must-ignore/must-preserve. H8: none vs forest DISJUNKT."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Place-Policy-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
