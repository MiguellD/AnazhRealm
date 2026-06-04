#!/usr/bin/env node
/*
 * diag-shadow-snap.cjs — MISST die Wurzel von R1 (Schatten-Rasterlinie an
 * vertikalen Wänden, wandert beim Laufen). Reine Geometrie, kein Engine-Load
 * (Stufe-2-Probe, V9.94.r): die Snap-Stabilität hängt NUR von sunDir +
 * shadowWidth + mapSize ab — die kann ich faithful nachrechnen.
 *
 * Die Wurzel (roadmap #18d-R1): der V9.85-Texel-Snap snappt `focus` (= Spieler)
 * in WELT-X/Z. Aber das Shadow-Texel-Grid liegt in der Ebene SENKRECHT zu
 * sunDir (die Lateral-Achsen der Light-View-Camera). Bei schräger Sonne ist
 * ein ganz-Texel-Schritt in Welt-X/Z KEIN ganz-Texel-Schritt in dieser Ebene
 * → der Snap-Punkt wandert relativ zum echten Grid, während der Spieler
 * kontinuierlich läuft → das Schatten-Muster „kriecht" (Rest-Swimming).
 *
 * Diese Probe trennt „Welt-Snap (Rest-Swimming)" von „Light-Space-Snap
 * (gelockt)" — exakt wie diag-facets Albedo von Facetten-Lichtung trennte.
 *
 * Metrik: der WITHIN-TEXEL-Versatz des Snap-Fokus, projiziert auf die
 * Light-Lateral-Achsen, über einen kontinuierlichen Lauf. Ein gelocktes Grid
 * hat einen KONSTANTEN Versatz (STD ≈ 0) → kein Swimming. Ein wanderndes Grid
 * hat einen variierenden Versatz (STD bis ~0.29 Texel = 1/√12) → Swimming;
 * die Spanne × Texel-Größe ist das Swimming in METERN.
 */

const SHADOW_WIDTH = 600; // sc.right - sc.left  (±300, anazhRealm L44891-44892)
const MAP_SIZE = 2048; // directionalLight.shadow.mapSize.width
const TEXEL = SHADOW_WIDTH / MAP_SIZE; // ~0.29297 m/Texel

// Die echte sunDir-Formel (anazhRealm._dayNightSunDirection + _applyDayNightToScene).
function sunDirFor(timeOfDay) {
    const angle = timeOfDay * Math.PI * 2 - Math.PI / 2;
    let x = Math.cos(angle);
    let y = Math.sin(angle);
    let z = Math.sin(angle * 0.5) * 0.4;
    const l = Math.hypot(x, y, z) || 1;
    return [x / l, y / l, z / l];
}

// Light-View-Basis EXAKT wie Three.js' Shadow-Camera (Matrix4.lookAt):
//   z = normalize(eye - target) = normalize(sunDir)
//   x = normalize(cameraUp × z)   (cameraUp default (0,1,0))
//   y = z × x
// x,y spannen die Texel-Grid-Ebene (⟂ sunDir).
function lightLateralBasis(s) {
    const up = Math.abs(s[1]) > 0.999 ? [0, 0, 1] : [0, 1, 0]; // Zenit-Fallback
    let x = [up[1] * s[2] - up[2] * s[1], up[2] * s[0] - up[0] * s[2], up[0] * s[1] - up[1] * s[0]];
    const xl = Math.hypot(x[0], x[1], x[2]) || 1;
    x = [x[0] / xl, x[1] / xl, x[2] / xl];
    const y = [s[1] * x[2] - s[2] * x[1], s[2] * x[0] - s[0] * x[2], s[0] * x[1] - s[1] * x[0]];
    return { x, y };
}
const dot3 = (a, bx, by, bz) => a[0] * bx + a[1] * by + a[2] * bz;
// signierter Versatz zum nächsten Grid-Knoten, in TEXEL-Einheiten ∈ [-0.5, 0.5]
const gridOffset = (v) => {
    const r = v / TEXEL;
    return r - Math.round(r);
};
const std = (arr) => {
    const m = arr.reduce((a, b) => a + b, 0) / arr.length;
    return Math.sqrt(arr.reduce((a, b) => a + (b - m) * (b - m), 0) / arr.length);
};
const span = (arr) => Math.max(...arr) - Math.min(...arr);

// kontinuierlicher Lauf, sub-texel aufgelöst, diagonal (nicht achs-parallel)
const STEPS = 256;
const STEP = 0.0125; // m/Frame → ~3.2 m Weg

