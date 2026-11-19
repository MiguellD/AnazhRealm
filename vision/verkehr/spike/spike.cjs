"use strict";
// spike.cjs — DER SPIKE, der das Gesetz des Verkehrs (vision/verkehr/gesetz.md) zu WIDERLEGEN versucht: reines Node gegen das
// echte Netz der Stadt (fachwerk-core `kachelNetz`/`viertelWort`/`kachelMassen`, koerper-core `TAGES_GESETZ`, vehicle-core
// `fahrSchritt`). Je Probe steht das SOLL in `SOLL` (gedruckt VOR der Messung), danach die Zahl und das Urteil
// TRÄGT / TRÄGT BEDINGT / FÄLLT mit der Wurzel.
//   node --expose-gc vision/verkehr/spike/spike.cjs [a] [b] [c] [d] [e]      (ohne Argument: alle)
//   ANAZH_MAIN = ein Klon von main (Vorgabe /home/user/AnazhRealm)
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");
const GZ = require("./gesetz.cjs");
const { Stadt, GV, M, FC } = GZ;
require(path.join(GZ.MAIN, "vehicle-core.js"));
const VC = globalThis.__vehicleCore;

const T815 = 8.25 * 3600;
const GROESSEN = [1641, 100000, 1000000];
const TYPEN = ["kompakt_fwd", "limousine", "suv"]; // f.typ = Hash % 3 → das Rezept
const WAGEN = TYPEN.map((n) => {
    const p = VC.PRESETS[n], D = VC.exportDrive(Object.assign({}, p.s, p.fx));
    return { name: n, D, G: VC.fahrGesetz(D), vorn: D.huelle.noseX, hinten: -D.huelle.tailX, halbB: D.huelle.bw };
});
const SOLL = {
    a: "Abfrage „welche Wagen fahren um 08:15 im Kreis 300 m um X“: warm p95 ≤ 2 ms (1 Hz am Schirm = 6 % eines 33-ms-Bilds); kalt ≤ 500 ms (10 % der 5-s-Ankunft); Heap der Merker ≤ 64 MB; max über 3 Adressen bei 10⁶ Haushalten ≤ 1,25 × dem bei 10⁵ (warm UND kalt) — die Kosten hängen nicht an der Stadt",
    b: "24 h: in jeder Minute hat jeder Wagen genau eine Lage (Zahl = C); Ort-Sprung je 0,1 s ≤ 2 · v · 0,1 s + 1 cm, Tempo-Sprung ≤ a_max · 0,1 s; 0 Proben mit Wagen-Körper in einem Haus; 0 Proben mit fahrendem Wagen neben der Fahrbahn oder Körper außerhalb der Trasse (Fahrbahn + Saum); 06–10 Uhr mehr Wagen aus Wohnlagen hinaus als hinein, 15–20 Uhr umgekehrt",
    c: "Nah folgt der Fahr-Schritt des Kerns (vc `fahrSchritt`, Rezept des Wagens) der Lage s(t): |Δort| ≤ 1,0 m, |Δv| ≤ 0,5 m/s über 25 s je Fall (Ecke und Gerade); Übergabe fern→nah: Ort-Sprung ≤ 1 cm; nah→fern: Ort-Sprung 0 (der Rest klingt mit ≤ 1 m/s), Tempo-Sprung ≤ 1,0 m/s, Rest in ≤ 5 s verklungen",
    d: "Die Stadt (10⁵): Spitzen-Zufluss je Tor der Mitte (48 Tore) gegen q_max 0,5 Fz/s. Engstelle (q_b = ½ der 5-min-Spitze am stärksten Tor) unter dem echten Zufluss: Newell — kein Überholen, Abstand ≥ δ = 1/ρ_jam − 1 cm, Abfluss ≤ q_b, Rückstau-Kante läuft stromauf mit der Stoßwelle der Theorie ±10 %; die Attrappe V(ρ) (Tempo aus der Dichte, ohne Reihenfolge) zeigt Durchdringung (Abfluss > q_b oder Abstand < δ)",
    e: "Zwei Prozesse (JIT und --jitless), derselbe Same, dieselbe Uhr: sha256 der Lagen byte-gleich; dieselbe Stadt in anderer Frage-Reihenfolge (andere Merker-Geschichte) byte-gleich",
};
const ms = (t0) => Number(process.hrtime.bigint() - t0) / 1e6;
const jetzt = () => process.hrtime.bigint();
const gc = () => {
    if (global.gc) global.gc();
};
const pct = (arr, p) => {
    const s = Float64Array.from(arr).sort();
    return s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : NaN;
};
const r2 = (x) => Math.round(x * 100) / 100;
const zeile = (o) => console.log(JSON.stringify(o));
const URTEIL = {};

// alle Fahrten der Heim-Kacheln in [i0..i1] × [k0..k1] (Schritt sch)
function fahrten(S, i0, i1, k0, k1, sch) {
    const out = [];
    for (let i = i0; i <= i1; i += sch || 1)
        for (let k = k0; k <= k1; k += sch || 1) {
            const o = S.kachel(i, k);
            if (!o.stadt) continue;
            for (let h = 0; h < o.H; h++) {
                const f = S.haushalt(i, k, h);
                if (f) out.push(f);
            }
        }
    return out;
}

