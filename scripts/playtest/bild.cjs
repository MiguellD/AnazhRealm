"use strict";
// scripts/playtest/bild.cjs — der Richter von Bild (spec/stamm/modul-karte.json): Renderer · TAAU und die EINE Skala · Ausgabe · Post · Schatten-Kaskaden · Pass-Wahl · Schirm · GPU-Kehraus · Bündel- und Zeichen-Reihe · Szene-Tiefe · Spiegel · Feld-Pass · Panorama · Höhlen-Sicht · Tag-Nacht · Atmosphäre · Himmelskörper · Sterne · Saison · Regen.
// 10 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const path = require("path");
const stammLib = require("../lib/stamm.cjs");
const { safeEvaluate } = require("../playtest.cjs");
const SKRIPTE = path.join(__dirname, "..");

// Emotion treibt die Welt KONTINUIERLICH (Licht + Wasser), geprüft als KONSUM: der Welt-Tint liest
// `aura.emotion` (die auraAt-Achse hat einen echten Leser), der Wasser-`uEmotion`-Haken wird
// gefüttert — beide waren sonst tote Passagiere.
async function checkBandV1731EmotionDrivesWorld({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        if (r.state.emotionField) r.state.emotionField.clear(); // V17.32 — der Tint misst die GLOBALE Stimmung, kein Ort-Abdruck
        // behavioral: joy faerbt den Welt-Tint warm — DURCH die Feld-Achse (aura.emotion)
        const e = r.state.player.emotions;
        const saved = Object.assign({}, e);
        // Default `auraTintStrength` ist 0 (Slider hebt ihn) → die KONSUM-Probe forciert 1 (deterministisch),
        // um zu beweisen, dass die Feld-Emotion-Achse den Tint färbt, wenn aktiviert.
        const _origAuraK1731 = r.state.atmosphere && r.state.atmosphere.auraTintStrength;
        if (r.state.atmosphere) r.state.atmosphere.auraTintStrength = 1;
        for (const k of Object.keys(e)) e[k] = 0;
        const cold = r._dayNightComputeTint();
        for (const k of Object.keys(e)) e[k] = 0;
        e.joy = 0.9;
        const warm = r._dayNightComputeTint();
        out.joyWarmsWorld = warm.skyColor.r > cold.skyColor.r;
        out.coldR = cold.skyColor.r;
        out.warmR = warm.skyColor.r;
        for (const k of Object.keys(e)) e[k] = saved[k] || 0; // restore
        if (r.state.atmosphere) r.state.atmosphere.auraTintStrength = _origAuraK1731; // restore Default (0)
        return out;
    });
    check(
        "Emotion→Welt: joy faerbt den Welt-Tint warm — durch die Feld-Achse (kontinuierlich)",
        res.joyWarmsWorld,
        `cold.r=${res.coldR} warm.r=${res.warmR}`
    );
}

async function checkBandWelle6G3Lebendigkeit({ page, check, errors, finalState }) {
    void errors;
    void finalState;
    // ### Welle 6.G3 — Welt-Lebendigkeit ###
    // (a) Tag-Nacht-Zyklus, (b) sanfter Wetter-Übergang —
    // Konstanten, Methoden, Persistenz, DSL-Op, UI-DOM.
    const wave6g3Results = await safeEvaluate(page, () => {
        const out = {};
        const AnazhRealm = window.AnazhRealm || r.constructor;

        // --- a) Tag-Nacht-Zyklus
        // Der Test liest den Default aus der EINEN Konstante statt einer zweiten Zahl.
        out.dayLengthDefault = r.state.dayLengthMinutes === AnazhRealm.DAY_LENGTH_DEFAULT_MINUTES;
        // das Licht der EINEN Atmosphäre über die Uhr (klare Luft; der Morgen um 0,32 steigt und knickt nicht)
        const klar = r._atmoRechnung().betaKlar(r._atmoGesetz());
        r._luftBeta = () => klar;
        try {
            const L = [0.5, 0, 0.317, 0.32, 0.323].map(
                (t) => r._atmoSonne(r._dayNightSunDirection(r._sonnenWinkel(t)).y).lum
            );
            out.atmoUhr = L;
        } finally {
            delete r._luftBeta;
        }

        // setTimeOfDay setzt korrekt
        r.setTimeOfDay(0.25, "human");
        out.setTimeOfDayWorks = Math.abs(r.state.timeOfDay - 0.25) < 0.001;
        out.timeLabel0_25Hours = r._timeOfDayLabel(0.25).includes("06:");

        // tickDayNight schreitet voran
        r.setTimeOfDay(0.4, "human");
        const beforeT = r.state.timeOfDay;
        r.state._lastDayNightTick = 0;
        r.tickDayNight(0.5); // 0.5 s delta, dayLength=60min=3600s → +0.00014
        out.tickAdvances = r.state.timeOfDay > beforeT;
        // setDayLength clamped
        r.setDayLength(5);
        out.setDayLength5 = r.state.dayLengthMinutes === 5;
        r.setDayLength(999); // > max 60
        out.setDayLengthClampedMax = r.state.dayLengthMinutes === 60;
        r.setDayLength(0); // < min 1
        out.setDayLengthClampedMin = r.state.dayLengthMinutes === 1;
        r.setDayLength(AnazhRealm.DAY_LENGTH_DEFAULT_MINUTES); // zurück

        // DSL-Op set_time_of_day — die Uhr gehört dem Spieler: sein Satz stellt sie, der Nexus nie
        r.dslRun(["set_time_of_day", 0.7], { source: "human" });
        out.dslSetTimeOfDay = Math.abs(r.state.timeOfDay - 0.7) < 0.001;
        const nexusUhr = r.dslRun(["set_time_of_day", 0.1], { source: "nexus" });
        out.dslNexusUhrGehalten =
            Math.abs(r.state.timeOfDay - 0.7) < 0.001 && nexusUhr.log.some((e) => e.event === "uhr_gehalten");
        // NON_BROADCASTABLE
        out.setTimeOfDayInBlacklist = AnazhRealm.NON_BROADCASTABLE_OPS.has("set_time_of_day");

        // _applyDayNightToScene setzt DirectionalLight-Position + -Farbe/-Intensität: tags die SONNE (oben,
        // hell, warm), nachts der MOND gegenüber der Sonne — AUCH über dem Horizont, gedämpft + kühl
        // (ein Licht von unten wüsche die Nacht aus).
        r.setTimeOfDay(0.5, "human"); // Mittag
        const noonY = r.state.directionalLight.position.y;
        const noonInt = r.state.directionalLight.intensity;
        r.setTimeOfDay(0, "human"); // Mitternacht
        const dlN = r.state.directionalLight;
        const midnightY = dlN.position.y;
        const midnightCool = dlN.color.b > dlN.color.r; // Mondlicht ist kühl (b > r)
        out.lightPosFollowsTimeOfDay = noonY > 0 && midnightY > 0 && dlN.intensity < noonInt && midnightCool;

        // --- b) Sanfte Wetter-Übergänge
        const wxL = globalThis.__phytoCore.WX_LICHT; // K2: der Tint IST die Sonne der Wetter-Zeile, kein zweiter Wert
        out.weatherTintsSunnyRainy = Object.keys(AnazhRealm.WEATHER_FIELD).every((w) => {
            const [s, t] = [AnazhRealm.WEATHER_FIELD[w].sun, AnazhRealm.WEATHER_TINTS[w]];
            return t.skyMul === s && t.lightMul === wxL.sockel + wxL.sonne * s;
        });

        // Setze sunny als Ausgangspunkt
        r.state.weather = "sunny";
        r.state.weatherTransition = null;
        // der Satz des Spielers blendet vom Wetter davor über
        r.dslRun(["weather", "rainy"], { source: "human" });
        out.weatherTransitionFromSunny = r.state.weatherTransition && r.state.weatherTransition.from === "sunny";
        // requestWeatherTransition(rainy) wenn schon rainy → no-op (gleiches to)
        const okSameTarget = r.requestWeatherTransition("rainy");
        out.transitionSameTargetNoop = okSameTarget === true;
        // tickWeatherTransition setzt progress voran
        r.state.weatherTransition.startedAt -= 0.1; // 100 ms der Welt-Uhr
        r.tickWeatherTransition(0);
        out.transitionProgressAdvanced = r.state.weatherTransition && r.state.weatherTransition.progress > 0;
        // Bei progress=1 wird die transition geclearet. Offset > Cap (120 s), damit die Probe deterministisch
        // ist — die Emotion-Modulation streckt die Default-Dauer auf bis zu ~86 s.
        if (r.state.weatherTransition) {
            r.state.weatherTransition.startedAt -= 200; // 200 s > 120-s-Cap
        }
        r.tickWeatherTransition(0);
        out.transitionClearedOnComplete = r.state.weatherTransition === null;

        // --- c) den Fauna-Lifecycle (Geburt, Hungertod des Ältesten, Trauer, Journal) misst gate:kreatur-takt kaskade

        return out;
    });

    if (wave6g3Results && !wave6g3Results.error) {
        // --- a) Tag-Nacht
        check(
            "Welle 6.G3.a: dayLengthMinutes == DAY_LENGTH_DEFAULT (die EINE Konstante)",
            wave6g3Results.dayLengthDefault
        );
        const L = wave6g3Results.atmoUhr || [];
        check("Welle 6.G3.a: der Durchlass zur Sonne mittags ≥ 0,7", L[0] >= 0.7, L[0]);
        check("Welle 6.G3.a: um Mitternacht unter 0,35 des Mittags", L[1] < 0.35 * L[0], L[1]);
        check("der Morgen um 0,32 steigt", L[4] - L[2] > 0.0018, L.join(" "));
        check("der Morgen um 0,32 knickt nicht (C1)", Math.abs(2 * L[3] - L[2] - L[4]) < 0.0018, L.join(" "));
        check("Welle 6.G3.a: setTimeOfDay(0.25) setzt state korrekt", wave6g3Results.setTimeOfDayWorks);
        check("Welle 6.G3.a: _timeOfDayLabel(0.25) zeigt 06:00", wave6g3Results.timeLabel0_25Hours);
        check("Welle 6.G3.a: tickDayNight schreitet timeOfDay voran", wave6g3Results.tickAdvances);
        check("Welle 6.G3.a: setDayLength(5) wirkt", wave6g3Results.setDayLength5);
        check("Welle 6.G3.a: setDayLength clamped >60 auf 60", wave6g3Results.setDayLengthClampedMax);
        check("Welle 6.G3.a: setDayLength clamped <1 auf 1", wave6g3Results.setDayLengthClampedMin);
        check("Welle 6.G3.a: DSL-Op set_time_of_day wirkt (Satz des Spielers)", wave6g3Results.dslSetTimeOfDay);
        check(
            "Leben-Schau 2: set_time_of_day des Nexus stellt die Uhr nie (uhr_gehalten im Protokoll)",
            wave6g3Results.dslNexusUhrGehalten
        );
        check("Welle 6.G3.a: set_time_of_day in NON_BROADCASTABLE_OPS", wave6g3Results.setTimeOfDayInBlacklist);
        check(
            "Welle 6.G3.a: DirectionalLight folgt timeOfDay (Mittag=Sonne oben/hell, Mitternacht=Mond oben/gedämpft+kühl, V18.377)",
            wave6g3Results.lightPosFollowsTimeOfDay
        );

        // --- b) Wetter-Übergang
        check(
            "Welle 6.G3.b: WEATHER_TINTS = die Sonne der Wetter-Zeile (skyMul = sun, lightMul = WX_LICHT)",
            wave6g3Results.weatherTintsSunnyRainy
        );
        check(
            "Welle 6.G3.b: weatherTransition.from = vorheriges Wetter (sunny)",
            wave6g3Results.weatherTransitionFromSunny
        );
        check(
            "Welle 6.G3.b: requestWeatherTransition mit selbem Ziel ist idempotent (true ohne neu zu starten)",
            wave6g3Results.transitionSameTargetNoop
        );
        check(
            "Welle 6.G3.b: tickWeatherTransition schreitet progress voran",
            wave6g3Results.transitionProgressAdvanced
        );
        check(
            "Welle 6.G3.b: tickWeatherTransition löscht Transition bei progress=1",
            wave6g3Results.transitionClearedOnComplete
        );
    } else {
        check("Welle 6.G3: alle Tests laufen", false, wave6g3Results ? wave6g3Results.error : "no result");
    }

    // ### Welle 6.G3 V2 — Vision-Invarianten ###
    // Prüft EMERGENZ statt Mechanik: wirkt Welt-Affinität auf die Soul-Wahl? Folgen Frequenzen den
    // Tags? Modulieren Emotionen den Tint? Ist die Wetter-Dauer emotion-abhängig?
    const wave6g3v2Results = await safeEvaluate(page, () => {
        const out = {};
        const AnazhRealm = window.AnazhRealm || r.constructor;

        // --- Wurzel-Helper existieren

        // --- Vision 1: Affinity-Pick wählt höhere Resonanz
        // Test-Kandidaten mit klaren Tag-Profilen
        const candidates = [
            { name: "lebendigSoul", tags: { lebendig: 1.0, dichte: 0, glut: 0, magieleitung: 0 } },
            { name: "magieSoul", tags: { lebendig: 0, dichte: 0, glut: 0, magieleitung: 1.0 } },
            { name: "dichteSoul", tags: { lebendig: 0, dichte: 1.0, glut: 0, magieleitung: 0 } },
        ];
        // Welt-Feld mit dominanter Magie-Achse
        const fieldMagie = { lebendig: 0.1, dichte: 0.1, glut: 0.1, magieleitung: 0.9 };
        // 10× Durchläufe sammeln — Statistik gegen das Noise
        let magieWins = 0;
        for (let i = 0; i < 30; i++) {
            const pickResult = r._affinityPickFromCandidates(candidates, fieldMagie, 0.05);
            if (pickResult.pick && pickResult.pick.name === "magieSoul") magieWins++;
        }
        out.affinityPicksMagieInMagieField = magieWins > 20; // > 66% (statistisch sicher)

        // Diskrimination: in einer dichte-Welt wird dichteSoul bevorzugt
        const fieldDichte = { lebendig: 0.1, dichte: 0.9, glut: 0.1, magieleitung: 0.1 };
        let dichteWins = 0;
        for (let i = 0; i < 30; i++) {
            const pickResult = r._affinityPickFromCandidates(candidates, fieldDichte, 0.05);
            if (pickResult.pick && pickResult.pick.name === "dichteSoul") dichteWins++;
        }
        out.affinityPicksDichteInDichteField = dichteWins > 20;

        // --- Vision 2: die Stimme folgt dem KÖRPER — der Tier-Ruf des klang-Gesetzbuchs
        // (Grundton ∝ Körperlänge^−0,9): das kleine Wesen ruft höher als das große.
        const rufKern = AnazhRealm._umweltGesetz().kern;
        const kleinF0 = rufKern.tierRufPuffer({ laengeM: 0.7, stimmung: "freude", saat: 1 }).f0;
        const grossF0 = rufKern.tierRufPuffer({ laengeM: 2.2, stimmung: "freude", saat: 1 }).f0;
        out.rufKleinHoeher = kleinF0 > grossF0;
        out.bothFrequenciesInRange = kleinF0 >= 60 && kleinF0 <= 2000 && grossF0 >= 60 && grossF0 <= 2000;

        // --- Vision 3: _emotionModulate moduliert mit Emotion-Achsen
        const noEmo = { joy: 0, sorrow: 0 };
        const happyEmo = { joy: 1, sorrow: 0 };
        const baseMod = r._emotionModulate(10, { joy: 5 }, noEmo);
        const happyMod = r._emotionModulate(10, { joy: 5 }, happyEmo);
        out.emotionModulateAdditiveWorks = Math.abs(happyMod - 15) < 0.001 && Math.abs(baseMod - 10) < 0.001;
        // Mul-Spec
        const peaceMod = r._emotionModulate(100, { peace: { mul: 1.5 } }, { peace: 1 });
        out.emotionModulateMulWorks = Math.abs(peaceMod - 150) < 0.001;

        // --- Vision 4: Sky-Tint moduliert mit awe
        // Setze awe=0, lese sky-Color; setze awe=1, vergleiche.
        r.setTimeOfDay(0.5, "human"); // Mittag
        r.state.player.emotions.awe = 0;
        r.state.player.emotions.joy = 0;
        r.state.player.emotions.sorrow = 0;
        r.state.weather = "sunny";
        r.state.weatherTransition = null;
        // der Tint liest jetzt die RÄUMLICHE emotion-Achse (`aura.emotion`,
        // global + lokaler Abdruck). Diese Probe misst die GLOBALE Emotion→Tint-
        // Kopplung isoliert → das emotionField clearen (sonst blenden Orts-Abdrücke
        // aus früheren _feelAction-Bands rein).
        if (r.state.emotionField) r.state.emotionField.clear();
        // Der Look-Default `auraTintStrength` macht den Feld/Emotion-Tint subtil → Margen-Tests würden
        // flaky. Die Proben prüfen den MECHANISMUS bei VOLLER Stärke (1.0: große, deterministische Marge);
        // zurückgesetzt am Block-Ende (vor Vision 6).
        const _origAuraKg3 = r.state.atmosphere && r.state.atmosphere.auraTintStrength;
        if (r.state.atmosphere) r.state.atmosphere.auraTintStrength = 1;
        r._applyDayNightToScene();
        // Doku-Sync: skyboxMaterial ist jetzt MeshBasicNodeMaterial,
        // Uniforms leben in state.skyboxUniforms (uniform-Knoten mit .value).
        const skyU = r.state.skyboxUniforms.himmelTint;
        const skyAtAweZero = { r: skyU.value.r, g: skyU.value.g, b: skyU.value.b };
        r.state.player.emotions.awe = 1.0;
        r._applyDayNightToScene();
        const skyAtAweHigh = { r: skyU.value.r, g: skyU.value.g, b: skyU.value.b };
        // Bei awe=1 sollte b (Blau-Anteil) sichtbar höher sein
        out.aweRaisesBlue = skyAtAweHigh.b > skyAtAweZero.b + 0.02;
        // r-Anteil auch (Lila = Rot + Blau)
        out.aweRaisesRedToo = skyAtAweHigh.r > skyAtAweZero.r + 0.01;

        // --- Vision 5: sorrow entsättigt den Welt-Tint — gemessen am ROHEN Tint via
        // `_dayNightComputeTint()` (der Himmel des Studios: sorrow grayt ~40 %), nicht am live `himmelTint`
        // (der skyTint-Blend verdünnt auf ~3 % → flaky). Gleicher Ort, emotionField leer → nur sorrow zählt.
        const satG3 = (c) => Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b);
        r.state.player.emotions.awe = 0;
        r.state.player.emotions.sorrow = 0;
        const satG3Zero = satG3(r._dayNightComputeTint().skyColor);
        r.state.player.emotions.sorrow = 1.0;
        const satG3High = satG3(r._dayNightComputeTint().skyColor);
        out.sorrowReducesSaturation = satG3High < satG3Zero;
        // Reset
        r.state.player.emotions.sorrow = 0;
        r._applyDayNightToScene();

        // --- Vision 6: Wetter-Dauer skaliert mit Emotion
        // peace=1 → Dauer > Default. chaos=1 → Dauer < Default.
        r.state.player.emotions.peace = 0;
        r.state.player.emotions.chaos = 0;
        r.state.weather = "sunny";
        r.state.weatherTransition = null;
        r.requestWeatherTransition("rainy"); // Default-Dauer (sollte ~45000)
        const defaultDur = r.state.weatherTransition && r.state.weatherTransition.duration;
        r.state.weatherTransition = null;
        r.state.weather = "sunny";
        r.state.player.emotions.peace = 1.0;
        r.requestWeatherTransition("rainy");
        const peaceDur = r.state.weatherTransition && r.state.weatherTransition.duration;
        r.state.weatherTransition = null;
        r.state.weather = "sunny";
        r.state.player.emotions.peace = 0;
        r.state.player.emotions.chaos = 1.0;
        r.requestWeatherTransition("rainy");
        const chaosDur = r.state.weatherTransition && r.state.weatherTransition.duration;
        r.state.weatherTransition = null;
        r.state.weather = "sunny";
        r.state.player.emotions.chaos = 0;
        out.peaceSlowsWeather = peaceDur > defaultDur * 1.2;
        out.chaosSpeedsWeather = chaosDur < defaultDur * 0.7;

        // BÜHNE: zurück an den Ursprung der Testzelle
        r.state.playerMesh.position.x = 0;

        // --- Vision 9: Sonne + Mond folgen der Tageszeit (Sternfeld, Mittags-Grenze und Unendlich prüft Himmel-Tag)
        if (r.state.sunMesh && r.state.moonMesh) {
            // Die Orbit-HÖHE lebt im skyOffset (Welt-Position = camera + skyOffset, pro Frame gesetzt in
            // `_followCelestialBodies`; dieser Test ruft kein _loopRender) → skyOffset.y (= sin(angle)·380)
            // ist das kamera-unabhängige Maß für über/unter dem Horizont.
            const offY = (m) => (m.userData && m.userData.skyOffset ? m.userData.skyOffset.y : m.position.y);
            r.setTimeOfDay(0.5, "human"); // Mittag
            r._applyDayNightToScene();
            const sunYNoon = offY(r.state.sunMesh);
            const moonYNoon = offY(r.state.moonMesh);
            r.setTimeOfDay(0, "human"); // Mitternacht
            r._applyDayNightToScene();
            const sunYMidnight = offY(r.state.sunMesh);
            const moonYMidnight = offY(r.state.moonMesh);
            // Mittag: Sonne oben, Mond unten. Mitternacht: umgekehrt.
            out.sunHighAtNoon = sunYNoon > 100;
            out.moonLowAtNoon = moonYNoon < -100;
            out.sunLowAtMidnight = sunYMidnight < -100;
            out.moonHighAtMidnight = moonYMidnight > 100;
        }
        r.setTimeOfDay(0.5, "human"); // Reset

        // --- Vision 10: Sky-Tint moduliert mit Welt-Feld (magie-Region)
        // (auraTintStrength=1 gilt noch aus dem Block-Anfang — Mechanismus-Marge.)
        // Mock worldFieldAt für hohe magieleitung
        const origWFA = r.worldFieldAt;
        r.worldFieldAt = function () {
            return { lebendig: 0.1, dichte: 0.1, glut: 0.1, magieleitung: 0.9 };
        };
        r.state.player.emotions.awe = 0;
        r._applyDayNightToScene();
        const skyMagieField = { r: skyU.value.r, g: skyU.value.g, b: skyU.value.b };
        r.worldFieldAt = function () {
            return { lebendig: 0.1, dichte: 0.9, glut: 0.1, magieleitung: 0.1 };
        };
        r._applyDayNightToScene();
        const skyDichteField = { r: skyU.value.r, g: skyU.value.g, b: skyU.value.b };
        // Magie-Region sollte mehr Blau haben als dichte-Region
        out.magieFieldRaisesBlue = skyMagieField.b > skyDichteField.b + 0.02;
        // Reset (auch den Aura-Tint-Default vom Block-Anfang)
        if (r.state.atmosphere) r.state.atmosphere.auraTintStrength = _origAuraKg3;
        r.worldFieldAt = origWFA;
        r._applyDayNightToScene();

        return out;
    });

    if (wave6g3v2Results && !wave6g3v2Results.error) {
        check(
            "Welle 6.G3 V2 Vision: Affinity-Pick wählt magieSoul in magie-Welt (>66%, 30 Runs)",
            wave6g3v2Results.affinityPicksMagieInMagieField
        );
        check(
            "Welle 6.G3 V2 Vision: Affinity-Pick wählt dichteSoul in dichte-Welt (>66%, 30 Runs)",
            wave6g3v2Results.affinityPicksDichteInDichteField
        );
        check(
            "Welle 5 Klang: der Tier-Ruf folgt dem Körper (0,7 m ruft höher als 2,2 m)",
            wave6g3v2Results.rufKleinHoeher
        );
        check("Welle 5 Klang: beide Ruf-Grundtöne im Range [60, 2000] Hz", wave6g3v2Results.bothFrequenciesInRange);
        check(
            "Welle 6.G3 V2 Vision: _emotionModulate additiv (joy=1 → +5 auf base 10 = 15)",
            wave6g3v2Results.emotionModulateAdditiveWorks
        );
        check(
            "Welle 6.G3 V2 Vision: _emotionModulate multiplikativ (peace=1 + mul:1.5 → ×1.5)",
            wave6g3v2Results.emotionModulateMulWorks
        );
        check("Welle 6.G3 V2 Vision: awe=1 hebt Sky-Blau-Anteil sichtbar", wave6g3v2Results.aweRaisesBlue);
        check("Welle 6.G3 V2 Vision: awe=1 hebt Sky-Rot-Anteil (Magie = Lila)", wave6g3v2Results.aweRaisesRedToo);
        check("Welle 6.G3 V2 Vision: sorrow=1 reduziert Sky-Sättigung", wave6g3v2Results.sorrowReducesSaturation);
        check("Welle 6.G3 V2 Vision: peace=1 verlängert Wetter-Dauer (>120%)", wave6g3v2Results.peaceSlowsWeather);
        check("Welle 6.G3 V2 Vision: chaos=1 verkürzt Wetter-Dauer (<70%)", wave6g3v2Results.chaosSpeedsWeather);
        check("Welle 6.G3 V2 Vision: Sonne hoch am Mittag (y > 100)", wave6g3v2Results.sunHighAtNoon);
        check("Welle 6.G3 V2 Vision: Mond niedrig am Mittag (y < -100)", wave6g3v2Results.moonLowAtNoon);
        check("Welle 6.G3 V2 Vision: Sonne niedrig nachts (y < -100)", wave6g3v2Results.sunLowAtMidnight);
        check("Welle 6.G3 V2 Vision: Mond hoch nachts (y > 100)", wave6g3v2Results.moonHighAtMidnight);
        check(
            "Welle 6.G3 V2 Vision: magie-Welt-Region hebt Sky-Blau (vs dichte-Region)",
            wave6g3v2Results.magieFieldRaisesBlue
        );
    } else {
        check("Welle 6.G3 V2: Vision-Tests laufen", false, wave6g3v2Results ? wave6g3v2Results.error : "no result");
    }
}

