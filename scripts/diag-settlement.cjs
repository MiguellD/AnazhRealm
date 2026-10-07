// diag-settlement.cjs — DER SETTLEMENT-KANAL N5.7 (Katalysator-Bogen W-A5b).
// Zwei Teile:
//   TEIL N (Node, direkt): fachwerk-core exportSettlement(dp) ist DETERMINISTISCH
//     (derselbe dp ⇒ byte-derselbe Export; anderer Seed ⇒ anderer Export), die
//     Slots sind sauber (bekannte Kulturen, endliche Anker, keine ±9999-Parkplätze),
//     und der Export ist EINGEFROREN (sha256-Golden je dp-Fixture in
//     spec/asset-contract/v6/golden/siedlung.json — Taille-Disziplin: gemintet NUR
//     wenn die Datei fehlt; ein Kern-Edit, der das Layout verschiebt, wird rot).
//   TEIL B (Browser, foundry-ON, Null-Renderer): der Kanal lebt END-TO-END —
//     _foundryRequestSettlement holt den Export durch den EINEN Worker (die Brücke
//     dispatcht generisch über die Zweit-Kern-Schleife, M8), _spawnSettlementFromExport
//     platziert N haus_<kultur>-Einträge POSITIONS-DETERMINISTISCH am Anker (zweiter
//     Anker ⇒ identische Offsets), die Wasser-Wand + die fail-closed-Slot-Regel greifen
//     (unbekannte Kultur wird übersprungen), und der Chat-Konsument "dorf" existiert.
//   TEIL C (Nachlese-Welle — WORLDGEN-AUTO-DÖRFER, derselbe Browser): der
//     "settlement"-Dispatch-Kanal hat seinen Worldgen-Konsumenten — Zell-Wahrheit
//     deterministisch (2 Läufe byte-gleich, zell-sensitiv, Γ5 ":dorf"-Stream), die
//     Site-Wände greifen (Spawn-Klar-Wand am Ursprung), die erzwungene Dorf-Zelle
//     (Hook __anazhAutoSettlement, gesichert+wiederhergestellt) materialisiert
//     BUDGETIERT über Ticks (perTick, _frameOverBudget pausiert), IDEMPOTENT
//     (worldMeta.settlementCells markiert; zweiter Durchlauf spawnt 0 neue) und
//     durch DIE EINE Slot-Quelle _spawnSettlementSlot; headless-default RUHT der
//     Auto-Zug (Null-Renderer ohne Hook → kein Pending, kein Dorf).
//   --selftest: ein in-memory korrumpiertes Golden MUSS rot erkannt werden + ein
//     Slot mit unbekannter Kultur MUSS fallen + die Auto-Dorf-Struktur-Gesetze
//     MÜSSEN auf injizierte Verletzungen feuern (die Linse ist nicht vakuös).
//   node scripts/diag-settlement.cjs [--selftest]
// Re-Mint 30.09.2026 (V18.492, begründet): der Export trägt je Slot additiv `chimney`
//   (die Schornstein-Position, die der Rauch des fachwerk-Gesetzes liest); das Layout
//   (Kulturen · Anker · Drehung · ov) blieb gegen das alte Golden feld-für-feld gleich.
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const goldenDir = path.join(root, "spec/asset-contract/v6/golden");
const goldenFile = path.join(goldenDir, "siedlung.json");

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");

