// 0710-5 Klasse ganz: auch die Höhe des gestoßenen Schwimmers lebt im Sim-Schritt — die Schwimm-Linie aus EINER Stelle
// (`_kreaturSchwimmLinie`, Leser Frame-Takt und Stoß-Schritt); der Frame-Takt lässt die Höhe eines gleitenden Leibs stehen,
// an Land wie im Wasser (L8 + Schwimmer: 0,127 m Höhen-Abweichung zwischen 60 fps und gemischten Frames).
"use strict";
const fs = require("fs");
const p = process.argv[2] + "/anazhRealm.js";
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER: " + a.slice(0, 100));
    s = s.replace(a, b);
}
ers(`                baseY = waterSurface - 0.3;`, `                baseY = this._kreaturSchwimmLinie(waterSurface);`);
ers(
    `            // ein gleitender Leib (er trägt einen Stoß) steht an Land auf der Höhe seines Sim-Schritts (\`_kreaturStossSchritt\`);
            // schwimmt er, hält ihn dieser Takt an seiner Schwimm-Linie
            if (!creature.userData._stossV || waterSurface !== null)
                creature.position.y = baseY + floatOffset + hopOffset;`,
    `            // ein gleitender Leib (er trägt einen Stoß) steht auf der Höhe seines Sim-Schritts (\`_kreaturStossSchritt\`) — an
            // Land wie im Wasser; die Welle des Schwimmers ruht, solange er gleitet
            if (!creature.userData._stossV) creature.position.y = baseY + floatOffset + hopOffset;`
);
ers(
    `            // Schwimmt er (die EINE Wasser-Regel, \`_kreaturSchwimmt\`: nahe dem Spieler, nasse Spalte tiefer als
            // VERHALTEN.wasser.schwimmTiefeM), trägt ihn der Frame-Takt an seiner Schwimm-Linie — vorher setzte dieser Schritt
            // auch im Wasser den Boden (gate:fahr-leben L10: ein Fuchs in 3,2 m Wasser sank beim Gleiten 2,77 m tief).
            const gesetz = this.getTerrainHeightAt(c.position.x, c.position.z);
            const pmW = this.state.playerMesh && this.state.playerMesh.position;
            const nahW = pmW && (c.position.x - pmW.x) ** 2 + (c.position.z - pmW.z) ** 2 < 2500;
            if (!(nahW && this._kreaturSchwimmt(this._creatureWaterContextAt(c, gesetz)))) {
                const sicht = this._standSicht(c.position.x, c.position.z, gesetz, false);
                c.position.y = Number.isFinite(sicht) ? sicht : gesetz;
            }`,
    `            // Schwimmt er (die EINE Wasser-Regel, \`_kreaturSchwimmt\`: nahe dem Spieler, nasse Spalte tiefer als
            // VERHALTEN.wasser.schwimmTiefeM), steht er an seiner Schwimm-Linie (\`_kreaturSchwimmLinie\`, dieselbe wie im
            // Frame-Takt) — vorher setzte dieser Schritt auch im Wasser den Boden (gate:fahr-leben L10: ein Fuchs in 3,2 m Wasser
            // sank beim Gleiten 2,77 m tief), danach setzte der Frame-Takt die Höhe mit seiner Welle (L8: 0,127 m je Bildrate).
            const gesetz = this.getTerrainHeightAt(c.position.x, c.position.z);
            const pmW = this.state.playerMesh && this.state.playerMesh.position;
            const nahW = pmW && (c.position.x - pmW.x) ** 2 + (c.position.z - pmW.z) ** 2 < 2500;
            if (nahW && this._kreaturSchwimmt(this._creatureWaterContextAt(c, gesetz)))
                c.position.y = this._kreaturSchwimmLinie(this._waterLevelAt(c.position.x, c.position.z));
            else {
                const sicht = this._standSicht(c.position.x, c.position.z, gesetz, false);
                c.position.y = Number.isFinite(sicht) ? sicht : gesetz;
            }`
);
ers(
    `    _kreaturSchwimmt(wctx) {
        return !!(wctx && wctx.inWater && wctx.depthBelow > AnazhRealm._verhaltenGesetz().wasser.schwimmTiefeM);
    }`,
    `    _kreaturSchwimmt(wctx) {
        return !!(wctx && wctx.inWater && wctx.depthBelow > AnazhRealm._verhaltenGesetz().wasser.schwimmTiefeM);
    }
    // DIE SCHWIMM-LINIE: so tief liegt die Sohle eines schwimmenden Leibs unter dem Spiegel (0,3 m) — Leser: der Frame-Takt
    // (updateCreatures, dazu seine Welle) und der Stoß-Schritt (ohne Welle, der Sim-Schritt kennt keine Frame-Uhr).
    _kreaturSchwimmLinie(spiegel) {
        return spiegel - 0.3;
    }`
);
fs.writeFileSync(p, s);
console.log("ok");
