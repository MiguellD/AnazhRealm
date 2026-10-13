// 1310-8: DIE REIHE IM BÜNDEL — die Gruppen eines Region-Bündels zeichnen nach ihrer Stufe (L0 zuerst), nie in der Ankunft.
// node patch-reihe.cjs <worktree>
"use strict";
const fs = require("fs");
const path = require("path");
const ziel = path.join(process.argv[2], "anazhRealm.js");
let s = fs.readFileSync(ziel, "utf8");
if (s.includes("_buendelKinderReihe(")) throw new Error("schon geschnitten");
const rep = (a, b) => {
    if (s.split(a).length !== 2) throw new Error("Anker nicht eindeutig: " + a.slice(0, 90));
    s = s.replace(a, b);
};

// (1) das Leaf trägt seine Stufe (der Flatten kennt sie)
rep(
    `                    leafKey: "f:" + key + ":" + p,
`,
    `                    leafKey: "f:" + key + ":" + p,
                    stufe: lod, // die Stufe des Leafs — der Rang seiner Gruppe im Bündel (\`_buendelKinderReihe\`)
`
);

// (2) die Gruppe trägt den Rang am Mesh, das Bündel stellt seine Reihe
rep(
    `        mesh.userData.archInstanceKey = key;
`,
    `        mesh.userData.archInstanceKey = key;
        // der Rang im Bündel (\`_buendelKinderReihe\`): die Stufe des Leafs, die Atlas-Karte (fern) zuletzt
        mesh.userData.buendelStufe = atlasGruppe ? 9 : Number.isFinite(leaf.stufe) ? leaf.stufe : 0;
`
);
rep(
    `            bundle.add(mesh);
`,
    `            bundle.add(mesh);
            AnazhRealm._buendelKinderReihe(bundle);
`
);
rep(
    `        next.userData.archInstanceKey = g.key;
`,
    `        next.userData.archInstanceKey = g.key;
        next.userData.buendelStufe = g.mesh.userData.buendelStufe;
`
);
rep(
    `            parent.add(next);
            if (parent.isBundleGroup) parent.needsUpdate = true;`,
    `            parent.add(next);
            if (parent.isBundleGroup) {
                AnazhRealm._buendelKinderReihe(parent);
                parent.needsUpdate = true;
            }`
);

// (3) das Gesetz neben der Reihe der Bündel
rep(
    `    static _buendelRang(key) {`,
    `    // DIE REIHE IM BÜNDEL (1310-8): auch die Gruppen EINES Bündels zeichnen in seiner Kinder-Folge — bis 1310-8 die Ankunft ihrer
    // Assets beim Boot. Die nahe Stufe zuerst (L0 vor L1 vor der Atlas-Karte), im Gleichstand der Schlüssel: wer nah steht,
    // schreibt die Tiefe, hinter der die fernen Stufen ihre Fragmente verwerfen. Gemessen an der Mess-Wiese (OMEN, GTX 1060,
    // EINE Sitzung, Gier 0, alle Bäume an/aus): der Baum-Preis in der Ankunft 5,02/5,25 ms, nach Stufe aufsteigend 3,46/3,33,
    // absteigend 7,26 — gpu-bank 14,1 → 12,4 ms. Jede Aufnahme eines Kinds stellt die Reihe neu (\`_archInstanceGroupFor\`, das
    // Wachsen der Gruppe); das Bündel nimmt danach ohnehin neu auf.
    static _buendelKinderReihe(bundle) {
        const rang = (c) => (c.userData && Number.isFinite(c.userData.buendelStufe) ? c.userData.buendelStufe : 0);
        const key = (c) => String((c.userData && c.userData.archInstanceKey) || "");
        bundle.children.sort((a, b) => rang(a) - rang(b) || (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0));
    }
    static _buendelRang(key) {`
);
fs.writeFileSync(ziel, s);
console.log("geschnitten:", ziel);
