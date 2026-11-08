class AnazhRealm_vegetation_wiese {
    // ===== ATLAS · Vegetation/wiese — Nah-Wiese · Nah-Streu · Affinität · Boden-Material =====
    // Nah-Wiese und Nah-Streu bauen im Rechteck neu — nur, wenn es den weiteren ihrer Ringe um die EINE Mitte (die Kamera)
    // berührt; jenseits steht keine Kachel, die Zelle kostet nichts (ein Brand von 2 000 Zellen fern der Kamera).
    _nahRingNeuIn(x0, z0, x1, z1) {
        const mitte = this.state.camera
            ? this.state.camera.position
            : this.state.playerMesh && this.state.playerMesh.position;
        if (!mitte) return 0;
        const d = Math.hypot(Math.max(x0 - mitte.x, 0, mitte.x - x1), Math.max(z0 - mitte.z, 0, mitte.z - z1));
        if (d > AnazhRealm._nahRingReich()) return 0;
        return this._nahWieseNeuIn(x0, z0, x1, z1);
    }
    // DIE REICHWEITE DER RINGE um die EINE Mitte: so weit stehen Kacheln der Wiese (ihre Ferne, `NAH_WIESE.fern`) oder der
    // Nah-Streu (ihr Rand-Band) — der weitere zählt (EINE Rechnung für den Neubau im Rechteck und das Licht der Kronen)
    static _nahRingReich() {
        const W = AnazhRealm.NAH_WIESE,
            S = AnazhRealm.NAH_STREU;
        return Math.max(W.fern.bis + W.fern.kachel * 1.5, S.radius + S.rand + S.kachel * 1.5);
    }

    // DAS BODENLICHT unter den STEHENDEN Kronen ∈ [0, 1] (1 offen, → 0 geschlossenes Dach) — das Labor-Gesetz
    // (phytogenesis `canopyLight`): je Krone des EINEN Registers (`wegeKarte.kronen`: Mitte, Radius r wie die Kronen-
    // Schüchternheit) die Deckung exp(−q), q = d² / (σ·r)² bis q < qMax, L = exp(−canopyK · Σ Deckung). Gibt den Leser
    // (x, z) → L eines Rechtecks: die Kronen, die es erreichen, sammelt er EINMAL (Lehre 25). Nah-Wiese und Nah-Streu lesen
    // ihn je Kachel; ihre Kacheln wachsen neu, wo eine Krone kommt oder fällt (`_kronenStreuWiese`, bis zur Reichweite des
    // Lichts). Bis K70 lasen beide das Kronenlicht-Feld der Platzierung (`_canopyLightAt`, wo Bäume wachsen DÜRFEN) und die
    // Wiese zusätzlich die Kronen-Karte als Faktor — die Streu-Scheibe (voll bis r, Rand 1,7 r) ist breiter als der Schatten
    // des Labors (an der Kronen-Kante 0,47): am Waldrand der Mess-Wiese dünnte das die offene Wiese auf 0,75 Licht.
    _bodenLichtFeld(x0, z0, x1, z1) {
        const U = AnazhRealm.UNDERGROWTH;
        const wk = this.state.wegeKarte;
        const reichJeR = U.kronenSigma * Math.sqrt(U.kronenQMax);
        const kronen = [];
        if (wk && wk.kronen.size) {
            const R = (wk.kronenRandMax / AnazhRealm.LAUB_STREU.rand) * reichJeR;
            const Z = AnazhRealm.LAUB_STREU.zelleM;
            for (let zz = Math.floor((z0 - R) / Z); zz <= Math.floor((z1 + R) / Z); zz++)
                for (let zx = Math.floor((x0 - R) / Z); zx <= Math.floor((x1 + R) / Z); zx++) {
                    const zelle = wk.kronenZellen.get(zx + "," + zz);
                    if (!zelle) continue;
                    for (const c of zelle.values()) {
                        const reich = c[2] * reichJeR;
                        if (c[0] + reich < x0 || c[0] - reich > x1 || c[1] + reich < z0 || c[1] - reich > z1) continue;
                        const s = U.kronenSigma * c[2];
                        kronen.push(c[0], c[1], 1 / (s * s));
                    }
                }
        }
        return (x, z) => {
            let deckung = 0;
            for (let i = 0; i < kronen.length; i += 3) {
                const dx = x - kronen[i];
                const dz = z - kronen[i + 1];
                const q = (dx * dx + dz * dz) * kronen[i + 2];
                if (q < U.kronenQMax) deckung += Math.exp(-q);
            }
            return Math.exp(-U.canopyK * deckung);
        };
    }

    // Die Wiese ist Boden-Funktion: jede Gras-Zelle wird gras-los verbucht (null), die Halme zeichnet
    // die Parallax-Funktion im Terrain-Albedo. Keine Halm-Geometrie.
    _buildVoxelChunkGrass(cx, cz) {
        if (!this.state.scene || typeof THREE === "undefined") return;
        if (!this.state.voxelChunkGrass) this.state.voxelChunkGrass = new Map();
        const key = `${cx},${cz}`;
        if (this.state.voxelChunkGrass.has(key)) return;
        // Als „kein Gras-Mesh" (null) registriert, damit der Lifecycle (Cull/Release/LOD) konsistent
        // bleibt; die Wiese lebt als Boden-Shading (_terrainGeologyAlbedo), es entstehen nie Halm-Dreiecke.
        if (!this.state.voxelChunkGrassLod) this.state.voxelChunkGrassLod = new Map();
        const _ce = this.state.voxelChunks ? this.state.voxelChunks.get(key) : null;
        this.state.voxelChunkGrass.set(key, null);
        this.state.voxelChunkGrassLod.set(key, _ce && !_ce.empty ? _ce.lod || 0 : 0);
    }

    _disposeVoxelChunkGrass(key) {
        if (this.state.voxelChunkGrassLod) this.state.voxelChunkGrassLod.delete(key);
        if (!this.state.voxelChunkGrass) return;
        this.state.voxelChunkGrass.delete(key);
    }

    // DIE NAH-WIESE: je Kachel (NAH_WIESE.kachel) die Büschel nach dem Studio-Gesetz (buildForest, Schritt 7):
    // Raster `understory.grassStep` in Welt-Koordinaten, Jitter ±0,34, Wurf gegen die Bodenschicht des Kerns
    // (terrain:groundCover, das Labor pflanzt danach) mit den Welt-Feldern (das Licht der stehenden
    // Kronen `_bodenLichtFeld`, Feuchte, Hang wie der Strauch-Teppich, Pfad dünnt) × dem Grün-Kanal der Boden-Karte (Büschel nur, wo
    // die Boden-Funktion Wiese zeichnet). Skala Studio: (0,7 + w·0,7) · (m > 0,8 ? 1,45 : 1), zwei Vorlagen. Jedes Büschel
    // trägt den Tint des Kerns (terrain:wiesenTint, `f`: der Faktor je Kanal, die Instanz-Farbe der Senke) — W1.
    // Fuß, Hang und Grün auf dem GERENDERTEN Boden (der EINE Leser `_bodenSichtAt`, am Chunk-Rand die Karte des
    // Nachbarn). Die Würfe hängen nur an der Zelle (Γ5) — dieselbe Wiese bei jedem Besuch. Gibt die Büschel-Liste
    // zurück oder null, solange ein Chunk, den die Kachel liest (`_bodenSichtChunks`), noch keine Boden-Karte hat oder die
    // Weite der gezeichneten Vorlagen (`nahWiese.reich`, `_nahWieseWeite`) noch nicht steht. `anteil` (die Ferne): nur die
    // Büschel, deren Ordnung o (`_wieseOrdnung`, aus der Lage — dieselbe Zahl liest der Stoff der Ferne) darunter liegt; die
    // übrigen Zellen fragen kein Feld. Die Liste steht nach o (ein Präfix ist eine gleichmäßige Ausdünnung).
    _nahWieseKachelBueschel(tx, tz, anteil = 1) {
        const NW = AnazhRealm.NAH_WIESE;
        const reich = this.state.nahWiese ? this.state.nahWiese.reich : 0;
        if (!(reich > 0)) return null;
        const step = AnazhRealm._wieseSchritt();
        const GS = AnazhRealm.GRASS_SLOPE;
        const seedInt = this._forestSeedInt();
        const x0 = tx * NW.kachel;
        const z0 = tz * NW.kachel;
        // der Jitter trägt einen Büschel 0,34 m über die Kachel hinaus
        if (!this._bodenSichtChunks(x0 - 0.34, z0 - 0.34, x0 + NW.kachel + 0.34, z0 + NW.kachel + 0.34)) return null;
        const cl = (v) => Math.max(0, Math.min(1, v));
        const boden = (px, pz) => {
            const v = this._bodenSichtAt(px, pz);
            return v === null ? NaN : v;
        };
        const grund = {};
        const licht = this._bodenLichtFeld(x0 - 0.34, z0 - 0.34, x0 + NW.kachel + 0.34, z0 + NW.kachel + 0.34);
        const GC =
            AnazhRealm.Gesetz("terrain:groundCover", null) || AnazhRealm._kernPflichtBruch("terrain:groundCover");
        const WT = AnazhRealm.Gesetz("terrain:wiesenTint", null) || AnazhRealm._kernPflichtBruch("terrain:wiesenTint");
        const out = [];
        const Gb = globalThis.__gelaendeCore;
        const E = this._erdbauLage();
        // die gemähten Büschel (halten.K3, `_maehen`) fehlen, bis ihre Tat heilt — Identität ist die Gitter-Zelle gi|gj
        const gemaeht = this._geerntetIn("wiese:" + tx + "," + tz);
        for (let gj = Math.ceil(z0 / step); gj * step < z0 + NW.kachel; gj++) {
            for (let gi = Math.ceil(x0 / step); gi * step < x0 + NW.kachel; gi++) {
                if (gemaeht.has(gi + "|" + gj)) continue;
                let hs = ((gi * 73856093) ^ (gj * 19349663) ^ seedInt ^ 0x6a09e667) >>> 0 || 1;
                const w = () => {
                    hs = (hs + 0x6d2b79f5) >>> 0;
                    let t = hs;
                    t = Math.imul(t ^ (t >>> 15), t | 1);
                    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
                    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
                };
                const x = gi * step + (w() - 0.5) * 0.68;
                const z = gj * step + (w() - 0.5) * 0.68;
                const wurf = w();
                const vorlage = w() < 0.5 ? 0 : 1;
                const sk = 0.7 + w() * 0.7;
                const rot = w() * Math.PI * 2;
                const o = AnazhRealm._wieseOrdnung(x, z);
                if (o >= anteil) continue;
                const y = this._bodenSichtAt(x, z, grund);
                if (y === null) continue;
                // der Grund der Wiese (`_wieseGrund`: Grün, Pfad, Asche, Wasser) — dasselbe Gewicht liest das Gitter der Ferne
                const wg = this._wieseGrund(x, z, y, grund.gruen);
                if (!(wg > 0)) continue;
                const m = this._feuchteAt ? this._feuchteAt(x, z, y) : 0;
                // das Licht der STEHENDEN Kronen (dasselbe Register wie die Laub-Streu): in der Mitte einer Krone 0,43, an
                // ihrer Kante 0,67 — dort wächst die Narbe nach dem Labor-Gesetz auf 52 % bzw. 81 %
                const L = licht(x, z);
                // die Ebene des Hangs (gx, gz) — auf ihr steht das Büschel (`_nahWieseKachelDaten`), über keine Kante gekippt
                const eb = {};
                const hang = this._slopeAt(x, z, boden, 1, eb, y);
                const rk = cl((hang - GS.lo) / (GS.hi - GS.lo));
                const p = GC(L, m, rk, Infinity).grass * wg;
                if (wurf >= p) continue;
                const sb = sk * (m > 0.8 ? 1.45 : 1);
                // der Kreis des Büschels vor dem Grund der Häuser (S4, `erdbauGrund`: jede Box des Körper-Satzes), sein
                // Radius die Weite der gezeichneten Vorlagen
                if (Gb.erdbauGrund(E, x, z, reich * sb)) continue;
                // … und vor jeder anderen Hülle der Natur-Wand (w20-lack-spiegel; die Nah-Streu fragt sie über `_naturSetzen`):
                // dem Wagen (`_imWagen`, er hält: `_wagenGrund`) und dem Bau mit Boxen (`_imGrundriss` "bau": Tor, Esse, Brunnen)
                if (this._imWagen(x, z, reich * sb) || this._imGrundriss(x, z, reich * sb) === "bau") continue;
                const f = WT(x, z, L, m, [1, 1, 1], 0);
                out.push({ x, y, z, s: sb, rot, vorlage, o, f, gi, gj, gx: eb.gx, gz: eb.gz });
            }
        }
        out.sort((a, b) => a.o - b.o);
        return out;
    }

    // DER SCHRITT DES GITTERS der Wiese (Studio `understory.grassStep`): je Zelle ein Wurf (`_nahWieseKachelBueschel`), die
    // Ordnung der Ferne liest die Zelle aus der Lage (`_wieseOrdnung`, `_halmFerne`) — EINE Zahl für Wurf und Ordnung
    static _wieseSchritt() {
        const u = AnazhRealm._studioRenderConfig && AnazhRealm._studioRenderConfig.understory;
        return u && Number.isFinite(u.grassStep) ? u.grassStep : 0.72;
    }

    // DIE ORDNUNG DER FERNE (rein): o ∈ [0, 1) eines Büschels aus der Lage seines Fußes, Zug 0 der Ziehung des Orts
    // (`_ortZiehung`), GESCHICHTET über dem Gitter der Wiese (`_wieseSchritt`) — die CPU (`_nahWieseKachelBueschel`) und der Stoff
    // der Ferne (`_halmFerne`, über der Wort-Algebra des Stoffs aus dem Ursprung seiner Instanz) rufen DIESE Funktion, EINE Rechnung.
    // Die oberen 8 Bit sind der BAYER-RANG seiner Gitter-Zelle, die unteren 16 die oberen 16 Bit des Worts der Ziehung: jeder
    // Anteil a (o < a) ist ein gleichmäßiges TEIL-GITTER der Nähe (bei a = 1/4 jede zweite Zelle je Achse, der Abstand der
    // Nachbarn 1/√a Zellen), nie ein Poisson-Wurf.
    // Bis w19-saum-lai war o die PCG allein: die Nähe steht im geschichteten Gitter (eine Zelle je Schritt, gleichmäßiger als
    // Poisson), die Ferne dünnte es ZUFÄLLIG — Klumpen und Lücken, durch die der flache Blick den Boden sah. Die Blattfläche je
    // Boden hielt das Gesetz (Probe am Keil ±30° der Station, swiftshader: 10–20 m 2,64 · 20–40 m 2,25–2,75, nah 2,48–2,74),
    // der Pixel-LAI fiel dort, wo die Ferne dünnt: je Fläche 1,02 · 0,97 · 0,78 · 0,72 (2–5 · 5–10 · 10–20 · 20–40 m). Die
    // Station an derselben Pose (swiftshader): Boden-Pixel 10–20 m 881 → 809, 20–40 m 3 → 0 (satt), 40–80 m 9 → 3,
    // 80–200 m 1 106 → 626, zurückgetauscht in derselben Welt wieder 880 · 3 · 9 · 1 105; der Bestand der Ferne 13 748 → 13 680
    // Büschel, im Blick 1 259 → 1 282 (dieselbe Erwartung a je Zelle). Die Wand: gate:profiband P-Ferne, das Teil-Gitter.
    static _wieseOrdnung(x, z, W = AnazhRealm._wortAlgebra()) {
        return AnazhRealm._ortZiehung(W, x, z, 0, AnazhRealm._wieseSchritt());
    }
    // DIE ZIEHUNG DES ORTS (rein, über einer Wort-Algebra W, `_wortAlgebra`): das Wort einer Lage — x und z auf 1/256 m (in f32
    // exakt bis ±32 km, keine Rundung, die eine Karte anders legte), versetzt um 2²³, PCG über beide Achsen —, je `zug` eine
    // PCG-Runde weiter, die oberen 24 Bit als Zahl in [0, 1). Zug 0 ist die Ordnung der Ferne (`_wieseOrdnung`, `_halmFerne`), Zug 1
    // das Rauschen des Halms: die Phase seines Wiegens (`_windSwayOffset` am Fuß des Büschels; die Nah-Streu trägt es je Pflanze im
    // Satz, `_satzKernWiege`; die Strähne des Haars am Ort ihrer ersten Sicht, `_haarFederTakt`). EINE Rechnung für CPU und Stoff.
    // GESCHICHTET (`schritt` > 0, die Ordnung der Ferne): über dem Gitter dieser Schrittweite tragen die oberen 8 Bit den
    // BAYER-RANG der Zelle (gi, gj = die Lage durch den Schritt, gerundet: der Jitter ±0,34 m der Wiese bleibt unter dem halben
    // Schritt) in der Tafel 16 × 16 — die Bit-Umkehr von (gi ⊕ gj, gi) verschränkt —, darunter die oberen 16 Bit des Worts
    // (24 Bit: in f32 exakt). Die Kette der Züge läuft über dem ungeschichteten Wort: Zug 1 bleibt, was er ohne Schichtung ist.
    static _ortZiehung(W, x, z, zug = 0, schritt = 0) {
        const pcg = (u) => {
            const s = W.add(W.mul(u, 747796405), 2891336453);
            const w = W.mul(W.xor(W.shr(s, W.add(W.shr(s, 28), 4)), s), 277803737);
            return W.xor(W.shr(w, 22), w);
        };
        let h = pcg(W.xor(W.lage(x), pcg(W.lage(z))));
        for (let i = 0; i < zug; i++) h = pcg(h);
        if (!(schritt > 0)) return W.anteil(h);
        const [gi, gj] = [W.zelle(x, schritt), W.zelle(z, schritt)];
        const [u, v] = [W.xor(gi, gj), gi];
        h = W.shr(h, 8);
        for (let k = 0; k < 4; k++)
            h = W.or(h, W.or(W.shl(W.and(W.shr(u, k), 1), 31 - 2 * k), W.shl(W.and(W.shr(v, k), 1), 30 - 2 * k)));
        return W.anteil(h);
    }
    // DIE WORT-ALGEBRA der Ziehung (u32, modulo 2³²): ohne T die Zahlen der CPU, mit T die TSL-Knoten (WGSL u32). `zelle` die
    // Gitter-Zelle einer Lage (gerundet, versetzt um 2²³ — ein Vielfaches von 16: die unteren Bits bleiben die der Zelle).
    static _wortAlgebra(T) {
        if (T)
            return {
                lage: (v) => T.floor(v.mul(256).add(0.5)).add(8388608).toUint(),
                zelle: (v, s) => T.floor(v.div(s).add(0.5)).add(8388608).toUint(),
                add: (a, b) => a.add(b),
                mul: (a, b) => a.mul(b),
                xor: (a, b) => a.bitXor(b),
                and: (a, b) => a.bitAnd(b),
                or: (a, b) => a.bitOr(b),
                shr: (a, b) => a.shiftRight(b),
                shl: (a, b) => a.shiftLeft(b),
                anteil: (u) =>
                    u
                        .shiftRight(8)
                        .toFloat()
                        .mul(1 / 16777216),
            };
        if (!AnazhRealm._wortZahlen)
            AnazhRealm._wortZahlen = Object.freeze({
                lage: (v) => (Math.floor(Math.fround(v) * 256 + 0.5) + 8388608) >>> 0,
                zelle: (v, s) => (Math.floor(Math.fround(v) / s + 0.5) + 8388608) >>> 0,
                add: (a, b) => (a + b) >>> 0,
                mul: (a, b) => Math.imul(a, b) >>> 0,
                xor: (a, b) => (a ^ b) >>> 0,
                and: (a, b) => (a & b) >>> 0,
                or: (a, b) => (a | b) >>> 0,
                shr: (a, b) => a >>> b,
                shl: (a, b) => (a << b) >>> 0,
                anteil: (u) => (u >>> 8) / 16777216,
            });
        return AnazhRealm._wortZahlen;
    }

    // Eine Kachel baut neu (eine Tat, ihr Heilen, ein Weg): sie trägt nur Daten, der Sicht-Satz legt sich neu — und die
    // Kachel der Ferne, die sie umschließt, mit ihr (dieselben Büschel). Verlässt sie nur den Ring der Nähe, fällt sie im
    // Takt allein (`_tickNahWiese`).
    _nahWieseKachelFaellt(key) {
        const nw = this.state.nahWiese;
        if (!nw) return false;
        const n = AnazhRealm.NAH_WIESE.fern.kachel / AnazhRealm.NAH_WIESE.kachel;
        const [tx, tz] = key.split(",").map(Number);
        const fern = !!nw.fern && nw.fern.kacheln.delete(Math.floor(tx / n) + "," + Math.floor(tz / n));
        if (!nw.kacheln.delete(key) && !fern) return false;
        nw.neu = true;
        return true;
    }

    // Je Takt (scatterDeco, prio 2): Kacheln im Ring um die KAMERA anlegen (nah zuerst, ≤ kachelnJeTakt Neubauten),
    // außerhalb fällt die Kachel; die Senken folgen den Studio-Vorlagen (`_nahWieseSenken`). Ein Chunk-Neubau (Edit)
    // baut die betroffenen Kacheln neu. Stufe, Rand-Band und Sicht wählt der Sicht-Satz je Büschel und Frame
    // (`_nahWieseSicht`) — eine Kachel baut nur, wenn sie den Ring betritt. Rückgabe: Zahl der Neubauten (0 = der Ring
    // steht).
    // DER BODEN, DEN NIEMAND BAUT: die Kacheln der Nah-Wiese und der Nah-Streu stehen am Auge, der Ring der Chunks steht am
    // Spieler (`_tickVoxelChunkStreaming` um `lastPlayerVoxelChunk`, sein Radius `_voxelChunkConfig().ringRadius` — derselbe,
    // den der Strom baut und `_pruneDistantVoxelChunks` hält). Liegt ein Chunk, den die Kachel liest (die Spanne von
    // `_bodenSichtChunks`: der Eigner und seine unteren Nachbarn), jenseits dieses Rings, baut ihn kein Takt — die Kachel ist
    // nicht gewollt: kein Bau, nichts offen. Wächst der Ring oder geht der Spieler hin, regt der Strom die Welt (`_weltRegt`)
    // und die Kachel ist wieder gewollt. Bis fege-takt wartete sie dort ewig: führte ein Studio (`kameraFuehren`, der
    // Makro-Flug des Gelände-Studios) oder eine Sonde (werkbank bild) die Kamera jenseits des Rings, hielt „Fege-Takt
    // nahWiese wartet, nahStreu wartet" die Welt in JEDEM Takt wach (bild laub-kante, Radeon: 3 von 3 Läufen nach 2653–3368
    // Takten nicht stehend, 3040 von 3040 Gängen offen, 0 Kacheln, die Kamera 1 km neben dem Spieler).
    _bodenKommtNie(x0, z0, x1, z1) {
        const z = this.state.lastPlayerVoxelChunk;
        if (!z || !this.state.voxelTerrainActive) return false;
        const { span, step, ringRadius } = this._voxelChunkConfig(0);
        return (
            z.cx - Math.floor((x0 - 2 * step) / span) > ringRadius ||
            Math.floor(x1 / span) - z.cx > ringRadius ||
            z.cz - Math.floor((z0 - 2 * step) / span) > ringRadius ||
            Math.floor(z1 / span) - z.cz > ringRadius
        );
    }

    _tickNahWiese(deadline) {
        const st = this.state;
        if (!st.scene || !st.camera || typeof THREE === "undefined") return 0;
        const NW = AnazhRealm.NAH_WIESE;
        // Die Senken hängen direkt in der Szene (`_nahWieseSenken`): jede ist ihr eigener oberster Knoten, die Täter-Klasse
        // (`_taeterKlasse`) liest ihren Namen `nahWiese:L<stufe>:…` — die Band-Linse trennt die Stufen.
        if (!st.nahWiese)
            st.nahWiese = { kacheln: new Map(), senken: new Map(), vorlagen: new Map(), neu: true, offen: 0 };
        const nw = st.nahWiese;
        if (!nw.fern) nw.fern = { kacheln: new Map(), gitter: new Map() };
        // DIE STAND-WACHE: stehen Auge, Chunks und Studio-Vorlagen, steht jede Kachel — kein Gang.
        if (this._standRuht("nahWiese", 1, { pos: st.camera.position, rand: AnazhRealm.STAND_RAND_M }, "karte"))
            return 0;
        let gefallen = 0;
        const cam = st.camera.position;
        const tcx = Math.floor(cam.x / NW.kachel);
        const tcz = Math.floor(cam.z / NW.kachel);
        const reichweite = Math.ceil((NW.radius + NW.vorlauf) / NW.kachel) + 1;
        // Chunk-Neubau oder neues gezeichnetes Wasser → betroffene Kacheln neu (ihre Büschel standen auf dem alten Boden,
        // am alten Ufer); die Kachel der Ferne prüft ihre eigenen Karten (`_nahWieseFernTakt`).
        const faellt = (key) => nw.kacheln.delete(key) && (nw.neu = true);
        for (const [key, k] of nw.kacheln)
            if ((!this._wasserKennungenGleich(k.wasser) || !this._bodenKartenStehen(k.chunkKarten)) && faellt(key))
                gefallen++;
        const wunsch = [];
        for (let dz = -reichweite; dz <= reichweite; dz++) {
            for (let dx = -reichweite; dx <= reichweite; dx++) {
                const tx = tcx + dx;
                const tz = tcz + dz;
                const d = Math.hypot((tx + 0.5) * NW.kachel - cam.x, (tz + 0.5) * NW.kachel - cam.z);
                if (d > NW.radius + NW.vorlauf + NW.kachel * 0.71) continue;
                // dasselbe Rechteck wie der Bau der Büschel (`_nahWieseKachelBueschel`, Jitter 0,34 m)
                const x0 = tx * NW.kachel - 0.34;
                const z0 = tz * NW.kachel - 0.34;
                if (this._bodenKommtNie(x0, z0, x0 + NW.kachel + 0.68, z0 + NW.kachel + 0.68)) continue;
                wunsch.push({ key: `${tx},${tz}`, tx, tz, d });
            }
        }
        const gewollt = new Set(wunsch.map((w) => w.key));
        for (const key of [...nw.kacheln.keys()]) if (!gewollt.has(key) && faellt(key)) gefallen++;
        wunsch.sort((a, b) => a.d - b.d);
        // Buch und Render-Config docken in EINER Nachricht (wie `_nahStreuArten`): solange beide fehlen, wartet die Wiese —
        // ein Budget vor dem Buch ist kein Bruch, sondern noch nicht da. Bis Welle K las sie das Budget im ersten Takt nach
        // dem Boot und warf KERN-PFLICHT, bis das Buch kam (gate:post-kette sah es, sobald der Boot schneller zeichnete).
        if (!AnazhRealm._studioRenderConfig || !this._foundry || !this._foundry.recipes) {
            nw.offen = wunsch.length || 1;
            return 0;
        }
        nw.offen = 0;
        // Die zwei Studio-Vorlagen je Stufe (Foundry-Cache; eine Anfrage, falls noch kalt) — einmal je Takt. Der Wurf
        // ist das Studio-Budget (B2c grass[stufe].schatten): die Nah-Wiese legt ihren Satz am AUGE — ein Werfer bräuchte
        // den Satz der Kaskade, das Budget nennt für das Gras keinen (laut, falls doch). Gelesen wird es, wenn die
        // Vorlage steht: eine Vorlage gibt es erst mit dem Buch (Buch kalt → `_foundryFlattenFor` null), das Budget
        // dockt in derselben Nachricht. Befund 0710-2: die Zusicherung las VOR der Vorlage — kam das Buch nach dem Ring,
        // brach jeder Deko-Takt bis zum Buch an `phyto:lod.budget (gras)` und riss Nah-Streu und Hydro-Kacheln mit.
        // Der Rang der Vorlage ist der Ort ihres Lesers, das Auge (`wo`, B5): ohne Ort stand sie auf ∞ und wartete vor dem
        // ersten Bild auf eine leere Bahn (GTX kalt 8,5 s), während die Streu-Lücke im Blick auf sie wartete.
        let weite = 0; // die weiteste Halm-Spitze der Vorlagen beider Stufen — NaN, solange eine fehlt
        for (const stufe of [1, 2]) {
            for (let v = 0; v < 2; v++) {
                const fl = this._foundryFlattenFor({ seed: v + 1, wo: cam }, "gras", stufe);
                if (fl && Array.isArray(fl.leaves) && fl.leaves.length) {
                    if (this._foundryBudgetZeile("gras", stufe).schatten !== false)
                        throw new Error(
                            `Nah-Wiese: gras[${stufe}] wirft — der Sicht-Satz cullt am Auge, nie für die Kaskade`
                        );
                    this._nahWieseSenken(v, stufe, fl);
                } else nw.offen++; // das Studio-Asset kommt noch (Buch kalt oder die Foundry-Anfrage läuft)
                const vl = nw.vorlagen.get(`${v}:L${stufe}`);
                weite = vl ? Math.max(weite, vl.weite) : NaN;
            }
        }
        // DIE WEITE DER BÜSCHEL (S4, der EINE Schreiber von `nahWiese.reich`): die weiteste Halm-Spitze um den Fuß, waagrecht, je
        // Büschel-Skala 1, über jede Vorlage beider Stufen (jede Stufe zeichnet jeden Büschel; gemessen an der GEZEICHNETEN
        // Geometrie, `_nahWieseSenken`), dazu der Hub des Blatts im Sturm (phyto-core WIND_GESETZ.blatt.hub) — der Kreis jedes
        // Büschels vor dem Grund der Häuser (`_nahWieseKachelBueschel` → `erdbauGrund`); vor ihr baut keine Kachel, eine Kachel
        // aus einer anderen Weite wächst neu. Bis heil-w4-wiese-nah trug NAH_WIESE.reich sie als Zahl (0,72 m, gemessen 19.10.):
        // die Ähre des Halm-Gesetzes reicht 0,74 m, und 22 Büschel steckten ihre Halme in 11 von 25 Häuser (gate:haus-welt W9).
        const reich = weite > 0 ? weite + globalThis.__phytoCore.WIND_GESETZ.blatt.hub : 0;
        if (reich !== nw.reich) {
            nw.reich = reich;
            for (const [key, k] of nw.kacheln) if (k.reich !== reich && faellt(key)) gefallen++;
        }
        let gebaut = 0;
        for (const w of wunsch) {
            if (nw.kacheln.has(w.key)) continue;
            if (gebaut >= NW.kachelnJeTakt || (deadline && performance.now() > deadline)) {
                nw.offen++; // das Takt-Budget ist leer
                continue;
            }
            const bueschel = this._nahWieseKachelBueschel(w.tx, w.tz);
            if (!bueschel) {
                nw.offen++;
                continue;
            }
            // die Karten und die Kennungen des gezeichneten Wassers, die die Büschel lasen (ihr Jitter reicht 0,34 m über die
            // Kachel): dasselbe Rechteck wie im Bau der Büschel
            const x0 = w.tx * NW.kachel - 0.34;
            const z0 = w.tz * NW.kachel - 0.34;
            const chunkKarten = this._bodenSichtChunks(x0, z0, x0 + NW.kachel + 0.68, z0 + NW.kachel + 0.68);
            const wasser = this._wasserKennungen(x0, z0, x0 + NW.kachel + 0.68, z0 + NW.kachel + 0.68);
            nw.kacheln.set(
                w.key,
                Object.assign({ chunkKarten, wasser, reich }, this._nahWieseKachelDaten(w.tx, w.tz, bueschel))
            );
            nw.neu = true;
            gebaut++;
        }
        const f = this._nahWieseFernTakt(cam, deadline, reich);
        nw.offen += f.offen;
        this._standMeldet("nahWiese", 1, gebaut + gefallen + f.gebaut + f.gefallen > 0, nw.offen > 0);
        return gebaut + f.gebaut;
    }

    // DIE FERNE JE TAKT (`NAH_WIESE.fern`): die Kacheln der Ferne zwischen der Übergabe und `bis` um das Auge — je Kachel die
    // Büschel ihrer Kacheln der Nähe mit Ordnung unter der SCHRANKE ihrer Lage (`_wieseFernSchranke`: der höchste Anteil, den
    // das Gesetz einem ihrer Büschel gibt, für jedes Auge bis `vorlauf` näher; `_nahWieseFernKachel`); ihre Lage (Höhe und
    // Neigung ihres Bodens, `_wieseFernLage`) misst sie vor dem ersten Bau. Eine Kachel, deren Anteil die Schranke des Auges
    // überholt (es kam näher, stieg ab, sah den Hang steiler an), baut neu, eine, deren Karten oder Wasser sich änderten,
    // auch; eine aus dem Ring fällt. Nah zuerst, höchstens `kachelnJeTakt` Bauten je Takt. → { gebaut, gefallen, offen }
    // Der Takt läuft in jedem Takt, in dem das Auge geht, über jede Kachel bis `bis` (an der Mess-Wiese ~860): er ordnet darum
    // nur die Kacheln, die bauen, und liest die Schranke an der Tafel (`WIESE_FERN_TAFEL`, w4-wiese-takt; bis dahin rief er je
    // Kachel `_wieseFern`) — dieselben Kacheln fallen, bauen und warten. Bis w14-wiese-saum trug eine Kachel den Anteil ihres
    // nächsten Abstands: am zugewandten Hang, wo das Gesetz mehr Büschel stellt, fehlten sie ihr.
    _nahWieseFernTakt(cam, deadline, reich) {
        const NW = AnazhRealm.NAH_WIESE;
        const F = NW.fern;
        const K = F.kachel;
        const fk = this.state.nahWiese.fern.kacheln;
        const o = { gebaut: 0, gefallen: 0, offen: 0 };
        const auge = this._wieseAuge(cam);
        // der nächste Punkt der Kachel samt dem Jitter ihrer Büschel (0,34 m über die Kante, `_nahWieseKachelBueschel`)
        const naechst = (fx, fz) =>
            Math.hypot(
                Math.max(fx * K - 0.34 - cam.x, 0, cam.x - (fx + 1) * K - 0.34),
                Math.max(fz * K - 0.34 - cam.z, 0, cam.z - (fz + 1) * K - 0.34)
            );
        // ein Gitter jenseits des Chunk-Rings, das die Grenze las (`nie`), trägt jetzt Boden: die Kachel liest es neu
        const kommt = (k) => k.nie.some(([gx, gz]) => !this._bodenKommtNie(gx * K, gz * K, (gx + 1) * K, (gz + 1) * K));
        for (const [key, k] of fk)
            if (
                !this._wasserKennungenGleich(k.wasser) ||
                !this._bodenKartenStehen(k.chunkKarten) ||
                k.reich !== reich ||
                kommt(k)
            )
                fk.delete(key) && o.gefallen++;
        const R = Math.ceil(F.bis / K) + 1;
        const [cx, cz] = [Math.floor(cam.x / K), Math.floor(cam.z / K)];
        // die Gitter der Ferne (`_wieseFernGitter`) folgen dem Ring der Kacheln und ihrer Nachbarn — geräumt, wenn das Auge die
        // Kachel wechselt
        const G = this.state.nahWiese.fern;
        if (G.gitterMitte !== cx + "," + cz) {
            G.gitterMitte = cx + "," + cz;
            for (const key of [...G.gitter.keys()]) {
                const [gx, gz] = key.split(",").map(Number);
                if (Math.abs(gx - cx) > R + 1 || Math.abs(gz - cz) > R + 1) G.gitter.delete(key);
            }
        }
        // je gewollte Kachel die Marke dieses Takts; was baut (keine Kachel oder ihr Anteil vom Auge überholt), wartet in `bau`
        const [bau, marke] = [[], {}];
        for (let fz = cz - R; fz <= cz + R; fz++)
            for (let fx = cx - R; fx <= cx + R; fx++) {
                const d = naechst(fx, fz);
                if (d > F.bis) continue;
                // die Kachel ganz diesseits der Übergabe trägt nichts (dort legt der Sicht-Satz jedes Büschel)
                const weit = Math.hypot(Math.max(Math.abs(fx * K - cam.x), Math.abs((fx + 1) * K - cam.x)), Math.max(Math.abs(fz * K - cam.z), Math.abs((fz + 1) * K - cam.z))); // prettier-ignore
                if (weit < NW.radius) continue;
                if (this._bodenKommtNie(fx * K - 0.34, fz * K - 0.34, (fx + 1) * K + 0.34, (fz + 1) * K + 0.34))
                    continue;
                const key = fx + "," + fz;
                const alt = fk.get(key);
                if (alt) {
                    alt.marke = marke;
                    if (alt.anteil >= AnazhRealm._wieseFernSchranke(alt.lage, auge, 0)) continue;
                }
                bau.push({ key, fx, fz, d, lage: alt ? alt.lage : null });
            }
        for (const [key, k] of fk) if (k.marke !== marke) fk.delete(key) && o.gefallen++;
        bau.sort((a, b) => a.d - b.d);
        for (const w of bau) {
            if (o.gebaut >= F.kachelnJeTakt || (deadline && performance.now() > deadline)) {
                o.offen++;
                continue;
            }
            const lage = w.lage || this._wieseFernLage(w.fx, w.fz);
            const k = lage && this._nahWieseFernKachel(w.fx, w.fz, AnazhRealm._wieseFernSchranke(lage, auge, F.vorlauf), reich, deadline); // prettier-ignore
            if (!k) {
                o.offen++;
                continue;
            }
            k.lage = lage;
            fk.set(w.key, k);
            o.gebaut++;
        }
        if (o.gebaut + o.gefallen) this.state.nahWiese.neu = true;
        return o;
    }

    // DAS GESETZ DER FERNE (rein, `NAH_WIESE.fern`, EINE Rechnung über einer Algebra A — die Zahlen für Takt und Sicht-Satz,
    // TSL für den Stoff `_halmFerne`; bis w4-gras-l2 standen hier und im Stoff zwei Abschriften desselben Terms): je
    // Büschel aus seinem FUSSABDRUCK-ABSTAND Q (`_wieseFuss`: die Bodenfläche je Pixel an seinem Fuß als der Abstand, in dem
    // die flache Wiese denselben Pixel trägt) die STRECKUNG s = max(Q/radius, (Q/fuss)³) in [1, streckMax] — die Gestalt des
    // Büschels waagrecht um s, es trägt die Fläche von s² Zellen (die Spreizung; der Halm selbst hält nur den
    // Pixel, `_halmFerne`, nie um s breiter); ab der Übergabe wächst sie mit der Breite des Pixels,
    // ab ~16,6 m mit der Bodenfläche je Pixel (das Verhältnis zu der bei `fuss`: die Büschel je Pixel bleiben) —
    // und der ANTEIL der stehenden Büschel a = min(1, Ziel/s) × (1 − Saum vor `bis`), das Ziel der Deckung je Fläche 1 bis
    // `voll` (Anzahl × s = 1: an der Übergabe die Wiese der Nähe), dahinter (voll/Q)^fall; der Saum am waagrechten Abstand d
    // (der Ring der Chunks). So hält die Ferne die Deckung am Schirm, die Büschel je Pixel bleiben (Lehre 25). Bis
    // w14-wiese-saum las das Gesetz nur d: am zugewandten Hang lagen Platten, über die Kuppe flog der Pixel ungestreckt.
    // DIE GRENZE (w21-wiese-fern): `grenze` (optional) ist die Grenze der Streckung DIESES Büschels (`_wieseFernGrenzen`: so weit
    // tragen es die Wiese der Nähe und sein Boden). Die Streckung wirkt zweifach: sie SPREIZT die Füße der Halme um s (wo sie
    // stehen) und macht jeden Halm quer um s breiter (wie viel des Pixels er füllt). `spreiz` = min(s, grenze) — die Füße
    // stehen nie über der Wiese der Nähe und ihrem Boden hinaus; die Breite und der Anteil folgen dem Gesetz des Pixels (s): die
    // Blattfläche je Zelle bleibt Anteil × s, vor einer Gasse, an einem Kamm steht sie dichter um den Fuß statt auf der Gasse oder
    // in der Luft. Bis dahin spreizte das Gesetz jedes Büschel bis `streckMax`, auch neben einem Riss oder einer Kante: am
    // abgewandten Hang (S → 0) schon in 15 m vom Auge.
    static _wieseFern(A, d, Q, grenze) {
        const NW = AnazhRealm.NAH_WIESE,
            F = NW.fern;
        const breite = A.mul(Q, A.k(1 / NW.radius)); // die Breite aus dem Pixel (ab der Übergabe ∝ Q)
        const flaeche = A.pow(A.max(A.mul(Q, A.k(1 / F.fuss)), A.k(1e-3)), A.k(3)); // die Fläche je Pixel (∝ Q³)
        const s = A.min(A.k(F.streckMax), A.max(A.k(1), A.max(breite, flaeche)));
        const ziel = A.min(A.k(1), A.pow(A.max(A.mul(Q, A.k(1 / F.voll)), A.k(1e-3)), A.k(-F.fall)));
        const t = A.min(A.k(1), A.max(A.k(0), A.mul(A.add(d, A.k(F.saum - F.bis)), A.k(1 / F.saum))));
        const saum = A.add(A.k(1), A.mul(A.k(-1), A.mul(A.mul(t, t), A.add(A.k(3), A.mul(t, A.k(-2))))));
        return {
            streck: s,
            spreiz: grenze === undefined ? s : A.min(s, grenze),
            anteil: A.mul(A.min(A.k(1), A.mul(ziel, A.pow(s, A.k(-1)))), saum),
        };
    }

    // DAS GESETZ DER SCHALE (rein, über einer Algebra A wie `_wieseFern` — Zahlen im Sicht-Satz, TSL im Stoff der Schale): am
    // waagrechten Abstand d der Anteil der stehenden Karten — 1 bis `voll`, dahinter (voll/d)³ (die Karten je Pixel bleiben),
    // vor `bis` über `saum` auf 0 — und die Breite einer Karte, 1/Anteil (höchstens `breitMax`): die Blattfläche je Boden
    // bleibt (die Höhe der Karte bleibt, ihre Fläche wächst mit der Breite).
    static _wieseSchale(A, d) {
        const S = AnazhRealm.NAH_WIESE.fern.schale;
        const a0 = A.min(A.k(1), A.pow(A.max(A.mul(d, A.k(1 / S.voll)), A.k(1e-3)), A.k(-3)));
        const t = A.min(A.k(1), A.max(A.k(0), A.mul(A.add(d, A.k(S.saum - S.bis)), A.k(1 / S.saum))));
        const saum = A.add(A.k(1), A.mul(A.k(-1), A.mul(A.mul(t, t), A.add(A.k(3), A.mul(t, A.k(-2))))));
        return { anteil: A.mul(a0, saum), breit: A.min(A.k(S.breitMax), A.pow(A.max(a0, A.k(1e-3)), A.k(-1))) };
    }

    // DER FUSSABDRUCK-ABSTAND (rein, über der Algebra A — dieselbe Rechnung in Takt, Sicht-Satz und Stoff): (dx, dy, dz) der
    // Fuß des Büschels vom Auge aus, (nx, ny, nz) die Normale der Ebene seines Hangs (ungenormt: (−gx, 1, −gz)), h die Höhe
    // des Auges über dem eigenen Boden. Die Bodenfläche je Pixel am Fuß ist dist²/sin φ = dist³/S (S = |n̂ · (Auge − Fuß)|,
    // die Höhe des Auges über der Ebene), bei `fuss` der flachen Wiese fuss³/h — Q = dist · (h/S)^⅓ ist der Abstand, in dem
    // die flache Wiese dieselbe Fläche je Pixel trägt (flach: S = h, Q = dist).
    static _wieseFuss(A, dx, dy, dz, nx, ny, nz, h) {
        const q = (a) => A.mul(a, a);
        const dist = A.sqrt(A.add(A.add(q(dx), q(dy)), q(dz)));
        const nv = A.add(A.add(A.mul(nx, dx), A.mul(ny, dy)), A.mul(nz, dz));
        const S = A.mul(A.max(nv, A.mul(nv, A.k(-1))), A.pow(A.add(A.add(q(nx), q(ny)), q(nz)), A.k(-0.5)));
        return A.mul(dist, A.pow(A.mul(h, A.pow(A.max(S, A.k(1e-3)), A.k(-1))), A.k(1 / 3)));
    }

    // DAS AUGE DER WIESE (EIN Leser für Takt und Sicht-Satz, der Stoff liest es als Uniform): die Lage und h, die Höhe über dem
    // gezeichneten Boden darunter (`_bodenSichtAt`, ohne Karte das Gesetz `_voxelSurfaceY`), mindestens `fern.auge` — die
    // Bodenfläche je Pixel an der Übergabe der flachen Wiese (`_wieseFuss`) misst an ihr.
    _wieseAuge(p) {
        const b = this._bodenSichtAt(p.x, p.z);
        const y = b == null ? this._voxelSurfaceY(p.x, p.z) : b;
        const h = Number.isFinite(y) ? p.y - y : 0;
        return { x: p.x, y: p.y, z: p.z, h: Math.max(AnazhRealm.NAH_WIESE.fern.auge, h) };
    }

    // DIE TAFEL DER FERNE (w4-wiese-takt): das Gesetz `_wieseFern` in Zahlen, EINMAL an den Stützen Q = j/16 m bis hinter
    // `bis` gefragt, diesseits des Saums (d = 0) — Schranken, kein Ersatz: der Anteil fällt in Q (und der Saum in d), die
    // Streckung steigt (monoton), also liegt zwischen zwei Stützen jeder Wert zwischen ihren. Der Sicht-Satz entscheidet an
    // ihnen, was sicher steht oder sicher fehlt, und fragt das Gesetz selbst nur im Spalt dazwischen (je Satz an der
    // Mess-Wiese Ego wenige Dutzend statt ~5 900 Rufe); der Takt liest an ihnen die Schranke je Kachel.
    static get WIESE_FERN_TAFEL() {
        const NW = AnazhRealm.NAH_WIESE;
        const n = Math.ceil((NW.fern.bis + 2 * NW.fern.kachel) * 16) + 2;
        const T = { je: 16, anteil: new Float64Array(n), streck: new Float64Array(n) };
        for (let j = 0; j < n; j++) {
            const g = AnazhRealm._wieseFern(globalThis.__phytoCore.WIND_ZAHLEN, 0, j / 16);
            [T.anteil[j], T.streck[j]] = [g.anteil, g.streck];
        }
        return this._einmal("WIESE_FERN_TAFEL", Object.freeze(T));
    }

    // DIE SCHRANKE DER FERNE (Takt und Sicht-Satz, rein): der höchste Anteil, den das Gesetz einem Büschel in der Lage `L`
    // gibt ({ x0, x1, z0, z1 } seiner Füße, y0–y1 ihre Höhe, gx0–gx1 · gz0–gz1 die Neigung ihrer Hänge) — für jedes Auge, das
    // bis `rand` m waagrecht und rand/4 lotrecht vom Auge A steht (der Vorlauf einer Kachel; lotrecht wandern seine Höhe über
    // der Ebene und über dem eigenen Boden gemeinsam). Der kleinste Fußabdruck-Abstand: der nächste Fuß, die höchste Ebene
    // (S ≤ |(−gx, 1, −gz) · (Auge − Fuß)|, die Ecken der Intervalle) — an der Tafel (der Saum zählt nicht: die Schranke hält
    // ohne ihn). Samt dem Band, in dem ein Büschel sinkt.
    static _wieseFernSchranke(L, A, rand) {
        const F = AnazhRealm.NAH_WIESE.fern,
            TF = AnazhRealm.WIESE_FERN_TAFEL;
        // je Achse die Spanne Fuß − Auge
        const [dx0, dx1, dz0, dz1] = [L.x0 - A.x - rand, L.x1 - A.x + rand, L.z0 - A.z - rand, L.z1 - A.z + rand];
        const naechst = (a, b) => (a > 0 ? a : b < 0 ? -b : 0);
        // n'·(Fuß − Auge) = −gx·dx + dy − gz·dz über den Ecken der Intervalle
        const span = (g0, g1, a0, a1) => [g0 * a0, g0 * a1, g1 * a0, g1 * a1];
        const sx = span(-L.gx1, -L.gx0, dx0, dx1),
            sz = span(-L.gz1, -L.gz0, dz0, dz1);
        const [hx, lx] = [Math.max(...sx) + Math.max(...sz), Math.min(...sx) + Math.min(...sz)];
        let Q = Infinity;
        for (const dh of rand ? [-rand / 4, 0, rand / 4] : [0]) {
            const [dy0, dy1] = [L.y0 - A.y - dh, L.y1 - A.y - dh];
            const S = Math.max(Math.abs(dy1 + hx), Math.abs(dy0 + lx), 1e-3);
            const dist = Math.hypot(naechst(dx0, dx1), naechst(dy0, dy1), naechst(dz0, dz1));
            Q = Math.min(Q, dist * Math.cbrt(Math.max(F.auge, A.h + dh) / S));
        }
        const j = Math.floor(Q * TF.je);
        const a = j < TF.anteil.length ? TF.anteil[j] : AnazhRealm._wieseFern(globalThis.__phytoCore.WIND_ZAHLEN, 0, Q).anteil; // prettier-ignore
        return a * (1 + F.rand);
    }

    // DIE LAGE EINER KACHEL DER FERNE (vor ihrem Bau): die Höhe und die Neigung ihres gezeichneten Bodens an 2 × 2 Proben je
    // Kachel der Nähe, die ihr Bau liest (dieselben Leser: `_bodenSichtAt`, `_slopeAt`; eine Kachel der Nähe jenseits des
    // Chunk-Rings, `_bodenKommtNie`, trägt nichts und wird nicht gefragt), um den Rand eines Büschels zwischen den Proben
    // geweitet (0,1 m · 0,02) — die Schranke des Takts (`_wieseFernSchranke`) liest sie. null, solange ein Chunk unter ihr
    // seine Karte noch bekommt (`_bodenSichtChunks`, wie der Bau); eine Probe ohne Boden zählt nicht.
    _wieseFernLage(fx, fz) {
        const NW = AnazhRealm.NAH_WIESE;
        const [K, k6] = [NW.fern.kachel, NW.kachel];
        const n = K / k6;
        const L = { x0: fx * K - 0.34, x1: (fx + 1) * K + 0.34, z0: fz * K - 0.34, z1: (fz + 1) * K + 0.34 };
        Object.assign(L, { y0: Infinity, y1: -Infinity, gx0: Infinity, gx1: -Infinity, gz0: Infinity, gz1: -Infinity });
        const boden = (px, pz) => {
            const v = this._bodenSichtAt(px, pz);
            return v === null ? NaN : v;
        };
        const eb = {};
        for (let j = 0; j < n; j++)
            for (let i = 0; i < n; i++) {
                const [x0, z0] = [(fx * n + i) * k6 - 0.34, (fz * n + j) * k6 - 0.34];
                if (this._bodenKommtNie(x0, z0, x0 + k6 + 0.68, z0 + k6 + 0.68)) continue;
                if (!this._bodenSichtChunks(x0, z0, x0 + k6 + 0.68, z0 + k6 + 0.68)) return null;
                for (let q = 0; q < 4; q++) {
                    const [x, z] = [
                        x0 + (((q & 1) + 0.5) / 2) * (k6 + 0.68),
                        z0 + (((q >> 1) + 0.5) / 2) * (k6 + 0.68),
                    ];
                    const y = this._bodenSichtAt(x, z);
                    if (y === null) continue; // kein Boden an der Probe (Wasser): dort steht kein Büschel
                    this._slopeAt(x, z, boden, 1, eb, y); // die Ebene wie die der Büschel (über keine Kante gekippt)
                    [L.y0, L.y1] = [Math.min(L.y0, y - 0.1), Math.max(L.y1, y + 0.1)];
                    [L.gx0, L.gx1] = [Math.min(L.gx0, eb.gx - 0.02), Math.max(L.gx1, eb.gx + 0.02)];
                    [L.gz0, L.gz1] = [Math.min(L.gz0, eb.gz - 0.02), Math.max(L.gz1, eb.gz + 0.02)];
                }
            }
        // ganz jenseits des Rings: keine Probe, die Kachel trägt nichts (ihr Bau überspringt jede Kachel der Nähe)
        if (L.y0 === Infinity) Object.assign(L, { y0: 0, y1: 0, gx0: 0, gx1: 0, gz0: 0, gz1: 0 });
        return L;
    }

    // EINE KACHEL DER FERNE: die Büschel ihrer Kacheln der Nähe mit Ordnung unter `anteil` (steht die Kachel der Nähe, liest
    // sie deren Büschel), nach o geordnet, je Büschel die Grenze seiner Streckung (`grenze`, `_wieseFernGrenzen`), mit ihren
    // Karten und ihrem Wasser über ihrem FELD (die Kachel und ihre acht Nachbarn: so weit liest die Grenze) und den Gittern
    // jenseits des Chunk-Rings, die sie nichts tragen ließen (`nie`); null, solange eine Kachel der Nähe oder ein Gitter auf
    // seinen Boden wartet (eine Kachel der Nähe jenseits des Chunk-Rings trägt nichts). Bis w21-wiese-fern fiel hier jedes
    // Büschel, dessen bis `streckMax` gestreckter Kreis einen Grund berührte (Weite der Vorlagen × Skala × 14: um jedes Haus
    // 11–22 m ohne Ferne — die Stadt trug 4 277 statt 11 787 Büschel), und jedes übrige streckte sich auf Gasse und Fels.
    _nahWieseFernKachel(fx, fz, anteil, reich, frist) {
        const NW = AnazhRealm.NAH_WIESE;
        const [K, k6] = [NW.fern.kachel, NW.kachel];
        const n = K / k6;
        const nw = this.state.nahWiese;
        const bueschel = [];
        const chunkKarten = AnazhRealm._wieseKarten([(fx - 1) * K, (fz - 1) * K, (fx + 2) * K, (fz + 2) * K]);
        for (let j = 0; j < n; j++)
            for (let i = 0; i < n; i++) {
                const [tx, tz] = [fx * n + i, fz * n + j];
                const [x0, z0] = [tx * k6 - 0.34, tz * k6 - 0.34];
                if (this._bodenKommtNie(x0, z0, x0 + k6 + 0.68, z0 + k6 + 0.68)) continue;
                const nah = nw.kacheln.get(tx + "," + tz);
                const b = nah ? nah.bueschel : this._nahWieseKachelBueschel(tx, tz, anteil);
                const karten = this._bodenSichtChunks(x0, z0, x0 + k6 + 0.68, z0 + k6 + 0.68);
                if (!b || !karten) return null;
                AnazhRealm._wieseKarten(chunkKarten, karten);
                for (const x of b) {
                    if (x.o >= anteil) break;
                    bueschel.push(x);
                }
            }
        bueschel.sort((a, b) => a.o - b.o);
        const G = this._wieseFernGrenzen(fx, fz, bueschel, reich, frist);
        if (!G) return null;
        AnazhRealm._wieseKarten(chunkKarten, G.chunkKarten);
        const wasser = this._wasserKennungen(...chunkKarten.rechteck);
        const grenzeMax = G.grenze.reduce((a, b) => Math.max(a, b), 1); // die Kugel der Kachel im Sicht-Satz
        const schale = this._wieseSchaleDaten(fx, fz);
        return Object.assign(
            { anteil, reich, chunkKarten, wasser, nie: G.nie, grenze: G.grenze, grenzeMax, schale, bloecke: [] },
            this._nahWieseKachelDaten(fx, fz, bueschel, K)
        );
    }

    // DIE KARTEN EINES FELDS (`_bodenKartenStehen` prüft sie): ohne `dazu` ein leeres Feld über `rechteck`, sonst trägt `ziel`
    // jede Karte aus `dazu` samt der Lage und dem Stand, in dem sie gelesen wurde (so fällt die Kachel auch, wenn ein Chunk
    // seine Karte an Ort und Stelle neu rastert, `_bodenKarteNaht`).
    static _wieseKarten(ziel, dazu) {
        if (Array.isArray(ziel)) return Object.assign(new Map(), { rechteck: ziel, lage: new Map(), stand: new Map() });
        for (const [ck, m] of dazu) {
            ziel.set(ck, m);
            if (dazu.lage) ziel.lage.set(ck, dazu.lage.get(ck));
            if (dazu.stand) ziel.stand.set(ck, dazu.stand.get(ck));
        }
        return ziel;
    }

    // DER GRUND DER WIESE an (x, z) über dem gezeichneten Boden y mit seinem Grün `gruen` (`_bodenSichtAt` … `gruen`: die
    // Wiesen-Wache der Boden-Karte, das Pflaster deckt): das Gewicht ∈ [0, 1], mit dem die Nähe dort Wiese trägt — der Pfad
    // dünnt (`_pfadFeldAt` × `pfadDuennt`: getretene Erde, Gasse, Weg und Pflaster der Wege-Karte, der Ufer-Pfad), die Asche
    // eines Brands trägt keinen Halm, bis sie nachgrünt (`_ascheAt`, stoffe.K2#2), im Wasser steht nie einer (`_nassAt`, das EINE
    // Urteil wie die Nah-Streu). Der Wurf der Nähe liest es (× das Gesetz der Bodenschicht), das Gitter der Ferne liest
    // DASSELBE Gewicht (`_wieseFernGitter`) — dieselben Masken.
    _wieseGrund(x, z, y, gruen) {
        if (!(gruen > 0) || this._nassAt(x, z, 0.1, y)) return 0;
        return gruen * (1 - this._pfadFeldAt(x, z, y) * AnazhRealm.NAH_WIESE.pfadDuennt) * (1 - this._ascheAt(x, z));
    }

    // DAS GITTER DER FERNE (w21-wiese-fern): je Kachel der Ferne (fx, fz) die Wiese der Nähe und ihr Boden auf einem Gitter der
    // Kante `fern.gitter` (die Mitten seiner Zellen, kachel/gitter je Achse — die Gitter der Nachbarn setzen es lückenlos fort):
    // je Punkt die Höhe des gezeichneten Bodens (`_bodenSichtAt`, NaN ohne Boden) und ob die Nähe dort Wiese trägt (`traegt`:
    // ihr Grund `_wieseGrund` mindestens `fern.wiese` — kein Weg, keine Gasse, kein Pflaster, kein Fels, keine Asche, kein
    // Wasser). Die Grenze der Streckung liest es über die Kachel und ihre acht Nachbarn (`_wieseFernGrenzen`). Es lebt
    // neben den Kacheln (`nahWiese.fern.gitter`): eine Kachel baut neu, wenn das Auge ihren Anteil überholt — ihr Boden bleibt.
    // Es fällt mit seinen Karten und seinem Wasser (dieselbe Prüfung wie die Kachel) und unter einer neuen Fläche
    // (`_nahWieseNeuIn`); jenseits des Chunk-Rings (`_bodenKommtNie`, `nie`) trägt es nichts. null, solange ein Chunk unter ihm
    // seine Karte noch bekommt — oder die Frist des Takts (`frist`) verstrich, bevor es neu entsteht (die Kachel wartet einen
    // Takt, die gelesenen Gitter bleiben; Lehre 14). Kosten: 144 Proben je Kachel (12 × 12), EINMAL, solange ihr Boden steht.
    _wieseFernGitter(fx, fz, frist) {
        const NW = AnazhRealm.NAH_WIESE,
            F = NW.fern;
        const gitter = this.state.nahWiese.fern.gitter;
        const key = fx + "," + fz;
        const [x0, z0, x1, z1] = [fx * F.kachel, fz * F.kachel, (fx + 1) * F.kachel, (fz + 1) * F.kachel];
        const nie = this._bodenKommtNie(x0, z0, x1, z1);
        const alt = gitter.get(key);
        if (
            alt &&
            alt.nie === nie &&
            (nie || (this._bodenKartenStehen(alt.chunkKarten) && this._wasserKennungenGleich(alt.wasser)))
        )
            return alt;
        if (frist && performance.now() > frist) return null;
        const chunkKarten = nie ? null : this._bodenSichtChunks(x0, z0, x1, z1);
        if (!nie && !chunkKarten) return null;
        const n = Math.round(F.kachel / F.gitter);
        const G = { nie, chunkKarten, wasser: nie ? null : this._wasserKennungen(x0, z0, x1, z1) };
        Object.assign(G, { h: new Float32Array(n * n).fill(NaN), traegt: new Uint8Array(n * n) });
        const grund = {};
        for (let j = 0; !nie && j < n; j++)
            for (let i = 0; i < n; i++) {
                const [x, z] = [x0 + (i + 0.5) * F.gitter, z0 + (j + 0.5) * F.gitter];
                const y = this._bodenSichtAt(x, z, grund);
                if (y === null) continue;
                G.h[j * n + i] = y;
                G.traegt[j * n + i] = this._wieseGrund(x, z, y, grund.gruen) >= F.wiese ? 1 : 0;
            }
        gitter.set(key, G);
        return G;
    }

    // DIE GRENZE DER STRECKUNG (w21-wiese-fern) je Büschel der Kachel der Ferne (fx, fz): die größte Spreizung s ∈ [1, streckMax],
    // bei der das gestreckte Büschel in der Wiese der Nähe und auf seinem Boden bleibt. Seine Füße reichen fuss × Skala × s (der
    // weiteste Fuß seiner Vorlage `fuss`): DIE MASKE — kein Punkt des Gitters (`_wieseFernGitter`), der keine Wiese trägt (oder
    // an einer Kante liegt, über die der Boden steiler fällt, als die Wiese steht), liegt
    // näher als dieser Radius und die Diagonale einer Zelle des Gitters (der Abstand zum nächsten, exakt je Punkt; das Feld
    // endet wie eine Maske); DER GRUND — sein Kreis (die Weite der Büschel `reich` × Skala, die Füße um s − 1 gespreizt: bei s = 1 der Kreis der
    // Nähe) berührt keinen Grund eines Hauses (`erdbauGrund`, S4); DER BODEN — je Ring der Füße (s in Stufen × 1,25) liegt der
    // gezeichnete Boden auf acht Strahlen höchstens `boden` neben der Ebene seines Hangs. Der erste Ring, der bricht, setzt die
    // Grenze auf den vorigen; die Nähe (s = 1) gilt immer — sie stellte das Büschel. Das Feld der Lesung: die 3 × 3 Gitter um
    // die Kachel. → { grenze: Float32Array (je Büschel, in der Folge von `bueschel`), chunkKarten, nie: [[fx, fz], …] } oder
    // null, solange ein Gitter auf seine Karten wartet.
    _wieseFernGrenzen(fx, fz, bueschel, reich, frist) {
        const F = AnazhRealm.NAH_WIESE.fern;
        const [n, l] = [Math.round(F.kachel / F.gitter), F.gitter];
        const N = 3 * n;
        const [H, T] = [new Float32Array(N * N), new Uint8Array(N * N)];
        const chunkKarten = AnazhRealm._wieseKarten([(fx - 1) * F.kachel, (fz - 1) * F.kachel, (fx + 2) * F.kachel, (fz + 2) * F.kachel]); // prettier-ignore
        const nie = [];
        for (let dj = -1; dj <= 1; dj++)
            for (let di = -1; di <= 1; di++) {
                const G = this._wieseFernGitter(fx + di, fz + dj, frist);
                if (!G) return null;
                if (G.nie) nie.push([fx + di, fz + dj]);
                else AnazhRealm._wieseKarten(chunkKarten, G.chunkKarten);
                for (let j = 0; j < n; j++) {
                    const o = ((dj + 1) * n + j) * N + (di + 1) * n;
                    H.set(G.h.subarray(j * n, j * n + n), o);
                    T.set(G.traegt.subarray(j * n, j * n + n), o);
                }
            }
        // die Punkte des Felds, die keine Wiese tragen (Welt-Lage) — die Maske jedes Büschels liest ihren Abstand. DIE KANTE: fällt
        // der Boden zwischen zwei Nachbarn des Gitters steiler, als die Wiese steht (`GRASS_SLOPE.hi` je Kante: Kliff, Stufe, die
        // Wand eines Grabens), trägt keiner von beiden einen Fuß der Ferne
        const [ox, oz] = [(fx - 1) * F.kachel + l / 2, (fz - 1) * F.kachel + l / 2];
        const kante = AnazhRealm.GRASS_SLOPE.hi * l;
        for (let o = 0; o < N * N; o++)
            for (const p of [(o % N) + 1 < N ? o + 1 : -1, o + N < N * N ? o + N : -1])
                if (p >= 0 && Math.abs(H[p] - H[o]) > kante) T[o] = T[p] = 0;
        const maske = [];
        for (let o = 0; o < N * N; o++) if (!T[o]) maske.push(ox + (o % N) * l, oz + Math.floor(o / N) * l);
        // der Boden am Punkt, bilinear — NaN, wo einer der vier Punkte um ihn keinen Boden trägt oder das Feld endet
        const boden = (x, z) => {
            const [u, v] = [(x - ox) / l, (z - oz) / l];
            const [i, j] = [Math.floor(u), Math.floor(v)];
            if (i < 0 || j < 0 || i + 1 >= N || j + 1 >= N) return NaN;
            const o = j * N + i;
            const [fu, fv] = [u - i, v - j];
            return (H[o] * (1 - fu) + H[o + 1] * fu) * (1 - fv) + (H[o + N] * (1 - fu) + H[o + N + 1] * fu) * fv;
        };
        const ACHT = AnazhRealm.WIESE_ACHT;
        const [Gb, E, vl] = [globalThis.__gelaendeCore, this._erdbauLage(), this.state.nahWiese.vorlagen];
        const [x0, x1, z0, z1] = [ox - l / 2, ox + (N - 0.5) * l, oz - l / 2, oz + (N - 0.5) * l];
        const grenze = new Float32Array(bueschel.length);
        for (let q = 0; q < bueschel.length; q++) {
            const b = bueschel[q];
            const [f, gx, gz] = [vl.get(b.vorlage + ":L2").fuss, b.gx || 0, b.gz || 0];
            // die Maske: der Abstand zum Rand des Felds und zum nächsten Punkt ohne Wiese, weniger die Diagonale einer Zelle (ein
            // Gebiet ohne Wiese, das einen Punkt des Gitters trägt, liegt in den Zellen um ihn)
            let R = Math.min(b.x - x0, x1 - b.x, b.z - z0, z1 - b.z);
            let R2 = R * R;
            for (let m = 0; m < maske.length; m += 2) {
                const [dx, dz] = [maske[m] - b.x, maske[m + 1] - b.z];
                if (dx * dx + dz * dz < R2) R2 = dx * dx + dz * dz;
            }
            const sMaske = Math.min(F.streckMax, (Math.sqrt(R2) - l * Math.SQRT2) / (f * b.s));
            // die Ringe der Füße: × 1,25 bis zur Maske, der letzte an ihr
            let g = 1;
            for (let s = 1.25; g < sMaske; s *= 1.25) {
                const sr = Math.min(s, sMaske);
                const rr = f * b.s * sr;
                let ok = !Gb.erdbauGrund(E, b.x, b.z, b.s * (reich + f * (sr - 1)));
                for (let a = 0; ok && a < 16; a += 2)
                    ok = Math.abs(boden(b.x + ACHT[a] * rr, b.z + ACHT[a + 1] * rr) - (b.y + (gx * ACHT[a] + gz * ACHT[a + 1]) * rr)) <= F.boden; // prettier-ignore
                if (!ok) break;
                g = sr;
            }
            grenze[q] = g;
        }
        return { grenze, chunkKarten, nie };
    }

    // DIE SCHALE EINER KACHEL DER FERNE (w22-wiese-nachzug): auf dem Gitter ihres Bodens (`_wieseFernGitter`, die Mitten der
    // Zellen) je Punkt, der Wiese trägt — nie an einer Kante, über die der Boden steiler fällt, als die Wiese steht, nie im Grund
    // eines Hauses — EINE Karte. Alles an ihr zieht der Ort (`_ortZiehung`): Zug 0 über dem Gitter geschichtet ihre Ordnung (das
    // Teil-Gitter wie die Büschel, Element 7 der Matrix), Zug 1 ihre Drehung und Höhe (`hoehe` × 0,8–1,2), Zug 2 und 3 die Saat
    // ihrer Spitzen (Element 3 und 11, die freie vierte Zeile: der Stoff streut daraus je Spitze Höhe, Neigung und Breite,
    // `_wieseSchaleSenke`), Zug 4 ihre Helligkeit (0,88–1,12). Ihr Farbton ist der der Halme an ihrem Ort: das EINE Gesetz der
    // Wiesen-Farbe (`terrain:wiesenTint` über dem Licht der Kronen und der Feuchte, wie `_nahWieseKachelBueschel`). Nach der
    // Ordnung sortiert. Bis dahin standen elf gleiche Spitzen gleicher Höhe und Farbe je Karte (der Tint des ersten Büschels
    // im Fach): in 20–40 m ein Zaun aus hell-gelben Zähnen.
    _wieseSchaleDaten(fx, fz) {
        const F = AnazhRealm.NAH_WIESE.fern,
            S = F.schale;
        const G = this.state.nahWiese.fern.gitter.get(fx + "," + fz);
        const n = Math.round(F.kachel / F.gitter);
        const kante = AnazhRealm.GRASS_SLOPE.hi * F.gitter;
        const [Gb, E, W] = [globalThis.__gelaendeCore, this._erdbauLage(), AnazhRealm._wortAlgebra()];
        const WT = AnazhRealm.Gesetz("terrain:wiesenTint", null) || AnazhRealm._kernPflichtBruch("terrain:wiesenTint");
        const licht = G && !G.nie ? this._bodenLichtFeld(fx * F.kachel, fz * F.kachel, (fx + 1) * F.kachel, (fz + 1) * F.kachel) : null; // prettier-ignore
        const p = [];
        for (let j = 0; licht && j < n; j++)
            for (let i = 0; i < n; i++) {
                const q = j * n + i,
                    y = G.h[q];
                if (!G.traegt[q] || !Number.isFinite(y)) continue;
                const steil = (r) => Math.abs(G.h[r] - y) > kante;
                if ((i + 1 < n && steil(q + 1)) || (i && steil(q - 1)) || (j + 1 < n && steil(q + n)) || (j && steil(q - n))) continue; // prettier-ignore
                const [x, z] = [(fx * n + i + 0.5) * F.gitter, (fz * n + j + 0.5) * F.gitter];
                if (Gb.erdbauGrund(E, x, z, S.breite * 0.5)) continue;
                p.push([AnazhRealm._ortZiehung(W, x, z, 0, F.gitter), x, y, z]);
            }
        p.sort((a, b) => a[0] - b[0]);
        const K = { n: p.length, o: new Float64Array(p.length), x: new Float64Array(p.length), z: new Float64Array(p.length) }; // prettier-ignore
        Object.assign(K, { matrizen: new Float32Array(p.length * 16), farben: new Float32Array(p.length * 3), y0: Infinity, y1: -Infinity }); // prettier-ignore
        p.forEach(([o, x, y, z], m) => {
            const [w, s2, s3, s4] = [1, 2, 3, 4].map((zug) => AnazhRealm._ortZiehung(W, x, z, zug));
            const [c, s, h] = [Math.cos(2 * Math.PI * w), Math.sin(2 * Math.PI * w), S.hoehe * (0.8 + 0.4 * ((w * 977) % 1))]; // prettier-ignore
            K.matrizen.set([c * S.breite, 0, -s * S.breite, s2, 0, h, 0, o, s, 0, c, s3, x, y - 0.05, z, 1], m * 16);
            [K.o[m], K.x[m], K.z[m], K.y0, K.y1] = [o, x, z, Math.min(K.y0, y), Math.max(K.y1, y)];
            const f = WT(x, z, licht(x, z), this._feuchteAt ? this._feuchteAt(x, z, y) : 0, [1, 1, 1], 0);
            const hell = 0.88 + 0.24 * s4;
            K.farben.set([f[0] * hell, f[1] * hell, f[2] * hell], m * 3);
        });
        return K;
    }

    // DIE SENKE DER SCHALE (w22-wiese-nachzug): EINE Senke `nahWiese:Lf:schale` (ein Befehl, die Klasse der Ferne), ihre Karte
    // ein Band und elf Spitzen (13 Dreiecke, die Normale nach oben: das Dach der Wiese, wie der Halm, wenn der Pixel mehrere
    // trägt), unten dunkel, oben in der Helligkeit der Halme (je Spitze 0,78–1); die Albedo die der Vorlage L2 (ihr Stoff, ihre
    // Ecken-Farben). Jede Ecke trägt `aZahn` (ihre Spitze k, ihre Rolle: 0 Band, 1 Fuß links, 2 Fuß rechts, 3 Spitze). Der Stoff
    // streut je Spitze aus der Saat ihrer Karte (Element 3 und 11, `_wieseSchaleDaten`): die Höhe über dem Band 0,75–1,45 der
    // Vorlage (die Karte 0,7 m × 0,8–1,2: die Spitzen 0,5–0,9 m, die Halme der Nah-Wiese 0,48–1,0 m), die Neigung ±0,8
    // Spitzen-Breiten und die Breite ihres Fußes 1,05–1,35 Spitzen-Breiten — die Spitzen überlappen knapp, ihre Kerben liegen,
    // wo zwei Nachbarn sich schneiden, in wechselnder Höhe über dem Band: keine Ober-Kante bleibt eine Linie. Die Streckung
    // (`_wieseSchale`) rückt die Spitzen auseinander und verbreitert jede nur um ihre Wurzel (bis e7faf176 mit ihr: in 30–40 m
    // breite Flocken statt Halme). Er liest die Ordnung der Karte
    // (Element 7) und ihren Abstand zum Auge der Wiese (`_halmFerneAuge`, derselbe Uniform wie der Halm der Ferne): sie steigt
    // über `rampe` m hinter der Übergabe, steht unter dem Anteil (`_wieseSchale`, im Band `rand` sinkt sie wie das Büschel) und
    // ist um 1/Anteil breiter (das Band ganz, die Spitzen in ihrem Abstand). null, solange die Vorlage fehlt.
    _wieseSchaleSenke(vl) {
        const nw = this.state.nahWiese;
        if (nw.schale || !vl || !vl.fern.length) return nw.schale || null;
        const [T, NW] = [THREE.TSL, AnazhRealm.NAH_WIESE];
        const [F, S] = [NW.fern, NW.fern.schale];
        const [pos, hell, zahn] = [[], [], []];
        const ecke = (x, y, h, k, rolle) => (pos.push(x, y, 0), hell.push(h, h, h), zahn.push(k, rolle));
        for (const [x, y, h] of [[-0.5, 0, 0.55], [0.5, 0, 0.55], [0.5, 0.45, 0.78], [-0.5, 0, 0.55], [0.5, 0.45, 0.78], [-0.5, 0.45, 0.78]]) ecke(x, y, h, 0, 0); // prettier-ignore
        const spitze = [1, 0.8, 0.94, 0.72, 0.9, 0.78, 0.98, 0.84, 0.92, 0.75, 0.96];
        for (let k = 0; k < 11; k++) {
            const xa = -0.5 + k / 11;
            ecke(xa, 0.45, 0.78, k, 1);
            ecke(xa + 1 / 11, 0.45, 0.78, k, 2);
            ecke(xa + 1 / 22, spitze[k], 0.78 + (0.22 * ((k * 7) % 11)) / 10, k, 3);
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        geo.setAttribute(
            "normal",
            new THREE.Float32BufferAttribute(
                pos.map((_, i) => +(i % 3 === 1)),
                3
            )
        );
        geo.setAttribute("color", new THREE.Float32BufferAttribute(hell, 3));
        geo.setAttribute("aZahn", new THREE.Float32BufferAttribute(zahn, 2));
        const q = vl.fern[0];
        const c = q.geo.attributes.color;
        const albedo = new THREE.Color(1, 1, 1);
        if (c) {
            const sum = [0, 0, 0];
            for (let i = 0; i < c.count; i++) [sum[0], sum[1], sum[2]] = [sum[0] + c.getX(i), sum[1] + c.getY(i), sum[2] + c.getZ(i)]; // prettier-ignore
            albedo.setRGB(sum[0] / c.count, sum[1] / c.count, sum[2] / c.count);
        }
        if (q.mat.color) albedo.multiply(q.mat.color);
        const mat = new THREE.MeshStandardNodeMaterial({ vertexColors: true, roughness: 1, metalness: 0, side: THREE.DoubleSide }); // prettier-ignore
        mat.color.copy(albedo);
        const naht = this._weltNaht(T);
        const auge = (this._halmFerneAuge = this._halmFerneAuge || T.uniform(new THREE.Vector4()));
        const d = naht.anker.xz.sub(auge.xz).length();
        const g = AnazhRealm._wieseSchale(AnazhRealm._windTsl(T), d);
        const M = this._instanzMatrixNode(T);
        const v = g.anteil.mul(1 + F.rand).sub(M.element(1).w).div(g.anteil.mul(F.rand).max(1e-6)).clamp(0, 1).mul(T.smoothstep(NW.radius, NW.radius + S.rampe, d)); // prettier-ignore
        // die Streuung je Spitze aus der Saat der Karte (Element 3 und 11): drei Zahlen je Spitze k
        const z = T.attribute("aZahn", "vec2");
        const zahl = (salz, saat) => T.fract(T.sin(z.x.add(salz).mul(12.9898).add(saat.mul(78.233))).mul(43758.5453));
        const [hh, hl, hw] = [zahl(1, M.element(0).w), zahl(1, M.element(2).w), zahl(41, M.element(2).w)];
        const [links, rechts, spitz] = [T.step(0.5, z.y).sub(T.step(1.5, z.y)), T.step(1.5, z.y).sub(T.step(2.5, z.y)), T.step(2.5, z.y)]; // prettier-ignore
        const pl = T.positionLocal;
        // die Spitze k um ihre Mitte: die Streckung rückt die Mitten auseinander (× breit), die Spitze selbst wird nur um √breit
        // breiter — sie bleibt von Halm-Breite; das Band trägt die volle Streckung
        const mitte = z.x.add(0.5).div(11).sub(0.5);
        const um = pl.x.sub(mitte).add(spitz.mul(hl.sub(0.5).mul(1.6 / 11))).add(rechts.sub(links).mul(hw.mul(0.3).add(0.05).mul(1 / 22))); // prettier-ignore
        const zahnX = mitte.mul(g.breit).add(um.mul(g.breit.sqrt()));
        const x = T.mix(pl.x.mul(g.breit), zahnX, T.step(0.5, z.y));
        const y = pl.y.add(spitz.mul(pl.y.sub(0.45).mul(hh.mul(0.7).sub(0.25))));
        mat.positionNode = T.vec3(x, y.mul(v), pl.z);
        const a = { key: "schale", name: "nahWiese:Lf:schale", geo, mat, lokal: new THREE.Matrix4(), leafKey: null, quelle: null, mesh: null, kap: 0, anzahl: 0, anders: false, wachse: 0 }; // prettier-ignore
        this._senkeMesh(a, 1024, this.state.scene);
        nw.senken.set(a.key, a);
        return (nw.schale = a);
    }

    // DER BLOCK einer Kachel der Ferne je Vorlage v: ihre Büschel dieser Vorlage (Lage, Ordnung, Skala, Hang, die Grenze ihrer
    // Streckung — die Kugel des gestreckten Büschels im Sicht-Satz), je Teil der Ferne die Matrizen (Basis × Teil) und der Tint
    // — gebaut, wenn die Kachel oder die Vorlage neu kommt; der Sicht-Satz kopiert nur. DIE GRENZE REIST IN DER MATRIX
    // (w21-wiese-fern): die vierte Zeile einer Instanz-Matrix ist frei — r184 nimmt von `M × (Lage, 1)` nur xyz (die Senke,
    // `_senkenKnoten`; die Normale liest die 3 × 3), die Arena kopiert alle 16 Zahlen —, ihr erstes Feld (Element 3) trägt die
    // Grenze des Büschels, der Stoff der Ferne liest sie dort (`_halmFerne`). Fehlt einem Büschel die Grenze, bricht der Block laut.
    _nahWieseFernBlock(k, v, vl) {
        const alt = k.bloecke[v];
        if (alt && alt.flat === vl.flat) return alt;
        const m4 = this._tmpWieseM4 || (this._tmpWieseM4 = new THREE.Matrix4());
        const mw = this._tmpWieseM4b || (this._tmpWieseM4b = new THREE.Matrix4());
        const idx = [];
        for (let i = 0; i < k.bueschel.length; i++) if (k.bueschel[i].vorlage === v) idx.push(i);
        const [n0, F64] = [idx.length, Float64Array];
        const B = { flat: vl.flat, o: new F64(n0), x: new F64(n0), y: new F64(n0), z: new F64(n0), s: new F64(n0), g: new F64(n0), gx: new F64(n0), gz: new F64(n0), grenze: new F64(n0), farben: new Float32Array(n0 * 3) }; // prettier-ignore
        B.matrizen = vl.fern.map(() => new Float32Array(n0 * 16));
        idx.forEach((i, n) => {
            const gr = k.grenze ? k.grenze[i] : NaN;
            if (!(gr >= 1)) throw new Error(`Nah-Wiese: ein Büschel der Ferne (${k.mx}, ${k.mz}) ohne die Grenze seiner Streckung`); // prettier-ignore
            B.grenze[n] = gr;
            const b = k.bueschel[i];
            [B.o[n], B.x[n], B.y[n], B.z[n], B.s[n], B.gx[n], B.gz[n]] = [
                b.o,
                b.x,
                b.y,
                b.z,
                b.s,
                b.gx || 0,
                b.gz || 0,
            ];
            B.g[n] = Math.hypot(B.gx[n], B.gz[n]);
            B.farben.set(k.farben.subarray(i * 3, i * 3 + 3), n * 3);
            m4.fromArray(k.basis, i * 16);
            vl.fern.forEach((a, j) => {
                B.matrizen[j].set(mw.multiplyMatrices(m4, a.lokal).elements, n * 16);
                B.matrizen[j][n * 16 + 3] = gr;
            });
        });
        // die Lage seiner Füße (die Schranke je Block im Sicht-Satz, `_wieseFernSchranke`): ihr Rechteck, ihre Höhe, ihre Hänge
        Object.assign(B, { x0: Infinity, x1: -Infinity, z0: Infinity, z1: -Infinity, y0: Infinity, y1: -Infinity }); // prettier-ignore
        Object.assign(B, { gx0: Infinity, gx1: -Infinity, gz0: Infinity, gz1: -Infinity });
        for (let n = 0; n < n0; n++) {
            [B.x0, B.x1] = [Math.min(B.x0, B.x[n]), Math.max(B.x1, B.x[n])];
            [B.z0, B.z1] = [Math.min(B.z0, B.z[n]), Math.max(B.z1, B.z[n])];
            [B.y0, B.y1] = [Math.min(B.y0, B.y[n]), Math.max(B.y1, B.y[n])];
            [B.gx0, B.gx1] = [Math.min(B.gx0, B.gx[n]), Math.max(B.gx1, B.gx[n])];
            [B.gz0, B.gz1] = [Math.min(B.gz0, B.gz[n]), Math.max(B.gz1, B.gz[n])];
        }
        k.bloecke[v] = B;
        return B;
    }

    // Die Daten einer Kachel (Kante K, die Ferne trägt ihre eigene): je Büschel die Basis-Matrix (Ort · Hang · Drehung · Skala
    // — die Welt-Skala des Studio-Teils hängt der Sicht-Satz an) und sein Tint (`farben`, n×3), die Hysterese der Stufe (`l1`)
    // und die Kachel-Kugel ohne Büschel-Radius (grober Cull vor dem Büschel-Test). DER HANG (w4-gras-l2): das Büschel steht
    // auf der Ebene seines Hangs (der Gradient gx, gz aus `_slopeAt`, den die Platzierung ohnehin liest) — y += gx·x + gz·z
    // über seiner Fläche, die Halme bleiben lotrecht. Bis dahin lag der Fuß jedes Büschels waagrecht in der Höhe seiner Mitte:
    // für die Nähe (0,5 m Radius) wenige Zentimeter, für die gestreckte Ferne (bis 7,4 m) an der Mess-Wiese p90 0,5–1,0 m Luft
    // oder Boden über den Halmen, an der Ebene 0,07–0,29 m (Gesetz, 30–200 m im Blick der Station).
    _nahWieseKachelDaten(tx, tz, bueschel, K = AnazhRealm.NAH_WIESE.kachel) {
        const n = bueschel.length;
        const basis = new Float32Array(n * 16);
        const farben = new Float32Array(n * 3);
        const m4 = this._tmpWieseM4 || (this._tmpWieseM4 = new THREE.Matrix4());
        const q = this._tmpWieseQ || (this._tmpWieseQ = new THREE.Quaternion());
        const pv = this._tmpWieseP || (this._tmpWieseP = new THREE.Vector3());
        const sv = this._tmpWieseS || (this._tmpWieseS = new THREE.Vector3());
        const up = this._tmpWieseUp || (this._tmpWieseUp = new THREE.Vector3(0, 1, 0));
        let y0 = Infinity,
            y1 = -Infinity,
            sMax = 0,
            gMax = 0;
        for (let i = 0; i < n; i++) {
            const b = bueschel[i];
            pv.set(b.x, b.y, b.z);
            q.setFromAxisAngle(up, b.rot);
            sv.set(b.s, b.s, b.s);
            const e = m4.compose(pv, q, sv).elements;
            const [gx, gz] = [b.gx || 0, b.gz || 0];
            for (let c = 0; c < 3; c++) e[4 * c + 1] += gx * e[4 * c] + gz * e[4 * c + 2];
            m4.toArray(basis, i * 16);
            farben.set(b.f, i * 3);
            if (b.y < y0) y0 = b.y;
            if (b.y > y1) y1 = b.y;
            if (b.s > sMax) sMax = b.s;
            gMax = Math.max(gMax, Math.hypot(gx, gz));
        }
        return {
            bueschel,
            basis,
            farben,
            l1: new Uint8Array(n),
            mx: (tx + 0.5) * K,
            mz: (tz + 0.5) * K,
            y0: n ? y0 : 0,
            y1: n ? y1 : 0,
            sMax,
            gMax,
        };
    }

    // Die Senken einer Vorlage × Stufe: je Studio-Teil EINE InstancedMesh für den ganzen Ring (`nahWiese:L<stufe>:<v>:<p>`,
    // ein oberster Knoten der Szene — die Täter-Klasse faltet den Namen auf `nahWiese:L<stufe>`, die Band-Linse nennt jede
    // Stufe beim Namen). Sie hält die Studio-Geometrie ihres Teils (`_liveRefs` der Cache-Gruppe), solange sie lebt; ein neues Studio-Asset
    // (Saison) ersetzt die Senken der Vorlage. Die Sicht-Kugel der Vorlage: Höhe der Mitte und Radius in Büschel-Skala 1
    // (die waagrechte Lage der Mitte geht in den Radius — der Büschel dreht um die Hochachse). Ihre WEITE: die weiteste Ecke
    // um den Fuß, waagrecht, je Büschel-Skala 1 — jede Ecke jedes Teils in seiner lokalen Matrix (die Weite der Büschel,
    // `nahWiese.reich`, liest sie).
    _nahWieseSenken(v, stufe, fl) {
        const nw = this.state.nahWiese;
        const kopf = `${v}:L${stufe}`;
        const alt = nw.vorlagen.get(kopf);
        if (alt && alt.flat === fl) return;
        if (alt) for (const a of alt.senken.concat(alt.fern)) this._nahWieseSenkeFaellt(a);
        const kugel = this._tmpWieseKugel || (this._tmpWieseKugel = new THREE.Sphere());
        const ecke = this._tmpWieseEcke || (this._tmpWieseEcke = new THREE.Vector3());
        const senken = [];
        // DIE FERNE zeichnet die Stufe L2 derselben Vorlage (`nahWiese:Lf:<v>:<teil>` — eine Stufe der Nah-Wiese, die Boden-Schicht
        // wie sie; ihr Stoff `_halmFerne`); ihre
        // Ordnung liest der Stoff am Ursprung der Instanz — der Teil darf ihn nicht verschieben (sonst trüge jeder Teil eines
        // Büschels eine andere Ordnung als die, nach der die Kachel sie wählte)
        const fern = [];
        let cy = null,
            r = 0,
            weite = 0,
            fuss = 0,
            breite = 0;
        for (let p = 0; p < fl.leaves.length; p++) {
            const lf = fl.leaves[p];
            if (!lf || !lf.geom || !lf.mat)
                throw new Error(
                    `Nah-Wiese: Vorlage ${kopf} Teil ${p} ohne Geometrie oder Stoff — kein stiller Ausfall`
                );
            const senke = (key, name, mat) => {
                const a = { key, name, geo: lf.geom, mat, lokal: lf.localMatrix, leafKey: lf.leafKey, quelle: lf._srcGroup || null, mesh: null, kap: 0, anzahl: 0, anders: false, wachse: 0 }; // prettier-ignore
                if (a.quelle) a.quelle._liveRefs = (a.quelle._liveRefs || 0) + 1;
                this._senkeMesh(a, 256, this.state.scene);
                nw.senken.set(a.key, a);
                return a;
            };
            senken.push(senke(`${kopf}:${p}`, `nahWiese:L${stufe}:${v}:${p}`, lf.mat));
            if (stufe === 2) {
                const e = lf.localMatrix.elements;
                if (e[12] !== 0 || e[13] !== 0 || e[14] !== 0)
                    throw new Error(`Nah-Wiese: Vorlage ${kopf} Teil ${p} verschiebt ihren Ursprung — die Ferne liest seine Ordnung dort`); // prettier-ignore
                // die Ebene des Hangs liest der Stoff aus den waagrechten Achsen der Instanz (`_halmFerne`): das Teil dreht nur
                // um die Hochachse
                if (Math.max(Math.abs(e[1]), Math.abs(e[4]), Math.abs(e[6]), Math.abs(e[9])) > 1e-6 * Math.abs(e[5]))
                    throw new Error(`Nah-Wiese: Vorlage ${kopf} Teil ${p} kippt die Hochachse — die Ferne liest den Hang aus ihren waagrechten Achsen`); // prettier-ignore
                AnazhRealm._wieseAehrenFuss(lf.geom, kopf);
                fern.push(senke(`fern:${v}:${p}`, `nahWiese:Lf:${v}:${p}`, this._halmFerne(lf.mat)));
                // DER WEITESTE FUSS eines Halms um den Fuß des Büschels (je Büschel-Skala 1, in der Lage des Teils): so weit spreizt
                // die Ferne ihre Halme je Streckung (`_halmFerne`), die Grenze der Streckung misst an ihm (`_wieseFernGrenzen`); die
                // halbe BREITE eines Halms (uv.x Adern × aderM, Meter je Skala 1): um sie × (s − 1) wird er quer breiter
                const [C, UV] = [lf.geom.attributes.aCenter, lf.geom.attributes.uv];
                for (let i = 0; i < C.count; i++) {
                    if (C.getY(i) > 1e-4) continue;
                    fuss = Math.max(fuss, Math.hypot(e[0] * C.getX(i) + e[8] * C.getZ(i), e[2] * C.getX(i) + e[10] * C.getZ(i))); // prettier-ignore
                    breite = Math.max(breite, Math.abs(UV.getX(i)) * globalThis.__phytoCore.HALM_GESETZ.aderM);
                }
            }
            if (!lf.geom.boundingSphere) lf.geom.computeBoundingSphere();
            kugel.copy(lf.geom.boundingSphere).applyMatrix4(lf.localMatrix);
            if (cy === null) cy = kugel.center.y;
            r = Math.max(r, kugel.radius + Math.hypot(kugel.center.x, kugel.center.z) + Math.abs(kugel.center.y - cy));
            for (let i = 0, P = lf.geom.attributes.position; i < P.count; i++) {
                ecke.fromBufferAttribute(P, i).applyMatrix4(lf.localMatrix);
                weite = Math.max(weite, Math.hypot(ecke.x, ecke.z));
            }
        }
        if (stufe === 2 && !(fuss > 0))
            throw new Error(
                `Nah-Wiese: Vorlage ${kopf} trägt keinen Fuß eines Halms — die Grenze der Ferne misst an ihm`
            );
        nw.vorlagen.set(kopf, { flat: fl, senken, fern, cy: cy || 0, r, weite, fuss, breite });
        nw.neu = true;
    }

    // DIE ÄHRE AM FUSS IHRES STÄNGELS (die Ferne, `_halmFerne`): das Studio legt den Anker der Ähre (`aCenter`) auf die Spitze
    // ihres Stängels — die Spitze ist eine Ecke des Stängels, dessen Anker sein Fuß ist. Die Ferne spreizt jeden Halm um seinen
    // Fuß; die Ähre wandert mit ihrem Stängel, also trägt ihr Anker den Fuß des Stängels in der Höhe seiner Spitze (y > 0
    // bleibt die Marke der Ähre). EINMAL je Vorlage (`userData.aehrenFuss`), vor dem ersten Bild; eine Ähre ohne Stängel, eine
    // Vorlage ohne Ecken bricht laut. Bis w14-wiese-saum streckte die Ferne die Ähre um ihre Spitze (Schale ohne Ecken: um 0).
    static _wieseAehrenFuss(geo, kopf) {
        if (geo.userData.aehrenFuss) return;
        const P = geo.attributes.position,
            C = geo.attributes.aCenter;
        if (!C)
            throw new Error(
                `Nah-Wiese: Vorlage ${kopf} ohne Ecken (aCenter) — die Ferne spreizt ihre Halme um ihre Füße`
            );
        const fuss = new Map();
        const k = (x, y, z) => x + "|" + y + "|" + z;
        for (let i = 0; i < P.count; i++)
            if (!(C.getY(i) > 1e-4)) fuss.set(k(P.getX(i), P.getY(i), P.getZ(i)), [C.getX(i), C.getZ(i)]);
        for (let i = 0; i < C.count; i++) {
            if (!(C.getY(i) > 1e-4)) continue;
            const f = fuss.get(k(C.getX(i), C.getY(i), C.getZ(i)));
            if (!f) throw new Error(`Nah-Wiese: Vorlage ${kopf} trägt eine Ähre ohne Stängel (Anker ${C.getX(i)}, ${C.getY(i)}, ${C.getZ(i)})`); // prettier-ignore
            C.setX(i, f[0]);
            C.setZ(i, f[1]);
        }
        (C.isInterleavedBufferAttribute ? C.data : C).needsUpdate = true;
        geo.userData.aehrenFuss = true;
    }

    // Eine Senke fällt (ihre Vorlage wurde ersetzt): die Mesh verlässt die Szene, die Studio-Referenz geht zurück — war
    // die Cache-Gruppe geräumt (LRU), fällt ihre Geometrie jetzt.
    _nahWieseSenkeFaellt(a) {
        const nw = this.state.nahWiese;
        if (a.mesh) {
            if (a.mesh.parent) a.mesh.parent.remove(a.mesh);
            this._instanzAbschied(a.mesh);
            a.mesh = null;
        }
        nw.senken.delete(a.key);
        this._foundryLoslassen(a.quelle);
    }

    // DER SICHT-SATZ (`_passSicht`, der Haupt-Pass jedes Frames, vor der Projektion): je Büschel diesseits der Übergabe
    // (`radius`) die Stufe (L1 im Kreis `stufe1` um das Auge, Austritt erst `stufe1Rand` dahinter) und die Sicht (die Kachel
    // als Box, das Büschel als Kugel nach dem EINEN Gesetz der Pass-Wahl `_passTrifft` in der Lage dieses Passes `L`); jede
    // Senke trägt dicht genau ihre sichtbaren Büschel. Jenseits legt er DIE FERNE: je Kachel der Ferne im Pass ihre Büschel unter
    // dem Anteil (unten) — dasselbe Auge reicht er ihrem Stoff (`_halmFerneAuge`), die Übergabe ist für beide derselbe Kreis. Bis
    // w4-gras-saum dünnte hier ein Rand-Band (12–16 m) die Nah-Wiese aus: dahinter stand der flache Boden, die Kante wanderte
    // mit jedem Schritt. Die Büschel sind Daten der Kacheln, keine Instanzen einer Gruppe: der Satz schreibt ihre Matrizen, und
    // er rechnet nur, wenn sich der Ring (`neu`) oder die Lage des Passes ändert — ihre Generation `L.gen` (`_passLageGen`, das
    // EINE Gesetz der Lage: nie wegen des Versatzes der zeitlichen Auflösung, nie wegen des atmenden Auges; den Rand dafür
    // trägt das Gesetz).
    _nahWieseSicht(kamera, L) {
        const nw = this.state.nahWiese;
        if (!nw || !kamera || !nw.senken.size) return;
        if (!L || !L.fr || !L.fr.planes)
            throw new Error("_nahWieseSicht: ohne die Lage der Pass-Wahl (`_passWahlLage` in `_passSicht`)");
        if (!nw.neu && nw.gen === L.gen) return;
        nw.neu = false;
        nw.gen = L.gen;
        const NW = AnazhRealm.NAH_WIESE;
        const we = kamera.matrixWorld.elements;
        // Je Stufe × Vorlage die Senken samt Sicht-Kugel (fehlt eine, kommt ihr Studio-Asset noch).
        const ziel = [null, [null, null], [null, null]];
        let rMax = 0;
        for (const stufe of [1, 2])
            for (let v = 0; v < 2; v++) {
                const vl = nw.vorlagen.get(`${v}:L${stufe}`) || null;
                ziel[stufe][v] = vl;
                if (vl && vl.r + Math.abs(vl.cy) > rMax) rMax = vl.r + Math.abs(vl.cy);
            }
        // Jede Senke hebt ihre Version nur, wenn sich ihr Inhalt änderte (K71): eine neue Lage des Passes, die dieselben
        // Büschel wählt (der Spieler atmet in der Third-Sicht), schreibt dieselben Matrizen — eine gehobene Version frischte
        // jede Senke voll auf und lud ihren Puffer neu (an der Wiese in Ruhe vier Senken je vierten Frame).
        for (const a of nw.senken.values()) {
            a.anzahl = 0;
            a.anders = false;
        }
        const m4 = this._tmpWieseM4 || (this._tmpWieseM4 = new THREE.Matrix4());
        const mw = this._tmpWieseM4b || (this._tmpWieseM4b = new THREE.Matrix4());
        const ax = we[12];
        const az = we[14];
        // die Stufen-Hysterese gilt dem stetigen Auge: nach einem Sprung (`_augeSprung`) wählt jedes Büschel aus dem Jetzt
        if (this._augeSprung(nw, ax, we[13], az)) for (const k of nw.kacheln.values()) k.l1.fill(0);
        const H = NW.kachel * 0.5;
        for (const k of nw.kacheln.values()) {
            const n = k.bueschel.length;
            // die Kugel des Büschels wächst mit seinem Hang (y += g · r über seiner Fläche)
            const rk = k.sMax * rMax * (1 + k.gMax);
            if (!n || !this._passTrifft(L, k.mx, (k.y0 + k.y1) / 2, k.mz, H, (k.y1 - k.y0) / 2, H, rk)) continue;
            for (let i = 0; i < n; i++) {
                const b = k.bueschel[i];
                const d = Math.hypot(b.x - ax, b.z - az);
                if (d >= NW.radius) continue; // jenseits legt die Ferne dasselbe Büschel
                const l1 = this._nahStufe(NW.stufe1, NW.stufe1Rand, d, k.l1[i]);
                k.l1[i] = l1 ? 1 : 0;
                const vl = ziel[l1 ? 1 : 2][b.vorlage];
                if (!vl || !this._passTrifft(L, b.x, b.y + vl.cy * b.s, b.z, 0, 0, 0, vl.r * b.s * (1 + Math.hypot(b.gx || 0, b.gz || 0)))) continue; // prettier-ignore
                m4.fromArray(k.basis, i * 16);
                for (const a of vl.senken) {
                    if (a.anzahl >= a.kap) {
                        this._senkeMesh(a, Math.ceil(a.kap * 1.5), this.state.scene);
                        a.anders = true;
                    }
                    const e = mw.multiplyMatrices(m4, a.lokal).elements;
                    const arr = a.mesh.instanceMatrix.array;
                    const o = a.anzahl * 16;
                    for (let j = 0; j < 16; j++) {
                        const alt = arr[o + j];
                        arr[o + j] = e[j];
                        if (arr[o + j] !== alt) a.anders = true;
                    }
                    // der Tint des Büschels (W1): ein anderer Tint im Slot ist ein anderes Büschel, also eine andere Matrix
                    const ca = a.mesh.instanceColor.array;
                    ca[a.anzahl * 3] = k.farben[i * 3];
                    ca[a.anzahl * 3 + 1] = k.farben[i * 3 + 1];
                    ca[a.anzahl * 3 + 2] = k.farben[i * 3 + 2];
                    a.anzahl++;
                }
            }
        }
        // DIE FERNE: je Kachel der Ferne, die der Pass trifft (ihr Rand trägt die gestreckten Büschel), jedes ihrer Büschel
        // jenseits der Übergabe, dessen Ordnung unter dem Anteil seines Fußabdrucks liegt (das Gesetz `_wieseFern` am
        // Fußabdruck-Abstand `_wieseFuss`, samt dem Band, in dem es sinkt) und dessen gestreckte Kugel der Pass trifft (Radius ×
        // s: bis w4-gras-l2 zog die Kachel jedes ihrer Büschel, auch die neben dem Blick) — seine Matrizen stehen im Block der
        // Kachel, der Satz kopiert nur; wie weit es sich streckt und wie hoch es steht, rechnet der Stoff am Auge dieses Passes
        // (`_halmFerneAuge`: die Lage und die Höhe über dem eigenen Boden, `_wieseAuge`) mit derselben Rechnung; die Breite
        // seiner Halme liest den Pixel der Szene (`_halmFernePixel`: der EINE Schirm `_schirm` × die Szenen-Skala)
        const schale = this._wieseSchaleSenke(ziel[2][0]);
        const auge = this._wieseAuge({ x: ax, y: we[13], z: az });
        if (this._halmFerneAuge) this._halmFerneAuge.value.set(ax, we[13], az, auge.h);
        if (this._halmFernePixel) {
            const pxJeM = this._schirm().pxJeM;
            this._halmFernePixel.value = pxJeM > 0 ? 1 / (pxJeM * this._szeneSkalaWirk()) : 0;
        }
        const F = NW.fern;
        const HF = F.kachel * 0.5;
        const [ZAHLEN, TF] = [globalThis.__phytoCore.WIND_ZAHLEN, AnazhRealm.WIESE_FERN_TAFEL];
        for (const k of nw.fern ? nw.fern.kacheln.values() : []) {
            if (!k.bueschel.length || !this._passTrifft(L, k.mx, (k.y0 + k.y1) / 2, k.mz, HF, (k.y1 - k.y0) / 2, HF, k.sMax * rMax * k.grenzeMax * (1 + k.gMax))) continue; // prettier-ignore
            for (let v = 0; v < 2; v++) {
                const vl = ziel[2][v];
                if (!vl || !vl.fern.length) continue;
                const B = this._nahWieseFernBlock(k, v, vl);
                if (!B.o.length) continue;
                // DIE SCHRANKE (w4-wiese-takt): die Ordnung o steht im Block aufsteigend — über der Schranke seiner Lage
                // (`_wieseFernSchranke`: der höchste Anteil, den das Gesetz einem seiner Büschel an diesem Auge gibt) steht kein
                // Büschel mehr (Abbruch). Je Büschel sein Fußabdruck-Abstand Q, an ihm die Tafel (`WIESE_FERN_TAFEL`, die Stützen
                // um Q): o über dem Anteil der nahen Stütze fehlt sicher, o unter dem der fernen steht sicher (diesseits des
                // Saums); die Kugel des Büschels wächst mit der Streckung, also trifft sie sicher mit der Streckung der nahen
                // Stütze und fehlt sicher mit der der fernen — nur im Spalt fragt er das Gesetz selbst. Dieselbe Rechnung,
                // dieselbe Wahl; bis dahin rief jedes ferne Büschel je Satz `_wieseFern` (an der Mess-Wiese Ego ~5 900 Rufe,
                // 8,7 ms je Satz im Gehen, Radeon).
                const oHoch = AnazhRealm._wieseFernSchranke(B, auge, 0) * 1.001;
                for (let i = 0; i < B.o.length && B.o[i] < oHoch; i++) {
                    const d = Math.hypot(B.x[i] - ax, B.z[i] - az);
                    if (d < NW.radius - 0.01) continue;
                    const Q = AnazhRealm._wieseFuss(ZAHLEN, B.x[i] - ax, B.y[i] - we[13], B.z[i] - az, -B.gx[i], 1, -B.gz[i], auge.h); // prettier-ignore
                    const j = Math.floor(Q * TF.je);
                    let sU = 0, // die Streckung zwischen sU und sO (gleich: die des Gesetzes)
                        sO = 0;
                    if (j + 1 < TF.anteil.length) {
                        if (B.o[i] >= TF.anteil[j] * (1 + F.rand) * 1.001) continue;
                        if (d <= F.bis - F.saum && B.o[i] < TF.anteil[j + 1] * (1 + F.rand) * 1.001) {
                            sU = TF.streck[j];
                            sO = TF.streck[j + 1];
                        }
                    }
                    if (!sU) {
                        const g = AnazhRealm._wieseFern(ZAHLEN, d, Q);
                        if (B.o[i] >= g.anteil * (1 + F.rand) * 1.001) continue;
                        sU = sO = g.streck;
                    }
                    // die Kugel trägt die Spreizung der Füße: sie endet an der Grenze des Büschels (`_wieseFernGrenzen`; der Stoff
                    // liest dieselbe Zahl), dazu die Breite der Halme (quer um s − 1, `breite` der Vorlage)
                    const gr = B.grenze[i];
                    const cy = B.y[i] + vl.cy * B.s[i],
                        r0 = vl.r * B.s[i],
                        rb = vl.breite * B.s[i];
                    const kugel = (s) => r0 * Math.min(s, gr) * (1 + B.g[i]) + rb * (s - 1);
                    if (!this._passTrifft(L, B.x[i], cy, B.z[i], 0, 0, 0, kugel(sO))) continue;
                    if (sO !== sU && !this._passTrifft(L, B.x[i], cy, B.z[i], 0, 0, 0, kugel(sU))) {
                        const s = AnazhRealm._wieseFern(ZAHLEN, d, Q).streck;
                        if (!this._passTrifft(L, B.x[i], cy, B.z[i], 0, 0, 0, kugel(s))) continue;
                    }
                    // je Teil der Slot des Büschels (ohne Hülle je Büschel: der Satz läuft in jedem Frame, das das Auge bewegt)
                    for (let j = 0; j < vl.fern.length; j++) {
                        const a = vl.fern[j];
                        if (a.anzahl >= a.kap) {
                            this._senkeMesh(a, Math.ceil(a.kap * 1.5), this.state.scene);
                            a.anders = true;
                        }
                        const arr = a.mesh.instanceMatrix.array;
                        const M = B.matrizen[j];
                        const o = a.anzahl * 16;
                        for (let q = 0; q < 16; q++)
                            if (arr[o + q] !== M[i * 16 + q]) ((arr[o + q] = M[i * 16 + q]), (a.anders = true));
                        const ca = a.mesh.instanceColor.array;
                        for (let q = 0; q < 3; q++) ca[a.anzahl * 3 + q] = B.farben[i * 3 + q];
                        a.anzahl++;
                    }
                }
            }
        }
        // DIE SCHALE (w22-wiese-nachzug): je Kachel der Ferne, die der Pass trifft, ihre Karten jenseits der Übergabe, deren
        // Ordnung unter dem Anteil der Schale an ihrem Abstand liegt (`_wieseSchale`, samt dem Band, in dem sie sinkt; o steht
        // aufsteigend — über dem Anteil der Übergabe steht keine mehr) — der Satz kopiert ihre Matrizen und ihren Tint
        for (const k of schale && nw.fern ? nw.fern.kacheln.values() : []) {
            const K = k.schale;
            if (!K || !K.n || !this._passTrifft(L, k.mx, (K.y0 + K.y1) / 2, k.mz, HF, (K.y1 - K.y0) / 2 + 1, HF, 2 * F.schale.breitMax)) continue; // prettier-ignore
            for (let i = 0; i < K.n && K.o[i] < 1 + F.rand; i++) {
                const d = Math.hypot(K.x[i] - ax, K.z[i] - az);
                if (d < NW.radius) continue;
                const g = AnazhRealm._wieseSchale(ZAHLEN, d);
                if (K.o[i] >= g.anteil * (1 + F.rand) * 1.001) continue;
                // die Karte als Kugel (ihre halbe Breite × Breiten-Faktor, ihre Höhe) im Pass
                const r = 0.5 * F.schale.breite * g.breit + F.schale.hoehe;
                if (!this._passTrifft(L, K.x[i], K.matrizen[i * 16 + 13] + F.schale.hoehe / 2, K.z[i], 0, 0, 0, r)) continue; // prettier-ignore
                if (schale.anzahl >= schale.kap) {
                    this._senkeMesh(schale, Math.ceil(schale.kap * 1.5), this.state.scene);
                    schale.anders = true;
                }
                const [arr, o] = [schale.mesh.instanceMatrix.array, schale.anzahl * 16];
                for (let q = 0; q < 16; q++)
                    if (arr[o + q] !== K.matrizen[i * 16 + q])
                        ((arr[o + q] = K.matrizen[i * 16 + q]), (schale.anders = true));
                for (let q = 0; q < 3; q++)
                    schale.mesh.instanceColor.array[schale.anzahl * 3 + q] = K.farben[i * 3 + q];
                schale.anzahl++;
            }
        }
        // Der Vergleich liest das CPU-Array als Spiegel der GPU: ein offener Bereich (geschrieben, noch nicht hochgeladen —
        // r184 leert die Bereiche erst nach dem Upload) fällt darum nie, der neue umfasst ihn (sonst lüde ein späterer Pass mit
        // denselben Bytes in den oberen Slots nichts, und die GPU hielte die Matrizen von vorher).
        for (const a of nw.senken.values()) {
            if (a.anders) {
                const im = a.mesh.instanceMatrix;
                let ende = a.anzahl * 16;
                for (const r of im.updateRanges) if (r.start + r.count > ende) ende = r.start + r.count;
                im.clearUpdateRanges();
                if (ende) im.addUpdateRange(0, ende);
                im.needsUpdate = true;
                // der Tint wandert im Gleichschritt mit der Matrix (je Slot 3 statt 16 Werte) — nur der Bereich, nie die Kapazität
                const ic = a.mesh.instanceColor;
                ic.clearUpdateRanges();
                if (ende) ic.addUpdateRange(0, (ende / 16) * 3);
                ic.needsUpdate = true;
            }
            AnazhRealm._instanzZahl(a.mesh, a.anzahl);
        }
    }

    // ═══ DIE NAH-STREU (Waldboden 04.10.) ═══
    // Nah am Auge wächst der Boden aus dem Pflanzen-Studio: Farn · Gestrüpp · Blume · Schilf · liegendes Totholz ·
    // Stumpf · Geröll, gesetzt nach dem EINEN Boden-Gesetz (`placement.boden`, ring "nah"; Auswerter
    // `__phytoCore.bodenGewicht` — derselbe, mit dem der Labor-Wald pflanzt) und gebaut über die Foundry
    // (`_foundryFlattenFor`: kindStages · budget.gestalten). Der Host erzeugt keine Gestalt — der Klein-Vegetations-
    // Zwilling (eigene Strip-/Kreuz-Geometrie je Art, Deko-Fernfeld, Deck-Streu) ist gefallen. Kosten an den SCHIRM
    // gebunden: ein Kachel-Ring um die Kamera (NAH_STREU), L0 im Armlängen-Kreis (`stufe0`), jenseits die leichte
    // Stufe der Art, das Rand-Band dünnt. Je Art × Gestalt × Stufe × Teil EINE Senke `streuNah:…` (die Daten des
    // Rings), eine Kachel ist ein BLOCK darin; gezeichnet wird je STOFF (W7): jeder Block ist ein Bereich im Streu-Satz
    // seines Stoffs, das Frustum jedes Passes wählt je Pflanze (`_streuSatzArt`). Jenseits des Rings trägt der Boden
    // (Boden-Farbe) und die Strauch-/Blumen-Schicht der Streu-Regionen.
    static get NAH_STREU() {
        return this._einmal(
            "NAH_STREU",
            Object.freeze({ kachel: 4, zelle: 2, stufe0: 3.5, radius: 24, rand: 5, kachelnJeTakt: 3 })
        );
    }

    // Was eine Boden-Art beim Pflücken gibt — Spieler-Ökonomie, keine Gestalt: je Studio-kind.
    static get STREU_ERNTE() {
        return this._einmal(
            "STREU_ERNTE",
            Object.freeze({
                fern: "kraut",
                reed: "kraut",
                brush: "kraut",
                flower: "kraut",
                grass: "kraut", // die Büschel der Nah-Wiese — sie gibt nur die Mahd (halten.K3), die Hand pflückt kein Gras
                rock: "stein",
                deadwood: "holz",
            })
        );
    }

    // Die Arten der Nah-Streu: die Boden-Zeilen mit ring "nah", deren Preset das LIVE-Buch trägt, nach Namen
    // sortiert (die Wurf-Reihenfolge ist Daten-Identität). null, solange Buch oder Render-Config fehlen — die Streu
    // wartet, sie rät nie.
    _nahStreuArten() {
        const cfg = AnazhRealm._studioRenderConfig;
        const buch = this._foundry ? this._foundry.recipes : null;
        if (!cfg || !buch) return null;
        // Buch und Render-Config docken in EINER Nachricht: steht beides, ist ein fehlendes Boden-Gesetz oder eine
        // Boden-Zeile ohne Rezept ein KERN-PFLICHT-Bruch (laut), nie eine still leere Nah-Streu.
        const boden = cfg.placement ? cfg.placement.boden : null;
        if (!boden) return AnazhRealm._kernPflichtBruch("phyto:placement.boden");
        const c = this._nahStreuArtenCache;
        if (c && c.boden === boden && c.buch === buch) return c.arten;
        const arten = [];
        for (const id of Object.keys(boden).sort()) {
            const zeile = boden[id];
            if (!zeile || zeile.ring !== "nah") continue;
            const rec = buch[id];
            if (!rec) return AnazhRealm._kernPflichtBruch("phyto:placement.boden." + id + " (kein Rezept im Buch)");
            // Die Weite der Art (Studio-Zeile `weite`, m): kleine Arten enden früher, keine reicht über den Ring.
            const weite = Math.min(AnazhRealm.NAH_STREU.radius, Number.isFinite(zeile.weite) ? zeile.weite : Infinity);
            arten.push({ id, zeile, kind: rec.kind, ernte: AnazhRealm.STREU_ERNTE[rec.kind] || null, weite });
        }
        this._nahStreuArtenCache = { boden, buch, arten };
        return arten;
    }

    // Das Gewicht einer Nah-Streu-Art nach dem Boden-Gesetz (`core.bodenGewicht`) über der Höhe über dem Wasser: das
    // Ufer-Band (Schilf) über beiden Bezügen — See/Meer voll, der Fluss mit seiner Kronen-Blende, das Maximum (stetig über
    // die Krone, wie Strand und Schlick in `_bodenFarbeAt`); jede andere Art über der EINEN Wahrheit am Körper (`u.ufer` =
    // Boden − `_koerperWasser`). `uf` = `_waterLevelAt(x, z, aus)`, `y` der Boden.
    _nahStreuBodenGewicht(core, zeile, u, uf, y) {
        if (!zeile.ufer) return core.bodenGewicht(zeile, u);
        let w = core.bodenGewicht(zeile, Object.assign({}, u, { ufer: y - uf.see }));
        if (uf.fluss !== null && uf.ufer > 0)
            w = Math.max(w, uf.ufer * core.bodenGewicht(zeile, Object.assign({}, u, { ufer: y - uf.fluss })));
        return w;
    }

    // Die Pflanzen einer Kachel nach dem Boden-Gesetz: je Zelle (NAH_STREU.zelle) EINE Umwelt-Messung (das Licht der
    // stehenden Kronen `_bodenLichtFeld` · Feuchte · Höhe über dem Wasser · Steinigkeit · Hang, die Welt-Leser), je Art λ = dichte · Zellfläche ·
    // Gewicht · Last-Dichte (`_effectiveFoliageDensity`), n = ⌊λ + Wurf⌋. Der Wurf-Strom je (Zelle, Art) hängt nur
    // an der Zelle (Γ5): dieselbe Streu bei jedem Besuch, und eine dünnere Last ist ein Präfix der vollen (die
    // Ernte-Identität `gi|gj|art|i` bleibt). Fuß und Hang auf dem GERENDERTEN Boden (der EINE Leser `_bodenSichtAt`, am
    // Chunk-Rand die Karte des Nachbarn), Pfade bleiben frei, kein Haus trägt Streu (`_naturSetzen`), nur Arten mit Ufer-Band
    // stehen im Wasser — im GEZEICHNETEN (`_koerperWasser`). Rückgabe { items, chunks, wasser } (`chunks`: die Karten, die
    // die Kachel las, `_bodenSichtChunks`; `wasser`: die Kennungen des gezeichneten Wassers, `_wasserKennungen`) oder null,
    // solange einer dieser Chunks noch keine Boden-Karte hat.
    _nahStreuKachel(tx, tz, arten) {
        const NS = AnazhRealm.NAH_STREU;
        const core = typeof globalThis !== "undefined" ? globalThis.__phytoCore : null;
        if (!core || typeof core.bodenGewicht !== "function")
            throw new Error("_nahStreuKachel: das Boden-Gesetz (__phytoCore.bodenGewicht) fehlt");
        const K = NS.kachel;
        // Die Nah-Streu ist ein Wurf des Feldes: trägt die Wildnis die Kachel nicht, trägt sie nur die Stümpfe der Taten.
        if (!this._wildnisTraegt((tx + 0.5) * K, (tz + 0.5) * K))
            return { items: this._tatStuempfe(tx, tz, arten), chunks: new Map(), wasser: [] };
        // jede Pflanze steht in der Kachel (Zell-Mitte ± halbe Zelle): ihr Boden sind die Karten dieses Rechtecks
        const chunks = this._bodenSichtChunks(tx * K, tz * K, (tx + 1) * K, (tz + 1) * K);
        if (!chunks) return null; // der Boden steht noch nicht — die Kachel wartet
        const items = this._tatStuempfe(tx, tz, arten);
        const seedInt = this._forestSeedInt();
        const last = this._effectiveFoliageDensity();
        const Z = NS.zelle;
        const n = Math.round(K / Z);
        const boden = (px, pz) => {
            const v = this._bodenSichtAt(px, pz);
            return v === null ? NaN : v;
        };
        const licht = this._bodenLichtFeld(tx * K, tz * K, (tx + 1) * K, (tz + 1) * K);
        for (let gj = tz * n; gj < tz * n + n; gj++) {
            for (let gi = tx * n; gi < tx * n + n; gi++) {
                const x = (gi + 0.5) * Z;
                const z = (gj + 0.5) * Z;
                const y = this._bodenSichtAt(x, z);
                if (y === null) continue;
                if (this._pfadFeldAt(x, z, y) > 0.5) continue; // Ufer-Pfad und Siedlungs-Weg bleiben frei (Labor: trailAt < 3 m)
                const feucht = this._feuchteAt(x, z, y);
                const feld = this.worldFieldAt(x, z);
                // Die Höhe über dem Wasser: für das Ufer-Band (Schilf) über beiden Bezügen (`_waterLevelAt` → see · fluss ·
                // ufer, wie Strand und Schlick in `_bodenFarbeAt`: das Band über See/Meer und das über dem Fluss mit seiner
                // Kronen-Blende, das Maximum — stetig über die Krone), für jede andere Art über der EINEN Wahrheit am Körper
                // (`_koerperWasser`: nie im Wasser). Bis zur Gegenprüfung las die Streu das Maximum der Spiegel — an der
                // Krone sprang der Bezug auf den Meeresspiegel (der Kronen-Sprung, den 463c4fda in der Boden-Farbe heilte).
                const uf = { see: 0, fluss: null, ufer: 0 };
                this._waterLevelAt(x, z, uf);
                const u = {
                    licht: licht(x, z), // das Licht der stehenden Kronen (Labor: `lightAt` der Bäume)
                    feucht,
                    ufer: y - this._koerperWasser(x, z, y),
                    fels: feld ? feld.dichte : null,
                    hang: this._slopeAt(x, z, boden),
                    leben: this._lebenStufe(x, z), // das Leben-Overlay am Ort in Stufen (feld.K5: die Pflege lässt blühen)
                };
                for (let a = 0; a < arten.length; a++) {
                    const A = arten[a];
                    const gw = this._nahStreuBodenGewicht(core, A.zeile, u, uf, y);
                    const lam = A.zeile.dichte * Z * Z * 0.01 * gw * last;
                    if (!(lam > 0)) continue;
                    let hs =
                        ((gi * 73856093) ^ (gj * 19349663) ^ ((a + 1) * 0x85ebca6b) ^ seedInt ^ 0x5eedb0de) >>> 0 || 1;
                    const w = () => {
                        hs = (hs + 0x6d2b79f5) >>> 0;
                        let t = hs;
                        t = Math.imul(t ^ (t >>> 15), t | 1);
                        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
                        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
                    };
                    const anzahl = Math.floor(lam + w());
                    for (let i = 0; i < anzahl; i++) {
                        const px = x + (w() - 0.5) * Z;
                        const pz = z + (w() - 0.5) * Z;
                        const s = A.zeile.skala[0] + w() * (A.zeile.skala[1] - A.zeile.skala[0]);
                        const rot = w() * Math.PI * 2;
                        const same = (w() * 4294967296) >>> 0;
                        const ordnung = w();
                        const py = this._bodenSichtAt(px, pz);
                        if (py === null) continue;
                        if (!A.zeile.ufer && this._nassAt(px, pz, 0.1, py)) continue;
                        // was brennt (die Kräuter, `ernte` kraut), wächst auf der Asche erst mit dem Busch der Sukzession
                        if (A.ernte === "kraut" && !this._streuNachBrand(px, pz, ordnung)) continue;
                        const it = { art: a, id: `${gi}|${gj}|${a}|${i}`, x: px, y: py, z: pz, rot, s, same, ordnung };
                        this._naturSetzen(null, it, null, () => items.push(it)); // die EINE Natur-Wand: nie im Haus
                    }
                }
            }
        }
        return { items, chunks, wasser: this._wasserKennungen(tx * K, tz * K, (tx + 1) * K, (tz + 1) * K) };
    }

    // Die Senke einer (Art, Gestalt, Stufe, Teil): die DATEN des ganzen Rings — je Kachel ein Block (Matrizen = Ort ·
    // Drehung · Skala · Welt-Skala des Teils, die Tint-Farben, die Ernte-Identitäten). Sie zeichnet nie selbst: jeder Block
    // ist ein BEREICH im Satz ihres Stoffs (`_streuSatzArt`) — die Draw-Einheit der Nah-Streu ist ihr Stoff, nie ihre
    // Gestalt. Sie hält die Studio-Geometrie ihres Teils (`_liveRefs` der Cache-Gruppe), solange sie lebt — eine
    // LRU-Räumung zerstört sie nie (ein eintretender Block rechnet sich aus ihr). `wiegt`: die Art trägt weiches Gewebe —
    // jeder ihrer Teile zeichnet mit dem wiegenden Studio-Stoff (derselbe Bauer `_foundryTreeMaterial`; die Höhe über der
    // Wurzel in Metern und das Rauschen der Pflanze reisen im Satz als `aWiege`, `_satzBlock`).
    _streuNahSenke(art, v, stufe, p, lf, wiegt) {
        const ns = this.state.nahStreu;
        const key = `${art.id}:${v}:L${stufe}:${p}`;
        let a = ns.senken.get(key);
        if (a) return a;
        const u = lf.mat.userData || {};
        a = {
            key,
            name: "streuNah:" + key,
            preset: art.id,
            ernte: art.ernte,
            geo: lf.geom,
            mat: wiegt
                ? this._foundryTreeMaterial(u.foundryKind, u.foundryMp, true, null, u.krone === true, {
                      jahr: u.jahr === true,
                  })
                : lf.mat,
            lokal: lf.localMatrix,
            wiegt: !!wiegt,
            leafKey: lf.leafKey,
            tint: u.useInstanceTint === true,
            quelle: lf._srcGroup || null,
            anzahl: 0,
            bloecke: new Map(),
            satz: null,
        };
        a.satz = this._streuSatzArt(a);
        if (a.quelle) a.quelle._liveRefs = (a.quelle._liveRefs || 0) + 1;
        ns.senken.set(key, a);
        return a;
    }

    // DER STREU-SATZ (W7): je Stoff der Nah-Streu EIN Satz (`streuSatz|<Stoff>`, die Pool-Mechanik des Chunk-Satzes), sein
    // Bereich ist der Block einer Kachel in einer Senke (`_streuNahSatz`), je Pflanze eine Zelle. Befund (echte GPU,
    // Mess-Wiese −900/−850, `werkbank band`): je Art × Gestalt × Stufe × Teil zeichnete eine InstancedMesh den ganzen Ring —
    // 15 Befehle und 46k Dreiecke im Hauptbild, auch hinter dem Blick (Haushalt 9 / 40k); der wiegende Stoff war je
    // Studio-Skala ein eigener (Blüte 0,27 und Farn-Wedel 1,0: zwei Stoffe gleicher Regler). Jetzt zeichnet je Stoff EIN
    // Befehl, und das Frustum jedes Passes wählt je Pflanze (`_chunkSatzPass`, der EINE Haken). Der wiegende Stoff trägt
    // keine Dither-Stempel (die Nah-Streu blendet nie, ihr Stufen-Wechsel ist die Armlänge): Position · Normale · Farbe ·
    // `aWiege`; ein stehender Stoff ist der Studio-Stoff (`lf.mat`) mit den Stempeln des Bau-Satzes. Fail-closed: ein Stoff,
    // der eine Karte liest (uv — der Blatt-Atlas), hat im Satz keine Quelle. DER WURF (1310-11): der stehende Stoff (Holz und
    // Stein — Geröll · Totstamm · Stumpf) wirft in die Kaskaden, der wiegende nie (Gras, Blüte, Farn bleiben schattenlos).
    _streuSatzArt(a) {
        const mat = a.mat;
        const u = mat.userData || {};
        if (mat.map || u.foundryKind === "foliageTex" || u.foundryKind === "schatten" || u.impostorBillboard === true)
            throw new Error(
                `_streuSatzArt(${a.name}): der Stoff liest eine Karte (uv) — der Streu-Satz trägt sie nicht`
            );
        const art = "streuSatz|" + mat.uuid;
        const st = this.state;
        if (!st.satzStoffe) st.satzStoffe = new Map();
        if (!st.satzStoffe.has(art))
            st.satzStoffe.set(art, {
                name: "streuSatz",
                mat,
                wurf: !a.wiegt,
                // das Laub der Art fällt im Winter (`_jahrLage`): ihr Satz trägt Mitte und Typ jeder Ecke
                attr: (a.wiegt ? AnazhRealm.STREU_SATZ_ATTR : AnazhRealm.STREU_FEST_ATTR).concat(
                    u.jahr === true ? AnazhRealm.JAHR_SATZ_ATTR : []
                ),
                kapazitaet: "streu",
                userData: { streuSatz: "streuSatz" },
            });
        return art;
    }

    // DIE SENKE der Nah-Wiese (neu oder gewachsen): je Vorlage × Stufe × Teil EINE InstancedMesh über der geteilten
    // Studio-Geometrie für den ganzen Ring. Sie wirft nicht (Budget schatten false) und cullt selbst (der Sicht-Satz legt je
    // Büschel und Pass ihre Instanzen, `_nahWieseSicht`); der Inhalt bis zur Anzahl reist mit, die alte verlässt Graph und
    // GPU (`_instanzAbschied`). `eltern` = der Knoten der Senke.
    _senkeMesh(a, kap, eltern) {
        if (!eltern) throw new Error(`_senkeMesh(${a.name}): kein Eltern-Knoten`);
        const alt = a.mesh;
        const m = AnazhRealm._instanzMesh(a.geo, a.mat, kap);
        m.name = a.name;
        m.castShadow = false;
        m.receiveShadow = true;
        m.frustumCulled = false;
        m.userData.leafKey = a.leafKey; // die Studio-Identität (Foundry-Leaf) für Inventur und Linsen
        // der Tint je Büschel (W1, terrain:wiesenTint): r184 multipliziert die Instanz-Farbe im Farb-Pfad, der Zeichner reicht
        // sie durch; sie fällt mit der Senke (`_instanzAbschied`)
        m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(kap * 3).fill(1), 3);
        if (alt) {
            m.instanceMatrix.array.set(alt.instanceMatrix.array.subarray(0, a.anzahl * 16));
            m.instanceColor.array.set(alt.instanceColor.array.subarray(0, a.anzahl * 3));
            if (alt.parent) alt.parent.remove(alt);
            this._instanzAbschied(alt);
            a.wachse++;
        }
        AnazhRealm._instanzZahl(m, a.anzahl);
        a.mesh = m;
        a.kap = kap;
        eltern.add(m);
    }

    // Ein Kachel-Block tritt ein (Matrizen n×16, Farben n×3 bei Tint-Senken, die Ernte-Identität je Pflanze): die Senke
    // merkt ihn, der Satz ihres Stoffs trägt ihn als Bereich — ein neuer Block derselben Kachel tritt in den stehenden
    // Bereich (er legt nur die geänderten Slots, `_streuNahSatz`).
    _streuNahEin(a, kachelKey, matrizen, farben, ids) {
        const alt = a.bloecke.get(kachelKey);
        if (alt) a.anzahl -= alt.n;
        const n = matrizen.length / 16;
        if (a.tint && (!farben || farben.length !== n * 3))
            throw new Error(`_streuNahEin(${a.name}, ${kachelKey}): die Tint-Senke braucht n×3 Farben`);
        if (!ids || ids.length !== n)
            throw new Error(`_streuNahEin(${a.name}, ${kachelKey}): je Pflanze eine Ernte-Identität`);
        const b = { n, ids, matrizen, farben: a.tint ? farben : null };
        a.bloecke.set(kachelKey, b);
        a.anzahl += n;
        this._streuNahSatz(a, kachelKey, b);
    }

    // Ein Kachel-Block tritt aus: die Senke vergisst ihn, sein Bereich verlässt den Satz.
    _streuNahAus(a, kachelKey) {
        const b = a ? a.bloecke.get(kachelKey) : null;
        if (!b) return false;
        a.bloecke.delete(kachelKey);
        a.anzahl -= b.n;
        this._streuNahSatz(a, kachelKey, null);
        return true;
    }

    // Der Bereich eines Blocks im Satz seines Stoffs (Schlüssel `<Senke>@<Kachel>`): seine Pflanzen in Welt-Lage, je Pflanze
    // eine Zelle; ein leerer Block verlässt den Satz. DER EINE LEGER DER STOFF-SÄTZE (Lehre 25, stadt-takt): der Block legt
    // über den Bau-Satz (`_bauSatzLege`, die Senke ist seine Gruppe) — steht sein Bereich, legen nur die Slots, deren Stempel
    // (Matrix, Farbe) sich änderten (`_bauSatzSlots`); vorher legte jede Ernte und jeder Neubau der Kachel den ganzen Block.
    _streuNahSatz(a, kachelKey, b) {
        const key = a.key + "@" + kachelKey;
        if (!b || b.n === 0) {
            this._chunkSatzAus(a.satz, key);
            return;
        }
        const g = {
            geom: a.geo,
            satz: a.satz,
            key: a.name + "@" + kachelKey,
            liveCount: b.n,
            mesh: {
                material: a.geo,
                instanceMatrix: { array: b.matrizen },
                instanceColor: b.farben && { array: b.farben },
            },
        };
        const s = this.state.chunkSaetze ? this.state.chunkSaetze.get(a.satz) : null;
        this._bauSatzLege(key, a.satz, g, s ? s.bloecke.get(key) : null, Infinity);
    }

    // Die Ernte: die Pflanze am Block-Index i tritt aus dem Block der Kachel aus — die letzte rückt an ihren Platz, der Block
    // schrumpft um eine (eine geerntete Pflanze zeichnet nie), der Bereich legt den einen Slot neu und gibt den letzten frei.
    // Der Kachel-Austritt (der ganze Block) geht über `_streuNahAus`.
    _streuNahLuecke(a, kachelKey, i) {
        const b = a.bloecke.get(kachelKey);
        const z = b.n - 1;
        b.matrizen.copyWithin(i * 16, z * 16, z * 16 + 16);
        b.matrizen = b.matrizen.subarray(0, z * 16);
        if (b.farben) {
            b.farben.copyWithin(i * 3, z * 3, z * 3 + 3);
            b.farben = b.farben.subarray(0, z * 3);
        }
        b.ids[i] = b.ids[z];
        b.ids.length = z;
        b.n = z;
        a.anzahl -= 1;
        this._streuNahSatz(a, kachelKey, b);
    }

    // Der Block einer Kachel in einer Senke (Ernte, Sonden): {satz, bereich, n, ids} oder null.
    _streuNahBereich(senkeKey, kachelKey) {
        const ns = this.state.nahStreu;
        const a = ns ? ns.senken.get(senkeKey) : null;
        const b = a ? a.bloecke.get(kachelKey) : null;
        return b ? { satz: a.satz, bereich: a.key + "@" + kachelKey, n: b.n, ids: b.ids } : null;
    }

    // Eine Kachel verlässt den Ring (oder baut neu): ihre Blöcke treten aus allen Senken aus.
    _nahStreuKachelEntsorgen(k) {
        const ns = this.state.nahStreu;
        for (const sk of k.senken) this._streuNahAus(ns.senken.get(sk), k.key);
        k.senken.clear();
        k.zustand = null;
    }

    // Die Streu im Rechteck würfelt neu, wo ein Feld sie anders trägt (die Leben-Stufe, `_lebenStufeMalen`): nur die Kacheln, die
    // stehen — ihr Satz gilt als alt, der nächste Takt würfelt ihn an derselben Kachel und tauscht die Blöcke in EINEM Bau (die
    // alten Pflanzen stehen bis dahin, kein Loch). Rückgabe: Zahl der Kacheln.
    _nahStreuNeuIn(x0, z0, x1, z1) {
        const ns = this.state.nahStreu;
        if (!ns || !ns.kacheln.size) return 0;
        const K = AnazhRealm.NAH_STREU.kachel;
        let n = 0;
        for (let tz = Math.floor(z0 / K); tz < Math.ceil(z1 / K); tz++)
            for (let tx = Math.floor(x0 / K); tx < Math.ceil(x1 / K); tx++) {
                const k = ns.kacheln.get(tx + "," + tz);
                if (!k) continue;
                k.satzAlt = true;
                k.zustand = null;
                n++;
            }
        // nur die Streu liest die Stufe: ihr Takt geht (`_standWecken`) — Wuchs, Stufen-Wahl und Cull schlafen weiter
        if (n) this._standWecken("nahStreu");
        return n;
    }

    // Je Takt (scatterDeco, prio 2): Kacheln im Ring um die KAMERA anlegen (nah zuerst, ≤ kachelnJeTakt Neubauten),
    // die Stufe je PFLANZE aus ihrer Distanz zur Kamera (die Armlänge `stufe0` trägt L0, sonst die leichteste
    // deklarierte Stufe — `_foundryDeclaredStage`, mit Hysterese, `_nahStreuArmlaenge`), das Rand-Band dünnt über die
    // Würfel-Ordnung (Viertel-Stufen), außerhalb
    // fällt die Kachel. Ein Chunk-Neubau (Edit) baut die betroffenen Kacheln neu, eine Ernte nimmt aus, das
    // Nachwachsen baut neu. Wartet eine Art auf ihr Studio-Asset, wartet die Kachel (die Anfrage läuft nah zuerst).
    // Rückgabe: Zahl der Neubauten (0 = der Ring steht).
    _tickNahStreu(deadline) {
        const st = this.state;
        if (!st.scene || !st.camera || typeof THREE === "undefined") return 0;
        const arten = this._nahStreuArten();
        if (!arten) return 0;
        const NS = AnazhRealm.NAH_STREU;
        if (!st.nahStreu) st.nahStreu = { kacheln: new Map(), senken: new Map(), offen: 0 };
        const ns = st.nahStreu;
        // DIE STAND-WACHE: stehen Auge, Chunks, Ernte und Buch, steht jede Kachel in ihrem Zustand — kein Gang.
        if (this._standRuht("nahStreu", 1, { pos: st.camera.position, rand: AnazhRealm.STAND_RAND_M }, "karte"))
            return 0;
        let gefallen = 0;
        const cam = st.camera.position;
        // die Armlänge gilt dem stetigen Auge: nach einem Sprung (`_augeSprung`) wählt jede Pflanze aus dem Jetzt
        if (this._augeSprung(ns, cam.x, cam.y, cam.z))
            for (const k of ns.kacheln.values()) for (const it of k.items) it.nah = false;
        const tcx = Math.floor(cam.x / NS.kachel);
        const tcz = Math.floor(cam.z / NS.kachel);
        const reichweite = Math.ceil(NS.radius / NS.kachel) + 1;
        // Chunk-Neubau oder neues gezeichnetes Wasser → die betroffenen Kacheln neu (ihre Pflanzen standen auf dem alten
        // Boden, am alten Ufer).
        for (const [key, k] of ns.kacheln) {
            if (!k.chunks) continue;
            if (!this._wasserKennungenGleich(k.wasser) || !this._bodenKartenStehen(k.chunks)) {
                this._nahStreuKachelEntsorgen(k);
                ns.kacheln.delete(key);
                gefallen++;
            }
        }
        const wunsch = [];
        for (let dz = -reichweite; dz <= reichweite; dz++) {
            for (let dx = -reichweite; dx <= reichweite; dx++) {
                const tx = tcx + dx;
                const tz = tcz + dz;
                const d = Math.hypot((tx + 0.5) * NS.kachel - cam.x, (tz + 0.5) * NS.kachel - cam.z);
                if (d > NS.radius + NS.kachel * 0.71) continue;
                // die kürzeste Distanz Kamera → Kachel-Rechteck: reicht der Armlängen-Kreis hinein?
                const ex = Math.max(tx * NS.kachel - cam.x, 0, cam.x - (tx + 1) * NS.kachel);
                const ez = Math.max(tz * NS.kachel - cam.z, 0, cam.z - (tz + 1) * NS.kachel);
                // dasselbe Rechteck wie der Satz der Kachel (`_nahStreuKachel`)
                if (this._bodenKommtNie(tx * NS.kachel, tz * NS.kachel, (tx + 1) * NS.kachel, (tz + 1) * NS.kachel))
                    continue;
                wunsch.push({ key: `${tx},${tz}`, tx, tz, d, imKreis: Math.hypot(ex, ez) <= NS.stufe0 + 1 });
            }
        }
        const gewollt = new Set(wunsch.map((w) => w.key));
        for (const [key, k] of ns.kacheln) {
            if (gewollt.has(key)) continue;
            this._nahStreuKachelEntsorgen(k);
            ns.kacheln.delete(key);
            gefallen++;
        }
        wunsch.sort((a, b) => a.d - b.d);
        let gebaut = 0;
        ns.offen = 0;
        for (const w of wunsch) {
            let k = ns.kacheln.get(w.key);
            // Je Art ihr Rand-Band vor ihrer Weite (Viertel-Stufen der Würfel-Ordnung): kleine Arten dünnen früher aus.
            const anteile = arten.map(
                (A) => Math.ceil(Math.max(0, Math.min(1, (A.weite - w.d) / NS.rand + 0.5)) * 4) / 4
            );
            const rand = anteile.join(",");
            if (k && k.zustand === this._nahStreuArmlaenge(k, cam, w.imKreis) + "|" + rand) continue;
            if (gebaut >= NS.kachelnJeTakt || (deadline && performance.now() > deadline)) {
                ns.offen++;
                continue;
            }
            if (!k || k.satzAlt) {
                const satz = this._nahStreuKachel(w.tx, w.tz, arten);
                if (!satz) {
                    ns.offen++;
                    continue;
                }
                // ein alter Satz (`_nahStreuNeuIn`) würfelt an seiner Kachel neu: die Blöcke tauschen unten in EINEM Bau
                if (k)
                    k = Object.assign(k, {
                        items: satz.items,
                        chunks: satz.chunks,
                        wasser: satz.wasser,
                        satzAlt: false,
                    });
                else
                    k = {
                        key: w.key,
                        items: satz.items,
                        chunks: satz.chunks,
                        wasser: satz.wasser,
                        senken: new Set(),
                        zustand: null,
                        nahZahl: 0,
                    };
                ns.kacheln.set(w.key, k);
            }
            const zustand = this._nahStreuArmlaenge(k, cam, w.imKreis) + "|" + rand;
            // Je (Art, Gestalt, Stufe) die Studio-Teile — fehlt eines (Anfrage läuft), wartet die ganze Kachel; jede
            // fehlende Gruppe fragt im selben Lauf an (die Anfragen reisen parallel, nah zuerst).
            const gruppen = new Map();
            const fehlend = new Set();
            const ernte = this._geerntetIn(w.key); // die Tat bleibt (feld.K4): das Gepflückte fehlt bis zu seiner Heilung
            let bereit = true;
            for (const it of k.items) {
                if (it.ordnung >= anteile[it.art]) continue;
                if (ernte.has(it.id)) continue;
                const art = arten[it.art];
                const v = this._foundryVariantFor(it.same, art.id);
                const stufe = this._foundryDeclaredStage(art.id, it.nah ? 0 : 2);
                const gk = `${it.art}:${v}:${stufe}`;
                if (fehlend.has(gk)) continue;
                let g = gruppen.get(gk);
                if (!g) {
                    // Der Ort reist mit: die Foundry-Schlange bedient nah zuerst (`_foundryAuftrag`).
                    const ort = { seed: it.same, position: { x: it.x, y: it.y, z: it.z } };
                    const flat = v == null ? null : this._foundryFlattenFor(ort, art.id, stufe);
                    if (flat === false) {
                        this._nahStreuKaputt(art.id, stufe); // das Studio kann die Stufe nicht: laut, benannt
                        fehlend.add(gk);
                        continue;
                    }
                    if (!flat || !Array.isArray(flat.leaves) || !flat.leaves.length) {
                        bereit = false;
                        fehlend.add(gk);
                        continue;
                    }
                    g = { art, v, stufe, flat, liste: [] };
                    gruppen.set(gk, g);
                }
                g.liste.push(it);
            }
            if (!bereit) {
                ns.offen++;
                continue;
            }
            this._nahStreuKachelEntsorgen(k);
            this._nahStreuBloecke(k, gruppen);
            k.zustand = zustand;
            gebaut++;
        }
        this._standMeldet("nahStreu", 1, gebaut + gefallen > 0, ns.offen > 0);
        return gebaut;
    }

    // DIE ARMLÄNGE JE PFLANZE (Integration 05.10.): L0 trägt jede Pflanze im Kreis `stufe0` um die Kamera (Eintritt
    // ≤ stufe0, Austritt > stufe0 + 0,75 m, horizontal), gleich in welcher Kachel sie steht. Bis 05.10. entschied die
    // Kachel-MITTE (4-m-Kachel, L0 erst ab ≤ 2,5 m Mitten-Distanz): die Nachbar-Kachel zeigte ihren Farn auf 0,1 m als
    // L1-Band (Prüfer Waldboden, Befund 5). Setzt `it.nah` und gibt die Signatur der L0-Pflanzen zurück — ändert sie
    // sich, baut die Kachel neu (der Zustand der Kachel trägt sie). Eine Kachel jenseits des Kreises ohne L0 kostet nichts.
    _nahStreuArmlaenge(k, cam, imKreis) {
        if (!imKreis && !k.nahZahl) return "";
        const NS = AnazhRealm.NAH_STREU;
        let sig = "";
        let n = 0;
        for (let i = 0; i < k.items.length; i++) {
            const it = k.items[i];
            const d = imKreis ? Math.hypot(it.x - cam.x, it.z - cam.z) : Infinity;
            it.nah = this._nahStufe(NS.stufe0, 0.75, d, it.nah);
            if (it.nah) {
                sig += i + ",";
                n++;
            }
        }
        k.nahZahl = n;
        return sig;
    }

    // Eine Art, deren Stufe das Studio nicht bauen kann (leere Antwort), fehlt im Bild — LAUT: einmal je (Art, Stufe)
    // ein ERROR mit Namen und der Zähler `nahStreu.kaputt`, den die Wand liest; die übrigen Arten bauen weiter.
    _nahStreuKaputt(preset, stufe) {
        const ns = this.state.nahStreu;
        if (!ns.kaputt) ns.kaputt = new Set();
        const k = preset + ":L" + stufe;
        if (ns.kaputt.has(k)) return;
        ns.kaputt.add(k);
        this.log(`Nah-Streu: das Studio liefert ${k} leer — die Art fehlt im Bild`, "ERROR");
    }

    // Die Blöcke einer Kachel: je Gruppe × Studio-Teil EIN Block in seiner Senke (Matrix = Ort · Drehung · Skala ·
    // Welt-Skala des Teils), ein neutral-naher Tint je Instanz (±8 % Luminanz, ±3 % warm/kühl — aus einem eigenen
    // Hash-Strom, nie aus den Platzierungs-Würfen).
    _nahStreuBloecke(k, gruppen) {
        const m4 = this._tmpStreuM4 || (this._tmpStreuM4 = new THREE.Matrix4());
        const q = this._tmpStreuQ || (this._tmpStreuQ = new THREE.Quaternion());
        const pv = this._tmpStreuP || (this._tmpStreuP = new THREE.Vector3());
        const sv = this._tmpStreuS || (this._tmpStreuS = new THREE.Vector3());
        const up = this._tmpStreuUp || (this._tmpStreuUp = new THREE.Vector3(0, 1, 0));
        const tint = (same, achse) => {
            let h = Math.imul(same ^ ((achse + 1) * 0x9e3779b9), 0x85ebca6b) >>> 0;
            h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
            return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
        };
        // Weiches Gewebe (Laub · Blatt-Karte · Stiel — die Studio-Stoffe, die im Labor wiegen) macht die ganze Art
        // wiegend; Holz und Stein (Totstamm · Stumpf · Geröll) stehen.
        const weich = (lf) => {
            const k = lf && lf.mat && lf.mat.userData ? lf.mat.userData.foundryKind : null;
            return k === "foliage" || k === "foliageTex" || k === "stem";
        };
        for (const g of gruppen.values()) {
            const n = g.liste.length;
            const wiegt = g.flat.leaves.some(weich);
            for (let p = 0; p < g.flat.leaves.length; p++) {
                const lf = g.flat.leaves[p];
                if (!lf || !lf.geom || !lf.mat || lf.shadowTwin) continue;
                const a = this._streuNahSenke(g.art, g.v, g.stufe, p, lf, wiegt);
                const matrizen = new Float32Array(n * 16);
                const farben = a.tint ? new Float32Array(n * 3) : null;
                const ids = new Array(n);
                for (let i = 0; i < n; i++) {
                    const it = g.liste[i];
                    pv.set(it.x, it.y, it.z);
                    q.setFromAxisAngle(up, it.rot);
                    sv.set(it.s, it.s, it.s);
                    m4.compose(pv, q, sv).multiply(a.lokal);
                    m4.toArray(matrizen, i * 16);
                    ids[i] = it.id;
                    if (farben) {
                        const l = 0.92 + tint(it.same, 0) * 0.16;
                        const wk = (tint(it.same, 1) - 0.5) * 0.06;
                        farben[i * 3] = Math.min(1.08, l + wk);
                        farben[i * 3 + 1] = l;
                        farben[i * 3 + 2] = Math.min(1.08, Math.max(0, l - wk));
                    }
                }
                this._streuNahEin(a, k.key, matrizen, farben, ids);
                k.senken.add(a.key);
            }
        }
    }

    // Gras deferred (~34 ms/Chunk, der dominante Rebuild-Posten) → kein Aufschlag auf den Streaming-/Spawn-
    // Drain-Frame.
    _enqueueGrass(cx, cz) {
        if (!this.state.pendingGrass) this.state.pendingGrass = new Set();
        this.state.pendingGrass.add(`${cx},${cz}`);
    }

    // Per-Frame-Tick: baut ≤maxPerFrame Gras-Chunks, NAHE zuerst; ferne (Ring
    // > 2, der V16.1-Gras-Ring) aus der Queue werfen. maxPerFrame=1 (Default),
    // weil EIN Gras-Build ~34 ms kostet — nie zwei in einem Frame.
    // `frist` (optional, der Lade-Takt): baut, solange die Frist offen ist — mindestens einen.
    _tickPendingGrass(maxPerFrame = 1, frist) {
        const queue = this.state.pendingGrass;
        if (!queue || queue.size === 0) return 0;
        const lpc = this.state.lastPlayerVoxelChunk;
        // Gras nur im Band 0 der EINEN Kaskade (`DETAIL_CASCADE[0].maxRing`) — jenseits tragen Impostor-
        // Deko + Boden + Fog, Halme dort sind sub-pixel. Kein eigener Ring (Gesetz #0).
        const GRASS_RING = AnazhRealm.DETAIL_CASCADE[0].maxRing;
        let keys = [...queue];
        if (lpc) {
            const distOf = (k) => {
                const ci = k.indexOf(",");
                const kx = parseInt(k.slice(0, ci), 10);
                const kz = parseInt(k.slice(ci + 1), 10);
                return Math.max(Math.abs(kx - lpc.cx), Math.abs(kz - lpc.cz));
            };
            for (const k of keys) if (distOf(k) > GRASS_RING) queue.delete(k);
            keys = [...queue].sort((a, b) => distOf(a) - distOf(b));
        }
        let built = 0;
        for (const key of keys) {
            if (built >= maxPerFrame) break;
            if (built > 0 && Number.isFinite(frist) && performance.now() > frist) break;
            queue.delete(key);
            if (!this.state.voxelChunks || !this.state.voxelChunks.has(key)) continue;
            if (this.state.voxelChunkGrass && this.state.voxelChunkGrass.has(key)) continue;
            const comma = key.indexOf(",");
            const cx = parseInt(key.slice(0, comma), 10);
            const cz = parseInt(key.slice(comma + 1), 10);
            this._buildVoxelChunkGrass(cx, cz);
            built++;
        }
        return built;
    }

    // ===== FORAGING: die Nah-Streu ist pflückbar =====
    // Kein Parallel-System: der PICK prüft die Pflanzen der Senken (die Daten, die der Satz zeichnet: je Block die
    // Matrizen — die Sonde trägt Geometrie und Stoff der Senke, die Pflanze ihre Matrix) und nennt die Ernte-Identität
    // `gi|gj|art|i` der nächsten getroffenen Pflanze, die ERNTE nimmt die Pflanze in allen Teilen aus ihren Blöcken und
    // schreibt sie als Tat der Welt (`_tatSchreiben`, feld.K4; der Kachel-Bau lässt sie weg), geheilt wächst sie nach.
    _pickScatterAtCrosshair() {
        const ns = this.state.nahStreu;
        if (!ns || ns.senken.size === 0) return null;
        const F = this._fadenkreuzStrahl();
        if (!F) return null;
        if (!this._tmpRaycaster) this._tmpRaycaster = new THREE.Raycaster();
        const rc = this._tmpRaycaster;
        rc.set(F.o, F.d);
        rc.far = AnazhRealm.FORAGE.reach;
        const P =
            this._streuPick || (this._streuPick = { mesh: new THREE.Mesh(), kugel: new THREE.Sphere(), hits: [] });
        let best = null;
        for (const a of ns.senken.values()) {
            if (a.anzahl === 0 || !a.ernte) continue;
            if (!a.geo.boundingSphere) a.geo.computeBoundingSphere();
            P.mesh.geometry = a.geo;
            P.mesh.material = a.mat;
            for (const [key, b] of a.bloecke)
                for (let i = 0; i < b.n; i++) {
                    P.mesh.matrixWorld.fromArray(b.matrizen, i * 16);
                    P.kugel.copy(a.geo.boundingSphere).applyMatrix4(P.mesh.matrixWorld);
                    if (!rc.ray.intersectsSphere(P.kugel)) continue;
                    P.hits.length = 0;
                    P.mesh.raycast(rc, P.hits);
                    for (const h of P.hits)
                        if ((!best || h.distance < best.d) && this._durchsichtSteht(h))
                            best = { d: h.distance, key, senke: a.key, name: a.preset, id: b.ids[i], point: h.point };
                }
        }
        P.mesh.geometry = null;
        P.mesh.material = null;
        if (!best) return null;
        return { key: best.key, senke: best.senke, name: best.name, id: best.id, point: best.point };
    }

    _harvestScatterPick(pick) {
        if (!pick) return false;
        const ns = this.state.nahStreu;
        const a = ns ? ns.senken.get(pick.senke) : null;
        if (!a || !a.ernte) return false;
        if (!this._streuNehmen(pick.key, pick.id)) return false;
        const got = this.addMaterialToInventory(a.ernte, 1);
        this.log(
            got ? `Gepflückt: ${a.preset} → 1× ${a.ernte}` : `Gepflückt: ${a.preset} — aber das Inventar ist voll`,
            "INFO"
        );
        // Die Tat prägt (V17.30-Substrat — sanft, wie das Sammeln).
        if (typeof this._feelAction === "function") this._feelAction("harvest");
        return true;
    }

    // Die Pflanze `id` der Nah-Streu-Kachel `key` verlässt die Welt (Pflücken und Mahd). DIE TAT BLEIBT (feld.K4): die Ernte
    // ist ein Schreib-Akt der Welt (`_tatSchreiben`) — die Kachel lässt die Pflanze weg, bis ihre Narbe heilt (in Spielzeit,
    // nach dem Leben des Orts), über jeden Save und Reload. Sie verschwindet SOFORT in jedem ihrer Teile (Stiel + Blüte,
    // Rute + Laub): sie tritt aus dem Block ihrer Kachel in jeder Senke aus, der Bereich im Satz legt sich neu
    // (`_streuNahLuecke`). false: keine solche Pflanze, oder schon geerntet (Doppel-Klick-Race).
    _streuNehmen(key, id) {
        const ns = this.state.nahStreu;
        const kachel = ns ? ns.kacheln.get(key) : null;
        const it = kachel ? kachel.items.find((x) => x.id === id) : null;
        if (!it || this._geerntetIn(key).has(id)) return false;
        this._tatSchreiben("ernten", it.x, it.z, { kachel: key, id });
        for (const sk of kachel.senken) {
            const s = ns.senken.get(sk);
            const b = s ? s.bloecke.get(key) : null;
            const i = b ? b.ids.indexOf(id) : -1;
            if (i < 0) continue;
            this._streuNahLuecke(s, key, i);
        }
        return true;
    }

    // DAS ZIEL DER ERNTE unter dem Fadenkreuz (der Klick-Dispatcher `tryMouseBreak`, Verb pfluecken): die getroffene Pflanze
    // der Nah-Streu — die Hand pflückt sie. Fasst die Schneide des gehaltenen Geräts den Halm ihres Stoffs (`_ernteBand`,
    // halten.K3: die Sichel), trägt das Ziel die MAHD: der Zug geht durch die Pflanze, ohne Pflanze durch den Boden unter dem
    // Fadenkreuz, wo er die Büschel der Nah-Wiese fasst (ihr Stoff: STREU_ERNTE der Studio-Art des Grases). Der Zug ist der
    // Bogen des EINEN Schwungs (ARENA.schwung.arcHalfRad zu beiden Seiten) mit der Reichweite der Klinge (`_kampfBladeReach`)
    // als Radius, seine Mitte die Reichweite vor dem Zielpunkt zum Spieler hin; geschnitten wird im Band der fassenden
    // Schneide (|Abstand zur Mitte − Radius| ≤ Band/2, höchstens die Reichweite über oder unter dem Zielpunkt) jeder
    // ungeerntete Halm des Stoffs. null: nichts zu ernten.
    _ernteZiel() {
        const ns = this.state.nahStreu;
        const flora = this._pickScatterAtCrosshair();
        const senke = flora && ns ? ns.senken.get(flora.senke) : null;
        const buch = this._foundry ? this._foundry.recipes : null;
        const gras = buch && buch.gras ? AnazhRealm.STREU_ERNTE[buch.gras.kind] || null : null;
        const stoff = flora ? senke && senke.ernte : gras;
        const band = this._ernteBand(this._heldImplementBlueprint(), stoff);
        if (!(band > 0)) return flora;
        const k0 = flora ? ns.kacheln.get(flora.key) : null;
        const h = flora ? null : this._raycastWorldHit(30);
        const ort = flora ? k0 && k0.items.find((it) => it.id === flora.id) : h.hit ? h : null;
        if (!ort) return flora;
        const R = this._kampfBladeReach();
        const pm = this.state.playerMesh.position;
        const F = this._fadenkreuzStrahl();
        const [ux, uz] = Math.hypot(ort.x - pm.x, ort.z - pm.z) > 1e-6 ? [ort.x - pm.x, ort.z - pm.z] : [F.d.x, F.d.z];
        const ul = Math.hypot(ux, uz) || 1;
        const [ex, ez] = [ux / ul, uz / ul];
        const [cx, cz] = [ort.x - R * ex, ort.z - R * ez];
        const cosA = Math.cos(AnazhRealm._arenaGesetz().schwung.arcHalfRad);
        const imZug = (x, y, z) => {
            const [dx, dz] = [x - cx, z - cz];
            const d = Math.hypot(dx, dz);
            return Math.abs(d - R) <= band / 2 && dx * ex + dz * ez >= cosA * d && Math.abs(y - ort.y) <= R;
        };
        // grob: die Kachel berührt den Kreis um die Mitte mit Radius R + Band
        const nah = (key, K) => {
            const [tx, tz] = key.split(",").map(Number);
            const w = R + band;
            return !((tx + 1) * K < cx - w || tx * K > cx + w || (tz + 1) * K < cz - w || tz * K > cz + w);
        };
        const mahd = { stoff, band, streu: [], wiese: [] };
        const arten = this._nahStreuArten();
        for (const [key, k] of ns && arten ? ns.kacheln : []) {
            if (!nah(key, AnazhRealm.NAH_STREU.kachel)) continue;
            const alt = this._geerntetIn(key);
            for (const it of k.items)
                if ((arten[it.art] || {}).ernte === stoff && !alt.has(it.id) && imZug(it.x, it.y, it.z))
                    mahd.streu.push({ key, id: it.id });
        }
        const nw = this.state.nahWiese;
        for (const [key, k] of nw && stoff === gras ? nw.kacheln : []) {
            if (!nah(key, AnazhRealm.NAH_WIESE.kachel)) continue;
            for (const b of k.bueschel)
                if (imZug(b.x, b.y, b.z)) mahd.wiese.push({ key, id: b.gi + "|" + b.gj, x: b.x, z: b.z });
        }
        if (!mahd.streu.length && !mahd.wiese.length) return flora;
        return { point: flora ? flora.point : ort, mahd };
    }

    // DIE MAHD (halten.K3, das Ziel aus `_ernteZiel`): jeder Halm des Zugs ist eine Ernte-Tat der Welt wie das Pflücken
    // (`_tatSchreiben`, feld.K4) und heilt mit ihr — die Pflanze der Nah-Streu tritt aus ihren Blöcken (`_streuNehmen`), das
    // Büschel der Nah-Wiese liegt unter der Kachel „wiese:<Kachel>" mit seiner Gitter-Zelle als Kennung, seine Kachel fällt
    // und baut sich ohne die gemähten Büschel neu (`_nahWieseKachelBueschel`); der Ertrag ist je Halm eine Einheit seines
    // Stoffs. Das Gerät verschleißt je Zug — dieselbe Wand und derselbe Verschleiß wie Hieb und Abbau.
    _maehen(mahd) {
        const bp = this._heldImplementBlueprint();
        if (this._geraetVerbraucht(bp, "Mähen")) return false;
        let n = 0;
        for (const h of mahd.streu) if (this._streuNehmen(h.key, h.id)) n++;
        for (const h of mahd.wiese) {
            const kachel = "wiese:" + h.key;
            if (this._geerntetIn(kachel).has(h.id)) continue;
            this._tatSchreiben("ernten", h.x, h.z, { kachel, id: h.id });
            this._nahWieseKachelFaellt(h.key);
            n++;
        }
        if (!n) return false;
        this._kampfVerschleiss(bp);
        const got = this.addMaterialToInventory(mahd.stoff, n);
        this.log(
            got ? `Gemäht: ${n} Halme → ${n}× ${mahd.stoff}` : `Gemäht: ${n} Halme — aber das Inventar ist voll`,
            "INFO"
        );
        if (typeof this._feelAction === "function") this._feelAction("harvest");
        return true;
    }

    // DAS WUCHS-GESETZ (stoffe.K5): wie schnell am Ort nachwächst, ist EINE Funktion von Feuchte × Licht ∈ [0, 1] — das Wasser
    // des Bodens (`_feuchteAt`, aus der Hydrosphäre; wo kein Fluss und kein See ihn tränkt, trägt der Regen `WUCHS.wasserBasis`)
    // mal das Licht am Boden unter den STEHENDEN Kronen (`_bodenLichtFeld`, dasselbe Licht, nach dem Nah-Wiese und Nah-Streu
    // wachsen). Die Tageszeit ist für jeden Ort dieselbe Sonnenbahn (die Tag-Achse kennt keine Saison) und trägt darum keinen
    // Unterschied der Orte; was Orte trennt, ist das Kronendach. Bis stoffe.K5 heilte jede Narbe nach dem gefrorenen Rauschen
    // `lebendig` (`worldFieldAt`) — ein Zeitgeber mit Ort-Gewicht ohne Wasser und Licht (Mess-Wiese: an den Bäumen F 0, L 0,43).
    // DER NÄHRSTOFF (stoffe.K5#2) ist der dritte Faktor: Monod — f(N) = N·(1 + K) / (N + K), 1 auf dem eigenen Grund.
    // `feuchte` (optional): die Feuchte des Orts, wo der Rufer sie schon trägt (die Asche: das Bett des Brands).
    _wuchsAt(x, z, feuchte) {
        const W = AnazhRealm.WUCHS;
        const wasser =
            W.wasserBasis + (1 - W.wasserBasis) * (Number.isFinite(feuchte) ? feuchte : this._feuchteAt(x, z));
        const N = this._naehrstoffAt(x, z);
        return ((wasser * N * (1 + W.naehrK)) / (N + W.naehrK)) * this._bodenLichtFeld(x, z, x, z)(x, z);
    }

    // DER NÄHRSTOFF am Ort (stoffe.K5#2) — EINE Funktion der Taten seiner 16-m-Zelle, kein Speicher daneben: 1 ist der eigene
    // Grund; jede Tat verschiebt ihn um ihr `naehr` (TAT_NARBE: die Ernte und das Fällen tragen ihn mit der Pflanze davon, die
    // Asche des Brands und der Leichnam eines Risses geben ihn dem Boden zurück) und klingt mit ihrer Narbe ab (der Rest fällt
    // linear über ihre Dauer: der Boden mineralisiert nach). Jeder Peer und jeder Reload rechnet dasselbe (die Taten reisen).
    // Während der Index baut (`_tatIndex` misst den Wuchs jeder neuen Tat), zählen die Taten, die er schon trägt — die frühere
    // Tat nährt die spätere, nie umgekehrt.
    _naehrstoffAt(x, z) {
        const J = this._tatIdx && this._tatIdx.baut ? this._tatIdx : this._tatIndex();
        const je = J.n ? J.je.get(this._lifeCellKey(x, z)) : null;
        if (!je) return 1;
        const N = AnazhRealm.TAT_NARBE;
        const h = this._weltStunde();
        let n = 1;
        for (const a of je) {
            const d = J.dauer.get(a);
            if (N[a.tat].naehr && d) n += N[a.tat].naehr * Math.min(1, Math.max(0, 1 - (h - a.h) / d));
        }
        return Math.max(0, Math.min(AnazhRealm.WUCHS.naehrMax, n));
    }

    // DIE SUKZESSION nach dem Brand (stoffe.K5#2): die Asche einer Tat `brand` trägt ihre Zelle durch die Folge Asche → Gras →
    // Busch → Wald, als FUNKTION ihres Rests (s = Alter / Dauer, die Dauer ist die der Narbe im Wuchs des Orts, `_tatDauer`):
    // `asche` (der Kanal G der Boden-Decke, `_ascheMalen`: der Boden-Stoff und die Nah-Wiese lesen ihn) liegt bis
    // SUKZESSION.asche[0] und fällt bis [1] — das Gras kehrt zurück; `busch` (die Kräuter und Sträucher der Nah-Streu,
    // `_nahStreuKachel`) wächst von busch[0] bis [1], `wald` (der Jungwuchs des Walds, `_baumAlter`) von wald[0] bis zur
    // Heilung. Der gefällte Baum (Tat `faellen`) geht dieselbe Folge ab ihrem Wald: `stubben` — der Stumpf treibt ab stubben[0]
    // den Sämling, der bis zur Heilung zum Baum wächst. Die Rampen sind in Stufen gezählt (Achtel, der Jungwuchs in den Stufen
    // seiner Gestalt `SUKZESSION.jugend`; `stufe` ihr Schlüssel): nur dort ändert sich ein Leser, und nur dort weckt der
    // Nachwuchs (`_sukzessionNaechste`).
    _sukzession(a, h = this._weltStunde()) {
        const S = AnazhRealm.SUKZESSION;
        const d = this._tatIndex().dauer.get(a);
        const s = d ? Math.max(0, (h - a.h) / d) : 1;
        const q = ([lo, hi], n = S.stufen) => Math.ceil(Math.min(1, Math.max(0, (s - lo) / (hi - lo))) * n) / n;
        const [J, brand] = [S.jugend.length, a.tat === "brand"];
        const z = {
            s,
            asche: brand ? 1 - q(S.asche) : 0,
            busch: brand ? q(S.busch) : 1,
            wald: brand ? q(S.wald, J) : 1,
            stubben: a.tat === "faellen" ? q(S.stubben, J) : 1,
        };
        z.stufe = [z.asche, z.busch, z.wald, z.stubben].join("|");
        return z;
    }

    // Die nächste Welt-Stunde, zu der sich die Sukzession einer Tat ändert (die nächste Stufen-Grenze einer ihrer Rampen),
    // sonst das Ende ihrer Narbe.
    _sukzessionNaechste(a) {
        const S = AnazhRealm.SUKZESSION;
        const d = this._tatIndex().dauer.get(a);
        if (!d || !Number.isFinite(d)) return Infinity;
        const s = (this._weltStunde() - a.h) / d;
        const J = S.jugend.length;
        let n = 1;
        for (const [[lo, hi], m = S.stufen] of a.tat === "brand"
            ? [[S.asche], [S.busch], [S.wald, J]]
            : [[S.stubben, J]])
            for (let k = 0; k <= m; k++) {
                const g = lo + ((hi - lo) * k) / m;
                if (g > s + 1e-9 && g < n) n = g;
            }
        return a.h + n * d + 1e-6;
    }

    // Die Leser einer Tat folgen ihrer Sukzession, wo sich ihre Stufe änderte (`_sukzStand`: die zuletzt gemalte Stufe je Tat,
    // kein Feld im worldMeta): die Asche malt ihre Narbe (`_ascheMalen`), Wiese und Streu darüber bauen neu, und der Wald setzt
    // seinen Jungwuchs in der Fläche der Narbe (`_tatWaldMalen`); der Stubben treibt den Sämling an seinem Ort.
    _sukzessionMalen(a) {
        const st = this._sukzStand || (this._sukzStand = new WeakMap());
        const stufe = this._sukzession(a).stufe;
        if (st.get(a) === stufe) return false;
        st.set(a, stufe);
        this._tatWaldMalen(a);
        if (a.tat !== "brand") return true;
        const cs = AnazhRealm.LIFE_FIELD.cell;
        const [cx, cz] = [Math.floor(a.x / cs), Math.floor(a.z / cs)];
        if (!this._ascheMalen(cx, cz))
            this._nahRingNeuIn((cx - 0.5) * cs, (cz - 0.5) * cs, (cx + 1.5) * cs, (cz + 1.5) * cs);
        return true;
    }

    // Der Wald am Ort einer Tat steht im Alter seines Orts (`_waldNachwuchs`): die Fläche der Narbe eines Brands (ihre Zelle und
    // die halben Zellen um sie, `_brandNarbe`), der Platz des Stubbens.
    _tatWaldMalen(a) {
        const cs = AnazhRealm.LIFE_FIELD.cell;
        if (a.tat === "faellen") return this._waldNachwuchs(a.x - 1, a.z - 1, a.x + 1, a.z + 1);
        const [cx, cz] = [Math.floor(a.x / cs), Math.floor(a.z / cs)];
        return a.tat === "brand"
            ? this._waldNachwuchs((cx - 0.5) * cs, (cz - 0.5) * cs, (cx + 1.5) * cs, (cz + 1.5) * cs)
            : 0;
    }

    // Der Busch einer Nah-Streu-Pflanze (`_nahStreuKachel`): steht sie in der Narbe eines Brands, wächst sie erst, wenn die
    // Sukzession sie trägt — ihr fester Wurf `ordnung` gegen den Anteil, der am Ort steht (1 − Narbe × (1 − busch): über die
    // Grenze der Narbe dünnt der Brand sie aus wie die Halme). Was nicht brennt (Stein und Holz: ihre Ernte ist kein Kraut),
    // steht durch — der Leser fragt nur die Kräuter.
    _streuNachBrand(x, z, ordnung) {
        const n = this._tatIndex().brand.length ? this._brandNarbe(x, z) : null;
        return !n || ordnung < 1 - n.m * (1 - n.busch);
    }

    // DAS ALTER DES BAUMS AN SEINEM ORT (stoffe.K5#2) ∈ [0, 1]: 1 der gewachsene Wurf des Walds, 0 kein Baum (der Stumpf vor dem
    // Austrieb, die Narbe des Brands vor dem Wald), dazwischen der Jungwuchs — die Stufe seiner Gestalt `SUKZESSION.jugend`
    // (phyto-core `treeParams(…, alter)`): der Stubben eines gefällten Baums binnen ½ m treibt ihn (`stubben`), in der Narbe
    // eines Brands (Narbe ≥ ½, `_brandNarbe`) wächst er mit dem Wald ihrer Sukzession (`wald`); das jüngere gilt. Dasselbe
    // Gesetz wie Gras und Busch. `zelle` wie `_brandNarbe` (der Speicher eines Gangs).
    _baumAlter(x, z, zelle) {
        const I = this._tatIndex();
        if (!I.n) return 1;
        const J = AnazhRealm.SUKZESSION.jugend;
        const alter = (q) => (q > 0 ? J[Math.min(J.length, Math.max(1, Math.round(q * J.length))) - 1] : 0);
        let al = 1;
        for (const a of I.je.get(this._lifeCellKey(x, z)) || [])
            if (a.tat === "faellen" && Math.hypot(a.x - x, a.z - z) <= 0.5)
                al = Math.min(al, alter(this._sukzession(a).stubben));
        const n = I.brand.length ? this._brandNarbe(x, z, zelle) : null;
        return n && n.m >= 0.5 ? Math.min(al, alter(n.wald)) : al;
    }

    // Die Dauer einer Tat in Spielstunden: die Stunden ihrer Klasse (`TAT_NARBE`) durch den Wuchs ihres Orts. Den Wuchs misst
    // die Tat EINMAL, im Augenblick ihres Schreibens (die Lichtung des gefällten Baums, `w`), und trägt ihn im worldMeta — über
    // Save und Reload heilt sie gleich, auch wenn die Kronen ringsum noch nicht wieder stehen. Eine Tat aus einem Stand vor
    // stoffe.K5 misst ihn beim ersten Lesen.
    _tatDauer(a) {
        const N = AnazhRealm.TAT_NARBE;
        if (!Number.isFinite(a.w)) a.w = Math.round(this._wuchsAt(a.x, a.z) * 1e3) / 1e3;
        return N[a.tat].stunden / Math.max(N.lebMin, a.w);
    }

    // DER NACHWUCHS (feld.K4): geheilte Taten fallen aus dem Gedächtnis der Welt (`worldMeta.taten`), ihre Kachel baut neu
    // (`_nahStreuTat`: die Pflanze steht wieder, der Stumpf vergeht) — jede nach ihrer Dauer im Wuchs ihres Orts (`_tatDauer`).
    // `stunde` ist die Welt-Stunde (der Takt reicht
    // `_weltStunde`). DIE RUHE IST DER FIXPUNKT (feld.K3): er schläft bis zur ersten fälligen Heilung (`_nachwuchsFaellig`, die
    // Tat setzt sie); eine geladene Welt (eine neue Liste) weckt ihn einmal. Eine Tat ohne Klasse heilt sofort.
    _tickScatterRegrow(stunde) {
        const wm = this.state.worldMeta;
        const L = wm && wm.taten;
        if (L !== this._tatListe) {
            this._tatListe = L;
            this._nachwuchsFaellig = -Infinity;
            this._sukzStand = null; // eine andere Welt: jede Asche malt ihre Stufe neu
            this._sukzessionNeu = null;
            const wk = this.state.wegeKarte;
            if (wk) for (const stufe of wk.stufen) if (stufe.zentriert) this._ascheStufeMalen(stufe);
        }
        // DIE FRISCHE TAT (die Asche, der Stubben): ihre erste Stufe malt der Nachwuchs, nie der Takt, der sie schrieb (der Brand
        // kostet seine Zellen, die Sukzession ihre Fläche: Narbe, Wiese, Streu und Wald) — bis `malMs` je Bild, mindestens eine;
        // bis w3v-brand-bild malte sie der Schritt des Brands (gate:stand-takt BRAND-ZELLEN 127 Einheiten je Zelle, je Asche 6 ms)
        const Q = this._sukzessionNeu;
        if (Q && Q.length) {
            const [J, frist] = [this._tatIndex(), performance.now() + AnazhRealm.SUKZESSION.malMs];
            let k = 0;
            for (; k < Q.length && (!k || performance.now() < frist); k++)
                if (J.dauer.has(Q[k]) && this._sukzessionMalen(Q[k])) this._weltRegt();
            Q.splice(0, k);
        }
        if (!(stunde >= this._nachwuchsFaellig)) return;
        const I = this._tatIndex();
        let naechste = Infinity;
        const geheilt = [];
        for (const a of L || []) {
            const ende = a && I.dauer.has(a) ? a.h + I.dauer.get(a) : -Infinity;
            if (stunde >= ende) {
                geheilt.push(a);
                continue;
            }
            naechste = Math.min(naechste, ende);
            // die Asche und der Stubben gehen ihre Sukzession (stoffe.K5#2): ihre Leser folgen der Stufe, der Nachwuchs wacht
            // zur nächsten
            if (a.tat === "brand" || a.tat === "faellen") {
                if (this._sukzessionMalen(a)) this._weltRegt();
                naechste = Math.min(naechste, this._sukzessionNaechste(a));
            }
        }
        this._nachwuchsFaellig = naechste;
        if (!geheilt.length) return;
        this._weltRegt(); // die Flora wächst nach (der Weckruf vor jedem Schreiben)
        for (const a of geheilt) L.splice(L.indexOf(a), 1);
        this._tatGen = (this._tatGen | 0) + 1;
        const cs = AnazhRealm.LIFE_FIELD.cell;
        for (const a of geheilt) {
            if (a && a.tat === "brand") this._ascheMalen(Math.floor(a.x / cs), Math.floor(a.z / cs));
            else if (a) this._nahStreuTat(a);
            // der Wald steht wieder gewachsen, wo der Jungwuchs der Tat stand
            if (a) this._tatWaldMalen(a);
        }
    }

    // Die Kachel einer Tat baut neu: der Stumpf eines Fällens tritt ein oder vergeht (die Kachel fällt, ihr Neubau liest die
    // Taten, `_tatStuempfe`), die geheilte Ernte kehrt zurück (ihr Zustand fällt), die gemähte Wiese (halten.K3) fällt und
    // baut sich mit den nachgewachsenen Büscheln neu.
    _nahStreuTat(a) {
        const ns = this.state.nahStreu;
        const K = AnazhRealm.NAH_STREU.kachel;
        const key = typeof a.kachel === "string" ? a.kachel : `${Math.floor(a.x / K)},${Math.floor(a.z / K)}`;
        if (key.startsWith("wiese:")) return void this._nahWieseKachelFaellt(key.slice(6));
        const k = ns ? ns.kacheln.get(key) : null;
        if (!k) return;
        if (a.tat !== "faellen") return void (k.zustand = null);
        this._nahStreuKachelEntsorgen(k);
        ns.kacheln.delete(key);
    }

    // DIE STÜMPFE DER TAT (feld.K4): wo ein Baum fiel, steht sein Stumpf — die Studio-Art `stumpf` des Boden-Gesetzes am Ort
    // der Tat, in der Größe des Baums (in den Grenzen ihrer Skala), bis die Narbe heilt; Kennung `tat|x|z`, pflückbar wie jede
    // Pflanze der Nah-Streu. Die Kachel liegt in EINER 16-m-Zelle des Felds (4 m teilt 16).
    _tatStuempfe(tx, tz, arten) {
        const K = AnazhRealm.NAH_STREU.kachel;
        const I = this._tatIndex();
        const sa = I.n ? arten.findIndex((A) => A.id === "stumpf") : -1;
        const je = sa < 0 ? null : I.je.get(this._lifeCellKey((tx + 0.5) * K, (tz + 0.5) * K));
        const out = [];
        for (const a of je || []) {
            if (a.tat !== "faellen" || Math.floor(a.x / K) !== tx || Math.floor(a.z / K) !== tz) continue;
            const y = this._bodenSichtAt(a.x, a.z);
            if (y === null) continue;
            const same = Math.round(a.x * 977 + a.z * 131) >>> 0;
            const sk = arten[sa].zeile.skala;
            const s = Math.min(sk[1], Math.max(sk[0], a.s || 1));
            const it = {
                art: sa,
                id: `tat|${a.x}|${a.z}`,
                x: a.x,
                y,
                z: a.z,
                rot: (same % 628) / 100,
                s,
                same,
                ordnung: 0,
            };
            this._naturSetzen(null, it, null, () => out.push(it));
        }
        return out;
    }

    // Affinity = wie stark resonieren die Compound-Tags eines Bauplans mit
    // dem Welt-Feld an Position (x, z)? Dot-Product über die 4 Achsen des
    // Welt-Feldes. Resultat 0..1 (sum / 4 da MAX-aggregierte Tags ebenfalls
    // 0..1 nach computeCompoundTags + Felder 0..1). Bauplan-Tags > 1 bei
    // räumlicher Verstärkung würden das überschreiten — wir clampen final.
    spawnAffinityForBlueprint(name, x, z, feuchte) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return 0;
        const world = this.worldFieldAt(x, z);
        const tags = this.computeCompoundTags(bp);
        // Fünfte Stimme: feuchte resoniert mit lebendig (Bäume folgen Flüssen; brennbar resoniert nicht).
        // Der Populator reicht feuchte je Sample (kein Hot-Path-Bucket-Walk); fehlt sie, misst der seltene
        // Direkt-Aufrufer (Diag/UI) selbst. Legacy-Welten: _feuchteAt → 0.
        return this._affinitaet(tags, world, Number.isFinite(feuchte) ? feuchte : this._feuchteAt(x, z));
    }

    // DIE AFFINITÄT (die EINE Formel): Bauplan-Tags × Welt-Feld an einer Stelle × Feuchte. Der Populator rechnet das
    // Feld je Sample EINMAL und die Tags je Chunk EINMAL (`_vegetationSampleSpawn`) — bis Welle K rechnete jeder der
    // zwölf Kandidaten je Sample beides neu (sechs Rausch-Abfragen, alle Teile des Bauplans).
    _affinitaet(tags, world, fw) {
        if (!tags) return 0;
        let score = 0;
        // Vier Achsen × Tag-Wert. Wenn eine Welt-Achse hoch und der Bauplan
        // dort Material-Tag-Wert hoch hat → Resonanz.
        score += world.lebendig * (tags.lebendig || 0);
        score += world.dichte * (tags.dichte || 0);
        score += world.glut * (tags.brennbar || 0); // glut → brennbar (Material-Achse)
        score += world.magieleitung * (tags.magieleitung || 0);
        score += fw * (tags.lebendig || 0) * AnazhRealm.FEUCHTE.affinitaetGewicht;
        return Math.max(0, Math.min(1, score / 4));
    }

    // Der Boden ist Materie: liest DASSELBE Feld wie der Terrain-Shader (`worldFieldAt`); die dominante
    // der vier Achsen nennt das Material an (x,z). Keine Biom-Tabelle — was der Spieler SIEHT, bekommt
    // er beim Graben.
    _terrainMaterialAt(x, z, y) {
        const f = typeof this.worldFieldAt === "function" ? this.worldFieldAt(x, z) : null;
        if (!f) return "stein";
        // Γ1 (genese-plan, Lesart Boden): die FEUCHTE hebt die erde-Achse —
        // Ufer und Niederungen sind grabbar weich (erde schlägt stein), die
        // Farbe, die der Spieler sieht, bleibt das Material, das er bekommt.
        const fw = this._genVersion() >= 2 ? this._feuchteAt(x, z) : 0;
        const axes = [
            [(f.lebendig || 0) + fw * AnazhRealm.FEUCHTE.erdeGewicht, "erde"],
            [f.dichte || 0, "stein"],
            [f.glut || 0, "glut"],
            [f.magieleitung || 0, "quarz"],
        ];
        let best = axes[0];
        for (let i = 1; i < axes.length; i++) {
            if (axes[i][0] > best[0]) best = axes[i];
        }
        // STRATA: mit y schichtet das Material nach Tiefe — mehr als STRATA_STEIN_DEPTH unter `_voxelSurfaceY`
        // wird es "stein", auch wenn die erde-Achse gewinnt (erde/glut/quarz nur am obersten Band).
        // Ohne y bleibt das Verhalten bit-identisch.
        if (typeof y === "number" && Number.isFinite(y)) {
            const surfY = this._voxelSurfaceY ? this._voxelSurfaceY(x, z) : null;
            if (Number.isFinite(surfY)) {
                const depth = surfY - y;
                if (depth > AnazhRealm.STRATA_STEIN_DEPTH) {
                    // IRON-BANDS: tief (> IRON_BANDS.minDepth) und dichte-haltig (> dichteFloor) kann eine vertikale
                    // Eisen-Ader den Stein ersetzen.
                    if (depth > AnazhRealm.IRON_BANDS.minDepth && (f.dichte || 0) > AnazhRealm.IRON_BANDS.dichteFloor) {
                        const ironAder = this._eisenAderAt(x, z);
                        if (ironAder > AnazhRealm.IRON_BANDS.threshold) {
                            return "eisen";
                        }
                    }
                    return "stein";
                }
            }
        }
        return best[1];
    }

    // Ader-Sampler: Single-Octave-Ridge (1−|noise|)² auf (x,z) → vertikale Säulen in 3D, bewusst nicht
    // rotiert, [0,1]. Eigener Seed-Suffix `-iron-bands` (Γ5: re-rollt keinen anderen Welt-Stream).
    _eisenAderAt(x, z) {
        if (!this._ironBandsNoise) {
            const seed = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
            this._ironBandsNoise = new SimplexNoise(seed + "-iron-bands");
        }
        const n = this._ironBandsNoise;
        const SCALE = AnazhRealm.IRON_BANDS.scale;
        const v = n.noise2D(x * SCALE, z * SCALE);
        const nv = 1 - Math.abs(v);
        return nv * nv; // [0, 1] mit Konzentration an Graten
    }

    // Natur-Clumping: EIN seed-deterministisches Klump-Rauschen, zwei Leser auf zwei Skalen — Gras/
    // Büsche λ~28 m (Dickicht ↔ Lichtung), Bäume λ~170 m (Wald ↔ offen). clamp(1 + amp·noise, lo, hi)
    // ist mittelwert-neutral (≈1): die Gesamt-Dichte bleibt, nur die Verteilung ändert sich. Main-only
    // Deko, seed-gebunden (alle Peers gleich); tag-neutral (reiner chance-Skalar, diag-arch-tags wacht).
    _clumpAt(x, z, freq) {
        if (!this._clumpNoise) {
            const seed = ((this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed") + ":clump";
            this._clumpNoise = new SimplexNoise(seed);
        }
        return this._clumpNoise.noise2D(x * freq, z * freq);
    }

    // STAND-Klumpung je Zweck (phytogenesis-standDensity): Γ5-Suffix ':forest' für Bäume λ~170 m,
    // ':meadow' für Unterwuchs λ~40 m. Main-only Deko, seed-gebunden (alle Peers gleich), tag-neutral
    // (reiner chance-Skalar, diag-arch-tags wacht).
    _placementStandAt(x, z, purpose) {
        const P = AnazhRealm.PLACEMENT_DENSITY;
        const suffix = purpose === "meadow" ? ":meadow" : ":forest";
        if (!this._placementNoise) this._placementNoise = {};
        if (!this._placementNoise[suffix]) {
            const seed = ((this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed") + suffix;
            this._placementNoise[suffix] = new SimplexNoise(seed);
        }
        const freq = purpose === "meadow" ? P.meadowFreq : P.forestFreq;
        return this._placementNoise[suffix].noise2D(x * freq, z * freq);
    }

    // DIE EINE Quelle für „wo wächst wie viel": dicht wo feucht + flach + niedrig, licht an Steilhang +
    // Höhe. Achsen: (1) STAND-Klump `_placementStandAt` (mittelwert-neutral) · (2) SLOPE `_slopeAt`
    // (flach favorisiert, auf |∇h| kalibriert) · (3) FEUCHTE `_feuchteAt` (nass → dichter) · (4) HÖHE
    // über Terrain-Basis (hoch → licht). Perf: × `_foliageDensityScale` (headless 1 = voll).
    // `probe` (optional, `AnazhRealm._saatProbe`): Stand, Steilheit und Feuchte dieses Orts aus dem Feld der Saat (im Faden gerechnet).
    _placementDensityFactor(x, z, surfaceY, purpose, probe) {
        const P = AnazhRealm.PLACEMENT_DENSITY;
        const ss = (e0, e1, v) => {
            let t = (v - e0) / (e1 - e0);
            t = t < 0 ? 0 : t > 1 ? 1 : t;
            return t * t * (3 - 2 * t);
        };
        // (1) STAND-Klumpung — Wald ↔ Lichtung / Dickicht ↔ magere Stelle.
        const stand = probe
            ? purpose === "meadow"
                ? probe.standWiese
                : probe.standWald
            : this._placementStandAt(x, z, purpose); // [-1,1]
        const clump = Math.max(P.clumpLo, Math.min(P.clumpHi, 1 + P.clumpAmp * stand));
        // (2) SLOPE-Gate — flach dicht, Steilwand kahl (die Vorlagen-Flach-Präferenz).
        const slope = probe ? probe.steil1 : typeof this._slopeAt === "function" ? this._slopeAt(x, z) : 0;
        const slopeF = 1 - ss(P.slopeLo, P.slopeHi, slope);
        // (3) FEUCHTE-Antrieb — nass → dichter, trocken → licht.
        let wet = probe ? probe.fe : typeof this._feuchteAt === "function" ? this._feuchteAt(x, z, surfaceY) : 0;
        wet = wet < 0 ? 0 : wet > 1 ? 1 : wet;
        const wetF = P.wetBase + P.wetGain * wet;
        // (4) HÖHE über Terrain-Basis — die Höhe lichtet (Vorlagen-`dry`).
        const baseH = (this.state && this.state.terrainBaseHeight) || 0;
        const relH = Number.isFinite(surfaceY) ? surfaceY - baseH : 0;
        const highF = 1 - P.highAmp * ss(P.highLo, P.highHi, relH);
        let f = clump * slopeF * wetF * highF;
        // (5) PERF — der EINE Qualitäts-Regler; headless (Null-Renderer) → 1 (voll).
        const fd = this.state && this.state._foliageDensityScale != null ? this.state._foliageDensityScale : 1;
        f *= fd;
        return f < 0 ? 0 : f;
    }

    // Das Kronenlicht-Feld der PLATZIERUNG, [0,1] (1 = Lichtung, →0 geschlossen): wo Kronen stehen DÜRFEN — der
    // Strauch-Teppich des Chunk-Streuers liest es (er wird mit dem Wald gepflanzt, vor dessen Kronen); das Licht der
    // STEHENDEN Kronen, das Nah-Wiese und Nah-Streu lesen, ist `_bodenLichtFeld`. Liest dieselben Treiber,
    // aus denen der Wald gepflanzt wird (`_placementStandAt("forest")` × wet × Höhe), statt Baum-
    // Positionen (der Wald streamt chunkweise); ohne Slope/Perf (Ökologie ist perf-unabhängig). Rein +
    // seed-gebunden (Γ5); `wetHint` spart den `_feuchteAt`-Zweitaufruf.
    _canopyLightAt(x, z, surfaceY, wetHint) {
        const P = AnazhRealm.PLACEMENT_DENSITY;
        const U = AnazhRealm.UNDERGROWTH;
        const ss = (e0, e1, v) => {
            let t = (v - e0) / (e1 - e0);
            t = t < 0 ? 0 : t > 1 ? 1 : t;
            return t * t * (3 - 2 * t);
        };
        // Kronen-Deckung ≈ die P1-Wald-Dichte (DERSELBE forestStand × wet × Höhe wie
        // `_placementDensityFactor("forest")`, aber ohne Slope/Perf).
        const stand = typeof this._placementStandAt === "function" ? this._placementStandAt(x, z, "forest") : 0; // [-1,1]
        const clump = Math.max(P.clumpLo, Math.min(P.clumpHi, 1 + P.clumpAmp * stand));
        let wet = Number.isFinite(wetHint)
            ? wetHint
            : typeof this._feuchteAt === "function"
              ? this._feuchteAt(x, z, surfaceY)
              : 0;
        wet = wet < 0 ? 0 : wet > 1 ? 1 : wet;
        const wetF = P.wetBase + P.wetGain * wet;
        const baseH = (this.state && this.state.terrainBaseHeight) || 0;
        const relH = Number.isFinite(surfaceY) ? surfaceY - baseH : 0;
        const highF = 1 - P.highAmp * ss(P.highLo, P.highHi, relH); // hoch → weniger Kronen → mehr Bodenlicht
        let cover = clump * wetF * highF;
        if (cover < 0) cover = 0;
        const L = Math.exp(-cover * U.canopyK);
        return L < 0 ? 0 : L > 1 ? 1 : L;
    }

    // ─── DER WALD-GENERATOR (die phytogenesis-plantForest-Ökologie, übersetzt) ───
    // Variabel-radius Poisson-Disc (Kronen-Schüchternheit) + Arten-Nische + reverse-J-Größe + bimodaler
    // Dichte-Gradient + Mammut-Nische. ZELL-DETERMINISTISCH statt globaler Poisson: jede FOREST.cell-Zelle
    // trägt Darts (mulberry32 aus Zelle × Seed), ein Dart steht gegen die ±2-Nachbarzellen per reiner Wahl
    // (prio-Maximum im Konflikt-Radius, Positions-Tiebreak) → reihenfolge-unabhängig (Chunk A→B == B→A).

    // Die geteilte Wald-Noise (this._x, wie `_clumpNoise` — seed-gebunden, kein Snapshot; der Wald-Faden zieht dieselbe
    // Noise aus demselben Seed, `waldCtx` in voxel-worker.js, gate:worker-dichte Teil W). EIN Instanz, an verschiedenen Frequenzen/Offsets
    // gelesen (die Vorlage sampelt ihre `fbm2` genauso mehrkanalig). 2-Oktav-fbm → [0,1].
    _forestFbm(px, pz) {
        if (!this._forestNoise) {
            const seed = ((this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed") + ":forest";
            this._forestNoise = new SimplexNoise(seed);
        }
        const n = this._forestNoise;
        const a = (n.noise2D(px, pz) + 1) * 0.5;
        const b = (n.noise2D(px * 2.7 + 11.3, pz * 2.7 - 5.9) + 1) * 0.5;
        return a * 0.65 + b * 0.35;
    }

    // ─── PLACE-POLICIES: place { mode, layer?, step?, density?, affinity?, siteTag?, seedSuffix? } ───
    // DIE EINE Auflösung: fx.place im Rezept FÜHRT, sonst KIND_POLICY (placeExtra "forest" → "forest",
    // sonst "none"). Unbekannte Felder reisen unangetastet mit; unbekannter/fehlender mode → GESCHLOSSEN
    // "none". Nicht-Buch-Arten (Basis-Nischen, Understory, Fels/Kiesel) leben bewusst außerhalb.
    _placePolicyFor(rec, kindPolicy) {
        const pol = kindPolicy !== undefined ? kindPolicy : rec && AnazhRealm.KIND_POLICY[rec.kind];
        const src = rec && rec.fx && rec.fx.place && typeof rec.fx.place === "object" ? rec.fx.place : null;
        if (src) {
            const out = Object.assign({}, src); // must-preserve: unbekannte Felder reisen unangetastet mit
            out.mode = AnazhRealm.PLACE_MODES[src.mode] === 1 ? src.mode : "none"; // fail-closed
            return out;
        }
        return { mode: pol && pol.placeExtra === "forest" ? "forest" : "none" };
    }
    // DER PLACE-DISPATCH-CHOKEPOINT: place.mode → Kanal-Name oder null (kein Worldgen); er BENENNT nur,
    // die bestehenden Systeme bauen. forest → Wald-Nische (_forestExtraSpecies → planForestCell; Auflösung
    // VOR den Darts, Γ5). scatter → benannt, noch ohne Konsument. hand/none/site → null (siteTag nur als
    // Daten). settlement → `spawnSettlement` (Seed-Stream ":stadt"); Worldgen streut es nicht automatisch.
    _placeDispatch(policy, _ctx) {
        const mode = policy && policy.mode;
        if (mode === "forest") return "forest";
        if (mode === "scatter") return "scatter"; // benannter Kanal — heute ohne Konsument (s. o.)
        if (mode === "settlement") return "settlement"; // N5.7 — deliberater Kanal (spawnSettlement)
        return null;
    }

    // Auto-Arten für den Wald-Generator: alle Wald-fähigen Presets des LIVE-Rezeptbuchs (Place-Auflösung →
    // "forest") ohne historische Nische; Patch-Zentrum + Grundgewicht per Namens-Hash (seed-frei —
    // der Name IST die Identität). Gecacht auf Buch-Identität, sortiert (deterministische Pick-Folge).
    _forestExtraSpecies() {
        const f = this._foundry;
        const book = f && f.recipes;
        if (!book) return [];
        if (this._forestExtraCache && this._forestExtraCacheBook === book) return this._forestExtraCache;
        const BASE = { eiche: 1, fichte: 1, tanne: 1, birke: 1, weide: 1, mammut: 1 };
        const out = [];
        const ids = Object.keys(book).sort();
        for (const id of ids) {
            const rec = book[id];
            // Wald-Fähigkeit aus der EINEN Place-Auflösung + Dispatch-Chokepoint, nie direkt aus placeExtra.
            // Der prefix bleibt Pflicht (fail-closed: ohne Namensregel keine Nische).
            const _pol = rec && AnazhRealm.KIND_POLICY[rec.kind];
            if (!_pol || !_pol.prefix || BASE[id]) continue;
            if (this._placeDispatch(this._placePolicyFor(rec, _pol), { id }) !== "forest") continue;
            let h = 2166136261 >>> 0;
            for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619) >>> 0;
            out.push({
                species: _pol.prefix + id,
                w0: 0.18, // bescheidenes Grundgewicht — die neue Art mischt sich ein, dominiert nicht
                center: 0.05 + (h % 1000) / 1110, // Patch-Zentrum ∈ [0.05, 0.95] — eigene Haine
            });
        }
        this._forestExtraCache = out;
        this._forestExtraCacheBook = book;
        return out;
    }

    _forestStandDensity(x, z) {
        // „Drähte statt Kopien" (08.07.): die Formel lebt in phyto-core (forestStandDensity —
        // Studio-Modell: Mittel 0.72, Kontrast 1.35, dichte Kerne + gelichtete Säume); hier nur
        // der Draht mit AnazhRealms fbm. Diag-Linsen (diag-forest-*) lesen weiter diese Methode.
        const core = typeof globalThis !== "undefined" && globalThis.__phytoCore;
        if (core && typeof core.forestStandDensity === "function")
            return core.forestStandDensity((px, pz) => this._forestFbm(px, pz), x, z);
        return 0;
    }

    // Der Welt-Seed als 32-bit-Int (fnv-1a, gecacht) — treibt die Zell-Hashes → alle
    // Peers/Reloads sehen denselben Wald (Γ5: seed-deterministisch, nie Math.random).
    _forestSeedInt() {
        const s = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
        if (this._forestSeedStr === s && this._forestSeedVal != null) return this._forestSeedVal;
        let h = 2166136261 >>> 0;
        for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
        this._forestSeedStr = s;
        this._forestSeedVal = h >>> 0;
        return this._forestSeedVal;
    }

    // Ein deterministischer mulberry32 pro Zelle (Hash aus Zell-Koord × Welt-Seed).
    _forestCellRng(cx, cz, seedInt) {
        // Draht zur EINEN Quelle (phyto-core.forestCellRng) — Diag-Linsen lesen weiter hier.
        const core = typeof globalThis !== "undefined" && globalThis.__phytoCore;
        if (core && typeof core.forestCellRng === "function") return core.forestCellRng(cx, cz, seedInt);
        return () => 0;
    }

    // DIE WAHRHEIT DES WALDS (K20): die Darts lesen Boden, Wasser und Feuchte (`_voxelSurfaceY`, `_atlasWaterLevelAt`,
    // `_feuchteAt` — Erosion, Flüsse und Seen der Hydro-Kachel ihres Orts). Vor dem Worldgen (keine Heimat-Hydrosphäre)
    // gibt es sie nicht: jede Antwort des Walds ist dann vorläufig und wird nie gemerkt (`_forestCellDarts`), die Gestalt
    // des Orts wartet (`_foundryGestaltFor` → null, wie auf ein kaltes Buch).
    _forestGesetzWahr() {
        const h = this.state.hydrosphere;
        return !!(h && h.ready);
    }

    // DER STAND DES WALD-GESETZES (K20): die Darts sind eine Funktion von Welt-Same, Arten-Satz (die Arten des Buchs,
    // `_forestExtraSpecies`) und Hydrosphäre. Ein neuer Same, ein neues Buch, eine neue Hydrosphäre (der Welt-Regen) oder neue
    // Arten (`_foundryAutoRegisterSpecies` leert das Gedächtnis) legen ein neues Dart-Gedächtnis an — seine Nummer IST der
    // Stand. Wer eine Antwort des Walds merkt (die Gestalt des Orts `_foundryGestaltFor`, die Streu-Gestalt
    // `_scatterFoundrySeed`), merkt sie an diesem Stand, nie an der Reihenfolge: der Zweit-Boot fragte den gesetzten Baum,
    // bevor die Wasser-Wahrheit seines Orts stand, und seine Gestalt blieb die eines anderen Walds (A1-Eiche bei −740/−1190:
    // Gestalt 1 statt 2; gate:fernwald E).
    _forestDartStand(seedInt) {
        const buch = this._foundry ? this._foundry.recipes || null : null;
        const hydro = this.state.hydrosphere || null;
        if (
            !this._forestDartMemo ||
            this._forestDartMemoSeed !== seedInt ||
            this._forestDartMemoBuch !== buch ||
            this._forestDartMemoHydro !== hydro
        ) {
            this._forestDartMemo = new Map();
            this._forestDartMemoSeed = seedInt;
            this._forestDartMemoBuch = buch;
            this._forestDartMemoHydro = hydro;
            this._forestDartGen = (this._forestDartGen || 0) + 1;
        }
        return this._forestDartGen;
    }

    // DER WALD FÄLLT AM ORT (K69, Lehre 25): legt ein Ort seinen Erdbau über die Flächen im Kasten x0…x1 · z0…z1, ändern sich
    // die geborenen Darts nur in den Zellen, die der Kasten samt Böschung (`ERDBAU.reichweiteM`, dazu die Hang-Probe von 2 m)
    // oder samt der größten Krone (`KRONE_MAX_M`: `ortFrei` fragt die Krone gegen die Fläche) berührt — und mit ihnen der Bestand
    // jeder Zelle, die sie als Urteils-Nachbarn liest (±`WALD_PLAN.urteil`). Nur diese fallen aus dem Dart-Gedächtnis des Stands
    // (der Stand bleibt), mit ihnen die Freistand-Antwort jedes Orts, der diesen Bestand liest (±4 Zellen darum,
    // `_forestStehtFrei`), und die Gestalt des Orts dort (`_ortSameFaellt`). Bis K69 fiel das Gedächtnis der ganzen Welt
    // (`_forestDartMemo = null`, ein neuer Stand) — und mit ihm jede Gestalt jedes Orts.
    // DER FALL IST EIN KASTEN AUCH FÜR DIE LIEFERUNG IM FLUG (w13-dorf-strom): der Kasten der Zellen samt Urteils-Nachbarn steht
    // mit dem Stand des Erdbaus, der ihn warf, im Gedächtnis der Fälle (`_erdbauFaelle`) — eine Lieferung des Wald-Fadens, die vor
    // ihm geschickt wurde, verwirft nur ihre Zellen darin (`_erdbauFielSeit`, `_waldDartsAn`).
    // DER FALL IST EIN KASTEN AUCH FÜR DIE GEBORENEN (w14-strom-tempo): das Gedächtnis der geborenen Darts (`_forestGeborenKarte`,
    // im Faden `waldGeboren` und `kammGeboren`) verliert nur die Zellen des Kastens — der Faden mit dem Erdbau im selben Zustand
    // (`waldFall`, voxel-worker `applyStateDelta`). Bis w14-strom-tempo trug der Stand-Schlüssel den Stand des Erdbaus und des
    // Falls: jeder Ort im Vorlauf warf beide Gedächtnisse ganz, und der Faden plante jede Zelle mit ihren Urteils-Nachbarn neu
    // (25 Zellen je Bestand). → der Kasten der geborenen Zellen [ga, gb, ha, hb].
    _forestDartsFallen(x0, z0, x1, z1) {
        const C = AnazhRealm.FOREST.cell;
        const U = AnazhRealm.WALD_PLAN.urteil;
        const R = Math.max(globalThis.__gelaendeCore.ERDBAU.reichweiteM + 2, AnazhRealm.KRONE_MAX_M);
        const ga = Math.floor((x0 - R) / C);
        const gb = Math.floor((x1 + R) / C);
        const ha = Math.floor((z0 - R) / C);
        const hb = Math.floor((z1 + R) / C);
        const F = this._erdbauFaelle || (this._erdbauFaelle = []);
        F.push([this._erdbauStand | 0, ga - U, gb + U, ha - U, hb + U]);
        if (F.length > AnazhRealm.WALD_PLAN.faelle) F.shift();
        const K = this._forestGeboren;
        if (K && K.karte.size)
            for (let gx = ga; gx <= gb; gx++) for (let gz = ha; gz <= hb; gz++) K.karte.delete(gx + "," + gz);
        const kasten = [ga, gb, ha, hb];
        const memo = this._forestDartMemo;
        if (!memo || !memo.size) return kasten;
        let n = 0;
        for (let gx = ga - U; gx <= gb + U; gx++)
            for (let gz = ha - U; gz <= hb + U; gz++) if (memo.delete(gx + "," + gz)) n++;
        if (n) this._forestDartFall = (this._forestDartFall | 0) + 1; // kein stehender Kasten gilt mehr (`_waldPlanSteht`)
        const fm = this._freistandMemo;
        if (fm && fm.size && this._freistandMemoVon === memo)
            for (const k of fm.keys()) {
                const i = k.indexOf(",");
                const gx = Math.floor(Number(k.slice(0, i)) / C);
                const gz = Math.floor(Number(k.slice(i + 1, k.indexOf(",", i + 1))) / C);
                if (gx >= ga - 6 && gx <= gb + 6 && gz >= ha - 6 && gz <= hb + 6) fm.delete(k);
            }
        this._ortSameFaellt((ga - 6) * C, (ha - 6) * C, (gb + 7) * C, (hb + 7) * C);
        return kasten;
    }

    // DER BESTAND EINER ZELLE (w4-b-pflanzen): ihre STEHENDEN Darts — die geborenen (`_forestGeborene`), die das Urteil der
    // Kronen-Schüchternheit trägt (phyto-core `forestStehende` über die geborenen Darts der Zellen ±2), in der Reihe ihrer
    // Geburt. Zell-Memo über Aufrufe (das Dart-Gedächtnis des Stands, `_forestDartStand`): seed-gebunden, bounded (voll →
    // clear); Instanz-Feld, kein state/Snapshot. Die Wahrheit zuerst (`_forestGesetzWahr`): wie der Chunk-Bau
    // (`_acquireVoxelChunkBuild`) stehen die Hydro-Kacheln der Zelle und ihrer Urteils-Nachbarn (±2) vor der Frage; vor dem
    // Worldgen ist die Antwort vorläufig (`vorlaeufig`) und kein Gedächtnis. Mit Voxel-Faden rechnet der Wald-Faden jeden
    // Bestand (`_waldFadenSchicken`) und der Haupt-Faden urteilt keinen Dart; ohne Faden (und vorläufig) urteilt hier dasselbe
    // Gesetz. `geborenMerk` (optional, der vorläufige Pflanz-Gang): die geborenen Darts je Zelle ohne Stand-Gedächtnis.
    // Bis w4-b-pflanzen trug das Gedächtnis die GEBORENEN Darts und jeder Leser urteilte selbst (`_forestDartSteht`).
    _forestCellDarts(cx, cz, seedInt, geborenMerk) {
        const memoKey = cx + "," + cz;
        let memo = null;
        const C = AnazhRealm.FOREST.cell;
        if (this._forestGesetzWahr()) {
            this._forestDartStand(seedInt);
            memo = this._forestDartMemo;
            const hit = memo.get(memoKey);
            if (hit) return hit;
            // fehlt eine Kachel, ist sie im Faden bestellt (Karte hydro-faden) — die Antwort bis dahin ist vorläufig
            if (this._ensureHydroTilesAround((cx + 0.5) * C, (cz + 0.5) * C, (AnazhRealm.WALD_PLAN.urteil + 1) * C))
                memo = null;
        }
        const G = memo ? this._forestGeborenKarte() : geborenMerk || new Map();
        const geboren = (gx, gz) => {
            const k = gx + "," + gz;
            let a = G.get(k);
            if (!a) G.set(k, (a = this._forestGeborene(gx, gz, seedInt, !memo)));
            return a;
        };
        const out = globalThis.__phytoCore.forestStehende(cx, cz, geboren, AnazhRealm.FOREST.pack);
        if (!memo) {
            out.vorlaeufig = true;
            return out;
        }
        this._forestDartRaum(memo, 1);
        memo.set(memoKey, out);
        return out;
    }

    // DIE SCHRANKE DES DART-GEDÄCHTNISSES räumt die FERNSTEN Zellen (Gebot 7, w12-dorf-strom): fasst das Gedächtnis `dazu`
    // weitere Zellen nicht mehr (`WALD_PLAN.zellen`), fallen die Zellen mit dem größten Rang (`_spielerD2`, die Zeit bis
    // Bedarf) bis auf drei Viertel; der Plan um den Spieler bleibt. Die Darts einer Zelle sind eine reine Funktion des Stands
    // — kein Stand fällt, nur die stehenden Kästen (`_waldPlanVoll`) fragen neu. Bis w12-dorf-strom warf die Schranke das
    // ganze Gedächtnis (`memo.clear()`): die Fahrt ins Dorf lud 11 108 Zellen, jeder Überlauf nahm den Plan aller Bäume vor
    // dem Spieler, die Schlange stieg auf 1 330 Zellen, und 572 von 578 Bäumen traten ohne Gestalt in den Sichtkegel.
    _forestDartRaum(memo, dazu) {
        const N = AnazhRealm.WALD_PLAN.zellen;
        if (memo.size + dazu <= N) return 0;
        const C = AnazhRealm.FOREST.cell;
        const rang = [];
        for (const k of memo.keys()) {
            const i = k.indexOf(",");
            rang.push([this._spielerD2((Number(k.slice(0, i)) + 0.5) * C, (Number(k.slice(i + 1)) + 0.5) * C), k]);
        }
        rang.sort((a, b) => b[0] - a[0]);
        const weg = Math.min(rang.length, memo.size + dazu - ((N * 3) >> 2));
        for (let i = 0; i < weg; i++) memo.delete(rang[i][1]);
        this._waldPlanVoll = null;
        return weg;
    }

    // Das Gedächtnis der GEBORENEN Darts am Stand des Dart-Gedächtnisses (`_forestDartMemo` und der Boden ohne Kasten — derselbe
    // Schlüssel wie der des Fadens, `_waldStandSchluessel`): die Urteils-Nachbarn eines Bestands sind die Zellen des nächsten. Ein
    // neuer Stand legt es neu an, ein Erdbau nimmt die Zellen seines Kastens (`_forestDartsFallen`), voll fallen die ältesten
    // (`WALD_PLAN.geboren`, ein Viertel: die Fahrt ließ sie hinter sich — bis w14-strom-tempo fiel das ganze).
    _forestGeborenKarte() {
        const stand = this._waldStandSchluessel();
        let K = this._forestGeboren;
        if (!K || K.memo !== this._forestDartMemo || K.stand !== stand)
            K = this._forestGeboren = { memo: this._forestDartMemo, stand, karte: new Map() };
        AnazhRealm._waldGeborenRaum(K.karte, AnazhRealm.WALD_PLAN.geboren);
        return K.karte;
    }

    // Die GEBORENEN Darts einer Zelle, reine Funktion von (cx, cz, seed): standDensity-Wurf → Boden/Wasser → Slope →
    // Arten-Nische → reverse-J-Größe → Mammut (phyto-core `planForestCell`). Nur geborene Darts treten in die
    // Kronen-Schüchternheit ein (`forestStehende`); ihr Leser ist der Bestand (`_forestCellDarts`). `vorlaeufig`: die Antwort
    // steht vor der Wahrheit des Gesetzes (oder ohne die Kacheln ihrer Nachbarn) und wird nie gemerkt.
    _forestGeborene(cx, cz, seedInt, vorlaeufig) {
        // Die Pflanz-Logik lebt EINMAL in phyto-core (planForestCell); hier nur die Welt-Reads als ctx-
        // Funktionen (Oberfläche · Wasser · Slope · Feuchte · fbm). Ohne Kern → leerer Wald.
        const core = typeof globalThis !== "undefined" && globalThis.__phytoCore;
        // Das Wasser eines Darts ist das Gesetz über SEINEM Boden (`_atlasWaterLevelAt`, die Hälfte von `_landAt`, aus der
        // das Bild wird): der Plan bleibt eine reine Funktion von Zelle und Same (jeder Peer, jede Lade-Reihenfolge derselbe
        // Wald) — das gezeichnete Wasser fragt die Natur-Wand beim Setzen (`_naturWand` → `_landAt`). Der Kern liest erst die
        // Oberfläche, dann das Wasser derselben Stelle — der Boden reist mit. Bis Schau-2 (09.10.) las der Wald den Bezug
        // der Ufer-Bänder (`_waterLevelAt`).
        let bodenX = NaN;
        let bodenZ = NaN;
        let bodenY = null;
        const out =
            core && typeof core.planForestCell === "function"
                ? core.planForestCell(cx, cz, seedInt, {
                      F: AnazhRealm.FOREST,
                      baseH: (this.state && this.state.terrainBaseHeight) || 0,
                      extras: this._forestExtraSpecies(),
                      fbm: (px, pz) => this._forestFbm(px, pz),
                      surfaceYAt: (x, z) => {
                          bodenX = x;
                          bodenZ = z;
                          bodenY = this._voxelSurfaceY(x, z);
                          return bodenY;
                      },
                      waterYAt: (x, z) =>
                          this._atlasWaterLevelAt(
                              x,
                              z,
                              x === bodenX && z === bodenZ ? bodenY : this._voxelSurfaceY(x, z)
                          ),
                      slopeAt: (x, z) =>
                          typeof this._slopeAt === "function"
                              ? this._slopeAt(x, z, (px, pz) => this.getTerrainHeightAt(px, pz), 2)
                              : 0,
                      feuchteAt: (x, z, sy) => (typeof this._feuchteAt === "function" ? this._feuchteAt(x, z, sy) : 0),
                      // der Ort vor dem Wald (K10): keine Krone über dem Grund eines Orts (`_ortFrei`, der Erdbau)
                      ortFrei: (x, z, T) => this._ortFrei(x, z, T),
                  })
                : [];
        if (vorlaeufig) out.vorlaeufig = true;
        return out;
    }

    // DER WALD PLANT IM TAKT (K69, Lehre 14 + 25): eine frische Wald-Zelle zu planen kostet 1–3 ms (`planForestCell`, ~160
    // Sichthöhen); die Gestalt EINES Baums in frischem Wald fragt bis zu 9 × 9 Zellen (den Bestand im Freistand ±4,
    // `WALD_PLAN.reich`; das Urteil jedes Darts trägt sein Bestand). Bis K69 plante der erste Frager am Stück — beim Gang ins Dorf die Ausstattung des Dorfs
    // 366 Zellen in EINER Aufgabe neben dem Takt (551 ms, Null-Renderer), ein Takt 113 Zellen (245 ms). Jetzt fragt die
    // Gestalt des Orts (`_ortGestaltSame`) hier: steht der Plan um (x, z), gilt ihr Urteil sofort; fehlen Zellen, bestellt sie
    // sie in der Schlange des Walds (`_tickWaldPlan`) und wartet — wie auf ein kaltes Buch, so warten ihre Leser schon (die
    // Hülle, die Streu, die Promotion, die Karte). Die Frage merkt ihre fehlenden Zellen je Zelle des Orts: jede weitere
    // kostet einen Blick, bis die letzte steht. Fiel eine bestellte Zelle aus der Schlange (ein neuer Stand, ein Erdbau),
    // bestellt die Frage neu.
    // DER STEHENDE KASTEN BLEIBT STEHEN (w4-ankunft-2): stand der Kasten einer Zelle, steht er, bis eine Zelle aus dem Gedächtnis
    // fällt (`_forestDartFall`: ein Erdbau, die Schranke) oder ein neues Gedächtnis kommt — bis dahin fragte jede Gestalt seine
    // Zellen neu (169, swiftshader kalt bis zum Bild 0,6–0,9 s).
    _waldPlanSteht(x, z) {
        const memo = this._forestDartMemo;
        if (!memo) return false;
        const C = AnazhRealm.FOREST.cell;
        const gx = Math.floor(x / C);
        const gz = Math.floor(z / C);
        const bk = gx + "," + gz;
        const V = this._waldPlanVoll;
        if (V && V.memo === memo && V.fall === (this._forestDartFall | 0) && V.kaesten.has(bk)) return true;
        if (!this._waldWarten || this._waldWarten.size > 4096) this._waldWarten = new Map();
        const Q = this._waldPlanSchlange || (this._waldPlanSchlange = new Map());
        let fehlt = this._waldWarten.get(bk);
        if (fehlt) {
            while (fehlt.length && memo.has(fehlt[fehlt.length - 1])) fehlt.pop();
            if (fehlt.length) {
                if (!Q.has(fehlt[fehlt.length - 1]))
                    for (const k of fehlt) {
                        if (memo.has(k) || Q.has(k)) continue;
                        const i = k.indexOf(",");
                        Q.set(k, [Number(k.slice(0, i)), Number(k.slice(i + 1))]);
                    }
                return false;
            }
            this._waldWarten.delete(bk);
        }
        const R = AnazhRealm.WALD_PLAN.reich;
        fehlt = [];
        if (this._waldPlanKasten(gx - R, gz - R, gx + R, gz + R, fehlt)) {
            let W = this._waldPlanVoll;
            if (!W || W.memo !== memo || W.fall !== (this._forestDartFall | 0) || W.kaesten.size > 16384)
                W = this._waldPlanVoll = { memo, fall: this._forestDartFall | 0, kaesten: new Set() };
            W.kaesten.add(bk);
            return true;
        }
        this._waldWarten.set(bk, fehlt);
        return false;
    }

    // Der Plan des Walds im Zell-Kasten ga…gb · ha…hb (inklusiv): true = jede Zelle steht im Dart-Gedächtnis des Stands;
    // sonst bestellt er die fehlenden in der Schlange des Walds (`_tickWaldPlan`), merkt sie in `fehlt` (optional) → false.
    _waldPlanKasten(ga, ha, gb, hb, fehlt) {
        const memo = this._forestDartMemo;
        if (!memo) return false;
        const Q = this._waldPlanSchlange || (this._waldPlanSchlange = new Map());
        let steht = true;
        for (let gx = ga; gx <= gb; gx++)
            for (let gz = ha; gz <= hb; gz++) {
                const k = gx + "," + gz;
                if (memo.has(k)) continue;
                steht = false;
                if (fehlt) fehlt.push(k);
                if (!Q.has(k)) Q.set(k, [gx, gz]);
            }
        return steht;
    }

    // Der Zell-Kasten, den der Pflanz-Gang eines Chunks liest: seine Zellen — ihr Bestand trägt das Urteil schon (bis
    // w4-b-pflanzen samt ±2, die Nachbarn des Urteils im Haupt-Faden).
    _waldPflanzKasten(cx, cz) {
        const { span } = this._voxelChunkConfig();
        const C = AnazhRealm.FOREST.cell;
        const ox = cx * span;
        const oz = cz * span;
        return [Math.floor(ox / C), Math.floor(oz / C), Math.floor((ox + span) / C), Math.floor((oz + span) / C)];
    }

    // DIE SCHLANGE DES WALDS (K69): der Takt-Planer (Job `waldPlan`, Welt-Substanz) nimmt die bestellten Zellen
    // (`_waldPlanSteht`) nah zuerst. IHR RECHNER IST DER WALD-FADEN (K60-3, `_waldFadenSchicken`): wo ein Voxel-Faden lebt,
    // plant der Haupt-Faden keine Zelle der Schlange — jede reist an den Wald-Faden, sobald sie bestellt ist, und landet im
    // Gedächtnis (`_waldDartsAn`). Ohne Faden plant der Takt je Takt höchstens `WALD_PLAN.ms` (mindestens eine Zelle — nie
    // verhungert; der Lade-Takt gibt sein ganzes Budget). Bis zur Vereinigung K60-4 bestellte die Streu ihre Darts an der
    // Schlange vorbei beim Faden (`_waldDartsBestellen`), und jeder andere Leser plante im Haupt-Faden: zwei Wege an EIN
    // Gedächtnis. Ihre Regung (`_waldPlanGeplant`) weckt die Fege-Takte und die Zusagen, deren Kasten steht — auch wenn ein
    // anderer Leser die Zellen plante (die Liste wirft sie aus der Schlange). → die Zahl der Zellen.
    _tickWaldPlan(ms) {
        const Q = this._waldPlanSchlange || (this._waldPlanSchlange = new Map());
        const [P, N] = [this._waldPflanzWarten, this._waldNachwuchsWarten];
        if (!Q.size && !(P && P.size) && !(N && N.size)) return 0;
        if (!this._forestGesetzWahr()) return 0;
        const seedInt = this._forestSeedInt();
        const t0 = performance.now();
        const vor = Q.size;
        let n = 0;
        if (this._waldFadenLebt()) this._waldFadenSchicken(seedInt);
        else {
            this._forestDartStand(seedInt);
            const liste = this._waldPlanListe(null);
            const budget = Number.isFinite(ms) ? ms : Infinity;
            const frist = this._ladeTakt() ? budget : Math.min(budget, AnazhRealm.WALD_PLAN.ms);
            for (const [, k, g] of liste) {
                if (n > 0 && performance.now() - t0 >= frist) break;
                this._forestCellDarts(g[0], g[1], seedInt);
                Q.delete(k);
                n++;
            }
        }
        // die wartenden Pflanz-Gänge (`_forestPlantChunk`): steht der Plan ihres Chunks, pflanzt die Schlange ihn jetzt — auch
        // wenn sein Chunk inzwischen ging: die Pflanzung geschieht EINMAL je Chunk (`voxelPopulatedChunks` fällt nie), ein
        // verworfener Gang ließ seinen Wald für immer leer (K69-2: die Klang-Linse fand am Waldort 5 Bäume ≤ 15 m)
        if (P && P.size)
            for (const key of [...P]) {
                const i = key.indexOf(",");
                const cx = Number(key.slice(0, i));
                const cz = Number(key.slice(i + 1));
                if (this._waldPlanKasten(...this._waldPflanzKasten(cx, cz))) this._forestPlantChunk(cx, cz);
            }
        // die wartenden Kästen des Jungwuchses (`_waldNachwuchs`): ihr Plan steht → der Wald wechselt dort sein Alter
        for (const [k, b] of [...(N || [])]) (N.delete(k), this._waldNachwuchs(...b));
        if (n > 0 || Q.size < vor) this._waldPlanGeplant(t0);
        return n;
    }

    // Die offenen Zellen der Schlange nach dem EINEN Rang ([Rang², `_spielerD2` — die Zeit bis Bedarf, im Stand der Abstand², Schlüssel, [gx, gz]]): was das Gedächtnis schon trägt, fällt aus ihr;
    // was im Flug ist (`flug`, optional), bleibt in ihr, aber nicht in der Liste.
    _waldPlanListe(flug) {
        const Q = this._waldPlanSchlange;
        const memo = this._forestDartMemo;
        const C = AnazhRealm.FOREST.cell;
        const liste = [];
        for (const [k, g] of Q) {
            if (memo.has(k)) Q.delete(k);
            else if (!flug || !flug.has(k)) liste.push([this._spielerD2((g[0] + 0.5) * C, (g[1] + 0.5) * C), k, g]);
        }
        liste.sort((a, b) => a[0] - b[0]);
        return liste;
    }

    // Zellen sind geplant (von welchem Rechner auch immer): die Regung (`_waldPlanRegung`) liest der Stand-Stempel — sie
    // weckt die Fege-Takte, wenn die Schlange leer ist, und solange sie plant, höchstens alle 250 ms.
    // DIE STREU WARTET AUF DEN WALD WIE AUF IHR ASSET (K69-2): eine Streu-Region, deren Bäume auf die Gestalt ihres Orts
    // warten (`_scatterFoundrySeed` → null), schiebt sich auf (`_deferredFoundry`) und wartet benannt auf die Zellen ihrer
    // Kästen (`_waldPlanZusage`, ihr Wecker `_streuWeckerSpannen`): jede Zusage, deren Kasten keine Zelle mehr in der Schlange
    // hat, kommt hier. Ohne Nachschub stand sie für immer: Null-Gang an der Mess-Wiese 6 von 6 Regionen nach geleerter
    // Schlange aufgeschoben (CI 38736568849). Ist die Schlange leer, baut jede geweckte Region neu wie nach einer Lieferung.
    _waldPlanGeplant(t0) {
        const Q = this._waldPlanSchlange;
        const leer = !(Q && Q.size);
        if (leer || !(t0 < this._waldPlanWeckBis)) {
            this._waldPlanRegung = (this._waldPlanRegung | 0) + 1;
            this._waldPlanWeckBis = t0 + 250;
        }
        const Z = this._waldZusagen;
        if (Z && Z.size)
            for (const [bk, e] of Z) {
                const f = e.zellen;
                while (f.length && !(Q && Q.has(f[f.length - 1]))) f.pop();
                if (f.length) continue;
                Z.delete(bk);
                e.loesen();
            }
        if (leer) this._scatterRefillPending = true;
    }

    // DIE ZUSAGE DES PLANS UM (x, z) (B-Wald; der Wecker der Streu wartet auf sie, `_wartetAuf`): sie kommt, sobald keine
    // Zelle IHRES Kastens — die fehlenden ±`reich`, die `_waldPlanSteht(x, z)` eben bestellte — mehr in der Schlange steht; null,
    // wenn dort nichts aussteht. Bis B-Wald wartete jede Region auf die LEERE Schlange: GTX kalt warteten die 4 Wald-Stücke der
    // Ankunft bis 14,8 s, zuletzt auf Zellen in 405–467 m Ferne (p3/n1910/kette, K2).
    _waldPlanZusage(x, z) {
        const C = AnazhRealm.FOREST.cell;
        const bk = Math.floor(x / C) + "," + Math.floor(z / C);
        const Z = this._waldZusagen || (this._waldZusagen = new Map());
        const da = Z.get(bk);
        if (da) return da.zusage;
        const Q = this._waldPlanSchlange;
        const fehlt = this._waldWarten ? this._waldWarten.get(bk) : null;
        const zellen = fehlt && Q ? fehlt.filter((k) => Q.has(k)) : [];
        if (!zellen.length) return null;
        let loesen = null;
        const zusage = new Promise((res) => (loesen = res));
        Z.set(bk, { zusage, loesen, zellen });
        return zusage;
    }

    // Der Wald-Faden kann rechnen: ein Voxel-Faden lebt, und seine Quelle ist bekannt (`_voxelWorkerWaldDarts`).
    _waldFadenLebt() {
        return !!(this.state.voxelWorker && this._voxelFadenQuelle);
    }

    // Der Stand, an dem der Wald-Faden seine geborenen Darts merkt (die Urteils-Nachbarn des Bestands, voxel-worker
    // `waldDarts`): das Dart-Gedächtnis des Main (Same, Buch, Hydrosphäre — `_forestDartGen`), sein Fall (Erdbau, Schranke)
    // und der Erdbau — wechselt einer, rechnet der Faden jede Zelle neu, wie der Main sie neu fragt.
    // Ein Erdbau mit Kasten fällt nur seine Zellen (`_forestDartsFallen`, im Faden `waldFall`); den Schlüssel wechselt nur ein
    // Erdbau ohne Kasten (`_erdbauGanz`: der Boden-Umzug legt jeden Ort neu).
    _waldStandSchluessel() {
        return (this._forestDartGen | 0) + "|" + (this._erdbauGanz | 0);
    }

    // DER STOFF DES WALDS IM FADEN (K60-3, B-Wald): JEDE offene Zelle der Schlange reist, sobald sie bestellt ist — nah zuerst,
    // je Auftrag `WALD_PLAN.faden` Zellen, alle zugleich im Flug; der Faden rechnet je Takt den nächsten (`rang`, seine Schlange
    // `waldAuftraege`), jede Antwort landet für sich per Transfer (`_waldDartsAn`). Bis B-Wald hielt die Schlange 2 Aufträge im
    // Flug, der nächste ging mit der Ankunft des vorigen — und die kam erst am Ende der Aufgabe des Haupt-Fadens, in der der
    // Faden fertig wurde (GTX kalt 38 von 42): je Lade-Bild EINE Runde von 128 Zellen, der Faden rechnete 3,37 s und seine
    // Antworten warteten 12,57 s (p3/n1910/kette, K2). Die Wahrheit jeder Zelle reist vor ihr (`_ensureHydroTilesAround`), der
    // Zustand über den EINEN Sender. Bis K60-3 rechnete der Haupt-Faden jeden Dart der Streu selbst: Radeon kalt bis zum ersten
    // Bild 1,6 von 2,2 s Streu (K602c/q2: `_forestCellDarts` 1,9 s, davon die Oberfläche 1,5 s).
    _waldFadenSchicken(seedInt) {
        this._forestDartStand(seedInt);
        const memo = this._forestDartMemo;
        if (this._waldFlugVon !== memo || !this._waldFlug) {
            this._waldFlug = new Set(); // die Zellen im Flug gelten dem Gedächtnis, für das sie geschickt wurden
            this._waldFlugVon = memo;
        }
        const N = AnazhRealm.WALD_PLAN.faden;
        const flug = this._waldFlug;
        const liste = this._waldPlanListe(flug);
        if (!liste.length) return;
        const C = AnazhRealm.FOREST.cell;
        const R = (AnazhRealm.WALD_PLAN.urteil + 1) * C;
        const extras = this._forestExtraSpecies();
        const erd = this._erdbauStand | 0;
        const stand = this._waldStandSchluessel();
        for (let a = 0; a < liste.length; a += N) {
            const zellen = [];
            for (let b = a; b < Math.min(liste.length, a + N); b++) {
                const g = liste[b][2];
                // fehlt eine Kachel der Zelle oder ihrer Urteils-Nachbarn, ist sie im Faden bestellt (Karte hydro-faden): die
                // Zelle wartet in der Schlange
                if (this._ensureHydroTilesAround((g[0] + 0.5) * C, (g[1] + 0.5) * C, R)) continue;
                flug.add(liste[b][1]);
                zellen.push(g[0], g[1]);
            }
            if (!zellen.length) continue;
            this._voxelWorkerWaldDarts(new Int32Array(zellen), seedInt, extras, liste[a][0], stand).then(
                (r) => this._waldDartsAn(memo, zellen, r, erd),
                (e) => {
                    this._waldDartsAn(memo, zellen, null, erd); // die Zellen bleiben in der Schlange, der Takt schickt neu
                    this._bruchMelden("WALD: der Faden rechnete die Darts nicht — " + (e && e.message ? e.message : e));
                }
            );
        }
    }

    // Der Bestand des Fadens ins Gedächtnis seines Stands: ein gewechselter Stand verwirft ihn, ein Erdbau seit dem Auftrag
    // (`_erdbauStand`, K69: der Faden rechnete am alten Grund) nur die Zellen in seinem Kasten (`_erdbauFielSeit`) — sie bleiben
    // in der Schlange, ein neuer Auftrag rechnet sie; eine inzwischen gerechnete Zelle behält ihre Darts (die Gedächtnisse je
    // Feld merken die Objekte). Bis w13-dorf-strom verwarf jeder Erdbau der Welt jede Lieferung im Flug (Fahrt-Probe dorf: 10
    // Lieferungen, 474 Zellen, auch im Kegel). Die Schranke des Gedächtnisses greift VOR der Lieferung, nie mitten in ihr
    // (Prüfung K60-3-1). Was seit dem letzten Takt bestellt wurde oder verworfen zurückblieb, reist mit dieser Ankunft.
    _waldDartsAn(memo, zellen, r, erd) {
        if (this._waldFlugVon === memo)
            for (let i = 0; i < zellen.length; i += 2) this._waldFlug.delete(zellen[i] + "," + zellen[i + 1]);
        const Q = this._waldPlanSchlange;
        let n = 0;
        const fiel = this._erdbauFielSeit(erd);
        if (r && this._forestDartMemo === memo && fiel !== true) {
            this._forestDartRaum(memo, zellen.length / 2);
            const alle = this._waldDartsEntpacken(r, zellen.length / 2);
            for (let i = 0; i < alle.length; i++) {
                if (fiel && fiel(zellen[i * 2], zellen[i * 2 + 1])) continue;
                const k = zellen[i * 2] + "," + zellen[i * 2 + 1];
                if (!memo.has(k)) memo.set(k, alle[i]);
                if (Q) Q.delete(k);
                n++;
            }
        }
        if (n > 0) this._waldPlanGeplant(performance.now());
        if (Q && Q.size && this._waldFadenLebt() && this._forestGesetzWahr())
            this._waldFadenSchicken(this._forestSeedInt());
    }

    // Was fiel seit dem Stand `erd` des Erdbaus (`_erdbauStand`)? null: kein Erdbau; sonst (gx, gz) → ob die Wald-Zelle im Kasten
    // eines Falls liegt (`_erdbauFaelle`); true, wenn ein Erdbau ohne Kasten fiel (der Boden-Umzug) oder das Gedächtnis der Fälle
    // nicht so weit reicht — dann gilt keine Zelle.
    _erdbauFielSeit(erd) {
        const jetzt = this._erdbauStand | 0;
        if (jetzt === erd) return null;
        const F = (this._erdbauFaelle || []).filter((f) => f[0] > erd && f[0] <= jetzt);
        if (F.length !== jetzt - erd) return true;
        return (gx, gz) => F.some((f) => gx >= f[1] && gx <= f[2] && gz >= f[3] && gz <= f[4]);
    }

    // Die gepackten Darts des Fadens (je Zelle `anzahl`, je Dart 11 Werte, die Arten als Tafel) → je Zelle die Darts, wie
    // `_forestCellDarts` sie gibt (gate:worker-dichte Teil W vergleicht sie Wort für Wort).
    _waldDartsEntpacken(r, zellenZahl) {
        const w = r.werte;
        const alle = [];
        let j = 0;
        for (let i = 0; i < zellenZahl; i++) {
            const out = [];
            for (let m = r.anzahl[i]; m > 0; m--, j += 11)
                out.push({
                    x: w[j],
                    z: w[j + 1],
                    sp: r.arten[w[j + 2]],
                    s: w[j + 3],
                    T: w[j + 4],
                    prio: w[j + 5],
                    keep: w[j + 6],
                    totRoll: w[j + 7],
                    rotY: w[j + 8],
                    seed: w[j + 9],
                    surfaceY: Number.isNaN(w[j + 10]) ? null : w[j + 10],
                });
            alle.push(out);
        }
        return alle;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_vegetation_wiese]);

// ===== ATLAS · Vegetation/wiese — Außen-Konstanten =====
// Die Attribute eines festen Streu-Satz-Bereichs (`_streuSatzArt`, der Stein der Nah-Streu): was der Studio-Stoff liest
// (Vertex-Farbe, die Stufen-Stempel der Dither-Blende) — `_satzBlock` rechnet Position und Normale in Welt-Lage.
AnazhRealm.STREU_FEST_ATTR = Object.freeze([
    Object.freeze(["position", 3]),
    Object.freeze(["normal", 3]),
    Object.freeze(["color", 3]),
    Object.freeze(["aLodLevel", 1]),
    Object.freeze(["aH0", 1]),
    Object.freeze(["aH0L", 1]),
]);
// Die Attribute eines wiegenden Streu-Satz-Bereichs (`_streuSatzArt`, W7): was der wiegende Stoff liest — Welt-Lage,
// Normale, Farbe × Tint und das Wiegen der Ecke (`aWiege`: die Höhe über der Wurzel in m, das Rauschen der Pflanze aus ihrem
// Fuß, `_satzKernWiege`); er blendet nie, Dither-Stempel trägt er keine.
AnazhRealm.STREU_SATZ_ATTR = Object.freeze([
    Object.freeze(["position", 3]),
    Object.freeze(["normal", 3]),
    Object.freeze(["color", 3]),
    Object.freeze(["aWiege", 2]),
]);
// Dazu das JAHR (vegetation.K5) jedes Stoffs mit Laub oder Blüte (`userData.jahr`): die Mitte jedes Blatts in Welt-Lage
// (`_satzBlock` rechnet sie wie die Lage) und sein Typ — der Stoff zieht das Laub im Winter auf seine Mitte (`_jahrLage`).
AnazhRealm.JAHR_SATZ_ATTR = Object.freeze([Object.freeze(["aCenter", 3]), Object.freeze(["aType", 1])]);
// Bekannte place.mode-Werte (Wörterbuch v1): `_placePolicyFor` liest fail-closed — ein unbekannter
// mode platziert nicht ("none"), crasht nicht (must-ignore). site hat noch keinen Worldgen-Kanal
// (`_placeDispatch` → null); settlement = spawnSettlement + Worldgen-Konsument `_tickAutoSettlement`.
AnazhRealm.PLACE_MODES = Object.freeze({ none: 1, hand: 1, scatter: 1, forest: 1, site: 1, settlement: 1 });

AnazhRealm.FORAGE = Object.freeze({
    reach: 6, // m — Pflueck-Reichweite (das Nachwachsen ist die Heilung der Tat, `TAT_NARBE`)
});

// DAS WUCHS-GESETZ (`_wuchsAt`, stoffe.K5): das Wasser des Bodens ohne Fluss und See (der Regen allein) im Maß des nassen
// Ufers. Gesetzt gegen feld.K4: an der Mess-Wiese (Feuchte 0) heilt die Narbe eines gefällten Baums in der Lichtung binnen
// der 36 Stunden ihrer Linse zur Hälfte (Wuchs ≥ 0,65; bis stoffe.K5 trug das Rauschen `lebendig` dort 0,72–0,92).
// DER NÄHRSTOFF (stoffe.K5#2, `_naehrstoffAt`) wirkt nach Monod mit der Halbsättigung `naehrK` (ein halbierter Boden wächst mit
// 0,86, ein leerer nicht) bis `naehrMax` (die Asche düngt).
AnazhRealm.WUCHS = Object.freeze({ wasserBasis: 0.75, naehrK: 0.2, naehrMax: 1.6 });
// DIE SUKZESSION NACH DEM BRAND (stoffe.K5#2, `_sukzession`): die Rampen im Rest der Narbe — die Asche liegt bis 0,08 und ist
// bei 0,3 nachgegrünt (das Gras der Nah-Wiese), der Busch der Nah-Streu wächst von 0,3 bis 0,6, der Wald von 0,6 bis zur
// Heilung (sein Jungwuchs, `_baumAlter`); der Stumpf eines gefällten Baums treibt ab `stubben[0]` seinen Sämling. Gezählt in
// `stufen` Schritten je Rampe, der Jungwuchs in den Stufen seiner Gestalt: `jugend` sind die Alter, in denen er wächst
// (phyto-core `treeParams(…, alter)`, je Alter EIN Körper und EINE Karte je Art und Gestalt), gewachsen ist er bei der Heilung.
// Die erste Stufe einer frischen Tat malt der Nachwuchs bis `malMs` je Bild (mindestens eine Tat).
// DIE KAPPE DER JUGEND (w13-jung-gestalt): der Jungwuchs wächst als EINE Kohorte im Maß seiner Art — seine Größe ist `alter` ×
// höchstens `kappe` × die Größe 1 der Art (`hoeheM`, `_waldDartSetzen`); das Übermaß des Überhälters (`forestTreeSize` bis 1,95)
// ist Alter, kein Wuchs: er trägt es erst gewachsen. Bis w13 stand der Jungwuchs eines Überhälters der Stufe 0,7 mit 35,5 m
// (Tanne, Größe 1,95) über seiner Kohorte (typisch 16,9 m) und jedem gewachsenen Bestandsbaum (24,2 m): die Riesenhalme der Narbe.
AnazhRealm.SUKZESSION = Object.freeze({
    kappe: 1,
    malMs: 1,
    asche: Object.freeze([0.08, 0.3]),
    busch: Object.freeze([0.3, 0.6]),
    wald: Object.freeze([0.6, 1]),
    stubben: Object.freeze([0.25, 1]),
    stufen: 8,
    jugend: Object.freeze([0.06, 0.18, 0.4, 0.7]),
});

// Material-Strata: ab dieser Tiefe (m) unter der Oberfläche dominiert stein, auch wenn eine andere
// Achse gewänne. Wirkt NUR bei Aufrufern mit y-Argument (Aufrufe ohne y unverändert).
AnazhRealm.STRATA_STEIN_DEPTH = 12;

// IRON-BANDS: vertikale Eisenadern in tiefen Berg-Regionen (Ridge-Noise `1−|noise|`², unrotiert →
// vertikale Linien-Cluster). EISEN ersetzt STEIN in der Tiefe, wo der Aderwert hoch ist UND genug
// dichte besteht (nie in Erde/Lava). Sichtbar als dunklere Tönung; härtere Eisen-Werkzeuge.
AnazhRealm.IRON_BANDS = Object.freeze({
    // Tiefe, ab der Eisen-Adern auftreten können (über STRATA_STEIN_DEPTH
    // hinaus — Iron-Bands sind eine MIN-STEIN-DEPTH-TIEFE Subschicht).
    minDepth: 24,
    // Ridge-Schwelle: nur an Punkten mit Aderwert > threshold wird stein
    // → eisen umgewandelt. Erst-Wurf 0.7 → ~5-10 % der tiefen Stein-Region.
    threshold: 0.7,
    // Dichte-Floor: kein Eisen in nicht-stein-dominierten Regionen.
    dichteFloor: 0.4,
    // Skala der Ridge-Adern (Noise-Frequenz). 1/180 = ~180 m Adern-Wellenlänge,
    // genug für sichtbare aber nicht überall-präsente Linien.
    scale: 1 / 180,
});
// Platzierungs-Dichte: der Wald ist dicht, wo feucht+flach+niedrig, licht auf Hang+Höhe; alle Achsen
// mittelwert-nah (Gesamt-Baumzahl bleibt, die Verteilung wird Ökologie). Gelesen von
// `_placementStandAt` + `_placementDensityFactor` (EINE Quelle für Bäume + Unterwuchs).
AnazhRealm.PLACEMENT_DENSITY = Object.freeze({
    forestFreq: 0.006, // λ~170 m Wald-Stand (wie der Baum-Klump-Leser _clumpAt 0.006)
    meadowFreq: 0.025, // λ~40 m Unterwuchs: Dickicht ↔ magere Stelle
    clumpAmp: 1.6, // Stand-Amplitude (mittelwert-neutral um 1)
    clumpLo: 0.25, // offenes Land (Lichtung)
    clumpHi: 2.6, // geschlossener Wald-Kern
    slopeLo: 0.35, // ≤ so flach = voll (Wiese/Niederung); die Vorlagen-Flach-Präferenz
    slopeHi: 1.1, // ab so steil (|∇h|, AnazhRealm-Skala) = kahle Felswand
    wetBase: 0.7, // trockener Grund → licht
    wetGain: 0.9, // nass (moW→1) → ×1.6 (die Vorlagen-moW>0.8-Verdichtung)
    highAmp: 0.75, // Höhen-Lichtung-Stärke
    highLo: 12, // ab so hoch über Terrain-Basis beginnt das Lichten
    highHi: 45, // ab so hoch = kahler Grat (nur Rest-Dichte ×0.25)
});

// UNTERWUCHS: `canopyK` ist die EINE Dämpfung des Bodenlichts unter Kronen, L = exp(−canopyK · Deckung) (das Labor-
// Gesetz phytogenesis `canopyLight`). Das Licht der STEHENDEN Kronen (`_bodenLichtFeld`: je Krone des Registers
// exp(−d² / (kronenSigma · r)²) bis q < kronenQMax, wie das Labor) lesen Nah-Wiese und Nah-Streu; das Platzierungs-Feld
// (`_canopyLightAt`, Deckung aus den Treibern der Baum-Platzierung) liest der Strauch-Teppich, der mit dem Wald
// gepflanzt wird.
AnazhRealm.UNDERGROWTH = Object.freeze({
    canopyK: 0.85, // exp(-cover·canopyK): Dach-Dämpfung des Bodenlichts (1=Lichtung, →0 dichtes Dach)
    kronenSigma: 1.15, // der Schatten einer Krone: Gauß-Breite in Kronen-Radien (Labor `cr = T · 1,15`)
    kronenQMax: 6, // bis q = d² / (σ·r)² < 6 wirft eine Krone Schatten (Labor) — Reichweite 2,82 Kronen-Radien
});

// Wald-Generator (unten, Vorlage `plantForest`): variabel-radius Poisson-Disc mit
// Kronen-Schüchternheit + Arten-Nische. `crown` = Radius der gewachsenen Krone (m) bei Größe 1; `pack` = Zentren
// ≥ pack·(Ti+Tj); `dartsPerCell` = Kandidaten je Zelle; `slope*` = Boden-Grundierung für Klippen.
// Gelesen NUR von `_forestCellDarts`/`_forestPlantChunk`.
// Zell-Raster `cell` (Kronen-Schüchternheit liest ±2 Zellen) und Packung `pack` (echte Lichtkonkurrenz, kein
// Ineinanderwachsen) sind das Pflanz-Gesetz des Kerns (phyto-core FOREST_PACK) — EINE Quelle für Labor-Wald und Welt-Wald.
AnazhRealm._waldPack = function (k) {
    const FP = globalThis.__phytoCore && globalThis.__phytoCore.FOREST_PACK;
    if (!FP || !Number.isFinite(FP[k]))
        throw new Error("phyto-core fehlt: FOREST_PACK." + k + " (das Pflanz-Gesetz des Walds)");
    return FP[k];
};
AnazhRealm.FOREST = Object.freeze({
    cell: AnazhRealm._waldPack("cell"),
    pack: AnazhRealm._waldPack("pack"),
    // 36 Darts/Zelle (0.25/m²) sättigen den dichten Kern (~15 Born-Kandidaten/Zelle = die
    // Sättigungs-Schwelle); der Überschuss stirbt an der Kronen-Schüchternheit. 48 kostete +30 %
    // Plant-Zeit für +1 % Bäume. Die Dart-Generierung (Terrain-Gates) dominiert — getragen vom
    // Zell-Memo in `_forestCellDarts`.
    dartsPerCell: 36, // Kandidaten-Darts/Zelle (Poisson-Sättigung im dichten Kern, Vorlage ~55)
    slopeLo: 0.35, // ≤ so flach (|∇h|) = voller Grund; die AnazhRealm-Boden-Tauglichkeit
    slopeHi: 1.25, // ab so steil = kahle Felswand (kein Baum)
    dryScale: 40, // Höhen-Trockenheit relH/dryScale (Vorlage e/18 → AnazhRealm-Höhen-Skala)
    // DIE EINE Kronen-Tafel des Pflanz-Gesetzes (T2): phyto-core FOREST_PACK.crown (die gewachsene Krone je Art) unter den
    // Wirts-Namen (FOREST_SPECIES.labToHost, eine Auto-Art des Buchs unter dem Präfix ihrer Art) — kein zweiter Wert hier.
    crown: (() => {
        const core = globalThis.__phytoCore;
        if (!core || !core.FOREST_PACK)
            throw new Error("phyto-core fehlt: FOREST_PACK.crown (die Kronen-Tafel des Walds)");
        const out = {};
        for (const [id, r] of Object.entries(core.FOREST_PACK.crown))
            out[core.FOREST_SPECIES.labToHost[id] || AnazhRealm.KIND_POLICY.tree.prefix + id] = r;
        return Object.freeze(out);
    })(),
});
// Slope-Schwellen des Gras-Gates: voll bis `lo` (≈35°), weg bis `hi` (≈52°), sanfter Übergang.
// `hi` < rock-`SCATTER.slopeMax` (1.45) → Wiese → Mischhang → Geröll → Fels auf DERSELBEN
// `_slopeAt`-Achse.
AnazhRealm.GRASS_SLOPE = Object.freeze({ lo: 0.7, hi: 1.3 });
// DIE ACHT STRAHLEN der Grenze der Ferne (`_wieseFernGrenzen`): je Ring der Füße die Richtungen (cos, sin) im Abstand von 45°, an
// denen der Boden die Ebene des Hangs trägt
AnazhRealm.WIESE_ACHT = Object.freeze(Array.from({ length: 16 }, (_, k) => (k & 1 ? Math.sin : Math.cos)((Math.PI * (k >> 1)) / 4))); // prettier-ignore
// Der Rand der Stand-Wache (m, `_standRuht`): erst wenn Spieler oder Auge so weit vom Anker eines Fege-Takts weg sind,
// gilt sein Ort als neu und er geht wieder. Das Zittern der Physik im Stand (gemessen 07.10., Mess-Wiese: bis 5 mm je
// Takt, nur in der Höhe) weckt nichts; die Stufen-Wahlen tragen eine Hysterese von Metern, die Nah-Streu ihre Armlänge
// mit 0,75 m Austritts-Rand. Der Cull urteilt erst ab der Mesh-Zone (Cull-Radius 100–150 m) und am Karten-Horizont
// (Totband 16 m): ihm genügt ein Meter (`STAND_RAND_FERN_M`) — beim Gehen geht er viermal seltener.
AnazhRealm.STAND_RAND_M = 0.25;
// DER WALD PLANT IM TAKT (K69, `_waldPlanSteht` · `_tickWaldPlan`): die Gestalt eines Baums liest den Bestand der Wald-Zellen
// bis ±`reich` um seine Zelle (der Freistand ±4); der Bestand jeder Zelle trägt sein Urteil (die geborenen Darts der Zellen
// ±`urteil`, die Reihe des Kerns `FOREST_URTEIL_REIHE` — die Kacheln dieser Nachbarn stehen vor jeder Bestellung). Ohne
// Wald-Faden plant der Takt frische Zellen höchstens `ms` lang, mit ihm reist jede bestellte Zelle sofort, in Aufträgen von
// `faden` Zellen, alle im Flug (`_waldFadenSchicken`). Bis w4-b-pflanzen las die Gestalt ±6 (das Urteil im Haupt-Faden).
AnazhRealm.WALD_PLAN = Object.freeze({
    reich: 4,
    urteil: Math.max(...globalThis.__phytoCore.FOREST_URTEIL_REIHE.map(Math.abs)),
    ms: 3,
    faden: 64,
    zellen: 8192,
    // so viele Fälle des Erdbaus (`_erdbauFaelle`) kennt das Gedächtnis der Lieferungen im Flug (`_erdbauFielSeit`)
    faelle: 64,
    // so viele Zellen trägt das Gedächtnis der geborenen Darts (`_forestGeborenKarte`, im Faden `waldGeboren`), darüber fallen
    // die ältesten (`_waldGeborenRaum`)
    geboren: 16384,
});
// DIE SCHRANKE DER GEBORENEN (w14-strom-tempo): trägt `karte` mehr als `cap` Zellen, fallen die ältesten (die Reihe der Map ist
// die Reihe der Geburt — die Fahrt ließ sie hinter sich) bis auf drei Viertel; der Plan um den Spieler bleibt. Der Wald-Faden
// trägt dieselbe Schranke (voxel-worker `geborenRaum`). Bis w14-strom-tempo fiel das ganze Gedächtnis. → die Zahl der gefallenen.
AnazhRealm._waldGeborenRaum = function (karte, cap) {
    if (karte.size <= cap) return 0;
    const weg = karte.size - ((cap * 3) >> 2);
    let n = 0;
    for (const k of karte.keys()) {
        if (n >= weg) break;
        karte.delete(k);
        n++;
    }
    return n;
};
