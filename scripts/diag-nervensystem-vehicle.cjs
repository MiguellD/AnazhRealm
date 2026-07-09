// diag-nervensystem-vehicle.cjs — DER ZWEIT-KERN-BEWEIS (Studio-Vertrag Phase 1, W7b).
// Die Schwester zu diag-nervensystem.cjs fuer die ERSTE Nicht-Pflanzen-Domaene: beweist, dass
// ein kind:"vehicle"-Preset im Zweit-Kern (vehicle-core.js, __vehicleCore — v1.1 N7.2) OHNE
// eine Zeile AnazhRealm-Edit durch die EINE Pipeline fliesst:
//   A (statisch, Node): der Worker importiert vehicle-core; der IDB-Stempel hasht ihn (die
//     Drift-Wand); die Bruecke merged Zweit-Kern-Rezepte + exportiert zusatzKindStages; der
//     N7.5-Merge lebt NUR in _foundryIngestRenderConfig (Chokepoint-Gesetz); der Clamp traegt
//     das Fail-Closed-[0]. --selftest injiziert 2 Verletzungen und beweist: die Linse feuert.
//   B (Browser, foundry-ON, Null-Renderer): das LIVE-Buch traegt die Fahrzeug-Presets (der
//     Draht lebt end-to-end durch den echten Worker); kindStages.vehicle == [0] gemerged,
//     die foundry-core-kinds UNANGETASTET (kein Overwrite).
//   C (Merge-Semantik, direkt): ein Probe-Kern, der einen foundry-core-kind ueberschreiben
//     WILL, verliert (first-wins); ein disjunkter kind kommt an. Restore danach.
//   D (Auto-Blueprint): fahrzeug_gt entsteht am EINEN Register-Chokepoint (Donor
//     fahrzeug_wagen, KEIN _grownSpecies), die generische fahrzeug_-Regel loest ihn auf;
//     ein injiziertes Probe-Preset registriert sich idempotent.
//   E (das Asset selbst): _foundryRequest("gt",7,0) liefert echte Meshes mit mat.color,
//     _foundryBuildGroup baut die Gruppe mit color-Attribut-Fill.
//   F (Fail-Closed behavioral): die Distanz-Wahl lod=2 wird fuer kind:vehicle auf Stufe 0
//     geklemmt (kindStages-Merge) UND fuer einen unbekannten kind ohne jeden Eintrag ebenso
//     (N7.5 [0]) — gemessen an den requested-Keys.
//   node scripts/diag-nervensystem-vehicle.cjs [--selftest]
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.NERV_PORT || 4407);
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
// Kommentare strippen (die V18.267-Falle: erklaerende Kommentare zitieren die Muster woertlich).
function stripComments(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}
// Der Methoden-Body per Klammer-Zaehlung (das diag-pipeline-constitution-Muster).
function fnBody(src, sigRe) {
    const m = sigRe.exec(src);
    if (!m) return null;
    let i = src.indexOf("{", m.index);
    if (i < 0) return null;
    let depth = 0;
    const start = i;
    for (; i < src.length; i++) {
        if (src[i] === "{") depth++;
        else if (src[i] === "}") {
            depth--;
            if (depth === 0) return src.slice(start, i + 1);
        }
    }
    return null;
}
function countOcc(src, needle) {
    let n = 0,
        i = 0;
    for (;;) {
        i = src.indexOf(needle, i);
        if (i < 0) return n;
        n++;
        i += needle.length;
    }
}

