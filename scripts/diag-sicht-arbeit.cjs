#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-sicht-arbeit.cjs — DIE SICHT KOSTET, WAS SICH ÄNDERT (Welle C, Lehre 25). Befund 06.10. (OMEN, GTX 1060 +
// i7-8750H, CPU-Profil 12 s, Regler voll, Blick gepinnt, Mess-Wiese −900/−850): die Sicht je Pass (`_passSicht` an
// scene.onBeforeRender) kostete ~6 ms CPU je Frame — `_chunkSatzPass` 5,3 · `_hoehlenSicht` 4,5 · `_hoehlenSichtLicht` 3,6
// ms (je Kaskaden-Pass acht Ecken je Box über jede Mündung des Rings und jede Höhlen-Zelle der Box) —, obwohl der Spieler
// an der Oberfläche stand und nichts sich bewegte: jeder Pass rechnete jeden Frame dieselbe Wahl neu. Die Wand fährt die
// Sicht-Kette an der Mess-Wiese (Null-Renderer; das Hauptbild über `_passSicht`, zwei Stellvertreter-Kaskaden über den
// EINEN Chokepoint `_chunkSatzPass` samt Instanz-Wahl, wie gate:chunk-satz) und zählt mit der Sicht-Linse
// (scripts/lib/sicht-linse.cjs, dieselbe wie `werkbank sicht`) je Frame die Arbeit:
//   (R) RUHE — Kamera, Kaskaden und Welt stehen (nachdem jede Mündung im Bild ihre Horizont-Sperre trägt): ab dem
//       zweiten Frame 0 Prüfungen (`_passTrifft` der Sätze · der Höhlen · der Instanz-Wahl · der Nah-Wiese, `_hoehlenRect`,
//       `_hoehlenLichtLage`, `_instanzBehalten`), 0 Aufrufe von `_hoehlenSicht` / `_hoehlenSichtLicht` /
//       `_chunkSatzAbschnitt`, 0 Index-Bytes — und die Pässe treffen ihren Cache;
//   (B) BEWEGUNG — Drehen (36 × 1°) und Gehen (20 × 1 m): jede neue Lage rechnet neu (eine gehaltene Wahl wäre ein Loch);
//   (T) TREUE — die gehaltene Wahl ist die frisch gerechnete: nach der Ruhe vergisst die Kette jede Lage, ein Frame
//       rechnet alles neu — je Satz × Pass dieselben Zellen in derselben Folge, je Gruppe der Wahl dieselbe Zahl;
//   (S) SCHARF — ein eingeschmuggelter Cache-Bruch (die Lage-Erinnerung fällt je Pass) arbeitet in Ruhe und fällt rot;
//   (L) RUHE MIT LAUFENDER SONNE (07.10. — der Tag steht im Spiel nie): die Tageszeit läuft mit der Tageslänge des Spiels
//       (60 Frames je s), das Licht folgt `_applyDayNightToScene`, die Stellvertreter-Kaskaden stehen entlang des Lichts
//       (dreht es, drehen sie): das Licht hat eine Stufe und dreht nur an ihr, die Kette arbeitet nur, wo eine Stufe fiel
//       (die Stellvertreter tragen keine Box — den Licht-Rand der echten Kaskaden, über den ihre Wahl die Stufen hält, prüft
//       gate:schatten-werfer K8, im echten Loop `werkbank sicht --sonne`);
//   (C) CODE — EIN Gesetz der Lage: `_passWahlLage` legt die Generation (`_passLageGen`), die Sätze, die Instanz-Wahl
//       und die Nah-Wiese lesen sie (`_satzAbschnittSteht`, `_instanzWahlSteht`, `L.gen`); die eigene Kamera-Signatur der
//       Nah-Wiese (`_sichtSteht`) ist gefallen; (P) kein Page-Error.
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): ein Befund mit jedem Täter — Arbeit in Ruhe, Bytes in Ruhe,
// kein Treffer, starres Drehen, untreue Wahl, stumpfe Linse, fehlender Leser, Page-Error — MUSS rot fallen und ihn beim
// Namen nennen.
//   node scripts/diag-sicht-arbeit.cjs [--selftest]   (npm run gate:sicht-arbeit; Port SICHT_ARBEIT_PORT)
// ─────────────────────────────────────────────────────────────────────────
"use strict";

const SICHT = require("./lib/sicht-linse.cjs");

