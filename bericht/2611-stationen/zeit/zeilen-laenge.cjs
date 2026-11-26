// die Befehlszeile je Station der Karte-2-Gerüste, wie punkte.cjs zeileLaenge sie zählt (Windows-Quotierung), Basis ↔ Kandidat
const path = require("path");
const zeileArg = (a) => { if (!a.length) return 2; if (!/[ \t"]/.test(a)) return a.length; if (!/["\\]/.test(a)) return a.length + 2; let n = a.length + 2; const re = /\\*"/g; let m; while ((m = re.exec(a))) n += m[0].length; n += /\\*$/.exec(a)[0].length; return n; };
const zeileLaenge = (argv) => argv.reduce((n, a) => n + zeileArg(String(a)), 0) + Math.max(0, argv.length - 1);
const exe = "C:\\Program Files\\nodejs\\node.exe";
const aus = {};
for (const dir of process.argv.slice(2)) {
  const je = {};
  for (const f of ["k2-planet", "k2-leben", "k2-zusammenspiel", "k2-same", "k2-erleben", "k2-kosmos", "k2-mensch"]) {
    const m = require(path.join(path.resolve(dir), f + ".js"));
    for (const s of m) { const b = (s.probe || s).befehl; je[s.kriterium + "#" + s.staffel] = { f, n: zeileLaenge([exe, ...b.slice(1)]) }; }
  }
  aus[dir] = je;
}
const [A, B] = Object.values(aus);
const fam = { "k2-planet": "Kern", "k2-leben": "Kern", "k2-zusammenspiel": "Kern", "k2-same": "Gerüst", "k2-erleben": "Gerüst", "k2-kosmos": "Gerüst", "k2-mensch": "Fabrik" };
const z = {};
for (const id of Object.keys(A)) { const k = fam[A[id].f]; const d = B[id].n - A[id].n; z[k] ||= { n: 0, dmin: 1e9, dmax: 0, maxA: 0, maxB: 0, tuerA: 0, tuerB: 0, ueberA: 0, ueberB: 0 }; const q = z[k]; q.n++; q.dmin = Math.min(q.dmin, d); q.dmax = Math.max(q.dmax, d); q.maxA = Math.max(q.maxA, A[id].n); q.maxB = Math.max(q.maxB, B[id].n); q.tuerA += A[id].n > 30000; q.tuerB += B[id].n > 30000; q.ueberA += A[id].n > 32766; q.ueberB += B[id].n > 32766; }
for (const [k, q] of Object.entries(z)) console.log(k + ": " + q.n + " Stationen · +" + q.dmin + "…+" + q.dmax + " Zeichen · längste " + q.maxA + " → " + q.maxB + " · durch die Tür (> 30 000) " + q.tuerA + " → " + q.tuerB + " · ohne Tür über 32 766: " + q.ueberA + " → " + q.ueberB);
