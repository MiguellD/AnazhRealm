// gate:fahr-leben L8 + Schwimmer: derselbe gestoßene Fuchs in tiefem Wasser bei 60 fps und bei gemischten Frames — seine Lage
// (x, z UND y) 20 Sim-Schritte nach dem Stoß muss gleich sein (die Höhe eines gleitenden Schwimmers setzte der Frame-Takt).
"use strict";
const fs = require("fs");
const p = process.argv[2];
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER: " + a.slice(0, 100));
    s = s.replace(a, b);
}
ers(
    `                        m.tiefste = +m.tiefste.toFixed(3);
                        m.tiefe = +(ort.spiegel - hh(ort.x, ort.z)).toFixed(2);
                        S.schwimmer = m;
                        r.removeCreature(f);
                    } else S.schwimmer = { fehler: "kein Fuchs" };`,
    `                        m.tiefste = +m.tiefste.toFixed(3);
                        m.tiefe = +(ort.spiegel - hh(ort.x, ort.z)).toFixed(2);
                        S.schwimmer = m;
                        r.removeCreature(f);
                        // DER SCHWIMMER IM LOCKSTEP (L8, 0710-5-Nachschnitt): derselbe Stoß bei 60 fps und bei gemischten Frames,
                        // die Lage 20 Sim-Schritte danach — x, z UND y (im Wasser setzte der Frame-Takt die Höhe, mit seinen Wellen)
                        const schwimmLauf = (muster) => {
                            const g = r.spawnCreatureAt(ort.x, ort.spiegel, ort.z, "calm", "fuchs", {
                                precise: true,
                                bodySize: 1,
                            });
                            if (!g) return null;
                            g.userData._steuer = { gier: 0, v: 0 };
                            g.userData._stossV = null;
                            let k = 0;
                            for (let i = 0; i < 30; i++) {
                                tMs += muster[i % muster.length];
                                r._gameLoopTick(tMs);
                            }
                            g.position.x = ort.x; // dieselbe Start-Lage in beiden Läufen
                            g.position.z = ort.z;
                            st._fixedAccumulator = 0;
                            g.userData._stossV = { x: 4, z: 0 };
                            const PFs = r._stepFixedSim;
                            let lage = null;
                            r._stepFixedSim = function (simTime, dt) {
                                PFs.call(this, simTime, dt);
                                k++;
                                if (k === 20) lage = { x: g.position.x, z: g.position.z, y: g.position.y };
                            };
                            try {
                                for (let i = 0; i < 400 && lage === null; i++) {
                                    tMs += muster[i % muster.length];
                                    r._gameLoopTick(tMs);
                                }
                            } finally {
                                r._stepFixedSim = PFs;
                            }
                            r.removeCreature(g);
                            return lage;
                        };
                        st.maxCreatures = st.creatures.length + 1;
                        const s60 = schwimmLauf([1000 / 60]);
                        const sMix = schwimmLauf([8, 33, 16, 25, 12, 30, 20, 9, 33, 14]);
                        S.lockSchwimmer =
                            s60 && sMix
                                ? {
                                      abw: +Math.hypot(s60.x - sMix.x, s60.z - sMix.z).toFixed(6),
                                      abwY: +Math.abs(s60.y - sMix.y).toFixed(6),
                                  }
                                : null;
                    } else S.schwimmer = { fehler: "kein Fuchs" };`
);
// das Urteil (unter dem Namen lockstep — L8 trägt ihn)
ers(
    `    // L10 DER GESTOSSENE SCHWIMMER
    const sch = s.schwimmer;`,
    `    // L8 + Schwimmer: der gestoßene Fuchs im Wasser steht bei jeder Bildrate gleich (x, z und y)
    if (s.schwimmer && !s.schwimmer.fehler) {
        const ls = s.lockSchwimmer;
        if (!ls) out.push("lockstep schwimmer: keine Probe");
        else if (!(ls.abw <= STATION.lockstepM) || !(ls.abwY <= STATION.lockstepM))
            out.push(
                \`lockstep schwimmer: 20 Sim-Schritte nach dem Stoß steht der Fuchs bei gemischten Frames \${ls.abw} m daneben und \${ls.abwY} m höher/tiefer als bei 60 fps\`
            );
    }
    // L10 DER GESTOSSENE SCHWIMMER
    const sch = s.schwimmer;`
);
ers(
    "        S.lockstep\n            ? `Abweichung Wagen ${S.lockstep.abw} m · Bär ${S.lockstep.baerAbw} m",
    "        (S.lockSchwimmer ? `Schwimmer ${S.lockSchwimmer.abw} m / Höhe ${S.lockSchwimmer.abwY} m · ` : \"\") +\n            (S.lockstep\n            ? `Abweichung Wagen ${S.lockstep.abw} m · Bär ${S.lockstep.baerAbw} m"
);
ers(
    `            : "keine Probe"
    );
    const reiterZeile = (q) =>`,
    `            : "keine Probe")
    );
    const reiterZeile = (q) =>`
);
ers(
    `        "L8 Lockstep (0710-5): der Wagen steht nach 200 Sim-Schritten gegen einen Bären bei 60 fps und gemischten Frames an derselben Stelle",`,
    `        "L8 Lockstep (0710-5): der Wagen steht nach 200 Sim-Schritten gegen einen Bären bei 60 fps und gemischten Frames an derselben Stelle, ein gestoßener Schwimmer nach 20 (auch in der Höhe)",`
);
// Selbst-Test
ers(
    `            schwimmer: { vorher: -0.1, tiefste: -0.15, gleitet: 20, tiefe: 2 },
        };`,
    `            schwimmer: { vorher: -0.1, tiefste: -0.15, gleitet: 20, tiefe: 2 },
            lockSchwimmer: { abw: 0, abwY: 0 },
        };`
);
ers(
    `            [
                "der gestoßene Schwimmer sinkt auf den Grund (Gegenprüfung 0710-5-Nachschnitt)",`,
    `            [
                "die Höhe des gestoßenen Schwimmers hängt an der Bildrate (Gegenprüfung 0710-5-Nachschnitt)",
                { lockSchwimmer: { abw: 0, abwY: 0.31 } },
                "lockstep schwimmer",
            ],
            [
                "der gestoßene Schwimmer sinkt auf den Grund (Gegenprüfung 0710-5-Nachschnitt)",`
);
fs.writeFileSync(p, s);
console.log("ok");
