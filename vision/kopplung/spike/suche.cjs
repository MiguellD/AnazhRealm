// SPIKE KOPPLUNG — die Suche des Orts für Fall I bei U10 24 m/s und die Probe „das Bett ist eine Funktion des Orts“ (B4).
//   node suche.cjs lauf <spieler: mess|ort|x,z> <halbM> <pLinie> <pLauf> <sollM>
//        → der Ort der Linie (10 Zellen ⊥ θ0, alle p·anteil ≥ pLinie), dessen Lauf windab (die drei mittleren Zellen quer) am
//          längsten auf Bett ≥ pLauf bleibt — Richtung: das Mittel von `windRichtung` 120–300 s nach der Zündung (14 Uhr)
//   node suche.cjs bett <spieler: mess|ort|fern|x,z>
//        → p·anteil (`_lastAm` der Kopie) an 400 festen Zellen um den Ort von Fall I; dieselben Zellen bei anderem Spieler
//          vergleicht der Rufer (B4: hängt das Bett am Ort des Spielers?)
// Modus immer "fest" (die Kopien; das Bett liest kein Wetter).
"use strict";
process.argv.splice(2, 0, "fest");
const { lauf } = require("./buehne.cjs");
const ORT = { x: -1128, z: -984 };
const MESS = { x: -280.4, z: -1045.6 };

const was = process.argv[3] || "lauf";
const sp = process.argv[4] || "mess";
const spieler =
    sp === "mess" ? MESS : sp === "ort" ? ORT : sp === "fern" ? { x: ORT.x + 3000, z: ORT.z + 3000 } : { x: +sp.split(",")[0], z: +sp.split(",")[1] };

lauf(
    async (A) => {
        const S = window.__spike;
        const cs = AnazhRealm.LIFE_FIELD.cell;
        const saat = S.saat();
        const aus = { spieler: A.spieler, kronen: st.wegeKarte && st.wegeKarte.kronen ? st.wegeKarte.kronen.size : null };
        if (A.was === "bett") {
            const [c0x, c0z] = [Math.floor(A.ORT.x / cs), Math.floor(A.ORT.z / cs)];
            const p = [];
            const t0 = performance.now();
            for (let j = -10; j < 10; j++)
                for (let i = -10; i < 10; i++) {
                    const g = r._lastAm(c0x + 2 * i, c0z + 2 * j);
                    p.push(g ? Math.round(g.p * g.anteil * 1e4) / 1e4 : 0);
                }
            aus.p = p;
            aus.msJeZelle = (performance.now() - t0) / p.length;
            return aus;
        }
        const tIgn = S.zeitZurPhase(14 / 24, 3600);
        let [mx, mz] = [0, 0];
        for (let t = tIgn + 120; t <= tIgn + 300; t++) {
            const d = __phytoCore.windRichtung(saat, t);
            ((mx += d.x), (mz += d.z));
        }
        const l = Math.hypot(mx, mz);
        aus.tIgn = tIgn;
        aus.windGrad = (Math.atan2(mx / l, mz / l) * 180) / Math.PI;
        aus.suche = S.laufOrt(A.MESS.x, A.MESS.z, A.halbM, mx / l, mz / l, A.pLinie, A.sollM, A.pLauf);
        return aus;
    },
    () => ({
        was,
        ORT,
        spieler,
        halbM: +(process.argv[5] || 1500),
        pLinie: +(process.argv[6] || 0.95),
        pLauf: +(process.argv[7] || 0.9),
        sollM: +(process.argv[8] || 800),
    })
);
