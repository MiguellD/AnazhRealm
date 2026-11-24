class AnazhRealm_studio_stoff {
    // ===== ATLAS · Studio/stoff — Foundry-Stoff · EIN Graph je Signatur · Stoff-Wert · Krone · Haut · Durchsicht · Leucht-Gesetz · die Stufen-Maske =====
    // Das per-Ziegel-March-Material ist GEFALLEN (DER EINE WELT-MARCH): der
    // Feld-Pass marcht ALLE Felder aus Atlas+Liste in EINEM Draw — ein
    // Material je Ziegel wäre der Zwilling, den wir abgeschafft haben.

    // DER STOFF-WERT (1310-18): ein Wert, der je Stoff variiert, reist als Verweis auf den Stoff des ZEICHNENDEN OBJEKTS
    // (`material.<pfad>`, je Objekt in dessen Bindegruppe geschrieben), nie als Konstante im Graphen — Stoffe gleicher
    // Signatur teilen so EIN Programm. Der Verweis geht über das Objekt, nicht über den zeichnenden Stoff: der r184-
    // Schattenpass zeichnet mit seinem EIGENEN Stoff (die Knoten des Werfers hängen darin, Lehre 26), das Objekt trägt den
    // Werfer-Stoff in jedem Pass. Der Wert steht beim Bau fest — die Observer-Diät sieht keine spätere Änderung.
    _stoffWert(TSL, pfad, typ) {
        return TSL.reference("material." + pfad, typ || "float");
    }

    // EIN GRAPH JE SIGNATUR (1310-18): r184 schlüsselt ein Programm nach der IDENTITÄT seiner Knoten (der Knoten-Schlüssel endet
    // in `customCacheKey` = Knoten-id) — frisch gebaute Knoten hießen ein Programm je Stoff. Der erste Stoff einer Signatur legt
    // JEDEN belegten Knoten-Platz ab (jedes `…Node` des Stoffs, das der Bau bis hier schrieb), jeder weitere zeichnet mit
    // DENSELBEN; was nur ihn unterscheidet, liest der Graph als Stoff-Wert (`_stoffWert`). Weichen die belegten Plätze ab, fehlt der
    // Signatur eine Eingabe des Baus: das bricht laut beim Namen, nie still mit fremdem Graphen. Leser: der Studio-Stoff
    // (`_foundryTreeMaterial`) und der Werk-Stoff (`_buildPbrNodeMaterial`, material.K5).
    // DIE PLÄTZE LIEST DER STOFF, NIE EINE LISTE DES RUFERS (w22-ankunft-kalt): bis hier nannte jeder Rufer seine Plätze von Hand,
    // und was ein Helfer außerhalb der Liste schrieb, blieb je Stoff frisch — der Empfangs-Ort der Krone (`_laubStoffNormale`:
    // receivedShadowPositionNode), die Normale und Kavität von Stein, Halm und Facette (normalNode, aoNode). Jede Baum-Art baute
    // so dasselbe Programm neu: swiftshader kalt bis zum Weltbild 47 Knoten-Bauten, davon 13 byte-gleiche Zwillinge (die Karte
    // 10 × 69 129 Zeichen WGSL, das Laub der Welt 5 × 95 818), 46 % des gebauten WGSL.
    // DAS LICHTMODELL DES HAARS (w25-haar-albedo; Kajiya-Kay 1989, Marschner 2003: R und TT sind das Licht der Quelle, das die
    // Faser spiegelt und durchlässt, nie eigenes): der Standard-Stoff wie das Laub (`_laubLichtModell`), dessen `direct` je direktem
    // Licht den Glanz der Strähne addiert — die Terme von HAAR_LOOK (Spitzen-Rim und Spec über die Achse, `_foundryTreeMaterial`)
    // × die Bestrahlung der Quelle wie Lambert (lightColor trägt den Schatten der Kaskade, × N·L ÷ π). Ohne direktes Licht — im
    // Schatten, unter dem weißen Umgebungslicht der Albedo-Tafel — glänzt nichts. Das Labor rechnet dasselbe (`laborStoff`: der
    // Glanz × das direkte Diffuse ÷ die Albedo).
    // KAJIYA-KAY AN DER FASER (w26-haar-arm): diffus sin(T, L) × die Form (N·L umwickelt, `wrap`), Glanz als zwei Lappen
    // sin(T', H)^p mit der Tangente um `shift` + Wurf × `jit` zur Normale gekippt (R farblos, TRT im Ton des Haars; Scheuermann
    // 2004), normiert (p + 2) / 2π — die Rundung der Normale quer zur Strähne trägt kein Licht mehr (die Streifen je Band, die den
    // Strich am Arm über das Band hoben). Ohne Tangente (die Braue, die Kappe der Grobstufe) das Licht des Standard-Stoffs.
    // DIE FASER AM PIXEL (w27-haar-arm-2, koerper HAAR_LOOK.kk.fuss · `haarLappen`): wo ein Pixel der Szene mehrere Strähnen deckt
    // (`unter` → 1), weiten sich die Lappen zum Mittel ihrer Strähnen — die halbe Potenz und die Norm je Lappen rechnet die Ecke
    // (`HaarLicht.lappen`: [h, Norm] von R und TRT, energie-treu geweitet), das Fragment nur (1 − cos²)^h × Norm —, der Wurf der
    // einzelnen Strähne fällt, und das Licht geht zur Fläche: die Faser trägt den Anteil `faser.anteil` = (1 − unter · flaeche),
    // den Rest der Standard-Stoff an der Normale der Kappe. Bis hier flimmerte die Faser im Gang (K6, Radeon: Kopf 9,6–10,6 % der
    // Pixel über halb zum Grund; geweitet und grau noch bis 5,9 %, das Licht der Fläche 0,4–1,4 %).
    // DER SAUM LIEST DAS LICHT AN SEINEM ORT (licht-eine-skala, die Klasse Schein-Emissiv): die Look-Terme der Labs (Haut: SSS-
    // Saum · Fell: Rim, Sheen, Funkeln · Strähne: Spitzen-Rim, Glanz) sind Anteile des Lichts, das eine weiße Karte am selben Ort
    // zurückwirft — Term × Bestrahlung ÷ π, je direktem Licht (lightColor trägt den Schatten) und für die Umgebung (Bestrahlung
    // der Lichter + des Himmels). Bis hier standen sie als Emission: eine Konstante, die in der EINEN Skala nachts × k leuchtete
    // (die Figur glühte ohne Quelle) und am Mittag unter der Belichtung verschwand.
    // DAS MODELL DES STOFFS SELBST trägt den Saum (`_saumLichtModell` setzt ihn auf das Lichtmodell, das der Stoff baut — Standard
    // oder Physical): bis hier erbte der Saum vom Standard-Modell, die Menschen-Haut verlor mit ihm ihren Klarlack.
    static _saumLichtModell(modell, saum) {
        const direkt = modell.direct;
        const umgebung = modell.indirectSpecular;
        modell.direct = function (e, builder) {
            direkt.call(this, e, builder);
            // der Saum hat die Richtung seines Lichts: N·L wie jeder Rückwurf — bis hier trug ihn auch die Schattenseite
            const nl = THREE.TSL.normalView.dot(e.lightDirection).clamp(0.0, 1.0);
            e.reflectedLight.directDiffuse.addAssign(
                e.lightColor
                    .mul(saum)
                    .mul(nl)
                    .mul(1 / Math.PI)
            );
        };
        modell.indirectSpecular = function (builder) {
            umgebung.call(this, builder);
            const { irradiance, iblIrradiance, reflectedLight } = builder.context;
            reflectedLight.indirectDiffuse.addAssign(
                irradiance
                    .add(iblIrradiance)
                    .mul(saum)
                    .mul(1 / Math.PI)
            );
        };
        return modell;
    }
    static _haarLichtModell() {
        if (AnazhRealm._haarLichtK) return AnazhRealm._haarLichtK;
        const T = THREE.TSL;
        const Basis = THREE.MeshStandardNodeMaterial.prototype.setupLightingModel.call(null).constructor;
        class HaarLicht extends Basis {
            constructor(kk, faser) {
                super();
                this.kk = kk;
                this.faser = faser;
            }
            direct(e, builder) {
                const { kk, faser } = this;
                const L = e.lightDirection,
                    N = T.normalView;
                const nl = N.dot(L);
                const tl = faser.t.normalize();
                const form = nl
                    .mul(kk.wrap)
                    .add(1 - kk.wrap)
                    .clamp(0.0, 1.0);
                const sinTL = T.float(1).sub(tl.dot(L).pow(2)).max(0.0).sqrt();
                const diffus = T.mix(nl.max(0.0), sinTL.mul(form), kk.kd).mul(faser.anteil);
                e.reflectedLight.directDiffuse.addAssign(
                    e.lightColor
                        .mul(diffus)
                        .mul(T.diffuseColor.rgb)
                        .mul(1 / Math.PI)
                );
                const H = L.add(T.positionViewDirection.normalize()).normalize();
                // sin^p' = (1 − cos²)^h mit der halben Potenz h der Ecke (`HaarLicht.lappen`: hn = [h, Norm])
                const lappen = (shift, hn) => {
                    const th = tl
                        .add(N.mul(faser.wurf.mul(kk.jit).add(shift)))
                        .normalize()
                        .dot(H);
                    return T.float(1).sub(th.mul(th)).max(0.0).pow(hn.x).mul(hn.y);
                };
                const glanz = T.vec3(...kk.R.farbe)
                    .mul(lappen(kk.R.shift, faser.lappen.xy))
                    .add(T.diffuseColor.rgb.mul(kk.TRT.amt).mul(lappen(kk.TRT.shift, faser.lappen.zw)));
                e.reflectedLight.directSpecular.addAssign(e.lightColor.mul(form).mul(glanz).mul(faser.anteil));
                // ohne Faser und unter dem Pixel der Standard-Stoff (Lambert + GGX)
                super.direct(
                    Object.assign({}, e, { lightColor: e.lightColor.mul(T.float(1).sub(faser.anteil)) }),
                    builder
                );
            }
        }
        // die Lappen der Ecke: [h, Norm] von R und TRT aus dem Gesetz des Kerns (koerper `haarLappen`) und dem Fußabdruck `unter`
        HaarLicht.lappen = (kk, unter) => {
            const hn = (p) => {
                const G = globalThis.__koerperCore.haarLappen(p, kk);
                const h = T.float(G.halb).div(unter.mul(G.weite).add(1.0));
                return [
                    h,
                    h
                        .mul(2 / G.fuss)
                        .add(1.5 / G.fuss)
                        .sqrt()
                        .mul(G.norm),
                ];
            };
            return T.vertexStage(T.vec4(...hn(kk.R.p), ...hn(kk.TRT.p)));
        };
        AnazhRealm._haarLichtK = HaarLicht;
        return HaarLicht;
    }
    _graphTeilen(mat, sig) {
        const G = this._geteilteGraphen || (this._geteilteGraphen = new Map());
        const plaetze = Object.keys(mat).filter((p) => p.endsWith("Node") && mat[p] != null);
        const g = G.get(sig);
        if (!g) return void G.set(sig, Object.fromEntries(plaetze.map((p) => [p, mat[p]])));
        const ab = [...new Set([...plaetze, ...Object.keys(g)])].filter((p) => !mat[p] !== !g[p]);
        if (ab.length)
            throw this._stoffBruch(
                `der geteilte Graph „${sig}"`,
                new Error("die Signatur verfehlt eine Eingabe des Baus — abweichende Knoten-Plätze: " + ab.join(" · "))
            );
        for (const p of plaetze) mat[p] = g[p];
    }

    // DER VERBAND EINER FLÄCHE (w28-haus-stoff, fachwerk VERBAND_GESETZ): Mauerwerk, Deckung, Putz und Naturstein des Hauses als
    // FUNKTION — ein Leser des EINEN Kamms (`_steinStoff`), der nur seine Lage liefert: die Fläche selbst. `v` wächst längs ihrer
    // Falllinie (an der Wand lotrecht, am Dach den Sparren entlang: die Reihen hängen an der Traufe), `u` quer dazu, beide in
    // Steinen der Zeile; der Versatz der Reihen liegt in u. Die Zahlen sind die der Karten-Maler des Labors
    // (`fachwerk:verbandZeilen`, EINE Tafel): dasselbe Raster, dieselbe Fuge, derselbe Ton je Stein — die Welt trägt dafür keine
    // Karte, kein uv und kein Byte je Ecke oder Haus (bis hier zeichnete sie Dach, Putz und Sockel in EINEM Ton je Fläche: der
    // Faden backt kartenlos). `nr` = die Nummer der Zeile (Knoten; 0 = kein Verband: der Faktor ist 1). Je Zeile fünf Wörter
    // einer Tafel im Stoff: EIN Programm für jeden Verband, die Ecke wählt. Die Fern-Regel ist die des Kamms (am Schirm: das
    // Raster steht ab 2 … 3,5 Pixeln je Stein, darunter trägt die Fläche den Anteil der Fuge — ihr Mittel ist je Kanal 1, wie
    // die Karte des Labors: `eins`). → der Faktor der Albedo (vec3).
    // DIE UNRUHE (`unruhe`, der Kellenzug des Putzes): die Reihen stehen ungleich weit — v wird vor dem Kamm verzogen (zwei Wellen,
    // monoton: der Abstand zweier Züge schwankt um den Anteil der Zeile, wie der Maler ihn würfelt); eine Zeile ohne sie liest v.
    // DIE LAGE DER ECKE (`lage`, das Gefüge der fernen Fachwerk-Wand): die Zeile liest u und v nicht an der Welt, sondern aus der
    // Ecke (`ecke`, im Satz: die vierten Stellen von Farbe und Glut, fachwerk `_wandLage` — Felder quer · Felder hoch): der
    // Ständer steht an der Ecke des Hauses, die Schwelle an seinem Fuß. Außerhalb des Satzes (`ecke` fehlt) liest sie die Welt.
    // DAS KREUZ: wo beide Fugen sich kreuzen, steht EINE (die dunklere je Kanal: der Zuschlag min − Produkt auf das Produkt der
    // Achsen, dieselbe Regel wie `verbandZeilen`) — am Balken wäre das Produkt ein schwarzer Fleck; nah und fern dasselbe Mittel
    // (`eins` rechnet ihn ein). Der Stoff rechnet ihn aus den Fugen-Tönen, die die Kante (unten) schon gewogen hat.
    // `aus` (optional): der Verband nennt dem Gefüge seinen Stein (`_gefuegeStoff`: die Wölbung je Stein) — der Weg durch ihn je
    // Achse (`fu`, `fv`: 0 … 1), die Steine je Pixel (`sp`), die Deckung der Fuge (`fuge`: an der fernen Fachwerk-Wand der
    // Balken) und was die Ecke über ihre Lage am Bau sagt (`hoch`, `hochDa`, `tiefe`).
    _verbandStoff(T, nr, ecke = null, aus = null, grund = null) {
        const Z = AnazhRealm.Gesetz("fachwerk:verbandZeilen")();
        const VG = AnazhRealm.Gesetz("fachwerk:VERBAND_GESETZ");
        const GG = AnazhRealm.Gesetz("fachwerk:GEFUEGE_GESETZ");
        // DAS FUGENBETT (fachwerk GEFUEGE_GESETZ.bett): die Nummer der Hinterfüllung hinter den Steinen und die Zeile ihres Verbands
        const B = GG && GG.bett;
        const bettZeile = B && VG && Array.isArray(VG.reihe) ? VG.reihe.indexOf(B.verband) : -1;
        // DER STEIN FÜR STEIN (fachwerk GEFUEGE_GESETZ.stein): die Nummer eines Teils, das selbst EIN Stein ist, und die Zeile
        // seines Verbands
        const ST = GG && GG.stein;
        const steinZeile = ST && VG && Array.isArray(VG.reihe) ? VG.reihe.indexOf(ST.verband) : -1;
        // DIE FASE (`fase` = ihr Fall, `faseM` = ihre Breite): der Kamm trägt EINE Breite gegen die halbe Fuge — jede Zeile mit Fase
        // dasselbe Verhältnis, auf beiden Achsen dieselbe Fuge (das Mauerwerk)
        const fasen = Array.isArray(Z) ? Z.filter((z) => z && z.fase > 0) : [];
        const faseJeFuge = fasen.length ? fasen[0].faseM / fasen[0].fugeU : 0;
        if (
            !Array.isArray(Z) ||
            Z.length < 2 ||
            Z[0] !== null ||
            Z.slice(1).some(
                (z) =>
                    !z ||
                    !(z.lM > 0) ||
                    !(z.hM > 0) ||
                    !(z.tiefe >= 0) ||
                    !(z.licht > 0 && z.licht <= 1) ||
                    !(z.fase >= 0) ||
                    !(Array.isArray(z.brand) && z.brand.length === 3 && z.brand.every((x) => x >= 0))
            ) ||
            !(B && B.nr > Z.length && B.nr <= 127 && bettZeile > 0 && bettZeile < Z.length) ||
            !(ST && ST.nr > Z.length && ST.nr < B.nr && steinZeile > 0 && steinZeile < Z.length) ||
            (Z.slice(1).some((z) => z.lage === 2) && !(VG.lageGrund >= 1)) ||
            fasen.some((z) => !(z.faseM > 0) || z.fugeU !== z.fugeV || Math.abs(z.faseM / z.fugeU - faseJeFuge) > 1e-9)
        )
            throw this._stoffBruch("das Verband-Gesetz fehlt in fachwerk:verbandZeilen");
        // die Tafel: [lM, hM, lM / halbe Fuge U, hM / halbe Fuge V] · [Versatz, Ton, Unruhe, Lage der Ecke] · [Fugen-Ton U, Tiefe] ·
        // [Fugen-Ton V, Licht der Fuge] · [eins, Fall der Fase] · [Brand je Kanal] — die Zeile 0 ist die Identität (keine Fuge,
        // kein Ton, alle Faktoren 1).
        // Die Unruhe als Hub der zwei Wellen (unten: ihre Steigung zusammen höchstens `VERBAND_WELLE.steil` je Reihe)
        const W = 6;
        const VW = AnazhRealm.VERBAND_WELLE;
        const zeile = (z) => [
            new THREE.Vector4(z.lM, z.hM, z.lM / Math.max(z.fugeU, 1e-6), z.hM / Math.max(z.fugeV, 1e-6)),
            new THREE.Vector4(z.versatz, z.ton, Math.min(0.9, z.unruhe || 0) / VW.steil, z.lage || 0),
            new THREE.Vector4(z.tonU[0], z.tonU[1], z.tonU[2], z.tiefe || 0),
            new THREE.Vector4(z.tonV[0], z.tonV[1], z.tonV[2], z.licht == null ? 1 : z.licht),
            new THREE.Vector4(z.eins[0], z.eins[1], z.eins[2], z.fase || 0),
            new THREE.Vector4(z.brand[0], z.brand[1], z.brand[2], 0),
        ];
        const null0 = {
            lM: 1,
            hM: 1,
            fugeU: 0,
            fugeV: 0,
            versatz: 0,
            ton: 0,
            tonU: [1, 1, 1],
            tonV: [1, 1, 1],
            eins: [1, 1, 1],
            tiefe: 0,
            licht: 1,
            fase: 0,
            brand: [1, 1, 1],
        };
        // EINE Tafel für jeden Graphen (der feste Name, Lehre 23: ohne ihn trüge das WGSL `NodeBuffer_<Knoten-id>`)
        const tafel =
            this._verbandTafel ||
            (this._verbandTafel = T.uniformArray([].concat(...Z.map((z) => zeile(z || null0))), "vec4").setName(
                "verbandTafel"
            ));
        // eine Nummer über der Tafel ist ein Stoff ohne Verband (fachwerk GEFUEGE_GESETZ: Holz, Gefach, die Faser je Ecke) — die
        // Zeile 0, die Identität; bis haus-gefuege klemmte sie auf die letzte Zeile
        // — außer der des Fugenbetts: sie liest die Zeile ihres Verbands (sein Raster nennt ihr die Fuge, in deren Grund sie liegt)
        // — und der des Steins für Stein: er liest die Zeile seines Verbands (sein Raster nennt ihm die Zelle: den Ton je Stein)
        const nrG = nr.add(0.5).floor();
        const bett = T.step(B.nr - 0.5, nrG);
        const stein = T.step(ST.nr - 0.5, nrG).sub(bett);
        const i0 = T.int(
            T.select(nrG.lessThan(Z.length - 0.5), nrG, bett.mul(bettZeile).add(stein.mul(steinZeile))).clamp(
                0.0,
                Z.length - 1
            )
        ).mul(W);
        const [mass, lage, tonU, tonV, eins, brand] = [0, 1, 2, 3, 4, 5].map((k) => tafel.element(i0.add(k)));
        // der Rahmen der Fläche: t waagrecht in ihr, s ihre Falllinie (eine liegende Fläche nimmt die Achsen der Vorlage) — an der Lage
        // der Geometrie: die Vorlage im Studio, im Satz der Welt die WELT-Lage (`_satzBlockEcken`).
        // DIE LAGE IM RASTER DES BAUS (haus-ziegel-putz, `lage` 2 der Zeile): wo ein Bau Steine setzt (fachwerk `infill`), nennt die
        // Ecke ihre Lage in seinem Raster (`_steinLage`: Steine längs · 1 + Lagen hoch) — das Muster liegt auf den Steinen, an jedem
        // Standort. Bis hier lag das Mauerwerk der Welt im Raster ihres Ursprungs: am Genesis-Haus wechselte der Ton 69 mm neben
        // dem Spalt zweier Steine, der Spalt stand in Stein-Farbe, die gewebte Fuge doppelt neben der gebauten (Radeon, 4,5 m).
        const wp = T.positionGeometry;
        const n = T.normalize(T.normalGeometry);
        const h = T.vec3(n.z, 0.0, n.x.negate());
        const t = T.normalize(T.select(h.length().greaterThan(0.02), h, T.vec3(1.0, 0.0, 0.0)));
        const s = T.cross(n, t);
        // die Lage in Steinen: an der Welt — oder die der Ecke (`lage.w`: 1 jede Ecke der Zeile, 2 die Ecke mit Angabe: ihre zweite
        // Stelle ab 0,5 ist `lageGrund` + die Lage hoch); die Reihen verzogen um die Unruhe (`lage.z`)
        const mitAngabe = ecke ? T.step(1.5, lage.w) : null;
        const vonEcke = ecke ? lage.w.greaterThan(0.5).and(lage.w.lessThan(1.5).or(ecke.y.greaterThan(0.5))) : null;
        const eckV = ecke ? ecke.y.sub(mitAngabe.mul(VG.lageGrund)) : null;
        const u0 = vonEcke ? T.select(vonEcke, ecke.x, T.dot(wp, t).div(mass.x)) : T.dot(wp, t).div(mass.x);
        const v0 = vonEcke ? T.select(vonEcke, eckV, T.dot(wp, s).div(mass.y)) : T.dot(wp, s).div(mass.y);
        const v = v0.add(
            lage.z.mul(T.sin(v0.mul(VW.welle[0])).add(T.sin(v0.mul(VW.welle[1]).add(VW.phase)).mul(VW.welle[2])))
        );
        const u = u0.add(T.fract(T.floor(v).mul(0.5)).mul(2.0).mul(lage.x));
        // DIE KANTE (einheit-relief, `tiefe` · `licht` der Zeile): der Stein steht `tiefe` vor seiner Fuge. Schräg gesehen verdeckt
        // seine Kante sie um tiefe · tan(Blickwinkel) je Achse: in der Linie der Fuge steht dann die Flanke des Steins (sein Ton, nicht
        // der des Mörtels) — sichtbar bleibt k = 1 − tiefe · tan ÷ Breite der Fuge vom Mörtel, die Linie behält ihre Breite (nah auf den
        // Pixel, fern als ihr Anteil). Alles im Schlitz — Grund und Flanken — sieht nur `licht` des Lichts. Der Blick in der Welt gegen
        // die Achsen der Fläche (Vorlage → Welt). Ohne Tiefe (jede Zeile außer dem Mauerwerk) ist k = 1 und licht = 1: das Muster
        // bleibt, was es war (das Kreuz rechnet dieselbe Regel wie `verbandZeilen`: die dunklere Fuge je Kanal). Bis hier webte die L1
        // den Mörtel offen und voll beleuchtet über 17 % ihrer Fläche — an 12 m zeigt die L0 dort die Flanken ihrer Steine (an vier
        // Posen: G der Ausfachung L1 ÷ L0 = 2,0 in linearem Licht). Die schmalere Fuge allein (die Flanke im Ton der Stirn) ließ die
        // Stoßfuge schräg verschwinden: der Kontrast der Fuge fiel auf 0,49–0,61 der L0.
        const tiefe = tonU.w;
        const zumAuge = T.normalize(T.cameraPosition.sub(T.positionWorld));
        const welt = (d) => T.normalize(T.modelWorldMatrix.mul(T.vec4(d, 0.0)).xyz);
        const nah = T.abs(T.dot(zumAuge, welt(n))).max(0.05);
        const sicht = (achse, M, Mz) =>
            T.clamp(
                T.float(1.0).sub(
                    tiefe
                        .mul(T.abs(T.dot(zumAuge, welt(achse))))
                        .div(nah)
                        .mul(Mz)
                        .div(M.mul(2.0))
                ),
                1e-3,
                1.0
            );
        // (die Fase in Einheiten der halben Fuge — der Kamm misst die Fuge hier als 1; die Richtung wachsender Lage in der Welt)
        const S = this._steinStoff(
            T,
            { fuge: 1, fase: faseJeFuge, fall: 1, ton: 1, fugeTon: 1, kuppe: 0 },
            { u, v, mU: mass.z, mV: mass.w, sU: T.fwidth(u0), rU: welt(t), rV: welt(s) }
        );
        const eine = T.vec3(1.0, 1.0, 1.0);
        const fU = T.mix(eine, tonU.xyz, sicht(t, mass.x, mass.z));
        const fV = T.mix(eine, tonV.xyz, sicht(s, mass.y, mass.w));
        // DER VERBAND STEHT IN DER WAND (`steht` · `wand`): die Stufe mit Steinen zeigt auch die Lager-Flanken ihrer Steine (liegende
        // Flächen, 1,25 cm vor dem Bett) — dort webt das Raster der Vorlage quer über die Flanke: die Fuge stünde als heller
        // Mörtel-Strich, ihr Schlitz und ihre Fase als dunkler Punkt je 8 cm unter jedem Stein (Radeon, Genesis K2 aus 3 m,
        // Mittag). Eine Zeile mit Tiefe (das Mauerwerk) trägt Fuge, Ton je Stein, Schlitz und Fase nur auf Flächen, die stehen
        // (|n.y| der Vorlage unter 0,35 voll, ab 0,65 keine); jede Zeile ohne Tiefe (Deckung, Naturstein) bleibt, was sie war.
        // DER STEIN FÜR STEIN TRÄGT KEINE FUGE (`stein`): seine Fuge ist der Spalt zum Nachbarn, in dem das Bett steht — das
        // Raster webt auf ihm nur den Ton seiner Zelle. Fern, wo die Fuge unter dem Pixel liegt, zöge ihr Anteil sonst über die
        // Stirn jedes Steins (die Fuge zweimal: als Spalt und als Ton).
        const steht = T.float(1.0).sub(T.smoothstep(0.35, 0.65, n.y.abs()));
        const wand = T.mix(T.float(1.0), steht, T.step(1e-6, tiefe));
        const [aU, aV] = S.achse.map((a) => a.mul(wand).mul(T.float(1.0).sub(stein)));
        const muster = T.mix(eine, fU, aU)
            .mul(T.mix(eine, fV, aV))
            .add(T.min(fU, fV).sub(fU.mul(fV)).mul(aU.mul(aV)));
        // DAS LICHT IM SCHLITZ (haus-ziegel-putz, `tiefe` · `licht` der Zeile): der Grund der Fuge liegt `tiefe` hinter der Stirn.
        // Vom Himmel sieht er `licht` (der Sicht-Faktor des Schlitzes, fachwerk `verbandZeilen`) — das trägt das indirekte Licht
        // (`himmel` → aoNode). Die Sonne erreicht von seiner Breite w noch k = 1 − tiefe ÷ w · tan(Winkel der Sonne quer zur
        // Fuge gegen die Normale), je Achse (die Stoßfuge quer über t, die Lagerfuge quer über s): ab 41° liegt der Grund der
        // 11-mm-Fuge ganz im Schatten ihres Steins — das trägt der empfangene Schatten (`sonne` → receivedShadowNode, nie die
        // Albedo: dieselbe Richtung `uSunDir`, die die Kaskade prüft). Beide gewogen mit dem Anteil der Fuge an der Leuchtdichte
        // des Pixels (`grund`: die Farbe der Fläche) — nah steht der Schatten in der Fuge, fern trägt die Fläche sein Mittel
        // (Licht-treu: Albedo × Licht des Pixels = die Summe über Stein und Fuge). Das Fugenbett liegt ganz im Schlitz. Ohne
        // Tiefe (jede Zeile außer dem Mauerwerk) sind beide 1. Bis hier stand `licht` in der Albedo der Fuge, für Sonne und
        // Himmel gleich: die besonnte Wand trug die helle Fuge ohne Schatten, die Stufe mit Steinen ihr Bett voll im Licht.
        // Schlitz und Fase stehen nur in der Wand (`steht`, oben).
        const sonne = this._windUniformsEnsure().uSunDir;
        const zurSonne = T.dot(sonne, welt(n)).max(1e-3);
        const besonnt = (achse, M, Mz) =>
            T.float(1.0).sub(
                tiefe
                    .mul(Mz)
                    .div(M.mul(2.0))
                    .mul(T.abs(T.dot(sonne, welt(achse))))
                    .div(zurSonne)
                    .clamp(0.0, 1.0)
            );
        const k = aU
            .mul(besonnt(t, mass.x, mass.z))
            .add(aV.mul(besonnt(s, mass.y, mass.w)))
            .add(1e-3)
            .div(aU.add(aV).add(1e-3));
        const LUMA = T.vec3(0.2126, 0.7152, 0.0722);
        const g0 = grund ? T.vec3(grund).max(1e-4) : eine;
        // (das Fugenbett liegt im Schlitz, wo das Raster die Fuge nennt — wo es den Stein nennt, steht das Bett frei: `fugeDa`.
        // Am ORT gelesen, nie am Fußabdruck des Pixels: das Bett ist Geometrie, sein Spalt zwischen zwei Steinen IST die Fuge —
        // mit der Deckung des Pixels stünde der Spalt fern, wo die Fuge unter dem Pixel liegt, halb als Stein und halb im Licht.
        // Die halbe Fuge × 1,5: der Rand des Spalts liegt sicher in ihr — die Lage der Ecke reist als halbe Gleitzahl, über 5 m
        // Höhe auf ± 2,6 mm.)
        const steinDa = T.float(1.0).sub(aU).mul(T.float(1.0).sub(aV));
        const inFuge = (f, Mz) => T.step(T.min(f, T.float(1.0).sub(f)), T.float(1.5).div(Mz));
        const fugeDa = T.float(1.0).sub(
            T.float(1.0)
                .sub(inFuge(T.fract(u), mass.z))
                .mul(T.float(1.0).sub(inFuge(T.fract(v), mass.w)))
        );
        const imSchlitz = T.mix(
            T.float(1.0)
                .sub(steinDa.mul(T.dot(g0, LUMA)).div(T.dot(g0.mul(muster), LUMA).max(1e-5)))
                .clamp(0.0, 1.0),
            fugeDa,
            bett
        ).mul(steht);
        if (aus)
            Object.assign(aus, {
                himmel: T.float(1.0).sub(imSchlitz.mul(T.float(1.0).sub(tonV.w))),
                sonne: T.float(1.0).sub(imSchlitz.mul(T.float(1.0).sub(k))),
                // DIE KANTE DES STEINS (`fase` der Zeile): die Neigung der Fase aus dem Kamm (Welt, zur Normale zu addieren) mal ihr
                // Fall — das Bett trägt keine
                fase: S.kipp ? S.kipp.mul(eins.w).mul(T.float(1.0).sub(bett)).mul(steht) : null,
                fu: T.fract(u),
                fv: T.fract(v),
                sp: T.max(T.fwidth(u0), T.fwidth(v0)),
                fuge: S.fuge,
                // DIE ECKE EINER ZEILE, DIE IHRE LAGE NICHT AUS IHR LIEST (fachwerk `_eckLage`; 0 = keine Angabe): die erste Stelle
                // 1 + ihre Höhe über dem Fuß des Baus, die zweite 1 + ihre Tiefe unter dem Dach, beide in Metern (das Holz trägt in
                // der zweiten die lange Kante seiner Fläche: 1 · 3, `_gefuegeStoff` DIE KANTE). Der Satz trägt
                // seine Ecken in Welt-Lage (`_satzBlockEcken`) — die Höhe am Bau kennt dort nur die Ecke; die ferne Fachwerk-Wand
                // zählt sie in Riegel-Feldern, ein Stoff ohne Ecke (die Vorlage: ihr Fuß bei y = 0) liest die Höhe der Vorlage.
                hoch: ecke ? T.select(vonEcke, eckV.mul(mass.y), ecke.x.sub(1.0)) : T.positionGeometry.y,
                hochDa: ecke ? T.select(vonEcke, T.float(1.0), T.step(0.5, ecke.x)) : T.float(1.0),
                tiefe: ecke ? T.select(vonEcke, T.float(0.0), ecke.y) : null,
            });
        // DER TON JE STEIN mit seiner Brandhaut (`brand` der Zeile: die Ziehung wiegt je Kanal, mittelfrei) × das Muster der Fugen ×
        // eins — der Stein für Stein trägt seine Farbe selbst (ohne `eins`: die Fläche trägt das Mittel aus Stein und Fuge, er den
        // Stein). Das Fugenbett behält seine Farbe (1), wo das Raster die Fuge nennt; wo es den Stein nennt (der Rest unter 5 cm am
        // Ständer, den die Stufe mit Steinen frei lässt), steht auf dem Bett der Stein: seine Farbe ÷ den Ton der Fuge gegen den
        // Stein, mit dem Ton seiner Zelle — bis hier stand dort der helle Mörtel als Quadrat je Lage neben dem Ständer.
        const steinTon = eine.add(brand.xyz.mul(S.ton.sub(1.0).mul(lage.y).mul(wand)));
        return T.mix(
            steinTon.mul(muster).mul(T.mix(eins.xyz, eine, stein)),
            T.mix(steinTon.div(tonU.xyz.max(1e-3)), eine, fugeDa),
            bett
        );
    }

    // DAS GEFÜGE EINER FLÄCHE (haus-gefuege, fachwerk GEFUEGE_GESETZ; Karte 2 mensch.bau.huelle): was der Stoff INNERHALB seines
    // Verbands trägt — das Korn des Putzes, die Faser des Holzes, die Scherbe der Deckung, der Hieb im Stein — als reine FUNKTION
    // der Welt-Lage: Farbe, Normale und Rauheit aus EINER Rechnung, ohne Karte, ohne Sampler, ohne Byte je Ecke oder Haus (bis hier
    // stand jede Fläche des Hauses in EINEM Ton: „weiße Kästen mit Fenstern“). `nr` = die Nummer der Zeile (derselbe Knoten wie der
    // des Verbands; 0 = kein Gefüge: Faktor 1, die Normale der Geometrie, die Rauheit des Stoffs), `V` = der Stein des Verbands
    // (`_verbandStoff` `aus`). Je Zeile sieben Wörter EINER Tafel: EIN Programm für jeden Stoff, die Ecke wählt.
    // DIE SEITE DER FLÄCHE liest der Graph beim BAU des Programms (`directionToFaceDirection`, r184s eigene Regel: der Stoff, der
    // beide Seiten zeichnet, wendet die Normale der Rückseite) — nie als Zweig beim Bau des Graphen: ein Graph gilt jedem Stoff
    // seiner Signatur (`_graphTeilen`), dem einseitigen wie dem doppelseitigen Satz-Stoff. Mit der Seite als Zweig trug der
    // doppelseitige den Graphen des einseitigen: die Rückseite der Dachhaut (die ferne Stufe legt sie deckungsgleich unter die
    // Vorderseite) stand mit der Normale nach innen — das Dach aus 100 m im Streiflicht fast schwarz (Radeon, 23.11.).
    // DIE LAGE ist die der WELT im Pixel (`positionWorld`: hinter der Naht `_weltNaht`, die Instanz ist gerechnet — Lehre 22) und
    // die Normale der Geometrie in der Welt: jede Stufe eines Hauses (Mesh, Instanz, Satz) zeichnet an derselben Stelle dasselbe
    // Korn, der Wechsel der Stufe verschiebt nichts. In der Ebene der Fläche (t waagrecht, s ihre Falllinie — der Rahmen des
    // Verbands, in der Welt) dreht die Faser der Zeile (`faser`) oder die der Ecke (eine Nummer ab `GEFUEGE_GESETZ.faser.ab`: die
    // Richtung ihres Balkens in `klassen` Schritten, fachwerk `faserNummer`) die Achsen: `laengs` läuft mit der Faser, `quer` über sie.
    // DREI SKALEN (Korn · Zug · Wolke), jede EIN Wert-Rauschen im Raster ihrer Zelle [quer, längs] in Metern — gewürfelt aus den
    // Zell-Nummern modulo `periode` (kleine ganze Zahlen: dieselbe Rechnung auf jedem Gerät, auch fern vom Ursprung), mittelfrei
    // (−½ … ½). DER FUSSABDRUCK, EINMAL und am SCHIRM (Gebot 7): eine Skala steht voll ab `fuss.voll` Pixeln je Zelle und ist unter
    // `fuss.leer` ihr Mittel — Ton 1, Relief 0; was das Relief dann nicht mehr zeigt, trägt die Rauheit (`rauFern`: fern steht die
    // Fläche nicht glatter als nah). Aus 100 m steht das Haus im Mittel-Ton seiner Rolle, nichts flimmert, und der Flächen-
    // Mittelwert der Albedo bleibt in jeder Entfernung der des Stoffs (Lehre 21: jeder Term ist mittelfrei).
    // DAS RELIEF: die Höhe der drei Skalen (Meter) kippt die Normale gegen ihren Gradienten — aus den Ableitungen am Schirm
    // (Mikkelsen 2010, kein Tangenten-Raum, wie `_steinRahmen`), begrenzt auf `GEFUEGE_KIPP` (im streifenden Blick wächst die
    // Ableitung über jede Neigung). DIE WÖLBUNG: im Verband steht jeder Stein als Kissen (`woelb` am Rand, zur Fuge fallend), im
    // Raster des Verbands und mit dessen Fußabdruck. DAS WETTER: die Seite zum Wetter (`uWetterVon` des Wind-Satzes: gegen den Zug der Fronten, derselbe Wind wie im Alter) ist gewaschen und gebleicht,
    // die Lee-Seite dunkler (± `wetter` über den Kompass, mittelfrei); Holz nimmt dort Silber an (`grau`, bei gleicher
    // Leuchtdichte: die Albedo der Rolle bleibt). DER SPRITZ-SAUM: am Fuß des Baus (die Höhe in der Vorlage) dunkelt die Fläche um
    // den Anteil ihrer Zeile (`spritz`). DER LÄUFER UNTER DEM DACH: nennt die Ecke ihre Tiefe unter der Dachhaut (`V.tiefe`), steht
    // dort die Bahn des Läufers (`lauf.bahn`, ± `lauf` der Zeile; mittelfrei: fern bleibt nichts). DER TON JE BALKEN: die Nummer der Ecke eines Balkens
    // trägt über seiner Richtung die Klasse seines Tons (`faser.toene` Klassen, fachwerk `faserNummer`: gewürfelt aus seiner Mitte
    // am Bau) — jeder Balken steht ± `faser.ton` heller oder dunkler als das Mittel der Rolle (mittelfrei über die Klassen; die
    // Zahl reist als `balken` in der Zeile des Holzes). DIE KANTE DES BALKENS: wo er an das Gefach stößt, dunkelt seine Fläche
    // längs ihrer langen Kanten (die Schattenfuge, `kante` der Zeile; die Ecke nennt die Kante in der Stelle, die dem Putz die
    // Tiefe unter dem Dach trägt — kein neues Varying).
    // → { farbe(rgb) → rgb, normale (Sicht-Raum, für normalNode; Lehre 26: die Normale der Geometrie × Seite), rauh(r) → r }
    _gefuegeStoff(T, nr, V) {
        const GG = AnazhRealm.Gesetz("fachwerk:GEFUEGE_GESETZ");
        const Z = GG && AnazhRealm.Gesetz("fachwerk:gefuegeZeilen")();
        const paar = (p) => Array.isArray(p) && p.length === 2 && p.every((x) => x > 0);
        const F = GG && GG.faser;
        const holz = Array.isArray(Z) && F ? Z.findIndex((z) => z && z.art === F.art) : -1;
        // (der Stein für Stein, `stein.nr`: die Zeile seines Verbands — die Gefüge-Zeilen 1–5 stehen am Platz der Verband-Zeilen)
        const VG = AnazhRealm.Gesetz("fachwerk:VERBAND_GESETZ");
        const steinReihe = GG && GG.stein && VG && Array.isArray(VG.reihe) ? VG.reihe.indexOf(GG.stein.verband) : -1;
        if (
            !Array.isArray(Z) ||
            Z.length < 2 ||
            Z[0] !== null ||
            Z.slice(1).some(
                (z) =>
                    !z ||
                    !paar(z.korn) ||
                    !paar(z.zug) ||
                    !paar(z.wolke) ||
                    ![z.ton, z.hub].every((q) => Array.isArray(q) && q.length === 3 && q.every((x) => x >= 0)) ||
                    !(Array.isArray(z.woelb) && z.woelb.length === 2) ||
                    !(Array.isArray(z.kante) && z.kante.length === 3 && z.kante.every((x) => x >= 0 && x < 1)) ||
                    !(z.grund > 0) ||
                    ![z.faser, z.rau, z.rauFern, z.wetter, z.grau, z.fugeGrau, z.spritz, z.lauf, z.balken].every(
                        Number.isFinite
                    ) ||
                    !(z.unruhe >= 0)
            ) ||
            !(GG.lauf && GG.lauf.weit > 0 && paar(GG.lauf.bahn)) ||
            !(GG.bett && GG.rolle && GG.rolle[GG.bett.rolle] > 0 && GG.bett.nr <= 127) ||
            !(F && GG.bett.nr > F.ab + F.klassen * F.toene - 1) ||
            !(GG.stein && GG.stein.nr > F.ab + F.klassen * F.toene - 1 && GG.stein.nr < GG.bett.nr) ||
            !(steinReihe > 0 && steinReihe < Z.length) ||
            !(GG.fuss && GG.fuss.voll > GG.fuss.leer && GG.fuss.leer > 0) ||
            !(GG.spritz && GG.spritz.aus > GG.spritz.voll && GG.spritz.voll >= 0 && GG.spritz.rand >= 0) ||
            !(GG.periode >= 16) ||
            !(holz > 0 && F.ab >= Z.length && F.klassen > 0 && F.toene >= 2) ||
            !(F.ab + F.klassen * F.toene - 1 <= 127) ||
            !(Array.isArray(GG.silber) && GG.silber.length === 3)
        )
            throw this._stoffBruch("das Gefüge-Gesetz fehlt in fachwerk:GEFUEGE_GESETZ");
        // die Tafel: [Korn quer, längs, Zug quer, längs] · [Wolke quer, längs, Faser, Grund] · [Ton Korn, Zug, Wolke, Wetter] ·
        // [Hub Korn, Zug, Wolke, Grau] · [Wölbung quer, hoch, Rauheit ±, Rauheit fern] · [Grau der Fuge, Spritz-Saum, Läufer,
        // Ton je Balken] · [Kante: Anteil, Breite, höchster Anteil der Breite · die Unruhe des Zugs] — die Zeile 0 ist die Identität
        const W = 7;
        const zeile = (z) => [
            new THREE.Vector4(z.korn[0], z.korn[1], z.zug[0], z.zug[1]),
            new THREE.Vector4(z.wolke[0], z.wolke[1], z.faser, z.grund),
            new THREE.Vector4(z.ton[0], z.ton[1], z.ton[2], z.wetter),
            new THREE.Vector4(z.hub[0], z.hub[1], z.hub[2], z.grau),
            new THREE.Vector4(z.woelb[0], z.woelb[1], z.rau, z.rauFern),
            new THREE.Vector4(z.fugeGrau, z.spritz, z.lauf, z.balken),
            new THREE.Vector4(z.kante[0], z.kante[1], z.kante[2], z.unruhe),
        ];
        const null0 = {
            korn: [1, 1],
            zug: [1, 1],
            wolke: [1, 1],
            faser: 0,
            grund: 1,
            ton: [0, 0, 0],
            wetter: 0,
            hub: [0, 0, 0],
            grau: 0,
            woelb: [0, 0],
            rau: 0,
            rauFern: 0,
            fugeGrau: 0,
            spritz: 0,
            lauf: 0,
            balken: 0,
            kante: [0, 0, 0],
            unruhe: 0,
        };
        // EINE Tafel für jeden Graphen (der feste Name, Lehre 23)
        const tafel =
            this._gefuegeTafel ||
            (this._gefuegeTafel = T.uniformArray([].concat(...Z.map((z) => zeile(z || null0))), "vec4").setName(
                "gefuegeTafel"
            ));
        // die Zeile: die Nummer selbst — oder, trägt die Ecke die Richtung ihres Balkens, die des Holzes mit dieser Richtung
        // (die Nummer über `faser.ab`: Richtung + `klassen` × Ton-Klasse; ohne Zweig gerechnet — `balken` ist 0 unter `ab`);
        // das Fugenbett (`bett.nr`, über den Nummern der Faser) trägt die Zeile seiner Rolle, der Stein für Stein (`stein.nr`) die
        // seines Verbands
        const g0 = nr.add(0.5).floor();
        const istBett = T.step(GG.bett.nr - 0.5, g0);
        const istStein = T.step(GG.stein.nr - 0.5, g0).sub(istBett);
        const g = T.mix(T.mix(g0, T.float(steinReihe), istStein), T.float(GG.rolle[GG.bett.rolle]), istBett);
        const jeEcke = g.greaterThan(F.ab - 0.5);
        const i0 = T.int(T.select(jeEcke, T.float(holz), g.clamp(0.0, Z.length - 1))).mul(W);
        const [mass, lage, ton, hub, form, mehr, rand2] = [0, 1, 2, 3, 4, 5, 6].map((k) => tafel.element(i0.add(k)));
        const ueber = g.sub(F.ab).max(0.0);
        const tonKlasse = T.floor(ueber.div(F.klassen));
        const richtung = ueber.sub(tonKlasse.mul(F.klassen));
        const balken = tonKlasse
            .mul(2 / (F.toene - 1))
            .sub(1.0)
            .mul(T.step(F.ab - 0.5, g));
        const phi = T.mix(lage.z, richtung.mul(Math.PI / F.klassen), T.step(F.ab - 0.5, g));
        // der Rahmen der Fläche in der Welt, die Faser darin
        // (die Normale der Geometrie in der Welt aus der des BLICKS, im Pixel gedreht — `normalWorldGeometry` wäre ein eigenes
        // Varying, und der Satz-Stoff steht bei 15 von 16 Stellen zwischen Ecke und Pixel: mit ihr und der Seite der Fläche
        // sagte das Gerät die Pipeline ab, „[EntryPoint main] infringes limits“, Radeon 890M)
        const wp = T.positionWorld;
        const nG = T.normalize(T.normalViewGeometry.transformDirection(T.cameraViewMatrix));
        const h = T.vec3(nG.z, 0.0, nG.x.negate());
        const t = T.normalize(T.select(h.length().greaterThan(0.02), h, T.vec3(1.0, 0.0, 0.0)));
        const s = T.cross(nG, t);
        const [a, b] = [T.dot(wp, t), T.dot(wp, s)];
        const [cs, sn] = [T.cos(phi), T.sin(phi)];
        const laengs = a.mul(cs).add(b.mul(sn));
        const quer = b.mul(cs).sub(a.mul(sn));
        const [fq, fl] = [T.fwidth(quer), T.fwidth(laengs)];
        // das Wert-Rauschen einer Zelle: die vier Ecken in EINER Rechnung (vier Stellen), der Würfel aus kleinen ganzen Zahlen
        const P = GG.periode;
        const rausch = (x, y) => {
            const p = T.vec2(x, y);
            const i = T.floor(p);
            const f = T.fract(p);
            const w = f.mul(f).mul(f.mul(-2.0).add(3.0));
            const i0 = i.sub(T.floor(i.div(P)).mul(P));
            const j = i0.add(1.0);
            const i1 = j.sub(T.floor(j.div(P)).mul(P));
            const px = T.fract(T.vec4(i0.x, i1.x, i0.x, i1.x).mul(0.3183099).add(0.71)).mul(17.0);
            const py = T.fract(T.vec4(i0.y, i0.y, i1.y, i1.y).mul(0.3183099).add(0.113)).mul(17.0);
            const e = T.fract(px.mul(py).mul(px.add(py)));
            return T.mix(T.mix(e.x, e.y, w.x), T.mix(e.z, e.w, w.x), w.y).sub(0.5);
        };
        // je Skala: ihr Rauschen (−1 … 1) × wie viel von ihr am Schirm steht (der Fußabdruck: Zellen je Pixel)
        const [voll, leer] = [1 / GG.fuss.voll, 1 / GG.fuss.leer];
        // (`zieh`, optional: die Zelle verzogen um so viele Zellen — das Raster der Skala steht dann nicht mehr gerade)
        const skala = (cq, cl, versatz, zieh = null) => {
            const steht = T.float(1.0).sub(T.smoothstep(voll, leer, T.max(fq.div(cq), fl.div(cl))));
            const x = quer.div(cq).add(versatz);
            const y = laengs.div(cl).add(versatz * 0.37);
            return [
                rausch(zieh ? x.add(zieh) : x, zieh ? y.add(zieh.mul(0.61)) : y)
                    .mul(steht)
                    .mul(2.0),
                steht,
            ];
        };
        const [korn, kornSteht] = skala(mass.x, mass.y, 17.0);
        const [wolke] = skala(lage.x, lage.y, 101.0);
        // DER ZUG, von der Wolke verzogen (`unruhe` der Zeile, in Zellen): kein Kellenzug liegt gerade über dem anderen, keine
        // Falte des Steins neben der nächsten — mit dem festen Raster las der Zug des Putzes aus 13,5 m als Zeilen eines Stoffs
        const [zug] = skala(mass.z, mass.w, 59.0, wolke.mul(rand2.w));
        // DIE BAHN DES LÄUFERS (`lauf.bahn`: schmal, lotrecht, von der Wolke verzogen) — nur unter dem Dach (unten)
        const [bahn] = skala(GG.lauf.bahn[0], GG.lauf.bahn[1], 151.0, wolke.mul(1.5));
        // das Wetter: die Seite der Fläche gegen die Richtung, aus der es kommt (−1 Lee … 1 Wetterseite; der EINE Wind der Welt)
        const wetter = T.dot(nG, this._windUniformsEnsure().uWetterVon);
        // der Spritz-Saum: die Höhe über dem Fuß des Baus (`V.hoch`: die der Ecke — dieselbe in jeder Stufe; ohne Angabe keiner),
        // sein Rand von Wolke und Zug gebrochen (`spritz.rand`: ¾ die Wolke, ¼ der Zug; fern, wo beide ihr Mittel sind, eine
        // gerade Kante: derselbe Anteil der Fläche)
        const rand = GG.spritz.rand;
        const saum = T.float(1.0)
            .sub(
                T.smoothstep(
                    GG.spritz.voll,
                    GG.spritz.aus,
                    V.hoch.add(wolke.mul(0.75 * rand)).add(zug.mul(0.25 * rand))
                )
            )
            .mul(V.hochDa);
        // der Läufer unter dem Dach: 1 an der Dachhaut, über `lauf.weit` Meter Tiefe auf 0 (ohne Angabe 0)
        const unterDach = V.tiefe
            ? T.step(0.5, V.tiefe).mul(T.float(1.0).sub(T.smoothstep(0.0, GG.lauf.weit, V.tiefe.sub(1.0))))
            : T.float(0.0);
        // DIE KANTE DES BALKENS (`kante` der Zeile, fachwerk `_eckLage`): die Ecke nennt die lange Kante ihrer Fläche (die zweite
        // Stelle: 1 an der einen, 3 an der anderen; 0 = keine Angabe) — q läuft quer über die Fläche von −1 bis 1. Der Saum steht
        // an beiden Rändern, `Breite` Meter breit (in q: Breite × |∇q| ÷ |∇quer| — die Fläche nennt ihre Breite am Schirm selbst),
        // höchstens der `höchste Anteil`; die Wolke bricht seine Breite (± ½, mittelfrei). Die Deckung ist das Integral über den
        // Pixel (ein Kasten der Breite |∇q|, auf die Fläche geklemmt): nah die scharfe Linie, auf einem Pixel ihr Anteil, und liegt
        // der Balken ganz unter dem Pixel, das Mittel der Fläche — der Faktor teilt durch dieses Mittel (mittel-treu: der Ton des
        // Balkens bleibt in jeder Entfernung, die Stufe ohne die Angabe springt nicht).
        let kante = T.float(1.0);
        if (V.tiefe) {
            const da = T.step(0.5, V.tiefe);
            const q = V.tiefe.sub(2.0).clamp(-1.0, 1.0);
            const fw = T.fwidth(V.tiefe).max(1e-5);
            const mittel = T.min(rand2.y.mul(fw).div(fq.max(1e-7)), rand2.z);
            const breit = mittel.mul(T.float(1.0).add(wolke.mul(0.5)));
            const lo = T.max(q.sub(fw.mul(0.5)), -1.0);
            const hi = T.min(q.add(fw.mul(0.5)), 1.0);
            const links = T.min(hi, breit.sub(1.0)).sub(lo).max(0.0);
            const rechts = hi.sub(T.max(lo, T.float(1.0).sub(breit))).max(0.0);
            const deckung = links.add(rechts).div(hi.sub(lo).max(1e-5)).min(1.0);
            kante = T.float(1.0)
                .sub(rand2.x.mul(deckung).mul(da))
                .div(T.float(1.0).sub(rand2.x.mul(mittel).mul(da)));
        }
        const faktor = T.float(1.0)
            .add(korn.mul(ton.x))
            .add(zug.mul(ton.y))
            .add(wolke.mul(ton.z))
            .add(bahn.mul(mehr.z).mul(unterDach))
            .mul(T.float(1.0).add(wetter.mul(ton.w)))
            .mul(T.float(1.0).sub(mehr.y.mul(saum)))
            .mul(T.float(1.0).add(balken.mul(mehr.w)))
            .mul(kante)
            .mul(lage.w);
        const LUMA = [0.2126, 0.7152, 0.0722];
        const sl = GG.silber.reduce((q, x, k) => q + x * LUMA[k], 0) || 1;
        const silber = T.vec3(...GG.silber.map((x) => x / sl));
        // das Silber der Wetterseite: das der Fläche — in der Fuge des Verbands das der Fuge (der Balken der fernen Fachwerk-Wand)
        const grau = T.mix(hub.w, mehr.x, V.fuge).mul(wetter.max(0.0)).mul(T.float(1.0).add(wolke)).clamp(0.0, 1.0);
        // das Relief: der Gradient der Höhe in der Welt aus den Ableitungen am Schirm, die Wölbung des Steins im Verband dazu
        const hoehe = korn.mul(hub.x).add(zug.mul(hub.y)).add(wolke.mul(hub.z));
        // die Seite der Fläche wie r184s eigene Normale (`normalView`): beim Bau des PROGRAMMS aus der Seite seines Stoffs — der
        // einseitige liest sie nicht (`front_facing` ist eine Stelle zwischen Ecke und Pixel), die flache Normale blickt schon zum Auge
        const n = T.Fn((bau) => (bau.isFlatShading() ? nG : T.directionToFaceDirection(nG)), "vec3")();
        const dpx = T.dFdx(wp);
        const dpy = T.dFdy(wp);
        const r1 = T.cross(dpy, n);
        const det = T.dot(dpx, r1);
        const grad = r1
            .mul(T.dFdx(hoehe))
            .add(T.cross(n, dpx).mul(T.dFdy(hoehe)))
            .div(T.select(det.abs().greaterThan(1e-12), det, T.float(1e-12)));
        const K = AnazhRealm.GEFUEGE_KIPP;
        const kipp = grad.mul(T.float(K).div(grad.length().max(K)));
        const kissenSteht = T.float(1.0).sub(T.smoothstep(voll, leer, V.sp));
        // (die Achsen des Steins in der Welt sind die des Rahmens hier: waagrecht in der Fläche und ihre Falllinie — wie der Verband
        // sie in der Vorlage setzt, mit der Instanz gedreht)
        const kissen = t
            .mul(V.fu.mul(2.0).sub(1.0).mul(form.x))
            .add(s.mul(V.fv.mul(2.0).sub(1.0).mul(form.y)))
            .mul(kissenSteht);
        return {
            farbe: (rgb) => {
                const c = T.vec3(rgb.mul(faktor));
                return T.mix(c, silber.mul(T.dot(c, T.vec3(...LUMA))), grau);
            },
            // (die Fase des Steins im Verband: die Neigung des Kamms, `_verbandStoff` `fase`)
            normale: T.cameraViewMatrix.transformDirection(
                T.normalize(V.fase ? n.sub(kipp).add(kissen).add(V.fase) : n.sub(kipp).add(kissen))
            ),
            rauh: (r) => r.add(zug.mul(form.z)).add(T.float(1.0).sub(kornSteht).mul(form.w)).clamp(0.0, 1.0),
        };
    }

    // `wiegen` (true, optional): der Stoff einer weichen Boden-Art der Nah-Streu — er wiegt im EINEN Wind mit der Höhe über
    // der Wurzel in Metern (Vorlage × Welt-Skala der Instanz) und dem Rauschen der Pflanze an ihrem Fuß, also für jede
    // Studio-Skala derselbe Stoff.
    // `mp.satzRegler` (true): der EINE Satz-Stoff des Bau-Satzes (`_satzStoff`, K43-2) — Rauheit, Metall und Deckkraft liest er
    // je Ecke aus `aRegler`, das Emissiv × Glut-Stärke aus `aGlut` (`_satzBlock`); `mp` trägt diese Regler dann nicht.
    // `krone` (true, optional; K68-N1): das Klingen-Laub gehört zu einer Krone (Baum, Strauch: foundry-core `emitTreeRezept`
    // legt die Normale der Krone darüber), auch ohne `baum` — der wiegende Stoff der Nah-Streu erbt sie vom Stoff der Art
    // (`userData.krone`); die Karte (foliageTex) ist immer Krone.
    // `ecken` (optional): WAS DIE GESTALT JE ECKE TRÄGT und ihr Stoff liest — EIN benanntes Feld, nie ein Wahrheitswert an
    // einer Stelle (zwei Zweige hängten je einen sechsten an, der Mensch den Ton, das Laub das Jahr: der Aufrufer des einen
    // gäbe dem anderen still seine Bedeutung). `ecken.ton` (mensch.K4): der Ton je Ecke (`aTon`) — der Stoff färbt nach der
    // Palette des zeichnenden Leibs (`_tonFaktor`). `ecken.jahr` (vegetation.K5): die Jahres-Ecken (`_jahrEcken`) — ihr Laub
    // fällt im Winter auf seine Mitte (`_jahrLage`); der wiegende Stoff der Nah-Streu erbt es vom Stoff der Art
    // (`userData.jahr`). Fail-closed: ein anderes Wort an dieser Stelle bricht laut beim Namen.
    _foundryTreeMaterial(kind, mp, wiegen, baum, krone, ecken) {
        if (
            ecken != null &&
            (typeof ecken !== "object" ||
                Object.entries(ecken).some(([k, v]) =>
                    k === "art"
                        ? v !== null && typeof v !== "string"
                        : (k !== "ton" && k !== "jahr" && k !== "verband" && k !== "lage") || typeof v !== "boolean"
                ))
        )
            throw this._stoffBruch(
                `die Ecken der Gestalt (${kind}): ein Feld { ton, jahr, verband, lage } aus Wahrheitswerten (dazu art: die Spezies des Jahrs), nie ` +
                    (typeof ecken === "object"
                        ? "{ " +
                          Object.entries(ecken)
                              .map(([k, v]) => k + ": " + (v && typeof v === "object" ? "Objekt" : String(v)))
                              .join(", ") +
                          " }"
                        : String(ecken))
            );
        const ton = !!ecken && ecken.ton === true;
        const jahr = !!ecken && ecken.jahr === true;
        // DIE ART DES JAHRS (jahreslauf#2): die Spezies, deren Phänologie das Laub dieses Stoffs trägt (phyto-core `phaenoArt`;
        // ohne sie der Bestand) — ein Stoff je Art, EIN Graph (der Stoff-Wert `userData.jahrArt`, `_jahrLage`)
        const jahrArt = jahr ? (ecken && typeof ecken.art === "string" ? ecken.art : null) : null;
        const satz = !!(mp && mp.satzRegler === true);
        // `ecken.verband` (einheit-relief): die gefaltete Stufe nennt die Zeile des Verband-Gesetzes je Ecke (`aVerband`) und
        // `ecken.lage` ihre Lage in der Wand (`aLage`) — außerhalb des Satzes liest der Stoff sie dort, wie der Satz in seinem
        // `aRegler` (unten am Verband); im Satz zählt seine Stelle, nie diese
        const eckVerband = satz !== true && !!ecken && ecken.verband === true;
        const eckLage = eckVerband && ecken.lage === true;
        if (!this._foundryMats) this._foundryMats = {};
        const T = THREE;
        const TSL = T.TSL;
        // Material-Regler: reist `mp` mit (roughness/metalness/flatShading/env/side/Glut), baut AnazhRealm EXAKT
        // dieses Material; ohne `mp` die Baum-Defaults — die Zahlen und die Look-Familie (FELL_LOOK/HAUT_LOOK/HAAR_LOOK,
        // der Ton-Anker mp.color steht im Key) liest der Wirt aus DERSELBEN Quelle wie der Schlüssel (phyto-core
        // `budgetRegler`); Laub/Gras sind immer beidseitig.
        const R = globalThis.__phytoCore.budgetRegler(kind, mp);
        const isBark = R.rinde;
        const rough = R.r,
            metal = R.mt,
            flat = R.fl,
            env = R.env,
            sideDouble = R.doppelt,
            emis = R.em,
            emisI = R.emI,
            klasseLook = R.look;
        // Die Studio-Dither-Blende ist Gesetz des Stoffs, nie des Schalters (lod.K5): jeder Foundry-Stoff trägt die Maske,
        // jeder Körper die Stempel (`_foundryBuildGroup`); zur Laufzeit schaltet sie `uLodMaskOn` (A/B), die
        // CPU-Doppel-Mitgliedschaft `foundryCrossfade`. Bis lod-stufen las der Bau den Schalter: ein Körper, gebaut, während
        // eine Linse ihn ausschaltete, trug Stoff ohne Maske und keine Stempel — der Cache hielt beides über die Linse hinaus
        // (die Stufen-Linse: `_satzBlock(streuNah:stumpf…)` „Attribut aLodLevel fehlt", der Satz verlangt die Stempel immer).
        // Der wiegende Stoff der Nah-Streu blendet nie (ihr Stufen-Wechsel ist die Armlänge, die Wahl der GPU, Art 5). Der Stoff des Menschen (`ton`) blendet nie: sein Guss steht auf dem Null-Stempel
        // (die Maske wäre die Identität), und ihre drei Stempel sprengten neben dem Ton den Deckel der Vertex-Puffer (WebGPU 8: Lage ·
        // Knochen · Gewichte · Normale · Farbe · Ton · aH0L · aLodLevel · aH0 = 9) — das Gerät sagte 8 Programme ab, Auge und
        // Kleid zeichneten nie (mensch.K4, 30.10.); ohne Maske liest er 6 Puffer. Der STEIN-Stoff (`mp.stein`, w4-genesis-tore)
        // blendet nie: ein Bau steht auf dem Null-Stempel, und sein Satz trägt statt der drei Stempel das uv seiner Lage im Verband
        // (`BAU_STEIN_ATTR`: Lage · Normale · Farbe · Regler · Glut · uv = 6) — mit den Stempeln waren es 9, das Gerät sagte ab.
        const xfade = wiegen !== true && ton !== true && !(mp && typeof mp.stein === "string");
        // DER SCHLÜSSEL IST DIE EINE MATERIAL-IDENTITÄT (phyto-core `budgetStoff`, W8): Art · Regler · SEITE · Gewebe ·
        // Glut · Fell-/Haut-Ton — dieselbe, mit der das Budget-Gesetz am Studio-Ausgang Stoffe zählt und faltet (die
        // Seite fehlte: ein beidseitiger Stoff teilte das Material eines einseitigen gleicher Regler, first-wins).
        // Dazu die Wirts-Zustände, die kein Studio-Stoff sind: die Dither-Blende und das Wiegen der Nah-Streu.
        // DIE KRONE (K68-N1): Karte immer, Klinge am Baum und Strauch — sie lichtet flip-frei (`_laubStoffNormale`)
        const _krone = kind === "foliageTex" || (kind === "foliage" && (!!baum || krone === true));
        const key =
            globalThis.__phytoCore.budgetStoff(kind, mp) +
            (xfade ? "|xf" : "") +
            (wiegen === true ? "|wiegt" : "") +
            (baum ? "|wind:" + baum.ht.toFixed(2) + "/" + baum.delta.toFixed(4) + "/" + baum.an : "") +
            (satz === true ? "|satz" : "") +
            (_krone ? "|krone" : "") +
            (ton ? "|ton" : "") +
            (jahr ? "|jahr" + (jahrArt ? ":" + jahrArt : "") : "") +
            (eckVerband ? (eckLage ? "|eckVb+lage" : "|eckVb") : "");
        if (this._foundryMats[key]) return this._foundryMats[key];
        let mat;
        // HAUT-VOLLENDUNG (19.07.): die Lab-Haut trägt CLEARCOAT (matSkin
        // 0.12/0.6) — skin/haut minten als Physical-Material (der Standard
        // trägt keinen Lack); die Zahlen kommen NUR aus dem Kern-Gesetz.
        const _hautL =
            (kind === "skin" || kind === "haut") && typeof globalThis !== "undefined" && globalThis.__koerperCore
                ? globalThis.__koerperCore.HAUT_LOOK
                : null;
        // DER KLARLACK (W5 Gegenstände): die Haut des Körperstudios (HAUT_LOOK) ODER der Stoff selbst (Fahrzeug-Lack,
        // Klingen-Stahl — `budgetRegler` cc/ccr aus dem Gesetzbuch); ohne Klarlack der Standard. Gemessen (licht-eine-skala,
        // GTX 1050, Ausgabe-Pfad, Mess-Wiese am Mittag, Gesicht auf etwa 2,5 m, EIN eingefrorenes Bild): der Lack allein
        // (Physical ↔ Standard, beide ohne Saum) hebt das Gesicht im Mittel um 0,43/255, am Glanzpunkt bis 10/255, zwei gleiche
        // Schüsse 0,00 auseinander; er trägt nur die Menschen-Haut (skin/haut — kein Tier-Stoff), keinen Befehl mehr.
        const ccSoll =
            _hautL && Number.isFinite(_hautL.clearcoat)
                ? {
                      cc: _hautL.clearcoat,
                      ccr: Number.isFinite(_hautL.clearcoatRoughness) ? _hautL.clearcoatRoughness : 0.5,
                  }
                : R.cc > 0
                  ? { cc: R.cc, ccr: R.ccr }
                  : null;
        // Die Physical-Klasse lebt in der Node-Bibliothek des Renderers (r184 — die Bootstrap-Brücke reicht sie nicht als
        // THREE-Symbol: die Probe `typeof T.MeshPhysicalNodeMaterial` fiel IMMER auf den Standard, die Haut trug nie ihren
        // Klarlack). Der Null-Renderer zeichnet nichts und trägt keine Bibliothek — gefragt wird die Bibliothek selbst, nie
        // die Flagge (eine Linse lüftet `_isHeadlessNull` am Null-Renderer, gate:leistungs-vertrag: die Lieferung brach).
        const rendM = this.state && this.state.renderer;
        const MatK =
            ccSoll && rendM && rendM.library
                ? rendM.library.getMaterialNodeClass("MeshPhysicalMaterial")
                : T.MeshStandardNodeMaterial;
        mat = new MatK({
            roughness: rough,
            metalness: metal,
            flatShading: flat,
            side: sideDouble ? T.DoubleSide : T.FrontSide,
        });
        if (MatK !== T.MeshStandardNodeMaterial) {
            mat.clearcoat = ccSoll.cc;
            mat.clearcoatRoughness = ccSoll.ccr;
        }
        // DIE DURCHSICHT (W5): ein durchsichtiger Stoff (Scheibe, Fenster, Glimm-Scheibe) zeichnet transparent mit der
        // Deckkraft seines Gesetzbuchs; einen Schatten wirft er nicht (`_foundryBuildMesh`: das Licht geht durch ihn). Er
        // SCHREIBT SEINE TIEFE (material.K4): der Spiegel-Pass liest die Scheibe aus der Tiefe des Bilds (Lage und Normale,
        // `_spiegelPass`) — ohne sie stand dort der Raum dahinter, und das Fenster spiegelte, was hinter ihm liegt. Was hinter
        // ihm liegt, zeichnet vor ihm (Opakes zuerst, Durchsichtiges von hinten) und bleibt sichtbar. Eine dünne Scheibe
        // zeichnet beide Seiten in EINEM Zug: r184 zieht einen doppelseitig-transparenten Stoff sonst zweimal (Rück-, dann
        // Vorderseite) — gemessen +1 Befehl je Wagen über den Budget-Deckel vehicle draws 12. Das Gesetz steht im Licht-Baustein
        // (welt-licht.js `durchsicht`), die Bühne jedes Studios zeichnet ihr Glas nach demselben (`buehneZeichnet`).
        if (R.op < 1) __weltLicht.durchsicht(mat, R.op);
        if (env !== 1) mat.envMapIntensity = env;
        if (emis) {
            mat.emissive = new T.Color(emis[0], emis[1], emis[2]);
            mat.emissiveIntensity = emisI;
            // DAS STUDIO-LEUCHTEN IN DER EINEN SKALA (licht-eine-skala P8; die Familie Emissiv × Stärke): die Einheit des Labors
            // ist die Einheit der Welt (`__weltLicht.EINHEIT_LX`), wo der Stoff eine LICHTQUELLE ist (Seh-Klasse `glut`,
            // phyto-core BUDGET_GESETZ: die Lichter der Wagen — Tagfahrlicht 9 700, Rücklicht 3 100, Blinker 4 340, Laterne
            // 8 790, Lichtkante 18 610 cd/m²; HYPOTHESE am Band der Zulassung: ECE R7 Rücklicht 4–12 cd auf ≈ 40 cm² =
            // 1 000–3 000 cd/m², R87 Tagfahrlicht 400–1 200 cd auf 25–200 cm² = 2·10⁴–5·10⁵ cd/m²). Jeder andere Stoff mit
            // Emissiv (der Rahmen und die Beschläge der Tore, das Tierauge) trägt einen BILDWERT des Labors, kein Datum
            // einer Quelle: er steht im Maß des Auges, sein Wert ÷ Belichtung vor dem Auge der Nacht — wie die Membran. In
            // der Skala selbst stand das Tor nachts als weißer Fleck (0,02–0,46 Einheiten = 300–7 400 cd/m² × 47 000).
            if (!(mp && mp.seh === "glut")) mat.emissiveNode = this._erscheinung(TSL.materialEmissive);
        }
        // Tint-Kontinuität L0/L1↔L2: das Studio tintet NUR das Laub, multiplikativ, aus dem Positions-Hash
        // (foundry-core.js) — gleich über alle Stufen, sonst springt die Kronenfarbe beim Stufen-Wechsel. Das
        // Flag lässt `_scatterInstanceAdd` denselben Tint auf die 3D-Krone legen; Rinde bleibt untintet. Nur
        // das Flag, NIE attribute("instanceColor") — der native InstanceNode-Auto-Multiply trägt ihn.
        if (kind === "foliage" || kind === "foliageTex") mat.userData.useInstanceTint = true;
        if (_krone) mat.userData.krone = true;
        if (jahr === true) {
            mat.userData.jahr = true; // das Laub fällt (`_jahrLage`; der Baum-Wind webt es in seinen Knoten)
            mat.userData.jahrArtName = jahrArt; // die wiegende Nah-Streu baut den Stoff ihrer Art mit derselben Art
            const ph = globalThis.__phytoCore.phaenoArt(jahrArt || globalThis.__phytoCore.PHAENO_GESETZ.bestand);
            mat.userData.jahrArt = new THREE.Vector2(ph[0], ph[1]);
        }
        // DIE WERTE JE STOFF (1310-18): was nur diesen Stoff unterscheidet (das Leucht-Maß, der Ton-Anker der Strähnen-Achse),
        // liest der Graph als Stoff-Wert (`_stoffWert`), nie als eingefaltete Konstante — sonst trüge jeder Stoff seinen
        // eigenen Graphen und r184 baute je Stoff ein Programm.
        const _tonA = mp && Array.isArray(mp.color) && mp.color.length === 3 ? mp.color : null;
        // Die Rauheit (`rauh`) wiegt das Mikro-Relief des facettierten Felsens außerhalb des Satzes (`_mikroGestalt`): bis
        // w13-fels-korn stand sie als Zahl im Graphen, und der zweite Stoff einer Signatur zeichnete mit der Rauheit des ersten.
        // DAS LEUCHTEN IN DER EINEN SKALA (licht-eine-skala P8, die EINE Stelle der Familie `leucht`): das Gesetzbuch trägt die
        // Leuchtdichte je Luma der Vertex-Farbe in cd/m² (fachwerk `FEUER_LEUCHT_JE_LUMA`: die Wurzel der Flamme steht bei
        // `FEUER_LEUCHTDICHTE` 15 000 cd/m², Hollan: 13 800–16 000 cd/m² am Holzfeuer), hier tritt sie in die Einheit der Welt
        // (÷ `__weltLicht.EINHEIT_LX`). Bis nacht-lichter trug das Gesetzbuch die Zahl des Labors `LEUCHT_FEUER` 2,5 in Welt-
        // Einheiten — eine zweite Leuchtdichte der Flamme (die Wurzel 13 560 cd/m²). Ein Stoff ohne Licht-Antwort (`unbeleuchtet`: die Linien und die Scheibe der Tore) steht dagegen im
        // Maß des Auges, wie die Membran (`_membranGraph`): sein Wert ÷ Belichtung, unten am Knoten.
        mat.userData.stoffWerte = {
            leucht:
                mp && typeof mp.leucht === "number" && mp.leucht > 0
                    ? mp.unbeleuchtet === true
                        ? mp.leucht
                        : mp.leucht / __weltLicht.EINHEIT_LX
                    : 0,
            tonL: _tonA ? Math.max(1e-4, 0.2126 * _tonA[0] + 0.7152 * _tonA[1] + 0.0722 * _tonA[2]) : 1,
            rauh: rough,
            verband: mp && mp.verband > 0 ? mp.verband | 0 : 0, // die Zeile des Verband-Gesetzes (außerhalb des Satzes)
        };
        // DAS MIKRO-RELIEF DER FACETTE (unten, `_mikroGestalt`): der facettierte Studio-Stein, eine Weiche des Baus
        const mikro = flat && kind === "unknown";
        // DER VERBAND (unten, `_verbandStoff`): der matte Bau-Stoff — im Satz und wo die Ecke ihre Zeile trägt jeder (0 = keine),
        // sonst der Stoff, dessen Gesetzbuch ihm eine Zeile gab; nie die Facette, der Stein-Rahmen, das Gewebe, das Unbeleuchtete
        const verband =
            kind === "unknown" &&
            !mikro &&
            !R.ub &&
            !(R.op < 1) &&
            !!mp &&
            !mp.webe &&
            typeof mp.stein !== "string" &&
            (satz === true || eckVerband ? mp.seh === "stoff" : mp.verband > 0);
        // Vorlagen-Farben leben als VERTEX-COLORS: auf WebGPU/NodeMaterial MUSS colorNode = attribute("color")
        // sie lesen — `vertexColors:true` wirkt hier NICHT (sonst weißes Laub, schwarze Koniferen).
        // `_foundryBuildGroup` garantiert das color-Attribut.
        // Im Satz trägt die Farbe vier Stellen (die vierte: die Lage der Ecke in ihrer Wand, `BAU_SATZ_ATTR`) — EIN Knoten dieses
        // Namens, r184 teilt ihn nach dem Namen: ein dreistelliger Leser vor dem vierstelligen füllte die vierte Stelle mit 1
        // (`vec4( color.xyz, 1.0 ).w`, die ferne Fachwerk-Wand stand ganz im Ton des Balkens).
        const vcolRoh = satz === true ? TSL.attribute("color", "vec4").xyz : TSL.attribute("color", "vec3");
        // DIE FARBE FOLGT DEM SAMEN (mensch.K4): trägt die Gestalt den Ton je Ecke, ist ihre Farbe die Vorlage × das Verhältnis
        // der Palette des zeichnenden Leibs zu der seiner Gestalt (`_tonFaktor`), je Ecke im Vertex-Takt — der Leib eines
        // Bewohners zeigt seine Farben im Stoff seiner Gestalt; ohne eigene Palette (der Spieler) ist das Verhältnis 1. Die
        // Strähnen-Achse unten liest die Vorlage (`vcolRoh`).
        const vcol = ton === true ? TSL.varying(vcolRoh.mul(this._tonFaktor(TSL)), "vTonFarbe") : vcolRoh;
        // DAS LEUCHT-GESETZ (Architektur-Welle 05.10.): ein Stoff, dessen Gesetzbuch `leucht` stempelt (fachwerk
        // `feuer`: Glut, Flamme, Herdfeuer), leuchtet in seiner Vertex-Farbe × leucht — heiße Mitte, kühler Rand,
        // gelbe Flammen-Wurzel, rote Spitze — statt einer Farbe für jede Fläche (das Labor webt dasselbe in r128).
        if (mp && typeof mp.leucht === "number" && mp.leucht > 0) {
            const hell = vcol.mul(this._stoffWert(TSL, "userData.stoffWerte.leucht"));
            // DAS UNBELEUCHTETE STEHT IM MASS DES AUGES (licht-eine-skala P8): „zeigt seine Farbe, wie das Licht auch fällt“ ist
            // ein Bildwert — in der EINEN Skala stand das Tor nachts als weißer Fleck (0,6–1,1 Einheiten × Belichtung 47 000)
            mat.emissiveNode = mp.unbeleuchtet === true ? this._erscheinung(hell) : hell;
        }
        // DIE FARBE DES JAHRS (V18.527): Laub und Gras sind Golden-Sommer gebacken — ihre Albedo × uSeasonMul
        // (das Studio-Gesetz: der Laub-Shader multipliziert mix(1, uSeasonMul, vSeasW), vSeasW = 1 auf Laub und
        // Blüte). Rinde, Fels, Kristall bleiben ungetönt. Die Gestalt des Jahrs trägt die Lage (`jahr`, `_jahrLage`).
        // DIE TÖNUNG FOLGT DEM TYP (w21-laub-jahr-fern): das Laub tönt, dessen Ecken Laub oder Blüte sind (`jahr` — die Schale
        // liefert die Jahres-Ecken nur an solchen Teilen), dazu das Gras; die Nadel (Typ 2, der Wedel), der Halm des Schilfs
        // (Typ 4) und jedes Laub ohne Jahr stehen in ihrer Farbe wie im Studio (vSeasW 0). Bis w21 tönte die Welt nach der Art
        // des Stoffs: die Fichte stand im Herbst orange (Tönung r × 2,23), ihre Karte zu 80 %.
        const _suF =
            kind === "foliage" || kind === "foliageTex" || kind === "grass" ? this._ensureSeasonUniforms() : null;
        const _toent = kind === "grass" || jahr === true;
        // DER TON JE ECKE (w28-baum-programm): jeder Teil einer Art des Jahrs trägt Ecken und den Stoff des Jahrs
        // (`_foundryBuildMesh`, `JAHR_ARTEN`) — die Regel, die bis dahin am Stoff stand (ein Teil mit Laub- oder Blüten-Ecken tönt
        // ganz, jeder andere nie), steht an der Ecke: es tönt GENAU die Ecke, die das Jahr trägt — Laub und Blüte (SAISON_GESETZ
        // `typ`), wie das Studio (injectWind `vSeasW = wT == laub || wT == bluete`). Die stehende Ecke (`JAHR_STEHT`: die Nadel, der
        // Wedel, ein Teil ohne Laub), die Rinde im Laub-Stoff (Typ 0: Zweig, Ast, Stiel) und der Halm (Typ 4) stehen in ihrer Farbe.
        // Bis saison-am-laub tönte die Welt jede Ecke außer −1 und 4: das Winter-Mul (1,39 · 0,84 · 1,67, gerechnet für das Sommer-
        // Laub `bau`) färbte die roten Zweige des Gestrüpps und den Korb der Blume magenta. `select`: exakt uSeasonMul oder 1.
        const SGt = AnazhRealm._saisonGesetz().typ;
        const _typ = TSL.vertexStage(TSL.attribute("aType", "float"));
        const _tonJeEcke =
            jahr === true && kind !== "grass" && _suF && _suF.uSeasonMul
                ? TSL.select(
                      _typ.sub(SGt.laub).abs().lessThan(0.5).or(_typ.sub(SGt.bluete).abs().lessThan(0.5)),
                      _suF.uSeasonMul,
                      TSL.vec3(1)
                  )
                : null;
        const laubFarbe0 = _toent && _suF && _suF.uSeasonMul ? vcol.mul(_tonJeEcke || _suF.uSeasonMul) : vcol;
        // DIE BLATT-UNTERSEITE (phyto-core BLATT_UNTERSEITE, 05.10.): die gesehene Fläche nach unten gewandt → die hellere,
        // mattere Unterseite (`_laubUnterseite`, K68-N1: die Fläche, nie die Licht-Normale). Laub und Blüte, nie Gras.
        const laubFarbe =
            kind === "foliage" || kind === "foliageTex" ? this._laubUnterseite(TSL, laubFarbe0) : laubFarbe0;
        // DIE NORMALE DER KRONE (K68-N1): die Studio-Krone (foundry-core `emitTreeRezept`: jede Karte, jede Klinge und Nadel
        // eines Baums und Strauchs) trägt die Normale der Krone und lichtet flip-frei (`_laubStoffNormale`). Die Karte
        // (foliageTex) ist immer Krone; das Klingen-Laub (foliage) ist es am Baum und Strauch (`_krone`: die Wind-Daten der
        // Art oder der Stoff, von dem die Nah-Streu erbt) — Farn, Blüte, Schilf und Gestrüpp tragen ihre eigene Fläche, deren
        // Wicklung frei ist: sie lesen die Seite (r184 faceDirection), sonst läge jeder zweite Wedel im Dunkel.
        if (_krone) this._laubStoffNormale(TSL, mat);
        if (isBark) {
            // KEIN Normal-Override auf Vegetations-Stämmen: r184-NodeMaterial-Tangenten (UV-Derivate) kippen auf
            // gestreckten Tube-UVs die Normale → der Stamm liest schwarz. Die Rinde lebt über Albedo (Studio-
            // Vertex-Farben) + Roughness 0.93. Ihr Spiegel der Studio-Rinden-Normale (`_foundryBarkNormalTexture`) hatte
            // keinen Leser und fiel mit K60-2; die Normale lebt im Studio (foundry-core `makeBarkNormal`).
            mat.colorNode = TSL.vec4(vcol, 1.0);
        } else if (kind === "foliageTex") {
            // Blatt-Atlas: Alpha schneidet die Blattform aus (kein solides Quad), RGB × Vertex-Farbe (die
            // Vorlagen-Blattfarbe faerbt den Atlas). Es ist DER EINE Atlas, auf den die Studio-Karten routen
            // (phyto-core `bakeLeafAtlasBild`): Zelle 0 Baum-Zweig (`BLATT_ATLAS_BREIT`), 1 Weiden-Zweig (Trauer-Strähne,
            // `BLATT_ATLAS_WEIDE`), 2 Großblatt-Zweig (Strauch, `BLATT_ATLAS_GROSS`), 3 Nadel-Zweiglein (`BLATT_ATLAS_NADEL`) — dieselbe Textur wie
            // der Grammatik-Pfad (`_ensureFoliageClusterAtlas`), keine zweite.
            const atl = this._blattAtlasProbe(TSL);
            if (atl) {
                // Die Blattform schneidet die ALPHA von colorNode aus, nie `opacityNode`: der r184-Schattenpass
                // liest colorNode.a · map.a · maskShadowNode (`Renderer._getShadowNodes`), opacityNode nie — die
                // Nadel-Karten warfen volle Rechtecke. Die Atlas-Farbe: der EINE Leser (`_blattAtlasProbe`); die Deckung
                // trägt den Versatz des Laubs (A3, `_laubVersatz`), Bild und Schatten schneiden an der Zahl des Stoffs.
                mat.colorNode = TSL.vec4(atl.rgb.mul(laubFarbe), atl.a);
                mat.alphaTest = mp && typeof mp.alphaTest === "number" && mp.alphaTest > 0 ? mp.alphaTest : 0.5;
                mat.transparent = false;
            } else {
                // Nur headless (kein document): kein Stoff zeichnet — mit document liefert der Atlas oder bricht.
                mat.colorNode = TSL.vec4(laubFarbe, 1.0);
            }
        } else if (kind === "schatten") {
            // DER SCHATTEN-STOFF (S3, das EINE Wurf-Gesetz E1): der Schatten-Teil einer Stufe zeichnet nur in den Kaskaden
            // (SHADOW_TWIN_LAYER) — seine Alpha ist max(aDeckt, Atlas-Alpha): das Gerüst deckt ganz (aDeckt 1), die Karte
            // schneidet ihre Blattform aus dem EINEN Atlas (aDeckt 0). Die Alpha lebt in colorNode, nie in opacityNode:
            // der r184-Schattenpass liest colorNode.a · map.a · maskShadowNode (Lehre 26). EIN Programm für jeden
            // statischen Wurf (Baum-Teil, die Haus-Stufe 3 mit aDeckt 1).
            const atl = this._blattAtlasProbe(TSL);
            const deckt = TSL.attribute("aDeckt", "float");
            mat.colorNode = TSL.vec4(TSL.vec3(0.0), atl ? TSL.max(deckt, atl.a) : deckt);
            mat.alphaTest = 0.5;
            mat.transparent = false;
        } else if (klasseLook) {
            // Haut + Fell: Shader-Gesetze der Labs (koerperstudio matSkin: SSS-Fresnel-Saum · tetrapoda matFur:
            // Fell-Rim + Gold-Sheen + Spitzen-Rim/-Spec) reisen als DATEN (FELL_LOOK/HAUT_LOOK/HAAR_LOOK, Kern-
            // Zahlen = die EINZIGE Quelle) und werden hier als emissive-Additive gewoben (wie das Lab-GLSL).
            // Strähnen-Achse: die Strähne des Tiers trägt sie als Farbverlauf (Wurzel = Ton×0.12), die Luminanz-Ratio zum
            // Ton-Anker (mp.color) gewinnt vStrandY zurück; das Haar des Menschen trägt sie als Rahmen (`aStraehne`, unten).
            mat.colorNode = TSL.vec4(vcol, 1.0);
            try {
                const tkC = typeof globalThis !== "undefined" ? globalThis.__tetrapodaCore : null;
                const kkC = typeof globalThis !== "undefined" ? globalThis.__koerperCore : null;
                const schale = kind === "fellSchale";
                const strand = kind === "hair" || kind.indexOf("straehne") === 0 || schale;
                const L =
                    kind === "skin" || kind === "haut"
                        ? kkC && kkC.HAUT_LOOK
                        : kind === "hair"
                          ? kkC && kkC.HAAR_LOOK
                          : kind === "fell"
                            ? tkC && tkC.FELL_LOOK && tkC.FELL_LOOK.koerper
                            : tkC && tkC.FELL_LOOK && tkC.FELL_LOOK.straehne;
                if (L) {
                    const ndv = TSL.normalView.normalize().dot(TSL.positionViewDirection).clamp(-1.0, 1.0);
                    const rim = TSL.float(1.0).sub(ndv.abs()).clamp(0.0, 1.0);
                    let add = null;
                    const term = (farbe, knoten) => {
                        const t = TSL.vec3(farbe[0], farbe[1], farbe[2]).mul(knoten);
                        add = add ? add.add(t) : t;
                    };
                    if (strand) {
                        // der Ton-Anker (seine Luminanz) ist ein Stoff-Wert: jeder Fell-/Haar-Ton zeichnet im Programm seiner Art
                        const tonL = _tonA ? this._stoffWert(TSL, "userData.stoffWerte.tonL") : null;
                        const wA = Number.isFinite(L.wurzelAnker) ? L.wurzelAnker : 0.12;
                        // DAS SCHALEN-FELL (V18.497): die Schale t (aSchale.x) IST die Strähnen-Achse. Die Haar-
                        // Maske liest die Wurzel (aWurzel, Bind-Raum — sie läuft mit jeder Pose mit): das Raster
                        // folgt der Gesetz-Dichte (aSchale.z = √Median Strähnen je Fläche), je Zelle eine Locke
                        // mit gewürfeltem Zentrum, deren Radius mit der lokalen Dichte (aSchale.y) wächst und zur
                        // Spitze zuläuft; sie endet bei 55–100 % der Fell-Länge. Die inneren zwei Schalen decken
                        // (Unterwolle), wo das Gesetz Fell trägt. Farbe Wurzel → Spitze = Ton × FELL_SCHALE.
                        const aS = schale ? TSL.attribute("aSchale", "vec3") : null;
                        // Die Zahlen des Rasters sind DATEN des Gesetzbuchs (tetrapoda FELL_SCHALE, K45) — das Labor
                        // liest dieselben (worlds/tetrapoda, GLSL); fehlen sie, bricht der Stoff laut (_stoffBruch).
                        const FS = schale ? tkC.FELL_SCHALE : null;
                        let zeigt = null; // der Anteil, den das Bild von der Locke aufzulösen vermag (unten)
                        if (schale) {
                            const t = aS.x;
                            // das Raster der Locke: `locke` Strähnen-Zellen weit (w20-haar-arm — die Locke klumpt)
                            const p = TSL.attribute("aWurzel", "vec3").mul(aS.z.div(FS.locke));
                            const hA = FS.hashA,
                                hB = FS.hashB;
                            // der Strich: die Locke längs des Kamms (Lage − Wurzel quer zur Normale) gestreckt, flächentreu;
                            // die Zellen der `nachbarn` längs des Kamms reichen ihre Locke herüber (w10-figur: die Strähne
                            // läuft über die Wand ihrer Zelle) — dieselbe Mathe wie die Referenz tetrapoda `fellLocke`
                            const kv = TSL.positionGeometry.sub(TSL.attribute("aWurzel", "vec3"));
                            const kq = kv.sub(TSL.normalGeometry.mul(kv.dot(TSL.normalGeometry)));
                            const kd = kq.div(kq.length().max(1e-6));
                            const radius = aS.y
                                .sqrt()
                                .mul(FS.radius)
                                .mul(TSL.float(1.0).sub(t.mul(FS.zulauf)));
                            let haar = null,
                                quer = null;
                            for (let o = -FS.nachbarn; o <= FS.nachbarn; o++) {
                                const zelle = TSL.floor(o === 0 ? p : p.add(kd.mul(o)));
                                const h1 = TSL.fract(TSL.sin(zelle.dot(TSL.vec3(hA[0], hA[1], hA[2]))).mul(hA[3]));
                                const h2 = TSL.fract(TSL.sin(zelle.dot(TSL.vec3(hB[0], hB[1], hB[2]))).mul(hB[3]));
                                const mitte = TSL.vec3(h1, h2, TSL.fract(h1.add(h2).mul(FS.hashC)))
                                    .sub(0.5)
                                    .mul(FS.mitte);
                                const q = p.sub(zelle).sub(0.5).sub(mitte);
                                const ql = q.dot(kd);
                                const dist = q
                                    .dot(q)
                                    .sub(ql.mul(ql))
                                    .mul(FS.strich)
                                    .add(ql.mul(ql).div(FS.strich))
                                    .sqrt();
                                const h = TSL.step(dist, radius).mul(TSL.step(t, h1.mul(FS.endeSpanne).add(FS.ende)));
                                haar = haar ? TSL.max(haar, h) : h;
                                // DER QUERSCHNITT (w20-haar-arm): der Ton der Locke dünnt vom Kern zur Kante auf den Unterton aus
                                const g = h.mul(
                                    TSL.float(1).sub(TSL.smoothstep(FS.kern, 1, dist.div(radius.max(1e-6))))
                                );
                                quer = quer ? TSL.max(quer, g) : g;
                            }
                            const wolle = TSL.step(t, FS.wolle).mul(TSL.step(FS.wolleAb, aS.y));
                            // das Gewicht des eigenen Tons: die Wolle 1, die Locke ihr Querschnitt — mal die Auflösung (unten)
                            const gewicht = wolle.add(TSL.float(1).sub(wolle).mul(quer));
                            // DIE AUFLÖSUNG DER LOCKE (w20-haar-arm, tetrapoda FELL_SCHALE.aufloesung): ihre Breite in Szenen-
                            // Pixeln — die breiteste Locke (t = ½) 2 r / √strich Locken-Zellen durch den Fuß des Pixels im
                            // Raster (die größere Ableitung) — blendet ihren Ton ein; darunter trägt jede Schale den mittleren
                            // Ton des Stapels (`mittel`): die Mitte des Pixels träfe die Locke nur zufällig, ihr Ton wäre Rauschen
                            const fuss = TSL.max(TSL.dFdx(p).length(), TSL.dFdy(p).length());
                            const breite = aS.y
                                .sqrt()
                                .mul((FS.radius * (1 - 0.5 * FS.zulauf) * 2) / Math.sqrt(FS.strich))
                                .div(fuss.max(1e-6));
                            zeigt = TSL.smoothstep(FS.aufloesung[0], FS.aufloesung[1], breite).mul(gewicht);
                            // Der Ausschnitt lebt in colorNode.a wie jeder Ausschnitt (Lehre 26: der r184-Schattenpass liest
                            // colorNode.a, nie opacityNode) — kein Stoff schneidet über opacityNode, auch keiner, der heute
                            // nicht wirft. Die Kopf-Schalen (K28) tragen dasselbe Raster: Leib und Kopf EIN Stoff.
                            mat.alphaTest = 0.5;
                            mat.colorNode = TSL.vec4(
                                vcol.mul(
                                    TSL.mix(
                                        TSL.float(FS.mittel.ton),
                                        TSL.mix(TSL.float(FS.wurzel), TSL.float(FS.spitze), t),
                                        zeigt
                                    )
                                ),
                                TSL.max(haar, wolle)
                            );
                        }
                        const sT = schale
                            ? TSL.mix(TSL.float(FS.mittel.t), aS.x, zeigt)
                            : tonL !== null
                              ? vcolRoh
                                    .dot(TSL.vec3(0.2126, 0.7152, 0.0722))
                                    .div(tonL)
                                    .sub(wA)
                                    .div(Math.max(1e-3, 1 - wA))
                                    .clamp(0.0, 1.0)
                              : TSL.float(1.0);
                        if (Number.isFinite(L.tipRimPow) && Array.isArray(L.tipRimFarbe))
                            term(L.tipRimFarbe, rim.pow(L.tipRimPow).mul(sT));
                        if (Number.isFinite(L.specPow) && Array.isArray(L.specFarbe))
                            term(L.specFarbe, ndv.max(0.0).pow(L.specPow).mul(sT).mul(L.specAmt));
                    } else {
                        if (Number.isFinite(L.sssPow) && Array.isArray(L.sssFarbe))
                            term(L.sssFarbe, rim.pow(L.sssPow).mul(L.sssAmt));
                        if (Number.isFinite(L.rimPow) && Array.isArray(L.rimFarbe))
                            term(L.rimFarbe, rim.pow(L.rimPow).mul(L.rimAmt));
                        if (Number.isFinite(L.sheenPow) && Array.isArray(L.sheenFarbe))
                            term(L.sheenFarbe, ndv.max(0.0).pow(L.sheenPow).mul(L.sheenAmt));
                        // microFur-Sparkle (matFur: hash-Raster, Schwelle, Rim³): das Bäcker-Merge trägt kein garantiertes
                        // uv — das Raster des Bind-Raums (positionGeometry × dichte) ersetzt es; es klebt an der
                        // geskinnten Haut (V18.497), statt über die bewegten Beine zu schwimmen.
                        const mf = L.microFur;
                        if (mf && Array.isArray(mf.farbe)) {
                            const cell = TSL.floor(TSL.positionGeometry.xz.mul(mf.dichte));
                            const hsh = TSL.fract(TSL.sin(cell.dot(TSL.vec2(12.9898, 78.233))).mul(43758.5453));
                            term(mf.farbe, rim.pow(3.0).mul(TSL.step(mf.schwelle, hsh)).mul(mf.amt));
                        }
                    }
                    if (kind === "hair" && L.kk) {
                        // DER GLANZ DES HAARS IST LICHT (w25-haar-albedo) AN DER FASER (w26-haar-arm): Kajiya-Kay je direktem Licht im
                        // Lichtmodell des Haars (`_haarLichtModell`), nie als Emission. Die Tangente der Strähne (`aHaarT`, koerper
                        // `haarAchse`) trägt diffus und Glanz; über die Naht in die Welt (die Instanz der Menge mit), dann ins Auge.
                        const K = AnazhRealm._haarLichtModell();
                        const naht = this._weltNaht(TSL);
                        const a = TSL.Fn((b) =>
                            b.geometry && b.geometry.hasAttribute("aHaarT")
                                ? TSL.attribute("aHaarT", "vec4")
                                : TSL.vec4(0.0)
                        )();
                        const welt = naht.spalte(0).mul(a.x).add(naht.spalte(1).mul(a.y)).add(naht.spalte(2).mul(a.z));
                        // DER FUSSABDRUCK DES PIXELS an der Strähne (`kk.fuss`, w27-haar-arm-2): Meter je Pixel der Szene am Ort der
                        // Ecke (Tiefe, Projektion und Höhe des Ziels — wie das Schutt-Korn des Bodens) gegen die Breite der Strähne
                        // (Kopf-Raum × die Skala der Naht): `unter` 0, wo das Pixel die Strähne auflöst, 1, wo es mehrere deckt
                        const F = L.kk.fuss;
                        const pxM = TSL.positionView.z
                            .negate()
                            .max(1e-4)
                            .mul(2.0)
                            .div(TSL.cameraProjectionMatrix.element(1).y.mul(TSL.screenSize.y));
                        const unter = TSL.float(1.0).sub(
                            TSL.smoothstep(F.px[0], F.px[1], naht.skala.mul(F.breite).div(pxM))
                        );
                        const faser = {
                            t: TSL.vertexStage(TSL.cameraViewMatrix.mul(TSL.vec4(welt, 0.0)).xyz),
                            wurf: TSL.vertexStage(a.w.mul(unter.oneMinus())),
                            unter,
                            anteil: TSL.vertexStage(
                                TSL.step(0.5, a.xyz.length()).mul(TSL.float(1.0).sub(unter.mul(F.flaeche)))
                            ),
                            lappen: K.lappen(L.kk, unter),
                        };
                        mat.setupLightingModel = () => new K(L.kk, faser);
                        const schluessel = mat.customProgramCacheKey;
                        mat.customProgramCacheKey = function () {
                            return schluessel.call(this) + "|haarLicht";
                        };
                    } else if (add) {
                        // DER SAUM IST LICHT (licht-eine-skala, die Klasse Schein-Emissiv fällt): Haut-Saum, Fell-Rim, Sheen und
                        // Strähnen-Glanz sind Rückwurf des Lichts am Ort (`_saumLichtModell`), nie Emission
                        const saum = add;
                        const eigen = Object.getPrototypeOf(mat).setupLightingModel;
                        mat.setupLightingModel = function (builder) {
                            return AnazhRealm._saumLichtModell(eigen.call(this, builder), saum);
                        };
                        const schluessel = mat.customProgramCacheKey;
                        mat.customProgramCacheKey = function () {
                            return schluessel.call(this) + "|saumLicht:" + kind;
                        };
                    }
                    // Wrap-Licht des Lab-Fells: ·(0.5 + 0.5·max(NdotV,0)) NACH allen Additiven — die matFur-Ordnung
                    // (outputNode multipliziert den fertigen Output inkl. der Saum-Terme).
                    if (Number.isFinite(L.wrap)) {
                        const w = ndv
                            .max(0.0)
                            .mul(L.wrap)
                            .add(1.0 - L.wrap);
                        mat.outputNode = TSL.vec4(TSL.output.rgb.mul(w), TSL.output.a);
                    }
                    // Atem-Noise-Displacement der Labs (matFur/matSkin: snoise(pos·freq + t·k)·amp; hier mx_noise, gleiche
                    // Rausch-Klasse) auf fell und skin. Die Tier-Haut (fell) ist seit V18.497 geskinnt: r184
                    // setupPosition fährt das Skinning VOR dem positionNode (Vendor gelesen) — sie atmet gebogen.
                    // Die haut-Hülle des Menschen bleibt still.
                    const at = L.atem;
                    if (at && (kind === "fell" || kind === "skin")) {
                        mat.positionNode = TSL.positionLocal.add(
                            TSL.normalLocal.mul(
                                TSL.mx_noise_float(TSL.positionLocal.mul(at.freq).add(TSL.time.mul(at.t))).mul(at.amp)
                            )
                        );
                    }
                }
            } catch (_eL) {
                throw this._stoffBruch("die Look-Addition (Haut · Fell · Haar)", _eL);
            }
            // DAS HAAR WEHT IM EINEN WIND UND SCHWINGT MIT DEM LEIB (haar.K3, `_haarWindKnoten`)
            if (kind === "hair") mat.positionNode = this._haarWindKnoten(TSL);
        } else if (mp && mp.webe) {
            // Stoff-Webung (Studio-getCloth): feine Mikro-Struktur moduliert die Stoff-Farbe (Strick grob, Denim/
            // Baumwolle fein, Leder/Gummi glatt-marmoriert) — additiv, nur wenn die Gesetz-Zeile Webung trägt. Frequenz und
            // Tiefe sind die EINE Webungs-Tafel des Kerns (koerper-core WEBE, das Labor liest dieselbe), fail-closed (K2).
            const webe = AnazhRealm.Gesetz("koerper:WEBE." + mp.webe);
            if (!Array.isArray(webe)) throw this._stoffBruch("die Webung " + mp.webe + " fehlt in koerper:WEBE");
            const [wf, wa] = webe;
            const wn = TSL.mx_noise_float(TSL.positionLocal.mul(wf)).mul(wa).add(1.0);
            mat.colorNode = TSL.vec4(vcol.mul(wn), 1.0);
        } else if (R.ub) {
            // DAS UNBELEUCHTETE IST LICHT (w4-genesis-tore): ein Stoff ohne Licht-Antwort im Labor (MeshBasic: das Filigran, der
            // Bogen-Saum und die Licht-Scheibe der Tore) leuchtet in seiner Farbe (das Leucht-Gesetz oben, `leucht` 1) und wirft
            // kein Licht zurück — schwarz, wie im Labor, wo kein Licht auf ihn wirkt. Bis hier zeichnete die Welt ihn matt
            // beleuchtet (Rauheit 0,7): das glühende Filigran stand als olives Messing im Schatten.
            mat.colorNode = TSL.vec4(0.0, 0.0, 0.0, 1.0);
        } else if (mp && typeof mp.stein === "string") {
            // DAS STEIN-GESETZ (porta STEIN_GESETZ, w4-genesis-tore): Fuge, Kante und Bruchton aus der Lage im Verband (`_steinRahmen`
            // liest den EINEN Kamm `_steinStoff`, das uv der Teile), das Korn die Zahl seiner Zeile — nie die Rauheit des Stoffs
            // (w28-stein-kamm); die Zahlen liest der Stoff aus dem Gesetzbuch (fail-closed wie die Webung).
            const G = AnazhRealm.Gesetz("porta:STEIN_GESETZ." + mp.stein);
            if (!G || !(G.fuge > 0) || !(G.fase > 0) || !(G.ton >= 0) || !(G.fugeTon > 0) || !(G.korn >= 0))
                throw this._stoffBruch("das Stein-Gesetz " + mp.stein + " fehlt in porta:STEIN_GESETZ");
            this._steinRahmen(TSL, mat, vcol, G);
            mat.userData.stein = mp.stein; // der Bau-Satz trägt das uv seiner Ecken (`BAU_STEIN_ATTR`)
        } else {
            // Fels/Kristall/Blume/Laub: die Vertex-Farbe (Laub/Gras × uSeasonMul), die Regler (rough/metal/flat/
            // env) sind schon oben aus `mp` gesetzt → Kristall glaenzt facettiert, Fels bleibt matt.
            mat.colorNode = TSL.vec4(laubFarbe, 1.0);
        }
        // DIE REGLER JE ECKE (K43-2, der EINE Satz-Stoff): Rauheit · Metall · Deckkraft aus `aRegler`, das Emissiv × Glut-Stärke
        // aus `aGlut` — vor der Blende (sie multipliziert die Deckung) und vor dem Leucht-Gesetz (es addiert den Licht-Pool
        // auf das Emissiv; ein Stoff des Leucht-Gesetzes `leucht` behält sein Emissiv aus der Farbe).
        if (satz === true) {
            // (vier Stellen: die vierte trägt den Verband der Ecke — EIN Knoten dieses Namens, r184 teilt ihn nach dem Namen)
            const rg = TSL.attribute("aRegler", "vec4");
            mat.roughnessNode = rg.x;
            mat.metalnessNode = rg.y;
            // die Deckkraft lebt in colorNode.a wie jeder Ausschnitt (Lehre 26: nie opacityNode), die Marke 0,5 trägt nichts bei
            if (R.op < 1) {
                mat.opacity = 1;
                mat.colorNode = TSL.vec4(mat.colorNode.rgb, mat.colorNode.a.mul(rg.z));
            }
            if (!(mp && typeof mp.leucht === "number" && mp.leucht > 0))
                // (vier Stellen wie die Farbe, die vierte: die Lage hoch; ein Bildwert des Labors ÷ Belichtung wie oben — eine
                // Lichtquelle im Satz bricht laut, `_satzRegler`)
                mat.emissiveNode = this._erscheinung(TSL.attribute("aGlut", "vec4").xyz);
            mat.userData = mat.userData || {};
            mat.userData.satzSchluessel = key;
        }
        // DER VERBAND (w28-haus-stoff, fachwerk VERBAND_GESETZ): Stein, Fuge und Ton der Fläche als Funktion ihrer Lage in der Welt
        // (`_verbandStoff`) — im Satz die Nummer der Zeile je Ecke (die vierte Stelle von `aRegler`: Dach, Sockel und Wand EINES
        // Stoffs tragen je ihren), außerhalb des Satzes die der Ecke (`aVerband` der gefalteten Stufe, `ecken.verband`) oder die
        // des Stoffs als Stoff-Wert. Der EINE Satz-Stoff der Klasse webt ihn für jedes Haus.
        if (verband) {
            const nr =
                satz === true
                    ? TSL.attribute("aRegler", "vec4").w.mul(127.0)
                    : eckVerband
                      ? TSL.attribute("aVerband", "float")
                      : this._stoffWert(TSL, "userData.stoffWerte.verband");
            // die Lage der Ecke in ihrer Wand (im Satz: die vierten Stellen von Farbe und Glut, `BAU_SATZ_ATTR`; sonst `aLage`)
            // — EIN Varying
            const ecke =
                satz === true
                    ? TSL.varying(
                          TSL.vec2(TSL.attribute("color", "vec4").w, TSL.attribute("aGlut", "vec4").w),
                          "vWandLage"
                      )
                    : eckLage
                      ? TSL.varying(TSL.attribute("aLage", "vec2"), "vWandLage")
                      : null;
            // DAS GEFÜGE (haus-gefuege, fachwerk GEFUEGE_GESETZ) am selben Ort, aus derselben Nummer: Korn, Faser und Verwitterung in
            // der Farbe, das Relief in der Normale, seine Spanne in der Rauheit (`_gefuegeStoff`) — der Zweig des Verbands trägt es
            // immer (EINE Signatur, dieselben Knoten-Plätze)
            const stein = {};
            const farbe = mat.colorNode;
            const fuge = this._verbandStoff(TSL, nr, ecke, stein, farbe.rgb);
            const gefuege = this._gefuegeStoff(TSL, nr, stein);
            mat.colorNode = TSL.vec4(gefuege.farbe(farbe.rgb.mul(fuge)), farbe.a);
            mat.normalNode = gefuege.normale;
            mat.roughnessNode = gefuege.rauh(mat.roughnessNode || TSL.materialRoughness);
            // DAS LICHT IM SCHLITZ DER FUGE (`_verbandStoff`): der Himmel im indirekten Licht (r184 trägt aoNode nur dorthin), die
            // Sonne im empfangenen Schatten (je Kaskade, wie die Zuwendung des Bodens) — nie in der Albedo
            const himmelVor = mat.aoNode || (mat.aoMap && TSL.materialAO ? TSL.materialAO : null);
            mat.aoNode = himmelVor ? himmelVor.mul(stein.himmel) : stein.himmel;
            const schattenVor = mat.receivedShadowNode;
            mat.receivedShadowNode = (schatten) => (schattenVor ? schattenVor(schatten) : schatten).mul(stein.sonne);
        }
        // DER HALM (w4-wiese-nah, phyto-core HALM_GESETZ): Querschnitt, Adern und Narbe je Pixel des Schirms, fern die Wiese als
        // DACH (licht.K1: die Normale des Dachs, Rauheit 1) — EIN Gesetz (`_halmStoff`), hinter dem Satz-Regler (er gilt jeder
        // Wiese, die Cuticula liest dessen Rauheit); das direkte Licht im Laub-Licht mit der Narbe (unten). Mit der Klinge allein
        // lichtete der doppelseitige Halm wie eine Wand: die Nah-Wiese hob die Stunde 0,33 über den Mittag (Mess-Wiese Ego,
        // swiftshader: +0,37 EV), das Dach mit der Rauheit der Klinge (0,7) spiegelte die Abendsonne (+0,32 EV).
        if (kind === "grass") this._halmStoff(TSL, mat);
        // DAS MIKRO-RELIEF DER FACETTE (material.K2, `_mikroGestalt`): der facettierte Studio-Stein (Fels, Kristall: kind
        // „unknown" mit flatShading) kippt seine Facetten in den Oktaven am Schirm, gewogen mit seiner Rauheit (glatt ≤ 0,3 nichts,
        // matt ≥ 0,6 ganz) — im Satz die Rauheit je Ecke, sonst die des Stoffs als Stoff-Wert (`_stoffWert`). Das Korn lebt im
        // colorNode, einem geteilten Platz: der Zweig steht in der Signatur (`mikro`, unten).
        if (mikro) {
            const rauh = satz ? TSL.attribute("aRegler", "vec4").x : this._stoffWert(TSL, "userData.stoffWerte.rauh");
            this._mikroGestalt(TSL, mat, true, TSL.smoothstep(0.3, 0.6, rauh));
        }
        // Studio-Dither-Blende auf den Foundry-3D-Stufen: Fade-out L0 + Fade-in L1 (Laub überlappend, Rinde
        // exakte Partition); die Maske faltet in die Alpha (TSL statt discard, alphaTest cullt). Formeln = die
        // EINE Quelle `__phytoCore.lodCrossfadeMask` (via `_lodCrossfadeMaskNode`); xfade aus = Material
        // unverändert. Die Klassen-Look-Familie (Kreatur/Mensch, aLodLevel=0 → Maske = Identität) bleibt
        // maskenfrei — sonst nur tote Attribut-Reads + Warnungen auf ungestempelten Geometrien.
        if (xfade && !klasseLook) {
            const _keepX = this._lodCrossfadeMaskNode(TSL, {
                foliage: kind === "foliage" || kind === "foliageTex" || kind === "grass",
            });
            {
                // DER KANAL der Maske: der r184-Schattenpass liest colorNode.a, nie opacityNode — nur eine Maske in der
                // Farbe gilt auch dort. Die Instanz-Wahl liest Marke und Kanal (`_instanzFensterGilt`): ein Fenster
                // ohne die Maske des Passes schnitte ein Loch.
                let kanal = null;
                if (mat.opacityNode) {
                    mat.opacityNode = mat.opacityNode.mul(_keepX);
                    kanal = "deckung";
                } else if (mat.colorNode && mat.colorNode.rgb !== undefined && mat.colorNode.a !== undefined) {
                    mat.colorNode = TSL.vec4(mat.colorNode.rgb, mat.colorNode.a.mul(_keepX));
                    kanal = "farbe";
                } else
                    throw this._blendeBruch(
                        `der Stoff „${kind}" trägt keinen Kanal für die Maske (Deckung oder Farbe mit Alpha)`
                    );
                // die Schwelle trennt die Maske (0 | 1), nie die Deckkraft des Stoffs: eine Scheibe (Deckkraft 0,42 < 0,5)
                // fiel bis K11 ganz unter die Schwelle — kein Fenster, keine Wagen-Scheibe zeichnete, das Fenster-Licht
                // der Nacht (`_leuchtStoff`) blieb unsichtbar
                // (der Satz-Stoff liest die Deckkraft je Ecke: seine Schwelle liegt unter jeder Deckkraft eines Stoffs, 1/255)
                if (!(mat.alphaTest > 0)) mat.alphaTest = satz === true && R.op < 1 ? 1 / 255 : 0.5 * R.op;
                mat.userData = mat.userData || {};
                mat.userData.foundryCrossfade = true;
                mat.userData.foundryCrossfadeKanal = kanal;
            }
        }
        // DIE DURCHSICHT: jeder Pflanzen-Stoff (Rinde · Stiel · Laub · Blatt-Karte; nie Gras, nie die Klassen-Look-Familie
        // der Kreaturen und Menschen) wird zwischen Auge und Spieler und in der Nah-Kugel um das Auge durchsichtig
        // (`_kameraDurchsichtNode` seiner Art: der wiegende Stoff der Nah-Streu ist Boden, sonst Rinde oder Laub) — im
        // maskNode, den nur der Bild-Pass liest; der Schatten-Pass liest seinen eigenen maskShadowNode (immer behalten).
        if (!klasseLook && (isBark || kind === "foliage" || kind === "foliageTex")) {
            const _durch = this._kameraDurchsichtNode(TSL, wiegen === true ? "boden" : isBark ? "rinde" : "laub");
            mat.maskNode = _durch;
            mat.maskShadowNode = TSL.bool(true);
        }
        // Die Nah-Wiese wiegt (V18.508): das Studio-Gras liest das EINE Wiegen wie die Streu (`_windSwayOffset`: die Weite der
        // Böe am Ort, die Phase je Büschel aus seinem Fuß) mit der Halm-Höhe in Metern (Vorlage × Studio-Skala `gras`), und der
        // Spieler biegt die Halme (uBend). r184 rechnet den Versatz VOR der Instanzierung (K20-N1): Böe, Rauschen und Biegung
        // lesen die Welt über die Naht `_weltNaht`, der Versatz geht über sie in die Vorlage zurück.
        // DIE GESTALT DES JAHRS IM HALM (vegetation.K5#2, SAISON_GESETZ `ha` über `_saisonPraesenz` z): jeder Halm kürzt sich
        // längs seiner Achse um seinen Fuß (`_halmImJahr`, phyto-core `halmImJahr`: Höhe und Neigung × ha, die Breite bleibt) VOR
        // dem Wind, und der Wind wiegt die gekürzte Höhe — im Winter trägt die Wiese 0,35 ihrer Sommer-Fläche, im Sommer steht sie
        // ganz (×1). Bis w26 staute der Stoff nur y (Fläche 0,44, von oben 1,00 — LAI 2–10 m Winter 0,567 × Sommer, Radeon
        // 87537d3f); bis vegetation.K5#2 trug das Jahr dem Gras nur Farbe.
        if (kind === "grass") {
            this._windUniformsEnsure();
            const _sk = this._foundryWorldScaleMatrix("gras").elements[0];
            const _ha = _suF.uLaubPraesenz.z;
            const _sway = this._windSwayOffset(TSL, { hoehe: TSL.positionGeometry.y.mul(_sk).mul(_ha) });
            const _c = TSL.attribute("aCenter", "vec3");
            mat.positionNode = this._halmImJahr(TSL, TSL.vec3(_c.x, 0, _c.z), TSL.positionLocal).add(_sway);
        } else if (wiegen === true) {
            // DIE NAH-STREU WIEGT (Integration 05.10.): die weichen Boden-Arten (Farn · Schilf · Gestrüpp · Blume)
            // lesen dasselbe Wiegen wie das Gras aus der EINEN Quelle (`_windSwayOffset`: uWindTime · uWindDir · Böe ·
            // uBend) — je Instanz ihrer Senke (w27-takt-streu): die Höhe über der Wurzel in Metern ist die Vorlage × die
            // Welt-Skala der Instanz (die Länge ihrer zweiten Spalte, `_weltNaht`), das Rauschen der Pflanze liest der Wind
            // an ihrem Fuß (dem Anker der Instanz). Jeder Teil einer Pflanze steht an demselben Fuß — Rute und Laub, Stiel
            // und Blüte wiegen in einer Phase; der Charakter (laengs 1,2) ist der des gefallenen Klein-Vegetations-Zwillings.
            // Bis w27-takt-streu trug der Streu-Satz beides je Ecke (`aWiege`), seine Positionen lagen in Welt-Lage.
            this._windUniformsEnsure();
            const _hoehe = TSL.positionGeometry.y.mul(this._weltNaht(TSL).spalte(1).length());
            const _sway = this._windSwayOffset(TSL, { laengs: 1.2, hoehe: _hoehe });
            mat.positionNode = (jahr === true ? this._jahrLage(TSL) : TSL.positionLocal).add(_sway);
        }
        // DAS JAHR OHNE BAUM-WIND (die Blende aus): sonst webt `_baumWindStoff` die Lage des Jahrs in den Wind-Knoten
        const _baumWind = xfade && (isBark || kind === "foliage" || kind === "foliageTex" || kind === "schatten");
        if (jahr === true && !mat.positionNode && !_baumWind) mat.positionNode = this._jahrLage(TSL);
        // EIN GRAPH JE SIGNATUR (1310-18, `_graphTeilen`; 1310-17: 43 Foundry-Stoffe, 43 Bauten). Die Signatur nennt jede
        // Eingabe, an der der Bau oben verzweigt (Art · Rinde · Look-Klasse · Leucht · Gewebe · Ton-Anker der Strähne · Blende ·
        // Wiegen) — die Werte je Stoff liest der Graph als Stoff-Wert, die Regler (Rauheit, Metall, Leuchtfarbe, Deckkraft,
        // Schwelle) liest r184 als Stoff-Referenz. Der Satz-Stoff (K43-2) ist eine Eingabe: er liest Rauheit und Metall je Ecke
        // (`aRegler`), das Emissiv aus `aGlut` und, durchsichtig, die Deckkraft in colorNode.a.
        const _sig = [
            kind,
            isBark ? "rinde" : "",
            klasseLook ? "look" : "",
            mat.userData.stoffWerte.leucht > 0 ? (mp.unbeleuchtet === true ? "leucht:bild" : "leucht") : "",
            emis && !(mp && mp.seh === "glut") ? "emis:bild" : "", // der Bildwert ÷ Belichtung (oben am Emissiv)
            mp && mp.webe && !isBark && !klasseLook && kind !== "foliageTex" && kind !== "schatten"
                ? "webe:" + mp.webe
                : "",
            _tonA && klasseLook ? "ton" : "",
            xfade ? "xf" : "",
            wiegen === true ? "wiegt" : "",
            satz === true ? (R.op < 1 ? "satz:durch" : "satz") : "",
            ton ? "aTon" : "", // die Farbe je Ecke nach der Palette des Leibs (`vcol`): ohne Blende teilte sie sonst einen Graphen
            jahr === true ? "jahr" : "",
            // das Unbeleuchtete (schwarz, nur Leuchten) und der Stein (Fuge, Kante, Ton aus dem uv) bauen eigene Graphen
            R.ub ? "ub" : "",
            mp && typeof mp.stein === "string" && !R.ub ? "stein:" + mp.stein : "",
            // DAS MIKRO-RELIEF DER FACETTE (`_mikroGestalt`) schreibt das Korn in colorNode: bis w13-fels-korn fehlte der Zweig
            // hier — der facettierte Fels (`unknown|…|1|0.50|xf|satz`) und ein glatter Bau-Stoff (`…|0|1.00|s2|v:stoff|xf|satz`)
            // trugen EINE Signatur, und wer zuerst baute, gab beiden den colorNode: baute die Wand zuerst, verlor der Fels sein Korn
            // (Radeon main 25374f6f, material.K2#1 am Fels der Genesis 0,5/1/2 m: glatt 0,606/0,559/0,237 → 0/0,029/0), baute der
            // Fels zuerst, trug die Wand seines (headless, Start an der Genesis). Die Folge der Bauten verschob w13-kreatur-blick.
            mikro ? "mikro" : "",
            // der Verband webt in colorNode (`_verbandStoff`): sein Zweig steht in der Signatur
            verband ? (eckVerband ? (eckLage ? "verband:ecke+lage" : "verband:ecke") : "verband") : "",
            // DIE KRONE (K68-N1, `_laubStoffNormale`) schreibt Normale und Empfangs-Ort: ein Klingen-Laub mit Krone (Baum, Strauch)
            // und eines ohne (Farn, Blüte, Schilf) bauen eigene Graphen
            _krone ? "krone" : "",
            // NACH DEM TEILEN VERZWEIGT DAS LEUCHTEN (`_leuchtStoff` unten): die Glut ist Quelle (ohne Pool und Nässe), das
            // Durchsichtige trägt keine Nässe, ein Licht-Datum glüht nach seinem Zeitplan — bis w22-ankunft-kalt teilten sie die
            // Signatur des Bau-Stoffs, und die Linse 1310-18 nannte sie getrennt (Glut, Glas, Laterne neben `v:stoff`)
            mp && mp.seh === "glut" ? "glut" : "",
            R.op < 1 ? "durch" : "",
            mp && mp.licht ? "licht:" + mp.licht : "",
        ].join("|");
        this._graphTeilen(mat, _sig);
        mat.userData.foundrySignatur = _sig;
        mat.userData.foundryKind = kind; // die Art vor dem Leuchten: die Nässe liest ihre Poren (`_naesseImStoff`)
        // das Leuchtquellen-Gesetz: der Licht-Pool und der Zeitplan des Gesetzbuchs (`mp.licht`) im Leuchten (K11)
        this._leuchtStoff(mat, mp);
        mat.userData.foundryMp = mp || null; // die Regler reisen mit: die Nah-Streu baut denselben Stoff wiegend
        // Kein stiller Rückfall: ein Stoff, der nicht baut, wirft laut (bis K11 fing ein Fang jeden Fehler und baute einen
        // Standard-Stoff ohne Knoten — ohne Pool, ohne Maske, ohne Wind).
        this._foundryMats[key] = mat;
        // der Wurf-Teil (kind "schatten") trägt denselben Wind wie das Bild seiner Stufe; der Wurf eines Baus steht (an 0)
        if (xfade && !wiegen && (isBark || kind === "foliage" || kind === "foliageTex" || kind === "schatten"))
            this._baumWindStoff(mat, kind, baum);
        if (kind === "foliage" || kind === "foliageTex") this._laubLichtStoff(mat, kind === "foliageTex");
        else if (kind === "grass") this._laubLichtStoff(mat, false, TSL.uv().y);
        return mat;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_studio_stoff]);

