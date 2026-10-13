// 1310-1: DIE REIHE DER BÜNDEL — der Stamm-Schnitt (anazhRealm.js) als Patch. node patch-stamm.cjs <worktree>
"use strict";
const fs = require("fs");
const path = require("path");
const ziel = path.join(process.argv[2], "anazhRealm.js");
let s = fs.readFileSync(ziel, "utf8");
if (s.includes("_buendelReihe(")) throw new Error("schon geschnitten");
const rep = (a, b) => {
    if (s.split(a).length !== 2) throw new Error("Anker nicht eindeutig: " + a.slice(0, 80));
    s = s.replace(a, b);
};
// (1) der Aufruf: jedes neue Bündel stellt die Reihe neu
rep(
    `            scene.add(bg);
            map.set(regionKey, bg);
        }
        return bg;
    }`,
    `            scene.add(bg);
            map.set(regionKey, bg);
            this._buendelReihe(scene);
        }
        return bg;
    }

    // DIE REIHE DER BÜNDEL (1310-1): r184 zeichnet die Region-Bündel in der Reihenfolge der Szene und vor jedem losen
    // Objekt — wer zuerst zeichnet, schreibt die Tiefe, hinter der die übrigen ihre Fragmente verwerfen. Die Verdecker
    // zuerst: @global (die gesetzten Gruppen ohne Wahl), dann die Regionen, @wahl zuletzt (Pflanzen-Stufen, Atlas-Karten,
    // Zwillinge — Ausschnitt je Fragment). Bis 1310-1 entschied die Ankunft beim Boot: am Genesis-Ring legte der Tor-
    // Zwilling @wahl vor @global an — bei gleichen Befehlen in EINER Sitzung gpu-bank +1,6 ms und 47,5 statt 50,1 fps unter
    // Regler voll (OMEN, GTX 1060). Jedes neue Bündel stellt die Reihe neu (stabil im Rang); die Plätze der übrigen Kinder
    // der Szene bleiben, nur die Bündel tauschen ihre Plätze untereinander.
    static _buendelRang(key) {
        return key === "@global" ? 0 : key === "@wahl" ? 2 : 1;
    }
    _buendelReihe(scene) {
        const kinder = scene.children;
        const plaetze = [];
        const buendel = [];
        for (let i = 0; i < kinder.length; i++) {
            const c = kinder[i];
            if (c && c.isBundleGroup && c.userData && c.userData.regionKey != null) {
                plaetze.push(i);
                buendel.push(c);
            }
        }
        const rang = (b) => AnazhRealm._buendelRang(b.userData.regionKey);
        const reihe = buendel.map((b, k) => ({ b, k })).sort((x, y) => rang(x.b) - rang(y.b) || x.k - y.k);
        for (let k = 0; k < plaetze.length; k++) kinder[plaetze[k]] = reihe[k].b;
    }`
);
fs.writeFileSync(ziel, s);
console.log("geschnitten:", ziel);
