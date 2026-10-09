#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-kollision-bild.cjs — KOLLISION = BILD (Leben-Schau 2, 09.10., Familie koerper-bild): was der Körper anfasst, zeigt
// das Bild — und was das Bild zeigt, trägt. Befund (sichtbar gefahren, echte Radeon, Spur B Bilder 38–43): der GT prallte
// bei −913,7/−900,7 von 46,7 auf −6,4 km/h zurück, gezeichnet standen dort Fichten und Himmel. Der Felsturm stieß als seine
// Spender-Parts (ein Eisen-Mast 4,4 × 16,8 m), das Studio zeichnete einen Zacken 1,4 × 0,8 m — der Fels-Zweig des Blocker-
// Erzeugers (`_populateBlockerAABBs`) nahm nur die `*_var`-Formationen, und auch die maß er in Vorlagen-Größe (die Welt-Skala
// 0,15–0,42 der Fels-Arten trug nur der Baum). Gezählt an der Mess-Wiese (150 m): 13 von 13 Felstürmen bis 16,46 m über ihrem
// Bild, 19 von 19 Felsbögen bis 7,66 m, eine Blume 2,1 m.
// Die Wand (Null-Renderer, Foundry an, eine echte Welt): je Werk, das das Studio zeichnet, das BILD = seine Studio-Gestalt (LOD 0,
// die gezeichnete Gestalt, die Instanz-Matrix: Lage, Gier, Welt-Skala × Skala) gegen seine KOLLISION (die Blocker-Boxen, jede
// in ihrem Rahmen — eine gedrehte Box in ihrer obb):
//   (B) BLOCKER OHNE BILD: keine Box ragt seitlich mehr als SEITE_M über das Bild hinaus, oben mehr als max(SEITE_M; OBEN_ANTEIL
//       der Bild-Höhe); das Fundament ist Blocker UND Podest aus derselben Box (`_archFundamentBox`) und zählt nicht;
//   (U) BILD OHNE BLOCKER (umgekehrt): ein FESTES Werk (Fels · Haus · Tor · Wagen · Ausstattung) trägt Boxen, ein Baum seinen
//       Stamm (≥ 1 Box); beim Fels — der Wirt leitet seine Hülle aus der gezeichneten Gestalt ab — liegt jeder Punkt des Bilds im
//       Körper-Band (0,1–KOERPER_BAND_M über der Basis, wo Spieler, Tier und Wagen anstoßen) höchstens SEITE_M neben einer Box.
//       Die festen Teile von Haus, Tor, Wagen und Ausstattung erklärt ihr Gesetzbuch (`__huelle`, das porta-Gesetz,
//       exportDrive, die Teile); ihr Abstand im Band steht in der Tabelle;
//   (G) GESTALT: ein Fels wählt für seinen Blocker dieselbe Gestalt, die gezeichnet ist (der Slot des Bilds gegen
//       `_foundryVariantFor` mit der Kern-Zahl `_studioGestaltenKern`);
//   (E) EXEMPLARE: je Klasse eines an der Mess-Wiese gesetzt (Felsturm · Felsbogen · Steinblock · Kiesel · Felsbrocken · Geode ·
//       Formation · GT · jedes der sieben Tore · Haus · Brunnen · Marktstand) — die Zählung prüft jede Klasse, nicht nur, was
//       dort wächst;
//   (T) DER EINGESCHMUGGELTE TÄTER: ein Felsturm bekommt die Spender-Parts (die alte Regel) — (B) MUSS ihn beim Namen nennen;
//   (Q) QUELLE: der Fels-Zweig führt keine Typ-Liste (kein `_var`-Muster), Fels-Zweig und Parts-Pfad lesen die Welt-Skala jedes
//       Studio-Werks (`_studioWeltSkala`), der Hand-Spiegel `STUDIO_WORLD_SCALE` ist fort;
//   (P) kein Page-Error.
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): ein Befund mit jedem Täter — Blocker ohne Bild, Bild ohne
// Blocker, Baum ohne Stamm, fremde Gestalt, leere Zählung, stumpfer Schmuggel, fehlende Klasse, Quelle, Page-Error — MUSS rot
// fallen und ihn beim Namen nennen.
//   node scripts/diag-kollision-bild.cjs [--selftest]   (npm run gate:kollision-bild; Port KOLLISION_BILD_PORT)
// ─────────────────────────────────────────────────────────────────────────
"use strict";

