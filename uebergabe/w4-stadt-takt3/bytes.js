// BYTE-PROBE: je Bewohner (Same) das Bein seines Gang-Gesetzes (L, wpl, wz) und sein Tempo als Float64-Bytes, je Gestalt der
// gebackene Gang-Satz (Knochen-Puffer und Lagen) als Bytes — je Siedlung ein FNV-1a-Abdruck und die Zahl der Glieder
const fnv = (h, bytes) => {
    for (let i = 0; i < bytes.length; i++) h = Math.imul(h ^ bytes[i], 16777619) >>> 0;
    return h;
};
const f64 = (a) => new Uint8Array(Float64Array.from(a).buffer);
const aus = [];
for (const S of (r._bewohnerSiedlungen || new Map()).values()) {
    if (!S.liste) continue;
    const L = [...S.liste].sort((a, b) => (a.seed < b.seed ? -1 : a.seed > b.seed ? 1 : 0));
    let hB = 2166136261, nB = 0;
    for (const b of L) {
        if (!b.leib) continue;
        // das Bein: neu am Halter (`beinMass`), alt am Rig des Leibs (`_gaitBeinMass`)
        const M = b.beinMass || (b.leib.userData.rig && r._gaitBeinMass(b.leib.userData.rig));
        if (!M) continue;
        hB = fnv(hB, f64([M.l1, M.l2, M.wpl, M.wz, M.L, b.beinL, b.tempo]));
        nB++;
    }
    let hS = 2166136261, nS = 0, fertig = 0;
    for (const G of S.gestalten || []) {
        const Z = G.satz;
        if (!Z || !Z.fertig) continue;
        fertig++;
        hS = fnv(hS, new Uint8Array(Z.tex.image.data.buffer));
        hS = fnv(hS, new Uint8Array(Z.lagen.buffer));
        nS++;
    }
    aus.push({ key: S.key, bewohner: nB, bein: hB.toString(16), saetze: nS, satz: hS.toString(16), fertig });
}
return aus;
