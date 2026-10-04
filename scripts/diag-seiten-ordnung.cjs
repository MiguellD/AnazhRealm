// diag-seiten-ordnung.cjs — DIE SEITEN-WAND (npm run gate:seiten-ordnung).
//
// Befund 04.10. (echte GPU, Radeon 890M, Mess-Wiese): der Welt-March kostete 13–17 ms je Frame. Die Feld-Slots
// fielen in Erzeugungs-Reihenfolge (`freiFelder.pop()`), die Hüllen der 32er-Seiten spannten 200–900 m — fast
// jeder Strahl traf ~22 Seiten und testete Hunderte Einträge, in Index-Reihenfolge, ohne frühes Ende. Die
// Heilung sitzt im Welt-March-Organ: `_weltSeitenOrdnen` sortiert die Einträge räumlich (Hilbert, große Hüllen in
// eigene Seiten), `_weltSeitenFolge` reicht die belegten Seiten nah→fern mit ihrem Box-Abstand, der Shader
// bricht ab, sobald der Abstand hinter dem besten Treffer liegt (gemessen: Welt-March ~0 ms, Bild gleich).
//
// Diese Linse (Null-Renderer, GPU-frei) fährt die ECHTEN Organ-Methoden auf synthetischen Einträgen:
//   O1  jeder Eintrag reist mit seinem Handle (Daten am neuen Slot == Daten vorher, handles[feld] === handle)
//   O2  kein Slot doppelt, die Obergrenze ist eng
//   O3  die Seiten werden ENG (mittlere Hülle der normalen Seiten < 1/2,5 von vorher und < 2× die ideale Kante
//       √(Fläche/Seiten); Läufe einer raumfüllenden Kurve aus Zufallspunkten liegen bei ~1,75×)
//   O4  große Hüllen teilen keine Seite mit normalen
//   F1  die Folge ist aufsteigend, enthält jede belegte Seite und ist eine UNTERE Schranke (≤ echter Box-Abstand)
//   K1  Konsum: der Tick ordnet + reicht die Folge, der Shader liest sie und bricht ab
//   K2  die Kapsel-Liste liegt 2D (Breite ≤ 8192, ≥ 8192 Kapseln), der Shader liest nur über kapselTexel
//   S1  Selbsttest: verwürfelte Seiten sind weit (O3 feuert); S2: ein Umzug ohne Handle-Nachzug bricht O1
//
//   node scripts/diag-seiten-ordnung.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.SEITEN_PORT || 4575);
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

