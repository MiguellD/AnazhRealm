// AnazhRealm — foundry-core.js: DER STUDIO-GENERATOR-KERN (DAS NEUE KLEID, P2 Kern-Split).
// Klassisches Script (KEINE IIFE) — die Top-Level-Symbole bleiben global, geladen VOR
// worlds/terrain/phytogenesis.js (Shell) + im Foundry-Worker (importScripts) VOR phytogenesis.
// Verschoben (nicht kopiert) aus phytogenesis.js via scripts/move-to-foundry-core.cjs; die
// Wuchs-/Asset-Mathematik lebt hier, phytogenesis.js ist die Display-/Welt-/UI-Shell + der
// GL-Bäcker. THREE/BufferGeometryUtils/__phytoCore sind zur Laufzeit global (Ladereihenfolge).

function mulberry32(a) {
    return function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function nearestFib(x) {
    let best = FIB[0],
        bd = 1e9;
    for (const f of FIB) {
        const d = Math.abs(f - x);
        if (d < bd) {
            bd = d;
            best = f;
        }
    }
    return best;
}

function vrot(vec, axis, ang) {
    const k = vnorm(axis),
        c = Math.cos(ang),
        s = Math.sin(ang),
        d = vdot(k, vec);
    const cr = vcross(k, vec);
    return [
        vec[0] * c + cr[0] * s + k[0] * d * (1 - c),
        vec[1] * c + cr[1] * s + k[1] * d * (1 - c),
        vec[2] * c + cr[2] * s + k[2] * d * (1 - c),
    ];
}

function perp(d) {
    const a = Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    return vnorm(vcross(d, a));
}

function fbm3(p, oct, lac, gain, off) {
    let f = 1,
        a = 0.5,
        sum = 0,
        nrm = 0;
    for (let i = 0; i < oct; i++) {
        sum += a * simplex3(p[0] * f + off, p[1] * f + off * 1.7, p[2] * f + off * 2.3);
        nrm += a;
        a *= gain;
        f *= lac;
    }
    return sum / nrm;
}

const WIND = {
    uTime: { value: 0 },
    uWindStrength: { value: 0.0 },
    uWindDir: { value: new THREE.Vector3(1, 0, 0.35).normalize() },
    uGust: { value: 1.0 },
};

const SEASON = {
    uLeafPresence: { value: 1.0 },
    uBloom: { value: 1.0 },
    uSeasonMul: { value: new THREE.Color(1, 1, 1) },
};

// DIE BODEN-PALETTE des Terrain-Studios — die EINE Boden-Farbe von Labor UND Welt. Jeder Wert ist eine
// sRGB-ABSICHT (FARB-GESETZ): der Leser dekodiert linear (die Welt in `AnazhRealm.BODEN_FARBE`, das Labor
// ueber THREE.Color). Lineare Albedo Y in Klammern, gegen die gemessene Natur:
//   lit      Waldboden = Laubstreu/Humus unter dem Kronendach (0,11; Laubstreu 0,08-0,15) — bis 05.10. ein
//            dunkles Moos-Gruen 0x2c3621 (0,033): der Studio-Waldkern lag schwarz, die Welt trug ihn nie
//   mead     Wiesen-Grund (0,11) · dirt Pfad-Erde (0,07) · rock Fels, warm-grau (0,13) · wet nasser Grund (0,045)
//   sand     Strand (0,48)
// Die Welt-Klassen, die das Labor nicht kennt (das Labor ignoriert sie, must-ignore):
//   schnee   Neuschnee auf der Prominenz (0,86) · basalt Glut-Gestein, die Glut traegt das Emissiv (0,04)
//   magie    der Magie-AKZENT (Flecken in Magie-Regionen, nie Grundfarbe) (0,15)
//   sediment der Seegrund unter Wasser, Schlick (0,15) · flechte die Flechten-Patina auf feuchtem Stein (0,19)
const PORTAL_GROUND = {
    lit: 0x735a3c,
    mead: 0x55632f,
    dirt: 0x5c4a33,
    rock: 0x6b6258,
    wet: 0x33402a,
    sand: 0xc9b791,
    schnee: 0xebedff,
    basalt: 0x523026,
    magie: 0x7a58b8,
    sediment: 0x7a6a52,
    flechte: 0x6b8057,
};

const PORTAL_SKY = {
    top: 0x6a9ed0, // Mittags-Himmel-Top (weiches Dunst-Blau)
    sun: 0xfff2d9, // Mittags-Sonnenfarbe (warm, = uSunCol (1,0.95,0.85))
};

// W9 — DAS HIMMEL-GESETZ: das Wolken-Feld des Terrain-Studios als ZAHLEN.
// EINE Quelle, zwei Leser: das Studio-GLSL (phytogenesis) injiziert sie in
// seinen Shader-Text, der Welt-Dome (createGalaxySkybox, TSL) liest sie beim
// Bau. Deck-Technik ist Leser-Sache (GLSL vs TSL), die VERTEILUNG ist Gesetz.
// var (nicht const): reist als globalThis.HIMMEL_GESETZ zum Stamm-Leser.
// prettier-ignore
var HIMMEL_GESETZ = {
    projY: 0.16,               // Himmelsebenen-Projektion sp = dir.xz/(dir.y+projY)
    s1: 1.6, s2: 3.7,          // die zwei Feld-Abtastungen (grob/fein)
    drift: [0.02, 0.014],      // Drift dr = uTime*(x,y); Feld 2 läuft -drift*drift2
    drift2: 1.6,
    dens: [0.54, 0.42, 0.8, 0.3], // smoothstep(a-cov*b, c-cov*d, n*mixN0+n2*mixN1)
    mixN: [0.7, 0.3],
    hor: [0.015, 0.2],         // Wolken klingen zum Horizont aus
    litGrau: [0.62, 0.65, 0.71],  // grau → sonnenbeschienen: mix(grau, sun*k0+k1, sa*litSa)
    litSonne: [1.15, 0.15], litSa: 0.65,
    bedeckt: [0.34, 0.36, 0.42], bedecktK: 0.55, // bedeckt → dunkler/grauer
    edge: [0.5, 0.4, 0.6],     // weiche Ränder: smoothstep(0,e0,n2)*e1+e2
    deck: 0.92,                // finaler Misch-Anteil
    fbm: { okt: 5, lac: 2.03, off: 1.7 }, // Value-Noise-fbm der Vorlage
    grad: { up: 0.55, dn: 0.5, hazeY: 2.2 }, // Vertikal-Gradient (pow-Kurven + Haze-Fenster)
};

// W10 — DAS WASSER-OBERFLÄCHEN-GESETZ: der Teich/Bach/Meer-Look des Terrain-
// Studios als ZAHLEN. EINE Quelle, zwei Leser: das Studio-GLSL (mkWaterMat +
// Unterwasser-Nebel) injiziert ALLE Zeilen, das Welt-Hydro-Material (TSL)
// liest die adoptierte Teilmenge (Beer-Lambert-Farben · Schlick-Fresnel ·
// Himmel-Spiegelung · Licht-Schattierung · Sonnen-Spec · Schaum-Farbe); die
// auditierten Welt-Systeme (Tiefenpuffer-Ufer · Schaum-Verschmelzen · Alpha-
// Kante, V18.14–.374) bleiben Welt-Sache. Die Spiegel-TEXTUR bleibt Studio-
// Sache (Perf-Entscheid: die Welt spiegelt den Himmel über Fresnel, keine
// Planar-RT — ultraguss-plan U8).
// prettier-ignore
var WASSER_GESETZ = {
    wK: [6.5, 2.0, 1.2],       // Beer-Lambert-Absorption
    flach: 0.13, tief: 0.85,   // shallowC=exp(-wK*flach), deepC=exp(-wK*tief)
    wellen: { k0: 0.17, a0: 1.5, om0: 0.55, L: 2.2, g: 0.6, disp: 1.4832, ky: 1.13, omy: 0.9, okt: 4, adv: 1.2 },
    amp: [0.16, 0.4], wind: [0.7, 0.9], // Normal-Amplitude: mix(a0,a1,depth)*(w0+w1*wind)
    fresnel: [0.02, 0.98, 5.0],         // Schlick: f0 + f1*(1-ndv)^f2
    spiegel: { dim: 0.68, verzerr: 0.13 }, // Himmel-Fallback mix(sky, sky*dim, upY); UV-Verzerrung
    licht: [0.86, 0.18, 0.08],          // outc *= (l0 + l1*diff + l2*whgt)
    spec: [120.0, 1.35],                // Sonnen-Glitzer pow(...,s0)*s1
    alpha: [0.55, 0.95, 0.32, 0.06],    // mix(a0,a1,depth)+fres*a2; Auslauf smoothstep(0,a3,depth)
    schaum: { ufer: 0.26, kammA: 1.8, kammB: 2.7, sinF: 4.0, sinT: 2.8, kamm: 0.6, max: 0.85, farbe: [0.93, 0.96, 0.98], deck: 0.95 },
    koerperStreu: 0.1,                  // Rueckstreuung b_b (1/m) des Wasser-Koerpers (Binnensee 0,01-0,2): R = 0,33*b_b/(wK+b_b) (Welt-Leser; das Studio-GLSL liest sie nicht)
};

// ZWILLINGS-ABSCHIED (18.07., rein additiv) — DER TERRAIN-GESETZ-NAMENSRAUM:
// die Welt-Look-Gesetze des Terrain-Studios als EIN Namensraum-Block, damit
// der EINE Gesetz-Strom (AnazhRealm.Gesetz("terrain:…") via GESETZ_KERNE)
// sie erreicht und die Kern-Pflicht-Wand den Ausfall meldet. var (nicht
// const): reist als globalThis.__terrainCore zum Stamm-Leser — dieselbe
// Klasse wie HIMMEL_GESETZ/WASSER_GESETZ selbst.
// V18.491.235 Lab Terrain MC-Berg; Host none (BERG_VIS).
// CAVE stays Lab-derived from MTN/BERG; COAST_D/SEA_LEVEL stay Lab-local this pulse.
// var (nicht const): reist als globalThis.BERG_GESETZ zum Studio-Leser — wie HIMMEL/WASSER.
// prettier-ignore
var BERG_GESETZ = { x: -42, z: -30, R: 20, H: 22, Rtun: 3.2 };
var BERG_VIS = { lab: "mc-volume", host: "none" };

// V18.491.236 Lab Terrain island radius + sea plane; Host none (INSEL_VIS).
// Do NOT Fake-align with WASSER_GESETZ look numbers.
// var (nicht const): reist als globalThis.INSEL_GESETZ zum Studio-Leser — wie HIMMEL/BERG.
// prettier-ignore
var INSEL_GESETZ = { coastD: 74.0, seaLevel: -3.0 };
var INSEL_VIS = { lab: "coast-74", host: "none" };

// V18.491.237 Lab Terrain Wald Astung/LOD/Lichtung; Host none (WALD_VIS).
// FIB dead-array stays Lab-local (unused — do NOT hoist). BERG/INSEL/HIMMEL/WASSER untouched.
// var (nicht const): reist als globalThis.WALD_GESETZ zum Studio-Leser — wie HIMMEL/BERG/INSEL.
// prettier-ignore
var WALD_GESETZ = {
    flod: 0,
    trunkMul: 0.5,
    glade: 22,
    crownBase: { eiche: 0.42, fichte: 0.3, birke: 0.42, weide: 0.4, tanne: 0.3, mammut: 0.46 }
};
var WALD_VIS = { lab: "astung-glade", host: "none" };

// V18.491.239 Lab Terrain 12m tile/cell; Host none (KACHEL_VIS).
// var (nicht const): reist als globalThis.KACHEL_GESETZ zum Studio-Leser — wie HIMMEL/BERG/INSEL/WALD.
// prettier-ignore
var KACHEL_GESETZ = { size: 12 };
var KACHEL_VIS = { lab: "tile-12", host: "none" };

// V18.527 — DAS SAISON-GESETZ: die Jahres-Stuetzstellen des Terrain-Studios als ZAHLEN (vorher Literale in
// phytogenesis.js seasonColors / _seasonBuiltTint / Impostor-GLSL). EINE Quelle, zwei Leser: der Studio-Wald
// (seasonColors -> Laub-Toenung, Praesenz, Bluete; uSeasonMul im Laub- und Karten-Shader) und die Welt (jeder
// Welt-Koerper ist Sommer gebacken, das Jahr traegt uSeasonMul = clamp(ti(t) / bau, mulMin, mulMax) je Kanal,
// die Karte folgt zu kartenGewicht). t: 0 Fruehling / .25 Sommer / .5 Herbst / .75 Winter, linear im Ring.
// var (nicht const): reist als globalThis.SAISON_GESETZ zum Studio-Leser — wie HIMMEL/WASSER.
// prettier-ignore
var SAISON_GESETZ = {
    stuetzen: [
        { ti: 0x6a9a3e, ac: 0x88b450, pr: 0.72, bl: 0.85 },
        { ti: 0x4f7a30, ac: 0x6f9a3a, pr: 1.0, bl: 0.12 },
        { ti: 0xb0702a, ac: 0xd2922f, pr: 0.55, bl: 0.0 },
        { ti: 0x6e6650, ac: 0x847c64, pr: 0.06, bl: 0.0 },
    ],
    bau: 0x4f7a30,       // die Toenung, mit der ein Koerper gebacken ist (Sommer, setSeasonColors("summer"))
    mulMin: 0.25, mulMax: 4.0,
    kartenGewicht: 0.8,  // die Karte folgt der Saison zu 80 % (Impostor-Shader mix(1, uSeasonMul, 0.8))
};

var __terrainCore = { HIMMEL_GESETZ: HIMMEL_GESETZ, WASSER_GESETZ: WASSER_GESETZ, BERG_GESETZ: BERG_GESETZ, BERG_VIS: BERG_VIS, INSEL_GESETZ: INSEL_GESETZ, INSEL_VIS: INSEL_VIS, WALD_GESETZ: WALD_GESETZ, WALD_VIS: WALD_VIS, KACHEL_GESETZ: KACHEL_GESETZ, KACHEL_VIS: KACHEL_VIS, SAISON_GESETZ: SAISON_GESETZ };

// DER STUDIO-VERTRAG (docs/studio-vertrag.md §4 G4.3) — die EINE Versions-
// Semantik des Manifests: erhöht NUR bei einem Bruch der MUSS-Blöcke
// (REZEPTE/BUILD); SOLL/DARF-Blöcke wachsen unter v1 (must-ignore trägt sie).
// Jeder Studio-Kern deklariert sie; `gate:studio-vertrag` validiert.
const STUDIO_VERTRAG = 1;

const PORTAL_RENDER_CONFIG = {
    // Sichtweite (Dunst) — der Wald-Regime-Anker: fog.near = sight*fogNearMul, fog.far = sight, camera.far = sight+camFarPad.
    sight: 120,
    fogNearMul: 0.35,
    camFarPad: 20,
    // Baum-LOD — Wahrnehmungs-Distanzen (Screen-Space-Error, hoehen-gewichtet ueber `ref`): <d0 = L0 volle
    // Geometrie, d0..d1 = L1 mittel, >d1 = L2 Billboard. `fade`/`fade0` = die Dither-Crossfade-Baender; `hyst`
    // = die Membership-Hysterese (M); `ref` = die Referenz-Sichthoehe (uLodRef).
    // kindStages (08.07.) — DIE STUFEN-WAHRHEIT JE ART ALS DATEN (die eine Quelle fuer den
    // Studio-Wald UND jeden Empfaenger): welche buildInstance-Stufen eine Art TRAEGT und
    // NUTZT. Baeume die volle Kaskade (0/1 + Billboard-Atlas jenseits d1); Gras + Strauch
    // ZWEISTUFIG (nah = reiche Stufe, fern = die breiten-/formkompensierte billige — die
    // Rezepte tragen die Kompensation: Gras K=5/3 Halme mit wMul 1.7/4.6); Fels EINSTUFIG
    // (Kleinst-Deko — eine Distanz-Stufe waere Deko ohne Wert), die Blume seit 04.10. [0, 2]
    // (die Nah-Streu traegt sie zu Hunderten). Der Wald waehlt nah = stages[0], fern = stages[letzte]; Empfaenger clampen
    // ihre Distanz-Wahl auf die naechste verfuegbare Stufe.
    // Die Distanzen sind die der Welt (S7, 05.10.): der Host-Umweg LOD_TRI_BUDGET_MUL (Studio 20/40 → Welt 12/26) ist
    // gefallen, das Studio traegt die gemessenen Werte selbst (Lehre 19). In EINER Welt (Radeon 890M, Mess-Wiese,
    // ABAB 4x8 s) kostete 20/40 gegen 12/26 mit der neuen Nahkrone Frame p50 41,9 statt 33,5 ms, GPU p50 8,05 statt
    // 7,72 ms, und das Band wurde ROT: Busch 163k → 763k Dreiecke (die Strauch-L1 bis 40 m), Haus-L1 +20 Befehle,
    // Fichten-L0 bis 73 m (Wand 64 m). Labor und Welt lesen dieselben Zahlen.
    lod: {
        d0: 12,
        d1: 26,
        fade: 8,
        fade0: 4,
        ref: 12.0,
        hyst: 3.4,
        // Der Waldboden (04.10.): Farn · Schilf · Gestrüpp · Totholz sind ZWEISTUFIG — L0 die Armlänge (die Nah-Streu
        // dient sie im Armlängen-Kreis), L1 der Rest des Nah-Rings; eine Karte tragen sie nicht (jenseits trägt die
        // Boden-Farbe). Die Blume wird zweistufig [0, 2]: ihre L2 (Blütenkopf als Kugel, ~270 Dreiecke) war seit
        // jeher gebaut, nur nie deklariert — die Nah-Streu dient sie jenseits der Armlänge statt der L0 (~2 500).
        kindStages: {
            tree: [0, 1, 2],
            shrub: [1, 2],
            grass: [1, 2],
            flower: [0, 2],
            rock: [0],
            fern: [0, 1],
            reed: [0, 1],
            brush: [0, 1],
            deadwood: [0, 1],
        },
        // DAS BUDGET je Art × Stufe (Studio-Vertrag B2c, 04.10.): was eine GELIEFERTE Stufe kosten darf, als
        // DATEN neben ihrer Stufen-Wahrheit — fuer JEDE deklarierte Stufe JEDER Art eine Zeile:
        //   tris     = Obergrenze der Dreiecke je Instanz (gebaut ueber die echte Bruecke, ueber alle Samen);
        //   draws    = Obergrenze der Sippen je Instanz (Host-Verschmelz-Regel: Stoff × Attribut-Form × Index) =
        //              Draws je Instanz-Gruppe und Pass;
        //   schatten = die Stufe, deren Gestalt den Schatten wirft (L0-Baum wirft seine L1), oder false;
        //   karte    = die Stufe IST die Studio-Karte (bakeImpostorAtlas aus L1, beim Host das Achsen-Quad mit
        //              2 Dreiecken) — die L2-Geometrie wird dort nicht geliefert (gate:studio-vertrag haelt
        //              karte ⇔ KIND_POLICY.impostor des Hosts).
        // Herleitung aus dem Profi-Band (680k Dreiecke je Frame ueber alle Paesse, docs/analyse/perf-paritaet-
        // baseline-v18432.md; Mess-Wiese V18.526: 5,1 M, davon Pflanzen nah/mittel 3,3 M — Baum-L1 trug 39,5k bei
        // Fichte, 47,1k beim Strauch, mehr als die Fichte): die L1-Zeilen sind OBERGRENZEN, gegen die gebaut ist
        // (tree[1] 10k: Nadel-Karten + jeder 2. Ring + Primaer-Wurzeln + schlanke Trauer-Klinge; shrub[1] 12k:
        // Reisig-Schnitt) — die gebaute Geometrie fiel auf sie, nicht sie auf die Geometrie. tree[0] (W5/S7, das
        // Nahbild bis d0): aus dem Haushalt Baum L0/L1+Werfer 150k (W5 rechnete 14 L0-Baeume bei 20 m: 10 714 je
        // Baum); das Soll-Bild (Cluster-Karten an ihrem Traeger, Weiden-Straehnen entlang der Peitsche, Stamm und
        // Starkaeste ganz) braucht hoechstens 17,6k (Tanne s2) — die Zeile steht offen bei 18 000, der Haushalt
        // verschiebt sich um das L0-Band (docs/studio-vertrag.md B2c). grass, flower und rock stehen als gemessene Huelle ueber 17 Samen; ihr Band-Schnitt ist offen
        // (docs/PFLICHT-OFFEN.md E). Konsum: gate:asset-contract (die Wand baut jede Stufe — Goldens, Samen 7 und jede
        // Gestalt der Welt — und nennt den Taeter), gate:studio-vertrag B2c (Vollstaendigkeit, Monotonie: tris faellt
        // je Stufe streng, draws steigt nie). Die Kosten-Regler der Kronen wohnen in ihrer Zeile: blattKarte (Kante der
        // Laub-Karte in Blatt-Groessen), nadelKarte (Kante der Nadel-Karte in Nadel-Laengen), dichte (L0: Anteil der
        // gewachsenen Blattstellen, die eine Karte tragen, bzw. der Peitschen, die eine Straehne tragen — die L1 traegt
        // ihren Anteil im Phaenotyp), straehne (Trauer L0 und L1: Kartenbreite in Blattlaengen, Stuecke je Peitsche —
        // 05.10.: die schlanke Trauer-Klinge der L1 ist gefallen, sie las als Papier-Streifen), rinde (L0: ast/reisig in
        // trunkR — darunter jeder 2./3. Ring, ohne Traeger faellt der Strang), boden (tree[0], die Trauer-L1 liest
        // dieselbe Zahl: tiefstes Laub in Baumhoehen), deckung (tree[1]: das Band, in dem die gebaute L1-Krone die
        // L0-Krone desselben Baums bedeckt; gate:asset-contract misst es als BILD-Deckung an
        // gebauten L0/L1-Paaren — 24 gerasterte Ansichten, kronen-linse —, die L0 deckt 0,95–1,05 der Klingen von gestern).
        // DIE FERNFORM je Art (`fernform`, B2c 04.10.; nie `fern` — das ist der Name der Farn-Art): was die Art jenseits
        // der Nah-Grenze des Wirts IST (AnazhRealm.ANALOG_NAH_M, 64 m; diesseits traegt ihr Mesh) — "karte" = ihre Karten-Stufe
        // (Baum, Strauch: das gebackene Billboard), "gesetz" = ihr Satz im Welt-March (Blume, Fels: die Passung der
        // Studio-Gestalt als Primitive, 0 Draws; der Fels aus seinen einzelnen Steinen), "boden" = keine Geometrie,
        // die Boden-Funktion trägt die Farbe (Gras: die Studio-Wiese endet nah, jenseits zeichnet der Boden). Kein
        // Builder liest sie (keine Mesh-Byte-Wirkung); der Host-Zellen-Chokepoint liest sie VOR jedem Mesh-Zug —
        // eine Fern-Zelle fragt nie ein geklemmtes L0 an (gate:streu-fern).
        budget: {
            tree: {
                0: {
                    tris: 18000,
                    draws: 3,
                    schatten: 1,
                    blattKarte: 3.1,
                    nadelKarte: 1.85,
                    dichte: { laub: 0.42, nadel: 0.12, trauer: 1 },
                    straehne: { teile: 2, breite: 0.72 },
                    rinde: { ast: 0.4, reisig: 0.1 },
                    boden: 0.02,
                },
                1: {
                    tris: 10000,
                    draws: 3,
                    schatten: 1,
                    blattKarte: 1.8,
                    nadelKarte: 3.35,
                    straehne: { teile: 1, breite: 0.45 },
                    deckung: [0.8, 1.15],
                },
                2: { tris: 2, draws: 1, schatten: false, karte: true },
                fernform: "karte",
            },
            // Der Strauch (05.10.): seine L1 traegt Karten aus dem EINEN Atlas (blattKarte = Kante in Blatt-Groessen, an der
            // Bild-Deckung der Klingen von gestern geeicht: kronen-linse 0,95–0,98 ueber die Samen 1/7/12345) und das Reisig
            // bis schnitt·trunkR (der Radius-Schnitt, vorher 0,15), unter rute·trunkR als Vierkant auf jedem 3. Ring (der
            // Name `reisig` meinte in tree[0].rinde eine Ring-Duennung — der Schnitt heisst seit der Integration `schnitt`) — die Karten geben die
            // Dreiecke der Klingen (8 820 → 630) an die Ruten zurueck (Strauch-L1 11 572 → 7 442, Samen 7). Zweiter Schnitt
            // (05.10., Blatt-Mass): das Atlas-Blatt ist halb so lang — die Karte waechst (2,1 → 3,0), nur der Anteil
            // dichte.laub der Blattstellen traegt eine (315 → 142 Karten): Hasel-Blatt 0,036 → 0,051 m, Bild-Deckung 1,10.
            shrub: {
                1: {
                    tris: 12000,
                    draws: 2,
                    schatten: 1,
                    blattKarte: 3.0,
                    dichte: { laub: 0.45 },
                    schnitt: 0.05,
                    rute: 0.15,
                },
                2: { tris: 2, draws: 1, schatten: false, karte: true },
                fernform: "karte",
            },
            grass: {
                1: { tris: 1700, draws: 1, schatten: false },
                2: { tris: 320, draws: 1, schatten: false },
                fernform: "boden",
            },
            flower: {
                0: { tris: 3600, draws: 2, schatten: 0 },
                2: { tris: 380, draws: 2, schatten: false },
                fernform: "gesetz",
            },
            rock: { 0: { tris: 1300, draws: 1, schatten: 0 }, fernform: "gesetz" },
            // DER WALDBODEN (04.10.) — gegen den Haushalt gebaut (Nah-Streu 9 Befehle / 40k Dreiecke an der Mess-Wiese,
            // wellen-plan W0): L0 dient die Nah-Streu der Welt nur im Armlängen-Kreis (wenige Instanzen, das Nahbild),
            // die leichte Stufe im Rest des Rings; sie aggregiert (Wedel als EIN gezacktes Band, Schilf-Rispe als EIN
            // Band, Gestrüpp-Büschel als Raute, n·s²) und trägt EINEN Stoff (ein Befehl je Gestalt), die Nah-Streu wirft
            // nicht (schatten false). Die Zeilen sind die gemessene Hülle über 17 Samen (echte Brücke).
            // Jenseits des Nah-Rings trägt der Boden ihre Farbe: fernform "boden" (keine Geometrie, keine Karte).
            fern: {
                0: { tris: 3800, draws: 1, schatten: false },
                1: { tris: 150, draws: 1, schatten: false },
                fernform: "boden",
            },
            reed: {
                0: { tris: 2200, draws: 1, schatten: false },
                1: { tris: 300, draws: 1, schatten: false },
                fernform: "boden",
            },
            brush: {
                0: { tris: 3700, draws: 2, schatten: false },
                1: { tris: 300, draws: 1, schatten: false },
                fernform: "boden",
            },
            deadwood: {
                0: { tris: 5400, draws: 1, schatten: false },
                1: { tris: 640, draws: 1, schatten: false },
                fernform: "boden",
            },
            // DIE GESTALTEN je Art (04.10.): wie viele verschiedene Individuen (Samen) eine Art in der Welt traegt —
            // die Zahlen, mit denen der Studio-Wald pflanzt (buildForest liest sie, Welt-Varianten-Wahl ebenso);
            // jede Gestalt ist ein Satz Koerper L0/L1 + EINE Karte. '*' = jede Art ohne eigene Zeile. Eine
            // Aenderung hier ist ein Wald-Re-Roll (der Studio-Wald zieht je Gestalt einen RNG()-Wurf). gras 2 = die zwei
            // Halm-Vorlagen des Studio-Walds (grassT) = die zwei Studio-Vorlagen der Nah-Wiese.
            // Der Waldboden (04.10.): die Nah-Streu zeichnet je Gestalt × Stufe × Stoff EINEN Befehl — zwei Gestalten
            // tragen die Massen-Arten (Farn · Schilf · Blume, der Klon fiele im Teppich auf), eine die amorphen und
            // seltenen (Gestrüpp · Totholz · Stumpf · Geröll · Karst); '*' = 16 hätte jede Art 16-fach gezeichnet.
            // buche 2 wie die Laubbäume, die sie ersetzt.
            gestalten: {
                eiche: 2,
                fichte: 2,
                birke: 2,
                tanne: 2,
                weide: 1,
                mammut: 1,
                strauch: 1,
                gras: 2,
                buche: 2,
                karst: 1,
                totholz: 1,
                farn: 2,
                schilf: 2,
                gestruepp: 1,
                totstamm: 1,
                stumpf: 1,
                blume: 2,
                geroell: 1,
                "*": 16,
            },
        },
    },
    // Wald-Dichte (plantForest): variabel-radius Poisson, Zell-Raster `cell` m, Packung `pack` (Zentren
    // >= pack*(Ti+Tj) = Kronen-Schuechternheit), Kandidaten `dartsPerM2` (darts = R^2 * dartsPerM2), die
    // Kronen-Radien je Art. AnazhRealm adoptiert diese in seine FOREST-Oekologie.
    density: {
        cell: 12,
        pack: 1.16,
        dartsPerM2: 1.2,
        crown: { eiche: 5.2, birke: 3.2, weide: 4.5, tanne: 2.95, fichte: 2.75, mammut: 9.2 },
    },
    // Understory — der Raster-Abstand (m) je Schicht ueber den aktiven Radius: Gras dicht, Blumen mittel,
    // Buesche weit. AnazhRealm pflanzt dieselbe Wiese/Blumen/Buesche im selben Radius.
    understory: { grassStep: 0.72, flowerStep: 2.4, bushStep: 4.4 },
    // PLATZIERUNG — DIE DRITTE SCHNITTSTELLE DES NERVENSYSTEMS (Schoepfer: "wenn ich ein neues
    // Asset in der Vorlagedatei erstelle, wird automatisch erkannt wie oft es platziert wird").
    // Die Template->Welt-Uebersetzung lebte VERTEILT (lokale SCALE-Tabelle im phytogenesis-Wald +
    // hartkodierte Spiegel in AnazhRealm) — jetzt lebt sie HIER, EINMAL, editierbar: der Studio-
    // Wald liest sie selbst UND die get-render-config-Bruecke reicht sie AnazhRealm. Ein neuer
    // Preset-Eintrag in PRESETS + eine scale-Zeile hier = beide Welten platzieren ihn (Blueprint +
    // LODs folgen automatisch ueber get-recipes/buildInstance).
    //   scale        = Welt-Skala je Preset (die Templates sind klein gebaut, ~4m-Baum);
    //   treeScaleMul = der Wald-Zusatzfaktor NUR fuer Baeume (der 0.82 des Vorlagen-Walds);
    //   rarity       = Streu-Seltenheit 0..1 je Fels-/Kristall-Art (die Vorlage streut Kristalle
    //                  fast nie -> 0.05; AnazhRealms Formationen folgen diesem Regler).
    placement: {
        treeScaleMul: 0.82,
        scale: {
            gras: 0.24,
            blume: 0.27,
            strauch: 0.332,
            findling: 0.4,
            zacken: 0.34,
            basalt: 0.42,
            sediment: 0.4,
            kristalle: 0.15,
            birke: 4.13,
            eiche: 4.16,
            weide: 2.75,
            tanne: 4.26,
            fichte: 4.85,
            mammut: 4.31,
            buche: 4.0,
            karst: 2.4,
            totholz: 3.4,
            // Der Waldboden wird in Welt-Metern gebaut (Skala 1).
            farn: 1,
            schilf: 1,
            gestruepp: 1,
            totstamm: 1,
            stumpf: 1,
        },
        rarity: { kristalle: 0.05, basalt: 0.3, sediment: 0.35, findling: 0.6, zacken: 0.6 },
        // DAS BODEN-GESETZ (Waldboden 04.10.): wo jede Boden-Art wächst — EINE Zeile je Art, der EINE Auswerter
        // `__phytoCore.bodenGewicht` (Labor-Wald und Nah-Streu der Welt). ring = nah (die Nah-Streu der Welt und
        // der Boden des Labor-Walds) · wald (der Baum-Weg: das Labor pflanzt die Art mit dieser Zeile; die Welt setzt
        // stehendes Totholz nicht — Integration 05.10., die Genese-Zeile blieb gefallen); dichte = Pflanzen je 100 m²
        // bei vollem Gewicht; skala = [min, max]; hang = höchste
        // Neigung |∇h|; die Bänder [a, b, c, d] (Trapez): licht = Kronen-Licht 0..1 (Farn im Schatten, Blume im
        // Saum), feucht = Boden-Feuchte 0..1 (0 = gewöhnlicher Boden, 1 = Ufer/Niederung), ufer = m über dem Wasser
        // (negativ = Flachwasser — der Schilfgürtel steht im Wasser), fels = Steinigkeit 0..1. feuchtLicht = wie weit
        // Feuchte die Licht-Grenze einer Schatten-Art hebt (der Farn steht im feuchten Saum auch heller); weite = wie
        // weit die Nah-Streu der Welt die Art trägt (m, kleine Arten enden früher; ohne Zeile der ganze Nah-Ring).
        // labor: false = das Labor trägt die Art mit seinen eigenen Boden-Schichten (Blumen · Kies).
        boden: {
            farn: {
                ring: "nah",
                dichte: 14,
                skala: [0.75, 1.25],
                hang: 0.95,
                licht: [0.04, 0.16, 0.42, 0.72],
                feuchtLicht: 0.3,
            },
            gestruepp: {
                ring: "nah",
                dichte: 2.5,
                skala: [0.7, 1.3],
                hang: 1.0,
                licht: [0.22, 0.42, 0.82, 1.02],
                feucht: [-1, -0.5, 0.55, 0.88],
            },
            blume: {
                ring: "nah",
                dichte: 6,
                skala: [0.7, 1.3],
                hang: 0.8,
                weite: 18,
                licht: [0.4, 0.7, 1.5, 2],
                labor: false,
            },
            schilf: {
                ring: "nah",
                dichte: 40,
                skala: [0.8, 1.2],
                hang: 0.5,
                ufer: [-0.6, -0.3, 0.3, 0.9],
                licht: [0.25, 0.55, 1.5, 2],
            },
            totstamm: {
                ring: "nah",
                dichte: 0.5,
                skala: [0.7, 1.3],
                hang: 0.55,
                licht: [-1, -0.5, 0.45, 0.8],
            },
            stumpf: {
                ring: "nah",
                dichte: 0.4,
                skala: [0.75, 1.25],
                hang: 0.8,
                licht: [-1, -0.5, 0.6, 0.9],
            },
            totholz: {
                ring: "wald",
                dichte: 0.06,
                skala: [0.85, 1.15],
                hang: 0.7,
                licht: [-1, -0.5, 0.5, 0.85],
            },
            geroell: {
                ring: "nah",
                dichte: 1,
                skala: [0.18, 0.4],
                hang: 1.4,
                weite: 12,
                fels: [0.46, 0.62, 1.5, 2],
                labor: false,
            },
        },
    },
    // DER BÄCKER-SPEC („Drähte statt Kopien" 08.07., Studio-Vertrag B2): das Atlas-Rezept des
    // 8-Winkel-Impostors als DATEN — Blickwinkel + Zell-Maße. Studio-Bäcker (bakeImpostorAtlas)
    // UND AnazhRealms RTT-Bäcker lesen DIESELBEN Zahlen; wer die Fern-Karten-Auflösung ändert,
    // ändert sie HIER, nirgends sonst.
    impostor: { views: 8, cellW: 128, cellH: 256 },
};

function injectWind(mat, foliage, isGrass) {
    mat.onBeforeCompile = function (sh) {
        sh.uniforms.uTime = WIND.uTime;
        sh.uniforms.uWindStrength = WIND.uWindStrength;
        sh.uniforms.uWindDir = WIND.uWindDir;
        sh.uniforms.uGust = WIND.uGust;
        sh.uniforms.uLeafPresence = SEASON.uLeafPresence;
        sh.uniforms.uBloom = SEASON.uBloom;
        sh.uniforms.uSeasonMul = SEASON.uSeasonMul;
        sh.uniforms.uLodMaskOn = _lodU.uLodMaskOn;
        sh.uniforms.uLodRef = _lodU.uLodRef;
        sh.uniforms.uDitherT = _lodU.uDitherT;
        sh.vertexShader = sh.vertexShader.replace(
            "#include <common>",
            "#include <common>\nattribute vec3 aWind;\nattribute vec3 aCenter;\nattribute float aType;\nattribute float aLodLevel;\nattribute float aH0;\nattribute float aH0L;\nuniform float uTime,uWindStrength,uGust,uLeafPresence,uBloom,uLodRef;\nuniform vec3 uWindDir;\nvarying float vLod;\nvarying float vLodD;\nvarying float vLodDL;" +
                (foliage
                    ? "\nvarying float vSeasW;\nvarying vec3 vTintI;" + (isGrass ? "\nattribute vec3 aTintI;" : "")
                    : "")
        ); // FIX v27: vTintI = Per-Instanz-Farbvarianz. FIX v30: aH0L = BLATT-Sichthoehe (bei grossen Baeumen gekappt) -> Laub-LOD folgt der ABSOLUTEN Distanz, Skelett-LOD weiter der Baumgroesse. Ein 30cm-Blatt ist bei 80m unsichtbar klein, egal wie gross sein Baum ist.
        sh.vertexShader = sh.vertexShader.replace(
            "#include <begin_vertex>",
            "#include <begin_vertex>\nfloat wT=aType;\n" +
                (foliage ? "vSeasW=(wT==1.0||wT==3.0)?1.0:0.0;\n" : "") +
                "float pres=(wT==1.0)?uLeafPresence:(wT==3.0?uBloom:1.0);\ntransformed=mix(aCenter,transformed,clamp(pres,0.0,1.0));\nfloat _sw=aWind.x,_ph=aWind.y,_om=aWind.z;\n" +
                "#ifdef USE_INSTANCING\n vec2 _iw=instanceMatrix[3].xz;\n#else\n vec2 _iw=vec2(0.0);\n#endif\n" +
                "vLod=aLodLevel;\n#ifdef USE_INSTANCING\n float _isy=length(instanceMatrix[1].xyz); float _cd=length(cameraPosition.xz-_iw); float _lk=(aH0>0.001)?min(uLodRef/(aH0*_isy),1.0):1.0; vLodD=_cd*_lk; float _lkL=(aH0L>0.001)?min(uLodRef/(aH0L*_isy),1.0):1.0; vLodDL=_cd*_lkL;\n#else\n vLodD=length(cameraPosition.xz-_iw); vLodDL=vLodD;\n#endif\n" +
                (foliage
                    ? isGrass
                        ? "vTintI=aTintI;\n"
                        : "#ifdef USE_INSTANCING\n{float _th=fract(sin(dot(_iw,vec2(127.1,311.7)))*43758.5453);float _th2=fract(sin(dot(_iw,vec2(269.5,183.3)))*43758.5453);float _lu=(_th-0.5)*0.22,_hu=(_th2-0.5)*0.18;vTintI=vec3(_lu+_hu*0.6,_lu,_lu-_hu*0.6);}\n#else\n vTintI=vec3(0.0);\n#endif\n"
                    : "") /* FIX v27: Baum-Tint aus hash(Weltposition) — identisch fuer L0/L1 UND das Billboard (gleicher Hash im Impostor-Shader) -> die Kronenfarbe eines Baums bleibt ueber alle LOD-Stufen konstant; kompaktierungssicher; Studio (non-instanced) exakt neutral */ +
                "vec2 _wd=normalize(uWindDir.xz+vec2(1e-4));\nfloat _travel=dot(_wd,_iw)*0.030 - uTime*1.15;\nfloat _gust=(0.55+0.45*sin(_travel)+0.16*sin(_travel*0.5+1.3))*uGust;\nfloat _theta=clamp(_sw*uWindStrength*_gust*0.9,-1.5,1.5);\nfloat _R=max(transformed.y,0.0);\nfloat _cc=cos(_theta),_ss=sin(_theta);\n#ifdef USE_INSTANCING\n vec3 _ix=normalize(instanceMatrix[0].xyz); vec3 _iz=normalize(instanceMatrix[2].xyz);\n vec2 _wdL=vec2(dot(vec3(_wd.x,0.0,_wd.y),_ix),dot(vec3(_wd.x,0.0,_wd.y),_iz));\n#else\n vec2 _wdL=_wd;\n#endif\ntransformed.x+=_wdL.x*(_R*_ss);\ntransformed.z+=_wdL.y*(_R*_ss);\ntransformed.y-=_R*(1.0-_cc);\n" +
                (foliage
                    ? "float _fl=sin(_travel*3.1+_ph*0.8)+0.6*sin(_travel*5.7+_ph*2.3); transformed+=normal*_fl*0.05*min(uWindStrength*1.7,1.9)*(_sw*0.35+0.55); transformed.x+=_wdL.x*_fl*0.035*(_sw*0.4+0.4); transformed.z+=_wdL.y*_fl*0.035*(_sw*0.4+0.4);\n"
                    : "") +
                (isGrass
                    ? "float _gd=distance(cameraPosition.xz,_iw); transformed=mix(aCenter,transformed,1.0-smoothstep(44.0,58.0,_gd));\n"
                    : "")
        ); // Gras-LOD: schrumpft mit Distanz weich in den Boden (kein Pop)
        sh.fragmentShader = sh.fragmentShader.replace(
            "void main() {",
            "uniform float uLodMaskOn; uniform float uDitherT; varying float vLod; varying float vLodD; varying float vLodDL;\nvoid main() {\n if(uLodMaskOn>0.5 && vLod>0.5){ float _dh=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(0.06711056,0.00583715)))+uDitherT);" +
                " float _f1=clamp((vLodD-" +
                (LOD_D1 - LOD_FADE).toFixed(1) +
                ")/" +
                LOD_FADE.toFixed(1) +
                ",0.0,1.0);" +
                " float _f0=clamp((vLodDL-" +
                (LOD_D0 - LOD_FADE0).toFixed(1) +
                ")/" +
                LOD_FADE0.toFixed(1) +
                ",0.0,1.0);" +
                " float _f1o=clamp(_f1*2.0-1.0,0.0,1.0);" +
                (foliage
                    ? " if(vLod<1.5){ if(clamp(_f0*2.0-1.0,0.0,1.0)>=_dh)discard; } else { if(min(_f0*2.0,1.0)<_dh)discard; if(_f1o>=_dh)discard; } }"
                    : " if(vLod<1.5){ if(_f0>=_dh)discard; } else { if(_f0<_dh)discard; if(_f1o>=_dh)discard; } }")
        );
        /* FIX v37: LAUB = UEBERLAPPENDE RAMPEN statt Partition (Nutzer-Vorschlag = Profi-Muster fuer Stufen mit
         KONSTRUKTIV verschiedener Abdeckung): die neue Stufe ist bei Bandmitte VOLL da (rein: min(2f,1)), die alte
         weicht erst danach (raus: max(2f-1,0)) -> Deckung = Vereinigung >= Maximum, nie durchschaubar; Doppelung
         loest der Tiefentest (opak+AlphaTest). RINDE bleibt PARTITION: L0/L1-Zylinder liegen deckungsgleich bei
         verschiedener Tessellation — Union hiesse Z-Fighting auf jedem Stamm im Band. Fern-Ausblendung (_f1o)
         ueberall verzoegert: das Billboard liegt tiefen-versetzt dahinter, Union ist dort fight-frei. */
        if (foliage) {
            sh.uniforms.uStructDepth = _folDepthU.uStructDepth;
            sh.uniforms.uHalfRes = _folDepthU.uHalfRes;
            sh.uniforms.uFolEnable = _folDepthU.uFolEnable;
            sh.fragmentShader = sh.fragmentShader.replace(
                "void main() {",
                "uniform sampler2D uStructDepth; uniform vec2 uHalfRes; uniform float uFolEnable;\nuniform vec3 uSeasonMul; varying float vSeasW; varying vec3 vTintI;\nvoid main() {\n if(uFolEnable>0.5){ float _sd=texture2D(uStructDepth, gl_FragCoord.xy/uHalfRes).x; if(gl_FragCoord.z > _sd+0.0006) discard; }"
            ); // Laub hinter Struktur wird verdeckt (Halb-Aufloesungs-Pass)
            sh.fragmentShader = sh.fragmentShader.replace(
                "#include <color_fragment>",
                "#include <color_fragment>\ndiffuseColor.rgb*=mix(vec3(1.0),uSeasonMul,vSeasW);\ndiffuseColor.rgb*=clamp(vec3(1.0)+vTintI,0.0,2.0);"
            ); // SAISON OHNE REBUILD + FIX v27: Per-Instanz-Tint (Baum: Positions-Hash; Gras: Licht x Feuchte x Jitter) -> kein Teppich-/Klon-Look mehr
            sh.fragmentShader = sh.fragmentShader.replace(
                "gl_FragColor = vec4( outgoingLight, diffuseColor.a );",
                "gl_FragColor = vec4( outgoingLight, diffuseColor.a );\nfloat _ndv=abs(dot(normalize(vNormal),normalize(vViewPosition)));\ngl_FragColor.rgb+=diffuseColor.rgb*pow(1.0-_ndv,2.5)*0.55;\ngl_FragColor.rgb+=vec3(0.09,0.15,0.04)*pow(1.0-_ndv,4.0)*0.5;"
            );
            // DIE BLATT-UNTERSEITE (phyto-core BLATT_UNTERSEITE, 05.10.): die gesehene Seite nach unten gewandt (die
            // Normale ist nach normal_fragment_begin seiten-gespiegelt) → heller und matter. Laub und Blüte, nie Gras;
            // dieselben Zahlen liest der Laub-Stoff der Welt.
            if (!isGrass) {
                const BU = self.__phytoCore.BLATT_UNTERSEITE;
                sh.fragmentShader = sh.fragmentShader.replace(
                    "#include <normal_fragment_maps>",
                    "#include <normal_fragment_maps>\n{ float _ny=dot(normal,normalize((viewMatrix*vec4(0.0,1.0,0.0,0.0)).xyz)); float _uw=clamp(0.5-_ny*" +
                        BU.steil.toFixed(3) +
                        ",0.0,1.0); float _ul=dot(diffuseColor.rgb,vec3(0.2126,0.7152,0.0722)); diffuseColor.rgb=mix(diffuseColor.rgb,mix(diffuseColor.rgb,vec3(_ul)," +
                        BU.grau.toFixed(3) +
                        ")*" +
                        BU.hell.toFixed(3) +
                        ",_uw); }"
                );
            }
        }
    };
    mat.customProgramCacheKey = function () {
        return "wind_" + (foliage ? (isGrass ? "grass_v8tint" : "fol_v8unterseite") : "bark") + "_v9overlap";
    };
    return mat;
}

function __mkCanvas(w, h) {
    if (typeof document !== "undefined") {
        const c = document.createElement("canvas");
        if (w) c.width = w;
        if (h) c.height = h;
        return c;
    }
    return new OffscreenCanvas(w || 1, h || 1);
}

function makeBarkNormal() {
    const N = 512,
        c = __mkCanvas();
    c.width = c.height = N;
    const x = c.getContext("2d");
    const img = x.createImageData(N, N);
    const h = new Float32Array(N * N);
    let s = mulberry32(99);
    for (let i = 0; i < 300; i++) {
        const cx = s() * N,
            w = 1 + s() * 3.5,
            dep = 0.6 + s() * 0.7; // vertikale Hauptfissuren
        for (let y = 0; y < N; y++) {
            const wob = Math.sin(y * 0.05 + i) * 4 + Math.sin(y * 0.013 + i * 2.1) * 7;
            const px = Math.floor(cx + wob);
            for (let d = -w; d <= w; d++) {
                const xx = (((px + d) % N) + N) % N;
                h[y * N + xx] -= Math.exp(-(d * d) / (w * w)) * dep;
            }
        }
    }
    for (let i = 0; i < 95; i++) {
        const cy = s() * N,
            len = N * (0.2 + s() * 0.5),
            x0 = s() * N,
            w = 0.8 + s() * 2.0,
            dep = 0.5 + s() * 0.6; // horizontale Querrisse -> Platten
        for (let t = 0; t < len; t++) {
            const wob = Math.sin(t * 0.06 + i) * 3;
            const yy = Math.floor(cy + wob),
                xx = ((Math.floor(x0 + t) % N) + N) % N;
            for (let d = -w; d <= w; d++) {
                const y2 = (((yy + d) % N) + N) % N;
                h[y2 * N + xx] -= Math.exp(-(d * d) / (w * w)) * dep;
            }
        }
    }
    for (let i = 0; i < 1500; i++) {
        const px = Math.floor(s() * N),
            py = Math.floor(s() * N),
            r = 2 + s() * 5,
            amp = (s() - 0.5) * 0.55; // Knubbel/Rauheit
        for (let dy = -r; dy <= r; dy++)
            for (let dx = -r; dx <= r; dx++) {
                const xx = (((px + dx) % N) + N) % N,
                    yy = (((py + dy) % N) + N) % N;
                h[yy * N + xx] += Math.exp(-(dx * dx + dy * dy) / (r * r)) * amp;
            }
    }
    for (let i = 0; i < h.length; i++) h[i] += (s() - 0.5) * 0.18;
    const G = 6.5; // staerkerer Gradient -> tiefere Normalen
    for (let y = 0; y < N; y++)
        for (let xx = 0; xx < N; xx++) {
            const dx = (h[y * N + ((xx + 1) % N)] - h[y * N + ((xx - 1 + N) % N)]) * G;
            const dy = (h[((y + 1) % N) * N + xx] - h[((y - 1 + N) % N) * N + xx]) * G;
            const l = Math.sqrt(dx * dx + dy * dy + 1);
            const p = (y * N + xx) * 4;
            img.data[p] = ((dx / l) * 0.5 + 0.5) * 255;
            img.data[p + 1] = ((dy / l) * 0.5 + 0.5) * 255;
            img.data[p + 2] = (1 / l) * 255;
            img.data[p + 3] = 255;
        }
    x.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 7);
    return t;
}

