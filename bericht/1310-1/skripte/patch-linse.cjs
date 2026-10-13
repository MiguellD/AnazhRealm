// 1310-1: DIE REIHE DER BÜNDEL — die Linse H7 in der Band-Wand (scripts/diag-profiband.cjs). node patch-linse.cjs <worktree>
"use strict";
const fs = require("fs");
const path = require("path");
const ziel = path.join(process.argv[2], "scripts/diag-profiband.cjs");
let s = fs.readFileSync(ziel, "utf8");
if (s.includes("buendelReiheWand")) throw new Error("schon eingebaut");
const rep = (a, b) => {
    if (s.split(a).length !== 2) throw new Error("Anker nicht eindeutig: " + a.slice(0, 80));
    s = s.replace(a, b);
};
// der Kopf
rep(
    `//   P   DIE PROJEKTION (S3):`,
    `//   H7  DIE REIHE DER BÜNDEL (1310-1): r184 zeichnet die Region-Bündel in Szenen-Reihenfolge vor jedem losen Objekt;
//       \`_buendelReihe\` des Stamms stellt @global · die Regionen · @wahl, gleich wer beim Boot zuerst ankam, und
//       \`_archRegionBundleFor\` ruft sie nach jedem neuen Bündel (am Genesis-Ring legte der Tor-Zwilling @wahl vor @global
//       an: gpu-bank +1,6 ms, 47,5 statt 50,1 fps bei gleichen Befehlen)
//   P   DIE PROJEKTION (S3):`
);
// die Wand
rep(
    `// H3 — jede Textur-/Bildziel-Erzeugung trägt ihren Erzeuger-Namen`,
    `// H7 — DIE REIHE DER BÜNDEL (1310-1): \`_buendelReihe\` aus dem Stamm über eine Szene, in der @wahl vor einer Region und
// @global ankam — danach tragen die Bündel-Plätze @global · die Regionen (in Ankunft) · @wahl, jedes andere Kind steht, wo
// es stand; \`_archRegionBundleFor\` stellt die Reihe nach jedem neuen Bündel neu.
function buendelReiheWand(src) {
    const errs = [];
    const code = PK.stripComments(src);
    const rang = rumpf(code, /\\n {4}static _buendelRang\\(key\\)\\s*\\{/);
    const reihe = rumpf(code, /\\n {4}_buendelReihe\\(scene\\)\\s*\\{/);
    const fuer = rumpf(code, /\\n {4}_archRegionBundleFor\\(regionKey\\)\\s*\\{/);
    if (!rang || !reihe)
        return { errs: ["_buendelRang / _buendelReihe fehlen im Stamm — die Reihe der Bündel hängt an der Ankunft beim Boot"], n: 0 };
    if (!fuer || !/scene\\.add\\(bg\\);[\\s\\S]*?this\\._buendelReihe\\(scene\\);/.test(fuer))
        errs.push("_archRegionBundleFor stellt die Reihe nach einem neuen Bündel nicht neu (this._buendelReihe(scene) fehlt)");
    const AR = { _buendelRang: new Function("key", rang) };
    const fn = new Function("AnazhRealm", "scene", reihe);
    const B = (k) => ({ isBundleGroup: true, name: "regionBundle:" + k, userData: { regionKey: k } });
    const scene = { children: [{ name: "voxelChunk:0,0" }, B("@wahl"), B("3,4"), { name: "himmel" }, B("@global"), B("s:1,2")] };
    fn.call({}, AR, scene);
    const ist = scene.children.map((c) => (c.userData ? c.userData.regionKey : c.name)).join(" · ");
    const soll = ["voxelChunk:0,0", "@global", "3,4", "himmel", "s:1,2", "@wahl"].join(" · ");
    if (ist !== soll) errs.push(\`die Reihe der Bündel nach der Ankunft @wahl · 3,4 · @global · s:1,2: \${ist} — Soll \${soll}\`);
    return { errs, n: 4 };
}

// H3 — jede Textur-/Bildziel-Erzeugung trägt ihren Erzeuger-Namen`
);
// der Selbsttest
rep(
    `    const rot = tests.filter((x) => !x.ok);
    for (const x of tests) console.log(`,
    `    // S30 — DIE REIHE DER BÜNDEL (H7): der Stamm hält sie; ohne den Aufruf nach einem neuen Bündel, mit @wahl im ersten Rang
    // und ohne die Reihe im Stamm wird die Wand rot (jede Verfälschung trifft die Quelle).
    {
        const st = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
        const ohneRuf = st.replace("this._buendelReihe(scene);", "");
        const wahlVorn = st.replace(
            'return key === "@global" ? 0 : key === "@wahl" ? 2 : 1;',
            'return key === "@wahl" ? 0 : key === "@global" ? 2 : 1;'
        );
        const ohneReihe = st.replace("_buendelReihe(scene) {", "_buendelReiheAlt(scene) {");
        const getroffen = ohneRuf !== st && wahlVorn !== st && ohneReihe !== st;
        t(
            "Bündel-Reihe: der Stamm stellt @global · Regionen · @wahl; ohne den Aufruf, mit @wahl vorn und ohne die Reihe rot",
            getroffen &&
                buendelReiheWand(st).errs.length === 0 &&
                buendelReiheWand(ohneRuf).errs.some((x) => /stellt die Reihe/.test(x)) &&
                buendelReiheWand(wahlVorn).errs.some((x) => /Reihe der Bündel nach der Ankunft/.test(x)) &&
                buendelReiheWand(ohneReihe).errs.some((x) => /hängt an der Ankunft/.test(x))
        );
    }

    const rot = tests.filter((x) => !x.ok);
    for (const x of tests) console.log(`
);
// main
rep(
    `    const ot = ortTaktLebt(haushalt, stamm);
    for (const f of ot.errs) errs.push("H6 " + f);`,
    `    const ot = ortTaktLebt(haushalt, stamm);
    for (const f of ot.errs) errs.push("H6 " + f);
    const br = buendelReiheWand(stamm);
    for (const f of br.errs) errs.push("H7 " + f);`
);
rep(
    "`Messorte ${ortZeile} · H6 ${ot.n} Ort-Takt- und Anker-Methoden im Stamm.`",
    "`Messorte ${ortZeile} · H6 ${ot.n} Ort-Takt- und Anker-Methoden im Stamm · H7 die Reihe der Bündel (@global · Regionen · @wahl).`"
);
fs.writeFileSync(ziel, s);
console.log("eingebaut:", ziel);
