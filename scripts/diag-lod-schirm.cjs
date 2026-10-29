#!/usr/bin/env node
// diag-lod-schirm.cjs — DIE LINSE DES WECHSEL-ABSTANDS (lod.K5, gate:lod-schirm): die Stufe folgt dem Schirm, nie dem Regler.
// Die Welt headless (Null-Renderer) am Schirm des Solls 1920 × 1080:
//   G  GESETZ: je Art und Stufe der Abstand des EINEN Gesetzes (`_wechselAbstand`, Pixelgröße × Haushalt) — die Leser fragen es:
//      die Schwellen der Bäume (LOD_DISTANCES, die Maske spiegelt sie) und die Grenzen eines Hauses, Tors, Wagens und einer
//      Ausstattung (`_archStufenGrenzen`). Der Kanten-Versatz am gewählten Abstand misst `--fehler` am Bau.
//   R  REGLER: die echte Kette (Fold → PID → Aktuator, der headless-Zweig gelüftet) bei 30, 60 und 144 Bildern und dem Regler des
//      Spielers ±10 % (perfTargetMs): die Abstände, Schwellen, Grenzen, die Stufen-Wahl, die Wahrnehmungs-Distanz der Maske, der
//      Laub- und der Bau-Rand je Lauf GLEICH, während der Regler wandert (loadScale-Spanne ≥ 0,3, sonst BLIND) — K5 Staffel 2.
//   W  WACHSTUM: der Laub-Radius steht an der gebauten Ring-Kante, nie davor (der Ring wächst Schale um Schale, `_ringWaechst`).
//   MUTANTE im selben Lauf: das Gesetz mit einem Regler-Term (× (0,7 + 0,3 · loadScale)) MUSS in R rot fallen.
// --fehler: der Kanten-Versatz L0 ↔ Stufe am Bau (die Brücke baut, das CPU-Raster der kronen-linse malt je Peilung die Silhouette
// in den Bildpunkten des Abstands, Chamfer der Kanten; die Karte als Mischung ihrer zwei nächsten gebackenen L1-Ansichten, die
// Tor-Flügel der L0 in der Fern-Pose) je Familie an ihrer schlechtesten Vorlage: am gewählten Abstand (`K5#1`, Soll ≤
// LOD_SCHIRM.px) und am Abstand des Pixel-Terms (die Tafel LOD_SCHIRM.fehler darf ihn nicht unterschätzen).
// SELBSTTEST (--selftest, ohne Browser).
//   node scripts/diag-lod-schirm.cjs [--selftest | --fehler [--alle]]   (Port LOD_SCHIRM_PORT, sonst frei)
"use strict";
const { statikServer, nullSeite, hauptLauf, eigenePorte, taeterFaelle, selbsttestEnde, urteilEnde, ROOT } = require("./lib/welt-boot.cjs");

const ZEILEN = 1080;
const FPS = [30, 60, 144];
const REGLER = [0.9, 1.1];
const SPANNE = 0.3;

function urteil(z) {
    const v = [];
    const lauf = z.laeufe || [];
    const ref = lauf[0] && JSON.stringify(lauf[0].snap);
    for (const l of lauf.slice(1))
        if (JSON.stringify(l.snap) !== ref) {
            const k = Object.keys(l.snap).find((x) => JSON.stringify(l.snap[x]) !== JSON.stringify(lauf[0].snap[x]));
            v.push(`REGLER: bei ${l.name} wandert ${k} (${JSON.stringify(lauf[0].snap[k])} → ${JSON.stringify(l.snap[k])}) — die Stufe folgt der Bildrate`);
        }
    const ls = lauf.map((l) => l.ls);
    if (lauf.length < FPS.length + REGLER.length || !(Math.max(...ls) - Math.min(...ls) >= SPANNE))
        v.push(`BLIND: der Regler wanderte nicht (loadScale ${ls.map((x) => x.toFixed(2)).join("/")}, Soll-Spanne ≥ ${SPANNE})`);
    if (!z.mutanteRot) v.push("MUTANTE: das Gesetz mit Regler-Term fällt nicht rot — die Linse ist blind");
    for (const [k, s] of z.leser || []) v.push(`LESER: ${k} fragt das Gesetz nicht (${s})`);
    if (!z.gesetz || !Object.keys(z.gesetz).length) v.push("BLIND: kein Abstand des Gesetzes gelesen");
    const w = z.wachstum;
    if (!w || !(w.laub > 0) || w.laub > w.kante + 1e-6) v.push(`WACHSTUM: der Laub-Radius ${w && w.laub} m steht vor der Ring-Kante ${w && w.kante} m`);
    return v;
}

