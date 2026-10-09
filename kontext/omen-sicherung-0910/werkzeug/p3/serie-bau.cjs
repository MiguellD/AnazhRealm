// baut p3/serie-0710-9.sh aus abab535/serie.sh (0710-6): Seiten, Instrument, Ausgabe-Ordner, Blind-Regel für A (0710-7)
"use strict";
const fs = require("fs");
let s = fs.readFileSync("abab535/serie.sh", "utf8");
const R = (a, b) => {
    if (s.split(a).length !== 2) throw new Error("ANKER: " + a);
    s = s.replace(a, b);
};
R(
    "# Auftrag 0710-6: V18.535 gegen main — ABABABAB",
    "# Auftrag 0710-9: V18.536 gegen main — ABABABAB"
);
R("INSTR=$BASE/abab-b535", "INSTR=$BASE/abab-b536");
R("OUT=$BASE/abab535; mkdir -p $OUT", "OUT=$BASE/abab536; mkdir -p $OUT");
R("A=$BASE/abab-a535   # main 78ee56da (V18.534 + Hotfix Weltbild-Frost)", "A=$BASE/abab-b535   # main c966b9c3 (V18.535)");
R("B=$BASE/abab-b535   # integ-probe c966b9c3 (V18.535)", "B=$BASE/abab-b536   # integ-probe 76c9624d (V18.536)");
R("(main)  B=$(git -C $B log -1 --format=%h) (integ-probe)", "(main V18.535)  B=$(git -C $B log -1 --format=%h) (integ-probe V18.536)");
const a = s.indexOf("    U=$(node -e");
const b = s.indexOf('    say "$N exit=$ec  $U"');
if (a < 0 || b < 0) throw new Error("U-Block");
const neu = `    # A (V18.535) kennt die Welt-Akte nicht: die Wache WELTAKT nennt dort jeden Schritt „blind" — ein A-Boot zählt, wenn das sein
    # einziger Befund ist (ein Täter „durch" verwirft ihn)
    U=$(node -e "
      try {
        const j = require(process.argv[1]);
        const blind = (b) => /^WELTAKT [^:]+: das Spiel nennt keine Welt-Akte/.test(b);
        const rest = j.befunde.filter((b) => !(process.argv[2] === 'A' && blind(b)));
        const gruen = j.urteil === 'GRUEN' || (!j.abbruch && rest.length === 0 && j.befunde.length > 0);
        const u = gruen ? (j.urteil === 'GRUEN' ? 'GRUEN' : 'GRUEN(A blind)') : j.urteil;
        console.log(u + ' | ' + (j.abbruch || '') + ' | ' + rest.slice(0, 6).join(' ; '));
      } catch (e) { console.log('KEIN-JSON | ' + e.message); }" $OUT/$N.json $X)
`;
s = s.slice(0, a) + neu + s.slice(b);
fs.writeFileSync("p3/serie-0710-9.sh", s);
console.log("ok");
