"use strict";
// gate:knick-euler — same.physik.tragen S1: EIN Glied knickt nach EULER, F_cr = π²·E·I / (β·L)², mit der Knicklänge seiner
// Lagerung, und zerdrückt bei σ_y / druckSicherheit — ohne Eichfaktor. Lädt stamm/bau-buch.js im vm-Kontext mit dem echten
// schmiede-core (STOFF_GESETZ, `tragSpannung`) und ruft den EINEN Richter `_failsUnderLoad`, den die Werkstatt-Vorschau
// (werkstatt-vorschau.js `_workshopPhysicsVerdict`, Warnung „knickt“) und der Lastpfad der Welt (bau-teile.js `v.buckles` →
// `_werkBricht`) lesen. Je Fall eine Säule 0,2 × 0,2 m auf dem Grund, oben ein Last-Block, dessen Masse in Schritten von 1 %
// wächst, bis `buckles` kippt; die Versagens-Last (`out.last`: Block + die obere Hälfte der Säule) gegen das Gesetz:
//   eingespannt-frei (frei stehend, β = 2): min(π²EI/(2L)², A·σ_y/10)
//   eingespannt-gelenkig (ein Riegel über zwei Gliedern, β = 0,7): min(π²EI/(0,7L)², A·σ_y/10) je Glied
// Soll 0,8–1,2 in jedem Fall; der Gegenlauf mit E/2 knickt das schlanke Glied bei 0,5 ± 0,05. SELBSTTEST: die Mutante
// „Eichfaktor 500 zurück, β fehlt“ (der Stand bis zu diesem Schnitt) ist ROT.
// Aufruf: node scripts/diag-knick-euler.cjs [--quelle <bau-buch.js>]
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { studioKern } = require("./lib/welt-boot.cjs");

const ROOT = path.join(__dirname, "..");
const SC = studioKern("schmiede-core.js", "__schmiedeCore");
const SG = SC.STOFF_GESETZ;
const qi = process.argv.indexOf("--quelle");
const QUELLE = fs.readFileSync(qi > 0 ? process.argv[qi + 1] : path.join(ROOT, "stamm/bau-buch.js"), "utf8");

// der Richter aus einer Quelle: die Klasse des Buchs auf einem Wirt mit den Zeilen des Stoff-Gesetzes
function richter(quelle, zeilen) {
    const A = function () {};
    A.MATERIAL_TAG_KEYS = [];
    const sb = {
        console,
        Math,
        Object,
        JSON,
        Number,
        Array,
        Set,
        Map,
        WeakRef,
        THREE: global.THREE,
        AnazhRealm: A,
        _stammZonen: () => {},
    };
    sb.globalThis = sb.self = sb.window = sb;
    sb.__schmiedeCore = SC;
    vm.createContext(sb);
    vm.runInContext(quelle + "\n;globalThis.__BB = AnazhRealm_bau_buch;", sb, { filename: "bau-buch.js" });
    const r = Object.create(sb.__BB.prototype);
    r.state = { materials: zeilen, gravity: -9.81 };
    r._bruchMelden = (m) => {
        throw new Error(m);
    };
    r._makePartGeometry = (p) => new global.THREE.BoxGeometry(p.size.x, p.size.y, p.size.z);
    return { r, P: A.PHYSIS };
}
const zeile = (n, f = 1) => ({ ...SG.zeile(n), name: n, builtIn: true, E: SG.zeile(n).E * f });
const ZEILEN = { stein: zeile("stein"), holz: zeile("holz"), steinE2: zeile("stein", 0.5), holzE2: zeile("holz", 0.5) };
const box = (material, x, y, z, px, py) => ({
    shape: "box",
    material,
    size: { x, y, z },
    position: { x: px, y: py, z: 0 },
});

