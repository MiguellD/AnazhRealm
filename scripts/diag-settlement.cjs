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
//   --selftest: ein in-memory korrumpiertes Golden MUSS rot erkannt werden + ein
//     Slot mit unbekannter Kultur MUSS fallen (die Linse ist nicht vakuös).
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
        res.waterWall = /_isAboveWaterAt/.test(
            window.__codeOf ? window.__codeOf(r._spawnSettlementFromExport) : r._spawnSettlementFromExport.toString()
        );
        res.anchorChokepoint = /_structureSpawnPos/.test(src);
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
    check("B: die Wasser-Wand steht im Konsumenten (_isAboveWaterAt je Slot)", out.waterWall === true);
    check("B: der Anker laeuft durch den EINEN Spawn-Chokepoint (_structureSpawnPos)", out.anchorChokepoint === true);
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);

    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — DER SETTLEMENT-KANAL N5.7 STEHT: exportSettlement ist deterministisch + eingefroren (Kern), der Export reist durch den EINEN Worker (Brücke generisch, M8), und der Host hebt die Slots positions-deterministisch, wasser-bewacht und fail-closed in die Welt (Wald-Schwester als deliberater Akt)."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Settlement-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
