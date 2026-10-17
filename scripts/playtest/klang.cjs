"use strict";
// scripts/playtest/klang.cjs — der Richter von Klang (spec/stamm/modul-karte.json): Lofi-Symphonie · Umwelt-Klang · Resonanz-Pings.
// 2 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const { safeEvaluate } = require("../playtest.cjs");

// V9.52-b Sub-Welle b — Band-Funktion (W4 V2/V3 — die Lofi-Pad-Schicht (generative Harmonie)).
// Mehrere ### -Sektionen als flache Liste; reines verhaltensneutrales Refactoring.
async function checkBandW4LofiPad(ctx) {
    const { page, check, logs, errors, finalState } = ctx;
    void errors;
    void finalState;
    // ### W4 V2/V3 — die Lofi-Pad-Schicht (generative Harmonie) ###
    // Pad-Layer (~60 BPM); die Akkordfolge wächst aus Tonleiter + funktionaler Markov-Kette (seed- +
    // emotion-getrieben), kein fester Akkord-Satz.
    const w4v2Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r) return null;
        const out = {};
        // W4 V3 — Harmonie-Markov-Kette definiert. ZWILLINGS-ABSCHIED 19.07.:
        // die Konstanten-Zwillinge LOFI_SCALE/LOFI_BPM sind ABWESEND — Skala
        // und Tempo wohnen im klang-Gesetzbuch (SCALES/scaleFor · GENRES).
        const harmony = AnazhRealm.LOFI_HARMONY;
        out.scaleHarmonyDefined =
            AnazhRealm.LOFI_SCALE === undefined &&
            Array.isArray(harmony) &&
            harmony.length === 7 &&
            Object.isFrozen(harmony) &&
            harmony.every((t) => Array.isArray(t) && t.length >= 1);
        out.bpmDefined = AnazhRealm.LOFI_BPM === undefined && AnazhRealm.LOFI_BASE_FREQ === 110;
        // Die SKALA führt das Studio-Klang-Rezept (_lofiActiveScale; warmes Buch → Blues) → die
        // Konstanten-Proben laufen mit VERSTECKTEM Rezept (sichern + wiederherstellen); die
        // Studio-Skalen-Probe steht daneben.
        const fK = r._foundry;
        const prevLofi = fK && fK.recipes ? fK.recipes.lofi : undefined;
        if (prevLofi) delete fK.recipes.lofi;
        // Tests wandern 19.07. (ZWILLINGS-ABSCHIED): kaltes Studio-Preset ⇒
        // die KERN-Wahrheit des Host-Genres antwortet (Blues-Skala, fail-
        // closed) — der byte-alte A-Moll-Konstanten-Pfad ist gefallen.
        const prevKSP = r._klangStudioPreset;
        r._klangStudioPreset = () => null;
        // W4 V3 — _lofiChordFromDegree stapelt diatonische Terzen (Kern: Blues).
        const deg0 = r._lofiChordFromDegree(0);
        const deg3 = r._lofiChordFromDegree(3);
        out.chordFromDegree =
            JSON.stringify(deg0) === JSON.stringify([0, 5, 7, 12]) &&
            JSON.stringify(deg3) === JSON.stringify([6, 10, 15, 18]);
        // W4 V3 Phase 2 — _lofiScaleSemitone wickelt Oktaven (6-Ton-Blues: idx 6 → +12).
        out.scaleSemitone =
            r._lofiScaleSemitone(0) === 0 && r._lofiScaleSemitone(6) === 12 && r._lofiScaleSemitone(2) === 5;
        r._klangStudioPreset = prevKSP;
        if (prevLofi) fK.recipes.lofi = prevLofi;
        // Mit warmem Buch faltet der EINE Mapper in die Studio-Skala (lofi → Blues [0,3,5,6,7,10], idx 6 =
        // Oktav-Wurzel +12). Akkord-BREITE = klang-Gesetz colorExt: Grund-Vierklang [0,5,7,12], Stapel
        // 3 + colorExt(dna.color) (warmes LoFi-Buch: color 0.60 → 5 Töne).
        const _sp = r._klangStudioPreset();
        const _kc = globalThis.__klangCore;
        const _chord0 = r._lofiChordFromDegree(0);
        const _extSoll =
            _kc && typeof _kc.colorExt === "function" ? _kc.colorExt(_sp && _sp.dna ? _sp.dna.color : 0) : 1;
        out.scaleStudio =
            !prevLofi ||
            (r._lofiScaleSemitone(2) === 5 &&
                r._lofiScaleSemitone(6) === 12 &&
                _chord0.length === 3 + _extSoll &&
                JSON.stringify(_chord0.slice(0, 4)) === JSON.stringify([0, 5, 7, 12]));
        // Der Groove wohnt im klang-Gesetzbuch (RHYTHMUS_MUSTER.Swing); die Konstanten-Zwillinge
        // LOFI_GROOVE_PATTERN/GROOVE_SWING sind ABWESEND.
        const gp = AnazhRealm.Gesetz("klang:RHYTHMUS_MUSTER.Swing", null);
        out.grooveDefined =
            AnazhRealm.LOFI_GROOVE_PATTERN === undefined &&
            AnazhRealm.GROOVE_SWING === undefined &&
            !!gp &&
            Array.isArray(gp.kick) &&
            Array.isArray(gp.snare) &&
            Array.isArray(gp.hihat) &&
            gp.kick.length >= 1 &&
            gp.snare.length >= 1 &&
            gp.hihat.length >= 1;
        // Swing: ein gerader Schritt liegt auf dem Schlag, ein
        // Off-Beat (ungerade) wird verzögert; swing 0.5 = gerade.
        out.grooveStepTime =
            r._grooveStepTime(0, 1, 0.58) === 0 &&
            r._grooveStepTime(2, 1, 0.58) === 2 &&
            r._grooveStepTime(1, 1, 0.58) > r._grooveStepTime(1, 1, 0.5) &&
            r._grooveStepTime(1, 1, 0.5) === 1;
        // _lofiChordFreqs — positive Frequenzen, Wurzel A ≈ 110.
        const freqs = r._lofiChordFreqs([0, 3, 7, 10], false);
        out.freqsPositive = freqs.length === 4 && freqs.every((f) => f > 0);
        out.rootIsA = Math.abs(freqs[0] - 110) < 0.01;
        // major-lean (hope) hebt die Terz (Ton 2), lässt die Wurzel.
        const freqsMajor = r._lofiChordFreqs([0, 3, 7, 10], true);
        out.majorLeanRaisesThird = freqsMajor[1] > freqs[1] && Math.abs(freqsMajor[0] - freqs[0]) < 0.01;
        // _lofiChordDurationMs — sorrow verlangsamt das Tempo. Das Tempo führt das Studio-Genre
        // (_klangStudioPreset, lofi bpm 78; kaltes Buch → fail-closed); die Erwartung liest DIESELBE Quelle
        // (kein Timing-Flake, das Buch lädt async).
        const emo = r.state.player.emotions;
        const eBefore = { joy: emo.joy, hope: emo.hope, sorrow: emo.sorrow, peace: emo.peace };
        const kStudio = r._klangStudioPreset();
        const kBpm = kStudio && Number.isFinite(kStudio.bpm) && kStudio.bpm > 0 ? kStudio.bpm : 78;
        const baseExpected = (60000 / kBpm) * 4;
        emo.sorrow = 0;
        const durCalm = r._lofiChordDurationMs();
        emo.sorrow = 1;
        const durSad = r._lofiChordDurationMs();
        out.calmDuration4s = Math.abs(durCalm - baseExpected) < 1;
        out.sorrowSlowsTempo = durSad > durCalm && durSad <= baseExpected * 1.5 + 1;
        // Frischer Symphony-Start, damit s.lofi vom aktuellen Code stammt.
        if (r.state.symphony && r.state.symphony.enabled && typeof r.disposeSymphony === "function") {
            r.disposeSymphony();
        }
        emo.joy = 0;
        emo.hope = 0;
        emo.sorrow = 0;
        if (typeof r.initSymphony === "function") r.initSymphony();
        const sym = r.state.symphony;
        out.symphonyReady = !!(sym && sym.enabled && sym.ctx);
        if (out.symphonyReady) {
            out.lofiLayerBuilt =
                !!sym.lofi &&
                !!sym.lofi.gain &&
                !!sym.lofi.filter &&
                !!sym.lofi.melodyGain &&
                // V8.91 — die Lead-Stimme sitzt über dem Pad.
                sym.lofi.melodyGain.gain.value >= 0.2 &&
                // V8.91 Phase 3 — die Groove-Schicht + Noise-Puffer.
                !!sym.lofi.grooveGain &&
                !!sym.lofi.noiseBuffer &&
                // V8.93 Phase 4 — die Bass-Schicht.
                !!sym.lofi.bassGain &&
                sym.lofi.degree === 0 &&
                typeof sym.lofi.rngState === "number";
            // W4 V3 Phase 2 — die Melodie: Form (startet + endet
            // auf einem Akkord-Ton, aufsteigende Startzeiten, über
            // dem Pad), emotion-gesteuerte Dichte, wurf-frei.
            const mel = r._lofiMelodyNotes(0, 4);
            const chordTones = [0, 2, 4, 6];
            let melAsc = true;
            for (let i = 1; i < mel.length; i++) if (mel[i].start <= mel[i - 1].start) melAsc = false;
            out.melodyShape =
                Array.isArray(mel) &&
                mel.length >= 1 &&
                mel.every((nt) => nt.freq > 200) &&
                melAsc &&
                chordTones.indexOf(mel[0].idx) >= 0 &&
                chordTones.indexOf(mel[mel.length - 1].idx) >= 0;
            // Dichte folgt der Emotion — über 8 Phrasen summiert
            // (joy belebt, peace lässt Pausen): robust statistisch.
            emo.joy = 1;
            emo.peace = 0;
            let melJoyTotal = 0;
            for (let i = 0; i < 8; i++) melJoyTotal += r._lofiMelodyNotes(0, 4).length;
            emo.joy = 0;
            emo.peace = 1;
            let melPeaceTotal = 0;
            for (let i = 0; i < 8; i++) melPeaceTotal += r._lofiMelodyNotes(0, 4).length;
            emo.joy = 0;
            emo.peace = 0;
            out.melodyDensityEmotion = melJoyTotal > melPeaceTotal;
            // V8.90 — Rhythmus + Dynamik: über 12 Phrasen gibt es
            // verschiedene Noten-LÄNGEN (Halbtakt/Viertel) UND
            // verschiedene Lautstärken (starker vs schwacher Takt).
            const durSet = new Set();
            const velSet = new Set();
            for (let i = 0; i < 12; i++) {
                for (const nt of r._lofiMelodyNotes(0, 4)) {
                    durSet.add(Math.round(nt.dur * 100));
                    velSet.add(Math.round(nt.vel * 100));
                }
            }
            out.melodyRhythmDynamics = durSet.size >= 2 && velSet.size >= 2;
            let melOk = true;
            try {
                r._lofiPlayMelody(0, 4);
            } catch (e) {
                melOk = false;
                void e;
            }
            out.melodyPlayRuns = melOk;
            // W4 V3 Phase 3 — der Groove spielt wurf-frei.
            let grooveOk = true;
            try {
                r._lofiPlayGroove(4);
            } catch (e) {
                grooveOk = false;
                void e;
            }
            out.groovePlayRuns = grooveOk;
            // W4 V3 Phase 4 — der Bass spielt wurf-frei (folgt der
            // Akkord-Wurzel auf den Kick-Schritten).
            let bassOk = true;
            try {
                r._lofiPlayBass(0, 4);
                r._lofiPlayBass(3, 4);
            } catch (e) {
                bassOk = false;
                void e;
            }
            out.bassPlayRuns = bassOk;
            // W4 V4 — die Musik hört die Welt: das Welt-Feld
            // liefert vier geclampte Achsen.
            const wf = r._lofiWorldField();
            out.worldFieldShape =
                !!wf &&
                ["lebendig", "dichte", "glut", "magieleitung"].every(
                    (k) => typeof wf[k] === "number" && wf[k] >= 0 && wf[k] <= 1
                );
            // W4 V4 Sub-Schritt 1 — die Timbre-Modulation läuft wurf-frei.
            let timbreOk = true;
            try {
                r._lofiApplyWorldTimbre(4);
            } catch (e) {
                timbreOk = false;
                void e;
            }
            out.worldTimbreRuns = timbreOk;
            // W4 V4 Sub-Schritt 3 — Resonanz-Nähe liefert einen Boolean.
            let nearResOk = true;
            let nearResBool = false;
            try {
                nearResBool = r._lofiNearResonantArchitecture();
            } catch (e) {
                nearResOk = false;
                void e;
            }
            out.nearResonantBoolean = nearResOk && typeof nearResBool === "boolean";
            // Das Welt-Feld biast die Harmonie, die Emotion bleibt dominant: _lofiWorldField gestubbt, um beide
            // Kanäle (Emotion 0.8, Welt-Feld 0.4) bei fixem rngState deterministisch zu vergleichen. Gemessen
            // wird die HOST-Markov-Kette (kaltes Studio); bar-Zähler zurücksetzen.
            r._klangStudioPreset = () => null;
            sym.lofi.bar = 0;
            {
                const brightDeg = AnazhRealm.LOFI_BRIGHT_DEGREES;
                const origField = r._lofiWorldField;
                const countBright = () => {
                    sym.lofi.rngState = 4242;
                    let c = 0;
                    for (let i = 0; i < 500; i++) if (brightDeg.indexOf(r._lofiNextDegree(0)) >= 0) c++;
                    return c;
                };
                const neutralF = { lebendig: 0.5, dichte: 0.5, glut: 0.5, magieleitung: 0.5 };
                const brightF = { lebendig: 1, dichte: 0.5, glut: 0, magieleitung: 1 };
                // (a) volle Emotion-Helligkeit, neutrales Welt-Feld
                emo.joy = 1;
                emo.hope = 1;
                emo.sorrow = 0;
                r._lofiWorldField = () => neutralF;
                const brightEmotionFull = countBright();
                // (b) neutrale Emotion, volle Welt-Feld-Helligkeit
                emo.joy = 0;
                emo.hope = 0;
                emo.sorrow = 0;
                r._lofiWorldField = () => brightF;
                const brightWorldFull = countBright();
                // (c) neutrale Emotion, neutrales Welt-Feld
                r._lofiWorldField = () => neutralF;
                const brightFieldNeutral = countBright();
                r._lofiWorldField = origField;
                out.emotionDominatesWorldBias = brightEmotionFull > brightWorldFull;
                out.worldFieldBiasesHarmony = brightWorldFull > brightFieldNeutral;
            }
            // W4 V3 — _lofiNextDegree liefert eine in der Markov-
            // Kette erreichbare Stufe (0..6).
            const allowed = AnazhRealm.LOFI_HARMONY[0].map((t) => t[0]);
            const nd = r._lofiNextDegree(0);
            out.nextDegreeValid = allowed.indexOf(nd) >= 0;
            // W4 V3 — Determinismus: selber rngState → selbe Folge.
            sym.lofi.rngState = 12345;
            const seqA = [];
            for (let i = 0; i < 6; i++) seqA.push(r._lofiNextDegree(seqA.length ? seqA[i - 1] : 0));
            sym.lofi.rngState = 12345;
            const seqB = [];
            for (let i = 0; i < 6; i++) seqB.push(r._lofiNextDegree(seqB.length ? seqB[i - 1] : 0));
            out.harmonyDeterministic = JSON.stringify(seqA) === JSON.stringify(seqB);
            // W4 V3 — Emotion biast die Harmonie: bei joy/hope
            // erscheinen helle Stufen (III/VI) häufiger als bei
            // sorrow (selber RNG-Strom → fairer Vergleich).
            const bright = AnazhRealm.LOFI_BRIGHT_DEGREES;
            const countBright = () => {
                sym.lofi.rngState = 777;
                let c = 0;
                for (let i = 0; i < 300; i++) if (bright.indexOf(r._lofiNextDegree(0)) >= 0) c++;
                return c;
            };
            emo.joy = 1;
            emo.hope = 1;
            emo.sorrow = 0;
            const brightJoy = countBright();
            emo.joy = 0;
            emo.hope = 0;
            emo.sorrow = 1;
            const brightSorrow = countBright();
            out.emotionBiasesHarmony = brightJoy > brightSorrow;
            r._klangStudioPreset = prevKSP;
            sym.lofi.bar = 0;
            // _lofiTick spielt den ersten Akkord (lastChordAt=
            // -Infinity → sofort fällig) + wählt die nächste Stufe.
            sym.lofi.degree = 0;
            sym.lofi.lastChordAt = -Infinity;
            r._lofiTick();
            out.tickPlaysChord =
                sym.lofi.lastChordAt > -Infinity &&
                Number.isInteger(sym.lofi.degree) &&
                sym.lofi.degree >= 0 &&
                sym.lofi.degree <= 6;
            // Ein zweiter Tick sofort danach spielt NICHT (Dauer nicht um).
            const degAfter = sym.lofi.degree;
            r._lofiTick();
            out.tickThrottled = sym.lofi.degree === degAfter;
            // symphonyTick ruft _lofiTick — kein Wurf.
            let symTickOk = true;
            try {
                r.symphonyTick();
            } catch (e) {
                symTickOk = false;
                void e;
            }
            out.symphonyTickRuns = symTickOk;
            // disposeSymphony räumt die Lofi-Schicht.
            r.disposeSymphony();
            out.disposeClearsLofi = sym.lofi === null;
        }
        emo.joy = eBefore.joy;
        emo.hope = eBefore.hope;
        emo.sorrow = eBefore.sorrow;
        emo.peace = eBefore.peace;
        return out;
    });
    if (!w4v2Results || w4v2Results.error) {
        check("W4 V2/V3 erreichbar", false, (w4v2Results && w4v2Results.error) || "page.evaluate fehlgeschlagen");
    } else {
        check(
            "W4 V3: LOFI_SCALE abwesend (Zwilling fiel 19.07.) + LOFI_HARMONY (7 Stufen) frozen",
            w4v2Results.scaleHarmonyDefined
        );
        check("W4 V2: LOFI_BPM abwesend (Zwilling fiel 19.07.) + LOFI_BASE_FREQ=110", w4v2Results.bpmDefined);
        check(
            "W4 V3: _lofiChordFromDegree stapelt Terzen (kaltes Preset → Kern-Blues [0,5,7,12])",
            w4v2Results.chordFromDegree
        );
        check("W4 V3: _lofiScaleSemitone wickelt Oktaven (6-Ton-Blues: idx 6 → +12)", w4v2Results.scaleSemitone);
        check(
            "W-A7-Vertiefung: der EINE Ton-Mapper faltet in die Studio-Skala (lofi → Blues, 6 Töne)",
            w4v2Results.scaleStudio
        );
        check(
            "W4 V3 Phase 3: RHYTHMUS_MUSTER.Swing (Kern) trägt kick/snare/hihat — LOFI_GROOVE_PATTERN/GROOVE_SWING abwesend",
            w4v2Results.grooveDefined
        );
        check(
            "W4 V3 Phase 3: _grooveStepTime — Off-Beat-Schritt wird geswingt (verzögert)",
            w4v2Results.grooveStepTime
        );
        check("W4 V2: _lofiChordFreqs liefert positive Frequenzen", w4v2Results.freqsPositive);
        check("W4 V2: die Akkord-Wurzel ist A (≈110 Hz)", w4v2Results.rootIsA);
        check("W4 V2: major-lean (hope) hebt die Terz, lässt die Wurzel", w4v2Results.majorLeanRaisesThird);
        check(
            "W4 V2/W-A7: _lofiChordDurationMs — ruhig == Studio-/Fallback-Tempo x 4 Schlaege",
            w4v2Results.calmDuration4s
        );
        check("W4 V2: sorrow verlangsamt das Lofi-Tempo (bis ~6 s)", w4v2Results.sorrowSlowsTempo);
        if (w4v2Results.symphonyReady) {
            check(
                "W4 V2/V3: initSymphony baut die Lofi-Schicht (gain + filter + melodyGain + RNG)",
                w4v2Results.lofiLayerBuilt
            );
            check(
                "W4 V3 Phase 2: _lofiMelodyNotes — Phrase startet + endet auf Akkord-Ton, steigt zeitlich",
                w4v2Results.melodyShape
            );
            check(
                "W4 V3 Phase 2: Melodie-Dichte folgt der Emotion (joy lebhafter als peace)",
                w4v2Results.melodyDensityEmotion
            );
            check(
                "W4 V3 Phase 2: Melodie hat Rhythmus + Dynamik (verschiedene Noten-Längen + Lautstärken)",
                w4v2Results.melodyRhythmDynamics
            );
            check("W4 V3 Phase 2: _lofiPlayMelody spielt die Phrase wurf-frei", w4v2Results.melodyPlayRuns);
            check("W4 V3 Phase 3: _lofiPlayGroove spielt den Groove wurf-frei", w4v2Results.groovePlayRuns);
            check(
                "W4 V3 Phase 4: _lofiPlayBass spielt den Bass wurf-frei (folgt der Akkord-Wurzel)",
                w4v2Results.bassPlayRuns
            );
            check("W4 V4: _lofiWorldField liefert vier geclampte Welt-Achsen (0..1)", w4v2Results.worldFieldShape);
            check("W4 V4 Sub-1: _lofiApplyWorldTimbre moduliert die Klangfarbe wurf-frei", w4v2Results.worldTimbreRuns);
            check(
                "W4 V4 Sub-3: _lofiNearResonantArchitecture liefert einen Boolean wurf-frei",
                w4v2Results.nearResonantBoolean
            );
            check(
                "W4 V4 Sub-2: das Welt-Feld biast die Harmonie (helles Feld → mehr helle Stufen)",
                w4v2Results.worldFieldBiasesHarmony
            );
            check(
                "W4 V4 Sub-2: die Emotion bleibt der dominante Bias (Emotion 0.8 > Welt-Feld 0.4)",
                w4v2Results.emotionDominatesWorldBias
            );
            check("W4 V3: _lofiNextDegree liefert eine markov-erreichbare Stufe", w4v2Results.nextDegreeValid);
            check(
                "W4 V3: die Harmonie ist seed-deterministisch (selber RNG → selbe Folge)",
                w4v2Results.harmonyDeterministic
            );
            check("W4 V3: Emotion biast die Harmonie (joy/hope → mehr helle Stufen)", w4v2Results.emotionBiasesHarmony);
            check("W4 V3: _lofiTick spielt einen Akkord + wählt die nächste Stufe", w4v2Results.tickPlaysChord);
            check("W4 V2: _lofiTick ist akkord-dauer-gedrosselt", w4v2Results.tickThrottled);
            check("W4 V2: symphonyTick ruft _lofiTick wurf-frei", w4v2Results.symphonyTickRuns);
            check("W4 V2: disposeSymphony räumt die Lofi-Schicht", w4v2Results.disposeClearsLofi);
        } else {
            check("W4 V2: Symphony im Headless initialisierbar", false, "initSymphony nicht bereit");
        }
    }
}