// die Säule(n) b × λb × b auf dem Grund (bei Riegel zwei, 2 m auseinander, ein Holz-Riegel über ihnen), oben ein Stein-Block
// w × 0,3 × w; w wächst je Schritt um √1,01 (die Masse um 1 %), bis der Richter knickt
function versagen(r, stoff, lambda, b, riegel) {
    const h = lambda * b;
    const saeulen = riegel
        ? [box(stoff, b, h, b, -1, h / 2), box(stoff, b, h, b, 1, h / 2)]
        : [box(stoff, b, h, b, 0, h / 2)];
    const oben = riegel ? [box("holz", 2.4, 0.2, 0.3, 0, h + 0.1)] : [];
    const top = riegel ? h + 0.2 : h;
    for (let k = 0, w = 0.05; k < 4000; k++, w *= Math.sqrt(1.01)) {
        const v = r._failsUnderLoad({ parts: [...saeulen, ...oben, box("stein", w, 0.3, w, 0, top + 0.15)] });
        if (v.buckles) return v.last;
    }
    return Infinity;
}
function gesetz(z, lambda, b, beta, n) {
    const A = b * b,
        I = b ** 4 / 12,
        L = lambda * b;
    const euler = (Math.PI ** 2 * z.E * I) / (beta * L) ** 2;
    const druck = (A * z.sigY) / 10;
    return {
        euler: n * euler,
        druck: n * druck,
        soll: n * Math.min(euler, druck),
        art: euler < druck ? "knickt" : "zerdrückt",
    };
}
const FAELLE = [
    ["stein", 10],
    ["stein", 20],
    ["stein", 40],
    ["holz", 10],
    ["holz", 20],
    ["holz", 40],
];
function lauf(quelle, laut) {
    const { r } = richter(quelle, ZEILEN);
    const b = 0.2;
    const zeilen = [];
    for (const [stoff, lambda] of FAELLE) {
        const F = versagen(r, stoff, lambda, b, false);
        const g = gesetz(ZEILEN[stoff], lambda, b, 2, 1);
        const FE2 = versagen(r, stoff + "E2", lambda, b, false);
        // das Gesetz mit E/2: knickt das Glied, halbiert es die Last; zerdrückt es, bleibt sie — oder das Knicken übernimmt
        const e2Soll = gesetz(ZEILEN[stoff + "E2"], lambda, b, 2, 1).soll / g.soll;
        zeilen.push({
            fall: `${stoff} λ${lambda} frei`,
            F,
            ...g,
            q: F / g.soll,
            qEuler: F / g.euler,
            e2: FE2 / F,
            e2Soll,
        });
    }
    // der Riegel: zwei Holz-Glieder 0,1 m, λ 80, ein querliegendes Teil kreuzt beide — eingespannt-gelenkig
    const Fr = versagen(r, "holz", 80, 0.1, true);
    const gr = gesetz(ZEILEN.holz, 80, 0.1, 0.7, 2);
    zeilen.push({ fall: "holz λ80 Riegel", F: Fr, ...gr, q: Fr / gr.soll, qEuler: Fr / gr.euler, e2: NaN });
    if (laut)
        for (const z of zeilen)
            console.log(
                `${z.fall.padEnd(18)} Versagen ${(z.F / 1000).toFixed(2).padStart(9)} kN · Gesetz ${(z.soll / 1000).toFixed(2).padStart(9)} kN (${z.art}) · ×Gesetz ${z.q.toFixed(4)} · ×Euler ${z.qEuler.toFixed(4)}${Number.isFinite(z.e2) ? " · E/2 → ×" + z.e2.toFixed(3) + " (Gesetz ×" + z.e2Soll.toFixed(3) + ")" : ""}`
            );
    const fehl = [];
    for (const z of zeilen) {
        if (!(z.q >= 0.8 && z.q <= 1.2)) fehl.push(`${z.fall}: ×Gesetz ${z.q.toFixed(4)} ∉ [0,8; 1,2]`);
        if (z.art === "knickt" && Number.isFinite(z.e2) && !(Math.abs(z.e2 - 0.5) <= 0.05))
            fehl.push(`${z.fall}: E/2 → ×${z.e2.toFixed(3)} ≠ 0,5 ± 0,05`);
        if (Number.isFinite(z.e2) && !(Math.abs(z.e2 - z.e2Soll) <= 0.05))
            fehl.push(`${z.fall}: E/2 → ×${z.e2.toFixed(3)}, das Gesetz ×${z.e2Soll.toFixed(3)}`);
    }
    const g10 = zeilen[0];
    if (g10.art !== "zerdrückt") fehl.push("das gedrungene Stein-Glied λ10 zerdrückt nicht am Gesetz");
    return { zeilen, fehl };
}

const echt = lauf(QUELLE, true);
// SELBSTTEST: die Mutanten — der Richter vor dem Schnitt (Eichfaktor 500, Knicklänge = Höhe) und die Lagerung ohne Riegel
// (β = 2 für jedes Glied); jede muss in mindestens einem Fall fallen
const MUTANTEN = {
    eichfaktor: [
        "SG.tragSpannung(g.z, g.lambda * g.beta, 1, P.druckSicherheit)",
        "SG.tragSpannung(g.z, g.lambda, 500, P.druckSicherheit)",
    ],
    lagerung: ["g.beta = gehalten ? 0.7 : 2;", "g.beta = 2;"],
};
const selbst = {};
for (const [name, [von, zu]] of Object.entries(MUTANTEN))
    selbst[name] = QUELLE.split(von).length === 2 ? lauf(QUELLE.replace(von, zu), false).fehl.length : -1;
console.log("KNICK " + JSON.stringify({ faelle: echt.zeilen.length, fehl: echt.fehl, mutanten_faelle: selbst }));
const ok = !echt.fehl.length && Object.values(selbst).every((n) => n > 0);
console.log(
    ok
        ? `✅ KNICK-EULER GRÜN — ${echt.zeilen.length}/${echt.zeilen.length} Glieder versagen am Gesetz ±20 %, E/2 folgt dem Gesetz, die Mutanten fallen (${JSON.stringify(selbst)})`
        : "❌ KNICK-EULER ROT — " +
              (echt.fehl.join(" · ") || "—") +
              " · Mutanten (Fälle, −1 = Stelle fehlt) " +
              JSON.stringify(selbst)
);
process.exit(ok ? 0 : 1);
