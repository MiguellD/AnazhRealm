// node hof.cjs <png> x,y,dx,dy[:name] … — der Hof an einer Kante: Luma-Profil 8 Pixel beiderseits des Punkts (x,y)
// entlang der Richtung (dx,dy) (Einheits-Schritte, z. B. 1,0 quer über eine senkrechte Kante). Vom Repo-Wurzelordner rufen.
// Ausgabe je Kante: Profil (17 Werte, Index 8 = der Punkt), Mittel der äußeren 4 je Seite, der Sprung über die Kante
// (Mittel +1…+4 gegen −4…−1) und der HOF = Abweichung der kantennahen 4 vom kantenfernen Rand je Seite (±5…8 gegen ±1…4):
// ein Bild ohne Hof hat dort 0 Code, ein Feld-Hof zeigt eine Rampe zur Kante hin.
const fs = require("fs"), path = require("path");
const U = require(path.resolve("scripts/lib/abnahme-urteil.cjs"));
const b = U.pngLesen(fs.readFileSync(process.argv[2]));
const d = b.u8, W = b.W, H = b.H, ch = d.length / (W * H);
const luma = (x, y) => {
  x = Math.max(0, Math.min(W - 1, Math.round(x))); y = Math.max(0, Math.min(H - 1, Math.round(y)));
  const i = (y * W + x) * ch; return 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
};
const mittel = (a) => a.reduce((s, v) => s + v, 0) / a.length;
const aus = {};
for (const a of process.argv.slice(3)) {
  const [r, n] = a.split(":"); const [x, y, dx, dy] = r.split(",").map(Number);
  // quer zur Profil-Richtung über 5 Pixel mitteln (Rauschen), längs je Pixel ein Wert
  const qx = -dy, qy = dx; const p = [];
  for (let t = -8; t <= 8; t++) { const z = []; for (let q = -2; q <= 2; q++) z.push(luma(x + t * dx + q * qx, y + t * dy + q * qy)); p.push(mittel(z)); }
  const li = p.slice(4, 8), la = p.slice(0, 4), ri = p.slice(9, 13), ra = p.slice(13, 17);
  aus[n || r] = {
    profil: p.map((v) => +v.toFixed(1)),
    sprung: +(mittel(ri) - mittel(li)).toFixed(1),
    hofLinks: +(mittel(li) - mittel(la)).toFixed(1),
    hofRechts: +(mittel(ri) - mittel(ra)).toFixed(1),
  };
}
console.log(JSON.stringify(aus, null, 1));