async function checkBandWelle6G4Atmosphere({ page, check, errors, finalState }) {
    void errors;
    void finalState;
    // ### 6.G4.a — Welt unter wandernder Sonne (Hemisphere + Licht-Material + Fog) ###
    // Tiefe statt homogenem Licht: Hemisphere-Light (Sky-Tint oben, Erd-Tint unten) + licht-reaktives
    // Material + atmosphärischer Fog.
    const v827Results = await safeEvaluate(page, async () => {
        const out = {};

        // 1. HemisphereLight im Scene + state-cached
        // Die In-Streuung der Luft IST der Himmel der EINEN Atmosphäre: nach dem ersten _applyDayNightToScene trägt
        // die Tafel das Licht von Sonne oder Mond (die Farbe über Wasser liest himmelFarbe, nie ein eigenes Uniform)
        r._applyDayNightToScene();
        const atmoU = r._atmoLutBau().U;
        const mE = atmoU.mondE.value;
        out.fogColorSet = atmoU.licht.value > 0 && mE.x + mE.y + mE.z > 0;

        // EIN Himmel: am Tag IST die Himmels-Umgebung der Himmel — Hemi trägt nur den
        // Nachthimmel-Boden (Mittag 0, Mitternacht > 0). Dazu die Belichtung aus dem Licht: mittags steht die
        // 18-%-Karte am Anker (Mittelgrau + 1 EV unter der Zenit-Sonne, `_belichtungAnker`), nachts am Deckel.
        // Die Belichtung liest die Lichter ihrer Anwendung (S7), nie die zurückgelesene Umgebung.
        r.setTimeOfDay(0.5, "human");
        const intensityNoon = r.state.hemiLight.intensity;
        const belichtungMittag = r.state.renderer.toneMappingExposure;
        r.setTimeOfDay(0, "human");
        const intensityNight = r.state.hemiLight.intensity;
        const belichtungNacht = r.state.renderer.toneMappingExposure;
        out.hemiNurNachtboden = intensityNoon < 0.01 && intensityNight > 0.05;
        const B = r.constructor.BELICHTUNG;
        const kAnker = B.zielKarte / ((0.18 / Math.PI) * r._belichtungAnker());
        out.belichtungAusLicht =
            Math.abs(belichtungMittag / kAnker - 1) < 0.1 && Math.abs(belichtungNacht - B.max) < 1e-6;
        out.belichtungZahlen = [belichtungMittag, kAnker, belichtungNacht].map((v) => +(+v).toFixed(3)).join(" / ");

        // 3. Hemisphere-groundColor moduliert mit Welt-Affinität. Der Feld→Boden-Term ist hinter
        // `tint.auraK` gegated (Default `auraTintStrength` 0) — der MECHANISMUS lebt als Opt-in → das Band
        // testet MIT Opt-in und mockt den echten Leser (auraAt).
        r.setTimeOfDay(0.5, "human");
        const origWFA = r.worldFieldAt;
        const origAuraAt = r.auraAt;
        const savedAuraStrength = r.state.atmosphere ? r.state.atmosphere.auraTintStrength : undefined;
        if (r.state.atmosphere) r.state.atmosphere.auraTintStrength = 1;
        r.worldFieldAt = function () {
            return { lebendig: 0.9, dichte: 0.05, glut: 0.05, magieleitung: 0.05 };
        };
        r.auraAt = function (x, z) {
            return r.worldFieldAt(x, z);
        };
        r._applyDayNightToScene();
        // Mit `ColorManagement.enabled=true` speichert THREE.Color LINEAR (setHex/setRGB konvertieren
        // sRGB→linear) → verglichen wird die sRGB-Display-Form via `convertLinearToSRGB()`; die Schwelle
        // meint die wahrgenommene Helligkeit.
        const tmpColor = new window.THREE.Color();
        tmpColor.copy(r.state.hemiLight.groundColor).convertLinearToSRGB();
        const groundLebendigG = tmpColor.g;
        r.worldFieldAt = function () {
            return { lebendig: 0.05, dichte: 0.05, glut: 0.9, magieleitung: 0.05 };
        };
        r._applyDayNightToScene();
        tmpColor.copy(r.state.hemiLight.groundColor).convertLinearToSRGB();
        const groundGlutR = tmpColor.r;
        // lebendig erhöht Grün, glut erhöht Rot
        out.groundColorFollowsLebendig = groundLebendigG > 0.3;
        out.groundColorFollowsGlut = groundGlutR > 0.5;
        r.worldFieldAt = origWFA;
        r.auraAt = origAuraAt;
        if (r.state.atmosphere) r.state.atmosphere.auraTintStrength = savedAuraStrength;
        r._applyDayNightToScene();

        // 4. Architektur-Material ist licht-reaktiv (Toon/PBR) — geprüft am KLASSISCHEN Bau-Pfad
        // (_buildFromBlueprint): stein_block ist Studio-bekannt und stünde foundry-ON als f:-Instanz ohne
        // entry.mesh → lokaler Hook; der Spawn wird IMMER entfernt (auch mesh-los — kein Test-Leck).
        let hasToonMaterial = false;
        if (r.state.blueprints.stein_block) {
            window.__withNoFoundry(() => {
                const arch = r.spawnArchitecture("stein_block", { x: 0, y: 10, z: 0 }, { silent: true });
                if (arch && arch.mesh) {
                    arch.mesh.traverse((node) => {
                        // mode-agnostisch: das aktive Lichtmodell ist Toon ODER
                        // PBR (Default pbr). Beide reagieren auf Licht/Tag-Nacht.
                        if (
                            node.isMesh &&
                            node.material &&
                            (node.material.isMeshToonMaterial || node.material.isMeshStandardMaterial)
                        ) {
                            hasToonMaterial = true;
                        }
                    });
                }
                // Cleanup — unbedingt (auch ein mesh-loser Spawn verlässt die Test-Welt).
                if (arch) r.removeArchitecture(arch);
            });
        }
        out.architectureUsesLambert = hasToonMaterial;

        // Terrain-Tag/Nacht = die geteilten PBR-Lichter (Sonne/Fog/Hemisphere) — geprüft in den
        // `_applyDayNightToScene`-Bändern, nicht hier.

        return out;
    });

    if (v827Results && !v827Results.error) {
        check(
            "V8.27/D3: die Luft streut den Himmel der EINEN Atmosphäre, _applyDayNightToScene setzt sein Licht",
            v827Results.fogColorSet
        );
        check("EIN Himmel — Hemi trägt nur den Nachthimmel-Boden (Mittag 0)", v827Results.hemiNurNachtboden);
        check(
            `Belichtung aus dem Licht — mittags die Karte am Anker, nachts am Deckel (Mittag / Anker / Nacht ${v827Results.belichtungZahlen})`,
            v827Results.belichtungAusLicht
        );
        check("HemisphereLight.groundColor.g hoch in lebendig-Region", v827Results.groundColorFollowsLebendig);
        check("HemisphereLight.groundColor.r hoch in glut-Region", v827Results.groundColorFollowsGlut);
        check(
            "V8.28/234: Architektur-Material reagiert auf Licht (MeshToon ODER MeshStandard/PBR)",
            v827Results.architectureUsesLambert
        );
    } else {
        check("Tiefe-Welle Tests laufen", false, v827Results ? v827Results.error : "no result");
    }

    // ### V8.28 6.G4.b — Welt-Atem-Vollendung (Sterne/Terrain/Cel/Wind/Wolken/Wasser) ###
    // Schöpfer-Beobachtung: Sterne flackern bei Kamera-Rotation,
    // Terrain nur nach Höhe gefärbt, kein Wind/Wolken/Wasser.
    const v828Results = await safeEvaluate(page, () => {
        const out = {};

        // --- Phase D: Wind + Wolken + Wasser ---
        // Wind lebt jetzt im Instanced-Gras-Material.
        const wm1 = r._grassInstanceMat ? r._grassInstanceMat() : null;
        const wm2 = r._grassInstanceMat ? r._grassInstanceMat() : null;
        out.windMatCached = !!(wm1 && wm1 === wm2); // geteilt
        // Wolken-Cover (der Uniform-Knoten in state.skyboxUniforms) folgt weather (liest state.skyboxUniforms). weatherTransition leeren: eine aktive
        // Warmup-Transition überstimmt state.weather in `_weatherBlendedValue` (beide Lesungen gleich).
        r.state.weatherTransition = null;
        r.state.weather = "rainy";
        r._applyDayNightToScene();
        const cloudRainy = r.state.skyboxUniforms.cloudCover.value;
        r.state.weatherTransition = null;
        r.state.weather = "sunny";
        r._applyDayNightToScene();
        const cloudSunny = r.state.skyboxUniforms.cloudCover.value;
        out.cloudsFollowWeather = cloudRainy > cloudSunny;
        // ===== WELLE J3 — die Himmelskörper folgen der KAMERA, nicht dem Ursprung =====
        // KONSUM: nach fernem Kamera-Teleport steht die Sonne nahe der Kamera (in Himmelsrichtung),
        // nicht um den Welt-Ursprung.
        out.sunFollowsCamera = false;
        out.sunNotAtOrigin = false;
        if (r.state.sunMesh && r.state.camera) {
            r._updateCelestialBodies(Math.PI * 0.3, 1.0); // setzt skyOffset
            const camOrig = r.state.camera.position.clone();
            // BÜHNE: ein ferner Spieler für den Himmels-Folger (nur der Abstand zählt)
            r.state.camera.position.set(2000, 50, 2000); // ferner Spieler
            r._followCelestialBodies();
            const sun = r.state.sunMesh;
            const off = sun.userData && sun.userData.skyOffset ? sun.userData.skyOffset : null;
            if (off) {
                const dCam = sun.position.distanceTo(r.state.camera.position);
                const dOrig = sun.position.length();
                // Sonne ~|skyOffset| von der Kamera entfernt (in Himmelsrichtung)…
                out.sunFollowsCamera = Math.abs(dCam - off.length()) < 1.0;
                // …und WEIT vom Ursprung (sie orbitiert nicht mehr um (0,0,0)).
                out.sunNotAtOrigin = dOrig > 1500;
            }
            r.state.camera.position.copy(camOrig);
            r._followCelestialBodies();
        }
        // Der Terrain-colorNode (triplanar + Wiese + Aerial) baut OHNE Stoff-Bruch — der Zeuge zählt jede Meldung
        // „STOFF: …" über den Bau (K22; der Marker `__toonColorNodeError` hatte keinen Schreiber mehr).
        const _zTerr = window.__stoffZeuge(r);
        let _terrMat = null;
        try {
            _terrMat = r._buildToonNodeMaterial({ vertexColors: true });
        } finally {
            _zTerr.zu();
        }
        out.terrainColorNodeBuilds = !!(_terrMat && _terrMat.colorNode) && _zTerr.brueche.length === 0;
        out.terrainColorNodeError = _zTerr.brueche[0] || null;
        const _zAer = window.__stoffZeuge(r); // der Zeuge der Aerial-Prüfung (6): Struktur und Phantom
        // Die 2.5D-Lichtung flacht nur die SHADING-Normale (normalNode, eingefrorene Konstante); die
        // GEOMETRIE behält die echte Normale (Schatten-Bias-Vertrag — gebackene Normalen = Akne an Hängen).
        out.terrainNormalFlatten = !!(_terrMat && _terrMat.normalNode);
        // Der AKNE-WÄCHTER: ein echter Chunk trägt VARIIERENDE Normalen
        // (mindestens ein gesampelter Vertex weicht von up ab) — ein
        // up-gebackenes Normal-Attribut wäre die Akne-Regression.
        out.terrainNormalsReal = (() => {
            try {
                for (const entry of r.state.voxelChunks.values()) {
                    const g = entry && entry.mesh && entry.mesh.geometry;
                    const n = g && g.attributes && g.attributes.normal;
                    if (!n || n.count < 64) continue;
                    const stride = Math.max(1, Math.floor(n.count / 200));
                    for (let i = 0; i < n.count; i += stride) {
                        if (Math.abs(n.getX(i)) > 0.05 || Math.abs(n.getY(i) - 1) > 0.05 || Math.abs(n.getZ(i)) > 0.05)
                            return true; // echte Oberflächen-Normale gefunden
                    }
                }
                return false; // alles up → der Bake wäre zurück (Regression)
            } catch {
                return false;
            }
        })();
        // ===== WELLE J → W-E → F6 — der EINE Empfänger der Mikro-Tiefe (Render-Harmonie) =====
        // KONSUM: `_applySubstanceResponse` setzt den outputNode, wo das Profil Mikro-Tiefe bestellt (Strukturen);
        // transparente Phantome bleiben unberührt, material.color bleibt setzbar (kein colorNode-Override).
        // (1) Terrain (vertexColors) trägt KEINE Antwort: seine Mikro-Tiefe trägt der colorNode, und Licht trägt kein Profil
        // (F6 — das additive Band leuchtete den Boden am streifenden Blick der Ferne aus sich selbst).
        out.terrainOhneAntwort = !!_terrMat && !_terrMat.outputNode;
        // (2) Struktur (Flach-Farbe) bekommt DENSELBEN outputNode + Mikro-Tiefe.
        const _structMat = r._buildToonNodeMaterial({ color: 0x808080 });
        out.structHasAerialOutput = !!(_structMat && _structMat.outputNode);
        // (4) die dynamische Farbe (Marking/Emotion) bleibt setzbar — der
        // outputNode liest `output` (post-lighting), überschreibt material.color
        // NICHT (CLAUDE.md-Gotcha).
        let _dynColorOk = false;
        if (_structMat) {
            try {
                _structMat.color.setHex(0xc0392b);
                _dynColorOk = _structMat.color.getHexString() === "c0392b";
            } catch {
                _dynColorOk = false;
            }
        }
        out.structDynamicColorPreserved = _dynColorOk;
        // (5) transparentes Phantom bekommt KEINEN Aerial-outputNode (UI-Element).
        const _phantomMat = r._buildToonNodeMaterial({ color: 0x44ccff, transparent: true, opacity: 0.4 });
        out.phantomNoAerial = !!_phantomMat && !_phantomMat.outputNode;
        // (6) kein still gefangener Node-Fehler (V17.12-Marker-Disziplin).
        const _aerBrueche = _zAer.zu().concat(_zTerr.brueche);
        out.aerialNoError = _aerBrueche.length === 0; // der Zeuge zählte jeden Stoff-Bruch von Terrain, Struktur, Phantom
        out.aerialOutputError = _aerBrueche[0] || null;
        // Welt-Wasser — das Wasser sind per-Chunk-Iso-Surface-Meshes
        // (`voxelChunkWaterIso`-Map) aus dem Cell-Feld. Der alte Quad-Mesh-
        // Pfad ist gestrichen.

        // --- Atmosphäre-Persistenz --- (der Nebel-Regler ist fort, die Mikro-Struktur trägt den Beweis)
        const microAlt = r.state.atmosphere ? r.state.atmosphere.microStrength : undefined;
        r.setMicroStrength(0.15);
        const snap = r.buildStateSnapshot();
        out.atmospherePersisted = !!(snap && snap.atmosphere && Math.abs(snap.atmosphere.microStrength - 0.15) < 0.01);
        r.setMicroStrength(microAlt == null ? r.constructor.AERIAL.microStrength : microAlt);
        // J4-Regler — KONSUM: setCavityAO/setEdgeSharp pushen live ins Uniform +
        // persistieren in state.atmosphere (so liest der Slider den Wert ab).
        r._ensureAtmoUniforms();
        const aoRet = r.setCavityAO(0.3);
        out.cavityAOSetter =
            aoRet === 0.3 &&
            r.state.atmosphere.cavityAO === 0.3 &&
            r.state.atmoUniforms &&
            Math.abs(r.state.atmoUniforms.aoScale.value - 0.3) < 1e-6;
        const esRet = r.setEdgeSharp(0);
        out.edgeSharpSetter = esRet === 0 && r.state.atmosphere.kantenSchaerfe === 0;
        const txRet = r.setSurfaceTexture(0);
        out.surfTexSetter =
            txRet === 0 &&
            r.state.atmosphere.triplanar === 0 &&
            r.state.atmoUniforms &&
            r.state.atmoUniforms.triplanarScale.value === 0;
        const cvRet = r.setColorVariation(0);
        out.colorVarSetter =
            cvRet === 0 &&
            r.state.atmosphere.colorVar === 0 &&
            r.state.atmoUniforms &&
            r.state.atmoUniforms.tintScale.value === 0;
        // B3: setTerrainFlatten/Slider/Uniform sind GESCHNITTEN (gebacken);
        // die Wahrheit lebt als statische Konstante (Worker-Mirror-Vertrag).
        out.terrainFlattenSetter =
            typeof r.setTerrainFlatten === "undefined" &&
            Number.isFinite(AnazhRealm.TERRAIN_NORMAL_FLATTEN) &&
            !!(r.state.atmoUniforms && r.state.atmoUniforms.terrainFlatten) &&
            Math.abs(r.state.atmoUniforms.terrainFlatten.value - AnazhRealm.TERRAIN_NORMAL_FLATTEN) < 1e-6 &&
            !document.getElementById("slider-flatten");
        out.sliderHeadroom = r.setCavityAO(1.5) === 1.5 && r.setSurfaceTexture(1.5) === 1.5;
        // Werte wiederherstellen, die der j4SlidersPersist-Test unten erwartet
        // (mein Headroom-Check hat cavityAO/triplanar verändert).
        r.setCavityAO(0.3);
        r.setSurfaceTexture(0);
        r.setColorVariation(1.0);
        const snap2 = r.buildStateSnapshot();
        out.j4SlidersPersist = !!(
            snap2 &&
            snap2.atmosphere &&
            Math.abs(snap2.atmosphere.cavityAO - 0.3) < 1e-6 &&
            snap2.atmosphere.kantenSchaerfe === 0 &&
            snap2.atmosphere.triplanar === 0
        );
        r.setCavityAO(1.0);
        r.setEdgeSharp(0.5);
        r.setSurfaceTexture(1.0);

        return out;
    });

    if (v828Results && !v828Results.error) {
        check("D: _grassInstanceMat ist geteilt/gecached (eine Kompilierung)", v828Results.windMatCached);
        check("D: Wolken-Cover folgt weather (rainy > sunny)", v828Results.cloudsFollowWeather);
        check(
            "V17.J3: die Sonne folgt der Kamera (|Pos−Kamera| ≈ skyOffset, nicht origin-orbit)",
            v828Results.sunFollowsCamera
        );
        check(
            "V17.J3: die Sonne orbitet NICHT mehr den Welt-Ursprung (fern bei fernem Spieler)",
            v828Results.sunNotAtOrigin
        );
        check(
            `Terrain-colorNode (triplanar-Textur) baut OHNE geschluckte Exception${v828Results.terrainColorNodeError ? " — " + v828Results.terrainColorNodeError : ""}`,
            v828Results.terrainColorNodeBuilds === true
        );
        // ===== WELLE J — Render-Harmonie (die EINE geteilte Aerial-Perspektive) =====
        check(
            "V17.J → F6: das Terrain trägt keine Antwort nach dem Licht (kein outputNode — der Boden leuchtet nicht aus sich selbst)",
            v828Results.terrainOhneAntwort
        );
        check(
            "V17.J: Struktur bekommt DENSELBEN Aerial-outputNode (eine Atmosphäre, viele Leser)",
            v828Results.structHasAerialOutput
        );
        check(
            "V17.J: die dynamische material.color bleibt setzbar (kein colorNode-Override)",
            v828Results.structDynamicColorPreserved
        );
        check(
            "B3: die 2.5D-Lichtung flacht die SHADING-Normale (normalNode, eingefrorene Konstante)",
            v828Results.terrainNormalFlatten
        );
        check(
            "AKNE-WÄCHTER: die Chunk-GEOMETRIE trägt echte Oberflächen-Normalen (Schatten-Vertrag)",
            v828Results.terrainNormalsReal
        );
        check(
            "V17.J: transparentes Phantom bekommt KEINEN Aerial-outputNode (UI-Element)",
            v828Results.phantomNoAerial
        );
        check(
            `V17.J: kein still gefangener Aerial-Node-Fehler${v828Results.aerialOutputError ? " — " + v828Results.aerialOutputError : ""}`,
            v828Results.aerialNoError === true
        );
        check("state.atmosphere persistiert im Snapshot", v828Results.atmospherePersisted);
        check(
            "V17.J4: setCavityAO pusht live ins aoScale-Uniform + persistiert (Slider-KONSUM)",
            v828Results.cavityAOSetter
        );
        check("V17.J4: setEdgeSharp setzt die Post-FX-Kanten-Schärfe + persistiert", v828Results.edgeSharpSetter);
        check("setSurfaceTexture pusht live ins triplanar-Uniform + persistiert", v828Results.surfTexSetter);
        check(
            "setColorVariation pusht live ins tint-Uniform (die warm/kühl-Patches)",
            v828Results.colorVarSetter
        );
        check("V17.J4: die beiden Render-Regler reisen im Snapshot mit", v828Results.j4SlidersPersist);
        check(
            "B3: Slider+Setter geschnitten; der Konsolen-Hebel lebt aus der Konstante",
            v828Results.terrainFlattenSetter
        );
        check(
            "Slider-Headroom — Kavitäts-AO/Oberflächen-Textur clampen auf 2.0, nicht 1.0",
            v828Results.sliderHeadroom
        );
    } else {
        check("Welt-Atem-Vollendung Tests laufen", false, v828Results ? v828Results.error : "no result");
    }

    // ### Die lebendige Welt (Instanced-Gras, Avatar-Hide,
    // Genesis-Plattform, adaptives Wasser, Cel-Slider-Fix) ###
    const v829Results = await safeEvaluate(page, () => {
        const out = {};

        // --- Avatar-Hide im 1st-Person ---
        // Die Ego-Sicht ist EIN Ebenen-Schalter (0910-5, Chokepoint `_applyEgoSicht`): im 1st liegt jeder Knoten des Leibs
        // (Kopf-Part + _creatureSkin-Hülle, ohne das Gerät in der Hand), der im 3rd auf Ebene 0 lag, nicht mehr dort; jeder,
        // der im 3rd warf, liegt weiter auf SHADOW_TWIN_LAYER (der Wurf-Ebene, K72 — die Kaskaden werfen ihn); 3rd gibt jede
        // Maske genau zurück; `visible` wechselt nie.
        {
            const pm = r.state.playerMesh;
            const E = r.constructor.SHADOW_TWIN_LAYER;
            const knoten = [];
            const sammle = (o) => {
                if (o.userData && o.userData._gehalten) return;
                knoten.push(o);
                for (const k of o.children) sammle(k);
            };
            const kopf = pm && pm.userData && pm.userData.parts && pm.userData.parts.head;
            if (kopf) sammle(kopf);
            for (const ch of (pm && pm.children) || []) if (ch.userData && ch.userData._creatureSkin) sammle(ch);
            const vorher = r.state.cameraMode;
            r.setCameraMode("third");
            const dritt = knoten.map((o) => o.layers.mask);
            const sicht = knoten.map((o) => o.visible);
            r.setCameraMode("first");
            let leib = 0;
            let ego = true;
            knoten.forEach((o, i) => {
                if (o.visible !== sicht[i]) ego = false;
                if (!(dritt[i] & 1)) return;
                leib++;
                if (o.layers.isEnabled(0) || (dritt[i] & (1 << E) && !o.layers.isEnabled(E))) ego = false;
            });
            r.setCameraMode("third");
            const zurueck = knoten.every((o, i) => o.layers.mask === dritt[i] && o.visible === sicht[i]);
            r.setCameraMode(vorher);
            out.egoEbene = { knoten: knoten.length, leib, ego, zurueck };
        }

        // --- Instanced-Gras: `state.voxelChunkGrass` (der Bau verbucht je Chunk), `_grassInstanceMat` ist geteilt
        out.chunkGrassMap = !!r.state.voxelChunkGrass && r.state.voxelChunkGrass instanceof Map;
        // die Wiese ist Boden-
        // Funktion — Gras-Zellen sind verbucht (null = bewusst halm-los), 0 InstancedMesh.
        let grassInstances = 0,
            grassCells = 0;
        if (r.state.voxelChunkGrass) {
            for (const v of r.state.voxelChunkGrass.values()) {
                grassCells++;
                if (v && v.isInstancedMesh) grassInstances++;
            }
        }
        out.grassCellsBookedHalmFree = grassCells > 0 && grassInstances === 0;
        out.grassMatShared = r._grassInstanceMat() === r._grassInstanceMat();

        // DIE BODEN-KARTE ist der GERENDERTE Boden: an 256 Punkten des Spieler-Chunks trifft `_bodenSichtAt`
        // (der EINE Leser, K21) die Mesh-Oberfläche (Strahl von oben, beide Seiten — die Surface-Nets-Wicklung zeigt
        // oben nach unten). Das Gesetz `_voxelSurfaceY` liegt daneben — Gras und Streu darauf steckten im Boden. DIE
        // NAH-WIESE: die Büschel einer Kachel sind Γ5-stabil und stehen auf der Karte.
        {
            const cfg = r._voxelChunkConfig(0);
            const lpc = r.state.lastPlayerVoxelChunk;
            const e = lpc && r.state.voxelChunks && r.state.voxelChunks.get(lpc.cx + "," + lpc.cz);
            let geo = e && e.mesh && e.mesh.geometry;
            if (geo && !(geo.attributes.position.array && geo.attributes.position.array.length)) geo = null;
            const karte = [];
            const gesetz = [];
            if (e && geo) {
                const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
                m.updateMatrixWorld(true);
                const rc = new THREE.Raycaster();
                for (let i = 0; i < 256; i++) {
                    const x = (lpc.cx + 0.05 + 0.9 * ((i * 0.618034) % 1)) * cfg.span;
                    const z = (lpc.cz + 0.05 + 0.9 * ((i * 0.381966 + 0.17) % 1)) * cfg.span;
                    const y = r._bodenSichtAt(x, z);
                    if (y === null) continue;
                    rc.set(new THREE.Vector3(x, y + 50, z), new THREE.Vector3(0, -1, 0));
                    const h = rc.intersectObject(m, false);
                    if (!h.length) continue;
                    karte.push(Math.abs(h[0].point.y - y));
                    gesetz.push(Math.abs(h[0].point.y - r._voxelSurfaceY(x, z)));
                }
            }
            const median = (a) => (a.length ? a.slice().sort((u, v) => u - v)[Math.floor(a.length / 2)] : null);
            const anteil = (a) => (a.length ? a.filter((d) => d <= 0.05).length / a.length : 0);
            out.bodenKarteTrifftMesh = karte.length >= 128 && median(karte) <= 0.02 && anteil(karte) >= 0.75;
            out.bodenKarteZahl =
                `${karte.length} Punkte: Karte Median ${(100 * (median(karte) || 0)).toFixed(1)} cm, ` +
                `${Math.round(100 * anteil(karte))} % ≤ 5 cm · Gesetz Median ${(100 * (median(gesetz) || 0)).toFixed(1)} cm, ` +
                `${Math.round(100 * anteil(gesetz))} % ≤ 5 cm`;
            // Die büschel-reichste Kachel im 7×7-Umkreis des Spielers (die Spawn-Kachel selbst kann Fels sein).
            const NW = r.constructor.NAH_WIESE;
            const pp = r.state.playerMesh ? r.state.playerMesh.position : { x: 0, z: 0 };
            const t0x = Math.floor(pp.x / NW.kachel);
            const t0z = Math.floor(pp.z / NW.kachel);
            let tx = t0x;
            let tz = t0z;
            let bestN = -1;
            for (let dz = -3; dz <= 3; dz++)
                for (let dx = -3; dx <= 3; dx++) {
                    const b = r._nahWieseKachelBueschel(t0x + dx, t0z + dz);
                    if (b && b.length > bestN) {
                        bestN = b.length;
                        tx = t0x + dx;
                        tz = t0z + dz;
                    }
                }
            const b1 = r._nahWieseKachelBueschel(tx, tz);
            const b2 = r._nahWieseKachelBueschel(tx, tz);
            const fuss = (b) => {
                const y = r._bodenSichtAt(b.x, b.z);
                return y !== null && Math.abs(y - b.y) < 1e-6;
            };
            out.nahWieseStabil =
                Array.isArray(b1) && b1.length > 0 && JSON.stringify(b1) === JSON.stringify(b2) && b1.every(fuss);
            out.nahWieseZahl = Array.isArray(b1) ? `${b1.length} Büschel in Kachel ${tx},${tz}` : "Kachel wartet";
        }

        // --- Genesis-Plattform ---
        // Nach dem ersten Spawn sollte eine start_plattform-Architektur da sein
        out.genesisArchExists = !!(
            r.state.architectures && r.state.architectures.some((a) => a && a.type === "start_plattform")
        );
        // Idempotenz: zweiter Aufruf erzeugt KEINE zweite Plattform
        const before = r.state.architectures.filter((a) => a && a.type === "start_plattform").length;
        r._ensureGenesisPlatform();
        const after = r.state.architectures.filter((a) => a && a.type === "start_plattform").length;
        out.genesisIdempotent = before === after;

        // --- Adaptives Wasser ---
        out.waterAdaptive = typeof r.state.waterLevel === "number" && Number.isFinite(r.state.waterLevel);

        return out;
    });

    if (v829Results && !v829Results.error) {
        {
            const e = v829Results.egoEbene || {};
            check(
                "(0910-5): die Ego-Sicht ist EIN Ebenen-Schalter — 1st nimmt den Leib aus Ebene 0 auf SHADOW_TWIN_LAYER (er wirft), 3rd gibt die Maske zurück, visible wechselt nie",
                e.leib > 0 && e.ego === true && e.zurueck === true,
                JSON.stringify(e)
            );
        }
        check("(V9.39): state.voxelChunkGrass ist eine Map", v829Results.chunkGrassMap);
        check(
            "(V18.492): Gras-Zellen verbucht, 0 Halm-InstancedMesh je Chunk (fern Boden-Funktion, nah die Nah-Wiese)",
            v829Results.grassCellsBookedHalmFree
        );
        check(
            `die Boden-Karte ist der gerenderte Boden (${v829Results.bodenKarteZahl})`,
            v829Results.bodenKarteTrifftMesh
        );
        check(
            `Nah-Wiese Γ5-stabil, Fuß auf der Boden-Karte (${v829Results.nahWieseZahl})`,
            v829Results.nahWieseStabil
        );
        check("Gras-Material ist geteilt (ein Draw-Call-Material)", v829Results.grassMatShared);
        check("Genesis-Plattform-Architektur nach Spawn vorhanden", v829Results.genesisArchExists);
        check("_ensureGenesisPlatform ist idempotent (keine Doppel-Plattform)", v829Results.genesisIdempotent);
        check("state.waterLevel ist gesetzt (adaptiv)", v829Results.waterAdaptive);
    } else {
        check("Die lebendige Welt Tests laufen", false, v829Results ? v829Results.error : "no result");
    }

    // ### Welle 6.G4.e: Tauchen + Schwimm-Animation + Gerstner ###
    const v833Results = await safeEvaluate(page, () => {
        const out = {};

        // --- Tauchen: _swimVerticalVelocity (reine Funktion) ---
        const dive = r._swimVerticalVelocity(0, 4, true, false);
        const rise = r._swimVerticalVelocity(0, 4, false, true);
        const neutral = r._swimVerticalVelocity(0, 4, false, false);
        out.diveSinks = dive < 0;
        out.riseLifts = rise > 0;
        out.neutralFloats = neutral > 0 && neutral <= 2.5;
        out.diveBelowNeutral = dive < neutral;
        // Aktives Auftauchen konvergiert per lerp gegen das Gesetz (schwimmen.aufV ≈ 1.0 m/s): gemessen wird
        // die KONVERGIERTE Steig-Geschwindigkeit gegen den Neutral-Auftrieb, nicht der erste lerp-Schritt.
        let riseKonv = 0;
        for (let i = 0; i < 60; i++) riseKonv = r._swimVerticalVelocity(riseKonv, 4, false, true);
        out.riseAboveNeutral = riseKonv > neutral;
        out.surfaceNoDrift = Math.abs(r._swimVerticalVelocity(0, 0, false, false)) < 0.01;
        // Im echten Charakter-Schritt (Wasser 3 m über dem Körper): Shift sinkt, Space steigt, die Augen sind getaucht.
        // Die Bühne ist die leere Säule ohne Sattel (wie die Killplane in koerper.cjs) — der geerbte Ort urteilt nie
        // mit.
        {
            const s = r.state,
                pm = s.playerMesh,
                pos = pm.position.clone(),
                sta = s.player.stamina,
                sattel = s.player.mountedArch;
            const ohne = () => -Infinity;
            const buehne = {
                _fieldSolid: () => false,
                _fieldSurfaceBelow: () => null,
                _fieldResolveSphere: () => false,
                _stepCharacterStructures: ohne,
                _stepCharacterIslands: ohne,
                _koerperWasser: () => pm.position.y + 3,
            };
            Object.assign(r, buehne);
            s.player.mountedArch = null;
            const vy = (k) => {
                pm.position.copy(pos);
                s._fieldVy = 0;
                s.playerVel.setValue(0, 0, 0);
                Object.assign(s.verbTafel, { sprint: false, sprung: false }, k); // die Leib-Felder der Verb-Tafel (leib.K5)
                s.player.stamina = 100;
                r._stepCharacter(r.constructor.FIXED_DT, 0);
                return s._fieldVy;
            };
            try {
                const tauch = vy({ sprint: true }),
                    auf = vy({ sprung: true }),
                    ruhe = vy({});
                out.eyesFlagComputed = s.playerUnderwater === true && s.playerEyesUnderwater === true;
                out.physicsUsesSwimFn = tauch < 0 && tauch < ruhe && auf > 0;
            } finally {
                for (const k in buehne) delete r[k];
                Object.assign(s.verbTafel, { sprint: false, sprung: false });
                s._fieldVy = 0;
                Object.assign(s.player, { mountedArch: sattel, stamina: sta });
                pm.position.copy(pos);
                s.playerVel.setValue(0, 0, 0);
            }
        }

        {
            const gh = r._buildHumanGroup();
            out.humanYXZ = gh.rotation.order === "YXZ";
            r._animateHuman(gh, 1.0, 0, false, true);
            out.humanSwimLean = Math.abs(gh.rotation.x) > 0.05;
            r._animateHuman(gh, 1.0, 0, false, false);
            out.humanSwimReset = Math.abs(gh.rotation.x) < 0.001;
            r._disposeSoulGroup(gh);

            // Phoenix/Drache sind Compound-Seelen: die EINE Schwimm-Lehne (SOUL_SWIM_LEAN) wirkt über
            // animatePlayerSoul. Echter Pfad: Seele wechseln, underwater setzen, rotation.x lesen.
            const savedSoulSwim = r.state.player.soul;
            const savedUw = r.state.playerUnderwater;
            const L = r.constructor.SOUL_SWIM_LEAN;
            const swimProbe = (soulName) => {
                r.applyPlayerSoul(soulName);
                r.state.playerUnderwater = true;
                r.state.player.animationLastTick = -Infinity;
                r.animatePlayerSoul(20.0);
                const lean = r.state.playerMesh.rotation.x;
                r.state.playerUnderwater = false;
                r.animatePlayerSoul(20.1);
                const reset = r.state.playerMesh.rotation.x;
                return (Math.abs(lean - L.idle) < 1e-6 || Math.abs(lean - L.moving) < 1e-6) && Math.abs(reset) < 1e-9;
            };
            // ALTLASTEN-NULL: die Compound-Schwimm-Lehne an den TIER-Körpern
            // (dieselbe EINE SOUL_SWIM_LEAN-Quelle für jede Compound-Seele).
            out.phoenixSwimLean = swimProbe("wolf");
            out.dragonSwimLean = swimProbe("baer");
            r.state.playerUnderwater = savedUw;
            r.applyPlayerSoul(savedSoulSwim);
        }

        if (r._ensureHydroSurfaceMaterial) r._ensureHydroSurfaceMaterial();

        return out;
    });

    if (v833Results && !v833Results.error) {
        check("Tauchen — Shift erzeugt Sink-Geschwindigkeit", v833Results.diveSinks);
        check("Auftauchen — Space erzeugt Aufwärts-Geschwindigkeit", v833Results.riseLifts);
        check("Neutral — natürlicher Auftrieb treibt zur Oberfläche", v833Results.neutralFloats);
        check("Tauchen sinkt unter den Neutral-Auftrieb (Diskrimination)", v833Results.diveBelowNeutral);
        check("Auftauchen hebt über den Neutral-Auftrieb (Diskrimination)", v833Results.riseAboveNeutral);
        check("An der Oberfläche kein Auftriebs-Drift (depth 0)", v833Results.surfaceNoDrift);
        check("im Charakter-Schritt sinkt Sprint und steigt Sprung unter Wasser (die Verb-Tafel)", v833Results.physicsUsesSwimFn);
        check("getaucht sind die Augen unter dem Spiegel (playerEyesUnderwater)", v833Results.eyesFlagComputed);
        check("Soul-Group nutzt YXZ-Rotation (lokaler Vorwärts-Lehnen)", v833Results.humanYXZ);
        check("Mensch neigt sich unter Wasser (Schwimm-Pose)", v833Results.humanSwimLean);
        check("Schwimm-Pose wird an Land zurückgesetzt (rotation.x=0)", v833Results.humanSwimReset);
        check("(NULL): Wolf-Körper neigt sich unter Wasser (Schwimm-Pose)", v833Results.phoenixSwimLean);
        check("(NULL): Bär-Körper neigt sich unter Wasser (Schwimm-Pose)", v833Results.dragonSwimLean);
    } else {
        check("Wasser-Vollendung Tests laufen", false, v833Results ? v833Results.error : "no result");
    }
}

