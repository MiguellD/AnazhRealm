// welt-licht.js — DAS LICHT DES ORTS: die EINE Atmosphäre der Welt als Tafeln (Hillaire 2020), die Sonne, die Umgebung und die
// Belichtung — EIN Baustein der Engine, den die Welt (stamm/bild-himmel.js ruft ihn je Tafel, je Anker, je Belichtung) UND die
// Bühne der Studios laden (`buehne`, studios.K4: Studio = Modus der Welt-Engine — ein Studio zeichnet sein Werk im Licht der
// Welt, nie unter eigenen Studio-Lichtern). Bis w12-studio-buehne lebten Tafeln, Anker und Belichtung nur im Stamm, den eine
// Studio-Seite nie lädt (gate:studio-huelle H6) — darum zeichnete jede Bühne unter eigenem Licht (garage: Key 2,93π Bernstein,
// Fill, Rim, schwarze Bühne mit Nebel, Belichtung 1,04; die Welt am Mittag: Sonne 6,97 und Himmel, Belichtung 0,511).
// Das Gesetz der Luft selbst (Medium, Durchlass, Sonne) bleibt Kern: foundry-core `ATMO_GESETZ` · `ATMO_RECHNUNG` (VOR diesem
// Skript geladen). THREE ist erst beim Ruf nötig (die Tafeln sind TSL, r184), nie beim Laden.
// eslint-disable-next-line no-unused-vars
var __weltLicht = (function () {
    "use strict";
    const KERN = globalThis.__terrainCore;
    if (!KERN || !KERN.ATMO_GESETZ || !KERN.ATMO_RECHNUNG)
        throw new Error(
            "welt-licht.js: die Atmosphäre fehlt — foundry-core.js (__terrainCore.ATMO_GESETZ) lädt vor dem Licht"
        );

    // DIE TAFELN DER EINEN ATMOSPHÄRE (D3, Hillaire 2020; `atmoTafeln`): Größen (Texel) und Marsch-Schritte. Transmittance
    // 256×64 und Ψ_ms 32×32 je Medium, die Himmels-Sicht 192×108 je Stufe der Sonne, die Umgebung 128×64 (Equirekt, PMREM).
    // mediumStufe: die Stufe des Mediums im Logarithmus der Extinktion (`_atmoMediumJetzt`) — 2 % halten den Zenit-Durchlass
    // der klaren Luft (Aerosol-Tiefe 0,18) unter einer 8-bit-Stufe; ein Übergang klar → Sturm (Faktor 13) sind 130 Stufen.
    // flug: so viele Stufen darf das Medium wandern, solange die Tafel im Flug ist (`_waagrechtIrradianz`) — der steilste Anstieg im
    // Zug klar → Regen (β ×1,13 je Sekunde, 6 Stufen) bleibt eine Sekunde darunter, der Himmel je E0 folgt ihm mit ≤ β^0,62:
    // 8 Stufen sind ≤ 10 % am Himmel, am Mittag ≤ 0,02 EV an der Karte.
    const ATMO_LUT = Object.freeze({
        mediumStufe: 0.02,
        flug: 8,
        durchlass: Object.freeze([256, 64]),
        mehrfach: Object.freeze([32, 32]),
        himmel: Object.freeze([192, 108]),
        umgebung: Object.freeze([128, 64]),
        bestrahlung: Object.freeze([65, 1]),
        richtungen: Object.freeze([12, 24]),
        schritte: Object.freeze({ durchlass: KERN.ATMO_GESETZ.durchlassSchritte, mehrfach: 20, himmel: 32 }),
    });
    // DER BODEN DER ATMOSPHÄRE (D3): die gemessene Welt-Albedo (linear) — das Mittel aus Laub und Wald-Boden der Albedo-Tafel
    // (spec/farbe/albedo-tafel.json, ist.welt; `werkbank albedo --tafel`), nie ein Grau 0,3. Er trägt die untere Hälfte der EINEN
    // Umgebung — den Boden, den jeder nahe Stoff spiegelt (Geschichte: stamm/bild-himmel.js) — und die Erde der Mehrfachstreuung.
    const ATMO_BODEN = Object.freeze([0.1003, 0.1385, 0.0449]);
    // DIE ERDE DER MEHRFACHSTREUUNG (w25-ferne-licht): Ψ_ms sieht den Boden über Dutzende Kilometer — seine Leuchtdichte (Y 0,1236
    // von `ATMO_BODEN`) ohne die Buntheit des Laubs. Mit G/B 3,1 trug die Mehrfachstreuung den Horizont grün (Ton 101–125° statt
    // 222°, Duv +0,0074 … +0,0096, Radeon 77265b04): jedes gemessene Himmelslicht liegt auf der Tageslicht-Ortskurve (Judd, MacAdam,
    // Wyszecki 1964), die Rechnung der Referenz trägt eine graue Erde (Bruneton 2017, Hillaire 2020; Nachbau der Tafeln: 215–217°).
    const ATMO_ERDE = Object.freeze(
        Array(3).fill(0.2126 * ATMO_BODEN[0] + 0.7152 * ATMO_BODEN[1] + 0.0722 * ATMO_BODEN[2])
    );
    // Licht-Rig: KEY_BASE skaliert die Rayleigh-Lichtmenge aufs Schlüssellicht (Mittag ≈ 2.6·0.913). Ziel key-dominant (Vorlage
    // dir/(amb+hemi) ≈ 15:1); die Schattenseite trägt der Himmel.
    const KEY_BASE = 2.6;
    // r128→r184-Licht-Übersetzung (three.js r155, useLegacyLights → physisch): Legacy-Licht hatte keine 1/π-BRDF-Normierung —
    // physikalische Lichter sind bei gleicher Zahl ~π-fach dunkler. Die aus dem r128-Studio kopierten Rig-Werte (Key · Hemi-Tag)
    // laufen durch diesen EINEN Faktor; die Nacht bleibt unberührt. Kein Tuning-Knopf.
    const LEGACY_LICHT = Math.PI;
    // DIE BELICHTUNG (licht.K1) — EINE Eichung mit der Tonkurve (F1): `kurve` ist die Tonkurve des Renderers (three r184: Khronos
    // PBR Neutral), `zielKarte` das k·L der 18-%-Karte, das DIESE Kurve auf Mittelgrau legt (sRGB 118; `kartenEichung(kurve, 0)`
    // in scripts/lib/licht-linsen.cjs rechnet es nach). `min` ist nur die Wand gegen ein entartetes Licht. `steigung` ist die
    // Kompensations-Steigung des Tags (1 = volle Adaption, 0 = feste Blende), `stufen` die Knoten [Grad, Stufen] der Tag-Achse
    // für Dämmerung und Nacht, `gleitung` [oben, unten] das Band, in dem die Kamera von der Steigung auf sie gleitet; `nachtGrad`
    // (S7) die Tiefe der Sonne, in der das Nacht-Auge der Post-Kette ganz steht. Die Messungen stehen am Stamm (bild-himmel.js).
    // DER NACHT-KNOTEN (`nachtKnotenE`, w28-nacht-licht): die weiteste Blende der Kamera — ihr Lichtmesser liest nie weniger als die
    // Beleuchtungsstärke der Vollmond-Nacht des Gesetzes (Welt-Einheiten, wie `_waagrechtIrradianz`), darunter steht die Belichtung,
    // und das Bild fällt mit dem Licht (UE: die Untergrenze der Auto-Belichtung, Min EV100). Bis w28-nacht-licht normierte sie JEDES
    // Licht auf die Karte −2,17 Stufen: die Nacht war ein abgedunkelter Tag — Wände ohne Quelle so hell wie die Gasse unter der
    // Laterne (Stadt 00 Uhr, Radeon: Wand 107 : angestrahlt 138 Luma, 1,75 : 1 linear), 00 Uhr kaum dunkler als 20 Uhr. Der Wert ist
    // E des Vollmonds im Zenit (`MOND_E` 0,462, k 1,85): der hohe Mond trägt die Karte auf die Stufe der Nacht (Mitternacht,
    // Dorf: E 0,54, k 1,59), unter dem Knoten (tiefer Mond, Wald, Wolke) fällt das Bild. Mit dem halben Knoten (0,231) öffnete die
    // Kamera am tiefen Mond bis k 3,7–4,8: die Wand unter der Laterne stand um 20 Uhr heller als am Mittag (Y 0,395, Radeon). Bis w28-nacht-bilanz stand er auf dem
    // gemessenen Licht von main (0,68: Mond + das Sternen-Licht als Füllung E 0,30, `STERNENLICHT`); unter dem Knoten steht die
    // Kamera — fällt das Licht (das Ambient der Nacht, `_dayNightApplyAmbient`; der Mond tiefer am
    // Himmel), fällt das Bild, und Laterne, Fenster und Feuer tragen die Nacht. Der Knoten wächst vom Horizont bis zum Ende der bürgerlichen
    // Dämmerung (`nachtKnotenGrad`, −6°: die Nacht der Tag-Achse ist ganz) logarithmisch ein — dort trägt das Dämmerlicht
    // (`nachtHimmel`) so viel wie der Vollmond. Bis w28-nacht-bilanz wuchs er erst von −6° bis −20° ein: am tiefen Mond (05 Uhr,
    // Sonne −15°) öffnete die Kamera auf k 3,9–4,8, und die Laterne überstrahlte ihre Wand.
    const MOND_STAERKE = 0.65;
    const lumaVon = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    // E DES VOLLMONDS IM ZENIT (Welt-Einheiten, wie `_waagrechtIrradianz`): seine Stärke × die Luma seines Tons
    const MOND_E = MOND_STAERKE * lumaVon(KERN.ATMO_GESETZ.nacht.mond);
    const BELICHTUNG = Object.freeze({
        kurve: "NeutralToneMapping",
        zielKarte: 0.22,
        min: 0.05,
        steigung: 0.75,
        gleitung: Object.freeze([12, 8]),
        stufen: Object.freeze([Object.freeze([10, -0.87]), Object.freeze([-20, -2.17])]),
        nachtKnotenE: MOND_E,
        nachtKnotenGrad: -6,
        nachtGrad: -32,
    });
    // DIE GRENZGRÖSSE DER STERNE je Sonnenhöhe [Grad, Größe] (V18.530, `HIMMEL.grenzgroesse` der Welt): im hellen Tag (≥ 10°) ist
    // nichts zu sehen, am Ende der bürgerlichen Dämmerung (−6°) +1,5, der nautischen (−12°) +4, astronomische Nacht (−18°) +6 —
    // die Anker der EINEN Tag-Achse (`tagAchse`).
    const GRENZGROESSE = Object.freeze(
        [
            [10, -5],
            [2, -4.5],
            [0, -3],
            [-6, 1.5],
            [-12, 4],
            [-18, 6],
        ].map((a) => Object.freeze(a))
    );
    // MONDLICHT: nachts wird das Haupt-Richtlicht zur Mondquelle — `r/g/b` der Purkinje-Hue aus dem Gesetz
    // (`ATMO_GESETZ.nacht.mond`), `intensity` die Helligkeit; das Wetter dimmt ihn. DER MOND TRÄGT DIE NACHT (w28-nacht-licht):
    // 0,22 → 0,65, das Ambient der Nacht fiel 0,23 → 0,04 (`_dayNightApplyAmbient`) — Schlüssel und Füllung der Mondnacht: der
    // Boden und jede Wand zum Mond stehen im Licht mit Schatten, die Wand ohne Mond und Laterne fällt zurück. Der Wert ist das
    // gemessene Maß des lesbaren Bodens (S0 Nacht ohne das Feuer, Radeon, Luma ≥ 22: main 24,1 · Ambient 0,04 mit Mond 0,22
    // 14,4 · 0,5 20,4 · 0,65 23,7); das Ambient allein ließ kein Fenster (Boden ≥ 22 verlangte ≥ 0,18, die Wand 3 : 1 ≤ 0,22).
    const MOONLIGHT = Object.freeze({
        r: KERN.ATMO_GESETZ.nacht.mond[0],
        g: KERN.ATMO_GESETZ.nacht.mond[1],
        b: KERN.ATMO_GESETZ.nacht.mond[2],
        intensity: MOND_STAERKE,
    });
    // DAS STERNEN-LICHT (w28-nacht-bilanz) — der Nachthimmel ohne Mond (Luftleuchten und Sterne) im Maß der REF der Kamera
    // (spec/farbe/tag-ref.json, USNO Circular 171: der Nachthimmel 0,0005 lx neben dem Vollmond, zusammen 0,397 lx): `r/g/b` der
    // Ton des Gesetzes (`ATMO_GESETZ.nacht.himmel`, auf Luma 1), `leuchtdichte` seine Zenit-Leuchtdichte in Welt-Einheiten —
    // E des Vollmonds im Zenit (`MOND_E`) × 0,0005 / 0,3965, durch π (die Halbkugel). Bis hier trug der Himmel die Zahl des
    // Gesetzes als Leuchtdichte (Luma 0,095, E 0,30 neben dem Mond 0,43 — das 510-Fache dieses Maßes): GEMESSEN (Radeon, Dorf,
    // 00 Uhr, main 3552f058, Ausgabe-Y) trug es die Wand ohne Quelle zu 72 % (0,0279 → 0,0078 ohne es; ohne die ganze Umgebung
    // 0,0011, ohne Ambient 0,0161, ohne Himmel-Boden 0,0222, ohne Mond 0,0199) und den Himmel zu 90 % (0,0860 → 0,0082: grau
    // statt nachtblau) — die Nacht war ein abgedunkelter Tag, den das Ambient (w28-nacht-licht, 0,23 → 0,04) nie trug. Jetzt
    // streut im Himmel der Nacht der Mond durch das EINE Medium (blau, Rayleigh), und die Fläche ohne Quelle fällt ins Dunkel.
    const STERNENLICHT = Object.freeze(
        ((n) => {
            const y = lumaVon(n);
            return {
                r: n[0] / y,
                g: n[1] / y,
                b: n[2] / y,
                leuchtdichte: (MOND_E * 0.0005) / 0.3965 / Math.PI,
                daemmer: MOND_E / Math.PI,
            };
        })(KERN.ATMO_GESETZ.nacht.himmel)
    );
    // DER HIMMEL DER NACHTSEITE OHNE MOND je Sonnenhöhe (Zenit-Leuchtdichte, Welt-Einheiten; `achse` die EINE Tag-Achse): das
    // Sternen-Licht, wie die Sterne erscheinen (1 − Dämmerung), und DAS DÄMMERLICHT — die blaue Stunde: die Kuppel nach
    // Sonnenuntergang, die in der Welt der gestauchten Nacht (der Mond 1/13 der Sonne statt 1/400 000) kein Strahl der Tafeln
    // trägt. Es blendet mit den Ersatz-Lichtern der Nacht ein (`nacht`: 0 über dem Horizont, 1 bei −6°), trägt am Ende der
    // bürgerlichen Dämmerung so viel wie der Vollmond im Zenit (`daemmer`; die REF: 3 lx bei −6°, gleich dem Vollmond bei −8°)
    // und fällt mit der Dämmerung der Tag-Achse bis −18° auf 0, während der Mond steigt. Die tiefe Nacht trägt es nie.
    const DAEMMER_ENDE = tagAchse(Math.sin((-6 * Math.PI) / 180)).daemmerung;
    function nachtHimmel(achse) {
        const d = Math.max(0, Math.min(1, achse.daemmerung));
        return STERNENLICHT.leuchtdichte * (1 - d) + STERNENLICHT.daemmer * achse.nacht * Math.min(1, d / DAEMMER_ENDE);
    }
    // DIE GPU-LEINE (Welt `_gpuLeineFrei`, Bühne `buehneZeichnet`): höchstens so viele Bilder zugleich auf der GPU unterwegs — mehr
    // ist nur Eingabe-Verzug (gemessen 04.10.: 600 ms bei ≈ 10 Frames in der Schlange), nie mehr Durchsatz.
    const GPU_FRAMES_IM_FLUG = 2;

    // DAS SCHIRM-DREIECK: EIN Dreieck über den ganzen Schirm in der Form von r184 `QuadMesh` (Lage [-1,3 · -1,-1 · 3,-1], uv
    // [0,-1 · 0,1 · 2,1], Ortho-Kamera ±1 in `userData.kamera`), sein Fragment aus `fn()` — die Pässe der Atmosphäre und das
    // Ausgabe-Dreieck jeder Bühne (`_buehneRender`) teilen Geometrie und Kamera.
    let schirmForm = null;
    function schirmDreieck(fn, name) {
        const THREE = globalThis.THREE;
        const D =
            schirmForm ||
            (schirmForm = {
                g: new THREE.BufferGeometry()
                    .setAttribute("position", new THREE.Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3))
                    .setAttribute("uv", new THREE.Float32BufferAttribute([0, -1, 0, 1, 2, 1], 2)),
                kamera: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1),
            });
        const m = new THREE.MeshBasicNodeMaterial();
        m.name = name;
        m.fragmentNode = fn();
        m.depthTest = false;
        m.depthWrite = false;
        m.toneMapped = false;
        m.fog = false;
        const q = new THREE.Mesh(D.g, m);
        q.name = name;
        q.frustumCulled = false;
        q.userData.kamera = D.kamera;
        return q;
    }

    // DIE RICHTUNG DER EQUIREKT-LAGE (die Umkehr von r184 `equirectUV`): uv → Einheits-Richtung, φ = (u − ½)·2π, Höhe = (v − ½)·π
    // — so malt die Umgebung (`passUmgebung`), so tastet die Himmels-Sonde des Lichts der Welt ab (`_weltLichtHimmel`).
    function umgebungRichtung(q) {
        const phi = q.x.sub(0.5).mul(2 * Math.PI);
        const el = q.y.sub(0.5).mul(Math.PI);
        return globalThis.THREE.TSL.vec3(el.cos().mul(phi.cos()), el.sin(), el.cos().mul(phi.sin()));
    }

    // DIE TAFELN (EINMAL je Szene): Fragment-Pässe in RenderTargets — EIN Pfad für WebGPU und WebGL (Compute hätte unter
    // WebGL keinen Himmel). Transmittance 256×64 (Bruneton-Parametrisierung) und Mehrfachstreuung Ψ_ms 32×32 (Hillaire Gl.
    // 5–9) je Medium, die Himmels-Sicht 192×108 (Azimut absolut, Breite quadratisch um den Horizont) je Stufe der Sonne,
    // die Umgebung 128×64 (Equirekt, die Vorlage von PMREM) im groben Takt der Umgebung. Die Leser: die Kuppel und die Luft
    // (`himmelFarbe`), der Spiegel des Wassers, die Umgebung (PMREM, der Film des Tors). `o.G` das Gesetz der Luft (die Welt: ihr
    // Himmel, `_atmoGesetz`), `o.M` das Medium (`_atmoMediumJetzt`), `o.teilen` legt die Uniforms in ihre Gruppe (die Welt: die
    // renderGroup, `_uniformHeimatTeilen` — Kuppel und Luft sind Stoffe der Szene). → die Tafeln (Uniforms, Ziele, Pässe).
    function atmoTafeln(o) {
        const THREE = globalThis.THREE;
        const teilen = o.teilen || ((u) => u);
        if (typeof THREE === "undefined" || !THREE.TSL || !THREE.MeshBasicNodeMaterial || !THREE.RenderTarget)
            throw new Error("Die Atmosphäre: THREE trägt TSL/MeshBasicNodeMaterial/RenderTarget nicht (Vendor)");
        const T = THREE.TSL;
        const { Fn, float, vec2, vec3, vec4, uv, texture, exp, sqrt, max, clamp, select, Loop, If, dot, length } = T;
        const G = o.G;
        const Z = ATMO_LUT;
        const RG = G.erdeM / 1000,
            RT = G.randM / 1000;
        const H = Math.sqrt(RT * RT - RG * RG);
        const PI = Math.PI;
        const M = o.M;
        const U = teilen({
            betaR: T.uniform(new THREE.Vector3().fromArray(M.betaR)),
            HR: T.uniform(M.HR),
            HM: T.uniform(M.HM),
            mieExt: T.uniform(new THREE.Vector3().fromArray(M.mieExt)),
            mieSca: T.uniform(new THREE.Vector3().fromArray(M.mieSca)),
            g: T.uniform(M.g),
            ozon: T.uniform(new THREE.Vector3().fromArray(M.ozon)),
            albedo: T.uniform(new THREE.Vector3().fromArray(M.albedo)),
            erde: T.uniform(new THREE.Vector3().fromArray(ATMO_ERDE)),
            hKm: T.uniform(0.002),
            sonne: T.uniform(new THREE.Vector3(0, 1, 0)),
            mond: T.uniform(new THREE.Vector3(0, -1, 0)),
            // DAS LICHT JETZT (E0, `_atmoE0`): die Tafeln tragen den Himmel je Einheit der Sonne über der Atmosphäre, der Leser
            // (`himmelFarbe`, die Wolke) multipliziert E0 — die Tages-Intensität ist linear und zeichnet keine Tafel neu
            licht: T.uniform(1),
            // der Mond in Einheiten von E0 (Purkinje-Hue × MOONLIGHT × Wetter / E0)
            mondE: T.uniform(new THREE.Vector3(0, 0, 0)),
            // das Sternen-Licht in Einheiten von E0 (die Zenit-Leuchtdichte des Gesetzes × der Anteil der Nacht / E0, `_atmoSternenLicht`)
            nachtE: T.uniform(new THREE.Vector3(0, 0, 0)),
            toenung: T.uniform(new THREE.Vector3(1, 1, 1)),
        });
        const ziel = (w, h, wrapS, name) => {
            const rt = new THREE.RenderTarget(w, h, {
                type: THREE.HalfFloatType,
                depthBuffer: false,
                generateMipmaps: false,
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
            });
            rt.name = name;
            rt.texture.name = name;
            rt.texture.wrapS = wrapS || THREE.ClampToEdgeWrapping;
            rt.texture.wrapT = THREE.ClampToEdgeWrapping;
            return rt;
        };
        const rtT = ziel(Z.durchlass[0], Z.durchlass[1], null, "atmo-durchlass");
        const rtMS = ziel(Z.mehrfach[0], Z.mehrfach[1], null, "atmo-mehrfach");
        const rtSV = ziel(Z.himmel[0], Z.himmel[1], THREE.RepeatWrapping, "atmo-himmel");
        const rtEq = ziel(Z.umgebung[0], Z.umgebung[1], THREE.RepeatWrapping, "himmel-umgebung");
        const rtBS = ziel(Z.bestrahlung[0], Z.bestrahlung[1], null, "atmo-bestrahlung");
        rtEq.texture.mapping = THREE.EquirectangularReflectionMapping;
        // ── das Medium als Knoten (h in km über dem Bezug) ──
        const dichteO = (h) =>
            max(
                float(1).sub(
                    h
                        .sub(G.ozon.mitteM / 1000)
                        .abs()
                        .div(G.ozon.halbM / 1000)
                ),
                0
            );
        const streuR = (h) => U.betaR.mul(exp(h.negate().div(U.HR)));
        const streuM = (h) => U.mieSca.mul(exp(h.negate().div(U.HM)));
        const ext = (h) =>
            streuR(h)
                .add(U.mieExt.mul(exp(h.negate().div(U.HM))))
                .add(U.ozon.mul(dichteO(h)));
        const subUv = (x, n) =>
            clamp(x, 0, 1)
                .mul(1 - 1 / n)
                .add(0.5 / n);
        const ausUv = (u, n) => clamp(u.sub(0.5 / n).div(1 - 1 / n), 0, 1);
        const amBoden = (r, mu) =>
            T.and(
                mu.lessThan(0),
                r
                    .mul(r)
                    .mul(mu.mul(mu).sub(1))
                    .add(RG * RG)
                    .greaterThanEqual(0)
            );
        const zumRand = (r, mu) =>
            r
                .negate()
                .mul(mu)
                .add(
                    sqrt(
                        max(
                            r
                                .mul(r)
                                .mul(mu.mul(mu).sub(1))
                                .add(RT * RT),
                            0
                        )
                    )
                );
        const zumBoden = (r, mu) =>
            r
                .negate()
                .mul(mu)
                .sub(
                    sqrt(
                        max(
                            r
                                .mul(r)
                                .mul(mu.mul(mu).sub(1))
                                .add(RG * RG),
                            0
                        )
                    )
                );
        const durchlass = (r, mu) => {
            const rho = sqrt(max(r.mul(r).sub(RG * RG), 0));
            const d = max(zumRand(r, mu), 0);
            const dMin = float(RT).sub(r);
            const dMax = rho.add(H);
            const xmu = d.sub(dMin).div(max(dMax.sub(dMin), 1e-4));
            const t = texture(rtT.texture, vec2(subUv(xmu, Z.durchlass[0]), subUv(rho.div(H), Z.durchlass[1]))).level(
                float(0)
            ).rgb;
            return select(amBoden(r, mu), vec3(0), t);
        };
        // Ψ_ms in Zeilen LINEAR in der Höhe (Hillaire): die zweite Zeile liegt bei 3,2 km. Quadratisch (w = √(h/H), Zeilen bei 0,
        // 0,10, 0,42, 0,94 km — w4-ferne-blau, Duv −0,001 am Horizont) löste die Grenzschicht des Dunsts auf und hob im dichten
        // Dunst des Regens das Licht des Himmels: das Regenbild stieg über das der Sonne (werkbank licht --naesse, Radeon: Wiese
        // 0,966 → 1,012, Dorf 0,951 → 1,050; gate:naesse:echt ROT) — heil-w4-ferne-blau.
        const mehrfach = (h, mus) =>
            texture(
                rtMS.texture,
                vec2(subUv(mus.add(1).mul(0.5), Z.mehrfach[0]), subUv(h.div(RT - RG), Z.mehrfach[1]))
            ).level(float(0)).rgb;
        const phaseR = (nu) =>
            nu
                .mul(nu)
                .add(1)
                .mul(3 / (16 * PI));
        const phaseM = (nu) => {
            const g2 = U.g.mul(U.g);
            return g2.oneMinus().div(
                g2
                    .add(1)
                    .sub(U.g.mul(nu).mul(2))
                    .pow(1.5)
                    .mul(4 * PI)
            );
        };
        // ── Transmittance: je Texel der Durchlass (r, mu) bis zum Rand ──
        const passDurchlass = Fn(() => {
            const q = uv();
            const xmu = ausUv(q.x, Z.durchlass[0]);
            const rho = ausUv(q.y, Z.durchlass[1]).mul(H).toVar();
            const r = sqrt(rho.mul(rho).add(RG * RG)).toVar();
            const dMin = float(RT).sub(r);
            const d = dMin.add(xmu.mul(rho.add(H).sub(dMin))).toVar();
            const mu = clamp(
                select(
                    d.lessThan(1e-4),
                    float(1),
                    float(H * H)
                        .sub(rho.mul(rho))
                        .sub(d.mul(d))
                        .div(r.mul(d).mul(2))
                ),
                -1,
                1
            ).toVar();
            const tau = vec3(0).toVar();
            const N = Z.schritte.durchlass;
            const dt = d.div(N).toVar();
            Loop({ start: 0, end: N, type: "float", name: "s" }, ({ s }) => {
                const t = s.add(0.5).mul(dt);
                const hi = max(sqrt(t.mul(t).add(r.mul(mu).mul(t).mul(2)).add(r.mul(r))).sub(RG), 0);
                tau.addAssign(ext(hi).mul(dt));
            });
            return vec4(exp(tau.negate()), 1);
        });
        // ── Ψ_ms: je (cos Sonnen-Zenit, Höhe) die Mehrfachstreuung (Hillaire Gl. 5–9), 8 × 8 Richtungen, Boden = die Erde (`ATMO_ERDE`) ──
        const passMehrfach = Fn(() => {
            const q = uv();
            const mus = ausUv(q.x, Z.mehrfach[0]).mul(2).sub(1).toVar();
            const h = max(ausUv(q.y, Z.mehrfach[1]).mul(RT - RG), 0.001).toVar();
            const r = h.add(RG).toVar();
            const sun = vec3(sqrt(max(float(1).sub(mus.mul(mus)), 0)), mus, 0).toVar();
            const Lsum = vec3(0).toVar();
            const Fsum = vec3(0).toVar();
            const N = Z.schritte.mehrfach;
            Loop({ start: 0, end: 64, type: "float", name: "k" }, ({ k }) => {
                const a = k.div(8).floor();
                const b = k.sub(a.mul(8));
                const mu = a
                    .add(0.5)
                    .mul(2 / 8)
                    .sub(1)
                    .toVar();
                const sv = sqrt(max(float(1).sub(mu.mul(mu)), 0));
                const phi = b.add(0.5).mul((2 * PI) / 8);
                const v = vec3(sv.mul(phi.cos()), mu, sv.mul(phi.sin())).toVar();
                const boden = amBoden(r, mu).toVar();
                const tMax = select(boden, zumBoden(r, mu), zumRand(r, mu)).toVar();
                const thr = vec3(1).toVar();
                const L = vec3(0).toVar();
                const F = vec3(0).toVar();
                const tAlt = float(0).toVar();
                Loop({ start: 0, end: N, type: "float", name: "s" }, ({ s }) => {
                    const tE = tMax.mul(s.add(1).div(N).pow(2)).toVar();
                    const tM = tMax.mul(s.add(0.5).div(N).pow(2));
                    const dt = tE.sub(tAlt).toVar();
                    tAlt.assign(tE);
                    const p = vec3(v.x.mul(tM), r.add(v.y.mul(tM)), v.z.mul(tM)).toVar();
                    const ri = length(p).toVar();
                    const hi = max(ri.sub(RG), 0).toVar();
                    const sca = streuR(hi).add(streuM(hi)).toVar();
                    const e = max(ext(hi), vec3(1e-7)).toVar();
                    const tr = exp(e.negate().mul(dt)).toVar();
                    const integ = tr.oneMinus().div(e).toVar();
                    L.addAssign(
                        thr
                            .mul(sca)
                            .mul(durchlass(ri, dot(p, sun).div(ri)))
                            .mul(integ)
                            .mul(1 / (4 * PI))
                    );
                    F.addAssign(thr.mul(sca).mul(integ));
                    thr.mulAssign(tr);
                });
                If(boden, () => {
                    const gp = vec3(v.x.mul(tMax), r.add(v.y.mul(tMax)), v.z.mul(tMax)).toVar();
                    const gr = length(gp).toVar();
                    const nl = max(dot(gp, sun).div(gr), 0).toVar();
                    L.addAssign(
                        thr
                            .mul(durchlass(gr, nl))
                            .mul(nl)
                            .mul(U.erde)
                            .mul(1 / PI)
                    );
                });
                Lsum.addAssign(L);
                Fsum.addAssign(F);
            });
            const fms = Fsum.div(64);
            return vec4(Lsum.div(64).div(max(fms.oneMinus(), vec3(1e-4))), 1);
        });
        // ── die Himmels-Sicht: Richtung ↔ Texel (Azimut absolut, Breite quadratisch um den Horizont des Auges) ──
        const horizontEl = () => T.acos(float(RG).div(U.hKm.add(RG))).negate();
        // die Breite der Tafel zur Höhe `el` (rad) — Richtungen gleicher Höhe teilen sie (das Band des Grats, `_horizontHimmel`)
        const himmelBreite = (el) => {
            const hz = horizontEl().toVar();
            const oben = sqrt(max(el.sub(hz).div(float(PI / 2).sub(hz)), 0))
                .mul(0.5)
                .add(0.5);
            const unten = float(0.5).sub(sqrt(max(hz.sub(el).div(float(PI / 2).add(hz)), 0)).mul(0.5));
            return subUv(select(el.greaterThanEqual(hz), oben, unten), Z.himmel[1]);
        };
        const himmelUv = (dir) => {
            const el = T.asin(clamp(dir.y, -1, 1)).toVar();
            const v = himmelBreite(el);
            const u = T.atan(dir.z, dir.x)
                .div(2 * PI)
                .add(1)
                .fract();
            return vec2(u, v);
        };
        // DER MARSCH längs v: die Quellen (Richtung, Gewicht in Einheiten von E0 — die Sonne 1, der Mond `mondE`) und das
        // Sternen-Licht (`nacht`, in E0). Die Himmels-Sicht ruft ihn mit Sonne, Mond und Sternen, die Bestrahlungs-Tafel mit
        // EINER Quelle je Sonnenhöhe — derselbe Marsch, dieselbe Streuung, dieselben Tafeln. `einfach` (ein vec3-Var, wenn der
        // Rufer ihn reicht) sammelt die EINFACHE Streuung der ersten Quelle (die Sonne) — den Teil, den ein Schatten aus der Luft
        // nimmt (der Luftschatten der Welt, `_luftEnsure`); die Mehrfachstreuung Ψ_ms bleibt im Schatten.
        const marsch = (v, quellen, nacht, einfach = null) => {
            const r0 = U.hKm.add(RG).toVar();
            const mu = v.y;
            const boden = amBoden(r0, mu).toVar();
            const tMax = select(boden, zumBoden(r0, mu), zumRand(r0, mu)).toVar();
            const ph = quellen.map((q) => {
                const nu = dot(v, q.dir);
                return vec2(phaseR(nu), phaseM(nu)).toVar();
            });
            const thr = vec3(1).toVar();
            const L = vec3(0).toVar();
            const tAlt = float(0).toVar();
            let erste = null;
            const N = Z.schritte.himmel;
            Loop({ start: 0, end: N, type: "float", name: "s" }, ({ s }) => {
                const tE = tMax.mul(s.add(1).div(N).pow(2)).toVar();
                const tM = tMax.mul(s.add(0.5).div(N).pow(2));
                const dt = tE.sub(tAlt).toVar();
                tAlt.assign(tE);
                const p = vec3(v.x.mul(tM), r0.add(v.y.mul(tM)), v.z.mul(tM)).toVar();
                const ri = length(p).toVar();
                const hi = max(ri.sub(RG), 0).toVar();
                const sR = streuR(hi).toVar();
                const sM = streuM(hi).toVar();
                const sca = sR.add(sM).toVar();
                const S = quellen
                    .map((q, i) => {
                        const muQ = dot(p, q.dir).div(ri).toVar();
                        const ein = durchlass(ri, muQ)
                            .mul(sR.mul(ph[i].x).add(sM.mul(ph[i].y)))
                            .toVar();
                        if (i === 0) erste = ein;
                        const s = ein.add(mehrfach(hi, muQ).mul(sca));
                        return q.gewicht ? q.gewicht.mul(s) : s;
                    })
                    .reduce((a, b) => a.add(b))
                    .toVar();
                const e = max(ext(hi), vec3(1e-7)).toVar();
                const tr = exp(e.negate().mul(dt)).toVar();
                L.addAssign(thr.mul(S).mul(tr.oneMinus().div(e)));
                if (einfach) einfach.addAssign(thr.mul(erste).mul(tr.oneMinus().div(e)));
                thr.mulAssign(tr);
            });
            // DAS STERNEN-LICHT (D3-2, `ATMO_GESETZ.nacht`): über dem Horizont leuchtet der Nachthimmel selbst — schräg durch die
            // leuchtende Schicht gesehen länger (van Rhijn), gedämpft durch dieselbe Luft wie jeder Strahl (`thr`, der Durchlass
            // bis zum Rand). Der Boden unter dem Horizont: Lambert mit der Welt-Albedo im Licht von Sonne und Mond.
            If(boden.not(), () => {
                const q = r0.div(RG + G.nacht.glutHoeheM / 1000);
                const vanRhijn = float(1).div(sqrt(max(float(1).sub(q.mul(q).mul(float(1).sub(mu.mul(mu)))), 1e-4)));
                L.addAssign(nacht.mul(vanRhijn).mul(thr));
            });
            If(boden, () => {
                const gp = vec3(v.x.mul(tMax), r0.add(v.y.mul(tMax)), v.z.mul(tMax)).toVar();
                const n = gp.div(length(gp)).toVar();
                const gr = length(gp).toVar();
                const E = quellen
                    .map((q) => {
                        const l = max(dot(n, q.dir), 0).toVar();
                        const e = durchlass(gr, l).mul(l);
                        return q.gewicht ? q.gewicht.mul(e) : e;
                    })
                    .reduce((a, b) => a.add(b));
                L.addAssign(
                    thr
                        .mul(E)
                        .mul(U.albedo)
                        .mul(1 / PI)
                );
            });
            return L;
        };
        const passHimmel = Fn(() => {
            const q = uv();
            const phi = q.x.mul(2 * PI).toVar();
            const w = ausUv(q.y, Z.himmel[1]);
            const hz = horizontEl().toVar();
            const c = w.sub(0.5).mul(2).toVar();
            const el = select(
                c.greaterThanEqual(0),
                hz.add(c.mul(c).mul(float(PI / 2).sub(hz))),
                hz.sub(c.mul(c).mul(float(PI / 2).add(hz)))
            ).toVar();
            const ce = el.cos().toVar();
            const v = vec3(ce.mul(phi.cos()), el.sin(), ce.mul(phi.sin())).toVar();
            // Alpha: der Anteil der einfachen Streuung der Sonne an der Leuchtdichte (der Luftschatten, `himmelEinfach`)
            const einfach = vec3(0).toVar();
            const L = marsch(v, [{ dir: U.sonne }, { dir: U.mond, gewicht: U.mondE }], U.nachtE, einfach).toVar();
            const Y = vec3(0.2126, 0.7152, 0.0722);
            return vec4(L, clamp(dot(einfach, Y).div(max(dot(L, Y), 1e-12)), 0, 1));
        });
        // DIE FARBE DES HIMMELS in Richtung `dir` (Welt): die Himmels-Sicht (je Einheit E0) × das Licht jetzt (E0) × die Tönung
        // (Wetter, Feld, Gefühl, DSL — relativ zum Himmel des Studios, `_dayNightApplySkybox`). Leser: die Kuppel, die Luft.
        // Der Texel der Himmels-Sicht in Richtung `dir` (rgb je Einheit E0, Alpha der Anteil der Sonne): ein Leser beider Kanäle
        // reicht ihn `himmelFarbe` und `himmelEinfach` (EINE Abtastung, die Luft der Welt).
        // `himmelTexelUv` an einer Lage der Tafel (u Azimut, v `himmelBreite`): wer die Lage schon kennt, rechnet sie nicht neu
        const himmelTexelUv = (uv) => texture(rtSV.texture, uv).level(float(0));
        const himmelTexel = (dir) => himmelTexelUv(himmelUv(dir));
        const himmelJeLicht = (dir) => himmelTexel(dir).rgb;
        const himmelFarbe = (dir, tx = null) => (tx ? tx.rgb : himmelJeLicht(dir)).mul(U.licht).mul(U.toenung);
        // DER ANTEIL DER SONNE (0 … 1) an der Himmels-Sicht in Richtung `dir`: ihre einfache Streuung (Alpha der Tafel) — was ein
        // Grat der Luft hinter ihm nimmt (der Luftschatten der Welt); die Mehrfachstreuung und der Mond bleiben.
        const himmelEinfach = (dir, tx = null) => (tx || himmelTexel(dir)).a;
        // ── die Umgebung: Equirekt (three `equirectUV`: u = atan(z, x)/2π + ½, v = asin(y)/π + ½) aus der Himmels-Sicht, JE
        // EINHEIT DES LICHTS wie die Tafeln: das Licht jetzt (E0 · Tönung) trägt jeder ihrer Leser je Bild (`_umgebungLicht`) ──
        const passUmgebung = Fn(() => vec4(himmelJeLicht(umgebungRichtung(uv()).toVar()), 1));
        // ── DIE BESTRAHLUNGS-TAFEL (S7): je Texel eine Sonnenhöhe e (quadratisch dicht um den Horizont, e = c·|c|) und die
        // Bestrahlung einer waagrechten Fläche durch den Himmel dieser Sonne, je Einheit E0 — derselbe Marsch wie die Himmels-
        // Sicht über die obere Halbkugel (kosinus-gewichtet, `ATMO_LUT.richtungen`); der letzte Texel trägt das Sternen-Licht je
        // Einheit `nachtE`. Gezeichnet je Medium und Höhe des Auges, EINMAL zurückgelesen (`_himmelsTafelLesen`): die CPU kennt
        // den Himmel jeder Stunde synchron (`_himmelsBestrahlung`), nie eine Lesung nach der Malung.
        const BW = Z.bestrahlung[0];
        const [NT, NP] = Z.richtungen;
        const passBestrahlung = Fn(() => {
            const i = uv().x.mul(BW).floor().toVar();
            const stern = i.greaterThanEqual(BW - 1).toVar();
            const c = i
                .div(BW - 2)
                .mul(2)
                .sub(1)
                .toVar();
            const mus = clamp(c.mul(c.abs()), -1, 1).toVar();
            const sonne = select(stern, vec3(0, -1, 0), vec3(sqrt(max(float(1).sub(mus.mul(mus)), 0)), mus, 0)).toVar();
            const nacht = select(stern, float(1), float(0)).toVar();
            const E = vec3(0).toVar();
            Loop({ start: 0, end: NT * NP, type: "float", name: "k" }, ({ k }) => {
                const a = k.div(NP).floor();
                const ct = sqrt(float(1).sub(a.add(0.5).div(NT))).toVar();
                const sv = sqrt(max(float(1).sub(ct.mul(ct)), 0)).toVar();
                const phi = k
                    .sub(a.mul(NP))
                    .add(0.5)
                    .mul((2 * PI) / NP)
                    .toVar();
                E.addAssign(marsch(vec3(sv.mul(phi.cos()), ct, sv.mul(phi.sin())).toVar(), [{ dir: sonne }], nacht));
            });
            return vec4(E.mul(PI / (NT * NP)), 1);
        });
        // DER PASS: das Schirm-Dreieck (`_schirmDreieck`) — dieselbe uv-Lage, in der jeder Leser die Tafel abtastet.
        const quad = schirmDreieck;
        return {
            U,
            rtT,
            rtMS,
            rtSV,
            rtEq,
            qT: quad(passDurchlass, "atmo-durchlass"),
            qMS: quad(passMehrfach, "atmo-mehrfach"),
            qSV: quad(passHimmel, "atmo-himmel"),
            qEq: quad(passUmgebung, "atmo-umgebung"),
            rtBS,
            qBS: quad(passBestrahlung, "atmo-bestrahlung"),
            tafelSchluessel: null,
            // DIE LESUNG LEBT MIT DER TAFEL (`_himmelsTafelLesen`): die Bestrahlung auf der CPU, ihre Lese-Nummer, der Anker des Himmels
            // und der Belichtung — sie teilen die Lebenszeit der Tafel, die sie lasen. Als Felder am Wirt fielen sie beim Tausch am
            // Ort (`_weltAbschied`), die Tafel blieb mit ihrem Schlüssel und las nie neu: die Belichtung stand nie mehr, das erste
            // Weltbild jeder Ziel-Welt erst am Deckel (60 s, Radeon 30.10.)
            tafel: null,
            tafelFlug: null,
            tafelNr: 0,
            anker: null,
            belichtung: null,
            himmelFarbe,
            himmelEinfach,
            himmelTexel,
            himmelTexelUv,
            himmelBreite,
            durchlass,
            RG,
            mediumBeta: null,
            himmelSchluessel: null,
            himmelVersion: 0,
            tafelnFrisch: false,
        };
    }

    // DIE STUFEN DER KAMERA (rein): die Blenden-Stufen der 18-%-Karte gegen den Anker bei der Sonnenhöhe h (Grad) und dem Licht q
    // (E gegen den Anker). Über `gleitung[0]` die Steigung: log2 q × (1 − `steigung`); unter `gleitung[1]` die Stufen der
    // Tag-Achse (`stufen`, linear in h zwischen den Knoten, außen gehalten); dazwischen linear in h gemischt. `B` die Eichung (die
    // Welt reicht ihre, `AnazhRealm.BELICHTUNG` — an ihr spielen die Linsen ihre Täter ein, scripts/lib/licht-linsen.cjs).
    function belichtungStufen(h, q, B = BELICHTUNG) {
        const K = B.stufen;
        let n = K[K.length - 1][1];
        if (h >= K[0][0]) n = K[0][1];
        else
            for (let i = 1; i < K.length; i++)
                if (h >= K[i][0]) {
                    n = K[i][1] + ((K[i - 1][1] - K[i][1]) * (h - K[i][0])) / (K[i - 1][0] - K[i][0]);
                    break;
                }
        const [oben, unten] = B.gleitung;
        const t = Math.max(0, Math.min(1, (h - unten) / (oben - unten)));
        return t * (1 - B.steigung) * Math.log2(q) + (1 - t) * n;
    }

    // DIE BELICHTUNG AUS DEM LICHT (licht.K1, H1): `w` die Beleuchtungsstärke einer waagrechten Fläche des Orts (rgb), `EA` der
    // Anker (`belichtungAnker`), `e` der Sinus der Sonnenhöhe, `stufen` die Stufen der Kamera (die Welt reicht ihr Glied
    // `AnazhRealm._belichtungStufen`, an dem die Linsen den Schein der Kamera prüfen). → die Belichtung k: die 18-%-Karte unter
    // dem Anker auf `zielKarte` und die Stufen der Kamera gegen ihn; `B` die Eichung (wie `belichtungStufen`). Der Lichtmesser
    // liest in der Nacht nie unter dem Nacht-Knoten (`nachtKnotenE`, vom Horizont bis `nachtKnotenGrad`
    // logarithmisch eingeblendet): darunter steht die Blende, das Bild fällt mit dem Licht.
    function belichtung(w, EA, e, stufen, B = BELICHTUNG) {
        const h = (Math.asin(Math.max(-1, Math.min(1, e))) * 180) / Math.PI;
        let E = Math.max(0.2126 * w[0] + 0.7152 * w[1] + 0.0722 * w[2], 1e-6);
        const NK = B.nachtKnotenE;
        if (NK > E) {
            const t = Math.max(0, Math.min(1, h / B.nachtKnotenGrad));
            E = E ** (1 - t) * NK ** t;
        }
        return Math.max(B.min, (B.zielKarte * 2 ** (stufen || belichtungStufen)(h, E / EA)) / ((0.18 / Math.PI) * E));
    }

    // DER ANKER DER KAMERA (S7, H1): E der waagrechten Karte unter der Zenit-Sonne der klaren Luft — E0 (`KEY_BASE` ·
    // `LEGACY_LICHT`) × (ihr Durchlass, `ATMO_RECHNUNG.sonne`, e = 1, Bezug der Luft, + `himmel`: der Himmel der Bestrahlungs-
    // Tafel derselben Luft, ihr Anker `tafelAnker`). `G` das Gesetz der Luft, `R` seine Rechnung.
    function belichtungAnker(G, R, himmel) {
        const M = R.medium(G, R.betaKlar(G), ATMO_BODEN);
        const s = R.sonne(G, M, 0.001, 1, ATMO_LUT.schritte.durchlass, [0, 0, 0]);
        const l = 0.2126 * s.col.r + 0.7152 * s.col.g + 0.0722 * s.col.b;
        return KEY_BASE * LEGACY_LICHT * (s.lum * l + himmel);
    }

    // E0 — DIE SONNE ÜBER DER ATMOSPHÄRE in Welt-Einheiten: das Schlüssellicht (KEY_BASE, r128 → r184 über LEGACY_LICHT) × die
    // Tages-Intensität `staerke` (der Tint der Welt: Wetter, Aura). Das Richtlicht trägt E0 · Durchlass, die Tafeln den Himmel in E0.
    function e0(staerke) {
        return Math.max(0, KEY_BASE * LEGACY_LICHT * staerke);
    }

    // DER WINKEL DER SONNE zur Tageszeit t (0 Mitternacht · 0,5 Mittag) — ohne die Stufen der Schatten-Karten (`_sonnenWinkel`
    // der Welt hält ihn über sie) — und die Richtung zu ihr (Einheitsvektor [x, y, z]; y ≤ 0 unter dem Horizont).
    function sonnenWinkel(t) {
        return t * Math.PI * 2 - Math.PI / 2;
    }
    // DIE SONNENBAHN — die EINE Formel der Welt (Licht, Schatten, Himmelskörper, Bühne der Studios). OFFEN (w28-nacht-licht): die Bahn
    // aus Jahr × Breite (Meeus Kap. 13, sin h = sin φ sin δ + cos φ cos δ cos H) stand gebaut und gemessen — Mittag 74,2° → 74,6°,
    // 05 Uhr im Sommer die Dämmerung (Dorf Luma 70 → 88) — und fiel an gate:tag-achse:echt: die Sonne des Sommers geht im
    // Nordosten auf, hinter dem Grat der Mess-Wiese (Azimut 76°) tritt sie bei 10° hervor, der Lichtmesser (`_horizontSichtImBild`)
    // springt 0,55 EV, das Bild 0,34 EV je Schritt der Uhr (Radeon). GEMESSEN (w28-nacht-bilanz, Radeon, Wiese): die nahen Kronen
    // stehen im Messer (2 627 von 2 632 Werfern), der Grat nimmt dort nichts (Sicht 0,199 bei L.y 0,168) — es sprang die binäre
    // Krone (`_kartenWurfSicht`: Sicht 0,07 → 0,79 über Uhr 0,254 → 0,26, während die Waldkante das Bild über fünf Schritte
    // freigibt). Mit dem Dichte-Profil der Krone fiel der Sprung auf 0,15–0,18 EV (Soll 0,1): die Bahn bleibt draußen, bis der
    // Messer den Wurf der Waldkante so stetig liest, wie das Bild ihn zeigt (32 Strahlen kippen gemeinsam).
    function sonnenRichtung(winkel) {
        const x = Math.cos(winkel);
        const y = Math.sin(winkel);
        const z = Math.sin(winkel * 0.5) * 0.4;
        const l = Math.hypot(x, y, z) || 1;
        return [x / l, y / l, z / l];
    }
    // DER MOND steht der Sonne voll gegenüber (der Vollmond) — EINE Formel für sein Licht und seinen Körper (w28-nacht-licht: der
    // Körper rechnete seine Lage in einer eigenen Kopie mit dem Winkel + π)
    function mondRichtung(winkel) {
        return sonnenRichtung(winkel).map((v) => -v);
    }

    // DIE EINE TAG-ACHSE (S7, W7): jede Größe des Lichts über den Tag ist EINE Funktion der Sonnenhöhe e = sin(Höhe) — die Kanäle
    // grenze (die Grenzgröße der Sterne), daemmerung (1 im hellen Tag … 0 in astronomischer Nacht), tag (das Nacht-Auge der
    // Post-Kette), nacht (die Ersatz-Lichter der Nacht: 0 über dem Horizont, 1 am Ende der bürgerlichen Dämmerung) und hell (die Leuchtdichte des Tageshimmels
    // relativ zum Mittag). Die Geschichte der Kanäle steht am Leser der Welt (`_tagAchse`).
    function tagAchse(e) {
        const A = GRENZGROESSE;
        const s = Math.max(-1, Math.min(1, e));
        const h = (Math.asin(s) * 180) / Math.PI;
        let grenze = A[A.length - 1][1];
        if (h >= A[0][0]) grenze = A[0][1];
        else
            for (let i = 1; i < A.length; i++)
                if (h >= A[i][0]) {
                    const t = (h - A[i - 1][0]) / (A[i][0] - A[i - 1][0]);
                    grenze = A[i - 1][1] + (A[i][1] - A[i - 1][1]) * t;
                    break;
                }
        const mTag = A[0][1],
            mNacht = A[A.length - 1][1];
        const q = Math.max(0, Math.min(1, (s + 0.18) / 0.6));
        // DIE ERSATZ-LICHTER DER NACHT leben in der Dämmerung (bürgerlich: die Sonne 0° … −6°, wie das physikalische Himmelsmodell
        // ohne Ersatz-Licht sie liefert): über dem Horizont tragen Sonne und Himmel allein. Bis ferne.K4 begannen sie bei 14,5°
        // (sin 0,25) — bei Sonne +5° lag ein Ambient 0,149 auf jedem Schatten, ein Viertel des Himmels (Dorf, 18-%-Karte zur Sonne).
        // Die Belichtung folgt dem Licht ohne Kante: über 0,25–0,30 und 0,70–0,75 je 0,002 der Uhr steigt sie glatt um 0,14–0,20 EV
        // (vorher 0,11–0,16 EV: das Ersatz-Licht füllte die sinkende Sonne auf).
        const nachtE = Math.sin((-6 * Math.PI) / 180);
        const hN = 0;
        const nG = BELICHTUNG.nachtGrad;
        return {
            e,
            grenze,
            daemmerung: (mNacht - grenze) / (mNacht - mTag),
            tag: Math.max(0, Math.min(1, (h - nG) / (hN - nG))),
            // stetig in der Sonnenhöhe (C¹ an beiden Enden der Dämmerung): der Einsatz ist keine Stufe der Belichtung
            nacht: ((x) => x * x * (3 - 2 * x))(Math.max(0, Math.min(1, s / nachtE))),
            hell: 0.045 + 0.955 * q * q * (3 - 2 * q),
        };
    }

    // Halb-Float (IEEE 754 binary16, die Lesung eines HalfFloat-Ziels) → Zahl
    function halbZuFloat(h) {
        const s = h & 0x8000 ? -1 : 1;
        const e = (h & 0x7c00) >> 10;
        const f = h & 0x03ff;
        if (e === 0) return s * Math.pow(2, -14) * (f / 1024);
        if (e === 31) return f ? NaN : s * Infinity;
        return s * Math.pow(2, e - 15) * (1 + f / 1024);
    }

    // DER ZEILEN-SCHRITT EINER LESUNG (`readRenderTargetPixelsAsync` eines rgba-Ziels w × h, Elemente je Zeile): r184 kopiert auf
    // WebGPU jede Zeile auf 256 Byte ausgerichtet (bytesPerRow) und lässt der LETZTEN das Polster weg — (h − 1) · Schritt + w · Texel
    // (gelesen am Vendor, `copyTextureToBuffer`), WebGL liest dicht. `Länge / h` traf nur, wo die Zeile schon ausgerichtet lag (die
    // Umgebung: 128 Texel × 8 Byte): die Kacheln des Rückstrahls (33 Texel × 8 Byte) lasen ihre Zeilen 249 statt 256 Elemente lang
    // und mischten Mittel, Zahl und Atmosphäre zu einem blauen Boden (w21-laub-unten). Leser: jede Lesung eines Ziels der Welt.
    function zeilenSchritt(px, w, h) {
        const dicht = w * 4;
        return px.length > dicht * h
            ? Math.ceil((dicht * px.BYTES_PER_ELEMENT) / 256) * (256 / px.BYTES_PER_ELEMENT)
            : dicht;
    }

    // DIE BESTRAHLUNGS-TAFEL AUS IHRER LESUNG (`readRenderTargetPixelsAsync` der Zeile W × 1, Halb- oder Voll-Float rgba): je
    // Sonnenhöhe die Bestrahlung einer waagrechten Fläche durch den Himmel je Einheit E0 (rgb), der letzte Texel das Sternen-Licht
    // je Einheit `nachtE` → Float32Array W × 3. Ihr ANKER (`tafelAnker`): die Luma des Himmels unter der Zenit-Sonne (Texel W − 2).
    function tafelAusPixeln(px, W) {
        const halb = px instanceof Uint16Array;
        const w = new Float32Array(W * 3);
        for (let i = 0; i < W; i++)
            for (let c = 0; c < 3; c++) w[i * 3 + c] = halb ? halbZuFloat(px[i * 4 + c]) : px[i * 4 + c];
        return w;
    }
    function tafelAnker(w, W) {
        return 0.2126 * w[(W - 2) * 3] + 0.7152 * w[(W - 2) * 3 + 1] + 0.0722 * w[(W - 2) * 3 + 2];
    }

    // DER HIMMEL ÜBER DEM ORT, SYNCHRON (S7; rgb, E einer waagrechten Fläche): die Bestrahlungs-Tafel `T` ({W, werte}) an der Sonne
    // und am Mond der Uniforms `U` der Tafeln, das Sternen-Licht — in derselben Zusammensetzung wie die Farbe des Himmels
    // (`himmelFarbe`: E0 × Tönung, der Mond in `mondE`, die Sterne in `nachtE`) → `out`.
    function bestrahlung(T, U, out) {
        const W = T.W,
            w = T.werte;
        const lies = (mu, c) => {
            const x = ((Math.sign(mu) * Math.sqrt(Math.min(1, Math.abs(mu))) + 1) / 2) * (W - 2);
            const i = Math.max(0, Math.min(W - 3, Math.floor(x)));
            const f = Math.max(0, Math.min(1, x - i));
            return w[i * 3 + c] * (1 - f) + w[(i + 1) * 3 + c] * f;
        };
        const ms = U.sonne.value.y,
            mm = U.mond.value.y;
        const m = U.mondE.value,
            n = U.nachtE.value,
            t = U.toenung.value;
        for (let c = 0; c < 3; c++) {
            const k = c === 0 ? "x" : c === 1 ? "y" : "z";
            out[c] = U.licht.value * t[k] * (lies(ms, c) + m[k] * lies(mm, c) + n[k] * w[(W - 1) * 3 + c]);
        }
        return out;
    }

    // DIE UMGEBUNG DER STOFFE (material.K4) — EIN Gesetz der Welt und der Bühne: der Himmel, den jeder Standard- und Physical-Stoff
    // spiegelt und aus dem er Licht empfängt, ist die PMREM-Lage der Equirekt-Tafel (`rtEq`, der Himmel JE EINHEIT DES LICHTS)
    // × das Licht jetzt (`umgebungLicht`: E0 · Tönung aus den Uniforms `U` der Tafeln, je Bild gelesen, nie eingebacken).
    // `umgebungZeichnen` filtert die Tafel (PMREM per `fromEquirectangular`, WebGPU-tauglich, in das BESTEHENDE Ziel `ziel`:
    // stabile Textur-Identität über jede Neuzeichnung), `himmelDerStoffe` ist der Knoten jedes Lesers — `richtung`/`stufe` fest
    // für eine Sonde (der Boden der Atmosphäre im Rückstrahl), sonst reicht r184 sie je Stoff (Spiegelung: die Rauheit als Stufe,
    // Bestrahlung: Stufe 1). Die Welt legt darüber ihren Spiegel-Pass und den Rückstrahl des gezeichneten Bodens
    // (`_spiegelUmgebung`, stamm/bild-sicht.js), die Bühne trägt ihn bloß (kein Feld; ihr Boden ist der Boden der Atmosphäre).
    // Bis w12-studio-buehne schrieben Welt und Bühne diesen Knoten je eigen (`_umgebungLicht` im Stamm, `buehne` hier).
    function umgebungLicht(U) {
        return U.toenung.mul(U.licht);
    }
    function umgebungZeichnen(gen, A, ziel) {
        return gen.fromEquirectangular(A.rtEq.texture, ziel || null);
    }
    function himmelDerStoffe(quelle, U, richtung, stufe) {
        return globalThis.THREE.TSL.pmremTexture(quelle, richtung, stufe).mul(umgebungLicht(U));
    }
    // DIE BESTRAHLUNG ERKANNT: r184 reicht der Umgebung die Stufe der Bestrahlung als Variable über der Konstanten 1 (`float(1)`
    // in einer VarNode, gelesen am Vendor 03.11.), die der Spiegelung als Rauheit des Stoffs — der Spiegel (Welt
    // `_spiegelUmgebung`, Bühne `buehne`) trägt nur die Spiegelung.
    const stufeKonstant = (n) => !!n && (n.isConstNode === true || (n.isVarNode === true && stufeKonstant(n.node)));

    // DIE WOLKEN-SCHICHT (licht.K4, `wolkenFeld` · Stamm `_wolkenKarte` · `_wolkenSchatten`): die Höhe der Wolke `hoeheM` — über dem
    // Auge für die Kuppel, über dem Meeresspiegel für den Wurf — die Basis des Schönwetter-Kumulus (0,6–1,5 km); 1 Einheit des groben
    // fbm ≈ 0,73 · hoeheM (580 m). Dieselbe Schicht trägt das Licht der Wolke (`himmelSicht`). Die Karte des Wurfs: `karte`² Texel
    // à `zelleM` (±4,1 km), neu nach `zugS` Sekunden der Bild-Uhr; die Mip-Stufe steigt ab `rand` (Anteil des halben Rands) bis
    // zum Mittel. `steilMin` klemmt den Sonnen-Strahl über dem Horizont (sin der Sonnenhöhe). `deckung` die Achse des Wetters [klar,
    // Regen]: die Deckung, die `_dayNightApplySkybox` schreibt, und der Nullpunkt des Wurfs (`_wolkenGewicht`). `mittelMin` der Boden
    // des mittleren Durchlasses, gegen den der Wurf misst (im Regen ist die Karte fast ganz Wolke).
    const WOLKEN_SCHICHT = Object.freeze({
        hoeheM: 800,
        steilMin: 0.05,
        karte: 512,
        zelleM: 16,
        zugS: 0.1,
        rand: 0.8,
        mittelMin: 0.05,
        deckung: Object.freeze([0.12, 0.9]),
    });
    // DER GLANZ, DER SPIEGELT (material.K4): ganz bis zur Rauheit [0], nicht mehr ab [1] — dieselbe Kurve wiegt den Spiegel-Pass der
    // Welt (Stamm `SPIEGEL.glanzRauheit`, `_glanzKnoten`, `_spiegelUmgebung`) und den Himmels-Spiegel der Bühne (`buehne`).
    const GLANZ_RAUHEIT = Object.freeze([0.25, 0.45]);
    // DIE HIMMELS-TAFEL (`himmelTafel`): Equirekt [Breite, Höhe] — 0,7° je Texel, 1 MB Halb-Float.
    const HIMMEL_TAFEL = Object.freeze([512, 256]);

    // DER EINE HIMMEL MIT SEINEN WOLKEN (w27-studio-mesh, studios.K4) — Feld, Menge und Sicht, wörtlich aus dem Stamm
    // (bild-himmel.js `_wolkenFeld` · `_wolkenMenge` · `_himmelSicht`, die sie jetzt rufen): die Welt zeichnet mit ihnen Kuppel,
    // Spiegel und Wurf, die Bühne der Studios ihren Grund und den Spiegel jedes glatten Stoffs. Bis hier lebten sie nur im Stamm,
    // den eine Studio-Seite nie lädt: die Bühne stand unter der Atmosphäre OHNE Wolken, die Welt spiegelt sie in Lack, Scheibe und
    // Klinge (Radeon da0e790f, Station studios.K4: garage 23,5 %, schmiede 24,4 % der Gestalt-Pixel über ΔLuma 18 — Scheibe, Dach
    // und Haube; auf der kahlen Prüfbühne unter freiem Himmel dasselbe Muster). `HG` das HIMMEL_GESETZ des Rufers (foundry-core),
    // `H` die Uniforms seines Himmels { time, cloudCover, zug, auge, sunDir, sunCol }.
    // DAS WOLKEN-FELD (licht.K4): die Menge der Wolke (0 … 1) am Punkt `sp` der Schicht (ein TSL-vec2, in Einheiten
    // (1 + projY) · hoeheM) — EINE Funktion für die Kuppel (`wolkenMenge`) und die Karte des Wurfs (Stamm `_wolkenKarte`). Sie folgt
    // HIMMEL_GESETZ (foundry-core — dieselben Zahlen injiziert das Studio in sein GLSL): zwei fbm-Abtastungen (h21/vn verbatim),
    // Deckungs-smoothstep aus uCloudCover, weiche Ränder. DIE BEWEGUNG hat EINE Quelle, den Wind (`zug`, `_dayNightApplySkybox`):
    // die Fronten ziehen mit `WIND_FELD.front.zugMS` (850 hPa) längs der Grundrichtung der Saat (phyto-core `windGrund`), die
    // Luft trägt beide Felder — das Muster wandert in der Welt über den Boden, zur Bild-Uhr (`time`). `drift`/`drift2` des
    // Gesetzes bewegen den Himmel des Studios, der keinen Wind kennt; in der Welt zogen sie das feine Feld 24 m/s gegen das
    // grobe, das Muster verformte sich statt zu wandern (licht.K4: der Wurf stand bei r0 0,90). Die Bausteine (h21 · vn2 · fbm2)
    // entstehen einmal je Gesetz.
    let wolkenBau = null;
    function wolkenFeld(HG, H, sp) {
        const TSL = globalThis.THREE.TSL;
        const { vec2, float, dot, floor, fract, mix, smoothstep, clamp, Fn } = TSL;
        if (!wolkenBau || wolkenBau.HG !== HG) {
            const h21 = Fn(([q]) => {
                const p = fract(q.mul(vec2(123.34, 345.45)));
                const p2 = p.add(dot(p, p.add(34.345)));
                return fract(p2.x.mul(p2.y));
            });
            const vn2 = Fn(([q]) => {
                const i = floor(q);
                const f0 = fract(q);
                const f = f0.mul(f0).mul(float(3.0).sub(f0.mul(2.0)));
                return mix(
                    mix(h21(i), h21(i.add(vec2(1.0, 0.0))), f.x),
                    mix(h21(i.add(vec2(0.0, 1.0))), h21(i.add(vec2(1.0, 1.0))), f.x),
                    f.y
                );
            });
            const fbm2 = Fn(([q]) => {
                let s = float(0.0);
                let p = q;
                let a = 0.5;
                for (let o = 0; o < HG.fbm.okt; o++) {
                    s = s.add(vn2(p).mul(a));
                    p = p.mul(HG.fbm.lac).add(HG.fbm.off);
                    a *= 0.5;
                }
                return s;
            });
            wolkenBau = { HG, fbm2 };
        }
        const { fbm2 } = wolkenBau;
        const { time: uTime, cloudCover: cov, zug } = H;
        const luft = sp.add(zug.mul(uTime));
        const nA = fbm2(luft.mul(HG.s1));
        const nB = fbm2(luft.mul(HG.s2));
        const dens = smoothstep(
            float(HG.dens[0]).sub(cov.mul(HG.dens[1])),
            float(HG.dens[2]).sub(cov.mul(HG.dens[3])),
            nA.mul(HG.mixN[0]).add(nB.mul(HG.mixN[1]))
        );
        const edgeW = smoothstep(float(0.0), float(HG.edge[0]), nB).mul(HG.edge[1]).add(HG.edge[2]);
        return clamp(dens.mul(edgeW).mul(HG.deck), float(0.0), float(1.0));
    }
    // DIE WOLKE DER KUPPEL in Richtung `dir` (normiert) vom Auge: Himmelsebenen-Projektion sp = dir.xz/(dir.y+projY) plus der Ort
    // des Auges auf der Schicht (`auge.xz / ((1 + projY) · hoeheM)`, im Zenit genau die Lage über ihm) — die Kuppel zeigt das Feld
    // der Welt, das die Karte des Wurfs trägt; Horizont-Ausklang; max(y, hor0) klemmt den Nenner unter dem Horizont (TSL brancht
    // nicht wie das Studio) — sonst NaN.
    function wolkenMenge(HG, H, dir) {
        const T = globalThis.THREE.TSL;
        const anker = H.auge.xz.mul(1 / ((1 + HG.projY) * WOLKEN_SCHICHT.hoeheM));
        const sp = dir.xz.div(T.max(dir.y, T.float(HG.hor[0])).add(HG.projY)).add(anker);
        return wolkenFeld(HG, H, sp).mul(T.smoothstep(T.float(HG.hor[0]), T.float(HG.hor[1]), dir.y));
    }
    // DIE HIMMELS-SICHT in Richtung `vDir` (normiert, ein TSL-Knoten): die EINE Atmosphäre (`A`, die Tafeln) und die Wolken des
    // HIMMEL_GESETZ — die Kuppel der Welt zeichnet sie (vDir = normalize(positionLocal), V8.26), ihr Wasser und jeder glatte Stoff
    // spiegeln sie (`_wasserBlick`, `_spiegelPass`), die Bühne der Studios malt sie in ihre Himmels-Tafel (`buehne`).
    // DER HIMMEL IST DIE ATMOSPHÄRE (D3): die Himmels-Sicht der EINEN Atmosphäre (Hillaire) — Rayleigh-Blau, Mie-Hof um die Sonne,
    // Dämmerung und Mondnacht aus dem Medium; bis D3 eine Nebel-Kuppel (Indigo-Noise × Tint-Farbe, Horizont-Dunst, drei
    // Halo-Schichten), getunt statt gerechnet. Die Scheibe der Sonne trägt ihr Körper (`sunMesh`), den Hof die Mie-Phase der Tafel.
    // DIE HIMMELS-TAFEL (w27-studio-mesh): die Himmels-Sicht mit ihren Wolken als Equirekt-Lage (`HIMMEL_TAFEL`, das Bild von
    // three `equirectUV`) — der Himmel, den eine glatte Fläche spiegelt, BAND-BEGRENZT: EIN bilinearer Abgriff in Richtung des
    // Spiegels statt zweier Rausch-Summen je Pixel. Leser: der Spiegel-Pass der Welt für Glas, Lack und Metall (`_spiegelPass`)
    // und die Bühne der Studios (`buehne`: ihr Grund und der Spiegel ihrer Stoffe). GEMESSEN (swiftshader, Prüfbühne, der GT in
    // 5,7 m): die Normale aus der Tiefe springt von Pixel zu Pixel um p90 0,22° (p99 0,89°, depth24 auf 5 mm Texel) — das feine
    // Feld (5 Oktaven, steile Deckungs-Schwelle) kippte darunter je ¼-Texel des Passes zwischen Wolke und Blau (eine Zeile über
    // das Dach: 0,18 · 1,15 · 0,71 · 0,30 · 0,17 · 0,45 · 0,26 · 1,19), der Lack der Welt las gesprenkelt. → { rt, q }: das Ziel
    // und sein Schirm-Pass; gemalt vom Halter, wenn der Himmel wechselt (Kosten an Änderung).
    function himmelTafel(A, HG, H) {
        const THREE = globalThis.THREE;
        const T = THREE.TSL;
        const rt = new THREE.RenderTarget(HIMMEL_TAFEL[0], HIMMEL_TAFEL[1], {
            type: THREE.HalfFloatType,
            depthBuffer: false,
            generateMipmaps: false,
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
        });
        rt.name = rt.texture.name = "himmel-tafel";
        rt.texture.wrapS = THREE.RepeatWrapping;
        rt.texture.mapping = THREE.EquirectangularReflectionMapping;
        const q = schirmDreieck(
            T.Fn(() => T.vec4(himmelSicht(A, HG, H, umgebungRichtung(T.uv()).toVar()), 1)),
            "himmel-tafel"
        );
        return { rt, q };
    }
    function himmelSicht(A, HG, H, vDir) {
        const TSL = globalThis.THREE.TSL;
        const { vec3, float, normalize, dot, mix, clamp, max, Fn } = TSL;
        const { cloudCover: uCloudCover, sunDir: uSunDir, sunCol: uSunCol } = H;
        // DIE WOLKE NUR, WO SIE IST (A1-n1, Gebot 7): unter `hor[0]` klingt sie auf null aus — dort rechnet die Sicht die
        // Atmosphäre allein (exakt dasselbe Bild); der Spiegel des fernen Wassers liegt ganz darunter (2,6 m Auge, 170 m weit).
        return Fn(() => {
            const sicht = A.himmelFarbe(vDir).toVar();
            TSL.If(vDir.y.greaterThan(HG.hor[0]), () => {
                const cov = uCloudCover;
                const saW = clamp(dot(vDir, normalize(uSunDir)).mul(0.5).add(0.5), float(0.0), float(1.0));
                const litW = mix(
                    vec3(HG.litGrau[0], HG.litGrau[1], HG.litGrau[2]),
                    uSunCol.mul(HG.litSonne[0]).add(HG.litSonne[1]),
                    saW.mul(HG.litSa)
                );
                const cloudAmt = wolkenMenge(HG, H, vDir);
                // Wolken-Farbe = Studio-Gesetz: grau → sonnenbeschienen (litW), bedeckt → dunkler (HG.bedeckt).
                const cloudColor = mix(litW, vec3(HG.bedeckt[0], HG.bedeckt[1], HG.bedeckt[2]), cov.mul(HG.bedecktK));
                // DAS LICHT DER WOLKE aus den Tafeln: Sonne und Mond durch die Atmosphäre bis zur Wolken-Ebene (`WOLKEN_SCHICHT`
                // über dem Auge — dieselbe Schicht, die ihren Schatten wirft) auf ihre Oberseite, dazu der Himmel von oben (der
                // Zenit der Himmels-Sicht, E/π) — Lambert. So ist die Mittags-Wolke weiß über dem Blau und die Nacht-Wolke dunkler
                // als die 18-%-Karte im Mondlicht.
                const U = A.U;
                const rW = U.hKm.add(A.RG + WOLKEN_SCHICHT.hoeheM / 1000);
                const lichtWolke = A.durchlass(rW, U.sonne.y)
                    .mul(max(U.sonne.y, 0))
                    .add(U.mondE.mul(A.durchlass(rW, U.mond.y)).mul(max(U.mond.y, 0)))
                    .mul(U.licht.div(Math.PI))
                    .add(A.himmelFarbe(vec3(0, 1, 0)));
                const wolkeHell = dot(lichtWolke, vec3(0.2126, 0.7152, 0.0722));
                sicht.assign(mix(sicht, cloudColor.mul(wolkeHell), cloudAmt));
            });
            return sicht;
        })();
    }

    // DAS WURF-RECHT EINES TEILS (studios.K4 — EIN Gesetz für Welt und Bühne): die Fell-Schalen werfen keinen Schatten (die Haut
    // darunter wirft ihn — sechs Schalen wären sechs Ränder), eine LICHTQUELLE nie (Seh-Klasse glut: Glutbett, Flamme, die Lichter
    // des Wagens, die Leucht-Linien der Tore), ein DURCHSICHTIGER Stoff (Scheibe, Fenster, Brunnen-Wasser; Deckkraft < 1 aus dem
    // Gesetzbuch) auch keinen: das Licht geht durch ihn. Das Teil in der Gestalt, wie die Brücke es reicht (foundry-bruecke
    // `__extractAssetMesh`: `kind`, `mat.seh`, `mat.opacity`) — die Welt fragt je geliefertem Teil (`_teilWirft`), die Bühne je
    // Mesh in jedem Bild (`stoffRecht` in `buehneZeichnet`). Bis w27-studio-mesh lebte das Gesetz nur in der
    // Welt, die Bühne warf mit jedem Teil: Scheibe und Lichter beschatteten den Innenraum des Wagens, die Welt zeigte ihn hell.
    function teilWirft(t) {
        const m = t && t.mat;
        return (
            !!t &&
            t.kind !== "fellSchale" &&
            !(m && m.seh === "glut") &&
            !(m && typeof m.opacity === "number" && m.opacity < 1)
        );
    }
    // das Teil eines Meshes der Bühne in der Gestalt der Brücke (die Deckkraft reist nur am durchsichtigen Stoff)
    function meshTeil(o) {
        const m = o.material,
            u = (m && m.userData) || {};
        return {
            kind: u.__klasse,
            mat: { seh: u.__seh, opacity: m && m.transparent && m.opacity < 1 ? m.opacity : undefined },
        };
    }
    // DIE DURCHSICHT EINES STOFFS (EIN Gesetz für Welt und Bühne): ein durchsichtiger Stoff (Scheibe, Fenster, Glimm-Scheibe)
    // zeichnet transparent mit der Deckkraft seines Gesetzbuchs und beide Seiten in EINEM Zug — r184 zieht einen doppelseitig-
    // durchsichtigen Stoff sonst zweimal (Rück-, dann Vorderseite), jede Scheibe tönte doppelt (Durchlass 0,58² statt 0,58 bei
    // Deckkraft 0,42). Die Welt baut ihn so (`_foundryBuildMaterial`), die Bühne jedes Studios zeichnet ihn so (`stoffRecht`).
    function durchsicht(mat, op) {
        mat.transparent = true;
        mat.opacity = op;
        mat.forceSinglePass = true;
        return mat;
    }
    // DAS RECHT DER WELT AN EINEM MESH DER BÜHNE: es wirft nach dem Wurf-Recht (`teilWirft`), sein durchsichtiger Stoff zeichnet in
    // EINEM Zug (`durchsicht`) — angewandt am EINEN Engpass jedes Bilds jeder Bühne (`buehneZeichnet`), auch an einem Teil, das ein
    // Studio nach seinem Bau einhängt (die Spur der Arena, ein Hilfs-Ring)
    function stoffRecht(o) {
        if (!o.isMesh || !o.material) return;
        if (o.castShadow && !teilWirft(meshTeil(o))) o.castShadow = false;
        const m = o.material;
        if (m.transparent && m.opacity < 1 && !m.forceSinglePass) durchsicht(m, m.opacity);
    }

    // DIE BÜHNE DER WELT (studios.K4, w12-studio-buehne — Studio = Modus der Welt-Engine): ein Studio zeichnet sein Werk im Licht
    // der Welt. Dieselbe Luft (der Kern: `ATMO_GESETZ`, klares Medium über dem Boden `ATMO_BODEN`), dieselben Tafeln
    // (`atmoTafeln`), dieselbe Sonne (E0 · Durchlass, `ATMO_RECHNUNG.sonne`), dieselbe Umgebung (`umgebungZeichnen` und
    // `himmelDerStoffe` — die Knoten, die `_spiegelUmgebung` der Welt jedem Stoff reicht; den Spiegel des Schirms trägt die Bühne
    // nicht, sie hat kein Feld), derselbe Himmel als Grund (die Equirekt-Tafel), dieselbe Belichtung (Anker und Stufen
    // der Kamera aus der Bestrahlungs-Tafel, `belichtung`) und dieselbe Tonkurve (`BELICHTUNG.kurve`). Die Bühne steht im TAG der
    // Welt (`o.uhr`, Vorgabe Mittag — das Wort jeder Sonde: Mittag · Sonne · Sommer): wo die Tag-Achse Ersatz-Lichter der Nacht
    // (Hemi, Ambient, Sterne) trüge, bricht sie laut, sie trägt die Nacht nicht. Das Auge steht am Bezug der Luft (1 m, die Höhe
    // des Ankers). Gezeichnet werden die Tafeln einmal beim Ruf (der Renderer steht: nach `init()`); die Belichtung liegt, sobald
    // die Bestrahlungs-Tafel zurückkam (`steht`, ein Versprechen) — bis dahin zeichnet die Bühne kein Bild (`belichtung` null).
    // → { sonne (DirectionalLight, Richtung `richtung`), staerke, tafeln, umgebung (das PMREM-Ziel), knoten, achse, steht, belichtung }.
    function buehne(o) {
        const THREE = globalThis.THREE;
        const T = THREE && THREE.TSL;
        const R = o && o.renderer;
        const szene = o && o.szene;
        if (!T || !R || R.isWebGPURenderer !== true || !szene)
            throw new Error(
                "DIE BÜHNE DER WELT: sie zeichnet auf der Engine der Welt (three r184 WebGPURenderer) in eine Szene"
            );
        const uhr = o.uhr == null ? 0.5 : o.uhr;
        const G = KERN.ATMO_GESETZ;
        const AR = KERN.ATMO_RECHNUNG;
        const M = AR.medium(G, AR.betaKlar(G), ATMO_BODEN);
        const winkel = sonnenWinkel(uhr);
        const s = sonnenRichtung(winkel);
        const m = mondRichtung(winkel);
        const achse = tagAchse(s[1]);
        if (!(achse.nacht === 0 && achse.daemmerung === 1))
            throw new Error(
                `DIE BÜHNE DER WELT steht im Tag: die Uhr ${uhr} trägt die Ersatz-Lichter der Nacht (nacht ${achse.nacht.toFixed(3)}, ` +
                    `Dämmerung ${achse.daemmerung.toFixed(3)}) — die Nacht zeichnet nur die Welt`
            );
        const hKm = 0.001;
        const A = atmoTafeln({ G, M });
        const U = A.U;
        U.hKm.value = hKm;
        U.sonne.value.set(s[0], s[1], s[2]);
        U.mond.value.set(m[0], m[1], m[2]);
        const E0 = e0(1);
        U.licht.value = E0;
        const mi = MOONLIGHT.intensity / Math.max(E0, 1e-6);
        U.mondE.value.set(MOONLIGHT.r * mi, MOONLIGHT.g * mi, MOONLIGHT.b * mi);
        const sw = nachtHimmel(achse);
        U.nachtE.value
            .set(STERNENLICHT.r * sw, STERNENLICHT.g * sw, STERNENLICHT.b * sw)
            .divideScalar(Math.max(E0, 1e-6));
        // die Tafeln in ihre Ziele: Durchlass und Ψ_ms (das Medium), die Himmels-Sicht (die Sonne), die Umgebung, die Bestrahlung
        const vor = R.getRenderTarget();
        for (const [q, rt] of [
            [A.qT, A.rtT],
            [A.qMS, A.rtMS],
            [A.qSV, A.rtSV],
            [A.qEq, A.rtEq],
            [A.qBS, A.rtBS],
        ]) {
            R.setRenderTarget(rt);
            R.render(q, q.userData.kamera);
        }
        R.setRenderTarget(vor);
        A.mediumBeta = AR.betaKlar(G);
        A.tafelnFrisch = true;
        const umgebung = umgebungZeichnen(new THREE.PMREMGenerator(R), A);
        szene.environment = umgebung.texture;
        // die Sonne: E0 · Durchlass am Auge, ihr Farbton der Durchlass der EINEN Luft
        const a = AR.sonne(G, M, hKm, s[1], ATMO_LUT.schritte.durchlass, [0, 0, 0]);
        // DER HIMMEL DER BÜHNE IST DER HIMMEL DER WELT (w27-studio-mesh): die Himmels-Sicht mit ihren Wolken (`himmelSicht`, dieselbe
        // Funktion wie die Kuppel der Welt) in der EINEN Himmels-Tafel (`himmelTafel`, dieselbe wie der Spiegel-Pass der Welt) — der
        // Grund der Bühne und der Spiegel jedes glatten Stoffs.
        // Ihr Zustand `himmel` { ort [x, z] · zeit · zug [x, y] · deckung · gier } ist der Himmel der Welt an einem Ort zu einer
        // Bild-Uhr, gesehen aus dem Rahmen eines Werks, das die Welt um `gier` gedreht trägt (`himmelSetzen`: der Wirt der Seite
        // reicht ihn); ohne Wort: über dem Ursprung zur Bild-Uhr 0 bei klarem Wetter (`WOLKEN_SCHICHT.deckung[0]`, „Sonne“ —
        // verstreute Wolken, kein wolkenloser Himmel), ungedreht. Bis hier war der Grund die Tafel der Atmosphäre ohne Wolken und
        // die Umgebung ihr PMREM allein.
        const HG = KERN.HIMMEL_GESETZ;
        const H = {
            time: T.uniform(0),
            cloudCover: T.uniform(WOLKEN_SCHICHT.deckung[0]),
            zug: T.uniform(new THREE.Vector2()),
            auge: T.uniform(new THREE.Vector3()),
            sunDir: T.uniform(new THREE.Vector3(s[0], s[1], s[2])),
            sunCol: T.uniform(new THREE.Color(a.col.r, a.col.g, a.col.b)),
        };
        // die Gier des Werks in der Welt [cos, sin]: eine Richtung der Bühne, in die Welt gedreht (um die Senkrechte)
        const dreh = T.uniform(new THREE.Vector2(1, 0));
        const inWelt = (d) => T.vec3(dreh.x.mul(d.x).add(dreh.y.mul(d.z)), d.y, dreh.x.mul(d.z).sub(dreh.y.mul(d.x)));
        const { rt: rtH, q: qH } = himmelTafel(A, HG, H);
        // DIE UMGEBUNG DER STOFFE wie in der Welt (`_spiegelUmgebung`): die Bestrahlung und die raue Spiegelung lesen den Himmel der
        // EINEN Atmosphäre (PMREM), die glatte Fläche spiegelt die Himmels-Sicht in ihrer Richtung — mit dem Gewicht des Glanzes
        // (`GLANZ_RAUHEIT`), das auch der Spiegel-Pass der Welt trägt. Die Bühne hat kein Bild, das sich spiegelt: ihr Spiegel ist
        // der Himmel (was der Pass der Welt reicht, wo sein Strahl nichts trifft).
        class BuehnenUmgebung extends Object.getPrototypeOf(THREE.InstanceNode) {
            constructor() {
                super("vec3");
            }
            setup(builder) {
                const stufe = builder.context.getTextureLevel ? builder.context.getTextureLevel(this, builder) : null;
                if (!stufe) return himmelDerStoffe(umgebung.texture, U);
                const dir = inWelt(builder.context.getUV(this, builder)).toVar();
                const himmel = himmelDerStoffe(umgebung.texture, U, dir, stufe);
                if (stufeKonstant(stufe)) return himmel;
                const sp = T.texture(rtH.texture, T.equirectUV(dir)).level(T.float(0));
                return T.mix(himmel, sp.rgb, T.float(1).sub(T.smoothstep(GLANZ_RAUHEIT[0], GLANZ_RAUHEIT[1], stufe)));
            }
        }
        const knoten = (szene.environmentNode = T.nodeObject(new BuehnenUmgebung()));
        // der Grund ist der Himmel: seine Tafel (die Himmels-Sicht, schon im Licht jetzt) — als `background` (eine Textur, kein
        // Knoten: die Sonden schwärzen für ihre Masken `background`, ein `backgroundNode` hätte Vorrang und malte den Himmel in die Maske)
        szene.background = rtH.texture;
        szene.backgroundIntensity = 1;
        szene.fog = null;
        const sonne = o.sonne || new THREE.DirectionalLight();
        sonne.color.setRGB(a.col.r, a.col.g, a.col.b);
        sonne.intensity = E0 * a.lum;
        R.toneMapping = THREE[BELICHTUNG.kurve];
        R.outputColorSpace = THREE.SRGBColorSpace;
        // `knoten` (die Umgebung jedes Stoffs) und `staerke` (die Sonne des Gesetzes) liest die Treue der Bühne (`buehneZeichnet`):
        // die Bühne zeichnet unter diesem Licht allein — Identität, nie ein Nachbau
        const B = {
            sonne,
            staerke: sonne.intensity,
            richtung: new THREE.Vector3(s[0], s[1], s[2]),
            tafeln: A,
            umgebung,
            knoten,
            grund: rtH.texture,
            himmel: null,
            achse,
            belichtung: null,
            imFlug: 0,
        };
        // DER HIMMEL AN SEINEM ORT: der Zustand in die Uniforms, die Tafel neu gemalt (EIN Schirm-Pass, nur bei Wechsel — die
        // Bühne steht, ihre Wolken ziehen nicht; der Ort des Auges auf der Schicht ist der der Bühne, das Werk wenige Meter daneben
        // verschiebt das Feld um Tausendstel seiner Zelle). DIE GIER dreht den Himmel der Welt in den Rahmen des Werks: der Grund,
        // jede Abtastung der Umgebung (`inWelt`) und die Sonne (ihre Richtung, das Richtlicht an seinem Ziel) — die Tafeln selbst
        // stehen in der Welt. Fail-closed: ein Zustand, der nicht ganz aus Zahlen ist, bricht laut.
        B.himmelSetzen = (z) => {
            const h = z || {};
            const [ort, zug, zeit, gier] = [h.ort || [0, 0], h.zug || [0, 0], h.zeit || 0, h.gier || 0];
            const deckung = h.deckung ?? WOLKEN_SCHICHT.deckung[0];
            if (![...ort, ...zug, zeit, deckung, gier].every(Number.isFinite) || ort.length !== 2 || zug.length !== 2)
                throw new Error(
                    "DIE BÜHNE DER WELT: der Himmel { ort [x, z], zug [x, y], zeit, deckung, gier } aus Zahlen, nie " +
                        JSON.stringify(z)
                );
            H.auge.value.set(ort[0], 0, ort[1]);
            H.zug.value.set(zug[0], zug[1]);
            H.time.value = zeit;
            H.cloudCover.value = deckung;
            const [c, sn] = [Math.cos(gier), Math.sin(gier)];
            dreh.value.set(c, sn);
            szene.backgroundRotation.set(0, -gier, 0);
            B.richtung.set(c * s[0] - sn * s[2], s[1], sn * s[0] + c * s[2]);
            const weit = sonne.position.distanceTo(sonne.target.position);
            if (weit > 0) sonne.position.copy(sonne.target.position).addScaledVector(B.richtung, weit);
            B.himmel = { ort: [...ort], zug: [...zug], zeit, deckung, gier };
            const ziel = R.getRenderTarget();
            R.setRenderTarget(rtH);
            R.render(qH, qH.userData.kamera);
            R.setRenderTarget(ziel);
        };
        B.himmelSetzen(o.himmel);
        // DER ABSCHIED (w28-studio-welt): stellt ein Studio die Uhr, entsteht sein Licht an der neuen Stunde neu (die EINE Bühne
        // der Hülle, `uhr`) — die Ziele der alten Tafeln, des alten Himmels und der alten Umgebung gehen
        B.abschied = () => {
            for (const rt of [A.rtT, A.rtMS, A.rtSV, A.rtEq, A.rtBS, rtH, umgebung]) rt.dispose();
        };
        const W = A.rtBS.width;
        B.steht = R.readRenderTargetPixelsAsync(A.rtBS, 0, 0, W, 1).then((px) => {
            const werte = tafelAusPixeln(px, W);
            A.tafel = A.tafelFlug = { W, werte, medium: A.mediumBeta, stufe: Math.round(hKm * 10) };
            A.anker = tafelAnker(werte, W);
            A.belichtung = belichtungAnker(G, AR, A.anker);
            // die waagrechte Fläche des Orts: die Sonne mit dem Sinus ihrer Höhe und der Himmel der Tafel — Hemi und Ambient trägt
            // der Tag nicht (die Tag-Achse oben: nacht 0)
            const E = bestrahlung(A.tafel, U, [0, 0, 0]);
            const I = sonne.intensity * Math.max(0, s[1]);
            E[0] += sonne.color.r * I;
            E[1] += sonne.color.g * I;
            E[2] += sonne.color.b * I;
            B.belichtung = R.toneMappingExposure = belichtung(E, A.belichtung, s[1]);
            return B;
        });
        return B;
    }

    // DIE TREUE DER BÜHNE (studios.K4, w13-buehne-lack): jedes Bild der Bühne fragt vor dem Zeichnen, ob es unter dem Licht der Welt
    // ALLEIN steht — false, solange die Belichtung nicht liegt; ein Licht neben ihrer Sonne, die Sonne oder die Belichtung (samt
    // Tonkurve) neben dem Gesetz, ein Himmel neben ihrem Knoten (Stärke 1, der Himmel als Grund in E0), ein Stoff mit eigener
    // Umgebung (envNode/envMap) bricht LAUT beim Namen, nie still; jedes Mesh zeichnet dabei nach dem Recht der Welt (`stoffRecht`:
    // Wurf-Recht und Durchsicht) (der Sammler jeder Linse, die die Seite fährt, nennt ihn).
    // Bis w12-studio-buehne zeichnete die garage unter drei Lichtern am Blick bei Belichtung 1,04: ihr Lack „glänzte" (iso, Lack-Pixel
    // Luma 92,5, p95/p50 2,11). GEMESSEN 06.11. (swiftshader, garage iso, Lack-Pixel): im Licht der Welt 46,0 / p95/p50 1,14 — ohne
    // die Sonne 30,9 / 1,55 (der Himmels-Spiegel steht, das Licht der Sonne auf Dach und Haube deckt ihn), bei Belichtung 1,04
    // 66,5 / 1,15, ein Chrom-Wagen (Spiegel 1) 80,9: unter dem Licht der Welt erreicht KEIN Stoff am Lack-Blick den Glanz von main —
    // der war das Studio-Licht. Die Welt zeigt denselben Lack (Lack-Kugel 35°/7 m: Welt 45,3, Bühne 48,2, w12-studio-buehne).
    // DIE LEINE DER BÜHNE (wie die Welt, stamm/dirigent-takt.js `_gpuLeineFrei`): jedes gezeichnete Bild meldet die Arbeit davor an die
    // Queue; sind GPU_FRAMES_IM_FLUG Meldungen offen, zeichnet die Bühne nicht (der Aufrufer fragt im nächsten Takt wieder). Ohne sie
    // lief die Garage ihrer GPU beliebig voraus — auf dem CPU-Raster der CI (z259, Linux-swiftshader) stand ihre Schlange 25 s lang,
    // jeder Pipeline-Bau und jedes Lesen wartete dahinter, die Labor-Linse riss in G8 nach 120 s. GEMESSEN (06.11., derselbe Läufer,
    // ubuntu-latest swiftshader): mit der Leine läuft die Labor-Linse in 32 s GRÜN (ohne: Riss nach 120 s), die Portal-Konformanz GRÜN.
    function buehneZeichnet(B, szene, R) {
        if (!B || B.belichtung == null) return false;
        const q = R.backend && R.backend.device ? R.backend.device.queue : null;
        if (q && B.imFlug >= GPU_FRAMES_IM_FLUG) return false;
        const fremd = new Set();
        let sonne = false;
        szene.traverse((o) => {
            if (o === B.sonne) sonne = true;
            else if (o.isLight) fremd.add(`ein Licht ${o.type} „${o.name}"`);
            for (const m of [o.material].flat())
                if (m && (m.envNode || m.envMap)) fremd.add(`eine eigene Umgebung am Stoff „${m.name || m.type}"`);
            stoffRecht(o);
        });
        if (!sonne || B.sonne.intensity !== B.staerke) fremd.add(`die Sonne ${B.sonne.intensity} statt ${B.staerke}`);
        if (R.toneMappingExposure !== B.belichtung || R.toneMapping !== globalThis.THREE[BELICHTUNG.kurve])
            fremd.add(`die Belichtung ${R.toneMappingExposure} statt ${B.belichtung}`);
        if (
            szene.environmentNode !== B.knoten ||
            szene.environmentIntensity !== 1 ||
            szene.background !== B.grund ||
            szene.backgroundIntensity !== 1
        )
            fremd.add("ein Himmel neben dem Knoten des Gesetzes");
        if (fremd.size)
            throw new Error(`DIE BÜHNE DER WELT zeichnet unter dem Licht der Welt allein: ${[...fremd].join(" · ")}`);
        if (q) {
            B.imFlug++;
            const los = () => B.imFlug--;
            q.onSubmittedWorkDone().then(los, los);
        }
        return true;
    }

    return Object.freeze({
        ATMO_LUT,
        ATMO_BODEN,
        KEY_BASE,
        LEGACY_LICHT,
        BELICHTUNG,
        GRENZGROESSE,
        GPU_FRAMES_IM_FLUG,
        MOONLIGHT,
        STERNENLICHT,
        nachtHimmel,
        schirmDreieck,
        umgebungRichtung,
        atmoTafeln,
        belichtungStufen,
        belichtung,
        belichtungAnker,
        e0,
        sonnenWinkel,
        sonnenRichtung,
        mondRichtung,
        tagAchse,
        halbZuFloat,
        zeilenSchritt,
        tafelAusPixeln,
        tafelAnker,
        bestrahlung,
        umgebungLicht,
        umgebungZeichnen,
        himmelDerStoffe,
        stufeKonstant,
        WOLKEN_SCHICHT,
        GLANZ_RAUHEIT,
        wolkenFeld,
        wolkenMenge,
        himmelSicht,
        himmelTafel,
        teilWirft,
        durchsicht,
        buehne,
        buehneZeichnet,
    });
})();