// ═══ (a) KOSTEN ═══
function probeA() {
    console.log("\n(a) KOSTEN — SOLL: " + SOLL.a);
    // JIT warm an einer fremden Stadt (Same 99): die erste Messung trägt nicht die Übersetzung des Codes
    {
        const W = new Stadt(99, 20000);
        for (let s = 0; s < 3; s++) W.imKreis(37 + s * 256, 53, 300, T815 + s);
    }
    const tafel = [];
    for (const nH of GROESSEN) {
        const R = FC.stadtRinge(nH), adr = [[0, 0], [Math.ceil(R / 2), 1], [R - 1, 0]];
        for (const [ai, ak] of adr) {
            const S = new Stadt(7, nH), X = ai * M + 37, Z = ak * M + 53;
            gc();
            const h0 = process.memoryUsage().heapUsed;
            let t0 = jetzt();
            const q = S.imKreis(X, Z, 300, T815);
            const kalt = ms(t0), kaltIndex = S.zaehl.indexMs, kaltHaupt = S.zaehl.haupt;
            gc();
            const heap = (process.memoryUsage().heapUsed - h0) / 1048576;
            // die Linse der Spitzen: warm mit und ohne neu gebaute Gasse (zaehl.wege wächst, wenn ein Wagen neu in den Kreis fährt)
            const w = [], wOhne = [], wMit = [];
            for (let s = 1; s <= 40; s++) {
                const w0 = S.zaehl.wege;
                t0 = jetzt();
                S.imKreis(X + s * 0.5, Z, 300, T815 + s);
                const d = ms(t0);
                w.push(d);
                (S.zaehl.wege > w0 ? wMit : wOhne).push(d);
            }
            t0 = jetzt();
            const qw = S.imKreis(X + M, Z, 300, T815 + 41);
            const wandern = ms(t0);
            // ein Index einer neuen Kachel allein (Rand des Schirms)
            t0 = jetzt();
            S.index(ai + 3, ak);
            const idx = ms(t0);
            let maxEin = 0;
            for (const E of S._x.values()) maxEin = Math.max(maxEin, E.n);
            const z = { nH, kachel: [ai, ak], wagen: q.wagen.length, wagenWandern: qw.wagen.length, kaltMs: r2(kalt), kaltIndexMs: r2(kaltIndex), kaltHauptstrassen: kaltHaupt, warmMedMs: r2(pct(w, 0.5)), warmP95Ms: r2(pct(w, 0.95)), warmOhneGasseMaxMs: r2(wOhne.length ? Math.max(...wOhne) : 0), warmMitGasse: wMit.length, warmMitGasseMaxMs: r2(wMit.length ? Math.max(...wMit) : 0), wandernMs: r2(wandern), indexKachelMs: r2(idx), heapMB: r2(heap), paare: q.zaehl.paare, raenge: q.zaehl.raenge, maxPaareJeKachel: maxEin, merker: Object.assign({}, S.zaehl) };
            tafel.push(z);
            zeile(z);
        }
    }
    const max = (nH, k) => Math.max(...tafel.filter((z) => z.nH === nH).map((z) => z[k]));
    const g = { warmP95: { "1641": max(1641, "warmP95Ms"), "1e5": max(100000, "warmP95Ms"), "1e6": max(1000000, "warmP95Ms") }, kalt: { "1641": max(1641, "kaltMs"), "1e5": max(100000, "kaltMs"), "1e6": max(1000000, "kaltMs") }, heapMB: Math.max(...tafel.map((z) => z.heapMB)), wandernMs: Math.max(...tafel.map((z) => z.wandernMs)), indexKachelMs: Math.max(...tafel.map((z) => z.indexKachelMs)) };
    g.wachstumWarm = r2(g.warmP95["1e6"] / g.warmP95["1e5"]);
    g.wachstumKalt = r2(g.kalt["1e6"] / g.kalt["1e5"]);
    const unabh = g.wachstumWarm <= 1.25 && g.wachstumKalt <= 1.25, warm = Math.max(g.warmP95["1e5"], g.warmP95["1e6"]) <= 2, kalt = Math.max(g.kalt["1e5"], g.kalt["1e6"]) <= 500, heap = g.heapMB <= 64;
    g.urteil = unabh && warm && kalt && heap ? "TRÄGT" : unabh && warm ? "TRÄGT BEDINGT" : "FÄLLT";
    console.log("(a) Summe " + JSON.stringify(g));
    URTEIL.a = g;
}