function buildMaterials() {
    if (!barkNormalTex) barkNormalTex = makeBarkNormal();
    barkMat = injectWind(
        new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.93,
            metalness: 0,
            normalMap: barkNormalTex,
            normalScale: new THREE.Vector2(0.85, 0.85),
        }),
        false
    );
    barkMatBirch = injectWind(
        new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.74,
            metalness: 0,
            normalMap: barkNormalTex,
            normalScale: new THREE.Vector2(0.1, 0.1),
        }),
        false
    );
    foliageMat = injectWind(
        new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, metalness: 0, side: THREE.DoubleSide }),
        true
    );
    foliageMatTex = injectWind(
        new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.62,
            metalness: 0,
            side: THREE.DoubleSide,
            alphaTest: 0.5,
        }),
        true
    ); // FIX v31: MULTI-BLATT-KARTEN — ein Quad traegt ~6 GEMALTE Blaetter aus _leafAtlas (map wird nach dem Malen gesetzt). map haelt den WERT um sein Mittel `wert` (bakeLeafAtlasBild; color = 1/wert teilt ihn heraus), die Artfarbe kommt wie ueberall aus vertexColors -> Saison/Tint-Pipeline unveraendert. 28 Dreiecke je Blatt werden 2 je ~6 Blaetter (Faktor ~14 im Mittelfeld).
    grassMat = injectWind(
        new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.7,
            metalness: 0,
            side: THREE.DoubleSide,
            envMapIntensity: 0.18,
        }),
        true,
        true
    ); // GEMESSEN: weniger IBL -> Boden-Schatten am Gras sichtbar (vorher 0.4 = ausgewaschen)
    stemMat = injectWind(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7, metalness: 0 }), false);
}

function weldNormals(geo, eps) {
    // EINE HAUT: mittelt Normalen ueber raeumlich zusammenfallende Vertices verschiedener Teilstuecke -> keine harte Kante Wurzel/Ast<->Stamm
    const pos = geo.attributes.position,
        n = pos.count;
    geo.computeVertexNormals();
    const nrm = geo.attributes.normal;
    const map = new Map(),
        q = (v) => Math.round(v / eps);
    for (let i = 0; i < n; i++) {
        const k = q(pos.getX(i)) + "|" + q(pos.getY(i)) + "|" + q(pos.getZ(i));
        let e = map.get(k);
        if (!e) {
            e = { x: 0, y: 0, z: 0, idx: [] };
            map.set(k, e);
        }
        e.x += nrm.getX(i);
        e.y += nrm.getY(i);
        e.z += nrm.getZ(i);
        e.idx.push(i);
    }
    for (const e of map.values()) {
        if (e.idx.length < 2) continue;
        const l = Math.hypot(e.x, e.y, e.z) || 1,
            x = e.x / l,
            y = e.y / l,
            z = e.z / l;
        for (const i of e.idx) nrm.setXYZ(i, x, y, z);
    }
    nrm.needsUpdate = true;
}

function addMerged(geos, mat, weld) {
    if (!geos || !geos.length) return;
    let merged = null;
    try {
        merged = THREE.BufferGeometryUtils.mergeBufferGeometries(geos, false);
    } catch (e) {
        merged = null;
    }
    if (!merged) return;
    if (weld) weldNormals(merged, 0.04);
    const m = new THREE.Mesh(merged, mat);
    m.castShadow = true;
    m.receiveShadow = true;
    subject.add(m);
}

function pushSegment(arr, p0, p1, r0, r1, radial, sway0, sway1, phase, omega, col0, col1, type, barkTex) {
    const dir = vsub(p1, p0);
    const len = Math.hypot(dir[0], dir[1], dir[2]);
    if (len < 1e-5) return;
    const d = [dir[0] / len, dir[1] / len, dir[2] / len];
    const g = new THREE.CylinderGeometry(r1, r0, len, radial, 1, true);
    g.translate(0, len / 2, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(d[0], d[1], d[2])
    );
    g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(q));
    g.translate(p0[0], p0[1], p0[2]);
    const pos = g.attributes.position,
        n = pos.count;
    const aw = new Float32Array(n * 3),
        ac = new Float32Array(n * 3),
        at = new Float32Array(n),
        cl = new Float32Array(n * 3);
    const mid = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2];
    const bu = barkTex ? perp(d) : null,
        bv = barkTex ? vnorm(vcross(d, bu)) : null,
        ns = barkTex ? Math.max(6, Math.round((r0 + r1) * 0.5 * 42)) : 0;
    for (let i = 0; i < n; i++) {
        const vx = pos.getX(i),
            vy = pos.getY(i),
            vz = pos.getZ(i);
        const f = clamp(((vx - p0[0]) * d[0] + (vy - p0[1]) * d[1] + (vz - p0[2]) * d[2]) / len, 0, 1);
        const sv = sway0 + (sway1 - sway0) * f;
        aw[i * 3] = sv;
        aw[i * 3 + 1] = sv * 1.5 + vx * 0.6 + vz * 0.6;
        aw[i * 3 + 2] = clamp(2.6 - sv * 1.6, 0.5, 2.6);
        ac[i * 3] = mid[0];
        ac[i * 3 + 1] = mid[1];
        ac[i * 3 + 2] = mid[2];
        at[i] = type;
        let cr = lerp(col0.r, col1.r, f),
            cg = lerp(col0.g, col1.g, f),
            cb = lerp(col0.b, col1.b, f);
        if (barkTex) {
            const ox = vx - p0[0],
                oy = vy - p0[1],
                oz = vz - p0[2];
            const au = ox * bu[0] + oy * bu[1] + oz * bu[2],
                av = ox * bv[0] + oy * bv[1] + oz * bv[2];
            const ang = Math.atan2(av, au);
            const fr = 0.5 + 0.5 * Math.sin(ang * ns + Math.sin(f * 8.0 + ang) * 1.1);
            const nz = Math.abs(Math.sin((vx * 12.9 + vy * 7.8 + vz * 3.3) * 43.7));
            const mB = (0.6 + 0.4 * fr) * (0.84 + 0.16 * nz);
            cr *= mB;
            cg *= mB;
            cb *= mB;
        }
        cl[i * 3] = cr;
        cl[i * 3 + 1] = cg;
        cl[i * 3 + 2] = cb;
    }
    g.setAttribute("aWind", new THREE.BufferAttribute(aw, 3));
    g.setAttribute("aCenter", new THREE.BufferAttribute(ac, 3));
    g.setAttribute("aType", new THREE.BufferAttribute(at, 1));
    g.setAttribute("color", new THREE.BufferAttribute(cl, 3));
    arr.push(g);
}

// `bluete` (05.10.): { grund: [r, g, b] linear, grundBis, biegen } — das Blütenblatt (phyto-core BLUETEN_BLATT); ohne byte-gleich.
function pushLeaf(arr, center, dirOut, up, scale, lp, color, type, sway, phase, omega, cup, bluete) {
    // DER GETEILTE SAMEN: die 30-Vert-Superformel-Blatt-KLINGE (Kontur + Quer-Mulde) lebt in
    // phyto-core.js (buildLeafBlades) — dieselbe EINE Quelle, die AnazhRealm liest. Die Geometrie-
    // REZEPTUR ist geteilt (identische superR-Kontur, cup, 14 Segmente, Basis). Divergenzen: das
    // Wind-Attribut-Schema (AnazhRealm aFlex/aPhase — Vorlage aWind/aCenter/aType, HIER angehängt)
    // und eine sub-mikron Float-Noise (≤1 ULP, ~1e-6 m; buildLeafBlades' Additions-Reihenfolge +
    // Math.hypot = AnazhRealms eingefrorene Arithmetik) → pixel-identisch, kein Look-Change. Alle
    // gewachsenen dir sind unit → das dir-Normalisieren ist ein No-op.
    const __core = typeof self !== "undefined" && self.__phytoCore;
    if (__core && typeof __core.buildLeafBlades === "function") {
        const _r = __core.buildLeafBlades(
            [{ pos: center, dir: dirOut, up: up, scale: scale, needle: false, sway: sway, phase: phase }],
            bluete
                ? {
                      leafColor: [color.r, color.g, color.b],
                      scale: 1,
                      cup: cup,
                      leafShape: lp,
                      grund: bluete.grund,
                      grundBis: bluete.grundBis,
                      biegen: bluete.biegen,
                  }
                : { leafColor: [color.r, color.g, color.b], scale: 1, cup: cup, leafShape: lp }
        );
        if (_r && _r.count) {
            const g = new THREE.BufferGeometry();
            const nV = _r.positions.length / 3;
            g.setAttribute("position", new THREE.Float32BufferAttribute(_r.positions, 3));
            g.setAttribute("normal", new THREE.Float32BufferAttribute(_r.normals, 3));
            g.setAttribute("uv", new THREE.Float32BufferAttribute(_r.uvs, 2));
            g.setAttribute("color", new THREE.Float32BufferAttribute(_r.colors, 3));
            const aw = new Float32Array(nV * 3),
                ac = new Float32Array(nV * 3),
                at = new Float32Array(nV);
            const _lph = sway * 1.5 + center[0] * 0.6 + center[2] * 0.6,
                _lom = clamp(2.6 - sway * 1.6, 0.5, 2.6);
            for (let i = 0; i < nV; i++) {
                aw[i * 3] = sway;
                aw[i * 3 + 1] = _lph;
                aw[i * 3 + 2] = _lom;
                ac[i * 3] = center[0];
                ac[i * 3 + 1] = center[1];
                ac[i * 3 + 2] = center[2];
                at[i] = type;
            }
            g.setAttribute("aWind", new THREE.BufferAttribute(aw, 3));
            g.setAttribute("aCenter", new THREE.BufferAttribute(ac, 3));
            g.setAttribute("aType", new THREE.BufferAttribute(at, 1));
            g.setIndex(Array.from(_r.indices));
            arr.push(g);
            return;
        }
    }
    // Ohne Samen kein stiller Inline-Zwilling (die alte 14-Segment-Kopie kannte keine schlanke Klinge): lauter Bruch.
    throw new Error("[phyto] pushLeaf: __phytoCore.buildLeafBlades fehlt (der Samen ist Pflicht)");
}

function pushNeedle(arr, base, dir, len, color, sway, phase, omega) {
    const r = len * 0.05;
    pushSegment(
        arr,
        base,
        vadd(base, vscl(vnorm(dir), len)),
        r,
        r * 0.12,
        4,
        sway,
        sway,
        phase,
        omega,
        color,
        color,
        2
    );
}

// DIE STRAEHNE (S7, Trauer-L0): eine Peitsche mit ihren Blaettern als Karten-Kette aus dem EINEN Blatt-Atlas.
// `pts` = die gewachsene Peitschen-Bahn (Ansatz zuerst; ihre Biegung ist das Gravitations-Gesetz des Wuchses: je Segment
// zur Lotrechten), `lang` = die Blattlaenge — die letzte Blattreihe haengt sie lotrecht unter die Spitze —, `halb` = die
// halbe Kartenbreite. Die Bahn endet unter `bodenY` am Durchstosspunkt (nie unter dem Boden) und wird nach Bogenlaenge
// in `teile` Stuecke geteilt; je Stueck zwei gekreuzte Karten (quer tangential um den Stamm und radial), entlang des
// Stuecks gestreckt, je Ende um ein Zehntel ueberlappend: die Kette beginnt am Peitschen-Ansatz (dem Traeger-Lauf). Die
// Zelle `zelle` (Kern `kern`) ist eine Breitblatt-Zelle (05.10.): der Blatt-Zweig HAENGT — sein Ansatz (der untere
// Leinwand-Rand des Kerns) liegt am oberen Ende des Stuecks, seine Spitze unten; laengs gestreckt lesen seine Blaetter
// als die schmalen haengenden Weidenblaetter an ihren Zweiglein. (Vorher die untere Haelfte der Nadel-Zelle — seit die
// Nadel-Zelle benadelte Zweiglein traegt, hingen dort Farn-Wedel; danach die Grossblatt-Zelle — runde Hasel-Blaetter an
// der Weide.) `zelle` ist die Weiden-Zelle (BLATT_ATLAS_WEIDE, Integration 05.10.: lanzettliche Blaetter an der
// haengenden Rute), Kern wie die Baum-Zweige.
// Farbe/Wind aus dem Blatt des Stuecks; aType 1 (Laub: die Saison-Praesenz zieht jede Karte auf ihre Mitte — im Winter
// traegt die Trauer-L0 wie ihre L1 keine Peitsche).
function pushStraehne(arr, pts, lang, halb, blaetter, farben, bodenY, teile, zelle, kern) {
    const n = pts.length;
    if (n < 2) return;
    const ende = pts[n - 1];
    const voll = pts.concat([[ende[0], ende[1] - lang, ende[2]]]);
    const bahn = [];
    for (let i = 0; i < voll.length; i++) {
        const p = voll[i];
        if (p[1] >= bodenY) {
            bahn.push(p);
            continue;
        }
        if (i > 0) {
            const q = voll[i - 1],
                t = (q[1] - bodenY) / Math.max(1e-9, q[1] - p[1]);
            bahn.push([q[0] + (p[0] - q[0]) * t, bodenY, q[2] + (p[2] - q[2]) * t]);
        }
        break;
    }
    if (bahn.length < 2) return;
    const sA = [0];
    for (let i = 1; i < bahn.length; i++) sA.push(sA[i - 1] + vlen(vsub(bahn[i], bahn[i - 1])));
    const L = sA[sA.length - 1];
    if (!(L > 1e-6)) return;
    const an = (x) => {
        let i = 1;
        while (i < sA.length - 1 && sA[i] < x) i++;
        const t = (x - sA[i - 1]) / Math.max(1e-12, sA[i] - sA[i - 1]);
        return vadd(bahn[i - 1], vscl(vsub(bahn[i], bahn[i - 1]), Math.max(0, Math.min(1, t))));
    };
    let hx = pts[0][0],
        hz = pts[0][2];
    if (Math.hypot(hx, hz) < 1e-6) {
        hx = ende[0] - pts[0][0];
        hz = ende[2] - pts[0][2];
    }
    const hl = Math.hypot(hx, hz) || 1;
    const tang = [-hz / hl, 0, hx / hl],
        radial = [hx / hl, 0, hz / hl];
    const u0 = (c) => c * 0.25 + 0.125 * (1 - kern);
    const v0 = 0.5 * (1 - kern);
    const corner = [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
    ];
    const K = Math.max(1, teile);
    for (let k = 0; k < K; k++) {
        const s0 = Math.max(0, (k - 0.1) * (L / K)),
            s1 = Math.min(L, (k + 1.1) * (L / K));
        const T = an(s0),
            B = an(s1);
        const ax = vsub(B, T),
            al = vlen(ax);
        if (!(al > 1e-6)) continue;
        const e1 = vscl(ax, 1 / al),
            mitte = vscl(vadd(T, B), 0.5);
        const bi = Math.max(0, Math.min(blaetter.length - 1, Math.floor(((k + 0.5) / K) * blaetter.length))),
            bl = blaetter[bi],
            fc = farben[bi];
        for (const quer of [tang, radial]) {
            const d = quer[0] * e1[0] + quer[1] * e1[1] + quer[2] * e1[2];
            let q = [quer[0] - e1[0] * d, quer[1] - e1[1] * d, quer[2] - e1[2] * d];
            q = vlen(q) < 1e-5 ? perp(e1) : vnorm(q);
            const nrm = vnorm(vcross(q, e1)).map((c) => (Math.abs(c) < 1e-9 ? 0 : c));
            const pos = [],
                nor = [],
                col = [],
                uvs = [],
                aw = [],
                ac = [],
                at = [];
            for (let i = 0; i < 4; i++) {
                const cx = corner[i][0] * halb,
                    cy = corner[i][1] * al * 0.5;
                pos.push(
                    mitte[0] + q[0] * cx + e1[0] * cy,
                    mitte[1] + q[1] * cx + e1[1] * cy,
                    mitte[2] + q[2] * cx + e1[2] * cy
                );
                nor.push(nrm[0], nrm[1], nrm[2]);
                col.push(fc.r, fc.g, fc.b);
                // v laeuft entlang der Kette (oben = der Zweig-Ansatz v0, unten = die Spitze v0 + kern), u quer — der
                // Kern-Ausschnitt der Zelle wie die Laub-Karte
                uvs.push(i === 0 || i === 3 ? u0(zelle) : u0(zelle) + 0.25 * kern, i < 2 ? v0 : v0 + kern);
                aw.push(bl.sway, bl.phase, bl.omega);
                ac.push(mitte[0], mitte[1], mitte[2]);
                at.push(1);
            }
            const g = new THREE.BufferGeometry();
            g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
            g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
            g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
            g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
            g.setAttribute("aWind", new THREE.Float32BufferAttribute(aw, 3));
            g.setAttribute("aCenter", new THREE.Float32BufferAttribute(ac, 3));
            g.setAttribute("aType", new THREE.Float32BufferAttribute(at, 1));
            g.setIndex([0, 1, 2, 0, 2, 3]);
            arr.push(g);
        }
    }
}

function bakeLeafAtlas() {
    if (_leafAtlas) return;
    // DER GETEILTE SAMEN: der Blatt-Atlas lebt in phyto-core.js (bakeLeafAtlasCanvas malt, bakeLeafAtlasBild mippt) — EIN Maler, EIN Layout
    // fuer Studio, Foundry-Worker und Host (Zelle 0 Baum-Zweig, 1 Weiden-Zweig, 2 Grossblatt-Zweig, 3 Nadel-Zweiglein; die Karten
    // routen ueber BLATT_ATLAS_BREIT/BLATT_ATLAS_GROSS/BLATT_ATLAS_NADEL). Der Worker hat kein document — er malt in eine OffscreenCanvas.
    // Ohne Samen kein stiller Inline-Zwilling (der alte Inline-Maler mit vier Breitblatt-Zellen ist gefallen).
    // Die TEXTUR ist das Atlas-Bild des Kerns (W5, bakeLeafAtlasBild): blutend, Zell-Mittel gleich, deckungstreue
    // Mips, Zeilen in Textur-Ordnung — der Stoff teilt die Atlas-Farbe durch `wert` (FARB-GESETZ: die Karten-Albedo
    // ist im Mittel die Vertex-Farbe, wie die Klinge).
    const __core = typeof self !== "undefined" && self.__phytoCore;
    if (!__core || typeof __core.bakeLeafAtlasBild !== "function")
        throw new Error("[phyto] bakeLeafAtlas: __phytoCore.bakeLeafAtlasBild fehlt (der Samen ist Pflicht)");
    const doc = typeof document !== "undefined" ? document : { createElement: () => __mkCanvas(1, 1) };
    const bild = __core.bakeLeafAtlasBild(doc);
    if (!bild) throw new Error("[phyto] bakeLeafAtlas: der Maler lieferte keine Leinwand");
    _leafAtlas = new THREE.DataTexture(bild.daten, bild.breite, bild.hoehe, THREE.RGBAFormat);
    _leafAtlas.mipmaps = bild.mips;
    _leafAtlas.generateMipmaps = false;
    _leafAtlas.minFilter = THREE.LinearMipmapLinearFilter;
    _leafAtlas.magFilter = THREE.LinearFilter;
    _leafAtlas.anisotropy = 8;
    if (THREE.sRGBEncoding !== undefined) _leafAtlas.encoding = THREE.sRGBEncoding;
    _leafAtlas.needsUpdate = true;
    foliageMatTex.map = _leafAtlas;
    foliageMatTex.color.setRGB(1 / bild.wert[0], 1 / bild.wert[1], 1 / bild.wert[2]);
    foliageMatTex.needsUpdate = true;
}

function pushLeafClusterQuad(arr, pos, dir, up, scale, color, sway, phase, omega, cell, nadel) {
    // DER GETEILTE SAMEN: die Blatt-Karten-GEOMETRIE (Quad + UV/Normale) lebt in phyto-core.js
    // (buildFoliageQuads) — dieselbe EINE Quelle, die AnazhRealm liest. Die Geometrie ist byte-
    // identisch; nur das WIND-Attribut-Schema divergiert (AnazhRealm: aFlex/aPhase — die Vorlage:
    // aWind/aCenter/aType), darum hängt der Wrapper die Vorlagen-Attribute HIER an (der Kern bleibt
    // rein). opts.cell routet die exakte Atlas-Zelle. Die Laub-Karte schneidet der Kern auf den Breitblatt-Kern
    // (BLATT_ATLAS_BREIT); die Nadel-Karte (nadel = true) traegt die ganze Nadel-Zelle (BLATT_ATLAS_NADEL), ihre
    // Kante kommt fertig in scale. Ohne Samen kein stiller Inline-Zwilling: lauter Bruch.
    const __core = typeof self !== "undefined" && self.__phytoCore;
    if (__core && typeof __core.buildFoliageQuads === "function") {
        const _r = __core.buildFoliageQuads(
            [{ pos: pos, dir: dir, up: up, scale: scale, sway: sway, phase: phase, needle: !!nadel }],
            {
                leafColor: [color.r, color.g, color.b],
                scale: 1,
                needleScale: 1,
                cell: cell,
                kern: __core.BLATT_ATLAS_BREIT.kern,
            }
        );
        if (_r && _r.count) {
            const g = new THREE.BufferGeometry();
            g.setAttribute("position", new THREE.Float32BufferAttribute(_r.positions, 3));
            g.setAttribute("normal", new THREE.Float32BufferAttribute(_r.normals, 3));
            g.setAttribute("uv", new THREE.Float32BufferAttribute(_r.uvs, 2));
            g.setAttribute("color", new THREE.Float32BufferAttribute(_r.colors, 3));
            const W = new Float32Array(12),
                CT = new Float32Array(12),
                T = new Float32Array(4);
            for (let i = 0; i < 4; i++) {
                W[i * 3] = sway;
                W[i * 3 + 1] = phase;
                W[i * 3 + 2] = omega;
                CT[i * 3] = pos[0];
                CT[i * 3 + 1] = pos[1];
                CT[i * 3 + 2] = pos[2];
                T[i] = 1;
            }
            g.setAttribute("aWind", new THREE.Float32BufferAttribute(W, 3));
            g.setAttribute("aCenter", new THREE.Float32BufferAttribute(CT, 3));
            g.setAttribute("aType", new THREE.Float32BufferAttribute(T, 1));
            g.setIndex(Array.from(_r.indices));
            arr.push(g);
            return;
        }
    }
    throw new Error("[phyto] pushLeafClusterQuad: __phytoCore.buildFoliageQuads fehlt (der Samen ist Pflicht)");
}

function growTreeNodes(P) {
    // DER GETEILTE SAMEN: die Baum-Wuchs-Mathematik (da Vinci Δ · McMahon · Apikaldominanz ·
    // Gravitropismus · Phyllotaxis · Whorls) lebt in phyto-core.js (growSkeleton) — DIESELBE
    // Quelle, die AnazhRealm (Main + Voxel-Worker) liest. Ein Edit am Wuchs-Gesetz fliesst hier
    // UND in AnazhRealm. Byte-treue Delegation: growSkeleton ist die reine Form dieser Funktion
    // (seq statt Modul-rnd), gleiche Rückgabe {segs,leaves,trunkR,height,runMeta}, gleiches
    // Blatt-Budget/count-Cap. Das LOD-Budget (__lod × window.PHYTO_LEAFBUDGET) reist als
    // P.leafBudget hinein; die zwei Seiteneffekte (P._trunkR/_D, downstream von Wurzel/Rinde
    // gelesen) werden aus dem Ergebnis gesetzt. P6 (EIN WUCHS): der alte ~275-Zeilen-Inline-Bau ist
    // GESCHNITTEN (Gesetz #0) — es gibt KEINE Parallel-Kopie der Wuchs-Mathematik mehr; fehlt der Kern
    // (Ladefehler), gibt es ein graceful-leeres Ergebnis statt einer driftenden Kopie.
    var __core = typeof self !== "undefined" && self.__phytoCore;
    if (__core && typeof __core.growSkeleton === "function") {
        // Baum-L1 traegt das Blatt-Budget der L0 (20000 statt 9000): die L1-Krone ist eine Teilmenge der L0-Blaetter
        // (Stride _lf), so haengt ihre Deckung nie davon ab, ob eine Art die Kappe erreicht (Fichte/Tanne taten es).
        const __gsLBl = typeof __lod === "undefined" ? 0 : __lod;
        const __gsLB =
            (globalThis.PHYTO_LEAFBUDGET && globalThis.PHYTO_LEAFBUDGET[__gsLBl]) ||
            (P.kind === "shrub" ? [4000, 1500, 1400] : [20000, 20000, 7000])[__gsLBl];
        const __gsR = __core.growSkeleton(Object.assign({}, P, { leafBudget: __gsLB }), rnd);
        if (__gsR && __gsR.segs && __gsR.segs.length) {
            P._trunkR = __gsR.trunkR;
            P._D = 2 * __gsR.trunkR;
            return __gsR;
        }
    }
    // Kein Kern (oder leeres Ergebnis) -> graceful leer; die Gates (portal-boot/foundry-warm) fangen
    // einen fehlenden Kern sofort (leere Assets -> rot). Der Aufrufer prueft segs.length.
    P._trunkR = P._trunkR || 0.1;
    P._D = 2 * P._trunkR;
    return { segs: [], leaves: [], trunkR: P._trunkR, height: P.height, runMeta: {} };
}

function pushJointSphere(arr, pos, r, col, sway) {
    // fuellt Naehte/Astachseln, schwingt wie pushSegment
    const g = new THREE.SphereGeometry(r, 6, 4);
    g.translate(pos[0], pos[1], pos[2]);
    const ps = g.attributes.position,
        n = ps.count;
    const aw = new Float32Array(n * 3),
        ac = new Float32Array(n * 3),
        at = new Float32Array(n),
        cl = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
        const vx = ps.getX(i),
            vy = ps.getY(i),
            vz = ps.getZ(i);
        const sv = sway;
        aw[i * 3] = sv;
        aw[i * 3 + 1] = sv * 1.5 + vx * 0.6 + vz * 0.6;
        aw[i * 3 + 2] = clamp(2.6 - sv * 1.6, 0.5, 2.6);
        ac[i * 3] = pos[0];
        ac[i * 3 + 1] = pos[1];
        ac[i * 3 + 2] = pos[2];
        at[i] = 0;
        cl[i * 3] = col.r;
        cl[i * 3 + 1] = col.g;
        cl[i * 3 + 2] = col.b;
    }
    g.setAttribute("aWind", new THREE.BufferAttribute(aw, 3));
    g.setAttribute("aCenter", new THREE.BufferAttribute(ac, 3));
    g.setAttribute("aType", new THREE.BufferAttribute(at, 1));
    g.setAttribute("color", new THREE.BufferAttribute(cl, 3));
    arr.push(g);
}

