// SPIKE KOPPLUNG — die unabhängigen Soll-Zahlen aus der Quelle (node, keine Welt):
//   CSIRO-Gras, natürliches Weideland, voll ausgehärtet (Cheney, Gould & Catchpole 1998, Int. J. Wildland Fire 8:1–13):
//     R = (0,054 + 0,269·U)·φ_M für U < 5 km/h; R = (1,4 + 0,838·(U − 5)^0,844)·φ_M für U ≥ 5 km/h  [km/h], U = U10 in km/h
//     φ_M = exp(−0,108·MC) für MC < 12 %; darüber 0,684 − 0,0342·MC (U < 10 km/h) bzw. 0,547 − 0,0228·MC (U ≥ 10 km/h)
//   L/B: FCFDG 1992 (FBP, ST-X-3) Gras O-1: 1,1·U^0,464; Alexander 1985 (Wald): 1 + 8,729·(1 − e^(−0,030·U))^2,155
//   Massen-Schranke der Löschzeit (entscheid.md (7) Fall III, halb unabhängig — c, w aus dem Bett des Modells):
//     t = (mx − M0)·w / (c·P) Prozess-h → / 24 Welt
//   node csiro.cjs
"use strict";
const csiro = (U10, M) => {
    const U = U10 * 3.6,
        MC = M * 100;
    const phi = MC < 12 ? Math.exp(-0.108 * MC) : U < 10 ? 0.684 - 0.0342 * MC : 0.547 - 0.0228 * MC;
    const R = U >= 5 ? (1.4 + 0.838 * Math.pow(U - 5, 0.844)) * phi : (0.054 + 0.269 * U) * phi;
    return Math.max(0, R) / 3.6;
};
const lbGras = (U10) => 1.1 * Math.pow(U10 * 3.6, 0.464);
const lbWald = (U10) => 1 + 8.729 * Math.pow(1 - Math.exp(-0.03 * U10 * 3.6), 2.155);
const f = (v, n = 3) => v.toFixed(n);
console.log("Probe U10 6, M 0,06:", f(csiro(6, 0.06)), "m/s (Soll 1,507)");
for (const M of [0.06, 0.09]) console.log("M", M, [2.4, 7.2, 24].map((U) => f(csiro(U, M))).join(" / "), "m/s");
console.log("Verhältnisse Wind 7,2/2,4:", f(csiro(7.2, 0.06) / csiro(2.4, 0.06)), "24/7,2:", f(csiro(24, 0.06) / csiro(7.2, 0.06)),
    "Feuchte 0,06/0,09:", f(csiro(7.2, 0.06) / csiro(7.2, 0.09)), "0,059/0,089:", f(csiro(7.2, 0.059) / csiro(7.2, 0.089)));
// Fall II: wo Gras nach CSIRO noch läuft (φ_M > 0 über 12 %)
console.log("CSIRO φ_M = 0 bei MC", f(0.684 / 0.0342, 1), "% (U < 10 km/h) bzw.", f(0.547 / 0.0228, 1), "% (U ≥ 10 km/h)");
for (const M of [0.12, 0.15, 0.18, 0.2, 0.22]) console.log("  U10 7,2, MC", M * 100, "% →", f(csiro(7.2, M)), "m/s");
console.log("L/B bei U10 7,2: Gras O-1", f(lbGras(7.2), 2), "· Wald (Alexander 1985)", f(lbWald(7.2), 2));
// Fall III: die Massen-Schranke (Gras: c 0,823, w 0,166 kg/m², mx 0,12)
const c = 1 - Math.exp((-11483 * 0.166) / (Math.PI * 350));
for (const [name, P] of [["regen", 0.6 * 0.834], ["sturm", 1.0 * 0.834], ["bewoelkt", 0.12 * 0.834]])
    for (const M0 of [0.06, 0.065, 0.07]) {
        const tW = ((((0.12 - M0) * 0.166) / (c * P)) * 3600) / 24;
        console.log("Massen-Schranke", name, "P", f(P), "mm/h, M0", M0, "→", f(tW, 2), "s Welt (c", f(c), ")");
    }