// ===== ATLAS · Studio/stoff — Außen-Konstanten =====
// DIE WELLEN DER UNRUHE (`_verbandStoff`, w28-haus-stoff): eine Zeile des Verband-Gesetzes mit `unruhe` (der Kellenzug des
// Putzes) verzieht ihre Reihen um zwei Wellen — `welle` = die Frequenz der ersten und der zweiten (je Reihe, zueinander
// unharmonisch: das Muster kehrt in keinem Haus wieder) und der Anteil der zweiten, `phase` ihr Versatz; `steil` = ihre größte
// gemeinsame Steigung (1,7 + 0,73 · 0,5): der Hub der Zeile ist Unruhe / steil, der Abstand zweier Reihen schwankt um die Unruhe
// und bleibt monoton (Unruhe < 1).
AnazhRealm.VERBAND_WELLE = Object.freeze({ welle: Object.freeze([1.7, 0.73, 0.5]), phase: 1.3, steil: 2.065 });
// DIE GRÖSSTE NEIGUNG DES GEFÜGES (`_gefuegeStoff`, haus-gefuege): der Gradient des Reliefs kippt die Normale höchstens um diesen
// Tangens (≈ 50°) — die Ableitung am Schirm wächst im streifenden Blick über jede Neigung, die das Gesetz trägt (das steilste
// Korn der Tafel, der Putz: 1,2 · 0,5 mm ÷ 4 mm · 2 ≈ 0,3).
AnazhRealm.GEFUEGE_KIPP = 1.2;
