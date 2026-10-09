// 0710-5: gate:fahr-leben L7 (gestoßener Leib vor dünner Wand, 30/60/gemischt) und L8 (Lockstep des Stoßes).
"use strict";
const fs = require("fs");
const p = process.argv[2];
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER: " + a.slice(0, 100));
    s = s.replace(a, b);
}
ers(
    `            S.spielerWagen = sw;
        }
    } catch (e) {`,
    `            S.spielerWagen = sw;
        }
        // L7 DER GESTOSSENE LEIB VOR DÜNNER WAND (0710-5): ein Bär (Größe 1, sein Steuer-Schritt steht) 3 m vor einer 0,35 m
        // dünnen Wand bekommt 13,7 m/s gegen sie (der Stoß eines Wagens) — je Kadenz (60 fps, 30 fps, gemischte Frames 8–33 ms)
        // zehn Versuche, die Lage quer und die Phase des Akkumulators je Versuch versetzt. Gezählt: wie oft die Mitte des
        // Bären hinter die Wand gerät. Vorher (der Stoß im Frame-Takt ohne Weg-Prüfung) 30 fps 7/10.
        // L8 LOCKSTEP (0710-5): ein GT (W) gegen einen stehenden Bären, die Lage des Wagens nach genau 200 Sim-Schritten bei
        // 60 fps und bei gemischten Frames — sie muss gleich sein (der Stoß des Leibs lebt im festen Schritt).
        if (start && gasse) {
            if (st.player && st.player.mountedArch != null) r.dismountArchitecture();
            const A = Object.getPrototypeOf(r).constructor;
            const steuerRoh = A._steuerGesetz;
            const steht = Object.create(steuerRoh.call(A));
            steht.steuerSchritt = (sw2) => {
                sw2.v = 0;
            };
            const KADENZ = { 60: [1000 / 60], 30: [1000 / 30], gemischt: [8, 33, 16, 25, 12, 30, 20, 9, 33, 14] };
            const lauf = (muster, n, nachJedem) => {
                for (let i = 0; i < n; i++) {
                    tMs += muster[i % muster.length];
                    r._gameLoopTick(tMs);
                    if (nachJedem && nachJedem(i) === false) break;
                }
            };
            A._steuerGesetz = () => steht;
            try {
                // L7
                const wx = start.x + 14;
                const wz = start.z;
                const g = hh(wx, wz);
                const wand = r.spawnArchitecture(
                    "stein_block",
                    { x: wx, y: g + 0.5, z: wz },
                    { silent: true, precise: true }
                );
                if (wand) {
                    const platte = () => {
                        wand.blockerAABBs = [
                            { minX: wx - 0.175, maxX: wx + 0.175, minZ: wz - 2, maxZ: wz + 2, botY: g - 0.5, topY: g + 3, dick: 3.5 },
                        ];
                        wand._blockerReach = 3;
                    };
                    // der Spieler steht zu Fuß neben der Probe (die Tiere ticken im Nah-Band)
                    st.playerMesh.position.set(wx - 4, hh(wx - 4, wz + 6) + 1.2, wz + 6);
                    st.playerVel.setValue(0, 0, 0);
                    tasten(false);
                    const L7 = {};
                    for (const [name, muster] of Object.entries(KADENZ)) {
                        let durch = 0;
                        let n = 0;
                        let tiefstX = -Infinity;
                        for (let v = 0; v < 10; v++) {
                            platte();
                            const bz = wz - 0.9 + v * 0.2;
                            const bx = wx - 0.175 - 3;
                            const b = r.spawnCreatureAt(bx, hh(bx, bz) + 0.5, bz, "calm", "baer", {
                                precise: true,
                                bodySize: 1,
                            });
                            if (!b) continue;
                            b.position.set(bx, hh(bx, bz), bz);
                            b.rotation.y = Math.PI / 2;
                            b.userData._steuer = { gier: Math.PI / 2, v: 0 };
                            b.userData._stossV = null;
                            lauf([1 + v * 1.3], 1); // die Phase des Akkumulators je Versuch
                            b.userData._stossV = { x: 13.7, z: 0 };
                            let maxX = -Infinity;
                            lauf(muster, 90, () => {
                                maxX = Math.max(maxX, b.position.x);
                            });
                            n++;
                            tiefstX = Math.max(tiefstX, maxX - (wx + 0.175));
                            if (maxX > wx + 0.175) durch++;
                            r.removeCreature(b);
                        }
                        L7[name] = { durch, n, ueber: +tiefstX.toFixed(3) };
                    }
                    r.removeArchitecture(wand);
                    S.leibWand = L7;
                }
                // L8
                const ux = Math.sin(gasse.fahrt);
                const uz = Math.cos(gasse.fahrt);
                const lockProbe = async (muster) => {
                    const gS = await setzen("fahrzeug_gt", gasse.x, gasse.z, gasse.fahrt);
                    if (!gS) return null;
                    const bx = gasse.x + ux * 9;
                    const bz = gasse.z + uz * 9;
                    const b = r.spawnCreatureAt(bx, hh(bx, bz) + 0.5, bz, "calm", "baer", { precise: true, bodySize: 1 });
                    if (!b) {
                        weg(gS);
                        return null;
                    }
                    b.position.set(bx, hh(bx, bz), bz);
                    b.rotation.y = gasse.fahrt + Math.PI / 2;
                    b.userData._steuer = { gier: b.rotation.y, v: 0 };
                    b.userData._stossV = null;
                    st._fixedAccumulator = 0;
                    const PF = r._stepFixedSim;
                    let schritte = 0;
                    let lage = null;
                    r._stepFixedSim = function (simTime, dt) {
                        PF.call(this, simTime, dt);
                        schritte++;
                        if (schritte === 200) lage = { x: gS.position.x, z: gS.position.z, bx: b.position.x, bz: b.position.z };
                    };
                    tasten(true);
                    try {
                        lauf(muster, 2000, () => lage === null);
                    } finally {
                        r._stepFixedSim = PF;
                        tasten(false);
                    }
                    weg(gS);
                    r.removeCreature(b);
                    return lage;
                };
                const l60 = await lockProbe(KADENZ[60]);
                const lMix = await lockProbe(KADENZ.gemischt);
                S.lockstep =
                    l60 && lMix
                        ? {
                              abw: +Math.hypot(l60.x - lMix.x, l60.z - lMix.z).toFixed(6),
                              baerAbw: +Math.hypot(l60.bx - lMix.bx, l60.bz - lMix.bz).toFixed(6),
                          }
                        : null;
            } finally {
                A._steuerGesetz = steuerRoh;
            }
        }
    } catch (e) {`
);
// das Urteil
ers(
    `    // L2 DIE SPALTKANTE (0710-2): der Wagen fährt über die Kante und fällt.`,
    `    // L7/L8 DER STOSS IM SIM-SCHRITT (0710-5)
    const lw = s.leibWand;
    if (!lw) out.push("leib-wand keine Probe");
    else
        for (const k of ["60", "30", "gemischt"]) {
            const m = lw[k];
            if (!m || !(m.n >= 8)) out.push(\`leib-wand \${k}: keine Probe\`);
            else if (m.durch > 0)
                out.push(\`leib-wand \${k}: der gestoßene Bär geht \${m.durch}/\${m.n} Mal durch die 0,35-m-Wand\`);
        }
    if (!s.lockstep) out.push("lockstep keine Probe");
    else if (!(s.lockstep.abw <= STATION.lockstepM))
        out.push(
            \`lockstep: nach 200 Sim-Schritten steht der Wagen bei gemischten Frames \${s.lockstep.abw.toFixed(3)} m anders als bei 60 fps (Bär \${s.lockstep.baerAbw.toFixed(3)} m)\`
        );
    // L2 DIE SPALTKANTE (0710-2): der Wagen fährt über die Kante und fällt.`
);
ers(
    `    spielerWagenDv: 0.02, // m/s: so viel Fahrt bekommt der geparkte GT mindestens vom laufenden Spieler (0710-4)`,
    `    spielerWagenDv: 0.02, // m/s: so viel Fahrt bekommt der geparkte GT mindestens vom laufenden Spieler (0710-4)
    lockstepM: 1e-6, // m: so weit darf die Lage des Wagens nach 200 Sim-Schritten je nach Bildrate abweichen (0710-5)`
);
// der Bericht
ers(
    `    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);
    if (errs.length) {`,
    `    const lwz = S.leibWand || {};
    const lwT = (k) => (lwz[k] ? \`\${k}: \${lwz[k].durch}/\${lwz[k].n} durch (am weitesten \${lwz[k].ueber} m hinter der Wand)\` : k + " –");
    check(
        "L7 der gestoßene Leib vor dünner Wand (0710-5): 13,7 m/s gegen 0,35 m — bei 60 fps, 30 fps und gemischten Frames geht er nie hindurch",
        !hat("kern") && !hat("leib-wand"),
        ["60", "30", "gemischt"].map(lwT).join(" · ")
    );
    check(
        "L8 Lockstep (0710-5): der Wagen steht nach 200 Sim-Schritten gegen einen Bären bei 60 fps und gemischten Frames an derselben Stelle",
        !hat("kern") && !hat("lockstep"),
        S.lockstep ? \`Abweichung Wagen \${S.lockstep.abw} m · Bär \${S.lockstep.baerAbw} m\` : "keine Probe"
    );
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);
    if (errs.length) {`
);
// der Selbst-Test
ers(
    `            spielerWagen: {
                a: { minAbstand: 0, wagenDv: 0.3, wagenWeg: 0.01, kontakt: 100 },
                b: { minAbstand: 0, spielerDv: 3.2, angestossen: true },
            },
        };`,
    `            spielerWagen: {
                a: { minAbstand: 0, wagenDv: 0.3, wagenWeg: 0.01, kontakt: 100 },
                b: { minAbstand: 0, spielerDv: 3.2, angestossen: true },
            },
            leibWand: { 60: { durch: 0, n: 10 }, 30: { durch: 0, n: 10 }, gemischt: { durch: 0, n: 10 } },
            lockstep: { abw: 0, baerAbw: 0 },
        };`
);
ers(
    `            [
                "Stoß aus dem Stand (vakuös)",`,
    `            [
                "der gestoßene Bär geht bei 30 fps durch die Wand (Gegenprüfung 0710-5: 7/10)",
                { leibWand: { 60: { durch: 0, n: 10 }, 30: { durch: 7, n: 10 }, gemischt: { durch: 4, n: 10 } } },
                "leib-wand 30",
            ],
            [
                "der Wagen steht je nach Bildrate anders (Gegenprüfung 0710-5: 2,03 m nach 200 Schritten)",
                { lockstep: { abw: 2.03, baerAbw: 1.4 } },
                "lockstep",
            ],
            [
                "Stoß aus dem Stand (vakuös)",`
);
fs.writeFileSync(p, s);
console.log("ok");
