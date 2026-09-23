#!/usr/bin/env node
"use strict";
// diag-arch-fachwerk-fit.cjs — KONSUM / Fachwerk-Naht (Analog C): Quell-Vertrag
// + verhaltensechter Count von `_archFachwerkFit` (Function-Extrakt, kein Browser).
//   node scripts/diag-arch-fachwerk-fit.cjs
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const js = path.join(root, "anazhRealm.js");
const src = fs.readFileSync(js, "utf8");
const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

function parseVer(v) {
    const p = String(v || "")
        .split(".")
        .map((x) => parseInt(x, 10));
    return p.length >= 3 && p.every(Number.isFinite) ? p : null;
}
function verGte(a, b) {
    const A = parseVer(a);
    const B = parseVer(b);
    if (!A || !B) return false;
    for (let i = 0; i < 3; i++) {
        if (A[i] > B[i]) return true;
        if (A[i] < B[i]) return false;
    }
    return true;
}

function schneide(quelle, marker) {
    const i = quelle.indexOf(marker);
    if (i < 0) return null;
    const start = quelle.indexOf("{", i);
    if (start < 0) return null;
    let tiefe = 0;
    for (let j = start; j < quelle.length; j++) {
        const c = quelle[j];
        if (c === "{") tiefe++;
        else if (c === "}") {
            tiefe--;
            if (tiefe === 0) return quelle.slice(i, j + 1);
        }
    }
    return null;
}

console.log("=== DIAG ARCH FACHWERK FIT ===");

const ver = (src.match(/AnazhRealm\.VERSION\s*=\s*"([^"]+)"/) || [])[1] || "?";
check("VERSION ≥ 18.491.73", verGte(ver, "18.491.73"), "V" + ver);
check("Quelle: _archFachwerkFit", src.includes("_archFachwerkFit"));
check("Quelle: pushPrism", src.includes("pushPrism"));
check("Quelle: gaube", /gaube|Gaube/.test(src));
check("Quelle: fluegel", /fluegel|Flügel/.test(src));
check("Quelle: Fenster", /Fenster/.test(src));

const marker = "_archFachwerkFit(entry) {";
const block = schneide(src, marker);
check("Methode extrahierbar", !!block, block ? block.length + " chars" : "fehlt");

let fitFn = null;
if (block) {
    const body = block.slice(block.indexOf("{"));
    try {
        // Minimal-THREE: nur Vector3 (Methode braucht keine Matrix/Box).
        global.THREE = {
            Vector3: function Vector3(x, y, z) {
                this.x = x || 0;
                this.y = y || 0;
                this.z = z || 0;
            },
        };
        fitFn = new Function("return function(entry) " + body + ";")();
        check("Function()-Instanz", typeof fitFn === "function");
    } catch (e) {
        check("Function()-Instanz", false, String(e && e.message));
    }
}

