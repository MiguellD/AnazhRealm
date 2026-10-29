class AnazhRealm_koerper_fahrt {
    // ===== ATLAS · Koerper/fahrt — Mensch-Avatar · Sitz · Fahrzeug · Ritt =====
    // (ABSCHIEDS-WELLE: der Marker sass am geschnittenen `_buildLimb` — der Zonen-Anker
    // wandert an den lebenden Zonen-Anfang; Phönix/Drache sind Compound-Seelen, die
    // Hand-Skelette fielen per cut-method.)
    _buildHumanGroup(dialsOv, opts) {
        const group = new THREE.Group();
        // V8.33 — YXZ-Rotation: rotation.y (Yaw) ist außen, rotation.x wirkt
        // im gedrehten Frame = lokaler Vorwärts-Lehnen für die Schwimm-Pose.
        group.rotation.order = "YXZ";
        // Der getragene Avatar IST der Studio-Baum (bauMensch + Gelenk-Gruppen-Rig). parts.{leftArm,
        // rightArm,…} → WRIST-/HÜFT-Bones (equipHeld hängt das Gerät an die Hand; Kinder folgen dem Bone).
        const PLAYER_KH = AnazhRealm.PLAYER_KH, // 8 KH → ~1.7 Welt-Höhe (matcht den alten Avatar)
            FOOT_Y = -AnazhRealm.PLAYER_FOOT_OFFSET; // die Sohle der Kapsel unter dem Mesh-Ursprung (die Sohle des Leibs steht dort)
        // Gestalt-Dials aus dem Da-Vinci-Studio (LIVE über _koerperStudioDials); Dial→Genom über die
        // DATEN-Tabelle KOERPER_DIAL_MAP (khMul skaliert die EINE Kopfhöhen-Einheit). Hautton aus der
        // Studio-Palette, nie ein Literal. Kaltes Buch → Konstanten-Bau; Stempel `_koerperDials` null →
        // der Rezept-Ankunfts-Chokepoint gießt EINMAL nach. dialsOv = Werkstatt-Regler-Kanal (Live-Vorschau).
        const dialsBase = this._koerperStudioDials();
        const dials = dialsOv && typeof dialsOv === "object" ? Object.assign({}, dialsBase || {}, dialsOv) : dialsBase;
        const g = { kh: PLAYER_KH, oy: FOOT_Y };
        if (dials) {
            for (const row of AnazhRealm.KOERPER_DIAL_MAP) {
                const v = Number(dials[row.dial]);
                if (!Number.isFinite(v)) continue;
                const val = row.base + row.mul * v;
                if (row.axis === "khMul") g.kh = PLAYER_KH * val;
                else g[row.axis] = val;
            }
        }
        // Die echten Dials reisen ROH zum bauMensch-Pfad (labMorph); die Genom-Achsen oben dienen Stats.
        // Größe reist im charScale von morphAuf — g.kh bleibt Welt-Einheit (kein Doppel-Wachsen).
        g.bmDials = dials || null;
        // opts.eigen: der Aufrufer besitzt den Guss (das Regler-Einzelstück der Werkstatt, `_ofenVorlage`)
        g.eigen = !!(opts && opts.eigen);
        // STUDIO-ÜBERGABE (Auftrag D) — die FARB-Gestalt: der EINE Farb-Münzer
        // (_menschGussFarben) löst Anker-Palette + Übergabe-Wahlen auf —
        // Prefetch und Guss münzen DIESELBEN Zahlen (warmes Memo).
        const fG = this._menschGussFarben(dials);
        if (fG.skin !== null) g.skinColor = fG.skin;
        if (fG.hair !== null) g.hairColor = fG.hair;
        let built = null;
        try {
            built = this._buildHumanoidRig(g);
        } catch (_e) {
            // ein Wurf im Mensch-Bau (Ofen, Rig, Haut) bricht LAUT beim Namen (K22); der Not-Körper unten steht sichtbar
            this._stoffBruch("der Mensch-Bau (Rig) — Not-Körper statt Gestalt", _e);
            built = null;
        }
        if (built && built.rig) {
            group.userData._koerperDials = dials ? { kh: g.kh, sex: g.sex, build: g.build, muscle: g.muscle } : null;
            // KONVERGENZ — der Baum steht SOFORT (animierbar, equip-fähig); das Rig
            // sind die Gelenk-GRUPPEN des Baums (keine Bones, kein Bäcker mehr).
            group.userData.rig = built.rig;
            group.userData.parts = {
                torso: built.rig.chest,
                head: built.rig.head,
                leftArm: built.rig.armL.wrist,
                rightArm: built.rig.armR.wrist,
                leftLeg: built.rig.legL.hip,
                rightLeg: built.rig.legR.hip,
            };
            const attachMesh = (mesh) => {
                if (!mesh) return;
                mesh.receiveShadow = true;
                group.add(mesh); // finishSkin hat bones[0] schon unter die Mesh gehängt + gebunden
                group.userData.skinnedMesh = mesh;
                // KONVERGENZ: der Baum trägt Klassen-Materialien — die EINE Haut-Referenz
                // kommt aus dem Rig (Tint-/Farb-Konsumenten lesen weiter EIN Material).
                group.userData.material = mesh.material || (built.rig && built.rig._skinMat) || null;
                // PIPE-VOLLENDUNG: die Haut-Farb-WAHRHEIT (Genom/Studio-Zahl) reist am
                // Körper — Leser (Band/Tint) fragen die Zahl, nicht ein Material-Objekt
                // (die Pipe trägt Farben als Vertex-Daten auf geteilten Materialien).
                group.userData.hautTon = mesh.userData && mesh.userData.hautTon;
                // Der Kopf (in 1st-Person unsichtbar) zeichnet beim ersten 3rd-Person-Blick über die Erst-Zeichnung
                // (`_configureRenderer`): ein Frame Knoten-Bau, die Pipeline asynchron — kein Halt beim Wechsel.
            };
            attachMesh(built.mesh); // der Baum steht sofort (sync — kein async-Pfad mehr)
            // das Volumen der Gestalt (m³ im Rahmen des Avatars) — die Masse des Menschen liest es (_leibMasse)
            group.userData._leibV = AnazhRealm._leibVolumen(
                (built.mesh.userData && built.mesh.userData._leibNah) || built.mesh,
                group
            );
            // DIE GELENK-GESTALT am Gruppen-Level (S3): der Peer-Tick und die Werkstatt schalten die Stufe am Leib
            // (`_gelenkStufe`); der Rig-Bau liefert sie immer (fail-closed ohne Grobstufe).
            group.userData._gelenk = built.mesh.userData._gelenk;
            return group;
        }
        // Kein Rig → fail-LAUT: sichtbarer Not-Körper (Magenta-Kapsel) + Log statt stumm-leerer Gruppe
        // (unsichtbarer Spieler). Der Ingest-Nachguss (applyPlayerSoul) ersetzt ihn.
        this.log("MENSCH-BAU OHNE RIG: Not-Körper statt leerer Gruppe (heilt beim Ingest-Nachguss)", "WARN");
        const notK = new THREE.Mesh(
            typeof THREE.CapsuleGeometry === "function"
                ? new THREE.CapsuleGeometry(0.3, 1.1, 4, 8)
                : new THREE.SphereGeometry(0.5, 8, 6),
            new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true })
        );
        notK.position.y = 0.85;
        notK.userData.__kaltPlatzhalter = "mensch";
        group.add(notK);
        return group;
    }

    _animateHuman(group, t, walkPhase, isMoving, underwater, emotions, gait) {
        // Der Rig-Avatar wird über die Bones bewegt (Walk/Idle/Kontrapost/Schwimm); ohne Rig kommt der
        // Aufrufer nie hierher. gait ({w, amp, ik}) reist vom EINEN Gang-Tick zum Rig durch.
        if (!group.userData || !group.userData.rig) return;
        // Schwimmen: der GANZE Körper legt sich horizontal (group-Lehne), die Glieder macht das Rig; an Land
        // rotation.x = 0. Lehne aus dem koerperstudio-Gesetzbuch (fx.bewegung.schwimmen.lean).
        if (underwater) {
            const SL = AnazhRealm._schwimmGesetz().lean;
            group.rotation.x = isMoving ? SL.zug : SL.treten;
        } else {
            group.rotation.x = 0;
        }
        this._animateHumanoidRig(group.userData.rig, t, walkPhase, isMoving, underwater, emotions, gait);
        // Parkour-Rutsch-Pose: NUR der lokale Spieler (group === playerMesh) während state._parkourSlide;
        // Winkel aus dem koerperstudio-Gesetzbuch (parkour.slidePose; Kern kalt → keine Pose). ABSOLUT NACH
        // dem Rig-Grundlauf gesetzt (Überschreib-Muster wie der Schwimm-Zweig — kein Drift).
        if (group === this.state.playerMesh && this.state._parkourSlide) {
            const pg = AnazhRealm._parkourGesetz();
            const SP = pg && pg.slidePose;
            const rg = group.userData.rig;
            if (SP && rg) {
                group.rotation.x = SP.lehne;
                const sx = (b, v) => {
                    if (b) b.rotation.x = v;
                };
                sx(rg.head, SP.kopf);
                sx(rg.legL && rg.legL.hip, -SP.beinVor);
                sx(rg.legR && rg.legR.hip, -SP.beinVor * 0.85);
                sx(rg.legL && rg.legL.knee, SP.knieKnick);
                sx(rg.legR && rg.legR.knee, SP.knieKnick * 1.3);
                sx(rg.armL && rg.armL.shoulder, SP.armStuetz);
                sx(rg.armR && rg.armR.shoulder, SP.armFrei);
            }
        }
    }

    // Sitz-Pose des Avatars: die Oberschenkel liegen waagerecht auf dem Sitz, die Unterschenkel hängen, die Arme vorgehalten
    // (Zügel); Lage, Blick und Rumpf-Neigung setzt der Sitz des Gefährts (`_sitzLage`). Absolute Werte pro Frame (kein
    // Drift); beim Absteigen räumt _animateHuman die Rotationen, `_sitzLageLoesen` den Wurzel-Knochen.
    _applySeatPose(group, _t) {
        // GUSS 2b — der Rig-Avatar SITZT über die Bein-/Arm-Bones (Beine angewinkelt nach
        // vorn, Arme vorgehalten); absolute Werte (kein Drift — _animateHumanoidRig räumt sie).
        const rig = group.userData && group.userData.rig;
        if (rig) {
            // die Gruppe sitzt aufrecht: Schwimmen und Rutschen kippen sie (_animateHuman), im Sattel läuft das nie — wer aus
            // dem Wasser aufsitzt, behielt die Schwimm-Lage (gate:fahr-leben L9 nach L10: Kopf und Schenkel verschoben)
            group.rotation.x = 0;
            group.rotation.z = 0;
            for (const b of [rig.hips, rig.spine, rig.chest, rig.neck, rig.head]) if (b) b.rotation.set(0, 0, 0);
            for (const side of [rig.armL, rig.armR, rig.legL, rig.legR])
                for (const k in side) if (side[k] && side[k].rotation) side[k].rotation.set(0, 0, 0);
            // die Oberschenkel liegen auf der Sitzfläche (waagerecht nach vorn; vorher −1,3: 15° hinab, das Knie im Polster)
            rig.legL.hip.rotation.x = -Math.PI / 2;
            rig.legR.hip.rotation.x = -Math.PI / 2;
            // die Knie zur Mitte, die Füße zu den Pedalen (je 0,1 rad: ~9 cm nach innen) — gestreckt im Fußraum stand der
            // äußere Fuß sonst in der eingezogenen Front eines schmalen Wagens (Kompakt: 1,8 % der Haut durch die Haut)
            rig.legL.hip.rotation.z = -0.1;
            rig.legR.hip.rotation.z = 0.1;
            rig.legL.knee.rotation.x = 1.05; // Unterschenkel hängt
            rig.legR.knee.rotation.x = 1.05;
            rig.armL.shoulder.rotation.x = -0.4; // Arme vorgehalten (Zügel-Geste)
            rig.armR.shoulder.rotation.x = -0.4;
            rig.armL.elbow.rotation.x = -0.5;
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
    // (`_sitzLeib`), die Neigung je Gefährt die Knochen (`_sitzNeigung`); je Frame nur Gier und Lage des Wurzel-Knochens.
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
                L.knie = this._sitzKnie(ort, L.leib);
            }
        }
        const ort = L.ort;
        if (!ort || !L.leib) return;
        // der Rumpf neigt sich, der Kopf bleibt aufrecht; das Knie hält die Sohle über dem Bauch
        if (rig.spine) rig.spine.rotation.x = -L.phi;
        if (Number.isFinite(L.knie)) {
            if (rig.legL.knee) rig.legL.knee.rotation.x = L.knie;
            if (rig.legR.knee) rig.legR.knee.rotation.x = L.knie;
        }
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
        const v =
            this._sitzV || (this._sitzV = { a: new THREE.Vector3(), b: new THREE.Vector3(), z: new THREE.Vector3() });
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
    // position.y − 0,5 — dieselbe Basis wie `_sitzHeight`): ein Gesetz-Wagen trägt den Anker des Kerns (exportDrive.sitz,
    // der vordere seatRow auf der Fahrerseite), seine Dachlinie (huelle.yRoof) und die Sitz-Zeilen des Fahr-Satzes; ein
    // Teile-Werk den sitz-Punkt seines Bauplans (`_attachPointFor`) — offen, aufrecht. achseX: ein Studio-Wagen liegt
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
                bauch: d.huelle && Number.isFinite(d.huelle.ySill) ? d.huelle.ySill * sc : null,
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
        return {
            x: x * sc,
            y: sp.y * sc,
            z: z * sc,
            dach: null,
            bauch: null,
            lehne: 0,
            lehneMax: 0,
            kopfFrei: 0,
            achseX,
        };
    }

    // DER SITZENDE LEIB, an der HAUT gemessen (0710-4 Klasse 4; einmal je Rig — die Pose ist für jedes Gefährt dieselbe):
    // aufrecht, die Oberschenkel waagerecht — gesaess = wie hoch das Hüftgelenk über der Unterseite der Oberschenkel liegt
    // (jede Ecke, deren stärkster Knochen ein Oberschenkel ist), kopfOben = wie hoch der Scheitel über dem Kopf-Gelenk liegt
    // (die Ecken des Kopf-Knochens und die Meshes unter ihm: Haar, Augen). kopfMit: der Kopf hängt am Rumpf (dann gleicht
    // er dessen Neigung aus und bleibt aufrecht). Rahmen: der Spieler (seine Gier ändert keine Höhe).
    _sitzLeib(group, rig) {
        const nah = group.userData._gelenk ? group.userData._gelenk.nah : group;
        if (rig.spine) rig.spine.rotation.x = 0;
        if (rig.head) rig.head.rotation.x = 0;
        group.updateMatrixWorld(true);
        const inv = new THREE.Matrix4().copy(group.matrixWorld).invert();
        const v = new THREE.Vector3();
        const schenkel = new Set([rig.legL.hip, rig.legR.hip]);
        // Schienbein und Fuß (die Ecken der Knie- und Knöchel-Knochen): je Bein relativ zu seinem Knie-Gelenk (y, z im
        // Rahmen des Spielers; die Oberschenkel liegen längs z, das Knie dreht um x)
        const unten2 = new Map();
        for (const leg of [rig.legL, rig.legR]) {
            if (!leg.knee) continue;
            const kp = leg.knee.getWorldPosition(new THREE.Vector3()).applyMatrix4(inv);
            const eintrag = { ky: kp.y, kz: kp.z, proben: [] };
            unten2.set(leg.knee, eintrag);
            if (leg.ankle) unten2.set(leg.ankle, eintrag);
        }
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
                const fuss = kn !== null ? unten2.get(kn) : null;
                if (!bein && !kopf && !fuss) continue;
                o.getVertexPosition(i, v).applyMatrix4(o.matrixWorld).applyMatrix4(inv);
                if (bein && v.y < unten) unten = v.y;
                if (kopf && v.y > oben) oben = v.y;
                if (fuss) fuss.proben.push(v.y - fuss.ky, v.z - fuss.kz);
            }
        });
        const hL = rig.legL.hip.getWorldPosition(new THREE.Vector3()).applyMatrix4(inv);
        const hR = rig.legR.hip.getWorldPosition(new THREE.Vector3()).applyMatrix4(inv);
        const kp = rig.head ? rig.head.getWorldPosition(new THREE.Vector3()).applyMatrix4(inv) : null;
        let kopfMit = false;
        for (let n = rig.head; n && rig.spine && rig.head !== rig.spine; n = n.parent)
            if (n === rig.spine) kopfMit = true;
        if (!(unten < Infinity) || !(oben > -Infinity) || !kp) return null;
        // die Beine: das Knie relativ zum Hüftgelenk und die Ecken unter ihm (ein Bein genügt, die Pose ist symmetrisch)
        const hy = (hL.y + hR.y) / 2;
        const beinL = rig.legL.knee ? unten2.get(rig.legL.knee) : null;
        const bein =
            beinL && beinL.proben.length
                ? { knieRel: beinL.ky - hy, proben: beinL.proben, knie0: rig.legL.knee.rotation.x }
                : null;
        return { gesaess: hy - unten, kopfOben: oben - kp.y, kopfMit, bein };
    }

    // DAS KNIE IN EINEM GEFÄHRT (rad): so weit gebeugt wie die Sitz-Pose (knie0), höchstens so weit, dass die Sohle über dem
    // Bauch des Gefährts bleibt (exportDrive.huelle.ySill + 3 cm) — Schienbein und Fuß drehen starr um das Knie; gestreckter
    // stehen die Füße weiter vorn im Fußraum. Vorher hingen sie mit 60° Beugung bis 0,17 m unter dem Wagen.
    _sitzKnie(ort, leib) {
        const b = leib && leib.bein;
        if (!b || ort.bauch === null) return b ? b.knie0 : null;
        const frei = ort.y + leib.gesaess + b.knieRel - (ort.bauch + 0.03); // so tief darf die Sohle unter dem Knie liegen
        const tiefste = (k) => {
            const d = k - b.knie0; // die Drehung gegen die gemessene Pose
            const c = Math.cos(d);
            const s = Math.sin(d);
            let m = Infinity;
            for (let i = 0; i < b.proben.length; i += 2) {
                const y = b.proben[i] * c - b.proben[i + 1] * s;
                if (y < m) m = y;
            }
            return -m; // wie tief die Sohle unter dem Knie liegt
        };
        if (tiefste(b.knie0) <= frei) return b.knie0;
        let lo = 0;
        let hi = b.knie0;
        if (tiefste(lo) > frei) return lo;
        for (let i = 0; i < 20; i++) {
            const m = (lo + hi) / 2;
            if (tiefste(m) <= frei) lo = m;
            else hi = m;
        }
        return lo;
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
    }

    // Tiefes Disposal eines alten Soul-Group: Geometrien + Materialien
    // freigeben, damit GPU-Speicher nicht volläuft bei häufigem Wechsel.
    // DIE EINE ENTSORGUNGS-REGEL jeder Gruppe, die Welt-Vorlagen teilen kann (Frost-Nachbesserung 08.10.): Seelen-Avatar,
    // Mitspieler-Leib, Ich-, Hof- und Feed-Bühne, Werkstatt-Ofen. Sie bauen mit denselben Bauern wie die Welt (Mensch-
    // Vorlage, Tier-Vorlagen, Klassen-Stoffe) und entsorgten beim Wechsel ALLES — Gegenprüfung (Radeon): 3 Wechsel
    // wolf↔human legten 12 Geometrien und 8 Stoffe der Welt in die Entsorgung (den Kopf des Spieler-Leibs, die Haut), die
    // Welt kompilierte neu (68 statt 19 Shader-Module); ein zweiter Peer-Guss „human" dieselben 12 Geometrien. Was eine
    // Gruppe besitzt, sagt die Geteilt-Markierung: Vorlagen tragen sie, ein eigener Guss nicht (`_ofenVorlage`).
    // gate:weltbild-frost (S1–S4) und die Entsorgungs-Wand in gate:altlasten halten es.
    _disposeSoulGroup(group) {
        if (!group) return;
        // NUR Geometries disposen, nie Materials: Compound-Groups teilen oft EIN Material, und
        // material.dispose() löst eine RenderObject-Invalidation aus, die mit pending Submit racet.
        // sharedGeom gilt hier am EINEN Dispose-Chokepoint: ein Studio-Hand-Wrapper teilt die GECACHTE
        // Foundry-Geometrie — sie bleibt stehen, sonst verlöre Welt/Werkstatt/Cache das Asset.
        group.traverse((node) => {
            if (node.geometry && !(node.userData && node.userData.sharedGeom)) this._queueDispose(node.geometry);
            // W-A4b — Ref-Rückgabe der geteilten Foundry-Quell-Gruppe (`_foundryLoslassen`). Idempotent via Nullen.
            const src = node.userData && node.userData.foundrySrcGroup;
            if (src) {
                node.userData.foundrySrcGroup = null;
                this._foundryLoslassen(src);
            }
            // Die Render-Objekte des Leibs lösen sich in jedem Renderer, der ihn zeichnete (die Hörer an geteilten
            // Stoffen) — nach dem nächsten Submit, mit der Geometrie (`_renderObjekteLoesen`).
            if (node.__renderObjekte) this._queueDispose({ dispose: () => AnazhRealm._renderObjekteLoesen(node) });
            // Der Leib gibt seine Ofen-Vorlagen zurück (`_ofenVorlagenBinden`): die letzte Rückgabe macht sie räumbar.
            if (node.__ofenVorlagen) {
                for (const v of node.__ofenVorlagen) this._ofenVorlageLoesen(v);
                node.__ofenVorlagen = null;
            }
        });
    }

    // DIE CHASE-CAM EINES BUCHS (H3), fail-closed: sie trägt JEDES Feld des Kern-Satzes `FAHR.kamera` endlich und dist > 0 —
    // ein Satz ohne die Tempo-Felder rechnete im Rig NaN (vorher prüfte je Leser eine Wand nur el und dist); er bricht laut
    // (der Fang von `_vehicleProfile` meldet ihn über `_bruchMelden`, gate:fahr-leben T5 laut).
    _kamSatz(km) {
        const F = AnazhRealm._fahrSchrittGesetz().vc.FAHR.kamera;
        if (km.dist > 0 && Object.keys(F).every((n) => Number.isFinite(km[n]))) return km;
        return AnazhRealm._kernPflichtBruch("vehicle:fahrprofil.kamera (jedes Feld von FAHR.kamera)");
    }

    // Fahr-Profil emergiert aus der SUBSTANZ (kein Typ-Enum): Räder tragen TEMPO (+12 % je Rad, Cap
    // +60 %) und rollen aus (niedriges Brems-k), Beine einen Ritt-Schritt; das Hüll-Volumen
    // (_compoundSizeFactor) macht träge. Am Entry gecacht (die Bauplan-Form ist frozen).
    _vehicleProfile(entry) {
        if (!entry) return null;
        // am Eintrag gemerkt, solange die Stoff-Zeile steht (`AnazhRealm._stoffStand`: eine geänderte Dichte wiegt neu)
        const stand = AnazhRealm._stoffStand || 0;
        if (entry._vehicleProfile && entry._vehicleProfile.stoffStand === stand) return entry._vehicleProfile;
        const bp = this.state.blueprints && this.state.blueprints[entry.type];
        const roles =
            bp && Array.isArray(bp.parts) && bp.parts.length >= 2
                ? this.computeMotionRoles(bp.parts, bp.connections)
                : null;
        let radCount = 0;
        let beinCount = 0;
        if (roles) {
            for (const r of roles) {
                if (r && r.role === "rad") radCount++;
                else if (r && r.role === "bein") beinCount++;
            }
        }
        const mass = bp ? Math.max(0.6, Math.min(2.5, this._compoundSizeFactor(bp))) : 1;
        // DER STOFF IM WASSER (physik K1): die mittlere Dichte des Werks in kg/m³ — die Masse seiner Teile durch das Volumen
        // ihrer Gestalt (`_teilMasse` / `_teilVolumen`, die EINE Stoff-Zeile; nie der dichteste Stoff — ein Eisen-Nagel
        // versenkt das Holz-Boot nicht). Ein Studio-Fahrzeug liegt nach dem Stoff seiner HÜLLE (blech: der Mix des
        // Fahrzeug-Kerns, wenn die Kabine voll läuft) — nie nach der Substanz des Spenders, dessen Bauplan es klont (D10: der
        // Supersportler schwamm wie ein Holz-Boot). Es schwimmt, solange das Wasser es trägt (`_eintauchAnteil` < 1).
        // Vorher die Tag-Achse dichte gegen eine Wasser-Dichte der Tag-Skala (0,55): der Holzkarren mit vier eisernen
        // Speichen-Rädern (0,5155) schwamm, nach seinen kg (1 560 kg/m³) sinkt er.
        let rhoMittel = NaN;
        if (bp && Array.isArray(bp.parts)) {
            let vSum = 0;
            let mSum = 0;
            for (const p of bp.parts) {
                if (!p) continue;
                vSum += this._teilVolumen(p);
                mSum += this._teilMasse(p);
            }
            if (vSum > 0) rhoMittel = mSum / vSum;
        }
        const fzgH = this._fahrzeugGesetzFor(entry);
        if (fzgH && fzgH.drive && fzgH.drive.huelle) rhoMittel = this._stoffRho("blech");
        const floats = Number.isFinite(rhoMittel) && this._eintauchAnteil(rhoMittel) < 1;
        // Emergenz-Koeffizienten aus dem Gesetzbuch (vehicle-core FAHR.hostEmergent); der Leser
        // _fahrGesetz ist FAIL-CLOSED über alle Felder — ein alter Kern bricht laut, kein Literal-Zwilling.
        const HE = AnazhRealm._fahrGesetz().he;
        const prof = {
            radCount,
            beinCount,
            mass,
            floats,
            // die mittlere Dichte (kg/m³) reist ins Profil: die Wasserlinie (`_fahrzeugGestalt`, Archimedes) liest sie
            dichte: rhoMittel,
            stoffStand: stand,
            topSpeedMul:
                1 + Math.min(HE.radCap, radCount * HE.radMul) + (radCount === 0 && beinCount >= 2 ? HE.beinBonus : 0),
            kAcc: Math.max(HE.kAccMin, Math.min(HE.kAccMax, HE.kAcc / mass)),
            kBrake:
                radCount > 0
                    ? Math.max(HE.kBrakeRadMin, Math.min(HE.kBrakeRadMax, HE.kBrakeRad / mass))
                    : Math.max(HE.kBrakeBeinMin, Math.min(HE.kBrakeBeinMax, HE.kBrakeBein / mass)),
            roles,
        };
        // fahrprofil-Daten-Override: trägt das LIVE-Rezept des Zweit-Kerns (fx.fahrprofil) Fahr-Werte,
        // führen SIE; sonst trägt das emergente Profil allein. Der Cache hängt am entry — eine Kern-Änderung
        // greift beim nächsten Aufsitzen.
        try {
            const _pf = typeof this._foundryPresetFor === "function" ? this._foundryPresetFor(entry.type) : null;
            const _rec = _pf && this._foundry && this._foundry.recipes ? this._foundry.recipes[_pf] : null;
            const _fp = _rec && _rec.fx && typeof _rec.fx.fahrprofil === "object" ? _rec.fx.fahrprofil : null;
            if (_fp) {
                if (Number.isFinite(_fp.topSpeedMul)) prof.topSpeedMul = _fp.topSpeedMul;
                if (Number.isFinite(_fp.kAcc)) prof.kAcc = _fp.kAcc;
                if (Number.isFinite(_fp.kBrake)) prof.kBrake = _fp.kBrake;
                if (typeof _fp.floats === "boolean") prof.floats = _fp.floats;
                // vmax-Anker aus exportDrive (m/s) durchreichen — der Bewegungs-Tick liest ride.vmax.
                // NaN-Wand: nur finite > 0.
                if (Number.isFinite(_fp.vmax) && _fp.vmax > 0) prof.vmax = _fp.vmax;
                // ZENSUS 17.07. — die SCHWERPUNKT-HÖHE des Kerns (exportDrive.cgH
                // aus cgHeightOf: Bodenfreiheit+Gürtel+Aufbau) reist ins Profil;
                // der Nick-Block liest sie statt der Host-Näherung sitz·0.5.
                if (Number.isFinite(_fp.cgH) && _fp.cgH > 0) prof.cgH = _fp.cgH;
                // ZENSUS-REST V18.488 — die RAD-/SPUR-Geometrie des Kerns reist
                // ins Profil: radR dreht die Rad-Rolle mit Weg/radR (statt der
                // Magie-Konstanten 2.2/1.6), spur trägt den Quer-Wank (cgH/W).
                if (Number.isFinite(_fp.radR) && _fp.radR > 0) prof.radR = _fp.radR;
                if (Number.isFinite(_fp.spur) && _fp.spur > 0) prof.spur = _fp.spur;
                // spring {k,c} aus exportDrive (dieselben Zahlen wie die Probefahrt) → _tickMountedMovement federt
                // Aufsitz-Höhe/Nick render-seitig. NaN-Wand: nur finite k>0, c≥0 — sonst exp-Lerp-Fallback.
                const _sp = _fp.spring;
                if (_sp && Number.isFinite(_sp.k) && Number.isFinite(_sp.c) && _sp.k > 0 && _sp.c >= 0) {
                    prof.spring = { k: _sp.k, c: _sp.c };
                }
                // FAHR-GEFÜHL (Garage-Vereinigung) — die Lenk-/Drift-Gesetze
                // reisen ins Profil (NaN-Wand; nur RÄDRIGE Werke lenken — ein
                // Reit-Bein-Werk bleibt richtungs-folgend byte-alt).
                const _lk = _fp.lenkung;
                if (
                    _lk &&
                    prof.radCount > 0 &&
                    Number.isFinite(_lk.sfK) &&
                    Number.isFinite(_lk.maxSteer) &&
                    Number.isFinite(_lk.gripK)
                ) {
                    prof.lenkung = _lk;
                }
                // Das volle Zweispur-Gesetz reist ins Profil: der Ritt fährt DENSELBEN Fahr-Schritt wie die Probefahrt
                // (vehicle-core fahrSchritt, `_fahrSatz`). NaN-Wand: nur mit den tragenden Größen — ohne sie trägt das
                // Werk kein Fahr-Gesetz und reitet richtungs-folgend. Dazu die Probefahrt-Kamera (Chase-Cam, `_kamSatz`).
                if (_fp.kamera) prof.kamera = this._kamSatz(_fp.kamera);
                const _zs = _fp.zweispur;
                if (
                    _zs &&
                    prof.lenkung &&
                    Number.isFinite(_zs.Izz) &&
                    _zs.Izz > 0 &&
                    Number.isFinite(_zs.mass) &&
                    _zs.mass > 0 &&
                    Number.isFinite(_zs.CA_F) &&
                    Number.isFinite(_zs.CA_R) &&
                    Number.isFinite(_zs.maxGrip) &&
                    Number.isFinite(_zs.b) &&
                    _zs.b > 0 &&
                    Number.isFinite(_zs.c) &&
                    _zs.c > 0
                ) {
                    prof.zweispur = _zs;
                }
            }
        } catch (e) {
            // FAIL-CLOSED HEISST LAUT (`_kamSatz`, Prüfer R2): ein unlesbarer Satz des Rezepts meldet beim EINEN Melder, das Werk
            // fährt ohne ihn — vorher schluckte ein leerer Fang den Bruch still
            this._bruchMelden(`FAHR-PROFIL „${entry.type}": ${(e && e.message) || e}`);
        }
        // JEDES rädrige Werk fährt DASSELBE Gesetz: ohne Studio-Rezept leitet der Host den P-Vektor aus der
        // eigenen Part-Hülle ab (L/B/H, Rad-Radius, in die Regler-Domäne geklemmt) und ruft DIESELBE
        // exportDrive-Formel. Konsumiert nur Lenkung/Zweispur/Feder/Geometrie/Kamera — Tempo-Identität bleibt
        // emergent, Sitz bleibt _attachPointFor, Blocker bleiben die echten Parts. Ohne Kern fail-closed.
        if (prof.radCount > 0 && !prof.lenkung) {
            try {
                const core = typeof globalThis !== "undefined" ? globalThis.__vehicleCore : null;
                const ext =
                    bp && core && typeof core.exportDrive === "function" ? this._compoundVisualExtent(bp) : null;
                if (ext && ext.dx > 0 && ext.dz > 0) {
                    const scl = Number.isFinite(entry.scale) ? entry.scale : 1;
                    const L = Math.max(ext.dx, ext.dz) * scl;
                    const W = Math.min(ext.dx, ext.dz) * scl;
                    const P = {
                        // radstand = Länge − DEFAULT-Überhänge (0.78+0.92); spur =
                        // Breite − Karosserie-Deckung (2×0.13); dach = Form-Höhe.
                        radstand: Math.max(2.2, Math.min(3.4, L - 1.7)),
                        spur: Math.max(1.3, Math.min(1.9, W - 0.26)),
                        dach: Math.max(0.9, Math.min(2, (ext.dy || 0) * scl)),
                    };
                    if (roles && Array.isArray(bp.parts)) {
                        let rr = 0;
                        for (let i = 0; i < roles.length; i++) {
                            if (!roles[i] || roles[i].role !== "rad") continue;
                            const s = bp.parts[i] && bp.parts[i].size;
                            if (!s) continue;
                            const r =
                                (Math.max(
                                    Math.abs(Number(s.x) || 0),
                                    Math.abs(Number(s.y) || 0),
                                    Math.abs(Number(s.z) || 0)
                                ) *
                                    scl) /
                                2;
                            if (r > rr) rr = r;
                        }
                        if (rr > 0) P.radR = Math.max(0.26, Math.min(0.42, rr));
                    }
                    const drv = core.exportDrive(P);
                    const _lk2 = drv && drv.lenkung;
                    if (
                        _lk2 &&
                        Number.isFinite(_lk2.sfK) &&
                        Number.isFinite(_lk2.maxSteer) &&
                        Number.isFinite(_lk2.gripK)
                    ) {
                        prof.lenkung = _lk2;
                        const _zs2 = drv.zweispur;
                        if (
                            _zs2 &&
                            Number.isFinite(_zs2.Izz) &&
                            _zs2.Izz > 0 &&
                            Number.isFinite(_zs2.mass) &&
                            _zs2.mass > 0
                        ) {
                            prof.zweispur = _zs2;
                        }
                        if (drv.kamera) prof.kamera = this._kamSatz(drv.kamera);
                        if (!prof.spring && drv.spring && Number.isFinite(drv.spring.k) && drv.spring.k > 0)
                            prof.spring = drv.spring;
                        if (!Number.isFinite(prof.cgH) && Number.isFinite(drv.cgH) && drv.cgH > 0) prof.cgH = drv.cgH;
                        if (!Number.isFinite(prof.radR) && Number.isFinite(drv.radR) && drv.radR > 0)
                            prof.radR = drv.radR;
                        if (!Number.isFinite(prof.spur) && Number.isFinite(drv.spur) && drv.spur > 0)
                            prof.spur = drv.spur;
                    }
                }
            } catch (e) {
                this._bruchMelden(`FAHR-PROFIL „${entry.type}" (aus der Hülle): ${(e && e.message) || e}`);
            }
        }
        entry._vehicleProfile = prof;
        return prof;
    }

    // DIE GESTALT DES GEFÄHRTS IM WASSER (D10): `{ linie }` — die Wasserlinie über der Unterkante (m), bis zu der das Wasser
    // die Hülle trägt; Infinity = sie trägt nie (dichter als Wasser: das Gefährt watet und sinkt). Archimedes: die Hülle
    // taucht, bis ihr verdrängtes Volumen ihre Masse trägt. Die Dichte entscheidet `_vehicleProfile` (Substanz bzw. Hülle
    // des Kerns); die Form ein Studio-Fahrzeug aus seiner Hülle (exportDrive.huelle: Unterkörper nose..tail × ±bw ×
    // yFloor..yBelt, Greenhouse cowl..back × ±cw × yBelt..yRoof; die Linie misst von der Rad-Ebene y = 0), ein Teile-Werk aus
    // der Höhe seines Bauplans (die Linie misst von seiner Unterkante). Am Eintrag gemerkt (die Form ist eingefroren).
    // Leser: der Fahr-Schritt (`_fahrBoden`) und der Ritt im Sim-Schritt (`_rittSchritt`) über `_koerperWasser(x, z, grund,
    // gestalt)` — der Frame-Tick (`_tickMountedMovement`) ist nur Sicht.
    _fahrzeugGestalt(entry, prof) {
        const p = prof || this._vehicleProfile(entry);
        if (entry._wasserGestalt && entry._wasserGestalt.prof === p) return entry._wasserGestalt;
        const sc = Number.isFinite(entry.scale) ? entry.scale : 1;
        const rel = p && Number.isFinite(p.dichte) ? this._eintauchAnteil(p.dichte) : Infinity;
        let linie = Infinity;
        if (p && p.floats && rel < 1) {
            const fzg = this._fahrzeugGesetzFor(entry);
            const h = fzg && fzg.drive ? fzg.drive.huelle : null;
            if (h) {
                const a1 = (h.noseX - h.tailX) * 2 * h.bw;
                const a2 = Math.max(0.4, h.cowlX - h.backX) * 2 * h.cw;
                const v1 = a1 * (h.yBelt - h.yFloor);
                const m = rel * (v1 + a2 * (h.yRoof - h.yBelt));
                linie = (h.yFloor + (m <= v1 ? m / a1 : h.yBelt - h.yFloor + (m - v1) / a2)) * sc;
            } else {
                // die Höhe des Rumpfs aus den Hüllen seiner Teile (`_teileHuelle`), nie aus ihren Mitten: ein Floß aus EINER
                // Bohle hatte die Höhe 0 und lag mit der Mindest-Höhe 0,3 m im Wasser (physik K1)
                const hu = this._teileHuelle(this.state.blueprints && this.state.blueprints[entry.type]);
                const rumpfH = hu ? Math.max(0.3, (hu.y1 - hu.y0) * sc) : 1;
                const anteil = Math.max(0.1, Math.min(0.95, rel));
                linie = Math.max(0.08, Math.min(rumpfH - 0.05, anteil * rumpfH));
            }
        }
        entry._wasserGestalt = { linie, lage: null, prof: p };
        return entry._wasserGestalt;
    }

    // V18.150 — das Profil des AKTUELL gerittenen Gefährts (der Bewegungs-
    // Loop konsumiert es). _tickMountedMovement cacht den Entry pro Frame
    // (_mountedEntry) — kein zweiter Array-Scan im Bewegungs-Pfad.
    // DER SITZ FÄHRT NIE (bauen.K5): ein Werk, das nicht fahrbar ist (die Bank, `sitzbar`), trägt den Sitzenden mit Tempo 0 —
    // hier, am EINEN Ritt-Leser; das Profil selbst bleibt die Emergenz der Substanz (`_vehicleProfile`, jeder andere Leser).
    _mountedVehicleProfile() {
        const archId = this.state.player && this.state.player.mountedArch;
        if (archId === null || archId === undefined) return null;
        const entry =
            this._mountedEntry && this._mountedEntry.id === archId
                ? this._mountedEntry
                : (this.state.architectures || []).find((e) => e.id === archId);
        const prof = entry ? this._vehicleProfile(entry) : null;
        if (!prof || (entry.affordances && entry.affordances.moveable)) return prof;
        if (!entry._sitzRitt || entry._sitzRitt.prof !== prof)
            entry._sitzRitt = { prof, ritt: Object.assign({}, prof, { topSpeedMul: 0 }) };
        return entry._sitzRitt.ritt;
    }

    // REITER + GEFÄHRT = EIN KÖRPER: das gerittene Werk ist der Leib des Spielers — seine Blocker blocken weder den Spieler
    // noch seine Strahlen (der gleitende Arm der Third-Kamera, das Fadenkreuz) noch die Ziel-Wahl eines Tiers. Die EINE Frage
    // aller Leser; bis hierher trugen drei Leser je ihre Kopie, und der Strahl keine: der Arm traf im Ritt den eigenen Wagen,
    // zog die Kamera an sein Heck (Arm 0,30) und beim Fahren in ihn hinein — in Third verschwand das Fahrzeug.
    _gerittenesWerk(e) {
        const id = this.state.player ? this.state.player.mountedArch : null;
        return id !== null && id !== undefined && !!e && e.id === id;
    }

    // DER SITZ (bauen.K5): ein sitzbares Werk (`sitzbar`, das Sitz-Gesetz der Form) trägt den Leib wie ein Gefährt — dieselbe
    // Sitz-Pose, derselbe Sitz-Punkt (`_attachPointFor` „sitz"), derselbe Abstieg —, nur fährt es nie (`_vehicleProfile`: Tempo 0).
    mountArchitecture(entry) {
        if (!entry || !entry.affordances || !(entry.affordances.moveable || entry.affordances.sitzbar)) {
            this.log("Mount: Architektur ist weder fahrbar noch sitzbar", "INFO");
            return { ok: false, reason: "not_moveable" };
        }
        this.state.player.mountedArch = entry.id;
        this._mountedEntry = entry; // der Sim-Schritt (Lenk-Pfad, `_rittSchritt`) kennt das Werk ab dem ersten Schritt
        // Frischer Aufstieg = frischer Fahr-Zustand des Kerns (Lenksäule zentriert, Gier-Rate null, Federn ruhig, die
        // Vertikale auf dem Boden) und ein frisch gelesener Fahr-Satz (das Buch kann sich geändert haben).
        entry._fahr = null;
        entry._fahrSatz = null;
        entry._fahrSatzKey = null;
        entry._fahrBodenFn = null;
        entry._fahrHuelleKette = null; // die Hülle als Körper (Q5) — je Aufstieg frisch aus dem Gesetz
        entry._rideHeave = 0; // frischer Squat-Zustand je Aufstieg
        // N8 — die Chase-Cam richtet sich beim Aufstieg hinter den Wagen, ihr Ort gleitet (`_loopCamera`, `_kamGleiten`)
        // Der SITZ-Punkt des Bauplans (expliziter sitz-Punkt oder oberste flache Fläche) bestimmt, wo der
        // Charakter sitzt; am Entry gecacht, _tickMountedMovement liest ihn.
        const bp = this.state.blueprints && this.state.blueprints[entry.type];
        const scale = Number.isFinite(entry.scale) ? entry.scale : 1;
        entry._sitzHeight = AnazhRealm.MOUNT_FOLLOW_HEIGHT;
        // vehicle-Gestalt: Sattelpunkt aus exportDrive.sitz (seatRow-Anker — GT tief, Truck hoch).
        // Kein Gesetz → der emergente _attachPointFor bleibt die EINE Quelle der User-Eigenwerke.
        const fzgM = this._fahrzeugGesetzFor(entry);
        const fzgSitz = fzgM && fzgM.drive && fzgM.drive.sitz ? fzgM.drive.sitz : null;
        // DER RAHMEN des Templates: ein Studio-Fahrzeug liegt längs x (vehicle-core huelle: Bug +x), ein Teile-Werk
        // fährt in +z. Die Fahrt beginnt in der Richtung, in der der Wagen STEHT — ohne diesen Anfang griff der
        // Bewegungs-Tick die Blick-Gier und der Wagen schnappte beim Aufsitzen herum.
        entry._fahrAchseX = !!(fzgM && fzgM.drive && fzgM.drive.huelle);
        entry._rideYaw =
            (Number.isFinite(entry.rotationY) ? entry.rotationY : 0) + (entry._fahrAchseX ? Math.PI / 2 : 0);
        // ...und die Gier im Bild beginnt ohne Schweif (wie die Lage nach einem Teleport): das erste Bild ohne Sim-Schritt
        // zeichnete sonst zwischen der Gier der letzten Fahrt und dieser (Spielgang 18.10., der Wiederaufstieg nach einem Stoß)
        entry._gierVor = entry._rideYaw;
        if (fzgSitz && Number.isFinite(fzgSitz.y)) {
            entry._sitzHeight = Math.max(0.45, fzgSitz.y * scale + AnazhRealm.SITZ_HIP_OFFSET);
        } else if (bp) {
            const sp = this._attachPointFor(bp, "sitz").point;
            if (Number.isFinite(sp.y)) {
                // Nicht die Steh-Anatomie (+0.9) nehmen: die Sitz-Pose senkt die Hüfte auf den Sattel, das
                // Reiter-Zentrum liegt ~SITZ_HIP_OFFSET über dem Sattelpunkt (gefährt-skalen-unabhängig).
                entry._sitzHeight = Math.max(0.45, sp.y * scale + AnazhRealm.SITZ_HIP_OFFSET);
            }
        }
        // M3(a)/V18.155 — die BODEN-KLÄRUNG fürs vertikale FÜHREN (das Gefährt
        // steht auf dem Terrain, der Reiter folgt ihm): Ursprung − Bauplan-
        // Unterkante (rotations-bewusst), ×scale. Gecacht (die Form ist frozen).
        entry._groundClear = bp ? -this._compoundBottomY(bp) * scale : 0;
        // W-D/M-D2 (V18.170, R-011) — die halbe HORIZONTALE Spanne fürs
        // Hang-Proben (Bug/Heck in Fahrt-Richtung): gecacht, gedeckelt 0.8..3 m.
        const ext = bp ? this._compoundVisualExtent(bp) : null;
        entry._rideHalfLen = ext ? Math.max(0.8, Math.min(3, (Math.max(ext.dx, ext.dz) * scale) / 2)) : 1;
        // die Höhe des Teile-Werks (sein Wasser-Maß im Fahr-Schritt, `_rittAufstand` → vehicle-core fahrWasser)
        entry._rideDach = ext && ext.dy > 0 ? ext.dy * scale : NaN;
        entry._rideY = null;
        // Spieler-Position über die Architektur heben (sodass er auf dem SITZ
        // sitzt). Architektur-Position wird in _tickMountedMovement nachgezogen.
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        if (pm) {
            pm.x = entry.position.x;
            pm.z = entry.position.z;
            pm.y = entry.position.y - 0.5 + entry._sitzHeight; // der Sitz misst von der Basis (position.y − 0.5)
        }
        // Reiter + Gefährt = EIN Körper: die eigenen Blocker des gerittenen Werks blocken es nie (der Struktur-Löser
        // überspringt riddenId); was kollidiert, ist die HÜLLE des Gesetz-Wagens (`_fahrHuelle`, Welle L Q5) bzw. ohne
        // Fahr-Gesetz die Reiter-Kapsel. Absteigen baut die Blocker lazy neu. Profil wird dabei lesbar.
        const prof = this._vehicleProfile(entry);
        // Aufstieg in ein gesetz-gelenktes Werk schaltet in die Studio-Sicht (die Kern-Chase-Cam lebt im
        // third-Ast von _loopCamera); der vorige Modus kehrt beim Abstieg zurück.
        if (prof && prof.lenkung && this.state.cameraMode !== "third") {
            this.state._mountVorKamera = this.state.cameraMode;
            this.setCameraMode("third");
        }
        if (!entry.affordances.moveable) {
            // wer sich setzt, steht still: die Fahrt des Gehens fällt mit dem Sitz
            if (this.state.playerVel) this.state.playerVel.setValue(0, 0, 0);
            this.log(`Sitzt auf „${entry.type}"`, "INFO");
            return { ok: true, entry };
        }
        const art =
            prof && prof.radCount > 0
                ? `${prof.radCount}× Rad — rollt`
                : prof && prof.beinCount >= 2
                  ? `${prof.beinCount}× Bein — trabt`
                  : "starr";
        this.log(
            `Eingestiegen in „${entry.type}" (${art} · Tempo ×${prof ? prof.topSpeedMul.toFixed(2) : "1.00"} · ${prof && prof.mass > 1.4 ? "träge" : "wendig"})`,
            "INFO"
        );
        return { ok: true, entry };
    }

    // Aussteigen: löst die Kopplung. Architektur bleibt an ihrer letzten
    // Position stehen.
    dismountArchitecture() {
        const archId = this.state.player.mountedArch;
        if (archId === null || archId === undefined) return { ok: false, reason: "not_mounted" };
        // Ruhe-Wahrheit final stempeln: die letzte Fahr-Pose liegt schon in entry.position/rotationY
        // (Persistenz-Felder); die Blocker exakt nachziehen — der Schwellen-Takt ließe bis 0.5 m Versatz.
        const entry =
            this._mountedEntry && this._mountedEntry.id === archId
                ? this._mountedEntry
                : (this.state.architectures || []).find((e) => e.id === archId);
        if (entry && entry.blockerAABBs) {
            this._populateBlockerAABBs(entry);
            entry._blockerStampAt = null;
        }
        // Ruhe-Optik: Nick/Feder-Zustand nullen, der EINE Visual-Weg zieht die Matrix nach. call-Form MIT
        // ABSICHT: die A6-Wand des vehicle-drive-Gates schneidet die ERSTE direkte Instanz-Update-Bindung aus
        // dem Quelltext — die muss die Tick-Zeile in _tickMountedMovement bleiben. Muster hier nie zitieren.
        // Der Gelände-Nick/-Wank bleibt: der Wagen parkt in der Ebene seiner Räder.
        if (entry && (entry._ridePitch || entry._rideVy || entry._rideHeave || entry._rideKurvenRoll)) {
            entry._ridePitch = 0;
            entry._rideVy = 0;
            entry._rideHeave = 0; // N7-Rest — das stehende Gefaehrt steht auf Feder-Null
            entry._rideKurvenRoll = 0;
            if (entry.mesh) this._rittMeshPose(entry);
            else if (entry.instanced) this._archInstanceUpdate.call(this, entry);
        }
        // DER WAGEN BLEIBT NIE IN DER LUFT (Gegenprüfung 07.10.): die Fahrt endet mit dem Abstieg wie am Boden (der Wagen
        // bleibt, wo der Reiter ihn verließ — Längs-, Quer- und Gier-Fahrt fallen), die VERTIKALE bleibt dem Fahr-Gesetz:
        // fliegt er, trägt ihn `_fahrNachlauf` je Sim-Schritt auf der ballistischen Vertikale des Kerns, bis er steht.
        const fzAb = entry && entry._fahrSatz ? entry._fahr : null;
        if (fzAb) {
            // der Fahr-Zustand steht, wo der Wagen steht (die Kräfte hatten ihn einen Schritt vorausgelegt)
            fzAb.x = entry.position.x;
            fzAb.z = entry.position.z;
            fzAb.vlong = 0;
            fzAb.vlat = 0;
            fzAb.yawRate = 0;
            fzAb.speed = 0;
            fzAb.aLong = 0;
            fzAb.aLat = 0;
            if (fzAb.luft) (this._fahrLos || (this._fahrLos = new Set())).add(entry);
            // der Reiter steigt NEBEN dem Wagen aus (`_aussteigOrt`), nie auf ihn
            const ort = this._aussteigOrt(entry);
            const pm = this.state.playerMesh;
            if (ort && pm) {
                pm.position.set(ort.x, ort.y, ort.z);
                if (this.state.playerVel) this.state.playerVel.setValue(0, 0, 0);
                this.state._fieldVy = 0;
            }
        }
        // DER SITZ (bauen.K5): wer aufsteht, steht vor ihm — die Front +z des Werks, eine Kapsel vor der Vorderkante seines
        // Sitzes, die Füße auf dem Grund des Werks (Basis − Bodenfreiheit); vorher stand der Leib in der Sitzfläche
        const sp =
            entry && entry.affordances && !entry.affordances.moveable
                ? this._attachPointFor(this.state.blueprints[entry.type], "sitz")
                : null;
        if (sp && sp.part !== null && this.state.playerMesh) {
            const sc = Number.isFinite(entry.scale) ? entry.scale : 1;
            const tiefe = Math.abs(this.state.blueprints[entry.type].parts[sp.part].size.z || 0);
            const vor = (sp.point.z + tiefe / 2) * sc + AnazhRealm.PLAYER_WALL_RADIUS + 0.05;
            const th = Number.isFinite(entry.rotationY) ? entry.rotationY : 0;
            this.state.playerMesh.position.set(
                entry.position.x + Math.cos(th) * sp.point.x * sc + Math.sin(th) * vor,
                entry.position.y - (entry._groundClear || 0),
                entry.position.z - Math.sin(th) * sp.point.x * sc + Math.cos(th) * vor
            );
            this.state._fieldVy = 0;
        }
        this.state.player.mountedArch = null;
        // FAHR-ABSCHLUSS (19.07.) — die gemerkte Vor-Fahrt-Sicht kehrt zurück.
        if (this.state._mountVorKamera) {
            this.setCameraMode(this.state._mountVorKamera);
            this.state._mountVorKamera = null;
        }
        this.log(`Ausgestiegen`, "INFO");
        return { ok: true };
    }

    // DER AUSSTIEG (Karte K02, FZ-01): wer aus einem Gesetz-Wagen steigt, steht NEBEN ihm — an der Flanke links, sonst
    // rechts, hinter oder vor ihm (die Hülle des Fahr-Gesetzes, `_fahrHuelle`, plus der Wand-Radius des Spielers) —, nie
    // auf ihm. Bis hierhin blieb der Reiter am Sitz in der Wagen-Mitte, und der Struktur-Löser hob ihn aus den Teil-Boxen
    // aufs Dach: an Land standen seine Füße 1,55 m über dem Boden, in 1,39 m Wasser über dem Spiegel — er schwamm nicht.
    // Ein Platz ist frei, wenn dort kein anderes Werk steht (`_blockerNahe`) und der Boden nicht höher als die Stufe des
    // Spielers über der Rad-Ebene liegt; ohne Boden in Reichweite trägt ihn nur Wasser. Rückgabe: der Ort (Füße auf dem
    // Boden, im Wasser auf dem Grund — der Körper schwimmt dann selbst) oder null (keine Seite frei: er klettert aufs Dach).
    _aussteigOrt(entry) {
        const k = this._fahrHuelle(entry);
        const fz = entry && entry._fahr;
        if (!k || !fz || !Number.isFinite(fz.y)) return null;
        const ry = Number.isFinite(entry._rideYaw) ? entry._rideYaw : 0;
        const fX = Math.sin(ry);
        const fZ = Math.cos(ry);
        const qX = Math.cos(ry);
        const qZ = -Math.sin(ry);
        const rW = AnazhRealm.PLAYER_WALL_RADIUS;
        const ab = rW + 0.25;
        const nahe = [];
        for (const [l, q] of [
            [k.mitte, k.hw + ab],
            [k.mitte, -(k.hw + ab)],
            [k.heck - ab, 0],
            [k.bug + ab, 0],
        ]) {
            const x = entry.position.x + l * fX + q * qX;
            const z = entry.position.z + l * fZ + q * qZ;
            nahe.length = 0;
            this._blockerNahe(x, z, rW, -Infinity, nahe);
            if (nahe.some((e) => e !== entry)) continue;
            const boden = this._koerperGrund(x, fz.y + k.dach, z, k.dach + 4);
            if (boden !== null && boden > fz.y + AnazhRealm.PLAYER_STEP_UP) continue; // eine Wand
            if (boden === null && !this._nassAt(x, z, 0, fz.y)) continue; // ein Abgrund ohne Wasser
            // die Füße nie unter der Rad-Ebene (ein Boden tiefer ist Wasser-Grund unter einem schwimmenden Werk: er schwimmt)
            return { x, z, y: Math.max(boden !== null ? boden : fz.y, fz.y) + AnazhRealm.PLAYER_FOOT_OFFSET };
        }
        return null;
    }

    // Toggle: wenn nicht-mounted und Mount-Kandidat in Reichweite → mount.
    // Wenn schon mounted → dismount. Single-Pfad für die E-Taste.
    toggleMountAtPlayer() {
        if (this.state.player.mountedArch !== null && this.state.player.mountedArch !== undefined) {
            return this.dismountArchitecture();
        }
        // das nächste Werk, das den Leib trägt: ein Gefährt (fahrbar) oder ein Sitz (sitzbar, bauen.K5) — das nähere gewinnt
        const fahr = this._findNearestAffordanceEntry("moveable", AnazhRealm.MOUNT_RANGE_M);
        const sitz = this._findNearestAffordanceEntry("sitzbar", AnazhRealm.MOUNT_RANGE_M);
        const pm = this.state.playerMesh.position;
        const d2 = (e) =>
            e ? (e.position.x - pm.x) ** 2 + (e.position.y - pm.y) ** 2 + (e.position.z - pm.z) ** 2 : Infinity;
        const entry = d2(sitz) < d2(fahr) ? sitz : fahr;
        if (!entry) {
            this.log("Mount: kein fahrbares oder sitzbares Werk in Reichweite", "INFO");
            return { ok: false, reason: "none_in_range" };
        }
        return this.mountArchitecture(entry);
    }

    // DIE AUFSTANDSPUNKTE eines gerittenen Werks (m, Fahrt-Rahmen: vorn/hinten längs, quer zur Seite): ein
    // Studio-Fahrzeug trägt sie im Gesetz (vehicle-core fahrAufstand aus exportDrive.huelle — die Achsen fAx/rAx, die
    // halbe Spur, der Bauch und der Federweg je Rad, dieselbe Quelle wie die Probefahrt), ein Teile-Werk an Bug/Heck und
    // den Flanken seiner Hülle (die halbe Spanne, gedeckelt 0.8..3 m) — starr: seine Räder federn nicht einzeln (hub 0).
    _rittAufstand(entry) {
        const sc = Number.isFinite(entry.scale) ? entry.scale : 1;
        const fzg = entry._fahrAchseX ? this._fahrzeugGesetzFor(entry) : null;
        const h = fzg && fzg.drive ? fzg.drive.huelle : null;
        const auf = h ? AnazhRealm._fahrSchrittGesetz().vc.fahrAufstand(h, sc) : null;
        if (auf) return auf;
        const half = Number.isFinite(entry._rideHalfLen) ? entry._rideHalfLen : 1;
        // ohne Hülle kein Motorraum: das Wasser bremst das Teile-Werk über seine Höhe, die Ansaugung fehlt (vehicle-core
        // fahrWasser — es treibt in jeder Tiefe)
        return { vorn: half, hinten: -half, quer: Math.max(0.6, half * 0.6), bauch: 0, hub: 0, dach: entry._rideDach };
    }

    // DIE EBENE DER RÄDER bei (x, z) in Fahrt-Richtung `fahrtYaw` (sin, cos): die vier Aufstandspunkte
    // (`_rittAufstand`) auf dem Boden-Gesetz → Höhe der Ebene unter dem Ursprung, Nick (Bug ab = +) und Wank (die
    // Flanke (cos, −sin) oben = +), alle aus DENSELBEN Proben. Das alte max() über Bug/Heck hob den Ursprung auf den
    // höchsten Punkt, und der Gelände-Nick kippte ihn dann noch einmal: am Hang schwebte der Wagen um halbe Länge ×
    // Steigung. null, wenn eine Probe fehlt. Leser: der Ritt ohne Fahr-Gesetz (`_rittSchritt`) und der Stand
    // (`_fahrzeugStand`); das Gesetz-Fahrzeug liest dieselbe Ebene im Kern (`fahrStand`).
    _rittEbene(entry, x, z, fahrtYaw) {
        // Welle L (Q13): die Ebene ist die des Kerns (vehicle-core fahrEbene — dieselbe, die der Fahr-Schritt fährt und
        // die Probefahrt liest): kein Bauch im Boden (über einer Kuppe trägt der Bauch, W5 — am Kamm (66, 60) lag er
        // 1,05 m im Boden), und an einer KANTE (Spalt, Klippe) trägt keine Ebene mehr (sie mittelte Rand und Grund).
        // Rahmen des Kerns: Bug-Gier = Fahrt − π/2; Nick hier Bug ab = +, Wank die Flanke (cos, −sin) oben = +. Ein Kern
        // ohne fahrEbene bricht laut (`_fahrSchrittGesetz`), nie still null.
        const { vc } = AnazhRealm._fahrSchrittGesetz();
        const eb = vc.fahrEbene(
            { auf: this._rittAufstand(entry) },
            this._werkBoden(entry),
            x,
            z,
            fahrtYaw - Math.PI / 2
        );
        return eb ? { y: eb.y, nick: -eb.steig, wank: eb.wank } : null;
    }

    // DER FAHR-SATZ eines gerittenen Werks (Welle L, Q13): der EINE Fahr-Schritt des Kerns (vehicle-core fahrGesetz) aus
    // seinem Profil — Studio-Rezept (das fahrprofil des Buchs) oder Teile-Werk (exportDrive aus der Hülle, das Tempo
    // emergent: vmax = Geh-Tempo × topSpeedMul, kAcc aus der Masse) — und den Aufstandspunkten des Werks. null NUR ohne
    // Lenk- und Zweispur-Gesetz: dann reitet der richtungs-folgende Ritt (Kreatur, Bein-Werk). Ein Gesetz-Werk ohne
    // Fahr-Schritt im Kern (alter Kern) oder ohne Fahr-Satz (fahrGesetz verwirft das Profil) bricht LAUT — vorher ritt es
    // still richtungs-folgend (Gegenprüfung 07.10.).
    _fahrSatz(entry, prof) {
        if (!entry || !prof || !prof.lenkung || !prof.zweispur) return null;
        const { vc } = AnazhRealm._fahrSchrittGesetz();
        const vmax =
            Number.isFinite(prof.vmax) && prof.vmax > 0
                ? prof.vmax
                : this.state.speed * (Number.isFinite(prof.topSpeedMul) ? prof.topSpeedMul : 1);
        const k = entry._fahrSatzKey;
        if (entry._fahrSatz && k && k.prof === prof && k.vmax === vmax) return entry._fahrSatz;
        entry._fahrSatz = vc.fahrGesetz(
            {
                zweispur: prof.zweispur,
                lenkung: prof.lenkung,
                vmax,
                kAcc: prof.kAcc,
                spur: prof.spur,
                cgH: prof.cgH,
                radR: prof.radR,
                spring: prof.spring,
                // die EINE Masse des Werks (physik K1, `_fahrMasse`): die Trägheit des Wasser-Terms im Kern
                masseKg: this._fahrMasse(entry, prof.zweispur.mass),
            },
            this._rittAufstand(entry)
        );
        if (!entry._fahrSatz) return AnazhRealm._kernPflichtBruch("vehicle:fahrGesetz (" + entry.type + ")");
        entry._fahrSatzKey = { prof, vmax };
        return entry._fahrSatz;
    }

    // DER BODEN unter den Rädern des Fahr-Schritts: das Boden-Gesetz; ein Werk, das das Wasser trägt (seine Gestalt,
    // `_fahrzeugGestalt`: Wasserlinie aus Hülle und Dichte des Kerns), reitet die EINE Wasser-Wahrheit am Körper
    // (`_koerperWasser(x, z, grund, gestalt)`, D4/D10): schwimmt es an diesem Punkt, liegt seine Unterkante auf Spiegel −
    // Linie — der Spiegel ist waagrecht, Nick und Wank folgen nie dem Seegrund; sonst steht es auf dem Grund (es watet,
    // dichter als Wasser sinkt es). Bis zur Integration las der Fahr-Schritt die Lauf-Fläche (`_waterRunSurfaceAt`, die
    // Familie wasser schnitt sie) mit einer eigenen Tauchtiefe — ein zweiter Wasser-Leser neben dem Körper. Je Werk EINE
    // Funktion (kein Abschluss je Schritt); ein Werk, das das Wasser nie trägt, fragt es nicht.
    _fahrBoden(entry) {
        const gestalt = this._fahrzeugGestalt(entry, this._vehicleProfile(entry));
        if (entry._fahrBodenFn && entry._fahrBodenGestalt === gestalt) return entry._fahrBodenFn;
        entry._fahrBodenGestalt = gestalt;
        const traegt = gestalt.linie !== Infinity;
        const boden = this._werkBoden(entry); // der Boden UNTER dem Werk, nie die Oberkante der Säule
        entry._fahrBodenFn = (x, z) => {
            const t = boden(x, z);
            if (!traegt || !Number.isFinite(t)) return t;
            this._koerperWasser(x, z, t, gestalt);
            return gestalt.lage.schwimmt ? gestalt.lage.unterkante : t;
        };
        return entry._fahrBodenFn;
    }

    // DER STAND eines Studio-Fahrzeugs (W5): es parkt, wie es fährt — auf der Ebene seiner vier Räder (Höhe, Nick,
    // Wank aus `_rittEbene`); ohne ihn stand der Wagen waagrecht, am Hang hob ein Rad 0,3 m ab. Der Rahmen (längs x)
    // und die Fahrt-Richtung (Template-Gier + π/2) stehen ab hier am Eintrag. Leser: der Spawn (jeder Pfad: Hotbar,
    // DSL, Wiederherstellen); der Abstieg trägt die letzte Ritt-Pose (im Flug: `_fahrNachlauf` bis auf den Boden).
    _fahrzeugStand(entry) {
        const fzg = this._fahrzeugGesetzFor(entry);
        if (!fzg || !fzg.drive || !fzg.drive.huelle) return;
        entry._fahrAchseX = true;
        entry._rideYaw = (Number.isFinite(entry.rotationY) ? entry.rotationY : 0) + Math.PI / 2;
        const eb = this._rittEbene(entry, entry.position.x, entry.position.z, entry._rideYaw);
        if (!eb) return;
        const kl = AnazhRealm._fahrSchrittGesetz().S.ebeneMax; // die Ebenen-Klammer des Kerns (NaN-/Sprung-Wand)
        entry.position.y = eb.y + 0.5;
        entry._terrainPitchZiel = eb.nick;
        entry._terrainRollZiel = eb.wank;
        entry._rideTerrainPitch = Math.max(-kl, Math.min(kl, eb.nick));
        entry._rideRoll = Math.max(-kl, Math.min(kl, eb.wank));
    }

    // Die Template-Gier zu einer Fahrt-Richtung (sin, cos): ein Studio-Fahrzeug liegt längs x (Bug +x) — R_y(φ)
    // trägt +x nach (cos φ, −sin φ), also φ = Fahrt − π/2; ein Teile-Werk fährt in +z (φ = Fahrt).
    _rittGier(entry, fahrtYaw) {
        return entry._fahrAchseX ? fahrtYaw - Math.PI / 2 : fahrtYaw;
    }

    // Die Pose des Gruppen-Pfads (Teile-Werk): Basis bei position.y − 0.5 (wie `_rebuildArchitectureMesh` und die
    // Instanz-Matrix) + Squat; Nick und Wank drehen im Körper NACH der Gier (Euler mit Y zuerst, wie T·R_y·R_x·R_z) —
    // die Ordnung XYZ kippte den Nick um die WELT-x-Achse: in Ost-Fahrt wurde er ein Wank.
    _rittMeshPose(entry) {
        const m = entry.mesh;
        if (!m) return;
        m.position.set(
            entry.position.x,
            entry.position.y - 0.5 + (Number.isFinite(entry._rideHeave) ? entry._rideHeave : 0),
            entry.position.z
        );
        const rp =
            (Number.isFinite(entry._ridePitch) ? entry._ridePitch : 0) +
            (Number.isFinite(entry._rideTerrainPitch) ? entry._rideTerrainPitch : 0);
        const rr =
            (Number.isFinite(entry._rideRoll) ? entry._rideRoll : 0) +
            (Number.isFinite(entry._rideKurvenRoll) ? entry._rideKurvenRoll : 0);
        const ry = Number.isFinite(entry._rideYaw) ? this._rittGier(entry, entry._rideYaw) : m.rotation.y;
        // Längs x: der Nick (Bug ab = +) dreht um z gegen den Sinn, der Wank um x; längs z: Nick um x, Wank um z.
        if (entry._fahrAchseX) m.rotation.set(rr, ry, -rp, "YZX");
        else m.rotation.set(rp, ry, rr, "YXZ");
    }

    // DER RITT IM SIM-SCHRITT (Welle L, Q1 — Befund 06.10.: der Ritt schrieb den Sitz NACH der Interpolation auf das
    // interpolierte Spieler-Mesh; der Akkumulator hielt das für einen Teleport und übernahm die nachhinkende Lage als
    // Sim-Wahrheit — 114 von 114 Frames, 25,95 m simuliert gegen 10,27 m gefahren). Alles, was den Ritt BEWEGT, läuft
    // in `_stepFixedSim` (nach der Bewegung, auf der Sim-Lage): der Eintrag folgt dem Reiter in x/z, der Reiter sitzt
    // (pm.y = Sitz, VOR der Interpolation). Ein GESETZ-FAHRZEUG (Welle L, Q13) steht, wie der EINE Fahr-Schritt des Kerns
    // es eben an dieser Lage stellte (`_loopPlayerMovement`: Ebene der Räder, ballistische Vertikale, Gier, Federn,
    // Rad-Winkel) — der Stamm integriert davon nichts mehr. Ein Werk ohne Fahr-Gesetz (Kreatur-Ritt, Bein-Werk) steht
    // auf der Ebene seiner Aufstandspunkte (oder schwimmt) und folgt mit der Gier der Fahrt.
    _rittSchritt(dt) {
        const pl = this.state.player;
        const archId = pl ? pl.mountedArch : null;
        if (archId === null || archId === undefined) return;
        const entry =
            this._mountedEntry && this._mountedEntry.id === archId
                ? this._mountedEntry
                : (this.state.architectures || []).find((e) => e.id === archId);
        if (!entry) return; // der Frame-Tick steigt ab (das Werk ist verschwunden)
        this._mountedEntry = entry;
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        if (!pm) return;
        const tick = Number.isFinite(dt) && dt > 0 ? Math.min(0.1, dt) : AnazhRealm.FIXED_DT;
        // HORIZONTAL führt der REITER (der Kontakt-Löser setzte seine Lage); die Architektur folgt in x/z.
        entry.position.x = pm.x;
        entry.position.z = pm.z;
        this._blockerBewegt(entry);
        const sitz = Number.isFinite(entry._sitzHeight) ? entry._sitzHeight : AnazhRealm.MOUNT_FOLLOW_HEIGHT;
        const rideProf = this._vehicleProfile(entry);
        // `_afloat` = schwimmt das Gefährt in DIESEM Schritt (am Ursprung, dieselbe Wahrheit wie der Boden des Fahr-
        // Schritts: `_koerperWasser` mit seiner Gestalt, D4/D10): _stepCharacter (4b) liest es als Boots-Gate der
        // Strömungs-Advektion — der Reiter schwimmt nie selbst, das Boot folgt ihm.
        // BENANNT GEFALLEN (Welle L, Q13): die Schwimm-Feder — exportDrive.spring {k, c} federte vorher die Aufsitz-Höhe
        // eines schwimmenden Werks gegen die Wasserlinie (ein zweiter Vertikal-Integrator neben dem Kern). Jetzt reitet ein
        // Gesetz-Werk die Wasserlinie auf der ballistischen Vertikale des Fahr-Schritts (`_fahrBoden`), seine Feder federt
        // den Aufbau (Nick · Wank · Hub); ein Werk ohne Fahr-Gesetz folgt ihr mit exp-k 8.
        entry._afloat = false;
        const t0 = this._werkBoden(entry)(pm.x, pm.z);
        const gestalt = this._fahrzeugGestalt(entry, rideProf);
        if (gestalt.linie !== Infinity && Number.isFinite(t0)) {
            this._koerperWasser(pm.x, pm.z, t0, gestalt);
            entry._afloat = gestalt.lage.schwimmt;
        }
        // Die Höhe des Eintrags trägt die Platzierungs-Konvention (die Basis liegt bei position.y − 0.5:
        // `_archEntryWorldMatrix`, `_rebuildArchitectureMesh`, die Blocker). Ein Studio-Fahrzeug steht mit seiner Ebene
        // y = 0 auf dem Boden, ein Teile-Werk mit seiner Unterkante (−_compoundBottomY · Skala).
        const clear = entry._fahrAchseX ? 0 : Number.isFinite(entry._groundClear) ? entry._groundClear : 0;
        const fahrG = this._fahrSatz(entry, rideProf);
        if (fahrG) {
            // DAS GESETZ-FAHRZEUG: Höhe, Lage (Nick Bug ab = +, Wank die Flanke (cos, −sin) oben = +), Federn und Rad-
            // Winkel sind der Zustand des Fahr-Schritts. Die Kurven-Feder neigt den Aufbau nach außen wie die Probefahrt.
            // Ohne Bewegungs-Schritt (frisch aufgesessen) stellt der Kern den Wagen an der Lage auf (Stand ohne Zeit).
            let fz = entry._fahr;
            if (!fz) {
                const { vc } = AnazhRealm._fahrSchrittGesetz();
                fz = entry._fahr = vc.fahrZustand(
                    pm.x,
                    pm.z,
                    (Number.isFinite(entry._rideYaw) ? entry._rideYaw : 0) - Math.PI / 2
                );
                vc.fahrStand(fz, fahrG, this._fahrBoden(entry), 0);
            }
            if (!Number.isFinite(fz.y)) {
                // Ungebauter Chunk: der Reiter führt, das Werk hängt am Sitz.
                entry.position.y = pm.y - sitz + 0.5;
                entry._rideY = null;
                return;
            }
            entry.position.y = fz.y + 0.5 + clear;
            entry._rideY = entry.position.y;
            entry._rideVy = fz.vy;
            entry._terrainPitchZiel = -fz.steig;
            entry._terrainRollZiel = fz.wank;
            entry._rideTerrainPitch = -fz.steig;
            entry._rideRoll = fz.wank;
            entry._ridePitch = -fz.fNick;
            entry._rideKurvenRoll = fz.fWank;
            entry._rideHeave = fz.fHub;
            entry._rideSp = fz.speed;
            if (Number.isFinite(entry._rideYaw)) entry.rotationY = this._rittGier(entry, entry._rideYaw);
            // Die Fahr-Phase ist der Rad-Winkel des Kerns (Weg/radR, rückwärts rückwärts); applyJoint multipliziert den
            // rad-Kanal ×1.6.
            entry._ridePhase = fz.wheelAng / 1.6;
            pm.y = entry.position.y - 0.5 + sitz + fz.fHub;
            // Feld-nativ: das Gefährt führt die Vertikale → den Feld-Fall-Zustand nullen.
            this.state._fieldVy = 0;
            return;
        }
        // DER RITT OHNE FAHR-GESETZ: die Räder (Hufe) stehen auf der Ebene durch die Aufstandspunkte (`_rittEbene`, die
        // Ebene des Kerns); schwimmt das Werk über diesem Grund (die Wahrheit am Körper mit seiner Gestalt — W-W2: ohne den
        // Grund der Ebene war der Rand-Streifen eines Sees blind), liegt seine Unterkante auf Spiegel − Linie, und der
        // Spiegel ist waagrecht: Nick und Wank folgen nie dem Seegrund (F-D5: 25° Bug-ab).
        let groundY = t0;
        if (Number.isFinite(groundY) && Number.isFinite(entry._rideYaw)) {
            const eb = this._rittEbene(entry, pm.x, pm.z, entry._rideYaw);
            if (eb) {
                groundY = eb.y;
                entry._terrainPitchZiel = eb.nick;
                entry._terrainRollZiel = eb.wank;
            }
        }
        if (gestalt.linie !== Infinity && Number.isFinite(groundY)) {
            this._koerperWasser(pm.x, pm.z, groundY, gestalt);
            entry._afloat = gestalt.lage.schwimmt;
            if (entry._afloat) {
                groundY = gestalt.lage.unterkante;
                entry._terrainPitchZiel = 0;
                entry._terrainRollZiel = 0;
            }
        }
        if (Number.isFinite(groundY)) {
            const targetY = groundY + 0.5 + clear;
            // An Land führt der Boden die Hufe EXAKT; schwimmend folgt die Aufsitz-Höhe der Wasserlinie mit exp-k 8.
            if (!entry._afloat || !Number.isFinite(entry._rideY)) entry.position.y = targetY;
            else entry.position.y = entry._rideY + (targetY - entry._rideY) * (1 - Math.exp(-8 * tick));
            entry._rideVy = 0;
            entry._rideY = entry.position.y;
            pm.y = entry.position.y - 0.5 + sitz;
            this.state._fieldVy = 0;
        } else {
            // Ungebauter Chunk: der Reiter führt, das Werk hängt am Sitz.
            entry.position.y = pm.y - sitz + 0.5;
            entry._rideY = null;
        }
        // Die Gier folgt der Fahrt (exp-k + Fahrt-Gate aus dem EINEN fail-closed Leser _fahrGesetz); entry.rotationY ist
        // die EINE Gier-Wahrheit des TEMPLATES (Persistenz, Instanz-Matrix, Blocker).
        const v = this.state.playerVel;
        const vx = v ? v.x() : 0;
        const vz = v ? v.z() : 0;
        const sp = Math.hypot(vx, vz);
        const _fahrG = AnazhRealm._fahrGesetz();
        if (sp > _fahrG.he.fahrtGate) {
            const targetYaw = Math.atan2(vx, vz);
            let cur = Number.isFinite(entry._rideYaw) ? entry._rideYaw : targetYaw;
            let d = targetYaw - cur;
            while (d > Math.PI) d -= 2 * Math.PI;
            while (d < -Math.PI) d += 2 * Math.PI;
            cur += d * (1 - Math.exp(-_fahrG.he.yawFolgeK * tick));
            entry._rideYaw = cur;
            entry.rotationY = this._rittGier(entry, cur);
        }
        // Die Fahr-Phase wächst mit dem WEG (Hufe ohne Rad-Radius: Konstante 2.2).
        entry._ridePhase = (entry._ridePhase || 0) + sp * tick * 2.2;
        entry._rideSp = sp;
        // Ohne Fahr-Gesetz keine Aufbau-Feder; die Lage liegt in der Ebene der Aufstandspunkte (die Klammer ist die NaN-/
        // Sprung-Wand: die Ebenen-Klammer des Kerns, FAHR.schritt.ebeneMax).
        const kl = AnazhRealm._fahrSchrittGesetz().S.ebeneMax;
        entry._ridePitch = 0;
        entry._rideKurvenRoll = 0;
        entry._rideHeave = 0;
        entry._rideTerrainPitch = Number.isFinite(entry._terrainPitchZiel)
            ? Math.max(-kl, Math.min(kl, entry._terrainPitchZiel))
            : 0;
        entry._rideRoll = Number.isFinite(entry._terrainRollZiel)
            ? Math.max(-kl, Math.min(kl, entry._terrainRollZiel))
            : 0;
    }

    // DIE TIEFE AM WAGEN (Schau-2 wasser-wahrheit): so tief steht die Unterkante des Fahr-Zustands (`fz.y`, die Ebene der
    // Räder bzw. die Unterkante der schwimmenden Hülle) in der EINEN Wasser-Wahrheit am Körper (`_koerperWasser` über dem
    // Grund des Wagens — seiner eigenen Unterkante, nie der obersten Fläche: unter Fels trägt die Decke kein Wasser, ein Wagen
    // in einer Höhle unter dem See steht trocken, wie der Körper) — der Wasser-Term des Fahr-Schritts (vehicle-core
    // fahrKraefte `e.tiefe`). Bis V18.537 kannte der Fahr-Schritt kein Wasser: der GT fuhr 19 m durch 0,61 m Wasser mit 43 km/h.
    _fahrTiefe(fz) {
        if (!fz || !Number.isFinite(fz.y)) return 0;
        const spiegel = this._koerperWasser(fz.x, fz.z, fz.y);
        return spiegel > fz.y ? spiegel - fz.y : 0;
    }

    // DER AUFTRIEB (Archimedes, physik K1): der Anteil seines Volumens, mit dem ein Körper der Dichte rho (kg/m³) im Wasser
    // liegt — rho / ρ des Wassers (die Zeile wasser der Stoff-Tafel, `_stoff`, stoffe.K1: sie IST der Eintrag des Fahr-Kerns
    // FAHR.wasser.rho); ≤ 1 trägt ihn das Wasser, darüber sinkt er. Die EINE Schwelle des Schwimmens und der Bezug jeder
    // Wasserlinie: das Gefährt (`_vehicleProfile`, `_fahrzeugGestalt`) und der Leib (`_leibGetragen`). Vorher die Dichte des
    // Wassers auf der Tag-Skala (WASSER_DICHTE_TAG 0,55: holz 0,4 schwamm).
    _eintauchAnteil(rho) {
        return rho / this._stoff("wasser").rho;
    }

    // DIE HAFTUNG AM WAGEN (fahrzeug.K1; feld.K1, die Wetter-Kette Sturm → Regen-Feld → Nässe → Grip): μ des Reifens auf dem
    // Boden unter dem Fahr-Zustand, der Boden-Faktor des Reibkreises im Fahr-Schritt (vehicle-core fahrKraefte `e.haft`, Bezug
    // der Asphalt des Labors, μ 1). Die Zahlen trägt die EINE Stoff-Zeile (`_stoff`: `muRad` trocken, `muRadNass` voll nass), die
    // Gewichte tragen die Schichten, die den Boden malen: der Grund (`_terrainMaterialAt`, was der Spieler beim Graben bekommt),
    // darüber die Wiese als gras — dieselbe Zeile, auf der Huf und Schritt stehen (`_kontaktStoffAt`) — mit dem Grün der gebauten
    // Boden-Karte (`_bodenSichtAt` … `gruen`, die Wache, unter der der Halm wächst und das Grün gemalt wird), darüber der Weg
    // als erde mit dem Pfad-Feld (`_pfadFeldAt`, unter dem die Erde gemalt und der Halm gedünnt wird). Trocken bis nass nach der EINEN Nässe der Welt (`state.naesse`, EIN Schreiber `_naesseTakt`), nie
    // nach dem Wetter-Wort — wird sie festgehalten, greift der Reifen wie trocken (gate:fahr-leben W). Bis 24.10. reichte die Welt
    // trocken μ 1 auf jeden Boden, nass 0,7 (`NAESSE.haft`).
    _fahrHaft(fz) {
        const n = Math.min(1, Math.max(0, this.state.naesse || 0));
        const mu = (stoff) => {
            const z = this._stoff(stoff, "das Rad auf „" + stoff + "“ greift nicht");
            if (z && z.muRad > 0) return z.muRad + (z.muRadNass - z.muRad) * n;
            this._bruchMelden("STOFF-ZEILE ohne Haftung: das Rad auf „" + stoff + "“ greift wie auf Asphalt");
            return 1;
        };
        const aus = {};
        const gruen = this._bodenSichtAt(fz.x, fz.z, aus) === null ? 0 : aus.gruen;
        const pfad = this._pfadFeldAt(fz.x, fz.z, fz.y);
        let m = mu(this._terrainMaterialAt(fz.x, fz.z, fz.y));
        if (gruen > 0) m += (mu("gras") - m) * gruen;
        if (pfad > 0) m += (mu("erde") - m) * pfad;
        return m;
    }

    // DER WIND AM WAGEN (wetter.K5): der EINE Wind am Ort des Fahr-Zustands (`_windAt` auf der Uhr des Sim-Schritts, nie der
    // Bild-Uhr: Lockstep und Replay) in m/s als Welt-Vektor — der Kern (vehicle-core fahrKraefte `e.wind`) legt ihn quer auf die
    // Flanke; ohne Wind fährt der Wagen wie im Lab.
    _fahrWind(fz) {
        const w = this._windAt(fz.x, fz.z, this.state._simZeit);
        return { x: w.x * w.ms, z: w.z * w.ms };
    }

    // DER FAHRER (fahrzeug.K2): wer am Steuer des gerittenen Gesetz-Wagens eine Route trägt (`fahrerSetzen`, die Punkte einer
    // Route über das Wegenetz, `_wegenetzRoute`), schreibt am Kopf jedes Sim-Schritts Gas, Bremse und Lenkung in die Verb-Tafel
    // (`_verbTafelSammeln`) — dieselben Felder wie Tastatur und Pad, gefahren vom EINEN Fahr-Schritt des Kerns, nie ein Teleport.
    // Die Lenkung zielt auf den Punkt der Route `ld0 + ldV·v` voraus (die Bahn eines Bogens durch ihn, `atan(2·L·sin α / d)`,
    // geteilt durch den Einschlag, den die Lenksäule bei diesem Tempo trägt); das Tempo ist vmax, gedeckelt von jeder Kurve
    // in Sicht (`sichtM`): so schnell, wie ihr Bogen den Anteil `quer` des Reibkreises (μ des Bodens unter dem Rad, `_fahrHaft`)
    // und des Einschlags trägt, und so früh gebremst, wie der Anteil `brems` reicht; am Ende hält er. `F.s` (Weg auf der Route),
    // `F.quer` (Abstand zu ihr) und die Zählung des Takts (`F.takte`, `F.tempo`, `F.fest`) lesen die Linse und wer der Fahrt folgt.
    fahrerSetzen(pts) {
        const D = AnazhRealm.FAHRER;
        const P = [];
        for (const q of pts || [])
            if (!P.length || Math.hypot(q.x - P[P.length - 1].x, q.z - P[P.length - 1].z) > 0.5)
                P.push({ x: q.x, z: q.z });
        if (P.length < 2) return (this._fahrer = null);
        // DIE LINIE DES FAHRERS: die Route je Meter, gemittelt über ±kurveM (an den Enden das symmetrische Stück) — der Knick
        // einer Gasse wird der Bogen, den die Drehung über ±kurveM misst (am Knick schoss er über den Bogen hinaus und kroch zurück)
        const M = [P[0]];
        for (let i = 1; i < P.length; i++) {
            const [a, b] = [P[i - 1], P[i]];
            const n = Math.ceil(Math.hypot(b.x - a.x, b.z - a.z));
            for (let t = 1; t <= n; t++) M.push({ x: a.x + ((b.x - a.x) * t) / n, z: a.z + ((b.z - a.z) * t) / n });
        }
        const sx = [0];
        const sz = [0];
        for (const q of M) {
            sx.push(sx[sx.length - 1] + q.x);
            sz.push(sz[sz.length - 1] + q.z);
        }
        P.length = 0;
        for (let i = 0; i < M.length; i++) {
            const w = Math.min(D.kurveM, i, M.length - 1 - i);
            P.push({ x: (sx[i + w + 1] - sx[i - w]) / (2 * w + 1), z: (sz[i + w + 1] - sz[i - w]) / (2 * w + 1) });
        }
        const s = [0];
        const th = [];
        for (let i = 1; i < P.length; i++) {
            s.push(s[i - 1] + Math.hypot(P[i].x - P[i - 1].x, P[i].z - P[i - 1].z));
            let t = Math.atan2(P[i].z - P[i - 1].z, P[i].x - P[i - 1].x);
            if (th.length) t += Math.round((th[th.length - 1] - t) / (2 * Math.PI)) * 2 * Math.PI;
            th.push(t);
        }
        // die Krümmung je Punkt: die Drehung der Route über ±kurveM, je Meter (ein Zickzack hebt sich auf, eine Kehre nicht)
        const richtung = (u) => {
            let [i, j] = [0, th.length - 1];
            while (i < j) {
                const m = (i + j + 1) >> 1;
                if (s[m] < u) i = m;
                else j = m - 1;
            }
            return th[i];
        };
        const k = s.map((u) => Math.abs(richtung(u + D.kurveM) - richtung(u - D.kurveM)) / (2 * D.kurveM));
        return (this._fahrer = {
            pts: P,
            bogen: s,
            k,
            i: 0,
            s: 0,
            quer: 0,
            ende: false,
            lang: s[s.length - 1],
            takte: 0,
            tempo: Array(11).fill(0),
            fest: [],
            anker: 0,
            steht: 0,
        });
    }
    _fahrerSchritt(T) {
        const F = this._fahrer;
        const ent = this._mountedEntry;
        const z = ent && ent._fahr;
        const G = z && this._fahrSatz(ent, this._vehicleProfile(ent));
        if (!G || !Number.isFinite(z.x)) return;
        const D = AnazhRealm.FAHRER;
        const [P, S] = [F.pts, F.bogen];
        const p = this.state.playerMesh.position;
        let best = Infinity;
        for (let i = F.i; i < Math.min(P.length - 1, F.i + 40); i++) {
            const [a, b] = [P[i], P[i + 1]];
            const [dx, dz] = [b.x - a.x, b.z - a.z];
            const l2 = dx * dx + dz * dz;
            const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.z - a.z) * dz) / l2));
            const d = (p.x - a.x - dx * t) ** 2 + (p.z - a.z - dz * t) ** 2;
            if (d < best) [best, F.i, F.s] = [d, i, S[i] + t * Math.sqrt(l2)];
        }
        F.quer = Math.sqrt(best);
        const v = z.vlong;
        const ld = Math.min(D.ldMax, D.ld0 + D.ldV * Math.abs(v));
        let j = F.i;
        while (j + 1 < P.length - 1 && S[j + 1] < F.s + ld) j++;
        const u = Math.max(0, Math.min(1, (F.s + ld - S[j]) / Math.max(1e-6, S[j + 1] - S[j])));
        const dx = P[j].x + (P[j + 1].x - P[j].x) * u - p.x;
        const dz = P[j].z + (P[j + 1].z - P[j].z) * u - p.z;
        const alpha = Math.atan2(
            -dx * Math.sin(z.yaw) - dz * Math.cos(z.yaw),
            dx * Math.cos(z.yaw) - dz * Math.sin(z.yaw)
        );
        const delta = Math.atan((2 * G.L * Math.sin(alpha)) / Math.max(1, Math.hypot(dx, dz)));
        T.lenken = Math.max(-1, Math.min(1, (delta * (1 + Math.abs(z.speed || 0) * G.sfK)) / G.maxSteer));
        const mu = this._fahrHaft(z) * G.g;
        // die Kurve deckelt das Tempo zweimal: der Reibkreis (v² · κ ≤ quer · μ·g) und die Lenksäule, deren Einschlag mit dem
        // Tempo sinkt (lenk · maxSteer / (1 + v · sfK) muss den Bogen atan(κ · L) tragen) — nie unter das Kriechen (`kriechMs`:
        // im Stand dreht kein Rad den Wagen)
        const vKurve = (k) => {
            const kk = Math.max(k, 1e-4);
            const lenk = ((D.lenk * G.maxSteer) / Math.atan(kk * G.L) - 1) / G.sfK;
            return Math.max(D.kriechMs, Math.min(Math.sqrt((D.quer * mu) / kk), lenk));
        };
        F.ende = F.s >= F.lang - D.haltM;
        // auch der Bogen zurück auf die Route, gemessen auf mindestens `bogenM` (auf dem kurzen Blick des Kriechens hielte er
        // sich selbst im Schritt: langsam → nah → steil → langsam)
        let soll = F.ende
            ? 0
            : Math.min(G.vmax, vKurve((2 * Math.abs(Math.sin(alpha))) / Math.max(D.bogenM, Math.hypot(dx, dz))));
        for (let i = F.i + 1; i < P.length && S[i] - F.s < D.sichtM; i++) {
            const vk = i === P.length - 1 ? 0 : vKurve(F.k[i]);
            soll = Math.min(soll, Math.sqrt(vk * vk + 2 * D.brems * mu * Math.max(0, S[i] - F.s)));
        }
        const e = soll - v;
        T.gas = Math.max(0, Math.min(1, e / D.bandMs));
        T.bremse = v > D.bremsV ? Math.max(0, Math.min(1, -e / D.bandMs)) : 0;
        T.handbremse = F.ende;
        // DIE FAHRT ZÄHLT SICH im Sim-Takt: je Schritt das Tempo in Zehnteln von vmax (`F.tempo`), und wer vor dem Ende `festS`
        // lang keine `festM` auf der Route vorankommt, steckt fest (`F.fest`: wo, m auf der Route)
        F.takte++;
        F.tempo[Math.max(0, Math.min(10, Math.floor((10 * v) / G.vmax)))]++;
        if (F.s - F.anker >= D.festM || F.ende) [F.anker, F.steht] = [F.s, 0];
        else if (++F.steht === Math.round(D.festS / AnazhRealm.FIXED_DT)) F.fest.push(Math.round(F.s));
    }

    // DER NACHLAUF EINES ABGESTIEGENEN GESETZ-WAGENS (Welle L, Gegenprüfung 07.10.: `dismountArchitecture` stellte den Wagen
    // nicht ab — wer im Flug ausstieg, ließ ihn bis zum Reload in der Luft hängen, an der Klippe 4,80 m über seinem Boden).
    // Je Sim-Schritt trägt ihn die ballistische Vertikale des Kerns (vehicle-core fahrStand — dieselbe wie im Ritt), bis er
    // auf der Ebene seiner Räder steht; dann ruht er (Federn null, Lage der Ebene, Blocker an der Ruhe-Lage) und verlässt den
    // Nachlauf. Ein ungebauter Boden hält ihn, bis der Chunk steht; sitzt der Reiter wieder auf, führt der Ritt.
    _fahrNachlauf(dt) {
        const { vc } = AnazhRealm._fahrSchrittGesetz();
        const pl = this.state.player;
        for (const entry of this._fahrLos) {
            const fz = entry._fahr;
            if ((pl && pl.mountedArch === entry.id) || !fz || !entry._fahrSatz || !Number.isFinite(fz.y)) {
                this._fahrLos.delete(entry);
                continue;
            }
            // DER GESTOSSENE WAGEN RUTSCHT (das EINE Impuls-Gesetz): die Handbremse hält ihn, sein Hüllen-Kontakt trägt den
            // Stoß weiter (Bauwerke, Wagen, Leiber), seine Blocker ziehen mit. Ohne Fahrer tritt keiner die Bremse: im Kern ist
            // `brake` unter bremsV der Rückwärtsgang (die Taste S) — der leere Wagen fuhr damit rückwärts in den Spieler (K12:
            // mit dem Rückwärtsgang des Kerns 0,67 m tief, gate:fahr-leben L6).
            const rutscht = Math.hypot(fz.vlong || 0, fz.vlat || 0) > AnazhRealm.STOSS.ruheMs;
            if (rutscht) {
                const x0 = fz.x;
                const z0 = fz.z;
                vc.fahrKraefte(
                    fz,
                    { hand: true, tiefe: this._fahrTiefe(fz), haft: this._fahrHaft(fz), wind: this._fahrWind(fz) },
                    entry._fahrSatz,
                    dt
                );
                entry._rideYaw = fz.yaw + Math.PI / 2;
                const k = this._fahrHuelle(entry);
                if (k) {
                    const cyW = Math.cos(fz.yaw);
                    const syW = Math.sin(fz.yaw);
                    const vxW = fz.vlong * cyW - fz.vlat * syW;
                    const vzW = -fz.vlong * syW - fz.vlat * cyW;
                    const hk = this._fahrHuelleKontakt(entry, k, x0, z0, vxW, vzW, dt, false);
                    fz.x = hk.x;
                    fz.z = hk.z;
                    fz.vlong = hk.vx * cyW - hk.vz * syW;
                    fz.vlat = -hk.vx * syW - hk.vz * cyW;
                }
                entry.position.x = fz.x;
                entry.position.z = fz.z;
                this._blockerBewegt(entry); // sein Platz wandert (die Nachbarschaft fragt ihn direkt)
                entry.rotationY = this._rittGier(entry, entry._rideYaw);
                if (entry.blockerAABBs) {
                    this._populateBlockerAABBs(entry);
                    entry._blockerStampAt = null;
                }
            }
            vc.fahrStand(fz, entry._fahrSatz, this._fahrBoden(entry), dt);
            const clear = entry._fahrAchseX ? 0 : Number.isFinite(entry._groundClear) ? entry._groundClear : 0;
            entry.position.y = fz.y + 0.5 + clear;
            entry._rideY = entry.position.y;
            entry._rideVy = fz.vy;
            if (!fz.luft && !(Math.hypot(fz.vlong || 0, fz.vlat || 0) > AnazhRealm.STOSS.ruheMs)) {
                fz.vlong = fz.vlat = fz.yawRate = 0;
                // gelandet: er steht in der Ebene seiner Räder, die Federn ruhen
                fz.vy = 0;
                fz.fNick = fz.fNickV = fz.fWank = fz.fWankV = fz.fHub = fz.fHubV = 0;
                entry._rideVy = 0;
                entry._terrainPitchZiel = entry._rideTerrainPitch = -fz.steig;
                entry._terrainRollZiel = entry._rideRoll = fz.wank;
                if (entry.blockerAABBs) {
                    this._populateBlockerAABBs(entry);
                    entry._blockerStampAt = null;
                }
                this._fahrLos.delete(entry);
            }
            // der EINE Visual-Weg (call-Form wie im Abstieg: die A6-Wand des vehicle-drive-Gates liest die erste direkte
            // Instanz-Update-Bindung als die Tick-Zeile in _tickMountedMovement)
            if (entry.mesh) this._rittMeshPose(entry);
            else if (entry.instanced) this._archInstanceUpdate.call(this, entry);
        }
    }

    // DER RITT IM FRAME (Welle L, Q1): nur SICHT. Der Wagen steht, wo der Reiter gezeichnet wird — an der interpolierten
    // Lage (`_applyFixedInterpolation` lief davor): x/z vom Spieler-Mesh, die Höhe aus dem Sitz zurück (Basis = Sitz −
    // Sitz-Höhe − Heave + 0.5, die Umkehrung des Sim-Schritts). Der Frame-Tick schreibt NIE das Spieler-Mesh — sonst
    // hält der Akkumulator die Lage für einen Teleport. Dazu: Abstieg, wenn das Werk verschwand; der EINE Visual-Weg
    // (Gruppen-Pose + Gelenke ODER die Instanz-Matrix); die Blocker ziehen mit. Die Frame-Zeit trägt nichts mehr bei.
    _tickMountedMovement(_dt) {
        const archId = this.state.player.mountedArch;
        if (archId === null || archId === undefined) {
            this._mountedEntry = null;
            return;
        }
        const entry = (this.state.architectures || []).find((e) => e.id === archId);
        if (!entry) {
            // Architektur ist verschwunden (z. B. abgebaut) → auto-dismount
            this.state.player.mountedArch = null;
            this._mountedEntry = null;
            // FAHR-ABSCHLUSS (19.07.) — auch der Auto-Abstieg stellt die Sicht zurück.
            if (this.state._mountVorKamera) {
                this.setCameraMode(this.state._mountVorKamera);
                this.state._mountVorKamera = null;
            }
            return;
        }
        this._mountedEntry = entry;
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        if (!pm) return;
        // HORIZONTAL führt der REITER (die WASD-Physik = die EINE Bewegungs-Quelle, V18.150); die Architektur folgt in
        // x/z, die Höhe kommt aus dem Sitz (der Sim-Schritt setzte ihn aus der Ebene der Räder).
        entry.position.x = pm.x;
        entry.position.z = pm.z;
        this._blockerBewegt(entry);
        const sitz = Number.isFinite(entry._sitzHeight) ? entry._sitzHeight : AnazhRealm.MOUNT_FOLLOW_HEIGHT;
        entry.position.y = pm.y + 0.5 - sitz - (Number.isFinite(entry._rideHeave) ? entry._rideHeave : 0);
        // DIE GIER IM BILD wie die Lage (F1): zwischen den zwei jüngsten Sim-Zuständen um den Rest des Akkumulators — die
        // Sim-Gier stand je Bild um 0, 1 oder 2 Schritte weiter, der Wagen drehte im Bild ruckweise (Spielgang, Radeon, Kreis
        // 3 m/s: Ruck der Kamera gegen den Wagen p95 0,10 m je Bild). Die Chase-Cam liest den gezeichneten Wagen. Ein Aufruf
        // ohne Bild (eine Linse treibt den Ritt von Hand) zeichnet die Sim-Gier.
        const a = this.state._bildAlpha;
        this.state._bildAlpha = null;
        const [g0, g1] = [entry._gierVor, entry._rideYaw];
        if (Number.isFinite(g1))
            entry.rotationY = this._rittGier(
                entry,
                Number.isFinite(a) && Number.isFinite(g0)
                    ? g0 + Math.atan2(Math.sin(g1 - g0), Math.cos(g1 - g0)) * a
                    : g1
            );
        const v = this.state.playerVel;
        const sp = v ? Math.hypot(v.x(), v.z()) : 0;
        const fahrtGate = AnazhRealm._fahrGesetz().he.fahrtGate;
        // Visual sofort updaten (sonst lagt es einen Frame). Klassischer Group-Pfad
        // (Donor-/User-Bauplan) ODER — B2 — der EINE Instanz-Matrix-Update-Weg
        // (`_archInstanceUpdate`, foundry-bewusst) fürs Studio-Fahrzeug.
        if (entry.mesh) {
            // STEER_VIS.compound = "hub-yaw" — Feel .124; rad.front + _rideSteerYaw via _animateCompoundMotion.
            this._rittMeshPose(entry);
            const prof = this._vehicleProfile(entry);
            if (prof && prof.roles) {
                this._animateCompoundMotion(
                    entry.mesh,
                    prof.roles,
                    performance.now() / 1000,
                    entry._ridePhase,
                    sp > fahrtGate,
                    undefined,
                    Number.isFinite(entry._rideSteerYaw) ? entry._rideSteerYaw : undefined
                );
            }
        } else if (entry.instanced) {
            // STEER_VIS.instance = "entry-yaw" — Feel .124; do not yaw leaves; shared localMatrix sacred.
            this._archInstanceUpdate(entry);
        }
        // Blocker ziehen mit (dieselbe Quelle _populateBlockerAABBs; _stepCharacterStructures überspringt
        // riddenId). Schwellen-getaktet (>0.5 m / >0.1 rad) gegen Array-Churn; Absteigen stempelt final.
        if (entry.blockerAABBs) {
            const st = entry._blockerStampAt;
            const ry = Number.isFinite(entry.rotationY) ? entry.rotationY : 0;
            if (
                !st ||
                Math.abs(st.x - entry.position.x) > 0.5 ||
                Math.abs(st.z - entry.position.z) > 0.5 ||
                Math.abs(st.ry - ry) > 0.1
            ) {
                this._populateBlockerAABBs(entry);
                entry._blockerStampAt = { x: entry.position.x, z: entry.position.z, ry };
            }
        }
    }

    // ----- Welt-Reaktion: magnifying (Camera-FOV-Zoom) -----

    // Spieler hält Zoom-Geste (z. B. rechtsklick): wenn ein magnifying-Compound in Blick-Richtung in Reichweite ist, steht
    // das Fernglas (`_zoomActive`) — das FOV setzt der EINE Schreiber `_kamFov` (ZOOM_FOV_DEG), setZoomActive(false) löst es.
    // ALLE TASTEN LOS (die Tasten-Wand, V-k4): Fokus-Verlust, Unsichtbarkeit, Zeiger-Verlust und die Heimkehr aus dem Portal lösen
    // jede gehaltene Taste (state.keys) und jede gehaltene Aktion der Verb-Tafel — das Mahlen, den gespannten Bogen (er fällt, ohne zu
    // schießen: `_tickBogenZug`), den Zoom — die EINE Stelle, die die Eingabe auf „nichts gedrückt" setzt. Das Gamepad hält, was
    // es hält: sein Stand kommt je Bild neu (`_eingabeTakt`).
    _alleTastenLos() {
        const k = this.state.keys;
        if (k) for (const n in k) k[n] = false;
        const g = this.state.verbTafel.gehalten;
        for (const n in g) g[n] = false;
        if (this.state._zoomActive) this.setZoomActive(false);
    }

    setZoomActive(active) {
        // das Fernglas setzt nur mit einem magnifying-Target im Blick an und steht dann, bis Z losgelassen wird — idempotent: das
        // Auto-Repeat von Z kippt es nie (gate:fahr-leben T5 zoom)
        const st = this.state;
        st._zoomActive = !!active && !!st.camera && (st._zoomActive === true || this._hasMagnifyingInSight() === true);
        return st._zoomActive;
    }

    // Der Strahl des Fadenkreuzes (`_fadenkreuzStrahl`): trifft er ein Sub-Mesh einer magnifying-Architektur in
    // Reichweite?
    _hasMagnifyingInSight() {
        if (typeof THREE === "undefined") return false;
        const F = this._fadenkreuzStrahl();
        if (!F) return false;
        const meshes = [];
        for (const entry of this.state.architectures || []) {
            if (!entry.affordances || !entry.affordances.magnifying) continue;
            if (!entry.mesh) continue;
            entry.mesh.traverse((m) => {
                if (m.isMesh) meshes.push(m);
            });
        }
        if (meshes.length === 0) return false;
        if (!this._magRaycaster) this._magRaycaster = new THREE.Raycaster();
        this._magRaycaster.set(F.o, F.d);
        this._magRaycaster.far = AnazhRealm.MAGNIFYING_RAY_RANGE_M;
        const hits = this._magRaycaster.intersectObjects(meshes, false);
        return hits.length > 0;
    }

    // ----- Welt-Reaktion: focusing (Brennglas im Sonnenschein) -----

    // DAS BRENNGLAS-GESETZ (throttled in _tickAffordances; Welle L Folge): eine focusing-Architektur bündelt die SONNE durch
    // ihre Linse (jeder Teil, der die Tag-Sprache „transparent" trägt) in EINEN Brennpunkt je Linse — die Linsen-Mitte, um
    // 1,5 Linsen-Radien gegen das Licht versetzt (`_brennpunkte`; die Brennweite einer Glas-Kugel, n ≈ 1,5). Erwärmt wird
    // nur, wessen Körper den Brennpunkt trägt (`_traegtPunkt`: Grundriss und Höhe seiner Teile), nach dem Wärme-Gesetz seines
    // Stoffs (`_brennWaerme`, stoffe.K1); außerhalb kühlt es, nachts und ohne Sonne kühlt alles. Auf halbem Weg zur
    // Zünd-Temperatur glimmt es — der Spieler hört es, ehe es brennt —,
    // an der Schwelle entzündet es sich, das Feld unter ihm fängt Feuer (`_brandEntfachen`), und die Zerstörung nennt sich dem
    // Spieler (`_spielerSagt` + Journal, mit den Namen von Werk und Linse). Befund (Leben-Schau 07.10.): die Genesis-Plattform (Quarz-Kern auf Stein) ist nach der Tag-Sprache
    // ein Brennglas — sie erhitzte JEDES Brennbare im 4-m-Kreis, ohne Licht-Geometrie, ohne Abkühlung, auch nachts; die
    // Werkstatt-Eiche 2,4 m vor dem Spieler verbrannte nach 20 s Sonne, und das stand nur im Log (Architekturen 125 → 124).
    // Ein Brennpunkt im Leib der Linse oder darunter (der Kern der Plattform, das Wasser des Ziehbrunnens) erreicht niemanden.
    _tickFocusingAffordances(dt) {
        // Zündet erst auf stehender Bühne — sonst verbrennt Welt-Substanz im unspielbaren Boot. Headless steht
        // die Bühne sofort (direkte Tick-Aufrufe laufen unverändert).
        if (!this._buehneSteht()) return;
        const focusing = this._blockerMit("focusing");
        const sonne = this.state.weather === "sunny" ? this._sonnenRichtung() : null;
        const licht = sonne && sonne.y > 0 ? sonne : null;
        const punkte = [];
        if (licht) for (const fa of focusing) for (const p of this._brennpunkte(fa, licht)) punkte.push({ fa, p });
        const name = (e) => {
            const b = e && this.state.blueprints ? this.state.blueprints[e.type] : null;
            return String((b && b.label) || (e && e.type) || "?").split(/\s[·—(]/)[0];
        };
        const ignitions = [];
        // Das GERITTENE Gefährt brennt nie unter dem Reiter weg (sonst Auto-Dismount aus dem Nichts) —
        // Reiter + Gefährt sind EINS.
        // DIE BETROFFENEN (0710-10, Lehre 25): erwärmen kann sich nur, wer in Reichweite eines Brennglases steht — die Plätze um
        // jedes (`_blockerUmPlatz`) —, kühlen nur, wer warm ist (`warm`, die Menge dieses Takts); jeder andere Eintrag ginge
        // ohne Wirkung durch. In der Ordnung des Bestands (die Sätze und das Feuer in derselben Folge) — dieselben Urteile wie
        // die Schleife über ihn (gate:brennglas-takt, der alte Takt als Orakel). Vorher: jeder Eintrag je Takt (Wiese 1 578).
        const N = this._blockerNetz();
        const ziele = this._brennZiele || (this._brennZiele = []);
        ziele.length = 0;
        if (punkte.length)
            for (const fa of focusing)
                if (fa.position)
                    this._blockerUmPlatz(fa.position.x, fa.position.z, AnazhRealm.FOCUSING_HEAT_RANGE_M + 1e-6, ziele);
        for (const e of N.warm) {
            if (e._blockerGen !== N.gen) N.warm.delete(e);
            else ziele.push(e);
        }
        if (ziele.length > 1) {
            ziele.sort(AnazhRealm._nachBestand);
            let w = 1;
            for (let i = 1; i < ziele.length; i++) if (ziele[i] !== ziele[w - 1]) ziele[w++] = ziele[i];
            ziele.length = w;
        }
        for (const target of ziele) {
            const vorher = target.heatBuildup || 0;
            if (!(vorher > 0) && !punkte.length) continue; // kein Licht, nichts zu kühlen: der billigste Weg (Lehre 25)
            if (target.affordances && target.affordances.focusing) continue; // selbst nicht
            if (this._gerittenesWerk(target)) continue;
            const w = this._brennWaerme(target, punkte, focusing, dt);
            if (!w) continue;
            target.heatBuildup = w.dT;
            if (w.dT > 0) N.warm.add(target);
            else N.warm.delete(target);
            if (!w.quelle) continue;
            if (vorher < w.zuend / 2 && w.dT >= w.zuend / 2 && w.dT < w.zuend)
                this._spielerSagt(
                    `„${name(target)}" glimmt im Brennpunkt von „${name(w.quelle)}" — rück es aus dem Licht, sonst fängt es Feuer.`
                );
            if (w.dT >= w.zuend) ignitions.push({ t: target, quelle: w.quelle });
        }
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        for (const { t, quelle } of ignitions) {
            const d = pm ? Math.hypot(t.position.x - pm.x, t.position.z - pm.z) : null;
            this._spielerSagt(
                `Die Sonne entzündete durch „${name(quelle)}" „${name(t)}"${d != null ? ` (${Math.round(d)} m von dir)` : ""}.`
            );
            if (this.journalAppend) {
                this.journalAppend(
                    "loss",
                    AnazhRealm._datum`Die Sonne entzündete durch „${name(quelle)}" „${name(t)}".`,
                    {
                        type: t.type,
                        linse: quelle.type,
                    }
                );
            }
            this._brandEntfachen(t.position.x, t.position.z); // das Feuer fängt das Feld unter dem Werk (feld.K3#2)
            this.removeArchitecture(t);
        }
    }

    // DIE WÄRME IM BRENNPUNKT (stoffe.K1; rein, der Takt schreibt): ein Werk, dessen Körper einen Brennpunkt trägt, erwärmt
    // den Brennfleck seines Teils am Punkt — FOCUSING_FLECK_M3 dieses Stoffs, die Wärme ρ·V·c aus seiner Zeile der Stoff-Tafel
    // (`_stoff`) — mit der Leistung der Linse P = FOCUSING_SONNE_W_M2 · π r² · Sonnenhöhe; der Fleck gibt FOCUSING_VERLUST_W_K
    // an Luft und Körper ab. Seine Übertemperatur ΔT (`heatBuildup`, K) strebt exakt (die geschlossene Lösung je Schritt) gegen
    // P / H mit τ = ρ·V·c / H; außerhalb jedes Brennpunkts kühlt er mit dem Stoff seines Werks (`_werkStoff`) gegen 0, unter
    // FOCUSING_RUHE_K ist er kalt. Feuer fängt er an der Zünd-Temperatur seines Stoffs (`zuend`: T_zünd über der Luft,
    // `_temperaturAt`); ohne T_zünd erwärmt er sich nur. Vorher erwärmte sich jedes Werk mit der Tag-Achse brennbar ≥ 0,5 um
    // 0,05 je Sekunde und brannte nach 20 s, gleich aus welchem Stoff (gate:gegenstand-stoff --tafel: c und T_zünd ohne Folge).
    // → { quelle, dT, zuend } oder null (kalt, und kein Brennpunkt trifft es).
    _brennWaerme(target, punkte, focusing, dt) {
        const bp = this.state.blueprints && this.state.blueprints[target.type];
        const R2 = AnazhRealm.FOCUSING_HEAT_RANGE_M ** 2;
        const P0 = target.position;
        let [quelle, P, stoff] = [null, 0, null];
        if (bp && focusing.some((fa) => (fa.position.x - P0.x) ** 2 + (fa.position.z - P0.z) ** 2 <= R2))
            for (const { fa, p } of punkte) {
                if (!this._traegtPunkt(target, bp, p)) continue;
                [quelle, P] = [fa, AnazhRealm.FOCUSING_SONNE_W_M2 * Math.PI * p.r * p.r * p.sonne];
                const g = target.scale > 0 ? target.scale : 1;
                const [c, s] = [Math.cos(target.rotationY || 0), Math.sin(target.rotationY || 0)];
                let nah = Infinity;
                for (const t of bp.parts) {
                    const q = t.position || {};
                    const [lx, lz] = [(q.x || 0) * g, (q.z || 0) * g];
                    const d =
                        (P0.x + lx * c + lz * s - p.x) ** 2 +
                        (P0.y + (q.y || 0) * g - p.y) ** 2 +
                        (P0.z - lx * s + lz * c - p.z) ** 2;
                    if (d < nah && typeof t.material === "string") [nah, stoff] = [d, t.material];
                }
                break;
            }
        const vorher = target.heatBuildup || 0;
        const z = quelle || vorher > 0 ? this._stoff(stoff || this._werkStoff(target)) : null;
        if (!z) return null;
        const H = AnazhRealm.FOCUSING_VERLUST_W_K;
        let dT = P / H + (vorher - P / H) * Math.exp((-dt * H) / (z.rho * AnazhRealm.FOCUSING_FLECK_M3 * z.c));
        if (!quelle && dT < AnazhRealm.FOCUSING_RUHE_K) dT = 0;
        const zuend = z.tZuend > 0 ? z.tZuend - 273.15 - this._temperaturAt(P0.y) : Infinity;
        return { quelle, dT, zuend };
    }

    // Die Brennpunkte einer Linse in der Welt: je Teil, der die Tag-Sprache „transparent" trägt (die Schwelle der
    // focusing-Affordanz), seine Mitte (Eintrag + gedrehter, skalierter Teil-Ort) minus Licht × 1,5 Radien (Radius r = die
    // halbe waagrechte Ausdehnung des Teils), mit r und der Sonnenhöhe (die Leistung, `_brennWaerme`). `licht` = Richtung ZUR
    // Sonne.
    _brennpunkte(fa, licht) {
        const bp = this.state.blueprints && this.state.blueprints[fa.type];
        if (!bp || !Array.isArray(bp.parts) || !fa.position) return [];
        const T = AnazhRealm.AFFORDANCE_THRESHOLDS.focusing;
        const g = Number.isFinite(fa.scale) && fa.scale > 0 ? fa.scale : 1;
        const ry = Number.isFinite(fa.rotationY) ? fa.rotationY : 0;
        const c = Math.cos(ry);
        const s = Math.sin(ry);
        const out = [];
        for (const part of bp.parts) {
            if (!part || (this.computePartTags(part).transparent || 0) < T.transparentMin) continue;
            const pp = part.position || { x: 0, y: 0, z: 0 };
            const sz = part.size || { x: 1, y: 1, z: 1 };
            const sx = Math.abs(sz.x || 1);
            const r = (Math.max(sx, Math.abs(sz.z || sx)) / 2) * g;
            const f = 1.5 * r;
            const lx = (pp.x || 0) * g;
            const lz = (pp.z || 0) * g;
            out.push({
                x: fa.position.x + lx * c + lz * s - licht.x * f,
                y: fa.position.y + (pp.y || 0) * g - licht.y * f,
                z: fa.position.z - lx * s + lz * c - licht.z * f,
                r,
                sonne: licht.y,
            });
        }
        return out;
    }

    // Trägt der Körper eines Eintrags den Punkt p? Grundriss (der Kreis um die Mitte seiner Teile bis zur weitesten
    // waagrechten Ausdehnung) und Höhe seiner Teile, mit dem Eintrag skaliert und gedreht.
    _traegtPunkt(e, bp, p) {
        const bb = bp ? this._compoundBoundingBox(bp) : null;
        if (!bb || !e.position) return false;
        const g = Number.isFinite(e.scale) && e.scale > 0 ? e.scale : 1;
        const ry = Number.isFinite(e.rotationY) ? e.rotationY : 0;
        const mx = ((bb.min.x + bb.max.x) / 2) * g;
        const mz = ((bb.min.z + bb.max.z) / 2) * g;
        const cx = e.position.x + mx * Math.cos(ry) + mz * Math.sin(ry);
        const cz = e.position.z - mx * Math.sin(ry) + mz * Math.cos(ry);
        const r = (Math.max(bb.extent.x, bb.extent.z) / 2) * g;
        const y0 = e.position.y + bb.min.y * g;
        const y1 = e.position.y + bb.max.y * g;
        return (p.x - cx) ** 2 + (p.z - cz) ** 2 <= r * r && p.y >= y0 && p.y <= y1;
    }

    // ----- Welt-Reaktion: radiating (Resonanz wärmt das Gemüt) -----

    // Radiating-Tick: in Reichweite eines Strahlers steigen awe + peace sanft (~0.04/s, über ~10 s
    // spürbar); der erste Kontakt je Strahler schreibt eine Erinnerung (journalAppendOnce).
    // DER TAKT KOSTET DIE NÄHE (K54, Lehre 25): die Resonanz trifft nur den Spieler — gefragt werden die Strahler im Umkreis
    // ihrer größten Reichweite um ihn (RADIATING_RANGE_M × BROADCAST_RANGE_MULT, die Stärke eines Masts ist 0..1) und je
    // Strahler die Masten in seiner Relais-Reichweite (`_blockerUmPlatz` mit dem Namen, in der Ordnung des Bestands). Befund
    // (OMEN 1410-2, V18.546 Wiese): je Takt lief jeder Strahler gegen jeden Mast des Bestands — Strahler × Masten wuchs mit
    // der Welt (K16 Kristalle, K20 Kiefern als Masten), das Profil nannte 1,0–1,6 ms je Frame.
    _tickRadiatingAffordances(dt) {
        if (this._blockerMit("radiating").length === 0) return; // der billigste Filter zuerst
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        if (!pm) return;
        const emo = this.state.player && this.state.player.emotions;
        if (!emo) return;
        const baseRange2 = AnazhRealm.RADIATING_RANGE_M * AnazhRealm.RADIATING_RANGE_M;
        const baseStep = AnazhRealm.RADIATING_EMOTION_RATE_PER_SEC * dt;
        // W10 ext. — broadcasting-Relais: ein leitfähiger Mast in Reichweite
        // eines Strahlers verstärkt dessen Reichweite (Affordances komponieren).
        const relayRange = AnazhRealm.BROADCAST_RELAY_RANGE_M;
        const relayRange2 = relayRange * relayRange;
        const maxMult = AnazhRealm.BROADCAST_RANGE_MULT;
        // die Stärke einer Affordanz ist 0..1 (`computeAffordanceStrength`) — die Grenze der Reichweite steht auf ihr
        const strengthOf = (e, key) => {
            const s = e.affordanceStrength && e.affordanceStrength[key];
            return typeof s === "number" ? Math.max(0, Math.min(1, s)) : 1; // Altbestand ohne Snapshot → volle Wirkung
        };
        const radiating = this._strahlerNah || (this._strahlerNah = []);
        radiating.length = 0;
        const reichMax = AnazhRealm.RADIATING_RANGE_M * Math.max(1, maxMult);
        this._blockerUmPlatz(pm.x, pm.z, reichMax + 1e-6, radiating, "radiating");
        const broadcasting = this._strahlerMasten || (this._strahlerMasten = []);
        for (const ra of radiating) {
            if (!ra.position) continue;
            const dx = ra.position.x - pm.x;
            const dz = ra.position.z - pm.z;
            if (dx * dx + dz * dz > reichMax * reichMax * (1 + 1e-9)) continue; // jenseits jeder Reichweite: kein Mast gefragt
            // Der stärkste broadcasting-Mast in Relais-Reichweite verstärkt die Strahler-Reichweite:
            // mult = 1 + Mast-Stärke × (maxMult−1); range² × mult² → die lineare Reichweite wächst um mult.
            let bestMastStrength = 0;
            broadcasting.length = 0;
            this._blockerUmPlatz(ra.position.x, ra.position.z, relayRange + 1e-6, broadcasting, "broadcasting");
            for (const bc of broadcasting) {
                if (!bc.position) continue;
                const bdx = bc.position.x - ra.position.x;
                const bdz = bc.position.z - ra.position.z;
                if (bdx * bdx + bdz * bdz <= relayRange2) {
                    const ms = strengthOf(bc, "broadcasting");
                    if (ms > bestMastStrength) bestMastStrength = ms;
                }
            }
            const mult = 1 + bestMastStrength * (maxMult - 1);
            const range2 = baseRange2 * mult * mult;
            if (dx * dx + dz * dz > range2) continue;
            // W10 ext. Politur — die Emotion-Intensität skaliert mit der
            // Strahler-Stärke: ein starker Strahler badet kräftiger.
            const step = baseStep * strengthOf(ra, "radiating");
            emo.awe = Math.max(0, Math.min(1, (emo.awe || 0) + step));
            emo.peace = Math.max(0, Math.min(1, (emo.peace || 0) + step));
            this.journalAppendOnce(
                `radiating:${ra.id}`,
                "growth",
                `Eine strahlende Form schwingt nahe — ihre Resonanz wärmt das Gemüt.`,
                { architecture: ra.type, affordance: "radiating" }
            );
        }
    }

    // ----- Welt-Reaktion: balancing (eine gründende Form legt den Aufruhr) -----

    // Balancing-Tick: in Reichweite senkt der Ort chaos (Komplement zu radiating); Drain-Rate skaliert
    // mit der Compound-Stärke, erster Kontakt schreibt eine Erinnerung. Weniger chaos verlangsamt
    // zugleich die Kreaturen (chaos → Tempo).
    // Wie der Strahler-Takt fragt er nur die Nähe des Spielers (K54).
    _tickBalancingAffordances(dt) {
        if (this._blockerMit("balancing").length === 0) return;
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        if (!pm) return;
        const emo = this.state.player && this.state.player.emotions;
        if (!emo) return;
        const range2 = AnazhRealm.BALANCING_RANGE_M * AnazhRealm.BALANCING_RANGE_M;
        const baseStep = AnazhRealm.BALANCING_CHAOS_DRAIN_PER_SEC * dt;
        const balancing = this._balanceNah || (this._balanceNah = []);
        balancing.length = 0;
        this._blockerUmPlatz(pm.x, pm.z, AnazhRealm.BALANCING_RANGE_M + 1e-6, balancing, "balancing");
        for (const ba of balancing) {
            if (!ba.position) continue;
            const dx = ba.position.x - pm.x;
            const dz = ba.position.z - pm.z;
            if (dx * dx + dz * dz > range2) continue;
            const s = ba.affordanceStrength && ba.affordanceStrength.balancing;
            const strength = typeof s === "number" ? s : 1;
            emo.chaos = Math.max(0, Math.min(1, (emo.chaos || 0) - baseStep * strength));
            this.journalAppendOnce(
                `balancing:${ba.id}`,
                "growth",
                `Eine gründende Form ruht nahe — der Aufruhr im Gemüt legt sich.`,
                { architecture: ba.type, affordance: "balancing" }
            );
        }
    }

    // ----- Welt-Reaktion: lifting (ein Auftriebs-Feld trägt den Spieler) -----

    // Lifting-Tick: in Reichweite setzt der stärkste lifting-Compound state.player.liftingField; die
    // Physik wendet damit _liftVerticalVelocity an (analog playerUnderwater → _swimVerticalVelocity).
    // Wie der Strahler-Takt fragt er nur die Nähe des Spielers (K54).
    _tickLiftingAffordances() {
        const pl = this.state.player;
        if (!pl) return;
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        if (!pm || this._blockerMit("lifting").length === 0) {
            pl.liftingField = { active: false, strength: 0 };
            return;
        }
        const range2 = AnazhRealm.LIFTING_RANGE_M * AnazhRealm.LIFTING_RANGE_M;
        const lifting = this._hebeNah || (this._hebeNah = []);
        lifting.length = 0;
        this._blockerUmPlatz(pm.x, pm.z, AnazhRealm.LIFTING_RANGE_M + 1e-6, lifting, "lifting");
        let best = 0;
        for (const li of lifting) {
            if (!li.position) continue;
            const dx = li.position.x - pm.x;
            const dz = li.position.z - pm.z;
            if (dx * dx + dz * dz > range2) continue;
            const s = li.affordanceStrength && li.affordanceStrength.lifting;
            const strength = typeof s === "number" ? s : 1;
            if (strength > best) best = strength;
        }
        pl.liftingField = { active: best > 0, strength: best };
    }

    // DER TACHO (Leben-Schau 2, fahr-bahn — Befund: im Spiel kein Tacho, die Probefahrt zeigt ihn): im Sattel eines Gesetz-
    // Wagens zeigt #fahr-tacho die km/h seines Fahr-Zustands (|vlong| × vehicle:FAHR.kmh — dieselbe Zahl wie der Tacho der
    // Probefahrt) und darunter die Fahr-Tasten (`_fahrTastenZeile`); ohne Ritt ist er fort. Das DOM wird nur geschrieben,
    // wenn die Zahl oder die Sichtbarkeit wechselt.
    _fahrAnzeige() {
        if (typeof document === "undefined") return;
        const el = this._fahrTachoEl || (this._fahrTachoEl = document.getElementById("fahr-tacho"));
        if (!el) return;
        const pl = this.state.player;
        const e = pl && pl.mountedArch != null ? this._mountedEntry : null;
        const fz = e && e._fahrSatz && e._fahr && e.id === pl.mountedArch ? e._fahr : null;
        if (!fz) {
            if (!el.hidden) el.hidden = true;
            this._fahrTachoKmh = null;
            return;
        }
        const proKmh = AnazhRealm._fahrSchrittGesetz().vc.FAHR.kmh;
        if (!Number.isFinite(proKmh)) return AnazhRealm._kernPflichtBruch("vehicle:FAHR.kmh");
        const kmh = Math.round(Math.abs(fz.vlong) * proKmh);
        if (el.hidden) {
            const t = el.querySelector(".fahr-tacho-tasten");
            if (t) t.textContent = this._fahrTastenZeile();
            el.hidden = false;
        }
        if (kmh !== this._fahrTachoKmh) {
            this._fahrTachoKmh = kmh;
            const z = el.querySelector("[data-kmh]");
            if (z) z.textContent = String(kmh);
        }
    }

    // Global-Tick für alle Affordances (wird im Game-Loop aufgerufen).
    // Nimmt dt = Sekunden seit letztem Frame.
    tickAffordances(dt) {
        if (!Number.isFinite(dt) || dt <= 0) return;
        this._fahrAnzeige(); // der Ritt im Bild läuft vor der Kamera (`_tickMountedMovement`, startEternalLoop)
        this._tickFocusingAffordances(dt);
        this._tickEsse(dt); // der Stahl in der Hand glüht am Feuer der Esse (stoffe.K3-2)
        this._tickRadiatingAffordances(dt);
        this._tickBalancingAffordances(dt);
        this._tickLiftingAffordances();
        this._tickPortalAffordance();
        this._tickWerkGesetz(dt);
    }

    // Bauplan mit role="soul" als Seele anwenden: parts → bodyParts in state.customSouls (eindeutiger
    // Name), dann applyPlayerSoul.
    applyPlayerSoulFromBlueprint(blueprintName) {
        const bp = this.state.blueprints && this.state.blueprints[blueprintName];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.role !== "soul") return { ok: false, reason: "blueprint_not_soul" };
        if (!Array.isArray(bp.parts) || bp.parts.length === 0) {
            return { ok: false, reason: "blueprint_empty" };
        }
        this.state.customSouls = this.state.customSouls || {};
        const soulName = `bp_${blueprintName}`;
        this.state.customSouls[soulName] = {
            label: bp.label || blueprintName,
            bodyParts: bp.parts.map((p) => JSON.parse(JSON.stringify(p))),
        };
        const ok = this.applyPlayerSoul(soulName);
        return { ok: !!ok, soulName };
    }

    // Brücke: eine Seele (Built-in ODER Custom) als role:"soul"-Bauplan in die Werkstatt holen — so ist
    // JEDER Avatar dort klon-/form-/fertigbar, über EINEN Bauplan-Pfad. forgeAvatar (unten): einen Körper
    // FORMEN kostet (WERK-Kern wie Gerät/Rüstung: Material + Präzisions-Snapshot + Affekt); TRAGEN frei.
    soulToBlueprint(soulName, newName) {
        const def = typeof this._getSoulDef === "function" ? this._getSoulDef(soulName) : null;
        if (!def || !Array.isArray(def.bodyParts) || !def.bodyParts.length)
            return { ok: false, reason: "soul_unknown" };
        const base =
            typeof newName === "string" && newName.trim()
                ? newName.trim()
                : `koerper_${(def.label || soulName || "seele")
                      .toString()
                      .toLowerCase()
                      .replace(/[^a-z0-9_]+/g, "_")}`;
        let name = base;
        let n = 2;
        while (this.state.blueprints[name]) name = `${base}_${n++}`;
        if (!this.createBlueprint(name, def.label ? `${def.label} (Körper)` : name))
            return { ok: false, reason: "create_failed" };
        for (const part of def.bodyParts) {
            this.addPartToBlueprint(name, {
                shape: part.shape,
                material: part.material,
                size: part.size ? { ...part.size } : { x: 0.5, y: 0.5, z: 0.5 },
                position: part.position ? { ...part.position } : { x: 0, y: 1, z: 0 },
                rotation: part.rotation ? { ...part.rotation } : { x: 0, y: 0, z: 0 },
                label: part.label || part.shape,
            });
        }
        const bp = this.state.blueprints[name];
        if (bp) {
            bp.role = "soul";
            bp.roleManual = true;
        }
        return { ok: true, name };
    }

    forgeAvatar(name) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.role !== "soul") return { ok: false, reason: "blueprint_not_soul" };
        const make = this._forgeMaterialAndFreeze(name);
        if (!make.ok) return make;
        const res = this.applyPlayerSoulFromBlueprint(name);
        return { ok: !!res.ok, soulName: res.soulName, free: make.free, forgedPrecision: make.forgedPrecision };
    }

    // „Verkörpern" (Spiegel von wield/wear): ungemachte Seele in pfad/frieden → erst forgeAvatar (zahlt +
    // friert ein); gemachte (forgedPrecision) oder schöpfer → frei über applyPlayerSoulFromBlueprint.
    // Der Mensch ist gegebene Identität — er läuft frei über applyPlayerSoul.
    embodyBlueprint(name) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        const mode = typeof this.getGameMode === "function" ? this.getGameMode() : "frieden";
        if (Number.isFinite(bp.forgedPrecision) || mode === "schöpfer") return this.applyPlayerSoulFromBlueprint(name);
        return this.forgeAvatar(name);
    }

    // DIE EINE Leib-Wahl der Seele (Labor = Welt): der Spieler (`applyPlayerSoul`), die Ich-Bühne (`_ichStageShow`) und der
    // Mitspieler (`_p2pApplyPeerSoul`) bauen den Leib einer Seele NUR hier. Ein Built-in mit build() (der Mensch) baut sich
    // selbst; „werde wolf" IST der Wolf: `bp_koerper_<tier>` trägt DENSELBEN Studio-Baum wie die Welt-Kreatur
    // (`_buildCreatureGroup`: bauTier + Gattungs-Dials + Gang; Tags/Stats lesen weiter die bodyParts); jede andere Seele baut
    // ihr Bauplan. _stampSoulPartRefs leitet head/Arme/Flügel aus der EINEN Rollen-Quelle ab (1st-Person-Kopf-Hide +
    // Hand-Anker). Kalter Tier-Kern → null, LAUT — nie der Block-Zwilling aus den Bauplan-Teilen.
    _leibDerSeele(name, def, label) {
        if (!def) return null;
        if (typeof def.build === "function") return def.build();
        const parts = Array.isArray(def.bodyParts) ? def.bodyParts : [];
        const tier = typeof name === "string" ? name.match(/^bp_koerper_([a-z]+)$/) : null;
        if (tier && Object.hasOwn(AnazhRealm.TETRAPODA_SOUL_MAP, tier[1])) {
            const leib = this._buildCreatureGroup(tier[1]);
            if (!leib) {
                this.log(`Verkörperung „${name}" fiel aus (kalter Tier-Kern) — kein Leib.`, "ERROR");
                return null;
            }
            this._stampSoulPartRefs(leib, (leib.userData && leib.userData._soulParts) || parts);
            return leib;
        }
        const leib = this._buildFromBlueprint({ name: label || name, parts });
        this._stampSoulPartRefs(leib, parts);
        return leib;
    }

    applyPlayerSoul(name) {
        const defs = this.playerSoulDefs;
        const key = typeof name === "string" ? name.toLowerCase().trim() : "";
        // Deutsch + Englisch + Umlaut tolerieren, damit Chat + DSL + Save +
        // UI alle denselben Kanonisierungs-Pfad nehmen.
        const alias = {
            mensch: "human",
            human: "human",
            // ALTLASTEN-NULL — „werde das Tier": die deutschen Namen lösen auf
            // die koerper_-Spiegel der Tier-Seelen (der generische embody-Pfad
            // unten trägt sie; der Schlüssel wesen bleibt load-bearing = Hirsch).
            hirsch: "koerper_wesen",
            wolf: "koerper_wolf",
            fuchs: "koerper_fuchs",
            bär: "koerper_baer",
            baer: "koerper_baer",
            // KÖRPER GANZ (T6) — die STUDIO-Namen des tetrapoda-Buchs (die primäre
            // Ich-Sicht zeigt sie) sind ebenso sprechbar: „werde fox/bear/deer".
            deer: "koerper_wesen",
            fox: "koerper_fuchs",
            bear: "koerper_baer",
        };
        // Custom-Seelen tolerieren: die Alias-Map gilt für de/en-Built-in-Namen; sonst Namen sanitizen
        // (lowercase) und akzeptieren, wenn er als Built-in ODER Custom-Soul existiert.
        const sanitized = key.replace(/[^a-z0-9_-]/gi, "");
        const aliased = alias[key] || null;
        // Ein Alias zählt nur als kanonisch, wenn er eine echte Def/Custom-Seele
        // trifft — die Tier-Aliase (koerper_*) laufen sonst unten in den
        // generischen Bauplan-embody-Pfad.
        const canonical =
            (aliased && (defs[aliased] || (this.state.customSouls && this.state.customSouls[aliased])) && aliased) ||
            (defs[key] && key) ||
            (defs[sanitized] && sanitized) ||
            (this.state.customSouls && this.state.customSouls[sanitized] && sanitized) ||
            null;
        if (!canonical) {
            // ALTLASTEN-NULL — der generische embody-Pfad ist Teil der EINEN
            // Kanonisierung: ein soul-rolliger Bauplan-Name (koerper_wolf …)
            // wird GETRAGEN statt abgelehnt. Deckt auch die Alias-Tiere oben.
            const bpName = aliased || sanitized;
            const bp = this.state.blueprints && this.state.blueprints[bpName];
            if (bp && bp.role === "soul" && typeof this.applyPlayerSoulFromBlueprint === "function") {
                return this.applyPlayerSoulFromBlueprint(bpName);
            }
            // Fail-soft auf den Menschen (alte Saves mit gefallenen Seelen-Namen
            // laden heil — der Körper ist die Identität, human ist der Anker).
            if (key && key !== "human" && defs.human) {
                this.log(`Seele '${name}' unbekannt — der Mensch trägt (fail-soft).`, "WARNING");
                return this.applyPlayerSoul("human");
            }
            return false;
        }
        // Vor Mesh-Erstellung (z. B. loadState im frühen Bootstrap): Wahl
        // merken, init() ruft uns nach Mesh-Bau erneut auf.
        if (!this.state.scene) {
            this.state.player.soul = canonical;
            return false;
        }
        const def = this._getSoulDef(canonical);
        const old = this.state.playerMesh;
        // Position + Scale + Rotation übernehmen (kein Sprung beim Soul-Wechsel). Den Leib wählt die EINE Leib-Wahl der
        // Seele (`_leibDerSeele`); fiel der Tier-Kern kalt aus (dort LAUT), trägt der Mensch — nie ein zweiter Tier-Körper.
        const newGroup = this._leibDerSeele(canonical, def);
        if (!newGroup) return canonical !== "human" && this.applyPlayerSoul("human");
        // Die Spieler-Gruppe ist IMMER YXZ (lokale Schwimm-Lehne im gedrehten Frame) —
        // UNBEDINGT am Chokepoint (vorher nur im old-Zweig: ein Boot-Restore einer
        // Compound-Seele bliebe sonst XYZ — die Abschieds-Welle hob es hierher).
        newGroup.rotation.order = "YXZ";
        if (old) {
            // DER ORT DES SPIELERS IST EIN VEKTOR über jeden Leib: der neue trägt die Lage des alten als dasselbe Objekt (three:
            // `position` ist konfigurierbar, nur nicht schreibbar) — wer sie vor dem Tausch hielt (der deferierte Boot-Guss auf
            // echter GPU, eine Wandlung per Wort), rückt danach den Spieler, nie einen abgehängten Leib (mensch.K1 Radeon: die
            // Stadt 735 m vom Spieler, ihre Bewohner abgebaut)
            Object.defineProperty(newGroup, "position", { configurable: true, enumerable: true, value: old.position });
            newGroup.rotation.copy(old.rotation);
            newGroup.scale.copy(old.scale);
            newGroup.visible = old.visible;
            // Euler.copy überträgt auch die order: eine Custom-Seele hat XYZ, ohne Reset kippte die
            // Schwimm-Pose seitlich. Die Spieler-Gruppe ist IMMER YXZ.
            newGroup.rotation.order = "YXZ";
            // Physics-Body-Referenz mitnehmen und den Eintrag in state.rigidBodies mitswappen — sonst schreibt
            // der Sync-Loop die Position der entfernten alten Gruppe.
            if (old.userData && old.userData.physicsBody) {
                newGroup.userData.physicsBody = old.userData.physicsBody;
            }
            if (Array.isArray(this.state.rigidBodies)) {
                const idx = this.state.rigidBodies.indexOf(old);
                if (idx >= 0) this.state.rigidBodies[idx] = newGroup;
            }
            this.state.scene.remove(old);
            this._disposeSoulGroup(old);
        }
        this.state.scene.add(newGroup);
        this.state.playerMesh = newGroup;
        const wandlung = this.state.player.soul !== canonical;
        this.state.player.soul = canonical;
        // Ego-Sicht SOFORT am Guss-Chokepoint: sonst erscheint der frische Leib einen Frame roh (Kopf von
        // innen) — ohne Kamera-Tick (headless) dauerhaft.
        this._applyEgoSicht();
        // IDEMPOTENT am Chokepoint: jeder erfolgreiche Seelen-Bau erfüllt den deferierten Boot-Avatar-Bau
        // mit — der Loop-Defer stapelt keinen zweiten Bau, egal welcher Pfad (Restore/DSL/UI) zuerst baute.
        this.state._deferredAvatarSoul = null;
        this.log(`Seele gewechselt: ${def.label} (${canonical})`, "INFO");
        if (typeof document !== "undefined") {
            const select = document.getElementById("player-soul-select");
            if (select && select.value !== canonical) {
                select.value = canonical;
                // Eine Verkörperung (bp_<bauplan>) hat keinen eigenen Options-
                // Eintrag — ihr BAUPLAN ist die sichtbare Wahl (UI ↔ State).
                if (select.value !== canonical && canonical.startsWith("bp_")) {
                    const bpOpt = canonical.slice(3);
                    if ([...select.options].some((opt) => opt.value === bpOpt)) select.value = bpOpt;
                }
            }
            const status = document.getElementById("status-soul");
            if (status) status.textContent = def.label;
        }
        // Stats neu berechnen: bei Seelen-Wechsel tauschen die Tag-Profile (HP-Max, Speed, Sprung, Ausdauer,
        // Resistenzen), die Wandlung füllt die Lebenswerte — nur sie: derselbe Leib neu gebaut (der Boot-Avatar, der Guss nach
        // dem Laden) behält sie, sonst heilte jeder Reload (halten.K5). DSL-Tuning (player_speed/player_jump_power) überschreibt
        // bis zum nächsten Wechsel.
        this.recomputePlayerStats({ voll: wandlung });
        // S9 (kampf-plan §10-F4) — das gehaltene Gerät an den NEUEN Körper re-attachen (der alte
        // Körper + sein heldMesh-Kind wurden oben disposed); liest equipped.held — deckt damit auch
        // den Restore (init() ruft applyPlayerSoul nach Mesh-Bau erneut, wenn equipped.held gesetzt ist).
        this._refreshHeldMesh();
        // V18.61 Ich-G (ich-plan §H.7) — wenn das Ich offen ist, switcht die SELBST-BÜHNE live auf den
        // neuen Körper + das Spec-Sheet aktualisiert (vorher blieb die Bühne auf dem Initial-Avatar stehen).
        if (this.state.inventoryOpen && typeof this._ichRefreshStage === "function") this._ichRefreshStage();
        // Ring 11 V3 — Soul-Sync: Mitspieler über den Seelen-Wechsel
        // informieren, damit ihr Renderer den neuen Avatar baut.
        if (this.state.p2p && this.state.p2p.enabled) this._p2pBroadcastSoul();
        return true;
    }

    // Spieler-Stats aus dem Körper-Bauplan: dieselbe Tag-Aggregation wie Architekturen —
    // computeSoulCompoundTags (MAX) → STAT_FROM_TAGS bildet acht Stats.
    computePlayerStats() {
        const soulName = (this.state.player && this.state.player.soul) || "human";
        const soul = this._getSoulDef(soulName);
        const compoundTags = this.computeSoulCompoundTags(soul);
        // Soul-Tags FÜR DIE STAT-PIPE auf [0, 1] clampen: FORM_TAG_ACTIVATION verstärkt bis ~3, dann würde
        // z. B. speed = (1 - dichte) * 5 negativ. Boosts/Equipped/Wound dürfen danach darüber hinaus;
        // die Compound-Tags >1 selbst bleiben erhalten.
        const finalTags = {};
        // Präzision moduliert die Stat-Wirkung je Quelle (roh gebaut < poliert). Built-in-Seelen ohne
        // opChain gelten als geboren (precision 1.0); Custom-Seelen tragen ihre Werkzeug-Geschichte.
        const soulPrec = this._compoundAvgPrecisionFromParts(soul && soul.bodyParts);
        // Form → Wirkung für Custom-Avatare (körper-förmig, symmetrisch, lebendig wirkt stärker). Built-in
        // -Seelen (human/phoenix/dragon) bleiben neutral (soulFit 1.0) — kein Balance-Bruch.
        const isBuiltinSoul = !!(this.playerSoulDefs && this.playerSoulDefs[soulName]);
        const soulFit = isBuiltinSoul ? 1.0 : this._blueprintRoleFit({ parts: (soul && soul.bodyParts) || [] }, "soul");
        const soulMul = 0.5 + 0.5 * soulPrec * soulFit;
        for (const key of AnazhRealm.MATERIAL_TAG_KEYS) {
            const raw = Number(compoundTags[key]) || 0;
            finalTags[key] = Math.max(0, Math.min(1, raw)) * soulMul;
        }
        // Equipped-Stat-Stacking, je Quelle präzisions-moduliert:
        // finalTags[t] = soul[t] + armor[t]·armorWeight·armorPrec + tool[t]·toolWeight·toolPrec + Boosts
        const equipped = (this.state.player && this.state.player.equipped) || {};
        // Rüstung-Beitrag (ein eigener GETRAGENER Slot, aus Bauplan mit role:"armor")
        if (equipped.armor && this.state.blueprints[equipped.armor]) {
            const bp = this.state.blueprints[equipped.armor];
            if (bp.role === "armor") {
                this._foldEquippedStatTags(finalTags, bp, AnazhRealm.ARMOR_STAT_WEIGHT, "armor");
            }
        }
        // Welle 6.D Etappe 2 / V18.312 — aktive Boosts (Emotion · Welt-Resonanz · Konsum)
        // addieren ihre Tag-Deltas über die kanonische Quelle (geteilt mit der Kreatur).
        this._applyBoostsToStatTags(finalTags, (this.state.player && this.state.player.boosts) || []);
        // Welle 6.D Etappe 3a+ — Tod-Wunde als negativer Tag-Delta. Wundens-
        // Intensität (0..1) skaliert WOUND_TAG_PENALTY; bei frischem Tod
        // voll, regeneriert linear über deathWoundRegenSeconds.
        const woundI = (this.state.player && this.state.player.deathWoundIntensity) || 0;
        if (woundI > 0) {
            for (const tag of Object.keys(AnazhRealm.WOUND_TAG_PENALTY)) {
                finalTags[tag] = (finalTags[tag] || 0) + AnazhRealm.WOUND_TAG_PENALTY[tag] * woundI;
            }
        }
        // V18.312 (Gesetz #0) — Tags → Stats + Invers-dichte-Floor über die kanonische Quelle (geteilt mit der Kreatur).
        const stats = this._statsFromTags(finalTags);
        // DIE HAND IST KEIN PANZER (Welle L 06.10., Befund K-D15): das EINE gehaltene Gerät (Werkzeug + Waffe
        // verschmolzen, _heldImplementBlueprint) faltet mit HELD_STAT_WEIGHT über den kanonischen
        // _foldEquippedStatTags NUR in die Angriffs-Größen (AnazhRealm.HELD_ANGRIFF_STATS) — es bestimmt Angriff wie
        // Abbau. Vorher faltete es in ALLE Stats: jede Eisenwaffe hob defense 12,8 → 20,94 und hpMax 134 → 185,2, ein
        // Wolf-Biss (roh 15,8) kostete 1 HP. Schutz kommt nur aus dem Slot armor. Ein Werk der Schmiede faltet NICHT
        // (halten-gesetz): seinen Treffer urteilt der Kern aus Masse × Schneide × Tempo — die Tags seines Spenders
        // (geraet_schwert / geraet_spitzhacke, zwei feste Sätze für 21 Gestalten) hoben den Schaden der Hand 22 auf 36,7–40,4.
        const heldBp = this._heldImplementBlueprint();
        if (heldBp && !this._schmiedeWerk(heldBp)) {
            const angriffTags = { ...finalTags };
            this._foldEquippedStatTags(angriffTags, heldBp, AnazhRealm.HELD_STAT_WEIGHT, "held");
            const angriff = this._statsFromTags(angriffTags);
            for (const k of AnazhRealm.HELD_ANGRIFF_STATS) stats[k] = angriff[k];
        }
        // Soul-Größe hebt HP/Stamina/Mana (sqrt-Skalierung: größer = robuster, nicht linear) und senkt
        // speed/attackSpeed/jumpPower (größer = langsamer, nicht stärker in allem). Built-in-Seelen NEUTRAL
        // (sizeFactor 1); Custom-Avatare bekommen den Hebel aus der Substanz (0.7 → ~84 %, 1.7 → ~130 %).
        // Anwendung über die kanonische _applySizeMultipliersToStats (geteilt mit der Kreatur); hier nur
        // der Spieler-Eingang.
        const soulBpForSize = { parts: (soul && soul.bodyParts) || [] };
        // ALTLASTEN-NULL HERZ: die 1er-Klemme fällt — der Mensch (die einzige
        // Built-in-Seele) zieht seinen Größen-Faktor aus den koerperstudio-
        // Dials; Custom-Körper aus ihrer Substanz. EINE Fold-Quelle für alle.
        const soulSize = isBuiltinSoul ? this._humanDialSizeFactor() : this._compoundSizeFactor(soulBpForSize);
        this._applySizeMultipliersToStats(stats, Math.sqrt(soulSize));
        return { tags: finalTags, stats };
    }

    // Kanonischer Setter der Spieler-Geschwindigkeit: speed und sprintSpeed sind GEKOPPELT — EIN Setter
    // hält die Kopplung, sonst wird Sprint nach player_speed langsamer als Gehen. Clamp beim Aufrufer.
    _applyPlayerSpeed(v) {
        this.state.speed = v;
        // Sprint-Faktor ist fail-closed Kern-Pflicht (koerper:bewegung.sprintMul); ein alter Kern bricht
        // laut, wie speed/jumpPower (_bewegungsKoeff).
        this.state.sprintSpeed = v * AnazhRealm._sprintMulGesetz();
    }

    // DAS GESETZ-BAND eines Bewegungs-Stats für DIESEN Leib: das Körper-Gesetz (koerper fx.bewegung: base + leicht·(1 −
    // dichte) + mag·magieleitung, die Tags in [0, 1]) spannt [base, base + leicht + mag]; die Größe des Leibs (dieselbe
    // Pipeline, computePlayerStats) skaliert es mit g = Stat / Rohwert der Tags. Liefert {min, max, wert}.
    _koerperGesetzBand(stat) {
        const { tags, stats } = this.computePlayerStats();
        const K = AnazhRealm._bewegungsKoeff(stat);
        const roh = AnazhRealm.STAT_FROM_TAGS[stat](tags);
        const g = roh > 0 && Number.isFinite(stats[stat]) ? stats[stat] / roh : 1;
        return { min: K.base * g, max: (K.base + K.leicht + K.mag) * g, wert: stats[stat] };
    }

    // DER KÖRPER-HAUCH (Leben-Schau 07.10., Neu 1): ein DSL-Op wiegt Lauf-Tempo oder Sprungkraft nur INNERHALB des
    // Gesetz-Bands des Leibs (`_koerperGesetzBand`); das Band hält `dslEval` (`AnazhRealm.DSL_WERTE`, KI H1): ein Wunsch
    // jenseits fällt benannt und steht im Prompt der KI, statt still an den Rand zu rutschen, während der Chat den Wunsch
    // meldete. Vorher setzte der Op den Wunsch absolut: der Nexus würfelte Gehen 11,1 m/s (Sprint 45 m/s) und Sprungkraft
    // bis 18,6 statt 2,6, der Hang-Gang und der Sprung hingen am Würfel.
    _koerperHauch(stat, wunsch, ctx) {
        const v = Number(wunsch);
        if (stat === "speed") this._applyPlayerSpeed(v);
        else if (stat === "jumpPower") this.state.jumpPower = v;
        else return;
        const quelle = (ctx && ctx.source) || "dsl";
        this.log(
            `Körper-Hauch (${quelle}): ${stat === "speed" ? "Lauf-Tempo" : "Sprungkraft"} ${v.toFixed(2)}`,
            "INFO"
        );
    }

    // Mana-Helper für Konsumenten (Magie-Akte, Boost, DSL-Kosten): strukturell, KEIN DSL-Op — ein Skript
    // darf die Mana-Wand nie umgehen. schöpfer = frei, pfad/frieden = strikt.
    _canPayMana(n, opts) {
        if (!this.state.player) return false;
        if (!(n > 0)) return true;
        const mode = (opts && opts.mode) || (this.getGameMode ? this.getGameMode() : "frieden");
        if (mode === "schöpfer") return true; // freier Schöpfer
        return (this.state.player.mana || 0) >= n;
    }

    _drainMana(n, opts) {
        if (!this.state.player) return false;
        if (!(n > 0)) return true; // 0/negativ = no-op, kein Fehler
        const mode = (opts && opts.mode) || (this.getGameMode ? this.getGameMode() : "frieden");
        if (mode === "schöpfer") return true; // freier Schöpfer, kein Drain
        const have = this.state.player.mana || 0;
        if (have < n) return false; // insufficient → kein Drain (atomar)
        this.state.player.mana = Math.max(0, have - n);
        return true;
    }

    // DER STOFF EINES WAGENS (halten.K2): die Hülle eines Studio-Wagens ist Blech (wie seine Masse, unten), ein Teile-Werk
    // trägt den Stoff seines größten festen Teils (`_werkStoff`, der Holzkarren Holz). Leser: der Stoß (`_stossEreignis`).
    _wagenStoff(entry) {
        const fzg = this._fahrzeugGesetzFor(entry);
        return fzg && fzg.drive && fzg.drive.huelle ? "blech" : this._werkStoff(entry);
    }

    // DIE MASSE EINES WAGENS (kg): das Volumen seiner Gestalt × ρ seines Stoffs. Ein Studio-Wagen (die Hülle seines Kerns)
    // ist Blech: der Raum seines Fahr-Satzes (`raumM3`, carPhys des Kerns, G.m) × der Anteil Blech darin
    // (`_fahrGesetz().fuellGrad`) × ρ(blech) — ein GT mit 9,6 m³ wiegt 1,4 t. Ein Teile-Werk wiegt seine Teile (`_teilMasse`,
    // × Skala³). Leser: jeder Stoß (`_stossKoerper`, `_fahrStossSchritt`) und die Trägheit des Wasser-Terms (`_fahrSatz` →
    // fahrGesetz masseKg). Vorher wog jedes Werk mit Fahr-Satz wie ein Wagen (G.m × FAHR.masseDichte), auch der Holzkarren.
    _fahrMasse(entry, raumM3) {
        if (!entry || !(raumM3 > 0)) return 0;
        const fzg = this._fahrzeugGesetzFor(entry);
        if (fzg && fzg.drive && fzg.drive.huelle)
            return raumM3 * AnazhRealm._fahrGesetz().fuellGrad * this._stoffRho("blech");
        const bp = this.state.blueprints && this.state.blueprints[entry.type];
        const sc = Number.isFinite(entry.scale) ? entry.scale : 1;
        let m = 0;
        for (const p of (bp && bp.parts) || []) if (p) m += this._teilMasse(p);
        return m * sc * sc * sc;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_koerper_fahrt]);

