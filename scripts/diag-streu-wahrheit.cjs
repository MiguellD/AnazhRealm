#!/usr/bin/env node
// ============================================================================
// DIE STREU-WAHRHEIT — gate:streu-wahrheit (04.10., Bild-Wahrheit (b); Integration Waldboden 05.10.)
//
// Befund (echte GPU, Werkbank, Mess-Wiese): schwarze Brocken und schwarze Flächen auf der hellen Wiese. Zwei
// Täter, eine Klasse — die Klein-Streu las ihr Licht nicht: der Fels-Oktaeder des Host-Bauers zeigte nach INNEN,
// und r184-Lambert liest den EINEN Himmel (scene.environment) nie diffus. Die Integration der Bild-Wahrheit ließ die
// Lambert-Klasse im ganzen Stamm fallen und backte die Host-Paletten nach dem FARB-GESETZ (sRGB-Absicht → linear).
// Integration Waldboden (05.10.): der Host-Bauer der Klein-Streu (Arten-Tafel, Strip-/Oktaeder-Geometrie, eigener
// Stoff, eigenes Farb-Gesetz) fiel ganz — die Nah-Streu wächst aus dem Pflanzen-Studio. Die Linse liest jetzt die
// STUDIO-ARTEN der Nah-Streu (foundry-core `placement.boden`, ring "nah") und hält dieselbe Klasse dort:
//   (1) DIE ARTEN: jede Boden-Zeile mit ring "nah" ist ein Preset des Kerns, dessen kind einen Studio-Emitter hat
//       (buildInstance: emitFlower · emitRock · WALDBODEN_EMIT) — die Arten, die die Welt zeichnet;
//   (2) DAS FARB-GESETZ je Art: ein Emitter mit weichem Gewebe (foliageMat · stemMat — Laub, Halm, Stiel, Blüte, die
//       Stoffe, die auch in der Welt wiegen) backt jede Palette über vegFarbe (sRGB-Absicht → linear): kein
//       `new THREE.Color(` und kein Hex-Literal außerhalb von vegFarbe(…); Rinde und Fels liegen nach dem Studio-
//       Gesetz roh im Band (foundry-core vegFarbe) und sind ausgenommen;
//   (3) DER STOFF der Nah-Streu: jede Senke zeichnet mit dem Studio-Stoff (`_foundryTreeMaterial` — Standard bzw.
//       Physical, nie Lambert), eine Art mit weichem Gewebe mit seiner wiegenden Fassung (der EINE Wind
//       `_windSwayOffset`), kein eigener Stoff im Host;
//   (4) DIE LAMBERT-WAND: der kommentar-freie Stamm baut keinen Lambert-Stoff, _archFundMat ist Standard;
//   (5) DIE KARTEN-FARBE: die Studio-Karte reist linear (Render-Target), die Welt-Schicht ist sRGB markiert — der
//       Karten-Codec (phyto-core impostorMips) kodiert jede Mip-Stufe linear → sRGB, gemessen am echten Codec gegen
//       die Referenz-Formel (alle 256 Stufen, Stufe 0 und die linear gemittelte Stufe 1); Normalen bleiben Daten.
// Die Außen-Normalen des Fels-Oktaeders fielen mit dem Host-Bauer (gate:altlasten hält _scatterSpeciesGeometry);
// die Studio-Gestalt ist byte-genau eingefroren (gate:asset-contract).
// --selftest: ein Farn mit roher Palette, ein Schilf mit rohem Hex, eine Boden-Zeile ohne Preset, ein Senken-Stoff
// am Studio vorbei, eine Nah-Streu ohne Wind, Lambert-Wege, ein Lambert-Fundament und die Karten-Brüche → alle
// MÜSSEN beim Namen feuern.
// Exit: 0 grün · 1 rot.
// ============================================================================
"use strict";
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const QUELLE = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
const PHYTO = fs.readFileSync(path.join(root, "phyto-core.js"), "utf8");
const KERN = fs.readFileSync(path.join(root, "foundry-core.js"), "utf8");
const vm = require("vm");

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

