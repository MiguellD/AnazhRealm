// Die Texel-Dichte der Schatten-Kaskaden in der laufenden Welt gegen den Fußabdruck eines Leinwand-Pixels an ihren
// Grenzen (senkrecht zum Blick, Mitte der Leinwand): node kaskade-dichte.cjs <port>
const http = require("http");
const [port] = process.argv.slice(2);
const code = `
const st = r.state, csm = st.csmNode, cam = st.camera, rend = st.renderer;
if (!csm) return { fehler: "kein csmNode" };
const db = rend.getDrawingBufferSize(new T.Vector2());
const far = Math.min(cam.far, csm.maxFar);
const pix = (d) => (2 * d * Math.tan((cam.fov * Math.PI) / 360)) / db.y;
const out = { leinwand: [db.x, db.y], fov: cam.fov, near: cam.near, maxFar: csm.maxFar, breaks: csm.breaks.slice(), kaskaden: [] };
const saum = [0, 1];
for (let i = 0; i < csm.lights.length; i++) {
  const L = csm.lights[i], c = L.shadow.camera, n = L.shadow.mapSize.width, z = c.zoom || 1;
  r._kaskadenSaum(csm.breaks, i, csm.fade === true, saum);
  const dA = cam.near + saum[0] * (far - cam.near), dB = cam.near + saum[1] * (far - cam.near);
  const bx = (c.right - c.left) / z, by = (c.top - c.bottom) / z;
  out.kaskaden.push({ karte: n, boxM: [+bx.toFixed(1), +by.toFixed(1)], texelM: [+(bx / n).toFixed(3), +(by / n).toFixed(3)],
    vonM: +dA.toFixed(1), bisM: +dB.toFixed(1), pixelM: [+pix(Math.max(dA, 1)).toFixed(3), +pix(dB).toFixed(3)] });
}
return out;`;
const req = http.request({ host: "127.0.0.1", port: Number(port), path: "/eval", method: "POST", headers: { "Content-Type": "application/json" } }, (r) => {
    let d = "";
    r.on("data", (c) => (d += c));
    r.on("end", () => console.log(JSON.stringify(JSON.parse(d), null, 1)));
});
req.end(JSON.stringify({ code }));