function urteil(b) {
    // die Wand friert die Welt ein: in KEINEM Ruhe-Frame Arbeit oder ein Byte
    const v = SICHT.sichtUrteil(Object.assign({ streng: true }, b));
    if (!b.sonne) v.push("LEER: keine Phase mit laufender Sonne (kein Richtlicht?) — (L) prüfte nichts");
    const c = b.code || {};
    if (!c.lageGen)
        v.push("CODE: `_passWahlLage` legt keine Lage-Generation (`_passLageGen`) — die Kette weiß nie, ob sie steht");
    if (!c.satzLiest)
        v.push("CODE: `_chunkSatzPass` fragt `_satzAbschnittSteht` nicht (jeder Pass rechnet jeden Satz neu)");
    if (!c.instanzLiest)
        v.push("CODE: `_instanzWahlPass` fragt `_instanzWahlSteht` nicht (jede Instanz jeder Gruppe je Pass neu)");
    if (!c.wieseLiest) v.push("CODE: `_nahWieseSicht` liest die Lage-Generation nicht (`L.gen`)");
    if (c.zweiteSignatur) v.push("CODE: `_sichtSteht` lebt — eine zweite Kamera-Signatur neben dem Gesetz der Lage");
    for (const e of b.pageErrors || []) v.push(`PAGE-ERROR: ${e}`);
    return v;
}