function growRoot(strands, pos, dir, radius, len, depth, P, rt) {
    rt = rt || { dive: 0.6, wob: 0.4, nb: 2 };
    if (depth > 4 || radius < P._trunkR * 0.05 || len < 0.1) return;
    const STEPS = depth === 0 ? 8 : 5;
    let p = pos.slice(),
        d = vnorm(dir.slice());
    const rings = [{ c: p.slice(), r: radius, sway: 0, depth: 1 }];
    let seekT = rnd() * 6.28;
    for (let i = 0; i < STEPS; i++) {
        const f = i / STEPS;
        let vb;
        if (depth === 0) {
            vb = p[1] > P._trunkR * 0.16 ? 0.55 : lerp(0.1, rt.dive, f);
        } else vb = 0.3 + depth * 0.12; // arttypische Abtauchtiefe (Flach- vs Tiefwurzler)
        d = vnorm(vadd(d, [0, -vb * 0.5, 0]));
        if (depth === 0 && p[1] < P._trunkR * 0.16) {
            d[1] *= 0.45;
            d = vnorm(d);
        } // an der Oberflaeche abflachen -> folgt dem Boden
        if (depth === 0) {
            const ro = Math.hypot(p[0], p[2]) || 1e-6;
            d = vnorm(vadd(d, vscl([p[0] / ro, 0, p[2] / ro], 0.14)));
        } // auswaerts, weg vom Stamm
        seekT += rrange(0.5, 1.1);
        const lat = perp(d);
        d = vnorm(vadd(d, vscl(lat, Math.sin(seekT) * rt.wob * (0.35 + 0.65 * f)))); // arttypischer Maeander
        d = vnorm(vadd(d, [(rnd() - 0.5) * 0.14, (rnd() - 0.5) * 0.09, (rnd() - 0.5) * 0.14])); // organische Stoerung
        p = vadd(p, vscl(d, (len / STEPS) * rrange(0.82, 1.18)));
        rings.push({ c: p.slice(), r: lerp(radius, radius * 0.5, f), sway: 0, depth: 1 });
    }
    strands.push({ ringe: rings, tiefe: depth });
    const endR = rings[rings.length - 1].r,
        area = Math.pow(endR, P.delta);
    const nb = depth < 2 && rnd() < 0.72 ? rt.nb : rnd() < 0.4 ? 1 : 0; // arttypische Verzweigung
    for (let b = 0; b < nb; b++) {
        const cr = Math.pow(area / Math.max(1, nb), 1 / P.delta);
        const side = vrot(perp(d), d, rnd() * 6.28);
        const cdir = vnorm(vadd(vscl(d, 0.55), vscl(side, rrange(0.4, 0.85))));
        growRoot(strands, rings[rings.length - 1].c, cdir, cr, len * 0.72, depth + 1, P, rt);
    }
}

function emitRoots(P) {
    if (!P.roots || !P._trunkR) return;
    const strands = [];
    // arttypische Wurzelarchitektur: ang=Anlaufwinkel, spread=Reichweite, dive=Abtauchtiefe, nb=Verzweigung, wob=Maeander
    const RT = {
        oak: { ang: -0.34, spread: 1.22, dive: 0.66, nb: 2, wob: 0.46 },
        sequoia: { ang: -0.3, spread: 0.94, dive: 0.52, nb: 2, wob: 0.3 },
        conifer: { ang: -0.17, spread: 1.08, dive: 0.38, nb: 1, wob: 0.4 },
        birch: { ang: -0.21, spread: 0.8, dive: 0.5, nb: 1, wob: 0.52 },
        willow: { ang: -0.14, spread: 1.38, dive: 0.42, nb: 2, wob: 0.58 },
        smooth: { ang: -0.3, spread: 0.78, dive: 0.58, nb: 1, wob: 0.42 },
    };
    const rt = RT[P.barkType] || RT.oak;
    const nR = Math.round(P.roots);
    const rR = P._trunkR * Math.sqrt(1.5 / nR); // da Vinci/Pipe: Wurzel-Querschnitte ~ Stammbasis
    for (let i = 0; i < nR; i++) {
        const a = (P._bphase || 0) + (i / nR) * 6.2831;
        const sp = [Math.cos(a) * P._trunkR * 0.6, P._trunkR * 0.34, Math.sin(a) * P._trunkR * 0.6]; // startet TIEF im Flarefuss -> volle Ueberlappung, KEIN Spalt; tritt am Grat aus
        const dir = vnorm([Math.cos(a), rt.ang + rrange(-0.06, 0.06), Math.sin(a)]);
        growRoot(strands, sp, dir, rR * rrange(0.92, 1.14), P.height * 0.3 * rt.spread, 0, P, rt);
    }
    const geos = [];
    const colA = new THREE.Color(P.barkA).multiplyScalar(0.72),
        colB = new THREE.Color(P.barkB).multiplyScalar(0.58);
    for (const st of strands) {
        // L1 traegt nur die PRIMAER-Straenge (H4): gewachsen wird das ganze Wurzelwerk (derselbe rnd()-Strom wie L0,
        // FIX v35), gebaut nur die Tiefe 0 — die Verzweigungen liegen ab 12 m unter dem Pixel und im Boden. Die
        // Baum-L0 ebenso (W5): die Primaer-Straenge mit allen Ringen, die Verzweigungen liegen im Boden.
        const L0Baum = __lod === 0 && P.kind === "tree";
        if ((__lod === 1 || L0Baum) && st.tiefe > 0) continue;
        // H1 auch hier (L1 und Baum-L0): jeder 2. Ring, Erst- und Letzt-Ring bleiben.
        const R = st.ringe;
        let ringe =
            (__lod === 1 || L0Baum) && R.length > 3 ? R.filter((_, i) => i % 2 === 0 || i === R.length - 1) : R;
        // Die Baum-L0 (S7): ohne ihre Verzweigungen endete der Primaerstrang stumpf ueber dem Boden (eine
        // Schnittflaeche von halbem Wurzel-Radius) — er laeuft in seiner Richtung weiter und taucht ab: zwei Ringe je eine
        // Segmentlaenge weiter, erst auf ein Drittel seiner Hoehe, dann ganz unter den Boden.
        if (L0Baum && R.length > 1) {
            const a = R[R.length - 2],
                b = R[R.length - 1],
                d = vsub(b.c, a.c);
            ringe = ringe.concat([
                { c: [b.c[0] + d[0], b.c[1] * 0.35, b.c[2] + d[2]], r: b.r * 0.8, sway: 0, depth: 1 },
                { c: [b.c[0] + 2 * d[0], -1.2 * b.r, b.c[2] + 2 * d[2]], r: b.r * 0.5, sway: 0, depth: 1 },
            ]);
        }
        buildTube(geos, ringe, P, colA, colB, P._trunkR); // Wurzel tritt aus dem Strebepfeiler-Wulst aus -> fliessender Uebergang, keine Fuge noetig
    }
    addMerged(geos, barkMat);
}

// U2b (V18.467) — DAS RINDEN-GESETZ WOHNT IM PFLANZEN-GESETZBUCH: vn2/fbm2
// (Rinden-Rauschen), barkProfile (Arten-Tabelle) und die Tube-Form sind
// VERBATIM nach phyto-core gewandert (Byte-Beweis diag:foundry-parity 720/720);
// hier lebt nur noch die Delegation — das Geometrie-Vokabular des Wirts wird
// injiziert, __lod reist als Parameter. phyto-core lädt in JEDEM Regime vor
// foundry-core (Manifest-Ordnung · index.html) — fehlt es, spricht der Wurf
// LAUT statt still zu zwillingen.
function __rindenGesetz() {
    const g = typeof globalThis !== "undefined" ? globalThis : self;
    const pc = g.__phytoCore;
    if (!pc || typeof pc.buildTubeGesetz !== "function")
        throw new Error("RINDEN-GESETZ fehlt: phyto-core (U2b) ist nicht geladen");
    return pc;
}
function fbm2(x, y) {
    return __rindenGesetz().fbm2(x, y);
}

// `lodRoehre` (W5): die Roehren-Aufloesung eines Strangs, wenn sie von der Bau-Stufe abweicht (die L0 baut duenne
// Aeste mit der Radial-Teilung der L1, Reisig mit der der L2) — ohne: die Bau-Stufe.
function buildTube(geos, rings, P, barkBase, barkTip, trunkR, noFlute, barkThick, lodRoehre) {
    return __rindenGesetz().buildTubeGesetz(
        { perp: perp, vcross: vcross, vlen: vlen, vnorm: vnorm, vsub: vsub, clamp: clamp, lerp: lerp, THREE: THREE },
        geos,
        rings,
        P,
        barkBase,
        barkTip,
        trunkR,
        noFlute,
        barkThick,
        lodRoehre !== undefined ? lodRoehre : typeof __lod !== "undefined" ? __lod : undefined
    );
}
function emitTree(P) {
    const nodes = growTreeNodes(P);
    if (P.tot) __totholzSchnitt(nodes, P); // Totholz: Krone gebrochen, Reisig ab, kein Laub (nach dem Wuchs)
    /* FIX v35: LOD = ABLEITUNG AUS L0. Ein Same -> EIN Individuum: das Skelett waechst bei JEDER Stufe identisch
     (gleicher RNG-Strom), niedrigere Stufen entstehen deterministisch daraus — Zweige unter der Radius-Schwelle
     fallen aus der Geometrie (das ist Pipe-Modell-treu: duenn = jung = fern unsichtbar), Blaetter werden per
     Index-Stride ausgeduennt (rng-frei, dieselbe Technik wie das Budget). Stamm, Winkel, Windphasen und Farben
     sind jetzt ueber L0/L1/L2 UND das Billboard dasselbe Individuum. */
    // Der Radius-Schnitt der L1 (H2/H5, nach dem Wuchs): Laub 0,05·trunkR; Konifere und Trauerwuchs 0,08 (ihre
    // duennen Aeste liegen unter den Nadel-Karten bzw. hinter dem Blatt-Vorhang); der Strauch liest seinen Schnitt aus
    // dem Budget (shrub[1].schnitt, 05.10.: das Reisig unter der Blatt-Masse IST sein Nahbild — die Karten-Krone gibt
    // die Dreiecke der Klingen an die Ruten zurück). Die L2 bleibt, wie sie war.
    // Unter shrub[1].rute·trunkR ist der Strang Reisig: Vierkant-Roehre (die Radial-Teilung der L2) auf jedem 3. Ring.
    const _bS1 = PORTAL_RENDER_CONFIG.lod.budget.shrub[1];
    const _strauchRute = P.kind === "shrub" && __lod === 1;
    if (
        _strauchRute &&
        !(
            _bS1 &&
            _bS1.schnitt > 0 &&
            _bS1.rute > _bS1.schnitt &&
            _bS1.rute < 1 &&
            _bS1.blattKarte > 0 &&
            _bS1.dichte &&
            _bS1.dichte.laub > 0 &&
            _bS1.dichte.laub <= 1
        )
    )
        throw new Error("[phyto] lod.budget.shrub[1].schnitt/rute/blattKarte/dichte fehlt (1 > rute > schnitt > 0)");
    // DIE TRAUER-L1 (05.10.): ihre Peitschen sind Straehnen wie in der L0 — die Bahn jeder belaubten Peitsche wird VOR
    // dem Radius-Schnitt festgehalten (die Peitsche ist duenner als 0,08·trunkR und faellt aus der Rinde; ihre Straehne
    // haengt an der Bahn). Befund (Blick-Tour V18.530, Bild 01; Raycast `f:weide|1|1:2`): die L1 trug schlanke Klingen
    // (4 Segmente) — auf 12–26 m ein Haufen breiter Papier-Streifen.
    const _trauerL1 = __lod === 1 && P.kind === "tree" && (P.trop || 0) >= 0.55;
    const _bahnL1 = new Map();
    if (_trauerL1) {
        const belaubt = new Set(nodes.leaves.map((l) => l.run));
        for (const s of nodes.segs)
            if (belaubt.has(s.runId)) {
                if (!_bahnL1.has(s.runId)) _bahnL1.set(s.runId, []);
                _bahnL1.get(s.runId).push(s);
            }
    }
    if (__lod > 0 && !(P.kind === "shrub" && __lod === 2)) {
        const kCut =
            __lod === 2
                ? 0.13
                : P.kind === "shrub"
                  ? _bS1.schnitt
                  : P.conifer || (P.trop || 0) >= 0.55
                    ? 0.08
                    : 0.05;
        const rCut = (P._trunkR || 0.1) * kCut;
        nodes.segs = nodes.segs.filter((s) => Math.max(s.r0, s.r1) >= rCut);
    }
    // DIE NAHKRONE L0 (W5 04.10., S7 05.10. — Studio-Budget tree[0], NACH dem Wuchs: kein rnd()-Zug, FIX v35). Nur Baeume
    // (P.kind === "tree"; der Strauch traegt nah seine L1, jede neue Art erbt die Nahkrone nicht still):
    //  - Laub und Nadel: Cluster-Karten aus dem EINEN Blatt-Atlas (Laub → Breitblatt-Zellen, Nadel → Nadel-Zelle) auf
    //    dem Anteil `dichte` der gewachsenen Blattstellen (Index-Stride wie die L1), Kante `blattKarte`/`nadelKarte` —
    //    geeicht an der BILD-Deckung (kronen-linse, 24 Ansichten): die L0 deckt 0,95–1,05 der Klingen und Nadel-Roehren
    //    von gestern, die L1 deckt sie im Band;
    //  - der Trauerwuchs: je Peitsche EINE Straehne (pushStraehne) entlang ihrer gewachsenen Bahn;
    //  - DER TRAEGER: jede Karte und Straehne haengt an ihrem Lauf (`run` des Blatts) — er und jeder Vorfahr werden
    //    gebaut, ein Strang unter `rinde.ast`·trunkR ohne Traeger faellt ganz (kein kahler Stock, keine schwebende Karte:
    //    der Pruefer sah Fichte 656/1406, Mammut 541/905 Karten ohne Zweig, die Weiden-Straehnen ohne Peitsche);
    //  - die Rinde: unter `rinde.ast`·trunkR jeder 2. Ring, unter `rinde.reisig`·trunkR jeder 3. (mindestens Erst und
    //    Letzt), beide in der Radial-Teilung der L1 (die L2-Vierkant las auf Armlaenge als Brett); Stamm und Starkaeste
    //    bleiben ganz (Fuss, Gabel-Kugeln); die Wurzel-Primaerstraenge tauchen ab (emitRoots).
    const _L0 = __lod === 0 && P.kind === "tree";
    const _trauer = (P.trop || 0) >= 0.55;
    const _b0 = PORTAL_RENDER_CONFIG.lod.budget.tree[0];
    const _art0 = P.conifer ? "nadel" : _trauer ? "trauer" : "laub";
    let _f0 = 1,
        _rz = null;
    if (_L0) {
        _f0 = _b0 && _b0.dichte ? _b0.dichte[_art0] : undefined;
        if (!(_f0 > 0 && _f0 <= 1)) throw new Error("[phyto] lod.budget.tree[0].dichte." + _art0 + " fehlt");
        _rz = _b0.rinde;
        if (!_rz || !(_rz.ast > 0) || !(_rz.reisig > 0) || !(_rz.reisig < _rz.ast))
            throw new Error("[phyto] lod.budget.tree[0].rinde fehlt (ast > reisig > 0)");
        if (_trauer && (!(_b0.boden > 0) || !_b0.straehne || !(_b0.straehne.breite > 0) || !(_b0.straehne.teile >= 1)))
            throw new Error("[phyto] lod.budget.tree[0].boden/straehne fehlt");
    }
    // Die Straehnen-Zeile der Trauer-L1 (tree[1].straehne) und das tiefste Laub (tree[0].boden, EINE Zahl der Art).
    const _st1 = PORTAL_RENDER_CONFIG.lod.budget.tree[1].straehne;
    if (_trauerL1 && (!(_b0.boden > 0) || !_st1 || !(_st1.breite > 0) || !(_st1.teile >= 1)))
        throw new Error("[phyto] lod.budget.tree[1].straehne / tree[0].boden fehlt");
    // Die Trauer-L0 und -L1 bauen keine Einzel-Klinge: jede Peitsche (der Lauf, an dem growSkeleton ihre Blaetter
    // haengt — `run`) wird EINE Straehne entlang ihrer gewachsenen Bahn. Die Straehnen-Wahl ist die Peitschen-Wahl.
    const _peitschen = new Map();
    if ((_L0 || _trauerL1) && _trauer) {
        for (const l of nodes.leaves) {
            if (!_peitschen.has(l.run)) _peitschen.set(l.run, []);
            _peitschen.get(l.run).push(l);
        }
    }
    {
        // Der Strauch traegt in seiner L1 nur den Anteil shrub[1].dichte.laub der Blattstellen als Karte (05.10.: die
        // Karte misst blattKarte Blatt-Groessen — das Blatt des Atlas ist halb so lang wie gestern, die Karte waechst,
        // ihre Zahl faellt bei gleicher Bild-Deckung).
        const lfP = P._lf != null ? P._lf : 1;
        const lfL = _L0 ? (_trauer ? 1 : _f0) : _strauchRute ? lfP * _bS1.dichte.laub : lfP;
        if (lfL < 1 && nodes.leaves.length > 3) {
            const L = nodes.leaves,
                keep = Math.max(3, Math.round(L.length * lfL)),
                st = L.length / keep,
                K = [];
            for (let t = 0; t < keep; t++) K.push(L[Math.floor(t * st)]);
            nodes.leaves = K;
        }
    }
    if (_L0 && _trauer && _f0 < 1 && _peitschen.size > 3) {
        const W = Array.from(_peitschen.keys()),
            keep = Math.max(3, Math.round(W.length * _f0)),
            st = W.length / keep,
            K = new Set();
        for (let t = 0; t < keep; t++) K.add(W[Math.floor(t * st)]);
        for (const w of W) if (!K.has(w)) _peitschen.delete(w);
    }
    // DER TRAEGER (S7): jede gehaltene Karte bzw. Straehne haengt an ihrem Lauf — er und jeder Vorfahr bis zum Stamm
    // werden gebaut; ein duenner Strang ohne Traeger-Lauf faellt ganz (kein kahler Stock, keine schwebende Karte).
    const _traeger = new Set();
    if (_L0) {
        const mark = (r) => {
            while (r != null && r >= 0 && !_traeger.has(r)) {
                _traeger.add(r);
                r = nodes.runMeta[r] ? nodes.runMeta[r].parentRun : -1;
            }
        };
        if (_trauer) for (const w of _peitschen.keys()) mark(w);
        else for (const l of nodes.leaves) mark(l.run);
    }
    const barkGeos = [],
        folGeos = [];
    const barkBase = new THREE.Color(P.barkA),
        barkTip = new THREE.Color(P.barkB);
    const flare = P.flare || 0,
        fh = nodes.height * 0.14,
        ffR = (y) =>
            1 + flare * 0.85 * Math.exp(-Math.max(0, y) / fh) + flare * 0.5 * Math.exp(-Math.max(0, y) / (fh * 0.35));
    const meta = nodes.runMeta,
        runs = new Map();
    for (const s of nodes.segs) {
        if (!runs.has(s.runId)) runs.set(s.runId, []);
        runs.get(s.runId).push(s);
    }
    const leadChild = {};
    for (const rid of runs.keys()) {
        const mm = meta[rid];
        if (mm && mm.isLead && mm.parentRun >= 0) leadChild[mm.parentRun] = rid;
    }
    // GABEL-GESETZ (V18.501): ein Kind waechst vom Segment-Ende AUF der Mutter-Achse — seine Gelenk-Kugel
    // (1,5 r) liegt im Mutter-Ast, solange das Kind deutlich duenner ist. Eine Naht zu fuellen gibt es nur
    // an der GABEL (r_Kind ≥ 0,8 r_Mutter). Gemessen (CPU-Raster, 7 Arten × Stufen × 1–12-fach): ohne die
    // verdeckten Kugeln mittlere Abweichung 0,0000, hoechstens 27 von 536 000 Pixeln; Strauch L1 69k → 45k.
    const __mutterRing = (s0) => {
        const mm = meta[s0.runId],
            par = mm && mm.parentRun >= 0 ? runs.get(mm.parentRun) : null;
        if (!par) return 0;
        let best = null,
            bd = Infinity;
        for (const ps of par) {
            const dx = ps.p1[0] - s0.p0[0],
                dy = ps.p1[1] - s0.p0[1],
                dz = ps.p1[2] - s0.p0[2],
                d = dx * dx + dy * dy + dz * dz;
            if (d < bd) {
                bd = d;
                best = ps;
            }
        }
        return best && bd <= 1e-10 ? best.r1 * ffR(best.p1[1]) : 0;
    };
    function strandRings(head) {
        let rid = head,
            rings = [],
            first = true;
        while (rid !== undefined && runs.has(rid)) {
            const sl = runs.get(rid),
                s0 = sl[0];
            if (first) {
                rings.push({ c: s0.p0, r: s0.r0 * ffR(s0.p0[1]), sway: s0.sway0, depth: s0.depth });
                first = false;
            }
            for (const s of sl) rings.push({ c: s.p1, r: s.r1 * ffR(s.p1[1]), sway: s.sway1, depth: s.depth });
            rid = leadChild[rid];
        }
        // L1 traegt jeden ZWEITEN Ring (H1, nach dem Wuchs — das Skelett und der rnd()-Strom bleiben die von L0,
        // FIX v35): Erst- und Letzt-Ring bleiben, der Stammfuss wird danach vorangestellt und bleibt ganz.
        // Die L0 duennt nur die Aeste (tree[0].rinde): unter `reisig`·trunkR jeden 3. Ring, unter `ast`·trunkR jeden 2.
        // Das Strauch-Reisig (L1 unter shrub[1].rute·trunkR) duennt wie das Reisig der Baum-L0: jeder 3. Ring.
        if (
            ((_L0 && rings[0].r < nodes.trunkR * _rz.reisig) ||
                (_strauchRute && rings[0].r < nodes.trunkR * _bS1.rute)) &&
            rings.length > 2
        )
            rings = rings.filter((_, i) => i % 3 === 0 || i === rings.length - 1);
        else if ((__lod === 1 || (_L0 && rings[0].r < nodes.trunkR * _rz.ast)) && rings.length > 3)
            rings = rings.filter((_, i) => i % 2 === 0 || i === rings.length - 1);
        return rings;
    }
    for (const rid of runs.keys()) {
        const mm = meta[rid];
        if (mm && mm.isLead) continue;
        if ((_L0 || _trauerL1) && _peitschen.has(rid)) continue; // die Peitsche ist ihre Straehne (unten)
        if (_L0 && runs.get(rid)[0].r0 < nodes.trunkR * _rz.ast && !_traeger.has(rid)) continue;
        let rings = strandRings(rid);
        const baseRing = rings[0];
        const _roehre =
            _L0 && baseRing.r < nodes.trunkR * _rz.ast
                ? 1
                : _strauchRute && baseRing.r < nodes.trunkR * _bS1.rute
                  ? 2
                  : undefined;
        if (rings.length > 1 && baseRing.c[1] < nodes.height * 0.04 && baseRing.r > nodes.trunkR * 0.6) {
            // Stammfuss: Buttress in den Boden fuehren (absenken, verjuengen, schliessen) — die Ringe tragen `fuss`, das Rinden-Gesetz liest den Strang-Radius darueber
            const R0 = baseRing.r,
                cx = baseRing.c[0],
                cz = baseRing.c[2],
                bd = Math.min(R0 * 0.85, nodes.trunkR * 1.7);
            rings = [
                { c: [cx, -bd, cz], r: R0 * 0.1, sway: 0, depth: baseRing.depth, fuss: true },
                { c: [cx, -bd * 0.5, cz], r: R0 * 0.52, sway: 0, depth: baseRing.depth, fuss: true },
                { c: [cx, -bd * 0.18, cz], r: R0 * 0.84, sway: 0, depth: baseRing.depth, fuss: true },
            ].concat(rings);
        }
        buildTube(barkGeos, rings, P, barkBase, barkTip, nodes.trunkR, undefined, undefined, _roehre);
        const s0 = runs.get(rid)[0];
        const rMutter = s0.depth > 0 ? __mutterRing(s0) : 0;
        if (s0.depth > 0 && baseRing.r > nodes.trunkR * 0.035 && !(rMutter > 0 && baseRing.r < rMutter * 0.8)) {
            const cc = barkBase
                .clone()
                .lerp(barkTip, clamp(s0.p0[1] / nodes.height, 0, 1) * 0.5 + (s0.depth / Math.max(1, P.maxDepth)) * 0.3);
            pushJointSphere(barkGeos, s0.p0, baseRing.r * 1.5, cc, s0.sway0);
        }
    }
    {
        // TOTE AESTE: kurze graue Stummel am unteren Stamm, wo die Schattenaeste abstarben — echte Segment-Hoehen, dicker Stamm (depth ist unzuverlaessig)
        const ys = nodes.segs.map((s) => s.p1[1]),
            yTop = Math.max.apply(null, ys),
            yBot = Math.min.apply(null, ys),
            span = Math.max(0.1, yTop - yBot);
        const stubLo = yBot + span * 0.14,
            stubHi = yBot + span * 0.52;
        const deadA = new THREE.Color(P.barkA).multiplyScalar(0.72),
            deadB = new THREE.Color(P.barkB).multiplyScalar(0.72); // STAMMrinde, nur abgedunkelt (tot) — kein graues Fremdmaterial
        const dh = (p) => {
            let n = Math.sin(p[0] * 12.9 + p[1] * 78.2 + p[2] * 37.7) * 43758.5;
            return n - Math.floor(n);
        };
        let stubN = 0;
        for (const sg of nodes.segs) {
            const h = sg.p0[1];
            if (sg.r0 < nodes.trunkR * 0.4) continue; // nur am dicken Stamm
            if (h < stubLo || h > stubHi) continue;
            if (dh(sg.p0) > 0.22 || stubN >= 6) continue;
            stubN++;
            const ang = dh([sg.p1[0] + 0.3, sg.p0[1], sg.p1[2] - 0.2]) * 6.2831,
                down = -0.2 - 0.55 * dh(sg.p1);
            const odir = vnorm([Math.cos(ang), down, Math.sin(ang)]);
            const baseR = Math.max(0.035, sg.r0 * (0.16 + 0.1 * dh(sg.p0))),
                L = baseR * (6 + 8 * dh(sg.p1));
            const start = vadd(sg.p0, vscl(odir, sg.r0 * 0.6));
            const NST = 4,
                stubRings = [];
            for (let i = 0; i <= NST; i++) {
                const f = i / NST,
                    c = vadd(start, vscl(odir, L * f));
                c[1] -= L * f * f * 0.4; // tot -> haengt ab
                stubRings.push({
                    c,
                    r: i === NST ? Math.max(0.01, baseR * 0.05) : baseR * (1 - f * 0.72),
                    sway: sg.sway0 * (1 - f),
                    depth: 1,
                });
            }
            buildTube(barkGeos, stubRings, P, deadA, deadB, nodes.trunkR, true, 0.85); // STAMM-Oberflaeche, keine Floete, schliesst im Punkt
        }
    }
    const lc = vegFarbe(seasonTint),
        lc2 = vegFarbe(seasonAccent);
    // DIE L1-KRONE (FIX v31/v32, H5 04.10.): Laub UND Nadel tragen L1 als KARTEN aus dem EINEN Atlas (Laub →
    // Breitblatt-Zellen, Nadel → die Nadel-Zelle); der Trauerwuchs (Weide, trop ≥ 0,55) traegt seit 05.10. auch in der
    // L1 Straehnen aus dem Atlas (tree[1].straehne, unten) — die schlanke Klinge las als Papier-Streifen. Der
    // Strauch (05.10.): seine L1 ist die nahe Stufe (L0 wird auf L1 geklemmt) — sie trug Klingen, die L1-Aggregation
    // (Blatt ×2,05, 21 % der Stellen) machte daraus breite Papier-Streifen (Blick-Tour 01). Jetzt traegt er Karten aus
    // dem EINEN Atlas wie jede Laub-Krone, Kante shrub[1].blattKarte (gemessen an der Bild-Deckung der Klingen).
    const _b1 = PORTAL_RENDER_CONFIG.lod.budget.tree[1];
    const _strauchKarte = __lod === 1 && P.kind === "shrub";
    const useTexL = ((__lod === 1 || _L0) && P.kind === "tree" && !_trauer) || _strauchKarte;
    // Die Karten-GEOMETRIE liest nur den Steckbrief des Kerns (Zellen, Kern), nie das Atlas-BILD: sie wird immer gebaut.
    // Das Bild braucht nur, wer zeichnet — das Labor (Haupt-Thread) hier, der Foundry-Worker erst, wenn er eine Karte
    // baeckt (__replyBakeImpostor). Fehlt der Maler, wirft bakeLeafAtlas laut (kein Rueckfall auf Klingen: die L0 hatte
    // dort halbkahle Kronen aus der Karten-Ausduennung).
    if ((useTexL || ((_L0 || _trauerL1) && _trauer)) && !_leafAtlas && globalThis.__PHYTO_FOUNDRY !== true)
        bakeLeafAtlas();
    // DIE LEISE KONSOLE (08.07.): die per-Bau-INFO-Zeile flutete den Boot (~112 Zeilen)
    // und ertraenkte echte Signale — nur noch hinter dem Debug-Flag (__phytoDebug).
    if (__lod === 1 && globalThis.__phytoDebug)
        console.log(
            "[phyto] L1-Bau: " +
                (useTexL
                    ? P.conifer
                        ? "Nadel-KARTEN"
                        : "Multi-Blatt-KARTEN"
                    : _trauerL1
                      ? "Trauerwuchs-STRAEHNEN"
                      : "GEOMETRIE")
        );
    const folGeosTex = [];
    let _lq = 0;
    // Kante, Zelle und Klinge der L1-Krone liest das BUDGET (PORTAL_RENDER_CONFIG.lod.budget.tree[1]) und den
    // Atlas-Steckbrief des Kerns — fehlt eins, ist das ein Vertragsbruch, kein stiller Rueckfall auf ein Literal.
    const _atl = self.__phytoCore;
    // Die L0 liest ihre Zeile (tree[0]) wie die L1 die ihre: Kante der Laub-Karte in Blatt-Groessen, der Nadel-Karte
    // in Nadel-Laengen. Deckung ~ dichte · Kante² (Wahrnehmung ~ n·s², FIX v29).
    const _bz = _strauchKarte ? _bS1 : _L0 ? _b0 : _b1,
        _zn = _strauchKarte ? "shrub[1]" : _L0 ? "tree[0]" : "tree[1]";
    const _blattKarte = useTexL && !P.conifer ? _bz.blattKarte : 0;
    const _nadelKarte = useTexL && P.conifer ? _bz.nadelKarte : 0;
    if (useTexL && !(P.conifer ? _nadelKarte > 0 : _blattKarte > 0))
        throw new Error("[phyto] lod.budget." + _zn + "." + (P.conifer ? "nadelKarte" : "blattKarte") + " fehlt");
    // Die Trauer-L0 und -L1 tragen keine Klinge: ihre Blaetter reisen in den Straehnen (unten).
    for (const l of (_L0 || _trauerL1) && _trauer ? [] : nodes.leaves) {
        if (l.needle) {
            const col = vegFarbe(0x2e5526).lerp(lc, 0.2);
            if (useTexL) {
                // H5: die Nadel-KARTE — eine Nadel-Spray je gehaltener Nadelstelle, Kante = nadelKarte Nadel-Laengen
                // (die Deckung gegen die L0-Nadeln haelt gate:asset-contract im Band budget.tree[1].deckung).
                pushLeafClusterQuad(
                    folGeosTex,
                    l.pos,
                    l.dir,
                    l.up,
                    l.scale * _nadelKarte,
                    col,
                    l.sway,
                    l.phase,
                    l.omega,
                    _atl.BLATT_ATLAS_NADEL.zelle,
                    true
                );
            } else
                pushNeedle(
                    folGeos,
                    l.pos,
                    l.dir,
                    l.scale * (__lod === 2 ? 2.6 : 1),
                    col,
                    l.sway,
                    l.phase,
                    l.omega
                ); // FIX v38: Deckung ~ n*len^2 — die gehaltenen Nadeln der L2 sind laenger, die Krone bleibt dicht.
        } else {
            const _tj = (() => {
                const s = Math.sin(l.pos[0] * 127.1 + l.pos[1] * 311.7 + l.pos[2] * 74.7) * 43758.5453;
                return s - Math.floor(s);
            })(); // FIX v35: Tint = hash(Blattposition) — dasselbe Blatt hat in JEDER LOD-Stufe dieselbe Farbe (vorher: sequentielles rnd() -> je LOD andere Farbfolge)
            const tint = lc
                .clone()
                .lerp(lc2, _tj * 0.5)
                .lerp(vegFarbe(P.leafCol), P.kind === "shrub" ? 0.72 : 0.45);
            if (useTexL) {
                pushLeafClusterQuad(
                    folGeosTex,
                    l.pos,
                    l.dir,
                    l.up,
                    l.scale * _blattKarte,
                    tint,
                    l.sway,
                    l.phase,
                    l.omega,
                    // Das Blatt-Mass der Art: der Strauch liest die Grossblatt-Zelle (seine Karte ist klein), der Baum
                    // seine Baum-Zweige im Wechsel (05.10.).
                    _strauchKarte ? _atl.BLATT_ATLAS_GROSS.zelle : _lq++ % _atl.BLATT_ATLAS_BREIT.zellen
                );
            } // FIX v32: ALLE Blattstellen, 2 statt 28 Dreiecke. Die Kante kommt aus dem Budget (lod.budget.tree[1].blattKarte, 04.10.: 1,8 statt 2,35 — gemessen deckte die Krone 1,7x L0, die Atlas-Fuellung ist 0,16, nicht ~0,85)
            else {
                const lp = P.leafShape;
                pushLeaf(folGeos, l.pos, l.dir, l.up, l.scale, lp, tint, 1, l.sway, l.phase, l.omega, 0.5);
            }
        }
    }
    // DIE TRAUER-STRAEHNE der L0 (S7) und der L1 (05.10.): jede gehaltene Peitsche wird EINE Karten-Kette entlang ihrer
    // gewachsenen Bahn (pushStraehne) — Breite `straehne.breite` Blattlaengen, `straehne.teile` Stuecke (die Zeile der
    // Stufe: tree[0] bzw. tree[1]), nie unter `boden`·Baumhoehe. Die L1 liest die Bahn von vor dem Radius-Schnitt.
    if ((_L0 || _trauerL1) && _trauer) {
        const _bodenY = nodes.height * _b0.boden;
        const _st = _L0 ? _b0.straehne : _st1;
        for (const [w, Lw] of _peitschen) {
            const sg = _L0 ? runs.get(w) : _bahnL1.get(w);
            if (!sg || !sg.length || !Lw.length) continue;
            const pts = [sg[0].p0].concat(sg.map((x) => x.p1));
            let Lm = 0;
            for (const l of Lw) Lm += l.scale;
            Lm /= Lw.length;
            const farben = Lw.map((l) => {
                const h = Math.sin(l.pos[0] * 127.1 + l.pos[1] * 311.7 + l.pos[2] * 74.7) * 43758.5453;
                return lc
                    .clone()
                    .lerp(lc2, (h - Math.floor(h)) * 0.5)
                    .lerp(vegFarbe(P.leafCol), 0.45);
            });
            pushStraehne(
                folGeosTex,
                pts,
                Lm,
                _st.breite * Lm,
                Lw,
                farben,
                _bodenY,
                _st.teile,
                _atl.BLATT_ATLAS_WEIDE.zelle,
                _atl.BLATT_ATLAS_BREIT.kern
            );
        }
    }
    // DER BODEN (S7): keine Karte der Nahkrone reicht unter den Boden der Vorlage — eine solche Karte faellt (die Krone
    // haengt nie in die Erde; der Pruefer sah die Weiden-Straehnen unter dem Boden-Rand, die Birke senkte haengende
    // Karten bis 0,37 unter y = 0).
    if (_L0)
        for (let i = folGeosTex.length - 1; i >= 0; i--) {
            const p = folGeosTex[i].attributes.position.array;
            for (let k = 1; k < p.length; k += 3)
                if (p[k] < 0) {
                    folGeosTex.splice(i, 1);
                    break;
                }
        }
    if (P.tot) {
        // Die Bruch-Stellen schließen mit einem Splitterkranz, die Borke vergraut und blättert (eigener Hash-Strom).
        const hz = mulberry32(((Math.floor(SEED) ^ 0x5b1d) + 1) >>> 0),
            splitter = [];
        for (let i = 0; i < 12; i++) splitter.push(hz());
        for (const b of nodes.brueche || [])
            __holzEnde(barkGeos, b.p, b.d, b.r, P, splitter, false, vegFarbe(0x8a7a62), vegFarbe(0x9a8e7e));
        __totholzRinde(barkGeos, nodes, P);
    }
    addMerged(barkGeos, P.barkType === "birch" ? barkMatBirch : barkMat); // KEIN Weld -> eigene Normalen, kein verschmierter Blob am Fuss
    emitRoots(P); // Wurzeln zurueck (hochgeladene Version: emitRoots, Farbe barkA*0.72/barkB*0.58, aus dem Flarefuss)
    addMerged(folGeos, foliageMat);
    if (folGeosTex.length) addMerged(folGeosTex, foliageMatTex); // FIX v31: Cluster-Quads als eigenes Submesh (eigener Attributsatz mit uv) — Studio UND Wald, da buildInstance den subject-Sink tauscht
    return nodes;
}

