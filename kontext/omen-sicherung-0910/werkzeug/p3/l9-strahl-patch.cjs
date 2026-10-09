// gate:fahr-leben L9: die Seite gegen die GEZEICHNETE Haut des Wagens — von jeder 40. Ecke der Haut des Reiters ein Strahl
// quer nach außen (weg von der Mittellinie) gegen alle Blätter dieses Wagens (nur seine Instanzen): trifft er nichts in
// 2,5 m, liegt die Ecke außen (eine Untergrenze: Innenteile geben nur mehr Treffer). Die Box-Grenze cw sah den Supersport
// nicht — seine Haut ist an der Kabine eingezogen (Coke, Taille, Tumblehome), Rumpf und Arm lagen auf dem Türblatt.
"use strict";
const fs = require("fs");
const p = process.argv[2];
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER: " + a.slice(0, 100));
    s = s.replace(a, b);
}
ers(
    `                const aussen = { unten: 0, oben: 0, seite: 0, laengs: 0, n: 0, tief: {}, wer: {} };`,
    `                const aussen = { unten: 0, oben: 0, seite: 0, laengs: 0, n: 0, tief: {}, wer: {} };
                const strahlProben = []; // jede 40. Ecke: Welt-Lage, Seite (±1 quer), Knochen`
);
ers(
    `                        if (!hu) continue;
                        aussen.n++;`,
    `                        if (!hu) continue;
                        aussen.n++;
                        if (aussen.n % 40 === 0) {
                            const lzS = (V.x - e.position.x) * Math.sin(thH) + (V.z - e.position.z) * Math.cos(thH);
                            strahlProben.push(V.x, V.y, V.z, lzS >= 0 ? 1 : -1, (kn && kn.name) || o.name || "?");
                        }`
);
ers(
    `                const sc = Number.isFinite(e.scale) ? e.scale : 1;
                const fzg = r._fahrzeugGesetzFor(e);`,
    `                // die Strahlen gegen die gezeichnete Haut (die Instanz-Gruppen dieses Wagens, je Leaf ein Slot)
                let glas = null;
                if (strahlProben.length) {
                    const G = st.archInstanceGroups;
                    const refs = [...(e.instSlots || []), ...(e.instSlotsBand || [])];
                    const ziele = new Map();
                    for (const ref of refs) {
                        const g = G && G.get(ref.key);
                        if (!g || !g.mesh) continue;
                        g.mesh.updateMatrixWorld(true);
                        if (!ziele.has(g.mesh)) ziele.set(g.mesh, new Set());
                        ziele.get(g.mesh).add(ref.slot);
                    }
                    const rc = new T.Raycaster();
                    rc.far = 2.5;
                    const O = new T.Vector3();
                    const Dq = new T.Vector3();
                    glas = { n: 0, aussen: 0, wer: {} };
                    for (let i = 0; i < strahlProben.length; i += 5) {
                        O.set(strahlProben[i], strahlProben[i + 1], strahlProben[i + 2]);
                        const sd = strahlProben[i + 3];
                        Dq.set(Math.sin(thH) * sd, 0, Math.cos(thH) * sd); // quer nach außen (R_y(θ)·(0,0,±1))
                        rc.set(O, Dq);
                        let trifft = false;
                        for (const [mesh, slots] of ziele) {
                            const hits = rc.intersectObject(mesh, false);
                            if (hits.some((h) => h.instanceId === undefined || slots.has(h.instanceId))) {
                                trifft = true;
                                break;
                            }
                        }
                        glas.n++;
                        if (!trifft) {
                            glas.aussen++;
                            const w = strahlProben[i + 4];
                            glas.wer[w] = (glas.wer[w] || 0) + 1;
                        }
                    }
                }
                const sc = Number.isFinite(e.scale) ? e.scale : 1;
                const fzg = r._fahrzeugGesetzFor(e);`
);
ers(
    `                    aussen: hu ? aussen : null,`,
    `                    aussen: hu ? aussen : null,
                    glas,`
);
ers(
    `            const au = q.aussen;`,
    `            const gl = q.glas;
            if (gl && gl.n > 0 && gl.aussen / gl.n > STATION.hautAussen)
                out.push(
                    \`reiter \${q.typ}: \${((100 * gl.aussen) / gl.n).toFixed(1)} % der Haut seitlich durch die gezeichnete Haut des Wagens (\${Object.entries(gl.wer)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([w, k]) => \`\${w} ×\${k}\`)
                        .join(", ")})\`
                );
            const au = q.aussen;`
);
ers(
    "${q.aussen && q.aussen.n ? ` · außen ${",
    "${q.glas && q.glas.n ? ` · durch die Tür ${((100 * q.glas.aussen) / q.glas.n).toFixed(1)} %` : \"\"}${q.aussen && q.aussen.n ? ` · außen ${"
);
fs.writeFileSync(p, s);
console.log("ok");
