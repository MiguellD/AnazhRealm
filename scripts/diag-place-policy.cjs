// diag-place-policy.cjs — N5 (Nervensystem-Plan Phase δ): DIE PLACE-POLICY-LINSE (H8).
// Beweist headless (foundry-ON, Null-Renderer), dass die EINE Place-Auflösung (`_placePolicyFor`)
// + der EINE Dispatch-Chokepoint (`_placeDispatch`) die Buch-Arten korrekt in die Welt weichen:
//   (a) Rezept OHNE place + kind tree  → mode "forest"; der Bauplan trägt seine Identität, die testahorn-Nische entsteht,
//       der Wald-Generator streut die Art (Dart geboren); (a2) die Live-Buch-Bäume mit place none (Buche · Karst · Totholz)
//       nie in der Nische.
//   (b) Rezept OHNE place + kind vehicle → mode "none" (kein Worldgen-Eintrag, keine fahrzeug_-Nische).
//   (c) synthetisches fx.place {mode:"none"} auf einem tree-Preset → Katalog JA (Auto-Blueprint
//       entsteht), Wald-Nische NEIN — der H8-Kern: none vs forest DISJUNKT.
//   (d) die site-Art eines NEUEN Gesetzbuchs (seine Wirts-Zeile reist im Buch, B7) prüft gate:nervensystem E am echten Buch.
//   (e) must-ignore/must-preserve: unbekannte place-Felder crashen nicht + reisen unangetastet mit;
//       ein unbekannter mode fällt GESCHLOSSEN auf "none"; ein malformter Block → Ableitung.
// --selftest (Verletzungs-Injektion, macht die Linse nicht-vakuös): der Dispatch wird auf
// „immer forest" verbogen → die none-Art MUSS in den Nischen erscheinen (die Detektion feuert),
// sonst rot („Selbst-Test vakuös").
//   node scripts/diag-place-policy.cjs --selftest

const { statikServer, hauptLauf, nullSeite, pruefer, urteilEnde } = require("./lib/welt-boot.cjs");
const SELFTEST = process.argv.includes("--selftest");
const server = statikServer();

const { errs, check } = pruefer();