if (fitFn) {
    const nullOut = fitFn.call({}, { type: "brunnen" });
    check("fail-closed ohne haus_/ov → null", nullOut == null);

    // alemannisch-ähnlich: stil alt, Soft-Raum für Dach-Prism (brace none),
    // Gaube/Flügel-Trigger explizit — sonst Timber-prio-2 frisst ≤24.
    const entry = {
        type: "haus_alemannisch",
        studioOv: {
            stil: "alt",
            W: 9,
            D: 7,
            storeys: 2,
            brace: "none",
            pitchDeg: 50,
            gaube: true,
            fluegel: true,
            fluegelSide: 1,
        },
    };
    let defs = null;
    try {
        defs = fitFn.call({}, entry);
    } catch (e) {
        check("alemannisch-Aufruf", false, String(e && e.message));
    }
    if (defs) {
        const n = defs.length;
        const nBox = defs.filter((d) => d && d.box).length;
        const nPrism = defs.filter((d) => d && d.prism).length;
        const nFlip = defs.filter((d) => d && d.prismFlip).length;
        check("alemannisch: 1…24 Defs", n >= 1 && n <= 24, "n=" + n);
        check("alemannisch: Boxen", nBox >= 1, "box=" + nBox);
        check("alemannisch: Dach-Prism (Sattel)", nPrism >= 2, "prism=" + nPrism);
        check("alemannisch: prismFlip-Paar", nFlip >= 1, "flip=" + nFlip);
        check(
            "alemannisch: c/h oder prism-Felder",
            defs.every((d) => d && d.c && d.h && (d.box || d.prism)),
            "alle ok"
        );
        console.log(
            "  · count " +
                JSON.stringify({ n, nBox, nPrism, nFlip, ver })
        );
    }

    // Timber-prio füllt Cap: mit Andreas oft 0 Prism im Top-24 — trotzdem ≤24 + Boxes.
    const timber = fitFn.call(
        {},
        {
            type: "haus_alemannisch",
            studioOv: { stil: "alt", W: 9, D: 7, storeys: 2, brace: "andreas", pitchDeg: 50 },
        }
    );
    check(
        "andreas: Soft-Cap ≤24",
        Array.isArray(timber) && timber.length >= 1 && timber.length <= 24,
        timber ? "n=" + timber.length : "null"
    );

    // V18.491.92 — stil-alt fachwerk ohne explizites ov.gaube: Dorf-Gaube (prio-2)
    // unter Soft-Cap; fail-closed ov.gaube===false. Soft-Cap-Assert unverändert.
    const stilDefault = fitFn.call(
        {},
        {
            type: "haus_alemannisch",
            studioOv: { stil: "alt", W: 9, D: 7, storeys: 2, brace: "andreas", pitchDeg: 50 },
        }
    );
    const stilOff = fitFn.call(
        {},
        {
            type: "haus_alemannisch",
            studioOv: {
                stil: "alt",
                W: 9,
                D: 7,
                storeys: 2,
                brace: "andreas",
                pitchDeg: 50,
                gaube: false,
            },
        }
    );
    const gaubeish = (defs) =>
        Array.isArray(defs)
            ? defs.filter(
                  (d) =>
                      d &&
                      d.box &&
                      d.c &&
                      Math.abs(d.c.z + 1.4) < 0.05 &&
                      d.c.y > 7 &&
                      d.h &&
                      d.h.x > 0.5 &&
                      d.h.x < 0.8
              ).length
            : 0;
    check(
        "stil-alt andreas: Gaube-Default ohne ov.gaube",
        gaubeish(stilDefault) >= 1,
        "gBody=" + gaubeish(stilDefault)
    );
    check(
        "stil-alt andreas: ov.gaube===false unterdrückt",
        gaubeish(stilOff) === 0,
        "gBody=" + gaubeish(stilOff)
    );

    // V18.491.94 — slim wing 2× prio-2: wantFluegel (fail-closed ov.fluegel===false);
    // Soft-Cap ≤24 hält Wing ≥1 unter stil-alt andreas W≥8 (nicht "drop ok").
    // Cap-Raum brace none + ov.fluegel===false → 0 wing weiter OK.
    const wingish = (defs, W) => {
        const thr = (Number(W) || 9) / 2 + 0.8; // jenseits Haupt-hw
        return Array.isArray(defs)
            ? defs.filter((d) => d && d.box && d.c && Math.abs(d.c.x) > thr).length
            : 0;
    };
    const fluegelDefault = stilDefault; // selbes andreas W9 ohne ov.fluegel
    const wingDef = wingish(fluegelDefault, 9);
    check(
        "stil-alt andreas W≥8: Soft-Cap ≤24 (Flügel-Default-Pfad)",
        Array.isArray(fluegelDefault) &&
            fluegelDefault.length >= 1 &&
            fluegelDefault.length <= 24,
        "n=" + (fluegelDefault ? fluegelDefault.length : "null") + " wing=" + wingDef
    );
    check(
        "stil-alt andreas W≥8 wantFluegel: wing ≥1 unter Soft-Cap",
        wingDef >= 1,
        "wing=" + wingDef
    );
    const fluegelRoomOn = fitFn.call(
        {},
        {
            type: "haus_alemannisch",
            studioOv: {
                stil: "alt",
                W: 9,
                D: 7,
                storeys: 2,
                brace: "none",
                pitchDeg: 50,
                fluegel: true,
                fluegelSide: 1,
            },
        }
    );
    const fluegelRoomOff = fitFn.call(
        {},
        {
            type: "haus_alemannisch",
            studioOv: {
                stil: "alt",
                W: 9,
                D: 7,
                storeys: 2,
                brace: "none",
                pitchDeg: 50,
                fluegel: false,
            },
        }
    );
    check(
        "Cap-Raum: ov.fluegel===true hält Wing",
        wingish(fluegelRoomOn, 9) >= 1,
        "wing=" + wingish(fluegelRoomOn, 9) + " n=" + (fluegelRoomOn && fluegelRoomOn.length)
    );
    check(
        "ov.fluegel===false fail-closed (kein Wing)",
        wingish(fluegelRoomOff, 9) === 0,
        "wing=" + wingish(fluegelRoomOff, 9)
    );
    check(
        "Cap-Raum Soft-Cap ≤24",
        Array.isArray(fluegelRoomOn) &&
            fluegelRoomOn.length >= 1 &&
            fluegelRoomOn.length <= 24,
        fluegelRoomOn ? "n=" + fluegelRoomOn.length : "null"
    );
}

const ok = errs.length === 0;
console.log(ok ? "GRÜN arch-fachwerk-fit" : "ROT arch-fachwerk-fit · " + errs.join(", "));
process.exit(ok ? 0 : 1);
