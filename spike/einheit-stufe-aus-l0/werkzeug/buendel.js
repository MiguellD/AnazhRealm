// DIE STUFE AUS DER L0 (Spike, nicht Gesetz): Ecken-Bündelung je Netz (= je Stoff) in Zellen der Kante `s` (ein Bildpunkt an der
// Stufen-Grenze: d ÷ Brennweite) und je Richtung der Normale (sechs Achsen, damit Flächen verschiedener Lage nie verschmelzen).
// Lage, Normale (neu normiert), Farbe und uv mitteln sich in die Zelle — das Mittel der Teile unter einem Bildpunkt geht in die Fläche,
// die sie trugen; jedes andere Attribut nimmt die erste Ecke der Zelle; ein Dreieck mit zwei Ecken in derselben Zelle fällt.
// buendel(netze, s) → neue Netze im Format des Foundry-Fadens ({ kind, mat, <attr>: { array, itemSize }, index })
function buendel(netze, s) {
    const MITTEL = { position: 1, normal: 1, color: 1, uv: 1 };
    const aus = [];
    for (const m of netze) {
        if (!m || !m.position || !m.position.array || !m.index) {
            aus.push(m);
            continue;
        }
        const P = m.position.array, N = m.normal && m.normal.array, n = P.length / 3;
        const attrs = Object.keys(m).filter((k) => m[k] && m[k].array && m[k].itemSize && m[k].array.length === n * m[k].itemSize);
        const zelle = new Map(), von = new Int32Array(n);
        for (let i = 0; i < n; i++) {
            let r = 0;
            if (N) {
                const ax = Math.abs(N[i * 3]), ay = Math.abs(N[i * 3 + 1]), az = Math.abs(N[i * 3 + 2]);
                r = ax >= ay && ax >= az ? (N[i * 3] > 0 ? 0 : 1) : ay >= az ? (N[i * 3 + 1] > 0 ? 2 : 3) : N[i * 3 + 2] > 0 ? 4 : 5;
            }
            const key = Math.floor(P[i * 3] / s) + "," + Math.floor(P[i * 3 + 1] / s) + "," + Math.floor(P[i * 3 + 2] / s) + "," + r;
            let z = zelle.get(key);
            if (z === undefined) zelle.set(key, (z = zelle.size));
            von[i] = z;
        }
        const nz = zelle.size, neu = {};
        for (const a of attrs) neu[a] = new Float32Array(nz * m[a].itemSize);
        const zahl = new Uint32Array(nz), erste = new Int32Array(nz).fill(-1);
        for (let i = 0; i < n; i++) {
            const z = von[i];
            zahl[z]++;
            if (erste[z] < 0) erste[z] = i;
            for (const a of attrs) {
                if (!MITTEL[a]) continue;
                const k = m[a].itemSize;
                for (let j = 0; j < k; j++) neu[a][z * k + j] += m[a].array[i * k + j];
            }
        }
        for (let z = 0; z < nz; z++)
            for (const a of attrs) {
                const k = m[a].itemSize;
                if (MITTEL[a]) for (let j = 0; j < k; j++) neu[a][z * k + j] /= zahl[z];
                else for (let j = 0; j < k; j++) neu[a][z * k + j] = m[a].array[erste[z] * k + j];
                if (a === "normal") {
                    const l = Math.hypot(neu.normal[z * 3], neu.normal[z * 3 + 1], neu.normal[z * 3 + 2]) || 1;
                    for (let j = 0; j < 3; j++) neu.normal[z * 3 + j] /= l;
                }
            }
        const I = m.index, idx = [], gesehen = new Set();
        for (let t = 0; t < I.length; t += 3) {
            const a = von[I[t]], b = von[I[t + 1]], c = von[I[t + 2]];
            if (a === b || b === c || a === c) continue;
            // dieselbe Fläche mit derselben Wicklung fällt einmal (zyklisch gedreht, die kleinste Ecke vorn — die Wicklung bleibt)
            const k = a < b && a < c ? [a, b, c] : b < c ? [b, c, a] : [c, a, b];
            const key = k[0] + "," + k[1] + "," + k[2];
            if (gesehen.has(key)) continue;
            gesehen.add(key);
            idx.push(a, b, c);
        }
        const o = { kind: m.kind, mat: m.mat };
        for (const a of attrs) o[a] = { array: neu[a], itemSize: m[a].itemSize };
        o.index = nz > 65535 ? Uint32Array.from(idx) : Uint16Array.from(idx);
        if (o.index.length) aus.push(o);
    }
    return aus;
}