// Ein absorbierender Proxy: frisst jeden THREE-Aufruf der Top-Level-Ausführung des Kerns — nur die Daten zählen
// (dieselbe Lade-Art wie gate:studio-vertrag).
function absorber() {
    const a = new Proxy(function () {}, { get: () => a, apply: () => a, construct: () => a });
    return a;
}
// Die Daten des Pflanzen-Kerns (phyto-core + foundry-core, wie cores.manifest.json sie lädt): PRESETS und
// PORTAL_RENDER_CONFIG. null, wenn der Kern nicht lädt.
function kernDaten(phytoSrc, kernSrc) {
    const ctx = vm.createContext({
        THREE: absorber(),
        console: { log() {}, warn() {}, error() {} },
        performance: { now: () => 0 },
    });
    ctx.self = ctx;
    ctx.globalThis = ctx;
    try {
        vm.runInContext(
            phytoSrc +
                "\n;" +
                kernSrc +
                "\n;__daten = { presets: typeof PRESETS !== 'undefined' ? PRESETS : null, cfg: typeof PORTAL_RENDER_CONFIG !== 'undefined' ? PORTAL_RENDER_CONFIG : null };",
            ctx,
            { timeout: 30000, filename: "foundry-core.js" }
        );
        return ctx.__daten;
    } catch {
        return null;
    }
}
// Der Rumpf einer Kern-Funktion `function name(` (kommentar-frei), null wenn sie fehlt.
function kernFn(kernNC, name) {
    return /^[A-Za-z_]\w*$/.test(name) ? rumpf(kernNC, new RegExp("\\nfunction " + name + "\\(")) : null;
}
// Der Emitter eines kind: buildInstance dispatcht flower → emitFlower, grass → emitGrass, die Boden-Arten über
// WALDBODEN_EMIT, rock über emitRock (die Gestein-Bahn), sonst emitTree.
function emitterVon(kernNC, kind) {
    const wb = /const WALDBODEN_EMIT = \{([^}]*)\}/.exec(kernNC);
    if (wb)
        for (const paar of wb[1].split(",")) {
            const [k, fn] = paar.split(":").map((x) => (x || "").trim());
            if (k === kind && fn) return fn;
        }
    if (kind === "flower") return "emitFlower";
    if (kind === "grass") return "emitGrass";
    if (kind === "rock") return "emitRock";
    return null;
}