// Der Fuß spielt den Boden, nicht die Uhr — eingefaltet aus gate:schritt-klang (D3b, Orakel Tier-1 #7): die drei Schritt-Klang-
// Gesetze am ECHTEN Chokepoint (animatePlayerSoul → `_schrittKlangTick`), Audio stumm, die EREIGNIS-Logik pur: (A) je Halbzyklus
// der weg-getriebenen Gang-Phase EIN Schritt · (B) Stand, Schleichen, Luft und Schwimmen nie · (C) das Material wählt das Timbre
// aus der EINEN Tabelle (Wasser am Fuß „wasser", Fallback, gainDeckel) · (D) die Landung GENAU EINMAL, stärker und tiefer, unter
// LAND_DIP_MIN_SPEED keine · (E) die Stimme-aus-Wand; Selbsttests S1 (ω ≡ 0 ⇒ 0 Schritte) und S2 (die Nass-Wand vor dem Boden).
async function checkBandSchrittKlang(ctx) {
    const { page, check } = ctx;
    const out = await safeEvaluate(page, () => {
        const r = window.anazhRealm,
            s = r.state,
            A = r.constructor;
        const o = { checks: {} };
        for (const fn of [
            "_schrittKlangTick",
            "_schrittKlangEreignis",
            "_schrittMaterialAt",
            "_schrittKlangParams",
            "_playSchrittOneShot",
            "_gaitGesetz",
            "_terrainMaterialAt",
            "_koerperWasser",
            "animatePlayerSoul",
        ]) {
            if (typeof r[fn] !== "function") return { error: fn + " fehlt" };
        }
        if (!A.SCHRITT_KLANG) return { error: "SCHRITT_KLANG-Tabelle fehlt" };
        const T = A.SCHRITT_KLANG;
        const codeOf = window.__codeOf;
    
        // ── KONSUM-/Source-Proben (Lehre 6): die EINE Quelle ist verdrahtet ──
        o.checks.konsumTick = /_schrittKlangTick\(/.test(codeOf(r.animatePlayerSoul));
        const tickSrc = codeOf(r._schrittKlangTick);
        o.checks.keineEigeneUhr =
            /walkPhase/.test(tickSrc) && !/performance\.now/.test(tickSrc) && !/Date\.now/.test(tickSrc);
        o.checks.eineSchwelle = /LAND_DIP_MIN_SPEED/.test(tickSrc); // kein Schwellen-Zwilling
        const matSrc = codeOf(r._schrittMaterialAt);
        o.checks.materialQuellen = /_terrainMaterialAt/.test(matSrc) && /_koerperWasser/.test(matSrc);
        const shotSrc = codeOf(r._playSchrittOneShot);
        o.checks.klangEineMaschine =
            /masterGain/.test(shotSrc) && /enabled/.test(shotSrc) && !/new\s+AudioContext/.test(shotSrc);
        o.checks.simUnberuehrt =
            !/_schrittKlang/.test(codeOf(r._stepFixedSim)) &&
            !/_schrittKlang/.test(codeOf(r._loopFixedStep)) &&
            !/_schrittKlang/.test(codeOf(r._stepCharacter));
        // Stimme-aus fail-closed an der Stimme selbst (headless: nie aktiviert)
        o.checks.stimmeFailClosed = r._playSchrittOneShot({ gain: 0.05 }) === false && !s.symphony.enabled;
    
        // ── Bühne: human-Rig + gestubbte Velocity (das koerper-Linsen-Muster) ──
        const p = s.player;
        if (!p || !s.playerMesh) return { error: "kein Spieler" };
        const savedSoul = p.soul;
        if (!s.playerMesh.userData.rig && typeof r.applyPlayerSoul === "function") r.applyPlayerSoul("human");
        const pmesh = s.playerMesh;
        if (!pmesh.userData.rig) return { error: "Spieler ohne Rig (koerper-Kern kalt?)" };
        const saved = {
            vel: s.playerVel,
            uw: s.playerUnderwater,
            mounted: p.mountedArch,
            walkPhase: p.walkPhase,
            gaitW: p._gaitW,
            lastTick: p.animationLastTick,
            isInAir: s.isInAir,
            fieldVy: s._fieldVy,
            schritt: s._schrittKlang,
            hitStop: p._hitStopUntil,
        };
        s.playerUnderwater = false;
        p.mountedArch = null;
        p._hitStopUntil = 0;
        s.isInAir = false;
        s._fieldVy = 0;
        let vStub = 0;
        s.playerVel = { x: () => vStub, z: () => 0, y: () => 0 };
        const z = () => s._schrittKlang || { schritte: 0, landungen: 0, letzter: null };
        const frisch = () => {
            s._schrittKlang = null;
        };
        // fährt sek Sekunden bei Tempo v; liefert Phase-Start (NACH dem
        // Anker-Tick bei t0) und Phase-Ende — die Soll-Schritte sind die
        // π-Grenz-Überquerungen dazwischen.
        const fahre = (v, sek, t0) => {
            vStub = v;
            p.animationLastTick = -Infinity;
            r.animatePlayerSoul(t0); // dt=0 — ankert ohne Ereignis
            const ph0 = p.walkPhase;
            const n = Math.round(sek * 60);
            for (let k = 1; k <= n; k++) r.animatePlayerSoul(t0 + k / 60);
            return { ph0, ph1: p.walkPhase };
        };
        const halbe = (lauf) => Math.floor(lauf.ph1 / Math.PI) - Math.floor(lauf.ph0 / Math.PI);
    
        // ── (A) SCHRITT-TAKT: N Halbzyklen ⇒ N Ereignisse (±1), zwei Tempi ──
        frisch();
        const lauf6 = fahre(6, 2.0, 100);
        const n6 = z().schritte;
        const soll6 = halbe(lauf6);
        frisch();
        const lauf3 = fahre(3, 2.0, 200);
        const n3 = z().schritte;
        const soll3 = halbe(lauf3);
        o.takt = { n6, soll6, n3, soll3 };
        o.checks.aTakt6 = soll6 >= 3 && Math.abs(n6 - soll6) <= 1;
        o.checks.aTakt3 = soll3 >= 1 && Math.abs(n3 - soll3) <= 1;
    
        // ── (B) STAND/SCHLEICHEN/LUFT/SCHWIMMEN: 0 Ereignisse ──
        frisch();
        fahre(0, 1.0, 300);
        o.checks.bStandNull = z().schritte === 0 && z().landungen === 0;
        frisch();
        const laufSchleich = fahre(0.5, 1.0, 400); // Phase rückt, Tempo unter der Schwelle
        o.schleichPhase = laufSchleich.ph1 - laufSchleich.ph0;
        o.checks.bSchleichNull = z().schritte === 0 && o.schleichPhase > 0;
        frisch();
        s.isInAir = true; // Luft: Phase rückt weiter, aber kein Boden-Kontakt
        const laufLuft = fahre(6, 1.0, 500);
        s.isInAir = false;
        o.luftPhase = laufLuft.ph1 - laufLuft.ph0;
        o.checks.bLuftNull = z().schritte === 0 && o.luftPhase > Math.PI;
        frisch();
        s.playerUnderwater = true; // Schwimmen: die Schwimm-Phase rückt, kein Schritt
        fahre(6, 1.0, 600);
        s.playerUnderwater = false;
        o.checks.bSchwimmNull = z().schritte === 0;
    
        // ── (C) MATERIAL WÄHLT TIMBRE — zwei Böden durch die ECHTE Pipe ──
        const savedTerr = r._terrainMaterialAt;
        const savedWl = r._koerperWasser;
        r._koerperWasser = () => -Infinity; // trocken (der Boden entscheidet)
        r._terrainMaterialAt = () => "erde";
        frisch();
        fahre(6, 1.5, 700);
        const pErde = z().letzter;
        r._terrainMaterialAt = () => "stein";
        frisch();
        fahre(6, 1.5, 800);
        const pStein = z().letzter;
        o.timbre = { erde: pErde, stein: pStein };
        o.checks.cZweiBoeden =
            !!pErde &&
            !!pStein &&
            pErde.material === "erde" &&
            pStein.material === "stein" &&
            (pErde.freq !== pStein.freq || pErde.filter !== pStein.filter);
        // (S2) SELBST-TEST: Nass schlägt fest — Wasser über dem Fuß gewinnt
        r._koerperWasser = () => pmesh.position.y + 5;
        frisch();
        fahre(6, 1.0, 900);
        const pNass = z().letzter;
        r._terrainMaterialAt = savedTerr; // restaurieren (Gate-Hook-Lehre)
        r._koerperWasser = savedWl;
        o.checks.s2NassSchlaegtFest = !!pNass && pNass.material === "wasser";
        // Tabelle pur: Fallback + Deckel
        o.checks.cFallback = r._schrittKlangParams("nebelkuchen", false, 0).material === T.fallback;
        o.checks.cDeckel = r._schrittKlangParams("stein", true, 1000).gain <= T.gainDeckel + 1e-12;
    
        // ── (D) LANDUNG: genau 1×, stärker + tiefer; unter der Schwelle nie ──
        const falle = (t0, fallTempo, frames) => {
            vStub = 0;
            p.animationLastTick = -Infinity;
            r.animatePlayerSoul(t0); // geerdet ankern
            s.isInAir = true;
            for (let k = 0; k < frames; k++) {
                s._fieldVy = -(fallTempo * (k + 1)) / frames; // wachsendes Fall-Tempo
                r.animatePlayerSoul(t0 + 0.1 + k / 60);
            }
            s.isInAir = false;
            s._fieldVy = 0;
            r.animatePlayerSoul(t0 + 0.2 + frames / 60); // das Aufsetzen
        };
        frisch();
        falle(1000, 9, 30); // harter Fall (9 m/s ≫ LAND_DIP_MIN_SPEED)
        const landA = { landungen: z().landungen, letzter: z().letzter };
        for (let k = 1; k <= 30; k++) r.animatePlayerSoul(1002 + k / 60); // weitere Boden-Ticks
        o.land = landA;
        o.checks.dGenauEinmal = landA.landungen === 1 && z().landungen === 1 && z().schritte === 0;
        const schrittRef = landA.letzter ? r._schrittKlangParams(landA.letzter.material, false, 0) : null;
        o.checks.dStaerkerTiefer =
            !!landA.letzter &&
            landA.letzter.landung === true &&
            !!schrittRef &&
            landA.letzter.gain > schrittRef.gain &&
            landA.letzter.freq < schrittRef.freq;
        frisch();
        falle(1100, 1.0, 10); // Hopser (1 m/s < LAND_DIP_MIN_SPEED)
        o.checks.dSchwelleHaelt = z().landungen === 0;
    
        // ── (E) STIMME-AUS-WAND: Ereignis zählt, der Klang-Aufruf unterbleibt ──
        let calls = 0;
        const savedPlay = r._playSchrittOneShot;
        r._playSchrittOneShot = () => {
            calls++;
            return true;
        };
        const sym = s.symphony;
        const savedSym = { enabled: sym.enabled, ctx: sym.ctx, masterGain: sym.masterGain };
        sym.enabled = false;
        frisch();
        fahre(6, 1.0, 1200);
        o.stummSchritte = z().schritte;
        o.checks.eStummZaehlt = o.stummSchritte >= 1 && calls === 0;
        sym.enabled = true; // Stimme an (Fake-Naht — der Spy fängt VOR WebAudio)
        if (!sym.ctx) sym.ctx = { __fake: true };
        if (!sym.masterGain) sym.masterGain = { __fake: true };
        calls = 0;
        frisch();
        fahre(6, 1.0, 1300);
        o.anSchritte = z().schritte;
        o.anCalls = calls;
        o.checks.eAnRuft = o.anSchritte >= 1 && calls === o.anSchritte;
        r._playSchrittOneShot = savedPlay; // restaurieren (Gate-Hook-Lehre)
        sym.enabled = savedSym.enabled;
        sym.ctx = savedSym.ctx;
        sym.masterGain = savedSym.masterGain;
    
        // ── (S1) SELBST-TEST: Gang-Gesetz mit ω ≡ 0 ⇒ trotz Tempo + Boden 0 Schritte ──
        const savedRate = r._gaitGesetz;
        r._gaitGesetz = () => ({ omega: 0, S: 0, schritt: 0, tast: 0.5, hub: 0 });
        frisch();
        const laufStub = fahre(6, 1.0, 1400);
        r._gaitGesetz = savedRate; // restaurieren (Gate-Hook-Lehre)
        o.s1Phase = laufStub.ph1 - laufStub.ph0;
        o.checks.s1LinseFeuert = o.s1Phase === 0 && z().schritte === 0;
    
        // ── Bühne restaurieren ──
        s.playerVel = saved.vel;
        s.playerUnderwater = saved.uw;
        p.mountedArch = saved.mounted;
        p.walkPhase = saved.walkPhase;
        p._gaitW = saved.gaitW;
        p.animationLastTick = saved.lastTick;
        s.isInAir = saved.isInAir;
        s._fieldVy = saved.fieldVy;
        s._schrittKlang = saved.schritt;
        p._hitStopUntil = saved.hitStop;
        if (savedSoul !== p.soul && typeof r.applyPlayerSoul === "function") r.applyPlayerSoul(savedSoul);
    
        return o;
    });
    if (!out || out.error) return check("Schritt-Klang: die Bühne steht (human-Rig, gestubbte Velocity)", false, out ? out.error : "keine Antwort der Seite");
    const c = out.checks || {};
    const alle = (...k) => k.filter((x) => c[x] !== true);
    const zeig = (k) => (k.length ? "ROT: " + k.join(" · ") : "");
    const konsum = alle("konsumTick", "keineEigeneUhr", "eineSchwelle", "materialQuellen", "klangEineMaschine", "simUnberuehrt", "stimmeFailClosed");
    check("Schritt-Klang KONSUM: der EINE Tick liest walkPhase, LAND_DIP_MIN_SPEED, _terrainMaterialAt + _koerperWasser, die EINE Stimme; die fixe Sim kennt ihn nicht", !konsum.length, zeig(konsum));
    const takt = alle("aTakt6", "aTakt3", "bStandNull", "bSchleichNull", "bLuftNull", "bSchwimmNull");
    check(`Schritt-Klang (A)(B): N Halbzyklen ⇒ N Schritte ±1 (v=6 ${out.takt.n6}/${out.takt.soll6} · v=3 ${out.takt.n3}/${out.takt.soll3}), Stand/Schleichen/Luft/Schwimmen 0`, !takt.length, zeig(takt));
    const timbre = alle("cZweiBoeden", "s2NassSchlaegtFest", "cFallback", "cDeckel");
    check("Schritt-Klang (C): zwei Böden ⇒ zwei Timbres aus der EINEN Tabelle, Wasser am Fuß ⇒ „wasser“ (S2), Fallback, gainDeckel", !timbre.length, zeig(timbre));
    const land = alle("dGenauEinmal", "dStaerkerTiefer", "dSchwelleHaelt");
    check(`Schritt-Klang (D): die Landung feuert GENAU EINMAL (${out.land.landungen}×), STÄRKER + TIEFER als der Schritt, der Hopser bleibt stumm`, !land.length, zeig(land));
    const stimme = alle("eStummZaehlt", "eAnRuft", "s1LinseFeuert");
    check(`Schritt-Klang (E) + S1: Stimme aus zählt ohne Aufruf, Stimme an ruft EINMAL je Schritt (${out.anCalls}/${out.anSchritte}), ω ≡ 0 ⇒ 0 Schritte`, !stimme.length, zeig(stimme));
}

module.exports = {
    checkBandW4LofiPad, checkBandSchrittKlang,
};
