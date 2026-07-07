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
function mulberry32(a) {
    return function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
let RNG = mulberry32(12345);
const rnd = () => RNG();
const rrange = (a, b) => a + (b - a) * RNG();
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
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

/* ---------- Geteilte Uniforms: Wind (Eigenfreq) + Saison (Phaenologie) ----- */
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
}; // uSeasonMul: aktueller Saison-Tint / Bau-Tint -> Laubfarbe drivet KONTINUIERLICH, ohne Rebuild
const _seasonBuiltTint = new THREE.Color(0x4f7a30); // Tint, mit dem die Geometrie zuletzt gebacken wurde (Referenz fuer das Verhaeltnis)
// DIE BODEN-PALETTE — EINE Quelle fuer die Terrain-Farbgebung UND den world-params-Export (die
// Foundry reicht sie an AnazhRealm, dessen Boden/Fels-Farben sie live lesen). Editiert der Schoepfer
// hier eine Farbe, folgt der AnazhRealm-Boden beim naechsten Laden — kein hartkodiertes Abbild mehr.
const PORTAL_GROUND = {
    lit: 0x2c3621,
    mead: 0x55632f,
    dirt: 0x5c4a33,
    rock: 0x6b6258,
    wet: 0x33402a,
    sand: 0xc9b791,
};
// DER MITTAGS-ATMOSPHAERE-ANKER — EINE Quelle fuer den Himmel-Shader (uTop) UND den world-params-
// Export. AnazhRealm bindet seinen Mittags-Tag/Nacht-Stop hieran (additiv; der Zyklus bleibt seiner).
const PORTAL_SKY = {
    top: 0x6a9ed0, // Mittags-Himmel-Top (weiches Dunst-Blau)
    sun: 0xfff2d9, // Mittags-Sonnenfarbe (warm, = uSunCol (1,0.95,0.85))
};
// DIE WAHRNEHMUNGS-QUELLE — EINE Quelle fuer die Sichtweite, die LOD-Distanzen/Fades, die Wald-Dichte
// und den Understory-Raster. Das Studio LIEST sie (die Konstanten unten binden hieran), UND der Foundry-
// Kanal EXPORTIERT sie (`get-render-config`) an AnazhRealm — editiert der Schoepfer HIER eine Zahl, folgt
// beim naechsten Laden BEIDES: der Studio-Wald UND die AnazhRealm-WebGPU-Welt (dieselbe Sichtweite, dasselbe
// nahe LOD, dieselben Distanzen/Fades, dieselbe Wiese/Blumen/Buesche im selben aktiven Radius). Kein
// Shader-/Geometrie-Transfer (r128-GLSL != WebGPU) — die WERTE fliessen, der Renderer bleibt AnazhRealms.
const PORTAL_RENDER_CONFIG = {
    // Sichtweite (Dunst) — der Wald-Regime-Anker: fog.near = sight*fogNearMul, fog.far = sight, camera.far = sight+camFarPad.
    sight: 120,
    fogNearMul: 0.35,
    camFarPad: 20,
    // Baum-LOD — Wahrnehmungs-Distanzen (Screen-Space-Error, hoehen-gewichtet ueber `ref`): <d0 = L0 volle
    // Geometrie, d0..d1 = L1 mittel, >d1 = L2 Billboard. `fade`/`fade0` = die Dither-Crossfade-Baender; `hyst`
    // = die Membership-Hysterese (M); `ref` = die Referenz-Sichthoehe (uLodRef).
    lod: { d0: 20, d1: 40, fade: 8, fade0: 4, ref: 12.0, hyst: 3.4 },
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
};
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
        }
    };
    mat.customProgramCacheKey = function () {
        return "wind_" + (foliage ? (isGrass ? "grass_v8tint" : "fol_v7tint") : "bark") + "_v9overlap";
    };
    return mat;
}

/* ---------- Canvas-Fabrik: DOM (Studio/iframe) ODER OffscreenCanvas (Worker) ---- */
function __mkCanvas(w, h) {
    if (typeof document !== "undefined") {
        const c = document.createElement("canvas");
        if (w) c.width = w;
        if (h) c.height = h;
        return c;
    }
    return new OffscreenCanvas(w || 1, h || 1);
}
/* ---------- Prozedurale Rinden-Normalmap (vertikale Riefen + Risse) -------- */
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
    ); // FIX v31: MULTI-BLATT-KARTEN — ein Quad traegt ~6 GEMALTE Blaetter aus _leafAtlas (map wird nach dem Malen gesetzt). map haelt WERT (0.6-1.0 grau-warm), die Artfarbe kommt wie ueberall aus vertexColors -> Saison/Tint-Pipeline unveraendert. 28 Dreiecke je Blatt werden 2 je ~6 Blaetter (Faktor ~14 im Mittelfeld).
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

/* ---------- getapertes Segment in WELT-Koordinaten ------------------------
   Alle windbewegten Geometrien leben im Weltframe (Objektmatrix = Identitaet),
   damit Wind in Weltrichtung wirkt und Blaetter ihren Asttipps exakt folgen.  */
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

/* ---------- Superformel (Gielis): EIN Gesetz, riesige Blatt-Morphologie ----
   r(phi) = ( |cos(m phi/4)/a|^n2 + |sin(m phi/4)/b|^n3 )^(-1/n1)             */