// ===== ATLAS · Koerper/fahrt — Außen-Konstanten =====
// DER FAHRER (fahrzeug.K2, `_fahrerSchritt`): ld0 + ldV·v (bis ldMax) m voraus zielt die Lenkung · quer / lenk / brems = die
// Anteile des Reibkreises (μ·g) und des Einschlags in der Kurve und des Reibkreises beim Bremsen davor · kriechMs = so langsam
// fährt er höchstens um eine Kehre · bogenM = auf mindestens so viele Meter misst er den Bogen zurück auf die Route ·
// kurveM = über ±so viele Meter misst er die Drehung der Route · sichtM = so weit voraus liest er Kurven · bandMs = über so viel Tempo-Fehler (m/s) geht Gas bzw. Bremse von 0 auf voll ·
// bremsV = darunter bremst er nicht (die Bremse des Kerns triebe rückwärts) · haltM = so nah am Ende hält er · festM / festS =
// so wenig Fortschritt auf der Route in so vielen Sekunden ist ein Steckenbleiber.
AnazhRealm.FAHRER = Object.freeze({
    ld0: 3,
    ldV: 0.35,
    ldMax: 12,
    quer: 0.85,
    lenk: 1,
    kriechMs: 2.5,
    bogenM: 6,
    brems: 0.8,
    kurveM: 8,
    sichtM: 120,
    bandMs: 1.5,
    bremsV: 0.5,
    haltM: 2,
    festM: 1,
    festS: 2,
});
// Der EINE Fahr-Gesetz-Leser, fail-closed: hostEmergent (Emergenz-Koeffizienten, Klemm-Grenzen,
// Gier-Folge) + Nick-/Wank-Konstanten (FAHR.pitchGain/rollGain, A_PITCH_MAX/A_LAT_MAX) in EINER
// Gültigkeits-Wand — ganz oder gar nicht, nie ein Misch-Gesetz. Memo nur im Erfolgs-Fall.
AnazhRealm._fahrGesetz = function () {
    if (AnazhRealm._fahrGesetzMemo) return AnazhRealm._fahrGesetzMemo;
    const vc = typeof globalThis !== "undefined" ? globalThis.__vehicleCore : null;
    const F = vc && vc.FAHR;
    const he = F && F.hostEmergent;
    const HE_FELDER = [
        "radMul",
        "radCap",
        "beinBonus",
        "kAcc",
        "kBrakeRad",
        "kBrakeBein",
        "kAccMin",
        "kAccMax",
        "kBrakeRadMin",
        "kBrakeRadMax",
        "kBrakeBeinMin",
        "kBrakeBeinMax",
        "yawFolgeK",
        "fahrtGate",
    ];
    if (
        he &&
        HE_FELDER.every((k) => Number.isFinite(he[k])) &&
        Number.isFinite(F.pitchGain) &&
        Number.isFinite(F.rollGain) &&
        Number.isFinite(vc.A_PITCH_MAX) &&
        Number.isFinite(vc.A_LAT_MAX) &&
        F.masseDichte > 0 &&
        F.huelleDichte > 0 &&
        F.wasser &&
        F.wasser.rho > 0 &&
        F.sitzLehneRad >= 0 &&
        F.kopfFreiraumM >= 0 &&
        F.sitzLehneMaxRad >= F.sitzLehneRad
    ) {
        AnazhRealm._fahrGesetzMemo = {
            he,
            pitchGain: F.pitchGain,
            rollGain: F.rollGain,
            aPitchMax: vc.A_PITCH_MAX,
            aLatMax: vc.A_LAT_MAX,
            // DER WAGEN ALS KÖRPER (physik K1): sein Stoff ist das Blech der Hülle (der Mix des Kerns, wenn die Kabine voll läuft:
            // huelleDichte × ρ Wasser — die Zeile blech der Stoff-Zeile), seine Gestalt der Raum des Fahr-Satzes (G.m) zum
            // Anteil fuellGrad = masseDichte / ρ(blech): die mittlere Dichte der geschlossenen Hülle (0710-4) geteilt durch die
            // ihres Stoffs. Masse = G.m × fuellGrad × ρ(blech) (`_fahrMasse`), im Wasser liegt er nach ρ(blech) (`_vehicleProfile`).
            huelleDichte: F.huelleDichte,
            wasserRho: F.wasser.rho,
            fuellGrad: F.masseDichte / (F.huelleDichte * F.wasser.rho),
            // der Reiter im Wagen (0710-4 Klasse 4): die Lehne des Sitzes, der Kopf-Freiraum unter der Dachlinie, die
            // steilste Lehne
            sitzLehneRad: F.sitzLehneRad,
            kopfFreiraumM: F.kopfFreiraumM,
            sitzLehneMaxRad: F.sitzLehneMaxRad,
        };
        return AnazhRealm._fahrGesetzMemo;
    }
    return AnazhRealm._kernPflichtBruch(
        "vehicle:FAHR.hostEmergent / FAHR.masseDichte / FAHR.huelleDichte / FAHR.wasser.rho / FAHR.sitzLehneRad"
    );
};
// DER EINE FAHR-SCHRITT-LESER (Welle L, Nachbesserung 07.10.), fail-closed: die Funktionen des Fahr-Schritts
// (vehicle-core fahrGesetz · fahrZustand · fahrEbene · fahrStand · fahrKraefte · fahrAufstand) und die Wände des
// Welt-Ritts (FAHR.schritt: Stufe, Rad-Hub, Ebenen-Klammer, Luft-Abstand) in EINER Gültigkeits-Wand. Ein alter Kern
// bricht LAUT — vorher prüften `_fahrSatz` und `_rittEbene` typeof und gaben still null (der Gesetz-Wagen ritt
// richtungs-folgend), und Hülle, Kontakt und Rad trugen Literal-Zwillinge der Kern-Zeilen (0,34/0,5 · 0,7 · 0,34/0,6).
// Memo je Kern-Objekt.
AnazhRealm._fahrSchrittGesetz = function () {
    const vc = typeof globalThis !== "undefined" ? globalThis.__vehicleCore : null;
    const memo = AnazhRealm._fahrSchrittMemo;
    if (memo && memo.vc === vc) return memo;
    const S = vc && vc.FAHR && vc.FAHR.schritt;
    if (
        S &&
        [
            "fahrGesetz",
            "fahrZustand",
            "fahrEbene",
            "fahrStand",
            "fahrKraefte",
            "fahrAufstand",
            "chaseKamera",
            "chaseGreif",
        ].every((f) => typeof vc[f] === "function") &&
        ["stufeRad", "radHub", "ebeneMax", "ebeneTol", "luftEps", "bremsV", "rueckVmax"].every((k) =>
            Number.isFinite(S[k])
        )
    ) {
        AnazhRealm._fahrSchrittMemo = { vc, S };
        return AnazhRealm._fahrSchrittMemo;
    }
    return AnazhRealm._kernPflichtBruch("vehicle:FAHR.schritt/fahrSchritt");
};

