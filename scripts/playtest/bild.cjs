"use strict";
// scripts/playtest/bild.cjs — der Richter von Bild (spec/stamm/modul-karte.json): Renderer · TAAU und die EINE Skala · Ausgabe · Post · Schatten-Kaskaden · Pass-Wahl · Schirm · GPU-Kehraus · Bündel- und Zeichen-Reihe · Szene-Tiefe · Spiegel · Feld-Pass · Panorama · Höhlen-Sicht · Tag-Nacht · Atmosphäre · Himmelskörper · Sterne · Saison · Regen.
// 10 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const path = require("path");
const stammLib = require("../lib/stamm.cjs");
const { safeEvaluate, erreichbar } = require("../playtest.cjs");
const SKRIPTE = path.join(__dirname, "..");

// Emotion treibt die Welt KONTINUIERLICH (Licht + Wasser), geprüft als KONSUM: der Welt-Tint liest
// `aura.emotion` (die auraAt-Achse hat einen echten Leser), der Wasser-`uEmotion`-Haken wird
// gefüttert — beide waren sonst tote Passagiere.
async function checkBandV1731EmotionDrivesWorld({ page, check }) {
    const res = await page.evaluate(() => {
        if (r.state.emotionField) r.state.emotionField.clear(); // V17.32 — der Tint misst die GLOBALE Stimmung, kein Ort-Abdruck
        // behavioral: joy faerbt den Welt-Tint warm — DURCH die Feld-Achse (aura.emotion)
        const e = r.state.player.emotions;
        const saved = Object.assign({}, e);
        // Default `auraTintStrength` ist 0 (Slider hebt ihn) → die KONSUM-Probe forciert 1 (deterministisch),
        // um zu beweisen, dass die Feld-Emotion-Achse den Tint färbt, wenn aktiviert.
        const atmo = r.state.atmosphere;
        const k0 = atmo.auraTintStrength;
        atmo.auraTintStrength = 1;
        // der Rot-Anteil des Himmels-Tints, die Emotionen auf 0 (dazu `extra`)
        const rot = (extra) => {
            for (const k of Object.keys(e)) e[k] = 0;
            Object.assign(e, extra);
            return r._dayNightComputeTint().skyColor.r;
        };
        const cold = rot();
        const warm = rot({ joy: 0.9 });
        for (const k of Object.keys(e)) e[k] = saved[k] || 0; // restore
        atmo.auraTintStrength = k0; // restore Default (0)
        return [warm > cold, `cold.r=${cold} warm.r=${warm}`];
    });
    check("Emotion→Welt: joy faerbt den Welt-Tint warm — durch die Feld-Achse (kontinuierlich)", ...res);
}

