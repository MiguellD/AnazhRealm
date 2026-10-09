// 0710-4 Klasse 3: gate:fahr-leben L6 — Spieler und Wagen tauschen Impuls (beide Richtungen).
"use strict";
const fs = require("fs");
const p = process.argv[2];
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER: " + a.slice(0, 100));
    s = s.replace(a, b);
}
// die Probe: nach L5
ers(
    `                r.removeCreature(c);
            },
        });
    } catch (e) {
        res.err = (e && e.stack) || String(e);
    }
    aufraeumen();
    return res;
}`,
    `                r.removeCreature(c);
            },
        });
        // L6 SPIELER UND WAGEN (0710-4): (a) der Spieler läuft (W) gegen die Flanke eines geparkten GT — der Wagen bekommt
        // seinen Impuls (sein Fahr-Zustand bewegt sich), der Spieler steckt nicht in ihm; (b) ein GT, angestoßen mit 5 m/s,
        // rutscht auf den stehenden Spieler zu — der Spieler bekommt seinen Impuls, der Wagen schiebt ihn nicht durch.
        if (gasse) {
            if (st.player && st.player.mountedArch != null) r.dismountArchitecture();
            const ux = Math.sin(gasse.fahrt);
            const uz = Math.cos(gasse.fahrt);
            const gt = async (x, zz, rotY) => {
                const e = r.spawnArchitecture(
                    "fahrzeug_gt",
                    { x, y: hh(x, zz) + 0.5, z: zz },
                    { silent: true, precise: true, rotationY: rotY }
                );
                const dlG = performance.now() + 45000;
                while (e && !e.instanced && !e.mesh && performance.now() < dlG) {
                    r._rebuildArchitectureMesh(e);
                    if (e.instanced || e.mesh) break;
                    await new Promise((r5) => setTimeout(r5, 200));
                }
                return e && e.blockerAABBs && e.blockerAABBs.length ? e : null;
            };
            // der Abstand der Spieler-Kapsel (r 0,35) zur Hülle des Wagens (< 0: sie steckt in ihm), längs der Gasse gemessen
            const kapselAbstand = (e) => {
                const pmP = st.playerMesh.position;
                let d = Infinity;
                for (const b of e.blockerAABBs) {
                    const ix = Math.max(b.minX - pmP.x, 0, pmP.x - b.maxX);
                    const iz = Math.max(b.minZ - pmP.z, 0, pmP.z - b.maxZ);
                    const aussen = Math.hypot(ix, iz);
                    const innen =
                        aussen > 0 ? 0 : Math.min(pmP.x - b.minX, b.maxX - pmP.x, pmP.z - b.minZ, b.maxZ - pmP.z);
                    d = Math.min(d, aussen > 0 ? aussen : -innen);
                }
                return d - 0.35;
            };
            const sw = { a: null, b: null };
            // (a) der GT quer zur Gasse 8 m voraus, der Spieler 3,5 m vor der Gasse, Blick und W längs der Gasse
            {
                const e = await gt(gasse.x + ux * 8, gasse.z + uz * 8, gasse.fahrt);
                if (e) {
                    const sx = gasse.x + ux * 3.5;
                    const sz = gasse.z + uz * 3.5;
                    st.playerMesh.position.set(sx, hh(sx, sz) + 1.2, sz);
                    st.playerVel.setValue(0, 0, 0);
                    st._fieldVy = 0;
                    st.yaw = gasse.fahrt;
                    const p0 = { x: e.position.x, z: e.position.z };
                    const m = { minAbstand: Infinity, wagenDv: 0, wagenWeg: 0, kontakt: -1 };
                    tasten(true);
                    for (let i = 0; i < 240; i++) {
                        frame(i);
                        m.minAbstand = Math.min(m.minAbstand, kapselAbstand(e));
                        const v = r._fahrWagenGeschw ? r._fahrWagenGeschw(e) : null;
                        const dv = v ? Math.hypot(v.x, v.z) : 0;
                        if (m.kontakt < 0 && dv > 1e-4) m.kontakt = i;
                        m.wagenDv = Math.max(m.wagenDv, dv);
                    }
                    tasten(false);
                    for (let i = 0; i < 60; i++) frame(240 + i);
                    m.wagenWeg = Math.hypot(e.position.x - p0.x, e.position.z - p0.z);
                    r.removeArchitecture(e);
                    sw.a = m;
                }
            }
            // (b) der GT längs der Gasse, sein Bug 0,8 m vor dem stehenden Spieler; ein Stoß von 5 m/s gegen den Spieler
            {
                const sx = gasse.x + ux * 1.5;
                const sz = gasse.z + uz * 1.5;
                const e = await gt(gasse.x + ux * 5.2, gasse.z + uz * 5.2, gasse.fahrt - Math.PI / 2);
                if (e) {
                    st.playerMesh.position.set(sx, hh(sx, sz) + 1.2, sz);
                    st.playerVel.setValue(0, 0, 0);
                    st._fieldVy = 0;
                    tasten(false);
                    for (let i = 0; i < 20; i++) frame(i); // der Spieler steht
                    const G = r._fahrStossSatz(e);
                    const m = { minAbstand: Infinity, spielerDv: 0, angestossen: !!G };
                    if (G) r._fahrWagenStoss(e, G, -ux * 5, -uz * 5);
                    for (let i = 0; i < 180; i++) {
                        frame(20 + i);
                        m.minAbstand = Math.min(m.minAbstand, kapselAbstand(e));
                        m.spielerDv = Math.max(m.spielerDv, Math.hypot(st.playerVel.x(), st.playerVel.z()));
                    }
                    r.removeArchitecture(e);
                    sw.b = m;
                }
            }
            S.spielerWagen = sw;
        }
    } catch (e) {
        res.err = (e && e.stack) || String(e);
    }
    aufraeumen();
    return res;
}`
);
// das Urteil (in stationVerdict, nach L5)
ers(
    `    // L2 DIE SPALTKANTE (0710-2): der Wagen fährt über die Kante und fällt.`,
    `    // L6 SPIELER UND WAGEN (0710-4): Impuls in beide Richtungen, keine Durchdringung.
    const sw = s.spielerWagen;
    if (!sw || !sw.a || !sw.b) out.push("spieler-wagen keine Probe");
    else {
        if (!(sw.a.wagenDv >= STATION.spielerWagenDv))
            out.push(
                \`spieler-wagen: der Spieler läuft gegen den GT, der Wagen bekommt \${(sw.a.wagenDv || 0).toFixed(3)} m/s — kein Impuls\`
            );
        if (!(sw.a.minAbstand >= -STATION.spielerTiefM))
            out.push(\`spieler-wagen: der Spieler steckt \${(-sw.a.minAbstand).toFixed(2)} m im Wagen\`);
        if (!(sw.b.spielerDv >= STATION.spielerDv))
            out.push(
                \`wagen-spieler: der rutschende GT stößt den Spieler nicht (\${(sw.b.spielerDv || 0).toFixed(3)} m/s)\`
            );
        if (!(sw.b.minAbstand >= -STATION.spielerTiefM))
            out.push(\`wagen-spieler: der GT schiebt sich \${(-sw.b.minAbstand).toFixed(2)} m in den Spieler\`);
    }
    // L2 DIE SPALTKANTE (0710-2): der Wagen fährt über die Kante und fällt.`
);
ers(
    `    baerFahrt: 0.5, // Anteil der Fahrt, den der Wagen nach dem Stoß mit dem leichteren Bären behält`,
    `    baerFahrt: 0.5, // Anteil der Fahrt, den der Wagen nach dem Stoß mit dem leichteren Bären behält
    spielerWagenDv: 0.02, // m/s: so viel Fahrt bekommt der geparkte GT mindestens vom laufenden Spieler (0710-4)
    spielerDv: 0.3, // m/s: so viel bekommt der Spieler mindestens vom rutschenden GT
    spielerTiefM: 0.05, // m: so tief darf die Kapsel des Spielers höchstens in der Hülle stecken`
);
// der Bericht
ers(
    `    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);
    if (errs.length) {`,
    `    const swz = S.spielerWagen || {};
    check(
        "L6 Spieler und Wagen (0710-4): der laufende Spieler stößt den geparkten GT (der Wagen bekommt Fahrt), ein rutschender GT stößt den stehenden Spieler — Impuls nach Masse, keine Durchdringung",
        !hat("kern") && !hat("spieler-wagen") && !hat("wagen-spieler"),
        swz.a && swz.b
            ? \`Spieler → GT: Wagen \${swz.a.wagenDv.toFixed(3)} m/s, \${swz.a.wagenWeg.toFixed(3)} m gerutscht, tiefste Berührung \${swz.a.minAbstand.toFixed(3)} m · GT → Spieler: Spieler \${swz.b.spielerDv.toFixed(2)} m/s, tiefste Berührung \${swz.b.minAbstand.toFixed(3)} m\`
            : "keine Probe"
    );
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);
    if (errs.length) {`
);
// der Selbst-Test: der gesunde Satz kennt L6, und der Befund (kein Impuls zwischen Spieler und Wagen) fällt beim Namen
ers(
    `            stossBaer: { kontakt: 40, vVor: 6.5, vNach: 5.0, vMinNach: 5.0, ereignisse: 1, ruck: 2, zielWeg: 3.2 },
        };`,
    `            stossBaer: { kontakt: 40, vVor: 6.5, vNach: 5.0, vMinNach: 5.0, ereignisse: 1, ruck: 2, zielWeg: 3.2 },
            spielerWagen: {
                a: { minAbstand: 0, wagenDv: 0.3, wagenWeg: 0.01, kontakt: 100 },
                b: { minAbstand: 0, spielerDv: 3.2, angestossen: true },
            },
        };`
);
ers(
    `            [
                "Stoß aus dem Stand (vakuös)",`,
    `            [
                "der Spieler läuft gegen den GT ohne Folge, der GT schiebt sich in den Spieler (0710-4)",
                {
                    spielerWagen: {
                        a: { minAbstand: 0, wagenDv: 0, wagenWeg: 0, kontakt: -1 },
                        b: { minAbstand: -0.6, spielerDv: 0, angestossen: true },
                    },
                },
                "spieler-wagen",
            ],
            [
                "Stoß aus dem Stand (vakuös)",`
);
fs.writeFileSync(p, s);
console.log("ok");