// SYNERGIE-WELLE — die AURA_TAG_HUE-Map ist mit der Avatar-Aura GEFALLEN
// (Schoepfer: keine Avatar-Aura im Nervensystem; die Tag-Achsen sprechen
// weiter durch Substanz/Resonanz/Werkstatt-Chips — nicht durch einen Glow).

// Stat-Stacking: Compound-Tags ausgerüsteter Werkzeuge/Rüstung/Waffen werden zur Soul-Tag-Basis
// addiert, dann läuft STAT_FROM_TAGS (Rüstung spürbar, Werkzeug leicht, Waffe/gehaltenes Gerät
// stark). Die Gewichte wohnen im Gesetzbuch (koerper:kampf.fold via _kampfFold, fail-closed); die
// Statics sind nur Leser.
Object.defineProperties(AnazhRealm, {
    ARMOR_STAT_WEIGHT: {
        get() {
            return AnazhRealm._kampfFold().armor;
        },
    },
    TOOL_STAT_WEIGHT: {
        get() {
            return AnazhRealm._kampfFold().tool;
        },
    },
    WEAPON_STAT_WEIGHT: {
        get() {
            return AnazhRealm._kampfFold().weapon;
        },
    },
    HELD_STAT_WEIGHT: {
        get() {
            return AnazhRealm._kampfFold().held;
        },
    },
});
// Die Angriffs-Größen, in die das gehaltene Gerät faltet (computePlayerStats, K-D15): Schaden, Rückschlag, Tempo,
// Präzision — nie Schutz, Leben, Ausdauer oder Gang.
AnazhRealm.HELD_ANGRIFF_STATS = Object.freeze(["damage", "knockback", "attackSpeed", "precision"]);

