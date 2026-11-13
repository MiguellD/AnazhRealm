const fs = require("fs"), path = require("path");
const S = process.argv[2] || "."; // der Ordner mit bc1-<art>.json (werkbank eval bc1-lesen.js)
const { kernAusText } = require(path.join(__dirname, "..", "..", "scripts/lib/") + "asset-worker-harness.cjs");
const { pngLesen } = require(path.join(__dirname, "..", "..", "scripts/lib/") + "abnahme-urteil.cjs");
const { execSync } = require("child_process");
const PC = kernAusText(execSync("git -C " + path.join(__dirname, "..", "..") + " show 1cd1c408:phyto-core.js", { encoding: "utf8", maxBuffer: 64 << 20 }), "__phytoCore");
for (const art of ["buche", "fichte"]) {
  const g = JSON.parse(fs.readFileSync(`${S}/bc1-${art}.json`, "utf8")).ergebnis;
  const meta = JSON.parse(fs.readFileSync(`${__dirname}/abzug/${art}.json`, "utf8"));
  const alb = pngLesen(fs.readFileSync(`${__dirname}/abzug/${art}-albedo.png`)).u8;
  const saum = { seite: meta.saum[1], fuss: meta.saum[5], nadel: meta.saum[8] > 0.5 };
  const sum = [0, 1, 2].map(() => ({ gleich: 0, n: 0, gpu: 0, cpu: 0 }));
  for (let v = 0; v < 8; v++) {
    const rgba = new Uint8Array(128 * 256 * 4);
    for (let i = 0; i < 128 * 256; i++) rgba[i * 4 + 3] = alb[(v * 128 * 256 + i) * 4 + 3];
    const st = PC.impostorMips(rgba, 128, 256, 1, null, 6, { saum }).stufen;
    for (const k of [0, 1, 2]) {
      const G = Buffer.from(g.out["k" + k].b64, "base64");
      const w = 128 >> k, h = 256 >> k, y0 = (512 + v * 256) >> k;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const a = G[(y0 + y) * w + x] ? 1 : 0, b = st[k].data[(y * w + x) * 4 + 3] ? 1 : 0;
        sum[k].n++; sum[k].gleich += a === b; sum[k].gpu += a; sum[k].cpu += b;
      }
    }
  }
  sum.forEach((s, k) => console.log(art, "Stufe", k, "gleich", (s.gleich / s.n).toFixed(5), "abweichend", s.n - s.gleich, "von", s.n, "gewählt GPU", s.gpu, "CPU", s.cpu));
}
