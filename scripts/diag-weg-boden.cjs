// diag-weg-boden.cjs — DIE WEG-KANTEN-PROBE (V18.530): der Siedlungs-Weg ist Boden, kein schwebendes Quad.
// Befund 04.10. (Blick-Tour 1-nord · 3-markt · 4-west, echte GPU): Straßen, Feldwege, Platz und Äcker lagen als
// flache Box-Streifen (0,14 m) des Wege-Pools auf der Gesetz-Höhe — der sichtbare Boden (Surface-Nets, ±0,2 m)
// schnitt sie: harte Kanten, schwarze Linien zwischen gekippten Segmenten, Gras durch den Weg, am Ring-Rand
// schwebend über der Leere. Jetzt malt `_stlWegeBuild` die Boden-Schichten in die Wege-Karte, die der
// Boden-Shader und die Wiese lesen. Die Linse baut eine Probe-Siedlung durch DENSELBEN Hebel und prüft:
//   1 KEIN QUAD   keine Boden-Streifen mehr als Geometrie (der Zaun-Pool trägt nur hüfthohe Zäune)
//   2 BODEN       die Karte trägt den Weg: Mitte voll, 2 m außerhalb leer; Platz und Acker in ihren Kanälen
//   3 KANTE       der Rand ist weich (an der Weg-Kante liegt ein Zwischenwert, kein Sprung 0 → 1)
//   4 KONSUM      der Boden-Shader liest die Karte (Chunk-Material), die Wiese liest das Pfad-Feld
//   5 ECKE        ein um 45° gedrehter Acker trägt seine Ecke (die Ausdehnung ist die Diagonale, kein Achteck)
//   6 FERNE       ein Weg 300 m vom Spieler steht in der Karte (die ferne Stufe der Clipmap, kein Loch hinter 120 m)
// --selftest: ein injizierter Boden-Streifen im Pool und eine harte Kante müssen beim Namen rot werden.
//   node scripts/diag-weg-boden.cjs [--selftest]
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.WEG_PORT || 4596);
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
    const A = r.constructor;
    // Ein trockener Probe-Ort nahe dem Spieler (die Wasser-Wand würde Formen verwerfen).
    const pm = st.playerMesh.position;
    let o = null;
    for (let k = 0; k < 64 && !o; k++) {
        const x = pm.x + (k % 8) * 40 - 140;
        const z = pm.z + Math.floor(k / 8) * 40 - 140;
        let trocken = true;
        for (let i = -2; i <= 2 && trocken; i++)
            for (let j = -2; j <= 2 && trocken; j++) trocken = r._isAboveWaterAt(x + i * 15, z + j * 15, 0.2);
        if (trocken) o = { x, z };
    }
    if (!o) return { fehler: "kein trockener Probe-Ort" };
    // Ein trockener Ort ~300 m vom Probe-Ort (die ferne Stufe): acht Richtungen, die erste trockene trägt den Fern-Weg.
    let fern = null;
    for (let k = 0; k < 8 && !fern; k++) {
        const a = (k / 8) * Math.PI * 2;
        const fx = Math.round(Math.cos(a) * 300);
        const fz = Math.round(Math.sin(a) * 300);
        if (r._isAboveWaterAt(o.x + fx, o.z + fz, 0.2) && r._isAboveWaterAt(o.x + fx + 30, o.z + fz, 0.2))
            fern = { x: fx, z: fz };
    }
    r._stlWegeDispose();
    const randAlt = A.WEGE_KARTE;
    if (stoerung === "hart") A.WEGE_KARTE = Object.freeze(Object.assign({}, randAlt, { randM: 0.001 }));
    const plan = {
        roads: [{ pts: [{ x: -25, z: 0 }, { x: 0, z: 0 }, { x: 25, z: 2 }], w: 4 }],
        feldwege: [{ pts: [{ x: 0, z: 0 }, { x: 0, z: -25 }], w: 2 }],
        platz: { cx: 10, cz: 14, ex: 6, ez: 4, phi: 0.3, typ: "erde" },
        felder: [
            { cx: -18, cz: -18, ex: 6, ez: 4, phi: 0 },
            { cx: 22, cz: -22, ex: 5, ez: 5, phi: Math.PI / 4 },
        ],
        fences: [{ x0: -6, z0: 6, x1: 6, z1: 6 }],
    };
    if (fern) plan.roads.push({ pts: [{ x: fern.x, z: fern.z }, { x: fern.x + 30, z: fern.z }], w: 4 });
    r._stlWegeBuild(plan, o, "probe:weg");
    if (stoerung === "streifen") r._stlZaunAddStrip(o.x, 0, o.z, 0, 0, 4, 0.14, 3, 0x8a7456);
    r._tickWegeKarte({ x: o.x, z: o.z });
    const out = { ort: o };
    // 1 KEIN QUAD: jeder Streifen im Pool ist ein hüfthoher Zaun (sy ≥ 0,5), keiner ein flacher Boden-Streifen
    const P = st.stlZaun;
    const m = new T.Matrix4();
    const pos = new T.Vector3();
    const q = new T.Quaternion();
    const sk = new T.Vector3();
    let flach = 0;
    let zaun = 0;
    for (let i = 0; P && i < P.top; i++) {
        P.mesh.getMatrixAt(i, m);
        m.decompose(pos, q, sk);
        if (sk.y < 0.5) flach++;
        else zaun++;
    }
    out.flacheStreifen = flach;
    out.zaeune = zaun;
    // 2 BODEN + 3 KANTE: die Karte über der Straße (halbe Breite 2 m)
    out.mitte = +r._wegeFeldAt(o.x - 12, o.z).toFixed(3);
    out.aussen = +r._wegeFeldAt(o.x - 12, o.z + 4.5).toFixed(3);
    let kante = 0;
    for (let dz = 1.6; dz <= 2.6; dz += 0.1) {
        const v = r._wegeFeldAt(o.x - 12, o.z + dz);
        if (v > 0.15 && v < 0.85) kante++;
    }
    out.kantenProben = kante;
    const nah = st.wegeKarte.stufen[0];
    const kanal = (x, z, c) => {
        const S = nah.S;
        const i = Math.floor((x - (nah.mitteX - S.fensterM / 2)) / S.texelM);
        const j = Math.floor((z - (nah.mitteZ - S.fensterM / 2)) / S.texelM);
        return nah.daten[(j * nah.N + i) * 2 + c] / 255;
    };
    out.platz = +kanal(o.x + 10, o.z + 14, 0).toFixed(3);
    out.acker = +kanal(o.x - 18, o.z - 18, 1).toFixed(3);
    out.feldweg = +kanal(o.x, o.z - 15, 0).toFixed(3);
    // 5 ECKE: die Ecke des 45°-Quadrats (Halbachse 5 m) liegt 7,07 m entlang +x; 6,6 m liegen innen, im weichen Rand
    // der Ecke (der Texel nächst der Probe liest 0,56). Die alte Ausdehnung max(ex, ez) + Rand endete bei 5,6 m (+ ein
    // Texel Schlupf): dort las dieselbe Probe 0 — die Ecke fehlte.
    out.ecke = +kanal(o.x + 22 + 6.6, o.z - 22, 1).toFixed(3);
    // 6 FERNE: der Fern-Weg (300 m) liest die Karte (die nahe Stufe endet bei 208 m, die ferne trägt)
    out.fernWeg = fern ? +r._wegeFeldAt(o.x + fern.x + 15, o.z + fern.z).toFixed(3) : -1;
    // 4 KONSUM: das Chunk-Material liest die Karte, die Wiese das Pfad-Feld
    const code = (fn) => window.__codeOf(fn);
    out.shaderLiest =
        /wegeKarte: true/.test(code(r._getVoxelChunkMaterial)) &&
        /_wegeBodenFarbe\(_Ta, albedoNode\)/.test(code(r._buildPbrNodeMaterial)) &&
        /_wegeKarteEnsure\(\)/.test(code(r._wegeBodenFarbe));
    out.wieseLiest = /_pfadFeldAt\(/.test(code(r._nahWieseKachelBueschel)) && r._pfadFeldAt(o.x - 12, o.z, null) > 0.9;
    A.WEGE_KARTE = randAlt;
    r._stlWegeDispose();
    return out;
}

