// GLEICH-PROBE: das Raster der Knoten nennt dieselben k Nächsten in derselben Folge wie die Ordnung aller (je Siedlung 400
// Proben um ihre Knoten, Γ-frei: ein fester LCG), dazu die Naht-Paare des Rasters gegen alle Paare
const A = AnazhRealm;
let s = 12345;
const rnd = () => ((s = (s * 1103515245 + 12345) >>> 0) / 4294967296);
const aus = [];
for (const S of (r._bewohnerSiedlungen || new Map()).values()) {
    if (!S.netz) continue;
    const N = S.netz;
    let ungleich = 0, proben = 0;
    for (let n = 0; n < 400; n++) {
        const q = N.knoten[Math.floor(rnd() * N.knoten.length)];
        const o = { x: q.x + (rnd() - 0.5) * 80, z: q.z + (rnd() - 0.5) * 80 };
        const a = r._bewohnerKnotenNaechste(N, o, A.BEWOHNER.anschlussN).map((c) => c.i).join(",");
        const b = N.knoten.map((p, i) => ({ i, d: (p.x - o.x) ** 2 + (p.z - o.z) ** 2 })).sort((x, y) => x.d - y.d).slice(0, A.BEWOHNER.anschlussN).map((c) => c.i).join(",");
        proben++;
        if (a !== b) ungleich++;
    }
    // die Paare bis naehtM: Raster gegen alle (für eine zufällige Teilung: Knoten mit gerader Nummer gegen ungerade)
    const K = N.knoten, N2 = A.BEWOHNER.naehtM ** 2;
    const alle = [];
    for (let i = 0; i < K.length; i += 2) for (let j = 1; j < K.length; j += 2) { const d = (K[i].x - K[j].x) ** 2 + (K[i].z - K[j].z) ** 2; if (d <= N2) alle.push([d, i, j]); }
    alle.sort((p, q) => p[0] - q[0]);
    const { M, R } = N.raster;
    const ras = [];
    for (let i = 0; i < K.length; i += 2) { const [cx, cz] = [Math.floor(K[i].x / M), Math.floor(K[i].z / M)]; for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) for (const j of R.get((cx + dx) * 2097152 + cz + dz) || []) { if (j % 2 === 0) continue; const d = (K[i].x - K[j].x) ** 2 + (K[i].z - K[j].z) ** 2; if (d <= N2) ras.push([d, i, j]); } }
    ras.sort((p, q) => p[0] - q[0] || p[1] - q[1] || p[2] - q[2]);
    aus.push({ key: S.key, knoten: K.length, proben, ungleich, paare: alle.length, paareGleich: JSON.stringify(alle) === JSON.stringify(ras) });
}
return aus;
