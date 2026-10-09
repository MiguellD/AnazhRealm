#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-schatten-bias.cjs — KLEINE WERFER WERFEN IHREN SCHATTEN (0710-12). Befund (Studio-Welle S3, Familie kreatur): der
// Schatten-Bias war EIN fester Meter-Wert für beide Kaskaden — `atmosphere.shadowBias` = 1,0 → `shadow.normalBias` 1,0 m
// (r184 schiebt die Probe des Empfängers um `normalWorld × normalBias` in Welt-Metern, ShadowNode). Der Boden fragte die
// Karte 1 m über sich selbst ab: kein Werfer unter ~1 m Höhe erreichte ihn — Wolf, Fuchs, Busch, Zaun-Pfosten, die Beine des
// Spielers warfen im Spielbild keinen sichtbaren Schatten (Boden-IoU ≈ 0). Die Kaskaden tragen an der Mess-Wiese 0,11 m (k0)
// und 0,19–0,25 m (k1) je Texel: 1 m waren 4–9 Texel.
// Die Wand (echter Renderer: NUR `--echt`, die GPU des Rechners mit Bild-Paaren; ohne `--echt` bricht sie laut ab, die CI fährt
// den Selbsttest):
//   (S) DER SCHATTEN: je Werfer (wolf, fuchs, busch, pfosten, spieler) auf der ebenen Bühne der Mess-Wiese, Sonne seitlich
//       (~26°) und mittags — drei Schüsse LEER · MIT · LEER2; die ERWARTUNG sind die Schatten-Dreiecke des Werfers (was mit
//       castShadow im Schatten-Pass zeichnet, gehäutet, je Instanz) entlang des Lichts auf den gezeichneten Boden projiziert,
//       die MESSUNG die Boden-Pixel, die er dunkler macht (ohne seine eigene Silhouette, ohne was zwischen LEER und LEER2
//       strömte); seitlich je Werfer Boden-IoU ≥ IOU_MIN, mittags ebenso, wo die Erwartung im Bild steht (sonst liegt der
//       Schatten unter dem Leib).
//   (A) DIE AKNE (die zweite Seite): je Sonne (tief, seitlich, mittags) drei KONVEXE Platten 8 × 8 m auf der Bühne — eben (die
//       große Fläche), im Streiflicht (der Hang, 10° gegen das Licht geneigt) und mit Dachneigung 40° zur Sonne. Ein konvexer
//       Körper beschattet sich nie selbst: jedes Pixel seiner beleuchteten Seiten, das dunkler wird, sobald er wirft, ist Akne
//       (gegen „wirft nicht", nur wo zwei gleiche Aufnahmen ruhen); je Blick ≤ AKNE_MAX. DIE ZÄHNE: bei 0,1 Texel ohne Tiefen-
//       und Hang-Bias muss die ebene Platte in tiefer Sonne Akne zeigen (sonst ist die Probe blind). Echtes Dach und echter Hang
//       zeigt `--echt` als Bild (ihre echten Kamin- und Relief-Schatten sind keine Akne — sie urteilt die Platte).
//   (Q) QUELLE: `.normalBias` schreibt nur das Gesetz (`_schattenNormalBias`), die EINE Quelle ist `atmosphere.shadowBias`;
//   (P) kein Page-Error.
// Die Bias-Steuerung der Probe (Versuche, die Zähne) hängt hinter der Box jeder Kaskade (`_kaskadeFit`), die Spiel-Werte kommen
// aus dem Gesetz des Stamms (`_schattenBias`). Nach jedem castShadow-Wechsel zeichnet das Bundle neu (`_archMeshBundleTouch`).
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): die Quell-Wand ist am Stamm grün und fällt bei einem fremden
// Schreiber rot; das Urteil fällt bei leerem Schatten, vakuöser Probe, Akne und blinder Akne-Probe rot.
//   node scripts/diag-schatten-bias.cjs [--selftest] [--echt] [--tag name]   (npm run gate:schatten-bias; Port SCHATTEN_BIAS_PORT)
//   Umgebung (Werkplatz): SB_NUR=wolf,fuchs (Werfer) · SB_ZEITEN=0.32 · SB_OHNE_AKNE=1 · SB_VERSUCH='{"n":1,"d":1.5}'
//   (der Bias der ganzen Probe: n/d in Texeln der Kaskade) · SB_AKNE_ZEITEN=0.28,0.32 · SB_DEBUG=1
// ─────────────────────────────────────────────────────────────────────────
"use strict";
const fs = require("fs");
const path = require("path");
const http = require("http");

const PORT = Number(process.env.SCHATTEN_BIAS_PORT || 4607);
const root = path.resolve(__dirname, "..");
const ECHT = process.argv.includes("--echt");
const TAG = (() => {
    const i = process.argv.indexOf("--tag");
    return i > 0 ? process.argv[i + 1] : "echt";
})();
const OUT = path.join(root, "artifacts", "schatten-bias", TAG);
const WERFER = ["wolf", "fuchs", "busch", "pfosten", "spieler"];
const IOU_MIN = 0.4;
// die Erwartung eines Werfers muss so viele Pixel neben seiner Silhouette tragen (sonst ist die Probe vakuös)
const ERWARTET_MIN = 150;
const AKNE_MAX = 0.01;
const AKNE_ZAEHNE_MIN = 0.03;
// so viele ruhende, beleuchtete Pixel einer Platte braucht ein Akne-Blick (sonst ist die Probe blind)
const MASKE_MIN = 2000;