// Tod-Wunde: nach einem Tod fallen die Körper-Tags graduell (sichtbar verwundet bis zur vollen
// Regeneration); skaliert mit `deathWoundIntensity` (0..1).
AnazhRealm.WOUND_TAG_PENALTY = Object.freeze({
    dichte: -0.3, // Körper schwer + träge
    lebendig: -0.2, // Aura blass
    zähigkeit: -0.2, // anfälliger
});
// W10 ext. — radiating-Welt-Reaktion: Reichweite + sanfte Emotion-Rampe.
AnazhRealm.RADIATING_RANGE_M = 14;
AnazhRealm.RADIATING_EMOTION_RATE_PER_SEC = 0.04;
// W10 ext. — broadcasting-Relais: ein Mast in BROADCAST_RELAY_RANGE_M eines
// Strahlers vervielfacht dessen Reichweite um BROADCAST_RANGE_MULT.
AnazhRealm.BROADCAST_RELAY_RANGE_M = 18;
AnazhRealm.BROADCAST_RANGE_MULT = 2;
// W10 ext. — balancing-Welt-Reaktion: nahe einer gründenden Form wird chaos
// abgebaut (Komplement zu radiating, das awe+peace hebt).
AnazhRealm.BALANCING_RANGE_M = 14;
AnazhRealm.BALANCING_CHAOS_DRAIN_PER_SEC = 0.05;
// W10 ext. — lifting-Welt-Reaktion: in Reichweite eines lifting-Compounds
// trägt ein Auftriebs-Feld den Spieler (Fall gedämpft + Aufwärts-Drift).
AnazhRealm.LIFTING_RANGE_M = 10;

