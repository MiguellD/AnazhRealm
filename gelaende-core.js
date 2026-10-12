// AnazhRealm — gelaende-core.js: DAS GESETZBUCH DES GELÄNDES (K09a, 11.10.2026).
//
// Die EINE Quelle der 2D-Höhe der Welt: der Term-Auswerter des Erbguts (`worldMeta.erbgut` in seiner Normalform —
// Wildnis, Insel, Rampe, Bucht) und der Wildnis-Term = die LANDFORM (K16: Großform-Splines T1, Flussnetz T2 mit seinen
// Senken als den benannten Seen, hang-begrenztes Detail T3, Schicht-Gesetz T5, Tiefsee). Geladen vom Main-Thread
// (index.html, vor dem Stamm), vom voxel-worker (importScripts mit ?v=) und vom Foundry-Worker (cores.manifest.json) —
// es gibt keinen Spiegel: jeder Leser rechnet hier.
//
// REIN: jede Funktion ist f(L, x, z, …). `L` ist die GELÄNDE-LAGE, die der Wirt reicht — der voxel-worker seinen
// `state`, der Stamm die lebende Sicht `_gelaende()` auf seinen Zustand. Gelesen werden genau diese Namen:
//   seed · noise (SimplexNoise des Stroms seed + ":voxel") · baseHeight · waterLevel · erbgut ({ terme, wildnis, hash }
//   — die Normalform) · regionSize (die Kachel-Kante der Hydro-Regionen) · erdbau (die Normalform `erdbauNormal` der Orte
//   oder null, K10).
// Kein this, kein Zustand außer den Rausch-Strömen je Saat (aus der Saat abgeleitet, nie Math.random), keine Zeit.
//
// GESETZ-KERN (studio-vertrag §9): STUDIO_VERTRAG = 1 und FUNKTION = 1 — keine Rezepte, keine Gestalt.
(function (root) {
    "use strict";

    const VERSION = 1;

    // Der Schlüssel der Hydro-Kachel an (x, z): Regionen der Kante `regionSize` um den Ursprung. Leser: die Hydro-
    // Auflösung des Wirts (`_hydroFor`, Worker `hydroFor`).
    function kachelSchluessel(L, x, z) {
        const size = L.regionSize;
        if (!(size > 0)) throw new Error("gelaende-core: die Lage trägt keine regionSize");
        const half = size / 2;
        return Math.floor((x + half) / size) + "," + Math.floor((z + half) / size);
    }

    // Ein Term des Erbguts an (x, z) auf die Höhe `h` darunter (Bühnen-Terme sind analytisch, kein Rauschen). Höhen
    // sind relativ zur Basis (der Meeresspiegel liegt bei Basis − 3). Die Winkel-Größen (Sinus, Tangens) rechnet die
    // Normalform (`erbgutNormal`) EINMAL.
    function termY(t, h, x, z, L) {
        const base = L.baseHeight || 0;
        if (t.art === "insel") {
            // Plateau mit Kuppel (steigt zur Mitte, entwässert), dann der Schelf (smoothstep) bis zum Grund.
            const r = Math.hypot(x - t.x, z - t.z);
            if (r <= t.r) return base + t.plateau + t.kuppel * (t.r - r);
            const u = (r - t.r) / t.schelf;
            if (u >= 1) return base + t.grund;
            return base + t.plateau + (t.grund - t.plateau) * (u * u * (3 - 2 * u));
        }
        if (t.art === "rampe") {
            // Der Damm: längs der Falllinie (u) die Krone, beidseits der Lauf mit dem Winkel; quer (v) die Breite,
            // dahinter die Böschung. Addiert (≥ 0).
            const dx = x - t.x;
            const dz = z - t.z;
            const u = Math.abs(dx * t.ux + dz * t.uz) - t.krone * 0.5;
            let p = u > 0 ? t.hoehe - u * t.tanW : t.hoehe;
            if (p <= 0) return h;
            const w = Math.abs(dz * t.ux - dx * t.uz) - t.breite * 0.5;
            if (w > 0) p -= w * t.tanB;
            return p > 0 ? h + p : h;
        }
        // "bucht": die Rinne A → B (offene Mündung ins Meer), Sohle eben, quer die Ufer mit ihrem Winkel; längs eine
        // Furt-Schwelle (Krone über ihre Breite, Flanken mit tanF) und ein Kolk (Kosinus-Mulde). Schneidet (Minimum).
        let q = ((x - t.x0) * t.ex + (z - t.z0) * t.ez) / t.len2;
        if (q < 0) q = 0;
        else if (q > 1) q = 1;
        const d = Math.hypot(x - (t.x0 + t.ex * q), z - (t.z0 + t.ez * q));
        let g = base + t.grund;
        const f = Math.abs(q * t.len - t.furtLage) - t.furtBreite * 0.5;
        const furt = base + t.furtKrone - (f > 0 ? f * t.tanF : 0);
        if (furt > g) g = furt;
        const kd = Math.hypot(x - t.kolkX, z - t.kolkZ);
        if (kd < t.kolkR) g -= t.kolkTiefe * 0.5 * (1 + Math.cos((Math.PI * kd) / t.kolkR));
        const w = d - t.sohle * 0.5;
        const b = w > 0 ? g + w * t.tanU : g;
        return b < h ? b : h;
    }

    // DIE NORMALFORM DES ERBGUTS (`worldMeta.erbgut` roh → die Terme, die `hoehe` liest): die Zahlen geklemmt, die
    // Winkel-Größen EINMAL gerechnet (Sinus, Tangens, Kolk-Ort), oder ein Wurf mit dem Grund (fail-closed, nie still
    // Wildnis). Fehlt das Erbgut, ist die Welt [wildnis]. Leser: das Erwachen des Wirts (`_erbgut`), seine Eingangs-
    // Wände (`_erbgutEinlass`, `_erbgutTeilbar`) und das Studio (G2) — EINE Grammatik der Terme.
    function erbgutNormal(roh) {
        if (roh == null) return [{ art: "wildnis" }];
        const nein = (grund) => {
            throw new Error(`Erbgut abgelehnt: ${grund}`);
        };
        if (typeof roh !== "object" || !Array.isArray(roh.terme)) nein("keine Liste `terme`");
        if (roh.terme.length < 1 || roh.terme.length > 32) nein(`${roh.terme.length} Terme (1–32)`);
        const zahl = (t, k, lo, hi) => {
            const v = t[k];
            if (typeof v !== "number" || !Number.isFinite(v)) nein(`${t.art}.${k} ist keine Zahl`);
            return Math.min(hi, Math.max(lo, v));
        };
        const RAD = Math.PI / 180;
        return roh.terme.map((t, i) => {
            if (!t || typeof t !== "object") nein(`Term ${i} ist kein Objekt`);
            if (!["wildnis", "insel", "rampe", "bucht"].includes(t.art)) nein(`unbekannte Term-Art „${t.art}"`);
            const basis = t.art === "wildnis" || t.art === "insel";
            if (basis !== (i === 0)) nein(`Term ${i} (${t.art}): nur der erste Term setzt den Grund`);
            if (t.art === "wildnis") {
                // Die Regler des Gelände-Studios (LANDFORM_REGLER) reisen im Wildnis-Term — fehlt einer, gilt sein def.
                const w = { art: "wildnis" };
                for (const r of LANDFORM_REGLER) if (t[r.id] !== undefined) w[r.id] = zahl(t, r.id, r.min, r.max);
                return w;
            }
            if (t.art === "insel")
                return {
                    art: "insel",
                    x: zahl(t, "x", -1e5, 1e5),
                    z: zahl(t, "z", -1e5, 1e5),
                    r: zahl(t, "r", 10, 5000),
                    plateau: zahl(t, "plateau", -100, 200),
                    kuppel: zahl(t, "kuppel", 0, 0.05),
                    schelf: zahl(t, "schelf", 1, 1000),
                    grund: zahl(t, "grund", -120, 0),
                };
            if (t.art === "rampe") {
                const w = zahl(t, "winkel", 1, 60) * RAD;
                const a = zahl(t, "richtung", -360, 360) * RAD;
                const lauf = zahl(t, "lauf", 1, 500);
                return {
                    art: "rampe",
                    x: zahl(t, "x", -1e5, 1e5),
                    z: zahl(t, "z", -1e5, 1e5),
                    ux: Math.sin(a),
                    uz: Math.cos(a),
                    breite: zahl(t, "breite", 1, 500),
                    krone: zahl(t, "krone", 0, 500),
                    hoehe: lauf * Math.tan(w),
                    tanW: Math.tan(w),
                    tanB: Math.tan(zahl(t, "boeschung", 10, 80) * RAD),
                };
            }
            if (t.art === "bucht") {
                const x0 = zahl(t, "x0", -1e5, 1e5);
                const z0 = zahl(t, "z0", -1e5, 1e5);
                const ex = zahl(t, "x1", -1e5, 1e5) - x0;
                const ez = zahl(t, "z1", -1e5, 1e5) - z0;
                const len = Math.hypot(ex, ez);
                if (!(len >= 1)) nein("bucht: A und B fallen zusammen");
                const kolk = Math.min(len, zahl(t, "kolkLage", 0, 1e5)) / len;
                return {
                    art: "bucht",
                    x0,
                    z0,
                    ex,
                    ez,
                    len,
                    len2: ex * ex + ez * ez,
                    sohle: zahl(t, "sohle", 4, 500),
                    grund: zahl(t, "grund", -100, 50),
                    tanU: Math.tan(zahl(t, "ufer", 5, 60) * RAD),
                    furtLage: Math.min(len, zahl(t, "furtLage", 0, 1e5)),
                    furtBreite: zahl(t, "furtBreite", 0, 100),
                    furtKrone: zahl(t, "furtKrone", -50, 50),
                    tanF: Math.tan(zahl(t, "furtFlanke", 5, 60) * RAD),
                    kolkX: x0 + ex * kolk,
                    kolkZ: z0 + ez * kolk,
                    kolkR: zahl(t, "kolkR", 1, 100),
                    kolkTiefe: zahl(t, "kolkTiefe", 0, 30),
                };
            }
            return nein(`unbekannte Term-Art „${t.art}"`);
        });
    }

    // ══ DIE LANDFORM (K16) — der Wildnis-Term als Gesetz: Großform als Daten, das Flussnetz zuerst, das Schicht-Gesetz ══
    //
    // T1 GROSSFORM (Minecraft-1.18-Prinzip): drei glatte Felder — Kontinentalität C (λ ≈ 9 km), Erosion E (λ ≈ 3 km),
    //    Stil (λ ≈ 5 km) — laufen durch monotone Splines zu OFFSET (die Grundhöhe) und RELIEF (die Höhe der Hüllfläche
    //    über dem Talgrund). Die Hülle `E` ist glatt: Grate und Gipfel entstehen, wo sich die Talflanken treffen.
    // T2 FLUSSNETZ ZUERST (Dendry-/Génevaux-Prinzip, je Knoten memoisiert): drei Ebenen (1600 · 400 · 100 m). Ein Knoten
    //    der Ebene 0 fließt zum tiefsten Nachbarn der Grundhöhe K oder ist eine Senke (Meer oder benannter See); ein Knoten
    //    der Ebene k fließt zum tiefsten Nachbarn auf der Fläche der Ebene k−1 oder mündet ins Netz darüber. Die Sohle
    //    fällt monoton und folgt dem Stream-Power-Gesetz S = ks·A^−θ (A = Einzugsgebiet aus der Zahl der Oberlieger),
    //    das Querprofil ist z = Sohle + (Hülle − Sohle)·(1 − (1 − u^b)²) mit ebener Aue (b fluvial 1,3 … Trog 2).
    //    Die Fläche der Ebene k ist das Minimum der Talprofile über der Fläche k−1: ein Minimum erfindet keine Senke,
    //    die Sohlen fallen bis ins Meer oder in einen benannten See — die Welt entwässert.
    // T3 RINNEN UND GRATE: die Ebene 2 (100 m) ist das Rinnen-Netz; das Detail ist hang-begrenzt (Amplitude < halber
    //    Hang × λ/2π) und null in Rinne und Aue — es kehrt nie ein Gefälle um. (Der Erosions-Filter nach runevision
    //    fiel in der Wahl: seine Rinnen enden am Hang, ohne Abfluss-Garantie.)
    // T5 SCHICHT-GESETZ (Tafelland, Stil-Feld): das Talprofil wird die Treppe Pediment (0,5–7°) → Schutthang (Ruhewinkel
    //    33–37°) → Kliff (≥ 60°) → Bank, Schicht um Schicht bis zur Hülle — der Tafelberg ist ein Tal durch Schichten.
    //
    // Die Regler des Gelände-Studios sind genau die Parameter unten (`LANDFORM_REGLER`); die Welt trägt sie im Erbgut
    // (`{ art: "wildnis", …Regler }`, geklemmt in `erbgutNormal`) — EIN Gesetz für Studio und Welt.
    const LANDFORM_REGLER = Object.freeze([
        // KONTINENT
        { id: "land", gruppe: "kontinent", einheit: "1", min: -0.6, max: 0.9, step: 0.05, def: 0.35, law: "C-Versatz: Land-Anteil" },
        { id: "kontinentLambda", gruppe: "kontinent", einheit: "m", min: 3000, max: 24000, step: 500, def: 9000, law: "Wellenlänge der Kontinentalität" },
        { id: "hoehe", gruppe: "kontinent", einheit: "1", min: 0.2, max: 1.6, step: 0.05, def: 1, law: "Relief-Skala der Hülle" },
        { id: "rauhLambda", gruppe: "kontinent", einheit: "m", min: 1200, max: 9000, step: 100, def: 3200, law: "Wellenlänge des Erosions-Felds (Gebirge ↔ Ebene)" },
        // TÄLER
        { id: "netzDichte", gruppe: "taeler", einheit: "1", min: 0.6, max: 1.8, step: 0.05, def: 1, law: "Knotendichte des Flussnetzes (Ebene 0: 1600 m / Dichte)" },
        { id: "talForm", gruppe: "taeler", einheit: "1", min: 1, max: 2.2, step: 0.05, def: 1.3, law: "Querprofil-Exponent b (V 1 … Trog 2)" },
        { id: "trog", gruppe: "taeler", einheit: "1", min: 0, max: 1, step: 0.05, def: 0.7, law: "Trog-Anteil im Hochgebirge (b → 2)" },
        { id: "aue", gruppe: "taeler", einheit: "1", min: 0, max: 3, step: 0.05, def: 1, law: "Auen-Breite (∝ A^0,4)" },
        { id: "ks", gruppe: "taeler", einheit: "m^0,9", min: 1, max: 20, step: 0.5, def: 6, law: "Steilheits-Index ks (S = ks·A^−θ)" },
        { id: "theta", gruppe: "taeler", einheit: "1", min: 0.3, max: 0.7, step: 0.01, def: 0.45, law: "Flint-Konkavität θ" },
        // KLIFFS
        { id: "tafel", gruppe: "kliffs", einheit: "1", min: 0, max: 1, step: 0.05, def: 0.5, law: "Tafelland-Anteil (Stil-Feld)" },
        { id: "kliffWinkel", gruppe: "kliffs", einheit: "°", min: 60, max: 85, step: 1, def: 74, law: "Kliff der harten Schicht" },
        { id: "schuttWinkel", gruppe: "kliffs", einheit: "°", min: 30, max: 38, step: 0.5, def: 35, law: "Ruhewinkel des Schutthangs" },
        { id: "pedimentWinkel", gruppe: "kliffs", einheit: "°", min: 0.5, max: 7, step: 0.5, def: 2.5, law: "Neigung des Pediments" },
        { id: "schichtDicke", gruppe: "kliffs", einheit: "m", min: 8, max: 60, step: 1, def: 26, law: "Mächtigkeit einer Schicht" },
        { id: "hartAnteil", gruppe: "kliffs", einheit: "1", min: 0.3, max: 0.7, step: 0.05, def: 0.55, law: "Anteil der harten (kliffbildenden) Lage" },
        // RAUHEIT
        { id: "rinnen", gruppe: "rauheit", einheit: "1", min: 0, max: 1.5, step: 0.05, def: 1, law: "Rinnen-Netz (Ebene 2) — Einschnitt" },
        { id: "detail", gruppe: "rauheit", einheit: "1", min: 0, max: 1, step: 0.05, def: 0.6, law: "hang-begrenztes Detail" },
    ]);
    // Die Spline-Stützpunkte der Großform (monoton, Fritsch–Carlson): C → OFFSET m über der Basis (der Meeresspiegel liegt
    // bei Basis − 3), E → RELIEF m (E tief = Gebirge).
    const OFFSET_KNOTEN = Object.freeze([
        [-1, -48],
        [-0.55, -26],
        [-0.32, -8],
        [-0.2, 0],
        [0, 5],
        [0.3, 14],
        [0.6, 34],
        [1, 62],
    ]);
    const RELIEF_KNOTEN = Object.freeze([
        [-1, 175],
        [-0.55, 140],
        [-0.25, 82],
        [0, 40],
        [0.25, 16],
        [0.55, 5],
        [1, 2],
    ]);
    const NETZ_KANTE = Object.freeze([1600, 400, 100]);
    const AUE_QUER = 0.006;

    function splineTafel(knoten) {
        const n = knoten.length;
        const xs = knoten.map((k) => k[0]);
        const ys = knoten.map((k) => k[1]);
        const d = [];
        for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
        const m = new Array(n);
        m[0] = d[0];
        m[n - 1] = d[n - 2];
        for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
        for (let i = 0; i < n - 1; i++) {
            if (d[i] === 0) {
                m[i] = 0;
                m[i + 1] = 0;
                continue;
            }
            const a = m[i] / d[i];
            const b = m[i + 1] / d[i];
            const s = a * a + b * b;
            if (s > 9) {
                const t = 3 / Math.sqrt(s);
                m[i] = t * a * d[i];
                m[i + 1] = t * b * d[i];
            }
        }
        return { xs, ys, m };
    }
    function spline(T, x) {
        const xs = T.xs;
        const n = xs.length;
        if (x <= xs[0]) return T.ys[0];
        if (x >= xs[n - 1]) return T.ys[n - 1];
        let i = 0;
        while (x > xs[i + 1]) i++;
        const h = xs[i + 1] - xs[i];
        const t = (x - xs[i]) / h;
        const t2 = t * t;
        const t3 = t2 * t;
        return (
            (2 * t3 - 3 * t2 + 1) * T.ys[i] +
            (t3 - 2 * t2 + t) * h * T.m[i] +
            (-2 * t3 + 3 * t2) * T.ys[i + 1] +
            (t3 - t2) * h * T.m[i + 1]
        );
    }
    const OFFSET_SPLINE = splineTafel(OFFSET_KNOTEN);
    const RELIEF_SPLINE = splineTafel(RELIEF_KNOTEN);

    function saatHash(s) {
        let h = 2166136261;
        for (let i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return h >>> 0;
    }
    function zufall(sh, i, j, k) {
        let h = sh ^ Math.imul(i | 0, 0x27d4eb2d) ^ Math.imul(j | 0, 0x165667b1) ^ Math.imul((k | 0) + 1, 0x9e3779b1);
        h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
        h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
        h ^= h >>> 16;
        return (h >>> 0) / 4294967296;
    }
    const glatt = (a, b, v) => {
        let t = (v - a) / (b - a);
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        return t * t * (3 - 2 * t);
    };

    // Die Regler der Welt: die Normalform des Wildnis-Terms trägt sie (fehlt einer: sein def).
    function landformRegler(L) {
        const t0 = L.erbgut && L.erbgut.terme && L.erbgut.terme[0];
        const P = {};
        for (const r of LANDFORM_REGLER) P[r.id] = t0 && typeof t0[r.id] === "number" ? t0[r.id] : r.def;
        return P;
    }

    // DAS NETZ einer Welt (je Saat, Regler, Basis und Wasserspiegel): die memoisierten Knoten und Zellen-Listen. Reine
    // Ableitung — jeder Wert ist eine Funktion von (Saat, Regler, Ebene, Zelle), nie von der Reihenfolge der Fragen.
    const NETZE = new Map();
    // Der Heiß-Pfad (jede Spalte): die Lage merkt ihr Netz an der Identität ihrer Eingaben (Rausch-Strom, Erbgut-Normalform,
    // Basis, Wasser) — der Schlüssel-Text entsteht nur beim Wechsel.
    const LAGE_NETZ = new WeakMap();
    function netzFuer(L) {
        const noise = L.noise;
        const erbgut = L.erbgut;
        const base = L.baseHeight || 0;
        const wl = Number.isFinite(L.waterLevel) ? L.waterLevel : base + 4;
        const m = LAGE_NETZ.get(L);
        if (m && m.noise === noise && m.erbgut === erbgut && m.base === base && m.wl === wl) return m.N;
        const N = netzNeu(L, base, wl);
        LAGE_NETZ.set(L, { noise, erbgut, base, wl, N });
        return N;
    }
    function netzNeu(L, base, wl) {
        const P = landformRegler(L);
        let schl = L.seed + "|" + base + "|" + wl;
        for (const r of LANDFORM_REGLER) schl += "|" + P[r.id];
        const da = NETZE.get(schl);
        if (da && da.noise === L.noise) return da;
        if (NETZE.size >= 6) NETZE.delete(NETZE.keys().next().value);
        const N = {
            P,
            noise: L.noise,
            sh: saatHash(String(L.seed) + ":netz"),
            base,
            wl,
            S: NETZ_KANTE.map((s) => s / P.netzDichte),
            ebenen: P.rinnen > 0 ? 3 : 2,
            knoten: [new Map(), new Map(), new Map()],
            zellen: [new Map(), new Map(), new Map()],
            tp: Math.tan((P.pedimentWinkel * Math.PI) / 180),
            ts: Math.tan((P.schuttWinkel * Math.PI) / 180),
            tc: Math.tan((P.kliffWinkel * Math.PI) / 180),
            schicht: null, // die Schicht-Periode (`schichtMass`), einmal je Netz
        };
        NETZE.set(schl, N);
        return N;
    }

    // T1 — die Großform an (x, z): Grundhöhe K (sie lenkt das Netz der Ebene 0 und setzt Meer und Seen), Relief (die Hülle
    // über dem Talgrund), Hebung U (der Steilheits-Index der Flüsse: ks = ks₀·U), Stil (Tafelland), Trog-Gewicht.
    function grossform(N, x, z) {
        const n = N.noise;
        const P = N.P;
        const wx = x + warpX(n, x, z);
        const wz = z + warpZ(n, x, z);
        const lc = 1 / P.kontinentLambda;
        const c =
            (n.noise2D(wx * lc + 7.2, wz * lc + 3.8) + 0.45 * n.noise2D(wx * lc * 2.7 + 1.7, wz * lc * 2.7 - 6.1)) / 1.45 +
            P.land;
        const le = 1 / P.rauhLambda;
        const e = (n.noise2D(wx * le + 33.1, wz * le + 71.7) + 0.4 * n.noise2D(wx * le * 2.3 - 5.3, wz * le * 2.3 + 9.9)) / 1.4;
        const off = spline(OFFSET_SPLINE, c);
        const kueste = glatt(-0.28, 0.12, c);
        const rel = spline(RELIEF_SPLINE, e) * P.hoehe * (0.15 + 0.85 * kueste);
        const stilN = n.noise2D(wx * 0.000192 + 91.3, wz * 0.000192 + 5.9) * 0.5 + 0.5;
        // Das Tafelland ist ein Ort, kein Schleier: scharfe Grenze (0,05 im Stil-Feld), volle Kraft ab 45 m Relief.
        const stil = glatt(1 - P.tafel * 0.62, 1.05 - P.tafel * 0.62, stilN) * glatt(18, 45, rel) * (1 - glatt(160, 195, rel));
        return {
            off,
            rel,
            K: N.base + off + 0.3 * rel,
            U: 0.55 + rel / 240 + Math.max(0, off) / 160,
            stil,
            trog: glatt(95, 175, rel) * P.trog,
        };
    }

    function knoten(N, k, i, j) {
        const M = N.knoten[k];
        const key = i * 67108864 + j;
        let kn = M.get(key);
        if (kn) return kn;
        const S = N.S[k];
        kn = {
            k,
            i,
            j,
            x: (i + 0.15 + 0.7 * zufall(N.sh, i, j, 2 * k)) * S,
            z: (j + 0.15 + 0.7 * zufall(N.sh, i, j, 2 * k + 1)) * S,
            gf: null,
            hp: NaN,
            fluss: undefined, // der Unterlieger-Knoten, null = Mündung/Senke
            aus: null, // die Mündung ins Netz darüber { x, z, bed }
            senke: 0, // Ebene 0: 1 benannter See, 2 Meer
            A: 0,
            bed: NaN,
        };
        M.set(key, kn);
        return kn;
    }
    function knotenGf(N, kn) {
        if (!kn.gf) kn.gf = grossform(N, kn.x, kn.z);
        return kn.gf;
    }
    // Die Höhe, auf der ein Knoten seinen Unterlieger sucht: Ebene 0 die Grundhöhe K, Ebene k die Fläche der Ebene k−1.
    function knotenHp(N, kn) {
        if (kn.hp === kn.hp) return kn.hp;
        const gf = knotenGf(N, kn);
        kn.hp = kn.k === 0 ? gf.K : flaeche(N, kn.k - 1, kn.x, kn.z, gf, null);
        return kn.hp;
    }
    function knotenFluss(N, kn) {
        if (kn.fluss !== undefined) return kn.fluss;
        const h = knotenHp(N, kn);
        let best = null;
        let bh = h;
        for (let dj = -1; dj <= 1; dj++)
            for (let di = -1; di <= 1; di++) {
                if (!di && !dj) continue;
                const m = knoten(N, kn.k, kn.i + di, kn.j + dj);
                const mh = knotenHp(N, m);
                if (mh < bh) {
                    bh = mh;
                    best = m;
                }
            }
        kn.fluss = best;
        if (!best) {
            if (kn.k === 0) kn.senke = h < N.wl ? 2 : 1;
            else kn.aus = muendung(N, kn.k - 1, kn.x, kn.z);
        }
        return best;
    }
    // Die Oberlieger-Zahl (Einzugsgebiet in Knoten-Zellen): 1 + die Summe der Nachbarn, die hierher fließen.
    function knotenA(N, kn) {
        if (kn.A) return kn.A;
        kn.A = 1; // Zyklus-Wache (Fluss ist streng fallend — greift nie)
        let a = 1;
        for (let dj = -1; dj <= 1; dj++)
            for (let di = -1; di <= 1; di++) {
                if (!di && !dj) continue;
                const m = knoten(N, kn.k, kn.i + di, kn.j + dj);
                if (knotenFluss(N, m) === kn) a += knotenA(N, m);
            }
        kn.A = a;
        return a;
    }
    // Die Sohle eines Knotens: dem Gelände folgen (Ebene k ≥ 1 mit Mindest-Einschnitt), aber nie steiler als das Stream-
    // Power-Gesetz erlaubt und nie flacher als 0,04 % über dem Unterlieger — monoton fallend bis zur Senke.
    function knotenSohle(N, kn) {
        if (kn.bed === kn.bed) return kn.bed;
        const pfad = [];
        let c = kn;
        while (c.bed !== c.bed) {
            pfad.push(c);
            const f = knotenFluss(N, c);
            if (!f) break;
            c = f;
        }
        for (let p = pfad.length - 1; p >= 0; p--) {
            const q = pfad[p];
            const hp = knotenHp(N, q);
            const f = q.fluss;
            if (q.k === 0 && (!f || hp < N.wl)) {
                // Senke (benannter See: ihre Grundhöhe) oder Meer (die Bathymetrie der Grundhöhe, kein Fluss-Gesetz)
                q.bed = hp < N.wl ? Math.min(hp, N.wl - 2) : hp;
                continue;
            }
            const tx = f ? f.x : q.aus.x;
            const tz = f ? f.z : q.aus.z;
            const tb = f ? f.bed : q.aus.bed;
            const len = Math.hypot(tx - q.x, tz - q.z) || 1;
            const gf = knotenGf(N, q);
            const ks = N.P.ks * gf.U;
            const S = N.S[q.k];
            const lo = tb + 0.0004 * len;
            // Der Hang längs der Verbindung (Oberfläche zu Oberfläche; die Mündung: zur Sohle darüber).
            const hang = Math.max(0, (hp - (f ? knotenHp(N, f) : tb)) / len);
            let b;
            if (q.k === 0) {
                // EBENE 0 — die Höhe ENTSTEHT: die Sohle steigt von der Mündung (Meeresspiegel) oder dem See stromauf mit
                // S = ks·U·A^−θ (konkav: das Gefälle fällt mit dem Einzugsgebiet) — die Großform setzt Hebung und Senken.
                const sMax = ks * Math.pow(knotenA(N, q) * S * S, -N.P.theta);
                b = Math.max(tb, N.wl - 0.5) + Math.max(0.0004, sMax) * len;
            } else if (q.k === 2) {
                // Ebene 2 ist Hang-Domäne (A < 0,1 km²): die Rinne folgt dem Hang, ihr Einschnitt wächst mit ihm (≤ 0,22 ×
                // Hang × Knoten-Kante — nie tiefer, als der Hang je Raster-Schritt fällt: keine Rinne wird zur Grube).
                b = hp - N.P.rinnen * Math.min(1 + 0.03 * gf.rel, 0.15 * hang * S) * (1 - gf.stil);
            } else {
                const sMax = ks * Math.pow(knotenA(N, q) * S * S, -N.P.theta);
                b = hp - (q.k === 1 ? Math.min(2 + 0.05 * gf.rel, 0.25 * hang * S) * (1 - gf.stil) : 0);
                if (b > tb + sMax * len) b = tb + sMax * len;
                // Die Kerbe der Ebene 1 bleibt ein Tal (Tiefe ≤ 0,8 Flanken-Breite), nie ein Schlitz.
                if (q.k === 1 && b < hp - 0.18 * S) b = hp - 0.18 * S;
            }
            // Im Tafelland schneiden die Ebenen 1 und 2 nicht ein (die Treppe der Ebene 0 bleibt Kliff, eine Rinne schliffe es).
            if (q.k > 0 && gf.stil > 0) b += (hp - b) * gf.stil;
            if (b < lo) b = lo;
            q.bed = b;
        }
        return kn.bed;
    }

    // Das Talprofil eines Segments (Ebene, Auen-Breite F, Flanken-Breite W, Form b, Stil) — die Segmente einer Knoten-Zelle
    // sind die, deren Reichweite (F + W, im Tafelland die Schicht-Treppe) die Zelle berührt.
    function segment(N, kn) {
        knotenFluss(N, kn);
        const bed = knotenSohle(N, kn);
        if (kn.k === 0 && !kn.fluss) return null;
        const t = kn.fluss || kn.aus;
        const gf = knotenGf(N, kn);
        const P = N.P;
        const S = N.S[kn.k];
        const Am2 = knotenA(N, kn) * S * S;
        const ex = t.x - kn.x;
        const ez = t.z - kn.z;
        const F = kn.k === 0 ? P.aue * 30 * Math.pow(Am2 / 1e6, 0.4) : kn.k === 1 ? P.aue * 16 * Math.pow(Am2 / 1e5, 0.45) : 3;
        const W = (kn.k === 0 ? 0.36 : kn.k === 1 ? 0.3 : 0.34) * S * (0.85 + 0.3 * zufall(N.sh, kn.i, kn.j, 40 + kn.k));
        const b = kn.k === 0 ? P.talForm + (2 - P.talForm) * gf.trog : kn.k === 1 ? P.talForm + 0.3 : 1.2;
        const stil = kn.k === 0 ? gf.stil : 0;
        let reach = F + W;
        if (stil > 0.001) {
            const M = schichtMass(N);
            reach = Math.max(reach, F + 140 + Math.ceil((gf.rel + 40) / M.T) * M.per);
        }
        return {
            ax: kn.x,
            az: kn.z,
            ex,
            ez,
            len2: ex * ex + ez * ez || 1,
            ba: bed,
            bb: t.bed,
            F,
            W,
            b,
            stil,
            reach,
            von: kn, // der Knoten des Segments (eine Mündung darauf ist ein Zufluss, keine Senke: `flussLaeufe`)
        };
    }
    function zelle(N, k, ci, cj) {
        const M = N.zellen[k];
        const key = ci * 67108864 + cj;
        let z = M.get(key);
        if (z) return z;
        const S = N.S[k];
        const x0 = ci * S;
        const z0 = cj * S;
        const r = k === 0 ? 2 : 3;
        z = [];
        for (let j = cj - r; j <= cj + r; j++)
            for (let i = ci - r; i <= ci + r; i++) {
                const s = segment(N, knoten(N, k, i, j));
                if (!s) continue;
                // Abstand Segment ↔ Zellen-Rechteck (konservativ: Abstand der Segment-Box)
                const mnx = Math.min(s.ax, s.ax + s.ex) - s.reach;
                const mxx = Math.max(s.ax, s.ax + s.ex) + s.reach;
                const mnz = Math.min(s.az, s.az + s.ez) - s.reach;
                const mxz = Math.max(s.az, s.az + s.ez) + s.reach;
                if (mxx < x0 || mnx > x0 + S || mxz < z0 || mnz > z0 + S) continue;
                z.push(s);
            }
        if (M.size > 300000) M.clear();
        M.set(key, z);
        return z;
    }
    // DIE SCHICHT-PERIODE (T5) — EINE Quelle für Treppe, Reichweite und Schicht-Ort: eine Schicht der Mächtigkeit T ist die
    // weiche Lage (Schutthang am Ruhewinkel), die harte Lage (`hartAnteil` · T am Kliff-Winkel) und die Bank (T/2). Monument
    // Valley: das Kliff des de-Chelly-Sandsteins über dem Schutthang des Organ-Rock-Schiefers, je etwa die Hälfte.
    function schichtMass(N) {
        if (N.schicht) return N.schicht;
        const T = N.P.schichtDicke;
        const hc = N.P.hartAnteil * T;
        const hs = T - hc;
        const wS = hs / N.ts;
        const wC = hc / N.tc;
        const wB = 0.5 * T;
        N.schicht = { T, hs, hc, wS, wC, wB, per: wS + wC + wB };
        return N.schicht;
    }
    // Der Anstieg der Schicht-Treppe über die Distanz u jenseits der Aue: Pediment, dann je Schicht Schutthang, Kliff und
    // eine Bank (`schichtMass`).
    function treppe(N, u) {
        const ped = 140;
        if (u <= ped) return u * N.tp;
        let r = u - ped;
        const M = schichtMass(N);
        const tb = N.tp * 0.5;
        const L = Math.floor(r / M.per);
        r -= L * M.per;
        let h = ped * N.tp + L * (M.T + M.wB * tb);
        if (r < M.wS) return h + r * N.ts;
        h += M.hs;
        r -= M.wS;
        if (r < M.wC) return h + r * N.tc;
        return h + M.hc + (r - M.wC) * tb;
    }
    // Die Neigung der Schicht-Treppe an u (dieselben Abschnitte wie `treppe`): Pediment, Schutthang, Kliff, Bank.
    function treppeHang(N, u) {
        if (u <= 140) return N.tp;
        const M = schichtMass(N);
        let r = (u - 140) % M.per;
        if (r < M.wS) return N.ts;
        r -= M.wS;
        return r < M.wC ? N.tc : N.tp * 0.5;
    }
    // DER TALGRUND an (x, z): die Sohlen der Ebene-0-Knoten, stetig gemittelt (Gewicht (1 − d²/R²)², R = 1,6 Kanten) — die
    // Basis der Hülle (Talgrund + Relief): die Gipfel stehen über IHREM Tal, nie über einer erfundenen Ebene.
    function talgrund(N, x, z) {
        const S = N.S[0];
        const R = 1.6 * S;
        const R2 = R * R;
        const ci = Math.floor(x / S);
        const cj = Math.floor(z / S);
        let sw = 0;
        let sb = 0;
        for (let j = cj - 2; j <= cj + 2; j++)
            for (let i = ci - 2; i <= ci + 2; i++) {
                const kn = knoten(N, 0, i, j);
                const dx = x - kn.x;
                const dz = z - kn.z;
                const q = 1 - (dx * dx + dz * dz) / R2;
                if (q <= 0) continue;
                const w = q * q;
                sw += w;
                sb += w * knotenSohle(N, kn);
            }
        return sw > 0 ? sb / sw : N.base + grossform(N, x, z).K;
    }

    // DIE FLÄCHE der Ebenen 0..kmax an (x, z): ausgehend von der Hülle das Minimum der Talprofile je Ebene. `aus` (optional)
    // sammelt den Hang-Schätzer (die steilste gewählte Flanke) und die Tal-Nähe für das Detail.
    function flaeche(N, kmax, x, z, gf, aus) {
        let H = talgrund(N, x, z) + gf.rel;
        let steil = 0;
        let nah = 1;
        let hang = 0;
        for (let k = 0; k <= kmax; k++) {
            const S = N.S[k];
            const segs = zelle(N, k, Math.floor(x / S), Math.floor(z / S));
            let Hk = H;
            let kSteil = 0;
            let kNah = 1;
            let kHang = 0;
            for (let q = 0; q < segs.length; q++) {
                const s = segs[q];
                const dx = x - s.ax;
                const dz = z - s.az;
                let t = (dx * s.ex + dz * s.ez) / s.len2;
                t = t < 0 ? 0 : t > 1 ? 1 : t;
                const px = dx - s.ex * t;
                const pz = dz - s.ez * t;
                const d2 = px * px + pz * pz;
                if (d2 >= s.reach * s.reach) continue;
                const bed = s.ba + (s.bb - s.ba) * t;
                if (bed >= Hk) continue;
                const d = Math.sqrt(d2);
                const u = d - s.F;
                let v;
                let g = 0;
                let w = 0;
                // die Neigung des Profils quer zur Rinne (mit der Treppe gemischt) — der Hang der gewählten Fläche
                let gh = 0;
                // Die Aue fällt quer 0,6 % zur Rinne (das Wasser sammelt sich im Bett, nie in der Fläche).
                if (u <= 0) v = bed + AUE_QUER * d;
                else {
                    const sohle = bed + AUE_QUER * s.F;
                    w = u / s.W;
                    if (w >= 1) v = H;
                    else {
                        const p = Math.pow(w, s.b);
                        v = sohle + (H - sohle) * (1 - (1 - p) * (1 - p));
                        g = ((H - sohle) * 2 * (1 - p) * s.b * (p / w)) / s.W;
                    }
                    gh = g;
                    if (s.stil > 0.001) {
                        const tr = treppe(N, u);
                        const vs = sohle + (tr < H - sohle ? tr : H - sohle);
                        v += (vs - v) * s.stil;
                        gh = g * (1 - s.stil) + (tr < H - sohle ? treppeHang(N, u) : 0) * s.stil;
                    }
                }
                if (v < Hk) {
                    Hk = v;
                    kSteil = g;
                    kNah = w < 1 ? w : 1;
                    kHang = gh;
                }
            }
            if (Hk < H) {
                if (kSteil > steil) steil = kSteil;
                if (kNah < nah) nah = kNah;
                hang = kHang;
            }
            H = Hk;
        }
        if (aus) {
            aus.steil = steil;
            aus.nah = nah;
            aus.hang = hang;
        }
        return H;
    }
    // Die Mündung eines Knotens der Ebene k+1 ins Netz der Ebene k: der Segment-Punkt, der die Fläche an (x, z) am tiefsten
    // trägt (Sohle + Profil), mit seiner Sohle.
    function muendung(N, k, x, z) {
        const S = N.S[k];
        const segs = zelle(N, k, Math.floor(x / S), Math.floor(z / S));
        let best = null;
        let bv = Infinity;
        for (let q = 0; q < segs.length; q++) {
            const s = segs[q];
            const dx = x - s.ax;
            const dz = z - s.az;
            let t = (dx * s.ex + dz * s.ez) / s.len2;
            t = t < 0 ? 0 : t > 1 ? 1 : t;
            const d = Math.hypot(dx - s.ex * t, dz - s.ez * t);
            const bed = s.ba + (s.bb - s.ba) * t;
            const v = bed + d * 0.05;
            if (v < bv) {
                bv = v;
                best = { x: s.ax + s.ex * t, z: s.az + s.ez * t, bed, von: s.von };
            }
        }
        if (best) return best;
        // Keine Ebene-k-Rinne in Reichweite (nur Ebene 0 an einer Senke): die Senke selbst.
        const kn = knoten(N, k, Math.floor(x / S), Math.floor(z / S));
        return { x: kn.x, z: kn.z, bed: knotenSohle(N, kn) };
    }

    // (a) Der Domain-Warp der Großform — verschobene Sample-Koordinaten (λ ≈ 3900 m, ±70 m Versatz).
    function warpX(n, x, z) {
        return n.noise2D(x * 0.00026 + 11.3, z * 0.00026 + 4.1) * 70;
    }
    function warpZ(n, x, z) {
        return n.noise2D(x * 0.00026 + 41.7, z * 0.00026 + 23.9) * 70;
    }
    // DIE SCHNEEGRENZE (K16): Schnee liegt nach der Höhe über dem Meer (die Temperatur fällt mit der Höhe), nie nach
    // einer Prominenz über einer erfundenen Basis — die Prominenz über dem OFFSET weißte jeden 85-m-Hügel (12–22 % des
    // Landes über 50 m Prominenz). Die Landform trägt Gipfel bis ~200 m über dem Meer; die Grenze 140 → 185 m legt
    // Schnee auf die obersten 1–3 % des Landes. Leser: die Boden-Farbe (Stamm `_bodenFarbeAt`, Worker
    // `attachFieldColors`) — der Anteil 0…1 an der Höhe y.
    const SCHNEE = Object.freeze({ start: 140, voll: 185 });
    function schnee(L, y) {
        const wl = Number.isFinite(L.waterLevel) ? L.waterLevel : (L.baseHeight || 0) - 3;
        return glatt(SCHNEE.start, SCHNEE.voll, y - wl);
    }

    function wildnisY(L, x, z, mitDetail, aus) {
        const N = netzFuer(L);
        const n = L.noise;
        const base = N.base;
        const gf = grossform(N, x, z);
        const mess = { steil: 0, nah: 1, hang: 0 };
        let h = flaeche(N, N.ebenen - 1, x, z, gf, mess);
        if (aus) aus.hang = mess.hang;
        // T3 — das hang-begrenzte Detail (λ 38 m und 17 m): Amplitude < ½ Hang × λ/2π, null in Rinne und Aue.
        if (mitDetail && N.P.detail > 0 && mess.steil > 0.02) {
            const amp = N.P.detail * Math.min(3, mess.steil) * glatt(0.05, 0.45, mess.nah);
            if (amp > 0.001)
                h += amp * (n.noise2D(x * 0.0263 + 3.1, z * 0.0263 - 7.7) * 2.6 + n.noise2D(x * 0.059 - 1.3, z * 0.059 + 5.2) * 1.0);
        }
        // Der Sicherheits-Deckel bei 255 (tanh-Asymptote < Voxel-Decke 282,6).
        if (h > 255) h = 255 + 12 * Math.tanh((h - 255) / 12);
        // Ozean-Tiefe in Schichten (Schelf unberührt, Kontinentalhang, Variation nach Tiefe) — keine Phantom-Inseln.
        const waterRefSub = N.wl;
        const depthBelow = waterRefSub - h;
        if (depthBelow > 1.5) {
            const subMask = Math.min(1, Math.max(0, (depthBelow - 3) / 6));
            const slope = Math.max(0, depthBelow - 4);
            const slopeDrop = -slope * 0.6;
            const subA = n.noise2D(x * 0.019, z * 0.019 + 31) * (3 + slope * 0.3);
            const rBN = n.noise2D(x * 0.026 + 17, z * 0.026 + 9);
            const subRidge = ((1 - Math.abs(rBN)) * (1 - Math.abs(rBN)) - 0.3) * (3 + slope * 0.25);
            const subC = n.noise2D(x * 0.062 - 17, z * 0.062 + 8) * 1.0;
            h += slopeDrop + (subA + subRidge + subC) * subMask;
        }
        // Sanfter Tiefsee-Clamp (Asymptote base−120) über dem Chunk-Boden (−135).
        const abyssClamp = base - 112;
        if (h < abyssClamp) h = abyssClamp - 8 * Math.tanh((abyssClamp - h) / 8);
        return h;
    }

    // Die benannten Seen eines Rasters (Zellen-Indizes): die Senken-Knoten der Ebene 0 auf Land. Leser: die
    // Gelände-Linse (eine Senke, die einen benannten See trägt, zählt nicht).
    function benannteSeen(L, x0, z0, step, n) {
        const N = netzFuer(L);
        const S = N.S[0];
        const out = [];
        const idx = (x, z) => {
            const i = Math.round((x - x0) / step);
            const j = Math.round((z - z0) / step);
            return i >= 0 && j >= 0 && i < n && j < n ? i + j * n : -1;
        };
        const x1 = x0 + (n - 1) * step;
        const z1 = z0 + (n - 1) * step;
        for (let j = Math.floor(z0 / S) - 1; j <= Math.floor(z1 / S) + 1; j++)
            for (let i = Math.floor(x0 / S) - 1; i <= Math.floor(x1 / S) + 1; i++) {
                const kn = knoten(N, 0, i, j);
                knotenFluss(N, kn);
                if (kn.senke === 1) {
                    const k = idx(kn.x, kn.z);
                    if (k >= 0) out.push(k);
                }
            }
        return out;
    }
    // DAS WASSER LIEST DAS NETZ (K16): die Fluss-Läufe der Ebenen 0 und 1, die das Rechteck [x0, x1) × [z0, z1) berühren —
    // dasselbe Netz, das die Täler schneidet; die Hydrosphäre rechnet kein zweites. Ein Lauf beginnt an einer Quelle (ein
    // Knoten ohne Oberlieger seiner Ebene: `quelle`) oder, liegen alle Oberlieger jenseits der Reichweite, an ihrem Rand,
    // und folgt dem Unterlieger bis zur Mündung ins Netz der Ebene 0 (`ende` "muendung": ein Zufluss endet auf der Rinne des
    // Hauptlaufs, jedes Glied gehört EINEM Lauf), zur Senke ("see" ein benannter See, "meer") oder jenseits der Reichweite
    // ("rand"). Je Glied die Enden, die Sohlen (`knotenSohle`, stromab streng fallend) und das Einzugsgebiet A in m². Ohne
    // Wildnis-Term (eine Bühne): [].
    function flussLaeufe(L, x0, z0, x1, z1) {
        const T = L.erbgut && L.erbgut.terme;
        if (!T || !T.length || T[0].art !== "wildnis") return [];
        const N = netzFuer(L);
        const drin = (kn) => {
            const S = 2 * N.S[kn.k];
            return kn.x >= x0 - S && kn.x < x1 + S && kn.z >= z0 - S && kn.z < z1 + S;
        };
        const glied = (kn) => {
            const f = knotenFluss(N, kn);
            const t = f || kn.aus;
            return {
                ax: kn.x,
                az: kn.z,
                bx: t.x,
                bz: t.z,
                ba: knotenSohle(N, kn),
                bb: f ? knotenSohle(N, f) : t.bed,
                A: knotenA(N, kn) * N.S[kn.k] * N.S[kn.k],
            };
        };
        const laeufe = [];
        for (let k = 0; k <= 1; k++) {
            const S = N.S[k];
            for (let j = Math.floor((z0 - 2 * S) / S) - 1; j <= Math.floor((z1 + 2 * S) / S) + 1; j++)
                for (let i = Math.floor((x0 - 2 * S) / S) - 1; i <= Math.floor((x1 + 2 * S) / S) + 1; i++) {
                    const kn = knoten(N, k, i, j);
                    if (!drin(kn)) continue;
                    let oben = 0;
                    let obenDrin = 0;
                    for (let dj = -1; dj <= 1; dj++)
                        for (let di = -1; di <= 1; di++) {
                            if (!di && !dj) continue;
                            const m = knoten(N, k, i + di, j + dj);
                            if (knotenFluss(N, m) !== kn) continue;
                            oben++;
                            if (drin(m)) obenDrin++;
                        }
                    if (obenDrin) continue;
                    const glieder = [];
                    let ende = "rand";
                    let c = kn;
                    for (let g = 0; g < 256; g++) {
                        const f = knotenFluss(N, c);
                        if (!f && c.k === 0) {
                            ende = c.senke === 2 ? "meer" : "see";
                            break;
                        }
                        glieder.push(glied(c));
                        if (!f) {
                            // die Mündung des Zuflusses auf der Rinne der Ebene 0 — oder die Senke selbst (keine Rinne in Reichweite)
                            ende = c.aus.von ? "muendung" : "see";
                            break;
                        }
                        if (!drin(f)) break;
                        c = f;
                    }
                    if (glieder.length) laeufe.push({ k, quelle: oben === 0, glieder, ende });
                }
        }
        return laeufe;
    }
    // Der Schicht-Ort eines Feldes: die Mitte der Treppe am stärksten Tafelland-Tal (ein Ebene-0-Segment mit Stil, von
    // seiner Rinne quer um Aue + Pediment + drei Schichten versetzt) — Leser: die Gelände-Linse (Schicht-Gesetz) und das
    // Studio (der Blick auf die Tafelberge). Ohne Tafelland-Tal: null.
    function schichtOrt(L, x0, z0, x1, z1) {
        const N = netzFuer(L);
        const S = N.S[0];
        const per = schichtMass(N).per;
        let best = null;
        let bw = 0;
        for (let j = Math.floor(z0 / S); j <= Math.floor(z1 / S); j++)
            for (let i = Math.floor(x0 / S); i <= Math.floor(x1 / S); i++) {
                const sg = segment(N, knoten(N, 0, i, j));
                if (!sg || sg.stil < 0.8) continue;
                const len = Math.sqrt(sg.len2);
                const off = sg.F + 140 + 3 * per;
                for (const seite of [1, -1]) {
                    const x = sg.ax + sg.ex * 0.5 - (seite * sg.ez * off) / len;
                    const z = sg.az + sg.ez * 0.5 + (seite * sg.ex * off) / len;
                    if (x < x0 || x > x1 || z < z0 || z > z1) continue;
                    const gf = grossform(N, x, z);
                    const w = sg.stil * gf.stil * Math.min(gf.rel, 120);
                    if (w > bw) {
                        bw = w;
                        best = { x: Math.round(x), z: Math.round(z), stil: Math.round(gf.stil * 1000) / 1000 };
                    }
                }
            }
        return best;
    }

    // DER ERDBAU (K10, der Ort auf dem Gelände): die Splats eines Siedlungs-Plans v2 (fachwerk `ortPlan` — `platte` {cx, cz,
    // phi, ex, ez, y} und `trasse` {x0, z0, y0, x1, z1, y1, w}, absolut) legen sich als letzter Term auf die Höhe: innen die
    // Höhe des Plans, außen die Böschung (`boeschung` = tan, Abtrag wie Auftrag) bis zur Reichweite — h' = clamp(h, y − d·b,
    // y + d·b), d der Abstand zur Fläche des Splats, in der Reihenfolge des Plans. AUF einer Fläche (d = 0) gilt ihre Höhe
    // allein (die letzte gewinnt, wo sie sich decken): keine Böschung eines Nachbarn schneidet in einen Grundriss.
    // Der Rahmen einer Platte ist der des Hauses (welt = mitte + (lx·c + lz·s, −lx·s + lz·c)). Ohne Erdbau kostet der Term
    // eine Feld-Probe (`L.erdbau`), die Welt bleibt byte-gleich. Leser: `hoehe` (Stamm, voxel-worker, Foundry-Worker).
    const ERDBAU = Object.freeze({ boeschung: 0.6, reichweiteM: 16, zelleM: 16 });
    const ERDBAU_ZAHL = ["cx", "cz", "phi", "ex", "ez", "y"];
    const TRASSE_ZAHL = ["x0", "z0", "y0", "x1", "z1", "y1", "w"];
    // Die NORMALFORM des Erdbaus: roh = die Splat-Liste (der Wirt fügt die Pläne seiner Orte in ihrer Reihenfolge an) →
    // { n, splats, zellen } mit einem Raster der Kante `zelleM` (je Zelle die Splats, deren Reichweite sie berührt). Fail-
    // closed: eine fremde Art oder eine fehlende Zahl wirft. Leer → null (der Term ruht).
    function erdbauNormal(roh) {
        if (roh == null) return null;
        if (!Array.isArray(roh)) throw new Error("gelaende-core: der Erdbau ist keine Liste");
        if (!roh.length) return null;
        const R = ERDBAU.reichweiteM;
        const Z = ERDBAU.zelleM;
        const splats = [];
        const zellen = new Map();
        for (let i = 0; i < roh.length; i++) {
            const p = roh[i];
            const art = p && p.art;
            const namen = art === "platte" ? ERDBAU_ZAHL : art === "trasse" ? TRASSE_ZAHL : null;
            if (!namen) throw new Error("gelaende-core: Erdbau-Splat " + i + " trägt die fremde Art " + art);
            for (const k of namen)
                if (!Number.isFinite(p[k])) throw new Error("gelaende-core: Erdbau-Splat " + i + " ohne Zahl " + k);
            let s;
            let x0;
            let x1;
            let z0;
            let z1;
            if (art === "platte") {
                const c = Math.cos(p.phi);
                const sn = Math.sin(p.phi);
                s = { platte: true, cx: p.cx, cz: p.cz, c, s: sn, ex: p.ex, ez: p.ez, y: p.y };
                const hx = Math.abs(p.ex * c) + Math.abs(p.ez * sn) + R;
                const hz = Math.abs(p.ex * sn) + Math.abs(p.ez * c) + R;
                x0 = p.cx - hx;
                x1 = p.cx + hx;
                z0 = p.cz - hz;
                z1 = p.cz + hz;
            } else {
                const dx = p.x1 - p.x0;
                const dz = p.z1 - p.z0;
                const len2 = dx * dx + dz * dz;
                if (p.weg != null && !Number.isFinite(p.weg))
                    throw new Error("gelaende-core: Erdbau-Splat " + i + " trägt keinen Weg als Zahl");
                const weg = p.weg == null ? -1 : p.weg;
                s = { platte: false, x0: p.x0, z0: p.z0, dx, dz, len2, y0: p.y0, dy: p.y1 - p.y0, hw: p.w / 2, weg };
                const m = p.w / 2 + R;
                x0 = Math.min(p.x0, p.x1) - m;
                x1 = Math.max(p.x0, p.x1) + m;
                z0 = Math.min(p.z0, p.z1) - m;
                z1 = Math.max(p.z0, p.z1) + m;
            }
            splats.push(s);
            for (let a = Math.floor(x0 / Z); a <= Math.floor(x1 / Z); a++)
                for (let b = Math.floor(z0 / Z); b <= Math.floor(z1 / Z); b++) {
                    const key = (a + 32768) * 65536 + (b + 32768);
                    const liste = zellen.get(key);
                    if (liste) liste.push(i);
                    else zellen.set(key, [i]);
                }
        }
        return { n: splats.length, splats, zellen };
    }
    // Der Erdbau an (x, z) über der Höhe h (die Normalform E, `erdbauNormal`).
    function erdbauY(E, x, z, h) {
        const Z = ERDBAU.zelleM;
        const liste = E.zellen.get((Math.floor(x / Z) + 32768) * 65536 + (Math.floor(z / Z) + 32768));
        if (!liste) return h;
        const R = ERDBAU.reichweiteM;
        const B = ERDBAU.boeschung;
        let fest = NaN; // die Fläche, auf der der Punkt liegt (der letzte Splat mit d = 0): ihre Höhe ist Gesetz
        let festWeg = -2; // der Weg der Fläche (die Strecken EINES Wegs folgen einander: unter ihnen gilt die nächste Mitte)
        let festMitte = Infinity;
        for (let k = 0; k < liste.length; k++) {
            const p = E.splats[liste[k]];
            let d;
            let y;
            let mitte = 0;
            if (p.platte) {
                const dx = x - p.cx;
                const dz = z - p.cz;
                const u = Math.abs(dx * p.c - dz * p.s) - p.ex;
                const v = Math.abs(dx * p.s + dz * p.c) - p.ez;
                d = u > 0 ? (v > 0 ? Math.hypot(u, v) : u) : v > 0 ? v : 0;
                y = p.y;
            } else {
                let q = p.len2 > 0 ? ((x - p.x0) * p.dx + (z - p.z0) * p.dz) / p.len2 : 0;
                if (q < 0) q = 0;
                else if (q > 1) q = 1;
                mitte = Math.hypot(x - (p.x0 + p.dx * q), z - (p.z0 + p.dz * q));
                d = mitte - p.hw;
                if (d < 0) d = 0;
                y = p.y0 + p.dy * q;
            }
            if (d > R) continue;
            if (d === 0) {
                // auf EINEM Weg (dieselbe Weg-Zahl wie die Fläche davor) trägt die Strecke mit der nächsten Mitte — an den Gelenken
                // überdecken sich die Strecken, und die spätere trüge sonst die Höhe ihres Anfangs (eine Treppe längs des Wegs)
                if (!p.platte && p.weg >= 0 && p.weg === festWeg) {
                    if (mitte < festMitte) {
                        fest = y;
                        festMitte = mitte;
                    }
                } else {
                    fest = y;
                    festWeg = p.platte ? -2 : p.weg;
                    festMitte = p.platte ? Infinity : mitte;
                }
                continue;
            }
            const b = d * B;
            if (h > y + b) h = y + b;
            else if (h < y - b) h = y - b;
        }
        return fest === fest ? fest : h;
    }
    // Die FLÄCHE des Erdbaus an (x, z): die Höhe der Fläche, auf der der Punkt liegt (dieselbe Regel wie `erdbauY`: die letzte
    // gewinnt), oder null abseits jeder Fläche. Leser: der Plan v2 (fachwerk `ortPlan` über ctx.flaeche — Haus und Laterne
    // stehen auf der Höhe, auf die ein Fuß tritt).
    function erdbauFlaeche(E, x, z) {
        if (!E) return null;
        const y = erdbauY(E, x, z, NaN);
        return y === y ? y : null;
    }

    // DIE EINE 2D-HÖHE der Welt = der Term-Auswerter ihres Erbguts: der erste Term setzt den Startwert (die Wildnis oder
    // eine Insel), jeder weitere legt sich nach seiner Art darauf — die Rampe addiert, die Bucht schneidet (Minimum).
    // Eine Welt ohne Erbgut trägt [wildnis]. Fehlt der Lage ihr Erbgut, wirft der Auswerter (fail-closed, nie still
    // Wildnis). Leser: jeder Leser der Höhe (Dichte, Hydrosphäre, Fern-Ring, Spawn-Ort) in Stamm und Worker.
    // `aus` (optional) trägt den Hang der Wildnis-Fläche (tan, `flaeche`) — ein Term darüber, der die Höhe ändert, nimmt
    // ihn (0: kein Hang-Urteil, wo Insel, Rampe oder Bucht formen).
    function hoehe(L, x, z, mitDetail = true, aus) {
        const T = L.erbgut.terme;
        const t0 = T[0];
        if (aus) aus.hang = 0;
        let h = t0.art === "wildnis" ? wildnisY(L, x, z, mitDetail, aus) : termY(t0, 0, x, z, L);
        for (let i = 1; i < T.length; i++) {
            const h2 = termY(T[i], h, x, z, L);
            if (aus && h2 !== h) aus.hang = 0;
            h = h2;
        }
        // der Erdbau der Orte (K10) liegt als letzter Term auf allem: der Ort vor dem Hang
        const E = L.erdbau;
        if (E) {
            const h2 = erdbauY(E, x, z, h);
            if (aus && h2 !== h) aus.hang = 0;
            h = h2;
        }
        return h;
    }

    // DIE HÖHLEN-MÜNDUNG (K16): die Höhlen-Decke liegt 16 m unter dem Boden (die Höhle bricht nie als Grube durch die
    // Wiese); wo die Flanke Fels trägt — der Hang der Profil-Fläche (`flaeche`, ohne das Detail T3, das ihn um bis zur
    // Hälfte steiler macht) von 40° bis 50° (über dem Geröll ab 33°, die Mündungs-Wand ist Fels) und das Kliff des
    // Schicht-Gesetzes —, hebt das Gewicht die Decke um `hub` bis über den Boden: das Höhlen-Feld schneidet die Wand, der
    // Mund steht im Fels. Gemessen (Mündungs-Suche nach dem Kriterium der Höhlen-Sicht, 4 km², drei Saaten): 5 · 1 · 14
    // Mündungen je km². Leser: der Spalten-Kontext der Dichte in Stamm und Worker (`ceilOffset`), die Höhlen-Sicht.
    const HOEHLEN_MUND = Object.freeze({ von: 40, bis: 50, hub: 24 });
    // DIE BODEN-GENERATION (K16): die Zahl des Gelände-Gesetzes, unter dem ein Save seine Höhen schrieb. Ein Save einer anderen
    // Generation (vor K16: keine) zieht beim Laden um — jeder Bau und der Spieler stehen auf dem Boden dieses Gesetzes in ihrer
    // Höhe über Grund (Stamm `_bodenUmzug`). Jeder Schnitt, der den Boden bewegt, zählt sie hoch.
    const BODEN_GENERATION = 1;
    const MUND_TAN_VON = Math.tan((HOEHLEN_MUND.von * Math.PI) / 180);
    const MUND_TAN_BIS = Math.tan((HOEHLEN_MUND.bis * Math.PI) / 180);
    function hoehlenMund(hang) {
        return hang > MUND_TAN_VON ? glatt(MUND_TAN_VON, MUND_TAN_BIS, hang) : 0;
    }

    // ── DIE GELÄNDE-LINSE (K16): die Realismus-Statistik eines Höhen-Rasters — EINE Rechnung für die Wand
    // (`diag-worker-dichte --realismus`, Makro), die Gegenmessung am gebauten Boden und die Zahl-Leiste des Studios.
    // H: Höhen je Zelle (Zeile für Zeile, n×n, Schritt `step` m; null = Loch), wl: Wasserspiegel. `benannt`: Zellen-
    // Indizes benannter Seen (eine Senke, die einen trägt, zählt nicht). Die Zahlen und ihre Korridore: Nordstern §4.1.
    //   senken1mJeKm2  geschlossene Senken tiefer als 1 m (Komponenten der Füll-Tiefe > 1 m) je km² Land
    //   minimaJeKm2    strikte lokale Minima je km² (die K09a-Zahl 32,9; beliebig flach)
    //   flint          θ und R² der Regression log S ~ log A über die Flächen-Klassen der Gerinne-Zellen (A ≥ 0,1 km²;
    //                  Median je 0,1 Dekaden) — thetaZelle/r2Zelle: dieselbe Regression über die Einzel-Zellen
    //   hammond        1-km²-Fenster (gleitend 250 m), sanft = mehr als die Hälfte der Zellen mit Hang < 8 %
    //   dorfplaetze    120-m-Plätze (5×5 Zellen bei 30 m): jede Zelle Hang ≤ 8 %, Spanne ≤ 3 m, trocken; je 300 m einer
    const LINSE = Object.freeze({
        senkeTiefe: 1,
        flintAMin: 1e5,
        flintKlasseMin: 5,
        hangSanft: 0.08,
        platzSeite: 120,
        platzSpanne: 3,
        platzAbstand: 300,
        fensterSeite: 1000,
        fensterSchritt: 250,
    });
    function fuellen(H, n) {
        const F = Float64Array.from(H);
        const vis = new Uint8Array(n * n);
        const hk = [];
        const hv = [];
        const push = (k, v) => {
            hk.push(k);
            hv.push(v);
            let c = hk.length - 1;
            while (c > 0) {
                const p = (c - 1) >> 1;
                if (hk[p] <= hk[c]) break;
                [hk[p], hk[c]] = [hk[c], hk[p]];
                [hv[p], hv[c]] = [hv[c], hv[p]];
                c = p;
            }
        };
        const pop = () => {
            const v = hv[0];
            const lk = hk.pop();
            const lv = hv.pop();
            if (hk.length) {
                hk[0] = lk;
                hv[0] = lv;
                let c = 0;
                for (;;) {
                    const l = 2 * c + 1;
                    const r = l + 1;
                    let m = c;
                    if (l < hk.length && hk[l] < hk[m]) m = l;
                    if (r < hk.length && hk[r] < hk[m]) m = r;
                    if (m === c) break;
                    [hk[m], hk[c]] = [hk[c], hk[m]];
                    [hv[m], hv[c]] = [hv[c], hv[m]];
                    c = m;
                }
            }
            return v;
        };
        for (let i = 0; i < n; i++)
            for (const idx of [i, i + (n - 1) * n, i * n, n - 1 + i * n])
                if (!vis[idx]) {
                    vis[idx] = 1;
                    push(F[idx], idx);
                }
        while (hk.length) {
            const c = pop();
            const ci = c % n;
            const cj = (c / n) | 0;
            for (let dj = -1; dj <= 1; dj++)
                for (let di = -1; di <= 1; di++) {
                    if (!di && !dj) continue;
                    const i = ci + di;
                    const j = cj + dj;
                    if (i < 0 || j < 0 || i >= n || j >= n) continue;
                    const k = i + j * n;
                    if (vis[k]) continue;
                    vis[k] = 1;
                    if (F[k] < F[c] + 1e-6) F[k] = F[c] + 1e-6;
                    push(F[k], k);
                }
        }
        return F;
    }
    function statistik(Hroh, n, step, wl, benannt, rand) {
        // `rand` Zellen am Rand rechnen mit (Füllung, Abfluss, Einzugsgebiet — Flint braucht das WAHRE A), gezählt wird innen.
        const r0 = rand > 0 ? rand : 0;
        const innen = (i, j) => i >= r0 && j >= r0 && i < n - r0 && j < n - r0;
        const N = n * n;
        const H = new Float64Array(N);
        let loecher = 0;
        for (let k = 0; k < N; k++) {
            const v = Hroh[k];
            if (v == null || !Number.isFinite(v)) {
                H[k] = NaN;
                loecher++;
            } else H[k] = v;
        }
        for (let k = 0; k < N; k++) {
            if (!Number.isNaN(H[k])) continue;
            const i = k % n;
            const j = (k / n) | 0;
            let s = 0;
            let c = 0;
            for (let d = 1; d < 4 && !c; d++)
                for (const [a, b] of [
                    [i - d, j],
                    [i + d, j],
                    [i, j - d],
                    [i, j + d],
                ])
                    if (a >= 0 && b >= 0 && a < n && b < n && Number.isFinite(H[a + b * n])) {
                        s += H[a + b * n];
                        c++;
                    }
            H[k] = c ? s / c : wl;
        }
        // Hang je Zelle (zentrale Differenzen), NaN am Rand und im Wasser
        const S = new Float64Array(N).fill(NaN);
        const hang = [];
        for (let j = 1; j < n - 1; j++)
            for (let i = 1; i < n - 1; i++) {
                const k = i + j * n;
                if (H[k] <= wl) continue;
                const s = Math.hypot((H[k + 1] - H[k - 1]) / (2 * step), (H[k + n] - H[k - n]) / (2 * step));
                S[k] = s;
                if (innen(i, j)) hang.push(s);
            }
        hang.sort((a, b) => a - b);
        const q = (a, p) => (a.length ? a[Math.min(a.length - 1, Math.floor(p * a.length))] : null);
        // strikte lokale Minima über dem Wasser
        let minima = 0;
        let land = 0;
        for (let j = 1; j < n - 1; j++)
            for (let i = 1; i < n - 1; i++) {
                const h = H[i + j * n];
                if (h <= wl || !innen(i, j)) continue;
                land++;
                let min = true;
                for (let dj = -1; dj <= 1 && min; dj++)
                    for (let di = -1; di <= 1; di++) {
                        if (!di && !dj) continue;
                        if (H[i + di + (j + dj) * n] <= h) {
                            min = false;
                            break;
                        }
                    }
                if (min) minima++;
            }
        // Senken: Komponenten (8-Nachbarschaft) der Füll-Tiefe > 0,01 m, die tiefer als 1 m reichen; benannt, wenn eine
        // ihrer Zellen in `benannt` liegt
        const F = fuellen(H, n);
        const name = new Uint8Array(N);
        if (benannt) for (const k of benannt) if (k >= 0 && k < N) name[k] = 1;
        const komp = new Int32Array(N).fill(-1);
        let senken = 0;
        let senkenBenannt = 0;
        let d1 = 0;
        let d5 = 0;
        for (let k0 = 0; k0 < N; k0++) {
            if (komp[k0] >= 0 || H[k0] <= wl || F[k0] - H[k0] <= 0.01) continue;
            const stapel = [k0];
            komp[k0] = k0;
            let tief = 0;
            let traegtName = 0;
            let drin = 0;
            let z1 = 0;
            let z5 = 0;
            while (stapel.length) {
                const c = stapel.pop();
                const t = F[c] - H[c];
                if (t > tief) tief = t;
                if (name[c]) traegtName = 1;
                const ci = c % n;
                const cj = (c / n) | 0;
                if (innen(ci, cj)) {
                    drin = 1;
                    if (t > LINSE.senkeTiefe) z1++;
                    if (t > 5) z5++;
                }
                for (let dj = -1; dj <= 1; dj++)
                    for (let di = -1; di <= 1; di++) {
                        const i = ci + di;
                        const j = cj + dj;
                        if (i < 0 || j < 0 || i >= n || j >= n) continue;
                        const kk = i + j * n;
                        if (komp[kk] >= 0 || H[kk] <= wl || F[kk] - H[kk] <= 0.01) continue;
                        komp[kk] = k0;
                        stapel.push(kk);
                    }
            }
            if (tief > LINSE.senkeTiefe && drin) {
                if (traegtName) senkenBenannt++;
                else {
                    senken++;
                    d1 += z1;
                    d5 += z5;
                }
            }
        }
        // D8 auf der gefüllten Fläche, Akkumulation, Flint-Regression
        const to = new Int32Array(N).fill(-1);
        const SL = new Float64Array(N);
        for (let j = 0; j < n; j++)
            for (let i = 0; i < n; i++) {
                const k = i + j * n;
                let best = -1;
                let bs = 0;
                for (let dj = -1; dj <= 1; dj++)
                    for (let di = -1; di <= 1; di++) {
                        if (!di && !dj) continue;
                        const a = i + di;
                        const b = j + dj;
                        if (a < 0 || b < 0 || a >= n || b >= n) continue;
                        const kk = a + b * n;
                        const s = (F[k] - F[kk]) / (step * Math.hypot(di, dj));
                        if (s > bs) {
                            bs = s;
                            best = kk;
                        }
                    }
                to[k] = best;
                SL[k] =
                    best >= 0
                        ? (H[k] - H[best]) / (step * Math.hypot((best % n) - i, ((best / n) | 0) - j))
                        : 0;
            }
        const ord = Array.from({ length: N }, (_, k) => k).sort((a, b) => F[b] - F[a]);
        const A = new Float64Array(N).fill(1);
        for (const k of ord) if (to[k] >= 0) A[to[k]] += A[k];
        const cellA = step * step;
        const lx = [];
        const ly = [];
        for (let j = 1; j < n - 1; j++)
            for (let i = 1; i < n - 1; i++) {
                const k = i + j * n;
                if (H[k] <= wl || !innen(i, j)) continue;
                const a = A[k] * cellA;
                if (a >= LINSE.flintAMin && to[k] >= 0 && SL[k] > 1e-4 && F[k] - H[k] < 0.01) {
                    lx.push(Math.log(a));
                    ly.push(Math.log(SL[k]));
                }
            }
        let mx = 0;
        let my = 0;
        for (let i = 0; i < lx.length; i++) {
            mx += lx[i];
            my += ly[i];
        }
        mx /= lx.length || 1;
        my /= lx.length || 1;
        let sxy = 0;
        let sxx = 0;
        let syy = 0;
        for (let i = 0; i < lx.length; i++) {
            sxy += (lx[i] - mx) * (ly[i] - my);
            sxx += (lx[i] - mx) ** 2;
            syy += (ly[i] - my) ** 2;
        }
        // Die tragende Regression (TopoToolbox `slopearea`): der Median des Gefälles je Flächen-Klasse (0,1 Dekaden,
        // ≥ 5 Zellen) — die Einzel-Zelle streut auf dem 30-m-Raster um den Faktor 10 (die D8-Bahn pendelt über Aue
        // und Flanke), der Zusammenhang S ~ A^−θ lebt in der Klasse.
        const klassen = new Map();
        for (let i = 0; i < lx.length; i++) {
            const b = Math.floor(lx[i] / (0.1 * Math.LN10));
            let c = klassen.get(b);
            if (!c) klassen.set(b, (c = { x: 0, y: [] }));
            c.x += lx[i];
            c.y.push(ly[i]);
        }
        let bn = 0;
        let bmx = 0;
        let bmy = 0;
        const bx = [];
        const by = [];
        for (const c of klassen.values()) {
            if (c.y.length < LINSE.flintKlasseMin) continue;
            c.y.sort((a, b) => a - b);
            bx.push(c.x / c.y.length);
            by.push(c.y[c.y.length >> 1]);
            bmx += bx[bn];
            bmy += by[bn];
            bn++;
        }
        bmx /= bn || 1;
        bmy /= bn || 1;
        let bxy = 0;
        let bxx = 0;
        let byy = 0;
        for (let i = 0; i < bn; i++) {
            bxy += (bx[i] - bmx) * (by[i] - bmy);
            bxx += (bx[i] - bmx) ** 2;
            byy += (by[i] - bmy) ** 2;
        }
        // Hammond-Fenster (1 km², gleitend)
        const win = Math.round(LINSE.fensterSeite / step);
        const sh = Math.max(1, Math.round(LINSE.fensterSchritt / step));
        let fen = 0;
        let sanft = 0;
        const spannen = [];
        for (let wj = Math.max(1, r0); wj + win < n - Math.max(1, r0); wj += sh)
            for (let wi = Math.max(1, r0); wi + win < n - Math.max(1, r0); wi += sh) {
                let mn = 1e9;
                let mxh = -1e9;
                let g = 0;
                let c = 0;
                let nass = 0;
                for (let j = wj; j < wj + win; j++)
                    for (let i = wi; i < wi + win; i++) {
                        const k = i + j * n;
                        const h = H[k];
                        if (h <= wl) {
                            nass++;
                            continue;
                        }
                        if (h < mn) mn = h;
                        if (h > mxh) mxh = h;
                        if (S[k] < LINSE.hangSanft) g++;
                        c++;
                    }
                if (nass > (win * win) / 2) continue;
                fen++;
                spannen.push(mxh - mn);
                if (g / c > 0.5) sanft++;
            }
        spannen.sort((a, b) => a - b);
        // Dorfplätze (gierig, je 300 m einer)
        const pw = Math.max(2, Math.round(LINSE.platzSeite / step) + 1);
        const pab = LINSE.platzAbstand / step;
        const plaetze = [];
        for (let wj = Math.max(1, r0); wj + pw < n - Math.max(1, r0); wj++)
            for (let wi = Math.max(1, r0); wi + pw < n - Math.max(1, r0); wi++) {
                let mn = 1e9;
                let mxh = -1e9;
                let ok = true;
                for (let j = wj; j < wj + pw && ok; j++)
                    for (let i = wi; i < wi + pw; i++) {
                        const k = i + j * n;
                        const h = H[k];
                        if (!(h > wl + 0.5) || !(S[k] <= LINSE.hangSanft)) {
                            ok = false;
                            break;
                        }
                        if (h < mn) mn = h;
                        if (h > mxh) mxh = h;
                    }
                if (!ok || mxh - mn > LINSE.platzSpanne) continue;
                const ci = wi + pw / 2;
                const cj = wj + pw / 2;
                if (plaetze.some((p) => Math.hypot(p[0] - ci, p[1] - cj) < pab)) continue;
                plaetze.push([ci, cj]);
            }
        const km2 = (land * cellA) / 1e6;
        const r3 = (v) => (v == null ? null : Math.round(v * 1000) / 1000);
        return {
            landKm2: r3(km2),
            loecher,
            hang: {
                p50Prozent: hang.length ? Math.round(1000 * q(hang, 0.5)) / 10 : null,
                p90Prozent: hang.length ? Math.round(1000 * q(hang, 0.9)) / 10 : null,
                anteilUnter8Prozent: hang.length ? r3(hang.filter((v) => v < LINSE.hangSanft).length / hang.length) : null,
            },
            senken1mJeKm2: km2 > 0 ? Math.round((100 * senken) / km2) / 100 : null,
            senken1m: senken,
            senkenBenannt,
            minimaJeKm2: km2 > 0 ? Math.round((100 * minima) / km2) / 100 : null,
            anteilSenkeTiefer1m: land ? r3(d1 / land) : null,
            anteilSenkeTiefer5m: land ? r3(d5 / land) : null,
            flint: {
                theta: bn > 3 ? r3(-bxy / bxx) : null,
                r2: bn > 3 ? r3((bxy * bxy) / (bxx * byy)) : null,
                klassen: bn,
                thetaZelle: lx.length > 2 ? r3(-sxy / sxx) : null,
                r2Zelle: lx.length > 2 ? r3((sxy * sxy) / (sxx * syy)) : null,
                zellen: lx.length,
            },
            hammond: { fenster: fen, sanft, spanneP50m: spannen.length ? Math.round(10 * q(spannen, 0.5)) / 10 : null },
            dorfplaetze: plaetze.length,
            dorfplatzZellen: plaetze.map((p) => [Math.round(p[0]), Math.round(p[1])]),
        };
    }
    // Das Hang-Histogramm in Grad (zentrale Differenzen auf einem feinen Raster): die Anteile der Bänder des Schicht-
    // Gesetzes — Pediment 0,5–7°, Schutthang 30–40° (Ruhewinkel 33–37°), Kliff ≥ 60°.
    function hangBaender(H, n, step, maske) {
        let c = 0;
        let ped = 0;
        let schutt = 0;
        let ruhe = 0;
        let kliff = 0;
        const DEG = 180 / Math.PI;
        for (let j = 1; j < n - 1; j++)
            for (let i = 1; i < n - 1; i++) {
                const k = i + j * n;
                if (maske && !maske[k]) continue;
                const g = Math.hypot((H[k + 1] - H[k - 1]) / (2 * step), (H[k + n] - H[k - n]) / (2 * step));
                const w = Math.atan(g) * DEG;
                c++;
                if (w >= 0.5 && w <= 7) ped++;
                if (w >= 30 && w <= 40) schutt++;
                if (w >= 33 && w <= 37) ruhe++;
                if (w >= 60) kliff++;
            }
        const r3 = (v) => Math.round(v * 1000) / 1000;
        if (!c) return { zellen: 0, pediment: 0, schutt: 0, ruhe: 0, kliff: 0 };
        return { zellen: c, pediment: r3(ped / c), schutt: r3(schutt / c), ruhe: r3(ruhe / c), kliff: r3(kliff / c) };
    }

    root.__gelaendeCore = Object.freeze({
        LINSE: LINSE,
        statistik: statistik,
        hangBaender: hangBaender,
        VERSION: VERSION,
        STUDIO_VERTRAG: 1, // G4.3 — EINE Versions-Semantik
        FUNKTION: 1, // studio-vertrag §9 — ein Gesetz-Kern: reine Funktionen, keine Rezepte, keine Gestalt
        LANDFORM_REGLER: LANDFORM_REGLER,
        OFFSET_KNOTEN: OFFSET_KNOTEN,
        RELIEF_KNOTEN: RELIEF_KNOTEN,
        NETZ_KANTE: NETZ_KANTE,
        hoehe: hoehe,
        ERDBAU: ERDBAU,
        erdbauNormal: erdbauNormal,
        erdbauY: erdbauY,
        erdbauFlaeche: erdbauFlaeche,
        HOEHLEN_MUND: HOEHLEN_MUND,
        hoehlenMund: hoehlenMund,
        BODEN_GENERATION: BODEN_GENERATION,
        erbgutNormal: erbgutNormal,
        wildnisY: wildnisY,
        termY: termY,
        SCHNEE: SCHNEE,
        schnee: schnee,
        grossform: (L, x, z) => grossform(netzFuer(L), x, z),
        landformRegler: landformRegler,
        benannteSeen: benannteSeen,
        flussLaeufe: flussLaeufe,
        schichtOrt: schichtOrt,
        kachelSchluessel: kachelSchluessel,
    });
})(typeof self !== "undefined" ? self : globalThis);
