// zaehl-los.cjs — BAU-ZENSUS Runde 3, ZAHL A (Paarung Haushalt ↔ Los, Hang, Ecke) und ZAHL B (Absteckung des Loses), am HEUTIGEN Kern.
//
// Aufruf:  node zaehl-los.cjs                                   (Kern aus dem Lese-Baum, LESEBAUM=…/n1011-hg)
//          KERN_DIR=…/bau-spike3/kern node zaehl-los.cjs         (byte-gleiche Kopie; SHA-256 beider gedruckt und verglichen)
//          ZAEHL_JSON=pfad.json                                  schreibt die Zeile je Los dorthin
//          LOS_FELD=losBreite                                    (Vorgabe) liest ein KÜNFTIGES Feld des Plans je Los: trägt slot.ov[LOS_FELD]
//                                                                (oder hp[LOS_FELD]) eine Zahl, zählt (B) sie statt der abgeleiteten Los-Breite —
//                                                                ohne Umbau. Ebenso LOS_TIEFE_FELD (Vorgabe losTiefe), ECKE_FELD (ecke), HANG_FELD (hang).
//
// Menge: die 2 595 Haushalts-Lose der 30 Pläne G (Saat 1–30, nH 90): Lose ohne Scheune, ohne SONDERBAU (pool.cjs:94–100,
// dieselbe Menge wie zaehl-hoehe.cjs und zaehl-balken.cjs).
//
// DEFINITIONEN (zensus-los-haushalt.md §b, gewählt wo nicht anders gesagt):
//   Haus-Front W     = hp.W (der Bau-Vektor nach DORF und Rollen-Zeile; FC:2208, 4439, 2227–2228).
//   Hülle-Front      = 2·obb.ex des Slots (die Hülle des Mass-Baus längs der Straße: Haus samt Anbau/Flügel; FC:9776–9794, 5488).
//   Los-Breite       = Hülle-Front + je Seite die halbe Fuge zum Nachbarn derselben Reihe (gleiche Straße, gleiche Seite, parallel),
//                      die Fuge gekappt bei KAPPE_FUGE m (darüber ist es freier Grund, kein Los); ohne Nachbarn 0. Stufe 2 kennt KEIN Los
//                      (dorfLayout setzt die Hülle, FC:5487–5531; `pl.lose` null in den Plänen G) — die Los-Breite ist darum die Hülle
//                      plus ihr Anteil an der Fuge, die der Setzer lässt (FC:5530).
//   Los-Tiefe        = Hülle-Tiefe 2·obb.ez + freier Grund hinter dem Haus bis zum ersten Hindernis (anderes Haus: die Hälfte;
//                      Straße/Gasse, Mauerband, Platz: ganz), gekappt bei KAPPE_TIEFE m; Strahl längs der Haus-Achse.
//   füllt das Los    = Brandwand an beiden Flanken (ov.brandwand x0 und x1, FC:9513–9514) — oder beide Fugen ≤ 0,3 m.
//   Lage             = die Straße vor der Front (der nächste Weg zur Mitte der Frontkante): markt (Frontmitte ≤ 6 m vom Platz-Rechteck),
//                      haupt (gen 0), strasse (gen 1), quer (Quergasse), gasse (Gasse der Dichte), vor (Ausfallstraße/Vorstadt).
//   Eck-Los          = an einer Flanke ohne Brandwand liegt ein ANDERER Weg als die Front-Straße, quer zur Flanke laufend
//                      (|Tangente · Flanken-Normale| < 0,7), Fahrbahnrand ≤ ECKE_M m von der Flanke.
//   Wohl-Stufen      = die Schwellen des Kerns: arm < 0,72 (FC:4447) · mittel < 0,9 · gehoben < 1,1 (FC:4444) · reich ≥ 1,1 (FC:4340).
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { pathToFileURL } = require("url");

const LESEBAUM = process.env.LESEBAUM || "C:/Users/micha/Desktop/AnazhRealm-OMEN/n1011-hg";
const KERN_DIR = process.env.KERN_DIR || null;
const LOS_FELD = process.env.LOS_FELD || "losBreite", LOS_TIEFE_FELD = process.env.LOS_TIEFE_FELD || "losTiefe";
const ECKE_FELD = process.env.ECKE_FELD || "ecke", HANG_FELD = process.env.HANG_FELD || "hang";
const KAPPE_FUGE = 2.0, KAPPE_TIEFE = 80, ECKE_M = 3.5, MARKT_M = 6;
const sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");

async function laden() {
    const fcOrig = path.join(LESEBAUM, "fachwerk-core.js"), fc = KERN_DIR ? path.join(KERN_DIR, "fachwerk-core.js") : fcOrig;
    const three = KERN_DIR ? path.join(KERN_DIR, "three.module.min.js") : path.join(LESEBAUM, "vendor", "three.module.min.js");
    const sO = sha(fcOrig), sK = sha(fc);
    console.log(`Skript ${__filename}\n  SHA-256 ${sha(__filename)}`);
    console.log(`Kern ${fc}\n  SHA-256 ${sK}\n  Original SHA-256 ${sO} → ${sO === sK ? "BYTE-GLEICH" : "VERSCHIEDEN"}`);
    if (sO !== sK) throw new Error("zaehl-los: Kern nicht byte-gleich");
    const w = process.emitWarning; process.emitWarning = () => {};
    const T = await import(pathToFileURL(three).href); process.emitWarning = w;
    T.ColorManagement.enabled = false; global.THREE = { ...T }; require(fc);
    return globalThis.__fachwerkCore;
}

// ── Statistik ──────────────────────────────────────────────────────────────────────────────────
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const vari = (a) => { const m = mean(a); return mean(a.map((x) => (x - m) ** 2)); };
const cov = (a, b) => { const ma = mean(a), mb = mean(b); let s = 0; for (let i = 0; i < a.length; i++) s += (a[i] - ma) * (b[i] - mb); return s / a.length; };
const raenge = (a) => { const o = a.map((v, i) => [v, i]).sort((x, y) => x[0] - y[0]), r = new Array(a.length); for (let i = 0; i < o.length; ) { let j = i; while (j + 1 < o.length && o[j + 1][0] === o[i][0]) j++; const m = (i + j) / 2 + 1; for (let k = i; k <= j; k++) r[o[k][1]] = m; i = j + 1; } return r; };
const pearson = (x, y) => cov(x, y) / Math.sqrt(vari(x) * vari(y));
const spearman = (x, y) => pearson(raenge(x), raenge(y));
const eta2 = (y, g) => { const G = {}; y.forEach((v, i) => (G[g[i]] ||= []).push(v)); const m = mean(y); let b = 0; for (const k in G) b += G[k].length * (mean(G[k]) - m) ** 2; return b / y.length / vari(y); };
const q = (a, p) => { if (!a.length) return NaN; const s = a.slice().sort((x, y) => x - y); const i = (s.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return s[lo] + (s[hi] - s[lo]) * (i - lo); };
const r2 = (v) => (Number.isFinite(v) ? Math.round(v * 100) / 100 : v), r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : v);
const pz = (n, N) => (N ? (100 * n / N).toFixed(1) + " %" : "—");
const Q5 = (a) => [0.1, 0.25, 0.5, 0.75, 0.9].map((p) => r2(q(a, p))).join("/");
const dezil = (x) => { const r = raenge(x); return r.map((v) => Math.min(9, Math.floor((10 * (v - 1)) / x.length))); };
// Cramérs V zweier Merkmale
function cramer(a, b) {
    const A = [...new Set(a)], B = [...new Set(b)], n = a.length, T = A.map(() => B.map(() => 0));
    a.forEach((x, i) => T[A.indexOf(x)][B.indexOf(b[i])]++);
    const ra = T.map((r) => r.reduce((s, v) => s + v, 0)), cb = B.map((_, j) => T.reduce((s, r) => s + r[j], 0));
    let chi = 0; for (let i = 0; i < A.length; i++) for (let j = 0; j < B.length; j++) { const e = (ra[i] * cb[j]) / n; if (e > 0) chi += (T[i][j] - e) ** 2 / e; }
    return Math.sqrt(chi / n / Math.max(1, Math.min(A.length, B.length) - 1));
}
// Kolmogorow-Smirnow D zweier Stichproben
function ksD(a, b) { const A = a.slice().sort((x, y) => x - y), B = b.slice().sort((x, y) => x - y); let i = 0, j = 0, d = 0; while (i < A.length && j < B.length) { const v = Math.min(A[i], B[j]); while (i < A.length && A[i] <= v) i++; while (j < B.length && B[j] <= v) j++; d = Math.max(d, Math.abs(i / A.length - j / B.length)); } return d; }
// Wilson-Intervall 95 %
const wilson = (k, n) => { const z = 1.96, p = k / n, d = 1 + z * z / n, c = (p + z * z / (2 * n)) / d, h = (z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))) / d; return [c - h, c + h]; };

