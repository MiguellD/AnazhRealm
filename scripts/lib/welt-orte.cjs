"use strict";
// DIE ORTE AUS DER WELT (K16, Prüfung Runde 2): eine Probe trägt keinen Ort als Zahlen-Paar — seit die Landform im
// Gelände-Kern liegt, steht an den Orten der alten Welt anderes Gelände (der Biss am Hang, der Baum im Haus, die Ankunft im
// Ursprung: drei rote Gruppen der CI). Zwei Quellen tragen jeden Ort einer Probe:
//   - der MESSORT der Band-Serie aus EINER Datei (spec/profiband/haushalt.json, `messorte[].spieler`/`blick` — dieselbe, an
//     der `werkbank umstellen --ort` den Spieler aufstellt), nie als Abschrift;
//   - die STELLE aus der Welt (`__weltOrt` in der Seite): gesucht in Ringen um die Mitte, geprüft am Gesetz und am gebauten
//     Boden — eben, Hang, Hangfuß. Findet die Suche nichts, kommt null zurück (die Probe nennt das laut, nie ein Ersatz-Ort).
// Die Orts-Wand (gate:altlasten, `scanOrtsWand`) hält die Klasse geschlossen.
const { ladeSpec } = require("./band-urteil.cjs");

// der EINE Leser des Haushalts (band-urteil `ladeSpec`, derselbe wie werkbank und gate:vehicle-drive), hier als Ort {x, z}
function messort(id) {
    const o = ladeSpec(id).ort;
    if (!o || !Array.isArray(o.spieler))
        throw new Error(`messort: kein Messort "${id}" in spec/profiband/haushalt.json`);
    const b = Array.isArray(o.blick) ? o.blick : o.spieler;
    return { id, x: o.spieler[0], z: o.spieler[1], blick: { x: b[0], z: b[1] } };
}