function selbsttest() {
    const snap = { d: [9, 26], t: [12, 26], laub: 240, bau: 150 };
    const gut = {
        laeufe: [...FPS.map((f) => "fps " + f), ...REGLER.map((k) => "Regler ×" + k)].map((name, i) => ({ name, ls: [0.2, 0.7, 1, 0.9, 1][i], snap })),
        mutanteRot: true,
        leser: [],
        gesetz: { haus: { 1: 9 } },
        wachstum: { laub: 129, kante: 129.6 },
    };
    const klon = () => JSON.parse(JSON.stringify(gut));
    const fehler = [];
    if (urteil(gut).length) fehler.push("der grüne Lauf fällt rot: " + urteil(gut).join(" · "));
    taeterFaelle(
        [
            ["Abstand am Regler", (z) => (z.laeufe[1].snap.d = [6.3, 18.2]), /REGLER: bei fps 60 wandert d/],
            ["Wald-Rand am Regler", (z) => (z.laeufe[4].snap.laub = 70), /REGLER: bei Regler ×1.1 wandert laub/],
            ["Regler steht", (z) => z.laeufe.forEach((l) => (l.ls = 1)), /BLIND: der Regler wanderte nicht/],
            ["Mutante grün", (z) => (z.mutanteRot = false), /MUTANTE/],
            ["Leser am Buch", (z) => (z.leser = [["Tor", "ab 9.5 ≠ 9.0"]]), /LESER: Tor/],
            ["Laub vor dem Boden", (z) => (z.wachstum.laub = 240), /WACHSTUM: der Laub-Radius 240/],
        ],
        urteil,
        { fehler, klon }
    );
    selbsttestEnde(fehler);
}

