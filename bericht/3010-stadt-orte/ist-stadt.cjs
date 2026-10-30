// Ist-Messung der Stadt (w4-stadt-orte, Schritt 1): je Mess-Stadt die Zahlen des Exports am Grund der Welt.
// node ist-stadt.cjs <repo>
"use strict";
const path = require("path");
const root = process.argv[2] || process.cwd();
const { studioKern } = require(path.join(root, "scripts/lib/welt-boot.cjs"));
const FC = studioKern("fachwerk-core.js", "__fachwerkCore");
require(path.join(root, "gelaende-core.js"));
const GN = globalThis.__gelaendeCore;
const WS = "anazh-realm-seed";
const L = GN.lageGrund(WS, require(path.join(root, "vendor/simplex-noise.js")));
const fnv = (s) => {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
    return h;
};
const zelle = (cx, cz) => FC.siedlungsZelle(FC.SIEDLUNG, cx, cz, (x, z) => fnv(`${WS}:dorf:${x},${z}`), new Map());
const orte = [];
orte.push({ id: "stadt (dorf 7 120)", dp: { seed: 7, nH: 120 }, ort: { x: 663, z: 423 } });
orte.push({ id: "stadt-voll (dorf 7 300)", dp: { seed: 7, nH: 300 }, ort: { x: 836.2, z: 438.5 } });
for (const [cx, cz, name] of [[2, -14, "hochhaus-dach"], [-2, -6, "Rang-Stadt K2"]]) {
    const q = zelle(cx, cz);
    if (q) orte.push({ id: `${name} (Zelle ${cx},${cz})`, dp: { seed: q.seed, nH: q.nH, epoche: FC.siedlungsEpoche(q.seed) }, ort: { x: q.x, z: q.z } });
}
orte.push({ id: "Golden Dorf (7,12)", dp: { seed: 7, nH: 12 }, ort: null });

const segAbst = (P, x, z) => {
    let d = Infinity;
    for (let k = 0; k + 1 < P.length; k++) {
        const A = P[k], B = P[k + 1], dx = B.x - A.x, dz = B.z - A.z, L2 = dx * dx + dz * dz;
        let t = L2 > 1e-9 ? ((x - A.x) * dx + (z - A.z) * dz) / L2 : 0;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        d = Math.min(d, Math.hypot(x - A.x - dx * t, z - A.z - dz * t));
    }
    return d;
};
const lang = (P) => P.reduce((s, q, i) => (i ? s + Math.hypot(q.x - P[i - 1].x, q.z - P[i - 1].z) : 0), 0);
for (const o of orte) {
    const dp = Object.assign({}, o.dp);
    if (o.ort) {
        const r = FC.trasseRahmen(dp.nH);
        dp.hoehe = GN.hoehenRaster(L, o.ort.x, o.ort.z, r);
    }
    const t0 = Date.now();
    const P = FC.exportSettlement(dp);
    const ms = Date.now() - t0;
    // Straßen-Rang: die Klassen des Exports (gen · quer · Breite)
    const klassen = {};
    for (const rd of P.roads) {
        const k = `gen${rd.gen}${rd.quer ? "q" : ""}`;
        const K = (klassen[k] = klassen[k] || { n: 0, m: 0, w: [] });
        K.n++;
        K.m += lang(rd.pts);
        K.w.push(rd.w);
    }
    for (const k in klassen) {
        const w = klassen[k].w.sort((a, b) => a - b);
        klassen[k] = { n: klassen[k].n, m: Math.round(klassen[k].m), w: [w[0], w[w.length - 1]].map((v) => +v.toFixed(2)) };
    }
    // die Breiten-Stufen: wie viele verschiedene Breiten (gerundet 0,1 m) — eine Hierarchie hat wenige
    const breiten = new Set(P.roads.map((rd) => rd.w.toFixed(1))).size;
    // Häuser an der Straße: die Tür (Slot-Rahmen) näher als halbe Breite + Gehweg + 2,5 m an einer Straße
    const wege = P.roads.concat(P.feldwege || []);
    let an = 0, anHaupt = 0;
    const tuerWelt = (sl) => {
        const c = Math.cos(sl.phi), s = Math.sin(sl.phi), t = sl.tuer || { x: 0, z: 0 };
        return { x: sl.x + t.x * c + t.z * s, z: sl.z - t.x * s + t.z * c };
    };
    const abst = [];
    for (const sl of P.slots) {
        const tw = tuerWelt(sl);
        let best = Infinity, bestRd = null;
        for (const rd of wege) {
            const d = segAbst(rd.pts, tw.x, tw.z) - (rd.w || 3) / 2;
            if (d < best) [best, bestRd] = [d, rd];
        }
        abst.push(best);
        if (best <= FC.DORF_NORM.gehweg + 2.5) {
            an++;
            if (bestRd && bestRd.gen === 0) anHaupt++;
        }
    }
    abst.sort((a, b) => a - b);
    // Sektoren: die Rollen der Slots, Gewerbe-Sektor
    const rollen = {};
    for (const sl of P.slots) rollen[sl.rolle || "?"] = (rollen[sl.rolle || "?"] || 0) + 1;
    // freie Flächen: Platz, Äcker, Hülle der Welt, Grundrisse
    const flaeche = (o) => 4 * o.ex * o.ez;
    const w = P.welt;
    const welt = (w.x1 - w.x0) * (w.z1 - w.z0);
    const haeuser = P.slots.reduce((s, sl) => s + (sl.obb ? flaeche(sl.obb) : 0), 0);
    const strassen = P.roads.reduce((s, rd) => s + lang(rd.pts) * rd.w, 0);
    const platz = P.platz ? flaeche(P.platz) : 0;
    const felder = (P.felder || []).reduce((s, f) => s + flaeche(f), 0);
    console.log(
        JSON.stringify({
            ort: o.id,
            groesse: P.groesse,
            staedtisch: P.staedtisch,
            jahr: P.jahr,
            slots: P.slots.length,
            ms,
            strassen: { n: P.roads.length, klassen, breitenStufen: breiten, feldwege: (P.feldwege || []).length, graph: P.graph },
            anStrasse: { anteil: +(an / P.slots.length).toFixed(3), an, anHaupt, tuerAbstMedian: +abst[abst.length >> 1].toFixed(2), tuerAbstP90: +abst[Math.floor(abst.length * 0.9)].toFixed(2) },
            rollen,
            flaechen: {
                weltM2: Math.round(welt),
                haeuser: +(haeuser / welt).toFixed(3),
                strassen: +(strassen / welt).toFixed(3),
                platzM2: Math.round(platz),
                platzTyp: P.platz ? P.platz.typ : null,
                felderM2: Math.round(felder),
                orte: P.orte ? P.orte.map((q) => q.rolle) : [],
            },
            quartiere: P.quartiere ? P.quartiere.map((q) => q.rolle + ":" + q.slots) : null,
            mauer: !!P.mauer,
        })
    );
}
