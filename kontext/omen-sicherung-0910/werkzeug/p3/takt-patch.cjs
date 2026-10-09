// 0710-5: die Proben von tier-separation und kampf-gefuehl takten wie der Loop — der feste Sim-Schritt (Stoß des Leibs,
// Leib an Leib) und der Kreatur-Takt; vor 0710-5 lebte beides in updateCreatures (die Probe läuft auf beiden Ständen).
"use strict";
const fs = require("fs");
function patch(p, paare) {
    let s = fs.readFileSync(p, "utf8");
    for (const [a, b, n] of paare) {
        const k = s.split(a).length - 1;
        if (k !== (n || 1)) throw new Error(p + " TREFFER " + k + ": " + a.slice(0, 90));
        s = s.split(a).join(b);
    }
    fs.writeFileSync(p, s);
}
const wurzel = process.argv[2];
patch(wurzel + "/scripts/diag-tier-separation.cjs", [
    [
        `            const tick = (n, dt) => {
                for (let k = 0; k < n; k++) r.updateCreatures(dt);
            };`,
        `            // der Takt der Probe wie der Loop: der feste Sim-Schritt (der Stoß des Leibs und Leib an Leib, 0710-5), dann
            // der Kreatur-Takt — vor 0710-5 lebte beides in updateCreatures (dort läuft die Probe unverändert)
            const takt = (dt) => {
                if (typeof r._kreaturStossSchritt === "function") {
                    r._kreaturStossSchritt(dt);
                    r._leibKontakte();
                }
                r.updateCreatures(dt);
            };
            const tick = (n, dt) => {
                for (let k = 0; k < n; k++) takt(dt);
            };`,
    ],
    [`                r.updateCreatures(0.05);`, `                takt(0.05);`],
    [`r.updateCreatures(1 / 60);`, `takt(1 / 60);`, 2],
]);
patch(wurzel + "/scripts/diag-kampf-gefuehl.cjs", [
    [
        `                for (let k = 0; k < 90; k++) r.updateCreatures(1 / 60);`,
        `                // wie der Loop: der feste Sim-Schritt trägt den Stoß (0710-5), dann der Kreatur-Takt
                for (let k = 0; k < 90; k++) {
                    if (typeof r._kreaturStossSchritt === "function") {
                        r._kreaturStossSchritt(1 / 60);
                        r._leibKontakte();
                    }
                    r.updateCreatures(1 / 60);
                }`,
    ],
]);
console.log("ok");
