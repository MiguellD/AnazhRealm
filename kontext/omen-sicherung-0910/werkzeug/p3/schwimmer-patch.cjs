// 0710-5-Nachschnitt: der gestoßene Schwimmer bleibt an seiner Schwimm-Linie — EINE Wasser-Regel (`_kreaturSchwimmt`) für
// Frame-Takt und Sim-Schritt; im Wasser trägt der Frame-Takt die Höhe weiter, der Sim-Schritt setzt sie nur an Land. Dazu:
// die Sitz-Pose hebt die Kippung der Spieler-Gruppe auf (Schwimmen/Rutschen kippten sie, im Sattel blieb sie stehen).
"use strict";
const fs = require("fs");
const p = process.argv[2] + "/anazhRealm.js";
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER: " + a.slice(0, 100));
    s = s.replace(a, b);
}
// (1) die EINE Wasser-Regel im Frame-Takt
ers(
    `                    if (wctx.depthBelow > WAS.schwimmTiefeM) {`,
    `                    if (this._kreaturSchwimmt(wctx)) {`
);
// (2) der Frame-Takt hält die Schwimm-Linie auch für einen gleitenden Leib
ers(
    `            if (!creature.userData._stossV) creature.position.y = baseY + floatOffset + hopOffset;`,
    `            if (!creature.userData._stossV || waterSurface !== null) creature.position.y = baseY + floatOffset + hopOffset;`
);
ers(
    `            // ein gleitender Leib (er trägt einen Stoß) steht auf der Höhe seines Sim-Schritts (\`_kreaturStossSchritt\`)`,
    `            // ein gleitender Leib (er trägt einen Stoß) steht an Land auf der Höhe seines Sim-Schritts (\`_kreaturStossSchritt\`);
            // schwimmt er, hält ihn dieser Takt an seiner Schwimm-Linie`
);
// (3) der Sim-Schritt setzt die Höhe nur an Land
ers(
    `            const gesetz = this.getTerrainHeightAt(c.position.x, c.position.z);
            const sicht = this._standSicht(c.position.x, c.position.z, gesetz, false);
            c.position.y = Number.isFinite(sicht) ? sicht : gesetz;
            ud.cachedGroundY = gesetz;`,
    `            // Schwimmt er (die EINE Wasser-Regel, \`_kreaturSchwimmt\`: nahe dem Spieler, nasse Spalte tiefer als
            // VERHALTEN.wasser.schwimmTiefeM), trägt ihn der Frame-Takt an seiner Schwimm-Linie — vorher setzte dieser Schritt
            // auch im Wasser den Boden (gate:fahr-leben L10: ein Fuchs in 3,2 m Wasser sank beim Gleiten 2,77 m tief).
            const gesetz = this.getTerrainHeightAt(c.position.x, c.position.z);
            const pmW = this.state.playerMesh && this.state.playerMesh.position;
            const nahW = pmW && (c.position.x - pmW.x) ** 2 + (c.position.z - pmW.z) ** 2 < 2500;
            if (!(nahW && this._kreaturSchwimmt(this._creatureWaterContextAt(c, gesetz)))) {
                const sicht = this._standSicht(c.position.x, c.position.z, gesetz, false);
                c.position.y = Number.isFinite(sicht) ? sicht : gesetz;
            }
            ud.cachedGroundY = gesetz;`
);
// (4) die Regel selbst, neben dem Stoß-Schritt
ers(
    `    // DER STOSS AUF EINEN LEIB: dv (m/s) längs (nx, nz) — er trägt den Leib, bis die Reibung ihn aufzehrt.`,
    `    // DIE EINE WASSER-REGEL DER TIERE: ein Leib schwimmt, wenn er in einer nassen Spalte steht, die tiefer ist als
    // VERHALTEN.wasser.schwimmTiefeM (der Wasser-Kontext \`_creatureWaterContextAt\`); dann trägt ihn der Spiegel (updateCreatures),
    // sonst steht er auf dem Boden. Leser: der Frame-Takt (updateCreatures) und der Sim-Schritt des Stoßes.
    _kreaturSchwimmt(wctx) {
        return !!(wctx && wctx.inWater && wctx.depthBelow > AnazhRealm._verhaltenGesetz().wasser.schwimmTiefeM);
    }

    // DER STOSS AUF EINEN LEIB: dv (m/s) längs (nx, nz) — er trägt den Leib, bis die Reibung ihn aufzehrt.`
);
// (5) die Sitz-Pose hebt die Kippung der Gruppe auf
ers(
    `        const rig = group.userData && group.userData.rig;
        if (rig) {
            for (const b of [rig.hips, rig.spine, rig.chest, rig.neck, rig.head]) if (b) b.rotation.set(0, 0, 0);
            for (const side of [rig.armL, rig.armR, rig.legL, rig.legR])
                for (const k in side) if (side[k] && side[k].rotation) side[k].rotation.set(0, 0, 0);
            // die Oberschenkel liegen auf der Sitzfläche`,
    `        const rig = group.userData && group.userData.rig;
        if (rig) {
            // die Gruppe sitzt aufrecht: Schwimmen und Rutschen kippen sie (_animateHuman), im Sattel läuft das nie — wer aus
            // dem Wasser aufsitzt, behielt die Schwimm-Lage (gate:fahr-leben L9 nach L10: Kopf und Schenkel verschoben)
            group.rotation.x = 0;
            group.rotation.z = 0;
            for (const b of [rig.hips, rig.spine, rig.chest, rig.neck, rig.head]) if (b) b.rotation.set(0, 0, 0);
            for (const side of [rig.armL, rig.armR, rig.legL, rig.legR])
                for (const k in side) if (side[k] && side[k].rotation) side[k].rotation.set(0, 0, 0);
            // die Oberschenkel liegen auf der Sitzfläche`
);
fs.writeFileSync(p, s);
console.log("ok");
