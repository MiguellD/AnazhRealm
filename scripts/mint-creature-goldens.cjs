// mint-creature-goldens.cjs — P7: die Goldens des Kreatur-Vertrags v2 münzen. ZWEI Phasen:
//   (1) FIXTURE-CAPTURE (Browser, einmalig): reale Kreatur-Specs (Avatar + Kreatur-Seelen-bodyParts)
//       aus der gebooteten Welt ziehen → spec/asset-contract/v2/fixtures/skin-fixtures.json (FROZEN).
//   (2) GOLDEN-MINT (Node, aus der Fixture): bake-core (`__bakeSkinGeometry`) auf jede Spec → byte-
//       exakter Fingerabdruck → spec/asset-contract/v2/golden/<id>.json + manifest.json.
// Die Fixtures + Goldens sind EINGEFROREN (Taille-Disziplin) — NIE blind regenerieren; ein bewusster
// Re-Mint ist MINT_FORCE=1 mit Begründung. Ohne Fixture wird sie einmalig gezogen; mit Fixture + ohne
// MINT_FORCE bäckt der Mint nur die Goldens neu (kein Browser nötig).
//   node scripts/mint-creature-goldens.cjs            (Goldens aus der Fixture, node-only)
//   MINT_FORCE=1 node scripts/mint-creature-goldens.cjs   (Fixture NEU ziehen + Goldens)
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const L = require("./lib/skin-contract.cjs");

async function captureFixture() {
    const puppeteer = require("puppeteer");
    const http = require("http");
    const PORT = Number(process.env.MINT_CREATURE_PORT || 4599);
    const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".woff2": "font/woff2", ".css": "text/css", ".png": "image/png" };
    const server = http.createServer((req, res) => {
        let p = req.url.split("?")[0];
        if (p === "/") p = "/index.html";
        const fp = path.join(L.ROOT, p);
        if (!fp.startsWith(L.ROOT)) return ((res.statusCode = 403), res.end());
        fs.readFile(fp, (e, d) => {
            if (e) return ((res.statusCode = 404), res.end());
            res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
            res.end(d);
        });
    });
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 120000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => (window.__anazhHeadlessNullRenderer = true));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const dl = performance.now() + 60000;
        while ((!window.anazhRealm || !window.anazhRealm.state || typeof window.anazhRealm._gameLoopTick !== "function" || !window.anazhRealm.state.blueprints) && performance.now() < dl)
            await new Promise((r) => setTimeout(r, 100));
    });
    const specs = await page.evaluate(() => {
        const r = window.anazhRealm,
            K = r.constructor;
        const out = [];
        try {
            const av = K._humanoidSkeleton({ kh: 1, oy: 0, skinColor: 0xc98a63 });
            if (Array.isArray(av) && av.length) out.push({ id: "avatar-humanoid", kind: "skin", parts: av });
        } catch (_e) {}
        const SOULS = K.CREATURE_SOULS || {};
        const skinSouls = Object.keys(SOULS)
            .filter((k) => SOULS[k] && SOULS[k].skin && Array.isArray(SOULS[k].bodyParts) && SOULS[k].bodyParts.length)
            .sort(); // deterministische Reihenfolge
        for (const k of skinSouls.slice(0, 3)) out.push({ id: "creature-" + k, kind: "skin", parts: SOULS[k].bodyParts });
        return out;
    });
    await browser.close();
    server.close();
    return specs;
}

(async () => {
    fs.mkdirSync(path.dirname(L.FIXTURE_PATH), { recursive: true });
    fs.mkdirSync(L.GOLDEN_DIR, { recursive: true });

    let fixtures = L.loadFixtures();
    const force = !!process.env.MINT_FORCE;
    if (!fixtures || force) {
        if (fixtures && !force) {
            // (nicht erreichbar — nur zur Klarheit)
        }
        console.log("Fixture ziehen (Browser)…");
        const specs = await captureFixture();
        if (!specs || !specs.length) {
            console.error("❌ keine Kreatur-Specs gezogen (Avatar/Seelen leer?)");
            process.exit(1);
        }
        fs.writeFileSync(L.FIXTURE_PATH, JSON.stringify({ cv: 2, specs }));
        console.log(`Fixture: ${specs.length} Specs (${specs.map((s) => s.id + ":" + s.parts.length + "p").join(", ")}) → ${path.relative(L.ROOT, L.FIXTURE_PATH)}`);
        // AUS DER DATEI neu laden → die Goldens werden aus DEMSELBEN on-disk-JSON gebacken, das auch der
        // Gate liest (kein In-Memory-vs-Reload-Drift → byte-exakt reproduzierbar).
        fixtures = L.loadFixtures();
    } else {
        console.log(`Fixture vorhanden (${fixtures.specs.length} Specs) — Goldens werden daraus gebacken (kein Browser).`);
    }

    const bake = L.loadBakeCore();
    const manifest = { cv: 2, opts: L.CONTRACT_OPTS, files: {} };
    let n = 0;
    for (const spec of fixtures.specs) {
        const rec = L.bakeAndFingerprint(bake, spec);
        if (!rec.skin) {
            console.error(`❌ ${spec.id}: bake-core lieferte keine Geometrie`);
            process.exit(1);
        }
        const file = L.fileFor(spec.id);
        const json = JSON.stringify(rec, null, 1);
        fs.writeFileSync(path.join(L.GOLDEN_DIR, file), json);
        manifest.files[file] = crypto.createHash("sha256").update(json).digest("hex");
        console.log(`  ✓ ${spec.id}: ${rec.skin.vertexCount} Verts · pos ${rec.skin.positions.sha256.slice(0, 12)}…`);
        n++;
    }
    fs.writeFileSync(path.join(L.GOLDEN_DIR, "manifest.json"), JSON.stringify(manifest, null, 1));
    console.log(`\n✅ ${n} Kreatur-Goldens gemünzt (cv:2, opts=${JSON.stringify(L.CONTRACT_OPTS)}) → ${path.relative(L.ROOT, L.GOLDEN_DIR)}`);
    process.exit(0);
})().catch((e) => {
    console.error("Mint-Fehler:", (e && e.stack) || e);
    process.exit(1);
});