// ═══ (b) ERHALTUNG ═══
// Geometrie der Prüfung: Straßen (Mitte, w, Saum) und Häuser (Rechteck) je Zelle 16 m, aus den echten Kacheln
class Geo {
    constructor(S) {
        this.S = S;
        this.kach = new Set();
        this.seg = new Map();
        this.haus = new Map();
    }
    _zelle(map, cx, cz) {
        const K = (cx + 100000) * 200000 + (cz + 100000);
        let a = map.get(K);
        if (!a) map.set(K, (a = []));
        return a;
    }
    lade(i, k) {
        const K = GZ.key(i, k);
        if (this.kach.has(K)) return;
        this.kach.add(K);
        const S = this.S, Z = S.netz(i, k), Mm = S.kachel(i, k).stadt ? FC.kachelMassen(S.samen, S.nH, i, k) : null, m = S.mitte(i, k);
        Z.kanten.forEach((P, e) => {
            const saum = Mm ? Mm.strassen[e].saum : 0;
            for (let q = 1; q < P.x.length; q++) {
                const s = { ax: P.x[q - 1], az: P.z[q - 1], bx: P.x[q], bz: P.z[q], w: P.w, saum };
                const x0 = Math.floor((Math.min(s.ax, s.bx) - 8) / 16), x1 = Math.floor((Math.max(s.ax, s.bx) + 8) / 16);
                const z0 = Math.floor((Math.min(s.az, s.bz) - 8) / 16), z1 = Math.floor((Math.max(s.az, s.bz) + 8) / 16);
                for (let cx = x0; cx <= x1; cx++) for (let cz = z0; cz <= z1; cz++) this._zelle(this.seg, cx, cz).push(s);
            }
        });
        if (Mm)
            for (let r = 0; r < Mm.n; r++) {
                const L = Mm.lage, g = L[r * 7 + 2], h = { x: m.x + L[r * 7], z: m.z + L[r * 7 + 1], ux: Math.cos(g), uz: -Math.sin(g), a: L[r * 7 + 3] / 2, b: L[r * 7 + 4] / 2 };
                const rr = Math.sqrt(h.a * h.a + h.b * h.b);
                for (let cx = Math.floor((h.x - rr - 3) / 16); cx <= Math.floor((h.x + rr + 3) / 16); cx++) for (let cz = Math.floor((h.z - rr - 3) / 16); cz <= Math.floor((h.z + rr + 3) / 16); cz++) this._zelle(this.haus, cx, cz).push(h);
            }
    }
    umgebung(x, z) {
        const i = Math.floor(x / M + 0.5), k = Math.floor(z / M + 0.5);
        for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) this.lade(i + a, k + b);
    }
    // die Straße unter dem Punkt: kleinster Abstand zur Mitte über alle Stücke, die ihn tragen könnten
    strasse(x, z) {
        this.umgebung(x, z);
        const a = this.seg.get((Math.floor(x / 16) + 100000) * 200000 + (Math.floor(z / 16) + 100000)) || [];
        let best = { d: Infinity, w: 0, saum: 0, ueberFahrbahn: Infinity, minTrasse: Infinity };
        for (const s of a) {
            const bx = s.bx - s.ax, bz = s.bz - s.az, l2 = bx * bx + bz * bz;
            let f = l2 > 0 ? ((x - s.ax) * bx + (z - s.az) * bz) / l2 : 0;
            f = f < 0 ? 0 : f > 1 ? 1 : f;
            const px = s.ax + bx * f - x, pz = s.az + bz * f - z, d = Math.sqrt(px * px + pz * pz);
            if (d - s.w / 2 < best.ueberFahrbahn) best.ueberFahrbahn = d - s.w / 2;
            if (d < best.d) best = Object.assign(best, { d, w: s.w, saum: s.saum });
            best.minTrasse = Math.min(best.minTrasse, d - (s.w / 2 + s.saum));
        }
        return best;
    }
    // überdeckt der Körper (Rechteck um x,z mit Richtung dx,dz) ein Haus? (Trennachsen)
    imHaus(x, z, dx, dz, vorn, hinten, halbB) {
        const cx = x + (dx * (vorn - hinten)) / 2, cz = z + (dz * (vorn - hinten)) / 2, A = { x: cx, z: cz, ux: dx, uz: dz, a: (vorn + hinten) / 2, b: halbB };
        const zellen = this.haus.get((Math.floor(cx / 16) + 100000) * 200000 + (Math.floor(cz / 16) + 100000)) || [];
        const proj = (R, ax, az) => Math.abs(R.ux * ax + R.uz * az) * R.a + Math.abs(-R.uz * ax + R.ux * az) * R.b;
        for (const H of zellen) {
            const tx = H.x - A.x, tz = H.z - A.z;
            let trennt = false;
            for (const [ax, az] of [[A.ux, A.uz], [-A.uz, A.ux], [H.ux, H.uz], [-H.uz, H.ux]]) {
                if (Math.abs(tx * ax + tz * az) > proj(A, ax, az) + proj(H, ax, az)) {
                    trennt = true;
                    break;
                }
            }
            if (!trennt) return true;
        }
        return false;
    }
}
function erhaltung(S, alle, fein, name) {
    const geo = new Geo(S), amax = Math.max(GV.aAn, GV.aAb);
    const ergebnis = { stadt: name, wagen: alle.length, fein: fein.length, minutenFehlend: 0, sprungMaxM: 0, sprungUeberSoll: 0, tempoSprungMax: 0, tempoUeberSoll: 0, richtungMaxGradJeS: 0, tagesNahtM: 0, imHaus: 0, nebenFahrbahn: 0, ausserTrasse: 0, ueberFahrbahnMaxM: -Infinity, ueberTrasseMaxM: -Infinity, geprueft: 0, fahrendMax: 0, fahrendUm815: 0, fahrendGeprueft: 0, fahrendAufGasseOhneWagen: 0, ursache: {} };
    // DIE LINSE, die den Täter beim Namen nennt: jeder Verstoß (neben der Fahrbahn / außerhalb der Trasse) bekommt seine Ursache —
    // „gasse<breiteM“ (die Straße unter dem Wagen ist schmaler als VERKEHR_GESETZ.breiteM: nach dem Kern eine Gasse ohne Wagen,
    // fwc `wegArt` „pflastergasse“), „stellplatz“ (geparkt oder auf der Rampe zur Tür), „ecke“ (Fahrstraße, Richtung dreht über
    // 3 m um > 5°), sonst „sonst“
    const VG = FC.VERKEHR_GESETZ, cos5 = Math.cos((5 * Math.PI) / 180);
    const zuUrsache = (f, t, L, st, neben, aus, m) => {
        let u = "sonst";
        if (st.w < VG.breiteM) u = "gasse<breiteM";
        else if (L.u < 0) u = "stellplatz";
        else {
            const TL = S._teile(f, t).teile;
            let q = 0;
            while (q < TL.length - 1 && t > TL[q].t1) q++;
            const p = TL[q], P = p.S.P, r = Math.min(GV.rampeM, p.S.tuerA && p.S.tuerB ? P.L / 2 : P.L);
            if ((p.S.tuerA && L.u < r) || (p.S.tuerB && P.L - L.u < r)) u = "stellplatz";
            else {
                const a = GZ.punktAuf(P, Math.max(0, L.u - 1.5), null), b = GZ.punktAuf(P, Math.min(P.L, L.u + 1.5), null);
                if (a.dx * b.dx + a.dz * b.dz < cos5) u = "ecke";
            }
        }
        const e = ergebnis.ursache[u] || (ergebnis.ursache[u] = { neben: 0, aus: 0, maxM: 0 });
        if (neben) e.neben++;
        if (aus) e.aus++;
        e.maxM = Math.max(e.maxM, Math.round(m * 1000) / 1000);
    };
    // 1) die Minute: jeder Wagen hat eine Lage; die Zahl der fahrenden
    for (let m = 0; m < 1440; m++) {
        let fahrend = 0;
        for (const f of alle) {
            const L = S.lage(f, m * 60);
            if (!Number.isFinite(L.x) || !Number.isFinite(L.z)) ergebnis.minutenFehlend++;
            else if (L.u >= 0) fahrend++;
        }
        ergebnis.fahrendMax = Math.max(ergebnis.fahrendMax, fahrend);
        if (m === 495) ergebnis.fahrendUm815 = fahrend;
    }
    // 2) fein (0,1 s) über jede Fahrt der Stichprobe: Sprung, Tempo, Richtung; je 1 s die Geometrie
    const dt = 0.1;
    for (const f of fein) {
        const W = WAGEN[f.typ], g = S.grenzen(f);
        ergebnis.tagesNahtM = Math.max(ergebnis.tagesNahtM, Math.hypot(S.lage(f, 0).x - S.lage(f, 86400 - 1e-6).x, S.lage(f, 0).z - S.lage(f, 86400 - 1e-6).z));
        for (const [a, b] of [[g[0] - 2, g[4] + 2], [g[5] - 2, g[9] + 2]]) {
            let vor = S.lage(f, a), n = 0;
            for (let t = a + dt; t <= b; t += dt, n++) {
                const L = S.lage(f, t), d = Math.hypot(L.x - vor.x, L.z - vor.z), dv = Math.abs(L.v - vor.v);
                const soll = 2 * Math.max(L.v, vor.v) * dt + 0.01;
                if (d > ergebnis.sprungMaxM) ergebnis.sprungMaxM = d;
                if (d > soll) ergebnis.sprungUeberSoll++;
                if (dv > ergebnis.tempoSprungMax) ergebnis.tempoSprungMax = dv;
                if (dv > amax * dt + 1e-9) ergebnis.tempoUeberSoll++;
                const dot = Math.max(-1, Math.min(1, L.dx * vor.dx + L.dz * vor.dz)), wink = (Math.acos(dot) * 180) / Math.PI / dt;
                if ((L.v > 0.5 || vor.v > 0.5) && wink > ergebnis.richtungMaxGradJeS) ergebnis.richtungMaxGradJeS = wink;
                if (n % 10 === 0) {
                    ergebnis.geprueft++;
                    const st = geo.strasse(L.x, L.z);
                    if (L.u >= 0) {
                        ergebnis.fahrendGeprueft++;
                        if (st.w < VG.breiteM) ergebnis.fahrendAufGasseOhneWagen++;
                    }
                    const neben = L.u >= 0 && st.ueberFahrbahn > 1e-6;
                    if (neben) ergebnis.nebenFahrbahn++;
                    const ueberT = st.minTrasse + W.halbB;
                    if (ueberT > 1e-6) ergebnis.ausserTrasse++;
                    if (neben || ueberT > 1e-6) zuUrsache(f, t, L, st, neben, ueberT > 1e-6, Math.max(neben ? st.ueberFahrbahn : 0, ueberT));
                    ergebnis.ueberFahrbahnMaxM = Math.max(ergebnis.ueberFahrbahnMaxM, L.u >= 0 ? st.ueberFahrbahn : -Infinity);
                    ergebnis.ueberTrasseMaxM = Math.max(ergebnis.ueberTrasseMaxM, ueberT);
                    if (geo.imHaus(L.x, L.z, L.dx, L.dz, W.vorn, W.hinten, W.halbB)) ergebnis.imHaus++;
                }
                vor = L;
            }
        }
        // geparkt (Heim und Werk): Körper in der Trasse, nicht im Haus
        for (const t of [g[0] - 60, (g[4] + g[5]) / 2]) {
            const L = S.lage(f, t), st = geo.strasse(L.x, L.z);
            ergebnis.geprueft++;
            const ueberT = st.minTrasse + W.halbB;
            if (ueberT > 1e-6) {
                ergebnis.ausserTrasse++;
                zuUrsache(f, t, L, st, false, true, ueberT);
            }
            ergebnis.ueberTrasseMaxM = Math.max(ergebnis.ueberTrasseMaxM, ueberT);
            if (geo.imHaus(L.x, L.z, L.dx, L.dz, W.vorn, W.hinten, W.halbB)) ergebnis.imHaus++;
        }
    }
    // 3) Abfluss: Wohnlage = Kachel mit Arbeit/Haushalt unter dem Median der Stadt; Wechsel der Kachel von Minute zu Minute
    const rat = [];
    for (let i = -S.R; i <= S.R; i++) for (let k = -S.R; k <= S.R; k++) {
        const c = S.kachel(i, k);
        if (c.stadt) rat.push(c.J / c.H);
    }
    const med = pct(rat, 0.5), wohn = (x, z) => {
        const c = S.kachel(Math.floor(x / M + 0.5), Math.floor(z / M + 0.5));
        return c.stadt && c.J / c.H < med;
    };
    const fluss = (h0, h1) => {
        let hinaus = 0, hinein = 0;
        for (const f of alle) {
            let w = wohn(S.lage(f, h0 * 3600).x, S.lage(f, h0 * 3600).z);
            for (let m = h0 * 60 + 1; m <= h1 * 60; m++) {
                const L = S.lage(f, m * 60), w2 = wohn(L.x, L.z);
                if (w && !w2) hinaus++;
                if (!w && w2) hinein++;
                w = w2;
            }
        }
        return { hinaus, hinein };
    };
    ergebnis.morgen = fluss(6, 10);
    ergebnis.abend = fluss(15, 20);
    for (const k of ["sprungMaxM", "tempoSprungMax", "richtungMaxGradJeS", "tagesNahtM", "ueberFahrbahnMaxM", "ueberTrasseMaxM"]) ergebnis[k] = Math.round(ergebnis[k] * 1000) / 1000;
    return ergebnis;
}
function probeB() {
    console.log("\n(b) ERHALTUNG — SOLL: " + SOLL.b);
    const S1 = new Stadt(7, 1641), alle1 = fahrten(S1, -S1.R, S1.R, -S1.R, S1.R);
    const e1 = erhaltung(S1, alle1, alle1, "1641 (jeder Wagen)");
    zeile(e1);
    const S2 = new Stadt(7, 100000), R = S2.R, alle2 = fahrten(S2, -R, R, -R, R, 6), fein2 = alle2.filter((f, q) => q % 20 === 0);
    const e2 = erhaltung(S2, alle2, fein2, "100000 (jede 6. Kachel; fein jeder 20. Wagen)");
    zeile(e2);
    const ok = (e) => e.minutenFehlend === 0 && e.sprungUeberSoll === 0 && e.tempoUeberSoll === 0 && e.imHaus === 0 && e.nebenFahrbahn === 0 && e.ausserTrasse === 0 && e.tagesNahtM < 0.01 && e.morgen.hinaus > e.morgen.hinein && e.abend.hinein > e.abend.hinaus;
    URTEIL.b = { urteil: ok(e1) && ok(e2) ? "TRÄGT" : "FÄLLT", e1, e2 };
    console.log("(b) Urteil " + URTEIL.b.urteil);
}

