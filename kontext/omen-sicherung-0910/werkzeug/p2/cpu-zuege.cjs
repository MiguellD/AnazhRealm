// CPU je Aufruf der zwei Züge (Vortiefe der TRAA, Tiefen-Abbild) in der laufenden Werkbank-Welt: node cpu-zuege.cjs <port> [frames]
// Die Welt ruht zwischen den Befehlen; die Messung fährt den echten Frame (`_gameLoopTick`, 60 Hz) und misst je Aufruf
// performance.now() um den Zug (JS + WebGPU-Kodierung + Einreichen, die CPU-Seite).
const http = require("http");
const [port, framesArg] = process.argv.slice(2);
const N = Number(framesArg || 300);
const code = `
const st = r.state, rend = st.renderer;
const traa = st.traaNode;
const tief = traa && traa._historyRenderTarget && traa._historyRenderTarget.depthTexture;
if (!tief) return { fehler: "keine TRAA-Geschichte" };
const mVt = [], mAb = [];
const roh = rend.copyTextureToTexture;
rend.copyTextureToTexture = function (von, nach, ...rest) {
  if (nach !== tief) return roh.call(this, von, nach, ...rest);
  const t0 = performance.now(); const o = roh.call(this, von, nach, ...rest); mVt.push(performance.now() - t0); return o;
};
const abRoh = r._tiefenAbbild;
r._tiefenAbbild = function (...a) { const t0 = performance.now(); const o = abRoh.apply(this, a); mAb.push(performance.now() - t0); return o; };
let t = performance.now();
const mFrame = [];
try {
  for (let i = 0; i < ${N}; i++) {
    t += 1000 / 60;
    const t0 = performance.now();
    if (rend._nodes && rend._nodes.nodeFrame) rend._nodes.nodeFrame.update();
    r._loopRender(t);
    mFrame.push(performance.now() - t0);
    if (i % 30 === 29) await new Promise((q) => setTimeout(q, 5));
  }
} finally {
  rend.copyTextureToTexture = roh;
  delete r._tiefenAbbild;
}
const stat = (a) => { const s = a.slice(30).sort((x, y) => x - y); if (!s.length) return null; const m = s.reduce((x, y) => x + y, 0) / s.length; return { n: a.length, median_us: +(s[Math.floor(s.length / 2)] * 1000).toFixed(1), mittel_us: +(m * 1000).toFixed(1), p90_us: +(s[Math.floor(s.length * 0.9)] * 1000).toFixed(1) }; };
return { vortiefe: stat(mVt), abbild: stat(mAb), frame_ms_median: +(mFrame.slice(30).sort((x, y) => x - y)[Math.floor((mFrame.length - 30) / 2)]).toFixed(2) };`;
const req = http.request({ host: "127.0.0.1", port: Number(port), path: "/eval", method: "POST", headers: { "Content-Type": "application/json" } }, (res) => {
    let d = "";
    res.on("data", (c) => (d += c));
    res.on("end", () => console.log(d));
});
req.end(JSON.stringify({ code }));