// Nachlese-Welle — die STATISCHEN Auto-Dorf-Gesetze (kommentar-gestrippt, die
// V18.267-Falle): Reservierung + Γ5-Stream + die EINE Slot-Quelle + Headless-Ruhe.
function stripComments(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}
function autoStaticLaws(anazhSrc) {
    const nc = stripComments(anazhSrc);
    return [
        [
            // DORF-ERLEBNIS (17.07.) — das Band wandert MIT dem Gesetz: die
            // Reservierung trägt jetzt das Rebuild-Gedächtnis {seed,nH,x,z}
            // (Wege-Streifen über Reload) statt der nackten 1 — truthy bleibt.
            "C-S1: _autoSettlementSpawnCell RESERVIERT (settlementCells[key] = {seed,nH,x,z} — das Spawn-einmal- + Rebuild-Gedächtnis)",
            /settlementCells\[key\] = \{ seed:/.test(nc),
        ],
        [
            'C-S2: die Zell-Wahrheit zieht aus dem ":dorf"-Stream (Γ5, kein Math.random im Auto-Pfad)',
            /:dorf:/.test(nc) &&
                (() => {
                    const i = nc.indexOf("_autoSettlementCellInfo(cx, cz) {");
                    const j = i >= 0 ? nc.indexOf("_tickAutoSettlement(", i) : -1;
                    return i >= 0 && j > i && !/Math\.random/.test(nc.slice(i, j));
                })(),
        ],
        [
            "C-S3: der Tick platziert durch DIE EINE Slot-Quelle (_spawnSettlementSlot — kein Parallel-Platzierer)",
            /_tickAutoSettlement\(playerPos\) \{[\s\S]{0,4000}_spawnSettlementSlot\(/.test(nc),
        ],
        [
            "C-S4: der Auto-Zug ruht headless (Null-Renderer-Wand + __anazhAutoSettlement-Hook)",
            /_isHeadlessNull\) return;/.test(nc) && /__anazhAutoSettlement/.test(nc),
        ],
        [
            // HAUS-DOPPELBAU-SCHNITT (P0-Inventur 18.07.): das Slot-Rezept (ov)
            // reist als Guss-Stempel in den Spawn — die Optik baut aus DERSELBEN
            // hp-Wahrheit wie Blocker/ext. Ohne diese Zeile ist das Dorf ein
            // Kultur-Default-Klonfeld (der Riss).
            "C-S5: _spawnSettlementSlot reicht slot.ov als studioOv (Optik == Plan, kein Kultur-Default-Klon)",
            /studioOv: slot\.ov/.test(nc),
        ],
        [
            // SCHICHT-VOLLENDUNG (18.07.): die Hof-Bäume + Marktstände des
            // Exports heben durch den EINEN Chokepoint (Orchestrierung, kein
            // Parallel-System), Zäune durch den Zaun-Pool, Wege + Äcker durch die Wege-Karte (V18.530: Boden).
            "C-S6: der Erlebnis-Hebel konsumiert trees/staende (spawnArchitecture) + fences (Zaun-Pool) / felder (Wege-Karte)",
            (() => {
                const i = nc.indexOf("_spawnSettlementErlebnis(plan, origin, so) {");
                const j = i >= 0 ? nc.indexOf("_spawnSettlementFromExport(", i) : -1;
                const erlebnis = i >= 0 && j > i ? nc.slice(i, j) : "";
                return (
                    /plan\.trees/.test(erlebnis) &&
                    /baum_/.test(erlebnis) &&
                    /plan\.staende/.test(erlebnis) &&
                    /marktstand_dorf/.test(erlebnis) &&
                    /plan\.fences/.test(nc) &&
                    /plan\.felder/.test(nc)
                );
            })(),
        ],
    ];
}

// Kanonischer Fingerabdruck eines Exports: das volle JSON (Slots + benannte Schichten).
function fingerprint(plan) {
    return sha(JSON.stringify(plan));
}

// Die dp-Fixtures der Goldens (klein = schnell; ein Dorf + ein Weiler).
const FIXTURES = [
    { seed: 7, nH: 12 },
    { seed: 12345, nH: 6 },
];

(async () => {
    global.THREE = require(path.join(root, "worlds/terrain/lib/three-r128.min.js"));
    require(path.join(root, "fachwerk-core.js"));
    const FC = globalThis.__fachwerkCore;

    // ===== SELBST-TEST =====
    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST: die Settlement-Linse feuert ===");
        const a = FC.exportSettlement(FIXTURES[0]);
        // V1: ein korrumpiertes Golden wird erkannt (die Byte-Wand ist nicht vakuös).
        const fakeGolden = { [JSON.stringify(FIXTURES[0])]: "deadbeef" };
        check(
            "Selbst-Test 1: korruptes Golden wird erkannt",
            fingerprint(a) !== fakeGolden[JSON.stringify(FIXTURES[0])]
        );
        // V2: ein manipulierter Export (ein Slot verschoben) kippt den Fingerabdruck.
        const b = JSON.parse(JSON.stringify(a));
        b.slots[0].x += 0.001;
        check("Selbst-Test 2: ein 1-mm-Slot-Versatz kippt den Fingerabdruck", fingerprint(a) !== fingerprint(b));
        // V3 (Nachlese-Welle): die Auto-Dorf-Struktur-Gesetze feuern auf Injektion.
        const anazhSrcST = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
        const okAll = autoStaticLaws(anazhSrcST).every((l) => l[1] === true);
        check("Selbst-Test 3: die Auto-Dorf-Gesetze sind am HEAD gruen (Vorbedingung)", okAll);
        const broken1 = anazhSrcST.replace("settlementCells[key] = { seed:", "settlementCells[key] = kaputt({ seed:");
        const cs1 = autoStaticLaws(broken1).find((l) => l[0].startsWith("C-S1"));
        check("Selbst-Test 4: Reservierung entfernt -> C-S1 feuert", cs1 && cs1[1] === false);
        const broken2 = anazhSrcST.replace(
            /_spawnSettlementSlot\(q\.plan\.slots/g,
            "_meinParallelPlatzierer(q.plan.slots"
        );
        const cs3 = autoStaticLaws(broken2).find((l) => l[0].startsWith("C-S3"));
        check("Selbst-Test 5: Parallel-Platzierer injiziert -> C-S3 feuert", cs3 && cs3[1] === false);
        // V4 (HAUS-DOPPELBAU): der ov-Stempel entfernt -> C-S5 feuert (der
        // Doppelbau-Riss kann nicht still wiederkehren).
        const broken3 = anazhSrcST.replace(/studioOv: slot\.ov/g, "/* ov verworfen */");
        const cs5 = autoStaticLaws(broken3).find((l) => l[0].startsWith("C-S5"));
        check("Selbst-Test 6: ov-Stempel entfernt -> C-S5 feuert", cs5 && cs5[1] === false);
        // V5 (SCHICHT-VOLLENDUNG): der Baum-Konsum entfernt -> C-S6 feuert.
        const broken4 = anazhSrcST.replace(/plan\.trees/g, "planXtrees");
        const cs6 = autoStaticLaws(broken4).find((l) => l[0].startsWith("C-S6"));
        check("Selbst-Test 7: plan.trees-Konsum entfernt -> C-S6 feuert", cs6 && cs6[1] === false);
        if (errs.length) {
            console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuös.");
            process.exit(1);
        }
        console.log("\n✅ SELBST-TEST GRÜN.");
        process.exit(0);
    }

    console.log("=== N5.7 SETTLEMENT — TEIL N: exportSettlement (Node, deterministisch + eingefroren) ===");
    check("exportSettlement existiert im Kern (das exportDrive-Muster)", typeof FC.exportSettlement === "function");
    const plans = {};
    for (const dp of FIXTURES) {
        const key = JSON.stringify(dp);
        const p1 = FC.exportSettlement(dp);
        const p2 = FC.exportSettlement(dp);
        plans[key] = p1;
        check(`deterministisch fuer ${key} (zwei Läufe byte-gleich)`, fingerprint(p1) === fingerprint(p2));
        check(
            `Slots sauber fuer ${key} (>=4, bekannte Kulturen, endliche Anker, |x/z| < 5000)`,
            Array.isArray(p1.slots) &&
                p1.slots.length >= 4 &&
                p1.slots.every(
                    (s) =>
                        typeof s.kultur === "string" &&
                        !!FC.KULTUR[s.kultur] &&
                        isFinite(s.x) &&
                        isFinite(s.z) &&
                        isFinite(s.phi) &&
                        Math.abs(s.x) < 5000 &&
                        Math.abs(s.z) < 5000 &&
                        s.ov &&
                        typeof s.ov === "object"
                ),
            `slots=${p1.slots && p1.slots.length}`
        );
        check(
            `benannte Schichten reisen fuer ${key} (roads/brunnen/spawn/welt — v1 unkonsumiert erlaubt)`,
            Array.isArray(p1.roads) && Array.isArray(p1.brunnen) && !!p1.spawn && !!p1.welt,
            `roads=${p1.roads && p1.roads.length}`
        );
    }
    check(
        "seed-sensitiv (Seed 7 != Seed 12345)",
        fingerprint(plans[JSON.stringify(FIXTURES[0])]) !== fingerprint(plans[JSON.stringify(FIXTURES[1])])
    );

    // Golden: EINGEFROREN — gemintet NUR wenn die Datei fehlt (Taille-Disziplin).
    if (!fs.existsSync(goldenFile)) {
        fs.mkdirSync(goldenDir, { recursive: true });
        const golden = {};
        for (const dp of FIXTURES) {
            const key = JSON.stringify(dp);
            golden[key] = {
                sha256: fingerprint(plans[key]),
                slots: plans[key].slots.length,
                name: plans[key].name,
                groesse: plans[key].groesse,
            };
        }
        fs.writeFileSync(goldenFile, JSON.stringify(golden, null, 4) + "\n");
        console.log(`  🧊 Golden GEMINTET (${goldenFile}) — ab jetzt EINGEFROREN.`);
    }
    const golden = JSON.parse(fs.readFileSync(goldenFile, "utf8"));
    for (const dp of FIXTURES) {
        const key = JSON.stringify(dp);
        check(
            `GOLDEN byte-treu fuer ${key} (${golden[key] && golden[key].slots} Slots · „${golden[key] && golden[key].name}")`,
            !!golden[key] && golden[key].sha256 === fingerprint(plans[key]),
            golden[key] ? fingerprint(plans[key]).slice(0, 12) : "Golden fehlt"
        );
    }

    // ===== U6c: SNAP-/BRANDWAND-PROBE — die EINE Wahrheit, zwei Leser =====
    // Die Gesetze wohnen im Kern (__fachwerkCore.reihenSnap/brandwand, verbatim aus
    // buildDorf gewandert); das Lab ruft DIESELBEN Funktionen. Probe 1 (synthetisch):
    // zwei dichte parallele Nachbarn docken auf die Norm-Fuge und markieren die
    // anliegende Seite als Brandwand. Probe 2 (end-to-end): ein städtischer Export
    // trägt ov.brandwand — der Kern-Layout-Pfad KONSUMIERT das Gesetz.
    console.log("\n=== U6c: REIHEN-SNAP + BRANDWAND (Kern-Gesetz, beidseitiger Konsum) ===");
    {
        const gap = 0.06; // Metropol-Norm — dicht (<=0.6), der Snap-Pfad ist scharf
        const Bs = [
            { dims: { W: 8, D: 7 }, kern: false, p: {} },
            { dims: { W: 8, D: 7 }, kern: false, p: {} },
        ];
        const pl = [
            { phi: 0, x: 0, z: 0, obb: { cx: 0, cz: 0, phi: 0, ex: 4, ez: 3.5 } },
            { phi: 0, x: 9, z: 0, obb: { cx: 9, cz: 0, phi: 0, ex: 4, ez: 3.5 } },
        ];
        const snaps = FC.reihenSnap(Bs, pl, gap);
        const fuge = Math.abs(pl[1].obb.cx - pl[0].obb.cx) - 8; // (Wi+Wj)/2 = 8
        check("Snap-Probe: zwei dichte Nachbarn docken an (1 Paar)", snaps === 1, `snaps=${snaps}`);
        check("Snap-Probe: die Fuge ist die Norm-Fuge", Math.abs(fuge - gap) < 1e-9, `fuge=${fuge.toFixed(4)}`);
        check(
            "Snap-Probe: x und obb.cx rücken kohärent (Solids/OBB fließen konsistent)",
            pl[0].x === pl[0].obb.cx && pl[1].x === pl[1].obb.cx
        );
        Bs.forEach((B, i) => (B.q = pl[i]));
        const bwN = FC.brandwand(Bs, gap);
        check(
            "Brandwand-Probe: die anliegenden Seiten sind markiert (x1 am linken, x0 am rechten Haus)",
            bwN === 2 && Bs[0].p.brandwand && Bs[0].p.brandwand.x1 === 1 && Bs[1].p.brandwand && Bs[1].p.brandwand.x0 === 1,
            `bwN=${bwN}`
        );
        const weit = FC.reihenSnap(
            [
                { dims: { W: 8, D: 7 }, kern: false, p: {} },
                { dims: { W: 8, D: 7 }, kern: false, p: {} },
            ],
            [
                { phi: 0, x: 0, z: 0, obb: { cx: 0, cz: 0, phi: 0, ex: 4, ez: 3.5 } },
                { phi: 0, x: 30, z: 0, obb: { cx: 30, cz: 0, phi: 0, ex: 4, ez: 3.5 } },
            ],
            gap
        );
        check("Snap-Probe: ferne Nachbarn (Fuge>1.8m) bleiben stehen", weit === 0, `snaps=${weit}`);
        const stadt = FC.exportSettlement({ seed: 7, nH: 20 });
        const bwSlots = stadt.slots.filter((s) => s.ov && s.ov.brandwand).length;
        check(
            "Konsum-Probe: der städtische Export trägt ov.brandwand (der Kern-Pfad ruft DIESELBE Wahrheit wie buildDorf)",
            stadt.staedtisch === true && bwSlots >= 1,
            `groesse=${stadt.groesse} · brandwand-Slots=${bwSlots}`
        );
        // SCHICHT-VOLLENDUNG (18.07.): der Export trägt NUR gelebte Schichten —
        // trees/fences/felder/staende reisen (Hof-Bäume + Zäune + Äcker +
        // Marktstände haben Konsumenten); fluss/bruecken/graph (keine Welt-
        // Wahrheit) und mauer/laternen sind GESTRICHEN (kein toter Passagier,
        // Vertrags-Akt). Grund: die Stadt-Genese mit Mauer/Fluss/Brücken in der
        // Welt ist neues Verhalten hinter dem Feature-Stopp bis v1.0
        // (docs/roadmap.md §0.v1, Leben-Synthese §5.3) — offen, benannt.
        check(
            "SCHICHT-VOLLENDUNG: Export trägt trees/fences/felder/staende, aber fluss/bruecken/graph/mauer/laternen sind gestrichen",
            Array.isArray(stadt.trees) &&
                Array.isArray(stadt.fences) &&
                Array.isArray(stadt.felder) &&
                Array.isArray(stadt.staende) &&
                stadt.mauer === undefined &&
                stadt.laternen === undefined &&
                stadt.fluss === undefined &&
                stadt.bruecken === undefined &&
                stadt.graph === undefined,
            `trees=${Array.isArray(stadt.trees) ? stadt.trees.length : "fehlt"} fences=${Array.isArray(stadt.fences) ? stadt.fences.length : "fehlt"}`
        );
    }

    // ===== TEIL B: der lebende Kanal (Browser, foundry-ON) =====
    console.log("\n=== TEIL B: der lebende Kanal (Browser, foundry-ON, Null-Renderer) ===");
    const puppeteer = require("puppeteer");
    const http = require("http");
    const PORT = Number(process.env.SETTLEMENT_PORT || 4436);
    const mime = {
        ".html": "text/html",
        ".js": "application/javascript",
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
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 240000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhForceFoundry = true;
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const out = await page.evaluate(async () => {
        const res = {};
        const dl0 = performance.now() + 60000;
        while (
            (!window.anazhRealm || typeof window.anazhRealm._ensureAssetFoundry !== "function") &&
            performance.now() < dl0
        )
            await new Promise((r) => setTimeout(r, 100));
        const r = window.anazhRealm;
        const f = r._ensureAssetFoundry();
        const dl = performance.now() + 50000;
        while (performance.now() < dl) {
            if (f && f.ready && f.recipes && f.recipes.alemannisch) break;
            await new Promise((res2) => setTimeout(res2, 80));
        }
        res.bookReady = !!(f && f.ready && f.recipes && f.recipes.alemannisch);
        // 1) Der Export durch den EINEN Worker (Timeout-bewacht — massBau × Häuser braucht Sekunden).
        const plan = await Promise.race([
            r._foundryRequestSettlement({ seed: 7, nH: 8 }),
            new Promise((res3) => setTimeout(() => res3("timeout"), 90000)),
        ]);
        res.planOk = !!(plan && plan !== "timeout" && Array.isArray(plan.slots) && plan.slots.length >= 4);
        res.planName = plan && plan.name;
        res.planSlots = plan && plan.slots ? plan.slots.length : plan === "timeout" ? "timeout" : -1;
        if (!res.planOk) return res;
        // 2) Der Konsument: POSITIONS-DETERMINISTISCH am SELBEN Anker (die Wasser-Wand ist
        //    Terrain-Wahrheit je Ort — verschiedene Anker duerfen verschieden viele Slots
        //    tragen; die Determinismus-Aussage ist: derselbe Export + derselbe Anker ⇒
        //    byte-dieselben Eintraege [type/x/z/rot/seed]).
        const before = r.state.architectures.length;
        const o1 = { x: 400, z: 400 };
        // Der zweite Akt steht auf dem geräumten Ort: die Bau-Wand (_bauFrei) setzt kein Haus in ein Haus — neben dem ersten
        // Dorf entstünde am selben Anker keines (Integration Welle L, gate:haus-welt W7). Die folgenden Proben lesen die
        // lebenden Einträge des zweiten Akts.
        const r1 = r._spawnSettlementFromExport(plan, o1);
        const mid = r.state.architectures.length;
        const schnitt = (list) => list.map((e) => [e.type, e.position.x, e.position.z, e.rotationY, e.seed]);
        const akt1 = r.state.architectures.slice(before, mid);
        const e1Schnitt = schnitt(akt1);
        for (const e of akt1) r.removeArchitecture(e);
        const mid2 = r.state.architectures.length;
        const r2 = r._spawnSettlementFromExport(plan, o1);
        const after = r.state.architectures.length;
        res.placed1 = r1.placed;
        res.skipped1 = r1.skipped;
        res.placed2 = r2.placed;
        res.entriesMatch = mid - before === r1.placed && mid2 === before && after - mid2 === r2.placed;
        const e1 = r.state.architectures.slice(mid2, after);
        res.allHaus = e1.every((e) => typeof e.type === "string" && e.type.indexOf("haus_") === 0);
        // Offsets relativ zum Anker byte-vergleichen (x/z; y ist Terrain-Wahrheit je Ort).
        const off = (list, o) => list.map((e) => [e[0], e[1] - o.x, e[2] - o.z, e[3], e[4]]);
        res.offsetsDeterministic =
            r1.placed === r2.placed && JSON.stringify(off(e1Schnitt, o1)) === JSON.stringify(off(schnitt(e1), o1));
        // Slot-Anker == Export-Slot: JEDER platzierte Eintrag trägt exakt slot.x/z + phi seines Slots (per seed zugeordnet). Die
        // Wände der Slot-Quelle (Wasser, Klippe über dem Footprint-Raster, Bau) rechnet die Probe nicht nach — sie liest, was
        // stand (die gespiegelte Vier-Ecken-Klippe fiel mit dem Raster, Integration Welle L).
        res.slotAnchorExact =
            e1.length > 0 &&
            e1.every((e) => {
                const sl = plan.slots.find((x) => x.seed >>> 0 === e.seed);
                return (
                    !!sl &&
                    Math.abs(e.position.x - (o1.x + sl.x)) < 1e-9 &&
                    Math.abs(e.position.z - (o1.z + sl.z)) < 1e-9 &&
                    e.rotationY === (sl.phi || 0)
                );
            });
        // HAUS-DOPPELBAU-SCHNITT (P0-Inventur 18.07.) — der KONSUM-Beweis lebt:
        // (a) jeder platzierte Eintrag trägt den Slot-ov als studioOv (rolle
        //     byte-gleich, per seed dem Export-Slot zugeordnet),
        // (b) der Flatten-Chokepoint LIEST ihn (_artifactStudioOv non-null) und
        //     zwei rollen-verschiedene Häuser trennen sich im ov-Hash — das
        //     Dorf ist kein Kultur-Default-Klonfeld mehr.
        res.ovTravels =
            e1.length > 0 &&
            e1.every((e) => {
                const s = plan.slots.find((sl) => (sl.seed >>> 0) === e.seed);
                return (
                    s && e.studioOv && typeof e.studioOv === "object" && e.studioOv.rolle === (s.rolle || "wohnhaus")
                );
            });
        const ovA = e1.length ? r._artifactStudioOv(e1[0]) : null;
        const eB = e1.find((e) => e.studioOv && ovA && e.studioOv.rolle !== ovA.rolle);
        const ovB = eB ? r._artifactStudioOv(eB) : null;
        res.ovKeysSplit = !!(ovA && ovB && r._studioOvHash(ovA) !== r._studioOvHash(ovB));
        // DORF-IN-TERRAIN — der Footprint reist als entry.fundament, und die EINE
        // Fundament-Wahrheit (_archFundamentBox) liefert am Berg-Anker ein Podest
        // (topY > botY; das Gate-Terrain ist GEMESSEN geneigt, Δh >= 4.8 m).
        const eF = e1.find((e) => e.fundament && Number.isFinite(e.fundament.ex));
        res.fundamentTravels = e1.length > 0 && e1.every((e) => e.fundament && Number.isFinite(e.fundament.ex));
        res.fundamentBox = !!(
            eF &&
            (() => {
                const b = r._archFundamentBox(eF);
                return b && b.topY > b.botY && b.minX < b.maxX;
            })()
        );
        // 3) fail-closed: ein Slot mit unbekannter Kultur faellt (kein Spawn, kein Crash).
        const fake = JSON.parse(JSON.stringify(plan));
        fake.slots = [Object.assign({}, fake.slots[0], { kultur: "gibtsnicht" })];
        const r3 = r._spawnSettlementFromExport(fake, { x: 900, z: 900 });
        res.failClosed = r3.placed === 0 && r3.skipped === 1;
        // 4) Der Chat-Konsument "dorf" existiert in der System-Befehls-Tabelle.
        res.chatDorf = r.chatSystemPatterns.some((p) => p.example && p.example.indexOf("dorf") === 0);
        // 5) Γ5: spawnSettlement wuerfelt seed-frei aus dem Welt-Stream (Source-Probe am lebenden Symbol).
        // Welle L: der Same zieht aus dem EINEN Bau-Strom `_bauSame("stadt")` (Welt-Seed:<art>:<n>, FNV-1a) — derselbe für
        // den Chat-Satz „baue dorf hier" (die Probe wandert mit dem Code).
        const src = window.__codeOf ? window.__codeOf(r.spawnSettlement) : r.spawnSettlement.toString();
        const srcSame = window.__codeOf ? window.__codeOf(r._bauSame) : String(r._bauSame);
        // derselbe Strom für den Chat-Satz „baue dorf hier" (Welle L: vorher würfelte Math.random den Dorf-Samen)
        const baueHier = (r.chatDslPatterns || []).find((p) => p.example === "baue dorf hier");
        const srcHier = baueHier
            ? (window.__codeOf ? window.__codeOf(baueHier.build) : String(baueHier.build)).replace(/\/\/[^\n]*/g, "")
            : "";
        res.gammaHier = /_bauSame\(/.test(srcHier) && !/Math\.random/.test(srcHier);
        res.gammaStream =
            /_bauSame\("stadt"\)/.test(src) &&
            !/Math\.random/.test(src) &&
            /:\$\{art\}:/.test(srcSame) &&
            !/Math\.random/.test(srcSame);
        // Nachlese-Welle (V9.56-i — die Probe wandert mit dem Code): die Wasser-Wand
        // lebt seit der Slot-Extraktion in der EINEN Slot-Quelle _spawnSettlementSlot.
        res.waterWall = /_isAboveWaterAt/.test(
            window.__codeOf ? window.__codeOf(r._spawnSettlementSlot) : r._spawnSettlementSlot.toString()
        );
        res.anchorChokepoint = /_structureSpawnPos/.test(src);
        // 6) DER DSL-AKT spawn_village liest die Größe aus dem Siedlungs-Gesetz NACH der Buch-Ankunft (Welle L): das Dorf
        //    des Akts trägt nH = SIEDLUNG.nHMin + (Same >>> 24) % SIEDLUNG.nHSpan (vorher bei kaltem Buch still der
        //    Kern-Default). Gemessen am Rebuild-Gedächtnis des Dorfs (settlementCells: Same, nH, Ort).
        try {
            const SG = r.constructor._siedlungGesetz();
            const same = 0x5a5a1234;
            const pv = { x: o1.x + 600, y: 0, z: o1.z - 600 };
            pv.y = r.getTerrainHeightAt(pv.x, pv.z);
            const ctxV = { budget: { spawnsLeft: 4 }, log: [], rng: () => 0.5, source: "human" };
            r.dslEffects.spawn_village([["at", pv.x, pv.y, pv.z], same], ctxV);
            let cell = null;
            for (let k = 0; k < 600 && !cell; k++) {
                await new Promise((rs) => setTimeout(rs, 100));
                const sc = (r.state.worldMeta && r.state.worldMeta.settlementCells) || {};
                // der Wege-Schlüssel des Dorfs: d:<Same>@<Ort> (Welle L), auf älteren Ständen d:<Same>
                for (const key of Object.keys(sc))
                    if (key === "d:" + (same >>> 0) || key.indexOf("d:" + (same >>> 0) + "@") === 0) cell = sc[key];
            }
            res.villageNH = cell ? cell.nH : null;
            res.villageNHSoll = SG ? SG.nHMin + ((same >>> 24) % SG.nHSpan) : null;
        } catch (e) {
            res.villageNHErr = (e && e.message) || String(e);
        }
        // ===== TEIL C: WORLDGEN-AUTO-DÖRFER (Nachlese-Welle) =====
        res.c = {};
        try {
            const A = r.constructor.AUTO_SETTLEMENT;
            // C1 — Zell-Wahrheit deterministisch + zell-sensitiv (reine Funktion, Γ5).
            let cand = null;
            let candCount = 0;
            for (let cz = -6; cz <= 6 && !cand; cz++) {
                for (let cx = -6; cx <= 6; cx++) {
                    const i1 = r._autoSettlementCellInfo(cx, cz);
                    if (!i1) continue;
                    candCount++;
                    if (r._autoSettlementSiteOk(i1.x, i1.z)) {
                        cand = i1;
                        break;
                    }
                }
            }
            res.c.hashRare = candCount > 0 && candCount < 169; // selten, aber existent (13x13 Zellen)
            const rep = cand ? r._autoSettlementCellInfo(parseInt(cand.key), parseInt(cand.key.split(",")[1])) : null;
            res.c.deterministic = !!(cand && rep && JSON.stringify(cand) === JSON.stringify(rep));
            res.c.spawnClearWall = r._autoSettlementSiteOk(0, 0) === false; // die Warmup-Welt bleibt dorffrei
            res.c.channelLive = r._autoSettlementChannelLive() === true; // der Dispatch-Kanal (M8)
            // C2 — HEADLESS-DEFAULT: Null-Renderer ohne Hook -> der Tick ruht (kein Pending).
            const prevHook = window.__anazhAutoSettlement;
            delete window.__anazhAutoSettlement;
            if (cand) r._tickAutoSettlement({ x: cand.x, z: cand.z });
            res.c.headlessQuiet = !r._autoSettlementPendingKey && !r._autoSettlementQueue;
            // C3 — die ERZWUNGENE Dorf-Zelle (Hook an, sichern + wiederherstellen):
            // Export -> Reservierung -> budgetierte Materialisierung ueber Ticks.
            window.__anazhAutoSettlement = true;
            const wm = r.state.worldMeta;
            const key = cand ? cand.key : null;
            const archBefore = r.state.architectures.length;
            const plan = cand
                ? await Promise.race([
                      r._autoSettlementSpawnCell(parseInt(key), parseInt(key.split(",")[1]), cand),
                      new Promise((rs) => setTimeout(() => rs("timeout"), 90000)),
                  ])
                : null;
            res.c.planOk = !!(plan && plan !== "timeout" && Array.isArray(plan.slots));
            // DORF-ERLEBNIS (17.07.) — das Band wandert MIT dem Gesetz: die
            // Reservierung ist jetzt das Rebuild-Gedächtnis-OBJEKT {seed,nH,x,z}.
            res.c.reserved = !!(
                key &&
                wm.settlementCells &&
                wm.settlementCells[key] &&
                typeof wm.settlementCells[key] === "object" &&
                isFinite(wm.settlementCells[key].seed)
            );
            // DORF-ERLEBNIS — Brunnen/Wege heben bei ANKUNFT (deliberat, klein,
            // budget-frei); die Budget-Wand gilt der HAUS-Materialisierung:
            // Referenz ist der Stand NACH der Ankunft.
            const archAnkunft = r.state.architectures.length;
            // EXISTENZ VOR FRAMERATE (Welle L, Leben-Prüfung N-D9; Lehre 13): über dem Frame-Budget DROSSELT der Takt das
            // Tempo, er sperrt die Siedlung nie — 16 Takte dauerhaft über dem Budget tragen Häuser, höchstens einen je
            // drosselTakte-ten Takt. Vorher (die V18.282-Wand) entstand über dem Budget nichts: 60 von 60 Proben, 0 Häuser.
            // Gemessen über den ECHTEN Job-Pfad (Q0): der Frame-Dispatcher (`_dispatchFrameJobs`) mit den Jobs des Spiels
            // (`_buildDeferrableJobs`, der Spieler steht, wo er steht) und einem ausgeschöpften Budget — die Deko (prio 2,
            // `scatterDeco` → `_tickScatterStreaming` → `_tickAutoSettlement`) läuft dort nur jeden 4. Frame und nie in
            // einem Frame mit Chunk-Bau. Gezählt wird in Frames, bis zwei Slots bearbeitet sind (höchstens 3000 Frames ≈ 50 s
            // bei 60 Bildern/s): die Siedlung wächst über dem Budget — je Deko-Lauf ohne Chunk-Bau höchstens 1/drosselTakte Slot.
            const fob = r.state._frameOverBudget;
            const drossel = A.drosselTakte || 8;
            const B = r._makeFrameBudget(0);
            const pmP = r.state.playerMesh.position;
            const qIdx0 = r._autoSettlementQueue ? r._autoSettlementQueue.idx : null;
            const qJetzt = () => (r._autoSettlementQueue ? r._autoSettlementQueue.idx : null);
            // erst steht der Ring (der Boden zuerst — ein Frame mit Chunk-Bau trägt keine Deko): normale Frames, bis 60 in
            // Folge ohne Chunk-Bau laufen; der Auto-Zug ruht dabei (Hook aus), die Schlange wartet auf die Messung
            let ruhig = 0;
            let vorlauf = 0;
            r.state._frameOverBudget = false;
            window.__anazhAutoSettlement = false;
            while (ruhig < 60 && vorlauf < 3000) {
                B.totalMs = Infinity;
                B.startFrame();
                r.state._frameChunksBuilt = false;
                r._dispatchFrameJobs(r._buildDeferrableJobs({ x: pmP.x, y: pmP.y, z: pmP.z }), B);
                ruhig = r.state._frameChunksBuilt ? 0 : ruhig + 1;
                vorlauf++;
                await new Promise((rs) => setTimeout(rs, 0));
            }
            res.c.vorlaufFrames = vorlauf;
            window.__anazhAutoSettlement = true;
            const qStart = qJetzt();
            let dekoLaeufe = 0;
            let FRAMES = 0;
            while (FRAMES < 3000 && r._autoSettlementQueue && qJetzt() - qStart < 2) {
                B.totalMs = 0;
                B.startFrame();
                r.state._frameChunksBuilt = false;
                r.state._frameOverBudget = true;
                const ran = r._dispatchFrameJobs(r._buildDeferrableJobs({ x: pmP.x, y: pmP.y, z: pmP.z }), B);
                if (ran.includes("scatterDeco") && !r.state._frameChunksBuilt) dekoLaeufe++;
                FRAMES++;
                await new Promise((rs) => setTimeout(rs, 0));
            }
            // gezählt werden die bearbeiteten Slots (ein Slot an Wasser/Klippe fällt geschlossen, er zählt als Schritt)
            const qIdx1 = r._autoSettlementQueue ? r._autoSettlementQueue.idx : qIdx0;
            res.c.ueberBudget = Number.isFinite(qStart) && Number.isFinite(qIdx1) ? qIdx1 - qStart : null;
            res.c.ueberBudgetFrames = FRAMES;
            res.c.dekoLaeufe = dekoLaeufe;
            res.c.budgetWall = res.c.ueberBudget >= 1 && res.c.ueberBudget <= Math.floor(dekoLaeufe / drossel) + 1;
            r.state._frameOverBudget = false;
            // Materialisierung: je Tick hoechstens perTick Slots (gezaehlt).
            let ticks = 0;
            let maxPerTick = 0;
            let prevCount = r.state.architectures.length;
            while (r._autoSettlementQueue && ticks < 500) {
                r._tickAutoSettlement({ x: cand.x, z: cand.z });
                const now2 = r.state.architectures.length;
                if (now2 - prevCount > maxPerTick) maxPerTick = now2 - prevCount;
                prevCount = now2;
                ticks++;
            }
            const archAfter = r.state.architectures.length;
            res.c.placed = archAfter - archBefore;
            res.c.ticks = ticks;
            res.c.budgeted = maxPerTick > 0 && maxPerTick <= A.perTick && ticks >= 2;
            // DORF-ERLEBNIS — die Siedlung hebt jetzt auch BRUNNEN (brunnen_dorf)
            // und HOF-BÄUME (SCHICHT-VOLLENDUNG 18.07.: Studio-Bäume der
            // trees-Schicht): das Band wandert mit dem Gesetz.
            res.c.allHaus = r.state.architectures
                .slice(archBefore)
                .every(
                    (e) =>
                        typeof e.type === "string" &&
                        (e.type.indexOf("haus_") === 0 ||
                            e.type === "brunnen_dorf" ||
                            e.type === "marktstand_dorf" ||
                            e.type.indexOf("baum_") === 0)
                );
            // C4 — IDEMPOTENZ: dieselbe Zelle nochmal -> 0 neue (Reservierung traegt).
            const again = await r._autoSettlementSpawnCell(parseInt(key), parseInt(key.split(",")[1]), cand);
            for (let t2 = 0; t2 < 5; t2++) r._tickAutoSettlement({ x: cand.x, z: cand.z });
            res.c.idempotent = again === null && r.state.architectures.length === archAfter;
            // C5 — DER GENESIS-PORTAL-RING (V18.486, Schöpfer: „beim ersten spawn
            // die kernportale um die genesis-plattform anordnen"): am Ursprung
            // heben alle builtIn-Welt-Portale im Kreis R 11 m; doppelt idempotent
            // (worldMeta-Stempel + Existenz-Probe). Bis hier hatte der Ring KEINE
            // Linse — Fertigkeit ohne Konsum-Beweis ist die verbotene Klasse.
            res.c.ring = {};
            try {
                const wm5 = r.state.worldMeta;
                delete wm5.genesisPortalRing;
                r._genesisRingFertig = false;
                const portalArten = Object.keys(r.state.blueprints || {}).filter((n) => {
                    const b = r.state.blueprints[n];
                    return b && b.builtIn && b.role === "portal" && b.portalMeta && b.portalMeta.world;
                });
                res.c.ring.arten = portalArten.length;
                const ringVorher = r.state.architectures.filter(
                    (e) => e && e.position && portalArten.includes(e.type) && e.position.x * e.position.x + e.position.z * e.position.z <= 400
                ).length;
                for (let t5 = 0; t5 < 30 && !wm5.genesisPortalRing; t5++) r._genesisPortalRing({ x: 0, y: 1, z: 0 });
                const ringNachher = r.state.architectures.filter(
                    (e) => e && e.position && portalArten.includes(e.type) && e.position.x * e.position.x + e.position.z * e.position.z <= 400
                ).length;
                res.c.ring.stempel = wm5.genesisPortalRing === true;
                res.c.ring.gebaut = ringNachher - ringVorher;
                const archRing = r.state.architectures.length;
                r._genesisPortalRing({ x: 0, y: 1, z: 0 }); // Idempotenz: der Stempel traegt
                res.c.ring.idempotent = r.state.architectures.length === archRing;
                // Radius-Probe: jedes neue Ring-Portal sitzt auf ~R 11 (±2 m)
                res.c.ring.radiusOk = r.state.architectures
                    .filter((e) => e && e.position && portalArten.includes(e.type))
                    .slice(-res.c.ring.gebaut)
                    .every((e) => {
                        const d = Math.sqrt(e.position.x * e.position.x + e.position.z * e.position.z);
                        return d > 9 && d < 13;
                    });
            } catch (e5) {
                res.c.ring.err = (e5 && e5.message) || String(e5);
            }
            // C6 — DER WEGE-SCHLÜSSEL TRÄGT DEN ORT (Welle L, Leben-Prüfung S-W1): zwei Siedlungen mit DEMSELBEN Samen an
            // zwei Orten bauen je ihre Wege (die Wege-Formen werden am echten Bau gezählt, `_stlWegeBuild` läuft durch).
            // Vorher schlüsselte das Gedächtnis nur den Samen: die zweite (die Stadt `dorf 7 120` neben `dorf 7 18`) blieb ohne Weg.
            try {
                const orig = r._stlWegeBuild;
                const formen = [];
                r._stlWegeBuild = function (...a) {
                    const n6 = orig.apply(this, a);
                    formen.push(n6);
                    return n6;
                };
                await r.spawnSettlement({ seed: 4711, nH: 6, position: { x: 1500, y: 0, z: 1500 } });
                await r.spawnSettlement({ seed: 4711, nH: 6, position: { x: -1500, y: 0, z: 1500 } });
                r._stlWegeBuild = orig;
                res.c.wegeJeOrt = formen;
            } catch (e6) {
                res.c.wegeErr = (e6 && e6.message) || String(e6);
            }
            // Hook wiederherstellen (sichern + wiederherstellen, nie loeschen — die Disziplin):
            if (prevHook === undefined) delete window.__anazhAutoSettlement;
            else window.__anazhAutoSettlement = prevHook;
            r.state._frameOverBudget = fob;
        } catch (e) {
            res.c.err = (e && e.message) || String(e);
        }
        return res;
    });

    await browser.close();
    server.close();

    check("B: das LIVE-Buch ist warm (Voraussetzung)", out.bookReady === true);
    check(
        "B: _foundryRequestSettlement liefert den Export durch den EINEN Worker",
        out.planOk === true,
        `slots=${out.planSlots} name=${out.planName}`
    );
    check(
        "B: der Konsument platziert (placed > 0, Buchhaltung exakt)",
        out.placed1 > 0 && out.entriesMatch === true,
        `placed=${out.placed1} skipped=${out.skipped1}`
    );
    check("B: jeder Eintrag ist ein haus_<kultur>-Blueprint (Tabellen-Regel, kein Literal)", out.allHaus === true);
    check(
        "B: POSITIONS-DETERMINISTISCH (derselbe Anker zweimal — identische Offsets/Seeds/Rotationen)",
        out.offsetsDeterministic === true,
        `placed1=${out.placed1} placed2=${out.placed2}`
    );
    check("B: der Slot-Anker sitzt EXAKT (entry == anker + slot.x/z, phi, seed)", out.slotAnchorExact === true);
    check(
        "B: DORF-IN-TERRAIN — der Slot-Footprint reist als entry.fundament {ex,ez}",
        out.fundamentTravels === true
    );
    check(
        "B: DORF-IN-TERRAIN — die EINE Fundament-Wahrheit liefert das Hang-Podest (topY > botY)",
        out.fundamentBox === true
    );
    check(
        "B: HAUS-DOPPELBAU — der Slot-ov reist als studioOv an JEDEM Eintrag (rolle == Export)",
        out.ovTravels === true
    );
    check(
        "B: HAUS-DOPPELBAU — der Flatten-Chokepoint liest den Stempel (ov-Hash trennt Kirche von Wohnhaus)",
        out.ovKeysSplit === true
    );
    check("B: fail-closed — unbekannte Kultur faellt (0 platziert, 1 uebersprungen)", out.failClosed === true);
    check('B: der Chat-Konsument "dorf [seed] [häuser]" steht in der Befehls-Tabelle', out.chatDorf === true);
    check("B: Γ5 — der Siedlungs-Same zieht aus dem :stadt-Stream (kein Math.random)", out.gammaStream === true);
    check("B: Γ5 — „baue dorf hier“ zieht denselben Bau-Strom (_bauSame, kein Math.random)", out.gammaHier === true);
    check(
        "B: der DSL-Akt spawn_village trägt die Größe des Siedlungs-Gesetzes (nach der Buch-Ankunft, nie der Kern-Default)",
        Number.isFinite(out.villageNH) && out.villageNH === out.villageNHSoll,
        `nH ${out.villageNH} (Soll ${out.villageNHSoll})${out.villageNHErr ? " err=" + out.villageNHErr : ""}`
    );
    check(
        "B: die Wasser-Wand steht in der EINEN Slot-Quelle (_spawnSettlementSlot, _isAboveWaterAt je Slot)",
        out.waterWall === true
    );
    check("B: der Anker laeuft durch den EINEN Spawn-Chokepoint (_structureSpawnPos)", out.anchorChokepoint === true);
    console.log("\n=== TEIL C: WORLDGEN-AUTO-DÖRFER (Nachlese-Welle) ===");
    for (const [name, ok] of autoStaticLaws(fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8"))) check(name, ok);
    const c = out.c || {};
    check(
        "C1: die Zell-Wahrheit ist selten + deterministisch (2 Läufe byte-gleich, Γ5)",
        c.hashRare === true && c.deterministic === true,
        c.err || ""
    );
    check("C1b: die Spawn-Klar-Wand steht (der Welt-Ursprung ist nie Dorf-Site)", c.spawnClearWall === true);
    check("C1c: der Dispatch-Kanal lebt (mind. ein Rezept -> settlement, M8)", c.channelLive === true);
    check(
        "C2: HEADLESS-DEFAULT — Null-Renderer ohne Hook: der Auto-Zug ruht (kein Pending, keine Queue)",
        c.headlessQuiet === true
    );
    check(
        "C3: die erzwungene Dorf-Zelle materialisiert (Export -> Reservierung -> Häuser)",
        c.planOk === true && c.reserved === true && c.placed >= 1 && c.allHaus === true,
        `placed=${c.placed} ticks=${c.ticks}`
    );
    check(
        "C3b: Existenz vor Framerate — über dem Budget wächst die Siedlung gedrosselt (echter Job-Pfad scatterDeco: Slots in Frames, nie 0, je Deko-Lauf ≤ 1/drosselTakte)",
        c.budgetWall === true,
        `über dem Budget: ${c.ueberBudget} Slots in ${c.ueberBudgetFrames} Frames (${c.dekoLaeufe} Deko-Läufe; der Ring stand nach ${c.vorlaufFrames} Frames)`
    );
    check(
        "C6: der Wege-Schlüssel trägt den Ort — zwei Siedlungen mit demselben Samen bauen je ihre Wege",
        Array.isArray(c.wegeJeOrt) && c.wegeJeOrt.length === 2 && c.wegeJeOrt.every((n6) => n6 > 0),
        `Wege-Formen je Ort: ${(c.wegeJeOrt || []).join(" / ")}${c.wegeErr ? " err=" + c.wegeErr : ""}`
    );
    const ring = c.ring || {};
    check(
        "C5: DER GENESIS-PORTAL-RING hebt am Ursprung (alle builtIn-Welt-Portale, Stempel gesetzt)",
        ring.stempel === true && ring.arten >= 1 && ring.gebaut >= 1,
        `arten=${ring.arten} gebaut=${ring.gebaut}${ring.err ? " err=" + ring.err : ""}`
    );
    check(
        "C5: Ring-Radius ~11 m + doppelt idempotent (Stempel traegt, 0 Doppel)",
        ring.radiusOk === true && ring.idempotent === true,
        `radiusOk=${ring.radiusOk} idem=${ring.idempotent}`
    );
    check(
        "C3c: BUDGETIERT über Ticks (je Tick <= perTick Slots, mehrere Ticks — das BOOT_PHASE3-Muster)",
        c.budgeted === true,
        `ticks=${c.ticks}`
    );
    check(
        "C4: IDEMPOTENT — dieselbe Zelle nochmal: 0 neue Häuser (worldMeta.settlementCells trägt über den Reload)",
        c.idempotent === true
    );
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);

    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — DER SETTLEMENT-KANAL N5.7 STEHT: exportSettlement ist deterministisch + eingefroren (Kern), der Export reist durch den EINEN Worker (Brücke generisch, M8), der Host hebt die Slots positions-deterministisch, wasser-bewacht und fail-closed in die Welt (deliberater Akt) — UND der Worldgen-Konsument lebt (Auto-Dörfer: Γ5-Zellen, Site-Wände, budgetierte Materialisierung durch die EINE Slot-Quelle, Reload-idempotent, headless-ruhig)."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Settlement-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
