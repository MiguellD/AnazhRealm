// d-gitter.cjs — Beiprobe zu d (keine eigene Soll-Zeile): wie hängt der Stand-Sprung an der Unterkante des Knie-Gitters φ_s?
// Das Gesetz (§4) nennt keine Unterkante; person.cjs sucht ab 30°. Gemessen wird die Weite je Unterkante 5–60° gegen dasselbe Band.
"use strict";
const P = require("./person.cjs");
const { schreiben, r } = require("./probe.cjs");
const Y = P.jahrVon(182, 12), G = P.G, GRAD = Math.PI / 180;
const BAND = { m9: [87, 131], m17_9: [132, 198], w9: [77, 115], w17_9: [96, 144] };
function mittel(sex, J) {
    const x = { adr: 0, g: 0, slot: 0, herkunft: 0, geburt: Y - J, sex, _a: [0], _e: [0], _M: P.LC.masseAdult(P.ART[sex].Mbar, [0], [0]) };
    return P.leib(0, x, Y);
}
function weite(B, unten) {
    let best = { cm: 0 };
    for (let p = unten; p <= 175; p += 5)
        for (let th = 5; th <= 85; th += 2.5) {
            const q = P.stoss(B, 2, p * GRAD, th * GRAD);
            if (q.v <= 0) continue;
            const c = Math.cos(th * GRAD), s = Math.sin(th * GRAD), vz = q.v * s;
            const tf = (vz + Math.sqrt(vz * vz + 2 * G * (q.ellEnd - q.ell0) * s)) / G;
            const w = (q.ellEnd - q.ell0) * c + q.v * c * tf;
            if (w > best.cm / 100) best = { cm: r(w * 100, 1), phiS: p, theta: th };
        }
    return best;
}
const leiber = { m9: [0, 9], m17_9: [0, 17.9], w9: [1, 9], w17_9: [1, 17.9] };
const zeilen = [];
for (const unten of [5, 10, 20, 30, 40, 60]) {
    const z = { unten, imBand: 0 };
    for (const [k, [sex, J]] of Object.entries(leiber)) {
        const w = weite(mittel(sex, J), unten);
        z[k] = w;
        if (w.cm >= BAND[k][0] && w.cm <= BAND[k][1]) z.imBand++;
    }
    zeilen.push(z);
    console.log("φ_s ab " + unten + "°: " + Object.keys(leiber).map((k) => k + " " + z[k].cm + " cm (φ_s " + z[k].phiS + "°)").join(" · ") + " — im Band " + z.imBand + "/4");
}
schreiben("d-gitter", { probe: "d Beiprobe: Stand-Sprung gegen die Unterkante des Knie-Gitters", band: BAND, zeilen });
