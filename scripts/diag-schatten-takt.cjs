// diag-schatten-takt.cjs — DIE SCHATTEN-WAND (npm run gate:schatten-takt).
//
// Befund 04.10. (echte GPU, Profil): beide CSM-Kaskaden renderten JEDEN Frame (updateShadow ~9,5 ms CPU). Der
// Schatten-Cache (V18.264) schrieb `renderer.shadowMap.needsUpdate` — r184 liest das nicht; der EINE Leser ist
// `ShadowNode.updateBefore` mit `shadow.needsUpdate || shadow.autoUpdate` je Licht (Vendor-Anker). Die Heilung:
// `_loopShadowUpdate` fährt je Kaskade den echten Leser (nah im Regler-Takt ≤ nahMax, fern im fernFaktor-Takt).
//
// Diese Linse (Null-Renderer, GPU-frei) fährt den ECHTEN `_loopShadowUpdate` gegen Schein-Kaskaden und zählt:
//   T1  autoUpdate ist an jeder Kaskade AUS (sonst renderte sie trotzdem jeden Frame)
//   T2  Regler-Intervall 1: die nahe Kaskade jeden Frame, die ferne jeden fernFaktor-ten
//   T3  Regler-Intervall 4: die nahe höchstens jeden nahMax-ten (laufende Tiere werfen nah), die ferne seltener
//   T4  ein Sonnen-Sprung erzwingt beide im selben Takt
//   T5  ohne CSM trägt das Haupt-Licht die EINE Map im Nah-Takt
//   T6  `_schattenAlleNeu` markiert jede Kaskade (die Werkzeuge vor einer Aufnahme)
//   S1  Selbsttest: mit dem alten Schreiber (renderer.shadowMap.needsUpdate) als _loopShadowUpdate wird KEINE
//       Kaskade markiert und autoUpdate bleibt an — T1/T2 fielen
//
//   node scripts/diag-schatten-takt.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.SCHATTEN_PORT || 4576);
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".css": "text/css",
    ".png": "image/png",
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