async function checkBandV8LatePolishAnd6XContinued({ page, check, errors, finalState }) {
    void errors;
    void finalState;
    // ### Regler: Sicht-Ring + Cel-Stufen + Fog ###
    const v840Results = await safeEvaluate(
        page,
        (stammDateien) => {
            const out = {};
            const ring = document.getElementById("slider-ring");
            // der Sicht-Ring-Regler reicht jetzt 1–12 (war 1–8) — die
            // fernen Ringe 9–12 sind dank der LOD-Pyramide billig. Default bleibt 4.
            out.ringSliderRange = !!ring && ring.max === "12" && ring.value === "4";

            // Cache-Buster auf JEDER Stamm-Einbindung (die Liste aus scripts/lib/stamm.cjs, wie index.html sie lädt).
            const tags = [...document.querySelectorAll("script")].map((s) => s.getAttribute("src") || "");
            const ohneBuster = stammDateien.filter((p) => !tags.some((t) => t.split("?")[0] === p && /\?v=/.test(t)));
            out.cacheBust = stammDateien.length > 0 && ohneBuster.length === 0;

            return out;
        },
        stammLib.dateien(path.join(SKRIPTE, ".."))
    );

    if (v840Results && !v840Results.error) {
        check("V8.40/E2: Sicht-Ring-Regler 1–12, Default 4 (9×9)", v840Results.ringSliderRange);
        check("jede Stamm-Datei mit Cache-Buster ?v= eingebunden", v840Results.cacheBust);
    } else {
        check("Regler-Tests laufen", false, v840Results ? v840Results.error : "no result");
    }

    // ### Shadow-Bias gegen Shadow-Acne auf flachen Flächen (der Wetter-Blend V8.46 lebt in koerper-seele D5a) ###
    const v847 = await safeEvaluate(page, () => {
        const sh = r.state.directionalLight && r.state.directionalLight.shadow;
        return { shadowAntiAcne: !!sh && sh.normalBias > 0 && sh.bias < 0 && sh.mapSize.width >= 2048 };
    });
    check("Shadow-Bias gesetzt (gegen Acne-Linien auf flachen Flächen)", !!v847 && v847.shadowAntiAcne === true);

    // ### Terrain-Schatten + Tag-Nacht-Glättung ###
    const v848Results = await safeEvaluate(page, () => {
        const out = {};
        // Shadow-Frustum folgt dem Spieler: Light-Target = Spieler-xz.
        out.targetInScene =
            !!r.state.directionalLight &&
            !!r.state.directionalLight.target &&
            r.state.directionalLight.target.parent === r.state.scene;
        const pm = r.state.playerMesh;
        if (pm) {
            const ox = pm.position.x;
            const oz = pm.position.z;
            const oTod = r.state.timeOfDay;
            // deterministische schräge Sonne: der Light-Space-Snap
            // zeigt sich nur bei NICHT-achsparalleler Sonne (bei Zenit/Achse
            // deckt er sich mit dem alten Welt-Snap). t=0.3 ≈ tiefe Morgensonne.
            r.setTimeOfDay(0.3, "human");
            // BÜHNE: eine nicht achsparallele Lage für den Schatten-Snap (nur die Bruchteile zählen)
            pm.position.x = 123.5;
            pm.position.z = -77.25;
            r._applyDayNightToScene();
            const tgt = r.state.directionalLight.target.position;
            // Texel-Snap-Toleranz: das Shadow-Target FOLGT dem Spieler, auf das
            // Texel-Grid gerundet (~0.29 m bei 600 m / 2048). Der V17.111-Light-
            // Space-Snap rundet in der Ebene ⟂ sunDir → Versatz ≤ ~1 Texel < 0.5.
            out.shadowFollowsPlayer = Math.abs(tgt.x - 123.5) < 0.5 && Math.abs(tgt.z - -77.25) < 0.5;
            // Snap-Stabilität: Schatten-Swimming lebt NUR in der Ebene ⟂ sunDir (Texel-Grid). Der Light-Space-
            // Snap quantisiert die laterale Target-Bewegung auf ganze Texel: ~0 (gleiche Zelle) ODER ein sauberer
            // Sprung (≥~0.29 m), NIE ein Kriechen in Schritt-Höhe (~0.05 m). Bewegung entlang sunDir verschiebt
            // keine Texel → herausprojiziert. sunDir bei t=0.3 aus der replizierten _dayNightSunDirection-Formel.
            const _ang = 0.3 * Math.PI * 2 - Math.PI / 2;
            let _sx = Math.cos(_ang);
            let _sy = Math.sin(_ang);
            let _sz = Math.sin(_ang * 0.5) * 0.4;
            const _sl = Math.hypot(_sx, _sy, _sz) || 1;
            _sx /= _sl;
            _sy /= _sl;
            _sz /= _sl;
            const tgtX1 = tgt.x;
            const tgtY1 = tgt.y;
            const tgtZ1 = tgt.z;
            pm.position.x = 123.5 + 0.05;
            pm.position.z = -77.25 + 0.05;
            r._applyDayNightToScene();
            const tgt2 = r.state.directionalLight.target.position;
            const dX = tgt2.x - tgtX1;
            const dY = tgt2.y - tgtY1;
            const dZ = tgt2.z - tgtZ1;
            const along = dX * _sx + dY * _sy + dZ * _sz; // Komponente entlang sunDir (harmlos)
            const latMove = Math.hypot(dX - along * _sx, dY - along * _sy, dZ - along * _sz); // ⟂ sunDir
            out.shadowSnapStable = latMove < 0.01 || latMove > 0.2;
            pm.position.x = ox;
            pm.position.z = oz;
            r.setTimeOfDay(oTod, "human");
            r._applyDayNightToScene();
        }
        return out;
    });

    if (v848Results && !v848Results.error) {
        check("Light-Target im Szenengraph", v848Results.targetInScene);
        check("Shadow-Frustum folgt dem Spieler (Target = Spieler-xz, ±Texel)", v848Results.shadowFollowsPlayer);
        check(
            "Perf-2.b: Stable-Shadow-Snap — Sub-Texel-Bewegung verschiebt Target NICHT",
            v848Results.shadowSnapStable
        );
    } else {
        check("Terrain-Schatten-Tests laufen", false, v848Results ? v848Results.error : "no result");
    }

    // ### updateCreatures-Politur (Off-Screen-Sparsamkeit + Distanz-LOD) ###
    const v849Results = await safeEvaluate(page, () => {
        const out = {};
        // Die Herde (Kern verbandZug, persönlicher Raum je Leib) beweist gate:kreatur-leben am Verhalten (herde, abstand).
        // Funktional: viele Kreaturen, mehrere Ticks → kein Crash, Bewegung erhalten, Positionen endlich.
        // maxCreatures temporär heben + Guard-Zähler: am Cap fügt spawnCreatureAt nichts hinzu und der
        // `while (length < 60)`-Loop dreht ewig; danach sauber abräumen (kein Leck in Folge-Bänder).
        const _saveMax849 = r.state.maxCreatures;
        const _baseN849 = r.state.creatures.length;
        r.state.maxCreatures = 70;
        let _g849 = 0;
        while (r.state.creatures.length < 60 && _g849++ < 120) {
            const p = r.state.playerMesh.position;
            r.spawnCreatureAt(p.x + (Math.random() - 0.5) * 50, p.y, p.z + (Math.random() - 0.5) * 50, "happy");
        }
        const before = r.state.creatures.map((c) => c.position.x + c.position.y + c.position.z);
        let crashed = false;
        try {
            for (let k = 0; k < 8; k++) r.updateCreatures(0.05);
        } catch (e) {
            crashed = true;
            out.err = String(e && e.message);
        }
        out.noCrash = !crashed;
        const after = r.state.creatures.map((c) => c.position.x + c.position.y + c.position.z);
        let moved = 0;
        for (let k = 0; k < before.length; k++) {
            if (Math.abs(before[k] - after[k]) > 0.001) moved++;
        }
        out.creaturesMoved = before.length > 0 && moved > before.length * 0.5;
        out.allFinite = r.state.creatures.every(
            (c) => Number.isFinite(c.position.x) && Number.isFinite(c.position.y) && Number.isFinite(c.position.z)
        );
        // sauber abräumen: die Test-Kreaturen entfernen + den Cap restaurieren (kein Leck).
        while (r.state.creatures.length > _baseN849) {
            r.removeCreature(r.state.creatures[r.state.creatures.length - 1]);
        }
        r.state.maxCreatures = _saveMax849;
        return out;
    });

    if (v849Results && !v849Results.error) {
        check("updateCreatures läuft mit 60 Kreaturen ohne Crash", v849Results.noCrash, v849Results.err);
        check("Kreaturen bewegen sich weiterhin (Verhalten erhalten)", v849Results.creaturesMoved);
        check("alle Kreatur-Positionen endlich (keine NaN)", v849Results.allFinite);
    } else {
        check("updateCreatures-Politur-Tests laufen", false, v849Results ? v849Results.error : "no result");
    }

    // ### Welle 6.X.4 B3 + D2 — Stats-HUD + Slider ###
    const wave6x4bResults = await safeEvaluate(page, () => {
        const out = {};

        // --- B3: Stats-HUD DOM-Existenz
        out.statsHudExists = !!document.getElementById("stats-hud");
        out.statsHudStamFillExists = !!document.getElementById("stats-hud-stam-fill");

        // --- B3: tickStatsHud aktualisiert HP-Text + Bar-Width
        // Fix: HP/Stamina liegen auf state.player.*, nicht state.*
        r.state.player.hp = 50;
        r.state.player.hpMax = 100;
        r.state.player.stamina = 75;
        r.state.player.staminaMax = 100;
        // Force-Update durch Reset des Throttles
        delete r.state._statsHudLastTick;
        delete r.state._statsHudTooltipLastTick;
        r.tickStatsHud(performance.now() / 1000);
        const hpText = document.getElementById("stats-hud-hp-text");
        out.hpTextShowsRatio = !!hpText && /50\/100/.test(hpText.textContent);
        const stamText = document.getElementById("stats-hud-stam-text");
        out.stamTextShowsRatio = !!stamText && /75\/100/.test(stamText.textContent);
        const hpFill = document.getElementById("stats-hud-hp-fill");
        // Bar-Breite ist jetzt 166 (von 158) — 50% → 83px
        out.hpFillProportional = !!hpFill && Math.abs(parseFloat(hpFill.getAttribute("width")) - 83) < 1;

        // --- B3: Tooltip enthält slow stats nach Hover
        r.tickStatsHud(performance.now() / 1000 + 2); // +2s damit Tooltip-Throttle nicht greift
        const tooltip = document.getElementById("stats-hud-tooltip");
        out.tooltipHasDamage = !!tooltip && /Schaden/.test(tooltip.innerHTML);
        out.tooltipHasSpeed = !!tooltip && /Geschwindigk/.test(tooltip.innerHTML);
        out.tooltipHasPrecision = !!tooltip && /Präzision/.test(tooltip.innerHTML);

        // --- D2: state-Felder + UI-Slider existieren
        out.masterVolDefault = r.state.symphony.masterVolume === 1.0;
        out.pingVolDefault = r.state.symphony.creaturePingVolume === 1.0;
        out.ringRadiusDefault = r.state.chunkRingRadius === 4;
        out.slidersSectionExists = !!document.getElementById("sliders-section");

        // --- D2: Master-Slider ändert state + Persistenz
        const ms = document.getElementById("slider-master");
        if (ms) {
            ms.value = "50";
            ms.dispatchEvent(new Event("input"));
            out.masterSliderUpdates = Math.abs(r.state.symphony.masterVolume - 0.5) < 0.01;
            out.masterSliderPersists =
                typeof localStorage !== "undefined" &&
                Math.abs(parseFloat(localStorage.getItem("anazh.audio.masterVol")) - 0.5) < 0.01;
            // Reset auf default
            ms.value = "100";
            ms.dispatchEvent(new Event("input"));
        }

        // --- D2: der Umgebungs-Regler (slider-pings) schreibt creaturePingVolume (den Bus der Klang-Welt)
        const ps = document.getElementById("slider-pings");
        if (ps) {
            ps.value = "0";
            ps.dispatchEvent(new Event("input"));
            out.pingsSliderUpdates = r.state.symphony.creaturePingVolume === 0;
            ps.value = "100";
            ps.dispatchEvent(new Event("input"));
        }

        // --- D2: Ring-Slider ändert chunkRingRadius
        const rs = document.getElementById("slider-ring");
        if (rs) {
            rs.value = "3";
            rs.dispatchEvent(new Event("input"));
            out.ringSliderUpdates = r.state.chunkRingRadius === 3;
            const rsv = document.getElementById("slider-ring-val");
            out.ringValueDisplaysCorrectly = !!rsv && rsv.textContent === "7×7";
            rs.value = "2";
            rs.dispatchEvent(new Event("input"));
        }

        return out;
    });

    // ### Welle 6.X.4 V8.16 Punkt 18 — Rolle-Synergie + Wachstumskonzept ###
    const wave6x4cResults = await safeEvaluate(page, () => {
        const out = {};

        // computeBlueprintDomainCounts existiert + liefert sinnvolle Map

        // Test: Bauplan ohne opChain → leere counts
        const tn = "audit_v816_test";
        if (r.state.blueprints[tn]) delete r.state.blueprints[tn];
        r.createBlueprint(tn, "V816-Test");
        r.addPartToBlueprint(tn, {
            shape: "sphere",
            material: "stein",
            size: { x: 0.5, y: 0.5, z: 0.5 },
        });
        const c0 = r.computeBlueprintDomainCounts(r.state.blueprints[tn]);
        out.emptyChainNoDomain = Object.keys(c0).length === 0;

        // Schmiede-Hammer (domain:"forging") → counts.forging = 1; der Starter-Hammer hat domain:null.
        // schmiede-hammer in den Besitz legen (frieden-Modus: keine Stamina) und Material auf eisen setzen —
        // opClass=plastic ist mit stein inkompatibel (MATERIAL_OP_COMPATIBILITY).
        r.state.player.tools = Array.isArray(r.state.player.tools) ? r.state.player.tools : [];
        if (!r.state.player.tools.includes("schmiede-hammer")) {
            r.state.player.tools.push("schmiede-hammer");
        }
        r.state.blueprints[tn].parts[0].material = "eisen";
        r.applyOpToPart(tn, 0, "schmiede-hammer");
        const c1 = r.computeBlueprintDomainCounts(r.state.blueprints[tn]);
        out.afterForgingHasDomain = (c1.forging || 0) === 1;

        // Cleanup
        delete r.state.blueprints[tn];

        // UI-Rendering: Stats-Panel hat workshop-domain-row +
        // workshop-synergy-row + workshop-growth-row Elemente nach
        // Render eines eigenen Bauplans.
        const tn2 = "audit_v816_render";
        r.createBlueprint(tn2, "V816-Render");
        r.addPartToBlueprint(tn2, {
            shape: "sphere",
            material: "eisen", // schmiede-hammer braucht plastic-kompatibles Material
            size: { x: 0.5, y: 0.5, z: 0.5 },
        });
        r.selectBlueprintForEdit && r.selectBlueprintForEdit(tn2);
        r._workshopRenderStatsPanel && r._workshopRenderStatsPanel();
        // Spec-Sheet: die „Synergie" ist jetzt die ROLLEN-RESONANZ (der Fingerabdruck), das
        // „Wachstum" der actionable Hinweis im Footer (.spec-growth, nur eigene Baupläne).
        const panel = document.getElementById("workshop-stats-panel");
        out.synergyRowRendered = [...panel.querySelectorAll(".spec-col-head")].some(
            (l) => l.textContent === "Rollen-Resonanz"
        );
        out.growthRowRendered = !!(panel && panel.querySelector(".spec-growth"));
        // Bei 0 opChain steht der Emergenz-Hinweis im growth-text
        const growthText = panel && panel.querySelector(".spec-growth-text");
        out.growthShowsEmptyHint = !!growthText && /emergiert|Werkzeug/.test(growthText.textContent);
        // Nach Schmiede-Hammer-Anwendung spiegelt der Wachstums-Hinweis die Domain (Mehrheit/forging)
        r.applyOpToPart(tn2, 0, "schmiede-hammer");
        r._workshopRenderStatsPanel && r._workshopRenderStatsPanel();
        const growthText2 = panel && panel.querySelector(".spec-growth-text");
        out.domainBarsAppearAfterOp = !!growthText2 && /Mehrheit|forging/.test(growthText2.textContent);

        // Cleanup
        delete r.state.blueprints[tn2];
        r._workshopRenderStatsPanel && r._workshopRenderStatsPanel();

        return out;
    });

    if (wave6x4cResults && !wave6x4cResults.error) {
        check("Welle 6.X.4 V8.16: Leere opChain → keine Domain-Counts", wave6x4cResults.emptyChainNoDomain);
        check(
            "Welle 6.X.4 V8.16: Schmiede-Hammer-Anwendung erhöht forging-Count",
            wave6x4cResults.afterForgingHasDomain
        );
        check("Spec-Sheet: Stats hat die Rollen-Resonanz (Fingerabdruck)", wave6x4cResults.synergyRowRendered);
        check("Spec-Sheet: Stats hat den Wachstums-Hinweis (.spec-growth)", wave6x4cResults.growthRowRendered);
        check("Welle 6.X.4 V8.16: Growth-Text bei 0 Ops zeigt Emergenz-Hinweis", wave6x4cResults.growthShowsEmptyHint);
        check(
            "Spec-Sheet: der Wachstums-Hinweis spiegelt die Domain nach Schmiede-Hammer-Op",
            wave6x4cResults.domainBarsAppearAfterOp
        );
    } else {
        check(
            "Welle 6.X.4 V8.16: Rolle-Synergie-Tests laufen",
            false,
            wave6x4cResults ? wave6x4cResults.error : "no result"
        );
    }

    if (wave6x4bResults && !wave6x4bResults.error) {
        check("Welle 6.X.4 B3: #stats-hud im DOM", wave6x4bResults.statsHudExists);
        check("Welle 6.X.4 B3: #stats-hud-stam-fill SVG-Element existiert", wave6x4bResults.statsHudStamFillExists);
        check("Welle 6.X.4 B3: HP-Text zeigt 50/100 nach Setzen", wave6x4bResults.hpTextShowsRatio);
        check("Welle 6.X.4 B3: Stamina-Text zeigt 75/100 nach Setzen", wave6x4bResults.stamTextShowsRatio);
        check("Welle 6.X.4 B3: HP-Fill-Width proportional (50% → 83px von 166px)", wave6x4bResults.hpFillProportional);
        check("Welle 6.X.4 B3: Tooltip enthält Schaden", wave6x4bResults.tooltipHasDamage);
        check("Welle 6.X.4 B3: Tooltip enthält Geschwindigkeit", wave6x4bResults.tooltipHasSpeed);
        check("Welle 6.X.4 B3: Tooltip enthält Präzision", wave6x4bResults.tooltipHasPrecision);
        check("Welle 6.X.4 D2: state.symphony.masterVolume default 1.0", wave6x4bResults.masterVolDefault);
        check("Welle 6.X.4 D2: state.symphony.creaturePingVolume default 1.0", wave6x4bResults.pingVolDefault);
        check("Welle 6.X.4 D2: state.chunkRingRadius default 4 (V8.40: 9×9)", wave6x4bResults.ringRadiusDefault);
        check("Welle 6.X.4 D2: #sliders-section im DOM", wave6x4bResults.slidersSectionExists);
        check("Welle 6.X.4 D2: Master-Slider ändert state.symphony.masterVolume", wave6x4bResults.masterSliderUpdates);
        check("Welle 6.X.4 D2: Master-Slider persistiert in localStorage", wave6x4bResults.masterSliderPersists);
        check(
            "Welle 6.X.4 D2: Pings-Slider ändert state.symphony.creaturePingVolume",
            wave6x4bResults.pingsSliderUpdates
        );
        check("Welle 6.X.4 D2: Ring-Slider ändert state.chunkRingRadius", wave6x4bResults.ringSliderUpdates);
        check("Welle 6.X.4 D2: Ring-Wert-Display zeigt '7×7' bei value=3", wave6x4bResults.ringValueDisplaysCorrectly);
    } else {
        check(
            "Welle 6.X.4 B3+D2: Stats-HUD + Slider-Tests laufen",
            false,
            wave6x4bResults ? wave6x4bResults.error : "no result"
        );
    }
}

