const j = JSON.parse(require("fs").readFileSync(process.argv[2], "utf8"));
const LF = j.lf, WB = j.weltbildDa;
const an = new Map(LF.an.map((a) => [a[1], a]));
const rows = LF.s.map((s) => { const q = LF.q[s[0]] || []; const a = an.get(s[2]); return { req: s[2], bahn: String((/w(\d+)_/.exec(s[2]) || [0, 0])[1]), b5: a && a[7] ? a[7] : null, k: (q[1] || "?").split("#")[1], d: q[2], bl: q[3], tq: q[0], ts: s[1], tan: a ? a[0] : null, pl: a ? a[3] : null }; });
for (const b of ["0", "1", "2"]) {
  const r = rows.filter((x) => x.bahn === b && x.ts < WB + 2000).sort((x, y) => x.tan - y.tan);
  let vor = 0;
  console.log("=== Bahn w" + b);
  for (const x of r) { const st = Math.max(x.ts, vor); console.log(`  ${x.req.padEnd(7)} ${String(x.k).replace(/ov:[^|]+/, "ov").padEnd(28)} d${String(x.d).padStart(4)} b${x.bl} q${(x.tq/1000).toFixed(2)} s${(x.ts/1000).toFixed(2)} an${x.tan ? (x.tan/1000).toFixed(2) : "--"} bau ${x.tan ? x.tan - st : "--"}${x.pl ? " PLATTE" : ""}`); vor = x.tan || vor; }
}
