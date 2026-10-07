// diag-luft-sicht.cjs — DIE SICHTWEITE-PROBE (V18.530): die Luft ist Physik, keine Wand.
// Befund 04.10. (Blick-Tour, echte GPU, Mess-Wiese): der Nebel war eine lineare Wand an der Wald-Kante
// (`fog.far = foliageRadius`, unter Last 60 m) — aus 45 m Höhe nach ~100 m nur Grau-Blau, die gebaute
// Fernform (Fern-Ring bis 8 km, Feld-Pass bis 40 km) lag unsichtbar dahinter. Jetzt trägt die Ferne die
// Funktion und die EINE Luftperspektive (`_luftEnsure` → `scene.fogNode`) dunstet sie nach Koschmieder.
//
// Die Linse liest DIESELBEN Uniforms, die der Luft-Knoten jedes Materials liest (`_luftSichtM` =
// −ln 0,02 / β(y), für einen waagrechten Strahl exakt die Knoten-Formel), nach dem echten Tag-Nacht-
// Schreiber (`_applyDayNightToScene`) bei Sonne · Mittag · Sommer:
//   1 KNOTEN   scene.fogNode steht, kein THREE.Fog daneben (kein linearer Zwilling)
//   2 SICHT    klarer Sommertag: Sichtweite in Augenhöhe ≥ 5 km (Gelände-Silhouetten)
//   3 WETTER   Regen dichter als Sonne, Sturm dichter als Regen — und keine Wand (Sturm ≥ 500 m)
//   4 HÖHE     aus 500 m über dem Auge reicht die Sicht weiter (Höhen-Dunst, Skalenhöhe)
//   5 KANTE    die Ring-Kante liegt klar (Transmission ≥ 0,9), die Fern-Ring-Kante (8 km) sichtbar (> 2 %)
//   6 WASSER   unter Wasser trägt dieselbe Formel die Trübung (Sicht ≤ 60 m)
//   7 ABSENZ   die Nebel-Kulisse ist ganz fort (Wald-Kanten-Kopplung, Lade-Nebel, Höhen-Öffnung, Höhen-Melt)
// --selftest: eine injizierte 80-m-Wand (die alte Wald-Kante) und ein injizierter THREE.Fog müssen die
// Linse beim Namen rot machen.
//   node scripts/diag-luft-sicht.cjs [--selftest]
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.LUFT_PORT || 4594);
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

// Die Probe im Seiten-Kontext: misst und urteilt; `stoerung` injiziert den Täter des Selbsttests.
function probe(stoerung) {
    const r = window.anazhRealm;
    const st = r.state;
    const T = window.THREE;
    const sauber = { beta: r._luftBeta };
    if (stoerung === "wand") r._luftBeta = () => -Math.log(0.02) / 80;
    if (stoerung === "fog") st.scene.fog = new T.Fog(0x88a0c8, 20, 80);
    const pm = st.playerMesh;
    const augeY = pm ? pm.position.y + 1.6 : 30;
    const buehne = (wetter) => {
        st.autoSeason = false;
        if (typeof r.setSeason === "function") r.setSeason("sommer");
        st.timeOfDay = 0.5;
        if (st.world) st.world.timeOfDay = 0.5;
        r._setWeather(wetter);
        st.weatherTransition = null;
        st.playerEyesUnderwater = false;
        r._applyDayNightToScene();
    };
    const out = {};
    out.knoten = !!st.scene.fogNode && !st.scene.fog && st.fog === undefined && !!st.luft;
    buehne("sunny");
    out.sichtSonne = Math.round(r._luftSichtM(augeY));
    out.sichtHoch = Math.round(r._luftSichtM(augeY + 500));
    buehne("rainy");
    out.sichtRegen = Math.round(r._luftSichtM(augeY));
    buehne("stormy");
    out.sichtSturm = Math.round(r._luftSichtM(augeY));
    buehne("sunny");
    const cfg = r._voxelChunkConfig();
    const kante = (Math.max(1, st.chunkRingRadius || 4) + 0.5) * cfg.span;
    const fernKante = r.constructor.FERN_RING.schalen[r.constructor.FERN_RING.schalen.length - 1].aussen;
    const K = -Math.log(r.constructor.LUFT.kontrast);
    out.kanteM = Math.round(kante);
    out.tKante = +Math.exp((-K * kante) / out.sichtSonne).toFixed(3);
    out.tFern = +Math.exp((-K * fernKante) / out.sichtSonne).toFixed(4);
    // Unter Wasser ist, wessen AUGE unter dem Spiegel liegt — das der Kamera (Welle L, W-L-d; bis V18.531 die Augen des
    // Körpers, `playerEyesUnderwater`): die Kamera 3 m unter den Spiegel des größten Sees der Heimat-Region.
    const h = st.hydrosphere;
    const see =
        h && h.lakes
            ? h.lakes.filter((l) => l.cells && l.cells.length).sort((a, b) => b.cells.length - a.cells.length)[0]
            : null;
    const cam = st.camera;
    if (see && cam) {
        const c = see.cells[0];
        const camAlt = cam.position.clone();
        cam.position.set(
            h.originX + ((c % h.dim) + 0.5) * h.cell,
            see.level - 3,
            h.originZ + (Math.floor(c / h.dim) + 0.5) * h.cell
        );
        cam.updateMatrixWorld(true);
        r._applyDayNightToScene();
        out.sichtWasser = Math.round(r._luftSichtM(augeY));
        cam.position.copy(camAlt);
        cam.updateMatrixWorld(true);
        r._applyDayNightToScene();
    } else out.sichtWasser = -1;
    const A = r.constructor;
    const luftSrc = window.__codeOf(r._dayNightApplyHemiUndLuft);
    out.absenz = {
        waldKante: !/foliageRadius|visualEdge/.test(luftSrc),
        ladeNebel: typeof r._smoothFogEdge === "undefined" && typeof r._builtGrassRingRadius === "undefined",
        wasserFront: typeof r._builtWaterRingRadius === "undefined",
        kokon: A.AWAKEN_FOG_FAR === undefined && A.FOG_EDGE === undefined,
        hoehenOeffnung: A.FERN_RING.sichtOeffnungM === undefined,
        hoehenMelt: !st.atmoUniforms || st.atmoUniforms.hazeFar === undefined,
        alterSchreiber: typeof r._dayNightApplyHemiAndFog === "undefined",
    };
    // die Störung zurücknehmen (der Selbsttest heilt die Welt für den sauberen Lauf)
    r._luftBeta = sauber.beta;
    if (stoerung === "fog") st.scene.fog = null;
    buehne("sunny");
    return out;
}

