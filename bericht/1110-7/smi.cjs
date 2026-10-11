// Mittel von Takt (MHz) und Temperatur (°C) aus nvidia-smi --format=csv,noheader,nounits (Spalten: clocks.gr, temperature.gpu)
const z = require("fs").readFileSync(process.argv[2], "utf8").trim().split(/\r?\n/).map((l) => l.split(",").map(Number));
const ok = z.filter((r) => r.length >= 2 && r.every(Number.isFinite));
const m = (i) => ok.reduce((a, r) => a + r[i], 0) / ok.length;
console.log(`${m(0).toFixed(0)} MHz ${m(1).toFixed(0)} C (n=${ok.length})`);
