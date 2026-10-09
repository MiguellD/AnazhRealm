// 0710-4 Klasse 4: gate:fahr-leben L9 — der Reiter im Wagen, gemessen an der Haut.
"use strict";
const fs = require("fs");
const p = process.argv[2];
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER: " + a.slice(0, 100));
    s = s.replace(a, b);
}
// die Probe
ers(
    `            } finally {
                A._steuerGesetz = steuerRoh;
            }
        }
    } catch (e) {
        res.err = (e && e.stack) || String(e);
    }`,
    `            } finally {
                A._steuerGesetz = steuerRoh;
            }
        }
        // L9 DER REITER IM WAGEN (0710-4 Klasse 4): je Wagen-Art und am Karren (Teile-Werk) aufsitzen, der Spieler schaut
        // quer zur Fahrt (die Maus ist nicht der Wagen), einschwingen — dann die HAUT des Reiters: jede Ecke jedes sichtbaren
        // Meshes der Nah-Gestalt über ihre Knochen. Gemessen über der Rad-Ebene (Ursprung − 0,5): die Oberkante gegen die
        // Dachlinie des Kerns (huelle.yRoof), die Unterseite der Oberschenkel gegen die Sitzfläche (der Sitz-Anker), das
        // Hüftgelenk (Mitte beider) gegen den Anker längs/quer im Rahmen des Wagens, der Blick des Leibs gegen die Fahrt;
        // nach dem Absteigen steht die Hüfte, wo sie vorher stand.
        if (start) {
            const T = window.THREE;
            const V = new T.Vector3();
            const H1 = new T.Vector3();
            const H2 = new T.Vector3();
            const pm = st.playerMesh;
            const rigR = () => pm.userData && pm.userData.rig;
            const huefteRel = () => {
                const rg = rigR();
                pm.updateMatrixWorld(true);
                rg.legL.hip.getWorldPosition(H1);
                rg.legR.hip.getWorldPosition(H2);
                return { x: (H1.x + H2.x) / 2, y: (H1.y + H2.y) / 2, z: (H1.z + H2.z) / 2 };
            };
            if (st.player && st.player.mountedArch != null) r.dismountArchitecture();
            for (let i = 0; i < 6; i++) frame(i);
            const steh0 = huefteRel().y - pm.position.y;
            const reiter = [];
            const typen = Object.keys(st.blueprints)
                .filter((n) => /^fahrzeug_/.test(n))
                .sort();
            for (const typ of typen) {
                const e = await setzen(typ, start.x, start.z, Math.PI / 2);
                if (!e) {
                    reiter.push({ typ, fehler: "kein Aufsitzen" });
                    continue;
                }
                st.yaw = gierUnwrap(e) + Math.PI / 2; // der Spieler schaut quer zur Fahrt
                for (let i = 0; i < 6; i++) frame(i);
                const rg = rigR();
                const nah = (pm.userData._menschFern && pm.userData._menschFern.nah) || pm;
                const schenkel = new Set([rg.legL.hip, rg.legR.hip]);
                let oben = -Infinity;
                let unten = Infinity;
                pm.updateMatrixWorld(true);
                nah.traverse((o) => {
                    if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
                    for (let n = o; n && n !== pm; n = n.parent) if (!n.visible) return; // die Fern-Gestalt ist verborgen
                    const pos = o.geometry.attributes.position;
                    const sw = o.isSkinnedMesh ? o.geometry.attributes.skinWeight : null;
                    const si = o.isSkinnedMesh ? o.geometry.attributes.skinIndex : null;
                    for (let i = 0; i < pos.count; i++) {
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
                    }
                });
                const sc = Number.isFinite(e.scale) ? e.scale : 1;
                const fzg = r._fahrzeugGesetzFor(e);
                const d = fzg && fzg.drive;
                let sitz = d && d.sitz ? d.sitz : null;
                if (!sitz) {
                    const bp = st.blueprints[e.type];
                    sitz = bp ? r._attachPointFor(bp, "sitz").point : null;
                }
                const basis = e.position.y - 0.5;
                const th = Number.isFinite(e.rotationY) ? e.rotationY : 0;
                const h = huefteRel();
                const dx = h.x - e.position.x;
                const dz = h.z - e.position.z;
                const lx = dx * Math.cos(th) - dz * Math.sin(th); // der Rahmen des Wagens (R_y(−θ))
                const lz = dx * Math.sin(th) + dz * Math.cos(th);
                rg.hips.getWorldDirection(V); // das Modell schaut längs +z
                const fx = e._fahrAchseX ? Math.cos(th) : Math.sin(th);
                const fz = e._fahrAchseX ? -Math.sin(th) : Math.cos(th);
                const cosB = (V.x * fx + V.z * fz) / Math.max(1e-9, Math.hypot(V.x, V.z));
                reiter.push({
                    typ,
                    oben: +(oben - basis).toFixed(3),
                    dach: d && d.huelle && Number.isFinite(d.huelle.yRoof) ? +(d.huelle.yRoof * sc).toFixed(3) : null,
                    schenkel: +(unten - basis).toFixed(3),
                    sitz: sitz ? +(sitz.y * sc).toFixed(3) : null,
                    ankerL: sitz ? +(lx - sitz.x * sc).toFixed(3) : null,
                    ankerQ: sitz ? +(lz - sitz.z * sc).toFixed(3) : null,
                    blickGrad: +((Math.acos(Math.max(-1, Math.min(1, cosB))) * 180) / Math.PI).toFixed(1),
                    lehneGrad: rg.spine ? +((-rg.spine.rotation.x * 180) / Math.PI).toFixed(1) : null,
                });
                weg(e);
            }
            for (let i = 0; i < 6; i++) frame(i);
            S.reiter = reiter;
            S.reiterStand = { abw: +Math.abs(huefteRel().y - pm.position.y - steh0).toFixed(4) };
        }
    } catch (e) {
        res.err = (e && e.stack) || String(e);
    }`
);
// das Urteil
ers(
    `    // L7/L8 DER STOSS IM SIM-SCHRITT (0710-5)`,
    `    // L9 DER REITER IM WAGEN (0710-4 Klasse 4)
    const rw = s.reiter;
    if (!rw || !rw.length) out.push("reiter keine Probe");
    else
        for (const q of rw) {
            if (q.fehler || q.sitz === null) {
                out.push(\`reiter \${q.typ}: \${q.fehler || "kein Sitz-Anker"}\`);
                continue;
            }
            if (q.dach !== null && !(q.oben <= q.dach))
                out.push(\`reiter \${q.typ}: die Oberkante steht \${(q.oben - q.dach).toFixed(3)} m über der Dachlinie\`);
            if (!(Math.abs(q.schenkel - q.sitz) <= STATION.sitzM))
                out.push(
                    \`reiter \${q.typ}: die Oberschenkel liegen \${Math.abs(q.schenkel - q.sitz).toFixed(3)} m \${q.schenkel > q.sitz ? "über" : "unter"} der Sitzfläche\`
                );
            if (!(Math.hypot(q.ankerL, q.ankerQ) <= STATION.ankerM))
                out.push(
                    \`reiter \${q.typ}: das Hüftgelenk steht \${q.ankerL.toFixed(2)} m längs / \${q.ankerQ.toFixed(2)} m quer neben dem Sitz-Anker\`
                );
            if (!(q.blickGrad <= STATION.blickGrad))
                out.push(\`reiter \${q.typ}: der Leib schaut \${q.blickGrad.toFixed(0)}° neben die Fahrt (er folgt der Maus)\`);
        }
    if (s.reiterStand && !(s.reiterStand.abw <= STATION.sitzM))
        out.push(\`reiter: nach dem Absteigen steht die Hüfte \${s.reiterStand.abw.toFixed(3)} m anders als vorher\`);
    // L7/L8 DER STOSS IM SIM-SCHRITT (0710-5)`
);
ers(
    `    lockstepM: 1e-6, // m: so weit dürfen Wagen und Bär nach 200 Sim-Schritten je nach Bildrate abweichen (0710-5)`,
    `    lockstepM: 1e-6, // m: so weit dürfen Wagen und Bär nach 200 Sim-Schritten je nach Bildrate abweichen (0710-5)
    sitzM: 0.03, // m: so weit dürfen die Oberschenkel über oder in der Sitzfläche liegen (0710-4 Klasse 4)
    ankerM: 0.05, // m: so weit darf das Hüftgelenk neben dem Sitz-Anker stehen
    blickGrad: 5, // °: so weit darf der sitzende Leib neben die Fahrt schauen`
);
// der Bericht
ers(
    `    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);`,
    `    const reiterZeile = (q) =>
        q.fehler || q.sitz === null
            ? \`\${q.typ} \${q.fehler || "ohne Sitz"}\`
            : \`\${q.typ.replace("fahrzeug_", "")}: Kopf \${q.dach === null ? "offen" : (q.oben - q.dach).toFixed(2)} · Schenkel \${(q.schenkel - q.sitz).toFixed(2)} · Anker \${Math.hypot(q.ankerL, q.ankerQ).toFixed(2)} · Blick \${q.blickGrad.toFixed(0)}° · Lehne \${q.lehneGrad}°\`;
    check(
        "L9 der Reiter im Wagen (0710-4 Klasse 4): je Wagen-Art die Oberkante ≤ Dachlinie, die Oberschenkel auf dem Polster, das Hüftgelenk über dem Sitz-Anker, der Leib schaut längs der Fahrt (die Maus quer); abgestiegen steht er wie vorher",
        !hat("kern") && !hat("reiter"),
        (S.reiter || []).map(reiterZeile).join(" · ") +
            (S.reiterStand ? \` · Stand nach dem Absteigen \${S.reiterStand.abw} m\` : "")
    );
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);`
);
// der Selbst-Test
ers(
    `            lockstep: { abw: 0, baerAbw: 0 },
        };`,
    `            lockstep: { abw: 0, baerAbw: 0 },
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
                    lehneGrad: 25,
                },
                { typ: "fahrzeug_wagen", oben: 2, dach: null, schenkel: 1.02, sitz: 1.025, ankerL: 0, ankerQ: 0, blickGrad: 1 },
            ],
            reiterStand: { abw: 0 },
        };`
);
ers(
    `            [
                "der Bär steht je nach Bildrate anders, der Wagen gleich (Gegenprüfung 0710-5: 1,39 m)",`,
    `            [
                "der Reiter ragt aus dem GT, schwebt über dem Sitz und schaut mit der Maus (Gegenprüfung 0710-4 Klasse 4)",
                {
                    reiter: [
                        {
                            typ: "fahrzeug_gt",
                            oben: 2.175,
                            dach: 1.2,
                            schenkel: 0.72,
                            sitz: 0.475,
                            ankerL: 0.3,
                            ankerQ: 0.4,
                            blickGrad: 90,
                            lehneGrad: 0,
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
