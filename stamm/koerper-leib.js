class AnazhRealm_koerper_leib {
    // ===== ATLAS · Koerper/leib — Rig · Gang und IK · Ofen-Guss · Tier-Animation =====
    // Genom-Roller: aus EINEM Seed ein deterministisches Körper-Genom (Geschlecht · Statur · Muskel ·
    // Kopf-Verhältnis · Größe · Haut · Haar · Kleid) — gleicher Seed → gleicher Körper auf allen Peers.
    // KONVERGENZ II — die Paletten wohnen im Gesetzbuch (koerper-core SKIN_TONES · HAIR_COLORS · CLOTH_COLORS): der Roller
    // PICKT ihre SCHLÜSSEL, die Dials tragen sie in den EINEN Farb-Münzer (`_menschGussFarben`) und den Guss — kein Hex-Zwilling.
    // Das Haar der Natur: die Töne, deren Farbton im Braun-Orange liegt (≤ 50°) oder die kaum gesättigt sind (Schwarz, Grau,
    // Weiß) — die Färbe-Töne der Palette (Blau, Pink, Teal) trägt nur, wer sie im Studio wählt. Leser: die Gestalten jeder
    // Siedlung (`_bewohnerGestalten`) und jeder Bewohner (`_bewohnerGenome`). Kalter Kern → lauter Bruch (fail-closed).
    _rollHumanoidGenome(seed) {
        const g = this._rollGenome(String(seed == null ? "h0" : seed), "humanoid");
        const core = typeof window !== "undefined" && window.__koerperCore;
        if (!core || !core.SKIN_TONES || !core.HAIR_COLORS || !core.CLOTH_COLORS || !core.HAAR_KAPPE)
            return AnazhRealm._kernPflichtBruch("koerper:SKIN_TONES/HAIR_COLORS/CLOTH_COLORS/HAAR_KAPPE");
        const natur = Object.keys(core.HAIR_COLORS).filter((k) => {
            const c = core.HAIR_COLORS[k].base >>> 0;
            const r = (c >> 16) & 255,
                gr = (c >> 8) & 255,
                b = c & 255;
            const hi = Math.max(r, gr, b),
                lo = Math.min(r, gr, b);
            const d = hi - lo;
            const hell = (hi + lo) / 510;
            if (d === 0 || d / 255 / (1 - Math.abs(2 * hell - 1)) < 0.2) return true;
            const ton =
                hi === r
                    ? (((gr - b) / d) * 60 + 360) % 360
                    : hi === gr
                      ? ((b - r) / d) * 60 + 120
                      : ((r - gr) / d) * 60 + 240;
            return ton <= 50;
        });
        return {
            sex: g.axis("sex"),
            build: g.axis("build"),
            muscle: Math.max(0, Math.min(1, g.axis("muscle") * 0.65 + g.axis("build") * 0.35)),
            headRatio: g.range("head", 0.92, 1.16),
            // DIE KÖRPERHÖHE (mensch.K4, die EINE Quelle der Höhe jedes Bewohners): ±8 % um 0,215 (1,72 m), die Summe zweier
            // Achsen — gehäuft um die Mitte wie die Größen einer Menge, nie über den Rand (bis mensch.K4 0,195–0,235 gleich verteilt,
            // ±9,3 %, und die Liste trug je Person eine zweite Größe ±4 % darüber)
            kh: 0.215 * (1 + 0.08 * (g.axis("height") + g.axis("hoehe") - 1)),
            skinTone: g.pick("skin", Object.keys(core.SKIN_TONES)),
            hairColor: g.pick("hair", natur),
            topColor: g.pick("top", Object.keys(core.CLOTH_COLORS)),
            bottomColor: g.pick("bottom", Object.keys(core.CLOTH_COLORS)),
            shoeColor: g.pick("schuh", Object.keys(core.CLOTH_COLORS)),
            // DIE GESTALT ÜBER DIE FARBE HINAUS (mensch.K4): der Schnitt des Haars (die Stile mit Volumen, koerper HAAR_KAPPE),
            // seine Länge und Fülle, das Alter (das Gesicht altert, die Haltung mit ihm) — die Gestalten einer Siedlung lesen
            // sie (`_bewohnerGestalten`), ihre Bewohner wählen nach ihnen (`_bewohnerGenome`)
            schnitt: g.pick("schnitt", Object.keys(core.HAAR_KAPPE)),
            haarLaenge: g.range("haarLaenge", 0.7, 1.4),
            haarFuelle: g.range("haarFuelle", 0.8, 1.3),
            alter: g.range("alter", 0.05, 0.5),
        };
    }
    // Genom→Dial-Brücke: der EINE Bau-Pfad ist bauMensch(dials); die Brücke invertiert die
    // KOERPER_DIAL_MAP-Zeilen (EINE Quelle, kein zweiter Zahlensatz). height = kh/PLAYER-Einheit; die Paletten-Schlüssel des
    // Genoms (Haut, Haar, Kleid) reisen als die String-Wahlen des Studios.
    _dialsAusGenom(g) {
        const core = typeof window !== "undefined" && window.__koerperCore;
        const start = core.START_PARAMS;
        const d = Object.assign({}, start);
        const MAP = AnazhRealm.KOERPER_DIAL_MAP;
        for (const row of MAP) {
            if (!row || !Number.isFinite(row.base) || !Number.isFinite(row.mul) || row.mul === 0) continue;
            if (row.axis === "khMul") {
                const kh = Number.isFinite(g.kh) ? g.kh : AnazhRealm.PLAYER_KH;
                d[row.dial] = (kh / AnazhRealm.PLAYER_KH - row.base) / row.mul;
            } else if (Number.isFinite(g[row.axis])) {
                d[row.dial] = (g[row.axis] - row.base) / row.mul;
            }
        }
        for (const k of ["skinTone", "hairColor", "topColor", "bottomColor", "shoeColor"])
            if (typeof g[k] === "string") d[k] = g[k];
        return d;
    }

    // koerper-core.bauMensch liefert den EINEN Teile-Baum, morphAuf trägt die Regler; der Stamm baut
    // keinen eigenen Körper, er hängt sein Rig an die GELENK-GRUPPEN des Baums. Rückgabe
    // { mesh, rig, kh, bones:[] }; mesh in Welt-Maß (f = 8·0.2125/6 je Lab-Einheit, Größe via charScale).
    _buildHumanoidRig(g) {
        // Template aus dem Mensch-Ofen (Foundry wie Kreatur/Pflanze, memo je Dials+Farben); der Körper ist
        // ein CLONE (Geometrien + Materialien geteilt). Signatur + Rückgabe bleiben stabil für
        // Animator/Equip/Werkstatt/Peers.
        if (typeof THREE === "undefined") return null;
        g = g || {};
        const kh = g.kh || AnazhRealm.PLAYER_KH;
        const oy = g.oy || 0;
        const core = typeof window !== "undefined" && window.__koerperCore;
        if (!core || typeof core.bauMensch !== "function" || typeof core.morphAuf !== "function") {
            this.log(
                "KÖRPER-KERN KALT: koerper-core.bauMensch fehlt — ohne Gesetzbuch kein Mensch (fail-closed).",
                "ERROR"
            );
            return null;
        }
        const dials = Object.assign({}, core.START_PARAMS, g.bmDials || this._dialsAusGenom(g));
        // BOOT-LITERAL-ABSCHIED (18.07.): ohne explizite Guss-Farbe greift die
        // Anker-Palette des Gesetzbuchs (fail-closed — der Kern ist oben schon
        // als warm bewiesen, die Tabellen sind Vertragsfläche).
        const anker = this._menschAnkerFarben();
        if (!anker && (typeof g.skinColor !== "number" || typeof g.hairColor !== "number")) {
            this.log("KÖRPER-KERN ohne Paletten (SKIN_TONES/HAIR_COLORS) — fail-closed, kein Ersatz-Ton.", "ERROR");
            return null;
        }
        const skinCol = typeof g.skinColor === "number" ? g.skinColor : anker.skin;
        const hairCol = typeof g.hairColor === "number" ? g.hairColor : anker.hair;
        // DIE GROBSTUFE TRÄGT DEN LEIB VOR DEM BILD (B5): liegt vor dem ersten Weltbild nur die Grobstufe im Memo (die feine
        // bestellt `_ofenSpielerVorlagen` erst nach dem Bild), ist sie die Nah-Gestalt — nie ein Haupt-Faden-Guss der feinen
        // (K60-2: 2,4 s); die feine tauscht nach ihrer Ankunft ein (`_leibFeinTausch`)
        const memo = AnazhRealm._tierOfenMemo;
        const grob =
            g.eigen !== true &&
            !this.state._weltbildDa &&
            !!memo &&
            memo.has(this._ofenMenschKey(dials, skinCol, hairCol, 1)) &&
            !memo.has(this._ofenMenschKey(dials, skinCol, hairCol, 0));
        const t0 = this._ofenMenschTemplate(dials, skinCol, hairCol, grob ? 1 : 0, g.eigen === true);
        if (!t0 || !t0.teile || !t0.teile.mensch) {
            this.log("Mensch-Ofen fiel aus (kalter Kern?) — fail-closed, kein Ersatz-Körper.", "ERROR");
            return null;
        }
        const klon = t0.root.clone(true);
        const teile = {};
        klon.traverse((n) => {
            if ((n.isGroup || n.isBone) && n.name) teile[n.name] = n;
        });
        AnazhRealm._ofenKlonRebind(klon, teile);
        const f = (8 * AnazhRealm.PLAYER_KH) / 6.0;
        const wrap = this._leibHuelle();
        wrap.scale.setScalar(f);
        // DIE SOHLE STEHT AUF oy (Gelände H5, Labor = Welt): der Kern stellt den Knöchel trochanterY − Bein über den Ursprung der
        // Vorlage, die Sohle footBelowAnkle darunter — das Labor erdet über footBelowAnkle, die Welt setzt die tiefste Fläche der
        // Vorlage in der Ruhe-Pose (die flache Sohle des Schuhs) auf oy. Bis H5 stand der Leib mit dem Ursprung auf oy, die
        // Sohle 2,6 cm unter der Sohle der Kapsel (gate:koerper-stand K8 fuss, Median −1,3 cm an der Wiese).
        if (!Number.isFinite(t0.sohleY)) {
            const box = new THREE.Box3();
            const b = new THREE.Box3();
            t0.root.updateMatrixWorld(true);
            t0.root.traverse((n) => {
                if (!n.isMesh || !n.geometry || !n.geometry.attributes.position) return;
                if (!n.geometry.boundingBox) n.geometry.computeBoundingBox();
                box.union(b.copy(n.geometry.boundingBox).applyMatrix4(n.matrixWorld));
            });
            t0.sohleY = Number.isFinite(box.min.y) ? box.min.y : 0;
        }
        wrap.position.y = oy - f * t0.sohleY;
        wrap.add(klon);
        wrap.userData._creatureSkin = true; // die 1st-Person-Regel deckt den GANZEN Leib (wie zuvor die Haut)
        wrap.userData.hautTon = skinCol; // die EINE Farb-Wahrheit für Leser (Band/Tint — Genom/Studio-Zahl)
        // Die Grobstufe aus derselben Pipe (lod 1, gelenkig — dasselbe Gesetz wie das Tier, `_gelenkGestalt`): unter
        // DEMSELBEN Wrap an die Knochen der feinen gebunden, Wurf und Stufen-Grenze aus der Kern-Zeile; fehlt sie, gibt
        // es keinen Menschen (fail-closed).
        const t1 = this._ofenMenschTemplate(dials, skinCol, hairCol, 1, g.eigen === true);
        const gelenk = this._gelenkGestalt(core, "koerper", wrap, klon, teile, t1);
        if (!gelenk) {
            this.log("Mensch: ohne gelenkige Grobstufe kein Körper (fail-closed).", "ERROR");
            return null;
        }
        gelenk.nahStufe = grob ? 1 : 0; // die Stufe, die nah trägt — die Grobstufe wartet auf den Tausch
        wrap.userData._gelenk = gelenk;
        this._gelenkStufe(wrap, 0);
        // der Leib meldet sich bei seinen Vorlagen an (die Grenze des Ofen-Memos, `_ofenVorlage`)
        this._ofenVorlagenBinden(wrap, [t0, t1]);
        const P2 = (n2) => teile[n2] || null;
        const rig = {
            hips: teile.mensch,
            spine: P2("torso"),
            chest: P2("torso"),
            neck: P2("head"),
            head: P2("head"),
            armL: { shoulder: P2("arm1"), elbow: P2("elbow1"), wrist: P2("hand1") },
            armR: { shoulder: P2("arm-1"), elbow: P2("elbow-1"), wrist: P2("hand-1") },
            legL: { hip: P2("hip1"), knee: P2("knee1"), ankle: P2("ankle1") },
            legR: { hip: P2("hip-1"), knee: P2("knee-1"), ankle: P2("ankle-1") },
            // kh in BAUM-Einheiten: der Animator schreibt ·kh-Welt-Beträge auf Knoten
            // UNTER wrap(·f) — kh/f hält die Amplituden welt-gleich.
            kh: kh / f,
            _baum: true,
            _morphDials: dials,
            // Die Hand-Mitte je Handgelenk (Ofen-Beipack, Hand-Raum): dort sitzt der Griff der Faust (_refreshHeldMesh).
            // Eigenes Feld, nie in armL/armR — deren Glieder setzt die Pose je Schlüssel auf neutral.
            handMitte: t0.handMitte || null,
            _skinMat: null, // GEFALLEN mit dem Inline-Bau — die Farb-Wahrheit ist userData.hautTon (Pipe: Vertex-Farben)
        };
        // V18.491.85 — Augen-Welle: iris/lid aus Ofen-Gelenken (fail-closed ohne Refs).
        // Nicht MOTION_RIG_MAP — eigene Welle außerhalb der Knochen-Map.
        rig.irisL = P2("irisL");
        rig.irisR = P2("irisR");
        rig.lidTL = P2("lidTL");
        rig.lidTR = P2("lidTR");
        rig.lidBL = P2("lidBL");
        rig.lidBR = P2("lidBR");
        wrap.userData._leibNah = klon; // die Nah-Gestalt (die Masse misst ihre Haut, nie die Fern-Gestalt)
        return { mesh: wrap, rig, kh, bones: [] };
    }

    // DIE LEIB-HÜLLE (E2): der Wrap jeder Gelenk-Gestalt (Mensch und Tier, beide Stufen) ist ein BÜNDEL. Ein Leib bewegt sich
    // und atmet in jedem Bild — lose zahlte jedes seiner Teile je Bild den ganzen r184-Weg (Render-Objekt, Pipeline-Prüfung,
    // Zug mit acht Attributen), im Bündel nur seinen Objekt-Gang (Lage, Knochen): gemessen in EINER Welt (Radeon, Regler voll,
    // 24 ABAB-Runden) der lose Weg des Leibs 425 → 66 µs je Takt, das Abspielen +253 µs; CPU-Takt p50 Genesis Third 5,9 → 5,8,
    // Wiese Third 7,7 → 7,6 ms, Ego gleich. Was das Bündel
    // zeichnet, stellt die Projektion je Pass (`_leibBuendelStand`); im Schatten-Pass ist es eine Gruppe (Override-Stoff).
    _leibHuelle() {
        return this._buendelTraegt() ? new THREE.BundleGroup() : new THREE.Group();
    }

    // DER STABILE KNOCHEN-NAME (dieselbe Klasse, die Haut): r184s SkinningNode liest die Knochen-Matrizen jeder
    // SkinnedMesh über `referenceBuffer("skeleton.boneMatrices")` (für die Bewegungs-Spur der Zeit-Auflösung dazu
    // `previousBoneMatrices`) — ohne Namen schreibt der WGSL-Builder `NodeBuffer_<Knoten-id>`, und jeder Knoten-Bau
    // eines Leibs trug seinen EIGENEN Quelltext: der Seelenwechsel in ein Tier kompilierte in der Welt bei JEDEM Wechsel
    // neu (Frost-Wand S2, Radeon +8 Module / +7 Pipelines je Durchgang, GTX +7/+6; zwei Wolf-Leiber unterschieden sich
    // im Vertex-Quelltext nur in `NodeBuffer_512404` ↔ `NodeBuffer_546844`). Je Draw gibt es genau EINE Knochen-Reihe
    // und ihre Vorgängerin → ein fester Name macht gleiche Gestalten gleich: ein Leib zeichnet mit den Programmen, die
    // die Welt für dieselbe Gestalt schon hat. Die Klasse reicht der TSL-Bauer `skinning` (das Bündel exportiert sie
    // nicht an window.THREE): sein Knoten an einer Probe-Haut mit einem Knochen.
    _knochenPufferName() {
        const probeHaut = new THREE.SkinnedMesh();
        probeHaut.bind(new THREE.Skeleton([new THREE.Bone()]));
        const SN = THREE.TSL.skinning(probeHaut).constructor;
        if (typeof SN.prototype.getSkinnedPosition !== "function")
            this.log(
                "KNOCHEN-PUFFER-NAME: r184-SkinningNode.getSkinnedPosition nicht gefunden (Vendor-Drift)",
                "ERROR"
            );
        else if (!SN.__anazhName) {
            const lageRoh = SN.prototype.getSkinnedPosition;
            SN.prototype.getSkinnedPosition = function (knochen = this.boneMatricesNode, lage = this.positionNode) {
                if (knochen && knochen.name == null && typeof knochen.setName === "function")
                    knochen.setName(knochen === this.previousBoneMatricesNode ? "knochenMatrixVor" : "knochenMatrix");
                return lageRoh.call(this, knochen, lage);
            };
            SN.__anazhName = true;
        }
    }

    // DAS VORWÄRMEN DER LEIBER (Lehre 14: im Leerlauf vorgebacken, nie synchron auf dem Interaktions-Pfad): der erste Wechsel
    // in eine Seele, deren Leib die Welt nie zeichnete, baute seine Programme im Spiel-Pfad (GTX, Frost-Wand S2: +5 Module /
    // +4 Pipelines — die Radeon hatte Wölfe schon gezeichnet). Liegt der Ofen-Vorrat (`_ofenVorratSteht`: jede Gattung warm im
    // Memo, der Leib ein Klon ohne Guss) und steht die Welt, legt sie je Seele,
    // die der Spieler annehmen kann (jede Tetrapoda-Art und der Mensch), EINEN Leib aus der EINEN Leib-Wahl in ihre Szene —
    // auf Maßstab 0: kein Pixel, keine Schatten-Fläche — und lässt ihn über DIE Erst-Zeichnung bauen (je Render-Aufruf ein
    // Knoten-Bau, die Pipeline asynchron, `_configureRenderer`). Hat jedes Teil in jedem seiner Pässe gezeichnet, geht er
    // und der nächste kommt; `state._leibWarm` ist das Ereignis. Kienspan (das Holz der CPU-Raster-Linsen, ohne Schatten)
    // wärmt nicht vor: der Software-Rasterer kompiliert dort Sekunden je Pipeline.
    _leibVorwaermen() {
        const st = this.state;
        if (st._leibWarm || !st._weltbildDa || st._holzProfil === "kienspan" || !st.renderer.__anazhErstZeichnung)
            return;
        if (!st._leibVorwaermung) {
            if (!this._ofenVorratSteht || !this._weltSteht()) return;
            st._leibVorwaermung = {
                offen: [...Object.keys(AnazhRealm.TETRAPODA_SOUL_MAP).map((a) => "bp_koerper_" + a), "human"],
                leib: null,
                takte: 0,
            };
        }
        const V = st._leibVorwaermung;
        if (V.leib) {
            const gezeichnet = this._erstZeichnungStand().gezeichnet;
            let fehlt = 0;
            V.leib.traverseVisible((o) => {
                const soll = o.isMesh
                    ? +st.camera.layers.test(o.layers) + +(o.castShadow && st.renderer.shadowMap.enabled)
                    : 0;
                const p = gezeichnet.get(o);
                if ((p ? p.size : 0) < soll) fehlt++;
            });
            // ein Leib, der in 600 Takten nicht ganz steht, ist ein Bruch der Erst-Zeichnung — laut, und der nächste kommt
            if (fehlt && ++V.takte < 600) return;
            if (fehlt)
                this._bruchMelden(
                    `LEIB-VORWÄRMEN: ${V.leib.name} steht nach ${V.takte} Takten nicht ganz (${fehlt} Teile)`
                );
            st.scene.remove(V.leib);
            this._disposeSoulGroup(V.leib);
            V.leib = null;
        }
        if (!this._ofenVorratSteht || !this._weltSteht()) return;
        const name = V.offen.shift();
        if (!name) {
            st._leibWarm = true;
            st._leibVorwaermung = null;
            return;
        }
        // die Seele einer Art entsteht beim ersten Wechsel aus ihrem Bauplan (`applyPlayerSoulFromBlueprint`): dieselben Teile
        const bp = this.state.blueprints && this.state.blueprints[name.slice(3)];
        const leib = this._leibDerSeele(
            name,
            this._getSoulDef(name) || (bp && { bodyParts: bp.parts }),
            "vorwaermen:" + name
        );
        if (!leib) return this._bruchMelden(`LEIB-VORWÄRMEN: kein Leib für „${name}"`);
        leib.name = "vorwaermen:" + name;
        leib.scale.setScalar(0);
        leib.traverse((o) => (o.frustumCulled = false));
        st.scene.add(leib);
        Object.assign(V, { leib, takte: 0 });
    }

    // DIE GELENK-GESTALT (S3, Lehre 19 — die Grobstufe ist gelenkig, das Standbild fiel an der Wurzel): EIN Wrap trägt
    // beide Klone; die Grobstufe (lod 1) bindet in der Ruhe-Pose an die Knochen der feinen — EIN Skelett je Gestalt (der
    // Ofen bindet jedes ihrer Teile, auch die starren mit Gewicht 1). Den Wurf liest sie aus der Kern-Zeile (`_ofenZeile`):
    // Stufe 0 wirft über `schatten` (1 = die Grobstufe ist ihr Zwilling), die Grobstufe wirft mit ihrem Teil `wurf.seh`,
    // jeder andere Teil nie; die Stufen-Grenze (`ab` × Größe, `hyst`) kommt aus derselben Zeile. Die Grobstufe ist Pflicht:
    // fehlt sie, ihre Zeile oder die Bindung eines Teils, schreit der Bau und liefert nichts (fail-closed).
    _gelenkGestalt(core, kind, wrap, klon, teile, t1) {
        const z0 = this._ofenZeile(core, kind, 0);
        const z1 = this._ofenZeile(core, kind, 1);
        const s1 = z1.zeile;
        if (!t1 || !t1.root || !z0.zeile || z1.stufe !== 1 || !s1 || !(s1.ab > 0) || !(z0.hyst > 0 && z0.hyst < 0.5)) {
            this.log(
                `GELENK-GESTALT ${kind}: die Grobstufe oder ihre Kern-Zeile (ab, hyst) fehlt — fail-closed`,
                "ERROR"
            );
            return null;
        }
        const fern = t1.root.clone(true);
        const seh = s1.wurf && Array.isArray(s1.wurf.seh) ? s1.wurf.seh : null;
        const meshes = [];
        const lose = [];
        fern.traverse((n) => {
            if (!n.isMesh) return;
            const namen = n.isSkinnedMesh ? n.userData.__skinJoints : null;
            if (!Array.isArray(namen) || !namen.length || namen.some((nm) => !teile[nm])) lose.push(n.name || n.type);
            n.castShadow = n.castShadow && s1.schatten === 1 && (!seh || seh.indexOf(n.userData.__seh) >= 0);
            meshes.push(n);
        });
        if (lose.length) {
            this.log(
                `GELENK-GESTALT ${kind}: ${lose.length} Teile der Grobstufe ohne Knochen der feinen — fail-closed`,
                "ERROR"
            );
            return null;
        }
        AnazhRealm._ofenKlonRebind(fern, teile); // EIN Skelett: die Grobstufe trägt die Knochen der feinen
        // EINE Körper-Kugel je Gestalt: die Grobstufe cullt (Bild und Kaskaden) gegen die Kugel der feinen — ihre eigene
        // (ohne die Fell-Schalen) ließ den Schweif im Gang hinaus (Pose-Probe gate:kreatur-kosten (R): 4 von 246 240).
        let kugel = null;
        klon.traverse((n) => {
            if (n.isMesh) n.castShadow = n.castShadow && z0.zeile.schatten === 0;
            if (!kugel && n.isSkinnedMesh && n.boundingSphere)
                kugel = n.boundingSphere.clone().applyMatrix4(n.matrixWorld);
        });
        const inv = new THREE.Matrix4();
        if (kugel)
            for (const m of meshes) m.boundingSphere = kugel.clone().applyMatrix4(inv.copy(m.matrixWorld).invert());
        wrap.add(fern);
        // DIE RUHE des Menschen: die Pose seiner Gelenke beim Bau (der Klon der Vorlage, die Ruhe-Pose des Ofens) —
        // jenseits der Grenze steht er in ihr (`_gelenkRuhe`). Das Tier ruht in der Kern-STAND_POSE (kein Satz nötig).
        const ruhe =
            kind === "kreatur"
                ? null
                : Object.keys(teile).map((nm) => {
                      const k = teile[nm];
                      return [k, k.position.clone(), k.quaternion.clone(), k.scale.clone()];
                  });
        return {
            nah: klon,
            fern,
            meshes,
            abM: s1.ab,
            hyst: z0.hyst,
            zwilling: z0.zeile.schatten === 1,
            istFern: true,
            // die Haltung steht fest (der Fall setzt sie, `_kreaturFaellt`): der Wechsel nach fern stellt nie in die Ruhe
            haltungFest: false,
            ruhe,
        };
    }

    // DER EINE STUFEN-SCHALTER der Gelenk-Gestalt (Tier, Mensch, Peer, Werkstatt): jenseits `ab` × Größe trägt die
    // Grobstufe das Bild, diesseits die feine — und die Grobstufe wirft als ihr Zwilling auf SHADOW_TWIN_LAYER (die
    // Haupt-Kamera sieht sie nie, die Kaskaden immer). Hysterese ±`hyst` (fern erst jenseits (1+h)·Grenze, zurück erst
    // innerhalb (1−h)·Grenze); geschaltet werden nur `visible` und die Ebenen, nur beim Wechsel. Jenseits ruht jeder Gang
    // (updateCreatures, der Peer-Tick, die Sicht-Kopie) außer dem eines laufenden Tiers (`_kreaturLaeuft`, Welle LF) —
    // der Wechsel nach fern stellt die Gestalt in ihre Ruhe (`_gelenkRuhe`), denn beide Stufen tragen dieselben Knochen;
    // eine Gestalt mit fester Haltung (`haltungFest`: der Gefallene, Welle LF kampf) bleibt in ihr. Rückgabe: fern?
    _gelenkStufe(gruppe, distSq) {
        const g = gruppe.userData._gelenk;
        const s = gruppe.scale.x || 1;
        const grenzSq = g.abM * g.abM * s * s;
        const h = g.hyst;
        const fern = !(distSq < grenzSq * (g.istFern ? (1 - h) * (1 - h) : (1 + h) * (1 + h)));
        if (fern !== g.istFern) {
            g.istFern = fern;
            g.nah.visible = !fern;
            g.fern.visible = fern || g.zwilling;
            // das Auge (Ebene 0) schaltet; den Wurf trägt die Wurf-Ebene, die `castShadow` schreibt (K72, `_wurfEbene`)
            const W = 1 << AnazhRealm.SHADOW_TWIN_LAYER;
            for (const m of g.meshes) m.layers.mask = ((fern ? 1 : 0) | (m.layers.mask & W)) >>> 0;
            // wer läuft, behält seinen Schritt (Welle LF, der ferne Gang: die Raten-Leiter wertet ihn jenseits weiter aus); eine
            // Gestalt, die ihre Haltung hält (`haltungFest`, gesetzt vom Fall `_kreaturFaellt`: die Tod-Lage rechnete mit ihr),
            // bleibt in ihr (Tod-Zensus „haltung": der stehend gefallene Hirsch drehte jenseits der Grenze legFL um 1,66 rad)
            if (fern && !g.haltungFest && !this._kreaturLaeuft(gruppe)) this._gelenkRuhe(gruppe);
        }
        return fern;
    }

    // DIE RUHE der Gelenk-Gestalt (S3): die Grobstufe hängt an den Knochen der feinen — wo der Gang ruht, stünde sie sonst
    // mitten im Schritt erstarrt (gate:kreatur-kosten (F): der ferne Mensch-Peer 0,454 rad, die Sicht-Kopie 1,064 rad). Das
    // Tier steht in der Kern-STAND_POSE (`_tierBaumNeutralStance`, dieselbe wie hinter der Anim-Leiter), der Mensch in der
    // Ruhe-Pose seiner Vorlage (die Pose, die das Standbild der Basis trug).
    _gelenkRuhe(gruppe) {
        const ruhe = gruppe.userData._gelenk.ruhe;
        if (!ruhe) return this._tierBaumNeutralStance(gruppe);
        for (const [k, p, q, s] of ruhe) {
            k.position.copy(p);
            k.quaternion.copy(q);
            k.scale.copy(s);
        }
    }

    // ═══ KÖRPER-BEWEGUNG — DIE GANG-GESETZE ═══
    // EINE kanonische Gang-Mathe für animatePlayerSoul, _p2pUpdatePeer und _animateHumanoidRig.
    // Rein RENDER-seitig — kein Snapshot-/Worker-/Sim-Pfad liest diese Zahlen.
    // Linse: gate:koerper-bewegung.

    // DAS EINE GANG-GESETZ DES ZWEIBEINERS (K07): Takt, Fußweg und Tastgrad aus tetrapoda `gangSchritt` — dieselbe Formel,
    // nach der die Tiere gehen — mit der Zweibeiner-Zeile fx.bewegung.gang; L = die GEBAUTE Beinlänge (einmal am Rig
    // vermessen, Welt-Maß aus der Gelenk-Skala). Die Phase bleibt weg-getrieben (2π je Doppelschritt Λ, ω = 2π·v/Λ).
    // Vorher eichte ein Faktor des Schritt-Blocks (4,0 × Bein ≈ 3,4 m je Schritt) den Takt auf 5,5 rad/s beim Basistempo:
    // beim Gehen 0,34 Schritte/s, zwei Schritt-Töne in sechs Sekunden, der Fuß glitt 130 % des Wegs.
    _gaitGesetz(rig, speed) {
        const core = typeof window !== "undefined" && window.__tetrapodaCore;
        if (!core || typeof core.gangSchritt !== "function")
            return AnazhRealm._kernPflichtBruch("tetrapoda:gangSchritt");
        const v = Number.isFinite(speed) && speed > 0 ? speed : 0;
        return core.gangSchritt(v, this._gaitBeinMass(rig).L, this._gangZeile(true));
    }
    // DIE ZEILE DES GANGS IN DER WELT (K07): das Gang-Gesetz misst Froude-Zahl und Becken an der Schwere der Welt
    // (`state.gravity`, die DSL setzt sie) — Mensch und Tier lesen sie aus EINER Zeile, Schritt und Becken aus derselben
    // (der Mensch: fx.bewegung.gang, das Tier: GANG_GESETZ). Vorher las der Schritt GANG_GESETZ.g, das Becken ein Literal
    // 9,81, und eine Welt mit anderer Schwere ging wie die Erde. Memo je Schwere und Block.
    _gangZeile(mensch) {
        const g = -this.state.gravity;
        const Z = AnazhRealm._bewegungsBlock("gang", AnazhRealm.GANG_FELDER);
        let m = this._gangZeileMemo;
        if (!m || m.g !== g || m.Z !== Z)
            m = this._gangZeileMemo = { g, Z, mensch: Object.assign({}, Z, { g }), tier: { g } };
        return mensch ? m.mensch : m.tier;
    }
    // Die Bein-Maße des Rigs, einmal vermessen: Ober- und Unterschenkel im Gelenk-Raum (l1, l2), die Welt-Skala der
    // Hüfte lotrecht (wpl) und längs (wz — das Becken des Menschen ist ungleich skaliert, 0,93 quer und längs: ein
    // Fußweg in Metern ist längs ein anderes Maß im Gelenk-Raum als lotrecht, sonst kurzt die Pose den Stand um 7 % und
    // der Fuß gleitet), die Beinlänge in Metern (L = (l1 + l2)·wpl — die L, an der das Gang-Gesetz die Schrittlänge misst).
    _gaitBeinMass(rig) {
        if (rig && rig._beinMass) return rig._beinMass;
        let l1 = 0,
            l2 = 0,
            wpl = 0,
            wz = 0;
        if (rig && rig.legL && rig.legL.hip && rig.legL.knee && rig.legL.ankle) {
            const sv = this._gaitTmpV || (this._gaitTmpV = new THREE.Vector3());
            rig.legL.hip.getWorldScale(sv);
            wpl = Math.abs(sv.y) || 1;
            wz = Math.abs(sv.z) || wpl;
            l1 = rig.legL.knee.position.length();
            l2 = rig.legL.ankle.position.length();
        }
        const M = { l1, l2, wpl, wz, L: (l1 + l2) * wpl };
        if (rig && M.L > 0.1) rig._beinMass = M;
        return M;
    }
    // POSEN-BLEND: w(speed) exp-geglättet statt hartem isMoving-Schnitt — Rampe 0.25→0.55 m/s, k=10,
    // plus harte ±0.2-Steilheits-Wand je Tick. NaN-Wände VOR dem Gedächtnis.
    _gaitBlendStep(wPrev, speed, dt) {
        const w0 = Number.isFinite(wPrev) ? Math.min(1, Math.max(0, wPrev)) : 0;
        const v = Number.isFinite(speed) && speed > 0 ? speed : 0;
        const ziel = Math.min(1, Math.max(0, (v - 0.25) / 0.3));
        const d = Number.isFinite(dt) && dt > 0 ? Math.min(0.1, dt) : 0.016;
        let dw = (ziel - w0) * (1 - Math.exp(-10 * d));
        if (dw > 0.2) dw = 0.2;
        else if (dw < -0.2) dw = -0.2;
        return w0 + dw;
    }
    // ZWEI-KNOCHEN-IK (Kosinussatz) in der Sagittal-Ebene; vor/unten = Ziel-Offset in l1/l2-Einheiten.
    // hip = rotation.x (negativ = Bein vor), knee ≥ 0 beugt NACH HINTEN. Ziel im Hüftpunkt oder außer
    // Reichweite → gestreckt Richtung Ziel, reached=false — nie NaN.
    _twoBoneIK(l1, l2, vor, unten) {
        const L1 = Number(l1);
        const L2 = Number(l2);
        if (!(L1 > 1e-6) || !(L2 > 1e-6)) return { hip: 0, knee: 0, reached: false };
        const dF = Number.isFinite(vor) ? vor : 0;
        const dU = Number.isFinite(unten) ? unten : 0;
        let d = Math.hypot(dF, dU);
        if (!(d > 1e-6)) return { hip: 0, knee: 0, reached: false }; // Ziel = Hüftpunkt
        const at = Math.atan2(dF, dU); // Ziel-Winkel von der Senkrechten (vorwärts positiv)
        if (d >= L1 + L2 - 1e-6) return { hip: -at, knee: 0, reached: false }; // außer Reichweite: gestreckt
        const minD = Math.abs(L1 - L2) + 1e-6;
        if (d < minD) d = minD;
        const cosK = Math.max(-1, Math.min(1, (L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2)));
        const knie = Math.PI - Math.acos(cosK);
        const cosG = Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d)));
        const hip = -(at + Math.acos(cosG));
        if (!Number.isFinite(hip) || !Number.isFinite(knie)) return { hip: 0, knee: 0, reached: false };
        return { hip, knee: knie, reached: true };
    }
    // (4) HANG-PITCH aus zwei Bodenproben (vorn/hinten). rotation.x-Konvention:
    // +x kippt die Nase ABWÄRTS ⇒ vorn höher → negativ (die Nase hebt sich).
    // Klemme ±GANG_DECKEL_RAD (0,6 rad, ~34°) — steiler ist Kletterwand, kein Gang (`_kreaturKletterwand`).
    _slopePitch(gVorn, gHinten, spann) {
        if (!Number.isFinite(gVorn) || !Number.isFinite(gHinten) || !(spann > 1e-3)) return 0;
        const p = Math.atan2(gHinten - gVorn, spann);
        const d = AnazhRealm.GANG_DECKEL_RAD;
        return Math.max(-d, Math.min(d, p));
    }
    // DER EINE GANG-TICK (Chokepoint Spieler + Peers): Weg-Phase am Halter akkumulieren, Blend-Gewicht
    // glätten, Amplitude mit dem Tempo skalieren (≈1 Basis, 1.3 Sprint). opts.ik=true rüstet Fuß-IK —
    // NUR der lokale Avatar (Budget); Peers tragen Blend + Weg-Takt ohne Boden-IK.
    _gaitTick(mesh, halter, speed, dt, opts) {
        const rig = mesh && mesh.userData && mesh.userData.rig;
        if (!rig || !halter) return null;
        const v = Number.isFinite(speed) && speed > 0 ? speed : 0;
        const d = Number.isFinite(dt) && dt > 0 ? dt : 0;
        const emoF = opts && Number.isFinite(opts.emoFaktor) && opts.emoFaktor > 0 ? opts.emoFaktor : 1;
        const gs = this._gaitGesetz(rig, v);
        const g =
            halter._gait || (halter._gait = { w: 0, amp: 1, ik: null, S: 0, tast: 0.5, auf: Math.PI, omega: 0, L: 0 });
        // DER STEHENDE FUSS HÄLT (K07, tetrapoda `gangPhaseHaelt`): ändert sich die Zeile (Tempo, Gangart, Emotion), setzt
        // sich die Phase so, dass das stehende Bein sein Fuß-Ziel behält; aus dem Stand (S0 = 0) setzt das nähere Bein in
        // der Mitte seines Stands ein (der Anlauf). Vorher lief die Phase weiter: der gelockte Fuß lag nach dem Tempo-Sprung
        // hinter dem Ziel des Laufs, das Becken reichte ihn nicht, der Lock löste (je 1 Löser bei 5,16 und 6,75 m/s).
        const S1 = gs.S / emoF;
        if (gs.omega > 0) {
            const steht = !(halter._gaitW > 0.05) || !(g.S > 0);
            const S0 = steht ? 0 : g.S;
            if (steht || Math.abs(S0 - S1) > 1e-9 || g.tast !== gs.tast)
                halter.walkPhase = window.__tetrapodaCore.gangPhaseHaelt(
                    Number.isFinite(halter.walkPhase) ? halter.walkPhase : 0,
                    S0,
                    g.tast,
                    S1,
                    gs.tast
                );
        }
        halter.walkPhase = (halter.walkPhase || 0) + d * gs.omega * emoF;
        halter._gaitW = this._gaitBlendStep(halter._gaitW, v, d);
        g.w = halter._gaitW;
        // das Fuß-Ziel des Gesetzes: der Fußweg im Stand (die Emotion reist als Kadenz — bei gleichem Weg kürzt sie den
        // Schritt, der Fuß im Stand bleibt stehen), der Tastgrad, die Phase des Aufsetzens (2π·(1 − Tastgrad)), die Beinlänge
        g.S = S1;
        g.tast = gs.tast;
        g.hub = gs.hub;
        g.auf = 2 * Math.PI * (1 - gs.tast);
        g.omega = gs.omega * emoF;
        g.L = this._gaitBeinMass(rig).L;
        // ZWILLINGS-ABSCHIED (19.07.): der „|| 6"-Nebenzwilling fiel — der
        // Falsy-Arm (nur vor der Boot-Eichung erreichbar) liest die Eichungs-
        // Wahrheit selbst (fail-closed via _bewegungsKoeff, kurzgeschlossen).
        const vRef = Math.max(
            1,
            Number(this.state.speed) ||
                AnazhRealm._bewegungsKoeff("speed").base + AnazhRealm._bewegungsKoeff("speed").leicht
        );
        g.amp = Math.max(0.7, Math.min(1.3, 0.55 + 0.45 * (v / vRef)));
        g.ik = opts && opts.ik ? this._gaitIKPrep(mesh, opts.soleY, opts.yaw) : null;
        // ohne Boden-IK (Luft, Peer) löst jeder Fuß-Lock — die Landung friert die Stand-Füße frisch ein
        const ikC = !g.ik && mesh.userData && mesh.userData._gaitIK;
        if (ikC) ikC.lockL.on = ikC.lockR.on = false;
        return g;
    }
    // DER STAND-LESER DER SICHT (Q4 Erdung, Entscheid a der Leben-Synthese): die Sim steht auf dem Gesetz, die Sicht auf
    // dem, was das Auge sieht. Steht der Körper auf einem Bauwerk (`struktur`), trägt dessen Oberkante (eben per
    // Definition); sonst die Boden-Karte (`_bodenSichtAt`, bilinear, das gezeichnete Mesh) — solange sie im
    // STAND_SICHT_BAND um den Träger liegt. Außerhalb (Höhle, Überhang: die Karte trägt die Oberkante der Säule) liest er das
    // GESETZ AM PUNKT — den Boden unter dem Körper ab dem Träger (`_koerperBodenUnter`: abwärts, der Hang zwei Meter hinauf),
    // im selben Band. Prüfung 2 K02a: dort trug der Träger JEDEN Punkt — die Pfoten des Wolfs am Wandfuß standen auf der
    // Höhe seines Leibs, nicht auf dem Boden unter ihnen (die Haut 0,30–0,46 m im Fels in 5 von 8 Blickrichtungen), und der
    // in die Wand laufende Wolf stand auf seinem 0,5-m-Grund-Cache 0,55 m unter dem Hang. Die Kosten folgen den Körpern
    // unter Fels (nur dort tastet das Feld); ohne Karte (fern, ungebaut) trägt der Träger. Leser: Fuß-IK des Menschen
    // (`_gaitBodenY`) und des Tiers (`_kreaturFussBoden`), Tier-Lage (`_creatureSlopeProben`, die Mitte im Frame-Takt), der
    // Stoß-Schritt, die Tod-Lage. Die Karte am Punkt liest `_bodenSichtAt` (am Chunk-Rand die des Nachbarn).
    // Über einem gefrorenen Spiegel (`_eisAt`, stoffe.K3) sieht das Auge das Eis, nie den Grund unter ihm.
    _standSicht(x, z, traegerY, struktur) {
        if (struktur === true) return traegerY;
        const band = AnazhRealm.STAND_SICHT_BAND;
        const karte = this._bodenSichtAt(x, z);
        const eis = this._eisAt(x, z, traegerY + band, 2 * band, karte);
        const k = eis !== null && !(karte >= eis) ? eis : karte;
        if (!Number.isFinite(traegerY)) return Number.isFinite(k) ? k : NaN;
        if (!Number.isFinite(k)) return traegerY;
        if (Math.abs(k - traegerY) <= band) return k;
        const g = this._koerperBodenUnter(x, traegerY, z);
        return Number.isFinite(g) && Math.abs(g - traegerY) <= band ? g : traegerY;
    }
    // Der Boden unterm Fuß — der EINE Proben-Chokepoint des Biped-IK: der Stand-Leser der Sicht um den TRÄGER desselben
    // Kapsel-Schritts (`_stepCharacter` stempelt `_kapselTraegerY`/`_kapselStruktur`). Vorher las die Probe das Gelände
    // (`getTerrainHeightAt`): auf dem Haus-Podest zog die Fuß-IK Becken und Sohlen 0,25 m ins Podest, in jeder Höhle
    // stand die Probe auf der Wiese darüber und die IK schwieg (Leben-Prüfung N-D1, Kritik §2.1). Ohne Träger (in der Luft)
    // NaN — keine IK.
    _gaitBodenY(x, z) {
        const s = this.state;
        return this._fussBoden(x, z, s._kapselTraegerY, s._kapselStruktur);
    }
    // DER BODEN UNTER EINEM FUSS (leib.K2) — Mensch (`_gaitBodenY`) und Tier (`_kreaturFussBoden`): die Auflage eines Baus
    // (`_auflageAt` um den Träger, eine Stufe hinauf oder hinab), wo sie nicht unter dem gezeichneten Boden liegt — auch, wenn
    // der Leib noch auf dem Gelände steht (die erste Stufe, die halb vergrabene Treppe am Hang); sonst der Stand-Leser der
    // Sicht, auf dem Bau nur im selben Band (der Fuß neben der untersten Stufe), sonst der Träger. Vorher trug auf dem Bau der
    // Träger der Kapsel JEDEN Fuß: auf der Treppe stand der zweite eine Stufe in der Luft oder im Stein.
    _fussBoden(x, z, traegerY, struktur) {
        const stufe = AnazhRealm.PLAYER_STEP_UP;
        const a = this._auflageAt(x, z, traegerY, null, stufe);
        const k = this._standSicht(x, z, traegerY, false);
        if (a > -Infinity && !(k > a)) return a;
        return struktur !== true || Math.abs(k - traegerY) <= stufe ? k : traegerY;
    }
    // Die Bodenprobe je Frame: der Stand-Leser ist eine Karten-Lesung (bilinear), kein Feld-Scan — der Fuß, der auf ein
    // Podest tritt, liest es im selben Frame (der frühere 0,3-m-Cache hielt den alten Boden).
    // DIE SOHLE RUHT AUF DEM, WAS UNTER IHR TRÄGT (leib.K2): der Boden des Fußes (`_gaitBodenY`) an sechs Stellen von der
    // Ferse bis zur Spitze längs des Blicks (`ik.sohle`, Meter vor dem Knöchel); die Gerade der Sohle (waagrecht oder durch zwei
    // Stellen, bis ± 0,45 rad — das Sprunggelenk) liegt über jeder Stelle und trägt die meisten (≤ 1 cm über ihnen), bei
    // Gleichstand die flachere: am Hang die Neigung des Hangs, auf der Treppe der Auftritt (Ferse oder Spitze über der tieferen
    // Stufe). p.g ist ihre Höhe unter dem Knöchel, p.kipp ihre Neigung, p.traegt die Zahl der getragenen Stellen, p.vorn die
    // vorderste von ihnen (m vor dem Knöchel), p.luecke die größte Höhe der Sohle über einer Stelle (NaN: eine ohne Boden). Vorher las
    // die Probe den Punkt unter dem Knöchel und kippte nach zwei Proben ± 0,12 m: auf der Treppe stand die Spitze in der
    // nächsten Stufe (gate:koerper-stand K8 stufe p95 16 cm).
    _gaitProbe(p, x, z, ik) {
        const u = (ik && ik.sohle) || AnazhRealm.SOHLE_PUNKT;
        const [s, c] = [Math.sin(ik ? ik.yaw : 0), Math.cos(ik ? ik.yaw : 0)];
        const y = this._gaitProbeY || (this._gaitProbeY = []);
        for (let k = 0; k < u.length; k++) y[k] = this._gaitBodenY(x + u[k] * s, z + u[k] * c);
        [p.x, p.z, p.yaw, p.g, p.kipp, p.traegt, p.luecke, p.vorn] = [x, z, ik && ik.yaw, NaN, 0, 0, NaN, 0];
        if (!Number.isFinite(y[u.indexOf(0)])) return;
        for (let i = 0; i < u.length; i++)
            for (let j = i; j < u.length; j++) {
                const b = j > i ? Math.max(-0.4831, Math.min(0.4831, (y[j] - y[i]) / (u[j] - u[i]))) : 0; // tan 0,45
                let [a, n, l, v] = [-Infinity, 0, 0, 0];
                for (let k = 0; k < u.length; k++) if (y[k] - b * u[k] > a) a = y[k] - b * u[k];
                for (let k = 0; k < u.length; k++) {
                    const h = a + b * u[k] - y[k];
                    if (h <= 0.01) [n, v] = [n + 1, Math.max(v, u[k])];
                    l = h > l || !(h >= 0) ? h : l;
                }
                if (n > p.traegt || (n === p.traegt && Math.abs(b) < Math.abs(Math.tan(p.kipp))))
                    [p.g, p.kipp, p.traegt, p.luecke, p.vorn] = [a, Math.atan(b), n, l, v];
            }
    }
    // DER FUSS SETZT AUF, WO SEINE SOHLE AM MEISTEN TRÄGT (leib.K2): beim Aufsetzen rückt der Lock längs des Blicks um bis zu
    // ± 0,12 m (je 3 cm, der kleinste Versatz zuerst) an die Stelle, an der die Gerade der Sohle die meisten ihrer Stellen trägt
    // (`_gaitProbe`) und 4 cm vor der Spitze nichts über sie steigt — auf der Treppe auf den Auftritt, die Spitze vor der
    // Setzstufe (im späten Abrollen neigt sich die Kappe des Schuhs um ihre Höhe × sin φ nach vorn: an der Kante stand sie
    // 13–15 cm in der nächsten Stufe); auf stetigem Boden (keine Stelle 5 cm unter der Sohle, frei vor ihr) bleibt der Fuß,
    // wo die Pose ihn setzt. Vorher fror er dort ein, wo die Pose ihn hinstellte, mitten über der Kante einer Stufe.
    _gaitSetzen(ik, probe, lock) {
        const [s, c, x, z] = [Math.sin(ik.yaw), Math.cos(ik.yaw), lock.x, lock.z];
        const vor = ik.sohle ? ik.sohle[ik.sohle.length - 1] + 0.04 : 0;
        let best = null;
        for (const d of [0, 0.03, -0.03, 0.06, -0.06, 0.09, -0.09, 0.12, -0.12]) {
            this._gaitProbe(probe, x + d * s, z + d * c, ik);
            const wach = this._gaitBodenY(probe.x + vor * s, probe.z + vor * c);
            probe.wert = probe.traegt + (wach > probe.g + vor * Math.tan(probe.kipp) + 0.01 ? 0 : 100);
            if (!best || probe.wert > best.wert) best = { ...probe };
            if (!ik.sohle || (best.wert >= 100 && (best.traegt === ik.sohle.length || best.luecke <= 0.05))) break;
        }
        Object.assign(probe, best);
        [lock.x, lock.z] = [best.x, best.z];
    }
    // Fuß-IK-Kontext, einmal vermessen: Segment-Längen aus Gelenk-Offsets × Welt-Skala, Knöchel→Sohle
    // aus der Neutral-Pose. Fehlende Gelenke / ungebauter Chunk → null (kein IK diesen Frame).
    _gaitIKPrep(mesh, soleY, yaw) {
        const r = mesh && mesh.userData && mesh.userData.rig;
        if (!r || !Number.isFinite(soleY)) return null;
        const L = r.legL;
        const R = r.legR;
        if (!L || !R || !L.hip || !L.knee || !L.ankle || !R.hip || !R.knee || !R.ankle || !r.hips) return null;
        let ik = mesh.userData._gaitIK;
        if (!ik) {
            const tv = this._gaitTmpV || (this._gaitTmpV = new THREE.Vector3());
            L.hip.getWorldScale(tv);
            const wpl = Math.abs(tv.y) || 0;
            const wz = Math.abs(tv.z) || wpl;
            const l1 = L.knee.position.length() * wpl;
            const l2 = L.ankle.position.length() * wpl;
            if (!(l1 > 0.02) || !(l2 > 0.02)) return null;
            L.ankle.getWorldPosition(tv);
            const soleH = Math.max(0, tv.y - soleY);
            r._sohle = this._gaitSohle(mesh, L.ankle);
            L.ankle.getWorldScale(tv);
            const sohle = r._sohle
                ? [-1, -0.5, 0, 1 / 3, 2 / 3, 1].map((f) => tv.z * (f < 0 ? -f * r._sohle[2] : f * r._sohle[0]))
                : null;
            ik = mesh.userData._gaitIK = {
                sohle,
                l1,
                l2,
                wpl,
                wz,
                soleH,
                hang: 0,
                soleY: 0,
                yaw: 0,
                probeL: { x: NaN, z: NaN, g: NaN },
                probeR: { x: NaN, z: NaN, g: NaN },
                lockL: { on: false, x: 0, z: 0 },
                lockR: { on: false, x: 0, z: 0 },
                footL: { x: mesh.position.x, z: mesh.position.z },
                footR: { x: mesh.position.x, z: mesh.position.z },
            };
        }
        ik.soleY = soleY;
        ik.yaw = Number.isFinite(yaw) ? yaw : 0;
        // der stehende Fuß liest am Ort, an dem er aufsetzte (`_gaitSetzen`) — einmal je Stand und Blick —, der schwingende
        // unter dem Knöchel der Pose
        for (const [p, l, f] of [
            [ik.probeL, ik.lockL, ik.footL],
            [ik.probeR, ik.lockR, ik.footR],
        ])
            if (!(l.on && p.x === l.x && p.z === l.z && p.yaw === ik.yaw))
                this._gaitProbe(p, l.on ? l.x : f.x, l.on ? l.z : f.z, ik);
        if (!Number.isFinite(ik.probeL.g) || !Number.isFinite(ik.probeR.g)) return null;
        // leichte RUMPF-Neigung am Hang: die Fuß-Proben entlang der Blick-
        // Achse tragen die Steigung (exp-geglättet; Füße beisammen → 0).
        const sep = (ik.footL.x - ik.footR.x) * Math.sin(ik.yaw) + (ik.footL.z - ik.footR.z) * Math.cos(ik.yaw);
        let ziel = 0;
        if (Math.abs(sep) > 0.15) {
            ziel =
                sep > 0
                    ? this._slopePitch(ik.probeL.g, ik.probeR.g, Math.abs(sep))
                    : this._slopePitch(ik.probeR.g, ik.probeL.g, Math.abs(sep));
        }
        ik.hang += (ziel - ik.hang) * 0.12;
        if (!Number.isFinite(ik.hang)) ik.hang = 0;
        return ik;
    }
    // DIE SOHLE DES GEBAUTEN FUSSES (leib.K2): ein Fuß ohne Zehen-Gelenk rollt über den Punkt seiner Sohle, der den Boden trägt
    // — eine ebene Sohle über ihre Spitze. [Spitze vor, Sohle unter, Ferse vor] dem Knöchel im Knöchel-Raum der Bind-Pose (die
    // Haut, die er trägt; nie die Pose des ersten Takts): die vorderste Stelle der Unterkante (≤ 0,02 Maß über der tiefsten),
    // die hinterste der Haut (die Ferse, < 0). Vorher hielt
    // die IK den Ballen der Zeile (0,46 E vor dem Knöchel), die starre Spitze 0,31 E weiter tauchte im späten Abrollen
    // 3–6,5 cm in den Boden (gate:koerper-stand K8 falllinie).
    _gaitSohle(mesh, knoechel) {
        const v = new THREE.Vector3();
        const M = new THREE.Matrix4();
        const p = [];
        mesh.traverse((o) => {
            const b = o.isSkinnedMesh ? o.skeleton.bones.indexOf(knoechel) : -1;
            if (b < 0) return;
            const { skinIndex: si, skinWeight: sw, position: pa } = o.geometry.attributes;
            M.multiplyMatrices(o.skeleton.boneInverses[b], o.bindMatrix);
            for (let i = 0; i < pa.count; i++)
                for (let k = 0; k < 4; k++)
                    if (si.getComponent(i, k) === b && sw.getComponent(i, k) > 0.5)
                        p.push(v.fromBufferAttribute(pa, i).applyMatrix4(M).toArray());
        });
        if (!p.length) return null;
        const y0 = Math.min(...p.map((q) => q[1]));
        return [Math.max(...p.filter((q) => q[1] <= y0 + 0.02).map((q) => q[2])), -y0, Math.min(...p.map((q) => q[2]))];
    }
    // FUSS-IK + FOOT-LOCK, NACH der Posen-Blende: Becken senkt sich aufs tiefere Bein, der Stance-Fuß
    // lockt an seiner gecachten Boden-Position (Two-Bone-IK), der Rumpf lehnt in den Hang; das
    // Schwung-Bein bleibt Pose. Der Lock löst, sobald das Ziel die Reichweite verlässt (kein Spagat/Pop).
    _gaitApplyFussIK(r, walkPhase, w, ik) {
        // im Stand ohne Gang liest jeder Fuß den Boden unter dem Knöchel DIESER Pose (leib.K2), bevor das Becken sinkt: die
        // Probe der Vorbereitung stand unter dem Knöchel des vorigen Takts — nach dem Gang 1,2 m vor dem Leib, an der Kante des
        // Genesis-Platzes 0,33 m tiefer (das Becken sank im ersten Stand-Takt bis zum Deckel, gate:kampf-gefuehl E)
        if (w < 0.35)
            for (const [leg, p, f] of [
                [r.legL, ik.probeL, ik.footL],
                [r.legR, ik.probeR, ik.footR],
            ]) {
                const av = leg.ankle.getWorldPosition(this._gaitTmpV || (this._gaitTmpV = new THREE.Vector3()));
                [f.x, f.z] = [av.x, av.z];
                if (p.x !== f.x || p.z !== f.z || p.yaw !== ik.yaw) this._gaitProbe(p, f.x, f.z, ik);
            }
        const dyL = Math.max(-0.7, Math.min(0.7, ik.probeL.g - ik.soleY));
        const dyR = Math.max(-0.7, Math.min(0.7, ik.probeR.g - ik.soleY));
        // Becken: nur SENKEN (das tiefere Bein muss reichen; heben macht die Physik).
        let drop = Math.min(dyL, dyR, 0) * 0.9;
        const reach = ik.l1 + ik.l2;
        if (drop < -0.3 * reach) drop = -0.3 * reach;
        if (drop < -0.005 && r.hips && ik.wpl > 0) r.hips.position.y += drop / ik.wpl;
        if (r.spine) r.spine.rotation.x += ik.hang * 0.35;
        // der Stand jedes Beins kommt aus dem Gang-Gesetz (die Pose dieses Takts, _animateHumanoidRig)
        const st = r._gangStand;
        const standL = !st || st[0],
            standR = !st || st[1];
        // DER ROLLENDE FUSS (tetrapoda gangRolle, die Pose dieses Takts): der Lock hält den Fuß, wie er aufsetzte; im späten
        // Stand steht sein Knöchel um heb höher und um dx (im Fußweg) weiter vorn — die Stelle der Sohle, die trägt, bleibt
        const rolle = r._gangRoll || [null, null];
        // EINE SCHWELLE (K07): R (`_gaitReich`) führt das Becken des Gesetzes und hält den stehenden Fuß. Liegt ein
        // gelockter Fuß jenseits von R (der Boden der Probe weicht vom Ruhe-Maß der Pose ab — die Verhältnisse 0,9951 bis
        // 0,9969 lösten 3 von 213 Stand-Takten beim Gehen), senkt sich das Becken um den Fehlbetrag; der Lock löst nur, wo
        // auch das nicht reicht (vorn/hinten jenseits von R oder mehr als 0,05 Bein — Stufe, Kante: dort tritt der Fuß).
        if (w >= 0.35 && r.hips && ik.wpl > 0) {
            let mehr = Math.max(
                standL && ik.lockL.on ? this._gaitLockBedarf(r.legL, ik, ik.probeL, ik.lockL, rolle[0]) : 0,
                standR && ik.lockR.on ? this._gaitLockBedarf(r.legR, ik, ik.probeR, ik.lockR, rolle[1]) : 0
            );
            if (mehr > 0 && mehr <= 0.05 * (ik.l1 + ik.l2)) r.hips.position.y -= mehr / ik.wpl;
        }
        this._gaitLegIK(r.legL, ik, ik.probeL, ik.lockL, ik.footL, standL, w, rolle[0]);
        this._gaitLegIK(r.legR, ik, ik.probeR, ik.lockR, ik.footR, standR, w, rolle[1]);
    }
    // DIE ROLLE IN DER EBENE DER SOHLE (leib.K2): der Knöchel des rollenden Fußes steigt und rückt vor — um die vorderste Stelle
    // der Sohle, die trägt (`probe.vorn`; die Rolle des Gesetzes dreht um die Spitze, `_gaitSohle`, ihr Überstand darüber hinaus
    // zieht ab: dx − Ü·(1 − cos φ), dy − Ü·sin φ), längs der Geraden, auf der die Sohle ruht (`probe.kipp`), nie längs der
    // Waagrechten; [vor, hinauf] in Metern. Vorher fehlte am Hang die Steigung × dx (die Falllinie hinauf tauchte der rollende
    // Fuß 3–6 cm ein), und treppab drehte er um die Spitze über der tieferen Stufe (er hob 3–12 cm von der Kante ab).
    _gaitRollung(rolle, probe, ik) {
        if (!(rolle && rolle.roll > 0)) return [0, 0];
        const ue = ik.sohle ? (ik.sohle[ik.sohle.length - 1] - (probe.vorn || 0)) / ik.wpl : 0;
        const [dx, dy] = [rolle.rollDx - ue * (1 - Math.cos(rolle.roll)), rolle.heb - ue * Math.sin(rolle.roll)];
        const [c, s] = [Math.cos(probe.kipp || 0), Math.sin(probe.kipp || 0)];
        return [(dx * c - dy * s) * ik.wpl, (dy * c + dx * s) * ik.wpl];
    }
    // Der Fehlbetrag eines gelockten Fußes an R: wie weit das Becken sinken muss, damit die Kette ihn erreicht (0 = er
    // liegt in R; Infinity = er liegt vorn/hinten jenseits von R, kein Senken hilft).
    _gaitLockBedarf(leg, ik, probe, lock, rolle) {
        const hv = this._gaitTmpV2 || (this._gaitTmpV2 = new THREE.Vector3());
        leg.hip.getWorldPosition(hv);
        const [rx, ry] = this._gaitRollung(rolle, probe, ik);
        const vor =
            ((lock.x - hv.x) * Math.sin(ik.yaw) + (lock.z - hv.z) * Math.cos(ik.yaw)) * (ik.wpl / (ik.wz || ik.wpl)) +
            rx;
        const unten = hv.y - (probe.g + ik.soleH) - ry;
        const R = AnazhRealm._gaitReich(ik.l1 + ik.l2);
        if (!Number.isFinite(unten) || Math.abs(vor) >= R) return Infinity;
        return Math.max(0, unten - Math.sqrt(R * R - vor * vor));
    }
    _gaitLegIK(leg, ik, probe, lock, foot, imStand, w, rolle) {
        const av = this._gaitTmpV || (this._gaitTmpV = new THREE.Vector3());
        leg.ankle.getWorldPosition(av); // FK nach Pose+Becken (frische Ahnen-Matrizen)
        foot.x = av.x;
        foot.z = av.z;
        const geht = w >= 0.35;
        const stance = geht ? imStand : true; // Idle: beide Füße geplantet
        if (!stance) {
            lock.on = false;
            return; // Schwung-Bein: die Pose bleibt (nur die Stance ankert)
        }
        let tx = foot.x;
        let tz = foot.z;
        if (geht) {
            if (!lock.on) {
                lock.on = true; // Stance-Beginn: den Fuß-Weltpunkt EINMAL einfrieren, wo seine Sohle am meisten trägt
                lock.x = foot.x;
                lock.z = foot.z;
                this._gaitSetzen(ik, probe, lock);
            }
            tx = lock.x;
            tz = lock.z;
        } else {
            // im Stand ohne Gang hält kein Lock (leib.K2): vorher trug der erste Schritt nach Halt oder Umsetzen den alten
            // Weltpunkt weiter — bis 4 m neben dem Fuß der Pose, die Sohle 3–20 cm neben dem Boden
            lock.on = false;
            if (Math.abs(probe.g - ik.soleY) < 0.03) return; // ebener Boden im Stand: die Kontrapost-Pose bleibt byte-alt
        }
        const hv = this._gaitTmpV2 || (this._gaitTmpV2 = new THREE.Vector3());
        leg.hip.getWorldPosition(hv);
        // der Vorlauf längs in das lotrechte Maß der Kette (das Becken ist längs ungleich skaliert, _gaitBeinMass)
        // der rollende Fuß im Gang (rolle aus der Pose): der Knöchel über der Stelle der Sohle, die trägt, die Sohle gekippt
        const rollt = geht && rolle && rolle.roll > 0;
        const [rx, ry] = this._gaitRollung(rollt && rolle, probe, ik);
        const vor =
            ((tx - hv.x) * Math.sin(ik.yaw) + (tz - hv.z) * Math.cos(ik.yaw)) * (ik.wpl / (ik.wz || ik.wpl)) + rx;
        const unten = hv.y - (probe.g + ik.soleH) - ry;
        if (!(unten > 0.05)) {
            lock.on = false;
            return; // Boden über der Hüfte (Klippe/ungebaut) — NaN-Wand
        }
        if (geht && Math.hypot(vor, unten) > AnazhRealm._gaitReich(ik.l1 + ik.l2) + 1e-6) {
            lock.on = false;
            return; // das Ziel entläuft der Reichweite → Lock löst, die Pose übernimmt
        }
        const res = this._twoBoneIK(ik.l1, ik.l2, vor, unten);
        leg.hip.rotation.x = res.hip;
        leg.knee.rotation.x = res.knee;
        // die Sohle liegt dem Boden an (der rollende Fuß kippt um seine Rolle darüber hinaus)
        const kipp = this._gaitSohlenKipp(tx, tz, ik.yaw, probe.g);
        leg.ankle.rotation.x = (rollt ? rolle.roll : 0) - (res.hip + res.knee) - probe.kipp;
        leg.ankle.rotation.z = kipp.quer;
    }
    // DIE SOHLE AM HANG (Gelände H5): die Neigung des gezeichneten Bodens unter dem Fuß (der Stand-Leser je ± 0,12 m längs und
    // quer zur Blick-Achse), bis ± 0,45 rad (das Sprunggelenk) — die Sohle kippt mit. Bis H5 blieb sie waagrecht: am 25°-Hang
    // quer stand ihr bergseitiger Rand im Boden (gate:koerper-stand K8 fuss, Median −1,4 cm). EIN Gesetz für Mensch UND Tier:
    // mit `leib` liest es den Boden der Pfote (`_kreaturFussBoden`), die Pfoten-IK des Tiers stellt ihre Sohle darauf (K8 huf);
    // längs trägt den Menschen die Gerade seiner Sohle (`_gaitProbe`, leib.K2), quer dieses Gesetz.
    _gaitSohlenKipp(x, z, yaw, g, leib) {
        const d = 0.12;
        const [s, c] = [Math.sin(yaw), Math.cos(yaw)];
        const y = (a, b) => {
            const v = leib ? this._kreaturFussBoden(leib, x + a, z + b) : this._gaitBodenY(x + a, z + b);
            return Number.isFinite(v) ? v : g;
        };
        const w = (dy) => Math.max(-0.45, Math.min(0.45, Math.atan(dy / (2 * d))));
        const k = this._gaitKippTmp || (this._gaitKippTmp = { laengs: 0, quer: 0 });
        k.laengs = w(y(d * s, d * c) - y(-d * s, -d * c));
        k.quer = w(y(d * c, -d * s) - y(-d * c, d * s));
        return k;
    }

    _animateHumanoidRig(rig, t, walkPhase, isMoving, underwater, emotions, gait) {
        if (!rig) return;
        const r = rig;
        const z = (b, v) => {
            if (b) b.rotation.z = v;
        };
        const x = (b, v) => {
            if (b) b.rotation.x = v;
        };
        // alles zuerst auf neutral (absolut → kein Drift zwischen Posen)
        for (const b of [r.hips, r.spine, r.chest, r.neck, r.head]) if (b) b.rotation.set(0, 0, 0);
        for (const side of [r.armL, r.armR, r.legL, r.legR])
            for (const k in side) if (side[k]) side[k].rotation.set(0, 0, 0);
        if (underwater) {
            // Schwimm-Pose: Körper waagerecht (group-Lehne in _animateHuman); hier kraulen die Arme, flattern
            // die Beine, der Kopf hebt leicht. Die Kraul-Winkel wohnen in fx.bewegung.schwimmen.pose.
            const SP = AnazhRealm._schwimmGesetz().pose;
            x(r.head, SP.kopf);
            const aA = isMoving ? SP.armZug : SP.armTreten;
            x(r.armL.shoulder, Math.sin(walkPhase) * aA - SP.armAb);
            x(r.armR.shoulder, Math.sin(walkPhase + Math.PI) * aA - SP.armAb);
            z(r.armL.shoulder, SP.armSpreiz);
            z(r.armR.shoulder, -SP.armSpreiz);
            const kA = isMoving ? SP.beinZug : SP.beinTreten;
            x(r.legL.hip, Math.sin(walkPhase * SP.beinTakt) * kA);
            x(r.legR.hip, Math.sin(walkPhase * SP.beinTakt + Math.PI) * kA);
            return;
        }
        // POSEN-BLEND: BEIDE Posen gerechnet und ADDITIV über das Null-Reset gelerpt (Ruhe ×(1−w) +
        // Gehen ×w) — kein Plopp an der Schwelle. Aufrufer ohne gait: w = isMoving ? 1 : 0.
        // Die Walk-Amplitude skaliert mit dem Tempo (gait.amp).
        const w = gait && Number.isFinite(gait.w) ? Math.max(0, Math.min(1, gait.w)) : isMoving ? 1 : 0;
        const amp = gait && Number.isFinite(gait.amp) ? Math.max(0.5, Math.min(1.6, gait.amp)) : 1;
        const add = (b, ax, v) => {
            if (b && v) b.rotation[ax] += v;
        };
        if (w < 0.999) {
            // ── RUHE ×(1−w) — Kontrapost (Standbein R): Hüfte kippt, Wirbelsäule lehnt gegen, Kopf zurück.
            // Das koerper-fx.motion-Profil (über die EINE Emotions-Brücke) führt Atem (breath/freq, auf das
            // Lab-idle normalisiert) und Emotions-POSE (MOTION_RIG_MAP-Deltas relativ zum Lab-idle, inkl.
            // headY·spineY·hipLZ/hipRZ). Kaltes Buch → mp null → Host-Konstanten. Der Rig LIEST nur Studio-Zahlen.
            const wi = 1 - w;
            const mp = this._koerperMotionProfile(false, emotions);
            const mref = mp ? this._koerperMotionProfile(false, null) : null;
            const bAmp =
                mp && mref && Number.isFinite(mp.breath) && mref.breath > 0 ? 0.02 * (mp.breath / mref.breath) : 0.02;
            const bRate = mp && mref && Number.isFinite(mp.freq) && mref.freq > 0 ? 1.6 * (mp.freq / mref.freq) : 1.6;
            const breath = Math.sin(t * bRate) * bAmp;
            add(r.spine, "z", 0.1 * wi); // Oberkörper lehnt zur Standbein-Seite
            add(r.chest, "z", -0.06 * wi); // Brust-Gegenkipp
            add(r.neck, "z", 0.05 * wi); // Kopf wieder aufrecht (krönt die S-Kurve)
            add(r.spine, "x", (-0.02 + breath) * wi); // sanfter Atem
            // Spielbein (L) leicht gebeugt + vorgestellt, Standbein (R) gestreckt
            add(r.legL.hip, "x", 0.08 * wi);
            add(r.legL.knee, "x", 0.16 * wi); // Knie beugt nach hinten (menschlich, + wie Walk/Sitz)
            add(r.legR.knee, "x", 0.04 * wi);
            // Arme ADDUZIERT aus der A-Pose-Spreizung an den Körper, mit LUFT zum Rumpf
            // (sonst presst der Arm eine Kontakt-FALTE in den Torso = ein „Riss").
            add(r.armL.shoulder, "z", -0.19 * wi);
            add(r.armR.shoulder, "z", 0.17 * wi);
            add(r.armL.elbow, "x", -0.18 * wi); // sanfte Ellbogen-Beuge
            add(r.armR.elbow, "x", -0.1 * wi);
            // Die Emotions-Pose als DATEN-Deltas (mp === mref am Neutralpunkt → Schleife
            // trägt Nullen → byte-alt; mp/mref sind dieselbe Preset-Referenz bei "idle").
            // V18.491.142 KPMUL_VIS α-path; kpMul>=1 byte-alt instant; tetrapoda .81 sibling.
            const kpMul = mp && Number.isFinite(Number(mp.kpMul)) ? Number(mp.kpMul) : 1;
            const dtK = r._kpmulT != null ? Math.max(0, Math.min(0.08, t - r._kpmulT)) : 0;
            r._kpmulT = t;
            if (mp && mref && mp === mref) r._kpmulAcc = null;
            if (mp && mref && mp !== mref) {
                if (!r._kpmulAcc) r._kpmulAcc = Object.create(null);
                const a = kpMul >= 0.999 || dtK <= 0 ? 1 : 1 - Math.exp(-Math.max(18, 55 * kpMul) * dtK);
                for (const row of AnazhRealm.MOTION_RIG_MAP) {
                    const dv = ((Number(mp[row.key]) || 0) - (Number(mref[row.key]) || 0)) * wi;
                    const accKey = row.key + "." + row.axis;
                    const prev = r._kpmulAcc[accKey] || 0;
                    const out = prev + (dv - prev) * a;
                    r._kpmulAcc[accKey] = out;
                    if (!out) continue;
                    const seg = row.bone.split(".");
                    const bone = seg.length === 2 ? r[seg[0]] && r[seg[0]][seg[1]] : r[seg[0]];
                    if (bone && bone.rotation) bone.rotation[row.axis] += out * row.mul;
                }
            }
            // BODY-WELLE (18.491.86) — Lab Root-Pitch/Roll + Mikro-Sway → Host hips.
            // Nicht MOTION_RIG_MAP (kein Knochen-Gap; Überlapp Kontrapost bewusst klein halten).
            if (r.hips && mp) {
                const m0 = mref || mp;
                const dX = ((Number(mp.bodyX) || 0) - (Number(m0.bodyX) || 0)) * wi;
                const dZ = ((Number(mp.bodyZ) || 0) - (Number(m0.bodyZ) || 0)) * wi;
                add(r.hips, "x", dX);
                add(r.hips, "z", dZ);
                // Mikro-Sway: absolute Amp wie Lab e.sway (idle bleibt fühlbar; mp===mref → nur sway)
                const swayA = Number.isFinite(mp.sway) ? mp.sway : 0.022;
                add(r.hips, "z", Math.sin(t * 1.1) * swayA * wi);
                add(r.hips, "x", Math.sin(t * 0.7) * swayA * 0.35 * wi);
            }
            // V18.491.142 KPMUL_VIS.host=map-alpha — map-α reads kpMul; still no MOTION_RIG_MAP kpMul row (Vertrag .87 Map-Verbot).
        }
        // DIE BEINE AUF DAS ZIEL DES GESETZES (K07): jeder Fuß folgt tetrapoda `gangFuss` — im Stand wandert er am Boden
        // mit genau dem Tempo des Leibs zurück (er steht in der Welt), im Schwung kehrt er gehoben nach vorn —, Hüfte, Knie
        // und Knöchel stellt die Zwei-Knochen-IK auf dieses Ziel (die Sohle bleibt eben). Das Becken trägt tetrapoda
        // `gangBecken` (dasselbe im Körper-Studio): nur die STEHENDEN Füße senken es, an der Reichweite R, an der die Fuß-IK
        // den stehenden Fuß hält (`_gaitReich`, EINE Schwelle); der Schwung-Fuß faltet sich unter R (vorher zog er das
        // Becken über beide Füße hinab: im Lauf 46 cm, an der Spitze 77 cm). Derselbe Pfad trägt den lokalen Avatar, den
        // Peer und jeden Bewohner mit Rig; vorher schwangen die Beine ±0,5 rad als Sinus um einen 3,4-m-Schritt.
        const S = w > 0.001 && gait && gait.S > 0 ? gait.S : 0;
        const M = S > 0 ? this._gaitBeinMass(r) : null;
        let sw = Math.sin(walkPhase);
        r._gangSenke = 0;
        if (r._gangStand) r._gangStand[0] = r._gangStand[1] = true; // ohne Gesetzes-Pose stehen beide Füße
        if (r._gangRoll) r._gangRoll[0] = r._gangRoll[1] = null; // ohne Gesetzes-Pose steht die Sohle flach
        if (M && M.l1 > 0 && M.l2 > 0) {
            const core = window.__tetrapodaCore;
            const Z = this._gangZeile(true);
            const tast = gait.tast;
            const Sl = S / M.wz; // der Fußweg längs, im Gelenk-Raum
            const hubL = (gait.hub * M.L) / M.wpl;
            const L12 = M.l1 + M.l2;
            const R = AnazhRealm._gaitReich(L12);
            // der Fuß rollt im späten Stand über den Ballen (tetrapoda gangRolle): sein Knöchel steigt um heb, die Sohle
            // kippt um roll — die Fuß-IK hält die Stelle der Sohle, die trägt, nie die Ferse (`_gaitLegIK`, `r._gangRoll`)
            const FL = core.gangFuss(walkPhase, Sl, tast, Z, R);
            const FR = core.gangFuss(walkPhase + Math.PI, Sl, tast, Z, R);
            const roll = r._gangRoll || (r._gangRoll = [null, null]);
            // die Fuß-IK hält den Punkt der Sohle, der trägt: dieselbe Rolle mit der Zeile des GEBAUTEN Fußes (`_gaitSohle`)
            const Zs =
                r._sohle && (r._sohleZ || (r._sohleZ = { ...Z, ballen: r._sohle[0] / R, knoechel: r._sohle[1] / R }));
            roll[0] = Zs ? core.gangFuss(walkPhase, Sl, tast, Zs, R) : FL;
            roll[1] = Zs ? core.gangFuss(walkPhase + Math.PI, Sl, tast, Zs, R) : FR;
            // die Senke im Gelenk-Raum über der gestreckten Kette (die Schwere der Zeile im lotrechten Gelenk-Maß)
            const tief = L12 - R + core.gangBecken(walkPhase, Sl, tast, R, gait.omega, Z, M.wpl);
            r._gangSenke = tief;
            const auf = 2 * Math.PI * (1 - tast);
            const u = (p) => ((p % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
            r._gangStand = r._gangStand || [false, false];
            r._gangStand[0] = u(walkPhase) >= auf;
            r._gangStand[1] = u(walkPhase + Math.PI) >= auf;
            // der Fuß unter der Hüfte: gehoben um seinen Hub, nie jenseits von R (der Schwung-Fuß faltet sich)
            const unten = (F, h) => Math.min(L12 - tief - h, Math.sqrt(Math.max(0, R * R - F.dz * F.dz)));
            const ikL = this._twoBoneIK(M.l1, M.l2, FL.dz, unten(FL, FL.hub * hubL + FL.heb));
            const ikR = this._twoBoneIK(M.l1, M.l2, FR.dz, unten(FR, FR.hub * hubL + FR.heb));
            add(r.legL.hip, "x", ikL.hip * w);
            add(r.legL.knee, "x", ikL.knee * w);
            add(r.legL.ankle, "x", (FL.roll - ikL.hip - ikL.knee) * w);
            add(r.legR.hip, "x", ikR.hip * w);
            add(r.legR.knee, "x", ikR.knee * w);
            add(r.legR.ankle, "x", (FR.roll - ikR.hip - ikR.knee) * w);
            // das Bein-Signal für Arme und Becken: −1, wenn das linke Bein vorn steht (Arm L schwingt gegen Bein L)
            sw = Math.max(-1, Math.min(1, (FR.dz - FL.dz) / Sl));
        }
        if (w > 0.001) {
            // ── GEHEN ×w — Arme gegen die Beine, Becken-Roll/Yaw + Brust-Gegendreh im Takt des Bein-Signals.
            const wa = w * amp;
            // Arme gegen die Beine (Arm L mit Bein R)
            add(r.armL.shoulder, "x", -0.4 * sw * wa);
            add(r.armR.shoulder, "x", 0.4 * sw * wa);
            add(r.armL.elbow, "x", (-0.3 - 0.2 * Math.max(0, -sw) * amp) * w);
            add(r.armR.elbow, "x", (-0.3 - 0.2 * Math.max(0, sw) * amp) * w);
            // Rumpf-Roll/Yaw über dem Becken + Brust-Gegendreh: das Becken trägt die Beine und dreht nicht mit (eine
            // Becken-Drehung schwenkte die Bein-Kette um die Hüfte, der Stand-Fuß glitt 8 cm je Schritt seitlich)
            add(r.spine, "z", 0.05 * sw * wa);
            add(r.spine, "y", 0.07 * sw * wa);
            add(r.chest, "y", -0.06 * sw * wa);
        }
        // Die Becken-Senke des Gangs — absolut über der EINMAL gecachten Basis;
        // ×w: sie klingt beim Stopp aus, statt eingefroren stehenzubleiben.
        if (r.hips) {
            if (r._baseHipY == null) r._baseHipY = r.hips.position.y;
            r.hips.position.y = r._baseHipY - r._gangSenke * w;
        }
        // ═══ KÖRPER-BEWEGUNG (3) — Fuß-IK/Foot-Lock/Becken/Hang-Lehne (nur mit
        // gerüstetem Kontext = der lokale Avatar; s. _gaitTick Budget-Disziplin).
        if (gait && gait.ik) this._gaitApplyFussIK(r, walkPhase, w, gait.ik);
        // V18.491.85 — Augen-Welle außerhalb MOTION_RIG_MAP (irisSpeed/blinkRate).
        this._animateHumanoidAugen(r, t, emotions);
    }

    // V18.491.85 — Augen-Welle: Ofen-Joints iris/lid aus koerper-MOTION (außerhalb Map).
    // Fail-closed ohne Refs; Idle erlaubt schwachen Blink (Lab-idle blinkRate).
    // V18.491.131 AUGEN_VIS.host=noise-iris
    _animateHumanoidAugen(rig, t, emotions) {
        if (!(rig && (rig.irisL || rig.irisR || rig.lidTL || rig.lidTR))) return;
        const mp = this._koerperMotionProfile(false, emotions);
        if (!mp) return;
        const blinkRate = Math.max(0.1, Number(mp.blinkRate) || 0.5);
        if (rig._lidBaseY == null) {
            const sample = rig.lidTL || rig.lidTR;
            rig._lidBaseY = sample && sample.scale ? sample.scale.y : 0.35;
        }
        // Deterministisch: Periode aus blinkRate (Lab-Mitte ~1.0/rate), Pulse ~0.09s.
        const period = 1.0 / blinkRate;
        const phase = ((t % period) + period) % period;
        const blinkDur = 0.09;
        let open = 1.0;
        if (phase < blinkDur) {
            const bf = phase / blinkDur;
            // Lab-Form: zu → 0.3 → auf; open 1→0.3→1
            open = bf < 0.45 ? 1.0 - (bf / 0.45) * 0.7 : 0.3 + ((bf - 0.45) / 0.55) * 0.7;
        }
        const lidY = rig._lidBaseY * open; // offen≈base, zu≈0.3*base
        if (rig.lidTL && rig.lidTL.scale) rig.lidTL.scale.y = lidY;
        if (rig.lidTR && rig.lidTR.scale) rig.lidTR.scale.y = lidY;
        const irisSpeed = Number.isFinite(mp.irisSpeed) ? mp.irisSpeed : 0.3;
        if (rig.irisL && !rig._irisBaseL && rig.irisL.position) {
            rig._irisBaseL = rig.irisL.position.clone();
        }
        if (rig.irisR && !rig._irisBaseR && rig.irisR.position) {
            rig._irisBaseR = rig.irisR.position.clone();
        }
        const ox = Math.sin(t * (2 + irisSpeed * 2)) * 0.003;
        const oy = Math.sin(t * (1.6 + irisSpeed * 1.6) + 1.7) * 0.002;
        if (rig.irisL && rig._irisBaseL) {
            rig.irisL.position.set(rig._irisBaseL.x + ox, rig._irisBaseL.y + oy, rig._irisBaseL.z);
        }
        if (rig.irisR && rig._irisBaseR) {
            rig.irisR.position.set(rig._irisBaseR.x + ox, rig._irisBaseR.y + oy, rig._irisBaseR.z);
        }
    }

    // ABSCHIEDS-WELLE (Koerper-Dock A2) — DIE EINE KREATUR-DIAL-QUELLE: liest die fünf
    // allometrischen Dials einer tetrapoda-Gattung LIVE (f.recipes[id].s — das
    // `_klangStudioPreset`-Muster). Fail-soft: kaltes Buch/fremder kind → null.
    _tetrapodaStudioDials(recId) {
        const f = this._foundry;
        const rec = f && f.recipes ? f.recipes[recId] : null;
        // WELCHES Rezept eine Seele liest, pinnt TETRAPODA_SOUL_MAP (Daten) — hier nur
        // die Form-Wache (must-ignore, kein kind-Literal: das klang-Leser-Muster).
        const s = rec && rec.s && typeof rec.s === "object" ? rec.s : null;
        // DIE PRÄGUNG DER GATTUNG = VORRANG-Quelle (ws.studioOv, geschrieben vom EINEN Übergabe-Kanal und den Werkstatt-
        // Reglern): die fünf allometrischen Dials ÜBER das Buch. Beide Konsumenten folgen: _ofenKreaturDials (Memo-Key trägt die
        // Dials) und _tetrapodaSoulParts. Nur KÜNFTIGE Spawns lesen hier; bestehende Kreaturen bleiben wie gegossen.
        const p = this._studioPraegung(recId);
        return p ? Object.assign({}, s || {}, p) : s;
    }
    // ═══ DER KREATUR-OFEN ═══
    // Die Gattung reist als ASSET durch dieselbe Foundry wie die Pflanzen (BAKERS_BY_KIND.kreatur, Worker
    // UND hier); der Stamm assembliert via _foundryBuildMesh und memoiert je Art+Dials+Stufe → jede
    // Kreatur ist ein Template-CLONE. _ofenKreaturDials: TETRAPODA_SOUL_MAP = welches Rezept,
    // TETRAPODA_DIAL_MAP = wie; tag-neutral (nur Längen/Positionen). null → Modul-bodyParts bleiben.
    _ofenKreaturDials(recId, ovOpt) {
        const core = typeof window !== "undefined" && window.__tetrapodaCore;
        if (!core || !core.GATTUNGEN || !core.GATTUNGEN[recId]) return null;
        const basis = core.GATTUNGEN[recId];
        const buch = this._tetrapodaStudioDials(recId);
        const dials = Object.assign({}, basis, buch || {}, ovOpt && typeof ovOpt === "object" ? ovOpt : {});
        // istDefault steuert den IDB-Pfad: nur die unveränderte Gattungs-Gestalt
        // darf die Platte lesen/schreiben (Regler-Unikate bleiben Unikate, W-A1).
        const istDefault = !ovOpt && JSON.stringify(dials) === JSON.stringify(Object.assign({}, basis));
        return { dials, istDefault };
    }
    _ofenKreaturKey(recId, dials, lod) {
        let d = "";
        try {
            d = JSON.stringify(dials || {});
        } catch (_e) {
            d = "";
        }
        return recId + "|" + (lod | 0) + "|" + d;
    }
    // KLON-REBIND (V18.463, ein Gesetz für Mensch UND Tier): SkinnedMesh.clone teilt das Template-Skelett —
    // jede Instanz bindet auf IHRE geklonten Bones um (Bind-Matrix bleibt).
    static _ofenKlonRebind(klon, teile) {
        klon.traverse((n) => {
            if (!n.isSkinnedMesh || !n.userData.__skinJoints) return;
            const bones = n.userData.__skinJoints.map((nm) => teile[nm]).filter(Boolean);
            if (bones.length) n.bind(new THREE.Skeleton(bones), n.bindMatrix.clone());
        });
    }
    // DIE STARR-BINDUNG (Mensch UND Tier, am EINEN Ofen-Chokepoint): jedes starre Teil (Pfote · Ohr · Lid ·
    // Kopf · Kiefer · Schwanzspitze …) hing als eigenes Mesh an seinem Gelenk — ein Draw plus ein Schatten-Draw
    // je Teil. Gemessen 02.10. (Mess-Wiese, Holz voll): 5 nahe Wölfe = 421 von 474 Draws, je Wolf 35 starre
    // Teile. Teile derselben Sippe (Stoff × Attribut-Form, phyto-core `budgetSippe`; die Farbe reist als Vertex-Farbe)
    // verschmelzen zu EINEM SkinnedMesh; jeder Vertex hängt starr an sein Gelenk (skinIndex = Gelenk, Gewicht
    // 1), die GPU posiert, was vorher der Szenen-Graph je Teil trug. Die Gelenke bleiben Gelenke: Gang,
    // Lid-Skala, Iris, Halter, Fern-Fit (dominanter Bone) lesen dieselben Objekte. Geometrie im Wurzel-Raum der
    // Bind-Pose; Klone binden über __skinJoints um (_ofenKlonRebind) wie die Haut.
    static _ofenStarrBinden(root) {
        root.updateMatrixWorld(true);
        const wurzelInv = new THREE.Matrix4().copy(root.matrixWorld).invert();
        // Gelenk-Namen müssen eindeutig sein — der Klon findet seine Bones über den Namen.
        const namen = new Map();
        root.traverse((n) => {
            if (!n.isMesh && n.name) namen.set(n.name, namen.has(n.name) ? null : n);
        });
        const gruppen = new Map();
        root.traverse((n) => {
            if (!n.isMesh || n.isSkinnedMesh || n.isInstancedMesh || !n.geometry || !n.parent) return;
            if (Array.isArray(n.material) || !n.material || n.visible === false) return;
            const g = n.geometry;
            if (!g.attributes.position || (g.morphAttributes && Object.keys(g.morphAttributes).length)) return;
            // DIE SIPPE des Budget-Gesetzes (phyto-core `budgetSippe`, am Mesh gestempelt) sagt, was bindet — dieselbe
            // Regel, mit der es die Draws zählt; null (Tür-Flügel drehen sich selbst, eine Haut ist ihr eigenes
            // SkinnedMesh) bindet nie. Zwei Materialien teilen nie eine Geometrie.
            const sippe = n.userData ? n.userData.__sippe : null;
            if (!sippe) return;
            let gelenk = n.parent;
            while (gelenk && gelenk.isMesh) gelenk = gelenk.parent;
            if (!gelenk || !gelenk.name || namen.get(gelenk.name) !== gelenk) return;
            const key = sippe + "|" + n.material.uuid;
            let gr = gruppen.get(key);
            if (!gr) gruppen.set(key, (gr = []));
            gr.push({ mesh: n, gelenk });
        });
        const m = new THREE.Matrix4();
        const nm = new THREE.Matrix3();
        const v = new THREE.Vector3();
        for (const teile of gruppen.values()) {
            if (teile.length < 2) continue;
            const g0 = teile[0].mesh.geometry;
            const attrNamen = Object.keys(g0.attributes);
            let nV = 0,
                nI = 0;
            for (const t of teile) {
                const g = t.mesh.geometry;
                nV += g.attributes.position.count;
                nI += g.index ? g.index.count : g.attributes.position.count;
            }
            const daten = {};
            for (const a of attrNamen) daten[a] = new Float32Array(nV * g0.attributes[a].itemSize);
            const index = nV > 65535 ? new Uint32Array(nI) : new Uint16Array(nI);
            const skinIndex = new Uint16Array(nV * 4);
            const skinWeight = new Float32Array(nV * 4);
            const bones = [];
            const boneIdx = new Map();
            let ov = 0,
                oi = 0;
            for (const t of teile) {
                const g = t.mesh.geometry;
                const n = g.attributes.position.count;
                m.multiplyMatrices(wurzelInv, t.mesh.matrixWorld);
                nm.getNormalMatrix(m);
                for (const a of attrNamen) {
                    const src = g.attributes[a];
                    const dst = daten[a];
                    const k = src.itemSize;
                    for (let i = 0; i < n; i++) {
                        if (a === "position" || a === "normal") {
                            v.fromBufferAttribute(src, i);
                            if (a === "position") v.applyMatrix4(m);
                            else v.applyMatrix3(nm).normalize();
                            dst[(ov + i) * 3] = v.x;
                            dst[(ov + i) * 3 + 1] = v.y;
                            dst[(ov + i) * 3 + 2] = v.z;
                        } else for (let c = 0; c < k; c++) dst[(ov + i) * k + c] = src.getComponent(i, c);
                    }
                }
                let b = boneIdx.get(t.gelenk);
                if (b === undefined) {
                    b = bones.length;
                    bones.push(t.gelenk);
                    boneIdx.set(t.gelenk, b);
                }
                for (let i = 0; i < n; i++) {
                    skinIndex[(ov + i) * 4] = b;
                    skinWeight[(ov + i) * 4] = 1;
                }
                if (g.index) for (let i = 0; i < g.index.count; i++) index[oi++] = g.index.getX(i) + ov;
                else for (let i = 0; i < n; i++) index[oi++] = ov + i;
                ov += n;
            }
            const geo = new THREE.BufferGeometry();
            for (const a of attrNamen) {
                const src = g0.attributes[a];
                geo.setAttribute(a, new THREE.BufferAttribute(daten[a], src.itemSize, src.normalized));
            }
            geo.setIndex(new THREE.BufferAttribute(index, 1));
            geo.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(skinIndex, 4));
            geo.setAttribute("skinWeight", AnazhRealm._hautGewicht(skinWeight, 4));
            const t0 = teile[0].mesh;
            const starr = new THREE.SkinnedMesh(geo, t0.material);
            starr.castShadow = t0.castShadow;
            starr.receiveShadow = t0.receiveShadow;
            starr.userData.sharedGeom = true;
            if (t0.userData && t0.userData.__klasse) starr.userData.__klasse = t0.userData.__klasse;
            starr.userData.__skinJoints = bones.map((b) => b.name);
            for (const t of teile) t.mesh.parent.remove(t.mesh);
            root.add(starr);
            starr.updateMatrixWorld(true);
            starr.bind(new THREE.Skeleton(bones), starr.matrixWorld.clone());
            // Die Bind-Box reist mit (wie die der Haut aus dem Assemble): Box3-Leser der Welt-Gestalt messen den
            // Klon sonst über ein frisch umgebundenes, noch nicht posiertes Skelett.
            geo.computeBoundingBox();
            starr.boundingBox = geo.boundingBox.clone();
        }
    }
    // Der Beipack-Leser (GENERISCH für jede Gelenk-Gattung — Tier UND Mensch):
    // Reply-Einträge → Gelenk-Gruppen (benannt!) + Meshes an ihren Gelenken.
    // Liefert {root, teile, tailNamen, minY} oder null.
    _ofenAssembleAsset(meshes) {
        if (!Array.isArray(meshes) || !meshes.length || typeof THREE === "undefined") return null;
        let skelett = null;
        for (const m of meshes) if (m && m.kind === "__skelett" && m.skelett) skelett = m.skelett;
        if (!skelett || !Array.isArray(skelett.joints) || !skelett.joints.length) return null;
        const root = new THREE.Group();
        const teile = {};
        // V18.463 — trägt der Beipack skinJoints (Mensch-Hüllen), werden die
        // Gelenke BONES (Bone erbt Object3D — Gruppen-Semantik bleibt), damit
        // die Haut-/Kleid-Hüllen als SkinnedMesh binden können.
        const mitBones = Array.isArray(skelett.skinJoints) && skelett.skinJoints.length > 0;
        for (const j of skelett.joints) {
            if (!j || !j.name) continue;
            const g = mitBones ? new THREE.Bone() : new THREE.Group();
            g.name = j.name;
            teile[j.name] = g;
        }
        const rootName = skelett.root || "wolf";
        for (const j of skelett.joints) {
            if (!j || !j.name) continue;
            const g = teile[j.name];
            if (j.parent && teile[j.parent]) teile[j.parent].add(g);
            else if (j.name === rootName) root.add(g);
            else (teile[rootName] || root).add(g);
            if (Array.isArray(j.pos)) g.position.set(j.pos[0], j.pos[1], j.pos[2]);
            if (Array.isArray(j.quat)) g.quaternion.set(j.quat[0], j.quat[1], j.quat[2], j.quat[3]);
            if (Array.isArray(j.scale)) g.scale.set(j.scale[0], j.scale[1], j.scale[2]);
        }
        // das Volumen der geschlossenen Haut (1310-15, der Ofen misst es vor dem Stoff-Schnitt) hängt am Gelenk der Hülle —
        // die Masse liest es (`_leibVolumen`), nie die offene Fläche
        if (skelett.leibV > 0 && teile[rootName]) teile[rootName].userData.__leibV = skelett.leibV;
        let gebaut = 0;
        for (const m of meshes) {
            if (!m || m.kind === "__skelett") continue;
            const mesh = this._foundryBuildMesh(m);
            if (!mesh) continue;
            // Template-Geometrie ist über ALLE Klone geteilt — der Dispose-
            // Chokepoint (_disposeSoulGroup) lässt sharedGeom stehen.
            mesh.userData.sharedGeom = true;
            // Die Seh-Klasse des Stoffs steht am Teil: die Gelenk-Gestalt wählt mit ihr den Wurf-Teil (`wurf.seh`, S3).
            if (m.mat && typeof m.mat.seh === "string") mesh.userData.__seh = m.mat.seh;
            (teile[m.joint] || teile[rootName] || root).add(mesh);
            gebaut++;
        }
        if (!gebaut) return null;
        root.updateMatrixWorld(true);
        // V18.463 — die Haut-/Kleid-Hüllen BINDEN: SkinnedMesh an die Bone-
        // Gelenke der Default-Pose (Bind-Matrix = Welt-Pose beim Assemble;
        // die Geometrie ist Charakter-lokal gebacken — deckungsgleich).
        if (mitBones) {
            const bones = skelett.skinJoints.map((nm) => teile[nm]).filter(Boolean);
            root.traverse((n) => {
                if (!n.isSkinnedMesh) return;
                n.userData.__skinJoints = skelett.skinJoints.slice();
                n.bind(new THREE.Skeleton(bones), n.matrixWorld.clone());
            });
        }
        // DIE SOHLE steht auf dem Boden, nie das Fell darunter (Integration W5-Körper): die Fell-Schalen (aSchale) reichen
        // unter der Pfote bis 3,3 cm tiefer (Bär) — sie hoben das Tier um ihre Länge über den Boden (Wolf 1,3 cm). Der
        // Stand (minY: Boden-Versatz, Bein-IK, Bein-Länge) liest die Haut.
        const sohle = new THREE.Box3();
        root.traverse((n) => {
            if (n.isMesh && !(n.geometry && n.geometry.attributes && n.geometry.attributes.aSchale))
                sohle.expandByObject(n);
        });
        const bb = new THREE.Box3().setFromObject(root);
        AnazhRealm._ofenStarrBinden(root);
        // DIE KÖRPER-KUGEL: jede geskinnte Hülle (Haut · Fell · Kleid · starre Teile) cullt gegen die Bind-Hülle
        // des GANZEN Körpers × 1,25 — jede Pose bleibt darin (Glieder drehen um Gelenke im Leib). Die Bind-BBox
        // der Einzel-Hülle log (darum zeichneten Haut und Fell nie gecullt), die Körper-Hülle nicht: außerhalb
        // des Blicks und je Schatten-Kaskade fällt der Draw. Klone erben die Kugel (SkinnedMesh.copy).
        if (!bb.isEmpty()) {
            const kugel = bb.getBoundingSphere(new THREE.Sphere());
            kugel.radius *= 1.25;
            const inv = new THREE.Matrix4();
            root.updateMatrixWorld(true);
            root.traverse((n) => {
                if (!n.isSkinnedMesh) return;
                n.boundingSphere = kugel.clone().applyMatrix4(inv.copy(n.matrixWorld).invert());
                n.frustumCulled = true;
            });
        }
        return {
            root,
            teile,
            tailNamen: Array.isArray(skelett.tailSegs) ? skelett.tailSegs.slice() : [],
            minY: Number.isFinite(sohle.min.y) ? sohle.min.y : 0,
            // die Hand-Mitte je Hand-Gelenk (Mensch nah, im Hand-Raum) — der Griff der Faust
            handMitte: skelett.handMitte || null,
        };
    }
    // Das Art-Template (memo): warm aus dem Prefetch/IDB, kalt über den EINEN
    // Bäcker synchron (foundry-core auf der Stamm-Seite — ein Gesetz, zwei
    // Scheduler). null = LAUT beim Aufrufer (fail-closed, kein Ersatz-Körper).
    _ofenKreaturTemplate(recId, ovOpt, lod, eigen) {
        const core = typeof window !== "undefined" && window.__tetrapodaCore;
        const d = this._ofenKreaturDials(recId, ovOpt);
        if (!core || !d) return null;
        return this._ofenVorlage(this._ofenKreaturKey(recId, d.dials, lod), eigen, () => {
            try {
                const BAKER = typeof globalThis !== "undefined" ? globalThis.BAKERS_BY_KIND : null;
                if (!BAKER || typeof BAKER.kreatur !== "function") return null;
                this._fadenUmgangen("Guss „kreatur“ ohne Vorlage"); // die Vorlage gießt das Werk der Foundry (Lehre 14)
                const g = BAKER.kreatur(core, recId, 0, lod | 0, d.dials);
                const eintraege = [];
                g.traverse((o) => {
                    if (o.isMesh) eintraege.push(this._ofenMeshEintragAusThree(o));
                });
                if (g.userData && g.userData.__skelett)
                    eintraege.push({ kind: "__skelett", skelett: g.userData.__skelett });
                return this._ofenAssembleAsset(this._ofenBudget(core, "kreatur", lod, eintraege, recId));
            } catch (e) {
                this.log("Kreatur-Ofen kalt-Guss scheiterte (" + (e && e.message) + ")", "ERROR");
                return null;
            }
        });
    }
    // DIE EIGENTÜMERSCHAFT DER OFEN-GÜSSE (Frost-Nachbesserung 08.10.) — der EINE Weg in das Memo `_tierOfenMemo`
    // (Kreatur- und Mensch-Ofen). Das Memo hält die Vorlagen, die ÜBERLEBEN (Welt-Spawns, Restore, Peers, Prefetch): ihre
    // Meshes tragen `sharedGeom` (`_ofenAssembleAsset`), jeder Klon teilt sie, keine Gruppe entsorgt sie. Ein Guss `eigen`
    // (das Regler-Einzelstück der Werkstatt) ist keine Vorlage: er betritt das Memo nie, seine Meshes verlieren die
    // Geteilt-Markierung, er gehört dem, der ihn zeigt — der entsorgt ihn über `_disposeSoulGroup`. Befund (Radeon, Wolf,
    // 20 Regler-Werte): jeder Wert legte zwei Einzelstücke für immer ins Memo, als geteilt markiert — der Grafikspeicher
    // der Werkstatt wuchs 2,4 → 50,1 MB, ihre Geometrien 11 → 171. Trifft ein eigener Guss eine Vorlage im Memo (dieselben
    // Dials), zeigt er die Vorlage — geteilt, wie sie ist.
    // DIE GRENZE (Frost-Nachbesserung 4): das Memo wuchs mit jeder neuen Mitspieler-Erscheinung um zwei Vorlagen (~9,6 MB
    // JS) und gab nie frei. Jede Vorlage zählt ihre lebenden Leiber (`_ofenVorlagenBinden` beim Klonen, die Rückgabe in
    // `_disposeSoulGroup`); `fest` hält die Gattungs- und Spieler-Vorlagen des Prefetch (Off-Thread gebacken — ein Neuguss
    // wäre ein Haupt-Thread-Guss); von den übrigen hält das Memo höchstens OFEN_MEMO_RUHEND ohne Leib, die älteste fällt.
    _ofenVorlage(key, eigen, giessen, fest) {
        const memo = AnazhRealm._tierOfenMemo || (AnazhRealm._tierOfenMemo = new Map());
        const takt = (AnazhRealm._ofenTakt = (AnazhRealm._ofenTakt || 0) + 1);
        const da = memo.get(key);
        if (da) {
            if (da.__ofen) {
                da.__ofen.zuletzt = takt;
                if (fest === true) da.__ofen.fest = true;
            }
            return da;
        }
        const asm = giessen();
        if (!asm) return null;
        if (eigen === true)
            asm.root.traverse((n) => {
                if (n.userData && n.userData.sharedGeom) delete n.userData.sharedGeom;
            });
        else {
            asm.__ofen = { key, nutzer: 0, fest: fest === true, zuletzt: takt };
            memo.set(key, asm);
            this._ofenMemoRaeumen();
        }
        return asm;
    }
    static get OFEN_MEMO_RUHEND() {
        return 2;
    }
    // Ein Leib aus Ofen-Vorlagen (Kreatur, Mensch) meldet sich bei jeder an; `_disposeSoulGroup` gibt sie zurück. Ein
    // eigener Guss (`eigen`) steht nicht im Memo und zählt nicht.
    _ofenVorlagenBinden(leib, vorlagen) {
        const liste = vorlagen.filter((v) => v && v.__ofen);
        for (const v of liste) v.__ofen.nutzer++;
        if (liste.length) leib.__ofenVorlagen = (leib.__ofenVorlagen || []).concat(liste);
    }
    _ofenVorlageLoesen(v) {
        if (!v || !v.__ofen) return;
        v.__ofen.nutzer = Math.max(0, v.__ofen.nutzer - 1);
        if (v.__ofen.nutzer === 0) this._ofenMemoRaeumen();
    }
    // Die Räumung: Vorlagen ohne lebenden Leib und ohne `fest`, über OFEN_MEMO_RUHEND hinaus, fallen — die älteste zuerst —
    // und ihre Geometrie wird entsorgt (das Memo ist ihr Eigentümer; Stoffe gehören den Klassen-Caches und bleiben).
    _ofenMemoRaeumen() {
        const memo = AnazhRealm._tierOfenMemo;
        if (!memo) return;
        const ruhend = [];
        for (const v of memo.values()) if (v.__ofen && !v.__ofen.fest && v.__ofen.nutzer === 0) ruhend.push(v);
        if (ruhend.length <= AnazhRealm.OFEN_MEMO_RUHEND) return;
        ruhend.sort((a, b) => a.__ofen.zuletzt - b.__ofen.zuletzt);
        for (const v of ruhend.slice(0, ruhend.length - AnazhRealm.OFEN_MEMO_RUHEND)) {
            memo.delete(v.__ofen.key);
            v.root.traverse((n) => {
                if (n.geometry) this._queueDispose(n.geometry);
            });
        }
    }
    // DIE ZEILE DER GELENK-GESTALT (S3, Lehre 19) — der EINE Leser der Kern-Zeile für Tier und Mensch: phyto-core
    // `budgetZeile` (die Stufen-Klammer) und die Art-Ebene (`hyst`). Der Ausgang des Ofens (`_ofenBudget`) faltet auf sie,
    // die Gestalt (`_gelenkGestalt`) liest aus ihr den Wurf (`schatten`, `wurf.seh`) und die Stufen-Grenze (`ab`, `hyst`).
    _ofenZeile(core, kind, lod) {
        const cfg = core && core.PORTAL_RENDER_CONFIG;
        const bz = globalThis.__phytoCore.budgetZeile(cfg, kind, lod | 0);
        const block = cfg && cfg.lod && cfg.lod.budget ? cfg.lod.budget[kind] : null;
        return {
            stufe: bz ? bz.stufe : null,
            zeile: bz ? bz.zeile : null,
            hyst: block && typeof block.hyst === "number" ? block.hyst : null,
        };
    }
    // DAS BUDGET-GESETZ im Sync-Guss (W8): der Haupt-Thread-Guss verlässt das Studio an DERSELBEN Stelle wie die
    // Worker-Antwort (`__replyBuildAsset`) — phyto-core `budgetErzwingen` auf der Zeile des Kerns (seine
    // PORTAL_RENDER_CONFIG.lod.budget[kind][stufe], `_ofenZeile`); ein Bruch schreit, nie still.
    _ofenBudget(core, kind, lod, eintraege, name) {
        const PC = globalThis.__phytoCore;
        this._foundryLiefer(this._foundry, "haupt"); // der Guss des Haupt-Fadens (die Liefer-Marke)
        const bz = this._ofenZeile(core, kind, lod);
        const res = PC.budgetErzwingen(eintraege, bz.zeile);
        if (res.bericht.bruch.length)
            this.log("BUDGET-BRUCH " + name + " L" + (lod | 0) + ": " + JSON.stringify(res.bericht.bruch), "ERROR");
        return res.meshes;
    }
    // Sync-Pendant des Shell-Extractors (phytogenesis __extractAssetMesh): DIESELBE Eintrags-Form, damit
    // _ofenAssembleKreatur/_foundryBuildMesh die EINE Konversion bleiben. Arrays reisen als Referenz.
    _ofenMeshEintragAusThree(mesh) {
        const geo = mesh.geometry;
        const mat = mesh.material || {};
        // DIE KLASSE REIST MIT: der Studio-Bäcker stempelt `material.userData.__klasse` (fell · straehne* · skin ·
        // haut · hair); der Material-Weber webt für GENAU diese Namen die Lab-Shader-Gesetze (FELL_LOOK/HAUT_LOOK/
        // HAAR_LOOK). Befund 30.09.: hier stand `kind: "unknown"` fest — 0 von 11 Wolf-Materialien trugen das
        // Fell-Gesetz, der Weber war ein toter Leser. Andere Klassen (Auge, Klaue …) bleiben "unknown".
        const kl = mat.userData && mat.userData.__klasse;
        const out = { kind: typeof kl === "string" && globalThis.__phytoCore.budgetLook(kl) ? kl : "unknown" };
        if (mesh.userData && mesh.userData.__assetJoint) out.joint = mesh.userData.__assetJoint;
        out.mat = {
            roughness: typeof mat.roughness === "number" ? mat.roughness : 0.7,
            metalness: typeof mat.metalness === "number" ? mat.metalness : 0,
            flatShading: !!mat.flatShading,
            envMapIntensity: typeof mat.envMapIntensity === "number" ? mat.envMapIntensity : 1,
            side: mat.side === THREE.DoubleSide ? 2 : 0,
            alphaTest: typeof mat.alphaTest === "number" ? mat.alphaTest : 0,
            hasNormalMap: !!mat.normalMap,
        };
        if (mat.color && typeof mat.color.r === "number") out.mat.color = [mat.color.r, mat.color.g, mat.color.b];
        if (mat.userData && mat.userData.__webe) out.mat.webe = mat.userData.__webe;
        // Die Seh-Klasse des Gesetzbuchs reist mit (das Budget-Gesetz faltet nur innerhalb EINER, `_ofenBudget`).
        if (mat.userData && mat.userData.__seh) out.mat.seh = mat.userData.__seh;
        if (mat.userData && typeof mat.userData.__leucht === "number") out.mat.leucht = mat.userData.__leucht;
        if (mat.userData && typeof mat.userData.__licht === "string") out.mat.licht = mat.userData.__licht; // K11 (Brücke)
        if (mat.emissive && (mat.emissive.r || mat.emissive.g || mat.emissive.b)) {
            out.mat.emissive = [mat.emissive.r, mat.emissive.g, mat.emissive.b];
            out.mat.emissiveIntensity = typeof mat.emissiveIntensity === "number" ? mat.emissiveIntensity : 1;
        }
        // Klarlack und Durchsicht reisen wie in der Brücke (phytogenesis `__extractAssetMesh`, W5) — DIESELBE Eintrags-
        // Form; ein Bäcker-Stoff ohne die Felder (jede Kreatur heute) bleibt byte-alt.
        if (typeof mat.clearcoat === "number" && mat.clearcoat > 0) {
            out.mat.clearcoat = mat.clearcoat;
            out.mat.clearcoatRoughness = typeof mat.clearcoatRoughness === "number" ? mat.clearcoatRoughness : 0;
        }
        if (mat.transparent && typeof mat.opacity === "number" && mat.opacity < 1) out.mat.opacity = mat.opacity;
        if (geo && geo.attributes) {
            for (const name in geo.attributes) {
                const at = geo.attributes[name];
                if (!at || !at.array) continue;
                out[name] = { array: at.array, itemSize: at.itemSize || 3 };
            }
            if (geo.index) out.index = geo.index.array;
        }
        return out;
    }
    // Anker-Farben des Default-Menschen (Boot-Avatar, Peers ohne Übergabe, Ofen-Prefetch) aus den
    // Kern-Tabellen koerper-core SKIN_TONES/HAIR_COLORS — FNV-deterministisch aus dem Welt-Seed
    // (reload-stabil, alle Peers gleich). Kalter Kern → null (fail-closed).
    _menschAnkerFarben() {
        const kc = typeof window !== "undefined" && window.__koerperCore;
        if (!kc || !kc.SKIN_TONES || !kc.HAIR_COLORS) return null;
        const seed = (this.state && this.state.worldSeed) >>> 0 || 1;
        if (this._menschAnkerMemo && this._menschAnkerMemo.seed === seed) return this._menschAnkerMemo;
        const pick = (tab, salt) => {
            const keys = Object.keys(tab);
            let h = (0x811c9dc5 ^ seed) >>> 0;
            const s = "mensch:" + salt;
            for (let i = 0; i < s.length; i++) {
                h ^= s.charCodeAt(i);
                h = Math.imul(h, 0x01000193);
            }
            return tab[keys[(h >>> 0) % keys.length]];
        };
        this._menschAnkerMemo = {
            seed,
            skin: pick(kc.SKIN_TONES, "haut").hex >>> 0,
            hair: pick(kc.HAIR_COLORS, "haar").base >>> 0,
        };
        return this._menschAnkerMemo;
    }

    // DER EINE FARB-MÜNZER des Mensch-Gusses: Anker-Farben, von der Übergabe (skinTone/hairColor →
    // Kern-Tabellen-Lookup) überstimmt. Guss (_buildHumanGroup) UND Prefetch lesen dieselbe Auflösung,
    // damit der Boot-Avatar sein Memo warm trifft.
    _menschGussFarben(dials) {
        const kc = typeof window !== "undefined" && window.__koerperCore;
        const anker = this._menschAnkerFarben();
        const f = { skin: anker ? anker.skin : null, hair: anker ? anker.hair : null };
        if (dials && kc) {
            if (
                typeof dials.skinTone === "string" &&
                kc.SKIN_TONES &&
                Object.prototype.hasOwnProperty.call(kc.SKIN_TONES, dials.skinTone)
            ) {
                f.skin = kc.SKIN_TONES[dials.skinTone].hex >>> 0;
            }
            if (
                typeof dials.hairColor === "string" &&
                kc.HAIR_COLORS &&
                Object.prototype.hasOwnProperty.call(kc.HAIR_COLORS, dials.hairColor)
            ) {
                f.hair = kc.HAIR_COLORS[dials.hairColor].base >>> 0;
            }
        }
        return f;
    }

    // DIE TON-TAFEL (mensch.K4) — die EINE Ablage der Paletten, aus denen jeder Mensch seine Farben liest: je Zeile eine
    // Palette (koerper `menschPalette`, linear, je Ton ein Texel), Zeile 0 die Eins (ein Leib ohne eigene Palette: der Spieler,
    // jeder Mitspieler — sein Guss trägt seine Farben). Die Bewohner einer Siedlung belegen je Gestalt und je Kopf eine Zeile
    // (`_tonZeile`, in EINEM Zug je Siedlung: die Tafel lädt einmal hoch), die Siedlung gibt sie mit ihren Leibern zurück
    // (`_tonZeileFrei`). Leser: der Stoff jedes Menschen (`_tonFaktor`: Leib und Satz der Menge) und das Feld (`_tonFeldFarbe`).
    _tonTafel() {
        const st = this.state;
        if (st.tonTafel) return st.tonTafel;
        const kc = window.__koerperCore;
        if (!kc || !kc.MENSCH_TON) return AnazhRealm._kernPflichtBruch("koerper:MENSCH_TON");
        const T = THREE;
        const tex = new T.DataTexture(
            new Float32Array(kc.MENSCH_TON.length * AnazhRealm.TON_TAFEL.zeilen * 4).fill(1),
            kc.MENSCH_TON.length,
            AnazhRealm.TON_TAFEL.zeilen,
            T.RGBAFormat,
            T.FloatType
        );
        tex.name = "ton-tafel";
        tex.minFilter = tex.magFilter = T.NearestFilter;
        tex.generateMipmaps = false;
        tex.needsUpdate = true;
        st.tonTafel = tex;
        st.tonTafelFrei = [];
        st.tonTafelZeilen = 1; // die nächste nie belegte Zeile (0 ist die Eins)
        return tex;
    }
    // Eine Zeile der Tafel für eine Palette (`menschPalette`); die Tafel lädt im nächsten Bild. Eine volle Tafel bricht LAUT
    // (0: der Leib zeigt die Farben seiner Gestalt — die Linse der Menge nennt jedes Paar).
    _tonZeile(palette) {
        const tex = this._tonTafel();
        const st = this.state;
        const z = st.tonTafelFrei.length
            ? st.tonTafelFrei.pop()
            : st.tonTafelZeilen < AnazhRealm.TON_TAFEL.zeilen
              ? st.tonTafelZeilen++
              : 0;
        if (!z) {
            this._bruchMelden(
                `TON-TAFEL: alle ${AnazhRealm.TON_TAFEL.zeilen} Zeilen belegt — ein Mensch ohne seine Farben`
            );
            return 0;
        }
        const D = tex.image.data;
        const n = tex.image.width;
        for (let t = 0; t < n; t++) D.set([palette[t * 3], palette[t * 3 + 1], palette[t * 3 + 2], 1], (z * n + t) * 4);
        tex.needsUpdate = true;
        return z;
    }
    _tonZeileFrei(z) {
        if (z > 0 && this.state.tonTafel) this.state.tonTafelFrei.push(z);
    }
    // DER KAHLE KOPF (haar.K2: die Klasse haar am Spieler): das Haar ist die Kappe UND ihre Strähnen (K57, koerper HAAR_KAPPE ·
    // haarStreu) — die Kappe gießt der Ofen in die Kopf-Haut, ihre Ecken tragen den Ton des Haars (`aTon`, koerper `menschTon`) und
    // seine Farbe. Verbirgt eine Linse die Strähnen des Spielers (`aus`: was sie verbirgt), tragen die Ecken der Kappe die Farbe der
    // Haut ihres Kopfs; jeder Ruf stellt zuerst zurück, was der vorige färbte (ohne Strähnen in `aus`: nur zurück). Rückgabe die Zahl
    // der gefärbten Ecken. Bis hier zeigte das Bild ohne Haar (die Teilung der Werkbank, `bild --klasse spieler:kopf/hair`) die Kappe
    // im Ton ihrer Strähnen — getrennt wurden nur Strähnen-Ränder, die Klasse zeigte keine inneren Pixel (haar.K2#1 an 3ed95dcf, GTX)
    _kopfKahl(aus) {
        const pm = this.state.playerMesh;
        for (const [c, alt] of this._kahlStand || []) {
            for (const [i, x, y, z] of alt) c.setXYZ(i, x, y, z);
            c.needsUpdate = true;
        }
        this._kahlStand = [];
        const haar = (o) =>
            !!o &&
            ((o.userData && o.userData.__klasse) ||
                (o.material && o.material.userData && o.material.userData.__klasse)) === "hair";
        const vomSpieler = (o) => {
            for (let p = o; p; p = p.parent) if (p === pm) return true;
            return false;
        };
        const KC = typeof window !== "undefined" && window.__koerperCore;
        if (!pm || !KC || !(aus || []).some((o) => haar(o) && vomSpieler(o))) return 0;
        const [tH, tS] = [KC.menschTon("haarKappe"), KC.menschTon("skin")];
        let n = 0;
        pm.traverse((o) => {
            const a = o.isMesh && !haar(o) && o.geometry && o.geometry.attributes;
            const [t, c] = a ? [a.aTon, a.color] : [];
            if (!t || !c) return;
            const m = [0, 0, 0, 0];
            for (let i = 0; i < t.count; i++)
                if (Math.round(t.getX(i)) === tS)
                    ((m[0] += c.getX(i)), (m[1] += c.getY(i)), (m[2] += c.getZ(i)), m[3]++);
            if (!m[3]) return;
            const alt = [];
            for (let i = 0; i < t.count; i++)
                if (Math.round(t.getX(i)) === tH)
                    (alt.push([i, c.getX(i), c.getY(i), c.getZ(i)]),
                        c.setXYZ(i, m[0] / m[3], m[1] / m[3], m[2] / m[3]));
            if (!alt.length) return;
            this._kahlStand.push([c, alt]);
            c.needsUpdate = true;
            n += alt.length;
        });
        return n;
    }
    // DAS VERHÄLTNIS DER PALETTEN je Ecke (der Stoff liest es im Vertex-Takt): die Palette des Leibs (Zeile x) zu der seiner
    // Gestalt (Zeile y) am Ton der Ecke (`aTon`). `zeilen` (vec2-Knoten, optional): die Zeilen je Instanz (der Satz der Menge);
    // ohne sie die des zeichnenden Objekts (`userData.__ton`, `_tonLeibZeilen`).
    _tonFaktor(TSL, zeilen) {
        const tafel = this._tonTafel();
        const z = zeilen || this._tonLeibZeilen(TSL);
        const ton = TSL.int(TSL.attribute("aTon", "float").add(0.5));
        const lies = (zeile) => TSL.textureLoad(tafel, TSL.ivec2(ton, TSL.int(zeile)), TSL.int(0)).rgb;
        return lies(z.x).div(lies(z.y).max(1e-4));
    }
    // Die Zeilen des zeichnenden Objekts (je Objekt in seiner Bindegruppe, Takt object): [Leib, Gestalt], ohne Palette [0, 0]
    _tonLeibZeilen(TSL) {
        if (this._tonLeibKnoten) return this._tonLeibKnoten;
        const v = new THREE.Vector2();
        this._tonLeibKnoten = TSL.uniform(v).onObjectUpdate(({ object }) => {
            const t = object && object.userData ? object.userData.__ton : null;
            return v.set(t ? t[0] : 0, t ? t[1] : 0);
        });
        return this._tonLeibKnoten;
    }
    // DIE FARBE EINES GLIEDS IM FELD (mensch.K4): die Töne seiner Kapsel (`_gliedKapselFit`: je Ton sein Anteil an der Farbe
    // der Gestalt) je Ton mit dem Verhältnis der Paletten [Leib, Gestalt] — der Bewohner trägt fern dieselben Farben wie nah.
    // Liefert die Farbe (linear) oder null.
    _tonFeldFarbe(kapsel, zeilen) {
        if (!kapsel || !kapsel.toene || !zeilen || !(zeilen[0] > 0)) return null;
        const tex = this._tonTafel();
        const D = tex.image.data;
        const n = tex.image.width;
        const c = [0, 0, 0];
        for (const [t, r, g, b] of kapsel.toene) {
            const p = (zeilen[0] * n + t) * 4,
                q = (zeilen[1] * n + t) * 4;
            c[0] += (r * D[p]) / Math.max(1e-4, D[q]);
            c[1] += (g * D[p + 1]) / Math.max(1e-4, D[q + 1]);
            c[2] += (b * D[p + 2]) / Math.max(1e-4, D[q + 2]);
        }
        return { r: c[0], g: c[1], b: c[2] };
    }

    // DER EINE KEY-MÜNZER des Mensch-Ofens (18.07.): Guss und Prefetch münzen
    // DENSELBEN Schlüssel — das Key-Format lebt genau einmal.
    _ofenMenschKey(dials, skinColor, hairColor, lod) {
        let dKey = "";
        try {
            dKey = JSON.stringify(dials || {});
        } catch (_e) {
            dKey = "";
        }
        return "mensch|" + (lod | 0) + "|" + dKey + "|" + (skinColor >>> 0) + "|" + (hairColor >>> 0);
    }

    // DER MENSCH-OFEN (PIPE-VOLLENDUNG V18.459): derselbe Tisch, Zeile "koerper" —
    // bauMensch+morphAuf backen im Bäcker, der Stamm assembliert + memoisiert je
    // Dials+Farben. Der Spieler/Peer ist ein Template-Clone wie jede Kreatur.
    _ofenMenschTemplate(dials, skinColor, hairColor, lod, eigen) {
        const core = typeof window !== "undefined" && window.__koerperCore;
        if (!core || typeof core.bauMensch !== "function") return null;
        return this._ofenVorlage(this._ofenMenschKey(dials, skinColor, hairColor, lod), eigen, () => {
            try {
                const BAKER = typeof globalThis !== "undefined" ? globalThis.BAKERS_BY_KIND : null;
                if (!BAKER || typeof BAKER.koerper !== "function") return null;
                this._fadenUmgangen("Guss „mensch“ ohne Vorlage");
                const g = BAKER.koerper(core, "mensch", 0, lod | 0, { dials, skinColor, hairColor });
                const eintraege = [];
                g.traverse((o) => {
                    if (o.isMesh) eintraege.push(this._ofenMeshEintragAusThree(o));
                });
                if (g.userData && g.userData.__skelett)
                    eintraege.push({ kind: "__skelett", skelett: g.userData.__skelett });
                return this._ofenAssembleAsset(this._ofenBudget(core, "koerper", lod, eintraege, "mensch"));
            } catch (e) {
                this.log("Mensch-Ofen kalt-Guss scheiterte (" + (e && e.message) + ")", "ERROR");
                return null;
            }
        });
    }
    // DER LEIB DES SPIELERS AUS DEM FADEN (K60-2): die zwei Spieler-Vorlagen (Mensch lod 0 und 1, gelenkige Grobstufe) gießt
    // das Werk der Foundry, sobald das Buch steht — die Gestalt des Leibs steht im Buch (`_koerperStudioDials`, die Farben
    // `_menschGussFarben`), derselbe Dial-Merge und derselbe Key-Münzer wie der Rig-Guss (`_buildHumanoidRig`): der Bau des
    // Spielers trifft danach das Memo (Klon ~1 ms). Bis K60-2 goss der Haupt-Faden den Leib im sechsten Frame (Radeon kalt
    // 2,36 s bis zum ersten Weltbild, K602/p2.cpuprofile) und nach dem Buch ein zweites Mal mit den Dials des Studios. Der
    // Auftrag geht NAH zuerst (am Ort des Spielers); der Vorrat (`_ofenPrefetchKreaturen`) wartet auf denselben Zug.
    // DER LEIB WÜNSCHT, WAS SEIN ERSTES BILD ZEIGT (B5): zeigt es nur seinen Wurf (`_leibGrobVorBild`), geht vor dem Bild die
    // Grobstufe allein — die feine bestellt das Ereignis des Bilds (`_weltbildKommt`) und tauscht nach ihrer Ankunft ein
    // (`_leibFeinTausch`). Befund B5 (OMEN 18.10., GTX kalt): die feine wartete in w0 hinter dem Blatt-Atlas, baute 4,4 s und
    // hielt den Leib bis 10,46 s, die Grobstufe lag bei 4,23 s. Die Grobstufe zuerst: die erste Bestellung nach dem Buch
    // wartet im Werk hinter dem Atlas. `{ steht, da }`: steht = jede Vorlage des ersten Bilds liegt im Memo — oder ihr Guss
    // fiel LAUT (`OFEN-PREFETCH LEER`), dann gießt der Bau sie hier wie ohne Faden; da = alle Vorlagen.
    _ofenSpielerVorlagen() {
        if (this._spielerVorlagen) return this._spielerVorlagen;
        const z = { steht: false, da: null };
        this._spielerVorlagen = z;
        const memo = AnazhRealm._tierOfenMemo || (AnazhRealm._tierOfenMemo = new Map());
        const vorBild = [];
        const auftraege = [];
        // Prefetch münzt aus den LEBENDEN Quellen — derselbe Dial-Merge (START_PARAMS + _koerperStudioDials)
        // und Farb-Münzer (_menschGussFarben) wie der Rig-Guss, durch den EINEN Key-Münzer → warmes Memo.
        const kc = typeof window !== "undefined" && window.__koerperCore;
        if (kc && kc.START_PARAMS) {
            const bmD = this._koerperStudioDials();
            const dM = Object.assign({}, kc.START_PARAMS, bmD || {});
            const fM = this._menschGussFarben(bmD);
            const pm = this.state.playerMesh;
            const grob = this._leibGrobVorBild();
            // KREATUR-KOSTEN (3) — beide Stufen vorbacken (das Kreatur-Muster
            // unten): lod 0 = der animierte Gelenk-Baum, lod 1 = die gelenkige
            // Grobstufe (`_gelenkGestalt`). Warm = Spawn ~1 ms.
            for (const lodM of [1, 0]) {
                if (fM.skin === null || fM.hair === null) break; // Kern kalt → der Guss schreit ohnehin
                const keyM = this._ofenMenschKey(dM, fM.skin, fM.hair, lodM);
                // die Spieler-Vorlage ist fest (`_ofenVorlage`) — auch wenn ein Sync-Guss sie schon legte
                if (memo.has(keyM)) {
                    this._ofenVorlage(keyM, false, () => null, true);
                    continue;
                }
                const nachBild = lodM === 0 && grob;
                // die Stufen des ersten Bilds sind ein Kopf der Ankunft (`_foundryRang`: die Bahn ohne Arbeit, `_foundryPumpe`)
                const bestellen = () =>
                    this._foundryRequest(
                        "mensch",
                        0,
                        lodM,
                        { dials: dM, skinColor: fM.skin, hairColor: fM.hair },
                        this._foundryRang(pm ? pm.position : undefined, !nachBild)
                    ).then((meshes) => {
                        // fail-LAUT (V18.462): ein toter Prefetch war von Erfolg
                        // nicht unterscheidbar — das eine Wort macht ihn sichtbar.
                        if (!meshes || !meshes.length) {
                            if (!memo.has(keyM))
                                this.log(`OFEN-PREFETCH LEER: mensch lod${lodM} (Buch kalt/Timeout)`, "WARN");
                            return;
                        }
                        this._ofenVorlage(keyM, false, () => this._ofenAssembleAsset(meshes), true);
                    });
                const auftrag = nachBild
                    ? this._weltbildKommt()
                          .then(bestellen)
                          .then(() => this._leibFeinTausch())
                    : bestellen();
                if (!nachBild) vorBild.push(auftrag);
                auftraege.push(auftrag);
            }
        }
        const steht = () => {
            z.steht = true;
        };
        Promise.all(vorBild).then(steht, steht);
        z.da = Promise.all(auftraege).then(
            () => {},
            (e) => this._stoffBruch("die Spieler-Vorlagen (Mensch-Ofen im Faden)", e)
        );
        return z;
    }
    // Ist der Leib des Spielers gießbar, ohne den Haupt-Faden zu halten? Ohne Studio-Faden (`_foundryEnabled`: kein Worker,
    // die Grammatik-Bänder) gießt ihn der Bau hier; sonst wartet er auf das Buch und die Vorlagen seines ersten Bilds im Memo.
    _leibBereit() {
        if (!this._foundryEnabled()) return true;
        const f = this._foundry;
        if (!f || !f.ready || !f.recipes) return false;
        return this._ofenSpielerVorlagen().steht;
    }
    // Was das erste Bild vom Leib zeigt (B5): in der Ego-Sicht nur seinen Wurf — die Grobstufe wirft für beide Stufen
    // (`_gelenkGestalt`, Kern-Zeile `schatten`), die feine trägt dort kein Pixel (`_applyEgoSicht`). Die 3rd-Sicht zeigt die
    // Gestalt (die Grenze `ab` 40 m), ein Gerät in der Hand liest die Hand-Mitte der feinen (`handMitte`, nur lod 0 gegossen):
    // dort wünscht das Bild beide Stufen.
    _leibGrobVorBild() {
        const st = this.state;
        const p = st.player;
        return st.cameraMode !== "third" && !(p && p.equipped && p.equipped.held);
    }
    // DER TAUSCH DER FEINEN STUFE (B5): kam sie nach dem Bild, trägt der Leib des Spielers sie ab jetzt — derselbe Bau
    // (`applyPlayerSoul`, die Lage reist mit), die Grobstufe fällt mit dem alten Leib. Nur ein Leib, der nah die Grobstufe
    // trägt (`nahStufe`), tauscht; ein deferierter Bau trifft die feine selbst.
    _leibFeinTausch() {
        const st = this.state;
        const g = st.playerMesh && st.playerMesh.userData._gelenk;
        if (!g || g.nahStufe !== 1 || st._deferredAvatarSoul) return;
        this.applyPlayerSoul(st.player.soul);
    }
    // Boot-Prefetch (nach Book-Ingest): die Gattungen off-thread backen — die
    // Welt-Spawns treffen dann NUR noch das Memo (Clone ~1 ms, kein Freeze).
    // DER OFEN-VORRAT NACH DEM ERSTEN BILD (K60, die Regel des Vorrats aus K30): kein Leser des ersten Bildes liest ihn —
    // den Leib des Spielers gießt sein eigener Bau (`_deferredAvatarSoul`), die Kreaturen kommen nach dem Bild
    // (`_tickBootPhase3`). Bis K60 stellte er sich beim Worker-Start vor das Buch-Werk: acht Güsse (Mensch, Reh, Wolf,
    // Fuchs je zwei Stufen) hielten den Faden kalt 7 s, und jeder nahe Baum wartete hinter ihnen (Radeon, Kalt-Zeile
    // 24,9 s: die erste Baum-Antwort bei 13,8 s). Er wartet auf das EREIGNIS des Bildes (`_weltbildKommt`), nie auf die
    // Uhr; `_ofenVorratSteht` sagt Boot-Phase 3, dass jede Gattung im Memo liegt (oder laut fehlt).
    async _ofenPrefetchKreaturen() {
        await this._weltbildKommt();
        // ohne Bild steht es vor der Welt (`_weltbildSteht` im Boot des Null-Renderers): der Vorrat wartet auf das Erwachen (die
        // Heimat aus dem Faden, die Kreaturen des Boots) — sonst rennt er gegen ihren Guss, und jeder Boot bestellt andere Gattungen
        if (this.erwacht) await this.erwacht;
        const auftraege = [];
        const map = AnazhRealm.TETRAPODA_SOUL_MAP;
        const memo = AnazhRealm._tierOfenMemo || (AnazhRealm._tierOfenMemo = new Map());
        const gesehen = new Set();
        // die Spieler-Vorlagen (Mensch, beide Stufen) bestellt der Leib des Spielers selbst, sobald das Buch steht
        // (`_ofenSpielerVorlagen`, K60-2) — der Vorrat wartet auf denselben Zug und hält sie fest
        auftraege.push(this._ofenSpielerVorlagen().da);
        for (const soulKey of Object.keys(map)) {
            const recId = map[soulKey];
            if (!recId || gesehen.has(recId)) continue;
            gesehen.add(recId);
            const d = this._ofenKreaturDials(recId, null);
            if (!d) continue;
            for (const lod of [0, 1]) {
                const key = this._ofenKreaturKey(recId, d.dials, lod);
                if (memo.has(key)) {
                    this._ofenVorlage(key, false, () => null, true);
                    continue;
                }
                const auftrag = this._foundryRequest(recId, 0, lod, d.istDefault ? null : d.dials).then((meshes) => {
                    if (!meshes || !meshes.length) {
                        if (!memo.has(key))
                            this.log(`OFEN-PREFETCH LEER: ${recId} lod${lod} (Buch kalt/Timeout)`, "WARN");
                        return;
                    }
                    this._ofenVorlage(key, false, () => this._ofenAssembleAsset(meshes), true);
                });
                auftraege.push(auftrag);
            }
        }
        await Promise.all(auftraege);
        // DER GLIED-VORRAT (dorf-takt-z13): jede Gattung, die der Lebensraum gebären kann, zerlegt ihre Gestalt im Leerlauf, bevor
        // ein Tier entsteht (`_kreaturenBereit` wartet auf diesen Vorrat) — der Takt liest danach nur das Memo (`_gattungGlieder`)
        const L = AnazhRealm._lebensraumGesetz().L;
        await Promise.all(
            Object.keys(map)
                .filter((s) => map[s] in L.gattung)
                .map((s) => this._gliederBestellen(s))
        );
        this._ofenVorratSteht = true;
    }
    // DAS BEIN-MASS der Gestalt (Welle 5, die Zwei-Knochen-IK des Gang-Gesetzes): je Bein an der Vorlage in der Ruhe-Pose
    // (alle Gelenke 0) in der Sagittal-Ebene (y, z) des Rumpfs vermessen — a = Bein-Gelenk → Unterglied-Gelenk (Kette[2]),
    // b = Unterglied-Gelenk → Pfoten-Gelenk (Kette[3]), c = Pfoten-Gelenk → Aufsetz-Punkt (die Sohle DIESER Pfote, ihr tiefster
    // Haut-Vertex — vorher die Sohle der ganzen Gestalt: die Vorderpfote des GIGANTEN schwebte 3,6 cm über der Wiese), phi0 =
    // Ruhe-Winkel von a nach b, zr = Aufsetz-Punkt vor dem Bein-Gelenk, h = Gelenk-Höhe über dem Boden. In Metern (× f),
    // memoisiert an der Vorlage.
    static _tierBeinMass(t0, f) {
        if (t0._beinMass) return t0._beinMass;
        const T = t0.teile;
        const ketten = [
            [T.legFL, T.flU, T.flL, T.flP],
            [T.legFR, T.frU, T.frL, T.frP],
            [T.legHL, T.hlT, T.hlC, T.hlP],
            [T.legHR, T.hrT, T.hrC, T.hrP],
        ];
        t0.root.updateMatrixWorld(true);
        const lage = (o) => new THREE.Vector3().setFromMatrixPosition(o.matrixWorld);
        const sohle = ketten.map(() => Infinity);
        const v = new THREE.Vector3();
        t0.root.traverse((n) => {
            const A = n.isSkinnedMesh && n.geometry.attributes;
            if (!A || A.aSchale) return; // die Haut, nie das Fell (wie minY)
            const bi = ketten.map((K) => n.skeleton.bones.indexOf(K[3]));
            for (let i = 0; i < A.skinIndex.count; i++)
                for (let k = 0; k < 4; k++) {
                    const j = bi.indexOf(A.skinIndex.getComponent(i, k));
                    if (j < 0 || !(A.skinWeight.getComponent(i, k) > 0.5)) continue;
                    sohle[j] = Math.min(sohle[j], v.fromBufferAttribute(A.position, i).applyMatrix4(n.matrixWorld).y);
                }
        });
        const mass = ketten.map((K, j) => {
            const p0 = lage(K[0]),
                p1 = lage(K[2]),
                p2 = lage(K[3]);
            const ay = (p1.y - p0.y) * f,
                az = (p1.z - p0.z) * f,
                by = (p2.y - p1.y) * f,
                bz = (p2.z - p1.z) * f;
            const p0w = T.wolf.worldToLocal(p0.clone());
            return {
                p0: [p0w.x * f, p0w.y * f, p0w.z * f],
                a: [ay, az],
                b: [by, bz],
                c: [((Number.isFinite(sohle[j]) ? sohle[j] : t0.minY) - p2.y) * f, 0],
                phi0: Math.atan2(ay * bz - az * by, ay * by + az * bz),
                zr: (p2.z - p0.z) * f,
                h: (p0.y - t0.minY) * f,
            };
        });
        t0._beinMass = mass;
        return mass;
    }
    // DIE KÖRPER-KUGEL TRÄGT DIE BEINE (K3): die Kugel der Hüllen (`_ofenAssembleAsset`, Bind-Hülle × 1,25) reichte nicht
    // an das gestreckte Bein — am Hirsch lag die hintere Pfote im vorwärts gehenden Schritt bis 0,18 m außerhalb (die Probe
    // gate:kreatur-kosten (R)). Je Bein das Hüft-Gelenk und die gestreckte Kette (Glieder und Sohle, die Länge, über die
    // die IK nie streckt): die Kugel wächst, bis sie jede umschließt (die Senke zieht die Hüfte zur Mitte, nie fort).
    // Einmal je Vorlage, vor dem ersten Klon (Klone und die Grobstufe erben die Kugel).
    static _tierReichKugel(t0) {
        if (t0._reichKugel) return;
        t0._reichKugel = true;
        const T = t0.teile;
        t0.root.updateMatrixWorld(true);
        const meshes = [];
        t0.root.traverse((n) => {
            if (n.isSkinnedMesh && n.boundingSphere) meshes.push(n);
        });
        if (!meshes.length) return;
        const kugel = meshes[0].boundingSphere.clone().applyMatrix4(meshes[0].matrixWorld);
        const lage = (o) => new THREE.Vector3().setFromMatrixPosition(o.matrixWorld);
        for (const K of [
            [T.legFL, T.flL, T.flP],
            [T.legFR, T.frL, T.frP],
            [T.legHL, T.hlC, T.hlP],
            [T.legHR, T.hrC, T.hrP],
        ]) {
            const p0 = lage(K[0]),
                p1 = lage(K[1]),
                p2 = lage(K[2]);
            const kette = p0.distanceTo(p1) + p1.distanceTo(p2) + (p2.y - t0.minY);
            kugel.radius = Math.max(kugel.radius, kugel.center.distanceTo(p0) + kette);
        }
        const inv = new THREE.Matrix4();
        for (const m of meshes) m.boundingSphere = kugel.clone().applyMatrix4(inv.copy(m.matrixWorld).invert());
    }
    // Der Baum-GANG konsumiert das EINE Gang-Gesetz: cpgStep + STAND_POSE + MOTION-Profile (LIVE-Buch
    // über _motionProfileName) treiben die vier Bein-KETTEN des bauTier-Baums (Lab-Ziel-Mathe direkt,
    // nicht PD-geglättet). Deterministisch (Stand-Unruhe aus t-Sinus); der CPG-Zustand wohnt an
    // tb._gang, walkPhase ist nur der Phasen-Seed.
    _animateTierBaum(group, t, walkPhase, moving, emotions) {
        const tb = group && group.userData && group.userData._tierBaum;
        if (!tb || !tb.teile) return;
        const core = typeof window !== "undefined" && window.__tetrapodaCore;
        const T = tb.teile;
        // KREATUR-LEBEN/SCHWIMM-HEIMAT — der Körper-Zustand des Halters
        // (updateCreatures stempelt ud._motionZustand) führt in der EINEN Brücke.
        const zust = (group.userData && group.userData._motionZustand) || null;
        const name = this._motionProfileName(moving, emotions, "kreatur", zust) || (moving ? "joy" : "idle");
        // Die Kern-Tafel ist die EINZIGE Basis: unbekannter Profil-Name → idle-Zeile; Kern kalt → keine
        // Animation.
        const MOT = core && core.MOTION;
        let P = this._motionStudioProfile(moving, emotions, zust) || (MOT && (MOT[name] || MOT.idle)) || null;
        if (!P) return;
        // Verhaltens-AKTION als transienter Profil-Overlay (tetrapoda fx.verhalten, updateCreatures stempelt):
        // profil-Felder überlagern P, die Sonder-Kanäle dreh/kopfSweep/rollAmp/rollRate wirken an Rumpf/Kopf.
        // Abgelaufene Aktion fällt HIER (EIN Verfalls-Ort für beide Leser).
        // Lab-Spiegel: BEH_PICK.host = "aktionen.profil".
        let VA = group.userData && group.userData._verhaltenAktion;
        if (VA) {
            const nowS = this.state.creatureAnimationTime; // die Kreatur-Uhr, an der updateCreatures die Aktion stempelt
            // (ein Biss, der noch nicht geschnappt hat, fällt erst im Schnappen — die Landung trägt den Kopf: _kreaturBissTakt)
            if ((nowS >= VA.bis && !VA.biss) || !VA.def) {
                group.userData._verhaltenAktion = null;
                VA = null;
            } else if (VA.def.profil) {
                if (!VA._P || VA._Pbase !== P) {
                    VA._P = Object.assign({}, P, VA.def.profil);
                    VA._Pbase = P;
                }
                P = VA._P;
            }
        }
        // AUSKLINGE-SAUM: vor der Stufen-Grenze (`ab` × Größe) schreibt updateCreatures ud._animFade (1→0); Schritt/Sway/
        // Schwanz/Kopf klingen in die Stand-Pose aus, damit der Stufen-Schalter (`_gelenkStufe`) eine STEHENDE Gestalt
        // trifft. Aufrufer ohne _animFade → fadeMul 1.
        const fade = group.userData._animFade;
        const fadeMul = fade !== undefined && fade < 1 ? (fade > 0 ? fade : 0) : 1;
        // DIE FUSSFOLGE AUS DEM TEMPO (Meisterkarte Tiere H3, tetrapoda GANG_FOLGE): der Gang trägt das Muster, das das
        // Gang-Gesetz zum Tempo wählt (gs.folge, unten — Schritt lateral, Trab, Galopp nach der Froude-Zahl; im Wasser die
        // Paddel-Folge) und das Netz zieht die Beine hinein (cpgStep mit folge). Gesetzt wird es beim ersten Takt (der
        // walkPhase-Versatz desynchronisiert die Kreaturen); der Takt des Leibs liest es am Gang (g.off). Vorher setzte die
        // Stimmung das Muster (MOTION.phases beim Profil-Wechsel), und das alte Netz zog es in den Pass.
        let g = tb._gang || (tb._gang = { ph: [0, 0, 0, 0], lastT: t });
        // dtWeg = die echte Uhr-Spanne seit der letzten Auswertung (die Raten-Leiter wertet ferne Wesen nur jeden 2./4.
        // Takt aus) — der Weg teilt sich durch sie, nie durch den gedeckelten Animations-Schritt. Der TAKT rückt um
        // dieselbe Spanne vor (dtTakt, in Schritten ≤ 0,1 s — die Kopplung bleibt stabil; eine Pause über 1 s ist kein
        // Gang): mit dem gedeckelten Schritt blieb die Phase bei 30 fps und Raten-Leiter 1/4 (0,133 s je Auswertung)
        // 25 % hinter dem Weg, die Pfoten glitten (gate:tier-gang unter Last: Schlupf 0,27 → siehe Commit).
        const dtWeg = t - g.lastT;
        const dt = Math.max(0, Math.min(0.1, dtWeg));
        const dtTakt = Math.max(0, Math.min(1, dtWeg));
        g.lastT = t;
        // DAS GANG-GESETZ (Welle 5, tetrapoda gangSchritt): Takt und Hüft-Auslenkung folgen dem WEG des Leibs — die
        // Geschwindigkeit misst der Chokepoint selbst (Lage-Änderung je Uhr-Schritt, geglättet; jeder Halter — Welt,
        // Peer, Werkstatt — läuft durch ihn), die Bein-Länge trägt der Guss (tb.beinL × Körpergröße). Vorher kam der
        // Takt aus dem Gefühls-Profil (Freude 3,2 rad/s bei 0,06 rad Schritt, jede Geschwindigkeit): Schlupf 1,0. Ein
        // SPRUNG der Lage ist kein Lauf (`_lageTempo`): die Pfoten setzen am neuen Ort — vorher las der Gang einen Ruf über
        // 20 m als Lauf mit 8,5 m/s, und die Anker am alten Ort zogen die Beine 20 m zurück (gate:koerper-stand K5).
        // Tempo und Gangart wählt `_gangWahl`, dieselbe Wahl wie im Satz.
        const lage = group.position;
        let vLage;
        if (dtWeg > 0 && Number.isFinite(g.lageX)) {
            vLage = AnazhRealm._lageTempo(lage.x - g.lageX, lage.z - g.lageZ, dtWeg);
            if (vLage === null) g.fuss = null;
        }
        g.lageX = lage.x;
        g.lageZ = lage.z;
        const skala = group.scale.x || 1;
        const gs = AnazhRealm._gangWahl(g, vLage, dt, moving, tb.beinL * skala, this._gangZeile(false));
        // die Länge des Schwungs im Takt (rad): der Stand füllt den Tastgrad des Gesetzes (im Galopp kürzer, gs.tast)
        const sw = 2 * Math.PI * (1 - gs.tast);
        const folge = zust === "schwimmen" ? core.GANG_FOLGE.paddeln : gs.folge;
        if (!Array.isArray(folge) || folge.length !== 4) return AnazhRealm._kernPflichtBruch("tetrapoda:GANG_FOLGE");
        if (!g.off) for (let pi = 0; pi < 4; pi++) g.ph[pi] = walkPhase + folge[pi];
        g.off = folge;
        g.omega = gs.omega; // der Takt des Gangs — die Raten-Leiter tastet ihn nie gröber als ein Viertel ab
        const st = gs.S * fadeMul;
        const freq = st > 0 ? gs.omega : Number(P.freq) || 0.25;
        const phAlt = g.ph.slice();
        if (dtTakt > 0) {
            // der Schritt des Netzes trägt seinen Zug (GANG_FOLGE.kopplung × Takt, vier Beine): höchstens 1/(4·kopplung·Takt)
            const nT = Math.ceil(dtTakt / Math.min(0.1, 1 / (4 * core.GANG_FOLGE.kopplung * Math.max(1e-6, freq))));
            for (let k = 0; k < nT; k++) core.cpgStep(g.ph, freq, dtTakt / nT, folge);
        }
        // DER LEIB WIEGT SICH IM SCHRITT, NIE IM STAND (Welle LF, die Pfoten-IK): Wiegen (sway) und Federn (bob) sind die
        // Gewichts-Verlagerung von Tritt zu Tritt — ihr Anteil folgt dem Schritt des Gang-Gesetzes (eingeblendet in ~0,25 s).
        // Ein Leib, der laufen WILL und steht (der Wunsch ohne Weg), wiegte sonst im Lauf-Takt, und die stehenden Pfoten
        // knickten die Knie nach (gemessen am stehenden Wolf: Knie-Falte 0,16 rad statt < 0,05).
        g.schritt = (g.schritt || 0) + ((st > 0.002 ? 1 : 0) - (g.schritt || 0)) * (dt > 0 ? 1 - Math.exp(-4 * dt) : 1);
        // DER TAKT DES LEIBS (K07): der Kreis-Mittelwert der vier Bein-Phasen, je um ihren Versatz im Muster (im doppelten
        // Takt: Wiegen und Federn schwingen je Tritt) — im Muster gleich dem Takt des ersten Beins; ein Bein, das an der
        // Grenze seiner Kette abhebt (seine Phase springt auf den Schwung-Anfang), schüttelt den Rumpf nicht. Der Versatz
        // ist das Muster, mit dem die Beine gesetzt wurden (g.off).
        const offL = g.off;
        let cL = 0,
            sL = 0;
        for (let k = 0; k < 4; k++) {
            cL += Math.cos(2 * (g.ph[k] - offL[k]));
            sL += Math.sin(2 * (g.ph[k] - offL[k]));
        }
        // DER TAKT ZIEHT NACH (der Wechsel der Gangart): das Muster springt auf die neue Folge, die Beine folgen in etwa
        // einem Schritt — der Takt des Leibs läuft mit dem doppelten Takt der Beine weiter und zieht den Rest binnen eines
        // Schritts nach (sprang er mit, ruckte der Rumpf: Roll je Takt bis 2,9 × des ruhigen Gangs)
        const takt2Roh = Math.atan2(sL, cL) + 2 * offL[0];
        if (!Number.isFinite(g.leib)) g.leib = takt2Roh;
        else {
            const vor = g.leib + 2 * freq * dtTakt;
            const d = takt2Roh - vor;
            g.leib =
                vor + (d - 2 * Math.PI * Math.round(d / (2 * Math.PI))) * (1 - Math.exp((-freq * dtTakt) / Math.PI));
        }
        const takt2 = g.leib;
        let roll = Math.sin(takt2) * (Number(P.sway) || 0) * fadeMul * g.schritt;
        // V18.491.80 — ZIP/LAB→HOST: bodyZ reist im MOTION-Preset (Lab-Roll-
        // additiv neben sway·sin); ohne Feld 0 = byte-alt.
        roll += (Number(P.bodyZ) || 0) * fadeMul;
        // KREATUR-LEBEN — die Sonder-Kanäle der Aktion: Schüttel-Rolle, Ganz-
        // körper-Drehung (linear über die Dauer — endet bei dreh=2π nahtlos),
        // Kopf-Pendel (Scan). Ohne Aktion alles 0 = byte-alt.
        let drehY = 0;
        let sweepY = 0;
        if (VA && VA.def) {
            const nowS = this.state.creatureAnimationTime;
            const d = VA.def;
            if (Number.isFinite(d.rollAmp)) roll += Math.sin(nowS * (d.rollRate || 10)) * d.rollAmp * fadeMul;
            if (Number.isFinite(d.dreh)) {
                const frac = Math.max(0, Math.min(1, (nowS - VA.start) / Math.max(0.001, VA.bis - VA.start)));
                drehY = d.dreh * frac;
            }
            if (Number.isFinite(d.kopfSweep)) sweepY = Math.sin(nowS * 1.3) * d.kopfSweep * fadeMul;
        }
        // DIE HALTUNG DES BISSES (Welle LF kampf, Posten 5): im Ansprung neigen sich Rumpf und Kopf auf den Leib des Ziels
        // (VA.rumpfZiel · VA.kopfZiel, _kreaturBissKopf) — mit der Folge-Rate der Glieder (ihr Boden 18/s, legA); endet der
        // Ansprung, löst sich die Haltung ebenso.
        {
            const BZ = VA && VA.bissAkt ? VA : null;
            const haltA = dt > 0 ? 1 - Math.exp(-18 * dt) : 1;
            g.bissRumpf = (g.bissRumpf || 0) + (((BZ && BZ.rumpfZiel) || 0) - (g.bissRumpf || 0)) * haltA;
            g.bissKopf = (g.bissKopf || 0) + (((BZ && BZ.kopfZiel) || 0) - (g.bissKopf || 0)) * haltA;
        }
        if (T.wolf) {
            T.wolf.rotation.z = roll;
            // bodyX-Konsum: die Rumpf-Neigung der Profile (hunt duckt, playbow verbeugt); der Hang-Pitch lebt
            // getrennt am Kreatur-ROOT (creature.rotation.x). bob (Galopp-Federn, Lab: spineX·bob·sin(ph·2))
            // wird auf wolf.rotation.x verdichtet.
            const bob = (Number(P.bob) || 0) * fadeMul;
            T.wolf.rotation.x = (Number(P.bodyX) || 0) * fadeMul + Math.sin(takt2) * bob * g.schritt + g.bissRumpf;
            T.wolf.rotation.y = drehY;
        }
        // PD-Kanäle aus dem MOTION-Preset: tension → Stand-Unruhe + Rumpf-Plant-Pitch; kpMul → einpolige
        // Bein-Näherung. Fehlend → 1.0 (Lab-idle).
        const tension = Number.isFinite(Number(P.tension)) ? Number(P.tension) : 1.0;
        const kpMul = Number.isFinite(Number(P.kpMul)) ? Number(P.kpMul) : 1.0;
        if (!g.prevSt) g.prevSt = [0, 0, 0, 0];
        if (!Number.isFinite(g.plantX)) g.plantX = 0;
        if (dt > 0) g.plantX *= Math.exp(-14 * dt);
        if (st > 0.002) {
            for (let pi = 0; pi < 4; pi++) {
                const ns = Math.max(0, -Math.sin(g.ph[pi]));
                if (g.prevSt[pi] < 0.05 && ns > 0.15) g.plantX -= 0.012 * tension;
                g.prevSt[pi] = ns;
            }
        } else {
            for (let pi = 0; pi < 4; pi++) g.prevSt[pi] = Math.max(0, -Math.sin(g.ph[pi]));
        }
        if (T.wolf) T.wolf.rotation.x += g.plantX * fadeMul;
        // V18.491.80 — ear: Lab setzt earL.z=+ear / earR.z=−ear (MOTION.ear);
        // teile.earL/earR kommen aus dem __skelett-Beipack (Ofen). Fehlt → skip.
        const ear = (Number(P.ear) || 0) * fadeMul;
        if (T.earL) T.earL.rotation.z = ear;
        if (T.earR) T.earR.rotation.z = -ear;
        const ketten = [
            [T.legFL, T.flU, T.flL, T.flP],
            [T.legFR, T.frU, T.frL, T.frP],
            [T.legHL, T.hlT, T.hlC, T.hlP],
            [T.legHR, T.hrT, T.hrC, T.hrP],
        ];
        const seiten = [-1, 1, -1, 1];
        // V18.491.81 — kpMul: Lab skaliert pd.kp/kd; Host = einpolige Ziel-Näherung
        // (höher → knackiger). State an tb._gang; NeutralStance nullt den Gang.
        if (!g.legCur)
            g.legCur = [
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
            ];
        // die Glieder folgen ihrem Ziel im Gang ohne Nachlauf (die Ziele sind stetig: der Schwung kam mit dem alten Faktor
        // 2,5 um bis zu 5 cm hinter seinem Ziel auf und strich dabei über den Boden)
        const legA = dt > 0 ? 1 - Math.exp(-Math.max(18, 55 * kpMul) * (st > 0 ? 6 : 1) * dt) : 1;
        // DIE PFOTE STEHT AUF DEM BODEN UNTER IHR, DAS BEIN IM LOT (Welle LF, Leben-Schau 07.10.: am Querhang standen die
        // Beine 20–31° aus dem Lot — sie kippten mit dem Leib, die Pfoten zielten auf die Ebene des Leibs; der Stand-Schlupf
        // lag bei 0,56–1,27). Drei Schritte je Takt: das Fuß-Ziel in der WELT (Schritt 1, mit dem Halt des stehenden
        // Fußes), die Senke des Rumpfs auf die Reichweite der Beine (Schritt 2), die Pfote auf ihr Ziel per Abspreizen und
        // ebener Zwei-Knochen-IK im Rumpf-Raum (Schritt 3). Der Boden unter der Pfote ist _kreaturFussBoden (der
        // Stand-Leser der Sicht um den Träger des Leibs; wer schwimmt oder springt, hält die Pfote an seiner Ebene).
        const GG = core.GANG_GESETZ;
        const LANDUNG = 0.85; // der Anteil seines Wegs, ab dem ein sinkender Fuß den Punkt hält, an dem er aufsetzt
        const fLab = tb.f || 1;
        const vZiel = this._gangV || (this._gangV = new THREE.Vector3());
        const vHuefte = this._gangH || (this._gangH = new THREE.Vector3());
        // der Rumpf in seiner Ruhe-Lage (die Senke dieses Takts folgt aus den Zielen, Schritt 2)
        const ruhe = T.wolf ? tb._rumpfRuhe || (tb._rumpfRuhe = T.wolf.position.clone()) : null;
        if (T.wolf) {
            T.wolf.position.copy(ruhe);
            T.wolf.updateWorldMatrix(true, false);
        }
        // die Hüften im Leib (Gruppen-Raum) in der RUHE des Rumpfs, einmal je Tier: das Federn und Wiegen des Rumpfs dreht
        // die Hüfte um seinen Drehpunkt — folgte das Fuß-Ziel ihm, glitte der Fuß im Stand mit
        if (!tb._huefteLeib && T.wolf && T.wolf.parent) {
            const M = new THREE.Matrix4().copy(group.matrixWorld).invert();
            M.multiply(T.wolf.parent.matrixWorld).multiply(
                new THREE.Matrix4().compose(T.wolf.position, new THREE.Quaternion(), T.wolf.scale)
            );
            tb._huefteLeib = tb.bein.map((B) =>
                new THREE.Vector3(B.p0[0] / fLab, B.p0[1] / fLab, B.p0[2] / fLab).applyMatrix4(M)
            );
        }
        const gier = group.rotation.y || 0;
        const vorX = Math.sin(gier),
            vorZ = Math.cos(gier);
        const stand = st < 0.002;
        const fl = g.fuss || (g.fuss = [{ an: false }, { an: false }, { an: false }, { an: false }]);
        const ziele =
            g.ziele ||
            (g.ziele = [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ]);
        const glied = (B) => (Math.hypot(B.a[0], B.a[1]) + Math.hypot(B.b[0], B.b[1])) * skala;
        // wo die Pfote JETZT steht: ihre Sohle (das Ende des Pfoten-Glieds c — der Punkt, den die IK auf den Boden stellt;
        // das Gelenk darüber liegt am Hang um |c|·sin(Neigung) längs der Normale des Bodens versetzt)
        const pfoteHier = (K, L, fx, fz, BM) => {
            if (K[3] && g.legInit) {
                K[3].updateWorldMatrix(true, false);
                vZiel.set(0, BM.c[0] / fLab, BM.c[1] / fLab).applyMatrix4(K[3].matrixWorld);
                L.x = vZiel.x;
                L.z = vZiel.z;
            } else {
                L.x = fx;
                L.z = fz;
            }
            L.an = true;
        };
        // SCHRITT 1 — DAS FUSS-ZIEL IN DER WELT je Bein: unter der Hüfte in der Ruhe des Rumpfs (die Lage des Leibs mit
        // Gier, Nick und Wank — ohne sein Federn und Wiegen), längs der Blickrichtung um die Ruhe-Lage und den Schritt des
        // Gang-Gesetzes versetzt, auf dem Boden dort. Ein Fuß, der steht, GLEITET NIE: im Stand des Beins beim Gehen (Phase
        // π … 2π) bleibt er, wo er aufsetzte (das Ziel des Gesetzes wandert mit dem Leib zurück — Wank, Nick-Regeln und
        // Schub verschöben ihn sonst); er hebt erst im frühen Schwung ab (beginnt der Gang spät im Schwung, bleibt er stehen
        // bis zum nächsten) und führt vom Abhebe-Punkt auf das Ziel des Gesetzes. Ein STEHENDES Tier lässt die Pfoten, wo
        // sie stehen. Wo eine stehende Pfote fern ihrer Lage ist — im Stand fern dem Lot, im Gehen von der Hüfte nicht
        // mehr erreichbar —, TRITT sie dorthin: gehoben, in einer Viertel-Sekunde, eine nach der anderen.
        let tritt = false;
        for (let i = 0; i < 4; i++) if (fl[i].tritt >= 0) tritt = true;
        for (let i = 0; i < 4; i++) {
            const ph = g.ph[i];
            const K = ketten[i];
            const BM = tb.bein[i];
            const L = fl[i];
            // der Fußweg dieses Beins folgt SEINER Phasen-Rate (die Kopplung beschleunigt/bremst einzelne Beine): im Stand
            // wandert der Fuß mit genau der Geschwindigkeit des Leibs zurück
            const rate = dtTakt > 0 ? (g.ph[i] - phAlt[i]) / dtTakt : freq;
            const F = stand ? null : core.gangFuss(ph, st * (freq / Math.max(0.25 * freq, rate)), gs.tast);
            let hub = F ? F.hub : 0;
            if (tb._huefteLeib) vHuefte.copy(tb._huefteLeib[i]).applyMatrix4(group.matrixWorld);
            else vHuefte.copy(group.position);
            const vor = BM.zr * skala + (F ? F.dz : 0);
            let fx = vHuefte.x + vorX * vor,
                fz = vHuefte.z + vorZ * vor;
            const u = ((ph % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
            const imStand = stand || u >= sw;
            // der WELTFESTE ANKER (K07): ein gehender Fuß setzt auf, wo das Gesetz ihn hinstellt — sein Ziel am Ende des
            // Schwungs ist in der Welt stetig (die Hermite-Enden laufen mit der Stand-Rate); die Sohle des letzten Takts
            // lag mit den alten Gelenken am NEUEN Leib, der Anker sprang je Aufsetzen um v·dt nach vorn (am Wolf 1,6 m/s
            // 2,7 cm bei 60 fps, unter der Raten-Leiter das Vierfache — gate:tier-gang Schlupf 0,07–0,13). Ein stehendes Tier
            // lässt die Pfote, wo sie steht.
            if (imStand && !L.an && !(L.tritt >= 0)) {
                if (stand || !g.legInit) pfoteHier(K, L, fx, fz, BM);
                else {
                    // die Pfote setzt, wo die Landung in der Welt stand (unten), sonst auf das Ziel des Gesetzes
                    L.x = L.land ? L.lx : fx;
                    L.z = L.land ? L.lz : fz;
                    L.an = true;
                }
                L.land = false;
            }
            if (imStand && L.an && !(L.tritt >= 0) && !tritt) {
                const fern = stand
                    ? Math.hypot(fx - L.x, fz - L.z) > 0.15 * BM.h * skala
                    : Math.hypot(vHuefte.x - L.x, vHuefte.z - L.z) > glied(BM) - BM.c[0] * skala;
                if (fern) {
                    L.tritt = 0;
                    L.ax = L.x;
                    L.az = L.z;
                    tritt = true;
                }
            }
            // der freie Fuß (Tritt oder Schwung) und ob er schon sinkt (DIE LANDUNG, unten)
            let frei = true,
                sinkt = false;
            if (L.tritt >= 0) {
                L.tritt = Math.min(1, L.tritt + dt / 0.25);
                const w = L.tritt * L.tritt * (3 - 2 * L.tritt);
                fx = L.ax + (fx - L.ax) * w;
                fz = L.az + (fz - L.az) * w;
                hub = Math.pow(Math.sin(Math.PI * L.tritt), GG.hubForm);
                sinkt = L.tritt >= LANDUNG;
            } else if (imStand) {
                frei = false;
                fx = L.x;
                fz = L.z;
            } else {
                if (L.an && u < 0.7 * sw) {
                    L.ax = L.x;
                    L.az = L.z;
                    L.au = u;
                    L.an = false;
                }
                if (L.an) {
                    // der Gang beginnt spät im Schwung: der Fuß bleibt stehen bis zum nächsten
                    fx = L.x;
                    fz = L.z;
                    hub = 0;
                } else if (Number.isFinite(L.ax)) {
                    const w0 = Math.max(0, Math.min(1, (u - L.au) / Math.max(0.2 * sw, 0.8 * sw - L.au)));
                    const w = w0 * w0 * (3 - 2 * w0);
                    fx = L.ax + (fx - L.ax) * w;
                    fz = L.az + (fz - L.az) * w;
                }
                sinkt = !L.an && u >= LANDUNG * sw;
            }
            // DIE LANDUNG STEHT IN DER WELT (K07) — EIN Halt für jeden sinkenden Fuß: ab LANDUNG seines Wegs (der Schwung ab
            // 0,85 π, der Tritt ab 0,85 seiner Viertel-Sekunde) hält die Pfote den Punkt, an dem sie aufsetzt. Das Ziel des
            // Gesetzes läuft mit dem Leib: im Schwung, wo Phase und Leib im Folgen voneinander abwichen, strich die Pfote die
            // letzten 3 cm über den Boden (am Querhang 64 % des Wolf-Schlupfs); den Tritt hielt nichts (K16-Q) — läuft der
            // Leib an, während eine Pfote tritt, setzte sie auf das Ziel unter der wandernden Hüfte und strich in ihren
            // letzten zwei Takten je 3,6–4,1 cm über den Boden (Querhang 22,2°, Wolf: 8,3 cm von 41 cm Schlupf).
            if (sinkt) {
                if (!L.land) {
                    L.land = true;
                    L.lx = fx;
                    L.lz = fz;
                }
                fx = L.lx;
                fz = L.lz;
            } else if (frei) L.land = false;
            if (L.tritt >= 0) {
                L.x = fx;
                L.z = fz;
                L.an = true;
                if (L.tritt >= 1) {
                    L.tritt = -1;
                    L.land = false;
                }
            }
            const Z = ziele[i];
            Z[0] = fx;
            Z[1] = this._kreaturFussBoden(group, fx, fz);
            Z[2] = fz;
            Z[3] = hub;
            // DIE SOHLE AM HANG (Gelände H5, das Gesetz des Menschen-Fußes): Z[4..6] = die Normale des Bodens unter dem Ziel aus
            // `_gaitSohlenKipp` — die Pfote legt ihre Sohle darauf, ihr Gelenk steht um c längs dieser Normale über ihr. Bis
            // K8 huf hielt die Pfote die Lage des Rumpfs, quer um das Abspreizen zurückgedreht: am 25°-Hang lag ihre Sohle quer
            // waagrecht (Δ −23° gegen den Boden), auf der Wiese rollte sie mit dem Bein bis ±30° (gate:koerper-stand K8 huf
            // hang p95 3,2 cm, der Leser am Ziel lag 0,3 cm am Mesh).
            const kp = this._gaitSohlenKipp(fx, fz, gier, Z[1], group);
            const tl = Math.tan(kp.laengs),
                tq = Math.tan(kp.quer);
            const nl = Math.sqrt(1 + tl * tl + tq * tq);
            Z[4] = -(tl * vorX + tq * vorZ) / nl;
            Z[5] = 1 / nl;
            Z[6] = (tq * vorX - tl * vorZ) / nl;
        }
        // SCHRITT 2 — DIE SENKE (die Reichweite der Beine): die Beine stehen in der Ruhe fast gestreckt. Das Ende des
        // Schritts (Ruhe-Lage ± halber Fußweg) und am Hang der Boden unter der talseitigen Hüfte (der Leib neigt und rollt,
        // die Hüfte wandert talwärts, das Lot darunter trifft den Boden tiefer) lagen jenseits ihrer Länge — die IK klemmte,
        // die Pfote schwebte und glitt dem Ziel nach. Der Rumpf senkt sich LOTRECHT (die Hüften sinken auf ihr Lot, die
        // Fuß-Ziele bleiben), bis jede Pfote ihren Boden erreicht: je Bein das Gelenk über der Pfote höchstens
        // √(Glied² − seitlich² − Schritt-Ende²) unter der Hüfte; gedeckelt auf ein Drittel der Hüft-Höhe (ein Rumpf kriecht
        // nicht).
        let senke = 0;
        const vHw = this._gangHW || (this._gangHW = new THREE.Vector3());
        if (T.wolf) {
            for (let i = 0; i < 4; i++) {
                const B = tb.bein[i],
                    Z = ziele[i];
                vHw.set(B.p0[0] / fLab, B.p0[1] / fLab, B.p0[2] / fLab);
                vHw.applyMatrix4(T.wolf.matrixWorld);
                const cN = -B.c[0] * skala; // das Pfoten-Gelenk über der Sohle längs der Normale (Z[4..6])
                const dx = Z[0] + cN * Z[4] - vHw.x,
                    dz = Z[2] + cN * Z[6] - vHw.z;
                const quer = dx * vorZ - dz * vorX;
                const weit = Math.max(Math.abs(dx * vorX + dz * vorZ), Math.abs(B.zr) * skala + st / 2);
                const lg = glied(B) * 0.98;
                const ueber = vHw.y - (Z[1] + cN * Z[5]); // die Hüfte über dem Pfoten-Gelenk auf dem Boden
                const noetig = ueber - Math.sqrt(Math.max(0, lg * lg - quer * quer - weit * weit));
                if (noetig > senke) senke = Math.min(noetig, (B.h * skala) / 3);
            }
        }
        g.senke = (g.senke || 0) + (senke - (g.senke || 0)) * (dt > 0 ? 1 - Math.exp(-6 * dt) : 1);
        if (T.wolf && T.wolf.parent) {
            // das Lot im Raum des Rumpf-Halters: die Senke wirkt längs der Welt-Senkrechten, nie längs des geneigten Leibs
            const Pinv = (this._gangM || (this._gangM = new THREE.Matrix4())).copy(T.wolf.parent.matrixWorld).invert();
            const vA = vHw.copy(group.position).applyMatrix4(Pinv);
            const ax = vA.x,
                ay = vA.y,
                az = vA.z;
            vHw.copy(group.position);
            vHw.y -= g.senke;
            vHw.applyMatrix4(Pinv);
            T.wolf.position.set(ruhe.x + vHw.x - ax, ruhe.y + vHw.y - ay, ruhe.z + vHw.z - az);
            T.wolf.updateMatrix();
            T.wolf.matrixWorld.multiplyMatrices(T.wolf.parent.matrixWorld, T.wolf.matrix);
        }
        const Rinv = T.wolf
            ? (this._gangR || (this._gangR = new THREE.Matrix4())).copy(T.wolf.matrixWorld).invert()
            : null;
        // SCHRITT 3 — DIE PFOTE AUF DEM ZIEL: in den Rumpf-Raum gerechnet (er neigt, rollt, federt) stellt die Hüfte das Bein
        // erst seitlich in die Ebene des Pfoten-Gelenks (Abspreizen um die Längs-Achse: der Leib rollt, das Bein bleibt im
        // Lot), dann die ebene Zwei-Knochen-IK; die Pfote legt ihre Sohle auf die Normale des Bodens (Z[4..6], unten). Dieselbe
        // IK trägt den Stand mit seiner Gewichts-Unruhe.
        const vN = this._sohleN || (this._sohleN = new THREE.Vector3());
        const qA = this._sohleQA || (this._sohleQA = new THREE.Quaternion());
        const qN = this._sohleQN || (this._sohleQN = new THREE.Quaternion());
        const eA = this._sohleE || (this._sohleE = new THREE.Euler());
        for (let i = 0; i < 4; i++) {
            const K = ketten[i];
            const BM = tb.bein[i];
            const Z = ziele[i];
            const hub = Z[3];
            const p0x = BM.p0[0] * skala,
                p0y = BM.p0[1] * skala,
                p0z = BM.p0[2] * skala;
            vN.set(Z[4], Z[5], Z[6]);
            vZiel.set(Z[0], Z[1] + hub * GG.hub * BM.h * skala, Z[2]).addScaledVector(vN, -BM.c[0] * skala);
            if (Rinv) {
                vZiel.applyMatrix4(Rinv).multiplyScalar(fLab * skala);
                vN.transformDirection(Rinv);
            }
            // das Abspreizen: die Hüfte dreht die Bein-Ebene um die Längs-Achse durch das Pfoten-Gelenk
            const lx = vZiel.x - p0x,
                ly = vZiel.y - p0y;
            const ab = Math.atan2(lx, -ly);
            const ty = -Math.hypot(lx, ly),
                tz = vZiel.z - p0z;
            let z0, z1, z2, z3;
            {
                const ay = BM.a[0] * skala,
                    az = BM.a[1] * skala,
                    by = BM.b[0] * skala,
                    bz = BM.b[1] * skala;
                const la = Math.hypot(ay, az),
                    lb = Math.hypot(by, bz);
                const dZiel = Math.hypot(ty, tz);
                // DIE GRENZE DES BEINS (K07, die hintere Extremlage): ein gehaltener Fuß — im Stand oder spät im Schwung
                // wartend —, den die Kette nicht mehr erreicht, hebt ab: sein Schwung beginnt im nächsten Takt (die Phase
                // springt auf den Schwung-Anfang, die Kopplung führt sie zurück). Vorher hielt der Anker ihn bis zum Ende
                // der Phase, die IK klemmte, die Pfote schleifte dem Leib nach (am Querhang 0,08 des Leib-Wegs; im Folgen
                // mit nachlaufender Phase bis 0,96 m hinter der Hüfte). Das Maß ist die Kette selbst — eine Schätzung vor
                // der IK lag 4–9 cm neben ihr —, um den Weg des Leibs in einem Bild (1/60 s) vorausgedacht: der Fuß hebt,
                // bevor er schleift, nicht ein Bild danach (nie um den Weg einer Raten-Stufe: der Stand schrumpfte dort
                // auf ein Drittel). Im STAND tritt er (K8 huf, Schritt 1), ohne auf eine andere Pfote zu warten: vorher hielt der
                // Anker ihn, wo der Lauf endete — der GIGANT, der aus 0,9 m/s anhielt, schwebte 9,9 cm über der Wiese.
                if (dZiel > la + lb - (g.v || 0) * Math.min(dt, 1 / 60) && fl[i].an && !(fl[i].tritt >= 0)) {
                    const u = ((g.ph[i] % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
                    if (!stand && u >= 0.7 * sw) g.ph[i] += 2 * Math.PI - u;
                    else if (stand) [fl[i].tritt, fl[i].ax, fl[i].az, tritt] = [0, fl[i].x, fl[i].z, true];
                }
                const d = Math.min(la + lb - 1e-4, Math.max(Math.abs(la - lb) + 1e-4, dZiel));
                const gam = Math.acos(Math.max(-1, Math.min(1, (d * d - la * la - lb * lb) / (2 * la * lb))));
                const thK = (BM.phi0 < 0 ? -gam : gam) - BM.phi0;
                const cK = Math.cos(thK),
                    sK = Math.sin(thK);
                const sy = ay + (by * cK - bz * sK),
                    sz = az + (by * sK + bz * cK);
                // der Winkel-Unterschied auf (−π, π] (beide Richtungen zeigen nach unten: atan2 springt dort um 2π)
                let thH = Math.atan2(tz, ty) - Math.atan2(sz, sy);
                thH -= 2 * Math.PI * Math.round(thH / (2 * Math.PI));
                z0 = thH;
                z1 = 0;
                z2 = thK;
                // die Pfote faltet im Schwung und streckt sich, bevor sie den Boden erreicht (hub²: beim steilen Hub
                // stünde die gefaltete Sohle sonst noch in den untersten Zentimetern schräg und striche über den Boden; K07:
                // hub⁴ — mit hub² drehte die Pfote in den untersten 3 cm noch 0,05–0,09 rad je Takt um die Handwurzel, ihr
                // Aufsetz-Punkt fegte 0,5–1,4 cm je Takt über den Boden, Schlupf 0,06–0,085 beim Schritt)
                const h2 = hub * hub;
                z3 = -(thH + thK) + h2 * h2 * GG.falte;
                if (stand) {
                    // die Gewichts-Unruhe des Stands (Lab-Mathe, t-Sinus; tension skaliert sie) auf der IK
                    const wn = (Math.sin(t * 2.5 + i * 1.7) * 0.004 + Math.sin(t * 1.3 + i * 2.3) * 0.003) * tension;
                    const wShift = roll * seiten[i] * 0.025;
                    z0 += wn + wShift;
                    z1 += wn * 0.5 + wShift * 0.3;
                    z2 += wn * 0.3 - wShift * 0.2;
                    z3 += wn * 0.2;
                }
            }
            const cur = g.legCur[i];
            // DER GEHALTENE FUSS STEHT IN DEN GELENKEN (K16-Q): die einpolige Näherung (legA, kpMul) glättet nur den freien
            // Fuß — Schwung und Tritt. Ein Fuß, den das Gesetz in der Welt hält (an, kein Tritt), steht in der Lösung der IK
            // selbst: im Stand lief die Näherung mit einem Sechstel ihrer Gang-Rate, die Gelenke hinkten dem Anker nach, und
            // die Pfote glitt mit dem Leib — am Querhang (22,2°) drehte der stehende Wolf 4,15° je Takt, die hintere Pfote lag
            // 6,9 cm neben ihrem Anker und schnappte beim Anlaufen in einem Takt zurück (6,3 cm, der größte Einzel-Schlupf).
            if (!g.legInit || (fl[i].an && !(fl[i].tritt >= 0))) {
                cur[0] = z0;
                cur[1] = z1;
                cur[2] = z2;
                cur[3] = z3;
                cur[4] = ab;
            } else {
                cur[0] += (z0 - cur[0]) * legA;
                cur[1] += (z1 - cur[1]) * legA;
                cur[2] += (z2 - cur[2]) * legA;
                cur[3] += (z3 - cur[3]) * legA;
                cur[4] += (ab - cur[4]) * legA;
            }
            if (K[0]) {
                // erst abspreizen (um die Längs-Achse des Rumpfs), dann schwingen: Rz · Rx
                K[0].rotation.order = "ZXY";
                K[0].rotation.z = cur[4];
                K[0].rotation.x = cur[0];
            }
            if (K[1]) K[1].rotation.x = cur[1];
            if (K[2]) K[2].rotation.x = cur[2];
            // die Sohle auf dem Boden: die Glieder darüber tragen die Pfote im Rumpf-Raum als Rz(ab)·Rx(Σ), ihre Ruhe-Lage
            // (die Sohle waagrecht zur Bein-Ebene, Rz(ab)) dreht der kürzeste Weg auf die Normale; die Falte des Schwungs bleibt
            if (K[3] && Rinv) {
                qA.setFromEuler(eA.set(cur[0] + cur[1] + cur[2], 0, cur[4], "ZXY"));
                qN.setFromUnitVectors(vZiel.set(-Math.sin(cur[4]), Math.cos(cur[4]), 0), vN).multiply(qA);
                qN.premultiply(qA.invert());
                K[3].quaternion.setFromAxisAngle(vN.set(1, 0, 0), cur[3]).premultiply(qN);
            } else if (K[3]) K[3].rotation.x = cur[3];
        }
        g.legInit = true;
        if (T.headGroup) {
            // im Ansprung eines Bisses zielt der Kopf auf den Leib des Ziels (die Haltung des Bisses, g.bissKopf)
            T.headGroup.rotation.x = ((Number(P.headX) || 0) + 0.04 * Math.sin(t * 1.7)) * fadeMul + g.bissKopf;
            // KREATUR-LEBEN — das Scan-Pendel (kopfSweep); ohne Aktion 0 = byte-alt.
            // V18.491.80 — headY aus MOTION-Preset (Lab-Yaw) + Sweep additiv.
            T.headGroup.rotation.y = sweepY + (Number(P.headY) || 0) * fadeMul;
        }
        const amp = (Number(P.tailAmp) || 0.1) * fadeMul;
        const rate = Math.max(0.4, Number(P.tailRate) || 0.5);
        const ts = tb.tailSegs || [];
        for (let i = 0; i < ts.length; i++) ts[i].rotation.y = Math.sin(t * rate - i * 0.5) * amp;
    }

    // DER BODEN UNTER EINER PFOTE (Welle LF, die Pfoten-IK _animateTierBaum): der Stand-Leser der Sicht um den Träger des
    // Leibs (updateCreatures stempelt ihn je Takt: _traegerY, _traegerStruktur — die Höhe, auf der der Leib steht, und ob
    // ein Bau ihn trägt). Wer keinen Boden unter den Pfoten hat — schwimmend, im Sprung, oder ein Halter außerhalb der Welt
    // (Werkstatt, Sicht-Kopie ohne Träger) —, hält die Pfote an der Ebene seines Leibs (seine Lage).
    _kreaturFussBoden(group, x, z) {
        const ud = group.userData || {};
        const ebene = group.position.y;
        if (!Number.isFinite(ud._traegerY) || ud._motionZustand === "schwimmen" || ud._hopH > 0) return ebene;
        return this._fussBoden(x, z, ud._traegerY, ud._traegerStruktur === true);
    }

    _tetrapodaSoulParts(soulKey, ovOpt) {
        const recId = AnazhRealm.TETRAPODA_SOUL_MAP[soulKey];
        const gSpec = AnazhRealm.CREATURE_SKELETON_G[soulKey];
        if (!recId || !gSpec) return null;
        // ERFINDER-WELLE — der optionale ov-Kanal (Werkstatt-Regler): Overrides mergen
        // ueber die LIVE-Buch-Dials (ohne ovOpt byte-alt; kaltes Buch + ov → nur ov,
        // die Finite-Wache je Zeile traegt Teilvektoren).
        const s0 = this._tetrapodaStudioDials(recId);
        const s = ovOpt && typeof ovOpt === "object" ? Object.assign({}, s0 || {}, ovOpt) : s0;
        if (!s) return null;
        const arch = Object.assign({}, AnazhRealm.CREATURE_ARCHETYPES[gSpec.archetypeName] || {});
        for (const row of AnazhRealm.TETRAPODA_DIAL_MAP) {
            const v = Number(s[row.dial]);
            if (!Number.isFinite(v)) continue;
            arch[row.axis] = row.base + row.mul * v;
        }
        try {
            return AnazhRealm._creatureSkeleton(Object.assign({ archetype: arch }, gSpec));
        } catch (_e) {
            return null;
        }
    }

    // Das Pferd aus dem EINEN Skelett-Gesetz `_creatureSkeleton` (REITTIER_SKELETON_G = horse-Archetyp),
    // BODEN-GELIFTET (ein Bauplan steht auf y=0, kein Kreatur-Grounding) + QUARZ-KERN (magieleitung =
    // Antrieb, `_isMoveable`). Tags wert-gleich + Rolle vehicle (kein leder-Limb: gewann nie ein Tag-MAX).
    _holzrossParts() {
        const G = AnazhRealm.REITTIER_SKELETON_G.holzross;
        const arch = Object.assign({}, AnazhRealm.CREATURE_ARCHETYPES[G.archetypeName] || {});
        const parts = AnazhRealm._creatureSkeleton(Object.assign({ archetype: arch }, G));
        let minY = Infinity;
        for (const q of parts) minY = Math.min(minY, q.position.y - (q.size.y || 0) / 2);
        for (const q of parts) q.position.y -= minY;
        const t0 = parts[0].position;
        parts.push({
            shape: "octahedron",
            material: "quarz",
            position: { x: 0, y: t0.y, z: t0.z - 0.2 },
            size: { x: G.kern, y: G.kern, z: G.kern },
        });
        return parts;
    }

    // Builder: Group aus CREATURE_SOULS[name] (unbekannte Soul → wesen). Die Parts aus
    // `_tetrapodaSoulParts` sind die MECHANIK-Wahrheit (Tags/Stats/Physik/Allometrie lesen
    // `userData._soulParts`), die GESTALT trägt der Studio-Baum (bauTier). Tags/Stats aus den frozen
    // bodyParts — dial-tag-neutral, die Spawn-Affinität kippt NIE.
    _buildCreatureGroup(soulName, opts) {
        if (typeof THREE === "undefined") return null;
        const soulKey = AnazhRealm.CREATURE_SOULS[soulName] ? soulName : "wesen";
        const soul = AnazhRealm.CREATURE_SOULS[soulKey];
        // JEDE Kreatur ist ein FOUNDRY-ASSET: Art-Template aus dem Kreatur-Ofen (memo + Prefetch), die
        // Kreatur ein CLONE (Geometrien + Materialien geteilt, ~1 ms — kein Spawn-Freeze). Custom-Namen
        // kanonisieren oben auf wesen. Kalter Kern → LAUT null, nie ein Ersatz-Körper.
        const recId = AnazhRealm.TETRAPODA_SOUL_MAP[soulKey];
        const t0 = recId ? this._ofenKreaturTemplate(recId, opts && opts.dialsOv, 0, !!(opts && opts.eigen)) : null;
        if (t0 && t0.teile && t0.teile.wolf) {
            const parts2 = this._tetrapodaSoulParts(soulKey, opts && opts.dialsOv) || soul.bodyParts;
            const group2 = new THREE.Group();
            // DIE EINE WELT-GRÖSSE (Welle 5): der Maßstab des Gesetzbuchs (tetrapoda MASSSTAB, Meter je Lab-Einheit) —
            // der Wolf steht mit 0,8 m am Widerrist. Vorher maß die Gestalt sich an der Scheitel-Höhe der Seelen-Teile,
            // und die Allometrie-Schleife überschrieb diese Skala mit 1: die Welt zeigte Lab-Einheiten als Meter.
            const f2 = window.__tetrapodaCore.MASSSTAB.meterJeEinheit;
            AnazhRealm._tierReichKugel(t0);
            const klon = t0.root.clone(true);
            const teile = {};
            klon.traverse((n) => {
                if ((n.isGroup || n.isBone) && n.name) teile[n.name] = n;
            });
            // Die Tier-Haut (V18.497) ist geskinnt: der Klon bindet an SEINE Bones.
            AnazhRealm._ofenKlonRebind(klon, teile);
            const tailSegs = (t0.tailNamen || []).map((n) => teile[n]).filter(Boolean);
            const wrap2 = this._leibHuelle();
            wrap2.scale.setScalar(f2);
            wrap2.position.y = -t0.minY * f2;
            wrap2.add(klon);
            wrap2.userData._creatureSkin = true; // die 1st-Person-Regel deckt den Leib (beide Stufen)
            group2.add(wrap2);
            // DIE GROBSTUFE aus DERSELBEN Pipe (lod 1, gelenkig): unter DEMSELBEN Wrap an die Knochen der feinen gebunden,
            // Wurf und Stufen-Grenze aus der Kern-Zeile (`_gelenkGestalt`); fehlt sie, gibt es kein Tier (fail-closed).
            const t1 = this._ofenKreaturTemplate(recId, opts && opts.dialsOv, 1, !!(opts && opts.eigen));
            const gelenk = this._gelenkGestalt(window.__tetrapodaCore, "kreatur", wrap2, klon, teile, t1);
            if (!gelenk) {
                this.log(`Kreatur „${soulKey}": ohne gelenkige Grobstufe kein Tier (fail-closed).`, "ERROR");
                return null;
            }
            // der Leib meldet sich bei seinen Vorlagen an (die Grenze des Ofen-Memos, `_ofenVorlage`)
            this._ofenVorlagenBinden(group2, [t0, t1]);
            group2.userData._soulParts = parts2;
            group2.userData._gelenk = gelenk;
            group2.userData._tierBaum = {
                teile,
                tailSegs,
                f: f2,
                // die Hüft-Höhe der Gestalt in Metern (das Gang-Gesetz misst die Schritt-Länge an ihr)
                beinL: (new THREE.Vector3().setFromMatrixPosition(t0.teile.legHL.matrixWorld).y - t0.minY) * f2,
                bein: AnazhRealm._tierBeinMass(t0, f2),
                wrap: wrap2,
                // das Volumen der Gestalt bei Größe 1 (m³, die Nah-Gestalt im Rahmen des Tiers) — die Masse liest es
                leibV: AnazhRealm._leibVolumen(klon, group2),
                // die RUHE der Gestalt (`_gestaltRuhe`): die benannten Glieder der Vorlage, die nie ein Gang bewegt
                ruhe:
                    t0.ruheTeile ||
                    (t0.ruheTeile = (() => {
                        const R = {};
                        t0.root.traverse((n) => {
                            if ((n.isGroup || n.isBone) && n.name) R[n.name] = n;
                        });
                        return R;
                    })()),
            };
            this._gelenkStufe(group2, 0);
            return group2;
        }
        this.log(`Kreatur-Ofen für „${soulKey}" fiel aus (kalter Kern?) — fail-closed, kein Ersatz-Körper.`, "ERROR");
        return null;
    }

    // KÖRPERGRÖSSE-ACHSE: aus der netId eine deterministische Größe in BÄNDERN (klein/normal/gross/
    // GIGANT, Koloss selten) über den geteilten Roller (UNSIGNED) → Peer- und Re-Wachstum-konsistent.
    _creatureBodySize(idStr) {
        const g = this._rollGenome(String(idStr == null ? "c0" : idStr), "creature-size");
        const roll = g.axis("class");
        // SCHLUSS-WELLE — die Größen-Bänder (klein/normal/groß/GIGANT) sind
        // tetrapoda-Gesetz (VERHALTEN.groessen, Lehre 8: DIE Differenzierungs-
        // Achse); derselbe Wurf (axis/range) → gleiche Welt bei gleichem Kern.
        const K = AnazhRealm._verhaltenGesetz().groessen;
        for (let i = 0; i < K.length - 1; i++) {
            if (roll < K[i].bis) return g.range(K[i].name, K[i].min, K[i].max);
        }
        const letzte = K[K.length - 1];
        return g.range(letzte.name, letzte.min, letzte.max);
    }

    // Der size-Dial braucht KEINE eigene Achse (ein Doppel-Faktor wäre falsch): er reist durch die EINE
    // Pipe (_tetrapodaStudioDials → _ofenKreaturDials); die Spawn-Höhe = Template-Höhe × bodySize-Wurf
    // (gate:studio-uebergabe).

    // === DIE MOTION-RESONANZ ===
    // Die Bewegungs-Rolle JEDES Parts emergiert aus Form × Lage × Spiegelung gegen
    // MOTION_ROLE_SIGNATURES (argmax, Floor); nur Built-in-Seelen behalten Hand-Skelette
    // (_animateHuman/Phoenix/Dragon). Render-only. Input: parts (Bauplan ODER Soul-bodyParts);
    // Output: parts-alignierte Liste ({role, side, phase} | null) oder null, wenn nichts resoniert.
    computeMotionRoles(parts, connections) {
        if (!Array.isArray(parts) || parts.length < 2) return null;
        const SIG = AnazhRealm.MOTION_ROLE_SIGNATURES;
        const FLOOR = AnazhRealm.MOTION_ROLE_FLOOR;
        const eps = 1e-6;
        const info = [];
        let minY = Infinity;
        let maxY = -Infinity;
        let maxAX = eps;
        let maxAZ = eps;
        for (const p of parts) {
            if (!p || p.shape === "blueprint") {
                info.push(null);
                continue;
            }
            const s = p.size || {};
            let sx = Math.abs(Number(s.x) || 0.3);
            let sy = Math.abs(Number(s.y) || 0.3);
            let sz = Math.abs(Number(s.z) || 0.3);
            // Rotations-bewusste Ausmaße: |R|·s (Beträge der Rotations-Matrix × Halbachsen) = AABB-Hülle des
            // gedrehten Quaders — sonst liest der Klassifikator einen liegenden Schweif als stehendes Bein.
            const rot = p.rotation;
            if (rot && (rot.x || rot.y || rot.z)) {
                const cx = Math.abs(Math.cos(rot.x || 0));
                const sxr = Math.abs(Math.sin(rot.x || 0));
                const cy = Math.abs(Math.cos(rot.y || 0));
                const syr = Math.abs(Math.sin(rot.y || 0));
                const cz = Math.abs(Math.cos(rot.z || 0));
                const szr = Math.abs(Math.sin(rot.z || 0));
                // |R| für Euler XYZ, komponentenweise konservativ kombiniert.
                const ex = cy * cz * sx + (szr * cx + sxr * syr * cz) * sy + (sxr * szr + cx * syr * cz) * sz;
                const ey = cy * szr * sx + (cx * cz + sxr * syr * szr) * sy + (sxr * cz + cx * syr * szr) * sz;
                const ez = syr * sx + sxr * cy * sy + cx * cy * sz;
                sx = ex;
                sy = ey;
                sz = ez;
            }
            const pos = p.position || {};
            const px = Number(pos.x) || 0;
            const py = Number(pos.y) || 0;
            const pz = Number(pos.z) || 0;
            info.push({ sx, sy, sz, px, py, pz, shape: p.shape || "box" });
            minY = Math.min(minY, py - sy / 2);
            maxY = Math.max(maxY, py + sy / 2);
            maxAX = Math.max(maxAX, Math.abs(px) + sx / 2);
            maxAZ = Math.max(maxAZ, Math.abs(pz) + sz / 2);
        }
        const H = Math.max(eps, maxY - minY);
        const c01 = (v) => Math.max(0, Math.min(1, v));
        const roles = parts.map(() => null);
        let any = false;
        for (let i = 0; i < info.length; i++) {
            const a = info[i];
            if (!a) continue;
            const f = {
                elongV: c01((a.sy / Math.max(a.sx, a.sz, eps) - 1) / 1.5),
                elongH: c01((Math.max(a.sx, a.sz) / Math.max(a.sy, eps) - 1) / 1.5),
                // flat = PLATTE: die KLEINSTE Achse ist viel dünner als die
                // MITTLERE (nicht max/min — ein dünner LANGER Zylinder ist
                // gestreckt, keine Platte; der Arm-als-Flügel-Riss, V18.101).
                flat: (() => {
                    const d = [a.sx, a.sy, a.sz].sort((u, v) => u - v);
                    return c01((d[1] / (d[0] + eps) - 2.2) / 3);
                })(),
                lowAnchor: c01(1 - (a.py - a.sy / 2 - minY) / (0.3 * H)),
                topMount: c01((a.py - (minY + 0.55 * H)) / (0.45 * H)),
                sideMount: c01((Math.abs(a.px) / maxAX - 0.35) / 0.45),
                rearMount: c01((Math.abs(a.pz) / maxAZ - 0.4) / 0.4),
                roundish: a.shape === "sphere" || a.shape === "octahedron" ? 1 : a.shape === "box" ? 0.35 : 0.15,
                central: c01(1 - (Math.abs(a.px) / maxAX + Math.abs(a.pz) / maxAZ)),
                paired: 0,
            };
            // paired: ein Spiegel-Zwilling (gleiche Form, ähnliche Größe) auf
            // der x- ODER z-Achse — die Konjunktion als 0/1-Achse (V17.107).
            for (let j = 0; j < info.length; j++) {
                if (j === i) continue;
                const b = info[j];
                if (!b || b.shape !== a.shape) continue;
                if (Math.abs(a.sx - b.sx) + Math.abs(a.sy - b.sy) + Math.abs(a.sz - b.sz) > 0.2) continue;
                const mirrorX =
                    Math.abs(a.px + b.px) < 0.12 && Math.abs(a.px) > 0.04 && Math.abs(a.py - b.py) < 0.2 * H;
                const mirrorZ =
                    Math.abs(a.pz + b.pz) < 0.12 && Math.abs(a.pz) > 0.04 && Math.abs(a.py - b.py) < 0.2 * H;
                if (mirrorX || mirrorZ) {
                    f.paired = 1;
                    break;
                }
            }
            // Ψ1 — das EINE argmax-Organ (der f-Feature-Vektor ist dieselbe
            // Σ tag·gewicht-Sprache); der Floor bleibt die NACH-Prüfung wie eh.
            const m = this._resonateArgmax(f, SIG);
            const bestRole = m.key;
            if (m.score < FLOOR || !bestRole) continue;
            // Seite + Phase: Beine im Diagonal-Trab (die Dragon-Signatur
            // generalisiert: (x>0) xor (z>0) → Gegenphase), Arme gegen das
            // gleichseitige Bein, der Schwanz als |z|-versetzte Welle.
            const side = a.px > 0.02 ? 1 : a.px < -0.02 ? -1 : a.pz >= 0 ? 1 : -1;
            let phase = 0;
            if (bestRole === "bein") phase = ((a.px >= 0 ? 0 : 1) + (a.pz >= 0 ? 0 : 1)) % 2 === 0 ? 0 : Math.PI;
            else if (bestRole === "arm") phase = a.px >= 0 ? Math.PI : 0;
            else if (bestRole === "schwanz") phase = Math.abs(a.pz) * 0.8;
            roles[i] = { role: bestRole, side, phase };
            any = true;
        }
        // VERBINDUNGEN ALS GELENKE (Vorrang-Quelle): {partA, partB} definiert einen ANKER (nächster Punkt
        // zwischen den Zentren, größen-gewichtet) + Gelenk-Typ per Resonanz: RAD (kleinerer Part Zylinder,
        // Achse ⊥ Verbindung) · TÜR (flach, vertikale Achse) · WIRBEL (Kette ≥3, Phase = Index) · sonst
        // SCHARNIER (schwingt um den Anker). Ohne Verbindungen: Lage-Heuristik. ATTACHMENT-Punkte
        // (griff/sitz/trage, partB=-1) sind keine Gelenke; unbekannte Typen passieren (Typ aus Geometrie).
        if (Array.isArray(connections)) {
            connections = connections.filter((cn) => {
                const t = cn && AnazhRealm.CONNECTION_TYPES[cn.type];
                return !(t && t.attachment);
            });
        }
        if (Array.isArray(connections) && connections.length > 0) {
            const vol = (a) => (a ? a.sx * a.sy * a.sz : 0);
            const half = (a) => (a ? (a.sx + a.sy + a.sz) / 6 : 0.2);
            // AUTO-Verbindungen (`auto:1`, Kontakt-Emergenz) sind STRUKTUR: Statik, Stats, RAD und SCHARNIER
            // (das Architektur-Idle filtert es). Mehrdeutige Gelenke nur aus manuellen Verbindungen: flat+y trifft
            // jede Wand-auf-Boden (jede Hüttenwand schwenkte als Tür), jeder ≥3-Stapel ist ein Grad-≤2-Pfad
            // (jeder Turm wellte) → Ketten + TÜR nur manuell. Hütten wackeln NIE.
            const manualConns = connections.filter((cn) => !(cn && cn.auto));
            // Ketten-Erkennung: Verbindungs-Grad pro Part (nur bewusste Hand).
            const degree = new Map();
            for (const cn of manualConns) {
                degree.set(cn.partA, (degree.get(cn.partA) || 0) + 1);
                degree.set(cn.partB, (degree.get(cn.partB) || 0) + 1);
            }
            const chainIdx = new Map();
            {
                // Ketten = zusammenhängende Pfade, deren Glieder Grad ≤ 2 haben.
                const adj = new Map();
                for (const cn of manualConns) {
                    if (!adj.has(cn.partA)) adj.set(cn.partA, []);
                    if (!adj.has(cn.partB)) adj.set(cn.partB, []);
                    adj.get(cn.partA).push(cn.partB);
                    adj.get(cn.partB).push(cn.partA);
                }
                const seen = new Set();
                for (const [start, nbs] of adj) {
                    if (seen.has(start) || nbs.length !== 1 || (degree.get(start) || 0) > 2) continue;
                    // vom Ketten-Ende entlangwandern
                    const path = [start];
                    seen.add(start);
                    let cur = start;
                    for (;;) {
                        const nxt = (adj.get(cur) || []).find((n) => !seen.has(n) && (degree.get(n) || 0) <= 2);
                        if (nxt === undefined) break;
                        path.push(nxt);
                        seen.add(nxt);
                        cur = nxt;
                    }
                    if (path.length >= 3) for (let k = 0; k < path.length; k++) chainIdx.set(path[k], k);
                }
            }
            for (const cn of connections) {
                const A = info[cn.partA];
                const B = info[cn.partB];
                if (!A || !B) continue;
                // der KLEINERE bewegt sich um den Anker
                const movIdx = vol(A) <= vol(B) ? cn.partA : cn.partB;
                const fixIdx = movIdx === cn.partA ? cn.partB : cn.partA;
                const M = info[movIdx];
                const F = info[fixIdx];
                const dx = F.px - M.px,
                    dy = F.py - M.py,
                    dz = F.pz - M.pz;
                const w = half(M) / (half(M) + half(F));
                const anchor = { x: M.px + dx * w, y: M.py + dy * w, z: M.pz + dz * w };
                // dominante Verbindungs-Achse
                const ax = Math.abs(dx),
                    ay = Math.abs(dy),
                    az = Math.abs(dz);
                const connAxis = ay >= ax && ay >= az ? "y" : ax >= az ? "x" : "z";
                const mf = {
                    flat: (() => {
                        const d = [M.sx, M.sy, M.sz].sort((u, v) => u - v);
                        return c01((d[1] / (d[0] + eps) - 2.2) / 3);
                    })(),
                    lowAnchor: c01(1 - (M.py - M.sy / 2 - minY) / (0.3 * H)),
                };
                // F5 (§11): ein `spokeWheel` IST ein Rad (wie der Zylinder, den es ersetzt) →
                // es bekommt dieselbe RAD-Gelenk-Erkennung (rollt um seine Eigen-Achse). Sonst
                // verlöre der Wagen seine Gelenke/Fahr-Tiefe (V18.119/V18.150/M3).
                const isCyl = M.shape === "cylinder" || M.shape === "spokeWheel";
                const longAxis = M.sy >= M.sx && M.sy >= M.sz ? "y" : M.sx >= M.sz ? "x" : "z";
                let jointRole, jointAxis, phase;
                if (chainIdx.has(movIdx)) {
                    jointRole = "wirbel";
                    jointAxis = "y";
                    phase = chainIdx.get(movIdx) * 0.9;
                } else if (isCyl && longAxis !== connAxis && mf.lowAnchor > 0.4) {
                    jointRole = "rad";
                    // Das Rad rollt um seine ZYLINDER-EIGEN-Achse (_cylinderWorldAxis), NICHT um die Verbindungs-
                    // Richtung — die ist am Wagen die Fahrt-Richtung (das Rad drehte wie ein Propeller).
                    jointAxis = this._cylinderWorldAxis(parts[movIdx]);
                    // Die Achse läuft DURCH das RAD-Zentrum: der größen-gewichtete
                    // Zwischen-Anker ließe das Rad auf einer ~0.26-m-Kreisbahn EIERN.
                    anchor.x = M.px;
                    anchor.y = M.py;
                    anchor.z = M.pz;
                    phase = 0;
                } else if (connAxis === "y" && mf.flat > 0.4 && !cn.auto) {
                    // §7.1 — TÜR nur aus bewusster Hand (s. manualConns oben).
                    jointRole = "tuer";
                    jointAxis = "y";
                    phase = 0;
                } else {
                    jointRole = "scharnier";
                    // Schwung um die horizontale Achse ⊥ zur Verbindungs-Richtung
                    jointAxis = connAxis === "x" ? "z" : "x";
                    phase = (M.px >= 0 ? 0 : 1) % 2 === 0 ? 0 : Math.PI;
                }
                const side = M.px > 0.02 ? 1 : M.px < -0.02 ? -1 : 1;
                const roleObj = { role: jointRole, side, phase, anchor, axis: jointAxis, joint: true };
                // V18.491.120 — Achs-Semantik front/heck placeholder (second pass fills from longitudinal x)
                if (jointRole === "rad") roleObj.front = false;
                roles[movIdx] = roleObj;
                any = true;
            }
        }
        // V18.491.120 — Achs-Semantik front/heck from longitudinal x (Lab corners.front; Host had none).
        const rads = [];
        for (let i = 0; i < roles.length; i++) {
            if (roles[i] && roles[i].role === "rad") rads.push(roles[i]);
        }
        if (rads.length >= 2) {
            let sx = 0;
            for (let i = 0; i < rads.length; i++) sx += rads[i].anchor.x;
            const mid = sx / rads.length;
            for (let i = 0; i < rads.length; i++) rads[i].front = rads[i].anchor.x > mid + 1e-4;
        }
        return any ? roles : null;
    }

    // Welt-Achse der Zylinder-HÖHE: lokale Y durch die Euler-Rotation ('XYZ': R = Rx·Ry·Rz; v = R·e_y =
    // die mittlere Spalte), dominante |Komponente| → "x"/"y"/"z" (rotation.z=π/2 → X; rotation.x=π/2
    // → Z; unrotiert → Y).
    _cylinderWorldAxis(part) {
        const rot = (part && part.rotation) || {};
        const cx = Math.cos(rot.x || 0),
            sx = Math.sin(rot.x || 0);
        const cy = Math.cos(rot.y || 0),
            sy = Math.sin(rot.y || 0);
        const cz = Math.cos(rot.z || 0),
            sz = Math.sin(rot.z || 0);
        const vx = Math.abs(-sz * cy);
        const vy = Math.abs(cz * cx - sz * sy * sx);
        const vz = Math.abs(cz * sx + sz * sy * cx);
        return vy >= vx && vy >= vz ? "y" : vx >= vz ? "x" : "z";
    }

    // Bewegungs-Rollen pro Kreatur-Seele — einmal berechnet (eine Seele =
    // EINE Part-Liste = EINE Rollen-Liste; Map-Cache über den Seelen-Namen).
    _motionRolesForSoul(soulName) {
        if (!soulName) return null;
        if (!this._motionRolesCache) this._motionRolesCache = new Map();
        if (this._motionRolesCache.has(soulName)) return this._motionRolesCache.get(soulName);
        const soul = AnazhRealm.CREATURE_SOULS[soulName];
        const roles = soul && Array.isArray(soul.bodyParts) ? this.computeMotionRoles(soul.bodyParts) : null;
        this._motionRolesCache.set(soulName, roles);
        return roles;
    }

    // STUDIO-BEWEGUNGS-PROFIL: der EINE Leser der tetrapoda-fx.motion-Daten (Vertrag §8.2). Rezept =
    // Daten-Zeile MOTION_HOST_RECIPE, Zustand→Profil = MOTION_PROFILE_MAP. Kein zweites Animations-System:
    // _animateCompoundMotion LIEST die Zahlen (Schwanz: tailRate/tailAmp); _animateHumanoidRig bleibt
    // unberührt. Kaltes Buch → null, jeder Leser fällt auf seine Konstante.
    _motionStudioProfile(moving, emotions, zustand) {
        const f = this._foundry;
        const rec = f && f.recipes ? f.recipes[AnazhRealm.MOTION_HOST_RECIPE] : null;
        const m = rec && rec.fx && rec.fx.motion && rec.fx.motion.presets;
        if (!m) return null;
        const p = m[this._motionProfileName(moving, emotions, "kreatur", zustand)];
        return p && typeof p === "object" ? p : null;
    }
    // DER EINE VERHALTENS-LESER: Aktions-Katalog + Stimmung→Wahl wohnen im tetrapoda-Gesetzbuch
    // (fx.verhalten, LIVE-Buch; Kern-Alias derselben Quelle). null = Buch UND Kern kalt → kein Verhalten.
    _tetrapodaVerhalten() {
        const f = this._foundry;
        const rec = f && f.recipes ? f.recipes[AnazhRealm.MOTION_HOST_RECIPE] : null;
        const v = rec && rec.fx && rec.fx.verhalten;
        if (v && v.aktionen && v.stimmung) return v;
        const core = typeof globalThis !== "undefined" ? globalThis.__tetrapodaCore : null;
        const v2 = core && core.VERHALTEN;
        return v2 && v2.aktionen && v2.stimmung ? v2 : null;
    }
    // KREATUR-LEBEN — der EINE Jagd/Flucht-Stempel für die Motion-Brücke:
    // setzt/löscht NUR die eigenen Zustände (der Schwimm-Stempel im Wasser-
    // Block führt physisch danach — Wasser schlägt Land).
    _kreaturZustandStempel(creature, zustand) {
        const ud = creature.userData;
        if (!ud) return;
        if (zustand) ud._motionZustand = zustand;
        else if (
            ud._motionZustand === "jagd" ||
            ud._motionZustand === "hetzen" ||
            ud._motionZustand === "flucht" ||
            ud._motionZustand === "fressen"
        )
            ud._motionZustand = null;
    }
    // DIE ERNÄHRUNG EINES TIERS (der Dial diet seiner Gattung, über die Soul-Karte — einmal je Wesen gemerkt): der EINE Leser
    // für das Weiden (_tickKreaturVerhalten) und den Kadaver (_kreaturAasZug). Ohne Studio-Dials ein Fleischfresser (1).
    _kreaturDiet(creature) {
        const ud = creature.userData;
        if (ud._verhaltenDiet === undefined) {
            const recId = AnazhRealm.TETRAPODA_SOUL_MAP && AnazhRealm.TETRAPODA_SOUL_MAP[ud.soul];
            const dials = recId && this._tetrapodaStudioDials ? this._tetrapodaStudioDials(recId) : null;
            ud._verhaltenDiet = dials && Number.isFinite(dials.diet) ? dials.diet : 1;
        }
        return ud._verhaltenDiet;
    }
    // KREATUR-LEBEN — der deterministische Verhaltens-Hash (FNV-1a über zwei
    // Zahlen; kein Math.random — dieselbe Kreatur würfelt reproduzierbar).
    _verhaltenHash(a, b) {
        let h = 2166136261 >>> 0;
        h ^= a >>> 0;
        h = Math.imul(h, 16777619) >>> 0;
        h ^= b >>> 0;
        h = Math.imul(h, 16777619) >>> 0;
        return h >>> 0;
    }
    // VERHALTENS-TICK (je nahe Kreatur): Stimmung aus dem echten Zustand (jagd/flucht/schwimmen →
    // Emotions-Achsen → die Tätigkeit des Tags), im deterministischen Takt (alle=[min,max] s, Hash aus Index
    // + Zeit-Bucket) eine AKTION aus dem Buch an ud._verhaltenAktion; _animateTierBaum trägt sie, tempo
    // und hop wirken im Bewegungs-Pfad. Flucht/Schwimmen tragen keine Aktion.
    _tickKreaturVerhalten(creature, i, nowS) {
        const ud = creature.userData;
        if (!ud) return;
        // der Ansprung eines Bisses (_kreaturBissAnsatz) spielt zu Ende — auch in Hetze und Flucht, bis zur Landung
        if (this._kreaturAnsprungOffen(creature)) return;
        const z = ud._motionZustand;
        if (z === "flucht" || z === "schwimmen" || z === "hetzen") {
            ud._verhaltenAktion = null;
            return;
        }
        const V = this._tetrapodaVerhalten();
        if (!V) return;
        const Z = ud._gezeigt ? AnazhRealm._lebensraumGesetz().E.zeigt[ud._gezeigt] : null;
        let mood;
        if (z === "jagd") {
            mood = "jagd";
        } else if (z === "fressen") {
            mood = "fressen"; // der Kopf im Kadaver (_kreaturAasZug)
        } else {
            // SCHLUSS-WELLE — die Stimmungs-Schwellen des Ticks sind Gesetzbuch-
            // Zeilen (tetrapoda VERHALTEN.stimmung.schwellen, fail-closed).
            const SW = AnazhRealm._verhaltenGesetz().stimmung.schwellen;
            const em = ud.emotions;
            if (em && (Number(em.chaos) || 0) >= SW.chaos) mood = "alert";
            else if (em && (Number(em.joy) || 0) >= SW.joy) mood = "joy";
            else {
                // DIE TÄTIGKEIT ZEIGT SICH (Tiere K4, tetrapoda ETHOGRAMM_GESETZ.zeigt): wer wandernd ruht, ruht (nacht), wer
                // äst, grast (tag), sonst zieht das Tier (idle) — der Tag aus seinen Pegeln (`_kreaturTaetigkeit`). Vorher
                // ruhte jedes Tier, solange die Sonne unter nachtSin stand, und am Tag weidete jeder Pflanzenfresser.
                mood = Z ? Z.stimmung : "idle";
            }
        }
        const A = ud._verhaltenAktion;
        if (A && nowS < A.bis) return; // die laufende Aktion spielt zu Ende
        const row = V.stimmung[mood] || V.stimmung.idle;
        if (!row || !Array.isArray(row.aktionen) || !row.aktionen.length) return;
        const alle = Array.isArray(row.alle) && row.alle.length === 2 ? row.alle : [6, 12];
        // eine Tätigkeit mit Aktion (ruhen, äsen) trägt sie ohne Pause: das ruhende Tier liegt, das äsende grast
        const fort = !!(Z && Z.aktion && Z.stimmung === mood);
        if (ud._verhaltenMood !== mood || !Number.isFinite(ud._verhaltenNext)) {
            // Stimmungs-Wechsel: neuen Takt würfeln (deterministisch), noch keine Aktion — die einer Tätigkeit beginnt sofort.
            ud._verhaltenMood = mood;
            const h0 = this._verhaltenHash(i + 1, (nowS * 10) | 0);
            ud._verhaltenNext = nowS + (fort ? 0 : alle[0] + ((h0 % 1000) / 1000) * (alle[1] - alle[0]));
            if (!fort) return;
        }
        if (nowS < ud._verhaltenNext) return;
        const h = this._verhaltenHash((i + 1) * 2654435761, nowS | 0);
        // BEH_PICK.host — Feel .119; picks V.aktionen[name] (aktionen.profil world).
        const name = row.aktionen[h % row.aktionen.length];
        const def = V.aktionen[name];
        if (!def) return;
        const dauer = Number.isFinite(def.dauer) ? def.dauer : 1;
        ud._verhaltenAktion = { name, def, start: nowS, bis: nowS + dauer };
        // hop: die Aktion springt — über das EINE Sprung-Gesetz (creatureJump: Höhe aus der Freude, Abflug √(2·g·h)); der
        // Würfel je Frame ist gefallen, ein Sprung startet nur hier.
        if (def.hop === true) this.creatureJump(creature);
        ud._verhaltenNext = nowS + dauer + (fort ? 0 : alle[0] + ((h % 977) / 977) * (alle[1] - alle[0]));
    }
    // DER EINE BRÜCKEN-RESOLVER (MOTION_EMOTION_PROFILES, Vorrang-Zeilen; keine Achse über der Schwelle
    // → MOTION_PROFILE_MAP-Default). Beide Leser (_koerperMotionProfile + _motionStudioProfile) fließen
    // hier durch — EINE Quelle, zwei Spalten (koerper/kreatur).
    _motionProfileName(moving, emotions, column, zustand) {
        // Der KÖRPER-ZUSTAND führt VOR der Emotions-Achse (schwimmend paddelt, jagend pirscht):
        // MOTION_ZUSTAND_PROFILES ist Daten; kein Zustand / keine Zeile → Emotions-Pfad.
        if (zustand) {
            const zrow = AnazhRealm.MOTION_ZUSTAND_PROFILES[zustand];
            const zname = zrow && zrow[column];
            if (zname) return zname;
        }
        const e = emotions && typeof emotions === "object" ? emotions : null;
        if (e) {
            for (const row of AnazhRealm.MOTION_EMOTION_PROFILES) {
                const v = Number(e[row.axis]) || 0;
                if (v < row.min || !row[column]) continue;
                // SCHLUSS-WELLE — die optionale GEGEN-ACHSEN-Wand einer Zeile
                // (Zorn = chaos OHNE Bedrohungs-sorrow): liegt die benannte
                // Gegen-Achse auf/über ihrer max-Schwelle, fällt die Zeile.
                if (row.unter && (Number(e[row.unter.axis]) || 0) >= row.unter.max) continue;
                return row[column][moving ? "moving" : "idle"];
            }
        }
        const d = AnazhRealm.MOTION_PROFILE_MAP[column];
        return d ? d[moving ? "moving" : "idle"] : null;
    }
    // KOERPER-BEWEGUNGS-PROFIL: der EINE Leser der koerper-fx.motion-Daten (Vertrag §8.2), Schwester von
    // `_motionStudioProfile` (Spalte "koerper"). Kaltes Buch → null, Leser fallen auf ihre Konstante.
    _koerperMotionProfile(moving, emotions) {
        const f = this._foundry;
        const rec = f && f.recipes ? f.recipes[AnazhRealm.KOERPER_HOST_RECIPE] : null;
        const m = rec && rec.fx && rec.fx.motion && rec.fx.motion.presets;
        if (!m) return null;
        // Der KAMPF-ZUSTAND führt vor der Emotions-Achse — NUR im Live-Read (emotions gesetzt): die
        // Referenz-Reads (emotions=null) bleiben Neutral-Anker der Delta-Brücken, sonst wäre fight-Delta 0.
        const zust = emotions ? this._koerperKampfZustand() : null;
        const p = m[this._motionProfileName(moving, emotions, "koerper", zust)];
        return p && typeof p === "object" ? p : null;
    }
    // ZENSUS-REST V18.488 — DER KAMPF-ZUSTAND DES AVATARS: im Schwung ODER in
    // der Nachklang-Haltung (KAMPF_HALTUNG_SEC nach dem letzten Angriff) steht
    // der Körper in Garde ("fight" — die erste lebende koerper-Zustands-Zeile).
    _koerperKampfZustand() {
        const p = this.state && this.state.player;
        if (!p) return null;
        if (p._swing) return "kampf";
        const now = performance.now() / 1000;
        if (Number.isFinite(p.lastAttackAt) && now - p.lastAttackAt < AnazhRealm.KAMPF_HALTUNG_SEC) return "kampf";
        return null;
    }
    // DIE EINE GESTALT-DIAL-QUELLE: liest die acht Morph-Dials des Da-Vinci-Studios LIVE
    // (f.recipes[mensch].s). Kaltes Buch → null → Avatar aus den Host-Konstanten (_buildHumanGroup).
    _koerperStudioDials() {
        const f = this._foundry;
        const rec = f && f.recipes ? f.recipes[AnazhRealm.KOERPER_HOST_RECIPE] : null;
        const s0 = rec && rec.s;
        const s = s0 && typeof s0 === "object" ? s0 : null;
        // DIE PRÄGUNG DES MENSCH-REZEPTS = VORRANG-Quelle (ws.studioOv, geschrieben vom EINEN Übergabe-Kanal und den
        // Werkstatt-Reglern): Dials und Gestalt-Wahlen ÜBER das Buch (bmDials → Mensch-Ofen-Memo-Key → bakeMenschInstance).
        // Beim Peer-Avatar-Guss FÜHRT die Prägung des SENDERS: _p2pApplyPeerSoul setzt sie transient in
        // this._activePeerUebergabe (try/finally; {} = der Peer ohne Prägung) — derselbe Merge, andere Quelle.
        const ue =
            this._activePeerUebergabe !== undefined && this._activePeerUebergabe !== null
                ? this._activePeerUebergabe
                : this._studioPraegung(AnazhRealm.KOERPER_HOST_RECIPE);
        return ue && Object.keys(ue).length ? Object.assign({}, s || {}, ue) : s;
    }

    // Der Mensch hängt an derselben Größen-Achse: die koerperstudio-Dials tragen den Größen-Faktor in
    // _applySizeMultipliersToStats. Default-Dials (height 1.0 · mass 0.35 · tone 0.5) → EXAKT 1.0;
    // Spanne ≈ 0.63…1.61 (wie Custom-Avatare 0.7…1.7). Höhe quadratisch, Masse/Tonus linear-mild;
    // der Aufrufer dämpft per sqrt.
    _humanDialSizeFactor() {
        const s = this._koerperStudioDials();
        if (!s) return 1;
        const height = Number.isFinite(s.height) ? s.height : 1.0;
        const mass = Number.isFinite(s.mass) ? s.mass : 0.35;
        const tone = Number.isFinite(s.tone) ? s.tone : 0.5;
        return height * height * (1 + 0.25 * (mass - 0.35)) * (1 + 0.1 * (tone - 0.5));
    }

    // Der EINE generische Animator: Rollen auf die Compound-Children (`children[i] ↔ parts[i]`, der
    // _buildFromBlueprint-Vertrag). Absolute Werte pro Frame (Basis + Delta, kein Drift); part.rotation
    // wird einmal eingefangen und geehrt. t in Sekunden.
    _animateCompoundMotion(group, roles, t, walkPhase, moving, emotions, steerYaw) {
        // KONVERGENZ III — EIN Chokepoint: Baum-Tiere (bauTier-Gestalt) animieren
        // über den Baum-Gang; ALLE Aufrufer (Welt-Kreaturen, Peers, Verkörperung)
        // laufen hier durch — kein Parallel-Verzweigen an jedem Aufrufer.
        if (group && group.userData && group.userData._tierBaum) {
            return this._animateTierBaum(group, t, walkPhase, moving, emotions);
        }
        if (!group || !roles || !Array.isArray(group.children)) return;
        // Studio-Profil EINMAL je Aufruf (lazy, nur für schwanz/kopf); `emotions` vom Halter (Kreatur
        // ud.emotions · Spieler state.player.emotions · Peers null) durch _motionProfileName.
        // ref = Lab-idle-Profil (Delta-Null der Emotions-Offsets).
        let _mpDone = false;
        let _mp = null;
        let _mpRef = null;
        const studioProf = () => {
            if (!_mpDone) {
                _mpDone = true;
                _mp = this._motionStudioProfile(moving, emotions);
                _mpRef = _mp ? this._motionStudioProfile(false, null) : null;
            }
            return _mp;
        };
        const kids = group.children;
        let base = group.userData._motionBase;
        if (!base || base.length !== kids.length) {
            base = kids.map((c) => ({
                rx: c.rotation.x,
                ry: c.rotation.y,
                rz: c.rotation.z,
                px: c.position.x,
                py: c.position.y,
                pz: c.position.z,
            }));
            group.userData._motionBase = base;
        }
        // Rotation um den GELENK-ANKER (Bauplan-lokal): rot += θ UND pos = anchor + R(θ)·(basePos−anchor).
        // Eine-Achsen-Rotation von Hand (kein Quaternion-Alloc pro Frame).
        const applyJoint = (c, b, r, theta) => {
            const a = r.anchor;
            const ox = b.px - a.x,
                oy = b.py - a.y,
                oz = b.pz - a.z;
            const cs = Math.cos(theta),
                sn = Math.sin(theta);
            let nx = ox,
                ny = oy,
                nz = oz;
            if (r.axis === "x") {
                ny = oy * cs - oz * sn;
                nz = oy * sn + oz * cs;
                c.rotation.set(b.rx + theta, b.ry, b.rz);
            } else if (r.axis === "y") {
                nx = ox * cs + oz * sn;
                nz = -ox * sn + oz * cs;
                c.rotation.set(b.rx, b.ry + theta, b.rz);
            } else {
                nx = ox * cs - oy * sn;
                ny = ox * sn + oy * cs;
                c.rotation.set(b.rx, b.ry, b.rz + theta);
            }
            c.position.set(a.x + nx, a.y + ny, a.z + nz);
        };
        let wind = null; // der Wind am Ort des Tuchs, einmal je Aufruf
        for (let i = 0; i < roles.length && i < kids.length; i++) {
            const r = roles[i];
            if (!r) continue;
            const c = kids[i];
            const b = base[i];
            if (!c || !b) continue;
            if (r.joint) {
                // C1 — die Gelenk-Rollen (Verbindungs-Vorrang)
                if (r.role === "rad") {
                    // das Rad ROLLT: mit Fahrt ∝ walkPhase, im Idle (Architektur:
                    // Mühle/Wasserrad) eine ruhige Dauer-Drehung.
                    applyJoint(c, b, r, moving ? walkPhase * 1.6 : t * 0.7);
                    // V18.491.120 — Lab hub.rotation.y = car.steer. Roll is typically x/z; compose yaw on Y from captured base.
                    if (r.front && Number.isFinite(steerYaw) && r.axis !== "y") {
                        c.rotation.y = b.ry + steerYaw;
                    }
                } else if (r.role === "tuer") {
                    applyJoint(c, b, r, Math.sin(t * 0.7 + r.phase) * 0.12);
                } else if (r.role === "wirbel") {
                    applyJoint(c, b, r, Math.sin(t * 2.2 + r.phase) * 0.3);
                } else {
                    // scharnier: schwingt wie ein Glied — um den ECHTEN Anker
                    applyJoint(
                        c,
                        b,
                        r,
                        moving ? Math.sin(walkPhase + r.phase) * 0.4 : Math.sin(t * 1.1 + r.phase) * 0.04
                    );
                }
                continue;
            }
            if (r.role === "bein") {
                c.rotation.x = b.rx + (moving ? Math.sin(walkPhase + r.phase) * 0.45 : 0);
            } else if (r.role === "arm") {
                c.rotation.x =
                    b.rx + (moving ? Math.sin(walkPhase + r.phase) * 0.3 : Math.sin(t * 1.2) * 0.05 * r.side);
            } else if (r.role === "fluegel") {
                const flap = Math.sin(t * (moving ? 11 : 5.5) + r.phase) * (moving ? 0.65 : 0.3);
                c.rotation.z = b.rz + flap * r.side;
            } else if (r.role === "schwanz") {
                // Schwanz: tailRate/tailAmp aus dem Studio-Profil, sonst aus der synchronen Kern-Tafel (MOTION
                // joy/idle, dieselbe Brücke wie der Baum-Animator). Kern kalt → kein Wedeln.
                const mp = studioProf();
                const _tc = typeof window !== "undefined" && window.__tetrapodaCore;
                const kernRow = _tc && _tc.MOTION && (_tc.MOTION[moving ? "joy" : "idle"] || _tc.MOTION.idle);
                const tr =
                    mp && Number.isFinite(mp.tailRate)
                        ? mp.tailRate
                        : kernRow && Number.isFinite(kernRow.tailRate)
                          ? kernRow.tailRate
                          : 0;
                const ta =
                    mp && Number.isFinite(mp.tailAmp)
                        ? mp.tailAmp
                        : kernRow && Number.isFinite(kernRow.tailAmp)
                          ? kernRow.tailAmp
                          : 0;
                c.rotation.y = b.ry + Math.sin(t * tr + r.phase) * ta;
            } else if (r.role === "kopf") {
                // ABSCHIEDS-WELLE — der KOPF liest die Studio-Haltung als DELTA relativ
                // zum Lab-idle (hunt: −0.12 gesenkt/pirschend · joy: +0.04 gehoben);
                // neutral/ohne Rezept exakt byte-alt (Delta 0 bzw. mp null).
                const mp = studioProf();
                const dHead =
                    mp && _mpRef && Number.isFinite(mp.headX) && Number.isFinite(_mpRef.headX)
                        ? mp.headX - _mpRef.headX
                        : 0;
                c.rotation.x = b.rx + Math.sin(t * 1.6) * 0.05 + (moving ? 0.04 : 0) + dHead;
            } else if (r.role === "segel") {
                // C2 — das Tuch/Segel FLATTERT im EINEN Wind am Ort (`_windAt`, die Bild-Uhr): der Ausschlag wächst mit Stärke
                // und Böe (Sturm 0,14–0,23 rad, Regen ~0,05, klar ~0,01); ohne Wind hängt es still.
                if (!wind) wind = this._windAt(group.position.x, group.position.z, this._bildZeit);
                c.rotation.z = b.rz + Math.sin(t * 4.2 + r.phase + i) * 0.2 * wind.staerke * wind.boe;
            }
        }
    }

    // Compound-Tags der Kreatur via einheitlicher Pipeline. Vision §1.3 fraktal:
    // dieselbe MAX-Aggregation wie computeCompoundTags(blueprint) / computeSoulCompoundTags.
    computeCreatureCompoundTags(creature) {
        if (!creature) return {};
        const soulName = creature.userData && creature.userData.soul;
        const soul = soulName && AnazhRealm.CREATURE_SOULS[soulName];
        if (!soul) return {};
        return this.computeCompoundTags({ parts: soul.bodyParts });
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_koerper_leib]);

// ===== ATLAS · Koerper/leib — Außen-Konstanten =====
// Equip-Fold-Gewichte (wie stark Gehaltenes/Waffe/Rüstung/Werkzeug den Körper-Compound prägen) sind
// Körper-Gesetz (koerper:kampf.fold); die vier Statics unten sind nur Leser (Getter). Fail-closed.
AnazhRealm._kampfFold = function () {
    const f = AnazhRealm.Gesetz("koerper:kampf.fold", null);
    if (
        f &&
        Number.isFinite(f.held) &&
        Number.isFinite(f.weapon) &&
        Number.isFinite(f.armor) &&
        Number.isFinite(f.tool)
    )
        return f;
    return AnazhRealm._kernPflichtBruch("koerper:kampf.fold");
};
// Die Zweibeiner-Zeile des EINEN Gang-Gesetzes (fx.bewegung.gang): jedes Feld ist Pflicht — fehlt eines (der Lauf-Wechsel,
// der Hub des Laufs, das Becken), bricht der Leser, statt still die Tier-Form zu fahren (K07).
AnazhRealm.GANG_FELDER = Object.freeze([
    "schrittBasis",
    "schrittFroude",
    "tastgrad",
    "tastgradLauf",
    "laufFroude",
    "maxWinkel",
    "hub",
    "hubLauf",
    "hubForm",
    "beckenHub",
    "rollWinkel",
    "fersenAb",
    "ballen",
    "knoechel",
]);
// DER SPRUNG DER LAGE IST KEIN LAUF (tetrapoda GANG_GESETZ.vMax, EINE Regel): das Tempo eines Leibs aus der Änderung
// seiner Lage in dt — über vMax (Spawn, Teleport, Peer-Schnapp, ein Ruf an einen fernen Ort) null. Leser: der Lauf des
// Leibs (`_kreaturLaufTakt`) und der Gang der Pfoten (`_animateTierBaum`).
AnazhRealm._lageTempo = function (dx, dz, dt) {
    const v = Math.hypot(dx, dz) / dt;
    return v <= globalThis.__tetrapodaCore.GANG_GESETZ.vMax ? v : null;
};
// DIE WAHL DES GANGS — EINE für jedes Tier, ob Leib (`_animateTierBaum`) oder Satz (`_tierSatzSchritt`): das Tempo des Wegs
// geglättet (8/s, ein Takt zählt höchstens 0,1 s; ohne neue Lage `vLage` undefined bleibt es) und die Gangart des Gesetzes
// über die Hysterese der Gangart des Vor-Takts, auch des Stands (wer stand, läuft im Schritt an). `g` trägt beides (v, art);
// zurück kommt der Schritt des Gesetzes. Vorher wählte der Satz aus dem rohen Tempo und vergaß den Stand: ein Tier, das im
// Satz anlief, trabte bei Fr 0,55, wo sein Leib schreitet (gate:tier-gang: Satz − Labor 0,24–0,25 Zyklus, Tastgrad 0,53).
AnazhRealm._gangWahl = function (g, vLage, dt, laeuft, L, Z) {
    if (vLage !== undefined)
        g.v = (g.v || 0) + ((vLage || 0) - (g.v || 0)) * (1 - Math.exp(-8 * Math.max(0, Math.min(0.1, dt))));
    const gs = globalThis.__tetrapodaCore.gangSchritt(laeuft ? g.v || 0 : 0, L, Z, g.art);
    g.art = gs.art;
    return gs;
};
// Die Reichweite R der Bein-Kette (K07, EINE Schwelle — tetrapoda gangReich, dieselbe im Körper-Studio): an ihr führt
// tetrapoda gangBecken das Becken, an ihr hält die Fuß-IK den stehenden Fuß (`_gaitLegIK`, `_gaitLockBedarf`).
AnazhRealm._gaitReich = function (kette) {
    return globalThis.__tetrapodaCore.gangReich(kette);
};
// LANDUNGS-GEFÜHL (Zensus-Rest V18.488) — DER EINE LANDUNGS-LESER: Aufprall-
// Dip + Kamera-Glättung wohnen im koerperstudio-Gesetzbuch
// (fx.bewegung.landung). Fail-closed (Kern-Pflicht) über _bewegungsBlock.
AnazhRealm._landungGesetz = function () {
    return AnazhRealm._bewegungsBlock("landung", ["dipProV", "dipMax", "minTempo", "erholK", "kameraK"]);
};
// DIE MASSE KOMMT AUS DER GESTALT UND DER STOFF-ZEILE (0710-4, physik K1): der Wirt hält keine Dichte. Das Tier ist Fleisch,
// der Mensch Leib, der Wagen Blech — ρ aus der EINEN Stoff-Zeile, deren Zeilen die Gesetzbücher tragen (tetrapoda MASSSTAB ·
// koerper LEIB · vehicle FAHR.huelleDichte), das Volumen ist ihre Gestalt (`_leibVolumen`: die Haut des Tiers, der Leib des
// Menschen aus dem Ofen; carPhys des Wagens). Bis 0710-4 hielt STOSS zwei Studio-Größen
// (dichteLeib 1000 über eine Kapsel aus der Hüft-Höhe — der Hirsch wog 436 kg, der Bär 255 —, dichteWagen 150).
AnazhRealm.LEIB_KLASSEN = Object.freeze(["fell", "haut"]); // die Material-Klassen der geschlossenen Haut eines Leibs
// DIE TON-TAFEL (mensch.K4, `_tonTafel`): so viele Paletten trägt sie — je Siedlung eine je Gestalt und je Kopf (die Metropole
// am Messort stadt-voll 1 094 Köpfe), Zeile 0 die Eins; die Tafel lädt je Siedlung einmal
AnazhRealm.TON_TAFEL = Object.freeze({ zeilen: 4096 });
// Das Volumen einer GESCHLOSSENEN Fläche (m³ im Rahmen ihrer Geometrie) über den Divergenz-Satz, Σ a · (b × c) / 6 je
// Dreieck — und ob sie geschlossen ist (jede Kante gerade oft: die glatte Vereinigung der Haut teilt manche Kante mit vier
// Dreiecken, dicht ist sie trotzdem). Eine offene Fläche (Mähne, Strähnen) hat kein Volumen.
AnazhRealm._geschlossenesVolumen = function (geo) {
    const pos = geo && geo.attributes && geo.attributes.position;
    if (!pos) return { v: 0, geschlossen: false };
    const p = pos.array;
    const ix = geo.index ? geo.index.array : null;
    const n = ix ? ix.length : pos.count;
    const N = pos.count;
    const kanten = new Map();
    let v = 0;
    for (let t = 0; t + 2 < n; t += 3) {
        const a = ix ? ix[t] : t;
        const b = ix ? ix[t + 1] : t + 1;
        const c = ix ? ix[t + 2] : t + 2;
        const ax = p[3 * a];
        const ay = p[3 * a + 1];
        const az = p[3 * a + 2];
        const bx = p[3 * b];
        const by = p[3 * b + 1];
        const bz = p[3 * b + 2];
        const cx = p[3 * c];
        const cy = p[3 * c + 1];
        const cz = p[3 * c + 2];
        v += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6;
        for (let k = 0; k < 3; k++) {
            const u = k === 0 ? a : k === 1 ? b : c;
            const w = k === 0 ? b : k === 1 ? c : a;
            const key = u < w ? u * N + w : w * N + u;
            kanten.set(key, (kanten.get(key) || 0) + 1);
        }
    }
    let geschlossen = kanten.size > 0;
    for (const z of kanten.values())
        if (z % 2) {
            geschlossen = false;
            break;
        }
    return { v: Math.abs(v), geschlossen };
};
// DAS VOLUMEN EINER GESTALT (m³ im Rahmen `rahmen`): der Leib, den der Ofen maß (`__leibV`, der Mensch), sonst die
// geschlossene Haut (LEIB_KLASSEN) unter `teil` — die Nah-Gestalt,
// nie die Fern-Gestalt daneben. Offene Teile und der Schalen-Stapel des Fells (`fellSchale`: N Kopien der Haut) tragen
// keine Masse. Je Geometrie gemerkt (jede Kreatur teilt die Geometrien ihrer Vorlage). Gemessen bei Größe 1: Fuchs 0,015 ·
// Wolf 0,064 · Hirsch 0,094 · Bär 0,335 · Mensch 0,090 m³ (Spieler).
AnazhRealm._leibVolumen = function (teil, rahmen) {
    if (!teil || typeof THREE === "undefined") return 0;
    const memo = AnazhRealm._leibVolumenMemo || (AnazhRealm._leibVolumenMemo = new WeakMap());
    const r = rahmen || teil;
    r.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(r.matrixWorld).invert();
    const m = new THREE.Matrix4();
    // DAS GEMESSENE VOLUMEN DES OFENS (1310-15, physik K1): der Mensch-Guss misst seinen Leib selbst — die Vereinigung aller
    // Teile unter der Haut, Kopf und Hände eingeschlossen — und hängt die Zahl ans Gelenk der Hülle (`__leibV`, Einheiten³):
    // sie ist der GANZE Leib, keine Haut zählt daneben. Bis physik K1 maß der Ofen die Haut-Hülle und der Wirt Kopf und Hände
    // dazu (A4) — der Spieler wog 117,3 kg.
    let v = 0;
    teil.traverse((o) => {
        if (!(o.userData && o.userData.__leibV > 0)) return;
        m.multiplyMatrices(inv, o.matrixWorld);
        v += o.userData.__leibV * Math.abs(m.determinant());
    });
    if (v > 0) return v;
    teil.traverse((o) => {
        if (!o.isMesh || !o.geometry) return;
        const kl = o.material && o.material.userData ? o.material.userData.foundryKind : null;
        if (!AnazhRealm.LEIB_KLASSEN.includes(kl)) return;
        let g = memo.get(o.geometry);
        if (!g) {
            g = AnazhRealm._geschlossenesVolumen(o.geometry);
            memo.set(o.geometry, g);
        }
        if (!g.geschlossen) return;
        m.multiplyMatrices(inv, o.matrixWorld);
        v += g.v * Math.abs(m.determinant());
    });
    return v;
};

// MOTION_ROLE_SIGNATURES — die BEWEGUNGS-Rolle eines PARTS emergiert als argmax-Resonanz seines
// Feature-Vektors gegen diese frozen Signaturen (wie die WERK-Rolle, `computeBlueprintRole`) — kein
// Typ-Whitelist, kein Per-Wesen-Hardcode; Konjunktionen als 0/1-Achse, die Disjunktion im argmax.
// Achsen: elongV/elongH · flat · lowAnchor · topMount · sideMount · rearMount · roundish · central ·
// paired. Konsument: `computeMotionRoles` → `_animateCompoundMotion` (Kreaturen, Custom-Avatare und
// Peer-Seelen teilen EINE Bewegungs-Sprache).
// Kreatur-Seelen (CREATURE_SOULS, unten) sind Hylomorphismus-Compounds wie Spieler-Seelen und
// Baupläne: bodyParts → _buildFromBlueprint, Tags → computeCompoundTags.
AnazhRealm.MOTION_ROLE_SIGNATURES = Object.freeze({
    bein: Object.freeze({ lowAnchor: 1.0, paired: 0.6, elongV: 0.7, flat: -0.4, topMount: -0.8, central: -0.6 }),
    arm: Object.freeze({ sideMount: 0.8, elongV: 0.8, paired: 0.5, flat: -0.6, lowAnchor: -0.6 }),
    fluegel: Object.freeze({ sideMount: 0.7, flat: 1.0, paired: 0.4, lowAnchor: -0.7, central: -0.3 }),
    schwanz: Object.freeze({ rearMount: 1.0, elongH: 0.7, paired: -0.6, central: -0.4 }),
    kopf: Object.freeze({ topMount: 0.9, roundish: 0.6, paired: -0.7, elongH: -0.4, lowAnchor: -0.5 }),
    // C2 (gigant-plan §5 — G1-B): SEGEL/TUCH — flach · hoch montiert · un-gepaart
    // → flattert im Wind (Mühlen-Flügel, Banner). Konsument: das Architektur-Idle
    // (nur segel/rad/tuer/wirbel — Hütten wackeln NIE).
    segel: Object.freeze({ flat: 1.0, topMount: 0.7, paired: -0.3, lowAnchor: -0.8, roundish: -0.4 }),
});
// Unter diesem argmax-Score bewegt sich ein Part NICHT (Torso/Deko bleiben ruhig).
AnazhRealm.MOTION_ROLE_FLOOR = 0.55;
// Das Reittier ist ein PFERD: Host-Archetyp `horse` (CREATURE_ARCHETYPES), dasselbe Skelett-Gesetz.
// Shapes×Materialien unverändert → Tags wert-gleich (die labs-Gate-X-Münze wacht). kern =
// Kantenlänge des belebenden Quarz-Oktaeders (magieleitung = Antrieb, `_isMoveable`).
AnazhRealm.REITTIER_SKELETON_G = Object.freeze({
    holzross: Object.freeze({
        size: 1.6,
        archetypeName: "horse",
        bodyMat: "holz",
        limbMat: "holz",
        headMat: "holz",
        shapes: Object.freeze({ torso: "box", limb: "limb", head: "box", snout: "limb", tail: "limb" }),
        bodyBarrel: true,
        kern: 0.22,
    }),
});
// Welches tetrapoda-Rezept den Host-Bewegungs-Charakter führt (`_motionStudioProfile` liest
// f.recipes[..].fx.motion live) + die Zustands→Profil-Zuordnung (Host moving/idle ↔ Lab joy/idle —
// eine Tabelle, kein if).
AnazhRealm.MOTION_HOST_RECIPE = "wolf";
// ABSCHIEDS-WELLE (Motion-Vollendung) — welches koerper-Rezept den Avatar-Gestalt-
// und Bewegungs-Charakter führt (`_koerperStudioDials`/`_koerperMotionProfile`
// lesen f.recipes[..].s bzw. fx.motion LIVE — das KLANG_HOST_RECIPE-Muster).
AnazhRealm.KOERPER_HOST_RECIPE = "mensch";
// Zustands→Profil-Tabelle je Lab-Spalte: kreatur (tetrapoda) moving→joy · idle→idle; koerper
// (Da Vinci) moving→run · idle→idle.
AnazhRealm.MOTION_PROFILE_MAP = Object.freeze({
    kreatur: Object.freeze({ moving: "joy", idle: "idle" }),
    koerper: Object.freeze({ moving: "run", idle: "idle" }),
});
// Zustand→Profil-Vorrang: der echte Körper-Zustand (updateCreatures stempelt ud._motionZustand:
// schwimmen · jagd · flucht) schlägt in `_motionProfileName` die Emotions-Achse — ein jagendes Wesen
// pirscht ("hunt"), ein schwimmendes paddelt. Kein Zustand → Emotions-Wahl.
AnazhRealm.MOTION_ZUSTAND_PROFILES = Object.freeze({
    schwimmen: Object.freeze({ kreatur: "schwimmen" }),
    jagd: Object.freeze({ kreatur: "hunt" }),
    // die HETZE trägt die Haltung der Flucht (Welle LF: der Sprint der Gestalt; die Gangart wählt sein Tempo, GANG_FOLGE)
    hetzen: Object.freeze({ kreatur: "flee" }),
    flucht: Object.freeze({ kreatur: "flee" }),
    // koerper-Zustand kampf: frischer Schwung/Schuss (_koerperKampfZustand) wählt das Lab-Profil "fight"
    // (Garde-Haltung); "angry" lebt über MOTION_EMOTION_PROFILES. Lab-only bleiben "showcase" (kein
    // Welt-Verb) und "slide" (die Welt-Rutsch-Pose ist parkour.slidePose, Schicht nach dem Rig).
    kampf: Object.freeze({ koerper: "fight" }),
});
// Wie lange die Kampf-HALTUNG nach dem letzten Angriff steht (s) — der Körper
// bleibt in Garde, dann löst sich die Spannung (Wirts-Gefühls-Regler).
AnazhRealm.KAMPF_HALTUNG_SEC = 3;
// DIE EINE EMOTIONS→PROFIL-BRÜCKE (Daten, kein if-Baum): Zeilen in VORRANG-Reihenfolge; die erste
// Achse (EMOTION_AXES; Kreaturen tragen dieselben, Furcht = sorrow+chaos) über ihrer Schwelle wählt
// das Profil je Spalte, sonst die MOTION_PROFILE_MAP-Default-Zeile. Beide Leser (Rig
// `_animateHumanoidRig` via `_koerperMotionProfile`, Compound `_animateCompoundMotion` via
// `_motionStudioProfile`) lesen sie über den EINEN Resolver `_motionProfileName`.
AnazhRealm.MOTION_EMOTION_PROFILES = Object.freeze([
    // Zorn-Achse: Bedrohung speist sorrow+chaos, der eigene Angriff nur chaos — eine aufgewühlte Seele
    // ohne sorrow steht zornig (angry), nicht ängstlich. `unter` = optionale Gegen-Achsen-Wand der Zeile
    // (greift nur, wenn die benannte Achse UNTER max bleibt); ohne kreatur-Spalte bleibt die
    // Kreatur-Wahl bei der chaos-Zeile darunter (alert/flee).
    Object.freeze({
        axis: "chaos",
        min: 0.5,
        unter: Object.freeze({ axis: "sorrow", max: 0.3 }),
        koerper: Object.freeze({ idle: "angry", moving: "run" }),
    }),
    Object.freeze({
        axis: "chaos", // Furcht/Erregung (Phase E: threatened → sorrow+chaos)
        min: 0.5,
        koerper: Object.freeze({ idle: "fear", moving: "run" }),
        kreatur: Object.freeze({ idle: "alert", moving: "flee" }),
    }),
    Object.freeze({
        axis: "sorrow",
        min: 0.5,
        koerper: Object.freeze({ idle: "sad", moving: "pwalk" }),
        kreatur: Object.freeze({ idle: "idle", moving: "idle" }),
    }),
    Object.freeze({
        axis: "joy",
        min: 0.5,
        koerper: Object.freeze({ idle: "joy", moving: "run" }),
        kreatur: Object.freeze({ idle: "joy", moving: "joy" }),
    }),
]);
// Profil→Rig-Zuordnung als Daten: welches koerper-fx.motion-Feld welches Rig-Bone um welche Achse
// verschiebt (mul = Vorzeichen-Brücke Lab↔Host: Lab armL + hebt, Host-L-Schulter-z ist die
// Adduktions-Achse, R gespiegelt). Angewandt als DELTA zum Lab-idle (`p[key] − ref[key]`) → Idle ist
// per Konstruktion neutral; breath/freq normalisieren auf das Lab-idle (0.042/1.25), der Host-Atem
// (0.02 · 1.6 rad/s) bleibt am Neutralpunkt.
AnazhRealm.MOTION_RIG_MAP = Object.freeze([
    Object.freeze({ key: "headX", bone: "head", axis: "x", mul: 1 }),
    Object.freeze({ key: "headY", bone: "head", axis: "y", mul: 1 }),
    Object.freeze({ key: "headZ", bone: "head", axis: "z", mul: 1 }),
    Object.freeze({ key: "spineX", bone: "spine", axis: "x", mul: 1 }),
    Object.freeze({ key: "spineY", bone: "spine", axis: "y", mul: 1 }),
    Object.freeze({ key: "spineZ", bone: "spine", axis: "z", mul: 1 }),
    Object.freeze({ key: "armL", bone: "armL.shoulder", axis: "z", mul: 1 }),
    Object.freeze({ key: "armR", bone: "armR.shoulder", axis: "z", mul: -1 }),
    Object.freeze({ key: "armLX", bone: "armL.shoulder", axis: "x", mul: 1 }),
    Object.freeze({ key: "armRX", bone: "armR.shoulder", axis: "x", mul: 1 }),
    Object.freeze({ key: "elbowL", bone: "armL.elbow", axis: "x", mul: -1 }),
    Object.freeze({ key: "elbowR", bone: "armR.elbow", axis: "x", mul: -1 }),
    Object.freeze({ key: "hipLX", bone: "legL.hip", axis: "x", mul: 1 }),
    Object.freeze({ key: "hipRX", bone: "legR.hip", axis: "x", mul: 1 }),
    Object.freeze({ key: "hipLZ", bone: "legL.hip", axis: "z", mul: 1 }),
    Object.freeze({ key: "hipRZ", bone: "legR.hip", axis: "z", mul: 1 }),
    Object.freeze({ key: "kneeL", bone: "legL.knee", axis: "x", mul: 1 }),
    Object.freeze({ key: "kneeR", bone: "legR.knee", axis: "x", mul: 1 }),
]);
// Dial↔Genom-Zuordnung (axis = base + mul·dial): height→kh · mass→build · tone→muscle · gender→sex.
// Der Körper baut direkt aus koerper-core.bauMensch(dials); die Tabelle dient nur der
// Genom→Dial-Brücke (`_dialsAusGenom`, Peers/NPCs, invertiert je Zeile) und den Stat-Konsumenten
// (`_koerperDials`). Die EINE Quelle ist koerper-core.DIAL_MAP, gelesen durch den Gesetz-Strom fail-closed (K2: kein
// leerer Ersatz, der still ohne Dials baut).
Object.defineProperty(AnazhRealm, "KOERPER_DIAL_MAP", {
    get() {
        return AnazhRealm.Gesetz("koerper:DIAL_MAP") || AnazhRealm._kernPflichtBruch("koerper:DIAL_MAP");
    },
});
// Welche CREATURE_SOULS-Gestalt welches tetrapoda-Rezept liest: wesen = Hirsch (deer), die
// Gattungs-Tiere ihre eigene (wolf/fox/bear). Die Dials überschreiben NUR die vier Zahl-Achsen
// (TETRAPODA_DIAL_MAP); Shapes+Materialien bleiben → Tags byte-gleich. sprite/geist bleiben bewusst
// draußen: skelettlose 2-Part-Minimalformen, kein Vierbeiner.
AnazhRealm.TETRAPODA_SOUL_MAP = Object.freeze({
    wesen: "deer",
    wolf: "wolf",
    fuchs: "fox",
    baer: "bear",
});
// TETRAPODA_DIAL_MAP — Dial→Archetyp-Zuordnung (axis = base + mul·dial, auf das deer-Paar geeicht:
// bei Lab-Startwerten fallen die Archetyp-Werte fast byte-gleich): neck→neckFrac · leg→legFrac
// (Einheiten-Brücke) · build→torsoW · diet→eyeFront (Carnivor frontal, Herbivor lateral).
// Bewusst unmapped: size (die Welt-Größe trägt `_creatureBodySize`, g.size ist stats-tragend).
// Die EINE Quelle ist tetrapoda-core.DIAL_MAP (Gesetz-Strom, fail-closed wie KOERPER_DIAL_MAP).
Object.defineProperty(AnazhRealm, "TETRAPODA_DIAL_MAP", {
    get() {
        return AnazhRealm.Gesetz("tetrapoda:DIAL_MAP") || AnazhRealm._kernPflichtBruch("tetrapoda:DIAL_MAP");
    },
});
// DER DECKEL DES GANGS (rad, ~34°): so weit nickt und wankt ein gehender Leib höchstens — steiler ist Kletterwand, kein Gang.
// Leser: `_slopePitch` (Mensch und Tier), der Wank der Tier-Proben, die Kletterwand des Tier-Schritts (`_kreaturKletterwand`).
AnazhRealm.GANG_DECKEL_RAD = 0.6;
// DER STAND-LESER DER SICHT (`_standSicht`): die Boden-Karte (das gezeichnete Mesh) zählt nur, solange sie in diesem Band um
// den Träger des Körpers liegt — Mesh gegen Gesetz misst ±0,3 m (Hang-Fuß bis 0,63 m, an Kanten bis 1 m); über einer
// Höhle liegt die Karte um Höhlen-Höhe (≥ 2,4 m) plus Decke darüber, sie trägt dort die Oberkante der Säule, nie den Boden
// unter dem Körper.
AnazhRealm.STAND_SICHT_BAND = 2.0;
AnazhRealm.SOHLE_PUNKT = Object.freeze([0]); // die Sohle ohne gebauten Fuß: die Stelle unter dem Knöchel (`_gaitProbe`)
// Die Kopf-Einheit des Avatars (m): 8 Einheiten = die Welt-Körperhöhe ~1,7 m (bauMensch, Wasserlinie, Studio-Maßstab).
AnazhRealm.PLAYER_KH = 0.2125;
