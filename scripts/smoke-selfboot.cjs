// V18.112 — F1-BOOT-SONDE (gigant-plan §5 — G2 REKURSION, der offene Beweis):
// AnazhRealm IN AnazhRealm. Lädt das EIGENE index.html in ein echtes
// `sandbox="allow-scripts"`-iframe (null-origin — exakt die Portal-Umgebung
// des Untrusted-Welt-Tors, V8.70) und beweist die VIER F1-Schnitte end-to-end:
//   1. der localStorage-SCHATTEN greift (native Probe wirft → das In-Memory-
//      Shim shadowt die Property; ohne ihn rissen 102 Zugriffe den Boot),
//   2. der Worker läuft (Blob-Fallback ODER direkt — Chunks BAUEN),
//   3. die Vendor-Kette lädt (wasm/woff2 — Ammo bootet, sonst keine Physik),
//   4. Server-Absenz heilt still (keine ungefangenen Fehler).
// Erfolg = die innere Welt BOOTET + STREAMT Chunks + wirft keinen page-error.
// CDP (Puppeteer) kann in null-origin-Frames evaluieren — die Sonde liest die
// innere Welt direkt. Laufzeit: der iframe-Boot ist im Container minutenlang.
const http = require("http");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const ROOT = path.resolve(__dirname, "..");
const PORT = 4383;
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
    if (p === "/selfboot-host.html") {
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
        // F1-Schnitt 2 braucht fetch() der Worker-Datei aus dem null-origin → ACAO.
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
    await page.goto(`http://127.0.0.1:${PORT}/selfboot-host.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // den inneren Frame finden (null-origin — CDP evaluiert trotzdem).
    let frame = null;
    const tf0 = Date.now();
    while (Date.now() - tf0 < 20000 && !frame) {
        frame = page.frames().find((f) => f !== page.mainFrame() && /index\.html/.test(f.url()));
        if (!frame) await new Promise((r) => setTimeout(r, 250));
    }
    check("der innere Frame existiert (sandbox allow-scripts, null-origin)", !!frame);
    if (!frame) {
        await browser.close();
        server.close();
        process.exit(1);
    }

    // Schnitt 1 — der localStorage-SCHATTEN: im null-origin wirft die NATIVE
    // Property; bootet die Welt, hat das Shim sie geshadowt (own property).
    const shim = await frame
        .evaluate(() => {
            const own = Object.getOwnPropertyDescriptor(window, "localStorage");
            let usable = false;
            try {
                window.localStorage.setItem("__selfboot", "1");
                usable = window.localStorage.getItem("__selfboot") === "1";
            } catch (_e) {
                usable = false;
            }
            return { shadowed: !!own, usable };
        })
        .catch((e) => ({ err: String(e).split("\n")[0] }));
    check(
        "F1-Schnitt 3: der localStorage-Schatten greift (own-property-Shim, nutzbar)",
        !!(shim && shim.shadowed && shim.usable),
        JSON.stringify(shim)
    );

    // der BOOT: warten bis die innere Welt lebt + Chunks streamen (minutenlang).
    const t0 = Date.now();
    let boot = { ok: false };
    while (Date.now() - t0 < 240000) {
        boot = await frame
            .evaluate(() => {
                const r = window.anazhRealm;
                if (!r || !r.state) return { ok: false, stage: "kein realm" };
                return {
                    ok: !!(r.state.voxelChunks && r.state.voxelChunks.size >= 5 && r.state.renderer),
                    stage: "boot",
                    version: r.constructor && r.constructor.VERSION,
                    chunks: r.state.voxelChunks ? r.state.voxelChunks.size : 0,
                    renderer: !!r.state.renderer,
                    physics: !!r.state.physicsWorld,
                    workerEngaged: !!r.state.voxelWorker,
                };
            })
            .catch((e) => ({ ok: false, stage: "eval-fehler", err: String(e).split("\n")[0] }));
        if (boot.ok) break;
        await new Promise((r) => setTimeout(r, 2000));
    }
    console.log("  Boot-Stand:", JSON.stringify(boot));
    check("die innere Welt BOOTET (anazhRealm + Renderer + ≥5 Chunks)", !!boot.ok);
    check("F1-Schnitt 1: die Vendor-Kette trägt (Ammo-Physik lebt — wasm geladen)", !!boot.physics);
    check(
        "F1-Schnitt 2: der Voxel-Worker lebt im null-origin (Blob-Fallback) ODER der Sync-Pfad baute",
        !!boot.workerEngaged || (boot.chunks || 0) >= 5,
        `worker=${boot.workerEngaged} chunks=${boot.chunks}`
    );
    // Schnitt 4 — Server-Absenz: kein UNGEFANGENER Fehler riss den Boot.
    const fatal = pageErrors.filter((e) => !/favicon|Manifest/i.test(e));
    check("F1-Schnitt 4: keine ungefangenen Fehler (Server-Absenz heilt still)", fatal.length === 0, fatal[0] || "");

    await browser.close();
    await new Promise((r) => server.close(r));
    if (failures.length) {
        console.log(`\n❌ ${failures.length} Sonde(n) rot — die Rekursion ist noch nicht rund.`);
        process.exit(1);
    }
    console.log("\n✅ DIE REKURSION BOOTET — AnazhRealm lebt in AnazhRealm (alle vier Schnitte tragen).");
    process.exit(0);
})();
