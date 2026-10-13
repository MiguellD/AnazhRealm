// 1310-9: DIE REIHE IM BÜNDEL NACH ABSTAND — innerhalb einer Stufe zeichnet vorn zuerst; neu gestellt nur beim Anker-Wechsel
// (das Auge ≥ BUENDEL_ANKER_M vom letzten Anker) und bei jeder Aufnahme. node patch-abstand.cjs <worktree>
"use strict";
const fs = require("fs");
const path = require("path");
const ziel = path.join(process.argv[2], "anazhRealm.js");
let s = fs.readFileSync(ziel, "utf8");
if (s.includes("_buendelAnkerPruefen(")) throw new Error("schon geschnitten");
const rep = (a, b) => {
    if (s.split(a).length !== 2) throw new Error("Anker nicht eindeutig: " + a.slice(0, 90));
    s = s.replace(a, b);
};

// (1) die Reihe nimmt das Auge: in der Stufe nach Abstand der nächsten Instanz
rep(
    `    static _buendelKinderReihe(bundle) {
        const rang = (c) => (c.userData && Number.isFinite(c.userData.buendelStufe) ? c.userData.buendelStufe : 0);
        const key = (c) => String((c.userData && c.userData.archInstanceKey) || "");
        bundle.children.sort((a, b) => rang(a) - rang(b) || (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0));
    }`,
    `    // DIE REIHE NACH ABSTAND (1310-9): trägt der Ruf das Auge (\`_buendelAuge\`, der Anker der Reihe), zeichnet innerhalb einer
    // Stufe die Gruppe zuerst, deren nächste Instanz dem Auge am nächsten steht (vorn schreibt die Tiefe); ohne Auge der Schlüssel.
    static _buendelKinderReihe(bundle, auge) {
        const rang = (c) => (c.userData && Number.isFinite(c.userData.buendelStufe) ? c.userData.buendelStufe : 0);
        const key = (c) => String((c.userData && c.userData.archInstanceKey) || "");
        const nah = new Map();
        if (auge)
            for (const c of bundle.children) {
                let m = 1e30;
                const a = c.instanceMatrix && c.instanceMatrix.array;
                const n = c.count | 0;
                if (a)
                    for (let i = 0; i < n; i++) {
                        const dx = a[i * 16 + 12] - auge.x;
                        const dz = a[i * 16 + 14] - auge.z;
                        const d = dx * dx + dz * dz;
                        if (d < m) m = d;
                    }
                nah.set(c, m);
            }
        bundle.children.sort(
            (a, b) =>
                rang(a) - rang(b) ||
                (auge ? nah.get(a) - nah.get(b) : 0) ||
                (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0)
        );
    }
    // DER ANKER DER REIHE (1310-9): die Augen-Lage, an der die Bündel ihre Kinder zuletzt nach Abstand stellten. Je Frame nur
    // dieser Vergleich; erst wenn das Auge BUENDEL_ANKER_M weiter steht, stellt jedes Region-Bündel seine Reihe neu und nimmt
    // EINMAL neu auf — die Kosten folgen der Bewegung, nie dem Frame (Gebot 7). Stufen-Wechsel stellen die Reihe über die
    // Aufnahme (\`_archInstanceGroupFor\`).
    _buendelAnkerPruefen(pos) {
        const a = this._buendelAuge;
        const R = AnazhRealm.BUENDEL_ANKER_M;
        if (a && (pos.x - a.x) * (pos.x - a.x) + (pos.z - a.z) * (pos.z - a.z) <= R * R) return false;
        this._buendelAuge = { x: pos.x, z: pos.z };
        const sc = this.state.scene;
        if (sc)
            for (const c of sc.children)
                if (c && c.isBundleGroup && c.userData && c.userData.regionKey != null) {
                    AnazhRealm._buendelKinderReihe(c, this._buendelAuge);
                    c.needsUpdate = true;
                }
        return true;
    }`
);

// (2) die Aufnahmen stellen mit dem Anker
rep(
    `            bundle.add(mesh);
            AnazhRealm._buendelKinderReihe(bundle);`,
    `            bundle.add(mesh);
            AnazhRealm._buendelKinderReihe(bundle, this._buendelAuge);`
);
rep(
    `                AnazhRealm._buendelKinderReihe(parent);`,
    `                AnazhRealm._buendelKinderReihe(parent, this._buendelAuge);`
);

// (3) der Takt prüft den Anker
rep(
    `    _tickArchitectureLOD(maxSwitchesPerFrame = 5) {
        const atmo = this.state.atmosphere;
        if (atmo && atmo.treeLOD === false) return 0;
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        if (!pm) return 0;
`,
    `    _tickArchitectureLOD(maxSwitchesPerFrame = 5) {
        const atmo = this.state.atmosphere;
        if (atmo && atmo.treeLOD === false) return 0;
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        if (!pm) return 0;
        this._buendelAnkerPruefen(pm); // DIE REIHE NACH ABSTAND (1310-9): neu nur beim Anker-Wechsel
`
);

// (4) die Konstante neben ihren Geschwistern
rep(
    `AnazhRealm.WASSER_DICHTE_TAG = 0.55;`,
    `AnazhRealm.WASSER_DICHTE_TAG = 0.55;

// DER ANKER DER REIHE IM BÜNDEL (1310-9): ab diesem Weg des Auges stellen die Bündel ihre Kinder neu nach Abstand (je
// Anker-Wechsel EINE Neuaufnahme jedes Bündels, nie je Frame).
AnazhRealm.BUENDEL_ANKER_M = 16;`
);
fs.writeFileSync(ziel, s);
console.log("geschnitten:", ziel);