// ═══ (c) NAH ↔ FERN ═══
function folge(S, f, t0, dauer) {
    const W = WAGEN[f.typ], G = W.G, b = () => 0;
    const L0 = S.lage(f, t0), Lp = S.lage(f, t0 + 0.1), Lm = S.lage(f, t0 - 0.1);
    const wink = (L) => Math.atan2(-L.dz, L.dx);
    let dw = wink(Lp) - wink(Lm);
    dw = Math.atan2(Math.sin(dw), Math.cos(dw));
    const kappa = L0.v > 0.2 ? dw / (0.2 * L0.v) : 0;
    const z = VC.fahrZustand(L0.x, L0.z, wink(L0));
    z.vlong = L0.v;
    z.speed = L0.v;
    z.yawRate = L0.v * kappa;
    z.aLat = L0.v * L0.v * kappa;
    VC.fahrStand(z, G, b, 0);
    const dt = 1 / 60, out = { ortMax: 0, tempoMax: 0, ersteM: 0 };
    let t = t0;
    for (let n = 1; n <= Math.round(dauer / dt); n++) {
        // der Fahrer folgt s(t): Vorschau-Punkt der Lage (Pure Pursuit, Lenkgesetz wie vc `fahrerLinie`), Tempo nach v(t) und dem
        // Rest entlang der Fahrt
        const L = S.lage(f, t), v = z.speed, ld = 6 + 0.55 * v, tau = ld / Math.max(L.v, 2), T = S.lage(f, t + tau);
        const alpha = Math.atan2(-(T.z - z.z), T.x - z.x) - z.yaw, a = Math.atan2(Math.sin(alpha), Math.cos(alpha));
        const lA = Math.max(1, Math.hypot(T.x - z.x, T.z - z.z)), delta = Math.atan((2 * G.L * Math.sin(a)) / lA);
        const es = (L.x - z.x) * L.dx + (L.z - z.z) * L.dz, L2 = S.lage(f, t + dt), aSoll = (L2.v - L.v) / dt;
        const vSoll = Math.max(0, L.v + 0.8 * es);
        const steuer = { steer: Math.max(-1, Math.min(1, (delta * (1 + v * G.sfK)) / G.maxSteer)), throttle: 0, brake: 0 };
        const fehl = vSoll - v + 0.3 * aSoll;
        if (fehl > 0) steuer.throttle = Math.min(1, fehl * 0.6 + (vSoll > 0.3 ? 0.15 : 0));
        else if (fehl < -0.1) steuer.brake = Math.min(1, -fehl * 0.4);
        VC.fahrSchritt(z, steuer, G, b, dt);
        t = t0 + n * dt;
        const Lt = S.lage(f, t), d = Math.hypot(Lt.x - z.x, Lt.z - z.z), dv = Math.abs(Lt.v - z.speed);
        if (n === 1) out.ersteM = d;
        if (d > out.ortMax) out.ortMax = d;
        if (dv > out.tempoMax) out.tempoMax = dv;
        if (Lt.u < 0) break; // geparkt: der Wagen ist angekommen
    }
    // Übergabe nah → fern: der Rest (längs und quer) klingt mit ≤ 1 m/s; das Bild springt nicht, das Tempo springt um |Δv| + ≤ 1
    const Lt = S.lage(f, t), rx = z.x - Lt.x, rz = z.z - Lt.z, rest = Math.hypot(rx, rz);
    out.restM = rest;
    out.abklingS = rest / 1;
    out.tempoSprung = Math.abs(z.speed - Lt.v) + (rest > 0 ? 1 : 0) * Math.min(1, rest);
    return out;
}
function probeC() {
    console.log("\n(c) NAH ↔ FERN — SOLL: " + SOLL.c);
    const S = new Stadt(7, 100000), q = S.imKreis(37, 53, 600, T815), faelle = [];
    for (const w of q.wagen.slice(0, 30)) {
        const f = w.f, g = S.grenzen(f);
        faelle.push(["Abfahrt", f, g[0] + 1]);
        if (g[2] - g[1] > 15 && g[3] - g[2] > 15) faelle.push(["Ecke", f, g[2] - 12]);
        else faelle.push(["Hauptstraße", f, (g[1] + g[3]) / 2 - 12]);
        faelle.push(["Ankunft", f, g[3] - 12]);
    }
    const res = faelle.map(([art, f, t0]) => Object.assign({ art, typ: TYPEN[f.typ] }, folge(S, f, t0, 25)));
    const agg = (k) => r2(Math.max(...res.map((r) => r[k])));
    const p95 = (k) => r2(pct(res.map((r) => r[k]), 0.95));
    const g = { faelle: res.length, ortMaxM: agg("ortMax"), ortP95M: p95("ortMax"), tempoMaxMs: agg("tempoMax"), tempoP95Ms: p95("tempoMax"), ersterSchrittM: agg("ersteM"), restMaxM: agg("restM"), abklingMaxS: agg("abklingS"), tempoSprungMax: agg("tempoSprung") };
    for (const art of ["Abfahrt", "Ecke", "Hauptstraße", "Ankunft"]) {
        const r = res.filter((x) => x.art === art);
        if (r.length) g[art] = { n: r.length, ortMaxM: r2(Math.max(...r.map((x) => x.ortMax))), tempoMaxMs: r2(Math.max(...r.map((x) => x.tempoMax))) };
    }
    const folgt = g.ortMaxM <= 1.0 && g.tempoMaxMs <= 0.5, uebergabe = g.ersterSchrittM <= 0.01 && g.tempoSprungMax <= 1.0 && g.abklingMaxS <= 5;
    g.urteil = folgt && uebergabe ? "TRÄGT" : g.ortP95M <= 1.0 && g.tempoP95Ms <= 0.5 && uebergabe ? "TRÄGT BEDINGT" : "FÄLLT";
    console.log("(c) Summe " + JSON.stringify(g));
    URTEIL.c = g;
}

