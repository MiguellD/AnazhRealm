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
            // DAS GESICHT (mensch.K4): die Achsen des Gesichts-Gesetzes (koerper GESICHT_GENOM) — die Größe des Auges, die Breite
            // des Munds, die Höhe der Brauen, der Haar-Ansatz; der Kern rechnet ihre Bereiche, die Dials tragen sie in den Guss
            auge: g.axis("auge"),
            mund: g.axis("mund"),
            braue: g.axis("braue"),
            haaransatz: g.axis("haaransatz"),
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
        if (
            !core ||
            typeof core.bauMensch !== "function" ||
            typeof core.morphAuf !== "function" ||
            typeof core.leibRig !== "function"
        ) {
            this.log(
                "KÖRPER-KERN KALT: koerper-core.bauMensch/leibRig fehlt — ohne Gesetzbuch kein Mensch (fail-closed).",
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
        // (K60-2: 2,4 s); die feine tauscht der Leerlauf ein (`_leibFeinTausch` im Vorbau)
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
        wrap.position.y = oy - f * AnazhRealm._ofenSohleY(t0);
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
        // DAS RIG IST DAS DES KERNS (koerper `leibRig`, w28-mensch-samen): die EINE Zuordnung der Gelenke samt der Ruhe der Arme —
        // die Knochen des Klons stehen hier in der Bind-Pose des Gusses (`_armRuhe`: der Arm hängt am Rumpf); die neutrale Pose
        // stellt sie (`leibRigNeutral`). Bis hier trug der Wirt die Zuordnung selbst und stellte jede Schulter auf 0.
        const rig = Object.assign(core.leibRig(teile), {
            // kh in BAUM-Einheiten: der Animator schreibt ·kh-Welt-Beträge auf Knoten
            // UNTER wrap(·f) — kh/f hält die Amplituden welt-gleich.
            kh: kh / f,
            _baum: true,
            _morphDials: dials,
            // Die Hand-Mitte je Handgelenk (Ofen-Beipack, Hand-Raum): dort sitzt der Griff der Faust (_refreshHeldMesh).
            // Eigenes Feld, nie in armL/armR — deren Glieder setzt die Pose je Schlüssel auf neutral.
            handMitte: t0.handMitte || null,
            _skinMat: null, // GEFALLEN mit dem Inline-Bau — die Farb-Wahrheit ist userData.hautTon (Pipe: Vertex-Farben)
        });
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

    // DIE SOHLE EINER VORLAGE (Gelände H5): die tiefste Fläche ihrer Teile in der Ruhe-Pose (Rahmen der Vorlage), einmal gemessen —
    // der Leib (`_buildHumanoidRig`) und die Knochen der Vorlage der Menge (`_bewohnerRaumPose`) setzen sie auf die Sohle der Kapsel
    static _ofenSohleY(t) {
        if (Number.isFinite(t.sohleY)) return t.sohleY;
        const box = new THREE.Box3();
        const b = new THREE.Box3();
        t.root.updateMatrixWorld(true);
        t.root.traverse((n) => {
            if (!n.isMesh || !n.geometry || !n.geometry.attributes.position) return;
            if (!n.geometry.boundingBox) n.geometry.computeBoundingBox();
            box.union(b.copy(n.geometry.boundingBox).applyMatrix4(n.matrixWorld));
        });
        return (t.sohleY = Number.isFinite(box.min.y) ? box.min.y : 0);
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

    // DIE LEIBER IM VORBAU (Lehre 14, der letzte Schritt von `_vorbauBedienung`): der erste Wechsel in eine Seele, deren Leib
    // die Welt nie zeichnete, baute seine Programme im Spiel-Pfad (GTX, Frost-Wand S2: +5 Module / +4 Pipelines — die Radeon
    // hatte Wölfe schon gezeichnet). Liegt der Ofen-Vorrat (`_ofenVorratSteht`: jede Gattung warm im Memo, der Leib ein Klon
    // ohne Guss), geht je Seele, die der Spieler annehmen kann (jede Tetrapoda-Art und der Mensch), EIN Leib aus der EINEN
    // Leib-Wahl als Gast des Vorbaus in ihre Szene — auf Maßstab 0 — und baut über DIE Erst-Zeichnung ohne Draw. Steht jedes
    // Teil in jedem seiner Pässe (`_vorbauFehlt`), geht er und der nächste kommt; `state._leibWarm` ist das Ereignis. true:
    // jeder Leib steht.
    // DIE EIGENE SEELE ZUERST (w27-takt-gc-2, das Nächste zuerst wie der ganze Planer): ihr Leib ist, was die nächste Eingabe
    // zeigt (Third, der Blick auf sich) — bis hier stand der Mensch am Ende hinter jeder Tier-Art, und sein Leib baute seine
    // sieben Programme der Welt erst, als die Tiere standen (dorf Ego, GTX 1050 eab8e8b3: 50,5–52,3 s nach der Ankunft, die
    // Ich-Bühne hatte dieselben Stoffe für ihr eigenes Ziel schon bei 9 s gebaut); jetzt baut er gleich nach ihr.
    _leibVorwaermen() {
        const st = this.state;
        if (st._leibWarm) return true;
        if (!st._leibVorwaermung) {
            if (!this._ofenVorratSteht) return false;
            const offen = [...Object.keys(AnazhRealm.TETRAPODA_SOUL_MAP).map((a) => "bp_koerper_" + a), "human"];
            const eigen = offen.indexOf((st.player && st.player.soul) || "human");
            if (eigen > 0) offen.unshift(...offen.splice(eigen, 1));
            st._leibVorwaermung = {
                offen,
                leib: null,
                takte: 0,
            };
        }
        const V = st._leibVorwaermung;
        if (V.leib) {
            const fehlt = this._vorbauFehlt(V.leib);
            // ein Leib, der in VORBAU_TAKTE Takten nicht ganz steht, ist ein Bruch der Erst-Zeichnung — laut, der nächste kommt
            if (fehlt && ++V.takte < AnazhRealm.VORBAU_TAKTE) return false;
            if (fehlt)
                this._bruchMelden(
                    `LEIB-VORWÄRMEN: ${V.leib.name} steht nach ${V.takte} Takten nicht ganz (${fehlt} Teile)`
                );
            st.scene.remove(V.leib);
            this._disposeSoulGroup(V.leib);
            V.leib = null;
        }
        if (!this._ofenVorratSteht) return false;
        const name = V.offen.shift();
        if (!name) {
            st._leibWarm = true;
            st._leibVorwaermung = null;
            return true;
        }
        // die Seele einer Art entsteht beim ersten Wechsel aus ihrem Bauplan (`applyPlayerSoulFromBlueprint`): dieselben Teile
        const bp = this.state.blueprints && this.state.blueprints[name.slice(3)];
        const leib = this._leibDerSeele(
            name,
            this._getSoulDef(name) || (bp && { bodyParts: bp.parts }),
            "vorwaermen:" + name
        );
        if (!leib) {
            this._bruchMelden(`LEIB-VORWÄRMEN: kein Leib für „${name}"`);
            return false;
        }
        // er baut ohne Draw, höchstens einen Bau je Bild, nie mitten in der Eingabe — als Gast ohne Raum (`_vorbauGast`)
        Object.assign(V, { leib: this._vorbauGast(leib, "vorwaermen:" + name), takte: 0 });
        return false;
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
        // DAS TUCH IN DER RUHE (haar.K4): hier kommen die Stufen zusammen — der EINE weiche Löser legt das Tuch beider über die
        // Haut beider (`tuchDrapieren`), EINMAL je Vorlage (die Geometrie ist geteilt; jeder Klon trägt das Drapierte)
        if (kind !== "kreatur") this._tuchVorlageDrapieren(klon, fern);
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
            art: kind,
            abM: s1.ab,
            hyst: z0.hyst,
            zwilling: z0.zeile.schatten === 1,
            istFern: true,
            // die Haltung steht fest (der Fall setzt sie, `_kreaturFaellt`): der Wechsel nach fern stellt nie in die Ruhe
            haltungFest: false,
            ruhe,
            wahl: AnazhRealm._wahlGedaechtnis(), // das Gedächtnis der Wahl am Auge (`_gelenkStufe`)
        };
    }

    // DER EINE STUFEN-SCHALTER der Gelenk-Gestalt (Tier, Mensch, Peer, Werkstatt): jenseits ihrer Grenze aus dem Stufen-Gesetz
    // (`_gelenkGrenzen`: der Haushalt `ab` ihrer Kern-Zeile × Größe) trägt die Grobstufe das Bild, diesseits die feine — und die
    // Grobstufe wirft als ihr Zwilling auf SHADOW_TWIN_LAYER (die Haupt-Kamera sieht sie nie, die Kaskaden immer). Die EINE Wahl
    // mit Gedächtnis (`_stufeGemerkt`, Hysterese ±`hyst`) am Abstand des Leibs (`wo`, sonst seine Lage) vom Auge der Stufen
    // `auge` (`_lodAuge`, EINMAL je Takt beim Rufer, wie der Schirm `zeilen`; eine Zahl ist ein erzwungener Abstand², der Bau 0,
    // die Werkstatt ∞ — er wählt ohne Gedächtnis) — steht das Auge und rührt sich der Leib nicht, rechnet sie nichts;
    // geschaltet werden nur `visible` und die Ebenen, nur beim Wechsel. Jenseits ruht jeder Gang
    // (updateCreatures, der Peer-Tick, die Sicht-Kopie) außer dem eines laufenden Tiers (`_kreaturLaeuft`, Welle LF) —
    // der Wechsel nach fern stellt die Gestalt in ihre Ruhe (`_gelenkRuhe`), denn beide Stufen tragen dieselben Knochen;
    // eine Gestalt mit fester Haltung (`haltungFest`: der Gefallene, Welle LF kampf) bleibt in ihr. Rückgabe: fern?
    _gelenkStufe(gruppe, auge, wo = gruppe.position, zeilen) {
        const g = gruppe.userData._gelenk;
        const s = gruppe.scale.x || 1;
        const G = this._gelenkGrenzen(g, zeilen);
        const cur = g.istFern ? 1 : 0;
        const m = g.wahl || (g.wahl = AnazhRealm._wahlGedaechtnis());
        const st =
            typeof auge === "number"
                ? AnazhRealm._stufeNachGrenzen(Math.sqrt(auge), cur, G, s)
                : AnazhRealm._stufeGemerkt(m, cur, G, s, wo, auge);
        const fern = st === 1;
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

    // Das Tuch einer Vorlage über die Haut: JEDE STUFE ÜBER IHRER HAUT (die feine zeichnet nah, die grobe fern — keine zeichnet
    // über der Haut der anderen): die Ruhe-Lage des Tuchs ist frei von der Haut (die Achsel, die Hand an der Hüfte, der Kragen) —
    // und damit das Ziel jedes Takts (`_tuchTakt`). Bis w11-koerper prüfte jede Stufe gegen die Haut beider: am Hals lag die grobe
    // Haut innen, die feine außen, und der Kragen der feinen blieb 22–24 mm in ihrem Hals stecken. Meter je Einheit der Bindung:
    // der Maßstab des Leibs (koerper `leibMassstab`).
    _tuchVorlageDrapieren(...stufen) {
        const KC = globalThis.__koerperCore;
        for (const w of stufen) {
            const tuch = [];
            const haut = [];
            w.traverse((n) => {
                if (!n.isSkinnedMesh) return;
                if (n.userData.__seh === "stoff") tuch.push(n);
                else if (n.userData.__seh === "haut" && n.userData.__klasse === "haut") haut.push(n);
            });
            if (!tuch.length || !haut.length || tuch[0].geometry.userData.__tuchDrapiert) continue;
            w.updateMatrixWorld(true);
            if (KC.tuchDrapieren(tuch, haut, KC.leibMassstab()) > 0)
                for (const m of tuch) m.geometry.computeVertexNormals();
            for (const m of tuch) m.geometry.userData.__tuchDrapiert = true;
        }
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
    // POSEN-BLEND und ZWEI-KNOCHEN-IK: das Gesetz des EINEN Gang-Takts im Kern (koerper-core `leibGangBlend` · `leibZweiKnochen`,
    // w4-koerper-park — dieselben Funktionen trägt das Körper-Studio); die Wirts-Namen bleiben die Leser der Tiere und der Fuß-IK.
    _gaitBlendStep(wPrev, speed, dt) {
        return AnazhRealm._leibTakt().leibGangBlend(wPrev, speed, dt);
    }
    _twoBoneIK(l1, l2, vor, unten) {
        return AnazhRealm._leibTakt().leibZweiKnochen(l1, l2, vor, unten);
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
        // DER EINE GANG-TAKT (koerper-core `leibGangTakt`, w4-koerper-park — dasselbe Gesetz im Körper-Studio): DER STEHENDE FUSS
        // HÄLT (K07, tetrapoda `gangPhaseHaelt`: ändert sich die Zeile, behält das stehende Bein sein Fuß-Ziel; aus dem Stand
        // setzt das nähere Bein in der Mitte seines Stands ein), die Phase wächst mit dem Takt, das Blend-Gewicht glättet, die
        // Amplitude folgt dem Tempo gegen das Geh-Tempo der Seele. ZWILLINGS-ABSCHIED (19.07.): der „|| 6"-Nebenzwilling fiel —
        // der Falsy-Arm (nur vor der Boot-Eichung erreichbar) liest die Eichungs-Wahrheit selbst (fail-closed via _bewegungsKoeff).
        const vRef = Math.max(
            1,
            Number(this.state.speed) ||
                AnazhRealm._bewegungsKoeff("speed").base + AnazhRealm._bewegungsKoeff("speed").leicht
        );
        const g = AnazhRealm._leibTakt().leibGangTakt(
            window.__tetrapodaCore,
            halter,
            gs,
            v,
            d,
            emoF,
            vRef,
            this._gaitBeinMass(rig).L
        );
        g.ik = opts && opts.ik ? this._gaitIKPrep(mesh, opts.soleY, opts.yaw, d) : null;
        // der Stoß-Zustand des Leibs (physik.K5) reist mit dem Gang des lokalen Avatars zur Pose (der Ausfallschritt)
        g.stossLeib = opts && opts.ik ? this.state : null;
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
    // Über einem gefrorenen Spiegel (`_eisAt`, stoffe.K3) sieht das Auge das Eis, nie den Grund unter ihm. In der Schnee-Decke
    // (wetter.K4) steht der Fuß um ihren Tritt unter der gezeichneten Fläche (`_schneeTrittAt`), wie der Leib (`_koerperGrund`).
    _standSicht(x, z, traegerY, struktur) {
        if (struktur === true) return traegerY;
        const band = AnazhRealm.STAND_SICHT_BAND;
        const karte = this._bodenSichtAt(x, z);
        const eis = this._eisAt(x, z, traegerY + band, 2 * band, karte);
        const k =
            eis !== null && !(karte >= eis) ? eis : karte === null ? karte : karte - this._schneeTrittAt(x, karte, z);
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
    // Fuß-IK-Kontext, einmal vermessen — aus der RUHE, nie aus der Pose des Bilds: die Kette liest die EINE Vermessung des
    // Beins (`_gaitBeinMass`, am frischen Rig vor jeder Pose: Gelenk-Längen × die Skala der Hüfte lotrecht und längs), der
    // Knöchel über der Sohle und die Sohle die EINE Messung des gebauten Fußes (koerper `leibSohle`, im Knöchel-Raum der
    // Bind-Pose; ohne gebauten Fuß die Zeile des Gangs, dieselbe, die die Pose liest), beide mit der Skala des Knöchels in der
    // Ruhe (Hüfte × Knie × Knöchel). Vorher maß der erste Stand den Knöchel der Pose des letzten Bilds über der Kapsel: nach
    // dem Spawn-Fall stand er in der Luft-Pose (`leibLuftPose`, w4-koerper-park: die Knie gebeugt) 16,1 statt 8,8 cm hoch,
    // die Sohlen schwebten 9 cm (gate:koerper-stand K8) und 17 cm (gate:fall-waechter B), in der Kontrapost-Ruhe 0,7 cm.
    // Fehlende Gelenke / ungebauter Chunk → null (kein IK diesen Frame). `dt` die Zeit der Anzeige-Uhr seit dem letzten Takt
    // (die Glättung der Hang-Lehne geht mit ihr, nie mit dem Bild).
    _gaitIKPrep(mesh, soleY, yaw, dt = 0) {
        const r = mesh && mesh.userData && mesh.userData.rig;
        if (!r || !Number.isFinite(soleY)) return null;
        const L = r.legL;
        const R = r.legR;
        if (!L || !R || !L.hip || !L.knee || !L.ankle || !R.hip || !R.knee || !R.ankle || !r.hips) return null;
        let ik = mesh.userData._gaitIK;
        if (!ik) {
            const M = this._gaitBeinMass(r);
            const wpl = M.wpl;
            const wz = M.wz;
            const l1 = M.l1 * wpl;
            const l2 = M.l2 * wpl;
            if (!(l1 > 0.02) || !(l2 > 0.02)) return null;
            r._sohle = AnazhRealm._leibTakt().leibSohle(mesh, L.ankle);
            const sy = wpl * L.knee.scale.y * L.ankle.scale.y;
            const sz = wz * L.knee.scale.z * L.ankle.scale.z;
            const tief = r._sohle ? r._sohle[1] : this._gangZeile(true).knoechel * AnazhRealm._gaitReich(M.l1 + M.l2);
            const soleH = tief * sy;
            const sohle = r._sohle
                ? [-1, -0.5, 0, 1 / 3, 2 / 3, 1].map((f) => sz * (f < 0 ? -f * r._sohle[2] : f * r._sohle[0]))
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
        // Achse tragen die Steigung (exp-geglättet; Füße beisammen → 0). Die Glättung ist eine Funktion der Anzeige-Uhr
        // (0,12 je 60-Hz-Takt, Lehre 13): bis hierher rückte jeder Ruf 12 % — die Lehne hing an der Bildrate, und bei stehender
        // Uhr (dt 0, Hit-Stop) rückte sie weiter; nach dem Ausfall eines Schwungs trug die Pose so ihren Rest (gate:kampf-gefuehl E).
        const sep = (ik.footL.x - ik.footR.x) * Math.sin(ik.yaw) + (ik.footL.z - ik.footR.z) * Math.cos(ik.yaw);
        let ziel = 0;
        if (Math.abs(sep) > 0.15) {
            ziel =
                sep > 0
                    ? this._slopePitch(ik.probeL.g, ik.probeR.g, Math.abs(sep))
                    : this._slopePitch(ik.probeR.g, ik.probeL.g, Math.abs(sep));
        }
        ik.hang += (ziel - ik.hang) * (1 - Math.pow(0.88, Math.max(0, dt) * 60));
        if (!Number.isFinite(ik.hang)) ik.hang = 0;
        return ik;
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
    // der Sohle, die trägt (`probe.vorn`; die Rolle des Gesetzes dreht um die Spitze, koerper `leibSohle`, ihr Überstand darüber hinaus
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
        const unten = (hv.y - (probe.g + ik.soleH) - ry) / Math.cos(leg.hip.userData.stossRoll || 0);
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
        // der Fuß im Ausfallschritt (physik.K5, `leibStossPose`) schwingt, gleich was der Gang sagt
        const stance = (geht ? imStand : true) && !leg.hip.userData.stossSchwung; // Idle: beide Füße geplantet
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
        // die quer gerollte Kette (der Ausfallschritt) reicht lotrecht nur um cos(Roll) — ihre Ebene trägt die längere Strecke
        const unten = (hv.y - (probe.g + ik.soleH) - ry) / Math.cos(leg.hip.userData.stossRoll || 0);
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
        leg.ankle.rotation.z = kipp.quer - (leg.hip.userData.stossRoll || 0);
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
        // alles zuerst auf neutral (absolut → kein Drift zwischen Posen): die neutrale Pose des Kerns (koerper `leibRigNeutral` —
        // die Arm-Kette in der Ruhe ihres Gusses, alles andere auf 0; dieselbe Funktion setzt das Körper-Studio)
        AnazhRealm._leibTakt().leibRigNeutral(r);
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
        // DIE POSE AN LAND (koerper-core `leibRigPose`, w4-koerper-park — dieselbe Funktion setzt das Körper-Studio): Ruhe ×(1−w) —
        // das Kontrapost mit Atem und der Emotion als Daten-Delta (die Profile über die EINE Emotions-Brücke, das Labor-idle ist
        // der Neutralpunkt; MOTION_RIG_MAP) — und Gehen ×w: die Beine auf dem Ziel des Gang-Gesetzes (tetrapoda gangFuss, das Becken
        // gangBecken, die Zwei-Knochen-IK auf die gebauten Beine `_gaitBeinMass`), die Arme gegen die Beine, die Becken-Senke.
        const wB = gait && Number.isFinite(gait.w) ? Math.max(0, Math.min(1, gait.w)) : isMoving ? 1 : 0;
        const mp = wB < 0.999 ? this._koerperMotionProfile(false, emotions) : null;
        const mref = mp ? this._koerperMotionProfile(false, null) : null;
        const SB = wB > 0.001 && gait && gait.S > 0 ? gait.S : 0;
        AnazhRealm._leibTakt().leibRigPose(
            r,
            t,
            walkPhase,
            isMoving,
            gait,
            mp,
            mref,
            SB > 0 ? this._gaitBeinMass(r) : null,
            SB > 0 ? this._gangZeile(true) : null,
            window.__tetrapodaCore
        );
        // DER AUSFALLSCHRITT (koerper-core `leibStossPose`, physik.K5 — dieselbe Funktion setzt das Körper-Studio): die Hüfte rollt
        // jedes Bein quer zu seinem Fuß des Stoß-Zustands, im Schwung hebt das Knie ihn — vor der Fuß-IK, die den Stand hält
        if (gait && gait.ik)
            AnazhRealm._leibTakt().leibStossPose(r, gait.stossLeib, gait.ik.yaw, this._gaitBeinMass(r));
        // ═══ KÖRPER-BEWEGUNG (3) — Fuß-IK/Foot-Lock/Becken/Hang-Lehne (nur mit
        // gerüstetem Kontext = der lokale Avatar; s. _gaitTick Budget-Disziplin).
        if (gait && gait.ik) this._gaitApplyFussIK(r, walkPhase, wB, gait.ik);
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
            if (bones.length) n.bind(AnazhRealm._ofenSkelett(bones), n.bindMatrix.clone());
        });
    }
    // DAS KNOCHEN-RASTER (w27-takt-gc): r184 schlüsselt den Knoten-Bau einer SkinnedMesh mit der Zahl ihrer Knochen
    // (`getMaterialCacheKey`: `skeleton.bones.length` — der Shader legt die Knochen-Reihe mit fester Länge an), und die Haut
    // eines Tiers bindet nur die Gelenke, die eines ihrer Primitive trägt (foundry-core `skinJoints`): die Zahl folgt dem
    // Erbgut und der Stufe. Jeder neue Leib baute so Graph und Programm neu, obwohl er Graph, Geometrie und Stoff mit dem
    // vorigen teilte (dorf Ego eingelaufen, GTX 1050 7ce5b9b6: 17 Knoten-Bauten in 36 s, jeder ein neuer Leib, keiner
    // verdrängt; zwei Wölfe unterschieden sich nur in 29 ↔ 21 und 10 ↔ 7 Knochen). Jede Ofen-Bindung füllt ihr Skelett darum
    // bis zum nächsten Vielfachen von KNOCHEN_RASTER auf — mit ihrem ERSTEN EIGENEN Gelenk, nie einem fremden Knochen: jeder
    // Knochen der Reihe bleibt ein Gelenk des Leibs (die Kreatur-Kosten-Invariante `rZwillingKnochen` zählt jeden, der keins
    // ist — ein Platzhalter ohne Namen färbte z370 rot). Kein skinIndex zeigt auf die Füllplätze; der Knochen-Index, `indexOf`
    // (der erste Platz ist der echte), `__skinJoints` und jeder Leser über sie bleiben, wie sie waren.
    static _ofenSkelett(bones) {
        const n = Math.ceil(bones.length / AnazhRealm.KNOCHEN_RASTER) * AnazhRealm.KNOCHEN_RASTER;
        const alle = bones.slice();
        while (alle.length < n) alle.push(bones[0]);
        return new THREE.Skeleton(alle);
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
            starr.bind(AnazhRealm._ofenSkelett(bones), starr.matrixWorld.clone());
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
                n.bind(AnazhRealm._ofenSkelett(bones), n.matrixWorld.clone());
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
            // der Leib-Raum einer Mengen-Stufe (w26-leib-raum, foundry-core `__leibRaumTafel`): die Formziele jeder Ecke der Vorlage
            // je Achse und Knoten — der Satz der Bewohner liest sie (`_gangSatz`)
            raum: skelett.raum || null,
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
        const da = memo.get(key) || this._ofenRohGiessen(memo, key, takt);
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
    // DER ROHGUSS WARTET AUF SEINEN LESER (w14-ankunft-weg): die Antwort des Werks (die Meshes per Transfer) liegt ungegossen
    // (`_ofenRoh`), bis ein Leser die Vorlage fragt (`_ofenVorlage`) — dann gießt der Haupt-Faden sie EINMAL als feste Vorlage
    // ins Memo, wie die Antwort es sonst sofort tat. Was niemand liest, kostet den Haupt-Faden nichts.
    _ofenRoh(key, meshes) {
        (AnazhRealm._ofenRohMemo || (AnazhRealm._ofenRohMemo = new Map())).set(key, meshes);
    }
    _ofenRohGiessen(memo, key, takt) {
        const R = AnazhRealm._ofenRohMemo;
        const roh = R && R.get(key);
        if (!roh) return null;
        R.delete(key);
        const asm = this._ofenAssembleAsset(roh);
        if (!asm) return null;
        asm.__ofen = { key, nutzer: 0, fest: true, zuletzt: takt };
        memo.set(key, asm);
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
        if (mat.userData && typeof mat.userData.__stein === "string") out.mat.stein = mat.userData.__stein; // w4-genesis-tore (Brücke)
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
        // das Unbeleuchtete ist Licht (w4-genesis-tore, wie die Brücke): ein MeshBasic leuchtet in seiner Farbe, schwarz, matt
        if (mat.isMeshBasicMaterial && mat.visible !== false && out.kind === "unknown") {
            out.mat.roughness = 1;
            out.mat.metalness = 0;
            out.mat.leucht = 1;
            out.mat.unbeleuchtet = true;
        }
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
    // Die Tafel gehört der Seite (WELT_GRENZE.seite: ein bleibendes Programm liest sie), ihre Belegung der Welt: nach dem Wechsel am
    // Ort beginnt die neue Welt mit leeren Zeilen über derselben Karte — sonst gab der Abschied die Karte frei, die der Stoff des
    // Spielers weiter las („Destroyed texture ton-tafel used in a submit“, z86).
    // DER PUNKT IM LEIB-RAUM (w26-leib-raum, koerper LEIB_RAUM): hinter den Tönen trägt jede Zeile die Lage ihres Menschen auf den
    // Achsen des Raums (`leibRaumPunkt`, vier Achsen je Texel) — der Satz der Menge liest sie am Index seiner Palette
    // (`_gangSatzKnoten`); eine Zeile ohne Punkt steht auf der Vorlage (jede Achse am Mittel-Knoten).
    _tonTafel() {
        const st = this.state;
        if (st.tonTafel) {
            if (!st.tonTafelFrei) [st.tonTafelFrei, st.tonTafelZeilen] = [[], 1];
            return st.tonTafel;
        }
        const kc = window.__koerperCore;
        if (!kc || !kc.MENSCH_TON) return AnazhRealm._kernPflichtBruch("koerper:MENSCH_TON");
        if (!kc.LEIB_RAUM) return AnazhRealm._kernPflichtBruch("koerper:LEIB_RAUM");
        const T = THREE;
        const breite = kc.MENSCH_TON.length + Math.ceil(kc.LEIB_RAUM.achsen.length / 4);
        const D = new Float32Array(breite * AnazhRealm.TON_TAFEL.zeilen * 4).fill(1);
        const mitte = kc.LEIB_RAUM.achsen.map((a) => (a.knoten.length - 1) / 2);
        for (let z = 0; z < AnazhRealm.TON_TAFEL.zeilen; z++) D.set(mitte, (z * breite + kc.MENSCH_TON.length) * 4);
        const tex = new T.DataTexture(D, breite, AnazhRealm.TON_TAFEL.zeilen, T.RGBAFormat, T.FloatType);
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
    _tonZeile(palette, punkt = null) {
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
        const kc = window.__koerperCore;
        const nT = kc.MENSCH_TON.length;
        for (let t = 0; t < nT; t++)
            D.set([palette[t * 3], palette[t * 3 + 1], palette[t * 3 + 2], 1], (z * n + t) * 4);
        D.set(punkt || kc.LEIB_RAUM.achsen.map((a) => (a.knoten.length - 1) / 2), (z * n + nT) * 4);
        tex.needsUpdate = true;
        return z;
    }
    _tonZeileFrei(z) {
        if (z > 0 && this.state.tonTafel) this.state.tonTafelFrei.push(z);
    }
    // DER KAHLE KOPF (haar.K2: die Klasse haar am Leib jedes Menschen): das Haar ist die Kappe UND ihre Strähnen (K57, koerper
    // HAAR_KAPPE · haarStreu) — die Kappe gießt der Ofen in die Kopf-Haut, ihre Ecken tragen den Ton des Haars (`aTon`, koerper
    // `menschTon`) und seine Farbe. Verbirgt eine Linse die Strähnen eines Leibs (`aus`: was sie verbirgt; der Leib nach
    // `_menschLeib`: der Spieler, jeder Bewohner), tragen die Ecken seiner Kappe den Ton und die Farbe der Haut seines Kopfs (der
    // Ton führt die Palette des Bewohners, `_tonFaktor`: die Kappe liest die Haut aus seiner Zeile der Ton-Tafel); jeder Ruf stellt
    // zuerst zurück, was der vorige färbte (ohne Strähnen in `aus`: nur zurück). Rückgabe die Zahl der gefärbten Ecken. Bis hier
    // zeigte das Bild ohne Haar (die Teilung der Werkbank, `bild --klasse spieler:kopf/hair`) die Kappe im Ton ihrer Strähnen —
    // getrennt wurden nur Strähnen-Ränder, die Klasse zeigte keine inneren Pixel (haar.K2#1 an 3ed95dcf, GTX); bis w4-bewohner-wache
    // nur am Spieler.
    _kopfKahl(aus) {
        for (const [a, alt] of this._kahlStand || []) {
            for (const [i, ...w] of alt) {
                if (w.length === 1) a.setX(i, w[0]);
                else a.setXYZ(i, w[0], w[1], w[2]);
            }
            a.needsUpdate = true;
        }
        this._kahlStand = [];
        const haar = (o) =>
            !!o &&
            ((o.userData && o.userData.__klasse) ||
                (o.material && o.material.userData && o.material.userData.__klasse)) === "hair";
        const KC = typeof window !== "undefined" && window.__koerperCore;
        const leiber = new Set((aus || []).filter(haar).map((o) => this._leibWurzel(o)));
        for (const L of leiber) if (!this._menschLeib(L)) leiber.delete(L);
        if (!KC || !leiber.size) return 0;
        const [tH, tS] = [KC.menschTon("haarKappe"), KC.menschTon("skin")];
        let n = 0;
        for (const L of leiber)
            L.traverse((o) => {
                const a = o.isMesh && !haar(o) && o.geometry && o.geometry.attributes;
                const [t, c] = a ? [a.aTon, a.color] : [];
                if (!t || !c) return;
                const m = [0, 0, 0, 0];
                for (let i = 0; i < t.count; i++)
                    if (Math.round(t.getX(i)) === tS)
                        ((m[0] += c.getX(i)), (m[1] += c.getY(i)), (m[2] += c.getZ(i)), m[3]++);
                if (!m[3]) return;
                const [altC, altT] = [[], []];
                for (let i = 0; i < t.count; i++)
                    if (Math.round(t.getX(i)) === tH) {
                        altC.push([i, c.getX(i), c.getY(i), c.getZ(i)]);
                        altT.push([i, t.getX(i)]);
                        c.setXYZ(i, m[0] / m[3], m[1] / m[3], m[2] / m[3]);
                        t.setX(i, tS);
                    }
                if (!altC.length) return;
                this._kahlStand.push([c, altC], [t, altT]);
                c.needsUpdate = t.needsUpdate = true;
                n += altC.length;
            });
        return n;
    }
    // DER LEIB EINES MENSCHEN (die Kopf-Klasse, PFLICHT-OFFEN A: mensch-kopf und haar an jedem Menschen): die Wurzel eines Leibs
    // (`_leibWurzel`: sein Knoten unter der Szene) heißt nach dem, der er ist — der Spieler `spieler`, jeder Bewohner `bewohner`
    // (der Mensch der Menge, `_bewohnerGeburt`: sein Leib trägt den Baum der Glieder wie ein Tier, `_tierBaum`, und ist doch keines);
    // sonst null. Leser: die Täter-Klasse (`_taeterKlasse`: der EINE Name jeder Kosten-Linse), die Teilung (`_kopfKlasse`), der
    // kahle Kopf (`_kopfKahl`). Bis w4-bewohner-wache hieß jeder Bewohner-Leib `tier:?` — 14 von 14 Teilen am Start-Dorf, jede
    // Kosten-Linse buchte ihn als Tier.
    _menschLeib(top) {
        if (!top) return null;
        if (top === this.state.playerMesh) return "spieler";
        const u = top.userData;
        return u && u._menge === true && top.name === "bewohner" ? "bewohner" : null;
    }
    _leibWurzel(o) {
        let top = o;
        while (top.parent && top.parent !== this.state.scene) top = top.parent;
        return top;
    }
    // DIE KOPF-KLASSE (mensch-kopf, haar): die Teilung jedes Leibs eines Menschen (`_menschLeib`) in seine Stoffe nach EINEM
    // Gesetz — ein Teil, dessen Haut-Gewichte zu `KOPF_TEILUNG.anteil` an den Gelenken des Kopfs hängen (`KOPF_TEILUNG.gelenk`:
    // head, Augen, Lider) oder der unter dem Kopf-Knoten sitzt (die Strähnen), heißt `<leib>:kopf/<Stoff>`, der Rest
    // `<leib>:leib/<Stoff>` (Stoff = `__klasse` des Teils, ohne sie `auge` am Iris-Gelenk, sonst `stoff`). Liefert [grob, fein]:
    // grob die Täter-Klasse (`_taeterKlasse`, das Holz unten ausgenommen), fein der Name des Teils — was kein Leib eines Menschen
    // ist, trägt beide gleich (der Satz der Menge bleibt `bewohner-satz`). Leser: die Teilung der Werkbank (`bild --klasse`: wählt der Ausdruck den Leib, ist er
    // EINE Klasse, sonst zeigt er seine Teile) und ihr Gesicht (die Kopf-Haut des nächsten gewählten Leibs). Bis w4-bewohner-wache
    // teilte die Werkbank selbst und nur den Spieler (nur unter `--gesicht`): kein Bewohner trug `bewohner:kopf/…`.
    // DAS HOLZ IST EIN AUSSEN (w26-eiche-kante, lod.K1#1): ein Teil einer Foundry-Gestalt (`f:<art>:L<n>`), dessen Stoff Holz ist
    // (das Kern-Gesetz phyto-core `budgetRegler(kind).rinde`: Rinde und Stiel), ist ein eigener Leib `<klasse>:holz`, grob wie fein
    // — die Krone eines Baums ist ihr Laub. Bis hier trug die Rinde den Namen ihres Laubs, und die Laub-Kante maß den Stamm im Gras
    // als Umriss der Krone (Spielgang, GTX 1050 30e94000: f:eiche:L1 0,3102 mit, 0,194 ohne Rinde, 2 726 Stamm-Pixel).
    _kopfKlasse(o) {
        const grob = this._taeterKlasse(o);
        if (!o.geometry || this._menschLeib(this._leibWurzel(o)) !== grob) {
            const art = o.material && o.material.userData ? o.material.userData.foundryKind : null;
            const holz = grob.startsWith("f:") && !!art && globalThis.__phytoCore.budgetRegler(art).rinde;
            return holz ? [grob + ":holz", grob + ":holz"] : [grob, grob];
        }
        const K = AnazhRealm.KOPF_TEILUNG;
        const auge = !!(o.isSkinnedMesh && o.skeleton && o.skeleton.bones.some((b) => K.iris.test(b.name)));
        const stoff = (o.userData && o.userData.__klasse) || (auge ? "auge" : "stoff");
        return [grob, `${grob}:${this._kopfAnteil(o) >= K.anteil ? "kopf" : "leib"}/${stoff}`];
    }
    // Der Anteil eines Teils am Kopf: 1 unter dem Kopf-Knoten, sonst seine Haut-Gewichte an den Gelenken des Kopfs über alle.
    _kopfAnteil(o) {
        for (let p = o; p; p = p.parent) if (p.name === "head") return 1;
        const K = AnazhRealm.KOPF_TEILUNG;
        const a = o.geometry.attributes.skinIndex;
        const w = o.geometry.attributes.skinWeight;
        if (!a || !w || !o.skeleton) return 0;
        const amKopf = o.skeleton.bones.map((b) => K.gelenk.test(b.name));
        let [kz, n] = [0, 0];
        for (let i = 0; i < a.count; i++)
            for (let c = 0; c < 4; c++) {
                const wt = w.getComponent(i, c);
                n += wt;
                if (amKopf[a.getComponent(i, c)]) kz += wt;
            }
        return n ? kz / n : 0;
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
    // DIE ACHSE DER STRÄHNE (haar.K3, w25-haar-albedo): je Ecke des nahen Haars der Rahmen ihrer Strähne `aStraehne` [Achse,
    // Länge] — das EINE Gesetz koerper `haarAchse` (das Gesetz der Ecken des Bäckers `__streuGeo` rückwärts; das Labor
    // liest dasselbe). Die Achse trägt die Feder des Winds, Achse ÷ Länge den Glanz der Spitze (`_foundryTreeMaterial`); die
    // Braue im selben Teil trägt ihren eigenen Ton und steht. Gelesen hier, am Bau jedes Teils (`_foundryBuildMesh`): ein Band,
    // das dem Gesetz nicht folgt, meldet der EINE Melder beim Namen. Der Ofen-Guss bleibt byte-gleich (gate:ofen-contract); die
    // Grobstufe (die Kappe ohne Strähnen, einfarbig) trägt keine Achse. Liefert die Zahl der Strähnen.
    _haarAchse(mesh) {
        const kl =
            mesh &&
            ((mesh.userData && mesh.userData.__klasse) ||
                (mesh.material && mesh.material.userData && mesh.material.userData.__klasse));
        const a = kl === "hair" && mesh.geometry ? mesh.geometry.attributes : null;
        if (!a) return 0;
        // der Versatz der Feder (Welt-Meter, `_haarFederTakt`): ein Klar-Wert am Teil — jeder Klon trägt seinen eigenen
        mesh.userData.__haarFeder = { x: 0, y: 0, z: 0 };
        if (!a.color || !a.aTon || a.aStraehne) return 0;
        const n = a.position.count;
        const je = (b, m) => Float32Array.from({ length: n * m }, (_, j) => b.getComponent((j / m) | 0, j % m));
        const r = globalThis.__koerperCore.haarAchse(je(a.position, 3), je(a.color, 3), je(a.aTon, 1));
        if (r.bruch) {
            this._bruchMelden(`HAAR-ACHSE: ${r.bruch} Bänder des Haars folgen nicht dem Gesetz der Ecken (__streuGeo)`);
            return 0;
        }
        if (!r.zahl) return 0;
        mesh.geometry.setAttribute("aStraehne", new THREE.BufferAttribute(r.achse, 2));
        // die Tangente der Strähne und ihr Wurf (Kajiya-Kay, `_haarLichtModell`)
        mesh.geometry.setAttribute("aHaarT", new THREE.BufferAttribute(r.tangente, 4));
        return r.zahl;
    }
    // DAS HAAR IM EINEN WIND UND MIT DEM LEIB (haar.K3) — der Lage-Knoten jedes Haar-Stoffs: der Versatz der Ecke ist die
    // Auslenkung der Feder ihres Teils (`userData.__haarFeder`, Welt-Meter, `_haarFederTakt`) × Länge der Strähne /
    // HAAR_WIND.bezug, höchstens HAAR_WIND.reichweite × Länge (die Spitze bleibt an ihrer Strähne). Die Wurzel (Achse 0) steht;
    // ohne Achse (die Grobstufe, die Kappe) steht das ganze Teil. Die Feder ist ein Objekt-Verweis: im Bündel lädt die Diät ihn,
    // sobald er wechselt (`_diaetVerweisAnders`) — eine Objekt-Uniform stellte r184 dort nur bei der Aufnahme. Das Teil meldet sich
    // beim Zeichnen (`_haarFeder`, die Eins). Ruht die Feder, ist der Versatz 0 und die Lage byte-gleich.
    _haarWindKnoten(T) {
        if (this._haarWindNode) return this._haarWindNode;
        const H = AnazhRealm.HAAR_WIND;
        const meldung = T.uniform(1).onObjectUpdate(({ object }) => (this._haarFeder(object), 1));
        const feder = T.reference("userData.__haarFeder", "vec3");
        const naht = this._weltNaht(T);
        const achse = T.Fn((b) =>
            b.geometry && b.geometry.hasAttribute("aStraehne") ? T.attribute("aStraehne", "vec2").x : T.float(0)
        )();
        const zug = naht.vorlage(feder.mul(achse.mul(naht.skala).div(H.bezug)));
        const deckel = achse.mul(H.reichweite).div(zug.length().max(1e-9)).min(1);
        this._haarWindNode = T.positionLocal.add(zug.mul(deckel).mul(meldung));
        return this._haarWindNode;
    }
    // Die Meldung eines gezeichneten Haar-Teils mit Achse: der Takt (`_haarFederTakt`) führt es, bis es die Szene verlässt.
    _haarFeder(o) {
        const g = o && o.geometry;
        if (!g || !g.attributes.aStraehne || !o.userData.__haarFeder) return null;
        let F = this._haarFedern;
        if (!F) F = this._haarFedern = new Map();
        let f = F.get(o);
        if (!f) {
            if (!g.boundingSphere) g.computeBoundingSphere();
            F.set(
                o,
                (f = {
                    w: new THREE.Vector3(),
                    o: new THREE.Vector3(),
                    v: new THREE.Vector3(),
                    p: null,
                    u: new THREE.Vector3(),
                    t: null,
                    mitte: g.boundingSphere.center.clone(),
                })
            );
        }
        return f;
    }
    // DIE FEDER DES HAARS (haar.K3: im EINEN Wind und mit dem Leib) — die Spitze einer Strähne der Länge HAAR_WIND.bezug in zwei
    // Moden, gerechnet je Takt auf der WELT-Uhr (`spielZeit`, Lehre 13: der Löser geht im Takt der Welt, nie an der Bild-Uhr;
    // die Bühne hält diese, das Portal friert jene). DER WIND: der Luft-Widerstand führt die leichte Strähne ihrem Ziel nach
    // (erste Ordnung, HAAR_WIND.zug), dem EINEN Wind am Ort der Mitte des Haars (`_windAt`) — das Wiegen des Grases
    // (`_windWiegen`, dasselbe Gesetz wie `_windSwayOffset`: die Weite der Böe, die Phase aus dem Rauschen der Strähne) mit der
    // Höhe Länge × HAAR_WIND.hebel, darüber das Flattern der Strähne (HAAR_WIND.flattern: Teil-Frequenzen, je Achse um quer
    // verstimmt, die Phase aus ihrem Rauschen; die Weite staerke × die Wirkung des Winds); ohne Wind ist das Ziel 0 und die
    // Strähne steht im nächsten Takt. DER LEIB: die Mitte des Haars (Lage
    // des Objekts × Mitte seiner Gestalt) trägt Lauf, Sprung und Drehung, ihre Beschleunigung (das Tempo geglättet über glatt s)
    // treibt die Feder (HAAR_WIND.feder, zweite Ordnung) mit der Schein-Kraft −a: die Spitze bleibt zurück und schwingt nach
    // (Trägheit, Rückfedern). Beide zusammen höchstens feder.max. Gerechnet nur für gemeldetes, sichtbares Haar bis
    // HAAR_WIND.nah vom Auge; fern, verborgen, nach einer Pause (> 0,25 s Takt) oder einem Sprung der Lage (> 2 m) ruht es bei
    // 0, und im Stand ohne Wind klingt jede Mode auf genau 0 aus. Ein Teil, das die Szene verlässt, fällt aus dem Takt.
    _haarFederTakt() {
        const F = this._haarFedern;
        if (!F || !F.size) return;
        const H = AnazhRealm.HAAR_WIND;
        const B = H.feder;
        const FL = H.flattern;
        const t = this.state.spielZeit;
        const auge = this.state.camera ? this.state.camera.position : null;
        const w = 2 * Math.PI * B.hz;
        const p = new THREE.Vector3();
        const a = new THREE.Vector3();
        const ziel = new THREE.Vector3();
        const szene = this.state.scene;
        for (const [o, f] of F) {
            const aus = o.userData.__haarFeder;
            let sicht = o.visible;
            let top = o;
            for (; top.parent; top = top.parent) sicht = sicht && top.parent.visible;
            if (top !== szene || !aus) {
                F.delete(o);
                continue;
            }
            p.copy(f.mitte).applyMatrix4(o.matrixWorld);
            const dt = f.t === null ? null : t - f.t;
            if (dt === 0) continue; // derselbe Takt
            if (
                !sicht ||
                !auge ||
                p.distanceTo(auge) > H.nah ||
                f.p === null ||
                !(dt > 0) ||
                dt > 0.25 ||
                p.distanceTo(f.p) > 2
            ) {
                f.w.set(0, 0, 0);
                f.o.set(0, 0, 0);
                f.v.set(0, 0, 0);
                f.u.set(0, 0, 0);
                f.p = p.clone();
                f.t = t;
                aus.x = aus.y = aus.z = 0;
                continue;
            }
            // das geglättete Tempo der Mitte, seine Änderung die Beschleunigung
            const k = 1 - Math.exp(-dt / B.glatt);
            const u0 = f.u.clone();
            f.u.lerp(p.clone().sub(f.p).divideScalar(dt), k);
            a.copy(f.u).sub(u0).divideScalar(dt);
            f.p.copy(p);
            f.t = t;
            // der Wind am Ort zur Uhr des Takts (Stärke, Richtung, Böe); die Phase läuft je Teil-Schritt. Das Rauschen der
            // Strähne (die Ziehung des Orts, Zug 1, wo sie zuerst wehte) bleibt ihr, wohin der Leib sie trägt — wie das Rauschen
            // eines Halms an seinem Fuß (`_windSwayOffset`)
            const wa = this._windAt(p.x, p.z, t);
            if (f.nu == null) f.nu = AnazhRealm._ortZiehung(AnazhRealm._wortAlgebra(), p.x, p.z, 1);
            const hoehe = H.bezug * H.hebel;
            const eff = wa.staerke * AnazhRealm.WEATHER_WIND_AMP * wa.boe * hoehe * FL.staerke;
            const ort = 2 * Math.PI * f.nu;
            const n = Math.ceil(dt * 240);
            const h = dt / n;
            const zug = 1 - Math.exp(-h / H.zug);
            for (let i = 0; i < n; i++) {
                const ti = t - dt + (i + 1) * h;
                const [wx, wz] = this._windWiegen(wa, f.nu, ti, hoehe);
                let [fx, fz] = [0, 0];
                FL.hz.forEach((hz, j) => {
                    fx += Math.sin(2 * Math.PI * hz * ti + ort + 2.1 * j);
                    fz += Math.cos(2 * Math.PI * hz * FL.quer * ti + ort + 1.3 * j);
                });
                const s = eff / Math.sqrt(FL.hz.length);
                ziel.set(wx + fx * s, 0, wz + fz * s);
                // der Wind trägt die Strähne über den Luft-Widerstand (erste Ordnung, Zeitkonstante HAAR_WIND.zug)
                f.w.lerp(ziel, zug);
                // der Leib schwingt sie über ihre Feder (zweite Ordnung) unter der Schein-Kraft −a
                f.v
                    .addScaledVector(f.o, -w * w * h)
                    .addScaledVector(f.v, -2 * B.daempfung * w * h)
                    .addScaledVector(a, -h);
                f.o.addScaledVector(f.v, h);
            }
            if (!(Number.isFinite(f.w.x + f.w.z) && Number.isFinite(f.o.x + f.o.y + f.o.z + f.v.x + f.v.y + f.v.z)))
                (f.w.set(0, 0, 0), f.o.set(0, 0, 0), f.v.set(0, 0, 0));
            // im Stand klingt jede Mode auf genau 0 aus: ohne Wind der Wind-Mode, ohne Beschleunigung die Feder
            if (eff === 0 && wa.staerke === 0 && f.w.length() < 1e-5) f.w.set(0, 0, 0);
            if (f.o.length() < 1e-5 && f.v.length() < 1e-4 && a.length() < 1e-3) (f.o.set(0, 0, 0), f.v.set(0, 0, 0));
            ziel.copy(f.w).add(f.o);
            const l = ziel.length();
            if (l > B.max) ziel.multiplyScalar(B.max / l);
            [aus.x, aus.y, aus.z] = [ziel.x, ziel.y, ziel.z];
        }
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
    // Grobstufe allein — die feine bestellt das Ereignis des Bilds (`_weltbildKommt`), sie wartet roh (`_ofenRoh`), bis der
    // Leerlauf sie gießt und eintauscht (`_leibFeinTausch`). Befund B5 (OMEN 18.10., GTX kalt): die feine wartete in w0 hinter dem Blatt-Atlas, baute 4,4 s und
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
                // die Stufen des ersten Bilds sind ein Kopf der Ankunft (`_foundryRang`: die Bahn ohne Arbeit, `_foundryPumpe`) —
                // auch die feine, sobald das erste Bild sie wünscht (`_leibWunsch`)
                const bestellen = () =>
                    this._foundryRequest(
                        "mensch",
                        0,
                        lodM,
                        { dials: dM, skinColor: fM.skin, hairColor: fM.hair },
                        this._foundryRang(pm ? pm.position : undefined, !nachBild || z.gewuenscht === true)
                    ).then((meshes) => {
                        // fail-LAUT (V18.462): ein toter Prefetch war von Erfolg
                        // nicht unterscheidbar — das eine Wort macht ihn sichtbar.
                        if (!meshes || !meshes.length) {
                            if (!memo.has(keyM))
                                this.log(`OFEN-PREFETCH LEER: mensch lod${lodM} (Buch kalt/Timeout)`, "WARN");
                            return;
                        }
                        // die feine nach dem Bild wartet ROH (`_ofenRoh`): zeigt das Bild nur den Wurf, gießt sie der Haupt-Faden
                        // erst im Leerlauf (`_leibFeinTausch` im Vorbau) oder wenn ein anderer Leser sie fragt (die Ich-Bühne, ein Neubau)
                        if (nachBild && !z.gewuenscht) {
                            if (!memo.has(keyM)) this._ofenRoh(keyM, meshes);
                        } else this._ofenVorlage(keyM, false, () => this._ofenAssembleAsset(meshes), true);
                    });
                // DER WUNSCH FOLGT DEM BLICK: die feine kommt mit dem Ereignis des Bilds — oder früher, wenn das erste Bild sie
                // doch zeigt (`_leibWunsch`: die Sicht wechselt vor ihm auf Third)
                const fein = () => {
                    z.feinDa = true;
                    z.steht = z.vorBildDa === true;
                };
                // die Ankunft tauscht nur die gewünschte feine (die Sicht ging vor dem Bild auf Third); die rohe tauscht der Leerlauf
                const auftrag = nachBild
                    ? Promise.race([this._weltbildKommt(), new Promise((ja) => (z.wunsch = ja))])
                          .then(bestellen)
                          .finally(fein)
                          .then(() => z.gewuenscht === true && this._leibFeinTausch())
                    : bestellen();
                if (!nachBild) vorBild.push(auftrag);
                auftraege.push(auftrag);
            }
        }
        const steht = () => {
            z.vorBildDa = true;
            z.steht = z.gewuenscht !== true || z.feinDa === true;
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
    // DER WUNSCH FOLGT DEM BLICK (B5): wartet die feine Stufe auf das erste Bild (`_ofenSpielerVorlagen`: der Boot sah nur
    // den Wurf), und zeigt das erste Bild nun doch die Gestalt (`_leibGrobVorBild` falsch: die Sicht wechselt vor ihm auf Third),
    // geht sie jetzt als Kopf der Ankunft — wie bei einem Boot in Third; ist der Leib noch nicht gegossen, wartet er auf sie
    // (`_leibBereit`) und trägt nah die feine. Bis hier trug ein Leib, dessen Sicht vor dem ersten Bild auf Third ging, nah die
    // Grobstufe (die Kappe ohne Strähnen), bis das Bild kam und die feine eintauschte (haar.K3: die Werkbank tauschte mitten in
    // der Messung, Bild 0 bis 6). NACH DEM BILD wünscht die Eingabe nichts mehr: der Leerlauf tauscht (`_leibFeinTausch`).
    _leibWunsch() {
        const z = this._spielerVorlagen;
        if (!z || this.state._weltbildDa || !z.wunsch || this._leibGrobVorBild()) return;
        const ja = z.wunsch;
        z.wunsch = null;
        z.gewuenscht = true;
        z.steht = z.vorBildDa === true && z.feinDa === true;
        ja();
    }
    // DER TAUSCH DER FEINEN STUFE (B5): kam sie nach dem Bild, trägt der Leib des Spielers sie ab jetzt — derselbe Bau
    // (`applyPlayerSoul`, die Lage reist mit), die Grobstufe fällt mit dem alten Leib. Nur ein Leib, der nah die Grobstufe
    // trägt (`nahStufe`), tauscht; ein deferierter Bau trifft die feine selbst. Die feine nach dem Bild wartet roh (`_ofenRoh`):
    // im Fenster Weltbild→Kontrolle gießt und tauscht sie niemand (w14-ankunft-weg, Radeon 111–152 + 81–134 ms).
    // DER LEIB TAUSCHT IM LEERLAUF (w20-leib-takt, Lehre 14): gegossen und getauscht wird sie als erster Schritt des Vorbaus
    // (`_vorbauBedienung`: die Eingabe ruht, die Welt steht), nie auf dem Pfad der Eingabe — die Sicht auf Third und der Sitz im
    // Wagen schalten nur, was schon da ist. Bis hier tauschte der Wunsch beim ersten Wechsel auf Third (`setCameraMode`),
    // beim Griff (`equipHeld`) und beim Einsteigen: GTX ego/wechsel p95 228,9 ms, ego/einsteigen 75,6 ms, Radeon 139,9–140,9 ms;
    // headless `setCameraMode(third)` 34–63 ms (Rohguss 17–36, Gelenk-Gestalt 13–24), und der getauschte Leib ließ jeden Leser
    // des alten mit einer toten Hand zurück (leib.K1#2 „hieb fehlt 15/15 je Sicht"). Leser: der Vorbau, die Ankunft einer
    // gewünschten feinen (Third vor dem Bild) und ein Griff vor dem Tausch (die Hand liest die Hand-Mitte der feinen). → true =
    // getauscht.
    _leibFeinTausch() {
        const st = this.state;
        const g = st.playerMesh && st.playerMesh.userData._gelenk;
        if (!g || g.nahStufe !== 1 || st._deferredAvatarSoul) return false;
        this.applyPlayerSoul(st.player.soul);
        return true;
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
        const gesehen = new Set();
        // die Wesen eines geladenen Stands zuerst (`_ofenStandBestellen`): ihre Vorlagen und Glieder stehen vor dem Rest des Vorrats
        auftraege.push(this._ofenStandBestellen());
        // die Spieler-Vorlagen (Mensch, beide Stufen) bestellt der Leib des Spielers selbst, sobald das Buch steht
        // (`_ofenSpielerVorlagen`, K60-2) — der Vorrat wartet auf denselben Zug und hält sie fest
        auftraege.push(this._ofenSpielerVorlagen().da);
        for (const soulKey of Object.keys(map)) {
            const recId = map[soulKey];
            if (!recId || gesehen.has(recId)) continue;
            gesehen.add(recId);
            const d = this._ofenKreaturDials(recId, null);
            if (!d) continue;
            for (const lod of [0, 1]) auftraege.push(this._ofenVorlageBestellen(recId, d, lod, undefined, true));
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
    // DIE EINE BESTELLUNG EINER TIER-VORLAGE (w28-tiere-nach-bild): der Guss kommt aus dem Werk der Foundry (Platte zuerst), die
    // Antwort wird Vorlage im Memo (`_ofenVorlage`). Je Schlüssel EIN Auftrag im Flug — der Vorrat der Gattungen und der Vorrat
    // eines Stands bestellen dieselbe Gattung nie zweimal, der zweite hängt sich an. `wo` = der Ort des nächsten Lesers (der Rang
    // des Auftrags, `_foundryRang`; ohne = Vorrat), `fest` hält die Vorlage im Memo (die Gattungs-Vorlagen des Vorrats).
    _ofenVorlageBestellen(recId, d, lod, wo, fest) {
        const memo = AnazhRealm._tierOfenMemo || (AnazhRealm._tierOfenMemo = new Map());
        const key = this._ofenKreaturKey(recId, d.dials, lod);
        const halte = () => (memo.has(key) ? this._ofenVorlage(key, false, () => null, fest) : null);
        if (memo.has(key)) return Promise.resolve(halte());
        const Q = this._ofenBestellt || (this._ofenBestellt = new Map());
        let a = Q.get(key);
        if (!a) {
            a = this._foundryRequest(recId, 0, lod, d.istDefault ? null : d.dials, wo).then((meshes) => {
                Q.delete(key);
                if (!meshes || !meshes.length) {
                    if (!memo.has(key)) this.log(`OFEN-PREFETCH LEER: ${recId} lod${lod} (Buch kalt/Timeout)`, "WARN");
                    return;
                }
                this._ofenVorlage(key, false, () => this._ofenAssembleAsset(meshes), fest);
            });
            Q.set(key, a);
        }
        return a.then(halte);
    }
    // DER VORRAT EINES STANDS (w28-tiere-nach-bild): die Wesen, die ein geladener Stand trägt (`_wesenAusstehend`), kehren
    // GATTUNG FÜR GATTUNG wieder, die des nächsten Wesens am Spieler zuerst — jede erst, wenn (1) IHRE Vorlagen im Memo liegen:
    // die Gattung (beide Stufen), jede Vorlage mit eigenen Guss-Dials (`_standGussDials`, derselbe Schlüssel wie die
    // Wiederkehr) und ihre Glieder (`_gliederBestellen`, der Takt liest nur das Memo), und (2) die PROGRAMME ihrer Leiber gebaut
    // sind (`_ofenStandVorbau`). Bestellt nach dem ersten Weltbild (K60: davor stünde der Guss im Werk vor den Bäumen des
    // Bildes), jede Bestellung mit dem Ort ihres nächsten Wesens (der Rang, `_foundryRang`). `reihe` trägt die Gattungen, deren
    // Vorlagen stehen, in der Folge der Nähe; je Stash EIN Lauf — der Vorrat der Gattungen ruft ihn als Erstes,
    // `_bootDeferCreatures` für jede spätere Welt. Eine Vorlage mit eigenen Dials ist nicht `fest`: mehr als OFEN_MEMO_RUHEND
    // verschiedene Prägungen in EINEM Stand hält das Memo nicht bis zur Wiederkehr (die älteste gießt dann laut,
    // `_fadenUmgangen`).
    _ofenStandBestellen() {
        const stash = this._wesenAusstehend();
        if (!stash) return Promise.resolve();
        const alt = this._ofenStandAuftrag;
        if (alt && alt.stash === stash) return alt.da;
        this._ofenStandVorbau(true); // die Gäste eines Stands, der nie wiederkehrte, gehen
        const A = (this._ofenStandAuftrag = { stash, da: null, reihe: [], ganz: false });
        const lauf = async () => {
            // steht das Bild schon (der Vorrat der Gattungen ruft von dort), gehen die Bestellungen SOFORT hinaus — vor seinen eigenen
            if (!this.state._weltbildDa) await this._weltbildKommt();
            const map = AnazhRealm.TETRAPODA_SOUL_MAP;
            const L = AnazhRealm._lebensraumGesetz().L;
            const nah = stash
                .filter((s) => s && s.position)
                .map((s) => [this._spielerD2(s.position.x, s.position.z), s])
                .sort((a, b) => a[0] - b[0]);
            const arten = new Map(); // Gattung → ihre Vorlagen im Flug und je Prägung EIN Leib für den Vorbau, in der Folge der Nähe
            for (const [, snap] of nah) {
                const seele = AnazhRealm.CREATURE_SOULS[snap.soul] ? snap.soul : "wesen";
                const recId = map[seele];
                const wo = { x: snap.position.x, z: snap.position.z };
                const eigen = this._standGussDials(snap);
                let art = arten.get(seele);
                if (!art) arten.set(seele, (art = { seele, recId, vorlagen: [], leiber: new Map() }));
                art.leiber.set(JSON.stringify(eigen || null), eigen);
                const praegungen = [this._ofenKreaturDials(recId, null)];
                if (eigen) praegungen.push(this._ofenKreaturDials(recId, eigen));
                for (const [i, d] of praegungen.entries())
                    if (d)
                        for (const lod of [0, 1])
                            art.vorlagen.push(this._ofenVorlageBestellen(recId, d, lod, wo, i === 0));
            }
            for (const art of arten.values())
                art.da = Promise.all(art.vorlagen).then(() =>
                    art.recId in L.gattung ? this._gliederBestellen(art.seele) : null
                );
            // die Gattungen treten in der Folge der Nähe an: die des nächsten Wesens kehrt zuerst wieder
            for (const art of arten.values()) {
                await art.da;
                if (this._ofenStandAuftrag !== A || this._wesenAusstehend() !== stash) return;
                A.reihe.push({ seele: art.seele, leiber: [...art.leiber.values()], gaeste: null, takte: 0 });
            }
            A.ganz = true;
        };
        return (A.da = lauf());
    }
    // DIE NÄCHSTE GATTUNG EINES STANDS, DEREN LEIBER GEZEICHNET WERDEN KÖNNEN (w28-tiere-nach-bild, Nachschnitt) — oder null. Der
    // erste Wurf des Schnitts ließ die Wesen wiederkehren, sobald ihre Vorlagen im Memo lagen: sie standen in der Welt und
    // lebten, gezeichnet aber wurde ein Leib erst, wenn die Erst-Zeichnung seinen Knoten-Bau und seine Pipeline fertig hatte —
    // je Stoff einzeln, GTX 1050 1,4–5,7 s NACH der Wiederkehr (ein Fuchs lief in der Zeit ungesehen von 8,3 auf 2,9 m an den
    // Spieler heran), dann hart in EINEM Bild. Jetzt geht je Prägung der vordersten Gattung der `reihe` EIN Leib als Gast des
    // Vorbaus in die Szene (`_vorbauGast`: Maßstab 0, die Erst-Zeichnung baut Knoten und Pipeline ohne Draw, in ihrer Frist),
    // und erst wenn jeder steht (`_vorbauFehlt`), nennt die Frage die Gattung: ihre Wesen kehren wieder und zeichnen im selben
    // Bild. EINE Gattung zur Zeit — die Bau-Zeit nach dem Bild ist knapp (ERST_BAU_MS je Aufruf), die nächste am Spieler bekommt
    // sie ganz. Nach VORBAU_TAKTE Takten kehrt die Gattung laut ohne ihre Programme wieder. Ohne Erst-Zeichnung (Null-Renderer,
    // Kienspan) gibt es nichts vorzubauen. `gehen`: die Gäste der vordersten Gattung verlassen die Szene, die nächste rückt vor.
    _ofenStandVorbau(gehen) {
        const A = this._ofenStandAuftrag;
        const k = A && A.reihe[0];
        if (!k) return null;
        if (gehen === true) {
            for (const g of k.gaeste || []) {
                this.state.scene.remove(g);
                this._disposeSoulGroup(g);
            }
            A.reihe.shift();
            return null;
        }
        if (!k.gaeste) {
            const R = this.state.renderer;
            k.gaeste = [];
            if (R && R.__anazhErstZeichnung && this.state._holzProfil !== "kienspan")
                for (const eigen of k.leiber) {
                    const leib = this._buildCreatureGroup(k.seele, eigen ? { dialsOv: eigen } : undefined);
                    if (leib) k.gaeste.push(this._vorbauGast(leib, "wiederkehr:" + k.seele));
                }
        }
        const fehlt = k.gaeste.reduce((s, g) => s + this._vorbauFehlt(g, true), 0);
        if (fehlt && ++k.takte < AnazhRealm.VORBAU_TAKTE) return null;
        if (fehlt)
            this._bruchMelden(
                `WIEDERKEHR-VORBAU: die Leiber der Gattung „${k.seele}“ stehen nach ${k.takte} Takten nicht ganz (${fehlt} Teile)`
            );
        return k;
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
    // DAS QUER-MASS DER GESTALT (physik.K2 Staffel 2, Kollision = Bild; einmal je Vorlage, wie `tierBeinMass`): je Achse des
    // Leibs (Becken · Rumpf-Mitte · Brust bei −0,8 · 0 · +0,8 Hüft-Höhen; ihr Abschnitt reicht bis zur halben Strecke zum
    // Nachbarn) der Radius des Kreises um sie, der die GEZEICHNETE Gestalt dort deckt — Haut und Fell in der Bind-Pose: erst
    // die halbe Breite des Abschnitts (die weiteste Ecke quer zur Blick-Achse), dann die fernste Ecke im Band ± dieser halben
    // Breite / 2 längs um die Achse (das Hinterbein des Bären steht 5 cm hinter seiner Becken-Achse: der Kreis der halben
    // Breite ließ es an einer schrägen Wand 5 mm heraus) —, JE HÜFT-HÖHE (der Leib skaliert an ihr). Der Leib des Tiers liest
    // ihn (`_kreaturLeib`); bis hier galt für jede Gattung und Achse 0,3 × Hüft-Höhe: der Bär zeichnet 0,27–0,32 m halbe Breite
    // bei 0,230 m Radius (an der Mauer stak seine Flanke 5,9 cm in ihr), der Hirsch 0,169 m bei 0,275 m (10 cm vor jeder Wand).
    static _tierQuerMass(t0, f, beinL) {
        if (t0._querMass) return t0._querMass;
        const v = new THREE.Vector3();
        const [breit, halb] = [[0, 0, 0], (0.8 * beinL) / f];
        const jeEcke = (tat) =>
            t0.root.traverse((n) => {
                const P = n.isSkinnedMesh && n.geometry.attributes.position;
                for (let i = 0; P && i < P.count; i++) {
                    v.fromBufferAttribute(P, i).applyMatrix4(n.bindMatrix);
                    const a = v.z < -halb / 2 ? 0 : v.z > halb / 2 ? 2 : 1;
                    tat(a, Math.abs(v.x), v.z - (a - 1) * halb);
                }
            });
        jeEcke((a, x) => (breit[a] = Math.max(breit[a], x)));
        const q = breit.slice(); // mindestens die halbe Breite (die Becken-Achse des Hirschs liegt hinter seinem Leib)
        jeEcke((a, x, dz) => Math.abs(dz) <= breit[a] / 2 && (q[a] = Math.max(q[a], Math.hypot(x, dz))));
        if (!(q[0] > 0 && q[1] > 0 && q[2] > 0 && beinL > 0))
            return AnazhRealm._kernPflichtBruch("leib:Gestalt ohne Quer-Maß");
        return (t0._querMass = q.map((x) => (x * f) / beinL));
    }
    // Der Baum-GANG konsumiert das EINE Gang-Gesetz: cpgStep + STAND_POSE + MOTION-Profile (LIVE-Buch
    // über _motionProfileName) treiben die vier Bein-KETTEN des bauTier-Baums (Lab-Ziel-Mathe direkt,
    // nicht PD-geglättet). Deterministisch (Stand-Unruhe aus t-Sinus); der CPG-Zustand wohnt an
    // tb._gang, walkPhase ist nur der Phasen-Seed.
    _animateTierBaum(group, t, walkPhase, moving, emotions) {
        const tb = group && group.userData && group.userData._tierBaum;
        if (!tb || !tb.teile) return;
        const core = typeof window !== "undefined" && window.__tetrapodaCore;
        // KREATUR-LEBEN/SCHWIMM-HEIMAT — der Körper-Zustand des Halters
        // (updateCreatures stempelt ud._motionZustand) führt in der EINEN Brücke.
        const zust = (group.userData && group.userData._motionZustand) || null;
        const name = this._motionProfileName(moving, emotions, "kreatur", zust) || (moving ? "joy" : "idle");
        // Die Kern-Tafel ist die EINZIGE Basis: unbekannter Profil-Name → idle-Zeile; Kern kalt → keine
        // Animation.
        const MOT = core && core.MOTION;
        const P = this._motionStudioProfile(moving, emotions, zust) || (MOT && (MOT[name] || MOT.idle)) || null;
        if (!P) return;
        // DIE POSE IST KERN-GESETZ (w11-leib): tetrapoda `tierPose` — derselbe Leib im Labor worlds/tetrapoda
        return core.tierPose(this._tierWirt(), group, tb, t, walkPhase, moving, P, zust);
    }
    // DER WIRT DER TIER-POSE (tetrapoda `tierPose`, w11-leib): die THREE-Mathe der Welt, die Kreatur-Uhr, der Boden unter der
    // Pfote (`_kreaturFussBoden`), seine Neigung (`_gaitSohlenKipp` — EIN Gesetz für Mensch und Tier), die Gang-Zeile der
    // Welt-Schwere und der laute Bruch — einmal je Instanz, der Zwischenspeicher der Pose wohnt an ihm.
    _tierWirt() {
        return (
            this._tierWirtMemo ||
            (this._tierWirtMemo = {
                M3: THREE,
                nowS: () => this.state.creatureAnimationTime,
                boden: (group, x, z) => this._kreaturFussBoden(group, x, z),
                kipp: (x, z, gier, y, group) => this._gaitSohlenKipp(x, z, gier, y, group),
                zeile: () => this._gangZeile(false),
                bruch: (n) => AnazhRealm._kernPflichtBruch(n),
                tmp: {},
            })
        );
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
            // die Hüft-Höhe der Gestalt in Metern (das Gang-Gesetz misst die Schritt-Länge an ihr)
            const beinL = (new THREE.Vector3().setFromMatrixPosition(t0.teile.legHL.matrixWorld).y - t0.minY) * f2;
            group2.userData._tierBaum = {
                teile,
                tailSegs,
                f: f2,
                beinL,
                // das Quer-Maß der gezeichneten Gestalt: je Achse des Leibs der Radius, der sie dort deckt, je Hüft-Höhe
                quer: AnazhRealm._tierQuerMass(t0, f2, beinL),
                bein: window.__tetrapodaCore.tierBeinMass(THREE, t0, f2),
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
        return window.__tetrapodaCore.verhaltenHash(a, b);
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
        // eine Tätigkeit mit Aktion (ruhen, äsen) trägt sie ohne Pause: das ruhende Tier liegt, das äsende grast
        const fort = !!(Z && Z.aktion && Z.stimmung === mood);
        // DIE WAHL IST KERN-GESETZ (w11-leib, tetrapoda `verhaltenWahl` — dieselbe im Labor): Takt, Hash, Aktion
        const def = window.__tetrapodaCore.verhaltenWahl(V, mood, ud, i, nowS, fort);
        // hop: die Aktion springt — über das EINE Sprung-Gesetz (creatureJump: Höhe aus der Freude, Abflug √(2·g·h)); der
        // Würfel je Frame ist gefallen, ein Sprung startet nur hier.
        if (def && def.hop === true) this.creatureJump(creature);
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
        // DIE HALTUNG DES TAGS (w28-mensch-menge, koerper `tagesHaltung`): ein Gemüt mit `haltung` (der Bewohner,
        // `_bewohnerGemuet`) trägt nie den Kampf-Zustand des Spielers; im Stand steht es in der Haltung seines Akts, solange keine
        // Emotion über ihrer Schwelle die Zeile wählt (die Furcht schlägt die Arbeit)
        const eigen = !!emotions && emotions.haltung !== undefined;
        const zust = emotions && !eigen ? this._koerperKampfZustand() : null;
        let name = this._motionProfileName(moving, emotions, "koerper", zust);
        if (eigen && emotions.haltung && !moving && name === AnazhRealm.MOTION_PROFILE_MAP.koerper.idle)
            name = emotions.haltung;
        const p = m[name];
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
    // VOLL ODER NULL (w28-loop-wurf): die Prägung steht ÜBER dem Buch — ohne Buch gibt es keinen Satz, auch mit Prägung. Bis
    // hier trug der Leser bei kaltem Buch die Prägung ALLEIN (`{height}` ohne mass/tone): der Kern brach an ihr fail-closed
    // (`leibGroesse`, seit 4b1e4eee), der Restore eines Stands mit Mensch-Prägung rechnet die Lebenswerte vor dem Buch — die Welt
    // erwachte nie (kein Takt, main e699a834), und die Heimat ohne Foundry warf im Takt in die Fehler-Grenze des Loops (z385:
    // `tickPlayerBoosts` → `recomputePlayerStats`). Jetzt baut der Leib kalt aus den Konstanten, und das Buch gießt ihn EINMAL nach
    // (`_foundryIngestBook`), mit der Prägung. gate:studio-uebergabe (K)
    _koerperStudioDials() {
        const f = this._foundry;
        const rec = f && f.recipes ? f.recipes[AnazhRealm.KOERPER_HOST_RECIPE] : null;
        const s0 = rec && rec.s;
        const s = s0 && typeof s0 === "object" ? s0 : null;
        if (!s) return null;
        // DIE PRÄGUNG DES MENSCH-REZEPTS = VORRANG-Quelle (ws.studioOv, geschrieben vom EINEN Übergabe-Kanal und den
        // Werkstatt-Reglern): Dials und Gestalt-Wahlen ÜBER das Buch (bmDials → Mensch-Ofen-Memo-Key → bakeMenschInstance).
        // Beim Peer-Avatar-Guss FÜHRT die Prägung des SENDERS: _p2pApplyPeerSoul setzt sie transient in
        // this._activePeerUebergabe (try/finally; {} = der Peer ohne Prägung) — derselbe Merge, andere Quelle.
        const ue =
            this._activePeerUebergabe !== undefined && this._activePeerUebergabe !== null
                ? this._activePeerUebergabe
                : this._studioPraegung(AnazhRealm.KOERPER_HOST_RECIPE);
        return ue && Object.keys(ue).length ? Object.assign({}, s, ue) : s;
    }

    // Der Mensch hängt an derselben Größen-Achse: die koerperstudio-Dials tragen den Größen-Faktor in
    // _applySizeMultipliersToStats. Default-Dials (height 1.0 · mass 0.35 · tone 0.5) → EXAKT 1.0;
    // Spanne ≈ 0.63…1.61 (wie Custom-Avatare 0.7…1.7). Höhe quadratisch, Masse/Tonus linear-mild;
    // der Aufrufer dämpft per sqrt.
    // DIE GRÖSSE DES MENSCHEN aus seinen Dials (koerper-core `leibGroesse`, w4-koerper-park — dieselbe Zahl im Körper-Studio)
    _humanDialSizeFactor() {
        const s = this._koerperStudioDials();
        if (!s) return 1;
        return AnazhRealm._leibTakt().leibGroesse(s);
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
    return globalThis.__tetrapodaCore.lageTempo(dx, dz, dt);
};
// DIE WAHL DES GANGS — EINE für jedes Tier, ob Leib (`_animateTierBaum`) oder Satz (`_tierSatzSchritt`): das Tempo des Wegs
// geglättet (8/s, ein Takt zählt höchstens 0,1 s; ohne neue Lage `vLage` undefined bleibt es) und die Gangart des Gesetzes
// über die Hysterese der Gangart des Vor-Takts, auch des Stands (wer stand, läuft im Schritt an). `g` trägt beides (v, art);
// zurück kommt der Schritt des Gesetzes. Vorher wählte der Satz aus dem rohen Tempo und vergaß den Stand: ein Tier, das im
// Satz anlief, trabte bei Fr 0,55, wo sein Leib schreitet (gate:tier-gang: Satz − Labor 0,24–0,25 Zyklus, Tastgrad 0,53).
AnazhRealm._gangWahl = function (g, vLage, dt, laeuft, L, Z) {
    return globalThis.__tetrapodaCore.gangWahl(g, vLage, dt, laeuft, L, Z);
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
// DAS KNOCHEN-RASTER (`_ofenSkelett`): die Knochen-Reihe jeder Ofen-Haut ist ein Vielfaches davon. EINE Klasse für jeden Leib
// (w28-fell-programm): das größte Teil trägt 33 Knochen (Fuchs, Grobstufe) — mit 16 standen drei Klassen (16 · 32 · 48) und je
// Leib-Stoff bis zu drei Vertex-Programme, die nur die Zahl trennt; die Frost-Wand S2 nennt jeden solchen Zwilling mit seinen
// Knochenzahlen. Die Reihe kostet je Füllplatz 64 B Knochen-Matrix und eine Matrix-Multiplikation je Bild.
AnazhRealm.KNOCHEN_RASTER = 40;
// DIE KOPF-KLASSE (`_kopfKlasse`, mensch-kopf und haar): gelenk = die Gelenke des Kopfs (Kopf, Augen, Iris, Lider des Rigs) ·
// iris = das Gelenk, an dem ein Teil ohne Stoff-Klasse das Auge ist · anteil = ab diesem Anteil seiner Haut-Gewichte an ihnen
// gehört ein Teil zum Kopf — die Werte der Teilung, die bis w4-bewohner-wache in der Werkbank stand (haar.K2)
AnazhRealm.KOPF_TEILUNG = Object.freeze({
    gelenk: /^(head|eye[LR]|iris[LR]|lid[TB][LR])$/,
    iris: /^iris[LR]$/,
    anteil: 0.3,
});
// DAS HAAR IM WIND UND AM LEIB (haar.K3, `_haarWindKnoten`, `_haarFederTakt`): hebel = die Höhe, mit der die Strähne den EINEN
// Wind liest, je Meter ihrer Länge · reichweite = der Versatz der Spitze höchstens dieser Anteil der Länge · bezug = die Länge,
// für die die Feder rechnet (längere Strähnen schwingen weiter) · nah = bis hierher (m vom Auge) rechnet die Feder · flattern =
// die Anregung der Strähne über dem Wiegen: Weite (× die Wirkung des Winds), Teil-Frequenzen (Hz), Verstimmung der zweiten
// Achse · zug = die Zeitkonstante (s), mit der der Luft-Widerstand die leichte Strähne dem Wind nachführt (überdämpft: ohne
// Wind steht sie im nächsten Takt) · feder = der Schwinger der Spitze unter dem Leib: Eigenfrequenz hz, Dämpfung (Anteil der
// kritischen), Glättung des Tempos glatt (s), Deckel max (m) der ganzen Auslenkung. Bei 5,5 m/s wiegt die Spitze ±1,8 cm und flattert ±1,3 cm, bei sonnigen 0,4 m/s je ±1,5 mm.
AnazhRealm.HAAR_WIND = Object.freeze({
    hebel: 2.5,
    reichweite: 0.8,
    bezug: 0.04,
    nah: 30,
    flattern: Object.freeze({ staerke: 1.5, hz: Object.freeze([1.9, 3.1, 4.7]), quer: 1.13 }),
    zug: 0.02,
    feder: Object.freeze({ hz: 2.5, daempfung: 0.35, glatt: 0.06, max: 0.03 }),
});
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
// Die Zuordnung Profil → Rig wohnt im Gesetzbuch (koerper-core MOTION_RIG_MAP, w4-koerper-park): die Pose an Land
// (`leibRigPose`) liest sie in Welt und Körper-Studio.
AnazhRealm.MOTION_RIG_MAP = globalThis.__koerperCore.MOTION_RIG_MAP;
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
AnazhRealm.PLAYER_KH = globalThis.__koerperCore.LEIB.kopfM; // die Kopf-Einheit des Gesetzbuchs (koerper-core LEIB.kopfM)
