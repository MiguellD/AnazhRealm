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
//   7 BESTAND     die Kronen-Karte derselben Fenster: eine Eintrags-Krone übersteht 1,6 km Ausflug (Register, Streu,
//                 verschoben = voll neu gemalt) — bis 06.10. vergaß der ferne Umzug jede Eintrags-Krone
//   8 TRITT       die Trittfläche einer Feuerstelle (`fx.tritt` des Gesetzbuchs) als EINZIGE Form der Karte: gesetzt
//                 tragen GPU-Bytes und CPU-Leser Erde und die Wiesen-/Streu-Kachel darüber fällt; abgebaut über den
//                 echten Abbau (`removeArchitecture`) sind die Bytes sofort leer und gehen hoch, der CPU-Leser liest 0,
//                 die Kacheln fallen (der nächste Takt lässt Wiese und Nah-Streu zurückwachsen) — bis 06.10. wartete
//                 der Abbau auf den Takt, der ohne Weg und Krone früh zurückkehrte (GPU Erde, CPU 0, keine Wiese)
// --selftest: ein injizierter Boden-Streifen im Pool, eine harte Kante, der vergessliche ferne Umzug und der alte
// Abbau der Trittfläche müssen beim Namen rot werden.
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
    // 7 BESTAND: eine Eintrags-Krone (a:, trägt sich nur beim Entstehen ein) übersteht einen Ausflug über das ferne
    // Fenster — 1,6 km hin und zurück: sie steht im Register, die Laubstreu liegt unter ihr, und jede verschobene
    // Stufe gleicht dem vollen Neumalen aus dem Register (der Raum-Index verliert keine Krone am Streifen-Rand).
    const wk = st.wegeKarte;
    const kx = o.x + 30;
    const kz = o.z + 30;
    r._kronenStreuNeu("a:probe-bestand", kx, kz, 5);
    if (stoerung === "vergessen") {
        // die Lücke bis 06.10.: der Umzug der fernen Stufe vergaß jede Krone jenseits seines Fensters
        const fernStufe = wk.stufen[wk.stufen.length - 1];
        const umzug = r._kronenStreuUmzug;
        r._kronenStreuUmzug = function (stufe, war) {
            const hk = stufe.S.fensterM / 2;
            if (stufe === fernStufe)
                for (const [k, c] of [...wk.kronen])
                    if (Math.abs(c[0] - stufe.mitteX) - c[2] > hk || Math.abs(c[1] - stufe.mitteZ) - c[2] > hk) {
                        wk.kronen.delete(k);
                        wk.kronenZellen.get(A._kronenZelle(c[0], c[1])).delete(k);
                    }
            return umzug.call(this, stufe, war);
        };
    }
    try {
        r._tickWegeKarte({ x: o.x + 1600, z: o.z });
        r._tickWegeKarte({ x: o.x, z: o.z });
    } finally {
        delete r._kronenStreuUmzug; // die Störung lebte als eigene Eigenschaft, der Prototyp trägt wieder
    }
    out.bestandRegister = wk.kronen.has("a:probe-bestand");
    out.bestandStreu = +r._kronenStreuAt(kx, kz).toFixed(3);
    let ungleich = 0;
    for (const stufe of wk.stufen) {
        const verschoben = stufe.kronen.summe.slice();
        r._kronenStreuUmzug(stufe, null);
        const voll = stufe.kronen.summe;
        for (let i = 0; i < voll.length; i++) if (voll[i] !== verschoben[i]) ungleich++;
    }
    out.bestandUngleich = ungleich;
    r._kronenStreuWeg("a:probe-bestand");
    A.WEGE_KARTE = randAlt;
    r._stlWegeDispose();
    return out;
}

