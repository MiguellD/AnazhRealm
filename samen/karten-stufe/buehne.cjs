#!/usr/bin/env node
// buehne.cjs — DIE VERGLEICHS-BÜHNE des Samen-Befunds „Karten-Stufe" (w28-samen-karten-stufe): EINE echte Krone je Art (der Abzug
// des Bäckers der Welt, `abzug/<art>-*.png`, Ring 0°, 8 Peilungen) wird als Stufe davor (das Netz: der Box-Anteil der gebackenen
// Stufe 0 — was die L1 am Schirm in dieser Größe zeigt) und als Karte (der Codec des Kerns, phyto-core `impostorMips` mit dem Saum
// der Art — die CPU-Seite des Gesetzes, das die GPU-Ablage `saumK` rechnet) im SELBEN Licht nebeneinander gestellt.
//
//   node samen/karten-stufe/buehne.cjs [--bilder] [--fall=a,b]   je Fall die Maße (ergebnis.json) und mit --bilder die Bild-Paare
//
// DIE FÄLLE (je der Text des Kerns, aus dem der Codec lädt):
//   heute       phyto-core.js aus main 1cd1c408 (git show)
//   gegenprobe  dasselbe Gesetz, das Band halb so breit (saumWeite 3 → 1,5: σ 6 → 3 Texel der Stufe)
//   kandidat    phyto-core.js des Arbeitsbaums (der Kandidat in der Form, in der er landen würde)
//   Bezüge: vorW28 (3552f058), vorW28s18, staerke84, kand1 (1611b54b), ohneSaum — die Rück-Fälle der Radeon (BEFUND.md § 5)
//
// DIE MASSE JE STUFE (ergebnis.json, je Art über 8 Peilungen gemittelt; BEFUND.md § 4):
//   gefuellt / gefallen   gewählt ohne eigene Deckung / Deckung ungewählt, je durch Σ c — die Verlegung V = ihr Mittel
//   deckung               D: Karte am Schirm gegen Netz (unten); lichtWelt H: das Licht der Karte aus ihren abgelegten Werten
//                         (`lichtWelt`) gegen das Licht des Netzes; lichtVorgerechnet und laubLuma: dasselbe mit vorgerechnetem Licht
//   kante, inseln, frei, zweiton   klassenMasse im Raster der Stufe; gestaltKante: dasselbe am Netz (binär an ½)
//   radial, stamm, schirmTri, sprung*, bandProbe, codecMs   wie im Text der Funktionen
//
// DAS LICHT (EINE Rechnung je Stufe-0-Texel, beide Seiten mitteln dasselbe lineare Licht — der Unterschied ist allein die Wahl):
//   L = Albedo · (0,85 · max(0, n · s) · Sicht(s) + 0,15 · (½ + ½ n_y)), die Sonne s aus der Uhr 0,5 (74° hoch, 45° links vor
//   dem Auge), die Normale oktaedrisch aus dem Abzug, Sicht(s) = c0 + c · s das lineare Feld der Sonnen-Sicht (KARTE_SONNEN_SICHT)
//   im Baum-Raum der Peilung; Schirm = Neutral-Tonkurve (Khronos PBR Neutral) von K · L, K = 0,44 / 0,18 (asset-worker-harness
//   `bauBild`), sRGB.
// DER SCHIRM DER STUFE k (1 Texel je Pixel): das Netz deckt den Anteil seiner 2^k × 2^k Stufe-0-Texel mit ihrem mittleren Licht;
//   die Karte deckt je Pixel den Anteil seiner 4 × 4 Proben, deren bilineare Alpha über der Schwelle 0,45 steht, mit der bilinear
//   gefilterten, durch die Alpha geteilten Farbe (die Welt: BC1 vormultipliziert, alphaTest an der Schwelle).
// DAS MASS DES SPRUNGS (die Formel der Station lod.K4, punkte-maschine g3.js 1323–1361, auf die Krone vor einem Grund):
//   M = { p : max_Kanal |Netz(p) − Karte(p)| > 2 } (sRGB-Bytes), Sprung = |Ȳ_Karte(M) − Ȳ_Netz(M)| / Ȳ_Netz(M), Y = Rec. 709;
//   je Grund (Himmel, Waldgrund) und dazu, ohne Grund, die Deckung D = Σ Deckung / Pixel und das Laub-Licht Ȳ_Laub = Σ D·Y / Σ D.
"use strict";
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const ROOT = path.resolve(__dirname, "..", "..");
const { kernAusText } = require(path.join(ROOT, "scripts/lib/asset-worker-harness.cjs"));
const { klassenMasse, pngLesen } = require(path.join(ROOT, "scripts/lib/abnahme-urteil.cjs"));
const { pngSchreiben } = require("./png.cjs");

