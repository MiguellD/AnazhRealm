// Fluss-Spike (Kopie, kein Kern): Priority-Flood (Barnes, Lehman & Mulla 2014) über das Netz der Ebene 0.
const path = require("path"), fs = require("fs");
const D = __dirname, W = process.argv[2], R_KM = +(process.argv[3] || 160);
const H = require(path.join(W, "scripts/lib/asset-worker-harness.cjs"));
const c = H.kernAusText([fs.readFileSync(path.join(D, "simplex.js"), "utf8"), fs.readFileSync(path.join(D, "gelaende-kopie.js"), "utf8")]);
const G = c.__gelaendeCore, X = G.__spike, g = G.GRUND;
const L = G.lageAus({ seed: "anazh-realm-seed", baseHeight: g.basis, waterLevel: g.basis - g.meerUnterBasis, ort: null,
  erbgut: { terme: G.erbgutNormal(undefined), wildnis: 1 }, regionSize: g.kachel }, c.SimplexNoise);
const MX = -280.4, MZ = -1045.6;
const N = X.netzFuer(L), S = N.S[0], S2 = S * S;
const n = Math.ceil((R_KM * 1000) / S), i0 = Math.floor(MX / S) - n, j0 = Math.floor(MZ / S) - n, B = 2 * n + 1, M = B * B;
let t = Date.now();
const kn = new Array(M), hp = new Float64Array(M);
for (let b = 0; b < B; b++) for (let a = 0; a < B; a++) { const k = X.knoten(N, 0, i0 + a, j0 + b); kn[b * B + a] = k; hp[b * B + a] = X.knotenHp(N, k); }
const tHoehe = Date.now() - t;
// HEUTE: D8 + Senken (knotenFluss, knotenA) — Ende je Land-Knoten
t = Date.now();
const A0 = new Float64Array(M), ende0 = new Uint8Array(M); // 1 see 2 meer 3 rand
for (let q = 0; q < M; q++) A0[q] = X.knotenA(N, kn[q]);
const tHeute = Date.now() - t;
const idx = (k) => { const a = k.i - i0, b = k.j - j0; return a >= 0 && b >= 0 && a < B && b < B ? b * B + a : -1; };
for (let q = 0; q < M; q++) { let k = kn[q], s = 0; for (; s < 4096; s++) { const f = X.knotenFluss(N, k); if (!f) break; if (idx(f) < 0) { ende0[q] = 3; break; } k = f; } if (!ende0[q]) ende0[q] = k.senke === 2 ? 2 : 1; }
// PRIORITY-FLOOD: Saaten = Meer-Knoten (hp < wl) und der Rand; Füllung bis zur Schwelle, Abfluss über den tiefsten Sattel
t = Date.now();
const fill = new Float64Array(M), dir = new Int32Array(M).fill(-2), ord = new Int32Array(M); let no = 0;
const heap = []; const push = (q) => { heap.push(q); let i = heap.length - 1; while (i) { const p = (i - 1) >> 1; if (fill[heap[p]] <= fill[q]) break; heap[i] = heap[p]; i = p; } heap[i] = q; };
const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { let i = 0; for (;;) { let l = 2 * i + 1, r = l + 1, m = i; if (l < heap.length && fill[heap[l]] < fill[last]) m = l; if (r < heap.length && fill[heap[r]] < (m === i ? fill[last] : fill[heap[m]])) m = r; if (m === i) break; heap[i] = heap[m]; i = m; } heap[i] = last; } return top; };
for (let q = 0; q < M; q++) { const a = q % B, b = (q / B) | 0; if (hp[q] < N.wl || a === 0 || b === 0 || a === B - 1 || b === B - 1) { fill[q] = hp[q]; dir[q] = -1; push(q); } }
while (heap.length) { const q = pop(); ord[no++] = q; const a = q % B, b = (q / B) | 0;
  for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { if (!di && !dj) continue; const aa = a + di, bb = b + dj; if (aa < 0 || bb < 0 || aa >= B || bb >= B) continue; const m = bb * B + aa; if (dir[m] !== -2) continue; fill[m] = Math.max(hp[m], fill[q]); dir[m] = q; push(m); } }