function pruefe(src, phytoSrc = PHYTO, kernSrc = KERN) {
    const fehler = [];
    const kernNC = ohneKommentare(kernSrc);
    // (1) DIE STUDIO-ARTEN der Nah-Streu
    const d = kernDaten(phytoSrc, kernSrc);
    const boden = d && d.cfg && d.cfg.placement ? d.cfg.placement.boden : null;
    if (!d || !d.presets) return { fehler: ["der Pflanzen-Kern (PRESETS) lädt nicht"], arten: 0, weich: 0 };
    if (!boden) fehler.push("placement.boden fehlt — die Nah-Streu hat keine Studio-Arten");
    let arten = 0;
    let weich = 0;
    for (const id of Object.keys(boden || {})) {
        const z = boden[id];
        if (!z || z.ring !== "nah") continue;
        const pre = d.presets[id];
        if (!pre) {
            fehler.push(`placement.boden.${id}: kein Preset im Kern — die Welt zeichnet eine Art ohne Studio-Gestalt`);
            continue;
        }
        const name = emitterVon(kernNC, pre.kind);
        const koerper = name ? kernFn(kernNC, name) : null;
        if (!koerper) {
            fehler.push(`${id}: kind ${pre.kind} ohne Studio-Emitter`);
            continue;
        }
        arten++;
        // (2) DAS FARB-GESETZ: weiches Gewebe (foliageMat · stemMat) backt jede Palette über vegFarbe.
        if (!/\b(foliageMat|stemMat)\b/.test(koerper)) continue; // Rinde/Fels: roh im Band (Studio-Gesetz)
        weich++;
        const roh = (koerper.match(/new THREE\.Color\(/g) || []).length;
        if (roh) fehler.push(`${id} (${name}): ${roh}× new THREE.Color( — eine Palette liegt roh als Albedo (Farb-Gesetz: vegFarbe)`);
        let hexRoh = 0;
        for (const m of koerper.matchAll(/0x[0-9a-fA-F]{6}\b/g))
            if (!/vegFarbe\($/.test(koerper.slice(Math.max(0, m.index - 9), m.index))) hexRoh++;
        if (hexRoh) fehler.push(`${id} (${name}): ${hexRoh} Hex-Paletten außerhalb von vegFarbe(…) — sRGB-Absicht roh gelesen`);
    }
    if (!arten) fehler.push("keine Studio-Art der Nah-Streu geprüft — die Linse sähe nichts");
    if (!weich) fehler.push("keine Art mit weichem Gewebe geprüft — das Farb-Gesetz der Nah-Streu bliebe ungesehen");
    // (3) DER STOFF der Nah-Streu: der Studio-Stoff, wiegend nur über den EINEN Wind.
    const nc = ohneKommentare(src);
    const senke = rumpf(nc, /\n {4}_streuNahSenke\(art, v, stufe, p, lf, wiegt\)\s*\{/) || "";
    if (!senke) fehler.push("_streuNahSenke(art, v, stufe, p, lf, wiegt) nicht gefunden");
    else if (!/mat: wiegt \? this\._foundryTreeMaterial\(u\.foundryKind, u\.foundryMp, skala\) : lf\.mat,/.test(senke))
        fehler.push("_streuNahSenke: der Senken-Stoff ist nicht der Studio-Stoff (lf.mat bzw. _foundryTreeMaterial wiegend)");
    const stoff = rumpf(nc, /\n {4}_foundryTreeMaterial\(kind, mp, wiegen\)\s*\{/) || "";
    if (!stoff) fehler.push("_foundryTreeMaterial(kind, mp, wiegen) nicht gefunden");
    else {
        if (!/: T\.MeshStandardNodeMaterial;/.test(stoff))
            fehler.push("_foundryTreeMaterial: der Studio-Stoff ist nicht MeshStandardNodeMaterial (bzw. Physical für die Haut)");
        const ast = /\} else if \(wiegen > 0\) \{([\s\S]*?)\n {12}\}/.exec(stoff);
        if (!ast || !/this\._windSwayOffset\(TSL, \{ ampX: 1\.2, hoehe: TSL\.positionGeometry\.y\.mul\(wiegen\) \}\)/.test(ast[1]))
            fehler.push("_foundryTreeMaterial: die weiche Nah-Streu wiegt nicht im EINEN Wind (_windSwayOffset, Höhe × Studio-Skala)");
    }
    // (4) DIE LAMBERT-WAND: kein Stoff der Welt ist Lambert (der ganze kommentar-freie Stamm).
    const lambert = [...nc.matchAll(/MeshLambert\w*/g)].length;
    if (lambert) fehler.push(`${lambert} Lambert-Stoff(e) im Stamm — r184-Lambert liest den EINEN Himmel (scene.environment) nie diffus`);
    if (!/\(this\._archFundMat = new THREE\.MeshStandardNodeMaterial\(/.test(nc))
        fehler.push("_archFundMat (das Fundament) baut nicht MeshStandardNodeMaterial");
    // (5) DIE KARTEN-FARBE — am echten Codec (phyto-core); die Welt-Schicht ist sRGB markiert
    for (const f of kartenFarbe(phytoSrc)) fehler.push(f);
    const texturen = rumpf(nc, /\n {4}_impostorAtlasTexturen\(at, bedarf\)\s*\{/) || "";
    // beide Format-Stufen (BC1 und rgba8) markieren ihre Albedo sRGB
    if ((texturen.match(/map\.colorSpace = T\.SRGBColorSpace;/g) || []).length !== 2)
        fehler.push("die Atlas-Albedo ist nicht in jeder Format-Stufe sRGB markiert — die GPU läse die kodierten Bytes linear");
    return { fehler, arten, weich };
}

function main() {
    if (process.argv.includes("--selftest")) {
        const echt = pruefe(QUELLE);
        // [Name, Stamm, Muster, phyto-core, foundry-core]
        const brueche = [
            ["Farn mit roher Palette", QUELLE, /farn \(emitFern\): 1× new THREE\.Color/, PHYTO, KERN.replace("c1 = vegFarbe(P.farbe),", "c1 = new THREE.Color(P.farbe),")],
            ["Schilf mit rohem Hex", QUELLE, /schilf \(emitSchilf\): 1 Hex-Paletten/, PHYTO, KERN.replace("vegFarbe(0x46602a)", "(0x46602a)")],
            [
                "Boden-Zeile ohne Preset",
                QUELLE,
                /placement\.boden\.geist: kein Preset/,
                PHYTO,
                KERN.replace("        boden: {\n", '        boden: {\n            geist: { ring: "nah", dichte: 1, skala: [1, 1] },\n'),
            ],
            [
                "Senken-Stoff am Studio vorbei",
                QUELLE.replace(
                    "mat: wiegt ? this._foundryTreeMaterial(u.foundryKind, u.foundryMp, skala) : lf.mat,",
                    "mat: new THREE.MeshStandardNodeMaterial(),"
                ),
                /Senken-Stoff ist nicht der Studio-Stoff/,
            ],
            [
                "Nah-Streu ohne Wind",
                QUELLE.replace(
                    "const _sway = this._windSwayOffset(TSL, { ampX: 1.2, hoehe: TSL.positionGeometry.y.mul(wiegen) });",
                    "const _sway = null;"
                ),
                /wiegt nicht im EINEN Wind/,
            ],
            ["Studio-Stoff Lambert", QUELLE.replace(": T.MeshStandardNodeMaterial;", ": T.MeshLambertNodeMaterial;"), /Lambert-Stoff/],
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
        for (const [name, src, muster, phyto = PHYTO, kern = KERN] of brueche) {
            const r = pruefe(src, phyto, kern);
            const feuert = (src !== QUELLE || phyto !== PHYTO || kern !== KERN) && r.fehler.some((f) => muster.test(f));
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
        `✅ DIE STREU-WAHRHEIT steht — ${r.arten} Studio-Arten der Nah-Streu (placement.boden ring "nah"), ${r.weich} mit weichem Gewebe backen jede Palette über vegFarbe, die Senken zeichnen mit dem Studio-Stoff und wiegen im EINEN Wind, kein Lambert-Stoff im Stamm (Fundament, Wege, Fern-Ring, Rauch, Gras lesen den EINEN Himmel), der Karten-Codec kodiert die Studio-Karte sRGB.`
    );
}
main();