const MAIN = "1cd1c408";
const TEXT = {
    heute: () => execSync(`git -C ${ROOT} show ${MAIN}:phyto-core.js`, { encoding: "utf8", maxBuffer: 64 << 20 }),
    vorW28: () => execSync(`git -C ${ROOT} show 3552f058:phyto-core.js`, { encoding: "utf8", maxBuffer: 64 << 20 }),
    kand1: () => execSync(`git -C ${ROOT} show 1611b54b:phyto-core.js`, { encoding: "utf8", maxBuffer: 64 << 20 }),
    kandidat: () => fs.readFileSync(path.join(ROOT, "phyto-core.js"), "utf8"),
};
const FAELLE = {
    heute: { text: "heute", gesetz: {} },
    gegenprobe: { text: "heute", gesetz: { saumWeite: 1.5 } },
    kandidat: { text: "kandidat", gesetz: {} },
    // Bezüge (keine der drei Fälle): das Gesetz vor w28-laub-deckung (Muster am eigenen Ort, Stärke 8,4; Radeon lod.K4#1 0,45–0,54 %)
    // und die Wahl ohne Saum (Stufe 0 wie gebacken, tiefer die geglättete Deckung — das Gesetz vor w23-karte-l2)
    vorW28: { text: "vorW28", gesetz: {}, bezug: true },
    ohneSaum: { text: "heute", gesetz: {}, ohneSaum: true, bezug: true },
    // die Rück-Fälle von w28-laub-luma (Radeon lod.K4#1): „nur phyto-core zurück" = das Gesetz von heute mit Stärke 8,4 (0,02 %),
    // Kandidat 1 = der Schlüssel auf der Deckung der Stufe, Stärke 3,6 (1611b54b, 1,06 %)
    staerke84: { text: "heute", gesetz: { saum: 8.4 }, bezug: true },
    kand1: { text: "kand1", gesetz: {}, bezug: true },
    // „nur stoff-karte zurück" (Radeon 1,19 %): das Gesetz vor w28 (Muster am eigenen Ort) mit der Stärke von heute 1,8
    vorW28s18: { text: "vorW28", gesetz: { saum: 1.8 }, bezug: true },
};
const ARTEN = ["buche", "fichte"];
const W = 128,
    H = 256,
    V = 8;
const STUFEN = [0, 1, 2];

// ── das Licht ──────────────────────────────────────────────────────────────────────────────────────────────────────────
const s2l = (b) => {
    const v = b / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};
const l2s = (x) => {
    const v = x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(Math.max(0, x), 1 / 2.4) - 0.055;
    return Math.max(0, Math.min(255, Math.round(v * 255)));
};
const SONNE = (() => {
    const e = (74 * Math.PI) / 180,
        a = (45 * Math.PI) / 180;
    return [-Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)];
})();
const K = 0.44 / 0.18;
const neutral = (c) => {
    const x = Math.min(...c),
        v = c.map((y) => y - (x < 0.08 ? x - 6.25 * x * x : 0.04)),
        pk = Math.max(...v);
    if (pk < 0.76) return v;
    const np = 1 - 0.0576 / (pk - 0.52),
        g = 1 - 1 / (0.15 * (pk - np) + 1);
    return v.map((y) => ((y * np) / pk) * (1 - g) + np * g);
};
const schirm = (lin) => neutral(lin.map((x) => K * x)).map(l2s);
const Y709 = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
// die Gründe (linear, vor K): ein heller Himmel und ein dunkler Waldgrund
const GRUENDE = { himmel: [0.2, 0.26, 0.34], waldgrund: [0.012, 0.016, 0.01] };

