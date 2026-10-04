#!/usr/bin/env node
// ============================================================================
// DIE STREU-WAHRHEIT — gate:streu-wahrheit (04.10., Bild-Wahrheit (b))
//
// Befund (echte GPU, Werkbank, Mess-Wiese): schwarze Brocken und schwarze Flächen auf der hellen Wiese. Zwei
// Täter, eine Klasse — die Klein-Streu (KLEIN_VEGETATION_SPECIES) las ihr Licht nicht:
//   (1) DIE NORMALEN: der Fels-Oktaeder lief im Uhrzeigersinn — alle acht Flächen-Normalen zeigten nach INNEN.
//       Mit FrontSide zeichnete jeder Brocken seine Innen-Rückwand, im eigenen Schatten: schwarz (1067 Brocken).
//   (2) DER HIMMEL: die Welt trägt ihr Umgebungs-Licht nur als scene.environment (Ambient/Hemi 0); r184-Lambert
//       liest die Umgebung nur als Spiegelung, nie diffus — jeder Lambert-Stoff war im Schatten schwarz.
// Die Linse (Node, ohne Browser):
//   (1) baut jede Art über DEN Stamm-Bauplan (_scatterSpeciesGeometry aus anazhRealm.js, KLEIN_VEGETATION_SPECIES
//       aus demselben Quelltext) und prüft für jede einseitig gezeichnete Art (nicht wind, nicht emissiv —
//       dieselbe Seiten-Regel wie _scatterMaterial), dass JEDE Dreiecks-Normale vom Schwerpunkt weg zeigt;
//   (2) prüft den kommentar-freien _scatterMaterial: kein Lambert, der lit Zweig ist MeshStandardNodeMaterial.
// --selftest: der Fels im alten Uhrzeigersinn und der Lambert-Zweig zurück → beide MÜSSEN beim Namen feuern.
// Exit: 0 grün · 1 rot.
// ============================================================================
"use strict";
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const QUELLE = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");

// Kommentare strippen, Strings bewahren (zeichenweise, string-bewusst).
function ohneKommentare(src) {
    let out = "";
    let i = 0;
    const n = src.length;
    while (i < n) {
        const c = src[i];
        const d = src[i + 1];
        if (c === "/" && d === "/") {
            while (i < n && src[i] !== "\n") i++;
            continue;
        }
        if (c === "/" && d === "*") {
            i += 2;
            while (i < n && !(src[i] === "*" && src[i + 1] === "/")) i++;
            i += 2;
            continue;
        }
        if (c === '"' || c === "'" || c === "`") {
            const q = c;
            out += c;
            i++;
            while (i < n && src[i] !== q) {
                if (src[i] === "\\") {
                    out += src[i] + (src[i + 1] || "");
                    i += 2;
                    continue;
                }
                out += src[i];
                i++;
            }
            out += q;
            i++;
            continue;
        }
        out += c;
        i++;
    }
    return out;
}

// Den Rumpf ab dem ersten `{` nach dem Kopf (Klammer-Zählung).
function rumpf(src, kopfRe) {
    const m = kopfRe.exec(src);
    if (!m) return null;
    let i = src.indexOf("{", m.index + m[0].length - 1);
    let tiefe = 0;
    const start = i;
    for (; i < src.length; i++) {
        if (src[i] === "{") tiefe++;
        else if (src[i] === "}" && --tiefe === 0) return src.slice(start, i + 1);
    }
    return null;
}

// Der Mini-THREE des Bauplans: _scatterSpeciesGeometry braucht nur BufferGeometry + Float32BufferAttribute.
const THREE_SCHEIN = {
    BufferGeometry: class {
        constructor() {
            this.attributes = {};
        }
        setAttribute(k, a) {
            this.attributes[k] = a;
        }
        computeVertexNormals() {}
        computeBoundingSphere() {}
    },
    Float32BufferAttribute: class {
        constructor(arr, size) {
            this.array = Float32Array.from(arr);
            this.itemSize = size;
        }
    },
};

