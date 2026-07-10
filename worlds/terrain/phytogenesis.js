// PHYTOGENESIS & LITHOS — die Terrain-Portal-Welt (dritte Gestalt, 03.07.2026).
// Das Morphologie-Labor des Schöpfers (phytogenesis v38): Bäume, Sträucher,
// Blumen, Gras und Felsen wachsen aus GESETZEN (da Vinci Δ, McMahon-Knick,
// Phyllotaxis, Zingg/Wadell) — mit begehbarem Wald (PointerLock + WASD),
// Tag/Nacht, Wetter und Jahreszeiten. Läuft auf vendored Three.js r128
// (lib/, klassische Global-Skripte — die iframe-CSP erlaubt nur self).
// Die Portal-IDENTITÄT bleibt "terrain" (Name ist load-bearing: Katalog,
// welt_terrain-Bauplan, gespeicherte Welten) — nur die GESTALT ist neu
// (die V18.259-Lehre: stabile Identität, variable Gestalt).
// Die AnazhRealm-Portal-Brücke (W12-Protokoll) sitzt am Datei-Ende.

/* ============================================================================
   PHYTOGENESIS & LITHOS — Morphologie aus Gesetzen
   Spiegelt die Methode des Tetrapoda-Labors: wenige bedeutungsvolle Achsen,
   jede an ein echtes Gesetz gekoppelt, entfalten sich zu Artenvielfalt.
   Geometrie wird ABGELEITET (nicht gemalt). Wind = Euler-Bernoulli Eigenfreq.
   ========================================================================== */

/* ---------- Konstanten & deterministischer PRNG (Saat -> Individuum) ------- */
const PHI = (1 + Math.sqrt(5)) / 2;
const GOLDEN = Math.PI * (3 - Math.sqrt(5)); // 137.50776 deg Phyllotaxis
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

/* ---------- Geteilte Uniforms: Wind (Eigenfreq) + Saison (Phaenologie) ----- */
// uSeasonMul: aktueller Saison-Tint / Bau-Tint -> Laubfarbe drivet KONTINUIERLICH, ohne Rebuild
const _seasonBuiltTint = new THREE.Color(0x4f7a30); // Tint, mit dem die Geometrie zuletzt gebacken wurde (Referenz fuer das Verhaeltnis)
// DIE BODEN-PALETTE — EINE Quelle fuer die Terrain-Farbgebung UND den world-params-Export (die
// Foundry reicht sie an AnazhRealm, dessen Boden/Fels-Farben sie live lesen). Editiert der Schoepfer
// hier eine Farbe, folgt der AnazhRealm-Boden beim naechsten Laden — kein hartkodiertes Abbild mehr.
// DER MITTAGS-ATMOSPHAERE-ANKER — EINE Quelle fuer den Himmel-Shader (uTop) UND den world-params-
// Export. AnazhRealm bindet seinen Mittags-Tag/Nacht-Stop hieran (additiv; der Zyklus bleibt seiner).
// DIE WAHRNEHMUNGS-QUELLE — EINE Quelle fuer die Sichtweite, die LOD-Distanzen/Fades, die Wald-Dichte
// und den Understory-Raster. Das Studio LIEST sie (die Konstanten unten binden hieran), UND der Foundry-
// Kanal EXPORTIERT sie (`get-render-config`) an AnazhRealm — editiert der Schoepfer HIER eine Zahl, folgt
// beim naechsten Laden BEIDES: der Studio-Wald UND die AnazhRealm-WebGPU-Welt (dieselbe Sichtweite, dasselbe
// nahe LOD, dieselben Distanzen/Fades, dieselbe Wiese/Blumen/Buesche im selben aktiven Radius). Kein
// Shader-/Geometrie-Transfer (r128-GLSL != WebGPU) — die WERTE fliessen, der Renderer bleibt AnazhRealms.
// Zwei-Pass-Laub: geteilte Uniforms fuer den Tiefen-Test (Laub gegen die Struktur-Tiefe verdecken)
const _dummyTex = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, THREE.RGBAFormat);
_dummyTex.needsUpdate = true;
const _dummyVol = new THREE.DataTexture3D(new Float32Array([1]), 1, 1, 1);
_dummyVol.format = THREE.RedFormat;
_dummyVol.type = THREE.FloatType;
_dummyVol.needsUpdate = true;
const _folDepthU = {
    uStructDepth: { value: _dummyTex },
    uHalfRes: { value: new THREE.Vector2(1, 1) },
    uFolEnable: { value: 0.0 },
};
// ZWEI-PASS-LAUB: Struktur (Stamm/Boden/Fels/Wasser) voll aufgeloest & scharf; Laub (Blaetter/Gras) halb aufgeloest & weich, tiefenkorrekt darueber compositet.
class FoliagePass extends THREE.Pass {
    constructor() {
        super();
        this.needsSwap = false;
        this._w = 0;
        this._h = 0;
        const opt = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };
        this.rtS = new THREE.WebGLRenderTarget(2, 2, opt);
        this.rtS.depthTexture = new THREE.DepthTexture(2, 2);
        this.rtS.depthTexture.type = THREE.UnsignedShortType;
        this.rtF = new THREE.WebGLRenderTarget(2, 2, opt);
        this.comp = new THREE.ShaderMaterial({
            depthTest: false,
            depthWrite: false,
            uniforms: { uStruct: { value: null }, uFol: { value: null }, uDbg: { value: 0 } },
            vertexShader:
                "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
            fragmentShader:
                "varying vec2 vUv;uniform sampler2D uStruct,uFol;uniform float uDbg;void main(){vec4 s=texture2D(uStruct,vUv);vec4 f=texture2D(uFol,vUv);\n if(uDbg>1.5){gl_FragColor=vec4(f.rgb,1.0);return;}            // NUR LAUB (Krone+Gras, mit Schatten)\n if(uDbg>0.5){gl_FragColor=vec4(s.rgb,1.0);return;}             // NUR STRUKTUR (Boden+Staemme+gebackener Schatten, KEIN Laub) -> zeigt ob der Boden den Baumschatten traegt\n gl_FragColor=vec4(mix(s.rgb,f.rgb,clamp(f.a,0.0,1.0)),1.0);}",
        });
        this.fsq = new THREE.FullScreenQuad(this.comp);
    }
    setSize(w, h) {
        w = Math.max(2, w | 0);
        h = Math.max(2, h | 0);
        if (w === this._w && h === this._h) return;
        this._w = w;
        this._h = h;
        this.rtS.setSize(w, h);
        this.rtS.depthTexture.image.width = w;
        this.rtS.depthTexture.image.height = h;
        this.rtS.depthTexture.needsUpdate = true;
        this.rtF.setSize(Math.max(1, Math.round(w * _folRes)), Math.max(1, Math.round(h * _folRes)));
    }
    resizeFol() {
        if (this._w)
            this.rtF.setSize(Math.max(1, Math.round(this._w * _folRes)), Math.max(1, Math.round(this._h * _folRes)));
    }
    render(renderer, writeBuffer, readBuffer) {
        if (this._w === 0) this.setSize(renderer.domElement.width, renderer.domElement.height);
        const sc = scene,
            cam = camera,
            bg = sc.background,
            pa = renderer.getClearAlpha(),
            pac = renderer.autoClear,
            gl = renderer.getContext();
        try {
            renderer.autoClear = true;
            cam.layers.set(0);
            renderer.setRenderTarget(this.rtS);
            renderer.render(sc, cam); // 1) STRUKTUR voll aufgeloest + Himmel + Tiefe
            sc.background = null;
            renderer.autoClear = false;
            renderer.setClearAlpha(0);
            renderer.setRenderTarget(this.rtF);
            renderer.clear(true, true, true); // rtF: Farbe transparent + Tiefe leeren
            gl.colorMask(false, false, false, false);
            cam.layers.set(0);
            renderer.render(sc, cam); // 2a) STRUKTUR nur in den Tiefenpuffer (echte Hardware-Verdeckung)
            gl.colorMask(true, true, true, true);
            cam.layers.set(1);
            renderer.render(sc, cam); // 2b) LAUB, tiefengetestet gegen die Struktur -> hinter Staemmen verdeckt
        } finally {
            // IMMER zuruecksetzen: ein Wurf in irgendeinem Sub-Render darf colorMask NIE auf false haengen lassen (=> schwarzer Schirm in allen Folgeframes)
            gl.colorMask(true, true, true, true);
            sc.background = bg;
            renderer.setClearAlpha(pa);
            renderer.autoClear = pac;
            cam.layers.set(0);
        }
        this.comp.uniforms.uStruct.value = this.rtS.texture;
        this.comp.uniforms.uFol.value = this.rtF.texture;
        this.comp.uniforms.uDbg.value = window._dbgView || 0;
        renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);
        this.fsq.render(renderer); // 3) COMPOSITE: Laub weich hochskaliert ueber scharfe Struktur
    }
}
let windTarget = 0.05,
    presenceTarget = 1,
    bloomTarget = 1;
let rockLichen = 0.6;
let seasonTint = new THREE.Color(0x4f7a30),
    seasonAccent = new THREE.Color(0x6f9a3a);

/* ---------- Wind-Injektion in Material-Shader (begin_vertex Hook) ---------- */

/* ---------- Canvas-Fabrik: DOM (Studio/iframe) ODER OffscreenCanvas (Worker) ---- */
/* ---------- Prozedurale Rinden-Normalmap (vertikale Riefen + Risse) -------- */

let barkNormalTex = null,
    barkMat,
    barkMatBirch,
    foliageMat,
    foliageMatTex,
    grassMat,
    stemMat,
    _terMat = null,
    _envMats = [];
let _leafAtlas = null; // FIX v31: foliageMatTex = Multi-Blatt-Texturkarten (L1); _leafAtlas = zur Laufzeit GEMALTER Cluster-Atlas (Canvas-2D, deterministisch, kein GL-Risiko)
/* ---------- Globale Szene-Handles ----------------------------------------- */
let scene,
    camera,
    renderer,
    composer,
    fxaa,
    cinePass,
    bloomPass,
    controls,
    clock,
    subject,
    contactShadow,
    groundMesh,
    keyLight,
    hemiL,
    rimL,
    fillL,
    backL,
    renderPassMain,
    _foliagePass,
    volPass,
    _skyDome,
    _rain;
const _invVP = new THREE.Matrix4();
let showcase = false;
let __lod = 0;
let __rockKind = "boulder";
let framedOnce = false;

/* ---------- Merge-Helfer: viele Geometrien -> 1 Draw Call ----------------- */

/* ---------- getapertes Segment in WELT-Koordinaten ------------------------
   Alle windbewegten Geometrien leben im Weltframe (Objektmatrix = Identitaet),
   damit Wind in Weltrichtung wirkt und Blaetter ihren Asttipps exakt folgen.  */

/* ---------- Superformel (Gielis): EIN Gesetz, riesige Blatt-Morphologie ----
   r(phi) = ( |cos(m phi/4)/a|^n2 + |sin(m phi/4)/b|^n3 )^(-1/n1)             */
/* ---------- Blatt / Bluetenblatt als gefaechertes Kaertchen (Weltframe) ---- */
/* ---------- Nadel (Konifere): duenner Kegel ------------------------------- */
/* ---------- FIX v31: MULTI-BLATT-KARTEN (der Profi-Multiplikator) ----------
   bakeLeafAtlas: malt EINMAL 4 Blatt-Cluster (je ~6 Blaetter) per Canvas-2D in
   einen Alpha-Atlas. Map traegt nur WERT/Schattierung — die Artfarbe liefert
   wie ueberall vertexColors. Lokaler PRNG: verbraucht KEIN Wald-RNG (Saat-
   Determinismus unangetastet). pushLeafClusterQuad: 1 Quad = 2 Dreiecke mit
   vollem Wind-Attributsatz (aWind/aCenter/aType) — pendelt, kollabiert im
   Winter, faerbt sich im Herbst, exakt wie geometrische Blaetter.            */
/* ========================================================================== *
   BAUM-MASCHINE — rekursive Veraestelung aus Gesetzen
   da Vinci (Delta) · Apikaldominanz · Gravitropismus · Phyllotaxis (137.5)
 * ========================================================================== */

/* ========================================================================== *
   BLUME — Vogel-Spirale (Korb) + Fibonacci-Blueten (Superformel)
 * ========================================================================== */

/* ========================================================================== *
   GRASBUESCHEL — Halme als Euler-Kragtraeger (Biegung unter Eigengewicht)
 * ========================================================================== */
/* ========================================================================== *
   FELS — fBm-Verwitterung · Zingg-Form · Wadell-Rundung · Schichtung
 * ========================================================================== */
// REGNUM LITHOS v2 — Relief in der Geometrie, Kurvatur-AO gebacken, echte Stratigraphie
/* ========================================================================== *
   ARTEN-KATALOG — Presets als Punkte im Morphospace (Tupel + Bauer)
 * ========================================================================== */
let CURRENT = "eiche",
    SEED = 12345;

/* ---------- Slider -> abgeleitete Struktur-Parameter ---------------------- */
function gv(id) {
    return parseFloat(document.getElementById(id).value);
}
let __dials =
    null; /* Dial-Kontext: gesetzt = kanonische Preset-Regler (Wald/Templates/Atlas, DOM-frei & deterministisch); null = Studio liest live die Slider */

/* ---------- Saison (Phaenologie) ------------------------------------------ */
let curSeason = "summer";

/* ---------- Aufbau / Sitz / Rahmung / Abbau ------------------------------- */
function disposeSubject() {
    if (!subject) return;
    const shared = [barkMat, barkMatBirch, foliageMat, grassMat, stemMat];
    subject.traverse((o) => {
        if (o.isMesh) {
            o.geometry.dispose();
            if (o.material && shared.indexOf(o.material) < 0) o.material.dispose();
        }
    });
    scene.remove(subject);
}
function seatAndFrame() {
    subject.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(subject);
    const minYbefore = box.min.y;
    const isBoulder = PRESETS[CURRENT].panel === "rock" && __rockKind === "boulder";
    if (isBoulder)
        subject.position.y -= box.min.y; // GEMESSEN: Findling exakt auf y=0 (Poke-Through)
    else if (box.min.y > 0.002) subject.position.y -= box.min.y; // schwebende abfangen; Wuchs-Basis bleibt am Boden
    subject.updateMatrixWorld(true);
    const box2 = new THREE.Box3().setFromObject(subject);
    const floorY = isBoulder ? box2.min.y : 0; // Wurzeln unter Grund nicht mitrahmen
    const c = new THREE.Vector3(
        (box2.min.x + box2.max.x) / 2,
        (floorY + box2.max.y) / 2,
        (box2.min.z + box2.max.z) / 2
    );
    const sz = new THREE.Vector3(box2.max.x - box2.min.x, box2.max.y - floorY, box2.max.z - box2.min.z);
    const maxDim = Math.max(sz.x, sz.y, sz.z);
    const baseFoot = Math.max(sz.x, sz.z);
    const gs = clamp(baseFoot * 0.62, 1.6, 8),
        gsH = clamp(gs * 0.42, 1, 2.6); // kleiner Spawnraum, proportional
    if (groundMesh) groundMesh.scale.set(gs, gs, gsH);
    if (contactShadow) contactShadow.scale.set(gs * 0.42, gs * 0.42, 1);
    if (!framedOnce) {
        camera.position.set(11, 5.5, 14);
        controls.target.set(0, 3.2, 0);
        framedOnce = true;
    }
    // KEIN Reframe bei Modellwechsel -> Kamera bleibt fix im Raum, Groessen direkt vergleichbar
    controls.minDistance = 1;
    controls.maxDistance = 90;
    controls.update();
    console.log(
        "[BEWEIS] " + CURRENT + "  min.y vor Sitz=" + minYbefore.toFixed(4) + " -> 0   maxDim=" + maxDim.toFixed(3)
    );
}
let _stuBB = null,
    _stuRT = null,
    _stuTex = null,
    _inBB = false,
    _bbTo = null; // FIX v34: Studio-L2 = ECHTES Billboard
function studioBillboard() {
    if (_inBB || forestMode) return;
    try {
        _inBB = true;
        const keep = __lod;
        __lod = 1;
        build();
        __lod = keep; // 1) DASSELBE Exemplar als L1 bauen — die Quelle, aus der auch der Wald-Atlas rastert
        const src = subject;
        const V = 8,
            cw = 256,
            ch = 512;
        if (!_stuRT) {
            _stuRT = new THREE.WebGLRenderTarget(cw, ch * V, {
                minFilter: THREE.LinearMipmapLinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                generateMipmaps: true,
            });
            _stuTex = _stuRT.texture;
            _stuTex.anisotropy = 8;
            _stuTex.wrapS = _stuTex.wrapT = THREE.ClampToEdgeWrapping;
        }
        const bs = new THREE.Scene();
        bs.add(new THREE.HemisphereLight(0xffffff, 0x8a8a8a, 1.05)); // flacher Albedo-Bake, wie im Wald
        scene.remove(src);
        bs.add(src);
        const box = new THREE.Box3().setFromObject(src);
        /* FIX v36: wie im Wald-Bake — Anker = Stammachse, keine Box-Rezentrierung */
        const top = Math.max(0.5, box.max.y) * 1.02,
            halfH = top * 0.5;
        let _rad2 = 0;
        src.traverse((o) => {
            if (o.isMesh && o.geometry && o.geometry.attributes.position) {
                const pa = o.geometry.attributes.position;
                for (let i = 0; i < pa.count; i++) {
                    const X = pa.getX(i),
                        Z = pa.getZ(i),
                        q = X * X + Z * Z;
                    if (q > _rad2) _rad2 = q;
                }
            }
        });
        const halfW = Math.max(halfH * (cw / ch), Math.sqrt(_rad2) * 1.04),
            wR = halfW / halfH; // 2) identische Rahmung inkl. per-Art-Breite (v28)
        const cam = new THREE.OrthographicCamera(-halfW, halfW, halfH, -halfH, 0.1, 500);
        cam.position.set(0, halfH, Math.max(halfW * 2.5, box.max.y) + 40);
        cam.lookAt(0, halfH, 0);
        cam.updateProjectionMatrix();
        const pRT = renderer.getRenderTarget(),
            pT = WIND.uTime.value,
            pP = SEASON.uLeafPresence.value;
        WIND.uTime.value = 0;
        SEASON.uLeafPresence.value = 1.0;
        for (let v = 0; v < V; v++) {
            src.rotation.y = -v * ((Math.PI * 2) / V);
            src.updateMatrixWorld(true);
            _stuRT.viewport.set(0, v * ch, cw, ch);
            _stuRT.scissor.set(0, v * ch, cw, ch);
            _stuRT.scissorTest = true;
            renderer.setRenderTarget(_stuRT);
            renderer.setClearColor(0x2f4a22, 0);
            renderer.clear();
            renderer.render(bs, cam);
        }
        renderer.setRenderTarget(pRT);
        WIND.uTime.value = pT;
        SEASON.uLeafPresence.value = pP;
        bs.remove(src);
        disposeSubject();
        subject = new THREE.Group();
        scene.add(subject); // 3) Subjekt = NUR das Quad (Lebenszyklus wie jedes Exemplar)
        const H = top,
            W = H * wR;
        _stuTex.repeat.set(1, 1 / V);
        _stuTex.offset.set(0, 0);
        const mat = new THREE.MeshBasicMaterial({
            map: _stuTex,
            alphaTest: 0.4,
            side: THREE.DoubleSide,
            toneMapped: true,
        });
        const q = new THREE.Mesh(new THREE.PlaneGeometry(W, H), mat);
        q.position.y = H * 0.5;
        subject.add(q);
        _stuBB = { mesh: q, V: V, tex: _stuTex };
        if (typeof seatAndFrame === "function")
            try {
                seatAndFrame();
            } catch (_e) {}
        console.log(
            "[phyto] Studio-L2 = ECHTES Billboard (unbeleuchtete Karten-Vorschau; im Wald kommt Licht via Normal-Atlas dazu): 8 Ansichten, Rahmen " +
                (2 * halfW).toFixed(1) +
                "x" +
                (2 * halfH).toFixed(1) +
                "m, Seitenverhaeltnis " +
                wR.toFixed(2)
        );
    } catch (e) {
        console.warn("[phyto] Studio-Billboard fehlgeschlagen — zeige L2-Mesh:", e);
    } finally {
        _inBB = false;
    }
}
function build() {
    RNG = mulberry32(Math.floor(SEED));
    disposeSubject();
    subject = new THREE.Group();
    scene.add(subject);
    const pre = PRESETS[CURRENT];
    if (pre.panel === "rock") {
        const P = deriveParamsRock(pre);
        __rockKind = P.kind;
        emitRock(P);
    } else {
        const P = deriveParamsPlant(pre);
        if (P.kind === "flower") emitFlower(P);
        else if (P.kind === "grass") emitGrass(P);
        else {
            const nodes = emitTree(P);
            console.log(
                "[BEWEIS] McMahon: H=" +
                    P.height.toFixed(2) +
                    "  D=" +
                    P._D.toFixed(3) +
                    "  k·D^(2/3)=" +
                    (lerp(28, 46, P.slim) * Math.pow(P._D, 2 / 3)).toFixed(2)
            );
        }
        if (P._petals) console.log("[BEWEIS] Bluetenblaetter (Fibonacci): " + P._petals);
    }
    seatAndFrame();
    const ld = document.getElementById("loading");
    if (ld) ld.style.display = "none";
    if (__lod === 2 && !forestMode && !_inBB) {
        if (_bbTo) clearTimeout(_bbTo);
        _bbTo = setTimeout(studioBillboard, 80);
    } // FIX v34: zentral — egal ob Art-Wechsel, Neue Saat, Wuerfeln oder Slider: L2 zeigt IMMER die Fernstufe des Waldes (entprellt: Slider-Ziehen bakt max ~12x/s)
}
/* ========================================================================== *
   STUDIO — bewusst nahe am Tetrapoda-Labor gehalten (Geometrie ist der Star):
   PMREM-Env · Hemi+Key+Rim+Fill · Boden · Kontaktschatten · Bloom+FXAA+Cine
 * ========================================================================== */