// DIE PROBE IN DER SEITE: die Abstände je Art und Stufe, die Leser, die Läufe der Kette je Bildrate und Regler, die Mutante, das Wachstum.
async function probe(M) {
    const r = window.anazhRealm;
    const st = r.state;
    const A = r.constructor;
    const f = r._ensureAssetFoundry();
    await window.__weltDa(() => f && f.ready && A._studioRenderConfig);
    const bau = { haus: "haus_alemannisch", gate: "tor_drachentor", vehicle: "fahrzeug_gt" };
    const arten = [["tree", 1], ["tree", 2], ["haus", 1], ["haus", 2], ["gate", 1], ["gate", 2], ["vehicle", 1], ["ausstattung", 1]];
    const out = { zeilen: r._schirm().hoehe, gesetz: {}, leser: [], laeufe: [] };
    // vor dem Schnitt (origin/main) trägt die Welt kein Gesetz: dann misst die Linse, was die Leser wählen — der Täter wandert in R
    const gesetzDa = typeof r._wechselAbstand === "function";
    const abstand = (k, s, g) => (gesetzDa ? r._wechselAbstand(k, s, g) : null);
    const schwellen = () => gesetzDa && r._stufenSchirm();
    for (const [k, s] of arten) (out.gesetz[k] = out.gesetz[k] || {})[s] = abstand(k, s, 1);
    const D = A.LOD_DISTANCES;
    const ref = st.lodRef > 0 ? st.lodRef : D.lodRef;
    schwellen();
    for (const [i, k] of [[0, "thresh01"], [1, "thresh12"]])
        if (!(Math.abs(D[k] - abstand("tree", i + 1, ref)) < 1e-9)) out.leser.push(["Baum " + k, D[k] + " ≠ " + abstand("tree", i + 1, ref)]);
    const grenzen = () =>
        Object.entries(bau).map(([k, typ]) => {
            const G = r._archStufenGrenzen({ type: typ });
            return [k, G ? G.grenzen.map((g) => [g.stufe, +g.ab.toFixed(6)]) : null];
        });
    for (const [k, g] of grenzen())
        for (const [s, ab] of g || [["?", NaN]])
            if (!(Math.abs(ab - abstand(k, s, 1)) < 1e-6)) out.leser.push([k, "Grenze L" + s + " " + ab + " ≠ Gesetz " + abstand(k, s, 1)]);
    // DIE KETTE je Lauf: der headless-Zweig gelüftet, die zwei GPU-Anwender gestubbt, alles zurück
    const merk = { kopflos: st.renderer._isHeadlessNull, rs: r._applyRenderScale, sr: r._applyEffectiveShadowRange, ziel: st.perfTargetMs, sense: st.perfSense };
    const feld = Object.assign({}, st._perfFrame);
    const lauf = (frameMs, ziel) => {
        st.perfTargetMs = ziel;
        st.perfSense = null;
        for (let i = 0; i < 600; i++) {
            st._perfFrame = { renderCalls: 1100, renderTris: 3.1e6, render: 2, archCulling: 0.6, streaming: 1.2, waterIso: 0.4 };
            st._perfMarks = {};
            r._perfSenseFoldFrame(frameMs, frameMs / 1000);
        }
        schwellen();
        const wahl = [];
        for (const [d, cur, h] of [[6, 0, 8], [11, 0, 12], [14, 1, 12], [24, 1, 20], [30, 1, 12], [60, 2, 30], [90, 2, 24]])
            wahl.push(r._chooseLODForDistance(d, cur, h), r._chooseLODForDistance(d, undefined, h));
        return {
            ls: st.perfSense.loadScale,
            snap: {
                d: arten.map(([k, s]) => abstand(k, s, 1)),
                t: [D.thresh01, D.thresh12],
                grenzen: grenzen(),
                wahl,
                wahrnehmung: r._lodPerceptionDistance(100, 12), // die Distanz, die auch die Maske misst (uLodPerf)
                laub: st.foliageRadius,
                bau: st.architectureCullingRadius,
            },
        };
    };
    const laeufe = (wer) => [
        ...M.fps.map((x) => Object.assign({ name: wer + "fps " + x }, lauf(1000 / x, M.ziel))),
        ...M.regler.map((k) => Object.assign({ name: wer + "Regler ×" + k }, lauf(1000 / 60, M.ziel * k))),
    ];
    const gesetz = A._wechselGesetz;
    try {
        st.renderer._isHeadlessNull = false;
        r._applyRenderScale = () => {};
        r._applyEffectiveShadowRange = () => {};
        out.laeufe = laeufe("");
        // DIE MUTANTE: derselbe Lauf, das Gesetz mit einem Regler-Term
        if (gesetz) A._wechselGesetz = (...a) => gesetz(...a) * (0.7 + 0.3 * (st.perfSense ? st.perfSense.loadScale : 1));
        const mut = laeufe("Mutante ");
        out.mutanteRot = mut.some((l) => JSON.stringify(l.snap) !== JSON.stringify(mut[0].snap));
        A._wechselGesetz = gesetz;
        // DAS WACHSTUM: der Boot (Ring 0, Laub 70 m), dann der Ring Schale um Schale
        st._activeRingRadius = 0;
        st.foliageRadius = A.PERF_FOLIAGE_RADIUS_MIN;
        const { span } = r._voxelChunkConfig();
        for (let i = 0; i < 160; i++) {
            r._gameLoopTick(performance.now());
            await new Promise((x) => setTimeout(x, 4));
        }
        out.wachstum = { laub: +st.foliageRadius.toFixed(2), kante: +((st._activeRingRadius + 1) * span).toFixed(2), ring: st._activeRingRadius };
    } finally {
        A._wechselGesetz = gesetz;
        st.renderer._isHeadlessNull = merk.kopflos;
        r._applyRenderScale = merk.rs;
        r._applyEffectiveShadowRange = merk.sr;
        st.perfTargetMs = merk.ziel;
        st.perfSense = merk.sense;
        st._perfFrame = feld;
    }
    out.laub = gesetzDa ? r._randSchirm("laub") : null;
    out.bau = gesetzDa ? r._randSchirm("bau") : null;
    return out;
}