function measure(timeOfDay) {
    const s = sunDirFor(timeOfDay);
    const { x: ax, y: ay } = lightLateralBasis(s);
    const wA = [];
    const wB = [];
    const lA = [];
    const lB = [];
    for (let i = 0; i < STEPS; i++) {
        const px = i * STEP * 0.82; // diagonale Bahn
        const pz = i * STEP * 0.57 + 0.31;
        // --- IST: V9.85 Welt-X/Z-Snap ---
        const fxW = Math.round(px / TEXEL) * TEXEL;
        const fzW = Math.round(pz / TEXEL) * TEXEL;
        wA.push(gridOffset(dot3(ax, fxW, 0, fzW)));
        wB.push(gridOffset(dot3(ay, fxW, 0, fzW)));
        // --- NEU: Light-Space-Snap (focus in die Lateral-Achsen, dort snappen) ---
        const fa0 = dot3(ax, px, 0, pz);
        const fb0 = dot3(ay, px, 0, pz);
        const dFa = Math.round(fa0 / TEXEL) * TEXEL - fa0;
        const dFb = Math.round(fb0 / TEXEL) * TEXEL - fb0;
        const fxL = px + dFa * ax[0] + dFb * ay[0];
        const fyL = 0 + dFa * ax[1] + dFb * ay[1];
        const fzL = pz + dFa * ax[2] + dFb * ay[2];
        lA.push(gridOffset(dot3(ax, fxL, fyL, fzL)));
        lB.push(gridOffset(dot3(ay, fxL, fyL, fzL)));
    }
    // Swimming = max der Spannen der beiden Lateral-Achsen (in Texel-Einheiten)
    const wSwim = Math.max(span(wA), span(wB));
    const lSwim = Math.max(span(lA), span(lB));
    return {
        elev: ((Math.asin(Math.max(-1, Math.min(1, s[1]))) * 180) / Math.PI).toFixed(0),
        sun: `(${s[0].toFixed(2)},${s[1].toFixed(2)},${s[2].toFixed(2)})`,
        wStd: Math.max(std(wA), std(wB)),
        wSwim,
        wSwimM: wSwim * TEXEL,
        lStd: Math.max(std(lA), std(lB)),
        lSwim,
        lSwimM: lSwim * TEXEL,
    };
}

console.log("=== diag-shadow-snap — R1 Schatten-Snap-Stabilität ===");
console.log(`Texel-Größe: ${TEXEL.toFixed(5)} m  (${SHADOW_WIDTH} m / ${MAP_SIZE} Texel)`);
console.log("Swimming = Spanne des within-texel-Versatzes des Snap-Fokus über ~3.2 m Lauf.\n");
console.log("           |        WELT-X/Z-Snap (IST)        |      LIGHT-SPACE-Snap (NEU)");
console.log("  t   elev | STD(tex)  Swim(tex)  Swim(m)      | STD(tex)  Swim(tex)  Swim(m)");
console.log("  ---------+-----------------------------------+------------------------------");
const times = [0.28, 0.33, 0.4, 0.5, 0.6, 0.67, 0.72];
let worstWorld = 0;
let worstLight = 0;
for (const t of times) {
    const r = measure(t);
    worstWorld = Math.max(worstWorld, r.wSwimM);
    worstLight = Math.max(worstLight, r.lSwimM);
    console.log(
        `  ${t.toFixed(2)}  ${r.elev.padStart(3)}° | ` +
            `${r.wStd.toFixed(4)}    ${r.wSwim.toFixed(4)}    ${r.wSwimM.toFixed(4)}      | ` +
            `${r.lStd.toExponential(1)}   ${r.lSwim.toExponential(1)}   ${r.lSwimM.toExponential(1)}`
    );
}
console.log("\n--- Verdikt ---");
console.log(`WELT-X/Z-Snap (IST):    max Swimming = ${worstWorld.toFixed(4)} m  (~${(worstWorld / TEXEL).toFixed(2)} Texel)`);
console.log(`LIGHT-SPACE-Snap (NEU): max Swimming = ${worstLight.toExponential(2)} m  (~0 Texel)`);
const ok = worstWorld > 0.1 && worstLight < 1e-6;
console.log(
    ok
        ? "\n✓ WURZEL BESTÄTIGT: der Welt-X/Z-Snap lässt bis ~1 Texel Rest-Swimming (sichtbar als\n" +
              "  wandernde Rasterlinie an vertikalen Wänden); der Light-Space-Snap lockt es auf 0.\n" +
              "  → Der Fix ist der Light-Space-Snap in _dayNightApplyDirectionalLight."
        : "\n✗ unerwartet — Annahme prüfen."
);
process.exit(ok ? 0 : 1);