async function checkBandWelle6G3Lebendigkeit({ page, check }) {
    // ### Welle 6.G3 — Welt-Lebendigkeit ###
    // (a) Tag-Nacht-Zyklus, (b) sanfter Wetter-Übergang —
    // Konstanten, Methoden, Persistenz, DSL-Op, UI-DOM; je Prüfung ein Satz der Seite (`out[satz] = urteil`, mit
    // Detail `[urteil, detail]`).
    const wave6g3Results = await safeEvaluate(page, () => {
        const out = {};
        const AnazhRealm = window.AnazhRealm || r.constructor;
        // die Uhr der Welt steht bei `t` (± 0,001)
        const uhr = (t) => Math.abs(st.timeOfDay - t) < 0.001;

        // --- a) Tag-Nacht-Zyklus
        // Der Test liest den Default aus der EINEN Konstante statt einer zweiten Zahl.
        out["Welle 6.G3.a: dayLengthMinutes == DAY_LENGTH_DEFAULT (die EINE Konstante)"] =
            st.dayLengthMinutes === AnazhRealm.DAY_LENGTH_DEFAULT_MINUTES;
        // das Licht der EINEN Atmosphäre über die Uhr (klare Luft; der Morgen um 0,32 steigt und knickt nicht)
        const klar = r._atmoRechnung().betaKlar(r._atmoGesetz());
        r._luftBeta = () => klar;
        try {
            const L = [0.5, 0, 0.317, 0.32, 0.323].map(
                (t) => r._atmoSonne(r._dayNightSunDirection(r._sonnenWinkel(t)).y).lum
            );
            out["Welle 6.G3.a: der Durchlass zur Sonne mittags ≥ 0,7"] = [L[0] >= 0.7, L[0]];
            out["Welle 6.G3.a: um Mitternacht unter 0,35 des Mittags"] = [L[1] < 0.35 * L[0], L[1]];
            out["der Morgen um 0,32 steigt"] = [L[4] - L[2] > 0.0018, L.join(" ")];
            out["der Morgen um 0,32 knickt nicht (C1)"] = [Math.abs(2 * L[3] - L[2] - L[4]) < 0.0018, L.join(" ")];
        } finally {
            delete r._luftBeta;
        }

        // setTimeOfDay setzt korrekt
        r.setTimeOfDay(0.25, "human");
        out["Welle 6.G3.a: setTimeOfDay(0.25) setzt state korrekt"] = uhr(0.25);
        out["Welle 6.G3.a: _timeOfDayLabel(0.25) zeigt 06:00"] = r._timeOfDayLabel(0.25).includes("06:");

        // tickDayNight schreitet voran
        r.setTimeOfDay(0.4, "human");
        const beforeT = st.timeOfDay;
        st._lastDayNightTick = 0;
        r.tickDayNight(0.5); // 0.5 s delta, dayLength=60min=3600s → +0.00014
        out["Welle 6.G3.a: tickDayNight schreitet timeOfDay voran"] = st.timeOfDay > beforeT;
        // setDayLength clamped: 5 wirkt, > max 60, < min 1
        for (const [satz, l, soll] of [
            ["Welle 6.G3.a: setDayLength(5) wirkt", 5, 5],
            ["Welle 6.G3.a: setDayLength clamped >60 auf 60", 999, 60],
            ["Welle 6.G3.a: setDayLength clamped <1 auf 1", 0, 1],
        ]) {
            r.setDayLength(l);
            out[satz] = st.dayLengthMinutes === soll;
        }
        r.setDayLength(AnazhRealm.DAY_LENGTH_DEFAULT_MINUTES); // zurück

        // DSL-Op set_time_of_day — die Uhr gehört dem Spieler: sein Satz stellt sie, der Nexus nie
        r.dslRun(["set_time_of_day", 0.7], { source: "human" });
        out["Welle 6.G3.a: DSL-Op set_time_of_day wirkt (Satz des Spielers)"] = uhr(0.7);
        const nexusUhr = r.dslRun(["set_time_of_day", 0.1], { source: "nexus" });
        out["Leben-Schau 2: set_time_of_day des Nexus stellt die Uhr nie (uhr_gehalten im Protokoll)"] =
            uhr(0.7) && nexusUhr.log.some((e) => e.event === "uhr_gehalten");
        // NON_BROADCASTABLE
        out["Welle 6.G3.a: set_time_of_day in NON_BROADCASTABLE_OPS"] =
            AnazhRealm.NON_BROADCASTABLE_OPS.has("set_time_of_day");

        // _applyDayNightToScene setzt DirectionalLight-Position + -Farbe/-Intensität: tags die SONNE (oben,
        // hell, warm), nachts der MOND gegenüber der Sonne — AUCH über dem Horizont, gedämpft + kühl
        // (ein Licht von unten wüsche die Nacht aus).
        const dl = st.directionalLight;
        r.setTimeOfDay(0.5, "human"); // Mittag
        const noonY = dl.position.y;
        const noonInt = dl.intensity;
        r.setTimeOfDay(0, "human"); // Mitternacht
        // Mondlicht ist kühl (b > r)
        out[
            "Welle 6.G3.a: DirectionalLight folgt timeOfDay (Mittag=Sonne oben/hell, Mitternacht=Mond oben/gedämpft+kühl, V18.377)"
        ] = noonY > 0 && dl.position.y > 0 && dl.intensity < noonInt && dl.color.b > dl.color.r;

        // --- b) Sanfte Wetter-Übergänge
        const wxL = globalThis.__phytoCore.WX_LICHT; // K2: der Tint IST die Sonne der Wetter-Zeile, kein zweiter Wert
        out["Welle 6.G3.b: WEATHER_TINTS = die Sonne der Wetter-Zeile (skyMul = sun, lightMul = WX_LICHT)"] =
            Object.keys(AnazhRealm.WEATHER_FIELD).every((w) => {
                const [s, t] = [AnazhRealm.WEATHER_FIELD[w].sun, AnazhRealm.WEATHER_TINTS[w]];
                return t.skyMul === s && t.lightMul === wxL.sockel + wxL.sonne * s;
            });

        // Setze sunny als Ausgangspunkt
        st.weather = "sunny";
        st.weatherTransition = null;
        // der Satz des Spielers blendet vom Wetter davor über
        r.dslRun(["weather", "rainy"], { source: "human" });
        out["Welle 6.G3.b: weatherTransition.from = vorheriges Wetter (sunny)"] =
            st.weatherTransition && st.weatherTransition.from === "sunny";
        // requestWeatherTransition(rainy) wenn schon rainy → no-op (gleiches to)
        out["Welle 6.G3.b: requestWeatherTransition mit selbem Ziel ist idempotent (true ohne neu zu starten)"] =
            r.requestWeatherTransition("rainy") === true;
        // tickWeatherTransition setzt progress voran
        st.weatherTransition.startedAt -= 0.1; // 100 ms der Welt-Uhr
        r.tickWeatherTransition(0);
        out["Welle 6.G3.b: tickWeatherTransition schreitet progress voran"] =
            st.weatherTransition && st.weatherTransition.progress > 0;
        // Bei progress=1 wird die transition geclearet. Offset > Cap (120 s), damit die Probe deterministisch
        // ist — die Emotion-Modulation streckt die Default-Dauer auf bis zu ~86 s.
        if (st.weatherTransition) {
            st.weatherTransition.startedAt -= 200; // 200 s > 120-s-Cap
        }
        r.tickWeatherTransition(0);
        out["Welle 6.G3.b: tickWeatherTransition löscht Transition bei progress=1"] = st.weatherTransition === null;

        // --- c) den Fauna-Lifecycle (Geburt, Hungertod des Ältesten, Trauer, Journal) misst gate:kreatur-takt kaskade

        return out;
    });

    if (erreichbar(check, "Welle 6.G3: alle Tests laufen", wave6g3Results, "no result"))
        for (const s in wave6g3Results) check(s, ...[wave6g3Results[s]].flat());

    // ### Welle 6.G3 V2 — Vision-Invarianten ###
    // Prüft EMERGENZ statt Mechanik: wirkt Welt-Affinität auf die Soul-Wahl? Folgen Frequenzen den
    // Tags? Modulieren Emotionen den Tint? Ist die Wetter-Dauer emotion-abhängig?
    const wave6g3v2Results = await safeEvaluate(page, () => {
        const out = {};
        const AnazhRealm = window.AnazhRealm || r.constructor;
        const emo = st.player.emotions;

        // --- Wurzel-Helper existieren

        // --- Vision 1: Affinity-Pick wählt höhere Resonanz
        // Test-Kandidaten mit klaren Tag-Profilen
        const candidates = [
            { name: "lebendigSoul", tags: { lebendig: 1.0, dichte: 0, glut: 0, magieleitung: 0 } },
            { name: "magieSoul", tags: { lebendig: 0, dichte: 0, glut: 0, magieleitung: 1.0 } },
            { name: "dichteSoul", tags: { lebendig: 0, dichte: 1.0, glut: 0, magieleitung: 0 } },
        ];
        // die Welt-Felder mit dominanter Magie- und Dichte-Achse
        const feldMagie = { lebendig: 0.1, dichte: 0.1, glut: 0.1, magieleitung: 0.9 };
        const feldDichte = { lebendig: 0.1, dichte: 0.9, glut: 0.1, magieleitung: 0.1 };
        // wie oft die Seele `name` im Welt-Feld `feld` gewinnt — 30 Durchläufe, Statistik gegen das Noise
        const siege = (feld, name) => {
            let n = 0;
            for (let i = 0; i < 30; i++) {
                const pickResult = r._affinityPickFromCandidates(candidates, feld, 0.05);
                if (pickResult.pick && pickResult.pick.name === name) n++;
            }
            return n;
        };
        // Welt-Feld mit dominanter Magie-Achse: > 66% (statistisch sicher)
        out["Welle 6.G3 V2 Vision: Affinity-Pick wählt magieSoul in magie-Welt (>66%, 30 Runs)"] =
            siege({ ...feldMagie }, "magieSoul") > 20;
        // Diskrimination: in einer dichte-Welt wird dichteSoul bevorzugt
        out["Welle 6.G3 V2 Vision: Affinity-Pick wählt dichteSoul in dichte-Welt (>66%, 30 Runs)"] =
            siege({ ...feldDichte }, "dichteSoul") > 20;

        // --- Vision 2: die Stimme folgt dem KÖRPER — der Tier-Ruf des klang-Gesetzbuchs
        // (Grundton ∝ Körperlänge^−0,9): das kleine Wesen ruft höher als das große.
        const rufKern = AnazhRealm._umweltGesetz().kern;
        const kleinF0 = rufKern.tierRufPuffer({ laengeM: 0.7, stimmung: "freude", saat: 1 }).f0;
        const grossF0 = rufKern.tierRufPuffer({ laengeM: 2.2, stimmung: "freude", saat: 1 }).f0;
        out["Welle 5 Klang: der Tier-Ruf folgt dem Körper (0,7 m ruft höher als 2,2 m)"] = kleinF0 > grossF0;
        out["Welle 5 Klang: beide Ruf-Grundtöne im Range [60, 2000] Hz"] =
            kleinF0 >= 60 && kleinF0 <= 2000 && grossF0 >= 60 && grossF0 <= 2000;

        // --- Vision 3: _emotionModulate moduliert mit Emotion-Achsen
        const baseMod = r._emotionModulate(10, { joy: 5 }, { joy: 0, sorrow: 0 });
        const happyMod = r._emotionModulate(10, { joy: 5 }, { joy: 1, sorrow: 0 });
        out["Welle 6.G3 V2 Vision: _emotionModulate additiv (joy=1 → +5 auf base 10 = 15)"] =
            Math.abs(happyMod - 15) < 0.001 && Math.abs(baseMod - 10) < 0.001;
        // Mul-Spec
        const peaceMod = r._emotionModulate(100, { peace: { mul: 1.5 } }, { peace: 1 });
        out["Welle 6.G3 V2 Vision: _emotionModulate multiplikativ (peace=1 + mul:1.5 → ×1.5)"] =
            Math.abs(peaceMod - 150) < 0.001;

        // --- Vision 4: Sky-Tint moduliert mit awe
        // Setze awe=0, lese sky-Color; setze awe=1, vergleiche.
        r.setTimeOfDay(0.5, "human"); // Mittag
        Object.assign(emo, { awe: 0, joy: 0, sorrow: 0 });
        st.weather = "sunny";
        st.weatherTransition = null;
        // der Tint liest jetzt die RÄUMLICHE emotion-Achse (`aura.emotion`,
        // global + lokaler Abdruck). Diese Probe misst die GLOBALE Emotion→Tint-
        // Kopplung isoliert → das emotionField clearen (sonst blenden Orts-Abdrücke
        // aus früheren _feelAction-Bands rein).
        if (st.emotionField) st.emotionField.clear();
        // Der Look-Default `auraTintStrength` macht den Feld/Emotion-Tint subtil → Margen-Tests würden
        // flaky. Die Proben prüfen den MECHANISMUS bei VOLLER Stärke (1.0: große, deterministische Marge);
        // zurückgesetzt am Block-Ende (vor Vision 6).
        const atmo = st.atmosphere;
        const _origAuraKg3 = atmo.auraTintStrength;
        atmo.auraTintStrength = 1;
        r._applyDayNightToScene();
        // Doku-Sync: skyboxMaterial ist jetzt MeshBasicNodeMaterial,
        // Uniforms leben in state.skyboxUniforms (uniform-Knoten mit .value).
        const skyU = st.skyboxUniforms.himmelTint;
        const skyAtAweZero = skyU.value.clone();
        emo.awe = 1.0;
        r._applyDayNightToScene();
        const skyAtAweHigh = skyU.value.clone();
        // Bei awe=1 sollte b (Blau-Anteil) sichtbar höher sein
        out["Welle 6.G3 V2 Vision: awe=1 hebt Sky-Blau-Anteil sichtbar"] = skyAtAweHigh.b > skyAtAweZero.b + 0.02;
        // r-Anteil auch (Lila = Rot + Blau)
        out["Welle 6.G3 V2 Vision: awe=1 hebt Sky-Rot-Anteil (Magie = Lila)"] = skyAtAweHigh.r > skyAtAweZero.r + 0.01;

        // --- Vision 5: sorrow entsättigt den Welt-Tint — gemessen am ROHEN Tint via
        // `_dayNightComputeTint()` (der Himmel des Studios: sorrow grayt ~40 %), nicht am live `himmelTint`
        // (der skyTint-Blend verdünnt auf ~3 % → flaky). Gleicher Ort, emotionField leer → nur sorrow zählt.
        const satG3 = (c) => Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b);
        emo.awe = 0;
        emo.sorrow = 0;
        const satG3Zero = satG3(r._dayNightComputeTint().skyColor);
        emo.sorrow = 1.0;
        out["Welle 6.G3 V2 Vision: sorrow=1 reduziert Sky-Sättigung"] =
            satG3(r._dayNightComputeTint().skyColor) < satG3Zero;
        // Reset
        emo.sorrow = 0;
        r._applyDayNightToScene();

        // --- Vision 6: Wetter-Dauer skaliert mit Emotion
        // peace=1 → Dauer > Default. chaos=1 → Dauer < Default; die Dauer des Übergangs sonnig → Regen bei
        // Frieden `peace` und Chaos `chaos` (Default-Dauer ~45000)
        const dauer = (peace, chaos) => {
            st.weatherTransition = null;
            st.weather = "sunny";
            Object.assign(emo, { peace, chaos });
            r.requestWeatherTransition("rainy");
            return st.weatherTransition && st.weatherTransition.duration;
        };
        const defaultDur = dauer(0, 0);
        const peaceDur = dauer(1, 0);
        const chaosDur = dauer(0, 1);
        st.weatherTransition = null;
        st.weather = "sunny";
        emo.chaos = 0;
        out["Welle 6.G3 V2 Vision: peace=1 verlängert Wetter-Dauer (>120%)"] = peaceDur > defaultDur * 1.2;
        out["Welle 6.G3 V2 Vision: chaos=1 verkürzt Wetter-Dauer (<70%)"] = chaosDur < defaultDur * 0.7;

        // BÜHNE: zurück an den Ursprung der Testzelle
        st.playerMesh.position.x = 0;

        // --- Vision 9: Sonne + Mond folgen der Tageszeit (Sternfeld, Mittags-Grenze und Unendlich prüft Himmel-Tag)
        // Die Orbit-HÖHE lebt im skyOffset (Welt-Position = camera + skyOffset, pro Frame gesetzt in
        // `_followCelestialBodies`; dieser Test ruft kein _loopRender) → skyOffset.y (= sin(angle)·380)
        // ist das kamera-unabhängige Maß für über/unter dem Horizont.
        const offY = (m) => (m.userData && m.userData.skyOffset ? m.userData.skyOffset.y : m.position.y);
        // die Höhen von Sonne und Mond um `t`
        const himmel = (t) => {
            r.setTimeOfDay(t, "human");
            r._applyDayNightToScene();
            return [offY(st.sunMesh), offY(st.moonMesh)];
        };
        const [sunYNoon, moonYNoon] = himmel(0.5); // Mittag
        const [sunYMidnight, moonYMidnight] = himmel(0); // Mitternacht
        // Mittag: Sonne oben, Mond unten. Mitternacht: umgekehrt.
        out["Welle 6.G3 V2 Vision: Sonne hoch am Mittag (y > 100)"] = sunYNoon > 100;
        out["Welle 6.G3 V2 Vision: Mond niedrig am Mittag (y < -100)"] = moonYNoon < -100;
        out["Welle 6.G3 V2 Vision: Sonne niedrig nachts (y < -100)"] = sunYMidnight < -100;
        out["Welle 6.G3 V2 Vision: Mond hoch nachts (y > 100)"] = moonYMidnight > 100;
        r.setTimeOfDay(0.5, "human"); // Reset

        // --- Vision 10: Sky-Tint moduliert mit Welt-Feld (magie-Region)
        // (auraTintStrength=1 gilt noch aus dem Block-Anfang — Mechanismus-Marge.)
        // Mock worldFieldAt für hohe magieleitung
        const origWFA = r.worldFieldAt;
        r.worldFieldAt = () => ({ ...feldMagie });
        emo.awe = 0;
        r._applyDayNightToScene();
        const skyMagieField = skyU.value.clone();
        r.worldFieldAt = () => ({ ...feldDichte });
        r._applyDayNightToScene();
        // Magie-Region sollte mehr Blau haben als dichte-Region
        out["Welle 6.G3 V2 Vision: magie-Welt-Region hebt Sky-Blau (vs dichte-Region)"] =
            skyMagieField.b > skyU.value.b + 0.02;
        // Reset (auch den Aura-Tint-Default vom Block-Anfang)
        atmo.auraTintStrength = _origAuraKg3;
        r.worldFieldAt = origWFA;
        r._applyDayNightToScene();

        return out;
    });

    if (erreichbar(check, "Welle 6.G3 V2: Vision-Tests laufen", wave6g3v2Results, "no result"))
        for (const s in wave6g3v2Results) check(s, wave6g3v2Results[s]);
}