const nachKomma = (x, n = 1) => (x == null ? "—" : (+x).toFixed(n).replace(".", ","));

// ── DER KANTEN-VERSATZ AM BAU (--fehler) ──
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
// die schlechteste Vorlage je Art und Stufe (gemessen 29.10. über alle Vorlagen, `--alle`), FERN = die Fern-Pose der Tor-Flügel
const SCHLECHTESTE = { tree: ["weide"], haus: ["fraenkisch", "alemannisch"], gate: ["kathedrale", "geisttor"], vehicle: ["limousine"], ausstattung: ["brunnen"] };
async function fehlerAmBau(alle) {
    const { runWithWorker, kanalImVm } = require("./lib/asset-worker-harness.cjs");
    const { dek } = require("./lib/kronen-linse.cjs");
    const { AnazhRealm: A, ctx } = require("./lib/stamm.cjs").ladeKlasse(ROOT);
    const buch = kanalImVm()({ type: "get-book" });
    ctx.__phytoCore.kerneVereinen(buch.renderConfig);
    A._studioRenderConfig = buch.renderConfig; // das Buch des Wirts nach dem Umschlag (`_foundryIngestRenderConfig`)
    const F = ZEILEN / (2 * Math.tan((A.KAM_FOV_GRAD * Math.PI) / 360));
    const fern = A.Gesetz("porta:TUER_GESETZ.fern") * A.Gesetz("porta:TUER_GESETZ.offen");
    const KARTE = buch.renderConfig.impostor;
    const S = A.LOD_SCHIRM;
    const vorlagen = (kind) => (alle ? Object.keys(buch.book).filter((id) => buch.book[id].kind === kind) : SCHLECHTESTE[kind]);
    const [port] = await eigenePorte("LOD_SCHIRM_PORT");
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
        for (const kind of Object.keys(SCHLECHTESTE))
            for (const id of vorlagen(kind)) {
                const n0 = netze(await build({ presetId: id, seed: 1, lod: 0, season: "summer" }), 0);
                let [hi, lo, ext] = [-Infinity, Infinity, 0];
                for (const m of n0) for (let i = 0; i < m.pos.length; i += 3) [hi, lo, ext] = [Math.max(hi, m.pos[i + 1]), Math.min(lo, m.pos[i + 1]), Math.max(ext, Math.abs(m.pos[i]), Math.abs(m.pos[i + 2]))];
                const hoehe = hi - Math.max(0, lo);
                for (const stufe of Object.keys(S.fehler[kind]).map(Number)) {
                    const karte = kind === "tree" && stufe === 2;
                    const ns = netze(await build({ presetId: id, seed: 1, lod: karte ? 1 : stufe, season: "summer" }), stufe);
                    const bezug = kind === "tree" ? hoehe : 1;
                    const K = { views: KARTE.views, texel: Math.max(hoehe / KARTE.cellH, (2 * ext) / KARTE.cellW) };
                    const gewaehlt = A._wechselGesetz(kind, stufe, bezug, ZEILEN);
                    const pixel = (S.fehler[kind][stufe] * bezug * F) / S.px;
                    const z = { kind, id, stufe, gewaehlt, am: versatz(n0, ns, stufe, karte, gewaehlt, F, atlas, K) };
                    z.tafel = pixel > gewaehlt * 1.001 ? null : versatz(n0, ns, stufe, karte, pixel, F, atlas, K);
                    zeilen.push(z);
                    console.log(`  ${kind} ${id} L${stufe}: gewählt ${nachKomma(gewaehlt, 2)} m → ${nachKomma(z.am, 2)} px` + (z.tafel == null ? " (der Haushalt hält)" : ` · Pixel-Term ${nachKomma(pixel, 2)} m → ${nachKomma(z.tafel, 2)} px`));
                }
            }
    });
    const FAM = { tree: "Baum", haus: "Haus", gate: "Tor", vehicle: "Wagen", ausstattung: "Ausstattung" };
    const je = Object.keys(FAM).map((k) => [FAM[k], Math.max(...zeilen.filter((z) => z.kind === k).map((z) => z.am))]);
    const soll = S.px * 1.15; // der Rausch-Boden des Rasters (L0 gegen sich um ½ Pixel verschoben) liegt bei 0,4–0,65 px
    const unter = zeilen.filter((z) => z.tafel != null && z.tafel > soll);
    console.log(`K5#1 ${je.every(([, x]) => x <= soll) ? "GRÜN" : "ROT"}: ${je.map(([n, x]) => n + " " + nachKomma(x, 2) + " px").join(" · ")} (Soll ≤ ${S.px} px am gewählten Abstand, 1920 × 1080)`);
    urteilEnde(
        unter.length,
        () => "\n❌ ROT — die Tafel unterschätzt den Fehler: " + unter.map((z) => `${z.kind} ${z.id} L${z.stufe} ${nachKomma(z.tafel, 2)} px am Pixel-Term`).join(" · "),
        "\n✅ GRÜN — die Tafel trägt am Pixel-Term höchstens das Soll; der Fehler am gewählten Abstand steht oben."
    );
}

