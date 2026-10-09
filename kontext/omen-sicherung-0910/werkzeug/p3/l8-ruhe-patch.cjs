// gate:fahr-leben L8: die Probe hält die Welt der anderen Tiere an (keine Geburt während der 200 Schritte, die Gasse und ihr
// Umkreis 60 m geräumt) und nennt in der Spur die Tiere nahe dem Wagen (ein Lauf mit 0,91 m Abweichung, zuerst Schritt 46
// Wagen x — vor jedem Kontakt mit dem Bären: geboren je Bildrate zu einer anderen Sim-Zeit, ist ein Spawn kein Stoß-Takt).
"use strict";
const fs = require("fs");
const p = process.argv[2];
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER: " + a.slice(0, 100));
    s = s.replace(a, b);
}
ers(
    `                    st.maxCreatures = Math.max(st.maxCreatures, st.creatures.length + 1);
                    // die Gasse frei von anderen Tieren (dieselbe Räumung wie die Stoß-Proben)
                    for (const cr of (st.creatures || []).slice())
                        if (cr && cr.position && Math.hypot(cr.position.x - bx, cr.position.z - bz) < 30)
                            r.removeCreature(cr);`,
    `                    // die Welt der anderen Tiere ruht: der Umkreis 60 m geräumt, keine Geburt während der Probe (die Kappe
                    // steht auf dem Bestand + dem Bären) — der Lockstep prüft den Stoß, nicht den Takt des Spawners
                    for (const cr of (st.creatures || []).slice())
                        if (cr && cr.position && Math.hypot(cr.position.x - bx, cr.position.z - bz) < 60)
                            r.removeCreature(cr);
                    const kappeL = st.maxCreatures;
                    st.maxCreatures = st.creatures.length + 1;`
);
ers(
    `                            spur.push([
                                pmT.x,
                                pmT.z,
                                b.position.x,
                                b.position.z,
                                b.position.y,
                                sv ? Math.hypot(sv.x, sv.z) : 0,
                            ]);`,
    `                            let nah = 0;
                            for (const cr of st.creatures || [])
                                if (cr && cr !== b && Math.hypot(cr.position.x - pmT.x, cr.position.z - pmT.z) < 12) nah++;
                            spur.push([
                                pmT.x,
                                pmT.z,
                                b.position.x,
                                b.position.z,
                                b.position.y,
                                sv ? Math.hypot(sv.x, sv.z) : 0,
                                nah,
                            ]);`
);
ers(
    `                    const namen = ["Wagen x", "Wagen z", "Bär x", "Bär z", "Bär y", "Bär Stoß"];`,
    `                    const namen = ["Wagen x", "Wagen z", "Bär x", "Bär z", "Bär y", "Bär Stoß", "Tiere nahe dem Wagen"];`
);
ers(
    `                    } finally {
                        r._stepFixedSim = PF;
                        tasten(false);
                    }
                    weg(gS);
                    r.removeCreature(b);
                    if (lage) lage.spur = spur;`,
    `                    } finally {
                        r._stepFixedSim = PF;
                        tasten(false);
                        st.maxCreatures = kappeL;
                    }
                    weg(gS);
                    r.removeCreature(b);
                    if (lage) lage.spur = spur;`
);
ers(
    `                                erst = {
                                    schritt: i + 1,
                                    groesse: namen[k],
                                    d: +(lMix.spur[i][k] - l60.spur[i][k]).toFixed(5),
                                };`,
    `                                erst = {
                                    schritt: i + 1,
                                    groesse: namen[k],
                                    d: +(lMix.spur[i][k] - l60.spur[i][k]).toFixed(5),
                                    tiere: [l60.spur[i][6], lMix.spur[i][6]], // die Tiere nahe dem Wagen in beiden Läufen
                                };`
);
fs.writeFileSync(p, s);
console.log("ok");