// ── der Abzug ──────────────────────────────────────────────────────────────────────────────────────────────────────────
function abzug(art) {
    const lies = (n) => pngLesen(fs.readFileSync(path.join(__dirname, "abzug", `${art}-${n}.png`))).u8;
    const meta = JSON.parse(fs.readFileSync(path.join(__dirname, "abzug", `${art}.json`), "utf8"));
    const [alb, nrm, sic] = ["albedo", "normale", "sicht"].map(lies);
    const sp = meta.sichtSpanne;
    const ansichten = [];
    for (let v = 0; v < V; v++) {
        const o0 = v * W * H;
        const rgba = new Uint8Array(W * H * 4),
            licht = new Float64Array(W * H * 3),
            deck = new Uint8Array(W * H),
            albL = new Float64Array(W * H * 3),
            nv = new Float64Array(W * H * 3),
            sv = new Float64Array(W * H * 4);
        const dreh = (v * 2 * Math.PI) / V;
        // die Sonne im Baum-Raum der Peilung (uBaum = rotY(v · dreh): Welt → Baum)
        const sB = [Math.cos(dreh) * SONNE[0] + Math.sin(dreh) * SONNE[2], SONNE[1], -Math.sin(dreh) * SONNE[0] + Math.cos(dreh) * SONNE[2]];
        for (let i = 0; i < W * H; i++) {
            const p = (o0 + i) * 4;
            if (alb[p + 3] < meta.schwelle * 255) continue;
            deck[i] = 1;
            // oktaedrisch → Normale (Bühne `nOkt`, Kartenstoff `oktAuf`)
            let ex = (nrm[p] / 255) * 2 - 1,
                ey = (nrm[p + 1] / 255) * 2 - 1;
            let nz = 1 - Math.abs(ex) - Math.abs(ey);
            if (nz < 0) [ex, ey] = [(1 - Math.abs(ey)) * Math.sign(ex || 1), (1 - Math.abs(ex)) * Math.sign(ey || 1)];
            const nl = Math.hypot(ex, ey, nz) || 1;
            const n = [ex / nl, ey / nl, nz / nl];
            const c = [0, 1, 2, 3].map((k) => (sic[p + k] / 255) * (sp[k][1] - sp[k][0]) + sp[k][0]);
            const sicht = Math.min(1, Math.max(0, c[0] + c[1] * sB[0] + c[2] * sB[1] + c[3] * sB[2]));
            const e = 0.85 * Math.max(0, n[0] * SONNE[0] + n[1] * SONNE[1] + n[2] * SONNE[2]) * sicht + 0.15 * (0.5 + 0.5 * n[1]);
            for (let k = 0; k < 3; k++) licht[i * 3 + k] = s2l(alb[p + k]) * e;
            for (let k = 0; k < 3; k++) albL[i * 3 + k] = s2l(alb[p + k]);
            nv.set(n, i * 3);
            sv.set(c, i * 4);
        }
        // DER EINGANG DES CODECS: das Licht als lineares Byte (×LICHT_HUB, damit 8 Bit es tragen), Deckung binär
        let mx = 0;
        for (const x of licht) mx = Math.max(mx, x);
        const hub = 0.98 / Math.max(mx, 1e-6);
        for (let i = 0; i < W * H; i++) {
            for (let k = 0; k < 3; k++) rgba[i * 4 + k] = deck[i] ? Math.round(licht[i * 3 + k] * hub * 255) : 0;
            rgba[i * 4 + 3] = deck[i] ? 255 : 0;
        }
        ansichten.push({ v, rgba, deck, hub, licht, albL, nv, sv, sB });
    }
    return { meta, ansichten, saum: { seite: meta.saum[1], fuss: meta.saum[5], nadel: meta.saum[8] > 0.5 } };
}

