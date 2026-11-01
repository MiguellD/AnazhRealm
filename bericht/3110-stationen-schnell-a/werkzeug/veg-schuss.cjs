// EIN Schuss wie vegetationLauf (g2.js) mit Profil der Seite: node veg-schuss.cjs <W> <was: wiese|krone> <saison> [baum]
"use strict";
const fs = require("fs");
const path = require("path");
const [W, was, saison, baum] = [Number(process.argv[2]), process.argv[3] || "wiese", process.argv[4] || "sommer", process.argv[5] || "/home/user/spiel-a"];
const { werkbankRuf } = require(path.join(baum, "scripts/lib/welt-boot.cjs"));
const SP = "/tmp/claude-0/-home-user-AnazhRealm/5349db1b-b38b-5a7e-8191-e2588ec49c10/scratchpad";
const ruf = async (weg, o) => {
    const t0 = Date.now();
    const a = await werkbankRuf(W, weg, o);
    console.log("SCHRITT " + weg + " " + ((Date.now() - t0) / 1000).toFixed(1) + " s");
    if (!a || a.fehler) throw new Error(weg + ": " + JSON.stringify(a).slice(0, 600));
    return a;
};
const SPIEL =
    "const s = r.state; for (let i = 0; i < 30; i++) r._loopCamera(performance.now() + i * 100); const c = s.camera, d = new T.Vector3(); c.getWorldDirection(d); const p = c.position; " +
    "const unter = (t) => { const x = p.x + d.x * t, z = p.z + d.z * t, b = r._bodenSichtAt(x, z), y = b == null ? r._voxelSurfaceY(x, z) : b; return y != null && p.y + d.y * t <= y; }; " +
    "let a = 0, t = 0.5; while (t < 2000 && !unter(t)) { a = t; t += Math.max(0.25, t * 0.01); } " +
    "if (t < 2000) { for (let k = 0; k < 24; k++) { const m = (a + t) / 2; if (unter(m)) t = m; else a = m; } } else t = 100; " +
    "return [p.x, p.y, p.z, p.x + d.x * t, p.y + d.y * t, p.z + d.z * t].map((v) => +v.toFixed(3));";
const KRONE = "const p = r.state.playerMesh.position; let e0 = null, d0 = Infinity; for (const e of r.state.architectures) { if (!e || !e.position || !/^(eiche|birke|buche)$/.test(r._foundryPresetForEntry(e) || \"\")) continue; const d = Math.hypot(e.position.x - p.x, e.position.z - p.z); if (d >= 15 && d <= 80 && d < d0) [e0, d0] = [e, d]; } if (!e0) return \"kein Laubbaum 15–80 m um den Spieler\"; const q = e0.position, x = q.x + ((p.x - q.x) / d0) * 14, z = q.z + ((p.z - q.z) / d0) * 14; return [x, r._voxelSurfaceY(x, z) + 1.7, z, q.x, q.y + 6, q.z].map((v) => +v.toFixed(3));";
(async () => {
    const t0 = Date.now();
    await ruf("/eval", { code: fs.readFileSync(path.join(SP, "profil-an.js"), "utf8") });
    const k = (await ruf("/eval", { code: was === "krone" ? KRONE : SPIEL })).ergebnis;
    if (!Array.isArray(k)) throw new Error("Pose: " + JSON.stringify(k));
    const [px, py, pz, lx, ly, lz] = k;
    const wiese = was === "wiese";
    const datei = path.join(SP, "veg-" + was + "-" + saison + ".png");
    const b = await ruf("/bild", {
        px, py, pz, lx, ly, lz, w: 1920, h: 1080, wahl: 0, uhr: 0.5, saison, datei, abstand: wiese, nurPixel: true,
        klasse: wiese ? "^(nahWiese:.*|streuSatz|bodenSatz)$" : "^f:(eiche|birke|buche):L[01]$",
    });
    const p = (await ruf("/eval", { code: fs.readFileSync(path.join(SP, "profil-aus.js"), "utf8") })).ergebnis;
    const kl = b.klasse || {};
    console.log("BILD gesamt " + b.gesamtMs + " ms · Klassen " + Object.keys(kl.klassen || {}).join(",") + " · abnahme " + String(b.abnahme).slice(0, 160));
    console.log("PROFIL " + JSON.stringify(p));
    if (wiese && kl.abstand) console.log("ABSTAND " + JSON.stringify({ baender: kl.abstand.baender, cos: kl.abstand.cos, klassen: kl.abstand.klassen }));
    console.log("ZEIT " + ((Date.now() - t0) / 1000).toFixed(1) + " s");
})().catch((e) => (console.log("FEHLER " + e.message), (process.exitCode = 1)));
