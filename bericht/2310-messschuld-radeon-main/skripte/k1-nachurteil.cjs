// k1-nachurteil.cjs <echt-k1-*.json> [tolMm] — das Alter je Tod neu, mit Lage-Toleranz (Standard 50 mm): der Spieler, der nach dem
// Laden aus einem Bau/Edit gedrückt wird, steht Millimeter neben seinem Stand; Blöcke, Edits, Zellen und Orte müssen GLEICH sein.
const o = require(require("path").resolve(process.argv[2]));
const tol = Number(process.argv[3] || 50);
const zeilen = [];
for (const z of o.zyklen.filter((x) => x.tod)) {
    const tot = o.todZeiten[z.z - 1], g = z.g;
    const gl = (e, t) => e.rec && Math.abs(e.rec.x - g.x) <= t && Math.abs(e.rec.z - g.z) <= t && e.rec.b === g.b && e.rec.e === g.e && e.rec.sck === g.sck && e.rec.ok === g.ok;
    const alter = (t) => { const a = o.alle.filter((e) => e.t <= tot + 1000 && gl(e, t)); return a.length ? Math.max(0, tot - Math.max(...a.map((e) => e.t))) / 1000 : null; };
    zeilen.push({ tod: "z" + (z.z - 1) + " " + z.tod, alterStreng: alter(0), alterTol: alter(tol), verlorenBloecke: z.verlorenBloecke, verlorenEdits: z.verlorenEdits, dorfHalb: z.dorfHalb, geladen: g.sck + " sc" + g.sc + "/ok" + g.ok, ...(z.erwachenVorher ? { erwachen: { zelle: z.erwachenVorher.zelle, gangGesehen: z.erwachenVorher.gangGesehen, gangSchreiber: z.erwachenVorher.gangWrites.map((w) => w.art + "@-" + w.vorTod + "ms " + w.rec.sck) } } : {}) });
}
for (const z of zeilen) console.log(JSON.stringify(z));
const a = zeilen.map((z) => (z.alterTol == null ? 999 : z.alterTol));
console.log("URTEIL tol " + tol + " mm: Tode " + zeilen.length + ", Alter max " + Math.max(...a) + " s, über 10 s " + a.filter((x) => x > 10).length + ", halbe " + zeilen.filter((z) => z.alterTol == null || z.verlorenBloecke > 0 || z.verlorenEdits > 0 || z.dorfHalb).length + ", korrupt " + o.korrupt + ", Tode im Erwachen " + zeilen.filter((z) => /erwachen/.test(z.tod)).length);
