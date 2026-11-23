class AnazhRealm_siedlung_bewohner {
    // ===== ATLAS · Siedlung/bewohner — Bewohner · Tag · Wege · Tür · Kamin-Rauch =====
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
        const auge = this._lodAuge(); // das EINE Auge der Stufen
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
        // DER WURF DES RAUCHS (w28-funktion-welt): EIN Strom je Kamin und Takt, das Wechselnde vorn (hinten: Gleichschritt ×1,45)
        const uhr = `${Math.round((st.spielZeit || 0) * 1000)}:${AnazhRealm._saatJe(this)}-rauch`;
        for (const [, qq] of nah) {
            const w = this._streamRng(`${Math.round(qq.x * 10)},${Math.round(qq.z * 10)}:${uhr}`);
            if ((je.get(qq.id) || 0) < G.maxTeilchen && w() < p)
                dr.teilchen.push({
                    x: qq.x,
                    y: qq.y,
                    z: qq.z,
                    s: 1,
                    vy: G.vyBase + w() * G.vyRange,
                    dx: (w() - 0.5) * G.dxSpread,
                    a: G.a0,
                    q: qq.id,
                });
        }
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
            [T2.zx, T2.zy, T2.zz] = [T2.dx * W.labHz + w.x * w.ms, T2.vy * W.labHz, w.z * w.ms]; // sein Zug in m/s
            T2.a -= G.fade * f;
            T2.s *= Math.pow(G.scaleMul, f);
            if (T2.a <= G.aKill) dr.teilchen.splice(k, 1);
        }
        this._rauchZeichnen(
            G,
            dr.teilchen,
            "dorfRauchSatz",
            G.maxTeilchen * W.kamine,
            (G.vyBase + G.vyRange / 2) * W.labHz
        );
    }

    // DAS EINE RAUCH-BILD (w12-brand-rauch): Kamin (`dorfRauchSatz`, RAUCH_GESETZ des Labors) und Fahne des Brands
    // (`brandRauchSatz`, BRAND.bild.rauch) zeichnen dasselbe Gesetz — je Satz EINE Instanz-Senke, je Teilchen eine Fläche
    // quer zur Sicht (`_rauchStoff`), ihr Radius G.size × s, ihr Ort, und im Attribut `aRauch` (je Instanz): seine Deckung a
    // im Kern (der Stoff liest sie als optische Dicke τ = −ln(1 − a), Beer-Lambert: Dichte × Weg, dünn am Rand), sein
    // Radius in Metern (der Saum gegen die Tiefe und gegen das Auge) und sein Alter als Weg der Ausdünnung von a0 bis
    // aKill; im Attribut `aZug` sein Zug (die Richtung seiner Geschwindigkeit × Streckung, `RAUCH_BILD.zug`: jedes Teilchen
    // trägt `zx, zy, zz` in m/s). `steigMs` ist das Steigen der Quelle (das Muster der Fahne steigt mit ihr). Bis w12-brand-rauch zeichnete der Kamin die Kiste des Labors und die Fahne facettierte Ikosaeder (fast deckend
    // braun, Kugelketten in der Luft, eine Kugelreihe am Boden). Gleichfarbige Teilchen mischen ohne Tiefen-Schreiben fast
    // unabhängig von der Reihenfolge — ohne Sortierung.
    _rauchZeichnen(G, teilchen, satz, kap, steigMs) {
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
            const daten = new THREE.InstancedBufferAttribute(new Float32Array(3 * cap), 3);
            geo.setAttribute("aRauch", daten);
            const zug = new THREE.InstancedBufferAttribute(new Float32Array(3 * cap), 3);
            geo.setAttribute("aZug", zug);
            const uZeit = THREE.TSL.uniform(0);
            const mat = this._rauchStoff(G, uZeit, steigMs);
            this._leuchtStoff(mat, null); // der Rauch streut das Licht des Feuers (K11, der Licht-Pool)
            const mesh = AnazhRealm._instanzMesh(geo, mat, cap);
            mesh.name = G.name || "dorf-rauch";
            mesh.userData.inventar = G.inventar || mesh.name; // Identitäts-Stempel (gate:asset-inventory: Welt-Substanz)
            mesh.castShadow = false;
            mesh.receiveShadow = false;
            AnazhRealm._instanzZahl(mesh, 0);
            st.scene.add(mesh);
            R = st[satz] = { mesh, geo, mat, daten, zug, cap, uZeit };
        }
        // je Teilchen nur Radius und Ort in seine Matrix (die Senke beginnt mit Einheits-Matrizen, die übrigen Glieder bleiben 0)
        const n = Math.min(teilchen.length, R.cap);
        const [M, d, z, weg] = [
            R.mesh.instanceMatrix.array,
            R.daten.array,
            R.zug.array,
            Math.max(1e-6, G.a0 - G.aKill),
        ];
        const [zugS, zugMax] = AnazhRealm.RAUCH_BILD.zug;
        for (let k = 0; k < n; k++) {
            const t = teilchen[k];
            const r = G.size * t.s;
            const [o, i] = [16 * k, 3 * k];
            M[o] = M[o + 5] = M[o + 10] = d[i + 1] = r;
            M[o + 12] = t.x;
            M[o + 13] = t.y;
            M[o + 14] = t.z;
            d[i] = t.a;
            d[i + 2] = Math.min(1, Math.max(0, (G.a0 - t.a) / weg));
            // die Streckung längs seines Zugs: der Weg von `zug[0]` Sekunden je Radius, höchstens `zug[1]`
            const v = Math.hypot(t.zx, t.zy, t.zz);
            const e = v > 0 ? Math.min(zugMax, (v * zugS) / r) / v : 0;
            [z[i], z[i + 1], z[i + 2]] = [t.zx * e, t.zy * e, t.zz * e];
        }
        AnazhRealm._instanzZahl(R.mesh, n);
        R.uZeit.value = this._bildZeit || 0;
        if (n > 0) {
            R.mesh.instanceMatrix.needsUpdate = true;
            R.daten.needsUpdate = true;
            R.zug.needsUpdate = true;
            R.mesh.boundingSphere = null; // die Teilchen steigen: die Hülle folgt (three cullt die Wolke als Ganzes)
        }
    }

    // DER STOFF DES RAUCH-BILDS (`_rauchZeichnen`, RAUCH_BILD): die Fläche steht in den Achsen der Kamera (ihre Ecken ±1 längs
    // rechts und oben, `cameraWorldMatrix`; die Instanz trägt Radius und Ort — r184 rechnet den positionNode vor der Instanz,
    // Lehre 22), längs des Zugs gestreckt. Ihre Dicke fällt zum Rand wie die Sehne einer weichen Kugel, (1 − ρ²)^profil, vom
    // Rausch-Gesetz zerfasert — zwei Oktaven des EINEN Rausch-Atlas im Raum der WELT, mit der Fahne steigend (`rausch`: Skala je
    // Größe, Hub jung/alt, Anteil des Steigens): bis w28-rauch-bild trug jeder Ballen sein eigenes Muster um seinen Samen und
    // stand als Scheibe für sich. Die Deckung ist 1 − exp(−τ · Dicke) (Beer-Lambert) mal dem Saum gegen die Tiefe
    // (`_tiefenSaum`, `saum` × Radius: kein Schnitt an Gras und Boden) und gegen das Auge (`nah` × Radius). Das Licht ist das
    // der Welt — Sonne, Himmel und Licht-Pool auf rau-Standard (Albedo G.color) —, die Normale die eines Ballens
    // (`woelbung`): seine Unterseite sieht hinab ins Feuer, die Oberseite in den Himmel.
    _rauchStoff(G, uZeit, steigMs) {
        const T = THREE.TSL;
        const W = AnazhRealm.RAUCH_BILD;
        if (!(steigMs > 0)) throw new Error("_rauchStoff: der Rauch ohne Steigen (m/s) trägt kein Muster");
        const mat = new THREE.MeshStandardNodeMaterial({
            color: G.color,
            transparent: true,
            depthWrite: false,
            roughness: 1,
            metalness: 0,
        });
        const D = T.attribute("aRauch", "vec3");
        // die Dicke im Kern τ = −ln(1 − a) je Teilchen (im Vertex; die Deckung a höchstens `deckMax`)
        const tau = T.varying(T.float(1).sub(D.x.clamp(0, W.deckMax)).log().negate());
        // DER BALLEN IST LÄNGS SEINES ZUGS GESTRECKT (`aZug`: seine Richtung × Streckung, im Blick auf die Fläche gelegt —
        // längs des Blicks bleibt er rund): aufeinander folgende Ballen einer Quelle schließen zur Fahne
        // — er wird dabei schmaler (`schmal`: längs × (1 + m)^(1 − schmal), quer ÷ (1 + m)^schmal, m die Streckung im Blick):
        // der Schirm zahlt die Fahne nicht mit der vollen Fläche der Streckung
        const zv = T.cameraViewMatrix.mul(T.vec4(T.attribute("aZug", "vec3"), 0)).xy;
        const m = zv.length();
        const ecke = T.positionGeometry.xy;
        const flach = T.cameraWorldMatrix.mul(
            T.vec4(ecke.add(zv.mul(ecke.dot(zv).div(m.max(1e-4)))).div(m.add(1).pow(W.schmal)), 0, 0)
        ).xyz;
        mat.positionNode = flach;
        const naht = this._weltNaht(T);
        const lage = T.varying(naht.anker.add(flach.mul(naht.skala)));
        const q = T.uv().mul(2).sub(1);
        const ra = this._rauschAtlas();
        const [skala, hub, zug] = W.rausch;
        // das Muster steht in der WELT und steigt mit der Fahne (`steigMs` × `zug`): zwei Ballen, die sich decken, lesen an
        // derselben Stelle dasselbe Rauschen — ihre Löcher und Wülste gehen ineinander über, die Fahne ist EIN Körper.
        // EIN PROGRAMM FÜR JEDEN SATZ (druckwelle-bild): das Steigen der Quelle und die Skala des Musters je Größe sind
        // Uniformen des Satzes, keine Zahlen im Shader-Text — r184 schlüsselt Programm und Pipeline am Text
        // (`Pipelines.getForRender`), Kamin, Fahne und Staub der Druckwelle zeichnen mit DEMSELBEN Programm. Bis dahin baute
        // jeder Satz sein eigenes Fragment-Programm (gate:post-kette (k5): f114 · f115 · f116). Das erste Bild eines Satzes
        // hält dennoch: sein Ruck ist der Knoten-Bau beim Eintritt der Senke (GTX 1050, Mess-Wiese: Fahne 71 ms, Staub 132 ms
        // CPU; mit EINEM geteilten Stoff baut die Arena beim Eintritt des zweiten Glieds neu, 110 ms) — nicht das Programm.
        const [uSteig, uSkala] = [T.uniform(steigMs * zug), T.uniform(skala / G.size)];
        const p = lage.sub(T.vec3(0, uZeit.mul(uSteig), 0)).mul(uSkala);
        // die grobe Oktave im Raum (6 Texel), die feine als Ebene der Welt (x + z | y, 2 Texel)
        const rausch = ra
            .raum(p)
            .add(ra.ebene(T.vec2(p.x.add(p.z), p.y).mul(2.03).add(T.vec2(17.1, 5.3)), 7, "y").mul(0.5));
        const faser = T.float(1).add(rausch.mul(D.z.mul(hub[1] - hub[0]).add(hub[0])));
        const rr = q.dot(q);
        const dicke = T.float(1).sub(rr).max(0).pow(W.profil).mul(faser.max(0));
        mat.opacityNode = T.float(1)
            .sub(T.exp(tau.mul(dicke).negate()))
            .mul(this._tiefenSaum(D.y.mul(W.saum)))
            // und gegen das Auge: ein Ballen, in dem das Auge steht, läuft aus statt den Schirm zu verhängen (`nah` × Radius)
            .mul(T.positionView.z.negate().div(D.y.mul(W.nah)).clamp(0, 1));
        // die Normale der Kugel im Blick: die Unterseite des Ballens sieht hinab (das Feuer leuchtet sie an), die Oberseite
        // in den Himmel (nachts dunkel, am Tag in der Sonne)
        mat.normalNode = T.vec3(q.mul(W.woelbung), T.float(1).sub(rr).max(0.02)).normalize();
        // jung dicht und dunkel (Ruß im Kern der Fahne), mit dem Alter heller: die Albedo × mix(dunkel, 1, Alter)
        mat.colorNode = T.vec4(T.materialColor.mul(T.mix(T.float(W.dunkel), T.float(1), D.z)), 1);
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
        if (typeof kc.leibKoennen !== "function") return AnazhRealm._kernPflichtBruch("koerper:leibKoennen");
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
            // SEIN BAU (w28-leib-genom): die Achsen seines Skeletts — sein Punkt trägt sie in die Menge, die Geburt auf seine Knochen
            const dE = this._dialsAusGenom(gen);
            b.bau = Object.fromEntries(kc.BAU_GESETZ.achsen.map((a) => [a.achse, dE[a.achse]]));
            // SEIN KÖNNEN (mensch-zahlen, koerper `leibKoennen`): die Kraft seiner Beine über seinem Gewicht aus den Dials seines
            // Genoms und seinem Alter — das Tempo seines Gangs liest `lauf` (`_bewohnerGeburt`)
            b.koennen = kc.leibKoennen(Object.assign({}, dE, { age: gen.alter }));
            // SEIN PUNKT IM LEIB-RAUM IST DER SEINES NAHEN LEIBS (w28-gestalt, koerper `leibRaumPunkt`): das Weiche seiner GESTALT
            // (Geschlecht, Bau, Muskel, Alter, Haar — `G.dK`, der Guss, in dem er nah steht) auf SEINEN Knochen (`bau`); Breite und
            // Tiefe seines Genoms trägt die Matrix seines Satzes wie die Hüllen seines Leibs (`_bewohnerLeibAn`). Bis hier stand im
            // Satz der Punkt seines eigenen Genoms: beim Näherkommen sprang die Figur auf den Leib der nächsten Gestalt.
            b.raumPunkt = kc.leibRaumPunkt(Object.assign({}, G.dK, b.bau));
            b.raumSkala = dE.height / R.dK.height;
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
    // gewandt) und je Bedürfnis der Ort ihrer BINDUNG (die Ziel-Kette: koerper-core `tagesOrte` · `tagesBindung` über
    // tetrapoda `zielWahl` — der Kern wählt den Ort, der Wirt stellt nur den Stand an ihm): das Werk, der Mittagstisch, der
    // Abend — vor der Tür eines Hauses mit Rolle (die Station der eigenen Leute, der Ring der Fremden am Rand der Gasse), auf
    // dem Platz, im Acker. Trägt ein Ort keinen freien Stand mehr, bindet der Kern ohne ihn neu (`ohne`). Bis w28-ziel-plan
    // wählte hier eine Wenn-Kette aus drei Berufen (markt · feld · hof). Jeder Stand ist frei: kein Grundriss eines Baus (`_imGrundriss`, mit dem Saum des Leibs), Land
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
        const [KC, TC] = [window.__koerperCore, globalThis.__tetrapodaCore];
        if (!KC || typeof KC.tagesBindung !== "function") return AnazhRealm._kernPflichtBruch("koerper:tagesBindung");
        if (!TC || typeof TC.zielWahl !== "function") return AnazhRealm._kernPflichtBruch("tetrapoda:zielWahl");
        if (typeof TC.wegLaengen !== "function") return AnazhRealm._kernPflichtBruch("tetrapoda:wegLaengen");
        if (typeof KC.tagesWege !== "function") return AnazhRealm._kernPflichtBruch("koerper:tagesWege");
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
        // DIE NÄCHSTEN KNOTEN AUS DEM RASTER (Lehre 25: der billige Filter zuerst): je Zelle (`gasseZelleM` × 3) ihre Knoten; die
        // Frage eines Punkts geht Ring um Ring, bis seine n nächsten näher liegen als der nächste Ring — dieselben n wie die
        // Reihe über alle, nah zuerst. Bis w28-ziel-plan ordnete jede Probe eines Stands jeden Knoten des Plans (an der
        // Metropole 1 765), mit den Ständen der Bindung (bis zu drei mehr je Kopf) trug die Liste 135 statt 80 s Probe.
        const knotenRaster = (K, Z = 3 * BW.gasseZelleM) => {
            const R = new Map();
            K.forEach((k, i) => {
                const c = Math.floor(k.x / Z) * 2097152 + Math.floor(k.z / Z);
                const l = R.get(c);
                if (l) l.push(i);
                else R.set(c, [i]);
            });
            return (x, z, n) => {
                const [ix, iz, L] = [Math.floor(x / Z), Math.floor(z / Z), []];
                for (let ring = 0; ring < 96; ring++) {
                    for (let a = -ring; a <= ring; a++)
                        for (let c = -ring; c <= ring; c += Math.abs(a) === ring ? 1 : 2 * ring || 1)
                            for (const i of R.get((ix + a) * 2097152 + iz + c) || [])
                                L.push({ i, k: K[i], d: (K[i].x - x) ** 2 + (K[i].z - z) ** 2 });
                    if (L.length < n) continue;
                    L.sort((p, q) => p.d - q.d || p.i - q.i);
                    if (L[n - 1].d <= (ring * Z) ** 2) break;
                }
                return L.sort((p, q) => p.d - q.d || p.i - q.i).slice(0, n);
            };
        };
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
        let naheKnoten = null;
        // DER STAND HÄNGT NAHE SEINER TÜR AM NETZ (pendler-anschluss): wer an einer Tür steht (`ringStand`), erreicht sie über das
        // Wege-Netz des Plans (`S.netzGrund`, sein erster frei erreichter Knoten wie `_bewohnerAnschluss`, die Länge über das Netz
        // tetrapoda `wegLaengen`) höchstens auf `standUmweg` × der Luftlinie plus einer Naht (`naehtM`) — sonst hängt er jenseits
        // einer Wand am Netz, die die Gerade nicht sieht (die Klippe, der Block). An stadt-voll stand eine Werkstatt an der
        // Kante der Klippe, ihre Tür (948/168) auf der Terrasse: 21 Stände ihrer Station lagen 17–28 m vor der Tür am Fuß der
        // Klippe, frei erreicht hing jeder an einem Knoten unten — der Weg von der Tür ging 630–730 m um den Ring, 21 ihrer
        // Leute kamen um 10 Uhr nicht an (mit der Bindung nach dem Weg 22 → 1 von 1 336 nicht angekommen; der Richter:
        // gate:kreatur-takt zielplan „Stand jenseits der Wand", an der Stadt dorf 7 120 ohne diese Frage 231 von 1 902).
        let grundRaster = null;
        const grundLaengen = new Map();
        // (in Raten: je Knoten hinter einer Wand ein Schritt der Liste, wie die Frage des Stands, `frei`)
        const amGrundGang = function* (p) {
            const G = S.netzGrund || (S.netzGrund = realm._wegeNetzGrund(plan, S.ox, S.oz));
            for (const c of (grundRaster || (grundRaster = knotenRaster(G.knoten)))(p.x, p.z, BW.anschlussN)) {
                if (!realm._bewohnerWand(p, c.k)) return c;
                yield;
            }
            return null;
        };
        const amGrund = (p) => {
            const it = amGrundGang(p);
            for (let w = it.next(); ; w = it.next()) if (w.done) return w.value;
        };
        // DIE TÜR AM NETZ: der Punkt vor ihr an seinem ersten Knoten hinter keiner Wand — sieht er keinen (die Tür öffnet in einen
        // Winkel, 2 m vor ihr die Wand des Nachbarn), tritt man vor ihr zur Seite: der nächste freie Punkt im Umkreis bis zur Naht
        // (je 2 m, 16 Richtungen), den die Gerade von der Tür frei erreicht und der selbst einen Knoten sieht; {i, k, d} mit
        // d = der Weg bis zum Knoten. An der Stadt dorf 7 sah die Tür von 4 der 5 Scheunen keinen der 48 nächsten Knoten.
        const amTuer = (p) => {
            const ab = (u, v) => Math.hypot(u.x - v.x, u.z - v.z);
            const c = amGrund(p);
            if (c) return { i: c.i, k: c.k, d: ab(p, c.k) };
            for (let r = 2; r <= BW.naehtM; r += 2)
                for (let w = 0; w < 16; w++) {
                    const q = { x: p.x + r * Math.cos((w * Math.PI) / 8), z: p.z + r * Math.sin((w * Math.PI) / 8) };
                    if (realm._bewohnerWand(q, q, true) || realm._bewohnerWand(p, q)) continue;
                    const e = amGrund(q);
                    if (e) return { i: e.i, k: e.k, d: r + ab(q, e.k) };
                }
            return null;
        };
        const tuerNetz = new Map();
        // die Tür am Netz, gemerkt je Tür (`amTuer`)
        const tuerAm = (tuer) => {
            const wo = tuer.x + "," + tuer.z;
            let a = tuerNetz.get(wo);
            if (a === undefined) tuerNetz.set(wo, (a = amTuer(tuer)));
            return a;
        };
        // (e: der Knoten, an dem der Stand q hängt — `frei` fragt ihn EINMAL, `amGrundGang`; das Gesetz: `_bewohnerAnTuer`)
        const nahAnTuer = (q, tuer, e) => realm._bewohnerAnTuer(S, { tuerAm: tuerAm(tuer), tuerVor: tuer }, q, e.i, grundLaengen); // prettier-ignore
        let freiK = -1;
        const frei = function* (x, z, amRand = true, tuer = null) {
            const [ix, iz] = [Math.floor(x / BW.raumM), Math.floor(z / BW.raumM)];
            for (let i = -1; i <= 1; i++)
                for (let j = -1; j <= 1; j++)
                    for (let n = 0, l = belegt.get(raumZelle(ix + i, iz + j)) || []; n < l.length; n += 2)
                        if ((l[n] - x) ** 2 + (l[n + 1] - z) ** 2 < BW.raumM * BW.raumM) return false;
            if (amRand && amWeg(x, z)) return false;
            // (kein Stand in einem Stück des Platzes: der Tritt eines Marktstands, der Kreis eines Brunnens — aus dem PLAN, die
            // Stücke selbst stehen erst mit dem Erlebnis des Dorfs; an stadt-voll lagen 30 Stände in einem, fachwerk `imPlatzStueck`)
            if (!ohneStueck(x, z)) return false;
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
            // DER STAND AN EINER TÜR HÄNGT AM NETZ, DAS MAN GEHT (pendler-anschluss): sein Knoten ist der erste frei erreichte des
            // Grunds (`amGrundGang`, `S.netzGrund` — das Netz des Gangs, `_bewohnerNetz`), und an ihm misst die Tür ihren Weg
            // (`nahAnTuer`). Bis hier fragte der Stand erst die Punkte der Straßen des Plans und danach den Grund noch einmal:
            // zwei Netze, die Wände je Probe doppelt — an stadt-voll 15 621 statt 7 208 Läufe über die Knoten, 245 480 statt
            // 114 335 Wände, die Liste 10,6 s gegen 7,2 s an main (Radeon headless, je drei Läufe)
            if (tuer) {
                const e = yield* amGrundGang(q);
                freiK = e ? e.i : -1; // (sein Knoten: der Stand merkt ihn, `ringStand` — die Wache prüft den Strich zu ihm)
                return !!e && nahAnTuer(q, tuer, e);
            }
            for (const c of (naheKnoten || (naheKnoten = knotenRaster(knoten)))(x, z, BW.anschlussN)) {
                if (!realm._bewohnerWand(q, c.k)) return true;
                yield;
            }
            return false;
        };
        // DAS GESETZ DES STANDS (`gilt`): was er bei seiner Geburt hielt, hält er auch gerückt (`_bewohnerStandPruefen`) — die
        // Gasse frei (`amRand`), dazu das Gesetz seiner Art (`art`, der Platz); wie die Geburt steht er erst am Rand der Gasse,
        // dann auch in ihr, nie jenseits seiner Art
        // KEIN STAND IN EINEM STÜCK DES PLATZES, AUCH DER GERÜCKTE NICHT (w28-stadt-grammatik, fachwerk `imPlatzStueck`): die
        // Regel gehört zur Art jedes Stands. Bis hier trug sie nur die Hülle des gebauten Stücks: an stadt-voll lagen 14
        // gerückte Stände im Tritt eines Brunnens und einer in dem eines Marktstands, 3 Leiber standen um 12 Uhr darin
        const ohneStueck = (x, z) => !FC.imPlatzStueck(plan, x - S.ox, z - S.oz, BW.saumM, false);
        const nimm = (o, amRand = true) => {
            if (!o) return o;
            legen(o.x, o.z);
            const eigen = o.gilt || null;
            const art = (o.art = eigen ? (x, z) => eigen(x, z) && ohneStueck(x, z) : ohneStueck);
            o.gilt = !amRand ? art : (x, z) => art(x, z) && !amWeg(x, z);
            return o;
        };
        const steht = new Map();
        for (const e of this.state.architectures || [])
            if (e && Number.isFinite(e.seed))
                steht.set(`${e.seed >>> 0}@${Math.round(e.position.x)},${Math.round(e.position.z)}`, e);
        const pz = plan.platz && Number.isFinite(plan.platz.cx) ? plan.platz : null;
        // (das Rechteck des Platzes samt `platzRandM`: das Gesetz des Platz-Stands und des Markt-Stands, `gilt`)
        const amPlatzRand = (x, z) => {
            const [pc, ps, dx, dz] = [Math.cos(pz.phi || 0), Math.sin(pz.phi || 0), x - S.ox - pz.cx, z - S.oz - pz.cz];
            const [lx, lz] = [dx * pc - dz * ps, dx * ps + dz * pc];
            return Math.hypot(Math.max(0, Math.abs(lx) - pz.ex), Math.max(0, Math.abs(lz) - pz.ez)) <= BW.platzRandM;
        };
        // DER STAND AM MARKT (w28-stadt-grammatik, fachwerk `platzAnziehung`): wen der Tag an den Platz BINDET (das Werk, der
        // Mittagstisch, der Abend — koerper `tagesBindung`), der steht, wo der Plan die Menge anzieht: vor einem Stand, dem
        // Stand zugewandt (hinter der Theke steht sein Händler, unten); nie in einem Stand, einem Brunnen
        // oder im freien Kern der Markt-Gasse (`imPlatzStueck`). Ist vor jedem Stand einer, steht er auf dem Platz wie bisher
        // (`platzStand`); ein Platz ohne Stand im Plan trägt keinen Markt-Stand. Bis hier stand jeder gleichverteilt über das
        // Rechteck: an stadt-voll (34 × 22 m) standen um 12 Uhr 6 Leute binnen 15 m der Pose (main, 34 × 9,4 m: 35).
        const AZ = pz ? (typeof FC.platzAnziehung === "function" ? FC.platzAnziehung(plan) : null) : { punkte: [] };
        if (!AZ) return AnazhRealm._kernPflichtBruch("fachwerk:platzAnziehung");
        // (der Punkt hinter jeder Theke gehört ihrem Händler: er liegt im Raster des Raums, bevor ein Stand gewürfelt wird)
        for (const P of AZ.punkte) if (P.art === "haendler") legen(S.ox + P.x, S.oz + P.z);
        const marktStand = function* (g) {
            const vorn = AZ.punkte.filter((p) => p.art === "gast");
            if (!vorn.length) return null;
            for (const amRand of [true, false])
                for (let v = 0; v < 40; v++) {
                    const L = vorn;
                    const P = L[Math.min(L.length - 1, Math.floor(g.axis("ms" + v) * L.length))];
                    const a = (g.axis("ma" + v) * 2 - 1) * P.halb[0];
                    const b = (g.axis("mb" + v) * 2 - 1) * P.halb[1];
                    const [lx, lz] = [P.x + P.qx * a + P.fx * b, P.z + P.qz * a + P.fz * b];
                    const [x, z] = [S.ox + lx, S.oz + lz];
                    if (!FC.imPlatzStueck(plan, lx, lz, FC.MARKT_GESETZ.saumM, true) && (yield* frei(x, z, amRand))) {
                        const zu = { x: S.ox + P.zu.x, z: S.oz + P.zu.z };
                        return nimm(
                            { x, z, blick: Math.atan2(zu.x - x, zu.z - z), anker: zu, gilt: amPlatzRand },
                            amRand
                        );
                    }
                    yield;
                }
            return null;
        };
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
            const amPlatz = amPlatzRand;
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
        // der Stand im Ring vor der Tür (`wort` trennt den Heim-Stand von der Station des Werks) am Rand der Gasse, sonst in ihr
        // und weiteren Ringen; `gilt` (x, z): was er darüber trägt; `anker`: die Tür, der er gehört (beim Hof-Haus: Ring vor dem Tor)
        const ringStand = function* (g, wort, tx, tz, ux, uz, gilt = null, nurRand = false, anker = { x: tx, z: tz }) {
            const tuer = { x: tx + ux * BW.vorM, z: tz + uz * BW.vorM }; // der Punkt vor der Tür: dort geht jeder Weg hinein
            // (die Maße des Rings: BEWOHNER.ring — dieselbe Tafel liest gate:kreatur-takt zielplan als Schranke eines Stands). Der Gast (`nurRand`) geht am Rand ALLE Ringe bis an die Schranke: bis hier endete er nach `amRand` Versuchen (±9 m), an der 9,3-m-Gasse vor gasthaus #846868 (die Stadt dorf 7 30) fand 19 von 22 keinen Stand, kein Fremder kam an (zielplan) // prettier-ignore
            const RG = BW.ring;
            for (const amRand of nurRand ? [true] : [true, false])
                for (let v = 0; v < (amRand && !nurRand ? RG.amRand : RG.alle); v++) {
                    const stufe = Math.floor(v / RG.jeStufe);
                    const vor = RG.vor0M + stufe * RG.stufeM + g.axis(wort + "vor" + v) * RG.streuM;
                    const quer = (g.axis(wort + "quer" + v) * 2 - 1) * (RG.quer0M + stufe);
                    const x = tx + ux * vor - uz * quer;
                    const z = tz + uz * vor + ux * quer;
                    if (gilt && !gilt(x, z)) continue;
                    if (yield* frei(x, z, amRand, tuer))
                        return nimm(
                            {
                                x,
                                z,
                                blick: Math.atan2(ux, uz) + (g.axis(wort + "dreh") - 0.5) * 1.6,
                                anker, // er sieht von seiner Tür fort
                                // seine Tür am Netz (`_bewohnerAnTuer`: auch gerückt hängt er nahe ihr am Netz)
                                ...(knoten.length && { tuerAm: tuerAm(tuer), tuerVor: tuer, tuerK: freiK }),
                            },
                            amRand
                        );
                    yield;
                }
            return null;
        };
        // der Stand im Acker F (fachwerk: die lange Achse des Ackers längs cos/sin seines phi)
        const feldStand = function* (g, F) {
            const c = Math.cos(F.phi || 0);
            const s = Math.sin(F.phi || 0);
            for (let v = 0; v < 32; v++) {
                const lx = (g.axis("fx" + v) * 2 - 1) * F.ex * 0.85;
                const lz = (g.axis("fz" + v) * 2 - 1) * F.ez * 0.85;
                const x = S.ox + F.cx + lx * c - lz * s;
                const z = S.oz + F.cz + lx * s + lz * c;
                if (yield* frei(x, z)) return nimm({ x, z, blick: g.axis("fdreh") * Math.PI * 2 });
                yield;
            }
            return null;
        };
        // DIE TÜREN der stehenden Häuser (die Tür, die Richtung aus dem Haus, die Rolle) — die Tür des Heims und die des Besuchs; und
        // DER EINGANG (fachwerk `eingangVon`, die EINE Regel von Plan, Vorplatz und Wirt): beim HOF-Haus das Tor vor dem Hof — dort hängt der
        // Gang am Netz und stehen die Stände, über den Hof geht er auf der Achse der Front (`orte.ein`); bis w28-bau-rezept lag sein Punkt im Hof
        const tueren = [];
        for (const [si, sl] of plan.slots.entries()) {
            const wx = S.ox + sl.x;
            const wz = S.oz + sl.z;
            const haus = steht.get(`${sl.seed >>> 0}@${Math.round(wx)},${Math.round(wz)}`);
            if (!haus) continue; // kein Haus, keine Leute
            const [c, s, tu] = [Math.cos(sl.phi || 0), Math.sin(sl.phi || 0), sl.tuer || { x: 0, z: 0 }];
            const [tx, tz] = [wx + tu.x * c + tu.z * s, wz - tu.x * s + tu.z * c];
            const e = sl.tuer && FC.eingangVon(sl), [ex, ez] = e && e.hof ? [wx + tu.x * c + e.z * s, wz - tu.x * s + e.z * c] : [tx, tz]; // prettier-ignore
            const [mx, mz] = sl.obb ? [S.ox + sl.obb.cx, S.oz + sl.obb.cz] : [wx, wz];
            const ul = Math.hypot(tx - mx, tz - mz) || 1, [ux, uz] = e && e.hof ? [-s, -c] : [(tx - mx) / ul, (tz - mz) / ul]; // prettier-ignore
            tueren.push({ si, sl, haus, tx, tz, ux, uz, ex, ez });
        }
        for (const T of tueren) legen(T.ex + T.ux * BW.vorM, T.ez + T.uz * BW.vorM);
        // DER REST DES WERKS (`_weltOffen` leute): je Person ihr Stand und ihr Besuch — er fällt mit jedem gestellten
        S.listeRest = 2 * tueren.reduce((a, T) => a + Math.max(0, FC.leuteVon(T.sl.ov) | 0), 0);
        // DIE ORTE DES PLANS (koerper-core `tagesOrte`: je stehendem Haus sein Slot mit seiner Rolle, der Platz, die Äcker —
        // jeder mit seinem Angebot) und der Stand eines Menschen an einem Ort: am eigenen Haus die Station (ein zweiter Stand
        // vor der Tür), an einem fremden der Ring am Rand der Gasse, auf dem Platz sein Stand dort, im Acker ein Stand in ihm
        const tuerVon = new Map(tueren.map((T) => [T.si, T]));
        const orte = KC.tagesOrte(plan, (si) => tuerVon.has(si));
        const ortVon = new Map(orte.map((o, i) => [o.slot, i]));
        // KEIN ZIEL OHNE PLAN (tetrapoda `wegTeile` über den Grund des Wege-Netzes, `_wegeNetzGrund`): der Teil, an dem ein Stand
        // hängt — sein nächster frei erreichter Knoten, die Frage von `_bewohnerAnschluss`; zerfällt das Netz des Plans, trägt
        // ein Ort jenseits des Teils der eigenen Tür keinen Stand (der Kern bindet ohne ihn neu). An der Metropole (dorf 7 300)
        // liegen zwei Feldweg-Stücke 40 m und 87 m vom Straßennetz: 37 Feldarbeiter standen um 10 Uhr vor ihrer Tür, 49 am Abend
        // im Acker — „kein Weg im Dorf-Plan" (Probe zielplan).
        const NG = S.netzGrund || (S.netzGrund = this._wegeNetzGrund(plan, S.ox, S.oz));
        const teile = TC.wegTeile(NG.knoten.length, NG.kanten);
        const zerfaellt = teile.some((t) => t > 0);
        const teilVon = (o) => {
            if (!zerfaellt || !o) return 0;
            const c = amGrund(o);
            return c ? teile[c.i] : -1;
        };
        // DER ANSCHLUSS EINES ORTS ANS NETZ (pendler-anschluss): ein Haus hängt dort, wo man vor seine Tür tritt (der Punkt vor dem
        // Eingang, die Stände), an seinem ersten Knoten hinter keiner Wand (`amGrund`) — Platz und Acker an ihrer Mitte. Bis
        // pendler-anschluss nahmen Bindung und Teil den nächsten Knoten der Mitte des Hauses: an der Werkstatt an der Kante der
        // Klippe lag er am Fuß der Wand (36 m), die Wahl sah dort den kurzen Weg, der Mensch ging 640 m. Sieht der Punkt vor der
        // Tür keinen Knoten, tritt man zur Seite (`amTuer`) — ohne auch das an keinem: laut, und keiner wählt es (`tagesWege`:
        // Infinity). Die erste Fassung wog ein solches Haus nach der Luftlinie: an stadt-voll band eine Scheune, deren Tür keinen
        // Knoten sah, 9 Leute der Terrasse 60–122 m Luft, 536–644 m Weg — keiner kam um 10 Uhr an.
        let ortTeil = null;
        let wegZu = null;
        // (in Raten: je Ort ein Schritt der Liste — an stadt-voll 15 ms in EINEM Schritt über 1 000 Orte)
        const anschliessen = function* () {
            const ortAm = [];
            for (const o of orte) {
                yield;
                const T = o.art === "platz" || o.art === "feld" ? null : tuerVon.get(o.slot);
                const p = T ? { x: T.ex + T.ux * BW.vorM, z: T.ez + T.uz * BW.vorM } : { x: S.ox + o.x, z: S.oz + o.z };
                const c = amTuer(p);
                if (!c) realm._bruchMelden(`BEWOHNER: ${o.art} #${(plan.slots[o.slot] || {}).seed >>> 0} in „${plan.name || "?"}" hängt an keinem Knoten des Netzes`); // prettier-ignore
                ortAm.push(c ? { k: c.i, d: c.d } : null);
            }
            // (vorab je Ort der Teil seines Knotens: wer wählt, wählt nur am Teil seiner Tür — der Stand prüft danach genau)
            ortTeil = ortAm.map((a) => (!zerfaellt ? 0 : a ? teile[a.k] : -1));
            // DER WEG ZU EINEM ORT (koerper `tagesWege`): die Bindung wählt nach dem Weg, den der Mensch über das Wege-Netz des
            // Plans GEHT, nie nach der Luftlinie (pendler-anschluss)
            wegZu = KC.tagesWege(TC, orte, NG, S.ox, S.oz, (o, i) => ortAm[i]);
        };
        const standAm = function* (g, i, heimI, platz) {
            const o = orte[i];
            if (o.art === "platz") return (yield* marktStand(g)) || platz;
            if (o.art === "feld") return yield* feldStand(g, plan.felder[o.feld]);
            const T = tuerVon.get(o.slot);
            return yield* ringStand(g, i === heimI ? "w" : "o" + i, T.ex, T.ez, T.ux, T.uz, null, i !== heimI, { x: T.tx, z: T.tz }); // prettier-ignore
        };
        // DIE BINDUNG (der Kern wählt, `tagesBindung`): je Bedürfnis `namen` der Ort des Menschen P; der Wirt stellt den Stand
        // (je Ort einen, `am`) — trägt ein Ort keinen freien mehr oder hängt sein Stand an einem anderen Teil des Netzes (`voll`),
        // bindet der Kern ohne ihn neu, höchstens achtmal; daheim (der Index seines Hauses) trägt der Stand vor der Tür, den
        // Tisch drinnen die Tür (koerper-core `tagesPlan`). Liefert (wo) → sein Stand dort oder null.
        const binden = function* (P, namen) {
            for (let v = 0, neu = true; neu && v < 8; v++) {
                P.bind = KC.tagesBindung(TC, P.same, P.rolle, P.heimI, orte, (o, i) => P.voll.has(i) || (i !== P.heimI && ortTeil[i] !== P.heimTeil), wegZu); // prettier-ignore
                neu = false;
                for (const wo of namen) {
                    const i = P.bind[wo];
                    if (i < 0 || P.am.has(i) || (i === P.heimI && wo !== "werk")) continue;
                    const st =
                        i === P.heimI && P.rolle === "wohnhaus" ? null : yield* standAm(P.g, i, P.heimI, P.platz);
                    P.am.set(i, st);
                    if (i !== P.heimI && (!st || teilVon(st) !== P.heimTeil)) neu = P.voll.add(i);
                }
            }
            // DAHEIM TRÄGT NUR DAS WERK EINEN STAND (mensch-zahlen): der Abend daheim sitzt vor der Tür, der Tisch daheim ist
            // drinnen — der Plan ohne Ort (`tagesPlan`). Bis hier reichte der Griff den Stand des Werks vor dem eigenen Haus auch
            // als Abend und als Tisch durch: wer in einem Haus mit Rolle wohnt, aß mittags draußen an seinem Werk, und sein Abend
            // daheim las sich als Treff (an stadt-voll 10 der ersten 100, gate:kreatur-takt bewohner „daheim am Werk")
            return (wo) => {
                const i = P.bind[wo];
                return i < 0 || P.voll.has(i) || (i === P.heimI && wo !== "werk") ? null : P.am.get(i) || null;
            };
        };
        const liste = [];
        const besuche = [];
        // ERST STEHT JEDER VOR SEINER EIGENEN TÜR (pendler-anschluss): der Stand vor der Tür und der am Platz für jeden Bewohner
        // jedes Hauses, dann erst die Bindung (deren Stationen und Gäste stehen in den Ringen fremder Türen). Bis hier band jeder,
        // sobald er stand — die Station eines Werks nahm den Ring einer Tür, deren Leute noch nicht standen; seit der Stand nahe
        // seiner Tür am Netz hängt (`frei`), fand an stadt-voll so mancher Bewohner nur noch Stände jenseits (1 368 → 1 349
        // Leute; erst die eigene Tür: 1 366, je 17 und 19 ohne Stand vor der Tür, laut).
        const geboren = [];
        for (const T of tueren) {
            const { si, sl, haus, tx, tz, ux, uz, ex, ez } = T;
            const n = FC.leuteVon(sl.ov);
            if (!(n > 0)) continue;
            const rolle = typeof sl.rolle === "string" ? sl.rolle : "wohnhaus";
            const [tuer, vor] = [{ x: tx, z: tz, blick: Math.atan2(-ux, -uz), haus }, { x: tx + ux * BW.vorM, z: tz + uz * BW.vorM }]; // prettier-ignore
            const ein = ex !== tx || ez !== tz ? { x: ex + ux * BW.vorM, z: ez + uz * BW.vorM } : null; // vor dem Hof-Tor
            const heimI = ortVon.get(si);
            for (let k = 0; k < n; k++) {
                yield;
                S.listeRest--;
                const g = this._rollGenome(`${plan.seed >>> 0}:${si}:${k}`, "bewohner");
                const heim = yield* ringStand(g, "", ex, ez, ux, uz, null, false, { x: tx, z: tz });
                if (!heim) {
                    this._bruchMelden(
                        `BEWOHNER: ${rolle} #${sl.seed >>> 0} in „${plan.name || "?"}" — kein freier Stand vor der Tür`
                    );
                    continue;
                }
                geboren.push({ sl, si, k, g, rolle, tuer, vor, ein, heimI, heim, platz: yield* platzStand(g) });
            }
        }
        yield* anschliessen();
        for (const { sl, si, k, g, rolle, tuer, vor, ein, heimI, heim, platz } of geboren) {
            yield;
            const same = Math.floor(g.axis("tag") * 4294967296) >>> 0;
            // DIE BINDUNG (`binden`): das Werk, der Tisch, der Abend — der Besuch folgt, wenn jeder steht
            const P = {
                g,
                same,
                rolle,
                heimI,
                heimTeil: teilVon(heim),
                platz,
                am: new Map(),
                voll: new Set(),
                bind: null,
            };
            const ort = yield* binden(P, ["werk", "mahl", "abend"]);
            const bind = P.bind;
            const werk = ort("werk") || (bind.werk === heimI && rolle !== "wohnhaus" ? heim : null);
            // der Beruf nennt das Werk: die Rolle seines Hauses, der Markt, der Acker, die Art des Orts — ohne Ort der Hof
            const wA = werk && bind.werk !== heimI ? orte[bind.werk].art : rolle;
            const beruf = !werk ? "hof" : wA === "platz" ? "markt" : wA;
            // DIE EINE GESTALT DES BEWOHNERS (Lehre 25): der Satz trägt ab seiner Geburt jedes Feld, das ein Takt je an ihm
            // schreibt (ungesetzt `undefined`, wie ein fehlendes) — so teilen alle Sätze EINE versteckte Klasse, und jeder Zugriff
            // der Schleifen des Takts liest an fester Stelle. Bis hier trug der Satz 11 Felder, die übrigen ~60 schrieb der Takt in
            // der Reihe seiner Geschichte nach (an stadt-voll 19 Gestalten unter 1 096 Sätzen, ein Nachtrag über
            // `Object.assign` kippt ihn ins Wörterbuch): `_tickBewohner` trug 0,68 ms Selbst-Zeit je Bild, die Hälfte davon
            // Zugriffe wie `b.leib` und `b.d2`. Ein Literal (kein Spread: der trüge die Felder wieder einzeln nach); die Zeilen:
            // wer er ist · der Leib (`_bewohnerGenome`, `_bewohnerGeburt`) · der Takt der Köpfe und sein Raster
            // (`_tickBewohner`, `_bewohnerRasterLage`) · der Tag (`_bewohnerZiel`, `_bewohnerAnkunft`) · der Gang (`_bewohnerWeg`,
            // `_bewohnerGehen`, `_bewohnerSchritt`, `_gaitTick`) · am Steuer (`_verkehrAnlegen`) · sein Bestand (`_bestandAnlegen`).
            const u = undefined;
            // prettier-ignore
            liste.push({
                    heim: sl.seed >>> 0, rolle, beruf, same,
                    orte: { tuer, vor, ein, heim, platz, werk, mahl: ort("mahl"), abend: ort("abend"), besuch: null },
                    seed: `${plan.seed >>> 0}:${si}:${k}`, atem: g.axis("atem") * 10, leib: null, uhr: 0, takt: 0, frist: null,
                    genom: u, gestalt: u, groesse: u, breite: u, tiefe: u, farben: u, tonZeilen: u, koennen: u, beinL: u, tempo: u, tempoBand: u, satzOrt: u,
                    nr: u, ruht: u, rk: u, uhrAb: u, animDt: u, d2: u, kreis: u, nah: u, lageNeu: u, ankunft: u, x: u, z: u,
                    blick: u, begegnet: u, kopfY: u,
                    ziel: u, akt: u, drinnenSoll: u, drinnen: u, da: u, hinaus: u, stand: u, tagVon: u, tagAb: u, zielUhr: u,
                    drehen: u, platz: u, weichen: null,
                    weg: u, wi: u, linie: u, tag: u, wegRest: u, wegRestAb: u, gegangen: u, gehDt: u, gehTakt: u, rueck: u,
                    tempoTag: u, tempoJetzt: u, vx: u, vz: u, grundX: u, grundZ: u, grundH: u, grundGx: 0, grundGz: 0, _gait: u, _gaitW: u, walkPhase: u,
                    wagen: u, amSteuer: u, bestand: null, bestandBild: null,
                });
            besuche.push(P);
        }
        for (const [i, b] of liste.entries()) {
            yield;
            S.listeRest--;
            // DER BESUCH (koerper-core `tagesBindung`: die Tür eines anderen Hauses, `besuchFernM` fern von seiner Tür und seinem
            // Markt) — gebunden, wenn jeder seinen Stand vor der eigenen Tür, am Platz und am Werk hat (er nimmt keinem den Platz)
            b.orte.besuch = (yield* binden(besuche[i], ["besuch"]))("besuch");
        }
        // JEDER STAND TRÄGT SEINEN HÄNDLER (w28-stadt-grammatik; koerper TAGES_GESETZ.rollen.haendler, fachwerk `platzAnziehung`
        // „haendler"): je Stand des Plans EIN Bewohner mit der Rolle des Händlers — sein Werk ist der Punkt hinter der Theke,
        // über sie den Gästen zugewandt, das Mittag hält er durch (wie der Wirt des Gasthauses). Gewählt aus dem Plan: wer
        // sein Werk am Platz hat (der Kaufmann), sonst wer in einem Wohnhaus wohnt — je der, dessen Tür dem Stand am nächsten
        // liegt; in der Stadt nie die ersten zwei eines Hauses (sie tragen den Wagen, `_verkehrAnlegen`). Bis hier stand hinter
        // der Theke, wer zufällig zuerst dorthin gewürfelt wurde: im ersten Bild des Markts stand ein Stand ohne Händler.
        const frueh = plan.staedtisch ? 2 : 0;
        for (const P of AZ.punkte) {
            if (P.art !== "haendler") continue;
            let [wer, dMin, guete] = [null, Infinity, 0];
            for (const b of liste) {
                if (b.rolle === "haendler" || +b.seed.split(":")[2] < frueh) continue;
                const g = b.beruf === "markt" ? 2 : b.rolle === "wohnhaus" ? 1 : 0;
                const d = Math.hypot(b.orte.tuer.x - S.ox - P.x, b.orte.tuer.z - S.oz - P.z);
                if (g && (g > guete || (g === guete && d < dMin))) [wer, dMin, guete] = [b, d, g];
            }
            if (!wer) {
                this._bruchMelden(
                    `BEWOHNER: Marktstand ${P.stand} in „${plan.name || "?"}" — kein Händler (keiner trägt ihn)`
                );
                continue;
            }
            const [x, z] = [S.ox + P.x, S.oz + P.z];
            wer.rolle = wer.beruf = "haendler";
            wer.orte.werk = {
                x,
                z,
                blick: Math.atan2(P.fx, P.fz),
                anker: { x: x + P.fx * 4, z: z + P.fz * 4 },
                gilt: amPlatzRand,
                art: amPlatzRand,
                stand: P.stand,
            };
        }
        this._bestandAnlegen(liste);
        this._scheuneAnlegen(S, liste, tueren);
        S.listeRest = 0;
        return liste;
    }

    // DER BESTAND DER STADT (koerper BESTAND_GESETZ, Meisterkarte 2 mensch.wirtschaft markt S1 · handel S1): je Mensch, dessen
    // Beruf herstellt (`herstellung`: der Acker Kraut, die Schmiede Eisen), sein Werk als Halter — leer zur Stunde seiner Geburt,
    // es füllt sich in den Stunden seiner Arbeit; je Händler sein Stand — voll zur Geburt der Liste, die Waren der Stadt der Reihe
    // nach, er leert sich in seinen Stunden. Die Uhr ist der Tag der Prozesse (`_weltStunde`): der Bestand altert an der
    // Welt-Uhr, nie am Regler des Spielers. Der EINE Schreiber jedes Halters ist der Kern (`bestandNimm`, `bestandGib`,
    // `bestandAnkunft`), gerufen nur vom Tausch (`_bestandTausch`) und der Lieferung (`_bestandAnkunft`); ein Stoff, den die Welt
    // nicht kennt, bricht laut.
    _bestandAnlegen(liste) {
        const KC = window.__koerperCore;
        if (!KC || typeof KC.bestandHalter !== "function") return AnazhRealm._kernPflichtBruch("koerper:bestandHalter");
        const B = KC.BESTAND_GESETZ;
        const h = this._weltStunde();
        const waren = new Set();
        for (const b of liste) {
            const P = B.herstellung[b.beruf];
            if (!P || !b.orte.werk) continue;
            if (!this.state.materials || !this.state.materials[P.ware])
                throw new Error(`BESTAND: die Ware ${P.ware} des Berufs ${b.beruf} ist kein Stoff der Welt`);
            b.bestand = KC.bestandHalter("werk", P.ware, h, 0, b.same, b.rolle, b.beruf);
            waren.add(P.ware);
        }
        const W = [...waren].sort();
        let i = 0;
        for (const b of liste)
            if (b.rolle === "haendler" && b.orte.werk && b.orte.werk.stand != null && W.length)
                b.bestand = KC.bestandHalter("stand", W[i++ % W.length], h, B.lager.stand, b.same, b.rolle, b.beruf);
    }

    // DIE SCHEUNE DES HOFS (koerper `scheuneHalter` · `scheuneFassen`, Meisterkarte 2 mensch.nahrung.strom S1): je stehende Scheune
    // des Plans EIN Halter des Bestands mit der Ware des Ackers (BESTAND_GESETZ.herstellung.feld) — leer zur Stunde der Liste. Ihr
    // Hof sind die Leute, deren Tür ihr näher liegt als jeder anderen Scheune des Plans: sie essen aus ihr (`esser`), und wer von
    // ihnen am Acker arbeitet (sein Werk stellt die Ware her), trägt am Ende seiner Arbeit die Ernte in sie (`werke`). Ein Plan ohne
    // Scheune lagert nichts. Die Kisten vor ihrem Tor zeigen den Vorrat (`_bestandBild`, dasselbe Kistenmaß wie am Stand).
    _scheuneAnlegen(S, liste, tueren) {
        const KC = window.__koerperCore;
        if (!KC || typeof KC.scheuneHalter !== "function") return AnazhRealm._kernPflichtBruch("koerper:scheuneHalter");
        const ware = KC.BESTAND_GESETZ.herstellung.feld.ware;
        if (!this.state.materials || !this.state.materials[ware])
            throw new Error(`SCHEUNE: die Ware ${ware} des Ackers ist kein Stoff der Welt`);
        const h = this._weltStunde();
        const vorM = AnazhRealm.BEWOHNER.vorM;
        const hoefe = tueren
            .filter((T) => T.sl.rolle === "scheune")
            .map((T) => ({
                slot: T.si,
                orte: { werk: { x: T.tx + T.ux * vorM, z: T.tz + T.uz * vorM, blick: Math.atan2(-T.ux, -T.uz) } },
                leute: [],
                werke: [],
                bestand: null,
                bestandBild: null,
            }));
        const von = this._scheuneVon || (this._scheuneVon = new WeakMap());
        if (hoefe.length)
            for (const b of liste) {
                const t = b.orte.tuer;
                let best = null;
                for (const H of hoefe) {
                    const d = Math.hypot(H.orte.werk.x - t.x, H.orte.werk.z - t.z);
                    if (!best || d < best.d) best = { H, d };
                }
                best.H.leute.push(b);
                if (b.bestand && b.bestand.art === "werk" && b.bestand.ware === ware) best.H.werke.push(b.bestand);
            }
        for (const H of hoefe) {
            H.bestand = KC.scheuneHalter(ware, h, 0, H.leute.length);
            for (const W of H.werke) von.set(W, H);
        }
        S.scheunen = hoefe;
    }

    // DIE ERNTE BIS JETZT (koerper `scheuneFassen`): die Scheune des Hofs legt jede Ernte seit ihrer Uhr an — vor jedem Leser
    // ihres Bestands und vor jedem, der am Werk eines ihrer Bauern nimmt (die Lieferung des Wagens): wer zuerst kommt, nimmt
    // nach der Uhr, nie nach der Reihe der Leser. `x` ein Hof (`S.scheunen`) oder ein Werk-Halter eines seiner Bauern.
    _scheuneFassen(x, h = this._weltStunde()) {
        const hof = x && x.werke ? x : this._scheuneVon && this._scheuneVon.get(x);
        return hof ? window.__koerperCore.scheuneFassen(hof.bestand, hof.werke, h) : 0;
    }

    // DER TAUSCH (markt S1: Spieler ↔ Bewohner, nur, was er hat): die Taste des Verbs (`einsteigen`, E) vor einem Stand, dessen
    // Händler an ihm steht — der Spieler gibt EINE Einheit eines Stoffs aus seinem Inventar (den ersten, der nicht die Ware des
    // Stands ist), der Händler gibt EINE seiner Ware, wenn er sie hat. Beide Seiten gehen durch den Kern (`bestandNimm` ·
    // `bestandGib`): kein Tausch erzeugt Ware. Liefert true, wenn ein Stand in Reichweite war (die Taste ist dann verbraucht),
    // auch ohne Tausch (leerer Stand, leeres Inventar — beide laut im Tagebuch).
    _bestandTausch() {
        const KC = window.__koerperCore;
        const st = this.state;
        const pm = st.playerMesh && st.playerMesh.position;
        if (!pm || !this._bewohnerSiedlungen || !st.player || !Array.isArray(st.player.inventory)) return false;
        if (st.player.mountedArch != null) return false; // wer reitet, steigt mit der Taste ab
        const R = AnazhRealm.BESTAND_BILD.tauschM;
        let wer = null;
        let dMin = R;
        for (const S of this._bewohnerSiedlungen.values())
            for (const b of S.liste || []) {
                if (!b.bestand || b.bestand.art !== "stand") continue;
                const d = Math.hypot(b.orte.werk.x - pm.x, b.orte.werk.z - pm.z);
                if (d < dMin) [wer, dMin] = [b, d];
            }
        if (!wer) return false;
        const H = wer.bestand;
        const ware = H.ware;
        const g = wer.leib;
        const da =
            !!g && !wer.drinnen && Math.hypot(g.position.x - wer.orte.werk.x, g.position.z - wer.orte.werk.z) < 1.5;
        const h = this._weltStunde();
        const inv = st.player.inventory;
        const i = inv.findIndex((s) => s && s.kind === "material" && s.material !== ware && (s.count || 0) >= 1);
        const vorher = KC.bestandAm(H, h);
        const sag = (k, w) => this.journalAppend("note", [k, w], { ware, bestand: Math.floor(KC.bestandAm(H, h)) });
        if (!da) return (sag("journal.tausch-zu", { ware }), true);
        if (i < 0) return (sag("journal.tausch-nichts", { ware }), true);
        if (KC.bestandNimm(H, ware, 1, h) < 1) return (sag("journal.tausch-leer", { ware }), true);
        const gabe = inv[i].material;
        if (!this.addMaterialToInventory(ware, 1)) {
            KC.bestandGib(H, ware, 1, h); // das Inventar ist voll: die Ware bleibt am Stand
            return (sag("journal.tausch-voll", { ware }), true);
        }
        this.removeFromInventory(i, 1);
        KC.bestandGib(H, gabe, 1, h);
        const n = Math.floor(KC.bestandAm(H, h) + 1e-9);
        this.journalAppend("growth", ["journal.tausch", { gabe, ware, n }], {
            ware,
            gabe,
            vorher,
            nachher: KC.bestandAm(H, h),
        });
        this.log(`Tausch: 1 ${gabe} gegen 1 ${ware} — der Stand trägt noch ${n} ${ware}`, "INFO");
        this._bestandBild(wer, true);
        return true;
    }

    // DAS BILD DES BESTANDS (das Kistenmaß des Gesetzes, BESTAND_GESETZ.kiste): je angefangene Kiste eine Kiste der Welt (der
    // Bauplan `kiste`, sein Stoff) — am Stand neben dem Händler in zwei Lagen, auf dem Wagen auf seinem Dach (`_verkehrLadung`).
    // Gezeichnet nur, was nah steht (`BESTAND_BILD.nahM` vom Auge der Stufen): die Kosten trägt der Schirm, nie die Stadt; je
    // Halter EINE Gruppe, ihre Kisten werden sichtbar oder nicht, nie neu gebaut. `jetzt` zeichnet sofort (nach einem Ereignis),
    // sonst prüft der Takt (`_bestandBildTakt`) die Stände im Kreis je `taktS`.
    _bestandBild(b, jetzt = false) {
        const H = b.bestand;
        if (!H || (H.art !== "stand" && H.art !== "scheune")) return;
        const KC = window.__koerperCore;
        if (H.art === "scheune") this._scheuneFassen(b); // die Scheune trägt die Ernten bis jetzt (vor dem Tor der Hof)
        const n = KC.bestandAm(H, this._weltStunde());
        const k = Math.ceil(n / KC.BESTAND_GESETZ.kiste - 1e-9);
        const G = this._bestandKisten(b, Math.ceil(H.cap / KC.BESTAND_GESETZ.kiste));
        if (!G) return;
        if (!jetzt && G.userData.kisten === k) return;
        G.userData.kisten = k;
        G.children.forEach((c, j) => (c.visible = j < k));
        G.visible = k > 0;
    }

    // die Gruppe der Kisten eines Stands (einmal gebaut, an seinem Ort): seitlich des Händlers, quer zu seinem Blick, in zwei Lagen;
    // trägt ein Halter mehr als sechs Kisten (die Scheune), stehen die weiteren in Reihen dahinter (je Reihe wieder drei in zwei Lagen)
    _bestandKisten(b, m) {
        if (b.bestandBild) return b.bestandBild;
        const bp = this.state.blueprints && this.state.blueprints.kiste;
        if (!bp || !this.state.scene) return null;
        const w = b.orte.werk;
        const [fx, fz] = [Math.sin(w.blick), Math.cos(w.blick)];
        const kM = AnazhRealm.BESTAND_BILD.kisteM;
        // DIE KISTEN STEHEN NIE IM HAUS (strom S1, acker-kette 2): die Reihen wachsen vom Werk-Ort fort, seitlich des Blicks —
        // am Start-Dorf lag die vierte Reihe zweier von drei Scheunen in der Wand des Nachbarn (6 bzw. 4 von 24 Plätzen im
        // Grundriss „haus“, dort trägt kein gezeichneter Boden), `_bodenSichtAt` antwortete null und das Bild des Vorrats kam
        // NIE (die Scheune voll 62 Einheiten, vor dem Tor keine Kiste; keine der vier Seiten war ganz frei, die Reihen dahinter
        // liefen bis 7 m tief durch das Nachbarhaus). Nun nimmt jede Kiste den nächsten FREIEN Fuß: zuerst die bisherigen
        // Reihen (drei breit, nach hinten), danach das Feld daneben (seitlich bis 8 Füße, 4 nach hinten, 2 zum Tor) nach
        // Abstand vom ersten Fuß (beide Seiten des Händlers, sein Fuß bleibt frei); ein Fuß im Grundriss eines Hauses oder Baus
        // (mit dem Rand einer halben Kiste) fällt aus — auch dort, wo Boden gezeichnet ist (am Start-Dorf standen so 12 von 24
        // Kisten des dritten Hofs in einer Wand). Wo nichts im Weg steht, ist die Lage die bisherige
        const fussLage = ([c, r]) => {
            const a = AnazhRealm.BESTAND_BILD.seiteM + c * kM;
            const d = r * kM;
            return [w.x + fz * a + fx * d, w.z - fx * a + fz * d];
        };
        const fuss = (j) => (j % 3) + 3 * Math.floor(j / 6); // der Platz der Kiste j am Boden (die Folge der freien Füße)
        const n = m > 0 ? fuss(m - 1) + 1 : 0;
        const plaetze = [];
        for (let q = 0; q < n; q++) plaetze.push([q % 3, -Math.floor(q / 3)]);
        const feld = [];
        const s0 = AnazhRealm.BESTAND_BILD.seiteM / kM; // (der Fuß des Händlers: a = 0 bleibt frei)
        for (let c = -8; c < 8; c++) for (let r = -6; r <= 4; r++) if (Math.abs(s0 + c) >= 1) feld.push([c, r]);
        feld.sort((A, B) => Math.hypot(A[0], A[1]) - Math.hypot(B[0], B[1]));
        for (const P of feld) if (!plaetze.some((Q) => Q[0] === P[0] && Q[1] === P[1])) plaetze.push(P);
        // (der Boden, auf dem sie stehen, ist das gezeichnete Mesh, Lehre 22 — solange er nicht steht, wartet das Bild auf den Takt)
        const fuesse = [];
        const y = [];
        for (let q = 0; fuesse.length < n && q < plaetze.length; q++) {
            const p = fussLage(plaetze[q]);
            const g = this._imGrundriss(...p, kM / 2);
            if (g === "haus" || g === "bau") continue;
            const h = this._bodenSichtAt(...p);
            if (h == null) return null;
            fuesse.push(p);
            y.push(h);
        }
        if (fuesse.length < n) return null;
        const lage = (j) => fuesse[fuss(j)];
        const G = new THREE.Group();
        for (let j = 0; j < m; j++) {
            const k = this._buildArchMeshMerged(bp);
            const [x, z] = lage(j);
            k.position.set(x, y[fuss(j)] + (Math.floor(j / 3) % 2) * kM, z);
            k.rotation.y = w.blick;
            G.add(k);
        }
        G.userData.kisten = -1;
        this.state.scene.add(G);
        return (b.bestandBild = G);
    }

    // DER TAKT DES BILDS DER STÄNDE (je `taktS` der Bild-Uhr, nur die Stände im Kreis `nahM` um das Auge): der Verbrauch leert den
    // Stand an der Welt-Uhr, das Bild folgt ihm; ein Stand, der den Kreis verlässt, verbirgt seine Kisten
    _bestandBildTakt(S) {
        const t = this._bildZeit || 0;
        if (S.bestandTakt != null && t - S.bestandTakt < AnazhRealm.BESTAND_BILD.taktS) return;
        S.bestandTakt = t;
        const p = this._lodAuge() || this.state.playerMesh.position;
        const R = AnazhRealm.BESTAND_BILD.nahM;
        for (const b of [...(S.liste || []), ...(S.scheunen || [])]) {
            if (!b.bestand || (b.bestand.art !== "stand" && b.bestand.art !== "scheune")) continue;
            const nah = Math.hypot(b.orte.werk.x - p.x, b.orte.werk.z - p.z) < R;
            if (nah) this._bestandBild(b);
            else if (b.bestandBild && b.bestandBild.visible)
                [b.bestandBild.visible, b.bestandBild.userData.kisten] = [false, -1];
        }
    }

    // die Kisten eines Halters fort (die Liste geht, `_bewohnerFort`)
    _bestandFort(S) {
        for (const b of [...(S.liste || []), ...(S.scheunen || [])])
            if (b.bestandBild) {
                this.state.scene.remove(b.bestandBild);
                this._disposeSoulGroup(b.bestandBild);
                b.bestandBild = null;
            }
    }

    // DIE HÄUSER STEHEN MIT IHRER HÜLLE (siedlung.K3): die Liste entsteht, wenn jedes Haus ihres Plans seine Studio-Hülle trägt
    // (`_hausHuelleSetzen`: die Boxen seiner Wände im Blocker-Netz) — ihre Regeln fragen die Wände (`frei`, die Linie zum Netz).
    // Bis siedlung-k3-hang entstand die erste Liste vor den Hüllen (das Start-Dorf am Hang: 18 von 18 Häusern ohne Hülle), jede
    // nach einer Abwesenheit mit ihnen: die erste stellte Stände hinter Hauswände, die zweite andere (die Wiederkehr 21 m).
    // EINE HÜLLE JE HAUS (eine-huelle): es wartet JEDES Haus des Plans, und die Liste holt, worauf sie wartet (`_hausHuelleHolen`:
    // die Lieferung des Fernkörpers trägt die Hülle wie jede Stufe) — je Takt `huellenJeTakt` Häuser, reihum. Bis hier wartete
    // sie nur auf die Häuser in der Mesh-Zone (`architectureCullingRadius`) und die gezeichneten: ein kaltes Haus jenseits
    // stand in vier Wänden aus seiner Tür-Zeile, trug seine Hülle erst, wenn der Spieler nahte, und die Wache rückte dann die
    // Stände um es (0,3–2,9 m, 28 während einer Zählung am Start-Dorf — die Station menge.bevoelkerung#1 verlor ihr Soll).
    // Die Ausnahme kam mit w3u-stadt-leben: der Fernkörper trug keine Hülle, die Metropole an stadt-voll (295 Häuser bis 409 m
    // vom Markt, 165 kalt) blieb ohne einen Bewohner.
    _bewohnerHuellenDa(S) {
        const samen = S.hausSamen || (S.hausSamen = new Set(S.plan.slots.map((sl) => sl.seed >>> 0)));
        const offen = [];
        for (const e of this.state.architectures || [])
            if (e && e.tuer && !e._hausHuelle && samen.has(e.seed >>> 0)) offen.push(e);
        if (!offen.length) return true;
        const n = AnazhRealm.BEWOHNER.huellenJeTakt;
        const ab = (S.huellenAb = (S.huellenAb | 0) % offen.length);
        let da = 0;
        for (let i = 0; i < Math.min(n, offen.length); i++)
            if (this._hausHuelleHolen(offen[(ab + i) % offen.length])) da++;
        S.huellenAb = ab + n;
        return da === offen.length;
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
    // DER LEIB IM RING (w28-leib-im-ring, Gebot 7: die Kosten hängen am Schirm, nie an der Kopfzahl): die Geburt stellt den
    // STAND des Bewohners — seine Hülle `b.leib` (Lage, Größe, `userData`: Heim, Gattung, Farben, Feld und Satz) und die Zahlen
    // seines Baus (`bauZu`, `beinMass`, `beinL`, `tempo`); den Leib selbst (Haut, Knochen, Grobstufe) zieht `_bewohnerLeibAn` in
    // die Hülle, nur für den, den das Auge als Leib sieht (die Nah-Wahl, der Fahrer im gezeichneten Wagen) oder an dem seine
    // Gestalt backt (`_bewohnerGangBacken`), und `_bewohnerLeibAb` nimmt ihn wieder. Der ERSTE einer Gestalt trägt ihn bei der
    // Geburt: an ihm misst sie ihr Maß (`G.mass`). Bis hier trug jeder Kopf Leib und Grobstufe mit je eigenem Skelett —
    // Dorfplatz mensch.K2#2 (Radeon, 16.11.): 77 Bewohner, 1 sichtbar, 952 Skelette, 4 879 Objekte, 454,2 MB Heap.
    _bewohnerGeburt(S, b) {
        const G = S.gestalten[b.gestalt];
        const g = new THREE.Group();
        g.rotation.order = "YXZ"; // wie der Mensch-Bau (`_buildHumanGroup`)
        g.name = "bewohner";
        g.userData.heim = b.heim;
        g.userData.gattung = `mensch:${S.key}:${b.gestalt}`;
        g.scale.setScalar(b.groesse);
        // SEINE FARBEN (mensch.K4): jedes Teil liest seine Palette aus der Ton-Tafel (`userData.__ton` [Kopf, Gestalt],
        // `_tonFaktor`), das Feld seine Glieder (`_tonFeldFarbe`)
        g.userData.__tonZeilen = b.tonZeilen;
        this._bewohnerStellen(b, g, b.x, b.z);
        g.rotation.y = b.blick;
        g.visible = false;
        g.userData._menge = true; // der Mensch der Menge: sein Feld wählt das Stufen-Gesetz am Schirm (`_feldGrenzen`)
        // seine Glieder im Feld stehen in der Lage seiner Gestalt (`_bewohnerFeldLage`, `_bewohnerFeldAnker`), nie an Knochen
        g.userData._feldLageVon = b._feldLageVon = { b, S };
        b.bauZu = Object.assign({}, G.dK, b.bau);
        b.leib = g;
        if (!G.mass) {
            if (!this._bewohnerLeibAn(S, b)) {
                b.leib = false;
                return;
            }
            this._bewohnerBackt(S, b); // an ihm backt seine Gestalt (`_bewohnerGangBacken`)
        }
        // DER LEIB OHNE SZENEN-GANG (die Klasse der Ruhe, K59: `_ruhendeWurzel`): seine Matrizen stehen, der Szenen-Gang
        // überspringt ihn; was ihn bewegt (Atem, Gang, Schritt — `_tickBewohner`), zieht sie selbst nach (`_leibMatrix`)
        this._leibMatrix(g);
        g.updateMatrixWorld = AnazhRealm._ruhendeWurzel;
        // DAS TEMPO DES GANGS (mensch.K2): die Tempo-Einheit des Steuer-Gesetzes an seiner Beinlänge × `gang` des Tags × `lauf`
        // seines Könnens (mensch-zahlen, koerper `leibKoennen`: die Kraft seiner Beine über seinem Gewicht — bis hier ging der
        // Greis so schnell wie der Athlet, 100 m binnen ±1,5 % über 100 Bewohner). Die
        // Beinlänge seiner GESTALT in seiner Größe, nicht die seines Baus (w28-leib-genom): der Schritt seines Gangs liest sein
        // wahres Bein (`beinMass`, kein Gleiten), das Tempo seines Tags bliebe mit ihm ±1,3 % je σ — und die Ankunft spielt
        // einen Weg nicht tempo-treu nach: am wahren Bein riss die Wiederkehr an 1 von 1296 (2,674 m über ±2 m,
        // gate:kreatur-takt bewohner — derselbe Bewohner, der an der Achse des Kopfs riss). Diese Wurzel steht offen.
        b.beinMass = this._bewohnerBeinMass(G, b);
        if (g.userData.rig) g.userData.rig._beinMass = b.beinMass;
        b.beinL = Math.max(0.3, G.mass.beinL * b.groesse);
        b.tempoBand = globalThis.__tetrapodaCore.tempoEinheit(b.beinL) * window.__koerperCore.TAGES_GESETZ.gang;
        b.tempo = b.tempoBand * b.koennen.lauf;
        this.state.scene.add(g);
        if (S.satz === null) S.satz = this._bewohnerSatz(S, b);
        // DIE LAGEN SEINER GESTALT (das Feld, `_bewohnerFeldLage`): der Gang ihrer Glieder je Gestalt, der Stand sofort
        if (G.lage === null) {
            G.lage = { n: AnazhRealm.BEWOHNER.gangPhasen, gebacken: 0, fertig: false, tempo: b.tempoBand, gang: null };
            for (let h = 0; h < AnazhRealm._bewohnerStaende().length; h++)
                this._bewohnerGangPose(g, G.lage, G.lage.n + h, null);
        }
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
            const wu = this._weltUhrSprung | 0; // der Sprung der Welt-Uhr (`_weltUhrNimm`) ist derselbe Sprung (w28-funktion-welt)
            const sprung = (S.weltUhrSprung ?? wu) !== (S.weltUhrSprung = wu) || Math.min(dU, 24 - dU) >= BW.sprungH;
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
            // (`_bewohnerAnkunft`), ohne den Gang davor — Tempo, Lauf, Rückstand, Schritt, Phase, Nähe, Platz und Tür
            if (sprung) {
                for (const b of S.liste) {
                    Object.assign(b, { gegangen: 0, gehTakt: 0, tempoJetzt: 0, tempoTag: undefined, rueck: 0 });
                    Object.assign(b, { vx: 0, vz: 0, platz: false, hinaus: false, ankunft: !!b.leib, walkPhase: 0, _gaitW: 0, _gait: undefined, nah: false, begegnet: false }); // prettier-ignore
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
                if (this._bewohnerStandNeu(b, S)) anders = true; // der Akt wechselt am selben Ort: sein Stand im Satz
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
                    const div = Math.max(
                        1,
                        this._creatureAnimDiv(Math.sqrt(ad2), this._bewohnerGelenkAb(S, b), 0, delta, true)
                    );
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
                    // die Glieder backen vorab: wer hinausgeht, trägt sein Feld ab dem ersten Schritt — wer ins Feld tritt, geht
                    // dort seinen Gang (`_kzLeib` schreibt seine Glieder über `_bewohnerFeldLage`, der EINE Schreiber)
                    this._kzLeib(g, auge, true);
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
                    const bd = this._bedeutung(g.scale.y || 1, Math.sqrt(ad2), b.weg ? b.tempoJetzt : 0, g.position);
                    b.bedeutung = b.nah ? bd / (1 - u._gelenk.hyst) ** 2 : bd;
                    nah.push(b);
                }
            }
            S.ankunftOffen = ankuenfte >= BW.ankunftJeTakt; // es warten noch Ankünfte (der Verkehr hält, `_verkehrFolge`)
            // DIE NAH-WAHL: höchstens `nahLeiber` der Bedeutendsten leben (Gang, Atem, Stufen, Blick des Leibs) — jeder andere im
            // Nah-Kreis steht im Satz seiner Gestalt; der Wechsel schaltet nur `visible` und schreibt die Sätze neu
            nah.sort((a, b) => b.bedeutung - a.bedeutung);
            if (nah.length > BW.nahLeiber) nah.length = BW.nahLeiber;
            // DER LEIB IM RING (w28-leib-im-ring): wen die Wahl trifft, dem zieht sein Leib in die Hülle (`_bewohnerLeibAn`,
            // unter dem Deckel der Geburten) — bis dahin trägt ihn der Satz, wie jeden anderen im Nah-Kreis. Wen die Wahl trifft
            // und der Deckel warten lässt, dessen Leib verlangt das Gesetz JETZT: die Welt steht nicht ohne ihn (`leibOffen`, der
            // Leser `_weltOffen().leute`); wem der Bau keinen Leib gibt, der ist laut gebrochen (`_bruchMelden`), nie offen.
            S.leibOffen = 0;
            for (let i = nah.length - 1; i >= 0; i--) {
                if (nah[i].leib.userData.rig) continue;
                if (geburten >= BW.geburtenJeTakt) S.leibOffen++;
                else if (this._bewohnerLeibAn(S, nah[i])) {
                    geburten++;
                    continue;
                }
                nah.splice(i, 1);
            }
            const halter = this._bewohnerHalter || (this._bewohnerHalter = []);
            halter.length = 0;
            let armeFrei = true; // (die Ruhe der Arme seines Baus: EIN Leib je Takt, unten)
            for (const b of koepfe) {
                const g = b.leib;
                if (!g) continue;
                // DAS RASTER DER LEIBER (mensch.K3, `_bewohnerAusweichen`): wer draußen steht oder geht, in der Zelle seiner Lage
                // nach dem Schritt (bis zum nächsten Takt bewegt keiner einen Leib); wer steht, steht still (sein Tempo 0)
                if (!b.weg) b.vx = b.vz = 0;
                this._bewohnerRasterLage(S, b);
                if (b.amSteuer) continue; // sein Leib gehört dem Wagen (`_tickVerkehr`)
                const istNah = nah.indexOf(b) >= 0;
                if (this._bewohnerStandNeu(b, S)) bewegt.push(b); // die Furcht kommt und geht: sein Stand im Satz
                // DIE ARME IN DER RUHE SEINES BAUS (w28-leib-genom, koerper `leibBauArme`): wer nah gezeigt wird, hängt seine Arme an
                // SEINEM Rumpf — der Löser am Baum des Gesetzes, einmal je Leib und höchstens EIN Leib je Takt (Lehre 25: die
                // Geburt zahlt ihn nicht; fern trägt ihn der Satz, sein Punkt im Leib-Raum). Die Ruhe der Gelenk-Gestalt merkt sie.
                if (istNah && b.armeOffen && armeFrei) {
                    const [G, kc, rig] = [S.gestalten[b.gestalt], window.__koerperCore, g.userData.rig];
                    kc.leibBauArme(rig, G.bauRuhe || (G.bauRuhe = kc.leibBauRuhe(G.dK)), kc.leibBauRuhe(b.bauZu));
                    [rig.armL, rig.armR].forEach((seite, i) => {
                        for (const k in rig.armRuhe[i])
                            for (const e of g.userData._gelenk.ruhe || [])
                                if (e[0] === seite[k]) e[2].setFromEuler(new THREE.Euler(...rig.armRuhe[i][k]));
                    });
                    [b.armeOffen, armeFrei] = [false, false];
                }
                if (istNah !== !!b.nah || g.visible !== istNah) {
                    b.nah = istNah; // der Leib zeigt, was die Wahl sagt — auch wer nach dem Sprung der Uhr (nah: false) noch sichtbar stand
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
                if (!istNah) {
                    if (g.userData.rig && !b.backt) halter.push(b); // er trägt einen Leib, den das Auge nicht sieht
                    continue;
                }
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
            // DER RING GIBT ZURÜCK (w28-leib-im-ring): wer seinen Leib trägt, ohne dass das Auge ihn als Leib sieht, hält ihn bis
            // `ringHystM` jenseits des Nah-Kreises (die Hysterese gegen das Flattern an 8 m) und solange die Siedlung höchstens
            // `ringLeiber` Leiber hält — darüber gibt der Fernste zuerst
            if (halter.length) {
                const aus2 = (BW.nahM + BW.nahHystM + BW.ringHystM) ** 2;
                const fern = (b) => (b.drinnen ? Infinity : b.dA2 || 0); // wer drinnen ist, den sieht keiner
                halter.sort((a, c) => fern(c) - fern(a));
                let n = nah.length + halter.length;
                for (const b of halter) {
                    if (!(fern(b) > aus2 || n > BW.ringLeiber)) break;
                    this._bewohnerLeibAb(b);
                    n--;
                }
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
                if (S.plan.staedtisch) this._verkehrAnlegen(S); // die Wagen der Stadt und ihre Fahrer (Leiter mensch.netz.verkehr)
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
        const u = b.leib.userData;
        if (u.rig) return false; // wer seinen Leib trägt, gibt ihn im Takt zurück (`_tickBewohner`, der Ring) — erst dann ruht er
        if (b.drinnen) return true;
        if (b.d2 < innen * innen) return false;
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
    // DAS BAND GEHT DEN GANG DES KANONS (mensch-zahlen, `tempoBand`): EIN Band je Siedlung trägt EINEN Doppelschritt —
    // den seines Tempos ohne das Können; wer mehr oder weniger kann, tritt ihn im Satz öfter oder seltener (die Phase geht
    // seinen Weg), die Schrittlänge seines Könnens trägt der nahe Leib (`_gaitTick` an seinem Tempo).
    _bewohnerGangSchritt(b, v, dt, echt, S) {
        const g = b.leib;
        const vB = b.tempoBand;
        if (v > 0) this._gaitTakt(b.beinMass.L, b, vB, (dt * v) / vB);
        else this._gaitTakt(b.beinMass.L, b, 0, dt);
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
    // die Uhr der Welt, die letzten `WACHSTUM.aktenMax`) — ihre Furcht bremst sein Wachstum (fachwerk `wachstum`); er weicht.
    _bewohnerZeuge(o) {
        const R2 = AnazhRealm.BEWOHNER.zeugeM ** 2;
        const cells = (this.state.worldMeta || {}).settlementCells || {};
        const stunde = ((((Number.isFinite(this.state.timeOfDay) ? this.state.timeOfDay : 0.5) % 1) + 1) % 1) * 24; // wie der Takt
        for (const S of (this._bewohnerSiedlungen || new Map()).values()) {
            let sah = false;
            let belegt = null;
            for (const b of S.liste || [])
                if (b.leib && !b.drinnen && (b.leib.position.x - o.x) ** 2 + (b.leib.position.z - o.z) ** 2 < R2) {
                    this._creatureRemember(b.leib, "gewalt", { von: "spieler" });
                    sah = true;
                    this._bewohnerWeichen(S, b, o, stunde, (belegt = belegt || new Set(S.liste.map((x) => x.ziel))));
                }
            const c = sah && cells[S.key];
            if (!c || !c.wachs) continue;
            c.akten = (c.akten || []).concat([{ t: this.state.spielZeit, type: "gewalt" }]);
            c.akten.splice(0, c.akten.length - globalThis.__fachwerkCore.WACHSTUM.aktenMax);
        }
    }
    // DER ZEUGE WEICHT (kollektiv#1, w28-zeugen-weichen): wer die Tat am Ort o sah und sie fürchtet (`_kreaturFurchtErinnert` > 0),
    // verlässt ihren Kreis — die Flucht aus zweiter Hand des EINEN Furcht-Gesetzes (tetrapoda `fluchtRadius`, B = die Tat und `zeugeM`).
    // Sein Soll (`_bewohnerSoll`) nennt bis zur Wende seines Tags den nächsten freien Stand jenseits des Kreises (`belegt`), dessen Weg
    // (`_bewohnerStrecke`) ihn nie näher an die Tat führt, als er steht — die Seite urteilt allein der Weg; führt jeder an ihr vorbei,
    // flieht er wie das Tier gerade fort über freies Land an den Kreis (±0,5, ±1 rad). Bis hier filterte die gerade Linie vorab, und
    // feld #617311 am Dorfrand (sein Anschluss 4,2 m neben der Tat) blieb stehen (gate:kreatur-takt begegnung, fort 0). Am Steuer bleibt er.
    _bewohnerWeichen(S, b, o, stunde, belegt) {
        if (b.amSteuer || b.ankunft || !b.ziel || !(this._kreaturFurchtErinnert(b.leib) > 0)) return false;
        b.weichen = null;
        const W = this._bewohnerWeichOrt(S, b, o, stunde, belegt);
        if (!W) return false;
        const { ort, soll } = W;
        const bis = this._bewohnerWende(b, stunde, stunde + 24);
        b.weichen = { ort, plan: soll.ziel, ab: stunde, dauer: bis === null ? 24 : bis - stunde };
        belegt.add(ort);
        this._bewohnerUhrNach(S, b);
        this._bewohnerZiel(b, stunde, true);
        this._bewohnerWecken(S, b);
        return true;
    }

    // DER ORT DES WEICHENS (`_bewohnerWeichen`), ohne ihn zu setzen: wohin der Zeuge b vor der Tat am Ort o wiche — `{ ort, soll }`
    // oder null (sein Soll liegt jenseits des Kreises oder drinnen, kein Ort trägt). Leser: das Weichen selbst und die Kreatur-Linse
    // (begegnung: sie wählt ihren Zeugen nach dem Ort, den ihm das Gesetz gäbe — der vierte Gang geht durch ihn)
    _bewohnerWeichOrt(S, b, o, stunde, belegt) {
        const B = { x: o.x, z: o.z, r: AnazhRealm.BEWOHNER.zeugeM };
        const R = AnazhRealm._furchtGesetz().fluchtRadius(B, null, false);
        const soll = this._bewohnerSoll(b, stunde);
        if (soll.drinnen || Math.hypot(soll.ziel.x - o.x, soll.ziel.z - o.z) >= R) return null;
        const p = { x: b.leib.position.x, z: b.leib.position.z };
        const [T, d2] = [{ minX: o.x, maxX: o.x, minZ: o.z, maxZ: o.z }, (p.x - o.x) ** 2 + (p.z - o.z) ** 2 - 1e-6];
        const fern = (w) => !!w && [p, ...w].every((e, i, v) => !i || this._streckeBoxAbstand2(T, v[i - 1].x, v[i - 1].z, e.x, e.z) >= d2); // prettier-ignore
        const [fort, gesehen] = [[], new Set()];
        for (const x of S.liste)
            for (const q of AnazhRealm.BEWOHNER.staende.map((k) => x.orte[k]))
                if (q && !gesehen.has(q) && !belegt.has(q) && Math.hypot(q.x - o.x, q.z - o.z) >= R) { gesehen.add(q); fort.push([Math.hypot(q.x - p.x, q.z - p.z), q]); } // prettier-ignore
        let [, ort] = fort.sort((a, c) => a[0] - c[0]).find(([, q]) => fern(this._bewohnerStrecke(S, { ...p }, q, 0))) || []; // prettier-ignore
        for (const w of ort ? [] : [0, 0.5, -0.5, 1, -1]) {
            const [c, n, d] = [Math.cos(w), Math.sin(w), Math.sqrt(d2 + 1e-6) || 1], [vx, vz] = [((p.x - o.x) * c - (p.z - o.z) * n) / d, ((p.x - o.x) * n + (p.z - o.z) * c) / d]; // prettier-ignore
            const q = { x: o.x + vx * R, z: o.z + vz * R, blick: Math.atan2(vx, vz) };
            if (!ort && this._landAt(q.x, q.z) && !["haus", "bau"].includes(this._imGrundriss(q.x, q.z, 0.5)) && !this._bewohnerWand(p, q) && fern([q])) ort = q; // prettier-ignore
        }
        return ort ? { ort, soll } : null;
    }

    // DAS SOLL DER STUNDE (mensch.K2): der Plan des Gesetzes (koerper-core `tagesPlan`) aus dem Samen, der Rolle seines
    // Hauses und den Orten seiner Bindung (`_bewohnerListe`) — drinnen ist das Ziel die Tür. Liefert { ziel, drinnen, akt }. Leser: das Ziel
    // (`_bewohnerZiel`), die Wende (`_bewohnerWende`). DER REGEN (mensch.kopplung.leben): das Gesetz liest den Regen, der fällt —
    // den Kanal `rain` des EINEN Wetter-Felds der Welt (`_weatherFieldFor`: das Wort am Spieler samt seinem Übergang, wie Himmel,
    // Tropfen und Nässe ihn lesen); je planH liest jeder seinen Plan neu (`_tickBewohner`), so leert der Regen den Platz.
    // AM STEUER IST SEIN WERK SEIN WAGEN (Leiter mensch.netz.verkehr, w28-fahrer-am-steuer): wen sein Plan am Werk sieht und wer am Steuer
    // sitzt, ist, wo sein Wagen ist — die EINE Lage, die der Verkehr schreibt und an der sein Leib sitzt (`_verkehrSitz`); der
    // Stand neben dem Platz ist nur der Ort, an dem er ein- und aussteigt. Bis hier nannte das Soll den Stand, während der Leib im
    // Wagen fuhr: zwei Orte für einen Menschen (bevoelkerung#1, main 7de938ab, Radeon: der Fahrer an Ort 0 und 1 zu jeder der
    // vier Uhren 5–18 m neben seinem Soll, ungezählt).
    _bewohnerSoll(b, stunde) {
        const KC = window.__koerperCore;
        if (!KC || typeof KC.tagesPlan !== "function") return AnazhRealm._kernPflichtBruch("koerper:tagesPlan");
        const o = b.orte;
        const soll = KC.tagesPlan(b.same, b.rolle, stunde, o, this._weatherFieldFor().rain);
        const ort = b.amSteuer && soll.ort === o.werk ? b.wagen.entry.position : soll.ort;
        const ziel = soll.drinnen ? o.tuer : ort;
        // DER ZEUGE WEICHT (`_bewohnerWeichen`): solange sein Plan das Ziel der Tat nennt, bis zur Wende, der Stand jenseits der Tat
        const W = b.weichen;
        if (W && ziel === W.plan && (((stunde - W.ab) % 24) + 24) % 24 < W.dauer)
            return { ziel: W.ort, drinnen: false, akt: soll.akt };
        return { ziel, drinnen: soll.drinnen, akt: soll.akt };
    }

    // DAS GEMÜT DES BEWOHNERS (w28-mensch-menge — der Leser von `b.akt`): die Haltung seines Akts aus dem Gesetz des Tags (koerper
    // `tagesHaltung`, seine Rolle) und die Furcht, die er erinnert (`_kreaturFurchtErinnert`: Kummer und Aufruhr, wie die Bedrohung
    // sie dem Spieler speist) — die EINE Emotions-Brücke (`_koerperMotionProfile`) wählt daraus das Profil seines Stands. Bis hier
    // ging jeder Leib mit `null`: der Akt des Tags und die Furcht standen in keinem Bild. Ein Objekt je Bewohner, je Ruf gefüllt.
    // DIE STÄNDE DES BEWOHNERS (w28-steh-haltung): die Namen der Profile, in denen ein Bewohner stehen kann — neutral, je
    // Haltung des Tages-Gesetzes (koerper TAGES_GESETZ.haltung) und je Zeile der Emotions-Brücke an einer Achse seines Gemüts
    // (BEWOHNER.gemuet: sorrow, chaos). Der ferne Satz und das Feld backen je Namen EINE Stand-Zeile (`_bewohnerGangPose`),
    // jeder Bewohner wählt seine über denselben Namen wie sein naher Leib (`_koerperMotionName`). Bis hier buk der Satz EINEN
    // Stand ohne Haltung: an der Nah-Grenze sprang die Schulter beim Akt besuch um 8,2°.
    static _bewohnerStaende() {
        if (AnazhRealm._bewohnerStaendeListe) return AnazhRealm._bewohnerStaendeListe;
        const KC = window.__koerperCore;
        if (!KC || !KC.TAGES_GESETZ) return AnazhRealm._kernPflichtBruch("koerper:TAGES_GESETZ");
        const L = [AnazhRealm.MOTION_PROFILE_MAP.koerper.idle];
        const nimm = (nm) => nm && !L.includes(nm) && L.push(nm);
        Object.values(KC.TAGES_GESETZ.haltung).forEach(nimm);
        for (const r of AnazhRealm.MOTION_EMOTION_PROFILES)
            if (r.koerper && AnazhRealm.BEWOHNER.gemuet.includes(r.axis)) nimm(r.koerper.idle);
        return (AnazhRealm._bewohnerStaendeListe = Object.freeze(L));
    }
    // DAS GEMÜT DES STANDS h (das Backen): das Gemüt, das die Brücke auf den Namen des Stands h führt (0: neutral, wie bisher);
    // ein Stand ohne Profil im Buch bricht laut — nie eine neutrale Zeile unter fremdem Namen
    _bewohnerStandGemuet(h) {
        if (!(h > 0)) return null;
        const e = { haltung: AnazhRealm._bewohnerStaende()[h] };
        if (!this._koerperMotionProfile(false, e) || this._koerperMotionName(false, e) !== e.haltung)
            this._bruchMelden(
                `BEWOHNER: der Stand „${e.haltung}“ trägt kein Profil der Bewegung (das Buch des Körpers)`
            );
        return e;
    }
    // DER STAND DES BEWOHNERS: die Zeile seines Stands — der Name, den sein naher Leib steht (`_bewohnerGemuet` über die EINE
    // Wahl `_koerperMotionName`), in der Liste der Stände; ein Name ohne Zeile bricht laut
    _bewohnerStandVon(b) {
        const nm = this._koerperMotionName(false, this._bewohnerGemuet(b));
        const h = AnazhRealm._bewohnerStaende().indexOf(nm);
        if (h < 0) this._bruchMelden(`BEWOHNER: der Stand „${nm}“ trägt keine Zeile im Satz`);
        return Math.max(0, h);
    }
    // SEIN STAND WECHSELT (der Akt des Tags, die Furcht): gemerkt (`b.standZeile` — die Leser: `_bewohnerSatzSchreiben`, im Feld
    // `_bewohnerFeldLage`, dort sofort neu gestellt); liefert, ob der Satz ihn neu schreiben muss
    _bewohnerStandNeu(b, S) {
        const h = this._bewohnerStandVon(b);
        if (h === (b.standZeile || 0)) return false;
        b.standZeile = h;
        const g = b.leib;
        const echt = !(this.state.renderer && this.state.renderer._isHeadlessNull);
        if (g && echt && !b.nah && !b.drinnen && this._kzBesitztFeld(g)) this._bewohnerFeldLage(b, S);
        return true;
    }
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
        if (tuer && b.weichen && ziel !== b.weichen.ort) b.weichen = null; // sein Tag holt ihn zurück: das Weichen endet
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
        b.weg = b.wegRestAb = b.wi = null;
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
        Object.assign(b, { weg: null, wegRestAb: null, wi: null, wegRest: 0, stand: null, drehen: null, gehDt: 0 });
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
        if (echt && !b.drinnen) this._kzLeib(g, this._lodAuge() || p, true); // (sein Feld: `_bewohnerFeldLage` darin)
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

    // DIE SEKUNDEN EINER SPIELSTUNDE: der Tag des Kalenders (`_kalender`, zeit-ein-kalender) durch seine Stunden — der Gang der
    // Uhr (`tickDayNight`) rückt sie um delta / tagS Tage je Takt.
    _bewohnerStundeSek() {
        return this._kalender().tagS / AnazhRealm.WELT_GESETZ_ERDE.kalender.tagStunden;
    }

    // DER WEG (mensch.K2, „nie durch Hauswände"): vom Stand des Leibs zum Ziel — die Tür liegt in der Wand: wer aus ihr tritt
    // oder in sie geht, geht über den Punkt vor ihr (`orte.vor`, `BEWOHNER.vorM`); dazwischen die Strecke (`_bewohnerStrecke`).
    // DER HOF (`orte.ein`): beim Hof-Haus geht er von dort auf der Achse vor das Tor, wo die Strecke beginnt und endet; wer im
    // Hof steht (auf der Achse ± 1,5 m), geht von dort. Jeder geht in seiner Spur (`spurM` quer zum Weg, aus dem Samen).
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
        const [lx, lz, px, pz] = o.ein ? [o.ein.x - o.tuer.x, o.ein.z - o.tuer.z, von.x - o.tuer.x, von.z - o.tuer.z] : [0, 0, 0, 0]; // prettier-ignore
        const L2 = lx * lx + lz * lz, t = L2 > 0 && von !== o.tuer ? (px * lx + pz * lz) / L2 : -1, hof = t > -0.05 && t < 1 && (px * lz - pz * lx) ** 2 < 2.25 * L2; // prettier-ignore
        const vorweg = von === o.tuer ? (o.ein ? [o.vor, o.ein] : [o.vor]) : hof && ziel !== o.tuer ? [o.ein] : [], nachweg = ziel === o.tuer ? (o.ein && !hof ? [o.ein, o.vor] : [o.vor]) : [], a = vorweg.length ? vorweg[vorweg.length - 1] : von, e = nachweg.length ? nachweg[0] : ziel; // prettier-ignore
        const spur = (((b.same >>> 8) & 255) / 255 - 0.5) * 2 * AnazhRealm.BEWOHNER.spurM;
        const strecke = a === e ? [] : this._bewohnerStrecke(S, a, e, spur);
        // kein Weg (laut, `_bewohnerStrecke`): er bleibt, wo er steht — nie geradeaus durch die Wand
        if (!strecke) {
            b.da = true;
            b.wegRest = 0;
            return;
        }
        const pts = vorweg.concat(strecke);
        if (von === b.stand && Math.hypot(g.position.x - von.x, g.position.z - von.z) > 1e-3) pts.unshift(von); // vom Stand
        if (e !== ziel) pts.push(...nachweg.slice(1), ziel);
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
        const kette = a >= 0 && e >= 0 ? globalThis.__tetrapodaCore.wegKette(this._bewohnerBaum(N, a), a, e) : null;
        if (!kette) {
            this._bruchMelden(
                `BEWOHNER: kein Weg im Dorf-Plan „${S.plan.name || "?"}" von ${von.x.toFixed(1)}/${von.z.toFixed(1)} zu ${ziel.x.toFixed(1)}/${ziel.z.toFixed(1)}`
            );
            return null;
        }
        // DER GEHWEG (Leiter mensch.netz.verkehr): auf der Trasse des Verkehrs (ein Weg ab fachwerk VERKEHR_GESETZ.breiteM) geht er an
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
        // DIE SEITE DES GEHWEGS (Leiter mensch.netz.verkehr): wo Wagen fahren, geht er die Seite, die ihn weniger über die Fahrbahn führt
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
        // Der gehaltene Grund ist eine SCHRÄGE (Höhe an seinem Punkt + Gefälle entlang des Gangs, aus dem Halt davor — kein
        // zweiter Leser), nie eine Zahl: bis w28-stand-hoehe trug der Schritt die Höhe des letzten halben Meters — am Hang
        // (0,5 m/m) stand der vom Ausweichen Zurückgekehrte 12 cm im Boden und blieb dort. Wer steht (kein Weg in diesem
        // Schritt, oder sein Weg endet), liest genau an seinem Punkt. Der Halt hängt am Abstand zum Auge (`grundHaltJeM`,
        // höchstens ein halber Meter): ein Knick des Geländes kostet den Gehenden nah Zentimeter, nie den Hang des halben Meters.
        const halt = Math.min(0.5, AnazhRealm.BEWOHNER.grundHaltJeM * Math.sqrt(b.d2 || 0) || 0.5);
        const steht = b.wi >= pts.length || (x === g.position.x && z === g.position.z);
        const fern = !(b.grundH !== undefined && (x - b.grundX) ** 2 + (z - b.grundZ) ** 2 < halt * halt);
        if (box || fern || (steht && (x !== b.grundX || z !== b.grundZ))) {
            const h0 = this._koerperBodenUnter(x, sohle, z);
            const h = Number.isFinite(h0) ? h0 : sohle;
            const [dx, dz] = b.grundH === undefined ? [0, 0] : [x - b.grundX, z - b.grundZ];
            const k = box || steht || !(dx || dz) || dx * dx + dz * dz > 0.3 ? 0 : (h - b.grundH) / (dx * dx + dz * dz);
            [b.grundX, b.grundZ, b.grundH, b.grundGx, b.grundGz] = [x, z, h, k * dx, k * dz];
        }
        const grund = b.grundH + b.grundGx * (x - b.grundX) + b.grundGz * (z - b.grundZ);
        g.position.set(x, this._bewohnerTritt(x, z, sohle, grund, kand) + fuss, z); // die Boxen seiner Reichweite trägt kand
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
            b.weg = b.wegRestAb = b.wi = null;
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
    // Bein (sein Fußpunkt), sonst an seinen Anfang, sonst zum nächsten Punkt. Liefert den Punkt, auf den er geht (auf dem Bein: den nächsten).
    _bewohnerLinie(b, x, z) {
        const [a, q] = [b.linie, b.weg[b.wi]];
        if (q._um) return q;
        const [lx, lz] = a ? [q.x - a.x, q.z - a.z] : [0, 0];
        const L = Math.hypot(lx, lz);
        const quer = L > 1e-3 ? Math.abs((x - a.x) * lz - (z - a.z) * lx) / L : 0; // ≤ 5 cm daneben zum Punkt nur, wo die Schräge frei ist (los-huelle: #921207 an Mast #237674)
        if (!(L > 1e-3) || quer < 1e-4 || (quer < 0.05 && !this._bewohnerWand({ x, z }, q))) return q;
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
        // DER VORRANG DER FAHRBAHN (Leiter mensch.netz.verkehr, das EINE Gesetz der Straße): wer neben der Bahn eines Wagens steht und mit dem
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
            // (sein Wunsch zum nächsten Punkt seines Plans: tetrapoda `zielWunsch`, die Ziel-Kette — kein Halt voraus)
            const w = e && TC.zielWunsch(e.x - x0, e.z - z0, Infinity, b.tempo);
            const [vx, vz] = lenk ? [lenk.vx, lenk.vz] : w ? [w.x, w.z] : [0, 0];
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
    // das Bein von dort zu dem Punkt, auf den er geht, `_bewohnerLinie`; keines frei: er steht). Liefert { vx, vz, weg } oder null.
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
        // das beste Tempo, dessen Schritt und dessen Bein von dort keine Wand schneiden — das Bein zu dem Punkt, auf den er von
        // dort geht (`_bewohnerLinie`: die Linie seines Tags; der nächste Punkt des Wegs, wo er auf ihr steht oder sie von dort
        // keinen freien Punkt trägt). DAS BEIN ZUR LINIE (w28-stadt-grammatik): bis hier fragte die Wahl stets das Bein zum
        // nächsten Punkt, auch neben der Linie (nach dem Umweg um einen Stehenden) — er ging auf die Linie, die Frage galt der
        // Sehne; stand ein Mast auf ihr, fiel jede Richtung, und er stand für immer (Kreatur-Linse bewohner, das Start-Dorf:
        // zunfthaus #508675 um 7,51 Uhr 1,3 m vor der Laterne am Platz, 18 m vor seinem Ziel — der Schritt in jede der zwölf
        // Richtungen ließ die Sehne im Mast, der Weg zur Linie war frei).
        wahl.sort((x, y) => x.st - y.st);
        for (const c of wahl.slice(0, BW.ausweichWahl)) {
            const nach = { x: p.x + c.vx * dt, z: p.z + c.vz * dt };
            if (this._bewohnerWand(p, nach)) continue;
            if (this._bewohnerLinie(b, nach.x, nach.z) === q && this._bewohnerWand(nach, q)) continue;
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
                b.weg = b.wegRestAb = b.wi = null;
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
    // DER STAND HÄNGT NAHE SEINER TÜR AM NETZ (pendler-anschluss) — das EINE Gesetz der Geburt (`_bewohnerListe` frei) und des
    // gerückten Stands (`_bewohnerStandPruefen`): wer an einer Tür steht (o.tuerAm: ihr Knoten {i, k, d}, o.tuerVor: der Punkt vor
    // ihr), erreicht sie vom Punkt q über seinen Knoten i des Grunds (`S.netzGrund`) höchstens auf `standUmweg` × der Luftlinie
    // plus einer Naht. `laengen`: die Längen je Knoten einer Tür (tetrapoda `wegLaengen`), gemerkt beim Leser. Bis hier hielt nur
    // die Geburt das Gesetz: der gerückte Stand fragte allein den Anschluss — an der Stadt dorf 7 30 rückten zwei Stände an
    // haus#134516 16,7 m Luft, 182 m über das Netz (gate:kreatur-takt zielplan „Stand jenseits der Wand", die Liste nach dem Tag)
    _bewohnerAnTuer(S, o, q, i, laengen) {
        const a = o.tuerAm;
        if (!a) return true; // die Tür hängt an keinem Knoten (laut, `_bewohnerListe`): es urteilt die Gerade allein
        const G = S.netzGrund;
        const K = G && G.knoten[i];
        if (!K) return false;
        let L = laengen.get(a.i);
        if (!L) laengen.set(a.i, (L = globalThis.__tetrapodaCore.wegLaengen(G.knoten.length, G.kanten, a.i)));
        const [BW, T] = [AnazhRealm.BEWOHNER, o.tuerVor];
        return a.d + L[i] + Math.hypot(q.x - K.x, q.z - K.z) <= BW.standUmweg * Math.hypot(T.x - q.x, T.z - q.z) + BW.naehtM; // prettier-ignore
    }

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
        gesetz = null,
        amTuer = null
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
                // (`amTuer` (q, k): der Stand an einer Tür hängt nahe ihr am Netz, `_bewohnerAnTuer`)
                const k = this._bewohnerAnschluss(N, q);
                if (k >= 0 && (!amTuer || amTuer(q, k))) gefunden = q;
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
        for (const b of S.liste) for (const k of AnazhRealm.BEWOHNER.staende) if (b.orte[k]) staende.add(b.orte[k]);
        S.listeRest = staende.size; // der Rest des Werks (`_weltOffen` leute): je Stand einer
        // ob ein Stand gerückt steht (sein Ort ist nicht sein Ursprung)
        const weg = (o) => o.ur && (o.x !== o.ur.x || o.z !== o.ur.z);
        // die Stände, deren Gesetz neben der Spur keinen Ort trägt (der Fehler des Plans, laut; die Kreatur-Linse liest ihn)
        const ohneOrt = S.standOhneOrt || (S.standOhneOrt = new Set());
        // WER AM RAUM DER ANDEREN HÄNGT (mensch.K2): jeder, dessen Suche lief (`_standR` > 0) — der gerückte, der ohne Ort und der,
        // dessen Suche scheiterte und der darum an seinem Ursprung blieb (diesseits der Fahrbahn kein Ort, `dort`): er urteilt neu wie
        // der gerückte, sobald der Raum in seiner Scheibe frei wird. Bis hier urteilte nur der gerückte neu: an der Stadt (stadt-voll,
        // das Werk-Viertel bei 827/446) fand der Stand 819,7/445,1 im ersten Gang diesseits seiner Tür keinen Ort, im zweiten gingen
        // 43 Stände um ihn (`_bewohnerOhneStand`), und er rückte erst, als eine Hülle zufällig auf ihn traf — im Lauf nach dem
        // Zwilling, nie in ihm (VK-V: die Stunde 10 Uhr trennt sich in Bild 0, vier Werk-Stände 1–8 m anders)
        const haengt = (o) => weg(o) || ohneOrt.has(o) || o._standR > 0;
        // DER RAUM ZU ALLEN STÄNDEN (der Ursprung jedes anderen und der Ort jedes gerückten) als RASTER in Zellen von `raumM`
        // (Lehre 25): die Probe eines Punkts fragt die 3 × 3 Zellen um ihn, nie jeden Stand; gebaut mit dem ersten geprüften
        // Stand, nachgeführt mit jedem, der rückt (je Eintrag x, z, Eigner). Bis hier baute jeder geprüfte Stand die Liste aller
        // anderen neu und jeder Punkt seines Auswegs ging sie ganz durch: an der Stadt (`dorf 7 120`, 1 300 Stände) trug ein
        // Ausweg bis 15 m 293 ms, die Hälfte der Zeit des Gangs (Radeon, headless)
        const RM = BW.raumM;
        const zelle = (kx, kz) => kx * 4194304 + kz;
        let gitter = null;
        // DER VORRANG DER REIHE (mensch.K2): jeder Ursprung sperrt jeden, der gerückte Ort nur Spätere der Reihe — der Ort ist Funktion der
        // Früheren, nie der Folge der Gänge (bis hier stellte dieselbe Saat kaufhaus #1295281832 je nach Vorgeschichte anders, VK-V)
        const rang = new Map([...staende].map((p, i) => [p, i]));
        const laengen = new Map(); // die Längen je Tür-Knoten (`_bewohnerAnTuer`), für diesen Gang

        const legen = (x, z, p, urs) => {
            const k = zelle(Math.floor(x / RM), Math.floor(z / RM));
            const L = gitter.get(k);
            if (L) L.push(x, z, p, urs);
            else gitter.set(k, [x, z, p, urs]);
        };
        const heben = (x, z, p) => {
            const L = gitter.get(zelle(Math.floor(x / RM), Math.floor(z / RM)));
            for (let i = 0; L && i < L.length; i += 4)
                if (L[i + 2] === p && !L[i + 3] && L[i] === x && L[i + 1] === z) return void L.splice(i, 4);
        };
        const raumVon = (o) => (q) => {
            const kx = Math.floor(q.x / RM);
            const kz = Math.floor(q.z / RM);
            for (let a = kx - 1; a <= kx + 1; a++)
                for (let c = kz - 1; c <= kz + 1; c++) {
                    const L = gitter.get(zelle(a, c));
                    if (L)
                        for (let i = 0; i < L.length; i += 4)
                            if (L[i + 2] !== o && (L[i + 3] || rang.get(L[i + 2]) < rang.get(o)) && (L[i] - q.x) ** 2 + (L[i + 1] - q.z) ** 2 < RM * RM) return true; // prettier-ignore
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
                if (!haengt(p) || p._standSchmutz === true) continue;
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
            const urK = o.tuerK >= 0 ? N.knoten[o.tuerK] : null; // der Knoten seiner Geburt (`_bewohnerListe`, `tuerK`)
            if (trifft && !trifft(o, o) && !trifft(ur, ur) && !(urK && trifft(ur, urK)) && !(haengt(o) && o._standSchmutz !== false)) continue; // prettier-ignore
            if (!gitter) {
                gitter = new Map();
                for (const p of staende) {
                    const u = p.ur || p;
                    legen(u.x, u.z, p, true);
                    if (weg(p)) legen(p.x, p.z, p, false);
                }
                // DER PUNKT VOR JEDER TÜR UND DER EINGANG BLEIBEN FREI, auch dem gerückten (`_bewohnerListe`: über sie geht jeder hinein
                // und hinaus) — sie liegen im Raster wie ein Stand ohne Eigner. Bis w28-stadt-grammatik hielt der Raum nur die Stände: an der
                // Stadt rückten fünf näher als `raumM` an den Punkt vor einer Tür, der Stand 721,8/408,6 eines Gasts 0,5 m neben den vor
                // wohnhaus #91693 — wer um 22 Uhr heimkam, blieb 1,4 m vor seiner Tür (3 Steckenbleiber, gate:kreatur-takt bewohner).
                for (const v of new Set(S.liste.flatMap((b) => [b.orte.vor, b.orte.ein])))
                    if (v) legen(v.x, v.z, v, true);
            }
            const raum = raumVon(o);
            // das Gesetz seiner Art gilt auch dem gerückten (`gilt`, `_bewohnerListe`: der Stand am Platz bleibt am Platz);
            // `R` misst die Scheibe, die seine Suche ging
            let R = 0;
            const realm = this;
            const amTuer = o.tuerAm ? (q, k) => realm._bewohnerAnTuer(S, o, q, k, laengen) : null;
            const neu = function* (rand, frei, weit = BW.auswegM, gesetz = o.gilt) {
                const p = yield* realm._bewohnerAuswegGang(
                    N,
                    { x: ur.x, z: ur.z },
                    true,
                    raum,
                    rand,
                    frei,
                    weit,
                    gesetz,
                    amTuer
                );
                R = Math.max(R, p ? Math.hypot(p.x - ur.x, p.z - ur.z) : weit);
                return p;
            };
            const gemerkt = (q) =>
                Object.assign(o, { _standR: R, _standK: q ? q._knoten : undefined, _standSchmutz: false });
            // DER STAND WEICHT DER SPUR (Leiter mensch.netz.verkehr): wer stundenlang steht, steht nie in der Spur eines Wagens
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
            // DER URSPRUNG HÄLT DAS GESETZ DER TÜR (`_bewohnerAnTuer`) WIE DER GERÜCKTE: tritt eine Hülle auf den Strich zu seinem Knoten
            // (der Wald-Takt, die Stufen der Häuser), hängt er über den nächsten frei erreichten nahe seiner Tür am Netz — sonst steht
            // er dort wie in einer Wand und rückt nach demselben Gesetz. Bis hier fragte die Wache am Ursprung nur seinen Punkt: an
            // der Stadt dorf 7 30 standen nach den Proben davor zwei Stände an haus#134516 16,7 m Luft, 182 m über das Netz
            // (gate:kreatur-takt zielplan, die Liste nach dem Tag; die Probe allein grün)
            const tuerFern = !!urK && !!this._bewohnerWand(ur, urK) && !amTuer(ur, this._bewohnerAnschluss(N, { x: ur.x, z: ur.z })); // prettier-ignore
            const wand = tuerFern || this._bewohnerWand(ur, ur, true, BW.standRandM);
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
                // das Raster folgt ihm (der alte Ort fällt, wenn er gerückt war; der neue steht, wenn er nicht der Ursprung ist),
                // und jeder spätere gerückte urteilt in der Folge neu, in dessen Scheibe der alte liegt oder dessen Ort der neue sperrt
                const alt = weg(o) ? [o.x, o.z] : null;
                if (alt) heben(alt[0], alt[1], o);
                const hin = q.x !== ur.x || q.z !== ur.z;
                if (hin) legen(q.x, q.z, o, false);
                for (const p of staende)
                    if (rang.get(p) > rang.get(o) && haengt(p) && p._standSchmutz === false)
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
                        Object.assign(b, { weg: null, wegRestAb: null, wi: null, stand: null, wegRest: null });
                        if (b.ziel === o) b.da = false;
                    }
            }
            yield;
        }
        S.listeRest = 0;
    }

    // DER VOLLE ORT (`_bewohnerStandPruefen`): wessen Stand an einem Ort seiner Bindung — am Platz, am Werk, am Tisch, am Abend,
    // beim Besuch — der Plan neben der Spur nicht trägt, geht seinen Tag ohne ihn: koerper-core `tagesPlan` liest je Ort
    // `|| heim` (er bleibt zu dessen Stunden vor seiner Tür); wer dort stand oder hinging, geht neu. Die Kreatur-Linse nennt
    // den Platz „ohne Platz". Nur der Stand vor der eigenen Tür (`heim`) bleibt, und einer, der niemandes ist (false). Bis
    // w28-ziel-plan fiel nur der Platz: ein Werk-Stand in der Wende eines Wagens blieb stehen, der Wagen 8 der Metropole
    // berührte um 10 Uhr zwei Stehende 156-mal und erreichte kein Ziel (gate:fahr-leben --verkehr).
    // Bis hier rückte der Stand ohne sein Gesetz und ohne den Raum (w4-genesis-ort-wirt9): an der Metropole (stadt-voll) trägt
    // der Platz neben der Trasse 87 seiner Stände nicht (je ~810 Punkte mit Raum, alle im Grundriss eines Hauses)
    _bewohnerOhneStand(S, o) {
        const K = AnazhRealm.BEWOHNER.staende;
        if (S.liste.some((b) => b.orte.heim === o) || !S.liste.some((b) => K.some((k) => b.orte[k] === o)))
            return false;
        for (const b of S.liste) {
            for (const k of K) if (b.orte[k] === o) b.orte[k] = null;
            if (b.leib && !b.drinnen && (b.ziel === o || b.stand === o)) {
                if (b.ziel === o) b.da = false;
                Object.assign(b, { weg: null, wegRestAb: null, wi: null, stand: null, wegRest: null });
            }
        }
        return true;
    }

    // DER BAUM der kürzesten Wege ab einem Knoten — der Plan der Ziel-Kette (tetrapoda `wegBaum`: der Kern rechnet, der Wirt
    // reicht die Wand je Kante, `_bewohnerKante`), je Start-Knoten einmal gerechnet, gemerkt. Bis w28-ziel-plan rechnete der
    // Stamm den Dijkstra selbst.
    _bewohnerBaum(N, a) {
        let vor = N.baeume.get(a);
        if (!vor) {
            vor = globalThis.__tetrapodaCore.wegBaum(N.knoten.length, N.kanten, a, (i, j) =>
                this._bewohnerKante(N, i, j)
            );
            N.baeume.set(a, vor);
        }
        return vor;
    }

    // DIE BEWOHNER GEHEN (die Siedlung fern, die Welt wechselt): jeder Leib verlässt Feld und Szene über die EINEN Abschiede
    // (`_kreaturZiegelTod`, `_disposeSoulGroup`), die Vorlagen der Gestalten verlieren `fest` — das Memo räumt sie, sobald kein
    // Leib sie hält. Die Liste fällt mit: kehrt der Spieler zurück, entsteht sie neu aus dem Plan (dieselbe Funktion).
    _bewohnerFort(S) {
        this._verkehrFort(S); // die Wagen gehen mit (ihre Fahrer sind Leiber der Liste)
        this._bestandFort(S); // die Kisten der Stände gehen mit
        S.leibOffen = 0; // (die Nah-Wahl geht mit: kein Leib, auf den die Welt wartet)
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
        // DIE FERNE SIEDLUNG IST IHR PLAN (heap-register, „der Speicher folgt dem Blick“): ihr Eintrag behält GENAU das Gedächtnis
        // der Siedlung (`BEWOHNER_ERINNERUNG`: Schlüssel, Plan, Ursprung und der Grund ihres Netzes, den die Wege zu den Nachbarn
        // auch fern lesen) — jedes andere Feld ist eine Funktion der Liste, und der Takt legt es neu, sobald sie wiederkehrt
        // (`_tickBewohner`: Liste, Gestalten, Wache, Uhr und Takt der Köpfe; die Netze, Stände und Samen lazy). Bis hier nullte der
        // Abschied seine Felder einzeln, und jedes neue entkam ihm: siedlung-heap nahm fünf Takt-Felder, `backt` (die Köpfe, an
        // denen gebacken wird) hielt weiter jede ferne Siedlung samt Leib (Radeon, Wegenetz-Fahrt: `_bewohnerSiedlungen.backt[]`
        // 28,9 MB nach GC). Die Klasse fällt am Register, nie Feld für Feld.
        for (const k of Object.keys(S)) if (!AnazhRealm.BEWOHNER_ERINNERUNG.includes(k)) delete S[k];
        [S.liste, S.gestalten] = [null, null];
        // … und die Arbeits-Puffer des Takts (das Register `BEWOHNER_TAKT_PUFFER`, die Wahl in `_bewohnerNbZahl`): vor jedem
        // Lesen neu geschrieben, ihr Rest hielt die Köpfe der zuletzt getakteten Siedlung
        for (const k of AnazhRealm.BEWOHNER_TAKT_PUFFER) if (this[k]) this[k].length = 0;
        if (this._bewohnerNbZahl) this._bewohnerNbZahl.geachtet.length = this._bewohnerNbZahl.naechste.length = 0;
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
// zum Rand mit (1 − ρ²)^`profil` (die Sehne einer weichen Kugel, 0 am Rand), das Rausch-Gesetz zerfasert sie im Raum der Welt
// (`rausch`: Wellen je Größe des Satzes `size` in Metern, Hub [jung, ausgedünnt], Anteil des Steigens der Quelle, mit dem das Muster
// zieht), der Saum gegen die Szene ist `saum` × Radius, gegen das Auge `nah` × Radius, die Normale neigt sich um `woelbung` × ρ
// gegen (1 − ρ²) (bei halbem Radius 45°), der Ballen ist längs seines Zugs gestreckt um den Weg von `zug`[0] Sekunden je Radius,
// höchstens `zug`[1], und um (1 + Streckung)^`schmal` schmaler, die Albedo steigt mit dem Alter von `dunkel` auf 1 (jung dicht und rußig), die Deckung im Kern höchstens
// `deckMax` (τ endlich).
AnazhRealm.RAUCH_BILD = Object.freeze({
    labHz: 60,
    kamine: 8,
    kamineM: 160,
    profil: 2,
    rausch: Object.freeze([1.2, Object.freeze([1.8, 2.4]), 1]),
    saum: 0.5,
    nah: 3,
    woelbung: 1.5,
    zug: Object.freeze([0.6, 2]),
    schmal: 0.25,
    dunkel: 0.8,
    deckMax: 0.995,
});

// Worldgen-Auto-Dorf-Daten (Konsument `_tickAutoSettlement`, Wände + Γ5-Disziplin dort):
// nearM Materialisierungs-Distanz · spawnClearM dorffreier Radius um den Genesis-Ort (nearM < spawnClearM →
// am Spawn wirkt nur das START-DORF) · siteProbeR zwei Probe-Ringe (×cellM), falls der Anker scheitert ·
// startRadiusM Start-Dorf-Radien (einmalig je Welt, Seed ":startdorf"). Das Tempo des Zugs trägt die EINE Frist der
// Bau-Arbeit (`TAKT_BAUER.dorf`, `_dorfZugSchritt`), nie eine eigene Kappe.
// DAS WIRT-STREAMING der Auto-Dörfer (nur Host-Größen: wann und wie schnell die Welt baut). Das SIEDLUNGS-GESETZ
// (Raster cellM · Seltenheit rarity · Größe nHMin/nHSpan) lebt EINMAL in
// fachwerk-core (SIEDLUNG) — der Zwilling hier fiel (Welle L, Karte Dorf/Stadt DEFEKT 4: stiller Fallback mit Kopien).
// DIE BEWOHNER (Meisterkarte mensch.K1, `_tickBewohner`): staende = die Orte eines Bewohners, an denen er draußen steht
// (`orte`: je Name ein Stand oder keiner; Leser: die Prüfung der Stände, der Platz ohne Stand, der Wagen) · gestalten = die Gestalten je Siedlung (Vorlagen im Ofen, je
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
// der Tür steht keiner, wenn er aus ihr tritt · aufholen = so viel schneller (je Tempo) eilt, wer hinter seinem Tag ist (`_bewohnerGehen`) · gasseFreiM = so fern
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
// er den Schlag des Spielers und erinnert ihn (`_bewohnerZeuge`). DIE HÜLLEN (eine-huelle): huellenJeTakt = so viele Häuser
// ohne Hülle fragt die wartende Liste je Takt nach ihrer Lieferung (`_bewohnerHuellenDa`, reihum).
// DAS GEDÄCHTNIS EINER FERNEN SIEDLUNG (heap-register, `_bewohnerFort`): die Felder ihres Eintrags, die der Abschied stehen lässt —
// was `_bewohnerMelden` setzt, und der Grund ihres Netzes (`netzGrund`, eine Funktion des Plans, den die Wege zu den Nachbarn auch
// fern lesen: `_wegenetzLegen`, `_wegenetzRoute`). Alles übrige ist eine Funktion der Liste und geht mit ihr.
AnazhRealm.BEWOHNER_ERINNERUNG = Object.freeze(["key", "plan", "ox", "oz", "liste", "gestalten", "netzGrund"]);
// DIE ARBEITS-PUFFER DES TAKTS (heap-blick-folgt, „der Speicher folgt dem Blick“): jede Liste, die der Bewohner-Takt am Reich lazy
// anlegt und vor jedem Lesen neu schreibt — der Abschied (`_bewohnerFort`) leert GENAU dieses Register. Bis hier leerte er drei beim
// Namen; `_bewohnerNah` (die Nah-Wahl), `_bewohnerHalter` (die Halter der Arme) und `_bewohnerWandKand` (die Kästen am Schritt)
// entkamen ihm: Radeon, Wiese nach der Stadt, `_bewohnerNah[]` 22,3 MB nach GC (die Köpfe samt Leib der zuletzt getakteten
// Siedlung). Die Linse (H10, diag-profiband) legt jede lazy Liste `this._bewohner… || (… = [])` des Stamms an und nennt die, die hält.
AnazhRealm.BEWOHNER_TAKT_PUFFER = Object.freeze([
    "_bewohnerKoepfe",
    "_bewohnerBewegt",
    "_bewohnerNachbarn",
    "_bewohnerNah",
    "_bewohnerHalter",
    "_bewohnerWandKand",
]);
AnazhRealm.BEWOHNER = Object.freeze({
    gestalten: 8,
    huellenJeTakt: 8,
    staende: Object.freeze(["heim", "platz", "werk", "mahl", "abend", "besuch"]),
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
    ringHystM: 3,
    ringLeiber: 6,
    gangPhasen: 16,
    // die Achsen seines Gemüts (`_bewohnerGemuet`): die Furcht, die er erinnert — die Stände des Satzes lesen sie (`_bewohnerStaende`)
    gemuet: Object.freeze(["sorrow", "chaos"]),
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
    gasseFreiM: 1.6,
    gasseZelleM: 8,
    anschlussN: 48,
    // der Stand vor einer Tür erreicht sie über das Netz höchstens auf standUmweg × der Luftlinie + naehtM (`_bewohnerListe` frei)
    standUmweg: 2,
    auswegM: 3,
    // DER RING EINES STANDS VOR EINER TÜR (`_bewohnerListe` ringStand): Versuch v liegt vor0M + ⌊v / jeStufe⌋ · stufeM (+ bis streuM
    // aus dem Samen) vor der Tür und bis quer0M + ⌊v / jeStufe⌋ m quer zu ihr; amRand Versuche am Rand der Gasse, dann alle.
    // Bis w28-stadt-grammatik standen die Zahlen im Rumpf der Schleife, und die Linse des Ziel-Plans las einen eigenen Ring
    // (20 m, der Wirt reicht bis 30,8 m).
    ring: Object.freeze({ vor0M: 1.2, stufeM: 1.5, streuM: 2, quer0M: 2, jeStufe: 8, amRand: 64, alle: 128 }),
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
    grundHaltJeM: 0.01, // der Halt des gehaltenen Grunds je Meter Abstand zum Auge (5 m: 5 cm, ab 50 m der halbe Meter)
    begegnungM: 3,
    kopfMaxRad: 1.2,
    rumpfMaxRad: 0.45,
    kopfRadS: 4.5,
    spielerRaumM: 0.5,
    zeugeM: 25,
});

// DAS BILD DES BESTANDS (`_bestandBild`, `_bestandTausch`, `_verkehrLadung`): tauschM = so nah steht der Spieler am Stand (dem
// Punkt hinter der Theke), damit die Taste des Verbs tauscht · kisteM = der Abstand der Kisten (der Bauplan `kiste`, 0,6 m) ·
// seiteM = so weit seitlich des Händlers steht die erste Kiste (der Tritt des Stands reicht 1,45 m, fachwerk AUSSTATTUNG
// marktstand) · nahM = so nah am Auge zeichnet ein Stand seine Kisten · taktS = so oft (Bild-Uhr) prüft der Takt sie
AnazhRealm.BESTAND_BILD = Object.freeze({ tauschM: 3, kisteM: 0.62, seiteM: 1.9, nahM: 60, taktS: 1 });
