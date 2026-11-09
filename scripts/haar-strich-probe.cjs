// haar-strich-probe.cjs — AUF ZEIT (w26-haar-arm, fällt vor der Abgabe): die Szene der Station haar.K2#1 auf der echten Karte über die
// GPU-Probe — eigene Werkbank an der Mess-Wiese, Third, 1920 × 1080, die Pose gehalten (`__halten` leib + haar, die Anzeige-Uhr auf 0),
// je Schuss das Maß strich der Klasse spieler:kopf/hair (werkbank bild --klasse, ohne --ist). Je Spielart zwei Schüsse (arm 0,7 m,
// third −4 m), die Spielarten live in derselben Welt: der Zweig, die Normale ohne Rundung, Kajiya-Kay (Tangente der Strähne).
"use strict";
const { spawn, execFileSync } = require("child_process");
const path = require("path");
const os = require("os");
const ROOT = path.resolve(__dirname, "..");
const PORT = 4793;
const env = { ...process.env, WERKBANK_PORT: String(PORT) };
const wb = (...a) => execFileSync(process.execPath, ["scripts/werkbank.cjs", ...a], { cwd: ROOT, env, encoding: "utf8", maxBuffer: 1 << 26 });
const json = (t) => {
    const o = JSON.parse(t.slice(t.indexOf("{")));
    if (o.fehler) throw new Error("eval: " + String(o.fehler).slice(0, 300));
    return o;
};
// der Rahmen der Spielarten: je Haar-Teil des Spielers die Tangente der Strähne (Mitte der Spitze − Mitte der Wurzel, das Gesetz der
// Ecken wie koerper haarAchse) und ein Wurf je Strähne in w; die Normalen gemerkt
const RAHMEN = `const pm = r.state.playerMesh, K = window.__koerperCore, haarTon = K.menschTon("hair"), teile = [];
pm.traverse((o) => o.isMesh && (o.userData.__klasse || o.material?.userData?.__klasse) === "hair" && o.geometry.attributes.aStraehne && teile.push(o));
let baender = 0;
for (const o of teile) {
  const g = o.geometry, P = g.attributes.position, C = g.attributes.color, Tn = g.attributes.aTon, N = g.attributes.normal, n = P.count;
  if (!g.userData.__nOrig) g.userData.__nOrig = Float32Array.from(N.array);
  if (g.attributes.aHaarT) { baender += g.attributes.aHaarT.count / 4; continue; }
  const A = new Float32Array(n * 4);
  for (let i = 0; i + 3 < n; i += 4) {
    let haar = true; for (let k = 0; k < 4; k++) haar = haar && Math.round(Tn.getX(i + k)) === haarTon;
    if (!haar) continue;
    const w = C.getX(i), s = C.getX(i + 2); if (!(Math.abs(w - 0.85 * s) <= 1e-5 + 2e-3 * s)) continue;
    const t = [0, 1, 2].map((k) => (P.getComponent(i + 2, k) + P.getComponent(i + 3, k) - P.getComponent(i, k) - P.getComponent(i + 1, k)) / 2);
    const l = Math.hypot(...t) || 1, h = Math.sin(i * 12.9898 + 78.233) * 43758.5453, z = 2 * (h - Math.floor(h)) - 1;
    for (let k = 0; k < 4; k++) A.set([t[0] / l, t[1] / l, t[2] / l, z], (i + k) * 4);
    baender++;
  }
  g.setAttribute("aHaarT", new T.BufferAttribute(A, 4));
}
window.__haarTeile = teile; return { teile: teile.length, baender };`;
// die Normale: gebaut (rund) oder je Band gemittelt (die Fläche der Kappe, ohne die Rundung quer zur Strähne)
const NORMALE = (rund) => `for (const o of window.__haarTeile) {
  const g = o.geometry, N = g.attributes.normal, A = g.attributes.aHaarT, n0 = g.userData.__nOrig;
  N.array.set(n0);
  if (!${rund}) for (let i = 0; i + 3 < N.count; i += 4) {
    if (A.getX(i) === 0 && A.getY(i) === 0 && A.getZ(i) === 0) continue;
    const m = [0, 1, 2].map((k) => n0[i * 3 + k] + n0[i * 3 + 3 + k] + n0[i * 3 + 6 + k] + n0[i * 3 + 9 + k]); const l = Math.hypot(...m) || 1;
    for (let k = 0; k < 4; k++) N.setXYZ(i + k, m[0] / l, m[1] / l, m[2] / l);
  }
  N.needsUpdate = true;
} return 1;`;
// das Licht: der Zweig (das Lichtmodell des Stamms) oder Kajiya-Kay — diffus sin(T, L) × die Form (N·L umwickelt), R und TRT als
// sin(T', H)^p mit der Tangente um shift + Wurf × jit zur Normale gekippt (Scheuermann 2004, Marschner 2003), normiert (p + 2) / 2π
const LICHT = (o) => `const S = T.TSL, mats = new Set(); for (const m of window.__haarTeile) mats.add(m.material);
const o = ${JSON.stringify(o)};
const Basis = T.MeshStandardNodeMaterial.prototype.setupLightingModel.call(null).constructor;
for (const m of mats) {
  if (!m.userData.__lichtOrig) m.userData.__lichtOrig = [m.setupLightingModel, m.customProgramCacheKey];
  const [lm0, key0] = m.userData.__lichtOrig;
  if (!o) { m.setupLightingModel = lm0; m.customProgramCacheKey = key0; m.needsUpdate = true; continue; }
  const a = S.attribute("aHaarT", "vec4");
  const t = S.vertexStage(S.modelViewMatrix.mul(S.vec4(a.xyz, 0)).xyz);
  const wurf = S.vertexStage(a.w);
  class KK extends Basis {
    direct(e, builder) {
      const L = e.lightDirection, N = S.normalView, V = S.positionViewDirection.normalize();
      const tl = t.normalize(), da = S.step(0.5, t.length());
      const nl = N.dot(L), form = nl.mul(o.wrap).add(1 - o.wrap).clamp(0, 1);
      const sinTL = S.float(1).sub(tl.dot(L).pow(2)).max(0).sqrt();
      const diff = S.mix(nl.max(0), S.mix(nl.max(0), sinTL.mul(form), o.kd), da);
      e.reflectedLight.directDiffuse.addAssign(e.lightColor.mul(diff).mul(S.diffuseColor.rgb).mul(1 / Math.PI));
      const H = L.add(V).normalize();
      const lappen = (shift, p) => { const ts = tl.add(N.mul(wurf.mul(o.jit).add(shift))).normalize(); const th = ts.dot(H); return S.float(1).sub(th.mul(th)).max(0).sqrt().pow(p).mul((p + 2) / (2 * Math.PI)); };
      const spec = S.vec3(o.cR).mul(lappen(o.sR, o.pR)).add(S.diffuseColor.rgb.mul(o.cT).mul(lappen(o.sT, o.pT)));
      e.reflectedLight.directSpecular.addAssign(e.lightColor.mul(form).mul(spec).mul(da));
    }
  }
  m.setupLightingModel = () => new KK();
  m.customProgramCacheKey = function () { return key0.call(this) + "|kk" + JSON.stringify(o); };
  m.needsUpdate = true;
}
window.__bundlesNeu && window.__bundlesNeu(); return mats.size;`;
const KK = { wrap: 0.5, kd: 1, cR: 0.046, sR: -0.1, pR: 80, cT: 0.5, sT: 0.1, pT: 20, jit: 0.2 };
const SANFT = { ...KK, cR: 0.02, pR: 40 };
// der Zweig ist Kajiya-Kay im Stamm (HAAR_LOOK.kk = KK); die Spielarten tauschen nur die Zahlen
const STAENDE = [
    ["zweig#1", true, null],
    ["sanft", true, SANFT],
    ["sanft-streu", true, { ...SANFT, jit: 0.5 }],
    ["sanft-trt", true, { ...SANFT, cT: 1 }],
    ["sanft-rund-weg", false, SANFT],
    ["zweig#2", true, null],
];
(async () => {
    const welt = spawn(process.execPath, ["scripts/werkbank.cjs", "start", "--port", String(PORT), "--ort", "wiese"], { cwd: ROOT, env });
    let log = "";
    await new Promise((ok, nein) => {
        const t = setTimeout(() => nein(new Error("die Werkbank stand nach 240 s nicht")), 240000);
        const lies = (d) => ((log += d), (global.__weltLog = log), /WERKBANK bereit/.test(log) && (clearTimeout(t), ok()));
        welt.stdout.on("data", lies);
        welt.stderr.on("data", lies);
        welt.on("exit", (c) => nein(new Error("die Werkbank endete " + c + ": " + log.slice(-400))));
    });
    console.log((/\[linse-gpu\][^\n]*/.exec(log) || ["[linse-gpu] ?"])[0]);
    const zeilen = [];
    try {
        wb("fenster", "1920", "1080");
        const u = json(wb("umstellen", "--ort", "wiese", "--sicht", "third"));
        console.log("umgestellt", JSON.stringify({ ort: u.ort, sicht: u.sicht, fehler: u.fehler }));
        const h = json(wb("eval", 'window.__halten(["leib", "haar"]); window.__gehalten.t = 0; r.animatePlayerSoul(0); const c = []; r.state.playerMesh.traverse((o) => o.isMesh && o.material?.userData?.__klasse === "hair" && o.geometry.attributes.color && c.push(o.geometry.attributes.color.getX(2))); return { gehalten: [...window.__gehalten], haarRot: c.slice(0, 3) };')).ergebnis; // prettier-ignore
        console.log("✅ GEHALTEN", JSON.stringify(h), "rahmen", JSON.stringify(json(wb("eval", RAHMEN)).ergebnis));
        const POSE = "const pm = r.state.playerMesh, z = []; pm.traverse((o) => { if (!o.isMesh) z.push(...o.position.toArray(), ...o.quaternion.toArray()); else if (o.userData.__haarFeder) z.push(o.userData.__haarFeder.x, o.userData.__haarFeder.y, o.userData.__haarFeder.z); }); return z;";
        const pose0 = json(wb("eval", POSE)).ergebnis;
        const schuss = (n, g) => {
            const d = path.join(os.tmpdir(), `haar-strich-${n}.png`);
            let o;
            try {
                o = json(wb("bild", "0", "0", "0", "0", "0", "0", "--gesicht", g, "--spieler", "--wahl", "0", "--klasse", "^spieler:kopf/hair$", "--datei", d)); // prettier-ignore
            } catch (e) {
                o = { fehler: String(e.stdout || e.message).slice(-300) };
            }
            const k = o.klasse && o.klasse.klassen && o.klasse.klassen["spieler:kopf/hair"];
            return k ? { strich: k.strich, si: k.si, luma: k.luma, weiss: k.weiss } : { fehler: o.fehler || "ohne Klasse" };
        };
        for (const [stand, rund, licht] of STAENDE) {
            json(wb("eval", NORMALE(rund)));
            json(wb("eval", LICHT(licht)));
            const a = schuss(stand + "-arm", "0.7"),
                t = schuss(stand + "-third", "-4");
            const p = json(wb("eval", POSE)).ergebnis;
            const dp = Math.max(...p.map((v, i) => Math.abs(v - pose0[i])));
            const im = (x) => x.strich != null && x.strich >= 0.3554 && x.strich <= 0.533;
            zeilen.push([stand, a.strich, t.strich, im(a), im(t)]);
            console.log(`✅ MESSUNG ${stand}: arm ${JSON.stringify(a)} · third ${JSON.stringify(t)} · Pose Δ ${dp.toExponential(1)}`);
        }
    } finally {
        try {
            wb("stop");
        } catch {}
        welt.kill();
    }
    for (const [art, a, t, ia, it] of zeilen)
        console.log(`${ia && it ? "✅ GRÜN" : "❌ ROT"} ${art}: arm ${a} ${ia ? "im" : "außer"} Band · third ${t} ${it ? "im" : "außer"} Band [0,3554; 0,533]`);
    process.exit(0);
})().catch((e) => {
    const t = String((e.stdout || "") + (e.stderr || "")).replace(/\s+/g, " ");
    console.log("❌ ROT haar-strich: " + e.message.split("\n")[0].slice(-120) + " — " + t.slice(-500));
    for (const z of (global.__weltLog || "").split("\n").filter((x) => /ERROR|FEHLER|Bruch|BRUCH/.test(x)).slice(-6)) console.log("❌ ROT Welt: " + z.slice(0, 400));
    process.exit(1);
});
