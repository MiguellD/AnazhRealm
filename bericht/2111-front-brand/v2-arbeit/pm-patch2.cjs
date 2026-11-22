// pm-patch2.cjs — der Leser von same.physik.reaktion#1, v2: BEIDE Hälften der Karte gerichtet (Masse ±10 %, Rauch proportional)
// gegen den Kopf von punkte-maschine (pm-neu/k2-same.orig.js) → pm-neu/k2-same.js
const fs = require("fs");
const D = "C:/Users/User/AppData/Local/Temp/e10w/knoten/bericht/pm-neu/";
let t = fs.readFileSync(D + "k2-same.orig.js", "utf8");
const tausch = (alt, neu) => {
    const n = t.split(alt).length - 1;
    if (n !== 1) throw new Error("Anker " + JSON.stringify(alt.slice(0, 90)) + " steht " + n + "×");
    t = t.replace(alt, () => neu);
};
// (1) die Worte der Leiter
tausch(
    `    // Die Welt zählt ihre Reaktionen: die Zeilen der Stoff-Tafel mit Brenn-Spalte (die einzige Reaktion, Rothermel); jede verlangte
    // Masse, Druckwelle, Korrosion je Ort, Schmelze fehlt beim Namen;`,
    `    // Die Welt zählt ihre Reaktionen: die Zeilen der Stoff-Tafel mit Brenn-Spalte (die einzige Reaktion, Rothermel). S1 misst die Masse
    // des Brands an der Mess-Wiese (\`masseProbe\`: Holz → Asche + Rauch, und der Rauch im Bild proportional zum verzehrten Holz über drei
    // Herde); Druckwelle, Korrosion je Ort, Schmelze fehlen beim Namen;`
);
// (2) das Soll: der ganze Satz der Karte, beide Hälften je ein Wort
tausch(
    `                    soll: [{ wort: "masse_abw_pct", richtung: "≤", wert: 10, wortlaut: "Asche + Rauch-Masse = Holz ±10 %", feld: "richter" }],`,
    `                    // BEIDE HÄLFTEN DES SATZES sind gerichtet: die Masse (Asche + Rauch gegen das Holz) und „Rauchmenge sichtbar
                    // proportional" (die optische Fläche der Fahne je kg verzehrtes Holz über drei Herde, größte Abweichung vom Mittel) —
                    // der Satz nennt EINE Zahl, sie gilt beiden
                    soll: [
                        { wort: "masse_abw_pct", richtung: "≤", wert: 10, wortlaut: "Asche + Rauch-Masse = Holz ±10 %", feld: "richter" },
                        { wort: "rauch_prop_abw_pct", richtung: "≤", wert: 10, wortlaut: "Asche + Rauch-Masse = Holz ±10 %, Rauchmenge sichtbar proportional", feld: "richter" },
                    ],`
);
// (3) die Probe der Seite
const seite = fs
    .readFileSync("C:/Users/User/AppData/Local/Temp/e10w/knoten/masse/reaktion-seite2.js", "utf8")
    .trimEnd()
    .split("\n")
    .map((z) => (z ? "                    " + z : z))
    .join("\n");
tausch(
    `                const z = await L.ev("return (" + zaehlen + ")(r);", 30);
                L.zeile("Reaktionen der Stoff-Tafel: " + JSON.stringify(z));`,
    `                // DIE MASSE BLEIBT, DER RAUCH IST PROPORTIONAL (front-brand, stamm/feld-brand.js \`_brandMasse\` · \`_brandStrom\` · \`_brandRauch\`)
                async function masseProbe(r) {
${seite}
                }
                const z = await L.ev("return (" + zaehlen + ")(r);", 30);
                L.zeile("Reaktionen der Stoff-Tafel: " + JSON.stringify(z));`
);
// (4) das Urteil der Sprosse
tausch(
    `                    L.leser(1, "Masse von Asche und Rauch: die Asche ist eine Decke ohne Masse (stamm/feld-brand.js:5 \`_ascheAt\`), der Rauch ein Bild-Budget (stamm/feld-brand.js:720 \`_brandRauch\`) — " + z.brenn.join(", ") + " brennen", z.brenn.length);`,
    `                    const m = await L.ev("return await (" + masseProbe + ")(r);", 120);
                    L.zeile("Masse der Reaktion: " + JSON.stringify(m));
                    if (m.fehler) return L.umfang(1, 0, m.fehler);
                    if (m.masse_abw_pct === null)
                        return L.leser(1, "Masse von Asche und Rauch: " + (m.asche === null ? "die Tat \`brand\` trägt keine Asche in kg (stamm/feld-brand.js \`_brandArbeit\`)" : "die Ballen der Fahne tragen keine Masse (stamm/feld-brand.js \`_brandRauch\`)") + " — " + z.brenn.join(", ") + " brennen", z.brenn.length);
                    const herde = m.herde.map((h) => h.zellen + " Zellen: " + h.holz + " kg Holz → " + h.optisch + " m² optisch (" + h.jeKg + " m²/kg)").join(" · ");
                    L.gemessen(1, { masse_abw_pct: m.masse_abw_pct, rauch_prop_abw_pct: m.rauch_prop_abw_pct }, { erzeugt: 1, welt: { umgesetzt_kg: m.umgesetzt_kg }, taeter: "MASSE: Holz " + m.holz + " kg (" + m.bett.stoff + ", Mess-Wiese) → Asche " + m.asche + " kg + Rauch " + m.rauch + " kg · PROPORTIONAL: " + herde + (m.rang ? "" : " — die Folge der Herde nach Holz ist nicht die nach optischer Fläche") });`
);
fs.writeFileSync(D + "k2-same.js", t);
console.log("gesetzt", t.length);