// DIE QUELL-WAND (AST): jede Zuweisung an `….normalBias` steht im Gesetz (`_schattenNormalBias` oder einer Methode, die es
// ruft und nur dessen Ergebnis schreibt) — kein fester Meter-Wert neben dem Gesetz.
function quellWand(quelle) {
    const acorn = require("acorn");
    const ast = acorn.parse(quelle, { ecmaVersion: "latest", sourceType: "script", locations: true });
    const kinder = (n) => {
        const out = [];
        for (const k in n) {
            if (k === "type" || k === "start" || k === "end" || k === "loc") continue;
            const v = n[k];
            if (Array.isArray(v)) {
                for (const x of v) if (x && typeof x.type === "string") out.push(x);
            } else if (v && typeof v.type === "string") out.push(v);
        }
        return out;
    };
    const lauf = (n, f) => {
        f(n);
        for (const k of kinder(n)) lauf(k, f);
    };
    const befunde = [];
    let gesetz = false,
        schreiber = 0,
        tiefe = 0;
    lauf(ast, (m) => {
        if (m.type !== "MethodDefinition" || !m.value || !m.value.body) return;
        const name = m.key.name || String(m.key.value);
        if (name === "_schattenNormalBias") gesetz = true;
        lauf(m.value.body, (n) => {
            if (n.type !== "AssignmentExpression" || n.left.type !== "MemberExpression" || n.left.computed) return;
            // der Tiefen-Bias einer Schatten-Karte (`….shadow.bias`, `sh.bias`) steht nur im Gesetz (`_schattenBias`)
            if (
                n.left.property.name === "bias" &&
                /(^|\.)(shadow|sh)$/.test(quelle.slice(n.left.object.start, n.left.object.end))
            ) {
                tiefe++;
                if (name !== "_schattenBias")
                    befunde.push(
                        `${name} Zeile ${n.loc.start.line}: schreibt den Tiefen-Bias einer Schatten-Karte neben dem Gesetz — ${quelle
                            .slice(n.start, n.end)
                            .replace(/\s+/g, " ")
                            .slice(0, 80)}`
                    );
                return;
            }
            if (n.left.property.name !== "normalBias") return;
            schreiber++;
            const rechts = quelle.slice(n.right.start, n.right.end);
            if (!/_schattenNormalBias\(/.test(rechts))
                befunde.push(
                    `${name} Zeile ${n.loc.start.line}: schreibt normalBias ohne das Gesetz — ${quelle
                        .slice(n.start, n.end)
                        .replace(/\s+/g, " ")
                        .slice(0, 80)}`
                );
        });
    });
    if (!gesetz) befunde.push("das Gesetz `_schattenNormalBias` fehlt (der Bias ist ein fester Meter-Wert)");
    if (gesetz && (schreiber < 1 || tiefe < 1))
        befunde.push(`STUMPF: die Wand sieht ${schreiber} Schreiber von normalBias und ${tiefe} des Tiefen-Bias`);
    return befunde;
}

// DAS URTEIL (rein, Node): S = { werfer: [{ name, zeit, seitlich, iou, deckung, erwartet, gemessen, normalBias, fehler }],
// akne: [{ name, zeit, maske, dunkel, anteil }], zaehne: { maske, anteil }, fehler }
function urteil(S, Q, pageErrors) {
    const rot = [];
    for (const b of Q) rot.push(`(Q) QUELLE: ${b}`);
    if (S.fehler) rot.push(`(P) BÜHNE: ${S.fehler}`);
    const seitlich = new Set();
    for (const w of S.werfer || []) {
        if (w.fehler) {
            rot.push(`(S) ${w.name} @${w.zeit}: ${w.fehler}`);
            continue;
        }
        if (!(w.erwartet >= ERWARTET_MIN)) {
            // mittags liegt der Schatten eines flachen Leibs unter ihm — dort ist die Erwartung kein Befund
            if (w.seitlich)
                rot.push(
                    `(S) ${w.name} @${w.zeit}: die Erwartung ist zu klein im Bild (${w.erwartet} px) — die Probe ist vakuös`
                );
            continue;
        }
        if (w.seitlich) seitlich.add(w.name);
        if (!(w.iouSaum >= IOU_MIN))
            rot.push(
                `(S) ${w.name} @${w.zeit}: Boden-IoU (Saum ${w.saumPx} px) ${w.iouSaum} < ${IOU_MIN} (gemessen ${w.gemessen} px, erwartet ${w.erwartet} px, ` +
                    `Deckung ${w.deckung}) — der Werfer wirft keinen sichtbaren Schatten (normalBias ${JSON.stringify(w.normalBias)})`
            );
    }
    for (const n of WERFER)
        if (!seitlich.has(n) && !(S.werfer || []).some((w) => w.name === n && w.seitlich))
            rot.push(`(S) ${n}: in der seitlichen Sonne nicht gemessen`);
    for (const a of S.akne || []) {
        if (!(a.maske >= MASKE_MIN))
            rot.push(
                `(A) ${a.name}: nur ${a.maske} ruhende, beleuchtete Pixel der Platte im Bild — die Akne-Probe ist blind`
            );
        else if (!(a.anteil <= AKNE_MAX))
            rot.push(
                `(A) AKNE ${a.name}: ${(a.anteil * 100).toFixed(2)} % der beleuchteten Fläche verdunkeln sich selbst ` +
                    `(> ${AKNE_MAX * 100} %; ein konvexer Körper wirft nie auf sich)`
            );
    }
    if (!(S.akne && S.akne.length >= 6)) rot.push(`(A) zu wenige Akne-Blicke (${(S.akne || []).length} von 9)`);
    if (!S.zaehne) rot.push("(A) ZÄHNE: die Gegenprobe lief nicht");
    else if (!(S.zaehne.maske >= MASKE_MIN && S.zaehne.anteil >= AKNE_ZAEHNE_MIN))
        rot.push(
            `(A) ZÄHNE: bei 0,1 Texel ohne Tiefen- und Hang-Bias zeigt die Platte nur ${(S.zaehne.anteil * 100).toFixed(2)} % ` +
                `Akne (${S.zaehne.maske} Pixel) — die Probe sieht keine`
        );
    for (const e of pageErrors || []) rot.push(`(P) PAGE-ERROR: ${e}`);
    return rot;
}

if (process.argv.includes("--selftest")) {
    console.log("=== SCHATTEN-BIAS — Selbsttest (ohne Browser) ===");
    const v = [];
    const stammQ = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    const stamm = quellWand(stammQ);
    for (const b of stamm) v.push("STAMM: " + b);
    const fremd = quellWand(
        "class X { _schattenNormalBias(t) { return t; } a(l) { l.shadow.normalBias = this._schattenNormalBias(1); } b(l) { l.shadow.normalBias = this._schattenNormalBias(2); } c(l) { l.shadow.normalBias = 1.0; } }"
    );
    if (!fremd.some((b) => b.includes("ohne das Gesetz")))
        v.push(`ein fester Meter-Wert fällt nicht rot (${JSON.stringify(fremd)})`);
    const ohne = quellWand("class X { a(l) { l.shadow.normalBias = 1.0; } }");
    const nudge = quellWand(
        "class X { _schattenNormalBias(t) { return t; } _schattenBias(l, t) { l.shadow.normalBias = this._schattenNormalBias(t); l.shadow.bias = -t; } k(sh) { sh.bias =\n        -0.25 / 500; } }"
    );
    if (!nudge.some((b) => b.includes("Tiefen-Bias einer Schatten-Karte neben dem Gesetz")))
        v.push(`ein fester Tiefen-Nudge neben dem Gesetz fällt nicht rot (${JSON.stringify(nudge)})`);
    // der Täter-Text steht wörtlich, Leerraum gefaltet (Nachtrag 0710-12: `/s+/g` ohne Backslash nannte „hadow.bia")
    if (!nudge.some((b) => b.endsWith("sh.bias = -0.25 / 500")))
        v.push(`der Täter-Text des Tiefen-Nudge ist verstümmelt (${JSON.stringify(nudge)})`);
    if (!ohne.some((b) => b.includes("fehlt")))
        v.push(`ein Stamm ohne Gesetz fällt nicht rot (${JSON.stringify(ohne)})`);
    const werfer = (zeit, seitlich) =>
        WERFER.map((name) => ({
            name,
            zeit,
            seitlich,
            iouSaum: 0.6,
            saumPx: 9,
            iou: 0.4,
            erwartet: 900,
            gemessen: 800,
            deckung: 0.7,
        }));
    const gut = {
        werfer: werfer(0.32, true).concat(werfer(0.5, false)),
        akne: ["eben", "streif", "dach"].flatMap((p) =>
            [0.28, 0.32, 0.5].map((z) => ({ name: `${p}@${z}`, maske: 40000, anteil: 0.002 }))
        ),
        zaehne: { maske: 40000, anteil: 0.2 },
    };
    const kopie = (f) => {
        const s = JSON.parse(JSON.stringify(gut));
        f(s);
        return s;
    };
    const faelle = [
        ["ein leerer Wolf-Schatten", (s) => (s.werfer[0].iouSaum = 0.02), /wolf @0\.32: Boden-IoU \(Saum 9 px\) 0\.02/],
        ["ein vakuöser Fuchs in der seitlichen Sonne", (s) => (s.werfer[1].erwartet = 4), /fuchs @0\.32: .*vakuös/],
        [
            "ein Werfer fehlt seitlich",
            (s) => (s.werfer = s.werfer.filter((w) => !(w.name === "busch" && w.seitlich))),
            /busch: in der seitlichen Sonne nicht gemessen/,
        ],
        ["Akne auf der ebenen Platte", (s) => (s.akne[0].anteil = 0.2), /AKNE eben@0\.28: 20\.00 %/],
        ["eine blinde Akne-Probe", (s) => (s.akne[4].maske = 30), /streif@0\.32: nur 30 ruhende/],
        ["die Zähne sehen keine Akne", (s) => (s.zaehne.anteil = 0), /ZÄHNE: .*sieht keine/],
        [
            "ein Werfer bricht ab",
            (s) => (s.werfer[3].fehler = "Werfer nicht gesetzt"),
            /pfosten @0\.32: Werfer nicht gesetzt/,
        ],
    ];
    if (urteil(gut, [], []).length) v.push(`ein gutes Bild fällt rot (${JSON.stringify(urteil(gut, [], []))})`);
    const mittag = kopie((s) => (s.werfer[5].erwartet = 20));
    if (urteil(mittag, [], []).length)
        v.push("ein Schatten unter dem Leib mittags fällt rot (dort ist er kein Befund)");
    for (const [name, f, muss] of faelle) {
        const rot = urteil(kopie(f), [], []);
        if (!rot.some((x) => muss.test(x))) v.push(`${name} fällt nicht rot (${JSON.stringify(rot)})`);
        else console.log(`  ✅ ${name} → ${rot.find((x) => muss.test(x))}`);
    }
    for (const x of v) console.log("  ❌ " + x);
    if (v.length) {
        console.log("\n❌ SELBSTTEST ROT");
        process.exit(1);
    }
    console.log(
        "✅ SELBSTTEST GRÜN — normalBias schreibt nur das Gesetz; ein fester Wert, ein leerer Schatten, eine vakuöse Probe, Akne und eine blinde Akne-Probe fallen rot."
    );
    process.exit(0);
}

// DIE BILD-PROBE NUR AUF DER ECHTEN GPU (Nachtrag 0710-12): swiftshader landete ohne `?holz` über die Holz-Wahl des Stamms
// auf kienspan — ohne Schatten-Karte, die Probe hatte nichts zu messen —, und mit `?holz=voll` kostet jedes Programm auf
// swiftshader 50–70 s: der Lauf brach nach 1200 s ohne Urteil ab (EXIT 124). Die CI fährt den Selbsttest (Quell-Wand und
// Urteil), das Bild-Urteil fährt `--echt`. Ohne `--echt` bricht die Linse LAUT ab, nie still auf einem schattenlosen Holz.
if (!ECHT) {
    console.error(
        "SCHATTEN-BIAS: die Bild-Probe läuft nur mit --echt (die GPU des Rechners) — swiftshader landet auf dem Holz " +
            "kienspan ohne Schatten-Karte; ohne Browser: --selftest"
    );
    process.exit(2);
}

const puppeteer = require("puppeteer");
const { echteWebGpuArgs } = require("./lib/software-gpu.cjs");
const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");
const W = 960,
    H = 540;
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

// DIE BÜHNE (in der Seite): Boot, Foundry, die ebene Bühne der Mess-Wiese, Tiere fort.
async function buehneBauen() {
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
    const dl = performance.now() + 300000;
    while ((!window.anazhRealm || typeof window.anazhRealm._gameLoopTick !== "function") && performance.now() < dl)
        await sleep(200);
    const r = window.anazhRealm;
    const st = r.state;
    if (!st.renderer || st.renderer._isHeadlessNull) return { fatal: "kein echter Renderer" };
    const f = r._ensureAssetFoundry();
    while (!(f && f.ready && f.recipeCount > 0) && performance.now() < dl) await sleep(200);
    const bx = -893.8,
        bz = -844.9;
    st.playerMesh.position.set(bx - 3, r._voxelSurfaceY(bx - 3, bz) + 1.8, bz);
    let stabil = 0,
        last = -1;
    for (let t = 0; t < 600 && stabil < 25; t++) {
        try {
            r._gameLoopTick(performance.now());
        } catch (_e) {}
        const sz = st.voxelChunks ? st.voxelChunks.size : 0;
        stabil = sz === last ? stabil + 1 : 0;
        last = sz;
        await sleep(40);
    }
    for (const c of [...st.creatures]) if (Math.hypot(c.position.x - bx, c.position.z - bz) < 80) r.removeCreature(c);
    window.__sb = { bx, bz };
    return { bx, bz, gy: r._voxelSurfaceY(bx, bz), csm: !!st.csmNode };
}

// DIE PROBE (in der Seite): Werfer und Akne-Platten, je Sonne
async function probe(cfg) {
    const r = window.anazhRealm;
    const st = r.state;
    const T = window.THREE;
    const rend = st.renderer;
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
    const { bx, bz } = window.__sb;
    const W = cfg.W,
        H = cfg.H;
    const csm = st.csmNode;
    const K = r.constructor.SCHATTEN_KASKADE;
    const aus = { werfer: [], fern: [], akne: [], echt: [], bilder: [], zaehne: null, bias: null, texel: null };
    rend.setAnimationLoop(null);
    // DIE UHR STEHT: jeder Spiel-Takt rückt die Tageszeit vor (gemessen 09.10.: zwischen dem LEER und dem LEER2 eines Werfers
    // wanderte die Sonne von 27° auf 36°, 12 665 Pixel „strömten") — nach jedem Takt steht sie wieder auf der Zeit der Probe.
    let zeitFest = null;
    const uhrHalten = () => {
        if (zeitFest === null) return;
        st.timeOfDay = zeitFest;
        if (st.world) st.world.timeOfDay = zeitFest;
        r._applyDayNightToScene();
    };
    const halten = async (n) => {
        for (let t = 0; t < n; t++) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            uhrHalten();
            await sleep(25);
        }
        rend.setAnimationLoop(null);
    };
    // DIE SONNE: Bühne (Sonne, Sommer, Wetter gehalten), dann die Tageszeit — und der Himmel als Licht folgt ihr SOFORT (sonst
    // malte der Loop ihn im ersten Werfer-Halt nach der Drift-Schwelle neu: LEER und MIT trugen verschiedene Himmel, das
    // „strömte"-Maß verwarf das ganze Bild — der erste Werfer je Sonne war vakuös).
    const sonne = async (zeit) => {
        window.__buehne();
        zeitFest = zeit;
        st.timeOfDay = zeit;
        if (st.world) st.world.timeOfDay = zeit;
        r._applyDayNightToScene();
        await halten(6);
        st._skyEnvLastRegenMs = -Infinity;
        r._ensureSkyEnvironment(false);
        r._applyDayNightToScene();
        await halten(4);
    };
    const wieseAus = () => {
        if (st.nahWiese && st.nahWiese.gruppe) st.nahWiese.gruppe.visible = false;
    };
    // DIE BIAS-STEUERUNG: „spiel" = das Gesetz des Stamms (`_schattenBias` je Kaskade; ohne Gesetz der feste Meter-Wert und der
    // Tiefen-Nudge `biasM`), „versuch" = n/d in Texeln der Kaskade. Sie hängt hinter jeder neuen Box (`_kaskadeFit`) und gilt
    // sofort auf der aktuellen.
    const lichter = csm && csm.lights ? csm.lights : [];
    let modus = { art: "spiel" };
    const texelVon = (sh, f) => Math.max(f.W / sh.mapSize.width, f.H / sh.mapSize.height);
    const biasFuer = (i, f) => {
        const lw = lichter[i];
        if (!lw || !f) return;
        const sh = lw.shadow;
        if (modus.art === "spiel") {
            if (typeof r._schattenBias === "function") r._schattenBias(lw, texelVon(sh, f), f.zt - f.zb);
            else {
                const a = st.atmosphere && Number.isFinite(st.atmosphere.shadowBias) ? st.atmosphere.shadowBias : 1;
                sh.normalBias = a;
                if (K && K.biasM) sh.bias = K.biasM[Math.min(i, K.biasM.length - 1)] / (f.zt - f.zb);
            }
            return;
        }
        const tex = texelVon(sh, f);
        sh.normalBias = modus.n * tex;
        sh.bias = (-(modus.d || 0) * tex) / (f.zt - f.zb);
    };
    if (csm) {
        const fitRoh = Object.getPrototypeOf(r)._kaskadeFit;
        r._kaskadeFit = function (c, i, ...rest) {
            const f = fitRoh.call(this, c, i, ...rest);
            if (modus.art !== "spiel") biasFuer(i, f);
            return f;
        };
    }
    const biasAnwenden = () => {
        lichter.forEach((lw, i) => biasFuer(i, csm._anazhFit && csm._anazhFit[i]));
    };
    const biasSetzen = (m) => {
        modus = m;
        biasAnwenden();
    };
    const grund = cfg.versuch ? Object.assign({ art: "versuch" }, cfg.versuch) : { art: "spiel" };
    const lum = (u, i) => 0.2126 * u[i] + 0.7152 * u[i + 1] + 0.0722 * u[i + 2];
    const kamSetzen = (k) => {
        const cam = st.camera;
        cam.position.set(k.px, k.py, k.pz);
        cam.lookAt(k.lx, k.ly, k.lz);
        cam.updateMatrixWorld(true);
    };
    const schuss = async (k) => {
        let u8 = null;
        for (let i = 0; i < 2; i++) {
            uhrHalten();
            wieseAus();
            kamSetzen(k);
            biasAnwenden();
            r._schattenAlleNeu();
            u8 = (await window.__ausgabeAufnahme(W, H, 1)).u8;
        }
        return u8;
    };
    const lichtDir = () => {
        const dl = st.directionalLight;
        const a = new T.Vector3(),
            b = new T.Vector3();
        dl.getWorldPosition(a);
        dl.target.getWorldPosition(b);
        return b.sub(a).normalize(); // von der Sonne zum Boden
    };
    const boden = (x, z) => {
        // der gezeichnete Boden (ohne Träger liefert `_standSicht` die Boden-Karte des Meshes, Lehre 22)
        const y = r._standSicht(x, z, NaN);
        return Number.isFinite(y) ? y : r._voxelSurfaceY(x, z);
    };
    // DIE SCHATTEN-DREIECKE eines Körpers: jedes Mesh im Teilbaum (und jede Instanz eines Slots), das im Schatten-Pass zeichnet
    // (castShadow, sichtbar, eine Ebene der Kaskaden-Kamera), in Welt-Koordinaten
    const ebenen =
        csm && csm.lights && csm.lights[0]
            ? csm.lights[0].shadow.camera.layers
            : st.directionalLight.shadow.camera.layers;
    const sichtbar = (o) => {
        for (let x = o; x; x = x.parent) if (x.visible === false) return false;
        return true;
    };
    const dreieckeAus = (mesh, matrizen, aus3) => {
        const g = mesh.geometry;
        if (!g || !g.attributes || !g.attributes.position) return;
        const pos = g.attributes.position;
        const idx = g.index;
        const n = idx ? idx.count : pos.count;
        const v = new T.Vector3();
        const ecken = [];
        const nV = pos.count;
        const welt = new Float32Array(nV * 3);
        for (const m of matrizen) {
            for (let i = 0; i < nV; i++) {
                if (mesh.isSkinnedMesh && typeof mesh.getVertexPosition === "function") mesh.getVertexPosition(i, v);
                else v.fromBufferAttribute(pos, i);
                v.applyMatrix4(m);
                welt[i * 3] = v.x;
                welt[i * 3 + 1] = v.y;
                welt[i * 3 + 2] = v.z;
            }
            for (let t = 0; t + 2 < n; t += 3) {
                for (let c = 0; c < 3; c++) ecken[c] = idx ? idx.getX(t + c) : t + c;
                for (let c = 0; c < 3; c++)
                    aus3.push(welt[ecken[c] * 3], welt[ecken[c] * 3 + 1], welt[ecken[c] * 3 + 2]);
            }
        }
    };
    const fund = [];
    const werferDreiecke = (wurzeln, slots) => {
        const aus3 = [];
        fund.length = 0;
        for (const w of wurzeln)
            if (w)
                w.traverse((o) => {
                    if (o.isMesh && fund.length < 12)
                        fund.push(
                            `${o.name || o.type}${o.isSkinnedMesh ? "/haut" : ""}${o.isInstancedMesh ? "/inst" : ""} cs=${o.castShadow} vis=${sichtbar(o)} ebn=${o.layers.mask}`
                        );
                    if (!o.isMesh || !o.castShadow || !sichtbar(o) || !o.layers.test(ebenen)) return;
                    if (o.isInstancedMesh) return; // Instanzen kommen über die Slots
                    o.updateMatrixWorld(true);
                    if (o.isSkinnedMesh && o.skeleton) o.skeleton.update();
                    dreieckeAus(o, [o.matrixWorld], aus3);
                });
        for (const ref of slots || []) {
            const g = st.archInstanceGroups && st.archInstanceGroups.get(ref.key);
            if (fund.length < 12)
                fund.push(
                    `slot ${ref.key} cs=${g && g.mesh && g.mesh.castShadow} ebn=${g && g.mesh && g.mesh.layers.mask}`
                );
            if (!g || !g.mesh || !g.mesh.castShadow || !g.mesh.layers.test(ebenen)) continue;
            const m = new T.Matrix4();
            g.mesh.getMatrixAt(ref.slot, m);
            g.mesh.updateMatrixWorld(true);
            m.premultiply(g.mesh.matrixWorld);
            dreieckeAus(g.mesh, [m], aus3);
        }
        return aus3;
    };
    // die Masken: Dreiecke in Bild-Pixel (oben links), gefüllt auf einer Leinwand
    const maske = (dreiecke, abbild) => {
        const cv = document.createElement("canvas");
        cv.width = W;
        cv.height = H;
        const ctx = cv.getContext("2d");
        ctx.fillStyle = "#fff";
        const cam = st.camera;
        const v = new T.Vector3();
        const px = (x, y, z) => {
            v.set(x, y, z);
            abbild(v);
            v.project(cam);
            return [((v.x + 1) / 2) * W, ((1 - v.y) / 2) * H, v.z];
        };
        for (let i = 0; i < dreiecke.length; i += 9) {
            const a = px(dreiecke[i], dreiecke[i + 1], dreiecke[i + 2]);
            const b = px(dreiecke[i + 3], dreiecke[i + 4], dreiecke[i + 5]);
            const c = px(dreiecke[i + 6], dreiecke[i + 7], dreiecke[i + 8]);
            if (a[2] > 1 || b[2] > 1 || c[2] > 1) continue;
            ctx.beginPath();
            ctx.moveTo(a[0], a[1]);
            ctx.lineTo(b[0], b[1]);
            ctx.lineTo(c[0], c[1]);
            ctx.closePath();
            ctx.fill();
        }
        const d = ctx.getImageData(0, 0, W, H).data;
        const m = new Uint8Array(W * H);
        for (let i = 0; i < W * H; i++) m[i] = d[i * 4] > 127 ? 1 : 0;
        return m;
    };
    // eine Maske um `rand` Pixel schrumpfen (Kanten, Kanten-Glättung und die zeitliche Auflösung zählen nicht)
    const schrumpf = (m, rand) => {
        const o = new Uint8Array(W * H);
        for (let y = rand; y < H - rand; y++)
            for (let x = rand; x < W - rand; x++) {
                let alle = 1;
                for (let dy = -rand; dy <= rand && alle; dy += rand)
                    for (let dx = -rand; dx <= rand; dx += rand) if (!m[(y + dy) * W + x + dx]) alle = 0;
                o[y * W + x] = alle;
            }
        return o;
    };
    const png = (u8, ueber) => {
        const cv = document.createElement("canvas");
        cv.width = W;
        cv.height = H;
        const ctx = cv.getContext("2d");
        const img = ctx.createImageData(W, H);
        img.data.set(u8.subarray(0, W * H * 4));
        if (ueber)
            for (let i = 0; i < W * H; i++) {
                if (ueber.e[i] && !ueber.m[i]) {
                    img.data[i * 4 + 2] = 255; // erwartet, nicht gemessen: blau
                } else if (ueber.m[i] && !ueber.e[i]) {
                    img.data[i * 4] = 255; // gemessen, nicht erwartet: rot
                }
            }
        ctx.putImageData(img, 0, 0);
        return cv.toDataURL("image/png");
    };
    // castShadow eines gesetzten Baus an/aus (je Instanz-Gruppe seiner Slots, das Bundle zeichnet neu)
    const merk = new Map();
    const bauWirft = (e, an) => {
        for (const ref of (e && e.instSlots) || []) {
            const g = st.archInstanceGroups.get(ref.key);
            if (!g || !g.mesh) continue;
            if (!merk.has(g.mesh)) merk.set(g.mesh, g.mesh.castShadow);
            g.mesh.castShadow = an ? merk.get(g.mesh) : false;
            r._archMeshBundleTouch(g.mesh);
        }
        if (e && e.mesh)
            e.mesh.traverse((o) => {
                if (!o.isMesh) return;
                if (!merk.has(o)) merk.set(o, o.castShadow);
                o.castShadow = an ? merk.get(o) : false;
            });
    };
    const bauSetzen = async (typ, x, z, rotY) => {
        const e = r.spawnArchitecture(typ, { x, y: boden(x, z) + 0.5, z }, { silent: true, rotationY: rotY || 0 });
        if (!e) return null;
        // die nahe Stufe (die Stufen-Wahl der Bauten geht vom Spieler aus; ein Impostor-Slot trägt keinen Schatten-Leib)
        for (let t = 0; t < 240 && !((e.instSlots || e.mesh) && (e._lodLevel == null || e._lodLevel === 0)); t++)
            await halten(1);
        await halten(10);
        return e;
    };
    // die Werfer
    const gyB = boden(bx, bz);
    const pfostenBp = (() => {
        const n = "schatten_pfosten";
        if (!st.blueprints[n]) {
            r.createBlueprint(n, "Zaun-Pfosten");
            r.addPartToBlueprint(n, {
                shape: "cube",
                material: "holz",
                position: { x: 0, y: 0.5, z: 0 },
                size: { x: 0.14, y: 1.0, z: 0.14 },
            });
        }
        return n;
    })();
    const buschArt = ["grown_busch_hazel_v2", "busch_hazel"].find((n) => st.blueprints[n]) || null;
    const werferArten = [
        { name: "wolf", art: "tier", seele: "wolf" },
        { name: "fuchs", art: "tier", seele: "fuchs" },
        { name: "busch", art: "bau", typ: buschArt },
        { name: "pfosten", art: "bau", typ: pfostenBp },
        { name: "spieler", art: "spieler" },
    ];
    const setze = async (w, o = { x: bx, z: bz, gy: gyB }) => {
        if (w.art === "tier") {
            const c = r.spawnCreatureAt(o.x, o.gy + 0.5, o.z, "happy", w.seele, { bodySize: 1 });
            if (!c) return null;
            c.userData.task = { name: "wait", args: {}, since: performance.now() / 1000 };
            c.userData.emotions = null;
            await halten(25);
            c.position.x = o.x;
            c.position.z = o.z;
            return {
                weg: () => r.removeCreature(c),
                wurzeln: () => [c.userData._tierBaum && c.userData._tierBaum.wrap, c.mesh],
                slots: () => [],
            };
        }
        if (w.art === "bau") {
            if (!w.typ) return null;
            const e = await bauSetzen(w.typ, o.x, o.z, 0.4);
            if (!e) return null;
            return {
                weg: () => r.removeArchitecture(e),
                wurzeln: () => [e.mesh],
                slots: () => e.instSlots || [],
                stufe: e._lodLevel,
            };
        }
        if (w.art === "spieler") {
            // die Beine des Spielers: in der Ego-Sicht blendet `_applyEgoSicht` Kopf und Haut aus (sie werfen dann gar nicht) —
            // die Probe misst den Leib in der 3rd-Sicht
            const modusAlt = st.cameraMode;
            st.cameraMode = "third";
            r._applyEgoSicht();
            st.playerMesh.position.set(o.x, o.gy + 0.9, o.z);
            st.playerMesh.visible = true;
            await halten(10);
            st.playerMesh.position.set(o.x, st.playerMesh.position.y, o.z);
            st.playerMesh.visible = true;
            return {
                weg: () => {
                    st.cameraMode = modusAlt;
                    r._applyEgoSicht();
                    st.playerMesh.visible = false;
                },
                wurzeln: () => [st.playerMesh],
                slots: () => [],
            };
        }
        return null;
    };
    // der Spieler unsichtbar, aber NAH (die Stufen-Wahl der Bauten und Tiere geht von ihm aus)
    const verstecken = () => {
        st.playerMesh.visible = false;
        st.playerMesh.position.set(bx - 4, boden(bx - 4, bz + 4) + 0.9, bz + 4);
    };
    // DIE ISOLATION (die Labor-Bedingung jeder Messung): die Bühne liegt am Wald-Rand — in seitlicher Sonne (26°) lag sie ganz
    // im Schatten der Bäume (vorher wie nachher 0 px: kein Bias-Urteil möglich). Während einer Messung sieht jede Kaskaden-
    // Kamera nur die Ebene ISO, und auf ihr liegt allein der gemessene Körper (r184 testet `object.layers` gegen die Schatten-
    // Kamera; im Schatten-Pass ist ein Region-Bundle eine Gruppe, three projiziert seine Kinder frisch). Box, Bias und Takt der
    // Kaskaden bleiben die des Spiels.
    const ISO = 30;
    const isoAlt = lichter.map((lw) => lw.shadow.camera.layers.mask);
    const isoAn = () => lichter.forEach((lw) => lw.shadow.camera.layers.set(ISO));
    const isoAus = () => lichter.forEach((lw, i) => (lw.shadow.camera.layers.mask = isoAlt[i]));
    // DIE SCHATTEN-PIPELINE VORWÄRMEN: unter der Isolation zeichnet ein frisch gesetzter Körper erst nach dem Aufschalten der
    // Ebene zum ersten Mal in den Schatten-Pass; seine Pipeline entsteht asynchron, r184 überspringt den Zug bis dahin (Werkbank
    // 09.10.: derselbe Fuchs warf 1 077 Pixel, wenn seine Pipeline schon stand — in der Sonde 12). Frames mit kurzen Pausen,
    // bis die Erst-Zeichnung ruht (mindestens 6, höchstens 60).
    const schattenWarm = async (k) => {
        const E = r._erstZeichnung;
        for (let i = 0; i < 60; i++) {
            wieseAus();
            kamSetzen(k);
            biasAnwenden();
            r._schattenAlleNeu();
            if (rend._nodes && rend._nodes.nodeFrame) rend._nodes.nodeFrame.update();
            r._loopRender(performance.now());
            await sleep(50);
            if (i >= 5 && (!E || E.offen.size === 0)) break;
        }
    };
    const isoEbene = (wurzeln, slots, an) => {
        const setz = (m) => (an ? m.layers.enable(ISO) : m.layers.disable(ISO));
        for (const w of wurzeln) if (w) w.traverse((o) => o.isMesh && setz(o));
        for (const ref of slots || []) {
            const g = st.archInstanceGroups.get(ref.key);
            if (g && g.mesh) setz(g.mesh);
        }
    };
    const kameraFuer = () => {
        const d = lichtDir();
        const h = Math.hypot(d.x, d.z) || 1;
        const sx = d.x / h,
            sz = d.z / h; // die Schatten-Richtung auf dem Boden
        // seitlich zur Schatten-Linie, etwas hinter dem Werfer, schräg von oben
        const qx = -sz,
            qz = sx;
        return {
            px: bx - sx * 1.2 + qx * 3.6,
            py: gyB + 3.4,
            pz: bz - sz * 1.2 + qz * 3.6,
            lx: bx + sx * 1.0,
            ly: gyB + 0.1,
            lz: bz + sz * 1.0,
        };
    };
    const messen = async (w, zeit, seitlich) => {
        verstecken();
        isoAn();
        const k = kameraFuer();
        const leer = await schuss(k);
        const h = await setze(w);
        if (!h) {
            isoAus();
            return { name: w.name, zeit, seitlich, fehler: "Werfer nicht gesetzt" };
        }
        const wz = h.wurzeln(),
            sl = h.slots();
        isoEbene(wz, sl, true);
        await schattenWarm(k);
        const mit = await schuss(k);
        const dreiecke = werferDreiecke(wz, sl);
        const d = lichtDir();
        const projiziert = (v) => {
            // entlang des Lichts auf den gezeichneten Boden (zwei Schritte: die Höhe am Fußpunkt der ersten Projektion)
            let y = gyB;
            for (let s = 0; s < 2; s++) {
                const t = (y - v.y) / d.y;
                const x = v.x + d.x * t,
                    z = v.z + d.z * t;
                y = boden(x, z);
                if (s === 1) v.set(x, y, z);
            }
        };
        const E = maske(dreiecke, projiziert);
        const S = maske(dreiecke, () => {});
        const nb = lichter.map((lw) => +lw.shadow.normalBias.toFixed(3));
        // die Ebene fällt VOR dem Entfernen: das Entfernen wirkt erst im Takt (der Pfosten warf in LEER2 weiter, die Erwartung
        // fiel als „strömte" auf 22 px), und Spiel-Takte dazwischen änderten Licht und Belichtung im ganzen Bild — so trägt LEER2
        // genau die Werfer von LEER: keinen
        isoEbene(wz, sl, false);
        h.weg();
        verstecken();
        const leer2 = await schuss(k);
        isoAus();
        // das Entfernen wirkt im Takt: ohne diese Takte stand der Fuchs noch im LEER des Pfostens (nicht mehr in LEER2), genau
        // über dessen Schatten — die Erwartung fiel als „strömte" auf 0 px
        await halten(6);
        // die Region: die Erwartung samt Rand
        let x0 = W,
            x1 = 0,
            y0 = H,
            y1 = 0;
        for (let y = 0; y < H; y++)
            for (let x = 0; x < W; x++)
                if (E[y * W + x] && !S[y * W + x]) {
                    if (x < x0) x0 = x;
                    if (x > x1) x1 = x;
                    if (y < y0) y0 = y;
                    if (y > y1) y1 = y;
                }
        const rand = 24;
        x0 = Math.max(0, x0 - rand);
        y0 = Math.max(0, y0 - rand);
        x1 = Math.min(W - 1, x1 + rand);
        y1 = Math.min(H - 1, y1 + rand);
        let schnitt = 0,
            vereint = 0,
            gemessen = 0,
            erwartet = 0,
            stroemte = 0;
        const M = new Uint8Array(W * H),
            Eo = new Uint8Array(W * H);
        for (let y = y0; y <= y1; y++)
            for (let x = x0; x <= x1; x++) {
                const i = y * W + x;
                if (S[i]) continue;
                const p = i * 4;
                if (Math.abs(lum(leer2, p) - lum(leer, p)) > 4) {
                    stroemte++;
                    continue;
                }
                const m = lum(mit, p) < lum(leer, p) - 8 ? 1 : 0;
                const e = E[i];
                M[i] = m;
                Eo[i] = e;
                gemessen += m;
                erwartet += e;
                if (m && e) schnitt++;
                if (m || e) vereint++;
            }
        // DAS MASS MIT SAUM: der Bias versetzt jeden Schatten um seine eigene Größe (die Probe sitzt normalBias über dem Boden: der
        // Schatten rückt um normalBias · cot(Sonnenhöhe) zum Werfer; der Tiefen-Nudge nimmt das Stück am Fuß) — ein Pixel trifft,
        // wenn er höchstens EINEN Texel der nahen Kaskade (auf den Schirm am Werfer projiziert) neben der Erwartung liegt, und
        // die Erwartung ist getroffen, wenn ein gemessener Pixel so nah liegt. IoU mit Saum = TP / (TP + FP + FN).
        const f0 = csm && csm._anazhFit && csm._anazhFit[0];
        const texel0 = f0 && lichter[0] ? texelVon(lichter[0].shadow, f0) : 0.15;
        const kam = st.camera;
        const abstand = Math.hypot(k.px - bx, k.py - gyB, k.pz - bz);
        const pxJeM = H / (2 * abstand * Math.tan(((kam.fov || 75) * Math.PI) / 360));
        const saum = Math.max(2, Math.round(texel0 * pxJeM));
        const dehne = (m) => {
            const a = new Uint8Array(W * H),
                b = new Uint8Array(W * H);
            for (let y = 0; y < H; y++)
                for (let x = 0; x < W; x++) {
                    let v = 0;
                    for (let dx = -saum; dx <= saum && !v; dx++) {
                        const xx = x + dx;
                        if (xx >= 0 && xx < W && m[y * W + xx]) v = 1;
                    }
                    a[y * W + x] = v;
                }
            for (let y = 0; y < H; y++)
                for (let x = 0; x < W; x++) {
                    let v = 0;
                    for (let dy = -saum; dy <= saum && !v; dy++) {
                        const yy = y + dy;
                        if (yy >= 0 && yy < H && a[yy * W + x]) v = 1;
                    }
                    b[y * W + x] = v;
                }
            return b;
        };
        const Ed = dehne(Eo),
            Md = dehne(M);
        let tp = 0,
            fp = 0,
            fn = 0;
        for (let i = 0; i < W * H; i++) {
            if (M[i]) Ed[i] ? tp++ : fp++;
            if (Eo[i] && !Md[i]) fn++;
        }
        const erg = {
            name: w.name,
            zeit,
            seitlich,
            iouSaum: tp + fp + fn ? +(tp / (tp + fp + fn)).toFixed(3) : 0,
            saumPx: saum,
            iou: vereint ? +(schnitt / vereint).toFixed(3) : 0,
            deckung: erwartet ? +(schnitt / erwartet).toFixed(3) : 0,
            gemessen,
            erwartet,
            stroemte,
            dreiecke: dreiecke.length / 9,
            stufe: h.stufe == null ? null : h.stufe,
            fund: fund.slice(),
            licht: d.toArray().map((x) => +x.toFixed(3)),
            normalBias: nb,
        };
        if (cfg.bilder)
            aus.bilder.push({
                name: `${w.name}-${zeit}`,
                mit: png(mit),
                ueber: png(mit, { e: Eo, m: M }),
                leer: png(leer),
            });
        return erg;
    };
    // DAS FERN-BILD (k1): die nahe Kaskade reicht an der Wiese bis ~108 m, dahinter trägt k1 (Texel 0,15–0,41 m). Der Werfer steht
    // auf dem offenen Fleck, die Kamera 130 m SENKRECHT über ihm (flach über die Wiese verdeckte der Wald jeden Blick aus 125 m) —
    // die Tiefe 130 m liegt in k1. Gezählt werden die abgedunkelten Pixel außerhalb der eigenen Silhouette im Ausschnitt (Info,
    // kein Urteil: ein Wolf ist dort 4–5 Pixel groß), das Bild ist die Lupe (Ausschnitt ×10).
    const fernMessen = async (w, zeit) => {
        verstecken();
        isoAn();
        const o = { x: fleck.x, z: fleck.z, gy: boden(fleck.x, fleck.z) };
        // der unsichtbare Spieler neben dem Fleck (die Stufen-Wahl von Bau und Tier geht von ihm aus)
        st.playerMesh.position.set(o.x - 6, boden(o.x - 6, o.z + 6) + 0.9, o.z + 6);
        const k = { px: o.x + 4, py: o.gy + 130, pz: o.z, lx: o.x, ly: o.gy, lz: o.z };
        const leer = await schuss(k);
        const hh = await setze(w, o);
        if (!hh) {
            isoAus();
            return { name: w.name, zeit, fehler: "Werfer nicht gesetzt" };
        }
        const wz = hh.wurzeln(),
            sl = hh.slots();
        isoEbene(wz, sl, true);
        await schattenWarm(k);
        const mit = await schuss(k);
        const dreiecke = werferDreiecke(wz, sl);
        const d = lichtDir();
        const projiziert = (v) => {
            let y = o.gy;
            for (let s = 0; s < 2; s++) {
                const t = (y - v.y) / d.y;
                const x = v.x + d.x * t,
                    z = v.z + d.z * t;
                y = boden(x, z);
                if (s === 1) v.set(x, y, z);
            }
        };
        const E = maske(dreiecke, projiziert);
        const S = maske(dreiecke, () => {});
        const v = new T.Vector3(o.x, o.gy, o.z).project(st.camera);
        const cx = Math.round(((v.x + 1) / 2) * W),
            cy = Math.round(((1 - v.y) / 2) * H);
        const bw = 96,
            bh = 54;
        const x0 = Math.max(0, Math.min(W - bw, cx - bw / 2)),
            y0 = Math.max(0, Math.min(H - bh, cy - bh / 2));
        let dunkel = 0,
            erwartet = 0,
            treffer = 0;
        for (let y = y0; y < y0 + bh; y++)
            for (let x = x0; x < x0 + bw; x++) {
                const i = y * W + x;
                if (S[i]) continue;
                const e = E[i];
                erwartet += e;
                if (lum(mit, i * 4) < lum(leer, i * 4) - 8) {
                    dunkel++;
                    if (e) treffer++;
                }
            }
        const f1 = csm && csm._anazhFit && csm._anazhFit[1];
        const erg = {
            name: w.name,
            zeit,
            dunkel,
            erwartet,
            treffer,
            texelK1: f1 && lichter[1] ? +texelVon(lichter[1].shadow, f1).toFixed(3) : null,
            normalBias: lichter.map((lw) => +lw.shadow.normalBias.toFixed(3)),
        };
        if (cfg.bilder) {
            const lupe = (u8) => {
                const q8 = new Uint8Array(W * H * 4);
                for (let y = 0; y < H; y++)
                    for (let x = 0; x < W; x++) {
                        const sx = x0 + Math.floor((x * bw) / W),
                            sy = y0 + Math.floor((y * bh) / H);
                        const q = (sy * W + sx) * 4,
                            pp = (y * W + x) * 4;
                        q8[pp] = u8[q];
                        q8[pp + 1] = u8[q + 1];
                        q8[pp + 2] = u8[q + 2];
                        q8[pp + 3] = 255;
                    }
                return q8;
            };
            aus.bilder.push({ name: `fern-${w.name}-${zeit}`, mit: png(lupe(mit)), leer: png(lupe(leer)) });
        }
        isoEbene(wz, sl, false);
        hh.weg();
        isoAus();
        await halten(6);
        return erg;
    };
    // DIE AKNE-PLATTE: eine Fläche 8 × 8 m, 2 mm dick (r184 zeichnet bei FrontSide-Stoffen die RÜCKSEITEN in die Karte —
    // `side = KS[side]` im Schatten-Pass: ein 0,4 m dicker Quader speicherte seine Unterseite und war nie aknefähig, die Zähne sahen
    // 0 %; 2 mm verhalten sich wie eine einzelne Fläche, wie der Boden), um `neigung` gekippt, die Oberseite zur Sonne (`richtung` +1) oder von
    // ihr weg (−1). Gemessen werden nur die beleuchteten, sichtbaren Seiten (N·L > 0,15), um 3 Pixel geschrumpft, und dort nur
    // Pixel, die in zwei Aufnahmen ohne Wurf ruhen: dunkler mit Wurf = Akne. Sie steht auf dem OFFENEN FLECK nächst der Bühne
    // (kein Bau näher als 12 m, Boden flacher als 6°: an der Bühne standen Stamm und Äste vor der Kamera) und wird isoliert
    // gemessen (`ISO`: in tiefer Sonne lag sie sonst im Schatten der Bäume — ihr eigener Wurf verdunkelte nichts, die Zähne
    // sahen 0,02 %). Schweben trägt nicht: die Nah-Ebene der Kaskade liegt über dem höchsten bekannten Werfer, ein freies Mesh
    // 50 m darüber zeichnet nie in die Karte.
    const fleck = (() => {
        const arch = st.architectures || [];
        for (let rad = 0; rad <= 80; rad += 4)
            for (let a = 0; a < (rad ? 16 : 1); a++) {
                const x = bx + rad * Math.cos((a * Math.PI) / 8),
                    z = bz + rad * Math.sin((a * Math.PI) / 8);
                const gx = (boden(x + 2, z) - boden(x - 2, z)) / 4,
                    gz = (boden(x, z + 2) - boden(x, z - 2)) / 4;
                if (!(Math.atan(Math.hypot(gx, gz)) < (6 * Math.PI) / 180)) continue;
                let frei = true;
                for (const e of arch)
                    if (e && e.position && Math.hypot(e.position.x - x, e.position.z - z) < 12) frei = false;
                if (frei) return { x, z, rad };
            }
        return { x: bx, z: bz, rad: null };
    })();
    aus.fleck = [+fleck.x.toFixed(1), +fleck.z.toFixed(1), fleck.rad];
    const plattenBp = (name, neigung) => {
        const n = "schatten_platte_" + name;
        if (!st.blueprints[n]) {
            r.createBlueprint(n, "Schatten-Platte " + name);
            r.addPartToBlueprint(n, {
                shape: "cube",
                // hell (Knochen, fast weiß): im Streiflicht trägt die Fläche nur N·L ≈ 0,2 direktes Licht — auf dunklem Stein blieb
                // selbst volle Akne unter der Schwelle, die Zähne schwankten mit der Box (0 / 4,9 / 8,5 %)
                material: "knochen",
                color: 0xf2f2f2,
                position: { x: 0, y: 4 * Math.sin(neigung) + 0.2, z: 0 },
                size: { x: 8, y: 0.002, z: 8 },
                rotation: { x: neigung, y: 0, z: 0 },
            });
        }
        return n;
    };
    const platteMessen = async (name, neigung, richtung, zeit, bias) => {
        verstecken();
        const d = lichtDir();
        const h = Math.hypot(d.x, d.z) || 1;
        const zs = { x: -d.x / h, z: -d.z / h }; // waagrecht zur Sonne
        const psi = Math.atan2(richtung * zs.x, richtung * zs.z);
        const typ = plattenBp(`${name}-${Math.round((neigung * 180) / Math.PI)}`, neigung);
        const e = await bauSetzen(typ, fleck.x, fleck.z, psi);
        if (!e) return { name: `${name}@${zeit}`, zeit, maske: 0, anteil: 0, fehler: "Platte nicht gesetzt" };
        isoAn();
        isoEbene([e.mesh], e.instSlots, true);
        const dreiecke = werferDreiecke([e.mesh], e.instSlots || []);
        const lo = new T.Vector3(Infinity, Infinity, Infinity),
            hi = new T.Vector3(-Infinity, -Infinity, -Infinity);
        for (let i = 0; i < dreiecke.length; i += 3) {
            lo.min(new T.Vector3(dreiecke[i], dreiecke[i + 1], dreiecke[i + 2]));
            hi.max(new T.Vector3(dreiecke[i], dreiecke[i + 1], dreiecke[i + 2]));
        }
        const mitte = lo.clone().add(hi).multiplyScalar(0.5);
        const nrm = new T.Vector3(
            Math.sin(neigung) * Math.sin(psi),
            Math.cos(neigung),
            Math.sin(neigung) * Math.cos(psi)
        );
        // der Blick unter den Kronen: 5,5 m waagrecht auf der Seite der Normalen (eben: zur Sonne), 3,2 m über der Mitte — die
        // Oberseite unter ~30°
        const nh = Math.hypot(nrm.x, nrm.z);
        const hx = nh > 0.2 ? nrm.x / nh : zs.x,
            hz = nh > 0.2 ? nrm.z / nh : zs.z;
        const k = {
            px: mitte.x + hx * 5.5,
            py: mitte.y + 3.2,
            pz: mitte.z + hz * 5.5,
            lx: mitte.x,
            ly: mitte.y,
            lz: mitte.z,
        };
        kamSetzen(k);
        const zurSonne = new T.Vector3(-d.x, -d.y, -d.z);
        const auge = new T.Vector3(k.px, k.py, k.pz);
        const hell = [];
        const a = new T.Vector3(),
            b = new T.Vector3(),
            c = new T.Vector3(),
            n = new T.Vector3(),
            g = new T.Vector3();
        for (let i = 0; i < dreiecke.length; i += 9) {
            a.fromArray(dreiecke, i);
            b.fromArray(dreiecke, i + 3);
            c.fromArray(dreiecke, i + 6);
            n.subVectors(b, a).cross(c.clone().sub(a)).normalize();
            g.copy(a)
                .add(b)
                .add(c)
                .multiplyScalar(1 / 3);
            if (n.dot(g.clone().sub(mitte)) < 0) n.negate();
            if (n.dot(zurSonne) > 0.15 && n.dot(auge.clone().sub(g)) > 0)
                for (let j = 0; j < 9; j++) hell.push(dreiecke[i + j]);
        }
        const Mh = schrumpf(
            maske(hell, () => {}),
            3
        );
        biasSetzen(bias);
        await schattenWarm(k);
        bauWirft(e, true);
        const an = await schuss(k);
        bauWirft(e, false);
        const ab = await schuss(k);
        const ab2 = await schuss(k);
        bauWirft(e, true);
        biasSetzen(grund);
        isoEbene([e.mesh], e.instSlots, false);
        isoAus();
        let mz = 0,
            dunkel = 0;
        const D = new Uint8Array(W * H);
        for (let i = 0; i < W * H; i++) {
            if (!Mh[i]) continue;
            const p = i * 4;
            if (Math.abs(lum(ab, p) - lum(ab2, p)) > 3) continue;
            mz++;
            if (lum(an, p) < lum(ab, p) - 6) {
                dunkel++;
                D[i] = 1;
            }
        }
        r.removeArchitecture(e);
        await halten(2);
        const erg = {
            name: `${name}@${zeit}`,
            zeit,
            neigungGrad: Math.round((neigung * 180) / Math.PI),
            maske: mz,
            dunkel,
            anteil: mz ? +(dunkel / mz).toFixed(4) : 0,
            normalBias: lichter.map((lw) => +lw.shadow.normalBias.toFixed(3)),
        };
        if (cfg.bilder)
            aus.bilder.push({ name: `akne-${name}-${zeit}`, mit: png(an), ueber: png(an, { e: Mh, m: D }) });
        return erg;
    };
    const tiefe = (d) => Math.asin(Math.min(1, Math.max(-1, -d.y))); // die Höhe der Sonne (Bogenmaß)
    biasSetzen(grund);
    // DIE WERFER: seitliche Sonne (der Richter) und Mittag
    for (const zeit of cfg.zeiten) {
        await sonne(zeit);
        biasSetzen(grund);
        await schuss(kameraFuer()); // ein Vorlauf-Schuss nach dem Sonnen-Wechsel
        const seitlich = Math.abs(zeit - cfg.seitlich) < 1e-6;
        for (const w of werferArten)
            if (!cfg.nur || cfg.nur.includes(w.name)) aus.werfer.push(await messen(w, zeit, seitlich));
    }
    if (cfg.fern)
        for (const zeit of cfg.zeiten) {
            await sonne(zeit);
            biasSetzen(grund);
            for (const w of werferArten)
                if (["wolf", "fuchs", "busch"].includes(w.name) && (!cfg.nur || cfg.nur.includes(w.name)))
                    aus.fern.push(await fernMessen(w, zeit));
        }
    aus.bias = lichter.map((lw) => +lw.shadow.normalBias.toFixed(3));
    aus.tiefenBias = lichter.map((lw, i) => {
        const f = csm._anazhFit && csm._anazhFit[i];
        return f ? +(-lw.shadow.bias * (f.zt - f.zb)).toFixed(3) : null; // in Metern entlang des Lichts
    });
    aus.texel = lichter.map((lw, i) => {
        const f = csm._anazhFit && csm._anazhFit[i];
        return f ? +texelVon(lw.shadow, f).toFixed(3) : null;
    });
    if (cfg.ohneAkne) return aus;
    // DIE AKNE: je Sonne die ebene Platte, die Platte im Streiflicht (10° gegen das Licht) und die Dach-Platte (40° zur Sonne)
    for (const zeit of cfg.akneZeiten || [cfg.tief, cfg.seitlich, 0.5]) {
        await sonne(zeit);
        biasSetzen(grund);
        const e = tiefe(lichtDir());
        const streif = Math.max(0, Math.min((60 * Math.PI) / 180, e - (10 * Math.PI) / 180));
        aus.akne.push(await platteMessen("eben", 0, 1, zeit, grund));
        aus.akne.push(await platteMessen("streif", streif, -1, zeit, grund));
        aus.akne.push(await platteMessen("dach", (40 * Math.PI) / 180, 1, zeit, grund));
        if (zeit === cfg.tief)
            aus.zaehne = await platteMessen("zaehne", 0, 1, zeit, { art: "versuch-zaehne", n: 0.1, d: 0 });
    }
    // DAS ECHTE DACH UND DER ECHTE HANG (`--echt`, Bilder für das Auge; ihre Kamin- und Relief-Schatten sind keine Akne)
    if (cfg.bilder) {
        const hausArt = Object.keys(st.blueprints).find((n) => /^haus_/.test(n) && st.blueprints[n]);
        if (hausArt) {
            // auf dem offenen Fleck (an der Bühne stand es im Wald, die Kamera sah Kronen statt Dach), der Blick von der Sonnen-Seite
            const hx = fleck.x,
                hz = fleck.z;
            // der unsichtbare Spieler neben dem Haus: die Stufen-Wahl der Bauten geht von ihm aus (an der Bühne, 60 m weit, stand Stufe 2)
            st.playerMesh.visible = false;
            st.playerMesh.position.set(hx - 8, boden(hx - 8, hz + 8) + 0.9, hz + 8);
            const e = await bauSetzen(hausArt, hx, hz, 0.3);
            const gy = boden(hx, hz);
            for (const zeit of [cfg.tief, 0.5]) {
                await sonne(zeit);
                biasSetzen(grund);
                const d = lichtDir();
                const h = Math.hypot(d.x, d.z) || 1;
                const ux = -d.x / h,
                    uz = -d.z / h;
                const k = {
                    px: hx + ux * 16 + uz * 6,
                    py: gy + 11,
                    pz: hz + uz * 16 - ux * 6,
                    lx: hx,
                    ly: gy + 4,
                    lz: hz,
                };
                aus.bilder.push({ name: `dach-echt-${zeit}`, mit: png(await schuss(k)) });
            }
            aus.echt.push({ name: "dach", haus: hausArt, stufe: e ? e._lodLevel : null });
            if (e) r.removeArchitecture(e);
        }
        // der Hang: der steilste gezeichnete Boden nahe 25° um die Bühne
        let best = null;
        for (let rad = 12; rad <= 64; rad += 4)
            for (let a = 0; a < 16; a++) {
                const x = bx + rad * Math.cos((a * Math.PI) / 8),
                    z = bz + rad * Math.sin((a * Math.PI) / 8);
                const gx = (boden(x + 1, z) - boden(x - 1, z)) / 2,
                    gz = (boden(x, z + 1) - boden(x, z - 1)) / 2;
                const grad = (Math.atan(Math.hypot(gx, gz)) * 180) / Math.PI;
                if (!Number.isFinite(grad)) continue;
                if (!best || Math.abs(grad - 25) < Math.abs(best.grad - 25)) best = { x, z, gx, gz, grad };
            }
        if (best) {
            const h = Math.hypot(best.gx, best.gz) || 1;
            const gy = boden(best.x, best.z);
            for (const zeit of [cfg.tief, 0.5]) {
                await sonne(zeit);
                biasSetzen(grund);
                // von der Tal-Seite auf den Hang
                const k = {
                    px: best.x - (best.gx / h) * 10,
                    py: gy + 6,
                    pz: best.z - (best.gz / h) * 10,
                    lx: best.x,
                    ly: gy,
                    lz: best.z,
                };
                aus.bilder.push({ name: `hang-echt-${zeit}`, mit: png(await schuss(k)) });
            }
            aus.echt.push({ name: "hang", ort: [+best.x.toFixed(1), +best.z.toFixed(1)], grad: +best.grad.toFixed(1) });
        }
    }
    biasSetzen({ art: "spiel" });
    return aus;
}

