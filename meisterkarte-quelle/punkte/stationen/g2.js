// Stationen der Gruppe II (src/g2.js). Format und Regeln: punkte/punkte.cjs (Kopf).
"use strict";
const { jsonZeile } = require("../hilfe.cjs");

module.exports = [
    {
        kriterium: "mensch.K3",
        staffel: 1,
        geraet: "headless",
        // die Wege der Bewohner im Start-Dorf am echten Kreatur-Takt (Kontakt-Mechanik, Null-Renderer, R3; Präzedenz Siedlung K1)
        befehl: ["node", "scripts/diag-kreatur-takt.cjs", "--proben", "bewohner"],
        env: { KREATUR_TAKT_PORT: "{PORT}" },
        gpu: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const z = jsonZeile(lauf.stdout, /^\s*(✅|❌) bewohner\s/);
            if (!z) return { gruen: false, zahl: "keine Zeile der Probe bewohner (Exit " + lauf.exit + ")" };
            if (z.fehler) return { gruen: false, zahl: "Probe-Fehler: " + z.fehler };
            const w = z.wege || {};
            const gruen = w.wandN === 0 && w.durch > 0 && w.tuer === w.durch && z.huellen === z.haeuser && z.haeuser > 0;
            return {
                gruen,
                zahl:
                    "Durchdringung " + w.wandN + ", Tür " + w.tuer + "/" + w.durch + ", Hüllen " + z.huellen + "/" +
                    z.haeuser + ", Gangzeit auf Wegen " + w.aufWeg,
            };
        },
        pfad: [
            "stamm/siedlung-*.js",
            "stamm/kreatur-*.js",
            "stamm/koerper-*.js",
            "stamm/gelaende-kollision.js",
            "stamm/daten.js",
            "koerper-core.js",
            "fachwerk-core.js",
            "scripts/diag-kreatur-takt.cjs",
            "scripts/lib/kreatur-proben.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = 0 Durchdringung und Eintritt zu 100 % über die Tür im Start-Dorf",
    },
];
