// platz.js — WEGWERF-SPIKE (w28-samen-lichtweg): EIN Dorf-Platz, 14 Laternen (fachwerk LICHT_GESETZ.laterne), vier Lichtwege:
//   heute   der Licht-Pool im Leuchten JEDES Stoffs, 4 Plätze (die Rechnung von `_lichtPoolTerm` · `_lichtPlatz` ·
//           `_punktLichtBrdf` · `_jePlatz` aus stamm/stoff-material.js, hier abgeschrieben — ohne Wurf, ohne Himmels-Ersatz)
//   pool16  dieselbe Rechnung, 16 Plätze (die naheliegende Gegenprobe)
//   pass    der Kandidat: kein Pool im Stoff; der Szenen-Pass schreibt zwei Ziele mehr (Normale + Metall, Albedo + Rauheit),
//           EIN Licht-Programm rechnet 16 Quellen einmal je Pixel (dasselbe Punktlicht-Gesetz) und addiert vor der Tonkurve
//   voll    die Decke: ALLES Licht einmal je Bild (Sonne + Schatten + Umgebung + Quellen), die Stoffe schreiben nur den G-Puffer
// Die Wahl der Quellen ist `_leuchtTakt`/`_leuchtQuellen` (Rang: im Bild zuerst, dann Abstand zur Reichweiten-Kugel, Umkreis 48 m).
// URL: ?fall=heute|pool16|pass|voll&uhr=nacht|mittag[&plaetze=n]
import * as THREE from "three/webgpu";
import * as T from "three/tsl";

const Q = new URLSearchParams(location.search);
const FALL = Q.get("fall") || "heute";
const UHR = Q.get("uhr") || "nacht";
const NACHT = UHR === "nacht";
const PLAETZE = Number(Q.get("plaetze")) || (FALL === "heute" ? 4 : 16);
const [W, H] = [960, 540];

// fachwerk LICHT_GESETZ.laterne (fachwerk-core.js:5350) und lichtFarbe(kelvin) (Planck-Ort, linear) — abgeschrieben
const LATERNE = { kelvin: 1900, staerke: 19, reichweiteM: 12, abfall: 2, kernM: 0.1, hoeheM: 3.6 };
const KELVIN = { 1900: [1, 0.2317, 0], 2800: [1, 0.4382, 0.1173] };
const LEGACY_LICHT = Math.PI; // welt-licht.js:53
const UMKREIS_M = 48; // LICHT_POOL.umkreisM (stoff-material.js:3754)

// ───────────────────────── die Messung: Module, Text, Knoten-Bau ─────────────────────────
const M = (window.__platz = { fall: FALL, uhr: UHR, plaetze: PLAETZE, mod: [], bau: [] });
{
    const P = GPUDevice.prototype;
    const roh = P.createShaderModule;
    P.createShaderModule = function (d) {
        const code = d.code || "";
        M.mod.push({ art: /@compute/.test(code) ? "compute" : /@fragment/.test(code) ? "fragment" : "vertex", n: code.length, code });
        return roh.call(this, d);
    };
}