hauptLauf(async () => {
    console.log(`=== N5 PLACE-POLICY (H8) — foundry-ON, Null-Renderer${SELFTEST ? " · mit Selbst-Test" : ""} ===`);
    await server.lausche(0);
    const { browser, page } = await nullSeite({ frist: 180000 });
    await server.zeige(page, 30000);

    const out = await page.evaluate(async (selftest) => {
        const res = { a: {}, b: {}, c: {}, e: {}, st: {} };
        await window.__weltDa();
        // Worker + Rezeptbuch abwarten (get-recipes folgt dem ready-Handshake).
        const f = r._ensureAssetFoundry();
        await window.__weltDa(() => f && f.ready && f.recipes && f.recipes.eiche);
        if (!f || !f.recipes || !f.recipes.eiche) return { fatal: "kein Rezeptbuch (Worker nicht ready?)" };
        const freshExtras = () => {
            r._forestExtraCache = null; // Buch-Identität bleibt bei Injektionen gleich → Cache explizit leeren
            return r._forestExtraSpecies();
        };
        try {
            // ===== (a) Rezept OHNE place + kind tree → forest =====
            f.recipes.testahorn = {
                kind: "tree",
                panel: "plant",
                s: { api: 0.4, delta: 2.3, slim: 0.5, trop: -0.1, leaf: 0.65 },
                fx: {},
            };
            r._foundryAutoRegisterSpecies(f.recipes);
            const bpA = st.blueprints.baum_testahorn;
            res.a.identitaet =
                !!bpA &&
                bpA._grownSpecies === "baum_testahorn" &&
                r._foundryPresetFor("baum_testahorn") === "testahorn";
            const pa = r._placePolicyFor(f.recipes.testahorn);
            res.a.mode = pa.mode;
            res.a.dispatch = r._placeDispatch(pa, { id: "testahorn" });
            const extrasA = freshExtras();
            res.a.inExtras = extrasA.some((e) => e.species === "baum_testahorn");
            // (a2) die Live-Buch-Arten mit place none (Bäume des Waldbodens): im Buch, aber nie in der Nische.
            res.a.liveNone = Object.keys(f.recipes)
                .filter((id) => {
                    const rec = f.recipes[id];
                    return rec && rec.kind === "tree" && rec.fx && rec.fx.place && rec.fx.place.mode === "none";
                })
                .sort();
            res.a.liveNoneInExtras = res.a.liveNone.filter((id) => extrasA.some((e) => e.species === "baum_" + id));
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
            res.c.katalog = !!(st.blueprints && st.blueprints.baum_testnone);
            const pc = r._placePolicyFor(f.recipes.testnone);
            res.c.mode = pc.mode;
            res.c.dispatch = r._placeDispatch(pc, { id: "testnone" });
            const extrasC = freshExtras();
            res.c.inExtras = extrasC.some((e) => e.species === "baum_testnone");
            res.c.forestStillThere = extrasC.some((e) => e.species === "baum_testahorn");
            // ===== Verhaltens-Tiefe: der Wald-Generator streut testahorn, NIE testnone =====
            {
                let ahorn = false;
                let forbidden = null;
                const seedInt = r._forestSeedInt();
                outer: for (let cx = -20; cx <= 20; cx += 1) {
                    for (let cz = -20; cz <= 20; cz += 1) {
                        const darts = r._forestCellDarts(cx, cz, seedInt) || [];
                        for (const d of darts) {
                            if (d.sp === "baum_testnone") forbidden = d.sp;
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
    check(
        "a: der Bauplan trägt seine Identität (_grownSpecies), die Preset-Regel löst ihn auf",
        out.a.identitaet === true
    );
    check(
        "a2: die Live-Buch-Bäume mit place none stehen im Buch, nie in der Wald-Nische",
        Array.isArray(out.a.liveNone) && out.a.liveNone.length > 0 && out.a.liveNoneInExtras.length === 0,
        `${(out.a.liveNone || []).join(" · ")}${out.a.liveNoneInExtras && out.a.liveNoneInExtras.length ? " — in der Nische: " + out.a.liveNoneInExtras.join(" · ") : ""}`
    );
    check("a: die testahorn-Nische entsteht wie heute", out.a.inExtras === true);
    check("a: der Wald-Generator streut testahorn (Dart geboren)", out.a.planted === true);
    check(
        'b: vehicle ohne place → mode "none"',
        out.b.vid !== null && out.b.mode === "none",
        `${out.b.vid}: ${out.b.mode}`
    );
    check("b: vehicle-Dispatch → kein Worldgen-Kanal (null)", out.b.dispatch === null, String(out.b.dispatch));
    check("b: keine fahrzeug_-Nische in der Wald-Liste", out.b.noVehicleNiche === true);
    check("c: fx.place {mode:none} auf tree → Katalog JA (Auto-Blueprint)", out.c.katalog === true);
    check(
        'c: … → mode "none" + Dispatch null',
        out.c.mode === "none" && out.c.dispatch === null,
        `${out.c.mode}/${out.c.dispatch}`
    );
    check("c: H8-Kern — none-Art NICHT in der Wald-Nische (disjunkt)", out.c.inExtras === false);
    check("c: … während die forest-Art (testahorn) drin bleibt", out.c.forestStillThere === true);
    check(
        "c: kein verbotener Dart (testnone) im Zellen-Scan",
        out.c.forbiddenDart == null,
        String(out.c.forbiddenDart)
    );
    check(
        "e: unbekannte place-Felder reisen unangetastet mit (must-preserve)",
        out.e.mode === "forest" && out.e.preserved === true
    );
    check("e: das Rezept selbst bleibt unberührt (kein Strip am Original)", out.e.origUntouched === true);
    check('e: unbekannter mode fällt geschlossen auf "none"', out.e.unknownMode === "none", String(out.e.unknownMode));
    check(
        "e: malformter place-Block → Ableitung (tree → forest), kein Crash",
        out.e.malformed === "forest",
        String(out.e.malformed)
    );
    check('e: rec null → "none", kein Crash', out.e.nullRec === "none", String(out.e.nullRec));
    if (SELFTEST) {
        check(
            "SELBST-TEST: die Verletzung (Dispatch → immer forest) macht die none-Art sichtbar — die Linse ist nicht vakuös",
            out.st.detected === true
        );
        check("SELBST-TEST: der Dispatch ist restauriert (Prototyp trägt wieder)", out.st.restored === true);
    }

    urteilEnde(errs.length, `\n❌ ROT — ${errs.length} Verletzung(en): die Place-Policy-Weiche (N5/H8) hält nicht.`, "\n✅ GRÜN — N5 PLACE-POLICY: _placePolicyFor (fx.place führt) + _placeDispatch weichen die Buch-Arten korrekt — forest in die Nische, none ohne Worldgen, Fremdes must-ignore. H8: none vs forest DISJUNKT.");
});