async function checkBandWelle6G4Atmosphere({ page, check }) {
    // ### 6.G4.a — Welt unter wandernder Sonne (Hemisphere + Licht-Material + Fog) ###
    // Tiefe statt homogenem Licht: Hemisphere-Light (Sky-Tint oben, Erd-Tint unten) + licht-reaktives
    // Material + atmosphärischer Fog; je Prüfung ein Satz der Seite (`out[satz] = urteil`).
    const v827Results = await safeEvaluate(page, async () => {
        const out = {};

        // 1. HemisphereLight im Scene + state-cached
        // Die In-Streuung der Luft IST der Himmel der EINEN Atmosphäre: nach dem ersten _applyDayNightToScene trägt
        // die Tafel das Licht von Sonne oder Mond (die Farbe über Wasser liest himmelFarbe, nie ein eigenes Uniform)
        r._applyDayNightToScene();
        const atmoU = r._atmoLutBau().U;
        const mE = atmoU.mondE.value;
        out["V8.27/D3: die Luft streut den Himmel der EINEN Atmosphäre, _applyDayNightToScene setzt sein Licht"] =
            atmoU.licht.value > 0 && mE.x + mE.y + mE.z > 0;

        // EIN Himmel: am Tag IST die Himmels-Umgebung der Himmel — Hemi trägt nur den
        // Nachthimmel-Boden (Mittag 0, Mitternacht > 0). Dazu die Belichtung aus dem Licht: mittags steht die
        // 18-%-Karte am Anker (Mittelgrau + 1 EV unter der Zenit-Sonne, `_belichtungAnker`), nachts am Deckel.
        // Die Belichtung liest die Lichter ihrer Anwendung (S7), nie die zurückgelesene Umgebung.
        r.setTimeOfDay(0.5, "human");
        const intensityNoon = st.hemiLight.intensity;
        const belichtungMittag = st.renderer.toneMappingExposure;
        r.setTimeOfDay(0, "human");
        const belichtungNacht = st.renderer.toneMappingExposure;
        out["EIN Himmel — Hemi trägt nur den Nachthimmel-Boden (Mittag 0)"] =
            intensityNoon < 0.01 && st.hemiLight.intensity > 0.05;
        const B = r.constructor.BELICHTUNG;
        const kAnker = B.zielKarte / ((0.18 / Math.PI) * r._belichtungAnker());
        out[
            `Belichtung aus dem Licht — mittags die Karte am Anker, nachts am Deckel (Mittag / Anker / Nacht ${[belichtungMittag, kAnker, belichtungNacht].map((v) => +(+v).toFixed(3)).join(" / ")})`
        ] = Math.abs(belichtungMittag / kAnker - 1) < 0.1 && Math.abs(belichtungNacht - B.max) < 1e-6;

        // 3. Hemisphere-groundColor moduliert mit Welt-Affinität. Der Feld→Boden-Term ist hinter
        // `tint.auraK` gegated (Default `auraTintStrength` 0) — der MECHANISMUS lebt als Opt-in → das Band
        // testet MIT Opt-in und mockt den echten Leser (auraAt).
        r.setTimeOfDay(0.5, "human");
        const origWFA = r.worldFieldAt;
        const origAuraAt = r.auraAt;
        const atmo = st.atmosphere;
        const savedAuraStrength = atmo.auraTintStrength;
        atmo.auraTintStrength = 1;
        r.worldFieldAt = () => ({ lebendig: 0.9, dichte: 0.05, glut: 0.05, magieleitung: 0.05 });
        r.auraAt = (x, z) => r.worldFieldAt(x, z);
        r._applyDayNightToScene();
        // Mit `ColorManagement.enabled=true` speichert THREE.Color LINEAR (setHex/setRGB konvertieren
        // sRGB→linear) → verglichen wird die sRGB-Display-Form via `convertLinearToSRGB()`; die Schwelle
        // meint die wahrgenommene Helligkeit.
        const tmpColor = new window.THREE.Color();
        const boden = () => tmpColor.copy(st.hemiLight.groundColor).convertLinearToSRGB();
        const groundLebendigG = boden().g;
        r.worldFieldAt = () => ({ lebendig: 0.05, dichte: 0.05, glut: 0.9, magieleitung: 0.05 });
        r._applyDayNightToScene();
        // lebendig erhöht Grün, glut erhöht Rot
        out["HemisphereLight.groundColor.g hoch in lebendig-Region"] = groundLebendigG > 0.3;
        out["HemisphereLight.groundColor.r hoch in glut-Region"] = boden().r > 0.5;
        r.worldFieldAt = origWFA;
        r.auraAt = origAuraAt;
        atmo.auraTintStrength = savedAuraStrength;
        r._applyDayNightToScene();

        // 4. Architektur-Material ist licht-reaktiv (Toon/PBR) — geprüft am KLASSISCHEN Bau-Pfad
        // (_buildFromBlueprint): stein_block ist Studio-bekannt und stünde foundry-ON als f:-Instanz ohne
        // entry.mesh → lokaler Hook; der Spawn wird IMMER entfernt (auch mesh-los — kein Test-Leck).
        let hasToonMaterial = false;
        if (st.blueprints.stein_block) {
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
        out["V8.28/234: Architektur-Material reagiert auf Licht (MeshToon ODER MeshStandard/PBR)"] = hasToonMaterial;

        // Terrain-Tag/Nacht = die geteilten PBR-Lichter (Sonne/Fog/Hemisphere) — geprüft in den
        // `_applyDayNightToScene`-Bändern, nicht hier.

        return out;
    });

    if (erreichbar(check, "Tiefe-Welle Tests laufen", v827Results, "no result"))
        for (const s in v827Results) check(s, v827Results[s]);

    // ### V8.28 6.G4.b — Welt-Atem-Vollendung (Sterne/Terrain/Cel/Wind/Wolken/Wasser) ###
    // Schöpfer-Beobachtung: Sterne flackern bei Kamera-Rotation,
    // Terrain nur nach Höhe gefärbt, kein Wind/Wolken/Wasser.
    const v828Results = await safeEvaluate(page, () => {
        const out = {};

        // --- Phase D: Wind + Wolken + Wasser ---
        // Wind lebt jetzt im Instanced-Gras-Material — geteilt.
        const wm1 = r._grassInstanceMat();
        out["D: _grassInstanceMat ist geteilt/gecached (eine Kompilierung)"] = !!wm1 && wm1 === r._grassInstanceMat();
        // Wolken-Cover (der Uniform-Knoten in state.skyboxUniforms) folgt weather (liest state.skyboxUniforms). weatherTransition leeren: eine aktive
        // Warmup-Transition überstimmt state.weather in `_weatherBlendedValue` (beide Lesungen gleich).
        const wolken = (w) => {
            st.weatherTransition = null;
            st.weather = w;
            r._applyDayNightToScene();
            return st.skyboxUniforms.cloudCover.value;
        };
        out["D: Wolken-Cover folgt weather (rainy > sunny)"] = wolken("rainy") > wolken("sunny");
        // ===== WELLE J3 — die Himmelskörper folgen der KAMERA, nicht dem Ursprung =====
        // KONSUM: nach fernem Kamera-Teleport steht die Sonne nahe der Kamera (in Himmelsrichtung),
        // nicht um den Welt-Ursprung.
        let folgt = false,
            fern = false;
        if (st.sunMesh && st.camera) {
            r._updateCelestialBodies(Math.PI * 0.3, 1.0); // setzt skyOffset
            const camOrig = st.camera.position.clone();
            // BÜHNE: ein ferner Spieler für den Himmels-Folger (nur der Abstand zählt)
            st.camera.position.set(2000, 50, 2000); // ferner Spieler
            r._followCelestialBodies();
            const sun = st.sunMesh;
            const off = sun.userData && sun.userData.skyOffset ? sun.userData.skyOffset : null;
            if (off) {
                // Sonne ~|skyOffset| von der Kamera entfernt (in Himmelsrichtung)…
                folgt = Math.abs(sun.position.distanceTo(st.camera.position) - off.length()) < 1.0;
                // …und WEIT vom Ursprung (sie orbitiert nicht mehr um (0,0,0)).
                fern = sun.position.length() > 1500;
            }
            st.camera.position.copy(camOrig);
            r._followCelestialBodies();
        }
        out["V17.J3: die Sonne folgt der Kamera (|Pos−Kamera| ≈ skyOffset, nicht origin-orbit)"] = folgt;
        out["V17.J3: die Sonne orbitet NICHT mehr den Welt-Ursprung (fern bei fernem Spieler)"] = fern;
        // Der Terrain-colorNode (triplanar + Wiese + Aerial) baut OHNE Stoff-Bruch — der Zeuge zählt jede Meldung
        // „STOFF: …" über den Bau (K22; der Marker `__toonColorNodeError` hatte keinen Schreiber mehr).
        const _zTerr = window.__stoffZeuge(r);
        let _terrMat = null;
        try {
            _terrMat = r._buildToonNodeMaterial({ vertexColors: true });
        } finally {
            _zTerr.zu();
        }
        const terrBruch = _zTerr.brueche[0];
        out[
            `Terrain-colorNode (triplanar-Textur) baut OHNE geschluckte Exception${terrBruch ? " — " + terrBruch : ""}`
        ] = !!(_terrMat && _terrMat.colorNode) && _zTerr.brueche.length === 0;
        const _zAer = window.__stoffZeuge(r); // der Zeuge der Aerial-Prüfung (6): Struktur und Phantom
        // Die 2.5D-Lichtung flacht nur die SHADING-Normale (normalNode, eingefrorene Konstante); die
        // GEOMETRIE behält die echte Normale (Schatten-Bias-Vertrag — gebackene Normalen = Akne an Hängen).
        out["B3: die 2.5D-Lichtung flacht die SHADING-Normale (normalNode, eingefrorene Konstante)"] = !!(
            _terrMat && _terrMat.normalNode
        );
        // Der AKNE-WÄCHTER: ein echter Chunk trägt VARIIERENDE Normalen
        // (mindestens ein gesampelter Vertex weicht von up ab) — ein
        // up-gebackenes Normal-Attribut wäre die Akne-Regression.
        out["AKNE-WÄCHTER: die Chunk-GEOMETRIE trägt echte Oberflächen-Normalen (Schatten-Vertrag)"] = (() => {
            try {
                for (const entry of st.voxelChunks.values()) {
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
        out[
            "V17.J → F6: das Terrain trägt keine Antwort nach dem Licht (kein outputNode — der Boden leuchtet nicht aus sich selbst)"
        ] = !!_terrMat && !_terrMat.outputNode;
        // (2) Struktur (Flach-Farbe) bekommt DENSELBEN outputNode + Mikro-Tiefe.
        const _structMat = r._buildToonNodeMaterial({ color: 0x808080 });
        out["V17.J: Struktur bekommt DENSELBEN Aerial-outputNode (eine Atmosphäre, viele Leser)"] = !!(
            _structMat && _structMat.outputNode
        );
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
        out["V17.J: die dynamische material.color bleibt setzbar (kein colorNode-Override)"] = _dynColorOk;
        // (5) transparentes Phantom bekommt KEINEN Aerial-outputNode (UI-Element).
        const _phantomMat = r._buildToonNodeMaterial({ color: 0x44ccff, transparent: true, opacity: 0.4 });
        out["V17.J: transparentes Phantom bekommt KEINEN Aerial-outputNode (UI-Element)"] =
            !!_phantomMat && !_phantomMat.outputNode;
        // (6) kein still gefangener Node-Fehler (V17.12-Marker-Disziplin): der Zeuge zählte jeden Stoff-Bruch von
        // Terrain, Struktur, Phantom
        const _aerBrueche = _zAer.zu().concat(_zTerr.brueche);
        out[`V17.J: kein still gefangener Aerial-Node-Fehler${_aerBrueche[0] ? " — " + _aerBrueche[0] : ""}`] =
            _aerBrueche.length === 0;
        // Welt-Wasser — das Wasser sind per-Chunk-Iso-Surface-Meshes
        // (`voxelChunkWaterIso`-Map) aus dem Cell-Feld. Der alte Quad-Mesh-
        // Pfad ist gestrichen.

        // --- Atmosphäre-Persistenz --- (der Nebel-Regler ist fort, die Mikro-Struktur trägt den Beweis)
        const microAlt = st.atmosphere.microStrength;
        r.setMicroStrength(0.15);
        const snap = r.buildStateSnapshot();
        out["state.atmosphere persistiert im Snapshot"] = !!(
            snap &&
            snap.atmosphere &&
            Math.abs(snap.atmosphere.microStrength - 0.15) < 0.01
        );
        r.setMicroStrength(microAlt ?? r.constructor.AERIAL.microStrength);
        // J4-Regler — KONSUM: setCavityAO/setEdgeSharp pushen live ins Uniform +
        // persistieren in state.atmosphere (so liest der Slider den Wert ab).
        const au = r._ensureAtmoUniforms();
        out["V17.J4: setCavityAO pusht live ins aoScale-Uniform + persistiert (Slider-KONSUM)"] =
            r.setCavityAO(0.3) === 0.3 && st.atmosphere.cavityAO === 0.3 && Math.abs(au.aoScale.value - 0.3) < 1e-6;
        out["V17.J4: setEdgeSharp setzt die Post-FX-Kanten-Schärfe + persistiert"] =
            r.setEdgeSharp(0) === 0 && st.atmosphere.kantenSchaerfe === 0;
        out["setSurfaceTexture pusht live ins triplanar-Uniform + persistiert"] =
            r.setSurfaceTexture(0) === 0 && st.atmosphere.triplanar === 0 && au.triplanarScale.value === 0;
        out["setColorVariation pusht live ins tint-Uniform (die warm/kühl-Patches)"] =
            r.setColorVariation(0) === 0 && st.atmosphere.colorVar === 0 && au.tintScale.value === 0;
        // B3: setTerrainFlatten/Slider/Uniform sind GESCHNITTEN (gebacken);
        // die Wahrheit lebt als statische Konstante (Worker-Mirror-Vertrag).
        out["B3: Slider+Setter geschnitten; der Konsolen-Hebel lebt aus der Konstante"] =
            typeof r.setTerrainFlatten === "undefined" &&
            Number.isFinite(AnazhRealm.TERRAIN_NORMAL_FLATTEN) &&
            !!au.terrainFlatten &&
            Math.abs(au.terrainFlatten.value - AnazhRealm.TERRAIN_NORMAL_FLATTEN) < 1e-6 &&
            !document.getElementById("slider-flatten");
        out["Slider-Headroom — Kavitäts-AO/Oberflächen-Textur clampen auf 2.0, nicht 1.0"] =
            r.setCavityAO(1.5) === 1.5 && r.setSurfaceTexture(1.5) === 1.5;
        // Werte wiederherstellen, die der j4SlidersPersist-Test unten erwartet
        // (mein Headroom-Check hat cavityAO/triplanar verändert).
        r.setCavityAO(0.3);
        r.setSurfaceTexture(0);
        r.setColorVariation(1.0);
        const snap2 = r.buildStateSnapshot();
        out["V17.J4: die beiden Render-Regler reisen im Snapshot mit"] = !!(
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

    if (erreichbar(check, "Welt-Atem-Vollendung Tests laufen", v828Results, "no result"))
        for (const s in v828Results) check(s, v828Results[s]);

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
            const pm = st.playerMesh;
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
            const vorher = st.cameraMode;
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
            out[
                "(0910-5): die Ego-Sicht ist EIN Ebenen-Schalter — 1st nimmt den Leib aus Ebene 0 auf SHADOW_TWIN_LAYER (er wirft), 3rd gibt die Maske zurück, visible wechselt nie"
            ] = [
                leib > 0 && ego === true && zurueck === true,
                JSON.stringify({ knoten: knoten.length, leib, ego, zurueck }),
            ];
        }

        // --- Instanced-Gras: `state.voxelChunkGrass` (der Bau verbucht je Chunk), `_grassInstanceMat` ist geteilt
        out["(V9.39): state.voxelChunkGrass ist eine Map"] = !!st.voxelChunkGrass && st.voxelChunkGrass instanceof Map;
        // die Wiese ist Boden-
        // Funktion — Gras-Zellen sind verbucht (null = bewusst halm-los), 0 InstancedMesh.
        let grassInstances = 0,
            grassCells = 0;
        if (st.voxelChunkGrass) {
            for (const v of st.voxelChunkGrass.values()) {
                grassCells++;
                if (v && v.isInstancedMesh) grassInstances++;
            }
        }
        out["(V18.492): Gras-Zellen verbucht, 0 Halm-InstancedMesh je Chunk (fern Boden-Funktion, nah die Nah-Wiese)"] =
            grassCells > 0 && grassInstances === 0;

        // DIE BODEN-KARTE ist der GERENDERTE Boden: an 256 Punkten des Spieler-Chunks trifft `_bodenSichtAt`
        // (der EINE Leser, K21) die Mesh-Oberfläche (Strahl von oben, beide Seiten — die Surface-Nets-Wicklung zeigt
        // oben nach unten). Das Gesetz `_voxelSurfaceY` liegt daneben — Gras und Streu darauf steckten im Boden. DIE
        // NAH-WIESE: die Büschel einer Kachel sind Γ5-stabil und stehen auf der Karte.
        {
            const cfg = r._voxelChunkConfig(0);
            const lpc = st.lastPlayerVoxelChunk;
            const e = lpc && st.voxelChunks && st.voxelChunks.get(lpc.cx + "," + lpc.cz);
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
            // die Abweichung einer Reihe: Median in cm und Anteil ≤ 5 cm
            const zahl = (a) =>
                `Median ${(100 * (median(a) || 0)).toFixed(1)} cm, ${Math.round(100 * anteil(a))} % ≤ 5 cm`;
            out[
                `die Boden-Karte ist der gerenderte Boden (${karte.length} Punkte: Karte ${zahl(karte)} · Gesetz ${zahl(gesetz)})`
            ] = karte.length >= 128 && median(karte) <= 0.02 && anteil(karte) >= 0.75;
            // Die büschel-reichste Kachel im 7×7-Umkreis des Spielers (die Spawn-Kachel selbst kann Fels sein).
            const NW = r.constructor.NAH_WIESE;
            const pp = st.playerMesh.position;
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
            const reihe = Array.isArray(b1);
            out[
                `Nah-Wiese Γ5-stabil, Fuß auf der Boden-Karte (${reihe ? `${b1.length} Büschel in Kachel ${tx},${tz}` : "Kachel wartet"})`
            ] = reihe && b1.length > 0 && JSON.stringify(b1) === JSON.stringify(b2) && b1.every(fuss);
        }
        out["Gras-Material ist geteilt (ein Draw-Call-Material)"] = r._grassInstanceMat() === r._grassInstanceMat();

        // --- Genesis-Plattform ---
        // Nach dem ersten Spawn sollte eine start_plattform-Architektur da sein; ein zweiter Aufruf erzeugt KEINE
        // zweite Plattform (Idempotenz)
        const plattformen = () => st.architectures.filter((a) => a && a.type === "start_plattform").length;
        const before = plattformen();
        out["Genesis-Plattform-Architektur nach Spawn vorhanden"] = before > 0;
        r._ensureGenesisPlatform();
        out["_ensureGenesisPlatform ist idempotent (keine Doppel-Plattform)"] = plattformen() === before;

        // --- Adaptives Wasser ---
        out["state.waterLevel ist gesetzt (adaptiv)"] =
            typeof st.waterLevel === "number" && Number.isFinite(st.waterLevel);

        return out;
    });

    if (erreichbar(check, "Die lebendige Welt Tests laufen", v829Results, "no result"))
        for (const s in v829Results) check(s, ...[v829Results[s]].flat());

    // ### Welle 6.G4.e: Tauchen + Schwimm-Animation + Gerstner ###
    const v833Results = await safeEvaluate(page, () => {
        const out = {};

        // --- Tauchen: _swimVerticalVelocity (reine Funktion) ---
        const dive = r._swimVerticalVelocity(0, 4, true, false);
        const rise = r._swimVerticalVelocity(0, 4, false, true);
        const neutral = r._swimVerticalVelocity(0, 4, false, false);
        out["Tauchen — Shift erzeugt Sink-Geschwindigkeit"] = dive < 0;
        out["Auftauchen — Space erzeugt Aufwärts-Geschwindigkeit"] = rise > 0;
        out["Neutral — natürlicher Auftrieb treibt zur Oberfläche"] = neutral > 0 && neutral <= 2.5;
        out["Tauchen sinkt unter den Neutral-Auftrieb (Diskrimination)"] = dive < neutral;
        // Aktives Auftauchen konvergiert per lerp gegen das Gesetz (schwimmen.aufV ≈ 1.0 m/s): gemessen wird
        // die KONVERGIERTE Steig-Geschwindigkeit gegen den Neutral-Auftrieb, nicht der erste lerp-Schritt.
        let riseKonv = 0;
        for (let i = 0; i < 60; i++) riseKonv = r._swimVerticalVelocity(riseKonv, 4, false, true);
        out["Auftauchen hebt über den Neutral-Auftrieb (Diskrimination)"] = riseKonv > neutral;
        out["An der Oberfläche kein Auftriebs-Drift (depth 0)"] =
            Math.abs(r._swimVerticalVelocity(0, 0, false, false)) < 0.01;
        // Im echten Charakter-Schritt (Wasser 3 m über dem Körper): Shift sinkt, Space steigt, die Augen sind getaucht.
        // Die Bühne ist die leere Säule ohne Sattel (wie die Killplane in koerper.cjs) — der geerbte Ort urteilt nie
        // mit.
        {
            const s = st,
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
                out["getaucht sind die Augen unter dem Spiegel (playerEyesUnderwater)"] =
                    s.playerUnderwater === true && s.playerEyesUnderwater === true;
                out["im Charakter-Schritt sinkt Sprint und steigt Sprung unter Wasser (die Verb-Tafel)"] =
                    tauch < 0 && tauch < ruhe && auf > 0;
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
            out["Soul-Group nutzt YXZ-Rotation (lokaler Vorwärts-Lehnen)"] = gh.rotation.order === "YXZ";
            r._animateHuman(gh, 1.0, 0, false, true);
            out["Mensch neigt sich unter Wasser (Schwimm-Pose)"] = Math.abs(gh.rotation.x) > 0.05;
            r._animateHuman(gh, 1.0, 0, false, false);
            out["Schwimm-Pose wird an Land zurückgesetzt (rotation.x=0)"] = Math.abs(gh.rotation.x) < 0.001;
            r._disposeSoulGroup(gh);

            // Phoenix/Drache sind Compound-Seelen: die EINE Schwimm-Lehne (SOUL_SWIM_LEAN) wirkt über
            // animatePlayerSoul. Echter Pfad: Seele wechseln, underwater setzen, rotation.x lesen.
            const savedSoulSwim = st.player.soul;
            const savedUw = st.playerUnderwater;
            const L = r.constructor.SOUL_SWIM_LEAN;
            const swimProbe = (soulName) => {
                r.applyPlayerSoul(soulName);
                st.playerUnderwater = true;
                st.player.animationLastTick = -Infinity;
                r.animatePlayerSoul(20.0);
                const lean = st.playerMesh.rotation.x;
                st.playerUnderwater = false;
                r.animatePlayerSoul(20.1);
                const reset = st.playerMesh.rotation.x;
                return (Math.abs(lean - L.idle) < 1e-6 || Math.abs(lean - L.moving) < 1e-6) && Math.abs(reset) < 1e-9;
            };
            // ALTLASTEN-NULL: die Compound-Schwimm-Lehne an den TIER-Körpern
            // (dieselbe EINE SOUL_SWIM_LEAN-Quelle für jede Compound-Seele).
            out["(NULL): Wolf-Körper neigt sich unter Wasser (Schwimm-Pose)"] = swimProbe("wolf");
            out["(NULL): Bär-Körper neigt sich unter Wasser (Schwimm-Pose)"] = swimProbe("baer");
            st.playerUnderwater = savedUw;
            r.applyPlayerSoul(savedSoulSwim);
        }

        r._ensureHydroSurfaceMaterial();

        return out;
    });

    if (erreichbar(check, "Wasser-Vollendung Tests laufen", v833Results, "no result"))
        for (const s in v833Results) check(s, v833Results[s]);
}

async function checkBandV8LatePolishAnd6XContinued({ page, check }) {
    // ### Regler: Sicht-Ring + Cel-Stufen + Fog ### — je Prüfung ein Satz der Seite (`out[satz] = urteil`)
    const v840Results = await safeEvaluate(
        page,
        (stammDateien) => {
            const out = {};
            const ring = document.getElementById("slider-ring");
            // der Sicht-Ring-Regler reicht jetzt 1–12 (war 1–8) — die
            // fernen Ringe 9–12 sind dank der LOD-Pyramide billig. Default bleibt 4.
            out["V8.40/E2: Sicht-Ring-Regler 1–12, Default 4 (9×9)"] =
                !!ring && ring.max === "12" && ring.value === "4";

            // Cache-Buster auf JEDER Stamm-Einbindung (die Liste aus scripts/lib/stamm.cjs, wie index.html sie lädt).
            const tags = [...document.querySelectorAll("script")].map((s) => s.getAttribute("src") || "");
            const ohneBuster = stammDateien.filter((p) => !tags.some((t) => t.split("?")[0] === p && /\?v=/.test(t)));
            out["jede Stamm-Datei mit Cache-Buster ?v= eingebunden"] =
                stammDateien.length > 0 && ohneBuster.length === 0;

            return out;
        },
        stammLib.dateien(path.join(SKRIPTE, ".."))
    );

    if (erreichbar(check, "Regler-Tests laufen", v840Results, "no result"))
        for (const s in v840Results) check(s, v840Results[s]);

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
        const dl = st.directionalLight;
        out["Light-Target im Szenengraph"] = !!dl && !!dl.target && dl.target.parent === st.scene;
        const pm = st.playerMesh;
        const ox = pm.position.x;
        const oz = pm.position.z;
        const oTod = st.timeOfDay;
        // deterministische schräge Sonne: der Light-Space-Snap
        // zeigt sich nur bei NICHT-achsparalleler Sonne (bei Zenit/Achse
        // deckt er sich mit dem alten Welt-Snap). t=0.3 ≈ tiefe Morgensonne.
        r.setTimeOfDay(0.3, "human");
        // BÜHNE: eine nicht achsparallele Lage für den Schatten-Snap (nur die Bruchteile zählen)
        pm.position.x = 123.5;
        pm.position.z = -77.25;
        r._applyDayNightToScene();
        const tgt = st.directionalLight.target.position;
        // Texel-Snap-Toleranz: das Shadow-Target FOLGT dem Spieler, auf das
        // Texel-Grid gerundet (~0.29 m bei 600 m / 2048). Der V17.111-Light-
        // Space-Snap rundet in der Ebene ⟂ sunDir → Versatz ≤ ~1 Texel < 0.5.
        out["Shadow-Frustum folgt dem Spieler (Target = Spieler-xz, ±Texel)"] =
            Math.abs(tgt.x - 123.5) < 0.5 && Math.abs(tgt.z - -77.25) < 0.5;
        // Snap-Stabilität: Schatten-Swimming lebt NUR in der Ebene ⟂ sunDir (Texel-Grid). Der Light-Space-
        // Snap quantisiert die laterale Target-Bewegung auf ganze Texel: ~0 (gleiche Zelle) ODER ein sauberer
        // Sprung (≥~0.29 m), NIE ein Kriechen in Schritt-Höhe (~0.05 m). Bewegung entlang sunDir verschiebt
        // keine Texel → herausprojiziert. sunDir bei t=0.3 aus der replizierten _dayNightSunDirection-Formel.
        const _ang = 0.3 * Math.PI * 2 - Math.PI / 2;
        const sd = [Math.cos(_ang), Math.sin(_ang), Math.sin(_ang * 0.5) * 0.4];
        const _sl = Math.hypot(...sd) || 1;
        const [_sx, _sy, _sz] = sd.map((v) => v / _sl);
        const vor = tgt.clone();
        pm.position.x = 123.5 + 0.05;
        pm.position.z = -77.25 + 0.05;
        r._applyDayNightToScene();
        const tgt2 = st.directionalLight.target.position;
        const dX = tgt2.x - vor.x;
        const dY = tgt2.y - vor.y;
        const dZ = tgt2.z - vor.z;
        const along = dX * _sx + dY * _sy + dZ * _sz; // Komponente entlang sunDir (harmlos)
        const latMove = Math.hypot(dX - along * _sx, dY - along * _sy, dZ - along * _sz); // ⟂ sunDir
        out["Perf-2.b: Stable-Shadow-Snap — Sub-Texel-Bewegung verschiebt Target NICHT"] =
            latMove < 0.01 || latMove > 0.2;
        pm.position.x = ox;
        pm.position.z = oz;
        r.setTimeOfDay(oTod, "human");
        r._applyDayNightToScene();
        return out;
    });

    if (erreichbar(check, "Terrain-Schatten-Tests laufen", v848Results, "no result"))
        for (const s in v848Results) check(s, v848Results[s]);

    // ### updateCreatures-Politur (Off-Screen-Sparsamkeit + Distanz-LOD) ###
    const v849Results = await safeEvaluate(page, () => {
        const out = {};
        // Die Herde (Kern verbandZug, persönlicher Raum je Leib) beweist gate:kreatur-leben am Verhalten (herde, abstand).
        // Funktional: viele Kreaturen, mehrere Ticks → kein Crash, Bewegung erhalten, Positionen endlich.
        // maxCreatures temporär heben + Guard-Zähler: am Cap fügt spawnCreatureAt nichts hinzu und der
        // `while (length < 60)`-Loop dreht ewig; danach sauber abräumen (kein Leck in Folge-Bänder).
        const _saveMax849 = st.maxCreatures;
        const _baseN849 = st.creatures.length;
        st.maxCreatures = 70;
        let _g849 = 0;
        while (st.creatures.length < 60 && _g849++ < 120) {
            const p = st.playerMesh.position;
            r.spawnCreatureAt(p.x + (Math.random() - 0.5) * 50, p.y, p.z + (Math.random() - 0.5) * 50, "happy");
        }
        const lagen = () => st.creatures.map((c) => c.position.x + c.position.y + c.position.z);
        const before = lagen();
        let fehler = null;
        try {
            for (let k = 0; k < 8; k++) r.updateCreatures(0.05);
        } catch (e) {
            fehler = String(e && e.message);
        }
        out["updateCreatures läuft mit 60 Kreaturen ohne Crash"] = [fehler === null, fehler];
        const after = lagen();
        let moved = 0;
        for (let k = 0; k < before.length; k++) {
            if (Math.abs(before[k] - after[k]) > 0.001) moved++;
        }
        out["Kreaturen bewegen sich weiterhin (Verhalten erhalten)"] = before.length > 0 && moved > before.length * 0.5;
        out["alle Kreatur-Positionen endlich (keine NaN)"] = st.creatures.every(
            (c) => Number.isFinite(c.position.x) && Number.isFinite(c.position.y) && Number.isFinite(c.position.z)
        );
        // sauber abräumen: die Test-Kreaturen entfernen + den Cap restaurieren (kein Leck).
        while (st.creatures.length > _baseN849) {
            r.removeCreature(st.creatures[st.creatures.length - 1]);
        }
        st.maxCreatures = _saveMax849;
        return out;
    });

    if (erreichbar(check, "updateCreatures-Politur-Tests laufen", v849Results, "no result"))
        for (const s in v849Results) check(s, ...[v849Results[s]].flat());

    // ### Welle 6.X.4 B3 + D2 — Stats-HUD + Slider ###
    const wave6x4bResults = await safeEvaluate(page, () => {
        const out = {};
        const $ = (id) => document.getElementById(id);
        // der Regler `el` auf `v`, wie die Hand ihn schiebt (der input-Ruf)
        const schiebe = (el, v) => {
            el.value = v;
            el.dispatchEvent(new Event("input"));
        };

        // --- B3: Stats-HUD DOM-Existenz
        out["Welle 6.X.4 B3: #stats-hud im DOM"] = !!$("stats-hud");
        out["Welle 6.X.4 B3: #stats-hud-stam-fill SVG-Element existiert"] = !!$("stats-hud-stam-fill");

        // --- B3: tickStatsHud aktualisiert HP-Text + Bar-Width
        // Fix: HP/Stamina liegen auf state.player.*, nicht state.*
        Object.assign(st.player, { hp: 50, hpMax: 100, stamina: 75, staminaMax: 100 });
        // Force-Update durch Reset des Throttles
        delete st._statsHudLastTick;
        delete st._statsHudTooltipLastTick;
        r.tickStatsHud(performance.now() / 1000);
        const hpText = $("stats-hud-hp-text");
        out["Welle 6.X.4 B3: HP-Text zeigt 50/100 nach Setzen"] = !!hpText && /50\/100/.test(hpText.textContent);
        const stamText = $("stats-hud-stam-text");
        out["Welle 6.X.4 B3: Stamina-Text zeigt 75/100 nach Setzen"] =
            !!stamText && /75\/100/.test(stamText.textContent);
        const hpFill = $("stats-hud-hp-fill");
        // Bar-Breite ist jetzt 166 (von 158) — 50% → 83px
        out["Welle 6.X.4 B3: HP-Fill-Width proportional (50% → 83px von 166px)"] =
            !!hpFill && Math.abs(parseFloat(hpFill.getAttribute("width")) - 83) < 1;

        // --- B3: Tooltip enthält slow stats nach Hover
        r.tickStatsHud(performance.now() / 1000 + 2); // +2s damit Tooltip-Throttle nicht greift
        const tooltip = $("stats-hud-tooltip");
        for (const [satz, re] of [
            ["Welle 6.X.4 B3: Tooltip enthält Schaden", /Schaden/],
            ["Welle 6.X.4 B3: Tooltip enthält Geschwindigkeit", /Geschwindigk/],
            ["Welle 6.X.4 B3: Tooltip enthält Präzision", /Präzision/],
        ])
            out[satz] = !!tooltip && re.test(tooltip.innerHTML);

        // --- D2: state-Felder + UI-Slider existieren
        out["Welle 6.X.4 D2: state.symphony.masterVolume default 1.0"] = st.symphony.masterVolume === 1.0;
        out["Welle 6.X.4 D2: state.symphony.creaturePingVolume default 1.0"] = st.symphony.creaturePingVolume === 1.0;
        out["Welle 6.X.4 D2: state.chunkRingRadius default 4 (V8.40: 9×9)"] = st.chunkRingRadius === 4;
        out["Welle 6.X.4 D2: #sliders-section im DOM"] = !!$("sliders-section");

        // --- D2: Master-Slider ändert state + Persistenz
        const ms = $("slider-master");
        schiebe(ms, "50");
        out["Welle 6.X.4 D2: Master-Slider ändert state.symphony.masterVolume"] =
            Math.abs(st.symphony.masterVolume - 0.5) < 0.01;
        out["Welle 6.X.4 D2: Master-Slider persistiert in localStorage"] =
            typeof localStorage !== "undefined" &&
            Math.abs(parseFloat(localStorage.getItem("anazh.audio.masterVol")) - 0.5) < 0.01;
        // Reset auf default
        schiebe(ms, "100");

        // --- D2: der Umgebungs-Regler (slider-pings) schreibt creaturePingVolume (den Bus der Klang-Welt)
        const ps = $("slider-pings");
        schiebe(ps, "0");
        out["Welle 6.X.4 D2: Pings-Slider ändert state.symphony.creaturePingVolume"] =
            st.symphony.creaturePingVolume === 0;
        schiebe(ps, "100");

        // --- D2: Ring-Slider ändert chunkRingRadius
        const rs = $("slider-ring");
        schiebe(rs, "3");
        out["Welle 6.X.4 D2: Ring-Slider ändert state.chunkRingRadius"] = st.chunkRingRadius === 3;
        const rsv = $("slider-ring-val");
        out["Welle 6.X.4 D2: Ring-Wert-Display zeigt '7×7' bei value=3"] = !!rsv && rsv.textContent === "7×7";
        schiebe(rs, "2");

        return out;
    });

    // ### Welle 6.X.4 V8.16 Punkt 18 — Rolle-Synergie + Wachstumskonzept ###
    const wave6x4cResults = await safeEvaluate(page, () => {
        const out = {};

        // computeBlueprintDomainCounts existiert + liefert sinnvolle Map

        // die Probe-Kugel der Werkstatt aus dem Stoff `material` (Teil ohne Lage)
        const kugel = (material) => ({ shape: "sphere", material, size: { x: 0.5, y: 0.5, z: 0.5 } });
        // Test: Bauplan ohne opChain → leere counts
        const tn = "audit_v816_test";
        if (st.blueprints[tn]) delete st.blueprints[tn];
        r.createBlueprint(tn, "V816-Test");
        r.addPartToBlueprint(tn, kugel("stein"));
        out["Welle 6.X.4 V8.16: Leere opChain → keine Domain-Counts"] =
            Object.keys(r.computeBlueprintDomainCounts(st.blueprints[tn])).length === 0;

        // Schmiede-Hammer (domain:"forging") → counts.forging = 1; der Starter-Hammer hat domain:null.
        // schmiede-hammer in den Besitz legen (frieden-Modus: keine Stamina) und Material auf eisen setzen —
        // opClass=plastic ist mit stein inkompatibel (MATERIAL_OP_COMPATIBILITY).
        st.player.tools = Array.isArray(st.player.tools) ? st.player.tools : [];
        if (!st.player.tools.includes("schmiede-hammer")) {
            st.player.tools.push("schmiede-hammer");
        }
        st.blueprints[tn].parts[0].material = "eisen";
        r.applyOpToPart(tn, 0, "schmiede-hammer");
        out["Welle 6.X.4 V8.16: Schmiede-Hammer-Anwendung erhöht forging-Count"] =
            (r.computeBlueprintDomainCounts(st.blueprints[tn]).forging || 0) === 1;

        // Cleanup
        delete st.blueprints[tn];

        // UI-Rendering: Stats-Panel hat workshop-domain-row +
        // workshop-synergy-row + workshop-growth-row Elemente nach
        // Render eines eigenen Bauplans.
        const tn2 = "audit_v816_render";
        r.createBlueprint(tn2, "V816-Render");
        r.addPartToBlueprint(tn2, kugel("eisen")); // schmiede-hammer braucht plastic-kompatibles Material
        r.selectBlueprintForEdit(tn2);
        r._workshopRenderStatsPanel();
        // Spec-Sheet: die „Synergie" ist jetzt die ROLLEN-RESONANZ (der Fingerabdruck), das
        // „Wachstum" der actionable Hinweis im Footer (.spec-growth, nur eigene Baupläne).
        const panel = document.getElementById("workshop-stats-panel");
        out["Spec-Sheet: Stats hat die Rollen-Resonanz (Fingerabdruck)"] = [
            ...panel.querySelectorAll(".spec-col-head"),
        ].some((l) => l.textContent === "Rollen-Resonanz");
        out["Spec-Sheet: Stats hat den Wachstums-Hinweis (.spec-growth)"] = !!(
            panel && panel.querySelector(".spec-growth")
        );
        // der Wachstums-Hinweis trägt `re`: bei 0 opChain den Emergenz-Hinweis, nach der Schmiede-Hammer-Anwendung die
        // Domain (Mehrheit/forging)
        const wachstum = (re) => {
            const g = panel && panel.querySelector(".spec-growth-text");
            return !!g && re.test(g.textContent);
        };
        out["Welle 6.X.4 V8.16: Growth-Text bei 0 Ops zeigt Emergenz-Hinweis"] = wachstum(/emergiert|Werkzeug/);
        r.applyOpToPart(tn2, 0, "schmiede-hammer");
        r._workshopRenderStatsPanel();
        out["Spec-Sheet: der Wachstums-Hinweis spiegelt die Domain nach Schmiede-Hammer-Op"] =
            wachstum(/Mehrheit|forging/);

        // Cleanup
        delete st.blueprints[tn2];
        r._workshopRenderStatsPanel();

        return out;
    });

    if (erreichbar(check, "Welle 6.X.4 V8.16: Rolle-Synergie-Tests laufen", wave6x4cResults, "no result"))
        for (const s in wave6x4cResults) check(s, wave6x4cResults[s]);
    if (erreichbar(check, "Welle 6.X.4 B3+D2: Stats-HUD + Slider-Tests laufen", wave6x4bResults, "no result"))
        for (const s in wave6x4bResults) check(s, wave6x4bResults[s]);
}

async function checkBandV18164WarumLicht({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        // (1) die WARUM-Führung ist ARITHMETISCH EHRLICH: für einen Bauplan,
        // dessen Wunsch-Rolle machbar ist, flippt die empfohlene Achsen-Drehung
        // die Ziel-Rolle wirklich über den Sieger (dieselbe Spektrum-Skala).
        const probe = { name: "__warum", parts: [__teil("box", "holz", 0, 0.5, 0, 1.6, 1, 1.6)] };
        const spectrum = r._blueprintRoleSpectrum(probe);
        let hinted = null;
        for (let i = 1; i < spectrum.length && !hinted; i++) {
            const h = r._blueprintRoleGapHint(probe, spectrum[i].role);
            if (h && h.text && Number.isFinite(h.need)) hinted = h;
        }
        let ehrlich = false,
            flippt = false;
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
            ehrlich = score(hinted.targetRole, v2) >= score(hinted.winner, v2) - 1e-6;
            flippt = winner2 === hinted.targetRole || ehrlich;
        }
        // …und der KONJUNKTIONS-RUF spricht als TAT: der sitzlose Wagen resoniert Fahrzeug schon als
        // Spektrum-Spitze, der Klassifikator wartet auf den Sitz → der Ruf nennt die Tat (Sitz-Anker).
        const RZ = { x: 0, y: 0, z: 1.5707963 };
        const wagenOhneSitz = {
            name: "__warum2",
            parts: [
                __teil("box", "holz", 0, 0.85, 0, 1.3, 0.35, 2.1),
                ...[-0.72, 0.72].map((x) =>
                    __teil("cylinder", "holz", x, 0.34, 0.8, 0.62, 0.14, 0.62, { rotation: RZ })
                ),
            ],
            connections: [1, 2].map((partB) => ({ type: "lashing", partA: 0, partB, auto: 1 })),
        };
        const ruf = r._blueprintConjunctionCall(wagenOhneSitz);
        // …und der SPEKTRUM-Spiegel-Heal selbst: der sitzlose Holz-Wagen liest
        // im Spektrum NICHT mehr „Trank" oben (der V18.162-Heal erreicht jetzt
        // BEIDE Register — eine Wahrheit, alle Leser).
        const spec2 = r._blueprintRoleSpectrum(wagenOhneSitz);
        out[
            "§7.3(b) WARUM-Führung: der Hinweis ist arithmetisch EHRLICH (die Drehung hebt die Ziel-Rolle über den Sieger) + Konjunktions-Achsen sprechen als TAT (Sitz-Anker setzen → Fahrzeug)"
        ] =
            !!hinted &&
            ehrlich &&
            flippt &&
            !!ruf &&
            /Sitz-Anker/.test(ruf.text) &&
            ruf.role === "vehicle" &&
            spec2[0].role !== "consumable";

        // (3) §7.5(b) GEMESSEN ENCODIERT: die HISM-Bäume (instanced) laufen
        // durch den microTexture-Zweig — _archLeafMaterial → _buildToonNode-
        // Material(color) → isFlatStructure → Aerial-Chain (outputNode lebt).
        const flat = r._archFlattenBlueprint("baum_eiche");
        // Der Schatten-Zwilling (`l.shadowTwin`, SHADOW_TWIN_LAYER) ist ein opaker, kamera-unsichtbarer
        // Schatten-Caster ohne Anzeige-Node → bewusst NICHT im microTexture-/Aerial-Zweig. Die §7.5(b)-
        // Invariante gilt nur den ANZEIGE-Leaves (bark/card/core); der Zwilling wird gefiltert.
        const displayLeavesE = flat ? flat.leaves.filter((l) => !l.shadowTwin) : [];
        out[
            "§7.5(b) GEMESSEN: die HISM-Bäume laufen durch den microTexture-Zweig (instanceable + Aerial-outputNode auf jedem Leaf-Material)"
        ] =
            !!flat &&
            flat.instanceable === true &&
            displayLeavesE.length > 0 &&
            displayLeavesE.every((l) => !!l.mat && l.mat.outputNode != null);

        // (5) der GEHEILTE M7-Persistenz-Riss (Klasse): der Snapshot trägt microStrength, der Restore liest sie.
        const au = r._ensureAtmoUniforms();
        const snap = r.buildStateSnapshot();
        const persistenz = !!snap.atmosphere && Number.isFinite(snap.atmosphere.microStrength);
        // …und der Restore setzt sie in die Welt (Stand UND Uniform); danach der alte Stand zurück
        const a0 = { ...r.state.atmosphere };
        r._loadStateRestoreSoulAndAtmosphere({ atmosphere: { microStrength: 0.21 } });
        out[
            "§7.5 M7-Regler-Persistenz GEHEILT (V8.59-Klasse): microStrength reist im Snapshot + der Restore liest sie"
        ] = persistenz && r.state.atmosphere.microStrength === 0.21 && au.microStrength.value === 0.21;
        r.setMicroStrength(a0.microStrength ?? r.constructor.AERIAL.microStrength);

        // (6) §6.5 → V18.530: KEIN LADE-NEBEL — die Luft liest keine Ring-Front (Ungebautes deckt der Fern-Ring als
        // Loch-Deckel); im warmen Test-Ring ist der Spieler-Chunk gebaut.
        const ohneFront = window.__fehlt(r._dayNightApplyHemiUndLuft, /_builtRingRadius|foliageRadius/);
        const bk = r._builtRingRadius();
        out[
            "§6.5 → V18.530: kein Lade-Nebel — die Luft liest keine Ring-Front (der Fern-Ring deckt Ungebautes); im warmen Ring steht der Spieler-Chunk"
        ] = ohneFront && Number.isInteger(bk) && bk >= 0 && !r.state.scene.fog;
        return out;
    });
    for (const s in res) check(s, res[s]);
}

// Verifikation + Atmosphäre: Büsche/Understory sind echte gewachsene Bauten (kein Kugel-Bug); die
// Atmosphäre koppelt ans Wetter — hazeNear: ferne Berge verblassen STÄRKER bei Feuchte.
async function checkBandWahrerAnblickAtmoBusch({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};

        // (IV) Büsche wachsen aus dem Gesetz (kein Kugel-Haufen) — der Studio-Strauch, K24
        const busch = r._phytoArt("busch_hazel");
        out["Ω-OPSIS S4 (IV1) Büsche wachsen aus dem Gesetz (busch_hazel = Studio-Strauch, kein Kugel-Haufen)"] = !!(
            busch && busch.rec.kind === "shrub"
        );
        out["Ω-OPSIS S4 (IV2) Understory-Arten existieren (Farn + Blume)"] = !!(
            r._phytoArt("farn_busch") && r._phytoArt("blume_gross")
        );
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
        out[`Ω-OPSIS S4 (IV4) ein gewachsener Busch ist reich (≥8 Teile, gemessen ${buschParts})`] =
            buschParts >= 8 || buschParts === 0;

        // (V) die Luft koppelt ans Wetter: EINE Extinktion aus dem Wetter-Feld (fog- + rain-Kanal),
        // gemessen am Konsum — Regen trübt die Sicht, Sturm mehr; die Luft-Uniforms tragen sie.
        const WF = r.constructor.WEATHER_FIELD;
        out["Ω-OPSIS S5 (V2) CONSUM: Regen trübt die Sicht, Sturm mehr (β sonnig < Regen < Sturm)"] =
            r._luftBeta(WF.sunny) < r._luftBeta(WF.rainy) && r._luftBeta(WF.rainy) < r._luftBeta(WF.stormy);

        return out;
    });
    for (const s in res) check(s, res[s]);
}