// der Abfluss: ausserhalb der Mulden das D8 von heute (wenn sein Unterlieger nicht in einer Mulde liegt), sonst der Flood-Baum
const A1 = new Float64Array(M).fill(1), ende1 = new Uint8Array(M);
for (let r = M - 1; r >= 0; r--) { const q = ord[r]; if (dir[q] >= 0) A1[dir[q]] += A1[q]; }
for (let r = 0; r < M; r++) { const q = ord[r]; ende1[q] = dir[q] === -1 ? (hp[q] < N.wl ? 2 : 3) : ende1[dir[q]]; }
const tFlood = Date.now() - t;
const land = (q) => hp[q] >= N.wl;
function auswert(A, ende, R) {
  const r = Math.ceil(R / S); let rand = 0, naechst = null, laufZell = 0, landN = 0, see = 0, best = 0;
  for (let b = n - r; b <= n + r; b++) for (let a = n - r; a <= n + r; a++) { const q = b * B + a; if (!land(q)) continue; const k = kn[q]; if (Math.abs(k.x - MX) > R || Math.abs(k.z - MZ) > R) continue;
    landN++; if (ende[q] === 1) see++; if (ende[q] === 3) rand++; const Am = A[q] * S2, br = X.flussBreite(Am); if (br > best) best = br;
    if (X.gewaesserArt(br) === "fluss") { laufZell++; const d = Math.hypot(k.x - MX, k.z - MZ); if (!naechst || d < naechst.dm) naechst = { dm: d, x: +k.x.toFixed(0), z: +k.z.toFixed(0), breite: +br.toFixed(1), Akm2: +(Am / 1e6).toFixed(1), d: +(d / 1000).toFixed(2) }; } }
  return { landKnoten: landN, flussKnoten: laufZell, naechst, groessteBreite: +best.toFixed(1), anteilSenkeFlaeche: +(see / landN).toFixed(4), anteilRand: +(rand / landN).toFixed(4) };
}
// Läufe ≥ 27,8 m: getrennte Flusssysteme (Mündungs-Knoten der Kette) mit einem Fluss-Knoten im Fenster
function systeme(A, R, nachD) { const s = new Set(); for (let q = 0; q < M; q++) { if (!land(q) || X.gewaesserArt(X.flussBreite(A[q] * S2)) !== "fluss") continue; const k = kn[q]; if (Math.abs(k.x - MX) > R || Math.abs(k.z - MZ) > R) continue; let z = q; for (let u = 0; u < 1e5; u++) { const d = nachD(z); if (d < 0 || !land(d)) break; z = d; } s.add(z); } return s.size; }
const d0 = (q) => { const f = X.knotenFluss(N, kn[q]); return f ? idx(f) : -1; }, d1 = (q) => dir[q];
// Messorte: Muldentiefe am nächsten Knoten der Ebene 0 (Spiegel nach der Füllung − Grundhöhe)
const orte = { wiese: [-280.4, -1045.6], genesis: [0, 0], dorf: [-841, -861], buehne: [300, 0], "hochhaus-dach": [696.6, -3558.7], "gipfel-blick": [-433.6, -3146.4] };
const ortAus = {}; for (const [o, [x, z]] of Object.entries(orte)) { let bq = -1, bd = 1e18; for (let b = n - 4; b <= n + 4; b++) for (let a = n - 4; a <= n + 4; a++) { const q = b * B + a, d = Math.hypot(kn[q].x - x, kn[q].z - z); if (d < bd) { bd = d; bq = q; } }
  ortAus[o] = { knotenAbstand_m: +bd.toFixed(0), hp: +hp[bq].toFixed(4), spiegelNach: +fill[bq].toFixed(4), muldeTiefe_m: +(fill[bq] - hp[bq]).toFixed(4), A_vor_km2: +(A0[bq] * S2 / 1e6).toFixed(4), A_nach_km2: +(A1[bq] * S2 / 1e6).toFixed(4), ende_vor: ["?", "see", "meer", "rand"][ende0[bq]], ende_nach: ["?", "see", "meer", "rand"][ende1[bq]] }; }
let mulden = 0; for (let q = 0; q < M; q++) if (fill[q] > hp[q] && land(q)) mulden++;
const aus = { R_KM, S, knoten: M, wl: N.wl, ms: { hoehen: tHoehe, heute_knotenA: tHeute, flood: tFlood },
  vor: { r12: auswert(A0, ende0, 12000), r100: auswert(A0, ende0, 100000), systeme12: systeme(A0, 12000, d0), systeme100: systeme(A0, 100000, d0) },
  nach: { r12: auswert(A1, ende1, 12000), r100: auswert(A1, ende1, 100000), systeme12: systeme(A1, 12000, d1), systeme100: systeme(A1, 100000, d1), muldenKnotenAnteil: +(mulden / M).toFixed(4) }, orte: ortAus };
console.log(JSON.stringify(aus, null, 1));
// die Senke, in die der Ort HEUTE läuft: ihr Spiegel nach der Füllung (die Schwelle) und die Tiefe des Sees
const senken = {}; for (const [o, [x, z]] of Object.entries(orte)) { let bq = -1, bd = 1e18; for (let b = n - 4; b <= n + 4; b++) for (let a = n - 4; a <= n + 4; a++) { const q = b * B + a, d = Math.hypot(kn[q].x - x, kn[q].z - z); if (d < bd) { bd = d; bq = q; } }
  let k = kn[bq]; for (let s = 0; s < 4096; s++) { const f = X.knotenFluss(N, k); if (!f) break; k = f; } const q = idx(k);
  senken[o] = { senke: [+k.x.toFixed(0), +k.z.toFixed(0)], abstand_km: +(Math.hypot(k.x - x, k.z - z) / 1000).toFixed(2), art: k.senke, grund: +hp[q].toFixed(4), spiegelNach: +fill[q].toFixed(4), tiefe_m: +(fill[q] - hp[q]).toFixed(4), einzug_vor_km2: +(A0[q] * S2 / 1e6).toFixed(2), einzug_nach_km2: +(A1[q] * S2 / 1e6).toFixed(2) }; }
console.log("SENKEN " + JSON.stringify(senken));
{ const q0 = idx((() => { let k = kn[n * B + n]; for (;;) { const f = X.knotenFluss(N, k); if (!f) return k; k = f; } })()); const F = fill[q0]; let z = 0, wiese = null;
  for (let q = 0; q < M; q++) if (land(q) && fill[q] > hp[q] && Math.abs(fill[q] - F) < 1e-9) z++;
  const qw = n * B + n; console.log("SEE " + JSON.stringify({ knoten: z, flaeche_km2: +(z * S2 / 1e6).toFixed(2), spiegel: +F.toFixed(4), wieseKnoten: [+kn[qw].x.toFixed(0), +kn[qw].z.toFixed(0)], wieseHp: +hp[qw].toFixed(4), wieseFill: +fill[qw].toFixed(4) })); }