const SEITE_M = 0.3; // die Kapsel des Spielers misst 0,35 m — was weniger daneben steht, fasst kein Körper als Luft an
const OBEN_ANTEIL = 0.02; // oben: 2 % der Bild-Höhe (über einer 40-m-Krone erreicht kein Körper die Spitze)
const KOERPER_BAND_M = 2.5; // Spieler 1,8 m · Bär ~2 m · GT-Dach 1,4 m
const FEST = new Set(["rock", "haus", "gate", "vehicle", "ausstattung"]);
const STRENG = ["rock"]; // der Wirt leitet die Hülle aus der gezeichneten Gestalt ab
const PFLICHT_EXEMPLARE = [
    "felsturm",
    "felsbogen",
    "stein_block",
    "kiesel",
    "felsbrocken",
    "kristall_geode",
    "fels_var8",
    "fahrzeug_gt",
    "tor_drachentor",
    "tor_kathedrale",
    "tor_maschine",
    "tor_geisttor",
    "tor_verkalkt",
    "welt_fachwerk",
    "welt_schmiede",
    "haus_alemannisch",
    "brunnen_dorf",
    "marktstand_dorf",
];

// Das Urteil über einen Befund: Liste der Verstöße (leer = grün). Rein, im Selbsttest wie im Lauf.
function urteil(b) {
    const v = [];
    if (!b.zensus || !(b.zensus.werke > 0)) v.push("LEER: die Zählung fand kein Werk, das das Studio zeichnet");
    const z = b.zensus || { taeter: [] };
    for (const t of z.taeter || []) {
        if (t.art === "blocker")
            v.push(
                `(B) BLOCKER OHNE BILD: ${t.wer} bei ${t.ort} — eine Box ragt ${t.mass.toFixed(2)} m ${t.wo} über das Bild ` +
                    `(Bild ${t.bild}, Box ${t.box})`
            );
        else if (t.art === "bild")
            v.push(
                `(U) BILD OHNE BLOCKER: ${t.wer} bei ${t.ort} — das Bild steht im Körper-Band ${t.mass.toFixed(2)} m neben jeder ` +
                    `Box (Bild ${t.bild})`
            );
        else if (t.art === "stamm") v.push(`(U) BAUM OHNE STAMM: ${t.wer} bei ${t.ort} trägt keine Box`);
        else if (t.art === "gestalt")
            v.push(`(G) FREMDE GESTALT: ${t.wer} bei ${t.ort} — gezeichnet Gestalt ${t.bildG}, der Blocker misst ${t.blockG}`);
    }
    for (const k of PFLICHT_EXEMPLARE)
        if (!(b.exemplare && b.exemplare[k] === true))
            v.push(`(E) KLASSE FEHLT: das Exemplar ${k} stand nicht in der Zählung (${(b.exemplare || {})[k] || "nicht gesetzt"})`);
    if (!b.schmuggel || !b.schmuggel.genannt)
        v.push(
            "LINSE STUMPF: (T) der eingeschmuggelte Täter (ein Felsturm mit den Spender-Parts) wurde nicht beim Namen genannt" +
                (b.schmuggel && b.schmuggel.wer ? ` (${b.schmuggel.wer})` : "")
        );
    const q = b.quelle || {};
    if (!q.felsOhneTypListe) v.push("(Q) QUELLE: der Fels-Zweig `_felsBlockerParts` trägt eine Typ-Liste (`_var`)");
    if (!q.felsSkala) v.push("(Q) QUELLE: der Fels-Zweig liest die Welt-Skala nicht (`_studioWeltSkala`)");
    if (!q.partsSkala) v.push("(Q) QUELLE: der Parts-Pfad liest die Welt-Skala nicht (`_studioWeltSkala`)");
    if (!q.ohneSpiegel) v.push("(Q) QUELLE: der Hand-Spiegel STUDIO_WORLD_SCALE lebt (zweite Welt-Skala neben dem Kern)");
    if (!q.gestaltKern) v.push("(Q) QUELLE: der Fels-Blocker kennt die Gestalt nicht (_studioGestaltenKern fehlt)");
    for (const e of b.pageErrors || []) v.push(`PAGE-ERROR: ${e}`);
    return v;
}

