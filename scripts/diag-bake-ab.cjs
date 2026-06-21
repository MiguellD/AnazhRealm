// diag-bake-ab.cjs — DER DETERMINISMUS-A/B (DER BÄCKER, Stufe 1, V18.314)
//
// Beweist, dass die extrahierte THREE-freie `bake-core.js` (`__bakeSkinGeometry`)
// BYTE-IDENTISCHE Geometrie liefert wie der Live-Pfad `_buildCreatureSkinGeometryUncached`.
// Solange dieser A/B nicht grün ist, wird der Live-Pfad NICHT umgestellt (null Risiko am
// load-bearing Skin-Pipeline: Avatar + jede Kreatur).
//
// Lauf: node scripts/diag-bake-ab.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = Number(process.env.BAKE_AB_PORT || 4327);
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
    fs.readFile(fp, (e, d) => {
        if (e) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(d);
    });
});

(async () => {
    if (!fs.existsSync(path.join(root, "bake-core.js"))) {
        console.error("❌ bake-core.js fehlt noch — der Extraktions-Schritt muss zuerst laufen.");
        process.exit(1);
    }
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 120000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    const RESCAP = 48; // klein für Tempo; beide Pfade nutzen denselben Cap → identisch + schnell
    await page.evaluateOnNewDocument((cap) => {
        window.__anazhHeadlessSkinResCap = cap;
        window.__anazhHeadlessNullRenderer = true;
    }, RESCAP);
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const dl = performance.now() + 60000;
        while (
            (!window.anazhRealm ||
                !window.anazhRealm.state ||
                typeof window.anazhRealm._gameLoopTick !== "function" ||
                !window.anazhRealm.state.blueprints) &&
            performance.now() < dl
        )
            await new Promise((r) => setTimeout(r, 100));
    });
    // bake-core.js IN die Seite laden → window.__bakeSkinGeometry. WICHTIG: same-origin URL
    // (nicht {path}, das injiziert inline → die strikte CSP `script-src 'self'` blockt es).
    await page.addScriptTag({ url: `http://127.0.0.1:${PORT}/bake-core.js` });

    const out = await page.evaluate((cap) => {
        const r = window.anazhRealm;
        const o = { cases: [] };
        if (typeof window.__bakeSkinGeometry !== "function") {
            o.fatal = "__bakeSkinGeometry nicht geladen";
            return o;
        }
        const SOULS = r.constructor.CREATURE_SOULS || {};
        // Test-Fälle: ein paar Skin-Seelen + verschiedene opts (default + reich/displace)
        const skinSouls = Object.keys(SOULS).filter(
            (k) => SOULS[k] && SOULS[k].skin && Array.isArray(SOULS[k].bodyParts) && SOULS[k].bodyParts.length
        );
        const optsVariants = [
            { label: "default", opts: {} },
            { label: "displace+seam", opts: { displace: true, seamGroove: 0.6, creaseSharpen: 4, creaseMix: 0.6 } },
            { label: "normalRelax", opts: { normalRelax: 2, taubinPasses: 4 } },
        ];
        const cmp = (aArr, bArr, name, caseOut) => {
            const la = aArr ? aArr.length : -1;
            const lb = bArr ? bArr.length : -1;
            if (la !== lb) {
                caseOut.diffs.push(`${name}: LÄNGE ${la} vs ${lb}`);
                return;
            }
            let maxd = 0;
            for (let i = 0; i < la; i++) {
                const d = Math.abs(aArr[i] - bArr[i]);
                if (d > maxd) maxd = d;
            }
            caseOut.maxDiff[name] = maxd;
            if (maxd > 1e-9) caseOut.diffs.push(`${name}: maxDiff ${maxd}`);
        };
        for (const soulKey of skinSouls.slice(0, 3)) {
            const parts = SOULS[soulKey].bodyParts;
            for (const { label, opts } of optsVariants) {
                const caseOut = { soul: soulKey, opts: label, diffs: [], maxDiff: {} };
                let gOld = null,
                    baked = null;
                try {
                    gOld = r._buildCreatureSkinGeometryUncached(parts, opts);
                } catch (e) {
                    caseOut.diffs.push("OLD warf: " + e.message);
                }
                try {
                    baked = window.__bakeSkinGeometry(parts, Object.assign({ headlessResCap: cap }, opts));
                } catch (e) {
                    caseOut.diffs.push("BAKE warf: " + e.message);
                }
                if (gOld && baked) {
                    cmp(gOld.attributes.position.array, baked.positions, "position", caseOut);
                    cmp(gOld.attributes.normal ? gOld.attributes.normal.array : null, baked.normals, "normal", caseOut);
                    cmp(gOld.attributes.color ? gOld.attributes.color.array : null, baked.colors, "color", caseOut);
                    const idxOld = gOld.index ? Array.from(gOld.index.array) : null;
                    cmp(idxOld, baked.indices, "index", caseOut);
                    caseOut.vtx = gOld.attributes.position.count;
                } else if (gOld === null && baked === null) {
                    caseOut.bothNull = true;
                } else {
                    caseOut.diffs.push(`Null-Mismatch: OLD=${!!gOld} BAKE=${!!baked}`);
                }
                o.cases.push(caseOut);
            }
        }
        return o;
    }, RESCAP);

    await browser.close();
    server.close();

    if (out.fatal) {
        console.error("❌ FATAL:", out.fatal);
        process.exit(1);
    }
    console.log("===== BÄCKER A/B — Determinismus (Live-Pfad vs bake-core) =====\n");
    let allOk = true;
    for (const c of out.cases) {
        const ok = c.diffs.length === 0;
        if (!ok) allOk = false;
        const md = Object.entries(c.maxDiff || {})
            .map(([k, v]) => `${k}=${v}`)
            .join(" ");
        console.log(
            `  ${ok ? "✅" : "❌"} ${c.soul} [${c.opts}]` +
                (c.bothNull ? " (beide null)" : ` vtx=${c.vtx || "?"} ${md}`) +
                (c.diffs.length ? "  → " + c.diffs.join(" · ") : "")
        );
    }
    console.log(
        "\n" +
            (allOk
                ? "✅ BYTE-IDENTISCH — bake-core ist eine treue Extraktion. Stufe 2 (Umstellung + Worker) ist sicher."
                : "❌ DIFF gefunden — bake-core weicht ab. Live-Pfad bleibt unangetastet, erst die Extraktion heilen.")
    );
    process.exit(allOk ? 0 : 1);
})().catch((e) => {
    console.error("Crash:", e);
    process.exit(1);
});