// ═══ (d) STAU ═══
// der echte Zufluss am Tor zwischen Kachel c und c+1 (achse 0: Reihe `fest`, Tor in i; achse 1: Spalte `fest`, Tor in k), in
// Richtung + (plus) oder −, morgens: die Uhr, zu der jede Fahrt des Gesetzes das Tor kreuzt (die Naht der Linie ihrer
// Hauptstraße; am Heim-Tor und auf dem Anlauf in der Gasse ihres Haushalts — `zeitAmHr`)
function torZufluss(S, achse, fest, c, plus) {
    const A = [], rK = GV.rMaxK, aus = plus ? c : c + 1, ein = plus ? c + 1 : c;
    const Kaus = achse ? GZ.key(fest, aus) : GZ.key(aus, fest), Kein = achse ? GZ.key(fest, ein) : GZ.key(ein, fest);
    for (let oi = (achse ? fest : aus) - rK; oi <= (achse ? fest : aus) + rK; oi++)
        for (let ok = (achse ? aus : fest) - rK; ok <= (achse ? aus : fest) + rK; ok++) {
            if (achse === 0 && ok !== fest) continue; // eine Reihe kreuzt nur die Hauptstraße der Heim-Reihe
            const o = S.kachel(oi, ok);
            if (!o.stadt) continue;
            const Zo = S.ziele(o);
            for (let q = 0; q < Zo.D.length; q++) {
                if (!Zo.n[q]) continue;
                const d = S.kachel(GZ.ki(Zo.D[q]), GZ.kk(Zo.D[q]));
                if (S.route(o, d).quer) continue;
                const nt = S.haupt(o, d, true).naht.find((x) => x[0] === Kaus && x[1] === Kein);
                if (!nt) continue;
                for (let r = 0; r < Zo.n[q]; r++) A.push(S.zeitAmHr(S.fahrt(o, d, r), true, nt[2]));
            }
        }
    return A.sort((a, b) => a - b);
}
function probeD() {
    console.log("\n(d) STAU — SOLL: " + SOLL.d);
    const S = new Stadt(7, 100000);
    // die Tore der Mitte, beide Achsen: der stärkste Zufluss über 5 min
    let best = null;
    const tore = [];
    for (const achse of [0, 1])
        for (let fest = -1; fest <= 1; fest++)
            for (let c = -2; c <= 1; c++)
                for (const plus of [true, false]) {
                    const A = torZufluss(S, achse, fest, c, plus);
                    let qmax = 0;
                    for (let a = 0, b = 0; b < A.length; b++) {
                        while (A[b] - A[a] > 300) a++;
                        qmax = Math.max(qmax, (b - a + 1) / 300);
                    }
                    tore.push(qmax);
                    if (!best || qmax > best.qmax) best = { kR: achse ? "Spalte " + fest : "Reihe " + fest, iTor: c + (plus ? "+" : "−"), A, qmax, n: A.length };
                }
    const qMax = 0.5, vf = GV.vHaupt, Lm = WAGEN.reduce((s, w) => s + w.vorn + w.hinten, 0) / WAGEN.length, delta = Lm + 2.5, rhoJ = 1 / delta, w = qMax / (rhoJ - qMax / vf), tau = delta / w;
    // die Stadt selbst: der Spitzen-Zufluss an diesem Tor gegen die Kapazität der Spur (Newell an q_max)
    const newell = (A, q) => {
        const D = new Float64Array(A.length);
        let vz = 0;
        for (let k = 0; k < A.length; k++) {
            D[k] = Math.max(A[k], k ? D[k - 1] + 1 / q : -Infinity);
            vz = Math.max(vz, D[k] - A[k]);
        }
        return { D, vzMax: vz };
    };
    const stadt = { tore: tore.length, tor: [best.kR, best.iTor], fahrtenMorgen: best.n, spitzeJe5min: r2(best.qmax), medianTorJe5min: r2(pct(tore, 0.5)), kapazitaet: qMax, verzugMaxS: r2(newell(best.A, qMax).vzMax) };
    // die Engstelle (eine Spur im Wechsel, Baustelle): q_b = ½ der 5-min-Spitze am stärksten Tor, Zulauf 1 500 m frei; die Wagen
    // des Morgens (Ankunft an der Engstelle = ihre echte Tor-Zeit)
    const qb = best.qmax / 2, Lz = 1500, t0 = best.A[0], A = best.A.map((a) => a - t0).filter((a) => a < 5400);
    const vorlauf = 600, n = A.length, E = A.map((a) => a - (Lz + vorlauf) / vf); // Eintritt 600 m vor dem Zulauf: dort ordnet Newell die Bündel unter 2 s
    // NEWELL: Abfahrt an der Engstelle D_k = max(A_k, D_{k−1} + 1/q_b); die Spur x_k(t) = min(frei, Vorgänger(t − τ) − δ, Haltelinie bis D_k)
    const { D } = newell(A, qb);
    const dt = 0.1, T = Math.max(...D) + 120, schritte = Math.ceil(T / dt), X = [];
    const hist = []; // hist[k][s] Ort des Wagens k zum Schritt s
    for (let k = 0; k < n; k++) hist.push(new Float64Array(schritte + 1).fill(NaN));
    const lag = Math.round(tau / dt);
    let minAbstand = Infinity, ueberholt = 0, rueck = 0;
    const raus = [];
    for (let s = 0; s <= schritte; s++) {
        const t = s * dt;
        for (let k = 0; k < n; k++) {
            if (t < E[k]) continue;
            // Newell (2002): x_k(t) = min(x_k(t − dt) + v_f·dt, x_{k−1}(t − τ) − δ, Haltelinie bis D_k); ein Vorgänger, der um t − τ
            // noch nicht im Zulauf war, steht dort, wo seine freie Fahrt ihn hätte
            const vor = s > 0 ? hist[k][s - 1] : NaN;
            let x = Number.isNaN(vor) ? -Lz - vorlauf + (t - E[k]) * vf : vor + vf * dt;
            if (t < D[k]) x = Math.min(x, 0);
            if (k > 0) {
                const sl = s - lag, h = sl >= 0 ? hist[k - 1][sl] : NaN, lead = Number.isNaN(h) ? -Lz - vorlauf + (t - tau - E[k - 1]) * vf : h;
                x = Math.min(x, lead - delta);
            }
            if (!Number.isNaN(vor) && x < vor && x > -Lz) rueck++;
            hist[k][s] = x;
            if (k > 0 && !Number.isNaN(hist[k - 1][s])) {
                const ab = hist[k - 1][s] - x;
                if (x > -Lz) minAbstand = Math.min(minAbstand, ab);
                if (ab < 0) ueberholt++;
            }
            if (!Number.isNaN(vor) && vor <= 0 && x > 0) raus.push(t);
        }
    }
    X.length = 0;
    const abflussMax = (ts) => {
        ts = ts.slice().sort((a, b) => a - b);
        let m = 0;
        for (let a = 0; a + 9 < ts.length; a++) m = Math.max(m, 9 / Math.max(1e-9, ts[a + 9] - ts[a]));
        return m;
    };
    // die Kante des Rückstaus: der hinterste stehende Wagen (v < 1 m/s) je 30 s; ihre Geschwindigkeit stromauf gegen die Stoßwelle
    const kante = [];
    for (let s = lag + 1; s <= schritte; s += Math.round(30 / dt)) {
        let hinten = 0;
        for (let k = 0; k < n; k++) {
            const x = hist[k][s], x0 = hist[k][s - Math.round(1 / dt)];
            if (Number.isNaN(x) || Number.isNaN(x0) || x > 0) continue;
            if (x - x0 < 1 && x < hinten) hinten = x;
        }
        kante.push([s * dt, hinten]);
    }
    // Theorie: Zulauf-Zustand (q_in, q_in/v_f) gegen Stau-Zustand (q_b, ρ_jam − q_b/w)
    const spitze = kante.reduce((m, k, q) => (k[1] < kante[m][1] ? q : m), 0), wachs = kante.slice(0, spitze + 1).filter((k) => k[1] < -2 * delta);
    let uMess = NaN, uTheo = NaN, qIn = NaN;
    if (wachs.length >= 3) {
        const a = wachs[0], b = wachs[wachs.length - 1];
        uMess = (b[1] - a[1]) / (b[0] - a[0]);
        // wer zwischen a und b ans Ende stößt, hätte die Haltelinie frei um t + |x_Ende| / v_f erreicht
        const ta = a[0] - a[1] / vf, tb = b[0] - b[1] / vf;
        qIn = A.filter((x) => x >= ta && x <= tb).length / (tb - ta);
        uTheo = (qb - qIn) / (rhoJ - qb / w - qIn / vf);
    }
    const nw = { wagen: n, rueckwaerts: rueck, delta: r2(delta), w: r2(w), tau: r2(tau), minAbstandM: r2(minAbstand), ueberholt, abflussMax: Math.round(abflussMax(raus) * 1e4) / 1e4, qb: Math.round(qb * 1e4) / 1e4, rueckstauMaxM: r2(-Math.min(...kante.map((k) => k[1]))), kanteMs: Math.round(uMess * 1000) / 1000, stossTheorieMs: Math.round(uTheo * 1000) / 1000, qInImWachsen: Math.round(qIn * 1000) / 1000 };
    // DIE ATTRAPPE V(ρ): jeder Wagen fährt mit V(ρ) aus der Dichte um ihn (±50 m), keine Reihenfolge, keine Haltelinie
    const V = (rho) => (rho <= qMax / vf ? vf : Math.max(0, w * (rhoJ / rho - 1)));
    const xs = new Float64Array(n).fill(NaN), raus2 = [], drin = new Uint8Array(n);
    let minAb2 = Infinity, ueber2 = 0;
    for (let s = 0; s <= schritte; s++) {
        const t = s * dt;
        for (let k = 0; k < n; k++)
            if (!drin[k] && t >= E[k] + vorlauf / vf) {
                xs[k] = -Lz;
                drin[k] = 1;
            }
        const neu = Float64Array.from(xs);
        for (let k = 0; k < n; k++) {
            if (Number.isNaN(xs[k]) || xs[k] > 200) continue;
            let c = 0;
            for (let j = 0; j < n; j++) if (!Number.isNaN(xs[j]) && Math.abs(xs[j] - xs[k]) <= 50) c++;
            const rho = c / 100, cap = xs[k] > -50 && xs[k] < 50 ? qb / qMax : 1; // die Engstelle als halbe Spur: V sinkt, nichts hält
            neu[k] = xs[k] + V(rho) * cap * dt;
            if (xs[k] < 0 && neu[k] >= 0) raus2.push(t);
            if (neu[k] > 200) neu[k] = NaN; // hinter der Engstelle verlässt er die Probe
        }
        for (let k = 1; k < n; k++)
            if (!Number.isNaN(neu[k]) && !Number.isNaN(neu[k - 1]) && neu[k] > -Lz && neu[k] < 200) {
                const ab = neu[k - 1] - neu[k];
                minAb2 = Math.min(minAb2, ab);
                if (ab < 0) ueber2++;
            }
        xs.set(neu);
    }
    const at = { minAbstandM: r2(minAb2), ueberholt: ueber2, abflussMax: r2(abflussMax(raus2)) };
    const newellOk = nw.ueberholt === 0 && nw.rueckwaerts === 0 && nw.minAbstandM >= delta - 0.01 && nw.abflussMax <= qb * 1.02 && Math.abs(nw.kanteMs - nw.stossTheorieMs) <= 0.1 * Math.abs(nw.stossTheorieMs);
    const attrappeBricht = at.abflussMax > qb || at.minAbstandM < delta;
    const g = { stadt, engstelle: { qb, zulaufM: Lz }, newell: nw, attrappe: at, urteil: newellOk && attrappeBricht ? "TRÄGT" : newellOk ? "TRÄGT BEDINGT" : "FÄLLT" };
    console.log("(d) Summe " + JSON.stringify(g));
    URTEIL.d = g;
}

