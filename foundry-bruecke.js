// AnazhRealm — foundry-bruecke.js: DIE FOUNDRY-BRÜCKE (Karte K42, synthese §0 Bruch 3 / §4 W2a).
// Der Bau-Teil der Pflanzen-Shell als EIN Modul: die Wirts-Globalen, die foundry-core liest und schreibt (PRNG,
// Vektor-Helfer, Simplex, Stoffe, Saison-Tint, Regler-Kontext, LOD-Band) und die Asset-Kanäle (build-asset · get-book ·
// export-settlement). Eine Karte backt hier keiner: ihr EINER Bäcker ist der Welt-Renderer (`_karteWeltBacken`, pipeline.K2). Klassisches Script
// (die Top-Level-Symbole bleiben global wie in foundry-core), geladen NACH den Kernen. ZWEI Leser, KEIN Zwilling:
// der Foundry-Worker (cores.manifest.json `bruecke`, ?v=; er lädt keine Labor-Shell und keine Labor-Szene) und das
// Pflanzen-Labor (worlds/terrain/index.html, vor phytogenesis.js). Der Stempel der Platte hasht diese Datei, nie die
// Shell: ein UI-Edit am Labor lässt den Asset-Cache aller Spieler stehen. Wörtlich verschoben aus phytogenesis.js
// (Basis 3e13e7bc) — jedes Foundry-Asset bleibt bit-gleich.

/* ---------- Konstanten & deterministischer PRNG (Saat -> Individuum) ------- */
/* V18.491.243 — Lab Phyllotaxis golden ← PHYLO_GESETZ.golden fail-soft; Host none (PHYLO_VIS). FIB stays local (dead). */
const GOLDEN_FALLBACK = Math.PI * (3 - Math.sqrt(5)); // 137.50776 deg Phyllotaxis
const _PHYLO_G = (typeof window !== "undefined" && window.__phytoCore && window.__phytoCore.PHYLO_GESETZ) || null;
const GOLDEN = (_PHYLO_G && isFinite(_PHYLO_G.golden)) ? _PHYLO_G.golden : GOLDEN_FALLBACK;
const FIB = [3, 5, 8, 13, 21, 34, 55];
let RNG = mulberry32(12345);
const rnd = () => RNG();
const rrange = (a, b) => a + (b - a) * RNG();
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;

/* ---------- Vektor-Helfer (THREE-frei: portabel & headless prüfbar) -------- */
const vsub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const vadd = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const vscl = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const vdot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const vlen = (a) => Math.hypot(a[0], a[1], a[2]);
const vnorm = (a) => {
    const l = vlen(a) || 1e-9;
    return [a[0] / l, a[1] / l, a[2] / l];
};
const vcross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const vlerp = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/* ---------- 3D Simplex Noise (CPU, fuer Felsen-fBm) ------------------------ */
const _grad3 = [
    [1, 1, 0],
    [-1, 1, 0],
    [1, -1, 0],
    [-1, -1, 0],
    [1, 0, 1],
    [-1, 0, 1],
    [1, 0, -1],
    [-1, 0, -1],
    [0, 1, 1],
    [0, -1, 1],
    [0, 1, -1],
    [0, -1, -1],
];
const _perm = new Uint8Array(512);
(function () {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    let s = mulberry32(7);
    for (let i = 255; i > 0; i--) {
        const j = Math.floor(s() * (i + 1));
        const t = p[i];
        p[i] = p[j];
        p[j] = t;
    }
    for (let i = 0; i < 512; i++) _perm[i] = p[i & 255];
})();
function simplex3(x, y, z) {
    const F3 = 1 / 3,
        G3 = 1 / 6;
    let n0, n1, n2, n3;
    const sN = (x + y + z) * F3,
        i = Math.floor(x + sN),
        j = Math.floor(y + sN),
        k = Math.floor(z + sN);
    const tN = (i + j + k) * G3,
        X0 = i - tN,
        Y0 = j - tN,
        Z0 = k - tN,
        x0 = x - X0,
        y0 = y - Y0,
        z0 = z - Z0;
    let i1, j1, k1, i2, j2, k2;
    if (x0 >= y0) {
        if (y0 >= z0) {
            i1 = 1;
            j1 = 0;
            k1 = 0;
            i2 = 1;
            j2 = 1;
            k2 = 0;
        } else if (x0 >= z0) {
            i1 = 1;
            j1 = 0;
            k1 = 0;
            i2 = 1;
            j2 = 0;
            k2 = 1;
        } else {
            i1 = 0;
            j1 = 0;
            k1 = 1;
            i2 = 1;
            j2 = 0;
            k2 = 1;
        }
    } else {
        if (y0 < z0) {
            i1 = 0;
            j1 = 0;
            k1 = 1;
            i2 = 0;
            j2 = 1;
            k2 = 1;
        } else if (x0 < z0) {
            i1 = 0;
            j1 = 1;
            k1 = 0;
            i2 = 0;
            j2 = 1;
            k2 = 1;
        } else {
            i1 = 0;
            j1 = 1;
            k1 = 0;
            i2 = 1;
            j2 = 1;
            k2 = 0;
        }
    }
    const x1 = x0 - i1 + G3,
        y1 = y0 - j1 + G3,
        z1 = z0 - k1 + G3,
        x2 = x0 - i2 + 2 * G3,
        y2 = y0 - j2 + 2 * G3,
        z2 = z0 - k2 + 2 * G3,
        x3 = x0 - 1 + 3 * G3,
        y3 = y0 - 1 + 3 * G3,
        z3 = z0 - 1 + 3 * G3;
    const ii = i & 255,
        jj = j & 255,
        kk = k & 255;
    const gi0 = _perm[ii + _perm[jj + _perm[kk]]] % 12,
        gi1 = _perm[ii + i1 + _perm[jj + j1 + _perm[kk + k1]]] % 12,
        gi2 = _perm[ii + i2 + _perm[jj + j2 + _perm[kk + k2]]] % 12,
        gi3 = _perm[ii + 1 + _perm[jj + 1 + _perm[kk + 1]]] % 12;
    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 < 0) n0 = 0;
    else {
        t0 *= t0;
        const g = _grad3[gi0];
        n0 = t0 * t0 * (g[0] * x0 + g[1] * y0 + g[2] * z0);
    }
    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 < 0) n1 = 0;
    else {
        t1 *= t1;
        const g = _grad3[gi1];
        n1 = t1 * t1 * (g[0] * x1 + g[1] * y1 + g[2] * z1);
    }
    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 < 0) n2 = 0;
    else {
        t2 *= t2;
        const g = _grad3[gi2];
        n2 = t2 * t2 * (g[0] * x2 + g[1] * y2 + g[2] * z2);
    }
    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 < 0) n3 = 0;
    else {
        t3 *= t3;
        const g = _grad3[gi3];
        n3 = t3 * t3 * (g[0] * x3 + g[1] * y3 + g[2] * z3);
    }
    return 32 * (n0 + n1 + n2 + n3);
}

// Zwei-Pass-Laub: geteilte Uniforms fuer den Tiefen-Test (Laub gegen die Struktur-Tiefe verdecken)
const _dummyTex = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, THREE.RGBAFormat);
_dummyTex.needsUpdate = true;
const _folDepthU = {
    uStructDepth: { value: _dummyTex },
    uHalfRes: { value: new THREE.Vector2(1, 1) },
    uFolEnable: { value: 0.0 },
};
let windTarget = 0.05,
    presenceTarget = 1,
    bloomTarget = 1;
let seasonTint = new THREE.Color(0x4f7a30),
    seasonAccent = new THREE.Color(0x6f9a3a);

let barkNormalTex = null,
    barkMat,
    barkMatBirch,
    foliageMat,
    foliageMatKrone, // K68-N1: das Klingen-Laub der Krone (flip-frei, foundry-core injectWind `krone`)
    foliageMatTex,
    grassMat,
    stemMat,
    schattenMat,
    _terMat = null,
    _envMats = [];
let _leafAtlas = null; // FIX v31: foliageMatTex = Multi-Blatt-Texturkarten (L1); _leafAtlas = zur Laufzeit GEMALTER Cluster-Atlas (Canvas-2D, deterministisch, kein GL-Risiko)
/* ---------- Wirts-Handles, die der Kern und das Labor lesen (der Rest der Szene lebt im Labor) ---------- */
let renderer, subject;
let __lod = 0;
let __rockKind = "boulder";
let CURRENT = "eiche",
    SEED = 12345;

/* ---------- Der Dial-Kontext: die Regler, aus denen deriveParams* die Struktur ableiten ---------------------- */
let __dials =
    null; /* buildInstance setzt die kanonischen Preset-Dials (Wald/Templates/Atlas, DOM-frei & deterministisch); das Labor setzt das Regler-Objekt der Hülle (phytogenesis.js DIALS, K47) — nie das DOM */

/* ---------- Saison (Phaenologie) ------------------------------------------ */
let curSeason = "summer";

// EINE Quelle fuers LOD-Band (aus PORTAL_RENDER_CONFIG.lod): <D0 fein, D0..D1 mittel, >D1 Billboard;
// KOMPLEMENTAERES Dither-Crossfade -- dieselbe Maske teilt die Pixel exakt (kein Pop, keine Luecke). FADE0
// 4 = das nahe L0->L1-Band (fast identische Meshes) traegt ein schmaleres Dither-Feld; die Fern-Blende
// (FADE=8, 3D->Billboard) bleibt breit. Editiert der Schoepfer die Distanzen HIER (im Config-Block), folgt
// das Studio-LOD UND — ueber den get-render-config-Kanal — AnazhRealms LOD.
const LOD_D0 = PORTAL_RENDER_CONFIG.lod.d0,
    LOD_D1 = PORTAL_RENDER_CONFIG.lod.d1,
    LOD_FADE = PORTAL_RENDER_CONFIG.lod.fade,
    LOD_FADE0 = PORTAL_RENDER_CONFIG.lod.fade0;
const _lodU = { uLodMaskOn: { value: 1 }, uLodRef: { value: PORTAL_RENDER_CONFIG.lod.ref }, uDitherT: { value: 0 } };
// DER FOUNDRY-MODUS: die Stoffe + der Sommer, ohne Renderer und ohne Szene — der Worker-Start unten UND das Labor im
// Asset-Motor-Modus (?asset-foundry, phytogenesis init) rufen DIESE Funktion. Ein Bruch hier bricht laut (kein try).
function foundryModus() {
    globalThis.__PHYTO_FOUNDRY = true;
    buildMaterials();
    setSeasonColors("summer");
}
// DUAL-TRANSPORT (der P0/P2-Weg zu foundry-core): DIESELBE Brücke antwortet im iframe
// (window.parent.postMessage) UND im Worker (self.postMessage) — EIN Protokoll, kein zweiter Pfad.
const foundryPost =
        typeof window !== "undefined"
            ? (p) => {
                  if (window.parent && window.parent !== window) window.parent.postMessage(p, "*");
              }
            : (p) => self.postMessage(p);
/* ==========================================================================
   DIE ASSET-KANÄLE (W12-Protokoll, Foundry-Teil) — `foundryKanal(msg)` beantwortet jeden Kanal der Tabelle und
   meldet true; alles andere (enter · dsl) gehört dem Labor-Portal (phytogenesis.js).
   ========================================================================== */
