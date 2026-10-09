"use strict";
const fs = require("fs");
const f = process.argv[2];
let s = fs.readFileSync(f, "utf8");
const r = (a, b) => {
    if (s.split(a).length !== 2) throw new Error("Anker " + (s.split(a).length - 1) + ": " + a.slice(0, 60));
    s = s.replace(a, b);
};
r(
    "        for (const w of werferArten) aus.werfer.push(await messen(w, zeit));",
    "        for (const w of werferArten) if (!cfg.nur || cfg.nur.includes(w.name)) aus.werfer.push(await messen(w, zeit));"
);
r(
    "    // Akne: tiefe Sonne (15°) über Boden und Hang; ein Hausdach mittags und bei tiefer Sonne\n    verstecken();",
    "    if (cfg.ohneAkne) return aus;\n    // Akne: tiefe Sonne (15°) über Boden und Hang; ein Hausdach mittags und bei tiefer Sonne\n    verstecken();"
);
r(
    "else S = await page.evaluate(probe, { W, H, zeiten: [0.32, 0.5], tief: 0.28, bilder: ECHT });",
    `else
        S = await page.evaluate(probe, {
            W,
            H,
            zeiten: process.env.SB_ZEITEN ? process.env.SB_ZEITEN.split(",").map(Number) : [0.32, 0.5],
            tief: 0.28,
            bilder: ECHT,
            nur: process.env.SB_NUR ? process.env.SB_NUR.split(",") : null,
            ohneAkne: !!process.env.SB_OHNE_AKNE,
        });`
);
r(
    "        const E = maske(dreiecke, projiziert);\n        const S = maske(dreiecke, () => {});",
    `        const E = maske(dreiecke, projiziert);
        const S = maske(dreiecke, () => {});
        let eRoh = 0,
            sRoh = 0;
        for (let i = 0; i < W * H; i++) {
            eRoh += E[i];
            sRoh += S[i];
        }
        const probe3 = [];
        for (let i = 0; i < dreiecke.length && probe3.length < 4; i += 9 * 2000) {
            const v = new T.Vector3(dreiecke[i], dreiecke[i + 1], dreiecke[i + 2]);
            const roh = v.toArray().map((x) => +x.toFixed(2));
            projiziert(v);
            const q = v.clone().project(st.camera);
            probe3.push([roh, v.toArray().map((x) => +x.toFixed(2)), [+q.x.toFixed(2), +q.y.toFixed(2), +q.z.toFixed(3)]]);
        }`
);
r(
    "            fund: fund.slice(),",
    `            fund: fund.slice(),
            eRoh,
            sRoh,
            probe3,
            licht: lichtDir().toArray().map((x) => +x.toFixed(3)),`
);
r(
    `"\\n      " + (w.fund || []).join(" | ") : ""}\``,
    `"\\n      " + (w.fund || []).join(" | ") + "\\n      eRoh " + w.eRoh + " sRoh " + w.sRoh + " licht " + JSON.stringify(w.licht) + " probe " + JSON.stringify(w.probe3) : ""}\``
);
fs.writeFileSync(f, s);
console.log("ok");
