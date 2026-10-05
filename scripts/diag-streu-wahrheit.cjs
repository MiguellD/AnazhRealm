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
// Integration (04.10.): die Klasse fällt GANZ — der ganze Stamm baut keinen Lambert-Stoff (Wege-Kisten, Fern-Ring,
// Rauch, Gras, Fundament standen noch Lambert), und die Host-Streu backt ihre Farbe durch das FARB-GESETZ (die
// Paletten sind sRGB-Absicht; roh stand der Fels im Schatten heller als die Wiese in der Sonne).
// Die Linse (Node, ohne Browser):
//   (1) baut jede Art über DEN Stamm-Bauplan (_scatterSpeciesGeometry aus anazhRealm.js, KLEIN_VEGETATION_SPECIES
//       aus demselben Quelltext) und prüft für jede einseitig gezeichnete Art (nicht wind, nicht emissiv —
//       dieselbe Seiten-Regel wie _scatterMaterial), dass JEDE Dreiecks-Normale vom Schwerpunkt weg zeigt;
//   (2) prüft den kommentar-freien Stamm: kein Lambert-Stoff irgendwo, _scatterMaterial und _archFundMat bauen
//       MeshStandardNodeMaterial;
//   (3) DAS FARB-GESETZ: beide Streu-Bauer (_scatterSpeciesGeometry, _scatterImpostorGeometry) backen je lit Art die
//       Vertex-Farbe = sRGB→linear des rohen Bauplans (eigene Referenz-Formel), leuchtende Arten roh;
//   (4) DIE KARTEN-FARBE: die Studio-Karte reist linear (Render-Target), die Welt-Schicht ist sRGB markiert — der
//       Karten-Codec (phyto-core impostorMips; W6: er läuft in der Transport-Schale, der Haupt-Thread kopiert nur die
//       Schicht) kodiert jede Mip-Stufe linear → sRGB, gemessen am echten Codec gegen die Referenz-Formel (alle 256
//       Stufen, Stufe 0 und die linear gemittelte Stufe 1); die Normalen bleiben Daten (normalMips byte-treu).
// --selftest: der Fels im alten Uhrzeigersinn, der Lambert-Zweig, Lambert-Wege, ein Lambert-Fundament, ein Bauer
// ohne Farb-Gesetz und ein rohes Gesetz → alle MÜSSEN beim Namen feuern.
// Exit: 0 grün · 1 rot.
// ============================================================================
"use strict";
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const QUELLE = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
const PHYTO = fs.readFileSync(path.join(root, "phyto-core.js"), "utf8");

// Der Karten-Codec aus einer phyto-core-Quelle (echt oder injiziert), in einer eigenen Sandbox geladen.
function codecAus(phytoSrc) {
    const sandbox = {};
    new Function("self", phytoSrc)(sandbox);
    return sandbox.__phytoCore || null;
}
// linear → sRGB nach IEC 61966-2-1 (die Referenz der Linse, unabhängig vom Codec).
const srgbSoll = (v) => Math.round((v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255);
function kartenFarbe(phytoSrc) {
    const fehler = [];
    const core = codecAus(phytoSrc);
    if (!core || typeof core.impostorMips !== "function" || typeof core.normalMips !== "function")
        return ["der Karten-Codec (phyto-core impostorMips/normalMips) fehlt"];
    // Stufe 0: 256 opake Texel (16 × 16, V = 1), Texel i trägt den linearen Wert i in r, g, b.
    const w = 16,
        h = 16;
    const lin = new Uint8Array(w * h * 4);
    for (let i = 0; i < 256; i++) {
        lin[i * 4] = lin[i * 4 + 1] = lin[i * 4 + 2] = i;
        lin[i * 4 + 3] = 255;
    }
    const mips = core.impostorMips(lin, w, h, 1, null, 2);
    const d0 = mips && mips.stufen && mips.stufen[0] ? mips.stufen[0].data : null;
    let ab0 = 0;
    for (let i = 0; i < 256; i++) if (!d0 || d0[i * 4] !== srgbSoll(i / 255) || d0[i * 4 + 3] !== 255) ab0++;
    if (ab0) fehler.push(`die Karten-Kodierung weicht in ${ab0} von 256 Stufen von linear → sRGB ab (Stufe 0)`);
    // Stufe 1: das LINEARE Mittel der vier Kinder, dann kodiert (nie das Mittel der sRGB-Bytes).
    const d1 = mips && mips.stufen && mips.stufen[1] ? mips.stufen[1].data : null;
    let ab1 = 0;
    for (let y = 0; y < h / 2; y++)
        for (let x = 0; x < w / 2; x++) {
            let m = 0;
            for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) m += (y * 2 + dy) * w + x * 2 + dx;
            const o = y * (w / 2) + x;
            if (!d1 || Math.abs(d1[o * 4] - srgbSoll(m / 4 / 255)) > 1) ab1++;
        }
    if (ab1) fehler.push(`die gemittelte Mip-Stufe ist nicht linear gemittelt und sRGB-kodiert (${ab1} von ${(w * h) / 4} Texeln)`);
    // Die Normale ist DATEN: ein Byte-Paar reist unverändert durch Stufe 0.
    const nrm = new Uint8Array(4 * 4);
    for (let i = 0; i < 4; i++) {
        nrm[i * 4] = 200;
        nrm[i * 4 + 1] = 50;
    }
    const n0 = core.normalMips(nrm, 2, 2, 4, 1)[0].data;
    if (n0[0] !== 200 || n0[1] !== 50) fehler.push("die Normalen-Karte wird kodiert — Normalen sind Daten");
    return fehler;
}

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