// 8 TRITT — eine Feuerstelle (Bauplan `glutbrunnen`, Gestalt fachwerk `feuerstelle`) nahe dem Spieler; die Karte trägt
// sonst nichts (kein Weg, keine Krone: der Fall, in dem der Takt früh zurückkehrt).
function trittProbe(stoerung) {
    const r = window.anazhRealm;
    const st = r.state;
    const A = r.constructor;
    const pm = st.playerMesh.position;
    let o = null;
    for (let k = 0; k < 64 && !o; k++) {
        const x = pm.x + (k % 8) * 6 - 21;
        const z = pm.z + Math.floor(k / 8) * 6 - 21;
        if (r._isAboveWaterAt(x, z, 0.2) && r._isAboveWaterAt(x + 3, z + 3, 0.2) && r._isAboveWaterAt(x - 3, z - 3, 0.2))
            o = { x, z };
    }
    if (!o) return { fehler: "kein trockener Tritt-Ort" };
    r._stlWegeDispose();
    const wk = r._wegeKarteEnsure();
    const nah = wk.stufen[0];
    // die GPU-Bytes der Nah-Stufe (Kanal Erde) — dieselben, die der Boden-Shader liest, unabhängig vom CPU-Leser
    const byte = (x, z) => {
        const S = nah.S;
        const i = Math.floor((x - (nah.mitteX - S.fensterM / 2)) / S.texelM);
        const j = Math.floor((z - (nah.mitteZ - S.fensterM / 2)) / S.texelM);
        return i < 0 || j < 0 || i >= nah.N || j >= nah.N ? -1 : nah.daten[(j * nah.N + i) * 2] / 255;
    };
    // Je Ring EINE Kachel über der Feuerstelle: steht dort keine (der Null-Renderer baut die Wiese nicht), sät die
    // Probe einen leeren Platzhalter — die Probe zählt, ob der Abbau sie fallen lässt (der Takt baut Fehlendes neu).
    const vorWiese = st.nahWiese;
    const vorStreu = st.nahStreu;
    const eigenWiese = !vorWiese;
    const eigenStreu = !vorStreu;
    if (eigenWiese) st.nahWiese = { kacheln: new Map(), senken: new Map(), vorlagen: new Map(), neu: true, offen: 0 };
    if (eigenStreu) st.nahStreu = { senken: new Map(), kacheln: new Map() };
    const KW = A.NAH_WIESE.kachel;
    const KS = A.NAH_STREU.kachel;
    const kw = `${Math.floor(o.x / KW)},${Math.floor(o.z / KW)}`;
    const ks = `${Math.floor(o.x / KS)},${Math.floor(o.z / KS)}`;
    const gesaet = new Set();
    const saeen = () => {
        for (const [ring, key, k] of [
            [st.nahWiese, kw, { meshes: null, quellen: null }],
            [st.nahStreu, ks, { key: ks, senken: new Set(), zustand: null }],
        ])
            if (!ring.kacheln.has(key)) {
                ring.kacheln.set(key, k);
                gesaet.add(k);
            }
    };
    const gefallen = () => (st.nahWiese.kacheln.has(kw) ? 0 : 1) + (st.nahStreu.kacheln.has(ks) ? 0 : 1);
    const out = { ort: o };
    const entry = r.spawnArchitecture(
        "glutbrunnen",
        { x: o.x, y: r.getTerrainHeightAt(o.x, o.z), z: o.z },
        { silent: true, seed: 7 }
    );
    if (!entry) return { fehler: "die Feuerstelle steht nicht (spawnArchitecture)" };
    saeen();
    r._trittFlaecheSetzen(entry); // der Studio-Platz ruft sie beim ersten Primär-Add (`_archInstanceAdd`)
    out.gesetztForm = !!entry._trittBox;
    out.gesetztCpu = +r._wegeFeldAt(o.x, o.z).toFixed(3);
    out.gesetztGpu = +byte(o.x, o.z).toFixed(3);
    out.gesetztGefallen = gefallen();
    saeen();
    const version = nah.tex.version;
    if (stoerung === "tritt") {
        // der Abbau bis 06.10.: die Form fällt, die Stufen warten auf den Takt, keine Wiese wächst nach
        r._trittFlaecheLoesen = function (e) {
            const k = this.state.wegeKarte;
            if (!e || !e._trittBox || !k) return;
            const i = k.siedlungen.indexOf(e._trittBox);
            if (i >= 0) k.siedlungen.splice(i, 1);
            e._trittBox = null;
            for (const s of k.stufen) s.zentriert = false;
        };
    }
    try {
        r.removeArchitecture(entry);
        r._tickWegeKarte({ x: pm.x, z: pm.z }); // der nächste Spiel-Takt
    } finally {
        delete r._trittFlaecheLoesen; // die Störung lebte als eigene Eigenschaft, der Prototyp trägt wieder
    }
    out.geloestCpu = +r._wegeFeldAt(o.x, o.z).toFixed(3);
    out.geloestGpu = +byte(o.x, o.z).toFixed(3);
    out.geloestUpload = nah.tex.version > version;
    out.geloestGefallen = gefallen();
    out.formenRest = wk.siedlungen.length;
    // nur die eigenen Platzhalter räumen (eine echte Kachel bleibt dem Takt)
    if (gesaet.has(st.nahWiese.kacheln.get(kw))) st.nahWiese.kacheln.delete(kw);
    if (gesaet.has(st.nahStreu.kacheln.get(ks))) st.nahStreu.kacheln.delete(ks);
    if (eigenWiese) st.nahWiese = vorWiese;
    if (eigenStreu) st.nahStreu = vorStreu;
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
    if (!(S.bestandRegister && S.bestandStreu > 0.5 && S.bestandUngleich === 0))
        rot.push(
            `7 BESTAND: nach 1,6 km Ausflug steht die Eintrags-Krone ${S.bestandRegister ? "im" : "NICHT im"} Register, ` +
                `Streu unter ihr ${S.bestandStreu} (soll > 0,5), ${S.bestandUngleich} Texel ungleich dem vollen Neumalen (soll 0)`
        );
    const T = S.tritt;
    if (!T) rot.push("8 TRITT: nicht gemessen");
    else if (T.fehler) rot.push("8 TRITT: " + T.fehler);
    else {
        if (!(T.gesetztForm && T.gesetztCpu > 0.9 && T.gesetztGpu > 0.9 && T.gesetztGefallen === 2))
            rot.push(
                `8 TRITT gesetzt: Form ${T.gesetztForm} · CPU ${T.gesetztCpu} · GPU-Byte ${T.gesetztGpu} (soll > 0,9) · ` +
                    `${T.gesetztGefallen}/2 Kacheln gefallen`
            );
        if (!(T.geloestCpu < 0.02 && T.geloestGpu === 0 && T.geloestUpload && T.geloestGefallen === 2 && T.formenRest === 0))
            rot.push(
                `8 TRITT gelöst: CPU ${T.geloestCpu} · GPU-Byte ${T.geloestGpu} (soll 0) · Upload ${T.geloestUpload} · ` +
                    `${T.geloestGefallen}/2 Kacheln gefallen (Wiese und Nah-Streu wachsen zurück) · ${T.formenRest} Formen übrig`
            );
    }
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
    // die Trittfläche nennt das Gesetzbuch: das Buch muss warm sein (der Foundry-Worker läuft auch headless)
    await page.evaluate(async () => {
        const dl = performance.now() + 90000;
        const warm = () => {
            const f = window.anazhRealm._foundry;
            return f && f.recipes && f.recipes.feuerstelle;
        };
        while (!warm() && performance.now() < dl) await new Promise((r) => setTimeout(r, 100));
    });
    const messen = async (stoerung) =>
        Object.assign(await page.evaluate(probe, stoerung === "tritt" ? null : stoerung), {
            tritt: await page.evaluate(trittProbe, stoerung === "tritt" ? "tritt" : null),
        });
    const S = await messen(null);
    let selbst = null;
    if (SELFTEST) {
        const streifen = urteil(await messen("streifen"));
        const hart = urteil(await messen("hart"));
        const vergessen = urteil(await messen("vergessen"));
        const tritt = urteil(await messen("tritt"));
        const heil = urteil(await messen(null));
        selbst = {
            streifenRot: streifen.some((e) => e.startsWith("1 KEIN QUAD")),
            hartRot: hart.some((e) => e.startsWith("3 KANTE")),
            vergessenRot: vergessen.some((e) => e.startsWith("7 BESTAND")),
            trittRot: tritt.some((e) => e.startsWith("8 TRITT gelöst")),
            heilGruen: heil.length === 0,
            streifen: streifen[0] || "-",
            hart: hart.find((e) => e.startsWith("3 KANTE")) || hart[0] || "-",
            vergessen: vergessen.find((e) => e.startsWith("7 BESTAND")) || vergessen[0] || "-",
            tritt: tritt.find((e) => e.startsWith("8 TRITT")) || tritt[0] || "-",
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
        console.log(
            `  Kronen-Bestand nach 1,6 km Ausflug: im Register ${S.bestandRegister} · Streu ${S.bestandStreu} · ` +
                `${S.bestandUngleich} Texel ungleich dem vollen Neumalen`
        );
        const T = S.tritt || {};
        if (T.fehler) console.log("  Trittfläche: " + T.fehler);
        else
            console.log(
                `  Trittfläche gesetzt: CPU ${T.gesetztCpu} · GPU-Byte ${T.gesetztGpu} · ${T.gesetztGefallen}/2 Kacheln neu · ` +
                    `gelöst: CPU ${T.geloestCpu} · GPU-Byte ${T.geloestGpu} · Upload ${T.geloestUpload} · ` +
                    `${T.geloestGefallen}/2 Kacheln neu · ${T.formenRest} Formen übrig`
            );
    }
    const rot = urteil(S);
    if (pageErrors.length) rot.push("Seiten-Fehler: " + pageErrors[0]);
    if (selbst) {
        console.log(`  Selbsttest: Boden-Streifen im Pool → ${selbst.streifen}`);
        console.log(`  Selbsttest: harte Kante → ${selbst.hart}`);
        console.log(`  Selbsttest: der ferne Umzug vergisst → ${selbst.vergessen}`);
        console.log(`  Selbsttest: der alte Abbau der Trittfläche → ${selbst.tritt}`);
        if (!selbst.streifenRot) rot.push("SELBSTTEST: der injizierte Boden-Streifen blieb grün");
        if (!selbst.hartRot) rot.push("SELBSTTEST: die harte Kante blieb grün");
        if (!selbst.vergessenRot) rot.push("SELBSTTEST: der vergessene Kronen-Bestand blieb grün");
        if (!selbst.trittRot) rot.push("SELBSTTEST: der alte Abbau der Trittfläche blieb grün");
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