function emitFlower(P) {
    const stemGeos = [],
        folGeos = [];
    const H = P.height,
        stemR = H * 0.018,
        hs = P.windGain;
    let prev = [0, 0, 0],
        d = [0, 1, 0];
    const NS = __lod === 0 ? 10 : __lod === 1 ? 6 : 3;
    const la = rnd() * 6.28,
        bendDir = [Math.cos(la), 0, Math.sin(la)];
    const stemPts = [];
    for (let i = 0; i <= NS; i++) {
        const f = i / NS;
        d = vnorm(vadd([0, 1, 0], vscl(bendDir, 0.18 * f * f)));
        stemPts.push({ p: prev.slice(), d: d.slice() });
        if (i < NS) {
            const p2 = vadd(prev, vscl(d, H / NS)),
                f2 = (i + 1) / NS,
                sw0 = Math.pow(f, 1.6) * hs,
                sw1 = Math.pow(f2, 1.6) * hs;
            pushSegment(
                stemGeos,
                prev,
                p2,
                stemR * (1 - f * 0.3),
                stemR * (1 - (f + 1 / NS) * 0.3),
                6,
                sw0,
                sw1,
                1.0,
                0.9,
                vegFarbe(0x3c6a24),
                vegFarbe(0x4f7a2e),
                0
            );
            prev = p2;
        }
    }
    const top = prev,
        tdir = d,
        petalCol = vegFarbe(P.flowerCol),
        hsTop = hs;
    const bloom = (pos, bdir, headR, plen, prich, hsw) => {
        // Korbblueten-Einheit (Vogel-Spirale + Fibonacci-Petalen)
        const hr = perp(bdir),
            u2 = vnorm(vcross(hr, bdir));
        if (__lod === 2) {
            pushJointSphere(folGeos, vadd(pos, vscl(bdir, headR * 0.35)), headR * 1.15, petalCol, hsw);
            return;
        }
        pushSegment(
            stemGeos,
            vadd(pos, vscl(bdir, -H * 0.02)),
            vadd(pos, vscl(bdir, H * 0.02)),
            headR * 0.7,
            headR * 0.7,
            10,
            hsw,
            hsw,
            1,
            1,
            vegFarbe(0x5a4a20),
            vegFarbe(0x6a5a28),
            0
        );
        pushJointSphere(
            folGeos,
            vadd(pos, vscl(bdir, -headR * 0.35)),
            headR * 0.74,
            vegFarbe(0x6a5a28).lerp(petalCol, 0.12),
            hsw
        );
        const ff = __lod === 0 ? 1 : 0.4,
            NF = Math.round(headR * headR * 900 * ff),
            cc = headR / Math.sqrt(Math.max(1, NF));
        for (let n = 0; n < NF; n++) {
            const th = n * GOLDEN,
                r = cc * Math.sqrt(n);
            const fp = vadd(
                vadd(vadd(pos, vscl(hr, Math.cos(th) * r)), vscl(u2, Math.sin(th) * r)),
                vscl(bdir, H * 0.005)
            );
            const col = vegFarbe(0x6a4a18).lerp(vegFarbe(0xc88a20), r / headR);
            pushSegment(
                folGeos,
                fp,
                vadd(fp, vscl(bdir, H * 0.012)),
                headR * 0.05,
                headR * 0.01,
                4,
                hsw,
                hsw,
                1,
                1.4,
                col,
                col,
                0
            );
        }
        let np = nearestFib(lerp(8, 18, prich));
        if (__lod > 0) np = nearestFib(np * (__lod === 1 ? 0.7 : 0.42));
        // DAS BLÜTENBLATT (phyto-core BLUETEN_BLATT): Saftmal-Grund, Rückbiegung, je Blatt gewürfelt aus dem Ort.
        const BB = self.__phytoCore.BLUETEN_BLATT;
        const pc = petalCol.clone().lerp(vegFarbe(seasonTint), 0.08);
        // Der Grund ist linear aus der schon linearen Blütenfarbe gerechnet (pc kommt aus vegFarbe) — ein Tripel, keine Palette.
        const bl = {
            grund: [Math.pow(pc.r, BB.potenz), Math.pow(pc.g, BB.potenz), Math.pow(pc.b, BB.potenz)],
            grundBis: BB.grundBis,
            biegen: BB.biegen,
        };
        for (let i = 0; i < np; i++) {
            const a = (i / np) * 6.28,
                out = vnorm(vadd(vscl(hr, Math.cos(a)), vscl(u2, Math.sin(a))));
            const w = (k) => 2 * fbm2(i * 3.17 + k * 1.93, a * 5.1 + pos[0] * 7.3 + pos[2] * 3.7) - 1; // ±1, ortsfest
            const base = vadd(pos, vscl(out, headR * 0.58)),
                pdir = vnorm(vadd(out, vscl(bdir, 0.4 * (1 + BB.neigung * w(0)))));
            // Drehung um die eigene Achse: up = bdir·cos t + (pdir × bdir)·sin t (Reihe bis t^5, |t| ≤ 0,4).
            const t = BB.drehung * w(1),
                t2 = t * t,
                ct = 1 - t2 / 2 + (t2 * t2) / 24,
                st = t * (1 - t2 / 6 + (t2 * t2) / 120);
            const up = vnorm(vadd(vscl(bdir, ct), vscl(vnorm(vcross(pdir, bdir)), st)));
            pushLeaf(
                folGeos,
                base,
                pdir,
                up,
                plen * (1 + BB.laenge * w(2)),
                P.petalShape,
                pc,
                3,
                hsw,
                a,
                1.3,
                0.45,
                bl
            );
        }
    };
    if (P.infl === "single") {
        bloom(top, tdir, P.headR, P.petalLen, P.petalRich, hsTop);
    } else if (P.infl === "umbel") {
        // Dolde: Bluetchen auf Stielen vom Scheitel
        const n = P.bloomCount;
        for (let k = 0; k < n; k++) {
            const aa = (k / n) * 6.2831 + rnd() * 0.22,
                sd = vnorm([Math.cos(aa) * 0.78, 0.64, Math.sin(aa) * 0.78]),
                slen = H * 0.3 * rrange(0.82, 1.18),
                sp = vadd(top, vscl(sd, slen));
            pushSegment(
                stemGeos,
                top,
                sp,
                stemR * 0.5,
                stemR * 0.4,
                5,
                hsTop,
                hsTop * 1.1,
                1,
                1,
                vegFarbe(0x3c6a24),
                vegFarbe(0x4f7a2e),
                0
            );
            bloom(sp, vnorm(vadd(sd, [0, 0.42, 0])), P.headR, P.petalLen, P.petalRich, hsTop * 1.1);
        }
    } else {
        // Aehre: Bluetchen spiralig die obere Haelfte hinauf
        const n = P.bloomCount;
        for (let k = 0; k < n; k++) {
            const ff = 0.5 + 0.48 * (n > 1 ? k / (n - 1) : 0),
                idx = Math.min(NS, Math.round(ff * NS)),
                seg = stemPts[idx];
            const aa = k * GOLDEN,
                hr = perp(seg.d),
                u2 = vnorm(vcross(hr, seg.d)),
                out = vnorm(vadd(vscl(hr, Math.cos(aa)), vscl(u2, Math.sin(aa))));
            const bp = vadd(seg.p, vscl(out, P.headR * 0.5));
            bloom(
                bp,
                vnorm(vadd(out, [0, 0.5, 0])),
                P.headR * 0.9,
                P.petalLen * 0.9,
                P.petalRich * 0.7,
                Math.pow(ff, 1.6) * hs
            );
        }
    }
    const nLv = __lod === 2 ? 0 : 2 + Math.floor(rnd() * 2);
    for (let i = 0; i < nLv; i++) {
        const ff = 0.3 + 0.4 * (nLv > 1 ? i / (nLv - 1) : 0),
            sp = [bendDir[0] * 0.05 * H * ff * ff, H * ff, bendDir[2] * 0.05 * H * ff * ff],
            aa = rnd() * 6.28,
            lo = vnorm([Math.cos(aa) * 0.55, 0.95, Math.sin(aa) * 0.55]),
            swl = Math.pow(ff, 1.6) * hs;
        pushLeaf(
            folGeos,
            sp,
            lo,
            [0, 1, 0],
            P.petalLen * 0.85,
            SHAPE.lance,
            vegFarbe(seasonTint).lerp(vegFarbe(seasonAccent), 0.4),
            1,
            swl,
            aa,
            0.7,
            0.4
        );
    }
    addMerged(stemGeos, stemMat);
    addMerged(folGeos, foliageMat);
    return { height: H };
}

// Die Halm-Spitze: der Saison-Akzent nach dem Farb-Gesetz, linear um GRAS_SPITZE_HELL aufgehellt (emitGrass). Der
// Stamm liest DIESELBE Zahl fuer die Halme seiner Boden-Wiese (`AnazhRealm.GRAS_SPITZE`, terrain:GRAS_SPITZE_HELL).
const GRAS_SPITZE_HELL = 1.08;
function emitGrass(P) {
    const geos = [];
    const lf = __lod === 0 ? 1 : __lod === 1 ? 0.55 : 0.14;
    const N = Math.max(3, Math.round(lerp(50, 150, P.density) * lf));
    const baseCol = vegFarbe(seasonTint).multiplyScalar(0.6),
        tipCol = vegFarbe(seasonAccent).multiplyScalar(GRAS_SPITZE_HELL);
    const seedCol = vegFarbe(P.seedTan || 0xc8b27a);
    const SH = P.seedHead || 0;
    for (let i = 0; i < N; i++) {
        const a = i * GOLDEN,
            rr = Math.sqrt(i / N) * P.clump;
        const bx = Math.cos(a) * rr,
            bz = Math.sin(a) * rr;
        const isCulm = SH > 0 && rnd() < SH * 0.5; // Teil der Halme -> Rispenstaengel
        const wMul = __lod === 0 ? 1 : __lod === 1 ? 1.7 : 4.6;
        const L = P.bladeLen * (isCulm ? rrange(1.25, 1.6) : rrange(0.6, 1.15)),
            w = P.bladeW * wMul * (isCulm ? 0.5 : 0.74) * rrange(0.8, 1.1);
        const lean = rrange(0.05, 0.22),
            la = rnd() * 6.28,
            bendDir = [Math.cos(la), 0, Math.sin(la)],
            droop = isCulm ? P.droop * 0.45 : P.droop;
        const K = __lod === 0 ? (isCulm ? 7 : 10) : __lod === 1 ? 5 : 3,
            positions = [],
            idx = [],
            uvs = [],
            sway = [],
            ctr = [],
            typ = [],
            col = [];
        let p = [bx, 0, bz],
            dir = vnorm([Math.sin(lean) * Math.cos(la), Math.cos(lean), Math.sin(lean) * Math.sin(la)]),
            tip = p.slice();
        for (let s = 0; s <= K; s++) {
            const f = s / K,
                dd = Math.pow(f, 1.8) * droop;
            dir = vnorm(vadd(dir, vscl(bendDir, dd * 0.12)));
            dir = vnorm(vadd(dir, [0, -dd * 0.1, 0]));
            p = vadd(p, vscl(dir, L / K));
            tip = p.slice();
            const halfW = w * (1 - f * 0.86) * 0.5,
                rt = vnorm(vcross(dir, [0, 1, 0]));
            const cl = vadd(p, vscl(rt, -halfW)),
                cr = vadd(p, vscl(rt, halfW));
            positions.push(cl[0], cl[1], cl[2], cr[0], cr[1], cr[2]);
            uvs.push(0, f, 1, f);
            const c = baseCol.clone().lerp(tipCol, f);
            for (let q = 0; q < 2; q++) {
                const sw = Math.pow(f, 1.4) * P.windGain;
                sway.push(sw, la * 1.3 + i, 1.1 + 0.5 * (1 - f));
                ctr.push(bx, 0, bz);
                typ.push(4);
                col.push(c.r, c.g, c.b);
            }
        }
        for (let s = 0; s < K; s++) {
            const a0 = s * 2,
                b0 = s * 2 + 1,
                a1 = s * 2 + 2,
                b1 = s * 2 + 3;
            idx.push(a0, b0, a1, b0, b1, a1);
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
        g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
        g.setIndex(idx);
        g.computeVertexNormals();
        g.setAttribute("aWind", new THREE.Float32BufferAttribute(sway, 3));
        g.setAttribute("aCenter", new THREE.Float32BufferAttribute(ctr, 3));
        g.setAttribute("aType", new THREE.Float32BufferAttribute(typ, 1));
        g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
        geos.push(g);
        if (isCulm) {
            // Rispe: feine nickende Grannen an der Spitze
            const Naw = __lod === 0 ? 11 : __lod === 1 ? 7 : 4,
                pg = [],
                pi = [],
                pc = [],
                pw = [],
                pct = [],
                pty = [],
                pu = [];
            let vb = 0;
            const swT = P.windGain * 1.15;
            for (let k = 0; k < Naw; k++) {
                const aa = (k / Naw) * 6.2831 + rnd() * 0.5,
                    awl = L * rrange(0.14, 0.28);
                let ad = vnorm([Math.cos(aa) * 0.3, 0.96, Math.sin(aa) * 0.3]),
                    ap = tip.slice();
                const AK = 3;
                for (let s2 = 0; s2 < AK; s2++) {
                    const f2 = s2 / AK;
                    ad = vnorm(vadd(ad, [0, -0.3 - f2 * 0.85, 0]));
                    const np = vadd(ap, vscl(ad, awl / AK)),
                        hw = 0.016 * (1 - f2 * 0.7),
                        rt2 = vnorm(vcross(ad, [0, 1, 0]));
                    const c0 = vadd(ap, vscl(rt2, -hw)),
                        c1 = vadd(ap, vscl(rt2, hw)),
                        c2 = vadd(np, vscl(rt2, hw * 0.5)),
                        c3 = vadd(np, vscl(rt2, -hw * 0.5));
                    pg.push(c0[0], c0[1], c0[2], c1[0], c1[1], c1[2], c2[0], c2[1], c2[2], c3[0], c3[1], c3[2]);
                    pi.push(vb, vb + 1, vb + 2, vb, vb + 2, vb + 3);
                    pu.push(0, f2, 1, f2, 1, f2 + 0.5, 0, f2 + 0.5);
                    for (let q = 0; q < 4; q++) {
                        const cc = seedCol.clone().multiplyScalar(0.85 + 0.3 * f2);
                        pc.push(cc.r, cc.g, cc.b);
                        pw.push(swT, la * 1.3 + i, 1.0);
                        pct.push(tip[0], tip[1], tip[2]);
                        pty.push(4);
                    }
                    vb += 4;
                    ap = np;
                }
            }
            const gp = new THREE.BufferGeometry();
            gp.setAttribute("position", new THREE.Float32BufferAttribute(pg, 3));
            gp.setIndex(pi);
            gp.computeVertexNormals();
            gp.setAttribute("uv", new THREE.Float32BufferAttribute(pu, 2));
            gp.setAttribute("color", new THREE.Float32BufferAttribute(pc, 3));
            gp.setAttribute("aWind", new THREE.Float32BufferAttribute(pw, 3));
            gp.setAttribute("aCenter", new THREE.Float32BufferAttribute(pct, 3));
            gp.setAttribute("aType", new THREE.Float32BufferAttribute(pty, 1));
            geos.push(gp);
        }
    }
    addMerged(geos, grassMat);
    return { height: P.bladeLen * 1.2 };
}

// ════════════════════════════════════════════════════════════════════════════
// DER WALDBODEN (04.10.) — Farn · Schilf · Gestrüpp · Totholz als Studio-Gesetze. Ein Wald liest sich real an
// seinem Boden: gefiederte Farne im feuchten Schatten, ein Schilfgürtel am Ufer, bogiges Gestrüpp am Saum,
// liegende Stämme und Stümpfe. Jede Art wächst aus den fünf Reglern wie jede Pflanze (deriveParamsWaldboden),
// ihre Gestalt ist EIN Skelett je Same (alle rnd()-Würfe VOR der Tessellierung — L0 und L1 sind dasselbe
// Individuum, FIX-v35-Gesetz), die Stufen unterscheiden nur die Auflösung. Die Bänder (Wedel, Fiedern, Halme,
// Blätter) sammelt EIN Puffer je Stoff statt tausender Einzel-Geometrien — dasselbe Attribut-Vokabular wie
// pushSegment (aWind · aCenter · aType · color), damit Labor-Wind und Saison wirken wie bei jeder Pflanze.
// ════════════════════════════════════════════════════════════════════════════
function __bandSammler() {
    return { p: [], c: [], uv: [], w: [], ct: [], t: [], i: [], n: 0 };
}
function __bandVert(S, p, col, u, v, sway, ctr, typ) {
    S.p.push(p[0], p[1], p[2]);
    S.c.push(col.r, col.g, col.b);
    S.uv.push(u, v);
    S.w.push(sway, sway * 1.5 + p[0] * 0.6 + p[2] * 0.6, clamp(2.6 - sway * 1.6, 0.5, 2.6));
    S.ct.push(ctr[0], ctr[1], ctr[2]);
    S.t.push(typ);
    return S.n++;
}
// Ein Band aus Reihen gleicher Punktzahl (2 = Klinge, 3 = Klinge mit Mittelrippe); eine Reihe mit EINEM Punkt
// ist die Spitze (Fächer). reihen[k] = { pts, col, v, sway }.
function __band(S, reihen, ctr, typ) {
    let vor = null;
    for (let k = 0; k < reihen.length; k++) {
        const R = reihen[k],
            idx = [];
        for (let q = 0; q < R.pts.length; q++)
            idx.push(__bandVert(S, R.pts[q], R.col, R.pts.length > 1 ? q / (R.pts.length - 1) : 0.5, R.v, R.sway, ctr, typ));
        if (vor) {
            if (idx.length === 1) for (let q = 0; q + 1 < vor.length; q++) S.i.push(vor[q], vor[q + 1], idx[0]);
            else for (let q = 0; q + 1 < idx.length; q++) S.i.push(vor[q], vor[q + 1], idx[q + 1], vor[q], idx[q + 1], idx[q]);
        }
        vor = idx;
    }
}
// Ein dünnes Rohr (Stiel, Halm, Rute) entlang einer Polylinie: `rad` Seiten, Radius r(f), Farbe col(f).
function __rohr(S, pts, rad, rf, colf, swayf, typ) {
    const n = pts.length;
    if (n < 2) return;
    let u = null,
        vor = null;
    for (let i = 0; i < n; i++) {
        const d = vnorm(vsub(pts[Math.min(n - 1, i + 1)], pts[Math.max(0, i - 1)]));
        if (!u) u = perp(d);
        else {
            const du = vdot(u, d);
            u = vnorm(vsub(u, vscl(d, du)));
        }
        const v = vnorm(vcross(d, u)),
            f = i / (n - 1),
            r = rf(f),
            col = colf(f),
            sw = swayf(f),
            idx = [];
        for (let j = 0; j < rad; j++) {
            const a = (j / rad) * 6.2831853;
            const p = vadd(pts[i], vadd(vscl(u, Math.cos(a) * r), vscl(v, Math.sin(a) * r)));
            idx.push(__bandVert(S, p, col, j / rad, f, sw, pts[i], typ));
        }
        if (vor)
            for (let j = 0; j < rad; j++) {
                const j1 = (j + 1) % rad;
                S.i.push(vor[j], vor[j1], idx[j1], vor[j], idx[j1], idx[j]);
            }
        vor = idx;
    }
}
function __bandAdd(S, mat) {
    if (!S.n) return;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(S.p, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(S.uv, 2));
    g.setIndex(S.i);
    g.computeVertexNormals();
    g.setAttribute("aWind", new THREE.Float32BufferAttribute(S.w, 3));
    g.setAttribute("aCenter", new THREE.Float32BufferAttribute(S.ct, 3));
    g.setAttribute("aType", new THREE.Float32BufferAttribute(S.t, 1));
    g.setAttribute("color", new THREE.Float32BufferAttribute(S.c, 3));
    const m = new THREE.Mesh(g, mat);
    m.castShadow = true;
    m.receiveShadow = true;
    subject.add(m);
}
// Punkt auf einer Polylinie bei Bogen-Anteil t ∈ [0,1] → { p, d } (Ort + Tangente).
function __polyBei(pts, t) {
    const n = pts.length - 1,
        x = clamp(t, 0, 1) * n,
        i = Math.min(n - 1, Math.floor(x)),
        f = x - i;
    return { p: vlerp(pts[i], pts[i + 1], f), d: vnorm(vsub(pts[i + 1], pts[i])) };
}

// DER FARN (Dryopteris-Gesetz): ein Trichter aus gefiederten Wedeln. Der Stiel steigt aus dem Wurzelstock,
// biegt sich bogig nach außen und nickt zur Spitze (Gravitropismus `nicken`); die Fiedern stehen wechselständig,
// ihre Länge folgt der lanzettlichen Spreite (kurz am Grund, am längsten im unteren Drittel, spitz zur Spitze),
// jede Fieder ist eine gesägte Klinge. In der Mitte stehen junge Wedel als eingerollte Bischofsstäbe. L1: der
// Wedel ist EIN gezacktes Band (die Silhouette der Spreite), die Bischofsstäbe fallen unter den Pixel.
function emitFern(P) {
    const S = __bandSammler();
    const W = [];
    // SKELETT (alle Würfe, jede Stufe gleich)
    for (let k = 0; k < P.wedel; k++) {
        const az = k * GOLDEN + P._ph + rrange(-0.3, 0.3),
            L = P.wedelLen * rrange(0.72, 1.12),
            tilt = clamp(P.neigung + rrange(-0.12, 0.18) + (k % 3) * 0.05, 0.1, 1.35),
            alt = rnd(),
            schief = rrange(-0.12, 0.12);
        const out = [Math.cos(az), 0, Math.sin(az)];
        let d = vnorm([out[0] * Math.sin(tilt), Math.cos(tilt), out[2] * Math.sin(tilt)]);
        let p = [out[0] * 0.025, 0, out[2] * 0.025];
        const NS = 10,
            pts = [p.slice()];
        for (let i = 1; i <= NS; i++) {
            const f = i / NS;
            d = vnorm(vadd(d, [out[0] * 0.05, -P.nicken * 0.2 * f, out[2] * 0.05]));
            p = vadd(p, vscl(d, L / NS));
            pts.push(p.slice());
        }
        const fj = [];
        for (let j = 0; j < P.fiedern * 2; j++) fj.push([rrange(0.85, 1.12), rrange(-0.08, 0.08)]);
        W.push({ pts, L, alt, schief, fj });
    }
    const K = [];
    for (let k = 0; k < P.krummstab; k++)
        K.push({ az: rnd() * 6.2831853, h: rrange(0.12, 0.26) * P.wedelLen, r: rrange(0.025, 0.04) * P.wedelLen });
    // TESSELLIERUNG
    const c0 = vegFarbe(P.farbe).multiplyScalar(0.62),
        c1 = vegFarbe(P.farbe),
        c2 = vegFarbe(P.spitze),
        welk = vegFarbe(0x8a8040),
        stielA = vegFarbe(0x3a2e1c),
        stielB = vegFarbe(0x56692c);
    const up = [0, 1, 0];
    for (const w of W) {
        const sh = 0.86 + 0.2 * w.alt,
            welkT = w.alt > 0.82 ? (w.alt - 0.82) * 2.2 : 0;
        const sideAt = (t) => {
            const e = __polyBei(w.pts, t);
            let s = vnorm(vcross(e.d, up));
            s = vnorm(vadd(s, vscl(up, w.schief)));
            return { p: e.p, d: e.d, s, n: vnorm(vcross(s, e.d)) };
        };
        // Stiel (Rhachis): L0 Rohr mit 3 Seiten, L1 ein dünnes Band
        if (__lod === 0)
            __rohr(
                S,
                w.pts,
                3,
                (f) => w.L * lerp(0.009, 0.002, f),
                (f) => stielA.clone().lerp(stielB, Math.min(1, f * 2.2)),
                (f) => Math.pow(f, 1.4) * P.windGain,
                1
            );
        const t0 = P.stiel,
            nP = P.fiedern;
        if (__lod === 0) {
            // jede Fieder eine gesägte Klinge: 5 Reihen (Grund · 3 Zähne · Spitze)
            for (let j = 0; j < nP * 2; j++) {
                const sgn = j % 2 ? -1 : 1,
                    t = t0 + (1 - t0) * ((Math.floor(j / 2) + (j % 2) * 0.45 + 0.3) / nP),
                    tp = (t - t0) / (1 - t0),
                    prof = Math.pow(Math.sin(Math.PI * Math.pow(tp, 0.62)), 0.85),
                    lp = P.fiederLen * w.L * (0.16 + 0.84 * prof) * w.fj[j][0];
                if (lp < 0.004) continue;
                const e = sideAt(t);
                const dir = vnorm(
                    vadd(vadd(vscl(e.s, sgn * 0.82), vscl(e.d, 0.5)), vscl(e.n, -0.12 + w.fj[j][1]))
                );
                const wv = vnorm(vcross(e.n, dir)),
                    wb = lp * P.fiederBreit;
                const reihen = [];
                const B = [0.55, 1.0, 0.72, 0.62, 0];
                for (let q = 0; q < 5; q++) {
                    const s = q / 4,
                        hw = 0.5 * wb * B[q] * (1 - s * 0.55),
                        c = vadd(vadd(e.p, vscl(dir, lp * s)), vscl(e.n, -lp * 0.18 * s * s)),
                        col = c0.clone().lerp(c1, 0.35 + 0.65 * s).lerp(c2, s * s * 0.55).multiplyScalar(sh);
                    if (welkT > 0) col.lerp(welk, welkT * s);
                    const sw = Math.pow(t, 1.4) * P.windGain + s * 0.25;
                    reihen.push({
                        pts: q === 4 ? [c] : [vsub(c, vscl(wv, hw)), vadd(c, vscl(wv, hw))],
                        col,
                        v: s,
                        sway: sw,
                    });
                }
                __band(S, reihen, e.p, 1);
            }
        } else {
            // L1: der Wedel als EIN Band — die Silhouette der Spreite in K1 Reihen (je Reihe drei Fieder-Paare
            // aggregiert, abwechselnd Spitze und Bucht): ~13 Dreiecke je Wedel statt einer Klinge je Fieder.
            const reihen = [];
            const e0 = sideAt(t0 * 0.35);
            reihen.push({ pts: [vsub(e0.p, vscl(e0.s, 0.004)), vadd(e0.p, vscl(e0.s, 0.004))], col: stielA, v: 0, sway: 0 });
            const K1 = Math.max(4, Math.round(nP / 3));
            for (let j = 0; j <= K1; j++) {
                const t = t0 + (1 - t0) * (j / K1),
                    tp = j / K1,
                    prof = Math.pow(Math.sin(Math.PI * Math.pow(tp, 0.62)), 0.85),
                    lp = P.fiederLen * w.L * (0.16 + 0.84 * prof) * (j % 2 ? 0.22 : 1.0); // tiefe Buchten bis nahe der Rhachis: die Silhouette liest gefiedert, nicht gelappt
                const e = sideAt(t);
                const fw = vnorm(vadd(vscl(e.d, 0.32), vscl(e.n, -0.08)));
                const col = c0.clone().lerp(c1, 0.5 + 0.5 * tp).lerp(c2, tp * 0.4).multiplyScalar(sh);
                if (welkT > 0) col.lerp(welk, welkT * tp);
                if (j === K1) {
                    reihen.push({ pts: [e.p], col, v: 1, sway: P.windGain });
                    break;
                }
                reihen.push({
                    pts: [
                        vadd(vsub(e.p, vscl(e.s, lp * 0.82)), vscl(fw, lp)),
                        vadd(vadd(e.p, vscl(e.s, lp * 0.82)), vscl(fw, lp)),
                    ],
                    col,
                    v: tp,
                    sway: Math.pow(t, 1.4) * P.windGain,
                });
            }
            __band(S, reihen, w.pts[0], 1);
        }
    }
    // Die jungen Wedel: ein steiler Stiel, der in eine Spirale mündet (L0)
    if (__lod === 0) {
        const fuzz = vegFarbe(0x6a5a32);
        for (const kr of K) {
            const out = [Math.cos(kr.az), 0, Math.sin(kr.az)],
                pts = [];
            for (let i = 0; i <= 5; i++) pts.push([out[0] * 0.02 * i, (kr.h * i) / 5, out[2] * 0.02 * i]);
            const top = pts[5],
                side = vnorm(vcross(out, [0, 1, 0]));
            for (let i = 1; i <= 9; i++) {
                const a = (i / 9) * 5.2,
                    rr = kr.r * (1 - i / 11);
                pts.push(vadd(top, vadd(vscl(out, Math.sin(a) * rr), [0, (Math.cos(a) - 1) * -rr * 0.2 + Math.sin(a * 0.5) * rr, 0])));
            }
            __rohr(
                S,
                pts,
                4,
                (f) => P.wedelLen * lerp(0.009, 0.006, f) * (f > 0.4 ? 1.6 : 1),
                (f) => stielB.clone().lerp(fuzz, f),
                () => 0.1,
                1
            );
        }
    }
    __bandAdd(S, foliageMat);
    return { height: P.wedelLen };
}

// DAS SCHILF (Phragmites-Gesetz): ein Horst aus Halmen, jeder Halm ein schlankes Rohr mit wechselständigen,
// bogig überhängenden Blättern und einer nickenden Rispe; alle Rispen wehen zur selben Seite (die Wind-Fahne
// des Standorts). Vorjährige Halme stehen braun und blattlos dazwischen. L1 aggregiert: der Halm 3-seitig in zwei
// Gliedern, zwei breite Blätter, die Rispe als EIN breites Band (Wahrnehmung ~ n·s²) — ~21 Dreiecke je Halm.
function emitSchilf(P) {
    const S = __bandSammler();
    const fahne = [Math.cos(P.fahne), 0, Math.sin(P.fahne)];
    const H = [];
    for (let k = 0; k < P.halme + P.alt; k++) {
        const a = rnd() * 6.2831853,
            rr = Math.sqrt(rnd()) * P.horst,
            alt = k >= P.halme,
            h = P.hoehe * rrange(0.72, 1.08) * (alt ? 0.8 : 1),
            lean = [rrange(-1, 1) * P.neigung + Math.cos(a) * 0.06, 1, rrange(-1, 1) * P.neigung + Math.sin(a) * 0.06],
            bl = [];
        for (let b = 0; b < P.blaetter; b++) bl.push([rrange(0.85, 1.15), rrange(-0.5, 0.5), rnd()]);
        const ri = [];
        for (let b = 0; b < 12; b++) ri.push([rrange(0.7, 1.15), rrange(-0.35, 0.35)]);
        H.push({ base: [Math.cos(a) * rr, 0, Math.sin(a) * rr], h, lean: vnorm(lean), alt, bl, ri, ph: rnd() * 6.28 });
    }
    const gA = vegFarbe(0x46602a),
        gB = vegFarbe(P.farbe),
        braun = vegFarbe(0x8a7650),
        braunD = vegFarbe(0x6a5a3e),
        rA = vegFarbe(P.rispe),
        rB = vegFarbe(0x9a8a70);
    const L0 = __lod === 0;
    for (const hm of H) {
        const NS = L0 ? 7 : 2,
            pts = [];
        let p = hm.base.slice(),
            d = hm.lean.slice();
        for (let i = 0; i <= NS; i++) {
            pts.push(p.slice());
            const f = i / NS;
            d = vnorm(vadd(d, vscl(fahne, 0.06 * f * f)));
            p = vadd(p, vscl(d, hm.h / NS));
        }
        const colH = (f) => (hm.alt ? braunD.clone().lerp(braun, f) : gA.clone().lerp(gB, f));
        __rohr(S, pts, 3, (f) => lerp(0.0075, 0.0035, f), colH, (f) => Math.pow(f, 1.5) * P.windGain, 4);
        // Blätter (vorjährige Halme: keine)
        if (!hm.alt) {
            const nb = L0 ? hm.bl.length : Math.min(2, hm.bl.length);
            for (let b = 0; b < nb; b++) {
                const bi = L0 ? b : Math.floor(((b + 0.5) / nb) * hm.bl.length),
                    j = hm.bl[bi],
                    t = 0.14 + 0.62 * (bi / Math.max(1, hm.bl.length - 1)),
                    e = __polyBei(pts, t),
                    az = hm.ph + bi * 3.0 + j[1],
                    out = [Math.cos(az), 0, Math.sin(az)],
                    len = P.hoehe * 0.2 * j[0],
                    K = L0 ? 5 : 2,
                    reihen = [];
                let q = e.p.slice(),
                    dd = vnorm(vadd(vscl(e.d, 0.82), vscl(out, 0.58)));
                for (let s = 0; s <= K; s++) {
                    const f = s / K,
                        tw = 0.6 * f * (j[2] - 0.5),
                        wv0 = vnorm(vcross(dd, [0, 1, 0])),
                        wv = vnorm(vadd(vscl(wv0, Math.cos(tw)), vscl(vcross(dd, wv0), Math.sin(tw)))),
                        hw = (L0 ? 0.012 : 0.022) * (1 - f * 0.85),
                        col = gA.clone().lerp(gB, 0.4 + 0.6 * f).lerp(braun, f * f * 0.25),
                        sw = Math.pow(t, 1.5) * P.windGain + f * 0.4;
                    reihen.push({ pts: s === K ? [q] : [vsub(q, vscl(wv, hw)), vadd(q, vscl(wv, hw))], col, v: f, sway: sw });
                    dd = vnorm(vadd(dd, [out[0] * 0.18, -0.34 * f, out[2] * 0.18]));
                    q = vadd(q, vscl(dd, len / K));
                }
                __band(S, reihen, e.p, 1);
            }
        }
        // Die Rispe: Haupt-Achse nickt zur Fahne, Seiten-Äste hängen federig
        const top = pts[pts.length - 1],
            rl = P.rispeLen * hm.h * (hm.alt ? 0.75 : 1),
            nR = L0 ? hm.ri.length : 1;
        for (let b = 0; b < nR; b++) {
            const bi = L0 ? b : 4,
                j = hm.ri[bi],
                t = b / nR,
                start = vadd(top, vscl(hm.lean, -rl * 0.55 * t)),
                az = hm.ph + bi * 2.4,
                dd0 = vnorm(vadd(vadd(vscl(fahne, 0.7), [Math.cos(az) * 0.4, 0.5, Math.sin(az) * 0.4]), [0, j[1], 0])),
                len = rl * j[0] * (1 - t * 0.5),
                K = L0 ? 3 : 2,
                reihen = [];
            let q = start.slice(),
                dd = dd0;
            for (let s = 0; s <= K; s++) {
                const f = s / K,
                    wv = vnorm(vcross(dd, [0, 1, 0])),
                    hw = (L0 ? 0.016 : 0.08) * (1 - f * 0.6),
                    col = (hm.alt ? rB.clone() : rA.clone().lerp(rB, f * 0.5)).multiplyScalar(0.9 + 0.2 * j[0]);
                reihen.push({
                    pts: s === K ? [q] : [vsub(q, vscl(wv, hw)), vadd(q, vscl(wv, hw))],
                    col,
                    v: f,
                    sway: P.windGain * 1.2,
                });
                dd = vnorm(vadd(dd, [0, -0.45, 0]));
                q = vadd(q, vscl(dd, len / K));
            }
            __band(S, reihen, top, 4);
        }
    }
    __bandAdd(S, foliageMat);
    return { height: P.hoehe };
}

// DAS GESTRÜPP (Brombeer-/Schlehen-Gesetz): bogige Ruten aus dem Wurzelstock, die sich überneigen und mit der
// Spitze zum Boden streben; an ihnen kurze Seitenzweige mit kleinen Blättern, dicht wie Reisig. L0: Ruten als
// Rohre, jedes Blatt eine gesägte Klinge (Rinde + Laub); L1 trägt EINEN Stoff (das Laub, ein Befehl): die Ruten
// grob in zwei Gliedern, je zwei Seitenzweige EIN Blatt-Büschel als Raute (Fläche ≈ die L0-Blätter, n·s²).
function emitGestruepp(P) {
    const SR = __bandSammler(),
        SL = __bandSammler();
    const R = [];
    for (let k = 0; k < P.ruten; k++) {
        const az = k * GOLDEN + rrange(-0.4, 0.4),
            el = rrange(0.95, 1.35),
            len = P.hoehe * rrange(1.0, 1.5),
            base = [rrange(-0.08, 0.08), 0, rrange(-0.08, 0.08)],
            z = [];
        for (let j = 0; j < P.zweige; j++) {
            const bl = [];
            for (let b = 0; b < 4; b++) bl.push([rrange(0.8, 1.2), rrange(-0.6, 0.6), rnd()]);
            z.push({ t: rrange(0.25, 0.95), az: rnd() * 6.2831853, len: P.hoehe * rrange(0.1, 0.24), bl });
        }
        R.push({ az, el, len, base, z });
    }
    const bA = vegFarbe(P.barkA),
        bB = vegFarbe(P.barkB),
        lA = vegFarbe(P.leafCol),
        lB = vegFarbe(0x5a7a32),
        rot = vegFarbe(0x7a3a22);
    const L0 = __lod === 0;
    const blatt = (pos, dir, len, j) => {
        const n0 = vnorm(vcross(dir, [0, 1, 0])),
            nrm = vnorm(vcross(n0, dir)),
            wv = vnorm(vcross(nrm, dir)),
            col = lA.clone().lerp(lB, j[2] * 0.6);
        if (j[2] > 0.9) col.lerp(rot, 0.6);
        const B = [0.3, 0.92, 1.0, 0.7, 0];
        const reihen = [];
        for (let q = 0; q < 5; q++) {
            const s = q / 4,
                c = vadd(vadd(pos, vscl(dir, len * s)), vscl(nrm, -len * 0.15 * s * s)),
                hw = len * 0.3 * B[q];
            reihen.push({
                pts: q === 4 ? [c] : [vsub(c, vscl(wv, hw)), vadd(c, vscl(wv, hw))],
                col: col.clone().multiplyScalar(0.85 + 0.25 * s),
                v: s,
                sway: P.windGain * 0.8,
            });
        }
        __band(SL, reihen, pos, 1);
    };
    for (const r of R) {
        const out = [Math.cos(r.az), 0, Math.sin(r.az)],
            NS = L0 ? 8 : 2,
            pts = [];
        let p = r.base.slice(),
            d = vnorm([out[0] * Math.cos(r.el), Math.sin(r.el), out[2] * Math.cos(r.el)]);
        for (let i = 0; i <= NS; i++) {
            pts.push(p.slice());
            const f = i / NS;
            d = vnorm(vadd(d, [out[0] * 0.05, -P.bogen * 0.7 * f, out[2] * 0.05]));
            p = vadd(p, vscl(d, r.len / NS));
            if (p[1] < 0.02) p[1] = 0.02;
        }
        __rohr(
            L0 ? SR : SL,
            pts,
            L0 ? 4 : 3,
            (f) => lerp(0.011, 0.0035, f),
            (f) => bA.clone().lerp(bB, f),
            (f) => Math.pow(f, 1.3) * P.windGain,
            0
        );
        for (let zi = 0; zi < r.z.length; zi++) {
            const z = r.z[zi];
            if (!L0 && zi % 2) continue; // L1: je zwei Seitenzweige EIN Büschel
            const e = __polyBei(pts, z.t),
                zo = [Math.cos(z.az), 0.55, Math.sin(z.az)],
                zd = vnorm(vadd(vscl(e.d, 0.55), vscl(vnorm(zo), 0.7))),
                zEnd = vadd(e.p, vscl(zd, z.len));
            if (L0) {
                __rohr(
                    SR,
                    [e.p, vadd(e.p, vscl(zd, z.len * 0.5)), zEnd],
                    3,
                    (f) => lerp(0.004, 0.0018, f),
                    (f) => bB.clone().lerp(bA, f * 0.3),
                    () => P.windGain * 0.6,
                    0
                );
                const nb = Math.max(3, Math.round(z.bl.length * P.blattDichte + 0.6));
                for (let b = 0; b < nb && b < z.bl.length; b++) {
                    const j = z.bl[b],
                        pos = vlerp(e.p, zEnd, 0.35 + 0.65 * (b / Math.max(1, nb - 1))),
                        dd = vnorm(vadd(vadd(zd, [Math.cos(z.az + j[1] * 3) * 0.8, 0.2, Math.sin(z.az + j[1] * 3) * 0.8]), [0, j[1] * 0.3, 0]));
                    blatt(pos, dd, P.blatt * j[0], j);
                }
            } else {
                // L1: das Büschel als Raute im Laub-Stoff — Grund schmal, Bauch breit, Spitze; die Fläche der acht L0-Blätter zweier Zweige (Kante 2·Zweig)
                const cc = lA.clone().lerp(lB, z.bl[0][2] * 0.6),
                    wv = vnorm(vcross(zd, [0, 1, 0])),
                    lz = z.len * 2.0,
                    b0 = vlerp(e.p, zEnd, 0.15),
                    m = vadd(e.p, vscl(zd, lz * 0.55)),
                    tip = vadd(e.p, vscl(zd, lz * 1.05)),
                    hw = lz * 0.32,
                    sw = P.windGain * 0.7;
                __band(
                    SL,
                    [
                        { pts: [vsub(b0, vscl(wv, hw * 0.12)), vadd(b0, vscl(wv, hw * 0.12))], col: cc.clone().multiplyScalar(0.8), v: 0, sway: sw },
                        { pts: [vsub(m, vscl(wv, hw)), vadd(m, vscl(wv, hw))], col: cc, v: 0.5, sway: sw },
                        { pts: [tip], col: cc.clone().multiplyScalar(1.1), v: 1, sway: sw },
                    ],
                    e.p,
                    1
                );
            }
        }
    }
    __bandAdd(SR, barkMat);
    __bandAdd(SL, foliageMat);
    return { height: P.hoehe };
}

// DAS TOTHOLZ (liegender Stamm · Stumpf): das Rinden-Gesetz (buildTube) trägt die Borke, die Zersetzung
// schreibt sich in die Farbe — vergraute Borke, abgeplatzte Flecken mit blankem Holz, Moos auf der Oberseite —,
// die Enden sind gebrochen (Splitter) oder gesägt (Jahresringe), Aststummel ragen aus dem Stamm, Baumschwämme
// sitzen an der Flanke. L1: dasselbe Holz grob (das Rinden-Gesetz auf Fernstufen-Auflösung), Splitter flach.
function __holzEnde(geos, c, d, r, P, rnd12, gesaegt, colInnen, colRand) {
    // Ein Stamm-Ende: gesägt = flache Scheibe mit Jahresringen, sonst ein Splitterkranz (rnd12: 12 vorab gewürfelte
    // Splitter-Längen ∈ [0,1], dieselben auf jeder Stufe).
    const S = __bandSammler(),
        u = perp(d),
        v = vnorm(vcross(d, u)),
        L0 = __lod === 0;
    const N = L0 ? 12 : 6,
        mitte = __bandVert(S, vadd(c, vscl(d, gesaegt ? 0 : r * 0.25 * rnd12[0])), colInnen, 0.5, 0.5, 0, c, 0);
    const ringe = gesaegt && L0 ? 4 : 1;
    let vor = null;
    for (let k = 1; k <= ringe; k++) {
        const fr = k / ringe,
            idx = [];
        for (let j = 0; j < N; j++) {
            const a = (j / N) * 6.2831853,
                sp = gesaegt ? 0 : r * 0.55 * rnd12[(j * 12) / N] * (1 - (j % 2) * 0.6),
                rr = r * fr * 0.97,
                p = vadd(vadd(c, vadd(vscl(u, Math.cos(a) * rr), vscl(v, Math.sin(a) * rr))), vscl(d, sp));
            const col = gesaegt
                ? colInnen.clone().lerp(colRand, fr * 0.6).multiplyScalar(k % 2 ? 1.0 : 0.7)
                : colRand.clone().lerp(colInnen, 0.4 + 0.6 * rnd12[(j * 7) % 12]);
            idx.push(__bandVert(S, p, col, j / N, fr, 0, c, 0));
        }
        for (let j = 0; j < N; j++) {
            const j1 = (j + 1) % N;
            if (!vor) S.i.push(mitte, idx[j], idx[j1]);
            else S.i.push(vor[j], idx[j], idx[j1], vor[j], idx[j1], vor[j1]);
        }
        vor = idx;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(S.p, 3));
    g.setIndex(S.i);
    g.computeVertexNormals();
    g.setAttribute("aWind", new THREE.Float32BufferAttribute(S.w, 3));
    g.setAttribute("aCenter", new THREE.Float32BufferAttribute(S.ct, 3));
    g.setAttribute("aType", new THREE.Float32BufferAttribute(S.t, 1));
    g.setAttribute("color", new THREE.Float32BufferAttribute(S.c, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(S.uv, 2));
    geos.push(g);
}
// Die Zersetzung als Farbe: vergraut, blankes Holz in Flecken, Moos dort, wo die Fläche nach oben schaut.
function __holzZerfall(g, P, seed) {
    const pos = g.attributes.position,
        col = g.attributes.color;
    if (!pos || !col) return;
    g.computeVertexNormals();
    const nor = g.attributes.normal,
        grau = new THREE.Color(0x4e4a42),
        lGrau = 0.3 * grau.r + 0.59 * grau.g + 0.11 * grau.b,
        blank = vegFarbe(0x9a8a72),
        moos = vegFarbe(0x5a7a30);
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i),
            y = pos.getY(i),
            z = pos.getZ(i);
        const c = new THREE.Color(col.getX(i), col.getY(i), col.getZ(i));
        const l = 0.3 * c.r + 0.59 * c.g + 0.11 * c.b;
        c.lerp(grau.clone().multiplyScalar(l / lGrau), 0.35 * P.zerfall);
        const fleck = simplex3(x * 3.1 + seed, y * 3.1, z * 3.1);
        if (fleck > 0.42 - 0.25 * P.zerfall) c.lerp(blank, clamp((fleck - 0.3) * 2.2, 0, 0.6));
        const ny = nor.getY(i);
        if (ny > 0.25) {
            const mf = simplex3(x * 1.7 + 11, y * 1.7 + seed, z * 1.7) * 0.5 + 0.5;
            c.lerp(moos, clamp((ny - 0.25) * 1.6, 0, 1) * clamp(mf * 1.4 - 0.2, 0, 1) * (0.35 + 0.55 * P.zerfall));
        }
        col.setXYZ(i, c.r, c.g, c.b);
    }
    col.needsUpdate = true;
}
// Ein Baumschwamm: ein halbrunder Konsolen-Fächer an der Flanke (Ober- und Unterseite).
function __schwamm(geos, c, out, r) {
    const S = __bandSammler(),
        up = [0, 1, 0],
        s = vnorm(vcross(up, out)),
        top = vegFarbe(0x9a8060),
        rand = vegFarbe(0xc8b896),
        unten = vegFarbe(0xb8a88a);
    const m0 = __bandVert(S, vadd(c, [0, r * 0.12, 0]), top, 0.5, 0, 0, c, 0),
        m1 = __bandVert(S, vsub(c, [0, r * 0.05, 0]), unten, 0.5, 0, 0, c, 0),
        o = [],
        uu = [];
    for (let j = 0; j <= 6; j++) {
        const a = (j / 6) * Math.PI,
            p = vadd(c, vadd(vscl(s, Math.cos(a) * r), vscl(out, Math.sin(a) * r * 0.75)));
        o.push(__bandVert(S, vadd(p, [0, -r * 0.04, 0]), rand, j / 6, 1, 0, c, 0));
        uu.push(__bandVert(S, vadd(p, [0, -r * 0.1, 0]), unten, j / 6, 1, 0, c, 0));
    }
    for (let j = 0; j < 6; j++) {
        S.i.push(m0, o[j + 1], o[j]);
        S.i.push(m1, uu[j], uu[j + 1]);
        S.i.push(o[j], o[j + 1], uu[j + 1], o[j], uu[j + 1], uu[j]);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(S.p, 3));
    g.setIndex(S.i);
    g.computeVertexNormals();
    g.setAttribute("aWind", new THREE.Float32BufferAttribute(S.w, 3));
    g.setAttribute("aCenter", new THREE.Float32BufferAttribute(S.ct, 3));
    g.setAttribute("aType", new THREE.Float32BufferAttribute(S.t, 1));
    g.setAttribute("color", new THREE.Float32BufferAttribute(S.c, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(S.uv, 2));
    geos.push(g);
}
function emitTotholz(P) {
    const geos = [];
    const bA = new THREE.Color(P.barkA),
        bB = new THREE.Color(P.barkB),
        innen = vegFarbe(0x6e604c),
        rand = vegFarbe(0x9a8a70);
    const L0 = __lod === 0,
        tubeLod = L0 ? 0 : 2;
    const vok = { perp, vcross, vlen, vnorm, vsub, clamp, lerp, THREE };
    const rnd12 = (n) => {
        const a = [];
        for (let i = 0; i < n; i++) a.push(rnd());
        return a;
    };
    if (P.form === "stumpf") {
        // Der Stumpf: Wurzelanlauf mit Brettwurzel-Furchen (das Rinden-Gesetz, `_bphase`), Kappe gesägt oder gebrochen
        const h = P.hoehe,
            r = P.radius,
            Pt = Object.assign({}, P, { height: Math.max(h, 0.6), maxDepth: 1 });
        const kopf = rnd12(12),
            schwamm = [];
        for (let i = 0; i < P.pilze; i++) schwamm.push([rnd() * 6.2831853, rrange(0.25, 0.8), rrange(0.6, 1.1)]);
        const M = L0 ? 7 : 3,
            rings = [];
        rings.push({ c: [0, -r * 0.5, 0], r: r * 0.55, sway: 0, depth: 0, fuss: true });
        for (let i = 0; i <= M; i++) {
            const f = i / M,
                y = h * f;
            rings.push({ c: [0, y, 0], r: r * (1 + P.flare * 0.85 * Math.exp(-y / (h * 0.45 + 0.05))), sway: 0, depth: 0 });
        }
        __rindenGesetz().buildTubeGesetz(vok, geos, rings, Pt, bA, bB, r, false, undefined, tubeLod);
        __holzEnde(geos, [0, h, 0], [0, 1, 0], r * 0.98, P, kopf, P.saege, innen, rand);
        if (L0) for (const s of schwamm) __schwamm(geos, [Math.cos(s[0]) * r * 1.02, h * s[1], Math.sin(s[0]) * r * 1.02], [Math.cos(s[0]), 0, Math.sin(s[0])], r * 0.45 * s[2]);
        for (const g of geos) __holzZerfall(g, P, P._bphase);
        addMerged(geos, barkMat);
        // Die Wurzeln laufen aus dem Fuß in den Boden — das Wurzel-Gesetz des Baums (emitRoots), gemessen an der
        // Höhe des Baums, der hier stand.
        const Pw = Object.assign({}, P, { height: r * 10, _trunkR: r, roots: P.roots, barkA: P.barkA, barkB: P.barkB });
        emitRoots(Pw);
        return { height: h };
    }
    // Der liegende Stamm: leicht gebogen, zur Hälfte eingesunken, verjüngt; Wurzelende mit Anlauf
    const Lg = P.laenge,
        r = P.radius,
        Pt = Object.assign({}, P, { height: Lg, maxDepth: 1 });
    const bogen = rrange(-0.35, 0.35),
        senke = rrange(0.15, 0.32),
        kopfA = rnd12(12),
        kopfB = rnd12(12),
        st = [],
        schwamm = [];
    for (let i = 0; i < P.stummel; i++) st.push([rrange(0.2, 0.85), rrange(-1.2, 1.2), rrange(0.25, 0.7), rrange(0.18, 0.32)]);
    for (let i = 0; i < P.pilze; i++) schwamm.push([rrange(0.15, 0.85), rnd() < 0.5 ? -1 : 1, rrange(0.6, 1.1)]);
    const M = L0 ? 10 : 4,
        rings = [];
    const axis = (f) => [(f - 0.5) * Lg, r * (1 - senke) - Math.sin(Math.PI * f) * r * 0.12, Math.sin(Math.PI * f) * bogen * Lg * 0.08];
    for (let i = 0; i <= M; i++) {
        const f = i / M;
        rings.push({ c: axis(f), r: r * lerp(1.18, 0.74, f) * (f < 0.08 ? 1.12 : 1), sway: 0, depth: 0 });
    }
    __rindenGesetz().buildTubeGesetz(vok, geos, rings, Pt, bA, bB, r, true, 1, tubeLod);
    const dA = vnorm(vsub(axis(0), axis(0.05))),
        dB = vnorm(vsub(axis(1), axis(0.95)));
    __holzEnde(geos, axis(0), dA, r * 1.3, P, kopfA, false, innen, rand);
    __holzEnde(geos, axis(1), dB, r * 0.73, P, kopfB, false, innen, rand);
    // Aststummel (L1: nur der kräftigste)
    for (let k = 0; k < st.length; k++) {
        if (!L0 && k > 0) break;
        const s = st[k],
            c = axis(s[0]),
            rr = r * lerp(1.18, 0.74, s[0]),
            out = vnorm([0, Math.cos(s[1]), Math.sin(s[1])]),
            len = r * 2.2 * s[2] + 0.1,
            sr = rr * s[3];
        const sRings = [];
        for (let i = 0; i <= 3; i++) {
            const f = i / 3;
            sRings.push({ c: vadd(c, vscl(out, rr * 0.7 + len * f)), r: sr * (1 - f * 0.55), sway: 0, depth: 1 });
        }
        __rindenGesetz().buildTubeGesetz(vok, geos, sRings, Pt, bA, bB, r, true, 0.85, tubeLod);
        __holzEnde(geos, sRings[3].c, out, sr * 0.45, P, kopfA, false, innen, rand);
    }
    if (L0)
        for (const s of schwamm) {
            const c = axis(s[0]),
                rr = r * lerp(1.18, 0.74, s[0]);
            __schwamm(geos, vadd(c, [0, -rr * 0.15, s[1] * rr * 0.98]), [0, 0, s[1]], rr * 0.5 * s[2]);
        }
    for (const g of geos) __holzZerfall(g, P, P._bphase);
    addMerged(geos, barkMat);
    return { height: r * 2 };
}

// DIE GESTALT-TAFEL DES WALDBODENS: kind → Emitter. buildInstance UND das Labor (`build`) lesen dieselbe Tafel.
const WALDBODEN_EMIT = { fern: emitFern, reed: emitSchilf, brush: emitGestruepp, deadwood: emitTotholz };

// Das Totholz eines stehenden Baums (P.tot): die Krone ist gebrochen (der Stamm endet in der Bruch-Höhe in einem
// Splitterkranz), das Feinreisig ist abgefallen, kein Laub. Läuft NACH dem Wuchs — das Skelett und der rnd()-Strom
// sind die eines lebenden Baums derselben Art (FIX v35), die Stufen schneiden dasselbe Individuum.
function __totholzSchnitt(nodes, P) {
    const hB = nodes.height * P.totBruch,
        rMin = (nodes.trunkR || 0.1) * 0.16,
        hsh = (k, n) => {
            let h = Math.imul((k + 1) ^ 0x2c1b3c6d, 0x297a2d39) ^ Math.imul(n + 7, 0x5bd1e995) ^ Math.floor(SEED);
            h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
            return ((h ^ (h >>> 13)) >>> 0) / 4294967296;
        };
    const laeufe = new Map();
    for (const sg of nodes.segs) {
        if (Math.max(sg.r0, sg.r1) < rMin) continue;
        const k = sg.runId != null ? sg.runId : -1;
        if (!laeufe.has(k)) laeufe.set(k, []);
        laeufe.get(k).push(sg);
    }
    const reihe = [...laeufe.entries()].sort((x, y) => x[1][0].depth - y[1][0].depth);
    const out = [],
        brueche = [];
    const haengt = (p) => {
        for (const q of out) {
            const d = vsub(q.p1, q.p0),
                L2 = Math.max(1e-9, vdot(d, d)),
                t = clamp(vdot(vsub(p, q.p0), d) / L2, 0, 1),
                c = vadd(q.p0, vscl(d, t));
            if (vlen(vsub(p, c)) <= Math.max(q.r0, q.r1) * 1.6 + 0.03) return true;
        }
        return false;
    };
    for (const [k, lauf] of reihe) {
        const tief = lauf[0].depth;
        if (tief > 0 && !haengt(lauf[0].p0)) continue;
        let gesamt = 0;
        for (const sg of lauf) gesamt += vlen(vsub(sg.p1, sg.p0));
        const h = tief === 0 ? hB : hB * (0.72 + 0.6 * hsh(k, 1));
        const lMax = tief === 0 ? Infinity : gesamt * (tief >= 2 ? 0.25 + 0.55 * hsh(k, 2) : 0.55 + 0.45 * hsh(k, 2));
        let weg = 0;
        for (const sg of lauf) {
            if (sg.p0[1] >= h) break;
            const len = vlen(vsub(sg.p1, sg.p0));
            const tH = sg.p1[1] > h ? (h - sg.p0[1]) / Math.max(1e-6, sg.p1[1] - sg.p0[1]) : 1;
            const tL = weg + len > lMax ? (lMax - weg) / Math.max(1e-6, len) : 1;
            const t = Math.min(tH, tL);
            if (t < 1) {
                if (t <= 0.02) break;
                const c = Object.assign({}, sg, { p1: vlerp(sg.p0, sg.p1, t), r1: lerp(sg.r0, sg.r1, t) });
                out.push(c);
                brueche.push({ p: c.p1, d: vnorm(vsub(sg.p1, sg.p0)), r: c.r1 });
                break;
            }
            out.push(sg);
            weg += len;
        }
    }
    nodes.segs = out;
    nodes.leaves = [];
    nodes.brueche = brueche;
}
// Die Borke des Totholzes: vergraut, in Platten abgeblättert (blankes Holz darunter), dazu einzelne lose
// Rinden-Schuppen, die vom Stamm abstehen (eigener Hash-Strom — der rnd()-Strom bleibt der des Baums).
function __totholzRinde(barkGeos, nodes, P) {
    const PZ = Object.assign({}, P, { zerfall: 0.75 });
    for (const g of barkGeos) __holzZerfall(g, PZ, P._bphase || 0);
    if (__lod !== 0) return;
    const hr = mulberry32(((Math.floor(SEED) ^ 0x7a11) + 3) >>> 0),
        stamm = nodes.segs.filter((s) => s.depth === 0);
    if (!stamm.length) return;
    const S = __bandSammler(),
        aussen = vegFarbe(P.barkA),
        innen = vegFarbe(0x9a8a72);
    for (let k = 0; k < 14; k++) {
        const s = stamm[Math.floor(hr() * stamm.length)],
            f = hr(),
            c = vlerp(s.p0, s.p1, f),
            r = lerp(s.r0, s.r1, f),
            d = vnorm(vsub(s.p1, s.p0)),
            a = hr() * 6.2831853,
            u = perp(d),
            v = vnorm(vcross(d, u)),
            out = vnorm(vadd(vscl(u, Math.cos(a)), vscl(v, Math.sin(a)))),
            side = vnorm(vcross(d, out)),
            w = r * (0.5 + hr() * 0.6),
            hgt = r * (1.2 + hr() * 1.6),
            reihen = [];
        for (let q = 0; q <= 3; q++) {
            const t = q / 3,
                lift = r * 0.06 + t * t * r * 0.35,
                m = vadd(vadd(c, vscl(out, r * 1.02 + lift)), vscl(d, hgt * (t - 0.5)));
            reihen.push({
                pts: [vsub(m, vscl(side, w * 0.5)), m, vadd(m, vscl(side, w * 0.5))],
                col: aussen.clone().lerp(innen, t * 0.4),
                v: t,
                sway: 0,
            });
        }
        __band(S, reihen, c, 0);
    }
    if (S.n) {
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(S.p, 3));
        g.setIndex(S.i);
        g.computeVertexNormals();
        g.setAttribute("aWind", new THREE.Float32BufferAttribute(S.w, 3));
        g.setAttribute("aCenter", new THREE.Float32BufferAttribute(S.ct, 3));
        g.setAttribute("aType", new THREE.Float32BufferAttribute(S.t, 1));
        g.setAttribute("color", new THREE.Float32BufferAttribute(S.c, 3));
        g.setAttribute("uv", new THREE.Float32BufferAttribute(S.uv, 2));
        barkGeos.push(g);
    }
}