// ═══ (e) DETERMINISMUS ═══
function abdruck(reihe) {
    const S = new Stadt(7, 100000), h = crypto.createHash("sha256"), buf = Buffer.alloc(48);
    const fragen = [];
    for (const [i, k] of [[0, 0], [5, -3], [-9, 7], [14, 2]]) for (const t of [7.7, 8.25, 16.9, 17.4]) fragen.push([i * M + 37, k * M + 53, t * 3600]);
    if (reihe) {
        S.imKreis(-2000, 900, 300, 12 * 3600); // eine andere Geschichte der Merker
        fragen.reverse();
    }
    // die andere Reihe fragt jede Adresse kalt (alle Merker verworfen) — dieselbe Antwort ohne jede Geschichte
    const erg = fragen.map(([X, Z, t]) => {
        if (reihe) S.vergessen();
        return S.imKreis(X, Z, 300, t).wagen;
    });
    if (reihe) erg.reverse();
    let n = 0;
    for (const ws of erg)
        for (const w of ws) {
            buf.writeDoubleLE(w.f.id, 0);
            buf.writeDoubleLE(w.L.x, 8);
            buf.writeDoubleLE(w.L.z, 16);
            buf.writeDoubleLE(w.L.dx, 24);
            buf.writeDoubleLE(w.L.dz, 32);
            buf.writeDoubleLE(w.L.v, 40);
            h.update(buf);
            n++;
        }
    const S1 = new Stadt(7, 1641), alle = fahrten(S1, -S1.R, S1.R, -S1.R, S1.R);
    for (let m = 0; m < 1440; m += 5)
        for (const f of alle) {
            const L = S1.lage(f, m * 60 + 0.37);
            buf.writeDoubleLE(L.x, 0);
            buf.writeDoubleLE(L.z, 8);
            buf.writeDoubleLE(L.v, 16);
            h.update(buf.subarray(0, 24));
            n++;
        }
    return { lagen: n, sha256: h.digest("hex") };
}
function probeE() {
    console.log("\n(e) DETERMINISMUS — SOLL: " + SOLL.e);
    const self = __filename, env = Object.assign({}, process.env);
    const lauf = (flags, arg) => JSON.parse(execFileSync(process.execPath, flags.concat([self, arg]), { env, maxBuffer: 1 << 24 }).toString().trim().split("\n").pop());
    const a = lauf([], "e-kind"), b = lauf(["--jitless"], "e-kind"), c = lauf(["--max-old-space-size=96"], "e-kind-reihe");
    const g = { jit: a, jitless: b, andereReihe: c, gleich: a.sha256 === b.sha256 && a.sha256 === c.sha256 };
    g.urteil = g.gleich ? "TRÄGT" : "FÄLLT";
    console.log("(e) Summe " + JSON.stringify(g));
    URTEIL.e = g;
}

// ═══ Lauf ═══
const arg = process.argv.slice(2);
if (arg[0] === "e-kind" || arg[0] === "e-kind-reihe") {
    console.log(JSON.stringify(abdruck(arg[0] === "e-kind-reihe")));
} else {
    const welche = arg.length ? arg : ["a", "b", "c", "d", "e"];
    console.log("SPIKE Verkehr — Node " + process.version + ", main " + GZ.MAIN + ", Same 7, Uhr 08:15 = " + T815 + " s");
    const P = { a: probeA, b: probeB, c: probeC, d: probeD, e: probeE };
    for (const w of welche) {
        const t0 = jetzt();
        P[w]();
        console.log("(" + w + ") Laufzeit " + Math.round(ms(t0)) + " ms");
    }
    console.log("\nURTEILE " + JSON.stringify(Object.fromEntries(Object.entries(URTEIL).map(([k, v]) => [k, v.urteil]))));
}