function init() {
    // FOUNDRY-MODUS: AnazhRealm laedt diese Datei versteckt als reinen Asset-Motor
    // (?asset-foundry=1). Kein Renderer, kein eigener Wald, kein Render-Loop — nur die
    // Materialien + Saison + PRESETS, damit buildInstance echte Baum-Assets liefert.
    // P0 (foundry-core-Weg): dieselbe Foundry auch als WORKER ladbar — der Bootstrap setzt
    // self.__PHYTO_FOUNDRY_WORKER=true vor importScripts (eine Blob-URL trägt kein ?search).
    const __foundryWorker =
        typeof window === "undefined" && typeof self !== "undefined" && self.__PHYTO_FOUNDRY_WORKER === true;
    if (__foundryWorker || (typeof location !== "undefined" && /[?&]asset-foundry/.test(location.search))) {
        globalThis.__PHYTO_FOUNDRY = true;
        try {
            buildMaterials();
        } catch (_e) {}
        try {
            setSeasonColors("summer");
        } catch (_e) {}
        return; // die Portal-Bruecke (IIFE am Datei-Ende) meldet ready + bedient build-asset
    }
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b08);
    {
        // GRADIENT-HIMMEL + ECHTE WOLKEN: prozedurales Dichtefeld mit Parallaxe, von der Sonne beleuchtet, Deckung vom Wetter
        const skyGeo = new THREE.SphereGeometry(1, 32, 20);
        const skyMat = new THREE.ShaderMaterial({
            uniforms: {
                uTop: { value: new THREE.Color(PORTAL_SKY.top) },
                uHor: { value: new THREE.Color(0xbcd2e0) },
                uBot: { value: new THREE.Color(0x3a4250) },
                uHaze: { value: 0.0 },
                uTime: { value: 0 },
                uCover: { value: 0.15 },
                uSunDir: { value: new THREE.Vector3(0.5, 0.8, 0.4) },
                uSunCol: { value: new THREE.Color(1, 0.95, 0.85) },
            },
            vertexShader:
                "varying vec3 vd;void main(){vd=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
            fragmentShader: [
                "uniform vec3 uTop,uHor,uBot,uSunDir,uSunCol;uniform float uHaze,uTime,uCover;varying vec3 vd;",
                "float h21(vec2 p){p=fract(p*vec2(123.34,345.45));p+=dot(p,p+34.345);return fract(p.x*p.y);}",
                "float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}",
                "float fbm(vec2 p){float s=0.0,a=0.5;for(int i=0;i<5;i++){s+=a*vn(p);p=p*2.03+1.7;a*=0.5;}return s;}",
                "void main(){vec3 dir=normalize(vd);float hh=dir.y;",
                "  vec3 c=hh>0.0?mix(uHor,uTop,pow(clamp(hh,0.0,1.0),0.55)):mix(uHor,uBot,pow(clamp(-hh,0.0,1.0),0.5));",
                "  c=mix(c,uHor,uHaze*clamp(1.0-abs(hh)*2.2,0.0,1.0));",
                "  if(hh>0.015){",
                "    vec2 sp=dir.xz/(dir.y+0.16); vec2 dr=vec2(uTime*0.020,uTime*0.014);", // Projektion auf Himmelsebene -> Parallaxe, langsame Drift
                "    float n=fbm(sp*1.6+dr); float n2=fbm(sp*3.7-dr*1.6);",
                "    float cov=uCover; float dens=smoothstep(0.54-cov*0.42,0.80-cov*0.30,n*0.7+n2*0.3);",
                "    float hor=smoothstep(0.015,0.20,dir.y); dens*=hor;", // Wolken klingen zum Horizont aus
                "    float sa=clamp(dot(dir,normalize(uSunDir))*0.5+0.5,0.0,1.0);",
                "    vec3 lit=mix(vec3(0.62,0.65,0.71),uSunCol*1.15+0.15,sa*0.65);", // grau bis sonnenbeschienen
                "    lit=mix(lit,vec3(0.34,0.36,0.42),cov*0.55);", // bedeckt -> dunkler/grauer
                "    float edge=smoothstep(0.0,0.5,n2)*0.4+0.6;", // weiche Raender
                "    c=mix(c,lit,dens*edge*0.92);",
                "  }",
                "  gl_FragColor=vec4(c,1.0);",
                "}",
            ].join("\n"),
            side: THREE.BackSide,
            depthWrite: false,
            depthTest: false,
            fog: false,
        });
        _skyDome = new THREE.Mesh(skyGeo, skyMat);
        _skyDome.renderOrder = -1000;
        _skyDome.frustumCulled = false;
        scene.add(_skyDome);
    }
    {
        // REGEN: fallende Streifen um die Kamera, Intensitaet vom Wetter
        const RN = 1600,
            rp = new Float32Array(RN * 6),
            rext = [54, 30, 54];
        for (let i = 0; i < RN; i++) {
            const x = (Math.random() - 0.5) * rext[0],
                y = Math.random() * rext[1],
                z = (Math.random() - 0.5) * rext[2],
                ln = 0.5 + Math.random() * 0.6;
            rp[i * 6] = x;
            rp[i * 6 + 1] = y;
            rp[i * 6 + 2] = z;
            rp[i * 6 + 3] = x + 0.05;
            rp[i * 6 + 4] = y - ln;
            rp[i * 6 + 5] = z;
        }
        const rg = new THREE.BufferGeometry();
        rg.setAttribute("position", new THREE.BufferAttribute(rp, 3));
        const rm = new THREE.LineBasicMaterial({ color: 0xbcd2e2, transparent: true, opacity: 0.0, depthWrite: false });
        _rain = new THREE.LineSegments(rg, rm);
        _rain.frustumCulled = false;
        _rain.renderOrder = 5;
        _rain.userData.ext = rext;
        _rain.visible = false;
        scene.add(_rain);
    }
    camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, 0.05, 400);
    camera.position.set(7, 4, 8);
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(2, devicePixelRatio));
    renderer.info.autoReset = false; // Attribution: info sammelt ueber ALLE Paesse eines Frames (Composer!), Reset macht animate()
    if (THREE.sRGBEncoding !== undefined) renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
    // weiche Tageslicht-Env
    try {
        const c = document.createElement("canvas");
        c.width = 256;
        c.height = 256;
        const x = c.getContext("2d");
        const g = x.createLinearGradient(0, 0, 0, 256);
        g.addColorStop(0, "#cfe0d6");
        g.addColorStop(0.5, "#5a6b5e");
        g.addColorStop(1, "#0a0f0a");
        x.fillStyle = g;
        x.fillRect(0, 0, 256, 256);
        const t = new THREE.CanvasTexture(c);
        const p = new THREE.PMREMGenerator(renderer);
        scene.environment = p.fromEquirectangular(t).texture;
        t.dispose();
    } catch (e) {}
    hemiL = new THREE.HemisphereLight(0xdfeecc, 0x463c2e, 0.55);
    scene.add(hemiL);
    const key = new THREE.DirectionalLight(0xfff0d8, 2.4);
    key.position.set(7, 10, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.bias = -0.0002;
    key.shadow.camera.left = -10;
    key.shadow.camera.right = 10;
    key.shadow.camera.top = 10;
    key.shadow.camera.bottom = -10;
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 40;
    keyLight = key;
    scene.add(key);
    rimL = new THREE.DirectionalLight(0xaaccff, 1.2);
    rimL.position.set(-6, 5, -6);
    scene.add(rimL);
    fillL = new THREE.DirectionalLight(0x557a4a, 0.6);
    fillL.position.set(0, 3, -9);
    scene.add(fillL);
    backL = new THREE.DirectionalLight(0xffd8a0, 0.5);
    backL.position.set(-4, 3, 9);
    scene.add(backL);
    // Boden + Kontaktschatten
    const gC = document.createElement("canvas");
    gC.width = gC.height = 512;
    const gx = gC.getContext("2d");
    const gg = gx.createRadialGradient(256, 256, 40, 256, 256, 256);
    gg.addColorStop(0, "#171c14");
    gg.addColorStop(0.45, "#0d110b");
    gg.addColorStop(1, "#060806");
    gx.fillStyle = gg;
    gx.fillRect(0, 0, 512, 512);
    const gTex = new THREE.CanvasTexture(gC);
    const gGeo = new THREE.CircleGeometry(1, 170);
    const gpos = gGeo.attributes.position; // kleine Insel-Kuppe (Einheit, wird aufs Stueck skaliert)
    for (let i = 0; i < gpos.count; i++) {
        const gX = gpos.getX(i),
            gY = gpos.getY(i),
            rr = Math.hypot(gX, gY);
        const e = Math.max(0, Math.min(1, (rr - 0.6) / 0.4)),
            edge = e * e * (3 - 2 * e);
        const dome = -0.42 * rr * rr - 0.52 * edge; // domed island: Kuppe traegt das Stueck, Rand faellt ins Dunkel
        const relief =
            (fbm2(gX * 4.2 + 3, gY * 4.2) - 0.5) * 0.5 +
            (fbm2(gX * 9, gY * 9 + 8) - 0.5) * 0.22 +
            (fbm2(gX * 18, gY * 18 + 2) - 0.5) * 0.09;
        const ra = Math.min(1, Math.max(0, (rr - 0.1) / 0.45)) * 0.16; // Kuppe flach (sauberer Sitz), Hang strukturiert
        gpos.setZ(i, dome + relief * ra);
    }
    gGeo.computeVertexNormals();
    groundMesh = new THREE.Mesh(gGeo, new THREE.MeshStandardMaterial({ map: gTex, roughness: 0.97, metalness: 0 }));
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.003;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);
    contactShadow = new THREE.Mesh(
        new THREE.CircleGeometry(1, 48),
        new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, depthWrite: false })
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.001;
    scene.add(contactShadow);
    // Post
    composer = new THREE.EffectComposer(renderer);
    renderPassMain = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPassMain);
    bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.18, 0.5, 0.9);
    composer.addPass(bloomPass);
    fxaa = new THREE.ShaderPass(THREE.FXAAShader);
    fxaa.uniforms["resolution"].value.set(1 / innerWidth, 1 / innerHeight);
    composer.addPass(fxaa);
    const cine = {
        uniforms: { tDiffuse: { value: null }, time: { value: 0 } },
        vertexShader: [
            "varying vec2 vUv;",
            "void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
        ].join("\n"),
        fragmentShader: [
            "uniform sampler2D tDiffuse;",
            "uniform float time;",
            "varying vec2 vUv;",
            "float rnd(vec2 s){return fract(sin(dot(s,vec2(12.9898,78.233)))*43758.5453);}",
            "void main(){vec2 uv=vUv;vec2 dir=uv-0.5;float d=length(dir);vec2 o=dir*d*0.004;",
            "float r=texture2D(tDiffuse,uv+o).r,g=texture2D(tDiffuse,uv).g,b=texture2D(tDiffuse,uv-o).b;vec3 col=vec3(r,g,b);",
            "col*=smoothstep(1.25,0.2,d*1.25);col+=(rnd(uv+time)-0.5)*0.015;gl_FragColor=vec4(col,1.0);}",
        ].join("\n"),
    };
    cinePass = new THREE.ShaderPass(cine);
    cinePass.renderToScreen = true;
    composer.addPass(cinePass);
    // ===== VOLUMETRISCHES LICHT: ray-marchte Lichtschaefte durch die Kronen (Schattenkarte gesampelt) =====
    const volShader = {
        uniforms: {
            tDiffuse: { value: null },
            uDepth: { value: _dummyTex },
            uTerrainMap: { value: _dummyTex },
            uLightVol: { value: _dummyVol },
            uVolOrigin: { value: new THREE.Vector3(-64, -4, -64) },
            uVolSize: { value: new THREE.Vector3(128, 30, 128) },
            uAdditiveOnly: { value: 0.0 },
            uTerrainFog: { value: 0.0 },
            uInvVP: { value: new THREE.Matrix4() },
            uCamPos: { value: new THREE.Vector3() },
            uSunDir: { value: new THREE.Vector3(0.5, 0.8, 0.4) },
            uSunColor: { value: new THREE.Color(1.0, 0.86, 0.62) },
            uFogColor: { value: new THREE.Color(0xb4c6cf) },
            uTime: { value: 0 },
            uDensity: { value: 0.55 },
            uMaxDist: { value: 95.0 },
            uChunkR: { value: 64.0 },
            uLowElev: { value: 0.0 },
            uHighElev: { value: 10.0 },
            uFogTopH: { value: 4.5 },
            uFogSoft: { value: 2.2 },
            uFogScale: { value: 2.6 },
            uExtinct: { value: 0.16 },
            uFogBright: { value: 0.62 },
        },
        vertexShader:
            "out vec2 vUv;\nvoid main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
        fragmentShader: [
            "precision highp float;",
            "precision highp sampler3D;",
            "in vec2 vUv;",
            "out vec4 outColor;",
            "uniform sampler2D tDiffuse,uDepth,uTerrainMap;",
            "uniform sampler3D uLightVol;",
            "uniform mat4 uInvVP;",
            "uniform vec3 uCamPos,uSunDir,uSunColor,uFogColor,uVolOrigin,uVolSize;",
            "uniform float uTime,uDensity,uMaxDist,uChunkR,uLowElev,uHighElev,uFogTopH,uFogSoft,uFogScale,uExtinct,uFogBright,uAdditiveOnly,uTerrainFog;",
            "float hash(vec2 p){p=fract(p*vec2(443.897,441.423));p+=dot(p,p.yx+19.19);return fract((p.x+p.y)*p.x);}",
            "float fogDens(vec3 p){",
            "  if(uTerrainFog<0.5){ return clamp(exp(-max(p.y+1.0,0.0)/3.5),0.0,1.0); }",
            "  vec2 tuv=p.xz/(2.0*uChunkR)+0.5; if(tuv.x<0.0||tuv.x>1.0||tuv.y<0.0||tuv.y>1.0)return 0.0;",
            "  vec4 tm=texture(uTerrainMap,tuv); float terr=tm.r, wet=tm.g; float h=p.y-terr; if(h<-0.5)return 0.0;",
            "  float layer=clamp((uFogTopH-h)/uFogSoft,0.0,1.0)*exp(-max(h,0.0)/uFogScale);",
            "  float valley=smoothstep(uHighElev,uLowElev,terr);",
            "  float breath=0.86+0.14*sin(p.x*0.08+p.z*0.10-uTime*0.18);",
            "  return layer*(0.45+0.7*valley+0.9*wet)*breath;",
            "}",
            "float sunVis(vec3 p){ vec3 v=(p-uVolOrigin)/uVolSize; if(v.x<0.0||v.x>1.0||v.y<0.0||v.y>1.0||v.z<0.0||v.z>1.0)return 1.0; return texture(uLightVol,v).r; }",
            "void main(){",
            "  vec3 scene=texture(tDiffuse,vUv).rgb;",
            "  float depth=texture(uDepth,vUv).x;",
            "  vec4 clip=vec4(vUv*2.0-1.0,depth*2.0-1.0,1.0); vec4 wp=uInvVP*clip; vec3 world=wp.xyz/wp.w;",
            "  vec3 ro=uCamPos,d=world-ro; float dist=length(d); d/=max(dist,1e-4);",
            "  dist=mix(min(dist,uMaxDist),uMaxDist,uAdditiveOnly);",
            "  const int N=16; float sl=dist/float(N); float t=sl*(0.15+0.85*hash(vUv+fract(uTime)));",
            "  float ct=dot(d,normalize(uSunDir)); float g=0.76; float ph=(1.0-g*g)/(12.566*pow(max(1.0+g*g-2.0*g*ct,1e-3),1.5));",
            "  float tau=0.0, inscat=0.0;",
            "  for(int i=0;i<N;i++){ vec3 p=ro+d*t; float dn=fogDens(p); float vis=sunVis(p);",
            "    tau+=dn*sl; float Tr=exp(-tau*uExtinct); inscat+=vis*dn*sl*Tr; t+=sl; }",
            "  float T=exp(-tau*uExtinct); float fa=1.0-T;",
            "  vec3 col; if(uAdditiveOnly>0.5){ col=scene+uSunColor*inscat*ph*uDensity; }",
            "  else { col=scene*T+uFogColor*fa*uFogBright+uSunColor*inscat*ph*uDensity; }",
            "  outColor=vec4(col,1.0);",
            "}",
        ].join("\n"),
    };
    volPass = new THREE.ShaderPass(volShader);
    volPass.material.glslVersion = THREE.GLSL3;
    volPass.enabled = false;
    composer.insertPass(volPass, 1); // Froxel-Volumen-Lookup statt Schattenmarsch
    /* FIX v32: TAA-LITE — der ehrliche Mittelweg zu vollen Motion-Vectors: die Welt ist statisch, also ist
     Kamerabewegung EXAKT reprojezierbar (Szenentiefe + ViewProj des letzten Frames); Wind/Wasser faengt der
     Neighborhood-Clamp. Zusammen mit dem golden-ratio-rotierten Komplement-Dither (uDitherT) mitteln sich die
     LOD-Blenden in ~6-8 Frames zu glatten Uebergaengen — kein Schmieren, weil Geschichte hart auf die 3x3-
     Farbnachbarschaft des aktuellen Frames geklemmt wird. */
    try {
        const taaShader = {
            uniforms: {
                tDiffuse: { value: null },
                uPrev: { value: null },
                uDepth: { value: null },
                uInvVP: { value: new THREE.Matrix4() },
                uPrevVP: { value: new THREE.Matrix4() },
                uRes: { value: new THREE.Vector2(1, 1) },
                uBlend: { value: 0 },
            },
            vertexShader:
                "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
            fragmentShader:
                "uniform sampler2D tDiffuse;uniform sampler2D uPrev;uniform sampler2D uDepth;uniform mat4 uInvVP;uniform mat4 uPrevVP;uniform vec2 uRes;uniform float uBlend;varying vec2 vUv;" +
                "void main(){vec4 cur=texture2D(tDiffuse,vUv);float d=texture2D(uDepth,vUv).x;" +
                "vec4 ndc=vec4(vUv*2.0-1.0,d*2.0-1.0,1.0);vec4 wp=uInvVP*ndc;wp.xyz/=wp.w;" +
                "vec4 pc=uPrevVP*vec4(wp.xyz,1.0);vec2 puv=(pc.xy/pc.w)*0.5+0.5;" +
                "vec3 mn=cur.rgb,mx=cur.rgb;vec3 c;" +
                "c=texture2D(tDiffuse,vUv+vec2(uRes.x,0.0)).rgb;mn=min(mn,c);mx=max(mx,c);" +
                "c=texture2D(tDiffuse,vUv-vec2(uRes.x,0.0)).rgb;mn=min(mn,c);mx=max(mx,c);" +
                "c=texture2D(tDiffuse,vUv+vec2(0.0,uRes.y)).rgb;mn=min(mn,c);mx=max(mx,c);" +
                "c=texture2D(tDiffuse,vUv-vec2(0.0,uRes.y)).rgb;mn=min(mn,c);mx=max(mx,c);" +
                "c=texture2D(tDiffuse,vUv+uRes).rgb;mn=min(mn,c);mx=max(mx,c);" +
                "c=texture2D(tDiffuse,vUv-uRes).rgb;mn=min(mn,c);mx=max(mx,c);" +
                "c=texture2D(tDiffuse,vUv+vec2(uRes.x,-uRes.y)).rgb;mn=min(mn,c);mx=max(mx,c);" +
                "c=texture2D(tDiffuse,vUv+vec2(-uRes.x,uRes.y)).rgb;mn=min(mn,c);mx=max(mx,c);" +
                "vec3 hist=clamp(texture2D(uPrev,puv).rgb,mn,mx);" +
                "float ok=(puv.x>0.001&&puv.x<0.999&&puv.y>0.001&&puv.y<0.999&&d<0.9999&&pc.w>0.0)?1.0:0.0;" +
                "gl_FragColor=vec4(mix(cur.rgb,hist,uBlend*ok),cur.a);}",
        };
        taaPass = new THREE.ShaderPass(taaShader);
        taaPass._copyMat = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(THREE.CopyShader.uniforms),
            vertexShader: THREE.CopyShader.vertexShader,
            fragmentShader: THREE.CopyShader.fragmentShader,
            depthTest: false,
            depthWrite: false,
        });
        taaPass.render = function (renderer, writeBuffer, readBuffer) {
            const w = readBuffer.width,
                hh = readBuffer.height;
            if (!this._hA || this._hA.width !== w || this._hA.height !== hh) {
                if (this._hA) {
                    this._hA.dispose();
                    this._hB.dispose();
                }
                const o = {
                    minFilter: THREE.LinearFilter,
                    magFilter: THREE.LinearFilter,
                    format: THREE.RGBAFormat,
                    depthBuffer: false,
                    stencilBuffer: false,
                };
                this._hA = new THREE.WebGLRenderTarget(w, hh, o);
                this._hB = new THREE.WebGLRenderTarget(w, hh, o);
                _taaReset = true;
            }
            this.uniforms.tDiffuse.value = readBuffer.texture;
            this.uniforms.uPrev.value = this._hA.texture;
            this.uniforms.uRes.value.set(1 / w, 1 / hh);
            this.uniforms.uBlend.value = _taaReset ? 0.0 : 0.88;
            _taaReset = false;
            renderer.setRenderTarget(this._hB);
            renderer.clear();
            this.fsQuad.render(renderer); // Aufloesung IN die Historie
            this._copyMat.uniforms.tDiffuse.value = this._hB.texture;
            if (this.renderToScreen) {
                renderer.setRenderTarget(null);
            } else {
                renderer.setRenderTarget(writeBuffer);
                renderer.clear();
            }
            const _q = this.fsQuad,
                _pm = _q._mesh ? _q._mesh.material : _q.material; // HOTFIX v33: fsQuad des ShaderPass wiederverwenden statt THREE.Pass.FullScreenQuad — der r128-js-Build exportiert den Helper als THREE.FullScreenQuad (nicht unter .Pass); Material-Swap braucht gar keinen Konstruktor
            if (_q._mesh) _q._mesh.material = this._copyMat;
            else _q.material = this._copyMat;
            _q.render(renderer); // Historie -> Kette
            if (_q._mesh) _q._mesh.material = _pm;
            else _q.material = _pm;
            const t = this._hA;
            this._hA = this._hB;
            this._hB = t;
        };
        composer.insertPass(taaPass, 2);
        taaPass.enabled = false; // Reihenfolge: [Szene, Volumen, TAA, Bloom, FXAA, Cine] — zeitliche Aufloesung VOR den Nachbearbeitungen
    } catch (_te) {
        taaPass = null;
        console.warn("[phyto] TAA-Lite nicht verfuegbar — laufe ohne:", _te);
    } // HOTFIX v33: Degradation statt Absturz (der Wurf stand mitten in init und riss alles Folgende mit)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotateSpeed = 0.7;
    controls.minDistance = 1;
    controls.maxDistance = 60;
    clock = new THREE.Clock();
    console.log(
        "%cPHYTOGENESIS build v38 — ABSCHLUSS-AUDIT: 2 Funde behoben (PHYTO_LODMASK-Ventil war seit v32 durch Zeilen-Merge auskommentiert · Nadel-Aggregation existierte nie: L1-Nadeln jetzt 1.65x laenger bei 0.36-Stride -> Deckung ~0.98) · TAA-Reset bei Insel-Neubau · Konzept-Stand: Pipeline geschlossen, benannte Ausbaustufen: Oktaeder-Impostors (Flug), echtes Occlusion, Chunk-Streaming",
        "color:#9ece5a;font-weight:bold"
    );
    buildMaterials();
    setSeasonColors("summer");
    build();
    wireUI();
    wireForest();
    // PATCH-PROBE (?patch-probe=1): eine schmale Sicht-Taille fuer den 10x10m-Look-Abgleich
    // Studio-vs-AnazhRealm — read-only Zugriff auf die Render-Globals + ein composer.render()
    // (voller Studio-Look inkl. Post). Nur mit dem Query-Param aktiv → 0 Fussabdruck im
    // normalen Studio-Gebrauch (wie ?asset-foundry). Toolchain-Infra, kein Verhalten.
    try {
        if (typeof location !== "undefined" && /[?&]patch-probe/.test(location.search)) {
            window.__phytoView = {
                get scene() {
                    return scene;
                },
                get camera() {
                    return camera;
                },
                get renderer() {
                    return renderer;
                },
                get forestMode() {
                    return forestMode;
                },
                renderPatch() {
                    if (composer) composer.render();
                    else renderer.render(scene, camera);
                },
                // Für den nackt-Horizont-Abgleich: das Laub des Waldes läuft über den FoliagePass
                // (Screen-Space), nicht über InstancedMesh → ein `traverse(hide isInstancedMesh)`
                // entfernt es NICHT. Hier den Pass gegen den einfachen RenderPass tauschen (nur Terrain
                // + Himmel + Wasser), danach wiederherstellen. So ist der Vergleich Terrain-gegen-Terrain.
                setForestFoliage(on) {
                    if (!composer || !composer.passes || !renderPassMain) return;
                    composer.passes[0] = on ? _foliagePass || renderPassMain : renderPassMain;
                },
            };
        }
    } catch (_pp) {}
    animate();
}

/* ============================ WALD ============================ *
   Begehbarer Wald: streut Instanzen mit Distanz-LOD (nah L0, fern L2),
   Ego-Steuerung (PointerLock + WASD), Terrain mit Hoehe + Nebel.
 * ============================================================== */
let forestMode = false,
    forestGroup = null,
    plControls = null,
    lastFrameT = 0,
    flyMode = false,
    lastSpace = 0;
let plFallback = false; // PORTAL-FIX V18.384: verweigert der Browser den Pointer-Lock (iframe ohne Gesture/Policy), traegt Drag-Umsehen + WASD den Wald trotzdem
let eyeY = 1.7,
    bobPhase = 0,
    velF = 0,
    velR = 0,
    eyeVel = 0;
const _fwd = new THREE.Vector3(),
    _rgt = new THREE.Vector3();
const move = { fwd: false, back: false, left: false, right: false, run: false, up: false };
const sstep = (a, b, x) => {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
};
function pathDist(x, z) {
    const p1x = Math.sin(z * 0.028) * 28 + Math.sin(z * 0.012 + 2) * 44;
    const p2z = Math.sin(x * 0.025 + 1) * 32 + Math.sin(x * 0.013 + 4) * 40;
    return Math.min(Math.abs(x - p1x), Math.abs(z - p2z));
}
/* FIX v26: densityField()/speciesField() entfernt — waren definiert, aber nie aufgerufen (plantForest nutzt standDensity + inline clim/patch). Toter Code. */
const SEA_LEVEL = -3.0;
const COAST_D = 74.0; // Insel-Radius: Kuestenlinie rundherum. Wald endet bei R=64 -> 5m Puffer vor dem Strandsaum. EINZIGE Quelle, wird in den See-Shader injiziert.
function seaward(x, z) {
    return Math.hypot(x, z) - COAST_D;
} // <0 Land, >0 seewaerts (RADIAL: die Welt ist eine Insel, Meer rundherum)
const MTN = { x: -42, z: -30, R: 20, H: 22, Rtun: 3.2 }; // BERG (3D-Volumen via Marching Cubes) in der -X/-Z-Ecke
const _cfa = Math.atan2(-MTN.z, -MTN.x); // Richtung Berg -> Ursprung (Hoehle oeffnet zum Wald)
const CAVE = {
    fa: _cfa,
    x: MTN.x + Math.cos(_cfa) * MTN.R * 0.85,
    z: MTN.z + Math.sin(_cfa) * MTN.R * 0.85,
    r: 4.5,
    depth: 12,
};
function inCaveZone(x, z) {
    return false;
} // Berg entfernt
function _groundBase(x, z) {
    let h =
        (fbm2(x * 0.0058 + 11, z * 0.0058 + 5) - 0.5) * 23 +
        (fbm2(x * 0.02 + 2, z * 0.02 + 9) - 0.5) * 5.2 +
        (fbm2(x * 0.062 + 7, z * 0.062 + 3) - 0.5) * 1.4;
    const pd = pathDist(x, z);
    if (pd < 4.5) h -= (4.5 - pd) * 0.13;
    const sw = seaward(x, z);
    if (sw > -5) {
        const t = clamp((sw + 5) / 16, 0, 1);
        h = lerp(h, -7.5, t * t);
    } // Strandhang -> Meeresboden (schmaler Saum)
    return h;
} // KEIN Berg-Mound mehr: der 3D-Fels-Cap waechst direkt aus dem natuerlichen Terrain
/* WASSER sammelt sich in den Senken: zwei Teiche an Tiefpunkten (verschiedene Hoehe) + Bach im Gefaelle dazwischen */
let _WATER = null;
function water() {
    if (_WATER) return _WATER;
    const R = 36;
    let cand = [];
    for (let i = 0; i < 46; i++)
        for (let j = 0; j < 46; j++) {
            const x = -R + (2 * R * i) / 45,
                z = -R + (2 * R * j) / 45;
            if (x * x + z * z > R * R) continue;
            cand.push([x, z, _groundBase(x, z)]);
        }
    cand.sort((a, b) => a[2] - b[2]);
    const A = cand[0];
    let B = null;
    for (const c of cand) {
        if (Math.hypot(c[0] - A[0], c[1] - A[1]) > 20) {
            B = c;
            break;
        }
    }
    if (!B) B = cand[Math.min(cand.length - 1, 150)];
    let lo = A,
        hi = B;
    if (hi[2] < lo[2]) {
        const t = lo;
        lo = hi;
        hi = t;
    }
    const margin = 0.5; // Wasserspiegel liegt margin UNTER dem Rand (Teich sitzt in der Senke)
    const mkPond = (c, D, Rb) => {
        const g0 = c[2],
            wh = g0 - margin,
            rs = Rb * (1 - Math.sqrt(margin / D));
        return { x: c[0], z: c[1], g0, D, Rb, wh, rs };
    }; // rs = echte Uferlinie, wo Mulde==Spiegel
    const pondLo = mkPond(lo, 3.4, 10.5),
        pondHi = mkPond(hi, 2.8, 8.5);
    // BACH: folgt lokalem Boden minus margin, STRENG monoton fallend (Wasser fliesst abwaerts), Enden exakt an den Teich-Spiegeln
    const N = 16,
        stream = [];
    const _ux = lo[0] - hi[0],
        _uz = lo[1] - hi[1],
        _ul = Math.hypot(_ux, _uz) || 1,
        ux = _ux / _ul,
        uz = _uz / _ul;
    const sX = hi[0] + ux * pondHi.rs * 0.85,
        sZ = hi[1] + uz * pondHi.rs * 0.85; // Start an der Uferlinie von pondHi (nicht im Zentrum!)
    const eX = lo[0] - ux * pondLo.rs * 0.85,
        eZ = lo[1] - uz * pondLo.rs * 0.85; // Ende an der Uferlinie von pondLo
    for (let i = 0; i <= N; i++) {
        const t = i / N,
            k = Math.sin(t * Math.PI);
        const x = sX + (eX - sX) * t + k * 6 * Math.sin(t * 4.7 + 1.0),
            z = sZ + (eZ - sZ) * t + k * 5 * Math.cos(t * 4.1 + 0.5);
        stream.push({ x, z, gb: _groundBase(x, z), sh: 0 });
    }
    stream[0].sh = pondHi.wh;
    stream[N].sh = pondLo.wh;
    for (let i = 1; i < N; i++) stream[i].sh = stream[i].gb - margin;
    for (let i = 1; i <= N; i++) {
        const cap = stream[i - 1].sh - 0.05;
        if (stream[i].sh > cap) stream[i].sh = cap;
    } // monoton fallend
    stream[N].sh = pondLo.wh;
    for (let i = N - 1; i >= 1; i--) {
        const fl = stream[i + 1].sh + 0.03;
        if (stream[i].sh < fl) stream[i].sh = fl;
    } // nie unter flussabwaerts
    for (let p = 0; p < 2; p++)
        for (let i = 1; i < N; i++) stream[i].sh = stream[i].sh * 0.6 + (stream[i - 1].sh + stream[i + 1].sh) * 0.2; // glatter Fluss
    for (let i = 1; i <= N; i++) {
        const cap = stream[i - 1].sh - 0.02;
        if (stream[i].sh > cap) stream[i].sh = cap;
    }
    stream[N].sh = pondLo.wh;
    _WATER = { pondLo, pondHi, stream, margin, SW: 2.8, CW: 4.8 };
    return _WATER;
}
function _streamDH(x, z) {
    const s = water().stream;
    let bd = 1e9,
        bsh = 0,
        bgb = 0;
    for (let i = 1; i < s.length; i++) {
        const ax = s[i - 1].x,
            az = s[i - 1].z,
            dx = s[i].x - ax,
            dz = s[i].z - az,
            L2 = dx * dx + dz * dz || 1;
        let t = ((x - ax) * dx + (z - az) * dz) / L2;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const px = ax + dx * t,
            pz = az + dz * t,
            d = Math.hypot(x - px, z - pz);
        if (d < bd) {
            bd = d;
            bsh = s[i - 1].sh + (s[i].sh - s[i - 1].sh) * t;
            bgb = s[i - 1].gb + (s[i].gb - s[i - 1].gb) * t;
        }
    }
    return [bd, bsh, bgb];
}
function waterSurfaceAt(x, z) {
    const W = water();
    if (seaward(x, z) > 0 && forestGroundH(x, z) < SEA_LEVEL) return SEA_LEVEL; // Meer
    if (Math.hypot(x - W.pondLo.x, z - W.pondLo.z) < W.pondLo.rs) return W.pondLo.wh;
    if (Math.hypot(x - W.pondHi.x, z - W.pondHi.z) < W.pondHi.rs) return W.pondHi.wh;
    const s = _streamDH(x, z);
    if (s[0] < W.SW) return s[1];
    return null;
}
function waterDepress(x, z) {
    const W = water();
    let d = 0;
    const dl = Math.hypot(x - W.pondLo.x, z - W.pondLo.z);
    if (dl < W.pondLo.Rb) {
        const u = 1 - dl / W.pondLo.Rb;
        d = Math.max(d, W.pondLo.D * u * u);
    }
    const dh = Math.hypot(x - W.pondHi.x, z - W.pondHi.z);
    if (dh < W.pondHi.Rb) {
        const u = 1 - dh / W.pondHi.Rb;
        d = Math.max(d, W.pondHi.D * u * u);
    }
    const s = _streamDH(x, z);
    if (s[0] < W.CW) {
        const bed = s[1] - 0.7;
        let terr;
        if (s[0] < W.SW) {
            terr = bed;
        } else {
            const u = (s[0] - W.SW) / (W.CW - W.SW);
            terr = bed + (s[2] - bed) * u * u;
        }
        d = Math.max(d, s[2] - terr);
    }
    return d;
}
function forestGroundH(x, z) {
    return _groundBase(x, z) - waterDepress(x, z);
}
/* ===================== ECO-ENGINE v2 (headless gegen Realitaet bewiesen) ===================== */
/* ECO-PLATZIERUNG — THREE-frei, deterministisch, headless prüfbar.
   Wird 1:1 in die HTML portiert. Hier nur zur Messung gegen die Realität. */

function standDensity(x, z) {
    let d = fbm2(x * 0.014 + 30, z * 0.014 + 12) * 0.55 + fbm2(x * 0.038 + 5, z * 0.038 + 20) * 0.45;
    return clamp((d - 0.5) * 1.9 + 0.5, 0, 1);
} // glatt, NICHT übersättigt: echter Gradient Lichtung<->Kern

function slopeAt(x, z) {
    const e = 1.6;
    const hx = (forestGroundH(x + e, z) - forestGroundH(x - e, z)) / (2 * e);
    const hz = (forestGroundH(x, z + e) - forestGroundH(x, z - e)) / (2 * e);
    return { s: Math.hypot(hx, hz), gx: hx, gz: hz };
}

/* arttypischer Kronenradius (m) bei Größenfaktor 1 — Waldwuchs (schmal, Konkurrenz) */
const CROWN = PORTAL_RENDER_CONFIG.density.crown; // echter Beaestungsradius (Lichtkrone) — die EINE Quelle (Config)
const PACK = PORTAL_RENDER_CONFIG.density.pack; // Zentren >= PACK*(Ti+Tj): Kronen-Schuechternheit (aus dem Config-Block)

/* ---------- BÄUME: variabel-radius Poisson-Disc + Ökologie + Selbstausdünnung */
function plantForest(R, seedInt) {
    const rng = mulberry32(seedInt >>> 0);
    const cell = 12,
        grid = new Map(),
        trees = [];
    const K = (cx, cz) => (cx * 73856093) ^ (cz * 19349663);
    function ok(x, z, T, pk) {
        pk = pk || PACK;
        const cx = Math.floor(x / cell),
            cz = Math.floor(z / cell);
        for (let ax = -2; ax <= 2; ax++)
            for (let az = -2; az <= 2; az++) {
                const arr = grid.get(K(cx + ax, cz + az));
                if (!arr) continue;
                for (const id of arr) {
                    const t = trees[id],
                        dx = x - t.x,
                        dz = z - t.z,
                        md = (T + t.T) * pk;
                    if (dx * dx + dz * dz < md * md) return false;
                }
            }
        return true;
    }
    const darts = Math.floor(R * R * PORTAL_RENDER_CONFIG.density.dartsPerM2);
    for (let i = 0; i < darts; i++) {
        const a = rng() * 6.2831,
            rr = Math.sqrt(rng()) * R,
            x = Math.cos(a) * rr,
            z = Math.sin(a) * rr;
        if (x * x + z * z > R * R) continue;
        if (pathDist(x, z) < 3.6) continue;
        const sd = standDensity(x, z);
        if (rng() > 0.04 + 0.96 * sstep(0.18, 0.8, sd)) continue; // BIMODAL: Lichtungen wirklich leer, Kerne wirklich dicht
        const e = forestGroundH(x, z),
            wet = clamp(0.5 - e / 14, 0, 1);
        const clim = fbm2(x * 0.012 + 50, z * 0.012 + 9); // breiter Klima-/Trockengradient
        const patch = fbm2(x * 0.05 + 200, z * 0.05 + 90); // Bestands-Mosaik: Reinbestaende mit Mischsaeumen
        const open = 1 - sd,
            dry = clamp((e + 6) / 18, 0, 1),
            pf = (c) => Math.max(0, 1 - Math.abs(patch - c) / 0.14);
        let wF = (sstep(0.4, 0.8, clim) * 0.45 + dry * 0.5 + 0.04) * (0.18 + 4.8 * pf(0.15)); // Fichte: trockene Hoehen
        let wT = (sstep(0.5, 0.9, clim) * 0.38 + dry * 0.3 + 0.03) * (0.16 + 4.2 * pf(0.36)); // Tanne: hoeher/feuchter
        let wE = ((1 - dry) * 0.65 + wet * 0.35 + 0.04) * (0.18 + 4.6 * pf(0.58)); // Eiche: tiefe, feuchte Lagen
        let wB = ((0.14 + 0.45 * open) * (1 - Math.abs(clim - 0.5) * 0.9) + 0.03) * (0.2 + 3.6 * pf(0.82)); // Birke: Pionier in Luecken
        if (pathDist(x, z) < 8) wB *= 1.5; // Birke saeumt Pfade
        const _W = water(),
            _de = Math.min(
                Math.hypot(x - _W.pondLo.x, z - _W.pondLo.z) - _W.pondLo.rs,
                Math.hypot(x - _W.pondHi.x, z - _W.pondHi.z) - _W.pondHi.rs,
                _streamDH(x, z)[0] - _W.SW
            ),
            _wp = clamp(1 - Math.max(_de, 0) / 7, 0, 1);
        let wW = wet * wet * (1 - dry) * 0.8 + _wp * _wp * 6.0 + 0.01; // Weide: nur nass/tief
        const wsum = wF + wT + wE + wB + wW;
        let pick = rng() * wsum,
            sp;
        if ((pick -= wF) < 0) sp = "fichte";
        else if ((pick -= wT) < 0) sp = "tanne";
        else if ((pick -= wE) < 0) sp = "eiche";
        else if ((pick -= wB) < 0) sp = "birke";
        else sp = "weide";
        if (_de < -0.2) continue; // im offenen Wasser waechst NICHTS
        if (_de < 1.2 && sp !== "weide") continue; // nur die Weide steht im nassen Saum; der Rest wuerde versaufen -> sie verstehen das Wasser
        if (seaward(x, z) > 9 && sp !== "weide") continue; // MEER: nasser Strand-Saum -> nur Weide (Baeume kennen die Feuchtigkeit)
        // Größe: reverse-J + Selbstausdünnung (dichter Stand -> kleinere Lose; sd variiert -> echter Gradient)
        let ue = clamp(rng() * (1 - 0.52 * sd), 0, 1);
        let s = 0.55 + 1.45 * Math.pow(ue, 1.45);
        if (rng() < 0.05) s = Math.max(s, 1.3 + rng() * 0.55); // seltene Überhälter (Altbestand)
        s = clamp(s, 0.5, 1.95);
        let crown = CROWN[sp] * s;
        if (sp !== "weide" && sd > 0.72 && clim > 0.5 && rng() < 0.02) {
            sp = "mammut";
            s = 0.85 + rng() * 0.4;
            crown = CROWN.mammut * s;
        }
        const T = crown;
        if (!ok(x, z, T)) continue;
        const id = trees.length;
        trees.push({ x, z, sp, s, T, rotY: rng() * 6.2831, y: e });
        const cx = Math.floor(x / cell),
            cz = Math.floor(z / cell),
            kk = K(cx, cz);
        let arr = grid.get(kk);
        if (!arr) {
            arr = [];
            grid.set(kk, arr);
        }
        arr.push(id);
    }
    // Garantie: mind. 2 Mammutbaeume (volle Artenvielfalt sichtbar) an dichten, trockenen Stellen
    let nM = 0;
    for (const t of trees) if (t.sp === "mammut") nM++;
    for (let g = 0; g < 2500 && nM < 2; g++) {
        const a = rng() * 6.2831,
            rr = Math.sqrt(rng()) * R,
            x = Math.cos(a) * rr,
            z = Math.sin(a) * rr;
        if (pathDist(x, z) < 4 || standDensity(x, z) < 0.55 || waterSurfaceAt(x, z) !== null) continue;
        const s = 0.9 + rng() * 0.4,
            T = CROWN.mammut * s;
        let clear = true;
        const cxg = Math.floor(x / cell),
            czg = Math.floor(z / cell);
        for (let ax = -1; ax <= 1 && clear; ax++)
            for (let az = -1; az <= 1 && clear; az++) {
                const arr = grid.get(K(cxg + ax, czg + az));
                if (!arr) continue;
                for (const id2 of arr) {
                    const t = trees[id2],
                        dx = x - t.x,
                        dz = z - t.z;
                    if (dx * dx + dz * dz < 6.76) {
                        clear = false;
                        break;
                    }
                }
            }
        if (!clear) continue; // nur Stammfreiheit (Krone ragt ueber das Dach)
        const id = trees.length;
        trees.push({ x, z, sp: "mammut", s, T, rotY: rng() * 6.2831, y: forestGroundH(x, z) });
        const cx = Math.floor(x / cell),
            cz = Math.floor(z / cell),
            kk2 = K(cx, cz);
        let a2 = grid.get(kk2);
        if (!a2) {
            a2 = [];
            grid.set(kk2, a2);
        }
        a2.push(id);
        nM++;
    }
    // VERJÜNGUNG: Sämlings-Cluster um etablierte Altbäume -> natürliche Verklumpung (senkt Clark-Evans, stärkt reverse-J)
    const canopy = trees.slice();
    for (const par of canopy) {
        if (par.s < 0.55) continue;
        if (rng() > 0.82) continue;
        const nseed = 5 + Math.floor(rng() * 6);
        for (let kk2 = 0; kk2 < nseed; kk2++) {
            const ang = rng() * 6.2831,
                rad = par.T * (0.15 + rng() * 0.45);
            const x = par.x + Math.cos(ang) * rad,
                z = par.z + Math.sin(ang) * rad;
            if (x * x + z * z > R * R || pathDist(x, z) < 3.2 || waterSurfaceAt(x, z) !== null) continue;
            const sp = rng() < 0.6 ? par.sp : ["birke", "eiche", "fichte", "tanne"][Math.floor(rng() * 4)];
            const s = 0.5 + rng() * 0.24,
                T = CROWN[sp] * s;
            if (!ok(x, z, T, PACK * 0.3)) continue; // Sämlinge dürfen im Kohorten-Cluster eng stehen (Clark-Evans -> naturnah; Stammradius winzig, kein Overlap)
            const id = trees.length;
            trees.push({ x, z, sp, s, T, rotY: rng() * 6.2831, y: forestGroundH(x, z) });
            const cx = Math.floor(x / cell),
                cz = Math.floor(z / cell),
                kx = K(cx, cz);
            let arr = grid.get(kx);
            if (!arr) {
                arr = [];
                grid.set(kx, arr);
            }
            arr.push(id);
        }
    }
    // SCHATTENVERDRAENGUNG: grosse Baeume/Mammut unterdruecken kleine Nachbarn in ihrem Schatten -> Luecken & Varianz
    const kill = new Set();
    for (const big of trees) {
        const isBig = big.sp === "mammut" || big.s > 1.3;
        if (!isBig) continue;
        const shadeR = big.T * (big.sp === "mammut" ? 1.7 : 1.25),
            bcx = Math.floor(big.x / cell),
            bcz = Math.floor(big.z / cell);
        for (let dx = -2; dx <= 2; dx++)
            for (let dz = -2; dz <= 2; dz++) {
                const arr = grid.get(K(bcx + dx, bcz + dz));
                if (!arr) continue;
                for (const id of arr) {
                    const t = trees[id];
                    if (t === big || kill.has(id) || t.s >= big.s * 0.85) continue;
                    const d = Math.hypot(t.x - big.x, t.z - big.z);
                    if (d < shadeR && rng() < (1 - d / shadeR) * 0.92) kill.add(id);
                }
            }
    }
    if (kill.size) {
        const old = trees.slice();
        trees.length = 0;
        for (let i = 0; i < old.length; i++) if (!kill.has(i)) trees.push(old[i]);
        grid.clear();
        for (let i = 0; i < trees.length; i++) {
            const t = trees[i],
                cx = Math.floor(t.x / cell),
                cz = Math.floor(t.z / cell),
                kk = K(cx, cz);
            let a = grid.get(kk);
            if (!a) {
                a = [];
                grid.set(kk, a);
            }
            a.push(i);
        }
    }
    trees._grid = grid;
    trees._cell = cell;
    return trees;
}
/* ---------- Kronendach-Licht aus DEN GESETZTEN Bäumen (Licht treibt Unterwuchs) */
function canopyLight(trees) {
    const cell = trees._cell,
        grid = trees._grid,
        K = (cx, cz) => (cx * 73856093) ^ (cz * 19349663);
    return function (x, z) {
        const cx = Math.floor(x / cell),
            cz = Math.floor(z / cell);
        let cover = 0;
        for (let ax = -2; ax <= 2; ax++)
            for (let az = -2; az <= 2; az++) {
                const arr = grid.get(K(cx + ax, cz + az));
                if (!arr) continue;
                for (const id of arr) {
                    const t = trees[id],
                        dx = x - t.x,
                        dz = z - t.z,
                        cr = t.T * 1.15,
                        q = (dx * dx + dz * dz) / (cr * cr);
                    if (q < 6) cover += Math.exp(-q);
                }
            }
        return Math.exp(-cover * 0.85); // 1 = volles Licht (Lichtung), ->0 dichtes Dach
    };
}

