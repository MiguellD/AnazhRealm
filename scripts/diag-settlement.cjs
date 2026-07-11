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
            "C-S1: _autoSettlementSpawnCell RESERVIERT (settlementCells[key] = 1 — das Spawn-einmal-Gedächtnis)",
            /settlementCells\[key\] = 1/.test(nc),
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
        const broken1 = anazhSrcST.replace("settlementCells[key] = 1", "settlementCells[key] = 0 ? 1 : 1 - 0");
        const cs1 = autoStaticLaws(broken1).find((l) => l[0].startsWith("C-S1"));
        check("Selbst-Test 4: Reservierung entfernt -> C-S1 feuert", cs1 && cs1[1] === false);
        const broken2 = anazhSrcST.replace(
            /_spawnSettlementSlot\(q\.plan\.slots/g,
            "_meinParallelPlatzierer(q.plan.slots"
        );
        const cs3 = autoStaticLaws(broken2).find((l) => l[0].startsWith("C-S3"));
        check("Selbst-Test 5: Parallel-Platzierer injiziert -> C-S3 feuert", cs3 && cs3[1] === false);
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
        window.__anazhHeadlessSkinResCap = 64;
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
        const r1 = r._spawnSettlementFromExport(plan, o1);
        const mid = r.state.architectures.length;
        const r2 = r._spawnSettlementFromExport(plan, o1);
        const after = r.state.architectures.length;
        res.placed1 = r1.placed;
        res.skipped1 = r1.skipped;
        res.placed2 = r2.placed;
        res.entriesMatch = mid - before === r1.placed && after - mid === r2.placed;
        const e1 = r.state.architectures.slice(before, mid);
        const e2 = r.state.architectures.slice(mid, after);
        res.allHaus = e1.every((e) => typeof e.type === "string" && e.type.indexOf("haus_") === 0);
        // Offsets relativ zum Anker byte-vergleichen (x/z; y ist Terrain-Wahrheit je Ort).
        const off = (list, o) => list.map((e) => [e.type, e.position.x - o.x, e.position.z - o.z, e.rotationY, e.seed]);
        res.offsetsDeterministic =
            r1.placed === r2.placed && JSON.stringify(off(e1, o1)) === JSON.stringify(off(e2, o1));
        // Slot-Anker == Export-Slot (der erste platzierte Eintrag traegt exakt slot.x/z + phi + seed).
        const s0 = plan.slots.find((s) => {
            const rec = f.recipes[s.kultur];
            const pol = rec && r.constructor.KIND_POLICY[rec.kind];
            return (
                pol &&
                pol.prefix &&
                r.state.blueprints[pol.prefix + s.kultur] &&
                r._isAboveWaterAt(o1.x + s.x, o1.z + s.z, 0.2)
            );
        });
        const m0 = s0
            ? e1.find((e) => e.seed === s0.seed >>> 0 && Math.abs(e.position.x - (o1.x + s0.x)) < 1e-9)
            : null;
        res.slotAnchorExact = !!(
            m0 &&
            Math.abs(m0.position.z - (o1.z + s0.z)) < 1e-9 &&
            m0.rotationY === (s0.phi || 0)
        );
        // 3) fail-closed: ein Slot mit unbekannter Kultur faellt (kein Spawn, kein Crash).
        const fake = JSON.parse(JSON.stringify(plan));
        fake.slots = [Object.assign({}, fake.slots[0], { kultur: "gibtsnicht" })];
        const r3 = r._spawnSettlementFromExport(fake, { x: 900, z: 900 });
        res.failClosed = r3.placed === 0 && r3.skipped === 1;
        // 4) Der Chat-Konsument "dorf" existiert in der System-Befehls-Tabelle.
        res.chatDorf = r.chatSystemPatterns.some((p) => p.example && p.example.indexOf("dorf") === 0);
        // 5) Γ5: spawnSettlement wuerfelt seed-frei aus dem Welt-Stream (Source-Probe am lebenden Symbol).
        const src = window.__codeOf ? window.__codeOf(r.spawnSettlement) : r.spawnSettlement.toString();
        res.gammaStream = /:stadt/.test(src) && !/Math\.random/.test(src);
        // Nachlese-Welle (V9.56-i — die Probe wandert mit dem Code): die Wasser-Wand
        // lebt seit der Slot-Extraktion in der EINEN Slot-Quelle _spawnSettlementSlot.
        res.waterWall = /_isAboveWaterAt/.test(
            window.__codeOf ? window.__codeOf(r._spawnSettlementSlot) : r._spawnSettlementSlot.toString()
        );
        res.anchorChokepoint = /_structureSpawnPos/.test(src);
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
            res.c.reserved = !!(key && wm.settlementCells && wm.settlementCells[key] === 1);
            // Budget-Wand: ueber Budget materialisiert NICHTS.
            const fob = r.state._frameOverBudget;
            r.state._frameOverBudget = true;
            r._tickAutoSettlement({ x: cand ? cand.x : 0, z: cand ? cand.z : 0 });
            const archOverBudget = r.state.architectures.length;
            res.c.budgetWall = archOverBudget === archBefore;
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
            res.c.allHaus = r.state.architectures
                .slice(archBefore)
                .every((e) => typeof e.type === "string" && e.type.indexOf("haus_") === 0);
            // C4 — IDEMPOTENZ: dieselbe Zelle nochmal -> 0 neue (Reservierung traegt).
            const again = await r._autoSettlementSpawnCell(parseInt(key), parseInt(key.split(",")[1]), cand);
            for (let t2 = 0; t2 < 5; t2++) r._tickAutoSettlement({ x: cand.x, z: cand.z });
            res.c.idempotent = again === null && r.state.architectures.length === archAfter;
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
    check("B: fail-closed — unbekannte Kultur faellt (0 platziert, 1 uebersprungen)", out.failClosed === true);
    check('B: der Chat-Konsument "dorf [seed] [häuser]" steht in der Befehls-Tabelle', out.chatDorf === true);
    check("B: Γ5 — der Siedlungs-Same zieht aus dem :stadt-Stream (kein Math.random)", out.gammaStream === true);
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
    check("C3b: die Budget-Wand pausiert (_frameOverBudget -> 0 Häuser in dem Tick)", c.budgetWall === true);
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
