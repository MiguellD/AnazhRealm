// haar-strich-probe.cjs — AUF ZEIT (w25-haar-albedo, fällt vor der Abgabe): die Szene der Station haar.K2#1 auf der echten Karte
// über die GPU-Probe — eigene Werkbank an der Mess-Wiese, Third, 1920 × 1080, je Schuss das Maß strich der Klasse
// spieler:kopf/hair (werkbank bild --klasse, ohne --ist). Je Stand zwei Schüsse (arm 0,7 m, third −4 m): der Zweig, dann seine
// Spielarten der Auflösung (live in derselben Welt).
"use strict";
const { spawn, execFileSync } = require("child_process");
const path = require("path");
const os = require("os");
const ROOT = path.resolve(__dirname, "..");
const PORT = 4793;
const env = { ...process.env, WERKBANK_PORT: String(PORT) };
const wb = (...a) => execFileSync(process.execPath, ["scripts/werkbank.cjs", ...a], { cwd: ROOT, env, encoding: "utf8", maxBuffer: 1 << 26 });
const json = (t) => JSON.parse(t.slice(t.indexOf("{")));
// eine Spielart des Zweigs (live, dieselbe Welt): die Auflösung [a0, a1] (Szenen-Pixel), ob sie den Ton und die Normale filtert
const SPIELART = (a0, a1, ton, norm) => `const S = T.TSL, HS = window.__koerperCore.HAAR_STRICH, mats = new Set();
r.state.playerMesh.traverse((o) => o.isMesh && o.material && o.material.userData && o.material.userData.__klasse === "hair" && mats.add(o.material));
for (const m of mats) {
  const vcol = S.attribute("color", "vec3"), lw = S.vec3(0.2126, 0.7152, 0.0722);
  const rahmen = (f, ohne) => S.Fn((b) => (b.geometry && b.geometry.hasAttribute("aStraehne") ? f(S.attribute("aStraehne", "vec4")) : ohne))();
  const haarT = rahmen((a) => a.x.div(a.z.max(1e-6)).clamp(0, 1), S.float(0));
  const zeigt = rahmen((a) => S.smoothstep(${a0}, ${a1}, S.float(2).div(S.fwidth(a.y).max(1e-6))), S.float(1));
  const wuerfel = vcol.dot(lw).div(S.float(m.userData.stoffWerte.tonL).mul(S.mix(S.float(HS.wurzel), S.float(1), haarT))).max(1e-4);
  m.colorNode = ${ton} ? S.vec4(S.mix(vcol.div(wuerfel), vcol, zeigt), 1) : S.vec4(vcol, 1);
  const nGeo = S.normalViewGeometry.mul(S.faceDirection).normalize(), quer = rahmen((a) => a.y, S.float(0));
  const g = S.cross(S.dFdy(S.positionView), nGeo).mul(S.dFdx(quer)).add(S.cross(nGeo, S.dFdx(S.positionView)).mul(S.dFdy(quer)));
  const v = g.div(g.length().max(1e-12));
  m.normalNode = ${norm} ? S.mix(nGeo.sub(v.mul(nGeo.dot(v))), nGeo, zeigt).normalize() : null;
  m.needsUpdate = true;
}
window.__bundlesNeu && window.__bundlesNeu(); return mats.size;`;
const STAENDE = [
    ["zweig", null],
    ["ohne-C", SPIELART(0.5, 1, false, false)],
    ["C-nur-Normale", SPIELART(0.5, 1, false, true)],
    ["C-nur-Ton", SPIELART(0.5, 1, true, false)],
    ["C-1-2", SPIELART(1, 2, true, true)],
    ["C-0.25-0.5", SPIELART(0.25, 0.5, true, true)],
];
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
        for (const [stand, art] of STAENDE) {
            if (art) console.log(stand, "an", json(wb("eval", art)).ergebnis, "Stoffen");
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
    process.exit(0);
})().catch((e) => {
    console.log("❌ ROT haar-strich: " + e.message);
    process.exit(1);
});