/* ============================ STEINE: nach Geologie, nicht Zufall ============================ */
/* Blockschutt/Talus am Steilhang (geclustert, hangab), Findlinge auf sanftem Grund (isoliert),
   Aufschl\u00fcsse auf Graten (Fels bricht durch). Form folgt dem Hang. */
function placeRocks(R, seedInt, C) {
    const rng = mulberry32((seedInt ^ 0x9e3779b9) >>> 0);
    const rocks = [];
    const push = (x, z, kind, s) => {
        if (x * x + z * z > R * R) return;
        if (pathDist(x, z) < 2.2) return;
        rocks.push({ x, z, kind, s, rotY: rng() * 6.2831, y: forestGroundH(x, z) - s * 0.3 });
    }; // tiefer eingesenkt -> keine klaffende Seite, verwaechst mit dem Boden
    // 1) FINDLINGE (Eiszeit-Erratiker): einzeln, auf sanftem Grund, gross
    let tries = 0,
        placed = 0;
    while (placed < 46 && tries < 4000) {
        tries++;
        const a = rng() * 6.2831,
            rr = Math.sqrt(rng()) * R,
            x = Math.cos(a) * rr,
            z = Math.sin(a) * rr;
        const sl = slopeAt(x, z).s;
        if (sl > 0.1) continue; // nur flach (untere Hälfte)
        // Mindestabstand zu anderen Findlingen (isoliert)
        let near = false;
        for (const r of rocks)
            if (r.kind === "findling") {
                const dx = x - r.x,
                    dz = z - r.z;
                if (dx * dx + dz * dz < 22 * 22) {
                    near = true;
                    break;
                }
            }
        if (near) continue;
        push(x, z, "findling", 1.1 + rng() * 1.8);
        placed++;
    }
    // 2) BLOCKSCHUTT/TALUS: an Steilhang-Fu\u00df, Cluster F\u00e4cher hangab
    const steepSites = [];
    for (let i = 0; i < 2500 && steepSites.length < 14; i++) {
        const a = rng() * 6.2831,
            rr = Math.sqrt(rng()) * R,
            x = Math.cos(a) * rr,
            z = Math.sin(a) * rr;
        const g = slopeAt(x, z);
        if (g.s > 0.185) steepSites.push({ x, z, g }); // steilstes ~6% des Terrains
    }
    for (const site of steepSites) {
        const n = 8 + Math.floor(rng() * 16); // 8-23 Bl\u00f6cke je Cluster
        const dnx = -site.g.gx / (site.g.s + 1e-6),
            dnz = -site.g.gz / (site.g.s + 1e-6); // hangab-Richtung
        for (let k = 0; k < n; k++) {
            const along = rng() * 14,
                spread = (rng() - 0.5) * 10; // F\u00e4cher: hangab + seitlich
            const px = -dnz,
                pz = dnx; // senkrecht zur Fallinie
            const x = site.x + dnx * along + px * spread,
                z = site.z + dnz * along + pz * spread;
            push(x, z, "geroell", 0.45 + rng() * 0.95); // kleiner, kantiger Schutt
        }
    }
    // 3) AUFSCHL\u00dcSSE: Fels bricht auf Graten durch (steil UND hoch)
    const OCK = ["zacken", "basalt", "sediment"];
    let oc = 0,
        ot = 0;
    while (oc < 9 && ot < 3000) {
        ot++;
        const a = rng() * 6.2831,
            rr = Math.sqrt(rng()) * R,
            x = Math.cos(a) * rr,
            z = Math.sin(a) * rr;
        if (slopeAt(x, z).s < 0.155 || forestGroundH(x, z) < 2) continue;
        const kind = OCK[oc % 3];
        const n = kind === "basalt" ? 1 + Math.floor(rng() * 2) : 2 + Math.floor(rng() * 4);
        for (let k = 0; k < n; k++) {
            const x2 = x + (rng() - 0.5) * 7,
                z2 = z + (rng() - 0.5) * 7;
            push(x2, z2, kind, kind === "basalt" || kind === "kristalle" ? 0.94 + rng() * 0.16 : 1.0 + rng() * 1.5);
        } // Basalt/Kristall eng skaliert -> Groessenvarianz aus Template-ANZAHL
        oc++;
    }
    // KRISTALLE: sehr selten, an steinigen Stellen
    let kc = 0,
        kt = 0;
    while (kc < 5 && kt < 2500) {
        kt++;
        const a = rng() * 6.2831,
            rr = Math.sqrt(rng()) * R,
            x = Math.cos(a) * rr,
            z = Math.sin(a) * rr;
        if (rockiness(x, z) < 0.45) continue;
        const n = 1 + Math.floor(rng() * 3);
        for (let k = 0; k < n; k++) {
            const x2 = x + (rng() - 0.5) * 3,
                z2 = z + (rng() - 0.5) * 3;
            push(x2, z2, "kristalle", 0.92 + rng() * 0.2);
        }
        kc++; // eng skaliert -> Anzahl-Varianz aus Template
    }
    if (C) {
        const a = rng() * 6.2831,
            rr = 18 + rng() * 16,
            cx = C.x + Math.cos(a) * rr,
            cz = C.z + Math.sin(a) * rr;
        const n = 2 + Math.floor(rng() * 3);
        for (let k = 0; k < n; k++) {
            const x2 = cx + (rng() - 0.5) * 2.5,
                z2 = cz + (rng() - 0.5) * 2.5;
            push(x2, z2, "kristalle", 0.92 + rng() * 0.2);
        }
    } // eng skaliert -> Anzahl-Varianz aus Template
    return rocks;
}
/* ============================ UNTERWUCHS-NISCHEN: Licht entscheidet ============================ */
/* Gras = volles Licht (Lichtung); Blumen = Halbschatten/Rand (moderates Licht); Farn = Schatten unter Dach. */
function understoryNiche(L) {
    return {
        gras: clamp(Math.pow(L, 1.5) * 1.05, 0, 1), // überlinear: Gras drängt in die hellsten Flecken
        blume: sstep(0.35, 0.62, L) * (1 - sstep(0.72, 0.95, L)) * 0.7,
        farn: (1 - sstep(0.28, 0.6, L)) * sstep(0.08, 0.25, L) * 0.8,
    };
}

/* ============================ MAKROBIOM-GESETZE (v2) ============================ */
/* Substrat: wo ist der Boden steinig/kiesig statt fett? (Rauschen + Hangneigung) */
function rockiness(x, z) {
    const n = fbm2(x * 0.021 + 70, z * 0.021 + 40);
    const sl = slopeAt(x, z).s;
    return clamp(n * 0.55 + sstep(0.12, 0.28, sl) * 0.8 - 0.18, 0, 1);
}
/* Feuchte: tiefe/ebene Lagen = nass (fettes Gras), Höhe/Hang = trocken */
function moisture(x, z) {
    const e = forestGroundH(x, z);
    let m = clamp(0.55 - e / 14, 0, 1);
    const W = water();
    const dl = Math.hypot(x - W.pondLo.x, z - W.pondLo.z) - W.pondLo.rs,
        dh = Math.hypot(x - W.pondHi.x, z - W.pondHi.z) - W.pondHi.rs,
        sd = _streamDH(x, z)[0] - W.SW;
    const near = Math.min(Math.max(dl, 0), Math.max(dh, 0), Math.max(sd, 0));
    return Math.max(m, clamp(1 - near / 9, 0, 1));
}

/* WILDPFADE: wandern von einem Lichtungs-Zentrum nach aussen (Weg des geringsten Widerstands) */
function wildPaths(seedInt, C, nPaths, R) {
    const rng = mulberry32((seedInt ^ 0x5a17b3) >>> 0);
    const paths = [];
    for (let p = 0; p < nPaths; p++) {
        const pts = [[C.x, C.z]];
        let x = C.x,
            z = C.z,
            ang = (p / nPaths) * 6.2831 + rng() * 0.9;
        const steps = 16 + Math.floor(rng() * 12),
            seg = 5.5 + rng() * 3;
        for (let i = 0; i < steps; i++) {
            ang += (rng() - 0.5) * 0.7;
            // leichte Hang-Folge: Pfade weichen Steilem aus (drehen zur sanfteren Seite)
            const g = slopeAt(x, z);
            if (g.s > 0.16) {
                ang += (Math.atan2(-g.gz, -g.gx) - ang) * 0.18;
            }
            x += Math.cos(ang) * seg;
            z += Math.sin(ang) * seg;
            if (x * x + z * z > (R - 5) * (R - 5)) break;
            pts.push([x, z]);
        }
        if (pts.length > 2) paths.push(pts);
    }
    return paths;
}
function trailDist(x, z, paths) {
    let best = 1e9;
    for (const pts of paths)
        for (let i = 1; i < pts.length; i++) {
            const ax = pts[i - 1][0],
                az = pts[i - 1][1],
                dx = pts[i][0] - ax,
                dz = pts[i][1] - az,
                L2 = dx * dx + dz * dz || 1;
            let t = ((x - ax) * dx + (z - az) * dz) / L2;
            t = t < 0 ? 0 : t > 1 ? 1 : t;
            const px = ax + dx * t,
                pz = az + dz * t,
                d = Math.hypot(x - px, z - pz);
            if (d < best) best = d;
        }
    return best;
}

