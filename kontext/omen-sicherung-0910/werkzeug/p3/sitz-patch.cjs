// 0710-4 Klasse 4: der Reiter sitzt IM Wagen — Wirt (Sitz-Pose an der Gestalt) + vehicle-core (additive FAHR-Zeilen,
// seatRow liest die Lehne aus ihnen, byte-gleich).
"use strict";
const fs = require("fs");
const wt = process.argv[2];
function patch(datei, paare) {
    const p = wt + "/" + datei;
    let s = fs.readFileSync(p, "utf8");
    for (const [a, b] of paare) {
        if (s.split(a).length !== 2) throw new Error(datei + " TREFFER: " + a.slice(0, 100));
        s = s.replace(a, b);
    }
    fs.writeFileSync(p, s);
}
patch("vehicle-core.js", [
    [
        `        masseDichte: 150,
`,
        `        masseDichte: 150,
        // ── 0710-4 Klasse 4 (rein additive DATEN-Zeilen — Praezedenz: masseDichte) — DER REITER IM WAGEN: die Lehne des
        //    Fahrersitzes (rad nach hinten; der Bau der Sitzreihe liest sie, der Wirt neigt den Rumpf des Reiters mindestens
        //    so weit), der Kopf-Freiraum unter der Dachlinie (m: Dachhaut + Luft ueber dem Scheitel) und die steilste
        //    Lehne, die ein Fahrersitz noch faehrt (rad) — reicht sie nicht, ragt der Kopf: die Gestalt ist zu niedrig. ──
        sitzLehneRad: 0.13,
        kopfFreiraumM: 0.05,
        sitzLehneMaxRad: 0.7,
`,
    ],
    [
        `                g.add(B(cx - 0.28, ySill + 0.37, z, 0.055, 0.26, 0.23, M.seat, 0.13)); // Lehne (lehnt nach hinten)`,
        `                g.add(B(cx - 0.28, ySill + 0.37, z, 0.055, 0.26, 0.23, M.seat, FAHR.sitzLehneRad)); // Lehne (lehnt nach hinten)`,
    ],
]);
patch("anazhRealm.js", [
    // (1) der Fahr-Gesetz-Leser trägt die Sitz-Zeilen
    [
        `        Number.isFinite(vc.A_LAT_MAX) &&
        F.masseDichte > 0
    ) {`,
        `        Number.isFinite(vc.A_LAT_MAX) &&
        F.masseDichte > 0 &&
        F.sitzLehneRad >= 0 &&
        F.kopfFreiraumM >= 0 &&
        F.sitzLehneMaxRad >= F.sitzLehneRad
    ) {`,
    ],
    [
        `            masseDichte: F.masseDichte,
        };
        return AnazhRealm._fahrGesetzMemo;
    }
    return AnazhRealm._kernPflichtBruch("vehicle:FAHR.hostEmergent / FAHR.masseDichte");`,
        `            masseDichte: F.masseDichte,
            // der Reiter im Wagen (0710-4 Klasse 4): die Lehne des Sitzes, der Kopf-Freiraum unter der Dachlinie, die
            // steilste Lehne
            sitzLehneRad: F.sitzLehneRad,
            kopfFreiraumM: F.kopfFreiraumM,
            sitzLehneMaxRad: F.sitzLehneMaxRad,
        };
        return AnazhRealm._fahrGesetzMemo;
    }
    return AnazhRealm._kernPflichtBruch("vehicle:FAHR.hostEmergent / FAHR.masseDichte / FAHR.sitzLehneRad");`,
    ],
    // (2) die Sitz-Pose
    [
        `    // Sitz-Pose des Avatars: Beine ≈75° nach vorn, Arme vorgehalten (Zügel), Torso atmet. Absolute Werte
    // pro Frame (kein Drift); beim Absteigen räumt _animateHuman (setzt alle Rotationen absolut).
    _applySeatPose(group, _t) {
        // GUSS 2b — der Rig-Avatar SITZT über die Bein-/Arm-Bones (Beine angewinkelt nach
        // vorn, Arme vorgehalten); absolute Werte (kein Drift — _animateHumanoidRig räumt sie).
        const rig = group.userData && group.userData.rig;
        if (rig) {
            for (const b of [rig.hips, rig.spine, rig.chest, rig.neck, rig.head]) if (b) b.rotation.set(0, 0, 0);
            for (const side of [rig.armL, rig.armR, rig.legL, rig.legR])
                for (const k in side) if (side[k] && side[k].rotation) side[k].rotation.set(0, 0, 0);
            rig.legL.hip.rotation.x = -1.3; // Oberschenkel waagerecht nach vorn (Sitz)
            rig.legR.hip.rotation.x = -1.3;`,
        `    // Sitz-Pose des Avatars: die Oberschenkel liegen waagerecht auf dem Sitz, die Unterschenkel hängen, die Arme vorgehalten
    // (Zügel); Lage, Blick und Rumpf-Neigung setzt der Sitz des Gefährts (\`_sitzLage\`). Absolute Werte pro Frame (kein
    // Drift); beim Absteigen räumt _animateHuman die Rotationen, \`_sitzLageLoesen\` den Wurzel-Knochen.
    _applySeatPose(group, _t) {
        // GUSS 2b — der Rig-Avatar SITZT über die Bein-/Arm-Bones (Beine angewinkelt nach
        // vorn, Arme vorgehalten); absolute Werte (kein Drift — _animateHumanoidRig räumt sie).
        const rig = group.userData && group.userData.rig;
        if (rig) {
            for (const b of [rig.hips, rig.spine, rig.chest, rig.neck, rig.head]) if (b) b.rotation.set(0, 0, 0);
            for (const side of [rig.armL, rig.armR, rig.legL, rig.legR])
                for (const k in side) if (side[k] && side[k].rotation) side[k].rotation.set(0, 0, 0);
            // die Oberschenkel liegen auf der Sitzfläche (waagerecht nach vorn; vorher −1,3: 15° hinab, das Knie im Polster)
            rig.legL.hip.rotation.x = -Math.PI / 2;
            rig.legR.hip.rotation.x = -Math.PI / 2;`,
    ],
    [
        `            rig.armL.elbow.rotation.x = -0.5;
            rig.armR.elbow.rotation.x = -0.5;
        }
        // ABSCHIEDS-WELLE (Konvergenz C) — der Nicht-Rig-Sitz-Zweig (Box-Avatar-parts)
        // ist GESCHNITTEN: die Sitz-Pose gilt nur dem menschlichen Rig-Avatar (der
        // einzige Aufrufer gated auf soulName === "human", und der baut immer das Rig).
    }`,
        `            rig.armL.elbow.rotation.x = -0.5;
            rig.armR.elbow.rotation.x = -0.5;
            this._sitzLage(group, rig);
        }
        // ABSCHIEDS-WELLE (Konvergenz C) — der Nicht-Rig-Sitz-Zweig (Box-Avatar-parts)
        // ist GESCHNITTEN: die Sitz-Pose gilt nur dem menschlichen Rig-Avatar (der
        // einzige Aufrufer gated auf soulName === "human", und der baut immer das Rig).
    }

    // DER REITER IM GEFÄHRT (0710-4 Klasse 4): die Sitz-Pose setzt den Leib dorthin, wo die Gestalt des Gefährts ihn trägt —
    // die Oberschenkel auf die Sitzfläche, das Hüftgelenk über den Sitz-Anker, der Blick längs der Fahrt (nie mit der Maus);
    // unter einem Dach neigt sich der Rumpf ab der Lehne des Kerns, bis der Scheitel den Kopf-Freiraum unter der Dachlinie
    // hält (höchstens FAHR.sitzLehneMaxRad), der Kopf bleibt aufrecht. Die Maße des Leibs misst die HAUT einmal je Rig
    // (\`_sitzLeib\`), die Neigung je Gefährt die Knochen (\`_sitzNeigung\`); je Frame nur Gier und Lage des Wurzel-Knochens.
    // Vorher drehte die Pose nur die Beine: das Hüftgelenk stand 0,85 m über der Sitzfläche, der Scheitel 0,99 m über dem
    // GT-Dach, der Leib saß in der Wagenmitte statt auf dem Fahrersitz und drehte mit der Maus (gate:fahr-leben L9).
    _sitzLage(group, rig) {
        const entry = this._mountedEntry;
        const hips = rig.hips;
        if (!entry || !hips || !hips.parent || !rig.legL || !rig.legR || !rig.legL.hip || !rig.legR.hip) return;
        if (!rig._sitzBasis) {
            rig._sitzBasis = hips.position.clone();
            if (Number.isFinite(rig._baseHipY)) rig._sitzBasis.y = rig._baseHipY;
        }
        const key = entry.id + "|" + entry.type + "|" + entry.scale;
        let L = rig._sitzLage;
        if (!L || L.key !== key) {
            const ort = this._sitzOrt(entry);
            L = rig._sitzLage = { key, ort, phi: 0 };
            if (ort) {
                hips.position.copy(rig._sitzBasis);
                hips.rotation.y = 0;
                L.leib = rig._sitzLeibMass || (rig._sitzLeibMass = this._sitzLeib(group, rig));
                L.phi = this._sitzNeigung(group, rig, ort, L.leib);
            }
        }
        const ort = L.ort;
        if (!ort || !L.leib) return;
        // der Rumpf neigt sich, der Kopf bleibt aufrecht
        if (rig.spine) rig.spine.rotation.x = -L.phi;
        if (L.leib.kopfMit) rig.head.rotation.x = L.phi;
        // der Blick längs der Fahrt: die Gier des Gefährts im Rahmen des Spielers (das Modell schaut längs +z)
        const th = Number.isFinite(entry.rotationY) ? entry.rotationY : 0;
        const fx = ort.achseX ? Math.cos(th) : Math.sin(th);
        const fz = ort.achseX ? -Math.sin(th) : Math.cos(th);
        hips.rotation.y = Math.atan2(fx, fz) - group.rotation.y;
        hips.position.copy(rig._sitzBasis);
        group.updateMatrixWorld(true);
        // das Hüftgelenk (Mitte beider) auf den Anker: waagerecht der Anker im Rahmen des Gefährts, senkrecht die
        // Sitzfläche + das Gesäß, gemessen am Ursprung des Reiters (er trägt Sitz-Höhe und Hub der Feder)
        const v = this._sitzV || (this._sitzV = { a: new THREE.Vector3(), b: new THREE.Vector3(), z: new THREE.Vector3() });
        rig.legL.hip.getWorldPosition(v.a);
        rig.legR.hip.getWorldPosition(v.b);
        v.a.add(v.b).multiplyScalar(0.5); // das Hüftgelenk jetzt (Welt)
        const sitzH = Number.isFinite(entry._sitzHeight) ? entry._sitzHeight : AnazhRealm.MOUNT_FOLLOW_HEIGHT;
        v.z.set(
            entry.position.x + Math.cos(th) * ort.x + Math.sin(th) * ort.z,
            group.position.y + ort.y - sitzH + L.leib.gesaess,
            entry.position.z - Math.sin(th) * ort.x + Math.cos(th) * ort.z
        ); // das Ziel (Welt)
        hips.parent.worldToLocal(v.a);
        hips.parent.worldToLocal(v.z);
        hips.position.add(v.z.sub(v.a));
    }

    // Der Abstieg gibt den Wurzel-Knochen frei (Lage und Gier zurück auf die Basis; die Rotationen setzt der Gang).
    _sitzLageLoesen(rig) {
        if (rig._sitzBasis) rig.hips.position.copy(rig._sitzBasis);
        rig.hips.rotation.y = 0;
        rig._sitzLage = null;
    }

    // DER SITZ EINES GEFÄHRTS (0710-4 Klasse 4) im Rahmen seines Ursprungs (m, Gestalt × Skala; y über der Rad-Ebene
    // position.y − 0,5 — dieselbe Basis wie \`_sitzHeight\`): ein Gesetz-Wagen trägt den Anker des Kerns (exportDrive.sitz,
    // der vordere seatRow auf der Fahrerseite), seine Dachlinie (huelle.yRoof) und die Sitz-Zeilen des Fahr-Satzes; ein
    // Teile-Werk den sitz-Punkt seines Bauplans (\`_attachPointFor\`) — offen, aufrecht. achseX: ein Studio-Wagen liegt
    // längs x (Bug +x), ein Teile-Werk fährt in +z.
    _sitzOrt(entry) {
        if (!entry) return null;
        const sc = Number.isFinite(entry.scale) ? entry.scale : 1;
        const achseX = !!entry._fahrAchseX;
        const fzg = this._fahrzeugGesetzFor(entry);
        const d = fzg && fzg.drive;
        if (d && d.sitz && Number.isFinite(d.sitz.y)) {
            const F = AnazhRealm._fahrGesetz();
            return {
                x: d.sitz.x * sc,
                y: d.sitz.y * sc,
                z: d.sitz.z * sc,
                dach: d.huelle && Number.isFinite(d.huelle.yRoof) ? d.huelle.yRoof * sc : null,
                lehne: F.sitzLehneRad,
                lehneMax: F.sitzLehneMaxRad,
                kopfFrei: F.kopfFreiraumM,
                achseX,
            };
        }
        const bp = this.state.blueprints && this.state.blueprints[entry.type];
        const sp = bp ? this._attachPointFor(bp, "sitz").point : null;
        if (!sp || !Number.isFinite(sp.y)) return null;
        const x = Number.isFinite(sp.x) ? sp.x : 0;
        const z = Number.isFinite(sp.z) ? sp.z : 0;
        return { x: x * sc, y: sp.y * sc, z: z * sc, dach: null, lehne: 0, lehneMax: 0, kopfFrei: 0, achseX };
    }

    // DER SITZENDE LEIB, an der HAUT gemessen (0710-4 Klasse 4; einmal je Rig — die Pose ist für jedes Gefährt dieselbe):
    // aufrecht, die Oberschenkel waagerecht — gesaess = wie hoch das Hüftgelenk über der Unterseite der Oberschenkel liegt
    // (jede Ecke, deren stärkster Knochen ein Oberschenkel ist), kopfOben = wie hoch der Scheitel über dem Kopf-Gelenk liegt
    // (die Ecken des Kopf-Knochens und die Meshes unter ihm: Haar, Augen). kopfMit: der Kopf hängt am Rumpf (dann gleicht
    // er dessen Neigung aus und bleibt aufrecht). Rahmen: der Spieler (seine Gier ändert keine Höhe).
    _sitzLeib(group, rig) {
        const nah = (group.userData._menschFern && group.userData._menschFern.nah) || group;
        if (rig.spine) rig.spine.rotation.x = 0;
        if (rig.head) rig.head.rotation.x = 0;
        group.updateMatrixWorld(true);
        const inv = new THREE.Matrix4().copy(group.matrixWorld).invert();
        const v = new THREE.Vector3();
        const schenkel = new Set([rig.legL.hip, rig.legR.hip]);
        const unterKopf = (o) => {
            for (let n = o; n && n !== group; n = n.parent) if (n === rig.head) return true;
            return false;
        };
        let unten = Infinity;
        let oben = -Infinity;
        nah.traverse((o) => {
            if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
            for (let n = o; n && n !== group; n = n.parent) if (!n.visible) return;
            const pos = o.geometry.attributes.position;
            const sw = o.isSkinnedMesh ? o.geometry.attributes.skinWeight : null;
            const si = sw ? o.geometry.attributes.skinIndex : null;
            const starr = !sw && unterKopf(o);
            for (let i = 0; i < pos.count; i++) {
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
                }
                const bein = kn !== null && schenkel.has(kn);
                const kopf = starr || (kn !== null && kn === rig.head);
                if (!bein && !kopf) continue;
                o.getVertexPosition(i, v).applyMatrix4(o.matrixWorld).applyMatrix4(inv);
                if (bein && v.y < unten) unten = v.y;
                if (kopf && v.y > oben) oben = v.y;
            }
        });
        const hL = rig.legL.hip.getWorldPosition(new THREE.Vector3()).applyMatrix4(inv);
        const hR = rig.legR.hip.getWorldPosition(new THREE.Vector3()).applyMatrix4(inv);
        const kp = rig.head ? rig.head.getWorldPosition(new THREE.Vector3()).applyMatrix4(inv) : null;
        let kopfMit = false;
        for (let n = rig.head; n && rig.spine && rig.head !== rig.spine; n = n.parent) if (n === rig.spine) kopfMit = true;
        if (!(unten < Infinity) || !(oben > -Infinity) || !kp) return null;
        return { gesaess: (hL.y + hR.y) / 2 - unten, kopfOben: oben - kp.y, kopfMit };
    }

    // DIE NEIGUNG DES RUMPFS in einem Gefährt (rad): die Lehne des Kerns, und reicht der Raum unter dem Dach nicht, so weit
    // mehr, bis der Scheitel (das Kopf-Gelenk der geneigten Knochen + kopfOben) den Kopf-Freiraum unter der Dachlinie hält
    // — Halbierung zwischen Lehne und sitzLehneMaxRad; mehr gibt der Sitz nicht her (dann ragt der Kopf, die Linse nennt ihn).
    _sitzNeigung(group, rig, ort, leib) {
        if (!leib || ort.dach === null || !rig.spine || !rig.head || !leib.kopfMit) return ort.lehne;
        const budget = ort.dach - ort.kopfFrei - ort.y - leib.gesaess; // der Scheitel über dem Hüftgelenk, höchstens
        const a = new THREE.Vector3();
        const b = new THREE.Vector3();
        const k = new THREE.Vector3();
        const scheitel = (phi) => {
            rig.spine.rotation.x = -phi;
            rig.head.rotation.x = phi;
            group.updateMatrixWorld(true);
            rig.legL.hip.getWorldPosition(a);
            rig.legR.hip.getWorldPosition(b);
            rig.head.getWorldPosition(k);
            return k.y + leib.kopfOben - (a.y + b.y) / 2;
        };
        let phi = ort.lehne;
        if (scheitel(phi) > budget) {
            let lo = ort.lehne;
            let hi = ort.lehneMax;
            if (scheitel(hi) > budget) phi = hi;
            else {
                for (let i = 0; i < 20; i++) {
                    const m = (lo + hi) / 2;
                    if (scheitel(m) > budget) lo = m;
                    else hi = m;
                }
                phi = hi;
            }
        }
        rig.spine.rotation.x = 0;
        rig.head.rotation.x = 0;
        return phi;
    }`,
    ],
    // (3) der Abstieg gibt den Wurzel-Knochen frei
    [
        `                this._animateCompoundMotion(mesh, customRoles, currentTime, p.walkPhase, false, p.emotions);
            }
            return;
        }
        // isMoving aus horizontaler Geschwindigkeit. Schwelle 0.4 m/s`,
        `                this._animateCompoundMotion(mesh, customRoles, currentTime, p.walkPhase, false, p.emotions);
            }
            return;
        }
        if (mesh.userData.rig && mesh.userData.rig._sitzLage) this._sitzLageLoesen(mesh.userData.rig);
        // isMoving aus horizontaler Geschwindigkeit. Schwelle 0.4 m/s`,
    ],
]);
console.log("ok");