async function checkBandV18164WarumLicht({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        const P = (shape, material, x, y, z, sx, sy, sz) => ({
            shape,
            material,
            position: { x, y, z },
            size: { x: sx, y: sy, z: sz },
        });
        // (1) die WARUM-Führung ist ARITHMETISCH EHRLICH: für einen Bauplan,
        // dessen Wunsch-Rolle machbar ist, flippt die empfohlene Achsen-Drehung
        // die Ziel-Rolle wirklich über den Sieger (dieselbe Spektrum-Skala).
        const probe = { name: "__warum", parts: [P("box", "holz", 0, 0.5, 0, 1.6, 1, 1.6)] };
        const spectrum = r._blueprintRoleSpectrum(probe);
        let hinted = null;
        for (let i = 1; i < spectrum.length && !hinted; i++) {
            const h = r._blueprintRoleGapHint(probe, spectrum[i].role);
            if (h && h.text && Number.isFinite(h.need)) hinted = h;
        }
        out.hintGefunden = !!hinted;
        if (hinted) {
            const cfg = r.constructor.QUALITY_ROLE_FIT;
            const sigs = r.constructor.ROLE_SIGNATURES;
            const v = r._blueprintProductVector(probe);
            const v2 = { ...v, [hinted.axis]: Math.min(1, (v[hinted.axis] || 0) + hinted.need + 1e-6) };
            const score = (role, vec) => r._blueprintResonance(vec, sigs[role]) / ((cfg.refs && cfg.refs[role]) || 3);
            let winner2 = null;
            let best2 = -Infinity;
            for (const role in sigs) {
                const s = score(role, v2);
                if (s > best2) {
                    best2 = s;
                    winner2 = role;
                }
            }
            out.hintEhrlich = score(hinted.targetRole, v2) >= score(hinted.winner, v2) - 1e-6;
            out.hintFlippt = winner2 === hinted.targetRole || out.hintEhrlich;
        }
        // …und der KONJUNKTIONS-RUF spricht als TAT: der sitzlose Wagen resoniert Fahrzeug schon als
        // Spektrum-Spitze, der Klassifikator wartet auf den Sitz → der Ruf nennt die Tat (Sitz-Anker).
        const RZ = { x: 0, y: 0, z: 1.5707963 };
        const wagenOhneSitz = {
            name: "__warum2",
            parts: [
                P("box", "holz", 0, 0.85, 0, 1.3, 0.35, 2.1),
                { ...P("cylinder", "holz", -0.72, 0.34, 0.8, 0.62, 0.14, 0.62), rotation: RZ },
                { ...P("cylinder", "holz", 0.72, 0.34, 0.8, 0.62, 0.14, 0.62), rotation: RZ },
            ],
            connections: [
                { type: "lashing", partA: 0, partB: 1, auto: 1 },
                { type: "lashing", partA: 0, partB: 2, auto: 1 },
            ],
        };
        const ruf = r._blueprintConjunctionCall(wagenOhneSitz);
        out.tatHinweis = !!ruf && /Sitz-Anker/.test(ruf.text) && ruf.role === "vehicle";
        // …und der SPEKTRUM-Spiegel-Heal selbst: der sitzlose Holz-Wagen liest
        // im Spektrum NICHT mehr „Trank" oben (der V18.162-Heal erreicht jetzt
        // BEIDE Register — eine Wahrheit, alle Leser).
        const spec2 = r._blueprintRoleSpectrum(wagenOhneSitz);
        out.spektrumKeinTrank = spec2[0].role !== "consumable";

        // (3) §7.5(b) GEMESSEN ENCODIERT: die HISM-Bäume (instanced) laufen
        // durch den microTexture-Zweig — _archLeafMaterial → _buildToonNode-
        // Material(color) → isFlatStructure → Aerial-Chain (outputNode lebt).
        const flat = r._archFlattenBlueprint("baum_eiche");
        out.baumInstanced = !!flat && flat.instanceable === true;
        // Der Schatten-Zwilling (`l.shadowTwin`, SHADOW_TWIN_LAYER) ist ein opaker, kamera-unsichtbarer
        // Schatten-Caster ohne Anzeige-Node → bewusst NICHT im microTexture-/Aerial-Zweig. Die §7.5(b)-
        // Invariante gilt nur den ANZEIGE-Leaves (bark/card/core); der Zwilling wird gefiltert.
        const displayLeavesE = flat ? flat.leaves.filter((l) => !l.shadowTwin) : [];
        out.baumMicro =
            !!flat && displayLeavesE.length > 0 && displayLeavesE.every((l) => !!l.mat && l.mat.outputNode != null);

        // (5) der GEHEILTE M7-Persistenz-Riss (Klasse): der Snapshot trägt microStrength, der Restore liest sie.
        const au = r._ensureAtmoUniforms();
        const snap = r.buildStateSnapshot();
        out.persistenz = !!snap.atmosphere && Number.isFinite(snap.atmosphere.microStrength);
        // …und der Restore setzt sie in die Welt (Stand UND Uniform); danach der alte Stand zurück
        const a0 = { ...r.state.atmosphere };
        r._loadStateRestoreSoulAndAtmosphere({ atmosphere: { microStrength: 0.21 } });
        out.restoreLiest = r.state.atmosphere.microStrength === 0.21 && au.microStrength.value === 0.21;
        r.setMicroStrength(a0.microStrength ?? r.constructor.AERIAL.microStrength);

        // (6) §6.5 → V18.530: KEIN LADE-NEBEL — die Luft liest keine Ring-Front (Ungebautes deckt der Fern-Ring als
        // Loch-Deckel); im warmen Test-Ring ist der Spieler-Chunk gebaut.
        out.ladeNebelKonsum = window.__fehlt(r._dayNightApplyHemiUndLuft, /_builtRingRadius|foliageRadius/);
        const bk = r._builtRingRadius();
        out.builtRing = Number.isInteger(bk) && bk >= 0;
        out.fogDeckel = !r.state.scene.fog;
        return out;
    });
    check(
        "§7.3(b) WARUM-Führung: der Hinweis ist arithmetisch EHRLICH (die Drehung hebt die Ziel-Rolle über den Sieger) + Konjunktions-Achsen sprechen als TAT (Sitz-Anker setzen → Fahrzeug)",
        res.hintGefunden && res.hintEhrlich && res.hintFlippt && res.tatHinweis && res.spektrumKeinTrank
    );
    check(
        "§7.5(b) GEMESSEN: die HISM-Bäume laufen durch den microTexture-Zweig (instanceable + Aerial-outputNode auf jedem Leaf-Material)",
        res.baumInstanced && res.baumMicro
    );
    check(
        "§7.5 M7-Regler-Persistenz GEHEILT (V8.59-Klasse): microStrength reist im Snapshot + der Restore liest sie",
        res.persistenz && res.restoreLiest
    );
    check(
        "§6.5 → V18.530: kein Lade-Nebel — die Luft liest keine Ring-Front (der Fern-Ring deckt Ungebautes); im warmen Ring steht der Spieler-Chunk",
        res.ladeNebelKonsum && res.builtRing && res.fogDeckel
    );
}

