// bild-abstand.cjs <ort> <umstellen.json> — der Abstand Spieler → Blick des Orts (wie gpu-probe `bild_probe`)
const path = require("path");
const u = require(process.argv[3]);
const o = require(path.resolve("C:/AnazhRealm/spec/profiband/haushalt.json")).messorte.find((x) => x.id === process.argv[2]);
const [s, b] = [u.spieler || o.spieler, u.blick || o.blick];
console.log(Math.hypot(b[0] - s[0], b[1] - s[1]).toFixed(1));