function ridged(p, oct, off) {
    let f = 1,
        a = 0.5,
        s = 0,
        nrm = 0;
    for (let i = 0; i < oct; i++) {
        const v = 1 - Math.abs(simplex3(p[0] * f + off, p[1] * f + off * 1.7, p[2] * f + off * 2.3));
        s += a * v * v;
        nrm += a;
        a *= 0.5;
        f *= 2.0;
    }
    return s / nrm;
}

function buildBoulder(P) {
    // DER GETEILTE SAMEN: das Fels-Rezept lebt in phyto-core.js (buildBoulderGeometry) —
    // dieselbe EINE Quelle, die AnazhRealm liest. Ein Edit dort fliesst hierher UND nach
    // AnazhRealm. detail+1, weil phyto-core intern (detail-1) rechnet → identische Silhouette.
    // Fallback auf den Inline-Bau, falls der Samen (noch) nicht geladen ist.
    var __core = typeof self !== "undefined" && self.__phytoCore;
    if (__core && typeof __core.buildBoulderGeometry === "function") {
        var __d = Math.max(1, (P.detail || 6) - 3 - __lod * 2);
        var __g = __core.buildBoulderGeometry(
            THREE,
            simplex3,
            {
                elong: P.elong,
                sph: P.sph,
                round: P.round,
                rough: P.rough,
                strat: P.strat,
                seed: P.seed,
                detail: __d + 1,
                size: P.size,
                withColor: true,
                speckle: P.speckle,
                rockLichen: rockLichen,
                rockA: P.rockA,
                rockB: P.rockB,
                rockC: P.rockC,
            },
            rnd
        );
        if (__g) return __g;
    }
    const detail = Math.max(1, (P.detail || 6) - 3 - __lod * 2); // Stein nicht scharf in der Natur -> Budget zum Stamm
    let geo = THREE.BufferGeometryUtils.mergeVertices(new THREE.IcosahedronGeometry(1, detail));
    const pos = geo.attributes.position,
        n = pos.count,
        idx = geo.index.array;
    const adj = Array.from({ length: n }, () => new Set());
    for (let i = 0; i < idx.length; i += 3) {
        const a = idx[i],
            b = idx[i + 1],
            c = idx[i + 2];
        adj[a].add(b);
        adj[a].add(c);
        adj[b].add(a);
        adj[b].add(c);
        adj[c].add(a);
        adj[c].add(b);
    }
    const sx = 1 + 0.75 * P.elong,
        sz = 1 - 0.35 * P.elong,
        sy = 1 - 0.62 * (1 - P.sph),
        off = P.seed * 13.7;
    const V = [],
        dn = [];
    for (let i = 0; i < n; i++) {
        const x = pos.getX(i),
            y = pos.getY(i),
            z = pos.getZ(i);
        dn.push(vnorm([x, y, z]));
        V.push([x * sx, y * sy, z * sz]);
    }
    const ampF = 0.12 + P.rough * 0.34,
        ridgeW = 1 - P.round * 0.6;
    for (let i = 0; i < n; i++) {
        const p = V[i];
        const base = fbm3([p[0] * 1.05, p[1] * 1.05, p[2] * 1.05], 4, 2.0, 0.5, off);
        const base2 = fbm3([p[0] * 2.2, p[1] * 2.2, p[2] * 2.2], 3, 2.0, 0.5, off + 2.2);
        const rg = ridged([p[0] * 1.8, p[1] * 1.8, p[2] * 1.8], 4, off + 5.1);
        const grain = fbm3([p[0] * 7.0, p[1] * 7.0, p[2] * 7.0], 3, 2.0, 0.5, off + 11.3);
        const sDamp = P.strat > 0.5 ? 0.55 : 1.0; // Sediment: 3D-Lumpiness daempfen, Baenke dominieren
        let disp =
            ampF * sDamp * (0.62 * base + 0.16 * base2 + 0.6 * (rg - 0.5) * ridgeW) + grain * ampF * 0.42 * sDamp;
        if (P.strat > 0.02) {
            const step = Math.sin(V[i][1] * 7.6 + off);
            disp += (step > 0.22 ? 0.16 : step < -0.22 ? -0.12 : step * 0.22) * P.strat;
        } // klare horizontale Baenke, Differenzialerosion
        V[i] = vadd(V[i], vscl(dn[i], disp));
    }
    const K = P.round < 0.55 ? Math.round(((0.55 - P.round) / 0.55) * 6) : 0;
    for (let pl = 0; pl < K; pl++) {
        let pn;
        if (P.strat > 0.5) pn = vnorm([rrange(-0.3, 0.3), (rnd() < 0.5 ? 1 : -1) * rrange(0.7, 1), rrange(-0.3, 0.3)]);
        else pn = vnorm([rrange(-1, 1), rrange(-1, 0.6), rrange(-1, 1)]);
        const d0 = rrange(0.58, 0.86);
        for (let i = 0; i < n; i++) {
            const dd = vdot(V[i], pn) - d0;
            if (dd > 0) V[i] = vsub(V[i], vscl(pn, dd * 0.95));
        }
    }
    if (P.round > 0.78) {
        const NV = V.map((v, i) => {
            let a = vscl(v, 3),
                c = 3;
            adj[i].forEach((j) => {
                a = vadd(a, V[j]);
                c++;
            });
            return vscl(a, 1 / c);
        });
        for (let i = 0; i < n; i++) V[i] = NV[i];
    }
    for (let i = 0; i < n; i++) pos.setXYZ(i, V[i][0], V[i][1], V[i][2]);
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    const nor = geo.attributes.normal;
    const ao = new Float32Array(n);
    for (let i = 0; i < n; i++) {
        let mean = [0, 0, 0],
            c = 0;
        adj[i].forEach((j) => {
            mean = vadd(mean, V[j]);
            c++;
        });
        mean = vscl(mean, 1 / c);
        const toMean = vsub(mean, V[i]),
            nv = [nor.getX(i), nor.getY(i), nor.getZ(i)];
        ao[i] = clamp(0.5 + vdot(vnorm(toMean), nv) * 1.2, 0.12, 1);
    }
    const cols = new Float32Array(n * 3),
        base = new THREE.Color(P.rockA),
        dark = new THREE.Color(P.rockB),
        acc = new THREE.Color(P.rockC);
    const quartz = new THREE.Color(0xe8e0d2),
        feld = new THREE.Color(0xc69a86),
        mica = new THREE.Color(0x2c2a26),
        bleach = new THREE.Color(0xccc7b6),
        moss = vegFarbe(0x6f8a3e),
        iron = new THREE.Color(0x7a4a26);
    let minY = 1e9,
        maxY = -1e9;
    for (let i = 0; i < n; i++) {
        minY = Math.min(minY, V[i][1]);
        maxY = Math.max(maxY, V[i][1]);
    }
    let s2 = mulberry32(Math.floor(P.seed * 9973));
    for (let i = 0; i < n; i++) {
        let c = base.clone();
        const up = nor.getY(i);
        if (P.speckle) {
            const m = s2();
            if (m < 0.14) c.lerp(quartz, 0.6);
            else if (m < 0.26) c.lerp(feld, 0.45);
            else if (m < 0.34) c.lerp(mica, 0.65);
        } // Granit Salz&Pfeffer
        c.lerp(dark, ao[i] * 0.7); // AO in Mulden
        if (ao[i] < 0.42 && up > 0.1) c.lerp(bleach, ((0.42 - ao[i]) / 0.42) * 0.4 * clamp(up, 0, 1)); // Kuppen sonnengebleicht
        if (P.strat > 0.02) {
            const band = Math.sin(V[i][1] * 7.0 + off);
            if (band > 0.4) c.lerp(acc, 0.55 * P.strat);
            else if (band < -0.4) c.lerp(dark, 0.6 * P.strat);
        }
        const stain = fbm3([V[i][0] * 1.4, V[i][1] * 3.2, V[i][2] * 1.4], 3, 2, 0.5, off + 21.0);
        if (stain > 0.22) c.lerp(iron, (stain - 0.22) * 0.6); // Eisen-Schlieren (vertikal)
        if (up > 0.22 && rockLichen > 0) {
            const patch = fbm3([V[i][0] * 2.4, V[i][1] * 2.4, V[i][2] * 2.4], 3, 2, 0.5, off + 33.0);
            const lf = clamp((up - 0.22) / 0.5, 0, 1) * rockLichen;
            if (patch > -0.05) c.lerp(moss, clamp((patch + 0.05) * 1.8, 0, 1) * lf * 0.6);
        }
        const mott = fbm3([V[i][0] * 0.8, V[i][1] * 0.8, V[i][2] * 0.8], 3, 2, 0.5, off + 7.7);
        c.multiplyScalar(1 + mott * 0.22);
        c.multiplyScalar(0.88 + s2() * 0.22);
        cols[i * 3] = c.r;
        cols[i * 3 + 1] = c.g;
        cols[i * 3 + 2] = c.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    geo.scale(P.size, P.size, P.size);
    return geo;
}

function clipPolygon(poly, a, b) {
    const out = [];
    const nx = b[0] - a[0],
        nz = b[1] - a[1],
        mx = (a[0] + b[0]) / 2,
        mz = (a[1] + b[1]) / 2;
    const side = (pt) => (pt[0] - mx) * nx + (pt[1] - mz) * nz;
    for (let i = 0; i < poly.length; i++) {
        const cur = poly[i],
            prv = poly[(i + poly.length - 1) % poly.length];
        const sc = side(cur),
            sp = side(prv);
        if (sc < 0) {
            if (sp >= 0) {
                const t = sp / (sp - sc);
                out.push([prv[0] + (cur[0] - prv[0]) * t, prv[1] + (cur[1] - prv[1]) * t]);
            }
            out.push(cur);
        } else if (sp < 0) {
            const t = sp / (sp - sc);
            out.push([prv[0] + (cur[0] - prv[0]) * t, prv[1] + (cur[1] - prv[1]) * t]);
        }
    }
    return out;
}

function emitColumns(P) {
    const cellMul = P.amtMul || 1,
        ncells = Math.max(8, Math.round(P.cells * cellMul)),
        R = P.fieldR * Math.sqrt(cellMul),
        geos = []; // amtMul: ANZAHL skaliert, Durchmesser konstant (R~sqrt -> sp invariant)
    const BB = R * 1.5,
        boxP = [
            [-BB, -BB],
            [BB, -BB],
            [BB, BB],
            [-BB, BB],
        ],
        Rk = R * 0.82; // ganze Zellen, Rand folgt Zellkanten (Wabe)
    let seeds = [];
    const sp = (R / Math.sqrt(ncells)) * 1.95,
        dyh = sp * 0.866;
    let row = 0;
    for (let y = -R - sp; y <= R + sp; y += dyh) {
        const xo = (row & 1) * sp * 0.5;
        for (let x = -R - sp; x <= R + sp; x += sp) {
            const px = x + xo + (rnd() - 0.5) * sp * 0.1,
                pz = y + (rnd() - 0.5) * sp * 0.1;
            if (px * px + pz * pz <= R * R) seeds.push([px, pz]);
        }
        row++;
    }
    const N = seeds.length;
    for (let it = 0; it < 1; it++) {
        // 1 Lloyd -> saubere Sechsecke
        const cells = seeds.map(() => null);
        for (let i = 0; i < N; i++) {
            let poly = boxP.map((q) => q.slice());
            for (let j = 0; j < N; j++) {
                if (j === i) continue;
                poly = clipPolygon(poly, seeds[i], seeds[j]);
                if (poly.length < 3) break;
            }
            cells[i] = poly;
        }
        seeds = cells.map((poly, i) => {
            if (!poly || poly.length < 3) return seeds[i];
            let cx = 0,
                cz = 0;
            for (const q of poly) {
                cx += q[0];
                cz += q[1];
            }
            return [cx / poly.length, cz / poly.length];
        });
    }
    const baseCol = new THREE.Color(P.rockA),
        topCol = new THREE.Color(P.rockC),
        dark = new THREE.Color(P.rockB);
    for (let i = 0; i < N; i++) {
        if (seeds[i][0] * seeds[i][0] + seeds[i][1] * seeds[i][1] > Rk * Rk) continue; // nur innere Zellen -> Zellkanten-Rand
        let poly = boxP.map((q) => q.slice());
        for (let j = 0; j < N; j++) {
            if (j === i) continue;
            poly = clipPolygon(poly, seeds[i], seeds[j]);
            if (poly.length < 3) break;
        }
        if (poly.length < 3) continue;
        let cx = 0,
            cz = 0;
        for (const q of poly) {
            cx += q[0];
            cz += q[1];
        }
        cx /= poly.length;
        cz /= poly.length;
        const dC = Math.hypot(cx, cz) / R,
            hF = clamp(0.82 + 0.3 * fbm2(cx * 0.55 + 5, cz * 0.55), 0.55, 1.0),
            broken = rnd() < 0.12 ? rrange(0.45, 0.7) : 1.0,
            h = P.colH * (1 - dC * 0.16) * hF * broken * rrange(0.95, 1.05),
            M = poly.length;
        const positions = [],
            idx = [],
            cols = [];
        let vb = 0;
        const topY = poly.map(() => h + (rnd() - 0.5) * P.colH * 0.06);
        for (let s = 0; s < M; s++) {
            const q0 = poly[s],
                q1 = poly[(s + 1) % M],
                t0 = topY[s],
                t1 = topY[(s + 1) % M];
            const b0 = [q0[0], 0, q0[1]],
                b1 = [q1[0], 0, q1[1]],
                u0 = [q0[0], t0, q0[1]],
                u1 = [q1[0], t1, q1[1]];
            positions.push(b0[0], b0[1], b0[2], b1[0], b1[1], b1[2], u1[0], u1[1], u1[2], u0[0], u0[1], u0[2]);
            idx.push(vb, vb + 1, vb + 2, vb, vb + 2, vb + 3);
            const cf = baseCol.clone().lerp(dark, rrange(0.15, 0.5));
            for (let q = 0; q < 4; q++) {
                const top = q >= 2;
                cols.push(...(top ? cf.clone().lerp(topCol, 0.25).toArray() : cf.toArray()));
            }
            vb += 4;
        }
        const capStart = vb;
        positions.push(cx, h + P.colH * 0.03, cz);
        const ctop = baseCol.clone().lerp(topCol, 0.5);
        if (rockLichen > 0) ctop.lerp(vegFarbe(0x768a44), 0.4 * rockLichen);
        cols.push(...ctop.toArray());
        vb++;
        for (let s = 0; s < M; s++) {
            const q = poly[s];
            positions.push(q[0], topY[s], q[1]);
            cols.push(...ctop.toArray());
            vb++;
        }
        for (let s = 0; s < M; s++) idx.push(capStart, capStart + 1 + s, capStart + 1 + ((s + 1) % M));
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
        g.setIndex(idx);
        g.computeVertexNormals();
        g.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
        geos.push(g);
    }
    let merged = null;
    try {
        merged = THREE.BufferGeometryUtils.mergeBufferGeometries(geos, false);
    } catch (e) {}
    if (merged) {
        const mat = new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: P.matRough,
            metalness: 0.04,
            flatShading: true,
            envMapIntensity: 0.5,
            side: THREE.DoubleSide,
        });
        const m = new THREE.Mesh(merged, mat);
        if (P.tilt) m.rotation.z = P.tilt;
        subject.add(m);
    }
    return { bbox: true };
}

function emitScree(P) {
    const _cm = P.amtMul || 1,
        spread = Math.sqrt(_cm),
        fR = P.fieldR * spread,
        heapH = fR * 0.55; // amtMul: ANZAHL Schutt skaliert, Flaeche ~sqrt -> Einzelstein konstant
    for (let i = 0, _NC = Math.round(P.count * _cm * (__lod === 0 ? 0.6 : __lod === 1 ? 0.4 : 0.22)); i < _NC; i++) {
        const a = rnd() * 6.28,
            rr = Math.pow(rnd(), 0.5) * fR;
        const sz = lerp(P.size * 0.5, P.size * 0.16, Math.pow(rr / fR, 0.7)) * rrange(0.8, 1.2); // gross unten/aussen, Einzelgroesse unabh. von amtMul
        const y = (1 - rr / fR) * heapH * rrange(0.7, 1.0); // Kegel (Schuettwinkel)
        const sub = {
            size: sz,
            detail: 3,
            sph: P.sph,
            elong: P.elong,
            round: P.round,
            rough: P.rough,
            strat: P.strat * 0.4,
            rockA: P.rockA,
            rockB: P.rockB,
            rockC: P.rockC,
            speckle: P.speckle,
            seed: P.seed + i * 3.13,
        };
        const geo = buildBoulder(sub);
        const mat = new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: P.matRough,
            metalness: 0.02,
            flatShading: P.round < 0.5,
            envMapIntensity: 0.5,
        });
        const m = new THREE.Mesh(geo, mat);
        m.position.set(Math.cos(a) * rr, y, Math.sin(a) * rr);
        m.rotation.set(rnd() * 6.28, rnd() * 6.28, rnd() * 6.28);
        subject.add(m);
    }
    return { bbox: true };
}

