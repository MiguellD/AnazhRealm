// 0710-5: die Kommentare nennen den Sim-Schritt und die auf dem OMEN gemessenen Vorher-Zahlen; L8 urteilt auch über den Bären.
"use strict";
const fs = require("fs");
function patch(p, paare) {
    let s = fs.readFileSync(p, "utf8");
    for (const [a, b] of paare) {
        if (s.split(a).length !== 2) throw new Error(p + " TREFFER: " + a.slice(0, 90));
        s = s.replace(a, b);
    }
    fs.writeFileSync(p, s);
}
const w = process.argv[2];
patch(w + "/anazhRealm.js", [
    [
        `    // updateCreatures ihn je Frame um _stossV·delta ohne Weg-Prüfung (30 fps: 7 von 10 Bären durch 0,35 m Mauer; der Wagen
    // stand nach 200 Schritten 2,03 m anders, je nach Bildrate).`,
        `    // updateCreatures ihn je Frame um _stossV·delta ohne Weg-Prüfung (30 fps und gemischte Frames: 9 von 10 Bären durch eine
    // 0,35-m-Mauer; nach 200 Sim-Schritten stand der Bär 1,39 m, der Wagen 0,06 m anders, je nach Bildrate).`,
    ],
    [
        `            // sprang ein Bär 7 von 10 Mal durch eine 0,35-m-Wand, und der Wagen las das Frame-Gedächtnis im Sim-Schritt.`,
        `            // sprang ein Bär 9 von 10 Mal durch eine 0,35-m-Wand, und der Wagen las das Frame-Gedächtnis im Sim-Schritt.`,
    ],
    [
        `        // der Arena (\`gefuehl.wucht\`) —, das Ziel ruht mit der Masse seines Leibs; was der Leib bekommt, trägt ihn in
        // updateCreatures, bis die Reibung es aufzehrt.`,
        `        // der Arena (\`gefuehl.wucht\`) —, das Ziel ruht mit der Masse seines Leibs; was der Leib bekommt, trägt ihn im
        // festen Sim-Schritt (\`_kreaturStossSchritt\`), bis die Reibung es aufzehrt.`,
    ],
    [
        `// über den Fahr-Satz; der Schlag: die wirksame Masse des Schmiede-Urteils). Was ein Leib an Geschwindigkeit bekommt,
// trägt ihn, bis die Reibung am Boden sie aufzehrt (\`updateCreatures\`) — der Bär rutscht wenig, der Fuchs fliegt;`,
        `// über den Fahr-Satz; der Schlag: die wirksame Masse des Schmiede-Urteils). Was ein Leib an Geschwindigkeit bekommt,
// trägt ihn im festen Sim-Schritt, bis die Reibung am Boden sie aufzehrt (\`_kreaturStossSchritt\`, Weg gegen die EINE
// Hülle) — der Bär rutscht wenig, der Fuchs fliegt;`,
    ],
]);
patch(w + "/scripts/diag-fahr-leben.cjs", [
    [
        `        // Bären hinter die Wand gerät. Vorher (der Stoß im Frame-Takt ohne Weg-Prüfung) 30 fps 7/10.`,
        `        // Bären hinter die Wand gerät. Vorher (der Stoß im Frame-Takt ohne Weg-Prüfung) 30 fps 9/10, gemischt 9/10.`,
    ],
    [
        `    else if (!(s.lockstep.abw <= STATION.lockstepM))`,
        `    else if (!(s.lockstep.abw <= STATION.lockstepM) || !(s.lockstep.baerAbw <= STATION.lockstepM))`,
    ],
    [
        `    lockstepM: 1e-6, // m: so weit darf die Lage des Wagens nach 200 Sim-Schritten je nach Bildrate abweichen (0710-5)`,
        `    lockstepM: 1e-6, // m: so weit dürfen Wagen und Bär nach 200 Sim-Schritten je nach Bildrate abweichen (0710-5)`,
    ],
    [
        `                "der gestoßene Bär geht bei 30 fps durch die Wand (Gegenprüfung 0710-5: 7/10)",
                { leibWand: { 60: { durch: 0, n: 10 }, 30: { durch: 7, n: 10 }, gemischt: { durch: 4, n: 10 } } },`,
        `                "der gestoßene Bär geht bei 30 fps durch die Wand (Gegenprüfung 0710-5: 9/10)",
                { leibWand: { 60: { durch: 0, n: 10 }, 30: { durch: 9, n: 10 }, gemischt: { durch: 0, n: 10 } } },`,
    ],
    [
        `                "der Wagen steht je nach Bildrate anders (Gegenprüfung 0710-5: 2,03 m nach 200 Schritten)",
                { lockstep: { abw: 2.03, baerAbw: 1.4 } },`,
        `                "der Wagen steht je nach Bildrate anders (Gegenprüfung 0710-5: 0,06 m nach 200 Schritten)",
                { lockstep: { abw: 0.06, baerAbw: 0 } },
                "lockstep",
            ],
            [
                "der Bär steht je nach Bildrate anders, der Wagen gleich (Gegenprüfung 0710-5: 1,39 m)",
                { lockstep: { abw: 0, baerAbw: 1.39 } },`,
    ],
]);
console.log("ok");