const renderer = new THREE.WebGPURenderer({ antialias: false });
renderer.setSize(W, H);
renderer.setPixelRatio(1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = NACHT ? 1.6 : 0.9;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
document.body.appendChild(renderer.domElement);
await renderer.init();
{
    const N = renderer._nodes;
    const [cb, cs] = [N._createNodeBuilder, N._createNodeBuilderState];
    N._createNodeBuilder = function (...a) {
        const b = cb.apply(this, a);
        b.__t0 = performance.now();
        return b;
    };
    N._createNodeBuilderState = function (b) {
        M.bau.push({ ms: performance.now() - (b.__t0 || performance.now()), knoten: b.nodes ? b.nodes.length : -1, stoff: (b.material && (b.material.name || b.material.type)) || "?", fs: (b.fragmentShader || "").length });
        return cs.call(this, b);
    };
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(62, W / H, 0.1, 400);
// pose=auge: das Auge am Platz, 2,8 m neben einer Laterne (der Befund der Nacht); pose=oben: der Blick vom Dach über den
// ganzen Platz und beide Gassen (alle 14 Laternen im Bild)
const POSE = Q.get("pose") || "auge";
if (POSE === "oben") {
    camera.position.set(-18, 14, 26);
    camera.lookAt(10, 0, -8);
} else {
    camera.position.set(-7.2, 1.7, 11.2);
    camera.lookAt(2.5, 1.6, -16);
}
camera.updateMatrixWorld();

// ───────────────────────── Himmel, Sonne/Mond ─────────────────────────
const sonnenRichtung = (NACHT ? new THREE.Vector3(-0.35, 0.7, 0.45) : new THREE.Vector3(0.38, 0.72, -0.58)).normalize();
const sonnenFarbe = NACHT ? new THREE.Color(0.55, 0.65, 1.0).multiplyScalar(0.07) : new THREE.Color(1.0, 0.96, 0.9).multiplyScalar(3.4);
const himmelFarbe = NACHT ? new THREE.Color(0.012, 0.018, 0.035) : new THREE.Color(0.42, 0.6, 0.95).multiplyScalar(0.85);
const sonne = new THREE.DirectionalLight(sonnenFarbe.clone(), 1);
sonne.color.copy(sonnenFarbe);
sonne.position.copy(sonnenRichtung).multiplyScalar(80);
sonne.castShadow = true;
sonne.shadow.mapSize.set(2048, 2048);
Object.assign(sonne.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 1, far: 200 });
sonne.shadow.bias = -0.0015;
sonne.shadow.normalBias = 0.05;
scene.add(sonne);
scene.backgroundNode = T.color(himmelFarbe.clone().multiplyScalar(NACHT ? 0.6 : 1.1));
const VOLL = FALL === "voll";
if (!VOLL) scene.environmentNode = T.color(himmelFarbe);

// ───────────────────────── der Licht-Pool (abgeschrieben aus stamm/stoff-material.js:2414–2500) ─────────────────────────
const pool = {
    lage: Array.from({ length: PLAETZE }, () => T.uniform(new THREE.Vector4(0, 0, 0, 0))),
    farbe: Array.from({ length: PLAETZE }, () => T.uniform(new THREE.Vector4(0, 0, 0, 0))),
    kern: Array.from({ length: PLAETZE }, () => T.uniform(0)),
};
const jePlatz = (reihe, k) => {
    let w = reihe[reihe.length - 1];
    for (let j = reihe.length - 2; j >= 0; j--) w = T.select(k.equal(j), reihe[j], w);
    return w;
};
// die EINE BRDF eines Punktlichts (`_punktLichtBrdf`): Lambert + GGX, die Stoff-Werte als Knoten gereicht
const punktLichtBrdf = (S, N, L, V, nl) => {
    const a = S.rau.pow2();
    const f0 = T.mix(S.f0, S.alb, S.met);
    const Hh = L.add(V).normalize();
    const vh = V.dot(Hh).clamp();
    const nv = N.dot(V).clamp();
    const nh = N.dot(Hh).clamp();
    const fres = T.exp2(vh.mul(-5.55473).sub(6.98316).mul(vh));
    const F = f0.mul(fres.oneMinus()).add(S.f90.mul(fres));
    const glanz = F.mul(T.V_GGX_SmithCorrelated({ alpha: a, dotNL: nl, dotNV: nv })).mul(T.D_GGX({ alpha: a, dotNH: nh }));
    return S.alb
        .mul(S.met.oneMinus())
        .mul(1 / Math.PI)
        .add(glanz);
};
// das Gesetz EINES Platzes (`_lichtPlatz`): N, P im Blick-Raum, `ansicht` die Blick-Matrix der Szenen-Kamera
const lichtPlatz = (S, N, P, ansicht, platz) => {
    const { lage, farbe, kern } = platz;
    const Lv = ansicht.mul(T.vec4(lage.xyz, 1)).xyz.sub(P);
    const d = Lv.length();
    const bedingung = lage.w.greaterThan(0).and(d.lessThan(lage.w)).and(N.dot(Lv).greaterThan(0));
    const L = Lv.div(d);
    const nl = N.dot(L).clamp();
    const q = d.div(lage.w).pow2();
    const abst = q
        .pow2()
        .oneMinus()
        .clamp()
        .pow2()
        .mul(d.mul(d).add(kern).pow(farbe.a.mul(-0.5)));
    const beitrag = farbe.rgb.mul(nl.mul(abst)).mul(punktLichtBrdf(S, N, L, P.negate().normalize(), nl));
    return T.select(bedingung, beitrag, T.vec3(0));
};
// der Pool im Stoff (`_lichtPoolTerm`): EIN Knoten für jeden Stoff
const STOFF_IM_STOFF = { alb: T.diffuseColor.rgb, met: T.metalness, rau: T.roughness, f0: T.specularColor, f90: T.specularF90 };
const poolTerm = T.Fn(() => {
    T.normalView.toVar();
    T.positionView.toVar();
    const summe = T.vec3(0).toVar();
    T.Loop(PLAETZE, ({ i: k }) => {
        const platz = { lage: jePlatz(pool.lage, k), farbe: jePlatz(pool.farbe, k), kern: jePlatz(pool.kern, k) };
        summe.addAssign(lichtPlatz(STOFF_IM_STOFF, T.normalView, T.positionView, T.cameraViewMatrix, platz));
    });
    return summe;
})();
const IM_STOFF = FALL === "heute" || FALL === "pool16";

// ───────────────────────── die Stoffe ─────────────────────────
const sonneImBlick = T.uniform(new THREE.Vector3());
const stoffe = [];
// `leucht` ein Knoten (vec3) oder null; `quelle`: die Glut selbst liest den Pool nicht (wie `_leuchtStoff`)
function stoff(name, { farbe, rau = 0.85, met = 0, leucht = null, quelle = false, durch = null, beidseitig = false, ausschnitt = null, laub = false }) {
    // die Decke `voll`: der Stoff schreibt nur den G-Puffer (unbeleuchtet), alles Licht rechnet der EINE Pass
    const m = new THREE.MeshStandardNodeMaterial();
    const nurG = VOLL && durch == null; // schreibt nur den G-Puffer: kein Licht im Stoff (`lights` aus), der Ausgang ist sein Leuchten
    if (nurG) m.lights = false;
    m.name = name;
    const col = farbe.isNode ? farbe : T.color(new THREE.Color(...farbe));
    m.colorNode = ausschnitt ? T.vec4(col, ausschnitt) : col;
    if (ausschnitt) m.alphaTest = 0.5;
    if (beidseitig) m.side = THREE.DoubleSide;
    if (durch != null) {
        m.transparent = true;
        m.opacityNode = T.float(durch);
        m.depthWrite = false;
    }
    m.userData = { rau, met, laub, quelle, leuchtBasis: leucht };
    m.roughnessNode = T.float(rau);
    m.metalnessNode = T.float(met);
    if (!nurG) {
        let em = leucht || T.vec3(0);
        // DAS DURCHSCHEINENDE LAUB: die Sonne von hinten durch das Blatt (ein Vorwärts-Term des Stoffs)
        if (laub) em = em.add(T.color(sonnenFarbe).mul(col).mul(0.55).mul(T.normalView.negate().dot(sonneImBlick).clamp()));
        // der Pool: heute/pool16 in JEDEM beleuchteten Stoff; im Kandidaten nur noch in den durchsichtigen (die schreiben keinen G-Puffer)
        if (!quelle && IM_STOFF) em = em.add(poolTerm);
        m.emissiveNode = em;
    } else m.outputNode = T.vec4(leucht || T.vec3(0), 1); // `voll`: der Ausgang trägt nur die Glut, der Pass addiert alles Licht
    stoffe.push(m);
    return m;
}
const hash2 = (p) => T.fract(T.sin(p.dot(T.vec2(127.1, 311.7))).mul(43758.5453));
const pflaster = (() => {
    const z = T.positionWorld.xz.mul(3.2);
    const h = hash2(z.floor());
    const fuge = T.smoothstep(0.0, 0.06, T.min(T.fract(z).x, T.fract(z).y));
    return T.mix(T.vec3(0.05, 0.045, 0.04), T.mix(T.vec3(0.16, 0.15, 0.14), T.vec3(0.3, 0.27, 0.24), h), fuge);
})();
const S = {
    boden: stoff("pflaster", { farbe: pflaster, rau: 0.8 }),
    putz: stoff("putz", { farbe: [0.72, 0.66, 0.54], rau: 0.92 }),
    balken: stoff("balken", { farbe: [0.1, 0.065, 0.04], rau: 0.75 }),
    dach: stoff("dach", { farbe: [0.33, 0.1, 0.06], rau: 0.7 }),
    eisen: stoff("eisen", { farbe: [0.03, 0.03, 0.035], rau: 0.55 }),
    stein: stoff("stein", { farbe: [0.42, 0.41, 0.39], rau: 0.9 }),
    rinde: stoff("rinde", { farbe: [0.13, 0.09, 0.06], rau: 0.95 }),
    laub: stoff("laub", {
        farbe: [0.09, 0.26, 0.05],
        rau: 0.6,
        beidseitig: true,
        laub: true,
        ausschnitt: T.step(T.uv().sub(0.5).mul(T.vec2(1.0, 1.9)).length(), 0.46),
    }),
    laternenglas: stoff("laternenglas", { farbe: [0.9, 0.8, 0.6], rau: 0.4, quelle: true, leucht: NACHT ? T.color(new THREE.Color(...KELVIN[1900])).mul(9) : null }),
    fenster: stoff("fensterglas", { farbe: [0.5, 0.6, 0.62], rau: 0.06, durch: 0.42, leucht: NACHT ? T.color(new THREE.Color(...KELVIN[2800])).mul(0.85 * 0.5) : null }),
    scheibe: stoff("scheibe", { farbe: [0.55, 0.65, 0.66], rau: 0.05, durch: 0.42 }),
    wasser: stoff("wasser", { farbe: [0.03, 0.09, 0.1], rau: 0.04, durch: 0.72 }),
};
// das Wasser trägt Wellen in der Normale (der Glanz der Laternen bricht an ihnen)
{
    const p = T.positionWorld.xz;
    const w = T.vec3(T.sin(p.x.mul(5.0).add(p.y.mul(2.0))).mul(0.05), 1, T.sin(p.y.mul(6.0).sub(p.x.mul(1.5))).mul(0.05)).normalize();
    S.wasser.normalNode = T.cameraViewMatrix.transformDirection(w);
}

// ───────────────────────── die Szene: Platz, Häuser, Laternen, Baum, Teich, Schaukasten ─────────────────────────
const rng = (() => {
    let s = 0x2f6e2b1;
    return () => ((s = Math.imul(s ^ (s >>> 15), 0x2c1b3c6d) + 0x9e3779b9) >>> 0) / 4294967296;
})();
const netz = (geo, mat, x, y, z, { wurf = true, ry = 0 } = {}) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.y = ry;
    m.castShadow = wurf && !mat.transparent;
    m.receiveShadow = true;
    scene.add(m);
    return m;
};
const boden = netz(new THREE.PlaneGeometry(260, 260).rotateX(-Math.PI / 2), S.boden, 0, 0, 0, { wurf: false });
function haus(x, z, b, t, h, ry) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    scene.add(g);
    const teil = (geo, mat, px, py, pz, wurf = true) => {
        const m = new THREE.Mesh(geo, mat);
        m.position.set(px, py, pz);
        m.castShadow = wurf && !mat.transparent;
        m.receiveShadow = true;
        g.add(m);
    };
    teil(new THREE.BoxGeometry(b, h, t), S.putz, 0, h / 2, 0);
    // das Dach: ein Prisma über der Breite
    const d = new THREE.BufferGeometry();
    const [hb, ht, fh] = [b / 2 + 0.4, t / 2 + 0.4, 3.2];
    const v = [-hb, 0, ht, hb, 0, ht, 0, fh, ht, -hb, 0, -ht, hb, 0, -ht, 0, fh, -ht];
    d.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    d.setIndex([0, 1, 2, 4, 3, 5, 1, 4, 5, 1, 5, 2, 3, 0, 2, 3, 2, 5, 0, 3, 4, 0, 4, 1]);
    const dn = d.toNonIndexed();
    dn.computeVertexNormals();
    teil(dn, S.dach, 0, h, 0);
    // Fachwerk an der Front (+z des Hauses) und Fenster: Glas 5 cm vor der Wand
    for (let i = 0; i <= 4; i++) teil(new THREE.BoxGeometry(0.18, h, 0.08), S.balken, -b / 2 + (b * i) / 4, h / 2, t / 2 + 0.04, false);
    for (const y of [0.09, h / 2, h - 0.09]) teil(new THREE.BoxGeometry(b, 0.18, 0.08), S.balken, 0, y, t / 2 + 0.04, false);
    for (let i = 0; i < 4; i++)
        for (const y of [h * 0.27, h * 0.75]) teil(new THREE.PlaneGeometry(1.1, 1.3), S.fenster, -b / 2 + (b * (i + 0.5)) / 4, y, t / 2 + 0.05, false);
}
haus(-10.5, -23, 13, 8, 6.5, 0);
haus(10.5, -23, 13, 8, 6.5, 0);
haus(24, -11.5, 13, 8, 6.5, -Math.PI / 2);
haus(24, 11.5, 13, 8, 6.5, -Math.PI / 2);
haus(-23, -7, 13, 8, 6.5, Math.PI / 2);
haus(-23, 9, 13, 8, 6.5, Math.PI / 2);
haus(-4, 24, 13, 8, 6.5, Math.PI);
haus(11, 24, 13, 8, 6.5, Math.PI);
// die 14 Laternen: 8 am Rand des Platzes (r 13), je 3 an der Nord- und der Ost-Gasse (Abstand 9 m, wie das Fachwerk-Soll)
const LATERNEN = [];
for (let k = 0; k < 8; k++) LATERNEN.push([Math.round(Math.cos((k * Math.PI) / 4) * 130) / 10, Math.round(Math.sin((k * Math.PI) / 4) * 130) / 10]);
LATERNEN.push([3.2, -22], [-3.2, -31], [3.2, -40], [22, 3.2], [31, -3.2], [40, 3.2]);
{
    const mast = new THREE.CylinderGeometry(0.06, 0.08, 3.4, 8);
    const kopf = new THREE.BoxGeometry(0.26, 0.4, 0.26);
    const haube = new THREE.ConeGeometry(0.26, 0.16, 4);
    for (const [x, z] of LATERNEN) {
        netz(mast, S.eisen, x, 1.7, z);
        netz(kopf, S.laternenglas, x, LATERNE.hoeheM, z, { wurf: false });
        netz(haube, S.eisen, x, LATERNE.hoeheM + 0.28, z, { wurf: false, ry: Math.PI / 4 });
    }
}
// der Brunnen-Rand und der Teich (Wasser 3 cm über dem Pflaster)
netz(new THREE.TorusGeometry(3.6, 0.22, 8, 40).rotateX(Math.PI / 2), S.stein, 2, 0.12, 2.5);
netz(new THREE.CircleGeometry(3.5, 40).rotateX(-Math.PI / 2), S.wasser, 2, 0.1, 2.5, { wurf: false });
// der Schaukasten am linken Bildrand: eine Putz-Wand (5 m, um 30° zum Auge gedreht) 6 m neben der nächsten Laterne; vor ihrer
// rechten Hälfte steht 1,0 m davor eine Glas-Scheibe (das Licht der Wand HINTER Glas), die linke bleibt frei (der Vergleich)
netz(new THREE.BoxGeometry(5, 2.6, 0.3), S.putz, -10.4, 1.3, 3.3, { ry: Math.PI / 6 });
netz(new THREE.PlaneGeometry(2.2, 1.9), S.scheibe, -8.77, 1.25, 3.52, { wurf: false, ry: Math.PI / 6 });
// der Baum im Gegenlicht: Stamm + 150 Blatt-Karten (EINE Instanz-Senke, ausgeschnittenes Alpha)
{
    const [bx, bz] = [1.5, -7.5];
    netz(new THREE.CylinderGeometry(0.22, 0.32, 4.4, 10), S.rinde, bx, 2.2, bz);
    const n = 150;
    const inst = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.25, 0.75), S.laub, n);
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
        const [u, v, r] = [rng() * 6.283, Math.acos(2 * rng() - 1), 2.7 * Math.cbrt(rng())];
        o.position.set(bx + r * Math.sin(v) * Math.cos(u), 5.4 + r * Math.cos(v) * 0.8, bz + r * Math.sin(v) * Math.sin(u));
        o.rotation.set(rng() * 3.1, rng() * 6.3, rng() * 3.1);
        o.updateMatrix();
        inst.setMatrixAt(i, o.matrix);
    }
    inst.castShadow = true;
    inst.receiveShadow = true;
    scene.add(inst);
}

