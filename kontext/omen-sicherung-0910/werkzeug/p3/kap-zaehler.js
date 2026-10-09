// werkbank eval: DER LÖSER-ZÄHLER (0710-7 (3), die Klasse) — Box-Lösungen je Körper-Schritt des Spielers (`_stepCharacter`)
// und je Frame (`_loopCamera`). Befehl: an | aus (aus liest und nimmt die Hüllen wieder ab).
const cmd = window.__kapCmd || "aus";
const P = Object.getPrototypeOf(r);
if (cmd === "an") {
    const Z = (window.__kapZ = { schritte: 0, loesungen: 0, frames: 0 });
    r._resolveCapsuleVsAABB = function (...a) {
        Z.loesungen++;
        return P._resolveCapsuleVsAABB.apply(this, a);
    };
    r._resolveHuelleVsAABB = function (...a) {
        Z.loesungen++;
        return P._resolveHuelleVsAABB.apply(this, a);
    };
    r._stepCharacter = function (...a) {
        Z.schritte++;
        return P._stepCharacter.apply(this, a);
    };
    r._loopCamera = function (...a) {
        Z.frames++;
        return P._loopCamera.apply(this, a);
    };
    return "an";
}
const Z = window.__kapZ || { schritte: 0, loesungen: 0, frames: 0 };
for (const k of ["_resolveCapsuleVsAABB", "_resolveHuelleVsAABB", "_stepCharacter", "_loopCamera"]) delete r[k];
return {
    frames: Z.frames,
    schritteJeFrame: +(Z.schritte / Math.max(1, Z.frames)).toFixed(2),
    loesungenJeSchritt: Math.round(Z.loesungen / Math.max(1, Z.schritte)),
    loesungenJeFrame: Math.round(Z.loesungen / Math.max(1, Z.frames)),
    reste: Object.keys(r).filter((k) => /_resolve|_stepCharacter|_loopCamera/.test(k)),
};
