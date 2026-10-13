// 1310-11 Nebenterm: die STEHENDE Nah-Streu (nicht wiegend: Geröll · Totholz · Stumpf) wirft nicht (`_streuSatzArt` wurf false).
// node wurf.cjs <port> zaehle|an|aus — zaehle: je stehende Senke Instanzen und Dreiecke (der Preis, den die Kaskaden zögen),
// an/aus: der Satz ihrer Stoffe wirft live (spec.schatten + castShadow), die Schatten-Map neu markiert.
"use strict";
const http = require("http");
const modus = process.argv[3] || "zaehle";
const code = `
const st = r.state, ns = st.nahStreu, modus = ${JSON.stringify(modus)};
if (!ns || !ns.senken) return { fehlt: "nahStreu" };
const saetze = new Map(); const senken = []; let inst = 0, tri = 0, triWiegt = 0, instWiegt = 0;
for (const [k, a] of ns.senken) {
  const t = a.geo.index ? a.geo.index.count / 3 : a.geo.attributes.position.count / 3;
  if (a.wiegt) { instWiegt += a.anzahl; triWiegt += a.anzahl * t; continue; }
  inst += a.anzahl; tri += a.anzahl * t;
  senken.push({ key: k, anzahl: a.anzahl, dreiecke: t, satz: a.satz });
  const s = st.chunkSaetze && st.chunkSaetze.get(a.satz);
  if (s) saetze.set(a.satz, s);
}
const vorher = [...saetze.values()].map((s) => ({ art: s.art.slice(0, 28), schatten: s.spec.schatten, wirft: s.mesh ? s.mesh.castShadow : null }));
if (modus === "an" || modus === "aus") {
  const an = modus === "an";
  for (const s of saetze.values()) { s.spec.schatten = an; if (s.mesh) s.mesh.castShadow = an; s.stand = (s.stand || 0) + 1; }
  const sun = st.sunLight || st.sun || null;
  if (sun && sun.shadow) sun.shadow.needsUpdate = true;
}
const nachher = [...saetze.values()].map((s) => ({ schatten: s.spec.schatten, wirft: s.mesh ? s.mesh.castShadow : null }));
return { modus, nachher, stehend: { senken: senken.length, instanzen: inst, dreiecke: tri }, wiegend: { instanzen: instWiegt, dreiecke: triWiegt },
  saetze: saetze.size, vorher, senken: senken.slice(0, 30) };`;
const q = http.request({ host: "127.0.0.1", port: Number(process.argv[2]), path: "/eval", method: "POST", headers: { "Content-Type": "application/json" } }, (res) => {
    let d = "";
    res.on("data", (c) => (d += c));
    res.on("end", () => console.log(d));
});
q.end(JSON.stringify({ code }));