// ── die Stufen ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// das Netz der Stufe k: je Pixel der Anteil seiner Stufe-0-Texel und ihr mittleres Licht (aus denselben Bytes wie die Karte)
function netzStufe(an, k) {
    const f = 1 << k,
        w = W >> k,
        h = H >> k;
    const cov = new Float64Array(w * h),
        col = new Float64Array(w * h * 3);
    for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
            let n = 0;
            const s = [0, 0, 0];
            for (let b = 0; b < f; b++)
                for (let a = 0; a < f; a++) {
                    const i = (y * f + b) * W + x * f + a;
                    if (!an.deck[i]) continue;
                    n++;
                    for (let q = 0; q < 3; q++) s[q] += an.rgba[i * 4 + q] / 255 / an.hub;
                }
            const o = y * w + x;
            cov[o] = n / (f * f);
            for (let q = 0; q < 3; q++) col[o * 3 + q] = n ? s[q] / n : 0;
        }
    return { w, h, cov, col };
}
// die Karte der Stufe k am Schirm: 4 × 4 Proben je Pixel, bilinear, Alpha-Test an der Schwelle
function karteSchirm(st, k, hub, schwelle) {
    const S = st[k],
        w = S.w,
        h = S.h;
    const cov = new Float64Array(w * h),
        col = new Float64Array(w * h * 3);
    const tex = (x, y, q) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : S.data[(y * w + x) * 4 + q]);
    for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
            let n = 0;
            const s = [0, 0, 0];
            for (let j = 0; j < 4; j++)
                for (let i = 0; i < 4; i++) {
                    const u = x + (i + 0.5) / 4 - 0.5,
                        v = y + (j + 0.5) / 4 - 0.5,
                        x0 = Math.floor(u),
                        y0 = Math.floor(v),
                        fu = u - x0,
                        fv = v - y0;
                    const wt = [(1 - fu) * (1 - fv), fu * (1 - fv), (1 - fu) * fv, fu * fv],
                        xy = [[x0, y0], [x0 + 1, y0], [x0, y0 + 1], [x0 + 1, y0 + 1]];
                    let a = 0;
                    const pm = [0, 0, 0];
                    xy.forEach(([xx, yy], e) => {
                        const al = tex(xx, yy, 3) / 255;
                        a += wt[e] * al;
                        for (let q = 0; q < 3; q++) pm[q] += wt[e] * al * (s2l(tex(xx, yy, q)) / hub);
                    });
                    if (a > schwelle) {
                        n++;
                        for (let q = 0; q < 3; q++) s[q] += pm[q] / a;
                    }
                }
            const o = y * w + x;
            cov[o] = n / 16;
            for (let q = 0; q < 3; q++) col[o * 3 + q] = n ? s[q] / n : 0;
        }
    return { w, h, cov, col };
}
// DIE DECKUNG AM SCHIRM ZWISCHEN ZWEI STUFEN (der Filter der Welt, gate:streu-wahrheit schirmDeckung): je Pixel der Stufe k 4 × 4
// Proben, bilinear in Stufe k und k + 1, gemischt mit dem Anteil t der gröberen, verworfen an der Schwelle — gegen die Deckung
// des Netzes derselben Pixel (Box der Stufe 0). Rückgabe D_Karte / D_Netz − 1.
function schirmTri(st, an, k, t, schwelle) {
    const lies = (S, x, y) => (x < 0 || y < 0 || x >= S.w || y >= S.h ? 0 : S.data[(y * S.w + x) * 4 + 3] / 255);
    const bil = (S, u, v) => {
        const x0 = Math.floor(u),
            y0 = Math.floor(v),
            fu = u - x0,
            fv = v - y0;
        return (1 - fu) * (1 - fv) * lies(S, x0, y0) + fu * (1 - fv) * lies(S, x0 + 1, y0) + (1 - fu) * fv * lies(S, x0, y0 + 1) + fu * fv * lies(S, x0 + 1, y0 + 1);
    };
    const A = st[k],
        B = st[k + 1];
    let n = 0;
    for (let y = 0; y < A.h; y++)
        for (let x = 0; x < A.w; x++)
            for (let j = 0; j < 4; j++)
                for (let i = 0; i < 4; i++) {
                    const u = x + (i + 0.5) / 4,
                        v = y + (j + 0.5) / 4;
                    const a = (1 - t) * bil(A, u - 0.5, v - 0.5) + t * bil(B, u / 2 - 0.5, v / 2 - 0.5);
                    if (a > schwelle) n++;
                }
    let c = 0;
    for (let i = 0; i < W * H; i++) c += an.deck[i];
    return n / 16 / (A.w * A.h) / (c / (W * H)) - 1;
}
// das Bild eines Schirms vor einem Grund (sRGB-Bytes)
function bild(s, grund) {
    const out = new Uint8Array(s.w * s.h * 4);
    for (let i = 0; i < s.w * s.h; i++) {
        const lin = [0, 1, 2].map((q) => s.cov[i] * s.col[i * 3 + q] + (1 - s.cov[i]) * grund[q]);
        const b = schirm(lin);
        out.set([b[0], b[1], b[2], 255], i * 4);
    }
    return out;
}
// der Sprung auf dem Paar (Netz, Karte) vor einem Grund: über M (die Pixel, die sich um mehr als 2 ändern — die Maske der Station)
// und über U (jedes Pixel, das eine der beiden Seiten deckt — der Fußabdruck des Baums: in der Welt weicht das Licht der Karte
// überall ab, Normale auf ½, Sonnen-Sicht auf ¼ der Auflösung, BC1 — dort ist M ≈ U)
function sprung(N, Kk, grund) {
    const a = bild(N, grund),
        b = bild(Kk, grund);
    let n = 0,
        sa = 0,
        sb = 0,
        ua = 0,
        ub = 0;
    for (let i = 0; i < N.w * N.h; i++) {
        const p = i * 4;
        if (N.cov[i] > 0 || Kk.cov[i] > 0) {
            ua += Y709(a[p], a[p + 1], a[p + 2]);
            ub += Y709(b[p], b[p + 1], b[p + 2]);
        }
        if (Math.max(Math.abs(a[p] - b[p]), Math.abs(a[p + 1] - b[p + 1]), Math.abs(a[p + 2] - b[p + 2])) <= 2) continue;
        n++;
        sa += Y709(a[p], a[p + 1], a[p + 2]);
        sb += Y709(b[p], b[p + 1], b[p + 2]);
    }
    return { M: Math.abs(sb - sa) / sa, U: (ub - ua) / ua };
}
// Deckung und Laub-Licht ohne Grund
function laub(s) {
    let d = 0,
        y = 0;
    for (let i = 0; i < s.w * s.h; i++) {
        d += s.cov[i];
        const c = schirm([0, 1, 2].map((q) => s.col[i * 3 + q]));
        y += s.cov[i] * Y709(c[0], c[1], c[2]);
    }
    return { D: d / (s.w * s.h), Y: d ? y / d : 0 };
}
// die Wahl der Stufe gegen die eigene Deckung: gefüllt (gewählt ohne eigene Deckung), gefallen (Deckungs-Masse ungewählt)
function wahl(st, an, k, fuss, seite) {
    const f = 1 << k,
        w = W >> k,
        h = H >> k,
        S = st[k];
    let gefuellt = 0,
        gefallen = 0,
        masse = 0,
        stamm = 0,
        stammWahl = 0;
    for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
            let n = 0;
            for (let b = 0; b < f; b++) for (let a = 0; a < f; a++) n += an.deck[(y * f + b) * W + x * f + a];
            const c = n / (f * f);
            masse += c;
            const g = S.data[(y * w + x) * 4 + 3] > 0;
            if (g && c === 0) gefuellt++;
            if (!g) gefallen += c;
            // der Stamm: unter dem Kronen-Fuß (dieselbe Zeile wie der Schlüssel: Y der Texel-Mitte in Stufe-0-Texeln)
            if ((y + 0.5) * f > fuss) {
                stamm += c;
                stammWahl += g ? 1 : 0;
            }
        }
    // DIE LAGE DER VERLEGUNG: der mittlere Abstand der Deckung zur Kronen-Mitte (Schwerpunkt der Netz-Deckung über dem Fuß, in
    // Stufe-0-Texeln, die Achsen im Maß der Welt: x · seite), Karte gegen Netz — < 0 zieht die Karte nach innen (der Laib), > 0 hinaus
    let mx = 0,
        my = 0,
        mm = 0;
    const cAt = (x, y) => {
        let n = 0;
        for (let b = 0; b < f; b++) for (let a = 0; a < f; a++) n += an.deck[(y * f + b) * W + x * f + a];
        return n / (f * f);
    };
    for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
            if ((y + 0.5) * f > fuss) continue;
            const c = cAt(x, y);
            mx += c * (x + 0.5) * f;
            my += c * (y + 0.5) * f;
            mm += c;
        }
    [mx, my] = [mx / mm, my / mm];
    let rn = 0,
        rk = 0,
        nk = 0;
    for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
            if ((y + 0.5) * f > fuss) continue;
            const r = Math.hypot(((x + 0.5) * f - mx) * seite, (y + 0.5) * f - my);
            rn += cAt(x, y) * r;
            if (S.data[(y * w + x) * 4 + 3] > 0) (rk += r), nk++;
        }
    return { gefuellt: gefuellt / masse, gefallen: gefallen / masse, stamm: stamm > 0 ? stammWahl / stamm : null, radial: rk / nk / (rn / mm) - 1 };
}