function pruefe(src, phytoSrc = PHYTO) {
    const fehler = [];
    const arten = rumpf(src, /static get KLEIN_VEGETATION_SPECIES\(\)\s*\{/);
    const bau = rumpf(src, /\n {4}_scatterSpeciesGeometry\(species\)\s*\{/);
    if (!arten || !bau)
        return { fehler: ["KLEIN_VEGETATION_SPECIES oder _scatterSpeciesGeometry nicht im Stamm gefunden"], geprueft: 0 };
    const liste = new Function(arten)();
    const bauFn = new Function("THREE", "AnazhRealm", "species", bau.slice(1, -1));
    const fernBau = rumpf(src, /\n {4}_scatterImpostorGeometry\(species\)\s*\{/);
    const fernFn = fernBau ? new Function("THREE", "AnazhRealm", "species", fernBau.slice(1, -1)) : null;
    if (!fernFn) fehler.push("_scatterImpostorGeometry nicht im Stamm gefunden");
    const gesetzSrc = rumpf(src, /\nAnazhRealm\._streuAlbedo = function \(species, C\)\s*\{/);
    if (!gesetzSrc) fehler.push("AnazhRealm._streuAlbedo (das Farb-Gesetz der Host-Streu) nicht im Stamm gefunden");
    const GESETZ = { _streuAlbedo: gesetzSrc ? new Function("species", "C", gesetzSrc.slice(1, -1)) : (sp, C) => C };
    const ROH = { _streuAlbedo: (sp, C) => C };
    const kontext = { state: {} };
    const baue = (fn, A, sp) => {
        kontext.state = {};
        return fn.call(kontext, THREE_SCHEIN, A, sp);
    };
    // (3) DAS FARB-GESETZ: je Art und Bauer die gebackene Farbe gegen sRGB→linear des rohen Bauplans (Float32).
    const lin = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    let farbArten = 0;
    for (const sp of liste)
        for (const [bauer, fn] of [
            ["_scatterSpeciesGeometry", bauFn],
            ["_scatterImpostorGeometry", fernFn],
        ]) {
            if (!fn) continue;
            const echt = baue(fn, GESETZ, sp);
            const roh = baue(fn, ROH, sp);
            const E = echt && echt.attributes.color ? echt.attributes.color.array : null;
            const R = roh && roh.attributes.color ? roh.attributes.color.array : null;
            if (!E || !R || E.length !== R.length || !E.length) {
                fehler.push(`${sp.name}: ${bauer} backt keine Farbe`);
                continue;
            }
            let ab = 0;
            for (let i = 0; i < E.length; i++) {
                const soll = Math.fround(sp.emissive ? R[i] : lin(R[i]));
                if (Math.abs(E[i] - soll) > 1e-6) ab++;
            }
            if (ab)
                fehler.push(
                    `${sp.name}: ${bauer} backt ${ab} von ${E.length} Farbwerten nicht nach dem Farb-Gesetz (${sp.emissive ? "leuchtend: roh" : "sRGB-Absicht → linear"})`
                );
            farbArten++;
        }
    let geprueft = 0;
    for (const sp of liste) {
        const einseitig = !sp.emissive && !sp.wind; // _scatterMaterial: wind → DoubleSide, sonst FrontSide; emissiv unlit
        if (!einseitig) continue;
        const g = baue(bauFn, GESETZ, sp);
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
    // (2) DIE LAMBERT-WAND: kein Stoff der Welt ist Lambert (der ganze kommentar-freie Stamm).
    const nc = ohneKommentare(src);
    const lambert = [...nc.matchAll(/MeshLambert\w*/g)].length;
    if (lambert) fehler.push(`${lambert} Lambert-Stoff(e) im Stamm — r184-Lambert liest den EINEN Himmel (scene.environment) nie diffus`);
    if (!/\(this\._archFundMat = new THREE\.MeshStandardNodeMaterial\(/.test(nc))
        fehler.push("_archFundMat (das Fundament) baut nicht MeshStandardNodeMaterial");
    // (4) DIE KARTEN-FARBE — am echten Codec (phyto-core); die Welt-Schicht ist sRGB markiert
    for (const f of kartenFarbe(phytoSrc)) fehler.push(f);
    const texturen = rumpf(nc, /\n {4}_impostorAtlasTexturen\(at, bedarf\)\s*\{/) || "";
    // beide Format-Stufen (BC1 und rgba8) markieren ihre Albedo sRGB
    if ((texturen.match(/map\.colorSpace = T\.SRGBColorSpace;/g) || []).length !== 2)
        fehler.push("die Atlas-Albedo ist nicht in jeder Format-Stufe sRGB markiert — die GPU läse die kodierten Bytes linear");
    const stoff = rumpf(nc, /\n {4}_scatterMaterial\(species\)\s*\{/) || "";
    if (!stoff) fehler.push("_scatterMaterial nicht gefunden");
    else {
        if (/Lambert/.test(stoff)) fehler.push("_scatterMaterial baut Lambert — r184-Lambert liest den Himmel (scene.environment) nie diffus");
        if (!/new THREE\.MeshStandardNodeMaterial\(/.test(stoff)) fehler.push("_scatterMaterial: der lit Zweig ist nicht MeshStandardNodeMaterial");
        if (!/side: species\.wind \? THREE\.DoubleSide : THREE\.FrontSide/.test(stoff))
            fehler.push("_scatterMaterial: die Seiten-Regel (wind → DoubleSide, sonst FrontSide) hat sich verschoben — die Linse prüft die falsche Menge");
    }
    return { fehler, geprueft, farbArten };
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
            [
                "Lambert-Wege",
                QUELLE.replace(
                    "new THREE.MeshStandardNodeMaterial({ color: 0xffffff, roughness: 1, metalness: 0 })",
                    "new THREE.MeshLambertMaterial({ color: 0xffffff })"
                ),
                /Lambert-Stoff/,
            ],
            [
                "Lambert-Fundament",
                QUELLE.replace("(this._archFundMat = new THREE.MeshStandardNodeMaterial({", "(this._archFundMat = new THREE.MeshLambertMaterial({"),
                /_archFundMat/,
            ],
            [
                "Nah-Streu ohne Farb-Gesetz",
                QUELLE.replace(
                    'geo.setAttribute("color", new THREE.Float32BufferAttribute(AnazhRealm._streuAlbedo(species, C), 3));\n        geo.computeVertexNormals();\n        geo.computeBoundingSphere();',
                    'geo.setAttribute("color", new THREE.Float32BufferAttribute(C, 3));\n        geo.computeVertexNormals();\n        geo.computeBoundingSphere();'
                ),
                /_scatterSpeciesGeometry backt/,
            ],
            [
                "Fern-Streu ohne Farb-Gesetz",
                QUELLE.replace(
                    'geo.setAttribute("color", new THREE.Float32BufferAttribute(AnazhRealm._streuAlbedo(species, C), 3));\n        geo.computeVertexNormals();\n        cache.set',
                    'geo.setAttribute("color", new THREE.Float32BufferAttribute(C, 3));\n        geo.computeVertexNormals();\n        cache.set'
                ),
                /_scatterImpostorGeometry backt/,
            ],
            ["Farb-Gesetz roh", QUELLE.replace("    if (species && species.emissive) return C;\n", "    return C;\n"), /sRGB-Absicht/],
            [
                "Karte ohne Kodierung",
                QUELLE,
                /Karten-Kodierung weicht/,
                PHYTO.replace("d0[i * 4] = SRGB_AUS_LIN8[r];", "d0[i * 4] = r;"),
            ],
            [
                "Mip-Stufe roh gemittelt",
                QUELLE,
                /linear gemittelt/,
                // jede Stelle (S7: impostorMips schreibt die Mittel-Farbe auch für den blutenden Atlas — die erste Stelle
                // allein träfe nur diesen Zweig, die Karte der Welt bliebe kodiert und die Linse sähe nichts)
                PHYTO.split("data[o * 4] = linZuSrgb8(tr[o] / ta[o]);").join("data[o * 4] = Math.round((tr[o] / ta[o]) * 255);"),
            ],
            ["Karten-Tafel falsch", QUELLE, /Karten-Kodierung weicht/, PHYTO.replace("1.055 * Math.pow(x, 1 / 2.4) - 0.055", "Math.pow(x, 1 / 2.2)")],
            ["Atlas linear markiert", QUELLE.replace("map.colorSpace = T.SRGBColorSpace;", ""), /nicht in jeder Format-Stufe sRGB/],
        ];
        let ok = Array.isArray(echt.fehler) && echt.fehler.length === 0;
        console.log(`${ok ? "✅" : "❌"} SELBST-TEST: die echte Quelle ist grün${ok ? "" : " — " + echt.fehler.join(" · ")}`);
        for (const [name, src, muster, phyto = PHYTO] of brueche) {
            const r = pruefe(src, phyto);
            const feuert = (src !== QUELLE || phyto !== PHYTO) && r.fehler.some((f) => muster.test(f));
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
        `✅ DIE STREU-WAHRHEIT steht — ${r.geprueft} einseitige Arten mit Außen-Normalen (jede Fläche zeigt vom Schwerpunkt weg), kein Lambert-Stoff im Stamm (Streu, Fundament, Wege, Fern-Ring, Rauch, Gras lesen den EINEN Himmel), ${r.farbArten} Art×Bauer backen ihre Farbe nach dem Farb-Gesetz, der Karten-Codec kodiert die Studio-Karte sRGB.`
    );
}
main();