async function welt() {
    const [port] = await eigenePorte("LOD_SCHIRM_PORT");
    const server = statikServer();
    await server.lausche(port);
    const { browser, page } = await nullSeite({ frist: 300000, viewport: { width: 1920, height: ZEILEN } });
    try {
        await server.zeige(page, 30000);
        await page.evaluate(() => window.__weltDa());
        const ziel = await page.evaluate(() => window.anazhRealm.constructor.PERF_TARGET_MS);
        const z = await page.evaluate(probe, { fps: FPS, regler: REGLER, ziel });
        const g = z.gesetz;
        console.log(`=== DER WECHSEL AM SCHIRM (lod.K5) — Schirm ${z.zeilen} Zeilen ===`);
        console.log(
            `  GESETZ Baum L1/Karte ${nachKomma(g.tree[1], 2)}/${nachKomma(g.tree[2], 2)} Baumhöhen · Haus L1/L2 ${nachKomma(g.haus[1])}/${nachKomma(g.haus[2])} m · ` +
                `Tor ${nachKomma(g.gate[1])}/${nachKomma(g.gate[2])} m · Wagen ${nachKomma(g.vehicle[1])} m · Ausstattung ${nachKomma(g.ausstattung[1])} m · ` +
                `Rand Laub ${nachKomma(z.laub)} m, Bau ${nachKomma(z.bau)} m`
        );
        for (const l of z.laeufe) console.log(`  ${l.name}: loadScale ${l.ls.toFixed(2)} · ${JSON.stringify(l.snap).slice(0, 160)}`);
        console.log(`  Mutante (Regler-Term im Gesetz): ${z.mutanteRot ? "rot" : "GRÜN — blind"} · Wachstum: Laub ${z.wachstum.laub} m an der Kante ${z.wachstum.kante} m (Ring ${z.wachstum.ring})`);
        const v = urteil(z);
        const ls = z.laeufe.map((l) => l.ls);
        console.log(
            `K5#2 ${v.length ? "ROT" : "GRÜN"}: die Abstände gleich bei ${FPS.join("/")} fps und Regler ±10 % (loadScale ${Math.min(...ls).toFixed(2)}–${Math.max(...ls).toFixed(2)}), Mutante ${z.mutanteRot ? "rot" : "grün"}`
        );
        urteilEnde(v.length, () => "\n❌ ROT — " + v.join(" · "), "\n✅ GRÜN — die Stufe folgt dem Schirm: Abstände, Schwellen, Grenzen und Ränder stehen bei jeder Bildrate und jedem Regler, die Mutante fällt rot.");
    } finally {
        await browser.close();
        server.close();
    }
}

if (process.argv.includes("--selftest")) {
    console.log("=== LOD-SCHIRM — Selbsttest (ohne Browser) ===");
    selbsttest();
} else if (process.argv.includes("--fehler")) hauptLauf(() => fehlerAmBau(process.argv.includes("--alle")));
else hauptLauf(welt);