// In der Seite: die nächste Stelle der gewünschten Art um (mx, mz). Arten:
//   eben      — Land ohne Nässe, die Spanne des Bodens im Umkreis `r` (8 Speichen) ≤ `spanne` m, kein Fels darüber
//   hang      — die Neigung des Gesetzes (zentrale Differenz über 2 m) zwischen `min` und `max` Grad, Land ohne Nässe
//   hangfuss  — eine ebene Stelle (Neigung ≤ `fussMax` Grad), hinter der binnen `bis` m ein Hang ≥ `hangMin` Grad steigt;
//               zurück kommt auch die Richtung `gier` (rad, rotation.y-Sinn: 0 = +z), die auf den Hang zeigt
//   ufer      — eine trockene, flache Stelle (Neigung ≤ `fussMax` Grad, Vorgabe 8), vor der binnen `bis` m (Vorgabe 30) Wasser
//               steht (`_nassAt`: Wasser über dem Boden) und über `breite` m (Vorgabe 10) Wasser bleibt — ein Gewässer, keine
//               Pfütze; zurück kommen `gier` zum Wasser und `wasserBei` (m) — der Bild-Ort der Soll-Tafel für das Wasser (K63-n4)
// opts: { mitte: [x, z] (Vorgabe der Messort `__messWiese`), rMax (m, Vorgabe 400), schritt (m, Vorgabe 6), ... }
function weltOrt(art, opts) {
    const o = opts || {};
    const r = window.anazhRealm;
    const mitte = o.mitte || window.__messWiese;
    if (!mitte) throw new Error("__weltOrt: keine Mitte (weder opts.mitte noch __messWiese)");
    const [mx, mz] = mitte;
    const rMax = o.rMax || 400;
    const schritt = o.schritt || 6;
    const H = (x, z) => r.getTerrainHeightAt(x, z);
    const trocken = (x, z) => r._landAt(x, z) && !(typeof r._nassAt === "function" && r._nassAt(x, z));
    const neigung = (x, z) => {
        const gx = (H(x + 1, z) - H(x - 1, z)) / 2;
        const gz = (H(x, z + 1) - H(x, z - 1)) / 2;
        return (Math.atan(Math.hypot(gx, gz)) * 180) / Math.PI;
    };
    const unterFels = (x, z) => typeof r._kreaturUnterFels === "function" && r._kreaturUnterFels(x, H(x, z), z);
    const pruefe = {
        eben: (x, z) => {
            const rr = o.r || 6;
            const sp = o.spanne == null ? 1 : o.spanne;
            let lo = Infinity,
                hi = -Infinity;
            for (let k = 0; k <= 8; k++) {
                const a = (k / 8) * Math.PI * 2;
                const px = k === 8 ? x : x + Math.cos(a) * rr,
                    pz = k === 8 ? z : z + Math.sin(a) * rr;
                if (!trocken(px, pz)) return null;
                const h = H(px, pz);
                if (!Number.isFinite(h)) return null;
                lo = Math.min(lo, h);
                hi = Math.max(hi, h);
            }
            return hi - lo <= sp && !unterFels(x, z) ? { spanne: Math.round((hi - lo) * 100) / 100 } : null;
        },
        hang: (x, z) => {
            if (!trocken(x, z) || unterFels(x, z)) return null;
            const n = neigung(x, z);
            return n >= (o.min == null ? 25 : o.min) && n <= (o.max == null ? 35 : o.max)
                ? { neigung: Math.round(n * 10) / 10 }
                : null;
        },
        hangfuss: (x, z) => {
            if (!trocken(x, z) || unterFels(x, z)) return null;
            if (neigung(x, z) > (o.fussMax == null ? 5 : o.fussMax)) return null;
            const bis = o.bis || 10;
            for (let k = 0; k < 16; k++) {
                const a = (k / 16) * Math.PI * 2;
                const dx = Math.sin(a),
                    dz = Math.cos(a);
                for (let d = 3; d <= bis; d += 1) {
                    const px = x + dx * d,
                        pz = z + dz * d;
                    if (!trocken(px, pz)) break;
                    if (neigung(px, pz) >= (o.hangMin == null ? 15 : o.hangMin) && H(px, pz) > H(x, z) + 0.5)
                        return { gier: Math.round(a * 1000) / 1000, hangBei: d };
                }
            }
            return null;
        },
        ufer: (x, z) => {
            if (!trocken(x, z) || unterFels(x, z)) return null;
            if (neigung(x, z) > (o.fussMax == null ? 8 : o.fussMax)) return null;
            const bis = o.bis || 30,
                breite = o.breite || 10;
            const nass = (px, pz) => typeof r._nassAt === "function" && r._nassAt(px, pz);
            for (let k = 0; k < 16; k++) {
                const a = (k / 16) * Math.PI * 2;
                const dx = Math.sin(a),
                    dz = Math.cos(a);
                for (let d = 3; d <= bis; d += 3) {
                    if (!nass(x + dx * d, z + dz * d)) continue;
                    let bleibt = true;
                    for (let e = d + 2; e <= d + breite && bleibt; e += 2) bleibt = nass(x + dx * e, z + dz * e);
                    if (bleibt) return { gier: Math.round(a * 1000) / 1000, wasserBei: d };
                    break;
                }
            }
            return null;
        },
    }[art];
    if (!pruefe) throw new Error(`__weltOrt: unbekannte Art "${art}"`);
    for (let rr = 0; rr <= rMax; rr += schritt) {
        const n = Math.max(1, Math.round((2 * Math.PI * rr) / schritt));
        for (let q = 0; q < n; q++) {
            const a = (q / n) * Math.PI * 2 + rr * 0.37;
            const x = mx + Math.cos(a) * rr,
                z = mz + Math.sin(a) * rr;
            const p = pruefe(x, z);
            if (p)
                return Object.assign(
                    { art, x: Math.round(x * 10) / 10, z: Math.round(z * 10) / 10, y: H(x, z), abstand: rr },
                    p
                );
        }
    }
    return null;
}

const WIESE = messort("wiese");
module.exports = {
    messort,
    WELT_ORTE_INSTALL: `window.__messWiese = [${WIESE.x}, ${WIESE.z}];` + `window.__weltOrt = ${weltOrt.toString()};`,
};