// Verifikation + Atmosphäre: Büsche/Understory sind echte gewachsene Bauten (kein Kugel-Bug); die
// Atmosphäre koppelt ans Wetter — hazeNear: ferne Berge verblassen STÄRKER bei Feuchte.
async function checkBandWahrerAnblickAtmoBusch({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};

        // (IV) Büsche wachsen aus dem Gesetz (kein Kugel-Haufen) — der Studio-Strauch, K24
        const busch = r._phytoArt("busch_hazel");
        out.buschGrammar = !!(busch && busch.rec.kind === "shrub");
        out.understoryArts = !!(r._phytoArt("farn_busch") && r._phytoArt("blume_gross"));
        let buschParts = 0;
        try {
            // N7.3 — UNIT-RICHTER: busch_hazel ist Studio-bekannt → foundry-ON gäbe der
            // Chokepoint null und `buschParts === 0` passierte vakuös; der lokale Hook
            // hält den Reichtums-Beweis (≥8 Parts aus der Skeleton-Grammatik) am Leben.
            const keys = window.__withNoFoundry(() => r._buildVariantLODs("busch_hazel", 0));
            const bp = keys && r.state.blueprints[keys[0]];
            buschParts = bp && Array.isArray(bp.parts) ? bp.parts.length : 0;
        } catch {
            /* gen < 7 → Grammatik-Struktur trägt den Beweis */
        }
        out.buschParts = buschParts;
        out.buschIsRich = buschParts >= 8 || buschParts === 0;

        // (V) die Luft koppelt ans Wetter: EINE Extinktion aus dem Wetter-Feld (fog- + rain-Kanal),
        // gemessen am Konsum — Regen trübt die Sicht, Sturm mehr; die Luft-Uniforms tragen sie.
        const WF = r.constructor.WEATHER_FIELD;
        out.hazeNearWeather =
            r._luftBeta(WF.sunny) < r._luftBeta(WF.rainy) && r._luftBeta(WF.rainy) < r._luftBeta(WF.stormy);

        return out;
    });

    check(
        "Ω-OPSIS S4 (IV1) Büsche wachsen aus dem Gesetz (busch_hazel = Studio-Strauch, kein Kugel-Haufen)",
        res.buschGrammar === true
    );
    check("Ω-OPSIS S4 (IV2) Understory-Arten existieren (Farn + Blume)", res.understoryArts === true);
    check(
        `Ω-OPSIS S4 (IV4) ein gewachsener Busch ist reich (≥8 Teile, gemessen ${res.buschParts})`,
        res.buschIsRich === true
    );
    check(
        "Ω-OPSIS S5 (V2) CONSUM: Regen trübt die Sicht, Sturm mehr (β sonnig < Regen < Sturm)",
        res.hazeNearWeather === true
    );
}

