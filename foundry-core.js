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

const PORTAL_GROUND = {
    lit: 0x2c3621,
    mead: 0x55632f,
    dirt: 0x5c4a33,
    rock: 0x6b6258,
    wet: 0x33402a,
    sand: 0xc9b791,
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
};

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
    // Rezepte tragen die Kompensation: Gras K=5/3 Halme mit wMul 1.7/4.6); Blume + Fels
    // EINSTUFIG (wenige Instanzen bzw. Kleinst-Deko — eine Distanz-Stufe waere Deko ohne
    // Wert). Der Wald waehlt nah = stages[0], fern = stages[letzte]; Empfaenger clampen
    // ihre Distanz-Wahl auf die naechste verfuegbare Stufe.
    lod: {
        d0: 20,
        d1: 40,
        fade: 8,
        fade0: 4,
        ref: 12.0,
        hyst: 3.4,
        kindStages: { tree: [0, 1, 2], shrub: [1, 2], grass: [1, 2], flower: [0], rock: [0] },
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
        },
        rarity: { kristalle: 0.05, basalt: 0.3, sediment: 0.35, findling: 0.6, zacken: 0.6 },
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
        }
    };
    mat.customProgramCacheKey = function () {
        return "wind_" + (foliage ? (isGrass ? "grass_v8tint" : "fol_v7tint") : "bark") + "_v9overlap";
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

function superR(phi, m, n1, n2, n3, a, b) {
    const t = (m * phi) / 4;
    const p1 = Math.pow(Math.abs(Math.cos(t) / a), n2);
    const p2 = Math.pow(Math.abs(Math.sin(t) / b), n3);
    return Math.pow(p1 + p2, -1 / n1);
}

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
    // DIE LEISE KONSOLE (08.07.): die per-Bau-INFO-Zeile flutete den Boot (~112 Zeilen)
    // und ertraenkte echte Signale — nur noch hinter dem Debug-Flag (__phytoDebug).
    // Der v34-Fallback-WARN (Atlas-Fehlschlag) bleibt IMMER laut (stiller Fehlschlag unmoeglich).
    if (__lod === 1 && globalThis.__phytoDebug)
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

// Schweif-STRÄHNEN — die Lab-Streu (Kreuz-Quad-Form, getStrandGeo) DETERMINISTISCH
// (LCG je Segment, nie Math.random — Welt-Substanz-Gesetz) als EIN Geometrie-Block
// je Segment. Wandert aus dem Stamm hierher: die Pipe ist die eine Bau-Stelle.
// Ein Strähnen-BLOCK aus einer Streu-Spec: n Strähnen über dem Ellipsoid
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

function __tierStraehnenGeo(segR, i, Hh) {
    let s = (9301 + i * 49297) >>> 0;
    const rnd = () => {
        s = (s * 1103515245 + 12345) >>> 0;
        return s / 4294967296;
    };
    const pos = [];
    const idx = [];
    const q = new THREE.Quaternion();
    const AB = new THREE.Vector3(0, -1, 0);
    const d = new THREE.Vector3();
    const v = new THREE.Vector3();
    const n = (28 - i * 2) * 9;
    let sN = 0;
    for (let j = 0; j < n; j++) {
        const phi = rnd() * Math.PI;
        const theta = rnd() * Math.PI * 2;
        const dx = (rnd() - 0.5) * 0.25;
        const dy = (rnd() - 0.5) * 0.15;
        const dz = (rnd() - 0.5) * 0.25;
        const qr = rnd();
        if (Math.cos(phi) < -0.28) continue;
        const px = segR * 0.95 * Math.sin(phi) * Math.cos(theta);
        const py = segR * 1.18 * Math.cos(phi);
        const pz = segR * 1.18 * Math.sin(phi) * Math.sin(theta) - 0.048 * Hh;
        d.set(dx, -0.12 + dy, -0.92 + dz).normalize();
        q.setFromUnitVectors(AB, d);
        const l = Math.round((0.032 - i * 0.003 + qr * 0.03) / 0.004) * 0.004;
        if (l <= 0) continue;
        const w = 0.0216,
            wt = 0.0078;
        const ecken = [
            [-w, 0, 0],
            [w, 0, 0],
            [wt, -l, 0],
            [-wt, -l, 0],
            [0, 0, -w],
            [0, 0, w],
            [0, -l, wt],
            [0, -l, -wt],
        ];
        const b = sN * 8;
        for (const e of ecken) {
            v.set(e[0], e[1], e[2]).applyQuaternion(q);
            pos.push(v.x + px, v.y + py, v.z + pz);
        }
        idx.push(b, b + 1, b + 2, b, b + 2, b + 3, b + 4, b + 5, b + 6, b + 4, b + 6, b + 7);
        sN++;
    }
    if (!sN) return null;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setIndex(idx);
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
        } else {
            const kl = TK[k] || TK.dunkel || { c: 0x111111, r: 0.5 };
            c = kl.c;
            r = kl.r != null ? kl.r : 0.5;
            if (kl.emissiv != null) {
                em = kl.emissiv;
                emI = kl.emissivIntensitaet != null ? kl.emissivIntensitaet : 0.85;
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
        matCache[k] = m;
        return m;
    };
    const F = {
        gruppe: () => new THREE.Group(),
        kugel: (r, k, sc) => {
            const m = new THREE.Mesh(new THREE.SphereGeometry(r, segW, segH), matFuer(k));
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
        fellSchweif: fein
            ? () => {}
            : (segG, segR, i) => {
                  const geo = __tierStraehnenGeo(segR, i, P.size);
                  if (geo) segG.add(new THREE.Mesh(geo, matFuer("straehne")));
              },
    };
    const B = kern.bauTier(F, dials);
    // DIE FELL-STREU (V18.460): das Look-Gesetz als Zeilen (kern.fellStreu) —
    // deterministisch gestreut, Farbverlauf als Vertex-Daten, in die Teil-Wirte
    // (der Gelenk-Guss merged sie je Wirt×Klasse; lod1/fern bleibt kahl-billig).
    if (!fein && typeof kern.fellStreu === "function") {
        try {
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
            const rows = kern.fellStreu(P, B.masse, T) || [];
            let seed = 4242;
            const streue = (row, ton) => {
                const node = B.teile[row.teil];
                seed++;
                if (!node) return;
                const geo = __streuGeo(row, seed, toene[ton] || toene.B);
                if (!geo) return;
                const klass = ton === "D" ? "straehneD" : ton === "L" ? "straehneL" : "straehne";
                node.add(new THREE.Mesh(geo, matFuer(klass)));
            };
            const H2 = (B.masse && B.masse.H) || 2.4;
            const bX2 = (B.masse && B.masse.bX) || 1;
            for (const row of rows) {
                if (row.art === "deck") {
                    // Der Pipe-Deck: die Gesetz-Dichten über die Rumpf-Teil-Ellipsoide
                    // (die Wirte-Liste der Zeile trägt die Verteilung).
                    for (const [wirt, anteil] of row.wirte || []) {
                        const t3 = T[wirt];
                        if (!t3) continue;
                        const basis = {
                            teil: "wolf",
                            c: t3,
                            r: 0.3 * H2 * Math.sqrt(anteil * 3),
                            sc: [bX2, 0.95, 1.15],
                            d: row.d,
                        };
                        streue(
                            Object.assign({ n: Math.round(row.uDens * anteil), l: row.underL, t: 0.008 }, basis),
                            "D"
                        );
                        streue(
                            Object.assign({ n: Math.round(row.gDens * anteil), l: row.guardL, t: 0.006 }, basis),
                            "B"
                        );
                        streue(
                            Object.assign({ n: Math.round(row.gDens * anteil * row.hellQuote) }, basis, {
                                l: 0.06,
                                t: 0.008,
                            }),
                            "L"
                        );
                    }
                    continue;
                }
                streue(row, row.ton);
            }
        } catch (_eF) {
            /* Streu optional — der Baum bleibt heil */
        }
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
    return __bakeGelenkBaum(root, "wolf", nodeName, fein, {
        art: presetId,
        tailSegs: tailNamen,
        masse: B.masse || null,
        base: typeof P.cB === "number" ? P.cB : null,
    });
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
        if (!node.isMesh || !node.geometry) return;
        const a = fein ? root : animAhn(node);
        const jName = nodeName.get(a) || rootName;
        const klasse = (node.material && node.material.userData && node.material.userData.__klasse) || "fell";
        const key = jName + "|" + klasse;
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
    const skinCol = ov && typeof ov.skinColor === "number" ? ov.skinColor : 0xc89372;
    const hairCol = ov && typeof ov.hairColor === "number" ? ov.hairColor : 0x241712;
    const MK = kern.MATERIAL_KLASSEN || {};
    const KL = Object.assign({}, MK, { skin: { c: skinCol, r: 0.62 }, hair: { c: hairCol, r: 0.85 } });
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
        const lc = lin(kl.c != null ? kl.c : 0xc89372);
        m.color.setRGB(lc[0], lc[1], lc[2]);
        if (k === "hair") m.side = THREE.DoubleSide; // Strähnen-Kreuzquads (wie straehne)
        if (kl.emissiv != null && m.emissive) {
            const le = lin(kl.emissiv);
            m.emissive.setRGB(le[0], le[1], le[2]);
            m.emissiveIntensity = kl.emissivIntensitaet != null ? kl.emissivIntensitaet : 0.85;
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
    // DIE KLEID-HÜLLEN (V18.461): kern.kleidZonen sagt, WELCHE Teile welcher
    // Schnitt hüllt — der Bäcker klont jedes Wirt-Mesh als Stoff-Hülle um den
    // eigenen Ursprung (Lab-Prinzip „Kleidung wird AUS der Haut extrudiert");
    // nennt die Zone eine GRUPPE (ankle: der Fuß ist im Baum anonym), hüllt er
    // alle Meshes darunter. Der Gelenk-Guss merged je (Gelenk × Stoff-Farbe).
    if (typeof kern.kleidZonen === "function") {
        const huelle = (teil, m, infl) => {
            const h = new THREE.Mesh(teil.geometry, m);
            h.position.copy(teil.position);
            h.quaternion.copy(teil.quaternion);
            h.scale.copy(teil.scale).multiplyScalar(infl);
            teil.parent.add(h);
        };
        for (const z of kern.kleidZonen(dials) || []) {
            const km = "stoff_" + (z.hex >>> 0).toString(16);
            KL[km] = { c: z.hex, r: 0.82 };
            const m = matFuer(km);
            const infl = z.inflate || 1.06;
            for (const tn of z.teile || []) {
                const teil = B.parts[tn];
                if (!teil) continue;
                if (teil.isMesh) {
                    huelle(teil, m, infl);
                    continue;
                }
                const kinder = [];
                teil.traverse((n) => {
                    if (n.isMesh && n.geometry) kinder.push(n);
                });
                for (const k of kinder) huelle(k, m, infl);
            }
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
    ];
    const nodeName = new Map();
    nodeName.set(B.character, "mensch");
    for (const n of namen) if (B.parts[n]) nodeName.set(B.parts[n], n);
    return __bakeGelenkBaum(B.character, "mensch", nodeName, fein, {
        art: presetId,
        base: skinCol,
    });
}

// Der Tisch (M8: Tabelle vor if) — die Shell-Dispatch UND der Stamm-Kaltpfad
// schlagen hier nach; neue MESHFREI-Gattungen registrieren eine Zeile.
var BAKERS_BY_KIND = { kreatur: bakeTierInstance, koerper: bakeMenschInstance };
