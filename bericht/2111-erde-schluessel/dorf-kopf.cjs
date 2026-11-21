const { studioKern } = require(process.cwd() + "/scripts/lib/welt-boot.cjs");
const FC = studioKern("fachwerk-core.js", "__fachwerkCore");
const seed = 4291161376, nH = 13, ep = FC.siedlungsEpoche(seed);
const k = (x) => { const m = {}; for (const s of x.slots) m[s.kultur] = (m[s.kultur] || 0) + 1; return JSON.stringify(m); };
const a = FC.exportSettlement({ seed, nH, epoche: ep });
const b = FC.exportSettlement({ seed, nH, epoche: ep, erde: { breite: 47.53, laenge: 7.72 } });
console.log("epoche", ep, "main", a.region, a.jahr, k(a), "kopf", b.region, b.jahr, JSON.stringify(b.erde), k(b));
console.log("gleich ohne erde-Feld:", JSON.stringify({ ...b, erde: undefined }) === JSON.stringify(a));
