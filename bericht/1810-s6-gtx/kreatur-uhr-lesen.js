// 1810 S6: liest die Uhr des KI-Takts (kreatur-uhr-an.js) seit dem letzten Lesen und leert sie: n, Mittel, p50/p95/p99, max (ms).
const u = window.__kiUhr;
if (!u) return null;
const a = u.ms.slice().sort((x, y) => x - y);
u.ms.length = 0;
const q = (p) => (a.length ? +a[Math.min(a.length - 1, Math.floor(p * a.length))].toFixed(3) : null);
const s = a.reduce((x, y) => x + y, 0);
return { n: a.length, mittel: a.length ? +(s / a.length).toFixed(4) : null, p50: q(0.5), p95: q(0.95), p99: q(0.99), max: a.length ? +a[a.length - 1].toFixed(2) : null };
