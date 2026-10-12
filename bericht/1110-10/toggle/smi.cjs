// Median-Takt und Temperatur aus einer nvidia-smi-CSV (clocks.gr, temperature.gpu je Zeile)
const z = require("fs").readFileSync(process.argv[2], "utf8").trim().split(/\r?\n/).map((l) => l.split(",").map(Number)).filter((a) => a.length >= 2 && a[0] > 300);
const med = (a) => { const b = a.slice().sort((x, y) => x - y); return b.length ? b[b.length >> 1] : NaN; };
console.log(`${med(z.map((a) => a[0]))}MHz ${med(z.map((a) => a[1]))}C n${z.length}`);
