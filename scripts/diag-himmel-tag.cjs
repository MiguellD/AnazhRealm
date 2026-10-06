// diag-himmel-tag.cjs — DIE HIMMELSKÖRPER-TAG-PROBE (V18.530): am Mittag steht kein Punkt am Himmel.
// Befund 04.10. (Blick-Tour 7-birke.png, echte GPU): eine PINKE Scheibe am Mittagshimmel — einer von drei
// Planeten aus Math.random (Kugeln 10–30 m auf 400 m = 3–8° Durchmesser, 6–16 Monde breit, Zufallsfarbe,
// MeshBasic: unbeleuchtet, Tag wie Nacht voll sichtbar). Jetzt sind die Wandelsterne die hellsten PUNKTE des
// Sternfelds, und die Dämmerung setzt die Grenzgröße (`_himmelGrenzgroesse`): ein Punkt leuchtet nur, wenn er
// heller ist als sie. Die Linse liest DIESELBEN Größen, die der Stern-Knoten liest (`aMag` · `grenze`):
//   1 KÖRPER   am Himmel hängen nur Sonne und Mond (skyOffset) — keine Kugel ohne Gesetz
//   2 MITTAG   kein Punkt des Sternfelds sichtbar (auch kein Wandelstern)
//   3 DÄMMERUNG bei Sonnenuntergang leuchtet der Abendstern (Venus), die schwachen Sterne nicht
//   4 NACHT    um Mitternacht leuchten alle Punkte
//   5 MOND     am Tag blass (Deckung < 0,5), nachts fast deckend (> 0,85)
//   6 ZEICHNEN das Sternfeld zeichnet genau dann, wenn ein Punkt sichtbar ist, und in EINEM Durchgang (Welle 6: mittags
//              zog es zwei GPU-Befehle für ein schwarzes Bild — DoubleSide-durchscheinend sind in r184 zwei Durchgänge)
// --selftest: eine injizierte Himmelskugel, eine zu tiefe Mittags-Grenzgröße und ein Sternfeld in zwei Durchgängen
// müssen beim Namen rot werden.
//   node scripts/diag-himmel-tag.cjs [--selftest]
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.HIMMEL_PORT || 4595);
const SELFTEST = process.argv.includes("--selftest");
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
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

function probe(stoerung) {
    const r = window.anazhRealm;
    const st = r.state;
    const T = window.THREE;
    const sauber = { grenze: r._himmelGrenzgroesse };
    let kugel = null;
    if (stoerung === "kugel") {
        kugel = new T.Mesh(new T.SphereGeometry(20, 8, 8), new T.MeshBasicMaterial({ color: 0xff66cc }));
        kugel.userData.skyOffset = new T.Vector3(200, 300, 100);
        st.scene.add(kugel);
    }
    if (stoerung === "grenze") r._himmelGrenzgroesse = () => -3;
    if (stoerung === "doppel" && st.starField) st.starField.material.forceSinglePass = false;
    const zeit = (t) => {
        st.timeOfDay = t;
        if (st.world) st.world.timeOfDay = t;
        r._setWeather("sunny");
        st.weatherTransition = null;
        r._applyDayNightToScene();
    };
    const sf = st.starField;
    const mags = sf ? sf.geometry.getAttribute("aMag") : null;
    const U = st.starFieldUniforms;
    const sichtbar = () => {
        let n = 0;
        let venus = false;
        const g = U.grenze.value;
        for (let i = 0; i < mags.count; i++) {
            const v = Math.max(0, Math.min(1, g - mags.getX(i) + 0.5));
            if (v > 0.001) n++;
            if (i === mags.count - r.constructor.HIMMEL.wandelsterne.length && v > 0.5) venus = true;
        }
        return { n, venus, grenze: +g.toFixed(2) };
    };
    const out = { punkte: mags ? mags.count : 0 };
    const koerper = [];
    st.scene.traverse((o) => {
        if (o.userData && o.userData.skyOffset && o !== st.sunMesh && o !== st.moonMesh) koerper.push(o.type);
    });
    out.fremdeKoerper = koerper.length;
    out.planetenFort = st.planets === undefined && r._buildSkyPlanets === undefined;
    zeit(0.5);
    out.mittag = sichtbar();
    out.mittag.zeichnet = !!(sf && sf.visible);
    out.mondTag = +st.moonMesh.material.opacity.toFixed(3);
    // Sonnenuntergang: Sonne knapp unter dem Horizont (−1°)
    zeit(0.75 + 1 / 360);
    out.daemmerung = sichtbar();
    zeit(0);
    out.nacht = sichtbar();
    out.nacht.zeichnet = !!(sf && sf.visible);
    out.mondNacht = +st.moonMesh.material.opacity.toFixed(3);
    out.einDurchgang = !!(sf && sf.material.forceSinglePass === true);
    if (kugel) st.scene.remove(kugel);
    if (stoerung === "doppel" && sf) sf.material.forceSinglePass = true;
    r._himmelGrenzgroesse = sauber.grenze;
    zeit(0.5);
    return out;
}

