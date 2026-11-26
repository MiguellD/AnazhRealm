// taeter-diag.cjs <g2.js> <aus.js> — baut aus `dorfZaehlung` der BASIS eine Diagnose: je Mensch des Solls am Ort, den die Zählung nicht
// zählt, die Sperre (frustum · haus) mit Lage, Abstand und Auge. Lauf: Rumpf als `return await (<aus.js>)(r, T);` per werkbank eval.
const fs = require("fs");
const t = fs.readFileSync(process.argv[2], "utf8");
const a = t.indexOf("async function dorfZaehlung(r, T) {");
const e = t.indexOf("\n}\n", a) + 2;
let f = t.slice(a, e);
const rep = (x, y) => { if (!f.includes(x)) throw new Error("fehlt: " + x.slice(0, 60)); f = f.replace(x, y); };
rep("const amOrt = new Set(),", "const sperre = new Map(); const amOrt = new Set(),");
rep("if (!fr.containsPoint(brust)) continue;", "if (!fr.containsPoint(brust)) { const v = brust.clone().project(cam); sperre.set(b, { art: \"frustum\", ndc: [+v.x.toFixed(2), +v.y.toFixed(2), +v.z.toFixed(3)], dO: +dO.toFixed(1), dA: +auge.distanceTo(brust).toFixed(1), p: [+g.position.x.toFixed(1), +g.position.y.toFixed(1), +g.position.z.toFixed(1)] }); continue; }");
rep("if (frei) ist++, gezaehlt.push(b);", "if (frei) ist++, gezaehlt.push(b); else sperre.set(b, { art: \"haus\", dO: +dO.toFixed(1), dA: +dA.toFixed(1), unterBrust: r._imGrundriss(brust.x, brust.z, 0), p: [+g.position.x.toFixed(1), +g.position.y.toFixed(1), +g.position.z.toFixed(1)] });");
rep("proben.push({ uhr: h, ort: oi,", "const ungez = sollL.filter((b) => amOrt.has(b) && !gezaehlt.includes(b)).map((b) => Object.assign({ rolle: b.rolle || b.beruf || null }, sperre.get(b) || { art: \"?\" })); proben.push({ ...(ungez.length ? { ungez, auge: [+auge.x.toFixed(1), +auge.y.toFixed(1), +auge.z.toFixed(1)], ortXZ: [+O.x.toFixed(1), +O.z.toFixed(1)] } : {}), uhr: h, ort: oi,");
fs.writeFileSync(process.argv[3], f);
console.log("ok", f.length);