// ───────────────────────── die Quellen und ihre Wahl (`_leuchtQuellen` + `_leuchtTakt`, ohne Blende) ─────────────────────────
const QUELLEN = LATERNEN.map(([x, z], id) => ({ id, x, y: LATERNE.hoeheM, z, L: LATERNE }));
function wahl(n) {
    const F = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse), camera.coordinateSystem);
    const kugel = new THREE.Sphere();
    const cp = camera.position;
    const out = [];
    for (const q of QUELLEN) {
        const d = Math.hypot(q.x - cp.x, q.y - cp.y, q.z - cp.z);
        if (d > UMKREIS_M + q.L.reichweiteM || (q.x - cp.x) ** 2 + (q.z - cp.z) ** 2 > UMKREIS_M ** 2) continue;
        const imBild = F.intersectsSphere(kugel.set(kugel.center.set(q.x, q.y, q.z), q.L.reichweiteM));
        out.push({ ...q, d, rang: (imBild ? 0 : 1e9) + Math.max(0, d - q.L.reichweiteM) * 1e3 + d });
    }
    out.sort((a, b) => a.rang - b.rang);
    return out.slice(0, n);
}
// EIN Schreiber der Plätze (`_leuchtTakt`): Lage + Reichweite, Farbe × Stärke + Abfall, Kern²
const passPlaetze = { lage: Array.from({ length: 16 }, () => new THREE.Vector4()), farbe: Array.from({ length: 16 }, () => new THREE.Vector4()), kern: Array.from({ length: 16 }, () => new THREE.Vector4()) };
let gewaehlt = [];
function leuchtTakt(staerke = 1) {
    const n = IM_STOFF ? PLAETZE : 16;
    gewaehlt = NACHT ? wahl(n) : []; // der Zeitplan der Laterne: mittag 0 (fachwerk LICHT_GESETZ.laterne.zeit)
    for (let k = 0; k < n; k++) {
        const q = gewaehlt[k];
        const lage = IM_STOFF ? pool.lage[k].value : passPlaetze.lage[k];
        const farbe = IM_STOFF ? pool.farbe[k].value : passPlaetze.farbe[k];
        if (!q) {
            lage.set(0, 0, 0, 0);
            farbe.set(0, 0, 0, 0);
            continue;
        }
        const k2 = q.L.kernM * q.L.kernM;
        const In = LEGACY_LICHT * q.L.staerke * staerke * Math.pow(1 + k2, q.L.abfall / 2);
        const c = KELVIN[q.L.kelvin];
        lage.set(q.x, q.y, q.z, q.L.reichweiteM);
        farbe.set(c[0] * In, c[1] * In, c[2] * In, q.L.abfall);
        if (IM_STOFF) pool.kern[k].value = k2;
        else passPlaetze.kern[k].set(k2, 0, 0, 0);
    }
}