function selbsttest() {
    const phase = (arbeit, bytes, treffer) => ({
        frames: 10,
        paesse: { mittel: 3, median: 3, max: 3 },
        arbeit: { mittel: arbeit, median: arbeit, max: arbeit },
        arbeitFrames: arbeit > 0 ? 10 : 0,
        schreibFrames: bytes > 0 ? 10 : 0,
        ecken: { mittel: 0, median: 0, max: 0 },
        bytes: { mittel: bytes, median: bytes, max: bytes },
        treffer: { mittel: treffer, median: treffer, max: treffer },
        hoehlenSicht: { mittel: 0, median: 0, max: 0 },
        hoehlenSichtLicht: { mittel: 0, median: 0, max: 0 },
        abschnitt: { mittel: 0, median: 0, max: 0 },
        passTrifft: { mittel: 0, median: 0, max: 0 },
        instanzBehalten: { mittel: 0, median: 0, max: 0 },
        werferTrifft: { mittel: 0, median: 0, max: 0 },
        hinaus: { mittel: 0, median: 0, max: 0 },
    });
    const sonne = (arbeitFrames, lichtFrames, stufe) =>
        Object.assign(phase(arbeitFrames > 0 ? 300 : 0, 0, 9), {
            frames: 120,
            arbeitFrames,
            lichtFrames,
            sonneRad: 0.026,
            stufe,
            arbeit: { mittel: arbeitFrames > 0 ? 20 : 0, median: 0, max: arbeitFrames > 0 ? 3000 : 0 },
        });
    const gruen = {
        sonne: sonne(12, 6, 1 / 255),
        ruhe: phase(0, 0, 9),
        drehen: phase(4000, 0, 0),
        gehen: phase(5000, 0, 0),
        bruch: phase(4000, 0, 0),
        treue: { geprueft: 12, abweichung: [] },
        code: { lageGen: true, satzLiest: true, instanzLiest: true, wieseLiest: true, zweiteSignatur: false },
        pageErrors: [],
    };
    const klon = () => JSON.parse(JSON.stringify(gruen));
    const fehler = [];
    const v0 = urteil(klon());
    if (v0.length) fehler.push("der grüne Befund fällt rot: " + v0.join(" · "));
    console.log(`  ${v0.length ? "❌" : "✅"} Selbsttest grün → ${v0.join(" · ") || "grün"}`);
    // der echte Loop unter langsamem Takt: das Licht dreht in jedem Frame (die Sonne läuft schneller als eine Stufe je Frame),
    // die Kaskaden mit Box halten ihre Wahl über den Licht-Rand — grün
    const randSonne = (arbeitFrames, lichtRand) =>
        Object.assign(sonne(arbeitFrames, 199, 0.0004), { frames: 199, sonneRad: 0.19, mitBox: true, lichtRand });
    const v1 = urteil(Object.assign(klon(), { sonne: randSonne(40, 32) }));
    if (v1.length) fehler.push("der grüne Befund mit Licht-Rand fällt rot: " + v1.join(" · "));
    console.log(`  ${v1.length ? "❌" : "✅"} Selbsttest grün mit Licht-Rand → ${v1.join(" · ") || "grün"}`);
    const faelle = [
        [
            "Arbeit in Ruhe (die Basis)",
            (b) => (b.ruhe = phase(5200, 0, 0)),
            /RUHE: die Sicht-Kette arbeitet in Ruhe 5200/,
        ],
        [
            "ein Ausreißer in Ruhe",
            (b) => ((b.ruhe.arbeit.max = 30), (b.ruhe.arbeitFrames = 1)),
            /RUHE: die Sicht-Kette arbeitet in Ruhe/,
        ],
        [
            "Bytes in Ruhe",
            (b) => ((b.ruhe.bytes = { mittel: 96, median: 0, max: 960 }), (b.ruhe.schreibFrames = 1)),
            /RUHE: 96 Index-Bytes je Frame/,
        ],
        ["kein Treffer", (b) => (b.ruhe.treffer = { mittel: 0, median: 0, max: 0 }), /LINSE BLIND: kein Pass traf/],
        ["starres Drehen", (b) => (b.drehen.arbeit = { mittel: 0, median: 0, max: 0 }), /STARR: beim Drehen/],
        ["starres Gehen", (b) => (b.gehen.arbeit = { mittel: 1, median: 0, max: 3 }), /STARR: beim Gehen/],
        [
            "untreue Wahl",
            (b) => b.treue.abweichung.push("boden|haupt: 41 statt 43 Zellen"),
            /TREUE: boden\|haupt: 41 statt 43 Zellen/,
        ],
        ["Treue ohne Vergleich", (b) => (b.treue.geprueft = 0), /LEER: Treue ohne Vergleich/],
        ["stumpfe Linse", (b) => (b.bruch = phase(0, 0, 9)), /LINSE STUMPF/],
        [
            "das Licht dreht je Frame (die Basis)",
            (b) => (b.sonne = sonne(120, 120, null)),
            /SONNE: das Licht hat keine Stufe — es dreht in 120 von 120 Frames/,
        ],
        ["Arbeit zwischen den Stufen", (b) => (b.sonne = sonne(40, 6, 1 / 255)), /Arbeit zwischen den Stufen/],
        ["Stufe ohne Halt", (b) => (b.sonne = sonne(12, 120, 1 / 255)), /SONNE: das Licht dreht in 120 von 120 Frames/],
        ["Kaskaden ohne Licht-Rand", (b) => (b.sonne = randSonne(40, 0)), /SONNE: die Kaskaden wählen ohne Licht-Rand/],
        [
            "Arbeit über den Licht-Rand hinaus",
            (b) => (b.sonne = randSonne(199, 32)),
            /der Licht-Rand \(32 Texel\) erlaubt etwa 61 neue Wahlen/,
        ],
        [
            "Sonne ohne Lauf",
            (b) => (b.sonne.sonneRad = 0),
            /LEER: in der Phase mit laufender Sonne lief die Sonne nicht/,
        ],
        ["keine Sonne", (b) => delete b.sonne, /LEER: keine Phase mit laufender Sonne/],
        ["keine Ruhe", (b) => delete b.ruhe, /LEER: keine Ruhe-Phase/],
        ["keine Generation", (b) => (b.code.lageGen = false), /CODE: `_passWahlLage` legt keine/],
        ["Satz fragt nicht", (b) => (b.code.satzLiest = false), /CODE: `_chunkSatzPass` fragt/],
        ["Instanz fragt nicht", (b) => (b.code.instanzLiest = false), /CODE: `_instanzWahlPass` fragt/],
        ["Wiese liest nicht", (b) => (b.code.wieseLiest = false), /CODE: `_nahWieseSicht` liest/],
        ["zweite Signatur", (b) => (b.code.zweiteSignatur = true), /CODE: `_sichtSteht` lebt/],
        ["Page-Error", (b) => b.pageErrors.push("TypeError: x"), /PAGE-ERROR: TypeError: x/],
    ];
    for (const [name, tat, muss] of faelle) {
        const b = klon();
        tat(b);
        const v = urteil(b);
        const ok = v.some((x) => muss.test(x));
        if (!ok) fehler.push(`${name}: die Wand nennt den Täter nicht (${muss})`);
        console.log(`  ${ok ? "✅" : "❌"} Selbsttest „${name}" → rot: ${v.join(" · ") || "(nichts)"}`);
    }
    if (fehler.length) {
        console.log("\n❌ SELBSTTEST ROT — die Wand ist vakuös: " + fehler.join(" · "));
        process.exit(1);
    }
    console.log("\n✅ SELBSTTEST GRÜN — jeder injizierte Täter fällt rot und wird beim Namen genannt.");
}

