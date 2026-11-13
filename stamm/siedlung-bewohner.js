class AnazhRealm_siedlung_bewohner {
    // ===== ATLAS · Siedlung/bewohner — Bewohner · Tag · Wege · Tür · Gang im Satz · Kamin-Rauch =====
    // ═══ KAMIN-RAUCH ═══
    // Quellen aus Settlement-Einträgen mit rauchQuelle; Lab-Partikel (matte Box) wenn THREE+scene da,
    // sonst Quellen-Liste + einmaliger Log/Flugschreiber-Stempel. Invariante: Rauch ⟺ chimney.
    // Haus-Türen: _tickHausTueren dreht nahe Häuser (< 40 m) durch DENSELBEN _tickTorFluegel.
    _updateDorfRauch(dt) {
        // RAUCH_VIS.host = "weich": das Steigen und Vergehen des Labors (RAUCH_GESETZ), gezeichnet vom EINEN Rauch-Bild der Welt
        const st = this.state;
        if (!st) return;
        let dr = st.dorfRauch;
        if (!dr || typeof dr !== "object") {
            dr = st.dorfRauch = { quellen: [], teilchen: [] };
        }
        if (!Array.isArray(dr.quellen)) dr.quellen = [];
        if (!Array.isArray(dr.teilchen)) dr.teilchen = [];
        // Quellen neu aus Architectures mit rauchQuelle (world tip = origin + φ-rotate).
        const quellen = [];
        // die Kamine aus dem Verzeichnis (`_blockerMit("rauch")`, in der Ordnung des Bestands) — vorher je Frame jeder Eintrag
        const archs = Array.isArray(st.architectures) ? this._blockerMit("rauch") : null;
        if (archs) {
            for (let i = 0; i < archs.length; i++) {
                const e = archs[i];
                if (!e || !e.position) continue;
                const tip =
                    (e.userData && e.userData.rauchQuelle) ||
                    (e.chimney && Number.isFinite(e.chimney.x) ? e.chimney : null);
                if (!tip || !Number.isFinite(tip.x) || !Number.isFinite(tip.y) || !Number.isFinite(tip.z)) continue;
                const phi = Number.isFinite(e.rotationY) ? e.rotationY : 0;
                const c = Math.cos(phi);
                const s = Math.sin(phi);
                const ox = e.position.x || 0;
                const oz = e.position.z || 0;
                // Mesh-Fuß = position.y − 0.5 (spawnArchitecture-Kalibrierung); Lab y=0.
                const oy = (Number.isFinite(e.position.y) ? e.position.y : 0) - 0.5;
                quellen.push({
                    id: e.id,
                    x: ox + tip.x * c + tip.z * s,
                    y: oy + tip.y,
                    z: oz - tip.x * s + tip.z * c,
                });
            }
        }
        dr.quellen = quellen;
        if (quellen.length && !this._dorfRauchLogged) {
            this._dorfRauchLogged = true;
            try {
                this.log(`KAMIN-RAUCH: ${quellen.length} Quelle(n) live (chimney→rauchQuelle)`, "INFO");
            } catch (_e) {
                /* log optional */
            }
            try {
                const fr = st.flightRecorder;
                if (fr && typeof fr === "object") {
                    fr.rauchQuellen = quellen.length;
                    fr.rauchStamp = Date.now();
                }
            } catch (_e2) {
                /* flight recorder optional */
            }
        }
        const scene = st.scene;
        if (typeof THREE === "undefined" || !scene) {
            // Residual renderer: Quellen stehen; kein Mesh-Pfad (headless / no THREE).
            dr.teilchen.length = 0;
            return;
        }
        // Das Rauch-Gesetz wohnt im fachwerk-Gesetzbuch (EINE Quelle für Lab
        // und Welt) — fail-closed wie jeder Kern-Leser, kein Literal-Zwilling.
        const G =
            AnazhRealm.Gesetz("fachwerk:RAUCH_GESETZ", null) || AnazhRealm._kernPflichtBruch("fachwerk:RAUCH_GESETZ");
        // DER RAUCH JE KAMIN (w12-brand-rauch): das Labor zeigt EIN Haus — RAUCH_GESETZ trägt sein Steigen, Streuen, Wachsen und
        // Vergehen je Bild bei `RAUCH_BILD.labHz` und `maxTeilchen` je Kamin. Die Welt rechnet es in der Zeit (f = dt × labHz Bilder
        // des Labors: dasselbe Gefühl bei jeder Bildrate — bis w12-brand-rauch stieg der Rauch an der Radeon mit 120 Hz doppelt so
        // schnell) und gibt es den `kamine` Kaminen nächst dem Auge binnen `kamineM` (die Kosten trägt der Schirm) — bis dahin teilten
        // sich alle Kamine der Welt die 26 Teilchen eines Hauses (das Dorf der Mess-Orte, 34 Kamine: an keinem stand Rauch).
        // Ein Teilchen ist Daten (Lage, Größe, Deckkraft, Kamin, Same); ohne Quelle entsteht keins, die lebenden steigen weiter.
        const W = AnazhRealm.RAUCH_BILD;
        const auge = st.camera ? st.camera.position : st.playerMesh && st.playerMesh.position;
        const nah = auge
            ? quellen
                  .map((q) => [Math.hypot(q.x - auge.x, q.z - auge.z), q])
                  .filter(([d]) => d <= W.kamineM)
                  .sort((a, b) => a[0] - b[0])
                  .slice(0, W.kamine)
            : [];
        const s = Number.isFinite(dt) && dt > 0 ? Math.min(dt, 0.1) : 0;
        const f = s * W.labHz;
        const je = this._rauchJeKamin || (this._rauchJeKamin = new Map());
        je.clear();
        for (const t of dr.teilchen) je.set(t.q, (je.get(t.q) || 0) + 1);
        const p = 1 - Math.pow(1 - G.spawnChance, f);
        for (const [, qq] of nah)
            if ((je.get(qq.id) || 0) < G.maxTeilchen && Math.random() < p)
                dr.teilchen.push({
                    x: qq.x,
                    y: qq.y,
                    z: qq.z,
                    s: 1,
                    vy: G.vyBase + Math.random() * G.vyRange,
                    dx: (Math.random() - 0.5) * G.dxSpread,
                    a: G.a0,
                    q: qq.id,
                    saat: Math.random(), // das Muster des Teilchens (`_rauchZeichnen`)
                });
        // DER RAUCH DES FEUERS ZIEHT MIT DEM EINEN WIND (`_windAt` am Teilchen, die Bild-Uhr): der Wind trägt jedes Teilchen mit
        // seiner Geschwindigkeit in m/s × dt windab — in EIN Objekt je Bild gefragt (`_windAt` mit `aus`, w27-takt-gc). Es liest
        // die ANTWORT, nie das Objekt: im Spiel ist sie dasselbe, ein Leser, der den Wind umhüllt (gate:kopplung F3 „×0"), gibt
        // eine eigene — bis hier zog der Rauch am Objekt vorbei mit dem ungeformten Wind (L.rauch 1,75 → 1,75)
        const aus = this._rauchWind || (this._rauchWind = {});
        for (let k = dr.teilchen.length - 1; k >= 0; k--) {
            const T2 = dr.teilchen[k];
            const w = this._windAt(T2.x, T2.z, this._bildZeit, aus);
            T2.y += T2.vy * f;
            T2.x += T2.dx * f + w.x * w.ms * s;
            T2.z += w.z * w.ms * s;
            T2.a -= G.fade * f;
            T2.s *= Math.pow(G.scaleMul, f);
            if (T2.a <= G.aKill) dr.teilchen.splice(k, 1);
        }
        this._rauchZeichnen(G, dr.teilchen, "dorfRauchSatz", G.maxTeilchen * W.kamine);
    }

    // DAS EINE RAUCH-BILD (w12-brand-rauch): Kamin (`dorfRauchSatz`, RAUCH_GESETZ des Labors) und Fahne des Brands
    // (`brandRauchSatz`, BRAND.bild.rauch) zeichnen dasselbe Gesetz — je Satz EINE Instanz-Senke, je Teilchen eine Fläche
    // quer zur Sicht (`_rauchStoff`), ihr Radius G.size × s, ihr Ort, und im Attribut `aRauch` (je Instanz): seine Deckung a
    // im Kern (der Stoff liest sie als optische Dicke τ = −ln(1 − a), Beer-Lambert: Dichte × Weg, dünn am Rand), sein
    // Same (das Muster), sein Radius in Metern (der Saum gegen die Tiefe) und sein Alter als Weg der Ausdünnung von a0 bis
    // aKill. Bis w12-brand-rauch zeichnete der Kamin die Kiste des Labors und die Fahne facettierte Ikosaeder (fast deckend
    // braun, Kugelketten in der Luft, eine Kugelreihe am Boden). Gleichfarbige Teilchen mischen ohne Tiefen-Schreiben fast
    // unabhängig von der Reihenfolge — ohne Sortierung.
    _rauchZeichnen(G, teilchen, satz = "dorfRauchSatz", kap = G.maxTeilchen) {
        const st = this.state;
        let R = st[satz];
        if ((!R && !teilchen.length) || typeof THREE === "undefined" || !st.scene) return; // kein Rauch, kein Mesh
        if (!R || R.cap < kap) {
            if (R) {
                if (R.mesh.parent) R.mesh.parent.remove(R.mesh);
                this._instanzAbschied(R.mesh); // die Instanz-Puffer verlassen die GPU (W6, r184s Register)
                R.geo.dispose();
                R.mat.dispose();
            }
            const cap = kap;
            const geo = new THREE.PlaneGeometry(2, 2);
            const daten = new THREE.InstancedBufferAttribute(new Float32Array(4 * cap), 4);
            geo.setAttribute("aRauch", daten);
            const mat = this._rauchStoff(G);
            this._leuchtStoff(mat, null); // der Rauch streut das Licht des Feuers (K11, der Licht-Pool)
            const mesh = AnazhRealm._instanzMesh(geo, mat, cap);
            mesh.name = G.name || "dorf-rauch";
            mesh.userData.inventar = G.inventar || mesh.name; // Identitäts-Stempel (gate:asset-inventory: Welt-Substanz)
            mesh.castShadow = false;
            mesh.receiveShadow = false;
            AnazhRealm._instanzZahl(mesh, 0);
            st.scene.add(mesh);
            R = st[satz] = { mesh, geo, mat, daten, cap };
        }
        // je Teilchen nur Radius und Ort in seine Matrix (die Senke beginnt mit Einheits-Matrizen, die übrigen Glieder bleiben 0)
        const n = Math.min(teilchen.length, R.cap);
        const [M, d, weg] = [R.mesh.instanceMatrix.array, R.daten.array, Math.max(1e-6, G.a0 - G.aKill)];
        for (let k = 0; k < n; k++) {
            const t = teilchen[k];
            const r = G.size * t.s;
            const [o, i] = [16 * k, 4 * k];
            M[o] = M[o + 5] = M[o + 10] = d[i + 2] = r;
            M[o + 12] = t.x;
            M[o + 13] = t.y;
            M[o + 14] = t.z;
            d[i] = t.a;
            d[i + 1] = t.saat || 0;
            d[i + 3] = Math.min(1, Math.max(0, (G.a0 - t.a) / weg));
        }
        AnazhRealm._instanzZahl(R.mesh, n);
        if (n > 0) {
            R.mesh.instanceMatrix.needsUpdate = true;
            R.daten.needsUpdate = true;
            R.mesh.boundingSphere = null; // die Teilchen steigen: die Hülle folgt (three cullt die Wolke als Ganzes)
        }
    }

    // DER STOFF DES RAUCH-BILDS (`_rauchZeichnen`, RAUCH_BILD): die Fläche steht in den Achsen der Kamera (ihre Ecken ±1 längs
    // rechts und oben, `cameraWorldMatrix`; die Instanz trägt Radius und Ort — r184 rechnet den positionNode vor der Instanz,
    // Lehre 22). Ihre Dicke fällt zum Rand wie die Sehne einer weichen Kugel, (1 − ρ²)^profil, vom Rausch-Gesetz zerfasert —
    // zwei Ebenen des EINEN Rausch-Atlas, versetzt um den Samen, mit dem Alter steigend (`rausch`: Skala, Hub jung/alt, Zug);
    // die Deckung ist 1 − exp(−τ · Dicke) (Beer-Lambert) mal dem Saum gegen die Tiefe (`_tiefenSaum`, `saum` × Radius: kein Schnitt
    // an Gras und Boden). Das Licht ist das der Welt — Sonne, Himmel und Licht-Pool auf rau-Standard (Albedo G.color) —, die
    // Normale die einer gewölbten Scheibe zum Auge (`woelbung`): die Sonnenseite hell, die Schattenseite im Himmel.
    _rauchStoff(G) {
        const T = THREE.TSL;
        const W = AnazhRealm.RAUCH_BILD;
        const mat = new THREE.MeshStandardNodeMaterial({
            color: G.color,
            transparent: true,
            depthWrite: false,
            roughness: 1,
            metalness: 0,
        });
        const D = T.attribute("aRauch", "vec4");
        // die Dicke im Kern τ = −ln(1 − a) je Teilchen (im Vertex; die Deckung a höchstens `deckMax`)
        const tau = T.varying(T.float(1).sub(D.x.clamp(0, W.deckMax)).log().negate());
        mat.positionNode = T.cameraWorldMatrix.mul(T.vec4(T.positionGeometry.xy, 0, 0)).xyz;
        const q = T.uv().mul(2).sub(1);
        const ra = this._rauschAtlas();
        const [skala, hub, zug] = W.rausch;
        const p = q.mul(skala).add(T.vec2(D.y.mul(61.7), D.y.mul(29.3).sub(D.w.mul(zug))));
        const rausch = ra.ebene(p, 3, "y").add(ra.ebene(p.mul(2.03).add(T.vec2(17.1, 5.3)), 7, "y").mul(0.5));
        const faser = T.float(1).add(rausch.mul(D.w.mul(hub[1] - hub[0]).add(hub[0])));
        const dicke = T.float(1).sub(q.dot(q)).max(0).pow(W.profil).mul(faser.max(0));
        mat.opacityNode = T.float(1)
            .sub(T.exp(tau.mul(dicke).negate()))
            .mul(this._tiefenSaum(D.z.mul(W.saum)));
        mat.normalNode = T.vec3(q.mul(W.woelbung), 1).normalize();
        // jung dicht und dunkel (Ruß im Kern der Fahne), mit dem Alter heller: die Albedo × mix(dunkel, 1, Alter)
        mat.colorNode = T.vec4(T.materialColor.mul(T.mix(T.float(W.dunkel), T.float(1), D.w)), 1);
        return mat;
    }

    // ═══ DIE BEWOHNER (Meisterkarte mensch.K1): der Plan des Fachwerk-Studios wird Leib ═══
    // Jede Siedlung meldet sich, wo ihr Erlebnis steht (`_spawnSettlementErlebnis`: der Akt, der Dorf-Zug, der Wege-Rebuild nach
    // dem Reload — die EINE Stelle, an der die Welt eine Siedlung je Sitzung kennt). Ihre Bewohner sind eine FUNKTION des Plans
    // und keine Save-Byte: je stehendem Haus so viele, wie das Gesetzbuch nennt (fachwerk-core `leuteVon`), jeder aus dem
    // Genom-Roller (`_rollGenome`, Same „Plan:Haus:Person") und einer der Gestalten seiner Siedlung (`_bewohnerGestalten`); der
    // Leib ist der EINE Mensch-Bau (`_buildHumanGroup`: Mensch-Ofen, Gelenk-Gestalt mit Grobstufe, Rig) wie Spieler und
    // Mitspieler. Ihr Budget ist der Plan (Σ leute), nie der Tier-Deckel `maxCreatures`.
    _bewohnerMelden(plan, origin, key) {
        if (!plan || !Array.isArray(plan.slots) || !origin || !key) return;
        const B = this._bewohnerSiedlungen || (this._bewohnerSiedlungen = new Map());
        if (B.has(key)) return;
        B.set(key, { key, plan, ox: origin.x, oz: origin.z, liste: null, gestalten: null });
    }

    // DIE GESTALTEN EINER SIEDLUNG: `BEWOHNER.gestalten` Genome aus dem Samen des Plans (beide Geschlechter im Wechsel), je
    // Gestalt die Dials des Bauplans (`_koerperStudioDials` ohne die Übergabe des Spielers — der Sentinel des Mitspielers)
    // unter dem Genom, ihre Farben aus dem EINEN Farb-Münzer und die Ofen-Schlüssel beider Stufen — derselbe Merge wie der
    // Bau (`_buildHumanGroup` → `_buildHumanoidRig`), damit die Geburt das Memo warm trifft. DIE GESTALT IST DIE FORM (mensch.K4):
    // Geschlecht, Bau, Muskel, der Schnitt des Haars, seine Länge und Fülle, das Alter, das Gesicht (Auge, Mund, Braue, Haar-Ansatz:
    // koerper GESICHT_GENOM) — die Farben trägt jeder Bewohner aus seinem eigenen Samen (`_bewohnerGenome`, die Ton-Tafel); bis
    // mensch.K4 vier Gestalten, ein Schnitt; bis w7-gesicht trug jede Gestalt dasselbe Gesicht (Iris 0,00621–0,00625 Hk).
    // DIE GESTALT IST DIE NAH-WAHL (w26-leib-raum): die Gestalten tragen die Stufen 0 und 1 (`keys`) — die Menge (Stufen 2 und 3)
    // ist der Leib-Raum der Siedlung (`_bewohnerRaum`), jeder Bewohner dort sein eigener Punkt.
    _bewohnerGestalten(S) {
        const kc = window.__koerperCore;
        if (!kc || !kc.START_PARAMS) return AnazhRealm._kernPflichtBruch("koerper:START_PARAMS");
        const buch = this._bewohnerBuch();
        // DIE TRACHT DER EPOCHE (siedlung.K4): der Plan trägt die Kleidung seines Jahrs (fachwerk `kleidung`) — ihr Schnitt
        // kleidet jede Gestalt, die Farbe des Genoms fällt in ihre Farben
        const T = S.plan.kleidung;
        if (!T || !Array.isArray(T.farben) || !T.farben.length || !kc.CLOTH_COLORS)
            return AnazhRealm._kernPflichtBruch("fachwerk:kleidung");
        const tuch = Object.keys(kc.CLOTH_COLORS);
        const aus = [];
        for (let gi = 0; gi < AnazhRealm.BEWOHNER.gestalten; gi++) {
            const gen = this._rollHumanoidGenome(`${S.plan.seed >>> 0}:${gi}`);
            gen.sex = gi % 2 ? 0.75 + gen.sex * 0.25 : gen.sex * 0.25;
            const ov = Object.assign(this._bewohnerTracht(this._dialsAusGenom(gen), T, tuch), {
                hairStyle: gen.schnitt,
                hairLen: gen.haarLaenge,
                hairVol: gen.haarFuelle,
                age: gen.alter,
                auge: gen.auge,
                mund: gen.mund,
                braue: gen.braue,
                haaransatz: gen.haaransatz,
            });
            // DIE GESTALT GIESST IM KANON DES SKELETTS (w28-leib-genom, koerper BAU_GESETZ): sie ist die Form des Weichen — den Bau
            // trägt jeder Bewohner selbst auf seinen Knochen (`_bewohnerGeburt`), in der Menge sein Punkt im Leib-Raum
            for (const a of kc.BAU_GESETZ.achsen) delete ov[a.achse];
            const dB = Object.assign({}, buch || {}, ov);
            const dK = Object.assign({}, kc.START_PARAMS, dB);
            const f = this._menschGussFarben(dB);
            const keys = [0, 1].map((lod) => this._ofenMenschKey(dK, f.skin, f.hair, lod));
            aus.push({ gen, ov, dK, f, keys, bestellt: keys.map(() => false), lage: null, tonZeile: 0 });
        }
        return aus;
    }
    // Das Buch der Gestalt ohne die Übergabe des Spielers (der Sentinel des Mitspielers): die Dials des Bauplans jeder Gestalt und
    // der Vorlage der Siedlung
    _bewohnerBuch() {
        const alt = this._activePeerUebergabe;
        this._activePeerUebergabe = {};
        try {
            return this._koerperStudioDials();
        } finally {
            this._activePeerUebergabe = alt;
        }
    }
    // DER LEIB-RAUM EINER SIEDLUNG (w26-leib-raum, REFERENZ-ATLAS §4 — SMPL: ein Körper ist ein Punkt in EINEM Raum): die Menge (der
    // Satz, Stufen 2 und 3) ist EINE Vorlage in der Tracht ihres Plans, jede Achse des Raums am Mittel-Knoten (koerper
    // `leibRaumVorlage`, Höhe 1: die Größe jedes Bewohners trägt die Matrix seines Satzes), mit ihrer Formziel-Tafel aus dem Ofen —
    // und jeder Bewohner ihr Punkt (`_bewohnerGenome`: `raumPunkt` in der Zeile seiner Palette). Kein Guss je Gestalt: zwei
    // Vorlagen je Tracht, die das Memo teilt. Bis w26-leib-raum goss jede der 8 Gestalten beide Mengen-Stufen (16 Güsse je Siedlung),
    // und jeder Bewohner trug die nächste von ihnen.
    _bewohnerRaum(S) {
        const kc = window.__koerperCore;
        if (!kc || typeof kc.leibRaumVorlage !== "function" || !kc.CLOTH_COLORS)
            return AnazhRealm._kernPflichtBruch("koerper:leibRaumVorlage");
        const T = S.plan.kleidung;
        if (!T || !Array.isArray(T.farben) || !T.farben.length)
            return AnazhRealm._kernPflichtBruch("fachwerk:kleidung");
        const P = kc.START_PARAMS;
        const tracht = this._bewohnerTracht(
            { topColor: P.topColor, bottomColor: P.bottomColor, shoeColor: P.shoeColor },
            T,
            Object.keys(kc.CLOTH_COLORS)
        );
        const dB = Object.assign({}, this._bewohnerBuch() || {}, tracht, { height: 1 });
        const dK = kc.leibRaumVorlage(Object.assign({}, P, dB));
        const f = this._menschGussFarben(dB);
        const keys = [2, 3].map((lod) => this._ofenMenschKey(dK, f.skin, f.hair, lod));
        return { dK, f, keys, bestellt: keys.map(() => false), tonZeile: 0, pose: null };
    }
    // DIE TRACHT DER EPOCHE an einem Satz Dials: ihr Schnitt (fachwerk `kleidung`), die Farben des Genoms in ihre Farben
    _bewohnerTracht(d, T, tuch) {
        const ov = Object.assign(d, { top: T.top, bottom: T.bottom, shoes: T.shoes });
        for (const k of ["topColor", "bottomColor", "shoeColor"])
            if (!T.farben.includes(ov[k])) ov[k] = T.farben[Math.max(0, tuch.indexOf(ov[k])) % T.farben.length];
        return ov;
    }

    // DAS GENOM JEDES BEWOHNERS (mensch.K4, die EINE Quelle seines Leibs): sein Same („Plan:Haus:Person") rollt sein Genom
    // (`_rollHumanoidGenome`); er trägt die Gestalt seiner Siedlung, deren FORM seinem Genom am nächsten ist (Geschlecht, Bau,
    // Muskel, Kopf, der Schnitt des Haars, das Alter, das Gesicht — die Typen backt der Ofen, Lehre 23: die Befehle hängen an den Typen, nie an
    // der Kopfzahl), und seine eigenen Maße als Rest: die Höhe seines Genoms (`groesse` = seine Höhe ÷ die des Typs) und Breite
    // und Tiefe aus seinem Bau gegen den des Typs (`breite`, `tiefe`, je ±`restMax`). SEINE FARBEN sind seine eigenen: Haut, Haar
    // und die Farben seiner Tracht aus seinem Samen (`farben`), als Palette in der Ton-Tafel (`tonZeilen` [Kopf, Gestalt],
    // koerper `menschPalette`) — Leib, Satz und Feld zeigen sie (bis mensch.K4 trug jeder die Farben seiner Gestalt).
    _bewohnerGenome(S) {
        const BW = AnazhRealm.BEWOHNER;
        const kc = window.__koerperCore;
        if (typeof kc.menschPalette !== "function") return AnazhRealm._kernPflichtBruch("koerper:menschPalette");
        const ab = (a, t) =>
            3 * Math.abs(a.sex - t.sex) +
            Math.abs(a.build - t.build) +
            Math.abs(a.muscle - t.muscle) +
            Math.abs(a.headRatio - t.headRatio) / 0.24 +
            Math.abs(a.alter - t.alter) +
            (a.schnitt === t.schnitt ? 0 : 0.5) +
            0.25 * (Math.abs(a.auge - t.auge) + Math.abs(a.mund - t.mund) + Math.abs(a.braue - t.braue) + Math.abs(a.haaransatz - t.haaransatz)); // prettier-ignore
        if (typeof kc.leibRaumPunkt !== "function") return AnazhRealm._kernPflichtBruch("koerper:leibRaumPunkt");
        const rest = (x) => 1 + Math.max(-BW.restMax, Math.min(BW.restMax, x));
        const tuch = Object.keys(kc.CLOTH_COLORS);
        for (const G of S.gestalten)
            if (!G.tonZeile) G.tonZeile = this._tonZeile(kc.menschPalette(G.dK, G.f.skin, G.f.hair));
        // der Leib-Raum der Siedlung entsteht mit den Punkten ihrer Bewohner (`_bewohnerRaum`)
        const R = S.raum || (S.raum = this._bewohnerRaum(S));
        if (!R.tonZeile) R.tonZeile = this._tonZeile(kc.menschPalette(R.dK, R.f.skin, R.f.hair));
        for (const b of S.liste) {
            const gen = (b.genom = this._rollHumanoidGenome(b.seed));
            let best = 0;
            S.gestalten.forEach((G, gi) => {
                if (ab(gen, G.gen) < ab(gen, S.gestalten[best].gen)) best = gi;
            });
            const G = S.gestalten[best];
            const t = G.gen;
            b.gestalt = best;
            b.groesse = gen.kh / t.kh;
            b.breite = rest(BW.restBau[0] * (gen.build - t.build) + BW.restBau[1] * (gen.muscle - t.muscle));
            b.tiefe = rest(BW.restBau[2] * (gen.build - t.build) + BW.restBau[3] * (gen.muscle - t.muscle));
            const d = this._bewohnerTracht(
                {
                    skinTone: gen.skinTone,
                    hairColor: gen.hairColor,
                    topColor: gen.topColor,
                    bottomColor: gen.bottomColor,
                    shoeColor: gen.shoeColor,
                },
                S.plan.kleidung,
                tuch
            );
            b.farben = { skinTone: d.skinTone, hairColor: d.hairColor, topColor: d.topColor, bottomColor: d.bottomColor, shoeColor: d.shoeColor }; // prettier-ignore
            const f = this._menschGussFarben(d);
            // SEIN PUNKT IM LEIB-RAUM (w26-leib-raum): die Achsen seines Genoms — Geschlecht, Bau, Muskel, Alter, die Fülle und der
            // Ansatz des Haars, der Schnitt als Kappe (koerper `leibRaumPunkt`); seine Größe die Skala seines Satzes gegen die Vorlage
            const dP = Object.assign(this._dialsAusGenom(gen), {
                age: gen.alter,
                hairVol: gen.haarFuelle,
                haaransatz: gen.haaransatz,
                hairStyle: gen.schnitt,
            });
            b.raumPunkt = kc.leibRaumPunkt(dP);
            b.raumSkala = dP.height / R.dK.height;
            // SEIN BAU (w28-leib-genom): die Achsen seines Skeletts — der Punkt oben trägt sie in die Menge, die Geburt auf seine Knochen
            b.bau = Object.fromEntries(kc.BAU_GESETZ.achsen.map((a) => [a.achse, dP[a.achse]]));
            if (b.tonZeilen) this._tonZeileFrei(b.tonZeilen[0]);
            // seine Zeile trägt seine Palette und seinen Punkt; die Nah-Wahl und das Feld färben gegen die Gestalt, der Satz gegen
            // die Vorlage (`satzZeilen`)
            b.tonZeilen = [
                this._tonZeile(kc.menschPalette(Object.assign({}, G.dK, b.farben), f.skin, f.hair), b.raumPunkt),
                G.tonZeile,
            ];
            b.satzZeilen = [b.tonZeilen[0], R.tonZeile];
        }
    }

    // DIE LISTE DER BEWOHNER (einmal je Siedlung, wenn ihre Häuser stehen): je stehendem Haus (der Bau mit dem Samen des
    // Slots an seinem Ort) `leuteVon` Personen, jede mit den ORTEN ihres Tags (mensch.K2, koerper-core `tagesPlan`): die Tür
    // (drinnen), der Stand vor ihr (heim, vom Grundriss fort), ein Stand auf dem Dorfplatz des Plans (platz, zur Mitte
    // gewandt) und das Werk ihres Berufs (`berufVon`): die Station vor dem Haus ihrer Rolle (Schmiede, Kirche, Gasthaus — ein
    // zweiter Stand vor der eigenen Tür) · markt der Stand auf dem Platz · feld ein Stand im nächsten Acker des Plans · hof
    // der Stand vor der Tür. Jeder Stand ist frei: kein Grundriss eines Baus (`_imGrundriss`, mit dem Saum des Leibs), Land
    // (`_landAt`), der persönliche Raum (`BEWOHNER.raumM`) zu jedem anderen und ein Knoten des Wege-Netzes in gerader Linie
    // frei (die Frage von `_bewohnerAnschluss`: wer dort steht, geht von dort fort); wer im Ring um die Tür
    // keinen findet, steht weiter draußen — nie still weg. Wo er bei seiner Geburt steht, sagt die Uhr (`_bewohnerZiel`).
    // IN RATEN NACH ZEIT (Lehre 14: frame-adaptiv): jede Frage an das Netz, die nicht trägt, jede Probe eines Stands, die
    // nicht trägt, und jede Person geben den Takt zurück (`yield`), der Takt-Planer rechnet je Takt unter der EINEN Frist der
    // Bau-Arbeit (`_bewohnerWerkTakt`). Bis bewohner-takt gab sie ihn je Haus und je acht Besuche zurück, der Takt legte vier Häuser: am
    // Start-Dorf suchten acht Besuche 1,5 s, die längste Aufgabe des Bewohner-Takts trug 2,1 s (swiftshader kalt, Median aus 3)
    // — die Stände sind dieselben, die Rate ist die Zeit.
    *_bewohnerListe(S) {
        const FC = globalThis.__fachwerkCore;
        if (!FC || typeof FC.leuteVon !== "function") return AnazhRealm._kernPflichtBruch("fachwerk:leuteVon");
        const KC = window.__koerperCore;
        if (!KC || typeof KC.berufVon !== "function") return AnazhRealm._kernPflichtBruch("koerper:berufVon");
        const BW = AnazhRealm.BEWOHNER;
        const plan = S.plan;
        const belegt = new Map(); // das Raster des Raums (`frei`): je Zelle x, z, x, z …
        // DIE GASSE BLEIBT FREI (mensch.K3 Staffel 2): kein Stand näher als `gasseFreiM` an der Mitte einer Straße oder eines
        // Feldwegs des Plans — wer steht, steht am Rand, die Spuren der Gehenden (`spurM`) gehen an ihm vorbei
        const gassen = [];
        const knoten = []; // die Knoten des Wege-Netzes (`_bewohnerNetz`: je Punkt der Straßen und Feldwege)
        for (const rd of (plan.roads || []).concat(plan.feldwege || []))
            for (let i = 0; i < (rd.pts || []).length; i++) {
                const [a, e] = [rd.pts[i - 1], rd.pts[i]];
                if (e && Number.isFinite(e.x) && Number.isFinite(e.z)) knoten.push({ x: S.ox + e.x, z: S.oz + e.z });
                if (a && e) gassen.push([S.ox + a.x, S.oz + a.z, S.ox + e.x, S.oz + e.z]);
            }
        const G2 = BW.gasseFreiM * BW.gasseFreiM;
        // DAS RASTER DER GASSEN (Lehre 25: der billige Filter zuerst, nie über alle): jede Gasse liegt in jeder Zelle
        // (`gasseZelleM`), die ihr Rahmen samt `gasseFreiM` deckt — die Frage eines Punkts liest nur die Gassen seiner Zelle, das
        // Urteil je Gasse ist dasselbe. Bis hier ging jede Frage jede Gasse des Plans durch: an der Stadt (`dorf 7 120`, 531
        // Gassen) trug das Gesetz der Stände (`gilt`) 1,56 von 2,39 s einer ganzen Prüfung der Stände (Radeon, headless)
        const GZ = BW.gasseZelleM;
        const gassenRaster = new Map();
        for (const g of gassen) {
            const [ax, az, ex, ez] = g;
            for (
                let i = Math.floor((Math.min(ax, ex) - BW.gasseFreiM) / GZ);
                i <= Math.floor((Math.max(ax, ex) + BW.gasseFreiM) / GZ);
                i++
            )
                for (
                    let j = Math.floor((Math.min(az, ez) - BW.gasseFreiM) / GZ);
                    j <= Math.floor((Math.max(az, ez) + BW.gasseFreiM) / GZ);
                    j++
                ) {
                    const k = i * 2097152 + j;
                    const l = gassenRaster.get(k);
                    if (l) l.push(g);
                    else gassenRaster.set(k, [g]);
                }
        }
        const amWeg = (x, z) => {
            const zelle = gassenRaster.get(Math.floor(x / GZ) * 2097152 + Math.floor(z / GZ));
            if (!zelle) return false;
            const pkt = { minX: x, maxX: x, minZ: z, maxZ: z };
            return zelle.some(
                ([ax, az, ex, ez]) =>
                    x > Math.min(ax, ex) - BW.gasseFreiM &&
                    x < Math.max(ax, ex) + BW.gasseFreiM &&
                    z > Math.min(az, ez) - BW.gasseFreiM &&
                    z < Math.max(az, ez) + BW.gasseFreiM &&
                    this._streckeBoxAbstand2(pkt, ax, az, ex, ez) < G2
            );
        };
        // DER PUNKT VOR JEDER TÜR BLEIBT FREI (mensch.K3 Staffel 2): über ihn geht jeder hinein und hinaus (`vorM`). Die
        // Regeln der Liste lesen nur den Plan und seine Bauten — was der Wald-Takt später bringt (Baum, Busch, Fels), richtet
        // der Stand selbst (`_bewohnerStandPruefen`): die Liste nach der Abwesenheit ist dieselbe Funktion
        // DER RAUM (Lehre 25: der billige Filter zuerst, nie über alle): jeder vergebene Stand und der Platz vor jeder Tür
        // liegt im Raster von `raumM` — wer frei fragt, liest die 3 × 3 Zellen um sich statt aller Stände der Stadt
        const raumZelle = (ix, iz) => ix * 2097152 + iz;
        const legen = (x, z) => {
            const k = raumZelle(Math.floor(x / BW.raumM), Math.floor(z / BW.raumM));
            const l = belegt.get(k);
            if (l) l.push(x, z);
            else belegt.set(k, [x, z]);
        };
        const realm = this;
        const frei = function* (x, z, amRand = true) {
            const [ix, iz] = [Math.floor(x / BW.raumM), Math.floor(z / BW.raumM)];
            for (let i = -1; i <= 1; i++)
                for (let j = -1; j <= 1; j++)
                    for (let n = 0, l = belegt.get(raumZelle(ix + i, iz + j)) || []; n < l.length; n += 2)
                        if ((l[n] - x) ** 2 + (l[n + 1] - z) ** 2 < BW.raumM * BW.raumM) return false;
            if (amRand && amWeg(x, z)) return false;
            const g = realm._imGrundriss(x, z, BW.saumM);
            const q = { x, z };
            if (g === "haus" || g === "bau" || !realm._landAt(x, z, 0.2) || realm._bewohnerWand(q, q, true))
                return false;
            // DER STAND HÄNGT AM NETZ (siedlung.K3): am Hang lag der Stand des Besuchs hinter dem Haus, dessen Tür er besuchte —
            // frei, Land, ohne Wand, und keiner der `anschlussN` nächsten Knoten in gerader Linie frei (das Start-Dorf am Hang,
            // haus_schwarzwald #724672: vier Besuchs-Stände 16–20 m hinter seiner Rückwand, die Knoten jenseits). Der Weg
            // dorthin riss (`_bewohnerStrecke`: kein Weg), der Leib blieb am Acker stehen (wohnhaus/feld #45665: 80 % seiner
            // Soll-Orte, 54 m neben sich nach der Wiederkehr). Ohne Netz (ein Plan ohne Wege) trägt die Gerade allein. Je Frage an
            // das Netz ein Schritt der Liste (`yield`): eine Probe, die scheitert, fragt `anschlussN` Strecken — am Start-Dorf
            // 478 von 765 Proben, unter swiftshader-Last eine Probe bis 180 ms
            if (!knoten.length) return true;
            const nah = knoten
                .map((k) => ({ k, d: (k.x - x) ** 2 + (k.z - z) ** 2 }))
                .sort((a, b) => a.d - b.d)
                .slice(0, BW.anschlussN);
            for (const c of nah) {
                if (!realm._bewohnerWand(q, c.k)) return true;
                yield;
            }
            return false;
        };
        // DAS GESETZ DES STANDS (`gilt`): was er bei seiner Geburt hielt, hält er auch gerückt (`_bewohnerStandPruefen`) — die
        // Gasse frei (`amRand`), dazu das Gesetz seiner Art (`art`, der Platz); wie die Geburt steht er erst am Rand der Gasse,
        // dann auch in ihr, nie jenseits seiner Art
        const nimm = (o, amRand = true) => {
            if (!o) return o;
            legen(o.x, o.z);
            const art = (o.art = o.gilt || null);
            o.gilt = !amRand ? art : art ? (x, z) => art(x, z) && !amWeg(x, z) : (x, z) => !amWeg(x, z);
            return o;
        };
        const steht = new Map();
        for (const e of this.state.architectures || [])
            if (e && Number.isFinite(e.seed))
                steht.set(`${e.seed >>> 0}@${Math.round(e.position.x)},${Math.round(e.position.z)}`, e);
        const pz = plan.platz && Number.isFinite(plan.platz.cx) ? plan.platz : null;
        // der Stand auf dem Platz (ein gedrehtes Rechteck um seine Mitte, zur Mitte gewandt); ist er voll, der Rand des Platzes
        // (Ringe bis `platzRandM` um das Rechteck, zur Mitte gewandt), dann der Rand seiner Gassen (die Straßen des Plans bis
        // `platzRandM` vom Rand, je Seite neben der Fahrbahn, dem Gegenüber zugewandt) — wem der Tag den Platz gibt, der steht dort
        const platzStand = function* (g) {
            if (!pz) return null;
            const pc = Math.cos(pz.phi || 0);
            const ps = Math.sin(pz.phi || 0);
            const mx = S.ox + pz.cx;
            const mz = S.oz + pz.cz;
            const zurMitte = (x, z) => Math.atan2(mx - x, mz - z) + (g.axis("dreh") - 0.5) * 2.4;
            // DAS GESETZ DES PLATZ-STANDS: höchstens `platzRandM` vom Rechteck (`gilt`) — es gilt auch dem gerückten
            // (`_bewohnerStandPruefen`), und sein Blick dreht um den Punkt, auf den er sieht (`anker`: die Mitte, das Gegenüber)
            const amPlatz = (x, z) => {
                const lx = (x - mx) * pc - (z - mz) * ps;
                const lz = (x - mx) * ps + (z - mz) * pc;
                return (
                    Math.hypot(Math.max(0, Math.abs(lx) - pz.ex), Math.max(0, Math.abs(lz) - pz.ez)) <= BW.platzRandM
                );
            };
            const mitte = { x: mx, z: mz };
            const stand = (x, z, blick, amRand, anker = mitte) => nimm({ x, z, blick, anker, gilt: amPlatz }, amRand);
            // erst am Rand der Gassen (Platz, sein Rand, die Gassen an ihm), dann auch in ihnen
            for (const amRand of [true, false]) {
                for (let v = 0; v < 64; v++) {
                    const lx = (g.axis("px" + v) * 2 - 1) * pz.ex;
                    const lz = (g.axis("pz" + v) * 2 - 1) * pz.ez;
                    const x = mx + lx * pc + lz * ps;
                    const z = mz - lx * ps + lz * pc;
                    if (yield* frei(x, z, amRand)) return stand(x, z, zurMitte(x, z), amRand);
                    yield;
                }
                for (let v = 0; v < 192; v++) {
                    const rand = 0.6 + ((v >> 5) / 5) * BW.platzRandM * 0.5;
                    const ex = pz.ex + rand;
                    const ez = pz.ez + rand;
                    let u = g.axis("pr" + v) * 4 * (ex + ez);
                    let lx;
                    let lz;
                    if (u < 2 * ex) [lx, lz] = [u - ex, ez];
                    else if ((u -= 2 * ex) < 2 * ez) [lx, lz] = [ex, u - ez];
                    else if ((u -= 2 * ez) < 2 * ex) [lx, lz] = [ex - u, -ez];
                    else [lx, lz] = [-ex, ez - (u - 2 * ex)];
                    const x = mx + lx * pc + lz * ps;
                    const z = mz - lx * ps + lz * pc;
                    if (yield* frei(x, z, amRand)) return stand(x, z, zurMitte(x, z), amRand);
                    yield;
                }
                for (const rd of plan.roads || [])
                    for (let i = 1; i < (rd.pts || []).length; i++) {
                        const a = rd.pts[i - 1];
                        const e = rd.pts[i];
                        const l = Math.hypot(e.x - a.x, e.z - a.z);
                        if (!(l > 0.5)) continue;
                        const nx = -(e.z - a.z) / l;
                        const nz = (e.x - a.x) / l;
                        // das Stück fern vom Platz zieht keine Würfe (Lehre 25): sein Kasten im Raum des Platzes, um den Abstand
                        // der Seite gewachsen, liegt weiter als `platzRandM` vom Rechteck — kein Punkt auf ihm steht am Platz
                        const ecken = [a, e].map((q) => [S.ox + q.x - mx, S.oz + q.z - mz]);
                        const [kx, kz] = [0, 1].map((m) =>
                            ecken.map(([x, z]) => (m ? x * ps + z * pc : x * pc - z * ps))
                        );
                        const fernX = Math.max(0, Math.min(...kx) - pz.ex, -pz.ex - Math.max(...kx));
                        const fernZ = Math.max(0, Math.min(...kz) - pz.ez, -pz.ez - Math.max(...kz));
                        if (Math.hypot(fernX, fernZ) > BW.platzRandM + (rd.w || 3) / 2 + 0.81) continue;
                        for (let v = 0; v < 12; v++) {
                            const t = g.axis("gt" + i + ":" + v);
                            const sd = g.axis("gs" + i + ":" + v) < 0.5 ? -1 : 1;
                            const qx = S.ox + a.x + (e.x - a.x) * t;
                            const qz = S.oz + a.z + (e.z - a.z) * t;
                            const o = (rd.w || 3) / 2 + 0.8;
                            const x = qx + sd * nx * o;
                            const z = qz + sd * nz * o;
                            if (!amPlatz(x, z)) continue;
                            if (yield* frei(x, z, amRand))
                                return stand(x, z, Math.atan2(-sd * nx, -sd * nz), amRand, {
                                    x: qx - sd * nx * o,
                                    z: qz - sd * nz * o,
                                });
                            yield;
                        }
                    }
            }
            return null;
        };
        // der Stand im Ring vor der Tür (`wort` trennt den Heim-Stand von der Station des Werks) — am Rand der Gasse; wo der Ring
        // das nicht trägt, in der Gasse und in weiteren Ringen; `gilt` (x, z): was der Stand darüber hinaus tragen muss
        const ringStand = function* (g, wort, tx, tz, ux, uz, gilt = null) {
            for (const amRand of [true, false])
                for (let v = 0; v < (amRand ? 64 : 128); v++) {
                    const vor = 1.2 + (v >> 3) * 1.5 + g.axis(wort + "vor" + v) * 2;
                    const quer = (g.axis(wort + "quer" + v) * 2 - 1) * (2 + (v >> 3));
                    const x = tx + ux * vor - uz * quer;
                    const z = tz + uz * vor + ux * quer;
                    if (gilt && !gilt(x, z)) continue;
                    if (yield* frei(x, z, amRand))
                        return nimm(
                            {
                                x,
                                z,
                                blick: Math.atan2(ux, uz) + (g.axis(wort + "dreh") - 0.5) * 1.6,
                                anker: { x: tx, z: tz }, // er sieht von seiner Tür fort
                            },
                            amRand
                        );
                    yield;
                }
            return null;
        };
        // der Stand im nächsten Acker (fachwerk: die lange Achse des Ackers längs cos/sin seines phi)
        const aecker = (plan.felder || []).filter((f) => f && Number.isFinite(f.cx) && Number.isFinite(f.ex));
        const feldStand = function* (g, tx, tz) {
            let F = null;
            let fd = Infinity;
            for (const f of aecker) {
                const d = (S.ox + f.cx - tx) ** 2 + (S.oz + f.cz - tz) ** 2;
                if (d < fd) {
                    fd = d;
                    F = f;
                }
            }
            if (!F) return null;
            const c = Math.cos(F.phi || 0);
            const s = Math.sin(F.phi || 0);
            for (let v = 0; v < 16; v++) {
                const lx = (g.axis("fx" + v) * 2 - 1) * F.ex * 0.85;
                const lz = (g.axis("fz" + v) * 2 - 1) * F.ez * 0.85;
                const x = S.ox + F.cx + lx * c - lz * s;
                const z = S.oz + F.cz + lx * s + lz * c;
                if (yield* frei(x, z)) return nimm({ x, z, blick: g.axis("fdreh") * Math.PI * 2 });
                yield;
            }
            return null;
        };
        // DIE TÜREN der stehenden Häuser (die Tür, die Richtung aus dem Haus, die Rolle) — die Tür des Heims und die des Besuchs
        const tueren = [];
        for (const [si, sl] of plan.slots.entries()) {
            const wx = S.ox + sl.x;
            const wz = S.oz + sl.z;
            const haus = steht.get(`${sl.seed >>> 0}@${Math.round(wx)},${Math.round(wz)}`);
            if (!haus) continue; // kein Haus, keine Leute
            const c = Math.cos(sl.phi || 0);
            const s = Math.sin(sl.phi || 0);
            const tu = sl.tuer || { x: 0, z: 0 };
            const tx = wx + tu.x * c + tu.z * s;
            const tz = wz - tu.x * s + tu.z * c;
            const mx = sl.obb ? S.ox + sl.obb.cx : wx;
            const mz = sl.obb ? S.oz + sl.obb.cz : wz;
            const ul = Math.hypot(tx - mx, tz - mz) || 1;
            tueren.push({ si, sl, haus, tx, tz, ux: (tx - mx) / ul, uz: (tz - mz) / ul });
        }
        for (const T of tueren) legen(T.tx + T.ux * BW.vorM, T.tz + T.uz * BW.vorM);
        // DER REST DES WERKS (`_weltOffen` leute): je Person ihr Stand und ihr Besuch — er fällt mit jedem gestellten
        S.listeRest = 2 * tueren.reduce((a, T) => a + Math.max(0, FC.leuteVon(T.sl.ov) | 0), 0);
        // DER BESUCH (koerper-core `tagesPlan`, mensch.K3 Staffel 2): ein Stand vor der Tür eines anderen Hauses, aus dem Samen
        // unter denen, die `besuchM` fern von seiner Tür und der Mitte des Platzes liegen und höchstens `besuchWeitM` fern von
        // ihnen und seinem Werk (der Plan hält ihn `besuchH` dort: der Gang hin trägt nur einen Teil davon, er kommt an und
        // steht), sonst vor der nächsten der fernen, sonst vor der fernsten — gewählt, wenn jeder seinen Stand vor der eigenen
        // Tür, am Platz und am Werk hat (der Besuch nimmt keinem den Platz). Bis mensch.K3 Staffel 2 galt keine Obergrenze: der
        // Markthändler #85460 der Stadt ging 127 m in der Stunde seines Besuchs und kam nie an. DER STAND TRÄGT DIE FERNE
        // (siedlung.K3): `besuchM` misst der Stand selbst, nicht nur die Tür, vor der er liegt — am Hang drängten sich drei Türen
        // um eine Gasse, der Ring vor ihnen wuchs bis 25 m, und der Besuch des Gasthauses #419347 lag 31,8 m von seiner Tür
        // (der Tag 95 m, Soll ≥ 100); die weite Tür hält ihn auch in `besuchWeitM` (der Markthändler oben). Nur der Rest
        // (keine ferne Tür) steht, wo sein Ring ihn trägt.
        const mitte = pz ? { x: S.ox + pz.cx, z: S.oz + pz.cz } : null;
        const besuchStand = function* (g, T, W) {
            const ab = (h, o) => (o ? Math.hypot(h.tx - o.x, h.tz - o.z) : NaN);
            const fern = (h) => Math.min(Math.hypot(h.tx - T.tx, h.tz - T.tz), mitte ? ab(h, mitte) : Infinity);
            const reich = (h) => Math.max(Math.hypot(h.tx - T.tx, h.tz - T.tz), ab(h, mitte) || 0, ab(h, W) || 0);
            const andere = tueren.filter((h) => h !== T).sort((a, b) => fern(b) - fern(a));
            const weit = andere.filter((h) => fern(h) >= BW.besuchM && reich(h) <= BW.besuchWeitM);
            const fernNah = andere
                .filter((h) => fern(h) >= BW.besuchM && !weit.includes(h))
                .sort((a, b) => reich(a) - reich(b));
            const k = weit.length ? g.int("besuch", 0, weit.length - 1) : 0;
            const rest = andere.filter((h) => fern(h) < BW.besuchM);
            // der Stand trägt dieselben Grenzen wie die Tür, vor der er liegt (die weite: fern und reich, die ferne: fern)
            const pkt = (x, z) => ({ tx: x, tz: z });
            const fernStand = (x, z) => fern(pkt(x, z)) >= BW.besuchM;
            const weitStand = (x, z) => fernStand(x, z) && reich(pkt(x, z)) <= BW.besuchWeitM;
            for (const h of weit.slice(k).concat(weit.slice(0, k), fernNah, rest)) {
                const gilt = weit.includes(h) ? weitStand : fernNah.includes(h) ? fernStand : null;
                const o = yield* ringStand(g, "b", h.tx, h.tz, h.ux, h.uz, gilt);
                if (o) return o;
            }
            return null;
        };
        const liste = [];
        const besuche = [];
        for (const T of tueren) {
            const { si, sl, haus, tx, tz, ux, uz } = T;
            const n = FC.leuteVon(sl.ov);
            if (!(n > 0)) continue;
            const rolle = typeof sl.rolle === "string" ? sl.rolle : "wohnhaus";
            const tuer = { x: tx, z: tz, blick: Math.atan2(-ux, -uz), haus };
            const vor = { x: tx + ux * BW.vorM, z: tz + uz * BW.vorM };
            for (let k = 0; k < n; k++) {
                yield;
                S.listeRest--;
                const g = this._rollGenome(`${plan.seed >>> 0}:${si}:${k}`, "bewohner");
                const same = Math.floor(g.axis("tag") * 4294967296) >>> 0;
                const beruf = KC.berufVon(same, rolle);
                const heim = yield* ringStand(g, "", tx, tz, ux, uz);
                if (!heim) {
                    this._bruchMelden(
                        `BEWOHNER: ${rolle} #${sl.seed >>> 0} in „${plan.name || "?"}" — kein freier Stand vor der Tür`
                    );
                    continue;
                }
                const platz = yield* platzStand(g);
                const werk =
                    beruf === "markt"
                        ? platz
                        : beruf === "feld"
                          ? yield* feldStand(g, tx, tz)
                          : beruf === "hof"
                            ? null
                            : (yield* ringStand(g, "w", tx, tz, ux, uz)) || heim; // die Station, sonst sein Stand vor der Tür
                // DIE EINE GESTALT DES BEWOHNERS (Lehre 25): der Satz trägt ab seiner Geburt jedes Feld, das ein Takt je an ihm
                // schreibt (ungesetzt `undefined`, wie ein fehlendes) — so teilen alle Sätze EINE versteckte Klasse, und jeder Zugriff
                // der Schleifen des Takts liest an fester Stelle. Bis hier trug der Satz 11 Felder, die übrigen ~60 schrieb der Takt in
                // der Reihe seiner Geschichte nach (an stadt-voll 19 Gestalten unter 1 096 Sätzen, ein Nachtrag über
                // `Object.assign` kippt ihn ins Wörterbuch): `_tickBewohner` trug 0,68 ms Selbst-Zeit je Bild, die Hälfte davon
                // Zugriffe wie `b.leib` und `b.d2`. Ein Literal (kein Spread: der trüge die Felder wieder einzeln nach); die Zeilen:
                // wer er ist · der Leib (`_bewohnerGenome`, `_bewohnerGeburt`) · der Takt der Köpfe und sein Raster
                // (`_tickBewohner`, `_bewohnerRasterLage`) · der Tag (`_bewohnerZiel`, `_bewohnerAnkunft`) · der Gang (`_bewohnerWeg`,
                // `_bewohnerGehen`, `_bewohnerSchritt`, `_gaitTick`) · am Steuer (`_verkehrAnlegen`).
                const u = undefined;
                // prettier-ignore
                liste.push({
                    heim: sl.seed >>> 0, rolle, beruf, same, orte: { tuer, vor, heim, platz, werk, besuch: null },
                    seed: `${plan.seed >>> 0}:${si}:${k}`, atem: g.axis("atem") * 10, leib: null, uhr: 0, takt: 0, frist: null,
                    genom: u, gestalt: u, groesse: u, breite: u, tiefe: u, farben: u, tonZeilen: u, beinL: u, tempo: u, satzOrt: u,
                    nr: u, ruht: u, rk: u, uhrAb: u, animDt: u, d2: u, kreis: u, nah: u, lageNeu: u, ankunft: u, x: u, z: u,
                    blick: u, begegnet: u, kopfY: u,
                    ziel: u, akt: u, drinnenSoll: u, drinnen: u, da: u, hinaus: u, stand: u, tagVon: u, tagAb: u, zielUhr: u,
                    drehen: u, platz: u,
                    weg: u, wi: u, linie: u, tag: u, wegRest: u, wegRestAb: u, gegangen: u, gehDt: u, gehTakt: u, rueck: u,
                    tempoTag: u, tempoJetzt: u, vx: u, vz: u, grundX: u, grundZ: u, grundH: u, _gait: u, _gaitW: u, walkPhase: u,
                    wagen: u, amSteuer: u,
                });
                besuche.push([g, T, werk]);
            }
        }
        for (const [i, b] of liste.entries()) {
            yield;
            S.listeRest--;
            b.orte.besuch = yield* besuchStand(...besuche[i]);
        }
        S.listeRest = 0;
        return liste;
    }

    // DIE HÄUSER STEHEN MIT IHRER HÜLLE (siedlung.K3): die Liste entsteht, wenn jedes Haus ihres Plans seine Studio-Hülle trägt
    // (`_hausHuelleSetzen`: die Boxen seiner Wände im Blocker-Netz) — ihre Regeln fragen die Wände (`frei`, die Linie zum Netz).
    // Bis siedlung-k3-hang entstand die erste Liste vor den Hüllen (das Start-Dorf am Hang: 18 von 18 Häusern ohne Hülle), jede
    // nach einer Abwesenheit mit ihnen: die erste stellte Stände hinter Hauswände, die zweite andere (die Wiederkehr 21 m).
    // Es wartet jedes Haus, dessen Hülle kommt: gezeichnet oder in der Mesh-Zone (`architectureCullingRadius`) — ein kaltes
    // Haus jenseits trägt seine Hülle erst, wenn der Spieler naht, dann prüft die Wache (`_bewohnerWechsel`) die Stände um
    // es. Bis w3u-stadt-leben wartete die Liste auf jedes Haus: die Metropole an stadt-voll (295 Häuser bis 409 m vom Markt,
    // 165 kalt) blieb ohne einen Bewohner.
    _bewohnerHuellenDa(S) {
        const samen = S.hausSamen || (S.hausSamen = new Set(S.plan.slots.map((sl) => sl.seed >>> 0)));
        const [p, R] = [this.state.playerMesh.position, this.state.architectureCullingRadius];
        for (const e of this.state.architectures || [])
            if (
                e &&
                e.tuer &&
                samen.has(e.seed >>> 0) &&
                !e._hausHuelle &&
                (this._archIsRendered(e) || (e.position.x - p.x) ** 2 + (e.position.z - p.z) ** 2 <= R * R)
            )
                return false;
        return true;
    }

    // DIE VORLAGEN DER GESTALTEN im Faden (der Mensch-Ofen der Foundry, nah zuerst — nie ein Guss im Haupt-Faden): je Stufe
    // EIN Auftrag; die Antwort legt die Vorlage `fest` ins Memo (die Geburt bindet sie, `_bewohnerFort` gibt sie frei).
    // Die Vorlagen des Leib-Raums (Stufen 2 und 3, `_bewohnerRaum`) gehen denselben Weg.
    _bewohnerVorlagen(S, wo) {
        const memo = AnazhRealm._tierOfenMemo || (AnazhRealm._tierOfenMemo = new Map());
        for (const [G, stufe0] of [...S.gestalten.map((G) => [G, 0]), [S.raum, 2]])
            for (let i = 0; i < G.keys.length; i++) {
                const key = G.keys[i];
                const lod = stufe0 + i;
                if (G.bestellt[i] || memo.has(key)) continue;
                G.bestellt[i] = true;
                this._foundryRequest(
                    "mensch",
                    0,
                    lod,
                    { dials: G.dK, skinColor: G.f.skin, hairColor: G.f.hair },
                    this._foundryRang(wo, false)
                ).then((meshes) => {
                    if (!meshes || !meshes.length) {
                        // gebrochen (`_foundryRequest`, `f.gebrochen`): er bleibt bestellt — die Welt nennt den Grund; sonst (kalt) neu
                        const f = this._foundry;
                        G.bestellt[i] = !!(f && f.gebrochen && f.gebrochen.size);
                        return this._bruchMelden(`BEWOHNER: der Mensch-Ofen lieferte die Gestalt nicht (lod ${lod})`);
                    }
                    if (S.gestalten === null) return; // die Siedlung ging, bevor die Vorlage kam
                    this._ofenVorlage(key, false, () => this._ofenAssembleAsset(meshes), true);
                });
            }
    }

    // DIE GEBURT EINES BEWOHNERS: der EINE Mensch-Bau unter den Dials seiner Gestalt (die Übergabe des Spielers ruht — der
    // Sentinel des Mitspielers), die Marke seines Hauses (`heim`), der Fern-Satz je Gestalt (`gattung`), sein Stand auf dem
    // Gesetz (Lehre 22: die Sohle liegt PLAYER_FOOT_OFFSET unter dem Ursprung des Leibs). Er hält seine Haltung jenseits der
    // Stufen-Grenze (`haltungFest`: kein Sprung in die A-Pose der Vorlage); die Glieder der Gestalt (`_tierBaum`: Teile, Hülle,
    // Ruhe) trägt der Glieder-Satz des Welt-March (`_kzLeib`).
    _bewohnerGeburt(S, b) {
        const G = S.gestalten[b.gestalt];
        const alt = this._activePeerUebergabe;
        this._activePeerUebergabe = {};
        let g = null;
        try {
            g = this._buildHumanGroup(G.ov);
        } finally {
            this._activePeerUebergabe = alt;
        }
        const gl = g && g.userData._gelenk;
        if (!g || !g.userData.rig || !gl) {
            b.leib = false;
            if (g) this._disposeSoulGroup(g);
            return this._bruchMelden(`BEWOHNER: der Mensch-Bau lieferte keinen Leib („${S.plan.name || "?"}")`);
        }
        g.name = "bewohner";
        g.userData.heim = b.heim;
        g.userData.gattung = `mensch:${S.key}:${b.gestalt}`;
        g.scale.setScalar(b.groesse);
        // Breite und Tiefe seines Genoms tragen die Hüllen (im Raum des Leibs, nach der Haut — wie die Matrix seines Satzes);
        // das Rig, die Glieder des Felds und der Stand bleiben in seiner Höhe. SEINE FARBEN (mensch.K4): jedes Teil liest seine
        // Palette aus der Ton-Tafel (`userData.__ton` [Kopf, Gestalt], `_tonFaktor`), das Feld seine Glieder (`_tonFeldFarbe`)
        g.userData.__tonZeilen = b.tonZeilen;
        g.traverse((n) => {
            if (n.isSkinnedMesh) n.scale.set(b.breite, 1, b.tiefe);
            if (n.isMesh) n.userData.__ton = b.tonZeilen;
        });
        this._bewohnerStellen(b, g, b.x, b.z);
        g.rotation.y = b.blick;
        gl.haltungFest = true;
        const teile = {};
        gl.nah.traverse((n) => {
            if ((n.isGroup || n.isBone) && n.name) teile[n.name] = n;
        });
        // SEIN BAU AUF SEINEN KNOCHEN (w28-leib-genom, koerper BAU_GESETZ): der Guss seiner Gestalt steht im Kanon des Skeletts — die
        // Knochen DIESES Leibs stehen in der Ruhe seines eigenen Baus (koerper `leibBauAuf`: dasselbe Gesetz, das den Guss und die
        // Tafel der Menge stellt — die Glieder in ihrer Länge, die Schulter in Abstand und Höhe, die Arme in der Ruhe an seinem
        // Rumpf); die Ruhe der Gelenk-Gestalt (`_gelenkRuhe`) und des Rigs merken sie. Gang, Feld und Stand lesen diese Knochen.
        // (DAS TEMPO SEINES TAGS misst an der Beinlänge seiner Gestalt, vor seinem Bau — unten: die Wiederkehr der Bewohner hält es)
        const beinTag = this._gaitBeinMass(g.userData.rig).L;
        delete g.userData.rig._beinMass;
        const kc = window.__koerperCore;
        if (!G.bauRuhe) G.bauRuhe = kc.leibBauRuhe(G.dK);
        kc.leibBauAuf(teile, G.bauRuhe, kc.leibBauRuhe(Object.assign({}, G.dK, b.bau)), g.userData.rig);
        for (const e of gl.ruhe || []) (e[1].copy(e[0].position), e[2].copy(e[0].quaternion));
        const ruhe = {};
        for (const [k, p, q, s] of gl.ruhe || []) if (k.name) ruhe[k.name] = { position: p, quaternion: q, scale: s };
        g.userData._tierBaum = { teile, wrap: gl.nah.parent, ruhe };
        // DER LEIB OHNE SZENEN-GANG (die Klasse der Ruhe, K59: `_ruhendeWurzel`): seine Matrizen stehen, der Szenen-Gang
        // überspringt ihn; was ihn bewegt (Atem, Gang, Schritt — `_tickBewohner`), zieht sie selbst nach (`_leibMatrix`)
        g.updateMatrixWorld(true);
        g.updateMatrixWorld = AnazhRealm._ruhendeWurzel;
        // DAS TEMPO DES GANGS (mensch.K2): die Tempo-Einheit des Steuer-Gesetzes an seiner Beinlänge × `gang` des Tags. Die
        // Beinlänge seiner GESTALT in seiner Größe (`beinTag`), nicht die seines Baus (w28-leib-genom): der Schritt seines Gangs
        // liest sein wahres Bein am Rig (`_gaitBeinMass`, kein Gleiten), das Tempo seines Tags bliebe mit ihm ±1,3 % je σ — und
        // die Ankunft spielt einen Weg nicht tempo-treu nach: am wahren Bein riss die Wiederkehr an 1 von 1296 (2,674 m über
        // ±2 m, gate:kreatur-takt bewohner — derselbe Bewohner, der an der Achse des Kopfs riss). Diese Wurzel steht offen.
        b.beinL = Math.max(0.3, beinTag);
        b.tempo = globalThis.__tetrapodaCore.tempoEinheit(b.beinL) * window.__koerperCore.TAGES_GESETZ.gang;
        // DER WURF IST DER SATZ (`_bewohnerSatz`): kein Teil des Leibs wirft, auch der nahe nicht — die Kaskaden zeichnen jeden
        // Bewohner im Nah-Kreis aus dem Wurf-Satz seiner Gestalt; sichtbar wird der Leib erst durch die Nah-Wahl (`_tickBewohner`)
        g.traverse((n) => {
            if (n.isMesh) n.castShadow = false;
        });
        g.visible = false;
        g.userData._menge = true; // der Mensch der Menge: sein Feld wählt das Stufen-Gesetz am Schirm (`_feldGrenzen`)
        this.state.scene.add(g);
        b.leib = g;
        if (S.satz === null) S.satz = this._bewohnerSatz(S, b);
        // DIE LAGEN SEINER GESTALT (das Feld, `_bewohnerFeldLage`): der Gang ihrer Glieder je Gestalt, der Stand sofort
        if (G.lage === null) {
            G.lage = { n: AnazhRealm.BEWOHNER.gangPhasen, gebacken: 0, fertig: false, tempo: b.tempo, gang: null };
            this._bewohnerGangPose(g, G.lage, G.lage.n, null);
        }
    }

    // DER STAND DES LEIBS an (x, z): auf dem Boden jedes Körpers (Q4: die Fels-Grenze, nie das Dach), an der Tür auf ihrer
    // Stufe (`_bewohnerTritt`) — die Sohle PLAYER_FOOT_OFFSET unter dem Ursprung (Lehre 22). Leser: die Geburt, die Ankunft.
    _bewohnerStellen(b, g, x, z) {
        const h0 = this._koerperBodenUnter(x, NaN, z);
        const h = Number.isFinite(h0) ? this._bewohnerTritt(x, z, h0, h0) : 0;
        g.position.set(x, h + AnazhRealm.PLAYER_FOOT_OFFSET * b.groesse, z);
        [b.grundH, b.frist] = [undefined, null]; // der Grund des Schritts liest neu, er wählt neu
    }

    // DER SATZ DER MENGE (der EINE Gang-Satz, `_gangSatz` — Lehre 23: die Kosten der Menge hängen nie an der Kopfzahl): EINER je
    // Siedlung, ihr Leib-Raum (`_bewohnerRaum`, w26-leib-raum): der Leib der Menge im Auge (`leib`, die Mengen-Stufe 2 — mensch.K4:
    // EINE Hülle, die Farben in ihren Ecken) und sein Wurf aus der NUR-WURF-Stufe 3 (`wurf`, Studio-Vertrag B2: nie gezeigt, nur
    // auf der Wurf-Ebene, jeder im Nah-Kreis, auch die Nah-Wahl; Lehre 26: der Schatten ist derselbe Leib), EINE Senke je Stufe —
    // jede die Vorlage ihrer Stufe samt Formziel-Tafel (`raum`), jede Instanz ihr Punkt (die Zeile ihrer Palette, `satzZeilen`).
    // Befehle je Siedlung: einer im Auge, der Wurf je Kaskade (bis w26-leib-raum je Gestalt, 8 je Siedlung). DER GANG IM SATZ: das
    // EINE Gang-Gesetz des nahen Leibs in EINEM Band — `gangPhasen` Phasen des Doppelschritts und der Stand, am Leib `b` gestellt
    // und auf die Knochen der Vorlage gelegt (`_bewohnerRaumStellen`), je Instanz Phase und Gewicht ihres Gangs
    // (`_bewohnerSatzSchreiben`). Ein Bewohner im Satz ist eine Matrix und ein Punkt; der Satz geht mit seiner Siedlung.
    _bewohnerSatz(S, b) {
        const R = S.raum;
        const senken = [];
        const quellen = [];
        for (const [lod, teil] of [
            [2, "leib"],
            [3, "wurf"],
        ]) {
            const t = this._ofenMenschTemplate(R.dK, R.f.skin, R.f.hair, lod);
            const q = [];
            if (t && t.root && t.raum)
                t.root.traverse(
                    (m) => m.isSkinnedMesh && q.push({ m, beid: m.material.side === THREE.DoubleSide, raum: t.raum })
                );
            if (q.length !== 1) {
                this._bruchMelden(
                    `BEWOHNER: die Mengen-Stufe ${lod} trägt ihre Vorlage nicht („${S.plan.name || "?"}")`
                );
                return false;
            }
            quellen.push(q[0]);
            senken.push({ teil, quellen: q, stoff: q[0].m.material, wurf: teil === "wurf" });
        }
        return this._gangSatz(
            {
                name: "bewohner-satz",
                inventar: "bewohner",
                n: AnazhRealm.BEWOHNER.gangPhasen,
                quellen,
                cap: S.liste.length,
                senken,
                raum: true,
            },
            // der Stand zuerst (der Satz steht, bis sein Gang gebacken ist — `_bewohnerGangBacken` im Takt)
            (Z) => this._bewohnerGangPose(b.leib, Object.assign(Z, { gebacken: 0, tempo: b.tempo }), Z.n, S)
        );
    }

    // DIE POSE k (k < n: die Phase 2πk/n des Doppelschritts im EINEN Gang-Gesetz — `_gaitTick` mit dem Tempo des Leibs,
    // eingeschwungen, dann `_animateHuman`; k = n: der Stand, der Kontrapost des Atems bei 0) am Leib `g`: mit der Siedlung `S` die
    // Zeile k des Gang-Puffers ihres Satzes `Z` — die Pose auf die Knochen der Vorlage gelegt (`_bewohnerRaumStellen`) und in den
    // Raum des Leibs geskinnt (`_gangSatzPose`) —, ohne sie die Lagen der Zeile k einer Gestalt `Z` (`_bewohnerLagePose`: der Gang
    // des Felds). Danach steht der Leib wieder im Stand.
    _bewohnerGangPose(g, Z, k, S) {
        if (k < Z.n) {
            if (!Z.gang) {
                const h = {};
                for (let i = 0; i < 40; i++) Z.gang = this._gaitTick(g, h, Z.tempo, 0.1, null);
            }
            this._animateHuman(g, 0, (2 * Math.PI * k) / Z.n, true, false, null, Z.gang);
        } else this._animateHuman(g, 0, 0, false, false, null);
        this._leibMatrix(g);
        if (S) {
            const P = this._bewohnerRaumStellen(S, g);
            this._gangSatzPose(Z, k, P.teile, P.wurzel.matrixWorld);
        } else this._bewohnerLagePose(Z, k, g);
        if (k < Z.n) {
            this._animateHuman(g, 0, 0, false, false, null);
            this._leibMatrix(g);
        }
    }

    // DIE KNOCHEN DER VORLAGE (w26-leib-raum): das Skelett der Mengen-Stufe 2 der Siedlung (ihr Leib-Raum, `_bewohnerRaum`) in
    // demselben Rahmen wie ein Leib (`_buildHumanoidRig`: die Hülle × Welt-Maß, die Sohle der Vorlage auf der Sohle der Kapsel),
    // einmal je Siedlung; `ruhe` die Lage jedes Knochens beim Bau.
    _bewohnerRaumPose(S) {
        const R = S.raum;
        if (R.pose) return R.pose;
        const t = this._ofenMenschTemplate(R.dK, R.f.skin, R.f.hair, 2);
        const klon = t.root.clone(true);
        const meshes = [];
        klon.traverse((n) => n.isMesh && meshes.push(n));
        for (const m of meshes) m.parent.remove(m);
        const teile = {};
        klon.traverse((n) => {
            if ((n.isGroup || n.isBone) && n.name) teile[n.name] = n;
        });
        const f = (8 * AnazhRealm.PLAYER_KH) / 6;
        const wrap = new THREE.Group();
        wrap.scale.setScalar(f);
        wrap.position.y = -AnazhRealm.PLAYER_FOOT_OFFSET - f * AnazhRealm._ofenSohleY(t);
        wrap.add(klon);
        const wurzel = new THREE.Group();
        wurzel.add(wrap);
        const ruhe = {};
        for (const nm in teile)
            ruhe[nm] = {
                position: teile[nm].position.clone(),
                quaternion: teile[nm].quaternion.clone(),
                scale: teile[nm].scale.clone(),
            };
        wurzel.updateMatrixWorld(true);
        return (R.pose = { wurzel, teile, ruhe });
    }
    // DIE POSE EINES LEIBS AUF DER VORLAGE (w26-leib-raum, die Pose in der Ruhe ihres Knochens — SMPL: dieselbe Pose θ, die Gelenke
    // des Raums): je Knochen der Vorlage die Drehung des gestellten Leibs `g` gegen seine Ruhe (`_tierBaum.ruhe`), auf die Ruhe der
    // Vorlage gelegt, dazu der Schritt seiner Lage und das Maß seiner Skala. Die Gelenke der Person liegen dabei auf denen der
    // Vorlage: gemessen weichen sie über die Achsen des Raums höchstens 21 mm quer ab (die Schulter, Geschlecht) — der Gang dreht
    // die Glieder um die Querachse, die Querlage trägt er nicht.
    _bewohnerRaumStellen(S, g) {
        const P = this._bewohnerRaumPose(S);
        const tb = g.userData._tierBaum;
        const q = this._bewohnerRaumQ || (this._bewohnerRaumQ = new THREE.Quaternion());
        for (const nm in P.teile) {
            const [d, r, s, sr] = [P.teile[nm], P.ruhe[nm], tb.teile[nm], tb.ruhe[nm]];
            if (!s || !sr) continue;
            d.quaternion.copy(r.quaternion).multiply(q.copy(sr.quaternion).invert().multiply(s.quaternion));
            d.position.copy(r.position).add(s.position).sub(sr.position);
            d.scale.copy(r.scale).multiply(s.scale).divide(sr.scale);
        }
        P.wurzel.updateMatrixWorld(true);
        return P;
    }

    // DIE LAGEN DER ZEILE k (der Gang des Felds, Lehre 14): je Teil des Leibs (`_tierBaum.teile`, "" = die Hülle — die Anker der
    // Glieder, `_kreaturGliederBacken`) seine Welt-Matrix im Raum des Leibs, gestellt wie die Zeile k des Gang-Puffers; die
    // Größe trägt die Wurzel jedes Leibs (`_bewohnerFeldLage`).
    _bewohnerLagePose(satz, k, g) {
        const tb = g.userData._tierBaum;
        if (!satz.lageTeile) {
            satz.lageTeile = ["", ...Object.keys(tb.teile)];
            satz.lagen = new Float32Array((satz.n + 1) * satz.lageTeile.length * 16);
        }
        const inv = (this._bewohnerLageInv || (this._bewohnerLageInv = new THREE.Matrix4()))
            .copy(g.matrixWorld)
            .invert();
        const m = this._bewohnerLageM || (this._bewohnerLageM = new THREE.Matrix4());
        const K = satz.lageTeile.length;
        satz.lageTeile.forEach((nm, i) => {
            const a = nm ? tb.teile[nm] : tb.wrap || g;
            m.multiplyMatrices(inv, a.matrixWorld).toArray(satz.lagen, (k * K + i) * 16);
        });
    }

    // DER GANG IM FELD (mensch.K1, Lehre 14 und 25: der Takt kostet, was ihn betrifft): jenseits des Nah-Kreises trägt das Feld
    // den Leib, und seine Glieder gehen den EINEN gebackenen Gang seiner Gestalt — die Lagen der Zeilen (`_bewohnerLagePose`),
    // gemischt, wie der Knoten des Satzes mischt (`_gangSatzKnoten`: der Stand gegen die Phasen k0 und k1 nach dem Gewicht des
    // Gangs; ungebacken der Stand), auf der Wurzel des Leibs. Ein Leib ohne Glieder (die Liste des Felds erschöpft) zeichnet
    // nirgends und kostet nichts, eine Gestalt ohne Satz brach laut an ihm (`_bewohnerSatz`). Jedes Glied trägt den Namen
    // seines Ankers (`_kreaturGliederBacken`): bis treffer-kalt las die Lage dafür die Gattung und hielt still an, war sie kalt.
    // Bis stadt-takt-z15d ging je Schritt das Rig (`_animateHuman`) und die Welt-Matrix des ganzen Leibs (`_leibMatrix`) — am
    // Messort stadt mittags (165 Gehende) `_bewohnerGangSchritt` 108,7 → 25,6 ms je Sekunde (Radeon); die Lage der Glieder
    // weicht vom Rig höchstens 3,7 cm ab (der Atem, das Tempo des Back-Leibs).
    _bewohnerFeldLage(b, S) {
        const g = b.leib;
        const gl = g.userData._kzGlieder;
        const Z = S.gestalten[b.gestalt].lage;
        if (!gl || !Z) return;
        if (Z.lageVon === undefined) {
            Z.lageVon = gl.map((x) => Z.lageTeile.indexOf(x.name));
            if (Z.lageVon.some((i) => i < 0)) {
                Z.lageVon = false;
                this._bruchMelden(`BEWOHNER: ein Glied ohne Lage im Gang der Gestalt („${S.plan.name || "?"}")`);
            }
        }
        if (!Z.lageVon) return;
        const K = Z.lageTeile.length;
        const L = Z.lagen;
        const w = Z.fertig ? b._gaitW || 0 : 0;
        const ph = Z.fertig ? (b.walkPhase || 0) / (2 * Math.PI) : 0;
        const f = (ph - Math.floor(ph)) * Z.n;
        const k0 = Math.min(Z.n - 1, Math.floor(f));
        const k1 = (k0 + 1) % Z.n;
        const t = f - k0;
        const R = (this._bewohnerFeldR || (this._bewohnerFeldR = new THREE.Matrix4())).compose(
            g.position,
            g.quaternion,
            g.scale
        );
        const M = this._bewohnerFeldM || (this._bewohnerFeldM = new THREE.Matrix4());
        const W = this._bewohnerFeldW || (this._bewohnerFeldW = new THREE.Matrix4());
        const E = M.elements;
        const an = this.state.creaturesHidden !== true;
        for (let i = 0; i < gl.length; i++) {
            const j = Z.lageVon[i];
            const s = (Z.n * K + j) * 16;
            const a0 = (k0 * K + j) * 16;
            const a1 = (k1 * K + j) * 16;
            for (let e = 0; e < 16; e++) {
                const q = L[a0 + e] + (L[a1 + e] - L[a0 + e]) * t;
                E[e] = L[s + e] + (q - L[s + e]) * w;
            }
            this._weltFeldMatrix(gl[i].handle, W.multiplyMatrices(R, M));
            this._weltFeldAktiv(gl[i].handle, an);
        }
    }

    // DER GANG WIRD GEBACKEN (Lehre 14: schwere deterministische Arbeit im Takt, nie als Spitze): je Takt höchstens `je`
    // Phasen — zuerst der Satz der Siedlung (am ersten Leib, der nicht als Leib lebt: ein Leib der Nah-Wahl trägt seine eigene
    // Pose), dann die Lagen jeder Gestalt (das Feld, an einem ihrer Leiber); ist der Satz gebacken, lädt die Textur EINMAL neu und
    // er geht (`fertig`). Liefert, ob der Satz eben fertig wurde.
    _bewohnerGangBacken(S, je) {
        let fertig = false;
        const frei = (gi) => S.liste.find((x) => (gi < 0 || x.gestalt === gi) && x.leib && !x.nah && !x.amSteuer);
        const Z = S.satz;
        const b = Z && !Z.fertig && je > 0 ? frei(-1) : null;
        if (b) {
            for (; je > 0 && Z.gebacken < Z.n; je--) this._bewohnerGangPose(b.leib, Z, Z.gebacken++, S);
            if (Z.gebacken >= Z.n) {
                Z.tex.needsUpdate = true;
                Z.fertig = fertig = true;
            }
        }
        S.gestalten.forEach((G, gi) => {
            const L = G.lage;
            if (!L || L.fertig || je <= 0) return;
            const c = frei(gi);
            if (!c) return;
            for (; je > 0 && L.gebacken < L.n; je--) this._bewohnerGangPose(c.leib, L, L.gebacken++, null);
            if (L.gebacken >= L.n) L.fertig = true;
        });
        return fertig;
    }

    // DIE MATRIZEN DES SATZES (nur, wenn sich eine Wahl oder Lage ändert — Lehre 25): dicht ([0, n) lebt) — im Auge (der Leib)
    // jeder Bewohner im Nah-Kreis, den die Nah-Wahl nicht trägt, im Wurf jeder im Nah-Kreis. Je Instanz Phase (`walkPhase` / 2π)
    // und Gewicht (`_gaitW`) seines Gangs — bis der Gang gebacken ist, der Stand — und die Zeilen seiner Palette (`satzZeilen`:
    // seine, darin sein Punkt im Leib-Raum, und die der Vorlage). Die Laufzeit-Marke `_satz` sagt jedem Leser, dass der Leib im
    // Satz gezeichnet wird. Jeder merkt seine Plätze (`satzOrt`: Wurf, Leib); wechselt keine Wahl, rückt der Takt nur die Bewegten
    // (`bewegt`) an ihren Plätzen — der Takt kostet die Gehenden, nie die Menge (mensch.K3: der Morgengang trägt das ganze Dorf).
    _bewohnerSatzSchreiben(S, bewegt = null) {
        const m4 = this._bewohnerM4 || (this._bewohnerM4 = new THREE.Matrix4());
        const v3 = this._bewohnerV3 || (this._bewohnerV3 = new THREE.Vector3());
        const o3 = this._bewohnerO3 || (this._bewohnerO3 = new THREE.Vector3());
        // je Art die Senke des Satzes: der Wurf, der Leib
        const ARTEN = ["wurf", "leib"];
        const Z = S.satz || null;
        // seine Matrix: Ort, Blick und seine Größe gegen die Vorlage (`raumSkala`) — die Sohle bleibt, wo die seines Leibs steht
        // (der Ursprung liegt PLAYER_FOOT_OFFSET × Skala über ihr, `_bewohnerStellen`)
        const lage = (g, b) =>
            m4.compose(
                o3.set(
                    g.position.x,
                    g.position.y + AnazhRealm.PLAYER_FOOT_OFFSET * (b.raumSkala - g.scale.y),
                    g.position.z
                ),
                g.quaternion,
                v3.setScalar(b.raumSkala)
            );
        const setze = (k, i, b) =>
            AnazhRealm._gangSatzInstanz(
                Z[k],
                i,
                m4,
                0,
                Z.fertig ? (b.walkPhase || 0) / (2 * Math.PI) : 0,
                Z.fertig ? b._gaitW || 0 : 0,
                b.satzZeilen
            );
        if (bewegt) {
            if (!Z) return;
            const dran = new Set();
            for (const b of bewegt) {
                if (!b.satzOrt || !b.leib) continue;
                lage(b.leib, b);
                b.satzOrt.forEach((i, j) => {
                    if (i < 0) return;
                    setze(ARTEN[j], i, b);
                    dran.add(Z[ARTEN[j]]);
                });
            }
            for (const m of dran) AnazhRealm._gangSatzNeu(m);
            return;
        }
        const zahl = [0, 0];
        for (const b of S.liste) {
            const g = b.leib;
            if (!g) continue;
            g.userData._satz = !!b.kreis && !b.nah && !!Z;
            b.satzOrt = null;
            if (!b.kreis || !Z) continue;
            lage(g, b);
            b.satzOrt = ARTEN.map((k, j) => {
                if (k === "leib" && b.nah) return -1;
                const i = zahl[j]++;
                setze(k, i, b);
                return i;
            });
        }
        if (Z) ARTEN.forEach((k, j) => AnazhRealm._gangSatzZahl(Z[k], zahl[j]));
    }

    // DER BEWOHNER-TAKT (Lehre 13: im Frame-Takt der Wesen, nie am Render-Signal): je gemeldeter Siedlung nahe dem Spieler
    // (`AUTO_SETTLEMENT.nearM`, die Nähe des Dorf-Zugs) die Liste, sobald ihre Häuser stehen, die Vorlagen im Faden und je
    // Takt höchstens `BEWOHNER.geburtenJeTakt` Geburten; jenseits nearM × `fernFaktor` gehen die Leiber (`_bewohnerFort`).
    // DER TAG (mensch.K2): die Uhr der Welt ist das Wort des Spielers — je `BEWOHNER.planH` Stunden (oder nach einem Sprung
    // der Uhr) liest jeder Bewohner seinen Plan (`_bewohnerZiel`, koerper-core `tagesPlan`); wer ein neues Ziel hat, GEHT
    // den Weg des Dorf-Plans (`_bewohnerWeg`, höchstens `wegeJeTakt` neue Wege je Takt) im Tempo seines Leibs
    // (`_bewohnerSchritt`) auf der Raten-Leiter (`_creatureAnimDiv`), wer drinnen ist, zeichnet nirgends. Wer keinem Zuschauer
    // ging — geboren nach der Abwesenheit, nach einem Sprung der Uhr um `sprungH` —, steht, wo sein Tag ihn sieht
    // (`_bewohnerAnkunft`, je Takt höchstens `ankunftJeTakt`).
    // Je Leib: jenseits der Nah-Grenze der Glieder-Satz (`_kzLeib`, echte GPU), diesseits der Satz seiner Gestalt
    // (`_bewohnerSatzSchreiben`, neu nur, wenn eine Lage oder Wahl wechselt) — nur die Nah-Wahl lebt als Leib: der
    // Stufen-Schalter (`_gelenkStufe`) und das EINE Gang-Gesetz (`_gaitTick` → `_animateHuman`: Gang, Stand mit Kontrapost).
    _tickBewohner(delta) {
        const st = this.state;
        const pm = st.playerMesh;
        const alle = this._bewohnerSiedlungen;
        if (!pm || !alle || !alle.size || !st.scene) return;
        const A = AnazhRealm.AUTO_SETTLEMENT;
        const BW = AnazhRealm.BEWOHNER;
        const p = pm.position;
        const echt = !(st.renderer && st.renderer._isHeadlessNull);
        const memo = AnazhRealm._tierOfenMemo;
        const tag = Number.isFinite(st.timeOfDay) ? st.timeOfDay : 0.5;
        const stunde = (((tag % 1) + 1) % 1) * 24;
        let geburten = 0;
        let wege = 0;
        let ankuenfte = 0;
        const auge = this._lodAuge() || p; // das Auge der Stufen: Feld, Nah-Wahl, Stufe und Takt der Leiber messen von ihm
        const arm = Math.hypot(auge.x - p.x, auge.z - p.z);
        const NF = this._feldGrenzen(true); // die Grenzen des Felds der Menge, EINMAL je Takt (die Epoche, `_feldGrenzen`)
        // DER SPIELER IST EIN LEIB (mensch.K5, „Ausweichen ohne Berührung"): sein Lauf dieses Takts (`_spielerLageAlt`, der
        // Kreatur-Takt rechnet ihn vor diesem) und sein Weg `ausweichS` voraus (`voraus`) — jeder Bewohner weicht ihm wie einem
        // Gehenden mit Vorrang (`_bewohnerAusweichen`), wer steht, macht ihm Platz (`_bewohnerPlatz`); steht er (unter 0,2 m/s,
        // die Schwelle des Laufs `_kreaturLaufTakt`), geht man um ihn wie um einen Stehenden (`weg` leer, `_bewohnerUm`)
        const sa = this._spielerLageAlt;
        const SP =
            this._bewohnerSpieler ||
            (this._bewohnerSpieler = { leib: pm, voraus: {}, wi: 0, same: -1, spieler: true, vx: 0, vz: 0, rueck: 0, weg: null, zug: null }); // prettier-ignore
        [SP.leib, SP.vx, SP.vz, SP.rueck] = [pm, sa ? sa.vx : 0, sa ? sa.vz : 0, Infinity];
        [SP.voraus.x, SP.voraus.z] = [p.x + SP.vx * BW.ausweichS, p.z + SP.vz * BW.ausweichS];
        const spV = Math.hypot(SP.vx, SP.vz);
        SP.weg = spV > 0.2 ? SP.zug || (SP.zug = [SP.voraus]) : null;
        const FG = AnazhRealm._furchtGesetz().F;
        const kDeckel =
            2 * AnazhRealm.PLAYER_WALL_RADIUS + 0.01 + BW.spielerRaumM * (1 + FG.deckel * FG.fluchtJeFurcht);
        for (const S of alle.values()) {
            const d2 = (S.ox - p.x) ** 2 + (S.oz - p.z) ** 2;
            if (d2 > (A.nearM * BW.fernFaktor) ** 2) {
                if (S.liste || S.listeWerk) this._bewohnerFort(S);
                continue;
            }
            // DAS WERK DER LISTE (`listeWerk`): erst die Liste (`_bewohnerListe`), dann weicht jeder ihrer Stände der Welt — was
            // der Wald-Takt schon brachte, und die Spuren der Wagen (`_bewohnerStandPruefen`); erst danach lebt sie
            // (`lebt`: eine Liste, deren erstes Werk stand, lebt weiter, während ein Werk der Wache ihre Stände prüft)
            if (!S.liste || (S.listeWerk && !S.lebt)) {
                if (d2 > A.nearM * A.nearM) continue;
                const q = this._autoSettlementQueue;
                if (q && q.cellKey === S.key) continue; // die Häuser wachsen noch
                if (!S.listeWerk && !this._bewohnerHuellenDa(S)) continue; // die Häuser stehen erst mit ihrer Hülle
                // das Werk beginnt hier, es rechnet im Takt-Planer (`_bewohnerWerkTakt`); bis es steht, lebt die Siedlung nicht
                if (!S.listeWerk) S.listeWerk = this._bewohnerListe(S);
                continue;
            }
            // DIE KÖPFE DES TAKTS (Gebot 7: die Kosten an Schirm und Änderung, nie an der Kopfzahl): der Takt geht über die
            // Wachen (`aktiv`) — wer geht, wer etwas vorhat, wer im Ring um den Spieler steht —, über jeden Ruhenden
            // (`_bewohnerRuhig`) gestaffelt je `fernS` Sekunden einmal, mit seiner Zeit seit seinem letzten Takt (`uhrAb`); was ihn
            // weckt (der Plan, der Platz, der Sprung der Uhr, die Wache), nimmt ihn in diesen Takt (`_bewohnerWecken`). Das Raster
            // hält seine Zelle (`_bewohnerRasterLage`). Bis bewohner-takt gingen drei Schleifen je Takt über jeden Kopf der
            // Siedlung: an stadt-voll 1 094, von denen um 7 Uhr 140 im Nah-Ring standen. DER SPRUNG DER UHR (mensch.K2: um sprungH
            // oder mehr, das Wort des Spielers) richtet den Takt der Köpfe neu ein wie eine neue Liste — wach, die Uhren auf 0, das
            // Raster in der Reihe der Liste, der Plan von vorn —, und unten beginnt jedem Kopf sein Gang neu: der Tag danach ist
            // f(Same, t). Bis heil-wackler trug der Sprung den Takt davor mit (die Uhren, die Staffel, die Reihe der Zellen, den
            // Gang), und der Tag danach hing an der Geschichte der Seite: #724672 steckte um 12,62 Uhr in einem von 8 Läufen.
            const dU = Math.abs(stunde - S.uhrStunde);
            S.uhrStunde = stunde;
            const sprung = Math.min(dU, 24 - dU) >= BW.sprungH;
            if (sprung || S.aktivListe !== S.liste) {
                [S.aktivListe, S.aktiv, S.ruhend, S.raster, S.taktUhr] = [S.liste, S.liste.slice(), [], new Map(), 0];
                [S.planI, S.ruhSoll] = [0, 0];
                S.liste.forEach((b, i) => Object.assign(b, { nr: i, ruht: false, rk: undefined, uhr: 0, uhrAb: 0 }));
                for (const b of S.liste) this._bewohnerRasterLage(S, b);
            }
            const koepfe = (S.koepfe = this._bewohnerKoepfe || (this._bewohnerKoepfe = []));
            koepfe.length = 0;
            for (const b of S.aktiv) koepfe.push(b);
            S.ruhSoll = Math.min(S.ruhend.length, (S.ruhSoll || 0) + (S.ruhend.length * delta) / BW.fernS);
            // geweckt wird nur durch DEN Weckruf (`_bewohnerWecken`: die Uhr des Ruhenden zuerst) — bis heil-wackler weckte der
            // gestaffelte Takt ohne sie, und fiel eine Wende auf seinen Takt, rechnete `zielUhr` mit der Uhr seines letzten Takts
            for (const b of S.ruhend.splice(0, Math.floor(S.ruhSoll))) this._bewohnerWecken(S, b);
            S.ruhSoll -= Math.floor(S.ruhSoll);
            this._bewohnerWacheTakt(S);
            let anders = false; // eine Wahl wechselt: der Satz neu (`_bewohnerSatzSchreiben`); sonst rücken die Bewegten
            const bewegt = this._bewohnerBewegt || (this._bewohnerBewegt = []);
            bewegt.length = 0;
            // DER SPRUNG DER UHR (oben eingerichtet): jeder Leib stellt sich dorthin, wo sein Tag ihn jetzt sieht
            // (`_bewohnerAnkunft`), ohne den Gang davor — Tempo, Lauf, Rückstand, Schritt-Takt der Raten-Leiter, Platz und Tür
            if (sprung) {
                for (const b of S.liste) {
                    Object.assign(b, { gegangen: 0, gehTakt: 0, tempoJetzt: 0, tempoTag: undefined, rueck: 0 });
                    Object.assign(b, { vx: 0, vz: 0, platz: false, hinaus: false, ankunft: !!b.leib });
                    this._bewohnerRasterLage(S, b);
                }
                if (S.verkehr) this._verkehrSprung(S); // auch der Wagen: f(Same, t)
            }
            // DAS SOLL DER STUNDE (mensch.K2): je `planH` liest jeder seinen Plan einmal — gestaffelt, dt-gerecht: je Takt so viele
            // Köpfe der Reihe nach (`planI`), wie die Uhr dieses Takts von planH trägt; die erste Liste und ein Sprung um planH
            // lesen alle. Bis bewohner-takt las jeder Kopf im selben Takt: an stadt-voll (1 094 Köpfe) eine Spitze von 6,3 ms je
            // planH.
            const dS = S.planStunde == null ? 12 : Math.abs(stunde - S.planStunde);
            const N = S.liste.length;
            S.planSoll =
                Math.min(dS, 24 - dS) >= BW.planH ? N : (S.planSoll || 0) + (N * Math.min(dS, 24 - dS)) / BW.planH;
            S.planStunde = stunde;
            for (let n = Math.min(N, Math.floor(S.planSoll)); n > 0; n--, S.planSoll--) {
                S.planI = ((S.planI || 0) + 1) % N;
                const b = S.liste[S.planI];
                if (b.ankunft) continue; // wer noch ankommt, liest seinen Plan in seiner Ankunft (`_bewohnerAnkunft`)
                const z0 = (this._bewohnerUhrNach(S, b), b.ziel);
                if (this._bewohnerZiel(b, stunde, true)) anders = true;
                if (b.ziel !== z0) this._bewohnerWecken(S, b);
            }
            if (S.planSoll >= N) S.planSoll = 0;
            this._bewohnerVorlagen(S, p);
            if (this._bewohnerGangBacken(S, BW.gangJeTakt)) anders = true;
            // in der Reihe der Liste (wer geweckt oder besucht wurde, kam hinten dazu)
            koepfe.sort((a, c) => a.nr - c.nr);
            if (S.verkehr) this._verkehrImRaster(S); // der fahrende Wagen ist ein Leib mit Vorrang im Gedränge
            const nah = this._bewohnerNah || (this._bewohnerNah = []);
            nah.length = 0;
            for (const b of koepfe) {
                if (!b.leib) {
                    if (b.leib === false || geburten >= BW.geburtenJeTakt) continue;
                    const G = S.gestalten[b.gestalt];
                    if (!memo || G.keys.some((k) => !memo.has(k)) || S.raum.keys.some((k) => !memo.has(k))) continue;
                    // geboren wird am Ort seines Plans (drinnen an seiner Tür, ungezeichnet) — und dort steht er, wo die Uhr
                    // ihn sieht: die Ankunft geht den Tag nach, den keiner sah
                    b.x = b.ziel.x;
                    b.z = b.ziel.z;
                    b.blick = Number.isFinite(b.ziel.blick) ? b.ziel.blick : 0;
                    this._bewohnerGeburt(S, b);
                    geburten++;
                    if (!b.leib) continue;
                    b.da = true;
                    b.drinnen = b.drinnenSoll;
                    b.leib.userData._drinnen = b.drinnen;
                    b.wegRest = 0;
                    b.ankunft = true;
                }
                const g = b.leib;
                const u = g.userData;
                // WER NOCH ANKOMMT (der Sprung der Uhr, die Geburt), handelt nicht, bis seine Ankunft dran ist (`ankunftJeTakt`) —
                // bis heil-wackler suchten die Wartenden Wege, traten aus Türen und zählten ihren Schritt-Takt aus der Lage vor ihr
                if (b.ankunft && ankuenfte >= BW.ankunftJeTakt) continue;
                // AM STEUER gehört sein Leib dem Wagen (`_tickVerkehr`) — springt die Uhr, steigt er aus, und seine Ankunft gilt
                if (b.amSteuer && !(b.ankunft && ankuenfte < BW.ankunftJeTakt)) continue;
                if (b.ankunft && ankuenfte < BW.ankunftJeTakt) {
                    b.ankunft = false;
                    ankuenfte++;
                    if (b.amSteuer) this._verkehrAussteigen(S, b, true);
                    this._bewohnerAnkunft(S, b, stunde, echt, p);
                    b.lageNeu = true;
                    anders = true;
                    this._bewohnerRasterLage(S, b); // die nächste Ankunft sieht ihn, wo er ankam
                }
                const bd2 = (b.d2 = (g.position.x - p.x) ** 2 + (g.position.z - p.z) ** 2);
                const ad2 = (b.dA2 = (g.position.x - auge.x) ** 2 + (g.position.z - auge.z) ** 2);
                // die Lage, an der dieser Takt die Stufen des Leibs misst (vor seinem Schritt — `dA2`, `_gelenkStufe`)
                const LA = b.lageAuge || (b.lageAuge = { x: 0, z: 0 });
                LA.x = g.position.x;
                LA.z = g.position.z;
                // DIE TÜR (mensch.K3 Staffel 2): wer hinaus soll (`_bewohnerZiel`), tritt aus ihr, wenn keiner in ihr und vor
                // ihr steht — bis dahin wartet er drinnen
                if (
                    b.hinaus &&
                    this._bewohnerNaechster(S, b, b.orte.tuer.x, b.orte.tuer.z) >= BW.tuerFreiM &&
                    this._bewohnerNaechster(S, b, b.orte.vor.x, b.orte.vor.z) >= BW.tuerFreiM
                ) {
                    b.hinaus = false;
                    b.drinnen = false;
                    u._drinnen = false;
                    anders = true;
                    b.vx = b.vz = 0;
                    this._bewohnerStellen(b, g, b.orte.tuer.x, b.orte.tuer.z); // er tritt aus der Tür, wo er auch hineinging
                    this._bewohnerRasterLage(S, b); // die anderen sehen ihn ab diesem Takt
                }
                // wer Platz machte, geht zurück, wenn sein Stand frei ist und der, dem er ihn machte (`platz`,
                // `_bewohnerPlatz`; ein Wagen trägt die Breite seiner Bahn, `kF`), nicht mehr auf ihn zugeht — bis hier ging er, sobald sein Stand frei war: wer auf ihn
                // wartete (`_bewohnerAusweichen`), fand ihn um 21,71 Uhr Takt für Takt wieder dort (wohnhaus #809070, 10
                // Spielminuten 0 m)
                const w = b.platz;
                // der Abstand zum Spieler nur, wo er zählen kann (der Deckel des Furcht-Gesetzes: der weiteste Raum)
                const nahS = !b.drinnen && (bd2 < (kDeckel + spV * BW.ausweichS) ** 2 || (w && w.spieler));
                const kS = nahS ? this._bewohnerSpielerAbstand(b) : kDeckel;
                // wohin der geht, dem er Platz machte: der Spieler `ausweichS` voraus, der Bewohner zum nächsten Punkt
                const wv =
                    w && (w.spieler ? SP.voraus : w.weg && !w.drinnen && w.wi < w.weg.length ? w.weg[w.wi] : null);
                // (dem Wagen, `kF`: wer auf dem Weg beiseite trat, bleibt, bis die Bahn an seinem Ort frei ist — sein Ziel liegt fern)
                const zo = w && w.kF ? g.position : b.ziel;
                if (
                    w &&
                    b.da &&
                    !b.weg &&
                    this._bewohnerNaechster(S, b, b.ziel.x, b.ziel.z) >= BW.tuerFreiM &&
                    !(
                        wv &&
                        w.leib &&
                        this._streckeBoxAbstand2(
                            { minX: zo.x, maxX: zo.x, minZ: zo.z, maxZ: zo.z },
                            w.leib.position.x,
                            w.leib.position.z,
                            wv.x,
                            wv.z
                        ) <
                            ((w.spieler ? kS : w.kF || 2 * AnazhRealm.PLAYER_WALL_RADIUS + 0.01) + 0.1) ** 2
                    )
                )
                    [b.platz, b.da] = [false, false];
                // PLATZ FÜR DEN SPIELER (mensch.K5): wer steht und in dessen Abstand der Weg des Spielers führt (`ausweichS`
                // voraus), tritt beiseite — der billige Filter zuerst (Lehre 25)
                const gp = g.position;
                if (
                    nahS &&
                    !b.weg &&
                    bd2 < (kS + spV * BW.ausweichS) ** 2 &&
                    this._streckeBoxAbstand2({ minX: gp.x, maxX: gp.x, minZ: gp.z, maxZ: gp.z }, p.x, p.z, SP.voraus.x, SP.voraus.z) < kS * kS // prettier-ignore
                )
                    this._bewohnerPlatz(S, b, p, SP.voraus, SP, kS);
                // DER GANG: ein neues Ziel sucht seinen Weg (gedeckelt je Takt), der Weg trägt den Leib im Tempo des Gesetzes
                if (!b.da && !b.weg && !b.hinaus && wege < BW.wegeJeTakt) {
                    this._bewohnerWeg(S, b);
                    wege++;
                }
                if (b.weg) {
                    b.gehDt = (b.gehDt || 0) + delta;
                    const div = Math.max(1, this._creatureAnimDiv(Math.sqrt(ad2), this._gelenkAb(g), 0, delta, true));
                    if ((b.gehTakt = ((b.gehTakt || 0) + 1) % div) === 0) {
                        const dt = b.gehDt;
                        b.gehDt = 0;
                        if (this._bewohnerGehen(S, b, dt)) {
                            bewegt.push(b);
                            b.lageNeu = true;
                        }
                        if (b.drinnen) anders = true;
                        // jenseits der Nah-Wahl geht der Leib dasselbe Gang-Gesetz (Phase und Gewicht — der Satz liest sie,
                        // `_bewohnerSatzSchreiben`); fern trägt das Feld die Gestalt: die Glieder gehen den Gang mit
                        if (!b.nah) this._bewohnerGangSchritt(b, b.weg ? b.tempoJetzt : 0, dt, echt, S);
                    }
                }
                // der Glieder-Satz fragt nur, wer seine Seite wechseln kann oder noch keinen Satz trägt — die Knochen eines
                // stehenden Leibs ruhen, seine Glieder stehen nach dem ersten Schreiben (Lehre 25: der Takt kostet, was ihn betrifft)
                const N = NF;
                if (
                    echt &&
                    !b.drinnen &&
                    (u._kzNah === undefined ||
                        !u._kzVersuch ||
                        (u._kzNah === true ? ad2 >= N.aus * N.aus : ad2 < N.ein * N.ein))
                ) {
                    // wer aus dem Feld in den Nah-Kreis tritt, nimmt seine Pose mit: im Feld ging sein Rig nicht
                    // (`_bewohnerFeldLage`), die schwindenden Glieder folgen ab hier seinen Knochen
                    if (u._kzGlieder && this._kzBesitztFeld(g)) {
                        this._animateHuman(
                            g,
                            b.uhr + b.atem,
                            b.walkPhase || 0,
                            !!b.weg,
                            false,
                            this._bewohnerGemuet(b),
                            b._gait
                        );
                        this._leibMatrix(g);
                    }
                    this._kzLeib(g, auge, true); // die Glieder backen vorab: wer hinausgeht, trägt sein Feld ab dem ersten Schritt
                    if (this._kzBesitztFeld(g)) this._bewohnerFeldLage(b, S); // wer ins Feld tritt, geht dort seinen Gang
                }
                // DER NAH-KREIS: wer draußen keinem Feld gehört (`_kzBesitztFeld` — diesseits der Nah-Grenze, ohne Bild und
                // fern, bis der Bake-Takt seine Glieder backt: bis dahin trägt der Körper), steht darin: der Satz, die Nächsten
                // leben (`nahM` vom Auge); wer drinnen ist, steht in keinem Kreis
                const kreis = !b.drinnen && !(echt && this._kzBesitztFeld(g));
                if (kreis !== b.kreis) anders = true;
                b.kreis = kreis;
                const rN = b.nah ? BW.nahM + BW.nahHystM : BW.nahM;
                if (kreis && ad2 < rN * rN) {
                    // die Bedeutung (`_bedeutung`: Größe am Schirm mal Gang), wer lebt, mit der Hysterese der Gestalt bedeutender
                    const bd = this._bedeutung(g.scale.y || 1, Math.sqrt(ad2), b.weg ? b.tempoJetzt : 0);
                    b.bedeutung = b.nah ? bd / (1 - u._gelenk.hyst) ** 2 : bd;
                    nah.push(b);
                }
            }
            S.ankunftOffen = ankuenfte >= BW.ankunftJeTakt; // es warten noch Ankünfte (der Verkehr hält, `_verkehrFolge`)
            // DIE NAH-WAHL: höchstens `nahLeiber` der Bedeutendsten leben (Gang, Atem, Stufen, Blick des Leibs) — jeder andere im
            // Nah-Kreis steht im Satz seiner Gestalt; der Wechsel schaltet nur `visible` und schreibt die Sätze neu
            nah.sort((a, b) => b.bedeutung - a.bedeutung);
            if (nah.length > BW.nahLeiber) nah.length = BW.nahLeiber;
            for (const b of koepfe) {
                const g = b.leib;
                if (!g) continue;
                // DAS RASTER DER LEIBER (mensch.K3, `_bewohnerAusweichen`): wer draußen steht oder geht, in der Zelle seiner Lage
                // nach dem Schritt (bis zum nächsten Takt bewegt keiner einen Leib); wer steht, steht still (sein Tempo 0)
                if (!b.weg) b.vx = b.vz = 0;
                this._bewohnerRasterLage(S, b);
                if (b.amSteuer) continue; // sein Leib gehört dem Wagen (`_tickVerkehr`)
                const istNah = nah.indexOf(b) >= 0;
                if (istNah !== !!b.nah) {
                    b.nah = istNah;
                    g.visible = istNah;
                    anders = true;
                }
                const dK = b.uhrAb === S.taktUhr ? delta : S.taktUhr + delta - b.uhrAb; // seine Zeit seit seinem letzten Takt
                [b.uhr, b.animDt, b.uhrAb] = [b.uhr + dK, (b.animDt || 0) + dK, S.taktUhr + delta];
                // DER BLICK AM ZIEL: wer steht, wendet sich seinem Ziel zu (`_bewohnerDrehen`)
                if (b.drehen != null && this._bewohnerDrehen(b, delta, echt, S)) {
                    bewegt.push(b);
                    b.lageNeu = true;
                }
                // jenseits der Nah-Wahl klingt der Gang im Stand aus (das Gewicht des EINEN Gang-Tick)
                if (!istNah && !b.weg && b._gaitW > 0) {
                    this._bewohnerGangSchritt(b, 0, delta, echt, S);
                    bewegt.push(b);
                }
                if (!istNah) continue;
                // der Leib zieht seine Matrizen selbst nach (K59 `_ruhendeWurzel`): nach jeder Pose und jedem Schritt
                let neu = b.lageNeu === true;
                let gepost = false;
                b.lageNeu = false;
                if (!this._gelenkStufe(g, auge, b.lageAuge)) {
                    const geht = !!b.weg;
                    const om = b._gait ? b._gait.omega : 0;
                    const div = this._creatureAnimDiv(Math.sqrt(b.dA2), this._gelenkAb(g), om, delta, geht);
                    if (div !== 0 && (b.takt = (b.takt + 1) % div) === 0) {
                        const dtA = Math.min(0.25, b.animDt);
                        b.animDt = 0;
                        const gang = this._gaitTick(g, b, geht ? (b.tempoJetzt ?? b.tempo) : 0, dtA, null);
                        this._animateHuman(
                            g,
                            b.uhr + b.atem,
                            b.walkPhase || 0,
                            geht,
                            false,
                            this._bewohnerGemuet(b),
                            gang
                        );
                        neu = gepost = true;
                    }
                }
                if (this._bewohnerKopf(b, delta, p, gepost)) neu = true; // die Begegnung: Kopf und Rumpf über der Pose
                if (neu) this._leibMatrix(g);
                if (neu && (b.weg || b._gaitW > 0)) bewegt.push(b); // sein Wurf geht im Satz mit
            }
            if (anders) this._bewohnerSatzSchreiben(S);
            else if (bewegt.length) this._bewohnerSatzSchreiben(S, bewegt);
            // wer ruht, wartet auf seinen Takt (`fernS`: so weit kommt der Spieler bis dahin, `m`); wer nie geboren wird, auf keinen
            const m = Math.max(spV, st.sprintSpeed || 0, st.speed || 0) * BW.fernS;
            const innen = Math.max(BW.nahM + BW.nahHystM, kDeckel + spV * BW.ausweichS) + m;
            S.aktiv = koepfe.filter(
                (b) => b.leib !== false && !(b.ruht = this._bewohnerRuhig(b, innen, m + arm, echt, NF))
            );
            for (const b of koepfe) if (b.ruht) S.ruhend.push(b);
            [S.koepfe, S.taktUhr] = [null, S.taktUhr + delta];
        }
    }

    // DIE WACHE (mensch.K3): wechselt eine Hülle im Rechteck der Wege, prüft ein WERK der Siedlung (`listeWerk`) jeden Stand, den
    // der Wechsel trifft (`_bewohnerStandPruefen`), dann den Rest jedes Wegs (`_bewohnerWegPruefen`) — unter der EINEN Frist der
    // Bau-Arbeit im Takt-Planer (`_bewohnerWerkTakt`, mindestens ein Stück je Takt), und die Leute leben dabei weiter (`lebt`).
    // Was während des Werks wechselt, sammelt das Buch der Wache (`_bewohnerWechsel`) für das nächste. Bis w25-stadt-takt-3 ging
    // die Prüfung ganz im Takt der Leute: reichte das Buch (256 Wechsel) beim Ankommen der Stadt nicht zurück, prüfte EIN Takt
    // jeden Stand — GTX, Messort stadt, erster Gang: ein Takt 2 546 ms (`_bewohnerStandPruefen` 2 540, darin `_bewohnerWand`
    // 1 566), Null-Renderer 3 280 Stände 3,55 s.
    _bewohnerWacheTakt(S) {
        if (S.wache.stand === S.wegeStand || S.listeWerk) return;
        const trifft = this._bewohnerWechsel(S, S.wegeStand);
        S.wegeStand = S.wache.stand;
        for (const b of S.liste) this._bewohnerWecken(S, b);
        const gang = this._bewohnerStandPruefen(S, trifft);
        S.listeWerk = (function* (realm) {
            yield* gang;
            realm._bewohnerWegPruefen(S, trifft);
        })(this);
    }

    // DAS WERK DER LISTE IM TAKT-PLANER (w25-stadt-takt, die EINE Frist der Bau-Arbeit, Lehre 14 und 25): der Job `bewohner`
    // (`_buildDeferrableJobs`, Welt-Substanz hinter dem Strom) rechnet bis zu seinem Budget `ms` (der Rest der EINEN Frist
    // `_bauFrist`; ohne Bild und im ruhenden Loop ganz) an jedem Werk einer Siedlung im Nah-Ring (`listeWerk`: erst die Liste,
    // `_bewohnerListe`, dann die Prüfung ihrer Stände, `_bewohnerStandPruefen`), jedes Werk mindestens einen Schritt — nie
    // verhungert; solange ihre Häuser wachsen, ruht es. Den Beginn sagt der Bewohner-Takt (`_tickBewohner`). Bis hier rechnete
    // der Bewohner-Takt mit eigener Uhr (`BEWOHNER.listeMs`, 4 ms je Takt) NEBEN der Frist der übrigen Bauer — die zweite Uhr,
    // die w19-gang-hitch nicht fand: am Messort stadt trug die Liste der Stadt im Gang 3,6–3,9 ms je Takt über die Frist hinaus
    // (Radeon und GTX, gate:geh-zerlegung).
    _bewohnerWerkTakt(ms) {
        const alle = this._bewohnerSiedlungen;
        const pm = this.state.playerMesh;
        if (!alle || !alle.size || !pm) return;
        const bis = performance.now() + ms;
        const [p, nah, q] = [pm.position, AnazhRealm.AUTO_SETTLEMENT.nearM, this._autoSettlementQueue];
        const tag = Number.isFinite(this.state.timeOfDay) ? this.state.timeOfDay : 0.5;
        for (const S of alle.values()) {
            const R = S.lebt ? nah * AnazhRealm.BEWOHNER.fernFaktor : nah; // ein Werk der Wache, so weit die Leute leben
            if (!S.listeWerk || (q && q.cellKey === S.key) || (S.ox - p.x) ** 2 + (S.oz - p.z) ** 2 > R * R) continue;
            let w;
            do w = S.listeWerk.next();
            while (!w.done && performance.now() < bis);
            if (!w.done) continue;
            S.listeWerk = null;
            if (!S.liste) {
                S.gestalten = this._bewohnerGestalten(S);
                S.satz = null;
                S.liste = w.value;
                this._bewohnerGenome(S);
                this._bewohnerWacheSetzen(S);
                if (S.plan.staedtisch) this._verkehrAnlegen(S); // die Wagen der Stadt und ihre Fahrer (PFLICHT-OFFEN C)
                S.listeWerk = this._bewohnerStandPruefen(S, null);
                continue;
            }
            if (S.lebt) continue;
            S.lebt = true; // die Liste lebt ab jetzt
            S.planStunde = null;
            S.uhrStunde = (((tag % 1) + 1) % 1) * 24;
        }
    }

    // DER RUHENDE (bewohner-takt, `_tickBewohner`): er trägt einen Leib, steht an seinem Ziel ohne Weg, ohne Vorhaben (Tür, Platz,
    // Ankunft), ohne Wende und Gang, lebt nicht als Leib — und ist drinnen oder steht jenseits von `innen` (der Kreis des Lebens
    // und der Raum des Spielers, dazu sein Weg `m` bis zum nächsten Takt des Ruhenden), mit Bild diesseits der Grenze seiner Seite
    // am Auge der Stufen (`_feldGrenzen`: im Satz unter `aus`, im Feld über `ein`, je um `m` — darin der Arm der Kamera, das Auge
    // kreist um den Spieler) — keine Grenze, die er bis dahin kreuzt. `N` die Grenzen des Felds dieses Takts.
    _bewohnerRuhig(b, innen, m, echt, N) {
        if (!b.leib || !b.da || b.weg || b.platz || b.hinaus || b.ankunft || b.nah || b.drehen != null || b._gaitW > 0)
            return false;
        if (b.drinnen) return true;
        if (b.d2 < innen * innen) return false;
        const u = b.leib.userData;
        if (!echt) return true;
        if (!u._kzVersuch) return false;
        const d = Math.sqrt(b.dA2);
        return u._kzNah === true ? d < N.aus - m : u._kzNah === false && d > N.ein + m;
    }

    // DIE UHR DES RUHENDEN (bewohner-takt): seine Zeit seit seinem letzten Takt (`uhrAb` auf der Uhr der Siedlung `taktUhr`),
    // bevor ein Leser sie liest (der Plan, `_bewohnerZiel`); WECKEN nimmt ihn in diesen Takt (`koepfe`), sonst in den nächsten.
    _bewohnerUhrNach(S, b) {
        if (!b.ruht || b.uhrAb === S.taktUhr) return;
        const d = S.taktUhr - b.uhrAb;
        [b.uhr, b.animDt, b.uhrAb] = [b.uhr + d, (b.animDt || 0) + d, S.taktUhr];
    }
    _bewohnerWecken(S, b) {
        if (!b.ruht) return;
        this._bewohnerUhrNach(S, b);
        b.ruht = false;
        (S.koepfe || S.aktiv).push(b);
    }

    // DIE ZELLE DES LEIBS im Raster seiner Siedlung (`S.raster`, mensch.K3): wer draußen ist, steht in der Zelle seiner Lage
    // (`rasterM`), wer drinnen ist, am Steuer sitzt, keinen Leib trägt oder noch ankommt (seine Lage ist die vor dem Sprung —
    // ein Ankommender wich ihr bis heil-wackler aus), in keiner — umgelegt nur, wenn sie wechselt (`rk`).
    // Der Wagen des Verkehrs legt seine Leiber durch dieselbe Lage (`_verkehrImRaster`).
    _bewohnerRasterLage(S, b) {
        const M = AnazhRealm.BEWOHNER.rasterM;
        const g = b.leib;
        const k =
            g && !b.drinnen && !b.amSteuer && !b.ankunft
                ? Math.floor(g.position.x / M) * 2097152 + Math.floor(g.position.z / M)
                : null;
        if (k === b.rk) return;
        if (b.rk != null) {
            const l = S.raster.get(b.rk);
            l.splice(l.indexOf(b), 1);
        }
        b.rk = k;
        if (k === null) return;
        const l = S.raster.get(k);
        if (l) l.push(b);
        else S.raster.set(k, [b]);
    }

    // DER GANG JENSEITS DER NAH-WAHL (mensch.K1 Staffel 2): derselbe Gang-Tick wie der nahe Leib (`_gaitTick`: Phase, Gewicht,
    // Fuß-Ziel) — der Satz liest Phase und Gewicht; trägt das Feld den Leib (jenseits des Nah-Kreises), gehen seine Glieder
    // denselben gebackenen Gang (`_bewohnerFeldLage`). Steht er, klingt das Gewicht aus und fällt unter 1 % auf 0. Gebacken ist
    // der Doppelschritt seines Tempos (`_bewohnerSatz`): die Phase geht den Weg, den er geht (der Tick seines Tempos über die
    // Zeit, die sein Weg ihm trüge) — wer eilt oder ausweicht, tritt schneller oder langsamer, nie gleitet sein Fuß. Bis hier
    // lief sie im Takt des gehenden Tempos über den Schritt des gebackenen: der Satz glitt um 0,034, wer eilte, um 0,045.
    _bewohnerGangSchritt(b, v, dt, echt, S) {
        const g = b.leib;
        if (v > 0) this._gaitTick(g, b, b.tempo, (dt * v) / b.tempo, null);
        else this._gaitTick(g, b, 0, dt, null);
        if (v === 0 && !(b._gaitW > 0.01)) b._gaitW = 0;
        if (echt && !b.drinnen && this._kzBesitztFeld(g)) this._bewohnerFeldLage(b, S);
    }

    // DER BLICK AM ZIEL (mensch.K2 Staffel 2): wer an seinem Ort steht, schaut auf sein Ziel — am Platz zur Mitte, vor der Tür in
    // die Gasse, am Rand der Gasse auf das Gegenüber (`blick` des Stands, `_bewohnerListe`); er wendet sich mit der Wendegrenze
    // des Steuer-Gesetzes, wie er im Gehen dreht. Liefert, ob sich die Lage änderte.
    _bewohnerDrehen(b, dt, echt, S) {
        const g = b.leib;
        const TC = globalThis.__tetrapodaCore;
        const om = TC.STEUER_GESETZ.wende * Math.sqrt(TC.GANG_GESETZ.g / b.beinL) * dt;
        let dw = b.drehen - g.rotation.y;
        dw -= Math.PI * 2 * Math.round(dw / (Math.PI * 2));
        if (Math.abs(dw) <= om) {
            g.rotation.y += dw;
            b.drehen = null;
        } else g.rotation.y += Math.sign(dw) * om;
        if (echt && !b.nah && !b.drinnen && this._kzBesitztFeld(g)) this._bewohnerFeldLage(b, S);
        return true;
    }

    // DIE BEGEGNUNG (mensch.K5 Staffel 1): tritt der Spieler auf `begegnungM` heran oder macht er ihm Platz (`platz`), wendet
    // der Lebende (die Nah-Wahl) sich ihm zu — mit `kopfRadS`, der Kopf bis `kopfMaxRad` über dem Rumpf, darüber hinaus der Rumpf
    // bis `rumpfMaxRad` über dem Becken; steht er und liegt der Spieler jenseits, wendet er sich mit dem Leib (`drehen`, die
    // Wendegrenze des Steuer-Gesetzes); geht der Spieler fort (jenseits + `nahHystM`), kehrt der Blick zurück, und wer an seinem
    // Ort steht, schaut wieder auf sein Ziel. Der Kopf-Knoten trägt seine Gier über der Pose (die Pose setzt ihn auf 0,
    // `_animateHumanoidRig`), der Rumpf seine in jeder Pose (`gepost`) dazu. Liefert, ob sich die Lage änderte.
    _bewohnerKopf(b, dt, p, gepost) {
        const g = b.leib;
        const r = g.userData.rig;
        const k = r && r.head;
        if (!k) return false;
        const BW = AnazhRealm.BEWOHNER;
        const war = b.begegnet;
        b.begegnet =
            !b.drinnen &&
            (b.d2 < (BW.begegnungM + (war ? BW.nahHystM : 0)) ** 2 || (b.platz && b.platz === this._bewohnerSpieler));
        let soll = 0;
        if (b.begegnet) {
            const a = Math.atan2(p.x - g.position.x, p.z - g.position.z);
            let da = a - g.rotation.y;
            da -= Math.PI * 2 * Math.round(da / (Math.PI * 2));
            const voll = BW.kopfMaxRad + BW.rumpfMaxRad;
            soll = Math.max(-voll, Math.min(voll, da));
            if (!b.weg && Math.abs(da) > voll) b.drehen = a;
        } else if (war && b.da && !b.weg && !b.platz && Number.isFinite(b.ziel.blick)) b.drehen = b.ziel.blick;
        const om = BW.kopfRadS * dt;
        b.kopfY = (b.kopfY || 0) + Math.max(-om, Math.min(om, soll - (b.kopfY || 0)));
        const kopf = Math.max(-BW.kopfMaxRad, Math.min(BW.kopfMaxRad, b.kopfY));
        let neu = false;
        if (gepost && b.kopfY !== kopf && r.spine)
            [r.spine.rotation.y, neu] = [r.spine.rotation.y + b.kopfY - kopf, true];
        if (k.rotation.y !== kopf) [k.rotation.y, neu] = [kopf, true];
        return neu;
    }

    // DER ABSTAND ZUM SPIELER (mensch.K5, „die Erinnerung lenkt den Abstand"): dem Gehenden zwei Kapseln und der persönliche
    // Raum `spielerRaumM`, geweitet um die erinnerte Furcht seines Leibs — das EINE Furcht-Gesetz (`_kreaturFurchtErinnert`:
    // tetrapoda furchtErinnert über sein Gedächtnis, `fluchtJeFurcht` je Einheit), wie es Witterung und Flucht eines Tiers weitet;
    // dem Stehenden die Kapseln wie jedem Stehenden (wer in der Gasse steht, sperrt sie nicht).
    _bewohnerSpielerAbstand(b) {
        if (!(this._bewohnerSpieler && this._bewohnerSpieler.weg)) return 2 * AnazhRealm.PLAYER_WALL_RADIUS + 0.01;
        const furcht = Math.max(0, this._kreaturFurchtErinnert(b.leib));
        const raum = AnazhRealm.BEWOHNER.spielerRaumM * (1 + furcht * AnazhRealm._furchtGesetz().F.fluchtJeFurcht);
        return 2 * AnazhRealm.PLAYER_WALL_RADIUS + 0.01 + raum;
    }

    // DIE ZEUGEN (mensch.K5): jeder Bewohner draußen auf `zeugeM` um den Ort o, an dem der Spieler ein Wesen schlägt
    // (`damageCreature`), erinnert die Gewalt — das EINE Gedächtnis (`_creatureRemember` auf seinem Leib), das Furcht-Gesetz wiegt
    // sie (`gewalt`); bei der nächsten Begegnung lässt er dem Spieler mehr Raum (`_bewohnerSpielerAbstand`). DER ORT ERINNERT
    // (siedlung.K4 Staffel 2): sah ein Bewohner die Tat, trägt das Gedächtnis seines Orts sie als Akte (`settlementCells[k].akten`,
    // die Uhr der Welt, die letzten `WACHSTUM.aktenMax`) — ihre Furcht bremst sein Wachstum (fachwerk `wachstum`).
    _bewohnerZeuge(o) {
        const R2 = AnazhRealm.BEWOHNER.zeugeM ** 2;
        const cells = (this.state.worldMeta || {}).settlementCells || {};
        for (const S of (this._bewohnerSiedlungen || new Map()).values()) {
            let sah = false;
            for (const b of S.liste || [])
                if (b.leib && !b.drinnen && (b.leib.position.x - o.x) ** 2 + (b.leib.position.z - o.z) ** 2 < R2) {
                    this._creatureRemember(b.leib, "gewalt", { von: "spieler" });
                    sah = true;
                }
            const c = sah && cells[S.key];
            if (!c || !c.wachs) continue;
            c.akten = (c.akten || []).concat([{ t: this.state.spielZeit, type: "gewalt" }]);
            c.akten.splice(0, c.akten.length - globalThis.__fachwerkCore.WACHSTUM.aktenMax);
        }
    }

    // DAS SOLL DER STUNDE (mensch.K2): der Plan des Gesetzes (koerper-core `tagesPlan`) aus dem Samen, der Rolle seines
    // Hauses und seinen Orten — drinnen ist das Ziel die Tür. Liefert { ziel, drinnen, akt }. Leser: das Ziel
    // (`_bewohnerZiel`), die Wende (`_bewohnerWende`).
    _bewohnerSoll(b, stunde) {
        const KC = window.__koerperCore;
        if (!KC || typeof KC.tagesPlan !== "function") return AnazhRealm._kernPflichtBruch("koerper:tagesPlan");
        const o = b.orte;
        const soll = KC.tagesPlan(b.same, b.rolle, o.heim, o.werk, stunde, o.platz, o.besuch);
        return { ziel: soll.drinnen ? o.tuer : soll.ort, drinnen: soll.drinnen, akt: soll.akt };
    }

    // DAS GEMÜT DES BEWOHNERS (w28-mensch-menge — der Leser von `b.akt`): die Haltung seines Akts aus dem Gesetz des Tags (koerper
    // `tagesHaltung`, seine Rolle) und die Furcht, die er erinnert (`_kreaturFurchtErinnert`: Kummer und Aufruhr, wie die Bedrohung
    // sie dem Spieler speist) — die EINE Emotions-Brücke (`_koerperMotionProfile`) wählt daraus das Profil seines Stands. Bis hier
    // ging jeder Leib mit `null`: der Akt des Tags und die Furcht standen in keinem Bild. Ein Objekt je Bewohner, je Ruf gefüllt.
    _bewohnerGemuet(b) {
        const KC = window.__koerperCore;
        if (!KC || typeof KC.tagesHaltung !== "function") return AnazhRealm._kernPflichtBruch("koerper:tagesHaltung");
        const g = b.gemuet || (b.gemuet = { haltung: null, sorrow: 0, chaos: 0 });
        g.haltung = KC.tagesHaltung(b.akt, b.rolle);
        g.sorrow = g.chaos = b.leib ? Math.max(0, this._kreaturFurchtErinnert(b.leib)) : 0;
        return g;
    }

    // DAS ZIEL DER STUNDE (mensch.K2): das Soll (`_bewohnerSoll`). Ein neues Ziel verwirft den alten Weg; wer drinnen war und
    // hinaus soll, tritt aus der Tür (wieder gezeichnet) — im Takt (`tuer`) erst, wenn sie frei ist (`hinaus`, `_tickBewohner`).
    // Liefert, ob sich das Bild ändert.
    _bewohnerZiel(b, stunde, tuer = false) {
        const soll = this._bewohnerSoll(b, stunde);
        const ziel = soll.ziel;
        b.akt = soll.akt;
        if (ziel === b.ziel) return false;
        // DIE LAGE DES TAGS (mensch.K2 Staffel 2: sein Tag ist f(Same, t)): der neue Weg beginnt, wo ihn die Ankunft begänne
        // (`_bewohnerAnkunft`, derselbe Weg ohne Zuschauer) — an der Wende `w` (der Takt bemerkt sie bis planH später) so weit
        // längs des Wegs seines Tags (`b.tag`, `_bewohnerWeg`), wie sein Tempo ihn seit dessen Wende trüge; trug es ihn ans
        // Ziel, oder stand er dort (auch beiseite, `_bewohnerPlatz`), von seinem Stand — beides nur, wo er in gerader Linie frei
        // hingeht (`_bewohnerWand`); sonst (er wartet in der Tür, blieb ohne Weg) geht er von hier. Bis mensch.K3 Staffel 2
        // begann er, wo er nach dem Ausweichen stand: 3,9 m daneben fand die Strecke einen um 3,85 m kürzeren Weg, und wer
        // nach 1 h kam, fand ihn 4,2 m fort.
        const g = b.leib;
        const w = tuer ? (this._bewohnerWende(b, stunde - 2 * AnazhRealm.BEWOHNER.planH, stunde) ?? stunde) : stunde;
        let ende = b.da && b.ziel;
        b.tagVon = null;
        if (b.weg && b.tag) {
            const p = b.tag.pts;
            let L = ((((w - b.tag.ab) % 24) + 24) % 24) * this._bewohnerStundeSek() * b.tempo;
            for (let i = 1; i < p.length && !b.tagVon; i++) {
                const [dx, dz] = [p[i].x - p[i - 1].x, p[i].z - p[i - 1].z];
                const d = Math.hypot(dx, dz);
                if (L < d) b.tagVon = { x: p[i - 1].x + (dx * L) / d, z: p[i - 1].z + (dz * L) / d };
                else L -= d;
            }
            ende = !b.tagVon;
        }
        const D = b.tagVon || (ende ? b.ziel : null);
        const X = g && { x: g.position.x, z: g.position.z };
        const nah = D && X && (Math.hypot(X.x - D.x, X.z - D.z) < 0.5 || !this._bewohnerWand(X, D));
        if (!nah) b.tagVon = null;
        b.stand = nah && !b.tagVon ? b.ziel : null;
        b.tagAb = w;
        b.ziel = ziel;
        b.drehen = null;
        b.drinnenSoll = soll.drinnen;
        b.da = false;
        b.weg = null;
        b.wegRest = null;
        b.hinaus = tuer && b.drinnen && !soll.drinnen;
        b.platz = false;
        if (tuer) [b.zielUhr, b.gegangen] = [b.uhr - (stunde - w) * this._bewohnerStundeSek(), 0];
        if (b.drinnen && !soll.drinnen && !b.hinaus) {
            b.drinnen = false;
            if (b.leib) b.leib.userData._drinnen = false;
            return true;
        }
        return false;
    }

    // DIE ANKUNFT (mensch.K2 Staffel 2: wer nach der Abwesenheit kommt, findet jeden, wo er ihn gesehen hätte): der Tag ist
    // f(Same, t), auch für den, den keiner sah — die Liste entsteht nach der Abwesenheit neu, die Uhr sprang. Der Leib steht am
    // Ziel der Stunde vor `ankunftH` Stunden und spielt die Wenden seines Solls bis jetzt nach (`_bewohnerWende`): je Wende
    // das Ziel (`_bewohnerZiel`), der Weg (`_bewohnerWeg`) und so viele Sekunden des Gangs (`_bewohnerSchritt`), wie die Uhr
    // bis zur nächsten Wende trägt (`_bewohnerStundeSek`) — derselbe Gang wie im Takt, nur ohne Zuschauer. Wer ankam, schaut
    // auf sein Ziel; drinnen gehört er keinem Feld, draußen trägt ihn sein Feld (`_kzLeib`).
    _bewohnerAnkunft(S, b, stunde, echt, p) {
        const BW = AnazhRealm.BEWOHNER;
        const g = b.leib;
        const sek = this._bewohnerStundeSek();
        let h = stunde - BW.ankunftH;
        const s0 = this._bewohnerSoll(b, h);
        this._bewohnerStellen(b, g, s0.ziel.x, s0.ziel.z);
        if (Number.isFinite(s0.ziel.blick)) g.rotation.y = s0.ziel.blick;
        Object.assign(b, { ziel: s0.ziel, akt: s0.akt, drinnenSoll: s0.drinnen, drinnen: s0.drinnen, da: true });
        Object.assign(b, { weg: null, wegRest: 0, stand: null, drehen: null, gehDt: 0 });
        for (let n = 0; n < BW.ankunftWenden && h < stunde; n++) {
            const w = this._bewohnerWende(b, h, stunde);
            if (b.weg) this._bewohnerSchritt(b, ((w === null ? stunde : w) - h) * sek);
            if (w === null) break;
            h = w;
            this._bewohnerZiel(b, h);
            if (!b.da && !b.weg) this._bewohnerWeg(S, b);
        }
        if (b.drehen != null) {
            g.rotation.y = b.drehen;
            b.drehen = null;
        }
        b.zielUhr = NaN; // er steht, wo sein Tag ihn jetzt sieht: nichts aufzuholen
        // DIE ANKUNFT NIMMT KEINEM DEN RAUM (mensch.K3 Staffel 2, siedlung.K3): der Tag ist f(Same, t) ohne die anderen — zwei
        // Wege, die dasselbe Netz-Stück teilen, setzten zwei Ankommende 0,57 m auseinander (das Hangdorf um 12,50 Uhr: der
        // Feldarbeiter #809070 und der Hofmann #724672 auf dem Umweg um #809070, Berührung vor dem ersten Schritt). Wer neben
        // einem steht, der schon draußen ist (`_bewohnerNaechster`, das Raster des Takts samt der Ankommenden), tritt beiseite
        // wie der Stehende im Gedränge (`_bewohnerPlatz`: der Ring bis 1,8 m, frei von Wand und Leib); sein Weg nimmt ihn
        // zurück auf seine Linie (`_bewohnerLinie`).
        const K = 2 * AnazhRealm.PLAYER_WALL_RADIUS + 0.01;
        const g0 = { x: g.position.x, z: g.position.z };
        if (!b.drinnen && S.raster && this._bewohnerNaechster(S, b, g0.x, g0.z) < K)
            for (let r = 0.6, fort = false; r <= 1.81 && !fort; r += 0.6)
                for (let i = 0; i < 12 && !fort; i++) {
                    const P = { x: g0.x + Math.cos((i * Math.PI) / 6) * r, z: g0.z + Math.sin((i * Math.PI) / 6) * r };
                    if (this._bewohnerNaechster(S, b, P.x, P.z) < K) continue;
                    if (this._bewohnerWand(P, P, true) || this._bewohnerWand(g0, P)) continue;
                    g.position.x = P.x;
                    g.position.z = P.z;
                    fort = true;
                }
        // die Stufe am Ende neu (der Schritt fragt die Stufe ab der Höhe seines letzten Stands — nach einem Weg ohne
        // Zwischenschritte läge die Frage am Hang unter oder über ihr)
        this._bewohnerStellen(b, g, g.position.x, g.position.z);
        g.userData._drinnen = b.drinnen;
        this._leibMatrix(g);
        if (g.userData._kzGlieder) for (const gl of g.userData._kzGlieder) this._weltFeldAktiv(gl.handle, false);
        if (echt && !b.drinnen) this._kzLeib(g, this._lodAuge() || p, true);
        if (echt && !b.drinnen && this._kzBesitztFeld(g)) this._bewohnerFeldLage(b, S);
    }

    // DIE NÄCHSTE WENDE des Solls in (von, bis]: die erste Stunde, an der `_bewohnerSoll` ein anderes Ziel nennt — gerastert
    // auf `wendeH`, dann halbiert bis 1e-9 h: jede Suche trifft dieselbe Wende, gleich ab wo (der Takt und die Ankunft
    // beginnen dort den Weg, `_bewohnerZiel`). null, wenn keine.
    _bewohnerWende(b, von, bis) {
        const z0 = this._bewohnerSoll(b, von).ziel;
        for (let lo = von; lo < bis; lo += AnazhRealm.BEWOHNER.wendeH) {
            let hi = Math.min(bis, lo + AnazhRealm.BEWOHNER.wendeH);
            if (this._bewohnerSoll(b, hi).ziel === z0) continue;
            while (hi - lo > 1e-9) {
                const m = (lo + hi) / 2;
                if (this._bewohnerSoll(b, m).ziel === z0) lo = m;
                else hi = m;
            }
            return hi;
        }
        return null;
    }

    // DIE SEKUNDEN EINER SPIELSTUNDE: der Tag des Spielers (`dayLengthMinutes`, Echtzeit je Zyklus) — der Gang der Uhr
    // (`tickDayNight`) rückt sie um delta / (Minuten · 60) Tage je Takt.
    _bewohnerStundeSek() {
        return ((this.state.dayLengthMinutes || AnazhRealm.DAY_LENGTH_DEFAULT_MINUTES) * 60) / 24;
    }

    // DER WEG (mensch.K2, „nie durch Hauswände"): vom Stand des Leibs zum Ziel — die Tür liegt in der Wand: wer aus ihr tritt
    // oder in sie geht, geht über den Punkt vor ihr (`orte.vor`, `BEWOHNER.vorM`); dazwischen die Strecke
    // (`_bewohnerStrecke`). Jeder geht
    // in seiner Spur (`spurM` quer zum Weg, aus dem Samen — die Menge geht nebeneinander, nicht durcheinander).
    _bewohnerWeg(S, b) {
        const g = b.leib;
        const o = b.orte;
        // er geht von seinem Stand (ein Ort seines Tags: Anschluss und freie Linien gemerkt) oder, mitten im Weg, von der Lage
        // seines Tags (`_bewohnerZiel`), sonst von hier — wer noch in seiner Tür steht (näher als `vorM`), geht aus ihr über
        // den Punkt vor ihr
        const lage = b.tagVon || g.position;
        const nahTuer = Math.hypot(lage.x - o.tuer.x, lage.z - o.tuer.z) < AnazhRealm.BEWOHNER.vorM;
        const von = b.stand || (nahTuer ? o.tuer : { x: lage.x, z: lage.z });
        b.tagVon = null;
        const ziel = b.ziel;
        const a = von === o.tuer ? o.vor : von;
        const e = ziel === o.tuer ? o.vor : ziel;
        const spur = (((b.same >>> 8) & 255) / 255 - 0.5) * 2 * AnazhRealm.BEWOHNER.spurM;
        const strecke = a === e ? [] : this._bewohnerStrecke(S, a, e, spur);
        // kein Weg (laut, `_bewohnerStrecke`): er bleibt, wo er steht — nie geradeaus durch die Wand
        if (!strecke) {
            b.da = true;
            b.wegRest = 0;
            return;
        }
        const pts = (a !== von ? [a] : []).concat(strecke);
        if (von === b.stand && Math.hypot(g.position.x - von.x, g.position.z - von.z) > 1e-3) pts.unshift(von); // vom Stand
        if (e !== ziel) pts.push(ziel);
        if (!pts.length) pts.push(ziel);
        // je Punkt der Rest-Weg bis zum Ziel (die Linse liest, dass er schrumpft)
        const rest = new Float64Array(pts.length);
        for (let i = pts.length - 2; i >= 0; i--)
            rest[i] = rest[i + 1] + Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].z - pts[i].z);
        b.weg = pts;
        b.wegRestAb = rest;
        b.wi = 0;
        // der Weg seines Tags ab seinem Anfang und die Stunde seiner Wende (`_bewohnerZiel` liest ihn an der nächsten Wende);
        // wer neben dem Anfang steht, geht auf das erste Bein zurück (`_bewohnerLinie`), sein Vorsprung zählt als gegangen
        b.tag = { pts: [von].concat(pts), ab: b.tagAb };
        b.linie = von;
        const h = Math.hypot(pts[0].x - g.position.x, pts[0].z - g.position.z);
        b.wegRest = h + rest[0];
        b.gegangen = (b.gegangen || 0) + Math.hypot(pts[0].x - von.x, pts[0].z - von.z) - h;
    }

    // DIE GERADE (mensch.K3): frei in gerader Linie (`_bewohnerWand`) → [ziel]; schneidet EIN Bau sie, geht er um ihn — über
    // den Seitenpunkt neben seinen Boxen (die Kapsel und die Spur, `spurM`, Abstand), links oder rechts der Linie, den
    // kürzeren, dessen beide Beine frei sind: die Laterne an der Gasse, der Baum am Platz kosten einen Schritt zur Seite, nie
    // den Weg über das Netz (Steintal auf der Trasse: 22 m gerade, über das Netz ≥ 45 m — der Gang heim riss an der Wende zur
    // Arbeit). null: es trägt das Netz.
    _bewohnerGerade(von, ziel, frei = null, m = AnazhRealm.PLAYER_WALL_RADIUS + AnazhRealm.BEWOHNER.spurM) {
        const wand = this._bewohnerWand(von, ziel);
        if (!wand) return [ziel];
        const l = Math.hypot(ziel.x - von.x, ziel.z - von.z);
        const [dx, dz] = [(ziel.x - von.x) / l, (ziel.z - von.z) / l];
        let [lo, hi, t, n] = [Infinity, -Infinity, 0, 0];
        for (const b of wand.blockerAABBs)
            for (const [x, z] of [
                [b.minX, b.minZ],
                [b.maxX, b.minZ],
                [b.minX, b.maxZ],
                [b.maxX, b.maxZ],
            ]) {
                const s = (z - von.z) * dx - (x - von.x) * dz;
                [lo, hi, t, n] = [Math.min(lo, s), Math.max(hi, s), t + (x - von.x) * dx + (z - von.z) * dz, n + 1];
            }
        t = Math.max(0, Math.min(l, t / n));
        let best = null;
        for (const s of [hi + m, lo - m]) {
            const p = { x: von.x + dx * t - dz * s, z: von.z + dz * t + dx * s };
            const lp = Math.hypot(p.x - von.x, p.z - von.z) + Math.hypot(ziel.x - p.x, ziel.z - p.z);
            if (frei && !frei(p)) continue;
            if (!(best && best.l <= lp) && !this._bewohnerWand(von, p) && !this._bewohnerWand(p, ziel))
                best = { l: lp, p };
        }
        return best ? [best.p, ziel] : null;
    }

    // DIE STRECKE zwischen zwei Orten: frei in gerader Linie oder um die EINE Wand, die sie schneidet (`_bewohnerGerade`, bis
    // `direktM`; je Ort gemerkt), sonst über
    // das Wege-Netz des Dorf-Plans (`_bewohnerNetz`: Straßen und Feldwege, ihre Kreuzungen): an den nächsten frei
    // erreichbaren Knoten, den kürzesten Weg über freie Kanten (je Start-Knoten EIN Baum, gemerkt), vom Knoten des Ziels frei
    // zum Ziel. Jedes Gemerkte gilt für den Stand der Wache (`_blockerWacheMelden`): wechselt eine Hülle, fällt es. Die Spur
    // neben der Mitte (`spurM`) geht nur, wo jedes ihrer Beine frei ist (`_bewohnerWand`) — sonst geht er die Mitte der
    // Gasse, deren Kanten frei sind — auf der Trasse den Gehweg seiner Seite (`seite`), erst wo auch der nicht trägt, ihre Mitte.
    // Kein Weg: laut, und null (er bleibt, `_bewohnerWeg`).
    _bewohnerStrecke(S, von, ziel, spur, seite = Math.sign(spur), beide = true) {
        const stand = S.wache.stand;
        if (von._wegeStand !== stand) {
            von._wegeStand = stand;
            von._direkt = null;
            von._knoten = von._ausweg = undefined;
        }
        let direkt = von._direkt ? von._direkt.get(ziel) : undefined;
        if (direkt === undefined) {
            direkt =
                Math.hypot(ziel.x - von.x, ziel.z - von.z) < AnazhRealm.BEWOHNER.direktM
                    ? this._bewohnerGerade(von, ziel)
                    : null;
            // die Gerade quert die Fahrbahn, nie geht sie längs (`_verkehrQuert`) — sonst trägt das Netz mit seinem Gehweg
            if (direkt && S.verkehr && !direkt.every((q, i) => this._verkehrQuert(S, i ? direkt[i - 1] : von, q)))
                direkt = null;
            (von._direkt || (von._direkt = new Map())).set(ziel, direkt);
        }
        if (direkt) return direkt.slice();
        const N = this._bewohnerNetz(S);
        if (ziel._wegeStand !== stand) {
            ziel._wegeStand = stand;
            ziel._direkt = null;
            ziel._knoten = ziel._ausweg = undefined;
        }
        // DER AUSWEG (mensch.K3 Staffel 2): erreicht ein Ort keinen Knoten frei (der Baum, der Fels des Wald-Takts kam nach der
        // Liste), geht der Weg über den nächsten freien Punkt bei ihm, der einen erreicht (`_bewohnerAusweg`)
        let a = this._bewohnerAnschluss(N, von);
        let e = this._bewohnerAnschluss(N, ziel);
        const ausA = a < 0 ? this._bewohnerAusweg(N, von, !!this._bewohnerWand(von, von)) : null;
        const ausE = e < 0 ? this._bewohnerAusweg(N, ziel) : null;
        if (ausA) a = ausA._knoten;
        if (ausE) e = ausE._knoten;
        const vor = a >= 0 && e >= 0 ? this._bewohnerBaum(N, a) : null;
        if (!vor || (e !== a && vor[e] < 0)) {
            this._bruchMelden(
                `BEWOHNER: kein Weg im Dorf-Plan „${S.plan.name || "?"}" von ${von.x.toFixed(1)}/${von.z.toFixed(1)} zu ${ziel.x.toFixed(1)}/${ziel.z.toFixed(1)}`
            );
            return null;
        }
        const kette = [];
        for (let k = e; k >= 0 && k !== a; k = vor[k]) kette.push(k);
        kette.push(a);
        kette.reverse();
        // DER GEHWEG (PFLICHT-OFFEN C): auf der Trasse des Verkehrs (ein Weg ab fachwerk VERKEHR_GESETZ.breiteM) geht er an
        // ihrem Rand, auf der Seite seiner Spur (`gehwegM` von der Mitte, gestreut um `gehwegBreiteM`), um die Ecke auf dem
        // Schnitt der Ränder beider Beine (höchstens doppelt so fern) — die Fahrbahn quert er nur, wo sein Weg sie kreuzt. Bis
        // hier ging die Menge ±`spurM` um die Mitte der Trasse, und jeder Wagen hielt vor ihr (10 Uhr: die Kreuzung der
        // Metropole stand, ihr Halter wartete auf einen Gehenden zwischen den Wagen).
        const BW = AnazhRealm.BEWOHNER;
        const breit = S.verkehr && S.verkehr.wagen.length ? globalThis.__fachwerkCore.VERKEHR_GESETZ.breiteM : Infinity;
        const geh = seite * BW.gehwegM + (spur / BW.spurM) * BW.gehwegBreiteM;
        // DIE FAHRBAHN TRÄGT DEN FUSS NIE (das EINE Gesetz der Straße, `_verkehrAufSpur` ohne Rand: kein Punkt seines Wegs, an dem
        // seine Kapsel die Bahn eines Wagens berührt)
        const fuss = (p) => !this._verkehrAufSpur(S, p.x, p.z, 0);
        const alt = [];
        const pts = kette.map((k, i) => {
            const q = N.knoten[k];
            const q0 = N.knoten[kette[Math.max(0, i - 1)]];
            const q1 = N.knoten[kette[Math.min(kette.length - 1, i + 1)]];
            const l = Math.hypot(q1.x - q0.x, q1.z - q0.z) || 1;
            const p = { x: q.x - ((q1.z - q0.z) / l) * spur, z: q.z + ((q1.x - q0.x) / l) * spur };
            if (!seite || !(q.w >= breit)) return p;
            // die Normalen beider Beine (ein Ende: die des einen), ihre Summe n: der Rand um die Ecke liegt um 2·geh / |n|² · n —
            // steht er dort in einer Wand (die Laterne am Bordstein, auf seiner Linie) oder in der Bahn eines Wagens (die Ecke in
            // der Kreuzung, wo die Abbieger fahren; die Spur, die einem Stand auswich), gilt der nächste Ort längs n je Viertelmeter
            // (hinaus zuerst, höchstens `gehwegM`; neben der Bahn eines Wagens bis zum Doppelten — die Ecke hinter dem Bogen des
            // Abbiegers), der beides nicht ist — sonst der nächste ohne Wand. Bis hier stand der Rand der
            // Kreuzung am Markt in der Laterne #410: kein Bein trug ihn, die Menge ging auf ihrer Spur 0,7 m neben der Mitte. Bis
            // w4-verkehr-c2 suchte er neben der Fahrbahn nur bis `gehwegM`: die Ecken der Kreuzung am Markt liegen im Bogen der
            // Abbieger, kein Ort trug, und der Weg vom Markt zur Tür des Gasthauses ging drei Punkte über ihre Mitte (stadt-voll
            // nach dem Sprung auf 23 Uhr: 522 von 682 Schritten auf der Fahrbahn, der Anteil 6,1 %).
            const [l0, l1] = [Math.hypot(q.x - q0.x, q.z - q0.z), Math.hypot(q1.x - q.x, q1.z - q.z)];
            const n0 = l0 > 1e-6 ? [(q0.z - q.z) / l0, (q.x - q0.x) / l0] : null;
            const n1 = l1 > 1e-6 ? [(q.z - q1.z) / l1, (q1.x - q.x) / l1] : n0;
            if (!n1) return p;
            const n = [(n0 || n1)[0] + n1[0], (n0 || n1)[1] + n1[1]];
            const f = (2 * geh) / Math.max(1, n[0] * n[0] + n[1] * n[1]);
            const df = (Math.sign(geh) * 0.25) / (Math.hypot(n[0], n[1]) || 1);
            alt[i] = p; // trägt der Rand dort nicht (die Laterne, der Baum am Rand), geht er um sie — sonst in seiner Spur
            const ort = (k) => {
                const s = k & 1 ? (k + 1) >> 1 : -(k >> 1); // 0, +1, −1, +2, …: hinaus zuerst
                return { x: q.x + n[0] * (f + s * df), z: q.z + n[1] * (f + s * df) };
            };
            // die billige Probe zuerst (Lehre 25): die Fahrbahn, dann die Wand
            for (let k = 0; k <= 16 * BW.gehwegM; k++) {
                const c = ort(k);
                if (fuss(c) && !this._bewohnerWand(c, c)) return c;
            }
            for (let k = 0; k <= 8 * BW.gehwegM; k++) {
                const c = ort(k);
                if (!this._bewohnerWand(c, c)) return c;
            }
            return ort(0);
        });
        if (ausA) (pts.unshift(ausA), alt.unshift(undefined));
        if (ausE) pts.push(ausE);
        pts.push(ziel);
        if (seite)
            for (let i = 0; i < pts.length; i++) {
                const a = i ? pts[i - 1] : von;
                if (!this._bewohnerWand(a, pts[i])) continue;
                // DIE WAND AM BEIN (die Laterne, die Wandlaterne, der Stand am Bordstein, die Ecke am Stand): wo Wagen fahren, geht
                // er um sie neben der Fahrbahn (`_bewohnerGerade`: der Seitenpunkt neben ihren Boxen, Kapsel und `umRandM`), sonst
                // knapp an ihr vorbei — erst wo beides nicht trägt, in seiner Spur; ohne Spur-Punkt am Bein geht der Weg die Mitte der
                // Gassen und den Gehweg der Trassen, erst wo auch der nicht trägt, ganz in der Mitte. Bis hier fiel er an jeder Laterne
                // auf der Linie (13 von 33 der Metropole, 2,75–3,5 m von der Mitte) in seine Spur, 0,8 m neben die Mitte der Trasse,
                // und am ersten Bein vom Stand jeder Weg auf die Mitte der Trasse — zwischen die Wagen.
                const m = AnazhRealm.PLAYER_WALL_RADIUS + BW.umRandM;
                const um =
                    breit < Infinity &&
                    (this._bewohnerGerade(a, pts[i], fuss, m) || this._bewohnerGerade(a, pts[i], null, m));
                if (um && um.length === 2) {
                    pts.splice(i, 0, um[0]);
                    alt.splice(i, 0, undefined);
                    continue;
                }
                const r = alt[i] ? i : i && alt[i - 1] ? i - 1 : -1;
                if (r < 0) return this._bewohnerStrecke(S, von, ziel, 0, spur ? seite : 0);
                [pts[r], alt[r], i] = [alt[r], undefined, r - 1];
            }
        // DER WEG BETRITT DIE FAHRBAHN NUR, UM SIE ZU QUEREN: jeder Punkt zwischen Anfang und Ziel, an dem seine Kapsel die Bahn
        // eines Wagens berührt (der Knoten einer Gasse in der Trasse, die Ecke, wo zwei Wege sich im Winkel kreuzen, der Rand in
        // der Kreuzung), fällt, wo sein Vorgänger den Nachfolger frei erreicht — die Fahrbahn quert er dann in einem Bein. Bis hier
        // ging die Menge auf diesen Punkten längs der Fahrbahn: das Zickzack an der Kreuzung südwestlich des Markts (Kehre auf
        // 818,9/466,9, 0,9 m neben der Spur).
        // Eine Folge solcher Punkte fällt ganz, wo das Bein vom Punkt vor ihr zum ersten danach die Fahrbahn höchstens auf der
        // doppelten Breite ihrer Bahnen (`_verkehrQuert`) trägt — es quert sie, nie geht es längs.
        if (S.verkehr)
            for (let i = 0; i < pts.length - 1; i++) {
                if (fuss(pts[i])) continue;
                let j = i;
                while (j < pts.length - 1 && !fuss(pts[j])) j++;
                const a = i ? pts[i - 1] : von;
                if (this._verkehrQuert(S, a, pts[j]) && !this._bewohnerWand(a, pts[j])) pts.splice(i, j - i);
                else i = j;
            }
        // DIE SEITE DES GEHWEGS (PFLICHT-OFFEN C): wo Wagen fahren, geht er die Seite, die ihn weniger über die Fahrbahn führt
        // (`_verkehrFahrbahnM`; gleich viel: seine) — bis w4-verkehr-c2 ging jeder die Seite seines Samens: vom Markt zur Tür des
        // Gasthauses querte der Weg vier Arme der Kreuzung (stadt-voll 23 Uhr, 7:1:1: 22,5 m von 94,6 m auf der Fahrbahn)
        if (beide && seite && breit < Infinity) {
            const anders = this._bewohnerStrecke(S, von, ziel, spur, -seite, false);
            if (anders && this._verkehrFahrbahnM(S, von, anders) < this._verkehrFahrbahnM(S, von, pts)) return anders;
        }
        return pts;
    }

    // DER SCHRITT: der Leib geht `tempo · dt` Meter längs seines Wegs — oder mit dem Tempo des Ausweichens (`lenk`,
    // `_bewohnerGehen`; nah am nächsten Punkt gilt der Punkt als erreicht) —, steht auf dem Boden jedes Körpers
    // (`_koerperBodenUnter`, die Sohle PLAYER_FOOT_OFFSET unter dem Ursprung), wendet sich mit der Wendegrenze des
    // Steuer-Gesetzes zum Gang; am Ziel steht er (`da`), drinnen geht er ins Haus. Liefert, ob sich die Lage änderte.
    _bewohnerSchritt(b, dt, lenk = null) {
        const g = b.leib;
        const pts = b.weg;
        let x = g.position.x;
        let z = g.position.z;
        let rest = lenk ? 0 : b.tempo * dt;
        let rx = 0;
        let rz = 0;
        if (lenk && (lenk.vx || lenk.vz)) {
            const l = Math.hypot(lenk.vx, lenk.vz);
            [x, z, rx, rz] = [x + lenk.vx * dt, z + lenk.vz * dt, lenk.vx / l, lenk.vz / l];
            // der Punkt gilt als erreicht, wenn das Bein von hier zum nächsten frei ist (sonst, und am Ende seines Wegs, geht er
            // ihn genau)
            const [n, d] = [pts[b.wi + 1], Math.hypot(pts[b.wi].x - x, pts[b.wi].z - z)];
            if (d <= Math.max(0.3, l * dt) && (n ? !this._bewohnerWand({ x, z }, n) : d < 1e-6))
                this._bewohnerErreicht(b);
        }
        while (rest > 0 && b.wi < pts.length) {
            const q = pts[b.wi];
            const e = this._bewohnerLinie(b, x, z); // wer neben seinem Bein geht, geht auf es zurück
            const dx = e.x - x;
            const dz = e.z - z;
            const d = Math.hypot(dx, dz);
            if (d > 1e-6) {
                rx = dx / d;
                rz = dz / d;
            }
            if (d <= rest && e === q) {
                x = q.x;
                z = q.z;
                rest -= d;
                this._bewohnerErreicht(b);
            } else {
                x += rx * Math.min(rest, d);
                z += rz * Math.min(rest, d);
                rest = 0;
            }
        }
        // DER GRUND DES SCHRITTS (Lehre 22: Körper stehen auf dem Gesetz): der Boden unter dem Körper (`_koerperBodenUnter`, ab
        // seiner Sohle — nie das Dach der Höhle; der Feld-Scan endet bis `BEWOHNER.sohleM` unter der Kante), je halben Meter
        // neu und je Schritt, wo eine Box des Blocker-Netzes in seine Reichweite kommt — dort urteilt die Wand an seiner Sohle;
        // die Stufe darauf trägt `_bewohnerTritt`. Bis mensch.K3 Staffel 2 trug auch dort der Grund des letzten halben Meters:
        // am Hang neben dem Sockel der Laterne #15942 stand der Gehende tiefer, als seine Wand ihn fragte. Es zählt die Box, nie
        // die Hülle ihres Baus (`_blockerNahe` nennt jeden Bau, dessen Kasten nah ist): bis bewohner-takt las am Markt der
        // Metropole jeder Schritt entlang eines Kastens seinen Grund neu, 10 je Takt statt 5.
        const fuss = AnazhRealm.PLAYER_FOOT_OFFSET * b.groesse;
        const sohle = g.position.y - fuss;
        const kand = this._bewohnerWandKand || (this._bewohnerWandKand = []);
        kand.length = 0;
        this._blockerNahe(x, z, AnazhRealm.PLAYER_WALL_RADIUS + 0.25, 0, kand);
        const r2 = (AnazhRealm.PLAYER_WALL_RADIUS + 0.25) ** 2;
        const box = kand.some((e) => (e.blockerAABBs || []).some((q) => this._boxAbstand2(q, x, z) <= r2));
        if (box || !(b.grundH !== undefined && (x - b.grundX) ** 2 + (z - b.grundZ) ** 2 < 0.25)) {
            const h = this._koerperBodenUnter(x, sohle, z);
            [b.grundX, b.grundZ, b.grundH] = [x, z, Number.isFinite(h) ? h : sohle];
        }
        g.position.set(x, this._bewohnerTritt(x, z, sohle, b.grundH, kand) + fuss, z); // die Boxen seiner Reichweite trägt kand
        this._tritt(g, x, z, true, false); // sein Gang tritt den Pfad (stoffe.K4)
        if (rx || rz) {
            const TC = globalThis.__tetrapodaCore;
            const om = TC.STEUER_GESETZ.wende * Math.sqrt(TC.GANG_GESETZ.g / b.beinL) * dt;
            const soll = Math.atan2(rx, rz);
            let dw = soll - g.rotation.y;
            dw -= Math.PI * 2 * Math.round(dw / (Math.PI * 2));
            g.rotation.y += Math.max(-om, Math.min(om, dw));
        }
        if (b.wi >= pts.length) {
            b.weg = null;
            b.da = true;
            b.wegRest = 0;
            if (!b.drinnenSoll && Number.isFinite(b.ziel.blick)) b.drehen = b.ziel.blick; // am Ziel der Blick des Plans
            if (b.drinnenSoll) {
                b.drinnen = true;
                g.userData._drinnen = true;
                if (g.userData._kzGlieder)
                    for (const gl of g.userData._kzGlieder) this._weltFeldAktiv(gl.handle, false);
            }
        } else {
            const q = pts[b.wi];
            b.wegRest = Math.hypot(q.x - x, q.z - z) + b.wegRestAb[b.wi];
        }
        return true;
    }

    // DER ERREICHTE PUNKT (mensch.K3 Staffel 2: das Ausweichen ist ein Versatz zur Lage des Tags, der zurückkehrt, nie eine
    // neue Linie): der nächste Punkt des Wegs zählt; ein Punkt des Tags beginnt das Bein (`linie`), der Umweg-Punkt neben
    // einem Stehenden (`_um`, `_bewohnerUm`) nie — nach ihm geht er auf das Bein seines Tags zurück.
    _bewohnerErreicht(b) {
        const q = b.weg[b.wi++];
        if (!q._um) b.linie = q;
    }

    // DIE LINIE (mensch.K2 Staffel 2: sein Tag ist f(Same, t)): wer neben seinem Bein geht (er wich aus), geht nicht schräg zum
    // nächsten Punkt, sondern auf das Bein zurück — auf den Punkt `linieM` voraus auf ihm (vom Anfang des Beins `linie`, ab
    // `_bewohnerWeg`); so steht er, wo ihn die Ankunft sähe. Schneidet der Weg zurück eine Wand (`_bewohnerWand`: das Bein
    // hielt Abstand, der Schräge daneben nicht — der Mast der Laterne #23861, der Tisch des Marktstands), geht er quer auf das
    // Bein (sein Fußpunkt), sonst an seinen Anfang, sonst zum nächsten Punkt. Liefert den Punkt, auf den er geht (auf dem
    // Bein: den nächsten).
    _bewohnerLinie(b, x, z) {
        const [a, q] = [b.linie, b.weg[b.wi]];
        if (q._um) return q;
        const [lx, lz] = a ? [q.x - a.x, q.z - a.z] : [0, 0];
        const L = Math.hypot(lx, lz);
        if (!(L > 1e-3) || Math.abs((x - a.x) * lz - (z - a.z) * lx) / L < 0.05) return q;
        const s0 = ((x - a.x) * lx + (z - a.z) * lz) / (L * L);
        for (const s of [Math.max(0, s0 + AnazhRealm.BEWOHNER.linieM / L), Math.max(0, s0), 0]) {
            const m = s >= 1 ? q : { x: a.x + lx * s, z: a.z + lz * s };
            if (!this._bewohnerWand({ x, z }, m)) return m;
        }
        return q;
    }

    // DER GANG IM TAKT (mensch.K3 Staffel 2, „Ausweichen ohne Berührung"): der Schritt längs des Wegs (`_bewohnerSchritt`);
    // kommt ein Leib in die Vorschau, wählt das Ausweichen (`_bewohnerAusweichen`) das Tempo, und der Schritt lenkt danach.
    // Sein Tempo (`vx`, `vz`) lesen die anderen. Die Ankunft geht ohne Zuschauer (`_bewohnerSchritt` allein). Liefert, ob sich
    // die Lage änderte.
    _bewohnerGehen(S, b, dt) {
        const g = b.leib;
        const BW = AnazhRealm.BEWOHNER;
        const [x0, z0] = [g.position.x, g.position.z];
        // DAS AUFHOLEN (mensch.K2 Staffel 2: sein Tag ist f(Same, t)): wer an der Tür wartete, auswich oder umging, eilt,
        // wer voraus ist, geht langsamer — schneller höchstens um `aufholen`, langsamer um die Hälfte —, bis er so weit ist,
        // wie ihn sein Tempo seit der Wende trüge (`zielUhr`, `_bewohnerZiel`); gezählt wird sein Fortschritt längs des Wegs
        // (der Rest schrumpft; ein Umweg wächst ihn), so findet ihn, wer nach der Abwesenheit kommt (`_bewohnerAnkunft`:
        // derselbe Weg ohne Zuschauer). Das Mehr trägt das Steuer-Gesetz, keine Frist: so viel, wie er bis zur Lage seines
        // Tags wieder abbremsen kann (√(2 · brems · g · Rückstand), im Schritt nie mehr als der Rückstand), das Tempo
        // wechselt mit Anfahren und Bremsen (`STEUER_GESETZ`) — nie ein Sprung, den der Gang nicht geht. Hinter seinem Tag
        // liegt er nie weiter als sein Rest-Weg (am Ziel stünde er nach seinem Tag), und der Rückstand ist sein Vorrang im
        // Gedränge (`rueck`, `_bewohnerAusweichen`). Bis hier holte er je 2 s die Hälfte auf, und es gab der höhere Same
        // Vorrang: im Strom zur Arbeit lag feld #45665 um 8,18 Uhr 4,6 m hinter seinem Tag.
        const TC = globalThis.__tetrapodaCore;
        const [SG, gE] = [TC.STEUER_GESETZ, TC.GANG_GESETZ.g];
        const roh = Number.isFinite(b.zielUhr) ? (b.uhr - b.zielUhr) * b.tempo - b.gegangen : 0;
        const rueck = (b.rueck = Number.isFinite(b.wegRest) ? Math.min(roh, b.wegRest) : roh);
        const mehr = Math.min(Math.sqrt(2 * SG.brems * gE * Math.abs(rueck)), Math.abs(rueck) / dt);
        const v0 = b.tempoJetzt > 0 && Number.isFinite(b.tempoTag) ? b.tempoTag : b.tempo;
        const soll = Math.max(
            v0 - SG.brems * gE * dt,
            Math.min(v0 + SG.beschl * gE * dt, b.tempo + Math.sign(rueck) * mehr)
        );
        b.tempoTag = Math.max(b.tempo / 2, Math.min(b.tempo * (1 + BW.aufholen), soll));
        const dtW = (dt * b.tempoTag) / b.tempo;
        const [weg0, rest0] = [b.weg, b.wegRest];
        let lenk = b.drinnen || !(dt > 0) ? null : this._bewohnerAusweichen(S, b, dtW);
        // DER VORRANG DER FAHRBAHN (PFLICHT-OFFEN C, das EINE Gesetz der Straße): wer neben der Bahn eines Wagens steht und mit dem
        // Tempo seines Wegs in sie träte, wartet am Rand, solange ein Wagen seine Querung beansprucht (`_verkehrVorrang`) — wer
        // schon in ihr geht, geht hinüber, und der Wagen wartet die Dauer seiner Querung. Bis hier nahm der
        // Strom der Menge jede Lücke: die Halter der Kreuzung am Markt warteten auf Querende, 18 Wagen standen dahinter, in 150 s
        // erreichte keiner sein Ziel. Der Rand ist die Bahn, die der Wagen fährt, nie die gemalte Fahrbahn (`_verkehrAufSpur`):
        // bis heim2-w20-wald-kosten fragte nur, wer von ihr auf sie trat — wer am Rand ging, wo die Linie des Halters in der Kurve
        // über die Fahrbahn hinaus reichte, trat ungefragt hinein (stadt-voll 10 Uhr: 43 von 140 Halte-Sekunden der Halter am Markt
        // vor einem Leib neben der Fahrbahn).
        // DIE QUERUNG IST EINE RAUM-ZEIT-RESERVIERUNG (w27-verkehr-leib, `_verkehrVorrang`): am Rand prüft er seine ganze Querung
        // gegen die Zeit der Wagen, nie nur den nächsten Schritt — wer die Fahrbahn betritt, hat sie bis hinter die letzte Bahn.
        if (S.verkehr && b.weg && !b.drinnen && dt > 0) {
            const e = lenk ? null : this._bewohnerLinie(b, x0, z0);
            const l = e ? Math.hypot(e.x - x0, e.z - z0) : 0;
            const [vx, vz] = lenk ? [lenk.vx, lenk.vz] : l > 1e-6 ? [((e.x - x0) / l) * b.tempo, ((e.z - z0) / l) * b.tempo] : [0, 0]; // prettier-ignore
            const vr = (vx || vz) && this._verkehrVorrang(S, x0, z0, vx, vz, b);
            if (vr) lenk = vr === true ? { vx: 0, vz: 0 } : vr; // er wartet am Rand, oder er räumt die Bahn quer
        }
        const bewegt = this._bewohnerSchritt(b, dtW, lenk);
        b.vx = (g.position.x - x0) / dt;
        b.vz = (g.position.z - z0) / dt;
        if (weg0 && (b.weg === weg0 || !b.weg)) b.gegangen = (b.gegangen || 0) + rest0 - (b.wegRest || 0);
        b.tempoJetzt = b.weg ? Math.hypot(b.vx, b.vz) : 0; // der Gang geht das Tempo, das er geht
        return bewegt;
    }

    // DAS AUSWEICHEN (mensch.K3 Staffel 2, das Muster der Menge: Geschwindigkeit abtasten, Zeit bis zur Berührung): je Leib im
    // Raster um ihn (`S.raster`, Zellen `rasterM`) die Zeit, bis sich zwei Kapseln (PLAYER_WALL_RADIUS) berühren, wenn der
    // andere sein Tempo hält — geachtet werden der Stehende und der Gehende mit Vorrang (wer weiter hinter seinem Tag liegt,
    // `rueck` aus `_bewohnerGehen`, gleich weit der höhere Same: so weicht nie jeder jedem, und der Vorrang geht durch). Berührt das Tempo seines Wegs (zum nächsten Punkt, im Tempo des Gesetzes) in
    // `ausweichS` Sekunden keinen und endet sein Schritt in keiner Kapsel, geht er den Weg (bis zu dessen nächstem Punkt,
    // `weg`; ohne Nachbarn null). Sonst wählt er unter
    // `ausweichRichtungen` Richtungen um den Weg × zwei Tempi und dem Stand das mit der kleinsten Strafe: fern vom Weg, fern vom
    // jetzigen Tempo, früh berührt, links vorbei (rechts geht vor) — nie eines, dessen Schritt in einer Kapsel endet (DIE
    // WACHE, gegen jeden: wer schon zu nah steht, rückt nur fort) oder eine Wand schneidet (`_bewohnerWand`: der Schritt und
    // das Bein von dort zum nächsten Punkt des Wegs; keines frei: er steht). Liefert { vx, vz, weg } oder null.
    // DIE FRIST (gestaffelt, dt-gerecht — die Kosten am Gedränge, nie am Takt des Schirms): seine Wahl hält er `lenkS` Sekunden
    // seiner Uhr, bis zum nächsten Punkt seines Wegs; je Takt fragt nur die Wache der Frist, ob sein Schritt in der Kapsel
    // eines Leibs um ihn endet (das Raster, 3 × 3 Zellen um das Ende des Schritts, und der Spieler), dann wählt er neu. Das Tempo des
    // Ausweichens hält er nur, wo sein Weg über die Frist und das Bein von dort keine Wand schneiden; an der Tür wählt er je
    // Takt. Frei geht er auf denselben Punkt (`_bewohnerLinie`), nie über ihn hinaus. Bis bewohner-takt wählte jeder Gehende
    // je Takt neu: am Markt der Metropole (stadt-voll, 7 Uhr, 140 im Nah-Ring) trug das Ausweichen 1,41 von 3,24 ms je Takt.
    _bewohnerAusweichen(S, b, dt) {
        const BW = AnazhRealm.BEWOHNER;
        const p = { x: b.leib.position.x, z: b.leib.position.z }; // eine Kopie: die Wand merkt den Boden am Punkt
        const q = b.weg && b.weg[b.wi];
        if (!q || !S.raster) return null;
        const K = 2 * AnazhRealm.PLAYER_WALL_RADIUS + 0.01;
        const f = b.frist;
        if (f && f.q === q && b.uhr + 1e-6 < f.bis) {
            let c = f.c;
            if (f.weg) {
                const [fx, fz] = [f.ex - p.x, f.ez - p.z];
                const fl = Math.hypot(fx, fz);
                const k = Math.min(1, fl / (b.tempo * dt));
                c = fl > 1e-3 ? { vx: (fx / fl) * b.tempo * k, vz: (fz / fl) * b.tempo * k, weg: true } : undefined;
            }
            // DIE WACHE der Frist, je Takt: sein Schritt endet in keiner Kapsel eines Leibs um ihn — das Raster seiner Siedlung
            // (`S.raster`, die 3 × 3 Zellen um das Ende des Schritts) und der Spieler; wer schon zu nah ist, rückt nur fort. Bis
            // w4-genesis-ort-wirt5 fragte sie nur die Nahen der Wahl (wer ihn in `lenkS` erreichen konnte) — der Schritt eines
            // anderen trägt die Zeit seines Gang-Takts (`_creatureAnimDiv`: 2 Bilder, mit dem Aufholen 0,33 m): am Genesis-Ort trat
            // nachtfahrer #45665 um 7,52 Uhr in die Frist von #952, und beide gingen durcheinander (Berührung 2)
            let frei = c !== undefined;
            if (frei && c) {
                const [x, z] = [p.x + c.vx * dt, p.z + c.vz * dt];
                const trifft = (o) => {
                    if (o === b || o.drinnen || !o.leib) return false;
                    const P = o.leib.position;
                    const d2 = (P.x - x) ** 2 + (P.z - z) ** 2;
                    return d2 < (o.kR || K) ** 2 && d2 < (P.x - p.x) ** 2 + (P.z - p.z) ** 2;
                };
                const [ix, iz] = [Math.floor(x / BW.rasterM), Math.floor(z / BW.rasterM)];
                const SP = this._bewohnerSpieler;
                frei = !(SP && trifft(SP));
                for (let i = -1; frei && i <= 1; i++)
                    for (let j = -1; frei && j <= 1; j++)
                        frei = !(S.raster.get((ix + i) * 2097152 + iz + j) || []).some(trifft);
            }
            if (frei) return c;
        }
        b.frist = null;
        const hl = Math.hypot(q.x - p.x, q.z - p.z);
        if (!(hl > 1e-6) && b.wi + 1 < b.weg.length) {
            this._bewohnerErreicht(b); // er steht auf dem Punkt: der nächste zählt
            return this._bewohnerAusweichen(S, b, dt);
        }
        if (!(hl > 1e-6)) return null;
        const v = b.tempo;
        const e = this._bewohnerLinie(b, p.x, p.z);
        const he = Math.hypot(e.x - p.x, e.z - p.z) || hl;
        const [wx, wz] = [((e.x - p.x) / he) * v, ((e.z - p.z) / he) * v];
        // die Vorschau endet am nächsten Punkt seines Wegs (dort wendet er)
        const H = Math.min(BW.ausweichS, hl / v);
        const nb = this._bewohnerNachbarn || (this._bewohnerNachbarn = []);
        nb.length = 0;
        const [ix, iz] = [Math.floor(p.x / BW.rasterM), Math.floor(p.z / BW.rasterM)];
        const reich = (K + 2 * v * BW.ausweichS) ** 2;
        for (let i = -1; i <= 1; i++)
            for (let j = -1; j <= 1; j++)
                for (const o of S.raster.get((ix + i) * 2097152 + iz + j) || [])
                    if (o !== b && !o.drinnen && o.leib)
                        if ((o.leib.position.x - p.x) ** 2 + (o.leib.position.z - p.z) ** 2 < reich) nb.push(o);
        // DER SPIELER (mensch.K5): ein Leib mit Vorrang; die Vorschau der Berührung hält ihm seinen Abstand frei
        // (`_bewohnerSpielerAbstand`, der weiche Raum — wer schon näher ist, achtet nur noch die Kapsel), die Wache und der
        // Umweg die Kapsel: wo die Gasse den Raum nicht trägt, geht er knapp vorbei, nie steckt er
        const SP = this._bewohnerSpieler;
        let [kS, sD2] = [K, Infinity];
        if (SP && SP.leib) {
            const vor = (v + Math.hypot(SP.vx, SP.vz)) * BW.ausweichS;
            sD2 = (SP.leib.position.x - p.x) ** 2 + (SP.leib.position.z - p.z) ** 2;
            if (sD2 < (4 + vor) ** 2) kS = this._bewohnerSpielerAbstand(b); // 4 m: jenseits des weitesten Raums
            if (sD2 < (kS + vor) ** 2) nb.push(SP);
        }
        // der Wagen des Verkehrs trägt seinen Radius (`kR`, `_verkehrImRaster`: die halbe Breite samt Kapsel) und sein Tempo
        const kO = (o) => (o === SP && sD2 >= kS * kS ? kS : o.kR || K);
        let T = BW.lenkS;
        const halte = (c, weg = false) => (
            (b.frist = T > 0 ? { q, bis: b.uhr + T, c, weg, ex: e.x, ez: e.z } : null),
            c
        );
        if (!nb.length) return halte(null);
        // DER BESETZTE PUNKT: steht ein Leib auf dem nächsten Punkt seines Wegs und ist er neben ihm (näher als zwei Kapseln),
        // gilt der Punkt als erreicht, wenn das Bein von hier zum übernächsten frei ist — das Bein des Tags beginnt an ihm, und
        // er geht auf es zurück (`_bewohnerLinie`). Bis mensch.K3 Staffel 2 sprang er schon 7 m vor dem Punkt auf eine neue
        // Linie von hier: die Sehne schnitt die Ecke, und wer nach 1 h kam, fand den Feldarbeiter #809070 2,06 m fort.
        // DER LEIB TRÄGT SEINEN RADIUS (`kR`, der Wagen im Gedränge, `_verkehrImRaster`) wie in Wache, Frist und Umweg: der Punkt
        // in der Hülle eines Wagens ist besetzt, und neben ihm ist, wer ihm näher als zwei seiner Radien steht. Bis
        // heim2-w20-wald-kosten fragte die Regel zwei Kapseln (K): der Punkt 1,65 m vor der Mitte des Bugs (kR 1,67) war frei und
        // unerreichbar — der Gehende tänzelte 0,5 m vor ihm auf der Stelle, der Wagen wartete auf ihn (stadt-voll 10 Uhr: #7:18:1
        // vor Wagen 8 an der Wende 818/467, eine Fahrt 346 s, ab Minute 9 fuhr keiner der 20 Wagen).
        const n1 = b.weg[b.wi + 1];
        const besetzt = (o) => {
            const r = o.kR || K;
            return hl < 2 * r && Math.hypot(o.leib.position.x - q.x, o.leib.position.z - q.z) < r;
        };
        if (n1 && nb.some(besetzt) && !this._bewohnerWand(p, n1)) {
            this._bewohnerErreicht(b);
            return this._bewohnerAusweichen(S, b, dt);
        }
        // UM DEN STEHENDEN: steht einer auf dem Bein zum nächsten Punkt (vor ihm, näher als zwei Kapseln), geht der Weg über
        // einen Punkt neben ihm — auf der Seite des Beins, sonst der anderen —, dessen Beine keine Wand schneiden und an dem
        // kein Leib steht (`_bewohnerUm`)
        const um = this._bewohnerUm(S, b, p, q, nb, K, !q._um);
        if (um === true) return this._bewohnerAusweichen(S, b, dt);
        // PLATZ MACHEN: führt kein Umweg an ihm vorbei (die Laterne, die Hauswand), tritt der Stehende zur Seite (`_bewohnerPlatz`;
        // der Spieler und der ruhende Wagen nie — um sie tastet das Ausweichen). Der ruhende Wagen ist der Leib mit seinem Radius
        // (`kR`, `_verkehrImRaster`), nie die Marke `wagen`: die trägt auch sein Fahrer zu Fuß (`_verkehrAnlegen`). Bis hier bat
        // keiner den Fahrer an seinem Stand um Platz, und wer zwischen ihm und einer Laterne ging, stand für immer (Kreatur-Linse
        // bewohner, das Start-Dorf im Saum am Siedlungsrand: wohnhaus #601540 um 7,11 Uhr, 0,72 m neben fahrer #952, die Laterne
        // 0,68 m — 1 Steckenbleiber; mit heim2-w13-verkehr-heil dieselbe Enge als Wiederkehr #431794 um 6,57 Uhr 5,65 m → 1,31 m)
        if (um && !um.spieler && !um.kR && this._bewohnerPlatz(S, um, p, q, b)) return halte({ vx: 0, vz: 0 });
        // die Nachbarn als Zahlen, EINMAL je Wahl gelesen (die Lage zu ihm, ihr Tempo, die Kapseln): die Zeit liest die
        // Geachteten (der Stehende und der Gehende mit Vorrang), die Wache die Nächsten (näher als die Kapseln und ein Schritt)
        const nN = nb.length;
        let A = this._bewohnerNbZahl;
        if (!A || A.X.length < nN) {
            const n = Math.max(64, 2 * nN);
            A = this._bewohnerNbZahl = { X: new Float64Array(n), Z: new Float64Array(n), VX: new Float64Array(n), VZ: new Float64Array(n), C: new Float64Array(n), geachtet: [], naechste: [] }; // prettier-ignore
        }
        const { X, Z, VX, VZ, C, geachtet, naechste } = A;
        [geachtet.length, naechste.length] = [0, 0];
        const rb = b.rueck || 0;
        for (let i = 0; i < nN; i++) {
            const o = nb[i];
            [X[i], Z[i], VX[i], VZ[i]] = [o.leib.position.x - p.x, o.leib.position.z - p.z, o.vx || 0, o.vz || 0];
            const r2 = X[i] * X[i] + Z[i] * Z[i];
            C[i] = r2 - kO(o) ** 2;
            const ro = o.rueck || 0;
            // gleich weit ist gleich weit — das Rauschen der Uhr (je 1e-14 m) ist kein Rückstand: dann geht der höhere Same vor
            // (bis heil-wackler entschied es zwischen zwei Pünktlichen, und wer wich, hing an der Laufzeit der Seite)
            const vor = Math.abs(rb - ro) < 1e-6 ? o.same < b.same : rb > ro;
            if (!(o.weg && vor)) geachtet.push(i);
            if (r2 < ((o.kR || K) + v * dt) ** 2) naechste.push(i);
        }
        // DIE WACHE: der Schritt mit (cx, cz) endet in keiner Kapsel (wer schon zu nah ist, entfernt sich) — sonst der, in
        // dessen Kapsel er endete
        const wache = (cx, cz) => {
            const [x, z] = [cx * dt, cz * dt];
            for (const i of naechste) {
                const d2 = (X[i] - x) ** 2 + (Z[i] - z) ** 2;
                if (d2 < (nb[i].kR || K) ** 2 && d2 < X[i] * X[i] + Z[i] * Z[i]) return nb[i];
            }
            return null;
        };
        // die Zeit bis zur Berührung mit dem Tempo (cx, cz) vor dem Stehenden und dem Gehenden mit Vorrang
        const zeit = (cx, cz) => {
            let t = Infinity;
            for (const i of geachtet) {
                const [ux, uz] = [cx - VX[i], cz - VZ[i]];
                const nah = X[i] * ux + Z[i] * uz;
                const aa = ux * ux + uz * uz;
                if (nah <= 0 || aa < 1e-12) continue;
                if (C[i] <= 0) return 0;
                const disk = nah * nah - aa * C[i];
                if (disk >= 0) t = Math.min(t, (nah - Math.sqrt(disk)) / aa);
            }
            return t;
        };
        // frei: er geht seinen Weg — mit Nachbarn bis zu dem Punkt, auf den er geht (`_bewohnerLinie`), nie um die Ecke
        // ungeprüft und nie über ihn hinaus (ein Takt der Ferne trägt Sekunden: vom Fußpunkt vor der Tür schoss er 1,2 m
        // über ihn hinaus an den Pfosten)
        const k = Math.min(1, he / (v * dt));
        if (zeit(wx, wz) >= H && !wache(wx * k, wz * k)) return halte({ vx: wx * k, vz: wz * k, weg: true }, true);
        // IM BEIN DURCH DIE TÜR (es schneidet ihre Wand): kein Ausweichen — er geht, wo keiner steht; sonst wartet er, und wer
        // einem mit Vorrang im Weg steht (der Gehende näher an der Tür: sie ist, worum beide gehen), tritt mit halbem Tempo von
        // ihm fort — nie näher an die Tür (er tritt nie schräg über ihre Schwelle). Wer hineingeht und schon auf dem Bein vor
        // ihr steht (zwischen dem Punkt vor ihr und ihr, eine Kapsel neben dem Bein), hat den Punkt vor ihr erreicht. Bis hier
        // galt der kürzere Rest-Weg: um 13,04 Uhr stand wohnhaus #279359 0,59 m vor seiner Tür mit dem Punkt vor ihr noch im
        // Weg, wich dem Nachbarn auf diesem Punkt und konnte nicht, ohne der Tür näher zu treten — beide standen.
        const o = b.orte;
        const zurTuer = (x, z) => Math.hypot(x - o.tuer.x, z - o.tuer.z);
        if (q === o.tuer || (q === o.vor && zurTuer(p.x, p.z) < BW.vorM)) {
            const [lx, lz] = [(o.tuer.x - o.vor.x) / BW.vorM, (o.tuer.z - o.vor.z) / BW.vorM];
            const [ux, uz] = [p.x - o.vor.x, p.z - o.vor.z];
            if (n1 === o.tuer && ux * lx + uz * lz > 0 && Math.abs(ux * lz - uz * lx) < AnazhRealm.PLAYER_WALL_RADIUS) {
                this._bewohnerErreicht(b);
                return this._bewohnerAusweichen(S, b, dt);
            }
            const w = wache(wx * k, wz * k);
            if (!w) return { vx: wx * k, vz: wz * k, weg: true };
            const [dw, db] = [zurTuer(w.leib.position.x, w.leib.position.z), zurTuer(p.x, p.z)];
            if (!(w.weg && (dw < db || (dw === db && w.same > b.same)))) return { vx: 0, vz: 0 };
            const [rx, rz] = [p.x - w.leib.position.x, p.z - w.leib.position.z];
            const l = (Math.hypot(rx, rz) || 1) / (v * 0.5);
            for (const a of [0, 0.5, -0.5, 1, -1]) {
                const [cx, cz] = [(rx * Math.cos(a) - rz * Math.sin(a)) / l, (rx * Math.sin(a) + rz * Math.cos(a)) / l];
                const nach = { x: p.x + cx * dt, z: p.z + cz * dt };
                if (zurTuer(nach.x, nach.z) >= db && !wache(cx, cz) && !this._bewohnerWand(p, nach))
                    return { vx: cx, vz: cz };
            }
            return { vx: 0, vz: 0 };
        }
        const [bvx, bvz] = [b.vx || 0, b.vz || 0];
        const wahl = [];
        const n = BW.ausweichRichtungen;
        const a0 = Math.atan2(wz, wx);
        // DIE FAHRBAHN (`_verkehrAufSpur`): wer auf dem Gehweg geht (er und der Punkt, auf den er geht, neben ihr), weicht nicht in
        // sie aus, solange ein anderer Schritt trägt — die Strafe `fahrbahnStrafe` für den, der binnen der Frist in ihr endet. Bis
        // hier wich die Menge am Markt der Metropole in die Bahn der Wagen: 57 % ihrer Schritte auf der Fahrbahn.
        const fahr =
            S.verkehr && !this._verkehrAufSpur(S, p.x, p.z, 0) && !this._verkehrAufSpur(S, e.x, e.z, 0)
                ? Math.max(dt, BW.lenkS)
                : 0;
        for (const f of [1, 0.5])
            for (let i = 0; i < n; i++) {
                const a = a0 + (i * 2 * Math.PI) / n;
                const [cx, cz] = [Math.cos(a) * v * f, Math.sin(a) * v * f];
                if (wache(cx, cz)) continue;
                const t = zeit(cx, cz);
                if (t <= dt) continue;
                const links = (cz * wx - cx * wz) / (v * v); // > 0: links des Wegs
                const st =
                    (2 * Math.hypot(cx - wx, cz - wz)) / v +
                    (0.75 * Math.hypot(cx - bvx, cz - bvz)) / v +
                    2.5 / (0.1 + Math.min(t, H) / H) +
                    0.75 * Math.max(0, links) +
                    (fahr && this._verkehrAufSpur(S, p.x + cx * fahr, p.z + cz * fahr, 0) ? BW.fahrbahnStrafe : 0);
                wahl.push({ st, vx: cx, vz: cz });
            }
        // das beste Tempo, dessen Schritt und dessen Bein von dort zum nächsten Punkt des Wegs keine Wand schneiden
        wahl.sort((x, y) => x.st - y.st);
        for (const c of wahl.slice(0, BW.ausweichWahl)) {
            const nach = { x: p.x + c.vx * dt, z: p.z + c.vz * dt };
            if (this._bewohnerWand(p, nach) || this._bewohnerWand(nach, q)) continue;
            const fern = { x: p.x + c.vx * T * (1 + BW.aufholen), z: p.z + c.vz * T * (1 + BW.aufholen) };
            if (T > 0 && (this._bewohnerWand(nach, fern) || this._bewohnerWand(fern, q))) T = 0;
            return halte(c);
        }
        return halte({ vx: 0, vz: 0 });
    }

    // UM DEN STEHENDEN (mensch.K3 Staffel 2, `_bewohnerAusweichen`): der erste Stehende `nb` auf dem Bein p → q (vor q, näher
    // als `K` an ihm) — der Punkt neben ihm (`K` + `umRandM` quer zum Bein, die Seite des Beins zuerst), von dem beide Beine
    // frei von jeder Wand sind und an dem kein Leib näher als `K` steht, tritt als nächster Punkt in den Weg (`_um`; der Rest
    // des Wegs neu gezählt; ist q selbst ein Umweg, keinen zweiten). Liefert true, wenn er einen fand, den Stehenden, wenn
    // nicht, sonst false.
    _bewohnerUm(S, b, p, q, nb, K, setzen) {
        const hl = Math.hypot(q.x - p.x, q.z - p.z);
        const [hx, hz] = [(q.x - p.x) / hl, (q.z - p.z) / hl];
        const steht = nb
            .filter((o) => !o.weg)
            .map((o) => {
                const [rx, rz] = [o.leib.position.x - p.x, o.leib.position.z - p.z];
                return { o, vor: rx * hx + rz * hz, quer: rz * hx - rx * hz };
            })
            .filter((c) => c.vor > 0 && c.vor < hl && Math.abs(c.quer) < (c.o.kR || K))
            .sort((a, c) => a.vor - c.vor)[0];
        if (!steht || !setzen) return steht ? steht.o : false;
        // um den ruhenden Wagen (`kR`: seine Breite samt Kapsel, `_verkehrImRaster`) so weit wie um seinen Radius
        const D = (steht.o.kR || K) + AnazhRealm.BEWOHNER.umRandM;
        const o = steht.o.leib.position;
        // wer auf dem Gehweg geht (er und sein nächster Punkt neben der Fahrbahn, `_verkehrAufSpur`), geht nie über sie um ihn
        const fahr = S.verkehr && !this._verkehrAufSpur(S, p.x, p.z, 0) && !this._verkehrAufSpur(S, q.x, q.z, 0);
        for (const seite of steht.quer > 0 ? [-1, 1] : [1, -1]) {
            const d = { x: o.x - hz * seite * D, z: o.z + hx * seite * D, _um: true };
            if (fahr && this._verkehrAufSpur(S, d.x, d.z, 0)) continue;
            if (nb.some((n) => Math.hypot(n.leib.position.x - d.x, n.leib.position.z - d.z) < (n.kR || K))) continue;
            if (this._bewohnerWand(p, d) || this._bewohnerWand(d, q)) continue;
            b.weg.splice(b.wi, 0, d);
            const rest = new Float64Array(b.weg.length);
            for (let i = b.weg.length - 2; i >= 0; i--)
                rest[i] = rest[i + 1] + Math.hypot(b.weg[i + 1].x - b.weg[i].x, b.weg[i + 1].z - b.weg[i].z);
            b.wegRestAb = rest;
            b.wegRest = Math.hypot(d.x - p.x, d.z - p.z) + rest[b.wi];
            return true;
        }
        return steht.o;
    }

    // PLATZ MACHEN (mensch.K3 Staffel 2): der Stehende o tritt auf den nächsten Punkt der Ringe um sich (je 0,6 m bis 1,8 m; für
    // den Spieler je 0,3 m bis über seinen Abstand `kF` hinaus), der mehr als `kF` (zwei Kapseln; dem Spieler sein Abstand,
    // `_bewohnerSpielerAbstand`) neben dem Bein p → q des Gehenden liegt (dem Wagen: neben jedem Stück seiner Bahn, p eine Folge
    // von Punkten), frei von Wand und Leib ist und den er frei erreicht (`platz`; wer schon beiseite steht, tritt wieder); ist
    // sein Stand wieder frei und der Gehende `fuer` an ihm vorbei, geht er zurück (`_tickBewohner`). Liefert, ob er Platz macht.
    _bewohnerPlatz(S, o, p, q, fuer, kF = 2 * AnazhRealm.PLAYER_WALL_RADIUS + 0.01) {
        if (o.platz && o.weg) return true; // er tritt schon beiseite
        const K = 2 * AnazhRealm.PLAYER_WALL_RADIUS + 0.01;
        const g = { x: o.leib.position.x, z: o.leib.position.z };
        const bein = Array.isArray(p) ? p : [p, q];
        const dr = fuer && fuer.spieler ? 0.3 : 0.6; // dem Spieler auf 0,3 m genau: sein Abstand trägt die Erinnerung
        for (let r = dr; r <= Math.max(1.81, kF + 0.61); r += dr)
            for (let i = 0; i < 12; i++) {
                const P = { x: g.x + Math.cos((i * Math.PI) / 6) * r, z: g.z + Math.sin((i * Math.PI) / 6) * r };
                const pkt = { minX: P.x, maxX: P.x, minZ: P.z, maxZ: P.z };
                if (bein.some((c, k) => k && this._streckeBoxAbstand2(pkt, bein[k - 1].x, bein[k - 1].z, c.x, c.z) < (kF + 0.1) ** 2)) continue; // prettier-ignore
                if (S.verkehr && this._verkehrAufSpur(S, P.x, P.z, 0)) continue; // beiseite heißt: aus der Fahrbahn, nie in sie
                if (this._bewohnerNaechster(S, o, P.x, P.z) < K) continue;
                if (this._bewohnerWand(P, P, true) || this._bewohnerWand(g, P)) continue;
                Object.assign(o, {
                    weg: [P],
                    linie: g,
                    wi: 0,
                    wegRestAb: new Float64Array(1),
                    wegRest: r,
                    da: false,
                    stand: null,
                });
                o.platz = fuer;
                this._bewohnerWecken(S, o);
                return true;
            }
        return false;
    }

    // DER NÄCHSTE LEIB um (x, z) im Raster seiner Siedlung (`S.raster`), außer b: sein Abstand (Infinity: keiner nah).
    _bewohnerNaechster(S, b, x, z) {
        const M = AnazhRealm.BEWOHNER.rasterM;
        const K = 2 * AnazhRealm.PLAYER_WALL_RADIUS + 0.01;
        const [ix, iz] = [Math.floor(x / M), Math.floor(z / M)];
        let d = Infinity;
        // der Leib des Wagens im Gedränge (`_verkehrImRaster`) reicht um seinen Radius `kR` (die halbe Breite samt Kapsel) statt
        // um zwei Kapseln K: sein Abstand zählt um so viel kürzer, wie das Ausweichen ihn misst (`kO`). Bis w4-verkehr-c3 zählte die
        // Mitte allein — die Ankunft nach dem Sprung der Uhr stellte einen Bewohner 0,8 m neben die Mitte des Wagens, der für sie
        // hielt, in seine Hülle (VK stadt-voll 23 Uhr: 26 Proben „berührt Bewohner“ an EINEM Wagen, bis er abfuhr)
        for (let i = -1; i <= 1; i++)
            for (let j = -1; j <= 1; j++)
                for (const o of S.raster.get((ix + i) * 2097152 + iz + j) || [])
                    if (o !== b && !o.drinnen && o.leib)
                        d = Math.min(
                            d,
                            Math.hypot(o.leib.position.x - x, o.leib.position.z - z) - (o.kR ? o.kR - K : 0)
                        );
        return d;
    }

    // DER TRITT (mensch.K3): der Grund des Leibs ist der Boden des Gesetzes (`grund`) oder die höchste Oberkante einer Box des
    // Blocker-Netzes unter seiner Kapsel im Haft-Band der Kapsel des Spielers ([Fuß − PLAYER_GROUND_SNAP, Fuß + PLAYER_STEP_UP]
    // über dem Fuß `fuss`, die Fuge trägt nie — `_resolveCapsuleVsAABB`): die Stufen vor der Tür, die Schwelle — so tritt
    // er ins Haus und aus ihm, nie mit den Schienbeinen durch die Diele. `nahe`: die Kandidaten des Schritts (`_blockerNahe` in
    // weiterer Reichweite um denselben Punkt — je Box urteilt der Abstand).
    _bewohnerTritt(x, z, fuss, grund, nahe = null) {
        const R = AnazhRealm.PLAYER_WALL_RADIUS;
        const kand = nahe || this._bewohnerWandKand || (this._bewohnerWandKand = []);
        if (!nahe) {
            kand.length = 0;
            this._blockerNahe(x, z, R, 0, kand);
        }
        let top = grund;
        const hoch = fuss + AnazhRealm.PLAYER_STEP_UP;
        const tief = fuss - AnazhRealm.PLAYER_GROUND_SNAP;
        // über der Stufe hat sein Kopf Raum (`kopfM`): der Rand des Brunnens unter seinem Dach trägt ihn nicht
        const kopf = (y) => {
            for (const e of kand)
                for (const box of e.blockerAABBs || [])
                    if (
                        box.botY < y + AnazhRealm.BEWOHNER.kopfM &&
                        box.topY > y + AnazhRealm.PLAYER_STEP_UP &&
                        this._boxAbstand2(box, x, z) <= R * R
                    )
                        return false;
            return true;
        };
        for (const e of kand)
            for (const box of e.blockerAABBs || [])
                if (
                    box.gedeckt !== true &&
                    box.topY > top &&
                    box.topY <= hoch &&
                    box.topY >= tief &&
                    this._boxAbstand2(box, x, z) <= R * R &&
                    kopf(box.topY)
                )
                    top = box.topY;
        return top;
    }

    // DIE WAND AN DER STRECKE (mensch.K3): die Kapsel des Leibs — die des Spielers (`_resolveCapsuleVsAABB`: Radius
    // PLAYER_WALL_RADIUS, Wand ab der Stufe PLAYER_STEP_UP über der Sohle) bis zum Scheitel (`BEWOHNER.kopfM`) — längs a → e
    // gegen das EINE Blocker-Netz (`_blockerNahe`, je Box `_streckeBoxAbstand2`): Haus, Bau, Baum, Fels. Die Höhe trägt der
    // Boden unter der Box — längs des Stücks der Strecke, das sie begleitet (die Stufe am tiefsten, der Scheitel am höchsten;
    // mensch.K3 Staffel 2: in der Senke zwischen zwei Enden geht der Leib tiefer, als die Enden sagen) —, an den Enden je Punkt
    // gemerkt bis zum nächsten Edit oder Erdbau (`_editGenZaehler`). Liefert den Eintrag der ersten
    // Wand oder null; a = e fragt den Stand. `stand` (mensch.K3 Staffel 2): wer dort steht, steht auf dem Boden — jede Box über
    // dem Fang des Bodens (PLAYER_GROUND_SNAP) bis eine Stufe über den Scheitel ist Wand (der Rand des Brunnens, die Stufe);
    // `rand`: so viel weiter als die Kapsel fragt er (der Raum eines Gehenden neben dem Stand, `standRandM`).
    _bewohnerWand(a, e, stand = false, rand = 0) {
        const R = AnazhRealm.PLAYER_WALL_RADIUS + rand;
        const kand = this._bewohnerWandKand || (this._bewohnerWandKand = []);
        kand.length = 0;
        this._blockerNahe((a.x + e.x) / 2, (a.z + e.z) / 2, Math.hypot(e.x - a.x, e.z - a.z) / 2 + R, 0, kand);
        const [dx, dz] = [e.x - a.x, e.z - a.z];
        const L = Math.hypot(dx, dz);
        const [unten, oben] = stand
            ? [AnazhRealm.PLAYER_GROUND_SNAP, AnazhRealm.BEWOHNER.kopfM + AnazhRealm.PLAYER_STEP_UP]
            : [AnazhRealm.PLAYER_STEP_UP, AnazhRealm.BEWOHNER.kopfM];
        // DER RAHMEN DER STRECKE (Lehre 25: der billige Filter zuerst): eine Box, deren achsparalleler Rahmen (er trägt auch die
        // gedrehte, `obb`) den der Strecke samt Kapsel nicht schneidet, liegt weiter als die Kapsel — `_streckeBoxAbstand2` urteilt
        // nur den Rest (1 µm über der Rundung). Bis w4-stationen-schnell-a maß jede Frage jede Box der Nachbarn ganz: die Liste des
        // Start-Dorfs (24 283 Fragen) 1,52 → 1,04 s, ihre Stände bit-gleich
        const Rr = R + 1e-6;
        const [rx0, rx1] = a.x < e.x ? [a.x - Rr, e.x + Rr] : [e.x - Rr, a.x + Rr];
        const [rz0, rz1] = a.z < e.z ? [a.z - Rr, e.z + Rr] : [e.z - Rr, a.z + Rr];
        let st = null;
        let memo = null;
        // der Boden der Strecke: das Gesetz und darüber die Trittfläche eines Werks (die Bahn der Brücke, `_trittUeber`) — die
        // Trittfläche selbst ist nie Wand, ihr Geländer und ihr Joch schon
        const boden0 = (x, z) => this._trittUeber(x, z, this.getTerrainHeightAt(x, z), Infinity);
        for (const ent of kand) {
            const boxen = ent.blockerAABBs;
            if (!boxen || ent._verkehrFaehrt) continue; // der fahrende Wagen ist ein Leib im Gedränge, keine Wand (`_verkehrImRaster`)
            for (const box of boxen) {
                if (
                    box.tritt ||
                    box.maxX < rx0 ||
                    box.minX > rx1 ||
                    box.maxZ < rz0 ||
                    box.minZ > rz1 ||
                    this._streckeBoxAbstand2(box, a.x, a.z, e.x, e.z) >= R * R
                )
                    continue;
                if (st === null) {
                    this._voxelEditKarte(); // trägt jeden neuen Edit nach: sein Zähler ist der Stand des Bodens
                    st = this._editGenZaehler | 0;
                    memo = new Map();
                }
                const grund = (q) =>
                    q._grundStand === st ? q._grundY : ((q._grundStand = st), (q._grundY = boden0(q.x, q.z)));
                // der Boden unter der Box: längs der Strecke, so weit die Box (samt Kapsel) sie begleitet, je halben Meter
                let [t0, t1] = [0, 1];
                if (L > 1e-6) {
                    const ts = [box.minX, box.maxX].flatMap((x) =>
                        [box.minZ, box.maxZ].map((z) => ((x - a.x) * dx + (z - a.z) * dz) / (L * L))
                    );
                    t0 = Math.max(0, Math.min(...ts) - R / L);
                    t1 = Math.min(1, Math.max(...ts) + R / L);
                }
                const k0 = Math.floor((t0 * L) / 0.5);
                const k1 = Math.ceil((t1 * L) / 0.5);
                const boden = (k) => {
                    const t = Math.max(t0, Math.min(t1, (k * 0.5) / (L || 1)));
                    let g = t <= 0 ? grund(a) : t >= 1 ? grund(e) : memo.get(k);
                    if (g === undefined) memo.set(k, (g = boden0(a.x + dx * t, a.z + dz * t)));
                    return g;
                };
                // ohne Boden ist jede Box Wand; die Sohle steht bis `sohleM` unter dem Gesetz (der Feld-Scan des Schritts,
                // `_bewohnerSchritt`), die Wand fragt um sie tiefer — sonst stand der Sockel der Laterne #15942 (0,593 m über
                // dem Gesetz) dem Gehenden 0,601 m über der Sohle, Wand im Leib, die seine Frage nie sah.
                // JEDER BODEN URTEILT, SOBALD ER GELESEN IST (Lehre 25: die teure Rechnung nur, solange sie etwas ändert): Wand ist
                // die Box, die über den tiefsten Boden des Stücks + unten ragt und unter den höchsten + oben reicht — mit jedem
                // gelesenen Boden sinkt der tiefste und steigt der höchste, das Urteil kippt nur von frei zu Wand; es steht, sobald
                // ein Boden es trägt, nur das Freie liest jeden. Die Enden zuerst (am Hang liegt dort der tiefste und der höchste
                // Boden; an den Enden der Strecke ist er gemerkt), dann die Mitte, dann der Rest. Bis bewohner-takt las jede
                // Unentschiedene der Mitte jeden Boden: am Start-Dorf 12 785 Abtastungen, 12 657 endeten doch als Wand —
                // 224 295 von 247 620 Proben der Liste, die längste Aufgabe des Bewohner-Takts 2,1 s (swiftshader kalt).
                const s = AnazhRealm.BEWOHNER.sohleM;
                let [g0, g1] = [Infinity, -Infinity];
                const traegt = (k) => {
                    const g = boden(k);
                    [g0, g1] = [Math.min(g0, g), Math.max(g1, g)];
                    return !Number.isFinite(g0 + g1) || (box.topY > g0 + unten - s && box.botY < g1 + oben);
                };
                if (traegt(k0) || traegt(k1) || traegt((k0 + k1) >> 1)) return ent;
                for (let k = k0 + 1; k < k1; k++) if (traegt(k)) return ent;
            }
        }
        return null;
    }

    // DAS WEGE-NETZ einer Siedlung (je Stand der Wache): je Punkt der Straßen und Feldwege des Plans ein Knoten, die Folge
    // eines Wegs seine Kanten, die Kreuzungen (Knoten zweier Wege näher als `kreuzM`) verbunden; es hängt über FREIE Kanten
    // zusammen (`_bewohnerKante`): was getrennt liegt (ein Weg, der seitlich in eine Straße mündet, eine Gasse, über der ein
    // Baum steht), schließt der kürzeste freie Schritt zum Rest (bis `naehtM`) — EIN Netz je Dorf. Wechselt eine Hülle im
    // Rechteck der Wache, urteilt es neu. DER GRUND DES NETZES (Knoten, Folgen, Kreuzungen: die Lage allein, `S.netzGrund`:
    // das Gesetz des Plans, `_wegeNetzGrund`) entsteht je Siedlung einmal — ein neuer Stand urteilt nur die Kanten (Lehre 25:
    // der Takt kostet die Änderung), und jeder Knoten behält seinen Boden (`_bewohnerWand`); jede Naht urteilt über
    // `_bewohnerKante` (gemerkt wie jede Kante).
    // EIN STAND, DER KEIN URTEIL ÄNDERT, ÄNDERT DAS NETZ NICHT: jede gemerkte Kante, die eine gewechselte Hülle berührt
    // (`_bewohnerWechsel`), urteilt neu — bleibt jedes Urteil, gilt das Netz weiter; sonst entsteht es mit dem Geurteilten neu.
    _bewohnerNetz(S) {
        const alt = S.netz;
        if (alt && alt.stand === S.wache.stand) return alt;
        const trifft = alt && this._bewohnerWechsel(S, alt.stand);
        let erbe = null;
        if (trifft) {
            const n = alt.knoten.length;
            let gleich = true;
            erbe = new Map();
            for (const [key, f] of alt.frei) {
                const a = alt.knoten[Math.floor(key / n)];
                const e = alt.knoten[key % n];
                const neu = trifft(a, e) ? !this._bewohnerWand(a, e) : f;
                if (neu !== f) gleich = false;
                erbe.set(key, neu);
            }
            if (gleich) {
                alt.stand = S.wache.stand;
                return alt;
            }
        }
        const G = S.netzGrund || (S.netzGrund = this._wegeNetzGrund(S.plan, S.ox, S.oz));
        const knoten = G.knoten;
        const kante = (kanten, i, j) => {
            const w = Math.hypot(knoten[i].x - knoten[j].x, knoten[i].z - knoten[j].z);
            kanten[i].push(j, w);
            kanten[j].push(i, w);
        };
        const kanten = G.kanten.map((k) => k.slice());
        const N = { knoten, kanten, baeume: new Map(), frei: erbe || new Map(), stand: S.wache.stand };
        const teil = new Int32Array(knoten.length);
        const N2 = AnazhRealm.BEWOHNER.naehtM ** 2;
        for (;;) {
            teil.fill(-1);
            let n = 0;
            for (let i = 0; i < knoten.length; i++) {
                if (teil[i] >= 0) continue;
                const offen = [i];
                teil[i] = n;
                while (offen.length) {
                    const k = offen.pop();
                    for (let e = 0; e < kanten[k].length; e += 2) {
                        const j = kanten[k][e];
                        if (teil[j] < 0 && this._bewohnerKante(N, k, j)) {
                            teil[j] = n;
                            offen.push(j);
                        }
                    }
                }
                n++;
            }
            if (n < 2) break;
            // der kürzeste freie Schritt aus dem Teil des ersten Knotens hinaus
            const paare = [];
            for (let i = 0; i < knoten.length; i++) {
                if (teil[i] !== 0) continue;
                for (let j = 0; j < knoten.length; j++) {
                    if (teil[j] === 0) continue;
                    const d = (knoten[i].x - knoten[j].x) ** 2 + (knoten[i].z - knoten[j].z) ** 2;
                    if (d <= N2) paare.push([d, i, j]);
                }
            }
            paare.sort((p, q) => p[0] - q[0]);
            const naht = paare.find(([, i, j]) => this._bewohnerKante(N, i, j));
            if (!naht) {
                this._bruchMelden(
                    `BEWOHNER: das Wege-Netz von „${S.plan.name || "?"}" zerfällt in ${n} Teile (kein freier Schritt bis ${AnazhRealm.BEWOHNER.naehtM} m)`
                );
                break;
            }
            kante(kanten, naht[1], naht[2]);
        }
        return (S.netz = N);
    }

    // DIE KANTE i–j des Netzes ist frei (`_bewohnerWand` längs ihrer Mitte), je Stand der Wache einmal geurteilt und gemerkt
    // (`N.frei`) — der Baum der kürzesten Wege geht nur freie Kanten: ein Haus, ein Baum, ein Fels quer über der Gasse
    // nimmt sie aus dem Netz, bis seine Hülle geht.
    _bewohnerKante(N, i, j) {
        const key = i < j ? i * N.knoten.length + j : j * N.knoten.length + i;
        let f = N.frei.get(key);
        if (f === undefined) N.frei.set(key, (f = !this._bewohnerWand(N.knoten[i], N.knoten[j])));
        return f;
    }

    // DIE WACHE ÜBER DEN WEGEN einer Siedlung (mensch.K3, `_blockerWacheMelden`): das Rechteck um jeden Ort ihrer Bewohner und
    // jeden Punkt ihrer Gassen und Feldwege (plus die Kapsel und das Spiel der Spur) — jede Hülle, die dort wechselt, zählt
    // ihren Stand; das Gemerkte der Wege gilt je Stand (`_bewohnerStrecke`, `_bewohnerNetz`).
    _bewohnerWacheSetzen(S) {
        let x0 = Infinity;
        let x1 = -Infinity;
        let z0 = Infinity;
        let z1 = -Infinity;
        const um = (x, z) => {
            if (!Number.isFinite(x) || !Number.isFinite(z)) return;
            x0 = Math.min(x0, x);
            x1 = Math.max(x1, x);
            z0 = Math.min(z0, z);
            z1 = Math.max(z1, z);
        };
        for (const b of S.liste) for (const k in b.orte) if (b.orte[k]) um(b.orte[k].x, b.orte[k].z);
        for (const rd of (S.plan.roads || []).concat(S.plan.feldwege || []))
            for (const q of rd.pts || []) if (q) um(S.ox + q.x, S.oz + q.z);
        const r = AnazhRealm.PLAYER_WALL_RADIUS + AnazhRealm.BEWOHNER.spurM + 1;
        S.wache = { x0: x0 - r, x1: x1 + r, z0: z0 - r, z1: z1 + r, stand: 0 };
        S.wegeStand = 0;
        (this._blockerWachen || (this._blockerWachen = new Set())).add(S.wache);
    }

    // DER REST DES WEGS nach einem Wechsel der Wache: wer geht, prüft die Beine vor sich (vom Leib bis zum Ziel, ohne das Bein
    // durch die eigene Tür), die eine gewechselte Hülle berühren (`trifft`, `_bewohnerWechsel`; null: jedes); trifft eines
    // eine Wand, legt er den Weg neu von hier (`_bewohnerWeg`, im nächsten Takt).
    _bewohnerWegPruefen(S, trifft = null) {
        for (const b of S.liste) {
            if (!b.weg || !b.leib) continue;
            const o = b.orte;
            let p = { x: b.leib.position.x, z: b.leib.position.z };
            for (let i = b.wi; i < b.weg.length; p = b.weg[i++]) {
                const q = b.weg[i];
                const tuerBein = q === o.tuer || (q === o.vor && (p === o.tuer || (i === b.wi && b.stand === o.tuer)));
                if (tuerBein || (trifft && !trifft(p, q)) || !this._bewohnerWand(p, q)) continue;
                b.weg = null;
                b.stand = null;
                break;
            }
        }
    }

    // DIE WECHSEL SEIT EINEM STAND der Wache (ihr Buch, `_blockerWacheMelden`): die Probe, ob eine Strecke a → e eine Hülle
    // berührt, die seit `seit` wechselte (ihr Kasten samt Kapsel und Spur, wie die Wache); null, wenn das Buch nicht so weit
    // zurück reicht — dann urteilt der Leser alles neu.
    _bewohnerWechsel(S, seit) {
        const w = S.wache;
        const L = w.wechsel || [];
        const n = w.stand - seit;
        if (!(n >= 0 && n <= L.length)) return null;
        const H = L.slice(L.length - n);
        const r = AnazhRealm.PLAYER_WALL_RADIUS + AnazhRealm.BEWOHNER.spurM + 1;
        return (a, e) => {
            const x0 = Math.min(a.x, e.x) - r;
            const x1 = Math.max(a.x, e.x) + r;
            const z0 = Math.min(a.z, e.z) - r;
            const z1 = Math.max(a.z, e.z) + r;
            for (const h of H) if (h[1] >= x0 && h[0] <= x1 && h[3] >= z0 && h[2] <= z1) return true;
            return false;
        };
    }

    // DER ANSCHLUSS eines Orts: der nächste der `anschlussN` nächsten Knoten des Netzes, den er in gerader Linie frei
    // erreicht (`_bewohnerWand`). Kein Knoten: laut, und -1 (die Strecke trägt
    // keinen Weg, `_bewohnerStrecke`: er bleibt) — nie durch die Wand zum nächsten.
    _bewohnerAnschluss(N, o) {
        if (o._knoten !== undefined) return o._knoten;
        const nah = N.knoten
            .map((q, i) => ({ i, d: (q.x - o.x) ** 2 + (q.z - o.z) ** 2 }))
            .sort((a, b) => a.d - b.d)
            .slice(0, AnazhRealm.BEWOHNER.anschlussN);
        const frei = nah.find((c) => !this._bewohnerWand(o, N.knoten[c.i]));
        const k = frei ? frei.i : -1;
        if (k < 0) this._bruchMelden(`BEWOHNER: der Ort ${o.x.toFixed(1)}/${o.z.toFixed(1)} erreicht keinen Weg frei`);
        o._knoten = k;
        return k;
    }

    // DER AUSWEG eines Orts, der keinen Knoten frei erreicht (`_bewohnerStrecke`): der nächste Punkt im Ring um ihn (bis
    // `auswegM`, je 0,6 m ein Ring, auf ihm je höchstens 0,6 m ein Punkt, mindestens zwölf), den er in gerader Linie frei
    // erreicht — `ausDerWand`: steht er selbst in einer Hülle, zählt die Linie nicht —, der frei steht (mit `rand` Raum), Land
    // ist, in keinem Grundriss liegt, `raum` (die Probe der Stände, `_bewohnerStandPruefen`: wahr, wo einer näher als `raumM`
    // steht) nicht trägt und selbst einen Knoten frei erreicht.
    // Gemerkt je Stand der Wache (`o._ausweg`); null: keiner. Bis w4-genesis-ort-wirt5 fragte jeder Ring zwölf Richtungen: in
    // 15 m (`spurAuswegM`) lagen sie 7,9 m auseinander, und der gerückte Stand übersprang die Lücke neben der Fahrbahn.
    // `gesetz` (x, z): das Gesetz des Stands (`gilt`) — jeder Punkt hält es, und ein Ring, auf dem keiner es hält, beendet die
    // Suche: dort endet sein Gesetz (der Platz und sein Rand um den Ursprung auf ihm), weiter draußen liegt keiner mehr.
    // Die Suche ist EIN Gang (`_bewohnerAuswegGang`): der Ausweg geht ihn ganz, die Prüfung der Stände tritt ihn in Raten.
    _bewohnerAusweg(N, o, ausDerWand, raum, rand, frei, weit, gesetz) {
        const gang = this._bewohnerAuswegGang(N, o, ausDerWand, raum, rand, frei, weit, gesetz);
        for (;;) {
            const w = gang.next();
            if (w.done) return w.value;
        }
    }

    // DER GANG DES AUSWEGS (Lehre 14: schwere Arbeit in Raten): je Punkt, der am Anschluss scheitert (`anschlussN` Strecken
    // gegen die Wand), und je `auswegSchritt` Punkten ein Schritt (`yield`) — die Geburt der Liste (`listeWerk`) hält so ihre
    // Frist auch IN einer Suche. Bis hier war die Suche eines Stands ein Stück: an der Stadt (`dorf 7 120`) trug ein Stand der
    // Geburt 121–273 ms in einem Takt, 77 Punkte scheiterten am Anschluss (Radeon, headless).
    *_bewohnerAuswegGang(
        N,
        o,
        ausDerWand = false,
        raum = null,
        rand = 0,
        frei = null,
        weit = AnazhRealm.BEWOHNER.auswegM,
        gesetz = null
    ) {
        if (o._ausweg !== undefined) return o._ausweg;
        const BW = AnazhRealm.BEWOHNER;
        let gefunden = null;
        let punkte = 0;
        for (let r = 0.6, drin = 1; r <= weit + 1e-6 && !gefunden && drin; r += 0.6) {
            drin = gesetz ? 0 : 1;
            for (let i = 0, n = Math.max(12, Math.ceil((2 * Math.PI * r) / 0.6)); i < n && !gefunden; i++) {
                if (++punkte % BW.auswegSchritt === 0) yield;
                const q = {
                    x: o.x + Math.cos((i * 2 * Math.PI) / n) * r,
                    z: o.z + Math.sin((i * 2 * Math.PI) / n) * r,
                };
                // die billigen Proben zuerst (Lehre 25): das Gesetz, der Raum, der Grundriss — dann die Spur (seit heim2-w13-verkehr-heil
                // fragt sie am Stand den Weg zu seiner Tür ab, `dies`), die Wand und das Land
                if (gesetz) {
                    if (!gesetz(q.x, q.z)) continue;
                    drin++;
                }
                if (raum && raum(q)) continue;
                const g = this._imGrundriss(q.x, q.z, BW.saumM);
                if (g === "haus" || g === "bau") continue;
                if (frei && !frei(q)) continue;
                if (this._bewohnerWand(q, q, true, rand) || (!ausDerWand && this._bewohnerWand(o, q))) continue;
                if (!this._landAt(q.x, q.z, 0.2)) continue;
                if (this._bewohnerAnschluss(N, q) >= 0) gefunden = q;
                else yield;
            }
        }
        return (o._ausweg = gefunden);
    }

    // DER STAND WEICHT DER HÜLLE (mensch.K3 Staffel 2): bei der Geburt der Liste und wenn eine Hülle wechselt (`trifft`,
    // `_bewohnerWechsel`; der Baum, der Busch, der Fels des Wald-Takts), gilt jeder Stand an seinem Ursprung (`ur`, der Ort
    // der Liste), wo dort auf dem Boden Raum für einen Gehenden neben ihm ist (`standRandM`); sonst rückt er auf den Ausweg
    // seines Ursprungs (`_bewohnerAusweg` aus der Wand, `raumM` zum Ursprung jedes anderen Stands UND zum Ort jedes gerückten,
    // vor ihm in der Reihe wie hinter ihm aus einem früheren Gang) — wer dort steht oder hingeht, geht neu. Vom Ursprung aus,
    // in der Reihe der Liste: dieselbe Welt gibt jeder Liste dieselben Stände; rückt im Gang nach einem Wechsel einer, urteilt
    // jeder gerückte nach ihm neu. Bis w4-genesis-ort-wirt5 hielt der Raum nur die Ursprünge: am Genesis-Ort rückten sieben
    // Stände aus der Spur der Wagen in dieselbe Lücke zwischen haus_schwarzwald #508675 und einer Kiefer (−47/−186, je 0,1–0,9 m
    // auseinander), wer dort Platz machte, fand seinen Stand nie frei (`tuerFreiM`) — 31–43 Steckenbleiber, Soll-Orte 0,708–0,837.
    // Steht der Ursprung in einer Hülle ohne Ausweg: laut, der Stand bleibt.
    // IN RATEN (Lehre 14): je geprüftem Stand ein Schritt (`yield`) — bei der Geburt der Liste treibt sie der Bewohner-Takt nach
    // Zeit (`listeWerk`), nach einem Wechsel der Wache ebenso (`_bewohnerWacheTakt`). Bis bewohner-takt prüfte die Geburt jeden Stand im Takt
    // der fertigen Liste: am Start-Dorf 43 ms, die Aufgabe 90 ms (swiftshader kalt).
    *_bewohnerStandPruefen(S, trifft) {
        const BW = AnazhRealm.BEWOHNER;
        const N = this._bewohnerNetz(S);
        const staende = new Set();
        for (const b of S.liste)
            for (const k of ["heim", "platz", "werk", "besuch"]) if (b.orte[k]) staende.add(b.orte[k]);
        S.listeRest = staende.size; // der Rest des Werks (`_weltOffen` leute): je Stand einer
        // ob ein Stand gerückt steht (sein Ort ist nicht sein Ursprung) und ob einer in diesem Gang rückte
        const weg = (o) => o.ur && (o.x !== o.ur.x || o.z !== o.ur.z);
        let rueckte = false;
        // die Stände, deren Gesetz neben der Spur keinen Ort trägt (der Fehler des Plans, laut; die Kreatur-Linse liest ihn)
        const ohneOrt = S.standOhneOrt || (S.standOhneOrt = new Set());
        // DER RAUM ZU ALLEN STÄNDEN (der Ursprung jedes anderen und der Ort jedes gerückten) als RASTER in Zellen von `raumM`
        // (Lehre 25): die Probe eines Punkts fragt die 3 × 3 Zellen um ihn, nie jeden Stand; gebaut mit dem ersten geprüften
        // Stand, nachgeführt mit jedem, der rückt (je Eintrag x, z, Eigner). Bis hier baute jeder geprüfte Stand die Liste aller
        // anderen neu und jeder Punkt seines Auswegs ging sie ganz durch: an der Stadt (`dorf 7 120`, 1 300 Stände) trug ein
        // Ausweg bis 15 m 293 ms, die Hälfte der Zeit des Gangs (Radeon, headless)
        const RM = BW.raumM;
        const zelle = (kx, kz) => kx * 4194304 + kz;
        let gitter = null;
        const legen = (x, z, p) => {
            const k = zelle(Math.floor(x / RM), Math.floor(z / RM));
            const L = gitter.get(k);
            if (L) L.push(x, z, p);
            else gitter.set(k, [x, z, p]);
        };
        const heben = (x, z, p) => {
            const L = gitter.get(zelle(Math.floor(x / RM), Math.floor(z / RM)));
            for (let i = 0; L && i < L.length; i += 3)
                if (L[i + 2] === p && L[i] === x && L[i + 1] === z) return void L.splice(i, 3);
        };
        const raumVon = (o) => (q) => {
            const kx = Math.floor(q.x / RM);
            const kz = Math.floor(q.z / RM);
            for (let a = kx - 1; a <= kx + 1; a++)
                for (let c = kz - 1; c <= kz + 1; c++) {
                    const L = gitter.get(zelle(a, c));
                    if (L)
                        for (let i = 0; i < L.length; i += 3)
                            if (L[i + 2] !== o && (L[i] - q.x) ** 2 + (L[i + 1] - q.z) ** 2 < RM * RM) return true;
                }
            return false;
        };
        // DIE SCHEIBE EINES GERÜCKTEN (Gebot 7: die Kosten an der Änderung): sein Ort ist der erste Punkt seiner Suche vom
        // Ursprung, der alle Proben hält — er wechselt nur, wenn eine Probe in der Scheibe, die seine Suche ging (`_standR`, der
        // Radius bis zum Fund, eine erfolglose Stufe ganz, dazu `raumM`), einen früheren Punkt frei gibt oder seinen Ort sperrt:
        // ein Stand verlässt einen Ort in ihr (der Raum wird frei), einer tritt näher als `raumM` an ihn (ein neuer Ort sperrt nur,
        // früher Gescheitertes bleibt gescheitert), eine Hülle wechselt in ihr oder auf dem Strich zu seinem Knoten (`trifft`).
        // Dann ist er `_standSchmutz`, und nur dann urteilt ihn die Folge eines Rückens neu — bis hier ging nach jedem Rücken jeder
        // gerückte Stand seine ganze Suche erneut (an der Stadt 105–261 Suchen in EINEM Takt, gehend 0,7–2,6 s, Radeon headless)
        const scheibe = (p) => (Number.isFinite(p._standR) ? p._standR : Infinity) + RM;
        const inScheibe = (p, x, z) => (x - p.ur.x) ** 2 + (z - p.ur.z) ** 2 <= scheibe(p) ** 2;
        // DIE STÄNDE, DIE GINGEN ODER KAMEN (`standSatz`, der Satz des letzten Gangs): wessen Platz der volle Platz nimmt
        // (`_bewohnerOhneStand`), dessen Stand fällt aus der Reihe — er gibt seinen Raum frei wie einer, der rückt; einer, der
        // kam, sperrt nur, wem er näher als `raumM` steht. Ohne Satz (der erste Gang) urteilt jeder gerückte neu.
        const vorher = S.standSatz;
        S.standSatz = staende;
        const wechsel = [];
        if (vorher) {
            const merke = (p, ging) => {
                const u = p.ur || p;
                wechsel.push(u.x, u.z, ging);
                if (weg(p)) wechsel.push(p.x, p.z, ging);
            };
            for (const p of vorher) if (!staende.has(p)) merke(p, true);
            for (const p of staende) if (!vorher.has(p)) merke(p, false);
        }
        if (trifft || wechsel.length || !vorher)
            for (const p of staende) {
                if (!weg(p) || p._standSchmutz === true) continue;
                const R = scheibe(p);
                const K = N.knoten[p._standK];
                let schmutz =
                    !vorher ||
                    (trifft &&
                        (trifft({ x: p.ur.x - R, z: p.ur.z - R }, { x: p.ur.x + R, z: p.ur.z + R }) ||
                            (K && trifft(p, K))));
                for (let i = 0; !schmutz && i < wechsel.length; i += 3)
                    schmutz = wechsel[i + 2]
                        ? inScheibe(p, wechsel[i], wechsel[i + 1])
                        : (p.x - wechsel[i]) ** 2 + (p.z - wechsel[i + 1]) ** 2 < RM * RM;
                if (schmutz) p._standSchmutz = true;
            }
        for (const o of staende) {
            S.listeRest--;
            const ur = o.ur || (o.ur = { x: o.x, z: o.z, blick: o.blick });
            if (trifft && !trifft(o, o) && !trifft(ur, ur) && !(rueckte && weg(o) && o._standSchmutz !== false))
                continue;
            if (!gitter) {
                gitter = new Map();
                for (const p of staende) {
                    const u = p.ur || p;
                    legen(u.x, u.z, p);
                    if (weg(p)) legen(p.x, p.z, p);
                }
            }
            const raum = raumVon(o);
            // das Gesetz seiner Art gilt auch dem gerückten (`gilt`, `_bewohnerListe`: der Stand am Platz bleibt am Platz);
            // `R` misst die Scheibe, die seine Suche ging
            let R = 0;
            const realm = this;
            const neu = function* (rand, frei, weit = BW.auswegM, gesetz = o.gilt) {
                const p = yield* realm._bewohnerAuswegGang(
                    N,
                    { x: ur.x, z: ur.z },
                    true,
                    raum,
                    rand,
                    frei,
                    weit,
                    gesetz
                );
                R = Math.max(R, p ? Math.hypot(p.x - ur.x, p.z - ur.z) : weit);
                return p;
            };
            const gemerkt = (q) =>
                Object.assign(o, { _standR: R, _standK: q ? q._knoten : undefined, _standSchmutz: false });
            // DER STAND WEICHT DER SPUR (PFLICHT-OFFEN C): wer stundenlang steht, steht nie in der Spur eines Wagens
            // (`_verkehrAufSpur`) — er sucht den nächsten Ort, der sein Gesetz UND den Raum zu jedem Stand hält: erst die Gasse
            // daneben (`spurAuswegM`, die Lücke zwischen zwei Häusern), dann so weit sein Gesetz reicht (`gesetzAuswegM`, der
            // Platz endet am Ring ohne einen Punkt seines Gesetzes), dann wie bei seiner Geburt auch in der Gasse (`art`: am
            // Genesis-Ort trug der Platz neben der Trasse am Rand der Gassen keinen freien Punkt mehr — 771 Punkte mit Raum, alle
            // im Grundriss eines Hauses, markt #431794). Trägt keiner, bietet der Plan zu wenig Platz: laut und beim Namen
            // (`standOhneOrt`), und wer an ihm stand, geht seinen Tag ohne ihn (`_bewohnerOhneStand`) — nur ein Stand vor der
            // eigenen Tür steht dann, wo er stand (der Wagen hält vor ihm, und er macht Platz, `_verkehrFolge`). Bis hier
            // gab er nach den 15 m erst das Gesetz, dann den Raum zu den gerückten auf (w4-genesis-ort-wirt9): am Genesis-Ort stand
            // der Platz-Stand fahrer #45665 jenseits des Platzes und drei Stände bei −47/−173 näher als `raumM`, zwei auf einem Punkt
            const frei = S.verkehr ? (p) => !this._verkehrAufSpur(S, p.x, p.z) : null;
            // DER STAND BLEIBT DIESSEITS DER FAHRBAHN: wer vor einer Tür steht (`anker`, der Ring vor ihr), steht auf ihrer Seite —
            // der Weg von ihr zu ihm quert die Fahrbahn nicht (`_verkehrFahrbahnM`); sonst rückt er wie aus der Spur auf den
            // nächsten Ort diesseits, und erst wo keiner trägt, bleibt er, wo er stand. Bis heim2-w13-verkehr-heil stand er, wo der
            // Ring ihn fand, auch jenseits der Trasse: die sechs Leute des Hauses 7:1 der Metropole gingen zwischen Tür und Stand
            // über die Fahrbahn (stadt-voll 23 Uhr: rund 390 von 704 Proben auf ihr, der Anteil 5,27 %)
            const dies = frei && o.anker ? (p) => frei(p) && !this._verkehrFahrbahnM(S, o.anker, [p], 0) : frei;
            const wand = this._bewohnerWand(ur, ur, true, BW.standRandM);
            const dort = !wand && (!frei || frei(ur));
            let q =
                dort && (dies === frei || dies(ur))
                    ? ur
                    : (dies !== frei && (yield* neu(BW.standRandM, dies, BW.spurAuswegM))) ||
                      (dort
                          ? ur
                          : frei &&
                            ((yield* neu(BW.standRandM, frei, BW.spurAuswegM)) ||
                                (yield* neu(0, frei, BW.spurAuswegM)) ||
                                (yield* neu(0, frei, BW.gesetzAuswegM)) ||
                                (o.gilt !== o.art && (yield* neu(0, frei, BW.gesetzAuswegM, o.art)))));
            if (!frei || q) ohneOrt.delete(o);
            else {
                if (!ohneOrt.has(o))
                    this._bruchMelden(
                        `BEWOHNER: der Stand ${ur.x.toFixed(1)}/${ur.z.toFixed(1)} findet neben der Spur keinen Ort seines Gesetzes — der Plan bietet zu wenig Platz`
                    );
                ohneOrt.add(o);
                if (this._bewohnerOhneStand(S, o)) {
                    gemerkt(null);
                    yield;
                    continue;
                }
            }
            if (!q)
                q = !wand
                    ? ur
                    : (yield* neu(BW.standRandM)) || (!this._bewohnerWand(ur, ur, true) ? ur : yield* neu(0));
            gemerkt(q);
            if (!q)
                this._bruchMelden(
                    `BEWOHNER: der Stand ${ur.x.toFixed(1)}/${ur.z.toFixed(1)} steht in einer Hülle, kein Ausweg`
                );
            else if (q.x !== o.x || q.z !== o.z) {
                rueckte = true;
                // das Raster folgt ihm (der alte Ort fällt, wenn er gerückt war; der neue steht, wenn er nicht der Ursprung ist),
                // und jeder gerückte urteilt in der Folge neu, in dessen Scheibe der alte liegt oder dessen Ort der neue sperrt
                const alt = weg(o) ? [o.x, o.z] : null;
                if (alt) heben(alt[0], alt[1], o);
                const hin = q.x !== ur.x || q.z !== ur.z;
                if (hin) legen(q.x, q.z, o);
                for (const p of staende)
                    if (p !== o && weg(p) && p._standSchmutz === false)
                        if (
                            (alt && inScheibe(p, alt[0], alt[1])) ||
                            (hin && (p.x - q.x) ** 2 + (p.z - q.z) ** 2 < RM * RM)
                        )
                            p._standSchmutz = true;
                // sein Blick dreht um den Punkt, auf den er sieht (`anker`), wie der Stand um ihn rückte
                const A = o.anker;
                Object.assign(o, {
                    x: q.x,
                    z: q.z,
                    blick:
                        A && Number.isFinite(ur.blick)
                            ? ur.blick + Math.atan2(q.x - A.x, q.z - A.z) - Math.atan2(ur.x - A.x, ur.z - A.z)
                            : o.blick,
                    _knoten: undefined,
                    _direkt: null,
                    _ausweg: undefined,
                    _wegeStand: undefined,
                });
                for (const b of S.liste)
                    if (b.leib && !b.drinnen && (b.ziel === o || b.stand === o)) {
                        Object.assign(b, { weg: null, stand: null, wegRest: null });
                        if (b.ziel === o) b.da = false;
                    }
            }
            yield;
        }
        S.listeRest = 0;
    }

    // DER VOLLE PLATZ (`_bewohnerStandPruefen`): wessen Stand am Platz der Plan neben der Spur nicht trägt, geht seinen Tag ohne
    // ihn — koerper-core `tagesPlan` liest `platz || heim` (er bleibt zu den Stunden des Platzes vor seiner Tür), das Werk des
    // Markts am Platz wird der Stand vor der eigenen Tür (wie wo keine Station steht, `_bewohnerListe`); wer dort stand oder
    // hinging, geht neu. Die Kreatur-Linse nennt ihn „ohne Platz". Ein Stand, der niemandes Platz ist, bleibt (false).
    // Bis hier rückte der Stand ohne sein Gesetz und ohne den Raum (w4-genesis-ort-wirt9): an der Metropole (stadt-voll) trägt
    // der Platz neben der Trasse 87 seiner Stände nicht (je ~810 Punkte mit Raum, alle im Grundriss eines Hauses)
    _bewohnerOhneStand(S, o) {
        if (!S.liste.some((b) => b.orte.platz === o)) return false;
        for (const b of S.liste) {
            if (b.orte.platz === o) b.orte.platz = null;
            if (b.orte.werk === o) b.orte.werk = b.orte.heim;
            if (b.leib && !b.drinnen && (b.ziel === o || b.stand === o)) {
                if (b.ziel === o) b.da = false;
                Object.assign(b, { weg: null, stand: null, wegRest: null });
            }
        }
        return true;
    }

    // DER BAUM der kürzesten Wege ab einem Knoten (Dijkstra, binärer Haufen) — je Start-Knoten einmal gerechnet, gemerkt.
    _bewohnerBaum(N, a) {
        const gemerkt = N.baeume.get(a);
        if (gemerkt) return gemerkt;
        const n = N.knoten.length;
        const dist = new Float64Array(n).fill(Infinity);
        const vor = new Int32Array(n).fill(-1);
        const haufen = [[0, a]];
        dist[a] = 0;
        const hoch = (i) => {
            while (i > 0) {
                const e = (i - 1) >> 1;
                if (haufen[e][0] <= haufen[i][0]) break;
                [haufen[e], haufen[i]] = [haufen[i], haufen[e]];
                i = e;
            }
        };
        const runter = (i) => {
            for (;;) {
                const l = 2 * i + 1;
                const r = l + 1;
                let m = i;
                if (l < haufen.length && haufen[l][0] < haufen[m][0]) m = l;
                if (r < haufen.length && haufen[r][0] < haufen[m][0]) m = r;
                if (m === i) return;
                [haufen[m], haufen[i]] = [haufen[i], haufen[m]];
                i = m;
            }
        };
        while (haufen.length) {
            const [d, i] = haufen[0];
            const letzt = haufen.pop();
            if (haufen.length) {
                haufen[0] = letzt;
                runter(0);
            }
            if (d > dist[i]) continue;
            const K = N.kanten[i];
            for (let k = 0; k < K.length; k += 2) {
                const j = K[k];
                const dj = d + K[k + 1];
                if (dj < dist[j] && this._bewohnerKante(N, i, j)) {
                    dist[j] = dj;
                    vor[j] = i;
                    haufen.push([dj, j]);
                    hoch(haufen.length - 1);
                }
            }
        }
        N.baeume.set(a, vor);
        return vor;
    }

    // DIE BEWOHNER GEHEN (die Siedlung fern, die Welt wechselt): jeder Leib verlässt Feld und Szene über die EINEN Abschiede
    // (`_kreaturZiegelTod`, `_disposeSoulGroup`), die Vorlagen der Gestalten verlieren `fest` — das Memo räumt sie, sobald kein
    // Leib sie hält. Die Liste fällt mit: kehrt der Spieler zurück, entsteht sie neu aus dem Plan (dieselbe Funktion).
    _bewohnerFort(S) {
        this._verkehrFort(S); // die Wagen gehen mit (ihre Fahrer sind Leiber der Liste)
        for (const b of S.liste || []) {
            if (b.tonZeilen) this._tonZeileFrei(b.tonZeilen[0]); // die Palette des Kopfs geht mit ihm (mensch.K4)
            b.tonZeilen = null;
            const g = b.leib;
            if (!g) continue;
            this._kreaturZiegelTod(g);
            if (g.parent) g.parent.remove(g);
            this._disposeSoulGroup(g);
        }
        const memo = AnazhRealm._tierOfenMemo;
        if (S.satz) this._gangSatzAbschied(S.satz);
        for (const G of [...(S.gestalten || []), ...(S.raum ? [S.raum] : [])]) {
            this._tonZeileFrei(G.tonZeile);
            for (const key of G.keys) {
                const v = memo && memo.get(key);
                if (v && v.__ofen) v.__ofen.fest = false;
            }
        }
        if (S.wache && this._blockerWachen) this._blockerWachen.delete(S.wache);
        S.liste = null;
        S.listeWerk = null;
        S.lebt = false;
        S.gestalten = null;
        S.raum = null;
        S.satz = null;
        S.netz = null; // das Netz hing an der Wache (`frei`, `stand`): mit der Liste entsteht es neu
        this._ofenMemoRaeumen();
    }
    _bewohnerFortAlle() {
        if (this._bewohnerSiedlungen) for (const S of this._bewohnerSiedlungen.values()) this._bewohnerFort(S);
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_siedlung_bewohner]);

