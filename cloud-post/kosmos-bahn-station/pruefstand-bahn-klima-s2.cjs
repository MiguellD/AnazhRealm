// kosmos-bahn bahn-klima#2 am Prüfstand: die ECHTE Stationsfunktion (S2-Block aus k2-zusammenspiel.js: BAHN_AN + Fächer +
// Verdichtung) über den ECHTEN Fächer (faecher.js), der Faden ist der echte Block des Workers (voxel-worker.js KOERPER_FELDER …
// planetOrtAuftrag) im vm mit dem Kern ROOT/planet-core.js — r ist ein Stub mit den fünf Rufen, die BAHN_AN liest.
// node s2stand.cjs <station.js> <ROOT mit planet-core.js> <ROOT mit voxel-worker.js>
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const [STATION, KERN, WORKER] = process.argv.slice(2);
const AN = path.resolve(__dirname, "../.."); // die Wurzel des Spiels (gelaende-core.js)
require(path.join(AN, "gelaende-core.js"));
const G = globalThis.__gelaendeCore;
const P = require(path.join(KERN, "planet-core.js"));
// der Block des Fadens, wörtlich
const wsrc = fs.readFileSync(path.join(WORKER, "voxel-worker.js"), "utf8").split("\n");
const von = wsrc.findIndex((l) => l.startsWith("const KOERPER_FELDER"));
const bis = wsrc.findIndex((l) => l.startsWith("// DIE SCHLANGE DES WALDS IM FADEN"));
if (von < 0 || bis < 0) throw new Error("Block des Fadens nicht gefunden");
const ctx = { self: { __planetCore: P }, G, Math, Object, JSON, Number, Error, Map };
vm.createContext(ctx);
vm.runInContext(wsrc.slice(von, bis).join("\n") + "\nthis.planetAnker = planetAnker; this.planetOrtAuftrag = planetOrtAuftrag;", ctx);
const HEIM = "anazh-realm-seed";
const r = {
    _fadenQuelle: async () => {},
    _gelaende: () => ({ ort: G.ortGesetz() }),
    _planetSamen: () => HEIM,
    _planetAnker: async () => ctx.planetAnker({ samen: HEIM }),
    _planetAuftrag: async (msg) => ctx.planetOrtAuftrag(JSON.parse(JSON.stringify(msg))),
};
// der S2-Block der Station, wörtlich: von „const erdSamen“ bis vor „const seite“
const ssrc = fs.readFileSync(STATION, "utf8");
const a = ssrc.indexOf("// S2 ÜBER DEN FÄCHER (stationen/faecher.js): 20 Planeten-Saaten"), b = ssrc.indexOf("const seite = async (r, a) =>", a);
if (a < 0 || b < 0) throw new Error("S2-Block nicht gefunden");
const block = ssrc.slice(a, b);
const { FAECHER } = require(path.join(path.dirname(STATION), "faecher.js"));
const H = { seite: async (code) => new Function("r", "T", "return (async () => {" + code + "})();")(r, {}) };
// die Werte, wie aus[2] sie bildet (alt: amp0/amp45 der Saat kleinster/größter Neigung; neu: gepoolt + Schneelinie)
const i2 = ssrc.indexOf("aus[2] = {", b), W = ssrc.slice(i2, ssrc.indexOf("zeuge: s2,", i2));
const werte = W.slice(W.indexOf("werte:") + 6).trim().replace(/,\s*$/, "");
const lauf = new Function("H", "FAECHER", "require", "return (async () => {" + block + "\nconst __w = " + werte + ";\nreturn { werte: __w, s2, je: R2.je };})();");
const t0 = Date.now();
lauf(H, FAECHER, require).then((o) => {
    const z = Object.assign({}, o.s2);
    delete z.akte;
    if (process.env.JE) for (const x of o.je || []) console.log(JSON.stringify(x));
    console.log(JSON.stringify({ werte: o.werte, zeuge: z, ms: Date.now() - t0 }));
}, (e) => { console.error("BRUCH", e && e.stack); process.exit(1); });