function probe() {
    const r = window.anazhRealm;
    const st = r.state;
    const T = r.constructor.SCHATTEN_TAKT;
    const echtCsm = st.csmNode;
    const echtDl = st.directionalLight;
    const echtIv = st._shadowMinInterval;
    const kaskade = () => ({ shadow: { autoUpdate: true, needsUpdate: false } });
    const sonne = { position: { x: 10, y: 200, z: 10 } };
    const lauf = (lichter, n) => {
        const z = lichter.map(() => 0);
        for (let i = 0; i < n; i++) {
            lichter.forEach((l) => (l.shadow.needsUpdate = false));
            r._loopShadowUpdate();
            lichter.forEach((l, k) => l.shadow.needsUpdate && z[k]++);
        }
        return z;
    };
    const aus = {};
    try {
        // T1/T2 — CSM, Regler-Intervall 1
        const k = [kaskade(), kaskade()];
        st.csmNode = { lights: k };
        st.directionalLight = sonne;
        st._shadowMinInterval = 1;
        r._shadowLast = null;
        r._shadowFrame = 0;
        lauf(k, 1); // Sonnen-Erstlauf
        aus.t2 = lauf(k, 30);
        aus.t1 = k.every((l) => l.shadow.autoUpdate === false);
        // T3 — Regler-Intervall 4
        st._shadowMinInterval = 4;
        aus.t3 = lauf(k, 60);
        // T4 — Sonnen-Sprung
        st._shadowMinInterval = 4;
        lauf(k, 3);
        sonne.position.x += 100;
        k.forEach((l) => (l.shadow.needsUpdate = false));
        r._loopShadowUpdate();
        aus.t4 = k.map((l) => l.shadow.needsUpdate);
        // T5 — ohne CSM
        st.csmNode = null;
        const dl = Object.assign(kaskade(), { position: sonne.position });
        st.directionalLight = dl;
        st._shadowMinInterval = 1;
        r._shadowLast = null;
        aus.t5 = lauf([dl], 20)[0];
        aus.t5aus = dl.shadow.autoUpdate === false;
        // T6
        const k6 = [kaskade(), kaskade()];
        k6.forEach((l) => (l.shadow.needsUpdate = false));
        st.csmNode = { lights: k6 };
        r._schattenAlleNeu();
        aus.t6 = k6.every((l) => l.shadow.needsUpdate === true);
        aus.quelle = String(r._loopShadowUpdate);
        // S1 — der alte Schreiber (V18.264: nur renderer.shadowMap.needsUpdate) gegen dieselben Schein-Kaskaden:
        // keine wird markiert, autoUpdate bleibt an — T1/T2 müssen an ihm scheitern
        const k7 = [kaskade(), kaskade()];
        st.csmNode = { lights: k7 };
        const smSchein = { needsUpdate: false };
        r._loopShadowUpdate = function () {
            smSchein.needsUpdate = true;
        };
        try {
            const z7 = lauf(k7, 30);
            aus.s1 = { z: z7, auto: k7.every((l) => l.shadow.autoUpdate === true) };
        } finally {
            delete r._loopShadowUpdate;
        }
    } finally {
        st.csmNode = echtCsm;
        st.directionalLight = echtDl;
        st._shadowMinInterval = echtIv;
        r._shadowLast = null;
    }
    aus.T = T;
    return aus;
}

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.message || String(e)).split("\n")[0]));
    let ok = true;
    const check = (name, cond, detail) => {
        console.log(`  ${cond ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
        if (!cond) ok = false;
    };
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForFunction(
            () => window.anazhRealm && typeof window.anazhRealm._loopShadowUpdate === "function" && window.THREE,
            { timeout: 120000 }
        );
        const a = await page.evaluate(probe);
        const T = a.T;
        console.log(`=== Schatten-Wand: nahMax ${T.nahMax} · fernFaktor ${T.fernFaktor} ===`);
        check("T1 autoUpdate ist an jeder Kaskade aus", a.t1);
        check(
            "T2 Intervall 1: nah jeden Frame, fern jeden fernFaktor-ten",
            a.t2[0] === 30 && a.t2[1] === 30 / T.fernFaktor,
            `30 Frames → ${a.t2.join(" / ")}`
        );
        check(
            "T3 Intervall 4: nah höchstens jeden nahMax-ten, fern im 4×fernFaktor-Takt",
            a.t3[0] === 60 / Math.min(T.nahMax, 4) && a.t3[1] === 60 / (4 * T.fernFaktor),
            `60 Frames → ${a.t3.join(" / ")}`
        );
        check("T4 ein Sonnen-Sprung erzwingt beide", a.t4[0] === true && a.t4[1] === true);
        check("T5 ohne CSM: das Haupt-Licht im Nah-Takt", a.t5 === 20 && a.t5aus, `20 Frames → ${a.t5}`);
        check("T6 _schattenAlleNeu markiert jede Kaskade", a.t6);
        check(
            "S1 Selbsttest: der alte Schreiber markiert keine Kaskade (T2 0/0) und lässt autoUpdate an (T1 fiele)",
            a.s1.z[0] === 0 && a.s1.z[1] === 0 && a.s1.auto,
            `${a.s1.z.join(" / ")}`
        );
        check(
            "Absenz: _loopShadowUpdate schreibt nicht mehr renderer.shadowMap.needsUpdate",
            !/shadowMap\.needsUpdate\s*=/.test(a.quelle)
        );
        check("keine Page-Errors", pageErrors.length === 0, pageErrors.slice(0, 2).join(" | "));
    } catch (e) {
        check("Lauf", false, (e && e.message) || String(e));
    }
    await browser.close();
    server.close();
    console.log(ok ? "GRÜN schatten-takt" : "ROT schatten-takt");
    process.exit(ok ? 0 : 1);
})();
