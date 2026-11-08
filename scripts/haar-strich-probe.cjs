// haar-strich-probe.cjs — AUF ZEIT (w25-haar-albedo, fällt vor der Abgabe): die Szene der Station haar.K2#1 auf der echten Karte
// über die GPU-Probe — eigene Werkbank an der Mess-Wiese, Third, 1920 × 1080, je Schuss das Maß strich der Klasse
// spieler:kopf/hair (werkbank bild --klasse, ohne --ist). Je Stand zwei Schüsse (arm 0,7 m, third −4 m): der Zweig, dann der Blick
// von main (der Glanz als Emission über Ton ÷ Ton-Anker, die Normale und der Ton der Ecke unverändert), live in derselben Welt.
"use strict";
const { spawn, execFileSync } = require("child_process");
const path = require("path");
const os = require("os");
const ROOT = path.resolve(__dirname, "..");
const PORT = 4793;
const env = { ...process.env, WERKBANK_PORT: String(PORT) };
const wb = (...a) => execFileSync(process.execPath, ["scripts/werkbank.cjs", ...a], { cwd: ROOT, env, encoding: "utf8", maxBuffer: 1 << 26 });
const json = (t) => JSON.parse(t.slice(t.indexOf("{")));
const MAIN_BLICK = `const S = T.TSL, KC = window.__koerperCore, L = KC.HAAR_LOOK, mats = new Set();
r.state.playerMesh.traverse((o) => o.isMesh && o.material && o.material.userData && o.material.userData.__klasse === "hair" && mats.add(o.material));
for (const m of mats) {
  const vc = S.attribute("color", "vec3"), lw = S.vec3(0.2126, 0.7152, 0.0722);
  const sT = vc.dot(lw).div(m.userData.stoffWerte.tonL).sub(0.85).div(0.15).clamp(0, 1);
  const ndv = S.normalView.normalize().dot(S.positionViewDirection).clamp(-1, 1), rim = S.float(1).sub(ndv.abs()).clamp(0, 1);
  m.colorNode = S.vec4(vc, 1); m.normalNode = null;
  m.emissiveNode = S.vec3(...L.tipRimFarbe).mul(rim.pow(L.tipRimPow).mul(sT)).add(S.vec3(...L.specFarbe).mul(ndv.max(0).pow(L.specPow).mul(sT).mul(L.specAmt)));
  m.setupLightingModel = T.MeshStandardNodeMaterial.prototype.setupLightingModel; m.needsUpdate = true;
}
window.__bundlesNeu && window.__bundlesNeu(); return mats.size;`;
(async () => {
    const welt = spawn(process.execPath, ["scripts/werkbank.cjs", "start", "--port", String(PORT), "--ort", "wiese"], { cwd: ROOT, env });
    let log = "";
    await new Promise((ok, nein) => {
        const t = setTimeout(() => nein(new Error("die Werkbank stand nach 240 s nicht")), 240000);
        const lies = (d) => ((log += d), /WERKBANK bereit/.test(log) && (clearTimeout(t), ok()));
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
        const schuss = (n, g) => {
            const d = path.join(os.tmpdir(), `haar-strich-${n}.png`);
            let o;
            try {
                o = json(wb("bild", "0", "0", "0", "0", "0", "0", "--gesicht", g, "--spieler", "--wahl", "0", "--klasse", "^spieler:kopf/hair$", "--datei", d)); // prettier-ignore
            } catch (e) {
                o = { fehler: String(e.stdout || e.message).slice(-300) };
            }
            const k = o.klasse && o.klasse.klassen && o.klasse.klassen["spieler:kopf/hair"];
            return k ? { strich: k.strich, si: k.si, luma: k.luma } : { fehler: o.fehler || "ohne Klasse" };
        };
        for (const stand of ["zweig", "main-blick"]) {
            if (stand === "main-blick") console.log("main-Blick an", json(wb("eval", MAIN_BLICK)).ergebnis, "Stoffen");
            const a = schuss(stand + "-arm", "0.7"),
                t = schuss(stand + "-third", "-4");
            const im = (x) => x.strich != null && x.strich >= 0.3554 && x.strich <= 0.533;
            zeilen.push(`${im(a) && im(t) ? "✅ GRÜN" : "❌ ROT"} haar-strich ${stand}: arm ${JSON.stringify(a)} · third ${JSON.stringify(t)} · Soll [0.3554; 0.533]`);
            console.log(zeilen[zeilen.length - 1]);
        }
    } finally {
        try {
            wb("stop");
        } catch {}
        welt.kill();
    }
    for (const z of zeilen) console.log(z);
    process.exit(0);
})().catch((e) => {
    console.log("❌ ROT haar-strich: " + e.message);
    process.exit(1);
});