function pushCrystal(geos, base, dir, len, rad, cB, cT) {
    // DER GETEILTE SAMEN: das Kristall-Prisma lebt in phyto-core.js (buildCrystalPointGeometry) —
    // dieselbe EINE Quelle, die AnazhRealm liest. Das kanonische y-aufrechte Prisma (bottomCap:false
    // = Vorlage-treu, kein Boden-Deckel) wird von y-up nach `dir` orientiert (Quaternion) + so
    // verschoben, dass der Fuss bei `base` liegt (Apex bei base+len·dir). Prisma-FORM (Länge/Schulter
    // shF=0.70/Radius/Facetten/Farbe Fuss→Spitze) ist identisch zur Vorlage; nur die azimutale
    // Facetten-Ausrichtung um die Achse folgt dem Quaternion statt perp(d) — ein 6-zähliger Spin
    // um die Eigenachse = derselbe Kristall (jeder ist ohnehin zufällig gedreht). cB/cT sind
    // [r,g,b] 0..1 → hex. Fallback → Inline.
    const _core = typeof self !== "undefined" && self.__phytoCore;
    if (_core && typeof _core.buildCrystalPointGeometry === "function") {
        const _hx = (c) => (Math.round(c[0] * 255) << 16) | (Math.round(c[1] * 255) << 8) | Math.round(c[2] * 255);
        const geo = _core.buildCrystalPointGeometry(THREE, {
            facets: 6,
            rX: rad,
            rZ: rad,
            length: len,
            termFrac: 0.3,
            shoulderScale: 0.9,
            angleOffset: 0.26,
            bottomCap: false,
            withColor: true,
            colBase: _hx(cB),
            colTip: _hx(cT),
        });
        if (geo) {
            const _d = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();
            // r128-BufferGeometry hat KEIN applyQuaternion (nur applyMatrix4) — die Rotation als
            // Matrix4 anwenden (sonst TypeError -> 0 Kristall-Geometrie, im Portal UND im Foundry).
            geo.applyMatrix4(
                new THREE.Matrix4().makeRotationFromQuaternion(
                    new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), _d)
                )
            );
            geo.translate(base[0] + _d.x * len * 0.5, base[1] + _d.y * len * 0.5, base[2] + _d.z * len * 0.5);
            geos.push(geo);
            return;
        }
    }
    const d = vnorm(dir),
        u = perp(d),
        v = vnorm(vcross(d, u)),
        M = 6,
        shF = 0.7;
    const ringAt = (t, rr) => {
        const c = vadd(base, vscl(d, len * t)),
            a = [];
        for (let k = 0; k < M; k++) {
            const an = (k / M) * 6.2831 + 0.26;
            a.push(vadd(vadd(c, vscl(u, Math.cos(an) * rr)), vscl(v, Math.sin(an) * rr)));
        }
        return a;
    };
    const b = ringAt(0, rad),
        sh = ringAt(shF, rad * 0.9),
        apex = vadd(base, vscl(d, len));
    const pos = [],
        idx = [],
        cols = [];
    let vb = 0;
    for (let k = 0; k < M; k++) {
        const k2 = (k + 1) % M;
        pos.push(
            b[k][0],
            b[k][1],
            b[k][2],
            b[k2][0],
            b[k2][1],
            b[k2][2],
            sh[k2][0],
            sh[k2][1],
            sh[k2][2],
            sh[k][0],
            sh[k][1],
            sh[k][2]
        );
        idx.push(vb, vb + 1, vb + 2, vb, vb + 2, vb + 3);
        for (let q = 0; q < 4; q++) cols.push(cB[0], cB[1], cB[2]);
        vb += 4;
    }
    const ai = vb;
    pos.push(apex[0], apex[1], apex[2]);
    cols.push(cT[0], cT[1], cT[2]);
    vb++;
    const ss = vb;
    for (let k = 0; k < M; k++) {
        pos.push(sh[k][0], sh[k][1], sh[k][2]);
        cols.push(cT[0], cT[1], cT[2]);
        vb++;
    }
    for (let k = 0; k < M; k++) idx.push(ai, ss + k, ss + ((k + 1) % M));
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    g.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
    geos.push(g);
}

function emitCrystals(P) {
    const cm = P.amtMul || 1,
        spread = Math.sqrt(cm),
        N = Math.max(4, Math.round((P.count || 18) * cm)),
        geos = [];
    const cB = new THREE.Color(P.rockA).toArray(),
        cT = new THREE.Color(P.rockC).toArray(),
        dk = new THREE.Color(P.rockB).toArray(); // amtMul: ANZAHL skaliert, Cluster-Flaeche ~sqrt -> Einzelkristall konstant
    const baseGeo = THREE.BufferGeometryUtils.mergeVertices(new THREE.IcosahedronGeometry(P.size * 0.42 * spread, 1));
    baseGeo.deleteAttribute("uv");
    const bp = baseGeo.attributes.position;
    for (let i = 0; i < bp.count; i++) {
        bp.setY(i, Math.min(bp.getY(i), P.size * 0.1 * spread));
    }
    const bcol = [];
    for (let i = 0; i < bp.count; i++) bcol.push(dk[0], dk[1], dk[2]);
    baseGeo.setAttribute("color", new THREE.Float32BufferAttribute(bcol, 3));
    baseGeo.computeVertexNormals();
    geos.push(baseGeo);
    for (let i = 0; i < N; i++) {
        const a = rnd() * 6.2831,
            tilt = rrange(0.0, 0.85);
        const dir = [Math.sin(tilt) * Math.cos(a), Math.cos(tilt), Math.sin(tilt) * Math.sin(a)];
        const rr = rrange(0, P.size * 0.45 * spread),
            base = [Math.cos(a) * rr, P.size * 0.04 + rrange(0, P.size * 0.07), Math.sin(a) * rr];
        const len = P.size * rrange(0.42, 1.25),
            rad = len * rrange(0.1, 0.19);
        pushCrystal(geos, base, dir, len, rad, cB, cT);
    }
    let merged = null;
    try {
        merged = THREE.BufferGeometryUtils.mergeBufferGeometries(geos, false);
    } catch (e) {
        console.error("crystal merge", e.message);
    }
    if (merged) {
        const mat = new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.16,
            metalness: 0.28,
            flatShading: true,
            envMapIntensity: 0.95,
        });
        subject.add(new THREE.Mesh(merged, mat));
    }
    return { bbox: true };
}

function emitRock(P) {
    if (P.kind === "columns") return emitColumns(P);
    if (P.kind === "scree") return emitScree(P);
    if (P.kind === "crystal") return emitCrystals(P);
    const geo = buildBoulder(P);
    const mat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: P.matRough,
        metalness: 0.02,
        flatShading: P.round < 0.45,
        envMapIntensity: 0.5,
    });
    const m = new THREE.Mesh(geo, mat);
    subject.add(m);
    return { bbox: true };
}

const SHAPE = {
    oak: { m: 9, n1: 0.7, n2: 0.6, n3: 0.6, a: 1, b: 1, wsc: 0.42 }, // gelappt
    ovate: { m: 2, n1: 1.0, n2: 1.0, n3: 1.0, a: 1, b: 1, wsc: 0.4 }, // eiförmig
    lance: { m: 2, n1: 1.0, n2: 1.0, n3: 1.0, a: 1, b: 1, wsc: 0.18 }, // lanzettlich (Weide)
    petal: { m: 2, n1: 1.0, n2: 1.0, n3: 1.0, a: 1, b: 1, wsc: 0.28 },
};

const PRESETS = {
    eiche: {
        kind: "tree",
        panel: "plant",
        s: { api: 0.3, delta: 2.3, slim: 0.45, trop: -0.15, leaf: 0.6 },
        fx: {
            barkType: "oak",
            height: 6.2,
            conifer: false,
            barkA: 0x3a2c1e,
            barkB: 0x6a5a44,
            leafCol: 0x4a7a2c,
            leafShape: "oak",
            maxDepth: 9,
            windGain: 0.9,
            roots: 5,
            flare: 0.18,
        },
    },
    fichte: {
        kind: "tree",
        panel: "plant",
        s: { api: 0.92, delta: 2.05, slim: 0.72, trop: 0.1, leaf: 0.7 },
        fx: {
            barkType: "conifer",
            height: 7.6,
            conifer: true,
            barkA: 0x4a2c1a,
            barkB: 0x6a4a30,
            leafCol: 0x2e5526,
            leafShape: "lance",
            maxDepth: 9,
            windGain: 0.5,
            coniferDroop: 0.22,
            roots: 4,
            flare: 0.12,
        },
    },
    birke: {
        kind: "tree",
        panel: "plant",
        s: { api: 0.55, delta: 2.2, slim: 0.78, trop: 0.42, leaf: 0.42 },
        fx: {
            barkType: "birch",
            height: 6.4,
            conifer: false,
            barkA: 0xe6e6dc,
            barkB: 0xf2f2ea,
            leafCol: 0x8ab84a,
            leafShape: "ovate",
            maxDepth: 10,
            windGain: 1.2,
            roots: 3,
            flare: 0.1,
        },
    },
    weide: {
        kind: "tree",
        panel: "plant",
        s: { api: 0.3, delta: 2.3, slim: 0.55, trop: 0.9, leaf: 0.8 },
        fx: {
            barkType: "willow",
            height: 5.8,
            conifer: false,
            barkA: 0x4a3a26,
            barkB: 0x6a5a3e,
            leafCol: 0x7aa83a,
            leafShape: "lance",
            maxDepth: 10,
            windGain: 1.6,
            roots: 5,
            flare: 0.15,
        },
    },
    mammut: {
        kind: "tree",
        panel: "plant",
        s: { api: 0.95, delta: 2.35, slim: 0.18, trop: 0.05, leaf: 0.88 },
        fx: {
            barkType: "sequoia",
            height: 15.0,
            conifer: true,
            coniferDroop: 0.1,
            crownBase: 0.38,
            flare: 0.8,
            roots: 7,
            barkA: 0x7a3b22,
            barkB: 0x9a5a38,
            leafCol: 0x3a5a30,
            leafShape: "lance",
            maxDepth: 10,
            windGain: 0.4,
        },
    },
    tanne: {
        kind: "tree",
        panel: "plant",
        s: { api: 0.9, delta: 2.1, slim: 0.74, trop: 0.05, leaf: 0.78 },
        fx: {
            barkType: "conifer",
            height: 8.6,
            conifer: true,
            coniferDroop: -0.05,
            crownBase: 0.12,
            flare: 0.22,
            roots: 4,
            barkA: 0x4a3a2a,
            barkB: 0x6a5a42,
            leafCol: 0x2e5a30,
            leafShape: "lance",
            maxDepth: 9,
            windGain: 0.5,
        },
    },
    strauch: {
        kind: "shrub",
        panel: "plant",
        s: { api: 0.1, delta: 2.4, slim: 0.3, trop: -0.05, leaf: 0.8 },
        fx: {
            barkType: "smooth",
            height: 2.1,
            conifer: false,
            basalStems: 5,
            barkA: 0x3a2c1e,
            barkB: 0x5a4a34,
            leafCol: 0x4a7a2c,
            leafShape: "ovate",
            maxDepth: 7,
            windGain: 1.1,
            roots: 4,
            flare: 0.1,
        },
    },
    blume: {
        kind: "flower",
        panel: "plant",
        s: { api: 0.5, delta: 2.3, slim: 0.5, trop: 0.0, leaf: 0.55 },
        fx: { flowerCol: 0xf2efe6, petalShape: "petal" },
    },
    gras: { kind: "grass", panel: "plant", s: { api: 0.5, delta: 2.3, slim: 0.5, trop: 0.2, leaf: 0.7 }, fx: {} },
    findling: {
        kind: "rock",
        panel: "rock",
        s: { sph: 0.66, elong: 0.22, rnd: 0.42, rgh: 0.55, str: 0.1, gen: 0.55 },
        fx: {
            // FELS-HÜLLE (18.07., gemessen im Worker über 4 Varianten, +5%):
            // die Kollisions-Hülle der Studio-Gestalt — der Welt-Blocker liest sie.
            huelle: { rx: 2.7, rz: 1.9, y1: 1.8 },
            rkind: "boulder",
            size: 1.6,
            rockA: 0x8a8278,
            rockB: 0x4a463e,
            rockC: 0x9a9286,
            speckle: true,
            matRough: 0.85,
            detail: 6,
        },
    },
    basalt: {
        kind: "rock",
        panel: "rock",
        s: { sph: 0.5, elong: 0.3, rnd: 0.3, rgh: 0.4, str: 0.2, gen: 0.32 },
        fx: {
            // FELS-HÜLLE (18.07., gemessen im Worker über 4 Varianten, +5%):
            // die Kollisions-Hülle der Studio-Gestalt — der Welt-Blocker liest sie.
            huelle: { rx: 1.9, rz: 1.9, y1: 4.7 },
            rkind: "columns",
            rockA: 0x33363a,
            rockB: 0x202327,
            rockC: 0x515a50,
            fieldR: 1.85,
            cells: 80,
            colH: 2.5,
            tilt: 0.03,
            matRough: 0.8,
        },
    },
    sediment: {
        kind: "rock",
        panel: "rock",
        s: { sph: 0.3, elong: 0.4, rnd: 0.3, rgh: 0.5, str: 0.85, gen: 0.6 },
        fx: {
            // FELS-HÜLLE (18.07., gemessen im Worker über 4 Varianten, +5%):
            // die Kollisions-Hülle der Studio-Gestalt — der Welt-Blocker liest sie.
            huelle: { rx: 2.6, rz: 1.8, y1: 1.3 },
            rkind: "boulder",
            size: 1.9,
            rockA: 0xb09870,
            rockB: 0x70583a,
            rockC: 0xc8b48a,
            speckle: false,
            matRough: 0.9,
            detail: 6,
        },
    },
    zacken: {
        kind: "rock",
        panel: "rock",
        s: { sph: 0.4, elong: 0.6, rnd: 0.12, rgh: 0.6, str: 0.1, gen: 0.55 },
        fx: {
            // FELS-HÜLLE (18.07., gemessen im Worker über 4 Varianten, +5%):
            // die Kollisions-Hülle der Studio-Gestalt — der Welt-Blocker liest sie.
            huelle: { rx: 2.6, rz: 1.6, y1: 1.3 },
            rkind: "boulder",
            size: 1.7,
            rockA: 0x6a6660,
            rockB: 0x363430,
            rockC: 0x7a7670,
            speckle: true,
            matRough: 0.8,
            detail: 6,
        },
    },
    geroell: {
        kind: "rock",
        panel: "rock",
        s: { sph: 0.45, elong: 0.4, rnd: 0.25, rgh: 0.55, str: 0.1, gen: 0.85 },
        fx: {
            // FELS-HÜLLE (18.07., gemessen im Worker über 4 Varianten, +5%):
            // die Kollisions-Hülle der Studio-Gestalt — der Welt-Blocker liest sie.
            huelle: { rx: 2.1, rz: 2.1, y1: 1.9 },
            rkind: "scree",
            size: 1.8,
            rockA: 0x7a7268,
            rockB: 0x403a32,
            rockC: 0x8a8278,
            speckle: true,
            count: 26,
            fieldR: 1.8,
            matRough: 0.85,
        },
    },
    kristalle: {
        kind: "rock",
        panel: "rock",
        s: { sph: 0.5, elong: 0.5, rnd: 0.3, rgh: 0.4, str: 0.1, gen: 0.1 },
        fx: {
            // FELS-HÜLLE (18.07., gemessen im Worker über 4 Varianten, +5%):
            // die Kollisions-Hülle der Studio-Gestalt — der Welt-Blocker liest sie.
            huelle: { rx: 3.1, rz: 2.2, y1: 3.3 },
            rkind: "crystal",
            size: 2.4,
            count: 20,
            rockA: 0x8a5ac8,
            rockB: 0x342c3c,
            rockC: 0xc8b0e8,
            matRough: 0.16,
        },
    },
    // ═══ DER WALDBODEN (04.10.) — die Arten unter und zwischen den Bäumen (Gestalt: WALDBODEN_EMIT) ═══
    farn: {
        kind: "fern",
        panel: "plant",
        s: { api: 0.55, delta: 2.3, slim: 0.5, trop: 0.4, leaf: 0.62 },
        fx: { leafCol: 0x3f6f2a, tipCol: 0x7aa244 },
    },
    schilf: {
        kind: "reed",
        panel: "plant",
        s: { api: 0.75, delta: 2.3, slim: 0.55, trop: 0.25, leaf: 0.6 },
        fx: { leafCol: 0x5e7e36, rispeCol: 0x6a4a40 },
    },
    gestruepp: {
        kind: "brush",
        panel: "plant",
        s: { api: 0.3, delta: 2.4, slim: 0.45, trop: 0.55, leaf: 0.6 },
        fx: { barkA: 0x5a3a30, barkB: 0x6e4e3e, leafCol: 0x355626 },
    },
    totstamm: {
        kind: "deadwood",
        panel: "plant",
        s: { api: 0.5, delta: 2.3, slim: 0.5, trop: 0.3, leaf: 0.5 },
        fx: { form: "liegend", barkA: 0x3c3226, barkB: 0x5c5244 },
    },
    stumpf: {
        kind: "deadwood",
        panel: "plant",
        s: { api: 0.5, delta: 2.3, slim: 0.4, trop: 0.2, leaf: 0.55 },
        fx: { form: "stumpf", barkA: 0x3a2c1e, barkB: 0x5a4a38 },
    },
    // Die Buche: glatte graue Rinde, ganzrandiges Blatt, breite Kuppel (die Mammut-Nische des Wald-Generators heißt
    // seit 04.10. baum_mammut — baum_buche ist die Buche). Buche · Karst · Totholz tragen place none: Buche und Karst
    // setzt die Welt über ihre bestehenden Nischen (Genese · Streu-Krone), das stehende Totholz nur der Labor-Wald
    // (Boden-Zeile ring "wald"), kein zusätzlicher Auto-Hain.
    buche: {
        kind: "tree",
        panel: "plant",
        s: { api: 0.4, delta: 2.25, slim: 0.6, trop: 0.05, leaf: 0.75 },
        fx: {
            barkType: "smooth",
            conifer: false,
            leafShape: "ovate",
            barkA: 0x6c6a62,
            barkB: 0x8e8a80,
            leafCol: 0x4c7d2a,
            place: { mode: "none" },
        },
        ph: {
            barkType: "smooth",
            barkA: 0x6c6a62,
            barkB: 0x8e8a80,
            leafCol: 0x4c7d2a,
            leafShape: { m: 4.1, n1: 0.91, n2: 0.865, n3: 0.865, a: 1, b: 1, wsc: 0.36 }, // das ganzrandig-wellige Ovalblatt (Eichen-Gesetz bei Lappung 0,3)
            roots: 6,
            flare: 0.24,
        },
    },
    // Der Karst-Baum: knorrig, gedrungen, mit mächtigem Wurzelanlauf an der Klippe.
    karst: {
        kind: "tree",
        panel: "plant",
        s: { api: 0.28, delta: 2.4, slim: 0.14, trop: -0.4, leaf: 0.36 },
        fx: {
            barkType: "oak",
            conifer: false,
            leafShape: "oak",
            barkA: 0x3b3128,
            barkB: 0x5f5444,
            leafCol: 0x3e6626,
            place: { mode: "none" },
        },
        ph: { flare: 0.9, roots: 5, leafCol: 0x3e6626, barkA: 0x3b3128, barkB: 0x5f5444 },
    },
    // Das stehende Totholz: ein abgestorbener Laubbaum — gebrochene Krone, kein Reisig, kein Laub, vergraute Borke.
    totholz: {
        kind: "tree",
        panel: "plant",
        s: { api: 0.3, delta: 2.3, slim: 0.45, trop: -0.15, leaf: 0.6 },
        fx: { barkType: "oak", conifer: false, barkA: 0x46423a, barkB: 0x6e685c, place: { mode: "none" } },
        ph: { tot: 1, barkA: 0x46423a, barkB: 0x6e685c },
    },
};

// ULTRAGUSS U2 — DER PHÄNOTYP-ZWILLING IST TOT: das Gesetz wohnt EINMAL in
// phyto-core (treePhenotype); dieser Name bleibt als Delegat für alle Leser
// (Studio + Foundry-Worker). Fail-closed: ohne Gesetzbuch kein Phänotyp.
function phenotype(api, slim, trop, delta, leaf) {
    const core = typeof self !== "undefined" && self.__phytoCore;
    if (!core || typeof core.treePhenotype !== "function")
        throw new Error("phyto-core fehlt — der Phänotyp wohnt im Gesetzbuch (Ladereihenfolge)");
    return core.treePhenotype(api, slim, trop, delta, leaf);
}

function deriveParamsPlant(pre) {
    const _D = __dials;
    const api = _D ? _D.api : gv("sApi"),
        delta = _D ? _D.delta : gv("sDelta"),
        slim = _D ? _D.slim : gv("sSlim"),
        trop = _D ? _D.trop : gv("sTrop"),
        leaf = _D ? _D.leaf : gv("sLeaf");
    const fx = pre.fx;
    const IR = mulberry32(((Math.floor(SEED) + 1) * 2246822519) >>> 0);
    const J = (a) => 1 + (IR() - 0.5) * 2 * a,
        O = (a) => (IR() - 0.5) * 2 * a; // Individuum pro Saat
    const lf = __lod === 0 ? 1 : __lod === 1 ? (fx && fx.conifer ? 0.0265 : 0.21) : 0.16,
        ls =
            __lod === 0
                ? 1
                : __lod === 1
                  ? fx && fx.conifer
                      ? 1.62
                      : 2.05
                  : 4.0; /* FIX v29: AGGREGATION statt Ausduennung (SpeedTree/FarCry-Prinzip): Wahrnehmung ~ n*s^2. Vorher L1: 0.34*1.35^2=0.62 -> Mittelfeld-Kronen 38% LOECHRIGER als L0 (und trotzdem teuer). Jetzt Laub: 0.21*2.05^2=0.88, Nadel: 0.36*1.62^2=0.94 -> VOLLERE Kronen bei ~35% weniger Blatt-Dreiecken. Nahfeld (L0) bleibt unangetastet — dort sitzt die Wahrnehmung. */
    if (pre.kind === "flower") {
        const FP = [0xf2efe6, 0xf2c62a, 0xd83a2e, 0xe87ab0, 0x9a5ac8, 0xee8a30, 0x6a8ad8, 0xf0e24a];
        const fc = FP[Math.floor(IR() * FP.length)]; // Bluetenfarbe pro Saat
        const infl = api < 0.34 ? "single" : api < 0.66 ? "umbel" : "spike"; // Apikaldominanz -> Bluetenstand
        return {
            kind: "flower",
            height: lerp(0.8, 1.9, slim) * J(0.15),
            headR: infl === "single" ? 0.17 : 0.072,
            petalRich: clamp(leaf * J(0.12), 0, 1),
            petalLen: lerp(0.22, 0.4, leaf) * (infl === "single" ? 1 : 0.75),
            petalShape: SHAPE[fx.petalShape],
            flowerCol: fc,
            windGain: 0.28,
            infl,
            bloomCount: infl === "umbel" ? 3 + Math.floor(IR() * 5) : infl === "spike" ? 6 + Math.floor(IR() * 6) : 1,
        };
    }
    if (pre.kind === "grass") {
        const fine = clamp(api, 0, 1); // api: breitblaettrig(0) -> feinhalmig(1)
        return {
            kind: "grass",
            bladeLen: lerp(0.4, 1.5, slim) * J(0.16),
            bladeW: lerp(0.1, 0.035, fine) * J(0.15),
            density: clamp(leaf * J(0.2), 0.06, 1),
            clump: lerp(0.35, 0.72, leaf),
            droop: clamp(0.35 + trop * 0.7, 0.04, 1.35),
            seedHead: clamp((leaf - 0.32) * 1.5, 0, 1),
            seedTan: 0xc8b27a,
            windGain: 1.3,
        }; // Belaubung -> Aehren/Rispen, Gravitropismus -> Fontaene
    }
    if (WALDBODEN_EMIT[pre.kind]) return deriveParamsWaldboden(pre, { api, delta, slim, trop, leaf }, IR, J, O);
    // tree / shrub — phaenotypische Variation um den Genotyp (Slider) + LOD
    // Die Phänotyp-Zeilen einer Art (`pre.ph`, 04.10.): was das Gesetz aus den Reglern ableitet, kann die Art
    // benennen — die Buche ihre glatte graue Rinde und das ganzrandige Blatt, der Karst-Baum seinen Wurzelanlauf,
    // das Totholz seine vergraute Borke. Ohne Zeile byte-gleich.
    const ph = pre.ph ? Object.assign(phenotype(api, slim, trop, delta, leaf), pre.ph) : phenotype(api, slim, trop, delta, leaf);
    const lc0 = new THREE.Color(ph.leafCol);
    lc0.offsetHSL((IR() - 0.5) * 0.05, (IR() - 0.5) * 0.1, (IR() - 0.5) * 0.08);
    const lcol = lc0.getHex();
    const P = {
        kind: ph.kind,
        apical: clamp(api + O(0.1), 0, 1),
        delta: delta + O(0.1),
        slim: clamp(slim + O(0.1), 0, 1),
        trop: trop + O(0.1),
        leafD: clamp(leaf * J(0.16), 0.05, 1),
        _lf: lf /* FIX v35: lf NICHT mehr im Wachstum (sonst andere rnd()-Zugzahl je LOD -> Stromdivergenz) — Ausduennung passiert als Index-Stride NACH dem Wachstum */,
        height: ph.height * J(0.16),
        conifer: ph.conifer,
        coniferDroop: ph.coniferDroop,
        crownBase: ph.crownBase,
        flare: ph.flare,
        roots: ph.roots * (__lod === 0 ? 1 : __lod === 1 ? 0.8 : 0.6),
        basalStems: ph.basalStems,
        maxDepth: ph.kind === "shrub" && __lod === 2 ? 3 : Math.max(4, ph.maxDepth),
        /* FIX v35: KEINE Tiefenreduktion je LOD mehr — die kappte den Rekursionsbaum frueher und verschob damit den Zufallsstrom: gleicher Same, ANDERER Stamm. Skelett waechst immer voll; Detail nimmt die Dezimierung (Radius-Prune + Stride), nie der Zufall. */ barkA: ph.barkA,
        barkB: ph.barkB,
        leafCol: lcol,
        leafShape: ph.leafShape,
        leafSize: lerp(0.22, 0.6, leaf) * (ph.conifer ? 0.6 : 1) * J(0.12) * ls,
        windGain: ph.windGain,
        barkType: ph.barkType,
        _bphase: IR() * 6.2831,
    };
    // Totholz (stehend): die Bruch-Höhe ist ein Wurf des Individuums (nach allen anderen — jeder lebende Baum
    // zieht byte-gleich), die Krone der Fernform ist kahl.
    if (ph.tot) {
        P.tot = 1;
        P.totBruch = 0.42 + IR() * 0.26;
        P.crown = "kahl";
    }
    return P;
}

// Die Regler des Waldbodens → die Gestalt-Parameter je Art (api · delta · slim · trop · leaf wie jede Pflanze).
function deriveParamsWaldboden(pre, d, IR, J, O) {
    const fx = pre.fx || {};
    if (pre.kind === "fern")
        return {
            kind: "fern",
            wedel: Math.max(4, Math.round(lerp(6, 12, d.leaf) * J(0.15))), // ausgewachsene Wedel
            krummstab: 1 + Math.floor(IR() * 3), // junge, eingerollte Wedel in der Mitte
            wedelLen: lerp(0.55, 1.15, d.slim) * J(0.14), // Wedel-Länge (m)
            stiel: lerp(0.16, 0.3, 1 - d.leaf), // Stiel-Anteil ohne Fiedern
            neigung: lerp(0.8, 0.28, d.api) + O(0.06), // Stiel gegen die Senkrechte (rad): hoher Apikal = Trichter
            nicken: clamp(0.3 + d.trop * 0.9, 0.08, 1.2), // Gravitropismus: wie stark der Wedel überhängt
            fiedern: Math.round(lerp(13, 21, d.leaf)), // Fieder-Paare je Wedel
            fiederLen: lerp(0.17, 0.25, d.leaf) * J(0.1), // längste Fieder relativ zur Wedel-Länge
            fiederBreit: lerp(0.22, 0.32, 1 - d.slim), // Fieder-Breite relativ zur Fieder-Länge
            farbe: fx.leafCol,
            spitze: fx.tipCol,
            windGain: 0.7,
            _ph: IR() * 6.2831,
        };
    if (pre.kind === "reed")
        return {
            kind: "reed",
            halme: Math.max(5, Math.round(lerp(7, 15, d.leaf) * J(0.15))),
            alt: Math.floor(IR() * 3), // vorjährige, braune Halme
            hoehe: lerp(1.5, 2.7, d.slim) * J(0.12),
            horst: lerp(0.12, 0.34, 1 - d.api), // Horst-Radius (m)
            blaetter: Math.round(lerp(4, 7, d.leaf)),
            rispeLen: lerp(0.14, 0.24, d.leaf), // Rispen-Länge relativ zur Halmhöhe
            neigung: lerp(0.16, 0.04, d.api), // Streuung der Halm-Neigung
            fahne: IR() * 6.2831, // die Wind-Seite des Standorts: alle Rispen nicken dorthin
            farbe: fx.leafCol,
            rispe: fx.rispeCol,
            windGain: 1.2,
        };
    if (pre.kind === "brush")
        return {
            kind: "brush",
            ruten: Math.max(6, Math.round(lerp(8, 12, d.leaf) * J(0.15))), // bogige Ruten aus dem Wurzelstock
            hoehe: lerp(0.55, 1.0, d.slim) * J(0.12),
            bogen: clamp(0.6 + d.trop * 0.9, 0.3, 1.4), // wie stark die Ruten überhängen
            zweige: Math.round(lerp(5, 8, d.leaf)), // Seitenzweige je Rute
            blatt: lerp(0.05, 0.085, d.leaf) * J(0.1), // Blattlänge (m)
            blattDichte: d.leaf,
            barkA: fx.barkA,
            barkB: fx.barkB,
            leafCol: fx.leafCol,
            windGain: 0.6,
        };
    // deadwood: liegender Stamm oder Stumpf (fx.form), Zersetzung aus trop (Feuchte-Zeiger) + Individuum
    return {
        kind: "deadwood",
        form: fx.form === "stumpf" ? "stumpf" : "liegend",
        laenge: lerp(2.4, 6.0, d.slim) * J(0.15),
        hoehe: lerp(0.28, 0.85, d.slim) * J(0.15),
        radius: lerp(0.12, 0.34, d.leaf) * J(0.15),
        zerfall: clamp(0.35 + d.trop * 0.5 + O(0.25), 0, 1),
        saege: IR() < 0.5, // Stumpf: gesägt (Jahresringe) oder gebrochen (Splitter)
        stummel: 2 + Math.floor(IR() * 3),
        pilze: Math.floor(IR() * 4),
        barkA: fx.barkA,
        barkB: fx.barkB,
        barkType: "oak",
        flare: 0.55,
        roots: 5,
        delta: d.delta,
        maxDepth: 1,
        _bphase: IR() * 6.2831,
        windGain: 0,
    };
}

function lerpHex(a, b, t) {
    return new THREE.Color(a).lerp(new THREE.Color(b), clamp(t, 0, 1)).getHex();
}

// DAS FARB-GESETZ DER VEGETATION (V18.506): ein Paletten-Hex ist eine sRGB-ABSICHT (Farbwähler,
// wie im Kreatur-Bäcker unten und in jeder farb-verwalteten Pipeline) — die Albedo ist sein linearer
// Wert. r128 las Hex ROH: Laub, Nadel, Halm, Stiel und Blüte lagen so 3–5× über der Natur (Zensus
// 01.10.: Laub 0,31–0,53 · Gras-Büschel 0,47 · Stiel 0,38, real 0,06–0,16; das Boden-Gras der Welt
// 0,085). Dekodiert: Eiche 0,16 · Nadel 0,09 · Stiel 0,12 · Blüte 0,49. Gelesen wird beim BACKEN (wo
// die Palette zur Vertex-Farbe wird) — Labor, Welt, Karte und Fern-Fit tragen dieselben Bytes; die
// Paletten selbst bleiben die Absicht. Rinde, Fels und Fachwerk liegen roh im Band und bleiben roh.
function vegFarbe(c) {
    const x = c && c.isColor ? c.clone() : new THREE.Color(c);
    return x.convertSRGBToLinear();
}

function rockPhenotype(gen, sph, elong, round, rough, strat, IR) {
    // GENESE-ACHSE: kristallin -> saeulig -> massiv -> klastisch -> die Sorte als Region im Raum
    let rkind;
    if (gen < 0.2) rkind = "crystal";
    else if (gen < 0.44) rkind = "columns";
    else if (gen < 0.74) rkind = "boulder";
    else rkind = "scree";
    const O = (a) => (IR() - 0.5) * 2 * a;
    let rockA, rockB, rockC, size, detail, speckle, matRough, fieldR, cells, colH, tilt, count;
    if (rkind === "crystal") {
        const CP = [
            [0x8a5ac8, 0x342c3c, 0xc8b0e8],
            [0xc6c6da, 0x3a3a44, 0xf0f0f8],
            [0xd0a030, 0x3a3020, 0xf0d878],
            [0xce8aa6, 0x3a2a30, 0xf0c8d8],
            [0x6a5a62, 0x2a242a, 0xa89aa2],
            [0x36a06e, 0x203028, 0x96dcb2],
        ];
        const c = CP[Math.floor(IR() * CP.length)];
        rockA = c[0];
        rockB = c[1];
        rockC = c[2];
        size = lerp(1.9, 2.8, sph);
        count = Math.round(lerp(12, 26, rough + 0.15));
        colH = lerp(1.9, 3.2, elong);
        matRough = 0.16;
    } else if (rkind === "columns") {
        rockA = lerpHex(0x33363a, 0x44413a, strat);
        rockB = 0x202327;
        rockC = lerpHex(0x515a50, 0x5a564a, strat);
        fieldR = lerp(1.45, 1.9, sph);
        cells = Math.round(lerp(40, 82, rough));
        colH = lerp(3.8, 5.2, elong);
        tilt = 0.025 + O(0.015);
        matRough = 0.8;
    } else if (rkind === "boulder") {
        rockA = lerpHex(0x8a8278, 0xb09870, strat);
        rockB = lerpHex(0x46423a, 0x70583a, strat);
        rockC = lerpHex(0x9a9286, 0xc8b48a, strat); // grau(Granit)->braun(Sediment)
        size = lerp(1.5, 2.0, sph);
        detail = 6;
        speckle = strat < 0.45;
        matRough = lerp(0.8, 0.92, rough);
    } else {
        rockA = 0x7a7268;
        rockB = 0x403a32;
        rockC = 0x8a8278;
        size = lerp(1.6, 2.0, sph);
        count = Math.round(lerp(18, 34, rough));
        fieldR = 1.8;
        speckle = true;
        matRough = 0.85;
    }
    return {
        rkind,
        rockA,
        rockB,
        rockC,
        size: size || 1.6,
        detail: detail || 6,
        speckle: !!speckle,
        matRough: matRough || 0.85,
        fieldR,
        cells,
        colH,
        tilt: tilt || 0,
        count,
    };
}

function deriveParamsRock(pre) {
    const _D = __dials;
    const gen = _D ? _D.gen : gv("rGen"),
        sph = _D ? _D.sph : gv("rSph"),
        elong = _D ? _D.elong : gv("rElo"),
        round = _D ? _D.rnd : gv("rRnd"),
        rough = _D ? _D.rgh : gv("rRgh"),
        strat = _D ? _D.str : gv("rStr");
    const IR = mulberry32(((Math.floor(SEED) + 7) * 2246822519) >>> 0);
    const J = (a) => 1 + (IR() - 0.5) * 2 * a,
        O = (a) => (IR() - 0.5) * 2 * a;
    const ph = rockPhenotype(gen, sph, elong, round, rough, strat, IR);
    return {
        kind: ph.rkind,
        rockA: ph.rockA,
        rockC: ph.rockC,
        rockB: ph.rockB,
        sph: clamp(sph + O(0.1), 0, 1),
        elong: clamp(elong + O(0.1), 0, 1),
        round: clamp(round + O(0.1), 0, 1),
        rough: clamp(rough + O(0.1), 0, 1),
        strat: clamp(strat + O(0.06), 0, 1),
        seed: SEED * 0.001 + 1.3,
        size: ph.size * J(0.12),
        detail: ph.detail,
        speckle: ph.speckle,
        matRough: ph.matRough,
        fieldR: ph.fieldR,
        cells: ph.cells,
        colH: ph.colH,
        tilt: ph.tilt,
        count: ph.count,
    };
}

function setSeasonColors(s) {
    curSeason = s;
    if (s === "spring") {
        seasonTint = new THREE.Color(0x6fae3a);
        seasonAccent = new THREE.Color(0x9ece5a);
        presenceTarget = 1;
        bloomTarget = 1;
    } else if (s === "summer") {
        seasonTint = new THREE.Color(0x4f7a30);
        seasonAccent = new THREE.Color(0x6f9a3a);
        presenceTarget = 1;
        bloomTarget = 1;
    } else if (s === "autumn") {
        seasonTint = new THREE.Color(0xc8842a);
        seasonAccent = new THREE.Color(0xd8a83a);
        presenceTarget = 1;
        bloomTarget = 0.45;
    } else {
        seasonTint = new THREE.Color(0x8a7a5a);
        seasonAccent = new THREE.Color(0x9a8a6a);
        presenceTarget = 0.05;
        bloomTarget = 0.1;
    }
    rockLichen = s === "winter" ? 0.0 : 0.6;
}

