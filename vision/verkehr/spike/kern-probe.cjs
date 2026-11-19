"use strict";
// kern-probe — Probe des Kern-Schnitts (kern-schnitt.diff): node kern-probe.cjs <kern-ordner> <parkB|-> → sha256 von kachelMassen über die Kacheln zweier Städte; mit
// Messung: Häuser in einer Trasse (Ecke des Grundrisses näher an einer Straßenmitte als w/2 + saum), Parkstreifen-Platz
const path = require("path"), crypto = require("crypto");
require(path.join(process.argv[2], "fachwerk-core.js"));
const FC = globalThis.__fachwerkCore;
if (process.argv[3] !== "-") FC.VERKEHR_GESETZ.parkB = Number(process.argv[3]);
const h = crypto.createHash("sha256"), out = { parkB: FC.VERKEHR_GESETZ.parkB, kacheln: 0, haeuser: 0, hausInTrasse: 0, minFassadeUeberTrasseM: Infinity, saumGen0: {}, stellenJeKachel: [] };
for (const [nH, R, sch] of [[1641, 2, 1], [100000, 22, 7]]) {
    for (let i = -R; i <= R; i += sch)
        for (let k = -R; k <= R; k += sch) {
            const Mm = FC.kachelMassen(7, nH, i, k);
            if (!Mm) continue;
            out.kacheln++;
            h.update(JSON.stringify({ n: Mm.n, lage: Array.from(Mm.lage), strassen: Mm.strassen, plaetze: Mm.plaetze }));
            const netz = FC.kachelNetz(7, i, k);
            let parkL = 0;
            Mm.strassen.forEach((s, e) => {
                if (netz.edges[e].gen === 0) {
                    const key = s.belag + " " + Math.round(s.saum * 100) / 100;
                    out.saumGen0[key] = (out.saumGen0[key] || 0) + 1;
                    for (let j = 0; j + 3 < s.p.length; j += 2) parkL += 2 * Math.hypot(s.p[j + 2] - s.p[j], s.p[j + 3] - s.p[j + 1]);
                }
            });
            out.stellenJeKachel.push(Math.floor(parkL / FC.VERKEHR_GESETZ.parkL));
            for (let r = 0; r < Mm.n; r++) {
                const L = Mm.lage, x = L[r * 7], z = L[r * 7 + 1], g = L[r * 7 + 2], a = L[r * 7 + 3] / 2, b = L[r * 7 + 4] / 2, ux = Math.cos(g), uz = -Math.sin(g);
                out.haeuser++;
                let drin = false;
                for (const [sa, sb] of [[-1, -1], [-1, 1], [1, -1], [1, 1], [0, -1], [0, 1], [-1, 0], [1, 0]]) {
                    const cx = x + ux * a * sa - uz * b * sb, cz = z + uz * a * sa + ux * b * sb;
                    for (const s of Mm.strassen)
                        for (let j = 0; j + 3 < s.p.length; j += 2) {
                            const ax = s.p[j], az = s.p[j + 1], bx = s.p[j + 2] - ax, bz = s.p[j + 3] - az, l2 = bx * bx + bz * bz;
                            const f = l2 > 0 ? Math.max(0, Math.min(1, ((cx - ax) * bx + (cz - az) * bz) / l2)) : 0, d = Math.hypot(ax + bx * f - cx, az + bz * f - cz) - (s.w / 2 + s.saum);
                            if (d < out.minFassadeUeberTrasseM) out.minFassadeUeberTrasseM = d;
                            if (d < -1e-6) drin = true;
                        }
                }
                if (drin) out.hausInTrasse++;
            }
        }
}
out.minFassadeUeberTrasseM = Math.round(out.minFassadeUeberTrasseM * 1000) / 1000;
const st = out.stellenJeKachel.sort((a, b) => a - b);
out.stellenJeKachel = { min: st[0], median: st[st.length >> 1] };
out.sha256 = h.digest("hex");
console.log(JSON.stringify(out));