function pruefe(src) {
    const fehler = [];
    const arten = rumpf(src, /static get KLEIN_VEGETATION_SPECIES\(\)\s*\{/);
    const bau = rumpf(src, /\n {4}_scatterSpeciesGeometry\(species\)\s*\{/);
    if (!arten || !bau)
        return { fehler: ["KLEIN_VEGETATION_SPECIES oder _scatterSpeciesGeometry nicht im Stamm gefunden"], geprueft: 0 };
    const liste = new Function(arten)();
    const bauFn = new Function("THREE", "species", bau.slice(1, -1));
    const kontext = { state: {} };
    let geprueft = 0;
    for (const sp of liste) {
        const einseitig = !sp.emissive && !sp.wind; // _scatterMaterial: wind → DoubleSide, sonst FrontSide; emissiv unlit
        if (!einseitig) continue;
        kontext.state = {};
        const g = bauFn.call(kontext, THREE_SCHEIN, sp);
        const P = g && g.attributes.position ? g.attributes.position.array : null;
        if (!P || P.length < 9) {
            fehler.push(`${sp.name}: keine Geometrie`);
            continue;
        }
        geprueft++;
        let cx = 0,
            cy = 0,
            cz = 0;
        const nv = P.length / 3;
        for (let i = 0; i < P.length; i += 3) {
            cx += P[i];
            cy += P[i + 1];
            cz += P[i + 2];
        }
        cx /= nv;
        cy /= nv;
        cz /= nv;
        let innen = 0;
        const nTri = P.length / 9;
        for (let t = 0; t < nTri; t++) {
            const o = t * 9;
            const ax = P[o + 3] - P[o],
                ay = P[o + 4] - P[o + 1],
                az = P[o + 5] - P[o + 2];
            const bx = P[o + 6] - P[o],
                by = P[o + 7] - P[o + 1],
                bz = P[o + 8] - P[o + 2];
            const nx = ay * bz - az * by,
                ny = az * bx - ax * bz,
                nz = ax * by - ay * bx;
            const mx = (P[o] + P[o + 3] + P[o + 6]) / 3 - cx,
                my = (P[o + 1] + P[o + 4] + P[o + 7]) / 3 - cy,
                mz = (P[o + 2] + P[o + 5] + P[o + 8]) / 3 - cz;
            if (nx * mx + ny * my + nz * mz <= 0) innen++;
        }
        if (innen) fehler.push(`${sp.name}: ${innen} von ${nTri} Flächen-Normalen zeigen nach INNEN (FrontSide zeigt die Rückwand)`);
    }
    if (!geprueft) fehler.push("keine einseitige Art geprüft — die Linse sähe nichts");
    const stoff = rumpf(ohneKommentare(src), /\n {4}_scatterMaterial\(species\)\s*\{/) || "";
    if (!stoff) fehler.push("_scatterMaterial nicht gefunden");
    else {
        if (/Lambert/.test(stoff)) fehler.push("_scatterMaterial baut Lambert — r184-Lambert liest den Himmel (scene.environment) nie diffus");
        if (!/new THREE\.MeshStandardNodeMaterial\(/.test(stoff)) fehler.push("_scatterMaterial: der lit Zweig ist nicht MeshStandardNodeMaterial");
        if (!/side: species\.wind \? THREE\.DoubleSide : THREE\.FrontSide/.test(stoff))
            fehler.push("_scatterMaterial: die Seiten-Regel (wind → DoubleSide, sonst FrontSide) hat sich verschoben — die Linse prüft die falsche Menge");
    }
    return { fehler, geprueft };
}

function main() {
    if (process.argv.includes("--selftest")) {
        const echt = pruefe(QUELLE);
        const brueche = [
            ["Fels im Uhrzeigersinn", QUELLE.replace("tri(top, b, a, cTop, c, c);", "tri(top, a, b, cTop, c, c);"), /fels: /],
            [
                "Lambert-Zweig",
                QUELLE.replace("mat = new THREE.MeshStandardNodeMaterial({\n                    side: species.wind", "mat = new THREE.MeshLambertNodeMaterial({\n                    side: species.wind"),
                /Lambert/,
            ],
        ];
        let ok = Array.isArray(echt.fehler) && echt.fehler.length === 0;
        console.log(`${ok ? "✅" : "❌"} SELBST-TEST: die echte Quelle ist grün${ok ? "" : " — " + echt.fehler.join(" · ")}`);
        for (const [name, src, muster] of brueche) {
            const r = pruefe(src);
            const feuert = src !== QUELLE && r.fehler.some((f) => muster.test(f));
            console.log(`${feuert ? "✅" : "❌"} SELBST-TEST: „${name}" → die Linse nennt ihn${r.fehler.length ? " — " + r.fehler[0] : ""}`);
            ok = ok && feuert;
        }
        process.exit(ok ? 0 : 1);
    }
    const r = pruefe(QUELLE);
    if (r.fehler.length) {
        console.error("⛔ DIE STREU-WAHRHEIT:");
        for (const f of r.fehler) console.error("   ❌ " + f);
        process.exit(1);
    }
    console.log(
        `✅ DIE STREU-WAHRHEIT steht — ${r.geprueft} einseitige Arten mit Außen-Normalen (jede Fläche zeigt vom Schwerpunkt weg), die Streu-Stoffe lesen den EINEN Himmel (Standard, kein Lambert).`
    );
}
main();