// ===== TEIL A: die statischen Gesetze =====
function staticLaws(anazhSrc, phytoSrc, vcSrc) {
    const anazhNC = stripComments(anazhSrc);
    const phytoNC = stripComments(phytoSrc);
    const out = [];
    out.push([
        "A1: der Foundry-Worker importiert vehicle-core.js (rel-Liste)",
        /"vehicle-core\.js",/.test(anazhSrc) && /"foundry-core\.js",/.test(anazhSrc),
    ]);
    out.push([
        "A2: der IDB-Stempel hasht vehicle-core (die Drift-Wand)",
        /fetch\("vehicle-core\.js\?v=" \+ V\)/.test(anazhNC),
    ]);
    // A3 — Chokepoint-Gesetz: der N7.5-Merge (zusatzKindStages-Leser) lebt NUR in
    // _foundryIngestRenderConfig; ein zweiter Ingest-Pfad wird rot.
    const ingest = fnBody(anazhNC, /_foundryIngestRenderConfig\(config\)\s*/);
    const totalZk = countOcc(anazhNC, "zusatzKindStages");
    const inIngest = ingest ? countOcc(ingest, "zusatzKindStages") : 0;
    out.push([
        "A3: der N7.5-Merge lebt NUR in _foundryIngestRenderConfig (kein zweiter Ingest-Pfad)",
        ingest !== null && inIngest >= 1 && totalZk === inIngest,
        `gesamt=${totalZk} im Chokepoint=${inIngest}`,
    ]);
    out.push([
        "A4: der kindStages-Clamp traegt das Fail-Closed-[0] (bekanntes Rezept ohne Eintrag)",
        /_stages = Number\.isFinite\(_kl\) \? \[_kl\] : _rec \? \[0\] : null;/.test(anazhNC),
    ]);
    out.push([
        "A5: die Bruecke merged Zweit-Kern-Rezepte (first-wins, __vehicleCore.PRESETS)",
        /self\.__vehicleCore/.test(phytoNC) && /VC\.PRESETS/.test(phytoNC),
    ]);
    out.push([
        "A6: die Bruecke exportiert zusatzKindStages (je Kern ein Block)",
        /zusatzKindStages = \{ "vehicle-core":/.test(phytoNC),
    ]);
    out.push([
        "A7: build-asset dispatcht Zweit-Kern-Presets an __vehicleCore.buildInstance",
        /VC\.buildInstance\(msg\.presetId/.test(phytoNC),
    ]);
    out.push([
        "A8: vehicle-core deklariert kindStages.vehicle == [0] (B2-Vertrags-Daten)",
        /kindStages:\s*\{\s*vehicle:\s*\[0\]\s*\}/.test(vcSrc),
    ]);
    // A9 (N1-migriert, V9.56-i): der kind:vehicle-ZWEIG ist der KIND_POLICY-Zeile gewichen —
    // die Probe prueft jetzt die Tabellen-Realitaet: die vehicle-Policy-Zeile traegt Praefix+Donor,
    // und der Auto-Register-Chokepoint laeuft die Tabelle OHNE kind-String-Vergleich (M8).
    const autoReg = fnBody(anazhNC, /_foundryAutoRegisterSpecies\(book\)\s*/);
    out.push([
        "A9: KIND_POLICY traegt die vehicle-Zeile (prefix fahrzeug_, donor fahrzeug_wagen)",
        /vehicle:\s*Object\.freeze\(\{\s*prefix:\s*"fahrzeug_",\s*donor:\s*"fahrzeug_wagen"/.test(anazhNC),
    ]);
    out.push([
        "A10: der Auto-Register-Chokepoint laeuft die Policy-Tabelle (kein kind-if, M8)",
        autoReg !== null && /KIND_POLICY/.test(autoReg) && !/kind\s*[!=]==?\s*"/.test(autoReg),
    ]);
    return out;
}

(async () => {
    const anazhSrc = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    const phytoSrc = fs.readFileSync(path.join(root, "worlds/terrain/phytogenesis.js"), "utf8");
    const vcSrc = fs.readFileSync(path.join(root, "vehicle-core.js"), "utf8");

    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST: die Linse feuert auf injizierte Verletzungen ===");
        // V1: das Fail-Closed-[0] entfernt -> A4 muss rot werden.
        const broken1 = anazhSrc.replace(
            "_stages = Number.isFinite(_kl) ? [_kl] : _rec ? [0] : null;",
            "_stages = Number.isFinite(_kl) ? [_kl] : null;"
        );
        const a4 = staticLaws(broken1, phytoSrc, vcSrc).find((l) => l[0].startsWith("A4"));
        check("Selbst-Test 1: Fail-Closed entfernt -> A4 feuert", a4 && a4[1] === false);
        // V2: ein ZWEITER Ingest-Pfad (zusatzKindStages-Leser ausserhalb des Chokepoints) -> A3 rot.
        const broken2 = anazhSrc.replace(
            "_foundryIdbInit(f) {",
            "_foundryIdbInit(f) {\n        const _leak = this.state && this.state.zusatzKindStages;\n        void _leak;"
        );
        const a3 = staticLaws(broken2, phytoSrc, vcSrc).find((l) => l[0].startsWith("A3"));
        check("Selbst-Test 2: zweiter Ingest-Pfad injiziert -> A3 feuert", a3 && a3[1] === false);
        if (errs.length) {
            console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuoes.");
            process.exit(1);
        }
        console.log("\n✅ SELBST-TEST GRUEN — die Linse feuert auf beide Verletzungs-Klassen.");
        process.exit(0);
    }

    console.log("=== ZWEIT-KERN — TEIL A: die statischen Gesetze (Node) ===");
    for (const [name, ok, detail] of staticLaws(anazhSrc, phytoSrc, vcSrc)) check(name, ok, detail);

    console.log("\n=== TEIL B-F: der lebende Draht (Browser, foundry-ON) ===");
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
        const res = { b: {}, c: {}, d: {}, e: {}, f: {} };
        const dl0 = performance.now() + 60000;
        while (
            (!window.anazhRealm || typeof window.anazhRealm._ensureAssetFoundry !== "function") &&
            performance.now() < dl0
        )
            await new Promise((r) => setTimeout(r, 100));
        const r = window.anazhRealm;
        const A = r.constructor;
        const f = r._ensureAssetFoundry();
        // Worker + Buch + Config abwarten (recipes/render-config folgen dem ready-Handshake).
        const dl = performance.now() + 50000;
        while (performance.now() < dl) {
            const rc = A._studioRenderConfig;
            if (f && f.ready && f.recipes && f.recipes.gt && rc && rc.lod && rc.lod.kindStages) break;
            await new Promise((res2) => setTimeout(res2, 80));
        }
        const rc = A._studioRenderConfig;
        const ks = rc && rc.lod ? rc.lod.kindStages : null;
        // ===== B: das Buch + der Merge KOMMEN AN =====
        res.b.gtKind = f && f.recipes && f.recipes.gt ? f.recipes.gt.kind : null;
        res.b.gtRadstand = f && f.recipes && f.recipes.gt && f.recipes.gt.s ? f.recipes.gt.s.radstand : null;
        res.b.vehicleCount =
            f && f.recipes
                ? Object.keys(f.recipes).filter((k) => f.recipes[k] && f.recipes[k].kind === "vehicle").length
                : 0;
        res.b.ksVehicle = ks ? JSON.stringify(ks.vehicle) : null;
        res.b.ksTree = ks ? JSON.stringify(ks.tree) : null;
        res.b.ksGrass = ks ? JSON.stringify(ks.grass) : null;
        // ===== C: die MERGE-SEMANTIK direkt (first-wins + disjunkt), mit Restore =====
        try {
            const orig = A._studioRenderConfig;
            const origState = r.state.studioRenderConfig;
            r._foundryIngestRenderConfig({
                lod: {
                    kindStages: { tree: [7, 8] },
                    zusatzKindStages: { "probe-core": { tree: [9], tor: [1] } },
                },
            });
            const pks = A._studioRenderConfig.lod.kindStages;
            res.c.treeKept = JSON.stringify(pks.tree); // erwartet [7,8] — der Erst-Kern fuehrt
            res.c.torMerged = JSON.stringify(pks.tor); // erwartet [1] — disjunkt kommt an
            A._studioRenderConfig = orig;
            r.state.studioRenderConfig = origState;
        } catch (e) {
            res.c.err = (e && e.message) || String(e);
        }
        // ===== D: der AUTO-BLUEPRINT =====
        try {
            const bp = r.state.blueprints && r.state.blueprints.fahrzeug_gt;
            res.d.blueprint = !!bp;
            res.d.autoSpecies = bp ? bp._foundryAutoSpecies : null;
            res.d.grownSpecies = bp ? bp._grownSpecies || null : "kein-bp";
            res.d.parts = bp && Array.isArray(bp.parts) ? bp.parts.length : 0;
            res.d.donorIntact = !!(r.state.blueprints.fahrzeug_wagen && r.state.blueprints.fahrzeug_wagen.builtIn);
            res.d.presetResolves = r._foundryPresetFor("fahrzeug_gt");
            res.d.entryResolves = r._foundryPresetForEntry({ type: "fahrzeug_gt" });
            // Idempotenz + Probe-Preset (Injektion == der Schoepfer legt ein Preset im Kern an):
            if (f && f.recipes) {
                f.recipes.probemobil = { kind: "vehicle", lab: "Probemobil", s: {}, fx: {} };
                const n1 = r._foundryAutoRegisterSpecies(f.recipes);
                const n2 = r._foundryAutoRegisterSpecies(f.recipes);
                res.d.probeRegistered = !!(r.state.blueprints && r.state.blueprints.fahrzeug_probemobil);
                res.d.probeLabel =
                    r.state.blueprints && r.state.blueprints.fahrzeug_probemobil
                        ? r.state.blueprints.fahrzeug_probemobil.label
                        : null;
                res.d.idempotent = n1 >= 1 && n2 === 0;
                // Aufraeumen (Gate-Hook-Lehre: sichern + wiederherstellen, nie Muell hinterlassen):
                delete f.recipes.probemobil;
                delete r.state.blueprints.fahrzeug_probemobil;
            }
        } catch (e) {
            res.d.err = (e && e.message) || String(e);
        }
        // ===== E: das ASSET selbst (Worker-Dispatch + mat.color + BuildGroup) =====
        try {
            const meshes = await Promise.race([
                r._foundryRequest("gt", 7, 0, "summer"),
                new Promise((res3) => setTimeout(() => res3(null), 30000)),
            ]);
            res.e.meshCount = Array.isArray(meshes) ? meshes.length : -1;
            res.e.hasMatColor =
                Array.isArray(meshes) &&
                meshes.some((m) => m && m.mat && Array.isArray(m.mat.color) && m.mat.color.length === 3);
            if (Array.isArray(meshes) && meshes.length) {
                const g = r._foundryBuildGroup(meshes);
                res.e.groupChildren = g && g.children ? g.children.length : 0;
                res.e.allHaveColor =
                    !!g &&
                    g.children.every((ch) => !!(ch.geometry && ch.geometry.attributes && ch.geometry.attributes.color));
                // Aufraeumen (kein Leak in der Probe):
                if (g)
                    g.traverse((o) => {
                        if (o.isMesh && o.geometry) o.geometry.dispose();
                    });
            }
        } catch (e) {
            res.e.err = (e && e.message) || String(e);
        }
        // ===== F: FAIL-CLOSED behavioral — die Distanz-Wahl 2 klemmt auf Stufe 0 =====
        try {
            if (!f.requested) f.requested = new Set();
            const before = new Set(f.requested);
            r._foundryFlattenFor({ seed: 7 }, "gt", 2);
            // Unbekannter kind OHNE jeden kindStages-/Kind-Karten-Eintrag (N7.5-[0]):
            f.recipes.probetor = { kind: "tor", s: {}, fx: {} };
            r._foundryFlattenFor({ seed: 1 }, "probetor", 2);
            const fresh = Array.from(f.requested).filter((k) => !before.has(k));
            res.f.gtKey = fresh.find((k) => k.startsWith("gt|")) || null;
            res.f.torKey = fresh.find((k) => k.startsWith("probetor|")) || null;
            // Aufraeumen: Probe-Rezept + Probe-Requests entfernen (kein Muell im lebenden f).
            delete f.recipes.probetor;
            for (const k of fresh) if (k.startsWith("probetor|")) f.requested.delete(k);
        } catch (e) {
            res.f.err = (e && e.message) || String(e);
        }
        return res;
    });

    await browser.close();
    server.close();

    check(
        "B: das LIVE-Buch traegt gt als kind:vehicle (Worker-Draht lebt)",
        out.b.gtKind === "vehicle",
        String(out.b.gtKind)
    );
    check("B: die Regler-Daten fliessen (gt.s.radstand == 2.9)", out.b.gtRadstand === 2.9, String(out.b.gtRadstand));
    check("B: alle 5 Fahrzeug-Gattungen im Buch", out.b.vehicleCount === 5, String(out.b.vehicleCount));
    check("B: kindStages.vehicle == [0] (N7.5-Merge am Ingest)", out.b.ksVehicle === "[0]", String(out.b.ksVehicle));
    check("B: foundry-core-kinds UNANGETASTET (tree [0,1,2])", out.b.ksTree === "[0,1,2]", String(out.b.ksTree));
    check("B: foundry-core-kinds UNANGETASTET (grass [1,2])", out.b.ksGrass === "[1,2]", String(out.b.ksGrass));
    check(
        "C: first-wins — ein Zweit-Kern ueberschreibt NIE (tree bleibt [7,8])",
        out.c.treeKept === "[7,8]",
        out.c.err || String(out.c.treeKept)
    );
    check("C: disjunkter kind kommt an (tor == [1])", out.c.torMerged === "[1]", String(out.c.torMerged));
    check(
        "D: Auto-Blueprint fahrzeug_gt registriert (Donor-Klon)",
        out.d.blueprint === true && out.d.parts >= 4,
        out.d.err || `parts=${out.d.parts}`
    );
    check("D: die Herkunfts-Marke sitzt (_foundryAutoSpecies == gt)", out.d.autoSpecies === "gt");
    check(
        "D: KEIN _grownSpecies (ein Fahrzeug ist keine gewachsene Art)",
        out.d.grownSpecies === null,
        String(out.d.grownSpecies)
    );
    check("D: der Donor fahrzeug_wagen bleibt Built-in (unberuehrt)", out.d.donorIntact === true);
    check(
        "D: die generische fahrzeug_-Regel loest auf (fahrzeug_gt -> gt)",
        out.d.presetResolves === "gt",
        String(out.d.presetResolves)
    );
    check(
        "D: der Entry-Pfad loest auf (_foundryPresetForEntry)",
        out.d.entryResolves === "gt",
        String(out.d.entryResolves)
    );
    check("D: Probe-Preset registriert + idempotent", out.d.probeRegistered === true && out.d.idempotent === true);
    check("D: das Label reist aus dem Rezept (lab)", out.d.probeLabel === "Probemobil", String(out.d.probeLabel));
    check(
        "E: der Worker liefert das Fahrzeug-Asset (Meshes > 0)",
        out.e.meshCount > 0,
        out.e.err || `meshes=${out.e.meshCount}`
    );
    check("E: die Material-Farbe reist mit (mat.color)", out.e.hasMatColor === true);
    check("E: _foundryBuildGroup baut die Gruppe (Kinder > 0)", out.e.groupChildren > 0, String(out.e.groupChildren));
    check("E: jedes Kind traegt das color-Attribut (WebGPU-STRIKT-Fill)", out.e.allHaveColor === true);
    check(
        "F: die Distanz-Wahl 2 klemmt fuer kind:vehicle auf Stufe 0",
        /\|0\|/.test(out.f.gtKey || ""),
        out.f.err || String(out.f.gtKey)
    );
    check(
        "F: unbekannter kind OHNE Eintrag klemmt fail-closed auf [0]",
        /\|0\|/.test(out.f.torKey || ""),
        String(out.f.torKey)
    );
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);

    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — DER ZWEIT-KERN DOCKT AN: vehicle-core reist durch den EINEN Foundry-Worker (Rezepte + kindStages + Asset), der N7.5-Merge lebt am EINEN Ingest-Chokepoint (first-wins, disjunkt, fail-closed [0]), der Auto-Blueprint fahrzeug_<id> entsteht ohne eine Zeile AnazhRealm-Edit — EINE Pipeline fuer alle Domaenen (Vertrag Phase 1)."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Zweit-Kern-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
