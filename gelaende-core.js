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
// Kein this, kein Zustand außer den Rausch-Strömen je Saat (aus der Saat abgeleitet, nie Math.random), keine Uhr (Saison
// und Uhr der Temperatur reicht der Wirt als Argumente).
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
        // "rinne": die Klamm A → B — dieselbe Rinne, die Sohle fällt von `quelle` nach `muendung` (das Gefälle des Bachs, der in
        // ihr läuft: `flussLaeufe`), ohne Furt und Kolk. Schneidet (Minimum).
        let q = ((x - t.x0) * t.ex + (z - t.z0) * t.ez) / t.len2;
        if (q < 0) q = 0;
        else if (q > 1) q = 1;
        const d = Math.hypot(x - (t.x0 + t.ex * q), z - (t.z0 + t.ez * q));
        if (t.art === "rinne") {
            const s = base + t.quelle + (t.muendung - t.quelle) * q;
            const wr = d - t.sohle * 0.5;
            const br = wr > 0 ? s + wr * t.tanU : s;
            return br < h ? br : h;
        }
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
            if (!["wildnis", "insel", "rampe", "bucht", "rinne"].includes(t.art)) nein(`unbekannte Term-Art „${t.art}"`);
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
            if (t.art === "rinne") {
                // DIE KLAMM (werk-ufer): ein Bach mit Gefälle zwischen steilen Wänden — der Ort, an dem ein Damm staut (die
                // Aue der Wildnis ist flach, ein Damm wird dort umflossen). `einzug` (km²) gibt dem Bach seine Breite (`flussBreite`).
                const x0 = zahl(t, "x0", -1e5, 1e5);
                const z0 = zahl(t, "z0", -1e5, 1e5);
                const ex = zahl(t, "x1", -1e5, 1e5) - x0;
                const ez = zahl(t, "z1", -1e5, 1e5) - z0;
                const len = Math.hypot(ex, ez);
                if (!(len >= 1)) nein("rinne: A und B fallen zusammen");
                const quelle = zahl(t, "quelle", -100, 200);
                const muendung = zahl(t, "muendung", -100, 200);
                if (!(muendung < quelle)) nein("rinne: die Sohle fällt nicht von der Quelle zur Mündung");
                return {
                    art: "rinne",
                    x0,
                    z0,
                    ex,
                    ez,
                    len,
                    len2: ex * ex + ez * ez,
                    sohle: zahl(t, "sohle", 2, 200),
                    tanU: Math.tan(zahl(t, "ufer", 5, 80) * RAD),
                    quelle,
                    muendung,
                    einzug: zahl(t, "einzug", 0.01, 1000),
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
    // Die zuletzt gefragte Lage steht vor der WeakMap (eine Welt fragt Spalte um Spalte dieselbe).
    const LAGE_NETZ = new WeakMap();
    let lageLetzt = null;
    function netzFuer(L) {
        const noise = L.noise;
        const erbgut = L.erbgut;
        let m = lageLetzt;
        // dieselbe Lage mit denselben rohen Feldern: dasselbe Netz, ohne Basis und Wasser neu zu rechnen
        if (m && m.L === L && m.noise === noise && m.erbgut === erbgut && m.bh === L.baseHeight && m.wh === L.waterLevel)
            return m.N;
        const base = L.baseHeight || 0;
        const wl = Number.isFinite(L.waterLevel) ? L.waterLevel : base + 4;
        m = LAGE_NETZ.get(L);
        if (!(m && m.noise === noise && m.erbgut === erbgut && m.base === base && m.wl === wl)) {
            m = { L, noise, erbgut, base, wl, bh: L.baseHeight, wh: L.waterLevel, N: netzNeu(L, base, wl) };
            LAGE_NETZ.set(L, m);
        }
        m.bh = L.baseHeight;
        m.wh = L.waterLevel;
        lageLetzt = m;
        return m.N;
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
            // die zuletzt gefragte Zelle je Ebene (der Bau tastet Spalte um Spalte durch dieselbe Zelle) und der Talgrund je
            // Zelle der Ebene 0 (`talZelle`)
            zLetzt: [{ ci: NaN, cj: NaN, z: null }, { ci: NaN, cj: NaN, z: null }, { ci: NaN, cj: NaN, z: null }],
            tal: { M: new Map(), ci: NaN, cj: NaN, a: null },
            tp: Math.tan((P.pedimentWinkel * Math.PI) / 180),
            ts: Math.tan((P.schuttWinkel * Math.PI) / 180),
            tc: Math.tan((P.kliffWinkel * Math.PI) / 180),
            schicht: null, // die Schicht-Periode (`schichtMass`), einmal je Netz
        };
        NETZE.set(schl, N);
        return N;
    }

    // Die Großform einer Lage (der Namensraum-Leser `grossform(L, x, z)`).
    const grossformAus = (L, x, z) => grossform(netzFuer(L), x, z);
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
        // Das Tafelland ist ein Ort, kein Schleier: scharfe Grenze (0,05 im Stil-Feld), volle Kraft ab 45 m Relief. Unter 18 m
        // und über 195 m Relief ist es null — dort fragt die Spalte das Stil-Feld nie (die Ebene zahlt kein Rauschen, das sie
        // nicht trägt; dieselbe Höhe bis aufs Bit, `gate:worker-dichte`).
        const reliefStil = glatt(18, 45, rel);
        const reliefDecke = 1 - glatt(160, 195, rel);
        const stil =
            reliefStil === 0 || reliefDecke === 0
                ? 0
                : glatt(
                      1 - P.tafel * 0.62,
                      1.05 - P.tafel * 0.62,
                      n.noise2D(wx * 0.000192 + 91.3, wz * 0.000192 + 5.9) * 0.5 + 0.5
                  ) *
                  reliefStil *
                  reliefDecke;
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
        if (kn.k === 0) kn.hp = gf.K;
        else {
            const mess = { steil: 0, nah: 1, hang: 0, aue: false };
            kn.hp = flaeche(N, kn.k - 1, kn.x, kn.z, gf, mess);
            kn.inAue = mess.aue;
        }
        return kn.hp;
    }
    function knotenFluss(N, kn) {
        if (kn.fluss !== undefined) return kn.fluss;
        const h = knotenHp(N, kn);
        // DIE AUE NIMMT IHR WASSER (K16, Mäander): ein Knoten der Ebene k ≥ 1 in der Aue der Ebene darunter mündet sofort in
        // ihren Fluss — sonst liefe er als zweiter Strom neben ihm durch dieselbe Aue (am geraden Netz deckungsgleich und
        // unsichtbar, mit Mäander zwei verflochtene Bahnen).
        if (kn.k > 0 && kn.inAue) {
            kn.fluss = null;
            kn.aus = muendung(N, kn.k - 1, kn.x, kn.z);
            return null;
        }
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

    // DIE BREITE eines Flusses aus seinem Einzugsgebiet A (m²): die Bankvoll-Breite der hydraulischen Geometrie (Dunne &
    // Leopold 1978, W ∝ A^0,37: 0,16 km² ≈ 4,4 m, 25 km² ≈ 17 m). Leser: der Mäander (Wellenlänge und Raum in der Aue) und die
    // Hydrosphäre des Wirts (`_hydroNetzFluesse`) — EIN Gesetz der Breite.
    const FLUSS_BREITE = Object.freeze({ min: 2, k: 4.7, exp: 0.37 });
    function flussBreite(A) {
        return FLUSS_BREITE.min + FLUSS_BREITE.k * Math.pow(Math.max(0, A) / 1e6, FLUSS_BREITE.exp);
    }

    // DER MÄANDER (K16, Prüfung Runde 2: „ein linealgerader Fluss — der Kern hat keinen Mäander-Term"): die Bahn eines Fluss-
    // Glieds der Ebenen 0 und 1 ist die sinus-erzeugte Kurve (Langbein & Leopold 1966) — die Richtung schwingt mit der
    // Bogenlänge, θ(s) = ω·cos(2π·s/M), die Kurve kleinster Krümmungs-Varianz. Die Wellenlänge auf der Sehne λ ≈ 11 Breiten
    // (Leopold & Wolman 1960, ±15 % je Glied), ω = 1,2 rad: Sinuosität M/λ = 1/J0(ω) ≈ 1,49, kleinster Krümmungs-Radius
    // Rc = M/(2π·ω) ≈ 2,2 Breiten (Soll 2–3). Ein Glied trägt n = round(Sehne/λ) ganze Wellen: die Bahn verlässt und erreicht
    // ihre Knoten auf der Sehne und unter demselben Winkel — die Knicke sind die des Netzes, keiner mehr. Sie bleibt in der
    // Aue (halbe Amplitude ≤ Aue F − Breite, sonst ein kleineres ω) und streckt sich mit dem Gefälle (voll bis 0,4 %, gerade
    // ab 1,5 %: der Gebirgsbach mäandriert nicht). Leser: die Fläche (die Aue fällt quer zur BAHN), die Mündung der Zuflüsse
    // (auf der Bahn) und das Wasser (`flussLaeufe` trägt je Glied die Bahn, die Hydrosphäre legt Kanal und Spiegel darauf).
    const MAEANDER = Object.freeze({
        lambdaBreiten: 11,
        streuung: 0.3,
        omega: 1.2,
        gefaelleVoll: 0.004,
        gefaelleNull: 0.015,
        gestreckt: 0.25,
        stufen: 12,
        tafel: 128,
        knick: 0.6,
    });
    // Die Kurve je ω-Stufe, EINMAL beim Laden: über eine Welle (φ = 2π·s/M) X(φ) und Y(φ) in Wellenlängen der Sehne
    // (X(2π) = 1), dazu Y über X gleichmäßig (die Fläche fragt am Ort auf der Sehne; X steigt streng, ω < π/2), die größte
    // |Y| (der Raum in der Aue) und der Bogen je Wellenlänge M/λ.
    const MAEANDER_KURVE = (() => {
        const n = MAEANDER.tafel;
        const fein = 16 * n;
        const d = (2 * Math.PI) / fein;
        const stufen = [];
        for (let o = 0; o <= MAEANDER.stufen; o++) {
            const om = (MAEANDER.omega * o) / MAEANDER.stufen;
            const xs = new Float64Array(fein + 1);
            const ys = new Float64Array(fein + 1);
            for (let k = 0; k < fein; k++) {
                const th = om * Math.cos((k + 0.5) * d);
                xs[k + 1] = xs[k] + Math.cos(th) * d;
                ys[k + 1] = ys[k] + Math.sin(th) * d;
            }
            const L = xs[fein];
            const phiX = new Float64Array(n + 1);
            const phiY = new Float64Array(n + 1);
            for (let k = 0; k <= n; k++) {
                phiX[k] = xs[k * 16] / L;
                phiY[k] = ys[k * 16] / L;
            }
            const yX = new Float64Array(n + 1);
            let q = 0;
            for (let j = 0; j <= n; j++) {
                const X = (j / n) * L;
                while (q < fein - 1 && xs[q + 1] < X) q++;
                const f = xs[q + 1] > xs[q] ? Math.min(1, Math.max(0, (X - xs[q]) / (xs[q + 1] - xs[q]))) : 0;
                yX[j] = (ys[q] + (ys[q + 1] - ys[q]) * f) / L;
            }
            let ymax = 0;
            for (let k = 0; k <= fein; k++) ymax = Math.max(ymax, Math.abs(ys[k]) / L);
            // DIE KNICKE DER WELLE (die Abtastung folgt der Krümmung): die Orte φ/2π, an denen die Richtung θ = ω·cos φ um je
            // höchstens `knick` springt — dicht im Scheitel (dort die Krümmung), weit an der Querung (dort keine). Je halbe
            // Welle ⌈2ω/knick⌉ Stücke, mindestens zwei: bei ω 1,2 acht je Welle (bis 13.10. zwölf gleich verteilte, die
            // 2,3- bis 2,5-fache Punktzahl der Sehne bei demselben größten Sprung), bei kleinem ω vier.
            const halb = Math.max(2, Math.ceil((2 * om) / MAEANDER.knick));
            const knicke = [];
            for (let k = 0; k <= halb; k++) knicke.push(Math.acos(1 - (2 * k) / halb) / (2 * Math.PI));
            for (let k = halb - 1; k >= 0; k--) knicke.push(1 - Math.acos(1 - (2 * k) / halb) / (2 * Math.PI));
            stufen.push({ omega: om, bogen: (2 * Math.PI) / L, phiX, phiY, yX, ymax, knicke });
        }
        return stufen;
    })();
    // Der Versatz der Bahn quer zur Sehne an t ∈ [0, 1] (m, links positiv; 0 an beiden Knoten).
    function bahnVersatz(s, t) {
        const yX = MAEANDER_KURVE[s.mo].yX;
        let X = t * s.mn;
        X -= Math.floor(X);
        const f = X * MAEANDER.tafel;
        const j = f | 0;
        const y = j >= MAEANDER.tafel ? yX[MAEANDER.tafel] : yX[j] + (yX[j + 1] - yX[j]) * (f - j);
        return s.mv * s.ml * y;
    }
    // Die Bahn eines Segments als Punkte (Abstand ≤ `schritt` m auf dem Bogen, zwischen zwei Punkten springt die Richtung um
    // höchstens `knick` — die Knicke der Welle, `MAEANDER_KURVE`): je Punkt der Ort auf der Sehne t, die Lage (x, z), die
    // Bogenlänge s ab dem Knoten und die Richtung (fx, fz). Ohne Mäander die Sehne.
    function bahnPunkte(s, schritt) {
        const len = Math.sqrt(s.len2);
        const ux = s.ex / len;
        const uz = s.ez / len;
        const P = [];
        if (!s.mo) {
            const m = Math.max(1, Math.ceil(len / schritt));
            for (let q = 0; q <= m; q++) {
                const t = q / m;
                P.push({ t, x: s.ax + s.ex * t, z: s.az + s.ez * t, s: len * t, fx: ux, fz: uz });
            }
            return P;
        }
        const K = MAEANDER_KURVE[s.mo];
        const M = K.bogen * s.ml;
        const n = MAEANDER.tafel;
        const kn = K.knicke;
        // der Punkt am Anteil ph ∈ [0, 1] der Welle w
        const punkt = (w, ph) => {
            const f = ph * n;
            const j = Math.min(n - 1, f | 0);
            const r = f - j;
            const X = K.phiX[j] + (K.phiX[j + 1] - K.phiX[j]) * r;
            const Y = K.phiY[j] + (K.phiY[j + 1] - K.phiY[j]) * r;
            const t = (w + X) / s.mn;
            const y = s.mv * s.ml * Y;
            const th = s.mv * K.omega * Math.cos(2 * Math.PI * ph);
            const c = Math.cos(th);
            const sn = Math.sin(th);
            P.push({
                t,
                x: s.ax + s.ex * t - uz * y,
                z: s.az + s.ez * t + ux * y,
                s: (w + ph) * M,
                fx: ux * c - uz * sn,
                fz: uz * c + ux * sn,
            });
        };
        for (let w = 0; w < s.mn; w++)
            for (let k = 0; k + 1 < kn.length; k++) {
                const a = kn[k];
                const b = kn[k + 1];
                const teile = Math.max(1, Math.ceil((M * (b - a)) / schritt));
                for (let u = 0; u < teile; u++) punkt(w, a + ((b - a) * u) / teile);
            }
        punkt(s.mn - 1, 1);
        return P;
    }

    // Das Talprofil eines Segments (Ebene, Auen-Breite F, Flanken-Breite W, Form b, Stil) — die Segmente einer Knoten-Zelle
    // sind die, deren Reichweite (F + W, im Tafelland die Schicht-Treppe) die Zelle berührt. Die Ebenen 0 und 1 tragen ihren
    // Mäander (Stufe mo, Wellen mn, Wellenlänge ml, Seite mv; mo 0: die Sehne).
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
        let mo = 0;
        let mn = 0;
        let ml = 0;
        let mv = 1;
        if (kn.k <= 1) {
            const len = Math.hypot(ex, ez) || 1;
            const w = flussBreite(Am2);
            const lam0 =
                MAEANDER.lambdaBreiten *
                w *
                (1 + MAEANDER.streuung * (zufall(N.sh, kn.i, kn.j, 50 + kn.k) - 0.5));
            const n = Math.round(len / lam0);
            if (n >= 1) {
                const lam = len / n;
                const gefaelle = (bed - t.bed) / len;
                // gestreckt heißt nie lineal-gerade: der steile Lauf behält ein Viertel des ω (Sinuosität ≈ 1,02)
                const voll = 1 - glatt(MAEANDER.gefaelleVoll, MAEANDER.gefaelleNull, gefaelle);
                let o = Math.floor(MAEANDER.stufen * (MAEANDER.gestreckt + (1 - MAEANDER.gestreckt) * voll) + 1e-9);
                while (o > 0 && MAEANDER_KURVE[o].ymax * lam > F - w) o--;
                if (o > 0) {
                    mo = o;
                    mn = n;
                    ml = lam;
                    mv = zufall(N.sh, kn.i, kn.j, 52 + kn.k) < 0.5 ? -1 : 1;
                }
            }
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
            reach2: reach * reach,
            mo,
            mn,
            ml,
            mv,
            von: kn, // der Knoten des Segments (eine Mündung darauf ist ein Zufluss, keine Senke: `flussLaeufe`)
        };
    }
    // Die Zelle trägt zwei Listen: `alle` (die Box der Rinne samt Reichweite trifft die Zelle — die Mündung sucht darin den
    // tiefsten Punkt) und `nah` (die Rinne selbst kommt der Zelle näher als ihre Reichweite: nur sie kann eine Spalte der
    // Zelle formen — die Fläche fragt keine Rinne, deren Profil dort nie greift; dieselbe Höhe bis aufs Bit).
    function zelle(N, k, ci, cj) {
        const Z = N.zLetzt[k];
        if (Z.ci === ci && Z.cj === cj) return Z.z;
        const M = N.zellen[k];
        const key = ci * 67108864 + cj;
        let z = M.get(key);
        if (!z) z = zelleNeu(N, k, ci, cj, M, key);
        Z.ci = ci;
        Z.cj = cj;
        Z.z = z;
        return z;
    }
    function zelleNeu(N, k, ci, cj, M, key) {
        const S = N.S[k];
        const x0 = ci * S;
        const z0 = cj * S;
        const r = k === 0 ? 2 : 3;
        const z = [];
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
        const e = { alle: z, nah: z.filter((s) => streckeTrifft(s, x0, z0, S, s.reach + 0.001)) };
        if (M.size > 300000) M.clear();
        M.set(key, e);
        return e;
    }
    // Trifft die Strecke A → A + e das Rechteck [x0, x0 + S] × [z0, z0 + S], um r erweitert? (Liang-Barsky; die Ecken des
    // erweiterten Rechtecks sind eckig — die Probe hält jede Rinne, die näher als r kommt, und ein Millimeter Rand die Rundung.)
    function streckeTrifft(s, x0, z0, S, r) {
        const p = [-s.ex, s.ex, -s.ez, s.ez];
        const q = [s.ax - (x0 - r), x0 + S + r - s.ax, s.az - (z0 - r), z0 + S + r - s.az];
        let t0 = 0;
        let t1 = 1;
        for (let i = 0; i < 4; i++) {
            if (p[i] === 0) {
                if (q[i] < 0) return false;
                continue;
            }
            const v = q[i] / p[i];
            if (p[i] < 0) {
                if (v > t1) return false;
                if (v > t0) t0 = v;
            } else {
                if (v < t0) return false;
                if (v < t1) t1 = v;
            }
        }
        return true;
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
    // DER SCHUTT DER TREPPE an u (K17): der Abschnitt Schutthang (dieselben Abschnitte wie `treppe`) trägt den Schutt seines
    // Kliffs — 1, bis die Wand beginnt (weich über 1 m in sie hinein), am Fuß über 2 m aus dem Pediment bzw. der Bank. Das
    // Pediment, das Kliff und die Bank tragen keinen (das Kliff ist Fels, die Steile des Netzes legt ihn).
    function treppeSchutt(N, u) {
        if (u <= 140) return 0;
        const M = schichtMass(N);
        const r = (u - 140) % M.per;
        return glatt(0, 2, r) * (1 - glatt(M.wS, M.wS + 1, r));
    }
    // DER TALGRUND an (x, z): die Sohlen der Ebene-0-Knoten, stetig gemittelt (Gewicht (1 − d²/R²)², R = 1,6 Kanten) — die
    // Basis der Hülle (Talgrund + Relief): die Gipfel stehen über IHREM Tal, nie über einer erfundenen Ebene.
    // Je Zelle der Ebene 0 stehen die Knoten, die eine Spalte darin erreichen können (Abstand zum Zellen-Rechteck < R, mit
    // Rand), als [x, z, Sohle] in der Reihenfolge der Summe — die Spalte fragt keine 25 Knoten mehr und keine, deren Gewicht
    // dort null ist (dieselbe Summe in derselben Reihenfolge: dieselbe Höhe bis aufs Bit).
    function talZelle(N, ci, cj) {
        const T = N.tal;
        if (T.ci === ci && T.cj === cj) return T.a;
        const key = ci * 67108864 + cj;
        let a = T.M.get(key);
        if (!a) {
            const S = N.S[0];
            const R2 = 1.6 * S * 1.6 * S * 1.0001;
            const x0 = ci * S;
            const z0 = cj * S;
            const w = [];
            for (let j = cj - 2; j <= cj + 2; j++)
                for (let i = ci - 2; i <= ci + 2; i++) {
                    const kn = knoten(N, 0, i, j);
                    const dx = kn.x < x0 ? x0 - kn.x : kn.x > x0 + S ? kn.x - x0 - S : 0;
                    const dz = kn.z < z0 ? z0 - kn.z : kn.z > z0 + S ? kn.z - z0 - S : 0;
                    if (dx * dx + dz * dz >= R2) continue;
                    w.push(kn.x, kn.z, knotenSohle(N, kn));
                }
            a = Float64Array.from(w);
            if (T.M.size > 300000) T.M.clear();
            T.M.set(key, a);
        }
        T.ci = ci;
        T.cj = cj;
        T.a = a;
        return a;
    }
    function talgrund(N, x, z) {
        const S = N.S[0];
        const R = 1.6 * S;
        const R2 = R * R;
        const a = talZelle(N, Math.floor(x / S), Math.floor(z / S));
        let sw = 0;
        let sb = 0;
        for (let p = 0; p < a.length; p += 3) {
            const dx = x - a[p];
            const dz = z - a[p + 1];
            const q = 1 - (dx * dx + dz * dz) / R2;
            if (q <= 0) continue;
            const w = q * q;
            sw += w;
            sb += w * a[p + 2];
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
        let schutt = 0;
        let aue = false;
        for (let k = 0; k <= kmax; k++) {
            const S = N.S[k];
            const segs = zelle(N, k, Math.floor(x / S), Math.floor(z / S)).nah;
            let Hk = H;
            let kSteil = 0;
            let kNah = 1;
            let kAue = false;
            let kHang = 0;
            let kSchutt = 0;
            for (let q = 0; q < segs.length; q++) {
                const s = segs[q];
                const dx = x - s.ax;
                const dz = z - s.az;
                let t = (dx * s.ex + dz * s.ez) / s.len2;
                t = t < 0 ? 0 : t > 1 ? 1 : t;
                const px = dx - s.ex * t;
                const pz = dz - s.ez * t;
                const d2 = px * px + pz * pz;
                if (d2 >= s.reach2) continue;
                const bed = s.ba + (s.bb - s.ba) * t;
                if (bed >= Hk) continue;
                const d = Math.sqrt(d2);
                const u = d - s.F;
                let v;
                let g = 0;
                let w = 0;
                // die Neigung des Profils quer zur Rinne (mit der Treppe gemischt) — der Hang der gewählten Fläche
                let gh = 0;
                let sch = 0;
                // Die Aue fällt quer 0,6 % zur Rinne (das Wasser sammelt sich im Bett, nie in der Fläche) — zur BAHN des
                // Mäanders: der Abstand quer zur Sehne, so gestaucht, dass die Bahn 0 und die Auen-Kante F bleibt (stetig an
                // der Kante und an den Knoten, wo die Bahn auf der Sehne liegt).
                if (u <= 0) {
                    let dq = d;
                    if (s.mo && t > 0 && t < 1) {
                        const lat = (dz * s.ex - dx * s.ez) / Math.sqrt(s.len2);
                        const y = bahnVersatz(s, t);
                        dq = lat >= y ? ((lat - y) * s.F) / (s.F - y) : ((y - lat) * s.F) / (s.F + y);
                    }
                    v = bed + AUE_QUER * dq;
                } else {
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
                        sch = tr < H - sohle ? treppeSchutt(N, u) * s.stil : 0;
                    }
                }
                if (v < Hk) {
                    Hk = v;
                    kSteil = g;
                    kNah = w < 1 ? w : 1;
                    kAue = u <= 0;
                    kHang = gh;
                    kSchutt = sch;
                }
            }
            if (Hk < H) {
                if (kSteil > steil) steil = kSteil;
                if (kNah < nah) nah = kNah;
                aue = kAue;
                hang = kHang;
                schutt = kSchutt;
            }
            H = Hk;
        }
        if (aus) {
            aus.steil = steil;
            aus.nah = nah;
            aus.hang = hang;
            aus.schutt = schutt;
            aus.aue = aue;
        }
        return H;
    }
    // Die Mündung eines Knotens der Ebene k+1 ins Netz der Ebene k: der Segment-Punkt, der die Fläche an (x, z) am tiefsten
    // trägt (Sohle + Profil), mit seiner Sohle.
    function muendung(N, k, x, z) {
        const S = N.S[k];
        const segs = zelle(N, k, Math.floor(x / S), Math.floor(z / S)).alle;
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
                // der Zufluss mündet auf der BAHN des Hauptlaufs (nie neben dem Wasser in der Aue)
                const y = s.mo && t > 0 && t < 1 ? bahnVersatz(s, t) : 0;
                const len = Math.sqrt(s.len2);
                best = { x: s.ax + s.ex * t - (s.ez / len) * y, z: s.az + s.ez * t + (s.ex / len) * y, bed, von: s.von };
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
    // WEICH (K16, Prüfung Runde 2: „harte Schnee-Kappen" im Makro-Bild): die Grenze ist keine Höhenlinie — zwei Oktaven des
    // Gelände-Rauschens verschieben sie je Ort (`zungen`: λ ≈ 330 m um ±18 m, λ ≈ 45 m um ±7 m), die Kappe franst in Zungen
    // und Flecken aus, wie Schnee in Mulden länger liegt als auf Rücken. Das Mittel bleibt die Grenze (Rauschen ohne Mittel).
    // Die Leser geben den Ort (x, z); fehlt er, bricht die Funktion laut (nie die alte Höhenlinie als Ersatz).
    // DIE GRENZE LIEST DEN PEGEL (stoffe.K3-2): `versatz` (m) ist der Weg der Linie des Schnee-Pegels seit der Sommer-Mitte
    // (`schneeVersatz`) — das Band K16 ist die Form der Grenze zur Sommer-Mitte, der Pegel trägt sie über das Jahr; ohne ihn
    // (0) die Grenze der Sommer-Mitte, bit-gleich zu vorher.
    const SCHNEE = Object.freeze({
        start: 140,
        voll: 185,
        zungen: [
            { f: 0.003, a: 18, ox: 17.3, oz: -41.9 },
            { f: 0.022, a: 7, ox: -5.1, oz: 8.3 },
        ],
    });
    function schnee(L, y, x, z, versatz) {
        if (!Number.isFinite(x) || !Number.isFinite(z)) throw new Error("gelaende-core schnee: der Ort (x, z) fehlt");
        const wl = Number.isFinite(L.waterLevel) ? L.waterLevel : (L.baseHeight || 0) - GRUND.meerUnterBasis;
        let zunge = 0;
        for (const o of SCHNEE.zungen) zunge += L.noise.noise2D(x * o.f + o.ox, z * o.f + o.oz) * o.a;
        return glatt(SCHNEE.start, SCHNEE.voll, y - wl + zunge - (versatz || 0));
    }

    // DIE TEMPERATUR (stoffe.K3, Wetter H4): die Luft an der Höhe y in °C — EINE reine Funktion aus der Höhe über dem Meer,
    // der Saison (`saison`, die Phase der Welt: Sommer-Mitte 0,375, Winter-Mitte 0,875) und der Uhr (`uhr`, Mittag 0,5).
    // Das Klima ist gemäßigt-kontinental: im Tagesmittel am Meer 18 °C im Sommer, −4 °C im Winter, der Tagesgang ±5 °C, am
    // wärmsten um 15 Uhr. Die Höhe kühlt mit dem Gradienten, der die Null-Grad-Linie des Sommer-Mittels auf die Mitte der
    // SCHNEEGRENZE legt: wo der Schnee liegt, ist es kalt (die Welt staucht die Höhe — ihre 160 m tragen, was in den Alpen
    // 3 km tragen; 0,11 K/m).
    // DIE TRÄGHEIT (`traegTage`): ein Stoff mit Wärme-Gedächtnis (das Wasser) sieht die Luft durch einen Tiefpass erster
    // Ordnung mit der Zeitkonstante τ in Tagen — jede Schwingung gedämpft um 1/√(1 + (ωτ)²) und verspätet um atan(ωτ),
    // geschlossen gerechnet (die Welt bleibt eine Funktion). Die Trägheit gehört dem Körper, der die Luft sieht (das Eis:
    // `eisDicke` aus der Säule des Wassers; ρ und c rechnet der Wirt aus seiner Stoff-Tafel, stoffe.K1).
    // DAS FELD IN WELLEN (`temperaturFeld`): an der Höhe y das Mittel, die Kühlung der Höhe und je Welle (Jahr, Tag) die
    // Amplitude, der Gipfel und die Verspätung nach dem Tiefpass — `temperaturAus` wertet es zu Saison und Uhr aus
    // (`temperatur` = beides, bit-gleich zur Formel vor stoffe.K3-2), das Eis integriert seine Jahres-Welle geschlossen.
    const TEMPERATUR = Object.freeze({
        sommer: 18,
        winter: -4,
        sommerPhase: 0.375,
        tagAmp: 5,
        tagGipfel: 0.625,
        jahrTage: 365,
    });
    function temperaturFeld(L, y, traegTage) {
        if (!Number.isFinite(y)) throw new Error("gelaende-core temperaturFeld: die Höhe fehlt");
        const T = TEMPERATUR;
        const wl = Number.isFinite(L.waterLevel) ? L.waterLevel : (L.baseHeight || 0) - GRUND.meerUnterBasis;
        const welle = (amp, gipfel, perioden) => {
            const wt = 2 * Math.PI * (traegTage > 0 ? traegTage : 0) * perioden;
            return { amp: amp / Math.sqrt(1 + wt * wt), gipfel, spaet: Math.atan(wt) };
        };
        return {
            mittel: (T.sommer + T.winter) / 2,
            kuehlung: (T.sommer / ((SCHNEE.start + SCHNEE.voll) / 2)) * (y - wl),
            jahr: welle((T.sommer - T.winter) / 2, T.sommerPhase, 1 / T.jahrTage),
            tag: welle(T.tagAmp, T.tagGipfel, 1),
        };
    }
    function temperaturAus(F, saison, uhr) {
        if (!Number.isFinite(saison) || !Number.isFinite(uhr)) throw new Error("gelaende-core temperaturAus: Saison oder Uhr fehlt");
        const welle = (W, phase) => W.amp * Math.cos(2 * Math.PI * (phase - W.gipfel) - W.spaet);
        return F.mittel + welle(F.jahr, saison) + welle(F.tag, uhr) - F.kuehlung;
    }
    function temperatur(L, y, saison, uhr, traegTage) {
        return temperaturAus(temperaturFeld(L, y, traegTage), saison, uhr);
    }

    // DAS EIS (stoffe.K3): die feste Phase des Wassers als DICKE in Metern — eine Funktion des Wasserkörpers, des Felds und
    // der Saison.
    // DER KÖRPER: sein Gefrierpunkt aus dem Salz (T_f = −0,054 K·kg/g × S: das Meer mit 35 g/kg friert bei −1,9 °C, Süßwasser
    // bei 0 °C), seine Trägheit aus der Masse je Fläche (τ = ρc·h / α: die Wärme der Säule h gegen die Kopplung α der
    // Oberfläche an die Luft, fühlbar + latent + langwellig): ein Teich von 1 m folgt der Luft mit 1,9 Tagen, der See der
    // Mess-Wiese (3,4 m) mit 6,6, das Meer mit seiner Durchmischungs-Schicht von 50 m mit 97 — seine Jahres-Welle dämpft auf
    // 53 %, sein Winter bleibt über −1,9 °C. Das Meer ist das Wasser auf Meereshöhe; im Brack (`brack` über dem Meer) gehen
    // Salz und Schicht stetig in das Süßwasser und seine Säule über.
    // DER GANG: das Eis setzt ein, wenn das träge Wasser den Gefrierpunkt erreicht, und wächst nach STEFAN mit den Frost-Graden
    // der Luft (h²/2k + h/H = ∫(T_f − T_Luft) dt / ρL: Leitung durch das Eis, Übergang an die Luft); ist die Luft wärmer,
    // schmilzt es an der Oberfläche (dh/dt = −H·(T_Luft − T_f) / ρL). Ein Wasser, das nie über den Gefrierpunkt kommt, trägt
    // sein Eis durchs Jahr (der Kreis, in dem Wachsen und Schmelzen sich die Waage halten); friert die Luft immer, friert die
    // Säule durch. Gerechnet geschlossen auf der Jahres-Welle des Tagesmittels: das Eis integriert den Tag (sein Gang trägt
    // höchstens A_Tag/ω_Tag ≈ 0,8 K·d), kein Flackern am Tagesgang; ein See wächst in ~6 Tagen vom ersten Eis zum tragenden.
    // `feld(traegTage)` ist das Temperatur-Feld an der Höhe (die Naht des Wirts; ohne sie das Feld des Kerns).
    // DER STOFF (stoffe.K1): `stoff` trägt die Zeilen `wasser` und `eis` der Stoff-Tafel des Wirts in SI — ρ·c der Säule (ρ kg/m³,
    // c J/(kg·K)), der Gefrierpunkt des Süßwassers (T_schmelz in K), ρ des Eises, seine Schmelzwärme L (J/kg) und seine
    // Wärmeleitung k (W/(m·K)); der Kern hält keine Zahl eines Stoffs, nur die des Vorgangs: den Übergang H des Eises an die
    // Luft, Kopplung, Salz und Säule. Ohne Stoff bricht er laut. `traegt`: die Dicke, die den Menschen trägt (GOLD: P = A·h², A = 3,5 kg/cm² — 80 kg auf 4,8 cm).
    const EIS = Object.freeze({
        salzMeer: 35,
        gefrierJeSalz: -0.054,
        brack: [0.8, 2.8],
        kopplung: 25,
        saeule: [0.1, 30],
        meerSchicht: 50,
        uebergang: 20,
        traegt: 0.05,
    });
    // Der Wasserkörper mit dem Spiegel y über der Säule `tiefe`: sein Meer-Anteil, sein Gefrierpunkt (°C) und seine Trägheit
    // (Tage) aus dem Stoff des Wirts — Leser: `eisDicke` und die Linse, die das Wasser des Körpers misst.
    function wasserKoerper(L, y, tiefe, stoff) {
        if (!Number.isFinite(y) || !Number.isFinite(tiefe)) throw new Error("gelaende-core wasserKoerper: Höhe oder Tiefe fehlt");
        const W = stoff && stoff.wasser;
        const I = stoff && stoff.eis;
        if (!(W && W.rho * W.c > 0 && W.tSchmelz > 0 && I && I.rho * I.L > 0 && I.k > 0))
            throw new Error("gelaende-core wasserKoerper: der Stoff fehlt (die Zeilen wasser und eis der Stoff-Tafel)");
        const E = EIS;
        const wl = Number.isFinite(L.waterLevel) ? L.waterLevel : (L.baseHeight || 0) - GRUND.meerUnterBasis;
        const meer = 1 - glatt(E.brack[0], E.brack[1], y - wl);
        const saeule = Math.min(E.saeule[1], Math.max(E.saeule[0], tiefe));
        return {
            meer,
            gefrier: W.tSchmelz - 273.15 + E.gefrierJeSalz * E.salzMeer * meer,
            traegTage: ((saeule + (E.meerSchicht - saeule) * meer) * (W.rho * W.c)) / E.kopplung / 86400,
        };
    }
    function eisDicke(L, y, saison, tiefe, feld, stoff) {
        if (!Number.isFinite(saison)) throw new Error("gelaende-core eisDicke: die Saison fehlt");
        const E = EIS;
        const K = wasserKoerper(L, y, tiefe, stoff);
        const k = stoff.eis.k;
        const schmelzJeM3 = stoff.eis.rho * stoff.eis.L;
        const F = feld || ((tr) => temperaturFeld(L, y, tr));
        const luft = F(0);
        const wasser = F(K.traegTage);
        const tf = K.gefrier;
        const zuB = (W) => tf - W.mittel + W.kuehlung;
        const A = luft.jahr.amp;
        const ca = zuB(luft) / A;
        const cw = zuB(wasser) / wasser.jahr.amp;
        if (ca <= -1 || cw <= -1) return 0;
        if (ca >= 1) return tiefe;
        const tage = TEMPERATUR.jahrTage / (2 * Math.PI);
        const frost = (a, b) =>
            (tage * 86400 * (zuB(luft) * (b - a) - A * (Math.sin(b - luft.jahr.spaet) - Math.sin(a - luft.jahr.spaet)))) /
            schmelzJeM3;
        const kH = k / E.uebergang;
        const g = (h) => (h * h) / (2 * k) + h / E.uebergang;
        const stefan = (q) => Math.sqrt(kH * kH + 2 * k * Math.max(0, q)) - kH;
        const psiA = luft.jahr.spaet + Math.acos(ca);
        const psiB = luft.jahr.spaet + 2 * Math.PI - Math.acos(ca);
        let psiAn = wasser.jahr.spaet + Math.acos(cw);
        let h0 = 0;
        if (cw >= 1) {
            const M = -E.uebergang * frost(psiB, psiA + 2 * Math.PI);
            psiAn = psiA;
            h0 = Math.max(0, ((frost(psiA, psiB) - M / E.uebergang - (M * M) / (2 * k)) * k) / M);
        }
        if (!(psiAn < psiB)) return 0;
        const psi = 2 * Math.PI * (saison - luft.jahr.gipfel);
        const p = psiAn + (((psi - psiAn) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        if (p <= psiB) return Math.min(tiefe, stefan(g(h0) + frost(psiAn, p)));
        const hB = stefan(g(h0) + frost(psiAn, psiB));
        return Math.min(tiefe, Math.max(0, hB + E.uebergang * frost(psiB, p)));
    }

    // DER SCHNEE-PEGEL (stoffe.K3-2): das Wasser des Schnees an der Höhe y in Metern (Schnee-Wasser-Äquivalent) — eine Funktion
    // der Höhe und der Saison auf dem Temperatur-Feld (`feld(traegTage)`, die Naht des Wirts; ohne sie das Feld des Kerns).
    // DER GANG (Grad-Tag, Braithwaite 1995): liegt das Tagesmittel der Luft unter 0 °C, fällt Schnee mit `fall` Wasser je Tag;
    // darüber schmilzt er mit `gradTag` je Kelvin und Tag, bis der Pegel leer ist. Gerechnet geschlossen auf der Jahres-Welle
    // des Tagesmittels (wie das Eis): der Frost beginnt, wo die Welle die Null-Linie fällt, der Pegel wächst linear bis zu ihrem
    // Steigen, dann zehrt die Wärme das Integral der Grad-Tage. Zehrt der Sommer nicht alles, bleibt der Schnee übers Jahr: der
    // Firn (`firn` + die Welle des Jahres darüber). Die Sonne trägt die Welle (Jahr und Höhe im Feld).
    // DIE LINIE (`schneeLinie`): die tiefste Höhe, an der der Pegel `deckt` trägt — der Pegel wächst mit der Höhe (kälter:
    // länger Frost, kürzer Schmelze), also ist sie EINE Höhe je Saison (Halbierung auf 1 cm zwischen 250 m unter und 1 km über
    // dem Meer). DER VERSATZ (`schneeVersatz`): ihr Weg seit der Sommer-Mitte (`TEMPERATUR.sommerPhase`) in Stufen von `stufe`
    // m — der Leser der Schneegrenze (`schnee`); zur Sommer-Mitte genau 0. Die Zahlen (Hock 2003): der Grad-Tag-Faktor des
    // Schnees 3–6 mm/(K·d), Schneefall 1,5 mm Wasser je Frosttag; der Schnee deckt ab 5 cm Wasser. Mit ihnen liegt die Linie zur
    // Sommer-Mitte auf 140,6 m über dem Meer, am Beginn des Bands K16 (`SCHNEE.start`): das Band beginnt an der Linie des Pegels,
    // im Winter am Meer (−31 m).
    const SCHMELZE = Object.freeze({
        fall: 0.0015,
        gradTag: 0.006,
        deckt: 0.05,
        firn: 2,
        stufe: 2,
    });
    function schneePegel(L, y, saison, feld) {
        if (!Number.isFinite(y) || !Number.isFinite(saison))
            throw new Error("gelaende-core schneePegel: Höhe oder Saison fehlt");
        const S = SCHMELZE;
        const F = feld ? feld(0) : temperaturFeld(L, y, 0);
        const A = F.jahr.amp;
        const basis = F.mittel - F.kuehlung;
        const c = -basis / A;
        if (c <= -1) return 0;
        const tage = TEMPERATUR.jahrTage / (2 * Math.PI);
        const psi = 2 * Math.PI * (saison - F.jahr.gipfel) - F.jahr.spaet;
        const a = Math.acos(Math.min(1, c)); // friert die Luft immer, beginnt die (leere) Schmelze am wärmsten Tag
        const u = (((psi + a) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) - a;
        const zehrt = (v) => S.gradTag * tage * (basis * (v + a) + A * (Math.sin(v) + Math.sin(a)));
        const voll = S.fall * tage * (2 * Math.PI - 2 * a);
        // der Rest, den der Sommer nicht zehrt: über dem Firn bleibt er bis zur nächsten Schmelze (der Überschuss des Jahres
        // fließt als Eis ab — der Gang springt um ihn, wo die Schmelze beginnt)
        const rest = Math.max(0, voll - zehrt(a));
        const firn = rest > 0 ? S.firn : 0;
        if (u >= a) return firn + rest + S.fall * tage * (u - a);
        return firn + Math.max(0, voll - zehrt(u));
    }
    function schneeLinie(L, saison, feldAt) {
        const wl = Number.isFinite(L.waterLevel) ? L.waterLevel : (L.baseHeight || 0) - GRUND.meerUnterBasis;
        const F = feldAt || ((y, tr) => temperaturFeld(L, y, tr));
        const traegt = (y) => schneePegel(L, y, saison, (tr) => F(y, tr)) >= SCHMELZE.deckt;
        let [lo, hi] = [wl - 250, wl + 1000];
        if (traegt(lo)) return lo;
        if (!traegt(hi)) return hi;
        while (hi - lo > 0.01) {
            const m = (lo + hi) / 2;
            if (traegt(m)) hi = m;
            else lo = m;
        }
        return hi;
    }
    function schneeVersatz(L, saison, feldAt) {
        const weg = schneeLinie(L, saison, feldAt) - schneeLinie(L, TEMPERATUR.sommerPhase, feldAt);
        return Math.round(weg / SCHMELZE.stufe) * SCHMELZE.stufe;
    }

    // DER PEGEL (stoffe.K3-2 — die Schmelze speist ihn; wetter.K3: der Regen an DERSELBEN Stelle, `abfluss`): der Hub des Spiegels
    // der Binnen-Gewässer (See und Fluss, nie das Meer) über ihren Ruhe-Spiegel — eine Funktion der Höhe y ihres Spiegels und der
    // Saison auf dem Temperatur-Feld (`feld(traegTage)`, die Naht des Wirts) und des Regens (`regen`, m je Tag, `pegelRegen`).
    // DER ABFLUSS (`abfluss`, m Wasser je Tag): was die Fläche an der Höhe y ihrem Wasser gibt — die Schmelze des Schnee-Pegels
    // (Grad-Tag: `SCHMELZE.gradTag` je Kelvin des Tagesmittels über 0 °C, solange der Pegel Wasser trägt; der Firn des Gebirges
    // schmilzt den Sommer hindurch), dazu der Regen (unten). Die Fläche um den Spiegel steht für sein Einzugsgebiet (stromauf liegt es höher und schmilzt
    // später — nicht gerechnet).
    // DER HUB: der Ruhe-Spiegel führt den mittleren Abfluss des Klimas (`spende`, 330 mm im Jahr, gemäßigt-kontinental), das Bett
    // formte der bordvolle (Leopold & Wolman 1957): seine Krone liegt Freibord · Tiefe über dem Ruhe-Spiegel (`spiegelFreibord` ·
    // `kanalTiefe` der Hydrosphäre, die Damm-Krone mindestens `dammFreibord`). Im breiten Bett wächst die Tiefe mit dem Abfluss
    // hoch 3/5 (Manning): Hub = (1 − f)·T·((1 + Abfluss/spende)^(3/5) − 1), gedeckelt an der Krone — darüber trägt die Aue den
    // Überschuss (nicht gerechnet). Jede Schmelze über 0,6 mm am Tag füllt das Bett bis zur Krone (0,2 m): das Frühjahr hebt See
    // und Fluss bordvoll, solange der Schnee an ihrer Höhe Wasser trägt.
    // DIE TAFEL (`pegelTafel`): der Hub je `dy` m Höhe von `unter` unter dem Meer bis `ueber` darüber, in Stufen von `stufe` m, zum
    // Tagesmittel der Saison; null, wo kein Wasser steigt. Die Lage trägt sie (`L.pegel`: der Wirt zieht sie je Tag der Welt und je Stempel des
    // Regens nach, der Faden bekommt sie im Stand). `pegelHub` liest sie, linear zwischen den Metern: der Spiegel jedes Sees (`koerperY`) und
    // jedes Flusses (`flussAm`, `spiegelQuer`, `flussRand`) — nie das Bett (`flussKanal`). Der Hub hängt am Spiegel allein: ein ebener Fluss-Abschnitt
    // hebt sich eben, und stromab steigt kein Spiegel — der Hub fällt mit der Höhe höchstens 0,2 m je Meter (die Linie der
    // Schmelze rampt über 0,09 K, 0,8 m Höhe).
    // DER REGEN (wetter.K3, `pegelRegen`): der zweite Term des Abflusses neben der Schmelze, an jeder Höhe gleich (das Wetter-Wort
    // gilt der ganzen Seite). Der Regen der Stärke 1 (das Wetter-Feld `rain`, der Sturm) fällt mit 10 mm je Stunde, 0,3 davon
    // fließt ab (Abfluss-Beiwert der Wiese): `regen` m je Tag. Das Einzugsgebiet steht im Gleichgewicht mit dem Regen des Felds
    // (Abfluss = Regen · Beiwert): der Term ist eine FUNKTION des Wetter-Felds wie das Wetter der Welt-Uhr (feld.K2#2) — kein
    // Speicher, der je Seite integriert und reist, keine Arbeit, solange das Feld steht. Der Sturm (1), der Landregen (0,6) und
    // der Niesel (0,12) füllen das Bett bis zur Krone, sobald ihr Feld gilt (über den Übergang des Worts); ohne Regen fällt der
    // Spiegel mit dem Feld. Die Lag-Zeit des Einzugsgebiets (Füllen und Ablaufen über Stunden) ist nicht gerechnet. `pegelRegen`
    // reicht der Tafel den Term auf die Stufe des Hubs (`stufe`) quantisiert: der Abfluss, dessen Regen allein den Hub k · `stufe`
    // trägt — die Tafel kennt höchstens Krone / `stufe` + 1 Regen-Stempel, der Wirt rechnet sie je Stempel, nie je Bild.
    const PEGEL = Object.freeze({ spende: 0.0009, unter: 40, ueber: 300, dy: 1, stufe: 0.01, regen: 0.072 });
    function abfluss(L, y, saison, feld, regen) {
        if (!Number.isFinite(y) || !Number.isFinite(saison)) throw new Error("gelaende-core abfluss: Höhe oder Saison fehlt");
        const r = regen > 0 ? regen : 0;
        if (!(schneePegel(L, y, saison, feld) > 0)) return r;
        const F = feld ? feld(0) : temperaturFeld(L, y, 0);
        const t = F.mittel - F.kuehlung + F.jahr.amp * Math.cos(2 * Math.PI * (saison - F.jahr.gipfel) - F.jahr.spaet);
        return SCHMELZE.gradTag * Math.max(0, t) + r;
    }
    // Das Bett der Hydrosphäre: [Tiefe T, Freibord f, Krone] (`pegelTafel`, `pegelRegen`).
    function pegelBett(L) {
        const H = L.hydroGesetz;
        if (!(H && H.kanalTiefe > 0 && H.spiegelFreibord > 0 && H.dammFreibord > 0))
            throw new Error("gelaende-core pegelTafel: das Gesetz der Hydrosphäre fehlt (kanalTiefe, Freibord)");
        return [H.kanalTiefe, H.spiegelFreibord, Math.min(H.spiegelFreibord * H.kanalTiefe, H.dammFreibord)];
    }
    function pegelRegen(L, rain) {
        if (!(rain > 0)) return 0;
        const P = PEGEL;
        const [T, f, krone] = pegelBett(L);
        const tf = (1 - f) * T;
        const k = Math.round(Math.min(krone, tf * (Math.pow(1 + (P.regen * rain) / P.spende, 0.6) - 1)) / P.stufe);
        return k > 0 ? P.spende * (Math.pow(1 + (k * P.stufe) / tf, 1 / 0.6) - 1) : 0;
    }
    function pegelTafel(L, saison, feldAt, regen) {
        const P = PEGEL;
        const wl = Number.isFinite(L.waterLevel) ? L.waterLevel : (L.baseHeight || 0) - GRUND.meerUnterBasis;
        const F = feldAt || ((y, tr) => temperaturFeld(L, y, tr));
        const [T, f, krone] = pegelBett(L);
        const y0 = Math.floor(wl - P.unter);
        const hub = new Float32Array(Math.round((P.unter + P.ueber) / P.dy) + 1);
        let steigt = false;
        for (let i = 0; i < hub.length; i++) {
            const y = y0 + i * P.dy;
            const a = abfluss(L, y, saison, (tr) => F(y, tr), regen);
            if (!(a > 0)) continue;
            hub[i] = Math.round(Math.min(krone, (1 - f) * T * (Math.pow(1 + a / P.spende, 0.6) - 1)) / P.stufe) * P.stufe;
            if (hub[i] > 0) steigt = true;
        }
        return steigt ? { y0, dy: P.dy, hub } : null;
    }
    function pegelHub(L, y) {
        const P = L.pegel;
        if (!P || !Number.isFinite(y)) return 0;
        const n = P.hub.length;
        const u = (y - P.y0) / P.dy;
        if (u <= 0) return P.hub[0];
        if (u >= n - 1) return P.hub[n - 1];
        const i = Math.floor(u);
        return P.hub[i] + (P.hub[i + 1] - P.hub[i]) * (u - i);
    }

    // DIE LAVA (stoffe.K3-2): geschmolzener Stein, der über die glut-Achse zu Stein erstarrt — ihr Zustand nach `alterS`
    // Sekunden Welt-Zeit. DER STOFF ist die Zeile `stein` der Stoff-Tafel des Wirts (ρ, c, T_schmelz in K); der Kern hält nur die
    // Zahlen des Vorgangs: die Überhitzung beim Ausbruch über T_schmelz, die Dicke der Decke, den Übergang α an die Luft
    // (Strahlung + Konvektion der glühenden Kruste, ~150 W/(m²·K)) und an das Wasser (Filmsieden, ~1 000), den Draper-Punkt, ab
    // dem Stein sichtbar glüht (798 K), und das Sieden des Wassers. DER GANG (Newton): T = T_Luft + (T₀ − T_Luft)·e^(−t/τ),
    // τ = ρ·c·d / α — am Wasser zehnmal schneller und unter DAMPF, solange die Decke über dem Sieden liegt. Unter T_schmelz ist
    // sie ERSTARRT (Stein); die GLUT (0…1) ist ihre Strahlung über dem Draper-Punkt (∝ T⁴), die die glut-Achse der Welt trägt.
    // Die Erstarrungs-Wärme trägt der Gang nicht (sie verzögerte die Erstarrung um ~ L/(c·ΔT)).
    // DER GANG UND DIE GLUT sind EIN Gesetz jedes heißen Körpers der Welt (`waermeGang`, `glutAus`: die Lava, der Stahl der Esse).
    const LAVA = Object.freeze({
        ueberhitzung: 150,
        dicke: 1,
        luft: 150,
        wasser: 1000,
        glueht: 798,
        sieden: 373.15,
    });
    // DER WÄRME-GANG (Newton): die Temperatur (K) eines Körpers, der von `vonK` nach `s` Sekunden gegen `zielK` strebt (τ s) —
    // geschlossen, darum auch der exakte Schritt eines Takts gegen ein Ziel, das über den Schritt steht.
    function waermeGang(zielK, vonK, s, tau) {
        return zielK + (vonK - zielK) * Math.exp(-Math.max(0, s) / tau);
    }
    // DIE GLUT (0…1) eines Körpers der Temperatur `TK`: seine Strahlung über dem Draper-Punkt (`LAVA.glueht`, ∝ T⁴), 1 bei `vollK`.
    function glutAus(TK, vollK) {
        const g4 = LAVA.glueht ** 4;
        return Math.min(1, Math.max(0, (TK ** 4 - g4) / (vollK ** 4 - g4)));
    }
    function lava(alterS, amWasser, luftC, stoff) {
        if (!Number.isFinite(alterS) || !Number.isFinite(luftC)) throw new Error("gelaende-core lava: Alter oder Luft fehlt");
        const S = stoff && stoff.stein;
        if (!(S && S.rho * S.c > 0 && S.tSchmelz > 0))
            throw new Error("gelaende-core lava: der Stoff fehlt (die Zeile stein der Stoff-Tafel)");
        const V = LAVA;
        const tau = (S.rho * S.c * V.dicke) / (amWasser ? V.wasser : V.luft);
        const tu = luftC + 273.15;
        const t0 = S.tSchmelz + V.ueberhitzung;
        const T = waermeGang(tu, t0, alterS, tau);
        return {
            temperatur: T - 273.15,
            glut: glutAus(T, t0),
            erstarrt: T < S.tSchmelz,
            dampf: !!amWasser && T > V.sieden,
            tau,
        };
    }

    function wildnisY(L, x, z, mitDetail, aus) {
        const N = netzFuer(L);
        const n = L.noise;
        const base = N.base;
        const gf = grossform(N, x, z);
        const mess = { steil: 0, nah: 1, hang: 0, schutt: 0 };
        let h = flaeche(N, N.ebenen - 1, x, z, gf, mess);
        if (aus) {
            aus.hang = mess.hang;
            aus.schutt = mess.schutt;
        }
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
    // ("rand"). Je Glied die Enden, die Sohlen (`knotenSohle`, stromab streng fallend), das Einzugsgebiet A in m² und die
    // BAHN (`bahnPunkte`: der Mäander, Punkte im Abstand ≤ `schritt` m — der Wirt legt Kanal und Spiegel darauf). Ohne
    // Wildnis-Term (eine Bühne): der Bach jeder Klamm (`rinne`), die das Fenster berührt — EIN Glied auf ihrer Achse, Quelle
    // in A, die Sohle der Klamm, Ende im Meer (`term` "rinne": der Lauf gehört der Bühne, kein Wurf des Feldes).
    function flussLaeufe(L, x0, z0, x1, z1, schritt) {
        if (!(schritt > 0)) throw new Error("gelaende-core flussLaeufe: der Abtast-Schritt der Bahn fehlt");
        const T = L.erbgut && L.erbgut.terme;
        if (!T || !T.length) return [];
        if (T[0].art !== "wildnis") {
            const base = L.baseHeight || 0;
            const aus = [];
            for (const t of T) {
                if (t.art !== "rinne") continue;
                const xb = t.x0 + t.ex;
                const zb = t.z0 + t.ez;
                if (Math.max(t.x0, xb) < x0 || Math.min(t.x0, xb) >= x1 || Math.max(t.z0, zb) < z0 || Math.min(t.z0, zb) >= z1)
                    continue;
                const ux = t.ex / t.len;
                const uz = t.ez / t.len;
                const m = Math.max(1, Math.ceil(t.len / schritt));
                const bahn = [];
                for (let q = 0; q <= m; q++) {
                    const u = q / m;
                    bahn.push({ t: u, x: t.x0 + t.ex * u, z: t.z0 + t.ez * u, s: t.len * u, fx: ux, fz: uz });
                }
                aus.push({
                    k: 0,
                    quelle: true,
                    term: "rinne",
                    ende: "meer",
                    glieder: [
                        {
                            ax: t.x0,
                            az: t.z0,
                            bx: xb,
                            bz: zb,
                            ba: base + t.quelle,
                            bb: base + t.muendung,
                            A: t.einzug * 1e6,
                            bahn,
                        },
                    ],
                });
            }
            return aus;
        }
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
                bahn: bahnPunkte(segment(N, kn), schritt),
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
    // `wandM` (K66): das Band der Wand — ein Punkt binnen wandM / 2 über einer Fläche liegt auf ihr (das Netz trägt die Feinform
    // ±0,2 m, Lehre 22), die Natur mehr als 2 · wandM (entlang der Normale) innen im Kegel der Böschung bleibt Natur (`erdbauWand`)
    const ERDBAU = Object.freeze({ boeschung: 0.6, reichweiteM: 16, zelleM: 16, wandM: 0.5 });
    const ERDBAU_ZAHL = ["cx", "cz", "phi", "ex", "ez", "y"];
    const TRASSE_ZAHL = ["x0", "z0", "y0", "x1", "z1", "y1", "w"];
    // FREI {cx, cz, phi, ex, ez} (das Brücken-Etikett des Plans v2): in seinem Rechteck gilt der Grund allein — keine Fläche,
    // keine Böschung (der Weg über das Welt-Wasser staut es nicht).
    const FREI_ZAHL = ["cx", "cz", "phi", "ex", "ez"];
    // GRUND {cx, cz, phi, ex, ez, saum, y, boxen, keller} (S4, der Grund eines Hauses aus seinem Körper-Satz, fachwerk `grundVon`
    // über `ortPlan`): der Rahmen des Hauses (welt = mitte + (lx·c + lz·s, −lx·s + lz·c)), seine Höhe y, je Box
    // [x0, x1, z0, z1, boden] haus-lokal — jede wird eine Platte mit `saum`; boden 1: das Haus zeichnet dort seinen Boden, der
    // gezeichnete Boden fällt in ihr (`erdbauSchnitt`); keller [x0, x1, z0, z1, y0, y1] (y über y) ist hohl (`erdbauHohl`);
    // ex/ez = die Reichweite des Grunds um die Mitte (der Wirt räumt danach seine Caches).
    const GRUND_ZAHL = ["cx", "cz", "phi", "ex", "ez", "saum", "y"];
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
        // DER GRUND DER HÄUSER (S4, `grund`): je Haus sein Körper-Satz und Keller im Rahmen des Hauses, mit einem eigenen Raster
        // (`grundZellen`: die Zellen, die seine Boxen berühren) — die Leser des Grunds (`erdbauGrund`, `erdbauHohl`,
        // `erdbauSchnitt`) fragen nur ihre Zelle; die Keller tragen ein eigenes (`kellerZellen`: nur der Kasten des Raums) — der
        // Heiß-Pfad des Felds (`erdbauHohl`, je Dichte-Probe) fragt im Dorf nicht jedes Haus
        const gruende = [];
        const grundZellen = new Map();
        const kellerZellen = new Map();
        let hohl = 0;
        let schnitt = 0;
        const rastern = (karte, x0, x1, z0, z1, i) => {
            for (let a = Math.floor(x0 / Z); a <= Math.floor(x1 / Z); a++)
                for (let b = Math.floor(z0 / Z); b <= Math.floor(z1 / Z); b++) {
                    const key = (a + 32768) * 65536 + (b + 32768);
                    const liste = karte.get(key);
                    if (liste) liste.push(i);
                    else karte.set(key, [i]);
                }
        };
        const platte = (cx, cz, c, sn, ex, ez, y, frei) => {
            splats.push({ platte: !frei, frei, cx, cz, c, s: sn, ex, ez, y: frei ? NaN : y });
            const hx = Math.abs(ex * c) + Math.abs(ez * sn) + (frei ? 0 : R);
            const hz = Math.abs(ex * sn) + Math.abs(ez * c) + (frei ? 0 : R);
            rastern(zellen, cx - hx, cx + hx, cz - hz, cz + hz, splats.length - 1);
        };
        for (let i = 0; i < roh.length; i++) {
            const p = roh[i];
            const art = p && p.art;
            const namen =
                art === "platte"
                    ? ERDBAU_ZAHL
                    : art === "trasse"
                      ? TRASSE_ZAHL
                      : art === "frei"
                        ? FREI_ZAHL
                        : art === "grund"
                          ? GRUND_ZAHL
                          : null;
            if (!namen) throw new Error("gelaende-core: Erdbau-Splat " + i + " trägt die fremde Art " + art);
            for (const k of namen)
                if (!Number.isFinite(p[k])) throw new Error("gelaende-core: Erdbau-Splat " + i + " ohne Zahl " + k);
            if (art === "grund") {
                // je Box eine Platte mit Saum (die Höhe des Hauses, im Rahmen des Hauses), der Grund selbst ins eigene Raster
                const ok = (z, n) => Array.isArray(z) && z.length === n && z.every((v) => Number.isFinite(v));
                if (!Array.isArray(p.boxen) || !p.boxen.length || !p.boxen.every((b) => ok(b, 5) && b[1] > b[0] && b[3] > b[2]))
                    throw new Error("gelaende-core: Erdbau-Splat " + i + " (grund) ohne Boxen [x0, x1, z0, z1, boden]");
                if (p.keller != null && !(ok(p.keller, 6) && p.keller[1] > p.keller[0] && p.keller[3] > p.keller[2] && p.keller[5] > p.keller[4]))
                    throw new Error("gelaende-core: Erdbau-Splat " + i + " (grund) mit Keller ohne [x0, x1, z0, z1, y0, y1]");
                const c = Math.cos(p.phi);
                const sn = Math.sin(p.phi);
                const g = { cx: p.cx, cz: p.cz, c, s: sn, y: p.y, boxen: p.boxen, keller: p.keller || null, schnitt: 0 };
                for (const b of p.boxen) {
                    const lx = (b[0] + b[1]) / 2;
                    const lz = (b[2] + b[3]) / 2;
                    const hx = (b[1] - b[0]) / 2 + p.saum;
                    const hz = (b[3] - b[2]) / 2 + p.saum;
                    platte(p.cx + lx * c + lz * sn, p.cz - lx * sn + lz * c, c, sn, hx, hz, p.y, false);
                    if (b[4]) g.schnitt++;
                }
                if (g.keller) {
                    hohl++;
                    const K = g.keller;
                    const [mx, mz] = [(K[0] + K[1]) / 2, (K[2] + K[3]) / 2];
                    const kx = Math.abs(((K[1] - K[0]) / 2) * c) + Math.abs(((K[3] - K[2]) / 2) * sn);
                    const kz = Math.abs(((K[1] - K[0]) / 2) * sn) + Math.abs(((K[3] - K[2]) / 2) * c);
                    const [wx, wz] = [p.cx + mx * c + mz * sn, p.cz - mx * sn + mz * c];
                    rastern(kellerZellen, wx - kx, wx + kx, wz - kz, wz + kz, gruende.length);
                }
                schnitt += g.schnitt;
                gruende.push(g);
                const hx = Math.abs(p.ex * c) + Math.abs(p.ez * sn);
                const hz = Math.abs(p.ex * sn) + Math.abs(p.ez * c);
                rastern(grundZellen, p.cx - hx, p.cx + hx, p.cz - hz, p.cz + hz, gruende.length - 1);
            } else if (art === "platte" || art === "frei") {
                platte(p.cx, p.cz, Math.cos(p.phi), Math.sin(p.phi), p.ex, p.ez, p.y, art === "frei");
            } else {
                const dx = p.x1 - p.x0;
                const dz = p.z1 - p.z0;
                const len2 = dx * dx + dz * dz;
                if (p.weg != null && !Number.isFinite(p.weg))
                    throw new Error("gelaende-core: Erdbau-Splat " + i + " trägt keinen Weg als Zahl");
                const weg = p.weg == null ? -1 : p.weg;
                splats.push({ platte: false, x0: p.x0, z0: p.z0, dx, dz, len2, y0: p.y0, dy: p.y1 - p.y0, hw: p.w / 2, weg });
                const m = p.w / 2 + R;
                const [ax0, ax1] = [Math.min(p.x0, p.x1) - m, Math.max(p.x0, p.x1) + m];
                const [az0, az1] = [Math.min(p.z0, p.z1) - m, Math.max(p.z0, p.z1) + m];
                rastern(zellen, ax0, ax1, az0, az1, splats.length - 1);
            }
        }
        return { n: splats.length, splats, zellen, gruende, grundZellen, kellerZellen, hohl, schnitt };
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
            if (!p.frei) continue;
            const dx = x - p.cx;
            const dz = z - p.cz;
            if (Math.abs(dx * p.c - dz * p.s) <= p.ex && Math.abs(dx * p.s + dz * p.c) <= p.ez) return h; // unter der Brücke: der Grund
        }
        for (let k = 0; k < liste.length; k++) {
            const p = E.splats[liste[k]];
            if (p.frei) continue;
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
    // DER GRUND AM PUNKT (S4, der EINE Grundriss-Leser des Erdbaus): liegt (x, z) in einer Box eines Hauses (dem Körper-Satz
    // seines Grunds, `rand` m über ihre Wand hinaus)? 1 oder 0. Leser: die Nah-Wiese (der Kreis jedes Büschels).
    function erdbauGrund(E, x, z, rand) {
        if (!E || !E.gruende || !E.gruende.length) return 0;
        const Z = ERDBAU.zelleM;
        const r = rand > 0 ? rand : 0;
        // je Zelle, die der Kreis berührt: der Grund ist nur über seinem Saum gerastert, der Kreis reicht weiter
        for (let i = Math.floor((x - r) / Z); i <= Math.floor((x + r) / Z); i++)
            for (let j = Math.floor((z - r) / Z); j <= Math.floor((z + r) / Z); j++) {
                const liste = E.grundZellen.get((i + 32768) * 65536 + (j + 32768));
                for (let k = 0; liste && k < liste.length; k++) {
                    const g = E.gruende[liste[k]];
                    const dx = x - g.cx;
                    const dz = z - g.cz;
                    const u = dx * g.c - dz * g.s;
                    const v = dx * g.s + dz * g.c;
                    for (const b of g.boxen) if (u > b[0] - r && u < b[1] + r && v > b[2] - r && v < b[3] + r) return 1;
                }
            }
        return 0;
    }
    // DER KELLER IST HOHL (S4): die Dichte d an (x, y, z) mit dem Hohlraum jedes Kellers vereinigt — im Raum (ein Kasten) der
    // Abstand zu seiner nächsten Wand, negativ: Luft; außen bleibt d (die Oberfläche neben dem Keller rückt nicht). Der Leib geht über die Treppe des Hauses hinab, sein Boden ist der
    // Kellerboden des Hauses. Leser: das Feld des Wirts (`_terrainDensityAt`, `_fieldDensityAt` — Leib, Kollision, Wasser),
    // nie das Gitter des Netzes: der gezeichnete Boden fällt im Grund des Hauses (`erdbauSchnitt`), das Haus zeichnet seinen
    // Keller — ein Hohlraum im 1,8-m-Gitter risse eine Rinne vor die Wand.
    function erdbauHohl(E, x, y, z, d) {
        if (!E || !E.hohl) return d;
        const Z = ERDBAU.zelleM;
        const liste = E.kellerZellen.get((Math.floor(x / Z) + 32768) * 65536 + (Math.floor(z / Z) + 32768));
        if (!liste) return d;
        for (let k = 0; k < liste.length; k++) {
            const g = E.gruende[liste[k]];
            const K = g.keller;
            if (!K) continue;
            const dx = x - g.cx;
            const dz = z - g.cz;
            const u = dx * g.c - dz * g.s;
            const v = dx * g.s + dz * g.c;
            const a = Math.max(K[0] - u, u - K[1], K[2] - v, v - K[3], g.y + K[4] - y, y - g.y - K[5]);
            if (a < 0 && a < d) d = a; // nur IM Raum: außen bleibt die Dichte des Grunds (die Oberfläche neben dem Keller rückt nicht)
        }
        return d;
    }
    // DIE SPALTE ÜBER DEM KELLER (S4): liegt (x, z) im Grundriss eines Kellers? 1 oder 0 — eine Spalte ohne Keller trägt in jeder
    // Höhe die Dichte des Grunds (`erdbauHohl` ändert dort nichts). Leser: das Feld des Wirts fragt EINMAL je Spalte
    // (`_fieldDensityAt` mit dem Spalten-Kontext), nie je Probe.
    function erdbauKeller(E, x, z) {
        if (!E || !E.hohl) return 0;
        const Z = ERDBAU.zelleM;
        const liste = E.kellerZellen.get((Math.floor(x / Z) + 32768) * 65536 + (Math.floor(z / Z) + 32768));
        for (let k = 0; liste && k < liste.length; k++) {
            const g = E.gruende[liste[k]];
            const K = g.keller;
            const u = (x - g.cx) * g.c - (z - g.cz) * g.s;
            const v = (x - g.cx) * g.s + (z - g.cz) * g.c;
            if (u > K[0] && u < K[1] && v > K[2] && v < K[3]) return 1;
        }
        return 0;
    }
    // DER BODEN FÄLLT IM GRUND DES HAUSES (S4): das Netz eines Boden-Chunks (Positionen P [x, y, z …], Index I, je Dreieck T —
    // die Zelle seiner Luft, optional) verliert jede Fläche AUF DER PLATTE einer Box mit boden 1 (ein Dreieck, das binnen
    // wandM / 2 über ihrer Höhe y beginnt; was ganz darüber liegt, ist Gebautes — der Turm auf dem Dach, bauen.K4 — und bleibt;
    // bis bk4-turm fiel jede Fläche des Grundrisses in jeder Höhe, der Leib stand auf einem ungezeichneten Turm, `_bodenSichtAt`
    // null) — exakt an der Wand: ein Dreieck, das die
    // Box schneidet, behält seine Stücke außen (konvexe Polygone, je Halbebene der Box abgetrennt, Fächer), die neuen Ecken
    // liegen auf seinen Kanten (y linear, auf der Fläche des Dreiecks) und hängen an P. Läuft im Bau des Netzes VOR Normalen,
    // Stoff, Himmels-Sicht und Stufen-Ziel (sie lesen die neuen Ecken wie jede andere) — im Voxel-Faden und im Sync-Bau, EIN
    // Code. Ändert P, I und T an Ort und Stelle; true, wenn ein Dreieck fiel oder geschnitten wurde.
    function erdbauSchnitt(E, P, I, T) {
        if (!E || !E.schnitt || !P.length) return false;
        let mx0 = Infinity;
        let mx1 = -Infinity;
        let mz0 = Infinity;
        let mz1 = -Infinity;
        for (let k = 0; k < P.length; k += 3) {
            if (P[k] < mx0) mx0 = P[k];
            if (P[k] > mx1) mx1 = P[k];
            if (P[k + 2] < mz0) mz0 = P[k + 2];
            if (P[k + 2] > mz1) mz1 = P[k + 2];
        }
        // die Boxen, deren Welt-Kasten den des Netzes berührt
        const K = [];
        const Z = ERDBAU.zelleM;
        const gesehen = new Set();
        for (let a = Math.floor(mx0 / Z); a <= Math.floor(mx1 / Z); a++)
            for (let b = Math.floor(mz0 / Z); b <= Math.floor(mz1 / Z); b++) {
                const liste = E.grundZellen.get((a + 32768) * 65536 + (b + 32768));
                if (liste) for (const i of liste) gesehen.add(i);
            }
        for (const i of gesehen) {
            const g = E.gruende[i];
            for (const b of g.boxen) {
                if (!b[4]) continue;
                let wx0 = Infinity;
                let wx1 = -Infinity;
                let wz0 = Infinity;
                let wz1 = -Infinity;
                for (const [lx, lz] of [[b[0], b[2]], [b[1], b[2]], [b[0], b[3]], [b[1], b[3]]]) {
                    const wx = g.cx + lx * g.c + lz * g.s;
                    const wz = g.cz - lx * g.s + lz * g.c;
                    wx0 = Math.min(wx0, wx);
                    wx1 = Math.max(wx1, wx);
                    wz0 = Math.min(wz0, wz);
                    wz1 = Math.max(wz1, wz);
                }
                if (wx1 < mx0 || wx0 > mx1 || wz1 < mz0 || wz0 > mz1) continue;
                K.push({ g, b, wx0, wx1, wz0, wz1 });
            }
        }
        if (!K.length) return false;
        // ein konvexes Polygon (Ecken {x, y, z, i}) an der Halbebene f(p) = s · (Koordinate − w) ≥ 0 teilen: [innen, außen]
        const teile = (poly, f) => {
            const vorn = [];
            const hinten = [];
            for (let k = 0; k < poly.length; k++) {
                const A = poly[k];
                const B = poly[(k + 1) % poly.length];
                const fa = f(A);
                const fb = f(B);
                (fa >= 0 ? vorn : hinten).push(A);
                if ((fa >= 0) !== (fb >= 0)) {
                    const t = fa / (fa - fb);
                    const N = { x: A.x + (B.x - A.x) * t, y: A.y + (B.y - A.y) * t, z: A.z + (B.z - A.z) * t, i: -1 };
                    vorn.push(N);
                    hinten.push(N);
                }
            }
            return [vorn.length >= 3 ? vorn : null, hinten.length >= 3 ? hinten : null];
        };
        const ecke = (p) => {
            if (p.i < 0) {
                p.i = P.length / 3;
                P.push(p.x, p.y, p.z);
            }
            return p.i;
        };
        const nI = [];
        const nT = T ? [] : null;
        let fiel = false;
        const n = I.length;
        for (let t = 0; t < n; t += 3) {
            const ia = I[t];
            const ib = I[t + 1];
            const ic = I[t + 2];
            const tx0 = Math.min(P[ia * 3], P[ib * 3], P[ic * 3]);
            const tx1 = Math.max(P[ia * 3], P[ib * 3], P[ic * 3]);
            const tz0 = Math.min(P[ia * 3 + 2], P[ib * 3 + 2], P[ic * 3 + 2]);
            const tz1 = Math.max(P[ia * 3 + 2], P[ib * 3 + 2], P[ic * 3 + 2]);
            const ty0 = Math.min(P[ia * 3 + 1], P[ib * 3 + 1], P[ic * 3 + 1]);
            let stuecke = null;
            for (const q of K) {
                if (tx1 < q.wx0 || tx0 > q.wx1 || tz1 < q.wz0 || tz0 > q.wz1) continue;
                if (ty0 > q.g.y + ERDBAU.wandM / 2) continue;
                if (!stuecke) {
                    const v = (i) => ({ x: P[i * 3], y: P[i * 3 + 1], z: P[i * 3 + 2], i });
                    stuecke = [[v(ia), v(ib), v(ic)]];
                }
                const { g, b } = q;
                const u = (p) => (p.x - g.cx) * g.c - (p.z - g.cz) * g.s;
                const w = (p) => (p.x - g.cx) * g.s + (p.z - g.cz) * g.c;
                const seiten = [(p) => u(p) - b[0], (p) => b[1] - u(p), (p) => w(p) - b[2], (p) => b[3] - w(p)];
                const neu = [];
                for (const poly of stuecke) {
                    let rest = poly;
                    for (const f of seiten) {
                        const [vorn, hinten] = teile(rest, f);
                        if (hinten) neu.push(hinten); // außen vor dieser Wand: bleibt
                        rest = vorn;
                        if (!rest) break;
                    }
                    // rest: innen — fällt
                }
                stuecke = neu;
                if (!stuecke.length) break;
            }
            if (!stuecke) {
                nI.push(ia, ib, ic);
                if (nT) nT.push(T[t / 3]);
                continue;
            }
            fiel = true;
            for (const poly of stuecke)
                for (let k = 1; k + 1 < poly.length; k++) {
                    nI.push(ecke(poly[0]), ecke(poly[k]), ecke(poly[k + 1]));
                    if (nT) nT.push(T[t / 3]);
                }
        }
        if (!fiel) return false;
        I.length = 0;
        for (let k = 0; k < nI.length; k++) I.push(nI[k]);
        if (nT) {
            T.length = 0;
            for (let k = 0; k < nT.length; k++) T.push(nT[k]);
        }
        return true;
    }
    // DIE WAND DES ERDBAUS (K66, Augen-Runde 15.10.: die Stufen des Dorfs trugen den Wiesen-Stoff als Flecken auf steilen
    // Flächen): das Gewicht 0 … 1, mit dem der Punkt (x, y, z) eines Boden-Netzes der Lage L (ny das y seiner Normale) an der
    // Wand des Erdbaus liegt — auf dem Kegel einer Böschung, an der Kante zwischen zwei Flächen oder am Absatz, wo der Kegel
    // an der Reichweite endet. Wer binnen `wandM` / 2 auf der Fläche liegt, die an (x, z) gilt (`erdbauY`: die letzte gewinnt),
    // oder unter einer Brücke (frei), trägt 0. Sonst je Splat in Reichweite (d der Abstand zu seiner Fläche, yS ihre Höhe), über
    // oder unter dessen Fläche der Punkt um mehr als `wandM` / 2 steht: sein Abstand zum Kegel d · boeschung, entlang der Normale
    // gemessen (e · ny, e = |y − yS| − d · boeschung — das Netz legt den Vertex einer steilen Flanke senkrecht weit neben die Höhe
    // an (x, z)), voll ab −`wandM`, 0 ab −2 `wandM`; das größte zählt. Bleibt es unter 1, entscheidet der Grund: hebt oder senkt
    // der Erdbau ihn an (x, z) um mehr als `wandM` / 2 (`hoeheGrund` gegen `erdbauY`), ist der Punkt Wand. Leser: der Fels-Stoff
    // (`felsStoff`: der Schutt des Erdbaus auf dem steilen Vertex).
    function erdbauWand(L, x, y, z, ny) {
        const E = L.erdbau;
        const Z = ERDBAU.zelleM;
        const liste = E.zellen.get((Math.floor(x / Z) + 32768) * 65536 + (Math.floor(z / Z) + 32768));
        if (!liste) return 0;
        const T = ERDBAU.wandM;
        const f = erdbauY(E, x, z, NaN);
        if (f === f && Math.abs(y - f) <= T / 2) return 0;
        const R = ERDBAU.reichweiteM;
        const B = ERDBAU.boeschung;
        let w = 0;
        for (let k = 0; k < liste.length; k++) {
            const p = E.splats[liste[k]];
            let d;
            let yS;
            if (p.frei) {
                const dx = x - p.cx;
                const dz = z - p.cz;
                if (Math.abs(dx * p.c - dz * p.s) <= p.ex && Math.abs(dx * p.s + dz * p.c) <= p.ez) return 0;
                continue;
            }
            if (p.platte) {
                const dx = x - p.cx;
                const dz = z - p.cz;
                const u = Math.abs(dx * p.c - dz * p.s) - p.ex;
                const v = Math.abs(dx * p.s + dz * p.c) - p.ez;
                d = u > 0 ? (v > 0 ? Math.hypot(u, v) : u) : v > 0 ? v : 0;
                yS = p.y;
            } else {
                let q = p.len2 > 0 ? ((x - p.x0) * p.dx + (z - p.z0) * p.dz) / p.len2 : 0;
                if (q < 0) q = 0;
                else if (q > 1) q = 1;
                d = Math.hypot(x - (p.x0 + p.dx * q), z - (p.z0 + p.dz * q)) - p.hw;
                if (d < 0) d = 0;
                yS = p.y0 + p.dy * q;
            }
            if (d > R) continue;
            const dy = Math.abs(y - yS);
            if (dy <= T / 2) continue;
            const g = ((dy - d * B) * ny) / T + 2;
            if (g > w) w = g >= 1 ? 1 : g;
        }
        if (w < 1) {
            const h = hoeheGrund(L, x, z, true);
            if (Math.abs(erdbauY(E, x, z, h) - h) > T / 2) w = 1;
        }
        return w;
    }

    // DIE FORM DES EDITS (F2a „hoch bauen", Karte editform-kern): jeder Edit des Spielers (Graben, Aufschütten, hoch bauen) ist
    // die SÄULE seines Maßes r — Radius r, halbe Höhe r, die Kanten gerundet (`kanteM`, höchstens r/2), oben und unten eben:
    // Aufschütten vereinigt sie mit dem Boden, Graben nimmt sie heraus, in Setz-Reihenfolge, in jeder Höhe und Tiefe gleich.
    // Gerechnet wird in Metern auf der GEKAPPTEN Dichte n = clamp(Basis, ±tiefeM) gegen das Abstandsfeld s der Säule (positiv
    // innen). Die Kehle (`rundM`) ist RUND und KOMPAKT: sie wirkt nur, wo der Boden UND die Säule näher als rundM liegen
    // (Vereinigung n > −rundM, Graben n < rundM, je s > −rundM); jenseits trägt jede Ecke die harte Form max(n, s) bzw.
    // min(n, −s), und wo sie den Boden wählt, bleibt er byte-alt (ein weiches Polynom wirkt überall, wo n ≈ ∓s, und rückt das
    // Netz bis 11 m um eine Grube r 3,5: die Wiese daneben fällt, gate:wasser-leben G5). EBEN, weil der Boden ein 1,8-m-Gitter ist: die
    // Kuppe einer Kugel trug das Netz 0,14–1,1 m unter dem Gesetz, eine Ebene trägt es genau — wer baut, steht auf dem, was er
    // sieht. Leser: der Punkt (`mitEdits`) und das Gitter (`editsImGitter`) in Stamm und Worker; die Reichweite (`editReich`)
    // die Edit-Karte, die Weckung um einen Edit und die Wache des Fern-Rings.
    const EDIT_FORM = Object.freeze({ tiefeM: 4, rundM: 1, kanteM: 0.5 });
    function editForm(n, ed, dx, dy, dz) {
        if (!(ed.r > 0)) return n; // ein Edit ohne Maß (Alt-Daten) ändert nichts
        const k = EDIT_FORM.rundM;
        const c = Math.min(EDIT_FORM.kanteM, ed.r * 0.5);
        const qx = Math.sqrt(dx * dx + dz * dz) - ed.r + c;
        const qy = Math.abs(dy) - ed.r + c;
        const s = c - Math.min(Math.max(qx, qy), 0) - Math.sqrt(Math.max(qx, 0) ** 2 + Math.max(qy, 0) ** 2);
        if (ed.mode === "fill") return n > -k && s > -k ? Math.hypot(k + n, k + s) - k : Math.max(n, s);
        return n < k && s > -k ? k - Math.hypot(k - n, k + s) : Math.min(n, -s);
    }
    // so weit ändert ein Edit die Dichte: jenseits liegt seine Säule (die Ecke im Abstand r·√2) um mehr als tiefeM unter der
    // gekappten Dichte (die Kehle wirkt nur näher als rundM < tiefeM)
    function editReich(ed) {
        return (Number.isFinite(ed.r) ? Math.max(ed.r, 1) : 1) * Math.SQRT2 + EDIT_FORM.tiefeM;
    }
    function editKappe(basis) {
        const K = EDIT_FORM.tiefeM;
        return basis < -K ? -K : basis > K ? K : basis;
    }
    // DIE KRONE: die höchste Oberkante der Füll-Edits einer Liste (y + r — dort endet die Säule eben; −Infinity ohne Füllung).
    // Darüber ist Luft: die Flächen-Probe (`_voxelSurfaceY`, Worker `voxelSurfaceY`) hebt ihre Garantie-Luft bis dorthin.
    function editKrone(edits) {
        let top = -Infinity;
        for (let i = 0; edits && i < edits.length; i++) {
            const e = edits[i];
            if (e && e.mode === "fill") {
                const t = (Number(e.y) || 0) + (Number(e.r) || 0);
                if (t > top) top = t;
            }
        }
        return top;
    }
    // DIE HÖHE MIT EDITS (die Ferne, gelaende.K2 (d)): die oberste Fläche über (x, z) einer Höhe h ohne Edits nach den Säulen
    // der Liste (Setz-Reihenfolge; die Form `editForm`: Radius r, halbe Höhe r, oben und unten eben) — eine Füllung hebt sie auf
    // ihre Krone (y + r), ein Graben, dessen Säule die Fläche öffnet, senkt sie auf seinen Grund (y − r) — ohne die Kehle der
    // Vereinigung (`rundM`: wo zwei Füllungen sich treffen, trägt die Dichte die Krone bis 0,41 m höher). Leser: die Nässe der
    // Ferne (`fernNass`, Stamm `_fernNass`) — der Fern-Ring trägt jeden Edit, der Kern rechnet ihn einmal für Faden und Stamm.
    function editHoehe(h, x, z, edits) {
        for (let i = 0; edits && i < edits.length; i++) {
            const e = edits[i];
            if (!e || !(e.r > 0) || (x - e.x) ** 2 + (z - e.z) ** 2 > e.r * e.r) continue;
            if (e.mode === "fill") h = Math.max(h, e.y + e.r);
            else if (e.y + e.r >= h && e.y - e.r < h) h = e.y - e.r;
        }
        return h;
    }
    // DER PUNKT: die Dichte über `basis` an (x, y, z) mit den Edits `edits` (Setz-Reihenfolge; ohne Liste die Basis) —
    // max(1, |Basis|/tiefeM) · n: stetig, gleich der Basis, wo kein Edit sie ändert, um jede Säule ihr Abstand (die Wand-Proben
    // des Leibs lesen ihn).
    function mitEdits(basis, x, y, z, edits) {
        if (!edits) return basis;
        let n = editKappe(basis);
        for (let e = 0; e < edits.length; e++) {
            const ed = edits[e];
            if (!ed) continue;
            const dx = x - ed.x;
            const dy = y - ed.y;
            const dz = z - ed.z;
            const R = editReich(ed);
            if (dx * dx + dy * dy + dz * dz < R * R) n = editForm(n, ed, dx, dy, dz);
        }
        return Math.max(1, Math.abs(basis) / EDIT_FORM.tiefeM) * n;
    }
    // DAS GITTER (Float32, Index i + j·Nx + k·Nx·Ny ab gox|goy|goz): jede Ecke in der Reichweite eines Edits (sein Kasten)
    // beginnt bei ihrer gekappten Basis und nimmt die Edits in Setz-Reihenfolge; sie trägt n (dieselbe Fläche wie der Punkt, ohne
    // dessen Maß — die Kanten des Gitters sehen das Abstandsfeld der Säule), wo kein Edit die Kappe änderte, wieder ihre Basis:
    // unberührter Boden bleibt byte-alt (die Kappe allein verschob die Interpolation steiler Kanten bis an den Rand der
    // Reichweite). Liefert eine Kopie, `basis` bleibt.
    function editsImGitter(basis, gox, goy, goz, Nx, Ny, Nz, step, edits) {
        const out = new Float32Array(basis);
        const beruehrt = new Uint8Array(out.length);
        for (let e = 0; e < edits.length; e++) {
            const ed = edits[e];
            if (!ed) continue;
            const R = editReich(ed);
            const R2 = R * R;
            const i0 = Math.max(0, Math.floor((ed.x - R - gox) / step));
            const i1 = Math.min(Nx - 1, Math.ceil((ed.x + R - gox) / step));
            const j0 = Math.max(0, Math.floor((ed.y - R - goy) / step));
            const j1 = Math.min(Ny - 1, Math.ceil((ed.y + R - goy) / step));
            const k0 = Math.max(0, Math.floor((ed.z - R - goz) / step));
            const k1 = Math.min(Nz - 1, Math.ceil((ed.z + R - goz) / step));
            for (let k = k0; k <= k1; k++) {
                const dz = goz + k * step - ed.z;
                for (let j = j0; j <= j1; j++) {
                    const dy = goy + j * step - ed.y;
                    for (let i = i0; i <= i1; i++) {
                        const dx = gox + i * step - ed.x;
                        if (dx * dx + dy * dy + dz * dz >= R2) continue;
                        const idx = i + j * Nx + k * Nx * Ny;
                        if (!beruehrt[idx]) {
                            beruehrt[idx] = 1;
                            out[idx] = editKappe(basis[idx]);
                        }
                        out[idx] = editForm(out[idx], ed, dx, dy, dz);
                    }
                }
            }
        }
        for (let idx = 0; idx < out.length; idx++)
            if (beruehrt[idx] && out[idx] === editKappe(basis[idx])) out[idx] = basis[idx];
        return out;
    }
    // DAS BAND DES GITTERS: je Spalte sampelt das Gitter nur die Ebenen um ihre Fläche `surf` — über `bandOben` ist garantiert
    // Luft (surf + 12, die größte 3D-Rauheit noise·7 + noise·5, + 4 Zellen: der Gradient-eps der Normalen, 1,5 Zellen — ein
    // Gipfel-Vertex sampelt +eps nach oben, sonst kippt seine Normale), unter `bandUnten` garantiert Fels (min(surf, base) − 40,
    // das Höhlen-Band endet base − 28; es folgt surf — in einer Tiefsee-Rinne, ~−75 m, füllte ein fixes base − 40 die Wassersäule
    // als Fels). Leser: das Gitter in Stamm und Worker.
    function bandOben(surf, oy, step) {
        return Math.floor((surf + 12 + 4 * step - oy) / step) + 1;
    }
    function bandUnten(surf, base, oy, step) {
        return Math.floor((Math.min(surf, base) - 40 - oy) / step);
    }
    // DAS BAND DECKT DIE EDITS: über dem Band trägt das Gitter Luft −1, unter ihm Fels +1 — bit-identisch, solange dort keine
    // Fläche liegt. Ein Edit legt seine Fläche dorthin (der Turm über dem Band, die tiefe Grube), und die Kappe der Form braucht
    // die wahre Basis: in der Reichweite jedes Edits (+ 4 Zellen, die Marge des Bands) sampelt jede Spalte `probe(x, y, z, ctx)`
    // (ctx = `spalte(x, z)`, sein `surf` legt das Band), wo das Band übersprang — je Spalte die Hülle der Edits, die sie
    // erreichen. Schreibt `density` an Ort und Stelle.
    function bandUmEdits(density, ox, oy, oz, Nx, Ny, Nz, step, edits, base, spalte, probe) {
        if (!edits || !edits.length) return;
        const huelle = new Map(); // Spalte i + k·Nx → [unterste, oberste] Ebene der Edits, die sie erreichen
        for (let e = 0; e < edits.length; e++) {
            const ed = edits[e];
            if (!ed) continue;
            const r = editReich(ed);
            const i0 = Math.max(0, Math.floor((ed.x - r - ox) / step) - 4);
            const i1 = Math.min(Nx - 1, Math.ceil((ed.x + r - ox) / step) + 4);
            const j0 = Math.max(0, Math.floor((ed.y - r - oy) / step) - 4);
            const j1 = Math.min(Ny - 1, Math.ceil((ed.y + r - oy) / step) + 4);
            const k0 = Math.max(0, Math.floor((ed.z - r - oz) / step) - 4);
            const k1 = Math.min(Nz - 1, Math.ceil((ed.z + r - oz) / step) + 4);
            if (j0 > j1) continue;
            for (let k = k0; k <= k1; k++)
                for (let i = i0; i <= i1; i++) {
                    const h = huelle.get(i + k * Nx);
                    if (!h) huelle.set(i + k * Nx, [j0, j1]);
                    else {
                        if (j0 < h[0]) h[0] = j0;
                        if (j1 > h[1]) h[1] = j1;
                    }
                }
        }
        for (const [s, h] of huelle) {
            const i = s % Nx;
            const k = (s - i) / Nx;
            const wx = ox + i * step;
            const wz = oz + k * step;
            const ctx = spalte(wx, wz);
            const oben = bandOben(ctx.surf, oy, step);
            const unten = bandUnten(ctx.surf, base, oy, step);
            for (let j = h[0]; j <= h[1]; j++)
                if (j > oben || j < unten) density[i + j * Nx + k * Nx * Ny] = probe(wx, oy + j * step, wz, ctx);
        }
    }

    // DER ORT LIEST DAS GELÄNDE (K10): die Lese-Funktionen, die der Plan v2 (fachwerk `ortPlan`) an der Lage L erhält — die
    // Höhe samt dem Erdbau früherer Orte (`hoehe`) und die Fläche seiner eigenen Splats (`erdbauFlaeche`). EIN ctx für den
    // Wirt (`_ortPlanSetzen` über seine lebende Lage), das Fachwerk-Studio (`buildDorf` über `lageGrund`) und die Linse
    // (gate:settlement Plan-Hash Studio = Welt): derselbe Export am selben Ort über derselben Lage ⇒ byte-derselbe Plan.
    // `wasserAt` (optional) nennt das Welt-Wasser für das Brücken-Etikett — der Wirt reicht sein Urteil (`_landAt`: Meer, See
    // und Fluss), ohne ihn gilt das Meer der Lage (Höhe unter `waterLevel`).
    // DAS HÖHEN-RASTER DER TRASSE (siedlung.K3): der Rahmen `r` {x0, z0, d, n} (fachwerk `trasseRahmen`, plan-lokal um den Ort
    // ox/oz) gefüllt mit dem Grund der Lage L VOR jedem Erdbau (`hoeheGrund`: der Plan ist eine Funktion von Saat und Gesetz — der
    // Wege-Bau nach dem Laden liest denselben Grund wie der erste Bau, nie den Erdbau des eigenen Orts), dem die Gassen des Exports
    // folgen (fachwerk `hoeheAusRaster` → `dorfLayout`). Leser: der Ort-Faden (voxel-worker `ort-raster`), das Studio, die Linse.
    function hoehenRaster(L, ox, oz, r) {
        const n = r.n;
        const h = new Float32Array(n * n);
        for (let j = 0; j < n; j++)
            for (let i = 0; i < n; i++) h[i + j * n] = hoeheGrund(L, ox + r.x0 + i * r.d, oz + r.z0 + j * r.d, true);
        return { x0: r.x0, z0: r.z0, d: r.d, n, h };
    }
    function ortCtx(L, wasserAt) {
        return {
            hoeheAt: (x, z) => hoehe(L, x, z, true),
            wasserAt: typeof wasserAt === "function" ? wasserAt : (x, z) => hoehe(L, x, z, true) < L.waterLevel,
            flaeche: (splats) => {
                const E = erdbauNormal(splats);
                return (x, z) => erdbauFlaeche(E, x, z);
            },
        };
    }
    // DIE LAGE EINER WELT OHNE WIRT (K10): Saat → die Lage, die der Wirt einer Welt ohne Erbgut trägt (die Eingangs-Welt
    // und jede Welt aus einer Saat): die Basis 0 (Stamm `state.terrainBaseHeight`), der Meeresspiegel Basis − 3 (Stamm
    // `state.waterLevel`), die Hydro-Kachel 2048 m (Stamm `HYDROSPHERE.regionSize`), das Erbgut [wildnis], kein Erdbau.
    // `Noise` ist der SimplexNoise-Bau (vendor/simplex-noise.js), der Strom seed + ":voxel" wie im Wirt. Weicht der Wirt
    // ab, bricht der Plan-Hash Studio = Welt (gate:settlement Teil O) beim Namen. Leser: das Fachwerk-Studio (`buildDorf`),
    // die Linse.
    const LAGE_GRUND = Object.freeze({ seed: "anazh-realm-seed", baseHeight: 0, meerUnterBasis: 3, regionSize: 2048 });
    function lageGrund(seed, Noise) {
        if (typeof Noise !== "function") throw new Error("gelaende-core: lageGrund braucht den SimplexNoise-Bau");
        const s = typeof seed === "string" && seed.length ? seed : LAGE_GRUND.seed;
        const terme = erbgutNormal(undefined);
        return {
            seed: s,
            noise: new Noise(s + ":voxel"),
            baseHeight: LAGE_GRUND.baseHeight,
            waterLevel: LAGE_GRUND.baseHeight - LAGE_GRUND.meerUnterBasis,
            erbgut: { terme, wildnis: 1 },
            regionSize: LAGE_GRUND.regionSize,
            erdbau: null,
        };
    }
    // DER HANG EINES ORTS (K10): die Ring-Suche ab r0 (Schritt 40 m, 48 Richtungen) nach dem ersten Ort, dessen Gefälle über
    // 16 m in [gMin, gMax] liegt und der trocken ist — 3 m über dem Meer und `trocken(x, z)` an acht Punkten in 40 m (der
    // Wirt reicht sein Wasser-Urteil, das Studio die Höhe über dem Meer). Leser: das Fachwerk-Studio (der Ort des Dorfs ohne
    // `?ort=`), gate:settlement Teil O (der Ort des Akts).
    function hangOrt(L, trocken, r0 = 1500, r1 = 4000, gMin = 0.12, gMax = 0.25) {
        const H = (x, z) => hoehe(L, x, z, true);
        for (let rr = r0; rr < r1; rr += 40)
            for (let k = 0; k < 48; k++) {
                const x = Math.cos((k / 48) * 2 * Math.PI) * rr;
                const z = Math.sin((k / 48) * 2 * Math.PI) * rr;
                const g = Math.hypot(H(x + 8, z) - H(x - 8, z), H(x, z + 8) - H(x, z - 8)) / 16;
                if (!(g >= gMin && g <= gMax) || !(H(x, z) > L.waterLevel + 3)) continue;
                let land = 0;
                for (let a = 0; a < 8; a++) if (trocken(x + 40 * Math.cos(a * 0.785), z + 40 * Math.sin(a * 0.785))) land++;
                if (land === 8) return { x, z, g };
            }
        return null;
    }

    // DER WIND AM GELÄNDE (wetter.K5, rein additiv): der Faktor, mit dem das Gelände den EINEN Wind am Ort (x, z) formt, der
    // nach (dx, dz) weht (Einheitsvektor); `H(x, z)` ist die Höhe des Wirts (die Welt: `hoehe` ohne Detail). LEE: der
    // steilste Blick gegen den Wind (der Schutz-Index Sx nach Winstral 2002: max über r von (H(o − r·d) − H(o)) / r) — steht
    // ein Kamm windauf über dem Ort, fällt der Wind um bis zu `lee.max` (−40 %; hinter Hügeln 30–60 %). TAL-DÜSE: steigen
    // BEIDE Flanken quer zum Wind (die schwächere zählt, je Flanke ihr steilster Anstieg über `duese.seite`), drängt das Tal
    // die Strömung zusammen — der Wind steigt um bis zu `duese.max` (+20 %), im Lee nie. Glatt zwischen `von` und `bis`
    // (tan der Böschung); flach und frei genau 1. Leser: der Wind der Welt (`_windAt`).
    const WIND_FORM = Object.freeze({
        lee: Object.freeze({ abstaende: Object.freeze([40, 80, 160, 320]), von: 0.05, bis: 0.25, max: 0.4 }),
        duese: Object.freeze({ seite: Object.freeze([60, 120]), von: 0.08, bis: 0.25, max: 0.2 }),
    });
    function windForm(H, x, z, dx, dz) {
        const glatt = (a, b, v) => {
            const u = Math.max(0, Math.min(1, (v - a) / (b - a)));
            return u * u * (3 - 2 * u);
        };
        const h0 = H(x, z);
        const L = WIND_FORM.lee;
        const D = WIND_FORM.duese;
        let sx = -Infinity;
        for (const r of L.abstaende) sx = Math.max(sx, (H(x - r * dx, z - r * dz) - h0) / r);
        let links = -Infinity;
        let rechts = -Infinity;
        for (const r of D.seite) {
            links = Math.max(links, (H(x - r * dz, z + r * dx) - h0) / r);
            rechts = Math.max(rechts, (H(x + r * dz, z - r * dx) - h0) / r);
        }
        const lee = glatt(L.von, L.bis, sx);
        const duese = glatt(D.von, D.bis, Math.min(links, rechts)) * (1 - lee);
        const f = 1 - L.max * lee + D.max * duese;
        if (!Number.isFinite(f)) throw new Error("windForm: die Höhe des Wirts ist nicht endlich bei " + x + ", " + z);
        return f;
    }

    // DIE EINE 2D-HÖHE der Welt = der Term-Auswerter ihres Erbguts: der erste Term setzt den Startwert (die Wildnis oder
    // eine Insel), jeder weitere legt sich nach seiner Art darauf — die Rampe addiert, die Bucht schneidet (Minimum).
    // Eine Welt ohne Erbgut trägt [wildnis]. Fehlt der Lage ihr Erbgut, wirft der Auswerter (fail-closed, nie still
    // Wildnis). Leser: jeder Leser der Höhe (Dichte, Hydrosphäre, Fern-Ring, Spawn-Ort) in Stamm und Worker.
    // `aus` (optional) trägt den Hang der Wildnis-Fläche (tan, `flaeche`) — ein Term darüber, der die Höhe ändert, nimmt
    // ihn (0: kein Hang-Urteil, wo Insel, Rampe oder Bucht formen), ebenso den Schutt des Schicht-Gesetzes (`aus.schutt`
    // 0..1: der Schutthang der Treppe × Stil, `treppeSchutt` — der Leser ist der Fels-Stoff des Bodens, K17) und die Wand des
    // Erdbaus (`aus.wand` 0 | 1, K66: der Grund-Zweig von `erdbauWand` — der Erdbau hebt oder senkt den Grund um mehr als
    // `wandM` / 2, und (x, z) liegt auf keiner Fläche; der Leser ist die Ferne, die keine Normale kennt — Ring, Kronen-Karte,
    // Feld-Pass: der Schutt des Fels-Stoffs mit dem vollen Gewicht wie im Netz).
    function hoehe(L, x, z, mitDetail = true, aus) {
        let h = hoeheGrund(L, x, z, mitDetail, aus);
        if (aus) aus.wand = 0;
        // der Erdbau der Orte (K10) liegt als letzter Term auf allem: der Ort vor dem Hang
        const E = L.erdbau;
        if (E) {
            const h2 = erdbauY(E, x, z, h);
            if (aus && h2 !== h) {
                aus.hang = 0;
                if (Math.abs(h2 - h) > ERDBAU.wandM / 2 && !(erdbauY(E, x, z, NaN) === erdbauY(E, x, z, NaN))) aus.wand = 1;
            }
            h = h2;
        }
        return h;
    }
    // DIE HÖHE UNTER DEM ERDBAU (K66): die Terme des Erbguts allein — `hoehe` legt den Erdbau als letzten Term darauf. Leser:
    // `hoehe`, die Wand des Erdbaus (`erdbauWand`: was der Erdbau bewegt).
    function hoeheGrund(L, x, z, mitDetail, aus) {
        const T = L.erbgut.terme;
        const t0 = T[0];
        if (aus) aus.hang = aus.schutt = 0;
        let h = t0.art === "wildnis" ? wildnisY(L, x, z, mitDetail, aus) : termY(t0, 0, x, z, L);
        for (let i = 1; i < T.length; i++) {
            const h2 = termY(T[i], h, x, z, L);
            if (aus && h2 !== h) aus.hang = aus.schutt = 0;
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
    // 2: der Mäander (die Aue fällt zur Bahn, die Zuflüsse münden auf ihr).
    const BODEN_GENERATION = 2;
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
                // das Hang-Histogramm des inneren Landes je 5° (0–75°, die letzte Klasse sammelt den Rest): das Bild der
                // Zahl in der Leiste des Studios
                grad5: hang.reduce((a, s) => (a[Math.min(14, Math.floor((Math.atan(s) * 180) / Math.PI / 5))]++, a), new Array(15).fill(0)),
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
    // Gesetzes (`HANG_BAENDER` — EINE Quelle für die Linse und die Farben des Hang-Histogramms im Studio).
    const HANG_BAENDER = Object.freeze({
        pediment: Object.freeze([0.5, 7]),
        schutt: Object.freeze([30, 40]),
        ruhe: Object.freeze([33, 37]),
        kliff: Object.freeze([60, 90]),
    });
    function hangBaender(H, n, step, maske) {
        const B = HANG_BAENDER;
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
                if (w >= B.pediment[0] && w <= B.pediment[1]) ped++;
                if (w >= B.schutt[0] && w <= B.schutt[1]) schutt++;
                if (w >= B.ruhe[0] && w <= B.ruhe[1]) ruhe++;
                if (w >= B.kliff[0]) kliff++;
            }
        const r3 = (v) => Math.round(v * 1000) / 1000;
        if (!c) return { zellen: 0, pediment: 0, schutt: 0, ruhe: 0, kliff: 0 };
        return { zellen: c, pediment: r3(ped / c), schutt: r3(schutt / c), ruhe: r3(ruhe / c), kliff: r3(kliff / c) };
    }
    // DIE MÄANDER-ZAHL (K16): die Bahnen der Flachland-Glieder (Gefälle < 0,4 %, Sehne ≥ drei Wellen von 11 Breiten) gegen
    // Leopold & Wolman — je Glied die Sinuosität (Bogen / Sehne), die Wellenlänge der Sehne in Breiten (2 · Sehne / (Achsen-
    // Querungen + 1)) und der kleinste Krümmungs-Radius in Breiten (Umkreis je drei Punkte); gezählt wird der Median. Ein
    // Glied ohne Bahn ist seine Sehne (eine Gerade: Sinuosität 1, keine Querung). Die Breite ist `flussBreite`.
    function maeanderZahl(laeufe) {
        const sin = [];
        const lam = [];
        const rc = [];
        for (const lf of laeufe)
            for (const gl of lf.glieder) {
                const ex = gl.bx - gl.ax;
                const ez = gl.bz - gl.az;
                const sehne = Math.hypot(ex, ez);
                if (!(sehne > 0) || (gl.ba - gl.bb) / sehne >= MAEANDER.gefaelleVoll) continue;
                const w = flussBreite(gl.A);
                if (sehne < 3 * MAEANDER.lambdaBreiten * w) continue;
                const P = gl.bahn || [
                    { x: gl.ax, z: gl.az },
                    { x: gl.bx, z: gl.bz },
                ];
                let bogen = 0;
                let quer = 0;
                let vz = 0;
                let rmin = Infinity;
                for (let k = 0; k < P.length; k++) {
                    const p = P[k];
                    if (k) bogen += Math.hypot(p.x - P[k - 1].x, p.z - P[k - 1].z);
                    const lat = ((p.z - gl.az) * ex - (p.x - gl.ax) * ez) / sehne;
                    if (Math.abs(lat) > 0.05 * w) {
                        const s = lat > 0 ? 1 : -1;
                        if (vz && s !== vz) quer++;
                        vz = s;
                    }
                    if (k && k < P.length - 1) {
                        const a = Math.hypot(p.x - P[k - 1].x, p.z - P[k - 1].z);
                        const b = Math.hypot(P[k + 1].x - p.x, P[k + 1].z - p.z);
                        const c = Math.hypot(P[k + 1].x - P[k - 1].x, P[k + 1].z - P[k - 1].z);
                        const kreuz = Math.abs(
                            (p.x - P[k - 1].x) * (P[k + 1].z - P[k - 1].z) - (p.z - P[k - 1].z) * (P[k + 1].x - P[k - 1].x)
                        );
                        if (kreuz > 1e-9) rmin = Math.min(rmin, (a * b * c) / (2 * kreuz));
                    }
                }
                sin.push(bogen / sehne);
                lam.push(quer ? (2 * sehne) / (quer + 1) / w : Infinity);
                rc.push(rmin / w);
            }
        const med = (a) => (a.length ? a.slice().sort((p, q) => p - q)[a.length >> 1] : null);
        const r2 = (v) => (v == null ? null : Number.isFinite(v) ? Math.round(v * 100) / 100 : v);
        return {
            glieder: sin.length,
            sinuositaet: r2(med(sin)),
            lambdaBreiten: r2(med(lam)),
            rcBreiten: r2(med(rc)),
        };
    }

    // ── DER FELS-STOFF (K17): EIN Gesetz für das Aussehen des Felsens — der Welt-Boden (Kliff, Schutthang, Höhle), das
    // Gelände-Studio und die Fels-Gestalten der Foundry (Findling, Felsbogen, Felsturm, Säulen, Schutt) lesen es. Das
    // Schicht-Gesetz (T5) sagt, WO Kliff und Schutthang liegen; der Stoff sagt, WIE sie aussehen: Bänke nach Höhe und
    // Einfallen, Korn, die Verwitterungsrinde an konvexen Kanten (aus der Krümmung), Mulden dunkel, Flechte am
    // trockenen Licht, Moos am feuchten Sims. Alle Farben LINEAR (FARB-GESETZ); Fels liegt im Natur-Band ≤ 0,30
    // (nordstern §4.1, e-education PSU earth103). `fuss` ist die Kante des Netzes, das die Farbe trägt (m): was es nicht
    // auflöst (Wellenlänge < 2 · fuss), trägt sein Mittel — die feinen Bänke trägt dann der EINE Detail-Term im Shader
    // (`FELS.fein`, eine Probe im Rausch-Atlas), Lehre 19.
    const FELS = Object.freeze({
        einfall: 0.07, // Einfallen der Bänke (rad, ≈ 4°: flach lagernd wie die Tafelberge des Schicht-Gesetzes)
        streichen: 0.6, // Streich-Richtung (rad gegen +x)
        // DIE BANKUNG ist unregelmäßig (Nachbesserung K17: gleich hohe Bänke mit geraden Fugen und je Bank versetzten
        // Klüften lasen sich als Ziegelmauer). Die Natur: die Mächtigkeit streut stark — dünnbankige und massige Pakete —,
        // jede Fuge wellt für sich und keilt aus, die Klüfte laufen schräg durch die Bänke eines Pakets.
        paket: 5.5, // mittlere Mächtigkeit eines Bank-Pakets (m): die groben Lagen, die das 1,8-m-Netz trägt
        paketStreu: 0.6, // die Paket-Grenze wandert je Paket um ± paketStreu/2 Pakete
        paketKontrast: 0.2,
        bank: 0.9, // Mächtigkeit einer Bank (m) bei Paket-Dicke 1
        paketDicke: [0.35, 2.2], // je Paket die Bank-Mächtigkeit × (log-gleich zwischen beiden): dünnbankig … massig
        bankStreu: 0.85, // die Grenze einer Bank wandert um ± bankStreu/2 Bänke (gleich verteilt)
        bankKontrast: 0.22, // Helligkeit je Bank ±
        akzentAnteil: 0.25, // Anteil der hellen (sandigen) Bänke
        fugeWelle: 0.25, // ± Bänke: jede Fuge wellt für sich (zwei Sinus, im Streichen und quer dazu)
        fugeLambda: [3.5, 12], // ihre Wellenlänge (m), je Fuge gezogen
        // Die Fuge ist eine KANTE, kein Strich: unter ihr die gerundete Oberkante der Bank (die Rinde, hell), über ihr die
        // Kehle (die zurückwitternde Fuge, dunkel) — ihre Weite streut je Fuge, und auf `1 − fugeOffen` der Länge keilt sie aus.
        kehle: 0.1, // Höhe der Kehle über der Fuge (m)
        rand: 0.08, // Höhe der hellen Oberkante unter der Fuge (m)
        randHell: 0.4, // Mischung zum gebleichten Stein an der Oberkante
        fuge: 0.6, // Abdunklung in der Kehle zur dunklen Lage
        fugeStreu: 0.8, // ± Anteil, um den die Kehle je Fuge weiter oder enger ist
        fugeOffen: 0.65, // Anteil der Fugen-Länge, die klafft
        fugeOffenLambda: 6, // m
        kanteHell: 0.6, // die Verwitterungsrinde: Mischung zum gebleichten Stein an konvexen Kanten
        kanteK: [0.08, 0.6], // Krümmung (1/m): von … bis voll
        muldeDunkel: 0.5,
        muldeK: [0.06, 0.5],
        bleiche: 1.75, // der gebleichte Stein = Basis × bleiche
        flechte: [0.27, 0.26, 0.15], // Krustenflechte, grau-grün-gelb (sRGB 0x8e8c6c)
        flechteDeckung: 0.6,
        flechteLambda: 2.4, // m
        moos: [0.069, 0.111, 0.019], // Moos (sRGB 0x4a5e26)
        moosDeckung: 0.75,
        moosLambda: 3.4, // m
        grundMax: 0.22, // der Grundton höchstens (Y linear): der Fels bleibt im Natur-Band ≤ 0,30
        korn: 0.12, // ± je Korn (Vertex-Hash, wo das Netz es trägt: die Gestalten)
        kornLambda: 0.12, // m
        // Die Klüfte: zwei steile Scharen (im Streichen und quer dazu), um `kluftSchraeg` gegen die Senkrechte geneigt; ihr
        // Abstand je Paket aus `kluftDicht`, ihre Lage je PAKET — eine Kluft läuft durch die Bänke ihres Pakets und springt an
        // der Fuge nur um ± `kluftVersatz` Abstände; `kluftAnteil` der Bänke trägt sie, die übrigen sind ungeklüftet.
        kluft: 3.2, // Abstand (m)
        kluftDicht: [0.6, 1.6],
        kluftSchraeg: 0.35,
        kluftAnteil: 0.6,
        kluftVersatz: 0.06,
        kluftBreite: 0.05, // Anteil des Abstands, den die Kluft je Seite trägt (je Bank × 0,5 … 1,5)
        kluftDunkel: 0.5, // Mischung zur dunklen Lage in der Kluft
        // Der EINE Detail-Term im Boden-Shader trägt, was die Masche nicht trägt — Bänke, Kanten und Klüfte nach DIESEM
        // Gesetz (`felsLage`), relativ zum Mittel, das der Vertex trägt (`felsMittelWerte`). EINE Probe im Rausch-Atlas (`rausch`,
        // σ × `rausch` ≈ 0,37) wellt die Schichten im Großen: `xz` je m, `y` je Bank, ± `welle` Bänke; das Auge blendet aus,
        // was der Pixel nicht trägt (Bänke und Klüfte `fern` m, Kanten `fugeFern` m).
        fein: Object.freeze({ xz: 0.05, y: 0.35, welle: 1.2, rausch: 1.4, fern: [120, 260], fugeFern: [30, 80] }),
        // Der Schutthang (Geröll = halb Fels) trägt im Detail-Term statt der Bänke den Schutt: Steine der Kante `korn` (m), je
        // Stein ± `kontrast` und je Stein sein Maß `groesse`, eine Kuppe `kuppe`, `offen` der Fugen klafft (`spalt` der Kante, um `tiefe`
        // dunkel) — sein Mittel `schuttMittel()` < 1: das Geröll wirft Schatten in sich, nah wie fern (`schuttKornO`). Die
        // Streuung des Gesetzes in 2-m-Fenstern trägt die Geröll-Referenz (real-bergsee.jpg, Geröll vorn σ/Mittel 0,773): K17-2
        // NB1 0,573 → 0,769, sein Mittel 0,631 → 0,514 (Wand : Schutt der Referenz 0,72, das Kliff-Bild trug 0,54 und σ/Mittel
        // 0,375 < 0,43 — kontrast 0,8 → 0,9, kuppe 0,7 → 0,9, tiefe 0,8 → 0,95, offen 0,25 → 0,45).
        geroell: Object.freeze({ korn: 0.7, groesse: [0.45, 1.45], kontrast: 0.9, kuppe: 0.9, spalt: 0.06, tiefe: 0.95, offen: 0.45, welle: 0.18 }),
    });
    const FELS_SAAT = saatHash("fels-stoff");
    const TAU = 2 * Math.PI;
    const FELS_CS = Math.cos(FELS.streichen),
        FELS_SN = Math.sin(FELS.streichen),
        FELS_TE = Math.tan(FELS.einfall);
    const fz = (a, b, c) => zufall(FELS_SAAT, a, b, c);
    // Trägt ein Netz der Kante `fuss` die Wellenlänge λ? 1 = ganz (fuss ≤ λ/4), 0 = nur ihr Mittel (fuss ≥ λ/2).
    const traegt = (lambda, fuss) => 1 - glatt(0.25 * lambda, 0.5 * lambda, fuss > 0 ? fuss : 0);
    // Die drei Töne eines Felsens aus seinem Grundton (linear): die dunkle Lage und die helle, sandige Bank. Der Grundton
    // liegt im Natur-Band: über `FELS.grundMax` (Leuchtdichte Y) sinken alle drei Töne gemeinsam — mit Bänken, Rinde und
    // Flechte bleibt der Fels ≤ 0,30 (ein heller Sandstein-Ton der Palette war Y 0,33).
    function felsBasis(basis, dunkel, akzent) {
        const Y = 0.2126 * basis[0] + 0.7152 * basis[1] + 0.0722 * basis[2];
        const f = Y > FELS.grundMax ? FELS.grundMax / Y : 1;
        const b = [basis[0] * f, basis[1] * f, basis[2] * f];
        return Object.freeze({
            basis: b,
            dunkel: dunkel ? [dunkel[0] * f, dunkel[1] * f, dunkel[2] * f] : [b[0] * 0.45, b[1] * 0.45, b[2] * 0.45],
            akzent: akzent ? [akzent[0] * f, akzent[1] * f, akzent[2] * f] : [b[0] * 1.35, b[1] * 1.28, b[2] * 1.18],
        });
    }
    // DAS RAUSCH-GESETZ (Welle G; K17-2 Nachbesserung 1 aus dem Stamm in den Kern): das EINE Gradienten-Rauschen der Boden-
    // Stoffe — das Perlin-Rauschen von MaterialX (three r184 `mx_noise_float`: die Gradienten-Menge nach `h & 15` aus dem
    // Jenkins-lookup3-Hash, die Fünftgrad-Blende, die Skala 0,982). Der Hash liegt EINMAL im Gitter (`rauschGitter`: je Punkt
    // (i, j) der Gradient, Komponenten −1 · 0 · +1), das der Stamm als Rausch-Atlas packt (`_rauschAtlasDaten`); `P` Gitter-
    // Zellen je Kante, die dritte Achse im selben Gitter, je Schicht um `schraeg` versetzt. `rauschRaum` ist derselbe Wert
    // auf der CPU, den der Shader mit sechs Atlas-Ladungen liest (`_rauschAtlas().raum`) — Vertex und Pixel lesen EIN
    // Rauschen, keiner rechnet es aus Hash-Zügen nach.
    const RAUSCH = Object.freeze({ P: 256, schraeg: Object.freeze([12, 42]), skala: 0.982 });
    let _rauschGitterMemo = null;
    function rauschGitter() {
        if (_rauschGitterMemo) return _rauschGitterMemo;
        const P = RAUSCH.P;
        const rot = (x, k) => ((x << k) | (x >>> (32 - k))) >>> 0;
        const hash = (x, y, z) => {
            let a = (0xdeadbeef + (3 << 2) + 13) >>> 0;
            let b = a;
            let c = a;
            a = (a + x) >>> 0;
            b = (b + y) >>> 0;
            c = (c + z) >>> 0;
            c = ((c ^ b) - rot(b, 14)) >>> 0;
            a = ((a ^ c) - rot(c, 11)) >>> 0;
            b = ((b ^ a) - rot(a, 25)) >>> 0;
            c = ((c ^ b) - rot(b, 16)) >>> 0;
            a = ((a ^ c) - rot(c, 4)) >>> 0;
            b = ((b ^ a) - rot(a, 14)) >>> 0;
            c = ((c ^ b) - rot(b, 24)) >>> 0;
            return c;
        };
        const g = new Int8Array(P * P * 3);
        for (let j = 0; j < P; j++)
            for (let i = 0; i < P; i++) {
                const h = hash(i, j, 0) & 15;
                const o = (j * P + i) * 3;
                const u = h < 8 ? 0 : 1;
                const v = h < 4 ? 1 : h === 12 || h === 14 ? 0 : 2;
                g[o + u] += h & 1 ? -1 : 1;
                g[o + v] += h & 2 ? -1 : 1;
            }
        _rauschGitterMemo = g;
        return g;
    }
    // Der Raum-Wert an (x, y, z): die acht Ecken der Zelle aus zwei Schichten des Gitters (Schicht k bei (i + A·k, j + B·k)),
    // je Ecke Gradient · Abstand, trilinear mit der Fünftgrad-Blende — Schritt für Schritt wie `_rauschAtlas().raum`.
    function rauschRaum(x, y, z) {
        const g = rauschGitter();
        const P = RAUSCH.P,
            m = P - 1,
            A = RAUSCH.schraeg[0],
            B = RAUSCH.schraeg[1];
        const cx = Math.floor(x),
            cy = Math.floor(y),
            cz = Math.floor(z);
        const fx = x - cx,
            fy = y - cy,
            fz = z - cz;
        const i0 = (cx + cz * A) & m,
            j0 = (cy + cz * B) & m;
        const i1 = (i0 + A) & m,
            j1 = (j0 + B) & m;
        const ecke = (i, j, dx, dy, ez) => {
            const o = (((j + dy) & m) * P + ((i + dx) & m)) * 3;
            return g[o] * (fx - dx) + g[o + 1] * (fy - dy) + g[o + 2] * ez;
        };
        const bl = (t) => t * t * t * (t * (t * 6 - 15) + 10);
        const ux = bl(fx),
            uy = bl(fy),
            uz = bl(fz);
        const mix = (a, b, t) => a + (b - a) * t;
        const d = (dx, dy) => mix(ecke(i0, j0, dx, dy, fz), ecke(i1, j1, dx, dy, fz - 1), uz);
        return mix(mix(d(0, 0), d(1, 0), ux), mix(d(0, 1), d(1, 1), ux), uy) * RAUSCH.skala;
    }
    // DAS RECHENWERK DES FELS-GESETZES (K17, Nachbesserung 2): der Fein-Term ist EIN Code für den Vertex (Zahlen) und den
    // Boden-Shader (TSL-Knoten, `_felsRechenwerkTSL` im Stamm) — bis hierher transkribierte der Shader das Gesetz mit eigenem
    // Sinus-Hash und eigener Welle (die Paket-Grenzen von Vertex und Shader lagen im Median 0,57 m auseinander, und eine Linse
    // konnte den Shader nur über Namen prüfen). `o` ist das Rechenwerk: add · sub · mul · div · min · max, floor · sin · exp ·
    // abs · sqrt, step(kante, v) = v ≥ kante, glatt(a, b, v), clamp01, wahl(c, a, b) = c ? a : b mit c ∈ {0, 1}, zufall(saat, i, j, k)
    // = `zufall` für ganze i, j, k (im Shader dieselben 32-Bit-Ganzzahl-Schritte), rausch(x, y, z) = `rauschRaum` (im Shader
    // EINE Probe im Rausch-Atlas). Die Reihenfolge der Rechnung ist die des Gesetzes vor dem Rechenwerk. Ein Rauschen rechnet
    // das Rechenwerk nie aus Hash-Zügen nach (das Rausch-Gesetz: bis K17-2 Nachbesserung 1 wellte ein Wert-Rauschen aus acht
    // Ziehungen die Bänke im Fragment).
    // DIE FALTE (K17-3): falte(n, start, schritt) = der Zustand nach n Schritten, schritt(q, zustand) → der neue Zustand (eine
    // Liste, q = 0 … n − 1). Wo das Gesetz dieselbe Rechnung über Nachbarn wiederholt (die neun Zellen des Schutts, die vier
    // Bank-Grenzen der Lage), schreibt es sie EINMAL: die Zahl rechnet die Schleife, der Shader trägt EINE Schleife statt
    // n ausgeschriebener Kopien (seit K17 stand jede Ziehung 78-mal im Boden-Programm: 96 050 → 149 521 Zeichen WGSL, und
    // swiftshader übersetzte sie vor dem ersten Bild — die Prüfbühne S0 riss ihre Frist). fest(v) = v: ein Wert, den das Gesetz
    // mehrfach liest, steht im Shader als EINE Variable (r184 baut einen Knoten in einer Schleife je Leser neu).
    const ZAHL = Object.freeze({
        fest: (v) => v,
        falte: (n, start, schritt) => {
            let z = start;
            for (let q = 0; q < n; q++) z = schritt(q, z);
            return z;
        },
        add: (a, b) => a + b,
        sub: (a, b) => a - b,
        mul: (a, b) => a * b,
        div: (a, b) => a / b,
        min: (a, b) => Math.min(a, b),
        max: (a, b) => Math.max(a, b),
        floor: Math.floor,
        sin: Math.sin,
        exp: Math.exp,
        abs: Math.abs,
        sqrt: Math.sqrt,
        step: (e, v) => (v >= e ? 1 : 0),
        glatt: glatt,
        clamp01: (v) => (v < 0 ? 0 : v > 1 ? 1 : v),
        wahl: (c, a, b) => (c ? a : b),
        zufall: zufall,
        rausch: rauschRaum,
    });
    // Wert-Rauschen [0, 1] im Gitter der Kante 1 (trilinear, geglättet) — rein, deterministisch, ohne Saat-Strom. NUR im Vertex
    // (Flechte und Moos des Netzes): es zieht acht Hashes je Wert und hat darum kein Rechenwerk — der Pixel liest das EINE
    // Gradienten-Rauschen (`rausch`).
    function wert3(x, y, z, sh) {
        const ix = Math.floor(x),
            iy = Math.floor(y),
            iz = Math.floor(z);
        let fx = x - ix,
            fy = y - iy,
            fz3 = z - iz;
        fx = fx * fx * (3 - 2 * fx);
        fy = fy * fy * (3 - 2 * fy);
        fz3 = fz3 * fz3 * (3 - 2 * fz3);
        const e = (i, j, k) => zufall(sh, ix + i, iy + j, iz + k);
        const lerp = (a, b, t) => a + (b - a) * t;
        const x00 = lerp(e(0, 0, 0), e(1, 0, 0), fx);
        const x10 = lerp(e(0, 1, 0), e(1, 1, 0), fx);
        const x01 = lerp(e(0, 0, 1), e(1, 0, 1), fx);
        const x11 = lerp(e(0, 1, 1), e(1, 1, 1), fx);
        return lerp(lerp(x00, x10, fy), lerp(x01, x11, fy), fz3);
    }
    const fzO = (o, a, b, c) => o.zufall(FELS_SAAT, a, b, c);
    // Die Paket-Grenze k (m, in der Schicht-Höhe).
    const paketGrenzeO = (o, k) => o.mul(o.add(k, o.mul(o.sub(fzO(o, k, 31, 0), 0.5), FELS.paketStreu)), FELS.paket);
    // Das Paket an der Schicht-Höhe s (die Grenzen wandern um weniger als ein halbes Paket: Nachbarn genügen).
    function paketAnO(o, s) {
        const k = o.fest(o.floor(o.div(s, FELS.paket)));
        return o.add(o.sub(k, o.sub(1, o.step(paketGrenzeO(o, k), s))), o.step(paketGrenzeO(o, o.add(k, 1)), s));
    }
    const paketAn = (s) => paketAnO(ZAHL, s);
    // Die Bank-Mächtigkeit im Paket p (m): log-gleich in `paketDicke`.
    const _lnD0 = Math.log(FELS.paketDicke[0]),
        _lnDq = Math.log(FELS.paketDicke[1] / FELS.paketDicke[0]);
    const paketBankO = (o, p) => o.mul(FELS.bank, o.exp(o.add(_lnD0, o.mul(_lnDq, fzO(o, p, 37, 0)))));
    // Die Grenze i der Bänke im Paket p (in Bänken des Pakets ab der Paket-Grenze 0) an der Lage (h1 im Streichen, h2 quer):
    // gezogen um ± bankStreu/2, gewellt um ± fugeWelle (zwei Sinus, je Fuge Wellenlänge und Phase). Die Paket-Grenze (i ≤ 0)
    // wellt nur mit der großen Welle.
    function bankGrenzeO(o, p, i, h1, h2) {
        const F = FELS;
        const l1 = o.add(F.fugeLambda[0], o.mul(F.fugeLambda[1] - F.fugeLambda[0], fzO(o, p, i, 43)));
        const w = o.add(
            o.mul(0.65, o.sin(o.mul(TAU, o.add(o.div(h1, l1), fzO(o, p, i, 47))))),
            o.mul(0.35, o.sin(o.mul(TAU, o.add(o.div(h2, o.mul(0.61, l1)), fzO(o, p, i, 53)))))
        );
        const in0 = o.step(0.5, i);
        return o.add(
            o.add(i, o.mul(in0, o.mul(o.sub(fzO(o, p, i, 41), 0.5), F.bankStreu))),
            o.mul(in0, o.mul(F.fugeWelle, w))
        );
    }
    // Klafft die Fuge i des Pakets p an der Lage? (0 = ausgekeilt … 1 = offen; `fugeOffen` der Länge klafft)
    const _offenC = Math.cos(Math.PI * FELS.fugeOffen);
    const fugeOffenO = (o, p, i, h1, h2) =>
        o.glatt(
            _offenC - 0.25,
            _offenC + 0.25,
            o.sin(o.mul(TAU, o.add(o.div(o.add(h1, o.mul(0.5, h2)), FELS.fugeOffenLambda), fzO(o, p, i, 59))))
        );
    // DIE LAGE IM FELS an (x, y, z) mit der großen Welle `welle` (± 1, Bänke × `fein.welle`): Paket, Bank, die Mächtigkeit der
    // Bank hier und der Abstand zur Fuge unten und oben (m). Die Bank zwischen den Grenzen j − 1 … j + 2 (die Grenzen wandern
    // um weniger als 0,65 Bänke): die oberste darunter, die unterste darüber — wo sich zwei Fugen kreuzen, keilt die Bank aus.
    function felsLageO(o, x, y, z, welle, aus) {
        const F = FELS;
        const h1 = o.fest(o.add(o.mul(x, FELS_CS), o.mul(z, FELS_SN))),
            h2 = o.fest(o.sub(o.mul(z, FELS_CS), o.mul(x, FELS_SN)));
        const s = o.fest(o.add(o.add(y, o.mul(FELS_TE, h1)), o.mul(o.mul(welle, F.fein.welle), F.bank)));
        const p = o.fest(paketAnO(o, s));
        const pa = o.fest(paketGrenzeO(o, p));
        const d = o.fest(paketBankO(o, p));
        const u = o.fest(o.div(o.sub(s, pa), d));
        const top = o.div(o.sub(paketGrenzeO(o, o.add(p, 1)), pa), d);
        const j = o.fest(o.floor(u));
        // die vier Grenzen j − 1 … j + 2 in EINER Falte (q = 0 … 3): die erste ist die Untergrenze, die zweite und dritte zählen
        // unten, wo u über ihnen liegt (ist1, ist2), sonst oben, die vierte ist die Obergrenze — min und max sind exakt, die
        // Reihenfolge der Falte gibt dieselben Zahlen wie die vier ausgeschriebenen Grenzen
        const [lo, hiB, ist1, ist2] = o.falte(4, [-1e9, 1e9, 0, 0], (q, z) => {
            const b = o.fest(bankGrenzeO(o, p, o.add(o.sub(j, 1), q), h1, h2));
            const erst = o.sub(1, o.step(0.5, q)),
                letzt = o.step(2.5, q);
            const mitte = o.sub(o.sub(1, erst), letzt);
            const ist = o.fest(o.mul(o.step(b, u), mitte));
            return [
                o.wahl(erst, b, o.max(z[0], o.wahl(ist, b, -1e9))),
                o.min(z[1], o.wahl(mitte, o.wahl(ist, 1e9, b), o.wahl(letzt, b, 1e9))),
                o.wahl(o.mul(mitte, o.sub(1, o.step(1.5, q))), ist, z[2]),
                o.wahl(o.mul(mitte, o.step(1.5, q)), ist, z[3]),
            ];
        });
        const hi = o.fest(o.min(hiB, top));
        aus.s = s;
        aus.h1 = h1;
        aus.h2 = h2;
        aus.paket = p;
        aus.bank = o.fest(o.sub(o.add(j, ist2), o.sub(1, ist1)));
        aus.d = d;
        aus.dicke = o.mul(o.sub(hi, lo), d);
        aus.unten = o.fest(o.mul(o.sub(u, lo), d));
        aus.oben = o.fest(o.mul(o.sub(hi, u), d));
        return aus;
    }
    const felsLage = (x, y, z, welle, aus) => felsLageO(ZAHL, x, y, z, welle || 0, aus);
    const _lage = { s: 0, h1: 0, h2: 0, paket: 0, bank: 0, d: 0, dicke: 0, unten: 0, oben: 0 };
    // In der Kluft (0..1, 1 = Mitte): u in Kluft-Abständen, b die halbe Breite.
    const inKluftO = (o, u, b) => o.clamp01(o.sub(1, o.div(o.abs(o.sub(u, o.floor(o.add(u, 0.5)))), b)));
    // Die Kanten und Klüfte an einer Lage: die Kehle über der Fuge (dunkel), die Oberkante unter der nächsten (hell), die
    // Kluft (dunkel) — je 0..1, ohne Mittel. aus = { kehle, rand, kluft }.
    function felsKantenO(o, L, aus) {
        const F = FELS;
        const p = L.paket,
            k = L.bank;
        const kw = o.fest(o.mul(
            o.mul(F.kehle, o.add(1, o.mul(F.fugeStreu, o.sub(o.mul(2, fzO(o, p, k, 19)), 1)))),
            fugeOffenO(o, p, k, L.h1, L.h2)
        ));
        const kIn = o.mul(o.sub(1, o.step(kw, 1e-4)), o.sub(1, o.step(kw, L.unten)));
        const ke = o.fest(o.wahl(kIn, o.sub(1, o.div(L.unten, o.max(kw, 1e-4))), 0));
        aus.kehle = o.mul(ke, ke);
        const rw = o.fest(o.mul(F.rand, fugeOffenO(o, p, o.add(k, 1), L.h1, L.h2)));
        const rIn = o.mul(o.sub(1, o.step(rw, 1e-4)), o.sub(1, o.step(rw, L.oben)));
        const t = o.fest(o.wahl(rIn, o.sub(1, o.div(L.oben, o.max(rw, 1e-4))), 0));
        aus.rand = o.mul(o.mul(4, t), o.sub(1, t));
        const kd = o.fest(o.mul(F.kluft, o.add(F.kluftDicht[0], o.mul(F.kluftDicht[1] - F.kluftDicht[0], fzO(o, p, 29, 0)))));
        const kb = o.fest(o.mul(F.kluftBreite, o.add(0.5, fzO(o, p, k, 71))));
        const v = 2 * F.kluftVersatz;
        const u1 = o.add(o.add(o.div(o.add(L.h1, o.mul(L.s, F.kluftSchraeg)), kd), fzO(o, p, 13, 0)), o.mul(o.sub(fzO(o, p, k, 61), 0.5), v));
        const u2 = o.add(
            o.add(o.div(o.sub(L.h2, o.mul(o.mul(0.6, L.s), F.kluftSchraeg)), kd), fzO(o, p, 17, 0)),
            o.mul(o.sub(fzO(o, p, k, 67), 0.5), v)
        );
        const ik = o.fest(o.wahl(o.sub(1, o.step(F.kluftAnteil, fzO(o, p, k, 23))), o.max(inKluftO(o, u1, kb), inKluftO(o, u2, kb)), 0));
        aus.kluft = o.mul(ik, ik);
        return aus;
    }
    const felsKanten = (L, aus) => felsKantenO(ZAHL, L, aus);
    const _kanten = { kehle: 0, rand: 0, kluft: 0 };
    // DER FEIN-TERM DES FELSENS relativ zum Mittel, das der Vertex trägt (`felsMittelWerte`): `bank` = Helligkeit × helle Bank
    // × Kluft, `kante` = Kehle × Oberkante — je mit dem Mittel 1. B = `felsBasis` (die Töne der dunklen Lage und der hellen
    // Bank relativ zum Grundton). Die große Welle ist DASSELBE Gradienten-Rauschen wie im Vertex (`felsFarbe`, `rausch`) —
    // `felsWelle` an (x, y, z); wer sie schon trägt, reicht sie als `w` (der Shader liest sie EINMAL im Rausch-Atlas, außerhalb
    // der Fels-Funktion: K17-3).
    function felsWelleO(o, x, y, z) {
        const F = FELS;
        const sy = o.add(y, o.mul(FELS_TE, o.add(o.mul(x, FELS_CS), o.mul(z, FELS_SN))));
        return o.mul(F.fein.rausch, o.rausch(o.mul(x, F.fein.xz), o.div(o.mul(sy, F.fein.y), F.bank), o.mul(z, F.fein.xz)));
    }
    function felsFeinO(o, B, x, y, z, welle) {
        const F = FELS;
        const FM = felsMittelWerte();
        const Yl = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
        const aRel = 0.6 * (Yl(B.akzent) / Yl(B.basis) - 1);
        const dRel = 1 - Yl(B.dunkel) / Yl(B.basis);
        const w = welle === undefined ? felsWelleO(o, x, y, z) : welle;
        const L = felsLageO(o, x, y, z, w, {});
        const K = felsKantenO(o, L, {});
        const hell = o.div(o.add(1, o.mul(F.bankKontrast, o.sub(o.mul(2, fzO(o, L.paket, L.bank, 3)), 1))), FM.hell);
        const akz = o.div(o.add(1, o.mul(aRel, o.sub(1, o.step(F.akzentAnteil, fzO(o, L.paket, L.bank, 5))))), 1 + aRel * FM.akzent);
        const kluft = o.div(o.sub(1, o.mul(K.kluft, F.kluftDunkel * dRel)), 1 - FM.kluft * F.kluftDunkel * dRel);
        const kehle = o.div(o.sub(1, o.mul(K.kehle, F.fuge * dRel)), 1 - FM.kehle * F.fuge * dRel);
        const rh = F.randHell * (F.bleiche - 1);
        const rand = o.div(o.add(1, o.mul(K.rand, rh)), 1 + FM.rand * rh);
        return { bank: o.mul(o.mul(hell, akz), kluft), kante: o.mul(kehle, rand), lage: L };
    }
    // DER SCHUTT (`FELS.geroell`): Steine der Kante `korn` (Zellen-Rauschen in der Ebene des Hangs, je Zelle ein gezogener
    // Mittelpunkt), je Stein seine Helligkeit ± `kontrast`, zwischen den Steinen die Fuge (`spalt` der Kante) dunkel um `tiefe`
    // — sein Mittel ist `schuttMittel()`. Bis zur Nachbesserung 2 lagen achsparallele Würfel (`floor(wp / korn)`) als
    // Pixel-Mosaik auf dem Hang (σ/Mittel 0,127 gegen 0,72 der Geröll-Referenz).
    // Nachbesserung 3: gleich große Zellen mit gleich dunkler Fuge lasen sich als PFLASTER. Die Natur: die Steine streuen in
    // der Größe (je Stein sein Maß `groesse`, das Zellen-Rauschen gewichtet: ein großer Block nimmt den Nachbarn Platz), jeder
    // Stein ist eine Kuppe (zur Kante hin sieht er weniger Himmel: `kuppe`), und nur ein Teil der Fugen klafft (je Stein
    // `offen`) — und das Geröll als Ganzes wirft Schatten in sich: sein Mittel ist `schuttMittel()` < 1, nah wie fern.
    function schuttKornO(o, x, z) {
        const S = FELS.geroell;
        // die Ebene des Hangs leicht gewellt (`welle` Zellen): die Kanten der Steine runden, kein Vieleck-Mosaik
        const u0 = o.fest(o.div(x, S.korn)),
            v0 = o.fest(o.div(z, S.korn));
        const u = o.fest(o.add(u0, o.mul(S.welle, o.add(o.sin(o.add(o.mul(v0, 1.9), 1.1)), o.mul(0.6, o.sin(o.add(o.mul(u0, 0.73), o.mul(v0, 1.31))))))));
        const v = o.fest(o.add(v0, o.mul(S.welle, o.add(o.sin(o.add(o.mul(u0, 2.1), 0.7)), o.mul(0.6, o.sin(o.sub(o.mul(v0, 0.67), o.mul(u0, 1.23))))))));
        const iu = o.fest(o.floor(u)),
            iv = o.fest(o.floor(v));
        // die neun Zellen um (iu, iv) in EINER Falte (q = 0 … 8: a = ⌊q/3⌋ − 1 außen, b = q − 3⌊q/3⌋ − 1 innen); der Zustand ist
        // der nächste und der zweitnächste Abstand (im Maß des Steins), die Helligkeit und das Klaffen des nächsten
        const [d1, d2, hb, ho] = o.falte(9, [9, 9, 0.5, 0.5], (q, z) => {
            const qa = o.floor(o.div(q, 3));
            const ci = o.fest(o.add(iu, o.sub(qa, 1))),
                cj = o.fest(o.add(iv, o.sub(o.sub(q, o.mul(3, qa)), 1)));
            const du = o.fest(o.sub(o.add(ci, o.add(0.15, o.mul(0.7, o.zufall(FELS_SAAT ^ 0x5c, ci, cj, 0)))), u));
            const dv = o.fest(o.sub(o.add(cj, o.add(0.15, o.mul(0.7, o.zufall(FELS_SAAT ^ 0x5c, ci, cj, 1)))), v));
            const r = o.add(S.groesse[0], o.mul(S.groesse[1] - S.groesse[0], o.zufall(FELS_SAAT ^ 0x5c, ci, cj, 3)));
            const d = o.fest(o.div(o.sqrt(o.add(o.mul(du, du), o.mul(dv, dv))), r));
            const c = o.fest(o.step(d, z[0])); // näher als der bisher nächste (im Maß des Steins)
            return [
                o.min(z[0], d),
                o.wahl(c, z[0], o.min(z[1], d)),
                o.wahl(c, o.zufall(FELS_SAAT ^ 0x5c, ci, cj, 2), z[2]),
                o.wahl(c, o.zufall(FELS_SAAT ^ 0x5c, ci, cj, 4), z[3]),
            ];
        });
        // e: 1 in der Mitte des Steins, 0 an seiner Kante (die gewichtete Grenze liegt bei d1 = d2)
        const e = o.div(o.sub(d2, d1), o.add(d2, d1));
        const ke = o.sub(1, e);
        const kuppe = o.sub(1, o.mul(S.kuppe, o.mul(ke, ke)));
        const fuge = o.mul(o.step(1 - S.offen, ho), o.sub(1, o.glatt(0, S.spalt, e)));
        const stein = o.add(1, o.mul(S.kontrast, o.sub(o.mul(2, hb), 1)));
        return o.mul(o.mul(stein, kuppe), o.sub(1, o.mul(S.tiefe, fuge)));
    }
    let _schuttMittelMemo = 0;
    function schuttMittel() {
        if (_schuttMittelMemo) return _schuttMittelMemo;
        let m = 0;
        for (let i = 0; i < 96; i++) for (let j = 0; j < 96; j++) m += schuttKornO(ZAHL, i * 0.0731 + j * 0.0137, j * 0.0719 - i * 0.0113);
        _schuttMittelMemo = m / 9216;
        return _schuttMittelMemo;
    }
    // Die Mittel des Gesetzes (über die Lage gemittelt, EINMAL gezogen): was ein Netz trägt, das Bänke, Kanten oder Klüfte
    // nicht auflöst — der Vertex trägt sie, der Detail-Term im Shader rechnet relativ zu ihnen (sein Mittel ist der Vertex).
    let _felsMittelMemo = null;
    function felsMittelWerte() {
        if (_felsMittelMemo) return _felsMittelMemo;
        let n = 0,
            ke = 0,
            ra = 0,
            kl = 0,
            ak = 0,
            he = 0;
        for (let i = 0; i < 64; i++)
            for (let j = 0; j < 64; j++) {
                const L = felsLage(i * 2.71 + j * 0.37, (i * 64 + j) * 0.0617, j * 1.93 - i * 0.71, 0, _lage);
                felsKanten(L, _kanten);
                ke += _kanten.kehle;
                ra += _kanten.rand;
                kl += _kanten.kluft;
                ak += fz(L.paket, L.bank, 5) < FELS.akzentAnteil ? 1 : 0;
                he += 1 + FELS.bankKontrast * (2 * fz(L.paket, L.bank, 3) - 1);
                n++;
            }
        _felsMittelMemo = Object.freeze({ kehle: ke / n, rand: ra / n, kluft: kl / n, akzent: ak / n, hell: he / n });
        return _felsMittelMemo;
    }
    // DIE FELS-FARBE an einem Punkt (linear, nach `out`): B = `felsBasis`; (x, y, z) die Lage (m, Welt oder Gestalt); n die
    // Normale; `krumm` die mittlere Krümmung (1/m, > 0 konvex — `felsKruemmung`); `himmel` die Himmels-Sicht (0 Höhle …
    // 1 frei); `feucht` 0..1; `fuss` die Kante des tragenden Netzes (m). Was das Netz nicht trägt, trägt sein Mittel — und
    // wird dann nicht gerechnet (der Welt-Boden mit 1,8 m trägt nur die Pakete).
    let _tFuss = NaN,
        _tSatz = null;
    function traegtSatz(fuss) {
        if (fuss === _tFuss) return _tSatz;
        const F = FELS;
        _tFuss = fuss;
        _tSatz = {
            fuss,
            tp: traegt(F.paket, fuss),
            tb: traegt(F.bank, fuss),
            tf: traegt(4 * (F.kehle + F.rand), fuss),
            tj: traegt(F.kluft, fuss),
            tk: traegt(F.kornLambda * 4, fuss),
            tfl: traegt(F.flechteLambda, fuss),
            tm: traegt(F.moosLambda, fuss),
        };
        return _tSatz;
    }
    // Die Kette Paket · Bank · Kanten · Klüfte (die Bank `L` und ihre Kanten `K`, wo das Netz sie trägt, sonst ihre Mittel)
    // vom Grundton × m (m das Paket) nach out.
    function felsKette(B, m, L, K, T, out) {
        const F = FELS;
        const M = _felsMittelMemo || felsMittelWerte();
        const tb = L ? T.tb : 0,
            tf = K ? T.tf : 0,
            tj = K ? T.tj : 0;
        let r = B.basis[0] * m,
            g = B.basis[1] * m,
            b = B.basis[2] * m;
        // Bänke: die helle Bank und ihre Helligkeit.
        const akz = (tb > 0 ? tb * (fz(L.paket, L.bank, 5) < F.akzentAnteil ? 1 : 0) : 0) + (1 - tb) * M.akzent;
        r += (B.akzent[0] - r) * akz * 0.6;
        g += (B.akzent[1] - g) * akz * 0.6;
        b += (B.akzent[2] - b) * akz * 0.6;
        const hell = (tb > 0 ? tb * (1 + F.bankKontrast * (2 * fz(L.paket, L.bank, 3) - 1)) : 0) + (1 - tb) * M.hell;
        r *= hell;
        g *= hell;
        b *= hell;
        // Die Kanten: die Kehle über der Fuge zur dunklen Lage, die Oberkante unter ihr zum gebleichten Stein; die Klüfte.
        const kehle = ((tf > 0 ? tf * K.kehle : 0) + (1 - tf) * M.kehle) * F.fuge;
        r += (B.dunkel[0] - r) * kehle;
        g += (B.dunkel[1] - g) * kehle;
        b += (B.dunkel[2] - b) * kehle;
        const rand = ((tf > 0 ? tf * K.rand : 0) + (1 - tf) * M.rand) * F.randHell;
        r += (B.basis[0] * F.bleiche - r) * rand;
        g += (B.basis[1] * F.bleiche - g) * rand;
        b += (B.basis[2] * F.bleiche - b) * rand;
        const kluft = ((tj > 0 ? tj * K.kluft : 0) + (1 - tj) * M.kluft) * F.kluftDunkel;
        r += (B.dunkel[0] - r) * kluft;
        g += (B.dunkel[1] - g) * kluft;
        b += (B.dunkel[2] - b) * kluft;
        out[0] = r;
        out[1] = g;
        out[2] = b;
        return out;
    }
    // Trägt das Netz nichts Feines, ist die Kette affin im Paket-Faktor m: c(m) = c0 + m · d — EINMAL je (B, fuss).
    const _affinMemo = new WeakMap();
    function felsAffin(B, T) {
        let A = _affinMemo.get(B);
        if (A && A.fuss === T.fuss) return A;
        const c0 = felsKette(B, 0, null, null, T, [0, 0, 0]);
        const c1 = felsKette(B, 1, null, null, T, [0, 0, 0]);
        A = { fuss: T.fuss, c0, d: [c1[0] - c0[0], c1[1] - c0[1], c1[2] - c0[2]] };
        _affinMemo.set(B, A);
        return A;
    }
    function felsFarbe(B, x, y, z, nx, ny, nz, krumm, himmel, feucht, fuss, out) {
        const F = FELS;
        const T = traegtSatz(fuss);
        const sy = y + FELS_TE * (x * FELS_CS + z * FELS_SN);
        let L = null;
        if (T.tb > 0 || T.tf > 0 || T.tj > 0) {
            const w = F.fein.rausch * rauschRaum(x * F.fein.xz, (sy * F.fein.y) / F.bank, z * F.fein.xz);
            L = felsLage(x, y, z, w, _lage);
        }
        // Bank-Pakete (grob) — ihr Mittel ist 1.
        const m = T.tp > 0 ? 1 + T.tp * F.paketKontrast * (2 * fz(L ? L.paket : paketAn(sy), 11, 0) - 1) : 1;
        let r, g, b;
        if (L) {
            felsKette(B, m, L, felsKanten(L, _kanten), T, out);
            r = out[0];
            g = out[1];
            b = out[2];
        } else {
            const A = felsAffin(B, T);
            r = A.c0[0] + m * A.d[0];
            g = A.c0[1] + m * A.d[1];
            b = A.c0[2] + m * A.d[2];
        }
        // Korn (Vertex-Hash) — nur, wo das Netz es trägt; sein Mittel ist 1.
        if (T.tk > 0) {
            const q = 1 / F.kornLambda;
            const mk = 1 + T.tk * F.korn * (2 * zufall(FELS_SAAT, Math.floor(x * q), Math.floor(y * q), Math.floor(z * q)) - 1);
            r *= mk;
            g *= mk;
            b *= mk;
        }
        // Die Kante des Netzes: konvex hellt die Verwitterungsrinde auf, die Mulde dunkelt.
        const k = krumm > 0 || krumm < 0 ? krumm : 0;
        if (k > F.kanteK[0]) {
            const ke = glatt(F.kanteK[0], F.kanteK[1], k) * F.kanteHell;
            r += (B.basis[0] * F.bleiche - r) * ke;
            g += (B.basis[1] * F.bleiche - g) * ke;
            b += (B.basis[2] * F.bleiche - b) * ke;
        } else if (-k > F.muldeK[0]) {
            const md = 1 - glatt(F.muldeK[0], F.muldeK[1], -k) * F.muldeDunkel;
            r *= md;
            g *= md;
            b *= md;
        }
        // Flechte am trockenen Licht, Moos am feuchten Sims — beide nur unter dem Himmel, in Flecken (das Rauschen nur, wo
        // das Netz die Flecken trägt).
        const h = himmel > 0 ? (himmel < 1 ? himmel : 1) : 0;
        const fe = feucht > 0 ? (feucht < 1 ? feucht : 1) : 0;
        if (h > 0) {
            const tfl = T.tfl;
            const lf = F.flechteLambda;
            const pf = (tfl > 0 ? tfl * glatt(0.5, 0.72, wert3(x / lf, y / lf, z / lf, FELS_SAAT ^ 0x51)) : 0) + (1 - tfl) * 0.27;
            const wf = F.flechteDeckung * pf * h * (1 - 0.7 * fe) * glatt(-0.3, 0.4, ny);
            r += (F.flechte[0] - r) * wf;
            g += (F.flechte[1] - g) * wf;
            b += (F.flechte[2] - b) * wf;
            if (fe > 0 && ny > 0.15) {
                const tm = T.tm;
                const lm = F.moosLambda;
                const pm = (tm > 0 ? tm * glatt(0.45, 0.7, wert3(x / lm, y / lm, z / lm, FELS_SAAT ^ 0xa3)) : 0) + (1 - tm) * 0.32;
                const wm = F.moosDeckung * pm * h * fe * glatt(0.15, 0.7, ny);
                r += (F.moos[0] - r) * wm;
                g += (F.moos[1] - g) * wm;
                b += (F.moos[2] - b) * wm;
            }
        }
        out[0] = r;
        out[1] = g;
        out[2] = b;
        return out;
    }
    // Die mittlere Krümmung je Vertex (1/m, > 0 konvex) eines indizierten Netzes: je Kante (i, j) −2 n_i · (p_j − p_i) /
    // |p_j − p_i|², gemittelt — auf einer Kugel vom Radius ρ genau 1/ρ. P, N: Float32-Felder (xyz), I: Index (oder null);
    // `maske` (optional, je Vertex > 0 = gefragt): nur Dreiecke mit einer gefragten Ecke werden gerechnet.
    function felsKruemmung(P, N, I, n, out, maske) {
        const K = out || new Float32Array(n);
        const c = new Uint16Array(n);
        K.fill(0, 0, n);
        if (!I) return K;
        // je Dreieck die drei Kanten, jede an beiden Enden: −2 n_i · (p_j − p_i) / l² (eng geschrieben: der Takt des
        // Welt-Bodens zahlt sie je Chunk)
        const m = I.length - 2;
        for (let t = 0; t < m; t += 3) {
            const v0 = I[t],
                v1 = I[t + 1],
                v2 = I[t + 2];
            if (maske && maske[v0] === 0 && maske[v1] === 0 && maske[v2] === 0) continue;
            const x0 = P[3 * v0],
                y0 = P[3 * v0 + 1],
                z0 = P[3 * v0 + 2],
                x1 = P[3 * v1],
                y1 = P[3 * v1 + 1],
                z1 = P[3 * v1 + 2],
                x2 = P[3 * v2],
                y2 = P[3 * v2 + 1],
                z2 = P[3 * v2 + 2];
            const a0 = N[3 * v0],
                b0 = N[3 * v0 + 1],
                c0 = N[3 * v0 + 2],
                a1 = N[3 * v1],
                b1 = N[3 * v1 + 1],
                c1 = N[3 * v1 + 2],
                a2 = N[3 * v2],
                b2 = N[3 * v2 + 1],
                c2 = N[3 * v2 + 2];
            let dx = x1 - x0,
                dy = y1 - y0,
                dz = z1 - z0,
                l2 = dx * dx + dy * dy + dz * dz;
            if (l2 > 1e-12) {
                const q = 2 / l2;
                K[v0] -= q * (a0 * dx + b0 * dy + c0 * dz);
                K[v1] += q * (a1 * dx + b1 * dy + c1 * dz);
                c[v0]++;
                c[v1]++;
            }
            dx = x2 - x1;
            dy = y2 - y1;
            dz = z2 - z1;
            l2 = dx * dx + dy * dy + dz * dz;
            if (l2 > 1e-12) {
                const q = 2 / l2;
                K[v1] -= q * (a1 * dx + b1 * dy + c1 * dz);
                K[v2] += q * (a2 * dx + b2 * dy + c2 * dz);
                c[v1]++;
                c[v2]++;
            }
            dx = x0 - x2;
            dy = y0 - y2;
            dz = z0 - z2;
            l2 = dx * dx + dy * dy + dz * dz;
            if (l2 > 1e-12) {
                const q = 2 / l2;
                K[v2] -= q * (a2 * dx + b2 * dy + c2 * dz);
                K[v0] += q * (a0 * dx + b0 * dy + c0 * dz);
                c[v2]++;
                c[v0]++;
            }
        }
        for (let i = 0; i < n; i++) if (c[i]) K[i] /= c[i];
        return K;
    }
    // DIE UNREGELMÄSSIGKEIT DER BANKUNG (die Zahl am Gesetz, `gate:hoehlen-sicht` (l)): der Variationskoeffizient der
    // Bank-Mächtigkeit (an einer Lotrechten, n Bänke), die Welligkeit der Fugen (RMS-Abweichung einer Fuge von ihrer Geraden
    // über `strecke` m, in Bank-Mächtigkeiten) und der Durchlauf der Klüfte (Anteil der Klüfte einer Bank, die in der Bank
    // darüber innerhalb ± 0,15 Abständen weiterlaufen).
    function felsBankung(o) {
        const F = FELS;
        const strecke = (o && o.strecke) || 20;
        const dicken = [];
        let s = 0.013;
        let guard = 0;
        while (dicken.length < 2000 && guard++ < 20000) {
            const L = felsLage(0, s, 0, 0, _lage);
            if (L.dicke > 1e-3) dicken.push(L.dicke);
            s += L.oben + 1e-4;
        }
        const mw = dicken.reduce((a, v) => a + v, 0) / dicken.length;
        const sd = Math.sqrt(dicken.reduce((a, v) => a + (v - mw) * (v - mw), 0) / dicken.length);
        // Die Welligkeit: je Fuge (Paket p, Grenze i ≥ 1) ihre Höhe über h1 (h2 = 0), von ihrer Ausgleichs-Geraden.
        let wSum = 0,
            wN = 0;
        for (let p = 0; p < 40; p++) {
            const d = paketBankO(ZAHL, p);
            for (let i = 1; i <= 3; i++) {
                const xs = [],
                    ys = [];
                for (let h = 0; h <= strecke; h += 0.25) {
                    xs.push(h);
                    ys.push(bankGrenzeO(ZAHL, p, i, h, 0) * d);
                }
                const n = xs.length;
                const mx = xs.reduce((a, v) => a + v, 0) / n,
                    my = ys.reduce((a, v) => a + v, 0) / n;
                let sxy = 0,
                    sxx = 0;
                for (let q = 0; q < n; q++) {
                    sxy += (xs[q] - mx) * (ys[q] - my);
                    sxx += (xs[q] - mx) * (xs[q] - mx);
                }
                const k = sxx > 0 ? sxy / sxx : 0;
                let rss = 0;
                for (let q = 0; q < n; q++) {
                    const e = ys[q] - (my + k * (xs[q] - mx));
                    rss += e * e;
                }
                wSum += Math.sqrt(rss / n) / d;
                wN++;
            }
        }
        // Der Durchlauf: je Bank mit Klüften die Lage ihrer Klüfte (Schar 1) gegen die Bank darüber im selben Paket.
        let lauf = 0,
            laufN = 0;
        for (let p = 0; p < 60; p++)
            for (let k = 0; k < 4; k++) {
                if (!(fz(p, k, 23) < F.kluftAnteil)) continue;
                laufN++;
                if (!(fz(p, k + 1, 23) < F.kluftAnteil)) continue;
                const v = 2 * F.kluftVersatz;
                const dq = (fz(p, k + 1, 61) - 0.5) * v - (fz(p, k, 61) - 0.5) * v;
                if (Math.abs(dq - Math.round(dq)) <= 0.15) lauf++;
            }
        const r3 = (v) => Math.round(v * 1000) / 1000;
        return { baenke: dicken.length, mittel: r3(mw), cv: r3(sd / mw), welligkeit: r3(wSum / wN), durchlauf: r3(laufN ? lauf / laufN : 0) };
    }
    // Ein ganzes Netz durch den Stoff (die Gestalten der Foundry, der Werkstatt-Stein): C ← felsFarbe je Vertex.
    // o = { himmel (1), feucht (0,3), fuss (die mittlere Kante, sonst aus dem Netz) }.
    function felsNetz(B, P, N, I, n, o, C) {
        const K = felsKruemmung(P, N, I, n);
        let fuss = o && o.fuss > 0 ? o.fuss : 0;
        if (!fuss && I && I.length >= 3) {
            let s = 0,
                m = 0;
            for (let t = 0; t + 2 < I.length && m < 600; t += 3, m++) {
                const a = I[t],
                    b = I[t + 1];
                s += Math.hypot(P[3 * b] - P[3 * a], P[3 * b + 1] - P[3 * a + 1], P[3 * b + 2] - P[3 * a + 2]);
            }
            fuss = m ? s / m : 0;
        }
        const him = o && o.himmel != null ? o.himmel : 1;
        const fe = o && o.feucht != null ? o.feucht : 0.3;
        const tmp = [0, 0, 0];
        for (let i = 0; i < n; i++) {
            felsFarbe(B, P[3 * i], P[3 * i + 1], P[3 * i + 2], N[3 * i], N[3 * i + 1], N[3 * i + 2], K[i], him, fe, fuss, tmp);
            C[3 * i] = tmp[0];
            C[3 * i + 1] = tmp[1];
            C[3 * i + 2] = tmp[2];
        }
        return C;
    }
    // Das Mittel des Stoffs (die Ferne, wo kein Netz eine Bank trägt): ein senkrechter Fels unter dem Himmel.
    function felsMittel(B, feucht) {
        return felsFarbe(B, 0, 0, 0, 0, 0, 1, 0, 1, feucht != null ? feucht : 0.3, 1e9, [0, 0, 0]);
    }

    // DAS ZIEL DER GRÖBEREN STUFE (K51-2, der Geomorph der Boden-Stufen nach dem CDLOD-Prinzip): je Vertex des feinen Netzes
    // sein Punkt auf dem Netz der nächst gröberen Stufe desselben Orts — senkrecht über oder unter ihm (die Fläche, deren Höhe
    // der eigenen am nächsten liegt; die Gitter der Stufen schachteln sich, das Ziel ist die Höhe der groben Fläche an derselben
    // Stelle wie die Höhenkarte im CDLOD), wo keine Fläche innerhalb eines groben Schritts senkrecht trägt (eine Wand, ein
    // Überhang) der nächste Punkt der groben Fläche im Raum, wo auch der weiter als zwei Schritte liegt, der Vertex selbst.
    // Im Übergangs-Band wandert der Vertex stetig auf dieses Ziel — am Stufen-Wechsel liegt das feine Netz auf dem groben.
    // `fein` die Positionen (3n), `grob` + `grobIdx` das grobe Netz (3m, 3t), `schritt` sein Gitter-Schritt; `felder` (optional)
    // die Vertex-Felder, die mitwandern ({ fein, grob, einheit }: je 3 Komponenten — Normale, Stoff-Farbe): ihr Ziel ist der Wert der
    // groben Fläche am Ziel-Punkt (baryzentrisch; `einheit` normiert), ohne Ziel der eigene. Rückgabe { ziel, felder }. Rein; Leser:
    // der voxel-worker (`buildChunkMesh`) und der Sync-Bau des Stamms (`_buildVoxelChunkData`) — EIN Gesetz für beide.
    const STUFE_ZIEL = Object.freeze({ senkrecht: 1, raum: 2 }); // in groben Schritten
    function stufeZiel(fein, grob, grobIdx, schritt, felder) {
        const out = new Float32Array(fein.length);
        out.set(fein);
        const F = (felder || []).map((fd) => {
            const z = new Float32Array(fein.length);
            z.set(fd.fein);
            return z;
        });
        // den Ziel-Wert jedes Felds am Punkt des Dreiecks (a, b, c) mit den Gewichten (la, lb, lc) setzen
        const feldZiel = (v, a, b, c, la, lb, lc) => {
            for (let q = 0; q < F.length; q++) {
                const G = felder[q].grob;
                let x = G[a] * la + G[b] * lb + G[c] * lc,
                    y = G[a + 1] * la + G[b + 1] * lb + G[c + 1] * lc,
                    z = G[a + 2] * la + G[b + 2] * lb + G[c + 2] * lc;
                if (felder[q].einheit) {
                    const l = Math.hypot(x, y, z) || 1;
                    x /= l;
                    y /= l;
                    z /= l;
                }
                F[q][v] = x;
                F[q][v + 1] = y;
                F[q][v + 2] = z;
            }
        };
        const nT = (grobIdx.length / 3) | 0;
        if (nT === 0 || !(schritt > 0)) return { ziel: out, felder: F };
        let x0 = Infinity,
            z0 = Infinity,
            x1 = -Infinity,
            z1 = -Infinity;
        for (let i = 0; i < grob.length; i += 3) {
            if (grob[i] < x0) x0 = grob[i];
            if (grob[i] > x1) x1 = grob[i];
            if (grob[i + 2] < z0) z0 = grob[i + 2];
            if (grob[i + 2] > z1) z1 = grob[i + 2];
        }
        // die Eimer: je Raster-Zelle (Kante = schritt) die groben Dreiecke, deren XZ-Hülle sie berührt (CSR)
        const nx = Math.floor((x1 - x0) / schritt) + 1,
            nz = Math.floor((z1 - z0) / schritt) + 1;
        const zelle = (v, o, n) => Math.min(n - 1, Math.max(0, Math.floor((v - o) / schritt)));
        const kopf = new Int32Array(nx * nz + 1);
        const huelle = (t, f) => {
            const a = grobIdx[t * 3] * 3,
                b = grobIdx[t * 3 + 1] * 3,
                c = grobIdx[t * 3 + 2] * 3;
            const i0 = zelle(Math.min(grob[a], grob[b], grob[c]), x0, nx),
                i1 = zelle(Math.max(grob[a], grob[b], grob[c]), x0, nx);
            const j0 = zelle(Math.min(grob[a + 2], grob[b + 2], grob[c + 2]), z0, nz),
                j1 = zelle(Math.max(grob[a + 2], grob[b + 2], grob[c + 2]), z0, nz);
            for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) f(i + j * nx);
        };
        for (let t = 0; t < nT; t++) huelle(t, (k) => kopf[k + 1]++);
        for (let k = 0; k < nx * nz; k++) kopf[k + 1] += kopf[k];
        const eimer = new Int32Array(kopf[nx * nz]);
        const fuell = kopf.slice(0, nx * nz);
        for (let t = 0; t < nT; t++) huelle(t, (k) => (eimer[fuell[k]++] = t));
        const nah = [0, 0, 0],
            nahL = [0, 0]; // die Gewichte (u, v) des nächsten Punkts: a + u · ab + v · ac
        // der nächste Punkt des Dreiecks (a, b, c) zu p (Ericson, Real-Time Collision Detection 5.1.5) → nah, Abstand²
        const naechster = (px, py, pz, a, b, c) => {
            const ax = grob[a],
                ay = grob[a + 1],
                az = grob[a + 2];
            const abx = grob[b] - ax,
                aby = grob[b + 1] - ay,
                abz = grob[b + 2] - az;
            const acx = grob[c] - ax,
                acy = grob[c + 1] - ay,
                acz = grob[c + 2] - az;
            const apx = px - ax,
                apy = py - ay,
                apz = pz - az;
            const d1 = abx * apx + aby * apy + abz * apz,
                d2 = acx * apx + acy * apy + acz * apz;
            let u = 0,
                v = 0;
            if (d1 <= 0 && d2 <= 0) {
                u = 0;
                v = 0;
            } else {
                const bpx = px - grob[b],
                    bpy = py - grob[b + 1],
                    bpz = pz - grob[b + 2];
                const d3 = abx * bpx + aby * bpy + abz * bpz,
                    d4 = acx * bpx + acy * bpy + acz * bpz;
                const cpx = px - grob[c],
                    cpy = py - grob[c + 1],
                    cpz = pz - grob[c + 2];
                const d5 = abx * cpx + aby * cpy + abz * cpz,
                    d6 = acx * cpx + acy * cpy + acz * cpz;
                const vc = d1 * d4 - d3 * d2,
                    vb = d5 * d2 - d1 * d6,
                    va = d3 * d6 - d5 * d4;
                if (d3 >= 0 && d4 <= d3) {
                    u = 1;
                } else if (d6 >= 0 && d5 <= d6) {
                    v = 1;
                } else if (vc <= 0 && d1 >= 0 && d3 <= 0) {
                    u = d1 / (d1 - d3);
                } else if (vb <= 0 && d2 >= 0 && d6 <= 0) {
                    v = d2 / (d2 - d6);
                } else if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
                    const w = (d4 - d3) / (d4 - d3 + (d5 - d6));
                    u = 1 - w;
                    v = w;
                } else {
                    const s = 1 / (va + vb + vc);
                    u = vb * s;
                    v = vc * s;
                }
            }
            nah[0] = ax + abx * u + acx * v;
            nah[1] = ay + aby * u + acy * v;
            nah[2] = az + abz * u + acz * v;
            nahL[0] = u;
            nahL[1] = v;
            return (nah[0] - px) ** 2 + (nah[1] - py) ** 2 + (nah[2] - pz) ** 2;
        };
        const senk = STUFE_ZIEL.senkrecht * schritt,
            raum2 = (STUFE_ZIEL.raum * schritt) ** 2;
        for (let v = 0; v < fein.length; v += 3) {
            const px = fein[v],
                py = fein[v + 1],
                pz = fein[v + 2];
            const ci = zelle(px, x0, nx),
                cj = zelle(pz, z0, nz);
            const k = ci + cj * nx;
            let best = Infinity,
                by = py,
                bt = -1,
                b1 = 0,
                b2 = 0;
            for (let q = kopf[k]; q < kopf[k + 1]; q++) {
                const t = eimer[q];
                const a = grobIdx[t * 3] * 3,
                    b = grobIdx[t * 3 + 1] * 3,
                    c = grobIdx[t * 3 + 2] * 3;
                const ax = grob[a],
                    az = grob[a + 2],
                    bx = grob[b],
                    bz = grob[b + 2],
                    cx = grob[c],
                    cz = grob[c + 2];
                const den = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz);
                if (Math.abs(den) < 1e-9) continue; // senkrecht stehend: trägt keine Höhe
                const l1 = ((bz - cz) * (px - cx) + (cx - bx) * (pz - cz)) / den;
                const l2 = ((cz - az) * (px - cx) + (ax - cx) * (pz - cz)) / den;
                const l3 = 1 - l1 - l2;
                if (l1 < -1e-6 || l2 < -1e-6 || l3 < -1e-6) continue;
                const y = l1 * grob[a + 1] + l2 * grob[b + 1] + l3 * grob[c + 1];
                const d = Math.abs(y - py);
                if (d < best) {
                    best = d;
                    by = y;
                    bt = t;
                    b1 = l1;
                    b2 = l2;
                }
            }
            if (best <= senk) {
                out[v + 1] = by;
                if (F.length)
                    feldZiel(v, grobIdx[bt * 3] * 3, grobIdx[bt * 3 + 1] * 3, grobIdx[bt * 3 + 2] * 3, b1, b2, 1 - b1 - b2);
                continue;
            }
            // keine Fläche senkrecht nah: der nächste Punkt im Raum (die 3×3 Eimer um den Vertex)
            let bd = Infinity,
                bx = px,
                bz = pz,
                bu = 0,
                bv = 0;
            by = py;
            bt = -1;
            for (let j = Math.max(0, cj - 1); j <= Math.min(nz - 1, cj + 1); j++)
                for (let i = Math.max(0, ci - 1); i <= Math.min(nx - 1, ci + 1); i++) {
                    const kk = i + j * nx;
                    for (let q = kopf[kk]; q < kopf[kk + 1]; q++) {
                        const t = eimer[q];
                        const d2 = naechster(px, py, pz, grobIdx[t * 3] * 3, grobIdx[t * 3 + 1] * 3, grobIdx[t * 3 + 2] * 3);
                        if (d2 < bd) {
                            bd = d2;
                            bx = nah[0];
                            by = nah[1];
                            bz = nah[2];
                            bt = t;
                            bu = nahL[0];
                            bv = nahL[1];
                        }
                    }
                }
            if (bd <= raum2) {
                out[v] = bx;
                out[v + 1] = by;
                out[v + 2] = bz;
                if (F.length)
                    feldZiel(v, grobIdx[bt * 3] * 3, grobIdx[bt * 3 + 1] * 3, grobIdx[bt * 3 + 2] * 3, 1 - bu - bv, bu, bv);
            }
        }
        return { ziel: out, felder: F };
    }

    // DIE HIMMELS-SICHT EINES BODEN-NETZES (K02a, Auge 11 bei 762/−138; K17-2 aus dem Stamm in den Kern — der voxel-worker
    // baut sie, wo er das Netz baut): je Vertex der Anteil des Himmels-Lichts, der ihn erreicht (der Boden-Stoff liest ihn als
    // Verdeckung). Die Wahrheit ist der Höhlen-Graph (`tri`: je Dreieck die Zelle seiner Luft, −1 = Himmels-Luft): jede Fläche
    // der Himmels-Luft sieht den Himmel (1), in die Höhlen-Luft fällt er je Netz-Schritt (`step` m) um exp(−step / m) — über
    // die Kanten der Dreiecke von der nächsten Himmels-Fläche fort; eine Höhle ohne Himmels-Fläche im Netz sieht ihn nie (0).
    // Ohne Höhlen-Graph sieht jede Fläche den Himmel.
    const HIMMELS_SICHT = Object.freeze({ m: 3 });
    function himmelsSicht(index, tri, n, step) {
        const V = new Float32Array(n);
        if (!tri) return V.fill(1);
        const nT = (index.length / 3) | 0;
        if (tri.length !== nT) throw new Error(`himmelsSicht: ${tri.length} Höhlen-Zellen für ${nT} Dreiecke`);
        const schritt = Math.exp(-step / HIMMELS_SICHT.m);
        const hop = new Int8Array(n).fill(-1);
        for (let t = 0; t < nT; t++)
            if (tri[t] < 0) hop[index[3 * t]] = hop[index[3 * t + 1]] = hop[index[3 * t + 2]] = 0;
        // je Schritt wächst die Front um eine Dreiecks-Kante (höchstens `schritte`, darunter liegt der Rest unter 1 %)
        const schritte = Math.min(120, Math.ceil(Math.log(0.01) / Math.log(schritt)));
        for (let k = 1; k <= schritte; k++) {
            let neu = 0;
            for (let t = 0; t < nT; t++) {
                const a = index[3 * t],
                    b = index[3 * t + 1],
                    c = index[3 * t + 2];
                if (hop[a] === k - 1 || hop[b] === k - 1 || hop[c] === k - 1) {
                    if (hop[a] < 0) ((hop[a] = k), neu++);
                    if (hop[b] < 0) ((hop[b] = k), neu++);
                    if (hop[c] < 0) ((hop[c] = k), neu++);
                }
            }
            if (!neu) break;
        }
        for (let i = 0; i < n; i++) V[i] = hop[i] < 0 ? 0 : Math.pow(schritt, hop[i]);
        return V;
    }

    // DER FELS-STOFF EINES BODEN-NETZES (K17; K17-2 aus dem Stamm `_felsStoff` in den Kern — der voxel-worker rechnet ihn beim
    // Chunk-Bau und reicht ihn per Transfer, der Haupt-Thread rechnet ihn nur im Sync-Bau): die Säulen-Farbe C ist eine Funktion
    // von (x, z); wo das Netz Fels ist, trägt der Vertex den Fels-Stoff (`felsFarbe`: Pakete, Rinde an konvexen Kanten aus der
    // Krümmung des Netzes, Mulden, Flechte am trockenen Licht, Moos am feuchten Sims). Das Gewicht je Vertex: was den Himmel
    // nicht sieht (1 − H, die Höhle), was steil steht (die Steile der Normale über `rockLo` … `rockHi`) und darunter der Schutt
    // des Schicht-Gesetzes (`hoehe(…, aus).schutt` auf einem Gitter der Kante `schuttGitter` über die Vertices unter dem Himmel,
    // die steiler als `schuttKandidat` stehen, bilinear gelesen; × `schutt`), je das größere. Die Krümmung nur an Fels und Höhle
    // (der Schutt bricht, er rundet nicht), die Feuchte EINMAL je Netz am Schwerpunkt seines Felsens unter dem Himmel.
    // L die Gelände-Lage · B `felsBasis` · o { rockLo, rockHi, schuttKandidat, schuttGitter, schutt, fuss } · P N I das Netz
    // (n Vertices) · H `himmelsSicht` (null: alles unter dem Himmel) · C die Säulen-Farbe (wird zum Stoff gemischt) ·
    // feuchte(x, z, y) die Feuchte des Wirts. → { schutt: Float32Array(n) (das Gewicht des Schutts, der Detail-Term legt sein
    // Korn auf), feuchte (womit das Moos gerechnet wurde; undefined ohne Fels) }.
    function felsStoff(L, B, o, P, N, I, H, C, n, feuchte) {
        const SW = new Float32Array(n);
        let gx0 = Infinity,
            gx1 = -Infinity,
            gz0 = Infinity,
            gz1 = -Infinity;
        for (let i = 0; i < n; i++) {
            if (1 - N[3 * i + 1] < o.schuttKandidat || (H && H[i] < 1)) continue;
            const x = P[3 * i],
                z = P[3 * i + 2];
            if (x < gx0) gx0 = x;
            if (x > gx1) gx1 = x;
            if (z < gz0) gz0 = z;
            if (z > gz1) gz1 = z;
        }
        if (gx1 >= gx0) {
            const nx = Math.max(2, Math.ceil((gx1 - gx0) / o.schuttGitter) + 1);
            const nz = Math.max(2, Math.ceil((gz1 - gz0) / o.schuttGitter) + 1);
            const dx = (gx1 - gx0) / (nx - 1) || 1;
            const dz = (gz1 - gz0) / (nz - 1) || 1;
            const aus = {};
            const Gw = new Float32Array(nx * nz);
            let jede = 0;
            for (let j = 0; j < nz; j++)
                for (let i = 0; i < nx; i++) {
                    hoehe(L, gx0 + i * dx, gz0 + j * dz, false, aus);
                    if ((Gw[j * nx + i] = aus.schutt > 0 ? aus.schutt : 0) > 0) jede++;
                }
            if (jede)
                for (let i = 0; i < n; i++) {
                    if (H && H[i] < 1) continue;
                    let u = (P[3 * i] - gx0) / dx,
                        v = (P[3 * i + 2] - gz0) / dz;
                    u = u < 0 ? 0 : u > nx - 1 ? nx - 1 : u;
                    v = v < 0 ? 0 : v > nz - 1 ? nz - 1 : v;
                    const iu = Math.min(nx - 2, Math.floor(u)),
                        iv = Math.min(nz - 2, Math.floor(v));
                    const fu = u - iu,
                        fv = v - iv;
                    const a = Gw[iv * nx + iu] + (Gw[iv * nx + iu + 1] - Gw[iv * nx + iu]) * fu;
                    const b = Gw[(iv + 1) * nx + iu] + (Gw[(iv + 1) * nx + iu + 1] - Gw[(iv + 1) * nx + iu]) * fu;
                    SW[i] = a + (b - a) * fv;
                }
        }
        // DIE WAND DES ERDBAUS (K66): der Vertex unter dem Himmel, steiler als `schuttKandidat`, trägt an der Wand des Erdbaus
        // (`erdbauWand`: Böschung, Kante zwischen zwei Flächen, Absatz an der Reichweite) den Schutt — die Stufe des Dorfs liest
        // sich als Stein, nie als Wiese; Fläche, Weg und die unbewegte Natur bleiben, wie sie sind. Ohne Erdbau ruht der Term
        // (byte-gleich). Die Wand trägt den Stoff mit vollem Gewicht, nie × `schutt` wie der Schutthang des Schicht-Gesetzes
        // (K66, Prüfung 1: mit 0,85 blieb ein Siebtel der Wiesen-Farbe im Vertex, die Wiesen-Wache `gruenSchwelle` las sie als
        // Wiese — die Nah-Wiese setzte Halme auf die Böschung, ihr Leser ist der Grün-Kanal der Boden-Karte).
        const EW = L.erdbau ? new Float32Array(n) : null;
        if (EW)
            for (let i = 0; i < n; i++) {
                if (1 - N[3 * i + 1] < o.schuttKandidat || (H && H[i] < 1)) continue;
                EW[i] = erdbauWand(L, P[3 * i], P[3 * i + 1], P[3 * i + 2], N[3 * i + 1]);
            }
        const W = new Float32Array(n);
        const KM = new Uint8Array(n);
        let jeder = 0;
        let kante = 0;
        let sx = 0,
            sy = 0,
            sz = 0,
            sn = 0;
        for (let i = 0; i < n; i++) {
            const st = 1 - N[3 * i + 1];
            let t = (st - o.rockLo) / (o.rockHi - o.rockLo);
            t = t < 0 ? 0 : t > 1 ? 1 : t;
            const wr = t * t * (3 - 2 * t);
            const ws = (EW && EW[i] > o.schutt * SW[i] ? EW[i] : o.schutt * SW[i]) * (1 - wr);
            SW[i] = ws;
            const w = Math.max(H ? 1 - H[i] : 0, wr + ws);
            if (!(w > 0)) continue;
            W[i] = w;
            jeder++;
            if (wr > 0 || (H && H[i] < 1)) {
                KM[i] = 1;
                kante++;
            }
            if (!H || H[i] > 0) {
                sx += P[3 * i];
                sy += P[3 * i + 1];
                sz += P[3 * i + 2];
                sn++;
            }
        }
        if (!jeder) return { schutt: SW, feuchte: undefined };
        const K = kante ? felsKruemmung(P, N, I, n, null, KM) : null;
        const fe = sn ? feuchte(sx / sn, sz / sn, sy / sn) : 0;
        const t = [0, 0, 0];
        for (let i = 0; i < n; i++) {
            const w = W[i];
            if (!(w > 0)) continue;
            const h = H ? H[i] : 1;
            const kr = K && KM[i] ? K[i] : 0;
            felsFarbe(B, P[3 * i], P[3 * i + 1], P[3 * i + 2], N[3 * i], N[3 * i + 1], N[3 * i + 2], kr, h, h > 0 ? fe : 0, o.fuss, t);
            C[3 * i] += (t[0] - C[3 * i]) * w;
            C[3 * i + 1] += (t[1] - C[3 * i + 1]) * w;
            C[3 * i + 2] += (t[2] - C[3 * i + 2]) * w;
        }
        return { schutt: SW, feuchte: fe };
    }

    // ── DAS GELÄNDE-STUDIO (K16b): Urteil, Messung und Plan — rein additiv, die Höhe rechnet weiter `hoehe` allein. Die
    // Bedienung (Namen, Haupt-Regler je Gruppe, die benannten Landschaften) ist kein Gesetz und kein Rezept des Kerns
    // (studio-vertrag §9): sie liegt beim Studio (worlds/gelaende/bedienung.json).
    //
    // DIE MESSUNG — EINE Quelle für die Wände (gate:gelaende-realismus, gate:gelaende-studio) und die Zahl-Leiste des
    // Studios (der Makro-Worker): das Raster der Statistik (4 × 4 km innen, 30 m, der Rand von 2 km rechnet Füllung, Abfluss
    // und das WAHRE Einzugsgebiet der Flüsse mit, die ins Feld treten — gezählt wird das innere Feld), der Makro-Abdruck des
    // Byte-Beweises (64 × 64, ±852 m, Schritt 27 m — ganzzahlig, f32-exakt; je Punkt mit und ohne Detail) und der Ort des
    // Schicht-Gesetzes (das Tafelland ist ein ORT im Stil-Feld λ 5,2 km: der Kern nennt ihn im Umkreis von 8 km — in
    // 4 × 4 km fehlt er zwei von drei Welten —, gezählt wird auf 2-m-Raster über 600 m im Tafelland selbst, Stil ≥ 0,8).
    const MESSUNG = (function () {
        const schritt = 30;
        const halb = 2000;
        const rand = Math.round(2000 / schritt);
        const aussen = halb + rand * schritt;
        return Object.freeze({
            raster: Object.freeze({ schritt, halb, rand, n: Math.floor((2 * aussen) / schritt) + 1, x0: -aussen }),
            abdruck: Object.freeze({ n: 64, x0: -852, schritt: 27 }),
            schicht: Object.freeze({ umkreis: 8000, n: 301, schritt: 2, stil: 0.8 }),
        });
    })();
    // Der Makro-Abdruck einer Höhe `hf(x, z, mitDetail)` — dieselben Bytes für die Lage des Studios (`hoehe`) und die Welt
    // (`_terrainMacroSurfaceY`): je Punkt erst mit, dann ohne Detail.
    function abdruckFeld(hf) {
        const A = MESSUNG.abdruck;
        const h = new Float64Array(A.n * A.n * 2);
        let q = 0;
        for (let j = 0; j < A.n; j++)
            for (let i = 0; i < A.n; i++) {
                h[q++] = hf(A.x0 + i * A.schritt, A.x0 + j * A.schritt, true);
                h[q++] = hf(A.x0 + i * A.schritt, A.x0 + j * A.schritt, false);
            }
        return h;
    }
    // Die Statistik des Mess-Rasters (`MESSUNG.raster`, H[i + j·n] = Höhe mit Detail am Punkt x0 + i·schritt, x0 + j·schritt)
    // einer Lage; `gesetz` (optional) ist das gemessene Gesetzbuch, das die benannten Seen nennt (die Linse misst einen
    // anderen Stand mit DIESER Rechnung) — ohne `benannteSeen` zählt jede Senke.
    function messStatistik(H, L, gesetz) {
        const R = MESSUNG.raster;
        const g = gesetz || { benannteSeen: benannteSeen };
        const benannt = typeof g.benannteSeen === "function" ? g.benannteSeen(L, R.x0, R.x0, R.schritt, R.n) : [];
        return statistik(H, R.n, R.schritt, L.waterLevel, benannt, R.rand);
    }
    // Das Schicht-Gesetz am Schicht-Ort in Zeilen (ein Generator: der Worker gibt zwischen zwei Zeilen den Takt ab, die
    // Linse zieht ihn durch `schichtMessung` in einem Zug): `{ ort, x, z, baender }` — ohne Ort (kein Tafelland im
    // Umkreis, oder ein Gesetz ohne `schichtOrt`) misst er am Ursprung ohne Maske, das Urteil gilt dort nicht (`urteil`).
    // `gesetz` (optional): das gemessene Gesetzbuch (`hoehe`, `grossform`, `schichtOrt`), sonst dieses.
    function* schichtSchritte(L, gesetz) {
        const M = MESSUNG.schicht;
        const g = gesetz || { hoehe: hoehe, grossform: grossformAus, schichtOrt: schichtOrt };
        const ort = typeof g.schichtOrt === "function" ? g.schichtOrt(L, -M.umkreis, -M.umkreis, M.umkreis, M.umkreis) : null;
        const ox = ort ? ort.x : 0;
        const oz = ort ? ort.z : 0;
        const h = ((M.n - 1) / 2) * M.schritt;
        const stil = ort && typeof g.grossform === "function";
        const HF = new Float64Array(M.n * M.n);
        const maske = new Uint8Array(M.n * M.n);
        for (let j = 0; j < M.n; j++) {
            for (let i = 0; i < M.n; i++) {
                const x = ox - h + i * M.schritt;
                const z = oz - h + j * M.schritt;
                HF[i + j * M.n] = g.hoehe(L, x, z, true);
                maske[i + j * M.n] = !stil || g.grossform(L, x, z).stil >= M.stil ? 1 : 0;
            }
            yield j;
        }
        return { ort, x: ox, z: oz, baender: hangBaender(HF, M.n, M.schritt, maske) };
    }
    function schichtMessung(L, gesetz) {
        const it = schichtSchritte(L, gesetz);
        for (;;) {
            const r = it.next();
            if (r.done) return r.value;
        }
    }
    // DER NATUR-KORRIDOR der Gelände-Linse (Nordstern §4.1, Karte K16) — EINE Quelle für die Wand (`diag-worker-dichte
    // --realismus`) und die Zahl-Leiste des Studios: grün im Korridor, rot außerhalb.
    const KORRIDOR = Object.freeze({
        senkenJeKm2: 1,
        senkeAnteil: 0.01,
        thetaMin: 0.3,
        thetaMax: 0.7,
        r2Min: 0.5,
        hammondSanft: 1,
        dorfplaetze: 3,
        kliff: 0.02,
        schutt: 0.05,
        pediment: 0.2,
    });
    // Das Urteil je Ziel aus der Statistik (`messStatistik`) und der Schicht-Messung (`schichtMessung`; null = noch nicht
    // gemessen): true im Korridor, false außerhalb, null = das Ziel gilt hier nicht (ohne Schicht-Ort gilt das Schicht-Gesetz
    // nicht — die Bänder am Ursprung sind nur Auskunft).
    function urteil(st, messung) {
        const K = KORRIDOR;
        const schicht = messung && messung.ort ? messung.baender : null;
        return {
            senken: st.senken1mJeKm2 <= K.senkenJeKm2 && st.anteilSenkeTiefer1m < K.senkeAnteil,
            flint:
                st.flint.theta != null &&
                st.flint.theta >= K.thetaMin &&
                st.flint.theta <= K.thetaMax &&
                st.flint.r2 >= K.r2Min,
            hammond: st.hammond.sanft >= K.hammondSanft,
            dorfplaetze: st.dorfplaetze >= K.dorfplaetze,
            // ohne Schicht-Ort (kein Tafelland im Umkreis) gilt das Schicht-Gesetz nicht: null, nie grün
            schicht:
                schicht == null
                    ? null
                    : schicht.zellen > 0 &&
                schicht.kliff >= K.kliff &&
                schicht.schutt >= K.schutt &&
                schicht.pediment >= K.pediment,
        };
    }
    // DER PLAN (M5): was das Studio exportiert und die Welt beim Import liest — die Saat und die Regler, sonst nichts.
    // Fail-closed: eine fremde Art, eine andere Version, eine Saat ohne Namen, ein unbekannter Regler (ein neuerer Build
    // hätte ein Gesetz, das dieser nicht rechnet) oder eine Nicht-Zahl WERFEN mit dem Grund; ein fehlender Regler trägt
    // sein def (wie im Erbgut), Zahlen werden auf [min, max] geklemmt. Leser: das Studio (Export), die Welt-Tür des Stamms
    // (`_weltAusPlan`), die Studio-Probe.
    const PLAN_ART = "gelaende-plan";
    const PLAN_VERSION = 1;
    // DER GRUND jeder Welt — EINE Quelle: eine frisch geborene Welt (und jede Plan-Welt) steht auf der Basis 0, das Meer
    // liegt `meerUnterBasis` unter der Basis (`_buildWaterPlane`, `_hydroInit`), die Hydrosphäre rechnet in Kacheln der
    // Kante `kachel` (`HYDROSPHERE.regionSize`), der Rausch-Strom der Höhe ist Saat + `strom` (`lageRausch`).
    const GRUND = Object.freeze({ basis: 0, meerUnterBasis: 3, kachel: 2048, strom: ":voxel" });
    function planNormal(roh) {
        const nein = (grund) => {
            throw new Error(`Gelände-Plan abgelehnt: ${grund}`);
        };
        if (!roh || typeof roh !== "object") nein("kein Objekt");
        if (roh.art !== PLAN_ART) nein(`die Art ist „${roh.art}", nicht „${PLAN_ART}"`);
        if (roh.v !== PLAN_VERSION) nein(`Version ${roh.v} (dieser Build liest ${PLAN_VERSION})`);
        if (typeof roh.saat !== "string" || !/^[A-Za-z0-9:._-]{1,64}$/.test(roh.saat))
            nein("die Saat ist kein Name (1–64 Zeichen aus A–Z a–z 0–9 : . _ -)");
        const rg = roh.regler;
        if (!rg || typeof rg !== "object" || Array.isArray(rg)) nein("keine Regler");
        for (const k of Object.keys(rg)) if (!LANDFORM_REGLER.some((r) => r.id === k)) nein(`unbekannter Regler „${k}"`);
        const regler = {};
        for (const r of LANDFORM_REGLER) {
            const v = rg[r.id];
            if (v === undefined) regler[r.id] = r.def;
            else if (typeof v !== "number" || !Number.isFinite(v)) nein(`${r.id} ist keine Zahl`);
            else regler[r.id] = Math.min(r.max, Math.max(r.min, v));
        }
        return { art: PLAN_ART, v: PLAN_VERSION, saat: roh.saat, regler };
    }
    // Das Erbgut einer Plan-Welt (`worldMeta.erbgut` roh): EIN Wildnis-Term, der jeden Regler trägt.
    function planErbgut(plan) {
        const p = planNormal(plan);
        return { terme: [Object.assign({ art: "wildnis" }, p.regler)] };
    }
    // DIE LAGE AUS IHREM ABBILD — EINE Rechnung für jede Lage, die `hoehe` liest: die Welt (`_gelaende`, ihr Rausch-Strom),
    // der Worker der Welt (`voxel-worker` applyStateSnapshot), der Plan (`planLage`), der Makro-Worker des Studios (A = die
    // gebaute Welt aus ihrem Abbild, B = der Entwurf) und die Gelände-Linse (`diag-worker-dichte --realismus`). Das Abbild
    // ist reine Daten (es reist per postMessage): Saat, Basis, Wasserspiegel, Erbgut-Normalform, Kachel-Kante.
    function lageRausch(seed, Rausch) {
        return new Rausch(String(seed) + GRUND.strom);
    }
    function lageAbbild(L) {
        return {
            seed: String(L.seed),
            baseHeight: L.baseHeight,
            waterLevel: L.waterLevel,
            erbgut: { terme: L.erbgut.terme, wildnis: L.erbgut.wildnis },
            regionSize: L.regionSize,
        };
    }
    function lageAus(a, Rausch) {
        return {
            seed: a.seed,
            noise: lageRausch(a.seed, Rausch),
            baseHeight: a.baseHeight,
            waterLevel: a.waterLevel,
            erbgut: a.erbgut,
            regionSize: a.regionSize,
        };
    }
    // Das Abbild der Welt, die ein Plan gebiert (`_weltAusPlan`): Saat des Plans, der Grund (`GRUND`), EIN Wildnis-Term.
    function planAbbild(plan) {
        const p = planNormal(plan);
        return {
            seed: p.saat,
            baseHeight: GRUND.basis,
            waterLevel: GRUND.basis - GRUND.meerUnterBasis,
            erbgut: { terme: erbgutNormal(planErbgut(p)), wildnis: 1 },
            regionSize: GRUND.kachel,
        };
    }
    // Die Gelände-Lage einer Plan-Welt, wie die Welt sie nach dem Import liest — `Rausch` ist der SimplexNoise-Konstruktor
    // des Wirts (vendor/simplex-noise.js).
    function planLage(plan, Rausch) {
        return lageAus(planAbbild(plan), Rausch);
    }

    // ===== DIE HYDROSPHÄRE (Karte hydro-faden): das Drainage-Netz einer Region als reine Daten =====
    // Flüsse · Seen · Wasserfälle · der Kanal-Index · das Wasser-Feld einer Region der Kante `H.regionSize` — f(L, H, boden,
    // origin): `L` die Lage, `H` das Gesetz der Hydrosphäre des Wirts (Stamm `HYDROSPHERE`; der Faden bekommt dasselbe Objekt),
    // `boden(x, z)` die gebaute Fläche des Wirts (voxel-worker `voxelSurfaceY`, er hält den Kanal der Hydrosphäre während des
    // Baus aus), `origin` null für die Heimat um den Ursprung, sonst die Ecke einer fernen Kachel. Flow-Accumulation aus der
    // Saat, keine Live-Simulation → multiplayer-sicher. Es rechnet der voxel-worker vor dem ersten Chunk (Lehre 14), der
    // Haupt-Faden empfängt das Ergebnis per Transfer (Lehre 24); bis zur Karte hydro-faden rechnete der Stamm es synchron im
    // Haupt-Faden (`_computeHydrosphere`: Kalt-Boot 168 ms, je ferne Kachel 235 ms).
    function hydrosphaere(L, H, boden, origin) {
        const ctx = hydroInit(L, H, origin);
        hydroMarkOcean(ctx);
        hydroPriorityFlood(ctx, H);
        const lakes = hydroExtractLakes(ctx, H);
        const rivers = hydroNetzFluesse(ctx, L, H);
        // Jeder Fluss-Punkt bekommt seine ECHTE Voxel-Surface-Höhe (`voxelY`): geroutet wird auf der glatten
        // Makro-Surface, Wasserfälle leben aber an den echten Klippen — das Ribbon hängt am Voxel-Relief.
        hydroSampleRiverSurfaces(rivers, boden);
        // Der Spiegel jedes Fluss-Punkts (stromab nie steigend, quer waagrecht) — das Bett folgt ihm (Carve).
        hydroRiverSpiegel(ctx, H, rivers, boden);
        const waterfalls = hydroExtractWaterfalls(ctx, H, rivers);
        const { dim, surf, waterLevel, lakeOf, isOcean } = ctx;
        let landCells = 0;
        let lakeCells = 0;
        let seaCells = 0;
        let surfMin = Infinity;
        let surfMax = -Infinity;
        for (let idx = 0; idx < dim * dim; idx++) {
            const s = surf[idx];
            if (s < surfMin) surfMin = s;
            if (s > surfMax) surfMax = s;
            if (lakeOf[idx] >= 0) lakeCells++;
            if (isOcean[idx]) {
                seaCells++;
                continue;
            }
            const i = idx % dim;
            const j = (idx / dim) | 0;
            if (i === 0 || j === 0 || i === dim - 1 || j === dim - 1) continue;
            landCells++;
        }
        // Diagnostik: steilstes Fluss-Segment der Voxel-Surface (Tuning-Anker für `waterfallSlope`) +
        // Netz-Vermessung (Fluss-Längen, See-Größen: echte Flüsse oder Pfützen-Kette?).
        let lakeCellsMax = 0;
        for (let li = 0; li < lakes.length; li++) {
            const c = lakes[li].cells ? lakes[li].cells.length : 0;
            if (c > lakeCellsMax) lakeCellsMax = c;
        }
        let riverMaxSlope = 0;
        let riverMaxDrop = 0;
        let riverPointsTotal = 0;
        let riverLenMax = 0;
        // die Breite des kleinsten vollen Flusses (Leser: die Quell-Hülle der Wasser-Linse)
        let bettMin = Infinity;
        for (let ri = 0; ri < rivers.length; ri++) {
            const pts = rivers[ri].points;
            riverPointsTotal += pts.length;
            if (pts.length > riverLenMax) riverLenMax = pts.length;
            for (const p of pts) if (p.quelle === 1 && p.width < bettMin) bettMin = p.width;
            for (let k = 0; k + 1 < pts.length; k++) {
                const a = pts[k];
                const b = pts[k + 1];
                const ay = typeof a.voxelY === "number" ? a.voxelY : a.y;
                const by = typeof b.voxelY === "number" ? b.voxelY : b.y;
                const drop = ay - by;
                if (drop <= 0) continue;
                const horiz = Math.hypot(b.x - a.x, b.z - a.z) || ctx.cell;
                if (drop / horiz > riverMaxSlope) riverMaxSlope = drop / horiz;
                if (drop > riverMaxDrop) riverMaxDrop = drop;
            }
        }
        // V9.43-d — den Carve-Index aus dem fertigen Netz bauen (Fluss-Bucket-
        // Grid + See-Cut-Feld); die Dichte des Wirts liest ihn beim Meshen.
        const carve = hydroBuildCarveIndex(ctx, H, rivers, lakes);
        // V9.49-a/e — das vereinte Wasser-Feld.
        const water = hydroBuildWaterField(ctx, lakes);
        return {
            ready: true,
            originX: ctx.originX,
            originZ: ctx.originZ,
            size: ctx.size,
            cell: ctx.cell,
            dim: ctx.dim,
            rivers,
            lakes,
            waterfalls,
            kanal: carve.kanal,
            bucketSize: carve.bucketSize,
            bucketsDim: carve.bucketsDim,
            lakeBedCell: carve.lakeBedCell,
            lakeW: carve.lakeW,
            lakeNear: carve.lakeNear,
            water,
            stats: {
                cells: dim * dim,
                landCells,
                lakeCells,
                seaCells,
                bettMin: Number.isFinite(bettMin) ? Math.round(bettMin * 100) / 100 : null,
                waterLevel: Math.round(waterLevel),
                surfMin: Math.round(surfMin),
                surfMax: Math.round(surfMax),
                riverMaxSlope: Math.round(riverMaxSlope * 100) / 100,
                riverMaxDrop: Math.round(riverMaxDrop * 10) / 10,
                riverPointsTotal,
                riverLenMax,
                lakeCellsMax,
            },
        };
    }

    // DIE BETT-TIEFE eines Fluss-Punkts (der EINE Leser): carveBedMin + carveBedK · volle Breite, an der Quelle mit ihrem
    // Anteil (W-F5: eine Quelle ist ein Rinnsal, nie ein 1,4-m-Graben aus dem Nichts). Leser: `hydroRiverSpiegel`,
    // `hydroBuildCarveIndex` (seg.dA/dB → der Kanal des Wirts) und der Stamm (`AnazhRealm._flussTiefe`).
    function flussTiefe(H, p) {
        const q = p.quelle;
        if (!(q > 0 && q <= 1)) throw new Error(`gelaende-core flussTiefe: Fluss-Punkt ohne Quell-Anteil (quelle = ${q})`);
        return Math.min(H.kanalTiefe, (H.carveBedMin + (H.carveBedK * p.width) / q) * q);
    }

    // DAS GLOBALE WASSER-Y-BAND über alle Regionen (Heimat und Kacheln): top = der höchste Spiegel JEDES Wasser-Körpers
    // (`waterLevel`, jeder See, jeder Punkt jedes Flusses) + 10 m, bottom = waterLevel − 10 m. Zellen außerhalb klassifiziert
    // der Wirt ohne Dichte-Probe (darüber AIR, darunter WATER). Leser: Stamm `_computeHydroBand`, Faden `hydroBandNeu` —
    // dasselbe Band in beiden (die Fluss-Spiegel gehören hinein, K16).
    function hydroBand(waterLevel, regionen) {
        let topY = waterLevel;
        for (const h of regionen) {
            if (!h) continue;
            if (Array.isArray(h.lakes))
                for (const lake of h.lakes) if (Number.isFinite(lake.level) && lake.level > topY) topY = lake.level;
            if (Array.isArray(h.rivers))
                for (const fluss of h.rivers)
                    for (const p of fluss.points || []) if (Number.isFinite(p.S) && p.S > topY) topY = p.S;
        }
        return { top: topY + 10, bottom: waterLevel - 10 };
    }

    // Phase 1 — Surface-Sampling: Region-Raster mit der Höhe `hoehe` OHNE Detail-Oktave
    // (`includeDetail=false`): die aliast bei 16-m-Abtastung (±4 m, λ~22 m) und übertrifft das Makro-
    // Gefälle je Zelle — die Drainage folgte dem Rauschen. Keine 3D-Roughness/Höhlen; 3 Noise-Calls je
    // Zelle. Der Wirt hält den Kanal der Hydrosphäre während des Baus aus (kein Carve-Zirkel).
    function hydroInit(L, H, origin) {
        const base = L.baseHeight || 0;
        let waterLevel = L.waterLevel;
        if (typeof waterLevel !== "number" || !Number.isFinite(waterLevel)) {
            waterLevel = base - GRUND.meerUnterBasis;
        }
        const size = H.regionSize;
        const cell = H.cell;
        const dim = Math.max(8, Math.round(size / cell));
        // A3 (V18.132) — parametrisierter Ursprung: ohne `origin` die Heimat-
        // Region (bit-identisch zu immer); mit `origin` eine ferne KACHEL
        // (seed-deterministisch — f(seed, Kachel-Koordinate), nie Spieler-Pfad).
        const originX = origin && Number.isFinite(origin.x) ? origin.x : -size / 2;
        const originZ = origin && Number.isFinite(origin.z) ? origin.z : -size / 2;
        const n = dim * dim;
        const raw = new Float64Array(n);
        for (let j = 0; j < dim; j++) {
            for (let i = 0; i < dim; i++) {
                const s = hoehe(L, originX + (i + 0.5) * cell, originZ + (j + 0.5) * cell, false);
                raw[j * dim + i] = Number.isFinite(s) ? s : base - 52;
            }
        }
        const surf = hydroBlur(raw, dim);
        return {
            base,
            waterLevel,
            size,
            cell,
            dim,
            originX,
            originZ,
            surf,
            isOcean: null,
            filled: null,
            lakeOf: null,
        };
    }

    // 3×3-Box-Blur übers Höhen-Raster (Rand-clamp; Ränder sind ohnehin Priority-Flood-Auslässe) —
    // Schutz gegen Aliasing-Reste der ridged-Oktave.
    function hydroBlur(src, dim) {
        const out = new Float64Array(dim * dim);
        for (let j = 0; j < dim; j++) {
            for (let i = 0; i < dim; i++) {
                let sum = 0;
                let cnt = 0;
                for (let dj = -1; dj <= 1; dj++) {
                    for (let di = -1; di <= 1; di++) {
                        const ni = i + di;
                        const nj = j + dj;
                        if (ni < 0 || nj < 0 || ni >= dim || nj >= dim) continue;
                        sum += src[ni + nj * dim];
                        cnt++;
                    }
                }
                out[i + j * dim] = sum / cnt;
            }
        }
        return out;
    }

    // Phase 1.5 — Ozean-Maske: Ozean = die mit dem Region-RAND verbundene Komponente der Zellen unter
    // Meeresspiegel; eine Binnen-Mulde darunter ist ein abflussloses Becken (See). Sonst wäre jede
    // Senke ein Auslass und der Abfluss versickerte, statt sich zu Flüssen zu sammeln.
    function hydroMarkOcean(ctx) {
        const { dim, surf, waterLevel } = ctx;
        const n = dim * dim;
        const isOcean = new Uint8Array(n);
        const stack = [];
        for (let j = 0; j < dim; j++) {
            for (let i = 0; i < dim; i++) {
                const border = i === 0 || j === 0 || i === dim - 1 || j === dim - 1;
                if (!border) continue;
                const idx = i + j * dim;
                if (surf[idx] <= waterLevel && !isOcean[idx]) {
                    isOcean[idx] = 1;
                    stack.push(idx);
                }
            }
        }
        const NB = [
            [-1, -1],
            [0, -1],
            [1, -1],
            [-1, 0],
            [1, 0],
            [-1, 1],
            [0, 1],
            [1, 1],
        ];
        while (stack.length) {
            const c = stack.pop();
            const ci = c % dim;
            const cj = (c / dim) | 0;
            for (let k = 0; k < 8; k++) {
                const ni = ci + NB[k][0];
                const nj = cj + NB[k][1];
                if (ni < 0 || nj < 0 || ni >= dim || nj >= dim) continue;
                const nidx = ni + nj * dim;
                if (!isOcean[nidx] && surf[nidx] <= waterLevel) {
                    isOcean[nidx] = 1;
                    stack.push(nidx);
                }
            }
        }
        ctx.isOcean = isOcean;
    }

    // Phase 2 — Depression-Filling (Priority-Flood + ε, Barnes et al. 2014): Min-Heap mit Rand- +
    // Ozean-Zellen seeden, tiefste poppen, Nachbarn auf max(Höhe, Pop-Füllhöhe + ε) füllen. ε gibt jeder
    // Zelle Gefälle (D8 auch auf See-Flächen) und einen echt-tieferen Nachbarn. filled > surf = Seen.
    function hydroPriorityFlood(ctx, H) {
        const { dim, surf, isOcean, waterLevel } = ctx;
        const EPS = H.fillEpsilon;
        const n = dim * dim;
        const filled = new Float64Array(n);
        const visited = new Uint8Array(n);
        // Binärer Min-Heap in parallelen Arrays (Priorität + Zell-Index). Gleichstand nach Index →
        // deterministischer Pop (sonst hinge filled an der Heap-Reihenfolge).
        const hp = [];
        const hv = [];
        const less = (a, b) => hp[a] < hp[b] || (hp[a] === hp[b] && hv[a] < hv[b]);
        const swap = (a, b) => {
            const tp = hp[a];
            hp[a] = hp[b];
            hp[b] = tp;
            const tv = hv[a];
            hv[a] = hv[b];
            hv[b] = tv;
        };
        const push = (p, v) => {
            hp.push(p);
            hv.push(v);
            let c = hp.length - 1;
            while (c > 0) {
                const par = (c - 1) >> 1;
                if (!less(c, par)) break;
                swap(c, par);
                c = par;
            }
        };
        const pop = () => {
            const top = hv[0];
            const lastP = hp.pop();
            const lastV = hv.pop();
            if (hp.length) {
                hp[0] = lastP;
                hv[0] = lastV;
                let c = 0;
                for (;;) {
                    const l = c * 2 + 1;
                    const r = l + 1;
                    let s = c;
                    if (l < hp.length && less(l, s)) s = l;
                    if (r < hp.length && less(r, s)) s = r;
                    if (s === c) break;
                    swap(s, c);
                    c = s;
                }
            }
            return top;
        };
        for (let j = 0; j < dim; j++) {
            for (let i = 0; i < dim; i++) {
                const idx = i + j * dim;
                const border = i === 0 || j === 0 || i === dim - 1 || j === dim - 1;
                const sea = isOcean[idx] === 1;
                if (border || sea) {
                    // Ozean-Zellen werden auf den flachen Meeresspiegel
                    // geseedet; eine Rand-Land-Zelle auf ihre echte Höhe.
                    filled[idx] = sea ? waterLevel : surf[idx];
                    visited[idx] = 1;
                    push(filled[idx], idx);
                }
            }
        }
        const NB = [
            [-1, -1],
            [0, -1],
            [1, -1],
            [-1, 0],
            [1, 0],
            [-1, 1],
            [0, 1],
            [1, 1],
        ];
        while (hp.length) {
            const c = pop();
            const ci = c % dim;
            const cj = (c / dim) | 0;
            for (let k = 0; k < 8; k++) {
                const ni = ci + NB[k][0];
                const nj = cj + NB[k][1];
                if (ni < 0 || nj < 0 || ni >= dim || nj >= dim) continue;
                const nidx = ni + nj * dim;
                if (visited[nidx]) continue;
                filled[nidx] = Math.max(surf[nidx], filled[c] + EPS);
                visited[nidx] = 1;
                push(filled[nidx], nidx);
            }
        }
        ctx.filled = filled;
    }

    // Phase 5a — Seen: Komponenten der aufgefüllten Zellen (filled > surf, über Meereshöhe). Je See:
    // Füll-Level (≈ Überlauf-Höhe), Boden, Rand-Höhe, Bounding-Box, Zell-Indizes (für die See-Plane).
    function hydroExtractLakes(ctx, H) {
        const { dim, surf, filled, isOcean } = ctx;
        const n = dim * dim;
        const TOL = 0.02;
        const lakeOf = new Int32Array(n).fill(-1);
        const lakes = [];
        // ein See ist eine aufgefüllte Zelle (filled > surf), die NICHT
        // Ozean ist — ein abflussloses Becken, das das Priority-Flood füllte
        // (auch eines unter Meereshöhe — wie das Tote Meer).
        const isLakeCell = (idx) => !isOcean[idx] && filled[idx] > surf[idx] + TOL;
        const NB = [
            [-1, -1],
            [0, -1],
            [1, -1],
            [-1, 0],
            [1, 0],
            [-1, 1],
            [0, 1],
            [1, 1],
        ];
        for (let start = 0; start < n; start++) {
            if (lakeOf[start] >= 0 || !isLakeCell(start)) continue;
            const id = lakes.length;
            const cells = [];
            const stack = [start];
            lakeOf[start] = id;
            let floorY = Infinity;
            let level = Infinity;
            let minX = Infinity;
            let minZ = Infinity;
            let maxX = -Infinity;
            let maxZ = -Infinity;
            while (stack.length) {
                const c = stack.pop();
                cells.push(c);
                if (surf[c] < floorY) floorY = surf[c];
                if (filled[c] < level) level = filled[c];
                const ci = c % dim;
                const cj = (c / dim) | 0;
                const wx = ctx.originX + (ci + 0.5) * ctx.cell;
                const wz = ctx.originZ + (cj + 0.5) * ctx.cell;
                if (wx < minX) minX = wx;
                if (wx > maxX) maxX = wx;
                if (wz < minZ) minZ = wz;
                if (wz > maxZ) maxZ = wz;
                for (let k = 0; k < 8; k++) {
                    const ni = ci + NB[k][0];
                    const nj = cj + NB[k][1];
                    if (ni < 0 || nj < 0 || ni >= dim || nj >= dim) continue;
                    const nidx = ni + nj * dim;
                    if (lakeOf[nidx] < 0 && isLakeCell(nidx)) {
                        lakeOf[nidx] = id;
                        stack.push(nidx);
                    }
                }
            }
            // Mikro-Senken (< minLakeCells) sind keine Seen: gefüllt bleibt die Drainage korrekt, aber sie
            // werden nicht gelistet + lakeOf zurückgesetzt (Fluss darf hindurch) — sonst hunderte Geister-Seen.
            if (cells.length < H.minLakeCells) {
                for (let ci2 = 0; ci2 < cells.length; ci2++) lakeOf[cells[ci2]] = -1;
                continue;
            }
            // Rand-Höhe: kleinste Füllhöhe der Nicht-See-Nachbarn ringsum.
            // Der See füllt bis zu seinem Überlauf — level ≈ rimY.
            let rimY = Infinity;
            for (let ci2 = 0; ci2 < cells.length; ci2++) {
                const c = cells[ci2];
                const ci = c % dim;
                const cj = (c / dim) | 0;
                for (let k = 0; k < 8; k++) {
                    const ni = ci + NB[k][0];
                    const nj = cj + NB[k][1];
                    if (ni < 0 || nj < 0 || ni >= dim || nj >= dim) continue;
                    const nidx = ni + nj * dim;
                    // nur der Nicht-See-, Nicht-Ozean-Rand zählt — der
                    // Überlauf läuft über Land zum Abfluss, nicht in den Ozean.
                    if (lakeOf[nidx] !== id && !isOcean[nidx] && filled[nidx] < rimY) {
                        rimY = filled[nidx];
                    }
                }
            }
            lakes.push({
                id,
                level,
                floorY,
                rimY: Number.isFinite(rimY) ? rimY : level,
                cells,
                bbox: { minX, minZ, maxX, maxZ },
            });
        }
        ctx.lakeOf = lakeOf;
        return lakes;
    }

    // Phase 5b — DIE FLÜSSE SIND DAS NETZ DES GESETZES (K16): die Läufe der Ebenen 0 und 1 aus gelaende-core
    // (`flussLaeufe`) — dasselbe Netz, das die Täler schneidet; die Hydrosphäre rechnet kein zweites (bis K16 eine D8-
    // Akkumulation auf der geglätteten Makro-Fläche: ihr Kanal fräste den gebauten Boden quer durch Hänge und Ebenen, 3,94
    // Senken > 1 m je km² und 1 Dorfplatz gegen 0,26 und 6 ohne ihn). Je Glied die Punkte seiner BAHN (der Mäander des
    // Gesetzes, `bahn`: Abstand ≤ Zelle auf dem Bogen; ein geteilter Unterlauf trägt dieselben Punkte); `y` die Sohle des
    // Gesetzes am Ort der Sehne (stromab streng fallend), die Richtung die der Bahn, die Breite aus dem Einzugsgebiet (Kern
    // `flussBreite`), an der Quelle das Rinnsal (W-F5: quellBett + quellWeitung je Meter Bogen). Ein Lauf endet am Meer, am
    // See (`mouth` "see", `seeY` sein Spiegel), als Zufluss auf der Bahn seines Hauptlaufs ("zufluss") oder am Rand der Kachel.
    function hydroNetzFluesse(ctx, L, H) {
        const { dim, cell, originX, originZ, size, filled, lakeOf, isOcean } = ctx;
        const laeufe = flussLaeufe(L, originX, originZ, originX + size, originZ + size, cell);
        const zelle = (x, z) => {
            const i = Math.floor((x - originX) / cell);
            const j = Math.floor((z - originZ) / cell);
            return i >= 0 && j >= 0 && i < dim && j < dim ? i + j * dim : -1;
        };
        const rivers = [];
        for (const lf of laeufe) {
            let lauf = lf.quelle ? 0 : Infinity;
            let points = [];
            let mouth = null;
            let seeY = NaN;
            const abschluss = (m) => {
                if (points.length >= 2) {
                    const rv = { points, mouth: m };
                    if (m === "see" && Number.isFinite(seeY)) rv.seeY = seeY;
                    if (lf.term) rv.term = lf.term; // der Lauf eines Terms (die Klamm `rinne`): Gesetz des Erbguts, kein Wurf des Feldes
                    rivers.push(rv);
                }
                points = [];
            };
            for (let g = 0; g < lf.glieder.length && !mouth; g++) {
                const gl = lf.glieder[g];
                const B = gl.bahn;
                const voll = flussBreite(gl.A);
                const bis = g === lf.glieder.length - 1 ? B.length : B.length - 1;
                for (let m = 0; m < bis; m++) {
                    const { t, x, z } = B[m];
                    const idx = zelle(x, z);
                    if (idx < 0) {
                        abschluss("border");
                        continue;
                    }
                    if (isOcean[idx]) {
                        mouth = "sea";
                        break;
                    }
                    if (lakeOf[idx] >= 0) {
                        mouth = "see";
                        seeY = filled[idx];
                        break;
                    }
                    const s = lauf + B[m].s;
                    const quelle = Math.min(1, (H.quellBett + H.quellWeitung * s) / voll);
                    points.push({
                        x,
                        z,
                        y: gl.ba + (gl.bb - gl.ba) * t,
                        width: voll * quelle,
                        quelle,
                        flowX: B[m].fx,
                        flowZ: B[m].fz,
                        inLake: false,
                    });
                }
                lauf += B[B.length - 1].s;
            }
            const ende = { meer: "sea", see: "see", muendung: "zufluss" };
            abschluss(mouth || ende[lf.ende] || "border");
        }
        return rivers;
    }

    // Phase 5c-Vorbereitung: jeder Fluss-Punkt bekommt `voxelY` = die gebaute Fläche `boden` an seiner Position.
    // Geroutet wird auf der glatten Makro-Surface, gerendert + nach Wasserfällen gesucht auf der
    // echten; der Wirt hält den Kanal aus → un-gecarvte Surface (kein Zirkel).
    function hydroSampleRiverSurfaces(rivers, boden) {
        for (let ri = 0; ri < rivers.length; ri++) {
            const pts = rivers[ri].points;
            for (let k = 0; k < pts.length; k++) {
                const p = pts[k];
                if (p.inLake) {
                    // V9.46 — im See ist die Wasser-Oberfläche der Füllstand
                    // (`p.y`), NICHT die gecarvte Bett-Surface — sonst meldete
                    // der Wasserfall-Scan einen Sturz am flachen See-Boden.
                    p.voxelY = p.y;
                    continue;
                }
                const v = boden(p.x, p.z);
                p.voxelY = Number.isFinite(v) ? v : p.y;
            }
        }
    }

    // DER FLUSS-SPIEGEL (Welle L, Q7-Gestalt, W-F1/F2/F3): je Fluss-Punkt der Spiegel `S` — stromab nie steigend,
    // quer waagrecht; das Bett folgt ihm (`_hydrosphereCarveAt`). Ziel je Punkt: das tiefste Ufer seines Querschnitts
    // (die ungecarvte Voxel-Fläche in der Mitte und an beiden Kanal-Kanten, halbe Breite + Bank-Rampe) minus dem
    // Freibord-Anteil der Bett-Tiefe; die Folge ist die monotone Ausgleichs-Kurve (PAVA, kleinste Quadrate) je Reach
    // zwischen zwei Seen — der Kanal schneidet Buckel und überbrückt Senken, beides so wenig wie möglich. Ein Reach endet
    // nie unter dem See, in den er mündet (oder dem Meer), und beginnt nie über dem See, aus dem er kommt. Geteilte
    // Unterläufe (zwei Quellen, ein Fluss) tragen EIN S: die längsten Flüsse zuerst, ein Zufluss endet am Spiegel seiner
    // Mündung. Bis V18.531 war der Spiegel die Makro-Höhe des Orts plus ein Buckel (14,3 % der Lauf-Schritte stiegen,
    // der Querschnitt wölbte sich 1,55 m). Läuft im Bau (der Wirt hält den Kanal aus: die Ufer sind ungecarvt).
    function hydroRiverSpiegel(ctx, H, rivers, boden) {
        const schluessel = (p) => p.x + "," + p.z;
        const S = new Map();
        const ziel = (p) => {
            const D = flussTiefe(H, p);
            const rand = p.width * 0.5 + D / H.bankNeigung;
            let tief = Number.isFinite(p.voxelY) ? p.voxelY : p.y;
            for (let sg = -1; sg <= 1; sg += 2) {
                const v = boden(p.x - p.flowZ * rand * sg, p.z + p.flowX * rand * sg);
                if (Number.isFinite(v) && v < tief) tief = v;
            }
            return tief - H.spiegelFreibord * D;
        };
        // PAVA (pool adjacent violators): benachbarte Verletzer verschmelzen zu ihrem Mittel, bis die Folge nicht steigt.
        const pava = (t) => {
            const summe = [];
            const zahl = [];
            for (let i = 0; i < t.length; i++) {
                summe.push(t[i]);
                zahl.push(1);
                let n = summe.length;
                while (n > 1 && summe[n - 2] / zahl[n - 2] < summe[n - 1] / zahl[n - 1]) {
                    summe[n - 2] += summe[n - 1];
                    zahl[n - 2] += zahl[n - 1];
                    summe.pop();
                    zahl.pop();
                    n--;
                }
            }
            const aus = [];
            for (let b = 0; b < summe.length; b++) for (let i = 0; i < zahl[b]; i++) aus.push(summe[b] / zahl[b]);
            return aus;
        };
        const reihe = rivers.slice().sort((a, b) => b.points.length - a.points.length);
        // (1) die Ausgleichs-Kurve je Reach, mit den Schranken der Seen und der Mündung.
        const reaches = [];
        const deckel = new Map();
        for (const rv of reihe) {
            const P = rv.points;
            let k = 0;
            while (k < P.length) {
                if (P[k].inLake || S.has(schluessel(P[k]))) {
                    k++;
                    continue;
                }
                let e = k;
                while (e < P.length && !P[e].inLake && !S.has(schluessel(P[e]))) e++;
                const t = [];
                for (let i = k; i < e; i++) {
                    const p = P[i];
                    t.push(ziel(p));
                    // Die HEBUNG ist gedeckelt: der Kanal überbrückt eine Senke höchstens um eine Bett-Tiefe über ihrem
                    // Grund — tiefer (eine Schlucht) fällt der Fluss hinein und schneidet stromab.
                    const D = flussTiefe(H, p);
                    const mitte = Number.isFinite(p.voxelY) ? p.voxelY : p.y;
                    deckel.set(schluessel(p), mitte + (1 - H.spiegelFreibord) * D);
                }
                const f = pava(t);
                for (let i = k; i < e; i++) S.set(schluessel(P[i]), f[i - k]);
                reaches.push({ rv, k, e });
                k = e;
            }
        }
        // (2) der Deckel, dann stromab nie steigend: in Fluss-Reihenfolge (die Füllhöhe y fällt entlang des Flusses
        // strikt) gibt jeder Punkt sein Minimum an den nächsten weiter — über Zusammenflüsse, nie in einen See.
        const naechster = new Map();
        const punkte = new Map();
        for (const rv of rivers) {
            const P = rv.points;
            for (let i = 0; i < P.length; i++) {
                if (P[i].inLake) continue;
                punkte.set(schluessel(P[i]), P[i]);
                if (i + 1 < P.length && !P[i + 1].inLake) naechster.set(schluessel(P[i]), schluessel(P[i + 1]));
            }
        }
        for (const [key, d] of deckel) if (S.get(key) > d) S.set(key, d);
        const nachHoehe = [...punkte.keys()].sort((a, b) => punkte.get(b).y - punkte.get(a).y);
        for (const key of nachHoehe) {
            const n = naechster.get(key);
            if (n !== undefined && S.get(n) > S.get(key)) S.set(n, S.get(key));
        }
        // (3) die Schranken: nie unter dem See, in den der Reach mündet (oder dem Meer), nie über dem See, aus dem er
        // kommt (eine Konstante wahrt die Monotonie).
        for (const { rv, k, e } of reaches) {
            const P = rv.points;
            const oben = k > 0 && P[k - 1].inLake ? P[k - 1].y : Infinity;
            let unten = -Infinity;
            if (e < P.length) unten = P[e].inLake ? P[e].y : S.get(schluessel(P[e]));
            else if (rv.mouth === "sea") unten = ctx.waterLevel;
            else if (rv.mouth === "see" && Number.isFinite(rv.seeY)) unten = rv.seeY;
            for (let i = k; i < e; i++) {
                const key = schluessel(P[i]);
                S.set(key, Math.min(oben, Math.max(unten, S.get(key))));
            }
            // Der Abfluss beginnt bündig mit seinem See (sonst schnitte der Kanal den Becken-Rand auf den tieferen Lauf
            // und das See-Wasser stünde als Wand darüber); die Stufe liegt im ersten Segment.
            if (Number.isFinite(oben)) S.set(schluessel(P[k]), oben);
        }
        // (4) DIE FRÄSE DES BREITEREN (K16, W-F5): die Ufer eines Zuflusses liest `ziel` ungefräst — liegt er im Kanal oder
        // auf der Böschung eines BREITEREN Flusses, schneidet dessen Fräse den Boden unter ihn, und sein Wasser stand darüber
        // (am Ursprung 0,5–2,9 m tief statt des Rinnsals; im Kanal des Stamms hob es dessen Spiegel bis 0,71 m). Je Segment
        // des breiteren (die breitesten zuerst — ihr Spiegel steht dann fest) trägt jeder schmalere Punkt eines anderen Laufs
        // in seiner Reichweite höchstens die Kanal-Fläche des Segments (die Gestalt von `_hydrosphereCarveAt`) minus seinem
        // Freibord, nie weniger als den Spiegel des breiteren. Danach wieder stromab nie steigend.
        {
            const sN = H.bankNeigung;
            const sK = H.bankKruemmung;
            const fuss = H.bankRundung;
            const zelle = (x, z) =>
                Math.round((x - ctx.originX) / ctx.cell - 0.5) + "," + Math.round((z - ctx.originZ) / ctx.cell - 0.5);
            const raster = new Map();
            for (const [key, p] of punkte) {
                const zk = zelle(p.x, p.z);
                if (!raster.has(zk)) raster.set(zk, []);
                raster.get(zk).push(key);
            }
            const stromab = (kp, kz, n) => {
                for (let k = naechster.get(kp), g = 0; k !== undefined && g < n; k = naechster.get(k), g++)
                    if (k === kz) return true;
                return false;
            };
            const segmente = [...naechster.entries()].sort(
                (a, b) => (punkte.get(b[0]).width || 0) - (punkte.get(a[0]).width || 0)
            );
            let gekappt = false;
            for (const [ka, kb] of segmente) {
                const a = punkte.get(ka);
                const b = punkte.get(kb);
                if (!b) continue;
                const hwA = a.width * 0.5;
                const hwB = b.width * 0.5;
                const dA = flussTiefe(H, a);
                const dB = flussTiefe(H, b);
                const weit = Math.max(hwA + dA / sN, hwB + dB / sN) + H.dammBreite + H.bankWeite;
                const nZ = Math.ceil(weit / ctx.cell) + 1;
                const ia = Math.round((a.x - ctx.originX) / ctx.cell - 0.5);
                const ja = Math.round((a.z - ctx.originZ) / ctx.cell - 0.5);
                const ex = b.x - a.x;
                const ez = b.z - a.z;
                const len2 = ex * ex + ez * ez || 1;
                for (let dj = -nZ; dj <= nZ; dj++)
                    for (let di = -nZ; di <= nZ; di++) {
                        const liste = raster.get(ia + di + "," + (ja + dj));
                        if (!liste) continue;
                        for (const kp of liste) {
                            if (kp === ka || kp === kb) continue;
                            const p = punkte.get(kp);
                            let t = ((p.x - a.x) * ex + (p.z - a.z) * ez) / len2;
                            t = t < 0 ? 0 : t > 1 ? 1 : t;
                            const halfW = hwA + (hwB - hwA) * t;
                            if (!(p.width * 0.5 < halfW)) continue;
                            const D = dA + (dB - dA) * t;
                            const dK = halfW + D / sN;
                            const dist = Math.hypot(p.x - (a.x + ex * t), p.z - (a.z + ez * t));
                            if (dist >= dK + H.dammBreite + H.bankWeite) continue;
                            const spiegel = S.get(ka) + (S.get(kb) - S.get(ka)) * t;
                            if (!(S.get(kp) > spiegel)) continue;
                            if (stromab(kp, ka, nZ + 2)) continue; // der eigene Lauf mündet hier
                            const B = spiegel - (1 - H.spiegelFreibord) * D;
                            const u0 = dist - halfW;
                            let flaeche =
                                u0 <= -fuss
                                    ? B
                                    : u0 < fuss
                                      ? B + (sN * (u0 + fuss) * (u0 + fuss)) / (4 * fuss)
                                      : B + sN * u0;
                            if (dist > dK) flaeche += sK * (dist - dK) * (dist - dK);
                            const grenze = Math.max(spiegel, flaeche - H.spiegelFreibord * flussTiefe(H, p));
                            if (S.get(kp) > grenze) {
                                S.set(kp, grenze);
                                gekappt = true;
                            }
                        }
                    }
            }
            if (gekappt)
                for (const key of nachHoehe) {
                    const n = naechster.get(key);
                    if (n !== undefined && S.get(n) > S.get(key)) S.set(n, S.get(key));
                }
        }
        for (const rv of rivers) for (const p of rv.points) p.S = p.inLake ? p.y : S.get(schluessel(p));
    }

    // Phase 5c — Wasserfälle: Fluss-Läufe, deren SPIEGEL (`S`) steil fällt (Steigung > waterfallSlope, in Summe ≥
    // waterfallMinDrop) = ein Sturz; aufeinanderfolgende steile Segmente verschmelzen zu EINEM. Jedes Segment zählt
    // EINMAL: zwei Quellen teilen ihren Unterlauf, und der Sturz darin gehört beiden (bis V18.531 19 Einträge an 13 Orten,
    // W-F4).
    function hydroExtractWaterfalls(ctx, H, rivers) {
        const waterfalls = [];
        const yOf = (p) => (Number.isFinite(p.S) ? p.S : p.y);
        const gesehen = new Set();
        for (let ri = 0; ri < rivers.length; ri++) {
            const pts = rivers[ri].points;
            let runStart = -1; // Index des oberen Punkts des steilen Laufs
            const flush = (lowerK) => {
                if (runStart < 0) return;
                const a = pts[runStart];
                const b = pts[lowerK];
                const topY = yOf(a);
                const bottomY = yOf(b);
                if (topY - bottomY >= H.waterfallMinDrop) {
                    waterfalls.push({
                        x: (a.x + b.x) / 2,
                        z: (a.z + b.z) / 2,
                        topY,
                        bottomY,
                        width: a.width,
                        flowX: a.flowX || b.flowX,
                        flowZ: a.flowZ || b.flowZ,
                        riverIndex: ri,
                    });
                }
                runStart = -1;
            };
            for (let k = 0; k + 1 < pts.length; k++) {
                const a = pts[k];
                const b = pts[k + 1];
                // V9.46 — eine See-Durchquerung ist flach (Wasser-Oberfläche),
                // kein Wasserfall; ein laufender steiler Lauf endet an ihr. Ein schon gezähltes Segment (geteilter
                // Unterlauf) beendet den Lauf ebenso.
                const seg = a.x + "," + a.z;
                if (a.inLake || b.inLake || gesehen.has(seg)) {
                    flush(k);
                    continue;
                }
                gesehen.add(seg);
                const drop = yOf(a) - yOf(b);
                const horiz = Math.hypot(b.x - a.x, b.z - a.z) || ctx.cell;
                const steep = drop > 0 && drop / horiz > H.waterfallSlope;
                if (steep) {
                    if (runStart < 0) runStart = k;
                } else {
                    flush(k); // k ist der untere Punkt des letzten steilen Segments
                }
            }
            flush(pts.length - 1);
        }
        return waterfalls;
    }

    // Carve-Index für `_hydrosphereCarveAt` + `_hydrosphereLakeAt`: (1) DER KANAL `kanal` — jedes Segment in alle Buckets
    // seiner um die Kanal-Reichweite erweiterten BBox (eine Abfrage liest einen Bucket), gepackt: `seg` je Segment
    // KANAL_FELDER Zahlen (ax az bx bz · hwA hwB · dA dB · sA sB), die Nummern des Buckets k in `idx[ab[k] .. ab[k + 1]]`
    // in der Reihe des Einsortierens — er reist per Transfer, kein Leser klont ihn (Lehre 24); (2) See-Raster
    // `lakeBedCell`, `lakeW`, `lakeNear` (Early-Out). Pure Daten — kein `_terrainDensityAt`, kein Zirkel.
    const KANAL_FELDER = 10;
    function hydroBuildCarveIndex(ctx, H, rivers, lakes) {
        const { dim, originX, originZ, size, waterLevel } = ctx;
        // --- Fluss-Bucket-Grid ---
        const bucketSize = H.carveBucketSize;
        const bucketsDim = Math.max(1, Math.ceil(size / bucketSize));
        const listen = new Array(bucketsDim * bucketsDim);
        const zahlen = [];
        const addSeg = (seg) => {
            // die Reichweite des Kanals: Krone (halbe Breite + Tiefe / Neigung) + die Krone des Damms + die Böschung dahinter
            const reach =
                Math.max(seg.hwA, seg.hwB) + Math.max(seg.dA, seg.dB) / H.bankNeigung + H.dammBreite + H.bankWeite;
            let bi0 = Math.floor((Math.min(seg.ax, seg.bx) - reach - originX) / bucketSize);
            let bi1 = Math.floor((Math.max(seg.ax, seg.bx) + reach - originX) / bucketSize);
            let bj0 = Math.floor((Math.min(seg.az, seg.bz) - reach - originZ) / bucketSize);
            let bj1 = Math.floor((Math.max(seg.az, seg.bz) + reach - originZ) / bucketSize);
            if (bi0 < 0) bi0 = 0;
            if (bj0 < 0) bj0 = 0;
            if (bi1 >= bucketsDim) bi1 = bucketsDim - 1;
            if (bj1 >= bucketsDim) bj1 = bucketsDim - 1;
            if (bi1 < bi0 || bj1 < bj0) return; // kein Bucket trägt es (das Segment liegt jenseits der Region)
            const si = zahlen.length / KANAL_FELDER;
            zahlen.push(seg.ax, seg.az, seg.bx, seg.bz, seg.hwA, seg.hwB, seg.dA, seg.dB, seg.sA, seg.sB);
            for (let bj = bj0; bj <= bj1; bj++) {
                for (let bi = bi0; bi <= bi1; bi++) {
                    const k = bj * bucketsDim + bi;
                    if (!listen[k]) listen[k] = [];
                    listen[k].push(si);
                }
            }
        };
        // Ein geteilter Unterlauf ist EIN Segment (zwei Quellen, ein Fluss — die Buckets trugen ihn je Quelle).
        const segGesehen = new Set();
        for (let ri = 0; ri < rivers.length; ri++) {
            const pts = rivers[ri].points;
            for (let k = 0; k + 1 < pts.length; k++) {
                const a = pts[k];
                const b = pts[k + 1];
                // V9.46 — eine See-Durchquerung NICHT carven: das Becken-Bett
                // ist schon von `_hydrosphereLakeAt` flach gesculptet; ein
                // Fluss-Carve grübe sonst eine Rinne in den flachen See-Boden.
                if (a.inLake || b.inLake) continue;
                const segKey = a.x + "," + a.z;
                if (segGesehen.has(segKey)) continue;
                segGesehen.add(segKey);
                addSeg({
                    ax: a.x,
                    az: a.z,
                    bx: b.x,
                    bz: b.z,
                    hwA: a.width * 0.5,
                    hwB: b.width * 0.5,
                    dA: flussTiefe(H, a),
                    dB: flussTiefe(H, b),
                    // der Spiegel an beiden Enden (`hydroRiverSpiegel`): Fluss-Fläche und Bett lesen ihn linear
                    sA: a.S,
                    sB: b.S,
                });
            }
        }
        const ab = new Int32Array(listen.length + 1);
        for (let k = 0; k < listen.length; k++) ab[k + 1] = ab[k] + (listen[k] ? listen[k].length : 0);
        const idx = new Int32Array(ab[listen.length]);
        for (let k = 0; k < listen.length; k++) if (listen[k]) idx.set(listen[k], ab[k]);
        const kanal = { seg: new Float64Array(zahlen), ab, idx };
        // --- See-Becken-Raster ---
        // `lakeBedCell` = flache Bett-Höhe `bedY` (2 Ringe propagiert für saubere bilineare Ufer-Ecken);
        // `lakeW` = Becken-Zugehörigkeit 0/1 (daraus rampt die Ufer-Mischung); `lakeNear` = 1-Ring-Maske.
        // `bedY` ∈ [waterLevel+0.5, level−1.2]: über dem Meer (Meeres-Plane verdeckt), unter dem Spiegel.
        // Seen ≤ waterLevel+2 werden nicht gesculptet — das Meer deckt sie (keine zwei Wasser-Ebenen).
        const n = dim * dim;
        const lakeBedCell = new Float32Array(n);
        const lakeW = new Float32Array(n);
        const lakeNear = new Uint8Array(n);
        for (let li = 0; li < lakes.length; li++) {
            const lake = lakes[li];
            if (lake.level <= waterLevel + 2.0) continue; // faktisch Meeresspiegel
            let bedY = lake.level - H.carveLakeBedDepth;
            const minBed = waterLevel + 0.5;
            const maxBed = lake.level - 1.2;
            if (bedY < minBed) bedY = minBed;
            if (bedY > maxBed) bedY = maxBed;
            const cells = lake.cells || [];
            for (let c = 0; c < cells.length; c++) {
                const idx = cells[c];
                const ci = idx % dim;
                const cj = (idx / dim) | 0;
                lakeW[idx] = 1;
                for (let dj = -2; dj <= 2; dj++) {
                    for (let di = -2; di <= 2; di++) {
                        const ni = ci + di;
                        const nj = cj + dj;
                        if (ni < 0 || nj < 0 || ni >= dim || nj >= dim) continue;
                        const nidx = ni + nj * dim;
                        lakeBedCell[nidx] = bedY; // bedY auf 2 Ringe propagiert
                        if (di >= -1 && di <= 1 && dj >= -1 && dj <= 1) lakeNear[nidx] = 1;
                    }
                }
            }
        }
        return { kanal, bucketSize, bucketsDim, lakeBedCell, lakeW, lakeNear };
    }

    // Vereintes Wasser-Feld je Region-Zelle: flacher Spiegel `waterY` + `waterKind` (0 Land · 1 Ozean ·
    // 2 See). Stehendes Wasser = EINE Höhe je Körper (`waterLevel`/`lake.level`), kein per-Zelle-
    // `filled` (ε-Gefälle kippt den See). Trockene Zelle → Meeresspiegel: das Rand-Quad taucht unters
    // Ufer, die Uferlinie ist der emergente Schnitt. Reine Daten.
    function hydroBuildWaterField(ctx, lakes) {
        const { dim, isOcean, lakeOf, waterLevel } = ctx;
        const n = dim * dim;
        const waterY = new Float32Array(n);
        const waterKind = new Uint8Array(n);
        for (let idx = 0; idx < n; idx++) {
            if (isOcean[idx]) {
                waterKind[idx] = 1;
                waterY[idx] = waterLevel;
            } else if (lakeOf[idx] >= 0) {
                waterKind[idx] = 2;
                const lk = lakes[lakeOf[idx]];
                waterY[idx] = lk ? lk.level : waterLevel;
            } else {
                waterY[idx] = waterLevel;
            }
        }
        return { waterY, waterKind };
    }

    // ═══ DIE 3D-DICHTE, DIE EDIT-KARTE UND DER WASSER-SPIEGEL (Karte gelaende-k1k4, Lehre 7: Gesetz statt Spiegel) ═══
    // Bis hierher rechnete der Stamm (`stamm/gelaende-boden.js`, `stamm/wasser-hydro.js`) die Dichte des Bodens (Spalte, Höhle,
    // Fluss-Kanal, See-Becken), die Edit-Karte und den Spiegel des Wassers, und der voxel-worker trug je Funktion eine Abschrift
    // („Mirror … bit-identisch“) — gate:worker-dichte verglich Abschrift mit Abschrift. Jetzt ist jede ein Gesetz dieses Kerns über
    // der Lage L (Stamm `_gelaende()`, Worker `state`): `hydrosphere` (die Heimat-Region), `hydroTiles` (Map Kachel-Schlüssel →
    // Region), `hydroGesetz` (Bank, Damm, Freibord des Stamms `HYDROSPHERE`), `hydroComputing` (der Faden rechnet gerade eine
    // Region: kein Kanal), `waterLevel`, `baseHeight`, `erbgut`, `noise`. Stamm und Worker rufen nur noch; die Probe ist die
    // Mutation des Kerns (gate:worker-dichte `--kern`): sie zieht Stamm-Leser UND Worker-Feld, oder einer liest eine Abschrift.

    // DIE REGION an (x, z): die Heimat, wenn (x, z) in ihr liegt; sonst die ferne Kachel (`kachelSchluessel`); sonst die Heimat
    // (deren Leser jenseits ihres Rands den Ozean-Default gehen). Vor dem Worldgen null.
    function hydroRegion(L, x, z) {
        const h = L.hydrosphere;
        if (h && h.ready) {
            const sizeM = h.dim * h.cell;
            if (x >= h.originX && z >= h.originZ && x < h.originX + sizeM && z < h.originZ + sizeM) return h;
            const tiles = L.hydroTiles;
            if (tiles && tiles.size) {
                const t = tiles.get(kachelSchluessel(L, x, z));
                if (t && t.ready) return t;
            }
        }
        return h;
    }
    // der Bucket von (x, z) im Kanal der Region h (`kanal`: KANAL_FELDER Zahlen je Segment in `seg`, die Segmente des Buckets
    // k in `idx[ab[k] .. ab[k + 1]]`) → k, oder −1 ohne Kanal, jenseits der Region und für einen leeren Bucket
    function flussBucket(h, x, z) {
        if (!h || !h.ready || !h.kanal) return -1;
        const bi = Math.floor((x - h.originX) / h.bucketSize);
        const bj = Math.floor((z - h.originZ) / h.bucketSize);
        const bd = h.bucketsDim;
        if (bi < 0 || bj < 0 || bi >= bd || bj >= bd) return -1;
        const kb = bj * bd + bi;
        return h.kanal.ab[kb] === h.kanal.ab[kb + 1] ? -1 : kb;
    }

    // DER FLUSS-KANAL an (x, z) → { P, L, k } oder null: P die Höhe des KANALS (Flachboden auf Spiegel − (1 − Freibord) · Tiefe
    // bis zur halben Breite, die Bank steigt mit bankNeigung bis zur Krone, dahinter die Böschung, die mit dem Abstand steiler
    // wird), L die Höhe des DAMMS (seine Krone auf Spiegel + max(Freibord · Tiefe, dammFreibord), eben bis dammBreite hinter der
    // Krone des Kanals, dahinter fällt er, wie die Böschung steigt), k die Rundung. Mehrere Segmente (Biegung, Mündung): der
    // tiefste Kanal und der höchste Damm. Das leere Bucket kostet ~5 Ops (millionenfach beim Meshing).
    function flussKanal(L, x, z) {
        const h = hydroRegion(L, x, z);
        const kb = flussBucket(h, x, z);
        if (kb < 0) return null;
        const { seg, idx, ab } = h.kanal;
        const H = L.hydroGesetz;
        const sN = H.bankNeigung;
        const sK = H.bankKruemmung;
        const fuss = H.bankRundung;
        const kB = H.dammBreite;
        let P = Infinity;
        let Ld = -Infinity;
        for (let q = ab[kb]; q < ab[kb + 1]; q++) {
            const o = idx[q] * KANAL_FELDER;
            const ax = seg[o];
            const az = seg[o + 1];
            const ex = seg[o + 2] - ax;
            const ez = seg[o + 3] - az;
            const len2 = ex * ex + ez * ez || 1;
            let t = ((x - ax) * ex + (z - az) * ez) / len2;
            if (t < 0) t = 0;
            else if (t > 1) t = 1;
            const dist = Math.hypot(x - (ax + ex * t), z - (az + ez * t));
            const halfW = seg[o + 4] + (seg[o + 5] - seg[o + 4]) * t;
            const D = seg[o + 6] + (seg[o + 7] - seg[o + 6]) * t;
            const dK = halfW + D / sN;
            if (dist >= dK + kB + H.bankWeite) continue;
            const spiegel = seg[o + 8] + (seg[o + 9] - seg[o + 8]) * t;
            const B = spiegel - (1 - H.spiegelFreibord) * D;
            const u0 = dist - halfW;
            let p = u0 <= -fuss ? B : u0 < fuss ? B + (sN * (u0 + fuss) * (u0 + fuss)) / (4 * fuss) : B + sN * u0;
            const u = dist - dK;
            if (u > 0) p += sK * u * u;
            let l = spiegel + Math.max(H.spiegelFreibord * D, H.dammFreibord);
            const uL = u - kB;
            if (uL > 0) l -= sN * uL + sK * uL * uL;
            if (p < P) P = p;
            if (l > Ld) Ld = l;
        }
        return P < Infinity ? { P, L: Ld, k: fuss } : null;
    }

    // DAS SEE-BECKEN an (x, z) → { bedY, w } oder null: bedY die flache, dichte Bett-Höhe, w ∈ [0, 1] die Zugehörigkeit (rampt
    // über den 1-Zellen-Ring zum Ufer); bilinear, der `lakeNear`-Early-Out hält die wasserlose Welt billig.
    function seeBecken(L, x, z) {
        const h = hydroRegion(L, x, z);
        if (!h || !h.ready) return null;
        const lw = h.lakeW;
        const lb = h.lakeBedCell;
        const ln = h.lakeNear;
        if (!lw || !lb || !ln) return null;
        const dim = h.dim;
        const cell = h.cell;
        const ci = Math.floor((x - h.originX) / cell);
        const cj = Math.floor((z - h.originZ) / cell);
        if (ci < 0 || cj < 0 || ci >= dim || cj >= dim || !ln[ci + cj * dim]) return null;
        const cf = (x - h.originX) / cell - 0.5;
        const gf = (z - h.originZ) / cell - 0.5;
        const i0 = Math.floor(cf);
        const j0 = Math.floor(gf);
        const tx = cf - i0;
        const tz = gf - j0;
        const cl = (v) => (v < 0 ? 0 : v >= dim ? dim - 1 : v);
        const i0c = cl(i0);
        const i1c = cl(i0 + 1);
        const r0 = cl(j0) * dim;
        const r1 = cl(j0 + 1) * dim;
        const w =
            (lw[i0c + r0] * (1 - tx) + lw[i1c + r0] * tx) * (1 - tz) + (lw[i0c + r1] * (1 - tx) + lw[i1c + r1] * tx) * tz;
        if (w <= 0) return null;
        const bedY =
            (lb[i0c + r0] * (1 - tx) + lb[i1c + r0] * tx) * (1 - tz) + (lb[i0c + r1] * (1 - tx) + lb[i1c + r1] * tx) * tz;
        return { bedY, w };
    }

    // DIE FORM DES GEWÄSSERS (EINE Formel für die Dichte des Chunks und die Fläche der Ferne): der Kanal kn als weiches Maximum
    // aus Gelände und Damm, davon das weiche Minimum mit dem Kanal (Rundung k: m ∓ h² · k / 4, h = max(k − |a − b|, 0) / k); das
    // See-Becken lk danach. d ist die Dichte an der Höhe y (die Fläche − y); mit y = 0 und d = der Höhe einer Spalte ist das
    // Ergebnis ihre Fläche.
    function gewaesserForm(d, y, kn, lk) {
        if (kn) {
            const dL = kn.L - y;
            let hk = Math.max(kn.k - Math.abs(d - dL), 0) / kn.k;
            const damm = Math.max(d, dL) + hk * hk * kn.k * 0.25;
            const dP = kn.P - y;
            hk = Math.max(kn.k - Math.abs(damm - dP), 0) / kn.k;
            d = Math.min(damm, dP) - hk * hk * kn.k * 0.25;
        }
        if (lk) {
            const flatD = lk.bedY - y;
            d = d * (1 - lk.w) + flatD * lk.w;
        }
        return d;
    }

    // DIE SPALTE (x, z) der Dichte: die rein 2D-Arbeit (die Höhe ~61 % der Kosten, das Wildnis-Gewicht, die Decke der Höhle,
    // Kanal und See-Becken) EINMAL je Spalte; `dichteBasis` liest sie über das ganze y-Band. Die Decke der Höhle bleibt unter dem
    // Boden (16 m, unter Wasser 24 m — kein Abfluss), DIE MÜNDUNG ist Gesetz (`hoehlenMund`): wo die Flanke Fels trägt, hebt ihr
    // Gewicht die Decke über den Boden. Füllt `out` und gibt es zurück.
    const SPALTE_HANG = { hang: 0 };
    function dichteSpalte(L, x, z, out) {
        const base = L.baseHeight || 0;
        const surf = hoehe(L, x, z, true, SPALTE_HANG);
        const wild = L.erbgut.wildnis;
        let ceilOffset = -24;
        if (wild > 0) {
            const wl = typeof L.waterLevel === "number" ? L.waterLevel : base + 4;
            ceilOffset = surf < wl + 1 ? -24 : -16 + HOEHLEN_MUND.hub * hoehlenMund(SPALTE_HANG.hang);
        }
        const h = L.hydrosphere;
        const aktiv = !!(h && h.ready && !L.hydroComputing);
        out.n = L.noise;
        out.base = base;
        out.surf = surf;
        out.wild = wild;
        out.ceilOffset = ceilOffset;
        out.hydroActive = aktiv;
        out.hydroCarve = aktiv ? flussKanal(L, x, z) : null;
        out.lake = aktiv ? seeBecken(L, x, z) : null;
        return out;
    }
    // DIE DICHTE OHNE EDITS an (x, y, z) über der Spalte ctx (> 0 Fels, < 0 Luft): die Fläche − y, Rauheit und Höhle als
    // Wildnis (Wurm, Kaverne, Halle unter der Hülle aus Boden und Decke; ohne ihr Gewicht kein noise3D), danach das Gewässer.
    function dichteBasis(x, y, z, ctx) {
        const surf = ctx.surf;
        let d = surf - y;
        if (ctx.wild > 0) {
            const n = ctx.n;
            const caveFloor = Math.max(0, Math.min(1, (y - (ctx.base - 28)) / 8));
            const caveCeil = Math.max(0, Math.min(1, (surf + ctx.ceilOffset - y) / 8));
            const caveEnv = caveFloor * caveCeil * ctx.wild;
            if (caveEnv > 0) {
                const ridge = 1 - Math.abs(n.noise3D(x * 0.03, y * 0.034, z * 0.03));
                const cave = Math.max(0, (ridge - 0.7) / 0.3);
                d -= cave * caveEnv * 36;
                const cavern = n.noise3D(x * 0.013, y * 0.018, z * 0.013);
                const cavernCarve = Math.max(0, (cavern - 0.55) / 0.45);
                d -= cavernCarve * caveEnv * 46;
                const hall = n.noise3D(x * 0.0045 + 71.3, y * 0.006 - 12.7, z * 0.0045 + 5.1);
                const hallCarve = Math.max(0, (hall - 0.5) / 0.5);
                d -= hallCarve * caveEnv * 72;
            }
        }
        if (ctx.hydroActive) d = gewaesserForm(d, y, ctx.hydroCarve, ctx.lake);
        return d;
    }
    // DER PUNKT: die Dichte an (x, y, z) mit den Edits `edits` (die Liste der Edit-Karte am Punkt, `editsAm`, oder die ganze
    // Liste — ein Edit außerhalb seiner Reichweite trägt nichts bei).
    function dichte(L, x, y, z, edits) {
        return mitEdits(dichteBasis(x, y, z, dichteSpalte(L, x, z, {})), x, y, z, edits);
    }
    // DAS GITTER ohne Edits (Float32, Index i + j·Nx + k·Nx·Ny ab ox|oy|oz): je Spalte nur die Ebenen im Band (`bandOben`,
    // `bandUnten`), darüber Luft −1, darunter Fels +1.
    function dichteGitter(L, ox, oy, oz, Nx, Ny, Nz, step) {
        const density = new Float32Array(Nx * Ny * Nz);
        const base = L.baseHeight || 0;
        const ctx = {};
        for (let k = 0; k < Nz; k++) {
            const wz = oz + k * step;
            for (let i = 0; i < Nx; i++) {
                const wx = ox + i * step;
                dichteSpalte(L, wx, wz, ctx);
                const bandTopJ = bandOben(ctx.surf, oy, step);
                const bandBotJ = bandUnten(ctx.surf, base, oy, step);
                const colBase = i + k * Nx * Ny;
                for (let j = 0; j < Ny; j++) {
                    const idx = colBase + j * Nx;
                    if (j > bandTopJ) density[idx] = -1;
                    else if (j < bandBotJ) density[idx] = 1;
                    else density[idx] = dichteBasis(wx, oy + j * step, wz, ctx);
                }
            }
        }
        return density;
    }
    // DAS GITTER MIT DEN EDITS über dem Gitter `basis` (bleibt): ihr Band deckt ihre Reichweite (`bandUmEdits`, die wahre Basis
    // statt ±1 — die Kappe der Form braucht sie), je Ecke die Form (`editsImGitter`). Ohne Edits die Basis selbst.
    function gitterMitEdits(L, basis, ox, oy, oz, Nx, Ny, Nz, step, edits) {
        if (!edits || !edits.length) return basis;
        const g = new Float32Array(basis);
        const spalte = (x, z) => dichteSpalte(L, x, z, {});
        bandUmEdits(g, ox, oy, oz, Nx, Ny, Nz, step, edits, L.baseHeight || 0, spalte, dichteBasis);
        return editsImGitter(g, ox, oy, oz, Nx, Ny, Nz, step, edits);
    }

    // DIE EDIT-KARTE (K23): je Chunk (Kante `span`) die Edits, deren Reichweite ihn samt einem Chunk Rand berührt (Spalten
    // floor((x − R)/span) − 1 … floor((x + R)/span) + 1, R = `editReich`), in Setz-Reihenfolge; der KERN ohne Rand dient der
    // Punkt-Probe. Ein Leser fragt nur seinen Chunk, die Summe bleibt Bit für Bit die der ganzen Liste. Identität und Länge der
    // Liste halten die Karte `k` frisch (ein Push wird nachgetragen, ein Tausch oder Kürzen baut neu); `gen` (optional) zieht je
    // Edit eine Generation, die jeder berührte Chunk trägt (der Stale-Filter des Stamms). `am*` merkt den letzten
    // Chunk der Punkt-Probe (`editsAm`).
    const KEINE_EDITS = Object.freeze([]);
    const editKarteSchluessel = (cx, cz) => (cx + 32768) * 65536 + (cz + 32768);
    function editKarte(k, edits, span, gen) {
        if (!k || k.edits !== edits || k.n > (edits ? edits.length : 0))
            k = { edits, n: 0, span, je: new Map(), kern: new Map(), gen: new Map(), amX: NaN, amZ: NaN, amN: -1 };
        while (edits && k.n < edits.length) {
            const ed = edits[k.n++];
            if (!ed || !Number.isFinite(ed.x) || !Number.isFinite(ed.z)) continue;
            const r = editReich(ed);
            const g = gen ? gen() : 0;
            const kax = Math.floor((ed.x - r) / k.span);
            const kbx = Math.floor((ed.x + r) / k.span);
            const kaz = Math.floor((ed.z - r) / k.span);
            const kbz = Math.floor((ed.z + r) / k.span);
            for (let cx = kax - 1; cx <= kbx + 1; cx++) {
                for (let cz = kaz - 1; cz <= kbz + 1; cz++) {
                    const key = editKarteSchluessel(cx, cz);
                    const liste = k.je.get(key);
                    if (liste) liste.push(ed);
                    else k.je.set(key, [ed]);
                    if (gen) k.gen.set(key, g);
                    if (cx >= kax && cx <= kbx && cz >= kaz && cz <= kbz) {
                        const kern = k.kern.get(key);
                        if (kern) kern.push(ed);
                        else k.kern.set(key, [ed]);
                    }
                }
            }
        }
        return k;
    }
    // DIE KARTE STEHT (ek-schleife, Lehre 25): dieselbe Liste und kein neuer Edit — `editKarte` trüge nichts nach.
    // Ein Leser, der die Karte je Probe frisch hält, fragt zuerst dies und zahlt zwei Vergleiche statt seiner Argumente
    // (der Stamm baute je Dichte-Probe das Chunk-Maß: im Fall-Wächter 60 Mio. Proben, der Edit-Weg 48 % der Feld-Dichte).
    function editKarteSteht(k, edits) {
        return !!k && k.edits === edits && k.n === (edits ? edits.length : 0);
    }
    // die Edits, die den Chunk (cx, cz) samt einem Chunk Rand berühren können (leer ohne)
    function editsNah(k, cx, cz) {
        return k.je.get(editKarteSchluessel(cx, cz)) || KEINE_EDITS;
    }
    // die Edits, deren Kasten den Chunk des Punkts (x, z) berührt (undefined ohne). DER LETZTE CHUNK bleibt gemerkt
    // (ek-schleife): eine Spalten-Probe fragt je Höhe denselben Chunk — dieselbe Liste ohne Schlüssel und Map; ein
    // Nachtrag (`n`) verwirft ihn, ein Neubau ist eine neue Karte.
    function editsAm(k, x, z) {
        const cx = Math.floor(x / k.span);
        const cz = Math.floor(z / k.span);
        if (cx !== k.amX || cz !== k.amZ || k.amN !== k.n) {
            k.amX = cx;
            k.amZ = cz;
            k.amN = k.n;
            k.am = k.kern.get(editKarteSchluessel(cx, cz));
        }
        return k.am;
    }
    // die Edits, die den waagrechten Kasten [x0, x1] × [z0, z1] berühren können: liegt er (mit 1 m Rand) im 3×3 um den Chunk
    // seiner Mitte, dessen Eintrag (jedes Chunk-Gitter samt Pad), sonst die ganze Liste
    function editsImKasten(k, x0, x1, z0, z1) {
        if (!k.edits || !k.edits.length) return KEINE_EDITS;
        const span = k.span;
        const cx = Math.floor((x0 + x1) / 2 / span);
        const cz = Math.floor((z0 + z1) / 2 / span);
        if (x0 - 1 > (cx - 1) * span && x1 + 1 < (cx + 2) * span && z0 - 1 > (cz - 1) * span && z1 + 1 < (cz + 2) * span)
            return editsNah(k, cx, cz);
        return k.edits;
    }

    // DER FLUSS an (x, z) → { flowX, flowZ, depth, surfaceY, centerness, ufer } oder null jenseits jeder Krone: der Spiegel der
    // Segmente (linear zwischen ihren Enden — stromab nie steigend, quer waagrecht), gemittelt zur Krone stetig auslaufend, samt
    // dem Pegel (`pegelHub`); Lauf, Tiefe und Breite des nächsten Segments; centerness [0, 1] (1 Mittellinie, 0 Kanal-Kante — die Strömung trägt nur im Kanal);
    // ufer die Kronen-Blende [0, 1] (1 bis zur Kanal-Kante, smoothstep auf 0 an der Krone, das Maximum der Segmente).
    function flussAm(L, x, z) {
        const h = hydroRegion(L, x, z);
        const kb = flussBucket(h, x, z);
        if (kb < 0) return null;
        const { seg, idx, ab } = h.kanal;
        const sN = L.hydroGesetz.bankNeigung;
        let bestD = Infinity;
        let dirX = 0;
        let dirZ = 0;
        let depth = 0;
        let bestHalfW = 1;
        let gSumme = 0;
        let sSumme = 0;
        let ufer = 0;
        for (let q = ab[kb]; q < ab[kb + 1]; q++) {
            const o = idx[q] * KANAL_FELDER;
            const ax = seg[o];
            const az = seg[o + 1];
            const ex = seg[o + 2] - ax;
            const ez = seg[o + 3] - az;
            const len2 = ex * ex + ez * ez || 1;
            let t = ((x - ax) * ex + (z - az) * ez) / len2;
            if (t < 0) t = 0;
            else if (t > 1) t = 1;
            const dist = Math.hypot(x - (ax + ex * t), z - (az + ez * t));
            const halfW = seg[o + 4] + (seg[o + 5] - seg[o + 4]) * t;
            const D = seg[o + 6] + (seg[o + 7] - seg[o + 6]) * t;
            const krone = halfW + D / sN;
            if (dist > krone) continue;
            const g = (1 - dist / krone) * (1 - dist / krone) + 1e-6;
            gSumme += g;
            sSumme += g * (seg[o + 8] + (seg[o + 9] - seg[o + 8]) * t);
            const u = dist <= halfW ? 0 : (dist - halfW) / (krone - halfW);
            const uS = 1 - u * u * (3 - 2 * u);
            if (uS > ufer) ufer = uS;
            if (dist < bestD) {
                bestD = dist;
                const len = Math.sqrt(len2);
                dirX = ex / len;
                dirZ = ez / len;
                depth = D;
                bestHalfW = halfW;
            }
        }
        if (bestD === Infinity) return null;
        return {
            flowX: dirX,
            flowZ: dirZ,
            depth,
            surfaceY: sSumme / gSumme + pegelHub(L, sSumme / gSumme),
            centerness: Math.max(0, 1 - bestD / Math.max(bestHalfW, 1)),
            ufer,
        };
    }
    // DER SPIEGEL QUER: der Spiegel des nächsten Segments an (x, z), auch jenseits der Krone (der Fluss-Spiegel liegt quer
    // waagrecht); −Infinity ohne Segment im Bucket. Leser: das Wasser-Sheet am Rand eines Schnitts.
    function spiegelQuer(L, x, z) {
        const h = hydroRegion(L, x, z);
        const kb = flussBucket(h, x, z);
        if (kb < 0) return -Infinity;
        const { seg, idx, ab } = h.kanal;
        let bestD = Infinity;
        let spiegel = -Infinity;
        for (let q = ab[kb]; q < ab[kb + 1]; q++) {
            const o = idx[q] * KANAL_FELDER;
            const ax = seg[o];
            const az = seg[o + 1];
            const ex = seg[o + 2] - ax;
            const ez = seg[o + 3] - az;
            const len2 = ex * ex + ez * ez || 1;
            let t = ((x - ax) * ex + (z - az) * ez) / len2;
            if (t < 0) t = 0;
            else if (t > 1) t = 1;
            const dist = Math.hypot(x - (ax + ex * t), z - (az + ez * t));
            if (dist < bestD) {
                bestD = dist;
                spiegel = seg[o + 8] + (seg[o + 9] - seg[o + 8]) * t;
            }
        }
        return spiegel + pegelHub(L, spiegel);
    }
    // DER NÄCHSTE RAND eines Flusses an (x, z) über die 3×3-Buckets (die Feuchte reicht ~26 m, weiter als die Bank) → { dist,
    // halfW, spiegel }: der nächste RAND (Abstand minus die Halbbreite), nie die nächste Mittellinie — zwischen zwei Segmenten
    // ungleicher Breite sprang sonst die Halbbreite und mit ihr die Feuchte (K16, U1).
    function flussRand(L, x, z) {
        const h = hydroRegion(L, x, z);
        if (!h || !h.ready || !h.kanal) return { dist: Infinity, halfW: 0 };
        const { seg, idx, ab } = h.kanal;
        const bs = h.bucketSize;
        const bd = h.bucketsDim;
        const bi0 = Math.floor((x - h.originX) / bs);
        const bj0 = Math.floor((z - h.originZ) / bs);
        let best = Infinity;
        let bestHw = 0;
        let bestRand = Infinity;
        let bestSp = NaN;
        for (let dj = -1; dj <= 1; dj++) {
            for (let di = -1; di <= 1; di++) {
                const bi = bi0 + di;
                const bj = bj0 + dj;
                if (bi < 0 || bj < 0 || bi >= bd || bj >= bd) continue;
                const kb = bj * bd + bi;
                for (let q = ab[kb]; q < ab[kb + 1]; q++) {
                    const o = idx[q] * KANAL_FELDER;
                    const ax = seg[o];
                    const az = seg[o + 1];
                    const ex = seg[o + 2] - ax;
                    const ez = seg[o + 3] - az;
                    const len2 = ex * ex + ez * ez || 1;
                    let t = ((x - ax) * ex + (z - az) * ez) / len2;
                    if (t < 0) t = 0;
                    else if (t > 1) t = 1;
                    const dist = Math.hypot(x - (ax + ex * t), z - (az + ez * t));
                    const hw = seg[o + 4] + (seg[o + 5] - seg[o + 4]) * t;
                    const rand = dist - Math.max(1, hw);
                    if (rand < bestRand) {
                        bestRand = rand;
                        best = dist;
                        bestHw = hw;
                        bestSp = seg[o + 8] + (seg[o + 9] - seg[o + 8]) * t;
                    }
                }
            }
        }
        return { dist: best, halfW: bestHw, spiegel: bestSp + pegelHub(L, bestSp) };
    }
    // DER SPIEGEL AM SCHNITT (F3): der Fluss-Spiegel quer (`spiegelQuer`) über einer Spalte, die ein Schnitt der Edit-Karte k
    // berührt (sein Radius + eine halbe Zell-Diagonale der Kante `step`), sonst −Infinity. Leser: das Wasser-Sheet am Graben.
    function schnittSpiegel(L, k, x, z, step) {
        const ed = editsNah(k, Math.floor(x / k.span), Math.floor(z / k.span));
        for (let e = 0; e < ed.length; e++) {
            const s = ed[e];
            if (s && s.mode === "carve" && Math.hypot(x - s.x, z - s.z) <= s.r + 0.71 * step) return spiegelQuer(L, x, z);
        }
        return -Infinity;
    }
    // DER STAU (gelaende.K2 (b)): der Spiegel des Stausees hinter einem Werk (Damm aus Füllungen, ein geerdeter Bau) an (x, z) —
    // die Stau-Felder der Lage (`L.stau`, je Feld ein Spalten-Fenster `gx0`/`gz0`/`w`/`h` der Kante `step` mit dem gehaltenen
    // Pegel `fillY`, NaN wo er nichts hebt), über dem Boden `boden` (−Infinity: jeder Pegel, Infinity: keiner); −Infinity ohne.
    // Ein stehender Körper wie See und Meer: der Spiegel des Kerns trägt ihn (`atlasSpiegel`), jeder Leser liest ihn mit. Die
    // Felder rechnet jeder Faden (`stauFelder`: der Überlauf aus Werk und Feld-Boden), nie der Haupt-Faden.
    function stauSpiegel(L, x, z, boden) {
        const felder = L.stau;
        let y = -Infinity;
        for (let n = 0; felder && n < felder.length; n++) {
            const f = felder[n];
            const i = Math.floor(x / f.step) - f.gx0;
            const k = Math.floor(z / f.step) - f.gz0;
            if (i < 0 || k < 0 || i >= f.w || k >= f.h) continue;
            const v = f.fillY[i + k * f.w];
            if (v > y && !(boden >= v)) y = v;
        }
        return y;
    }
    // DER ÜBERLAUF (Priority-Flood, gelaende.K2 (b)): `barrier[c]` = die Höhe, über der Wasser die Spalte c passiert, `init[c]`
    // = der Halte-Pegel der Außenwelt am Fensterrand (innen +Infinity) → je Spalte die niedrigste Fluchthöhe nach außen
    // (Relaxation fill[nb] = max(fill[cur], barrier[nb]) über einen Min-Heap).
    function stauUeberlauf(barrier, w, h, init) {
        const n = w * h;
        const fill = new Float64Array(n);
        const heap = new Int32Array(n + 1);
        const pos = new Int32Array(n).fill(-1);
        let size = 0;
        const less = (a, b) => fill[a] < fill[b];
        const swap = (i, j) => {
            const t = heap[i];
            heap[i] = heap[j];
            heap[j] = t;
            pos[heap[i]] = i;
            pos[heap[j]] = j;
        };
        const up = (i) => {
            while (i > 1 && less(heap[i], heap[i >> 1])) {
                swap(i, i >> 1);
                i >>= 1;
            }
        };
        const down = (i) => {
            for (;;) {
                let m = i;
                const l = i * 2;
                const r = l + 1;
                if (l <= size && less(heap[l], heap[m])) m = l;
                if (r <= size && less(heap[r], heap[m])) m = r;
                if (m === i) break;
                swap(i, m);
                i = m;
            }
        };
        for (let c = 0; c < n; c++) {
            fill[c] = init[c];
            if (Number.isFinite(init[c])) {
                heap[++size] = c;
                pos[c] = size;
                up(size);
            }
        }
        const done = new Uint8Array(n);
        const NDX = [1, -1, 0, 0];
        const NDZ = [0, 0, 1, -1];
        while (size > 0) {
            const cur = heap[1];
            heap[1] = heap[size--];
            if (size > 0) {
                pos[heap[1]] = 1;
                down(1);
            }
            pos[cur] = -1;
            if (done[cur]) continue;
            done[cur] = 1;
            const ci = cur % w;
            const ck = (cur / w) | 0;
            for (let d = 0; d < 4; d++) {
                const ni = ci + NDX[d];
                const nk = ck + NDZ[d];
                if (ni < 0 || nk < 0 || ni >= w || nk >= h) continue;
                const nb = ni + nk * w;
                if (done[nb]) continue;
                const cand = Math.max(fill[cur], barrier[nb]);
                if (cand < fill[nb]) {
                    fill[nb] = cand;
                    if (pos[nb] >= 0) up(pos[nb]);
                    else {
                        heap[++size] = nb;
                        pos[nb] = size;
                        up(size);
                    }
                }
            }
        }
        return fill;
    }
    // DER SPIEGEL AM WERK: das Wasser an der Mitte des Werks `cl` (−Infinity: es steht nicht über Wasser und hält keines) —
    // das Feld (`stauFeld`) und die Auswahl der Werke, die der Stamm den Fäden schickt (`_stauFelder`), lesen ihn.
    function stauWerkY(L, cl) {
        return atlasSpiegel(L, (cl.minX + cl.maxX) * 0.5, (cl.minZ + cl.maxZ) * 0.5, -Infinity);
    }
    // DAS FELD EINES WERKS (`stauFelder`): ein Fenster in Welt-Spalten (gx = floor(x/step), das Werk ± REACH, höchstens WIN_MAX)
    // — die Sperre jeder Spalte ist der Boden `boden(x, z)` (der Boden des Feldes samt Edits: ein Damm aus Füllungen steht
    // darin) oder die Krone eines Baus, der sie deckt; der Rand gibt das Wasser nur frei, wo es fließt: nass auf seinem Spiegel,
    // wo der nicht über dem Spiegel am Werk liegt (stromab; stromauf fließt es zu, über trockenem Rand reicht der See weiter,
    // beides hält). Der Überlauf ist der Pegel jeder Spalte; gehalten (`fillY`) ist er dort, wo er über dem Boden und über dem
    // Spiegel des Gesetzes liegt, verbunden mit einer gehobenen Wasser-Spalte (eine trockene Mulde daneben bleibt trocken).
    // null, wenn das Werk nicht über Wasser steht oder nichts hebt.
    function stauFeld(L, cl, CFG, step, boden) {
        const werkY = stauWerkY(L, cl);
        if (!(werkY > -Infinity)) return null;
        let gx0 = Math.floor(cl.minX / step) - CFG.REACH;
        let gx1 = Math.floor(cl.maxX / step) + CFG.REACH;
        let gz0 = Math.floor(cl.minZ / step) - CFG.REACH;
        let gz1 = Math.floor(cl.maxZ / step) + CFG.REACH;
        if (gx1 - gx0 + 1 > CFG.WIN_MAX) gx1 = (gx0 = ((gx0 + gx1) >> 1) - (CFG.WIN_MAX >> 1)) + CFG.WIN_MAX - 1;
        if (gz1 - gz0 + 1 > CFG.WIN_MAX) gz1 = (gz0 = ((gz0 + gz1) >> 1) - (CFG.WIN_MAX >> 1)) + CFG.WIN_MAX - 1;
        const w = gx1 - gx0 + 1;
        const h = gz1 - gz0 + 1;
        const barrier = new Float64Array(w * h);
        const basis = new Float64Array(w * h);
        const init = new Float64Array(w * h).fill(Infinity);
        for (let c = 0; c < w * h; c++) {
            const ix = c % w;
            const kz = (c / w) | 0;
            const x = (gx0 + ix + 0.5) * step;
            const z = (gz0 + kz + 0.5) * step;
            let bY = boden(x, z);
            for (const b of cl.bauten)
                if (x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ) bY = Math.max(bY, b.topY);
            barrier[c] = bY;
            basis[c] = atlasSpiegel(L, x, z, bY);
            if (ix === 0 || kz === 0 || ix === w - 1 || kz === h - 1)
                init[c] = basis[c] > -Infinity && basis[c] <= werkY + 0.05 ? basis[c] : Infinity;
        }
        const fill = stauUeberlauf(barrier, w, h, init);
        const fillY = new Float32Array(w * h).fill(NaN);
        const hebt = (c) => fill[c] < Infinity && fill[c] > barrier[c] + 0.01 && fill[c] > basis[c] + 0.01;
        const offen = [];
        for (let c = 0; c < w * h; c++) if (basis[c] > -Infinity && hebt(c)) offen.push(c);
        for (const c of offen) fillY[c] = fill[c];
        while (offen.length) {
            const c = offen.pop();
            const ix = c % w;
            for (const nb of [ix > 0 ? c - 1 : -1, ix < w - 1 ? c + 1 : -1, c - w, c + w])
                if (nb >= 0 && nb < w * h && !(fillY[nb] === fillY[nb]) && hebt(nb))
                    (offen.push(nb), (fillY[nb] = fill[nb]));
        }
        return fillY.some((v) => v === v) ? { gx0, gz0, w, h, step, fillY } : null;
    }
    // DIE FELDER DES STAUS (gelaende.K2 (b), gelesen von `stauSpiegel` über `L.stau`): je Werk der Werke `werke` (die Cluster
    // des Stamms `_stauWorkClusters`: Kasten minX/maxX/minZ/maxZ, Krone topY, Bauten `bauten`, Schlüssel `key`) sein Feld
    // (`stauFeld`, Regel `CFG` = CA_STAU des Stamms, Spalten-Kante `step`, Boden `boden`) an der Lage L, die dabei das Gesetz
    // ohne Stau liest (der Rufer hält `L.stau` leer). Gerechnet im Faden (voxel-worker `stauRechnen`, Lehre 14), nie im
    // Haupt-Faden. `merk` (oder null) ist der Stand der letzten Rechnung über der Edit-Liste `edits` und der Zahl der
    // Hydro-Kacheln `kacheln`: neu gerechnet wird nur ein neues Werk oder eines, in dessen Fenster ein neuer Edit reicht, und
    // jedes, wenn eine Kachel kam (ihr Wasser kann ein Werk tragen). → { felder, anders, merk }: `anders` die Felder, die
    // kamen, fielen oder neu gerechnet sind (ihre Zellen fallen).
    function stauFelder(L, werke, CFG, step, boden, merk, edits, kacheln) {
        const m = merk || { je: new Map(), edits: null, n: 0, kacheln: -1 };
        const neu = m.edits === edits && m.kacheln === kacheln ? edits.slice(m.n) : null;
        const R = CFG.REACH * step;
        const je = new Map();
        const anders = [];
        for (const cl of werke) {
            const alt = m.je.get(cl.key);
            const fern = (e) => {
                const r = R + editReich(e);
                return e.x + r < cl.minX || e.x - r > cl.maxX || e.z + r < cl.minZ || e.z - r > cl.maxZ;
            };
            if (alt !== undefined && neu && neu.every(fern)) je.set(cl.key, alt);
            else anders.push(alt, je.set(cl.key, stauFeld(L, cl, CFG, step, boden)).get(cl.key));
        }
        for (const [key, alt] of m.je) if (!je.has(key)) anders.push(alt);
        const felder = [...je.values()].filter(Boolean);
        return { felder, anders: anders.filter(Boolean), merk: { je, edits, n: edits.length, kacheln } };
    }
    // der Spiegel des stehenden Wasser-Körpers (Meer, See) der Zelle i einer Region — der See mit dem Pegel der Lage (`pegelHub`)
    function koerperY(L, h, i) {
        const y = h.water.waterY[i];
        return h.water.waterKind[i] === 2 ? y + pegelHub(L, y) : y;
    }
    // DER BEZUG DER UFER-BÄNDER an (x, z): MAX aus Meer (`waterLevel`, Default überall), See (3×3 der Zellen — die Dilatation
    // gegen den quantisierten Becken-Rand) und Fluss-Spiegel. `aus` (optional) trägt die beiden Bezüge getrennt: `see`
    // (Meer/See), `fluss` (der Fluss-Spiegel oder null) und `ufer` (seine Kronen-Blende). KEINE Wasser-Probe: „ist hier Wasser“
    // fragt jeder Leser `atlasSpiegel` (über den Körper des Stamms).
    function wasserSpiegel(L, x, z, aus) {
        let level = typeof L.waterLevel === "number" ? L.waterLevel : 0;
        const h = hydroRegion(L, x, z);
        if (h && h.ready && h.water && h.water.waterKind) {
            const dim = h.dim;
            const ci = Math.floor((x - h.originX) / h.cell);
            const cj = Math.floor((z - h.originZ) / h.cell);
            const wK = h.water.waterKind;
            for (let dj = -1; dj <= 1; dj++) {
                for (let di = -1; di <= 1; di++) {
                    const ni = ci + di;
                    const nj = cj + dj;
                    if (ni < 0 || nj < 0 || ni >= dim || nj >= dim) continue;
                    const idx = ni + nj * dim;
                    if (wK[idx] === 2 && koerperY(L, h, idx) > level) level = koerperY(L, h, idx);
                }
            }
        }
        const river = flussAm(L, x, z);
        if (aus) {
            aus.see = level;
            aus.fluss = river ? river.surfaceY : null;
            aus.ufer = river ? river.ufer : 0;
        }
        if (river && river.surfaceY > level) level = river.surfaceY;
        return level;
    }
    // DER SPIEGEL DES WASSERS an (x, z) über dem Boden `terrainTopY` (−Infinity = hier nie Wasser): der Körper der Zelle (Meer,
    // See) voll in jeder Tiefe; Land neben einem Körper (3×3) dessen Spiegel, wenn der Boden darunter liegt — nur bei ENDLICHEM
    // Boden („unbekannt“ heißt keine Rand-Erweiterung, nie „immer nass“); jenseits der Region ist das Meer der Default-Körper
    // (der Ozean ist global, V17.117). Der Fluss zählt mit seiner ganzen Breite, bei unbekanntem Boden nur sein Kanal-Kern.
    // `aus` (optional) bekommt den Spiegel der Körper ohne den Fluss: `aus.koerper`.
    function atlasSpiegel(L, x, z, terrainTopY, aus) {
        let level = -Infinity;
        let inRegion = false;
        const h = hydroRegion(L, x, z);
        if (h && h.ready && h.water && h.water.waterKind) {
            const dim = h.dim;
            const ci = Math.floor((x - h.originX) / h.cell);
            const cj = Math.floor((z - h.originZ) / h.cell);
            if (ci >= 0 && cj >= 0 && ci < dim && cj < dim) {
                inRegion = true;
                const wK = h.water.waterKind;
                const here = wK[ci + cj * dim];
                if (here === 1 || here === 2) level = koerperY(L, h, ci + cj * dim);
                else {
                    let rim = -Infinity;
                    for (let dj = -1; dj <= 1; dj++) {
                        for (let di = -1; di <= 1; di++) {
                            const ni = ci + di;
                            const nj = cj + dj;
                            if (ni < 0 || nj < 0 || ni >= dim || nj >= dim) continue;
                            const nk = wK[ni + nj * dim];
                            if ((nk === 1 || nk === 2) && koerperY(L, h, ni + nj * dim) > rim) rim = koerperY(L, h, ni + nj * dim);
                        }
                    }
                    if (Number.isFinite(terrainTopY) && rim > -Infinity && terrainTopY < rim) level = rim;
                }
            }
        }
        if (h && h.ready && !inRegion) level = typeof L.waterLevel === "number" ? L.waterLevel : 0;
        const stau = stauSpiegel(L, x, z, terrainTopY);
        if (stau > level) level = stau;
        if (aus) aus.koerper = level;
        const river = flussAm(L, x, z);
        if (river && river.surfaceY > level && (terrainTopY !== -Infinity || river.centerness > 0)) level = river.surfaceY;
        return level;
    }

    root.__gelaendeCore = Object.freeze({
        MESSUNG: MESSUNG,
        abdruckFeld: abdruckFeld,
        messStatistik: messStatistik,
        schichtSchritte: schichtSchritte,
        schichtMessung: schichtMessung,
        KORRIDOR: KORRIDOR,
        urteil: urteil,
        PLAN_ART: PLAN_ART,
        PLAN_VERSION: PLAN_VERSION,
        GRUND: GRUND,
        planNormal: planNormal,
        planErbgut: planErbgut,
        lageRausch: lageRausch,
        lageAbbild: lageAbbild,
        lageAus: lageAus,
        planAbbild: planAbbild,
        planLage: planLage,
        LINSE: LINSE,
        RAUSCH: RAUSCH,
        rauschGitter: rauschGitter,
        rauschRaum: rauschRaum,
        FELS: FELS,
        HIMMELS_SICHT: HIMMELS_SICHT,
        himmelsSicht: himmelsSicht,
        STUFE_ZIEL: STUFE_ZIEL,
        stufeZiel: stufeZiel,
        felsStoff: felsStoff,
        felsBasis: felsBasis,
        felsFarbe: felsFarbe,
        felsKruemmung: felsKruemmung,
        felsNetz: felsNetz,
        felsMittel: felsMittel,
        felsLage: felsLage,
        felsMittelWerte: felsMittelWerte,
        felsBankung: felsBankung,
        felsFein: felsFeinO,
        felsWelle: felsWelleO,
        schuttKorn: schuttKornO,
        schuttMittel: schuttMittel,
        FELS_SAAT: FELS_SAAT,
        felsZahl: ZAHL,
        statistik: statistik,
        hangBaender: hangBaender,
        HANG_BAENDER: HANG_BAENDER,
        maeanderZahl: maeanderZahl,
        MAEANDER: MAEANDER,
        FLUSS_BREITE: FLUSS_BREITE,
        flussBreite: flussBreite,
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
        erdbauWand: erdbauWand,
        erdbauGrund: erdbauGrund,
        erdbauHohl: erdbauHohl,
        erdbauKeller: erdbauKeller,
        erdbauSchnitt: erdbauSchnitt,
        EDIT_FORM: EDIT_FORM,
        editForm: editForm,
        editReich: editReich,
        editKrone: editKrone,
        editHoehe: editHoehe,
        mitEdits: mitEdits,
        editsImGitter: editsImGitter,
        bandOben: bandOben,
        bandUnten: bandUnten,
        bandUmEdits: bandUmEdits,
        ortCtx: ortCtx,
        LAGE_GRUND: LAGE_GRUND,
        lageGrund: lageGrund,
        hoehenRaster: hoehenRaster,
        hangOrt: hangOrt,
        WIND_FORM: WIND_FORM,
        windForm: windForm,
        HOEHLEN_MUND: HOEHLEN_MUND,
        hoehlenMund: hoehlenMund,
        BODEN_GENERATION: BODEN_GENERATION,
        erbgutNormal: erbgutNormal,
        wildnisY: wildnisY,
        termY: termY,
        SCHNEE: SCHNEE,
        schnee: schnee,
        TEMPERATUR: TEMPERATUR,
        temperatur: temperatur,
        temperaturFeld: temperaturFeld,
        temperaturAus: temperaturAus,
        EIS: EIS,
        wasserKoerper: wasserKoerper,
        eisDicke: eisDicke,
        SCHMELZE: SCHMELZE,
        schneePegel: schneePegel,
        schneeLinie: schneeLinie,
        schneeVersatz: schneeVersatz,
        PEGEL: PEGEL,
        abfluss: abfluss,
        pegelRegen: pegelRegen,
        pegelTafel: pegelTafel,
        pegelHub: pegelHub,
        LAVA: LAVA,
        waermeGang: waermeGang,
        glutAus: glutAus,
        lava: lava,
        grossform: grossformAus,
        landformRegler: landformRegler,
        benannteSeen: benannteSeen,
        flussLaeufe: flussLaeufe,
        schichtOrt: schichtOrt,
        kachelSchluessel: kachelSchluessel,
        hydrosphaere: hydrosphaere,
        KANAL_FELDER: KANAL_FELDER,
        flussTiefe: flussTiefe,
        hydroBand: hydroBand,
        hydroRegion: hydroRegion,
        flussKanal: flussKanal,
        seeBecken: seeBecken,
        gewaesserForm: gewaesserForm,
        dichteSpalte: dichteSpalte,
        dichteBasis: dichteBasis,
        dichte: dichte,
        dichteGitter: dichteGitter,
        gitterMitEdits: gitterMitEdits,
        editKarte: editKarte,
        editKarteSteht: editKarteSteht,
        editsNah: editsNah,
        editsAm: editsAm,
        editsImKasten: editsImKasten,
        flussAm: flussAm,
        spiegelQuer: spiegelQuer,
        schnittSpiegel: schnittSpiegel,
        flussRand: flussRand,
        wasserSpiegel: wasserSpiegel,
        atlasSpiegel: atlasSpiegel,
        stauUeberlauf: stauUeberlauf,
        stauWerkY: stauWerkY,
        stauFelder: stauFelder,
    });
})(typeof self !== "undefined" ? self : globalThis);
