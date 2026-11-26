// s1-hand.cjs — same.kopplung.aufwaerts S1 von Hand in der warmen Welt der Sitzung: der Bau über den Satz (`spawn_studio haus`, wie die
// Station), die zehn Orte der Station (60 … 1 000 m, Pegel · lebendig · Wuchs · Feuchte · Wild ≤ 150 m · Wald) vor ↔ nach.
//   spiel — das Spiel, wie es ist: der Akt des Werks beim Bau (stamm/feld-dsl.js:2134 → stamm/feld-leben.js:1897 `_werkAkt`)
//   nach  — derselbe Bau, derselbe `_werkAkt` von Hand, sobald die Hülle des Hauses steht (die Gegenprobe der Wurzel, kein Schnitt)
//   heil  — die Mutante „das geheilte Spiel“ an (der gefallene Akt tritt ein, sobald die Hülle ihn trägt), für s1-kandidat.cjs;
//           `aus` nimmt sie zurück
// Aufruf aus der Wurzel des Spiel-Baums, Welt wie die Sitzung (punkte.cjs halter: save-server S, Werkbank S + 20000, --echt --ort wiese):
//   PORT=4600 node save-server.js &
//   WERKBANK_PORT=24600 xvfb-run -a node scripts/werkbank.cjs start --echt --port 24600 --seite http://localhost:4600 --ort wiese &
//   node bericht/2611-stationen/aufwaerts1/s1-hand.cjs [spiel,nach,spiel,nach | heil | aus] [W-Port 24600]
// Richter (wörtlich, vision/meisterkarte-2.json): „Haus bauen, aufsteigen: Pixel aus 400 m an seiner Stelle; Bildpaar an 10 Orten im Umkreis“
"use strict";
const { spawnSync } = require("child_process");
const MODI = (process.argv[2] || "spiel,nach,spiel,nach").split(",");
const W = process.argv[3] || "24600";

const SEITE = (MODUS) => `
const MODUS = ${JSON.stringify(MODUS)};
const st = r.state, pm = st.playerMesh.position;
const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1e3) / 1e3 : null);
const frei = (x, z, R) => r._landAt(x, z, 0.2) && !r._nassAt(x, z) && !r._blockerUmPlatz(x, z, R, []).length;
let P = null;
for (let d = 30; d <= 120 && !P; d += 15) for (let k = 0; k < 12 && !P; k++) { const x = pm.x + d * Math.cos((k * Math.PI) / 6), z = pm.z + d * Math.sin((k * Math.PI) / 6); if (frei(x, z, 8)) P = { x, z }; }
if (!P) return { fehler: "kein trockener freier Ort 30–120 m um den Spieler" };
P.y = r._voxelSurfaceY(P.x, P.z);
const radien = [60, 120, 200, 300, 400, 500, 650, 800, 900, 1000];
const orte = radien.map((m, k) => [P.x + m * Math.cos(k * 2.39996), P.z + m * Math.sin(k * 2.39996)]);
const tiere = () => { const o = []; for (const R of Object.values((st.faunaBestand || {}).regionen || {})) for (const t of R.tiere || []) o.push(t); return o; };
const lies = () => { const T = tiere(); return orte.map(([x, z]) => { const y = r._voxelSurfaceY(x, z); return [r3(r._atlasWaterLevelAt(x, z, y)), r3(r.auraAt(x, z).lebendig), r3(r._wuchsAt(x, z)), r3(r._feuchteAt(x, z, y)), T.filter((t) => Math.hypot(t.x - x, t.z - z) <= 150).length, r3(r._forestStandDensity(x, z))]; }); };
const anders = (X, Y) => X.filter((q, i) => q.some((v, j) => v !== Y[i][j])).length;
const n0 = st.worldMeta.taten.length, a0 = st.architectures.length, halt = st.weatherEffectTime;
const vor = lies();
const aus = { modus: MODUS, gegen: anders(vor, lies()), folgeSteht: r._feldFolgeSteht(st.spielZeit) };
let haus = null;
st.weatherEffectTime = 0;
try {
    r.dslRun(["spawn_studio", "haus", ["at", P.x, P.y, P.z], 1, 7], { source: "human" });
    st.weatherEffectTime = halt;
    haus = st.architectures.slice(a0).find((e) => /haus/.test(e.type)) || null;
    aus.haus = haus && haus.id;
    aus.huelleBeimBau = !!(haus && haus._hausHuelle);
    aus.grundrissBeimBau = !!(haus && r._grundrissVon(haus));
    const bauen = () => st.worldMeta.taten.slice(n0).filter((q) => q.tat === "bauen" && q.id === String(haus.id)).length;
    aus.tatBeimBau = bauen();
    const t0 = performance.now();
    while (!(haus && haus._hausHuelle) && performance.now() - t0 < 5000) await new Promise((q) => setTimeout(q, 20));
    aus.huelleMs = Math.round(performance.now() - t0);
    if (MODUS === "nach") aus.aktVonHand = r._werkAkt(haus, null, true);
    await new Promise((q) => setTimeout(q, 300));
    aus.tat = bauen();
    aus.orteGeaendert = anders(vor, lies());
    aus.lebendigDelta = orte.map(([x, z], i) => r3(r.auraAt(x, z).lebendig - vor[i][1]));
} finally {
    st.weatherEffectTime = halt;
    for (const e of st.architectures.slice(a0)) r.removeArchitecture(e);
    st.worldMeta.taten.length = n0;
    r._tatGen = (r._tatGen | 0) + 1;
}
aus.orteNachAbbau = anders(vor, lies());
return aus;`;

const HEIL = `
const orig = Object.getPrototypeOf(r)._werkAkt;
r._werkAkt = function (e, ctx, ein) {
    const v = orig.call(this, e, ctx, ein);
    if (!v && e && e.werk === true && e.position && !this._grundrissVon(e)) {
        const t0 = performance.now();
        const h = setInterval(() => { if (this._grundrissVon(e)) (clearInterval(h), orig.call(this, e, ctx, ein)); else if (performance.now() - t0 > 5000) clearInterval(h); }, 10);
    }
    return v;
};
return "Mutante „das geheilte Spiel“ an";`;
const AUS = `delete r._werkAkt; return "Mutante aus: " + !Object.prototype.hasOwnProperty.call(r, "_werkAkt");`;

const ev = (code) => {
    const p = spawnSync(process.execPath, ["scripts/werkbank.cjs", "eval", code], { encoding: "utf8", env: { ...process.env, WERKBANK_PORT: W }, timeout: 120000 });
    try {
        const j = JSON.parse(p.stdout);
        return j.fehler ? { fehler: j.fehler } : j.ergebnis;
    } catch (e) {
        return { fehler: String(p.stdout || p.stderr).slice(0, 300) };
    }
};
for (const m of MODI) {
    const code = m === "heil" ? HEIL : m === "aus" ? AUS : SEITE(m);
    console.log(m.padEnd(6) + JSON.stringify(ev(code)));
}
