class AnazhRealm_Z04 {
    // ===== ATLAS §04 · AUDIO — Lo-Fi-Symphonie · Resonanz-Pings =====
    // W4 V3 Phase 2 — die Melodie. Eine improvisierte Phrase über dem Akkord
    // der aktuellen Stufe, auf einem 8-Schritt-Rhythmus-Raster (Achtel-Gefühl).
    // V8.90 — eine ECHTE Rhythmik: nicht jeder Schritt trägt eine Note (eine
    // Onset-Wahrscheinlichkeit lässt PAUSEN), die Noten haben verschiedene
    // LÄNGEN (1-4 Schritte — Halbe, Viertel, Achtel) und DYNAMIK (ein starker
    // Takt-Schritt klingt lauter), plus eine kleine Zeit-Humanisierung — die
    // Phrase ist nicht mehr stur. Tonhöhe: startet auf einem Akkord-Ton,
    // wandert meist schrittweise (Sprünge lösen sich), der letzte Ton löst
    // auf. Liefert [{freq, start, dur, idx, vel}] — seed-deterministisch.
    _lofiMelodyNotes(degree, durSec) {
        const emotions = (this.state.player && this.state.player.emotions) || {};
        const joy = Math.max(0, Math.min(1, emotions.joy || 0));
        const peace = Math.max(0, Math.min(1, emotions.peace || 0));
        const STEPS = 8;
        const stepDur = durSec / STEPS;
        // Genre führt die Melodie (studio.melody + dna.flow/tension, klang-Gesetzbuch): None schweigt,
        // Lazy karg, MicroPoly dicht, BlueNotes b-Töne, CallResponse echot die 2. Takthälfte leiser.
        // flow verschiebt die Noten-Dichte um den Anker 0.35; tension: +1 Halbton Reibung, nie am Schluss.
        const studio = this._klangStudioPreset();
        const mStil = studio && typeof studio.melody === "string" ? studio.melody : null;
        if (mStil === "None") return [];
        const dna = studio && studio.dna ? studio.dna : null;
        const flow = dna && Number.isFinite(dna.flow) ? dna.flow : 0.35;
        const tension = dna && Number.isFinite(dna.tension) ? dna.tension : 0;
        const stilOnset = mStil === "Lazy" ? -0.2 : mStil === "MicroPoly" ? 0.2 : mStil === "PlayChanges" ? 0.05 : 0;
        // Onset-Neigung: joy belebt (mehr Noten), peace beruhigt (mehr Pausen).
        const onsetBias = Math.max(
            0.2,
            Math.min(0.95, 0.6 + joy * 0.3 - peace * 0.35 + (flow - 0.35) * 0.35 + stilOnset)
        );
        const chordIdx = [degree, degree + 2, degree + 4, degree + 6];
        let idx = chordIdx[Math.floor(this._lofiRandom() * chordIdx.length)];
        let lastDelta = 0;
        const notes = [];
        let step = 0;
        while (step < STEPS) {
            // Metrisches Gewicht: Takt-Eins stark, Schlag mittel, Off-Beat schwach.
            const strong = step % 4 === 0 ? 1.0 : step % 2 === 0 ? 0.65 : 0.4;
            // Schritt 0 startet die Phrase immer; sonst entscheidet die
            // Onset-Wahrscheinlichkeit — ein Nein ist eine PAUSE.
            const onsetProb = step === 0 ? 1 : onsetBias * strong;
            if (this._lofiRandom() >= onsetProb) {
                step += 1;
                continue;
            }
            // Noten-LÄNGE in Schritten: kurz/mittel/lang; peace dehnt.
            const lr = this._lofiRandom();
            let len = lr < 0.5 ? 1 : lr < 0.82 ? 2 : 3;
            if (peace > 0.5 && this._lofiRandom() < peace) len += 1;
            len = Math.min(len, STEPS - step);
            // DYNAMIK: ein starker Schritt klingt lauter.
            // ZENSUS-REST V18.488 — CallResponse echot die Antwort-Hälfte leiser.
            const vel = (0.14 + 0.16 * strong) * (mStil === "CallResponse" && step >= 4 ? 0.7 : 1);
            // Kleine Zeit-Humanisierung (±6 % eines Schritts) — nicht stur.
            const jitter = (this._lofiRandom() - 0.5) * 0.12 * stepDur;
            // ZENSUS-REST V18.488 — die FARBE des Genres: BlueNotes senken den
            // Ton mit 30 % Chance um einen Halbton (die blaue Terz/Quinte),
            // tension reibt mit tension·20 % Chance einen Halbton nach oben.
            let semi = this._lofiScaleSemitone(idx);
            if (mStil === "BlueNotes" && this._lofiRandom() < 0.3) semi -= 1;
            else if (tension > 0 && this._lofiRandom() < tension * 0.2) semi += 1;
            notes.push({
                freq: AnazhRealm.LOFI_BASE_FREQ * Math.pow(2, (semi + 24) / 12),
                start: Math.max(0, step * stepDur + jitter),
                dur: len * stepDur * 0.92,
                idx,
                vel,
            });
            // Tonhöhen-Walk: meist Schritt, selten Sprung; Sprünge lösen sich.
            const r = this._lofiRandom();
            const stepSize = r < 0.62 ? 1 : r < 0.86 ? 2 : 3;
            let dir = this._lofiRandom() < 0.5 ? -1 : 1;
            if (Math.abs(lastDelta) >= 2) dir = lastDelta > 0 ? -1 : 1;
            const delta = stepSize * dir;
            idx += delta;
            if (idx < degree - 2) idx = degree - 2 + stepSize;
            if (idx > degree + 12) idx = degree + 12 - stepSize;
            lastDelta = delta;
            step += len;
        }
        // Der letzte Ton löst auf dem nächstgelegenen Akkord-Ton auf.
        const last = notes[notes.length - 1];
        const resolveIdx = chordIdx.reduce(
            (best, c) => (Math.abs(c - last.idx) < Math.abs(best - last.idx) ? c : best),
            chordIdx[0]
        );
        last.idx = resolveIdx;
        last.freq = AnazhRealm.LOFI_BASE_FREQ * Math.pow(2, (this._lofiScaleSemitone(resolveIdx) + 24) / 12);
        return notes;
    }

    // W4 V3 Phase 2 — die Melodie-Phrase spielen: je Note ein Sinus-Oszillator
    // (klare, weiche Lead-Stimme über dem Dreieck-Pad) mit Pluck-Hüllkurve.
    _lofiPlayMelody(degree, durSec) {
        const s = this.state.symphony;
        if (!s.enabled || !s.ctx || !s.lofi || !s.lofi.melodyGain) return;
        const ctx = s.ctx;
        const now = ctx.currentTime;
        // GENRE-STIMMEN (18.07.) — die LEAD-Stimme des Gesetzbuchs (inst.lead
        // wählt Wellenform/Pegel/Anschlag; tilt.lead mischt) — Flöte singt,
        // LeadSynth sticht, Rhodes perlt. Fail-soft byte-alt (sine, Faktor 1).
        const ST = this._lofiInstStimme("lead");
        for (const note of this._lofiMelodyNotes(degree, durSec)) {
            const osc = ctx.createOscillator();
            osc.type = ST.type;
            osc.frequency.value = note.freq;
            const env = ctx.createGain();
            const t0 = now + note.start;
            // V8.88 — eine SINGENDE Hüllkurve (Anschlag → Halt → Ausklang).
            // V8.90 — der Spitzen-Pegel folgt der Noten-Dynamik (note.vel):
            // ein starker Takt-Schritt klingt lauter, ein schwacher leiser.
            const vel = note.vel * ST.gain;
            env.gain.setValueAtTime(0, t0);
            env.gain.linearRampToValueAtTime(vel, t0 + 0.05 * ST.attackMul);
            env.gain.linearRampToValueAtTime(vel * 0.6, t0 + note.dur * 0.7);
            env.gain.linearRampToValueAtTime(0, t0 + note.dur);
            osc.connect(env);
            env.connect(s.lofi.melodyGain);
            osc.start(t0);
            osc.stop(t0 + note.dur + 0.05);
        }
    }

