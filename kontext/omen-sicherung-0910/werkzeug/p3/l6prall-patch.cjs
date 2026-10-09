// gate:fahr-leben L6(a): der Prall wird im Stoß gemessen (am Paar selbst: die Fahrt des Spielers in den Wagen vor und nach
// `_stossPaar`), nicht je Frame — nimmt der Gang die Fahrt im selben Frame wieder auf, sah die Frame-Messung den Prall nicht
// (0710-4, drei Läufe: 1,15 → 0,23 grün, 1,44 → 1,44 rot bei 230 Schritten Schub und gehaltenem Wagen).
"use strict";
const fs = require("fs");
const p = process.argv[2];
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER: " + a.slice(0, 100));
    s = s.replace(a, b);
}
ers(
    `                        aufstieg: 0, // wie hoch der Fuß nach dem Kontakt über dem Boden stand (der Spieler stieg auf den Wagen)
                        schub: 0, // in wie vielen Schritten der Wagen den Spieler aus seiner Hülle schob
                    };`,
    `                        aufstieg: 0, // wie hoch der Fuß nach dem Kontakt über dem Boden stand (der Spieler stieg auf den Wagen)
                        schub: 0, // in wie vielen Schritten der Wagen den Spieler aus seiner Hülle schob
                        paare: 0, // Stöße Wagen → Spieler mit Fahrt in den Wagen
                        prallNach: -Infinity, // der größte Rest-Anteil der Fahrt in den Wagen NACH dem Stoß (≤ 0: er prallt ab)
                    };
                    const SProh = r._stossPaar;
                    r._stossPaar = function (qa, qb, nx, nz) {
                        if (qb !== st.playerMesh) return SProh.call(this, qa, qb, nx, nz);
                        const vor = -(st.playerVel.x() * nx + st.playerVel.z() * nz); // n zeigt vom Wagen zum Spieler
                        const J = SProh.call(this, qa, qb, nx, nz);
                        const nach = -(st.playerVel.x() * nx + st.playerVel.z() * nz);
                        if (vor > 0.05) {
                            m.paare++;
                            m.prallNach = Math.max(m.prallNach, nach / vor);
                        }
                        return J;
                    };`
);
ers(
    `                    tasten(false);
                    delete r._stepCharacterStructures;`,
    `                    tasten(false);
                    delete r._stepCharacterStructures;
                    delete r._stossPaar;`
);
ers(
    `        else if (!(sw.a.nachKontakt <= STATION.spielerAbprall * sw.a.vorKontakt))
            out.push(
                \`spieler-wagen: der Spieler läuft gegen den GT und behält seine Fahrt (\${sw.a.vorKontakt.toFixed(2)} → \${sw.a.nachKontakt.toFixed(2)} m/s) — kein Impuls\`
            );`,
    `        else if (!(sw.a.paare >= 1))
            out.push(
                \`spieler-wagen: der Spieler läuft gegen den GT (\${sw.a.vorKontakt.toFixed(2)} m/s) und kein Stoß fällt — kein Impuls\`
            );
        else if (!(sw.a.prallNach <= 0))
            out.push(
                \`spieler-wagen: nach dem Stoß läuft der Spieler noch mit \${(sw.a.prallNach * 100).toFixed(0)} % seiner Fahrt in den Wagen — er prallt nicht ab\`
            );`
);
ers(
    `    spielerAbprall: 0.25, // Anteil der Fahrt in den Wagen, den der Spieler nach dem Kontakt höchstens behält (0710-4)
`,
    ``
);
ers(
    `                a: { minAbstand: 0, wagenWeg: 0.002, kontakt: 100, vorKontakt: 4.2, nachKontakt: -0.1 },`,
    `                a: {
                    minAbstand: 0,
                    wagenWeg: 0.002,
                    kontakt: 100,
                    vorKontakt: 4.2,
                    nachKontakt: -0.1,
                    paare: 3,
                    prallNach: -0.03,
                },`
);
ers(
    `                        a: { minAbstand: 0, wagenWeg: 0, kontakt: 100, vorKontakt: 4.2, nachKontakt: 4.1 },`,
    `                        a: { minAbstand: 0, wagenWeg: 0, kontakt: 100, vorKontakt: 4.2, nachKontakt: 4.1, paare: 0 },`
);
ers(
    "Wagen ${swz.a.wagenWeg.toFixed(3)} m gerutscht, tiefste Berührung ${swz.a.minAbstand.toFixed(3)} m, Schub des Wagens in ${swz.a.schub} Schritten,",
    "Wagen ${swz.a.wagenWeg.toFixed(3)} m gerutscht, tiefste Berührung ${swz.a.minAbstand.toFixed(3)} m, Schub des Wagens in ${swz.a.schub} Schritten, ${swz.a.paare} Stöße (Rest der Fahrt in den Wagen danach höchstens ${Number.isFinite(swz.a.prallNach) ? (swz.a.prallNach * 100).toFixed(0) : \"–\"} %),"
);
fs.writeFileSync(p, s);
console.log("ok");
