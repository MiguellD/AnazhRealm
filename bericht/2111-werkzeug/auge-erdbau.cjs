// node auge-erdbau.cjs <ausgabe-ordner> — das Auge am Erdbau (z801, V18.546.450): an der Mess-Wiese den nächsten Wasserlauf suchen,
// am Ufer über den EINEN Weg des Erdbaus (`_erdbauAkt`, derselbe wie Hieb und Wort) eine Grube graben, das Wasser folgen lassen;
// Bildpaar vorher ↔ nachher aus derselben Kamera, dazu die Augenhöhe des Spielers. Läuft gegen die Werkbank auf :4852.
// Der Mess-Halt der Bühne (`umstellen`) weicht nur für den Akt selbst, wie in der Probe `wasserGraben` (proben-welt.cjs:1166–1216).
const { execFileSync } = require("child_process"), fs = require("fs");
const B = "C:/Users/micha/AnazhRealm-auge-4a188", O = process.argv[2];
fs.mkdirSync(O, { recursive: true });
const W = (args, t = 900000) => {
    try { return execFileSync("node", ["scripts/werkbank.cjs", ...args, "--port", "4852"], { cwd: B, timeout: t, maxBuffer: 1 << 26 }).toString(); }
    catch (e) { return "FEHLER " + String(e.stdout || "") + String(e.stderr || "") + " " + e.message; }
};
const log = (n, t) => fs.appendFileSync(O + "/lauf.txt", `== ${n} · ${new Date().toTimeString().slice(0, 8)}\n${String(t).slice(0, 6000)}\n`);
const ev = (n, code) => { const t = W(["eval", code]); log(n, t); return t; };
const bild = (n, p, l, mehr = []) => log("bild " + n, W(["bild", ...p.map(String), ...l.map(String), "--w", "1280", "--h", "720", "--datei", O + "/" + n + ".png", ...mehr]));
const schlaf = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
ev("stand", 'return "STAND " + location.href + " " + r.constructor.VERSION');
log("umstellen wiese", W(["umstellen", "--ort", "wiese", "--sicht", "third"]));
// der nächste Wasserlauf: Boden unter dem Spiegel des Hydro-Atlas; das Ufer = der letzte trockene Schritt zum Spieler hin
const such = ev("ufer suchen", `
    const p = r.state.playerMesh.position, nass = (x, z) => { const w = r._atlasWaterLevelAt(x, z, -1e9), y = r._voxelSurfaceY(x, z); return w > -1e8 && w > y + 0.25 ? { w, y } : null; };
    let W = null;
    for (let d = 4; d <= 420 && !W; d += 4) for (let k = 0; k < 32 && !W; k++) { const a = (k / 32) * Math.PI * 2, x = p.x + Math.sin(a) * d, z = p.z + Math.cos(a) * d; const n = nass(x, z); if (n) W = { x, z, d, w: n.w, y: n.y }; }
    if (!W) return "UFER keines in 420 m um " + [p.x, p.z].map((v) => v.toFixed(1)).join("/");
    const l = Math.hypot(p.x - W.x, p.z - W.z) || 1, ux = (p.x - W.x) / l, uz = (p.z - W.z) / l;
    let s = 0; while (s < 40 && nass(W.x + ux * s, W.z + uz * s)) s += 0.5;
    const bx = W.x + ux * s, bz = W.z + uz * s, gx = bx + ux * 2.5, gz = bz + uz * 2.5;
    return "UFER " + [W.x, W.z, W.w, W.y, bx, bz, gx, r._voxelSurfaceY(gx, gz), gz, ux, uz, W.d, s].map((v) => +v.toFixed(3)).join(" ");
`);
const m = such.match(/UFER ((?:-?[\d.e+-]+ ?){13})/);
if (!m) { log("ende", "kein Ufer: " + such.slice(0, 300)); process.exit(3); }
const [wx, wz, spiegel, grund, bx, bz, gx, gy, gz, ux, uz] = m[1].trim().split(" ").map(Number);
// Kameras: (1) schräg von der Land-Seite über die Grube auf den Fluss, (2) Augenhöhe 5 m vor der Grube, (3) quer entlang des Ufers
const k1 = [gx + ux * 10, gy + 6, gz + uz * 10], z1 = [gx - ux * 2, gy - 0.5, gz - uz * 2];
const k2 = [gx + ux * 5.5, gy + 1.7, gz + uz * 5.5], z2 = [gx - ux * 3, gy - 0.8, gz - uz * 3];
const k3 = [gx - uz * 9 + ux * 2, gy + 3.2, gz + ux * 9 + uz * 2], z3 = [gx, gy - 0.6, gz];
const uhr = ["--uhr", "0.45", "--wahl", "0"];
bild("1-vorher-schraeg", k1, z1, uhr); bild("2-vorher-auge", k2, z2, uhr); bild("3-vorher-quer", k3, z3, uhr);
// der Akt: drei Gruben in einer Linie vom Ufer landeinwärts (ein Stich-Graben, wie ihn ein Spieler mit drei Hieben zieht)
const akt = ev("graben", `
    const st = r.state, halt = st.weatherEffectTime; st.weatherEffectTime = 0;
    const aus = [];
    try {
        for (const s of [0, 3, 6]) { const x = ${gx} + ${ux} * s, z = ${gz} + ${uz} * s, y0 = r._voxelSurfaceY(x, z); const a = r._erdbauAkt("carve", x, y0, z, 3.5); aus.push({ s, getan: a.getan, y0: +y0.toFixed(2) }); }
        const t0 = performance.now(); let n = 0;
        while (performance.now() - t0 < 6000) { n++; await new Promise((f) => requestAnimationFrame(f)); }
        for (const o of aus) { const x = ${gx} + ${ux} * o.s, z = ${gz} + ${uz} * o.s; o.y1 = +r._voxelSurfaceY(x, z).toFixed(2); }
        return "AKT " + JSON.stringify({ aus, bilder: n, spiegel: ${spiegel}, offen: r._weltOffen ? r._weltOffen() : null, iso: st.pendingWaterIso ? st.pendingWaterIso.size : null });
    } finally { st.weatherEffectTime = halt; }
`);
bild("4-nachher-schraeg", k1, z1, uhr); bild("5-nachher-auge", k2, z2, uhr); bild("6-nachher-quer", k3, z3, uhr);
schlaf(8000);
bild("7-nachher-schraeg-spaet", k1, z1, uhr);
log("ende", "ok · Ufer " + [bx, bz].join("/") + " · Grube " + [gx, gy, gz].join("/") + " · Spiegel " + spiegel + " · Grund " + grund + " · " + akt.slice(0, 600));