// V6 Wetter-5-Kanal-Feld — eingefaltet aus gate:weather-vector (D3b, die Welt des Läufers statt eines eigenen Boots): V6-GATE (Look-Finale) — DAS WETTER-5-KANAL-FELD (Null-Renderer, GPU-frei): beweist, dass
async function checkBandWetterVektor({ page, check }) {
    // die Seite urteilt: die Brüche des Wetter-Felds beim Namen (leer = grün)
    const fails = (await safeEvaluate(page, async () => {
        await window.__weltDa();
        // Keine laufende Transition — die Wort-Vorgabe führt.
        r.state.weatherTransition = null;
        const W = {
            sunny: r._weatherFieldFor("sunny"),
            rainy: r._weatherFieldFor("rainy"),
            stormy: r._weatherFieldFor("stormy"),
        };
        const { sunny, rainy, stormy } = W;
        // Transition-Monotonie: fog steigt von sunny (.15) → stormy (.70) mit progress.
        const fogRamp = [];
        for (const p of [0, 0.25, 0.5, 0.75, 1.0]) {
            r.state.weatherTransition = { from: "sunny", to: "stormy", progress: p };
            fogRamp.push(r._weatherFieldFor("sunny").fog);
        }
        r.state.weatherTransition = null;
        const fails = [];
        for (const w in W)
            for (const c of ["fog", "sun", "grey", "wind", "rain"])
                if (typeof W[w][c] !== "number" || !Number.isFinite(W[w][c]))
                    fails.push(`${w}.${c} ist kein finiter Kanal`);
        // grey — entsättigt das Licht (stormy stark, sunny gar nicht).
        if (!(stormy.grey >= 0.8)) fails.push(`stormy.grey ${stormy.grey} < 0.8 (kein deutliches Entsättigen)`);
        if (sunny.grey !== 0) fails.push(`sunny.grey ${sunny.grey} != 0 (sunny darf das Licht NICHT entsättigen)`);
        // wind — dramatisiert (stormy ≥ 5× sunny).
        if (!(stormy.wind >= 5 * sunny.wind)) fails.push(`stormy.wind ${stormy.wind} < 5× sunny.wind ${sunny.wind}`);
        // rain — kontinuierlich (sunny 0 · rainy ~0.6 · stormy 1.0).
        if (sunny.rain !== 0) fails.push(`sunny.rain ${sunny.rain} != 0`);
        if (Math.abs(rainy.rain - 0.6) > 0.05) fails.push(`rainy.rain ${rainy.rain} ≉ 0.6`);
        if (Math.abs(stormy.rain - 1.0) > 0.01) fails.push(`stormy.rain ${stormy.rain} ≉ 1.0`);
        // Transition-Monotonie (fog steigt streng mit dem Sturm-Anteil).
        for (let i = 1; i < fogRamp.length; i++) {
            if (!(fogRamp[i] >= fogRamp[i - 1]))
                fails.push(`fog-Ramp nicht monoton bei p-Schritt ${i} (${fogRamp[i - 1]} → ${fogRamp[i]})`);
        }
        if (!(fogRamp[fogRamp.length - 1] > fogRamp[0]))
            fails.push(`fog-Ramp steigt gar nicht (${fogRamp[0]} → ${fogRamp[fogRamp.length - 1]})`);
        return fails;
    })) || ["keine Antwort der Seite: null"];
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
        const rend = r.state.renderer;
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
        const punkte = mags ? mags.count : 0;
        let fremdeKoerper = 0;
        st.scene.traverse(
            (o) => o.userData && o.userData.skyOffset && o !== st.sunMesh && o !== st.moonMesh && fremdeKoerper++
        );
        // was sichtbar ist und ob das Sternfeld zeichnet
        const blick = () => Object.assign(sichtbar(), { zeichnet: !!(sf && sf.visible) });
        const zeitWar = st.timeOfDay;
        zeit(0.5);
        const mittag = blick();
        const mondTag = +st.moonMesh.material.opacity.toFixed(3);
        zeit(0.75 + 1 / 360); // Sonnenuntergang: Sonne knapp unter dem Horizont (−1°)
        const daemmerung = sichtbar();
        zeit(0);
        const nacht = blick();
        const mondNacht = +st.moonMesh.material.opacity.toFixed(3);
        const einDurchgang = !!(sf && sf.material.forceSinglePass === true);
        // 7 UNENDLICH: der Clip-z jedes Himmelskörpers ist der EINE Unendlich-Knoten (z = w, Tiefe 1,0)
        const unendlich = r.constructor._unendlichKnoten;
        const vorn = [];
        for (const [name, o] of [
            ["himmel", st.skybox],
            ["himmel-sterne", sf],
            ["himmel-sonne", st.sunMesh],
            ["himmel-mond", st.moonMesh],
        ]) {
            if (!o) vorn.push(`${name} fehlt`);
            else if (!(unendlich && o.material.vertexNode === unendlich && o.material.depthTest !== false))
                vorn.push(name);
        }
        if (stoerung === "vorne") st.sunMesh.material.vertexNode = sonneVN;
        if (kugel) st.scene.remove(kugel);
        if (stoerung === "doppel" && sf) sf.material.forceSinglePass = true;
        if (stoerung === "grenze") delete r._tagAchse;
        zeit(zeitWar);
        // das Urteil der Probe: jede verletzte Regel beim Namen
        const rot = [];
        if (fremdeKoerper > 0) rot.push(`1 KÖRPER: ${fremdeKoerper} Kugel(n) ohne Gesetz`);
        if (!(punkte > 1000)) rot.push(`Sternfeld fehlt (${punkte} Punkte)`);
        if (mittag.n !== 0) rot.push(`2 MITTAG: ${mittag.n} Punkte sichtbar (Grenze ${mittag.grenze})`);
        if (!(daemmerung.venus && daemmerung.n < punkte * 0.05))
            rot.push(`3 DÄMMERUNG: Abendstern ${daemmerung.venus ? "da" : "fehlt"}, ${daemmerung.n} Punkte`);
        if (!(nacht.n === punkte)) rot.push(`4 NACHT: nur ${nacht.n}/${punkte} Punkte`);
        if (!(mondTag < 0.5 && mondNacht > 0.85)) rot.push(`5 MOND: Tag ${mondTag} · Nacht ${mondNacht}`);
        if (mittag.n === 0 && mittag.zeichnet)
            rot.push("6 ZEICHNEN: mittags zeichnet das Sternfeld ohne sichtbaren Punkt");
        if (nacht.n > 0 && !nacht.zeichnet) rot.push("6 ZEICHNEN: nachts zeichnet das Sternfeld nicht");
        if (!einDurchgang) rot.push("6 ZEICHNEN: das Sternfeld zeichnet in zwei Durchgängen");
        if (vorn.length) rot.push(`7 UNENDLICH: ${vorn.join(" · ")} ohne den Unendlich-Knoten`);
        return rot;
    };
    // das Urteil der Probe unter der Störung `k` (null: die heile Welt)
    const urteil = async (k) => (await safeEvaluate(page, probe, k)) || ["keine Antwort der Seite"];
    const rot = await urteil(null);
    check(
        "Himmel-Tag: mittags kein Punkt, in der Dämmerung der Abendstern, nachts alle Sterne, der Mond blass/deckend, jeder Himmelskörper im Unendlichen",
        rot.length === 0,
        rot.join(" · ")
    );
    const s = {};
    for (const k of ["kugel", "grenze", "doppel", "vorne", null]) s[k] = await urteil(k);
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
    // je Prüfung ein Satz der Seite (`aus[satz] = [urteil, detail]`)
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
        // die Lage des Takts: die Kaskaden `lights` (ohne: kein CSM), das Haupt-Licht `dl`, Intervall 1, kein letzter Schuss
        const lage = (lights, dl) => {
            st.csmNode = lights && { lights };
            st.directionalLight = dl;
            st._shadowMinInterval = 1;
            r._shadowLast = null;
        };
        // `fn` mit dem Takt `takt` an der Naht `_loopShadowUpdate` (danach fällt die eigene Naht)
        const unter = (takt, fn) => {
            r._loopShadowUpdate = takt;
            try {
                return fn();
            } finally {
                delete r._loopShadowUpdate;
            }
        };
        const aus = {};
        try {
            const k = [kaskade(), kaskade()];
            lage(k, sonne);
            r._shadowFrame = 0;
            lauf(k, 1); // Sonnen-Erstlauf
            const t2 = lauf(k, 30);
            const t1 = k.every((l) => l.shadow.autoUpdate === false);
            st._shadowMinInterval = 4;
            const t3 = lauf(k, 60);
            lauf(k, 3);
            sonne.position.x += 100;
            k.forEach((l) => (l.shadow.needsUpdate = false));
            r._loopShadowUpdate();
            const t4 = k.map((l) => l.shadow.needsUpdate);
            const dl = Object.assign(kaskade(), { position: sonne.position });
            lage(null, dl);
            const t5 = lauf([dl], 20)[0];
            const t5aus = dl.shadow.autoUpdate === false;
            // T7 — die Kamera bewegt sich: je Takt ein Schritt der Kamera-Matrix
            lage(k, sonne);
            const kam = st.camera;
            const kamAlt = kam ? kam.position.x : 0;
            const roh = r._loopShadowUpdate;
            let schritt = 0;
            let t7;
            try {
                t7 = unter(
                    function () {
                        if (kam) {
                            kam.position.x = kamAlt + 0.05 * ++schritt;
                            kam.updateMatrixWorld(true);
                        }
                        return roh.call(this);
                    },
                    () => (lauf(k, 1), lauf(k, 30))
                );
            } finally {
                if (kam) {
                    kam.position.x = kamAlt;
                    kam.updateMatrixWorld(true);
                }
            }
            const k6 = [kaskade(), kaskade()];
            k6.forEach((l) => (l.shadow.needsUpdate = false));
            st.csmNode = { lights: k6 };
            r._schattenAlleNeu();
            const t6 = k6.every((l) => l.shadow.needsUpdate === true);
            const ohneKarte = window.__fehlt(r._loopShadowUpdate, /shadowMap\.needsUpdate\s*=/);
            // S1 — der alte Schreiber (nur renderer.shadowMap.needsUpdate) markiert keine Kaskade
            const k7 = [kaskade(), kaskade()];
            st.csmNode = { lights: k7 };
            const s1 = unter(
                function () {},
                () => ({ z: lauf(k7, 30), auto: k7.every((l) => l.shadow.autoUpdate === true) })
            );
            // S2 — das Gesetz vor 1410-3 (nah jeden Frame, fern jeden fernFaktor-ten im selben Frame) trägt Doppel-Frames
            const k8 = [kaskade(), kaskade()];
            st.csmNode = { lights: k8 };
            let f8 = 0;
            const s2 = unter(
                function () {
                    f8++;
                    k8[0].shadow.autoUpdate = k8[1].shadow.autoUpdate = false;
                    k8[0].shadow.needsUpdate = true;
                    if (f8 % T.fernFaktor === 0) k8[1].shadow.needsUpdate = true;
                },
                () => lauf(k8, 30).doppelt
            );
            const fern2 = 30 / (T.nahMax * T.fernFaktor);
            aus[
                "Schatten-Takt T1/T2: autoUpdate aus, Intervall 1 nah jeden nahMax-ten Frame, fern dazwischen, kein Frame mit zwei Kaskaden"
            ] = [
                t1 &&
                    t2[0] === 30 / T.nahMax &&
                    t2[1] >= Math.floor(fern2) - 1 &&
                    t2[1] <= Math.ceil(fern2) &&
                    t2.doppelt === 0,
                `30 Frames → ${t2.join(" / ")}, doppelt ${t2.doppelt}`,
            ];
            aus["Schatten-Takt T3: Intervall 4 nah höchstens jeden nahMax-ten, fern im 4×fernFaktor-Takt"] = [
                t3[0] === 60 / Math.min(T.nahMax, 4) && t3[1] === 60 / (4 * T.fernFaktor) && t3.doppelt === 0,
                `60 Frames → ${t3.join(" / ")}`,
            ];
            aus[
                "Schatten-Takt T4–T6: der Sonnen-Sprung erzwingt beide, ohne CSM das Haupt-Licht im Nah-Takt, `_schattenAlleNeu` markiert jede"
            ] = [t4[0] === true && t4[1] === true && t5 === 20 / T.nahMax && t5aus && t6, `T5 20 Frames → ${t5}`];
            aus[
                "Schatten-Takt T7: die Kamera bewegt sich — nah jeden Frame, fern jeden fernFaktor-ten, beide dürfen in einen Frame"
            ] = [
                !!kam && t7[0] === 30 && t7[1] === 30 / T.fernFaktor && t7.doppelt > 0,
                `30 Frames → ${t7.join(" / ")}`,
            ];
            aus[
                "Schatten-Takt SELBSTTEST: der alte Schreiber markiert keine Kaskade, das Gesetz vor 1410-3 trägt Doppel-Frames, der Takt schreibt nie shadowMap.needsUpdate"
            ] = [
                s1.z[0] === 0 && s1.z[1] === 0 && s1.auto && s2 > 0 && ohneKarte,
                `S1 ${s1.z.join(" / ")} · S2 doppelt ${s2}`,
            ];
        } finally {
            st.csmNode = echt.csm;
            st.directionalLight = echt.dl;
            st._shadowMinInterval = echt.iv;
            r._shadowLast = null;
            if (echt.eigen) r._loopShadowUpdate = echt.eigen;
        }
        return aus;
    });
    if (erreichbar(check, "Schatten-Takt: die Probe antwortet", a, "keine Antwort der Seite"))
        for (const s in a) check(s, ...[a[s]].flat());
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