function urteil(S) {
    const rot = [];
    if (S.fremdeKoerper > 0 || !S.planetenFort)
        rot.push(`1 KÖRPER: ${S.fremdeKoerper} Kugel(n) ohne Gesetz am Himmel (planetenFort=${S.planetenFort})`);
    if (!(S.punkte > 1000)) rot.push(`Sternfeld fehlt (${S.punkte} Punkte mit Größenklasse)`);
    if (S.mittag.n !== 0) rot.push(`2 MITTAG: ${S.mittag.n} Punkte sichtbar (Grenzgröße ${S.mittag.grenze})`);
    if (!(S.daemmerung.venus && S.daemmerung.n < S.punkte * 0.05))
        rot.push(
            `3 DÄMMERUNG: Abendstern ${S.daemmerung.venus ? "da" : "fehlt"}, ${S.daemmerung.n} Punkte (Grenze ${S.daemmerung.grenze})`
        );
    if (!(S.nacht.n === S.punkte)) rot.push(`4 NACHT: nur ${S.nacht.n}/${S.punkte} Punkte (Grenze ${S.nacht.grenze})`);
    if (!(S.mondTag < 0.5 && S.mondNacht > 0.85)) rot.push(`5 MOND: Tag ${S.mondTag} · Nacht ${S.mondNacht}`);
    if (S.mittag.n === 0 && S.mittag.zeichnet)
        rot.push(
            "6 ZEICHNEN: mittags zeichnet das Sternfeld ohne einen sichtbaren Punkt (Befehle für ein schwarzes Bild)"
        );
    if (S.nacht.n > 0 && !S.nacht.zeichnet)
        rot.push(`6 ZEICHNEN: nachts zeichnet das Sternfeld nicht (${S.nacht.n} Punkte)`);
    if (!S.einDurchgang) rot.push("6 ZEICHNEN: das Sternfeld zeichnet in zwei Durchgängen (forceSinglePass fehlt)");
    return rot;
}

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 120000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const dl = performance.now() + 60000;
        while (
            (!window.anazhRealm ||
                !window.anazhRealm.state ||
                !window.anazhRealm.state.starField ||
                typeof window.anazhRealm._gameLoopTick !== "function") &&
            performance.now() < dl
        )
            await new Promise((r) => setTimeout(r, 100));
    });
    const S = await page.evaluate(probe, null);
    let selbst = null;
    if (SELFTEST) {
        const kugel = urteil(await page.evaluate(probe, "kugel"));
        const grenze = urteil(await page.evaluate(probe, "grenze"));
        const doppel = urteil(await page.evaluate(probe, "doppel"));
        const heil = urteil(await page.evaluate(probe, null));
        selbst = {
            kugelRot: kugel.some((e) => e.startsWith("1 KÖRPER")),
            grenzeRot: grenze.some((e) => e.startsWith("2 MITTAG")),
            doppelRot: doppel.some((e) => e.startsWith("6 ZEICHNEN")),
            heilGruen: heil.length === 0,
            kugel: kugel[0] || "-",
            grenze: grenze[0] || "-",
            doppel: doppel[0] || "-",
        };
    }
    await browser.close();
    server.close();

    console.log("=== DIE HIMMELSKÖRPER-TAG-PROBE (V18.530) ===");
    console.log(`  Sternfeld: ${S.punkte} Punkte mit Größenklasse · fremde Himmels-Kugeln: ${S.fremdeKoerper}`);
    console.log(
        `  Mittag:     ${S.mittag.n} Punkte sichtbar (Grenzgröße ${S.mittag.grenze}) · Feld zeichnet: ${S.mittag.zeichnet}` +
            ` · ein Durchgang: ${S.einDurchgang}`
    );
    console.log(
        `  Dämmerung:  ${S.daemmerung.n} Punkte, Abendstern ${S.daemmerung.venus ? "sichtbar" : "fehlt"} (Grenze ${S.daemmerung.grenze})`
    );
    console.log(`  Mitternacht: ${S.nacht.n} Punkte (Grenze ${S.nacht.grenze})`);
    console.log(`  Mond-Deckung: Tag ${S.mondTag} · Nacht ${S.mondNacht}`);
    const rot = urteil(S);
    if (pageErrors.length) rot.push("Seiten-Fehler: " + pageErrors[0]);
    if (selbst) {
        console.log(`  Selbsttest: Himmelskugel → ${selbst.kugel}`);
        console.log(`  Selbsttest: Mittags-Grenze −3 → ${selbst.grenze}`);
        if (!selbst.kugelRot) rot.push("SELBSTTEST: die injizierte Himmelskugel blieb grün");
        if (!selbst.grenzeRot) rot.push("SELBSTTEST: die zu tiefe Mittags-Grenze blieb grün");
        console.log(`  Selbsttest: zwei Durchgänge → ${selbst.doppel}`);
        if (!selbst.doppelRot) rot.push("SELBSTTEST: das Sternfeld in zwei Durchgängen blieb grün");
        if (!selbst.heilGruen) rot.push("SELBSTTEST: nach der Heilung nicht grün");
    }
    if (rot.length) {
        console.error("\nROT:");
        for (const e of rot) console.error("  • " + e);
        process.exit(1);
    }
    console.log("\nGRÜN — der Mittagshimmel ist leer, die Dämmerung zeigt den Abendstern, die Nacht alle Sterne.");
    process.exit(0);
})().catch((e) => {
    console.error("Himmel-Tag-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