function superR(phi, m, n1, n2, n3, a, b) {
    const t = (m * phi) / 4;
    const p1 = Math.pow(Math.abs(Math.cos(t) / a), n2);
    const p2 = Math.pow(Math.abs(Math.sin(t) / b), n3);
    return Math.pow(p1 + p2, -1 / n1);
}
/* ---------- Blatt / Bluetenblatt als gefaechertes Kaertchen (Weltframe) ---- */
function pushLeaf(arr, center, dirOut, up, scale, lp, color, type, sway, phase, omega, cup) {
    // DER GETEILTE SAMEN: die 30-Vert-Superformel-Blatt-KLINGE (Kontur + Quer-Mulde) lebt in
    // phyto-core.js (buildLeafBlades) — dieselbe EINE Quelle, die AnazhRealm liest. Die Geometrie-
    // REZEPTUR ist geteilt (identische superR-Kontur, cup, 14 Segmente, Basis). Divergenzen: das
    // Wind-Attribut-Schema (AnazhRealm aFlex/aPhase — Vorlage aWind/aCenter/aType, HIER angehängt)
    // und eine sub-mikron Float-Noise (≤1 ULP, ~1e-6 m; buildLeafBlades' Additions-Reihenfolge +
    // Math.hypot = AnazhRealms eingefrorene Arithmetik) → pixel-identisch, kein Look-Change. Alle
    // gewachsenen dir sind unit → das dir-Normalisieren ist ein No-op. Fallback → Inline.
    const __core = typeof self !== "undefined" && self.__phytoCore;
    if (__core && typeof __core.buildLeafBlades === "function") {
        const _r = __core.buildLeafBlades(
            [{ pos: center, dir: dirOut, up: up, scale: scale, needle: false, sway: sway, phase: phase }],
            { leafColor: [color.r, color.g, color.b], scale: 1, cup: cup, leafShape: lp }
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
    const right = vnorm(vcross(dirOut, up));
    const u2 = vnorm(vcross(right, dirOut));
    const seg = 14,
        positions = [],
        idx = [],
        uvs = [];
    for (let i = 0; i <= seg; i++) {
        const s = i / seg;
        const phi = lerp(0.0, Math.PI, s); // halber Umlauf -> Tropfen
        const w = superR(phi, lp.m, lp.n1, lp.n2, lp.n3, lp.a, lp.b) * lp.wsc;
        const along = s * scale;
        const cupZ = -cup * (s - s * s) * scale;
        const cl = vadd(vadd(vadd(center, vscl(dirOut, along)), vscl(right, -w * scale)), vscl(u2, cupZ));
        const cr = vadd(vadd(vadd(center, vscl(dirOut, along)), vscl(right, w * scale)), vscl(u2, cupZ));
        positions.push(cl[0], cl[1], cl[2], cr[0], cr[1], cr[2]);
        uvs.push(0, s, 1, s);
    }
    for (let i = 0; i < seg; i++) {
        const a0 = i * 2,
            b0 = i * 2 + 1,
            a1 = i * 2 + 2,
            b1 = i * 2 + 3;
        idx.push(a0, b0, a1, b0, b1, a1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    const n = g.attributes.position.count;
    const aw = new Float32Array(n * 3),
        ac = new Float32Array(n * 3),
        at = new Float32Array(n),
        cl = new Float32Array(n * 3);
    const _lph = sway * 1.5 + center[0] * 0.6 + center[2] * 0.6,
        _lom = clamp(2.6 - sway * 1.6, 0.5, 2.6);
    for (let i = 0; i < n; i++) {
        aw[i * 3] = sway;
        aw[i * 3 + 1] = _lph;
        aw[i * 3 + 2] = _lom;
        ac[i * 3] = center[0];
        ac[i * 3 + 1] = center[1];
        ac[i * 3 + 2] = center[2];
        at[i] = type;
        cl[i * 3] = color.r;
        cl[i * 3 + 1] = color.g;
        cl[i * 3 + 2] = color.b;
    }
    g.setAttribute("aWind", new THREE.BufferAttribute(aw, 3));
    g.setAttribute("aCenter", new THREE.BufferAttribute(ac, 3));
    g.setAttribute("aType", new THREE.BufferAttribute(at, 1));
    g.setAttribute("color", new THREE.BufferAttribute(cl, 3));
    arr.push(g);
}
/* ---------- Nadel (Konifere): duenner Kegel ------------------------------- */
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
/* ---------- FIX v31: MULTI-BLATT-KARTEN (der Profi-Multiplikator) ----------
   bakeLeafAtlas: malt EINMAL 4 Blatt-Cluster (je ~6 Blaetter) per Canvas-2D in
   einen Alpha-Atlas. Map traegt nur WERT/Schattierung — die Artfarbe liefert
   wie ueberall vertexColors. Lokaler PRNG: verbraucht KEIN Wald-RNG (Saat-
   Determinismus unangetastet). pushLeafClusterQuad: 1 Quad = 2 Dreiecke mit
   vollem Wind-Attributsatz (aWind/aCenter/aType) — pendelt, kollabiert im
   Winter, faerbt sich im Herbst, exakt wie geometrische Blaetter.            */
function bakeLeafAtlas() {
    if (_leafAtlas) return;
    // DER GETEILTE SAMEN: der Blatt-Atlas lebt in phyto-core.js (bakeLeafAtlasCanvas) — dieselbe
    // EINE Quelle, die AnazhRealm liest. Ein Edit am Cluster-Rezept fliesst hierher UND nach
    // AnazhRealm. cell3:'broadleaf' malt die 4 Breitblatt-Zellen byte-treu (gleiche mulberry32-
    // Ziehungen); AnazhRealm nutzt cell3:'needle' (Nadel-Zelle) → beide behalten ihren Look.
    // Fallback auf den Inline-Bau, falls der Samen (noch) nicht geladen ist.
    let cv = null;
    const __core = typeof self !== "undefined" && self.__phytoCore;
    if (__core && typeof __core.bakeLeafAtlasCanvas === "function") {
        cv = __core.bakeLeafAtlasCanvas(typeof document !== "undefined" ? document : null, { cell3: "broadleaf" });
    }
    if (!cv) {
        cv = __mkCanvas(1024, 256);
        const x = cv.getContext("2d");
        const rg = mulberry32(0xbeef); // eigener Strom!
        for (let c = 0; c < 4; c++) {
            const ox = c * 256 + 128,
                oy = 150;
            const n = 8 + (c & 1);
            for (let i = 0; i < n; i++) {
                const a = (i / n) * 6.2831 + rg() * 0.9,
                    R = i === 0 ? 0 : 22 + rg() * 38;
                const lx = ox + Math.cos(a) * R,
                    ly = oy + Math.sin(a) * R * 0.72 - 18;
                const rot = a + 1.5708 + (rg() - 0.5) * 0.8,
                    L = 76 + rg() * 30,
                    W = L * (0.46 + rg() * 0.16);
                const v = 0.88 + rg() * 0.34; // FIX v37: Wert um Mittel ~1 (vorher 0.62-1.0 -> Cluster ~35% dunkler als flach getoente L0-Blaetter = Farbsprung an der Blende); Variation bleibt als gemalte Tiefe
                x.save();
                x.translate(lx, ly);
                x.rotate(rot);
                const g = x.createLinearGradient(0, -L * 0.5, 0, L * 0.5);
                g.addColorStop(
                    0,
                    "rgba(" +
                        Math.min(255, Math.round(250 * v)) +
                        "," +
                        Math.min(255, Math.round(255 * v)) +
                        "," +
                        Math.min(255, Math.round(238 * v)) +
                        ",1)"
                );
                g.addColorStop(
                    1,
                    "rgba(" +
                        Math.min(255, Math.round(206 * v)) +
                        "," +
                        Math.min(255, Math.round(220 * v)) +
                        "," +
                        Math.min(255, Math.round(186 * v)) +
                        ",1)"
                );
                x.fillStyle = g;
                x.beginPath();
                x.moveTo(0, -L * 0.5);
                x.quadraticCurveTo(W * 0.62, -L * 0.14, 0, L * 0.5); // Blattrand rechts
                x.quadraticCurveTo(-W * 0.62, -L * 0.14, 0, -L * 0.5); // Blattrand links
                x.closePath();
                x.fill();
                x.strokeStyle = "rgba(90,104,78,0.40)";
                x.lineWidth = 2; // Mittelrippe
                x.beginPath();
                x.moveTo(0, -L * 0.42);
                x.lineTo(0, L * 0.42);
                x.stroke();
                x.restore();
            }
        }
    }
    _leafAtlas = new THREE.CanvasTexture(cv);
    _leafAtlas.minFilter = THREE.LinearMipmapLinearFilter;
    _leafAtlas.magFilter = THREE.LinearFilter;
    _leafAtlas.generateMipmaps = true;
    _leafAtlas.anisotropy = 8;
    if (THREE.sRGBEncoding !== undefined) _leafAtlas.encoding = THREE.sRGBEncoding;
    foliageMatTex.map = _leafAtlas;
    foliageMatTex.needsUpdate = true;
}
function pushLeafClusterQuad(arr, pos, dir, up, scale, color, sway, phase, omega, cell) {
    // DER GETEILTE SAMEN: die Blatt-Karten-GEOMETRIE (Quad + UV/Normale) lebt in phyto-core.js
    // (buildFoliageQuads) — dieselbe EINE Quelle, die AnazhRealm liest. Die Geometrie ist byte-
    // identisch; nur das WIND-Attribut-Schema divergiert (AnazhRealm: aFlex/aPhase — die Vorlage:
    // aWind/aCenter/aType), darum hängt der Wrapper die Vorlagen-Attribute HIER an (der Kern bleibt
    // rein). opts.cell routet die exakte Atlas-Zelle (Vorlage: (_lq++)&3). Fallback → Inline.
    const __core = typeof self !== "undefined" && self.__phytoCore;
    if (__core && typeof __core.buildFoliageQuads === "function") {
        const _r = __core.buildFoliageQuads([{ pos: pos, dir: dir, up: up, scale: scale, sway: sway, phase: phase }], {
            leafColor: [color.r, color.g, color.b],
            scale: 1,
            cell: cell,
        });
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
    const cr = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const e1 = vnorm(dir.slice()); // FIX v32: dir liegt IN der Blattflaeche (wie pushLeaf) — vorher war dir die NORMALE: Weiden-Peitschen (dir~abwaerts) wurden horizontale Lamellen, von der Seite = Streifen-Geister
    let uv0 = up && Math.abs(up[0]) + Math.abs(up[1]) + Math.abs(up[2]) > 1e-4 ? up.slice() : [0, 1, 0];
    let r = cr(uv0, e1);
    let rl = Math.hypot(r[0], r[1], r[2]);
    if (rl < 1e-4) {
        r = cr([1, 0, 0], e1);
        rl = Math.hypot(r[0], r[1], r[2]);
    }
    r = [r[0] / rl, r[1] / rl, r[2] / rl];
    const roll = Math.sin(phase * 3.7) * 0.45,
        ca = Math.cos(roll),
        sa = Math.sin(roll); // begrenzter Roll (+-26 Grad) statt Vollrotation -> Cluster liegen wie Laub, nicht wie Schindeln
    const r1 = [e1[0] * ca + r[0] * sa, e1[1] * ca + r[1] * sa, e1[2] * ca + r[2] * sa];
    const r2 = [r[0] * ca - e1[0] * sa, r[1] * ca - e1[1] * sa, r[2] * ca - e1[2] * sa];
    const n = vnorm(cr(r1, r2));
    const s = scale * 0.5,
        g = new THREE.BufferGeometry();
    const P = [],
        N = [],
        U = [],
        C = [],
        W = [],
        CT = [],
        T = [];
    const corner = [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
    ];
    const u0 = cell * 0.25,
        u1 = u0 + 0.25;
    for (let i = 0; i < 4; i++) {
        const cx = corner[i][0] * s,
            cy = corner[i][1] * s;
        P.push(pos[0] + r1[0] * cx + r2[0] * cy, pos[1] + r1[1] * cx + r2[1] * cy, pos[2] + r1[2] * cx + r2[2] * cy);
        N.push(n[0], n[1], n[2]);
        U.push(i === 0 || i === 3 ? u0 : u1, i < 2 ? 0 : 1);
        C.push(color.r, color.g, color.b);
        W.push(sway, phase, omega);
        CT.push(pos[0], pos[1], pos[2]);
        T.push(1);
    }
    g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(N, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(U, 2));
    g.setAttribute("color", new THREE.Float32BufferAttribute(C, 3));
    g.setAttribute("aWind", new THREE.Float32BufferAttribute(W, 3));
    g.setAttribute("aCenter", new THREE.Float32BufferAttribute(CT, 3));
    g.setAttribute("aType", new THREE.Float32BufferAttribute(T, 1));
    g.setIndex([0, 1, 2, 0, 2, 3]);
    arr.push(g);
}
/* ========================================================================== *
   BAUM-MASCHINE — rekursive Veraestelung aus Gesetzen
   da Vinci (Delta) · Apikaldominanz · Gravitropismus · Phyllotaxis (137.5)
 * ========================================================================== */
function growTreeNodes(P) {
    // DER GETEILTE SAMEN: die Baum-Wuchs-Mathematik (da Vinci Δ · McMahon · Apikaldominanz ·
    // Gravitropismus · Phyllotaxis · Whorls) lebt in phyto-core.js (growSkeleton) — DIESELBE
    // Quelle, die AnazhRealm (Main + Voxel-Worker) liest. Ein Edit am Wuchs-Gesetz fliesst hier
    // UND in AnazhRealm. Byte-treue Delegation: growSkeleton ist die reine Form dieser Funktion
    // (seq statt Modul-rnd), gleiche Rückgabe {segs,leaves,trunkR,height,runMeta}, gleiches
    // Blatt-Budget/count-Cap. Das LOD-Budget (__lod × window.PHYTO_LEAFBUDGET) reist als
    // P.leafBudget hinein; die zwei Seiteneffekte (P._trunkR/_D, downstream von Wurzel/Rinde
    // gelesen) werden aus dem Ergebnis gesetzt. Fallback auf den Inline-Bau, falls der Samen fehlt.
    var __core = typeof self !== "undefined" && self.__phytoCore;
    if (__core && typeof __core.growSkeleton === "function") {
        const __gsLBl = typeof __lod === "undefined" ? 0 : __lod;
        const __gsLB =
            (globalThis.PHYTO_LEAFBUDGET && globalThis.PHYTO_LEAFBUDGET[__gsLBl]) ||
            (P.kind === "shrub" ? [4000, 1500, 1400] : [20000, 9000, 7000])[__gsLBl];
        const __gsR = __core.growSkeleton(Object.assign({}, P, { leafBudget: __gsLB }), rnd);
        if (__gsR && __gsR.segs && __gsR.segs.length) {
            P._trunkR = __gsR.trunkR;
            P._D = 2 * __gsR.trunkR;
            return __gsR;
        }
    }
    const segs = [],
        leaves = [];
    let maxSway = 1e-6,
        count = 0,
        runId = 0;
    const azim = { v: 0 },
        runMeta = {};
    // McMahon: H = k·D^(2/3)  ->  D=(H/k)^1.5  (Stammdurchmesser aus Hoehe/Schlankheit)
    const k = lerp(13, 22, P.slim); // McMahon mit Sicherheitsfaktor ~4: echte Baeume sind viel dicker als die Knickgrenze
    const D = Math.pow((P.height / k) * 2, 1.5);
    const trunkR = clamp(D * 0.5, 0.07, 1.25) * (P.trunkMul || 1); // Wald: schlanker (Studio: 1)
    P._trunkR = trunkR;
    P._D = 2 * trunkR;

    function grow(pos, dir, radius, length, depth, accSway, parentRun, isLead) {
        if (count > 8800) return;
        const myRun = runId++;
        runMeta[myRun] = { parentRun: parentRun == null ? -1 : parentRun, isLead: !!isLead };
        const rMin = trunkR * 0.045,
            lMin = P.height * 0.012;
        const NSEG = depth < 2 ? 5 : 3;
        let p = pos.slice(),
            d = vnorm(dir.slice()),
            aSw = accSway;
        const rEnd = radius * (P.conifer && isLead ? 0.975 : depth < 2 ? 0.93 : 0.86);
        const distal = clamp(1 - radius / trunkR, 0, 1);
        const tropW = clamp(Math.abs(P.trop) * Math.pow(distal, 1.2) * 0.7, 0, 0.85);
        const tgt = [0, P.trop > 0 ? -1 : 1, 0];
        for (let i = 0; i < NSEG; i++) {
            const segLen = length / NSEG;
            d = vnorm(vlerp(d, tgt, tropW / NSEG));
            const wob = perp(d);
            d = vnorm(vadd(d, vscl(wob, (rnd() - 0.5) * 0.08 * (0.2 + 0.8 * distal))));
            if (!isLead) {
                d = vnorm(vadd(d, [0, -0.016 * (0.3 + 0.7 * (i / NSEG)) * Math.pow(distal, 0.9), 0]));
            }
            const p2 = vadd(p, vscl(d, segLen));
            const gnA = 0.05 + 0.1 * (1 - distal) * clamp(p[1] / (P.height * 0.5), 0.25, 1); // Gnarl: dicke/aeltere Aeste knorrig, Zweige & Stammfuss glatt (dort regiert die Floete) -> kein Poolnudel-Look
            const gnf = (pp) =>
                1 +
                gnA *
                    ((vn2(pp[0] * 2.1 + pp[1] * 1.3, pp[2] * 2.1 - pp[1] * 0.9) - 0.5) * 1.5 +
                        Math.sin(pp[1] * 2.7 + pp[0] * 1.8 + depth) * 0.3);
            const r0 = lerp(radius, rEnd, i / NSEG) * gnf(p),
                r1 = lerp(radius, rEnd, (i + 1) / NSEG) * gnf(p2);
            const dSw = segLen * Math.pow(trunkR / Math.max(r0, rMin), 1.05) * 0.9;
            const sw0 = aSw,
                sw1 = aSw + dSw;
            aSw = sw1;
            if (sw1 > maxSway) maxSway = sw1;
            const omega = clamp(0.18 + 1.7 * (r0 / trunkR), 0.18, 2.4); // f ~ r/L²  dick=steif=schnell
            const phase = depth * 1.7 + i * 0.6 + azim.v * 0.3;
            if (isLead && P.conifer && P.apical > 0.62 && count < 8500 && p2[1] > (P.crownBase || 0) * P.height) {
                const intn = P.height * (P.whorlSpacing || 0.12);
                if (Math.floor(p2[1] / intn) > Math.floor(p[1] / intn)) {
                    const nWh = Math.round(lerp(5, 7, P.apical)),
                        uy = clamp(p2[1] / P.height, 0, 1);
                    const wShare = clamp(0.42 - 0.37 * clamp(trunkR / 1.2, 0, 1), 0.05, 0.42);
                    const brad = r1 * Math.pow(wShare / nWh, 1 / P.delta);
                    for (let w = 0; w < nWh; w++) {
                        azim.v += GOLDEN;
                        const sd = vrot(perp(d), d, azim.v);
                        const wb = lerp(1.18, 0.62, uy);
                        let cd = vnorm(vadd(vscl(d, Math.cos(wb)), vscl(sd, Math.sin(wb))));
                        cd = vnorm(vadd(cd, [0, -(P.coniferDroop == null ? 0.22 : P.coniferDroop), 0]));
                        grow(
                            p2,
                            cd,
                            brad,
                            P.height * lerp(0.15, 0.06, uy) * (P.barkType === "sequoia" ? 0.95 : 1.0),
                            depth + 1,
                            sw1,
                            myRun,
                            false
                        );
                    }
                }
            }
            segs.push({ p0: p, p1: p2, r0, r1, depth, sway0: sw0, sway1: sw1, phase, omega, runId: myRun });
            count++;
            p = p2;
        }
        const tip = p,
            tipDir = d,
            tipR = rEnd,
            tipSway = aSw;
        if (tipR < rMin * 1.4 || length < lMin || depth >= P.maxDepth) {
            if (P.conifer) {
                const nN = Math.round(lerp(18, 32, P.leafD));
                for (let i = 0; i < nN; i++) {
                    azim.v += GOLDEN;
                    const sd = vrot(perp(tipDir), tipDir, azim.v);
                    const ndir = vnorm(vadd(vscl(tipDir, 0.4), vscl(sd, 0.9)));
                    const bp = vadd(tip, vscl(tipDir, -length * 0.5 * rnd()));
                    leaves.push({
                        pos: bp,
                        dir: ndir,
                        up: perp(ndir),
                        scale: lerp(0.1, 0.2, P.leafD),
                        sway: tipSway,
                        phase: rnd() * 6.28,
                        omega: clamp(0.18 + 1.7 * (tipR / trunkR), 0.18, 2.4),
                        needle: true,
                    });
                }
            } else if (P.trop > 0.6) {
                let wp = tip.slice(),
                    wd = tipDir.slice();
                const whipLen = P.height * rrange(0.2, 0.38),
                    wseg = 9,
                    wr = tipR * 0.6;
                const wRun = runId++;
                runMeta[wRun] = { parentRun: myRun, isLead: false };
                for (let s = 0; s < wseg; s++) {
                    wd = vnorm(vadd(wd, [0, -0.7, 0]));
                    const np = vadd(wp, vscl(wd, whipLen / wseg));
                    const sw0 = tipSway + s * 0.2,
                        sw1 = tipSway + (s + 1) * 0.2;
                    if (sw1 > maxSway) maxSway = sw1;
                    segs.push({
                        p0: wp,
                        p1: np,
                        r0: wr * (1 - s / wseg),
                        r1: wr * (1 - (s + 1) / wseg),
                        depth: depth + 1,
                        sway0: sw0,
                        sway1: sw1,
                        phase: s * 0.5 + azim.v * 0.2,
                        omega: 0.45,
                        runId: wRun,
                    });
                    if (s > 0) {
                        azim.v += GOLDEN;
                        const lp = vlerp(wp, np, 0.5);
                        leaves.push({
                            pos: lp,
                            dir: [0, -1, 0.0001],
                            up: [0.0001, 0, 1],
                            scale: P.leafSize * rrange(0.55, 0.8),
                            sway: sw1,
                            phase: rnd() * 6.28,
                            omega: 0.45,
                            needle: false,
                        });
                    }
                    wp = np;
                }
            } else {
                const nL = Math.round(lerp(8, 16, P.leafD));
                for (let i = 0; i < nL; i++) {
                    azim.v += GOLDEN;
                    const sd = vrot(perp(tipDir), tipDir, azim.v);
                    let ldir = vnorm(vadd(vscl(tipDir, 0.5), vscl(sd, 0.85)));
                    if (P.trop > 0.5) ldir = vnorm(vadd(ldir, [0, -0.9, 0]));
                    const bp = vadd(tip, vscl(tipDir, -length * (0.2 + 0.6 * rnd())));
                    leaves.push({
                        pos: bp,
                        dir: ldir,
                        up: vnorm(vadd(perp(ldir), vscl(tipDir, 0.3))),
                        scale: P.leafSize * rrange(0.8, 1.15),
                        sway: tipSway,
                        phase: rnd() * 6.28,
                        omega: clamp(0.18 + 1.7 * (tipR / trunkR), 0.18, 2.4),
                        needle: false,
                    });
                }
            }
            return;
        }
        // da Vinci / Pipe-Modell: Querschnittsflaeche erhalten ( r^Delta )
        const parentArea = Math.pow(tipR, P.delta);
        let children = [];
        const lift = tip[1] < (P.crownBase || 0) * P.height; // Selbst-Astung: Schattenaeste unten sterben -> kahler Stamm
        if (P.apical > 0.62) {
            const f = P.conifer
                ? isLead
                    ? 0.94
                    : lerp(0.5, 0.72, P.apical)
                : lerp(0.55, 0.9, (P.apical - 0.62) / 0.38);
            const nW = lift ? 0 : P.conifer ? (isLead ? 0 : Math.round(lerp(2, 4, P.apical))) : 3;
            children.push({
                area: (lift ? 1 : f) * parentArea,
                bend: lerp(0.04, 0.16, 1 - P.apical),
                len: length * lerp(0.72, 0.8, P.apical),
                lead: true,
            });
            for (let i = 0; i < nW; i++)
                children.push({
                    area: ((1 - f) * parentArea) / nW,
                    bend: P.conifer ? lerp(1.0, 0.5, depth / P.maxDepth) : lerp(0.6, 1.15, distal),
                    len: length * (P.conifer ? lerp(0.4, 0.52, P.apical) : lerp(0.55, 0.72, P.apical)),
                    lead: false,
                });
        } else if (lift) {
            children.push({ area: parentArea, bend: 0.08, len: length * 0.82, lead: true });
        } else {
            // dekurrente Krone: kurzer Weitertrieb begrenzt Hoehe, breit spreizende Arme bilden die Kuppel -> breiter als hoch (Eiche)
            children.push({
                area: parentArea * 0.3,
                bend: lerp(0.12, 0.3, 1 - P.apical),
                len: length * 0.6,
                lead: true,
            }); // Leittrieb verliert sich
            const nLat = rnd() < 0.55 ? 3 : 2;
            const spread = lerp(0.55, 1.05, 1 - P.apical); // Spreizung skaliert mit Apikaldominanz: Eiche breit, Birke schmaler
            for (let i = 0; i < nLat; i++)
                children.push({
                    area: (parentArea * 0.7) / nLat,
                    bend: spread * rrange(0.85, 1.12),
                    len: length * lerp(0.82, 0.96, P.apical),
                    lead: false,
                });
        }
        for (const ch of children) {
            const cr = Math.pow(ch.area, 1 / P.delta);
            let cdir;
            if (!ch.lead) {
                azim.v += GOLDEN;
                const side = vrot(perp(tipDir), tipDir, azim.v);
                cdir = vnorm(vadd(vscl(tipDir, Math.cos(ch.bend)), vscl(side, Math.sin(ch.bend))));
                if (P.conifer) cdir = vnorm(vadd(cdir, [0, -(P.coniferDroop == null ? 0.22 : P.coniferDroop), 0]));
            } else {
                const side = vrot(perp(tipDir), tipDir, rnd() * 6.28);
                cdir = vnorm(vadd(vscl(tipDir, Math.cos(ch.bend)), vscl(side, Math.sin(ch.bend))));
            }
            grow(tip, cdir, cr, ch.len, depth + 1, tipSway, myRun, ch.lead);
        }
    }

    if (P.basalStems > 1) {
        for (let i = 0; i < P.basalStems; i++) {
            const a = (i / P.basalStems) * 6.28 + rnd();
            const lean = rrange(0.12, 0.3);
            const dir = vnorm([Math.cos(a) * Math.sin(lean), Math.cos(lean), Math.sin(a) * Math.sin(lean)]);
            grow(
                [Math.cos(a) * trunkR * 1.5, 0, Math.sin(a) * trunkR * 1.5],
                dir,
                trunkR * rrange(0.6, 0.85),
                P.height * 0.5,
                0,
                0,
                -1,
                false
            );
        }
    } else {
        grow([0, 0, 0], [0, 1, 0], trunkR, P.height * (P.conifer ? 0.2 : 0.3), 0, 0, -1, false);
    }
    const gain = P.windGain;
    for (const s of segs) {
        s.sway0 = (s.sway0 / maxSway) * gain;
        s.sway1 = (s.sway1 / maxSway) * gain;
    }
    for (const l of leaves) {
        l.sway = (l.sway / maxSway) * gain;
    }
    const __LBl = typeof __lod === "undefined" ? 0 : __lod,
        __LB =
            (globalThis.PHYTO_LEAFBUDGET && globalThis.PHYTO_LEAFBUDGET[__LBl]) ||
            (P.kind === "shrub"
                ? [4000, 1500, 1400]
                : [
                      20000, 9000, 7000,
                  ]) /* FIX v35b: Budget deckelt jetzt die KANONISCHE Liste (Wachstum ist LOD-frei); die LOD-Duennung macht _lf danach. 9000*0.21=1890 Laub-Karten bzw. *0.36=3240 Nadeln — exakt die v32-Zielwerte, sonst haetten Budget-Stride und _lf-Stride sich multipliziert (Kronen ~3x zu duenn) */[
                __LBl
            ]; /* Strauch = Bodenfueller: 30 Verts/Blatt (Bandgeometrie) -> haerteres Budget. FIX v29: L1-Deckel 7000->3000 — mit Aggregation (groessere Karten) reicht das fuer volle Abdeckung; vorher kostete EIN dichter L1-Baum bis 196k Dreiecke, und davon stehen Dutzende im 20-40m-Band */
    if (leaves.length > __LB) {
        const _st = leaves.length / __LB,
            _kp = [];
        for (let _t = 0; _t < __LB; _t++) _kp.push(leaves[Math.floor(_t * _st)]);
        leaves.length = 0;
        for (const _k of _kp) leaves.push(_k);
    } /* BLATT-BUDGET je LOD (SpeedTree-Praxis): Terminal-Anzahl waechst ~delta^Tiefe und explodiert kanonisch (Strauch: 46k Blaetter bei leafD 0.09!) -- gleichmaessiges Subsampling deckelt Verts, Silhouette bleibt. Ventil: PHYTO_LEAFBUDGET=[L0,L1,L2] */
    return { segs, leaves, trunkR, height: P.height, runMeta };
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
    strands.push(rings);
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
    for (const rings of strands) {
        buildTube(geos, rings, P, colA, colB, P._trunkR); // Wurzel tritt aus dem Strebepfeiler-Wulst aus -> fliessender Uebergang, keine Fuge noetig
    }
    addMerged(geos, barkMat);
}

function vn2(x, y) {
    const xi = Math.floor(x),
        yi = Math.floor(y),
        xf = x - xi,
        yf = y - yi;
    const h = (a, b) => {
        let n = (Math.imul(a, 1597) + Math.imul(b, 51749)) | 0;
        n = (n << 13) ^ n;
        const nn = Math.imul(n, n);
        const t = (Math.imul(nn, 15731) + 789221) | 0;
        const m = (Math.imul(n, t) + 1376312589) | 0;
        return 1 - (m & 0x7fffffff) / 1073741824;
    };
    const u = xf * xf * (3 - 2 * xf),
        v = yf * yf * (3 - 2 * yf);
    const x1 = h(xi, yi) + (h(xi + 1, yi) - h(xi, yi)) * u,
        x2 = h(xi, yi + 1) + (h(xi + 1, yi + 1) - h(xi, yi + 1)) * u;
    return (x1 + (x2 - x1) * v) * 0.5 + 0.5;
}
function fbm2(x, y) {
    return vn2(x, y) * 0.6 + vn2(x * 2.3 + 11, y * 2.3) * 0.27 + vn2(x * 5.1, y * 5.1 + 7) * 0.13;
}
function barkProfile(P) {
    const t = P.barkType || (P.conifer ? "conifer" : "oak");
    const T = {
        oak: { ridges: 9, depth: 0.4, vSharp: 1.7, plate: 0.55, hFreq: 2.4, lichen: 0.5, papery: 0 },
        sequoia: { ridges: 14, depth: 0.52, vSharp: 1.5, plate: 0.2, hFreq: 1.1, lichen: 0.18, papery: 0 },
        conifer: { ridges: 8, depth: 0.34, vSharp: 1.3, plate: 0.8, hFreq: 3.0, lichen: 0.55, papery: 0 },
        willow: { ridges: 10, depth: 0.42, vSharp: 1.6, plate: 0.45, hFreq: 2.0, lichen: 0.5, papery: 0 },
        birch: { ridges: 5, depth: 0.07, vSharp: 1.0, plate: 0.1, hFreq: 5.5, lichen: 0.12, papery: 1 },
        smooth: { ridges: 5, depth: 0.1, vSharp: 1.1, plate: 0.2, hFreq: 3.0, lichen: 0.3, papery: 0 },
    };
    return T[t] || T.oak;
}
function buildTube(geos, rings, P, barkBase, barkTip, trunkR, noFlute, barkThick) {
    const M = rings.length;
    if (M < 2) return;
    const prof = barkProfile(P);
    const baseR = rings[0].r,
        thick = clamp((baseR - trunkR * 0.12) / (trunkR * 0.88), 0, 1); // 0 Zweig .. 1 Stamm
    const bthick = barkThick !== undefined ? barkThick : thick; // Wurzel/Totast erben die STAMM-Oberflaeche (gleiche Furchentiefe), nicht die duenn-glatte
    const ridges =
        barkThick !== undefined
            ? Math.max(3, Math.round(prof.ridges * clamp(baseR / trunkR, 0.28, 1)))
            : Math.round(lerp(4, prof.ridges, bthick)); // Wurzel: Furchen in WELT-Groesse des Stamms (nicht enger), nur Tiefe wie Stamm
    let R = Math.max(6, Math.round(ridges * (bthick > 0.6 ? 3.0 : 2.4)));
    R =
        typeof __lod !== "undefined" && __lod === 2
            ? Math.max(4, Math.round(R * 0.4))
            : Math.max(5, R - (typeof __lod !== "undefined" ? __lod * 4 : 0)); // Stamm (thick) SCHARF, Aeste sparsam
    const depth = prof.depth * lerp(0.28, 1, bthick),
        lichenA = prof.lichen * (typeof __lichen !== "undefined" ? __lichen : 0.6);
    const lichenCol = new THREE.Color(0x8a946a),
        mossCol = new THREE.Color(0x556a3a);
    const seed = rings[0].c[0] * 7.3 + rings[0].c[2] * 3.1;
    // Bogenlaenge entlang des Strangs
    const sA = [0];
    for (let i = 1; i < M; i++) sA[i] = sA[i - 1] + vlen(vsub(rings[i].c, rings[i - 1].c));
    const totL = sA[M - 1] || 1;
    const dirs = [];
    for (let i = 0; i < M - 1; i++) {
        const d = vsub(rings[i + 1].c, rings[i].c),
            l = vlen(d) || 1e-9;
        dirs.push([d[0] / l, d[1] / l, d[2] / l]);
    }
    dirs.push(dirs[M - 2]);
    let u = perp(dirs[0]),
        v = vnorm(vcross(dirs[0], u));
    const stride = R + 1;
    // NARBEN: der Stamm ZEICHNET seine Geschichte auf — wo die unteren Schattenaeste starben (unter crownBase), bleibt eine Wunde.
    const isTrunk = thick > 0.6,
        scarTop = (P.crownBase || 0) * P.height;
    const nScar = isTrunk ? Math.max(3, Math.min(8, Math.round(P.height * 0.6))) : 0;
    const scarH = [],
        scarA = [];
    if (isTrunk) {
        const ss = seed * 1.7 + 9.1;
        for (let k = 0; k < nScar; k++) {
            scarH.push(scarTop * (0.12 + 0.8 * (nScar > 1 ? k / (nScar - 1) : 0.5)));
            scarA.push(ss + k * 2.3999632);
        }
    } // goldener Winkel = echte Phyllotaxis
    const pos = [],
        idx = [],
        aw = [],
        ac = [],
        at = [],
        cl = [],
        uvs = [];
    const tri = (t) => {
        const f = t - Math.floor(t);
        return 1 - Math.abs(2 * f - 1);
    };
    for (let i = 0; i < M; i++) {
        if (i > 0) {
            const d1 = dirs[i];
            const du = u[0] * d1[0] + u[1] * d1[1] + u[2] * d1[2];
            u = [u[0] - d1[0] * du, u[1] - d1[1] * du, u[2] - d1[2] * du];
            const ul = vlen(u);
            u = ul < 1e-5 ? perp(d1) : [u[0] / ul, u[1] / ul, u[2] / ul];
            v = vnorm(vcross(d1, u));
        }
        const ring = rings[i],
            c = ring.c,
            sun = clamp(c[1] / P.height, 0, 1),
            sv = ring.sway,
            along = sA[i];
        const col = barkBase.clone().lerp(barkTip, sun * 0.5 + (ring.depth / Math.max(1, P.maxDepth)) * 0.32);
        const nB = Math.max(3, Math.round(P.roots || 5)),
            _fy = Math.max(0, c[1]),
            fluteOn = !noFlute && thick > 0.45 && P._bphase != null && (typeof __lod === "undefined" || __lod < 2),
            fluteY = fluteOn ? Math.exp(-_fy / (P.height * 0.3)) + 0.62 * Math.exp(-_fy / (P.height * 0.07)) : 0,
            fluteAmp = fluteY * (0.16 + (P.flare || 0) * 0.4);
        let _fd = 0,
            _fr = 0,
            _fg = 0,
            _fb = 0;
        for (let j = 0; j <= R; j++) {
            const a = j / R,
                rad = a * 6.2831;
            let relief,
                mB,
                tintL = 0,
                tintM = 0;
            if (prof.papery) {
                // Birke: glatt, helle Rinde, dunkle Lentizellen
                relief = 0.5 + (fbm2(a * 9, along * 0.7 + seed) - 0.5) * 0.45;
                const band = Math.floor(along * 10 + (fbm2(a * 1.4, seed) - 0.5) * 1.2);
                const stripe = tri(along * 10 + (fbm2(a * 1.4, seed) - 0.5) * 0.5);
                const dash = fbm2(a * 6.5 + seed, band * 4.3);
                const lent = stripe > 0.74 && dash > 0.5 ? clamp((dash - 0.5) / 0.3, 0, 1) : 0; // kurze horizontale Striche
                const peel = fbm2(a * 2.2, along * 0.5 + seed * 1.3) > 0.66 ? 0.1 : 0; // papierartige Schichtkanten
                mB = (1.0 - lent * 0.66 - peel) * (0.9 + 0.1 * fbm2(a * 5, along * 3));
            } else {
                const vWarp = fbm2(a * 1.6 + seed, along * 0.35) * 1.5;
                let vf = tri(a * ridges + vWarp);
                vf = Math.pow(vf, prof.vSharp); // vertikale Furchen
                const hWarp = fbm2(a * 0.6, along * 0.7 + seed) * 1.5;
                let hf = Math.pow(tri(along * prof.hFreq + hWarp), 1.3); // horizontale Plattenrisse
                relief = vf * (1 - prof.plate) + vf * hf * prof.plate;
                const micro = (fbm2(a * 5, along * 5) - 0.5) * 0.32 + (fbm2(a * 13, along * 13) - 0.5) * 0.16;
                relief = clamp(relief + micro, 0, 1);
                mB = Math.pow(relief, 1.35) * 0.74 + 0.26; // gebackenes AO: Risse tief & dunkel
                const lk = fbm2(a * 0.9 + 30, along * 0.55);
                tintL = clamp((lk - 0.58) / 0.22, 0, 1) * lichenA * clamp(1.3 - along / totL, 0.2, 1) * relief;
                tintM =
                    clamp((fbm2(a * 1.3, along * 0.4 + 50) - 0.6) / 0.2, 0, 1) *
                    clamp(1.4 - along / (totL * 0.4), 0, 1) *
                    lichenA *
                    0.7; // Moos am Fuss
                if (barkThick !== undefined) {
                    tintL *= 0.25;
                    tintM *= 0.25;
                    mB = mB * 0.72 + 0.3;
                } // WURZEL/TOTAST: kaum Moos, weniger AO -> gleiche Helligkeit wie der Stamm
            }
            const ridge = Math.pow(Math.max(0, Math.cos(nB * (rad - (P._bphase || 0)))), 1.8);
            const flute = Math.min(1.62, Math.max(0.7, 1 + fluteAmp * (1.45 * ridge - 0.3)));
            let scarR = 0,
                scarDark = 0;
            for (let k = 0; k < nScar; k++) {
                const dh = (c[1] - scarH[k]) / 0.5,
                    dth = Math.atan2(Math.sin(rad - scarA[k]), Math.cos(rad - scarA[k])) / 0.5;
                const d2 = dh * dh + dth * dth;
                if (d2 > 9) continue;
                const gg = Math.exp(-d2);
                scarR += -0.42 * gg + 0.24 * Math.max(0, d2 - 0.9) * Math.exp(-d2 * 0.6); // konkave Delle + aufgeworfener Wulst-Kragen
                if (gg > scarDark) scarDark = gg;
            }
            let disp = ring.r * (1 + (relief - 0.62) * depth + scarR) * flute;
            if (j === R) disp = _fd; // NAHT ZU: Position der Saumspalte = exakt Spalte 0
            const vx = c[0] + (Math.cos(rad) * u[0] + Math.sin(rad) * v[0]) * disp,
                vy = c[1] + (Math.cos(rad) * u[1] + Math.sin(rad) * v[1]) * disp,
                vz = c[2] + (Math.cos(rad) * u[2] + Math.sin(rad) * v[2]) * disp;
            pos.push(vx, vy, vz);
            uvs.push(a, i / (M - 1));
            aw.push(sv, sv * 1.5 + vx * 0.6 + vz * 0.6, clamp(2.6 - sv * 1.6, 0.5, 2.6));
            ac.push(c[0], c[1], c[2]);
            at.push(0);
            let r = col.r * mB,
                g = col.g * mB,
                b = col.b * mB;
            r = lerp(r, lichenCol.r, tintL);
            g = lerp(g, lichenCol.g, tintL);
            b = lerp(b, lichenCol.b, tintL);
            r = lerp(r, mossCol.r, tintM);
            g = lerp(g, mossCol.g, tintM);
            b = lerp(b, mossCol.b, tintM);
            const wd = 0.6 * scarDark;
            r = lerp(r, col.r * 0.26, wd);
            g = lerp(g, col.g * 0.22, wd);
            b = lerp(b, col.b * 0.2, wd); // dunkles Wundholz im Narbenzentrum
            if (j === R) {
                r = _fr;
                g = _fg;
                b = _fb;
            } // NAHT ZU: Farbe der Saumspalte = exakt Spalte 0
            if (j === 0) {
                _fd = disp;
                _fr = r;
                _fg = g;
                _fb = b;
            }
            cl.push(r, g, b);
        }
    }
    for (let i = 0; i < M - 1; i++)
        for (let j = 0; j < R; j++) {
            const aI = i * stride + j,
                bI = aI + 1,
                cI = aI + stride,
                dI = cI + 1;
            idx.push(aI, bI, dI, aI, dI, cI);
        }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    g.setAttribute("aWind", new THREE.Float32BufferAttribute(aw, 3));
    g.setAttribute("aCenter", new THREE.Float32BufferAttribute(ac, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    g.setAttribute("aType", new THREE.Float32BufferAttribute(at, 1));
    g.setAttribute("color", new THREE.Float32BufferAttribute(cl, 3));
    geos.push(g);
}
function emitTree(P) {
    const nodes = growTreeNodes(P);
    /* FIX v35: LOD = ABLEITUNG AUS L0. Ein Same -> EIN Individuum: das Skelett waechst bei JEDER Stufe identisch
     (gleicher RNG-Strom), niedrigere Stufen entstehen deterministisch daraus — Zweige unter der Radius-Schwelle
     fallen aus der Geometrie (das ist Pipe-Modell-treu: duenn = jung = fern unsichtbar), Blaetter werden per
     Index-Stride ausgeduennt (rng-frei, dieselbe Technik wie das Budget). Stamm, Winkel, Windphasen und Farben
     sind jetzt ueber L0/L1/L2 UND das Billboard dasselbe Individuum. */
    if (__lod > 0 && P.kind !== "shrub") {
        const rCut = (P._trunkR || 0.1) * (__lod === 1 ? 0.05 : 0.13);
        nodes.segs = nodes.segs.filter((s) => Math.max(s.r0, s.r1) >= rCut);
    }
    {
        const lfL = P._lf != null ? P._lf : 1;
        if (lfL < 1 && nodes.leaves.length > 3) {
            const L = nodes.leaves,
                keep = Math.max(3, Math.round(L.length * lfL)),
                st = L.length / keep,
                K = [];
            for (let t = 0; t < keep; t++) K.push(L[Math.floor(t * st)]);
            nodes.leaves = K;
        }
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
        return rings;
    }
    for (const rid of runs.keys()) {
        const mm = meta[rid];
        if (mm && mm.isLead) continue;
        let rings = strandRings(rid);
        const baseRing = rings[0];
        if (rings.length > 1 && baseRing.c[1] < nodes.height * 0.04 && baseRing.r > nodes.trunkR * 0.6) {
            // Stammfuss: Buttress in den Boden fuehren (absenken, verjuengen, schliessen)
            const R0 = baseRing.r,
                cx = baseRing.c[0],
                cz = baseRing.c[2],
                bd = Math.min(R0 * 0.85, nodes.trunkR * 1.7);
            rings = [
                { c: [cx, -bd, cz], r: R0 * 0.1, sway: 0, depth: baseRing.depth },
                { c: [cx, -bd * 0.5, cz], r: R0 * 0.52, sway: 0, depth: baseRing.depth },
                { c: [cx, -bd * 0.18, cz], r: R0 * 0.84, sway: 0, depth: baseRing.depth },
            ].concat(rings);
        }
        buildTube(barkGeos, rings, P, barkBase, barkTip, nodes.trunkR);
        const s0 = runs.get(rid)[0];
        if (s0.depth > 0 && baseRing.r > nodes.trunkR * 0.035) {
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
    const lc = seasonTint.clone(),
        lc2 = seasonAccent.clone();
    let useTexL = __lod === 1 && !P.conifer && P.kind !== "shrub" && (P.trop || 0) < 0.55; // FIX v32: Trauerwuchs (Weide) bleibt geometrisch — haengende Straehnen SIND ihr Look   // FIX v31: Mittelfeld-Laubbaeume -> Textur-Cluster (Nadeln bleiben Geometrie: billig + Cluster saehen falsch aus; Straeucher bleiben nah-chunky)
    if (useTexL && !_leafAtlas) {
        try {
            bakeLeafAtlas();
        } catch (_ae) {
            console.warn("[phyto] Blattatlas fehlgeschlagen -> geometrische Blaetter:", _ae);
        }
    }
    if (useTexL && !_leafAtlas) useTexL = false; // FIX v34: stiller Fehlschlag unmoeglich — ohne Atlas fallen wir sichtbar auf Geometrie zurueck UND loggen es
    if (__lod === 1)
        console.log(
            "[phyto] L1-Bau: " +
                (useTexL
                    ? "Multi-Blatt-KARTEN"
                    : P.conifer
                      ? "Nadel-GEOMETRIE (Cluster an Koniferen bewusst aus)"
                      : (P.trop || 0) >= 0.55
                        ? "Trauerwuchs-GEOMETRIE (Straehnen-Look)"
                        : "GEOMETRIE")
        );
    const folGeosTex = [];
    let _lq = 0;
    for (const l of nodes.leaves) {
        if (l.needle) {
            const col = new THREE.Color(0x2e5526).lerp(seasonTint, 0.2);
            pushNeedle(
                folGeos,
                l.pos,
                l.dir,
                l.scale * (__lod === 1 ? 1.65 : __lod === 2 ? 2.6 : 1),
                col,
                l.sway,
                l.phase,
                l.omega
            ); // FIX v38 (AUDIT-FUND): Nadel-Aggregation war NIE wahr — ls floss nur in Blattkarten, nie in pushNeedle: L1 verlor 64% Nadeln ohne Laengen-Ausgleich (Deckung ~0.36 -> duenne Mittelfeld-Fichten). Deckung ~ n*len^2: 0.36*1.65^2 ~ 0.98 — gehaltene Nadeln laenger, Krone dicht.
        } else {
            const _tj = (() => {
                const s = Math.sin(l.pos[0] * 127.1 + l.pos[1] * 311.7 + l.pos[2] * 74.7) * 43758.5453;
                return s - Math.floor(s);
            })(); // FIX v35: Tint = hash(Blattposition) — dasselbe Blatt hat in JEDER LOD-Stufe dieselbe Farbe (vorher: sequentielles rnd() -> je LOD andere Farbfolge)
            const tint = lc
                .clone()
                .lerp(lc2, _tj * 0.5)
                .lerp(new THREE.Color(P.leafCol), P.kind === "shrub" ? 0.72 : 0.45);
            if (useTexL) {
                pushLeafClusterQuad(
                    folGeosTex,
                    l.pos,
                    l.dir,
                    l.up,
                    l.scale * 2.35,
                    tint,
                    l.sway,
                    l.phase,
                    l.omega,
                    _lq++ & 3
                );
            } // FIX v32: ALLE Blattstellen, Quad nur 2.35x (0.6-1.2m statt 1.5-2.3m) + dichter gemalter Atlas -> Deckung ~0.85 ohne einzeln lesbare Riesenkarten; 2 statt 28 Dreiecke bleibt
            else pushLeaf(folGeos, l.pos, l.dir, l.up, l.scale, P.leafShape, tint, 1, l.sway, l.phase, l.omega, 0.5);
        }
    }
    addMerged(barkGeos, P.barkType === "birch" ? barkMatBirch : barkMat); // KEIN Weld -> eigene Normalen, kein verschmierter Blob am Fuss
    emitRoots(P); // Wurzeln zurueck (hochgeladene Version: emitRoots, Farbe barkA*0.72/barkB*0.58, aus dem Flarefuss)
    addMerged(folGeos, foliageMat);
    if (folGeosTex.length) addMerged(folGeosTex, foliageMatTex); // FIX v31: Cluster-Quads als eigenes Submesh (eigener Attributsatz mit uv) — Studio UND Wald, da buildInstance den subject-Sink tauscht
    return nodes;
}
/* ========================================================================== *
   BLUME — Vogel-Spirale (Korb) + Fibonacci-Blueten (Superformel)
 * ========================================================================== */
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
                new THREE.Color(0x3c6a24),
                new THREE.Color(0x4f7a2e),
                0
            );
            prev = p2;
        }
    }
    const top = prev,
        tdir = d,
        petalCol = new THREE.Color(P.flowerCol),
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
            new THREE.Color(0x5a4a20),
            new THREE.Color(0x6a5a28),
            0
        );
        pushJointSphere(
            folGeos,
            vadd(pos, vscl(bdir, -headR * 0.35)),
            headR * 0.74,
            new THREE.Color(0x6a5a28).lerp(petalCol, 0.12),
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
            const col = new THREE.Color(0x6a4a18).lerp(new THREE.Color(0xc88a20), r / headR);
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
        for (let i = 0; i < np; i++) {
            const a = (i / np) * 6.28,
                out = vnorm(vadd(vscl(hr, Math.cos(a)), vscl(u2, Math.sin(a))));
            const base = vadd(pos, vscl(out, headR * 0.58)),
                pdir = vnorm(vadd(out, vscl(bdir, 0.4)));
            pushLeaf(
                folGeos,
                base,
                pdir,
                bdir,
                plen,
                P.petalShape,
                petalCol.clone().lerp(seasonTint, 0.08),
                3,
                hsw,
                a,
                1.3,
                0.45
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
                new THREE.Color(0x3c6a24),
                new THREE.Color(0x4f7a2e),
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
            seasonTint.clone().lerp(seasonAccent, 0.4),
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

/* ========================================================================== *
   GRASBUESCHEL — Halme als Euler-Kragtraeger (Biegung unter Eigengewicht)
 * ========================================================================== */
function emitGrass(P) {
    const geos = [];
    const lf = __lod === 0 ? 1 : __lod === 1 ? 0.55 : 0.14;
    const N = Math.max(3, Math.round(lerp(50, 150, P.density) * lf));
    const baseCol = seasonTint.clone().multiplyScalar(0.6),
        tipCol = seasonAccent.clone().multiplyScalar(1.08);
    const seedCol = new THREE.Color(P.seedTan || 0xc8b27a);
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
/* ========================================================================== *
   FELS — fBm-Verwitterung · Zingg-Form · Wadell-Rundung · Schichtung
 * ========================================================================== */
// REGNUM LITHOS v2 — Relief in der Geometrie, Kurvatur-AO gebacken, echte Stratigraphie
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
        moss = new THREE.Color(0x6f8a3e),
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
        if (rockLichen > 0) ctop.lerp(new THREE.Color(0x768a44), 0.4 * rockLichen);
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
/* ========================================================================== *
   ARTEN-KATALOG — Presets als Punkte im Morphospace (Tupel + Bauer)
 * ========================================================================== */
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
            rkind: "crystal",
            size: 2.4,
            count: 20,
            rockA: 0x8a5ac8,
            rockB: 0x342c3c,
            rockC: 0xc8b0e8,
            matRough: 0.16,
        },
    },
};
let CURRENT = "eiche",
    SEED = 12345;

/* ---------- Slider -> abgeleitete Struktur-Parameter ---------------------- */
function gv(id) {
    return parseFloat(document.getElementById(id).value);
}
function phenotype(api, slim, trop, delta, leaf) {
    // META-REGEL: Phaenotyp aus dem Reglervektor -> Art als Region/Richtung im Raum
    const conif = clamp((api - 0.62) / 0.2, 0, 1); // Apikaldominanz: exkurrent(Nadel) vs dekurrent(Laub)
    const isCon = conif > 0.5,
        isShrub = api < 0.22; // kein Leittrieb -> basal verzweigter Busch
    const weep = !isCon && !isShrub ? clamp((trop - 0.5) / 0.4, 0, 1) : 0; // Trauerwuchs
    let height = lerp(2.2, 6.0, api * 0.35 + leaf * 0.3 + (1 - slim) * 0.35);
    if (isCon) height *= 1.4;
    let barkType;
    if (isShrub) barkType = "smooth";
    else if (isCon)
        barkType = slim < 0.4 ? "sequoia" : "conifer"; // dick+apikal->Sequoia, schlank+apikal->Fichte
    else if (weep > 0.4) barkType = "willow";
    else if (slim > 0.66) barkType = "birch";
    else barkType = "oak";
    if (barkType === "sequoia") height *= 1.6; // Mammutbaum-Gigant
    if (isShrub) height = lerp(1.5, 2.6, leaf * 0.5 + 0.5);
    const oakness = clamp((1 - slim) * 1.5, 0, 1) * (1 - conif) * (1 - weep * 0.7); // breit+gelappt
    const lwsc = isCon ? 0.085 : lerp(0.16, 0.44, clamp((1 - slim * 0.65) * (1 - weep * 0.55), 0, 1)); // Nadel/Weide schmal -> Eiche breit
    const leafShape = {
        m: 2 + 7 * oakness,
        n1: lerp(1.0, 0.7, oakness),
        n2: lerp(1.0, 0.55, oakness),
        n3: lerp(1.0, 0.55, oakness),
        a: 1,
        b: 1,
        wsc: lwsc,
    };
    const BC = {
        oak: [0x3a2c1e, 0x6a5a44],
        conifer: [0x4a2c1a, 0x6a4a30],
        sequoia: [0x6a3a26, 0x9a5e3c],
        birch: [0xe6e6dc, 0xf2f2ea],
        willow: [0x4a4438, 0x665e4c],
        smooth: [0x3a2c1e, 0x5a4a34],
    };
    const LC = {
        oak: 0x4a7a2c,
        conifer: 0x2e5526,
        sequoia: 0x3a6a30,
        birch: 0x8ab84a,
        willow: 0x6a9a3a,
        smooth: 0x4a7a2c,
    };
    const bc = BC[barkType];
    return {
        kind: isShrub ? "shrub" : "tree",
        conifer: isCon,
        height,
        barkType,
        leafShape,
        barkA: bc[0],
        barkB: bc[1],
        leafCol: LC[barkType],
        coniferDroop: isCon ? clamp(0.13 + trop * 0.25, 0.05, 0.5) : undefined,
        whorlSpacing: isCon ? lerp(0.1, 0.15, 1 - leaf) : undefined,
        crownBase: isCon
            ? lerp(0.1, 0.48, clamp((0.55 - slim) / 0.45, 0, 1))
            : isShrub
              ? 0
              : lerp(0, 0.32, clamp((api - 0.25) * 1.6, 0, 1)),
        flare: isShrub ? 0.14 : lerp(0.16, 0.52, 1 - slim),
        roots: Math.round(lerp(4, 6, 1 - slim)),
        basalStems: isShrub ? Math.round(lerp(5, 2, api / 0.22)) : 1,
        maxDepth: Math.round(lerp(7, 10, leaf * 0.4 + slim * 0.3 + api * 0.3)),
        windGain: isCon ? lerp(0.45, 0.7, slim) : lerp(0.85, 1.3, slim * 0.5 + weep * 0.5),
    };
}
let __dials =
    null; /* Dial-Kontext: gesetzt = kanonische Preset-Regler (Wald/Templates/Atlas, DOM-frei & deterministisch); null = Studio liest live die Slider */
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
    const lf = __lod === 0 ? 1 : __lod === 1 ? (fx && fx.conifer ? 0.36 : 0.21) : 0.16,
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
    // tree / shrub — phaenotypische Variation um den Genotyp (Slider) + LOD
    const ph = phenotype(api, slim, trop, delta, leaf);
    const lc0 = new THREE.Color(ph.leafCol);
    lc0.offsetHSL((IR() - 0.5) * 0.05, (IR() - 0.5) * 0.1, (IR() - 0.5) * 0.08);
    const lcol = lc0.getHex();
    return {
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
}
function lerpHex(a, b, t) {
    return new THREE.Color(a).lerp(new THREE.Color(b), clamp(t, 0, 1)).getHex();
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

/* ---------- Saison (Phaenologie) ------------------------------------------ */
let curSeason = "summer";
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
            else {
                emitTree(P);
            }
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
let __forest = null;
function bakeImpostorAtlas() {
    const K = Math.max(1, _impSpecs.length),
        V = _impV,
        cw = 128,
        ch = 256; // Spalten = (Art,Variante), Zeilen = 8 Blickwinkel um Y -> die Silhouette DREHT mit der Kamera (SpeedTree-Multi-View)
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
        const top = Math.max(0.5, box.max.y) * 1.02,
            halfH = top * 0.5;
        let _rad2 = 0;
        tree.traverse((o) => {
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
        const halfW = Math.max(halfH * (cw / ch), Math.sqrt(_rad2) * 1.04); // FIX v36: Rahmen = EXAKTER Radialabstand von der Achse (einmaliger Vertex-Scan) -> rotationsinvariant, kein Seiten-Clip in KEINER Ansicht (ersetzt den 1.08-Fudge); Leerraum bei einseitigen Kronen = Preis der Ankertreue         // FIX v28: PER-ART-RAHMEN (der im alten Kommentar dokumentierte Sonderfall, jetzt implementiert): nur Arten, die seitlich ueber den 0.5-Rahmen hinausragen (geneigte Weide!), bekommen einen breiteren — alle anderen behalten die volle Zellaufloesung. Keine geraden Schnittkanten mehr an der Silhouette.
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
    const shrubT = [buildInstance("strauch", Math.floor(RNG() * 1e6), 2)];
    const grassT = [
        buildInstance("gras", Math.floor(RNG() * 1e6), 2),
        buildInstance("gras", Math.floor(RNG() * 1e6), 2),
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
    const SCALE = {
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
    };

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
    const addTiled = (variants, plByVar, kind) => {
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
            const sc = SCALE[sp] * tr.s * 0.82,
                bh = H0arr[vi] * sc,
                bw = bh * ((_isp && _impWR[_isp.sp + _isp.seed]) || 0.5); // FIX v28: Quad-Seitenverhaeltnis = Zell-Rahmen der Art (Weide breiter) -> Silhouette unverzerrt und ungeclippt
            const bhL = Math.min(H0arr[vi], 24 / (SCALE[sp] * 0.82)) * sc; // FIX v30: Blatt-Sichthoehe = aH0L * Instanzskala — EXAKT die Zahl, die der Shader bildet (CPU==GPU, kein Drift)
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
                    capU = 24 / (SCALE[sp] * 0.82); // L0,L1 = echtes 3D-Mesh; capU: 18m Blatt-Referenz in Template-Einheiten
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
    addTiled(grassT, grassPl, "grass");
    addTiled(pebbleT, pebblePl, "pebble"); // ★ gekachelt + frustum-gecullt (der Dreiecks-Hebel)
    instAdd(flowerT, flowerPl, false);
    addTiled(
        shrubT,
        shrubPl,
        "shrub"
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
const _impV = 8,
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
            m.visible = dx * dx + dz * dz < lim * lim;
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
    function __replyRenderConfig(msg) {
        // Reine Daten (JSON-klonbar) — die EINE Wahrnehmungs-Quelle (PORTAL_RENDER_CONFIG). Tiefe Kopie,
        // damit der Empfaenger nichts am Studio-Objekt mutiert.
        const c = PORTAL_RENDER_CONFIG;
        const cfg = {
            sight: c.sight,
            fogNearMul: c.fogNearMul,
            camFarPad: c.camFarPad,
            lod: { d0: c.lod.d0, d1: c.lod.d1, fade: c.lod.fade, fade0: c.lod.fade0, ref: c.lod.ref, hyst: c.lod.hyst },
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
        };
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
        if (typeof window === "undefined" || (window.parent && window.parent !== window)) {
            __post({ type: "recipes", world: "terrain", reqId: msg && msg.reqId, book }, "*");
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
    function __extractAssetMesh(mesh) {
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
            const g = buildInstance(msg.presetId || "eiche", Number(msg.seed) || 0, msg.lod | 0, msg.ov || null);
            g.updateMatrixWorld(true);
            g.traverse((o) => {
                if (o.isMesh) {
                    const m = __extractAssetMesh(o);
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
