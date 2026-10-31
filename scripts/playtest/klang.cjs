"use strict";
// scripts/playtest/klang.cjs — der Richter von Klang (spec/stamm/modul-karte.json): Lofi-Symphonie · Umwelt-Klang · Resonanz-Pings.
// 2 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const { safeEvaluate, erreichbar } = require("../playtest.cjs");

async function checkBandW4LofiPad({ page, check }) {
    // ### W4 V2/V3 — die Lofi-Pad-Schicht (generative Harmonie) ###
    // Pad-Layer (~60 BPM); die Akkordfolge wächst aus Tonleiter + funktionaler Markov-Kette (seed- +
    // emotion-getrieben), kein fester Akkord-Satz. Je Probe EINE Zeile der Seite: ihr Satz und ihr Urteil (dazu, wo nötig,
    // der Grund) — der Richter liest sie in ihrer Folge.
    const w4v2Results = await safeEvaluate(page, () => {
        const out = {};
        // W4 V3 — Harmonie-Markov-Kette definiert. ZWILLINGS-ABSCHIED 19.07.:
        // die Konstanten-Zwillinge LOFI_SCALE/LOFI_BPM sind ABWESEND — Skala
        // und Tempo wohnen im klang-Gesetzbuch (SCALES/scaleFor · GENRES).
        const harmony = AnazhRealm.LOFI_HARMONY;
        out["W4 V3: LOFI_SCALE abwesend, LOFI_HARMONY frozen"] =
            AnazhRealm.LOFI_SCALE === undefined &&
            Array.isArray(harmony) &&
            harmony.length === 7 &&
            Object.isFrozen(harmony) &&
            harmony.every((t) => Array.isArray(t) && t.length >= 1);
        out["W4 V2: LOFI_BPM abwesend"] = AnazhRealm.LOFI_BPM === undefined;
        // Die SKALA führt das Studio-Klang-Rezept (_lofiActiveScale; warmes Buch → Blues) → die
        // Konstanten-Proben laufen mit VERSTECKTEM Rezept (sichern + wiederherstellen); die
        // Studio-Skalen-Probe steht daneben.
        const fK = r._foundry;
        const prevLofi = fK?.recipes?.lofi;
        if (prevLofi) delete fK.recipes.lofi;
        // Tests wandern 19.07. (ZWILLINGS-ABSCHIED): kaltes Studio-Preset ⇒
        // die KERN-Wahrheit des Host-Genres antwortet (Blues-Skala, fail-
        // closed) — der byte-alte A-Moll-Konstanten-Pfad ist gefallen.
        const prevKSP = r._klangStudioPreset;
        r._klangStudioPreset = () => null;
        // W4 V3 — _lofiChordFromDegree stapelt diatonische Terzen (Kern: Blues), Stufe 0 und 3.
        out["W4 V3: _lofiChordFromDegree stapelt Terzen"] =
            JSON.stringify([0, 3].map((d) => r._lofiChordFromDegree(d))) === "[[0,5,7,12],[6,10,15,18]]";
        // W4 V3 Phase 2 — _lofiScaleSemitone wickelt Oktaven (6-Ton-Blues: idx 6 → +12).
        out["W4 V3: _lofiScaleSemitone wickelt Oktaven"] =
            r._lofiScaleSemitone(0) === 0 && r._lofiScaleSemitone(6) === 12 && r._lofiScaleSemitone(2) === 5;
        r._klangStudioPreset = prevKSP;
        if (prevLofi) fK.recipes.lofi = prevLofi;
        // Mit warmem Buch (Studio-Skala, Akkord-Breite aus colorExt) misst gate:nervensystem-labs (K) den EINEN Mapper.
        // Der Groove wohnt im klang-Gesetzbuch (RHYTHMUS_MUSTER.Swing); die Konstanten-Zwillinge
        // LOFI_GROOVE_PATTERN/GROOVE_SWING sind ABWESEND.
        const gp = AnazhRealm.Gesetz("klang:RHYTHMUS_MUSTER.Swing", null);
        out["W4 V3: RHYTHMUS_MUSTER.Swing trägt den Groove"] =
            AnazhRealm.LOFI_GROOVE_PATTERN === undefined &&
            AnazhRealm.GROOVE_SWING === undefined &&
            !!gp &&
            ["kick", "snare", "hihat"].every((k) => Array.isArray(gp[k]) && gp[k].length >= 1);
        // Swing: ein gerader Schritt liegt auf dem Schlag, ein
        // Off-Beat (ungerade) wird verzögert; swing 0.5 = gerade.
        out["W4 V3: _grooveStepTime swingt den Off-Beat"] =
            r._grooveStepTime(0, 1, 0.58) === 0 &&
            r._grooveStepTime(2, 1, 0.58) === 2 &&
            r._grooveStepTime(1, 1, 0.58) > r._grooveStepTime(1, 1, 0.5) &&
            r._grooveStepTime(1, 1, 0.5) === 1;
        // _lofiChordFreqs — positive Frequenzen, Wurzel A ≈ 110; major-lean (hope) hebt die Terz (Ton 2), lässt die Wurzel.
        const [freqs, freqsMajor] = [false, true].map((dur) => r._lofiChordFreqs([0, 3, 7, 10], dur));
        out["W4 V2: _lofiChordFreqs liefert positive Frequenzen"] = freqs.length === 4 && freqs.every((f) => f > 0);
        out["W4 V2: die Akkord-Wurzel ist A (≈110 Hz)"] = Math.abs(freqs[0] - 110) < 0.01;
        out["W4 V2: hope hebt die Terz"] = freqsMajor[1] > freqs[1] && Math.abs(freqsMajor[0] - freqs[0]) < 0.01;
        // _lofiChordDurationMs — sorrow verlangsamt das Tempo. Das Tempo führt das Studio-Genre
        // (_klangStudioPreset, lofi bpm 78; kaltes Buch → fail-closed); die Erwartung liest DIESELBE Quelle
        // (kein Timing-Flake, das Buch lädt async).
        const emo = st.player.emotions;
        const eBefore = { ...emo };
        const kStudio = r._klangStudioPreset();
        const kBpm = Number.isFinite(kStudio?.bpm) && kStudio.bpm > 0 ? kStudio.bpm : 78;
        emo.sorrow = 0;
        const durCalm = r._lofiChordDurationMs();
        emo.sorrow = 1;
        const durSad = r._lofiChordDurationMs();
        out["W4 V2: sorrow verlangsamt"] = durSad > durCalm && durSad <= (60000 / kBpm) * 4 * 1.5 + 1;
        // Frischer Symphony-Start, damit s.lofi vom aktuellen Code stammt.
        if (st.symphony?.enabled) r.disposeSymphony();
        Object.assign(emo, { joy: 0, hope: 0, sorrow: 0 });
        r.initSymphony();
        const sym = st.symphony;
        if (!(sym?.enabled && sym.ctx))
            out["W4 V2: Symphony im Headless initialisierbar"] = [false, "initSymphony nicht bereit"];
        else {
            // die Lofi-Schichten beweist ihr Spiel (`_lofiTick` spielt einen Akkord, unten), nicht ihre Existenz
            // W4 V3 Phase 2 — die Melodie: Form (startet + endet
            // auf einem Akkord-Ton, aufsteigende Startzeiten, über
            // dem Pad), emotion-gesteuerte Dichte.
            const mel = r._lofiMelodyNotes(0, 4);
            const akkordTon = (nt) => [0, 2, 4, 6].includes(nt?.idx);
            out["W4 V3: Melodie-Form"] =
                Array.isArray(mel) &&
                mel.length >= 1 &&
                mel.every((nt, i) => nt.freq > 200 && !(i && nt.start <= mel[i - 1].start)) &&
                akkordTon(mel[0]) &&
                akkordTon(mel.at(-1));
            // Dichte folgt der Emotion — die Noten über 8 Phrasen bei Freude j und Frieden f summiert
            // (joy belebt, peace lässt Pausen): robust statistisch.
            const dichte = (j, f) => {
                Object.assign(emo, { joy: j, peace: f });
                let n = 0;
                for (let i = 0; i < 8; i++) n += r._lofiMelodyNotes(0, 4).length;
                return n;
            };
            out["W4 V3: Melodie-Dichte folgt der Emotion"] = dichte(1, 0) > dichte(0, 1);
            Object.assign(emo, { joy: 0, peace: 0 });
            // Rhythmus + Dynamik: über 12 Phrasen gibt es
            // verschiedene Noten-LÄNGEN (Halbtakt/Viertel) UND
            // verschiedene Lautstärken (starker vs schwacher Takt).
            const [durSet, velSet] = [new Set(), new Set()];
            for (let i = 0; i < 12; i++)
                for (const nt of r._lofiMelodyNotes(0, 4))
                    (durSet.add(Math.round(nt.dur * 100)), velSet.add(Math.round(nt.vel * 100)));
            out["W4 V3: Melodie mit Rhythmus und Dynamik"] = durSet.size >= 2 && velSet.size >= 2;
            // W4 V4 — die Musik hört die Welt: das Welt-Feld
            // liefert vier geclampte Achsen.
            const wf = r._lofiWorldField();
            out["W4 V4: _lofiWorldField geclampt"] =
                !!wf &&
                ["lebendig", "dichte", "glut", "magieleitung"].every(
                    (k) => typeof wf[k] === "number" && wf[k] >= 0 && wf[k] <= 1
                );
            // Das Welt-Feld biast die Harmonie, die Emotion bleibt dominant: _lofiWorldField gestubbt, um beide
            // Kanäle (Emotion 0.8, Welt-Feld 0.4) bei fixem rngState deterministisch zu vergleichen. Gemessen
            // wird die HOST-Markov-Kette (kaltes Studio); bar-Zähler zurücksetzen.
            r._klangStudioPreset = () => null;
            sym.lofi.bar = 0;
            const origField = r._lofiWorldField;
            // helle Stufen (III/VI) unter n Zügen ab dem RNG-Zustand `saat`, bei Freude/Hoffnung `froh`, Trauer `trauer` und
            // dem Welt-Feld `feld` (ohne: das der Welt)
            const hell = (saat, n, froh, trauer, feld) => {
                r._lofiWorldField = feld ? () => feld : origField;
                Object.assign(emo, { joy: froh, hope: froh, sorrow: trauer });
                sym.lofi.rngState = saat;
                let c = 0;
                for (let i = 0; i < n; i++) if (AnazhRealm.LOFI_BRIGHT_DEGREES.includes(r._lofiNextDegree(0))) c++;
                r._lofiWorldField = origField;
                return c;
            };
            const neutralF = { lebendig: 0.5, dichte: 0.5, glut: 0.5, magieleitung: 0.5 };
            // (a) volle Emotion-Helligkeit, neutrales Welt-Feld · (b) neutrale Emotion, volle Welt-Feld-Helligkeit ·
            // (c) neutrale Emotion, neutrales Welt-Feld
            const [emotionVoll, weltVoll, neutral] = [
                [1, neutralF],
                [0, { lebendig: 1, dichte: 0.5, glut: 0, magieleitung: 1 }],
                [0, neutralF],
            ].map(([froh, feld]) => hell(4242, 500, froh, 0, feld));
            out["W4 V4: das Welt-Feld biast die Harmonie"] = weltVoll > neutral;
            out["W4 V4: die Emotion dominiert"] = emotionVoll > weltVoll;
            // W4 V3 — _lofiNextDegree liefert eine in der Markov-
            // Kette erreichbare Stufe (0..6).
            out["W4 V3: _lofiNextDegree liefert eine markov-erreichbare Stufe"] = AnazhRealm.LOFI_HARMONY[0]
                .map((t) => t[0])
                .includes(r._lofiNextDegree(0));
            // W4 V3 — Determinismus: selber rngState → selbe Folge.
            const folge = () => {
                sym.lofi.rngState = 12345;
                const q = [0];
                for (let i = 0; i < 6; i++) q.push(r._lofiNextDegree(q[i]));
                return q.join();
            };
            out["W4 V3: die Harmonie ist seed-deterministisch"] = folge() === folge();
            // W4 V3 — Emotion biast die Harmonie: bei joy/hope
            // erscheinen helle Stufen (III/VI) häufiger als bei
            // sorrow (selber RNG-Strom → fairer Vergleich).
            out["W4 V3: Emotion biast die Harmonie"] = hell(777, 300, 1, 0) > hell(777, 300, 0, 1);
            r._klangStudioPreset = prevKSP;
            sym.lofi.bar = 0;
            // _lofiTick spielt den ersten Akkord (lastChordAt=
            // -Infinity → sofort fällig) + wählt die nächste Stufe.
            sym.lofi.degree = 0;
            sym.lofi.lastChordAt = -Infinity;
            r._lofiTick();
            const deg = sym.lofi.degree;
            out["W4 V3: _lofiTick spielt einen Akkord"] =
                sym.lofi.lastChordAt > -Infinity && Number.isInteger(deg) && deg >= 0 && deg <= 6;
            // Ein zweiter Tick sofort danach spielt NICHT (Dauer nicht um).
            r._lofiTick();
            out["W4 V2: _lofiTick ist akkord-dauer-gedrosselt"] = sym.lofi.degree === deg;
            // disposeSymphony räumt die Lofi-Schicht.
            r.disposeSymphony();
            out["W4 V2: disposeSymphony räumt die Lofi-Schicht"] = sym.lofi === null;
        }
        Object.assign(emo, eBefore);
        return out;
    });
    if (erreichbar(check, "W4 V2/V3 erreichbar", w4v2Results))
        for (const [satz, urteil] of Object.entries(w4v2Results)) check(satz, ...[urteil].flat());
}

