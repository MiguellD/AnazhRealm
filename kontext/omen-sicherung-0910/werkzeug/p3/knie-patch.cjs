// 0710-4 Klasse 4 (Nachschnitt, das Auge): die Füße des Reiters hingen unter dem Wagen (5,4 % der Haut bis 0,174 m unter
// dem Bauch) — das Knie beugt sich jetzt nur so weit, dass die Sohle über dem Bauch des Gefährts bleibt (exportDrive.huelle
// .ySill); Schienbein und Fuß drehen starr um das Knie, die Haut misst \`_sitzLeib\` einmal je Rig. Dazu zieht L9 die
// Seiten-Grenze auf die Kabine (cw) für jede Höhe.
"use strict";
const fs = require("fs");
const wt = process.argv[2];
function patch(datei, paare) {
    const p = wt + "/" + datei;
    let s = fs.readFileSync(p, "utf8");
    for (const [a, b] of paare) {
        if (s.split(a).length !== 2) throw new Error(datei + " TREFFER: " + a.slice(0, 100));
        s = s.replace(a, b);
    }
    fs.writeFileSync(p, s);
}
patch("anazhRealm.js", [
    // (1) der Ort trägt den Bauch des Gefährts
    [
        `                dach: d.huelle && Number.isFinite(d.huelle.yRoof) ? d.huelle.yRoof * sc : null,
                lehne: F.sitzLehneRad,`,
        `                dach: d.huelle && Number.isFinite(d.huelle.yRoof) ? d.huelle.yRoof * sc : null,
                bauch: d.huelle && Number.isFinite(d.huelle.ySill) ? d.huelle.ySill * sc : null,
                lehne: F.sitzLehneRad,`,
    ],
    [
        `        return { x: x * sc, y: sp.y * sc, z: z * sc, dach: null, lehne: 0, lehneMax: 0, kopfFrei: 0, achseX };`,
        `        return { x: x * sc, y: sp.y * sc, z: z * sc, dach: null, bauch: null, lehne: 0, lehneMax: 0, kopfFrei: 0, achseX };`,
    ],
    // (2) die Messung des Leibs: Schienbein + Fuß relativ zum Knie
    [
        `        const schenkel = new Set([rig.legL.hip, rig.legR.hip]);
        const unterKopf = (o) => {`,
        `        const schenkel = new Set([rig.legL.hip, rig.legR.hip]);
        // Schienbein und Fuß (die Ecken der Knie- und Knöchel-Knochen): je Bein relativ zu seinem Knie-Gelenk (y, z im
        // Rahmen des Spielers; die Oberschenkel liegen längs z, das Knie dreht um x)
        const unten2 = new Map();
        for (const leg of [rig.legL, rig.legR]) {
            if (!leg.knee) continue;
            const kp = leg.knee.getWorldPosition(new THREE.Vector3()).applyMatrix4(inv);
            const eintrag = { ky: kp.y, kz: kp.z, proben: [] };
            unten2.set(leg.knee, eintrag);
            if (leg.ankle) unten2.set(leg.ankle, eintrag);
        }
        const unterKopf = (o) => {`,
    ],
    [
        `                const bein = kn !== null && schenkel.has(kn);
                const kopf = starr || (kn !== null && kn === rig.head);
                if (!bein && !kopf) continue;
                o.getVertexPosition(i, v).applyMatrix4(o.matrixWorld).applyMatrix4(inv);
                if (bein && v.y < unten) unten = v.y;
                if (kopf && v.y > oben) oben = v.y;`,
        `                const bein = kn !== null && schenkel.has(kn);
                const kopf = starr || (kn !== null && kn === rig.head);
                const fuss = kn !== null ? unten2.get(kn) : null;
                if (!bein && !kopf && !fuss) continue;
                o.getVertexPosition(i, v).applyMatrix4(o.matrixWorld).applyMatrix4(inv);
                if (bein && v.y < unten) unten = v.y;
                if (kopf && v.y > oben) oben = v.y;
                if (fuss) fuss.proben.push(v.y - fuss.ky, v.z - fuss.kz);`,
    ],
    [
        `        if (!(unten < Infinity) || !(oben > -Infinity) || !kp) return null;
        return { gesaess: (hL.y + hR.y) / 2 - unten, kopfOben: oben - kp.y, kopfMit };`,
        `        if (!(unten < Infinity) || !(oben > -Infinity) || !kp) return null;
        // die Beine: das Knie relativ zum Hüftgelenk und die Ecken unter ihm (ein Bein genügt, die Pose ist symmetrisch)
        const hy = (hL.y + hR.y) / 2;
        const beinL = rig.legL.knee ? unten2.get(rig.legL.knee) : null;
        const bein =
            beinL && beinL.proben.length
                ? { knieRel: beinL.ky - hy, proben: beinL.proben, knie0: rig.legL.knee.rotation.x }
                : null;
        return { gesaess: hy - unten, kopfOben: oben - kp.y, kopfMit, bein };`,
    ],
    // (3) das Knie aus der Gestalt
    [
        `    // DIE NEIGUNG DES RUMPFS in einem Gefährt (rad):`,
        `    // DAS KNIE IN EINEM GEFÄHRT (rad): so weit gebeugt wie die Sitz-Pose (knie0), höchstens so weit, dass die Sohle über dem
    // Bauch des Gefährts bleibt (exportDrive.huelle.ySill + 3 cm) — Schienbein und Fuß drehen starr um das Knie; gestreckter
    // stehen die Füße weiter vorn im Fußraum. Vorher hingen sie mit 60° Beugung bis 0,17 m unter dem Wagen.
    _sitzKnie(ort, leib) {
        const b = leib && leib.bein;
        if (!b || ort.bauch === null) return b ? b.knie0 : null;
        const frei = ort.y + leib.gesaess + b.knieRel - (ort.bauch + 0.03); // so tief darf die Sohle unter dem Knie liegen
        const tiefste = (k) => {
            const d = k - b.knie0; // die Drehung gegen die gemessene Pose
            const c = Math.cos(d);
            const s = Math.sin(d);
            let m = Infinity;
            for (let i = 0; i < b.proben.length; i += 2) {
                const y = b.proben[i] * c - b.proben[i + 1] * s;
                if (y < m) m = y;
            }
            return -m; // wie tief die Sohle unter dem Knie liegt
        };
        if (tiefste(b.knie0) <= frei) return b.knie0;
        let lo = 0;
        let hi = b.knie0;
        if (tiefste(lo) > frei) return lo;
        for (let i = 0; i < 20; i++) {
            const m = (lo + hi) / 2;
            if (tiefste(m) <= frei) lo = m;
            else hi = m;
        }
        return lo;
    }

    // DIE NEIGUNG DES RUMPFS in einem Gefährt (rad):`,
    ],
    [
        `                L.leib = rig._sitzLeibMass || (rig._sitzLeibMass = this._sitzLeib(group, rig));
                L.phi = this._sitzNeigung(group, rig, ort, L.leib);`,
        `                L.leib = rig._sitzLeibMass || (rig._sitzLeibMass = this._sitzLeib(group, rig));
                L.phi = this._sitzNeigung(group, rig, ort, L.leib);
                L.knie = this._sitzKnie(ort, L.leib);`,
    ],
    [
        `        // der Rumpf neigt sich, der Kopf bleibt aufrecht
        if (rig.spine) rig.spine.rotation.x = -L.phi;`,
        `        // der Rumpf neigt sich, der Kopf bleibt aufrecht; das Knie hält die Sohle über dem Bauch
        if (rig.spine) rig.spine.rotation.x = -L.phi;
        if (Number.isFinite(L.knie)) {
            if (rig.legL.knee) rig.legL.knee.rotation.x = L.knie;
            if (rig.legR.knee) rig.legR.knee.rotation.x = L.knie;
        }`,
    ],
]);
patch("scripts/diag-fahr-leben.cjs", [
    [
        `                            const breit = ly < hu.yBelt ? hu.bw : hu.cw;`,
        `                            const breit = hu.cw; // der Reiter sitzt in der Kabine (ihre halbe Breite, jede Höhe)`,
    ],
]);
console.log("ok");