// Welt-Reaktion: die Aufsitz-Regeln wohnen in ihren Gesetzbüchern — E-Mount-Reichweite =
// vehicle:FAHR.mountRangeM, Sitz-Hüfte = koerper:anatomie.sitzHipOffset (Körperzentrum der
// sitzenden Pose über dem Sattelpunkt; gilt jedem Sitz). Die Statics sind Leser (Getter, fail-closed).
Object.defineProperties(AnazhRealm, {
    MOUNT_RANGE_M: {
        get() {
            const v = AnazhRealm.Gesetz("vehicle:FAHR.mountRangeM", null);
            if (Number.isFinite(v) && v > 0) return v;
            return AnazhRealm._kernPflichtBruch("vehicle:FAHR.mountRangeM");
        },
    },
    SITZ_HIP_OFFSET: {
        get() {
            const v = AnazhRealm.Gesetz("koerper:anatomie.sitzHipOffset", null);
            if (Number.isFinite(v)) return v;
            return AnazhRealm._kernPflichtBruch("koerper:anatomie.sitzHipOffset");
        },
    },
});
AnazhRealm.MOUNT_FOLLOW_HEIGHT = 1.5; // Spieler sitzt oben drauf
AnazhRealm.ZOOM_FOV_DEG = 25; // Magnifying-Compound zoomt auf 25°
AnazhRealm.KAM_FOV_GRAD = 75; // die Ruhe des Sichtfelds (vertikal), auf die `_kamFov` Tempo und Bogen-Auszug legt
AnazhRealm.MAGNIFYING_RAY_RANGE_M = 8; // Spieler muss innerhalb dieser Reichweite drauf schauen
AnazhRealm.FOCUSING_HEAT_RANGE_M = 4; // Architekturen in diesem Radius einer Linse können ihren Brennpunkt tragen
// DAS WÄRME-GESETZ DES BRENNGLASES (stoffe.K1, `_brennWaerme`): die Sonne trägt FOCUSING_SONNE_W_M2 auf die Linse (π r² mal
// Sonnenhöhe), der Brennfleck ist FOCUSING_FLECK_M3 des Stoffs und gibt FOCUSING_VERLUST_W_K an Luft und Körper ab, unter
// FOCUSING_RUHE_K ist er kalt. Die Quarz-Kugel von 0,4 m Radius trägt mittags ~480 W, der Fleck strebt gegen ~570 K über der
// Luft: Holz (573 K, τ 29 s) fängt nach ~20 s, Gras nach ~8 s, Stein und Eisen erwärmen sich nur.
AnazhRealm.FOCUSING_SONNE_W_M2 = 1000;
AnazhRealm.FOCUSING_FLECK_M3 = 2e-5;
AnazhRealm.FOCUSING_VERLUST_W_K = 0.85;
AnazhRealm.FOCUSING_RUHE_K = 1;