// ── DAS LICHT DER KARTE, wie die Welt es gibt ──────────────────────────────────────────────────────────────────────────
// Die Welt lichtet die Karte AUS ABGELEGTEN WERTEN (Kartenstoff): Albedo der Stufe, Normale auf der halben Auflösung (Stufe j der
// Welt = Stufe j + 1 der Bühne, normalK: die Richtung der Summe der deckenden), Sonnen-Sicht auf ¼ der Stufe 0 (sicht: das Mittel der
// deckenden je 4 × 4) — ein Texel ohne eigene Deckung trägt Farbe, Normale und Sicht SEINES BANDS (ablageNT, sichtBand, bc1).
// Das Netz lichtet jedes Blatt selbst. Hier: dasselbe Licht-Gesetz (L oben) auf beiden Seiten — das Netz je Stufe-0-Texel, die
// Karte je gewähltem Texel aus ihren abgelegten Werten. B_k = Ȳ(Licht der gewählten Texel) / Ȳ(Licht des Netzes) − 1.
// Das Band (phyto-core karteSaumBand): binomial 17 Abgriffe im Schritt saumSchritt je Achse, der Rand der Ansicht leer.
function bandSumme(q, comp, w, h, st) {
    const n = 16,
        B = [1];
    for (let j = 0; j < n; j++) B.push((B[j] * (n - j)) / (j + 1));
    const z = new Float64Array(w * h * comp),
        out = new Float64Array(w * h * comp);
    for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++)
            for (let j = 0; j <= n; j++) {
                const t = x + Math.round((j - n / 2) * st[0]);
                if (t < 0 || t >= w) continue;
                for (let c = 0; c < comp; c++) z[(y * w + x) * comp + c] += B[j] * q[(y * w + t) * comp + c];
            }
    for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++)
            for (let j = 0; j <= n; j++) {
                const t = y + Math.round((j - n / 2) * st[1]);
                if (t < 0 || t >= h) continue;
                for (let c = 0; c < comp; c++) out[(y * w + x) * comp + c] += B[j] * z[(t * w + x) * comp + c];
            }
    return out;
}
// die Summe der deckenden Stufe-0-Werte (comp Kanäle) je Block f × f und ihre Zahl
function blockSumme(an, q, comp, f) {
    const w = W / f,
        h = H / f,
        s = new Float64Array(w * h * comp),
        n = new Float64Array(w * h);
    for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
            const i = y * W + x;
            if (!an.deck[i]) continue;
            const o = ((y / f) | 0) * w + ((x / f) | 0);
            n[o]++;
            for (let c = 0; c < comp; c++) s[o * comp + c] += q[i * comp + c];
        }
    return { w, h, s, n };
}
function lichtWelt(an, st, k, saum, PC) {
    const G = PC.KARTEN_GESETZ,
        sch = [G.saumWeite * Math.max(1 / saum.seite, 1), G.saumWeite * Math.max(saum.seite, 1)];
    const f = 1 << k,
        w = W >> k,
        h = H >> k,
        S = st[k];
    // Albedo der Stufe: eigene (Mittel der deckenden Kinder) oder die des Bands (Summen der Kinder im Kern des Saums)
    const A = blockSumme(an, an.albL, 3, f);
    const Ab = bandSumme(Float64Array.from({ length: w * h * 4 }, (_, i) => (i % 4 === 3 ? A.n[i >> 2] : A.s[(i >> 2) * 3 + (i % 4)])), 4, w, h, sch);
    // Licht vorgerechnet (die Seite des Netzes) — dieselbe Wahl, Mittel des Lichts: die Probe des Bands gegen den Codec
    const Lp = blockSumme(an, an.licht, 3, f);
    const Lpb = bandSumme(Float64Array.from({ length: w * h * 4 }, (_, i) => (i % 4 === 3 ? Lp.n[i >> 2] : Lp.s[(i >> 2) * 3 + (i % 4)])), 4, w, h, sch);
    // Normale auf halber Auflösung der Stufe
    const N = blockSumme(an, an.nv, 3, 2 * f);
    const Nb = bandSumme(N.s, 3, N.w, N.h, sch);
    // Sonnen-Sicht auf ¼ der Stufe 0, leer: das Band in Stufe-0-Texeln um die Mitte des Blocks
    const Sv = blockSumme(an, an.sv, 4, 4);
    let mittel = [0, 0, 0, 0],
        mz = 0;
    for (let i = 0; i < W * H; i++) if (an.deck[i]) (mz++, [0, 1, 2, 3].forEach((c) => (mittel[c] += an.sv[i * 4 + c])));
    mittel = mittel.map((x) => x / mz);
    const sicht = (sx, sy) => {
        const o = sy * Sv.w + sx;
        if (Sv.n[o] > 0) return [0, 1, 2, 3].map((c) => Sv.s[o * 4 + c] / Sv.n[o]);
        const cx = sx * 4 + 2,
            cy = sy * 4 + 2,
            Bn = [1];
        for (let j = 0; j < 16; j++) Bn.push((Bn[j] * (16 - j)) / (j + 1));
        const acc = [0, 0, 0, 0];
        let wsum = 0;
        for (let dy = 0; dy <= 16; dy++) {
            const yy = cy + Math.round((dy - 8) * sch[1]);
            if (yy < 0 || yy >= H) continue;
            for (let dx = 0; dx <= 16; dx++) {
                const xx = cx + Math.round((dx - 8) * sch[0]);
                if (xx < 0 || xx >= W || !an.deck[yy * W + xx]) continue;
                const wt = Bn[dy] * Bn[dx];
                wsum += wt;
                for (let c = 0; c < 4; c++) acc[c] += wt * an.sv[(yy * W + xx) * 4 + c];
            }
        }
        return wsum > 0 ? acc.map((x) => x / wsum) : mittel;
    };
    const licht = (alb, n, c) => {
        const l = Math.hypot(...n);
        const nn = l > 1e-6 ? n.map((x) => x / l) : [0, 0, 1];
        const vis = Math.min(1, Math.max(0, c[0] + c[1] * an.sB[0] + c[2] * an.sB[1] + c[3] * an.sB[2]));
        const e = 0.85 * Math.max(0, nn[0] * SONNE[0] + nn[1] * SONNE[1] + nn[2] * SONNE[2]) * vis + 0.15 * (0.5 + 0.5 * nn[1]);
        return alb.map((x) => x * e);
    };
    let yk = 0,
        yp = 0,
        m = 0,
        bandFehler = 0,
        bandN = 0;
    for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
            const o = y * w + x;
            if (!(S.data[o * 4 + 3] > 0)) continue;
            m++;
            const eigen = A.n[o] > 0;
            const alb = eigen ? [0, 1, 2].map((c) => A.s[o * 3 + c] / A.n[o]) : [0, 1, 2].map((c) => Ab[o * 4 + c] / Ab[o * 4 + 3]);
            const no = ((y >> 1) * N.w + (x >> 1)) * 3;
            const n = N.n[(y >> 1) * N.w + (x >> 1)] > 0 ? [0, 1, 2].map((c) => N.s[no + c]) : [0, 1, 2].map((c) => Nb[no + c]);
            const c = sicht(Math.min(Sv.w - 1, (((x + 0.5) * f) / 4) | 0), Math.min(Sv.h - 1, (((y + 0.5) * f) / 4) | 0));
            const L = licht(alb, n, c);
            yk += Y709(...L);
            const lp = eigen ? [0, 1, 2].map((q) => Lp.s[o * 3 + q] / Lp.n[o]) : [0, 1, 2].map((q) => Lpb[o * 4 + q] / Lpb[o * 4 + 3]);
            yp += Y709(...lp);
            if (!eigen) {
                // die Probe des Bands: der Codec legte dem gefüllten Texel die Farbe dieses Bands ab
                const cod = [0, 1, 2].map((q) => s2l(S.data[o * 4 + q]) / an.hub);
                bandFehler += Math.abs(Y709(...cod) - Y709(...lp)) / Math.max(1e-6, Y709(...lp));
                bandN++;
            }
        }
    let yn = 0,
        mn = 0;
    for (let i = 0; i < W * H; i++) if (an.deck[i]) (mn++, (yn += Y709(an.licht[i * 3], an.licht[i * 3 + 1], an.licht[i * 3 + 2])));
    return { welt: yk / m / (yn / mn) - 1, vorgerechnet: yp / m / (yn / mn) - 1, bandFehler: bandN ? bandFehler / bandN : 0 };
}

