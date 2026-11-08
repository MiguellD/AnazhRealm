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
// eine Spielart des Zweigs (live, dieselbe Welt, nur Uniformen): die Breite des Strichs D (Schirm-Pixel, 0 = aus) und die
// Auflösung C [a0, a1] (Schirm-Pixel, [0, 0] = aus)
const SPIELART = (d, a0, a1) =>
    `r._haarStrichPx.value = ${d}; r._haarAufloesung.value.set(${a0}, ${a1}); return [r._haarStrichPx.value, r._haarAufloesung.value.x, r._haarAufloesung.value.y];`;
const STAENDE = [
    ["D2-C0.5", SPIELART(2, 0.5, 1)],
    ["D3-C0.5", SPIELART(3, 0.5, 1)],
    ["D2-C1", SPIELART(2, 1, 2)],
    ["D3-C1", SPIELART(3, 1, 2)],
    ["D0-C0", SPIELART(0, 0, 0.0001)],
    ["D2-C0.5#2", SPIELART(2, 0.5, 1)],
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
    console.log("❌ ROT haar-strich: " + e.message);
    process.exit(1);
});