/* GROUND-COVER-GESETZ: aus Licht x Feuchte x Substrat x Störung wächst die Bodenschicht */
function groundCover(L, m, rk, td) {
    if (td < 3.0) return { grass: 0, flower: 0, shrub: 0, pebble: 0.2, bare: 1 }; // breiter gepflegter Pfad: nackte Erde, sichtbarer Weg
    const edge = td < 3.4 ? 0.55 : 0.3;
    const meadow = clamp(L * 1.08 - rk * 0.85 + m * 0.22, 0, 1); // hell+feucht+nicht steinig = Wiese
    return {
        grass: clamp(meadow * 1.12, 0, 1), // TEPPICH in Lichtungen
        flower: sstep(0.4, 0.7, L) * (1 - rk) * edge, // Saum/Sonne
        shrub: Math.exp(-((L - 0.4) * (L - 0.4)) / (2 * 0.16 * 0.16)) * (1 - rk) * 0.42, // Halbschatten
        pebble: clamp(rk * 1.05 - L * 0.15, 0, 1) * 0.3, // FIX v27: steinige Flecken, aber sparsam (0.55->0.30) -> kein Konfetti-Rauschen
        bare: 0,
    };
}
/* Findet ein schönes Lichtungs-Zentrum nahe dem Hauptpfad (viel Licht, nicht zu steil) */
function findClearing(trees, R, seedInt) {
    const L = canopyLight(trees);
    const rng = mulberry32((seedInt ^ 0x13c7) >>> 0);
    let best = null,
        sc = -1;
    for (let k = 0; k < 3000; k++) {
        const a = rng() * 6.2831,
            rr = Math.sqrt(rng()) * 0.5 * R,
            x = Math.cos(a) * rr,
            z = Math.sin(a) * rr;
        if (pathDist(x, z) > 20) continue;
        const sl = slopeAt(x, z).s;
        if (sl > 0.14) continue;
        if (waterSurfaceAt(x, z) !== null) continue; // Spawn nie im Wasser
        const li = L(x, z);
        const s = li - pathDist(x, z) * 0.015 - rockiness(x, z) * 0.3 - (moisture(x, z) > 0.85 ? 0.5 : 0);
        if (s > sc) {
            sc = s;
            best = { x, z };
        }
    }
    return best || { x: 0, z: 0 };
}
/* =================== ENDE ECO-ENGINE =================== */
let __forest = null;
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
    if (!_impNrmOv) _impNrmOv = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide }); // Override fuer den Normal-Pass (r128: packNormalToRGB(view-space n) -- an der three-Quelle verifiziert)
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
            tree = buildInstance(s.sp, s.seed, 1, { crownBase: s.crownBase, trunkMul: s.trunkMul });
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
    renderer.setViewport(0, 0, innerWidth, innerHeight);
    renderer.setClearColor(0x000000, pA);
    WIND.uTime.value = pT;
    SEASON.uLeafPresence.value = pPres;
    _impBakedSig = sig;
}
function buildForest() {
    if (typeof _lvCache !== "undefined") _lvCache.clear(); // neue Kronen -> Zyklus-Speicher ungueltig
    forestGroup = new THREE.Group();
    scene.add(forestGroup);
    _grassTiles = [];
    _treeLOD = [];
    _waterMeshes = [];
    _taaReset = true; // FIX v38: neue Insel = frische TAA-Historie (sonst 1 Frame geklemmte Alt-Reprojektion)
    const R = typeof _TEST_R !== "undefined" && _TEST_R > 0 ? _TEST_R : 64,
        TS = 192,
        SEG = 118,
        SEEDI = Math.floor(SEED) >>> 0;
    const rebuildGrid = (arr) => {
        const cell = 12,
            grid = new Map(),
            K = (cx, cz) => (cx * 73856093) ^ (cz * 19349663);
        for (let i = 0; i < arr.length; i++) {
            const t = arr[i],
                cx = Math.floor(t.x / cell),
                cz = Math.floor(t.z / cell),
                k = K(cx, cz);
            let a = grid.get(k);
            if (!a) {
                a = [];
                grid.set(k, a);
            }
            a.push(i);
        }
        arr._grid = grid;
        arr._cell = cell;
    };

    // 1) Baeume oekologisch + Licht + Lichtung + Wildpfade frei schneiden
    let trees = plantForest(R, SEEDI);
    _forestTrees = trees;
    const C = findClearing(trees, R, SEEDI);
    const paths = wildPaths(SEEDI, C, 4, R);
    const GLADE = 22; // grosse Lichtung zum Bestaunen
    trees = trees.filter((t) => {
        if (Math.hypot(t.x - C.x, t.z - C.z) < GLADE - t.T * 0.3) return false; // Lichtung freihalten
        if (trailDist(t.x, t.z, paths) < 3.2 + t.T * 0.12) return false; // breite, gepflegte Pfad-Korridore, immer frei
        if (waterSurfaceAt(t.x, t.z) !== null) return false; // keine Baeume im Wasser
        if (inCaveZone(t.x, t.z)) return false; // keine Baeume in der Hoehle
        return true;
    });
    // KEIN kuenstliches Auslichten mehr: die Lichtkonkurrenz (PACK/CROWN) + Schattenverdraengung bestimmen die Dichte
    rebuildGrid(trees);
    const light = canopyLight(trees);

    // schnelle Feld-Lookups (1.5 m) -> Build bleibt fluessig
    const LG = 1.5,
        gw = Math.ceil((2 * R) / LG) + 2,
        NF = gw * gw;
    const lgrid = new Float32Array(NF),
        tgrid = new Float32Array(NF),
        rgrid = new Float32Array(NF),
        mgrid = new Float32Array(NF);
    for (let iz = 0; iz < gw; iz++)
        for (let ix = 0; ix < gw; ix++) {
            const x = -R + ix * LG,
                z = -R + iz * LG,
                o = iz * gw + ix;
            lgrid[o] = light(x, z);
            tgrid[o] = trailDist(x, z, paths);
            rgrid[o] = rockiness(x, z);
            mgrid[o] = moisture(x, z);
        }
    const samp = (g, x, z) => {
        let ix = Math.round((x + R) / LG),
            iz = Math.round((z + R) / LG);
        if (ix < 0) ix = 0;
        if (iz < 0) iz = 0;
        if (ix >= gw) ix = gw - 1;
        if (iz >= gw) iz = gw - 1;
        return g[iz * gw + ix];
    };
    const lightAt = (x, z) => samp(lgrid, x, z),
        trailAt = (x, z) => samp(tgrid, x, z),
        rockAt = (x, z) => samp(rgrid, x, z),
        moistAt = (x, z) => samp(mgrid, x, z);

    // 2) Terrain (Farbe aus Standdichte, Hang, Substrat, Pfaden)
    const tg = new THREE.PlaneGeometry(TS, TS, SEG, SEG),
        tp = tg.attributes.position,
        tcol = [];
    const cLit = new THREE.Color(PORTAL_GROUND.lit),
        cMead = new THREE.Color(PORTAL_GROUND.mead),
        cDirt = new THREE.Color(PORTAL_GROUND.dirt),
        cRock = new THREE.Color(PORTAL_GROUND.rock),
        cWet = new THREE.Color(PORTAL_GROUND.wet),
        cSand = new THREE.Color(PORTAL_GROUND.sand);
    for (let i = 0; i < tp.count; i++) {
        const lx = tp.getX(i),
            ly = tp.getY(i),
            wx = lx,
            wz = -ly;
        tp.setZ(i, forestGroundH(wx, wz));
        const sd = standDensity(wx, wz),
            rk = rockiness(wx, wz),
            sl = slopeAt(wx, wz).s,
            pd = Math.min(pathDist(wx, wz), trailAt(wx, wz));
        const c = cMead.clone().lerp(cLit, sstep(0.3, 0.8, sd));
        c.lerp(cRock, Math.max(sstep(0.16, 0.3, sl), sstep(0.5, 0.85, rk) * 0.7));
        if (pd < 3.4) c.lerp(cDirt, sstep(3.4, 0.4, pd));
        c.multiplyScalar(0.58 + 0.46 * lightAt(wx, wz)); // FIX v27: GEBACKENES KRONENDACH-LICHT — lgrid existiert schon (Unterwuchs-Treiber), floss aber nie in die Bodenfarbe. Jetzt: Bestandeskern dunkel, Lichtung hell -> die Baeume werfen sichtbaren Makro-Schatten in die Albedo, unabhaengig von der Shadow-Map. Kostet 0 zur Laufzeit.
        const mw = moistAt(wx, wz);
        if (mw > 0.78) c.lerp(cWet, (mw - 0.78) * 3.2); // nasses, dunkles Ufer am Wasser
        const swc = seaward(wx, wz);
        if (swc > -5) {
            const sandAmt = clamp(1 - (forestGroundH(wx, wz) - SEA_LEVEL) / 4.5, 0, 1) * clamp((swc + 5) / 7, 0, 1);
            c.lerp(cSand, sandAmt * 0.9);
        } // STRAND: Boden weiss dass er Sand ist
        tcol.push(c.r, c.g, c.b);
    }
    tg.setAttribute("color", new THREE.Float32BufferAttribute(tcol, 3));
    tg.computeVertexNormals();
    const terMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.94,
        metalness: 0,
        envMapIntensity: 0.12,
    });
    _terMat = terMat; // GEMESSEN: env0.28=28% Schatten-Drop (unsichtbar) -> env0.12 ~50% Drop auf hellem Sand. ACES staucht sonst den Kontrast weg.
    terMat.onBeforeCompile = (sh) => {
        sh.vertexShader =
            "varying vec3 vWP;\n" +
            sh.vertexShader.replace(
                "#include <begin_vertex>",
                "#include <begin_vertex>\n vWP=(modelMatrix*vec4(transformed,1.0)).xyz;"
            );
        const NOISE =
            "float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);} float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);float a=h21(i),b=h21(i+vec2(1.,0.)),c=h21(i+vec2(0.,1.)),d=h21(i+vec2(1.,1.));return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);} float fbmT(vec2 p){return vn(p)*0.55+vn(p*2.3)*0.28+vn(p*5.1)*0.17;}";
        sh.fragmentShader =
            "varying vec3 vWP;\n" +
            NOISE +
            "\n" +
            sh.fragmentShader
                .replace(
                    "#include <color_fragment>",
                    "#include <color_fragment>\n {float _b=fbmT(vWP.xz*0.42); diffuseColor.rgb*=(0.80+0.42*_b);}"
                ) // breite Ton-Variation (Mulden dunkler, Kuppen heller)
                .replace(
                    "#include <normal_fragment_begin>",
                    "#include <normal_fragment_begin>\n {float e=0.4; vec2 q=vWP.xz*1.6; float h0=fbmT(q),hx=fbmT(q+vec2(e,0.)),hz=fbmT(q+vec2(0.,e)); vec2 gr=vec2(hx-h0,hz-h0)/e; vec3 dN=(viewMatrix*vec4(-gr.x,0.0,-gr.y,0.0)).xyz; normal=normalize(normal+dN*0.45);}"
                ); // feine Mikro-Relief-Normalen -> Boden bekommt Koernung/Tiefe
    };
    terMat.customProgramCacheKey = () => "terrain_bump_v1";
    const terrain = new THREE.Mesh(tg, terMat);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    forestGroup.add(terrain);

    // 2b) WASSER: zwei Teiche + Bach. Lebendige Oberflaeche - animierte Wellen-NORMALEN (bewegte Himmelsspiegelung + Sonnenfunkeln); Bach hat Fliessrichtung.
    {
        const W = water();
        const mkWaterMat = (flow, center, Rb, seaMode) => {
            const mat = new THREE.MeshStandardMaterial({
                color: 0x20444d,
                transparent: true,
                opacity: 0.92,
                roughness: 0.13,
                metalness: 0.0,
                emissive: 0x05121a,
                depthWrite: false,
                side: THREE.DoubleSide,
            });
            mat.onBeforeCompile = (sh) => {
                sh.uniforms.uTime = WIND.uTime;
                sh.uniforms.uFlow = { value: flow };
                sh.uniforms.uCenter = { value: center };
                sh.uniforms.uRb = { value: Rb };
                sh.uniforms.uSeaMode = { value: seaMode ? 1.0 : 0.0 };
                sh.uniforms.uReflMap = _reflU.uReflMap;
                sh.uniforms.uReflMatrix = _reflU.uReflMatrix;
                sh.uniforms.uReflMix = _reflU.uReflMix;
                sh.uniforms.uSkyCol = _reflU.uSkyCol;
                sh.uniforms.uWind = _reflU.uWind;
                sh.uniforms.uSunDirW = _reflU.uSunDirW;
                sh.uniforms.uSunColW = _reflU.uSunColW;
                sh.vertexShader =
                    "varying vec3 vWPos;\n" +
                    hookReplace(
                        sh.vertexShader,
                        "#include <begin_vertex>",
                        "#include <begin_vertex>\n vWPos=(modelMatrix*vec4(transformed,1.0)).xyz;",
                        "water-vert"
                    );
                sh.fragmentShader =
                    "uniform float uTime; uniform vec2 uFlow; uniform vec2 uCenter; uniform float uRb; uniform float uSeaMode; uniform sampler2D uReflMap; uniform mat4 uReflMatrix; uniform float uReflMix; uniform vec3 uSkyCol; uniform float uWind; uniform vec3 uSunDirW; uniform vec3 uSunColW; varying vec3 vWPos;\n" +
                    hookReplace(
                        sh.fragmentShader,
                        "gl_FragColor = vec4( outgoingLight, diffuseColor.a );",
                        "float depth01 = uRb>0.1 ? clamp(1.0-length(vWPos.xz-uCenter)/uRb,0.0,1.0) : 0.42; depth01=pow(depth01,0.7); if(uSeaMode>0.5){ float sward=length(vWPos.xz)-" +
                            COAST_D.toFixed(1) +
                            "; if(sward<-4.0)discard; depth01=pow(clamp((sward-12.0)/18.0,0.0,1.0),0.85); } vec2 fl=uFlow*uTime*1.2; float whgt=0.0; vec2 grad=vec2(0.0); float kf=0.17, aw=1.5, om=0.55; for(int o=0;o<4;o++){ float tx=kf*(vWPos.x-fl.x)+uTime*om; float ty=kf*1.13*(vWPos.z-fl.y)-uTime*om*0.9; whgt+=aw*(sin(tx)+sin(ty)); grad+=aw*kf*vec2(cos(tx),1.13*cos(ty)); kf*=2.2; aw*=0.6; om*=1.4832; }   /* WELLEN-GESETZ: spektrale Kaskade (k_n=k0*L^n, a_n=a0*g^n) + Tiefwasser-Dispersion (om_n=om0*sqrt(L)^n). L=2.2 g=0.6 */ float amp=mix(0.16,0.40,depth01)*(0.7+0.9*uWind); vec3 wn=normalize(vec3(-grad.x*amp,1.0,-grad.y*amp)); vec3 Vd=normalize(cameraPosition-vWPos); float ndv=clamp(dot(wn,Vd),0.0,1.0); float fres=0.02+0.98*pow(1.0-ndv,5.0); vec3 Rd=reflect(-Vd,wn); float upY=clamp(Rd.y*0.5+0.5,0.0,1.0); vec3 skyCol=mix(uSkyCol,uSkyCol*0.68,upY); vec4 rc=uReflMatrix*vec4(vWPos,1.0); vec2 ruv=rc.xy/max(rc.w,0.0001); ruv+=wn.xz*0.13; vec3 mirr=texture2D(uReflMap,clamp(ruv,0.001,0.999)).rgb; vec3 reflCol=mix(skyCol,mirr,uReflMix); vec3 wK=vec3(6.5,2.0,1.2); vec3 shallowC=exp(-wK*0.13), deepC=exp(-wK*0.85); vec3 wcol=mix(shallowC,deepC,depth01); vec3 Ld=uSunDirW; float spec=pow(max(dot(reflect(-Ld,wn),Vd),0.0),120.0); float diff=max(dot(wn,Ld),0.0); vec3 outc=mix(wcol,reflCol,fres); outc*=(0.86+0.18*diff+0.08*whgt); outc+=uSunColW*spec*1.35; float walpha=clamp(mix(0.55,0.95,depth01)+fres*0.32,0.0,1.0); walpha*=smoothstep(0.0,0.06,depth01);   /* weicher Auslauf am Rand: keine harte Naht */ float edgeFoam=smoothstep(0.26,0.0,depth01); float crestFoam=smoothstep(1.8,2.7,whgt); float foam=clamp(edgeFoam*(0.5+0.5*sin(whgt*4.0+uTime*2.8))+crestFoam*0.6,0.0,0.85); outc=mix(outc,vec3(0.93,0.96,0.98),foam); walpha=max(walpha,foam*0.95); gl_FragColor=vec4(outc, walpha);",
                        "water-frag"
                    );
            };
            mat.customProgramCacheKey = () => "water_depth_v7";
            return mat;
        };
        const mkPond = (p) => {
            const m = new THREE.Mesh(
                new THREE.CircleGeometry(p.rs + 0.8, 56),
                mkWaterMat(new THREE.Vector2(0, 0), new THREE.Vector2(p.x, p.z), p.Rb)
            );
            m.rotation.x = -Math.PI / 2;
            m.position.set(p.x, p.wh, p.z);
            m.renderOrder = 3;
            forestGroup.add(m);
            _waterMeshes.push(m);
        };
        mkPond(W.pondLo);
        mkPond(W.pondHi);
        {
            // MEER RUNDHERUM: die Welt ist eine Insel. Eine zentrierte Platte auf Meeresspiegel; landwaerts clippt der Shader (sward<-4), Brandung am Strand (Schaum aus depth01)
            const seaMat = mkWaterMat(new THREE.Vector2(0.05, 0.05), new THREE.Vector2(0, 0), 0.0, true);
            const sea = new THREE.Mesh(new THREE.PlaneGeometry(560, 560, 1, 1), seaMat);
            sea.rotation.x = -Math.PI / 2;
            sea.position.set(0, SEA_LEVEL, 0);
            sea.renderOrder = 2;
            sea.frustumCulled = false;
            forestGroup.add(sea);
            _waterMeshes.push(sea);
        }
        const fdx = W.pondLo.x - W.pondHi.x,
            fdz = W.pondLo.z - W.pondHi.z,
            fl = Math.hypot(fdx, fdz) || 1; // Fliessrichtung oben->unten
        const streamMat = mkWaterMat(new THREE.Vector2(fdx / fl, fdz / fl), new THREE.Vector2(0, 0), 0.0);
        const s = W.stream,
            hw = W.CW,
            vpos = [],
            idx = [];
        for (let i = 0; i < s.length; i++) {
            const a = s[Math.max(0, i - 1)],
                b = s[Math.min(s.length - 1, i + 1)];
            let dx = b.x - a.x,
                dz = b.z - a.z,
                l = Math.hypot(dx, dz) || 1;
            dx /= l;
            dz /= l;
            const nx = -dz,
                nz = dx;
            const endDip = i === 0 || i === s.length - 1 ? -0.09 : 0.03;
            const wl = s[i].sh + endDip,
                lx = s[i].x + nx * hw,
                lz = s[i].z + nz * hw,
                rx = s[i].x - nx * hw,
                rz = s[i].z - nz * hw;
            const lyE = Math.min(wl, forestGroundH(lx, lz) - 0.25),
                ryE = Math.min(wl, forestGroundH(rx, rz) - 0.25); // Raender unters Gelaende -> Tiefentest verdeckt sie ueberall (kein fliegendes Ufer)
            vpos.push(lx, lyE, lz);
            vpos.push(s[i].x, wl, s[i].z);
            vpos.push(rx, ryE, rz);
        } // 3 Stuetzpunkte je Querschnitt: Rand-Mitte-Rand
        for (let i = 0; i < s.length - 1; i++) {
            const a = i * 3;
            idx.push(a, a + 1, a + 3, a + 1, a + 4, a + 3, a + 1, a + 2, a + 4, a + 2, a + 5, a + 4);
        }
        const sg = new THREE.BufferGeometry();
        sg.setAttribute("position", new THREE.Float32BufferAttribute(vpos, 3));
        sg.setIndex(idx);
        sg.computeVertexNormals();
        const sm = new THREE.Mesh(sg, streamMat);
        sm.renderOrder = 2;
        forestGroup.add(sm);
        _waterMeshes.push(sm);
    }

    // (Berg entfernt)

    // 3) Templates: WENIGE pro Art (Batching). FLOD2 = leicht.
    const FLOD = 0; // feine Stufe -> saubere Baeume aus der Naehe (NICHT die grobe Fernsicht-LOD)
    const CB = { eiche: 0.42, fichte: 0.3, birke: 0.42, weide: 0.4, tanne: 0.3, mammut: 0.46 }; // Stamm freistellen (Selbstastung im Wald)
    const TMUL = 0.5; // Stamm schlanker (Wald-Realismus; Studio unberuehrt)
    const poolL = [{}, {}];
    /* L2-Mesh-Pool gestrichen: Fernstufe IST das Billboard (tote Fracht seit der Impostor-Aera) */ const mp = (
        sp,
        n
    ) => {
        const seeds = [];
        for (let i = 0; i < n; i++) seeds.push(Math.floor(RNG() * 1e6));
        for (let L = 0; L < 2; L++)
            poolL[L][sp] = seeds.map((sd) => {
                const g = buildInstance(sp, sd, L, { crownBase: CB[sp], trunkMul: TMUL });
                g.userData.seed = sd;
                return g;
            });
    }; // 3 LOD-Stufen, gleiche Seeds -> selber Baum, andere Detailtiefe
    mp("eiche", 2);
    mp("fichte", 2);
    mp("birke", 2);
    mp("tanne", 2);
    mp("weide", 1);
    mp("mammut", 1);
    // Impostor-Baubeschreibung fuer JEDE (Art,Variante)-Kombination sichern -> Fern-Billboard = derselbe Baum wie das 3D-LOD, kein generischer Ersatz
    _impSpecs = [];
    _impCellOf = {};
    for (const sp of Object.keys(poolL[0])) {
        poolL[0][sp].forEach((tmpl, v) => {
            _impCellOf[sp + "|" + v] = _impSpecs.length;
            _impSpecs.push({ sp, seed: tmpl.userData.seed, crownBase: CB[sp], trunkMul: TMUL });
        });
    }
    // LOD-WURZEL (08.07.) — DIE STUFEN-WAHRHEIT JE ART AUS DEN VERTRAGS-DATEN
    // (PORTAL_RENDER_CONFIG.lod.kindStages): Gras + Strauch sind ZWEISTUFIG —
    // nah die reiche Stufe (stages[0]), fern die kompensierte billige
    // (stages[letzte]; die Rezepte tragen die Breiten-/Form-Kompensation).
    // FORM-IDENTITAET: nah/fern eines Templates teilen DENSELBEN Seed (kein
    // Gestalt-Sprung am Stufenwechsel); die RNG()-Aufrufzahl bleibt EXAKT die
    // alte (ein Wurf je Template-Variante) — der ganze Wald wuerfelt unveraendert.
    const _KS = (PORTAL_RENDER_CONFIG.lod && PORTAL_RENDER_CONFIG.lod.kindStages) || {};
    const _ksN = (k, d) => (_KS[k] && _KS[k].length ? _KS[k][0] : d) | 0;
    const _ksF = (k, d) => (_KS[k] && _KS[k].length ? _KS[k][_KS[k].length - 1] : d) | 0;
    const _shrubSeed = Math.floor(RNG() * 1e6);
    const shrubT = [buildInstance("strauch", _shrubSeed, _ksN("shrub", 2))];
    const shrubTF = [buildInstance("strauch", _shrubSeed, _ksF("shrub", 2))];
    const _grasSeedA = Math.floor(RNG() * 1e6),
        _grasSeedB = Math.floor(RNG() * 1e6);
    const grassT = [
        buildInstance("gras", _grasSeedA, _ksN("grass", 2)),
        buildInstance("gras", _grasSeedB, _ksN("grass", 2)),
    ];
    const grassTF = [
        buildInstance("gras", _grasSeedA, _ksF("grass", 2)),
        buildInstance("gras", _grasSeedB, _ksF("grass", 2)),
    ];
    const flowerT = [
        buildInstance("blume", Math.floor(RNG() * 1e6), 0),
        buildInstance("blume", Math.floor(RNG() * 1e6), 0),
    ];
    const findlingT = [buildInstance("findling", Math.floor(RNG() * 1e6), 0)];
    const zackenT = [0.55, 1.0, 1.7].map((cm) => buildInstance("zacken", Math.floor(RNG() * 1e6), 0, { amtMul: cm })); // 3 Groessen via ANZAHL (greift fuer jede Geologie)
    const pebbleT = [
        buildInstance("zacken", Math.floor(RNG() * 1e6), 2, {
            detail: 1,
            rockA: 0x4a463f,
            rockB: 0x2a2823,
            rockC: 0x565049,
            speckle: false,
        }),
    ]; // FIX v27: eigenes KIESEL-Template — detail 1 statt 6 (~20 statt ~300 Verts fuer 5cm), dunkler & matt -> liest als Kiesel im Boden, nicht als weisses Konfetti auf dem Sand
    const basaltT = [0.55, 1.0, 1.7].map((cm) => buildInstance("basalt", Math.floor(RNG() * 1e6), 0, { amtMul: cm })); // 3 Formationsgroessen: ANZAHL Komponenten variiert, Einzelgroesse konstant
    const sedimentT = [0.55, 1.0, 1.7].map((cm) =>
        buildInstance("sediment", Math.floor(RNG() * 1e6), 0, { amtMul: cm })
    );
    const kristalleT = [0.6, 1.0, 1.7].map((cm) =>
        buildInstance("kristalle", Math.floor(RNG() * 1e6), 0, { amtMul: cm })
    ); // 3 Clustergroessen: ANZAHL Kristalle variiert, Einzelgroesse konstant
    // NERVENSYSTEM — die EINE Platzierungs-Quelle: die Welt-Skalen leben in
    // PORTAL_RENDER_CONFIG.placement (foundry-core.js, die geteilte Datei), NICHT mehr als
    // lokales Literal. Der Studio-Wald liest sie hier, AnazhRealm liest DIESELBEN Werte ueber
    // die get-render-config-Bruecke — ein Edit dort skaliert BEIDE Welten.
    const _PL = PORTAL_RENDER_CONFIG.placement || {};
    const SCALE = Object.assign({}, _PL.scale);
    const TREE_SCALE_MUL = typeof _PL.treeScaleMul === "number" ? _PL.treeScaleMul : 0.82;

    // 4) compose + EIN Instanced-Mesh pro Template-Submesh (kein Tiling -> wenige Draw-Calls)
    const _dq = new THREE.Quaternion(),
        _de = new THREE.Euler(),
        _dp = new THREE.Vector3(),
        _ds = new THREE.Vector3(),
        _dm = new THREE.Matrix4();
    const compose = (x, y, z, ry, s) => {
        _dp.set(x, y, z);
        _de.set(0, ry, 0);
        _dq.setFromEuler(_de);
        _ds.set(s, s, s);
        _dm.compose(_dp, _dq, _ds);
        return _dm;
    };
    let drawMeshes = 0;
    const instAdd = (variants, plByVar, shadow) => {
        for (let v = 0; v < variants.length; v++) {
            const pls = plByVar[v];
            if (!pls || !pls.length) continue;
            const dy = variants[v].position.y;
            variants[v].traverse((o) => {
                if (o.isMesh) {
                    const geo = o.geometry.clone();
                    if (dy) geo.translate(0, dy, 0);
                    const im = new THREE.InstancedMesh(geo, o.material, pls.length);
                    for (let j = 0; j < pls.length; j++) {
                        const p = pls[j];
                        im.setMatrixAt(j, compose(p.x, p.y, p.z, p.rotY, p.s));
                    }
                    im.instanceMatrix.needsUpdate = true;
                    im.frustumCulled = false;
                    im.castShadow = !!shadow;
                    im.receiveShadow = true;
                    forestGroup.add(im);
                    drawMeshes++;
                }
            });
        }
    };
    const hash01 = (i) => {
        let n = Math.imul(i ^ 0x9e3779b9, 2654435761);
        n ^= n >>> 15;
        return (n >>> 0) / 4294967296;
    };
    // ★ KACHEL-INSTANZIERUNG: dichte Bodenschichten in 12m-Kacheln, jede mit EIGENER enger Welt-Kugel -> Three cullt jede Kachel
    // einzeln aus dem Frustum. Instanzen bleiben in WELT-Koordinaten (Wind-Phase korrekt, keine Nahtkanten zwischen Kacheln).
    const TILE = 12;
    // LOD-WURZEL (08.07.): `stage` macht eine Kachel-Schicht zweistufig — "near" traegt die
    // reiche Stufe bis LOD_D0(+Ueberlapp), "far" die kompensierte billige dahinter bis zum
    // Art-Limit; "single" = das alte Verhalten. Beide Stufen teilen PLACEMENTS + Seed
    // (Form-Identitaet), der Ueberlapp (±2 m) ersetzt die Hysterese (kein Loch, kein
    // Flackern — die Baum-Membership-Idee auf Kachel-Granularitaet).
    const addTiled = (variants, plByVar, kind, stage) => {
        for (let v = 0; v < variants.length; v++) {
            const pls = plByVar[v];
            if (!pls || !pls.length) continue;
            const dy = variants[v].position.y,
                subs = [];
            variants[v].traverse((o) => {
                if (o.isMesh) subs.push(o);
            });
            const buckets = new Map();
            for (const p of pls) {
                const tx = Math.floor(p.x / TILE),
                    tz = Math.floor(p.z / TILE),
                    k = tx * 1000 + tz;
                let b = buckets.get(k);
                if (!b) {
                    b = { it: [], cx: (tx + 0.5) * TILE, cz: (tz + 0.5) * TILE };
                    buckets.set(k, b);
                }
                b.it.push(p);
            }
            for (const b of buckets.values()) {
                let miny = 1e9,
                    maxy = -1e9;
                for (const p of b.it) {
                    if (p.y < miny) miny = p.y;
                    if (p.y > maxy) maxy = p.y;
                }
                const cy = (miny + maxy) / 2,
                    ry = (maxy - miny) / 2 + 1.5,
                    rad = Math.sqrt(TILE * TILE * 0.5 + ry * ry) + 1.5;
                const bs = new THREE.Sphere(new THREE.Vector3(b.cx, cy, b.cz), rad); // WELT-Kugel genau um diese Kachel
                for (const o of subs) {
                    const geo = o.geometry.clone();
                    if (dy) geo.translate(0, dy, 0);
                    geo.boundingSphere = bs.clone();
                    const im = new THREE.InstancedMesh(geo, o.material, b.it.length);
                    const isGrassSub = o.material === grassMat,
                        tint = isGrassSub ? new Float32Array(b.it.length * 3) : null; // FIX v27: Gras-Tint pro Halm aus dem Standort
                    const _jh = (x, z) => {
                        let n = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
                        return n - Math.floor(n);
                    };
                    for (let j = 0; j < b.it.length; j++) {
                        const p = b.it[j];
                        im.setMatrixAt(j, compose(p.x, p.y, p.z, p.rotY, p.s));
                        if (isGrassSub) {
                            const lit = lightAt(p.x, p.z),
                                wet = moistAt(p.x, p.z),
                                jt = _jh(p.x, p.z) - 0.5;
                            const val = (lit - 0.5) * 0.45 + jt * 0.18,
                                warm = (clamp(lit * 0.5 + (1 - wet) * 0.5, 0, 1) - 0.5) * 0.24; // hell+trocken -> waermeres Oliv; Schatten/nass -> tiefes kuehles Gruen; +Helligkeits-Jitter pro Halm
                            tint[j * 3] = val + warm;
                            tint[j * 3 + 1] = val + warm * 0.35;
                            tint[j * 3 + 2] = val - warm * 0.8 + (wet - 0.5) * 0.12;
                        }
                    }
                    if (isGrassSub) geo.setAttribute("aTintI", new THREE.InstancedBufferAttribute(tint, 3));
                    im.instanceMatrix.needsUpdate = true;
                    im.frustumCulled = true;
                    im.receiveShadow = true; // <-- DER HEBEL
                    im.userData.tcx = b.cx;
                    im.userData.tcz = b.cz;
                    im.userData.tileKind = kind;
                    im.userData.tileStage = stage || "single";
                    forestGroup.add(im);
                    drawMeshes++;
                    _grassTiles.push(im);
                }
            }
        }
    };

    // 5) IMPOSTOR-Material EINMAL — LOD2 jedes Baums ist sein kamerazugewandtes Billboard an SEINER festen Position (SpeedTree)
    bakeImpostorAtlas();
    if (!_impGeo) {
        _impGeo = new THREE.PlaneGeometry(1, 1);
        _impGeo.translate(0, 0.5, 0);
    }
    _impMat = new THREE.ShaderMaterial({
        uniforms: {
            map: { value: _impAtlas },
            nmap: { value: _impNrm },
            uK: { value: _impK },
            uV: { value: _impV },
            uFogColor: { value: new THREE.Color(0xa6bcc6) },
            uFogNear: { value: 42.0 },
            uFogFar: { value: 120.0 },
            uSunDir: { value: new THREE.Vector3(0.5, 0.8, 0.4) },
            uSunCol: { value: new THREE.Color(1, 0.95, 0.85) },
            uHemiCol: { value: new THREE.Color(0.2, 0.22, 0.24) },
            uTime: { value: 0 },
            uWind: { value: 0.1 },
            uWindDir: { value: WIND.uWindDir.value },
            uFade: { value: LOD_FADE },
            uD1: { value: LOD_D1 },
            uPres: SEASON.uLeafPresence,
            uSeasonMul: SEASON.uSeasonMul,
            uLodMaskOn: _lodU.uLodMaskOn,
            uLodRef: _lodU.uLodRef,
            uDitherT: _lodU.uDitherT,
        },
        vertexShader:
            "uniform float uFogNear,uFogFar,uK,uTime,uWind,uLodRef;uniform vec3 uWindDir;attribute float aCell;attribute float aDepthBias;attribute float aOccl;varying float vOcc;varying vec2 vUv;varying float vFog;varying float vCD;varying float vView;varying vec3 vLk;varying vec3 vRt;varying vec3 vTintI;void main(){vOcc=aOccl;vUv=vec2((uv.x+aCell)/uK,uv.y);vec3 inst=instanceMatrix[3].xyz;float _th=fract(sin(dot(inst.xz,vec2(127.1,311.7)))*43758.5453);float _th2=fract(sin(dot(inst.xz,vec2(269.5,183.3)))*43758.5453);float _lu=(_th-0.5)*0.22,_hu=(_th2-0.5)*0.18;vTintI=vec3(_lu+_hu*0.6,_lu,_lu-_hu*0.6);float sx=length(instanceMatrix[0].xyz),sy=length(instanceMatrix[1].xyz);float aRot=atan(-instanceMatrix[0].z,instanceMatrix[0].x);vec3 up=vec3(0.0,1.0,0.0);vec3 look=cameraPosition-inst;look.y=0.0;float ll=length(look);float szV=length(instanceMatrix[2].xyz);vCD=ll*min(uLodRef/max(szV,0.001),1.0);look=(ll>1e-4)?look/ll:vec3(0.0,0.0,1.0);vLk=look;float ang=atan(look.x,look.z);vView=fract((ang-aRot)/6.2831853+1.0);vec3 right=normalize(cross(up,look));vRt=right;vec3 wp=inst+right*(position.x*sx)+up*(position.y*sy);float sway=sin(uTime*1.7+inst.x*0.35+inst.z*0.27)*position.y*position.y*sy*0.012*(0.4+1.2*uWind);wp.xz+=uWindDir.xz*sway;vec4 mv=viewMatrix*vec4(wp,1.0);mv.z-=aDepthBias;vFog=clamp((-mv.z-uFogNear)/(uFogFar-uFogNear),0.0,1.0);gl_Position=projectionMatrix*mv;}" /* aRot aus T*Ry*S dekodiert; sway: Kronenspitze (y^2) pendelt in Windrichtung; vRt/vLk = Zell-Rahmen; FIX v27 vTintI = derselbe Positions-Hash wie das 3D-Laub -> Kronenfarbe konstant ueber L0/L1/L2 */,
        fragmentShader:
            "uniform sampler2D map,nmap;uniform vec3 uFogColor,uSunDir,uSunCol,uHemiCol,uSeasonMul;uniform float uFade,uV,uD1,uPres,uLodMaskOn,uDitherT;varying vec2 vUv;varying float vFog;varying float vCD;varying float vView;varying vec3 vLk;varying vec3 vRt;varying vec3 vTintI;varying float vOcc;void main(){float fV=vView*uV;float v0=floor(fV);float fb=fract(fV);float v1=mod(v0+1.0,uV);vec2 uvA=vec2(vUv.x,(vUv.y+v0)/uV),uvB=vec2(vUv.x,(vUv.y+v1)/uV);vec4 t=mix(texture2D(map,uvA),texture2D(map,uvB),fb);float fin=clamp((vCD-(uD1-uFade))/uFade,0.0,1.0);float ath=0.34+(1.0-clamp(uPres,0.0,1.0))*0.5;if(t.a<ath)discard;if(uLodMaskOn>0.5){float _dh=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(0.06711056,0.00583715)))+uDitherT);if(max(min(fin*2.0,1.0),vOcc)<_dh)discard;}vec3 nc=mix(texture2D(nmap,uvA).xyz,texture2D(nmap,uvB).xyz,fb)*2.0-1.0;vec3 N=normalize(vRt*nc.x+vec3(0.0,1.0,0.0)*nc.y+vLk*nc.z);float lam=clamp((dot(N,uSunDir)+0.18)/1.18,0.0,1.0);float sunW=mix(0.34,1.0,lam);vec3 alb=t.rgb*mix(vec3(1.0),uSeasonMul,0.8)*clamp(vec3(1.0)+vTintI,0.0,2.0);vec3 lit=alb*(uHemiCol+uSunCol*sunW);vec3 c=mix(lit,uFogColor,vFog*0.9);gl_FragColor=vec4(c,1.0);}" /* SAISONINVARIANTER ATLAS + FIX v27 Per-Baum-Tint (gleicher Hash wie 3D) -> kein Hue-Pop beim L1->L2-Uebergang */,
        side: THREE.DoubleSide,
        transparent: false,
        depthTest: true,
        depthWrite: true,
    });
    // BAEUME, per-Baum-LOD: L0 <20m voll-3D, L1 20-40m mittel-3D, L2 >40m Impostor-Billboard AN DER BAUMPOSITION, Cross-Fade per Dither im Uebergangsband
    for (const sp in poolL[0]) {
        const nVar = poolL[0][sp].length;
        const H0arr = poolL[1][sp].map((g) => {
            const b = new THREE.Box3().setFromObject(g);
            return Math.max(0.1, b.max.y - b.min.y);
        }); // FIX v26: Hoehe aus L1 (dem LOD, aus dem bakeImpostorAtlas rastert), NICHT L0. Sonst bekommt das Billboard-Quad die L0-Hoehe, waehrend die Textur auf L1-Hoehe gerahmt wurde -> Vertikal-Stauchung um die L0/L1-Differenz, sichtbar als Hoehen-Pop im L1->L2-Crossfade bei 40m. bh, aH0 (Shader-LOD) und Atlas-Rahmen kommen jetzt aus DERSELBEN Quelle.
        const plByVar = Array.from({ length: nVar }, () => []);
        for (let i = 0; i < trees.length; i++) {
            const tr = trees[i];
            if (tr.sp !== sp) continue;
            const vi = Math.floor(hash01(i * 2 + 1) * nVar);
            const _ci = _impCellOf[sp + "|" + vi],
                _isp = _ci !== undefined ? _impSpecs[_ci] : null;
            const sc = SCALE[sp] * tr.s * TREE_SCALE_MUL,
                bh = H0arr[vi] * sc,
                bw = bh * ((_isp && _impWR[_isp.sp + _isp.seed]) || 0.5); // FIX v28: Quad-Seitenverhaeltnis = Zell-Rahmen der Art (Weide breiter) -> Silhouette unverzerrt und ungeclippt
            const bhL = Math.min(H0arr[vi], 24 / (SCALE[sp] * TREE_SCALE_MUL)) * sc; // FIX v30: Blatt-Sichthoehe = aH0L * Instanzskala — EXAKT die Zahl, die der Shader bildet (CPU==GPU, kein Drift)
            const bm = new THREE.Matrix4().compose(
                new THREE.Vector3(tr.x, tr.y, tr.z),
                new THREE.Quaternion().setFromAxisAngle(_impYAxis, tr.rotY),
                new THREE.Vector3(bw, bh, bh)
            ); /* S=(B,H, VISUELLE Hoehe in z): z traegt bh fuer das Wahrnehmungs-k im Shader -- kompaktierungssicher, kein Extra-Buffer */ // T*Ry*S: die Drehung des ECHTEN Baums steckt in der Matrix -> Shader dekodiert sie, Billboard zeigt dieselbe Seite wie das 3D-LOD
            plByVar[vi].push({ x: tr.x, z: tr.z, bh, bhL, m: compose(tr.x, tr.y, tr.z, tr.rotY, sc).clone(), bm });
        } // 3D-Matrix + Billboard-Matrix vorberechnet; bh = Sichthoehe fuer Wahrnehmungs-LOD, bhL = Blatt-Sichthoehe
        for (let v = 0; v < nVar; v++) {
            const placements = plByVar[v];
            if (!placements.length) continue;
            const meshesByLod = [[], [], []];
            for (let L = 0; L < 2; L++) {
                const tmpl = poolL[L][sp][v],
                    dy = tmpl.position.y,
                    capU = 24 / (SCALE[sp] * TREE_SCALE_MUL); // L0,L1 = echtes 3D-Mesh; capU: 18m Blatt-Referenz in Template-Einheiten
                tmpl.traverse((o) => {
                    if (o.isMesh) {
                        const geo = o.geometry.clone();
                        if (dy) geo.translate(0, dy, 0);
                        const isFol = o.material === foliageMat || o.material === foliageMatTex; // FIX v31: Cluster-Quads sind Laub
                        geo.setAttribute(
                            "aLodLevel",
                            new THREE.Float32BufferAttribute(
                                new Float32Array(geo.attributes.position.count).fill(L === 0 ? 1 : 2),
                                1
                            )
                        ); // Stufe im Geometrie-Attribut -> Crossfade-Maske weiss, wer ein- und wer ausblendet
                        geo.setAttribute(
                            "aH0",
                            new THREE.Float32BufferAttribute(
                                new Float32Array(geo.attributes.position.count).fill(H0arr[v]),
                                1
                            )
                        ); // Template-Hoehe: aH0 * Instanzskala = Sichthoehe bh -> Shader normiert vLodD EXAKT wie die CPU (Screen-Space-Error-LOD)
                        geo.setAttribute(
                            "aH0L",
                            new THREE.Float32BufferAttribute(
                                new Float32Array(geo.attributes.position.count).fill(
                                    isFol ? Math.min(H0arr[v], capU) : H0arr[v]
                                ),
                                1
                            )
                        ); // FIX v30: BLATT-Metrik — Laub grosser Baeume schaltet nach ABSOLUTER Distanz (~30m real -> L1-Aggregat), das Skelett bleibt Wahrnehmungs-LOD. Rinde: aH0L==aH0.
                        const im = new THREE.InstancedMesh(geo, o.material, placements.length);
                        im.userData.isFol = isFol;
                        im.frustumCulled = false;
                        im.castShadow = false;
                        im.receiveShadow = true;
                        im.count = 0; // Anzeige castet NIE (der Zwilling wirft) -> Bake muss Anzeige-Buffer nie mehr anfassen
                        forestGroup.add(im);
                        meshesByLod[L].push(im);
                        drawMeshes++;
                    }
                });
            }
            {
                const tmpl = poolL[1][sp][v],
                    dy = tmpl.position.y; // SCHATTEN-ZWILLING (Gesetz: EIN Schreiber je Zustand): statischer Voll-Caster, Matrizen EINMAL geschrieben, nie wieder mutiert
                tmpl.traverse((o) => {
                    if (o.isMesh) {
                        const geo = o.geometry.clone();
                        if (dy) geo.translate(0, dy, 0);
                        const im = new THREE.InstancedMesh(geo, o.material, placements.length);
                        for (let j = 0; j < placements.length; j++) im.setMatrixAt(j, placements[j].m);
                        im.instanceMatrix.needsUpdate = true;
                        im.count = placements.length;
                        im.castShadow = true;
                        im.receiveShadow = false;
                        im.frustumCulled = false;
                        im.layers.set(2);
                        im.userData.shadowProxy = true; // Layer 2: Kamera (0/1) sieht ihn NIE; nur der Schatten-Render (enableAll) zaehlt ihn als Caster
                        forestGroup.add(im);
                        drawMeshes++;
                    }
                });
            }
            {
                const cellIdx = _impCellOf[sp + "|" + v] !== undefined ? _impCellOf[sp + "|" + v] : 0; // Fern-Billboard = dieselbe Art+Variante wie das 3D-LOD, kein generischer Ersatz
                const bgeo = _impGeo.clone(),
                    cells = new Float32Array(placements.length).fill(cellIdx),
                    biases = new Float32Array(placements.length),
                    occs = new Float32Array(placements.length); // L2 = Billboard an Baumposition
                for (let q = 0; q < placements.length; q++) biases[q] = hash01(q * 1.3 + v * 7) * 2.5;
                bgeo.setAttribute("aCell", new THREE.InstancedBufferAttribute(cells, 1));
                bgeo.setAttribute("aDepthBias", new THREE.InstancedBufferAttribute(biases, 1));
                const _oatt = new THREE.InstancedBufferAttribute(occs, 1);
                if (_oatt.setUsage && THREE.DynamicDrawUsage !== undefined) _oatt.setUsage(THREE.DynamicDrawUsage);
                bgeo.setAttribute("aOccl", _oatt); // FIX v31: 1 = verdeckt-demotierter Baum -> Karte voll sichtbar (Shader: finE=max(fin,vOcc))
                const im = new THREE.InstancedMesh(bgeo, _impMat, placements.length);
                im.frustumCulled = false;
                im.count = 0;
                forestGroup.add(im);
                meshesByLod[2].push(im);
                drawMeshes++;
            }
            _treeLOD.push({ placements, meshesByLod });
        }
    }
    const nT = trees.length;
    _occW = Math.ceil(192 / 3);
    _occG = new Float32Array(_occW * _occW); // FIX v31: OCCLUSION-GITTER — jede Krone traegt Dichte in ihre 3m-Zelle; updateTreeLOD marschiert Sichtlinien hindurch. Statische Baeume -> einmal fuellen genuegt.
    for (const _t of trees) {
        const _w = clamp((_t.T || 2) * 0.3, 0.35, 1.6),
            _gx = Math.floor((_t.x + 96) / 3),
            _gz = Math.floor((_t.z + 96) / 3);
        if (_gx >= 0 && _gz >= 0 && _gx < _occW && _gz < _occW) _occG[_gz * _occW + _gx] += _w;
    }
    // (Fern-Kulissen-Ring entfernt: LOD2 ist jetzt das Billboard JEDES Baums an seiner Position)

    // 6) STEINE (Geologie, EIN Template je Art)
    const rocks = placeRocks(R, SEEDI, C);
    const rkTpl = {
        findling: findlingT,
        geroell: zackenT,
        zacken: zackenT,
        basalt: basaltT,
        sediment: sedimentT,
        kristalle: kristalleT,
    };
    const rkScale = {
        findling: "findling",
        geroell: "zacken",
        zacken: "zacken",
        basalt: "basalt",
        sediment: "sediment",
        kristalle: "kristalle",
    };
    const rkPl = {};
    for (const k in rkTpl) rkPl[k] = rkTpl[k].map(() => []);
    for (let i = 0; i < rocks.length; i++) {
        const rk = rocks[i];
        if (waterSurfaceAt(rk.x, rk.z) !== null) continue;
        const tpl = rkTpl[rk.kind],
            vi = Math.floor(hash01(i * 7 + 3) * tpl.length);
        rkPl[rk.kind][vi].push({ x: rk.x, y: rk.y, z: rk.z, rotY: rk.rotY, s: SCALE[rkScale[rk.kind]] * rk.s });
    }
    const tplGroups = new Map(); // gleiche Templates (geroell+zacken=zackenT) zusammenfassen
    for (const k in rkTpl) {
        const tpl = rkTpl[k];
        if (!tplGroups.has(tpl))
            tplGroups.set(
                tpl,
                tpl.map(() => [])
            );
        const g = tplGroups.get(tpl);
        for (let vi = 0; vi < tpl.length; vi++) g[vi] = g[vi].concat(rkPl[k][vi] || []);
    }
    for (const [tpl, pls] of tplGroups) instAdd(tpl, pls, false);
    const nR = rocks.length;

    // 7) BODEN nach Gesetz: Teppich-Gras / Kies / Blumen / Straeucher (Licht x Feuchte x Substrat x Stoerung)
    const grassPl = grassT.map(() => []),
        flowerPl = flowerT.map(() => []),
        shrubPl = shrubT.map(() => []),
        pebblePl = pebbleT.map(() => []);
    let nG = 0,
        nF = 0,
        nS = 0,
        nP = 0;
    // Understory-Raster aus dem Config-Block (die EINE Quelle): Gras dicht, Blumen mittel, Buesche weit.
    const _uGrass = PORTAL_RENDER_CONFIG.understory.grassStep,
        _uFlower = PORTAL_RENDER_CONFIG.understory.flowerStep,
        _uBush = PORTAL_RENDER_CONFIG.understory.bushStep;
    for (let gx = -R; gx <= R; gx += _uGrass)
        for (let gz = -R; gz <= R; gz += _uGrass) {
            if (gx * gx + gz * gz > R * R) continue;
            const x = gx + (RNG() - 0.5) * 0.68,
                z = gz + (RNG() - 0.5) * 0.68;
            if (waterSurfaceAt(x, z) !== null || inCaveZone(x, z)) continue;
            const moW = moistAt(x, z),
                gc = groundCover(lightAt(x, z), moW, rockAt(x, z), trailAt(x, z));
            if (RNG() < gc.grass) {
                grassPl[RNG() < 0.5 ? 0 : 1].push({
                    x,
                    y: forestGroundH(x, z),
                    z,
                    rotY: RNG() * 6.283,
                    s: SCALE.gras * (0.7 + RNG() * 0.7) * (moW > 0.8 ? 1.45 : 1.0),
                });
                nG++;
            } else if (RNG() < gc.pebble) {
                pebblePl[0].push({
                    x,
                    y: forestGroundH(x, z),
                    z,
                    rotY: RNG() * 6.283,
                    s: SCALE.zacken * (0.09 + RNG() * 0.14),
                });
                nP++;
            }
        } // FIX v27: 3-11cm statt Sandkorn
    for (let gx = -R; gx <= R; gx += _uFlower)
        for (let gz = -R; gz <= R; gz += _uFlower) {
            if (gx * gx + gz * gz > R * R) continue;
            const x = gx + (RNG() - 0.5) * 2.2,
                z = gz + (RNG() - 0.5) * 2.2;
            if (waterSurfaceAt(x, z) !== null || inCaveZone(x, z)) continue;
            const gc = groundCover(lightAt(x, z), moistAt(x, z), rockAt(x, z), trailAt(x, z));
            if (RNG() < gc.flower) {
                flowerPl[Math.floor(RNG() * 2)].push({
                    x,
                    y: forestGroundH(x, z),
                    z,
                    rotY: RNG() * 6.283,
                    s: SCALE.blume * (0.7 + RNG() * 0.6),
                });
                nF++;
            }
        }
    for (let gx = -R; gx <= R; gx += _uBush)
        for (let gz = -R; gz <= R; gz += _uBush) {
            if (gx * gx + gz * gz > R * R) continue;
            const x = gx + (RNG() - 0.5) * 4.0,
                z = gz + (RNG() - 0.5) * 4.0;
            if (waterSurfaceAt(x, z) !== null || inCaveZone(x, z)) continue;
            const gc = groundCover(lightAt(x, z), moistAt(x, z), rockAt(x, z), trailAt(x, z));
            if (RNG() < gc.shrub) {
                shrubPl[0].push({
                    x,
                    y: forestGroundH(x, z),
                    z,
                    rotY: RNG() * 6.283,
                    s: SCALE.strauch * (0.8 + RNG() * 0.5),
                });
                nS++;
            }
        }
    // LOD-WURZEL (08.07.): Gras + Strauch zweistufig, wenn die Vertrags-Daten zwei
    // Stufen tragen (sonst byte-alt einstufig); Kiesel/Blume bleiben einstufig by data.
    const _twoG = _ksN("grass", 2) !== _ksF("grass", 2);
    addTiled(grassT, grassPl, "grass", _twoG ? "near" : "single");
    if (_twoG) addTiled(grassTF, grassPl, "grass", "far");
    addTiled(pebbleT, pebblePl, "pebble"); // ★ gekachelt + frustum-gecullt (der Dreiecks-Hebel)
    instAdd(flowerT, flowerPl, false);
    const _twoS = _ksN("shrub", 2) !== _ksF("shrub", 2);
    addTiled(shrubT, shrubPl, "shrub", _twoS ? "near" : "single");
    if (_twoS)
        addTiled(
            shrubTF,
            shrubPl,
            "shrub",
            "far"
        ); /* Straeucher gekachelt wie Gras -> frustum-gecullt (der zweite Dreiecks-Hebel) */

    forestGroup.traverse((o) => {
        if (
            o.isMesh &&
            !o.userData.shadowProxy &&
            (o.material === foliageMat || o.material === foliageMatTex || o.material === grassMat)
        )
            o.layers.set(1);
    }); // Laub (Blaetter+Gras) -> Layer 1 (Halb-Aufloesungs-Pass); Schatten-Zwillinge bleiben auf Layer 2
    {
        const seen = new Set();
        forestGroup.traverse((o) => {
            const mm = o.material;
            if (!mm) return;
            (Array.isArray(mm) ? mm : [mm]).forEach((m) => {
                if (m && m.envMapIntensity !== undefined) seen.add(m);
            });
        });
        _envMats = [...seen];
    } // ALLE IBL-Materialien (Laub/Gras/Rinde/Boden/STEINE/WASSER) -> nachts konsistent dimmen, sonst spiegeln sie die konstante Tag-Env-Map
    _seasonBuiltTint.copy(seasonTint); // Referenz-Tint dieser Backung -> uSeasonMul startet bei (1,1,1) und driftet mit der Saison
    __forest = { trees, light, C, paths, R };
    console.log(
        "[WALD] R=" +
            R +
            " Baeume=" +
            nT +
            " Steine=" +
            nR +
            " Gras=" +
            nG +
            " Kies=" +
            nP +
            " Blumen=" +
            nF +
            " Straeucher=" +
            nS +
            " | DRAW-MESHES=" +
            drawMeshes +
            " | Lichtung(" +
            C.x.toFixed(0) +
            "," +
            C.z.toFixed(0) +
            ") Pfade=" +
            paths.length
    );
}
function updateForestHint() {
    const fh = document.getElementById("forestHint");
    if (!fh) return;
    const look = plFallback ? "Ziehen = Umsehen" : "Klick = Umsehen";
    fh.textContent = flyMode
        ? "FLIEGEN | WASD + Maus | Space = hoch | Shift = runter | Space x2 = gehen"
        : look + " | WASD = Gehen | Shift = Rennen | Space x2 = Fliegen | ESC = Maus frei";
}
function updateTreeLOD() {
    if (!_treeLOD.length) return;
    const cx = camera.position.x,
        cz = camera.position.z;
    const M = PORTAL_RENDER_CONFIG.lod.hyst,
        n0 = LOD_D0 - LOD_FADE0,
        n1 = LOD_D1 - LOD_FADE; // M = Hysterese-Rand (>= 1m-Trigger + eine Frame-Bewegung im Flug); die Shader-Blende bleibt exakt, die Mitgliedschaft ueberdeckt sie nur
    const fogD = scene && scene.fog ? scene.fog.far + 6 : 1e9; // FIX v30: AUSSER SICHTWEITE = NULL KOSTEN — jenseits fog.far ist jeder Baum 100% Nebelfarbe; wir zeichnen ihn gar nicht erst (Sichtweite-Regler wird zum ehrlichen Performance-Regler)
    const occOn = !!_occG;
    for (const e of _treeLOD) {
        const b0 = [],
            b1 = [],
            f0 = [],
            f1 = [],
            b2m = [],
            b2o = [];
        const HREF = _lodU.uLodRef.value; // Wahrnehmungs-LOD: EINE Quelle fuer CPU und Shader (PHYTO_LODREF-Ventil), live ohne Rebuild
        for (const p of e.placements) {
            const dx = p.x - cx,
                dz = p.z - cz,
                dr = Math.sqrt(dx * dx + dz * dz);
            if (dr > fogD) continue; // FIX v30: komplett im Nebel -> kein Slot, in KEINER Stufe
            if (occOn && dr > 30) {
                // FIX v31: OCCLUSION-DEMOTION statt -Culling: Sichtlinie durchs Kronengitter marschieren; hinter >=~3.5 Kronendichten faellt der Baum auf seine KARTE zurueck (aOccl=1 -> voll sichtbar). Oeffnet sich eine Luecke, steht dort die korrekte Silhouette — Pop-in konstruktiv unmoeglich, 3D-Dreiecke trotzdem weg. Hysterese 3.6/2.8 gegen Flattern.
                const ix = dx / dr,
                    iz = dz / dr;
                let s = 0,
                    hid = false;
                const tEnd = dr - 8,
                    thr = p._oc ? 2.8 : 3.6;
                for (let t = 7; t < tEnd; t += 3) {
                    const gx = ((cx + ix * t + 96) / 3) | 0,
                        gz = ((cz + iz * t + 96) / 3) | 0;
                    if (gx >= 0 && gz >= 0 && gx < _occW && gz < _occW) {
                        s += _occG[gz * _occW + gx];
                        if (s > thr) {
                            hid = true;
                            break;
                        }
                    }
                }
                p._oc = hid;
                if (hid) {
                    b2m.push(p.bm);
                    b2o.push(1);
                    continue;
                }
            }
            const dn = dr * Math.min(1, HREF / p.bh),
                dnL =
                    dr *
                    Math.min(
                        1,
                        HREF / p.bhL
                    ); /* dn: Baum-Metrik (Silhouette/Skelett). dnL: Blatt-Metrik (absolut gekappt) -- dnL>=dn, Laub schaltet also NIE spaeter, bei grossen Baeumen deutlich frueher */
            if (dn < LOD_D0 + M) b0.push(p.m); // Skelett L0 nach Baum-Metrik
            if (dn > n0 - M && dn < LOD_D1 + M) b1.push(p.m); // Skelett L1 ueber das GANZE Band + Rand
            if (dnL < LOD_D0 + M) f0.push(p.m); // FIX v30: Laub L0 nach BLATT-Metrik (Mammut-Krone -> L1-Aggregat ab ~30m real statt ~92m)
            if (dnL > n0 - M && dn < LOD_D1 + M) f1.push(p.m); // Laub L1: Einstieg Blatt-Metrik, Ausstieg Baum-Metrik (muss das Billboard treffen)
            if (dn > n1 - M) {
                b2m.push(p.bm);
                b2o.push(0);
            }
        } // Billboard Mitglied ab knapp vor der Fern-Blende
        const bkB = [b0, b1, b2m],
            bkF = [f0, f1, b2m];
        for (let L = 0; L < 3; L++) {
            for (const im of e.meshesByLod[L]) {
                const arr = (im.userData.isFol ? bkF : bkB)[L];
                for (let j = 0; j < arr.length; j++) im.setMatrixAt(j, arr[j]);
                im.count = arr.length;
                im.visible = arr.length > 0;
                im.instanceMatrix.needsUpdate = true;
                if (L === 2) {
                    const oa = im.geometry.getAttribute("aOccl");
                    if (oa) {
                        for (let j = 0; j < arr.length; j++) oa.setX(j, b2o[j]);
                        oa.needsUpdate = true;
                    }
                }
            }
        }
    }
}
function spawnInClearing() {
    // SPAWN: in der Lichtung, Blick einen Pfad-Korridor hinab -> freier Weg in den Garten ist sofort sichtbar
    const F = __forest,
        C = F ? F.C : { x: 0, z: 0 };
    const sy = forestGroundH(C.x, C.z) + 1.7;
    eyeY = sy;
    camera.position.set(C.x, sy, C.z);
    let dir = 0;
    if (F && F.paths && F.paths.length) {
        let best = F.paths[0],
            bl = -1;
        for (const p of F.paths) {
            const e = p[p.length - 1],
                L = Math.hypot(e[0] - C.x, e[1] - C.z);
            if (L > bl) {
                bl = L;
                best = p;
            }
        } // laengster Korridor
        const nx = best[Math.min(4, best.length - 1)];
        dir = Math.atan2(nx[1] - C.z, nx[0] - C.x);
    }
    camera.lookAt(C.x + Math.cos(dir) * 12, sy - 0.5, C.z + Math.sin(dir) * 12);
}
function rebuildForestInPlace(keepCam) {
    if (!forestMode) return;
    let _kp, _kq, _ke;
    if (keepCam) {
        _kp = camera.position.clone();
        _kq = camera.quaternion.clone();
        _ke = eyeY;
    } // Saisonwechsel: Spieler bleibt stehen, kein Teleport
    if (forestGroup) {
        forestGroup.traverse((o) => {
            if (o.isMesh && o.geometry) o.geometry.dispose();
        });
        scene.remove(forestGroup);
        forestGroup = null;
    }
    buildForest();
    if (keepCam) {
        camera.position.copy(_kp);
        camera.quaternion.copy(_kq);
        eyeY = _ke;
    } else spawnInClearing();
    updateTreeLOD();
    if (renderer.shadowMap.enabled) _forestShadowDirty = true;
    try {
        renderer.compile(scene, camera);
    } catch (e) {}
}
function enterForest() {
    if (forestMode) return;
    const ld = document.getElementById("loading");
    if (ld) {
        ld.textContent = "Pflanzt einen Wald\u2026";
        ld.style.display = "";
    }
    setTimeout(() => {
        forestMode = true;
        if (subject) subject.visible = false;
        groundMesh.visible = false;
        contactShadow.visible = false;
        controls.enabled = false;
        controls.autoRotate = false;
        if (!_foliagePass) _foliagePass = new FoliagePass();
        composer.passes[0] = _foliagePass; // ZWEI-PASS-LAUB aktiv
        if (keyLight) keyLight.layers.enable(1);
        if (hemiL) hemiL.layers.enable(1);
        if (fillL) fillL.layers.enable(1); // Lichter beleuchten auch Layer 1 (Laub)
        _rScale = 1.25;
        _frMs = 16;
        _rsT = 0;
        setRenderScale(1.0); // startet niedrig -> der Regler steigert die Schaerfe langsam bis zum 60fps-Gleichgewicht
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.autoUpdate = false;
        _forestShadowDirty = true; // SCHATTEN IM WALD: Map EINMAL mit Stamm UND Krone backen, dann eingefroren (fast gratis) -> kein Brutforce pro Frame
        if (bloomPass) bloomPass.enabled = false; // nur das teure Bloom (~10 Paesse) aus; FXAA+Cine bleiben
        if (rimL) rimL.visible = false;
        if (backL) backL.visible = false; // LICHT-DIAET: 2 Akzentlichter weg -> jedes Fragment im Standard-Material billiger
        if (keyLight) keyLight.intensity = 3.05;
        if (hemiL) hemiL.intensity = 0.5; // Key hoch, Fuellung runter -> Schatten haben Kontrast und sind sichtbar
        if (keyLight) {
            keyLight.position.set(58, 92, 40);
            const shc = keyLight.shadow.camera;
            shc.left = -66;
            shc.right = 66;
            shc.top = 66;
            shc.bottom = -66;
            shc.near = 10;
            shc.far = 260;
            shc.updateProjectionMatrix();
            keyLight.shadow.mapSize.set(2048, 2048);
            keyLight.shadow.bias = -0.0008;
            keyLight.shadow.normalBias = 0.04;
            if (keyLight.shadow.map) {
                keyLight.shadow.map.dispose();
                keyLight.shadow.map = null;
            }
        } // 2048 statt 4096 -> SwiftShader-vertraeglich; kleiner normalBias gegen Blatt-Akne ohne Light-Leak
        if (volPass) volPass.enabled = true;
        buildForest();
        scene.background = new THREE.Color(0xa6bcc6);
        scene.fog = new THREE.Fog(0xa6bcc6, _sightDist * 0.35, _sightDist);
        camera.far = _sightDist + 20;
        camera.updateProjectionMatrix(); // Sichtweite-Regler steuert Dunst + Cull
        spawnInClearing();
        updateTreeLOD();
        initReflection();
        bakeTerrainMap();
        refreshLightVolume(true);
        camera.layers.enableAll();
        try {
            renderer.compile(scene, camera);
        } catch (e) {} // alle Layer vorkompilieren -> kein First-Frame-Ruckler
        if (ld) ld.style.display = "none";
        const fh = document.getElementById("forestHint");
        if (fh) fh.style.display = "";
        updateForestHint();
        const eb = document.getElementById("exitForest");
        if (eb) eb.style.display = "";
    }, 60);
}
function exitForest() {
    if (!forestMode) return;
    forestMode = false;
    flyMode = false;
    if (plControls && plControls.isLocked) plControls.unlock();
    if (forestGroup) {
        forestGroup.traverse((o) => {
            if (o.isMesh && o.geometry) o.geometry.dispose();
        });
        scene.remove(forestGroup);
        forestGroup = null;
    }
    composer.passes[0] = renderPassMain;
    _folDepthU.uFolEnable.value = 0.0;
    camera.layers.set(0);
    camera.layers.enable(1); // FIX v29: zurueck zum Normal-Pass — ABER Layer 1 bleibt AN! buildForest legt alles Laub auf Layer 1; set(0) allein machte nach dem Verlassen JEDEN 3D-Baum rindennackt (die einzigen "Blaetter" im Studio waren die Billboards auf Layer 0). Mit uFolEnable=0 ist 0+1 gemeinsam exakt klassisches Rendern.
    if (keyLight) keyLight.layers.disable(1);
    if (hemiL) hemiL.layers.disable(1);
    if (fillL) fillL.layers.disable(1);
    scene.fog = null;
    scene.background = new THREE.Color(0x070b08);
    camera.far = 400;
    camera.updateProjectionMatrix();
    groundMesh.visible = true;
    contactShadow.visible = true;
    controls.enabled = true;
    _rScale = Math.min(2, devicePixelRatio);
    renderer.setPixelRatio(_rScale);
    if (composer && composer.setPixelRatio) composer.setPixelRatio(_rScale);
    if (fxaa) fxaa.uniforms["resolution"].value.set(1 / (innerWidth * _rScale), 1 / (innerHeight * _rScale));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.autoUpdate = true;
    if (bloomPass) bloomPass.enabled = true;
    if (volPass) volPass.enabled = false;
    if (keyLight) {
        const shc = keyLight.shadow.camera;
        shc.left = -10;
        shc.right = 10;
        shc.top = 10;
        shc.bottom = -10;
        shc.near = 0.5;
        shc.far = 40;
        shc.updateProjectionMatrix();
        keyLight.shadow.mapSize.set(2048, 2048);
        keyLight.shadow.bias = -0.0002;
        keyLight.shadow.normalBias = 0;
        if (keyLight.shadow.map) {
            keyLight.shadow.map.dispose();
            keyLight.shadow.map = null;
        }
    }
    if (rimL) rimL.visible = true;
    if (backL) backL.visible = true;
    if (keyLight) keyLight.intensity = 2.4;
    if (hemiL) hemiL.intensity = 0.5;
    if (_ctrlPanel) _ctrlPanel.style.display = "none";
    if (keyLight) {
        const c = keyLight.shadow.camera;
        c.left = -10;
        c.right = 10;
        c.top = 10;
        c.bottom = -10;
        c.far = 40;
        c.updateProjectionMatrix();
        keyLight.position.set(7, 10, 5);
        keyLight.target.position.set(0, 0, 0);
        keyLight.target.updateMatrixWorld();
    }
    const fh = document.getElementById("forestHint");
    if (fh) fh.style.display = "none";
    const eb = document.getElementById("exitForest");
    if (eb) eb.style.display = "none";
    build();
}
addEventListener("keydown", (e) => {
    if (!forestMode) return;
    const k = e.code;
    if (k === "KeyW" || k === "ArrowUp") move.fwd = true;
    else if (k === "KeyS" || k === "ArrowDown") move.back = true;
    else if (k === "KeyA" || k === "ArrowLeft") move.left = true;
    else if (k === "KeyD" || k === "ArrowRight") move.right = true;
    else if (k === "ShiftLeft" || k === "ShiftRight") move.run = true;
    else if (k === "Space") {
        e.preventDefault();
        const now = performance.now();
        if (now - lastSpace < 320) {
            flyMode = !flyMode;
            updateForestHint();
        }
        lastSpace = now;
        move.up = true;
    } else if (k === "KeyV") {
        window._dbgView = ((window._dbgView || 0) + 1) % 3;
        const m = [
            "VERBUND (normal)",
            "NUR STRUKTUR — Boden+Stämme+gebackener Schatten, KEIN Laub",
            "NUR LAUB — Krone+Gras",
        ][window._dbgView];
        console.log("%c[DEBUG-VIEW " + window._dbgView + "] " + m, "color:#9ece5a;font-weight:bold");
    }
});
addEventListener("keyup", (e) => {
    const k = e.code;
    if (k === "KeyW" || k === "ArrowUp") move.fwd = false;
    else if (k === "KeyS" || k === "ArrowDown") move.back = false;
    else if (k === "KeyA" || k === "ArrowLeft") move.left = false;
    else if (k === "KeyD" || k === "ArrowRight") move.right = false;
    else if (k === "ShiftLeft" || k === "ShiftRight") move.run = false;
    else if (k === "Space") move.up = false;
});
function wireForest() {
    if (THREE.PointerLockControls) plControls = new THREE.PointerLockControls(camera, renderer.domElement);
    renderer.domElement.addEventListener("click", () => {
        if (forestMode && plControls && !plControls.isLocked && !plFallback) plControls.lock();
    });
    // PORTAL-FIX V18.384: scheitert der Lock (Browser/iframe-Policy), faellt die Steuerung
    // graziös auf Drag-Umsehen + freie WASD (statt eines toten Waldes). Kein PointerLockControls
    // vorhanden (sehr alte Engine-Reste) -> derselbe Fallback von Anfang an.
    if (!plControls) plFallback = true;
    document.addEventListener("pointerlockerror", () => {
        plFallback = true;
        updateForestHint();
    });
    const _dragE = new THREE.Euler(0, 0, 0, "YXZ");
    renderer.domElement.addEventListener("mousemove", (e) => {
        if (!forestMode || !plFallback || !(e.buttons & 1)) return;
        _dragE.setFromQuaternion(camera.quaternion);
        _dragE.y -= (e.movementX || 0) * 0.0024;
        _dragE.x -= (e.movementY || 0) * 0.0024;
        _dragE.x = Math.max(-1.45, Math.min(1.45, _dragE.x));
        _dragE.z = 0;
        camera.quaternion.setFromEuler(_dragE);
    });
    const wb = document.getElementById("waldBtn");
    if (wb) wb.addEventListener("click", enterForest);
    const eb = document.getElementById("exitForest");
    if (eb) eb.addEventListener("click", exitForest);
}
let _rScale = 1.25,
    _frMs = 16,
    _rsT = 0,
    _fpsAcc = 0,
    _fpsN = 0,
    _fpsEl = null,
    _fpsTarget = 60,
    _fpsSlider = null,
    _folRes = 0.5,
    _sightDist = PORTAL_RENDER_CONFIG.sight,
    _ctrlPanel = null,
    _folSlider = null,
    _sightSlider = null;
