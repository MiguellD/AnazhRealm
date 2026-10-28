// AnazhRealm — foundry-bruecke.js: DIE FOUNDRY-BRÜCKE (Karte K42, synthese §0 Bruch 3 / §4 W2a).
// Der Bau-Teil der Pflanzen-Shell als EIN Modul: die Wirts-Globalen, die foundry-core liest und schreibt (PRNG,
// Vektor-Helfer, Simplex, Stoffe, Saison-Tint, Regler-Kontext, LOD-Band), der Studio-Bäcker `bakeImpostorAtlas` (nur das
// Labor zeichnet ihn — die Welt backt ihre Karte seit S2 im Welt-Renderer, `_karteWeltBacken`) und die Asset-Kanäle
// (build-asset · get-book · export-settlement). Klassisches Script
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
/* ---------- Wirts-Handles, die der Kern und der Bäcker lesen (der Rest der Szene lebt im Labor) ---------- */
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

/* ---------- DER STUDIO-BÄCKER: die Fernstufe (8-Winkel-Karte + Normal-Atlas) — Labor-Wald UND Welt-Karte ---------- */
let _impAtlas = null,
    _impK = 0,
    _impGeo = null,
    _impRT = null,
    _impNrmRT = null,
    _impNrm = null,
    _impNrmOv = null,
    _impDilMat = null,
    _impDilRT = null,
    _impDilScene = null,
    _impDilCam = null,
    _impBakedSig = "",
    _impT = 0,
    _impMat = null,
    _impSpecs = [],
    _impCellOf = {},
    _impWR = {},
    _impFrame = {}; // W6: der Bake-Rahmen je (Art, Same) — das Payload der Welt-Karte trägt ihn (kein dritter L1-Bau)