if (process.argv.includes("--selftest")) {
    console.log("=== SICHT-ARBEIT — Selbsttest (ohne Browser) ===");
    selbsttest();
    process.exit(0);
}

const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.SICHT_ARBEIT_PORT) || 4506;
const MESS = { x: -900, z: -850 };
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".png": "image/png",
    ".wasm": "application/wasm",
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

(async () => {
    console.log("=== SICHT-ARBEIT (Welle C) — Null-Renderer, Mess-Wiese, die Sicht-Linse je Frame ===");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: "new",
        protocolTimeout: 600000,
        args: ["--no-sandbox", "--disable-gpu"],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(580000);
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
        window.__codeOf = (fnOrSrc) =>
            String(fnOrSrc)
                .replace(/\/\/.*$/gm, "")
                .replace(/\/\*[\s\S]*?\*\//g, "");
    });
    let befund = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 120000,
        });
        await page.evaluate(SICHT.SICHT_INSTALL);
        befund = await page.evaluate(async (MESS) => {
            const r = window.anazhRealm,
                st = r.state,
                T = window.THREE;
            const P = Object.getPrototypeOf(r);
            const pause = (ms) => new Promise((ok) => setTimeout(ok, ms || 0));
            const takt = () => {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
            };
            // einschwingen: der Ring steht, kein Worker-Auftrag offen
            const schwinge = async () => {
                let stabil = 0,
                    last = -1;
                for (let i = 0; i < 6000; i++) {
                    takt();
                    const sz = st.voxelChunks ? st.voxelChunks.size : 0;
                    if (sz === last) stabil++;
                    else {
                        stabil = 0;
                        last = sz;
                    }
                    if (i > 60 && stabil > 80 && !(st.voxelMeshPending && st.voxelMeshPending.size > 0)) break;
                    if (i % 5 === 0) await pause(10);
                }
                return last;
            };
            st.playerMesh.position.set(MESS.x, r._voxelSurfaceY(MESS.x, MESS.z) + 1.8, MESS.z);
            const ring = await schwinge();
            r._tickChunkSatz();
            const aus = { ring, code: {} };
            const cam = st.camera;
            const S = r._kaskadenSchmier();
            const ppos = st.playerMesh.position.clone();
            const boden = r._voxelSurfaceY(MESS.x, MESS.z);
            // Die Stellvertreter-Kaskaden (wie gate:chunk-satz): Ortho-Kameras über dem Blick, k0 ±120 m, k1 ±400 m, die
            // Mitte ein halbes Feld vor dem Auge — sie laufen mit, wenn der Blick dreht oder geht.
            const kaskaden = [new T.OrthographicCamera(-120, 120, 120, -120, 0, 1600)];
            kaskaden.push(new T.OrthographicCamera(-400, 400, 400, -400, 0, 1600));
            const stelle = (yaw, vor) => {
                const ex = ppos.x + Math.sin(yaw) * vor,
                    ez = ppos.z - Math.cos(yaw) * vor;
                cam.position.set(ex, boden + 1.7, ez);
                cam.lookAt(ex + Math.sin(yaw) * 100, boden + 1.7, ez - Math.cos(yaw) * 100);
                cam.updateMatrixWorld(true);
                kaskaden.forEach((c, i) => {
                    const h = c.right * 0.5;
                    const cx = ex + Math.sin(yaw) * h,
                        cz = ez - Math.cos(yaw) * h;
                    c.position.set(cx + 280, boden + 800, cz + 160);
                    c.lookAt(cx, boden, cz);
                    c.updateMatrixWorld(true);
                    c.updateProjectionMatrix();
                    void i;
                });
            };
            // EIN Frame der Sicht: das Hauptbild über `_passSicht`, dann jede Kaskade mit derselben Lage wie in `_passSicht`
            // (Matrix, Frustum, das Gesetz der Lage; die Instanz-Wahl der Schatten-Gruppen und der EINE Satz-Chokepoint).
            const frame = () => {
                r._tickChunkSatz();
                r._passSicht(cam, false);
                const wahl = [];
                for (const g of r._instanzWahlGruppen())
                    if (g.wahl === "haupt" && g.mesh) wahl.push(["haupt", g, g.mesh.count]);
                kaskaden.forEach((c, i) => {
                    S.m.multiplyMatrices(c.projectionMatrix, c.matrixWorldInverse);
                    S.frustum.setFromProjectionMatrix(S.m, c.coordinateSystem);
                    r._passWahlLage(S, c, i);
                    r._instanzWahlPass("schatten", S);
                    for (const g of r._instanzWahlGruppen())
                        if (g.wahl === "schatten" && g.mesh) wahl.push(["k" + i, g, g.mesh.count]);
                    r._chunkSatzPass(c, false, i, S);
                    r._chunkSatzPass(c, true, -1, S);
                    r._instanzWahlZurueck(S.wahlSchatten);
                });
                r._passSicht(cam, true);
                return wahl;
            };
            const s = st.chunkSaetze.get("boden");
            // bis jede Mündung im Bild ihre Horizont-Sperre trägt (je Pass höchstens HOEHLEN_HORIZONT_PROBEN frische)
            const reif = () => {
                for (let f = 0; f < 400; f++) {
                    frame();
                    const offen = s.hoehle && s.hoehle.offen ? s.hoehle.offen.length : 0;
                    if (offen === 0) break;
                }
            };
            const L = window.__sichtLinseAn();
            const phase = (n, schritt) => {
                const fs = [];
                L.frame();
                for (let i = 0; i < n; i++) {
                    if (schritt) schritt(i);
                    frame();
                    fs.push(L.frame());
                }
                return fs;
            };
            stelle(0, 0);
            reif();
            L.an();
            // (R) RUHE
            const ruhe = phase(12);
            aus.ruhe = window.__sichtPhase(ruhe, 1);
            aus.ruheKalt = ruhe[0];
            // (T) TREUE: die gehaltene Wahl gegen die frisch gerechnete (die Lage-Erinnerung fällt, ein Frame)
            const stand = (wahl) => {
                const m = new Map();
                for (const satz of st.chunkSaetze.values())
                    for (const [k, a] of satz.abschnitte) m.set(satz.art + "|" + k, a.liste.slice());
                for (const [art, g, n] of wahl) m.set("gruppe:" + (g.mesh.name || g.mesh.id) + "|" + art, n);
                return m;
            };
            const halt = stand(frame());
            if (r._passLagen) r._passLagen.clear();
            const frisch = stand(frame());
            const abw = [];
            let geprueft = 0;
            for (const [k, x] of frisch) {
                const y = halt.get(k);
                geprueft++;
                if (Array.isArray(x)) {
                    const gleich = Array.isArray(y) && y.length === x.length && y.every((z, i) => z === x[i]);
                    if (!gleich) abw.push(`${k}: gehalten ${y ? y.length : 0} Zellen, frisch ${x.length}`);
                } else if (y !== x) abw.push(`${k}: gehalten ${y} Instanzen, frisch ${x}`);
            }
            aus.treue = { geprueft, abweichung: abw.slice(0, 8) };
            // (B) DREHEN 36 × 1°, GEHEN 20 × 1 m
            aus.drehen = window.__sichtPhase(
                phase(36, (i) => stelle(((i + 1) * Math.PI) / 180, 0)),
                0
            );
            aus.gehen = window.__sichtPhase(
                phase(20, (i) => stelle(Math.PI / 5, i + 1)),
                0
            );
            // (L) RUHE MIT LAUFENDER SONNE: die Tageslänge des Spiels, 60 Frames je s; das Licht folgt `_applyDayNightToScene`,
            // die Stellvertreter-Kaskaden stehen entlang des Lichts (ihre Mitte ein halbes Feld vor dem Auge)
            stelle(0, 0);
            const dl = st.directionalLight;
            if (dl && dl.target) {
                const tagLang = 60 * 60 * (st.dayLengthMinutes || r.constructor.DAY_LENGTH_DEFAULT_MINUTES);
                st.timeOfDay = 0.42;
                if (st.world) st.world.timeOfDay = 0.42;
                const mitte = kaskaden.map((c) => new T.Vector3(cam.position.x, boden, cam.position.z - c.right * 0.5));
                const lichtStellen = () => {
                    r._applyDayNightToScene();
                    const L0 = new T.Vector3().subVectors(dl.position, dl.target.position).normalize();
                    kaskaden.forEach((c, i) => {
                        c.position.copy(mitte[i]).addScaledVector(L0, 800);
                        c.lookAt(mitte[i]);
                        c.updateMatrixWorld(true);
                    });
                };
                lichtStellen();
                reif();
                aus.sonne = window.__sichtPhase(
                    phase(120, () => {
                        st.timeOfDay += 1 / tagLang;
                        if (st.world) st.world.timeOfDay = st.timeOfDay;
                        lichtStellen();
                    }),
                    1
                );
            }
            // (S) SCHARF: zurück in die Ruhe, dann der eingeschmuggelte Bruch — die Lage-Erinnerung fällt je Pass
            stelle(0, 0);
            reif();
            const orig = P._passWahlLage;
            r._passWahlLage = function (...a) {
                if (this._passLagen) this._passLagen.clear();
                return orig.apply(this, a);
            };
            try {
                aus.bruch = window.__sichtPhase(phase(6), 1);
            } finally {
                delete r._passWahlLage;
            }
            L.aus();
            const code = (f) => (typeof f === "function" ? window.__codeOf(f) : "");
            aus.code.lageGen = /this\._passLageGen\(/.test(code(P._passWahlLage));
            aus.code.satzLiest = /this\._satzAbschnittSteht\(/.test(code(P._chunkSatzPass));
            aus.code.instanzLiest = /this\._instanzWahlSteht\(/.test(code(P._instanzWahlPass));
            aus.code.wieseLiest = /\bL\.gen\b/.test(code(P._nahWieseSicht));
            aus.code.zweiteSignatur = typeof P._sichtSteht === "function";
            aus.saetze = [...st.chunkSaetze.values()].map((x) => x.art);
            aus.gruppen = r._instanzWahlGruppen().size;
            const H = s.hoehle;
            aus.hoehle = H
                ? {
                      muendungen: H.muendungen.size,
                      tore: [...H.muendungen].reduce((a, kn) => a + kn.tore.length, 0),
                      bereiche: [...s.bloecke.values()].filter((b) => b.hoehle).length,
                      knoten: [...s.bloecke.values()].reduce((a, b) => a + (b.hoehle ? b.hoehle.knoten.length : 0), 0),
                  }
                : null;
            return aus;
        }, MESS);
    } catch (e) {
        befund = { fehler: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();
    if (!befund || befund.fehler) {
        console.log("❌ LAUF-FEHLER: " + (befund ? befund.fehler : "kein Befund"));
        process.exit(1);
    }
    befund.pageErrors = pageErrors;
    const zeile = (n, x) =>
        `  ${n.padEnd(7)} ${x.frames} Frames · Pässe ${x.paesse.mittel} · Arbeit Ø ${x.arbeit.mittel} (Median ${x.arbeit.median}, ` +
        `max ${x.arbeit.max}) · Höhlen-Sicht ${x.hoehlenSicht.mittel} + Licht ${x.hoehlenSichtLicht.mittel} · Abschnitte ` +
        `${x.abschnitt.mittel} · Ecken ${x.ecken.mittel} (Schirm ${x.rect.mittel}, Licht ${x.lichtLage.mittel} Boxen) · _passTrifft ${x.passTrifft.mittel} (Werfer ${x.werferTrifft.mittel}) · ` +
        `Instanzen ${x.instanzBehalten.mittel} · Bytes ${x.bytes.mittel} · Treffer ${x.treffer.mittel}` +
        (x.taeter && x.taeter.length
            ? `
          neu: ${x.taeter.join(", ")}`
            : "");
    console.log(
        `  Ring ${befund.ring} Chunks · Sätze ${befund.saetze.join(", ")} · Gruppen der Wahl ${befund.gruppen} · Höhle ` +
            JSON.stringify(befund.hoehle)
    );
    const k = befund.ruheKalt;
    if (k)
        console.log(
            `  kalt    der erste Ruhe-Frame: Arbeit ${k.arbeit} · Ecken ${k.ecken} · Bytes ${k.bytes} · Treffer ${k.trefferSumme}`
        );
    for (const n of ["ruhe", "sonne", "drehen", "gehen", "bruch"]) if (befund[n]) console.log(zeile(n, befund[n]));
    if (befund.sonne)
        console.log(
            `  Sonne: das Licht drehte in ${befund.sonne.lichtFrames} von ${befund.sonne.frames} Frames (${befund.sonne.sonneRad} rad, ` +
                `Stufe ${befund.sonne.stufe} rad), die Kette arbeitete in ${befund.sonne.arbeitFrames}`
        );
    console.log(`  Treue: ${befund.treue.geprueft} Wahlen verglichen, ${befund.treue.abweichung.length} Abweichungen`);
    const v = urteil(befund);
    if (v.length) {
        console.log("\n❌ SICHT-ARBEIT ROT:\n  " + v.join("\n  "));
        process.exit(1);
    }
    console.log(
        "\n✅ SICHT-ARBEIT GRÜN — in Ruhe rechnet kein Pass neu, jede neue Lage rechnet, die gehaltene Wahl ist die frische."
    );
})();
