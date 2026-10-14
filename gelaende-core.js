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
//   — die Normalform) · regionSize (die Kachel-Kante der Hydro-Regionen).
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
            mo,
            mn,
            ml,
            mv,
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
        let schutt = 0;
        let aue = false;
        for (let k = 0; k <= kmax; k++) {
            const S = N.S[k];
            const segs = zelle(N, k, Math.floor(x / S), Math.floor(z / S));
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
    const SCHNEE = Object.freeze({
        start: 140,
        voll: 185,
        zungen: [
            { f: 0.003, a: 18, ox: 17.3, oz: -41.9 },
            { f: 0.022, a: 7, ox: -5.1, oz: 8.3 },
        ],
    });
    function schnee(L, y, x, z) {
        if (!Number.isFinite(x) || !Number.isFinite(z)) throw new Error("gelaende-core schnee: der Ort (x, z) fehlt");
        const wl = Number.isFinite(L.waterLevel) ? L.waterLevel : (L.baseHeight || 0) - GRUND.meerUnterBasis;
        let zunge = 0;
        for (const o of SCHNEE.zungen) zunge += L.noise.noise2D(x * o.f + o.ox, z * o.f + o.oz) * o.a;
        return glatt(SCHNEE.start, SCHNEE.voll, y - wl + zunge);
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
    // Wildnis-Term (eine Bühne): [].
    function flussLaeufe(L, x0, z0, x1, z1, schritt) {
        if (!(schritt > 0)) throw new Error("gelaende-core flussLaeufe: der Abtast-Schritt der Bahn fehlt");
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

    // DIE EINE 2D-HÖHE der Welt = der Term-Auswerter ihres Erbguts: der erste Term setzt den Startwert (die Wildnis oder
    // eine Insel), jeder weitere legt sich nach seiner Art darauf — die Rampe addiert, die Bucht schneidet (Minimum).
    // Eine Welt ohne Erbgut trägt [wildnis]. Fehlt der Lage ihr Erbgut, wirft der Auswerter (fail-closed, nie still
    // Wildnis). Leser: jeder Leser der Höhe (Dichte, Hydrosphäre, Fern-Ring, Spawn-Ort) in Stamm und Worker.
    // `aus` (optional) trägt den Hang der Wildnis-Fläche (tan, `flaeche`) — ein Term darüber, der die Höhe ändert, nimmt
    // ihn (0: kein Hang-Urteil, wo Insel, Rampe oder Bucht formen), ebenso den Schutt des Schicht-Gesetzes (`aus.schutt`
    // 0..1: der Schutthang der Treppe × Stil, `treppeSchutt` — der Leser ist der Fels-Stoff des Bodens, K17).
    function hoehe(L, x, z, mitDetail = true, aus) {
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
    const ZAHL = Object.freeze({
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
        const k = o.floor(o.div(s, FELS.paket));
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
        const h1 = o.add(o.mul(x, FELS_CS), o.mul(z, FELS_SN)),
            h2 = o.sub(o.mul(z, FELS_CS), o.mul(x, FELS_SN));
        const s = o.add(o.add(y, o.mul(FELS_TE, h1)), o.mul(o.mul(welle, F.fein.welle), F.bank));
        const p = paketAnO(o, s);
        const pa = paketGrenzeO(o, p);
        const d = paketBankO(o, p);
        const u = o.div(o.sub(s, pa), d);
        const top = o.div(o.sub(paketGrenzeO(o, o.add(p, 1)), pa), d);
        const j = o.floor(u);
        const b0 = bankGrenzeO(o, p, o.sub(j, 1), h1, h2),
            b1 = bankGrenzeO(o, p, j, h1, h2),
            b2 = bankGrenzeO(o, p, o.add(j, 1), h1, h2),
            b3 = bankGrenzeO(o, p, o.add(j, 2), h1, h2);
        const ist1 = o.step(b1, u),
            ist2 = o.step(b2, u);
        const lo = o.max(b0, o.max(o.wahl(ist1, b1, -1e9), o.wahl(ist2, b2, -1e9)));
        const hi = o.min(o.min(o.wahl(ist1, 1e9, b1), o.wahl(ist2, 1e9, b2)), o.min(b3, top));
        aus.s = s;
        aus.h1 = h1;
        aus.h2 = h2;
        aus.paket = p;
        aus.bank = o.sub(o.add(j, ist2), o.sub(1, ist1));
        aus.d = d;
        aus.dicke = o.mul(o.sub(hi, lo), d);
        aus.unten = o.mul(o.sub(u, lo), d);
        aus.oben = o.mul(o.sub(hi, u), d);
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
        const kw = o.mul(
            o.mul(F.kehle, o.add(1, o.mul(F.fugeStreu, o.sub(o.mul(2, fzO(o, p, k, 19)), 1)))),
            fugeOffenO(o, p, k, L.h1, L.h2)
        );
        const kIn = o.mul(o.sub(1, o.step(kw, 1e-4)), o.sub(1, o.step(kw, L.unten)));
        const ke = o.wahl(kIn, o.sub(1, o.div(L.unten, o.max(kw, 1e-4))), 0);
        aus.kehle = o.mul(ke, ke);
        const rw = o.mul(F.rand, fugeOffenO(o, p, o.add(k, 1), L.h1, L.h2));
        const rIn = o.mul(o.sub(1, o.step(rw, 1e-4)), o.sub(1, o.step(rw, L.oben)));
        const t = o.wahl(rIn, o.sub(1, o.div(L.oben, o.max(rw, 1e-4))), 0);
        aus.rand = o.mul(o.mul(4, t), o.sub(1, t));
        const kd = o.mul(F.kluft, o.add(F.kluftDicht[0], o.mul(F.kluftDicht[1] - F.kluftDicht[0], fzO(o, p, 29, 0))));
        const kb = o.mul(F.kluftBreite, o.add(0.5, fzO(o, p, k, 71)));
        const v = 2 * F.kluftVersatz;
        const u1 = o.add(o.add(o.div(o.add(L.h1, o.mul(L.s, F.kluftSchraeg)), kd), fzO(o, p, 13, 0)), o.mul(o.sub(fzO(o, p, k, 61), 0.5), v));
        const u2 = o.add(
            o.add(o.div(o.sub(L.h2, o.mul(o.mul(0.6, L.s), F.kluftSchraeg)), kd), fzO(o, p, 17, 0)),
            o.mul(o.sub(fzO(o, p, k, 67), 0.5), v)
        );
        const ik = o.wahl(o.sub(1, o.step(F.kluftAnteil, fzO(o, p, k, 23))), o.max(inKluftO(o, u1, kb), inKluftO(o, u2, kb)), 0);
        aus.kluft = o.mul(ik, ik);
        return aus;
    }
    const felsKanten = (L, aus) => felsKantenO(ZAHL, L, aus);
    const _kanten = { kehle: 0, rand: 0, kluft: 0 };
    // DER FEIN-TERM DES FELSENS relativ zum Mittel, das der Vertex trägt (`felsMittelWerte`): `bank` = Helligkeit × helle Bank
    // × Kluft, `kante` = Kehle × Oberkante — je mit dem Mittel 1. B = `felsBasis` (die Töne der dunklen Lage und der hellen
    // Bank relativ zum Grundton). Die große Welle ist DASSELBE Gradienten-Rauschen wie im Vertex (`felsFarbe`, `rausch`).
    function felsFeinO(o, B, x, y, z) {
        const F = FELS;
        const FM = felsMittelWerte();
        const Yl = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
        const aRel = 0.6 * (Yl(B.akzent) / Yl(B.basis) - 1);
        const dRel = 1 - Yl(B.dunkel) / Yl(B.basis);
        const sy = o.add(y, o.mul(FELS_TE, o.add(o.mul(x, FELS_CS), o.mul(z, FELS_SN))));
        const w = o.mul(F.fein.rausch, o.rausch(o.mul(x, F.fein.xz), o.div(o.mul(sy, F.fein.y), F.bank), o.mul(z, F.fein.xz)));
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
        const u0 = o.div(x, S.korn),
            v0 = o.div(z, S.korn);
        const u = o.add(u0, o.mul(S.welle, o.add(o.sin(o.add(o.mul(v0, 1.9), 1.1)), o.mul(0.6, o.sin(o.add(o.mul(u0, 0.73), o.mul(v0, 1.31)))))));
        const v = o.add(v0, o.mul(S.welle, o.add(o.sin(o.add(o.mul(u0, 2.1), 0.7)), o.mul(0.6, o.sin(o.sub(o.mul(v0, 0.67), o.mul(u0, 1.23)))))));
        const iu = o.floor(u),
            iv = o.floor(v);
        let d1 = 9,
            d2 = 9,
            hb = 0.5,
            ho = 0.5;
        for (let a = -1; a <= 1; a++)
            for (let b = -1; b <= 1; b++) {
                const ci = o.add(iu, a),
                    cj = o.add(iv, b);
                const du = o.sub(o.add(ci, o.add(0.15, o.mul(0.7, o.zufall(FELS_SAAT ^ 0x5c, ci, cj, 0)))), u);
                const dv = o.sub(o.add(cj, o.add(0.15, o.mul(0.7, o.zufall(FELS_SAAT ^ 0x5c, ci, cj, 1)))), v);
                const r = o.add(S.groesse[0], o.mul(S.groesse[1] - S.groesse[0], o.zufall(FELS_SAAT ^ 0x5c, ci, cj, 3)));
                const d = o.div(o.sqrt(o.add(o.mul(du, du), o.mul(dv, dv))), r);
                const c = o.step(d, d1); // näher als der bisher nächste (im Maß des Steins)
                d2 = o.wahl(c, d1, o.min(d2, d));
                hb = o.wahl(c, o.zufall(FELS_SAAT ^ 0x5c, ci, cj, 2), hb);
                ho = o.wahl(c, o.zufall(FELS_SAAT ^ 0x5c, ci, cj, 4), ho);
                d1 = o.min(d1, d);
            }
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
            const ws = o.schutt * SW[i] * (1 - wr);
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
        HOEHLEN_MUND: HOEHLEN_MUND,
        hoehlenMund: hoehlenMund,
        BODEN_GENERATION: BODEN_GENERATION,
        erbgutNormal: erbgutNormal,
        wildnisY: wildnisY,
        termY: termY,
        SCHNEE: SCHNEE,
        schnee: schnee,
        grossform: grossformAus,
        landformRegler: landformRegler,
        benannteSeen: benannteSeen,
        flussLaeufe: flussLaeufe,
        schichtOrt: schichtOrt,
        kachelSchluessel: kachelSchluessel,
    });
})(typeof self !== "undefined" ? self : globalThis);