// Der Fuß spielt den Boden, nicht die Uhr — eingefaltet aus gate:schritt-klang (D3b, Orakel Tier-1 #7): die drei Schritt-Klang-
// Gesetze am ECHTEN Chokepoint (animatePlayerSoul → `_schrittKlangTick`), Audio stumm, die EREIGNIS-Logik pur: (A) je Halbzyklus
// der weg-getriebenen Gang-Phase EIN Schritt · (B) Stand, Schleichen, Luft und Schwimmen nie · (C) der gainDeckel (das Timbre je
// Stoff, Wasser am Fuß eingeschlossen, misst gate:gegenstand-stoff --tafel am Klang) · (E) die Stimme-aus-Wand; Selbsttest S1
// (ω ≡ 0 ⇒ 0 Schritte). Die Landung (genau einmal, der Hopser stumm, lauter mit dem Aufprall-Tempo des Leib-Lösers) misst
// gate:klang-zensus (F) am Bus über den echten Leib-Löser.
async function checkBandSchrittKlang({ page, check }) {
    const out = await safeEvaluate(page, () => {
        const s = st,
            A = AnazhRealm;
        const o = { checks: {} };
        if (!A.SCHRITT_KLANG) return { error: "SCHRITT_KLANG-Tabelle fehlt" };
        const T = A.SCHRITT_KLANG;

        // ── die Absenz-Wachen (der Konsum der EINEN Quelle beweist sich unten am Verhalten: (A) zählt Schritte nur über den
        // Tick aus animatePlayerSoul, S1 steht mit ω ≡ 0; Boden und Wasser am Fuß trägt die Stoff-Linse) ──
        o.checks.keineEigeneUhr = window.__fehlt(r._schrittKlangTick, /performance\.now|Date\.now/);
        o.checks.klangEineMaschine = window.__fehlt(r._playSchrittOneShot, /new\s+AudioContext/);
        o.checks.simUnberuehrt = window.__fehlt([r._stepFixedSim, r._loopFixedStep, r._stepCharacter], /_schrittKlang/);
        // Stimme-aus fail-closed an der Stimme selbst (headless: nie aktiviert)
        o.checks.stimmeFailClosed = r._playSchrittOneShot({ gain: 0.05 }) === false && !s.symphony.enabled;

        // ── Bühne: human-Rig + gestubbte Velocity (das koerper-Linsen-Muster) ──
        const p = s.player;
        if (!p || !s.playerMesh) return { error: "kein Spieler" };
        const savedSoul = p.soul;
        if (!s.playerMesh.userData.rig) r.applyPlayerSoul("human");
        if (!s.playerMesh.userData.rig) return { error: "Spieler ohne Rig (koerper-Kern kalt?)" };
        // die Bühne je Träger (Zustand, Spieler) beim Namen ihrer Felder — gesichert, gesetzt, am Ende zurück
        const merk = (t, k) => Object.fromEntries(k.map((f) => [f, t[f]]));
        const saved = [
            [s, merk(s, ["playerVel", "playerUnderwater", "isInAir", "_fieldVy", "_schrittKlang"])],
            [p, merk(p, ["mountedArch", "walkPhase", "_gaitW", "animationLastTick", "_hitStopUntil"])],
        ];
        Object.assign(s, { playerUnderwater: false, isInAir: false, _fieldVy: 0 });
        Object.assign(p, { mountedArch: null, _hitStopUntil: 0 });
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
            for (let k = 1; k <= Math.round(sek * 60); k++) r.animatePlayerSoul(t0 + k / 60);
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

        // ── (C) der Deckel der Landung (das Timbre je Stoff misst die Stoff-Linse am Klang: gate:gegenstand-stoff --tafel) ──
        o.checks.cDeckel = r._schrittKlangParams("stein", true, 1000).gain <= T.gainDeckel + 1e-12;

        // ── (E) STIMME-AUS-WAND: Ereignis zählt, der Klang-Aufruf unterbleibt ──
        let calls = 0;
        const savedPlay = r._playSchrittOneShot;
        r._playSchrittOneShot = () => {
            calls++;
            return true;
        };
        const sym = s.symphony;
        const savedSym = merk(sym, ["enabled", "ctx", "masterGain"]);
        sym.enabled = false;
        frisch();
        fahre(6, 1.0, 1200);
        o.stummSchritte = z().schritte;
        o.checks.eStummZaehlt = o.stummSchritte >= 1 && calls === 0;
        sym.enabled = true; // Stimme an (Fake-Naht — der Spy fängt VOR WebAudio)
        sym.ctx ||= { __fake: true };
        sym.masterGain ||= { __fake: true };
        calls = 0;
        frisch();
        fahre(6, 1.0, 1300);
        o.anSchritte = z().schritte;
        o.anCalls = calls;
        o.checks.eAnRuft = o.anSchritte >= 1 && calls === o.anSchritte;
        r._playSchrittOneShot = savedPlay; // restaurieren (Gate-Hook-Lehre)
        Object.assign(sym, savedSym);

        // ── (S1) SELBST-TEST: Gang-Gesetz mit ω ≡ 0 ⇒ trotz Tempo + Boden 0 Schritte ──
        const savedRate = r._gaitGesetz;
        r._gaitGesetz = () => ({ omega: 0, S: 0, schritt: 0, tast: 0.5, hub: 0 });
        frisch();
        const laufStub = fahre(6, 1.0, 1400);
        r._gaitGesetz = savedRate; // restaurieren (Gate-Hook-Lehre)
        o.s1Phase = laufStub.ph1 - laufStub.ph0;
        o.checks.s1LinseFeuert = o.s1Phase === 0 && z().schritte === 0;

        // ── Bühne restaurieren ──
        for (const [t, w] of saved) Object.assign(t, w);
        if (savedSoul !== p.soul) r.applyPlayerSoul(savedSoul);

        return o;
    });
    if (!erreichbar(check, "Schritt-Klang: die Bühne steht (human-Rig, gestubbte Velocity)", out)) return;
    const c = out.checks || {};
    const alle = (...k) => k.filter((x) => c[x] !== true);
    const zeig = (k) => (k.length ? "ROT: " + k.join(" · ") : "");
    const konsum = alle("keineEigeneUhr", "klangEineMaschine", "simUnberuehrt", "stimmeFailClosed");
    check("Schritt-Klang: Absenz-Wachen und Stimme-aus", !konsum.length, zeig(konsum));
    const takt = alle("aTakt6", "aTakt3", "bStandNull", "bSchleichNull", "bLuftNull", "bSchwimmNull");
    check(`Schritt-Klang (A)(B): N Halbzyklen ⇒ N Schritte ±1 (v=6 ${out.takt.n6}/${out.takt.soll6} · v=3 ${out.takt.n3}/${out.takt.soll3}), Stand/Schleichen/Luft/Schwimmen 0`, !takt.length, zeig(takt));
    const timbre = alle("cDeckel");
    check("Schritt-Klang (C): die Landung bleibt unter dem gainDeckel", !timbre.length, zeig(timbre));
    const stimme = alle("eStummZaehlt", "eAnRuft", "s1LinseFeuert");
    check(`Schritt-Klang (E) + S1: ${out.anCalls}/${out.anSchritte} Aufrufe je Schritt, ω ≡ 0 ⇒ 0`, !stimme.length, zeig(stimme));
}

module.exports = {
    checkBandW4LofiPad, checkBandSchrittKlang,
};
