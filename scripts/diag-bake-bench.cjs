// diag-bake-bench.cjs — REIN-NODE Byte-Orakel + Zeitmessung für die Skin-Isosurface (KEIN Puppeteer).
// Der schwerste Algorithmus im Spiel ist der Metaball-Isosurface-Bau (bake-core `__bakeSkinGeometry`):
// res-96-Avatar ~14 s. V18.319 beschleunigt ihn mit einer räumlichen Akzeleration (OpenVDB-Stil
// „bone grid") — OHNE Verlust: dieselbe Geometrie, nur weniger Feld-Auswertungen.
//
// Diese Linse beweist BEIDES selbst-tragend (kein externer Referenz-Stand nötig):
//   (1) BYTE-IDENTITÄT: der akzelerierte Pfad == der Brute-Pfad (opts.__noAccel) byte-für-byte
//       (position/normal/color/index). Der Margin-Garant — zu eng → der Test reißt (Loch/Diff).
//   (2) SPEEDUP: die synchrone Bau-Zeit akzeleriert vs. brute, je Fall.
// Lauf: node scripts/diag-bake-bench.cjs   (braucht die Fixture aus diag-skin-dump.cjs)
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const FIX = "/tmp/skin-fixtures.json";

if (!fs.existsSync(FIX)) {
    console.error("❌ Fixture fehlt — zuerst: node scripts/diag-skin-dump.cjs");
    process.exit(1);
}
const fixtures = JSON.parse(fs.readFileSync(FIX, "utf8"));
(0, eval)(fs.readFileSync(path.join(root, "bake-core.js"), "utf8")); // setzt globalThis.__bakeSkinGeometry
const bake = globalThis.__bakeSkinGeometry;
if (typeof bake !== "function") {
    console.error("❌ __bakeSkinGeometry nicht geladen");
    process.exit(1);
}

const avatarOpts = {
    taubinPasses: 8,
    creaseSharpen: 0,
    creaseMix: 0,
    normalStep: 0.4,
    kFloor: 0.04,
    seamGroove: 3,
    seamWidth: 0.15,
    displace: true,
    dispCap: 0.34,
    normalRelax: 2,
};
const cases = [
    { name: "avatar@64", parts: fixtures.avatar, opts: { res: 64, ...avatarOpts } },
    { name: "avatar@96", parts: fixtures.avatar, opts: { res: 96, ...avatarOpts } },
];
for (const c of fixtures.creatures) {
    cases.push({ name: `${c.soul}@64`, parts: c.parts, opts: { res: 64 } });
    cases.push({ name: `${c.soul}@64+disp`, parts: c.parts, opts: { res: 64, displace: true, seamGroove: 0.6 } });
}

// maxDiff zwischen zwei Geometrien (position+normal+color als f32, index als int).
function maxDiff(a, b) {
    if (!a || !b) return a === b ? 0 : Infinity;
    let w = 0;
    const cmp = (x, y) => {
        if (!x && !y) return;
        if (!x || !y || x.length !== y.length) {
            w = Infinity;
            return;
        }
        for (let i = 0; i < x.length; i++) {
            const d = Math.abs(x[i] - y[i]);
            if (d > w) w = d;
        }
    };
    cmp(new Float32Array(a.positions), new Float32Array(b.positions));
    cmp(new Float32Array(a.normals), new Float32Array(b.normals));
    cmp(new Float32Array(a.colors), new Float32Array(b.colors));
    cmp(a.indices, b.indices); // int — exakter Vergleich
    return w;
}
function timeBake(parts, opts) {
    const reps = (opts.res || 64) >= 96 ? 2 : 3;
    let best = Infinity;
    for (let i = 0; i < reps; i++) {
        const t0 = process.hrtime.bigint();
        bake(parts, opts);
        const ms = Number(process.hrtime.bigint() - t0) / 1e6;
        if (ms < best) best = ms;
    }
    return best;
}

console.log("===== BAKE-BENCH — Akzeleration vs Brute (byte-identisch?) + Speedup =====\n");
let allOk = true;
for (const c of cases) {
    const accel = bake(c.parts, c.opts);
    const brute = bake(c.parts, { ...c.opts, __noAccel: true });
    const diff = maxDiff(accel, brute);
    const ok = diff === 0; // BYTE-EXAKT: 0, nicht eine Toleranz (die Akzeleration ist beweisbar verlustfrei)
    if (!ok) allOk = false;
    const tA = timeBake(c.parts, c.opts);
    const tB = timeBake(c.parts, { ...c.opts, __noAccel: true });
    console.log(
        `  ${ok ? "✅" : "❌"} ${c.name.padEnd(18)} brute ${tB.toFixed(0).padStart(6)} → accel ${tA.toFixed(0).padStart(6)} ms  (${(tB / tA).toFixed(2)}×)  vtx ${accel ? accel.positions.length / 3 : 0}${ok ? "" : `  → maxDiff ${diff}`}`
    );
}
console.log(
    "\n" +
        (allOk
            ? "✅ BYTE-IDENTISCH zur Vollsumme — die Akzeleration ist beweisbar verlustfrei."
            : "❌ DIFF — die Akzeleration ändert die Geometrie. Margin (Lsmin/NC) prüfen.")
);
process.exit(allOk ? 0 : 1);