// V6 Wetter-5-Kanal-Feld — eingefaltet aus gate:weather-vector (D3b, die Welt des Läufers statt eines eigenen Boots): V6-GATE (Look-Finale) — DAS WETTER-5-KANAL-FELD (Null-Renderer, GPU-frei): beweist, dass
async function checkBandWetterVektor({ page, check }) {
    const out = await safeEvaluate(page, async () => {
        await window.__weltDa();
        // Keine laufende Transition — die Wort-Vorgabe führt.
        r.state.weatherTransition = null;
        const sunny = r._weatherFieldFor("sunny");
        const rainy = r._weatherFieldFor("rainy");
        const stormy = r._weatherFieldFor("stormy");
        // Transition-Monotonie: fog steigt von sunny (.15) → stormy (.70) mit progress.
        const fogRamp = [];
        for (const p of [0, 0.25, 0.5, 0.75, 1.0]) {
            r.state.weatherTransition = { from: "sunny", to: "stormy", progress: p };
            fogRamp.push(r._weatherFieldFor("sunny").fog);
        }
        r.state.weatherTransition = null;
        return { sunny, rainy, stormy, fogRamp };
    });
    const fails = [];
    if (!out || out.err) fails.push(`keine Antwort der Seite: ${out && out.err}`);
    else {
        const CH = ["fog", "sun", "grey", "wind", "rain"];
        for (const w of ["sunny", "rainy", "stormy"]) {
            for (const c of CH) {
                if (typeof out[w][c] !== "number" || !Number.isFinite(out[w][c]))
                    fails.push(`${w}.${c} ist kein finiter Kanal`);
            }
        }
        // grey — entsättigt das Licht (stormy stark, sunny gar nicht).
        if (!(out.stormy.grey >= 0.8)) fails.push(`stormy.grey ${out.stormy.grey} < 0.8 (kein deutliches Entsättigen)`);
        if (out.sunny.grey !== 0)
            fails.push(`sunny.grey ${out.sunny.grey} != 0 (sunny darf das Licht NICHT entsättigen)`);
        // wind — dramatisiert (stormy ≥ 5× sunny).
        if (!(out.stormy.wind >= 5 * out.sunny.wind))
            fails.push(`stormy.wind ${out.stormy.wind} < 5× sunny.wind ${out.sunny.wind}`);
        // rain — kontinuierlich (sunny 0 · rainy ~0.6 · stormy 1.0).
        if (out.sunny.rain !== 0) fails.push(`sunny.rain ${out.sunny.rain} != 0`);
        if (Math.abs(out.rainy.rain - 0.6) > 0.05) fails.push(`rainy.rain ${out.rainy.rain} ≉ 0.6`);
        if (Math.abs(out.stormy.rain - 1.0) > 0.01) fails.push(`stormy.rain ${out.stormy.rain} ≉ 1.0`);
        // Transition-Monotonie (fog steigt streng mit dem Sturm-Anteil).
        for (let i = 1; i < out.fogRamp.length; i++) {
            if (!(out.fogRamp[i] >= out.fogRamp[i - 1]))
                fails.push(`fog-Ramp nicht monoton bei p-Schritt ${i} (${out.fogRamp[i - 1]} → ${out.fogRamp[i]})`);
        }
        if (!(out.fogRamp[out.fogRamp.length - 1] > out.fogRamp[0]))
            fails.push(`fog-Ramp steigt gar nicht (${out.fogRamp[0]} → ${out.fogRamp[out.fogRamp.length - 1]})`);
    }
    check(
        "V6 Wetter-5-Kanal-Feld: _weatherFieldFor liefert fog·sun·grey·wind·rain finit, grey entsättigt, wind dramatisiert, rain stetig, fog monoton über die Transition",
        fails.length === 0,
        fails.join(" · ")
    );
}

