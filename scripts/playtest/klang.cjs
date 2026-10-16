"use strict";
// scripts/playtest/klang.cjs — der Richter von Klang (spec/stamm/modul-karte.json): Lofi-Symphonie · Umwelt-Klang · Resonanz-Pings.
// 1 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
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

module.exports = {
    checkBandW4LofiPad,
};
