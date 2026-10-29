// 2910 lod.K5 Staffel 1 headless — DER KANTEN-VERSATZ AM BAU (die Mechanik der GPU-Station ohne Bild: die Brücke baut, ein CPU-Raster
// malt). Im Spiel-Baum: `node <koordination>/bericht/2910-lod-k5/fehler-am-bau.cjs [--alle] [--art <kind>]` (Port LOD_FEHLER_PORT).
// Je Familie und gezeigter Stufe die schlechteste Vorlage (mit --alle jede Vorlage der Art): L0 und Stufe gebaut, je Peilung
// (8 Azimute × waagrecht und 20° von oben) ein gemeinsamer Rahmen, das Raster eine halbe Pixel-Kante des Abstands, je Bildpunkt die
// Deckung ≥ 0,5 (die gefilterte Alpha mit erhaltener Deckung); die Karte des Baums als Mischung ihrer zwei nächsten gebackenen
// L1-Ansichten (8 Peilungen, in Texeln der Zelle), die Tor-Flügel der L0 in der Fern-Pose (TUER_GESETZ.fern). Der Abstand ist das
// Gesetz des Stamms (`AnazhRealm._wechselGesetz`, geladen über scripts/lib/stamm.cjs, das Buch nach dem Umschlag) am Schirm des
// Solls 1920 × 1080 (KAM_FOV_GRAD); der Wagen (eine Karten-Art ohne Zeile) an der Schwelle seiner Maske, der des Baums in rohen
// Metern. Druckt je Fall die Bildpunkte am gewählten Abstand und am Abstand des Pixel-Terms (die Tafel
// LOD_SCHIRM.fehler darf ihn nicht unterschätzen), dazu `K5#1 {…}` je Familie das Schlechteste.
"use strict";
const path = require("path");
const ROOT = process.cwd();
const { eigenePorte, hauptLauf, urteilEnde } = require(path.join(ROOT, "scripts/lib/welt-boot.cjs"));
const ZEILEN = 1080;
const nachKomma = (x, n = 1) => (x == null ? "—" : (+x).toFixed(n).replace(".", ","));
// Je Peilung (8 Azimute × waagrecht und 20° von oben) ein gemeinsamer Rahmen für L0 und Stufe, das Raster eine halbe Pixel-Kante des
// Abstands, je Bildpunkt die Deckung ≥ 0,5 (die gefilterte Alpha mit erhaltener Deckung); die Kanten-Pixel jeder Maske, ihre
// Euklid-Distanz-Transformation (Felzenszwalb), der Chamfer beidseitig gemittelt — in Bildpunkten des Schirms.
const PEILUNG = [0, 20].flatMap((e) => [0, 1, 2, 3, 4, 5, 6, 7].map((a) => [(a * Math.PI) / 4 + 0.2, (e * Math.PI) / 180]));
function rahmen(netze, th, e, px, atlas) {
    const [cx, cz, ux, uy, uz] = [Math.cos(th), Math.sin(th), Math.sin(th) * Math.sin(e), Math.cos(e), -Math.cos(th) * Math.sin(e)];
    const P = (p, i) => [p[i * 3] * cx + p[i * 3 + 2] * cz, p[i * 3] * ux + p[i * 3 + 1] * uy + p[i * 3 + 2] * uz];
    let [u0, v0, u1, v1] = [Infinity, Infinity, -Infinity, -Infinity];
    for (const m of netze)
        for (let i = 0; i < m.pos.length / 3; i++) {
            const [u, v] = P(m.pos, i);
            [u0, v0, u1, v1] = [Math.min(u0, u), Math.min(v0, v), Math.max(u1, u), Math.max(v1, v)];
        }
    [u0, v0] = [u0 - 4 * px, v0 - 4 * px];
    const W = Math.ceil((u1 - u0) / px) + 8,
        H = Math.ceil((v1 - v0) / px) + 8;
    const masken = {};
    for (const m of netze) {
        const bild = masken[m.stufe] || (masken[m.stufe] = new Uint8Array(W * H));
        const { pos: p, idx } = m;
        for (let t = 0; t < idx.length; t += 3) {
            const q = [0, 1, 2].map((k) => P(p, idx[t + k]).map((x, j) => (x - (j ? v0 : u0)) / px));
            const fl = (q[1][0] - q[0][0]) * (q[2][1] - q[0][1]) - (q[1][1] - q[0][1]) * (q[2][0] - q[0][0]);
            if (Math.abs(fl) < 1e-12) continue;
            const [xa, xb] = [Math.max(0, Math.floor(Math.min(q[0][0], q[1][0], q[2][0]))), Math.min(W - 1, Math.ceil(Math.max(q[0][0], q[1][0], q[2][0])))];
            const [ya, yb] = [Math.max(0, Math.floor(Math.min(q[0][1], q[1][1], q[2][1]))), Math.min(H - 1, Math.ceil(Math.max(q[0][1], q[1][1], q[2][1])))];
            for (let y = ya; y <= yb; y++)
                for (let x = xa; x <= xb; x++) {
                    const [sx, sy] = [x + 0.5, y + 0.5];
                    const w0 = ((q[1][0] - sx) * (q[2][1] - sy) - (q[1][1] - sy) * (q[2][0] - sx)) / fl,
                        w1 = ((q[2][0] - sx) * (q[0][1] - sy) - (q[2][1] - sy) * (q[0][0] - sx)) / fl,
                        w2 = 1 - w0 - w1;
                    const o = y * W + x;
                    if (w0 < 0 || w1 < 0 || w2 < 0 || bild[o]) continue;
                    const [a, b, c] = [idx[t], idx[t + 1], idx[t + 2]];
                    if (w0 * p[a * 3 + 1] + w1 * p[b * 3 + 1] + w2 * p[c * 3 + 1] < 0) continue; // unter dem Boden der Vorlage
                    if (m.uv) {
                        const [tu, tv] = [0, 1].map((k) => w0 * m.uv[a * 2 + k] + w1 * m.uv[b * 2 + k] + w2 * m.uv[c * 2 + k]);
                        const i = Math.min(atlas.h - 1, Math.max(0, Math.floor(tv * atlas.h))) * atlas.w + Math.min(atlas.w - 1, Math.max(0, Math.floor(tu * atlas.w)));
                        if (atlas.alpha[i] < 128) continue;
                    }
                    bild[o] = 1;
                }
        }
    }
    return { W, H, masken, u0, v0 };
}
function schirmMaske(m, W, H, q) {
    const [GW, GH] = [Math.ceil(W / q), Math.ceil(H / q)];
    const s = new Float32Array(GW * GH);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) s[Math.floor(y / q) * GW + Math.floor(x / q)] += m[y * W + x];
    return { g: s.map((v) => (v >= (q * q) / 2 ? 1 : 0)), GW, GH };
}
function edt(f, n) {
    const [d, v, z] = [new Float64Array(n), new Int32Array(n), new Float64Array(n + 1)];
    let k = 0;
    [z[0], z[1]] = [-Infinity, Infinity];
    const s = (q, w) => (f[q] + q * q - (f[w] + w * w)) / (2 * q - 2 * w);
    for (let q = 1; q < n; q++) {
        while (k >= 0 && s(q, v[k]) <= z[k]) k--;
        k++;
        [v[k], z[k], z[k + 1]] = [q, k ? s(q, v[k - 1]) : -Infinity, Infinity];
    }
    for (let q = 0, j = 0; q < n; q++) {
        while (z[j + 1] < q) j++;
        d[q] = (q - v[j]) ** 2 + f[v[j]];
    }
    return d;
}
function chamfer(a, b, W, H) {
    const kante = (m) => m.map((x, o) => (x && (o % W === 0 || o % W === W - 1 || o < W || o >= W * (H - 1) || !m[o - 1] || !m[o + 1] || !m[o - W] || !m[o + W]) ? 1 : 0));
    const abstand = (k) => {
        const g = new Float64Array(W * H);
        for (let x = 0; x < W; x++) {
            const sp = edt(Float64Array.from({ length: H }, (_, y) => (k[y * W + x] ? 0 : 1e20)), H);
            for (let y = 0; y < H; y++) g[y * W + x] = sp[y];
        }
        for (let y = 0; y < H; y++) {
            const z = edt(g.subarray(y * W, y * W + W), W);
            for (let x = 0; x < W; x++) g[y * W + x] = Math.sqrt(z[x]);
        }
        return g;
    };
    const [ka, kb] = [kante(a), kante(b)];
    const mittel = (k, g) => {
        let [s, n] = [0, 0];
        for (let o = 0; o < k.length; o++) if (k[o]) [s, n] = [s + g[o], n + 1];
        return n ? s / n : NaN;
    };
    return (mittel(ka, abstand(kb)) + mittel(kb, abstand(ka))) / 2;
}
// der Versatz einer Stufe am Abstand d (Vorlagen-Meter) in Bildpunkten bei der Brennweite F: je Peilung L0 gegen die Stufe; die Karte
// des Baums aus ihren zwei nächsten gebackenen L1-Ansichten (KARTE.views, waagrecht, in Texeln der Zelle), gemischt, Deckung ≥ 0,5
function versatz(n0, ns, stufe, karte, d, F, atlas, K) {
    const px = d / F / 2;
    let summe = 0;
    for (const [th, e] of PEILUNG) {
        const R = rahmen(n0.concat(ns), th, e, px, atlas);
        let m1 = R.masken[stufe] || new Uint8Array(R.W * R.H);
        if (karte) {
            const step = (2 * Math.PI) / K.views,
                k = th / step,
                t = k - Math.floor(k);
            const q = Math.max(1, Math.round(K.texel / px));
            const lage = [Math.floor(k), Math.floor(k) + 1].map((v) => {
                const A = rahmen(n0.concat(ns), v * step, 0, px, atlas),
                    src = A.masken[stufe] || new Uint8Array(A.W * A.H);
                const T = schirmMaske(src, A.W, A.H, q);
                const out = new Float32Array(R.W * R.H);
                const [du, dv] = [Math.round((A.u0 - R.u0) / px), Math.round((A.v0 - R.v0) / px)];
                for (let y = 0; y < A.H; y++)
                    for (let x = 0; x < A.W; x++)
                        if (x + du >= 0 && y + dv >= 0 && x + du < R.W && y + dv < R.H) out[(y + dv) * R.W + x + du] = T.g[Math.floor(y / q) * T.GW + Math.floor(x / q)];
                return out;
            });
            m1 = lage[0].map((a, i) => ((1 - t) * a + t * lage[1][i] >= 0.5 ? 1 : 0));
        }
        const [A, B] = [schirmMaske(R.masken[0] || new Uint8Array(R.W * R.H), R.W, R.H, 2), schirmMaske(m1, R.W, R.H, 2)];
        summe += chamfer(A.g, B.g, A.GW, A.GH);
    }
    return summe / PEILUNG.length;
}
// die schlechteste Vorlage je Art und Stufe (gemessen 29.10. über alle Vorlagen, `--alle`)
const SCHLECHTESTE = { tree: ["weide"], haus: ["modern", "alemannisch"], gate: ["kathedrale", "geisttor"], vehicle: ["limousine"], ausstattung: ["brunnen"] };
async function fehlerAmBau(alle, nur) {
    const { runWithWorker, kanalImVm } = require(path.join(ROOT, "scripts/lib/asset-worker-harness.cjs"));
    const { dek } = require(path.join(ROOT, "scripts/lib/kronen-linse.cjs"));
    const { AnazhRealm: A, ctx } = require(path.join(ROOT, "scripts/lib/stamm.cjs")).ladeKlasse(ROOT);
    const buch = kanalImVm()({ type: "get-book" });
    ctx.__phytoCore.kerneVereinen(buch.renderConfig);
    A._studioRenderConfig = buch.renderConfig; // das Buch des Wirts nach dem Umschlag (`_foundryIngestRenderConfig`)
    const F = ZEILEN / (2 * Math.tan((A.KAM_FOV_GRAD * Math.PI) / 360));
    const fern = A.Gesetz("porta:TUER_GESETZ.fern") * A.Gesetz("porta:TUER_GESETZ.offen");
    const KARTE = buch.renderConfig.impostor;
    const S = A.LOD_SCHIRM;
    const vorlagen = (kind) => (alle ? Object.keys(buch.book).filter((id) => buch.book[id].kind === kind) : SCHLECHTESTE[kind]);
    const [port] = await eigenePorte("LOD_FEHLER_PORT");
    const zeilen = [];
    await runWithWorker(port, async ({ build, atlasAlpha }) => {
        const aa = await atlasAlpha();
        const atlas = { w: aa.w, h: aa.h, alpha: new Uint8Array(Buffer.from(aa.b64, "base64")) };
        const netze = (r, stufe) =>
            r.meshes
                .filter((m) => m.attrs.position && m.index && m.teil !== "schatten")
                .map((m) => {
                    const pos = dek(m.attrs.position.b64, Float32Array).slice();
                    if (m.tuer) {
                        // die Flügel der L0 in der Fern-Pose: der Wirt dreht sie ums Scharnier (`_tickTorFluegel`), seite · sign(zf) · fern
                        const { seite, hx, zf } = m.tuer,
                            w = seite * Math.sign(zf) * fern;
                        for (let i = 0; i < pos.length; i += 3) {
                            const [x, z] = [pos[i] - hx, pos[i + 2] - zf];
                            [pos[i], pos[i + 2]] = [hx + x * Math.cos(w) + z * Math.sin(w), zf - x * Math.sin(w) + z * Math.cos(w)];
                        }
                    }
                    return { stufe, pos, idx: dek(m.index, Uint32Array), uv: m.kind === "foliageTex" && m.attrs.uv ? dek(m.attrs.uv.b64, Float32Array) : null };
                });
        for (const kind of Object.keys(SCHLECHTESTE).filter((k) => !nur || k === nur))
            for (const id of vorlagen(kind)) {
                const n0 = netze(await build({ presetId: id, seed: 1, lod: 0, season: "summer" }), 0);
                let [hi, lo, ext] = [-Infinity, Infinity, 0];
                for (const m of n0) for (let i = 0; i < m.pos.length; i += 3) [hi, lo, ext] = [Math.max(hi, m.pos[i + 1]), Math.min(lo, m.pos[i + 1]), Math.max(ext, Math.abs(m.pos[i]), Math.abs(m.pos[i + 2]))];
                const hoehe = hi - Math.max(0, lo);
                for (const stufe of Object.keys(S.fehler[kind] || { 1: 0 }).map(Number)) {
                    const karte = kind === "tree" && stufe === 2;
                    const ns = netze(await build({ presetId: id, seed: 1, lod: karte ? 1 : stufe, season: "summer" }), stufe);
                    const bezug = kind === "tree" ? hoehe : 1;
                    const K = { views: KARTE.views, texel: Math.max(hoehe / KARTE.cellH, (2 * ext) / KARTE.cellW) };
                    const gewaehlt = S.fehler[kind] ? A._wechselGesetz(kind, stufe, bezug, ZEILEN) : A._wechselGesetz("tree", stufe, buch.renderConfig.lod.ref, ZEILEN);
                    const pixel = S.fehler[kind] ? (S.fehler[kind][stufe] * bezug * F) / S.px : Infinity;
                    const z = { kind, id, stufe, gewaehlt, am: versatz(n0, ns, stufe, karte, gewaehlt, F, atlas, K) };
                    z.tafel = pixel > gewaehlt * 1.001 ? null : versatz(n0, ns, stufe, karte, pixel, F, atlas, K);
                    zeilen.push(z);
                    console.log(`  ${kind} ${id} L${stufe}: gewählt ${nachKomma(gewaehlt, 2)} m → ${nachKomma(z.am, 2)} px` + (z.tafel == null ? " (der Haushalt hält)" : ` · Pixel-Term ${nachKomma(pixel, 2)} m → ${nachKomma(z.tafel, 2)} px`));
                }
            }
    });
    const FAM = { tree: "Baum", haus: "Haus", gate: "Tor", vehicle: "Wagen", ausstattung: "Ausstattung" };
    const je = Object.keys(FAM).filter((k) => zeilen.some((z) => z.kind === k)).map((k) => [FAM[k], Math.max(...zeilen.filter((z) => z.kind === k).map((z) => z.am))]);
    const soll = S.px * 1.15; // der Rausch-Boden des Rasters (L0 gegen sich um ½ Pixel verschoben) liegt bei 0,4–0,65 px
    const unter = zeilen.filter((z) => z.tafel != null && z.tafel > soll);
    console.log(`K5#1 ${je.every(([, x]) => x <= soll) ? "GRÜN" : "ROT"}: ${je.map(([n, x]) => n + " " + nachKomma(x, 2) + " px").join(" · ")} (Soll ≤ ${S.px} px am gewählten Abstand, 1920 × 1080)`);
    console.log("FEHLER " + JSON.stringify({ familien: Object.fromEntries(je), soll, zeilen }));
    urteilEnde(
        unter.length,
        () => "\n❌ ROT — die Tafel unterschätzt den Fehler: " + unter.map((z) => `${z.kind} ${z.id} L${z.stufe} ${nachKomma(z.tafel, 2)} px am Pixel-Term`).join(" · "),
        "\n✅ GRÜN — die Tafel trägt am Pixel-Term höchstens das Soll; der Fehler am gewählten Abstand steht oben."
    );
}


const art = process.argv.indexOf("--art");
hauptLauf(() => fehlerAmBau(process.argv.includes("--alle"), art > 0 ? process.argv[art + 1] : null));
