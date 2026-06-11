// Ω4 (V18.139, taille-spec §4) — DAS ZEIT-PORTAL: der AKTUELLE Build empfängt
// einen ZUKUNFTS-Bauplan (synthetisch V25: unbekannter Shape, unbekannte
// Tag-Achsen [nackt + x:-präfixiert], unbekannter Verbindungs-Typ, unbekannte
// Felder, v:2-Hülle) über den EINEN Taille-Pfad (importRecipesFromWorld →
// _admitForeignArtifact) — in der ECHTEN Portal-Umgebung (null-origin-iframe,
// die F1-Infrastruktur von smoke-selfboot): die Welt importiert, degradiert
// SICHTBAR-graceful (Rolle emergiert aus den bekannten Achsen, der unbekannte
// Shape baut als Box, Kosten endlich, Stats endlich), bewahrt die Zukunft
// bit-gleich im Re-Export (must-preserve) und wirft KEINEN page-error.
// Sobald ein ALTER Build als Artefakt vorliegt (git-Tag → dist), läuft
// derselbe Test echt: V18-iframe empfängt V19-Bauplan.
//   npm run smoke:zeitportal
const http = require("http");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const ROOT = path.resolve(__dirname, "..");
const PORT = 4387;
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".css": "text/css",
    ".png": "image/png",
};
const HOST_HTML = `<!doctype html><html><body style="margin:0">
<iframe id="inner" sandbox="allow-scripts" src="/index.html"
 style="width:1024px;height:640px;border:0"></iframe>
</body></html>`;

const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/zeitportal-host.html") {
        res.setHeader("Content-Type", "text/html");
        return res.end(HOST_HTML);
    }
    if (p === "/") p = "/index.html";
    const fp = path.join(ROOT, p);
    if (!fp.startsWith(ROOT)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(fp, (err, data) => {
        if (err) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.end(data);
    });
});

