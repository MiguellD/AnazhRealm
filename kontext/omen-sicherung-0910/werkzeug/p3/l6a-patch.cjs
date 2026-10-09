// L6(a) physikalisch: der laufende Spieler prallt am gebremsten GT ab (seine Fahrt in den Wagen fällt), der Wagen hält.
"use strict";
const fs = require("fs");
const p = process.argv[2];
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER: " + a.slice(0, 90));
    s = s.replace(a, b);
}
ers(
    `        // L6 SPIELER UND WAGEN (0710-4): (a) der Spieler läuft (W) gegen die Flanke eines geparkten GT — der Wagen bekommt
        // seinen Impuls (sein Fahr-Zustand bewegt sich), der Spieler steckt nicht in ihm; (b) ein GT, angestoßen mit 5 m/s,
        // rutscht auf den stehenden Spieler zu — der Spieler bekommt seinen Impuls, der Wagen schiebt ihn nicht durch.`,
    `        // L6 SPIELER UND WAGEN (0710-4): (a) der Spieler läuft (W) gegen die Flanke eines geparkten GT — der Stoß nimmt ihm
        // die Fahrt in den Wagen (er prallt ab, statt in die Box zu drücken), die Handbremse hält den Wagen (sie nimmt den
        // Stoß eines Menschen auf), der Spieler steckt nicht in ihm; (b) ein GT, angestoßen mit 5 m/s, rutscht auf den
        // stehenden Spieler zu — der Spieler bekommt seinen Impuls, der Wagen schiebt ihn nicht durch.`
);
ers(
    `                    const p0 = { x: e.position.x, z: e.position.z };
                    const m = { minAbstand: Infinity, wagenDv: 0, wagenWeg: 0, kontakt: -1 };
                    tasten(true);
                    for (let i = 0; i < 240; i++) {
                        frame(i);
                        m.minAbstand = Math.min(m.minAbstand, kapselAbstand(e));
                        const v = r._fahrWagenGeschw ? r._fahrWagenGeschw(e) : null;
                        const dv = v ? Math.hypot(v.x, v.z) : 0;
                        if (m.kontakt < 0 && dv > 1e-4) m.kontakt = i;
                        m.wagenDv = Math.max(m.wagenDv, dv);
                    }`,
    `                    const p0 = { x: e.position.x, z: e.position.z };
                    const m = { minAbstand: Infinity, wagenWeg: 0, kontakt: -1, vorKontakt: 0, nachKontakt: Infinity };
                    tasten(true);
                    let vorher = 0;
                    for (let i = 0; i < 240; i++) {
                        frame(i);
                        const ab = kapselAbstand(e);
                        m.minAbstand = Math.min(m.minAbstand, ab);
                        const vU = st.playerVel.x() * ux + st.playerVel.z() * uz; // die Fahrt des Spielers in den Wagen
                        if (m.kontakt < 0 && ab <= 0.02) {
                            m.kontakt = i;
                            m.vorKontakt = vorher;
                        }
                        if (m.kontakt >= 0 && i - m.kontakt <= 10) m.nachKontakt = Math.min(m.nachKontakt, vU);
                        vorher = vU;
                    }`
);
ers(
    `        if (!(sw.a.wagenDv >= STATION.spielerWagenDv))
            out.push(
                \`spieler-wagen: der Spieler läuft gegen den GT, der Wagen bekommt \${(sw.a.wagenDv || 0).toFixed(3)} m/s — kein Impuls\`
            );`,
    `        if (!(sw.a.kontakt >= 0 && sw.a.vorKontakt >= 1))
            out.push(\`spieler-wagen: der Spieler erreicht den GT nicht im Lauf (vakuös, \${(sw.a.vorKontakt || 0).toFixed(2)} m/s)\`);
        else if (!(sw.a.nachKontakt <= STATION.spielerAbprall * sw.a.vorKontakt))
            out.push(
                \`spieler-wagen: der Spieler läuft gegen den GT und behält seine Fahrt (\${sw.a.vorKontakt.toFixed(2)} → \${sw.a.nachKontakt.toFixed(2)} m/s) — kein Impuls\`
            );
        if (!(sw.a.wagenWeg <= STATION.wagenHaltM))
            out.push(\`spieler-wagen: der gebremste GT rutscht \${sw.a.wagenWeg.toFixed(3)} m vom Spieler (die Bremse hält nicht)\`);`
);
ers(
    `    spielerWagenDv: 0.02, // m/s: so viel Fahrt bekommt der geparkte GT mindestens vom laufenden Spieler (0710-4)`,
    `    spielerAbprall: 0.25, // Anteil der Fahrt in den Wagen, den der Spieler nach dem Kontakt höchstens behält (0710-4)
    wagenHaltM: 0.05, // m: so weit rutscht ein gebremster GT höchstens, wenn ein Mensch gegen ihn läuft`
);
ers(
    "            ? `Spieler → GT: Wagen ${swz.a.wagenDv.toFixed(3)} m/s, ${swz.a.wagenWeg.toFixed(3)} m gerutscht, tiefste Berührung ${swz.a.minAbstand.toFixed(3)} m · GT → Spieler: Spieler ${swz.b.spielerDv.toFixed(2)} m/s, tiefste Berührung ${swz.b.minAbstand.toFixed(3)} m`",
    "            ? `Spieler → GT: Fahrt in den Wagen ${swz.a.vorKontakt.toFixed(2)} → ${swz.a.nachKontakt.toFixed(2)} m/s, Wagen ${swz.a.wagenWeg.toFixed(3)} m gerutscht, tiefste Berührung ${swz.a.minAbstand.toFixed(3)} m · GT → Spieler: Spieler ${swz.b.spielerDv.toFixed(2)} m/s, tiefste Berührung ${swz.b.minAbstand.toFixed(3)} m`"
);
ers(
    `        "L6 Spieler und Wagen (0710-4): der laufende Spieler stößt den geparkten GT (der Wagen bekommt Fahrt), ein rutschender GT stößt den stehenden Spieler — Impuls nach Masse, keine Durchdringung",`,
    `        "L6 Spieler und Wagen (0710-4): der laufende Spieler prallt am gebremsten GT ab (der Wagen hält), ein rutschender GT stößt den stehenden Spieler — Impuls nach Masse, keine Durchdringung",`
);
// Selbst-Test: der gesunde Satz und der Täter-Fall in der neuen Form
ers(
    `                a: { minAbstand: 0, wagenDv: 0.3, wagenWeg: 0.01, kontakt: 100 },
                b: { minAbstand: 0, spielerDv: 3.2, angestossen: true },
            },
            leibWand:`,
    `                a: { minAbstand: 0, wagenWeg: 0.002, kontakt: 100, vorKontakt: 4.2, nachKontakt: -0.1 },
                b: { minAbstand: 0, spielerDv: 3.2, angestossen: true },
            },
            leibWand:`
);
ers(
    `                        a: { minAbstand: 0, wagenDv: 0, wagenWeg: 0, kontakt: -1 },
                        b: { minAbstand: -0.6, spielerDv: 0, angestossen: true },`,
    `                        a: { minAbstand: 0, wagenWeg: 0, kontakt: 100, vorKontakt: 4.2, nachKontakt: 4.1 },
                        b: { minAbstand: -0.6, spielerDv: 0, angestossen: true },`
);
fs.writeFileSync(p, s);
console.log("ok");
