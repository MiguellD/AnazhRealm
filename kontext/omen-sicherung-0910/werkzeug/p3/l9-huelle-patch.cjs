// gate:fahr-leben L9: der Reiter steckt IM Wagen — jede Ecke seiner Haut gegen die Hülle des Kerns (exportDrive.huelle im
// Rahmen des Wagens: unter dem Bauch ySill · über der Dachlinie · seitlich über bw unter dem Gürtel, über cw darüber · vor
// dem Bug / hinter dem Heck). Gezählt je Richtung mit der größten Überschreitung und ihrem Knochen (das Auge sah 0710-4:
// die Füße hingen unter dem Wagen, im Supersport drückte der Arm durch die Tür).
"use strict";
const fs = require("fs");
const p = process.argv[2];
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER: " + a.slice(0, 100));
    s = s.replace(a, b);
}
ers(
    `                let oben = -Infinity;
                let unten = Infinity;
                pm.updateMatrixWorld(true);
                nah.traverse((o) => {`,
    `                let oben = -Infinity;
                let unten = Infinity;
                // die Hülle des Kerns im Rahmen des Wagens (vor dem Durchlauf: Rahmen und Stationen)
                const fzgH = r._fahrzeugGesetzFor(e);
                const hu = fzgH && fzgH.drive && fzgH.drive.huelle ? fzgH.drive.huelle : null;
                const scH = Number.isFinite(e.scale) ? e.scale : 1;
                const thH = Number.isFinite(e.rotationY) ? e.rotationY : 0;
                const basisH = e.position.y - 0.5;
                const aussen = { unten: 0, oben: 0, seite: 0, laengs: 0, n: 0, tief: {}, wer: {} };
                const raus = (art, um, kn) => {
                    aussen[art]++;
                    if (!(aussen.tief[art] >= um)) {
                        aussen.tief[art] = +um.toFixed(3);
                        aussen.wer[art] = kn;
                    }
                };
                pm.updateMatrixWorld(true);
                nah.traverse((o) => {`
);
ers(
    `                    for (let i = 0; i < pos.count; i++) {
                        o.getVertexPosition(i, V);
                        V.applyMatrix4(o.matrixWorld);
                        if (V.y > oben) oben = V.y;
                        if (!sw) continue;
                        let bw = -1;
                        let kn = null;
                        for (let k = 0; k < 4; k++) {
                            const w = sw.getComponent(i, k);
                            if (w > bw) {
                                bw = w;
                                kn = o.skeleton.bones[si.getComponent(i, k)];
                            }
                        }
                        if (schenkel.has(kn) && V.y < unten) unten = V.y;
                    }`,
    `                    for (let i = 0; i < pos.count; i++) {
                        o.getVertexPosition(i, V);
                        V.applyMatrix4(o.matrixWorld);
                        if (V.y > oben) oben = V.y;
                        let kn = null;
                        if (sw) {
                            let bw = -1;
                            for (let k = 0; k < 4; k++) {
                                const w = sw.getComponent(i, k);
                                if (w > bw) {
                                    bw = w;
                                    kn = o.skeleton.bones[si.getComponent(i, k)];
                                }
                            }
                            if (schenkel.has(kn) && V.y < unten) unten = V.y;
                        }
                        if (!hu) continue;
                        aussen.n++;
                        const dxH = V.x - e.position.x;
                        const dzH = V.z - e.position.z;
                        const lx = (dxH * Math.cos(thH) - dzH * Math.sin(thH)) / scH;
                        const lz = (dxH * Math.sin(thH) + dzH * Math.cos(thH)) / scH;
                        const ly = (V.y - basisH) / scH;
                        const name = (kn && kn.name) || o.name || "?";
                        const T = 0.02;
                        if (ly < hu.ySill - T) raus("unten", hu.ySill - ly, name);
                        else if (ly > hu.yRoof + T) raus("oben", ly - hu.yRoof, name);
                        else {
                            const breit = ly < hu.yBelt ? hu.bw : hu.cw;
                            if (Math.abs(lz) > breit + T) raus("seite", Math.abs(lz) - breit, name);
                            else if (lx > hu.noseX + T || lx < hu.tailX - T)
                                raus("laengs", Math.max(lx - hu.noseX, hu.tailX - lx), name);
                        }
                    }`
);
ers(
    `                    lehneGrad: rg.spine ? +((-rg.spine.rotation.x * 180) / Math.PI).toFixed(1) : null,
                });`,
    `                    lehneGrad: rg.spine ? +((-rg.spine.rotation.x * 180) / Math.PI).toFixed(1) : null,
                    aussen: hu ? aussen : null,
                });`
);
// das Urteil: höchstens 0,5 % der Haut außerhalb der Hülle, je Richtung benannt
ers(
    `            if (!(q.blickGrad <= STATION.blickGrad))
                out.push(
                    \`reiter \${q.typ}: der Leib schaut \${q.blickGrad.toFixed(0)}° neben die Fahrt (er folgt der Maus)\`
                );`,
    `            if (!(q.blickGrad <= STATION.blickGrad))
                out.push(
                    \`reiter \${q.typ}: der Leib schaut \${q.blickGrad.toFixed(0)}° neben die Fahrt (er folgt der Maus)\`
                );
            const au = q.aussen;
            if (au && au.n > 0)
                for (const art of ["unten", "seite", "oben", "laengs"])
                    if (au[art] / au.n > STATION.hautAussen)
                        out.push(
                            \`reiter \${q.typ}: \${((100 * au[art]) / au.n).toFixed(1)} % der Haut \${{ unten: "unter dem Bauch", seite: "seitlich aus der Kabine", oben: "über dem Dach", laengs: "vor dem Bug / hinter dem Heck" }[art]} (bis \${au.tief[art]} m, \${au.wer[art]})\`
                        );`
);
ers(
    `    blickGrad: 5, // °: so weit darf der sitzende Leib neben die Fahrt schauen`,
    `    blickGrad: 5, // °: so weit darf der sitzende Leib neben die Fahrt schauen
    hautAussen: 0.005, // Anteil der Haut des Reiters, der je Richtung außerhalb der Hülle des Wagens liegen darf`
);
ers(
    "            : `${q.typ.replace(\"fahrzeug_\", \"\")}: Kopf ${q.dach === null ? \"offen\" : (q.oben - q.dach).toFixed(2)} · Schenkel ${(q.schenkel - q.sitz).toFixed(2)} · Anker ${Math.hypot(q.ankerL, q.ankerQ).toFixed(2)} · Blick ${q.blickGrad.toFixed(0)}° · Lehne ${q.lehneGrad}°`;",
    "            : `${q.typ.replace(\"fahrzeug_\", \"\")}: Kopf ${q.dach === null ? \"offen\" : (q.oben - q.dach).toFixed(2)} · Schenkel ${(q.schenkel - q.sitz).toFixed(2)} · Anker ${Math.hypot(q.ankerL, q.ankerQ).toFixed(2)} · Blick ${q.blickGrad.toFixed(0)}° · Lehne ${q.lehneGrad}°${q.aussen && q.aussen.n ? ` · außen ${[\"unten\", \"seite\", \"oben\", \"laengs\"].filter((k) => q.aussen[k]).map((k) => `${k} ${((100 * q.aussen[k]) / q.aussen.n).toFixed(1)} % (${q.aussen.tief[k]} m ${q.aussen.wer[k]})`).join(\", \") || \"0\"}` : \"\"}`;"
);
// Selbst-Test: der Befund (Füße unter dem Bauch) wird beim Namen genannt
ers(
    `            [
                "der Bär steht je nach Bildrate anders, der Wagen gleich (Gegenprüfung 0710-5: 1,39 m)",`,
    `            [
                "die Füße des Reiters hängen unter dem Wagen (Gegenprüfung 0710-4, das Auge)",
                {
                    reiter: [
                        {
                            typ: "fahrzeug_gt",
                            oben: 1.15,
                            dach: 1.2,
                            schenkel: 0.475,
                            sitz: 0.475,
                            ankerL: 0,
                            ankerQ: 0,
                            blickGrad: 0,
                            lehneGrad: 60,
                            aussen: { unten: 4200, seite: 0, oben: 0, laengs: 0, n: 116000, tief: { unten: 0.18 }, wer: { unten: "ankle1" } },
                        },
                    ],
                },
                "reiter fahrzeug_gt",
            ],
            [
                "der Bär steht je nach Bildrate anders, der Wagen gleich (Gegenprüfung 0710-5: 1,39 m)",`
);
fs.writeFileSync(p, s);
console.log("ok");