// ===== ATLAS · Siedlung/bewohner — Außen-Konstanten =====
// DAS RAUCH-BILD (w12-brand-rauch, `_rauchZeichnen`/`_rauchStoff`): EIN Gesetz für jeden Rauch der Welt — der Kamin rechnet das Gefühl des
// Labors (RAUCH_GESETZ je Bild) bei `labHz` in der Zeit und raucht an den `kamine` Kaminen nächst dem Auge binnen `kamineM`; die Dicke eines Teilchens fällt
// zum Rand mit (1 − ρ²)^`profil` (die Sehne einer weichen Kugel, 0 am Rand), das Rausch-Gesetz zerfasert sie (`rausch`: Skala je
// Radius, Hub [jung, ausgedünnt] und Zug des Musters über das Alter), der Saum gegen die Szene ist `saum` × Radius, die Normale
// wölbt sich um `woelbung` zum Rand, die Albedo steigt mit dem Alter von `dunkel` auf 1 (jung dicht und rußig), die Deckung im Kern höchstens
// `deckMax` (τ endlich).
AnazhRealm.RAUCH_BILD = Object.freeze({
    labHz: 60,
    kamine: 8,
    kamineM: 160,
    profil: 2,
    rausch: Object.freeze([1.1, Object.freeze([1, 1.2]), 1.5]),
    saum: 0.5,
    woelbung: 0.35,
    dunkel: 0.8,
    deckMax: 0.995,
});