// ERFINDER-WELLE (Katalysator §2 B4, „regelbar, alle Assets") — DIE REGLER-TABELLEN DER
// PFLANZEN-DOMAENEN: die ov-Reise existiert in buildInstance seit je (Object.assign(P, ov)
// NACH deriveParams*), diese Tabellen machen sie SICHTBAR (die Werkstatt rendert ihre
// Slider AUS diesen Daten). Die ids sind ECHTE P-Felder des jeweiligen emit-Pfads —
// kein Fantasie-Regler. Ohne ov bleibt jeder Bau byte-identisch (Goldens unberuehrt).
var PARAMS_BY_KIND = {
    flower: [
        { id: "height", lab: "Stängel-Höhe", min: 0.4, max: 2.4, step: 0.01, def: 1.35, grp: "Blüte" },
        { id: "headR", lab: "Blütenkopf", min: 0.03, max: 0.3, step: 0.005, def: 0.17, grp: "Blüte" },
        { id: "petalLen", lab: "Blatt-Länge", min: 0.08, max: 0.6, step: 0.01, def: 0.31, grp: "Blüte" },
        { id: "petalRich", lab: "Blütenfülle", min: 0, max: 1, step: 0.01, def: 0.55, grp: "Blüte" },
        { id: "bloomCount", lab: "Blüten-Zahl", min: 1, max: 12, step: 1, def: 1, grp: "Blüte" },
    ],
    grass: [
        { id: "bladeLen", lab: "Halm-Länge", min: 0.2, max: 1.8, step: 0.01, def: 0.95, grp: "Halm" },
        { id: "bladeW", lab: "Halm-Breite", min: 0.02, max: 0.14, step: 0.002, def: 0.07, grp: "Halm" },
        { id: "density", lab: "Dichte", min: 0.06, max: 1, step: 0.01, def: 0.7, grp: "Halm" },
        { id: "droop", lab: "Neigung", min: 0.04, max: 1.35, step: 0.01, def: 0.5, grp: "Halm" },
    ],
};
function buildInstance(presetId, seed, lod, ov) {
    const sS = subject,
        sSeed = SEED,
        sCur = CURRENT,
        sLod = __lod,
        sRock = __rockKind,
        sRNG = RNG,
        sDials = __dials;
    __lod = lod;
    SEED = seed;
    CURRENT = presetId;
    RNG = mulberry32(Math.floor(seed) >>> 0);
    __dials =
        (PRESETS[presetId] && PRESETS[presetId].s) ||
        null; /* Wald baut IMMER aus kanonischen Preset-Dials -- nicht aus dem, was das Studio-Panel zufaellig zeigt */
    const g = new THREE.Group();
    subject = g;
    try {
        const pre = PRESETS[presetId];
        if (pre.panel === "rock") {
            const P = deriveParamsRock(pre);
            if (ov) Object.assign(P, ov);
            __rockKind = P.kind;
            emitRock(P);
        } else {
            const P = deriveParamsPlant(pre);
            if (ov) Object.assign(P, ov); // Wald-Overrides (crownBase/trunkMul)
            if (P.kind === "flower") emitFlower(P);
            else if (P.kind === "grass") emitGrass(P);
            else if (WALDBODEN_EMIT[P.kind]) WALDBODEN_EMIT[P.kind](P);
            else emitTree(P); // (der Grammatik-Beipack fuer den Analog-Satz fiel 05.10. — fern ist der Baum seine Karte)
        }
    } catch (e) {
        console.warn("Instanz", presetId, e);
    }
    g.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(g);
    if (isFinite(box.min.y) && box.min.y > 0.002) g.position.y -= box.min.y;
    subject = sS;
    SEED = sSeed;
    CURRENT = sCur;
    __lod = sLod;
    __rockKind = sRock;
    RNG = sRNG;
    __dials = sDials;
    return g;
}

// ════════════════════════════════════════════════════════════════════════════
// DIE EINE PIPE (V18.458) — DER GATTUNGS-BÄCKER-TISCH.
// Ein MESHFREI-Kern (Vertrag §8: er liefert GESETZE, keine Gestalt) wird von der
// PIPE gebacken: der Dispatch in der Foundry-Shell schlägt hier nach
// (BAKERS_BY_KIND[preset.kind]) statt einem Kern-buildInstance — tabellengetrieben
// (M8), kein Kern-spezifisches Literal, tetrapoda-core bleibt THREE-frei.
// Derselbe Bäcker läuft im Worker (r128) UND auf dem Stamm-Main-Thread (r184,
// Kalt-Start/Headless) — EIN Gesetz, zwei Scheduler, byte-gleiche Ausgabe.
// ════════════════════════════════════════════════════════════════════════════

// Indizierter Merge (pos+nor+idx, Offsets verschoben) — bewusst pur (kein
// BufferGeometryUtils: r128 heißt mergeBufferGeometries, r184 mergeGeometries —
// die Pipe darf nicht an einer Namens-Drift der Addons hängen).
function __tierMergeGeos(geos) {
    let nv = 0,
        ni = 0;
    for (const g of geos) {
        nv += g.attributes.position.count;
        ni += g.index ? g.index.count : g.attributes.position.count;
    }
    const pos = new Float32Array(nv * 3);
    const nor = new Float32Array(nv * 3);
    const idx = new Uint32Array(ni);
    let vo = 0,
        io = 0;
    for (const g of geos) {
        pos.set(g.attributes.position.array, vo * 3);
        nor.set(g.attributes.normal.array, vo * 3);
        const c = g.attributes.position.count;
        if (g.index) {
            const ia = g.index.array;
            for (let i = 0; i < ia.length; i++) idx[io + i] = ia[i] + vo;
            io += ia.length;
        } else {
            for (let i = 0; i < c; i++) idx[io + i] = vo + i;
            io += c;
        }
        vo += c;
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    out.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
    out.setIndex(new THREE.BufferAttribute(idx, 1));
    return out;
}

// Ein Strähnen-BLOCK aus einer Streu-Spec (die Haar-Streu des Menschen; deterministischer LCG, nie
// Math.random — Welt-Substanz-Gesetz): n Strähnen über dem Ellipsoid
// (Lab-Mathe verbatim: phi/theta-Streu, Richtungs-Jitter, Längen-Quantisierung),
// Kreuz-Quads mit WURZEL→SPITZE-Farbverlauf als Vertex-Daten (der Lab-Shader
// mischte fast-schwarz→Ton über aStrandY — hier reist es als Farbe, kein Shader).
function __streuGeo(row, seed, tonRGB) {
    let sLcg = seed >>> 0 || 1;
    const rnd = () => {
        sLcg = (sLcg * 1103515245 + 12345) >>> 0;
        return sLcg / 4294967296;
    };
    const pos = [];
    const col = [];
    const idx = [];
    const q = new THREE.Quaternion();
    const AB = new THREE.Vector3(0, -1, 0);
    const d = new THREE.Vector3();
    const v = new THREE.Vector3();
    const rootC = [tonRGB[0] * 0.12, tonRGB[1] * 0.12, tonRGB[2] * 0.12];
    // V18.462 — ZEILEN-ARTEN (Frisuren-Gesetz): "streu" = Kalotten-Schale
    // (Default, RNG-Reihenfolge UNVERÄNDERT — die Fell-Streu ist eingefroren),
    // + `radial:1` (Richtung = Schalen-Normale, afro), "quaste" = Punkt-Büschel
    // mit Box-Streuung (Zopf), "knoten" = volle Kugel-Schale radial (Dutt).
    // `lj` = Längen-Streuung (Default 0.015 wie bisher).
    const art = row.art === "quaste" || row.art === "knoten" ? row.art : "streu";
    const lj = row.lj != null ? row.lj : 0.015;
    let sN = 0;
    for (let j = 0; j < row.n; j++) {
        const phi = rnd() * Math.PI;
        const theta = rnd() * Math.PI * 2;
        const jx = (rnd() - 0.5) * 0.4;
        const jy = (rnd() - 0.5) * 0.3;
        const jz = (rnd() - 0.5) * 0.4;
        const qr = rnd();
        let px, py, pz;
        if (art === "quaste") {
            px = row.c[0] + (phi / Math.PI - 0.5) * row.box[0];
            py = row.c[1] + (theta / (Math.PI * 2) - 0.5) * row.box[1];
            pz = row.c[2] + (qr - 0.5) * row.box[2];
            d.set(row.d[0] + jx * 0.3, row.d[1] + jy * 0.3, row.d[2] + jz * 0.3).normalize();
        } else if (art === "knoten") {
            const cph = phi / Math.PI - 0.5; // volle Kugel: cos(phi) gleichverteilt
            const sph = Math.sqrt(Math.max(0, 1 - 4 * cph * cph));
            const nx = sph * Math.cos(theta);
            const ny = 2 * cph;
            const nz = sph * Math.sin(theta);
            px = row.c[0] + row.r * row.sc[0] * nx;
            py = row.c[1] + row.r * row.sc[1] * ny;
            pz = row.c[2] + row.r * row.sc[2] * nz;
            d.set(nx + jx * 0.75, ny + jy * 0.75, nz + jz * 0.75).normalize();
        } else {
            if (Math.cos(phi) < -0.05) continue;
            if (row.radial) {
                d.set(Math.sin(phi) * Math.cos(theta) + jx, Math.cos(phi) + jy, Math.sin(phi) * Math.sin(theta) + jz).normalize();
            } else {
                d.set(row.d[0] + jx, row.d[1] + jy, row.d[2] + jz).normalize();
            }
            px = row.r * row.sc[0] * Math.sin(phi) * Math.cos(theta) + row.c[0] - d.x * 0.012;
            py = row.r * row.sc[1] * Math.cos(phi) + row.c[1] - d.y * 0.012;
            pz = row.r * row.sc[2] * Math.sin(phi) * Math.sin(theta) + row.c[2] - d.z * 0.012;
        }
        q.setFromUnitVectors(AB, d);
        const l = Math.round((row.l + qr * lj) / 0.004) * 0.004;
        if (l <= 0) continue;
        const w = row.t * 1.8,
            wt = Math.max(0.001, row.t * 0.65);
        const ecken = [
            [-w, 0, 0, 0],
            [w, 0, 0, 0],
            [wt, -l, 0, 1],
            [-wt, -l, 0, 1],
            [0, 0, -w, 0],
            [0, 0, w, 0],
            [0, -l, wt, 1],
            [0, -l, -wt, 1],
        ];
        const b = sN * 8;
        for (const e of ecken) {
            v.set(e[0], e[1], e[2]).applyQuaternion(q);
            pos.push(v.x + px, v.y + py, v.z + pz);
            const cc = e[3] ? tonRGB : rootC;
            col.push(cc[0], cc[1], cc[2]);
        }
        idx.push(b, b + 1, b + 2, b, b + 2, b + 3, b + 4, b + 5, b + 6, b + 4, b + 6, b + 7);
        sN++;
    }
    if (!sN) return null;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    return geo;
}


// ── DIE HÜLLEN-MASCHINE DES OFENS (V18.497 — ein Gesetz für Mensch UND Tier): Feld → Surface-Nets
// (koerper-core, verbatim Lab) → Orientierung → 2× Laplace → CLR-Push → Gelenk-Gewichte → Geometrie.
// Der Aufrufer liefert das FELD (Mensch: Punkt-Splat + Closing · Tier: Primitiv-Füllung); zentren =
// [{j, c, d?}] je Teil-Primitiv (d(v) = eigener Abstand², sonst Zentrums-Abstand), skinJoints = Bone-
// Ordnung (null = ungeskinnte Hülle, die Fern-Stufe), kandidaten(v) = optionale Vorauswahl der zentren. ──
function __huelleAusFeld(hk, f, nx, ny, nz, lo, vox, level, clr, zentren, skinJoints, eW, kandidaten) {
    const sn = hk.surfaceNets(f, nx, ny, nz, level, lo[0], lo[1], lo[2], vox);
    if (!sn.verts.length || !sn.faces.length) return null;
    // ORIENTIERUNG pro Hülle (das Lab-Mehrheitsvotum): Nets kann nach
    // INNEN wickeln — FrontSide cullt dann die ganze Hülle (unsichtbar).
    {
        let cx = 0,
            cy = 0,
            cz = 0;
        for (const v of sn.verts) {
            cx += v[0];
            cy += v[1];
            cz += v[2];
        }
        cx /= sn.verts.length;
        cy /= sn.verts.length;
        cz /= sn.verts.length;
        let vote = 0;
        for (const fc of sn.faces) {
            const A = sn.verts[fc[0]],
                Bv = sn.verts[fc[1]],
                C = sn.verts[fc[2]];
            const ux = Bv[0] - A[0],
                uy = Bv[1] - A[1],
                uz = Bv[2] - A[2];
            const vx = C[0] - A[0],
                vy = C[1] - A[1],
                vz = C[2] - A[2];
            const nx2 = uy * vz - uz * vy,
                ny2 = uz * vx - ux * vz,
                nz2 = ux * vy - uy * vx;
            vote += nx2 * (A[0] - cx) + ny2 * (A[1] - cy) + nz2 * (A[2] - cz) > 0 ? 1 : -1;
        }
        if (vote < 0) for (const fc of sn.faces) [fc[1], fc[2]] = [fc[2], fc[1]];
    }
    // 2× Laplace-Glättung (Nachbarn über Kanten):
    for (let it = 0; it < 2; it++) {
        const acc = new Float32Array(sn.verts.length * 3);
        const cnt = new Uint16Array(sn.verts.length);
        for (const fc of sn.faces)
            for (let e = 0; e < 3; e++) {
                const a = fc[e],
                    b = fc[(e + 1) % 3];
                acc[a * 3] += sn.verts[b][0];
                acc[a * 3 + 1] += sn.verts[b][1];
                acc[a * 3 + 2] += sn.verts[b][2];
                cnt[a]++;
                acc[b * 3] += sn.verts[a][0];
                acc[b * 3 + 1] += sn.verts[a][1];
                acc[b * 3 + 2] += sn.verts[a][2];
                cnt[b]++;
            }
        for (let i = 0; i < sn.verts.length; i++)
            if (cnt[i]) {
                const v = sn.verts[i],
                    k = 0.5 / cnt[i];
                v[0] = v[0] * 0.5 + acc[i * 3] * k;
                v[1] = v[1] * 0.5 + acc[i * 3 + 1] * k;
                v[2] = v[2] * 0.5 + acc[i * 3 + 2] * k;
            }
    }
    // CLR-PUSH: jeden Vertex entlang seiner Flächen-Normale nach AUSSEN
    // (die Vorlagen-Klarheit: Hülle ÜBER den Primitiven, kein Durchstoß).
    if (clr) {
        const VN = new Float32Array(sn.verts.length * 3);
        for (const fc of sn.faces) {
            const A = sn.verts[fc[0]],
                Bv = sn.verts[fc[1]],
                C = sn.verts[fc[2]];
            const ux = Bv[0] - A[0],
                uy = Bv[1] - A[1],
                uz = Bv[2] - A[2];
            const vx = C[0] - A[0],
                vy = C[1] - A[1],
                vz = C[2] - A[2];
            const nx2 = uy * vz - uz * vy,
                ny2 = uz * vx - ux * vz,
                nz2 = ux * vy - uy * vx;
            for (const vi of fc) {
                VN[vi * 3] += nx2;
                VN[vi * 3 + 1] += ny2;
                VN[vi * 3 + 2] += nz2;
            }
        }
        for (let i = 0; i < sn.verts.length; i++) {
            const L = Math.hypot(VN[i * 3], VN[i * 3 + 1], VN[i * 3 + 2]) || 1;
            sn.verts[i][0] += (VN[i * 3] / L) * clr;
            sn.verts[i][1] += (VN[i * 3 + 1] / L) * clr;
            sn.verts[i][2] += (VN[i * 3 + 2] / L) * clr;
        }
    }
    // Gewichte: 1/d⁴ über Teil-Zentren (Lab-Bindung), aggregiert je Gelenk, Top-4.
    const nV = sn.verts.length;
    const pos = new Float32Array(nV * 3);
    const sIdx = skinJoints ? new Float32Array(nV * 4) : null;
    const sWgt = skinJoints ? new Float32Array(nV * 4) : null;
    for (let i = 0; i < nV; i++) {
        const v = sn.verts[i];
        pos[i * 3] = v[0];
        pos[i * 3 + 1] = v[1];
        pos[i * 3 + 2] = v[2];
        if (!skinJoints) continue;
        const jw = {};
        let sum = 0;
        for (const z of kandidaten ? kandidaten(v) : zentren) {
            const dx = v[0] - z.c[0],
                dy = v[1] - z.c[1],
                dz = v[2] - z.c[2];
            const d2 = z.d ? z.d(v) : dx * dx + dy * dy + dz * dz;
            const w = 1 / ((d2 + eW) * (d2 + eW));
            jw[z.j] = (jw[z.j] || 0) + w;
            sum += w;
        }
        const top = Object.keys(jw)
            .map((j) => [skinJoints.indexOf(j), jw[j] / sum])
            .filter((e) => e[0] >= 0 && e[1] > 0.03)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4);
        let ts = 0;
        for (const t of top) ts += t[1];
        for (let k = 0; k < 4; k++) {
            sIdx[i * 4 + k] = top[k] ? top[k][0] : 0;
            sWgt[i * 4 + k] = top[k] ? top[k][1] / (ts || 1) : 0;
        }
    }
    const idx = new Uint32Array(sn.faces.length * 3);
    for (let i = 0; i < sn.faces.length; i++) {
        idx[i * 3] = sn.faces[i][0];
        idx[i * 3 + 1] = sn.faces[i][1];
        idx[i * 3 + 2] = sn.faces[i][2];
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    if (skinJoints) {
        geo.setAttribute("skinIndex", new THREE.BufferAttribute(sIdx, 4));
        geo.setAttribute("skinWeight", new THREE.BufferAttribute(sWgt, 4));
    }
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
    geo.computeVertexNormals();
    return geo;
}

// DER TIER-GUSS: baut den bauTier-Baum des Gattungs-Kerns mit ECHTEN THREE-
// Fabriken, bäckt jede Mesh-Geometrie in den LOKAL-Raum ihres nächsten
// ANIMIERTEN Gelenks und mergt je (Gelenk × Material-Klasse) → wenige Meshes,
// voll gelenkig. Rückgabe: THREE.Group, Meshes FLACH auf IDENTITY (der
// Asset-Extractor bäckt matrixWorld — Identity = no-op), userData.__assetJoint
// je Mesh + group.userData.__skelett (Gelenk-Baum + tailSegs + masse) als
// Beipack. lod0 = gelenkig (Segmente 20/14) · lod≥1 = EIN Standbild
// (Segmente 8/6, ohne Strähnen) für die Ferne.
function bakeTierInstance(kern, presetId, seed, lod, ov) {
    const dials0 = (kern.GATTUNGEN && kern.GATTUNGEN[presetId]) || {};
    const dials = ov && typeof ov === "object" ? Object.assign({}, dials0, ov) : Object.assign({}, dials0);
    const P = kern.deriveTierParams(dials);
    const TK = kern.TIER_MATERIAL_KLASSEN || {};
    const fein = (lod | 0) >= 1;
    const segW = fein ? 8 : 20,
        segH = fein ? 6 : 14,
        segZ = fein ? 6 : 10;
    // Material-SPEC je Klasse: reine MeshStandard-Zahlen (Farbe/Rauheit/Seite/
    // Emissiv) — die Regler REISEN (mp im Asset-Reply), der Welt-Resolver
    // (_foundryTreeMaterial) baut EXAKT dieses Material. Kein Shader-Nachbau.
    const matCache = {};
    const matFuer = (k) => {
        if (matCache[k]) return matCache[k];
        let c, r, em, emI;
        if (k === "fell") {
            // Der KÖRPER-Ton = cB (der Fell-Textur-Grundton des Labs — P.base ist
            // ein CSS-String für den Lab-Hintergrund, KEINE Fell-Zahl).
            c = typeof P.cB === "number" ? P.cB : 0x6b4a2e;
            r = 0.93;
        } else if (k === "straehne") {
            c = P.cB != null ? P.cB : 0x6b4a2e;
            r = 0.92;
        } else if (k === "straehneD") {
            c = P.cD != null ? P.cD : 0x4a3320;
            r = 0.92;
        } else if (k === "straehneL") {
            c = P.cL != null ? P.cL : 0x8a6a48;
            r = 0.88;
        } else if (k === "fellSchale") {
            // Die Schalen tragen ihren Ton als Vertex-Farbe; der Anker (mp.color) ist der Körper-Ton.
            c = P.cB != null ? P.cB : 0x6b4a2e;
            r = 0.92;
        } else {
            const kl = TK[k] || TK.dunkel || { c: 0x111111, r: 0.5 };
            c = kl.c;
            r = kl.r != null ? kl.r : 0.5;
            if (kl.emissiv != null) {
                em = kl.emissiv;
                // AUGEN-GLUT-SCHNITT (P0-Inventur 18.07.): das Gesetzbuch-Feld heisst
                // `ei` (tetrapoda TIER_MATERIAL_KLASSEN.tierauge) — der Phantom-Name
                // las nie einen Schreiber und der 0.85-Default gab jedem Kreatur-Auge
                // 2.8x Glut vs Lab. Ohne ei: THREE-Default 1 (kein Ofen-eigener Wert).
                emI = kl.ei != null ? kl.ei : 1;
            }
        }
        // FARB-GESETZ (scheduler-neutral): r128 setHex schreibt ROH, r184 wandelt
        // sRGB→linear automatisch — derselbe Bäcker muss auf BEIDEN dieselben
        // Bytes liefern. Wir rechnen den (sRGB-gemeinten) Hex SELBST nach linear
        // und setzen per setRGB (in beiden Versionen konversionsfrei-roh):
        // die Welt (r184, sRGB-Ausgabe) zeigt dann exakt den Studio-Ton.
        const lin = (hx) => {
            const f = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
            return [f(((hx >> 16) & 255) / 255), f(((hx >> 8) & 255) / 255), f((hx & 255) / 255)];
        };
        const m = new THREE.MeshStandardMaterial({ roughness: r, metalness: 0 });
        const lc = lin(c);
        m.color.setRGB(lc[0], lc[1], lc[2]);
        if (k.indexOf("straehne") === 0) m.side = THREE.DoubleSide;
        if (em != null && m.emissive) {
            const le = lin(em);
            m.emissive.setRGB(le[0], le[1], le[2]);
            m.emissiveIntensity = emI;
        }
        m.userData.__klasse = k;
        // DIE SEH-KLASSE (Integration W8): Fell · Strähne · Schale sind haar, jede andere Klasse trägt ihr Feld aus dem
        // Gesetzbuch (tetrapoda TIER_MATERIAL_KLASSEN[k].seh); fehlt es, reist der Stoff ohne Klasse (das Budget-Gesetz
        // meldet den Bruch).
        const sehK =
            k === "fell" || k === "fellSchale" || k.indexOf("straehne") === 0 ? "haar" : TK[k] ? TK[k].seh : null;
        if (sehK) m.userData.__seh = sehK;
        matCache[k] = m;
        return m;
    };
    const schweif = [];
    const F = {
        gruppe: () => new THREE.Group(),
        kugel: (r, k, sc) => {
            // Segmente folgen der GRÖSSE (V18.497): eine 7-mm-Kralle trug dieselben 20×14 wie der
            // Brustkorb (520 Dreiecke je Kralle). Voll ab r·max(sc) ≥ 0.1·H, darunter ∝ √Größe.
            const q = Math.min(1, Math.sqrt((r * (sc ? Math.max(sc[0], sc[1], sc[2]) : 1)) / (0.1 * (P.size || 2.4))));
            const w = Math.max(fein ? 5 : 8, Math.round(segW * q)),
                h = Math.max(fein ? 4 : 6, Math.round(segH * q));
            const m = new THREE.Mesh(new THREE.SphereGeometry(r, w, h), matFuer(k));
            if (sc) m.scale.set(sc[0], sc[1], sc[2]);
            return m;
        },
        zylinder: (rt, rb, h, k) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segZ, 1), matFuer(k)),
        kugelFein: (r, k, segs) =>
            new THREE.Mesh(new THREE.SphereGeometry(r, fein ? 8 : Math.min(16, segs || 16), fein ? 6 : 12), matFuer(k)),
        v3: (x, y, z) => new THREE.Vector3(x, y, z),
        richte: (node, dir) => {
            node.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
        },
        // Schweif-Fell (V18.497): die Schalen tragen es — der Haken meldet das Segment als Fell-Zeile an.
        fellSchweif: (segG, segR, i) => schweif.push({ node: segG, segR, i }),
    };
    const B = kern.bauTier(F, dials);
    // DAS FELL-GESETZ (V18.460 Zeilen · V18.497 Schalen): kern.fellStreu liefert die Streu-Zeilen (Teil ·
    // Ellipsoid · Legerichtung · Zahl · Länge · Ton); die FELL-SCHALEN auf der Tier-Haut konsumieren sie je
    // Haut-Punkt (__tierFellSchalen). Die einzeln gestreuten Strähnen sind gefallen (205k Dreiecke je Wolf,
    // im Bild Flecken statt Pelz). Stufe 1 bleibt kahl (Silhouette + Farbe).
    let fell = null;
    if (!fein) {
        if (typeof kern.fellStreu !== "function") throw new Error("FELL: kern.fellStreu fehlt (fail-closed)");
        const T = {};
        for (const nm of [
            "belly",
            "lowerAbd",
            "croup",
            "pelvis",
            "throat",
            "throatLower",
            "mane",
            "ribcage",
            "waist",
            "flank",
            "cranium",
        ]) {
            const nd = B.teile[nm];
            if (nd && nd.position) T[nm] = [nd.position.x, nd.position.y, nd.position.z];
        }
        if (B.neckStart && B.neckDir) {
            const nm2 = B.neckStart.clone().add(B.neckDir.clone().multiplyScalar(0.5));
            T.neckMid = [nm2.x, nm2.y, nm2.z];
        }
        const lin2 = (hx) => {
            const f2 = (v2) => (v2 <= 0.04045 ? v2 / 12.92 : Math.pow((v2 + 0.055) / 1.055, 2.4));
            return [f2(((hx >> 16) & 255) / 255), f2(((hx >> 8) & 255) / 255), f2((hx & 255) / 255)];
        };
        const toene = {
            B: lin2(typeof P.cB === "number" ? P.cB : 0x6b4a2e),
            D: lin2(typeof P.cD === "number" ? P.cD : 0x3a2e1c),
            L: lin2(typeof P.cL === "number" ? P.cL : 0xc0a060),
        };
        fell = { rows: kern.fellStreu(P, B.masse, T) || [], T, toene, schweif };
    }
    const root = B.teile.wolf;
    const namen = [
        "wolf",
        "legFL",
        "legFR",
        "legHL",
        "legHR",
        "flU",
        "flL",
        "flP",
        "frU",
        "frL",
        "frP",
        "hlT",
        "hlC",
        "hlP",
        "hrT",
        "hrC",
        "hrP",
        "headGroup",
        "jawGroup",
        "earL",
        "earR",
        "lidTL",
        "lidTR",
        "tailRoot",
    ];
    const nodeName = new Map();
    for (const n of namen) if (B.teile[n]) nodeName.set(B.teile[n], n);
    const tailNamen = [];
    (B.tailSegs || []).forEach((seg, i) => {
        const nm = "tailSeg" + i;
        nodeName.set(seg, nm);
        tailNamen.push(nm);
    });
    const skinJoints = __tierHaut(kern, B, root, nodeName, fein, P, matFuer, fell);
    return __bakeGelenkBaum(root, "wolf", nodeName, fein, {
        art: presetId,
        tailSegs: tailNamen,
        masse: B.masse || null,
        base: typeof P.cB === "number" ? P.cB : null,
        // V18.497 — die Bone-Ordnung der Tier-Haut (nur Stufe 0 ist geskinnt).
        ...(skinJoints ? { skinJoints } : {}),
    });
}

// ── DIE TIER-HAUT (V18.497, Schöpfer 30.09.: „am Ende AAA-Niveau, nicht Kapseln"): der Rumpf-, Hals-,
// Bein- und Schweif-Leib des bauTier-Baums ist eine Vereinigung von ~136 Fell-Ellipsoiden — gegossen
// als Einzel-Kugeln war er eine sichtbare Perlen-Kette (85k Dreiecke). Hier wird er EINE geschlossene
// Haut: das Feld ist die GLATTE Vereinigung (polynomiales smin, Verrundung `blend`) der Ellipsoid-
// Abstände — exakt, ohne die Blur-Erosion, die dünne Beine fräße —, die Hüllen-Maschine des Ofens
// (Surface-Nets, dieselbe wie beim Menschen) macht daraus die Fläche. Stufe 0 bindet sie per Gewicht
// an die Bein-/Schweif-Gelenke (Abstand zur Primitiv-OBERFLÄCHE, Top-4); Stufe 1 (das Fern-Standbild)
// bleibt ungeskinnt und gröber und schließt den Kopf mit ein. Nah tragen Kopf und Kiefer eigene starre
// Häute (__tierKopfHaeute); Ohren, Lider und Teile unter dem Raster (Zehen, Krallen-Bett) bleiben Primitive. Die ersetzten Kugeln bleiben im Baum (Strähnen-Wirte), gegossen werden sie
// nicht (__nichtGiessen). Das Fern-Standbild gießt keine Teile unter der Pfote oder im Maul (Krallen,
// Ballen, Zähne, Zahnfleisch): bei ≥ 35 m trägt es Silhouette und Farbe, nicht Details unter einem Pixel.
// Rückgabe: skinJoints (Stufe 0) oder null.
var TIER_HAUT = Object.freeze({
    voxNah: 0.02, // × H (Rasterweite Stufe 0)
    voxFern: 0.04, // × H (Stufe 1)
    minVox: 0.35, // kleinste Halbachse < minVox·vox → bleibt Primitiv
    minDicke: 0.75, // Dicken-Erhalt: dünnere Glieder wachsen auf minDicke·vox (sonst dünnt das Raster sie aus)
    fernOhne: Object.freeze(["klaue", "ballen", "zahn", "zahnfleisch"]), // Stufe 1 gießt sie nicht
    voxKopf: 0.008, // × H (Rasterweite der Kopf-Häute — das Gesicht ist klein)
    blendKopf: 0.012, // × H (smin-Verrundung im Gesicht)
    blend: 0.035, // × H (smin-Verrundung der Nähte)
    eW: 0.03, // × H (Gewichts-Weiche: 1/(d² + eW²)²)
});
function __tierHaut(kern, B, root, nodeName, fein, P, matFuer, fell) {
    const hk =
        kern && typeof kern.surfaceNets === "function"
            ? kern
            : typeof __koerperCore !== "undefined" && __koerperCore && typeof __koerperCore.surfaceNets === "function"
              ? __koerperCore
              : null;
    // Ohne Hüllen-Maschine kein Tier: LAUT (der Bäcker-Fänger meldet), nie still die Perlen-Kette.
    if (!hk) throw new Error("TIER-HAUT: Hüllen-Maschine (koerper-core.surfaceNets) fehlt");
    const H = (B.masse && B.masse.H) || P.size || 2.4;
    const vox = (fein ? TIER_HAUT.voxFern : TIER_HAUT.voxNah) * H;
    const blend = TIER_HAUT.blend * H;
    root.updateMatrixWorld(true);
    const kopf = B.teile.headGroup || null;
    const unterKopf = (n) => {
        for (let c = n; c; c = c.parent) if (c === kopf) return true;
        return false;
    };
    const gelenkVon = (n) => {
        for (let c = n; c; c = c.parent) if (nodeName.has(c)) return nodeName.get(c);
        return "wolf";
    };
    // Stufe 0: der Kopf trägt seine eigenen starren Häute (__tierKopfHaeute); das Fern-Standbild ist starr
    // und nimmt ihn in die eine Haut.
    const prims = __tierPrims(root, root, (n) => fein || !unterKopf(n), vox, blend, gelenkVon);
    if (fein)
        root.traverse((node) => {
            const kl = node.isMesh && node.material && node.material.userData && node.material.userData.__klasse;
            if (kl && TIER_HAUT.fernOhne.includes(kl)) node.userData.__nichtGiessen = true;
        });
    if (prims.length < 4) return null;
    const { f, nx, ny, nz, lo, hi } = __tierFeld(prims, vox, blend);
    // Gelenke der Haut in Baum-Ordnung (nur die, die ein Primitiv trägt).
    let skinJoints = null;
    if (!fein) {
        const genutzt = new Set(prims.map((p) => p.j));
        skinJoints = [];
        for (const nm of nodeName.values()) if (genutzt.has(nm)) skinJoints.push(nm);
    }
    // Gewicht nach Abstand zur Primitiv-OBERFLÄCHE (nicht zum Zentrum: der Rumpf-Punkt an der
    // Schulter gehört dem Rumpf, auch wenn das Oberarm-Zentrum näher liegt).
    const zentren = prims.map((p) => ({
        j: p.j,
        c: p.c,
        d: (v) => {
            // Ferne Primitive (Schranke |v−c| − R > 0.3·H) tragen < 0.3 % Gewicht: die Schranke genügt.
            const ex = v[0] - p.c[0],
                ey = v[1] - p.c[1],
                ez = v[2] - p.c[2];
            const lb = Math.sqrt(ex * ex + ey * ey + ez * ez) - (p.ext - blend - 2 * vox);
            if (lb > 0.3 * H) return lb * lb;
            const d = Math.max(0, __tierAbstand(p, v[0], v[1], v[2]));
            return d * d;
        },
    }));
    // Vorauswahl je Vertex: ein grobes Raster (Zelle 0.3·H) trägt jedes Primitiv in allen Zellen,
    // die seine Reichweite (R + 0.3·H) berührt — der Vertex fragt nur seine Zelle.
    let kandidaten = null;
    if (skinJoints) {
        const C = 0.3 * H,
            reich = 0.3 * H;
        const cnx = Math.ceil((hi[0] - lo[0]) / C) + 1,
            cny = Math.ceil((hi[1] - lo[1]) / C) + 1,
            cnz = Math.ceil((hi[2] - lo[2]) / C) + 1;
        const zellen = new Array(cnx * cny * cnz);
        const zi = (v, d, n) => Math.min(n - 1, Math.max(0, Math.floor((v - lo[d]) / C)));
        prims.forEach((p, n) => {
            const rr = p.ext - blend - 2 * vox + reich;
            for (let k = zi(p.c[2] - rr, 2, cnz); k <= zi(p.c[2] + rr, 2, cnz); k++)
                for (let j = zi(p.c[1] - rr, 1, cny); j <= zi(p.c[1] + rr, 1, cny); j++)
                    for (let i = zi(p.c[0] - rr, 0, cnx); i <= zi(p.c[0] + rr, 0, cnx); i++) {
                        const id = i + cnx * (j + cny * k);
                        (zellen[id] || (zellen[id] = [])).push(zentren[n]);
                    }
        });
        kandidaten = (v) => zellen[zi(v[0], 0, cnx) + cnx * (zi(v[1], 1, cny) + cny * zi(v[2], 2, cnz))] || zentren;
    }
    const eW = TIER_HAUT.eW * H;
    const geo = __huelleAusFeld(hk, f, nx, ny, nz, lo, vox, 0, 0, zentren, skinJoints, eW * eW, kandidaten);
    if (!geo) throw new Error("TIER-HAUT: die Hüllen-Maschine lieferte keine Fläche");
    const mesh = new THREE.Mesh(geo, matFuer("fell"));
    root.add(mesh); // Root-lokal gebacken (Identität)
    if (fell) {
        const schalen = __tierFellSchalen(hk, f, nx, ny, nz, lo, vox, zentren, skinJoints, eW * eW, kandidaten, fell, B, root, H);
        root.add(new THREE.Mesh(schalen, matFuer("fellSchale")));
    }
    if (!fein) __tierKopfHaeute(hk, B, H, matFuer);
    return skinJoints;
}

// Abstand zum Ellipsoid-Primitiv (erste Ordnung, exakt auf der Fläche): (|q| − r) / |Miᵀ·q̂| − auf, q = Mi·p.
function __tierAbstand(p, x, y, z) {
    const m = p.Mi;
    const qx = m[0] * x + m[4] * y + m[8] * z + m[12],
        qy = m[1] * x + m[5] * y + m[9] * z + m[13],
        qz = m[2] * x + m[6] * y + m[10] * z + m[14];
    const ql = Math.sqrt(qx * qx + qy * qy + qz * qz) || 1e-9;
    const ux = qx / ql,
        uy = qy / ql,
        uz = qz / ql;
    const gx = m[0] * ux + m[1] * uy + m[2] * uz,
        gy = m[4] * ux + m[5] * uy + m[6] * uz,
        gz = m[8] * ux + m[9] * uy + m[10] * uz;
    return (ql - p.r) / (Math.sqrt(gx * gx + gy * gy + gz * gz) || 1e-9) - p.auf;
}

// Die Fell-Ellipsoide eines Teil-Baums im Raum `ref` (Matrix ref⁻¹ · Welt): Kugeln der Klasse fell, die
// `nimm(node)` zulässt. Zu fein fürs Raster (kleinste Halbachse < minVox·vox) bleibt Primitiv, dünner als
// minDicke·vox wächst (Dicken-Erhalt). Groß vor klein sortiert (das Innere wird früh TIEF).
function __tierPrims(baum, ref, nimm, vox, blend, gelenkVon) {
    const inv = new THREE.Matrix4().copy(ref.matrixWorld).invert();
    const sp = new THREE.Vector3();
    const prims = [];
    baum.traverse((node) => {
        if (!node.isMesh || !node.geometry || !node.geometry.parameters) return;
        const kl = node.material && node.material.userData && node.material.userData.__klasse;
        if (kl !== "fell" || !nimm(node)) return;
        const r = node.geometry.parameters.radius;
        if (!(r > 0) || node.geometry.type !== "SphereGeometry") return;
        const M = new THREE.Matrix4().multiplyMatrices(inv, node.matrixWorld);
        const e = M.elements;
        const sx = Math.sqrt(e[0] * e[0] + e[1] * e[1] + e[2] * e[2]),
            sy = Math.sqrt(e[4] * e[4] + e[5] * e[5] + e[6] * e[6]),
            sz = Math.sqrt(e[8] * e[8] + e[9] * e[9] + e[10] * e[10]);
        const minHalb = r * Math.min(sx, sy, sz);
        if (minHalb < TIER_HAUT.minVox * vox) return;
        const Mi = Float64Array.from(new THREE.Matrix4().copy(M).invert().elements);
        const ext = r * Math.max(sx, sy, sz) + blend + 2 * vox;
        sp.setFromMatrixPosition(M);
        const auf = Math.max(0, TIER_HAUT.minDicke * vox - minHalb);
        prims.push({ node, r, Mi, c: [sp.x, sp.y, sp.z], ext: ext + auf, auf, j: gelenkVon(node) });
    });
    prims.sort((a, b) => b.ext - a.ext);
    return prims;
}