// ── der Lauf ───────────────────────────────────────────────────────────────────────────────────────────────────────────
function codec(fall) {
    const F = FAELLE[fall];
    const PC = kernAusText(TEXT[F.text](), "__phytoCore");
    Object.assign(PC.KARTEN_GESETZ, F.gesetz);
    return PC;
}
function hochNah(px, w, h, f) {
    const out = new Uint8Array(w * f * h * f * 4);
    for (let y = 0; y < h * f; y++)
        for (let x = 0; x < w * f; x++) out.set(px.subarray(((((y / f) | 0) * w + ((x / f) | 0)) * 4), ((((y / f) | 0) * w + ((x / f) | 0)) * 4) + 4), (y * w * f + x) * 4);
    return out;
}
// die Differenz-Maske: grün = die Karte deckt, wo das Netz nicht deckt (gefüllt), magenta = das Netz deckt, die Karte nicht
// (gefallen), grau = beide, schwarz = keiner (Schwelle ¼ Deckung)
function differenz(N, Kk) {
    const out = new Uint8Array(N.w * N.h * 4);
    for (let i = 0; i < N.w * N.h; i++) {
        const d = Kk.cov[i] - N.cov[i];
        const c = d > 0.25 ? [40, 220, 70] : d < -0.25 ? [230, 40, 200] : N.cov[i] + Kk.cov[i] > 0.5 ? [120, 120, 120] : [0, 0, 0];
        out.set([...c, 255], i * 4);
    }
    return out;
}
function nebeneinander(teile, h, rand = 6) {
    const W2 = teile.reduce((a, t) => a + t.w, 0) + rand * (teile.length - 1);
    const out = new Uint8Array(W2 * h * 4).fill(255);
    let x0 = 0;
    for (const t of teile) {
        for (let y = 0; y < h; y++) out.set(t.px.subarray(y * t.w * 4, (y + 1) * t.w * 4), (y * W2 + x0) * 4);
        x0 += t.w + rand;
    }
    return { w: W2, px: out };
}
function scheibe(PC) {
    // gate:streu-wahrheit (6e/6f): die Scheibe 128 × 256 je Saum-Gesetz, Kante und freie Inseln auf Stufe 0 und 1
    const sch = Uint8Array.from({ length: 1 << 17 }, (_, i) => (i % 4 === 3 && Math.hypot(((i >> 2) % 128) - 64, (i >> 9) - 128) < 48 ? 255 : 0));
    const out = {};
    const ringe = PC.karteRinge(8, 128, 256, [-20, 0, 40, 80], 2).ringe;
    for (const [n, nadel] of [["laub", false], ["nadel", true]]) {
        const sa = PC.karteSaumRinge({ leafSize: 1, conifer: nadel }, 1, 0.5, { minY: 0, R: 0 }, ringe, 128, 256);
        const st = PC.impostorMips(sch, 128, 256, 1, null, 6, { saum: { ...sa.ringe[1], nadel } }).stufen;
        const ms = st.slice(0, 2).map((s) => klassenMasse(s.data, Array.from({ length: s.w * s.h }, (_, i) => (s.data[i * 4 + 3] ? 1 : 0)), s.w, s.h));
        out[n] = ms.map((m) => ({ kante: m.kante, inseln: m.inseln, frei: m.frei }));
    }
    return out;
}