// Worldgen-Auto-Dorf-Daten (Konsument `_tickAutoSettlement`, Wände + Γ5-Disziplin dort):
// nearM Materialisierungs-Distanz · spawnClearM dorffreier Radius um den Genesis-Ort (nearM < spawnClearM →
// am Spawn wirkt nur das START-DORF) · siteProbeR zwei Probe-Ringe (×cellM), falls der Anker scheitert ·
// startRadiusM Start-Dorf-Radien (einmalig je Welt, Seed ":startdorf") · perTick Häuser je Idle-Tick ·
// drosselTakte das Tempo über dem Frame-Budget.
// DAS WIRT-STREAMING der Auto-Dörfer (nur Host-Größen: wann und wie schnell die Welt baut). Das SIEDLUNGS-GESETZ
// (Raster cellM · Seltenheit rarity · Größe nHMin/nHSpan) lebt EINMAL in
// fachwerk-core (SIEDLUNG) — der Zwilling hier fiel (Welle L, Karte Dorf/Stadt DEFEKT 4: stiller Fallback mit Kopien).
// DIE BEWOHNER (Meisterkarte mensch.K1, `_tickBewohner`): gestalten = die Gestalten je Siedlung (Vorlagen im Ofen, je
// Gestalt beide Stufen ~2,45 MB Geometrie auf der CPU, auf der GPU nur, was nah zeichnet — der Kehraus; mit dem Leib der Menge
// je Gestalt zwei Senken — Leib und Wurf, vorher Haut, Rest und Wurf: 12 statt 16 Befehle am Start-Dorf). mensch.K4: die
// Gestalt ist die FORM (Geschlecht, Bau, Schnitt, Alter), acht statt vier; die Farben trägt jeder Kopf (die Ton-Tafel) · restBau /
// restMax = die eigenen Maße jedes Bewohners gegen seinen Typ (`_bewohnerGenome`): [Breite je Bau, je Muskel, Tiefe je Bau,
// je Muskel] der Genom-Achsen (0…1), Breite und Tiefe je höchstens ±restMax (die Breite trägt auch der Kopf: mit ±6 % lag die
// Kopf-Breite 0,098 über MENSCH_SOLL 0,096) · platzAnteil = so viele
// stehen am Tag auf dem Dorfplatz · raumM = der persönliche Raum zwischen zwei Ständen · saumM = der Saum um jeden Grundriss ·
// geburtenJeTakt = Leiber je Takt (Klon aus dem Memo ~1 ms; das Werk der Liste rechnet unter der EINEN Frist der Bau-Arbeit,
// `_bewohnerWerkTakt`) · fernFaktor = jenseits nearM × fernFaktor gehen die Leiber ·
// nahM (+ nahHystM zurück) / nahLeiber = so nah und so viele leben als Leib (Atem, Stufen), jeder andere im Nah-Kreis steht
// im Satz seiner Gestalt (`_bewohnerSatz`: die Befehle hängen nie an der Kopfzahl; wo der Satz dem Feld weicht, sagt das Stufen-
// Gesetz, `_feldGrenzen` mit LOD_SCHIRM.leib) · gangPhasen = die Phasen des Doppelschritts im Gang-Puffer, gangJeTakt = so viele backt ein
// Takt · platzRandM = so weit vom Rand des Platzes steht, wer auf ihm keinen Stand fand. DER TAG (mensch.K2): planH = so viele
// Stunden der Uhr, bis jeder seinen Plan neu liest (0,002 h = 0,3 s am Tag von 60 min: so spät geht er nach seiner Wende los,
// ≤ 0,5 m hinter der Ankunft) · DIE ANKUNFT (`_bewohnerAnkunft`): ankunftH = so viele Stunden spielt der Leib seinen Tag nach,
// höchstens ankunftWenden Wenden, die Wende gerastert auf wendeH · ankunftJeTakt = so viele Ankünfte je Takt · sprungH = ein
// Sprung der Uhr ab hier stellt jeden neu (das Zeitraffer-Ereignis der Linse, 0,1 h, ist keiner) · wegeJeTakt = neue Wege je
// Takt · direktM = bis hier geht er frei in gerader Linie, weiter über das Wege-Netz · spurM = seine Spur quer zum Weg · gehwegM = so fern von der Mitte einer Trasse des Verkehrs geht er (ihre Spur, die halbe Breite des Wagens, Kapsel und Rand), gehwegBreiteM = so breit streuen die Spuren dort · kreuzM = Knoten zweier Wege näher als dies
// kreuzen, naehtM = so weit schließt das Netz eine Lücke · vorM = der Punkt vor der Tür, über den jeder Weg ins Haus und
// aus ihm geht. DIE WEGE (mensch.K3): kopfM = der Scheitel des Leibs über der Sohle — so hoch reicht die Kapsel, die jeder
// Stand und jedes Bein gegen das Blocker-Netz fragt (`_bewohnerWand`). DIE STADT (mensch.K3 Staffel 2): rasterM = die Zelle
// des Rasters der Leiber · ausweichS = so weit voraus (Sekunden) sieht er die Berührung · ausweichRichtungen = so viele
// Richtungen tastet er ab, die ausweichWahl besten fragt er nach der Wand (`_bewohnerAusweichen`) · tuerFreiM = so nah an
// der Tür steht keiner, wenn er aus ihr tritt · aufholen = so viel schneller (je Tempo) eilt, wer hinter seinem Tag ist (`_bewohnerGehen`) · besuchM = so fern von seiner Tür und der Mitte des Platzes liegt die Tür
// seines Besuchs, besuchWeitM = so fern von ihnen und seinem Werk höchstens (`_bewohnerGestalten`) · gasseFreiM = so fern
// von der Mitte jeder Gasse steht jeder Stand, gasseZelleM = die Zelle ihres Rasters (`amWeg`) · anschlussN = so viele Knoten fragt
// der Anschluss eines Orts (`_bewohnerAnschluss`) · auswegM = so weit sucht ein Ort ohne freien Anschluss seinen Ausweg
// (`_bewohnerAusweg`; je auswegSchritt Punkten ein Schritt seines Gangs, `_bewohnerAuswegGang`), spurAuswegM ein Stand in der Spur eines Wagens (`_verkehrAufSpur`), gesetzAuswegM er, wo die Gasse daneben
// keinen Ort seines Gesetzes trägt (der Platz endet früher, am Ring ohne einen Punkt seines Gesetzes) · standRandM = so viel Raum hält jeder Stand zu jeder Wand über die Kapsel hinaus: ein Gehender
// passt zwischen beide (`_bewohnerStandPruefen`) · umRandM = so weit über zwei Kapseln geht er am Stehenden vorbei
// (`_bewohnerUm`) · linieM = so weit voraus auf seinem Bein liegt der Punkt, auf den zurückgeht, wer auswich
// (`_bewohnerLinie`) · lenkS = so lange hält er seine Wahl höchstens, solange ihn keiner erreichen kann (`_bewohnerAusweichen`,
// die Frist) · fahrbahnStrafe = so viel kostet in der Wahl des Ausweichens der Schritt vom Gehweg in die Fahrbahn
// (`_verkehrAufSpur`: er weicht in sie nur, wo kein anderer trägt) · fernS = so oft (Sekunden) geht der Takt über jeden Ruhenden
// (`_bewohnerRuhig`). DIE BEGEGNUNG (mensch.K5): begegnungM = so nah tritt der Spieler heran, bis der Bewohner ihm den Kopf
// zuwendet (zurück jenseits + nahHystM) · kopfMaxRad = so weit dreht der Kopf über dem Rumpf (die Halswirbelsäule ~70°),
// rumpfMaxRad = so weit der Rumpf über dem Becken (~25°), jenseits wendet sich, wer steht, mit dem Leib · kopfRadS = so schnell dreht der Kopf (Blickwendungen des Kopfs 200–300°/s,
// Zangemeister & Stark 1982) · spielerRaumM = der persönliche Raum über zwei Kapseln, den er dem Spieler lässt (Hall 1966:
// die persönliche Distanz ab 0,45 m), geweitet von der erinnerten Furcht (`_bewohnerSpielerAbstand`) · zeugeM = so weit sieht
// er den Schlag des Spielers und erinnert ihn (`_bewohnerZeuge`).
AnazhRealm.BEWOHNER = Object.freeze({
    gestalten: 8,
    restMax: 0.03,
    restBau: Object.freeze([0.06, 0.03, 0.07, -0.02]),
    platzAnteil: 0.45,
    raumM: 1.5,
    saumM: 0.45,
    geburtenJeTakt: 2,
    fernFaktor: 1.25,
    nahM: 8,
    nahHystM: 1,
    nahLeiber: 4,
    gangPhasen: 16,
    gangJeTakt: 2,
    platzRandM: 10,
    planH: 0.002,
    ankunftH: 3,
    ankunftWenden: 12,
    wendeH: 0.02,
    ankunftJeTakt: 8,
    sprungH: 0.25,
    wegeJeTakt: 2,
    direktM: 30,
    spurM: 0.8,
    gehwegM: 3,
    gehwegBreiteM: 0.2,
    kreuzM: 3,
    naehtM: 25,
    vorM: 1.6,
    kopfM: 1.8,
    rasterM: 5,
    ausweichS: 2.5,
    ausweichRichtungen: 12,
    ausweichWahl: 6,
    tuerFreiM: 0.9,
    aufholen: 1,
    besuchM: 40,
    besuchWeitM: 60,
    gasseFreiM: 1.6,
    gasseZelleM: 8,
    anschlussN: 48,
    auswegM: 3,
    auswegSchritt: 512,
    spurAuswegM: 15,
    gesetzAuswegM: 60,
    standRandM: 0.75,
    umRandM: 0.15,
    linieM: 2,
    lenkS: 0.1,
    fahrbahnStrafe: 3,
    fernS: 0.25,
    sohleM: 0.008,
    begegnungM: 3,
    kopfMaxRad: 1.2,
    rumpfMaxRad: 0.45,
    kopfRadS: 4.5,
    spielerRaumM: 0.5,
    zeugeM: 25,
});