const foundryKanal = (() => {
    const __post = foundryPost;
    function __replySettlement(msg) {
        let plan = null;
        try {
            for (const zk of __zweitKerne()) {
                if (typeof zk.kern.exportSettlement === "function") {
                    plan = zk.kern.exportSettlement(msg && msg.dp);
                    break;
                }
            }
        } catch (_e) {
            plan = null;
        }
        if (typeof window === "undefined" || (window.parent && window.parent !== window)) {
            __post({ type: "settlement", world: "terrain", reqId: msg && msg.reqId, plan }, "*");
        }
    }
    // DER SLOT-PLAN (bauen.K2): das gesetzte Haus als Slot eines Plans, reine DATEN — GENERISCH wie __replySettlement liefert
    // ihn der ERSTE Manifest-Kern mit einer slotPlan-Formel (fachwerk: Mass-Bau, Tür, Grundfläche und Grund-Datum, dieselbe
    // Slot-Zeile wie der Export des Dorfs). Er rechnet im Faden: im Haupt-Faden malte sein erster Ruf die Karten des Studios
    // (Radeon kalt 1,18 s).
    function __replySlotPlan(msg) {
        let slot = null;
        for (const zk of __zweitKerne()) {
            if (typeof zk.kern.slotPlan === "function") {
                slot = zk.kern.slotPlan(msg.presetId, msg.seed, msg.ov || null, msg.phi);
                break;
            }
        }
        __post({ type: "slot", world: "terrain", reqId: msg.reqId, slot }, "*");
    }
    // SPIEGEL-ZENSUS 17.07. — DAS SIEDLUNGS-EXISTENZ-GESETZ reist im Buch-
    // Umschlag: GENERISCH wie __replySettlement (M8, kein Kern-Literal) liefert
    // der ERSTE Manifest-Kern mit einer SIEDLUNG-Daten-Zeile (fachwerk-core:
    // cellM/rarity/nHMin/nHSpan) das WO/WIEVIEL der
    // Doerfer. Reine JSON-Daten; kein Kern -> null (der Host bleibt byte-alt).
    function __zweitKernSiedlung() {
        try {
            for (const zk of __zweitKerne()) {
                if (zk.kern && zk.kern.SIEDLUNG && typeof zk.kern.SIEDLUNG === "object") return zk.kern.SIEDLUNG;
            }
        } catch (_e) {}
        return null;
    }
    // SYNERGIE-WELLE — DIE DREI PAYLOAD-QUELLEN (Welt-Palette · Wahrnehmung · Buch)
    // liefern reine Daten; der EINE Umschlag (__replyBook / Kanal "get-book") traegt
    // sie in EINEM Roundtrip. Die drei Einzel-Kanaele (get-recipes/get-world-params/
    // get-render-config) sind GEFALLEN (Abschied, kein Parallelpfad — Host + Gates
    // fragen den Umschlag).
    function __worldParamsPayload() {
        // Reine Daten (JSON-klonbar): NUR die Werte, die AnazhRealm auch LIEST (kein toter Passagier).
        // Die Boden-Palette reist NICHT mehr hier: AnazhRealm liest PORTAL_GROUND synchron im Terrain-Namensraum
        // (__terrainCore.PORTAL_GROUND, foundry-core) — der Voxel-Worker braucht sie vor dem ersten Chunk.
        const params = {
            // ATMOSPHAERE-ANKER (Mittag): Himmel-Top + Sonnenfarbe. AnazhRealms Tag/Nacht-Zyklus
            // animiert den Rest; NUR der Mittags-Stop folgt dem Studio (additiv, kein Einfrieren).
            sky: { top: PORTAL_SKY.top, sun: PORTAL_SKY.sun },
        };
        return params;
    }
    // N2 (Nervensystem-Plan, „Runtime = Validator") — DIE GENERISCHE ZWEIT-KERN-LISTE: der
    // Foundry-Worker injiziert self.__anazhCores (= cores.manifest.json) VOR den importScripts;
    // die Bruecke liest daraus alle Kerne mit eigenem Namensraum (ns != null; das ns-Global via
    // self[ns]) — kein Kern-spezifisches ns-Literal mehr (M8: Tabelle vor if). Ein dritter Kern
    // ist eine Manifest-Zeile, keine Bruecken-Zeile. Fehlt self.__anazhCores (die Portal-FENSTER-
    // Instanz laedt keine Kerne), ist die Liste leer — byte-gleich zum Verhalten ohne Zweit-Kern.
    // DIE LISTE STEHT EINMAL JE FADEN (w28-platte-fein): die Kerne eines Fadens wechseln nach seinem Start nie (der Start laedt sie
    // und die Buecher des Spielers VOR der Bruecke) — die Bruecke liest ihre Namensraeume hier EINMAL, beim Laden dieser Datei.
    // Aufzaehlen ist kein Lesen: bis hier las jeder Ruf jeden Namensraum am globalen Namen neu (`self[c.ns]`), auch die Frage
    // „traegt dieser Kern die Art?"; die Lese-Spur der Platte (`_foundrySchale`, der Abruf am globalen Namen) saehe so in jedem
    // Bau jeden Kern. Ein Bau liest durch diese Liste nur den Kern, der die Art traegt (der Eigner, er steht im Schluessel);
    // liest ein Kern einen anderen, liest er ihn beim Namen — das ist die Spur.
    const __ZWEIT_KERNE = (function () {
        const out = [];
        try {
            const cores = typeof self !== "undefined" && Array.isArray(self.__anazhCores) ? self.__anazhCores : [];
            for (let i = 0; i < cores.length; i++) {
                const c = cores[i];
                if (!c || typeof c.ns !== "string" || !c.ns) continue;
                const kern = self[c.ns];
                if (kern && typeof kern === "object")
                    out.push({ id: typeof c.id === "string" && c.id ? c.id : c.ns, kern });
            }
        } catch (_e) {}
        return out;
    })();
    function __zweitKerne() {
        return __ZWEIT_KERNE;
    }
    function __renderConfigPayload() {
        // Reine Daten (JSON-klonbar) — die EINE Wahrnehmungs-Quelle (PORTAL_RENDER_CONFIG). Tiefe Kopie,
        // damit der Empfaenger nichts am Studio-Objekt mutiert.
        const c = PORTAL_RENDER_CONFIG;
        const cfg = {
            sight: c.sight,
            fogNearMul: c.fogNearMul,
            camFarPad: c.camFarPad,
            // kindStages (LOD-WURZEL 08.07.): die Stufen-Wahrheit je Art als DATEN — welche
            // buildInstance-Stufen eine Art traegt+nutzt (Baum/Strauch [0,1,2] · Gras [1,2]
            // zweistufig · Blume [0,2] · Fels einstufig). Der Empfaenger clampt seine Distanz-Wahl
            // auf die naechste verfuegbare Stufe (tiefe Kopie, JSON-klonbar).
            lod: {
                d0: c.lod.d0,
                d1: c.lod.d1,
                fade: c.lod.fade,
                fade0: c.lod.fade0,
                ref: c.lod.ref,
                hyst: c.lod.hyst,
                kindStages: c.lod.kindStages ? JSON.parse(JSON.stringify(c.lod.kindStages)) : undefined,
                // DAS BUDGET je Art × Stufe reist mit (04.10.) — ohne diese Zeile fiele es auf dem Weg zum
                // Host still weg (die Whitelist kopiert feldweise).
                budget: c.lod.budget ? JSON.parse(JSON.stringify(c.lod.budget)) : undefined,
            },
            density: {
                cell: c.density.cell,
                pack: c.density.pack,
                dartsPerM2: c.density.dartsPerM2,
            },
            understory: {
                grassStep: c.understory.grassStep,
                flowerStep: c.understory.flowerStep,
                bushStep: c.understory.bushStep,
            },
            // NERVENSYSTEM — die Platzierungs-Daten (Welt-Skalen je Preset + Baum-Mul + Streu-
            // Seltenheit) fliessen als reine Zahlen: AnazhRealm liest sie LIVE statt eines
            // hartkodierten Spiegels. Ein neues Asset = eine scale-Zeile in foundry-core.
            // Der Bäcker-Spec (Studio-Vertrag B2): Blickwinkel, Zell-Maße und Hebungs-Ringe des Impostor-Atlas — der EINE
            // Bäcker der Welt (`_karteWeltBacken`) liest sie hier.
            impostor: c.impostor
                ? {
                      views: c.impostor.views,
                      cellW: c.impostor.cellW,
                      cellH: c.impostor.cellH,
                      hebungen: c.impostor.hebungen ? c.impostor.hebungen.slice() : undefined,
                      ringTeiler: c.impostor.ringTeiler,
                  }
                : undefined,
            placement: c.placement
                ? {
                      treeScaleMul: c.placement.treeScaleMul,
                      scale: Object.assign({}, c.placement.scale),
                      rarity: Object.assign({}, c.placement.rarity),
                      // Das Boden-Gesetz (Waldboden 04.10.) reist mit — die Nah-Streu und die Fern-Schicht der Welt
                      // lesen DIESELBEN Zeilen wie der Labor-Wald (ohne diese Zeile fiele es still weg).
                      boden: c.placement.boden ? JSON.parse(JSON.stringify(c.placement.boden)) : undefined,
                  }
                : null,
        };
        // W7b/N2 (Studio-Vertrag v1.1 N7.5 + Nervensystem-Plan) — die kindStages-Bloecke der
        // ZWEIT-KERNE reisen SEPARAT (je Kern ein Block unter cfg.lod.zusatzKindStages[<id>],
        // GENERISCH aus der Manifest-Schleife): der EMPFAENGER mergt am EINEN Ingest-Chokepoint
        // (_foundryIngestRenderConfig), ein Kern ueberschreibt nie den Block eines anderen.
        // must-ignore-fest: ein v1-only-Leser ignoriert das Zusatz-Feld schlicht.
        // W8 — DAS BUDGET DER ZWEIT-KERNE reist auf demselben Weg (je Kern sein lod.budget — Zeilen je Art und
        // Gestalten je Rezept — unter cfg.lod.zusatzBudget[<id>]): die Whitelist kopiert feldweise, ohne diese
        // Zeilen fiele es still weg. Der Empfaenger mergt NUR in _foundryIngestRenderConfig (phyto-core kerneVereinen).
        try {
            for (const zk of __zweitKerne()) {
                const prc = zk.kern.PORTAL_RENDER_CONFIG;
                const ks = prc && prc.lod ? prc.lod.kindStages : null;
                if (!ks || !cfg.lod) continue;
                if (!cfg.lod.zusatzKindStages) cfg.lod.zusatzKindStages = {};
                cfg.lod.zusatzKindStages[zk.id] = JSON.parse(JSON.stringify(ks));
                if (prc.lod.budget) {
                    if (!cfg.lod.zusatzBudget) cfg.lod.zusatzBudget = {};
                    cfg.lod.zusatzBudget[zk.id] = JSON.parse(JSON.stringify(prc.lod.budget));
                }
            }
        } catch (_e) {}
        return cfg;
    }
    function __bookPayload() {
        const book = {};
        // B8 — die Herkunft je Rezept (der Stammbaum, unten): die Kern-id der Manifest-Zeile, die es ins Buch trug; der
        // Haupt-Kern ist die Zeile ohne Namensraum. Ein Zwilling ist ein Rezept, das ein späterer Kern unter einer schon
        // vergebenen id trägt — das Buch nimmt ihn nicht (first-wins), der Stammbaum nennt ihn.
        const kernZeilen = typeof self !== "undefined" && Array.isArray(self.__anazhCores) ? self.__anazhCores : [];
        const basis = kernZeilen.find((c) => c && !c.ns);
        const herkunft = {};
        const zwillinge = [];
        try {
            for (const id in PRESETS) {
                if (!Object.prototype.hasOwnProperty.call(PRESETS, id)) continue;
                const p = PRESETS[id];
                if (!p || typeof p !== "object") continue;
                // Reine Daten (JSON-klonbar): kind/panel + die Regler `s` + die Material/Form `fx` + die Phänotyp-Zeile
                // `ph` der Art (K24: Rinde, Laub, Nadel und Krone eines Baums sind phyto-core artPhaenotyp(s, Art)).
                book[id] = { kind: p.kind, panel: p.panel, s: Object.assign({}, p.s), fx: Object.assign({}, p.fx) };
                if (p.ph) book[id].ph = Object.assign({}, p.ph);
                if (basis) herkunft[id] = basis.id;
            }
        } catch (_e) {}
        // W7b/N2 (Studio-Vertrag v1.1 N7.2 + Nervensystem-Plan) — die ZWEIT-KERN-REZEPTE reisen im
        // SELBEN Buch: jeder Manifest-Kern mit eigenem Namensraum traegt seine Presets bei (die
        // GENERISCHE Schleife, kein Kern-spezifisches if). Disjunkt first-wins: ein spaeterer Kern
        // ueberschreibt NIE einen Eintrag eines frueheren (N7.5-Geist); `lab` reist mit. Ohne
        // Kerne (Portal-Fenster laedt kein Manifest): No-op, das Buch bleibt byte-gleich.
        try {
            for (const zk of __zweitKerne()) {
                const P = zk.kern.PRESETS;
                if (!P) continue;
                for (const id in P) {
                    if (!Object.prototype.hasOwnProperty.call(P, id)) continue;
                    const p = P[id];
                    if (!p || typeof p !== "object") continue;
                    if (book[id]) {
                        zwillinge.push({ id, kern: zk.id, traeger: herkunft[id] || null });
                        continue;
                    }
                    herkunft[id] = zk.id;
                    book[id] = {
                        kind: p.kind,
                        panel: p.panel || zk.id,
                        lab: typeof p.lab === "string" ? p.lab : undefined,
                        s: Object.assign({}, p.s),
                        fx: Object.assign({}, p.fx),
                    };
                    // N6.2 (Nervensystem Phase δ, Woerterbuch v1 `drive`) — DIE FAHR-FORMEL
                    // REIST ALS DATEN: traegt der Kern die EINE Export-Formel (exportDrive —
                    // dieselben Gesetze wie die Probefahrt: carPhys + FAHR + Federrate),
                    // rechnet die BRUECKE das fahrprofil BEIM BUCH-BAU statt es statisch in
                    // die PRESETS einzufrieren (Gesetz #0: ein Schoepfer-Edit an carPhys
                    // fliesst beim naechsten Buch-Bau automatisch mit, kein Duplikat).
                    // s+fx ist exakt der buildInstance-Merge-Schwanz (der Kern mergt intern
                    // DEFAULT_P+BASE_P davor — die eine Merge-Ordnung). must-ignore: ein
                    // Alt-Leser ohne fahrprofil-Steckplatz ignoriert das Feld schlicht.
                    if (typeof zk.kern.exportDrive === "function") {
                        try {
                            const fp = zk.kern.exportDrive(Object.assign({}, p.s, p.fx));
                            if (fp && typeof fp === "object") book[id].fx.fahrprofil = fp;
                        } catch (_e3) {}
                    }
                }
            }
        } catch (_e2) {}
        // W-A1 (Katalysator-Bogen §5, „regelbar, alle Assets") — DIE B4-REGLER-TABELLEN REISEN
        // MIT DEM BUCH: jeder Manifest-Kern mit PARAMS-Array traegt seine Regler-Tabelle unter
        // paramsByKind[<kind>] bei (kind aus dem ERSTEN Rezept des Kerns; disjunkt first-wins
        // wie das Buch). NUR JSON-klonbare Felder reisen (id/lab/min/max/step/def/law/grp,
        // fail-soft gefiltert) — der Empfaenger rendert seine Werkstatt-Slider AUS diesen
        // Daten, kein UI-Hardcode je Domaene. must-ignore-billig: ein Alt-Empfaenger ohne
        // paramsByKind-Steckplatz ignoriert das Feld schlicht.
        const paramsByKind = {};
        const __paramRows = (PA) => {
            const rows = [];
            for (let i = 0; i < PA.length; i++) {
                const d = PA[i];
                if (!d || typeof d.id !== "string" || !d.id) continue;
                const row = { id: d.id };
                if (typeof d.lab === "string" && d.lab) row.lab = d.lab;
                if (typeof d.min === "number" && isFinite(d.min)) row.min = d.min;
                if (typeof d.max === "number" && isFinite(d.max)) row.max = d.max;
                if (typeof d.step === "number" && isFinite(d.step)) row.step = d.step;
                if (typeof d.def === "number" && isFinite(d.def)) row.def = d.def;
                if (typeof d.law === "string" && d.law) row.law = d.law;
                if (typeof d.grp === "string" && d.grp) row.grp = d.grp;
                rows.push(row);
            }
            return rows;
        };
        // SYNERGIE-WELLE — DIE EINE B4-FORM: JEDER Kern (Primaer-Kern foundry-core wie
        // jeder Zweit-Kern) exportiert seine Regler-Tabellen als MAP `PARAMS_BY_KIND`
        // ({ <kind>: rows }) — auch Ein-Kind-Kerne. Der alte flache PARAMS-Zweig (kind
        // implizit aus dem ersten Rezept geraten) ist GEFALLEN (Abschied, kein
        // Parallelpfad): EIN Export-Dialekt, EINE Assembly-Schleife, erste Quelle
        // gewinnt je kind (wie das Buch, must-ignore-billig).
        const __mergeParamsMap = (map) => {
            if (!map || typeof map !== "object") return;
            for (const kind in map) {
                if (!Object.prototype.hasOwnProperty.call(map, kind)) continue;
                if (paramsByKind[kind] || !Array.isArray(map[kind])) continue;
                const rows = __paramRows(map[kind]);
                if (rows.length) paramsByKind[kind] = rows;
            }
        };
        try {
            for (const zk of __zweitKerne()) __mergeParamsMap(zk.kern.PARAMS_BY_KIND);
        } catch (_e4) {}
        try {
            if (typeof PARAMS_BY_KIND === "object") __mergeParamsMap(PARAMS_BY_KIND);
        } catch (_e5) {}
        // B7 (studios.K5) — DIE WIRTS-ZEILE EINER ART REIST IM BUCH: jeder Zweit-Kern mit `KIND_POLICY` traegt je Art seine
        // Zeile bei (Bauplan-Praefix + Substanz), disjunkt first-wins wie das Buch, die Kern-id als Herkunft (`kern`). Der
        // Wirt prueft und vereint am EINEN Ingest (`_kindPolicyVereinen`, fail-closed laut) — eine neue Art braucht keine Zeile
        // im Wirt. Ohne Block (die acht Gesetzbuecher des Spiels): {}. Eine nicht klonbare Zeile reist ohne Praefix (der Wirt
        // nennt sie).
        const kindPolicy = {};
        for (const zk of __zweitKerne()) {
            const KPk = zk.kern.KIND_POLICY;
            if (!KPk || typeof KPk !== "object") continue;
            for (const kind of Object.keys(KPk)) {
                if (kindPolicy[kind]) continue;
                let z = { kern: zk.id };
                try {
                    z = Object.assign(JSON.parse(JSON.stringify(KPk[kind])), z);
                } catch (_e6) {}
                kindPolicy[kind] = z;
            }
        }
        // B8 (studios.K5) — DER STAMMBAUM REIST IM UMSCHLAG, neben dem eingefrorenen Buch (nie in ihm): je Kern mit Rezepten
        // seine Tafel (`STAMMBAUM`: der Name des Studios, je Art der Name ihres Bereichs), seine Vertrags-Datei und die Rezepte,
        // die er ins Buch trug, in der Reihe des Buchs; dazu jeder Zwilling beim Namen. Der Wirt leitet daraus den EINEN Baum
        // Studio → Bereich → Teil ab (`_stammbaum`). Eine nicht klonbare Tafel reist leer (der Wirt nennt das Studio namenlos).
        const stammbaum = { kerne: [], zwillinge };
        for (const c of kernZeilen) {
            if (!c) continue;
            const id = typeof c.id === "string" && c.id ? c.id : c.ns;
            const rezepte = Object.keys(herkunft).filter((r) => herkunft[r] === id);
            if (!rezepte.length) continue;
            let tafel = null;
            try {
                const T = c.ns ? self[c.ns] && self[c.ns].STAMMBAUM : typeof STAMMBAUM === "object" ? STAMMBAUM : null;
                tafel = T ? JSON.parse(JSON.stringify(T)) : null;
            } catch (_e7) {}
            stammbaum.kerne.push({
                kern: id,
                datei: typeof c.vertrag === "string" ? c.vertrag : null,
                studio: tafel && typeof tafel.studio === "string" ? tafel.studio : null,
                arten: tafel && tafel.arten && typeof tafel.arten === "object" ? tafel.arten : {},
                rezepte,
            });
        }
        return { book, paramsByKind, kindPolicy, stammbaum };
    }
    // SYNERGIE-WELLE — DER EINE UMSCHLAG: das komplette Studio-Buch (Rezepte +
    // Regler-Tabellen + Welt-Palette + Wahrnehmungs-Config) in EINEM Reply — der
    // Host (und jedes Gate) fragt EINEN Kanal statt drei.
    function __replyBook(msg) {
        const bp = __bookPayload();
        if (typeof window === "undefined" || (window.parent && window.parent !== window)) {
            __post(
                {
                    type: "book",
                    world: "terrain",
                    reqId: msg && msg.reqId,
                    book: bp.book,
                    paramsByKind: bp.paramsByKind,
                    kindPolicy: bp.kindPolicy,
                    stammbaum: bp.stammbaum,
                    worldParams: __worldParamsPayload(),
                    renderConfig: __renderConfigPayload(),
                    // SPIEGEL-ZENSUS 17.07. — das Siedlungs-Existenz-Gesetz
                    // (fachwerk SIEDLUNG) reist additiv mit; ein Alt-Empfaenger
                    // ohne den Steckplatz ignoriert das Feld (must-ignore).
                    siedlung: __zweitKernSiedlung(),
                },
                "*"
            );
        }
    }
    // DER EINE BLATT-ATLAS reist als Bild (S7) NACH dem Buch (B3a): der Worker malt ihn (OffscreenCanvas) samt Mip-Kette, die
    // Transport-Schale macht ihn zur Fracht und gibt die Puffer per Transfer weiter — der Haupt-Thread malt und mippt nie. Bis
    // B3a war er die Vorbedingung des ganzen Buchs (Radeon kalt 1,81 s Malen + 0,98 s Fracht vor jedem Auftrag); jetzt bestellt
    // die Welt, während er entsteht. Den Kanal fragt die Schale des Buch-Fadens nach dem Buch, wenn ihre Platte ihn nicht trägt
    // (pipeline.K4 Stufe 2).
    function __replyBlattAtlas(msg) {
        __post(
            {
                type: "blatt-atlas",
                world: "terrain",
                reqId: msg && msg.reqId,
                blattAtlas: self.__phytoCore.bakeLeafAtlasBild({ createElement: () => __mkCanvas(1, 1) }),
            },
            "*"
        );
    }
    // Ein Mesh der Instanz -> {kind, + alle Vertex-Attribute als Float32/Uint32}. REIN
    // lesend (buildInstance/emitTree unveraendert). kind aus dem Material-Zeiger.
    function __assetMaterialKind(mat) {
        if (!mat) return "unknown";
        if (mat === barkMat || mat === barkMatBirch) return "bark";
        if (mat === foliageMatTex) return "foliageTex";
        if (mat === foliageMat || mat === foliageMatKrone) return "foliage";
        if (mat === grassMat) return "grass";
        if (typeof stemMat !== "undefined" && mat === stemMat) return "stem";
        if (typeof schattenMat !== "undefined" && mat === schattenMat) return "schatten";
        // DER EINE SCHATTEN-STOFF eines Zweit-Kerns (S3: die Stufe 3 von Haus und Ausstattung, fachwerk `wurfStoff`, gestempelt
        // `userData.__stoff = "schatten"`) — dieselbe Material-Identität wie der Schatten-Teil der Baum-L1.
        if (mat.userData && mat.userData.__stoff === "schatten") return "schatten";
        return "unknown";
    }
    function __extractAssetMesh(mesh, zweitKern, basisInv) {
        const geo = mesh.geometry;
        if (!geo || !geo.attributes || !geo.attributes.position) return null;
        const out = { kind: __assetMaterialKind(mesh.material) };
        // DIE LOOK-KLASSE REIST MIT (30.09., additiv, must-ignore): Kreatur-/Mensch-Bäcker stempeln
        // material.userData.__klasse (fell · fellSchale · straehne* · skin · haut · hair) — der Welt-Weber webt fuer
        // GENAU diese Namen FELL_LOOK/HAUT_LOOK/HAAR_LOOK. Pflanzen-Materialien tragen das Feld nie
        // (ihre Replies bleiben byte-alt, gate:asset-contract).
        const __kl = mesh.material && mesh.material.userData && mesh.material.userData.__klasse;
        // Die EINE Look-Liste lebt im Budget-Gesetz (phyto-core LOOK_KLASSEN) — Ofen und Wirt lesen dieselbe.
        if (out.kind === "unknown" && typeof __kl === "string" && (typeof self !== "undefined" ? self : globalThis).__phytoCore.budgetLook(__kl))
            out.kind = __kl;
        // DIE EINE PIPE: das animierte Gelenk des Meshes reist mit (Kreatur-Assets;
        // Pflanzen tragen das Feld nie — additiv, must-ignore).
        if (mesh.userData && mesh.userData.__assetJoint) out.joint = mesh.userData.__assetJoint;
        // DER SCHATTEN-TEIL REIST MIT (S3, 09.10., additiv, must-ignore): die Baum-L1 liefert ihren Wurf als eigenes Teil
        // (foundry-core tree[1].wurf, `teil: "schatten"`, Attribut aDeckt) — der Wirt zeichnet es nur in den Kaskaden.
        // Andere Teile tragen das Feld nie (ihre Replies bleiben byte-alt). Der drawRange-Vorsatz (`wurf`) ist gefallen.
        if (mesh.userData && typeof mesh.userData.__teil === "string") out.teil = mesh.userData.__teil;
        // DAS SEIL REIST MIT (physik.K4, additiv, must-ignore): ein Glied oder der Kopf eines Seils der Schmiede (schmiede-core
        // `bauSeil`, userData.__seil = seine Nummer) — der Leser der Welt bewegt jedes Teil nach dem EINEN Seil-Gesetz.
        if (mesh.userData && Number.isInteger(mesh.userData.__seil)) out.seil = mesh.userData.__seil;
        // V18.465 — DIE TÜR REIST MIT (additiv, must-ignore): ein Tor-Flügel-Mesh
        // (porta-core buildGate: leafL/R/LB/RB tragen userData.side + die Hinge-
        // Position der Gruppe) bekommt sein Scharnier als DATEN — die Welt baut
        // daraus die Flügel-Animation (Rotation um die Hinge-Achse auf den GEBACKENEN
        // Geschlossen-Pose-Vertices). Pflanzen/Fahrzeuge tragen das Feld nie.
        for (let anc = mesh.parent; anc; anc = anc.parent) {
            if (anc.userData && typeof anc.userData.side === "number") {
                out.tuer = { seite: anc.userData.side, hx: anc.position.x, zf: anc.position.z };
                // DORF-ERLEBNIS (17.07., additiv, must-ignore): fachwerk-Haustür-
                // Flügel reisen mit ihrer GEBACKENEN Offen-Pose (userData.offen,
                // buildStufe-Separation) — der Host schliesst/öffnet relativ dazu.
                // porta-Tore tragen das Feld nie → deren Replies bleiben byte-alt.
                if (typeof anc.userData.offen === "number" && anc.userData.offen !== 0)
                    out.tuer.offen = anc.userData.offen;
                break;
            }
        }
        // DIE MATERIAL-REGLER FLIESSEN MIT (einspeisung der regler): die echten MeshStandard-Parameter
        // dieses Materials als reine Daten -> AnazhRealm baut EXAKT dasselbe Material. Fels matt,
        // Kristall glaenzend+facettiert (flatShading), Gras env-gedaempft — alles OHNE hartkodiertes
        // per-kind-Raten in AnazhRealm. Editiert der Schoepfer eine Roughness/Metalness hier, folgt es.
        const mat = mesh.material;
        if (mat) {
            out.mat = {
                roughness: typeof mat.roughness === "number" ? mat.roughness : 0.7,
                metalness: typeof mat.metalness === "number" ? mat.metalness : 0,
                flatShading: !!mat.flatShading,
                envMapIntensity: typeof mat.envMapIntensity === "number" ? mat.envMapIntensity : 1,
                side: typeof mat.side === "number" ? mat.side : 0, // 0 Front · 1 Back · 2 Double
                alphaTest: typeof mat.alphaTest === "number" ? mat.alphaTest : 0,
                hasNormalMap: !!mat.normalMap,
            };
            // W7b — die MATERIAL-FARBE reist additiv mit (must-ignore fuer Alt-Leser), aber NUR
            // fuer ZWEIT-KERN-Meshes (der Dispatch-Flag, NICHT der Material-kind: Fels/Kristall
            // sind ebenfalls kind "unknown" und leben byte-exakt in den v1-Asset-Goldens —
            // gate:asset-contract, 52 sha256 ueber den Reply, gemessen). Fahrzeug-Materialien
            // (paint/glass/clay) sind uniform ohne Vertex-Colors; der Empfaenger
            // (_foundryBuildGroup) fuellt daraus das color-Attribut. Die Komponenten sind LINEAR:
            // das Gesetzbuch rechnet sein Paletten-Hex (sRGB-Absicht) selbst um (das FARB-GESETZ,
            // W5: vehicle-core/schmiede-core `stoffFarbe`, fachwerk `_lin`), die Bruecke reicht sie roh.
            if (zweitKern && mat.color && typeof mat.color.r === "number")
                out.mat.color = [mat.color.r, mat.color.g, mat.color.b];
            // DIE EINE PIPE: Emissiv reist NUR wenn nicht-schwarz (additiv, must-ignore;
            // Pflanzen/Fahrzeuge tragen schwarz → Feld fehlt → Replies byte-gleich).
            if (zweitKern && mat.userData && mat.userData.__webe) out.mat.webe = mat.userData.__webe;
            // DIE SEH-KLASSE reist mit (Integration W8, must-ignore): was der Stoff dem AUGE ist (auge · glas · metall ·
            // haar · haut · glut · stoff), gestempelt vom Gesetzbuch (material.userData.__seh) — das Budget-Gesetz faltet
            // nur innerhalb EINER. Pflanzen tragen das Feld nie (ihre Replies bleiben byte-alt, gate:asset-contract).
            if (zweitKern && mat.userData && typeof mat.userData.__seh === "string") out.mat.seh = mat.userData.__seh;
            // DAS STEIN-GESETZ reist mit (w4-genesis-tore, must-ignore): ein Stein-Rahmen (porta `__stein`) trägt den Namen seiner
            // Zeile — die Welt webt Fuge, Kante und Ton aus dem uv seiner Teile (`_steinStoff`). Stoffe ohne das Feld bleiben byte-alt.
            if (zweitKern && mat.userData && typeof mat.userData.__stein === "string") out.mat.stein = mat.userData.__stein;
            // DAS VERBAND-GESETZ reist mit (w28-haus-stoff, must-ignore): ein Stoff, dem das Labor eine Karte seines Verbands legt
            // (fachwerk `VERBAND_GESETZ`: Mauerwerk, Deckung, Putz, Naturstein), trägt die Nummer seiner Zeile — die Welt webt Stein,
            // Fuge und Ton als Funktion (`_verbandStoff`), ohne Karte und ohne uv. Stoffe ohne das Feld bleiben byte-alt.
            if (zweitKern && mat.userData && mat.userData.__verband > 0) out.mat.verband = mat.userData.__verband | 0;
            // DAS LEUCHT-GESETZ reist mit (Architektur-Welle 05.10., must-ignore): ein Stoff, der in seiner Vertex-Farbe
            // leuchtet (fachwerk `feuer`: Glut, Flamme, Herdfeuer), trägt die Stärke — die Welt webt emissiveNode = Farbe ×
            // leucht. Stoffe ohne das Feld (Pflanzen, jede andere Glut) bleiben byte-alt.
            if (zweitKern && mat.userData && typeof mat.userData.__leucht === "number") out.mat.leucht = mat.userData.__leucht;
            // DAS LEUCHTQUELLEN-GESETZ reist mit (K11, must-ignore): ein Stoff, der nach einem Zeitplan glüht (fachwerk `glas`:
            // das wache Fenster), trägt den Namen seines Emitter-Datums (LICHT_GESETZ) — die Welt webt ihm die Glut der Tageszeit.
            if (zweitKern && mat.userData && typeof mat.userData.__licht === "string") out.mat.licht = mat.userData.__licht;
            if (zweitKern && mat.emissive && (mat.emissive.r || mat.emissive.g || mat.emissive.b)) {
                out.mat.emissive = [mat.emissive.r, mat.emissive.g, mat.emissive.b];
                out.mat.emissiveIntensity = typeof mat.emissiveIntensity === "number" ? mat.emissiveIntensity : 1;
            }
            // DER KLARLACK UND DIE DURCHSICHT REISEN MIT (W5 Gegenstände, additiv, must-ignore): ein Zweit-Kern-Stoff
            // mit Klarlack (Fahrzeug-Lack, Klingen-Stahl) oder Durchsicht (Scheibe, Fenster, Glimm-Scheibe) trägt sie als
            // Daten — der Wirt baut dasselbe Material (phyto-core `budgetRegler`: cc · ccr · op). Ohne sie war der Lack
            // in der Welt ein Metall ohne Lackschicht (Tiefschwarz spiegelte nichts) und jede Scheibe eine Wand.
            // Pflanzen tragen die Felder nie (ihre Replies bleiben byte-alt).
            if (zweitKern && typeof mat.clearcoat === "number" && mat.clearcoat > 0) {
                out.mat.clearcoat = mat.clearcoat;
                out.mat.clearcoatRoughness = typeof mat.clearcoatRoughness === "number" ? mat.clearcoatRoughness : 0;
            }
            if (zweitKern && mat.transparent && typeof mat.opacity === "number" && mat.opacity < 1)
                out.mat.opacity = mat.opacity;
            // DAS UNBELEUCHTETE IST LICHT (w4-genesis-tore, must-ignore): ein Zweit-Kern-Stoff ohne Licht-Antwort (MeshBasic — das
            // Filigran, der Bogen-Saum und die Licht-Scheibe der Tore) zeigt im Labor seine Farbe, wie das Licht auch fällt: er IST
            // Licht. Er reist als Leuchten seiner Farbe (`leucht` 1, die Farbe wird Vertex-Farbe) ohne Licht-Antwort (`unbeleuchtet`:
            // die Albedo schwarz, matt) — vorher als matter, beleuchteter Stoff (Rauheit 0,7). Der Schatten-Stoff (kind schatten) bleibt.
            if (zweitKern && mat.isMeshBasicMaterial && mat.visible !== false && out.kind === "unknown") {
                out.mat.roughness = 1;
                out.mat.metalness = 0;
                out.mat.leucht = 1;
                out.mat.unbeleuchtet = true;
            }
        }
        const A = geo.attributes;
        // Alle vorhandenen Standard- + Wind-Attribute mitgeben (position/normal/color/uv +
        // aWind/aCenter/aType und was sonst am Mesh haengt) — engine-neutral. ELEMENT-WEISE
        // via count/itemSize + get*(): robust gegen INTERLEAVED-Puffer (at.array waere dort der
        // ganze verschachtelte Puffer = 2^N-zu-gross), gibt einen dicht-gepackten Puffer zurueck.
        for (const name in A) {
            const at = A[name];
            if (!at || typeof at.count !== "number") continue;
            const is = at.itemSize || 3;
            const dst = new Float32Array(at.count * is);
            for (let i = 0; i < at.count; i++) {
                dst[i * is] = at.getX(i);
                if (is > 1) dst[i * is + 1] = at.getY(i);
                if (is > 2) dst[i * is + 2] = at.getZ(i);
                if (is > 3) dst[i * is + 3] = at.getW(i);
            }
            out[name] = { array: dst, itemSize: is };
        }
        if (geo.index) out.index = new Uint32Array(Array.from(geo.index.array));
        // Welt-Transform der Instanz (buildInstance setzt g.position.y; Meshes koennen lokal
        // versetzt sein) in die Vertices backen, damit AnazhRealm den Baum am Ursprung erhaelt.
        // WELLE L (Q13 F-D8, additiv): ein RAD bäckt relativ zu seiner Nabe (`basisInv` = Nabe⁻¹) — die Welt setzt
        // es je Ecke als Instanz (Rolle, Lenk-Einschlag, ungefedert). Ohne `basisInv` byte-alt.
        mesh.updateWorldMatrix(true, false);
        const e = basisInv ? new THREE.Matrix4().multiplyMatrices(basisInv, mesh.matrixWorld).elements : mesh.matrixWorld.elements,
            pos = out.position.array;
        for (let i = 0; i < pos.length; i += 3) {
            const x = pos[i],
                y = pos[i + 1],
                z = pos[i + 2];
            pos[i] = e[0] * x + e[4] * y + e[8] * z + e[12];
            pos[i + 1] = e[1] * x + e[5] * y + e[9] * z + e[13];
            pos[i + 2] = e[2] * x + e[6] * y + e[10] * z + e[14];
        }
        return out;
    }
    // DIE KRONE EINER GESTALT (D10): das Laub, wie die Stufe es zeichnet (jedes foliage-/foliageTex-Mesh im Vorlagen-Raum),
    // in ein Raster von KRONE_RASTER.waag² × KRONE_RASTER.senk Zellen über seinem Rahmen; je besetzte Zelle EIN Laub-Teil
    // [cx, cy, cz, rXZ, rY] — die Mitte des Rahmens ihrer Ecken, waagrecht seine halbe Diagonale (die Kreise benachbarter
    // voller Zellen decken die Fläche lückenlos), senkrecht seine halbe Höhe. Die Farbe ist das Mittel der Vertex-Farben
    // (linear; die Albedo des Blatts ist Vertex-Farbe × Atlas-Wert um 1, das FARB-GESETZ). Ohne Laub (Totholz) keine Teile.
    const KRONE_RASTER = { waag: 6, senk: 8 };
    function __kroneDerMeshes(meshes) {
        const laub = meshes.filter((m) => m && (m.kind === "foliage" || m.kind === "foliageTex") && m.position);
        const lo = [Infinity, Infinity, Infinity],
            hi = [-Infinity, -Infinity, -Infinity];
        for (const m of laub) {
            const p = m.position.array;
            for (let i = 0; i < p.length; i++) {
                const k = i % 3;
                if (p[i] < lo[k]) lo[k] = p[i];
                if (p[i] > hi[k]) hi[k] = p[i];
            }
        }
        if (!(hi[1] >= lo[1])) return { teile: new Float32Array(0), farbe: null };
        const NW = KRONE_RASTER.waag,
            NS = KRONE_RASTER.senk;
        const kante = [0, 1, 2].map((k) => Math.max(hi[k] - lo[k], 1e-4) / (k === 1 ? NS : NW));
        const zelle = new Map(); // Index → [min x y z, max x y z]
        const farbe = [0, 0, 0];
        let fn = 0;
        for (const m of laub) {
            const p = m.position.array;
            const c = m.color && m.color.array,
                cs = (m.color && m.color.itemSize) || 3;
            for (let v = 0; v * 3 + 2 < p.length; v++) {
                const x = p[v * 3],
                    y = p[v * 3 + 1],
                    z = p[v * 3 + 2];
                const ix = Math.min(NW - 1, Math.floor((x - lo[0]) / kante[0])),
                    iy = Math.min(NS - 1, Math.floor((y - lo[1]) / kante[1])),
                    iz = Math.min(NW - 1, Math.floor((z - lo[2]) / kante[2]));
                const q = (iy * NW + iz) * NW + ix;
                let r = zelle.get(q);
                if (!r) zelle.set(q, (r = [x, y, z, x, y, z]));
                if (x < r[0]) r[0] = x;
                if (y < r[1]) r[1] = y;
                if (z < r[2]) r[2] = z;
                if (x > r[3]) r[3] = x;
                if (y > r[4]) r[4] = y;
                if (z > r[5]) r[5] = z;
                if (c) {
                    farbe[0] += c[v * cs];
                    farbe[1] += c[v * cs + 1];
                    farbe[2] += c[v * cs + 2];
                    fn++;
                }
            }
        }
        const teile = new Float32Array(zelle.size * 5);
        let t = 0;
        for (const q of [...zelle.keys()].sort((a, b) => a - b)) {
            const r = zelle.get(q);
            teile[t++] = (r[0] + r[3]) / 2;
            teile[t++] = (r[1] + r[4]) / 2;
            teile[t++] = (r[2] + r[5]) / 2;
            teile[t++] = Math.max(Math.hypot(r[3] - r[0], r[5] - r[2]) / 2, 0.05 * kante[0]);
            teile[t++] = Math.max((r[4] - r[1]) / 2, 0.05 * kante[1]);
        }
        return { teile, farbe: fn ? [farbe[0] / fn, farbe[1] / fn, farbe[2] / fn] : null };
    }
    // DIE STUFE AUS DER L0 (Einheit E7/E10, „gezeichnet wird, was Pixel trägt"): eine Stufe ist eine Funktion der GELIEFERTEN L0
    // und des Bildpunkts `s` an ihrer Grenze (m) — kein Rezept je Stufe, kein Zweig je Studio. Was an der Grenze gesehen wird, sagt
    // die EINE Sicht: `sicht` trägt je Teil der L0 ein Byte je Dreieck, gerechnet vom Wirt aus dem Tiefen-Test der GPU in 37
    // Richtungen (`_sichtDerGestalt`) — nie ein Raster im Faden. Dann:
    //   MUSTER IM STOFF — die gesehenen Dreiecke mit Verband-Zeile (Backstein, Ziegel, Naturstein) fallen je Ebene und Zone in eine
    //     Fläche: ein Stein ist je Ebene, was dort Kanten teilt (verschweißt auf 1 mm), sein Rahmen der der Ebene oder — füllt er
    //     dort sein Rechteck nicht — der seines kleinsten Rechtecks (auf `winkel` rad); Steine eines Winkels näher als `luecke`
    //     bilden eine Zone, die Zone ist ein Raster in `zellePx` Bildpunkten,
    //     ihre größten Rechtecke die Fläche (ein Fenster bleibt offen), `hinterM` hinter der Front der Steine, in der flächen-
    //     gewichteten Farbe der Steine und DERSELBEN Zeile — der Stoff webt den Stein (`_verbandStoff`). Ebenen unter `minFlaeche`
    //     (Kanten und Kuppen der Steine: ihr Relief) fallen — noch nach Fläche, nie nach Zellen: in Zellen (`minZellen`) stand
    //     das Relief der Deckung als Fläche (die Kuppen der Ziegel, roemisch L2 60 → 10 544 Dreiecke, 17 Budget-Brüche der Klasse).
    //     Ein Stein, der auch sein kleinstes Rechteck nicht bis auf die Zelle am
    //     Umriss füllt (das Dreieck am Giebel), behält seine Dreiecke für den Pixelfehler.
    //   STEINE OHNE ZEILE — eine Insel der übrigen (verschweißt), die ein Quader in ihrem Rahmen ist (jede Fläche parallel zu einer
    //     Achse aus ihrer Haupt-Normale) und deren Front ihr Rechteck bis auf die Zelle am Umriss füllt, ist ein Stein des Musters,
    //     das kein Stoff webt (die Bohle, die Schindel, der Rahmen): er fällt wie der Verband in die Flächen seiner Zonen (Zeile 0,
    //     die Farbe ihr Mittel) — Front und Rücken immer, die Flanken als Zone ab `minZellen` Zellen; eine Flanke, deren schmale Seite
    //     unter dem Bildpunkt `s` liegt, ist Dünnes. Das Maß ist der Bildpunkt, nie die Fläche: 0,5 m² waren an der L1 1 718 Bildpunkte, an der
    //     L2 367 — die 6 cm hohe Front einer Bohle (ihre Oberseite trägt die Haupt-Normale) fiel als Flanke von 0,11 m². Walze und
    //     Strebe sind kein Quader.
    //   DÜNNES FÄLLT — jedes andere gesehene Dreieck, dessen kleinste Höhe unter `s` liegt.
    //   DETAIL = PIXELFEHLER — die übrigen verlieren jede Ecke, deren Wegfall die Fläche um weniger als `fehlerPx` Bildpunkte
    //     verschiebt (`__pixelKollaps`): der Blockbau, das Holz, der Ziegel ohne Verband-Zeile tragen an der Grenze nur, was Pixel trägt.
    //   EIN TEIL UNTER DER ZELLE FÄLLT — trägt kein gesehenes Dreieck eines Teils eine Höhe über der Zelle und keines ein Muster,
    //     ist das ganze Teil Detail seines Trägers (die Beschläge der Flügel): es fällt als Mittel in dessen Stoff (der Träger trägt
    //     das gesehene Dreieck nächst seiner Mitte, seine Farbe rückt auf das flächengewichtete Mittel beider).
    // Was die Sicht aus keiner Richtung zeigt, fällt. Die Felder eines Teils (Tür, Gelenk, Stoff) reisen mit.
    const STUFE_AUS_L0 = Object.freeze({ luecke: 0.06, minFlaeche: 0.5, minZellen: 32, ebeneM: 0.02, zellePx: 2, hinterM: 0.003, fehlerPx: 0.5, winkel: 0.002 });
    // DETAIL = PIXELFEHLER (E7): Halbkanten-Kollaps u → v über die Dreiecke `tris` (Nummern in I), in der Reihenfolge des kleinsten
    // Fehlers, solange er unter `eps` (m) bleibt. Die bleibende Ecke ist eine der L0 — jede Dreiecks-Ecke behält ihre Felder (Normale,
    // Farbe, Verband) und nimmt die Lage ihres Ziels; die Lage ist auf 1 mm verschweißt (eine flach schattierte Kiste ist EINE Fläche).
    // Der Fehler einer Ecke = der größte Abstand ihrer Lage zu JEDER Ebene der L0, die eine in sie gefallene Ecke trug (je Dreieck
    // seine Ebene, je Rand dazu die Ebene senkrecht auf ihm) — nie der Abstand zur nächsten neuen Fläche: der lässt zwei Kollapse
    // mit Fehler 0 eine Laibung je 57° und zusammen quer über die Fassade kippen (der Keil am Hochhaus). Ein Rand (Kante mit einem
    // Dreieck: Umriss, Naht der Sicht) wandert nur entlang seiner selbst, kein Dreieck kippt (Normale dreht ≤ 60°), die Fläche bleibt
    // mannigfaltig (Link-Bedingung). Antwort je Dreiecks-Ecke: `von` (Feld-Ecke der L0), `lage` (Ecke der Lage), `ur` (vorher), `xyz`.
    function __pixelKollaps(P, I, tris, eps) {
        const T = tris.length,
            von = new Int32Array(T * 3),
            ecke = new Int32Array(T * 3);
        const schluessel = new Map(),
            xyz = [];
        for (let k = 0; k < T; k++)
            for (let j = 0; j < 3; j++) {
                const i = I[tris[k] * 3 + j];
                const qx = Math.round(P[i * 3] * 1000), qy = Math.round(P[i * 3 + 1] * 1000), qz = Math.round(P[i * 3 + 2] * 1000); // prettier-ignore
                if (Math.abs(qx) >= 65536 || Math.abs(qy) >= 65536 || Math.abs(qz) >= 65536)
                    throw new Error("Stufe aus der L0: eine Ecke liegt jenseits ±65 m der Vorlage");
                const key = ((qx + 65536) * 131072 + (qy + 65536)) * 131072 + (qz + 65536);
                let w = schluessel.get(key);
                if (w === undefined) {
                    schluessel.set(key, (w = xyz.length / 3));
                    xyz.push(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]);
                }
                von[k * 3 + j] = i;
                ecke[k * 3 + j] = w;
            }
        const ur = ecke.slice();
        const W = xyz.length / 3,
            X = Float64Array.from(xyz);
        const lebt = new Uint8Array(T).fill(1),
            weg = new Uint8Array(W),
            fehler = new Float64Array(W);
        const vt = Array.from({ length: W }, () => []);
        for (let k = 0; k < T; k++) {
            const a = ecke[k * 3], b = ecke[k * 3 + 1], c = ecke[k * 3 + 2]; // prettier-ignore
            if (a === b || b === c || c === a) {
                lebt[k] = 0; // auf 1 mm entartet
                continue;
            }
            vt[a].push(k);
            vt[b].push(k);
            vt[c].push(k);
        }
        const fan = (x) => {
            const L = vt[x].filter((k) => lebt[k]);
            vt[x] = L;
            return L;
        };
        // die Ebenen der L0 je Ecke (Normale, Abstand): jedes ihrer Dreiecke, jeder Rand dazu die Ebene senkrecht auf ihm
        const ebene = Array.from({ length: W }, () => []);
        const nimm = (x, nx, ny, nz, d) => {
            for (const q of ebene[x]) if (Math.abs(q[0] - nx) < 1e-3 && Math.abs(q[1] - ny) < 1e-3 && Math.abs(q[2] - nz) < 1e-3 && Math.abs(q[3] - d) < 1e-4) return; // prettier-ignore
            ebene[x].push([nx, ny, nz, d]);
        };
        const kanten = new Map();
        for (let k = 0; k < T; k++) {
            if (!lebt[k]) continue;
            for (let j = 0; j < 3; j++) {
                const a = ecke[k * 3 + j], b = ecke[k * 3 + ((j + 1) % 3)], key = Math.min(a, b) * W + Math.max(a, b); // prettier-ignore
                kanten.set(key, (kanten.get(key) || 0) + 1);
            }
        }
        for (let k = 0; k < T; k++) {
            if (!lebt[k]) continue;
            const e = [ecke[k * 3] * 3, ecke[k * 3 + 1] * 3, ecke[k * 3 + 2] * 3];
            const ux = X[e[1]] - X[e[0]], uy = X[e[1] + 1] - X[e[0] + 1], uz = X[e[1] + 2] - X[e[0] + 2]; // prettier-ignore
            const vx = X[e[2]] - X[e[0]], vy = X[e[2] + 1] - X[e[0] + 1], vz = X[e[2] + 2] - X[e[0] + 2]; // prettier-ignore
            let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; // prettier-ignore
            const l = Math.hypot(nx, ny, nz);
            if (!(l > 1e-12)) continue;
            nx /= l;
            ny /= l;
            nz /= l;
            const d = nx * X[e[0]] + ny * X[e[0] + 1] + nz * X[e[0] + 2];
            for (let j = 0; j < 3; j++) nimm(ecke[k * 3 + j], nx, ny, nz, d);
            for (let j = 0; j < 3; j++) {
                const a = ecke[k * 3 + j], b = ecke[k * 3 + ((j + 1) % 3)]; // prettier-ignore
                if (kanten.get(Math.min(a, b) * W + Math.max(a, b)) !== 1) continue;
                const kx = X[b * 3] - X[a * 3], ky = X[b * 3 + 1] - X[a * 3 + 1], kz = X[b * 3 + 2] - X[a * 3 + 2]; // prettier-ignore
                let rx = ky * nz - kz * ny, ry = kz * nx - kx * nz, rz = kx * ny - ky * nx; // prettier-ignore
                const lr = Math.hypot(rx, ry, rz);
                if (!(lr > 1e-12)) continue;
                rx /= lr;
                ry /= lr;
                rz /= lr;
                const dr = rx * X[a * 3] + ry * X[a * 3 + 1] + rz * X[a * 3 + 2];
                nimm(a, rx, ry, rz, dr);
                nimm(b, rx, ry, rz, dr);
            }
        }
        const hat = (k, x) => ecke[k * 3] === x || ecke[k * 3 + 1] === x || ecke[k * 3 + 2] === x;
        const nachbarn = (x) => {
            const N = new Set();
            for (const k of fan(x)) for (let j = 0; j < 3; j++) if (ecke[k * 3 + j] !== x) N.add(ecke[k * 3 + j]);
            return N;
        };
        const rand = (a, b) => {
            let n = 0;
            for (const k of fan(a)) if (hat(k, b)) n++;
            return n === 1;
        };
        const randEcke = (x) => {
            for (const y of nachbarn(x)) if (rand(x, y)) return true;
            return false;
        };
        // Normale (ungeteilt) des Dreiecks k, die Ecke u auf die Lage von v gelegt
        const normale = (k, u, v, out) => {
            const e = [0, 1, 2].map((j) => (ecke[k * 3 + j] === u ? v : ecke[k * 3 + j]) * 3);
            const ux = X[e[1]] - X[e[0]], uy = X[e[1] + 1] - X[e[0] + 1], uz = X[e[1] + 2] - X[e[0] + 2]; // prettier-ignore
            const vx = X[e[2]] - X[e[0]], vy = X[e[2] + 1] - X[e[0] + 1], vz = X[e[2] + 2] - X[e[0] + 2]; // prettier-ignore
            out[0] = uy * vz - uz * vy;
            out[1] = uz * vx - ux * vz;
            out[2] = ux * vy - uy * vx;
            return e;
        };
        const n0 = [0, 0, 0],
            n1 = [0, 0, 0];
        // der Fehler des Kollaps u → v (Infinity: verboten)
        const kosten = (u, v, uRand) => {
            if (uRand && !rand(u, v)) return Infinity;
            const Nu = nachbarn(u),
                Nv = nachbarn(v);
            let gemeinsam = 0,
                geteilt = 0;
            for (const x of Nu) if (Nv.has(x)) gemeinsam++;
            for (const k of fan(u)) if (hat(k, v)) geteilt++;
            if (gemeinsam !== geteilt) return Infinity; // Link-Bedingung (Dreiecke an u·v: je ein Gegenüber)
            for (const k of fan(u)) {
                if (hat(k, v)) continue;
                normale(k, -1, -1, n0);
                normale(k, u, v, n1);
                const l0 = Math.hypot(n0[0], n0[1], n0[2]),
                    l1 = Math.hypot(n1[0], n1[1], n1[2]);
                if (!(l1 > 1e-12) || n0[0] * n1[0] + n0[1] * n1[1] + n0[2] * n1[2] < 0.5 * l0 * l1) return Infinity;
            }
            // die Lage von v gegen jede Ebene der L0, die u trägt (die Ebenen von v hält sie schon: `fehler[v]`)
            let d = fehler[v];
            for (const q of ebene[u]) {
                const e = Math.abs(q[0] * X[v * 3] + q[1] * X[v * 3 + 1] + q[2] * X[v * 3 + 2] - q[3]);
                if (e > d) d = e;
            }
            return d;
        };
        // die Halde: je Ecke ihr bester Kollaps (Kosten, Ziel, Marke); veraltete Einträge fallen beim Ziehen
        const ziel = new Int32Array(W).fill(-1),
            marke = new Int32Array(W),
            halde = [];
        const kleiner = (a, b) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]);
        const hoch = (i) => {
            while (i > 0) {
                const p = (i - 1) >> 1;
                if (!kleiner(halde[i], halde[p])) break;
                [halde[i], halde[p]] = [halde[p], halde[i]];
                i = p;
            }
        };
        const runter = (i) => {
            for (;;) {
                const l = 2 * i + 1,
                    r = l + 1;
                let m = i;
                if (l < halde.length && kleiner(halde[l], halde[m])) m = l;
                if (r < halde.length && kleiner(halde[r], halde[m])) m = r;
                if (m === i) return;
                [halde[i], halde[m]] = [halde[m], halde[i]];
                i = m;
            }
        };
        const bewerte = (u) => {
            marke[u]++;
            let best = Infinity,
                bz = -1;
            const uRand = randEcke(u);
            for (const v of [...nachbarn(u)].sort((a, b) => a - b)) {
                const c = kosten(u, v, uRand);
                if (c < best) {
                    best = c;
                    bz = v;
                }
            }
            ziel[u] = bz;
            if (best <= eps) {
                halde.push([best, u, marke[u]]);
                hoch(halde.length - 1);
            }
        };
        for (let u = 0; u < W; u++) if (vt[u].length) bewerte(u);
        while (halde.length) {
            const [c, u, mk] = halde[0];
            const letzt = halde.pop();
            if (halde.length) {
                halde[0] = letzt;
                runter(0);
            }
            if (weg[u] || mk !== marke[u]) continue;
            const v = ziel[u];
            if (v < 0 || weg[v] || kosten(u, v, randEcke(u)) !== c) {
                bewerte(u);
                continue;
            }
            for (const k of fan(u)) {
                if (hat(k, v)) {
                    lebt[k] = 0;
                    continue;
                }
                for (let j = 0; j < 3; j++) if (ecke[k * 3 + j] === u) ecke[k * 3 + j] = v;
                vt[v].push(k);
            }
            vt[u] = [];
            weg[u] = 1;
            fehler[v] = c;
            for (const q of ebene[u]) nimm(v, q[0], q[1], q[2], q[3]);
            ebene[u] = [];
            const ring = nachbarn(v);
            bewerte(v);
            for (const x of ring) bewerte(x);
        }
        let n = 0;
        for (let k = 0; k < T; k++) if (lebt[k]) n++;
        const aus = { von: new Int32Array(n * 3), lage: new Int32Array(n * 3), ur: new Int32Array(n * 3), xyz: X, W };
        for (let k = 0, o = 0; k < T; k++) {
            if (!lebt[k]) continue;
            for (let j = 0; j < 3; j++, o++) {
                aus.von[o] = von[k * 3 + j];
                aus.lage[o] = ecke[k * 3 + j];
                aus.ur[o] = ur[k * 3 + j];
            }
        }
        return aus;
    }
    // Der Flügel in Ruhe: Lage und Normale eines Teils mit `tuer` um sein Scharnier (hx, zf) auf den Winkel gedreht, den der Wirt
    // ihm geschlossen gibt (`_fluegelSchwenk` bei 0: −offen; ohne gebackene Offen-Pose 0) — Drehung um y wie three `makeRotationY`.
    // null für jedes andere Teil. Ein Flügel mit eigener Basis (das Tor der Porta) kennt die Ruhe der Stufe nicht: Bruch beim Namen.
    function __fluegelZu(m) {
        const t = m && m.tuer;
        if (!t) return null;
        if (t.basis) throw new Error("Stufe aus der L0: ein Flügel mit Basis — seine Ruhe kennt nur der Wirt");
        const w = Number.isFinite(t.offen) && t.offen !== 0 ? -t.offen : 0;
        const c = Math.cos(w),
            sn = Math.sin(w);
        const dreh = (src, hx, zf) => {
            const out = new src.constructor(src.length);
            for (let i = 0; i < src.length; i += 3) {
                const x = src[i] - hx,
                    z = src[i + 2] - zf;
                out[i] = c * x + sn * z + hx;
                out[i + 1] = src[i + 1];
                out[i + 2] = -sn * x + c * z + zf;
            }
            return out;
        };
        const aus = { position: dreh(m.position.array, t.hx || 0, t.zf || 0) };
        if (m.normal && m.normal.array) aus.normal = dreh(m.normal.array, 0, 0);
        return aus;
    }
    // je Dreieck t der Lage P (Index I): `nrm` die Normale (Einheit, nach `out`) und die doppelte Fläche, `hoehe` die kleinste Höhe
    // (2 · Fläche ÷ längste Kante)
    function __dreieckMass(P, I) {
        const nrm = (t, out) => {
            const a = I[t * 3] * 3,
                b = I[t * 3 + 1] * 3,
                c = I[t * 3 + 2] * 3;
            const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2]; // prettier-ignore
            const vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2]; // prettier-ignore
            const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; // prettier-ignore
            const fl2 = Math.hypot(nx, ny, nz);
            out[0] = nx / fl2;
            out[1] = ny / fl2;
            out[2] = nz / fl2;
            return fl2;
        };
        const nq = [0, 0, 0];
        const hoehe = (t) => {
            const a = I[t * 3] * 3,
                b = I[t * 3 + 1] * 3,
                c = I[t * 3 + 2] * 3;
            const kante = Math.max(Math.hypot(P[b] - P[a], P[b + 1] - P[a + 1], P[b + 2] - P[a + 2]), Math.hypot(P[c] - P[a], P[c + 1] - P[a + 1], P[c + 2] - P[a + 2]), Math.hypot(P[c] - P[b], P[c + 1] - P[b + 1], P[c + 2] - P[b + 2])); // prettier-ignore
            return nrm(t, nq) / kante;
        };
        return [nrm, hoehe];
    }
    // der Abstand des Punkts p zum Dreieck t der Lage P (Index I): der nächste Punkt nach Ericson (Ecke, Kante oder Fläche)
    function __punktDreieck(p, P, I, t) {
        const a = I[t * 3] * 3,
            b = I[t * 3 + 1] * 3,
            c = I[t * 3 + 2] * 3;
        const ab = [P[b] - P[a], P[b + 1] - P[a + 1], P[b + 2] - P[a + 2]], ac = [P[c] - P[a], P[c + 1] - P[a + 1], P[c + 2] - P[a + 2]]; // prettier-ignore
        const dot = (x, y) => x[0] * y[0] + x[1] * y[1] + x[2] * y[2];
        const zu = (o, u, v) => Math.hypot(p[0] - P[o] - u * ab[0] - v * ac[0], p[1] - P[o + 1] - u * ab[1] - v * ac[1], p[2] - P[o + 2] - u * ab[2] - v * ac[2]); // prettier-ignore
        const ap = [p[0] - P[a], p[1] - P[a + 1], p[2] - P[a + 2]];
        const d1 = dot(ab, ap), d2 = dot(ac, ap); // prettier-ignore
        if (d1 <= 0 && d2 <= 0) return zu(a, 0, 0);
        const bp = [p[0] - P[b], p[1] - P[b + 1], p[2] - P[b + 2]];
        const d3 = dot(ab, bp), d4 = dot(ac, bp); // prettier-ignore
        if (d3 >= 0 && d4 <= d3) return zu(a, 1, 0);
        const vc = d1 * d4 - d3 * d2;
        if (vc <= 0 && d1 >= 0 && d3 <= 0) return zu(a, d1 / (d1 - d3), 0);
        const cp = [p[0] - P[c], p[1] - P[c + 1], p[2] - P[c + 2]];
        const d5 = dot(ab, cp), d6 = dot(ac, cp); // prettier-ignore
        if (d6 >= 0 && d5 <= d6) return zu(a, 0, 1);
        const vb = d5 * d2 - d1 * d6;
        if (vb <= 0 && d2 >= 0 && d6 <= 0) return zu(a, 0, d2 / (d2 - d6));
        const va = d3 * d6 - d5 * d4;
        if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
            const w = (d4 - d3) / (d4 - d3 + (d5 - d6));
            return zu(a, 1 - w, w);
        }
        const den = 1 / (va + vb + vc);
        return zu(a, vb * den, vc * den);
    }
    // DAS KLEINSTE RECHTECK um die Ecken eines Steins in seiner Ebene (`__stufeAusL0`, der Rahmen je Stein): die Hülle seiner
    // Ecken in (tA, bA), je Kante ihr umschreibendes Rechteck, das kleinste gilt — sein Winkel gegen tA in [−winkel/2, π/2 − winkel/2)
    // (ein Rechteck ist sich um π/2 gleich) und seine Seiten W · H
    function __rechteckKlein(P, I, tris, tA, bA) {
        const pts = [];
        for (const t of tris)
            for (let j = 0; j < 3; j++) {
                const i = I[t * 3 + j] * 3;
                pts.push([P[i] * tA[0] + P[i + 1] * tA[1] + P[i + 2] * tA[2], P[i] * bA[0] + P[i + 1] * bA[1] + P[i + 2] * bA[2]]);
            }
        pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
        const kreuz = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
        const unten = [],
            oben = [];
        for (const p of pts) {
            while (unten.length >= 2 && kreuz(unten[unten.length - 2], unten[unten.length - 1], p) <= 0) unten.pop();
            unten.push(p);
        }
        for (let i = pts.length - 1; i >= 0; i--) {
            while (oben.length >= 2 && kreuz(oben[oben.length - 2], oben[oben.length - 1], pts[i]) <= 0) oben.pop();
            oben.push(pts[i]);
        }
        const h = unten.slice(0, -1).concat(oben.slice(0, -1));
        const viertel = Math.PI / 2;
        let best = { W: Infinity, H: Infinity, th: 0 };
        for (let i = 0; i < h.length; i++) {
            const dx = h[(i + 1) % h.length][0] - h[i][0],
                dy = h[(i + 1) % h.length][1] - h[i][1],
                l = Math.hypot(dx, dy);
            if (!(l > 1e-9)) continue;
            const cx = dx / l,
                cy = dy / l;
            let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity; // prettier-ignore
            for (const p of h) {
                const u = p[0] * cx + p[1] * cy,
                    v = p[1] * cx - p[0] * cy;
                if (u < u0) u0 = u;
                if (u > u1) u1 = u;
                if (v < v0) v0 = v;
                if (v > v1) v1 = v;
            }
            if (!((u1 - u0) * (v1 - v0) < best.W * best.H)) continue;
            let th = Math.atan2(cy, cx);
            th -= Math.floor(th / viertel) * viertel;
            if (th >= viertel - STUFE_AUS_L0.winkel / 2) th -= viertel;
            best = { W: u1 - u0, H: v1 - v0, th };
        }
        return best;
    }
    function __stufeAusL0(teile, s, sicht) {
        const O = STUFE_AUS_L0;
        if (!(s > 0) || !Array.isArray(sicht) || sicht.length !== teile.length)
            throw new Error("Stufe aus der L0: Bildpunkt " + s + " oder Sicht (" + (sicht && sicht.length) + " gegen " + teile.length + " Teile) fehlt");
        const aus = [];
        const zelleM = O.zellePx * s;
        let zonen = 0,
            vorKollaps = 0,
            nachKollaps = 0,
            unterZelle = 0,
            steine = 0,
            flankenTris = 0,
            gedreht = 0,
            umriss = 0,
            duenn = 0;
        // DER VORLAUF je Teil — DIE L0 IN RUHE: ein Tür-Flügel liegt in seiner gebackenen Offen-Pose (`tuer.offen`), die Welt zeigt
        // ihn geschlossen — um das Scharnier (hx, zf) um −offen gedreht, wie der Wirt ihn schwenkt (`_fluegelSchwenk` bei 0); die
        // Stufe trägt ihn geschlossen im Leib (kein `tuer`: die Stufen ab der L1 zeigen keinen Flügel). Die Sicht des Wirts sah
        // dieselbe Ruhe. Dazu die gesehenen Dreiecke (mit Zeile das Muster, sonst roh), ob eines über der Zelle liegt, die gesehene
        // Fläche mit ihrer Farbe und ihre Kiste.
        const lauf = teile.map((m, mi) => {
            if (!m || !m.position || !m.index) return null;
            const zu = __fluegelZu(m);
            const P = zu ? zu.position : m.position.array,
                I = m.index,
                nt = I.length / 3,
                S = sicht[mi];
            if (!S || S.length !== nt)
                throw new Error("Stufe aus der L0: Teil " + mi + " trägt " + nt + " Dreiecke, die Sicht " + (S ? S.length : 0));
            const V = m.aVerband && m.aVerband.array ? m.aVerband.array : null;
            const nrTeil = m.mat && m.mat.verband > 0 ? m.mat.verband | 0 : 0;
            const [nrm, hoehe] = __dreieckMass(P, I);
            const C = m.color && m.color.array ? m.color : null;
            const L = { zu, P, nrVon: (t) => (V ? V[I[t * 3]] | 0 : nrTeil), nrm, hoehe, C, musterT: [], roh: [], ueber: false, A: 0, farbe: [0, 0, 0], lo: [Infinity, Infinity, Infinity], hi: [-Infinity, -Infinity, -Infinity] }; // prettier-ignore
            const nq = [0, 0, 0];
            for (let t = 0; t < nt; t++) {
                const fl2 = S[t] ? nrm(t, nq) : 0;
                if (!(fl2 > 1e-12)) continue;
                if (L.nrVon(t)) L.musterT.push(t);
                else {
                    L.roh.push(t);
                    if (hoehe(t) >= zelleM) L.ueber = true;
                }
                L.A += fl2 / 2;
                for (let j = 0; j < 3; j++) {
                    const i = I[t * 3 + j];
                    for (let k = 0; k < 3; k++) {
                        const x = P[i * 3 + k];
                        if (x < L.lo[k]) L.lo[k] = x;
                        if (x > L.hi[k]) L.hi[k] = x;
                        if (C) L.farbe[k] += (C.array[i * C.itemSize + k] * fl2) / 6;
                    }
                }
            }
            // EIN TEIL UNTER DER ZELLE (die Beschläge): kein Muster, kein gesehenes Dreieck über der Zelle
            L.faellt = !L.musterT.length && !L.ueber;
            return L;
        });
        // DER TRÄGER: ein Teil unter der Zelle fällt als Mittel in den Stoff des Teils, dessen gesehenes Dreieck seiner Mitte am
        // nächsten liegt (der Beschlag in seinen Flügel, die Lamelle in ihr Dach) — die Farbe des Trägers rückt auf das
        // flächengewichtete Mittel beider; das gilt jeder Seh-Klasse unter der Zelle, nie einem Stoff beim Namen
        const traeger = new Map();
        lauf.forEach((F, fi) => {
            if (!F || !F.faellt || !(F.A > 0)) return;
            const p = [(F.lo[0] + F.hi[0]) / 2, (F.lo[1] + F.hi[1]) / 2, (F.lo[2] + F.hi[2]) / 2];
            let best = Infinity,
                ti = -1;
            lauf.forEach((G, gi) => {
                if (!G || G.faellt) return;
                for (const T of [G.musterT, G.roh])
                    for (const t of T) {
                        const d = __punktDreieck(p, G.P, teile[gi].index, t);
                        if (d < best) [best, ti] = [d, gi];
                    }
            });
            if (ti < 0 || !F.C || !lauf[ti].C)
                throw new Error("Stufe aus der L0: Teil " + fi + " fällt unter der Zelle — " + (ti < 0 ? "kein Teil trägt es" : "ohne Farbe (Teil " + (F.C ? ti : fi) + ")")); // prettier-ignore
            const z = traeger.get(ti) || { A: 0, farbe: [0, 0, 0] };
            z.A += F.A;
            for (let k = 0; k < 3; k++) z.farbe[k] += F.farbe[k];
            traeger.set(ti, z);
            unterZelle++;
        });
        for (let mi = 0; mi < teile.length; mi++) {
            const m = teile[mi],
                L = lauf[mi];
            if (!L) {
                aus.push(m);
                continue;
            }
            if (L.faellt) continue;
            const zu = L.zu,
                P = L.P,
                I = m.index,
                n = P.length / 3,
                nrVon = L.nrVon,
                nrm = L.nrm,
                hoehe = L.hoehe;
            const attrs = Object.keys(m).filter((k) => m[k] && m[k].array && m[k].itemSize && m[k].array.length === n * m[k].itemSize);
            // die Muster-Ecken verschweißt (1 mm, ±65 m im Vorlagen-Raum): ein Stein ist eine zusammenhängende Menge Dreiecke
            const schweiss = new Map(),
                wid = new Int32Array(n).fill(-1);
            const weld = (i) => {
                if (wid[i] >= 0) return wid[i];
                const qx = Math.round(P[i * 3] * 1000),
                    qy = Math.round(P[i * 3 + 1] * 1000),
                    qz = Math.round(P[i * 3 + 2] * 1000);
                if (Math.abs(qx) >= 65536 || Math.abs(qy) >= 65536 || Math.abs(qz) >= 65536)
                    throw new Error("Stufe aus der L0: Teil " + mi + " liegt jenseits ±65 m der Vorlage");
                const k = ((qx + 65536) * 131072 + (qy + 65536)) * 131072 + (qz + 65536);
                let w = schweiss.get(k);
                if (w === undefined) schweiss.set(k, (w = schweiss.size));
                return (wid[i] = w);
            };
            const behalten = [],
                musterT = L.musterT,
                roh = L.roh,
                flanke = new Set();
            const nq = [0, 0, 0];
            // die Ecken verschweißt; die Inseln der übrigen Dreiecke (ohne Zeile)
            for (const t of musterT) for (let j = 0; j < 3; j++) weld(I[t * 3 + j]);
            for (const t of roh) for (let j = 0; j < 3; j++) weld(I[t * 3 + j]);
            const wurzel = (E, x) => {
                while (E[x] !== x) x = E[x] = E[E[x]];
                return x;
            };
            const inselE = Int32Array.from({ length: schweiss.size }, (_, i) => i);
            for (const t of roh) {
                const a = wurzel(inselE, wid[I[t * 3]]);
                inselE[wurzel(inselE, wid[I[t * 3 + 1]])] = a;
                inselE[wurzel(inselE, wid[I[t * 3 + 2]])] = a;
            }
            const inseln = new Map();
            for (const t of roh) {
                const r = wurzel(inselE, wid[I[t * 3]]);
                if (!inseln.has(r)) inseln.set(r, []);
                inseln.get(r).push(t);
            }
            for (const L of inseln.values()) {
                // STEIN OHNE ZEILE: die Haupt-Normale der Insel (die Richtung auf 1/20 mit der größten Fläche, ihr Mittel)
                const richt = new Map();
                let best = null;
                for (const t of L) {
                    const f = nrm(t, nq);
                    const key = ((Math.round(nq[0] * 20) + 20) * 41 + Math.round(nq[1] * 20) + 20) * 41 + Math.round(nq[2] * 20) + 20; // prettier-ignore
                    let r = richt.get(key);
                    if (!r) richt.set(key, (r = [0, 0, 0, 0]));
                    r[0] += nq[0] * f;
                    r[1] += nq[1] * f;
                    r[2] += nq[2] * f;
                    r[3] += f;
                    if (!best || r[3] > best[3]) best = r;
                }
                const lD = Math.hypot(best[0], best[1], best[2]);
                const nD = [best[0] / lD, best[1] / lD, best[2] / lD];
                // der Rahmen der Insel (wie die Ebene der Zone ihn nimmt): ein Quader in ihm — jede Fläche parallel zu einer Achse
                const up = Math.abs(nD[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
                const tA = [up[1] * nD[2] - up[2] * nD[1], up[2] * nD[0] - up[0] * nD[2], up[0] * nD[1] - up[1] * nD[0]];
                const tl = Math.hypot(tA[0], tA[1], tA[2]);
                for (let k = 0; k < 3; k++) tA[k] /= tl;
                const bA = [nD[1] * tA[2] - nD[2] * tA[1], nD[2] * tA[0] - nD[0] * tA[2], nD[0] * tA[1] - nD[1] * tA[0]];
                const achse = (x) => Math.abs(nq[0] * x[0] + nq[1] * x[1] + nq[2] * x[2]);
                let stein = true;
                for (const t of L) {
                    nrm(t, nq);
                    if (Math.max(achse(nD), achse(tA), achse(bA)) < 0.99) {
                        stein = false;
                        break;
                    }
                }
                if (stein) {
                    // ein Rechteck in ihrer Ebene: die Front füllt ihr Rechteck bis auf die Zelle am Umriss
                    let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity, A = 0; // prettier-ignore
                    for (const t of L) {
                        const f = nrm(t, nq);
                        if (nq[0] * nD[0] + nq[1] * nD[1] + nq[2] * nD[2] <= 0.9) continue;
                        A += f / 2;
                        for (let j = 0; j < 3; j++) {
                            const i = I[t * 3 + j] * 3,
                                u = P[i] * tA[0] + P[i + 1] * tA[1] + P[i + 2] * tA[2],
                                v = P[i] * bA[0] + P[i + 1] * bA[1] + P[i + 2] * bA[2];
                            if (u < u0) u0 = u;
                            if (u > u1) u1 = u;
                            if (v < v0) v0 = v;
                            if (v > v1) v1 = v;
                        }
                    }
                    stein = A > 0 && (u1 - u0) * (v1 - v0) - A <= zelleM * (u1 - u0 + v1 - v0);
                }
                if (stein) {
                    // der Stein fällt in die Flächen seiner Zonen: Front und Rücken immer, die Flanken wie die Kanten des Verbands
                    steine++;
                    for (const t of L) {
                        nrm(t, nq);
                        musterT.push(t);
                        if (achse(nD) <= 0.9) flanke.add(t);
                    }
                    continue;
                }
                for (const t of L) if (hoehe(t) >= s) behalten.push(t); // DÜNNES FÄLLT: die kleinste Höhe unter einem Bildpunkt
            }
            // die Ebenen je Zeile (Normale auf 1/20, Abstand auf `ebeneM`)
            const ebenen = new Map();
            for (const t of musterT) {
                const a = I[t * 3] * 3,
                    b = I[t * 3 + 1] * 3,
                    c = I[t * 3 + 2] * 3;
                const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2]; // prettier-ignore
                const vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2]; // prettier-ignore
                let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; // prettier-ignore
                const fl2 = Math.hypot(nx, ny, nz);
                nx /= fl2;
                ny /= fl2;
                nz /= fl2;
                const nr = nrVon(t);
                const dq = Math.round((nx * P[a] + ny * P[a + 1] + nz * P[a + 2]) / O.ebeneM);
                const fl = flanke.has(t);
                const key = ((((nr * 41 + Math.round(nx * 20) + 20) * 41 + Math.round(ny * 20) + 20) * 41 + Math.round(nz * 20) + 20) * 16384 + dq + 8192) * 2 + (fl ? 1 : 0); // prettier-ignore
                let e = ebenen.get(key);
                if (!e) ebenen.set(key, (e = { nr, fl, n: [nx, ny, nz], tris: [], flaeche: 0 }));
                e.tris.push(t);
                e.flaeche += fl2 / 2;
            }
            // DER RAHMEN JE STEIN (vor dem Pixelfehler): je Ebene jeder Stein — die Dreiecke, die in ihr Kanten teilen (eine geteilte
            // Ecke verbindet nie: die drei Stufen der Treppe berühren sich in einer Ecke, ihre Seiten überdecken sich, die Fläche zählte
            // doppelt und füllte ihr gemeinsames Rechteck bis über die oberste Stufe) — und sein
            // Rechteck — im Rahmen der Ebene, sonst das kleinste Rechteck um seine Hülle: die Flanke der Schindel steht um die Neigung
            // des Dachs gedreht in ihrer Ebene, ihr Rechteck im Rahmen der Ebene war bis zu neunfach leer und stand als Platte über dem
            // Dach. Ein Stein, der sein Rechteck bis auf die Zelle am Umriss füllt, fällt in die Zonen seines Winkels; jeder andere
            // (das Dreieck am Giebel, die Fläche mit schrägem Rand) behält seine Dreiecke — sie gehen durch den Pixelfehler, Dünnes fällt
            const c = O.zellePx * s;
            const pt = (i, ax) => P[i * 3] * ax[0] + P[i * 3 + 1] * ax[1] + P[i * 3 + 2] * ax[2];
            const rahmen = [];
            for (const e of ebenen.values()) {
                if (e.nr && e.flaeche < O.minFlaeche) continue; // die Kanten der Steine: ihr Relief (die Front eines Steins ohne Zeile fällt nie)
                const up = Math.abs(e.n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
                let tA = [up[1] * e.n[2] - up[2] * e.n[1], up[2] * e.n[0] - up[0] * e.n[2], up[0] * e.n[1] - up[1] * e.n[0]];
                const tl = Math.hypot(tA[0], tA[1], tA[2]);
                tA = tA.map((x) => x / tl);
                const bA = [e.n[1] * tA[2] - e.n[2] * tA[1], e.n[2] * tA[0] - e.n[0] * tA[2], e.n[0] * tA[1] - e.n[1] * tA[0]];
                const NW = schweiss.size,
                    kante = new Map(),
                    ke = e.tris.map((_, i) => i);
                const kf = (x) => {
                    while (ke[x] !== x) x = ke[x] = ke[ke[x]];
                    return x;
                };
                e.tris.forEach((t, i) => {
                    for (let j = 0; j < 3; j++) {
                        const a = wid[I[t * 3 + j]],
                            b = wid[I[t * 3 + ((j + 1) % 3)]],
                            k = a < b ? a * NW + b : b * NW + a,
                            o = kante.get(k);
                        if (o === undefined) kante.set(k, i);
                        else ke[kf(i)] = kf(o);
                    }
                });
                const stein = new Map();
                for (let i = 0; i < e.tris.length; i++) {
                    const t = e.tris[i],
                        k = kf(i);
                    let r = stein.get(k);
                    if (!r) stein.set(k, (r = { u0: 1e9, u1: -1e9, v0: 1e9, v1: -1e9, A: 0, tris: [] }));
                    r.tris.push(t);
                    r.A += nrm(t, nq) / 2;
                    for (let j = 0; j < 3; j++) {
                        const i = I[t * 3 + j],
                            u = pt(i, tA),
                            v = pt(i, bA);
                        if (u < r.u0) r.u0 = u;
                        if (u > r.u1) r.u1 = u;
                        if (v < r.v0) r.v0 = v;
                        if (v > r.v1) r.v1 = v;
                    }
                }
                const winkel = new Map();
                for (const r of stein.values()) {
                    let q = 0,
                        W = r.u1 - r.u0,
                        H = r.v1 - r.v0;
                    if (!(W * H - r.A <= c * (W + H))) {
                        const R = __rechteckKlein(P, I, r.tris, tA, bA);
                        if (!(R.W * R.H - r.A <= c * (R.W + R.H))) {
                            for (const t of r.tris) if (hoehe(t) >= s) behalten.push(t);
                            umriss++;
                            continue;
                        }
                        q = Math.round(R.th / O.winkel);
                        [W, H] = [R.W, R.H];
                        gedreht++;
                    }
                    // DIE FLANKE UNTER DEM BILDPUNKT ist Dünnes (dasselbe Maß wie jedes Dünne, `s`): unter der Zelle `c` fielen die
                    // 2–3 cm tiefen Flanken der Fachwerk-Balken, die die L0 an der L1 als Linie eines Bildpunkts zeigt
                    if (e.fl && Math.min(W, H) < s) {
                        duenn++;
                        continue;
                    }
                    if (!winkel.has(q)) winkel.set(q, []);
                    winkel.get(q).push(r.tris);
                }
                rahmen.push({ e, tE: tA, bE: bA, winkel });
            }
            // die neue Geometrie: die behaltenen Dreiecke nach dem Pixelfehler (jede Ecke ihre Felder der L0, die Lage ihres Ziels),
            // dann die Flächen der Zonen
            const K = __pixelKollaps(P, I, behalten, O.fehlerPx * s);
            vorKollaps += behalten.length;
            nachKollaps += K.von.length / 3;
            const ecken = [],
                idx = [],
                alt = new Map();
            for (let k = 0; k < K.von.length; k++) {
                const i = K.von[k],
                    w = K.lage[k],
                    bleibt = w === K.ur[k],
                    key = bleibt ? i : -1 - (i * K.W + w);
                let q = alt.get(key);
                if (q === undefined) {
                    alt.set(key, (q = ecken.length));
                    ecken.push(bleibt ? { von: i } : { von: i, lage: [K.xyz[w * 3], K.xyz[w * 3 + 1], K.xyz[w * 3 + 2]] });
                }
                idx.push(q);
            }
            const C = m.color && m.color.array ? m.color : null;
            for (const { e, tE, bE, winkel } of rahmen)
                for (const [q, steinTris] of winkel) {
                // je Winkel der Rahmen der Ebene um ihn gedreht (t × b = n bleibt), je Stein sein Rechteck in ihm
                const co = Math.cos(q * O.winkel),
                    si = Math.sin(q * O.winkel);
                const tA = [0, 1, 2].map((k) => co * tE[k] + si * bE[k]),
                    bA = [0, 1, 2].map((k) => co * bE[k] - si * tE[k]);
                const R = steinTris.map((tris) => {
                    const r = { u0: 1e9, u1: -1e9, v0: 1e9, v1: -1e9, tris };
                    for (const t of tris)
                        for (let j = 0; j < 3; j++) {
                            const i = I[t * 3 + j],
                                u = pt(i, tA),
                                v = pt(i, bA);
                            if (u < r.u0) r.u0 = u;
                            if (u > r.u1) r.u1 = u;
                            if (v < r.v0) r.v0 = v;
                            if (v > r.v1) r.v1 = v;
                        }
                    return r;
                });
                // Steine näher als `luecke` bilden eine Zone
                const ze = R.map((_, i) => i);
                const zf = (x) => {
                    while (ze[x] !== x) x = ze[x] = ze[ze[x]];
                    return x;
                };
                const ordnung = R.map((_, i) => i).sort((a, b) => R[a].u0 - R[b].u0 || a - b);
                for (let a = 0; a < ordnung.length; a++) {
                    const ra = R[ordnung[a]];
                    for (let b = a + 1; b < ordnung.length; b++) {
                        const rb = R[ordnung[b]];
                        if (rb.u0 > ra.u1 + O.luecke) break;
                        if (rb.v0 <= ra.v1 + O.luecke && ra.v0 <= rb.v1 + O.luecke) ze[zf(ordnung[b])] = zf(ordnung[a]);
                    }
                }
                const gruppen = new Map();
                R.forEach((r, i) => {
                    const g = zf(i);
                    if (!gruppen.has(g)) gruppen.set(g, []);
                    gruppen.get(g).push(r);
                });
                for (const g of gruppen.values()) {
                    // die Farbe flächengewichtet, die Tiefe das Mittel der Ecken
                    let tiefe = 0,
                        nEck = 0,
                        fl = 0;
                    const farbe = C ? new Array(C.itemSize).fill(0) : null;
                    let gu0 = 1e9, gv0 = 1e9, gu1 = -1e9, gv1 = -1e9; // prettier-ignore
                    for (const r of g) {
                        if (r.u0 < gu0) gu0 = r.u0;
                        if (r.v0 < gv0) gv0 = r.v0;
                        if (r.u1 > gu1) gu1 = r.u1;
                        if (r.v1 > gv1) gv1 = r.v1;
                        for (const t of r.tris) {
                            const ia = I[t * 3], ib = I[t * 3 + 1], ic = I[t * 3 + 2]; // prettier-ignore
                            const ux = P[ib * 3] - P[ia * 3], uy = P[ib * 3 + 1] - P[ia * 3 + 1], uz = P[ib * 3 + 2] - P[ia * 3 + 2]; // prettier-ignore
                            const vx = P[ic * 3] - P[ia * 3], vy = P[ic * 3 + 1] - P[ia * 3 + 1], vz = P[ic * 3 + 2] - P[ia * 3 + 2]; // prettier-ignore
                            const f = Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx) / 2;
                            fl += f;
                            for (const i of [ia, ib, ic]) {
                                tiefe += pt(i, e.n);
                                nEck++;
                                if (farbe) for (let j = 0; j < farbe.length; j++) farbe[j] += (C.array[i * C.itemSize + j] * f) / 3;
                            }
                        }
                    }
                    if (!(fl > 0)) continue;
                    // die Flanke eines Steins ohne Zeile trägt ihr Relief als ZONE: ihre Ebene teilen fremde Steine quer über die
                    // Fassade (die Oberseiten einer Bohlen-Lage), das Auge sieht den zusammenhängenden Streifen — unter `minZellen`
                    // Zellen fällt er (die Zone der Bohlen-Fronten: L1 schwarzwald ohne Fläche 24,2 → 3,5 m²)
                    if (e.fl && fl < O.minZellen * c * c) continue;
                    tiefe /= nEck;
                    if (farbe) for (let j = 0; j < farbe.length; j++) farbe[j] /= fl;
                    // die Zone als Raster der Zelle `c`: eine Zelle trägt, wo ein Stein sie berührt (die Fuge unter einer Zelle
                    // schließt sich); die größten Rechtecke der getragenen Zellen sind die Fläche, Löcher bleiben offen
                    const nu = Math.max(1, Math.ceil((gu1 - gu0) / c)),
                        nv = Math.max(1, Math.ceil((gv1 - gv0) / c));
                    const zelle = new Uint8Array(nu * nv);
                    for (const r of g) {
                        const a0 = Math.max(0, Math.floor((r.u0 - gu0) / c)), a1 = Math.min(nu - 1, Math.floor((r.u1 - gu0) / c)); // prettier-ignore
                        const b0 = Math.max(0, Math.floor((r.v0 - gv0) / c)), b1 = Math.min(nv - 1, Math.floor((r.v1 - gv0) / c)); // prettier-ignore
                        for (let b = b0; b <= b1; b++) for (let a = a0; a <= a1; a++) zelle[b * nu + a] = 1;
                    }
                    const w0 = tiefe - O.hinterM;
                    const ecke = (u, v) =>
                        ecken.push({
                            neu: [tA[0] * u + bA[0] * v + e.n[0] * w0, tA[1] * u + bA[1] * v + e.n[1] * w0, tA[2] * u + bA[2] * v + e.n[2] * w0],
                            n: e.n,
                            farbe,
                            nr: e.nr,
                        });
                    for (let b = 0; b < nv; b++)
                        for (let a = 0; a < nu; a++) {
                            if (zelle[b * nu + a] !== 1) continue;
                            let w = 1;
                            while (a + w < nu && zelle[b * nu + a + w] === 1) w++;
                            let h = 1;
                            for (; b + h < nv; h++) {
                                let voll = true;
                                for (let x = a; x < a + w && voll; x++) voll = zelle[(b + h) * nu + x] === 1;
                                if (!voll) break;
                            }
                            for (let y = b; y < b + h; y++) for (let x = a; x < a + w; x++) zelle[y * nu + x] = 2;
                            const u0 = gu0 + a * c, u1 = Math.min(gu1, gu0 + (a + w) * c), v0 = gv0 + b * c, v1 = Math.min(gv1, gv0 + (b + h) * c); // prettier-ignore
                            const basis = ecken.length;
                            ecke(u0, v0);
                            ecke(u1, v0);
                            ecke(u1, v1);
                            ecke(u0, v1);
                            // gewickelt nach der Normale der Ebene: (t, b) mit t × b = n läuft gegen den Uhrzeigersinn
                            idx.push(basis, basis + 1, basis + 2, basis, basis + 2, basis + 3);
                            if (e.fl) flankenTris += 2;
                        }
                    zonen++;
                }
            }
            if (!idx.length) continue;
            const neu = {};
            for (const k in m) if (k !== "index" && !(zu && k === "tuer") && !attrs.includes(k)) neu[k] = m[k];
            for (const a of attrs) {
                const k = m[a].itemSize,
                    src = (zu && zu[a]) || m[a].array,
                    arr = new src.constructor(ecken.length * k);
                ecken.forEach((q, i) => {
                    if (q.von !== undefined) {
                        for (let j = 0; j < k; j++) arr[i * k + j] = src[q.von * k + j];
                        if (q.lage && a === "position") arr.set(q.lage, i * 3);
                    } else if (a === "position") arr.set(q.neu, i * 3);
                    else if (a === "normal") arr.set(q.n, i * 3);
                    else if (a === "color" && q.farbe) for (let j = 0; j < k; j++) arr[i * k + j] = q.farbe[j];
                    else if (a === "aVerband") arr[i] = q.nr;
                });
                neu[a] = { array: arr, itemSize: k };
            }
            // der Träger nimmt seine gefallenen Teile als Mittel in seinen Stoff (jede Ecke um dieselbe Verschiebung)
            const zt = traeger.get(mi);
            if (zt) {
                if (!neu.color) throw new Error("Stufe aus der L0: Träger " + mi + " ohne Farbe in der Stufe");
                const ca = neu.color.array,
                    cs = neu.color.itemSize;
                for (let k = 0; k < 3; k++) {
                    const d = (L.farbe[k] + zt.farbe[k]) / (L.A + zt.A) - L.farbe[k] / L.A;
                    for (let i = k; i < ca.length; i += cs) ca[i] += d;
                }
                traeger.delete(mi);
            }
            neu.index = Uint32Array.from(idx);
            aus.push(neu);
        }
        for (const ti of traeger.keys()) throw new Error("Stufe aus der L0: der Träger " + ti + " gefallener Teile fällt selbst");
        return { teile: aus, zonen, kollaps: [vorKollaps, nachKollaps], unterZelle, steine: [steine, flankenTris, duenn], rahmen: [gedreht, umriss] };
    }
    function __replyBuildAsset(msg) {
        const reqId = msg.reqId;
        let meshes = [];
        let bruch = null; // der Grund eines Gusses, der warf (reist beim Namen mit, nie eine leere Antwort ohne Grund)
        let budgetBruch = null; // W8: der Bruch des Budget-Gesetzes (nur Zweit-Kerne), reist mit
        let budgetBericht = null; // W8: Stufe + Kosten vorher/nachher (nur Zweit-Kerne), reist mit
        // JAHRESZEIT (Vorlagen-Phaenologie): AnazhRealm reicht die aktuelle Saison herein, die
        // Foundry backt die Assets in DIESER Jahreszeit (Blatt-Farbe/Praesenz Fruehling..Winter).
        if (msg.season && typeof setSeasonColors === "function") {
            try {
                setSeasonColors(msg.season);
            } catch (_se) {}
        }
        try {
            // W7b/N2 (Studio-Vertrag v1.1 + Nervensystem-Plan) — der ZWEIT-KERN-DISPATCH ist
            // MANIFEST-GETRIEBEN: ein Preset, das NICHT im Pflanzen-Buch steht (der Primaer-
            // PRESETS-Check fuehrt wie bisher), baut durch den ERSTEN Manifest-Kern, dessen
            // PRESETS es traegt (dieselbe Vertrags-Signatur; der Kern klemmt intern auf seine
            // feine Stufe). Extraktion/Dispose identisch: die Meshes reisen engine-neutral,
            // mat-Regler fliessen mit; der zweitKern-Flag steuert die mat.color-Serialisierung.
            let zweit = null;
            let zweitBaecker = null; // DIE EINE PIPE (V18.458): Gattungs-Bäcker für MESHFREI-Kerne
            if (typeof msg.presetId === "string" && !Object.prototype.hasOwnProperty.call(PRESETS, msg.presetId)) {
                for (const zk of __zweitKerne()) {
                    if (!zk.kern.PRESETS || !Object.prototype.hasOwnProperty.call(zk.kern.PRESETS, msg.presetId))
                        continue;
                    if (typeof zk.kern.buildInstance === "function") {
                        zweit = zk;
                        break;
                    }
                    // MESHFREI-Kern (Vertrag §8 — kein eigener GL-Bau): die PIPE bäckt ihn
                    // über den Tisch BAKERS_BY_KIND (foundry-core, tabellengetrieben M8).
                    const __pk = zk.kern.PRESETS[msg.presetId];
                    if (
                        __pk &&
                        typeof BAKERS_BY_KIND !== "undefined" &&
                        typeof BAKERS_BY_KIND[__pk.kind] === "function"
                    ) {
                        zweit = zk;
                        zweitBaecker = BAKERS_BY_KIND[__pk.kind];
                        break;
                    }
                }
            }
            const isZweitKern = !!zweit;
            // DIE STUFE AUS DER L0 (Einheit E7/E10): trägt die Budget-Zeile der Stufe `ausL0`, baut der Faden die L0 (dieselbe
            // Lieferung, die der Wirt als Stufe 0 bekam: Bau, Ausgang ihrer Zeile, Beipack), und die Stufe ist ihre Funktion
            // (`__stufeAusL0`) mit dem Bildpunkt und der Sicht, die der Wirt reicht (`msg.ausL0` = { s, sicht }) — das eigene
            // Rezept der Stufe läuft nie. Zeile und Anfrage sagen dasselbe, sonst bricht der Bau beim Namen.
            const PCk = (typeof self !== "undefined" ? self : globalThis).__phytoCore;
            const pkZ = isZweitKern ? zweit.kern.PRESETS[msg.presetId] : null;
            const zeileK = isZweitKern ? PCk.budgetZeile(zweit.kern.PORTAL_RENDER_CONFIG, pkZ && pkZ.kind, msg.lod | 0) : null;
            const ausL0 = !!(zeileK && zeileK.zeile && zeileK.zeile.ausL0);
            if (ausL0 !== !!msg.ausL0)
                throw new Error(
                    ausL0
                        ? "die Stufe kommt aus der L0 (Zeile ausL0), die Anfrage trägt keine Sicht"
                        : "die Anfrage trägt eine Sicht (ausL0), die Zeile der Stufe nicht"
                );
            const lodBau = ausL0 ? 0 : msg.lod | 0;
            // W-A1 (Katalysator §5) — DER REGLER-KANAL: msg.ov (B4-Overrides der Werkstatt)
            // reist in BEIDE Zweige (buildInstance nimmt ov als 4. Argument — der Pflanzen-
            // Pfad traegt Object.assign(P, ov) seit je, die Bruecke reichte nur null).
            // ERFINDER-WELLE („blume z.B. keine regler?"): jetzt sind auch die Pflanzen
            // regelbar; OHNE ov ist der Bau byte-identisch (gate:asset-contract Goldens
            // laufen ov-frei — der Welt-Pfad bleibt byte-vertraglich rein, W-A1-Gesetz:
            // ov umgeht IDB + f.cache am Host).
            const g = isZweitKern
                ? zweitBaecker
                    ? zweitBaecker(zweit.kern, msg.presetId, Number(msg.seed) || 0, lodBau, msg.ov || null)
                    : zweit.kern.buildInstance(msg.presetId, Number(msg.seed) || 0, lodBau, msg.ov || null)
                : buildInstance(msg.presetId || "eiche", Number(msg.seed) || 0, lodBau, msg.ov || null);
            g.updateMatrixWorld(true);
            // WELLE L (Q13 F-D8, additiv, must-ignore): DAS RAD REIST EINMAL. Ein Fahrzeug trägt seine Naben als Daten
            // (vehicle-core buildWheels: userData.rad {ecke, front, os}, userData.radDreht am drehenden Teil). Die Teile
            // der Ecke 0 reisen nabenrelativ gebacken mit `rad` = {dreht, raeder}: raeder nennt jede Ecke (Naben-Lage
            // im Vorlagen-Raum, lenkt, Drehung π für die Gegenseite — die Felge der Gegenseite ist die gespiegelte
            // Ecke 0 um π gedreht). Die übrigen Ecken reisen nicht: die Welt setzt das eine Rad viermal als Instanz.
            // Ein Kern ohne Naben bleibt byte-alt.
            const __naben = [];
            g.traverse((o) => {
                if (o.userData && o.userData.rad && typeof o.userData.rad.ecke === "number") __naben.push(o);
            });
            const __nabe0 = __naben.find((h) => h.userData.rad.ecke === 0) || null;
            let __nabeInv = null;
            let __raeder = null;
            if (__nabe0) {
                __nabeInv = new THREE.Matrix4().copy(__nabe0.matrixWorld).invert();
                const os0 = __nabe0.userData.rad.os;
                __raeder = __naben.map((h) => {
                    const p = new THREE.Vector3().setFromMatrixPosition(h.matrixWorld);
                    return { hx: p.x, hy: p.y, hz: p.z, front: !!h.userData.rad.front, dreh: h.userData.rad.os === os0 ? 0 : Math.PI };
                });
            }
            g.traverse((o) => {
                if (o.isMesh) {
                    let nabe = null;
                    let dreht = false;
                    for (let a = o.parent; a && __nabe0; a = a.parent) {
                        if (a.userData && a.userData.radDreht) dreht = true;
                        if (a.userData && a.userData.rad) {
                            nabe = a;
                            break;
                        }
                    }
                    if (nabe) {
                        if (nabe !== __nabe0) return; // dieselbe Gestalt — die Welt setzt sie als Instanz
                        const mr = __extractAssetMesh(o, isZweitKern, __nabeInv);
                        if (mr) {
                            mr.rad = { dreht: dreht, raeder: __raeder };
                            meshes.push(mr);
                        }
                        return;
                    }
                    const m = __extractAssetMesh(o, isZweitKern);
                    if (m) meshes.push(m);
                }
            });
            // DIE EINE PIPE: der Gelenk-Baum reist als Pseudo-Eintrag im selben
            // Reply (kein neuer Kanal; Leser ohne position-Guard überspringen ihn,
            // IDB trägt ihn gratis mit).
            if (g.userData && g.userData.__skelett) meshes.push({ kind: "__skelett", skelett: g.userData.__skelett });
            // Aufraeumen (kein Leak in der Foundry): Geometrien + Materialien der Wegwerf-Instanz.
            g.traverse((o) => {
                if (o.isMesh) {
                    if (o.geometry) o.geometry.dispose();
                }
            });
            // DAS BUDGET-GESETZ AM AUSGANG (Studio-Vertrag B2c, W8): jede Zweit-Kern-Gestalt verlaesst das Studio
            // auf ihrer Budget-Zeile (PORTAL_RENDER_CONFIG.lod.budget[kind][stufe] des EIGENEN Kerns) — die Stoffe
            // falten je Bindungs-Klasse auf `draws` (phyto-core `budgetErzwingen`; innerhalb der Zeile byte-gleich).
            // Ein Bruch (Zeile fehlt, Stufe ueber tris/draws) reist als `budgetBruch` mit und schreit hier; die Wand
            // (gate:asset-contract) baut jede Stufe und wird rot. Die Pflanzen tragen ihr Budget im Bau selbst.
            if (isZweitKern) {
                const PC = (typeof self !== "undefined" ? self : globalThis).__phytoCore;
                const pk = zweit.kern.PRESETS[msg.presetId];
                const bz = PC.budgetZeile(zweit.kern.PORTAL_RENDER_CONFIG, pk && pk.kind, lodBau);
                const res = PC.budgetErzwingen(meshes, bz && bz.zeile);
                meshes = res.meshes;
                budgetBericht = {
                    stufe: bz ? bz.stufe : null,
                    vorher: res.bericht.vorher,
                    nachher: res.bericht.nachher,
                    faltungen: res.bericht.faltungen.length,
                    // DER STEIN AUSSER DER ZEILE (E8.1, must-ignore): die Dreiecke, die die Zeile frei stellt (phyto-core
                    // `budgetFrei`, vor der Faltung gezählt) — nur wo die Zeile `ohneVerband` trägt (das Haus), sonst byte-alt
                    ...(res.bericht.frei > 0 ? { frei: res.bericht.frei } : {}),
                };
                if (res.bericht.bruch.length) {
                    budgetBruch = res.bericht.bruch;
                    console.error("[budget] " + msg.presetId + " L" + lodBau + ": " + JSON.stringify(budgetBruch));
                }
            }
            // DIE HÜLLEN REISEN MIT (Welle L + S3, additiv, must-ignore): ein Haus (fachwerk buildInstance) trägt seine
            // Kollisions-Liste (`__huelle`, jede Stufe die Solids der Stufe 0) und die Stufe 3 ihre Fernform (`__fern`) — je
            // ein Beipack-Eintrag neben den Meshes (das __skelett-Muster: kein neuer Kanal, die Platte trägt ihn gratis), der
            // Wirt hängt sie über seine EINE Beipack-Karte an (`FOUNDRY_BEIPACK`). Nach dem Budget-Ausgang: der Beipack ist
            // kein Teil. Andere Gestalten tragen die Felder nie. Der Baum trägt sein Maß (`__mass`, K20: der Hub des Schafts).
            for (const __bp of ["__huelle", "__fern", "__mass"])
                if (g && g.userData && g.userData[__bp] && typeof g.userData[__bp] === "object")
                    meshes.push({ kind: __bp, huelle: g.userData[__bp] });
            // DIE KRONE REIST MIT (D10, Beipack `__krone`, must-ignore): jeder Baum und Strauch trägt die Krone, die er
            // zeichnet — der Spiegel des Wassers liest sie (das Kronen-Buch des Wirts), nie eine Ableitung im Haupt-Faden.
            if (!isZweitKern && PRESETS[msg.presetId] && /^(tree|shrub)$/.test(PRESETS[msg.presetId].kind))
                meshes.push({ kind: "__krone", huelle: __kroneDerMeshes(meshes) });
            // die Stufe aus der gelieferten L0 (Beipack eingeschlossen: die Hülle jeder Stufe sind die Solids der L0), dann der
            // Ausgang IHRER Zeile; der Bericht trägt die Stufe, die L0 und die Ableitung (Bildpunkt, gesehen, Zonen, ms)
            if (ausL0) {
                const t0 = Date.now();
                const l0 = budgetBericht;
                const s = Number(msg.ausL0.s);
                const abl = __stufeAusL0(meshes, s, msg.ausL0.sicht);
                const res = PCk.budgetErzwingen(abl.teile, zeileK.zeile);
                meshes = res.meshes;
                let gesehen = 0;
                for (const S of msg.ausL0.sicht) if (S) for (let i = 0; i < S.length; i++) gesehen += S[i];
                budgetBericht = {
                    stufe: zeileK.stufe,
                    vorher: res.bericht.vorher,
                    nachher: res.bericht.nachher,
                    faltungen: res.bericht.faltungen.length,
                    ...(res.bericht.frei > 0 ? { frei: res.bericht.frei } : {}),
                    ausL0: { s, l0: l0 && l0.nachher ? l0.nachher.tris : null, gesehen, zonen: abl.zonen, kollaps: abl.kollaps, unterZelle: abl.unterZelle, steine: abl.steine, rahmen: abl.rahmen, ms: Date.now() - t0 },
                };
                if (res.bericht.bruch.length) {
                    budgetBruch = (budgetBruch || []).concat(res.bericht.bruch);
                    console.error("[budget] " + msg.presetId + " L" + (msg.lod | 0) + " aus der L0: " + JSON.stringify(res.bericht.bruch));
                }
            }
        } catch (e) {
            // DER BRUCH BEIM NAMEN (w28-leib-kanon): ein Guss, der wirft, antwortet mit seinem Grund (Art, Stufe, Satz) — nie mit
            // einer leeren Antwort, die der Besteller als „noch nicht" las und ewig neu stellte (ein Bewohner 10 109-mal)
            meshes = [];
            bruch = String(msg.presetId) + " L" + (msg.lod | 0) + ": " + String((e && e.message) || e).slice(0, 300);
            try {
                console.error("[foundry] build-asset GEBROCHEN " + bruch);
            } catch (_) {}
        }
        // KEINE Transferables: der strukturierte Klon kopiert die Float32/Uint32-Arrays
        // sauber. Transferables teilten/neutralisierten Puffer (geteilte ArrayBuffer der
        // interleaved Vorlagen-Attribute -> 2^N-Vertex-Korruption beim Empfaenger).
        if (typeof window === "undefined" || (window.parent && window.parent !== window)) {
            __post(
                {
                    type: "asset",
                    world: "terrain",
                    cv: 1, // Asset-Vertrag v1 (spec/asset-contract/v1) — jede asset-Antwort traegt die Vertrags-Version.
                    reqId,
                    presetId: msg.presetId,
                    seed: msg.seed,
                    lod: msg.lod | 0,
                    meshes,
                    // must-ignore: nur Zweit-Kern-Antworten tragen den Budget-Bericht (Pflanzen bleiben byte-alt),
                    // nur ein gebrochenes Budget den Bruch.
                    ...(budgetBericht ? { budget: budgetBericht } : {}),
                    ...(budgetBruch ? { budgetBruch } : {}),
                    ...(bruch ? { bruch } : {}),
                },
                "*"
            );
        }
    }
    // Die Kanäle als Tabelle (M8: Tabelle vor if) — dieselben Kommentare wie im alten Portal-Dispatch.
    const KANAL = {
        // DER ASSET-KANAL: AnazhRealm fragt einen fertigen Baum/Pflanze an, die
        // Vorlage laeuft ihr ECHTES buildInstance (Skelett+Rinde+Blaetter+Wurzeln, das
        // eigene LOD), und schickt die reine Geometrie (engine-neutrale Float32-Puffer)
        // als transferable zurueck. AnazhRealm pflanzt sie 1:1 — kein Nachbau, kein
        // Sezieren; die Vorlage-Datei IST der Samen (ein Edit hier -> andere Assets).
        "build-asset": __replyBuildAsset,
        // SYNERGIE-WELLE — DER EINE UMSCHLAG: das Studio exportiert sein KOMPLETTES Buch
        // (Rezepte + B4-Regler-Tabellen + Welt-Palette + Wahrnehmungs-Config) in EINEM
        // Reply. Die drei Einzel-Kanaele (get-recipes/get-world-params/get-render-config)
        // sind GEFALLEN (Abschied, kein Parallelpfad): EIN Roundtrip, EIN Reply-Zweig,
        // EIN Ingest-Chokepoint am Host (_foundryIngestBook). Ein Edit an PRESETS/
        // PORTAL_GROUND/PORTAL_RENDER_CONFIG hier fliesst automatisch mit; die Geometrie-
        // Erzeugung bleibt im Studio (build-asset — der on-demand-Kanal).
        "get-book": __replyBook,
        // DER SETTLEMENT-KANAL (N5.7, W-A5b): der Host fragt eine Siedlung als reine
        // DATEN an (Slots + benannte Schichten). GENERISCH wie exportDrive (N6.2):
        // der ERSTE Manifest-Kern mit einer exportSettlement-Formel antwortet — kein
        // Kern-spezifisches Literal (M8: Tabelle vor if). Fail-soft: kein Kern/Fehler
        // -> plan null, der Host behandelt das geschlossen.
        "export-settlement": __replySettlement,
        // DER SLOT-PLAN-KANAL (bauen.K2): das gesetzte Haus als Slot seines Plans, vor seinem Bau (`_hausGrundSetzen`)
        "slot-plan": __replySlotPlan,
        // DER BLATT-ATLAS-KANAL (S7): das Bild des EINEN Blatt-Atlas (die Schale des Buch-Fadens fragt ihn)
        "blatt-atlas": __replyBlattAtlas,
    };
    return (msg) => {
        if (!msg || typeof msg !== "object" || !Object.prototype.hasOwnProperty.call(KANAL, msg.type)) return false;
        KANAL[msg.type](msg);
        return true;
    };
})();
// DER WORKER-START: der Foundry-Worker (self.__PHYTO_FOUNDRY_WORKER=true vor importScripts; eine Blob-URL trägt kein
// ?search) lädt diese Datei als letzte — der Foundry-Modus, der Kanal-Hörer (die Transport-Schale `_foundrySchale`
// ruft ihn nach ihrem eigenen), dann ready. Im Labor-Fenster tut diese Datei beim Laden nichts. DAS BUCH REIST MIT DER
// GEBURT (B3a): der Faden, den der Wirt „buch" nennt (`_ensureAssetFoundry`), antwortet es sofort — ohne Frage, denn eine
// Nachricht vor dem Ende dieses Skripts reicht Chrome erst weiter, wenn der Haupt-Faden „Skript gelaufen" gelesen hat.
if (typeof window === "undefined" && typeof self !== "undefined" && self.__PHYTO_FOUNDRY_WORKER === true) {
    foundryModus();
    self.onmessage = (event) => foundryKanal(event && event.data);
    foundryPost({ type: "ready", world: "terrain" });
    if (self.name === "buch") foundryKanal({ type: "get-book", reqId: "book" });
}
