// diag-baecker-kanal.cjs — DIE BÄCKER-KANAL-LINSE (Bäcker-Vereinigung, Studio-Seite):
// beweist, dass der Studio-Bäcker `bake-impostor` im Foundry-WEB-WORKER antwortet (nicht nur
// im iframe). Bootet den Studio-Generator als Worker (dieselben WORKER_SCRIPTS wie
// asset-worker-harness.cjs — kein zweiter Boot-Pfad), schickt EIN
// {type:"bake-impostor", presetId:"eiche", seed:7} und prüft das Reply:
//   payload != null · albedo/normal-Länge 128*256*8*4 · Atlas nicht komplett 0 ·
//   Rahmen (aspect) + Weltmass (height) endlich und > 0.
// PIXEL-WAHRHEIT: albedo/normal kommen aus gl.readRenderTargetPixels (8 Blickwinkel VERTIKAL
// gestapelt, Zeilen bottom-up) — diese Linse prüft PRÄSENZ + MASSE, nicht die Malrichtung
// (das Y-Flip-Gesetz lebt beim Konsumenten, dem Welt-Atlas).
// SELBST-TEST: synthetisch korrupte Stats (payload null · falsche Länge · Alles-0-Atlas)
// MÜSSEN rot erkannt werden — die Linse ist nicht vakuös.
//
//   node scripts/diag-baecker-kanal.cjs        (exit 0 = GRÜN, 1 = ROT, 2 = Harness-Fehler)
const fs = require("fs");
const path = require("path");
const http = require("http");
const puppeteer = require("puppeteer");
const { WORKER_SCRIPTS } = require("./lib/asset-worker-harness.cjs");

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.BAECKER_PORT || 4547);
const CORES_MANIFEST = JSON.parse(fs.readFileSync(path.join(ROOT, "cores.manifest.json"), "utf8"));
const MIME = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
    ".wasm": "application/wasm",
};

// ── DIE SOLL-ZAHLEN (die fixe Naht: __replyBakeImpostor, cw=128 ch=256 V=8) ──────────────
const SOLL = { cw: 128, ch: 256, V: 8 };
const SOLL_LEN = SOLL.cw * SOLL.ch * SOLL.V * 4; // 1.048.576 Bytes je Atlas

// Reine Prüf-Funktion (auch der Selbst-Test ruft sie) → Liste roter Befunde.
function pruefe(st) {
    const rot = [];
    if (!st || !st.got) {
        rot.push("keine impostor-Antwort vom Worker (Kanal stumm)");
        return rot;
    }
    if (st.payloadNull) {
        rot.push("payload ist null — der GL-Bäcker lief im Worker nicht (Worker-Naht gerissen)");
        return rot;
    }
    if (st.cw !== SOLL.cw || st.ch !== SOLL.ch || st.V !== SOLL.V)
        rot.push(`Zell-Masse divergieren: cw=${st.cw} ch=${st.ch} V=${st.V} (soll ${SOLL.cw}/${SOLL.ch}/${SOLL.V})`);
    if (st.albedoLen !== SOLL_LEN) rot.push(`albedo-Länge ${st.albedoLen} != ${SOLL_LEN} (cw*ch*V*4)`);
    if (st.normalLen !== SOLL_LEN) rot.push(`normal-Länge ${st.normalLen} != ${SOLL_LEN} (cw*ch*V*4)`);
    if (!(st.albedoNonNull > 0)) rot.push("albedo ist komplett 0 — der Atlas ist leer (nichts gebacken)");
    if (!(st.normalNonNull > 0)) rot.push("normal ist komplett 0 — der Normal-Atlas ist leer");
    if (!(st.aspect > 0) || !isFinite(st.aspect)) rot.push(`aspect unbrauchbar: ${st.aspect}`);
    if (!(st.height > 0) || !isFinite(st.height)) rot.push(`height unbrauchbar: ${st.height}`);
    return rot;
}

// ── SELBST-TEST: die Linse muss Rot SEHEN können (nicht vakuös) ──────────────────────────
function selbstTest() {
    const gruen = {
        got: true,
        payloadNull: false,
        cw: 128,
        ch: 256,
        V: 8,
        aspect: 0.5,
        height: 8.2,
        albedoLen: SOLL_LEN,
        normalLen: SOLL_LEN,
        albedoNonNull: 12345,
        normalNonNull: SOLL_LEN,
    };
    const faelle = [
        ["synthetisch grün -> KEIN Befund", pruefe(gruen).length === 0],
        ["payload null -> feuert", pruefe({ got: true, payloadNull: true }).length > 0],
        ["falsche albedo-Länge -> feuert", pruefe(Object.assign({}, gruen, { albedoLen: SOLL_LEN - 4 })).length > 0],
        ["Alles-0-Atlas -> feuert", pruefe(Object.assign({}, gruen, { albedoNonNull: 0 })).length > 0],
        ["kaputter Rahmen (aspect NaN) -> feuert", pruefe(Object.assign({}, gruen, { aspect: NaN })).length > 0],
    ];
    let ok = true;
    console.log("===== SELBST-TEST DER LINSE (synthetisch, GPU-frei) =====");
    for (const [name, gut] of faelle) {
        console.log(`  ${gut ? "✅" : "❌"} Selbst-Test: ${name}`);
        if (!gut) ok = false;
    }
    return ok;
}