// ───────────────────────── die Kette: Szenen-Pass → (Licht-Pass) → Tonkurve ─────────────────────────
const kette = new THREE.RenderPipeline(renderer);
const szene = T.pass(scene, camera);
let ausgabe = szene.getTextureNode("output");
if (FALL === "pass" || VOLL) {
    // DER G-PUFFER: zwei Ziele mehr an JEDEM Programm des Szenen-Passes. Durchsichtiges (diffuseColor.a < 1) schreibt Albedo 0:
    // r184 mischt nur `output`, jedes weitere Ziel überschreibt — eine Scheibe löscht so das Licht der Wand hinter ihr.
    // glas=misch (der Kandidat): beide G-Ziele mischen wie der Stoff (r184 `MRTNode.setBlendMode`, MaterialBlending — ein
    // dichter Stoff mischt nicht, sein Alpha trägt Rauheit bzw. Metall; ein durchsichtiger schreibt Alpha 0 und lässt stehen,
    // was hinter ihm liegt): die Wand hinter Glas behält ihr Licht, die Scheibe selbst bekommt keins.
    // glas=loch (der naive Aufbau): ohne Mischung, das Durchsichtige schreibt Albedo 0.
    const dicht = T.step(0.999, T.diffuseColor.a);
    const MISCH = (Q.get("glas") || "misch") === "misch";
    const ziele = {
        output: T.output,
        gNormal: T.vec4(T.directionToColor(T.normalView), MISCH ? T.metalness.mul(dicht) : T.metalness),
        gAlbedo: T.vec4(T.diffuseColor.rgb.mul(dicht), MISCH ? T.roughness.max(0.04).mul(dicht) : T.roughness),
    };
    const mrt = T.mrt(ziele);
    if (MISCH) for (const n of ["gNormal", "gAlbedo"]) mrt.setBlendMode(n, new THREE.BlendMode(THREE.MaterialBlending));
    szene.setMRT(mrt);
    for (const n of ["gNormal", "gAlbedo"]) szene.getTexture(n).type = THREE.UnsignedByteType;
    const tiefe = szene.getTextureNode("depth");
    const gN = szene.getTextureNode("gNormal");
    const gA = szene.getTextureNode("gAlbedo");
    const projInv = T.uniform(camera.projectionMatrixInverse);
    const ansicht = T.uniform(camera.matrixWorldInverse);
    const weltAusBlick = T.uniform(camera.matrixWorld);
    const uLage = T.uniformArray(passPlaetze.lage, "vec4");
    const uFarbe = T.uniformArray(passPlaetze.farbe, "vec4");
    const uKern = T.uniformArray(passPlaetze.kern, "vec4");
    // die Sonne des `voll`-Passes: Richtung im Blick, Farbe, die Karte ihres Schattens (r184 rechnet sie für jeden Werfer)
    const schattenM = T.uniform(sonne.shadow.matrix);
    const lichtBau = () => T.Fn(() => {
        const z = tiefe.r.toVar();
        const P = T.getViewPosition(T.screenUV, z, projInv).toVar();
        const N = T.colorToDirection(gN.rgb).normalize().toVar();
        const St = { alb: gA.rgb.toVar(), met: gN.a.toVar(), rau: gA.a.max(0.04).toVar(), f0: T.vec3(0.04), f90: T.float(1) };
        const summe = T.vec3(0).toVar();
        T.Loop(16, ({ i }) => {
            const platz = { lage: uLage.element(i), farbe: uFarbe.element(i), kern: uKern.element(i).x };
            summe.addAssign(lichtPlatz(St, N, P, ansicht, platz));
        });
        if (VOLL) {
            // ALLES Licht im Pass: die Sonne (Lambert + GGX, dieselbe BRDF) × Schatten (EIN Vergleich an der Karte) + die Umgebung
            const V = P.negate().normalize();
            const nl = N.dot(sonneImBlick).clamp();
            const welt = weltAusBlick.mul(T.vec4(P, 1));
            const sc = schattenM.mul(T.vec4(welt.xyz.add(weltAusBlick.transformDirection(N).mul(0.08)), 1));
            const karte = sonne.shadow.map ? T.texture(sonne.shadow.map.depthTexture) : null;
            const uvS = T.vec2(sc.x, sc.y.oneMinus());
            const frei = karte ? karte.sample(uvS).compare(sc.z.sub(0.0015)) : T.float(1);
            summe.addAssign(T.color(sonnenFarbe).mul(nl).mul(frei).mul(punktLichtBrdf(St, N, sonneImBlick, V, nl)));
            summe.addAssign(T.color(himmelFarbe).mul(St.alb).mul(St.met.oneMinus()));
        }
        // der Himmel (Tiefe am Fern-Rand) trägt kein Licht
        return T.select(z.greaterThanEqual(1.0), T.vec3(0), summe);
    })();
    const farbe = ausgabe;
    ausgabe = farbe.add(T.vec4(lichtBau(), 0));
    // `voll`: die Schatten-Karte der Sonne entsteht mit dem ersten Bild (r184) — danach baut der Pass EINMAL neu mit ihr
    // (das erste Licht-Programm ist Wegwerf und zählt nicht: `M.wegwerf`)
    if (VOLL)
        M.nachErstemBild = () => {
            if (!sonne.shadow.map) throw new Error("voll: die Schatten-Karte der Sonne fehlt nach dem ersten Bild");
            kette.outputNode = farbe.add(T.vec4(lichtBau(), 0));
            kette.needsUpdate = true;
            M.wegwerf = 1;
        };
}
kette.outputNode = ausgabe;