let _dcLast = 0,
    _triLast = 0; // FIX v27: Frame-Totale (Drawcalls/Dreiecke) — nach composer.render() eingesammelt, vom HUD gelesen
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
    _impWR = {};
const _impV = (PORTAL_RENDER_CONFIG.impostor && PORTAL_RENDER_CONFIG.impostor.views) || 8, // Bäcker-Spec aus der EINEN Quelle (foundry-core, Studio-Vertrag B2)
    _impYAxis = new THREE.Vector3(0, 1, 0); // 8 Blickwinkel je Baum im Atlas (Zeilen); _impNrm = Normal-Atlas; Atlas ist SAISONINVARIANT (einmal je Seed-Signatur); _impWR = Zell-Seitenverhaeltnis je Art (FIX v28)
let _grassTiles = [];
let _occG = null,
    _occW = 0; // FIX v31: Kronen-Dichtegitter (3m-Zellen) fuer die Sichtlinien-Transmittanz — gebaut EINMAL je Wald aus trees[].T
let _treeLOD = [],
    _lodT = 0,
    _lodCx = 1e9,
    _lodCz = 1e9;
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
let taaPass = null,
    _taaPrevVP = new THREE.Matrix4(),
    _taaCurVP = new THREE.Matrix4(),
    _taaReset = true,
    _taaFrame = 0; // FIX v32: TAA-Lite-Zustand; uDitherT rotiert golden-ratio NUR bei aktivem TAA
globalThis.PHYTO_LODMASK = (v) => {
    _lodU.uLodMaskOn.value = v ? 1 : 0;
    console.log("[phyto] LOD-Crossfade-Maske " + (v ? "AN" : "AUS (harte Kanten, altes Verhalten)"));
}; // FIX v38 (AUDIT-FUND): Ventil WIEDERBELEBT — der v32-Global-Insert zog den Zeilenrest hinter einen //-Kommentar, window.PHYTO_LODMASK war seitdem tot (kein Renderschaden, aber ein offener Faden)
globalThis.PHYTO_LODREF = (v) => {
    _lodU.uLodRef.value = Math.max(0.5, +v || 12);
    console.log(
        "[phyto] LOD-Referenzhoehe=" +
            _lodU.uLodRef.value +
            "m (Baum dieser Sichthoehe schaltet exakt bei D0/D1; groessere spaeter, kleinere frueher — Screen-Space-Error). CPU liest live, kein Rebuild."
    );
}; // WAHRNEHMUNGS-LOD-Ventil: eine Quelle fuer CPU-Mitgliedschaft UND Shader-Blende
function setRenderScale(pr) {
    const cap = Math.min(devicePixelRatio, 1.3);
    pr = Math.round(Math.max(0.6, Math.min(pr, cap)) / 0.05) * 0.05; // diskrete Stufen -> rastet ein, alloziert nicht staendig neu
    if (Math.abs(pr - _rScale) < 0.001) return;
    _rScale = pr;
    _taaReset = true;
    renderer.setPixelRatio(pr);
    if (composer && composer.setPixelRatio) composer.setPixelRatio(pr);
    if (fxaa) fxaa.uniforms["resolution"].value.set(1 / (innerWidth * pr), 1 / (innerHeight * pr));
}
// ===== PLANARE WASSER-SPIEGELUNG: Spiegel-Kamera rendert die Welt gespiegelt in eine Textur, das Wasser sampelt sie =====
let _reflRT = null,
    _reflCam = null,
    _waterMeshes = [];
let _shadowBakeRT = null,
    _forestShadowDirty = false,
    _reflFrame = 0,
    _lastBakeX = 1e9,
    _lastBakeZ = 1e9;
// ===== WALD-SCHATTEN EINMAL BACKEN (Stamm L0 + Krone L1, eingefroren) =====
// Der Zwei-Pass-Laub-Renderer trennt Struktur (L0) und Laub (L1). Die normale Schatten-Backung laeuft im L0-Pass -> Krone faellt raus.
// Hier: EINMAL mit ALLEN Layern backen, alle Baeume auf EINER mittleren LOD (distanzunabhaengig -> kein Pop beim Gehen). Frozen -> 0 Kosten pro Frame.
function bakeForestShadow() {
    if (!forestMode || !keyLight) return;
    _lastBakeX = camera.position.x;
    _lastBakeZ = camera.position.z; // Schattenbox-Zentrum merken (fuer Nachfuehren beim Gehen)
    {
        const elevForBox = Math.max(_wSunPos.y, 0.1),
            tanElev = elevForBox / Math.sqrt(Math.max(1e-4, 1 - elevForBox * elevForBox)); // GESETZ: Schattenlaenge = Baumhoehe/tan(Sonnenhoehe) -> Box MUSS mit sinkender Sonne wachsen, sonst faellt der Schatten aus dem Frustum (nicht Kontrast-, sondern Geometrie-Clipping)
        const refH = 26; // konservative Referenz-Kronenhoehe (Fichte/Tanne/Mammut hoch genug, Birke/Eiche niedriger -> sicherer oberer Rand)
        const boxHalf = clamp(refH / tanElev + 18, 66, 120); // +18 Basisradius fuer nahe Baeume; gedeckelt bei 120 (Texel-Dichte bleibt brauchbar, 2048/240 ~ 8.5px/m)
        const shc = keyLight.shadow.camera;
        if (Math.abs(shc.right - boxHalf) > 0.5) {
            shc.left = -boxHalf;
            shc.right = boxHalf;
            shc.top = boxHalf;
            shc.bottom = -boxHalf;
            shc.updateProjectionMatrix();
        }
    }
    if (!_shadowBakeRT) _shadowBakeRT = new THREE.WebGLRenderTarget(4, 4, { depthBuffer: true }); // Farb-Ausschuss winzig; die Schattenkarte rendert in voller Aufloesung
    if (!window.__phytoBakeLogged) {
        window.__phytoBakeLogged = true;
        let n = 0;
        for (const e of _treeLOD) n += e.placements.length;
        try {
            const sc = keyLight.shadow.camera,
                W = water(),
                px = camera.position.x,
                pz = camera.position.z;
            const dLo = Math.hypot(px - W.pondLo.x, pz - W.pondLo.z),
                dHi = Math.hypot(px - W.pondHi.x, pz - W.pondHi.z);
            console.log(
                "[phyto] SHADOW bake: trees=" +
                    n +
                    " map=" +
                    keyLight.shadow.mapSize.x +
                    " shadowCamHalf=" +
                    sc.right +
                    " keyI=" +
                    keyLight.intensity.toFixed(2) +
                    " hemiI=" +
                    (hemiL ? hemiL.intensity.toFixed(2) : "-") +
                    " env=" +
                    (scene.environment ? "YES" : "no")
            );
            console.log(
                "[phyto] POS: player=(" +
                    px.toFixed(0) +
                    "," +
                    pz.toFixed(0) +
                    ") light=(" +
                    keyLight.position.x.toFixed(0) +
                    "," +
                    keyLight.position.y.toFixed(0) +
                    "," +
                    keyLight.position.z.toFixed(0) +
                    ") target=(" +
                    keyLight.target.position.x.toFixed(0) +
                    "," +
                    keyLight.target.position.z.toFixed(0) +
                    ") | nearest pond Lo@(" +
                    W.pondLo.x.toFixed(0) +
                    "," +
                    W.pondLo.z.toFixed(0) +
                    ")d=" +
                    dLo.toFixed(0) +
                    " Hi@(" +
                    W.pondHi.x.toFixed(0) +
                    "," +
                    W.pondHi.z.toFixed(0) +
                    ")d=" +
                    dHi.toFixed(0)
            );
        } catch (_) {}
    }
    // 1) Caster = SCHATTEN-ZWILLINGE (Layer 2, statisch, volle Anzahl) -> der Bake fasst die Anzeige-LOD-Buffer NIE an. Gesetz: EIN Schreiber je Zustand (updateTreeLOD schreibt Anzeige, buildForest schreibt Zwillinge).
    // 2) Bake mit ALLEN Layern -> Stamm UND Krone der Zwillinge werfen Schatten -> echtes Blaetterdach-Spiel am Boden
    const prevMask = camera.layers.mask;
    camera.layers.enableAll();
    const oEnabled = renderer.shadowMap.enabled;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
    const oRT = renderer.getRenderTarget();
    try {
        renderer.setRenderTarget(_shadowBakeRT);
        renderer.render(scene, camera);
    } finally {
        renderer.setRenderTarget(oRT);
        renderer.shadowMap.enabled = oEnabled;
        renderer.shadowMap.autoUpdate = false; // bleibt eingefroren
        camera.layers.mask = prevMask;
        // KEIN updateTreeLOD-Restore mehr noetig: der Bake mutiert die Anzeige-Buffer nicht (Zwillinge sind statisch)
        if (window.__phytoBakeLogged && !window.__phytoBakeDone) {
            window.__phytoBakeDone = true;
            try {
                console.log("[phyto] SHADOW bake DONE ok, shadow.map=" + (keyLight.shadow.map ? "created" : "NULL"));
            } catch (_) {}
        }
    }
}
// ===== WASSER-NAEHE: Abstand der Kamera zum naechsten Wasser (Teich/Bach/Meer) =====
function _waterProximity() {
    const W = water(),
        cx = camera.position.x,
        cz = camera.position.z;
    let d = Math.min(
        Math.hypot(cx - W.pondLo.x, cz - W.pondLo.z) - W.pondLo.rs,
        Math.hypot(cx - W.pondHi.x, cz - W.pondHi.z) - W.pondHi.rs,
        _streamDH(cx, cz)[0] - W.CW
    );
    const sw = seaward(cx, cz);
    const seaD = sw >= -4 ? 0 : -(sw + 4); // Meer-Oberflaeche existiert ab seaward>=-4
    return Math.max(0, Math.min(d, seaD));
}
function hookReplace(src, from, to, label) {
    if (src.indexOf(from) === -1) {
        console.error(
            "[phyto] HOOK-LINT: r128-Ziel nicht gefunden (" +
                label +
                '): "' +
                from.slice(0, 40) +
                '..." -> Shader-Injektion FEHLGESCHLAGEN (stiller No-Op = sonst unsichtbar!)'
        );
        return src;
    }
    return src.replace(from, to);
} // institutionalisierte Lektion: der stille replace()-No-Op war die Wurzel des unsichtbaren Wassers
const _reflU = {
    uReflMap: { value: null },
    uReflMatrix: { value: new THREE.Matrix4() },
    uReflMix: { value: 0.0 },
    uSkyCol: { value: new THREE.Color(0.8, 0.87, 0.91) },
    uWind: { value: 0.0 },
    uSunDirW: { value: new THREE.Vector3(0.5, 0.82, 0.42) },
    uSunColW: { value: new THREE.Color(1, 0.96, 0.85) },
}; // uSunDirW/uSunColW: die ECHTE Sonne fuer Glitzerpfad + Wasser-Diffus (vorher hartkodiert)
const _rBias = new THREE.Matrix4().set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
const _rN = new THREE.Vector3(0, 1, 0),
    _rP = new THREE.Vector3(),
    _rV = new THREE.Vector3(),
    _rT = new THREE.Vector3(),
    _rL = new THREE.Vector3(),
    _rU = new THREE.Vector3(),
    _rRot = new THREE.Matrix4(),
    _reflPlane = new THREE.Plane(),
    _clipV = new THREE.Vector4(),
    _qV = new THREE.Vector4();