// ── Die Worker-Seite: derselbe Boot wie asset-worker-harness (EINE Skript-Liste), plus
//    __bakeStats — schickt bake-impostor und verdichtet das Reply IN der Seite zu Zahlen
//    (die Megabyte-Atlanten überqueren die evaluate-Grenze nicht).
function pageHtml() {
    return `<!doctype html><meta charset="utf-8"><title>baecker-kanal</title><body><script>
(() => {
  const S = (window.__AW = { ready: false, error: null });
  const boot =
    "self.__PHYTO_FOUNDRY_WORKER=true;" +
    "self.__anazhCores=" + JSON.stringify(${JSON.stringify(CORES_MANIFEST)}) + ";" +
    "importScripts(" + ${JSON.stringify(WORKER_SCRIPTS)}.map((p) => JSON.stringify(location.origin + p)).join(",") + ");" +
    "init();";
  const worker = new Worker(URL.createObjectURL(new Blob([boot], { type: "text/javascript" })));
  const pending = new Map();
  let seq = 1;
  worker.onerror = (e) => { S.error = (e && e.message) || "Worker-Fehler"; };
  worker.onmessage = (ev) => {
    const m = ev.data;
    if (!m || typeof m !== "object") return;
    if (m.type === "ready" && m.world === "terrain") S.ready = true;
    const p = pending.get(m.reqId);
    if (p) { pending.delete(m.reqId); p(m); }
  };
  const ask = (msg) => new Promise((res) => {
    const reqId = "bk" + seq++;
    pending.set(reqId, res);
    worker.postMessage(Object.assign({ reqId }, msg));
  });
  const nonNull = (u) => { let n = 0; for (let i = 0; i < u.length; i++) if (u[i] !== 0) n++; return n; };
  window.__bakeStats = (presetId, seed) => ask({ type: "bake-impostor", presetId: presetId, seed: seed }).then((r) => {
    const p = r && r.payload;
    if (!p) return { got: true, payloadNull: true };
    const a = p.albedo || new Uint8Array(0), n = p.normal || new Uint8Array(0);
    return {
      got: true, payloadNull: false, presetId: r.presetId, seed: r.seed,
      cw: p.cw, ch: p.ch, V: p.V, aspect: p.aspect, height: p.height,
      albedoLen: a.length, normalLen: n.length,
      albedoNonNull: nonNull(a), normalNonNull: nonNull(n),
    };
  });
})();
</script></body>`;
}

(async () => {
    if (!selbstTest()) {
        console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuös, Abbruch.");
        process.exit(1);
    }
    const server = http.createServer((req, res) => {
        let p = req.url.split("?")[0];
        if (p === "/" || p === "/__bk.html") {
            res.setHeader("Content-Type", "text/html");
            return res.end(pageHtml());
        }
        const fp = path.join(ROOT, p);
        if (!fp.startsWith(ROOT)) return ((res.statusCode = 403), res.end());
        fs.readFile(fp, (err, data) => {
            if (err) return ((res.statusCode = 404), res.end());
            res.setHeader("Content-Type", MIME[path.extname(fp)] || "application/octet-stream");
            res.end(data);
        });
    });
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 240000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    let stats = null;
    try {
        const page = await browser.newPage();
        const meldungen = [];
        page.on("console", (m) => meldungen.push(m.text()));
        page.on("pageerror", (e) => meldungen.push("PAGEERROR: " + String((e && e.message) || e)));
        await page.goto("http://127.0.0.1:" + PORT + "/__bk.html", { waitUntil: "domcontentloaded" });
        await page.waitForFunction("window.__AW && (window.__AW.ready || window.__AW.error)", {
            timeout: 120000,
            polling: 200,
        });
        const st = await page.evaluate(() => window.__AW);
        if (st.error) throw new Error("WORKER-BOOT: " + st.error);
        stats = await page.evaluate(() => window.__bakeStats("eiche", 7));
        if (!stats || stats.payloadNull) {
            // Rot-Diagnose: die Worker-Warnung ([phyto] bake-impostor …) trägt den Grund.
            for (const m of meldungen.slice(-6)) console.error("  [seite] " + m);
        }
    } finally {
        await browser.close();
        server.close();
    }

    console.log("\n=== BÄCKER-KANAL — bake-impostor im Foundry-Worker (eiche, seed 7) ===");
    if (stats && !stats.payloadNull) {
        console.log(
            `  Reply: cw=${stats.cw} ch=${stats.ch} V=${stats.V} · albedo=${stats.albedoLen}B (nicht-0: ${stats.albedoNonNull})` +
                ` · normal=${stats.normalLen}B (nicht-0: ${stats.normalNonNull}) · aspect=${Number(stats.aspect).toFixed(3)} · height=${Number(stats.height).toFixed(2)}m`
        );
    }
    const rot = pruefe(stats);
    if (rot.length) {
        console.error("\n❌ ROT — Befunde:");
        for (const x of rot) console.error("  • " + x);
        process.exit(1);
    }
    console.log("\n✅ GRÜN — der Studio-Bäcker antwortet im Worker: voller 8-Winkel-Atlas (Albedo+Normal), Rahmen+Höhe tragfähig.");
    process.exit(0);
})().catch((e) => {
    console.error("Harness-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
