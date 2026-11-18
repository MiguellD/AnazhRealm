// vielfalt-zweit.cjs — ZWEITZÄHLUNG der sichtbaren Vielfalt (Runde 1: pruefung-spike.md Urteil 20, entscheid.md §0 Z.36–38).
// Läuft den Prototyp p3/n1811/bau-spike2/stadt-proto.cjs (Kern-Kopie SHA 028cc2d0 = fachwerk-core.js main) einmal und prüft, dass
// HEUTE und R1 an den 2 595 Haushalts-Losen der 30 Pläne G Zahl für Zahl die Zahlen der Runde 1 tragen. Wirft bei jeder Abweichung.
//   node koordination/vision/bau/zaehl/vielfalt-zweit.cjs     (aus dem Ordner AnazhRealm-OMEN; < 5 s)
"use strict";
const path = require("path");
const { execFileSync } = require("child_process");
const fs = require("fs");
const proto = path.join(__dirname, "..", "..", "..", "..", "p3", "n1811", "bau-spike2", "stadt-proto.cjs");
if (!fs.existsSync(proto)) throw new Error("vielfalt-zweit: der Prototyp fehlt: " + proto);
execFileSync(process.execPath, [proto], { env: Object.assign({}, process.env, { STADT_TAG: "zweit", STADT_V2: "{}" }), stdio: "ignore" });
const A = JSON.parse(fs.readFileSync(path.join(path.dirname(proto), "stadt-proto-zweit.json"), "utf8"));
const soll = {   // Runde 1: entscheid.md:36–38 (gerundet), pruefung-spike.md:45, 38
    heute: { formen: 440, breiten: 21, traufeSpanne: 4.7, modalQ50: [0.055, 0.065] },
    r1: { formen: 32, breiten: 3, traufeSpanne: 2.67, modalQ50: [0.275, 0.285] },
};
const fehl = [];
for (const [satz, S] of Object.entries(soll)) {
    const M = A.vielfalt[satz];
    if (!M) throw new Error("vielfalt-zweit: Satz fehlt " + satz);
    for (const k of ["formen", "breiten", "traufeSpanne"]) if (M[k] !== S[k]) fehl.push(`${satz}.${k} ${M[k]} ≠ ${S[k]}`);
    if (!(M.modalQ50 >= S.modalQ50[0] && M.modalQ50 <= S.modalQ50[1])) fehl.push(`${satz}.modalQ50 ${M.modalQ50} ∉ [${S.modalQ50}]`);
}
if (fehl.length) throw new Error("vielfalt-zweit: ABWEICHUNG — " + fehl.join(" · "));
console.log(`vielfalt-zweit GLEICH: heute ${A.vielfalt.heute.formen}/${A.vielfalt.heute.breiten}/${A.vielfalt.heute.traufeSpanne}/${A.vielfalt.heute.modalQ50} · R1 ${A.vielfalt.r1.formen}/${A.vielfalt.r1.breiten}/${A.vielfalt.r1.traufeSpanne}/${A.vielfalt.r1.modalQ50} · V2 ${A.vielfalt.v2.formen}/${A.vielfalt.v2.breiten}/${A.vielfalt.v2.traufeSpanne}/${A.vielfalt.v2.modalQ50}`);