function selbsttest() {
    const ex = Object.fromEntries(PFLICHT_EXEMPLARE.map((k) => [k, true]));
    const gruen = {
        zensus: { werke: 900, taeter: [] },
        exemplare: ex,
        schmuggel: { genannt: true, wer: "felsturm#4" },
        quelle: { felsOhneTypListe: true, felsSkala: true, partsSkala: true, ohneSpiegel: true, gestaltKern: true },
        pageErrors: [],
    };
    const fehler = [];
    const g = urteil(gruen);
    if (g.length) fehler.push("der grüne Befund fällt rot: " + g.join(" · "));
    const klon = () => JSON.parse(JSON.stringify(gruen));
    const T = (o) => Object.assign({ wer: "felsturm#174", ort: "-913.7/-900.7", bild: "1.4×0.8×0.9", box: "4.4×16.8×4.4" }, o);
    const faelle = [
        [
            "Felsturm als Eisen-Mast",
            (b) => b.zensus.taeter.push(T({ art: "blocker", mass: 16.46, wo: "oben" })),
            /\(B\) BLOCKER OHNE BILD: felsturm#174 bei -913\.7\/-900\.7 — eine Box ragt 16\.46 m oben/,
        ],
        [
            "Bild ohne Blocker",
            (b) => b.zensus.taeter.push(T({ wer: "haus_alemannisch#9", art: "bild", mass: 1.2 })),
            /\(U\) BILD OHNE BLOCKER: haus_alemannisch#9 .* 1\.20 m neben/,
        ],
        ["Baum ohne Stamm", (b) => b.zensus.taeter.push(T({ wer: "baum_eiche#3", art: "stamm" })), /BAUM OHNE STAMM: baum_eiche#3/],
        [
            "fremde Gestalt",
            (b) => b.zensus.taeter.push(T({ art: "gestalt", bildG: 3, blockG: 7 })),
            /\(G\) FREMDE GESTALT: felsturm#174 .* gezeichnet Gestalt 3, der Blocker misst 7/,
        ],
        ["leere Zählung", (b) => (b.zensus.werke = 0), /LEER: die Zählung fand kein Werk/],
        ["stumpfer Schmuggel", (b) => (b.schmuggel.genannt = false), /LINSE STUMPF: \(T\)/],
        ["fehlende Klasse", (b) => delete b.exemplare.felsbogen, /\(E\) KLASSE FEHLT: das Exemplar felsbogen/],
        ["Typ-Liste", (b) => (b.quelle.felsOhneTypListe = false), /\(Q\) QUELLE: der Fels-Zweig .* Typ-Liste/],
        ["Fels ohne Skala", (b) => (b.quelle.felsSkala = false), /\(Q\) QUELLE: der Fels-Zweig liest die Welt-Skala nicht/],
        ["Parts ohne Skala", (b) => (b.quelle.partsSkala = false), /\(Q\) QUELLE: der Parts-Pfad liest/],
        ["Hand-Spiegel", (b) => (b.quelle.ohneSpiegel = false), /\(Q\) QUELLE: der Hand-Spiegel STUDIO_WORLD_SCALE lebt/],
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
    console.log("=== KOLLISION = BILD — Selbsttest (ohne Browser) ===");
    selbsttest();
    process.exit(0);
}

const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.KOLLISION_BILD_PORT) || 4631;
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

// Die Zählung im Seiten-Kontext: je Studio-Werk im Umkreis das Bild gegen die Kollision.
async function probe(K) {
    const r = window.anazhRealm;
    const st = r.state;
    const pause = (ms) => new Promise((ok) => setTimeout(ok, ms || 0));
    let tMs = performance.now();
    const takt = () => {
        tMs += 1000 / 60;
        r._gameLoopTick(tMs);
    };
    const f = r._ensureAssetFoundry();
    const dl = performance.now() + 90000;
    while (performance.now() < dl && !(f && f.ready && f.recipes && f.recipes.zacken)) await pause(100);
    const MW = { x: -913.7, z: -890 };
    st.playerMesh.position.set(MW.x, r._voxelSurfaceY(MW.x, MW.z) + 1.8, MW.z);
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
        if (i > 300 && stabil > 120 && !(st.voxelMeshPending && st.voxelMeshPending.size > 0)) break;
        if (i % 5 === 0) await pause(10);
    }
    const aus = { ring: last, exemplare: {}, zensus: { werke: 0, taeter: [], klassen: {} }, quelle: {}, schmuggel: null };
    // (E) DIE EXEMPLARE: je Klasse eines in einer Reihe 30 m südlich der Mess-Wiese (Abstand 9 m)
    const gesetzt = [];
    K.exemplare.forEach((typ, i) => {
        const x = MW.x - 50 + i * 9;
        const z = MW.z + 30;
        if (!st.blueprints[typ]) {
            aus.exemplare[typ] = "kein Bauplan";
            return;
        }
        const e = r.spawnArchitecture(
            typ,
            { x, y: r.getTerrainHeightAt(x, z) + 0.5, z },
            { silent: true, precise: true, rotationY: 0.6 + i * 0.37 }
        );
        if (e) gesetzt.push([typ, e]);
        else aus.exemplare[typ] = "Spawn verweigert";
    });
    // die Exemplare bauen (das Studio liefert die Gestalt, das Haus seine Hülle)
    for (let i = 0; i < 900; i++) {
        takt();
        if (i % 4 === 0) await pause(10);
        if (i > 120 && gesetzt.every(([, e]) => e.instanced || e.mesh || e._bauSatz)) break;
    }
    for (let i = 0; i < 240; i++) {
        takt();
        if (i % 4 === 0) await pause(10);
    }
    // DAS BILD einer Gestalt (LOD 0 im Vorlagen-Raum), je Art|Gestalt einmal
    const bildCache = new Map();
    const bild = async (pr, g) => {
        const k = pr + "|" + g;
        if (bildCache.has(k)) return bildCache.get(k);
        const meshes = await r._foundryRequest(pr, g, 0, null, 0);
        let pts = null;
        if (meshes && meshes.length) {
            let n = 0;
            for (const m of meshes) {
                const p = m.position;
                const a = p && p.length ? p : p && p.array ? p.array : null;
                if (a) n += a.length;
            }
            pts = new Float32Array(n);
            let o = 0;
            for (const m of meshes) {
                const p = m.position;
                const a = p && p.length ? p : p && p.array ? p.array : null;
                if (a) {
                    pts.set(a, o);
                    o += a.length;
                }
            }
        }
        bildCache.set(k, pts);
        return pts;
    };
    const kindVon = (pr) => {
        const rec = f.recipes && f.recipes[pr];
        if (rec && typeof rec.kind === "string") return rec.kind;
        const ph = globalThis.__terrainCore.PHYTO_PRESETS[pr];
        return ph ? ph.kind : null;
    };
    const istFundament = (b) => b.ex !== undefined && b.ry !== undefined && b.x !== undefined;
    // eine Box im eigenen Rahmen: (u, w) längs ihrer Achsen, Halb-Maße
    const rahmen = (b) =>
        b.obb
            ? { cx: b.obb.cx, cz: b.obb.cz, c: b.obb.c, s: b.obb.s, hx: b.obb.hx, hz: b.obb.hz }
            : {
                  cx: (b.minX + b.maxX) / 2,
                  cz: (b.minZ + b.maxZ) / 2,
                  c: 1,
                  s: 0,
                  hx: (b.maxX - b.minX) / 2,
                  hz: (b.maxZ - b.minZ) / 2,
              };
    const urteileWerk = async (e, merke) => {
        const pr = r._foundryPresetForEntry(e);
        if (!pr) return null;
        const kind = kindVon(pr);
        let g = null;
        const sl = (e.instSlots || []).find((s) => typeof s.key === "string" && /^f:/.test(s.key));
        if (sl) g = Number(sl.key.split("|")[1]);
        if (!Number.isFinite(g)) g = r._foundryVariantFor(e.seed, pr);
        if (!Number.isFinite(g)) return null;
        const pts = await bild(pr, g);
        if (!pts || !pts.length) return null;
        const wer = e.type + "#" + e.id;
        const ort = e.position.x.toFixed(1) + "/" + e.position.z.toFixed(1);
        const ws = r._foundryWorldScaleMatrix(pr).elements[0] * (Number.isFinite(e.scale) && e.scale > 0 ? e.scale : 1);
        const ry = Number.isFinite(e.rotationY) ? e.rotationY : 0;
        const c = Math.cos(ry),
            s = Math.sin(ry);
        const basis = e.position.y - 0.5;
        const W = new Float64Array(pts.length);
        let x0 = Infinity,
            x1 = -Infinity,
            y0 = Infinity,
            y1 = -Infinity,
            z0 = Infinity,
            z1 = -Infinity;
        for (let i = 0; i < pts.length; i += 3) {
            const lx = pts[i] * ws,
                ly = pts[i + 1] * ws,
                lz = pts[i + 2] * ws;
            W[i] = e.position.x + lx * c + lz * s;
            W[i + 1] = basis + ly;
            W[i + 2] = e.position.z - lx * s + lz * c;
            if (W[i] < x0) x0 = W[i];
            if (W[i] > x1) x1 = W[i];
            if (W[i + 1] < y0) y0 = W[i + 1];
            if (W[i + 1] > y1) y1 = W[i + 1];
            if (W[i + 2] < z0) z0 = W[i + 2];
            if (W[i + 2] > z1) z1 = W[i + 2];
        }
        const bildTxt = (x1 - x0).toFixed(1) + "×" + (y1 - y0).toFixed(1) + "×" + (z1 - z0).toFixed(1);
        const B = (e.blockerAABBs || []).filter((b) => !istFundament(b));
        const funde = [];
        // (G) die Gestalt des Fels-Blockers gegen die gezeichnete
        if (kind === "rock") {
            const kern = typeof r.constructor._studioGestaltenKern === "function" ? r.constructor._studioGestaltenKern(pr) : undefined;
            const gB = r._foundryVariantFor(e.seed, pr, kern);
            if (gB !== g) funde.push({ art: "gestalt", wer, ort, bildG: g, blockG: gB });
        }
        if (kind === "tree" && !B.length) funde.push({ art: "stamm", wer, ort });
        // (B) jede Box gegen das Bild in ihrem Rahmen
        let seite = 0,
            oben = 0,
            boxTxt = "";
        for (const b of B) {
            const R = rahmen(b);
            let a0 = Infinity,
                a1 = -Infinity,
                q0 = Infinity,
                q1 = -Infinity;
            for (let i = 0; i < W.length; i += 3) {
                const dx = W[i] - R.cx,
                    dz = W[i + 2] - R.cz;
                const u = dx * R.c - dz * R.s,
                    w = dx * R.s + dz * R.c;
                if (u < a0) a0 = u;
                if (u > a1) a1 = u;
                if (w < q0) q0 = w;
                if (w > q1) q1 = w;
            }
            const sd = Math.max(a0 + R.hx, R.hx - a1, q0 + R.hz, R.hz - q1);
            const od = b.topY - y1;
            if (sd > seite || od > oben) boxTxt = (2 * R.hx).toFixed(1) + "×" + (b.topY - b.botY).toFixed(1) + "×" + (2 * R.hz).toFixed(1);
            if (sd > seite) seite = sd;
            if (od > oben) oben = od;
        }
        const obenTol = Math.max(K.SEITE_M, K.OBEN_ANTEIL * (y1 - y0));
        if (seite > K.SEITE_M) funde.push({ art: "blocker", wer, ort, mass: seite, wo: "seitlich", bild: bildTxt, box: boxTxt });
        else if (oben > obenTol) funde.push({ art: "blocker", wer, ort, mass: oben, wo: "oben", bild: bildTxt, box: boxTxt });
        // (U) das Bild im Körper-Band gegen die Boxen (feste Werke)
        let neben = 0;
        if (FEST_KIND.has(kind)) {
            if (!B.length) neben = Infinity;
            else
                for (let i = 0; i < W.length; i += 3) {
                    const hy = W[i + 1] - basis;
                    if (hy < 0.1 || hy > K.KOERPER_BAND_M) continue;
                    let best = Infinity;
                    for (const b of B) {
                        const R = rahmen(b);
                        const dx = W[i] - R.cx,
                            dz = W[i + 2] - R.cz;
                        const u = dx * R.c - dz * R.s,
                            w = dx * R.s + dz * R.c;
                        const d = Math.hypot(
                            Math.max(Math.abs(u) - R.hx, 0),
                            Math.max(Math.abs(w) - R.hz, 0),
                            Math.max(b.botY - W[i + 1], W[i + 1] - b.topY, 0)
                        );
                        if (d < best) best = d;
                        if (best === 0) break;
                    }
                    if (best > neben) neben = best;
                }
            // die Hülle leitet der Wirt aus der gezeichneten Gestalt ab (Fels): das ganze Bild im Band ist gedeckt; die festen
            // Teile der anderen Werke erklärt ihr Gesetzbuch (Haus `__huelle`, Tor das porta-Gesetz, Wagen exportDrive,
            // Ausstattung ihre Teile) — dort trägt das Bild mindestens EINE Box, die Zahl steht in der Tabelle
            if (neben === Infinity || (K.STRENG.includes(kind) && neben > K.SEITE_M))
                funde.push({ art: "bild", wer, ort, mass: neben, bild: bildTxt });
        }
        if (merke) {
            const kl = aus.zensus.klassen[e.type.replace(/_v?\d+$/, "#") + "→" + pr] || {
                n: 0,
                seiteMax: 0,
                obenMax: 0,
                nebenMax: 0,
            };
            kl.n++;
            kl.seiteMax = Math.max(kl.seiteMax, +seite.toFixed(2));
            kl.obenMax = Math.max(kl.obenMax, +oben.toFixed(2));
            if (Number.isFinite(neben)) kl.nebenMax = Math.max(kl.nebenMax, +neben.toFixed(2));
            aus.zensus.klassen[e.type.replace(/_v?\d+$/, "#") + "→" + pr] = kl;
        }
        return funde;
    };
    const FEST_KIND = new Set(K.FEST);
    const P = st.playerMesh.position;
    for (const e of st.architectures.slice()) {
        if (!e || !e.position || Math.hypot(e.position.x - P.x, e.position.z - P.z) > K.R) continue;
        const funde = await urteileWerk(e, true);
        if (funde === null) continue;
        aus.zensus.werke++;
        for (const t of funde) if (aus.zensus.taeter.length < 40) aus.zensus.taeter.push(t);
        const ex = gesetzt.find(([, x]) => x === e);
        if (ex) aus.exemplare[ex[0]] = true;
    }
    for (const [typ, e] of gesetzt) if (aus.exemplare[typ] !== true) aus.exemplare[typ] = e.instanced || e.mesh ? "kein Bild" : "nicht gebaut";
    // (T) DER EINGESCHMUGGELTE TÄTER: ein Felsturm mit den Spender-Parts (die alte Regel, Vorlagen-Maß)
    const turm = st.architectures.find((e) => e && e.type === "felsturm" && e.blockerAABBs && e.blockerAABBs.length);
    if (turm) {
        const alt = turm.blockerAABBs;
        const bp = st.blueprints.felsturm;
        const spender = [];
        for (const part of bp.parts) if (r._isPartSolid(part)) spender.push(r._blockerComputePartAABB(turm, part));
        turm.blockerAABBs = spender;
        r._blockerStampReach(turm);
        const funde = (await urteileWerk(turm, false)) || [];
        aus.schmuggel = {
            wer: turm.type + "#" + turm.id,
            genannt: funde.some((t) => t.art === "blocker" && t.wer === turm.type + "#" + turm.id),
            funde: funde.map((t) => t.art + " " + (t.mass ? t.mass.toFixed(2) : "")),
        };
        turm.blockerAABBs = alt;
        r._blockerStampReach(turm);
    }
    // (Q) DIE QUELLE (kommentarfrei)
    const code = (fn) => (typeof fn === "function" ? window.__codeOf(fn) : "");
    const fels = code(r._felsBlockerParts);
    const pba = code(r._populateBlockerAABBs);
    aus.quelle = {
        felsOhneTypListe: fels.length > 0 && !/_var/.test(fels),
        felsSkala: /_felsBlockerParts\(entry\)[\s\S]*?_studioWeltSkala\(entry\)[\s\S]*?_blockerComputePartAABB\(entry, part, kFels\)/.test(pba),
        partsSkala: /const kWelt = this\._studioWeltSkala\(entry\)/.test(pba),
        ohneSpiegel: !("STUDIO_WORLD_SCALE" in r.constructor) && !/STUDIO_WORLD_SCALE/.test(code(r._foundryWorldScaleMatrix)),
        gestaltKern: typeof r.constructor._studioGestaltenKern === "function",
    };
    return aus;
}

