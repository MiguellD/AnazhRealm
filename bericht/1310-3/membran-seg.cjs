// 1310-3: die Unterteilung der Welt-Membranen live tauschen (EINE Sitzung) — node membran-seg.cjs <port> <seg>
// Je geteilter Geometrie eine neue PlaneGeometry(w, h, seg, seg) mit derselben Lage (Mitte y aus der alten Hülle) und
// derselben Hülle um die Welle (z ± Amplitude); die alte bleibt im Speicher der Probe (window.__membranOrig), seg 90 stellt
// die Original-Geometrien zurück.
"use strict";
const http = require("http");
const [port, seg] = process.argv.slice(2);
const code = `
const N = ${Number(seg)};
window.__membranOrig = window.__membranOrig || new Map();
const neu = new Map();
let n = 0, tris = 0;
r.state.scene.traverse((o) => {
  if (!(o.userData && o.userData.inventar === "portal-membran")) return;
  if (!window.__membranOrig.has(o)) window.__membranOrig.set(o, o.geometry);
  const alt = window.__membranOrig.get(o);
  let g;
  if (N === alt.parameters.widthSegments) g = alt;
  else {
    g = neu.get(alt);
    if (!g) {
      const p = alt.parameters;
      g = new T.PlaneGeometry(p.width, p.height, N, N);
      alt.computeBoundingBox && !alt.boundingBox && alt.computeBoundingBox();
      const bb = alt.boundingBox;
      g.translate(0, (bb.min.y + bb.max.y) / 2, 0);
      g.computeBoundingBox();
      g.boundingBox.min.z = bb.min.z;
      g.boundingBox.max.z = bb.max.z;
      g.boundingSphere = g.boundingBox.getBoundingSphere(new T.Sphere());
      neu.set(alt, g);
    }
  }
  o.geometry = g;
  n++;
  tris += g.index ? g.index.count / 3 : 0;
});
return { seg: N, membranen: n, dreiecke: tris };`;
const q = http.request({ host: "127.0.0.1", port: Number(port), path: "/eval", method: "POST", headers: { "Content-Type": "application/json" } }, (res) => {
    let d = "";
    res.on("data", (c) => (d += c));
    res.on("end", () => console.log(d.slice(0, 300)));
});
q.end(JSON.stringify({ code }));
