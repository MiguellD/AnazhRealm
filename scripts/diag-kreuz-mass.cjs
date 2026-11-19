// diag-kreuz-mass.cjs — DAS KREUZ STEHT DUNKEL VOR DER LEUCHTENDEN SCHEIBE (licht-eine-skala, Klasse Erscheinung): das
// Bild-Maß aus scripts/lib/kreuz-mass.cjs auf einem PNG. ROT unter dem Soll und bei n = 0 (keine Scheibe im Bild — nie ein
// stiller Wert). Referenzen (GTX 1050, Dorf-Nacht): main 0,035 · Welle g0 0,040 · Welle k 0,267 · Sprosse 0,307 (die Ratsche).
//
// SELBSTTEST (--selftest, ohne Bild auf der Platte): eine leuchtende Scheibe MIT dunklem Kreuz muss das Soll tragen; dieselbe
// Scheibe OHNE Kreuz und mit einem Kreuz HELLER als die Scheibe (der Zustand von main) müssen nahe 0 fallen; ein Bild ohne
// Scheibe muss ROT mit n = 0 sein — trennt die Linse einen Mutanten nicht von der Guten, ist sie ROT.
//
//   node scripts/diag-kreuz-mass.cjs <png> [--soll 0.12] | --selftest
"use strict";
const fs = require("fs");
const { pngLesen } = require("./lib/abnahme-urteil.cjs");
const { kreuzMass } = require("./lib/kreuz-mass.cjs");
const { SELBSTTEST, argOpt, urteilEnde, selbsttestEnde } = require("./lib/welt-boot.cjs");

const SOLL = 0.12; // das Kreuz trägt sich ab hier sichtbar dunkel; main steht bei 0,035
const NAHE_NULL = 0.02; // die Mutanten (kein Kreuz, helles Kreuz) liegen darunter

// das Urteil über ein Maß: die Liste der Verletzungen (leer = grün)
function urteil({ mass, n }, soll) {
    if (!n) return ["keine Scheibe im Bild (n = 0, kein Median ≥ SCHEIBE_AB)"];
    return mass < soll ? [`Maß ${mass.toFixed(3)} < Soll ${soll}`] : [];
}

// ein synthetisches Bild: dunkler Grund, eine Scheibe (Radius r), optional ein Kreuz der Breite b durch ihre Mitte
function bild({ W = 128, grund = 0.05, scheibe = 0.8, r = 44, kreuz = null, b = 3 }) {
    const u8 = new Uint8Array(W * W * 4);
    const c = W / 2;
    for (let y = 0; y < W; y++)
        for (let x = 0; x < W; x++) {
            const innen = (x - c) ** 2 + (y - c) ** 2 <= r * r;
            const amKreuz = Math.abs(x - c) < b / 2 + 0.5 || Math.abs(y - c) < b / 2 + 0.5;
            const v = !innen ? grund : kreuz != null && amKreuz ? kreuz : scheibe;
            const p = (y * W + x) * 4;
            u8[p] = u8[p + 1] = u8[p + 2] = Math.round(v * 255);
            u8[p + 3] = 255;
        }
    return { W, H: W, u8 };
}

if (SELBSTTEST) {
    console.log("=== KREUZ-MASS — Selbsttest ===");
    const fehler = [];
    const fall = (name, b) => {
        const r = kreuzMass(b);
        const v = urteil(r, SOLL);
        console.log(`  ${name}: Maß ${r.mass == null ? "—" : r.mass.toFixed(3)} · n ${r.n} · ${v.length ? "ROT (" + v[0] + ")" : "GRÜN"}`);
        return { r, v };
    };
    const gut = fall("die Gute (Scheibe, dunkles Kreuz)", bild({ kreuz: 0.1 }));
    if (gut.v.length) fehler.push("die Gute fällt rot: " + gut.v[0]);
    for (const [name, k] of [
        ["Mutant ohne Kreuz", null],
        ["Mutant Kreuz heller als die Scheibe (main)", 1.0],
    ]) {
        const m = fall(name, bild({ kreuz: k }));
        if (!m.v.length) fehler.push(name + " fällt nicht rot");
        if (!(m.r.n > 0 && m.r.mass < NAHE_NULL)) fehler.push(`${name}: Maß ${m.r.mass} nicht nahe 0 (< ${NAHE_NULL})`);
    }
    const leer = fall("Mutant ohne Scheibe", bild({ scheibe: 0.05 }));
    if (leer.r.n !== 0 || !leer.v.length) fehler.push("ein Bild ohne Scheibe trägt n > 0 oder fällt nicht rot");
    selbsttestEnde(fehler, "die Linse trennt das dunkle Kreuz von keinem und vom hellen, ein Bild ohne Scheibe ist ROT.");
} else {
    const datei = process.argv.slice(2).find((a, i, a2) => !a.startsWith("--") && a2[i - 1] !== "--soll");
    if (!datei) {
        console.error("diag-kreuz-mass: <png> [--soll 0.12] | --selftest");
        process.exit(1);
    }
    const soll = Number(argOpt("--soll", SOLL));
    const r = kreuzMass(pngLesen(fs.readFileSync(datei)));
    console.log(`kreuz-mass ${datei}: Maß ${r.mass == null ? "—" : r.mass.toFixed(3)} · n ${r.n} · Soll ${soll}`);
    const v = urteil(r, soll);
    urteilEnde(v.length, `❌ ROT — ${v.join(" · ")}`, "✅ GRÜN — das Kreuz steht dunkel vor der Scheibe.");
}
