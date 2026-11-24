// Die Decke der Karte 2 ohne Menschen-Panel und ohne Korpus: je Leiter die Sprossen, die eine Maschine allein buchen kann
// (Lücken-Regel Z3: bis zur ersten Panel-/Korpus-Sprosse; Glieder-Leitern: jede Sprosse für sich). Quelle: vision/meisterkarte-2.json,
// stationen/auge-klasse.cjs (KLASSE P/K), dazu eine Wort-Probe am Richter-Satz für Sprossen, die nicht in KLASSE stehen.
// Gebrauch (Koordinator 24.11.): in ein leeres Verzeichnis legen, dann aus einem Klon mit origin/punkte-maschine
//   git show origin/punkte-maschine:vision/meisterkarte-2.json > karte.json
//   git show origin/punkte-maschine:meisterkarte-quelle/punkte/stationen/auge-klasse.cjs > auge-klasse.cjs
//   node decke.cjs      (schreibt decke.json: je Leiter Front-Art und Decke)
const k = require("./karte.json"), a = require("./auge-klasse.cjs");
const WORT = /blind|panel|2afc|jury|prüfer|gutachter|hörer|plausib|glaubhaft|glaubwürd|stimmig|„echt“|gegen (real-)?foto|fotos? real|als foto/i;
const leitern = k.gruppen.flatMap((g) => g.kriterien.map((x) => ({ ...x, gruppe: g.id })));
const art = (l, s) => {
    const e = a.KLASSE[l.id.replace(/^karte2\./, "") + "#" + s.nr];
    if (e) return e[0];
    return WORT.test(s.richter || "") ? "p?" : "-";
};
let sum = { sprossen: 0, heute: 0, deckeA: 0, deckeB: 0, frontP: 0, frontK: 0, frontPq: 0, frontFrei: 0, hinterPanelA: 0, voll: 0 };
const jeGruppe = {};
const frontListe = [];
for (const l of leitern) {
    const gl = l.zaehlung === "glieder";
    const arten = l.sprossen.map((s) => art(l, s));
    let dA, dB;
    if (gl) {
        dA = arten.filter((x) => x !== "P" && x !== "K").length;
        dB = arten.filter((x) => x === "-" || x === "Z").length;
    } else {
        const iA = arten.findIndex((x, i) => i >= l.heute && (x === "P" || x === "K"));
        const iB = arten.findIndex((x, i) => i >= l.heute && x !== "-" && x !== "Z");
        dA = iA < 0 ? arten.length : iA;
        dB = iB < 0 ? arten.length : iB;
    }
    dA = Math.max(dA, l.heute); dB = Math.max(dB, l.heute);
    const f = l.heute < arten.length ? arten[l.heute] : "voll";
    sum.sprossen += arten.length; sum.heute += l.heute; sum.deckeA += dA; sum.deckeB += dB;
    if (f === "P") sum.frontP++; else if (f === "K") sum.frontK++; else if (f === "p?") sum.frontPq++; else if (f === "voll") sum.voll++; else sum.frontFrei++;
    sum.hinterPanelA += arten.length - dA;
    const g = (jeGruppe[l.gruppe] = jeGruppe[l.gruppe] || { leitern: 0, sprossen: 0, heute: 0, deckeA: 0, deckeB: 0, frontPK: 0 });
    g.leitern++; g.sprossen += arten.length; g.heute += l.heute; g.deckeA += dA; g.deckeB += dB; if (f === "P" || f === "K") g.frontPK++;
    frontListe.push({ id: l.id, heute: l.heute, n: arten.length, front: f, deckeA: dA, deckeB: dB, gl });
}
console.log("Leitern " + leitern.length + " · Sprossen " + sum.sprossen + " · gebucht " + sum.heute);
console.log("Front-Sprosse je Leiter: frei (Zahl) " + sum.frontFrei + " · Panel " + sum.frontP + " · Korpus " + sum.frontK + " · Panel-Wort im Satz, nicht in KLASSE " + sum.frontPq + " · Leiter voll " + sum.voll);
console.log("DECKE A (nur KLASSE P/K sperrt): " + sum.deckeA + " von " + sum.sprossen + " (" + (100 * sum.deckeA / sum.sprossen).toFixed(1) + " %) — noch buchbar " + (sum.deckeA - sum.heute));
console.log("DECKE B (dazu jedes Panel-Wort im Richter-Satz): " + sum.deckeB + " von " + sum.sprossen + " (" + (100 * sum.deckeB / sum.sprossen).toFixed(1) + " %) — noch buchbar " + (sum.deckeB - sum.heute));
for (const [g, v] of Object.entries(jeGruppe)) console.log("  " + g.padEnd(14) + " Leitern " + String(v.leitern).padStart(3) + " · Sprossen " + String(v.sprossen).padStart(4) + " · gebucht " + String(v.heute).padStart(3) + " · Decke A " + String(v.deckeA).padStart(4) + " · Decke B " + String(v.deckeB).padStart(4) + " · Front an Panel/Korpus " + v.frontPK);
require("fs").writeFileSync("decke.json", JSON.stringify({ sum, jeGruppe, leitern: frontListe }, null, 1));
const frei = frontListe.filter((x) => x.front === "-" || x.front === "Z").sort((p, q) => (q.deckeB - q.heute) - (p.deckeB - p.heute));
console.log("Leitern mit freier Front: " + frei.length + " · davon die 12 mit dem längsten freien Lauf (Decke B − gebucht):");
for (const x of frei.slice(0, 12)) console.log("  " + x.id + " " + x.heute + " → " + x.deckeB + " von " + x.n);
