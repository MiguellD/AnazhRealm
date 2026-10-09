// L8 nennt den ersten abweichenden Sim-Schritt und die Größe, die zuerst abweicht.
"use strict";
const fs = require("fs");
const p = process.argv[2];
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER: " + a.slice(0, 90));
    s = s.replace(a, b);
}
ers(
    `                    let schritte = 0;
                    let lage = null;
                    r._stepFixedSim = function (simTime, dt) {
                        PF.call(this, simTime, dt);
                        schritte++;`,
    `                    let schritte = 0;
                    let lage = null;
                    const spur = [];
                    r._stepFixedSim = function (simTime, dt) {
                        PF.call(this, simTime, dt);
                        schritte++;
                        {
                            const sv = b.userData._stossV;
                            const pmT = st.playerMesh.position;
                            spur.push([pmT.x, pmT.z, b.position.x, b.position.z, b.position.y, sv ? Math.hypot(sv.x, sv.z) : 0]);
                        }`
);
ers(
    `                    weg(gS);
                    r.removeCreature(b);
                    return lage;
                };`,
    `                    weg(gS);
                    r.removeCreature(b);
                    if (lage) lage.spur = spur;
                    return lage;
                };`
);
ers(
    `                S.lockstep =
                    l60 && lMix
                        ? {
                              abw: +Math.hypot(l60.x - lMix.x, l60.z - lMix.z).toFixed(6),
                              baerAbw: +Math.hypot(l60.bx - lMix.bx, l60.bz - lMix.bz).toFixed(6),
                          }
                        : null;`,
    `                // der erste Schritt, in dem die Läufe auseinandergehen, und die Größe, die zuerst abweicht (die Linse nennt sie)
                let erst = null;
                if (l60 && lMix) {
                    const namen = ["Wagen x", "Wagen z", "Bär x", "Bär z", "Bär y", "Bär Stoß"];
                    for (let i = 0; i < Math.min(l60.spur.length, lMix.spur.length) && !erst; i++)
                        for (let k = 0; k < namen.length; k++)
                            if (l60.spur[i][k] !== lMix.spur[i][k]) {
                                erst = { schritt: i + 1, groesse: namen[k], d: +(lMix.spur[i][k] - l60.spur[i][k]).toFixed(5) };
                                break;
                            }
                }
                S.lockstep =
                    l60 && lMix
                        ? {
                              abw: +Math.hypot(l60.x - lMix.x, l60.z - lMix.z).toFixed(6),
                              baerAbw: +Math.hypot(l60.bx - lMix.bx, l60.bz - lMix.bz).toFixed(6),
                              erst,
                          }
                        : null;`
);
ers(
    "            `lockstep: nach 200 Sim-Schritten steht der Wagen bei gemischten Frames ${s.lockstep.abw.toFixed(3)} m anders als bei 60 fps (Bär ${s.lockstep.baerAbw.toFixed(3)} m)`",
    "            `lockstep: nach 200 Sim-Schritten steht der Wagen bei gemischten Frames ${s.lockstep.abw.toFixed(3)} m anders als bei 60 fps (Bär ${s.lockstep.baerAbw.toFixed(3)} m)${s.lockstep.erst ? ` — zuerst in Schritt ${s.lockstep.erst.schritt}: ${s.lockstep.erst.groesse} um ${s.lockstep.erst.d}` : \"\"}`"
);
ers(
    '        S.lockstep ? `Abweichung Wagen ${S.lockstep.abw} m · Bär ${S.lockstep.baerAbw} m` : "keine Probe"',
    '        S.lockstep\n            ? `Abweichung Wagen ${S.lockstep.abw} m · Bär ${S.lockstep.baerAbw} m${S.lockstep.erst ? ` · zuerst Schritt ${S.lockstep.erst.schritt}: ${S.lockstep.erst.groesse} ${S.lockstep.erst.d}` : ""}`\n            : "keine Probe"'
);
fs.writeFileSync(p, s);
console.log("ok");
