// haar-strich-probe.cjs — AUF ZEIT (w25-haar-albedo, fällt vor der Abgabe): die Szene der Station haar.K2#1 auf der echten Karte
// über die GPU-Probe — eigene Werkbank an der Mess-Wiese, Third, 1920 × 1080, je Schuss das Maß strich der Klasse
// spieler:kopf/hair (werkbank bild --klasse, ohne --ist). Je Stand zwei Schüsse (arm 0,7 m, third −4 m): die Spielarten des
// Zweigs über die Uniformen der Breite und der Auflösung (live in derselben Welt).
"use strict";
const { spawn, execFileSync } = require("child_process");
const path = require("path");
const os = require("os");
const ROOT = path.resolve(__dirname, "..");
const PORT = 4793;
const env = { ...process.env, WERKBANK_PORT: String(PORT) };
const wb = (...a) => execFileSync(process.execPath, ["scripts/werkbank.cjs", ...a], { cwd: ROOT, env, encoding: "utf8", maxBuffer: 1 << 26 });
const json = (t) => JSON.parse(t.slice(t.indexOf("{")));
// eine Spielart des Zweigs (live, dieselbe Welt): die Uniformen der Breite D und der Auflösung C, dazu ein Stoff mit verstärktem
// Ton der Strähne (k: Ton = Mittel × (1 + k · (Würfel − 1))) und verstärkter Rundung (n: der Teil der Normale quer × n)
const SPIELART = (d, a0, a1) =>
    `r._haarStrichPx.value = ${d}; r._haarAufloesung.value.set(${a0}, ${a1}); return [r._haarStrichPx.value, r._haarAufloesung.value.x, r._haarAufloesung.value.y];`;
const STOFF = (k, n) => `r._haarStrichPx.value = 0; r._haarAufloesung.value.set(0, 0.0001);
const S = T.TSL, HS = window.__koerperCore.HAAR_STRICH, mats = new Set();
r.state.playerMesh.traverse((o) => o.isMesh && o.material && o.material.userData && o.material.userData.__klasse === "hair" && mats.add(o.material));
for (const m of mats) {
  const vcol = S.attribute("color", "vec3"), lw = S.vec3(0.2126, 0.7152, 0.0722);
  const rahmen = (f, ohne) => S.Fn((b) => (b.geometry && b.geometry.hasAttribute("aStraehne") ? f(S.attribute("aStraehne", "vec4")) : ohne))();
  const haarT = rahmen((a) => a.x.div(a.z.max(1e-6)).clamp(0, 1), S.float(0));
  const w = vcol.dot(lw).div(S.float(m.userData.stoffWerte.tonL).mul(S.mix(S.float(HS.wurzel), S.float(1), haarT))).max(1e-4);
  m.colorNode = S.vec4(vcol.div(w).mul(S.float(1).add(w.sub(1).mul(${k}))).max(0), 1);
  const nGeo = S.normalViewGeometry.mul(S.faceDirection).normalize(), quer = rahmen((a) => a.y, S.float(0));
  const g = S.cross(S.dFdy(S.positionView), nGeo).mul(S.dFdx(quer)).add(S.cross(nGeo, S.dFdx(S.positionView)).mul(S.dFdy(quer)));
  const v = g.div(g.length().max(1e-12));
  m.normalNode = nGeo.add(v.mul(nGeo.dot(v)).mul(${n} - 1)).normalize();
  m.needsUpdate = true;
}
window.__bundlesNeu && window.__bundlesNeu(); return mats.size;`;
const STAENDE = [
    ["ohne-C-D", SPIELART(0, 0, 0.0001)],
    ["C0.75-1.5", SPIELART(0, 0.75, 1.5)],
    ["C0.75-1.5#2", SPIELART(0, 0.75, 1.5)],
    ["Ton×2", STOFF(2, 1)],
    ["Rundung×1.6", STOFF(1, 1.6)],
    ["Ton×2+Rundung×1.6", STOFF(2, 1.6)],
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
            if (art) console.log(stand, "an", JSON.stringify(json(wb("eval", art)).ergebnis));
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
    const t = String((e.stdout || "") + (e.stderr || "")).replace(/\s+/g, " ");
    console.log("❌ ROT haar-strich: " + e.message.split("\n")[0].slice(-120) + " — " + t.slice(-500));
    for (const z of (global.__weltLog || "").split("\n").filter((x) => /ERROR|FEHLER|Bruch|BRUCH/.test(x)).slice(-6)) console.log("❌ ROT Welt: " + z.slice(0, 400));
    process.exit(1);
});