// ── Geometrie ──────────────────────────────────────────────────────────────────────────────────
// der Rahmen eines obb {cx, cz, phi, ex, ez}: welt = mitte + (lx·c + lz·s, −lx·s + lz·c) (FC:5554 `ecke`, obbImLos FC:9715–9720)
const welt = (o, lx, lz) => { const c = Math.cos(o.phi || 0), s = Math.sin(o.phi || 0); return [o.cx + lx * c + lz * s, o.cz - lx * s + lz * c]; };
const lokal = (o, x, z) => { const c = Math.cos(o.phi || 0), s = Math.sin(o.phi || 0), dx = x - o.cx, dz = z - o.cz; return [c * dx - s * dz, s * dx + c * dz]; };
const inObb = (o, x, z, m = 0) => { const [lx, lz] = lokal(o, x, z); return Math.abs(lx) <= o.ex + m && Math.abs(lz) <= o.ez + m; };
// der nächste Punkt eines Wegs: Abstand, Bogenlänge u, Tangente
function naechst(rd, x, z) {
    let bd = Infinity, bu = 0, btx = 1, btz = 0, acc = 0; const P = rd.pts;
    for (let k = 0; k + 1 < P.length; k++) { const A = P[k], B = P[k + 1], dx = B.x - A.x, dz = B.z - A.z, L2 = dx * dx + dz * dz, L = Math.sqrt(L2) || 1e-9;
        let t = L2 > 1e-12 ? ((x - A.x) * dx + (z - A.z) * dz) / L2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t;
        const d = Math.hypot(x - A.x - dx * t, z - A.z - dz * t); if (d < bd) { bd = d; bu = acc + t * L; btx = dx / L; btz = dz / L; } acc += L; }
    return { d: bd, u: bu, tx: btx, tz: btz };
}
// Raster der Wege (Segmente) und der Grundrisse, Zelle 8 m
function raster(roads, obbs) {
    const C = 8, G = new Map(), key = (i, k) => i * 100003 + k;
    const add = (x0, z0, x1, z1, v) => { for (let i = Math.floor(x0 / C); i <= Math.floor(x1 / C); i++) for (let k = Math.floor(z0 / C); k <= Math.floor(z1 / C); k++) { const kk = key(i, k); if (!G.has(kk)) G.set(kk, { s: [], o: [] }); G.get(kk)[v.t].push(v); } };
    roads.forEach((rd, r) => { for (let k = 0; k + 1 < rd.pts.length; k++) { const A = rd.pts[k], B = rd.pts[k + 1], h = (rd.w || 3) / 2 + 1; add(Math.min(A.x, B.x) - h, Math.min(A.z, B.z) - h, Math.max(A.x, B.x) + h, Math.max(A.z, B.z) + h, { t: "s", r, A, B, w: rd.w || 3 }); } });
    obbs.forEach((o, j) => { const R = Math.hypot(o.ex, o.ez); add(o.cx - R, o.cz - R, o.cx + R, o.cz + R, { t: "o", j, o }); });
    return (x, z) => G.get(key(Math.floor(x / C), Math.floor(z / C))) || { s: [], o: [] };
}
const segD = (A, B, x, z) => { const dx = B.x - A.x, dz = B.z - A.z, L2 = dx * dx + dz * dz; let t = L2 > 1e-12 ? ((x - A.x) * dx + (z - A.z) * dz) / L2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t; return Math.hypot(x - A.x - dx * t, z - A.z - dz * t); };

// ── Raster-Probe der Breiten ───────────────────────────────────────────────────────────────────
// Anteil der Breiten b mit |b − k·u| ≤ tol (k ≥ 1) und Zufalls-Erwartung p0 = min(1, 2·tol/u) (Breiten gleich verteilt über
// viele Raster-Schritte); κ = (Anteil − p0)/(1 − p0): 0 = so viel wie der Zufall, 1 = alle am Raster
function rasterAnteil(b, u, tol) { let n = 0; for (const v of b) { const k = Math.max(1, Math.round(v / u)); if (Math.abs(v - k * u) <= tol + 1e-9) n++; } const a = n / b.length, p0 = Math.min(1, (2 * tol) / u); return { a, p0, k: p0 < 1 ? (a - p0) / (1 - p0) : NaN }; }
const FT = 0.3048, RUTE = 5.0292;
// die BELEGTEN Einheiten (zensus-absteckung.md §c): je [Name, Einheit U in m] — das Viertel-Raster ist U/4 (Stell & Tait 2016)
const EINHEITEN = [["Edinburgh 24 ft", 24 * FT], ["Elgin 8,1 m", 8.1], ["Alnwick 28 ft", 28 * FT], ["Canongate 7,7 m", 7.7], ["Riddle's Court 5,5 m", 5.5], ["Linlithgow 5,9 m", 5.9], ["Thame 4 Ruten", 4 * RUTE], ["Freiburg 50 Fuß (0,324)", 50 * 0.324], ["1 Rute 16½ ft", RUTE]];
const BRUECHE = [[1 / 4, "¼"], [1 / 3, "⅓"], [1 / 2, "½"], [2 / 3, "⅔"], [3 / 4, "¾"], [1, "1"], [5 / 4, "1¼"], [4 / 3, "1⅓"], [3 / 2, "1½"], [5 / 3, "1⅔"], [7 / 4, "1¾"], [2, "2"], [9 / 4, "2¼"], [5 / 2, "2½"], [3, "3"]];