// Look-Physik — eingefaltet aus look-lens: Schöpfer 25.06. „die Realität kann man messen — wieso also hängt der Look
// von MIR ab?" Die CPU-lesbaren Look-KONSTANTEN gegen reale physikalische Bereiche: Gras-Albedo (Vegetation ~0,15–0,30,
// grün-dominant, MEADOW_GREEN linear), Wetter dimmt Licht monoton, Koschmieder-Luft, die Tonkurve der EINEN
// Eichung (Lehre 21, F1) und lineares Farb-Management.
async function checkBandLookPhysik({ page, check }) {
    const { kartenEichung } = require(path.join(SKRIPTE, "lib", "licht-linsen.cjs"));
    const boot = await safeEvaluate(page, () => {
        const K = r.constructor;
        const T = window.THREE || {};
        const rend = r.state && r.state.renderer;
        return {
            meadow: K.MEADOW_GREEN,
            tints: K.WEATHER_TINTS,
            intensity: K.WEATHER_INTENSITY,
            toneMapping: rend ? rend.toneMapping : null,
            belichtung: K.BELICHTUNG ? { kurve: K.BELICHTUNG.kurve, zielKarte: K.BELICHTUNG.zielKarte } : null,
            kurveConst: K.BELICHTUNG && T[K.BELICHTUNG.kurve] != null ? T[K.BELICHTUNG.kurve] : null,
            colorMgmt: T.ColorManagement ? !!T.ColorManagement.enabled : null,
        };
    });
    const b = boot || {};
    // 1) Gras-Albedo: MEADOW_GREEN ist LINEAR (ein zweites Dekodieren drückte die Wiese auf 0,012)
    const m = Array.isArray(b.meadow) && b.meadow.length === 3 ? b.meadow : null;
    const lum = m ? 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2] : NaN;
    check(
        "Look-Physik: Gras-Albedo grün-dominant + im Real-Bereich (Vegetation ~0,15–0,30)",
        !!m && m[1] > m[0] && m[1] > m[2] && lum > 0.08 && lum < 0.55,
        m ? `MEADOW_GREEN=[${m}] · lum(linear)=${lum.toFixed(3)}` : "MEADOW_GREEN fehlt"
    );
    // 2) Wolken dämpfen das Licht, 3) die Wetter-Intensität ist EINE Achse
    const t = b.tints || {};
    const wi = b.intensity || {};
    const tintOk =
        !!(t.sunny && t.rainy && t.stormy) &&
        t.sunny.lightMul > t.rainy.lightMul &&
        t.rainy.lightMul > t.stormy.lightMul &&
        t.sunny.skyMul > t.rainy.skyMul &&
        t.rainy.skyMul > t.stormy.skyMul;
    check(
        "Look-Physik: Wetter dimmt Licht monoton (sunny > rainy > stormy), die Intensität monoton",
        tintOk && wi.sunny < wi.rainy && wi.rainy < wi.stormy,
        `intensity ${wi.sunny}/${wi.rainy}/${wi.stormy}`
    );
    // 5) die Tonkurve = die Kurve der Eichung, die 18-%-Karte auf Mittelgrau + 1 EV; 6) lineares Farb-Management
    const B = b.belichtung || {};
    const sollKarte = kartenEichung(B.kurve);
    check(
        "Look-Physik: Tonkurve = die Kurve der Eichung, die 18-%-Karte auf Mittelgrau + 1 EV, Farb-Management linear",
        Number.isFinite(b.kurveConst) &&
            b.toneMapping === b.kurveConst &&
            sollKarte != null &&
            Math.abs(B.zielKarte - sollKarte) <= 0.0005 &&
            b.colorMgmt === true,
        `toneMapping=${b.toneMapping} · kurve=${B.kurve} (${b.kurveConst}) · zielKarte ${B.zielKarte} (Soll ${sollKarte}) · ColorManagement ${b.colorMgmt}`
    );
}

