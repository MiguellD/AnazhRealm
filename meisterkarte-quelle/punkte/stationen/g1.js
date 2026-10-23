// Stationen der Gruppe I (src/g1.js): je Kriterium und Staffel EINE Station — Befehl im Spiel-Baum am SHA, Urteil über
// seine Ausgabe, Pfad für R6. Format und Regeln: punkte/punkte.cjs (Kopf).
"use strict";
const { jsonBlock } = require("../hilfe.cjs");

module.exports = [
    {
        kriterium: "gelaende.K4",
        staffel: 1,
        geraet: "headless",
        // die Kern-Mutation an 50 Zufalls-Punkten trockenen Lands am See der Mess-Wiese (K12 M, Null-Renderer: Mechanik am Leser, R3)
        befehl: ["node", "scripts/diag-wasser-leben.cjs", "--nur", "mutation"],
        env: { WASSER_LEBEN_PORT: "{PORT}" },
        gpu: false,
        minuten: 8,
        urteil: (j, lauf) => {
            const b = jsonBlock(lauf.stdout);
            const m = b && b.mutation;
            if (!m) return { gruen: false, zahl: "keine Mutations-Probe in der Ausgabe (Exit " + lauf.exit + ")" };
            if (m.fehler) return { gruen: false, zahl: "Probe-Fehler: " + m.fehler };
            const leser = Object.entries(m.leser || {}).filter(([k]) => k !== "kontrolle");
            const folgt = leser.filter(([, l]) => l.n >= m.punkte && l.vor === 0 && l.nach === l.n);
            const k = (m.leser || {}).kontrolle || {};
            const fn = (m.flora && m.flora.nach) || {};
            const gruen =
                lauf.exit === 0 &&
                /WASSER-LEBEN GRÜN/.test(lauf.stdout) &&
                m.punkte >= 50 &&
                leser.length >= 10 &&
                folgt.length === leser.length &&
                k.n >= m.punkte &&
                k.nach === 0 &&
                !(fn.wiese > 0) &&
                !(fn.streu > 0);
            return {
                gruen,
                zahl:
                    folgt.length + " von " + leser.length + " Lesern folgen an " + m.punkte + " Punkten, Kontrolle " +
                    k.nach + ", Pflanzen im Wasser " + (fn.wiese || 0) + " + " + (fn.streu || 0),
            };
        },
        pfad: [
            "gelaende-core.js",
            "stamm/gelaende-*.js",
            "stamm/wasser-*.js",
            "stamm/klang.js",
            "stamm/koerper-*.js",
            "stamm/kreatur-*.js",
            "stamm/vegetation-wiese.js",
            "stamm/vegetation-streu.js",
            "stamm/netz-p2p.js",
            "stamm/bild-himmel.js",
            "stamm/daten.js",
            "scripts/diag-wasser-leben.cjs",
            "scripts/lib/wasser-linse.cjs",
            "scripts/lib/welt-boot.cjs",
        ],
        quelle: "1 = alle Leser folgen der 50-Punkte-Kern-Mutation an einem Ort",
    },
];
