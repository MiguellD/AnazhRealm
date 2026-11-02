// diag-charakter-achsen.cjs — DIE CHARAKTER-ACHSEN DER STUDIOS (Konsum-Beweis).
// Die Studios tragen ORTHOGONALE Design-Sprachen — Schmiede-TRADITIONEN
// (Frank/Nihon/Pars/Urvolk/Brut), Garage-KULTUREN (cavallo/toro/stern/vorsprung/
// monolith), 22 Klang-Genres — die Welt wählt sie. Diese Linse hält die Naht:
//
//   T (Tradition): ov.__tradition FORMT die Klinge (Fingerprint je Tradition
//     verschieden; Möbel folgen: Nihon = Kashira anders als Frank-Scheibenknauf),
//     (den ov-FREIEN Bau hält byte-stabil gate:schmiede-contract mit den v5-Goldens).
//   K (Kultur): jede Zeile der KULTUREN-Tabelle formt den GT anders (ihr
//     fx-Dial-Vektor reist als ov durch die vehicle-Merge-Ordnung).
//   E (Epoche, vehicle-core EPOCHE_GESETZ): der Regler `epoche` formt jeden Wagen durch die Zeit — „heute" ist der Bau
//     ohne Epoche (byte-gleich), jede Stufe und jeder Halbschritt dazwischen baut andere Bytes (Geometrie und Stoffe) als sein
//     Nachbar: keine tote Stufe, keine klebende Form; jede Stufe baut die Baugruppen ihrer `gestalt` (Kutsche: Bock, Bank,
//     Verdeck … · Motorwagen: Kühler, Kotflügel, Trittbrett … · Zukunft: Kanzel, Licht-Kante, verkleidetes Rad) und dann nie die
//     Haut von heute (`autoHaut`), jede andere nur sie. Der Selbst-Test macht den Motorwagen zur Kopie der Kutsche, gibt
//     „heute" eine Form und nimmt der Zukunft ihre Gestalt — jedes rot beim Namen.
//   G (Genres) hält gate:daten-contract: die PRESETS von klang-core stehen dort sha256-golden (bis 02.11. zählte G sie hier ein zweites Mal).
//   V (Lade-Karte): index.html lädt kein Spiel-Script ohne ?v=-Buster (Lehre 10,
//     eine Absenz über den EINEN Helfer stammLib.fehlt; vendor/ ausgenommen). Dass
//     die Kerne main-seitig laden, beweist die Prägung in der Welt (gate:praegung-
//     welt, gate:portal-membran) am Verhalten; keine Probe liest Quelltext (D3c/D3d).
//
//   node scripts/diag-charakter-achsen.cjs
"use strict";

const { studioKern, pruefer, stammLib } = require("./lib/welt-boot.cjs");
const { fingerabdruck } = require("./lib/plattform-probe.cjs");
const SC = studioKern("schmiede-core.js", "__schmiedeCore");
const VC = studioKern("vehicle-core.js", "__vehicleCore");

const { errs, check, wandEnde } = pruefer();
const fp = (g) => fingerabdruck(g).sha256;

console.log("=== CHARAKTER-ACHSEN — Tradition · Kultur · Epoche ===");

// ── T: die Tradition formt ──
const TRADS = Object.keys(SC.TRADITIONEN);
const frank = fp(SC.buildInstance("langschwert", 7, 0, null));
const T = new Set(TRADS.map((t) => fp(SC.buildInstance("langschwert", 7, 0, { __tradition: t }))));
check("T: JEDE der 5 Traditionen formt das Langschwert anders", T.size === 5 && T.has(frank), `${T.size}/5`);
const unbekannt = fp(SC.buildInstance("langschwert", 7, 0, { __tradition: "klingon" }));
check("T: unbekannte Tradition fällt fail-soft auf Frank", unbekannt === frank);

// ── K: jede Kultur FORMT den Wagen (Konsum statt Existenz: bis zur Zeit-Achse prüfte K nur die Zeilen der Tafel) ──
const K = new Set([fp(VC.buildInstance("gt", 7, 0))]);
for (const k in VC.CULTURES) K.add(fp(VC.buildInstance("gt", 7, 0, VC.CULTURES[k].fx)));
check("K: jede der 5 Kulturen formt den GT anders", K.size === 6, K.size);

// ── V: die Lade-Karte der Welt ──
check(
    "V: jedes Spiel-Script der index.html trägt ?v= (vendor/ frei)",
    stammLib.fehlt(null, /src="(?!vendor\/)[^"?]+\.js"/, { datei: "index.html" }),
    stammLib.fehlt.wo
);

// ── E: die Epoche formt jeden Wagen; der Selbst-Test: tote Kutsche, „heute" mit Form ──
const EG = VC.EPOCHE_GESETZ,
    H = EG.findIndex((x) => x.id === "heute");
function epoche(gattungen) {
    const out = [];
    for (const r of gattungen)
        for (let e = 0, vor; e < EG.length - 0.9; e += 0.5) {
            const g = VC.buildInstance(r, 7, 0, { epoche: e }),
                x = fp(g),
                n = new Set(),
                G = EG[Math.round(e)].gestalt || [];
            g.traverse((o) => n.add(o.name));
            for (const m of [...G, "autoHaut"]) if (n.has(m) !== (m !== "autoHaut" || !G.length)) out.push(`${r}@${e} ${m}`);
            if (x === vor) out.push(`${r}: tote Stufe ${EG[Math.ceil(e)].id}`);
            if (e === H && x !== fp(VC.buildInstance(r, 7, 0))) out.push(`${r}: heute bricht`);
            vor = x;
        }
    return out;
}
const E = epoche(Object.keys(VC.PRESETS));
check("E: jede Epoche formt jeden Wagen in seiner Gestalt", !E.length, E.join(" · "));
const alt = EG.slice();
EG[H - 1] = alt[H - 2];
EG[H] = { s: { radR: 0.3 }, erbe: 0 };
EG[H + 1] = { ...alt[H + 1], gestuft: {} };
const kaputt = epoche(["gt"]);
Object.assign(EG, alt);
check("SELBST-TEST E", /kutsche.*heute bricht.*@5 kanzel.*@5 autoHaut/.test(kaputt), kaputt.join(" · "));

wandEnde(errs, "die Charakter-Achsen formen: Tradition, Kultur, Epoche.");