(async () => {
    console.log("=== KOLLISION = BILD (Leben-Schau 2) — Null-Renderer, Foundry an, Mess-Wiese 150 m + Exemplare ===");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: "new",
        protocolTimeout: 900000,
        args: ["--no-sandbox", "--disable-gpu"],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(880000);
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
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 120000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 180000,
        });
        befund = await page.evaluate(probe, {
            R: 150,
            SEITE_M,
            OBEN_ANTEIL,
            KOERPER_BAND_M,
            FEST: [...FEST],
            STRENG,
            exemplare: PFLICHT_EXEMPLARE,
        });
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
    console.log(`  Ring ${befund.ring} Chunks · ${befund.zensus.werke} Studio-Werke gezählt`);
    console.log("  Klasse (Typ→Gestalt)                     n   Blocker ohne Bild seitlich/oben (m)   Bild ohne Blocker (m)");
    for (const [k, kl] of Object.entries(befund.zensus.klassen).sort((a, b) => b[1].seiteMax + b[1].obenMax - a[1].seiteMax - a[1].obenMax))
        console.log(
            `  ${k.padEnd(40)} ${String(kl.n).padStart(4)}   ${kl.seiteMax.toFixed(2).padStart(6)} / ${kl.obenMax.toFixed(2).padEnd(6)}` +
                `                 ${kl.nebenMax.toFixed(2)}`
        );
    console.log(`  Exemplare: ${JSON.stringify(befund.exemplare)}`);
    console.log(`  Schmuggel (T): ${JSON.stringify(befund.schmuggel)}`);
    console.log(`  Quelle: ${JSON.stringify(befund.quelle)}`);
    const v = urteil(befund);
    if (v.length) {
        console.log("\n❌ KOLLISION = BILD ROT:\n  " + v.join("\n  "));
        process.exit(1);
    }
    console.log("\n✅ KOLLISION = BILD GRÜN — jede Box hat ihr Bild, jedes feste Bild seine Box, der Fels misst seine Gestalt.");
    process.exit(0);
})();
