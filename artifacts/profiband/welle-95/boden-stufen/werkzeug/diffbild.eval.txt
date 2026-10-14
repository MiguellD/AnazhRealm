const Sr = window.__serie, W = window.__W, H = window.__H, a = Sr[window.__da], b = Sr[window.__db];
const cv = document.createElement("canvas"); cv.width = W / 2; cv.height = H / 2; const ctx = cv.getContext("2d"); const img = ctx.createImageData(W / 2, H / 2);
for (let y = 0; y < H / 2; y++) for (let x = 0; x < W / 2; x++) { const i = (y * 2 * W + x * 2) * 4, o = (y * W / 2 + x) * 4;
  const d = Math.abs(0.2126 * (a[i] - b[i]) + 0.7152 * (a[i + 1] - b[i + 1]) + 0.0722 * (a[i + 2] - b[i + 2]));
  img.data[o] = Math.min(255, d * 4); img.data[o + 1] = Math.min(255, 0.25 * (0.2126 * a[i] + 0.7152 * a[i + 1] + 0.0722 * a[i + 2])); img.data[o + 2] = 0; img.data[o + 3] = 255; }
ctx.putImageData(img, 0, 0); return cv.toDataURL("image/png");