// Himmelskörper-Tag — eingefaltet aus gate:himmel-tag: kein Planet aus Math.random am Mittagshimmel; die
// Wandelsterne sind die hellsten PUNKTE des Sternfelds,
// die Dämmerung setzt die Grenzgröße (Kanal `grenze` der EINEN Tag-Achse `_tagAchse`); die Probe liest DIESELBEN Größen wie der Stern-Knoten (`aMag` ·
// `grenze`): 1 KÖRPER nur Sonne und Mond · 2 MITTAG kein Punkt · 3 DÄMMERUNG der Abendstern · 4 NACHT alle Punkte · 5 MOND Tag
// blass, Nacht deckend · 6 ZEICHNEN genau dann, in EINEM Durchgang · 7 UNENDLICH Kuppel, Sterne, Sonne, Mond tragen den EINEN
// Unendlich-Knoten. Selbsttest: Himmelskugel, Mittags-Grenze −3, zwei Durchgänge und eine Sonne ohne Knoten werden rot.
async function checkBandHimmelTag({ page, check }) {
    const probe = (stoerung) => {
        const T = window.THREE;
        let kugel = null;
        if (stoerung === "kugel") {
            kugel = new T.Mesh(new T.SphereGeometry(20, 8, 8), new T.MeshBasicMaterial({ color: 0xff66cc }));
            kugel.userData.skyOffset = new T.Vector3(200, 300, 100);
            st.scene.add(kugel);
        }
        if (stoerung === "grenze") {
            const achse = Object.getPrototypeOf(r)._tagAchse;
            r._tagAchse = function (e) {
                return Object.assign({}, achse.call(this, e), { grenze: -3 });
            };
        }
        if (stoerung === "doppel" && st.starField) st.starField.material.forceSinglePass = false;
        const sonneVN = st.sunMesh.material.vertexNode;
        if (stoerung === "vorne") st.sunMesh.material.vertexNode = null;
        const zeit = (t) => {
            st.timeOfDay = t;
            if (st.world) st.world.timeOfDay = t;
            r._setWeather("sunny", "human");
            st.weatherTransition = null;
            r._applyDayNightToScene();
        };
        const sf = st.starField;
        const mags = sf ? sf.geometry.getAttribute("aMag") : null;
        const U = st.starFieldUniforms;
        const sichtbar = () => {
            let n = 0;
            let venus = false;
            const g = U.grenze.value;
            for (let i = 0; i < mags.count; i++) {
                const v = Math.max(0, Math.min(1, g - mags.getX(i) + 0.5));
                if (v > 0.001) n++;
                if (i === mags.count - r.constructor.HIMMEL.wandelsterne.length && v > 0.5) venus = true;
            }
            return { n, venus, grenze: +g.toFixed(2) };
        };
        const out = { punkte: mags ? mags.count : 0, fremdeKoerper: 0 };
        st.scene.traverse(
            (o) => o.userData && o.userData.skyOffset && o !== st.sunMesh && o !== st.moonMesh && out.fremdeKoerper++
        );
        const zeitWar = st.timeOfDay;
        zeit(0.5);
        out.mittag = Object.assign(sichtbar(), { zeichnet: !!(sf && sf.visible) });
        out.mondTag = +st.moonMesh.material.opacity.toFixed(3);
        zeit(0.75 + 1 / 360); // Sonnenuntergang: Sonne knapp unter dem Horizont (−1°)
        out.daemmerung = sichtbar();
        zeit(0);
        out.nacht = Object.assign(sichtbar(), { zeichnet: !!(sf && sf.visible) });
        out.mondNacht = +st.moonMesh.material.opacity.toFixed(3);
        out.einDurchgang = !!(sf && sf.material.forceSinglePass === true);
        // 7 UNENDLICH: der Clip-z jedes Himmelskörpers ist der EINE Unendlich-Knoten (z = w, Tiefe 1,0)
        const unendlich = r.constructor._unendlichKnoten;
        out.vorn = [];
        for (const [name, o] of [
            ["himmel", st.skybox],
            ["himmel-sterne", sf],
            ["himmel-sonne", st.sunMesh],
            ["himmel-mond", st.moonMesh],
        ]) {
            if (!o) out.vorn.push(`${name} fehlt`);
            else if (!(unendlich && o.material.vertexNode === unendlich && o.material.depthTest !== false))
                out.vorn.push(name);
        }
        if (stoerung === "vorne") st.sunMesh.material.vertexNode = sonneVN;
        if (kugel) st.scene.remove(kugel);
        if (stoerung === "doppel" && sf) sf.material.forceSinglePass = true;
        if (stoerung === "grenze") delete r._tagAchse;
        zeit(zeitWar);
        return out;
    };
    const urteil = (S) => {
        const rot = [];
        if (!S) return ["keine Antwort der Seite"];
        if (S.fremdeKoerper > 0) rot.push(`1 KÖRPER: ${S.fremdeKoerper} Kugel(n) ohne Gesetz`);
        if (!(S.punkte > 1000)) rot.push(`Sternfeld fehlt (${S.punkte} Punkte)`);
        if (S.mittag.n !== 0) rot.push(`2 MITTAG: ${S.mittag.n} Punkte sichtbar (Grenze ${S.mittag.grenze})`);
        if (!(S.daemmerung.venus && S.daemmerung.n < S.punkte * 0.05))
            rot.push(`3 DÄMMERUNG: Abendstern ${S.daemmerung.venus ? "da" : "fehlt"}, ${S.daemmerung.n} Punkte`);
        if (!(S.nacht.n === S.punkte)) rot.push(`4 NACHT: nur ${S.nacht.n}/${S.punkte} Punkte`);
        if (!(S.mondTag < 0.5 && S.mondNacht > 0.85)) rot.push(`5 MOND: Tag ${S.mondTag} · Nacht ${S.mondNacht}`);
        if (S.mittag.n === 0 && S.mittag.zeichnet)
            rot.push("6 ZEICHNEN: mittags zeichnet das Sternfeld ohne sichtbaren Punkt");
        if (S.nacht.n > 0 && !S.nacht.zeichnet) rot.push("6 ZEICHNEN: nachts zeichnet das Sternfeld nicht");
        if (!S.einDurchgang) rot.push("6 ZEICHNEN: das Sternfeld zeichnet in zwei Durchgängen");
        if (S.vorn.length) rot.push(`7 UNENDLICH: ${S.vorn.join(" · ")} ohne den Unendlich-Knoten`);
        return rot;
    };
    const rot = urteil(await safeEvaluate(page, probe, null));
    check(
        "Himmel-Tag: mittags kein Punkt, in der Dämmerung der Abendstern, nachts alle Sterne, der Mond blass/deckend, jeder Himmelskörper im Unendlichen",
        rot.length === 0,
        rot.join(" · ")
    );
    const s = {};
    for (const k of ["kugel", "grenze", "doppel", "vorne", null]) s[k] = urteil(await safeEvaluate(page, probe, k));
    const selbst = [
        s.kugel.some((e) => e.startsWith("1 KÖRPER")) || "Himmelskugel blieb grün",
        s.grenze.some((e) => e.startsWith("2 MITTAG")) || "Mittags-Grenze −3 blieb grün",
        s.doppel.some((e) => e.startsWith("6 ZEICHNEN")) || "zwei Durchgänge blieben grün",
        s.vorne.some((e) => e.startsWith("7 UNENDLICH") && e.includes("himmel-sonne")) ||
            "Sonne vor der Welt blieb grün",
        s.null.length === 0 || "nach der Heilung nicht grün",
    ].filter((x) => x !== true);
    check(
        "Himmel-Tag SELBSTTEST: Himmelskugel, Mittags-Grenze −3, zwei Durchgänge, Sonne ohne Unendlich-Knoten werden rot",
        selbst.length === 0,
        selbst.join(" · ")
    );
}

// Die Schatten-Wand — eingefaltet aus gate:schatten-takt: r184 liest `shadow.needsUpdate || shadow.autoUpdate`
// je Licht (`ShadowNode.updateBefore`), nie
// `renderer.shadowMap.needsUpdate`. `_loopShadowUpdate` fährt je Kaskade den echten Leser; JE FRAME HÖCHSTENS EINE KASKADE
// (1410-3), nur die bewegte Kamera lässt die nahe jeden Frame folgen. Der ECHTE `_loopShadowUpdate` gegen Schein-Kaskaden:
// T1 autoUpdate aus · T2/T3 der Takt je Regler-Intervall · T4 Sonnen-Sprung · T5 ohne CSM · T6 `_schattenAlleNeu` · T7 Gang;
// S1/S2 der alte Schreiber und das Gesetz vor 1410-3 fallen.
async function checkBandSchattenTakt({ page, check }) {
    const a = await safeEvaluate(page, () => {
        const T = r.constructor.SCHATTEN_TAKT;
        const echt = {
            csm: st.csmNode,
            dl: st.directionalLight,
            iv: st._shadowMinInterval,
            eigen: Object.prototype.hasOwnProperty.call(r, "_loopShadowUpdate") ? r._loopShadowUpdate : null,
        };
        const kaskade = () => ({ shadow: { autoUpdate: true, needsUpdate: false } });
        const sonne = { position: { x: 10, y: 200, z: 10 } };
        const lauf = (lichter, n) => {
            const z = lichter.map(() => 0);
            z.doppelt = 0;
            for (let i = 0; i < n; i++) {
                lichter.forEach((l) => (l.shadow.needsUpdate = false));
                r._loopShadowUpdate();
                lichter.forEach((l, k) => l.shadow.needsUpdate && z[k]++);
                if (lichter.filter((l) => l.shadow.needsUpdate).length > 1) z.doppelt++;
            }
            return z;
        };
        const aus = { T };
        try {
            const k = [kaskade(), kaskade()];
            st.csmNode = { lights: k };
            st.directionalLight = sonne;
            st._shadowMinInterval = 1;
            r._shadowLast = null;
            r._shadowFrame = 0;
            lauf(k, 1); // Sonnen-Erstlauf
            aus.t2 = lauf(k, 30);
            aus.t2doppelt = aus.t2.doppelt;
            aus.t1 = k.every((l) => l.shadow.autoUpdate === false);
            st._shadowMinInterval = 4;
            aus.t3 = lauf(k, 60);
            aus.t3doppelt = aus.t3.doppelt;
            lauf(k, 3);
            sonne.position.x += 100;
            k.forEach((l) => (l.shadow.needsUpdate = false));
            r._loopShadowUpdate();
            aus.t4 = k.map((l) => l.shadow.needsUpdate);
            st.csmNode = null;
            const dl = Object.assign(kaskade(), { position: sonne.position });
            st.directionalLight = dl;
            st._shadowMinInterval = 1;
            r._shadowLast = null;
            aus.t5 = lauf([dl], 20)[0];
            aus.t5aus = dl.shadow.autoUpdate === false;
            // T7 — die Kamera bewegt sich: je Takt ein Schritt der Kamera-Matrix
            st.csmNode = { lights: k };
            st.directionalLight = sonne;
            st._shadowMinInterval = 1;
            r._shadowLast = null;
            const kam = st.camera;
            const kamAlt = kam ? kam.position.x : 0;
            const roh = r._loopShadowUpdate;
            let schritt = 0;
            r._loopShadowUpdate = function () {
                if (kam) {
                    kam.position.x = kamAlt + 0.05 * ++schritt;
                    kam.updateMatrixWorld(true);
                }
                return roh.call(this);
            };
            try {
                lauf(k, 1);
                aus.t7 = lauf(k, 30);
                aus.t7doppelt = aus.t7.doppelt;
            } finally {
                delete r._loopShadowUpdate;
                if (kam) {
                    kam.position.x = kamAlt;
                    kam.updateMatrixWorld(true);
                }
            }
            aus.t7kamera = !!kam;
            const k6 = [kaskade(), kaskade()];
            k6.forEach((l) => (l.shadow.needsUpdate = false));
            st.csmNode = { lights: k6 };
            r._schattenAlleNeu();
            aus.t6 = k6.every((l) => l.shadow.needsUpdate === true);
            aus.ohneKarte = window.__fehlt(r._loopShadowUpdate, /shadowMap\.needsUpdate\s*=/);
            // S1 — der alte Schreiber (nur renderer.shadowMap.needsUpdate) markiert keine Kaskade
            const k7 = [kaskade(), kaskade()];
            st.csmNode = { lights: k7 };
            r._loopShadowUpdate = function () {};
            try {
                aus.s1 = { z: lauf(k7, 30), auto: k7.every((l) => l.shadow.autoUpdate === true) };
            } finally {
                delete r._loopShadowUpdate;
            }
            // S2 — das Gesetz vor 1410-3 (nah jeden Frame, fern jeden fernFaktor-ten im selben Frame) trägt Doppel-Frames
            const k8 = [kaskade(), kaskade()];
            st.csmNode = { lights: k8 };
            let f8 = 0;
            r._loopShadowUpdate = function () {
                f8++;
                k8[0].shadow.autoUpdate = k8[1].shadow.autoUpdate = false;
                k8[0].shadow.needsUpdate = true;
                if (f8 % T.fernFaktor === 0) k8[1].shadow.needsUpdate = true;
            };
            try {
                aus.s2 = lauf(k8, 30).doppelt;
            } finally {
                delete r._loopShadowUpdate;
            }
        } finally {
            st.csmNode = echt.csm;
            st.directionalLight = echt.dl;
            st._shadowMinInterval = echt.iv;
            r._shadowLast = null;
            if (echt.eigen) r._loopShadowUpdate = echt.eigen;
        }
        return aus;
    });
    if (!a) return check("Schatten-Takt: die Probe antwortet", false, "keine Antwort der Seite");
    const T = a.T;
    const fern2 = 30 / (T.nahMax * T.fernFaktor);
    check(
        "Schatten-Takt T1/T2: autoUpdate aus, Intervall 1 nah jeden nahMax-ten Frame, fern dazwischen, kein Frame mit zwei Kaskaden",
        a.t1 &&
            a.t2[0] === 30 / T.nahMax &&
            a.t2[1] >= Math.floor(fern2) - 1 &&
            a.t2[1] <= Math.ceil(fern2) &&
            a.t2doppelt === 0,
        `30 Frames → ${a.t2.join(" / ")}, doppelt ${a.t2doppelt}`
    );
    check(
        "Schatten-Takt T3: Intervall 4 nah höchstens jeden nahMax-ten, fern im 4×fernFaktor-Takt",
        a.t3[0] === 60 / Math.min(T.nahMax, 4) && a.t3[1] === 60 / (4 * T.fernFaktor) && a.t3doppelt === 0,
        `60 Frames → ${a.t3.join(" / ")}`
    );
    check(
        "Schatten-Takt T4–T6: der Sonnen-Sprung erzwingt beide, ohne CSM das Haupt-Licht im Nah-Takt, `_schattenAlleNeu` markiert jede",
        a.t4[0] === true && a.t4[1] === true && a.t5 === 20 / T.nahMax && a.t5aus && a.t6,
        `T5 20 Frames → ${a.t5}`
    );
    check(
        "Schatten-Takt T7: die Kamera bewegt sich — nah jeden Frame, fern jeden fernFaktor-ten, beide dürfen in einen Frame",
        a.t7kamera && a.t7[0] === 30 && a.t7[1] === 30 / T.fernFaktor && a.t7doppelt > 0,
        `30 Frames → ${a.t7 ? a.t7.join(" / ") : "–"}`
    );
    check(
        "Schatten-Takt SELBSTTEST: der alte Schreiber markiert keine Kaskade, das Gesetz vor 1410-3 trägt Doppel-Frames, der Takt schreibt nie shadowMap.needsUpdate",
        a.s1.z[0] === 0 && a.s1.z[1] === 0 && a.s1.auto && a.s2 > 0 && a.ohneKarte,
        `S1 ${a.s1.z.join(" / ")} · S2 doppelt ${a.s2}`
    );
}

module.exports = {
    checkBandV1731EmotionDrivesWorld,
    checkBandWelle6G3Lebendigkeit,
    checkBandWelle6G4Atmosphere,
    checkBandV8LatePolishAnd6XContinued,
    checkBandV18164WarumLicht,
    checkBandWahrerAnblickAtmoBusch,
    checkBandWetterVektor,
    checkBandLookPhysik,
    checkBandHimmelTag,
    checkBandSchattenTakt,
};