function urteil(S) {
    const rot = [];
    if (!S.knoten) rot.push("1 KNOTEN: scene.fogNode fehlt oder ein THREE.Fog/state.fog lebt daneben (linearer Zwilling)");
    if (!(S.sichtSonne >= 5000))
        rot.push(`2 SICHT: klarer Sommertag trägt nur ${S.sichtSonne} m (< 5000) — eine Nebel-Wand lebt`);
    if (!(S.sichtRegen < S.sichtSonne && S.sichtSturm < S.sichtRegen && S.sichtSturm >= 500))
        rot.push(
            `3 WETTER: Sonne ${S.sichtSonne} · Regen ${S.sichtRegen} · Sturm ${S.sichtSturm} m — nicht monoton dichter oder eine Wand`
        );
    if (!(S.sichtHoch > S.sichtSonne)) rot.push(`4 HÖHE: aus 500 m höher ${S.sichtHoch} m ≤ am Boden ${S.sichtSonne} m`);
    if (!(S.tKante >= 0.9)) rot.push(`5 KANTE: die Ring-Kante (${S.kanteM} m) liegt im Dunst (Transmission ${S.tKante} < 0,9)`);
    if (!(S.tFern > 0.02)) rot.push(`5 KANTE: die Fern-Ring-Kante (8 km) ist verdeckt (Transmission ${S.tFern} ≤ 0,02)`);
    if (!(S.sichtWasser > 0 && S.sichtWasser <= 60)) rot.push(`6 WASSER: unter Wasser ${S.sichtWasser} m (soll ≤ 60)`);
    for (const [k, v] of Object.entries(S.absenz)) if (!v) rot.push(`7 ABSENZ: ${k} lebt noch`);
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
        // dieselbe „Code ohne Kommentare“-Quelle wie der Playtest (Absenz-Greps treffen nie Zitate)
        window.__codeOf = (fnOrSrc) =>
            String(fnOrSrc)
                .replace(/\/\/.*$/gm, "")
                .replace(/\/\*[\s\S]*?\*\//g, "");
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const dl = performance.now() + 60000;
        while (
            (!window.anazhRealm ||
                !window.anazhRealm.state ||
                !window.anazhRealm.state.luft ||
                typeof window.anazhRealm._gameLoopTick !== "function") &&
            performance.now() < dl
        )
            await new Promise((r) => setTimeout(r, 100));
    });
    const S = await page.evaluate(probe, null);
    let selbst = null;
    if (SELFTEST) {
        const wand = urteil(await page.evaluate(probe, "wand"));
        const fog = urteil(await page.evaluate(probe, "fog"));
        const heil = urteil(await page.evaluate(probe, null));
        selbst = {
            wandRot: wand.some((e) => e.startsWith("2 SICHT")),
            fogRot: fog.some((e) => e.startsWith("1 KNOTEN")),
            heilGruen: heil.length === 0,
            wand: wand[0] || "-",
            fog: fog[0] || "-",
        };
    }
    await browser.close();
    server.close();

    console.log("=== DIE SICHTWEITE-PROBE (V18.530) — Sonne · Mittag · Sommer, Koschmieder 2 % ===");
    console.log(`  Luft-Knoten (scene.fogNode, kein THREE.Fog): ${S.knoten}`);
    console.log(
        `  Sichtweite in Augenhöhe: Sonne ${S.sichtSonne} m · Regen ${S.sichtRegen} m · Sturm ${S.sichtSturm} m`
    );
    console.log(`  aus 500 m höher: ${S.sichtHoch} m · unter Wasser: ${S.sichtWasser} m`);
    console.log(`  Ring-Kante ${S.kanteM} m: Transmission ${S.tKante} · Fern-Ring-Kante 8 km: ${S.tFern}`);
    if (pageErrors.length) console.log("  Seiten-Fehler:", pageErrors.slice(0, 3));
    const rot = urteil(S);
    if (pageErrors.length) rot.push("Seiten-Fehler: " + pageErrors[0]);
    if (selbst) {
        console.log(`  Selbsttest: 80-m-Wand → ${selbst.wand}`);
        console.log(`  Selbsttest: THREE.Fog → ${selbst.fog}`);
        if (!selbst.wandRot) rot.push("SELBSTTEST: die injizierte 80-m-Wand blieb grün");
        if (!selbst.fogRot) rot.push("SELBSTTEST: der injizierte THREE.Fog blieb grün");
        if (!selbst.heilGruen) rot.push("SELBSTTEST: nach der Heilung nicht grün");
    }
    if (rot.length) {
        console.error("\nROT:");
        for (const e of rot) console.error("  • " + e);
        process.exit(1);
    }
    console.log("\nGRÜN — die Luft ist Physik: klare Sicht trägt Kilometer, die Ferne trägt die Funktion, keine Wand.");
    process.exit(0);
})().catch((e) => {
    console.error("Luft-Sicht-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
