// je Schritt |dLuma| im Boden-Bereich jenseits des Vordergrunds (Zeilen 20-56 %: der Boden ab ~25 m, die Nah-Wiese faellt raus)
const Sr = window.__serie, W = window.__W, H = window.__H;
const lum = (u, i) => 0.2126 * u[i] + 0.7152 * u[i + 1] + 0.0722 * u[i + 2];
const stufe = (a, b) => {
  const h = new Uint32Array(256); let n = 0, ueber = 0, sum = 0;
  const RG = window.__reg || [0.2, 0.56, 0, 1]; for (let y = Math.floor(H * RG[0]); y < Math.floor(H * RG[1]); y++) for (let x = Math.floor(W * RG[2]); x < Math.floor(W * RG[3]); x++) {
    const i = (y * W + x) * 4; const d = Math.min(255, Math.round(Math.abs(lum(a, i) - lum(b, i)))); h[d]++; n++; sum += d; if (d > 8) ueber++; }
  const q = (p) => { let c = 0; for (let k = 0; k < 256; k++) { c += h[k]; if (c >= p * n) return k; } return 255; };
  return { p995: q(0.995), p999: q(0.999), max: q(1), anteil8: +(ueber / n).toFixed(5), mittel: +(sum / n).toFixed(3) };
};
const out = { rauschen: Sr.r0 ? stufe(Sr.r0, Sr[0]) : null, schritte: [] };
for (let i = 1; Sr[i]; i++) out.schritte.push(stufe(Sr[i - 1], Sr[i]));
out.sprung = Math.max(...out.schritte.map((t) => t.p999));
out.sprungAnteil = Math.max(...out.schritte.map((t) => t.anteil8));
return out;