function main() {
    const mitBilder = process.argv.includes("--bilder");
    const nur = process.argv.find((a) => a.startsWith("--fall="));
    const faelle = nur ? nur.slice(7).split(",") : Object.keys(FAELLE);
    const ab = Object.fromEntries(ARTEN.map((a) => [a, abzug(a)]));
    const ergebnis = { stand: MAIN, sonne: SONNE, faelle: {} };
    for (const fall of faelle) {
        const PC = codec(fall);
        const thr = PC.KARTEN_GESETZ.schwelle;
        const E = (ergebnis.faelle[fall] = { gesetz: { ...PC.KARTEN_GESETZ }, scheibe: FAELLE[fall].ohneSaum ? null : scheibe(PC), arten: {} });
        for (const art of ARTEN) {
            const { ansichten, saum } = ab[art];
            const je = STUFEN.map(() => ({ D: [0, 0], Y: [0, 0], sprung: { himmel: 0, waldgrund: 0 }, sprungU: { himmel: 0, waldgrund: 0 }, gefuellt: 0, gefallen: 0, stamm: 0, radial: 0, gestaltKante: 0, gestaltInseln: 0, tri: [0, 0, 0], lichtWelt: 0, lichtVor: 0, bandFehler: 0, kante: 0, inseln: 0, frei: 0, zweiton: 0, ms: 0 }));
            for (const an of ansichten) {
                const t0 = process.hrtime.bigint();
                const st = PC.impostorMips(an.rgba, W, H, 1, null, 6, FAELLE[fall].ohneSaum ? {} : { saum }).stufen;
                const ms = Number(process.hrtime.bigint() - t0) / 1e6;
                STUFEN.forEach((k, j) => {
                    const N = netzStufe(an, k),
                        Kk = karteSchirm(st, k, an.hub, thr);
                    const ln = laub(N),
                        lk = laub(Kk);
                    const z = je[j];
                    z.ms += ms / STUFEN.length / V;
                    z.D[0] += ln.D / V;
                    z.D[1] += lk.D / V;
                    z.Y[0] += ln.Y / V;
                    z.Y[1] += lk.Y / V;
                    for (const g of Object.keys(GRUENDE)) {
                        const sp = sprung(N, Kk, GRUENDE[g]);
                        z.sprung[g] += sp.M / V;
                        z.sprungU[g] += sp.U / V;
                    }
                    const wl = wahl(st, an, k, saum.fuss, saum.seite);
                    z.gefuellt += wl.gefuellt / V;
                    z.gefallen += wl.gefallen / V;
                    z.stamm += (wl.stamm == null ? 0 : wl.stamm) / V;
                    z.radial += wl.radial / V;
                    if (k < 2) [0.25, 0.5, 0.75].forEach((t, q) => (z.tri[q] += schirmTri(st, an, k, t, thr) / V));
                    const lw = lichtWelt(an, st, k, saum, PC);
                    z.lichtWelt += lw.welt / V;
                    z.lichtVor += lw.vorgerechnet / V;
                    z.bandFehler += lw.bandFehler / V;
                    // DIE KANTE DER GESTALT SELBST im Raster der Stufe: das Netz, binär an ½ seiner Deckung
                    const mg = Array.from({ length: N.w * N.h }, (_, i) => (N.cov[i] >= 0.5 ? 1 : 0));
                    const kg = klassenMasse(bild(N, GRUENDE.himmel), mg, N.w, N.h);
                    z.gestaltKante += kg.kante / V;
                    z.gestaltInseln += kg.inseln / V;
                    // Kante, Inseln, Zweiton der Karte auf dem Raster ihrer Stufe (wie gate:streu-wahrheit 6e/6f), im Bild vor dem Himmel
                    const S = st[k];
                    const m = Array.from({ length: S.w * S.h }, (_, i) => (S.data[i * 4 + 3] ? 1 : 0));
                    const km = klassenMasse(bild(Kk, GRUENDE.himmel), m, S.w, S.h);
                    z.kante += km.kante / V;
                    z.inseln += km.inseln / V;
                    z.frei += km.frei / V;
                    z.zweiton += km.zweiton / V;
                    if (mitBilder && an.v === 0 && !FAELLE[fall].bezug && k < 2) {
                        const f = k === 0 ? 2 : k === 1 ? 4 : 8;
                        const tafel = nebeneinander(
                            [bild(N, GRUENDE.himmel), bild(Kk, GRUENDE.himmel), differenz(N, Kk)].map((px) => ({ w: N.w * f, px: hochNah(px, N.w, N.h, f) })),
                            N.h * f
                        );
                        fs.writeFileSync(path.join(__dirname, `${fall}-${art}-s${k}.png`), pngSchreiben(tafel.w, N.h * f, tafel.px));
                    }
                });
            }
            E.arten[art] = Object.fromEntries(
                STUFEN.map((k, j) => {
                    const z = je[j],
                        r4 = (x) => +x.toFixed(4);
                    return [
                        "S" + k,
                        {
                            deckungNetz: r4(z.D[0]),
                            deckungKarte: r4(z.D[1]),
                            deckung: r4(z.D[1] / z.D[0] - 1),
                            laubLumaNetz: r4(z.Y[0]),
                            laubLumaKarte: r4(z.Y[1]),
                            laubLuma: r4(z.Y[1] / z.Y[0] - 1),
                            sprungHimmel: r4(z.sprung.himmel),
                            sprungWaldgrund: r4(z.sprung.waldgrund),
                            sprungUHimmel: r4(z.sprungU.himmel),
                            sprungUWaldgrund: r4(z.sprungU.waldgrund),
                            gefuellt: r4(z.gefuellt),
                            gefallen: r4(z.gefallen),
                            stamm: r4(z.stamm),
                            radial: r4(z.radial),
                            gestaltKante: r4(z.gestaltKante),
                            gestaltInseln: r4(z.gestaltInseln),
                            schirmTri: z.tri.map(r4),
                            lichtWelt: r4(z.lichtWelt),
                            lichtVorgerechnet: r4(z.lichtVor),
                            bandProbe: r4(z.bandFehler),
                            kante: r4(z.kante),
                            inseln: r4(z.inseln),
                            frei: r4(z.frei),
                            zweiton: r4(z.zweiton),
                            codecMs: +z.ms.toFixed(1),
                        },
                    ];
                })
            );
        }
    }
    fs.writeFileSync(path.join(__dirname, nur ? `ergebnis-${nur.slice(7).replace(/,/g, "-")}.json` : "ergebnis.json"), JSON.stringify(ergebnis, null, 1));
    for (const [fall, E] of Object.entries(ergebnis.faelle)) {
        if (E.scheibe) console.log(`== ${fall}  Scheibe laub kante ${E.scheibe.laub.map((m) => m.kante)} frei ${E.scheibe.laub.map((m) => m.frei)} · nadel kante ${E.scheibe.nadel.map((m) => m.kante)} frei ${E.scheibe.nadel.map((m) => m.frei)}`);
        else console.log(`== ${fall}`);
        for (const [art, A] of Object.entries(E.arten)) for (const [s, z] of Object.entries(A)) console.log(`   ${art} ${s}`, JSON.stringify(z));
    }
}
main();
