// lade-pruef.cjs — lädt die gepatchte Station im Scratch-Baum der Punkte-Maschine: die Wand des Wortlauts fällt beim Laden; je Sprosse
// der Leiter same.physik.reaktion die Selbsttest-Fälle der Maschine (`proben`: GRÜN genau am Soll, jedes Soll daneben ROT, der Umfang
// darunter ROT, die Attrappe ROT …) gegen das Urteil der Station.
"use strict";
const path = require("path");
const P = path.join(__dirname, "pm", "meisterkarte-quelle", "punkte");
const m = require(path.join(P, "stationen", "k2-same.js"));
const alle = Array.isArray(m) ? m : m.stationen || m.STATIONEN || Object.values(m).find(Array.isArray);
console.log("Schlüssel des Moduls: " + Object.keys(m).join(", ") + " · Stationen " + (alle ? alle.length : "?"));
const R = alle.filter((s) => s.kriterium === "karte2.same.physik.reaktion");
let rot = 0;
for (const st of R) {
    const b = st.probe.befehl;
    let faelle = 0, falsch = [];
    for (const p of st.proben || []) {
        const u = st.urteil(p.j, {});
        faelle++;
        if (u.gruen !== p.gruen || (p.zahl && !p.zahl.test(u.zahl))) falsch.push(p.name + " → " + JSON.stringify(u).slice(0, 160));
    }
    rot += falsch.length;
    console.log("S" + st.staffel + " · Selbsttest-Fälle " + faelle + " · falsch " + falsch.length + (falsch.length ? " · " + falsch.join(" | ") : "") + " · argv " + b.reduce((s, x) => s + String(x).length, 0) + " Zeichen · sek " + st.probe.sek + " · quelle " + st.quelle.slice(0, 90));
}
// das Urteil von S2 an den Zahlen des Probelaufs (GTX 1050): 25,55 % statt ≤ 25 fällt ROT beim Namen; 3 Ladungen, 53 Scheiben
const S2 = R.find((s) => s.staffel === 2);
const AD = "[linse-gpu] nvidia/pascal GTX 1050 (Probe)";
const u = (werte, erzeugt, welt) => S2.urteil({ hw: AD, sprossen: { 2: { art: "gemessen", werte, erzeugt, welt } } }, {});
console.log("S2 an 25,55 %: " + JSON.stringify(u({ radius_abw_pct: 25.55 }, 3, { gebrochen: 53 })));
console.log("S2 an 20 %:    " + JSON.stringify(u({ radius_abw_pct: 20 }, 3, { gebrochen: 53 })));
console.log("S2 an 20 %, 2 Ladungen: " + JSON.stringify(u({ radius_abw_pct: 20 }, 2, { gebrochen: 53 })));
console.log(rot ? "ROT " + rot : "GRÜN");
process.exit(rot ? 1 : 0);
