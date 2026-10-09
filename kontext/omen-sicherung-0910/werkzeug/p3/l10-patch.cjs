// gate:fahr-leben L10: der gestoßene Schwimmer (0710-5-Nachschnitt) — ein Fuchs in tiefem Wasser bekommt einen Stoß; während
// er gleitet, muss er an der Schwimm-Linie bleiben (Spiegel − 0,3 m, Wellen ±0,2), nicht auf den Grund sinken.
"use strict";
const fs = require("fs");
const p = process.argv[2];
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER: " + a.slice(0, 100));
    s = s.replace(a, b);
}
ers(
    `        // L9 DER REITER IM WAGEN (0710-4 Klasse 4):`,
    `        // L10 DER GESTOSSENE SCHWIMMER (0710-5-Nachschnitt): eine Stelle mit mehr als 1 m Wasser nahe dem Messort, ein Fuchs
        // (Größe 1, sein Steuer-Schritt steht) schwimmt dort, der Spieler steht nahe (das Wasser-Gesetz der Tiere gilt bis
        // 50 m); dann ein Stoß von 4 m/s — gemessen je Frame, wie tief er unter seiner Schwimm-Linie liegt (Spiegel − 0,3 m).
        // Vorher setzte der Sim-Schritt die Höhe eines gleitenden Leibs auf den Boden, auch im Wasser.
        {
            let ort = null;
            for (let ring = 0; ring <= 60 && !ort; ring++)
                for (let k = 0; k < Math.max(1, ring * 6) && !ort; k++) {
                    const w = (k / Math.max(1, ring * 6)) * Math.PI * 2;
                    const x = mo[0] + Math.cos(w) * ring * 4;
                    const zz = mo[1] + Math.sin(w) * ring * 4;
                    const sp = r._waterLevelAt(x, zz);
                    const boden = hh(x, zz);
                    if (Number.isFinite(sp) && Number.isFinite(boden) && sp - boden > 1.2) {
                        // 4 m Fahrt in +x bleiben im tiefen Wasser
                        let tief = true;
                        for (let d = 0; d <= 4 && tief; d++) if (!(r._waterLevelAt(x + d, zz) - hh(x + d, zz) > 1)) tief = false;
                        if (tief) ort = { x, z: zz, spiegel: sp };
                    }
                }
            if (ort) {
                if (st.player && st.player.mountedArch != null) r.dismountArchitecture();
                st.playerMesh.position.set(ort.x - 4, Math.max(hh(ort.x - 4, ort.z), ort.spiegel) + 1.2, ort.z);
                st.playerVel.setValue(0, 0, 0);
                tasten(false);
                const A = Object.getPrototypeOf(r).constructor;
                const steuerRoh = A._steuerGesetz;
                const steht = Object.create(steuerRoh.call(A));
                steht.steuerSchritt = (sw2) => {
                    sw2.v = 0;
                };
                A._steuerGesetz = () => steht;
                const kappeS = st.maxCreatures;
                st.maxCreatures = st.creatures.length + 1;
                try {
                    const f = r.spawnCreatureAt(ort.x, ort.spiegel, ort.z, "calm", "fuchs", { precise: true, bodySize: 1 });
                    if (f) {
                        f.userData._steuer = { gier: 0, v: 0 };
                        f.userData._stossV = null;
                        for (let i = 0; i < 30; i++) frame(i); // er schwimmt an
                        const linie = () => r._waterLevelAt(f.position.x, f.position.z) - 0.3;
                        const m = { vorher: +(f.position.y - linie()).toFixed(3), tiefste: Infinity, gleitet: 0 };
                        f.userData._stossV = { x: 4, z: 0 };
                        for (let i = 0; i < 40; i++) {
                            frame(i);
                            if (f.userData._stossV) m.gleitet++;
                            m.tiefste = Math.min(m.tiefste, f.position.y - linie());
                        }
                        m.tiefste = +m.tiefste.toFixed(3);
                        m.tiefe = +(ort.spiegel - hh(ort.x, ort.z)).toFixed(2);
                        S.schwimmer = m;
                        r.removeCreature(f);
                    } else S.schwimmer = { fehler: "kein Fuchs" };
                } finally {
                    A._steuerGesetz = steuerRoh;
                    st.maxCreatures = kappeS;
                }
            } else S.schwimmer = { fehler: "kein tiefes Wasser im Umkreis 240 m" };
        }
        // L9 DER REITER IM WAGEN (0710-4 Klasse 4):`
);
ers(
    `    // L9 DER REITER IM WAGEN (0710-4 Klasse 4)
    const rw = s.reiter;`,
    `    // L10 DER GESTOSSENE SCHWIMMER
    const sch = s.schwimmer;
    if (!sch || sch.fehler) out.push(\`schwimmer keine Probe\${sch && sch.fehler ? " (" + sch.fehler + ")" : ""}\`);
    else if (!(sch.gleitet >= 3)) out.push("schwimmer: der Stoß trägt ihn nicht (vakuös)");
    else if (!(sch.tiefste >= -STATION.schwimmTiefM))
        out.push(\`schwimmer: der gestoßene Fuchs sinkt \${(-sch.tiefste).toFixed(2)} m unter seine Schwimm-Linie (auf den Grund)\`);
    // L9 DER REITER IM WAGEN (0710-4 Klasse 4)
    const rw = s.reiter;`
);
ers(
    `    hautAussen: 0.005,`,
    `    schwimmTiefM: 0.25, // m: so tief darf ein gleitender Schwimmer unter seiner Schwimm-Linie liegen (die Wellen ±0,2)
    hautAussen: 0.005,`
);
ers(
    `    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);`,
    `    const swm = S.schwimmer || {};
    check(
        "L10 der gestoßene Schwimmer (0710-5): ein Fuchs in tiefem Wasser gleitet nach einem Stoß an seiner Schwimm-Linie, nicht auf dem Grund",
        !hat("kern") && !hat("schwimmer"),
        swm.fehler
            ? swm.fehler
            : \`Wasser \${swm.tiefe} m tief · vor dem Stoß \${swm.vorher} m, beim Gleiten tiefstens \${swm.tiefste} m gegen die Linie (\${swm.gleitet} Frames gleitend)\`
    );
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);`
);
// Selbst-Test
ers(
    `            reiterStand: { abw: 0 },
        };`,
    `            reiterStand: { abw: 0 },
            schwimmer: { vorher: -0.1, tiefste: -0.15, gleitet: 20, tiefe: 2 },
        };`
);
ers(
    `            [
                "der Bär steht je nach Bildrate anders, der Wagen gleich (Gegenprüfung 0710-5: 1,39 m)",`,
    `            [
                "der gestoßene Schwimmer sinkt auf den Grund (Gegenprüfung 0710-5-Nachschnitt)",
                { schwimmer: { vorher: -0.1, tiefste: -1.6, gleitet: 20, tiefe: 2 } },
                "schwimmer:",
            ],
            [
                "der Bär steht je nach Bildrate anders, der Wagen gleich (Gegenprüfung 0710-5: 1,39 m)",`
);
fs.writeFileSync(p, s);
console.log("ok");