// ===== WELT-TAKT: Tag/Nacht + Jahreszeit + Wetter aus EINEM Zustand =====
// Sonne folgt einem echten Bogen (Auf-/Untergang aus Tageslaenge je Jahreszeit), Himmel/Licht/Dunst/Laub leiten sich ab.
let WTIME = 10.0; // Tageszeit 0..24 h
let WSEASON = 0.28; // 0 Fruehling · .25 Sommer · .5 Herbst · .75 Winter (kontinuierlich)
let WWEATHER = "klar"; // klar | bewoelkt | nebel | sturm
let WPLAY = false,
    WSPEED = 1.2; // Zeit-Autoplay (Stunden pro Sekunde)
let WSEASONPLAY = false,
    WSEASONSPEED = 0.01; // Jahreszeit-Drift (Anteil pro Sekunde)
let WXPLAY = false; // Wetter-Autoplay: Wolkenfelder ziehen durch (kontinuierlicher Drift statt hartem Preset-Sprung)
const _wxPh = [1.7, 4.1, 0.3, 2.9]; // Phasen-Offsets fuer unabhaengige Drift je Kanal (Fog/Sun/Grey/Wind)
let _timeSlider = null,
    _seasonSlider = null,
    _timeVal = null,
    _seasonVal = null,
    _lastSeasonBuild = 0.28;
let wxFog = 0.16,
    wxFogT = 0.16,
    wxSun = 1,
    wxSunT = 1,
    wxGrey = 0,
    wxGreyT = 0,
    wxWind = 0.05,
    wxWindT = 0.05,
    wxRain = 0,
    wxRainT = 0; // geglaettete Wetter-Faktoren
const _skNight = new THREE.Color(0x0a1326),
    _skDay = new THREE.Color(0xa6d2ec); // perzeptuelle Himmel-Anker (Tag/Nacht); Daemmerung + Glut leitet das Atmosphaere-Gesetz ab
const _moonCol = new THREE.Color(0x9fb8dc); // vom Atmosphaere-Gesetz genutzt (Mondlicht-Hue)
const _wxOver = new THREE.Color(0xc4c9cf),
    _wxStorm = new THREE.Color(0x555d67);
const _w1 = new THREE.Color(),
    _w2 = new THREE.Color(),
    _w3 = new THREE.Color(),
    _wSun = new THREE.Color(),
    _wSunPos = new THREE.Vector3();
let _lastShadowSun = null,
    _wxT = 0,
    _camUnder = false,
    _shSince = 99,
    _heavyNow = false,
    _heavySkip = false;
const SEASON_NAMES = [
    "Frühling",
    "Frühsommer",
    "Sommer",
    "Spätsommer",
    "Herbst",
    "Spätherbst",
    "Winter",
    "Vorfrühling",
];
function wSS(a, b, x) {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
}
// ===== ATMOSPHAERE-GESETZ: Sonnenhoehe -> Luftmasse -> spektrale Transmission (Rayleigh ~1/lambda^4) =====
// EINE Quelle fuer Sonnenfarbe+Intensitaet, Hemi und Impostor-Tint. Sonnenuntergang/Nacht entstehen aus der Physik, nicht aus Lerps.
const _atmS = new THREE.Color();
const _BETA_R = 0.044,
    _BETA_G = 0.1,
    _BETA_B = 0.23; // Rayleigh optische Tiefe Meereshoehe/Zenit (Bucholtz 1995): blau streut ~5x rot
