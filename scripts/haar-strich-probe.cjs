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
// der Blick von main, live in derselben Welt: der Glanz als Emission über Ton ÷ Ton-Anker, das Licht des Standard-Stoffs
const MAIN_BLICK = `const S = T.TSL, L = window.__koerperCore.HAAR_LOOK, mats = new Set();
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
const STAENDE = [];
for (let i = 1; i <= 4; i++) STAENDE.push(["zweig#" + i, null]);
STAENDE.push(["main-blick#1", MAIN_BLICK]);
for (let i = 2; i <= 4; i++) STAENDE.push(["main-blick#" + i, null]);
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
            zeilen.push([stand.split("#")[0], a.strich, t.strich, im(a), im(t)]);
            console.log(`haar-strich ${stand}: arm ${JSON.stringify(a)} · third ${JSON.stringify(t)}`);
        }
    } finally {
        try {
            wb("stop");
        } catch {}
        welt.kill();
    }
    // je Spielart das Mittel und die Zahl der Schüsse im Band [0,3554; 0,533]
    const m = (v) => (v.length ? +(v.reduce((x, y) => x + y, 0) / v.length).toFixed(4) : null);
    for (const art of [...new Set(zeilen.map((z) => z[0]))]) {
        const z = zeilen.filter((x) => x[0] === art);
        const arm = z.map((x) => x[1]).filter(Number.isFinite), third = z.map((x) => x[2]).filter(Number.isFinite);
        const ok = z.filter((x) => x[3] && x[4]).length;
        console.log(`${ok === z.length ? "✅ GRÜN" : "❌ ROT"} ${art}: arm Mittel ${m(arm)} [${arm.join(", ")}] im Band ${z.filter((x) => x[3]).length}/${z.length} · third Mittel ${m(third)} [${third.join(", ")}] im Band ${z.filter((x) => x[4]).length}/${z.length}`);
    }
    process.exit(0);
})().catch((e) => {
    const t = String((e.stdout || "") + (e.stderr || "")).replace(/\s+/g, " ");
    console.log("❌ ROT haar-strich: " + e.message.split("\n")[0].slice(-120) + " — " + t.slice(-500));
    for (const z of (global.__weltLog || "").split("\n").filter((x) => /ERROR|FEHLER|Bruch|BRUCH/.test(x)).slice(-6)) console.log("❌ ROT Welt: " + z.slice(0, 400));
    process.exit(1);
});
