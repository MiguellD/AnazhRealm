#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-schatten-bias.cjs — KLEINE WERFER WERFEN IHREN SCHATTEN (0710-12). Befund (Studio-Welle S3, Familie kreatur): der
// Schatten-Bias war EIN fester Meter-Wert für beide Kaskaden — `atmosphere.shadowBias` = 1,0 → `shadow.normalBias` 1,0 m
// (r184 schiebt die Probe des Empfängers um `normalWorld × normalBias` in Welt-Metern, ShadowNode). Der Boden fragte die
// Karte 1 m über sich selbst ab: kein Werfer unter ~1 m Höhe erreichte ihn — Wolf, Fuchs, Busch, Zaun-Pfosten, die Beine des
// Spielers warfen im Spielbild keinen sichtbaren Schatten (Boden-IoU ≈ 0). Die Kaskaden tragen 0,12–0,16 m (k0) und
// 0,22–0,47 m (k1) je Texel: 1 m waren 6–8 Texel.
// Die Wand (echter Renderer: swiftshader headless in der CI, `--echt` die GPU des Rechners mit Bild-Paaren):
//   (S) DER SCHATTEN: je Werfer (wolf, fuchs, busch, pfosten, spieler) auf der ebenen Bühne der Mess-Wiese, Sonne seitlich (25°)
//       und mittags — drei Schüsse LEER · MIT · LEER2; die ERWARTUNG sind die Schatten-Dreiecke des Werfers (was mit castShadow im
//       Schatten-Pass zeichnet, gehäutet, je Instanz, die Zwillinge eingeschlossen) entlang des Lichts auf den gezeichneten Boden
//       projiziert, die MESSUNG die Boden-Pixel, die er dunkler macht (ohne seine eigene Silhouette, ohne was zwischen LEER und
//       LEER2 strömte); die Boden-IoU je Werfer ≥ IOU_MIN;
//   (A) DIE AKNE (die zweite Seite): Boden und Hang (der Boden-Satz wirft an/aus) und ein Hausdach (das Haus wirft an/aus) — die
//       Pixel, die der Körper auf sich selbst neu verdunkelt, beim Bias des Gesetzes gegen den Referenz-Bias 1,0 m (echte Hang-
//       und Kamin-Schatten tragen beide); je Blick ≤ AKNE_MAX; die ZÄHNE: bei 0,1 Texel muss sie fallen;
//   (Q) QUELLE: `.normalBias` schreibt nur das Gesetz (`_schattenNormalBias`), die EINE Quelle ist `atmosphere.shadowBias`;
//   (P) kein Page-Error.
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): die Quell-Wand ist am Stamm grün und fällt bei einem fremden
// Schreiber rot; das Urteil fällt bei leerem Schatten, falscher Lage und Akne rot.
//   node scripts/diag-schatten-bias.cjs [--selftest] [--echt] [--tag name]   (npm run gate:schatten-bias; Port SCHATTEN_BIAS_PORT)
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
    return i > 0 ? process.argv[i + 1] : ECHT ? "echt" : "sw";
})();
const OUT = path.join(root, "artifacts", "schatten-bias", TAG);
const IOU_MIN = 0.4;
const AKNE_MAX = 0.01;
const AKNE_ZAEHNE_MIN = 0.03;

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
        schreiber = 0;
    lauf(ast, (m) => {
        if (m.type !== "MethodDefinition" || !m.value || !m.value.body) return;
        const name = m.key.name || String(m.key.value);
        if (name === "_schattenNormalBias") gesetz = true;
        lauf(m.value.body, (n) => {
            if (
                n.type !== "AssignmentExpression" ||
                n.left.type !== "MemberExpression" ||
                n.left.computed ||
                n.left.property.name !== "normalBias"
            )
                return;
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
    if (gesetz && schreiber < 2) befunde.push(`STUMPF: die Wand sieht nur ${schreiber} Schreiber von normalBias`);
    return befunde;
}

// DAS URTEIL (rein, Node): S = { werfer: [{ name, zeit, iou, erwartet, gemessen }], akne: [{ name, anteil }], zaehne, fehler }
function urteil(S, Q, pageErrors) {
    const rot = [];
    for (const b of Q) rot.push(`(Q) QUELLE: ${b}`);
    if (S.fehler) rot.push(`(P) BÜHNE: ${S.fehler}`);
    for (const w of S.werfer || []) {
        if (!(w.erwartet >= 150))
            rot.push(`(S) ${w.name} @${w.zeit}: die Erwartung ist zu klein im Bild (${w.erwartet} px) — die Probe ist vakuös`);
        else if (!(w.iou >= IOU_MIN))
            rot.push(
                `(S) ${w.name} @${w.zeit}: Boden-IoU ${w.iou} < ${IOU_MIN} (gemessen ${w.gemessen} px, erwartet ${w.erwartet} px, ` +
                    `Deckung ${w.deckung}) — der Werfer wirft keinen sichtbaren Schatten (normalBias ${w.normalBias})`
            );
    }
    if (!(S.werfer && S.werfer.length >= 5)) rot.push(`(S) zu wenige Werfer gemessen (${(S.werfer || []).length})`);
    for (const a of S.akne || [])
        if (!(a.anteil <= AKNE_MAX))
            rot.push(`(A) AKNE ${a.name}: ${(a.anteil * 100).toFixed(2)} % der Fläche neu verdunkelt (> ${AKNE_MAX * 100} %)`);
    if (!(S.akne && S.akne.length >= 2)) rot.push(`(A) zu wenige Akne-Blicke (${(S.akne || []).length})`);
    if (S.zaehne && !(S.zaehne.anteil >= AKNE_ZAEHNE_MIN))
        rot.push(`(A) ZÄHNE: bei 0,1 Texel zeigt die Probe nur ${(S.zaehne.anteil * 100).toFixed(2)} % Akne — sie sieht keine`);
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
    if (!fremd.some((b) => b.includes("ohne das Gesetz"))) v.push(`ein fester Meter-Wert fällt nicht rot (${JSON.stringify(fremd)})`);
    const ohne = quellWand("class X { a(l) { l.shadow.normalBias = 1.0; } }");
    if (!ohne.some((b) => b.includes("fehlt"))) v.push(`ein Stamm ohne Gesetz fällt nicht rot (${JSON.stringify(ohne)})`);
    const gut = {
        werfer: ["wolf", "fuchs", "busch", "pfosten", "spieler"].map((name) => ({ name, zeit: 0.32, iou: 0.6, erwartet: 900, gemessen: 800, deckung: 0.7 })),
        akne: [
            { name: "boden", anteil: 0.002 },
            { name: "dach", anteil: 0.003 },
        ],
        zaehne: { anteil: 0.2 },
    };
    if (urteil(gut, [], []).length) v.push(`ein gutes Bild fällt rot (${JSON.stringify(urteil(gut, [], []))})`);
    const leer = JSON.parse(JSON.stringify(gut));
    leer.werfer[0].iou = 0.02;
    if (!urteil(leer, [], []).some((x) => x.includes("wolf"))) v.push("ein leerer Wolf-Schatten fällt nicht rot");
    const akne = JSON.parse(JSON.stringify(gut));
    akne.akne[0].anteil = 0.2;
    if (!urteil(akne, [], []).some((x) => x.includes("AKNE boden"))) v.push("Akne auf dem Boden fällt nicht rot");
    const blind = JSON.parse(JSON.stringify(gut));
    blind.zaehne.anteil = 0;
    if (!urteil(blind, [], []).some((x) => x.includes("ZÄHNE"))) v.push("eine blinde Akne-Probe fällt nicht rot");
    for (const x of v) console.log("  ❌ " + x);
    if (v.length) {
        console.log("\n❌ SELBSTTEST ROT");
        process.exit(1);
    }
    console.log(
        "✅ SELBSTTEST GRÜN — normalBias schreibt nur das Gesetz; ein fester Wert, ein leerer Schatten, Akne und eine blinde Akne-Probe fallen rot."
    );
    process.exit(0);
}

const puppeteer = require("puppeteer");
const { softwareWebGpuArgs, echteWebGpuArgs } = require("./lib/software-gpu.cjs");
const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");
const W = ECHT ? 960 : 640,
    H = ECHT ? 540 : 360;
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

// DIE BÜHNE (in der Seite): Boot, Foundry, die ebene Bühne der Mess-Wiese, Tiere fort, die Nah-Wiese aus (ihre Halme decken
// den Boden — die Wand misst den Schatten auf dem Boden).
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

// DIE PROBE (in der Seite): Werfer und Akne-Blicke, je Sonne
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
    const aus = { werfer: [], akne: [], bilder: [], zaehne: null, bias: null };
    rend.setAnimationLoop(null);
    const sonne = (zeit) => {
        window.__buehne();
        st.timeOfDay = zeit;
        if (st.world) st.world.timeOfDay = zeit;
        r._applyDayNightToScene();
    };
    const wieseAus = () => {
        if (st.nahWiese && st.nahWiese.gruppe) st.nahWiese.gruppe.visible = false;
    };
    // die Bias-Steuerung der Probe: das Gesetz des Spiels (`_schattenNormalBias`, falls es steht), oder ein fester Meter-Wert
    // (die Referenz 1,0 m), oder ein Faktor × Texel der Kaskade (die Zähne)
    const P = Object.getPrototypeOf(r);
    let modus = { art: "spiel" };
    const biasAnwenden = () => {
        if (!csm || !csm.lights) return;
        csm.lights.forEach((lw, i) => {
            const fit = csm._anazhFit && csm._anazhFit[i];
            const texel = fit ? Math.max(fit.texel, fit.texelMin || 0) : 0.2;
            if (modus.art === "meter") lw.shadow.normalBias = modus.wert;
            else if (modus.art === "texel") lw.shadow.normalBias = modus.wert * texel;
        });
    };
    const biasSetzen = (m) => {
        modus = m;
        delete r._schattenNormalBias;
        if (typeof P._schattenNormalBias === "function" && m.art !== "spiel")
            r._schattenNormalBias = function (texel) {
                return m.art === "meter" ? m.wert : m.wert * texel;
            };
        biasAnwenden();
    };
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
            wieseAus();
            kamSetzen(k);
            biasAnwenden();
            r._schattenAlleNeu();
            u8 = (await window.__ausgabeAufnahme(W, H, 1)).u8;
            biasAnwenden();
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
        const y = r._standSicht(x, z, NaN);
        return Number.isFinite(y) ? y : r._voxelSurfaceY(x, z);
    };
    // DIE SCHATTEN-DREIECKE eines Werfers: jedes Mesh im Teilbaum (und jede Instanz eines Slots), das im Schatten-Pass zeichnet
    // (castShadow, sichtbar, eine Ebene der Kaskaden-Kamera), in Welt-Koordinaten
    const ebenen = csm && csm.lights && csm.lights[0] ? csm.lights[0].shadow.camera.layers : st.directionalLight.shadow.camera.layers;
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
                for (let c = 0; c < 3; c++) aus3.push(welt[ecken[c] * 3], welt[ecken[c] * 3 + 1], welt[ecken[c] * 3 + 2]);
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
                        fund.push(`${o.name || o.type}${o.isSkinnedMesh ? "/haut" : ""}${o.isInstancedMesh ? "/inst" : ""} cs=${o.castShadow} vis=${sichtbar(o)} ebn=${o.layers.mask}`);
                    if (!o.isMesh || !o.castShadow || !sichtbar(o) || !o.layers.test(ebenen)) return;
                    if (o.isInstancedMesh) return; // Instanzen kommen über die Slots
                    o.updateMatrixWorld(true);
                    if (o.isSkinnedMesh && o.skeleton) o.skeleton.update();
                    dreieckeAus(o, [o.matrixWorld], aus3);
                });
        for (const ref of slots || []) {
            const g = st.archInstanceGroups && st.archInstanceGroups.get(ref.key);
            if (fund.length < 12) fund.push(`slot ${ref.key} cs=${g && g.mesh && g.mesh.castShadow} ebn=${g && g.mesh && g.mesh.layers.mask}`);
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
    const halten = async (n) => {
        for (let t = 0; t < n; t++) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            await sleep(25);
        }
        rend.setAnimationLoop(null);
    };
    const setze = async (w) => {
        if (w.art === "tier") {
            const c = r.spawnCreatureAt(bx, gyB + 0.5, bz, "happy", w.seele, { bodySize: 1 });
            if (!c) return null;
            c.userData.task = { name: "wait", args: {}, since: performance.now() / 1000 };
            c.userData.emotions = null;
            await halten(25);
            c.position.x = bx;
            c.position.z = bz;
            return { weg: () => r.removeCreature(c), wurzeln: () => [c.userData._tierBaum && c.userData._tierBaum.wrap, c.mesh], slots: () => [] };
        }
        if (w.art === "bau") {
            if (!w.typ) return null;
            const e = r.spawnArchitecture(w.typ, { x: bx, y: gyB + 0.5, z: bz }, { silent: true, rotationY: 0.4 });
            if (!e) return null;
            for (let t = 0; t < 80 && !(e.instSlots || e.mesh); t++) await halten(1);
            await halten(10);
            return { weg: () => r.removeArchitecture(e), wurzeln: () => [e.mesh], slots: () => e.instSlots || [] };
        }
        if (w.art === "spieler") {
            const pm = st.playerMesh;
            pm.position.set(bx, gyB + 0.9, bz);
            pm.visible = true;
            await halten(10);
            pm.position.set(bx, pm.position.y, bz);
            pm.visible = true;
            return { weg: () => (pm.visible = false), wurzeln: () => [pm], slots: () => [] };
        }
        return null;
    };
    const verstecken = () => {
        st.playerMesh.visible = false;
        st.playerMesh.position.set(bx - 30, boden(bx - 30, bz) + 0.9, bz);
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
    const messen = async (w, zeit) => {
        verstecken();
        const k = kameraFuer();
        const leer = await schuss(k);
        const h = await setze(w);
        if (!h) return { name: w.name, zeit, fehler: "Werfer nicht gesetzt" };
        const mit = await schuss(k);
        const dreiecke = werferDreiecke(h.wurzeln(), h.slots());
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
        let eRoh = 0,
            sRoh = 0;
        for (let i = 0; i < W * H; i++) {
            eRoh += E[i];
            sRoh += S[i];
        }
        const probe3 = [];
        for (let i = 0; i < dreiecke.length && probe3.length < 4; i += 9 * 2000) {
            const v = new T.Vector3(dreiecke[i], dreiecke[i + 1], dreiecke[i + 2]);
            const roh = v.toArray().map((x) => +x.toFixed(2));
            projiziert(v);
            const q = v.clone().project(st.camera);
            probe3.push([roh, v.toArray().map((x) => +x.toFixed(2)), [+q.x.toFixed(2), +q.y.toFixed(2), +q.z.toFixed(3)]]);
        }
        const nb = csm && csm.lights ? csm.lights.map((lw) => +lw.shadow.normalBias.toFixed(3)) : null;
        h.weg();
        verstecken();
        const leer2 = await schuss(k);
        // die Region: die Erwartung samt Rand
        let x0 = W,
            x1 = 0,
            y0 = H,
            y1 = 0,
            nE = 0;
        for (let y = 0; y < H; y++)
            for (let x = 0; x < W; x++)
                if (E[y * W + x] && !S[y * W + x]) {
                    nE++;
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
            erwartet = 0;
        const M = new Uint8Array(W * H),
            Eo = new Uint8Array(W * H);
        for (let y = y0; y <= y1; y++)
            for (let x = x0; x <= x1; x++) {
                const i = y * W + x;
                if (S[i]) continue;
                const p = i * 4;
                if (Math.abs(lum(leer2, p) - lum(leer, p)) > 4) continue; // strömte
                const m = lum(mit, p) < lum(leer, p) - 8 ? 1 : 0;
                const e = E[i];
                M[i] = m;
                Eo[i] = e;
                gemessen += m;
                erwartet += e;
                if (m && e) schnitt++;
                if (m || e) vereint++;
            }
        const erg = {
            name: w.name,
            zeit,
            iou: vereint ? +(schnitt / vereint).toFixed(3) : 0,
            deckung: erwartet ? +(schnitt / erwartet).toFixed(3) : 0,
            gemessen,
            erwartet,
            dreiecke: dreiecke.length / 9,
            box: (() => {
                let a = [Infinity, Infinity, Infinity],
                    b = [-Infinity, -Infinity, -Infinity];
                for (let i = 0; i < dreiecke.length; i += 3)
                    for (let c = 0; c < 3; c++) {
                        a[c] = Math.min(a[c], dreiecke[i + c]);
                        b[c] = Math.max(b[c], dreiecke[i + c]);
                    }
                return dreiecke.length ? [a.map((x) => +x.toFixed(1)), b.map((x) => +x.toFixed(1))] : null;
            })(),
            fund: fund.slice(),
            eRoh,
            sRoh,
            probe3,
            licht: lichtDir().toArray().map((x) => +x.toFixed(3)),
            ort: [bx, +gyB.toFixed(2), bz],
            normalBias: nb,
        };
        if (cfg.bilder) aus.bilder.push({ name: `${w.name}-${zeit}`, mit: png(mit), ueber: png(mit, { e: Eo, m: M }), leer: png(leer) });
        return erg;
    };
    // DIE AKNE: ein Blick, ein Körper, der auf sich selbst wirft (an/aus) — beim Bias des Spiels gegen die Referenz 1,0 m
    const akneBlick = async (name, k, koerper, bias) => {
        const neu = async (b) => {
            biasSetzen(b);
            koerper(true);
            const an = await schuss(k);
            koerper(false);
            const ab = await schuss(k);
            koerper(true);
            const dunkel = new Uint8Array(W * H);
            for (let i = 0; i < W * H; i++) dunkel[i] = lum(an, i * 4) < lum(ab, i * 4) - 10 ? 1 : 0;
            return { dunkel, an };
        };
        const ref = await neu({ art: "meter", wert: 1.0 });
        const pr = await neu(bias);
        biasSetzen({ art: "spiel" });
        let neuDunkel = 0;
        for (let i = 0; i < W * H; i++) if (pr.dunkel[i] && !ref.dunkel[i]) neuDunkel++;
        if (cfg.bilder && bias.art !== "texel")
            aus.bilder.push({ name: `akne-${name}`, mit: png(pr.an), ueber: png(pr.an, { e: new Uint8Array(W * H), m: pr.dunkel }) });
        return { name, anteil: +(neuDunkel / (W * H)).toFixed(4), neuDunkel };
    };
    const bodenMesh = (() => {
        if (!st.chunkSaetze) return null;
        for (const s of st.chunkSaetze.values()) if (s.spec && s.spec.name === "bodenSatz" && s.mesh) return s.mesh;
        return null;
    })();
    const bodenWirft = (an) => {
        if (bodenMesh) bodenMesh.castShadow = an;
    };
    // die Sonnen: seitlich (25°) und mittags
    for (const zeit of cfg.zeiten) {
        sonne(zeit);
        biasSetzen({ art: "spiel" });
        // ein Vorlauf-Schuss: der erste Schuss nach dem Sonnen-Wechsel trägt die Welt noch nicht
        await schuss(kameraFuer());
        for (const w of werferArten) if (!cfg.nur || cfg.nur.includes(w.name)) aus.werfer.push(await messen(w, zeit));
    }
    aus.bias = csm && csm.lights ? csm.lights.map((lw) => +lw.shadow.normalBias.toFixed(3)) : null;
    aus.texel = csm && csm._anazhFit ? csm._anazhFit.map((f) => (f ? +f.texel.toFixed(3) : null)) : null;
    if (cfg.ohneAkne) return aus;
    // Akne: tiefe Sonne (15°) über Boden und Hang; ein Hausdach mittags und bei tiefer Sonne
    verstecken();
    sonne(cfg.tief);
    const blickBoden = { px: bx + 6, py: gyB + 4, pz: bz + 6, lx: bx - 8, ly: gyB - 1, lz: bz - 8 };
    aus.akne.push(await akneBlick("boden-tief", blickBoden, bodenWirft, { art: "spiel" }));
    aus.zaehne = await akneBlick("boden-zaehne", blickBoden, bodenWirft, { art: "texel", wert: 0.1 });
    const hausArt = Object.keys(st.blueprints).find((n) => /^haus_/.test(n) && st.blueprints[n]);
    if (hausArt) {
        const hx = bx + 14,
            hz = bz + 2;
        const e = r.spawnArchitecture(hausArt, { x: hx, y: boden(hx, hz) + 0.5, z: hz }, { silent: true, rotationY: 0.3 });
        for (let t = 0; t < 120 && e && !(e.instSlots || e.mesh); t++) await halten(1);
        await halten(10);
        const hausGruppen = () => (e && e.instSlots ? e.instSlots.map((s) => st.archInstanceGroups.get(s.key)).filter(Boolean) : []);
        const merk = new Map();
        const hausWirft = (an) => {
            for (const g of hausGruppen())
                if (g.mesh) {
                    if (!merk.has(g.mesh)) merk.set(g.mesh, g.mesh.castShadow);
                    g.mesh.castShadow = an ? merk.get(g.mesh) : false;
                }
            if (e && e.mesh) e.mesh.traverse((o) => o.isMesh && (o.castShadow = an));
        };
        const gy = boden(hx, hz);
        const blickDach = { px: hx - 9, py: gy + 9, pz: hz + 7, lx: hx, ly: gy + 3, lz: hz };
        for (const zeit of [cfg.tief, 0.5]) {
            sonne(zeit);
            aus.akne.push(await akneBlick(`dach-${zeit}`, blickDach, hausWirft, { art: "spiel" }));
        }
        aus.haus = hausArt;
        if (e) r.removeArchitecture(e);
    } else aus.haus = null;
    biasSetzen({ art: "spiel" });
    return aus;
}

(async () => {
    const Q = quellWand(fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8"));
    if (ECHT) fs.mkdirSync(OUT, { recursive: true });
    await new Promise((res) => server.listen(PORT, "127.0.0.1", res));
    const browser = await puppeteer.launch({
        headless: !ECHT,
        protocolTimeout: 3600000,
        defaultViewport: { width: W, height: H },
        args: ECHT ? echteWebGpuArgs().concat([`--window-size=${W},${H + 80}`]) : softwareWebGpuArgs(),
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
    if (b.fatal) S = { fehler: b.fatal, werfer: [], akne: [] };
    else
        S = await page.evaluate(probe, {
            W,
            H,
            zeiten: process.env.SB_ZEITEN ? process.env.SB_ZEITEN.split(",").map(Number) : [0.32, 0.5],
            tief: 0.28,
            bilder: ECHT,
            nur: process.env.SB_NUR ? process.env.SB_NUR.split(",") : null,
            ohneAkne: !!process.env.SB_OHNE_AKNE,
        });
    await browser.close();
    server.close();
    if (ECHT && S.bilder)
        for (const bi of S.bilder)
            for (const k of ["mit", "ueber", "leer"])
                if (bi[k]) fs.writeFileSync(path.join(OUT, `${bi.name}-${k}.png`), Buffer.from(bi[k].split(",")[1], "base64"));
    console.log("=== DER SCHATTEN KLEINER WERFER — der Bias als Gesetz der Kaskade (echter Renderer) ===");
    console.log(`  Renderer: ${ECHT ? "die GPU des Rechners" : "swiftshader"} · ${W}×${H} · normalBias je Kaskade ${JSON.stringify(S.bias)} m bei Texel ${JSON.stringify(S.texel)} m`);
    for (const w of S.werfer || [])
        console.log(
            `  ${String(w.name).padEnd(8)} @${w.zeit}: IoU ${w.iou} · Deckung ${w.deckung} · gemessen ${w.gemessen} px · erwartet ${w.erwartet} px · ${w.dreiecke} Dreiecke${w.fehler ? " · " + w.fehler : ""}${process.env.SB_DEBUG ? "\n      box " + JSON.stringify(w.box) + " ort " + JSON.stringify(w.ort) + "\n      " + (w.fund || []).join(" | ") + "\n      eRoh " + w.eRoh + " sRoh " + w.sRoh + " licht " + JSON.stringify(w.licht) + " probe " + JSON.stringify(w.probe3) : ""}`
        );
    for (const a of S.akne || []) console.log(`  Akne ${String(a.name).padEnd(12)} ${(a.anteil * 100).toFixed(2)} % neu verdunkelt`);
    if (S.zaehne) console.log(`  Zähne (0,1 Texel): ${(S.zaehne.anteil * 100).toFixed(2)} % · Haus ${S.haus}`);
    if (ECHT) console.log(`  Bilder: ${OUT}`);
    const rot = urteil(S, Q, pageErrors);
    if (rot.length) {
        console.error("\nROT:");
        for (const e of rot) console.error("  • " + e);
        process.exit(1);
    }
    console.log("\nGRÜN — kleine Werfer werfen ihren Schatten, große Flächen tragen keine Akne; der Bias ist das Gesetz der Kaskade.");
    process.exit(0);
})().catch((e) => {
    console.error("Schatten-Bias-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