    // W4 V3 Phase 3 — die Zeit eines Raster-Schritts mit Swing. Gerade
    // Schritte liegen auf dem Schlag; ungerade (Off-Beats) werden verzögert
    // (swing 0.5 = gerade, ~0.6 = Lofi/Jazz-Atem).
    _grooveStepTime(step, stepDur, swing) {
        if (step % 2 === 0) return step * stepDur;
        return (step - 1) * stepDur + swing * 2 * stepDur;
    }

    // Swing liest fx.klang.dna.swing des gewählten Rezepts (das Genre führt). Ohne dna (fremdes
    // Rezept, must-ignore) → Kern-Wahrheit des Host-Genres (fail-closed). swing 0 ist GÜLTIG.
    _grooveSwing() {
        const studio = this._klangStudioPreset();
        const sw = studio && studio.dna ? studio.dna.swing : null;
        return Number.isFinite(sw) ? sw : this._klangGenreAusKern(AnazhRealm.KLANG_HOST_RECIPE).dna.swing;
    }

    // Synthetische Kick: Sinus mit Tonhöhen-Abfall 200 → 70 Hz + kurzer Noise-Klick als Transient.
    // Nie tiefer (etwa 140 → 48 Hz) — auf Laptop-Lautsprechern praktisch stumm.
    _lofiKick(t) {
        const s = this.state.symphony;
        if (!s.ctx || !s.lofi || !s.lofi.grooveGain || !s.lofi.noiseBuffer) return;
        const ctx = s.ctx;
        const TB = this._lofiDrumTimbre(); // ZENSUS-REST V18.488 — inst.drums färbt
        // Körper: Sinus mit schnellem Tonhöhen-Abfall.
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(70, t + 0.08);
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t);
        env.gain.exponentialRampToValueAtTime(0.85 * (TB.gainMul || 1), t + 0.006);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 0.24 * TB.kickDauer);
        osc.connect(env);
        env.connect(s.lofi.grooveGain);
        osc.start(t);
        osc.stop(t + 0.28 * TB.kickDauer);
        // Klick: ein sehr kurzer hoch-gefilterter Noise-Tick — der Transient,
        // der den Schlag auch ohne Tiefbass-Wiedergabe trägt.
        const click = ctx.createBufferSource();
        click.buffer = s.lofi.noiseBuffer;
        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 1600;
        const cenv = ctx.createGain();
        cenv.gain.setValueAtTime(0.0001, t);
        cenv.gain.exponentialRampToValueAtTime(0.5, t + 0.002);
        cenv.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
        click.connect(hp);
        hp.connect(cenv);
        cenv.connect(s.lofi.grooveGain);
        click.start(t);
        click.stop(t + 0.05);
    }

    // W4 V3 Phase 3 — eine synthetische Snare: ein White-Noise-Burst durch
    // einen Hochpass, kurze scharfe Hüllkurve.
    _lofiSnare(t) {
        const s = this.state.symphony;
        if (!s.ctx || !s.lofi || !s.lofi.grooveGain || !s.lofi.noiseBuffer) return;
        const ctx = s.ctx;
        const TB = this._lofiDrumTimbre(); // ZENSUS-REST V18.488 — inst.drums färbt
        const src = ctx.createBufferSource();
        src.buffer = s.lofi.noiseBuffer;
        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 1200 * TB.snareHp;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t);
        env.gain.exponentialRampToValueAtTime(0.5 * (TB.gainMul || 1), t + 0.005);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 0.18 * TB.snareDauer);
        src.connect(hp);
        hp.connect(env);
        env.connect(s.lofi.grooveGain);
        src.start(t);
        src.stop(t + 0.22 * TB.snareDauer);
    }

    // W4 V3 Phase 3 — ein synthetisches Hihat: ein sehr kurzer, hoch-
    // gefilterter White-Noise-Tick.
    _lofiHihat(t) {
        const s = this.state.symphony;
        if (!s.ctx || !s.lofi || !s.lofi.grooveGain || !s.lofi.noiseBuffer) return;
        const ctx = s.ctx;
        const TB = this._lofiDrumTimbre(); // ZENSUS-REST V18.488 — inst.drums färbt
        const src = ctx.createBufferSource();
        src.buffer = s.lofi.noiseBuffer;
        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        // W4 V4 Sub-Schritt 1 — eine glut-Region schärft das Hihat: der
        // Hochpass steigt 7000..9500 Hz (dünner, „tssss" — eine Spur
        // Spannung in der Klangfarbe, ohne eine einzige Note zu ändern).
        hp.frequency.value = (7000 + this._lofiWorldField().glut * 2500) * TB.hihatHp;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t);
        env.gain.exponentialRampToValueAtTime(0.22 * TB.hihatGain * (TB.gainMul || 1), t + 0.004);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
        src.connect(hp);
        hp.connect(env);
        env.connect(s.lofi.grooveGain);
        src.start(t);
        src.stop(t + 0.08);
    }

    // Das Genre wählt den Groove: RHYTHMUS_MUSTER (klang-Gesetzbuch) je LAWS.rhythm-Option, gewählt
    // über studio.rhythm. Genre ohne eigene Zeile (auch r=null, must-ignore) → Swing-Zeile.
    // Kalter Kern → Bruch, der schreit (kein Konstanten-Zwilling).
    _lofiGroovePattern() {
        const studio = this._klangStudioPreset();
        const r = studio && typeof studio.rhythm === "string" ? studio.rhythm : null;
        const M =
            (r ? AnazhRealm.Gesetz("klang:RHYTHMUS_MUSTER." + r, null) : null) ||
            AnazhRealm.Gesetz("klang:RHYTHMUS_MUSTER.Swing", null);
        if (M && Array.isArray(M.kick) && Array.isArray(M.snare) && Array.isArray(M.hihat)) return M;
        return AnazhRealm._kernPflichtBruch("klang:RHYTHMUS_MUSTER.Swing");
    }

    // Timbre-Faktoren je inst.drums-Wahl des Gesetzbuchs: LoFi/Acoustic Faktor 1, Electronic längere
    // Kick + schärfere Snare, Brush weiche Snare + leises Hihat, Perc helles Hihat. Tabelle vor if (M8).
    _lofiDrumTimbre() {
        const studio = this._klangStudioPreset();
        const d = studio && studio.inst && typeof studio.inst.drums === "string" ? studio.inst.drums : null;
        const T = {
            Electronic: { kickDauer: 1.35, snareHp: 1.35, snareDauer: 0.75, hihatHp: 1.15, hihatGain: 1 },
            Brush: { kickDauer: 0.9, snareHp: 0.8, snareDauer: 1.5, hihatHp: 0.9, hihatGain: 0.6 },
            Perc: { kickDauer: 0.85, snareHp: 1.2, snareDauer: 0.8, hihatHp: 1.35, hihatGain: 1.1 },
        };
        const tb = Object.assign(
            { kickDauer: 1, snareHp: 1, snareDauer: 1, hihatHp: 1, hihatGain: 1 },
            (d && T[d]) || null
        );
        // V18.491.129 TILT_VIS.host=role-db
        // GENRE-STIMMEN (18.07.) — tilt.drums (dB, die Genre-Mixer-Zeile des
        // Gesetzbuchs) reist als linearer Faktor auf alle Trommel-Pegel.
        const tDb = studio && studio.tilt && Number.isFinite(studio.tilt.drums) ? studio.tilt.drums : 0;
        tb.gainMul = Math.pow(10, tDb / 20);
        return tb;
    }

    // ═══ GENRE-STIMMEN — DIE INSTRUMENT-WAHL FÄRBT DIE MELODIE ═══
    // Der EINE Stimmen-Chokepoint: inst.{harmony,lead,bass} + tilt.<rolle> (klang-core) wählen
    // Wellenform + Pegel + Anschlag je Rolle (Tabelle vor if). Der Host bleibt Lofi-Ofen (Web-Audio-Osc):
    // die WAHL ist Gesetz, die Technik Leser-Sache. Kaltes Buch/unbekannter Name → historische Stimme
    // (triangle/sine/triangle, Faktor 1, Anschlag 1).
    _lofiInstStimme(rolle) {
        const studio = this._klangStudioPreset();
        // Die Komposita sind ECHTE Leser (der Konsum-Wächter rastert inst.*/
        // tilt.* nur über das Kompositum — die nackten Wörter kollidieren).
        const name =
            studio && studio.inst
                ? rolle === "harmony"
                    ? studio.inst.harmony
                    : rolle === "lead"
                      ? studio.inst.lead
                      : studio.inst.bass
                : null;
        const T = {
            GrandPiano: { type: "triangle", gain: 1, attackMul: 0.35 },
            Rhodes: { type: "sine", gain: 1.1, attackMul: 0.6 },
            Guitar: { type: "triangle", gain: 0.95, attackMul: 0.3 },
            DistGuitar: { type: "square", gain: 0.5, attackMul: 0.4 },
            Strings: { type: "sawtooth", gain: 0.5, attackMul: 1.6 },
            SynthPad: { type: "sawtooth", gain: 0.45, attackMul: 2.0 },
            LeadSynth: { type: "sawtooth", gain: 0.6, attackMul: 0.25 },
            SynthBrass: { type: "sawtooth", gain: 0.55, attackMul: 0.5 },
            Flute: { type: "sine", gain: 1.05, attackMul: 0.8 },
            Vibraphone: { type: "sine", gain: 1.05, attackMul: 0.25 },
            Marimba: { type: "sine", gain: 1, attackMul: 0.15 },
            Kalimba: { type: "sine", gain: 1, attackMul: 0.15 },
            Organ: { type: "square", gain: 0.5, attackMul: 0.9 },
            Clavinet: { type: "square", gain: 0.5, attackMul: 0.2 },
            DoubleBass: { type: "triangle", gain: 1, attackMul: 1 },
            PickBass: { type: "square", gain: 0.55, attackMul: 0.5 },
            SynthBass: { type: "sawtooth", gain: 0.6, attackMul: 0.6 },
            ReeseBass: { type: "sawtooth", gain: 0.6, attackMul: 1 },
            Sub808: { type: "sine", gain: 1.15, attackMul: 0.8 },
        };
        const alt = { harmony: "triangle", lead: "sine", bass: "triangle" };
        const v = (typeof name === "string" && T[name]) || { type: alt[rolle] || "sine", gain: 1, attackMul: 1 };
        // V18.491.129 TILT_VIS.host=role-db
        const tiltDb =
            studio && studio.tilt
                ? rolle === "harmony"
                    ? studio.tilt.harmony
                    : rolle === "lead"
                      ? studio.tilt.lead
                      : studio.tilt.bass
                : null;
        const gain = v.gain * (Number.isFinite(tiltDb) ? Math.pow(10, tiltDb / 20) : 1);
        return { type: v.type, gain, attackMul: v.attackMul, name: typeof name === "string" ? name : null };
    }

    // W4 V3 Phase 3 — den Groove einer Akkord-Dauer spielen: das Trommel-
    // Muster über das 8-Schritt-Raster, mit Swing. peace dünnt die Off-Beat-
    // Hihats aus (ruhiger), joy lässt sie voll (lebhafter).
    _lofiPlayGroove(durSec) {
        const s = this.state.symphony;
        if (!s.enabled || !s.ctx || !s.lofi || !s.lofi.grooveGain || !s.lofi.noiseBuffer) return;
        const STEPS = 8;
        const stepDur = durSec / STEPS;
        const now = s.ctx.currentTime;
        const pat = this._lofiGroovePattern(); // ZENSUS-REST V18.488 — das Genre wählt
        const emotions = (this.state.player && this.state.player.emotions) || {};
        const peace = Math.max(0, Math.min(1, emotions.peace || 0));
        const swing = this._grooveSwing(); // ZENSUS 17.07. — das Genre führt den Shuffle
        for (let step = 0; step < STEPS; step++) {
            const t = now + this._grooveStepTime(step, stepDur, swing);
            if (pat.kick.indexOf(step) >= 0) this._lofiKick(t);
            if (pat.snare.indexOf(step) >= 0) this._lofiSnare(t);
            // peace > 0.6 lässt die Off-Beat-Hihats aus — ein ruhigerer Groove.
            if (pat.hihat.indexOf(step) >= 0 && !(peace > 0.6 && step % 2 === 1)) this._lofiHihat(t);
        }
    }

    // Nächste Akkord-Stufe. Trägt das Studio-Rezept eine harmony-Wahl, wandert die Stufe über die
    // EINE Kern-Formel progressionDeg (RNG als Parameter — _lofiRandom bleibt der Welt-Seed-Strom);
    // sorrow > 0.6 färbt als inDev-Ausweichung (+4). Sonst Markov-Kette LOFI_HARMONY mit
    // Emotions-Bias: joy/hope → helle Stufen (III/VI), sorrow → dunkle (i/ii°/iv).
    _lofiNextDegree(degree) {
        const studio = this._klangStudioPreset();
        const kc = typeof globalThis !== "undefined" ? globalThis.__klangCore : null;
        if (studio && typeof studio.harmony === "string" && kc && typeof kc.progressionDeg === "function") {
            const lofi = this.state.symphony && this.state.symphony.lofi;
            let bar = lofi ? (lofi.bar = (Number.isFinite(lofi.bar) ? lofi.bar : 0) + 1) : 1;
            // Die Genre-FORM rahmt die Harmonie: am Abschnitts-Ende (FORM_TAKTE) springt der Takt-Zähler auf
            // den Abschnitts-Anfang → progressionDeg kehrt zur Tonika-Phase zurück. Free/kaltes Buch → nie.
            const FORM_TAKTE = { AAB: 3, AABA: 4, Vamp: 2, Build: 8, Sonata: 8 };
            const ft = typeof studio.form === "string" ? FORM_TAKTE[studio.form] : null;
            if (lofi && ft) {
                bar = ((bar - 1) % ft) + 1;
                lofi.formTakt = bar; // die Abschnitts-Uhr (Linse/HUD lesbar)
            }
            const emotions = (this.state.player && this.state.player.emotions) || {};
            const inDev = (Number(emotions.sorrow) || 0) > 0.6;
            try {
                const r = kc.progressionDeg(studio.harmony, bar, () => this._lofiRandom(), inDev);
                if (r && Number.isFinite(r.deg)) return ((r.deg % 7) + 7) % 7;
            } catch (_e) {}
        }
        const table = AnazhRealm.LOFI_HARMONY;
        const transitions = table[((degree % table.length) + table.length) % table.length] || table[0];
        const emotions = (this.state.player && this.state.player.emotions) || {};
        const bright = Math.max(0, Math.min(1, (emotions.joy || 0) * 0.5 + (emotions.hope || 0) * 0.5));
        const dark = Math.max(0, Math.min(1, emotions.sorrow || 0));
        // Zweiter, schwächerer Bias: das Welt-Affinitäts-Feld am Spieler (magieleitung/lebendig → hell,
        // glut → dunkel). Gewicht 0.4 = halb der Emotion-Bias (0.8) — die Emotion bleibt dominant.
        const field = this._lofiWorldField();
        const worldBright = Math.max(0, Math.min(1, field.magieleitung * 0.5 + field.lebendig * 0.5));
        const worldDark = field.glut;
        let total = 0;
        const weighted = transitions.map(([d, w]) => {
            let weight = w;
            if (AnazhRealm.LOFI_BRIGHT_DEGREES.indexOf(d) >= 0) weight *= 1 + bright * 0.8 + worldBright * 0.4;
            if (AnazhRealm.LOFI_DARK_DEGREES.indexOf(d) >= 0) weight *= 1 + dark * 0.8 + worldDark * 0.4;
            total += weight;
            return [d, weight];
        });
        let r = this._lofiRandom() * total;
        for (const [d, w] of weighted) {
            r -= w;
            if (r <= 0) return d;
        }
        return weighted[weighted.length - 1][0];
    }

    // Die Halbton-Abstände eines Akkords zu Frequenzen. majorLean (aus der
    // hope-Emotion) hebt die Terz (den 2. Ton) um einen Halbton: Moll → Dur,
    // der Akkord klingt heller.
    _lofiChordFreqs(offsets, majorLean) {
        const base = AnazhRealm.LOFI_BASE_FREQ;
        return offsets.map((semi, i) => {
            const lifted = majorLean && i === 1 ? semi + 1 : semi;
            return base * Math.pow(2, lifted / 12);
        });
    }

    // DIE EINE KLANG-QUELLE: Genre-Presets kommen als Daten durchs Buch (klang-core → __replyRecipes
    // → f.recipes, kind "klang"); Leser ist das bestehende Lofi-System (kein Parallel-Audio).
    // Das Host-Genre ist eine Daten-Zeile (KLANG_HOST_RECIPE). Kaltes Buch/Foundry aus →
    // GENRES-Tafel des Kerns (fail-closed via _klangGenreAusKern).
    _klangStudioPreset() {
        const f = this._foundry;
        // Die Welt-Klang-Wahl führt: state.klangPreset (in der Werkstatt gesetzt, persistiert) wählt das
        // Genre; ohne Wahl oder bei Nicht-klang-Rezept → das Host-Rezept.
        const chosen = this.state && typeof this.state.klangPreset === "string" ? this.state.klangPreset : null;
        if (f && f.recipes) {
            const cRec = chosen ? f.recipes[chosen] : null;
            const rec = cRec && cRec.kind === "klang" ? cRec : f.recipes[AnazhRealm.KLANG_HOST_RECIPE];
            const k = rec && rec.fx && rec.fx.klang;
            if (k && typeof k === "object") return k;
        }
        // Kaltes Buch (Worker aus/Boot-Fenster): die Wahl löst direkt gegen die GENRES-Tafel des
        // klang-Gesetzbuchs auf — dieselbe Quelle, aus der die Rezepte stammen (scaleFor(darkness) + SCALES).
        return (
            (chosen ? this._klangGenreAusKern(chosen) : null) || this._klangGenreAusKern(AnazhRealm.KLANG_HOST_RECIPE)
        );
    }

    // Genre-Leser des klang-Gesetzbuchs (kalte-Buch-Brücke von _klangStudioPreset): Rezept-Id →
    // GENRES-Zeile (lowercase, "-klang"-Suffix fällt), Skala über scaleFor(darkness) + SCALES.
    // Memo je Id (Tafel statisch); Kern kalt → _kernPflichtBruch; unbekannte Id → null (must-ignore).
    _klangGenreAusKern(id) {
        const memo = this._klangGenreMemo || (this._klangGenreMemo = new Map());
        if (memo.has(id)) return memo.get(id);
        // ZWILLINGS-ABSCHIED (19.07.): die Kern-Pflicht-Wand steht VOR jedem
        // try (ein eigener catch würde den Bruch ersticken) — der deklarierte
        // „Kern kalt → null → LOFI_*-Konstante"-Pfad ist gefallen.
        const G = AnazhRealm.Gesetz("klang:GENRES", null);
        const SC = AnazhRealm.Gesetz("klang:SCALES", null);
        const kc = typeof globalThis !== "undefined" ? globalThis.__klangCore : null;
        if (!G || !SC || !kc || typeof kc.scaleFor !== "function") return AnazhRealm._kernPflichtBruch("klang:GENRES");
        let out = null;
        const wunsch = String(id || "lofi")
            .toLowerCase()
            .replace(/-klang$/, "");
        let g = null;
        for (const name of Object.keys(G)) {
            if (name.toLowerCase() === wunsch) {
                g = G[name];
                break;
            }
        }
        if (g) {
            const scaleName = kc.scaleFor(g.darkness);
            const scale = Array.isArray(SC[scaleName]) ? SC[scaleName].slice() : null;
            out = {
                bpm: g.bpm,
                scaleName,
                scale,
                dna: {
                    swing: g.swing,
                    darkness: g.darkness,
                    color: g.color,
                    flow: g.flow,
                    tension: g.tension,
                    space: g.space,
                },
                form: g.form,
                harmony: g.harmony,
                rhythm: g.rhythm,
                bass: g.bass,
                melody: g.melody,
                inst: g.inst,
            };
        }
        if (out) memo.set(id, out); // Memo NUR im Erfolgs-Fall (unbekannter Wunsch memo-frei)
        return out;
    }
    // Genre-Echo-Anteile des Welt-Raum-Busses: RAUM.DELAY_SENDS des klang-Gesetzbuchs, aufgelöst über
    // die Rezept-Id (lowercase wie _klangGenreAusKern); Genre ohne Zeile → def-Zeile.
    // null = kalter Kern → die Sends bleiben auf ihrem Start (voll).
    _klangRaumSends() {
        const table = AnazhRealm.Gesetz("klang:RAUM.DELAY_SENDS", null);
        if (!table || typeof table !== "object") return null;
        const chosen =
            this.state && typeof this.state.klangPreset === "string"
                ? this.state.klangPreset
                : AnazhRealm.KLANG_HOST_RECIPE;
        const wunsch = String(chosen || "lofi")
            .toLowerCase()
            .replace(/-klang$/, "");
        for (const name of Object.keys(table)) {
            if (name.toLowerCase() === wunsch) return table[name];
        }
        return table.def || null;
    }
    // Akkord-Dauer in ms. Das Tempo führt das bpm des Studio-Klang-Rezepts; ohne bpm-Feld die
    // Kern-Wahrheit des Host-Genres (fail-closed). sorrow verlangsamt um bis zu 50 %.
    _lofiChordDurationMs() {
        const studio = this._klangStudioPreset();
        const bpm =
            studio && Number.isFinite(studio.bpm) && studio.bpm > 0
                ? studio.bpm
                : this._klangGenreAusKern(AnazhRealm.KLANG_HOST_RECIPE).bpm;
        const beatMs = 60000 / bpm;
        const base = beatMs * AnazhRealm.LOFI_CHORD_BEATS;
        const emotions = (this.state.player && this.state.player.emotions) || {};
        const sorrow = Math.max(0, Math.min(1, emotions.sorrow || 0));
        return base * (1 + sorrow * 0.5);
    }

    // Bass: folgt der Akkord-Wurzel eine Oktave unter dem Pad, auf den Kick-Schritten.
    // Dreieck statt Sinus — die Obertöne tragen ihn auch auf kleinen Lautsprechern.
    _lofiPlayBass(degree, durSec) {
        const s = this.state.symphony;
        if (!s.enabled || !s.ctx || !s.lofi || !s.lofi.bassGain) return;
        const ctx = s.ctx;
        const now = ctx.currentTime;
        const stepDur = durSec / 8;
        const chord = this._lofiChordFromDegree(degree);
        const rootOffset = chord[0];
        // Sub eine Oktave unter dem Pad (55-104 Hz) + Oktav-Stimme darüber (110-208 Hz): ~70 Hz ist die
        // Wiedergabe-Untergrenze kleiner Lautsprecher, ohne Oktav-Stimme wäre der Bass dort stumm.
        const subFreqOf = (semi) => AnazhRealm.LOFI_BASE_FREQ * Math.pow(2, (semi - 12) / 12);
        const swing = this._grooveSwing(); // ZENSUS 17.07. — derselbe Genre-Shuffle wie der Groove
        // GENRE-STIMMEN (18.07.) — die BASS-Stimme des Gesetzbuchs (inst.bass:
        // Sub808 rund, PickBass knurrt, DoubleBass byte-alt; tilt.bass mischt).
        const ST = this._lofiInstStimme("bass");
        const spiele = (t, semi, dur, subOnly) => {
            const subFreq = subFreqOf(semi);
            const voices = subOnly
                ? [{ freq: subFreq, attackPeak: 0.55, sustainPeak: 0.4 }]
                : [
                      { freq: subFreq, attackPeak: 0.5, sustainPeak: 0.32 },
                      { freq: subFreq * 2, attackPeak: 0.46, sustainPeak: 0.3 },
                  ];
            for (const voice of voices) {
                const osc = ctx.createOscillator();
                osc.type = ST.type;
                osc.frequency.value = voice.freq;
                const env = ctx.createGain();
                env.gain.setValueAtTime(0, t);
                env.gain.linearRampToValueAtTime(voice.attackPeak * ST.gain, t + 0.03);
                env.gain.linearRampToValueAtTime(voice.sustainPeak * ST.gain, t + dur * 0.6);
                env.gain.linearRampToValueAtTime(0, t + dur);
                osc.connect(env);
                env.connect(s.lofi.bassGain);
                osc.start(t);
                osc.stop(t + dur + 0.05);
            }
        };
        // Das Genre führt den Bass (studio.bass = LAWS.bass-Option; Tabelle vor if): Walking 1-3-5-7,
        // RootFive Grundton/Quinte, Achtel jeden Schritt, FunkRiff synkopiert, Riddim betont die Drei,
        // Sub808 nur Sub, Drone hält den Grundton, None schweigt. Ohne Rezept: Grundton auf den
        // Kick-Schritten. Der Grundton kommt IMMER aus _lofiChordFromDegree (EINE Skalen-Quelle).
        const studio = this._klangStudioPreset();
        const stil = studio && typeof studio.bass === "string" ? studio.bass : null;
        if (stil === "None") return;
        if (stil === "Drone") {
            spiele(now, rootOffset, durSec, false);
            return;
        }
        const kick = this._lofiGroovePattern().kick;
        let plan;
        if (stil === "Walking") {
            plan = [
                { step: 0, semi: chord[0] },
                { step: 2, semi: chord[1] },
                { step: 4, semi: chord[2] },
                { step: 6, semi: chord[3] },
            ];
        } else if (stil === "RootFive") {
            plan = kick.map((step, i) => ({ step, semi: i % 2 === 0 ? chord[0] : chord[2] }));
        } else if (stil === "Achtel") {
            plan = [0, 1, 2, 3, 4, 5, 6, 7].map((step) => ({ step, semi: chord[0], kurz: true }));
        } else if (stil === "FunkRiff") {
            plan = [
                { step: 0, semi: chord[0] },
                { step: 3, semi: chord[0], kurz: true },
                { step: 5, semi: chord[2], kurz: true },
                { step: 7, semi: chord[0] + 12, kurz: true },
            ];
        } else if (stil === "Riddim") {
            plan = [{ step: 4, semi: chord[0], lang: true }];
        } else if (stil === "Sub808") {
            plan = kick.map((step) => ({ step, semi: chord[0], lang: true, subOnly: true }));
        } else {
            plan = kick.map((step) => ({ step, semi: chord[0] })); // Root/byte-alt
        }
        for (const n of plan) {
            const t = now + this._grooveStepTime(n.step, stepDur, swing);
            const dur = stepDur * (n.lang ? 2.2 : n.kurz ? 0.9 : 1.4);
            spiele(t, n.semi, dur, !!n.subOnly);
        }
    }

    // Einen Akkord spielen: je Ton ein Dreieck-Oszillator (weich, pad-artig)
    // durch eine eigene Hüllkurve (langsamer Anschlag + Ausklang) in die
    // Lofi-Schicht. Die Oszillatoren stoppen selbst nach dem Akkord.
    _lofiPlayChord(offsets) {
        const s = this.state.symphony;
        if (!s.enabled || !s.ctx || !s.lofi) return;
        const ctx = s.ctx;
        const now = ctx.currentTime;
        const durSec = this._lofiChordDurationMs() / 1000;
        const emotions = (this.state.player && this.state.player.emotions) || {};
        const majorLean = (emotions.hope || 0) > 0.6;
        const freqs = this._lofiChordFreqs(offsets, majorLean);
        // Stimmen-Zahl wächst mit der Stimmung: joy + awe > 0.8 oder eine resonante Struktur in der Nähe
        // (computeSpatialTags.resoniert) → jeder Akkord-Ton bekommt eine leise Oktav-Dopplung.
        const bright = (emotions.joy || 0) + (emotions.awe || 0);
        const nearResonant = this._lofiNearResonantArchitecture();
        const voiceMults = bright > 0.8 || nearResonant ? [1, 2] : [1];
        // W4 V4 Sub-Schritt 1 — eine magieleitung-Region trägt einen leisen,
        // leicht verstimmten Oktav-Schimmer (das Welt-Feld färbt das Timbre).
        const shimmer = this._lofiWorldField().magieleitung > 0.6;
        // GENRE-STIMMEN (18.07.) — die HARMONIE-Stimme des Gesetzbuchs
        // (inst.harmony: GrandPiano perkussiv, SynthPad schwebt mit langem
        // Anschlag, Rhodes weich; tilt.harmony mischt). Byte-alt: triangle/1/1.
        const ST = this._lofiInstStimme("harmony");
        const attack = 0.8 * ST.attackMul;
        const release = 1.4;
        const sustainAt = now + Math.max(attack, durSec - release);
        for (const freq of freqs) {
            for (const mult of voiceMults) {
                const peak = (mult === 1 ? 0.25 : 0.1) * ST.gain; // die Oktav-Dopplung leiser
                const osc = ctx.createOscillator();
                osc.type = ST.type;
                osc.frequency.value = freq * mult;
                const env = ctx.createGain();
                env.gain.setValueAtTime(0, now);
                env.gain.linearRampToValueAtTime(peak, now + attack);
                env.gain.setValueAtTime(peak, sustainAt);
                env.gain.linearRampToValueAtTime(0, now + durSec);
                osc.connect(env);
                env.connect(s.lofi.filter);
                osc.start(now);
                osc.stop(now + durSec + 0.1);
            }
            if (shimmer) {
                const osc = ctx.createOscillator();
                osc.type = ST.type;
                osc.frequency.value = freq * 2 * 1.006; // Oktave, leicht verstimmt
                const env = ctx.createGain();
                env.gain.setValueAtTime(0, now);
                env.gain.linearRampToValueAtTime(0.045 * ST.gain, now + attack);
                env.gain.setValueAtTime(0.045 * ST.gain, sustainAt);
                env.gain.linearRampToValueAtTime(0, now + durSec);
                osc.connect(env);
                env.connect(s.lofi.filter);
                osc.start(now);
                osc.stop(now + durSec + 0.1);
            }
        }
    }

    // Lofi-Scheduler (aus symphonyTick): nach Ablauf der Akkord-Dauer den Akkord der aktuellen
    // Stufe spielen, dann die nächste Stufe über _lofiNextDegree wählen.
    _lofiTick() {
        const s = this.state.symphony;
        if (!s.enabled || !s.ctx || !s.lofi) return;
        const now = s.ctx.currentTime;
        const durSec = this._lofiChordDurationMs() / 1000;
        if (now - s.lofi.lastChordAt < durSec) return;
        const degree = s.lofi.degree;
        this._lofiPlayChord(this._lofiChordFromDegree(degree));
        this._lofiPlayMelody(degree, durSec);
        this._lofiPlayGroove(durSec);
        this._lofiPlayBass(degree, durSec);
        s.lofi.lastChordAt = now;
        s.lofi.degree = this._lofiNextDegree(degree);
        // Raum des Genres: dna.space führt den Wet-Pegel des Delay-Busses (Return = space ·
        // RAUM.hall.returnProSpace); ohne Studio-Rezept bleibt der Bus stumm. Das Echo synct aufs
        // Genre-Tempo (RAUM.echo: punktierte Achtel, geklemmt); je Kanal führt DELAY_SENDS den Send.
        if (s.lofi.raumWet) {
            const st = this._klangStudioPreset();
            const space = st && st.dna && Number.isFinite(st.dna.space) ? st.dna.space : 0;
            // Kein Literal-Fallback: kalter/alter Kern ohne RAUM ist ein Bruch, der schreit
            // (_kernPflichtBruch, das _fahrGesetz-Muster).
            const RH = AnazhRealm.Gesetz("klang:RAUM.hall", null);
            const proSpace =
                RH && Number.isFinite(RH.returnProSpace)
                    ? RH.returnProSpace
                    : AnazhRealm._kernPflichtBruch("klang:RAUM.hall.returnProSpace");
            s.lofi.raumWet.gain.value = Math.max(0, Math.min(0.5, space * proSpace));
            const RE = AnazhRealm.Gesetz("klang:RAUM.echo", null);
            if (!RE || !Number.isFinite(RE.beatFrac) || !Number.isFinite(RE.minSec) || !Number.isFinite(RE.maxSec))
                AnazhRealm._kernPflichtBruch("klang:RAUM.echo");
            if (s.lofi.raumDelay) {
                const bpm =
                    st && Number.isFinite(st.bpm) && st.bpm > 0
                        ? st.bpm
                        : this._klangGenreAusKern(AnazhRealm.KLANG_HOST_RECIPE).bpm;
                const beatSec = 60 / bpm;
                s.lofi.raumDelay.delayTime.value = Math.max(RE.minSec, Math.min(RE.maxSec, beatSec * RE.beatFrac));
            }
            const ds = this._klangRaumSends();
            if (ds && s.lofi.raumSendPad) {
                s.lofi.raumSendPad.gain.value = Number.isFinite(ds.harmony) ? ds.harmony : 0;
                s.lofi.raumSendMelody.gain.value = Number.isFinite(ds.lead) ? ds.lead : 0;
                s.lofi.raumSendGroove.gain.value = Number.isFinite(ds.drums) ? ds.drums : 0;
            }
        }
        // W4 V4 — die Musik hört die Welt: das Welt-Affinitäts-Feld am
        // Spieler färbt die Klangfarbe der nächsten Akkord-Dauer.
        this._lofiApplyWorldTimbre(durSec);
    }

    // Welt-Affinitäts-Feld (worldFieldAt) am Spieler: lebendig/dichte/glut/magieleitung färben das
    // Timbre, nicht die Noten. Ohne playerMesh/worldFieldAt → neutrales Feld (0.5).
    _lofiWorldField() {
        const neutral = { lebendig: 0.5, dichte: 0.5, glut: 0.5, magieleitung: 0.5 };
        const pm = this.state.playerMesh;
        if (!pm || !pm.position || typeof this.auraAt !== "function") return neutral;
        const f = this.auraAt(pm.position.x, pm.position.z); // §5 (V17.25): via auraAt (living Lese-API)
        if (!f) return neutral;
        const c = (v) => Math.max(0, Math.min(1, v || 0));
        return {
            lebendig: c(f.lebendig),
            dichte: c(f.dichte),
            glut: c(f.glut),
            magieleitung: c(f.magieleitung),
        };
    }

    // Welt-Feld moduliert die Klangfarbe: lebendig öffnet den Pad-Tiefpass, dichte hebt den
    // Bass-Anteil. Sanfte Rampe über die Akkord-Dauer.
    _lofiApplyWorldTimbre(durSec) {
        const s = this.state.symphony;
        if (!s || !s.enabled || !s.ctx || !s.lofi) return;
        const field = this._lofiWorldField();
        const now = s.ctx.currentTime;
        const ramp = Math.max(0.5, Math.min(8, durSec || 4));
        // lebendig 0..1 → Pad-Tiefpass 750..1050 Hz (karg .. üppig-warm).
        if (s.lofi.filter && s.lofi.filter.frequency) {
            const cutoff = 750 + field.lebendig * 300;
            try {
                s.lofi.filter.frequency.cancelScheduledValues(now);
                s.lofi.filter.frequency.setValueAtTime(s.lofi.filter.frequency.value, now);
                s.lofi.filter.frequency.linearRampToValueAtTime(cutoff, now + ramp);
            } catch (e) {
                void e;
            }
        }
        // dichte 0..1 → Bass-Gain 0.40..0.56 (leicht .. schwer).
        if (s.lofi.bassGain && s.lofi.bassGain.gain) {
            const bg = 0.4 + field.dichte * 0.16;
            try {
                s.lofi.bassGain.gain.cancelScheduledValues(now);
                s.lofi.bassGain.gain.setValueAtTime(s.lofi.bassGain.gain.value, now);
                s.lofi.bassGain.gain.linearRampToValueAtTime(bg, now + ramp);
            } catch (e) {
                void e;
            }
        }
    }

    // Steht der Spieler nahe einer Struktur mit computeSpatialTags.resoniert ≥ resonance_strong?
    // Dann verdichtet sich der Pad (das Bauwerk „singt mit").
    _lofiNearResonantArchitecture() {
        const pm = this.state.playerMesh;
        const archs = this.state.architectures;
        if (!pm || !pm.position || !Array.isArray(archs) || !archs.length) return false;
        if (typeof this.computeSpatialTags !== "function") return false;
        const T = AnazhRealm.WORLD_EFFECT_THRESHOLDS;
        const strong = (T && T.resonance_strong) || 1.5;
        const RADIUS2 = 24 * 24;
        // die Plätze um den Spieler (`_blockerUmPlatz`, in der Ordnung des Bestands) — vorher jeder Eintrag je Akkord
        const nahe = this._lofiNahe || (this._lofiNahe = []);
        nahe.length = 0;
        this._blockerUmPlatz(pm.position.x, pm.position.z, 24 + 1e-6, nahe);
        for (const e of nahe) {
            if (!e || !e.position) continue;
            const dx = e.position.x - pm.position.x;
            const dz = e.position.z - pm.position.z;
            if (dx * dx + dz * dz > RADIUS2) continue;
            const bp = this.state.blueprints && this.state.blueprints[e.type];
            if (!bp) continue;
            const tags = this.computeSpatialTags(bp);
            if (tags && (tags.resoniert || 0) >= strong) return true;
        }
        return false;
    }

    // ### Status-Panel (UI V1) ###
    // DOM einmal anlegen, Werte alle 0.4 s aktualisieren; Refs gecacht (kein Lookup im Tick).
    // Alle Chat-Befehle gruppiert — Quelle des Hilfe-Drawers; die DSL-Patterns liefern den ersten Block.
    get chatCommandHelp() {
        if (this._chatCommandHelpCache) return this._chatCommandHelpCache;
        const dslExamples = this.chatDslPatterns.map((p) => p.example);
        this._chatCommandHelpCache = [
            { title: "Welt-Effekte (DSL)", commands: dslExamples },
            {
                title: "Welt-Triggers",
                commands: ["Spawne neue Welt", "Boden nicht sichtbar"],
            },
            {
                title: "Fähigkeiten",
                commands: [
                    "Lerne Fähigkeit farbwechsel Ändere Farbe von Kreaturen zu blau",
                    "Führe Fähigkeit aus farbwechsel",
                ],
            },
            {
                title: "Multisensorik",
                commands: ["Aktiviere Anazh-Symphonie"],
            },
            {
                title: "Spieler-Seele",
                commands: ["Werde Mensch", "Werde Wolf", "Werde Hirsch"],
            },
            {
                title: "Bauwerke (Ring 6)",
                commands: [
                    "Baue Dorf hier",
                    "Baue Tempel hier",
                    "Baue Wasserfall hier",
                    "Baue Fraktal Tempel",
                    "Baue Fraktal Dorf",
                    "Baue Fraktal Wasserfall",
                ],
            },
            {
                title: "System / Persistenz",
                commands: [
                    "Speichere Zustand",
                    "Lade Zustand",
                    "Lade Datei",
                    "Aktiviere Version 7.67",
                    "Aktiviere Debug-Logs",
                    "Deaktiviere Debug-Logs",
                ],
            },
            {
                title: "Self-Heal",
                commands: ["Behebe Physik-Tunneling", "Optimiere Physik"],
            },
        ];
        return this._chatCommandHelpCache;
    }

    // Die EINE `data-cmd → processChatCommand`-Klick-Delegation für alle Befehls-Container.
    // `closeDrawers`: der help-list-Pfad schließt nach dem Befehl die Drawer.
    _wireCmdDelegation(elementId, closeDrawers) {
        const el = document.getElementById(elementId);
        if (!el) return;
        el.addEventListener("click", (event) => {
            const target = event.target;
            if (!(target instanceof HTMLElement)) return;
            const cmd = target.getAttribute("data-cmd");
            if (!cmd) return;
            this.processChatCommand(cmd);
            if (closeDrawers) this.closeAllDrawers();
        });
    }

    // DER EINE EMOTIONS-RENDERER (6-Achsen-Reihen name·bar·value) für Ich UND Hof-Karte:
    // {live:true} liefert refs für den updateStatusPanel-Tick (Werte starten leer), sonst statisch aus
    // dem Wesen-Vektor. Labels + Wirkung aus EMOTION_LABEL/EMOTION_WIRKT. Gibt {rows, refs}.
    _buildEmotionRows(emotions, opts = {}) {
        const rows = [];
        const refs = {};
        for (const axis of Object.keys(emotions || {})) {
            const row = document.createElement("div");
            row.className = `emotion ${axis}`;
            // Legende: deutscher Name + was die Emotion in der Welt bewirkt (Hover) —
            // löst das "welche Farbe = welche Emotion"-Rätsel. Die Balkenfarbe (CSS
            // .emotion.<axis>) zeigt die Farbe direkt neben dem Namen.
            row.title = `${AnazhRealm.EMOTION_LABEL[axis] || axis} — ${AnazhRealm.EMOTION_WIRKT[axis] || ""}`;
            const name = document.createElement("span");
            name.className = "name";
            name.textContent = AnazhRealm.EMOTION_LABEL[axis] || axis;
            const bar = document.createElement("span");
            bar.className = "bar";
            const fill = document.createElement("div");
            bar.appendChild(fill);
            const value = document.createElement("span");
            value.className = "value";
            const v = Math.max(0, Math.min(1, Number(emotions[axis]) || 0));
            fill.style.width = opts.live ? "0%" : `${Math.round(v * 100)}%`;
            value.textContent = opts.live ? "0.00" : v.toFixed(2);
            row.appendChild(name);
            row.appendChild(bar);
            row.appendChild(value);
            rows.push(row);
            refs[axis] = { fill, value };
        }
        return { rows, refs };
    }

    initStatusPanel() {
        // UI V2: kein zentrales #status-panel mehr — Sektionen leben in den
        // sechs Drawer (Welt, Kreaturen, Spieler, Fähigkeiten, Einstellungen,
        // Hilfe). Wir greifen direkt auf die einzelnen IDs zu.
        const emotions = document.getElementById("status-emotions");
        if (!emotions) return;
        emotions.innerHTML = "";
        // W-B — der EINE Renderer baut die Reihen; das Ich tickt sie live.
        const built = this._buildEmotionRows(this.state.player.emotions, { live: true });
        for (const row of built.rows) emotions.appendChild(row);
        const emotionRefs = built.refs;
        this._statusRefs = {
            weather: document.getElementById("status-weather"),
            slug: document.getElementById("status-slug"),
            position: document.getElementById("status-position"),
            fps: document.getElementById("status-fps"),
            creatures: document.getElementById("status-creatures"),
            soul: document.getElementById("status-soul"),
            architectures: document.getElementById("status-architectures"),
            // Welle 6.G3 — Status-Bar zeigt die aktuelle Tageszeit
            time: document.getElementById("status-time"),
            emotions: emotionRefs,
            abilities: document.getElementById("status-abilities"),
            abilitiesSignature: "",
            // V17.37 D-2 — die Gesetze-Sektion (Welt-Regeln) in der Fähigkeiten-UI
            worldrules: document.getElementById("status-worldrules"),
            worldrulesSignature: "",
            lastTick: -Infinity,
        };
        // FP-sichtbares Emotion-Feedback (UI-Putz): die Ref für das WORT — W-C(g)/R-009:
        // das Wort lebt IN der Statusbar (#status-emotion). Der Bildschirmrand-Ring fiel
        // (V18.364, Schöpfer „doppelt + wirkt nicht real — die Emotion steht schon als Wort").
        this._emotionLabel = document.getElementById("status-emotion");

        // GEMERKTER FADEN #8 (V18.149) — die Statusbar auf ESSENZ: die
        // Werkstatt-Zahlen (status-dev) ruhen hinter dem ···-Toggle; die
        // Wahl überlebt den Reload (anazh.ui.statusDev, global wie jede
        // UI-Präferenz — nie im Welt-Snapshot). Alle Schreiber schreiben
        // weiter (display:none liest niemandem die textContent weg — P17,
        // die bestehenden Status-Invarianten bleiben wahr).
        const statusbar = document.getElementById("statusbar");
        const devToggle = document.getElementById("status-dev-toggle");
        if (statusbar && devToggle) {
            let devOn = false;
            try {
                devOn = localStorage.getItem("anazh.ui.statusDev") === "1";
            } catch {
                /* Privacy-Modus — Default bleibt Essenz */
            }
            statusbar.classList.toggle("dev-hidden", !devOn);
            // Das Logbuch ist Entwickler-Sicht: die Sektion ruht hinter DEMSELBEN Dev-Schalter wie die
            // Werkstatt-Zahlen (kein zweiter Toggle); sie bleibt im DOM, ihr logbook-toggle wirkt weiter.
            const logbookSection = document.getElementById("logbook-section");
            if (logbookSection) logbookSection.style.display = devOn ? "" : "none";
            devToggle.addEventListener("click", () => {
                const hidden = statusbar.classList.toggle("dev-hidden");
                if (logbookSection) logbookSection.style.display = hidden ? "none" : "";
                try {
                    localStorage.setItem("anazh.ui.statusDev", hidden ? "0" : "1");
                } catch {
                    /* Quota — die Wahl gilt für diese Session */
                }
            });
        }

        // Abilities-Container: Event-Delegation — ▶ ausführen · ✕ eine Geste vergessen · „leeren" (V18.53).
        const abilitiesContainer = this._statusRefs.abilities;
        if (abilitiesContainer) {
            abilitiesContainer.addEventListener("click", (event) => {
                const target = event.target;
                if (!(target instanceof HTMLElement)) return;
                const run = target.getAttribute("data-run-ability");
                if (run && this.state.abilities[run]) {
                    this.state.abilities[run]();
                    return;
                }
                // V18.53 — eine störende Geste direkt vergessen (Schöpfer-Befund „kann ihn nicht stoppen").
                const forget = target.getAttribute("data-forget-ability");
                if (forget) {
                    const list = this.state.dsl.abilities;
                    const i = list.findIndex((a) => a.name === forget);
                    if (i >= 0) list.splice(i, 1);
                    delete this.state.abilities[forget];
                    this._statusRefs.abilitiesSignature = "";
                    this.renderAbilitiesList();
                    return;
                }
                // „leeren": alle EPHEMEREN Nexus-Gesten auf einmal verwerfen (Mensch-gelehrte bleiben).
                if (target.getAttribute("data-clear-abilities") != null) {
                    this.state.dsl.abilities = this.state.dsl.abilities.filter((a) => {
                        const keep = !(a.source === "nexus" || (a.source || "").startsWith("ability"));
                        if (!keep) delete this.state.abilities[a.name];
                        return keep;
                    });
                    this._statusRefs.abilitiesSignature = "";
                    this.renderAbilitiesList();
                    return;
                }
                // den Auf-/Zuklappen-Toggle (▸ alle N) der Gesten-Liste.
                if (target.getAttribute("data-toggle-abilities") != null) {
                    this.state.hofGestenExpanded = !this.state.hofGestenExpanded;
                    this._statusRefs.abilitiesSignature = "";
                    this.renderAbilitiesList();
                }
            });
        }
        // Gesetze-Steuerung (Event-Delegation): ✕ vergessen/verwerfen, ⏸/▶ pausieren/aktivieren,
        // ★/📌 Favorit/behalten (adoptiert eine ephemere Nexus-Regel → permanent). Eigene/adoptierte Regeln
        // immer löschbar; eine FREMDE (Nexus-)Regel verwerfen ist eine Schöpfer-Geste.
        const worldrulesContainer = this._statusRefs.worldrules;
        if (worldrulesContainer) {
            worldrulesContainer.addEventListener("click", (event) => {
                const target = event.target;
                if (!(target instanceof HTMLElement)) return;
                const rules = this.state.worldRules || [];
                const findRule = (attr) => {
                    const idStr = target.getAttribute(attr);
                    return idStr == null ? null : rules.find((x) => x.id === Number(idStr)) || null;
                };
                let changed = false;
                const forget = findRule("data-forget-rule");
                if (forget) {
                    // V18.53 — JEDE Regel direkt verwerfen, auch ein ephemeres Nexus-Experiment in JEDEM Modus
                    // (die Partitur gehört dem Schöpfer; ⏸ ist die sanfte Option, ✕ das Recht zu verwerfen).
                    this.state.worldRules = rules.filter((x) => x.id !== forget.id);
                    changed = true;
                } else {
                    const toggle = findRule("data-toggle-rule");
                    if (toggle) {
                        toggle.disabled = !toggle.disabled;
                        changed = true;
                    } else {
                        const pin = findRule("data-pin-rule");
                        if (pin) {
                            pin.pinned = !pin.pinned;
                            // Adoptieren: eine ephemere Regel wird beim Anpinnen permanent.
                            if (pin.pinned && pin.ttlSec != null) pin.ttlSec = null;
                            changed = true;
                        }
                    }
                }
                if (changed) {
                    this._statusRefs.worldrulesSignature = ""; // sofortiges Feedback (kein Warten auf den Tick)
                    this.renderWorldRulesList();
                }
            });
        }

        // Export-Button: lokaler Download des aktuellen Zustands ohne Chat-
        // Umweg, damit man den Status-Snapshot direkt teilen kann.
        const exportBtn = document.getElementById("action-export-state");
        if (exportBtn) {
            exportBtn.addEventListener("click", () => {
                this.triggerStateDownload(this.buildStateSnapshot());
            });
        }

        // Tuning-Slider: drei state.player-Werte live manipulierbar (Defaults aus dem State).
        // Diagnose-Werkzeug zum Ausprobieren, nicht für Persistenz.
        const wireTuningSlider = (id, valueId, apply) => {
            const slider = document.getElementById(id);
            const valueLabel = document.getElementById(valueId);
            if (!slider || !valueLabel) return;
            slider.addEventListener("input", () => {
                const v = parseFloat(slider.value);
                if (!Number.isFinite(v)) return;
                apply(v);
                valueLabel.textContent = slider.step.includes(".")
                    ? v.toFixed(slider.step.split(".")[1].length)
                    : String(v);
            });
        };
        const p = this.state.player;
        const thresholdSlider = document.getElementById("tune-threshold");
        if (thresholdSlider) thresholdSlider.value = String(p.emotionThreshold);
        const decaySlider = document.getElementById("tune-decay");
        if (decaySlider) decaySlider.value = String(p.emotionDecayPerSec);
        const cooldownSlider = document.getElementById("tune-cooldown");
        if (cooldownSlider) cooldownSlider.value = String(p.emotionApplyCooldown);
        const thresholdValue = document.getElementById("tune-threshold-v");
        if (thresholdValue) thresholdValue.textContent = p.emotionThreshold.toFixed(2);
        const decayValue = document.getElementById("tune-decay-v");
        if (decayValue) decayValue.textContent = p.emotionDecayPerSec.toFixed(3);
        const cooldownValue = document.getElementById("tune-cooldown-v");
        if (cooldownValue) cooldownValue.textContent = String(p.emotionApplyCooldown);

        wireTuningSlider("tune-threshold", "tune-threshold-v", (v) => {
            p.emotionThreshold = v;
        });
        wireTuningSlider("tune-decay", "tune-decay-v", (v) => {
            p.emotionDecayPerSec = v;
        });
        wireTuningSlider("tune-cooldown", "tune-cooldown-v", (v) => {
            p.emotionApplyCooldown = v;
        });

        // Quick-Action-, Kreatur- und Bauwerk-Buttons teilen den
        // data-cmd → processChatCommand-Delegate (V9.44-e: eine Quelle). (V18.35: quick-actions
        // entfiel — die Welt-Aktionen waren Duplikate der durchsuchbaren Befehle.)
        this._wireCmdDelegation("creature-actions");
        this._wireCmdDelegation("architecture-actions");

        // DIE EINE Selbst-Suche treibt das ganze Ich: tippen → das Rezeptbuch filtert UND die Habe dimmt
        // Nicht-Treffer; Treffer bleiben klickbar. _applyIchFilter ist die EINE Quelle, nach jedem Render
        // re-applied. Die Befehlsliste trägt die Omnibox (`c:`).
        const ichSearch = document.getElementById("ich-search");
        if (ichSearch) {
            ichSearch.addEventListener("input", () => this._applyIchFilter());
        }
        // V18.36/37 — die Werkstatt-Baupläne als Such-Dropdown (Spielersicht: ~5% wählen,
        // ~90% im Viewer): der Such-Balken ist dünn, die Liste klappt nur bei Fokus/Tippen auf.
        const workshopSearch = document.getElementById("workshop-search");
        if (workshopSearch) {
            const picker = workshopSearch.closest(".workshop-picker");
            const open = () => picker && picker.classList.add("open");
            workshopSearch.addEventListener("focus", open);
            workshopSearch.addEventListener("input", () => {
                open();
                this._applyWorkshopFilter();
            });
            workshopSearch.addEventListener("keydown", (e) => {
                if (e.key === "Escape") {
                    this._workshopClosePicker();
                    workshopSearch.blur();
                }
            });
            document.addEventListener("mousedown", (e) => {
                if (picker && !picker.contains(e.target)) picker.classList.remove("open");
            });
        }
    }

    // V18.37 — schliesst das Bauplan-Dropdown + leert die Suche (nach der Wahl).
    _workshopClosePicker() {
        if (typeof document === "undefined") return;
        const picker = document.querySelector(".workshop-picker");
        if (picker) picker.classList.remove("open");
        const search = document.getElementById("workshop-search");
        if (search && search.value) {
            search.value = "";
            this._applyWorkshopFilter();
        }
    }

    // Konsole-Panel: einklappbar via #console-collapse. Im eingeklappten
    // Zustand bleiben Header + Input sichtbar; Chat-Output + Log verschwinden.
    // localStorage merkt sich die Wahl (anazhRealmConsole = "collapsed"/"open").
    initConsoleDOM() {
        const panel = document.getElementById("console");
        const toggle = document.getElementById("console-collapse");
        if (!panel || !toggle) return;
        const setCollapsed = (collapsed) => {
            panel.classList.toggle("collapsed", collapsed);
            toggle.setAttribute("aria-pressed", collapsed ? "true" : "false");
            toggle.textContent = collapsed ? "+" : "−";
            toggle.setAttribute("aria-label", collapsed ? "Konsole entfalten" : "Konsole einklappen");
        };
        const stored = (() => {
            try {
                return localStorage.getItem("anazhRealmConsole");
            } catch {
                return null;
            }
        })();
        // V18.82 — default EINGEKLAPPT (der freie Bildschirm, BotW/Minecraft): die Konsole ist
        // ein schlankes Chat-Widget, bis der Spieler die Historie aufruft. Nur wenn er sie
        // explizit „open" gemerkt hat, bleibt sie offen.
        setCollapsed(stored !== "open");
        toggle.addEventListener("click", () => {
            const next = !panel.classList.contains("collapsed");
            setCollapsed(next);
            try {
                localStorage.setItem("anazhRealmConsole", next ? "collapsed" : "open");
            } catch {
                /* Persistenz best-effort. */
            }
        });
        this._installChatFeed();
    }

    // Fading-Feed: ein MutationObserver auf #chat-output spiegelt JEDE neue Zeile (aller
    // Append-Quellen) in #chat-feed, wo sie kurz erscheint und verblasst; die volle Historie bleibt
    // einen Klick entfernt.
    _installChatFeed() {
        if (typeof document === "undefined" || typeof window === "undefined" || !window.MutationObserver) return;
        if (this._chatFeedWired) return;
        const out = document.getElementById("chat-output");
        const feed = document.getElementById("chat-feed");
        if (!out || !feed) return;
        this._chatFeedWired = true;
        const FADE_MS = 8200;
        const obs = new window.MutationObserver((muts) => {
            for (const m of muts) {
                for (const node of m.addedNodes) {
                    if (!node || node.nodeType !== 1) continue;
                    const clone = node.cloneNode(true);
                    clone.classList.add("chat-feed-line");
                    feed.appendChild(clone);
                    const t1 = setTimeout(() => clone.classList.add("chat-feed-out"), FADE_MS - 700);
                    const t2 = setTimeout(() => clone.remove(), FADE_MS);
                    clone._feedTimers = [t1, t2];
                    // nur die letzten ~5 zeigen (der Feed ist ein flüchtiger Blick, keine Historie).
                    while (feed.children.length > 5) {
                        const old = feed.firstChild;
                        if (old._feedTimers) old._feedTimers.forEach(clearTimeout);
                        old.remove();
                    }
                }
            }
        });
        obs.observe(out, { childList: true });
    }
}