(async () => {
    const failures = [];
    const check = (name, ok, detail) => {
        console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
        if (!ok) failures.push(name);
    };
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
        ],
    });
    const page = await browser.newPage();
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push(String((e && e.message) || e).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/zeitportal-host.html`, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
    });

    let frame = null;
    const tf0 = Date.now();
    while (Date.now() - tf0 < 20000 && !frame) {
        frame = page.frames().find((f) => f !== page.mainFrame() && /index\.html/.test(f.url()));
        if (!frame) await new Promise((r) => setTimeout(r, 250));
    }
    check("der innere Frame existiert (null-origin — die Portal-Umgebung)", !!frame);
    if (!frame) {
        await browser.close();
        server.close();
        process.exit(1);
    }

    // warten, bis die Taille-API der inneren Welt lebt (Bauplan-/Material-
    // Substrat + der Import-Eingang — lange vor dem vollen Chunk-Boot).
    const t0 = Date.now();
    let alive = false;
    while (Date.now() - t0 < 240000 && !alive) {
        alive = await frame
            .evaluate(() => {
                const r = window.anazhRealm;
                return !!(
                    r &&
                    r.state &&
                    r.state.blueprints &&
                    r.state.materials &&
                    typeof r.importRecipesFromWorld === "function" &&
                    typeof r._admitForeignArtifact === "function"
                );
            })
            .catch(() => false);
        if (!alive) await new Promise((r) => setTimeout(r, 2000));
    }
    check("die innere Welt trägt die Taille-API (blueprints · materials · Import-Eingang)", alive);
    if (!alive) {
        await browser.close();
        server.close();
        process.exit(1);
    }

    // ── DER ZUKUNFTS-EMPFANG ──
    const res = await frame
        .evaluate(() => {
            const r = window.anazhRealm;
            const out = {};
            const futureSave = {
                worldMeta: { worldId: "zeit-v25", slug: "aus-der-zukunft" },
                materials: [
                    {
                        name: "aetherglas",
                        label: "Ätherglas",
                        color: 0x88ffee,
                        // eine GEBORENE Kern-Achse (leuchtkraft, V25-additiv) +
                        // fremdes präfixiertes Vokabular + ein unbekanntes Feld.
                        tags: { härte: 0.4, transparent: 0.9, leuchtkraft: 0.9, "x:v25:aether": 1.2 },
                        xV25: { born: "2031" },
                    },
                ],
                blueprints: [
                    {
                        name: "zeit_artefakt",
                        label: "Zeit-Artefakt",
                        v: 2, // die v2-Hülle (unbekanntes Feld — reist opak)
                        role: "chronowerk", // eine Rolle, die es noch nicht gibt
                        parts: [
                            {
                                // der UNBEKANNTE Shape — degradiert sichtbar zur Box.
                                shape: "hyperflaeche",
                                material: "aetherglas",
                                position: { x: 0, y: 1, z: 0 },
                                size: { x: 1, y: 1, z: 1 },
                                rotation: { x: 0, y: 0, z: 0 },
                                opChain: [{ tool: "zeitfräse", op: "chronoschnitt", cap: 0.9, at: 0 }],
                                xDim: 4,
                            },
                            {
                                shape: "box",
                                material: "stein",
                                position: { x: 0, y: 0, z: 0 },
                                size: { x: 1.2, y: 0.6, z: 1.2 },
                                rotation: { x: 0, y: 0, z: 0 },
                                opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
                            },
                        ],
                        connections: [{ type: "quantenbindung", partA: 0, partB: 1 }],
                        xZukunftHuelle: { schema: "v2", merkmale: ["zeit", "raum"] },
                    },
                ],
                tools: [],
            };
            localStorage.setItem(r.worldStorageKey("zeit-v25"), JSON.stringify(futureSave));
            const imp = r.importRecipesFromWorld("zeit-v25");
            out.importOk = !!(imp && imp.ok);
            const bp = r.state.blueprints["zeit_artefakt"];
            const mat = r.state.materials["aetherglas"];
            out.bpLives = !!bp;
            out.matLives = !!mat;
            if (!bp || !mat) return out;
            // (1) must-preserve: die Zukunft überlebt bit-gleich + reist im Re-Export.
            out.hullPreserved =
                bp.v === 2 &&
                !!bp.xZukunftHuelle &&
                bp.xZukunftHuelle.schema === "v2" &&
                bp.parts[0].xDim === 4 &&
                mat.tags["leuchtkraft"] === 0.9 &&
                mat.tags["x:v25:aether"] === 1.2 &&
                !!mat.xV25;
            const reexport = r._serializeBlueprint(bp);
            out.reexportPreserves =
                reexport.v === 2 &&
                !!reexport.xZukunftHuelle &&
                reexport.parts[0].xDim === 4 &&
                Array.isArray(reexport.connections) &&
                reexport.connections.length === 1 &&
                reexport.connections[0].type === "quantenbindung";
            // (2) Behauptung/Wahrheit: die V25-Rolle ist Metadatum, lokal emergiert.
            out.claimSeparated = bp.roleClaimed === "chronowerk" && bp.role !== "chronowerk" && !!bp.role;
            // (3) must-ignore: die Lesarten degradieren GRACEFUL — Rolle/Kosten/
            // Stats/Widerstand sind endlich, der unbekannte Shape trägt nichts bei.
            const cost = r.computeBuildCost(bp);
            out.costFinite = !!cost && Object.values(cost).every((v) => Number.isFinite(v) && v >= 0);
            const tags = r.computeCompoundTags(bp);
            out.tagsFinite = Object.values(tags).every((v) => Number.isFinite(v));
            out.unknownTagIgnored = tags["leuchtkraft"] === undefined && tags["x:v25:aether"] === undefined;
            const fit = r._harvestFitnessFromResist(r._architectureResistance({ type: "zeit_artefakt" }));
            out.fitFinite = Number.isFinite(fit.fit) && fit.fit > 0;
            // (4) das WERK degradiert sichtbar: der unbekannte Shape baut (Box-
            // Fallback) — die Gruppe trägt beide Parts.
            let built = null;
            try {
                built = r._buildFromBlueprint(bp);
            } catch (_e) {
                built = null;
            }
            out.buildsGraceful = !!built && built.children && built.children.length >= 2;
            // (5) die unbekannte Verbindung lebt (must-preserve) und die
            // typ-gebundene Lesart ignoriert sie (Strength → 0).
            out.connPreserved = bp.connections.length === 1 && bp.connections[0].type === "quantenbindung";
            out.connStrengthZero = r.computeConnectionStrength(bp.connections[0], bp) === 0;
            return out;
        })
        .catch((e) => ({ err: String(e).split("\n")[0] }));

    if (res.err) {
        check("der Zukunfts-Empfang lief", false, res.err);
    } else {
        check(
            "der Import nimmt den V25-Bauplan an (kein Ablehnen von Unbekanntem)",
            !!res.importOk && !!res.bpLives && !!res.matLives
        );
        check("must-preserve: v:2-Hülle · xDim · leuchtkraft · x:v25-Tag · xV25 leben bit-gleich", !!res.hullPreserved);
        check("der Re-Export trägt die Zukunft weiter (ein V18-Relay strippt V25 nicht)", !!res.reexportPreserves);
        check("Behauptung/Wahrheit: roleClaimed=chronowerk, die lokale Rolle emergiert", !!res.claimSeparated);
        check(
            "must-ignore: Kosten/Tags/Abbau endlich, unbekannte Achsen tragen nicht bei",
            !!res.costFinite && !!res.tagsFinite && !!res.unknownTagIgnored && !!res.fitFinite
        );
        check("das Werk BAUT graceful (unbekannter Shape → Box-Degradation, beide Parts)", !!res.buildsGraceful);
        check(
            "die unbekannte Verbindung reist (must-preserve) + resoniert nicht (must-ignore)",
            !!res.connPreserved && !!res.connStrengthZero
        );
    }
    const fatal = pageErrors.filter((e) => !/favicon|Manifest/i.test(e));
    check("0 page-errors — die Zukunft riss nichts", fatal.length === 0, fatal[0] || "");

    await browser.close();
    await new Promise((r) => server.close(r));
    if (failures.length) {
        console.log(`\n❌ ${failures.length} Sonde(n) rot — das Zeit-Portal trägt noch nicht.`);
        process.exit(1);
    }
    console.log("\n✅ DAS ZEIT-PORTAL TRÄGT — der heutige Build versteht die Zukunft (gemessen, nicht behauptet).");
    process.exit(0);
})();
