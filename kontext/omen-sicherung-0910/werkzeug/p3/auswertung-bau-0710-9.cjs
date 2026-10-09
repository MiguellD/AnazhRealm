// baut p3/auswertung-0710-9.cjs aus abab535/auswertung.cjs (0710-6, mit Hängern) + Profil inklusive + Welt-Halt (0710-7)
"use strict";
const fs = require("fs");
let s = fs.readFileSync("abab535/auswertung.cjs", "utf8");
const R = (a, b) => {
    if (s.split(a).length !== 2) throw new Error("ANKER: " + a.slice(0, 80));
    s = s.replace(a, b);
};
R(
    "// Auswertung 0710-6 (aus 0710-1 P1): je Boot die Kurzfassung, Tiere, Hänger je Slot, Mediane A gegen B, Profil-Top-10, Wachen.",
    "// Auswertung 0710-9 (aus 0710-6 + 0710-7): je Boot die Kurzfassung, Tiere, Hänger je Slot, Mediane A gegen B, Profil-Top-10 und\n// Gesamtzeit der Strahl-/Löser-Funktionen, Wachen (Wetter- und Welt-Halt)."
);
R(
    "const profil = { A: {}, B: {} };",
    'const profil = { A: {}, B: {} };\nconst inkl = { A: {}, B: {} };\nconst INKL = ["_loopCamera", "_ceilingHeadroom", "_fieldRaycast", "_segmentAABB", "_loopFixedStep", "_stepCharacterStructures", "_kreaturHuellenKontakt", "updateCreatures", "tickAffordances"];'
);
R(
    "    const gpuZeile =",
    `    const welt = {};
    for (const st of j.schritte)
        for (const e of (st.wache && st.wache.weltakt && st.wache.weltakt.buch) || []) {
            const k = \`\${e.art} \${e.quelle}→\${e.op}\`;
            welt[k] = (welt[k] || 0) + 1;
        }
    const gpuZeile =`
);
R("        verw,\n", "        verw,\n        welt,\n");
R(
    "        (profil[S][k] = profil[S][k] || []).push(+mm[1]);\n    }",
    `        (profil[S][k] = profil[S][k] || []).push(+mm[1]);
    }
    for (const fn of INKL) {
        let pc = 0;
        for (const row of pr.gesamt || []) {
            const mm = /^\\s*([\\d.]+) %\\s+(\\d+) ms\\s+(\\S+) /.exec(row);
            if (mm && mm[3] === fn) pc = Math.max(pc, +mm[1]);
        }
        (inkl[S][fn] = inkl[S][fn] || []).push(pc);
    }`
);
R(
    'p("| Größe | A (main 78ee56da) | B (integ-probe c966b9c3) | B − A |");',
    'p("| Größe | A (main c966b9c3, V18.535) | B (integ-probe 76c9624d, V18.536) | B − A |");'
);
R(
    'p("## Hänger > 100 ms je Slot',
    `p("## Gesamtzeit-Anteil ausgewählter Funktionen (%, Median je Seite über 4 Boots)");
p("");
p("| Funktion | A % | B % |");
p("|---|---|---|");
for (const fn of INKL) p(\`| \${fn} | \${f1(med(inkl.A[fn] || []))} | \${f1(med(inkl.B[fn] || []))} |\`);
p("");
p("## Hänger > 100 ms je Slot`
);
R(
    'fs.writeFileSync(path.join(DIR, "auswertung.md"), out);',
    `p("");
p("## Welt-Halt: Züge je Quelle (B hält, A ist blind)");
for (const z of zeilen) p(\`- \${z.N}: \${Object.entries(z.welt).map(([k, n]) => \`\${k} \${n}\`).join(" · ") || "keine"}\`);
fs.writeFileSync(path.join(DIR, "auswertung.md"), out);`
);
R("JSON.stringify({ zeilen, profil }, null, 1)", "JSON.stringify({ zeilen, profil, inkl }, null, 1)");
fs.writeFileSync("p3/auswertung-0710-9.cjs", s);
console.log("ok");