const _impV = (PORTAL_RENDER_CONFIG.impostor && PORTAL_RENDER_CONFIG.impostor.views) || 8, // Bäcker-Spec aus der EINEN Quelle (foundry-core, Studio-Vertrag B2)
    _impYAxis = new THREE.Vector3(0, 1, 0); // 8 Blickwinkel je Baum im Atlas (Zeilen); _impNrm = Normal-Atlas; Atlas ist SAISONINVARIANT (einmal je Seed-Signatur); _impWR = Zell-Seitenverhaeltnis je Art (FIX v28)
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
function bakeImpostorAtlas() {
    const _impSpec = PORTAL_RENDER_CONFIG.impostor || {};
    const K = Math.max(1, _impSpecs.length),
        V = _impV,
        cw = _impSpec.cellW || 128,
        ch = _impSpec.cellH || 256; // Spalten = (Art,Variante), Zeilen = 8 Blickwinkel um Y -> die Silhouette DREHT mit der Kamera (SpeedTree-Multi-View); Zell-Maße aus der EINEN Quelle (foundry-core)
    const sig = _impSpecs.map((s) => s.sp + s.seed).join(","); // Signatur der Baubeschreibungen: neue Seeds (Rebuild) -> Atlas MUSS neu, sonst zeigt die Ferne alte Baeume
    if (_impRT && _impK === K && _impBakedSig === sig) return; // EINMAL-BAKE: der Atlas ist SAISONINVARIANT (volle Krone gebacken; Praesenz+Tint macht der Shader) -> nach diesem Bake nie wieder, deterministischer Zyklus kostenlos
    if (!_impRT || _impK !== K) {
        if (_impRT) _impRT.dispose();
        if (_impNrmRT) _impNrmRT.dispose();
        _impRT = new THREE.WebGLRenderTarget(cw * K, ch * V, {
            minFilter: THREE.LinearMipmapLinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            generateMipmaps: true,
        });
        _impAtlas = _impRT.texture;
        _impNrmRT = new THREE.WebGLRenderTarget(cw * K, ch * V, {
            minFilter: THREE.LinearMipmapLinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            generateMipmaps: true,
        });
        _impNrm = _impNrmRT.texture;
        const _an =
            renderer.capabilities && renderer.capabilities.getMaxAnisotropy
                ? renderer.capabilities.getMaxAnisotropy()
                : 1;
        _impAtlas.anisotropy = Math.min(8, _an);
        _impNrm.anisotropy = Math.min(8, _an); // flache Blickwinkel auf ferne Karten bleiben scharf (Einzeiler-Gewinn)   // NORMAL-ATLAS: gleiche Zellen, Normale in Zell-Raum (rechts,oben,zurKamera) -> per-Fragment-Licht in der Ferne
        _impK = K;
        if (_impMat) {
            _impMat.uniforms.uK.value = K;
            _impMat.uniforms.map.value = _impAtlas;
            _impMat.uniforms.nmap.value = _impNrm;
        }
    }
    if (!_impNrmOv) {
        _impNrmOv = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide }); // Override fuer den Normal-Pass (r128: packNormalToRGB(view-space n) -- an der three-Quelle verifiziert)
        // DIE NORMALE DER KRONE FLIP-FREI (K68-N1): die Karte backt, was der Stoff der Welt lichtet — die Normale der Krone ohne
        // Seite (foundry-core injectWind `krone`, Welt `_laubStoffNormale`); die doppelseitige Rueckseite kehrte sie nach innen.
        // Die Rinde ist geschlossen (ihre Rueckseite liegt hinter der Tiefe).
        _impNrmOv.onBeforeCompile = (sh) => {
            sh.fragmentShader = sh.fragmentShader.replace(
                "#include <normal_fragment_begin>",
                "#include <normal_fragment_begin>\n#ifndef FLAT_SHADED\n normal = normalize( vNormal );\n#endif"
            );
        };
        _impNrmOv.customProgramCacheKey = () => "impNrm_kroneFlipfrei";
    }
    const bs = new THREE.Scene();
    const hl = new THREE.HemisphereLight(0xffffff, 0x8a8a8a, 1.05);
    bs.add(hl); // FLACH backen (neutral, richtungslos): der Atlas ist Albedo -- die LICHTRICHTUNG kommt zur Laufzeit aus _wSunPos, sonst waere die Bake-Richtung fuer immer eingefroren
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 500);
    const pRT = renderer.getRenderTarget(),
        pA = renderer.getClearAlpha(),
        pT = WIND.uTime.value,
        pPres = SEASON.uLeafPresence.value;
    WIND.uTime.value = 0;
    SEASON.uLeafPresence.value = 1.0; // ruhiger, aufrechter Bake mit VOLLER Krone (egal welche Saison gerade laeuft) -> fette Alpha, mip-stabil
    renderer.setRenderTarget(_impNrmRT);
    renderer.setClearColor(0x8080ff, 1);
    renderer.clear(); // Normal-Atlas komplett auf neutral
    renderer.setRenderTarget(_impRT);
    renderer.setClearColor(0x2f4a22, 0);
    renderer.clear(); // Clear = Laubgruen(alpha 0): Mip-Blending blutet Blattfarbe statt Schwarz. Zellen-Clipping laeuft ueber RT-eigene viewport/scissor-Props (r128 wendet sie beim Bind an; renderer.setViewport waere pixelRatio-skaliert und wuerde von setRenderTarget zurueckgesetzt -- UND autoClear wuerde ohne RT-scissorTest bei JEDEM View den GANZEN Atlas loeschen)
    for (let i = 0; i < K; i++) {
        const s = _impSpecs[i];
        let tree;
        try {
            /* M2 (Bäcker-Vereinigung): trägt der Spec ein explizites ov (Welt-Anfrage über den
               bake-impostor-Kanal), bäckt GENAU dieses — Karte==Welt-Baum (ov-frei = Preset-
               Defaults). Der Studio-Wald-Pfad (specs mit crownBase) bleibt byte-identisch.
               ZWEIT-KERN-BÄCKEREI (M1-Folgeschritt): trägt der Spec einen eigenen Bauer (`bau` —
               das buildInstance eines Manifest-Kerns; bis S2 setzte ihn die Welt-Karte), baut DER das
               Bake-Subjekt mit seinen kompletten Materialien; ohne `bau` läuft der Pflanzen-Pfad
               unverändert (der Studio-Wald setzt nie `bau`). */
            tree = (typeof s.bau === "function" ? s.bau : buildInstance)(
                s.sp,
                s.seed,
                1,
                s.ov !== undefined ? s.ov : { crownBase: s.crownBase }
            );
            if (!tree) continue; // fail-soft: ein Kern-Bauer darf null liefern (unbekanntes Rezept) — Zelle bleibt leer statt Wurf mit halb-gebundenem Renderer-State
        } catch (e) {
            continue;
        }
        const box = new THREE.Box3().setFromObject(tree);
        /* FIX v36: ANKER = STAMMACHSE, NICHT Boxmitte. Der Laufzeit-Anker des Billboards ist die Instanzposition
       (Stammbasis, lokales (0,0)). Die alte Box-Rezentrierung hing den Stamm konstant um (cxb,czb) neben die
       Bildmitte — auf dem kamerafolgenden Quad wird ein konstanter BILDversatz zum ORBITIERENDEN Weltversatz:
       beim Umrunden kreist der Karten-Stamm um den Anker und springt an der L1<->L2-Blende seitlich gegen den
       3D-Stamm. (Der alte Kommentar behauptete Achsen-Zentrierung — die Mathematik lieferte Boxmitte.) */
        bs.add(tree);
        /* „Drähte statt Kopien" (08.07., wie P6 beim Wuchs): Rahmen-Formel + Radial-Scan leben
       EINMAL in phyto-core (__phytoCore.impostorFrame/scanRadialXZ — dieselben liest AnazhRealms
       Foundry-Bäcker; byte-gleich zur alten Inline-Form: halfH = max(0.5,maxY)·1.02·0.5,
       halfW = max(halfH·(cw/ch=0.5), radial·1.04) — FIX v36/v28 unverändert: exakter
       Radialabstand, rotationsinvariant, kein Seiten-Clip, per-Art-Rahmen). */
        let _rad2 = 0;
        tree.traverse((o) => {
            if (o.isMesh && o.geometry && o.geometry.attributes.position) {
                _rad2 = __phytoCore.scanRadialXZ(o.geometry.attributes.position.array, _rad2);
            }
        });
        const _frame = __phytoCore.impostorFrame(box.max.y, Math.sqrt(_rad2)),
            halfH = _frame.halfH,
            halfW = _frame.halfW;
        _impWR[s.sp + s.seed] = halfW / halfH; // Seitenverhaeltnis persistent (Objekt ueberlebt den Einmal-Bake-Fruehausstieg bei unveraenderter Signatur) -> Quad-Breite zieht in buildForest mit, Textur bleibt unverzerrt
        _impFrame[s.sp + s.seed] = _frame; // W6: derselbe Rahmen reist im Welt-Payload (Quad = Bake-Kamera, keine Wurzel-Höhe)
        cam.left = -halfW;
        cam.right = halfW;
        cam.top = halfH;
        cam.bottom = -halfH;
        cam.position.set(0, halfH, Math.max(halfW * 2.5, box.max.y) + 40);
        cam.lookAt(0, halfH, 0);
        cam.updateProjectionMatrix();
        for (let v = 0; v < V; v++) {
            tree.rotation.y = -v * ((Math.PI * 2) / V);
            tree.updateMatrixWorld(true); // Ansicht v = Baum aus Peilung v*45 Grad gesehen (Kamera fix, Baum gegenrotiert)
            _impRT.viewport.set(i * cw, v * ch, cw, ch);
            _impRT.scissor.set(i * cw, v * ch, cw, ch);
            _impRT.scissorTest = true; // Zelle als RT-Property: Bind wendet sie an, autoClear loescht NUR diese Zelle (nicht den Atlas), keine pixelRatio-Skalierung
            renderer.setRenderTarget(_impRT);
            renderer.setClearColor(0x2f4a22, 0);
            renderer.render(bs, cam);
            bs.overrideMaterial = _impNrmOv;
            _impNrmRT.viewport.set(i * cw, v * ch, cw, ch);
            _impNrmRT.scissor.set(i * cw, v * ch, cw, ch);
            _impNrmRT.scissorTest = true;
            renderer.setRenderTarget(_impNrmRT);
            renderer.setClearColor(0x8080ff, 1); // Hintergrund-Normale = zur Kamera (neutral)
            renderer.render(bs, cam);
            bs.overrideMaterial = null;
        }
        bs.remove(tree);
        tree.traverse((o) => {
            if (o.isMesh && o.geometry.dispose) o.geometry.dispose();
        });
    }
    _impRT.viewport.set(0, 0, cw * K, ch * V);
    _impRT.scissor.set(0, 0, cw * K, ch * V);
    _impRT.scissorTest = false; // RT-Props zurueck auf voll: naechster Bind (Re-Bake-Clear, Debug-Reads) sieht den ganzen Atlas
    _impNrmRT.viewport.set(0, 0, cw * K, ch * V);
    _impNrmRT.scissor.set(0, 0, cw * K, ch * V);
    _impNrmRT.scissorTest = false;
    /* DILATION (2px): Kronenfarbe in transparente Randtexel fluten, Alpha bleibt 0 -> Mips mischen Blattfarbe statt Clear-Gruen (kein dunkler Halo an fernen Karten). Zellgrenzen sicher: Rahmenraender sind leer. */
    if (!_impDilMat) {
        _impDilMat = new THREE.ShaderMaterial({
            uniforms: { tSrc: { value: null }, uTexel: { value: new THREE.Vector2(1, 1) } },
            vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}",
            fragmentShader:
                "uniform sampler2D tSrc;uniform vec2 uTexel;varying vec2 vUv;void main(){vec4 c=texture2D(tSrc,vUv);if(c.a>0.05){gl_FragColor=c;return;}float ba=0.0;vec3 bc=c.rgb;for(int dy=-1;dy<=1;dy++)for(int dx=-1;dx<=1;dx++){if(dx==0&&dy==0)continue;vec4 n=texture2D(tSrc,vUv+vec2(float(dx),float(dy))*uTexel);if(n.a>ba){ba=n.a;bc=n.rgb;}}gl_FragColor=vec4(ba>0.05?bc:c.rgb,0.0);}",
            depthTest: false,
            depthWrite: false,
        });
        _impDilScene = new THREE.Scene();
        const _fq = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), _impDilMat);
        _fq.frustumCulled = false;
        _impDilScene.add(_fq);
        _impDilCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    }
    if (!_impDilRT || _impDilRT.width !== cw * K || _impDilRT.height !== ch * V) {
        if (_impDilRT) _impDilRT.dispose();
        _impDilRT = new THREE.WebGLRenderTarget(cw * K, ch * V, { format: THREE.RGBAFormat });
    }
    _impDilMat.uniforms.uTexel.value.set(1 / (cw * K), 1 / (ch * V));
    const _pAC = renderer.autoClear;
    renderer.autoClear = false;
    _impDilMat.uniforms.tSrc.value = _impRT.texture;
    renderer.setRenderTarget(_impDilRT);
    renderer.render(_impDilScene, _impDilCam);
    _impDilMat.uniforms.tSrc.value = _impDilRT.texture;
    renderer.setRenderTarget(_impRT);
    renderer.render(_impDilScene, _impDilCam);
    renderer.autoClear = _pAC;
    renderer.setScissorTest(false);
    renderer.setRenderTarget(pRT);
    // Der Fenster-Pfad (Studio/iframe) liest die echten Fenstermasse; ohne Fenster 256x256.
    renderer.setViewport(
        0,
        0,
        typeof innerWidth !== "undefined" ? innerWidth : 256,
        typeof innerHeight !== "undefined" ? innerHeight : 256
    );
    renderer.setClearColor(0x000000, pA);
    WIND.uTime.value = pT;
    SEASON.uLeafPresence.value = pPres;
    _impBakedSig = sig;
}

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
    function __zweitKerne() {
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
            // Der Bäcker-Spec (Studio-Vertrag B2): Blickwinkel + Zell-Maße des Impostor-Atlas —
            // AnazhRealms RTT-Bäcker liest DIESELBEN Zahlen wie bakeImpostorAtlas hier.
            impostor: c.impostor
                ? { views: c.impostor.views, cellW: c.impostor.cellW, cellH: c.impostor.cellH }
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
        try {
            for (const id in PRESETS) {
                if (!Object.prototype.hasOwnProperty.call(PRESETS, id)) continue;
                const p = PRESETS[id];
                if (!p || typeof p !== "object") continue;
                // Reine Daten (JSON-klonbar): kind/panel + die Regler `s` + die Material/Form `fx` + die Phänotyp-Zeile
                // `ph` der Art (K24: Rinde, Laub, Nadel und Krone eines Baums sind phyto-core artPhaenotyp(s, Art)).
                book[id] = { kind: p.kind, panel: p.panel, s: Object.assign({}, p.s), fx: Object.assign({}, p.fx) };
                if (p.ph) book[id].ph = Object.assign({}, p.ph);
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
                    if (!Object.prototype.hasOwnProperty.call(P, id) || book[id]) continue;
                    const p = P[id];
                    if (!p || typeof p !== "object") continue;
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
        return { book, paramsByKind, kindPolicy };
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
                    worldParams: __worldParamsPayload(),
                    renderConfig: __renderConfigPayload(),
                    // SPIEGEL-ZENSUS 17.07. — das Siedlungs-Existenz-Gesetz
                    // (fachwerk SIEDLUNG) reist additiv mit; ein Alt-Empfaenger
                    // ohne den Steckplatz ignoriert das Feld (must-ignore).
                    siedlung: __zweitKernSiedlung(),
                },
                "*"
            );
            // DER EINE BLATT-ATLAS reist als Bild (S7) NACH dem Buch (B3a): der Worker malt ihn (OffscreenCanvas) samt
            // Mip-Kette, die Transport-Schale macht ihn zur Fracht und gibt die Puffer per Transfer weiter — der Haupt-Thread
            // malt und mippt nie. Bis B3a war er die Vorbedingung des ganzen Buchs (Radeon kalt 1,81 s Malen + 0,98 s Fracht
            // vor jedem Auftrag); jetzt bestellt die Welt, während er entsteht, und nur ein Körper, der ihn liest, wartet.
            if (typeof window === "undefined")
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
    function __replyBuildAsset(msg) {
        const reqId = msg.reqId;
        let meshes = [];
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
            // W-A1 (Katalysator §5) — DER REGLER-KANAL: msg.ov (B4-Overrides der Werkstatt)
            // reist in BEIDE Zweige (buildInstance nimmt ov als 4. Argument — der Pflanzen-
            // Pfad traegt Object.assign(P, ov) seit je, die Bruecke reichte nur null).
            // ERFINDER-WELLE („blume z.B. keine regler?"): jetzt sind auch die Pflanzen
            // regelbar; OHNE ov ist der Bau byte-identisch (gate:asset-contract Goldens
            // laufen ov-frei — der Welt-Pfad bleibt byte-vertraglich rein, W-A1-Gesetz:
            // ov umgeht IDB + f.cache am Host).
            const g = isZweitKern
                ? zweitBaecker
                    ? zweitBaecker(zweit.kern, msg.presetId, Number(msg.seed) || 0, msg.lod | 0, msg.ov || null)
                    : zweit.kern.buildInstance(msg.presetId, Number(msg.seed) || 0, msg.lod | 0, msg.ov || null)
                : buildInstance(msg.presetId || "eiche", Number(msg.seed) || 0, msg.lod | 0, msg.ov || null);
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
                const bz = PC.budgetZeile(zweit.kern.PORTAL_RENDER_CONFIG, pk && pk.kind, msg.lod | 0);
                const res = PC.budgetErzwingen(meshes, bz && bz.zeile);
                meshes = res.meshes;
                budgetBericht = {
                    stufe: bz ? bz.stufe : null,
                    vorher: res.bericht.vorher,
                    nachher: res.bericht.nachher,
                    faltungen: res.bericht.faltungen.length,
                };
                if (res.bericht.bruch.length) {
                    budgetBruch = res.bericht.bruch;
                    console.error("[budget] " + msg.presetId + " L" + (msg.lod | 0) + ": " + JSON.stringify(budgetBruch));
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
        } catch (e) {
            meshes = [];
            try {
                console.warn("[phyto] build-asset", msg.presetId, e && e.message);
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
