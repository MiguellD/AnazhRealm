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
    // 256×64 und Ψ_ms 64×32 je Medium (cos Sonnen-Zenit quadratisch dicht um den Horizont wie die Bestrahlungs-Tafel: bei −5°
    // ein Texel 1,15° statt 3,6° — die Dämmerung knickt nirgends, licht-stetig), die Himmels-Sicht 192×108 je Stufe der Sonne,
    // die Umgebung 128×64 (Equirekt, PMREM).
    // mediumStufe: die Stufe des Mediums im Logarithmus der Extinktion (`_atmoMediumJetzt`) — 2 % halten den Zenit-Durchlass
    // der klaren Luft (Aerosol-Tiefe 0,18) unter einer 8-bit-Stufe; ein Übergang klar → Sturm (Faktor 13) sind 130 Stufen.
    // flug: so viele Stufen darf das Medium wandern, solange die Tafel im Flug ist (`_waagrechtIrradianz`) — der steilste Anstieg im
    // Zug klar → Regen (β ×1,13 je Sekunde, 6 Stufen) bleibt eine Sekunde darunter, der Himmel je E0 folgt ihm mit ≤ β^0,62:
    // 8 Stufen sind ≤ 10 % am Himmel, am Mittag ≤ 0,02 EV an der Karte.
    const ATMO_LUT = Object.freeze({
        mediumStufe: 0.02,
        flug: 8,
        durchlass: Object.freeze([256, 64]),
        mehrfach: Object.freeze([64, 32]),
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
    // für Dämmerung und Nacht, `gleitung` [oben, unten] das Band, in dem die Kamera von der Steigung auf sie gleitet. Das Nacht-Auge der Post-Kette
    // steht ganz im letzten Anker der EINEN Tag-Achse (`GRENZGROESSE`, astronomische Nacht −18°, USNO): darunter streut keine Sonne
    // mehr in den Himmel (sonnenbahn: die eigene Tiefe −32° ließ es im Sommer am Anker nachts bei 0,72). Die Messungen am Stamm.
    // DER BODEN DES MESSERS (`nachtKnotenE` × der Mond der Stunde, licht-stetig): die weiteste Blende der Kamera — ihr Lichtmesser
    // liest nie weniger als das Licht des Vollmonds ohne Wolken-Decke zu DIESER Stunde, E des Monds im Zenit (`MOND_E`) × der Sinus
    // seiner Höhe × sein Durchlass (`belichtung`, das sechste Wort); darunter steht die Belichtung, und das Bild fällt mit dem Licht
    // (UE: die Untergrenze der Auto-Belichtung, Min EV100) — Wald, Wolke, Gasse ohne Laterne. Unter offenem Himmel folgt die Kamera
    // dem Mond, wie die REF es misst (spec/farbe/tag-ref.json, USNO Circular 171: −20° 0,096 lx und −90° 0,397 lx stehen beide auf
    // −2,17 Stufen), und Laterne, Fenster und Feuer tragen die Nacht (der Messer liest ihren Pool am Bild, `_poolAmBild`). Bis licht-stetig
    // war der Boden der Mond im Zenit, ab −6° fest (0,26 lx): die Dämmerung der Tafeln (0,43–0,52 Dekaden je Grad, wie Brown 1952)
    // fiel um −8,6° unter ihn, und das Bild der Wiese fiel mit dem Licht — gerechnet 3 EV in 2,5° (GTX 1feab29c: Tafeln + Mond
    // 0,37 lx bei −8,6°, 0,03 lx bei −12°); um 05 Uhr (Mond 18°, 0,056 lx) stand das Bild 2,2 EV unter Mitternacht.
    // DIE EINE SKALA (licht-eine-skala): 1 Welt-Einheit Licht = `EINHEIT_LX` lx Beleuchtungsstärke bzw. cd/m² Leuchtdichte —
    // der Maßstab, in dem die Sonne geeicht steht (spec/farbe/tag-ref.json: 117 970 lx bei 75° Sonnenhöhe; die Welt trägt dort
    // waagrecht 7,33 Einheiten — Sonne 6,01 + Himmel 1,41 bei 74,2° gerechnet 7,42). JEDE Quelle trägt ihren physikalischen
    // Wert ÷ `EINHEIT_LX`; bis hierher stand die Nacht in einem zweiten Maßstab (1 Einheit = 1,16 lx, das 13 862-Fache). Den
    // Unterschied trägt die Belichtung (die Vor-Belichtung des Szenen-Ziels, `_vorBelichtung` im Stamm: der Puffer hält L × k).
    const EINHEIT_LX = 16090;
    // DER VOLLMOND IM ZENIT: 0,26 lx (Kyba u. a. 2017, „How bright is moonlight?“: typisch 0,05–0,2 lx, höchstens 0,3 lx)
    const MOND_LX = 0.26;
    const lumaVon = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    // die Stärke des Mond-Richtlichts: E im Zenit = Stärke × die Luma seines Tons = `MOND_LX` ÷ `EINHEIT_LX`
    const MOND_STAERKE = MOND_LX / EINHEIT_LX / lumaVon(KERN.ATMO_GESETZ.nacht.mond);
    // E DES VOLLMONDS IM ZENIT (Welt-Einheiten, wie `_waagrechtIrradianz`): seine Stärke × die Luma seines Tons
    const MOND_E = MOND_STAERKE * lumaVon(KERN.ATMO_GESETZ.nacht.mond);
    const BELICHTUNG = Object.freeze({
        kurve: "CustomToneMapping",
        schulter: 0.76,
        zielKarte: 0.22,
        min: 0.05,
        steigung: 0.75,
        gleitung: Object.freeze([12, 8]),
        stufen: Object.freeze([Object.freeze([10, -0.87]), Object.freeze([-20, -2.17])]),
        nachtKnotenE: MOND_E,
        // DIE NACHT DER REF: E der waagrechten Fläche am Knoten der Nacht (`stufen` −20° → −2,17), der Bezug, gegen den der Messer
        // die Leuchten des Orts wiegt (`_poolAmBild`). Quelle: USNO Circular 171 (Janiczek & DeYoung 1987, nach Brown 1952) — 0,0963 lx bei −20°, der Vollmond gegenüber
        nachtRefE: 0.0963 / EINHEIT_LX,
        // DER WEG ZU WEISS (nacht-lichter): über Bild-Weiß zieht die Kurve den Ton zu seinem größten Kanal — `kappe` ist der höchste
        // Anteil (weit über Weiß), `stufen` die Stufen über Weiß, nach denen die Hälfte erreicht ist — im QUADRAT der Stufen: am Knie
        // (Weiß) steigt der Weg ohne Knick (gate:post-kette KNIE). Gebunden an das Feuer: der KERN (3 000 K bei k 20 000) hält mit 0,14
        // Sättigung 0,44 über dem Band 0,42.
        weiss: Object.freeze({ kappe: 0.14, stufen: 2 }),
        // DER DECKEL DES SZENEN-ZIELS (Halb-Float): am GRÖSSTEN Kanal, das Verhältnis der Kanäle bleibt (`deckeln`)
        deckel: 32768,
    });
    // DIE TONKURVE DER AUSGABE (licht-eine-skala) — die EINE Funktion, die jedes Bild der Welt und der Bühne an den Schirm legt
    // (`tonKurveSetzen`: der Platz `BELICHTUNG.kurve` in der Tafel des Renderers). Ihre Form ist Khronos PBR Neutral: Fuß
    // 6,25·x² unter 0,08, bis zur Schulter (`schulter`) geht die Farbe unverändert ins Bild, darüber wird der GRÖSSTE Kanal
    // gestaucht — das Verhältnis der Kanäle bleibt, über Bild-Weiß behält jede Quelle Farbton und Sättigung. Neutral selbst
    // zieht darüber zu Weiß: 1 − 1 ÷ (0,15·(Spitze − gestaucht) + 1) steht bei 10 × Weiß auf 0,57, bei den 47 000 × Weiß einer
    // Flamme unter der Blende der Nacht auf 1 — die Flamme, das Glutbett, das wache Fenster und die Rauch-Unterseite brannten
    // weiß (gate:post-kette (j2), GTX 1050). Dieser Zug FIEL ganz (am Bild entschieden: eine Grenze 0,012 statt 0 änderte
    // Herd, Dorf-Nacht und Sonnen-Scheibe nicht sichtbar). Ein grauer Eingang bleibt grau: die Eichung der Karte und jede
    // Rückrechnung am Grau gelten weiter; der Tag steht zahlengleich (Wiese Mittag Luma 89,88 = 89,88).
    // DER FUSS AM SCHLÜSSEL (sonnenbahn 3, Entscheid des Koordinators 25.11.): der Fuß liest die Farbe an der Belichtung des
    // Schlüssels (k ÷ 2^n, die Karte auf `zielKarte` ohne die Stufen der Tag-Achse), die Stufen n (`belichtungNachFuss`, die Uniform
    // `tonStufen`) kommen HINTER ihm, die Schulter danach — der Fuß gehört zum Schlüssel, die Schulter zum Schirm. Am Tag (n = 0)
    // dieselbe Funktion Zahl für Zahl (× 1). Bis hier legte die Kurve den Fuß an das ganze k: die Nacht (n −2,17) stand mit ihrem
    // Median im Eingang 0,035 ganz im Fuß, jede Blende des Bodens wurde zwei — S0, GTX 1050, Mond 22°: Luma 4 lag 1,31 Blenden unter
    // dem Median, abgesoffen im Licht 5,6 % (die Kurve aus dem Licht der Lampen 7,5 %, die Gerade durch den Median 0,0 %).
    function tonKurve(THREE, B = BELICHTUNG) {
        const T = THREE.TSL;
        const S = B.schulter;
        const d = 1 - S;
        const F = tonStufen(THREE);
        return T.Fn(([farbe, k]) => {
            const c = farbe.mul(k).toVar();
            const x = T.min(c.r, T.min(c.g, c.b)).mul(F.teil);
            c.subAssign(T.select(x.lessThan(0.08), x.sub(x.mul(x).mul(6.25)), 0.04).mul(F.mal));
            const spitze = T.max(c.r, T.max(c.g, c.b));
            const ueber = spitze.greaterThanEqual(S);
            const p = spitze.max(S);
            const neu = T.float(1).sub(T.float(d * d).div(p.add(d - S)));
            const aus = c.mul(T.select(ueber, neu.div(p), 1)).toVar();
            // DER WEG ZU WEISS (nacht-lichter, `BELICHTUNG.weiss`): Stufen über Weiß ziehen den Ton begrenzt zu seinem größten
            // Kanal — genau 0 bis Weiß (der Tag, jedes Grau, jede Fläche unter Weiß bleibt Zahl für Zahl), die Kappe weit darüber.
            // Bis hier blieb über Weiß jeder Ton in Farbton UND Sättigung: das Glas der Laterne unter der Blende der Nacht (18 ×
            // Weiß) stand als flaches Orange, kein Licht trug je eine helle Mitte.
            const s = T.log2(spitze.max(1)).div(B.weiss.stufen);
            const w = T.float(B.weiss.kappe).mul(T.float(1).sub(T.exp2(s.mul(s).negate())));
            return T.mix(aus, T.vec3(T.max(aus.r, T.max(aus.g, aus.b))), w);
        });
    }
    // DER DECKEL DES SZENEN-ZIELS (`BELICHTUNG.deckel`): der größte Kanal höchstens am Deckel, das Verhältnis der Kanäle bleibt — je
    // Kanal gedeckelt stand die Flamme unter der Blende der Nacht auf (32 768, 32 768, B), gelb-weiß statt orange. Leser: das Ende
    // der Post-Kette (`_vorBelichtung`), gate:post-kette.
    function deckeln(T, rgb, B = BELICHTUNG) {
        return rgb.mul(T.float(B.deckel).div(T.max(rgb.r, T.max(rgb.g, rgb.b)).max(B.deckel)));
    }
    // DIE STUFEN HINTER DEM FUSS als Uniform der EINEN Kurve (EINE je Seite: jeder Renderer und jeder Leser der Kurve liest sie):
    // `n` die Zahl, `mal` = 2^n und `teil` = 2^−n ihre Uniformen — gebaut mit der ersten Kurve (`tonKurve` reicht THREE; ein Leser
    // ohne Kurve, der Wirt einer Linse im Rechen-Raum, trägt nur die Zahl). Geschrieben NUR von den Schreibern der Belichtung
    // (`tonStufenSetzen`: die Welt in `_dayNightApplyBelichtung`, die Bühne in `buehne`), mit der Belichtung im selben Zug.
    const _tonStufen = { n: 0, mal: null, teil: null };
    function tonStufen(THREE) {
        const F = _tonStufen;
        if (THREE && !F.mal) [F.mal, F.teil] = [THREE.TSL.uniform(2 ** F.n), THREE.TSL.uniform(2 ** -F.n)];
        return F;
    }
    // die Stufen bei der Sonnenhöhe e (Sinus, wie `belichtung`) — am Tag genau 0 (die Uniformen 1 und 1)
    function tonStufenSetzen(e, B = BELICHTUNG) {
        const F = _tonStufen;
        F.n = belichtungNachFuss((Math.asin(Math.max(-1, Math.min(1, e))) * 180) / Math.PI, B);
        if (F.mal) [F.mal.value, F.teil.value] = [2 ** F.n, 2 ** -F.n];
        return F.n;
    }
    // DER EINE SETZER: die Kurve in die Tafel des Renderers (einmal je Renderer) und auf seinen Platz
    const _tonKurveAn = new WeakSet();
    function tonKurveSetzen(R, THREE) {
        if (R.library && !_tonKurveAn.has(R)) {
            R.library.addToneMapping(tonKurve(THREE), THREE[BELICHTUNG.kurve]);
            _tonKurveAn.add(R);
        }
        R.toneMapping = THREE[BELICHTUNG.kurve];
    }
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
    // 0,22 → 0,65, das Ambient der Nacht fiel 0,23 → 0,04 (in licht-eine-skala ganz) — Schlüssel und Füllung der Mondnacht: der
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
    // 0,0005 lx ÷ `EINHEIT_LX`, durch π (die Halbkugel). Bis licht-eine-skala stand es als Anteil des Mondes im Maßstab der Nacht. Bis hier trug der Himmel die Zahl des
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
                leuchtdichte: 0.0005 / EINHEIT_LX / Math.PI,
            };
        })(KERN.ATMO_GESETZ.nacht.himmel)
    );
    // DER HIMMEL DER NACHTSEITE OHNE MOND je Sonnenhöhe (Zenit-Leuchtdichte, Welt-Einheiten; `achse` die EINE Tag-Achse): das
    // Sternen-Licht, wie die Sterne erscheinen (1 − Dämmerung). DIE DÄMMERUNG TRAGEN DIE TAFELN (licht-stetig): ihr Himmel unter
    // dem Horizont fällt 0,43–0,52 Dekaden je Grad (gemessen am Messer, GTX 1feab29c, Wiese: 96 lx bei −3,6°, 11 lx −5,8°, 2,1 lx
    // −7,2°, 0,37 lx −8,6°) — wie die Natur (Brown 1952 in USNO Circular 171: 3 lx bei −6°, 0,008 lx bei −12°, rund 0,4 Dekaden je
    // Grad). Bis licht-stetig lag darauf ein zweites Dämmerlicht (3 lx bei −6°, linear in der Dämmerung der Tag-Achse bis −18° auf
    // 0): bei −12° trug es 1,3 lx statt 0,008 und fiel im letzten Schritt der Uhr vor −18° ganz — das Bild sprang dort bis
    // 1,89 EV (GTX 1feab29c, Wiese 0,2 → 0,202 +1,75 EV). Die tiefe Nacht trägt der Mond.
    function nachtHimmel(achse) {
        return STERNENLICHT.leuchtdichte * (1 - Math.max(0, Math.min(1, achse.daemmerung)));
    }
    // DIE LICHTGLOCKE (nacht-gasse-licht) — DER NACHT-SOCKEL DES HIMMELS ÜBER DEM ORT, ein eigener Term neben dem Sternen-Licht:
    // was die Leuchten des Orts nach oben werfen, streut in DERSELBEN Luft zum Auge zurück (Einfach-Streuung wie Garstang 1986,
    // PASP 98:364, „Model for artificial night-sky illumination“). Je Quelle `[I, s]` — ihre Lichtstärke in cd (die Leuchte des
    // Gesetzes strahlt nach oben wie nach unten) und ihr waagrechter Abstand zum Auge in m — die Zenit-Leuchtdichte
    // L = I · ∫ β(z) p(Θ) T(z) (1 + 2 ρ cos ψ) ÷ (s² + z²) dz über die Höhe z: β die Streuung der Luft des Gesetzes (foundry-core
    // `ATMO_GESETZ`: Rayleigh `luft.betaRayleigh` mit `rayleighH`; der Dunst der klaren Luft — Koschmieder −ln(`kontrast`) ÷
    // `sichtKlarM` über dem Rayleigh — × `mieAlbedo` mit `luft.skalenHoeheM`), p die Phase (Rayleigh 3 ÷ 16π · (1 + cos² Θ),
    // Henyey-Greenstein `mieG`; cos Θ = −z ÷ √(s² + z²): das Licht geht hinauf, der Blick hinab), T der Durchlass hinauf und
    // zurück, ρ der Boden der Atmosphäre (`ATMO_BODEN`: was der Boden unter der Leuchte nach oben zurückwirft, Lambert, cos ψ =
    // z ÷ √(s² + z²)). Gerechnet im Logarithmus der Höhe (`GLOCKE.schritte` Mittelpunkte von s ÷ 100 bis 60 km) → cd/m², EINMAL
    // je Luft als Tafel über den Abstand (`GLOCKE.s`, `GLOCKE.stufen` Stufen im Logarithmus; dazwischen log-log, J ~ 1/s) — die
    // Wahl der Leuchten (40 Quellen) kostet so ein Nachschlagen je Quelle statt 6 ms Integral. Nicht gerechnet: das Fenster
    // (sein Licht geht waagrecht hinaus) und die Wolke (unter der Decke wirft sie die Glocke vielfach zurück). Bezug: der klare
    // Stadthimmel 1,1·10⁻² cd/m² (Jechow u. a. 2020), der Himmel ohne Leuchten das Sternen-Licht oben (1,6·10⁻⁴).
    // `stufe`: die Glocke der Welt steht in Viertel-Stufen (EV) — die Himmels-Sicht zeichnet nur, wenn sie eine Stufe wandert.
    const GLOCKE = Object.freeze({ schritte: 48, s: Object.freeze([1, 20000]), stufen: 64, stufe: 0.25 });
    function glockeKern(s, G) {
        const L = G.luft;
        const bR = L.betaRayleigh;
        const bD = Math.max(0, -Math.log(L.kontrast) / L.sichtKlarM - bR);
        const [hR, hD, g] = [G.rayleighH, L.skalenHoeheM, G.mieG];
        const rho = lumaVon(ATMO_BODEN);
        // die optische Tiefe von 0 bis z (senkrecht)
        const tau = (z) => bR * hR * (1 - Math.exp(-z / hR)) + bD * hD * (1 - Math.exp(-z / hD));
        const [a, b] = [Math.log(s / 100), Math.log(60000)];
        const du = (b - a) / GLOCKE.schritte;
        let J = 0;
        for (let i = 0; i < GLOCKE.schritte; i++) {
            const z = Math.exp(a + (i + 0.5) * du);
            const d = Math.hypot(s, z);
            const c = -z / d; // cos Θ
            const pR = (3 / (16 * Math.PI)) * (1 + c * c);
            const pD = (1 - g * g) / (4 * Math.PI * (1 + g * g - 2 * g * c) ** 1.5);
            const streu = bR * Math.exp(-z / hR) * pR + bD * G.mieAlbedo * Math.exp(-z / hD) * pD;
            const T = Math.exp(-tau(z) * (1 + d / z));
            // dz = z · du (der Logarithmus der Höhe)
            J += (streu * T * (1 + 2 * rho * (z / d)) * z * du) / (d * d);
        }
        return J;
    }
    const glockeTafeln = new WeakMap();
    function lichtGlocke(quellen, G = KERN.ATMO_GESETZ) {
        let t = glockeTafeln.get(G);
        if (!t) {
            const [a, b] = GLOCKE.s.map(Math.log);
            t = { a, du: (b - a) / GLOCKE.stufen, lnJ: new Float64Array(GLOCKE.stufen + 1) };
            for (let i = 0; i <= GLOCKE.stufen; i++) t.lnJ[i] = Math.log(glockeKern(Math.exp(a + i * t.du), G));
            glockeTafeln.set(G, t);
        }
        let summe = 0;
        for (const [I, s] of quellen) {
            if (!(I > 0)) continue;
            const x = Math.max(0, Math.min(GLOCKE.stufen, (Math.log(Math.max(GLOCKE.s[0], s)) - t.a) / t.du));
            const i = Math.min(GLOCKE.stufen - 1, Math.floor(x));
            summe += I * Math.exp(t.lnJ[i] + (x - i) * (t.lnJ[i + 1] - t.lnJ[i]));
        }
        return summe;
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
            // DAS LICHT JETZT — DIE EINHEIT DER TAFELN (`tafelEinheit`): die Tafeln tragen den Himmel je Einheit des Lichts der
            // Stunde, der Leser (`himmelFarbe`, die Wolke) multipliziert sie. Am Tag ist sie E0 (`_atmoE0`: die Tages-Intensität
            // ist linear und zeichnet keine Tafel neu), unter dem Horizont fällt sie mit der Dämmerung bis auf das Licht der
            // Nacht: die Tafeln sind Halb-Float (kleinste volle Zahl 6·10⁻⁵) — der Mond in der EINEN Skala je Einheit E0 stand bei
            // 10⁻⁷, der Himmel um ihn in Stufen-Ringen (licht-eine-skala, GTX 1050)
            licht: T.uniform(1),
            // die Sonne, der Mond (Purkinje-Hue × MOONLIGHT × Wetter) und das Sternen-Licht (die Zenit-Leuchtdichte des Gesetzes ×
            // der Anteil der Nacht, `_atmoSternenLicht`) in Einheiten von `licht`
            sonneE: T.uniform(1),
            mondE: T.uniform(new THREE.Vector3(0, 0, 0)),
            nachtE: T.uniform(new THREE.Vector3(0, 0, 0)),
            toenung: T.uniform(new THREE.Vector3(1, 1, 1)),
            // das Ergrauen des Himmels unter der Decke des Wetters (0 klar … 1 grau, `himmelGrau`; die Bühne trägt 0)
            grau: T.uniform(0),
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
            const tau = texture(rtT.texture, vec2(subUv(xmu, Z.durchlass[0]), subUv(rho.div(H), Z.durchlass[1]))).level(
                float(0)
            ).rgb;
            return select(amBoden(r, mu), vec3(0), exp(tau.negate()));
        };
        // DIE TAFELN MISCHEN IM LOGARITHMUS (licht-stetig): das Licht der Dämmerung fällt exponentiell mit der Sonnenhöhe (0,4–0,5
        // Dekaden je Grad, Brown 1952 / USNO Circular 171), der Filter der GPU mischt zwei Texel linear. Ψ_ms trug 32 Texel linear
        // über cos Sonnen-Zenit — um den Horizont 3,6° weit, die Luft unten im Schatten der Erde lebt dort allein von ihm: linear im
        // Licht gemischt, knickte das Himmelslicht an jedem Texel (Sonne −5,38°: das Bild stieg je 0,002 der Uhr 0,82, dann 1,67 EV,
        // Radeon 7ef6fb25 — Täter-Pass „Himmel“ +0,49 → +1,05; im Logarithmus gemischt blieb der Knick der Steigung, wiese Uhr 0,766
        // −0,10 EV, GTX f53f05ea — darum liegt Ψ_ms quadratisch dicht um den Horizont, `msLage`). Die Durchlass-Tafel trägt die
        // optische Tiefe τ (der Filter mischt sie linear, exakt für das exponentielle Gesetz) und Ψ_ms den Logarithmus über dem Boden
        // ihrer Ablage (`MS_LOG`, bei der kleinsten Stufe des Halb-Floats); ihr EINER Leser (`durchlass`, `mehrfach`) kehrt die Ablage um.
        // Dasselbe Gesetz mischt die Bestrahlungs-Tafel auf der CPU (`bestrahlung`).
        // DER BODEN DER ABLAGE IST EINE ZAHL DES HALB-FLOATS (nachthimmel-einig): ln 2^−24 = −16,6355 liegt zwischen zwei Stufen der
        // Tafel (−16,640625 und −16,625); D3D schneidet zur Null (−16,625), der Leser las e^−16,625 − 2^−24 = 6,24e-10 statt 0 —
        // Licht jeder Quelle im Erdschatten. Nachts ohne Mond wiegt die Sonne E0 ÷ Sternen-Licht = 2,63e8 (`tafelEinheit`): die
        // Himmels-Sicht trug 5,6e-9 Welt-Einheiten Dämmerung bei −22,08°, 20 % über dem Sternen-Licht des Orts (Radeon 12029279:
        // Umgebung 3,288e-8 gegen 2,740e-8; ohne die Sonne 2,728e-8). Der Boden ist darum −16,625 selbst: Ψ = 0 liegt GENAU auf
        // ihm (der Schreiber klemmt, sein Boden einen Hauch darunter), und der Leser zieht einen Hauch mehr ab — 2^−14 deckt den
        // Fehler von exp und log der GPU (≤ 36 ULP, WGSL) in beiden Rundungen.
        // Quelle: USNO Circular 171 (Brown 1952) — unter −18° trägt die Sonne kein Licht mehr zum Himmel, die astronomische Nacht
        const MS_LOG = -16.625;
        const MS_BODEN = Math.exp(MS_LOG);
        const MS_HAUCH = 2 ** -14;
        // die Lage von cos Sonnen-Zenit in Ψ_ms (u ∈ [0, 1]): quadratisch um den Horizont, μ = c·|c| mit c = 2u − 1 — dieselbe Lage
        // wie die Bestrahlungs-Tafel (`bestrahlung`); `passMehrfach` legt jeden Texel an ihre Umkehr
        const msLage = (mus) => mus.sign().mul(mus.abs().min(1).sqrt()).add(1).mul(0.5);
        // Ψ_ms in Zeilen LINEAR in der Höhe (Hillaire): die zweite Zeile liegt bei 3,2 km. Quadratisch (w = √(h/H), Zeilen bei 0,
        // 0,10, 0,42, 0,94 km — w4-ferne-blau, Duv −0,001 am Horizont) löste die Grenzschicht des Dunsts auf und hob im dichten
        // Dunst des Regens das Licht des Himmels: das Regenbild stieg über das der Sonne (werkbank licht --naesse, Radeon: Wiese
        // 0,966 → 1,012, Dorf 0,951 → 1,050; gate:naesse:echt ROT) — heil-w4-ferne-blau.
        const mehrfach = (h, mus) =>
            max(
                exp(
                    texture(
                        rtMS.texture,
                        vec2(subUv(msLage(mus), Z.mehrfach[0]), subUv(h.div(RT - RG), Z.mehrfach[1]))
                    ).level(float(0)).rgb
                ).sub(MS_BODEN * (1 + MS_HAUCH)),
                vec3(0)
            );
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
            return vec4(tau, 1); // die optische Tiefe: `durchlass` liest exp(−τ)
        });
        // ── Ψ_ms: je (cos Sonnen-Zenit, Höhe) die Mehrfachstreuung (Hillaire Gl. 5–9), 8 × 8 Richtungen, Boden = die Erde (`ATMO_ERDE`) ──
        const passMehrfach = Fn(() => {
            const q = uv();
            const cMs = ausUv(q.x, Z.mehrfach[0]).mul(2).sub(1).toVar();
            const mus = cMs.mul(cMs.abs()).toVar();
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
            // der Logarithmus über dem Boden der Ablage (`MS_LOG`, nie darunter): `mehrfach` liest exp(x) − Boden
            return vec4(
                max(T.log(max(Lsum.div(64).div(max(fms.oneMinus(), vec3(1e-4))), vec3(0)).add(MS_BODEN * (1 - MS_HAUCH))), vec3(MS_LOG)),
                1
            );
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
                        if (i === 0) erste = q.gewicht ? q.gewicht.mul(ein) : ein;
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
            const L = marsch(
                v,
                [
                    { dir: U.sonne, gewicht: U.sonneE },
                    { dir: U.mond, gewicht: U.mondE },
                ],
                U.nachtE,
                einfach
            ).toVar();
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
        const himmelFarbe = (dir, tx = null) => umgebungLicht(U, tx ? tx.rgb : himmelJeLicht(dir));
        // DER ANTEIL DER SONNE (0 … 1) an der Himmels-Sicht in Richtung `dir`: ihre einfache Streuung (Alpha der Tafel) — was ein
        // Grat der Luft hinter ihm nimmt (der Luftschatten der Welt); die Mehrfachstreuung und der Mond bleiben.
        const himmelEinfach = (dir, tx = null) => (tx || himmelTexel(dir)).a;
        // ── die Umgebung: Equirekt (three `equirectUV`: u = atan(z, x)/2π + ½, v = asin(y)/π + ½) aus der Himmels-Sicht, JE
        // EINHEIT DES LICHTS wie die Tafeln: das Licht jetzt (E0 · Tönung) trägt jeder ihrer Leser je Bild (`_umgebungLicht`) ──
        const passUmgebung = Fn(() => vec4(himmelJeLicht(umgebungRichtung(uv()).toVar()), 1));
        // ── DIE BESTRAHLUNGS-TAFEL (S7): je Texel eine Sonnenhöhe e (quadratisch dicht um den Horizont, e = c·|c|) und die
        // Bestrahlung einer waagrechten Fläche durch den Himmel dieser Sonne, je Einheit E0 — unter dem Horizont im Maß der
        // Dämmerung (`tafelMass`) —, derselbe Marsch wie die Himmels-
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
            // DAS MASS DER DÄMMERUNG (`tafelMass`, unten): unter dem Horizont wiegt die Quelle ihr Maß — der Marsch ist linear in ihr,
            // der Texel liegt im Maß ab; über dem Horizont und im Sternen-Texel 1
            const mass = select(mus.lessThan(0), T.exp2(clamp(mus, -TAFEL_MASS.tiefe, 0).mul(-TAFEL_MASS.stufenJeSinus)), float(1)).toVar();
            const E = vec3(0).toVar();
            Loop({ start: 0, end: NT * NP, type: "float", name: "k" }, ({ k }) => {
                const a = k.div(NP).floor();
                // DIE RINGE DER DÄMMERUNG: steht die Sonne unter dem Horizont, liegt das Licht des Himmels in einem Band über ihm —
                // die Ringe dort gleich im Raumwinkel (cos θ linear, Gewicht 2 · cos θ: 2,4° · 7,2° · 12° …) statt gleich in der
                // Bestrahlung (der unterste bei 11,8°); über dem Horizont und im Sternen-Texel wie bisher (Gewicht 1)
                const q = a.add(0.5).div(NT).toVar();
                const ct = select(mus.lessThan(0), q, sqrt(float(1).sub(q))).toVar();
                const ring = select(mus.lessThan(0), ct.mul(2), float(1));
                const sv = sqrt(max(float(1).sub(ct.mul(ct)), 0)).toVar();
                const phi = k
                    .sub(a.mul(NP))
                    .add(0.5)
                    .mul((2 * PI) / NP)
                    .toVar();
                E.addAssign(marsch(vec3(sv.mul(phi.cos()), ct, sv.mul(phi.sin())).toVar(), [{ dir: sonne, gewicht: mass }], nacht).mul(ring));
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
        return belichtungGleitung(h, B) * (1 - B.steigung) * Math.log2(q) + belichtungNachFuss(h, B);
    }
    // das Gewicht der Steigung bei der Sonnenhöhe h: 1 über `gleitung[0]`, 0 unter `gleitung[1]`, dazwischen linear
    function belichtungGleitung(h, B = BELICHTUNG) {
        const [oben, unten] = B.gleitung;
        return Math.max(0, Math.min(1, (h - unten) / (oben - unten)));
    }
    // DIE STUFEN NACH DEM FUSS (sonnenbahn 3, Entscheid des Koordinators 25.11.): der Anteil der Knoten der Tag-Achse an den Stufen
    // der Kamera — (1 − Gleitung) × die Stufen der Knoten bei h; am Tag (über `gleitung[0]`) genau 0, in der Nacht der ganze Knoten
    // (−2,17 bei −20°, die REF). Die Tonkurve legt sie HINTER ihren Fuß (`tonKurve`): der Fuß gehört zum Schlüssel der Belichtung,
    // die Schulter zum Schirm. Die Steigung des Tags bleibt im Schlüssel.
    function belichtungNachFuss(h, B = BELICHTUNG) {
        const K = B.stufen;
        let n = K[K.length - 1][1];
        if (h >= K[0][0]) n = K[0][1];
        else
            for (let i = 1; i < K.length; i++)
                if (h >= K[i][0]) {
                    n = K[i][1] + ((K[i - 1][1] - K[i][1]) * (h - K[i][0])) / (K[i - 1][0] - K[i][0]);
                    break;
                }
        return (1 - belichtungGleitung(h, B)) * n;
    }

    // DIE BELICHTUNG AUS DEM LICHT (licht.K1, H1): `w` die Beleuchtungsstärke einer waagrechten Fläche des Orts (rgb), `EA` der
    // Anker (`belichtungAnker`), `e` der Sinus der Sonnenhöhe, `stufen` die Stufen der Kamera (die Welt reicht ihr Glied
    // `AnazhRealm._belichtungStufen`, an dem die Linsen den Schein der Kamera prüfen). → die Belichtung k: die 18-%-Karte unter
    // dem Anker auf `zielKarte` und die Stufen der Kamera gegen ihn; `B` die Eichung (wie `belichtungStufen`). Der Lichtmesser
    // liest nie unter seinem BODEN (UE: Min EV100): `mond` ist das Licht des Vollmonds ohne Wolken-Decke relativ zum Zenit
    // (der Sinus seiner Höhe × sein Durchlass durch die Luft jetzt, 0 unter dem Horizont; die Welt reicht ihn, `_belichtungAusLicht`), der Boden
    // `nachtKnotenE` × `mond` — darunter steht die Blende, das Bild fällt mit dem Licht; darüber folgt die Kamera dem Licht. Der
    // Boden ist eine stetige Funktion der Uhr (er steigt und sinkt mit dem Mond) und liegt unter offenem Himmel nie über dem Licht:
    // die Dämmerung fällt nie durch ihn (bis licht-stetig: fest ab −6°, siehe `BELICHTUNG`). Bis w28-licht-stetig zog ein
    // geometrisches Mittel E^(1−t) · Knoten^t mit t linear ab dem Horizont jede Uhr der Dämmerung zum Knoten (Wiese, Radeon
    // 71839b1e: 0,50 EV je 0,002 der Uhr bei Sonne −0,72° → 0°).
    function belichtung(w, EA, e, stufen, B = BELICHTUNG, mond = 0) {
        const h = (Math.asin(Math.max(-1, Math.min(1, e))) * 180) / Math.PI;
        const E = Math.max(0.2126 * w[0] + 0.7152 * w[1] + 0.0722 * w[2], B.nachtKnotenE * Math.max(0, mond), 1e-12);
        return Math.max(B.min, (B.zielKarte * 2 ** (stufen || belichtungStufen)(h, E / EA)) / ((0.18 / Math.PI) * E));
    }

    // DIE BELICHTUNG IM RAUM (rein, w28-haus-innen-lesbar): `k` und `E` die Belichtung und die Lesung des Messers am Ort OHNE
    // das Richtlicht (im Raum erreicht es ihn nicht; Luma, Welt-Einheiten), `ER` das Licht des Raums auf derselben Karte, `feld`
    // der Anteil der Öffnungen im Feld des Auges. Das Auge steht auf dem Raum: die Kamera gleicht die fehlenden Stufen ganz aus
    // (E ÷ r) und legt die Karte auf den Schlüssel der Leuchtdichte des Raums gegen den des Lichts davor — der Raum mit 300 lx
    // (EN 17037: das Ziel des Tageslichts, Quotient 2,2 % unter 13 900 lx) steht 0,6 Stufen unter der Karte im Schatten vor
    // der Tür, der mit 100 lx 1,0, der mit 10 lx 2,4: ein Raum liest als Raum, ein dunkler als dunkel. Das Feld mittelt
    // logarithmisch (das geometrische Mittel der Leuchtdichten): die Öffnung zählt mit ihrem Flächen-Anteil, sie darf ausbrennen.
    // Der Messer liest nie unter seinem BODEN (`nachtKnotenE`, der Vollmond im Zenit — und nie über dem Licht davor): darunter
    // steht die Blende, der Raum fällt mit seinem Licht. Der Raum ohne Öffnung bleibt dunkel, nachts trägt ihn nur die Lampe.
    // Bis hier trug der Raum die Steigung des Tags über seine fehlenden Stufen (w28-innenlicht: 1 − `steigung` blieb unausgeglichen,
    // die Öffnungen zählten linear): 300 lx standen 1,5 Stufen unter der Karte davor und im Fuß der Tonkurve — Radeon b1f0de0e,
    // Start-Dorf, Mittag: Median des dunkelsten Innen-Blicks 0,003–0,031 in 12 von 15 Häusern mit Blick.
    // Quelle: Krawczyk, Myszkowski, Seidel 2005 („Perceptual Effects in Real-time Tone Mapping“): α(L) = 1,03 − 2 ÷ (2 + log10(L + 1)), L in cd/m²
    function belichtungRaum(k, E, ER, feld = 0, B = BELICHTUNG) {
        if (!(E > 0) || !(ER < E)) return k;
        const f = Math.max(0, Math.min(1, feld));
        const r = Math.max(E ** f * Math.max(ER, 1e-12) ** (1 - f), Math.min(E, B.nachtKnotenE));
        const a = (x) => 1.03 - 2 / (2 + Math.log10((0.18 / Math.PI) * x * EINHEIT_LX + 1));
        return (k * (E / r) * a(r)) / a(E);
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
    // DIE EINHEIT DER TAFELN bei der Sonne über der Atmosphäre E0, ihrer Höhe e (sin) und der des Mondes: über dem Horizont E0;
    // darunter fällt sie mit der Dämmerung (0,4 Dekaden je Grad — das Himmelslicht fällt von 0° bis −12° um rund sieben), nie
    // unter das Licht der Nacht (der Vollmond, steht er am Himmel, sonst das Sternen-Licht). Nur ein Maßstab der Ablage: jeder
    // Leser multipliziert sie zurück (`U.licht`), `anwenden` schreibt Sonne, Mond und Sterne in ihr.
    function tafelEinheit(E0, e, mondY) {
        const h = (Math.asin(Math.max(-1, Math.min(1, e))) * 180) / Math.PI;
        const nacht = Math.max(mondY > 0 ? MOND_E : 0, STERNENLICHT.leuchtdichte * Math.PI);
        return Math.max(E0 * 10 ** (DAEMMER_DEKADEN_JE_GRAD * Math.min(0, h)), nacht);
    }
    // DER FALL DER DÄMMERUNG — EINE Zahl, zwei Leser (die Einheit der Himmels-Tafeln oben, das Maß der Bestrahlungs-Tafel unten).
    // Quelle: Brown 1952 / USNO Circular 171 — das Licht des Himmels fällt unter dem Horizont um 0,4–0,5 Dekaden je Grad
    const DAEMMER_DEKADEN_JE_GRAD = 0.4;
    // DAS MASS DER BESTRAHLUNGS-TAFEL (belichtung-daemmerung): ihre Texel unter dem Horizont liegen × `tafelMass(mu)` ab — der
    // Fall der Dämmerung, aufgehoben: 2 hoch (`stufenJeSinus` × der Sinus der Tiefe der Sonne), gehalten ab −18° (`tiefe`: die
    // astronomische Nacht, darunter streut keine Sonne mehr in den Himmel). Der Leser (`bestrahlung`) teilt nach seiner Mischung
    // zurück; über dem Horizont ist das Maß 1 (dieselben Bits). Im Sinus statt im Winkel: EIN Ausdruck auf GPU und CPU, ohne
    // Arkussinus (bis 18° weicht der Sinus 1,7 % vom Winkel ab — ein Maß der Ablage wie `tafelEinheit`, kein Gesetz des Lichts).
    // Bis hier lag die Tafel je Einheit E0 im Halb-Float: unter −10° fiel das Licht der Sonne im Himmel unter seine kleinste
    // Stufe (5,96e-8), der Messer las dort das Sternen-Licht allein, die Umgebung (ihre Einheit fällt mit der Dämmerung) trug die
    // Sonne weiter — genesis, Radeon, a7b7a4b1: Umgebung ÷ Himmel des Orts 1,14 bei −9,9° · 2,14 bei −11,9° · 5,12 bei −12,5° ·
    // 1,39 bei −15°, die Belichtung stand bis 1,2 Stufen zu hoch und sprang mit der letzten Stufe der Tafel 0,9 Stufen in 6 s.
    const TAFEL_MASS = Object.freeze({
        stufenJeSinus: DAEMMER_DEKADEN_JE_GRAD * Math.log2(10) * (180 / Math.PI),
        tiefe: Math.sin((18 * Math.PI) / 180),
    });
    function tafelMass(mu) {
        return 2 ** (-TAFEL_MASS.stufenJeSinus * Math.max(-TAFEL_MASS.tiefe, Math.min(0, mu)));
    }
    // die Quellen der Tafeln in ihrer Einheit: `U.licht`, `U.sonneE`, `U.mondE` (mond = rgb in Welt-Einheiten), `U.nachtE`
    function tafelLicht(U, E0, mond, nacht) {
        const u = tafelEinheit(E0, U.sonne.value.y, U.mond.value.y);
        U.licht.value = u;
        U.sonneE.value = E0 / u;
        U.mondE.value.set(mond[0] / u, mond[1] / u, mond[2] / u);
        U.nachtE.value.set(nacht[0] / u, nacht[1] / u, nacht[2] / u);
    }

    // DER WINKEL DER SONNE zur Tageszeit t (0 Mitternacht · 0,5 Mittag) — ohne die Stufen der Schatten-Karten (`_sonnenWinkel`
    // der Welt hält ihn über sie) — und die Richtung zu ihr (Einheitsvektor [x, y, z]; y ≤ 0 unter dem Horizont).
    function sonnenWinkel(t) {
        return t * Math.PI * 2 - Math.PI / 2;
    }
    // DIE SONNENBAHN — die EINE Formel der Welt (Licht, Schatten, Himmelskörper, Bühne der Studios). OFFEN (w28-nacht-licht): die Bahn
    // aus Jahr × Breite (Meeus Kap. 13, sin h = sin φ sin δ + cos φ cos δ cos H) stand gebaut und gemessen — Mittag 74,2° → 74,6°,
    // 05 Uhr im Sommer die Dämmerung (Dorf Luma 70 → 88) — und fiel an gate:tag-achse:echt: die Sonne des Sommers geht im
    // Nordosten auf, hinter dem Grat der Mess-Wiese (Azimut 76°) tritt sie bei 10° hervor, der Lichtmesser (seine eigene Messung im Bild)
    // springt 0,55 EV, das Bild 0,34 EV je Schritt der Uhr (Radeon). GEMESSEN (w28-nacht-bilanz, Radeon, Wiese): die nahen Kronen
    // stehen im Messer (2 627 von 2 632 Werfern), der Grat nimmt dort nichts (Sicht 0,199 bei L.y 0,168) — es sprang die binäre
    // Krone (der Karten-Wurf des Messers: Sicht 0,07 → 0,79 über Uhr 0,254 → 0,26, während die Waldkante das Bild über fünf Schritte
    // freigibt). Mit dem Dichte-Profil der Krone fiel der Sprung auf 0,15–0,18 EV (Soll 0,1): die Bahn bleibt draußen, bis der
    // Messer den Wurf der Waldkante so stetig liest, wie das Bild ihn zeigt (32 Strahlen kippen gemeinsam). Seit laub-messer liest
    // er die Sicht des Bildes selbst (`_bildSonnenSicht`, 18 432 Proben der unteren Bildhälfte); seine eigenen Gestalten sind gefallen.
    // DIE BAHN (Meeus Kap. 13): am Stundenwinkel H — 0 am Mittag, westwärts, `winkel` der Uhr − π/2 im Drehsinn des Körpers —,
    // der Breite φ des Ankers und der Deklination δ (`sonnenBahn`): sin h = sin φ sin δ + cos φ cos δ cos H, Osten = −cos δ sin H,
    // Norden = cos φ sin δ − sin φ cos δ cos H. Die Achsen der Welt: x Osten, y oben, −z Norden (die Mittagssonne der Nordhalbkugel
    // steht über +z, wie bis hier).
    // DER ORT DER BÜHNE (die Studios, die Hülle `B.stunden`: sie tragen keinen Ort der Welt): die Gleiche (δ = 0) an der Breite, an der
    // die Mittagssonne der Bühne steht, wo sie bis sonnenbahn stand — 74,21° (die alte Bahn, Neigung 0,4 × sin ½w: tan(90° − h) = 0,4 √½),
    // im Süden, Aufgang im Osten zur Uhr 0,25. Die Welt reicht ihre Bahn (`_sonnenBahn`), die Bühne der Welt dieselbe: sie reist
    // mit dem Himmel der Welt (`himmelBahn`).
    // Ihr Mond (die Bühne trägt keinen Kosmos): der volle, der Sonne gegenüber, ohne Parallaxe.
    const BUEHNE_BAHN = Object.freeze({
        breite: Math.atan(0.4 * Math.SQRT1_2),
        dekl: 0,
        drehsinn: 1,
        mond: Object.freeze({ dekl: 0, stunde: Math.PI, nah: 0 }),
    });
    // DIE BAHN IM HIMMEL DER WELT (sonnenbahn 2): der Zustand des Himmels, den die Welt am Tor reicht (stamm `_portalSendEnter`,
    // `msg.himmel.bahn` = `_sonnenBahn()`), trägt die Bahn ihrer Sonne — die Bühne, die Stunden der Hülle (`B.stunden`) und jede
    // Sonde lesen sie hier; ohne Himmel der Welt (ein Studio für sich) der Ort der Bühne. Fail-closed: eine Bahn, die nicht ganz
    // aus Zahlen ist, bricht laut. Bis hier las die Bühne ein Argument `o.bahn`, das kein Rufer reichte — jede Studio-Bühne stand
    // bei 74,21° im Süden, die Welt (Anker −50,5°, Sommer) bei 55,82° im Norden.
    function himmelBahn(himmel) {
        const b = himmel && himmel.bahn;
        if (b == null) return BUEHNE_BAHN;
        const m = b.mond;
        if (![b.breite, b.dekl, b.drehsinn].every(Number.isFinite) || !m || ![m.dekl, m.stunde, m.nah].every(Number.isFinite))
            throw new Error(
                "DIE BÜHNE DER WELT: die Bahn { breite, dekl, drehsinn, mond { dekl, stunde, nah } } aus Zahlen, nie " + JSON.stringify(b)
            );
        return Object.freeze({
            breite: b.breite,
            dekl: b.dekl,
            drehsinn: b.drehsinn < 0 ? -1 : 1,
            mond: Object.freeze({ dekl: m.dekl, stunde: m.stunde, nah: m.nah }),
        });
    }
    const gleicheBahn = (a, b) =>
        a.breite === b.breite &&
        a.dekl === b.dekl &&
        a.drehsinn === b.drehsinn &&
        a.mond.dekl === b.mond.dekl &&
        a.mond.stunde === b.mond.stunde &&
        a.mond.nah === b.mond.nah;
    // der Ort am Himmel des Orts zum Stundenwinkel H, an der Breite φ, zur Deklination δ (die Achsen oben)
    function himmelsOrt(H, breite, dekl) {
        const sp = Math.sin(breite),
            cp = Math.cos(breite),
            sd = Math.sin(dekl),
            cd = Math.cos(dekl),
            cH = Math.cos(H);
        return [-cd * Math.sin(H), sp * sd + cp * cd * cH, sp * cd * cH - cp * sd];
    }
    function sonnenRichtung(winkel, bahn = BUEHNE_BAHN) {
        if (!bahn || !Number.isFinite(bahn.breite) || !Number.isFinite(bahn.dekl))
            throw new Error("DIE SONNENBAHN: ohne Breite und Deklination steht keine Sonne (`sonnenBahn`)");
        return himmelsOrt((winkel - Math.PI / 2) * (bahn.drehsinn < 0 ? -1 : 1), bahn.breite, bahn.dekl);
    }
    // DIE BAHN DER SONNE aus dem Ort und dem Jahr: die Breite φ des Ankers (rad), die Saison-Phase p (0 die Gleiche des Frühlings ·
    // 0,25 die Sonnwende des Sommers · 0,5 · 0,75 — die Phasen der Saison-Worte 0,125 · 0,375 · 0,625 · 0,875) und der Körper
    // (Schiefe ε `neigungRad`, `drehsinn`, planet-core `planetPlan(...).koerper`): δ = asin(sin ε · sin 2πp), auf der Südhalbkugel
    // gespiegelt — das Saison-Wort ist das des Orts, sein Sommer steht über seinem Pol.
    // DER MOND AUF DERSELBEN BAHN DES HIMMELS (Karte 2 planet.kosmos.systeme#1): `mond` ist seine Lage gegen die Sonne aus der Zeit
    // des Kosmos (`kosmosZeit(...).mond`: der Abstand der Längen, die Breite zur Ekliptik, der Abstand in km). Die Sonne steht an der
    // Länge λ☉ = 2πp (auf der Südhalbkugel + π: ihr Sommer ist der des Südpols), der Mond an λ☉ + Δλ und β; beide in den Äquator
    // gedreht (Schiefe ε, Meeus Kap. 13: α, δ) → seine Deklination und sein Stundenwinkel gegen den der Sonne (H☾ = H☉ + α☉ − α☾,
    // `stunde`) und `nah` = R/d, der Sinus seiner Parallaxe (der Radius des Körpers `radiusKm`). Bis kosmos-bahn stand der Mond
    // stets der Sonne gegenüber (−Sonne, der ewige Vollmond: keine Phase, kein eigener Lauf).
    function sonnenBahn(breite, phase, koerper, mond) {
        const hem = breite < 0 ? -1 : 1;
        if (!mond || ![mond.dLaenge, mond.breite, mond.abstandKm, koerper.radiusKm].every(Number.isFinite))
            throw new Error(
                "DIE BAHN DES HIMMELS: ohne den Mond der Zeit (`kosmosZeit(...).mond`) und den Radius des Körpers steht kein Mond, nie " +
                    JSON.stringify({ mond, radiusKm: koerper.radiusKm })
            );
        const ce = Math.cos(koerper.neigungRad),
            se = Math.sin(koerper.neigungRad);
        const lS = 2 * Math.PI * phase + (hem < 0 ? Math.PI : 0),
            lM = lS + mond.dLaenge,
            cb = Math.cos(mond.breite),
            sb = Math.sin(mond.breite);
        const xm = cb * Math.cos(lM),
            ym = cb * Math.sin(lM) * ce - sb * se,
            zm = cb * Math.sin(lM) * se + sb * ce;
        let stunde = Math.atan2(ce * Math.sin(lS), Math.cos(lS)) - Math.atan2(ym, xm);
        stunde -= 2 * Math.PI * Math.round(stunde / (2 * Math.PI));
        return {
            breite,
            dekl: hem * Math.asin(Math.sin(koerper.neigungRad) * Math.sin(2 * Math.PI * phase)),
            drehsinn: koerper.drehsinn < 0 ? -1 : 1,
            mond: { dekl: Math.asin(Math.max(-1, Math.min(1, zm))), stunde, nah: koerper.radiusKm / mond.abstandKm },
        };
    }
    // DER MOND AM HIMMEL DES ORTS: EINE Formel für sein Licht und seinen Körper — der Ort zu seinem Stundenwinkel (der der Sonne +
    // `stunde`) und seiner Deklination, gesehen vom Boden (topozentrisch: der Beobachter steht R über der Mitte, die Richtung
    // verschiebt sich um `nah` zum Horizont, Meeus Kap. 40 — bis 0,95° beim Mond der Erde). Fail-closed: eine Bahn ohne Mond bricht.
    function mondRichtung(winkel, bahn = BUEHNE_BAHN) {
        const m = bahn && bahn.mond;
        if (!m || ![m.dekl, m.stunde, m.nah].every(Number.isFinite))
            throw new Error("DER MOND: ohne seine Bahn { dekl, stunde, nah } steht kein Mond (`sonnenBahn` mit `kosmosZeit(...).mond`)");
        const g = himmelsOrt((winkel - Math.PI / 2) * (bahn.drehsinn < 0 ? -1 : 1) + m.stunde, bahn.breite, m.dekl);
        const y = g[1] - m.nah,
            n = Math.hypot(g[0], y, g[2]);
        return [g[0] / n, y / n, g[2] / n];
    }

    // DIE EINE TAG-ACHSE (S7, W7): jede Größe des Lichts über den Tag ist EINE Funktion der Sonnenhöhe e = sin(Höhe) — die Kanäle
    // grenze (die Grenzgröße der Sterne), daemmerung (1 im hellen Tag … 0 in astronomischer Nacht), tag (das Nacht-Auge der
    // Post-Kette), nacht (die Nacht der Zeitpläne: 0 über dem Horizont, 1 am Ende der bürgerlichen Dämmerung) und hell (die
    // Leuchtdichte des Tageshimmels relativ zum Mittag). Die Geschichte der Kanäle steht am Leser der Welt (`_tagAchse`).
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
        // DER KANAL `nacht` lebt in der Dämmerung (bürgerlich: die Sonne 0° … −6°): über dem Horizont tragen Sonne und Himmel
        // allein. Bis ferne.K4 begann er bei 14,5° (sin 0,25) — bei Sonne +5° lag ein Ambient 0,149 auf jedem Schatten; die
        // Ersatz-Lichter, die er blendete (Ambient, Hemisphäre), fielen in licht-eine-skala.
        const nachtE = Math.sin((-6 * Math.PI) / 180);
        const hN = 0;
        const nG = A[A.length - 1][0];
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
    // ZWISCHEN ZWEI TEXELN mischt sie GEOMETRISCH (licht-stetig): das Licht der Dämmerung fällt exponentiell mit der Sonnenhöhe
    // (0,4–0,5 Dekaden je Grad, Brown 1952 / USNO Circular 171; die Tafel selbst trägt 0,43–0,52), ein Texel liegt am Ende der
    // bürgerlichen Dämmerung 1,2° weit — das Licht fällt dort je Texel um das 3,4-Fache. Linear im Licht gemischt, stieg der
    // Messer am Anfang jedes Texels doppelt, an seinem Ende halb so steil wie das Licht: die Belichtung fiel 1,52 und 1,09 EV,
    // wo das Bild 1,1 und 1,4 stieg (genesis Uhr 0,232 → 0,236, GTX, Täter-Pass „Belichtung“). Im Logarithmus gemischt, über dem
    // Boden der Auflösung der Tafel (2^−24, die kleinste Stufe ihres Halb-Floats), folgt er der Steigung des Lichts in jedem Texel.
    // IM MASS DER TAFEL (belichtung-daemmerung): gemischt wird, was abliegt — unter dem Horizont die Bestrahlung × `tafelMass`,
    // dort ändert sie sich bis −18° je Texel höchstens um das 1,7-Fache (je Einheit E0 um das 6- bis 7-Fache; Radeon, genesis:
    // abgelegt 1,4e-2 bei −3° · 1,7e-3 bei −10,6° · 8,6e-4 bei −15,9°) —, danach teilt der Leser das Maß an SEINER Sonnenhöhe zurück.
    const TAFEL_BODEN = 2 ** -24;
    function bestrahlung(T, U, out) {
        const W = T.W,
            w = T.werte;
        const lies = (mu, c) => {
            const x = ((Math.sign(mu) * Math.sqrt(Math.min(1, Math.abs(mu))) + 1) / 2) * (W - 2);
            const i = Math.max(0, Math.min(W - 3, Math.floor(x)));
            const f = Math.max(0, Math.min(1, x - i));
            const a = Math.max(0, w[i * 3 + c]) + TAFEL_BODEN;
            const b = Math.max(0, w[(i + 1) * 3 + c]) + TAFEL_BODEN;
            return Math.max(0, a * (b / a) ** f - TAFEL_BODEN) / tafelMass(mu);
        };
        const ms = U.sonne.value.y,
            mm = U.mond.value.y;
        const m = U.mondE.value,
            n = U.nachtE.value,
            t = U.toenung.value;
        for (let c = 0; c < 3; c++) {
            const k = c === 0 ? "x" : c === 1 ? "y" : "z";
            out[c] =
                U.licht.value *
                t[k] *
                (U.sonneE.value * lies(ms, c) + m[k] * lies(mm, c) + n[k] * w[(W - 1) * 3 + c]);
        }
        return himmelGrau(out, U.grau.value);
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
    // DAS LICHT JETZT AUF EINER FARBE DES HIMMELS (je Einheit E0): × E0 × Tönung, dann das Ergrauen unter der Decke des Wetters
    // (`U.grau`: zur eigenen Leuchtdichte, die Helligkeit bleibt) — EIN Gesetz für die Kuppel (`himmelFarbe`), die Umgebung der
    // Stoffe, die Sonde der Welt und den Spiegel des Tors; `himmelGrau` dasselbe auf Zahlen (die Bestrahlung, die Irradianz).
    // Bis w28-licht-regen ein Faktor (`toenung · licht`): unter Sturm blieb der Himmel so satt wie klar.
    function umgebungLicht(U, farbe) {
        const TSL = globalThis.THREE.TSL;
        const c = farbe.mul(U.licht).mul(U.toenung);
        return TSL.mix(c, TSL.vec3(TSL.dot(c, TSL.vec3(0.2126, 0.7152, 0.0722))), U.grau);
    }
    function himmelGrau(rgb, grau) {
        const y = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
        for (let c = 0; c < 3; c++) rgb[c] += (y - rgb[c]) * grau;
        return rgb;
    }
    function umgebungZeichnen(gen, A, ziel) {
        return gen.fromEquirectangular(A.rtEq.texture, ziel || null);
    }
    function himmelDerStoffe(quelle, U, richtung, stufe) {
        return umgebungLicht(U, globalThis.THREE.TSL.pmremTexture(quelle, richtung, stufe));
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
        // DAS LICHT DER WOLKE VON UNTEN (w28-wolke-licht, `himmelSicht`): die optische Dicke τ = `tauJeMenge` · Menge (die volle
        // Menge 0,92 → τ ≈ 92, Schönwetter-Kumulus 20–100), die Asymmetrie `g` der Tröpfchen (Mie, 0,85)
        tauJeMenge: 100,
        g: 0.85,
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
            // DAS BAND DER GALAXIE (stern-bild, `kosmosBandKnoten`): das ungelöste Sternlicht hinter der Luft — durch ihren Durchlass
            // in Blickrichtung, unter den Wolken (die Wolke mischt über ihm); die Bühne eines Studios trägt keine Galaxie (`H.band`)
            if (H.band) sicht.addAssign(kosmosBandKnoten(H.band, vDir).mul(A.durchlass(A.U.hKm.add(A.RG), vDir.y)));
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
                const tSonne = A.durchlass(rW, U.sonne.y).toVar();
                const lichtWolke = tSonne
                    .mul(max(U.sonne.y, 0))
                    .mul(U.sonneE)
                    .add(U.mondE.mul(A.durchlass(rW, U.mond.y)).mul(max(U.mond.y, 0)))
                    .mul(U.licht.div(Math.PI))
                    .add(A.himmelFarbe(vec3(0, 1, 0)));
                // DIE WOLKE VON UNTEN (w28-wolke-licht): der Spieler sieht ihre Unterseite — sie leuchtet mit dem DURCHGELASSENEN
                // Licht ihrer Oberseite, nie mit dem zurückgeworfenen. τ = `tauJeMenge` · Menge; der diffuse Durchlass des Zwei-
                // Strom-Gesetzes für erhaltende Streuung T = 1 / (1 + ¾(1 − g)τ); was sie nicht durchlässt, wirft sie zurück — auch
                // das Licht des Bodens (Albedo der Welt) zurück nach unten. Dünne Ränder tragen den Vorwärts-Schein zur Sonne
                // (Henyey-Greenstein, einfache Streuung τ·e^−τ): der helle Saum; dicke Kerne werden grau. Der Ton der Wolke bleibt
                // das Gesetz des Studios (`cloudColor`), nur als Farbe — seine Helligkeit ist die des Lichts. Bis hier trug sie
                // die Oberseite (Lambert, Albedo 1): die volle Wolke 5,8× die 18-%-Karte, 11,5–20 % der Wolken-Pixel in der
                // Schulter der Tonkurve — flache weiße Kerne, der Tonumfang nur am Rand (Radeon, Genesis Mittag).
                const Yw = vec3(0.2126, 0.7152, 0.0722);
                const tau = cloudAmt.mul(WOLKEN_SCHICHT.tauJeMenge).toVar();
                const g = WOLKEN_SCHICHT.g;
                const durch = float(1)
                    .div(tau.mul(0.75 * (1 - g)).add(1))
                    .toVar();
                const boden = dot(U.albedo, Yw);
                const diffus = lichtWolke.mul(durch.add(durch.oneMinus().mul(boden)));
                const nu = dot(vDir, normalize(U.sonne));
                const hg = float((1 - g * g) / (4 * Math.PI)).div(
                    max(float(1 + g * g).sub(nu.mul(2 * g)), 1e-4).pow(1.5)
                );
                const saum = tSonne.mul(U.licht).mul(U.sonneE).mul(hg).mul(tau.mul(tau.negate().exp())).mul(max(U.sonne.y, 0).sign());
                const ton = cloudColor.div(max(dot(cloudColor, Yw), 1e-4));
                sicht.assign(mix(sicht, diffus.add(saum).mul(ton), cloudAmt));
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
    // `f0` (ein Knoten, der Glanz EINER Fläche aus der Zeile des Stoffs): der Stoff ist eine SCHEIBE und zeichnet nach ihrem Gesetz.
    function durchsicht(mat, op, f0) {
        mat.transparent = true;
        mat.opacity = op;
        mat.forceSinglePass = true;
        if (f0) scheibe(mat, f0);
        return mat;
    }
    // DAS GESETZ DER SCHEIBE (fahrzeug-gestalt, das EINE Glas der Welt: Fenster der Häuser, Scheiben der Wagen, der Kopf der
    // Laterne). Eine Scheibe hat zwei Flächen; jede spiegelt nach Fresnel F(θ) = F₀ + (1 − F₀)(1 − n·v)⁵ (Schlick), F₀ der Fläche
    // aus der Zeile glas des Stoff-Gesetzes (n 1,49 → 0,039, der Wirt `_glasOptik`); beide zusammen F₀ der Scheibe = 2F₀/(1 + F₀)
    // ≈ 0,075 (Stokes, ohne Absorption — gemessen: Floatglas 8 % bei senkrechtem Blick). Im Bild steht:
    //   der Glanz der Scheibe (die Umgebung, die das Spiel jedem Stoff rechnet, `_spiegelUmgebung`, × F) und ihr Leuchten GANZ,
    //   der Körper des Gesetzbuchs (Tönung, Staub) mit seiner Deckkraft a, das Dahinter mit (1 − F)(1 − a):
    //   Bild = Glanz + Leuchten + a·Körper + (1 − F)(1 − a)·Dahinter — die Blende α = 1 − (1 − F)(1 − a), das Fragment ÷ α vor der
    //   Luft (der Nebel der Mischung steht so mit α im Bild, das Dahinter trägt seinen eigenen).
    // Bis hier mischte r184 die ganze Scheibe mit ihrer Deckkraft: der Glanz stand mit 0,42 im Bild (das Fenster des Hauses
    // spiegelte 1,7 % statt 8 %, der Himmel fehlte ihm), der Wagen glich es mit eigenen Zahlen aus (Umgebung × 3, ein Klarlack auf
    // dem Glas — ein zweiter Glanz neben dem der Welt), das Leuchten der Fenster teilte sich durch die Deckkraft (`_leuchtStoff`), und
    // das Dahinter blieb bei streifendem Blick so hell wie von vorn. Der Glanz einer Fläche ist F₀ der Zeile, nie r184s 0,04.
    function scheibe(mat, f0) {
        const T = globalThis.THREE.TSL;
        if (mat.isNodeMaterial !== true) throw new Error("welt-licht scheibe: kein Knoten-Stoff — die Scheibe zeichnet nach TSL");
        const eins = T.float(1);
        const F0 = f0.mul(2).div(f0.add(1));
        const nv = T.normalView.dot(T.positionViewDirection).abs().min(1);
        const F = F0.add(eins.sub(F0).mul(eins.sub(nv).pow(5)));
        const art = Object.getPrototypeOf(mat);
        mat.setupVariants = function (b) {
            art.setupVariants.call(this, b);
            T.specularColor.assign(T.vec3(F0));
            T.specularColorBlended.assign(T.mix(T.vec3(F0), T.diffuseColor.rgb, T.metalness));
            T.diffuseContribution.assign(T.diffuseContribution.mul(T.diffuseColor.a));
        };
        mat.setupOutput = function (b, aus) {
            const a = eins.sub(eins.sub(F).mul(eins.sub(aus.a)));
            return art.setupOutput.call(this, b, T.vec4(aus.rgb.div(a), a));
        };
        // das Gesetz ist Teil der Identität des Programms: r184 schlüsselt nur die Knoten des Stoffs, nie seine Bau-Schritte
        mat.customProgramCacheKey = function () {
            return art.customProgramCacheKey.call(this) + "|scheibe";
        };
        mat.userData.scheibe = f0;
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
    // Welt (`o.uhr`, Vorgabe Mittag — das Wort jeder Sonde: Mittag · Sonne · Sommer): wo die Tag-Achse die Nacht trüge (der
    // Mond als Richtlicht, die Zeitpläne der Leuchtquellen), bricht sie laut, sie trägt die Nacht nicht. Das Auge steht am
    // Bezug der Luft (1 m, die Höhe des Ankers). Gezeichnet werden die Tafeln einmal beim Ruf (der Renderer steht: nach
    // `init()`); die Belichtung liegt, sobald die Bestrahlungs-Tafel zurückkam (`steht`, ein Versprechen) — bis dahin zeichnet
    // die Bühne kein Bild (`belichtung` null).
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
        // die Bahn der Bühne: die der Welt, die sie zeichnet — sie reist mit ihrem Himmel (`himmelBahn`), sonst der Ort der Bühne
        const bahn = himmelBahn(o.himmel);
        const s = sonnenRichtung(winkel, bahn);
        const m = mondRichtung(winkel, bahn);
        const achse = tagAchse(s[1]);
        if (!(achse.nacht === 0 && achse.daemmerung === 1))
            throw new Error(
                `DIE BÜHNE DER WELT steht im Tag: die Uhr ${uhr} trägt die Nacht (nacht ${achse.nacht.toFixed(3)}, ` +
                    `Dämmerung ${achse.daemmerung.toFixed(3)}) — die Nacht zeichnet nur die Welt`
            );
        const hKm = 0.001;
        const A = atmoTafeln({ G, M });
        const U = A.U;
        U.hKm.value = hKm;
        U.sonne.value.set(s[0], s[1], s[2]);
        U.mond.value.set(m[0], m[1], m[2]);
        const E0 = e0(1);
        const mi = MOONLIGHT.intensity;
        const sw = nachtHimmel(achse);
        tafelLicht(
            U,
            E0,
            [MOONLIGHT.r * mi, MOONLIGHT.g * mi, MOONLIGHT.b * mi],
            [STERNENLICHT.r * sw, STERNENLICHT.g * sw, STERNENLICHT.b * sw]
        );
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
        tonKurveSetzen(R, THREE);
        R.outputColorSpace = THREE.SRGBColorSpace;
        // `knoten` (die Umgebung jedes Stoffs) und `staerke` (die Sonne des Gesetzes) liest die Treue der Bühne (`buehneZeichnet`):
        // die Bühne zeichnet unter diesem Licht allein — Identität, nie ein Nachbau
        const B = {
            sonne,
            staerke: sonne.intensity,
            richtung: new THREE.Vector3(s[0], s[1], s[2]),
            bahn, // die Bahn ihrer Sonne (`himmelBahn`): die Linse der Studios liest sie gegen die der Welt
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
            // die Bahn steht mit dem Licht (Tafeln, Umgebung, Sonne): ein Himmel auf einer anderen Bahn baut das Licht neu (die
            // Hülle: `B.himmel` → `B.uhr`), nie still unter der alten Sonne
            if (!gleicheBahn(himmelBahn(h), bahn))
                throw new Error(
                    "DIE BÜHNE DER WELT: der Himmel trägt eine andere Bahn als das Licht, das steht (" +
                        JSON.stringify(h.bahn) +
                        ") — eine neue Bahn baut das Licht neu"
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
            B.tonStufen = tonStufenSetzen(s[1]); // die Stufen hinter dem Fuß der Kurve an der Stunde der Bühne (`tonKurve`)
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
        if (tonStufen().n !== B.tonStufen) fremd.add(`die Stufen hinter dem Fuß ${tonStufen().n} statt ${B.tonStufen}`);
        if (fremd.size)
            throw new Error(`DIE BÜHNE DER WELT zeichnet unter dem Licht der Welt allein: ${[...fremd].join(" · ")}`);
        if (q) {
            B.imFlug++;
            const los = () => B.imFlug--;
            q.onSubmittedWorkDone().then(los, los);
        }
        return true;
    }

    // ═══════════════════════════════════════ DER KOSMOS (kosmos-umfang) ═══════════════════════════════════════
    // DIE WELT IST EINE FUNKTION IHRER SAAT — auch über dem Himmel. `kosmos(saat, heim)` → die Heim-Galaxie, eine Scheibe aus Sternen
    // nach den Raumdichten der Sonnenumgebung (`KOSMOS.klassen`); `kosmosStern(K, i)` → der Stern i (Ort in der Galaxie in pc,
    // Klasse, absolute Größe, Lichtwechsel); `kosmosSystem(K, i)` → sein System (Planeten auf Kepler-Bahnen, Monde, Ringe);
    // `kosmosHimmel(K)` → was das bloße Auge vom Heim-Planeten aus sieht; `kosmosZeit(K, t)` → Lichtwechsel und Planeten am Tag t.
    // NICHTS ist gespeichert: die Zahl der Sterne ist der Bereich des Index. Je Klasse teilt EIN Binomial-Baum die Sterne über die
    // Galaxie — jeder Knoten teilt seine Zahl auf zwei Hälften nach dem Gewicht der Dichte, gewürfelt aus Saat und Pfad —, und der
    // Stern i der Index-Sicht ist DERSELBE wie der Punkt am Himmel (die Orts-Sicht steigt nur in die Knoten in Sichtweite).
    // Bis kosmos-umfang würfelte der Himmel 2 800 Punkte gleichverteilt auf eine Kuppel von 480 m (Mulberry32 aus der Saat) und drei
    // feste Wandelsterne: kein Stern hatte einen Ort, kein Planet eine Bahn, keine Galaxie eine Ebene.
    // Determinismus: Zufall nur über Ganzzahl-Hashes (Math.imul), die Gleitkomma-Funktionen sind die der Engine (V8: dieselben Bits
    // auf jedem Gerät derselben Version) — dieselbe Saat gibt byte-gleich denselben Kosmos.
    // `KM` = Math als Bindung des Moduls: im Faden-Kontext (node vm, `fadenScope`) ist jeder Griff an den globalen `Math` ein Abfang
    // des Kontexts — der Himmel kostete so 233 statt 63 ms (spike kosmos-umfang, anazh-realm-seed).
    const KM = Math;
    const KOSMOS = Object.freeze({
        // die schwächste Größe im Feld: die Grenzgröße der tiefen Nacht (`GRENZGROESSE`, −18° → +6) plus die halbe Klasse, um die
        // der Stern-Knoten der Welt unter seiner Grenze noch leuchtet (`_buildStarField`: die Schwelle ½ Klasse unter der Grenze)
        feldGrenze: GRENZGROESSE[GRENZGROESSE.length - 1][1] + 0.5,
        // die Beleuchtungsstärke eines Sterns der Größenklasse 0 am Auge in lx (die photometrische Skala der visuellen Größenklasse:
        // m = −2,5 · log10(E) − 13,98) — das Licht jedes Punkts des Felds UND des Bands (bis stern-bild `HIMMEL.sternLx0` im Stamm)
        sternLx0: 2.54e-6,
        blatt: 8, // ein Knoten mit höchstens so vielen Sternen ist ein Blatt (die Sterne liegen gleichverteilt in seiner Zelle)
        // DIE STUFE DER GRÖSSE: je Klasse teilt sich der Bereich in Stufen von höchstens so viel mag, jede ein eigener Baum mit eigener
        // Sichtweite (die schwache Stufe einer Klasse sieht man nur nah — der Himmel steigt nie in Kästen, deren hellster möglicher
        // Stern unter der Grenze bleibt)
        stufeMag: 0.5,
        // die Scheibe: Skalenlänge (pc) und Sternzahl (log10) aus der Saat; die Dichte am Heim-Ort relativ zur Tafel
        scheibe: Object.freeze({ hR: [2000, 3500], log10N: [10.5, 11.5], heimDichte: [0.7, 1.4], heimZ: 20 }),
        // DER STAUB: Auslöschung in der Ebene je pc und seine Skalenhöhe (V-Band; 1 mag/kpc, 100 pc — gesetzt, Lehrbuch-Wert)
        staub: Object.freeze({ magJePc: 0.001, hoehePc: 100 }),
        // DIE KLASSEN: Raumdichte am Heim-Ort (pc⁻³), Skalenhöhe (pc), absolute Größe M_V von–bis, T_eff (K), Masse (M☉), Lichtwechsel
        // [Art, Anteil, Periode d von–bis, Amplitude mag von–bis]. Gesetzt nach den Raumdichten der Sonnenumgebung (Allen,
        // Astrophysical Quantities, aus dem Gedächtnis, ungeprüft); die Bedeckung (`bedeckung`) trägt jede Klasse.
        klassen: Object.freeze(
            [
                ["O V", 2e-8, 50, -6, -4.5, 35000, 30, []],
                ["B V früh", 1.5e-5, 60, -4.5, -1.5, 20000, 9, []],
                ["B V spät", 8.5e-5, 70, -1.5, 0.5, 13000, 3.5, []],
                ["A V", 5e-4, 120, 0.5, 2.5, 8500, 2, []],
                ["F V", 2.5e-3, 190, 2.5, 4.2, 6600, 1.3, []],
                ["G V", 6.3e-3, 300, 4.2, 5.8, 5700, 0.95, []],
                ["K V", 1e-2, 330, 5.8, 8.8, 4400, 0.7, []],
                ["M V", 5e-2, 350, 8.8, 16, 3200, 0.3, []],
                ["G/K III", 2.4e-4, 300, -0.5, 1.5, 4700, 1.5, []],
                [
                    "M III",
                    1.2e-5,
                    300,
                    -2,
                    -0.5,
                    3500,
                    1.4,
                    [
                    ["halbregelmaessig", 0.4, 40, 200, 0.2, 1.2],
                    ["mira", 0.06, 150, 500, 2.5, 6],
                ],
                ],
                ["Überriesen", 1e-7, 60, -8, -5, 9000, 15, [["cepheide", 0.15, 3, 45, 0.4, 1.2]]],
                ["Weiße Zwerge", 5e-3, 300, 11, 16, 10000, 0.6, []],
            ].map(([name, n, hz, Mlo, Mhi, T, masse, wechsel]) =>
                Object.freeze({ name, n, hz, M: Object.freeze([Mlo, Mhi]), T, masse, wechsel: Object.freeze(wechsel) })
            )
        ),
        bedeckung: Object.freeze(["bedeckung", 0.01, 1, 12, 0.2, 1.5]),
        // DAS SYSTEM: Planeten innen/außen um den Anker, Abstand der Bahnen als Perioden-Verhältnis, die Schneegrenze (AE · √L)
        system: Object.freeze({ innen: [0, 3], aussen: [2, 7], verhaeltnis: [1.35, 2.65], schnee: 2.7, aMin: 0.03, aMax: 60 }),
        // DER MOND DER HEIMAT (Karte 2 planet.kosmos.systeme#1): der Körper der Heimat ist der der Erde (planet-core `PLANET_ERDE`),
        // sein Mond der der Erde — die Halbachse 384 400 km und die siderische Periode 27,3217 d (NASA NSSDC, Moon Fact Sheet; die
        // synodische folgt aus dem Jahr: 1/(1/27,3217 − 1/365) = 29,53 d); Exzentrizität und Neigung zur Ekliptik aus dem Samen in
        // der Spanne, in der die Störung der Sonne die wahre Bahn schwingen lässt (e 0,026 … 0,077 um 0,0549, i 4,99° … 5,30° um
        // 5,145°, Orbit of the Moon); Knoten, Perizentrum und mittlere Anomalie gleichverteilt. Kepler, ohne den Lauf der Knoten.
        mond: Object.freeze({ aKm: 384400, P: 27.3217, e: Object.freeze([0.026, 0.077]), inklGrad: Object.freeze([4.99, 5.3]) }),
        // DER TON EINES PLANETEN am Himmel (die Farben der drei Wandelsterne bis kosmos-umfang): Fels zwischen rostig (Albedo 0,1,
        // nackter Stein) und weißgelb (Albedo 0,5, Wolkendecke), Gasriese cremeweiß, Eisriese blassblau
        planetTon: Object.freeze({
            fels: Object.freeze([Object.freeze([1.0, 0.66, 0.46]), Object.freeze([1.0, 0.97, 0.88])]),
            gasriese: Object.freeze([1.0, 0.94, 0.82]),
            eisriese: Object.freeze([0.8, 0.9, 1.0]),
        }),
        // der Heim-Stern ist der sonnengleiche Stern der Funktion (G V, M_V 4,83 ± 0,1) nächst dem Heim-Ort der Saat
        heimStern: Object.freeze({ klasse: 5, M: 4.83, toleranz: 0.1 }),
    });
    const KOSMOS_ERDRADIUS_KM = 6371;
    const KOSMOS_AE_KM = 149597870.7; // die astronomische Einheit (IAU 2012, Resolution B2)
    // ganzzahliger Hash (32 bit) aus vier Zahlen, und der gleichverteilte Wurf in (0, 1)
    function kHash(a, b, c, d) {
        let h = KM.imul((a ^ 0x9e3779b9) >>> 0, 0x85ebca6b);
        h = KM.imul(h ^ (h >>> 13) ^ b, 0xc2b2ae35);
        h = KM.imul(h ^ (h >>> 16) ^ c, 0x27d4eb2f);
        h = KM.imul(h ^ (h >>> 15) ^ d, 0x165667b1);
        h ^= h >>> 16;
        h = KM.imul(h, 0x85ebca6b);
        h ^= h >>> 13;
        h = KM.imul(h, 0xc2b2ae35);
        h ^= h >>> 16;
        return h >>> 0;
    }
    const kU = (a, b, c, d) => (kHash(a, b, c, d) + 0.5) / 4294967296;
    function kSaat(saat) {
        let h = 0x811c9dc5;
        const s = String(saat);
        for (let i = 0; i < s.length; i++) h = KM.imul(h ^ s.charCodeAt(i), 0x01000193);
        return h >>> 0;
    }
    // ∫ exp(−|z|/h) dz von z0 bis z1
    function kIz(z0, z1, h) {
        const F = (z) => (z >= 0 ? h * (1 - KM.exp(-z / h)) : -h * (1 - KM.exp(z / h)));
        return F(z1) - F(z0);
    }
    // ∫∫ exp(−√(x² + y²)/hR) dx dy über das Rechteck: Gauß 2×2 je Zelle ≤ hR (größere Zellen teilen sich)
    const KG = 0.5 / KM.sqrt(3);
    function kIxy(x0, x1, y0, y1, hR) {
        const dx = x1 - x0,
            dy = y1 - y0;
        if (dx > hR || dy > hR) {
            const xm = dx > hR ? (x0 + x1) / 2 : x1,
                ym = dy > hR ? (y0 + y1) / 2 : y1;
            let s = kIxy(x0, xm, y0, ym, hR);
            if (xm < x1) s += kIxy(xm, x1, y0, ym, hR);
            if (ym < y1) s += kIxy(x0, xm, ym, y1, hR);
            if (xm < x1 && ym < y1) s += kIxy(xm, x1, ym, y1, hR);
            return s;
        }
        const cx = (x0 + x1) / 2,
            cy = (y0 + y1) / 2,
            ax = dx * KG,
            ay = dy * KG;
        const xa = (cx - ax) * (cx - ax),
            xb = (cx + ax) * (cx + ax),
            ya = (cy - ay) * (cy - ay),
            yb = (cy + ay) * (cy + ay);
        const s =
            KM.exp(-KM.sqrt(xa + ya) / hR) + KM.exp(-KM.sqrt(xa + yb) / hR) + KM.exp(-KM.sqrt(xb + ya) / hR) + KM.exp(-KM.sqrt(xb + yb) / hR);
        return (s * dx * dy) / 4;
    }
    // DER BINOMIAL-WURF (n Sterne, Anteil p der linken Hälfte, zwei Würfe): klein exakt über die Verteilung, groß über die Normale,
    // dünn (Erwartung < 20 auf einer Seite) über Poisson — immer in [0, n]
    function kBinom(n, p, u1, u2) {
        if (n <= 0 || !(p > 0)) return 0;
        if (p >= 1) return n;
        if (n < 40) {
            const q = 1 - p;
            let pk = KM.pow(q, n),
                c = pk,
                k = 0;
            while (u1 > c && k < n) {
                k++;
                pk *= ((n - k + 1) / k) * (p / q);
                c += pk;
            }
            return k;
        }
        const m = n * p;
        if (m < 20 || n - m < 20) {
            const links = m < 20,
                lam = links ? m : n - m;
            let pk = KM.exp(-lam),
                c = pk,
                k = 0;
            while (u1 > c && k < n) {
                k++;
                pk *= lam / k;
                c += pk;
            }
            return links ? k : n - k;
        }
        const z = KM.sqrt(-2 * KM.log(u1)) * KM.cos(2 * KM.PI * u2);
        return KM.max(0, KM.min(n, KM.round(m + KM.sqrt(m * (1 - p)) * z)));
    }
    // die Drehung aus drei Würfen (Shoemake: gleichverteilt über alle Drehungen) als 3×3-Matrix (Zeilen)
    function kDrehung(u1, u2, u3) {
        const a = KM.sqrt(1 - u1),
            b = KM.sqrt(u1);
        const x = a * KM.sin(2 * KM.PI * u2),
            y = a * KM.cos(2 * KM.PI * u2),
            z = b * KM.sin(2 * KM.PI * u3),
            w = b * KM.cos(2 * KM.PI * u3);
        return [
            1 - 2 * (y * y + z * z),
            2 * (x * y - z * w),
            2 * (x * z + y * w),
            2 * (x * y + z * w),
            1 - 2 * (x * x + z * z),
            2 * (y * z - x * w),
            2 * (x * z - y * w),
            2 * (y * z + x * w),
            1 - 2 * (x * x + y * y),
        ];
    }
    const KOSMOS_MEMO = new Map();
    // DIE GALAXIE DER SAAT: Skalenlänge, Sternzahl, Dichte am Heim-Ort → der Heim-Radius R0 (die Scheibe trägt dort genau die
    // gewürfelte Dichte: N = Σ_c n_c · 2h_z,c · 2π hR² · e^(R0/hR)); je Stufe (Klasse × Größen-Stufe, `stufeMag`) ihre Zahl (größter
    // Rest, Σ = N) und ihr Index-Bereich. `heim` = der Körper des Heim-Planeten, den die Welt trägt ({ jahrTage }, das Jahr des
    // Ort-Gesetzes).
    function kosmos(saat, heim) {
        if (typeof saat !== "string" || !saat) throw new Error("kosmos: die Saat fehlt");
        if (!heim || !(heim.jahrTage > 0)) throw new Error("kosmos: der Körper des Heim-Planeten fehlt (jahrTage)");
        const schluessel = saat + "|" + heim.jahrTage;
        if (KOSMOS_MEMO.has(schluessel)) return KOSMOS_MEMO.get(schluessel);
        const s = kSaat(saat),
            S = KOSMOS.scheibe,
            KL = KOSMOS.klassen;
        const u = (k) => kU(s, 0x6a1a, k, 0);
        const hR = S.hR[0] + (S.hR[1] - S.hR[0]) * u(1);
        const N = KM.round(KM.pow(10, S.log10N[0] + (S.log10N[1] - S.log10N[0]) * u(2)));
        const f = S.heimDichte[0] + (S.heimDichte[1] - S.heimDichte[0]) * u(3);
        const flaeche = KL.reduce((a, c) => a + c.n * f * 2 * c.hz, 0);
        const R0 = hR * KM.log(N / (flaeche * 2 * KM.PI * hR * hR));
        const zHeim = (u(4) - 0.5) * 2 * S.heimZ;
        // die Stufen: je Klasse gleich breite Größen-Stufen (≤ stufeMag), die Zahl der Klasse gleich über ihre Stufen (M gleichverteilt)
        const stufen = [];
        KL.forEach((c, k) => {
            const z = KM.max(1, KM.ceil((c.M[1] - c.M[0]) / KOSMOS.stufeMag - 1e-9));
            for (let q = 0; q < z; q++)
                stufen.push({ k, q, M: [c.M[0] + ((c.M[1] - c.M[0]) * q) / z, c.M[0] + ((c.M[1] - c.M[0]) * (q + 1)) / z], teil: z });
        });
        const roh = stufen.map((S) => (N * KL[S.k].n * 2 * KL[S.k].hz) / (flaeche / f) / S.teil);
        const zahl = roh.map(KM.floor);
        let rest = N - zahl.reduce((a, b) => a + b, 0);
        for (const e of roh.map((r, si) => [r - KM.floor(r), si]).sort((a, b) => b[0] - a[0] || a[1] - b[1]))
            if (rest-- > 0) zahl[e[1]]++;
        let ab = 0;
        for (let si = 0; si < stufen.length; si++) {
            const S = stufen[si];
            Object.assign(S, { zahl: zahl[si], ab, zMax: 12 * KL[S.k].hz });
            ab += zahl[si];
            Object.freeze(S.M);
            Object.freeze(S);
        }
        const B = R0 + 5 * hR;
        const K = {
            saat,
            s,
            heim: { jahrTage: heim.jahrTage },
            galaxie: { hR, R0, zHeim, N, heimDichte: f, kasten: B },
            stufen: Object.freeze(stufen),
            klassen: KL.map((c, k) => {
                const eigen = stufen.filter((S) => S.k === k);
                return { k, zahl: eigen.reduce((a, S) => a + S.zahl, 0), stufen: eigen.map((S) => stufen.indexOf(S)) };
            }),
            zahl: { sterne: N, systeme: N },
            _gewicht: new Map(),
        };
        // der Heim-Stern: der sonnengleiche Stern nächst dem Heim-Ort (wachsender Suchradius; nur die Stufen, die M ± Toleranz tragen)
        const HS = KOSMOS.heimStern;
        let bester = null;
        for (let r = 16; !bester && r <= 4096; r *= 2)
            for (const si of K.klassen[HS.klasse].stufen) {
                const S = stufen[si];
                if (S.M[1] < HS.M - HS.toleranz || S.M[0] > HS.M + HS.toleranz) continue;
                kOrtsSicht(K, si, R0, 0, zHeim, r, (st) => {
                    if (KM.abs(st.M - HS.M) > HS.toleranz) return;
                    const d = KM.hypot(st.x - R0, st.y, st.z - zHeim);
                    if (!bester || d < bester.d || (d === bester.d && st.i < bester.st.i)) bester = { st, d };
                });
            }
        if (!bester) throw new Error("kosmos: kein sonnengleicher Stern binnen 4 kpc um den Heim-Ort (Saat " + saat + ")");
        K.heim.stern = bester.st;
        K.heim.i = bester.st.i;
        // die Ebene des Heim-Systems in der Galaxie (seine Drehung, `kosmosSystem`) — der Rahmen des Felds ist die Ekliptik
        K.heim.system = kosmosSystem(K, bester.st.i);
        if (KOSMOS_MEMO.size >= 4) KOSMOS_MEMO.delete(KOSMOS_MEMO.keys().next().value);
        KOSMOS_MEMO.set(schluessel, K);
        return K;
    }
    // das Gewicht der Fläche eines Kastens (das xy-Integral der Scheibe); Kästen über hR gemerkt je Kosmos an ihren Kanten — die
    // Teilung ist dyadisch aus demselben Kasten, dieselbe Fläche hat in jeder Stufe dieselben Bits
    function kGewichtXY(K, x0, x1, y0, y1) {
        const hR = K.galaxie.hR;
        if (x1 - x0 <= hR && y1 - y0 <= hR) return kIxy(x0, x1, y0, y1, hR);
        const key = x0 + "," + x1 + "," + y0 + "," + y1;
        let w = K._gewicht.get(key);
        if (w === undefined) K._gewicht.set(key, (w = kIxy(x0, x1, y0, y1, hR)));
        return w;
    }
    // DER KNOTEN-SCHRITT der Stufe si: teilt den Kasten an seiner längsten Achse und würfelt die Zahl der linken Hälfte → [nL, Kasten L,
    // Kasten R]. Die Dichte ist ein Produkt (Scheibe × Höhe): beide Hälften teilen das Integral der Achsen, die nicht geteilt werden
    // — der Anteil der linken Hälfte ist das Verhältnis der geteilten Achse allein (z: geschlossen, xy: das Flächen-Integral).
    function kTeile(K, si, b, n, tiefe, lo, hi) {
        const k = K.stufen[si].k;
        const ex = b[1] - b[0],
            ey = b[3] - b[2],
            ez = b[5] - b[4];
        const achse = ex >= ey && ex >= ez ? 0 : ey >= ez ? 2 : 4;
        const m = (b[achse] + b[achse + 1]) / 2;
        const L = b.slice(),
            R = b.slice();
        L[achse + 1] = m;
        R[achse] = m;
        const loR = tiefe < 32 ? (lo | (1 << tiefe)) >>> 0 : lo,
            hiR = tiefe < 32 ? hi : (hi | (1 << (tiefe - 32))) >>> 0;
        let wL, wR;
        if (achse === 4) {
            const h = KOSMOS.klassen[k].hz;
            wL = kIz(L[4], L[5], h);
            wR = kIz(R[4], R[5], h);
        } else {
            wL = kGewichtXY(K, L[0], L[1], L[2], L[3]);
            wR = kGewichtXY(K, R[0], R[1], R[2], R[3]);
        }
        const a = (K.s ^ KM.imul(si + 1, 0x632be5ab) ^ KM.imul(tiefe + 1, 0x9e3779b1)) >>> 0;
        const nL = kBinom(n, wL + wR > 0 ? wL / (wL + wR) : 0.5, kU(a, 1, lo, hi), kU(a, 2, lo, hi));
        return [nL, L, R, loR, hiR];
    }
    // je Klasse die Lichtwechsel samt der Bedeckung, die jede trägt (einmal gebaut statt je Stern)
    const KOSMOS_WECHSEL = KOSMOS.klassen.map((c) => Object.freeze([...c.wechsel, KOSMOS.bedeckung]));
    // DER STERN eines Blatts der Stufe si: Ort gleichverteilt in der Zelle, absolute Größe in der Spanne der Stufe, Lichtwechsel nach
    // Anteil. `sieb(x, y, z, M)` (die Orts-Sicht des Himmels): erst Ort und Größe — fällt der Stern durch, wird der Rest nie gewürfelt
    // (dieselben Würfe, dieselben Bits: der Stern, der das Sieb besteht, ist byte-gleich der der Index-Sicht).
    function kBlattStern(K, si, b, tiefe, lo, hi, j, i, sieb) {
        const S = K.stufen[si],
            k = S.k,
            c = KOSMOS.klassen[k];
        const a = (K.s ^ KM.imul(si + 1, 0x632be5ab) ^ KM.imul(tiefe + 1, 0x9e3779b1) ^ 0x5a5a5a5a) >>> 0;
        const jj = j << 4;
        const x = b[0] + (b[1] - b[0]) * kU(a, jj | 1, lo, hi),
            y = b[2] + (b[3] - b[2]) * kU(a, jj | 2, lo, hi),
            z = b[4] + (b[5] - b[4]) * kU(a, jj | 3, lo, hi),
            M = S.M[0] + (S.M[1] - S.M[0]) * kU(a, jj | 4, lo, hi);
        if (sieb && !sieb(x, y, z, M)) return null;
        const st = {
            klasse: k,
            i,
            x,
            y,
            z,
            M,
            T: c.T * (0.9 + 0.2 * kU(a, jj | 5, lo, hi)),
            masse: c.masse * (0.8 + 0.4 * kU(a, jj | 6, lo, hi)),
            wechsel: null,
        };
        let r = kU(a, jj | 7, lo, hi);
        for (const v of KOSMOS_WECHSEL[k]) {
            if (r < v[1]) {
                st.wechsel = {
                    art: v[0],
                    P: v[2] + (v[3] - v[2]) * kU(a, jj | 8, lo, hi),
                    amp: v[4] + (v[5] - v[4]) * kU(a, jj | 9, lo, hi),
                    phase: kU(a, jj | 10, lo, hi),
                };
                break;
            }
            r -= v[1];
        }
        return st;
    }
    // DIE ORTS-SICHT: jeder Stern der Stufe si binnen r pc um (x, y, z) → fn(stern); steigt nur in Knoten, deren Kasten die Kugel
    // trifft. `sieb` (optional) urteilt am Blatt vor dem vollen Stern (`kBlattStern`).
    function kOrtsSicht(K, si, x, y, z, r, fn, sieb) {
        const KK = K.stufen[si],
            B = K.galaxie.kasten;
        const stapel = [[[-B, B, -B, B, -KK.zMax, KK.zMax], KK.zahl, 0, 0, 0, KK.ab]];
        while (stapel.length) {
            const [b, n, tiefe, lo, hi, ab] = stapel.pop();
            if (n <= 0) continue;
            const dx = KM.max(b[0] - x, 0, x - b[1]),
                dy = KM.max(b[2] - y, 0, y - b[3]),
                dz = KM.max(b[4] - z, 0, z - b[5]);
            if (dx * dx + dy * dy + dz * dz > r * r) continue;
            if (n <= KOSMOS.blatt || tiefe >= 63) {
                for (let j = 0; j < n; j++) {
                    const st = kBlattStern(K, si, b, tiefe, lo, hi, j, ab + j, sieb);
                    if (st) fn(st);
                }
                continue;
            }
            const [nL, L, R, loR, hiR] = kTeile(K, si, b, n, tiefe, lo, hi);
            stapel.push([R, n - nL, tiefe + 1, loR, hiR, ab + nL]);
            stapel.push([L, nL, tiefe + 1, lo, hi, ab]);
        }
    }
    // DIE INDEX-SICHT: der Stern i ∈ [0, K.zahl.sterne) — derselbe Baum, derselbe Wurf, derselbe Stern wie am Himmel
    function kosmosStern(K, i) {
        if (!(i >= 0 && i < K.zahl.sterne) || i !== KM.floor(i))
            throw new Error("kosmosStern: Index " + i + " außerhalb [0, " + K.zahl.sterne + ")");
        // die Stufe: die letzte, deren Bereich bei oder vor i beginnt (eine leere Stufe teilt ihren Anfang mit der nächsten)
        let u = 0,
            o = K.stufen.length - 1;
        while (u < o) {
            const mi = (u + o + 1) >> 1;
            if (K.stufen[mi].ab <= i) u = mi;
            else o = mi - 1;
        }
        const si = u,
            KK = K.stufen[si],
            B = K.galaxie.kasten;
        let b = [-B, B, -B, B, -KK.zMax, KK.zMax],
            n = KK.zahl,
            j = i - KK.ab,
            tiefe = 0,
            lo = 0,
            hi = 0;
        while (n > KOSMOS.blatt && tiefe < 63) {
            const [nL, L, R, loR, hiR] = kTeile(K, si, b, n, tiefe, lo, hi);
            if (j < nL) (b = L), (n = nL);
            else (b = R), (n = n - nL), (j -= nL), (lo = loR), (hi = hiR);
            tiefe++;
        }
        return kBlattStern(K, si, b, tiefe, lo, hi, j, i);
    }
    // die Auslöschung (mag) auf d pc unter der galaktischen Breite mit sin b = sb (Staub-Scheibe am Heim-Ort)
    function kStaub(d, sb) {
        const D = KOSMOS.staub,
            a = KM.abs(sb);
        return a * d < 1e-3 * D.hoehePc ? D.magJePc * d : (D.magJePc * D.hoehePc * (1 - KM.exp((-d * a) / D.hoehePc))) / a;
    }
    // DIE HELLIGKEIT DES LICHTWECHSELS am Tag t (mag über dem Maximum)
    function kWechsel(v, t) {
        let p = t / v.P + v.phase;
        p -= KM.floor(p);
        if (v.art === "bedeckung") {
            const d = KM.abs(p - 0.5),
                w = 0.06;
            return d < w ? v.amp * (1 - (d / w) * (d / w)) : 0;
        }
        // Mira und Cepheide steigen rasch und fallen langsam (40 % der Periode Anstieg), halbregelmäßig als Sinus
        const q = v.art === "halbregelmaessig" ? p : p < 0.6 ? (p / 0.6) * 0.5 : 0.5 + ((p - 0.6) / 0.4) * 0.5;
        return v.amp * 0.5 * (1 - KM.cos(2 * KM.PI * q));
    }
    // DAS SYSTEM DES STERNS i: Planeten um einen Anker (am Heim-Stern der Heim-Planet mit dem Jahr des Ort-Gesetzes), innen und außen
    // im gewürfelten Perioden-Verhältnis; Fels innerhalb der Schneegrenze, außerhalb Gas- und Eisriesen mit Monden und Ringen; die Ebene
    // des Systems in der Galaxie (`ebene`, Zeilen: galaktisch → Ekliptik). Bahnen in AE, Perioden in Tagen, Winkel rad.
    function kosmosSystem(K, i) {
        const st = kosmosStern(K, i),
            SY = KOSMOS.system;
        const lo = i % 4294967296 >>> 0,
            hi = KM.floor(i / 4294967296) >>> 0;
        const a0 = (K.s ^ 0x51ed270b) >>> 0;
        let z = 0;
        const w = () => kU(a0, z++, lo, hi);
        const L = KM.pow(10, -0.4 * (st.M - 4.83));
        const heimat = i === K.heim.i;
        const jahrE = 365.256; // das siderische Jahr der Erde um die Sonne (1 AE, 1 M☉): Kepler P² ∝ a³/M
        const aAnker = heimat ? KM.cbrt(KM.pow(K.heim.jahrTage / jahrE, 2) * st.masse) : (0.5 + 2 * w()) * KM.sqrt(L);
        const nIn = SY.innen[0] + KM.floor(w() * (SY.innen[1] - SY.innen[0] + 1));
        const nAus = SY.aussen[0] + KM.floor(w() * (SY.aussen[1] - SY.aussen[0] + 1));
        const halbachsen = [aAnker];
        for (let k = 0, a = aAnker; k < nIn; k++) {
            a /= KM.pow(SY.verhaeltnis[0] + (SY.verhaeltnis[1] - SY.verhaeltnis[0]) * w(), 2 / 3);
            if (a < SY.aMin) break;
            halbachsen.unshift(a);
        }
        for (let k = 0, a = aAnker; k < nAus; k++) {
            a *= KM.pow(SY.verhaeltnis[0] + (SY.verhaeltnis[1] - SY.verhaeltnis[0]) * w(), 2 / 3);
            if (a > SY.aMax) break;
            halbachsen.push(a);
        }
        const schnee = SY.schnee * KM.sqrt(L);
        const planeten = halbachsen.map((a, j) => {
            const anker = a === aAnker;
            const r = w();
            let art, radius, albedo, masse, monde, ring;
            if (a < schnee || r >= 0.85) {
                art = "fels";
                radius = a < schnee ? 0.35 + 1.4 * w() : 0.2 + 0.8 * w();
                albedo = 0.1 + 0.4 * w();
                masse = KM.pow(radius, 3.7);
                monde = KM.floor(3 * w() * w());
                ring = false;
            } else if (r < 0.55) {
                art = "gasriese";
                radius = 6 + 6 * w();
                albedo = 0.35 + 0.2 * w();
                masse = 30 + 1500 * w() * w();
                monde = 8 + KM.floor(140 * w() * w());
                ring = w() < 0.6;
            } else {
                art = "eisriese";
                radius = 3 + 1.5 * w();
                albedo = 0.3 + 0.2 * w();
                masse = 10 + 10 * w();
                monde = 5 + KM.floor(25 * w());
                ring = w() < 0.6;
            }
            const heimPlanet = heimat && anker;
            return {
                j,
                art,
                heim: heimPlanet,
                a,
                P: K.heim.jahrTage * KM.pow(a / halbachsen[halbachsen.indexOf(aAnker)], 1.5),
                e: (heimPlanet ? 0.03 : 0.12) * w() * w(),
                inkl: heimPlanet ? 0 : ((4 * KM.PI) / 180) * w(),
                knoten: 2 * KM.PI * w(),
                peri: 2 * KM.PI * w(),
                M0: 2 * KM.PI * w(),
                radius,
                albedo,
                masse,
                // die Heimat trägt ihren Mond (`mond` unten) — der Wurf der Zahl bleibt, damit jeder Wurf danach seine Zahl hält
                monde: heimPlanet ? KM.max(1, monde) : monde,
                ring,
            };
        });
        const ebene = kDrehung(w(), w(), w());
        // DER MOND DER HEIMAT auf seiner Bahn um sie (`KOSMOS.mond`), gewürfelt NACH der Ebene: jede Zahl davor bleibt bitgleich
        const mond = heimat ? kMond(w) : null;
        return { stern: st, L, masse: st.masse, schnee, planeten, heim: planeten.findIndex((p) => p.heim), ebene, mond };
    }
    // die Kepler-Elemente des Monds der Heimat (Halbachse in AE, Periode in Tagen, Winkel rad; dieselbe Gestalt wie ein Planet: `kBahn`
    // legt ihn um die Heimat in denselben Rahmen der Ekliptik)
    function kMond(w) {
        const MO = KOSMOS.mond,
            G = KM.PI / 180;
        return Object.freeze({
            a: MO.aKm / KOSMOS_AE_KM,
            P: MO.P,
            e: MO.e[0] + (MO.e[1] - MO.e[0]) * w(),
            inkl: (MO.inklGrad[0] + (MO.inklGrad[1] - MO.inklGrad[0]) * w()) * G,
            knoten: 2 * KM.PI * w(),
            peri: 2 * KM.PI * w(),
            M0: 2 * KM.PI * w(),
        });
    }
    // galaktisch → Rahmen des Felds (die Ekliptik des Heim-Systems, ŷ ihr Pol): die Zeilen der Ebene
    function kInsFeld(E, x, y, z, out, o) {
        out[o] = E[0] * x + E[1] * y + E[2] * z;
        out[o + 1] = E[3] * x + E[4] * y + E[5] * z;
        out[o + 2] = E[6] * x + E[7] * y + E[8] * z;
    }
    // DER HIMMEL DES HEIM-PLANETEN: jeder Stern der Funktion, der im Maximum seines Lichts heller als `feldGrenze` steht — Richtung im
    // Rahmen des Felds, Größe im Maximum (`mag`), Temperatur (`kelvin`, T_eff — seine Farbe ist die des EINEN Planck-Orts, fachwerk
    // `lichtFarbe` über `_lichtLinear`; bis stern-bild trug er einen eigenen milden Ton `kTon`, 3 500 K Luma-normiert (1,06 · 0,98 ·
    // 0,80): 4–8 von 1 000 Punkten getönt), Index; je Stufe nur die Knoten in ihrer Sichtweite (der hellste Stern der
    // Stufe ohne Staub). Gemerkt im Kosmos.
    function kosmosHimmel(K) {
        if (K._himmel) return K._himmel;
        const H = K.heim.stern,
            E = K.heim.system.ebene,
            G = KOSMOS.feldGrenze;
        const dir = [],
            mag = [],
            kelvin = [],
            index = [],
            wechsel = [];
        const t = [0, 0, 0];
        let hell6 = 0;
        // das Sieb am Blatt: Entfernung und Größe aus Ort und M allein (der volle Stern nur für die Punkte des Felds)
        let d = 0,
            m = 0;
        K.stufen.forEach((S, si) => {
            const r = KM.pow(10, (G - S.M[0] + 5) / 5);
            const sieb = (x, y, z, M) => {
                const dx = x - H.x,
                    dy = y - H.y,
                    dz = z - H.z;
                const d2 = dx * dx + dy * dy + dz * dz;
                if (!(d2 > 0) || d2 > r * r) return false;
                const mu = M + 2.5 * KM.log10(d2) - 5; // M + Entfernungsmodul (5 log10(d/10)) — der Staub legt nur zu
                if (mu > G) return false;
                d = KM.sqrt(d2);
                m = mu + kStaub(d, dz / d);
                return m <= G;
            };
            kOrtsSicht(
                K,
                si,
                H.x,
                H.y,
                H.z,
                r,
                (st) => {
                    if (st.i === H.i) return;
                    kInsFeld(E, (st.x - H.x) / d, (st.y - H.y) / d, (st.z - H.z) / d, t, 0);
                    dir.push(t[0], t[1], t[2]);
                    mag.push(m);
                    kelvin.push(st.T);
                    index.push(st.i);
                    if (st.wechsel) wechsel.push([mag.length - 1, st.wechsel]);
                    if (m <= 6) hell6++;
                },
                sieb
            );
        });
        // die Folge des Felds: nach Index (die Orts-Sicht steigt je Klasse in Stapel-Folge — die Folge des Felds ist die des Index)
        const ord = index.map((_, n) => n).sort((a, b) => index[a] - index[b]);
        const um = new Int32Array(ord.length);
        ord.forEach((alt, neu) => (um[alt] = neu));
        const n = ord.length;
        const R = { n, hell6, richtung: new Float32Array(3 * n), mag: new Float32Array(n), kelvin: new Float32Array(n), index: new Float64Array(n) };
        ord.forEach((alt, neu) => {
            for (let q = 0; q < 3; q++) {
                R.richtung[3 * neu + q] = dir[3 * alt + q];
            }
            R.kelvin[neu] = kelvin[alt];
            R.mag[neu] = mag[alt];
            R.index[neu] = index[alt];
        });
        R.wechsel = wechsel.map(([alt, v]) => [um[alt], v]).sort((a, b) => a[0] - b[0]);
        R.hellste = n ? KM.min(...R.mag) : Infinity;
        K._himmel = R;
        return R;
    }
    // die Lage eines Planeten im Heim-System am Tag t (AE, Rahmen der Ekliptik des Heim-Planeten: x Richtung des Knotens 0, ŷ Pol)
    function kBahn(p, t, out) {
        const M = p.M0 + (2 * KM.PI * t) / p.P;
        let E = M;
        for (let k = 0; k < 8; k++) E -= (E - p.e * KM.sin(E) - M) / (1 - p.e * KM.cos(E));
        const xb = p.a * (KM.cos(E) - p.e),
            yb = p.a * KM.sqrt(1 - p.e * p.e) * KM.sin(E);
        const cw = KM.cos(p.peri),
            sw = KM.sin(p.peri),
            cO = KM.cos(p.knoten),
            sO = KM.sin(p.knoten),
            ci = KM.cos(p.inkl),
            si = KM.sin(p.inkl);
        const x1 = xb * cw - yb * sw,
            y1 = xb * sw + yb * cw;
        // in der Ebene der Ekliptik (x, z), der Pol ŷ: um den Knoten geneigt
        out[0] = x1 * cO - y1 * ci * sO;
        out[2] = x1 * sO + y1 * ci * cO;
        out[1] = y1 * si;
    }
    // DIE ZEIT DES HIMMELS am Tag t (Tage seit der Epoche der Saat): die Größe jedes Wechselsterns (`wechselMag`, in der Folge von
    // `himmel.wechsel`) und jeder Planet des Heim-Systems außer der Heimat — Richtung im Rahmen des Felds und scheinbare Größe
    // (H aus Durchmesser und Albedo, Lambert-Phase). `hellste` = der hellste Punkt des Himmels an diesem Tag.
    function kosmosZeit(K, t) {
        const H = kosmosHimmel(K),
            SY = K.heim.system;
        const wechselMag = new Float32Array(H.wechsel.length);
        H.wechsel.forEach(([n, v], q) => (wechselMag[q] = H.mag[n] + kWechsel(v, t)));
        const rH = [0, 0, 0],
            rP = [0, 0, 0];
        kBahn(SY.planeten[SY.heim], t, rH);
        const planeten = [];
        let hellste = H.hellste;
        for (const p of SY.planeten) {
            if (p.heim) continue;
            kBahn(p, t, rP);
            const dx = rP[0] - rH[0],
                dy = rP[1] - rH[1],
                dz = rP[2] - rH[2];
            const D = KM.hypot(dx, dy, dz),
                r = KM.hypot(rP[0], rP[1], rP[2]);
            const cosA = (rP[0] * dx + rP[1] * dy + rP[2] * dz) / (r * D);
            const alpha = KM.acos(KM.max(-1, KM.min(1, cosA)));
            const phase = (KM.sin(alpha) + (KM.PI - alpha) * KM.cos(alpha)) / KM.PI;
            const Hmag = 5 * KM.log10(1329 / (2 * p.radius * KOSMOS_ERDRADIUS_KM * KM.sqrt(p.albedo)));
            const m = Hmag + 5 * KM.log10(r * D) - 2.5 * KM.log10(KM.max(phase, 1e-6));
            const PT = KOSMOS.planetTon;
            const q = KM.max(0, KM.min(1, (p.albedo - 0.1) / 0.4));
            const ton = p.art === "fels" ? PT.fels[0].map((v, c) => v + (PT.fels[1][c] - v) * q) : PT[p.art].slice();
            planeten.push({ j: p.j, art: p.art, richtung: [dx / D, dy / D, dz / D], mag: m, ton, abstandAE: D });
            hellste = KM.min(hellste, m);
        }
        for (let q = 0; q < wechselMag.length; q++) hellste = KM.min(hellste, wechselMag[q]);
        // DER MOND (Karte 2 planet.kosmos.systeme#1): seine Lage um die Heimat (`kBahn`, dieselbe Ekliptik) gegen die Sonne, wie die
        // Heimat sie sieht (−rH) — die Länge im Sinn der Bahnen (x → z) als Abstand zur Sonne (`dLaenge`, −π … π), die Breite zum Pol
        // der Bahnen (ihr Drehimpuls, −ŷ) und der Abstand (km). Der Himmel des Orts stellt ihn an die Sonne, die er zeigt
        // (`sonnenBahn` → `mondRichtung`): die Elongation, also die Phase, ist die der Bahn.
        let mond = null;
        if (SY.mond) {
            const rM = [0, 0, 0];
            kBahn(SY.mond, t, rM);
            const d = KM.hypot(rM[0], rM[1], rM[2]);
            let dl = KM.atan2(rM[2], rM[0]) - KM.atan2(-rH[2], -rH[0]);
            dl -= 2 * KM.PI * KM.round(dl / (2 * KM.PI));
            mond = { dLaenge: dl, breite: KM.asin(-rM[1] / d), abstandKm: d * KOSMOS_AE_KM };
        }
        return { t, wechselMag, planeten, hellste, mond };
    }
    // DAS BAND DER GALAXIE (stern-bild): das ungelöste Licht der Scheibe — die Sterne der Funktion, die schwächer als `feldGrenze`
    // stehen (10¹¹ gegen die 9 000 Punkte des Felds), als Flächen-Helligkeit je Richtung. KEINE Textur: das Integral derselben
    // Dichte, die den Baum der Sterne teilt (je Klasse n · heimDichte · e^(−(R−R0)/hR) · e^(−|z|/hz)), über den Sehstrahl, gedämpft
    // vom Staub der Funktion (`KOSMOS.staub`, derselbe wie `kStaub`), je Klasse ab der Weite `s0`, in der ihr mittlerer Stern
    // (Licht-Mittel über ihre Spanne M) unter die Feldgrenze fällt — davor steht er als Punkt im Feld. Geschlossen: R(s) ≈ R0 + s·c
    // (c der Anteil des Strahls nach außen), der Staub e^(−κ·min(s, hd/|sin b|)). Gegen das Integral in 5-pc-Schritten (Saat
    // anazh-realm-seed, 56 Richtungen): höchstens Faktor 1,18. `kosmosBand(K)` → die Zahlen; `kosmosBandLicht(B, g)` → cd/m² in der
    // galaktischen Richtung g (Einheit); `kosmosBandKnoten(U, d)` → derselbe Ausdruck als TSL (Welt-Einheiten, U aus
    // `kosmosBandUniformen`, d die Welt-Richtung; `U.lage` dreht sie in die Galaxie).
    function kosmosBand(K) {
        if (K._band) return K._band;
        const H = K.heim.stern,
            S = KOSMOS.staub,
            G = KOSMOS.feldGrenze,
            f = K.galaxie.heimDichte,
            l = 0.4 * KM.LN10;
        const R0 = KM.hypot(H.x, H.y);
        const klassen = KOSMOS.klassen.map((c) => {
            const L = (KM.exp(-l * c.M[0]) - KM.exp(-l * c.M[1])) / l / (c.M[1] - c.M[0]); // ⟨10^(−0,4 M)⟩ der Klasse
            return Object.freeze({
                // cd/m² je pc Sehstrahl: n · f Sterne je pc³ × ihr Licht in 10 pc (lx) × (10 pc)² je sr
                a: c.n * f * KOSMOS.sternLx0 * L * 100,
                hz: c.hz,
                s0: KM.pow(10, (G + 2.5 * KM.log10(L) + 5) / 5),
                kelvin: c.T,
            });
        });
        K._band = Object.freeze({
            klassen: Object.freeze(klassen),
            R0,
            hR: K.galaxie.hR,
            kappa: l * S.magJePc,
            hd: S.hoehePc,
            aussen: Object.freeze([H.x / R0, H.y / R0]),
        });
        return K._band;
    }
    const kBandF = (a, s0, s1) =>
        s1 <= s0 ? 0 : KM.abs(a) * (s1 - s0) < 1e-6 ? s1 - s0 : (KM.exp(-a * s0) - KM.exp(-a * s1)) / a;
    function kosmosBandLicht(B, g) {
        const c = g[0] * B.aussen[0] + g[1] * B.aussen[1],
            az = KM.max(KM.abs(g[2]), 1e-4),
            sd = B.hd / az;
        let I = 0;
        for (const k of B.klassen) {
            const a = az / k.hz + c / B.hR;
            I +=
                k.a *
                (kBandF(a + B.kappa, k.s0, KM.min(sd, B.R0)) + KM.exp(-B.kappa * sd) * kBandF(a, KM.max(k.s0, sd), B.R0));
        }
        return I;
    }
    // die Uniforms des Bands: `lage` (Welt → Galaxie, mat3), `galaxie` (1/hR, R0, κ, hd), `aussen` (xy), je Klasse `farbe`
    // (Ton × a ÷ EINHEIT_LX, rgb) und `form` (1/hz, s0) — vor dem ersten Kosmos trägt jede farbe 0
    function kosmosBandUniformen() {
        const T = globalThis.THREE.TSL,
            THREE = globalThis.THREE;
        return {
            lage: T.uniform(new THREE.Matrix3()),
            galaxie: T.uniform(new THREE.Vector4(1, 1, 0, 1)),
            aussen: T.uniform(new THREE.Vector2(1, 0)),
            farbe: KOSMOS.klassen.map(() => T.uniform(new THREE.Vector3())),
            form: KOSMOS.klassen.map(() => T.uniform(new THREE.Vector2(1, 0))),
        };
    }
    function kosmosBandKnoten(U, d) {
        const T = globalThis.THREE.TSL;
        const g = U.lage.mul(d);
        const Gx = U.galaxie;
        const c = g.x.mul(U.aussen.x).add(g.y.mul(U.aussen.y));
        const az = T.max(T.abs(g.z), 1e-4);
        const sd = Gx.w.div(az);
        const sdR = T.min(sd, Gx.y);
        const durch = T.exp(Gx.z.negate().mul(sd));
        // ∫ e^(−a s) ds von s0 bis s1 (a nie 0: ±1e-7 trägt auf 10 kpc weniger als 10⁻³)
        const F = (a, s0, s1) => {
            const a1 = T.select(T.abs(a).lessThan(1e-7), T.float(1e-7), a);
            return T.max(T.exp(a1.negate().mul(s0)).sub(T.exp(a1.negate().mul(s1))).div(a1), 0).mul(T.step(s0, s1));
        };
        let summe = null;
        U.form.forEach((form, k) => {
            const a = az.mul(form.x).add(c.mul(Gx.x));
            const s0 = form.y;
            const I = F(a.add(Gx.z), s0, sdR).add(durch.mul(F(a, T.max(s0, sd), Gx.y)));
            summe = summe ? summe.add(U.farbe[k].mul(I)) : U.farbe[k].mul(I);
        });
        return summe;
    }

    return Object.freeze({
        ATMO_LUT,
        ATMO_BODEN,
        KEY_BASE,
        LEGACY_LICHT,
        BELICHTUNG,
        deckeln,
        tonKurve,
        tonKurveSetzen,
        tonStufen,
        tonStufenSetzen,
        GRENZGROESSE,
        GPU_FRAMES_IM_FLUG,
        EINHEIT_LX,
        MOND_LX,
        MOONLIGHT,
        STERNENLICHT,
        nachtHimmel,
        GLOCKE,
        lichtGlocke,
        schirmDreieck,
        umgebungRichtung,
        atmoTafeln,
        belichtungStufen,
        belichtungNachFuss,
        belichtung,
        belichtungRaum,
        belichtungAnker,
        e0,
        sonnenWinkel,
        sonnenRichtung,
        sonnenBahn,
        BUEHNE_BAHN,
        himmelBahn,
        mondRichtung,
        tafelLicht,
        tagAchse,
        halbZuFloat,
        zeilenSchritt,
        tafelAusPixeln,
        tafelAnker,
        tafelMass,
        bestrahlung,
        umgebungLicht,
        himmelGrau,
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
        KOSMOS,
        kosmos,
        kosmosStern,
        kosmosSystem,
        kosmosHimmel,
        kosmosZeit,
        kosmosBand,
        kosmosBandLicht,
        kosmosBandUniformen,
        kosmosBandKnoten,
    });
})();