// Seiten-Probe: N Einträge in zufälliger Erzeugungs-Reihenfolge über ±300 m (spieldicht) (dazu große Hüllen und Lücken),
// dann `modus`: "ordnen" (das Organ) · "wuerfeln" (Selbsttest S1) · "ohneHandle" (Selbsttest S2).
function probe(modus) {
    const r = window.anazhRealm;
    const T = window.THREE;
    const W = r.constructor.WELT_MARCH;
    r.state.weltMarch = null;
    const wm = r._weltMarchEnsure();
    let s = 12345;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    // Die Einträge sind ECHTE Analog-Sätze über den Chokepoint _weltKapselSpawn (seit V18.528 die einzige Payload):
    // je Größe EIN Box-Satz, geteilt per Dedup wie im Spiel.
    const klein = "seiten-probe:klein";
    const gross = "seiten-probe:gross";
    const box = (g) => () => [{ box: true, c: new T.Vector3(g[0] / 2, g[1] / 2, g[2] / 2), h: new T.Vector3(g[0] / 2, g[1] / 2, g[2] / 2) }];
    const handles = [];
    const M = new T.Matrix4();
    for (let i = 0; i < 900; i++) {
        const gr = i % 60 === 0;
        M.makeTranslation((rnd() - 0.5) * 600, rnd() * 20, (rnd() - 0.5) * 600);
        handles.push(r._weltKapselSpawn(gr ? gross : klein, M, box(gr ? [220, 30, 180] : [4, 8, 4])));
    }
    for (let i = 0; i < handles.length; i += 7) r._weltFeldFrei(handles[i]); // Lücken wie im Spiel
    const leben = handles.filter((h, i) => i % 7 !== 0);
    r._weltSeitenPflegen(wm);
    const L = wm.listeDaten;
    const S = wm.seitenDaten;
    const huelle = () => {
        let b = 0,
            k = 0;
        for (let p = 0; p < Math.ceil(wm.obergrenze / W.seite); p++) {
            const so = p * 8;
            let normal = false;
            for (let q = 0; q < W.seite; q++) {
                const h = wm.handles[p * W.seite + q];
                if (h && h.brick.key === klein) normal = true;
            }
            if (S[so + 3] > 0 && normal) {
                b += Math.max(S[so + 4] - S[so], S[so + 6] - S[so + 2]);
                k++;
            }
        }
        return b / Math.max(1, k);
    };
    const vorher = huelle();
    const schnapp = new Map(leben.map((h) => [h, Array.from(L.subarray(h.feld * 32, h.feld * 32 + 32))]));
    if (modus === "ordnen") r._weltSeitenOrdnen(wm);
    else if (modus === "ohneHandle") {
        // S2: die Daten ziehen um, die Handles NICHT (der Bruch, den O1 fangen muss)
        const alt = L.slice(0, wm.obergrenze * 32);
        let slot = 0;
        L.fill(0, 0, wm.obergrenze * 32);
        for (const h of leben) L.set(alt.subarray(h.feld * 32, h.feld * 32 + 32), slot++ * 32);
    }
    r._weltSeitenPflegen(wm);
    const nachher = huelle();
    // O1/O2
    let reist = 0,
        doppelt = 0;
    const belegt = new Set();
    for (const h of leben) {
        const jetzt = Array.from(L.subarray(h.feld * 32, h.feld * 32 + 32));
        if (jetzt.every((v, i) => v === schnapp.get(h)[i]) && wm.handles[h.feld] === h) reist++;
        if (belegt.has(h.feld)) doppelt++;
        belegt.add(h.feld);
    }
    // O4
    let gemischt = 0;
    for (let p = 0; p < Math.ceil(wm.obergrenze / W.seite); p++) {
        let n = 0,
            g = 0;
        for (let q = 0; q < W.seite; q++) {
            const h = wm.handles[p * W.seite + q];
            if (!h) continue;
            if (h.brick.key === gross) g++;
            else n++;
        }
        if (n > 0 && g > 0) gemischt++;
    }
    // F1
    const cam = new T.Vector3(37, 5, -81);
    const nF = r._weltSeitenFolge(wm, cam);
    const O = wm.folgeDaten;
    let aufsteigend = true,
        schranke = true;
    const inFolge = new Set();
    for (let i = 0; i < nF; i++) {
        const p = O[i * 4];
        const d = O[i * 4 + 1];
        inFolge.add(p);
        if (i > 0 && d < O[(i - 1) * 4 + 1]) aufsteigend = false;
        const so = p * 8;
        const dx = Math.max(S[so] - cam.x, 0, cam.x - S[so + 4]);
        const dy = Math.max(S[so + 1] - cam.y, 0, cam.y - S[so + 5]);
        const dz = Math.max(S[so + 2] - cam.z, 0, cam.z - S[so + 6]);
        if (d > Math.hypot(dx, dy, dz) + 1e-6) schranke = false;
    }
    let belegteSeiten = 0;
    for (let p = 0; p < Math.ceil(wm.obergrenze / W.seite); p++) if (S[p * 8 + 3] > 0 && inFolge.has(p)) belegteSeiten++;
    let alleBelegt = 0;
    for (let p = 0; p < Math.ceil(wm.obergrenze / W.seite); p++) if (S[p * 8 + 3] > 0) alleBelegt++;
    return {
        leben: leben.length,
        reist,
        doppelt,
        obergrenze: wm.obergrenze,
        ideal: Math.round(Math.sqrt((600 * 600) / Math.ceil(leben.filter((h) => h.brick.key === klein).length / W.seite))),
        vorher: Math.round(vorher),
        nachher: Math.round(nachher),
        gemischt,
        nF,
        aufsteigend,
        schranke,
        folgeVoll: belegteSeiten === alleBelegt && nF === alleBelegt,
        tick: String(r._tickFeldPass),
        pass: String(r._feldPassEnsure),
        kapselBreite: wm.kapseln.image.width,
        kapselHoehe: wm.kapseln.image.height,
        kapselKap: W.kapseln,
    };
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
            () => window.anazhRealm && typeof window.anazhRealm._weltSeitenOrdnen === "function" && window.THREE,
            { timeout: 120000 }
        );
        const a = await page.evaluate(probe, "ordnen");
        console.log(`=== Seiten-Wand: ${a.leben} Einträge (Erzeugungs-Reihenfolge, Lücken, große Hüllen) ===`);
        check("O1 jeder Eintrag reist mit seinem Handle", a.reist === a.leben, `${a.reist}/${a.leben}`);
        check("O2 kein Slot doppelt, Obergrenze eng", a.doppelt === 0 && a.obergrenze < a.leben + 32, `${a.obergrenze}`);
        check(
            "O3 die normalen Seiten werden eng",
            a.nachher < a.vorher / 2.5 && a.nachher < 2 * a.ideal,
            `mittlere Hülle ${a.vorher} m → ${a.nachher} m (ideal ${a.ideal} m)`
        );
        check("O4 große Hüllen teilen keine Seite mit normalen", a.gemischt === 0, `${a.gemischt} gemischte Seiten`);
        check(
            "F1 die Folge: aufsteigend, vollständig, untere Schranke",
            a.aufsteigend && a.folgeVoll && a.schranke,
            `${a.nF} Seiten`
        );
        check(
            "K1 der Tick ordnet und reicht die Folge, der Shader bricht an ihr ab",
            /_weltSeitenOrdnen\(/.test(a.tick) &&
                /_weltSeitenFolge\(/.test(a.tick) &&
                /if \(fo\.y >= bestT\) \{ break; \}/.test(a.pass) &&
                /folge: TSL\.texture\(wm\.folge\)/.test(a.pass)
        );
        check(
            "K2 die Kapsel-Liste liegt 2D im WebGPU-Limit, der Shader liest nur über kapselTexel",
            a.kapselBreite <= 8192 &&
                a.kapselHoehe > 1 &&
                a.kapselBreite * a.kapselHoehe === a.kapselKap * 2 &&
                a.kapselKap >= 8192 &&
                /kapselTexel\(kapseln, /.test(a.pass) &&
                !/textureLoad\(kapseln, /.test(a.pass),
            `${a.kapselBreite}×${a.kapselHoehe} Texel, ${a.kapselKap} Kapseln`
        );
        const w = await page.evaluate(probe, "wuerfeln");
        const h = await page.evaluate(probe, "ohneHandle");
        console.log("=== Selbsttest ===");
        check("S1 ungeordnete Seiten sind weit (O3 feuert)", !(w.nachher < w.vorher / 2.5 && w.nachher < 2 * w.ideal), `${w.nachher} m`);
        check("S2 Umzug ohne Handle-Nachzug bricht O1", h.reist < h.leben, `${h.reist}/${h.leben}`);
        check("keine Page-Errors", pageErrors.length === 0, pageErrors.slice(0, 2).join(" | "));
    } catch (e) {
        check("Lauf", false, (e && e.message) || String(e));
    }
    await browser.close();
    server.close();
    console.log(ok ? "GRÜN seiten-ordnung" : "ROT seiten-ordnung");
    process.exit(ok ? 0 : 1);
})();