(async () => {
    const t0 = Date.now();
    const FC = await laden();
    const SB = require(path.join(__dirname, "..", "spike", "gesetz-proto.cjs")).SONDERBAU; // nur gelesen (pool.cjs:100)
    const L = [];                      // die 2 595 Haushalts-Lose
    const plaene = [];
    let ohneSlot = 0, frontFern = 0, kuenftig = { b: 0, t: 0, e: 0, h: 0 };
    for (let s = 1; s <= 30; s++) {
        const pl = FC.DORF({ seed: s, nH: 90 });
        const ex = FC.exportSettlement({ seed: s, nH: 90 });
        const roads = ex.roads, slots = ex.slots, Rw = ex.mauer && ex.mauer.R ? ex.mauer.R : 0, P = ex.platz;
        const slotVon = new Map(); slots.forEach((sl, k) => slotVon.set(sl.seed + "|" + sl.rolle, k));
        const nichtScheune = pl.houses.filter((h) => h.rolle !== "burg" && h.rolle !== "scheune").length;
        // je Slot: Front-Straße, Seite, Bogenlänge (alle Slots — die Nachbarn der Reihe sind auch Sonderbauten)
        const S = slots.map((sl, k) => {
            const o = sl.obb, fm = welt(o, 0, -o.ez); let best = null;
            roads.forEach((rd, r) => { const N = naechst(rd, fm[0], fm[1]), rand = N.d - (rd.w || 3) / 2; if (!best || rand < best.rand) best = Object.assign({ r, rand }, N); });
            const zx = Math.sin(o.phi || 0), zz = Math.cos(o.phi || 0); // die lokale z-Achse in der Welt (vom Weg fort, FC:5495–5497)
            const seite = Math.sign(best.tx * zz - best.tz * zx) || 1;
            return { k, sl, o, fm, front: best, seite, bw: (sl.ov && sl.ov.brandwand) || {} };
        });
        // die NACHBARN IN DER FLUCHT: je Flanke der nächste parallele Grundriss (|Δphi| ≤ 0,26 wie brandwand FC:9509), dessen Mitte
        // in der Tiefe höchstens 0,45 · (D_i + D_j) versetzt liegt (wie reihenSnap FC:9003), Kante zu Kante in x des Hauses; die
        // BLOCKFRONT ist die Kette der Lose, die über Fugen ≤ KAPPE_FUGE verbunden sind (eine geschlossene oder fast geschlossene Reihe)
        const H0 = S.filter((a) => a.sl.rolle !== "scheune");
        for (const a of H0) { a.fugeL = null; a.fugeR = null; a.nbL = null; a.nbR = null;
            const c = Math.cos(a.o.phi || 0), sn = Math.sin(a.o.phi || 0);
            for (const b of H0) { if (b === a) continue; let dp = Math.abs((a.o.phi || 0) - (b.o.phi || 0)) % Math.PI; if (dp > Math.PI / 2) dp = Math.PI - dp; if (dp > 0.26) continue;
                const dx = b.o.cx - a.o.cx, dz = b.o.cz - a.o.cz, lx = c * dx - sn * dz, lz = sn * dx + c * dz;
                if (Math.abs(lz) > 0.45 * (a.o.ez + b.o.ez)) continue; const f = Math.abs(lx) - a.o.ex - b.o.ex; if (f < -0.5) continue;
                if (lx < 0) { if (a.fugeL == null || f < a.fugeL) { a.fugeL = f; a.nbL = b; } } else if (a.fugeR == null || f < a.fugeR) { a.fugeR = f; a.nbR = b; } }
            a.fugeL = a.fugeL == null ? null : Math.max(0, a.fugeL); a.fugeR = a.fugeR == null ? null : Math.max(0, a.fugeR); }
        { let id = 0; const kom = new Map(); for (const a of H0) { if (kom.has(a)) continue; const st = [a]; kom.set(a, id); const glied = [];
            while (st.length) { const x = st.pop(); glied.push(x); for (const [nb, f] of [[x.nbL, x.fugeL], [x.nbR, x.fugeR]]) if (nb && f <= KAPPE_FUGE && !kom.has(nb)) { kom.set(nb, id); st.push(nb); } }
            for (const g of glied) { g.reihe = "F" + id; g.reiheN = glied.length; } id++; } }
        // das Raster der Hindernisse für die Tiefe und die Ecke
        const obbs = S.map((a) => a.o), RA = raster(roads, obbs);
        const platzO = P ? { cx: P.cx, cz: P.cz, phi: P.phi || 0, ex: P.ex, ez: P.ez } : null;
        const hinderAm = (x, z, selbst, eigeneScheunen) => {
            const c = RA(x, z);
            for (const sg of c.s) if (segD(sg.A, sg.B, x, z) < sg.w / 2) return "weg";
            for (const ob of c.o) if (ob.j !== selbst && !eigeneScheunen.has(ob.j) && inObb(ob.o, x, z)) return "haus";
            if (platzO && inObb(platzO, x, z)) return "platz";
            if (Rw) { const r = Math.hypot(x, z); if (Math.abs(r - Rw) < 2.0) return "mauer"; }
            return null;
        };
        plaene.push({ s, region: pl.region, jahr: pl.jahr, Rw, nSlots: slots.length });
        let i = 0;
        pl.houses.forEach((hp, a) => {
            const losI = hp.rolle === "scheune" ? null : i++;
            if (losI == null || SB.has(hp.rolle)) return;
            const k = slotVon.get(hp.seed + "|" + hp.rolle);
            const t = losI / Math.max(1, nichtScheune - 1);
            const z = { adr: "G" + s + "#" + a, plan: "G" + s, region: pl.region, rolle: hp.rolle, viertel: hp.viertel || null, kultur: hp.kultur, wohl: hp.wohl, t, losI,
                W: hp.W, D: hp.D, st: hp.storeys, annexN: hp.annexN, grundriss: hp.grundriss || "I", keller: hp.keller, baujahr: hp.baujahr, seed: hp.seed, hp };
            if (k == null) { ohneSlot++; z.slot = null; L.push(z); return; }
            const A = S[k], o = A.o, rd = roads[A.front.r];
            if (A.front.rand > 3.5) frontFern++;
            // Lage
            const fm = A.fm; let lage;
            const dPlatz = platzO ? (() => { const [lx, lz] = lokal(platzO, fm[0], fm[1]); return Math.hypot(Math.max(0, Math.abs(lx) - platzO.ex), Math.max(0, Math.abs(lz) - platzO.ez)); })() : Infinity;
            // der Export trägt `gasse` nicht (nur pts, w, gen, len, quer, vor, treppe): die Gasse der Dichte ist der Weg mit w = STADT_DICHTE.gasseM 2,8 (FC:5353, 5467, 5477)
            const istGasse = (r) => !!r.quer && Math.abs((r.w || 0) - 2.8) < 1e-6;
            if (dPlatz <= MARKT_M) lage = "markt"; else if (rd.vor) lage = "vor"; else if (istGasse(rd)) lage = "gasse"; else if (rd.quer) lage = "quer"; else if (rd.gen === 0) lage = "haupt"; else lage = "strasse";
            // Los-Breite
            const fL = A.fugeL, fR = A.fugeR, kap = (f) => (f == null ? 0 : Math.max(0, Math.min(KAPPE_FUGE, f)));
            const huelle = 2 * o.ex, losB = huelle + kap(fL) / 2 + kap(fR) / 2;
            const fuellt = (A.bw.x0 && A.bw.x1) || (fL != null && fR != null && fL <= 0.3 && fR <= 0.3);
            // Los-Tiefe: Strahl längs der Haus-Achse hinter der Rückwand, drei Spuren (lx = 0, ±0,6·ex), das Minimum
            const eigene = new Set(S.filter((b) => b.sl.rolle === "scheune" && b.sl.ov && b.sl.ov.parent === a).map((b) => b.k));
            let frei = KAPPE_TIEFE, grund = "kappe";
            for (const lx of [0, -0.6 * o.ex, 0.6 * o.ex]) for (let d = 0.25; d < frei; d += 0.25) { const [x, zz] = welt(o, lx, o.ez + d), h = hinderAm(x, zz, k, eigene); if (h) { const f = h === "haus" ? d / 2 : d; if (f < frei) { frei = f; grund = h; } break; } }
            const losT = 2 * o.ez + frei;
            // Ecke: je Flanke ohne Brandwand ein anderer Weg quer zur Flanke, Fahrbahnrand ≤ ECKE_M
            let ecke = 0, eckeSeiten = [], rueck = 0;
            const xd = [Math.cos(o.phi || 0), -Math.sin(o.phi || 0)]; // lokale x-Achse in der Welt
            for (const sg of [-1, 1]) { if (A.bw[sg < 0 ? "x0" : "x1"]) continue;
                let treffer = null;
                for (let lz = -o.ez; lz <= o.ez + 1e-6; lz += 0.5) { const [x, zz] = welt(o, sg * o.ex, lz);
                    roads.forEach((r2_, r) => { if (r === A.front.r) return; const N = naechst(r2_, x, zz), d = N.d - (r2_.w || 3) / 2; if (d <= ECKE_M && Math.abs(N.tx * xd[0] + N.tz * xd[1]) < 0.7 && (!treffer || d < treffer.d)) treffer = { r, d, gen: r2_.gen, gasse: istGasse(r2_), quer: !!r2_.quer, vor: !!r2_.vor }; }); }
                if (treffer) { ecke++; eckeSeiten.push(treffer); } }
            { const [x, zz] = welt(o, 0, o.ez + 0.5); roads.forEach((r2_, r) => { if (r === A.front.r) return; const N = naechst(r2_, x, zz); if (N.d - (r2_.w || 3) / 2 <= ECKE_M) rueck = 1; }); }
            // künftige Felder (ohne Umbau): wo der Plan sie trägt, gelten sie
            const ov = A.sl.ov || {};
            const fB = Number.isFinite(ov[LOS_FELD]) ? ov[LOS_FELD] : Number.isFinite(hp[LOS_FELD]) ? hp[LOS_FELD] : null; if (fB != null) kuenftig.b++;
            const fT = Number.isFinite(ov[LOS_TIEFE_FELD]) ? ov[LOS_TIEFE_FELD] : Number.isFinite(hp[LOS_TIEFE_FELD]) ? hp[LOS_TIEFE_FELD] : null; if (fT != null) kuenftig.t++;
            const fE = ov[ECKE_FELD] != null ? !!ov[ECKE_FELD] : hp[ECKE_FELD] != null ? !!hp[ECKE_FELD] : null; if (fE != null) kuenftig.e++;
            const fH = A.sl[HANG_FELD] != null ? A.sl[HANG_FELD] : null; if (fH != null) kuenftig.h++;
            Object.assign(z, { slot: k, lage, dMarkt: platzO ? Math.hypot(o.cx - platzO.cx, o.cz - platzO.cz) : NaN, rRel: Rw ? Math.hypot(o.cx, o.cz) / Rw : NaN,
                frontGen: rd.gen, frontW: rd.w, frontRand: A.front.rand, reihe: "G" + s + ":" + A.reihe, reiheN: A.reiheN, fugeL: fL, fugeR: fR,
                huelle: fB != null ? huelle : huelle, losB: fB != null ? fB : losB, losBabgeleitet: losB, huelleT: 2 * o.ez, losT: fT != null ? fT : losT, tiefGrund: grund,
                fuellt: !!fuellt, bw: (A.bw.x0 ? 1 : 0) + (A.bw.x1 ? 1 : 0), ecke: fE != null ? (fE ? 1 : 0) : ecke ? 1 : 0, eckeSeiten, rueck, hang: fH,
                ovW: ov.W, ovD: ov.D, ovSt: ov.storeys });
            L.push(z);
        });
    }
    if (L.length !== 2595) throw new Error("Lose " + L.length + " ≠ 2 595");
    const M = L.filter((z) => z.slot != null);
    const wohlStufe = (w) => (w < 0.72 ? "1 arm" : w < 0.9 ? "2 mittel" : w < 1.1 ? "3 gehoben" : "4 reich");
    for (const z of L) z.stufe = wohlStufe(z.wohl);
    console.log(`\nLose ${L.length} · mit Slot im Export ${M.length} (ohne Lage ${ohneSlot}) · Front-Straße weiter als 3,5 m vom Fahrbahnrand: ${frontFern}`);
    console.log(`Gebaut = Plan: ov.W = hp.W an ${M.filter((z) => z.ovW === z.W).length}/${M.length}, ov.D = hp.D an ${M.filter((z) => z.ovD === z.D).length}, ov.storeys an ${M.filter((z) => z.ovSt === z.st).length}`);
    console.log(`Künftige Felder im Plan: ${LOS_FELD} ${kuenftig.b} · ${LOS_TIEFE_FELD} ${kuenftig.t} · ${ECKE_FELD} ${kuenftig.e} · slot.${HANG_FELD} ${kuenftig.h} (je von ${M.length}; 0 = heute nicht im Plan, abgeleitet gezählt)`);

    // ═════ ZAHL A ═════
    console.log(`\n══ ZAHL A — PAARUNG HAUSHALT ↔ LOS`);
    const B = (f) => M.map(f);
    console.log(`Haus-Front W        Q10/25/50/75/90 ${Q5(B((z) => z.W))} · min ${Math.min(...B((z) => z.W))} · max ${Math.max(...B((z) => z.W))} · Stufen ${new Set(B((z) => z.W)).size}`);
    console.log(`Hülle-Front 2·ex    Q ${Q5(B((z) => z.huelle))}`);
    console.log(`Los-Breite          Q ${Q5(B((z) => z.losB))} · Stufen (0,1 m) ${new Set(B((z) => Math.round(z.losB * 10))).size}`);
    console.log(`Haus-Tiefe D        Q ${Q5(B((z) => z.D))} · Hülle-Tiefe Q ${Q5(B((z) => z.huelleT))}`);
    console.log(`Los-Tiefe           Q ${Q5(B((z) => z.losT))} · Grund des Endes: ${["weg", "haus", "platz", "mauer", "kappe"].map((g) => g + " " + M.filter((z) => z.tiefGrund === g).length).join(" · ")}`);
    console.log(`Los-Fläche (B·T)    Q ${Q5(B((z) => z.losB * z.losT))} m²`);
    const fu = M.filter((z) => z.fuellt).length, bw2 = M.filter((z) => z.bw === 2).length;
    console.log(`Haus füllt die Los-Breite (Brandwand beidseits oder beide Fugen ≤ 0,3 m): ${fu}/${M.length} = ${pz(fu, M.length)} · davon Brandwand beidseits ${bw2} · eine Seite ${M.filter((z) => z.bw === 1).length} · keine ${M.filter((z) => z.bw === 0).length}`);
    console.log(`  W / Los-Breite: Q ${Q5(B((z) => z.W / z.losB))} · Hülle / Los-Breite Q ${Q5(B((z) => z.huelle / z.losB))}`);
    const fugen = M.flatMap((z) => [z.fugeL, z.fugeR]).filter((f) => f != null);
    console.log(`  Fugen der Reihe (alle Nachbarpaare, doppelt): n ${fugen.length} · Q ${Q5(fugen)} · ≤ 0,3 m ${pz(fugen.filter((f) => f <= 0.3).length, fugen.length)} · > ${KAPPE_FUGE} m ${pz(fugen.filter((f) => f > KAPPE_FUGE).length, fugen.length)} · Lose am Reihen-Ende ${M.filter((z) => z.fugeL == null || z.fugeR == null).length}`);
    // je Rolle und je Wohl-Stufe
    const gruppe = (key, f) => { const G = {}; for (const z of M) (G[key(z)] ||= []).push(z); return Object.entries(G).sort((a, b) => b[1].length - a[1].length).map(([k, v]) => `    ${String(k).padEnd(14)} n ${String(v.length).padStart(4)} · W Ø ${r2(mean(v.map((z) => z.W)))} Q25/50/75 ${[0.25, 0.5, 0.75].map((p) => r2(q(v.map((z) => z.W), p))).join("/")} · Los-B Ø ${r2(mean(v.map((z) => z.losB)))} Q25/50/75 ${[0.25, 0.5, 0.75].map((p) => r2(q(v.map((z) => z.losB), p))).join("/")} · Los-T Q50 ${r2(q(v.map((z) => z.losT), 0.5))} · wohl Ø ${r2(mean(v.map((z) => z.wohl)))}${f ? f(v) : ""}`).join("\n"); };
    console.log(`  je Rolle:\n${gruppe((z) => z.rolle)}`);
    console.log(`  je Wohl-Stufe (FC:4447/4444/4340):\n${gruppe((z) => z.stufe, (v) => " · Rollen " + Object.entries(v.reduce((a, z) => ((a[z.rolle] = (a[z.rolle] || 0) + 1), a), {})).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, n]) => k + " " + n).join(", "))}`);
    console.log(`  je Lage:\n${gruppe((z) => z.lage, (v) => " · Rollen " + Object.entries(v.reduce((a, z) => ((a[z.rolle] = (a[z.rolle] || 0) + 1), a), {})).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, n]) => k + " " + n).join(", "))}`);
    // Rang-Korrelationen
    const WH = M.filter((z) => z.rolle === "wohnhaus");
    const sp = (S, f, g) => r3(spearman(S.map(f), S.map(g)));
    const jePlan = (f, g) => { const r = []; for (const p of plaene) { const H = M.filter((z) => z.plan === "G" + p.s); r.push(spearman(H.map(f), H.map(g))); } return r3(q(r.filter(Number.isFinite), 0.5)); };
    console.log(`  Spearman ρ (alle ${M.length} · Median je Plan · nur Wohnhäuser ${WH.length}):`);
    for (const [n, f, g] of [["wohl ↔ Haus-Front W", (z) => z.wohl, (z) => z.W], ["wohl ↔ Los-Breite", (z) => z.wohl, (z) => z.losB], ["wohl ↔ Los-Fläche", (z) => z.wohl, (z) => z.losB * z.losT], ["wohl ↔ Haus-Fläche W·D", (z) => z.wohl, (z) => z.W * z.D], ["wohl ↔ Los-Tiefe", (z) => z.wohl, (z) => z.losT], ["Rang t ↔ Los-Breite", (z) => z.t, (z) => z.losB], ["wohl ↔ Abstand Markt", (z) => z.wohl, (z) => z.dMarkt], ["Los-Breite ↔ Abstand Markt", (z) => z.losB, (z) => z.dMarkt]])
        console.log(`    ${n.padEnd(28)} ${String(sp(M, f, g)).padStart(7)} · ${String(jePlan(f, g)).padStart(7)} · ${String(sp(WH, f, g)).padStart(7)}`);
    console.log(`  Rolle ↔ Lage: Cramérs V ${r3(cramer(M.map((z) => z.rolle), M.map((z) => z.lage)))} · η²(Abstand Markt | Rolle) ${r3(eta2(M.map((z) => z.dMarkt), M.map((z) => z.rolle)))} · η²(r/Rw | Rolle) ${r3(eta2(M.map((z) => z.rRel), M.map((z) => z.rolle)))}`);
    const tafelRL = {}; for (const z of M) { (tafelRL[z.rolle] ||= {}); tafelRL[z.rolle][z.lage] = (tafelRL[z.rolle][z.lage] || 0) + 1; }
    const LAGEN = ["markt", "haupt", "strasse", "quer", "gasse", "vor"];
    console.log(`  Tafel Rolle × Lage (${LAGEN.join(" / ")}) · Abstand Markt Q50 · r/Rw Q50:`);
    for (const [ro, v] of Object.entries(tafelRL).sort((a, b) => Object.values(b[1]).reduce((s, x) => s + x, 0) - Object.values(a[1]).reduce((s, x) => s + x, 0))) { const H = M.filter((z) => z.rolle === ro); console.log(`    ${ro.padEnd(14)} ${LAGEN.map((l) => String(v[l] || 0).padStart(5)).join(" ")} · ${r2(q(H.map((z) => z.dMarkt), 0.5))} m · ${r2(q(H.map((z) => z.rRel), 0.5))}`); }
    // Lose unter 6,5 m
    for (const [n, f] of [["Haus-Front W", (z) => z.W], ["Hülle-Front", (z) => z.huelle], ["Los-Breite", (z) => z.losB]]) {
        const U = M.filter((z) => f(z) < 6.5), U5 = M.filter((z) => f(z) < 5);
        const ro = Object.entries(U.reduce((a, z) => ((a[z.rolle] = (a[z.rolle] || 0) + 1), a), {})).sort((a, b) => b[1] - a[1]).map(([k, c]) => k + " " + c).join(", ");
        const stv = Object.entries(U.reduce((a, z) => ((a[z.stufe] = (a[z.stufe] || 0) + 1), a), {})).sort().map(([k, c]) => k + " " + c).join(", ");
        console.log(`  ${n} < 6,5 m: ${U.length}/${M.length} = ${pz(U.length, M.length)} (< 5 m: ${U5.length}) · Rollen: ${ro || "—"} · Wohl-Stufen: ${stv || "—"} · wohl Q50 ${r2(q(U.map((z) => z.wohl), 0.5))} · Geschosse Ø ${r2(U.length ? mean(U.map((z) => z.st)) : NaN)}`);
    }
    // ECKE
    const E = M.filter((z) => z.ecke), N0 = M.filter((z) => !z.ecke);
    const eckD = E.map((z) => Math.min(...z.eckeSeiten.map((s) => s.d)));
    console.log(`\n  ECKE: Eck-Lose ${E.length}/${M.length} = ${pz(E.length, M.length)} · beide Flanken ${M.filter((z) => z.eckeSeiten.length === 2).length} · Rück-Front an einem zweiten Weg ${M.filter((z) => z.rueck).length}`);
    console.log(`    Seiten-Weg: Gasse der Dichte (w 2,8) ${E.filter((z) => z.eckeSeiten.some((s) => s.gasse)).length} · Quergasse ${E.filter((z) => z.eckeSeiten.some((s) => s.quer && !s.gasse)).length} · gen 0 ${E.filter((z) => z.eckeSeiten.some((s) => s.gen === 0)).length} · gen 1 ${E.filter((z) => z.eckeSeiten.some((s) => s.gen === 1)).length} · vor ${E.filter((z) => z.eckeSeiten.some((s) => s.vor)).length}`);
    console.log(`    Abstand Flanke → Fahrbahnrand des Seiten-Wegs Q10/25/50/75/90 ${Q5(eckD)} m · streng (≤ 1,5 m) ${eckD.filter((d) => d <= 1.5).length} = ${pz(eckD.filter((d) => d <= 1.5).length, M.length)} der Lose · ≤ 0,5 m ${eckD.filter((d) => d <= 0.5).length}`);
    console.log(`    Lage der Eck-Lose: ${Object.entries(E.reduce((a, z) => ((a[z.lage] = (a[z.lage] || 0) + 1), a), {})).map(([k, c]) => k + " " + c).join(" · ")} · Blockfront-Länge der Eck-Lose Q50 ${q(E.map((z) => z.reiheN), 0.5)} · der übrigen ${q(N0.map((z) => z.reiheN), 0.5)}`);
    const vgl = (n, f) => `    ${n.padEnd(18)} Ecke Ø ${r2(mean(E.map(f)))} Q50 ${r2(q(E.map(f), 0.5))} · sonst Ø ${r2(mean(N0.map(f)))} Q50 ${r2(q(N0.map(f), 0.5))} · KS-D ${r3(ksD(E.map(f), N0.map(f)))}`;
    for (const [n, f] of [["Haus-Front W", (z) => z.W], ["Haus-Tiefe D", (z) => z.D], ["Geschosse", (z) => z.st], ["wohl", (z) => z.wohl], ["Hülle-Front", (z) => z.huelle], ["Los-Breite", (z) => z.losB], ["Anbau annexN", (z) => z.annexN], ["Keller", (z) => z.keller], ["Grundriss L", (z) => (z.grundriss === "L" ? 1 : 0)]]) console.log(vgl(n, f));
    console.log(`    Rollen am Eck: ${Object.entries(E.reduce((a, z) => ((a[z.rolle] = (a[z.rolle] || 0) + 1), a), {})).sort((a, b) => b[1] - a[1]).map(([k, c]) => k + " " + c + " (" + pz(c, M.filter((y) => y.rolle === k).length) + " der Rolle)").join(", ")}`);
    // Selbsttest des Eck-Lesers: das Haus an EINER Straße ohne Seitenweg ist kein Eck, an einer Kreuzung ist es eins
    {
        const rdA = { pts: [{ x: -50, z: 0 }, { x: 50, z: 0 }], w: 5, gen: 0 }, rdB = { pts: [{ x: 10, z: -50 }, { x: 10, z: 50 }], w: 4, gen: 1 };
        const o = { cx: 4, cz: 2.5 + 0.6 + 4, phi: 0, ex: 4, ez: 4 }; // Flanke x1 bei x = 8, Seitenweg-Rand bei x = 8 → Abstand 0
        const prob = (roads) => { const xd = [1, 0]; for (const sg of [-1, 1]) for (let lz = -o.ez; lz <= o.ez; lz += 0.5) { const [x, zz] = welt(o, sg * o.ex, lz); for (let r = 1; r < roads.length; r++) { const N = naechst(roads[r], x, zz); if (N.d - roads[r].w / 2 <= ECKE_M && Math.abs(N.tx * xd[0] + N.tz * xd[1]) < 0.7) return 1; } } return 0; };
        const ok = prob([rdA]) === 0 && prob([rdA, rdB]) === 1 && rasterAnteil([7.32, 14.64, 9.15], 7.32 / 4, 0.01).a === 1;
        console.log(`  Selbsttest Eck-Leser/Raster: ${ok ? "GRÜN" : "ROT"}`); if (!ok) process.exit(2);
    }
    // HANG
    console.log(`\n  HANG: slot.${HANG_FELD} im Export ${kuenftig.h}/${M.length} — exportSettlement rechnet ohne dp.hoehe auf ebenem Grund (FC:9795–9797);`);
    console.log(`        die Klasse plattform/hanghaus/stelzen schreibt erst ortPlan im Faden der Welt (FC:11110–11112, 11177). Kein Zähler hier.`);
    // Paarung: wann entsteht was — Rang des Index gegen die Größen
    console.log(`\n  REIHENFOLGE (Rang des Los-Index t gegen die Folge): ρ(t, wohl) ${sp(M, (z) => z.t, (z) => z.wohl)} · ρ(t, W) ${sp(M, (z) => z.t, (z) => z.W)} · ρ(t, Abstand Markt) ${sp(M, (z) => z.t, (z) => z.dMarkt)} · ρ(t, r/Rw) ${sp(M, (z) => z.t, (z) => z.rRel)} · ρ(t, Los-T) ${sp(M, (z) => z.t, (z) => z.losT)}`);
    console.log(`  Bewohner = leuteVon(ov) (FC:9527–9538) aus W·D·st·wohl: ρ(leute, Los-Breite) ${sp(M, (z) => FC.leuteVon(z.hp), (z) => z.losB)} · Köpfe Q10/50/90 ${[0.1, 0.5, 0.9].map((p) => q(M.map((z) => FC.leuteVon(z.hp)), p)).join("/")}`);

    // ═════ ZAHL B ═════
    console.log(`\n══ ZAHL B — DIE ABSTECKUNG DES LOSES`);
    const hist = (a, bin) => { const H = {}; for (const v of a) { const k = Math.floor(v / bin + 1e-9) * bin; H[k] = (H[k] || 0) + 1; } return Object.keys(H).map(Number).sort((x, y) => x - y).map((k) => `${r2(k)}:${H[k]}`).join(" "); };
    console.log(`  Histogramm Haus-Front W (0,5 m): ${hist(B((z) => z.W), 0.5)}`);
    console.log(`  Histogramm Los-Breite (0,5 m):   ${hist(B((z) => z.losB), 0.5)}`);
    console.log(`  W auf dem ½-m-Raster (|W − k·0,5| ≤ 1 mm): ${M.filter((z) => Math.abs(z.W * 2 - Math.round(z.W * 2)) < 0.002).length}/${M.length} · Hülle ${M.filter((z) => Math.abs(z.huelle * 2 - Math.round(z.huelle * 2)) < 0.002).length} · Los-Breite ${M.filter((z) => Math.abs(z.losB * 2 - Math.round(z.losB * 2)) < 0.002).length}`);
    // welche Einheit erklärt am meisten (κ über dem Zufall), Toleranz 0,5 m (Stell & Tait) und 0,1 m
    for (const tol of [0.5, 0.1]) for (const [n, f] of [["W", (z) => z.W], ["Los-Breite", (z) => z.losB]]) {
        const b = B(f), R = [];
        for (let u = Math.max(2 * tol + 0.05, 0.5); u <= 6.0001; u += 0.05) R.push([r2(u), rasterAnteil(b, u, tol)]);
        R.sort((x, y) => y[1].k - x[1].k);
        console.log(`  Raster ±${tol} m, ${n}: beste Einheiten (u · Anteil · Zufall p0 · κ): ${R.slice(0, 5).map(([u, r]) => `${u} · ${pz(r.a * 1e3, 1e3)} · ${r2(r.p0)} · ${r3(r.k)}`).join(" | ")}`);
        console.log(`    belegte Viertel-Raster U/4 und Ruten: ${EINHEITEN.map(([nm, U]) => { const st = nm.startsWith("1 Rute") ? U : U / 4; const r = rasterAnteil(b, st, tol); return `${nm} (Schritt ${r2(st)}) ${pz(r.a * 1e3, 1e3)} κ ${r3(r.k)}`; }).join(" | ")}`);
    }
    // Teilungs-Stufen gegen die belegten Einheiten: nächster Bruch, ± 0,5 m
    for (const [nm, U] of [EINHEITEN[0], EINHEITEN[1], EINHEITEN[7]]) for (const [n, f] of [["W", (z) => z.W], ["Los-Breite", (z) => z.losB]]) {
        const C = {}; let aus = 0; for (const z of M) { const v = f(z); let best = null; for (const [fr, lab] of BRUECHE) { const d = Math.abs(v - fr * U); if (!best || d < best.d) best = { d, lab }; } if (best.d <= 0.5) C[best.lab] = (C[best.lab] || 0) + 1; else aus++; }
        console.log(`  Teilung von ${nm} (U ${r2(U)} m), ${n}: ${BRUECHE.map(([, l]) => l).filter((l) => C[l]).map((l) => `${l} ${C[l]}`).join(" · ")} · keinem Bruch ± 0,5 m ${aus} (${pz(aus, M.length)})`);
    }
    // Streuung innerhalb einer Blockfront (Reihe) gegen zwischen den Reihen
    for (const [n, f] of [["W", (z) => z.W], ["Los-Breite", (z) => z.losB]]) {
        const G = {}; for (const z of M) (G[z.reihe] ||= []).push(f(z));
        const R3 = Object.values(G).filter((v) => v.length >= 3), alle = R3.flat(), V = vari(alle);
        const inner = R3.reduce((s, v) => s + v.length * vari(v), 0) / alle.length;
        const P = {}; for (const z of M) (P[z.plan] ||= []).push(f(z)); const innerPlan = Object.values(P).reduce((s, v) => s + v.length * vari(v), 0) / M.length;
        console.log(`  Streuung ${n}: Reihen mit ≥ 3 Losen ${R3.length} (Lose ${alle.length}, Lose je Reihe Q50 ${q(R3.map((v) => v.length), 0.5)}) · Var gesamt ${r3(V)} m² · innerhalb der Reihe ${r3(inner)} (${pz(inner * 1e3, V * 1e3)}) · zwischen ${pz((V - inner) * 1e3, V * 1e3)} · innerhalb des Plans ${r3(innerPlan)} m² (${pz(innerPlan * 1e3, vari(M.map(f)) * 1e3)} der Gesamt-Var ${r3(vari(M.map(f)))})`);
    }

    // DER WÜRFEL-ANTEIL DER BREITE (die 58 % der Runde 2 nachgezählt): Nachbau der Kette W0 Tafel → W1 Jitter → W2 Wohl → W3 Rolle
    const poolVon = (region, by) => { const H = FC.REGION_HIST[region]; let P = H[0][1], era = 0; H.forEach((e, k) => { if (by >= e[0]) { P = e[1]; era = k; } }); return { P, era }; };
    const massRolle = (rolle, hp0) => { const N = FC.BAU_NUTZUNG[rolle], h = Object.assign({}, hp0); if (N && N.mass) for (const o of N.mass) { if (o[0] !== "W" && o[0] !== "D") continue; if (o[3]) continue; const f = o[0], v = o[2]; h[f] = o[1] === "setze" ? v : o[1] === "plus" ? h[f] + v : o[1] === "mindestens" ? Math.max(h[f], v) : Math.min(h[f], v); } return h; };
    const klemmW = (W, w) => Math.max(5, Math.min(15, Math.round(W * (0.84 + 0.30 * w) * 2) / 2)); // FC:4439
    let treffer = 0, wegKultur = 0; const KET = [];
    for (const z of L) {
        const K = FC.KULTUR[z.kultur], { P: pool, era } = poolVon(z.region, z.baujahr), imPool = pool.includes(z.kultur);
        const r1 = FC.bauRezept({ bauweise: z.kultur }, null, z.seed), W0 = K.W, W1 = r1.W;
        // wohl unrund nachrechnen: w ∈ [wohl − 0,005, wohl + 0,005] — die Breite nimmt die unrunde Zahl (FC:4438–4439)
        let W2 = klemmW(W1, z.wohl), weg = "kette";
        let W3 = massRolle(z.rolle, { W: W2, D: z.D }).W;
        if (W3 !== z.W) { for (const dw of [-0.005, 0.005, -0.0025, 0.0025]) { const a = massRolle(z.rolle, { W: klemmW(W1, z.wohl + dw), D: z.D }).W; if (a === z.W) { W2 = klemmW(W1, z.wohl + dw); W3 = a; break; } } }
        if (W3 !== z.W) { const a = massRolle(z.rolle, { W: W1, D: z.D }).W; if (a === z.W) { W2 = W1; W3 = a; weg = "neu-gewürfelt (Kultur der Zeile, FC:4381)"; wegKultur++; } }
        if (W3 === z.W) treffer++;
        // kontrafaktisch: ohne Jitter (Kultur-W auf ½ m geklemmt wie FC:2208 mit rnd = ½) · ohne Kultur-Würfel (pool[0]) · ohne Wohl-Würfel (u = ½)
        const t = z.t, w0 = (1.22 - 0.5 * t) * (0.78 + 0.44 * 0.5);
        const jit0 = (k) => Math.max(5, Math.min(15, Math.round(FC.KULTUR[k].W * 2) / 2));
        const kc = imPool ? pool[0] : z.kultur;
        const nachKette = (Wx, w) => (weg === "kette" ? massRolle(z.rolle, { W: klemmW(Wx, w), D: z.D }).W : massRolle(z.rolle, { W: Wx, D: z.D }).W);
        KET.push({ z, W0, W1, W2, W3, imPool, poolKey: z.region + "/" + era, poolM: mean(pool.map((k) => FC.KULTUR[k].W)),
            cfJit: nachKette(jit0(z.kultur), z.wohl), cfJitKult: nachKette(jit0(kc), z.wohl), cfAlle: nachKette(jit0(kc), w0), cfNurWohl: nachKette(W1, w0) });
    }
    console.log(`\n  NACHBAU der Breiten-Kette W0 KULTUR.W (FC:2121–2153) → W1 Jitter (FC:2208) → W2 × (0,84 + 0,30·wohl) (FC:4439) → W3 Rollen-Zeile (FC:2184–2200): ${treffer}/${L.length} = hp.W (davon über die neu gewürfelte Kultur der Zeile ${wegKultur})`);
    const imPlan = (arr, f) => { const P = {}; arr.forEach((k) => (P[k.z.plan] ||= []).push(f(k))); const V = Object.values(P); return V.reduce((s, v) => s + v.length * vari(v), 0) / arr.length; };
    for (const [n, S] of [["alle Haushalts-Lose", KET.filter((k) => k.W3 === k.z.W)], ["nur Wohnhäuser", KET.filter((k) => k.W3 === k.z.W && k.z.rolle === "wohnhaus")]]) {
        const v0 = imPlan(S, (k) => k.z.W), vJ = imPlan(S, (k) => k.cfJit), vJK = imPlan(S, (k) => k.cfJitKult), vA = imPlan(S, (k) => k.cfAlle), vW = imPlan(S, (k) => k.cfNurWohl);
        console.log(`  ${n} (${S.length}), Var(W) IN DERSELBEN STADT (gewichtetes Mittel der 30 Pläne): heute ${r3(v0)} m² · ohne Jitter ${r3(vJ)} · ohne Jitter + Kultur-Würfel ${r3(vJK)} (Würfel-Anteil ${pz((v0 - vJK) * 1e3, v0 * 1e3)}) · dazu ohne Wohl-Würfel ${r3(vA)} (${pz((v0 - vA) * 1e3, v0 * 1e3)}) · nur ohne Wohl-Würfel ${r3(vW)} (${pz((v0 - vW) * 1e3, v0 * 1e3)})`);
        const vAll = vari(S.map((k) => k.z.W)), vAllK = vari(S.map((k) => k.cfJitKult));
        console.log(`    über alle Städte: Var(W) heute ${r3(vAll)} · ohne Jitter + Kultur-Würfel ${r3(vAllK)}`);
        // exakte Zerlegung je Plan zentriert: W3 = Pool-Mittel + (W0 − Pool-Mittel) + (W1 − W0) + (W2 − W1) + (W3 − W2)
        const zent = (f) => { const P = {}; S.forEach((k) => (P[k.z.plan] ||= []).push(f(k))); const m = {}; for (const p in P) m[p] = mean(P[p]); return S.map((k) => f(k) - m[k.z.plan]); };
        const Wc = zent((k) => k.z.W), Vw = mean(Wc.map((v) => v * v));
        const tD = dezil(S.map((k) => k.z.t)), dW2 = S.map((k) => k.W2 - k.W1), bM = {}; dW2.forEach((b, i) => (bM[tD[i]] ||= []).push(b)); for (const kk in bM) bM[kk] = mean(bM[kk]);
        const komp = { "Ort/Zeit (Pool-Mittel, FC:4424)": (k) => k.poolM, "Kultur-Würfel im Pool (FC:4435)": (k) => k.W0 - k.poolM, "Jitter (FC:2208)": (k) => k.W1 - k.W0, "Wohl × Breite, Rang-Teil (FC:4438–4439)": (k, i) => bM[tD[i]], "Wohl × Breite, Würfel-Teil": (k, i) => dW2[i] - bM[tD[i]], "Rolle (FC:2184–2200)": (k) => k.W3 - k.W2 };
        const teile = Object.entries(komp).map(([kn, f]) => { const c = zent((k) => f(k, S.indexOf(k))); let s = 0; for (let i = 0; i < c.length; i++) s += c[i] * Wc[i]; return [kn, s / S.length / Vw]; });
        console.log(`    ZERLEGUNG in derselben Stadt (Cov/Var, Summe ${pz(teile.reduce((s, x) => s + x[1], 0) * 1e3, 1e3)}): ${teile.map(([kn, a]) => `${kn} ${pz(a * 1e3, 1e3)}`).join(" · ")}`);
        console.log(`    reiner Würfel (Kultur-Würfel + Jitter + Wohl-Würfel-Teil): ${pz((teile[1][1] + teile[2][1] + teile[4][1]) * 1e3, 1e3)}`);
    }
    // die Los-Breite der Stufe 2 zerlegt: W + (Hülle − W) + Fugen-Anteil
    {
        const zentM = (f) => { const P = {}; M.forEach((z) => (P[z.plan] ||= []).push(f(z))); const m = {}; for (const p in P) m[p] = mean(P[p]); return M.map((z) => f(z) - m[z.plan]); };
        const Lc = zentM((z) => z.losB), V = mean(Lc.map((v) => v * v));
        const anteil = (f) => { const c = zentM(f); let s = 0; for (let i = 0; i < c.length; i++) s += c[i] * Lc[i]; return s / M.length / V; };
        console.log(`  Los-Breite zerlegt (in derselben Stadt): Haus-Front W ${pz(anteil((z) => z.W) * 1e3, 1e3)} · Hülle − W (Anbau/Flügel, Würfel FC:4446/4449) ${pz(anteil((z) => z.huelle - z.W) * 1e3, 1e3)} · Fugen-Anteil (Setzer FC:5530, 1,1-m-Schritte FC:5532) ${pz(anteil((z) => z.losB - z.huelle) * 1e3, 1e3)}`);
    }
    // (d) DAS MASS heute ↔ belegt: κ am Viertel-Raster ± 0,5 m, Edinburgh 49 Lose „approximately two-thirds" (Stell & Tait 2016)
    {
        const U = EINHEITEN[0][1], st = U / 4, p0 = Math.min(1, 1 / st); // ±0,5 m → 2·0,5/st
        const [lo, hi] = wilson(33, 49), kE = (0.667 - p0) / (1 - p0), kLo = (lo - p0) / (1 - p0), kHi = (hi - p0) / (1 - p0);
        console.log(`\n  MASS (d): Raster-Anteil R = Anteil der Los-Breiten ± 0,5 m am Viertel-Raster U/4; Zufall p0 = 1/(U/4). Edinburgh: U 7,32 m → Schritt ${r2(st)} m, p0 ${r3(p0)};`);
        console.log(`    belegt ≈ ⅔ von 49 (33/49 angenommen, Wilson 95 % ${r3(lo)}–${r3(hi)}) → κ ${r3(kE)} (${r3(kLo)}–${r3(kHi)})`);
        for (const [n, f] of [["W heute", (z) => z.W], ["Los-Breite heute", (z) => z.losB]]) { const b = B(f); const best = EINHEITEN.filter(([nm]) => !nm.startsWith("1 Rute")).map(([nm, U2]) => [nm, rasterAnteil(b, U2 / 4, 0.5)]).sort((x, y) => y[1].k - x[1].k);
            console.log(`    ${n}: am Edinburgh-Raster R ${pz(rasterAnteil(b, st, 0.5).a * 1e3, 1e3)} κ ${r3(rasterAnteil(b, st, 0.5).k)} · beste belegte Einheit ${best[0][0]} R ${pz(best[0][1].a * 1e3, 1e3)} κ ${r3(best[0][1].k)} · in ¾–2½ U (Edinburgh) ${pz(b.filter((v) => v >= 0.75 * U - 0.5 && v <= 2.5 * U + 0.5).length, b.length)}`); }
    }
    // ═════ ZUSATZ 19.11. (gesetz-v3-struktur.md, Entscheid 1 und 4 des Koordinators) — nur angehängt, alle Zeilen darüber unverändert ═════
    // (E1) DIE MASSZAHL DER ABSTECKUNG: Anteil der Lose, deren Breite ± 0,5 m an einem VIERTEL der Block-Einheit U liegt (k·U/4, k ≥ 1),
    //      Soll ≥ ⅔ (Stell & Tait 2016 S. 5). Die Einheit je Block liest der Zähler aus dem Feld EINHEIT_FELD (Vorgabe `blockEinheit`) des
    //      Hauses (hp, reist als ov) — heute trägt es keines; dann zählt er gegen perch 5,03 m, Freiburg 50 Fuß à 0,324 m und die beste
    //      Einheit im belegten schottischen Band 5,8–12,8 m (T08 S. 233), alle über die Los-Breite der Stadt (Lesart oben) bzw. LOS_FELD.
    {
        const EINHEIT_FELD = process.env.EINHEIT_FELD || "blockEinheit";
        const mitFeld = M.filter((z) => z.hp && Number.isFinite(z.hp[EINHEIT_FELD]));
        console.log(`\n══ ZUSATZ E1 — ANTEIL AM VIERTEL DER BLOCK-EINHEIT (± 0,5 m, Soll ≥ ⅔): Feld ${EINHEIT_FELD} je Los ${mitFeld.length}/${M.length}`);
        if (mitFeld.length) { let n = 0; for (const z of mitFeld) { const u = z.hp[EINHEIT_FELD] / 4, k = Math.max(1, Math.round(z.losB / u)); if (Math.abs(z.losB - k * u) <= 0.5 + 1e-9) n++; }
            console.log(`  am Feld: ${n}/${mitFeld.length} = ${pz(n, mitFeld.length)}`); }
        const b = B((z) => z.losB), zeile = (nm, U) => { const r = rasterAnteil(b, U / 4, 0.5); return `${nm} (U ${r2(U)} m, Viertel ${r2(U / 4)} m): Anteil ${pz(r.a * 1e3, 1e3)} · Zufall p0 ${r3(r.p0)} · κ ${r3(r.k)}`; };
        console.log(`  HEUTE Los-Breite gegen ${zeile("perch 16½ ft", RUTE)}`);
        console.log(`  HEUTE Los-Breite gegen ${zeile("Freiburg 50 Fuß à 0,324 m", 50 * 0.324)}`);
        let best = null; for (let U = 5.8; U <= 12.8001; U += 0.01) { const r = rasterAnteil(b, U / 4, 0.5); if (!best || r.a > best.r.a) best = { U, r }; }
        console.log(`  HEUTE Los-Breite gegen ${zeile("beste Einheit im Band 5,8–12,8 m", best.U)}`);
        const bW = B((z) => z.W), rW = rasterAnteil(bW, RUTE / 4, 0.5), rWF = rasterAnteil(bW, 50 * 0.324 / 4, 0.5);
        console.log(`  zum Vergleich Haus-Front W: perch-Viertel ${pz(rW.a * 1e3, 1e3)} · Freiburg-Viertel ${pz(rWF.a * 1e3, 1e3)}`);
    }
    // (E4) DIE KANTEN-GENERATION DER FRONT (`gen` des Straßen-Graphs, FC:5280/5322/5393/5425/5467/5477) je Los, und die Geschosse, die
    //      London 1667 (s. VII–IX: by-lane 2 · street of note 3 · high street 4) daraus machte, WENN gen 0 → 4, gen 1 → 3, gen 2 → 2
    //      gelesen würde (Lesart, nicht Gesetz: die Zuordnung ist Lücke L15). Dazu die heutigen eingeschossigen Häuser nach Lage und Rolle.
    {
        console.log(`\n══ ZUSATZ E4 — KANTEN-GENERATION DER FRONT (alle ${M.length} Lose · nur Wohnhäuser)`);
        const WH = M.filter((z) => z.rolle === "wohnhaus");
        const zaehle = (S, f) => Object.entries(S.reduce((a, z) => ((a[f(z)] = (a[f(z)] || 0) + 1), a), {})).sort().map(([k, c]) => `${k} ${c} (${pz(c, S.length)})`).join(" · ");
        console.log(`  gen der Front: alle ${zaehle(M, (z) => "gen " + z.frontGen)} | Wohnhäuser ${zaehle(WH, (z) => "gen " + z.frontGen)}`);
        console.log(`  gen × Lage: ${zaehle(M, (z) => "gen " + z.frontGen + "/" + z.lage)}`);
        const lon = (z) => (z.frontGen === 0 ? 4 : z.frontGen === 1 ? 3 : 2);
        console.log(`  Geschosse nach der Lesart gen 0→4 · 1→3 · 2→2: alle ${zaehle(M, (z) => lon(z) + " G.")} | Wohnhäuser ${zaehle(WH, (z) => lon(z) + " G.")}`);
        console.log(`  Geschosse HEUTE: alle ${zaehle(M, (z) => z.st + " G.")}`);
        const E1 = M.filter((z) => z.st === 1);
        console.log(`  heute eingeschossig ${E1.length} (${pz(E1.length, M.length)}): nach Lage ${zaehle(E1, (z) => z.lage)} · nach gen ${zaehle(E1, (z) => "gen " + z.frontGen)} · nach Rolle ${zaehle(E1, (z) => z.rolle)}`);
    }
    if (process.env.ZAEHL_JSON) { fs.writeFileSync(process.env.ZAEHL_JSON, JSON.stringify(L.map((z) => { const o = Object.assign({}, z); delete o.hp; return o; }))); console.log("geschrieben " + process.env.ZAEHL_JSON); }
    console.log(`\nLaufzeit ${((Date.now() - t0) / 1000).toFixed(1)} s`);
})().catch((e) => { console.error(e); process.exit(1); });
