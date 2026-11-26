// koerper-hand.cjs — same.kopplung.gewalt von Hand am Planet-Faden des SPIELS (r._planetAuftrag → voxel-worker.js:1501 planetOrtAuftrag),
// in der Welt der Sitzung (punkte.cjs halter: save-server S, Werkbank S + 20000, --echt --ort wiese):
//   alt    — die Frage der Station heute: { koerper: "mars", radiusKm, masseErden, schwere } (k2-zusammenspiel.js:8006 an 179fab68)
//   neu    — die Frage des Kandidaten: koerper = { radiusKm, g, tagStunden, neigungRad } (Felder aus voxel-worker.js:1429 KOERPER_FELDER)
//   jahr   — derselbe Körper mit jahrTage 686,98 (das Mars-Jahr): planet-core.js:2637 pruefJahr bricht beim Namen (R5)
//   uhr    — die Kosten im EINEN Planet-Faden: 6 frische Samen Erde kalt, dann Mars bei warmer Erde, dann 10 Mars auf einmal
//   PORT=4600 node save-server.js &
//   WERKBANK_PORT=24600 xvfb-run -a node scripts/werkbank.cjs start --echt --port 24600 --seite http://localhost:4600 --ort wiese &
//   node bericht/2611-stationen/gewalt1/koerper-hand.cjs [alt,neu,jahr,uhr] [W-Port 24600]
// Richter S6 (wörtlich, vision/meisterkarte-2.json): siehe BEGRUENDUNG.txt
"use strict";
const { spawnSync } = require("child_process");
const MODI = (process.argv[2] || "alt,neu,jahr,uhr").split(",");
const W = process.argv[3] || "24600";
const KOPF = `
await r._fadenQuelle();
const an = await r._planetAnker();
const [B, Lg] = [(an.breite * 180) / Math.PI, (an.laenge * 180) / Math.PI];
const ort = (samen, mehr) => r._planetAuftrag(Object.assign({ type: "planet-ort", samen, breite: B, laenge: Lg, zeitMa: 0 }, mehr || {}));
const MARS = { radiusKm: 3389.5, g: 3.71, tagStunden: 24.6597, neigungRad: (25.19 * Math.PI) / 180 };
const wirkt = (x, y) => x.hoeheM !== y.hoeheM || x.kuesteKm !== y.kuesteKm || JSON.stringify(x.delta) !== JSON.stringify(y.delta);
const fang = async (f) => { const t = performance.now(); try { const v = await f(); return { ms: Math.round(performance.now() - t), v }; } catch (e) { return { ms: Math.round(performance.now() - t), wurf: String((e && e.message) || e) }; } };
`;
const SEITE = {
    alt: `const e = await ort("same-saat-0"); const m = await fang(() => ort("same-saat-0", { koerper: "mars", radiusKm: 3389.5, masseErden: 0.107, schwere: 3.71 }));
return m.wurf ? { frage: "alt", wurf: m.wurf, ms: m.ms } : { frage: "alt", koerperWirkt: wirkt(e, m.v) };`,
    neu: `const P = []; for (let i = 0; i < 4; i++) { const e = await ort("same-saat-" + i), m = await ort("same-saat-" + i, { koerper: MARS }); P.push({ samen: "same-saat-" + i, hoeheM: [Math.round(e.hoeheM), Math.round(m.hoeheM)], kuesteKm: [Math.round(e.kuesteKm), Math.round(m.kuesteKm)], sommer: [e.delta.klima.sommer, m.delta.klima.sommer].map((v) => Math.round(v * 100) / 100), wirkt: wirkt(e, m) }); }
return { frage: "neu", paare: P, koerperWirkt: P.filter((p) => p.wirkt).length + " von " + P.length };`,
    jahr: `const m = await fang(() => ort("same-saat-0", { koerper: Object.assign({ jahrTage: 686.98 }, MARS) })); return { frage: "jahr", wurf: m.wurf || null };`,
    uhr: `const tag = "uhr-" + Date.now() + "-"; const o = { erdeKaltMs: [], marsBeiWarmerErdeMs: [] };
for (let i = 0; i < 6; i++) o.erdeKaltMs.push((await fang(() => ort(tag + i))).ms);
for (let i = 0; i < 6; i++) o.marsBeiWarmerErdeMs.push((await fang(() => ort(tag + i, { koerper: MARS }))).ms);
const t2 = "uhr10-" + Date.now() + "-"; await Promise.all(Array.from({ length: 10 }, (_, i) => ort(t2 + i)));
o.mars10AufEinmalMs = (await fang(() => Promise.all(Array.from({ length: 10 }, (_, i) => ort(t2 + i, { koerper: MARS }))))).ms;
return o;`,
};
for (const m of MODI) {
    const p = spawnSync(process.execPath, ["scripts/werkbank.cjs", "eval", KOPF + SEITE[m]], { encoding: "utf8", env: { ...process.env, WERKBANK_PORT: W }, timeout: 300000 });
    let out;
    try {
        const j = JSON.parse(p.stdout);
        out = j.fehler ? { fehler: j.fehler } : j.ergebnis;
    } catch (e) {
        out = { fehler: String(p.stdout || p.stderr).slice(0, 300) };
    }
    console.log(m.padEnd(5) + JSON.stringify(out));
}