(async () => {
    const Q = quellWand(fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8"));
    fs.mkdirSync(OUT, { recursive: true });
    await new Promise((res) => server.listen(PORT, "127.0.0.1", res));
    const browser = await puppeteer.launch({
        headless: false,
        protocolTimeout: 3600000,
        defaultViewport: { width: W, height: H },
        args: echteWebGpuArgs().concat([`--window-size=${W},${H + 80}`]),
    });
    const page = await browser.newPage();
    await page.setViewport({ width: W, height: H });
    await page.evaluateOnNewDocument(() => {
        window.__anazhAutoSettlement = false;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.evaluate(AUSGABE_INSTALL);
    const b = await page.evaluate(buehneBauen);
    let S;
    const t0 = Date.now();
    if (b.fatal) S = { fehler: b.fatal, werfer: [], akne: [] };
    else
        S = await page.evaluate(probe, {
            W,
            H,
            zeiten: process.env.SB_ZEITEN ? process.env.SB_ZEITEN.split(",").map(Number) : [0.32, 0.5],
            seitlich: 0.32,
            tief: 0.28,
            bilder: true,
            nur: process.env.SB_NUR ? process.env.SB_NUR.split(",") : null,
            ohneAkne: !!process.env.SB_OHNE_AKNE,
            fern: !process.env.SB_OHNE_FERN,
            akneZeiten: process.env.SB_AKNE_ZEITEN ? process.env.SB_AKNE_ZEITEN.split(",").map(Number) : null,
            versuch: process.env.SB_VERSUCH ? JSON.parse(process.env.SB_VERSUCH) : null,
        });
    await browser.close();
    server.close();
    if (S.bilder)
        for (const bi of S.bilder)
            for (const k of ["mit", "ueber", "leer"])
                if (bi[k])
                    fs.writeFileSync(path.join(OUT, `${bi.name}-${k}.png`), Buffer.from(bi[k].split(",")[1], "base64"));
    console.log("=== DER SCHATTEN KLEINER WERFER — der Bias als Gesetz der Kaskade (echter Renderer) ===");
    console.log(
        `  Renderer: die GPU des Rechners · ${W}×${H} · ${Math.round((Date.now() - t0) / 1000)} s · ` +
            `normalBias je Kaskade ${JSON.stringify(S.bias)} m · Tiefen-Bias ${JSON.stringify(S.tiefenBias)} m · Texel ` +
            `${JSON.stringify(S.texel)} m` +
            (process.env.SB_VERSUCH ? ` · VERSUCH ${process.env.SB_VERSUCH}` : "")
    );
    for (const w of S.werfer || [])
        console.log(
            `  ${String(w.name).padEnd(8)} @${w.zeit}${w.seitlich ? " (seitlich)" : ""}: IoU mit Saum ${w.iouSaum} (${w.saumPx} px) · IoU ${w.iou} · Deckung ${w.deckung} · gemessen ${w.gemessen} px · erwartet ${w.erwartet} px · ${w.dreiecke} Dreiecke${w.stufe != null ? " · Stufe " + w.stufe : ""}${w.fehler ? " · " + w.fehler : ""}${process.env.SB_DEBUG ? "\n      strömte " + w.stroemte + " · licht " + JSON.stringify(w.licht) + "\n      " + (w.fund || []).join(" | ") : ""}`
        );
    for (const f of S.fern || [])
        console.log(
            `  fern (k1, 130 m über dem Fleck) ${String(f.name).padEnd(6)} @${f.zeit}: ${f.dunkel} Pixel außerhalb der Silhouette abgedunkelt, davon ${f.treffer} in der Erwartung (${f.erwartet} px) · Texel k1 ${f.texelK1} m${f.fehler ? " · " + f.fehler : ""}`
        );
    for (const a of S.akne || [])
        console.log(
            `  Akne ${String(a.name).padEnd(16)} ${String(a.neigungGrad).padStart(2)}°: ${(a.anteil * 100).toFixed(2)} % von ${a.maske} Pixeln${a.fehler ? " · " + a.fehler : ""}`
        );
    if (S.zaehne)
        console.log(
            `  Zähne (0,1 Texel, ohne Tiefen-/Hang-Bias): ${(S.zaehne.anteil * 100).toFixed(2)} % von ${S.zaehne.maske} Pixeln`
        );
    if (S.fleck) console.log(`  Akne-Fleck (offen, isoliert): ${JSON.stringify(S.fleck)} (x, z, Abstand zur Bühne m)`);
    for (const e of S.echt || []) console.log(`  echt: ${JSON.stringify(e)}`);
    console.log(`  Bilder: ${OUT}`);
    const rot = urteil(S, Q, pageErrors);
    if (rot.length) {
        console.error("\nROT:");
        for (const e of rot) console.error("  • " + e);
        process.exit(1);
    }
    console.log(
        "\nGRÜN — kleine Werfer werfen ihren Schatten, große Flächen tragen keine Akne; der Bias ist das Gesetz der Kaskade."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Schatten-Bias-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
