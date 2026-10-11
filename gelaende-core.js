// AnazhRealm — gelaende-core.js: DAS GESETZBUCH DES GELÄNDES (K09a, 11.10.2026).
//
// Die EINE Quelle der 2D-Höhe der Welt: der Term-Auswerter des Erbguts (`worldMeta.erbgut` in seiner Normalform —
// Wildnis, Insel, Rampe, Bucht), der Wildnis-Term (Rauschen, Erosion, Makro-Anker, Canyon, Tafelberg, Deckel,
// Tiefsee, Tarn), der Makro-Anker samt Grat-Strom und die Rauheits-Maske. Geladen vom Main-Thread (index.html, vor
// dem Stamm), vom voxel-worker (importScripts mit ?v=) und vom Foundry-Worker (cores.manifest.json) — der bit-
// identische Worker-Spiegel ist gefallen; feld-wgsl.js bleibt der Seh-Spiegel (f32) und liest seine Eingaben hier.
//
// REIN: jede Funktion ist f(L, x, z, …). `L` ist die GELÄNDE-LAGE, die der Wirt reicht — der voxel-worker seinen
// `state`, der Stamm die lebende Sicht `_gelaende()` auf seinen Zustand. Gelesen werden genau diese Namen:
//   seed · noise (SimplexNoise des Stroms seed + ":voxel") · baseHeight · waterLevel · terrainSteepness · erosion ·
//   erosionTiles (Map oder Objekt {schlüssel: Kachel}) · tarns · macroAnker (null bei genVersion < 3) ·
//   erbgut ({ terme, wildnis, hash } — die Normalform) · regionSize (die Kachel-Kante der Hydro-Regionen).
// Kein this, kein Zustand außer den Rausch-Strömen je Saat (aus der Saat abgeleitet, nie Math.random), keine Zeit.
// Die Float-Reihenfolge jeder Formel ist die des Stamms vor dem Umzug (Byte-Beweis: gate:worker-dichte --abdruck).
//
// GESETZ-KERN (studio-vertrag §9): STUDIO_VERTRAG = 1 und FUNKTION = 1 — keine Rezepte, keine Gestalt.
(function (root) {
    "use strict";

    const VERSION = 1;

    // MACRO_ANKER — das designte Geographie-Skelett (genVersion ≥ 3): je Saat ein Trio aus Massiv (Position + Form,
    // anisotropes smoothstep-Profil, NE-SW-Streichrichtung), Becken (smoothstep-Mulde) und einer 5-Vertex-Tal-Polyline
    // (U-Profil + Innentrog); die Rausch-Schichten texturieren darauf. Spillpunkt-Garantie: Tal-End-Vertex = Becken-
    // Zentrum und monoton fallender talFloor → kein geschlossenes Becken.
    const MACRO_ANKER = Object.freeze({
        // Massiv: anisotrope smoothstep-Glocke
        spawnRadius: 700, // Massiv-Spawn um (0,0) — bewusst nah am Spieler-Spawn
        massivRadiusMin: 480,
        massivRadiusMax: 720,
        massivHoeheMin: 70,
        massivHoeheMax: 110,
        massivAspect: 1.6, // anisotrop entlang Streichrichtung (LAAS §4.2-Maß)
        // Becken: ungefähr gegenüber dem Massiv, deutlich versetzt
        beckenDistMin: 900,
        beckenDistMax: 1500,
        beckenRadiusMin: 280,
        beckenRadiusMax: 420,
        beckenTiefeMin: 12,
        beckenTiefeMax: 22,
        // Tal: 5 Vertices vom Massiv-Fuß zum Becken-Zentrum
        talVertices: 5,
        talJitter: 100, // ±50 m senkrecht zur Massiv-Becken-Achse
        talBreite: 120, // halbe Breite des U-Profils
        talTrenchTiefe: 14, // zusätzliche Innentrog-Senke (Fluss-Bett)
        talTrenchBreite: 28, // halbe Breite des Innentrogs
        talBlendExp: 2.2, // U-Profil-Exponent (smoothstep-quasi); LAAS-Wert
    });

    // Der Rausch-Konstruktor des Wirts (vendor/simplex-noise.js legt ihn global ab; im Worker über den window-Shim).
    function rauschen(strom) {
        const S = root.SimplexNoise;
        if (typeof S !== "function") throw new Error("gelaende-core: SimplexNoise fehlt (vendor/simplex-noise.js)");
        return new S(strom);
    }

    // Der Grat-Strom je Saat (Γ5: eigener Strom `saat + "-macro-ridge"`, kein Re-Roll anderer Ströme). Ein Platz:
    // wechselt die Saat, entsteht der Strom neu — er folgt der Welt, nie einem Cache-Reset des Wirts. Leser: `grat`
    // und der Seh-Spiegel (feld-wgsl.js liest seine Permutations-Tabelle).
    let gratSaat = null;
    let gratStrom = null;
    function gratRauschen(saat) {
        if (gratStrom === null || gratSaat !== saat) {
            gratStrom = rauschen(saat + "-macro-ridge");
            gratSaat = saat;
        }
        return gratStrom;
    }

    // Der Makro-Anker aus der Saat (pure f(saat)). Der Wirt persistiert ihn (worldMeta.macro) — eine Welt behält ihren
    // Anker, auch wenn diese Konstanten sich ändern; die Lage reicht ihn als `macroAnker`.
    function ankerAusSaat(saat) {
        const noise = rauschen(saat + "-macro-anker");
        // Pseudo-Zufalls-Strom aus dem deterministischen Rauschen (~15 Werte in [0,1]); der Strom-Suffix wahrt die
        // Γ5-Disziplin.
        const r01 = (k) => (noise.noise2D(k * 17.3, k * 9.7) + 1) * 0.5;
        const lerp = (a, b, t) => a + (b - a) * t;
        const MA = MACRO_ANKER;
        // Massiv-Position: irgendwo im Spawn-Bereich (~700 m vom Ursprung)
        const massivAng = r01(1) * Math.PI * 2;
        const massivDist = MA.spawnRadius * (0.4 + r01(2) * 0.5);
        const massivC = {
            x: Math.cos(massivAng) * massivDist,
            z: Math.sin(massivAng) * massivDist,
        };
        const massivR = lerp(MA.massivRadiusMin, MA.massivRadiusMax, r01(3));
        const massivH = lerp(MA.massivHoeheMin, MA.massivHoeheMax, r01(4));
        // Streichrichtung: 12°-120° (Vorzug NE-SW wie LAAS §4.2-Maß)
        const massivRot = 0.2 + r01(5) * 1.7;
        // Becken: ungefähr gegenüber dem Massiv, deutlich versetzt
        const beckenAng = massivAng + Math.PI + (r01(6) - 0.5) * 0.5;
        const beckenDist = lerp(MA.beckenDistMin, MA.beckenDistMax, r01(7));
        const beckenC = {
            x: Math.cos(beckenAng) * beckenDist,
            z: Math.sin(beckenAng) * beckenDist,
        };
        const beckenR = lerp(MA.beckenRadiusMin, MA.beckenRadiusMax, r01(8));
        const beckenD = lerp(MA.beckenTiefeMin, MA.beckenTiefeMax, r01(9));
        // Tal: N Vertices vom MASSIV-RAND (nicht Zentrum — sonst überschriebe der Tal-Lerp den Massiv-Boost) zum
        // Becken-Zentrum, Per-Vertex-Floors monoton fallend (smoothstep) → der Hauptfluss endet im Becken.
        const N = MA.talVertices;
        const talVertices = [];
        const talFloors = [];
        const dx = beckenC.x - massivC.x;
        const dz = beckenC.z - massivC.z;
        const len = Math.hypot(dx, dz) || 1;
        const ux = dx / len;
        const uz = dz / len;
        const perpX = -uz;
        const perpZ = ux;
        // Tal beginnt am Massiv-Sockel-Rand → das Tal „kommt vom Berg herunter"
        const talStartX = massivC.x + ux * massivR;
        const talStartZ = massivC.z + uz * massivR;
        const tdx = beckenC.x - talStartX;
        const tdz = beckenC.z - talStartZ;
        const startFloor = massivH * 0.15; // sanft am Massiv-Sockel-Rand
        const endFloor = -beckenD * 0.6; // im Becken-Boden enden
        for (let i = 0; i < N; i++) {
            const t = N === 1 ? 0 : i / (N - 1);
            const lerpX = talStartX + tdx * t;
            const lerpZ = talStartZ + tdz * t;
            // Endpunkte unverschoben (Tal-Start am Massiv-Rand + Becken-Anker FEST), nur Mitten-Vertices jittern
            const jitterScale = i === 0 || i === N - 1 ? 0 : 1;
            const jitter = (r01(10 + i) - 0.5) * MA.talJitter * jitterScale;
            talVertices.push({
                x: lerpX + perpX * jitter,
                z: lerpZ + perpZ * jitter,
            });
            const tSm = t * t * (3 - 2 * t); // smoothstep für monotonen Fall
            talFloors.push(startFloor + (endFloor - startFloor) * tSm);
        }
        return {
            massivC,
            massivR,
            massivH,
            massivRot,
            massivAspect: MA.massivAspect,
            beckenC,
            beckenR,
            beckenD,
            talVertices,
            talFloors,
            talBreite: MA.talBreite,
            talTrenchTiefe: MA.talTrenchTiefe,
            talTrenchBreite: MA.talTrenchBreite,
            talBlendExp: MA.talBlendExp,
        };
    }

    // RIDGE-NOISE für scharfe Grate im Massiv-Maskel: 7 Oktaven ridged `(1−|n|)²` in anisotroper Domain (45°-Rotation
    // × 1.65-Y-Stauchung → Grate NE-SW, LAAS §4.2-Maß; Skala 1/600 → λ~600 m). Oktav-Offset `i·7.31` (nie `+i` —
    // Symmetrie-Beats), persistence 0.52, lacunarity 2.13.
    function grat(L, x, z) {
        const n = gratRauschen(L.seed);
        const rxBase = (x + z) * 0.7071;
        const rzBase = (z - x) * 0.7071 * 1.65;
        const SCALE = 1 / 600;
        let ridge = 0;
        let amp = 0.5;
        let freq = SCALE;
        let norm = 0;
        for (let i = 0; i < 7; i++) {
            const v = n.noise2D(rxBase * freq + i * 7.31, rzBase * freq + i * 7.31);
            const nv = 1 - Math.abs(v);
            ridge += nv * nv * amp;
            norm += amp;
            amp *= 0.52;
            freq *= 2.13;
        }
        return ridge / norm;
    }

    // DIE MASSIV-MASKE [0,1] des Makro-Ankers an (x, z): die anisotrope smoothstep-Glocke (gedreht um die Streich-
    // richtung, gestreckt um den Aspekt) ohne Grate. Leser: `ankerBeitrag` (der Maskel der Grate) und die Fels-
    // Exposition des Wirts (`_rockExposureAt`: im Massiv-Footprint mehr Fels).
    function massivMaske(anker, x, z) {
        const ddx = x - anker.massivC.x;
        const ddz = z - anker.massivC.z;
        const cs = Math.cos(anker.massivRot);
        const sn = Math.sin(anker.massivRot);
        const rxA = ddx * cs - ddz * sn;
        const rzA = ddx * sn + ddz * cs;
        const ax = rxA / anker.massivAspect;
        const aDist = Math.hypot(ax, rzA);
        const mT = Math.max(0, Math.min(1, 1 - aDist / anker.massivR));
        return mT * mT * (3 - 2 * mT);
    }

    // Drei Terme der Makro-Geographie: Massiv-Boost (Ridge-Noise im Maskel), Tal-Senke (U-Profil + Innentrog, Lerp zum
    // Ziel-Floor), Becken-Mulde.
    function ankerBeitrag(L, x, z, anker) {
        // (1) Massiv: der Maskel `mShape` bündelt die Grate ins Massiv-Footprint, die Grate kommen aus `grat`. Form
        // `mask × (ridge^1.5 × H_core + mask × H_lift)` = scharfe Gipfel-Linien plus breiter Sockel-Lift.
        const mShape = massivMaske(anker, x, z);
        const ridge = grat(L, x, z);
        const ridgePow = Math.pow(ridge, 1.5);
        const massiv = mShape * (ridgePow * anker.massivH * 1.25 + mShape * anker.massivH * 0.35);
        // (2) Becken-Senke — smoothstep-Mulde
        const bdx = x - anker.beckenC.x;
        const bdz = z - anker.beckenC.z;
        const bDist = Math.hypot(bdx, bdz);
        const bT = Math.max(0, Math.min(1, 1 - bDist / anker.beckenR));
        const becken = -bT * bT * (3 - 2 * bT) * anker.beckenD;
        // (3) Tal — Distanz zur Polyline + Per-Vertex-Floor (monoton fallend vom Massiv-Fuß zum Becken), bilinear am
        // segmenteigenen t-Parameter.
        let tDist = Infinity;
        let tFloor = 0;
        for (let i = 0; i + 1 < anker.talVertices.length; i++) {
            const A = anker.talVertices[i];
            const B = anker.talVertices[i + 1];
            const ex = B.x - A.x;
            const ez = B.z - A.z;
            const len2 = ex * ex + ez * ez || 1;
            let t = ((x - A.x) * ex + (z - A.z) * ez) / len2;
            if (t < 0) t = 0;
            else if (t > 1) t = 1;
            const dx = x - (A.x + ex * t);
            const dz = z - (A.z + ez * t);
            const d = Math.hypot(dx, dz);
            if (d < tDist) {
                tDist = d;
                tFloor = anker.talFloors[i] + (anker.talFloors[i + 1] - anker.talFloors[i]) * t;
            }
        }
        return { massiv, becken, tDist, tFloor, mShape };
    }

    // Der Schlüssel der Hydro-/Erosions-Kachel an (x, z): Regionen der Kante `regionSize` um den Ursprung. Leser: die
    // Erosions-Auflösung hier und die Hydro-Auflösung des Wirts (`_hydroFor`, Worker `hydroFor`).
    function kachelSchluessel(L, x, z) {
        const size = L.regionSize;
        if (!(size > 0)) throw new Error("gelaende-core: die Lage trägt keine regionSize");
        const half = size / 2;
        return Math.floor((x + half) / size) + "," + Math.floor((z + half) / size);
    }

    // Die Erosions-Region an (x, z): die Heimat, wenn (x, z) in ihr liegt; sonst die Kachel; sonst die Heimat (deren
    // OOB-Logik im Leser = der alte Pfad). Kacheln als Map (Stamm) oder als Objekt (der Worker-Snapshot).
    function erosionFuer(L, x, z) {
        const e = L.erosion;
        if (e) {
            const sizeM = e.dim * e.cell;
            if (x >= e.originX && z >= e.originZ && x < e.originX + sizeM && z < e.originZ + sizeM) return e;
        }
        const tiles = L.erosionTiles;
        if (tiles) {
            const k = kachelSchluessel(L, x, z);
            const t = typeof tiles.get === "function" ? tiles.get(k) : tiles[k];
            if (t) return t;
        }
        return e;
    }

    // Das hydraulische Erosions-Delta (bilinear aus dem Gitter der Region; 0 außerhalb und solange keine Erosion
    // gerechnet ist — die Erosion sampelt dann die ROHE Fläche, kein Zirkel).
    function erosionDelta(L, x, z) {
        const e = erosionFuer(L, x, z);
        if (!e) return 0;
        const fx = (x - e.originX) / e.cell;
        const fz = (z - e.originZ) / e.cell;
        if (fx < 0 || fz < 0 || fx >= e.dim - 1 || fz >= e.dim - 1) return 0;
        const i0 = fx | 0;
        const j0 = fz | 0;
        const tx = fx - i0;
        const tz = fz - j0;
        const d = e.delta;
        const dim = e.dim;
        const a = i0 + j0 * dim;
        return (d[a] * (1 - tx) + d[a + 1] * tx) * (1 - tz) + (d[a + dim] * (1 - tx) + d[a + dim + 1] * tx) * tz;
    }

    // DIE MULDEN-FORM eines Tarns (Bergsee): die Gauss-Mulde mit σ = r/2 und Reichweite 2,2·r um (x, z), Tiefe d. Der
    // Wirt wählt Ort, Radius und Tiefe (die Genese `_hydroSeedTarns`), die Form ist Gesetz; `tarnDelta` liest sie.
    function tarnMulde(x, z, surf, r, d) {
        const sigma = r * 0.5;
        return { x, z, surf, r, d, reach2: r * 2.2 * (r * 2.2), twoSig2: 2 * sigma * sigma };
    }

    // Die Tarn-Mulden-Senkung an (x, z) (≤ 0, eine Gauss-Mulde je Tarn); per-Tarn-Early-Out → eine tarn-lose Welt
    // kostet 0 Ops.
    function tarnDelta(L, x, z) {
        const tarns = L.tarns;
        if (!tarns || !tarns.length) return 0;
        let delta = 0;
        for (let i = 0; i < tarns.length; i++) {
            const t = tarns[i];
            const dx = x - t.x;
            const dz = z - t.z;
            const d2 = dx * dx + dz * dz;
            if (d2 > t.reach2) continue;
            delta -= t.d * Math.exp(-d2 / t.twoSig2);
        }
        return delta;
    }

    // DIE RAUHEITS-MASKE [0,1] (λ~2000 m): die regionale Terrain-Typ-Maske, quadriert → Tiefland ist der Normalfall.
    // Moduliert die Relief-Oktaven des Wildnis-Terms und die Rauheit/Höhlen-Hülle des Spalten-Kontexts (Stamm und
    // Worker lesen sie hier — eine Maske, ein Ort).
    function rauheit(L, x, z) {
        const ero = L.noise.noise2D(x * 0.0005, z * 0.0005) * 0.5 + 0.5;
        let mtn = 1 - ero;
        if (mtn < 0) mtn = 0;
        return mtn * mtn;
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
            if (t.art === "wildnis") return { art: "wildnis" };
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

    // DER WILDNIS-TERM (`art: "wildnis"`): die Natur-Höhe der Welt — Rauschen, Erosion, Makro-Anker, Canyon,
    // Tafelberg, Deckel, Tiefsee und Tarn. Unteilbar: ihre Klemmen folgen nichtlinear aufeinander (der Anker addiert vor
    // Canyon-Boden, Terrasse, Deckel, Tiefsee und Tarn-Klemme), darum ist sie EIN Term und nie die Summe ihrer Teile.
    // `mitDetail = false` für die Hydrosphäre: die Detail-Oktave aliast bei 16-m-Abtastung.
    // (a) Der Domain-Warp des Wildnis-Terms — verschobene Sample-Koordinaten (bricht die Gitter-Parallelität der ridged-
    // Kämme; λ~3900 m, ±70 m Versatz).
    function warpX(n, x, z) {
        return n.noise2D(x * 0.00026 + 11.3, z * 0.00026 + 4.1) * 70;
    }
    function warpZ(n, x, z) {
        return n.noise2D(x * 0.00026 + 41.7, z * 0.00026 + 23.9) * 70;
    }
    // (0a) Die kontinentale Basis (λ~7100 m) an den GEWARPTEN Koordinaten: das Rohsignal und sein Hub, asymmetrisch nach
    // oben gebiast — HEBT Hochländer bis ~+145 m, senkt Becken nur bis −15 m (E[cont0]≈+25 m — die Land-Marge bleibt; die
    // V14.1-Messfalle: eine symmetrische Basis kippte 46 % unter Wasser); +12 kompensiert die abgesenkten flachen Regionen.
    function kontinentRoh(n, wx, wz) {
        return n.noise2D(wx * 0.00014 + 7.2, wz * 0.00014 + 3.8);
    }
    function kontinentHub(cBase) {
        return Math.max(0, cBase) * 130 + cBase * 15 + 12;
    }
    // DIE KONTINENTALE BASIS `cont0` an (x, z) — dieselbe Float-Folge wie im Wildnis-Term. Leser: der Wildnis-Term und die
    // Schnee-Prominenz `y − Basis − cont0` der Boden-Farbe (Stamm `_bodenFarbeAt`, Worker `attachFieldColors`).
    function kontinentBasis(L, x, z) {
        const n = L.noise;
        return kontinentHub(kontinentRoh(n, x + warpX(n, x, z), z + warpZ(n, x, z)));
    }

    function wildnisY(L, x, z, mitDetail) {
        const n = L.noise;
        const base = L.baseHeight || 0;
        const wx = x + warpX(n, x, z);
        const wz = z + warpZ(n, x, z);
        const cont0 = kontinentHub(kontinentRoh(n, wx, wz));
        // (0b) Tektonische Oktave (λ~1136 m) formt die breiten Massive; die ridged-`ranges` sitzen darauf als Textur.
        const tect = n.noise2D(wx * 0.00088, wz * 0.00088) * 45;
        // (b) Rauheit — moduliert ALLE Relief-Oktaven (ridgeAmp, cont, detail) → echte flache Ebenen.
        const mtn = rauheit(L, x, z);
        // (b2) Regionale Differenzierung über ZWEI unabhängige große-λ Masken → DREI Region-Typen: Relief-Maske
        // (λ~5300) = Tiefland vs Hochland; Stil-Maske (λ~4500) = Plateau (upBroad) vs Kette (upRidge², flow-gewarpt).
        const reliefN = n.noise2D(wx * 0.00019 + 33.1, wz * 0.00019 + 71.7) * 0.5 + 0.5;
        let upliftMask = Math.min(1, Math.max(0, (reliefN - 0.42) / 0.2));
        upliftMask = upliftMask * upliftMask * (3 - 2 * upliftMask); // 0 = Tiefland-Region (Felder/Wasser)
        const styleN = n.noise2D(wx * 0.00022 + 91.3, wz * 0.00022 + 5.9) * 0.5 + 0.5;
        let chainW = Math.min(1, Math.max(0, (styleN - 0.46) / 0.16));
        chainW = chainW * chainW * (3 - 2 * chainW); // 0 = Plateau-Stil, 1 = Ketten-Stil
        const upBroad = Math.max(0, n.noise2D(wx * 0.00035 + 19.3, wz * 0.00035 + 7.1));
        const upWarpX = n.noise2D(wx * 0.0002 + 51.7, wz * 0.0002 + 13.1) * 300;
        const upWarpZ = n.noise2D(wx * 0.0002 + 27.3, wz * 0.0002 + 88.9) * 300;
        const upRidge = 1 - Math.abs(n.noise2D((wx + upWarpX) * 0.00028 + 19.3, (wz + upWarpZ) * 0.00028 + 7.1));
        const upland = upliftMask * ((1 - chainW) * upBroad * 105 + chainW * upRidge * upRidge * 115);
        // (1) kontinentale Oktave (λ~625 m) — breite Undulation, mtn-moduliert (±8..36 m).
        const cont = n.noise2D(wx * 0.0016, wz * 0.0016) * (8 + 28 * mtn);
        // (2) ridged-Amplitude: Ebenen 5, Gebirge max 43; `terrainSteepness` (DSL-Op `terrain_steepness`, 0.1–2.0,
        // Default 1.0) skaliert sie.
        const ridgeAmp = (5 + 38 * mtn) * (L.terrainSteepness || 1);
        // (2a) ridged-Oktave (`(1−|noise|)²` faltet zu Kämmen), λ~333 m.
        const rN = n.noise2D(wx * 0.003, wz * 0.003);
        const ranges = (1 - Math.abs(rN)) * (1 - Math.abs(rN)) * ridgeAmp;
        // (2b) zweite ridged-Oktave, λ~133 m, ½ Amp — große Kämme tragen kleinere Sekundär-Kämme.
        const rN2 = n.noise2D(wx * 0.0075 + 5.7, wz * 0.0075 - 2.3);
        const ranges2 = (1 - Math.abs(rN2)) * (1 - Math.abs(rN2)) * ridgeAmp * 0.5;
        // (3) feine Detail-Oktave — un-gewarpt, hochfrequent; Ebenen fast glatt (±1), Gebirge körnig (±4).
        const detail = mitDetail ? n.noise2D(x * 0.045, z * 0.045) * (1 + 3 * mtn) : 0;
        // Das hydraulische Erosions-Delta carvt Täler und füllt Becken mit Sediment.
        let withoutTarn = base + cont0 + upland + tect + cont + ranges + ranges2 + detail + erosionDelta(L, x, z);
        // Makro-Geographie: Massiv-Boost + Tal-Senke (U-Profil, Lerp zum Per-Vertex-Floor, Innentrog) + Becken-Mulde.
        // Der Anker ist null bei genVersion < 3 (alte Welten sehen das Feld nicht).
        const anker = L.macroAnker;
        if (anker) {
            const m = ankerBeitrag(L, x, z, anker);
            withoutTarn += m.massiv + m.becken;
            // Drainage-by-Design: außerhalb des Tal-Korridors Zusatzhöhe ∝ Tal-Distanz → monotone Vor-Neigung, die
            // Drainage findet das Tal. `(1−mShape)` schützt das Massiv, der Becken-Block den Becken-Innenraum.
            const distOutsideTal = Math.max(0, m.tDist - anker.talBreite);
            const drainageH = Math.min(distOutsideTal * 0.06, 35);
            const distBecken = Math.hypot(x - anker.beckenC.x, z - anker.beckenC.z);
            const beckenBlock = Math.max(0, Math.min(1, (distBecken - anker.beckenR * 0.6) / (anker.beckenR * 0.4)));
            withoutTarn += drainageH * (1 - m.mShape) * beckenBlock;
            // Tal: innerhalb der Tal-Breite zum Per-Vertex-Floor LERPEN (pow-U-Profil + smoothstep-Innentrog) — das Tal
            // mündet im richtigen Niveau.
            if (m.tDist < anker.talBreite) {
                const uT = m.tDist / anker.talBreite;
                const uShape = Math.pow(uT, anker.talBlendExp);
                const target = base + m.tFloor;
                withoutTarn = withoutTarn + (target - withoutTarn) * (1 - uShape);
                // Innentrog: konzentrierter Strom (der Fluss findet sich im Trog)
                if (m.tDist < anker.talTrenchBreite) {
                    const iT = 1 - m.tDist / anker.talTrenchBreite;
                    const iShape = iT * iT * (3 - 2 * iT);
                    withoutTarn -= iShape * anker.talTrenchTiefe;
                }
            }
        }
        // T6a Canyons: ridged Ravine-System (λ~960 m, V-Täler über `1−|noise|`) × sparse Region-Maske (λ~3300 m) carvt
        // Schluchten bis ~150 m; Floor base−65 (Chunk-Boden base−135 → kein Loch).
        const canyonRegion = Math.max(0, Math.min(1, (n.noise2D(wx * 0.0003 + 61.1, wz * 0.0003 - 28.7) - 0.3) / 0.18));
        if (canyonRegion > 0.001) {
            const cR = 1 - Math.abs(n.noise2D(wx * 0.00105 + 8.3, wz * 0.00105 - 14.9));
            const cProfile = Math.max(0, (cR - 0.6) / 0.4); // scharfe V-Schlucht (oberste ~40 % des Grats)
            withoutTarn -= cProfile * cProfile * canyonRegion * 150; // quadratisch = scharfe Sohle
            const cFloor = base - 65;
            if (withoutTarn < cFloor) withoutTarn = cFloor;
        }
        // T7a Tafelberge: slope-gated SMOOTH TERRACE — nur wo der Hang flach ist terrassieren, mit gerundeten Stufen
        // (smootherstep, C1-stetig); hartes `round(h/26)·26` stapelte auf steilen Flanken eine Ziehharmonika.
        const mesaRegion = Math.max(
            0,
            Math.min(1, (n.noise2D(wx * 0.00034 + 13.7, wz * 0.00034 + 47.3) - 0.45) / 0.13)
        );
        if (mesaRegion > 0.001) {
            // Flatness aus dem Gradienten der DOMINANTEN glatten Struktur (cont0 λ7100 + tect λ1136; die gewarpten wx/wz
            // als Basis — der Warp variiert langsam, für ein Steilheits-GATE genügt das).
            const sm = (sx, sz) => {
                const cB = kontinentRoh(n, sx, sz);
                return Math.max(0, cB) * 130 + cB * 15 + n.noise2D(sx * 0.00088, sz * 0.00088) * 45;
            };
            const gd = 7;
            const dhx = sm(wx + gd, wz) - sm(wx - gd, wz);
            const dhz = sm(wx, wz + gd) - sm(wx, wz - gd);
            const slope = Math.sqrt(dhx * dhx + dhz * dhz) / (2 * gd); // m/m
            let flat = 1 - Math.min(1, slope / 0.35); // Hang > ~19° → kein Terrace (glatt)
            flat = flat * flat * (3 - 2 * flat); // smoothstep
            const strength = mesaRegion * flat;
            if (strength > 0.001) {
                const stepH = 26;
                const f = withoutTarn / stepH;
                const fl = Math.floor(f);
                const t = f - fl;
                const shaped = t * t * t * (t * (t * 6 - 15) + 10); // smootherstep → flaches Shelf + gerundete Kante
                const terraced = (fl + shaped) * stepH;
                withoutTarn += (terraced - withoutTarn) * strength;
            }
        }
        // Kein Mountain-Cap: die Berge tragen ihre volle Höhe (Gipfel bis ~+247 m). Nur ein unsichtbarer Sicherheits-
        // Backstop bei 255 (tanh-Asymptote ~267 + Rauheit 12 = 279 < Decke 282.6) gegen Ausreißer über die Voxel-Decke
        // (kein Vorzeichenwechsel → Löcher). Greift VOR dem Sub-Ozean-/Tarn-Block.
        if (withoutTarn > 255) withoutTarn = 255 + 12 * Math.tanh((withoutTarn - 255) / 12);
        // Ozean-Tiefe in Schichten: subMask blendet ab 3..9 m ein (Schelf unberührt); slopeDrop linear ab 4 m Tiefe
        // (−0.6 m/m → Kontinentalhang); drei tiefen-skalierte Variations-Oktaven (subA Hügel, subRidge Kämme und
        // Gräben, subC Sediment). Bei subMask=1 + maxNoise bleibt die Fläche unter dem Wasser (keine Phantom-Inseln).
        const waterRefSub = Number.isFinite(L.waterLevel) ? L.waterLevel : base + 4;
        const depthBelow = waterRefSub - withoutTarn;
        let withoutTarnFinal = withoutTarn;
        if (depthBelow > 1.5) {
            const subMask = Math.min(1, Math.max(0, (depthBelow - 3) / 6));
            const slope = Math.max(0, depthBelow - 4);
            const slopeDrop = -slope * 0.6;
            const subA = n.noise2D(x * 0.019, z * 0.019 + 31) * (3 + slope * 0.3);
            const rBN = n.noise2D(x * 0.026 + 17, z * 0.026 + 9);
            const subRidge = ((1 - Math.abs(rBN)) * (1 - Math.abs(rBN)) - 0.3) * (3 + slope * 0.25);
            const subC = n.noise2D(x * 0.062 - 17, z * 0.062 + 8) * 1.0;
            withoutTarnFinal += slopeDrop + (subA + subRidge + subC) * subMask;
        }
        // Sanfter Tiefsee-Clamp (Asymptote base−120): der Sub-Ozean-Block reicht fern bis ~−144 m und bräche den Chunk-
        // Boden (−135); unsichtbar (Nebel/Tiefe), darum kein Deckel.
        const abyssClamp = base - 112;
        if (withoutTarnFinal < abyssClamp)
            withoutTarnFinal = abyssClamp - 8 * Math.tanh((abyssClamp - withoutTarnFinal) / 8);
        // Die Bergsee-Mulden (0, solange keine Tarns): Bowl-Boden auf waterLevel+1 geklemmt — sonst erreicht der Rand-
        // Ozean-Flood den Tarn über Unterwasser-Zellen (Ozean statt See). Das Priority-Flood füllt bis zum Rand.
        const td = tarnDelta(L, x, z);
        if (td === 0) return withoutTarnFinal;
        const waterRef = Number.isFinite(L.waterLevel) ? L.waterLevel : base + 4;
        return Math.max(withoutTarnFinal + td, waterRef + 1);
    }

    // DIE EINE 2D-HÖHE der Welt = der Term-Auswerter ihres Erbguts: der erste Term setzt den Startwert (die Wildnis oder
    // eine Insel), jeder weitere legt sich nach seiner Art darauf — die Rampe addiert, die Bucht schneidet (Minimum).
    // Eine Welt ohne Erbgut trägt [wildnis]. Fehlt der Lage ihr Erbgut, wirft der Auswerter (fail-closed, nie still
    // Wildnis). Leser: jeder Leser der Höhe (Dichte, Hydrosphäre, Fern-Ring, Spawn-Ort, Erosion) in Stamm und Worker.
    function hoehe(L, x, z, mitDetail = true) {
        const T = L.erbgut.terme;
        const t0 = T[0];
        let h = t0.art === "wildnis" ? wildnisY(L, x, z, mitDetail) : termY(t0, 0, x, z, L);
        for (let i = 1; i < T.length; i++) h = termY(T[i], h, x, z, L);
        return h;
    }

    root.__gelaendeCore = Object.freeze({
        VERSION: VERSION,
        STUDIO_VERTRAG: 1, // G4.3 — EINE Versions-Semantik
        FUNKTION: 1, // studio-vertrag §9 — ein Gesetz-Kern: reine Funktionen, keine Rezepte, keine Gestalt
        MACRO_ANKER: MACRO_ANKER,
        hoehe: hoehe,
        erbgutNormal: erbgutNormal,
        wildnisY: wildnisY,
        termY: termY,
        kontinentBasis: kontinentBasis,
        rauheit: rauheit,
        ankerAusSaat: ankerAusSaat,
        ankerBeitrag: ankerBeitrag,
        massivMaske: massivMaske,
        grat: grat,
        gratRauschen: gratRauschen,
        kachelSchluessel: kachelSchluessel,
        erosionFuer: erosionFuer,
        erosionDelta: erosionDelta,
        tarnMulde: tarnMulde,
        tarnDelta: tarnDelta,
    });
})(typeof self !== "undefined" ? self : globalThis);