// ───────────────────────── Bild, Maß, Aufnahme ─────────────────────────
const c2 = document.createElement("canvas");
[c2.width, c2.height] = [W, H];
const ctx = c2.getContext("2d", { willReadFrequently: true });
// das Bild aus dem AUSGABE-Pfad (Kette samt Tonkurve) in ein 8-Bit-Ziel, zurückgelesen: das Canvas des headless-Browsers
// (swiftshader ohne Vulkan-Oberfläche) gibt kein Bild her
const ziel = new THREE.RenderTarget(W, H, { type: THREE.UnsignedByteType, depthBuffer: false });
async function bild(staerke = 1) {
    camera.updateMatrixWorld();
    sonneImBlick.value.copy(sonnenRichtung).transformDirection(camera.matrixWorldInverse);
    leuchtTakt(staerke);
    const t0 = performance.now();
    renderer.setRenderTarget(ziel);
    kette.render();
    renderer.setRenderTarget(null);
    await renderer.backend.device.queue.onSubmittedWorkDone();
    const ms = performance.now() - t0;
    const px = await renderer.readRenderTargetPixelsAsync(ziel, 0, 0, W, H);
    const u8 = new Uint8ClampedArray(px.buffer, px.byteOffset, W * H * 4).slice();
    for (let i = 3; i < u8.length; i += 4) u8[i] = 255;
    ctx.putImageData(new ImageData(u8, W, H), 0, 0);
    return ms;
}
const luma = (d, x, y) => {
    const i = (Math.round(y) * W + Math.round(x)) * 4;
    return 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
};
// WELCHE LATERNE BELEUCHTET FLÄCHEN: je Laterne acht Boden-Punkte im Ring 1,6 m um ihren Fuß, im Bild gelesen — gegen
// dasselbe Bild mit Quellen-Stärke 0 (die Köpfe glühen weiter). Beleuchtet = der Ring ist ≥ 30 Stufen (sRGB 8 Bit) heller
// (gemessen: 60–100 Stufen unter einer Laterne mit Platz, 0–2 unter einer ohne).
window.__messen = async () => {
    await bild(1); // der Erst-Bau der Programme
    if (M.nachErstemBild) {
        M.nachErstemBild();
        await bild(1);
    }
    await bild(0);
    const dunkel = ctx.getImageData(0, 0, W, H).data;
    const zeiten = [];
    for (let i = 0; i < 4; i++) zeiten.push(await bild(1));
    const hell = ctx.getImageData(0, 0, W, H).data;
    const v = new THREE.Vector3();
    const richtung = new THREE.Vector3();
    const strahl = new THREE.Raycaster();
    const laternen = QUELLEN.map((q) => {
        const kopf = v.set(q.x, q.y, q.z).project(camera);
        const kopfImBild = kopf.z < 1 && Math.abs(kopf.x) < 1 && Math.abs(kopf.y) < 1;
        let [n, dh] = [0, 0];
        for (let a = 0; a < 8; a++) {
            v.set(q.x + 1.6 * Math.cos((a * Math.PI) / 4), 0.02, q.z + 1.6 * Math.sin((a * Math.PI) / 4));
            // frei sichtbar: der erste Treffer des Sehstrahls ist der Boden an diesem Punkt (kein Haus, kein Glas, kein Blatt davor)
            const weit = v.distanceTo(camera.position);
            strahl.set(camera.position, richtung.copy(v).sub(camera.position).normalize());
            const treffer = strahl.intersectObjects(scene.children, true)[0];
            if (!treffer || treffer.object !== boden || Math.abs(treffer.distance - weit) > 0.3 + 0.03 * weit) continue;
            v.project(camera);
            if (!(v.z < 1 && Math.abs(v.x) < 0.98 && Math.abs(v.y) < 0.98)) continue;
            const [x, y] = [(v.x * 0.5 + 0.5) * (W - 1), (0.5 - v.y * 0.5) * (H - 1)];
            n++;
            dh += luma(hell, x, y) - luma(dunkel, x, y);
        }
        return { id: q.id, x: q.x, z: q.z, abstand: Math.hypot(q.x - camera.position.x, q.z - camera.position.z), kopfImBild, ringPunkte: n, heller: n ? dh / n : null, platz: gewaehlt.some((g) => g.id === q.id) };
    });
    const imBild = laternen.filter((l) => l.kopfImBild || l.ringPunkte > 0);
    const frag = M.mod.filter((m) => m.art === "fragment");
    return {
        fall: FALL,
        uhr: UHR,
        pose: POSE,
        plaetze: IM_STOFF ? PLAETZE : 16,
        wegwerf: M.wegwerf || 0,
        glas: Q.get("glas") || "misch",
        programme: { fragment: frag.length - (M.wegwerf || 0), vertex: M.mod.filter((m) => m.art === "vertex").length },
        textBytes: { fragment: frag.reduce((a, m) => a + m.n, 0), vertex: M.mod.filter((m) => m.art === "vertex").reduce((a, m) => a + m.n, 0) },
        groesstesFragment: Math.max(...frag.map((m) => m.n)),
        knotenBau: { n: M.bau.length, ms: M.bau.reduce((a, b) => a + b.ms, 0), knoten: M.bau.reduce((a, b) => a + b.knoten, 0) },
        bau: M.bau,
        quellenMitPlatz: gewaehlt.length,
        laternenImBild: imBild.length,
        laternenMitRing: laternen.filter((l) => l.ringPunkte > 0).length,
        beleuchtend: laternen.filter((l) => l.ringPunkte > 0 && l.heller >= 30).length,
        laternen,
        bildMsSwiftshader: zeiten.slice(1),
        png: c2.toDataURL("image/png"),
    };
};
window.__bereit = true;