function atmosphere(e) {
    const m = 1.0 / (Math.max(e, 0.0) + 0.06); // Luftmasse: ~1 im Zenit, gross am Horizont
    const tr = Math.exp(-_BETA_R * m),
        tg = Math.exp(-_BETA_G * m),
        tb = Math.exp(-_BETA_B * m); // durchgelassenes Sonnenspektrum (Beer-Lambert)
    const lum = 0.21 * tr + 0.72 * tg + 0.07 * tb; // Lichtmenge der direkten Sonne
    const mx = Math.max(tr, tg, tb, 1e-4);
    _atmS.setRGB(tr / mx, tg / mx, tb / mx); // Sonnenfarbe = Hue des Spektrums (Sonnenuntergang -> rot)
    const night = clamp(-e / 0.16, 0, 1);
    _atmS.lerp(_moonCol, night); // unter Horizont -> Mond (Purkinje-Blauverschiebung)
    return { col: _atmS, lum: lum * (1.0 - night) + 0.06 * night, day: clamp(e, 0, 1) };
}
let _wxBase = { fog: 0.15, sun: 1.0, grey: 0.0, wind: 0.06, rain: 0.0 };
function weatherTargets(w) {
    if (w === "klar") {
        _wxBase = { fog: 0.15, sun: 1.0, grey: 0.0, wind: 0.06, rain: 0.0 };
    } else if (w === "bewoelkt") {
        _wxBase = { fog: 0.4, sun: 0.32, grey: 0.74, wind: 0.3, rain: 0.12 };
    } else if (w === "nebel") {
        _wxBase = { fog: 1.0, sun: 0.48, grey: 0.46, wind: 0.1, rain: 0.0 };
    } else if (w === "sturm") {
        _wxBase = { fog: 0.7, sun: 0.15, grey: 0.88, wind: 1.0, rain: 1.0 };
    }
}
weatherTargets(WWEATHER);
function seasonColors(t) {
    // kontinuierliche Jahreszeit -> Laubfarbe (Build) + Praesenz/Bluete (live)
    const seq = [
        { ti: 0x6a9a3e, ac: 0x88b450, pr: 0.72, bl: 0.85 },
        { ti: 0x4f7a30, ac: 0x6f9a3a, pr: 1.0, bl: 0.12 },
        { ti: 0xb0702a, ac: 0xd2922f, pr: 0.55, bl: 0.0 },
        { ti: 0x6e6650, ac: 0x847c64, pr: 0.06, bl: 0.0 },
    ];
    const f = (((t % 1) + 1) % 1) * 4,
        i = Math.floor(f) % 4,
        j = (i + 1) % 4,
        k = f - Math.floor(f);
    seasonTint.set(seq[i].ti).lerp(_w1.set(seq[j].ti), k);
    seasonAccent.set(seq[i].ac).lerp(_w1.set(seq[j].ac), k);
    presenceTarget = lerp(seq[i].pr, seq[j].pr, k);
    bloomTarget = lerp(seq[i].bl, seq[j].bl, k);
}
function worldRebuild() {
    if (forestMode) {
        if (typeof rebuildForestInPlace === "function") rebuildForestInPlace(true);
    } else build();
} // alle Aufrufer sind Saisonwechsel -> Kamera halten
function fmtHM(h) {
    const hh = Math.floor(h),
        mm = Math.floor((h - hh) * 60);
    return (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm;
}
function _dimEnvIBL(f) {
    const list = _envMats.length ? _envMats : [foliageMat, grassMat, barkMat, barkMatBirch, stemMat, _terMat];
    for (const m of list) {
        if (!m) continue;
        if (m.userData.bEnv === undefined) m.userData.bEnv = m.envMapIntensity !== undefined ? m.envMapIntensity : 1.0;
        m.envMapIntensity = m.userData.bEnv * f;
    }
} // IBL skaliert mit Tageslicht; sonst halten Laub/Steine/Wasser die konstante Env-Map nachts hell
function updateWorld(dt) {
    if (WPLAY) {
        WTIME = (WTIME + dt * WSPEED) % 24;
        if (WTIME < 0) WTIME += 24;
        if (_timeSlider) _timeSlider.value = WTIME;
        if (_timeVal) _timeVal.textContent = fmtHM(WTIME);
    }
    if (WSEASONPLAY) {
        WSEASON = (((WSEASON + dt * WSEASONSPEED) % 1) + 1) % 1;
        if (_seasonSlider) _seasonSlider.value = WSEASON;
        if (_seasonVal) _seasonVal.textContent = SEASON_NAMES[Math.floor((((WSEASON % 1) + 1) % 1) * 8) % 8];
    } // KONTINUITAET STATT REBUILD (Profi-Gesetz): im Autoplay NIE synchron neu bauen -- uLeafPresence, uBloom und uSeasonMul tragen das Jahr kontinuierlich; ein echter Wald baut sich auch nicht um. Manuelle Saison-Wahl backt weiterhin exakt.
    if (WXPLAY) {
        _wxT += dt * 0.05; // langsame Wolkenfeld-Drift, eigenes Tempo (unabhaengig von Zeit-/Jahreszeit-Speed)
        const n = (ph) =>
            Math.sin(_wxT + ph) * 0.5 +
            Math.sin(_wxT * 0.61 + ph * 1.7) * 0.32 +
            Math.sin(_wxT * 1.9 + ph * 0.4) * 0.18; // 3 Frequenzen ueberlagert, [-1,1], wirkt wie ziehende Wolkenfelder statt reinem Sinus
        wxFogT = clamp(_wxBase.fog + n(_wxPh[0]) * 0.28, 0, 1);
        wxSunT = clamp(_wxBase.sun - Math.max(0, n(_wxPh[1])) * 0.55, 0.08, 1); // Sonne kann nur GEDAEMPFT werden (Wolke vor Sonne), nie ueber Basis hinaus aufhellen
        wxGreyT = clamp(_wxBase.grey + Math.max(0, n(_wxPh[2])) * 0.3, 0, 1);
        wxWindT = clamp(_wxBase.wind + n(_wxPh[3]) * 0.22, 0.02, 1);
        wxRainT = _wxBase.rain; // Regen bleibt an der Preset-Wahl (kein Nieseln aus heiterem Himmel)
    } else {
        wxFogT = _wxBase.fog;
        wxSunT = _wxBase.sun;
        wxGreyT = _wxBase.grey;
        wxWindT = _wxBase.wind;
        wxRainT = _wxBase.rain;
    }
    wxFog += (wxFogT - wxFog) * 0.02;
    wxSun += (wxSunT - wxSun) * 0.02;
    wxGrey += (wxGreyT - wxGrey) * 0.02;
    wxWind += (wxWindT - wxWind) * 0.02;
    wxRain += (wxRainT - wxRain) * 0.02;
    seasonColors(WSEASON);
    SEASON.uSeasonMul.value.setRGB(
        clamp(seasonTint.r / Math.max(_seasonBuiltTint.r, 1e-3), 0.25, 4.0),
        clamp(seasonTint.g / Math.max(_seasonBuiltTint.g, 1e-3), 0.25, 4.0),
        clamp(seasonTint.b / Math.max(_seasonBuiltTint.b, 1e-3), 0.25, 4.0)
    ); // Laub folgt der Saison pro FRAME (Sommer-gebacken -> Herbst: R hoch, B runter), kein Rebuild-Takt mehr
    const dayLen = lerp(9.0, 15.8, 0.5 + 0.5 * Math.cos((WSEASON - 0.25) * 6.2831)); // Sommer lang, Winter kurz
    const sr = 12 - dayLen / 2,
        ss = 12 + dayLen / 2;
    let e; // Sonnenhoehe sin(elev) -1..1
    if (WTIME > sr && WTIME < ss) {
        e = Math.sin(((WTIME - sr) / (ss - sr)) * Math.PI);
    } else {
        const nl = 24 - dayLen;
        let np = WTIME <= sr ? (WTIME + 24 - ss) / nl : (WTIME - ss) / nl;
        e = -0.5 * Math.sin(clamp(np, 0, 1) * Math.PI);
    }
    const a = (WTIME - sr) / (ss - sr),
        cosE = Math.sqrt(Math.max(0, 1 - e * e));
    const hx = Math.cos(Math.PI * a),
        hz = Math.sin(Math.PI * a),
        lift = Math.max(e, 0.1),
        day = clamp(e, 0, 1);
    _wSunPos.set(hx * cosE, lift, hz * cosE).normalize();
    const atm = atmosphere(e); // EIN atmosphaerischer Zustand speist alles Licht
    _dimEnvIBL(clamp(0.06 + (0.94 * atm.lum) / 0.92, 0.06, 1.0)); // Env-IBL (scene.environment ist konstant) nachts dimmen -> Laub bleibt nicht hell
    if (keyLight) {
        if (forestMode) {
            // Schatten-Kamera dem Spieler nachfuehren: Terrain (192) ist groesser als die Schattenbox -> Box IMMER um den Spieler.
            // Richtung bleibt _wSunPos (position - target == _wSunPos*110), nur das Zentrum wandert mit.
            const cx = camera.position.x,
                cz = camera.position.z;
            keyLight.target.position.set(cx, 0, cz);
            keyLight.target.updateMatrixWorld();
            keyLight.position.set(cx + _wSunPos.x * 110, _wSunPos.y * 110, cz + _wSunPos.z * 110);
            if (fillL) {
                fillL.position.set(cx - _wSunPos.x * 60, 22, cz - _wSunPos.z * 60);
                fillL.target.position.set(cx, 0, cz);
                fillL.target.updateMatrixWorld();
                fillL.color.setHex(0x557a4a).multiply(_wSun);
            } // GESETZ: Fill = Laub-Bounce. Richtung sonnenabgewandt (die belichtete Kronenseite gegenueber), Spektrum = Gruen-Albedo x Rayleigh-Sonne -> mittags gruen, Untergang oliv-warm, nachts blaugruen-dunkel
            if (!_lastShadowSun) _lastShadowSun = new THREE.Vector3();
            _shSince += dt;
            if (e > -0.02 && _shSince > 0.33) {
                // PROFI-BUDGET: max ~3 Bakes/s statt ~7, und NACHTS (Sonne unter Horizont, keyI~0) gar keiner -- unsichtbare Arbeit ist gestrichene Arbeit
                if (_wSunPos.distanceToSquared(_lastShadowSun) > 0.0018) {
                    _forestShadowDirty = true;
                    _lastShadowSun.copy(_wSunPos);
                    _shSince = 0;
                } // Sonne deutlich bewegt -> neu backen
                const mdx = cx - _lastBakeX,
                    mdz = cz - _lastBakeZ;
                if (mdx * mdx + mdz * mdz > 14 * 14) {
                    _forestShadowDirty = true;
                    _shSince = 0;
                } // Spieler >14m gewandert -> Schattenbox neu zentrieren
            }
        } else {
            keyLight.position.copy(_wSunPos).multiplyScalar(14);
        }
        _wSun.copy(atm.col);
        keyLight.color.copy(_wSun);
        keyLight.intensity = (forestMode ? 3.13 : 2.65) * atm.lum * (0.35 + 0.65 * wxSun); // GESETZ: BASE x Luminanz(Transmission). Mittag(lum~0.91)->2.85; Sonnenuntergang/Nacht fallen physikalisch
    }
    if (hemiL) {
        hemiL.intensity = 0.78 * (0.1 + 0.9 * atm.lum) * (1 + wxGrey * 0.35) * (forestMode ? 0.25 : 1.0);
        hemiL.color
            .copy(_skDay)
            .lerp(_w2.set(0x223044), 1 - day)
            .lerp(_wxOver, wxGrey * 0.5);
    } // GESETZ: Hemi-Helligkeit aus Streulicht(lum) -> Mittag ~0.18, Nacht ~0.03 (Farbe = getunte Himmelspalette)
    if (rimL) rimL.intensity = 1.25 * atm.lum;
    if (fillL) fillL.intensity = 0.62 * atm.lum;
    if (backL) backL.intensity = 0.52 * atm.lum; // Studio-Fuelllichter skalieren mit Tageslicht(lum)
    // === ATMOSPHAEREN-FARBE: EINE Quelle fuer Himmel, Nebel, Hintergrund, ferne Impostoren UND Wasser-Spiegelung ===
    // Helligkeit aus Sonnenstand; Tagblau<->Nachtblau (perzeptuelle Anker); Daemmerungsglut = die EIGENE geroetete Sonnenfarbe (gleiche Luftmasse-Physik wie die Sonne) -> kein separater Horizont-Hardcode.
    const skyB = clamp(0.045 + 0.955 * wSS(-0.18, 0.42, e), 0, 1); // Himmelshelligkeit: Nacht-Boden -> voller Tag
    _w1.copy(_skDay).lerp(_skNight, 1.0 - skyB);
    const lowSun = clamp(1 - Math.abs(e) / 0.28, 0, 1) * clamp(1 + e * 3.5, 0, 1); // nahe Horizont, nicht tief in der Nacht
    _w1.lerp(atm.col, lowSun * lowSun * 0.6); // Glut = Sonnenfarbe selbst (Rayleigh-Roetung)
    _w2.copy(WWEATHER === "sturm" ? _wxStorm : _wxOver).multiplyScalar(0.35 + 0.65 * atm.day);
    _w1.lerp(_w2, wxGrey * 0.82);
    _reflU.uSkyCol.value.copy(_w1); // Wasser spiegelt DEN Himmel (Tag/Nacht/Daemmerung)
    _reflU.uSunDirW.value.copy(_wSunPos); // Glitzerpfad zeigt zur ECHTEN Sonne (nachts: Mondstrasse)
    // FIX v28: hier stand ein ZWEITER _impMat-Uniform-Schreiber (uSunCol/uHemiCol/uFog/uTime) — der Block unten ueberschrieb ihn JEDEN Frame, seine Werte (0.28+0.78*lum etc.) waren wirkungsloses Schein-Tuning. Gesetz "EIN Schreiber je Zustand" gilt jetzt auch hier; Fog schreibt Zeile ~2085 aus scene.fog.
    _reflU.uSunColW.value.copy(_wSun).multiplyScalar((0.4 + 0.9 * atm.lum) * (0.35 + 0.65 * wxSun)); // Spec-Farbe = Rayleigh-Sonnenfarbe x Transmission -> Sonnenuntergang: oranger Pfad; bedeckt: gedimmt
    _reflU.uWind.value = wxWind; // Wind treibt die Wellen-Steilheit: Sturm -> kabbeliger See
    if (_impMat) {
        const iu = _impMat.uniforms;
        iu.uSunDir.value.copy(_wSunPos); // die ECHTE Sonnenrichtung -> Gegenlicht-Silhouetten bei tiefer Sonne
        iu.uSunCol.value.copy(keyLight.color).multiplyScalar(keyLight.intensity * 0.46); // FIX v28: 0.36->0.46 — kalibriert gegen das reale Rig: 3D-Krone ~ alb*(key*NdotL + IBL + Rim) ≈ 1.3-2.0*alb; die Karte lag bei 0.4-0.75*alb (Screenshots: dunkle Platten)
        iu.uHemiCol.value
            .copy(hemiL.color)
            .multiplyScalar(hemiL.intensity * 1.4)
            .addScalar(0.06 + 0.3 * atm.lum); // Streulicht-Floor vertritt IBL+Fresnel-Rim der 3D-Baeume — skaliert mit Tageslicht (nachts 0.06, sonst wuerden Karten im Dunkeln gluehen)
        iu.uTime.value = WIND.uTime.value;
        iu.uWind.value = WIND.uWindStrength.value;
    } // Fern-Kronen pendeln im selben Wind wie die nahen
    if (scene && scene.background && scene.background.isColor) scene.background.copy(_w1);
    if (scene && scene.fog) scene.fog.color.copy(_w1);
    if (forestMode && scene && scene.fog) {
        // UNTERWASSER-GESETZ: unter der Oberflaeche wird die Atmosphaere zum Wasserkoerper -> Fog/BG = Beer-Lambert-Wasserfarbe x Tageslicht, kurze Sicht, Volumetrik aus
        const _ws = waterSurfaceAt(camera.position.x, camera.position.z);
        _camUnder = _ws !== null && camera.position.y < _ws - 0.12;
        if (_camUnder) {
            const dl = 0.2 + 0.8 * atm.lum; // Tageslicht dringt ein: nachts fast schwarz, mittags tuerkis
            _w3.setRGB(Math.exp(-6.5 * 0.3), Math.exp(-2.0 * 0.3), Math.exp(-1.2 * 0.3)).multiplyScalar(dl); // gleiche Absorption wK=(6.5,2.0,1.2) wie im Wasser-Shader
            scene.fog.color.copy(_w3);
            if (scene.background && scene.background.isColor) scene.background.copy(_w3);
            scene.fog.near = 0.3;
            scene.fog.far = 7.5;
        } else {
            scene.fog.near = _sightDist * 0.35;
            scene.fog.far = _sightDist;
        } // Ueber-Wasser-Gesetz jeden Frame reasserted (Sichtweite-Regler bleibt die Quelle)
        if (_impMat) {
            _impMat.uniforms.uFogColor.value.copy(scene.fog.color);
            _impMat.uniforms.uFogNear.value = scene.fog.near;
            _impMat.uniforms.uFogFar.value = scene.fog.far;
        } // Billboards gehorchen DEMSELBEN Fog-Gesetz wie die Szene (Sichtweite-Regler + Unterwasser) -> nichts schwebt scharf durch die Nebelwand
    } else _camUnder = false;
    if (_skyDome) {
        const u = _skyDome.material.uniforms;
        u.uTop.value.copy(_w1).multiplyScalar(0.8);
        u.uHor.value.copy(_w1);
        u.uBot.value.copy(_w1).multiplyScalar(0.52);
        u.uHaze.value = clamp(wxGrey * 0.55 + wxFog * 0.45, 0, 1); // Nebel -> Himmel flacht zum Horizont ab
        u.uTime.value = typeof WIND !== "undefined" && WIND.uTime ? WIND.uTime.value : WTIME * 60;
        u.uCover.value = clamp(0.12 + wxGrey * 0.85, 0, 1); // klar: Schleier; bewoelkt/sturm: Decke
        u.uSunDir.value.copy(_wSunPos);
        u.uSunCol.value.copy(_wSun);
        if (camera) {
            _skyDome.position.copy(camera.position);
            _skyDome.scale.setScalar(Math.max(60, (camera.far || 300) * 0.85));
        }
    }
    if (typeof volPass !== "undefined" && volPass) {
        volPass.uniforms.uSunColor.value.copy(_wSun);
        volPass.uniforms.uSunDir.value.copy(_wSunPos);
        volPass.uniforms.uFogColor.value.copy(_w1).lerp(_w3.set(0xffffff), 0.12);
        if (forestMode) {
            const shaftGate = clamp(day * (0.25 + 0.75 * wxSun) * wSS(0.03, 0.24, e), 0, 1); // Schaefte NUR bei hoher, klarer Sonne (Morgen/Nacht/truebe -> 0)
            volPass.enabled = shaftGate > 0.04 && !_camUnder; // sonst Pass AUS: nur der billige THREE.Fog, kein 16-Schritt-Marsch -> Leistung zurueck; unter Wasser keine Luft-Schaefte
            volPass.uniforms.uAdditiveOnly.value = 1.0;
            volPass.uniforms.uTerrainFog.value = 1.0; // additiv: nur Schaefte, KEIN zweiter Nebel-Wasch (Szene bleibt scharf)
            volPass.uniforms.uDensity.value = 1.7 * shaftGate;
            volPass.uniforms.uMaxDist.value = 46.0;
        }
        volPass.uniforms.uExtinct.value = lerp(0.1, 0.42, wxFog);
        volPass.uniforms.uFogTopH.value = lerp(3.2, 9.0, wxFog);
        volPass.uniforms.uFogBright.value = lerp(0.5, 0.82, day) * (0.7 + 0.5 * wxGrey);
    }
}
// ===== GELAENDE-HOEHENKARTE: der Nebel liest die lokale Bodenhoehe -> Schicht mit Gewicht, folgt dem Boden, sammelt sich in Senken =====
let _terrainMap = null,
    _terrLow = 0,
    _terrHigh = 10;
function bakeTerrainMap() {
    const RES = 96,
        R = 64;
    const data = new Float32Array(RES * RES * 4);
    const W = water();
    let lo = 1e9,
        hi = -1e9;
    for (let gz = 0; gz < RES; gz++)
        for (let gx = 0; gx < RES; gx++) {
            const x = (gx / (RES - 1) - 0.5) * 2 * R,
                z = (gz / (RES - 1) - 0.5) * 2 * R;
            const th = forestGroundH(x, z);
            const dLo = Math.hypot(x - W.pondLo.x, z - W.pondLo.z) - W.pondLo.rs,
                dHi = Math.hypot(x - W.pondHi.x, z - W.pondHi.z) - W.pondHi.rs,
                dS = _streamDH(x, z)[0] - W.CW;
            const dW = Math.min(dLo, dHi, dS),
                wet = Math.max(0, 1 - Math.max(dW, 0) / 8); // 1 am Wasser -> 0 ab 8m
            const o = (gz * RES + gx) * 4;
            data[o] = th;
            data[o + 1] = wet;
            data[o + 2] = 0;
            data[o + 3] = 1;
            if (th < lo) lo = th;
            if (th > hi) hi = th;
        }
    _terrainMap = new THREE.DataTexture(data, RES, RES, THREE.RGBAFormat, THREE.FloatType);
    _terrainMap.minFilter = THREE.LinearFilter;
    _terrainMap.magFilter = THREE.LinearFilter;
    _terrainMap.wrapS = _terrainMap.wrapT = THREE.ClampToEdgeWrapping;
    _terrainMap.needsUpdate = true;
    _terrLow = lo;
    _terrHigh = hi;
    if (volPass) {
        volPass.uniforms.uTerrainMap.value = _terrainMap;
        volPass.uniforms.uChunkR.value = R;
        volPass.uniforms.uLowElev.value = lo;
        volPass.uniforms.uHighElev.value = hi;
    }
}
// ===== FROXEL-TRANSMITTANZ-VOLUMEN: die Welt erzeugt ihre eigene Beleuchtung =====
// "Wie viel Sonne erreicht diesen Weltpunkt" — Beer-Lambert durch die Kronen, analytisch, einmal pro Sonnen-Schritt.
// Der volumetrische Nebel LIEST dieses Gitter (1 Trilinear-Lookup), statt pro Pixel durch die Schattenkarte zu marschieren.
let _lightVol = null,
    _lastBakeSun = new THREE.Vector3(999, 0, 0),
    _forestTrees = null,
    _lvLastMs = 0;
const _lvCache = new Map(),
    _lvOrigin = new THREE.Vector3(-64, -4, -64),
    _lvSizeV = new THREE.Vector3(128, 30, 128); // Zyklus-Speicher: Slot(Tageszeit) -> Volumen-Daten; Kronen sind statisch je Build -> Cache lebt bis zum naechsten buildForest
function bakeLightVolume(crowns, sunDir, origin, size, res) {
    const NX = res[0],
        NY = res[1],
        NZ = res[2],
        data = new Float32Array(NX * NY * NZ);
    const sx = sunDir.x,
        sy = sunDir.y,
        sz = sunDir.z;
    for (let kz = 0; kz < NZ; kz++)
        for (let ky = 0; ky < NY; ky++)
            for (let kx = 0; kx < NX; kx++) {
                const wx = origin.x + ((kx + 0.5) / NX) * size.x,
                    wy = origin.y + ((ky + 0.5) / NY) * size.y,
                    wz = origin.z + ((kz + 0.5) / NZ) * size.z;
                let tau = 0;
                for (let c = 0; c < crowns.length; c++) {
                    const cr = crowns[c];
                    const ox = cr.x - wx,
                        oy = cr.y - wy,
                        oz = cr.z - wz,
                        tca = ox * sx + oy * sy + oz * sz; // Projektion auf den Sonnenstrahl
                    if (tca < 0) continue;
                    const d2 = ox * ox + oy * oy + oz * oz - tca * tca,
                        r2 = cr.r * cr.r;
                    if (d2 >= r2) continue; // Strahl verfehlt die Krone
                    tau += (2 * Math.sqrt(r2 - d2) * cr.d) / cr.r; // Sehnenlaenge -> optische Tiefe
                }
                data[kx + NX * (ky + NY * kz)] = Math.exp(-tau);
            }
    _lvApplyData(data, NX, NY, NZ, origin, size);
    return data;
}
function _lvApplyData(data, NX, NY, NZ, origin, size) {
    // Volumen -> 3D-Textur (auch fuer Zyklus-Speicher-Replay: memcpy statt 46k-Voxel-Marsch)
    if (_lightVol) _lightVol.dispose();
    _lightVol = new THREE.DataTexture3D(data, NX, NY, NZ);
    _lightVol.format = THREE.RedFormat;
    _lightVol.type = THREE.FloatType;
    _lightVol.minFilter = THREE.LinearFilter;
    _lightVol.magFilter = THREE.LinearFilter;
    _lightVol.wrapR = _lightVol.wrapS = _lightVol.wrapT = THREE.ClampToEdgeWrapping;
    _lightVol.needsUpdate = true;
    if (volPass) {
        volPass.uniforms.uLightVol.value = _lightVol;
        volPass.uniforms.uVolOrigin.value.copy(origin);
        volPass.uniforms.uVolSize.value.copy(size);
    }
}
function _studioCrowns() {
    // Krone(n) aus der Bounding-Box des Studio-Subjekts
    const box = new THREE.Box3().setFromObject(subject),
        c = box.getCenter(new THREE.Vector3()),
        sz = box.getSize(new THREE.Vector3());
    const crowns = [],
        top = box.min.y + sz.y * 0.6,
        rr = Math.max(sz.x, sz.z) * 0.3;
    for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * 6.2831,
            rad = i === 0 ? 0 : rr * 0.85;
        crowns.push({
            x: c.x + Math.cos(ang) * rad,
            y: top + (i % 2 ? rr * 0.4 : 0),
            z: c.z + Math.sin(ang) * rad,
            r: rr,
            d: 1.0,
        });
    }
    const pad = Math.max(sz.x, sz.z) * 0.7 + 2;
    return {
        crowns,
        origin: new THREE.Vector3(c.x - pad, box.min.y - 0.5, c.z - pad),
        size: new THREE.Vector3(pad * 2, sz.y + 3, pad * 2),
    };
}
function refreshLightVolume(force) {
    // backt nur neu, wenn die Sonne sich gedreht hat (sonst Cache)
    if (!volPass || !volPass.enabled) return;
    const nowMs = performance.now();
    if (!force && (nowMs - _lvLastMs < 600 || _heavyNow)) return; // PROFI-BUDGET: max ~1.7 Bakes/s (vorher ~6/s bei Zeit-Play) + Staffelung: nie zwei Schwergewichte im selben Frame
    const sun = keyLight ? keyLight.position.clone().normalize() : new THREE.Vector3(0.5, 0.8, 0.4);
    if (!force && sun.dot(_lastBakeSun) > 0.9986) return; // < ~3 Grad -> Gitter behalten, kein Re-Bake
    if (forestMode) {
        const slot = Math.floor((((WTIME % 24) + 24) % 24) * 2); // ZYKLUS-SPEICHER (deterministischer Tag!): 48 Slots a 30 Spielminuten
        const hit = _lvCache.get(slot);
        if (hit) {
            _lvApplyData(hit, 48, 20, 48, _lvOrigin, _lvSizeV);
            _lastBakeSun.copy(sun);
            _lvLastMs = nowMs;
            return;
        } // Tag 2+: Replay aus dem Speicher, NULL Voxel-Marsch
        _lastBakeSun.copy(sun);
        _lvLastMs = nowMs;
        if (!force) _heavyNow = true;
        const crowns = (_forestTrees || []).map((t) => ({ x: t.x, y: t.y + t.T * 1.1, z: t.z, r: t.T, d: 0.95 }));
        _lvCache.set(slot, bakeLightVolume(crowns, sun, _lvOrigin, _lvSizeV, [48, 20, 48])); // erster Durchlauf zahlt (budgetiert), jeder weitere Tag ist gratis
    } else {
        _lastBakeSun.copy(sun);
        _lvLastMs = nowMs;
        if (!force) _heavyNow = true;
        const c = _studioCrowns();
        bakeLightVolume(c.crowns, sun, c.origin, c.size, [24, 24, 24]);
    }
}
function initReflection() {
    if (_reflRT) return;
    const w = Math.max(256, Math.min(960, Math.floor(innerWidth * 0.5))),
        h = Math.max(256, Math.min(540, Math.floor(innerHeight * 0.5)));
    _reflRT = new THREE.WebGLRenderTarget(w, h, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBFormat,
    });
    _reflCam = new THREE.PerspectiveCamera(camera.fov, camera.aspect, camera.near, camera.far);
    _reflCam.layers.set(0); // FIX v30: SPIEGEL-DIAET — die Reflexion rendert den Wald ein ZWEITES Mal; Layer-1-Laub fliegt raus (Kronen liefern dort die Billboards auf Layer 0). Bei uReflMix 0.22 + Wellenverzerrung unsichtbar, spart aber saemtliche Blatt-Dreiecke im Spiegelpass.
    _reflU.uReflMap.value = _reflRT.texture;
}
function _reflWaterH() {
    const W = water(),
        cx = camera.position.x,
        cz = camera.position.z;
    const sh = waterSurfaceAt(cx, cz);
    if (sh !== null) return sh;
    const dLo = Math.hypot(cx - W.pondLo.x, cz - W.pondLo.z) - W.pondLo.rs,
        dHi = Math.hypot(cx - W.pondHi.x, cz - W.pondHi.z) - W.pondHi.rs;
    const dSea = Math.max(0, -(seaward(cx, cz) + 4)); // Abstand zur Meer-Oberflaeche (existiert ab sward>=-4)
    return dSea < dLo && dSea < dHi ? SEA_LEVEL : dLo < dHi ? W.pondLo.wh : W.pondHi.wh; // naechstes Wasser bestimmt die Spiegel-Ebene -> am Strand spiegelt das MEER die Insel, nicht der Teich
}
function renderWaterReflection(H) {
    if (!_reflRT) return;
    // PERF: nur in Wassernaehe spiegeln. Weit weg KEIN Pass -> die Wasserflaeche bleibt sichtbar (nutzt Himmel), kein Ganz-Chunk-Render pro Frame.
    const prox = _waterProximity();
    if (!window.__phytoWaterLogged) {
        window.__phytoWaterLogged = true;
        try {
            console.log(
                "[phyto] WATER: meshes=" +
                    _waterMeshes.length +
                    " prox=" +
                    (isFinite(prox) ? prox.toFixed(1) : prox) +
                    " reflRT=" +
                    !!_reflRT
            );
        } catch (_) {}
    }
    if (!(prox < 46.0)) {
        _reflU.uReflMix.value *= 0.85;
        return;
    } // weit weg -> Spiegelung aus, Wasser unberuehrt (Frueh-Return VOR jeglichem visible-Toggle)
    _rP.set(0, H, 0);
    const cp = camera.position;
    _rV.subVectors(_rP, cp);
    if (_rV.dot(_rN) > 0) {
        _reflU.uReflMix.value = 0.0;
        return;
    } // Kamera unter Wasser -> keine Spiegelung
    _rV.reflect(_rN).negate().add(_rP);
    _reflCam.position.copy(_rV); // gespiegelte Position
    _rRot.extractRotation(camera.matrixWorld);
    _rL.set(0, 0, -1).applyMatrix4(_rRot).add(cp);
    _rT.subVectors(_rP, _rL).reflect(_rN).negate().add(_rP); // gespiegeltes Blickziel
    _rU.set(0, 1, 0).applyMatrix4(_rRot).reflect(_rN);
    _reflCam.up.copy(_rU);
    _reflCam.lookAt(_rT);
    _reflCam.updateMatrixWorld();
    _reflCam.matrixWorldInverse.copy(_reflCam.matrixWorld).invert();
    _reflCam.projectionMatrix.copy(camera.projectionMatrix); // ORIGINAL saubere Projektion -> keine entartete Matrix, kein NaN
    _reflU.uReflMatrix.value.copy(_rBias).multiply(_reflCam.projectionMatrix).multiply(_reflCam.matrixWorldInverse);
    // schraeges Near-Plane-Clipping an der Wasserebene -> kein Teichgrund in der Spiegelung
    _reflPlane.setFromNormalAndCoplanarPoint(_rN, _rP);
    _reflPlane.applyMatrix4(_reflCam.matrixWorldInverse);
    _clipV.set(_reflPlane.normal.x, _reflPlane.normal.y, _reflPlane.normal.z, _reflPlane.constant);
    const P = _reflCam.projectionMatrix.elements;
    _qV.set((Math.sign(_clipV.x) + P[8]) / P[0], (Math.sign(_clipV.y) + P[9]) / P[5], -1.0, (1.0 + P[10]) / P[14]);
    const denom = _clipV.dot(_qV);
    if (Math.abs(denom) > 1e-6) {
        _clipV.multiplyScalar(2.0 / denom);
        P[2] = _clipV.x;
        P[6] = _clipV.y;
        P[10] = _clipV.z + 1.0;
        P[14] = _clipV.w;
    }
    for (let i = 0; i < _waterMeshes.length; i++) _waterMeshes[i].visible = false;
    const oS = renderer.shadowMap.enabled;
    renderer.shadowMap.enabled = false;
    const oF = _folDepthU.uFolEnable.value;
    _folDepthU.uFolEnable.value = 0.0;
    const oRT = renderer.getRenderTarget(),
        oAC = renderer.autoClear;
    renderer.autoClear = true;
    try {
        renderer.setRenderTarget(_reflRT);
        renderer.render(scene, _reflCam);
    } finally {
        renderer.setRenderTarget(oRT);
        renderer.autoClear = oAC;
        renderer.shadowMap.enabled = oS;
        _folDepthU.uFolEnable.value = oF;
        for (let i = 0; i < _waterMeshes.length; i++) _waterMeshes[i].visible = true; // Wasser IMMER wieder sichtbar
    }
    _reflU.uReflMix.value = 0.22;
}
function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    const dt = Math.min(0.05, t - lastFrameT);
    lastFrameT = t;
    _heavySkip = _heavyNow;
    _heavyNow = false;
    updateWorld(dt);
    WIND.uTime.value = t;
    cinePass.uniforms.time.value = t;
    // Boe: niederfrequente Schwankung
    WIND.uGust.value = 0.7 + 0.5 * Math.sin(t * 0.8) + 0.3 * Math.sin(t * 1.73 + 1.0);
    WIND.uWindStrength.value += (Math.max(windTarget, wxWind) - WIND.uWindStrength.value) * 0.04;
    SEASON.uLeafPresence.value += (presenceTarget - SEASON.uLeafPresence.value) * 0.06;
    SEASON.uBloom.value += (bloomTarget - SEASON.uBloom.value) * 0.06;
    if (_rain) {
        const rm = _rain.material,
            top = clamp(wxRain * 0.72, 0, 0.72);
        rm.opacity += (top - rm.opacity) * 0.04;
        if (rm.opacity > 0.012) {
            _rain.visible = true;
            const ext = _rain.userData.ext,
                rp = _rain.geometry.attributes.position,
                fall = dt * 42,
                drift = dt * Math.max(wxWind, 0.1) * 7;
            _rain.position.set(camera.position.x, camera.position.y - ext[1] * 0.5, camera.position.z);
            for (let i = 0; i < rp.count; i += 2) {
                let y0 = rp.getY(i),
                    y1 = rp.getY(i + 1),
                    x0 = rp.getX(i),
                    x1 = rp.getX(i + 1);
                y0 -= fall;
                y1 -= fall;
                x0 += drift;
                x1 += drift;
                if (y0 < 0) {
                    y0 += ext[1];
                    y1 += ext[1];
                }
                if (x0 > ext[0] * 0.5) {
                    x0 -= ext[0];
                    x1 -= ext[0];
                }
                rp.setXYZ(i, x0, y0, rp.getZ(i));
                rp.setXYZ(i + 1, x1, y1, rp.getZ(i + 1));
            }
            rp.needsUpdate = true;
        } else _rain.visible = false;
    }
    // FIX v29: LOD-VERWALTUNG LAEUFT, SOBALD EINE INSEL EXISTIERT — vorher nur im forestMode: das Showcase fror ein (identische Dreieckszahl trotz Kamerafahrt, stale Gras-Kacheln, kahle Naehe)
    if (_grassTiles.length) {
        const cx = camera.position.x,
            cz = camera.position.z,
            fogT = scene && scene.fog ? scene.fog.far + 6 : 1e9;
        for (let i = 0; i < _grassTiles.length; i++) {
            const m = _grassTiles[i],
                dx = m.userData.tcx - cx,
                dz = m.userData.tcz - cz,
                k = m.userData.tileKind,
                lim = Math.min(k === "pebble" ? 46 : k === "shrub" ? 88 : 67, fogT);
            const d2 = dx * dx + dz * dz,
                st = m.userData.tileStage;
            // LOD-WURZEL (08.07.): zweistufige Kacheln — nah-Stufe bis LOD_D0(+2), fern-Stufe
            // ab LOD_D0(−2) bis zum Art-Limit (der ±2-m-Ueberlapp deckt den Wechsel: kein Loch,
            // kein Flackern); einstufige Kacheln behalten das alte Limit-Gesetz byte-gleich.
            if (st === "near") {
                const nl = Math.min(LOD_D0 + 2, lim);
                m.visible = d2 < nl * nl;
            } else if (st === "far") {
                const nf = Math.max(0, LOD_D0 - 2);
                m.visible = d2 >= nf * nf && d2 < lim * lim;
            } else {
                m.visible = d2 < lim * lim;
            }
        }
    } // pro Art statt pauschal 60m — UND nie jenseits der Nebelwand (FIX v30)
    if (_treeLOD.length) {
        _impT += dt;
        if (_impT > 0.3) {
            _impT = 0;
            if (_impRT) {
                const _isig = _impSpecs.map((s) => s.sp + s.seed).join(",");
                if (_isig !== _impBakedSig) {
                    bakeImpostorAtlas();
                    _heavyNow = true;
                }
            }
        } // NUR bei neuen Seeds (Nutzeraktion). Saison kostet den Atlas NICHTS mehr: Praesenz-Erosion + Tint laufen als Uniform im Shader
        _lodT += dt;
        {
            const dx = camera.position.x - _lodCx,
                dz = camera.position.z - _lodCz;
            if (_lodT > 0.25 || dx * dx + dz * dz > 1.0) {
                _lodT = 0;
                _lodCx = camera.position.x;
                _lodCz = camera.position.z;
                updateTreeLOD();
            }
        } // Baum-LOD nach Distanz (reagiert ab 1m Bewegung -> begrenzt die Drift < Hysterese-Rand M, auch im Flug/Orbit)
    }
    if (forestMode) {
        if (plControls && (plControls.isLocked || plFallback)) {
            // PORTAL-FIX V18.384: im Fallback laufen WASD/Fliegen ohne Lock (Umsehen = Ziehen)
            if (flyMode) {
                const f = 24 * dt;
                camera.getWorldDirection(_fwd);
                _rgt.crossVectors(_fwd, camera.up).normalize();
                if (move.fwd) camera.position.addScaledVector(_fwd, f);
                if (move.back) camera.position.addScaledVector(_fwd, -f);
                if (move.left) camera.position.addScaledVector(_rgt, -f);
                if (move.right) camera.position.addScaledVector(_rgt, f);
                if (move.up) camera.position.y += f;
                if (move.run) camera.position.y -= f;
            } else {
                const run = move.run;
                // BESCHLEUNIGUNG + normalisierte Eingabe: keine schnelle Diagonale, Strafe bewusst langsamer, weiches Anlaufen/Stoppen
                let ix = (move.right ? 1 : 0) - (move.left ? 1 : 0),
                    iz = (move.fwd ? 1 : 0) - (move.back ? 1 : 0);
                const il = Math.hypot(ix, iz);
                if (il > 0) {
                    ix /= il;
                    iz /= il;
                }
                const gY = forestGroundH(camera.position.x, camera.position.z) + 1.7;
                const wsp = waterSurfaceAt(camera.position.x, camera.position.z);
                const _swim = wsp !== null && gY < wsp + 0.35; // AUFTRIEB: wuerde das stehende Auge unter (Oberflaeche+0.35) sinken, traegt das Wasser den Koerper
                const maxSp = (run ? 12.5 : 5.4) * (_swim ? 0.5 : 1.0),
                    k = 1 - Math.exp(-11 * dt); // Schwimmen: halbes Tempo (Wasserwiderstand)
                velF += (iz * maxSp - velF) * k;
                velR += (ix * maxSp * 0.78 - velR) * k; // Strafe 0.78x -> fuehlt sich natuerlich an
                if (Math.abs(velF) > 1e-4) plControls.moveForward(velF * dt);
                if (Math.abs(velR) > 1e-4) plControls.moveRight(velR * dt);
                // KRITISCH GEDAEMPFTE KOERPER-FEDER ueber das Gelaende: Buckel werden absorbiert statt hart nachgezogen; im Tiefwasser federt sie zur Wasserlinie
                const targetY = _swim ? wsp + 0.35 : gY,
                    stiff = 90,
                    damp = 2 * Math.sqrt(90);
                eyeVel += (-(eyeY - targetY) * stiff - eyeVel * damp) * dt;
                eyeY += eyeVel * dt;
                // KOPF-WIPPEN: vertikal 2 Schritte/Zyklus + Landungs-Dip, Amplitude aus Tempo (0 im Stand); im Wasser stark gedaempft (kein Stapfen)
                const spd = Math.hypot(velF, velR),
                    sn = Math.min(spd / maxSp, 1);
                bobPhase += dt * (5.2 + spd * 0.55);
                const bobY =
                    (Math.sin(bobPhase * 2.0) * 0.55 + Math.sin(bobPhase) * 0.18) *
                    sn *
                    (run ? 0.1 : 0.065) *
                    (_swim ? 0.3 : 1.0);
                camera.position.y = eyeY + bobY;
            }
        }
        // DYNAMISCHE AUFLOESUNG: haelt die per Schieber gewaehlte Ziel-fps (30-60), indem NUR die Render-Aufloesung nachgibt
        if (!_heavySkip) _frMs += (dt * 1000 - _frMs) * 0.1;
        const _tMs = 1000 / _fpsTarget; // Spike-Isolation: der Frame NACH einem Bake traegt dessen Kosten -> nicht in die Aufloesungs-Regelung einspeisen (kein falsches Runterschalten)
        _rsT += dt;
        if (_rsT > 0.5) {
            _rsT = 0;
            const capR = Math.min(devicePixelRatio, 1.3);
            if (_frMs > _tMs * 1.1 && _rScale > 0.6)
                setRenderScale(_rScale - 0.1); // FIX v30: ZIELSUCHEND statt Ratsche. Vorher: hoch erst bei _tMs*0.78 -> bei Ziel 30 musste die Szene 38.5fps schaffen, um von 60% wegzukommen; einmal unten = fuer immer unten. Jetzt pendelt das System AUF das Ziel ein: tieferes FPS-Ziel kauft aktiv Schaerfe.
            else if (_frMs < _tMs * 0.92 && _rScale < capR) setRenderScale(_rScale + 0.05);
        } // Deadband 0.92-1.10 bleibt breit genug gegen Pulsieren (Schritt runter 2x Schritt hoch daempft zusaetzlich)
        _fpsAcc += dt;
        _fpsN++;
        if (_fpsAcc >= 0.5) {
            const fps = Math.round(_fpsN / _fpsAcc);
            _fpsAcc = 0;
            _fpsN = 0;
            if (!_ctrlPanel) {
                _ctrlPanel = document.createElement("div");
                _ctrlPanel.style.cssText =
                    "position:fixed;top:10px;right:12px;z-index:50;font:600 11px ui-monospace,monospace;color:#cfe;background:rgba(0,0,0,.42);padding:8px 10px;border-radius:8px;width:154px;user-select:none";
                _fpsEl = document.createElement("div");
                _fpsEl.style.cssText = "margin-bottom:4px;color:#dff";
                _ctrlPanel.appendChild(_fpsEl);
                const mkRow = (label, min, max, step, val, fn) => {
                    const w = document.createElement("div");
                    w.style.cssText = "margin-top:6px";
                    const l = document.createElement("div");
                    l.textContent = label;
                    l.style.cssText = "opacity:.82;margin-bottom:1px;font-weight:500";
                    const sl = document.createElement("input");
                    sl.type = "range";
                    sl.min = min;
                    sl.max = max;
                    sl.step = step;
                    sl.value = val;
                    sl.style.cssText = "width:100%;accent-color:#6cc;cursor:pointer";
                    sl.oninput = () => fn(+sl.value);
                    w.appendChild(l);
                    w.appendChild(sl);
                    _ctrlPanel.appendChild(w);
                    return sl;
                };
                _fpsSlider = mkRow("Ziel-FPS  (scharf - fluessig)", 30, 60, 5, _fpsTarget, (v) => {
                    _fpsTarget = v;
                });
                _folSlider = mkRow("Laub-Aufloesung", 25, 100, 5, Math.round(_folRes * 100), (v) => {
                    _folRes = v / 100;
                    if (_foliagePass) _foliagePass.resizeFol();
                });
                _sightSlider = mkRow("Sichtweite  (Dunst)", 40, 120, 5, _sightDist, (v) => {
                    _sightDist = v;
                    if (scene.fog) {
                        scene.fog.far = _sightDist;
                        scene.fog.near = _sightDist * 0.35;
                    }
                    camera.far = _sightDist + 20;
                    camera.updateProjectionMatrix();
                });
                document.body.appendChild(_ctrlPanel);
            }
            _ctrlPanel.style.display = "";
            _fpsEl.textContent =
                fps +
                " fps · " +
                Math.round(_rScale * 100) +
                "% · Laub " +
                Math.round(_folRes * 100) +
                "% · " +
                _dcLast +
                "dc · " +
                Math.round(_triLast / 1000) +
                "k▲";
        }
    } else {
        controls.autoRotate = showcase;
        controls.update();
        if (_ctrlPanel) _ctrlPanel.style.display = "none";
        if (_stuBB) {
            if (_stuBB.mesh.parent) {
                const dx = camera.position.x - _stuBB.mesh.position.x,
                    dz = camera.position.z - _stuBB.mesh.position.z;
                const ang = Math.atan2(dx, dz);
                _stuBB.mesh.rotation.y = ang; // Y-Billboard: Quad folgt der Kamera
                const vv = ((Math.round(ang / ((Math.PI * 2) / _stuBB.V)) % _stuBB.V) + _stuBB.V) % _stuBB.V; // Blickwinkel -> Atlas-Zeile: die richtige SEITE des Baums dreht mit (exakt der Wald-Mechanismus)
                _stuBB.tex.offset.y = vv / _stuBB.V;
            } else _stuBB = null;
        }
    }
    if (forestMode) {
        camera.updateMatrixWorld(true);
        camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
    } // frische Kamera-Matrix fuer Spiegelung
    if (volPass && volPass.enabled) {
        camera.updateMatrixWorld(true);
        camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
        _invVP.copy(camera.projectionMatrix).multiply(camera.matrixWorldInverse).invert();
        volPass.uniforms.uInvVP.value.copy(_invVP);
        volPass.uniforms.uCamPos.value.copy(camera.position);
        volPass.uniforms.uTime.value = t;
        if (forestMode && _foliagePass) volPass.uniforms.uDepth.value = _foliagePass.rtS.depthTexture;
        if (_terrainMap) volPass.uniforms.uTerrainMap.value = _terrainMap;
        refreshLightVolume(false); // Re-Bake nur bei Sonnenbewegung -> sonst reiner Lookup
    }
    if (forestMode && _reflRT) {
        try {
            renderWaterReflection(_reflWaterH());
        } catch (e) {
            if (!window.__phytoReflErr) {
                window.__phytoReflErr = 1;
                console.error("[phyto] WATER reflection threw:", e);
            }
        }
    }
    if (forestMode && _forestShadowDirty && !_heavyNow) {
        _forestShadowDirty = false;
        _heavyNow = true;
        try {
            bakeForestShadow();
        } catch (e) {
            if (!window.__phytoBakeErr) {
                window.__phytoBakeErr = 1;
                console.error("[phyto] SHADOW bake threw:", e);
            }
        }
    } // Staffelung: nie zwei Schwergewichte im selben Frame (dirty bleibt stehen, naechster Frame uebernimmt)
    if (taaPass) {
        const _on = forestMode && _foliagePass && _foliagePass.rtS && _foliagePass.rtS.depthTexture;
        taaPass.enabled = !!_on;
        if (_on) {
            camera.updateMatrixWorld(true);
            camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
            _taaCurVP.copy(camera.projectionMatrix).multiply(camera.matrixWorldInverse);
            taaPass.uniforms.uInvVP.value.copy(_taaCurVP).invert();
            taaPass.uniforms.uPrevVP.value.copy(_taaPrevVP);
            taaPass.uniforms.uDepth.value = _foliagePass.rtS.depthTexture;
            _taaPrevVP.copy(_taaCurVP);
            _taaFrame = (_taaFrame + 1) & 63;
            _lodU.uDitherT.value = (_taaFrame * 0.61803398875) % 1; // Dither rotiert golden-ratio -> zeitliches Mittel = glatte Blende (statisch waere Mittel=Muster)
        } else {
            _lodU.uDitherT.value = 0;
        }
    } // Studio/aus: Dither statisch wie bisher (animiertes Dither OHNE TAA waere kriechendes Rauschen)
    composer.render(); // FXAA + Cine bleiben; im Wald ist nur Bloom abgeschaltet (siehe enterForest)
    _dcLast = renderer.info.render.calls;
    _triLast = renderer.info.render.triangles;
    renderer.info.reset(); // FIX v27: Totale NACH dem letzten Pass einsammeln, DANN reset. Vorher: reset am Frame-ANFANG + HUD-Read VOR composer.render -> las immer den frischen Nullstand (das "0dc·0k"-HUD war blind). Jetzt: ein Frame sammelt (autoReset=false), Ende des Frames liest & nullt -> ehrliche Zahlen inkl. Bake-Spikes.
    // ===== EINMALIGER LOD-SELBSTTEST: uebefuehrende Zahlen fuer die L1/L2-Jagd (Zustand, Attribut-Daten, Distanzen, aktive Programm-Attribute) =====
    if (forestMode && !window.__phytoLodTestDone) {
        window.__phytoLodTestFrames = (window.__phytoLodTestFrames || 0) + 1;
        if (window.__phytoLodTestFrames === 75) {
            window.__phytoLodTestDone = true;
            try {
                const cx = camera.position.x,
                    cz = camera.position.z;
                let ent = null,
                    best = 1e9;
                for (const e of _treeLOD) {
                    for (const p of e.placements) {
                        const dd = (p.x - cx) * (p.x - cx) + (p.z - cz) * (p.z - cz);
                        if (dd > 400 && dd < 1600 && dd < best) {
                            best = dd;
                            ent = e;
                        }
                    }
                } // Eintrag mit Baum im 20-40m-Band bevorzugen
                if (!ent) ent = _treeLOD[0];
                const gl2 = renderer.getContext();
                console.log(
                    "[phyto LOD-TEST] MAX_VERTEX_ATTRIBS=" +
                        gl2.getParameter(gl2.MAX_VERTEX_ATTRIBS) +
                        " | treeLOD-Eintraege=" +
                        _treeLOD.length +
                        " | Kamera=(" +
                        cx.toFixed(1) +
                        "," +
                        cz.toFixed(1) +
                        ") | Praesenz=" +
                        SEASON.uLeafPresence.value.toFixed(2) +
                        " | MaskeAn=" +
                        _lodU.uLodMaskOn.value
                );
                ["L0", "L1", "L2"].forEach((nm, L) => {
                    const ims = ent.meshesByLod[L];
                    const im = ims[0];
                    const a = im.geometry.attributes.aLodLevel;
                    console.log(
                        "[phyto LOD-TEST] " +
                            nm +
                            ": meshes=" +
                            ims.length +
                            " count=" +
                            im.count +
                            " visible=" +
                            im.visible +
                            " parent=" +
                            !!im.parent +
                            " layerMask=" +
                            im.layers.mask +
                            " aLod0=" +
                            (a ? a.array[0] : "FEHLT") +
                            " vtx=" +
                            im.geometry.attributes.position.count
                    );
                });
                let s = "";
                const _m4 = new THREE.Matrix4();
                const l1 = ent.meshesByLod[1][0];
                for (let j = 0; j < Math.min(3, l1.count); j++) {
                    l1.getMatrixAt(j, _m4);
                    s += " d" + j + "=" + Math.hypot(_m4.elements[12] - cx, _m4.elements[14] - cz).toFixed(1);
                }
                console.log("[phyto LOD-TEST] L1-Instanzdistanzen (soll 14-40):" + (s || " KEINE (count=0)"));
                const progs = (renderer.info && renderer.info.programs) || [];
                for (const p of progs) {
                    if (!p.program) continue;
                    const n = gl2.getProgramParameter(p.program, gl2.ACTIVE_ATTRIBUTES);
                    const names = [];
                    for (let i = 0; i < n; i++) {
                        const ai = gl2.getActiveAttrib(p.program, i);
                        if (ai) names.push(ai.name + "@" + gl2.getAttribLocation(p.program, ai.name));
                    }
                    if (names.some((x) => x.indexOf("aWind") >= 0))
                        console.log("[phyto LOD-TEST] Programm attrs: " + names.join(" "));
                }
                console.log(
                    "[phyto LOD-TEST] A/B: tippe PHYTO_LODMASK(0) -> erscheinen die 20-40m-Baeume? (JA=Maske/Attribut schuld, NEIN=Zustand/Geometrie)"
                );
            } catch (e) {
                console.warn("[phyto LOD-TEST] fail:", e.message);
            }
        }
    }
    // ===== EINMALIGE SELBST-MESSUNG (echtes GPU-Readback): beweist Schatten-Kontrast + Wasser-Sichtbarkeit auf deiner GPU =====
    if (forestMode && _foliagePass && !window.__phytoSelfTestDone) {
        window.__phytoSelfTestFrames = (window.__phytoSelfTestFrames || 0) + 1;
        if (window.__phytoSelfTestFrames === 45) {
            window.__phytoSelfTestDone = true;
            try {
                const rt = _foliagePass.rtS,
                    RW = rt.width,
                    RH = rt.height,
                    buf = new Uint8Array(RW * RH * 4);
                renderer.readRenderTargetPixels(rt, 0, 0, RW, RH, buf);
                const groundL = [];
                let waterPx = 0;
                for (let y = 0; y < RH; y++)
                    for (let x = 0; x < RW; x++) {
                        const i = (y * RW + x) * 4,
                            r = buf[i],
                            g = buf[i + 1],
                            b = buf[i + 2];
                        if (b > r + 18 && b > 70) waterPx++; // Wasser-Blau im ganzen Bild zaehlen
                        if (y < RH * 0.55 || x < RW * 0.2 || x > RW * 0.8) continue; // Bodenkontrast nur im unteren Mittelfeld
                        const L = (r + g + b) / 3;
                        if (L < 30 || b > r + 18) continue; // Staemme(dunkel)/Wasser(blau) raus -> reiner Boden
                        groundL.push(L);
                    }
                groundL.sort((a, b) => a - b);
                const q = (p) =>
                    groundL.length ? groundL[Math.min(groundL.length - 1, Math.floor(groundL.length * p))] : 0;
                const lo = q(0.08),
                    mid = q(0.5),
                    hi = q(0.92),
                    drop = hi > 0 ? Math.round(100 * (1 - lo / hi)) : 0;
                console.log(
                    "[phyto SELBSTTEST] Boden-Schatten: dunkel(p8)=" +
                        Math.round(lo) +
                        " hell(p92)=" +
                        Math.round(hi) +
                        " median=" +
                        Math.round(mid) +
                        " -> Drop=" +
                        drop +
                        "% " +
                        (drop >= 38 ? "SICHTBAR ✓" : "zu schwach ✗") +
                        " | Wasser-Pixel=" +
                        waterPx +
                        " " +
                        (waterPx > 400 ? "sichtbar ✓" : "kaum im Blick ✗")
                );
            } catch (e) {
                console.warn("[phyto SELBSTTEST] readback fail:", e.message);
            }
        }
    }
}
addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    composer.setSize(innerWidth, innerHeight);
    fxaa.uniforms["resolution"].value.set(1 / innerWidth, 1 / innerHeight);
});

