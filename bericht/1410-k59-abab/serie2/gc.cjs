// 1410-k59-abab: GC und Kreatur-Takt je FRAME aus den Profil-Schritten der Messfolge (Wiese) — node gc.cjs <dir> [kombi …]
"use strict";
const fs = require("fs");
const path = require("path");
const dir = process.argv[2];
const kombis = process.argv.slice(3).length ? process.argv.slice(3) : ["w-ego", "w-third"];
const proFrame = (zeilen, re, frames) => {
    const z = (zeilen || []).find((l) => re.test(l));
    const m = z && /(\d+) ms/.exec(z);
    return m ? Math.round((+m[1] * 1000 * 10) / frames) / 10 : 0;
};
for (const k of kombis) {
    const seiten = { A: [], B: [] };
    for (const n of fs.readdirSync(dir).sort()) {
        const m = new RegExp(`^${k}-([AB])(\\d)\\.json$`).exec(n);
        if (!m) continue;
        const j = JSON.parse(fs.readFileSync(path.join(dir, n), "utf8"));
        const s = (j.schritte || []).find((x) => x.name === "profil");
        if (!s || !s.ergebnis || !s.ergebnis.frames) continue;
        const e = s.ergebnis;
        seiten[m[1]].push({
            boot: `${m[1]}${m[2]}`,
            gc: proFrame(e.selbst, /garbage collector/, e.frames),
            updateCreatures: proFrame(e.gesamt, / updateCreatures /, e.frames),
            updateMatrixWorld: proFrame(e.selbst, / updateMatrixWorld /, e.frames),
            loop: proFrame(e.gesamt, / loop /, e.frames),
        });
    }
    const mit = (a, f) => (a.length ? Math.round((a.reduce((x, y) => x + y[f], 0) / a.length) * 10) / 10 : null);
    console.log(
        `${dir} ${k}: ` +
            ["gc", "updateCreatures", "updateMatrixWorld", "loop"]
                .map((f) => `${f} A ${seiten.A.map((x) => x[f]).join("|")} (${mit(seiten.A, f)}) → B ${seiten.B.map((x) => x[f]).join("|")} (${mit(seiten.B, f)})`)
                .join(" · ")
    );
}
