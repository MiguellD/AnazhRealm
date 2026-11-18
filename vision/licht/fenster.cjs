const src = require("fs").readFileSync(__dirname + "/rechnung.cjs", "utf8");
const lib = src.slice(src.indexOf("function lichtFarbe"), src.indexOf("for (const K of"));
const f = (x, n = 4) => Number(x.toPrecision(n));
eval(lib + `
for (const K of [1667, 1900, 2000, 2400, 2800]) {
  const c = lichtFarbe(K), lu = 0.2126*c[0]+0.7152*c[1]+0.0722*c[2];
  let ok = [], hue28 = null, sat75 = null;
  for (let e = -40; e <= 30; e++) { const L = Math.pow(2, e/10); const o = neutral(c.map(v=>v/lu*L)).map(enc); const [h,s] = hs(o);
    if (hue28 === null && h < 28) hue28 = L; if (sat75 === null && s <= 0.75) sat75 = L;
    if (h >= 28 && h <= 45 && s <= 0.75) ok.push(f(L,3)); }
  console.log(K + " K: Farbton fällt unter 28° ab k·L-Luma " + f(hue28 ?? NaN,3) + "; Sättigung erst ≤ 0,75 ab " + f(sat75 ?? NaN,3) + "; Fenster beider: " + (ok.length ? ok[0] + "…" + ok[ok.length-1] : "leer"));
}`);