/* ---------- UI-Verdrahtung ------------------------------------------------ */
function setSliders(pre) {
    if (pre.panel === "plant") {
        const s = pre.s;
        document.getElementById("sApi").value = s.api;
        document.getElementById("sDelta").value = s.delta;
        document.getElementById("sSlim").value = s.slim;
        document.getElementById("sTrop").value = s.trop;
        document.getElementById("sLeaf").value = s.leaf;
    } else {
        const s = pre.s;
        document.getElementById("rGen").value = s.gen;
        document.getElementById("rSph").value = s.sph;
        document.getElementById("rElo").value = s.elong;
        document.getElementById("rRnd").value = s.rnd;
        document.getElementById("rRgh").value = s.rgh;
        document.getElementById("rStr").value = s.str;
    }
    refreshVals();
}
function refreshVals() {
    const map = {
        sApi: "vApi",
        sDelta: "vDelta",
        sSlim: "vSlim",
        sTrop: "vTrop",
        sLeaf: "vLeaf",
        rGen: "vGen",
        rSph: "vSph",
        rElo: "vElo",
        rRnd: "vRnd",
        rRgh: "vRgh",
        rStr: "vStr",
    };
    for (const id in map) {
        const el = document.getElementById(id);
        if (el) document.getElementById(map[id]).textContent = parseFloat(el.value).toFixed(2);
    }
}
let rebuildTimer = null;
function debouncedBuild() {
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(build, 180);
}
function setVal(id, v) {
    const el = document.getElementById(id);
    if (el) el.value = v;
}
function diceAll() {
    const ids = Object.keys(PRESETS);
    CURRENT = ids[Math.floor(Math.random() * ids.length)];
    const pre = PRESETS[CURRENT];
    document.querySelectorAll("#ui [data-p]").forEach((x) => x.classList.toggle("active", x.dataset.p === CURRENT));
    document.getElementById("panelPlant").classList.toggle("hidden", pre.panel !== "plant");
    document.getElementById("panelRock").classList.toggle("hidden", pre.panel !== "rock");
    const rr = (a, b) => a + Math.random() * (b - a);
    if (pre.panel === "plant") {
        setVal("sApi", rr(0.12, 0.95));
        setVal("sDelta", rr(2.0, 2.5));
        setVal("sSlim", rr(0.2, 0.85));
        setVal("sTrop", rr(-0.2, 0.9));
        setVal("sLeaf", rr(0.35, 0.9));
    } else {
        setVal("rGen", rr(0.05, 0.95));
        setVal("rSph", rr(0.2, 0.8));
        setVal("rElo", rr(0.1, 0.7));
        setVal("rRnd", rr(0.1, 0.8));
        setVal("rRgh", rr(0.3, 0.7));
        setVal("rStr", rr(0.05, 0.85));
    }
    refreshVals();
    SEED = Math.floor(Math.random() * 1e6);
    if (forestMode) rebuildForestInPlace();
    else build();
}
function wireUI() {
    document.querySelectorAll("#ui [data-p]").forEach((b) =>
        b.addEventListener("click", () => {
            document.querySelectorAll("#ui [data-p]").forEach((x) => x.classList.remove("active"));
            b.classList.add("active");
            CURRENT = b.dataset.p;
            const pre = PRESETS[CURRENT];
            document.getElementById("panelPlant").classList.toggle("hidden", pre.panel !== "plant");
            document.getElementById("panelRock").classList.toggle("hidden", pre.panel !== "rock");
            setSliders(pre);
            build();
        })
    );
    ["sApi", "sDelta", "sSlim", "sTrop", "sLeaf", "rGen", "rSph", "rElo", "rRnd", "rRgh", "rStr"].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("input", () => {
            refreshVals();
            debouncedBuild();
        });
    });
    document.querySelectorAll("#ui [data-w]").forEach((b) =>
        b.addEventListener("click", () => {
            document.querySelectorAll("#ui [data-w]").forEach((x) => x.classList.remove("active"));
            b.classList.add("active");
            const w = parseInt(b.dataset.w);
            windTarget = w === 0 ? 0.05 : w === 1 ? 0.45 : 1.1;
        })
    );
    document.querySelectorAll("#ui [data-s]").forEach((b) =>
        b.addEventListener("click", () => {
            document.querySelectorAll("#ui [data-s]").forEach((x) => x.classList.remove("active"));
            b.classList.add("active");
            const m = { spring: 0.0, summer: 0.25, autumn: 0.5, winter: 0.75 };
            WSEASON = b.dataset.s in m ? m[b.dataset.s] : 0.25;
            _lastSeasonBuild = WSEASON;
            if (_seasonSlider) _seasonSlider.value = WSEASON;
            if (_seasonVal) _seasonVal.textContent = SEASON_NAMES[Math.floor(WSEASON * 8) % 8];
            worldRebuild();
        })
    );
    // ===== WELT-Steuerung: Tageszeit / Wetter / Jahreszeit + Autoplay =====
    (function () {
        const ts = document.getElementById("wTime"),
            tv = document.getElementById("wTimeV");
        if (ts) {
            _timeSlider = ts;
            _timeVal = tv;
            ts.addEventListener("input", () => {
                WTIME = parseFloat(ts.value);
                if (tv) tv.textContent = fmtHM(WTIME);
            });
        }
        const ssl = document.getElementById("wSeason"),
            sv = document.getElementById("wSeasonV");
        if (ssl) {
            _seasonSlider = ssl;
            _seasonVal = sv;
            ssl.addEventListener("input", () => {
                WSEASON = parseFloat(ssl.value);
                if (sv) sv.textContent = SEASON_NAMES[Math.floor((((WSEASON % 1) + 1) % 1) * 8) % 8];
            });
            ssl.addEventListener("change", () => {
                _lastSeasonBuild = WSEASON;
                worldRebuild();
            });
        }
        const pb = document.getElementById("wPlay");
        if (pb)
            pb.addEventListener("click", () => {
                WPLAY = !WPLAY;
                pb.classList.toggle("active", WPLAY);
                pb.textContent = WPLAY ? "⏸ Zeit" : "▶ Zeit";
            });
        const sp = document.getElementById("wSeasonPlay");
        if (sp)
            sp.addEventListener("click", () => {
                WSEASONPLAY = !WSEASONPLAY;
                sp.classList.toggle("active", WSEASONPLAY);
                sp.textContent = WSEASONPLAY ? "⏸ Jahreszeit" : "▶ Jahreszeit";
            });
        document.querySelectorAll("#ui [data-spd]").forEach((b) =>
            b.addEventListener("click", () => {
                document.querySelectorAll("#ui [data-spd]").forEach((x) => x.classList.remove("active"));
                b.classList.add("active");
                WSPEED = parseFloat(b.dataset.spd);
            })
        );
        document.querySelectorAll("#ui [data-wx]").forEach((b) =>
            b.addEventListener("click", () => {
                document.querySelectorAll("#ui [data-wx]").forEach((x) => x.classList.remove("active"));
                b.classList.add("active");
                WWEATHER = b.dataset.wx;
                weatherTargets(WWEATHER);
            })
        );
        const wxp = document.getElementById("wxPlay");
        if (wxp)
            wxp.addEventListener("click", () => {
                WXPLAY = !WXPLAY;
                wxp.classList.toggle("active", WXPLAY);
                wxp.textContent = WXPLAY ? "⏸ Wetterspiel" : "▶ Wetterspiel";
            });
        const lsb = document.getElementById("wShafts");
        if (lsb)
            lsb.addEventListener("click", () => {
                if (forestMode) return; // im Wald steuert WALD-BETRETEN den Nebel
                const on = !volPass.enabled;
                volPass.enabled = on;
                lsb.classList.toggle("active", on);
                if (on) {
                    volPass.uniforms.uAdditiveOnly.value = 1.0;
                    volPass.uniforms.uTerrainFog.value = 0.0;
                    volPass.uniforms.uMaxDist.value = 28.0;
                    volPass.uniforms.uDensity.value = 2.2;
                    _lastBakeSun.set(999, 0, 0);
                    refreshLightVolume(true);
                }
            });
    })();
    document.querySelectorAll("#ui [data-l]").forEach((b) =>
        b.addEventListener("click", () => {
            document.querySelectorAll("#ui [data-l]").forEach((x) => x.classList.remove("active"));
            b.classList.add("active");
            __lod = parseInt(b.dataset.l);
            build();
        })
    );
    document.querySelectorAll("#ui [data-x]").forEach((b) =>
        b.addEventListener("click", () => {
            if (b.dataset.x === "seed") {
                SEED = Math.floor(Math.random() * 1e6);
                if (forestMode) rebuildForestInPlace();
                else build();
            } else if (b.dataset.x === "dice") {
                diceAll();
            } else {
                showcase = !showcase;
                b.classList.toggle("active", showcase);
            }
        })
    );
    refreshVals();
}
init();

/* ==========================================================================
   AnazhRealm-PORTAL-BRÜCKE (W12-Protokoll) — der Welt-Adapter.
   Phytogenesis kennt AnazhRealm nicht; diese Brücke übersetzt DSL-Wörter
   in die ECHTEN UI-Pfade der Welt (Button-Klicks — eine Quelle, kein
   Parallel-Pfad) und trägt enter/ready/exit/event über postMessage.
   ========================================================================== */
(() => {
    // DUAL-TRANSPORT (der P0/P2-Weg zu foundry-core): DIESELBE Brücke antwortet im iframe
    // (window.parent.postMessage) UND im Worker (self.postMessage) — EIN Protokoll, kein zweiter Pfad.
    const __post =
        typeof window !== "undefined"
            ? (p) => {
                  if (window.parent && window.parent !== window) window.parent.postMessage(p, "*");
              }
            : (p) => self.postMessage(p);
    function sendEvent(text) {
        __post({ type: "event", text: String(text) });
    }
    function clickBtn(sel) {
        const b = document.querySelector(sel);
        if (b) {
            b.click();
            return true;
        }
        return false;
    }
    // DSL-Wort → UI-Pfad. Die Presets tragen ihren eigenen Namen; Wetter/
    // Jahreszeit/Tageszeit sprechen die eigene Sprache der Welt (KEIN
    // skybox_color-Fake: den Himmel führt hier das Tag/Nacht-System).
    const WX = { klar: 1, bewoelkt: 1, nebel: 1, sturm: 1 };
    const SEASONS = { fruehling: "spring", sommer: "summer", herbst: "autumn", winter: "winter" };
    function applyDsl(program) {
        if (!Array.isArray(program) || typeof program[0] !== "string") return;
        const op = program[0];
        if (op === "chain") {
            for (let i = 1; i < program.length; i++) applyDsl(program[i]);
            return;
        }
        try {
            if (Object.prototype.hasOwnProperty.call(PRESETS, op)) {
                if (clickBtn(String.fromCharCode(35) + 'ui [data-p="' + op + '"]'))
                    sendEvent("Im Morphologie-Labor wuchs: " + op + ".");
            } else if (op === "wald") {
                if (!forestMode) {
                    enterForest();
                    sendEvent("Der Wald der Phytogenesis-Welt wurde betreten.");
                }
            } else if (SEASONS[op]) {
                if (clickBtn(String.fromCharCode(35) + 'ui [data-s="' + SEASONS[op] + '"]'))
                    sendEvent("Die Jahreszeit wandelte sich: " + op + ".");
            } else if (WX[op]) {
                if (clickBtn(String.fromCharCode(35) + 'ui [data-wx="' + op + '"]'))
                    sendEvent("Das Wetter wandelte sich: " + op + ".");
            } else if (op === "tag" || op === "nacht") {
                WTIME = op === "tag" ? 11 : 23;
                const ts = document.getElementById("wTime");
                if (ts) ts.value = WTIME;
                const tv = document.getElementById("wTimeV");
                if (tv) tv.textContent = fmtHM(WTIME);
                sendEvent(op === "tag" ? "Die Sonne stieg über das Labor." : "Die Nacht legte sich über das Labor.");
            } else if (op === "neu") {
                SEED = Math.floor(Math.random() * 1e6);
                if (forestMode) rebuildForestInPlace();
                else build();
                sendEvent("Eine neue Saat keimte im Morphologie-Labor.");
            }
        } catch (err) {
            console.warn("Phytogenesis-Portal: Befehl fehlgeschlagen —", err && err.message);
        }
    }
    function __portalOnMessage(msg) {
        if (!msg || typeof msg !== "object") return;
        if (msg.type === "enter") {
            const avatar = msg.avatar && typeof msg.avatar === "object" ? msg.avatar : {};
            const name = typeof avatar.name === "string" && avatar.name ? avatar.name : "Reisender";
            const el = document.getElementById("avatar-name");
            // W13 V2 — der Vibe-Pass trägt die Identität des Reisenden mit.
            if (el) el.textContent = avatar.fingerprint ? name + " · " + avatar.fingerprint : name;
        } else if (msg.type === "dsl") {
            applyDsl(msg.program);
        } else if (msg.type === "build-asset") {
            // DER ASSET-KANAL: AnazhRealm fragt einen fertigen Baum/Pflanze an, die
            // Vorlage laeuft ihr ECHTES buildInstance (Skelett+Rinde+Blaetter+Wurzeln, das
            // eigene LOD), und schickt die reine Geometrie (engine-neutrale Float32-Puffer)
            // als transferable zurueck. AnazhRealm pflanzt sie 1:1 — kein Nachbau, kein
            // Sezieren; die Vorlage-Datei IST der Samen (ein Edit hier -> andere Assets).
            __replyBuildAsset(msg);
        } else if (msg.type === "bake-impostor") {
            // DER BILLBOARD-KANAL (L2): AnazhRealm fragt die FERNSTUFE eines Baums an. Die Vorlage
            // laeuft ihren EIGENEN Baecker `bakeImpostorAtlas` (8-Winkel-RTT, Normal-Atlas, per-Art-
            // Rahmen, Dilation) offscreen und schickt die fertigen Atlas-Pixel + Rahmen zurueck.
            // KEIN Nachbau in AnazhRealm: editiert der Schoepfer den Baecker/Shader/das Framing hier,
            // fliesst es automatisch in die AnazhRealm-Ferne. Der Studio-Baecker IST die Fernstufe.
            __replyBakeImpostor(msg);
        } else if (msg.type === "render-native") {
            // DER VERGLEICHS-KANAL: das Studio rendert EIN Asset mit SEINEN ECHTEN Materialien
            // (barkMat/foliageMat/rockMat…) offscreen + schickt die Pixel + die Kamera zurueck.
            // AnazhRealm rendert dasselbe Asset durch seine Pipeline mit DERSELBEN Kamera → Bild-
            // Vergleich Seite an Seite (muessen identisch aussehen). Der ehrliche Beweis.
            __replyRenderNative(msg);
        } else if (msg.type === "get-world-params") {
            // DER WELT-PARAMETER-KANAL: das Studio exportiert seine Welt-LOOK-DATEN (die Boden-/
            // Fels-/Feucht-Palette + die Blatt-Grundfarbe) als reine Zahlen. AnazhRealms eigene
            // WebGPU-Systeme (Boden-Albedo, Geologie, Vegetations-Tint) LESEN sie und richten sich
            // danach — editiert der Schoepfer hier eine Farbe, folgt AnazhRealm beim naechsten Laden.
            // Kein Shader-Transfer (r128-GLSL != WebGPU): die WERTE fliessen, der Renderer bleibt AnazhRealms.
            __replyWorldParams(msg);
        } else if (msg.type === "get-render-config") {
            // DER WAHRNEHMUNGS-KANAL: das Studio exportiert PORTAL_RENDER_CONFIG (Sichtweite, LOD-Distanzen/
            // Fades, Wald-Dichte, Understory-Raster) als reine Zahlen. AnazhRealm adoptiert sie -> dieselbe
            // Sichtweite, dasselbe nahe LOD, dieselben Distanzen/Fades, dieselbe Wiese/Blumen/Buesche im
            // selben aktiven Radius. Editiert der Schoepfer den Config-Block, folgt AnazhRealm beim Laden.
            __replyRenderConfig(msg);
        } else if (msg.type === "get-recipes") {
            // DER REZEPT-KANAL: das Studio EXPORTIERT sein Rezeptbuch (die PRESETS: je Art die
            // Regler `s` + die Material/Form-Werte `fx`) durch das Portal. AnazhRealm speist das
            // in seinen Blueprint (der Blueprint WIRD das Rezeptbuch — kein hartkodiertes Abbild,
            // keine Kopie; ein Edit an PRESETS hier fliesst automatisch mit). Die Geometrie-
            // Erzeugung bleibt im Studio (build-asset); dies traegt nur die Rezept-DATEN.
            __replyRecipes(msg);
        }
    }
    if (typeof window !== "undefined") {
        window.addEventListener("message", (event) => {
            if (event.source !== window.parent) return;
            __portalOnMessage(event.data);
        });
    } else if (typeof self !== "undefined") {
        self.onmessage = (event) => __portalOnMessage(event && event.data);
    }
    function __replyWorldParams(msg) {
        // Reine Daten (JSON-klonbar): NUR die Werte, die AnazhRealm auch LIEST (kein toter Passagier).
        const params = {
            // Boden-Palette -> MEADOW_GREEN + TERRAIN_GEOLOGY. dirt/sand leben lokal im Studio-Terrain,
            // aber AnazhRealms Sand/Erde sitzt im determinismus-gesperrten Worker-Pfad (V17.100: eine
            // Runtime-Tunable braeche den bit-Vertrag) -> nicht exportiert.
            ground: {
                lit: PORTAL_GROUND.lit,
                mead: PORTAL_GROUND.mead,
                rock: PORTAL_GROUND.rock,
                wet: PORTAL_GROUND.wet,
            },
            // ATMOSPHAERE-ANKER (Mittag): Himmel-Top + Sonnenfarbe. AnazhRealms Tag/Nacht-Zyklus
            // animiert den Rest; NUR der Mittags-Stop folgt dem Studio (additiv, kein Einfrieren).
            sky: { top: PORTAL_SKY.top, sun: PORTAL_SKY.sun },
        };
        if (typeof window === "undefined" || (window.parent && window.parent !== window)) {
            __post({ type: "world-params", world: "terrain", reqId: msg && msg.reqId, params }, "*");
        }
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
    function __replyRenderConfig(msg) {
        // Reine Daten (JSON-klonbar) — die EINE Wahrnehmungs-Quelle (PORTAL_RENDER_CONFIG). Tiefe Kopie,
        // damit der Empfaenger nichts am Studio-Objekt mutiert.
        const c = PORTAL_RENDER_CONFIG;
        const cfg = {
            sight: c.sight,
            fogNearMul: c.fogNearMul,
            camFarPad: c.camFarPad,
            // kindStages (LOD-WURZEL 08.07.): die Stufen-Wahrheit je Art als DATEN — welche
            // buildInstance-Stufen eine Art traegt+nutzt (Baum [0,1,2] · Gras/Strauch [1,2]
            // zweistufig · Blume/Fels einstufig). Der Empfaenger clampt seine Distanz-Wahl
            // auf die naechste verfuegbare Stufe (tiefe Kopie, JSON-klonbar).
            lod: {
                d0: c.lod.d0,
                d1: c.lod.d1,
                fade: c.lod.fade,
                fade0: c.lod.fade0,
                ref: c.lod.ref,
                hyst: c.lod.hyst,
                kindStages: c.lod.kindStages ? JSON.parse(JSON.stringify(c.lod.kindStages)) : undefined,
            },
            density: {
                cell: c.density.cell,
                pack: c.density.pack,
                dartsPerM2: c.density.dartsPerM2,
                crown: Object.assign({}, c.density.crown),
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
                  }
                : null,
        };
        // W7b/N2 (Studio-Vertrag v1.1 N7.5 + Nervensystem-Plan) — die kindStages-Bloecke der
        // ZWEIT-KERNE reisen SEPARAT (je Kern ein Block unter cfg.lod.zusatzKindStages[<id>],
        // GENERISCH aus der Manifest-Schleife): der EMPFAENGER mergt am EINEN Ingest-Chokepoint
        // (_foundryIngestRenderConfig), ein Kern ueberschreibt nie den Block eines anderen.
        // must-ignore-fest: ein v1-only-Leser ignoriert das Zusatz-Feld schlicht.
        try {
            for (const zk of __zweitKerne()) {
                const ks =
                    zk.kern.PORTAL_RENDER_CONFIG && zk.kern.PORTAL_RENDER_CONFIG.lod
                        ? zk.kern.PORTAL_RENDER_CONFIG.lod.kindStages
                        : null;
                if (!ks || !cfg.lod) continue;
                if (!cfg.lod.zusatzKindStages) cfg.lod.zusatzKindStages = {};
                cfg.lod.zusatzKindStages[zk.id] = JSON.parse(JSON.stringify(ks));
            }
        } catch (_e) {}
        if (typeof window === "undefined" || (window.parent && window.parent !== window)) {
            __post({ type: "render-config", world: "terrain", reqId: msg && msg.reqId, config: cfg }, "*");
        }
    }
    function __replyRecipes(msg) {
        const book = {};
        try {
            for (const id in PRESETS) {
                if (!Object.prototype.hasOwnProperty.call(PRESETS, id)) continue;
                const p = PRESETS[id];
                if (!p || typeof p !== "object") continue;
                // Reine Daten (JSON-klonbar): kind/panel + die Regler `s` + die Material/Form `fx`.
                book[id] = { kind: p.kind, panel: p.panel, s: Object.assign({}, p.s), fx: Object.assign({}, p.fx) };
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
        try {
            for (const zk of __zweitKerne()) {
                const PA = zk.kern.PARAMS;
                const P = zk.kern.PRESETS;
                if (!Array.isArray(PA) || !PA.length || !P) continue;
                let kind = null;
                for (const id in P) {
                    if (!Object.prototype.hasOwnProperty.call(P, id)) continue;
                    const p = P[id];
                    if (p && typeof p.kind === "string" && p.kind) {
                        kind = p.kind;
                        break;
                    }
                }
                if (!kind || paramsByKind[kind]) continue;
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
                if (rows.length) paramsByKind[kind] = rows;
            }
        } catch (_e4) {}
        if (typeof window === "undefined" || (window.parent && window.parent !== window)) {
            __post({ type: "recipes", world: "terrain", reqId: msg && msg.reqId, book, paramsByKind }, "*");
        }
    }
    // Ein Mesh der Instanz -> {kind, + alle Vertex-Attribute als Float32/Uint32}. REIN
    // lesend (buildInstance/emitTree unveraendert). kind aus dem Material-Zeiger.
    function __assetMaterialKind(mat) {
        if (!mat) return "unknown";
        if (mat === barkMat || mat === barkMatBirch) return "bark";
        if (mat === foliageMatTex) return "foliageTex";
        if (mat === foliageMat) return "foliage";
        if (mat === grassMat) return "grass";
        if (typeof stemMat !== "undefined" && mat === stemMat) return "stem";
        return "unknown";
    }
    function __extractAssetMesh(mesh, zweitKern) {
        const geo = mesh.geometry;
        if (!geo || !geo.attributes || !geo.attributes.position) return null;
        const out = { kind: __assetMaterialKind(mesh.material) };
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
            // (_foundryBuildGroup) fuellt daraus das color-Attribut. r128 liest Hex als
            // LINEAR -> raw-Komponenten (die Farb-Regel: treue Anker als linear).
            if (zweitKern && mat.color && typeof mat.color.r === "number")
                out.mat.color = [mat.color.r, mat.color.g, mat.color.b];
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
        mesh.updateWorldMatrix(true, false);
        const e = mesh.matrixWorld.elements,
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
    function __replyBuildAsset(msg) {
        const reqId = msg.reqId;
        let meshes = [];
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
            if (typeof msg.presetId === "string" && !Object.prototype.hasOwnProperty.call(PRESETS, msg.presetId)) {
                for (const zk of __zweitKerne()) {
                    if (
                        zk.kern.PRESETS &&
                        Object.prototype.hasOwnProperty.call(zk.kern.PRESETS, msg.presetId) &&
                        typeof zk.kern.buildInstance === "function"
                    ) {
                        zweit = zk;
                        break;
                    }
                }
            }
            const isZweitKern = !!zweit;
            // W-A1 (Katalysator §5) — DER REGLER-KANAL: msg.ov (B4-Overrides der Werkstatt)
            // reist NUR in den Zweit-Kern-Zweig (buildInstance nimmt ov als 4. Argument).
            // Pflanzen/foundry-core bekommen KEIN ov (der Pflanzen-Pfad ist byte-vertraglich
            // eingefroren, gate:asset-contract — Regler fuer Pflanzen sind ein eigener Bogen).
            const g = isZweitKern
                ? zweit.kern.buildInstance(msg.presetId, Number(msg.seed) || 0, msg.lod | 0, msg.ov || null)
                : buildInstance(msg.presetId || "eiche", Number(msg.seed) || 0, msg.lod | 0, null);
            g.updateMatrixWorld(true);
            g.traverse((o) => {
                if (o.isMesh) {
                    const m = __extractAssetMesh(o, isZweitKern);
                    if (m) meshes.push(m);
                }
            });
            // Aufraeumen (kein Leak in der Foundry): Geometrien + Materialien der Wegwerf-Instanz.
            g.traverse((o) => {
                if (o.isMesh) {
                    if (o.geometry) o.geometry.dispose();
                }
            });
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
                },
                "*"
            );
        }
    }
    // DER OFFSCREEN-BAKE-RENDERER (nur Foundry): der Studio-Baecker `bakeImpostorAtlas` liest den
    // GLOBALEN `renderer` — im Foundry-Modus (init kehrt vor dem Display-Renderer zurueck) gibt es
    // keinen. Wir bauen EINEN kleinen Offscreen-WebGL-Renderer (nie am DOM, kein Display-Loop) und
    // zeigen den globalen `renderer` darauf. Anderer Kontext-Typ als AnazhRealms WebGPU -> kein
    // Konflikt (wie die Diag-Offscreen-Renderer). Einmalig, gecacht.
    function __foundryBakeRenderer() {
        if (window.__foundryGL) return window.__foundryGL;
        try {
            const gl = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: false });
            gl.setSize(256, 256, false);
            if (THREE.sRGBEncoding !== undefined) gl.outputEncoding = THREE.sRGBEncoding;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.0;
            window.__foundryGL = gl;
            // eslint-disable-next-line no-global-assign
            renderer = gl; // der Studio-Baecker liest `renderer` -> auf den Offscreen-GL zeigen
            return gl;
        } catch (_e) {
            return null;
        }
    }
    // Ein Asset mit den STUDIO-EIGENEN Materialien rendern (offscreen WebGL) + Pixel/Kamera zurueck.
    function __replyRenderNative(msg) {
        const reqId = msg.reqId;
        const presetId = msg.presetId || "eiche";
        const seed = Number(msg.seed) || 0;
        const lod = msg.lod | 0;
        const W = msg.size || 320;
        let payload = null;
        try {
            if (msg.season && typeof setSeasonColors === "function") {
                try {
                    setSeasonColors(msg.season);
                } catch (_se) {}
            }
            const gl = __foundryBakeRenderer();
            if (!gl) throw new Error("kein Renderer");
            if (typeof bakeLeafAtlas === "function") {
                try {
                    bakeLeafAtlas();
                } catch (_le) {}
            }
            const g = buildInstance(presetId, seed, lod, msg.ov || null);
            g.updateMatrixWorld(true);
            const sc = new THREE.Scene();
            sc.add(new THREE.HemisphereLight(0xdfeecc, 0x2a2a1a, 0.7));
            const kl = new THREE.DirectionalLight(0xfff2d9, 2.2);
            kl.position.set(6, 10, 5);
            sc.add(kl);
            sc.add(g);
            const box = new THREE.Box3().setFromObject(g);
            const ctr = box.getCenter(new THREE.Vector3()),
                sz = box.getSize(new THREE.Vector3());
            const d = Math.max(sz.x, sz.y, sz.z) * 1.6 + 2;
            const camPos = [ctr.x + d * 0.6, box.min.y + sz.y * 0.55, ctr.z + d * 0.7];
            const camLook = [ctr.x, ctr.y, ctr.z];
            const cam = new THREE.PerspectiveCamera(42, 1, 0.05, 500);
            cam.position.set(camPos[0], camPos[1], camPos[2]);
            cam.lookAt(camLook[0], camLook[1], camLook[2]);
            cam.updateProjectionMatrix();
            const rt = new THREE.WebGLRenderTarget(W, W);
            const pRT = gl.getRenderTarget();
            gl.setRenderTarget(rt);
            gl.setClearColor(0xbcd2e0, 1);
            gl.clear();
            gl.render(sc, cam);
            const buf = new Uint8Array(W * W * 4);
            gl.readRenderTargetPixels(rt, 0, 0, W, W, buf);
            gl.setRenderTarget(pRT);
            g.traverse((o) => {
                if (o.isMesh && o.geometry) o.geometry.dispose();
            });
            rt.dispose();
            payload = { W: W, pixels: buf, camPos: camPos, camLook: camLook };
        } catch (e) {
            try {
                console.warn("[phyto] render-native", presetId, e && e.message);
            } catch (_) {}
        }
        if (typeof window === "undefined" || (window.parent && window.parent !== window)) {
            __post(
                {
                    type: "render-native",
                    world: "terrain",
                    reqId: reqId,
                    presetId: presetId,
                    seed: seed,
                    payload: payload,
                },
                "*"
            );
        }
    }
    // Die Fernstufe EINES Baums: der Studio-Baecker bakt SEIN 8-Winkel-Billboard (Albedo + Normal),
    // wir lesen die Atlas-Pixel + Rahmen zurueck. `bakeImpostorAtlas` liest `_impSpecs` (die Zellen),
    // also fuellen wir EINE Zelle (Art,Seed) — K=1, ein 128x(256*8)-Atlas. CB/TMUL sind die Wald-
    // Konstanten aus `buildForest` (dort lokal), hier gespiegelt: der Bake-Subjekt-Baum = der Wald-
    // Baum (freigestellter Stamm), damit die Ferne exakt der Nahstufe entspricht.
    function __replyBakeImpostor(msg) {
        const reqId = msg.reqId;
        const presetId = msg.presetId || "eiche";
        const seed = Number(msg.seed) || 0;
        let payload = null;
        try {
            if (msg.season && typeof setSeasonColors === "function") {
                try {
                    setSeasonColors(msg.season);
                } catch (_se) {}
            }
            const gl = __foundryBakeRenderer();
            if (!gl) throw new Error("kein Offscreen-Renderer");
            const CB = { eiche: 0.42, fichte: 0.3, birke: 0.42, weide: 0.4, tanne: 0.3, mammut: 0.46 };
            const TMUL = 0.5;
            const crownBase = CB[presetId] != null ? CB[presetId] : 0.4;
            // EINE Bake-Zelle -> K=1. Frueheres Target (anderes K) verwerfen, Rebake erzwingen.
            _impSpecs = [{ sp: presetId, seed: seed, crownBase: crownBase, trunkMul: TMUL }];
            _impCellOf = {};
            _impCellOf[presetId + "|0"] = 0;
            _impBakedSig = "";
            if (_impRT) {
                _impRT.dispose();
                _impRT = null;
            }
            if (_impNrmRT) {
                _impNrmRT.dispose();
                _impNrmRT = null;
            }
            _impK = 0;
            bakeImpostorAtlas(); // DER STUDIO-BAECKER — kein Nachbau
            const cw = 128,
                ch = 256,
                V = _impV;
            const albedo = new Uint8Array(cw * ch * V * 4);
            gl.readRenderTargetPixels(_impRT, 0, 0, cw, ch * V, albedo);
            const normal = new Uint8Array(cw * ch * V * 4);
            gl.readRenderTargetPixels(_impNrmRT, 0, 0, cw, ch * V, normal);
            // Seitenverhaeltnis (Studio-Rahmen, per-Art) + Weltmass-Hoehe aus dem L1-Bake-Subjekt.
            const aspect = _impWR[presetId + seed] || 0.5;
            const l1 = buildInstance(presetId, seed, 1, { crownBase: crownBase, trunkMul: TMUL });
            const box = new THREE.Box3().setFromObject(l1);
            const height = Math.max(0.5, box.max.y - Math.min(0, box.min.y));
            l1.traverse((o) => {
                if (o.isMesh && o.geometry) o.geometry.dispose();
            });
            payload = { cw: cw, ch: ch, V: V, aspect: aspect, height: height, albedo: albedo, normal: normal };
        } catch (e) {
            try {
                console.warn("[phyto] bake-impostor", presetId, e && e.message);
            } catch (_) {}
        }
        if (typeof window === "undefined" || (window.parent && window.parent !== window)) {
            __post(
                { type: "impostor", world: "terrain", reqId: reqId, presetId: presetId, seed: seed, payload: payload },
                "*"
            );
        }
    }
    // Escape verlässt das Portal — aber NUR im Studio: im Wald gehört Escape
    // dem PointerLock ("Maus frei") und der ✕-Knopf dem Wald-Ausgang; das
    // Portal verlässt man erst aus dem Studio heraus (kein Doppel-Sinn).
    // (Nur im Fenster-Kontext — der Foundry-Worker hat keine Tasten.)
    if (typeof window !== "undefined")
        window.addEventListener("keydown", (event) => {
            if (event.key !== "Escape") return;
            if (forestMode || document.pointerLockElement) return;
            if (window.parent && window.parent !== window) {
                __post({ type: "exit", world: "terrain" }, "*");
            }
        });
    // W12 Phase 3 — die native Manifest-Stufe: die Welt liest ihr eigenes
    // manifest.json und meldet dsl + label im ready-Handshake.
    function announceReady(extra) {
        if (typeof window === "undefined" || (window.parent && window.parent !== window)) {
            __post(Object.assign({ type: "ready", world: "terrain" }, extra || {}), "*");
        }
    }
    fetch("./manifest.json")
        .then((res) => (res.ok ? res.json() : null))
        .then((m) => {
            const dsl = m && Array.isArray(m.dsl) ? m.dsl : null;
            const label = m && typeof m.label === "string" ? m.label : null;
            announceReady(dsl ? { dsl, label } : {});
        })
        .catch(() => announceReady({}));
})();