function urteil(S) {
    if (S.fehler) return ["Probe: " + S.fehler];
    const rot = [];
    if (S.flacheStreifen !== 0) rot.push(`1 KEIN QUAD: ${S.flacheStreifen} flache Boden-Streifen als Geometrie im Pool`);
    if (S.zaeune < 1) rot.push("1 KEIN QUAD: der Zaun fehlt im Zaun-Pool");
    if (!(S.mitte > 0.95 && S.aussen < 0.02))
        rot.push(`2 BODEN: Straßen-Mitte ${S.mitte} (soll > 0,95), 2,5 m außerhalb ${S.aussen} (soll < 0,02)`);
    if (!(S.platz > 0.9 && S.acker > 0.9 && S.feldweg > 0.9))
        rot.push(`2 BODEN: Platz ${S.platz} · Acker ${S.acker} · Feldweg ${S.feldweg} (soll > 0,9)`);
    if (!(S.kantenProben >= 4)) rot.push(`3 KANTE: hart — nur ${S.kantenProben} Zwischenwerte über 1 m Rand (soll ≥ 4)`);
    if (!S.shaderLiest) rot.push("4 KONSUM: der Boden-Shader liest die Wege-Karte nicht");
    if (!(S.ecke > 0.3)) rot.push(`5 ECKE: die Ecke des 45°-Ackers trägt ${S.ecke} (soll > 0,3 — die Ausdehnung ist die Diagonale)`);
    if (!(S.fernWeg > 0.5)) rot.push(`6 FERNE: der Weg in 300 m liest ${S.fernWeg} (soll > 0,5 — die ferne Stufe trägt)`);
    if (!S.wieseLiest) rot.push("4 KONSUM: die Wiese liest das Pfad-Feld nicht");
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
        const dl = performance.now() + 90000;
        while (
            (!window.anazhRealm ||
                !window.anazhRealm.state ||
                !window.anazhRealm.state.scene ||
                typeof window.anazhRealm._gameLoopTick !== "function") &&
            performance.now() < dl
        )
            await new Promise((r) => setTimeout(r, 100));
    });
    const S = await page.evaluate(probe, null);
    let selbst = null;
    if (SELFTEST) {
        const streifen = urteil(await page.evaluate(probe, "streifen"));
        const hart = urteil(await page.evaluate(probe, "hart"));
        const heil = urteil(await page.evaluate(probe, null));
        selbst = {
            streifenRot: streifen.some((e) => e.startsWith("1 KEIN QUAD")),
            hartRot: hart.some((e) => e.startsWith("3 KANTE")),
            heilGruen: heil.length === 0,
            streifen: streifen[0] || "-",
            hart: hart.find((e) => e.startsWith("3 KANTE")) || hart[0] || "-",
        };
    }
    await browser.close();
    server.close();

    console.log("=== DIE WEG-KANTEN-PROBE (V18.530) — der Weg ist Boden ===");
    if (S.fehler) console.log("  " + S.fehler);
    else {
        console.log(`  Pool: ${S.flacheStreifen} flache Boden-Streifen · ${S.zaeune} Zaun-Streifen`);
        console.log(`  Straße: Mitte ${S.mitte} · 2,5 m außerhalb ${S.aussen} · weiche Rand-Proben ${S.kantenProben}`);
        console.log(`  Platz ${S.platz} · Acker ${S.acker} · Feldweg ${S.feldweg}`);
        console.log(`  Konsum: Boden-Shader ${S.shaderLiest} · Wiese ${S.wieseLiest}`);
        console.log(`  Ecke (45°-Acker) ${S.ecke} · Weg in 300 m ${S.fernWeg}`);
    }
    const rot = urteil(S);
    if (pageErrors.length) rot.push("Seiten-Fehler: " + pageErrors[0]);
    if (selbst) {
        console.log(`  Selbsttest: Boden-Streifen im Pool → ${selbst.streifen}`);
        console.log(`  Selbsttest: harte Kante → ${selbst.hart}`);
        if (!selbst.streifenRot) rot.push("SELBSTTEST: der injizierte Boden-Streifen blieb grün");
        if (!selbst.hartRot) rot.push("SELBSTTEST: die harte Kante blieb grün");
        if (!selbst.heilGruen) rot.push("SELBSTTEST: nach der Heilung nicht grün");
    }
    if (rot.length) {
        console.error("\nROT:");
        for (const e of rot) console.error("  • " + e);
        process.exit(1);
    }
    console.log("\nGRÜN — der Weg ist getretene Erde im Boden: weich gerändert, kein Quad, die Wiese weicht ihm.");
    process.exit(0);
})().catch((e) => {
    console.error("Weg-Boden-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
