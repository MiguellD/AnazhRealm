// 1910 S6-Takt: DER DREHZAHLMESSER (Seiten-Code für `werkbank eval`, r = Welt). Der echte Loop wie `lauf` (rAF, __wetterHalten,
// __ortSchritt, _gameLoopTick, Regler voll, Tiere frei); nach jedem Takt, AUSSERHALB der Takt-Spanne, eine feste Rechen-Last
// ohne Allokation und ohne Zeiger-Schreiben (128 Gänge Multiplizieren-Addieren über ein vorab angelegtes Float64Array(4096)).
// Läuft dieselbe Last langsamer, ist die Maschine langsamer (Takt-Frequenz, Cache); läuft sie gleich und der Spiel-Takt
// langsamer, liegt das Plus im Spiel-Code (Arbeit, JIT, GC-Schranken). window.__tachoSek (Standard 20).
const SEK = window.__tachoSek || 20;
const st = r.state;
const rend = st.renderer;
const sleep = (ms) => new Promise((s) => setTimeout(s, ms));
const N = 4096;
const feld = new Float64Array(N);
for (let i = 0; i < N; i++) feld[i] = (i % 97) * 0.001;
let senke = 0;
const last = () => {
    let s = 0;
    for (let g = 0; g < 128; g++) for (let i = 0; i < N; i++) s = s * 0.999999 + feld[i] * 1.000001;
    senke += s;
};
const MAX = SEK * 200 + 50;
const cpu = new Float64Array(MAX),
    tacho = new Float64Array(MAX);
let n = 0,
    messen = false;
const decke = st.perfTargetMs;
st.perfTargetMs = 1000;
window.__buehne();
rend.setAnimationLoop((t) => {
    window.__wetterHalten();
    const g0 = r._gpuLeine ? r._gpuLeine.gerendert : 0;
    const c0 = performance.now();
    if (window.__ortSchritt) window.__ortSchritt();
    r._gameLoopTick(t);
    const c1 = performance.now();
    last();
    const c2 = performance.now();
    if (!messen || n >= MAX) return;
    if (r._gpuLeine && !(r._gpuLeine.gerendert > g0)) return;
    cpu[n] = c1 - c0;
    tacho[n] = c2 - c1;
    n++;
});
try {
    await sleep(4000);
    messen = true;
    await sleep(SEK * 1000);
    messen = false;
} finally {
    rend.setAnimationLoop(null);
    st.perfTargetMs = decke;
}
const q = (a, p) => {
    const b = Array.from(a.subarray(0, n)).sort((x, y) => x - y);
    return +b[Math.min(b.length - 1, Math.floor(p * b.length))].toFixed(3);
};
const mit = (a) => +(a.subarray(0, n).reduce((x, y) => x + y, 0) / Math.max(1, n)).toFixed(4);
return {
    frames: n,
    cpu: { mittel: mit(cpu), p50: q(cpu, 0.5), p95: q(cpu, 0.95), p99: q(cpu, 0.99) },
    tacho: { mittel: mit(tacho), p50: q(tacho, 0.5), p95: q(tacho, 0.95) },
    senke: Number.isFinite(senke),
};