// Das glatte SDF-Feld der Primitive (polynomiales smin, Verrundung ~blend) auf einem Raster der Weite vox.
// Nur die Schale um die Fläche zählt (eine Nets-Zelle, die schneidet, hat Ecken ≤ √3·vox vom Nullniveau):
// Punkte, die schon TIEF innen liegen, kann kein weiteres smin mehr über Null heben, und ein Primitiv,
// dessen Abstand (untere Schranke |p−c| − R) um blend über dem Feld liegt, ändert nichts — beide
// überspringen die Abstands-Rechnung. Die Primitive werden __nichtGiessen (gegossen wird die Haut).
function __tierFeld(prims, vox, blend) {
    const lo = [1e9, 1e9, 1e9],
        hi = [-1e9, -1e9, -1e9];
    for (const p of prims)
        for (let d = 0; d < 3; d++) {
            lo[d] = Math.min(lo[d], p.c[d] - p.ext);
            hi[d] = Math.max(hi[d], p.c[d] + p.ext);
        }
    const nx = Math.ceil((hi[0] - lo[0]) / vox) + 2,
        ny = Math.ceil((hi[1] - lo[1]) / vox) + 2,
        nz = Math.ceil((hi[2] - lo[2]) / vox) + 2;
    const WEIT = 8 * vox;
    const TIEF = -3 * vox;
    const f = new Float32Array(nx * ny * nz).fill(WEIT);
    for (const p of prims) {
        const R = p.ext - blend - 2 * vox;
        const cx = p.c[0],
            cy = p.c[1],
            cz = p.c[2];
        const i0 = Math.max(0, Math.floor((p.c[0] - p.ext - lo[0]) / vox)),
            i1 = Math.min(nx - 1, Math.ceil((p.c[0] + p.ext - lo[0]) / vox)),
            j0 = Math.max(0, Math.floor((p.c[1] - p.ext - lo[1]) / vox)),
            j1 = Math.min(ny - 1, Math.ceil((p.c[1] + p.ext - lo[1]) / vox)),
            k0 = Math.max(0, Math.floor((p.c[2] - p.ext - lo[2]) / vox)),
            k1 = Math.min(nz - 1, Math.ceil((p.c[2] + p.ext - lo[2]) / vox));
        // Nur die KUGEL mit Radius ext (nicht der Würfel): jenseits davon erreicht das Primitiv die
        // Schale um das Nullniveau nie (b ≥ R + blend + 2·vox − R).
        const ext2 = p.ext * p.ext;
        for (let k = k0; k <= k1; k++) {
            const z = lo[2] + k * vox,
                ez = z - cz;
            for (let j = j0; j <= j1; j++) {
                const y = lo[1] + j * vox,
                    ey = y - cy;
                const rest = ext2 - ey * ey - ez * ez;
                if (rest <= 0) continue;
                const w = Math.sqrt(rest);
                const ia = Math.max(i0, Math.floor((cx - w - lo[0]) / vox)),
                    ib = Math.min(i1, Math.ceil((cx + w - lo[0]) / vox));
                const eyz = ey * ey + ez * ez;
                const row = nx * (j + ny * k);
                for (let i = ia; i <= ib; i++) {
                    const id = i + row;
                    const a = f[id];
                    if (a < TIEF) continue;
                    const x = lo[0] + i * vox,
                        ex = x - cx;
                    if (Math.sqrt(ex * ex + eyz) - R >= a + blend) continue;
                    const b = __tierAbstand(p, x, y, z);
                    // polynomiales smin (IQ): die Naht verrundet mit Radius ~blend
                    const dab = a > b ? a - b : b - a;
                    if (dab >= blend) {
                        if (b < a) f[id] = b;
                        continue;
                    }
                    const h = (blend - dab) / blend;
                    f[id] = (a < b ? a : b) - h * h * blend * 0.25;
                }
            }
        }
        p.node.userData.__nichtGiessen = true; // gegossen wird die Haut, nicht die Kugel
    }
    return { f, nx, ny, nz, lo, hi };
}

// DIE KOPF-HÄUTE (V18.499): der Kopf nah war eine Kugel-Traube (Schädel, Schnauzen-Stücke, Wangen,
// Brauen). Kopf und Kiefer werden je EINE starre Haut an ihrem Gelenk — derselbe SDF-Guss auf einem
// feineren Raster (das Gesicht ist klein); starr heißt kein Skinning: der Kiefer öffnet (Gähnen, Schnüffeln).
// Ohren und Lider bleiben eigene Gelenke mit ihren Primitiven; Augen, Nase, Zähne sind keine Fell-Klasse.
function __tierKopfHaeute(hk, B, H, matFuer) {
    const vox = TIER_HAUT.voxKopf * H,
        blend = TIER_HAUT.blendKopf * H;
    const t = B.teile;
    const eigen = [t.jawGroup, t.earL, t.earR, t.lidTL, t.lidTR].filter(Boolean);
    const unterEinem = (n, liste) => {
        for (let c = n; c; c = c.parent) if (liste.includes(c)) return true;
        return false;
    };
    const ohneLider = [t.lidTL, t.lidTR, t.earL, t.earR].filter(Boolean);
    for (const [g, nimm] of [
        [t.headGroup, (n) => !unterEinem(n, eigen)],
        [t.jawGroup, (n) => !unterEinem(n, ohneLider)],
    ]) {
        if (!g) continue;
        const prims = __tierPrims(g, g, nimm, vox, blend, () => null);
        if (prims.length < 2) continue;
        const F = __tierFeld(prims, vox, blend);
        const geo = __huelleAusFeld(hk, F.f, F.nx, F.ny, F.nz, F.lo, vox, 0, 0, null, null, 0);
        if (!geo) throw new Error("TIER-HAUT: die Kopf-Haut lieferte keine Fläche");
        g.add(new THREE.Mesh(geo, matFuer("fell"))); // Gelenk-lokal gebacken (Identität)
    }
}

// ── DAS SCHALEN-FELL (V18.497): N versetzte Schalen über einer gröberen Haut aus DEMSELBEN Feld (jeder
// zweite Rasterpunkt — keine neue Füllung), gleich geskinnt: LBS biegt jede Schale samt Legerichtung mit.
// Je Haut-Punkt mischt das Fell-Gesetz Länge, Ton und Legerichtung: jede fellStreu-Zeile (und jedes
// Schweif-Segment) wirkt auf ihrer Streu-Schale (Ellipsoid-Abstand e ≈ 1, Abfall über `reich`), gewichtet
// mit ihrer Strähnen-Dichte je Fläche. Die Schale s liegt bei (s+1)/N der Länge, zur Spitze hin mit der
// Legerichtung gekämmt (Lean ∝ t²). Attribute: aSchale (t = 0..1 innen → außen · lokale Dichte relativ zum
// Median · Haar-Zellen je Einheit = √Median — das Raster der Lab-Strähnen) · aWurzel (der Bind-Punkt
// der Haar-Wurzel — die Haar-Maske liest ihn, damit jedes Haar EINE Säule über alle Schalen bleibt) ·
// color (der gemischte Ton, linear). Das Welt-Material (Klasse fellSchale) maskiert und schattiert.
// Benannt, nicht gegossen: die eine Kopf-Zeile des Gesetzes (headGroup, 30 Strähnen) — 5 % der Leib-Dichte,
// in der Welt 2,8 × 0,8 mm (≈ 0,2 px breit bei 2 m); Kopf-Schalen kosteten ~9k Dreiecke für ein Büschel
// unter dem Pixel. Die Kopf-Haut trägt den Fell-Look (FELL_LOOK.koerper).
var TIER_FELL = Object.freeze({
    schalen: 6,
    basisVox: 2, // Schalen-Basis = jeder basisVox-te Rasterpunkt der Haut
    clr: 0.5, // × vox: die Basis liegt knapp über der Haut
    reich: 0.6, // Zeilen-Abfall in Ellipsoid-Einheiten um e = 1
    kamm: 0.6, // Lean zur Spitze (× Länge)
});
function __tierFellSchalen(hk, f, nx, ny, nz, lo, vox, zentren, skinJoints, eW2, kandidaten, fell, B, root, H) {
    const s = TIER_FELL.basisVox;
    const nx2 = Math.floor((nx - 1) / s) + 1,
        ny2 = Math.floor((ny - 1) / s) + 1,
        nz2 = Math.floor((nz - 1) / s) + 1;
    const f2 = new Float32Array(nx2 * ny2 * nz2);
    for (let k = 0; k < nz2; k++)
        for (let j = 0; j < ny2; j++)
            for (let i = 0; i < nx2; i++) f2[i + nx2 * (j + ny2 * k)] = f[i * s + nx * (j * s + ny * k * s)];
    const basis = __huelleAusFeld(
        hk,
        f2,
        nx2,
        ny2,
        nz2,
        lo,
        vox * s,
        0,
        TIER_FELL.clr * vox,
        zentren,
        skinJoints,
        eW2,
        kandidaten
    );
    if (!basis) throw new Error("FELL: die Schalen-Basis lieferte keine Fläche");
    // Die Zeilen in den Root-Raum (Ellipsoid-Inverse + Legerichtung).
    root.updateMatrixWorld(true);
    const invRoot = new THREE.Matrix4().copy(root.matrixWorld).invert();
    const zeilen = [];
    const zeile = (node, c, r, sc, d, n, l, ton) => {
        if (!(n > 0) || !(l > 0)) return;
        const M = new THREE.Matrix4().multiplyMatrices(invRoot, node.matrixWorld);
        const dw = new THREE.Vector3(d[0], d[1], d[2]).transformDirection(M);
        const rx = r * sc[0],
            ry = r * sc[1],
            rz = r * sc[2];
        zeilen.push({
            Mi: Float64Array.from(new THREE.Matrix4().copy(M).invert().elements),
            c,
            rx,
            ry,
            rz,
            dw,
            dichte: n / (rx * ry + ry * rz + rx * rz),
            l,
            ton: fell.toene[ton] || fell.toene.B,
        });
    };
    const bX = (B.masse && B.masse.bX) || 1;
    for (const row of fell.rows) {
        if (row.art === "deck") {
            for (const [wirt, anteil] of row.wirte || []) {
                const t3 = fell.T[wirt];
                if (!t3) continue;
                const r = 0.3 * H * Math.sqrt(anteil * 3),
                    sc = [bX, 0.95, 1.15];
                zeile(root, t3, r, sc, row.d, row.uDens * anteil, row.underL, "D");
                zeile(root, t3, r, sc, row.d, row.gDens * anteil, row.guardL, "B");
                zeile(root, t3, r, sc, row.d, row.gDens * anteil * row.hellQuote, 0.06, "L");
            }
            continue;
        }
        const node = B.teile[row.teil];
        if (node) zeile(node, row.c, row.r, row.sc, row.d, row.n, row.l + (row.lj != null ? row.lj : 0.015) / 2, row.ton);
    }
    // Das Schweif-Gesetz des Ofens (Lab-Streu je Segment: (28 − 2i)·9 Strähnen, Länge 0.047 − 0.003·i im
    // Mittel, nach hinten gekämmt) — dieselben Zahlen wie die gefallenen Schweif-Strähnen.
    for (const sw of fell.schweif)
        zeile(sw.node, [0, 0, -0.048 * H], sw.segR, [0.95, 1.18, 1.18], [0, -0.12, -0.92], (28 - 2 * sw.i) * 9, 0.047 - 0.003 * sw.i, "B");
    const pa = basis.attributes.position,
        na = basis.attributes.normal,
        Vs = pa.count;
    const len = new Float32Array(Vs),
        dichte = new Float32Array(Vs),
        kamm = new Float32Array(Vs * 3),
        ton = new Float32Array(Vs * 3);
    const reich = TIER_FELL.reich;
    for (let i = 0; i < Vs; i++) {
        const x = pa.getX(i),
            y = pa.getY(i),
            z = pa.getZ(i);
        let W = 0,
            L = 0,
            dx = 0,
            dy = 0,
            dz = 0,
            cr = 0,
            cg = 0,
            cb = 0;
        for (const zl of zeilen) {
            const m = zl.Mi;
            const qx = (m[0] * x + m[4] * y + m[8] * z + m[12] - zl.c[0]) / zl.rx,
                qy = (m[1] * x + m[5] * y + m[9] * z + m[13] - zl.c[1]) / zl.ry,
                qz = (m[2] * x + m[6] * y + m[10] * z + m[14] - zl.c[2]) / zl.rz;
            const e = Math.sqrt(qx * qx + qy * qy + qz * qz);
            const nah = 1 - Math.abs(e - 1) / reich;
            if (nah <= 0) continue;
            const w = nah * zl.dichte;
            W += w;
            L += w * zl.l;
            dx += w * zl.dw.x;
            dy += w * zl.dw.y;
            dz += w * zl.dw.z;
            cr += w * zl.ton[0];
            cg += w * zl.ton[1];
            cb += w * zl.ton[2];
        }
        dichte[i] = W;
        if (W > 0) {
            len[i] = L / W;
            // Legerichtung tangential (der Anteil entlang der Normale ist die Länge selbst).
            const nx0 = na.getX(i),
                ny0 = na.getY(i),
                nz0 = na.getZ(i);
            const dn = (dx * nx0 + dy * ny0 + dz * nz0) / W;
            const tx = dx / W - dn * nx0,
                ty = dy / W - dn * ny0,
                tz = dz / W - dn * nz0;
            const tl = Math.sqrt(tx * tx + ty * ty + tz * tz) || 1;
            kamm[i * 3] = tx / tl;
            kamm[i * 3 + 1] = ty / tl;
            kamm[i * 3 + 2] = tz / tl;
            ton[i * 3] = cr / W;
            ton[i * 3 + 1] = cg / W;
            ton[i * 3 + 2] = cb / W;
        } else {
            // Kein Gesetz trägt diesen Punkt: kahl (die Schalen fallen auf die Basis), Ton = Körper.
            ton[i * 3] = fell.toene.B[0];
            ton[i * 3 + 1] = fell.toene.B[1];
            ton[i * 3 + 2] = fell.toene.B[2];
        }
    }
    // Das Haar-Raster folgt der Gesetz-Dichte: Zellen je Einheit = √(Median Strähnen je Fläche) — der
    // Abstand der Lab-Strähnen (Wolf ~0.012); die lokale Dichte (relativ zum Median) skaliert die Locke.
    const belegt = Array.from(dichte)
        .filter((w) => w > 0)
        .sort((a, b) => a - b);
    const median = belegt.length ? belegt[belegt.length >> 1] : 1;
    const zellen = Math.sqrt(median);
    // Der Schalen-Stapel: N Kopien der Basis, jede auf ihrer Höhe, gekämmt, gleich gewichtet.
    const N = TIER_FELL.schalen;
    const si = basis.attributes.skinIndex,
        sw = basis.attributes.skinWeight;
    const idx0 = basis.index.array;
    const P = new Float32Array(Vs * N * 3),
        Nn = new Float32Array(Vs * N * 3),
        C = new Float32Array(Vs * N * 3),
        Wz = new Float32Array(Vs * N * 3),
        T = new Float32Array(Vs * N * 3),
        SI = new Float32Array(Vs * N * 4),
        SW = new Float32Array(Vs * N * 4),
        I = new Uint32Array(idx0.length * N);
    for (let sN = 0; sN < N; sN++) {
        const t = (sN + 1) / N;
        const o = sN * Vs;
        for (let i = 0; i < Vs; i++) {
            const v = o + i;
            const lt = len[i] * t,
                lk = len[i] * t * t * TIER_FELL.kamm;
            const nx0 = na.getX(i),
                ny0 = na.getY(i),
                nz0 = na.getZ(i);
            P[v * 3] = pa.getX(i) + nx0 * lt + kamm[i * 3] * lk;
            P[v * 3 + 1] = pa.getY(i) + ny0 * lt + kamm[i * 3 + 1] * lk;
            P[v * 3 + 2] = pa.getZ(i) + nz0 * lt + kamm[i * 3 + 2] * lk;
            Nn[v * 3] = nx0;
            Nn[v * 3 + 1] = ny0;
            Nn[v * 3 + 2] = nz0;
            Wz[v * 3] = pa.getX(i);
            Wz[v * 3 + 1] = pa.getY(i);
            Wz[v * 3 + 2] = pa.getZ(i);
            C[v * 3] = ton[i * 3];
            C[v * 3 + 1] = ton[i * 3 + 1];
            C[v * 3 + 2] = ton[i * 3 + 2];
            T[v * 3] = t;
            T[v * 3 + 1] = Math.min(1.6, dichte[i] / median);
            T[v * 3 + 2] = zellen;
            for (let k = 0; k < 4; k++) {
                SI[v * 4 + k] = si.array[i * 4 + k];
                SW[v * 4 + k] = sw.array[i * 4 + k];
            }
        }
        for (let q = 0; q < idx0.length; q++) I[sN * idx0.length + q] = idx0[q] + o;
    }
    basis.dispose();
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(P, 3));
    geo.setAttribute("normal", new THREE.BufferAttribute(Nn, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(C, 3));
    geo.setAttribute("aWurzel", new THREE.BufferAttribute(Wz, 3));
    geo.setAttribute("aSchale", new THREE.BufferAttribute(T, 3));
    geo.setAttribute("skinIndex", new THREE.BufferAttribute(SI, 4));
    geo.setAttribute("skinWeight", new THREE.BufferAttribute(SW, 4));
    geo.setIndex(new THREE.BufferAttribute(I, 1));
    return geo;
}

// ── DER GENERISCHE GELENK-GUSS (ein Gesetz für Tier UND Mensch): Meshes in den
// Lokal-Raum ihres nächsten ANIMIERTEN Gelenks backen, je (Gelenk × Klasse)
// mergen, Gelenk-Baum als __skelett-Beipack (mit root-Namen) anhängen. ──
function __bakeGelenkBaum(root, rootName, nodeName, fein, beipack) {
    root.updateMatrixWorld(true);
    const animAhn = (node) => {
        let cur = node;
        while (cur) {
            if (nodeName.has(cur)) return cur;
            cur = cur.parent;
        }
        return root;
    };
    const inv = new THREE.Matrix4();
    const loc = new THREE.Matrix4();
    const p3 = new THREE.Vector3(),
        q4 = new THREE.Quaternion(),
        s3 = new THREE.Vector3();
    const joints = [];
    for (const [node, name] of nodeName) {
        if (node === root) {
            // Die WURZEL trägt ihre EIGENE Pose mit (morphAuf legt z. B. den
            // Größen-Dial als charScale auf den character-Root — hart [1,1,1]
            // verwarf den Höhen-Dial: gemessen h1==h0, die D-Linse feuerte).
            root.updateMatrixWorld(true);
            loc.copy(root.matrixWorld).decompose(p3, q4, s3);
            joints.push({
                name,
                parent: null,
                pos: [p3.x, p3.y, p3.z],
                quat: [q4.x, q4.y, q4.z, q4.w],
                scale: [s3.x, s3.y, s3.z],
            });
            continue;
        }
        const paNode = animAhn(node.parent);
        const parentName = nodeName.get(paNode) || rootName;
        inv.copy(paNode.matrixWorld).invert();
        loc.multiplyMatrices(inv, node.matrixWorld);
        loc.decompose(p3, q4, s3);
        joints.push({
            name,
            parent: parentName,
            pos: [p3.x, p3.y, p3.z],
            quat: [q4.x, q4.y, q4.z, q4.w],
            scale: [s3.x, s3.y, s3.z],
        });
    }
    const buckets = new Map();
    const tmp = new THREE.Matrix4();
    root.traverse((node) => {
        // __nichtGiessen (V18.497): das Primitiv lebt in einer Haut oder fällt im Fern-Standbild.
        if (!node.isMesh || !node.geometry || node.userData.__nichtGiessen) return;
        const a = fein ? root : animAhn(node);
        const jName = nodeName.get(a) || rootName;
        const klasse = (node.material && node.material.userData && node.material.userData.__klasse) || "fell";
        const key = jName + "|" + klasse + (node.geometry.attributes.skinIndex ? "|skin" : "");
        inv.copy(a.matrixWorld).invert();
        tmp.multiplyMatrices(inv, node.matrixWorld);
        const g2 = node.geometry.clone();
        g2.applyMatrix4(tmp);
        if (!buckets.has(key)) buckets.set(key, { geos: [], mat: node.material, joint: jName });
        buckets.get(key).geos.push(g2);
    });
    const out = new THREE.Group();
    for (const b of buckets.values()) {
        const merged = b.geos.length === 1 ? b.geos[0] : __tierMergeGeos(b.geos);
        if (b.geos.length > 1) for (const g of b.geos) g.dispose();
        const mesh = new THREE.Mesh(merged, b.mat);
        mesh.userData.__assetJoint = b.joint;
        out.add(mesh);
    }
    root.traverse((n) => {
        if (n.isMesh && n.geometry) n.geometry.dispose();
    });
    out.userData.__skelett = Object.assign({ root: rootName, joints }, beipack || {});
    out.updateMatrixWorld(true);
    return out;
}

// ── DER MENSCH-GUSS: bauMensch(F) + morphAuf(dials) durch DENSELBEN Gelenk-Guss.
// ov = { dials, skinColor, hairColor } (Genom/Studio — Zahlen; Farben reisen
// linear via mp wie beim Tier). Gelenke = die Rig-Gruppen (torso·head·arm/
// elbow/hand·hip/knee/ankle je Seite) — dieselben Namen liest der Stamm-Rig. ──
function bakeMenschInstance(kern, presetId, seed, lod, ov) {
    const dials = Object.assign({}, kern.START_PARAMS || {}, (ov && ov.dials) || {});
    // BOOT-LITERAL-ABSCHIED (18.07.): der ov-lose Bake zieht seine Default-
    // Töne aus den KERN-Paletten (benannte Anker karamell/darkbrown — der
    // Bäcker hält das Gesetzbuch ja in der Hand), nie mehr aus paletten-
    // fremden Literalen. Kern ohne Paletten → Bruch (fail-closed, der
    // Reply-Fänger meldet leer — die Tabellen sind Vertragsfläche).
    const _sTone = kern.SKIN_TONES && kern.SKIN_TONES.karamell;
    const _hTone = kern.HAIR_COLORS && kern.HAIR_COLORS.darkbrown;
    const skinCol =
        ov && typeof ov.skinColor === "number" ? ov.skinColor : _sTone ? _sTone.hex >>> 0 : null;
    const hairCol =
        ov && typeof ov.hairColor === "number" ? ov.hairColor : _hTone ? _hTone.base >>> 0 : null;
    if (skinCol === null || hairCol === null)
        throw new Error("koerper-Kern ohne Paletten (SKIN_TONES/HAIR_COLORS) — kein Guss-Ton ohne Gesetz");
    const MK = kern.MATERIAL_KLASSEN || {};
    const KL = Object.assign({}, MK, {
        skin: { c: skinCol, r: 0.62, seh: "haut" },
        haut: { c: skinCol, r: 0.58, seh: "haut" }, // die glatte Hüllen-HAUT (V18.463)
        hair: { c: hairCol, r: 0.85, seh: "haar" },
    });
    const fein = (lod | 0) >= 1;
    const segW = fein ? 8 : 20,
        segH = fein ? 6 : 14,
        segZ = fein ? 6 : 14;
    const lin = (hx) => {
        const f = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
        return [f(((hx >> 16) & 255) / 255), f(((hx >> 8) & 255) / 255), f((hx & 255) / 255)];
    };
    const matCache = {};
    const matFuer = (k) => {
        if (matCache[k]) return matCache[k];
        const kl = KL[k] || KL.skin;
        const m = new THREE.MeshStandardMaterial({ roughness: kl.r != null ? kl.r : 0.6, metalness: 0 });
        // KL.skin trägt IMMER ein c (skinCol oben, palette-bewiesen) — der
        // Ketten-Fallback ist derselbe Ton, kein zweiter Zahlensatz.
        const lc = lin(kl.c != null ? kl.c : skinCol);
        m.color.setRGB(lc[0], lc[1], lc[2]);
        if (k === "hair") m.side = THREE.DoubleSide; // Strähnen-Kreuzquads (wie straehne)
        if (kl.webe) m.userData.__webe = kl.webe; // Stoff-Webung (Welt-Leser moduliert Mikro-Struktur)
        // DIE SEH-KLASSE (Integration W8): das Feld der Klasse (koerper MATERIAL_KLASSEN · Haut/Haar · Kleid-Zone);
        // fehlt es, reist der Stoff ohne Klasse (das Budget-Gesetz meldet den Bruch).
        if (kl.seh) m.userData.__seh = kl.seh;
        if (kl.emissiv != null && m.emissive) {
            const le = lin(kl.emissiv);
            m.emissive.setRGB(le[0], le[1], le[2]);
            // AUGEN-GLUT-SCHNITT: dasselbe Vertrags-Feld `ei` wie der Tier-Bäcker
            // (EINE Quelle; koerper deklariert heute kein emissiv — byte-neutral).
            m.emissiveIntensity = kl.ei != null ? kl.ei : 1;
        }
        m.userData.__klasse = k;
        matCache[k] = m;
        return m;
    };
    const F = {
        gruppe: () => new THREE.Group(),
        kugel: (r, k, sc) => {
            if (k === "cornea") return new THREE.Group(); // transparente Schale entfällt (wie der Stamm-Ofen zuvor)
            const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, segW, segH), matFuer(k));
            if (sc) mesh.scale.set(sc[0], sc[1], sc[2]);
            return mesh;
        },
        zylinder: (rt, rb, h, k) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segZ, 1), matFuer(k)),
    };
    const B = kern.bauMensch(F);
    kern.morphAuf(B, dials);
    // Die gemalten Shorts: dieselbe Teil-Namen-Regel wie der Stamm zuvor.
    for (const pn of ["pelvis", "glute1", "glute-1"]) {
        const teil = B.parts[pn];
        if (teil && teil.material) teil.material = matFuer("shorts");
    }
    // DIE HAUT+KLEID-HÜLLEN (V18.463, „die Haut fehlt"): DIESELBE Hüllen-
    // Maschine wie das Studio (koerper-core: Voxel-Splat → Closing → Fill →
    // Blur → Surface-Nets) baut GESCHLOSSENE glatte Hüllen über den Teil-
    // Primitiven — eine HAUT-Hülle (Hals bis Knöchel, Kopf/Hände frei: dort
    // trägt der Baum sein echtes Gesicht/seine Finger) und je kleidZonen-Zeile
    // eine Stoff-Hülle. Gewichte je Vertex: 1/d⁴ über die Teil-Zentren (die
    // Lab-Bindung), aggregiert aufs animierte GELENK → skinIndex/skinWeight
    // reisen im Umschlag, die Welt bindet SkinnedMesh an Bone-Gelenke. Die
    // V18.461-Inflate-Klone (Muskel-Relief-Kleidung) sind GEFALLEN.
    const nodeNameFuerHuelle = new Map();
    {
        const namenH = [
            "torso",
            "head",
            "arm1",
            "arm-1",
            "elbow1",
            "elbow-1",
            "hand1",
            "hand-1",
            "hip1",
            "hip-1",
            "knee1",
            "knee-1",
            "ankle1",
            "ankle-1",
        ];
        nodeNameFuerHuelle.set(B.character, "mensch");
        for (const n of namenH) if (B.parts[n]) nodeNameFuerHuelle.set(B.parts[n], n);
    }
    const skinJoints = ["mensch", "torso", "head", "arm1", "arm-1", "elbow1", "elbow-1", "hand1", "hand-1", "hip1", "hip-1", "knee1", "knee-1", "ankle1", "ankle-1"];
    if (typeof kern.surfaceNets === "function" && typeof kern.kleidZonen === "function") {
        B.character.updateMatrixWorld(true);
        const invChar = new THREE.Matrix4().copy(B.character.matrixWorld).invert();
        const tmpM = new THREE.Matrix4();
        const tmpV = new THREE.Vector3();
        const animAhnH = (node) => {
            let cur = node;
            while (cur) {
                if (nodeNameFuerHuelle.has(cur)) return nodeNameFuerHuelle.get(cur);
                cur = cur.parent;
            }
            return "mensch";
        };
        // Punkte eines Teil-Meshes in Charakter-Lokalraum (dicht: alle Vertices).
        const punkteVon = (mesh, ziel, zentren, joint) => {
            tmpM.multiplyMatrices(invChar, mesh.matrixWorld);
            const pa = mesh.geometry.attributes.position;
            let cx = 0,
                cy = 0,
                cz = 0;
            for (let i = 0; i < pa.count; i++) {
                tmpV.set(pa.getX(i), pa.getY(i), pa.getZ(i)).applyMatrix4(tmpM);
                ziel.push([tmpV.x, tmpV.y, tmpV.z]);
                cx += tmpV.x;
                cy += tmpV.y;
                cz += tmpV.z;
            }
            if (pa.count) zentren.push({ j: joint, c: [cx / pa.count, cy / pa.count, cz / pa.count] });
        };
        // Eine Hülle backen: Punkte → Feld → Nets → 2× Laplace → CLR-Push →
        // Gewichte → SkinnedGeo. clr = Abstand AUS der Haut (das Lab-Prinzip;
        // ohne ihn stechen die Muskel-Primitiven durch die Hülle).
        const backeHuelle = (pts, zentren, klasse, vox, sigma, level, clr) => {
            if (pts.length < 24) return;
            const lo = [1e9, 1e9, 1e9],
                hi = [-1e9, -1e9, -1e9];
            for (const p of pts)
                for (let d = 0; d < 3; d++) {
                    if (p[d] < lo[d]) lo[d] = p[d];
                    if (p[d] > hi[d]) hi[d] = p[d];
                }
            for (let d = 0; d < 3; d++) {
                lo[d] -= 0.3;
                hi[d] += 0.3;
            }
            const nx = Math.ceil((hi[0] - lo[0]) / vox) + 3,
                ny = Math.ceil((hi[1] - lo[1]) / vox) + 3,
                nz = Math.ceil((hi[2] - lo[2]) / vox) + 3;
            let g = new Uint8Array(nx * ny * nz);
            for (const p of pts) {
                let a = Math.floor((p[0] - lo[0]) / vox),
                    b = Math.floor((p[1] - lo[1]) / vox),
                    c = Math.floor((p[2] - lo[2]) / vox);
                if (a < 0) a = 0;
                if (a >= nx) a = nx - 1;
                if (b < 0) b = 0;
                if (b >= ny) b = ny - 1;
                if (c < 0) c = 0;
                if (c >= nz) c = nz - 1;
                g[a + nx * (b + ny * c)] = 1;
            }
            g = kern.voxDilate(g, nx, ny, nz, 1);
            g = kern.voxDilate(g, nx, ny, nz, 2);
            g = kern.voxErode(g, nx, ny, nz, 2);
            g = kern.voxFill(g, nx, ny, nz);
            let f = new Float32Array(g.length);
            for (let i = 0; i < g.length; i++) f[i] = g[i];
            f = kern.blur3(f, nx, ny, nz, sigma);
            const geo = __huelleAusFeld(kern, f, nx, ny, nz, lo, vox, level, clr, zentren, skinJoints, 0.04);
            if (!geo) return;
            const mesh = new THREE.Mesh(geo, matFuer(klasse));
            mesh.userData.__skinned = true;
            B.character.add(mesh);
            mesh.position.set(0, 0, 0); // Geometrie ist Charakter-lokal
            gebauteHuellen.push(mesh);
        };
        const gebauteHuellen = [];
        const voxMul = fein ? 1.6 : 1.0;
        // DIE SPREIZ-POSE (das Lab-Gesetz „bake once in a spread pose"): bei
        // hängenden Armen verschmilzt das Voxel-Feld Arm+Torso zu EINEM Blob.
        // Also: Arme heben + Beine leicht spreizen, Hüllen DORT backen, dann
        // jeden Vertex per LBS (Gelenk-Delta Spreiz→Default) zurückrechnen —
        // exakt die Transformation, die die Welt-Bones später live fahren.
        const SPREIZ = { arm1: 1.05, "arm-1": -1.05, hip1: 0.14, "hip-1": -0.14 };
        const spreizAlt = {};
        for (const jn of Object.keys(SPREIZ)) {
            const nd = B.parts[jn];
            if (!nd) continue;
            spreizAlt[jn] = nd.rotation.z;
            nd.rotation.z += SPREIZ[jn];
        }
        B.character.updateMatrixWorld(true);
        const mSpreiz = {};
        for (const [nd, nm] of nodeNameFuerHuelle) {
            mSpreiz[nm] = new THREE.Matrix4().multiplyMatrices(invChar, nd.matrixWorld);
        }
        // 1) DIE HAUT: alle skin-Teile außer Kopf/Hände/Füße (dort echtes Detail).
        {
            const pts = [],
                zen = [];
            B.character.traverse((node) => {
                if (!node.isMesh || !node.geometry) return;
                const kl = node.material && node.material.userData && node.material.userData.__klasse;
                if (kl !== "skin") return;
                const j = animAhnH(node);
                if (j === "head" || j === "hand1" || j === "hand-1" || j === "ankle1" || j === "ankle-1") return;
                punkteVon(node, pts, zen, j);
            });
            backeHuelle(pts, zen, "haut", 0.05 * voxMul, 1.4, 0.42, 0.028);
        }
        // 2) DIE KLEID-ZONEN (das Gesetz sagt WAS, die Maschine baut die Hülle):
        for (const z of kern.kleidZonen(dials) || []) {
            const km = "stoff_" + (z.hex >>> 0).toString(16);
            // STOFF-CHARAKTER (V18.464): rough je Schnitt aus der Gesetz-Zeile
            // (Lab getCloth verbatim) + Webungs-Art als must-ignore-Marker.
            KL[km] = { c: z.hex, r: typeof z.rough === "number" ? z.rough : 0.82, webe: z.webe || null, seh: "stoff" };
            const pts = [],
                zen = [];
            for (const tn of z.teile || []) {
                const teil = B.parts[tn];
                if (!teil) continue;
                if (teil.isMesh) punkteVon(teil, pts, zen, animAhnH(teil));
                else
                    teil.traverse((n2) => {
                        if (n2.isMesh && n2.geometry && !n2.userData.__skinned) punkteVon(n2, pts, zen, animAhnH(n2));
                    });
            }
            backeHuelle(pts, zen, km, 0.06 * voxMul, 1.5, 0.38, 0.12);
        }
        // ZURÜCK IN DIE DEFAULT-POSE: Gelenke restaurieren, je Gelenk das
        // Delta default×inv(spreiz) (Charakter-lokal), jeden Hüllen-Vertex
        // gewichtet transformieren (die eine LBS-Formel), Normalen frisch.
        for (const jn of Object.keys(spreizAlt)) B.parts[jn].rotation.z = spreizAlt[jn];
        B.character.updateMatrixWorld(true);
        const delta = {};
        for (const [nd, nm] of nodeNameFuerHuelle) {
            const mDef = new THREE.Matrix4().multiplyMatrices(invChar, nd.matrixWorld);
            delta[nm] = mDef.multiply(new THREE.Matrix4().copy(mSpreiz[nm]).invert());
        }
        const deltaListe = skinJoints.map((nm) => delta[nm] || new THREE.Matrix4());
        const vSrc = new THREE.Vector3();
        const vAkk = new THREE.Vector3();
        const vTmp = new THREE.Vector3();
        for (const mesh of gebauteHuellen) {
            const pa = mesh.geometry.attributes.position;
            const si = mesh.geometry.attributes.skinIndex;
            const sw = mesh.geometry.attributes.skinWeight;
            const swA = sw.array,
                siA = si.array; // r128-sicher (getComponent gibt es erst später)
            for (let i = 0; i < pa.count; i++) {
                vSrc.set(pa.getX(i), pa.getY(i), pa.getZ(i));
                vAkk.set(0, 0, 0);
                for (let k = 0; k < 4; k++) {
                    const w = swA[i * 4 + k];
                    if (!w) continue;
                    vTmp.copy(vSrc).applyMatrix4(deltaListe[siA[i * 4 + k]]);
                    vAkk.addScaledVector(vTmp, w);
                }
                pa.setXYZ(i, vAkk.x, vAkk.y, vAkk.z);
            }
            pa.needsUpdate = true;
            mesh.geometry.computeVertexNormals();
        }
    }
    // DAS BAUM-HAAR (V18.461): kern.haarStreu streut die Frisur als Strähnen
    // über die Schädel-Kalotte — dieselbe __streuGeo wie das Fell (Wurzel→
    // Spitze-Verlauf als Vertex-Farben, deterministischer LCG). lod1 bleibt kahl.
    if (!fein && typeof kern.haarStreu === "function") {
        const tonH = lin(hairCol);
        let seedH = 7117;
        for (const row of kern.haarStreu(dials) || []) {
            seedH++;
            const wirt = B.parts[row.teil];
            if (!wirt) continue;
            const geo = __streuGeo(row, seedH, tonH);
            if (geo) wirt.add(new THREE.Mesh(geo, matFuer("hair")));
        }
    }
    const namen = [
        "torso",
        "head",
        "arm1",
        "arm-1",
        "elbow1",
        "elbow-1",
        "hand1",
        "hand-1",
        "hip1",
        "hip-1",
        "knee1",
        "knee-1",
        "ankle1",
        "ankle-1",
        // V18.491.85 — Augen-Welle: iris/lid/eye als Ofen-Gelenke (NICHT skinJoints).
        "irisL",
        "irisR",
        "lidTL",
        "lidTR",
        "lidBL",
        "lidBR",
        "eyeL",
        "eyeR",
    ];
    const nodeName = new Map();
    nodeName.set(B.character, "mensch");
    for (const n of namen) if (B.parts[n]) nodeName.set(B.parts[n], n);
    return __bakeGelenkBaum(B.character, "mensch", nodeName, fein, {
        art: presetId,
        base: skinCol,
        // V18.463 — die Bone-Ordnung der Haut-/Kleid-Hüllen (skinIndex zeigt hierauf).
        skinJoints: skinJoints,
    });
}

// Der Tisch (M8: Tabelle vor if) — die Shell-Dispatch UND der Stamm-Kaltpfad
// schlagen hier nach; neue MESHFREI-Gattungen registrieren eine Zeile.
var BAKERS_BY_KIND = { kreatur: bakeTierInstance, koerper: bakeMenschInstance };

// DIAL-ZWILLINGS-ABSCHIED (18.07., rein additiv) — die Pflanzen-Rezept-Tafel
// reist im Terrain-Namensraum zum SYNCHRONEN Stamm-Leser (die Tor-Klasse:
// die Gestalt-Tafel entscheidet, nie der async Buch-Lade-Stand): der
// GEFÜHLTE Baum (Wuchs → Kollision/Silhouette/Boot) liest DIESELBEN Dials
// wie der GESEHENE (buildInstance liest dieselben PRESETS im Worker).
// Zuweisung hier (nach der PRESETS-Definition — const ist kein Global).
__terrainCore.PHYTO_PRESETS = PRESETS;
// DIE BODEN-PALETTE reist im Terrain-Namensraum zum SYNCHRONEN Stamm-Leser (`AnazhRealm.BODEN_FARBE`, rein
// additiv): der Voxel-Worker faerbt jeden Chunk-Vertex mit ihr, darum muss sie VOR dem ersten Chunk feststehen —
// der async Buch-Umschlag (get-book) kam zu spaet und trug nur vier ihrer Werte.
__terrainCore.PORTAL_GROUND = PORTAL_GROUND;
// Die Halm-Spitze des Grases (emitGrass) reist mit: der Stamm hellt den Saison-Akzent um DIESELBE Zahl auf (rein additiv).
__terrainCore.GRAS_SPITZE_HELL = GRAS_SPITZE_HELL;
