class AnazhRealm_werkstatt_hud {
    // ===== ATLAS · Werkstatt/hud — Drawer · Omnibox · Statusleiste · Regler-Räume · Konsole =====
    // ### Ring 1 – Grok-Stimme ###
    grokInitDOM() {
        const grok = this.state.grok;
        grok.dialogueBox = document.getElementById("dialogue-box");
        try {
            const saved = localStorage.getItem("anazhRealmGrok");
            if (saved) grok.seenFirstSpawn = !!JSON.parse(saved).seenFirstSpawn;
        } catch {
            // Defektes Grok-State ignorieren; defaults gelten.
        }
        const toggle = document.getElementById("grok-voice-toggle");
        const speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;
        if (toggle && speechSupported) {
            toggle.hidden = false;
            toggle.addEventListener("click", () => {
                grok.speechEnabled = !grok.speechEnabled;
                toggle.setAttribute("aria-pressed", grok.speechEnabled ? "true" : "false");
                toggle.textContent = grok.speechEnabled ? "Stimme: an" : "Stimme: aus";
            });
        }
    }

    grokSpeak(key) {
        const grok = this.state.grok;
        const now = performance.now() / 1000;
        if (now - grok.lastSpoke < grok.minGapSeconds) return false;
        const cfg = grok.triggers[key];
        if (cfg && now - cfg.lastFired < cfg.cooldown) return false;
        const pool = grok.pool[key];
        if (!pool || pool.length === 0) return false;
        const idx = grok.poolIndex[key] % pool.length;
        const text = pool[idx];
        // V9.95-e (Schöpfer-Browser-Audit-Folge): Defensive — wenn `text`
        // undefined ist (pool hat sparse-Array-Holes oder corrupted state),
        // den Sprech-Slot überspringen statt „Grok: undefined" zu loggen.
        if (typeof text !== "string" || text.length === 0) return false;
        grok.poolIndex[key] = (idx + 1) % pool.length;
        grok.lastSpoke = now;
        if (cfg) cfg.lastFired = now;
        this.grokRender(text);
        // Welle 6.X.4 F1 V8.13 — Begleiter-Name durchziehen statt hardcoded.
        this.log(`${grok.companionName || "Grok"}: ${text}`, "INFO");
        return true;
    }

    grokRender(text) {
        const grok = this.state.grok;
        // Ein leerer/fehlender Satz blankt den Dialog NIE: grokRender ist der EINE Sprech-Engpass, und
        // der Fade entfernt nur die visible-Klasse, nie den Text — ein geblankter Dialog bliebe leer.
        if (typeof text !== "string" || text === "") return;
        const box = grok.dialogueBox || document.getElementById("dialogue-box");
        if (box) {
            box.textContent = text;
            box.classList.add("visible");
            if (grok.fadeTimeout) clearTimeout(grok.fadeTimeout);
            grok.fadeTimeout = setTimeout(() => box.classList.remove("visible"), 8000);
        }
        if (grok.speechEnabled && typeof window !== "undefined" && "speechSynthesis" in window) {
            try {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = "de-DE";
                utterance.rate = 1.0;
                utterance.pitch = 1.0;
                // Welle 6.X.4 D2 V8.15 — Stimme-Volume aus state.symphony.voiceVolume.
                // Default 1.0, Schieber in Einstellungen mutiert live.
                const voiceVol =
                    typeof this.state.symphony.voiceVolume === "number" ? this.state.symphony.voiceVolume : 1.0;
                utterance.volume = Math.max(0, Math.min(1, voiceVol));
                // W11 Phase 4 — die gewählte Begleiter-Stimme, falls vorhanden
                // (getVoices() lädt async; fehlt sie noch, greift der Default).
                const wantVoice = grok.companionVoice || "";
                if (wantVoice) {
                    const match = window.speechSynthesis.getVoices().find((v) => v.name === wantVoice);
                    if (match) utterance.voice = match;
                }
                window.speechSynthesis.speak(utterance);
            } catch {
                // Speech-API kann auf manchen Plattformen werfen; stumm fallback.
            }
        }
        // W11 Phase 4 (Voice-Sync) — wenn der Begleiter spricht, den Text an
        // alle Mitspieler senden; sie spielen ihn via SpeechSynthesis ab.
        // grokRender ist der EINE Sprech-Engpass (Trigger/Journal/LLM/dsl).
        if (this.state.p2p && this.state.p2p.enabled) this._p2pBroadcastCompanionSay(text);
    }

    grokMarkFirstSpawn() {
        const grok = this.state.grok;
        if (grok.seenFirstSpawn) return;
        grok.seenFirstSpawn = true;
        try {
            localStorage.setItem("anazhRealmGrok", JSON.stringify({ seenFirstSpawn: true }));
        } catch {
            // localStorage voll/blockiert – Grok wird beim nächsten Reload nochmal grüßen, kein Drama.
        }
        // Erst-Spawn-Satz mit eigenem Mini-Delay, damit der Spieler die Welt sieht bevor Grok spricht.
        setTimeout(() => this.grokSpeak("firstSpawn"), 1500);
    }

    grokTick(currentTime) {
        // Der proaktive Begleiter-Chatter wartet auf die Bühne (sonst plappert Grok, während der Boden
        // streamt). Der Erst-Spawn-Gruß (grokMarkFirstSpawn) bleibt unberührt; danach re-armen die Timer
        // sauber. Headless steht die Bühne sofort.
        if (!this._buehneSteht()) return;
        // die Stimme des Felds: eine wartende Tat der Welt spricht, sobald ihre Pause um ist (`_feldStimmeTakt`, affekt K4)
        this._feldStimmeTakt();
        const grok = this.state.grok;
        const T = this.state.verbTafel;
        const moving = T.vor !== 0 || T.quer !== 0 || T.sprung;
        if (moving) {
            grok.idleSince = null;
        } else if (grok.idleSince === null) {
            grok.idleSince = currentTime;
        } else if (currentTime - grok.idleSince > 45) {
            this.grokSpeak("idle");
            grok.idleSince = currentTime; // einmal pro Idle-Phase, dann re-armen
        }

        // Sprung-Burst: steigende Flanke von isJumping erkennen, letzte 8 s zählen.
        if (this.state.isJumping && !grok.prevIsJumping) {
            grok.recentJumps.push(currentTime);
        }
        grok.prevIsJumping = this.state.isJumping;
        const cutoff = currentTime - 8;
        while (grok.recentJumps.length > 0 && grok.recentJumps[0] < cutoff) grok.recentJumps.shift();
        if (grok.recentJumps.length >= 4) {
            if (this.grokSpeak("jumpBurst")) grok.recentJumps.length = 0;
        }

        // Regen-Dauer beobachten (D5a: die wet-Frage — rainy UND stormy nässen).
        if (this._weatherIsWet() && !this._weatherIsWet(grok.prevWeather)) {
            grok.rainStartedAt = currentTime;
        } else if (!this._weatherIsWet()) {
            grok.rainStartedAt = null;
        }
        grok.prevWeather = this.state.weather;
        if (grok.rainStartedAt !== null && currentTime - grok.rainStartedAt > 60) {
            if (this.grokSpeak("rainLong")) grok.rainStartedAt = currentTime; // re-arm bis cooldown durch ist
        }

        // journalEvent: ist das Journal seit dem letzten Tick gewachsen, kommentiert Grok den jüngsten
        // Eintrag — grokSpeakFromJournal versucht zuerst das LLM, sonst/bei Fehler den Pool-Satz.
        const journalSize = (this.state.worldJournal && this.state.worldJournal.entries.length) || 0;
        if (grok.lastJournalSize === 0) {
            grok.lastJournalSize = journalSize;
        } else if (journalSize > grok.lastJournalSize) {
            const newest = this.state.worldJournal.entries[journalSize - 1];
            // Genesis-Eintrag selbst nicht extra kommentieren (firstSpawn
            // ist schon der Genesis-Anker).
            if (newest && newest.type !== "genesis") {
                this.grokSpeakFromJournal(newest);
            }
            grok.lastJournalSize = journalSize;
        }

        // Welle 3 E — emotionShift. Wenn eine Achse seit dem letzten Snapshot
        // um ≥ 0.4 gestiegen ist, kommentiert Grok kurz. Snapshot wird alle
        // ~10 s aktualisiert, damit langsame Drift den Trigger nicht zündet.
        const e = this.state.player && this.state.player.emotions;
        if (e) {
            if (!grok.emotionsSnapshot) grok.emotionsSnapshot = { ...e, takenAt: currentTime };
            if (currentTime - grok.emotionsSnapshot.takenAt >= 10) {
                for (const axis of Object.keys(e)) {
                    const prev = grok.emotionsSnapshot[axis] || 0;
                    const now = e[axis] || 0;
                    if (now - prev >= 0.4) {
                        this.grokSpeak("emotionShift");
                        break;
                    }
                }
                grok.emotionsSnapshot = { ...e, takenAt: currentTime };
            }
        }
        // W4 (V17.48) — die KI KOMMENTIERT nicht nur (emotionShift oben), sie TENDET: bei
        // anhaltend trüber Stimmung eine tröstende Geste (Ko-Regulation, Pfeiler 1/Symbiose).
        this._aiTendPlayer();
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
            this._gemuetGesetze();
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

    // Tab-System: ein Tab je Drawer. activeTab-Klasse auf dem Knopf,
    // hidden-Attribut entscheidet welcher Drawer sichtbar slidet.
    // Welle 6.X.4 V8.15 Punkt 15 — öffentliche toggleDrawer-Methode für
    // Keyboard-Shortcuts (M/K/P/B/I). Wenn der Drawer schon offen ist,
    // wird er geschlossen; sonst geöffnet (single-active-pattern).
    toggleDrawer(name) {
        if (typeof document === "undefined") return;
        const drawer = document.querySelector(`.drawer[data-drawer="${name}"]`);
        if (!drawer) return;
        const isOpen = !drawer.hidden;
        if (isOpen) {
            this.closeAllDrawers();
            return;
        }
        // Drawer öffnen — sync Tabs + Drawer-Status
        const tabs = Array.from(document.querySelectorAll("#topbar .tab"));
        const drawers = Array.from(document.querySelectorAll(".drawer[data-drawer]"));
        for (const tab of tabs) {
            const isActive = tab.getAttribute("data-tab") === name;
            tab.classList.toggle("active", isActive);
            tab.setAttribute("aria-selected", isActive ? "true" : "false");
        }
        for (const d of drawers) {
            d.hidden = d.getAttribute("data-drawer") !== name;
        }
        this.state.uiActiveDrawer = name;
        this._uiZeigerFrei(); // die Schublade gehört der Maus (Welle L, V-D2)
        // toggleDrawer ruft den Werkstatt-Lifecycle-Hook (Lazy-Init der 3D-Preview + RAF-Start) —
        // sonst bleiben Drawer-Shortcuts/API-Calls ohne Preview (state.workshop.preview === null).
        if (typeof this._workshopHandleDrawerChange === "function") {
            this._workshopHandleDrawerChange(name);
        }
        if (typeof this._hofHandleDrawerChange === "function") {
            this._hofHandleDrawerChange(name);
        }
        if (typeof this._feedHandleDrawerChange === "function") {
            this._feedHandleDrawerChange(name);
        }
    }

    // closeAllDrawers schließt alle (für Help-Klick + ESC).
    initTopbar() {
        const tabs = Array.from(document.querySelectorAll("#topbar .tab"));
        const drawers = Array.from(document.querySelectorAll(".drawer[data-drawer]"));
        if (tabs.length === 0 || drawers.length === 0) return;

        const openDrawer = (name) => {
            for (const tab of tabs) {
                const isActive = tab.getAttribute("data-tab") === name;
                tab.classList.toggle("active", isActive);
                tab.setAttribute("aria-selected", isActive ? "true" : "false");
            }
            // UI-Putz: der "Ich"-Tab (data-tab="spieler") öffnet das zentrierte Inventar-
            // Overlay (das vereinte Habe + Charakter + Rezeptbuch, wie Minecraft), keinen
            // Seiten-Drawer. Jeder andere Tab schließt das Overlay wieder.
            if (name === "spieler") {
                for (const drawer of drawers) drawer.hidden = true;
                if (typeof this.toggleInventoryOverlay === "function") this.toggleInventoryOverlay(true);
                return;
            }
            if (typeof this.toggleInventoryOverlay === "function" && this.state && this.state.inventoryOpen) {
                this.toggleInventoryOverlay(false);
            }
            for (const drawer of drawers) {
                const isThis = drawer.getAttribute("data-drawer") === name;
                drawer.hidden = !isThis;
            }
            this._uiZeigerFrei(); // die Schublade gehört der Maus (Welle L, V-D2)
            // UI-Putz: die Bibliothek beim Öffnen sofort füllen — die migrierten Welt-
            // Sektionen (Stammbaum/Tagebuch/Andere Welten) + die Welten-Liste.
            if (name === "bibliothek") {
                if (typeof this.updateWorldInfo === "function") this.updateWorldInfo();
                if (typeof this.renderLibraryUI === "function") this.renderLibraryUI();
            }
        };
        for (const tab of tabs) {
            tab.addEventListener("click", () => {
                const name = tab.getAttribute("data-tab");
                if (name) openDrawer(name);
            });
        }
        // Close-Buttons schließen den eigenen Drawer und entaktivieren den Tab.
        for (const closeBtn of document.querySelectorAll("[data-drawer-close]")) {
            closeBtn.addEventListener("click", () => this.closeAllDrawers());
        }
        // ESC schließt offene Drawers → zurück zum Default-Blick: die Welt.
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") this.closeAllDrawers();
        });
        // UI-Putz: kein "Welt"-Tab mehr — der Default-Blick IST die 3D-Welt (kein Drawer
        // offen, kein Tab aktiv = der WOW-Start). state.uiActiveDrawer trackt den aktuellen
        // Tab (null = die Welt), damit Tests + spätere Save-Persistenz darauf greifen können.
        this.state.uiActiveDrawer = null;
        // Tab-Klicks loggen indirekt über uiActiveDrawer. Jeder Tab-Klick informiert die Werkstatt:
        // Preview-Renderer an (Werkstatt offen) oder pausiert (anderer Tab).
        for (const tab of tabs) {
            tab.addEventListener("click", () => {
                const name = tab.getAttribute("data-tab");
                if (name) this.state.uiActiveDrawer = name;
                if (typeof this._workshopHandleDrawerChange === "function") {
                    this._workshopHandleDrawerChange(name);
                }
                if (typeof this._hofHandleDrawerChange === "function") {
                    this._hofHandleDrawerChange(name);
                }
                if (typeof this._feedHandleDrawerChange === "function") {
                    this._feedHandleDrawerChange(name);
                }
            });
        }
        // P12 (UI-Putz §1.5) — der geteilte Overlay-Hebel verdrahtet (einmal, delegiert).
        this._installHelpPopovers();
        // V18.45 — die Omnibox (Ctrl/Cmd+K): der EINE beschwörbare Ort für jede Absicht.
        this._installOmnibox();
    }

    // Overlay-Integrität für ALLE „?"-Popovers: der `.drawer` trägt `transform` + `overflow:hidden`
    // → Containing-Block für position:fixed UND Clip. Darum das Popover bei Hover/Fokus nach
    // `document.body` PORTALIEREN (fixed am Viewport, opak, z-index:9999). Delegiert über document
    // (trifft auch später gerenderte „?"-Punkte). Idempotent.
    _installHelpPopovers() {
        if (typeof document === "undefined" || this._helpPopWired) return;
        this._helpPopWired = true;
        const popFor = (dot) => {
            // Nach dem Portal ist das Popover kein Kind mehr → die Referenz am Dot halten.
            if (dot._helpPop && dot._helpPop.isConnected) return dot._helpPop;
            const pop = dot.querySelector(":scope > .help-pop") || dot._helpPop;
            if (pop) dot._helpPop = pop;
            return pop || null;
        };
        const show = (dot) => {
            const pop = popFor(dot);
            if (!pop) return;
            if (pop.parentElement !== document.body) document.body.appendChild(pop);
            pop.classList.add("help-pop-open");
            // Messen (getBoundingClientRect erzwingt Reflow → echte Maße trotz frisch display:block).
            const r = dot.getBoundingClientRect();
            const pr = pop.getBoundingClientRect();
            const M = 8;
            // dot-right öffnet rechtsbündig zum Punkt, sonst linksbündig — dann am Rand klemmen.
            let left = dot.classList.contains("dot-right") ? r.right - pr.width : r.left;
            left = Math.max(M, Math.min(left, window.innerWidth - pr.width - M));
            // unter dem Punkt; kein Platz → darüber kippen.
            let top = r.bottom + 6;
            if (top + pr.height > window.innerHeight - M) top = Math.max(M, r.top - pr.height - 6);
            pop.style.left = `${Math.round(left)}px`;
            pop.style.top = `${Math.round(top)}px`;
        };
        const hide = (dot) => {
            const pop = dot._helpPop;
            if (pop) pop.classList.remove("help-pop-open");
        };
        document.addEventListener("pointerover", (e) => {
            const t = e.target;
            const dot = t && t.closest && t.closest(".help-dot");
            if (dot) show(dot);
        });
        document.addEventListener("pointerout", (e) => {
            const t = e.target;
            const dot = t && t.closest && t.closest(".help-dot");
            // Beim Verlassen des Punktes (das Popover lebt in body → kein relatedTarget im Punkt).
            if (dot && !(e.relatedTarget && dot.contains(e.relatedTarget))) hide(dot);
        });
        document.addEventListener("focusin", (e) => {
            const t = e.target;
            const dot = t && t.closest && t.closest(".help-dot");
            if (dot) show(dot);
        });
        document.addEventListener("focusout", (e) => {
            const t = e.target;
            const dot = t && t.closest && t.closest(".help-dot");
            if (dot) hide(dot);
        });
    }

    // DIE OMNIBOX (Ctrl/Cmd+K): EIN Ort für jede Absicht. Ruft NUR bestehende Pfade
    // (processChatCommand · selectBlueprintForEdit · Tab-Klick) + liest bestehende Vektoren
    // (chatCommandHelp · state.blueprints · _displayRole). Tags c/b/w/s/t/a/g/p/geh/welt/k,
    // Freitext → Nexus. Idempotent.
    _installOmnibox() {
        if (typeof document === "undefined" || this._omniboxWired) return;
        const overlay = document.getElementById("omnibox-overlay");
        const input = document.getElementById("omnibox-input");
        const list = document.getElementById("omnibox-results");
        if (!overlay || !input || !list) return;
        this._omniboxWired = true;
        this._omniboxState = { results: [], sel: 0 };
        const open = () => {
            overlay.hidden = false;
            input.value = "";
            this._omniboxUpdate("");
            input.focus();
        };
        const close = () => {
            overlay.hidden = true;
        };
        this._omniboxOpen = open;
        this._omniboxClose = close;
        // Globaler Hotkey Ctrl/Cmd+K (toggle). Esc schließt.
        window.addEventListener("keydown", (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
                e.preventDefault();
                overlay.hidden ? open() : close();
            } else if (!overlay.hidden && e.key === "Escape") {
                e.preventDefault();
                close();
            }
        });
        // Klick auf den Hintergrund schließt.
        overlay.addEventListener("mousedown", (e) => {
            if (e.target === overlay) close();
        });
        // V18.47 — der sichtbare Maus-Trigger in der Topbar (Ctrl+K war nur Tastatur). Die GLOBALE Omnibox
        // (Befehle/Räume/Baupläne) bleibt hier; das ICH hat seit V18.65 seine EIGENE Selbst-Suche (#ich-search,
        // treibt Habe + Rezeptbuch) statt eines toten Knopfes auf die globale Omnibox (der war die Nullnummer).
        const trigger = document.getElementById("omnibox-trigger");
        if (trigger) trigger.addEventListener("click", () => (overlay.hidden ? open() : close()));
        input.addEventListener("input", () => this._omniboxUpdate(input.value));
        // Tastatur im Feld: ↑↓ wählen, ⏎ ausführen. stopPropagation schirmt die Spiel-Steuerung ab
        // (sonst liefen WASD beim Tippen). preventDefault nur für die Navigations-Tasten.
        input.addEventListener("keydown", (e) => {
            e.stopPropagation();
            const st = this._omniboxState;
            if (e.key === "ArrowDown") {
                e.preventDefault();
                st.sel = Math.min(st.sel + 1, st.results.length - 1);
                this._omniboxHighlight();
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                st.sel = Math.max(st.sel - 1, 0);
                this._omniboxHighlight();
            } else if (e.key === "Enter") {
                e.preventDefault();
                const r = st.results[st.sel];
                if (r) this._omniboxExecute(r);
            }
        });
    }

    _omniboxUpdate(query) {
        if (typeof document === "undefined") return;
        const list = document.getElementById("omnibox-results");
        if (!list) return;
        const results = this._omniboxSearch(query);
        this._omniboxState.results = results;
        this._omniboxState.sel = 0;
        list.innerHTML = "";
        if (!results.length) {
            list.appendChild(
                this._el("div", {
                    class: "omnibox-empty",
                    text: "Kein Treffer — tippe weiter oder sprich frei zum Nexus.",
                })
            );
            return;
        }
        results.forEach((r, i) => {
            list.appendChild(
                this._el(
                    "div",
                    {
                        class: "omnibox-item" + (i === 0 ? " sel" : ""),
                        role: "option",
                        onClick: () => this._omniboxExecute(r),
                    },
                    this._el("span", { class: "omnibox-kind", text: r.kindLabel }),
                    this._el("span", { class: "omnibox-label", text: r.label }),
                    r.sub ? this._el("span", { class: "omnibox-sub", text: r.sub }) : null
                )
            );
        });
    }

    _omniboxHighlight() {
        if (typeof document === "undefined") return;
        const list = document.getElementById("omnibox-results");
        if (!list) return;
        const items = list.querySelectorAll(".omnibox-item");
        items.forEach((el, i) => el.classList.toggle("sel", i === this._omniboxState.sel));
        const sel = items[this._omniboxState.sel];
        if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: "nearest" });
    }

    _omniboxExecute(r) {
        if (!r) return;
        try {
            if (typeof r.run === "function") r.run();
        } catch (e) {
            this.log(`Omnibox-Fehler: ${e && e.message}`, "ERROR");
        }
        if (this._omniboxClose) this._omniboxClose();
    }

    // Der EINE Such-KERN aller Such-Flächen (keine Privat-Filter daneben): Mehrwort-UND — jedes
    // Query-Wort muss im Heuhaufen vorkommen („eisen klinge" findet die Eisen-Klinge).
    _matchQuery(hay, query) {
        const q = (query || "").trim().toLowerCase();
        if (!q) return true;
        const h = (hay || "").toLowerCase();
        for (const word of q.split(/\s+/)) {
            if (word && !h.includes(word)) return false;
        }
        return true;
    }

    // Der EINE Blueprint-Heuhaufen: Name + Label + Rolle (ID UND deutsches Label — „bauwerk" trifft
    // architecture) + Materialien + die 2 stärksten Tag-Achsen. Jede Bauplan-Such-Fläche liest IHN.
    _blueprintSearchText(bp) {
        if (!bp) return "";
        const parts = Array.isArray(bp.parts) ? bp.parts : [];
        const role = this._displayRole(bp);
        const roleLabel = AnazhRealm.ROLE_LABELS[role] || AnazhRealm.BLUEPRINT_ROLE_LABELS[role] || "";
        const mats = [...new Set(parts.map((p) => p && p.material).filter(Boolean))];
        const tags = this.computeCompoundTags(bp) || {};
        const topTags = Object.entries(tags)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([k]) => (AnazhRealm.AXIS_LABELS && AnazhRealm.AXIS_LABELS[k]) || k);
        return [bp.label || "", bp.name || "", role, roleLabel, mats.join(" "), topTags.join(" ")]
            .join(" ")
            .toLowerCase();
    }

    // Das Herz: parse die Tag-Grammatik, lese die BESTEHENDEN Vektoren, ranke. Liefert
    // [{kindLabel, label, sub, run}]. Reine Lese-Funktion (headless verifizierbar).
    _omniboxSearch(query) {
        const q = (query || "").trim();
        const m = q.match(/^([a-zäöü]+):\s*(.*)$/i);
        const prefix = m ? m[1].toLowerCase() : null;
        const term = (m ? m[2] : q).trim().toLowerCase();
        const out = [];
        const LIMIT = 14;
        const ROLE_PREFIX = {
            w: ["weapon"],
            s: ["armor"],
            t: ["consumable"],
            a: ["soul"],
            g: ["tool", "held", "brecher", "weapon"],
            p: ["portal"],
        };
        const addCommands = (t) => {
            for (const g of this.chatCommandHelp || []) {
                for (const cmd of g.commands || []) {
                    if (out.length >= LIMIT) return;
                    if (!t || cmd.toLowerCase().includes(t))
                        out.push({
                            kindLabel: "Befehl",
                            label: cmd,
                            sub: g.title,
                            run: () => this.processChatCommand(cmd),
                        });
                }
            }
        };
        const addBlueprints = (t, roles) => {
            for (const bp of Object.values(this.state.blueprints || {})) {
                if (out.length >= LIMIT) return;
                if (!bp || !Array.isArray(bp.parts)) continue;
                // KATALOG-SICHT (18.07., M1): die EINE Sicht-Regel — donorOnly
                // UND Render-Varianten (grown_*, *_var1+) treten nie auf.
                if (!this._katalogSichtbar(bp.name, bp)) continue;
                const role = this._displayRole(bp);
                if (roles && !roles.includes(role)) continue;
                // M4 (V18.158) — der EINE Heuhaufen + Kern: Name/Rolle(label)/Material/Tags.
                if (this._matchQuery(this._blueprintSearchText(bp), t)) {
                    const rl = AnazhRealm.ROLE_LABELS[role] || AnazhRealm.BLUEPRINT_ROLE_LABELS[role] || role;
                    out.push({
                        kindLabel: rl,
                        label: bp.label || bp.name,
                        sub: "Bauplan",
                        run: () => {
                            const tab = document.querySelector('[data-tab="werkstatt"]');
                            if (tab) tab.click();
                            if (typeof this.selectBlueprintForEdit === "function") this.selectBlueprintForEdit(bp.name);
                        },
                    });
                }
            }
        };
        // V18.76 — `welt:` surfaced die einzelnen WELTEN (wie `b:` die Baupläne) — die Konsistenz-Lücke
        // vs. den 3 Räumen (bibliothek-plan §D.4): jede Welt liest ihren `_worldProfile`-Such-Index;
        // ein Treffer öffnet die Bibliothek + treibt die Selbst-Suche auf den Namen (der J5-Loop).
        const addWorlds = (t) => {
            for (const w of this._libraryWorlds()) {
                if (out.length >= LIMIT) return;
                const p = this._worldProfile(w);
                if (!this._matchQuery(p.searchText, t)) continue; // M4 — der EINE Kern
                out.push({
                    kindLabel: p.trust === "sandboxed" ? "Sandbox-Welt" : "Welt",
                    label: p.label,
                    sub: p.hasDsl ? p.dsl.slice(0, 3).join(" ") : "Welt",
                    run: () => {
                        const tab = document.querySelector('[data-tab="bibliothek"]');
                        if (tab) tab.click();
                        const search = document.getElementById("library-search");
                        if (search) {
                            search.value = p.label;
                            if (typeof this._applyLibraryFilter === "function") this._applyLibraryFilter();
                        }
                    },
                });
            }
        };
        const ROOMS = [
            ["werkstatt", "werkstatt", "Werkstatt"],
            ["hof", "kreaturen", "Hof"],
            ["kreaturen", "kreaturen", "Hof"],
            ["ich", "spieler", "Ich"],
            ["spieler", "spieler", "Ich"],
            ["bibliothek", "bibliothek", "Bibliothek"],
            ["einstellungen", "einstellungen", "Einstellungen"],
        ];
        const addRooms = (t) => {
            const seen = new Set();
            for (const [key, tabName, label] of ROOMS) {
                if (t && !key.includes(t) && !label.toLowerCase().includes(t)) continue;
                if (seen.has(tabName)) continue;
                seen.add(tabName);
                out.push({
                    kindLabel: "Raum",
                    label,
                    sub: "öffnen",
                    run: () => {
                        const el = document.querySelector(`[data-tab="${tabName}"]`);
                        if (el) el.click();
                    },
                });
            }
        };
        const addCreatureTasks = (t) => {
            const TASKS = [
                ["folge", "alle folgt mir"],
                ["komm", "alle folgt mir"],
                ["warte", "alle warten"],
                ["erkunde", "alle erkundet"],
            ];
            for (const [word, cmd] of TASKS) {
                if (out.length >= LIMIT) return;
                if (!t || word.includes(t))
                    out.push({
                        kindLabel: "Kreatur",
                        label: `Alle Wesen: ${word}`,
                        sub: "Auftrag",
                        run: () => this.processChatCommand(cmd),
                    });
            }
        };
        const nexusFallback = () => {
            if (q)
                out.push({
                    kindLabel: "Nexus",
                    label: `Sprich: „${q}"`,
                    sub: "zum Nexus",
                    run: () => this.processChatCommand(q),
                });
        };

        if (prefix === "c") addCommands(term);
        else if (prefix === "b") addBlueprints(term, null);
        else if (ROLE_PREFIX[prefix]) addBlueprints(term, ROLE_PREFIX[prefix]);
        else if (prefix === "geh") addRooms(term);
        else if (prefix === "k") addCreatureTasks(term);
        else if (prefix === "welt") addWorlds(term);
        else {
            // Freitext: über die Domänen ranken (Befehl → Bauplan → Welt → Raum), dann der Nexus-Pfad.
            addCommands(term);
            addBlueprints(term, null);
            addWorlds(term);
            addRooms(term);
            nexusFallback();
        }
        // Ein präfixierter Query ohne Treffer bietet trotzdem den Nexus an (nichts ist eine Sackgasse).
        if (prefix && out.length === 0) nexusFallback();
        return out.slice(0, LIMIT);
    }

    closeAllDrawers() {
        // Im Werkstatt-Connect-Mode (Source-Part gewählt ODER Popover offen) bricht ESC nur die
        // Connect-Geste ab, nicht den ganzen Drawer.
        const ws = this.state.workshop;
        if (
            ws &&
            this.state.uiActiveDrawer === "werkstatt" &&
            ws.manipulatorMode === "connect" &&
            (ws.connectFirstPartIdx !== null ||
                (typeof document !== "undefined" && document.getElementById("workshop-connect-overlay")))
        ) {
            ws.connectFirstPartIdx = null;
            if (typeof this._workshopCloseConnectPopover === "function") {
                this._workshopCloseConnectPopover();
            }
            if (typeof this._workshopSetSelection === "function") {
                this._workshopSetSelection(null);
            }
            return;
        }
        const tabs = document.querySelectorAll("#topbar .tab");
        for (const tab of tabs) {
            tab.classList.remove("active");
            tab.setAttribute("aria-selected", "false");
        }
        for (const drawer of document.querySelectorAll(".drawer[data-drawer]")) {
            drawer.hidden = true;
        }
        this.state.uiActiveDrawer = null;
        // Welle 6.B Phase 1: Werkstatt-Preview pausieren (Renderer bleibt
        // alloziert für schnelles Re-Open, aber RAF-Loop stoppt).
        if (typeof this._workshopHandleDrawerChange === "function") {
            this._workshopHandleDrawerChange(null);
        }
        if (typeof this._hofHandleDrawerChange === "function") {
            this._hofHandleDrawerChange(null);
        }
        if (typeof this._feedHandleDrawerChange === "function") {
            this._feedHandleDrawerChange(null);
        }
    }

    // Resize-Handles: Konsole „tr" (wächst nach oben, bottom-Anker), Drawer „b" (nur Höhe).
    // Größen persistieren in localStorage (`anazh.resize.<id>`); Doppelklick auf den Griff → Default.
    installResizeHandles() {
        if (typeof document === "undefined") return;
        const consoleEl = document.getElementById("console");
        // V18.83 — die Konsole sitzt jetzt UNTEN-LINKS, bottom-verankert (Game-Konvention).
        // Der „tr"-Griff (oben-rechts) wächst nach OBEN + behält den bottom-Anker — die Historie
        // wächst nach oben aus dem Eingabe-Feld, wie ein echter Chat.
        if (consoleEl) this._installResizeHandle(consoleEl, "tr");
        const drawers = document.querySelectorAll(".drawer[data-drawer]");
        // Die Drawer sind CSS-bounded symmetrisch (left:12;right:12;width:auto) — eine Inline-Breite
        // bräche das. Darum stale Inline-Breite räumen und nur einen HÖHEN-Griff (corner "b") geben.
        drawers.forEach((d) => {
            this._wrapDrawerScroll(d);
            d.style.width = "";
            d.style.maxHeight = "";
            this._installResizeHandle(d, "b");
        });
    }

    // V8.01 — wrappt alle children eines Drawers (außer Header h2, close-button
    // und Resize-Handle) in einen scrollbaren <div class="drawer-scroll">.
    // Idempotent: zweiter Aufruf macht nichts.
    _wrapDrawerScroll(drawer) {
        if (!drawer) return;
        if (drawer.querySelector(":scope > .drawer-scroll")) return;
        const wrapper = document.createElement("div");
        wrapper.className = "drawer-scroll";
        // Sammle alle direkten children, die wir in den Wrapper verschieben:
        // alles außer h2, .drawer-close, .resize-handle (die bleiben am Container).
        const children = Array.from(drawer.children);
        const toMove = children.filter((c) => {
            if (c.tagName === "H2") return false;
            if (c.classList && c.classList.contains("drawer-close")) return false;
            if (c.classList && c.classList.contains("resize-handle")) return false;
            return true;
        });
        toMove.forEach((c) => wrapper.appendChild(c));
        drawer.appendChild(wrapper);
    }

    _installResizeHandle(container, corner) {
        if (!container) return;
        if (container.querySelector(":scope > .resize-handle")) return; // idempotent
        const handle = document.createElement("div");
        handle.className = `resize-handle resize-${corner}`;
        // W-A (V18.165, Korpus R-001): die Konsole wächst nach OBEN (bottom-Anker) —
        // der Griff sagt es jetzt (Titel + sichtbare Ecken-Affordanz im CSS).
        handle.setAttribute(
            "title",
            corner === "tr"
                ? "Größe ziehen (wächst nach oben) · Doppelklick: Standard"
                : "Größe ändern · Doppelklick: Default"
        );
        handle.setAttribute("aria-label", "Größe ändern");
        container.appendChild(handle);

        // Container-ID für Persistence (entweder #id oder data-drawer)
        const cid = container.id || container.getAttribute("data-drawer") || "container";
        const storageKey = `anazh.resize.${cid}`;
        // V18.43 — corner "b" = HÖHEN-only (Drawer): die Breite bleibt beim CSS-Rahmen
        // (left:12;right:12), nur die Höhe ist anpassbar → Symmetrie bleibt.
        const heightOnly = corner === "b";

        // Gespeicherte Größe wiederherstellen
        const restoreSavedSize = () => {
            const raw = typeof localStorage !== "undefined" ? localStorage.getItem(storageKey) : null;
            if (!raw) return;
            try {
                const saved = JSON.parse(raw);
                if (!heightOnly && saved && typeof saved.width === "number" && saved.width > 0) {
                    container.style.width = `${saved.width}px`;
                }
                if (saved && typeof saved.height === "number" && saved.height > 0) {
                    container.style.height = `${saved.height}px`;
                    container.style.maxHeight = "none";
                    // V18.83 — bei „tr" (Konsole, bottom-verankert, wächst nach oben) BLEIBT der
                    // bottom-Anker; nur die alte top-verankerte br/bl-Variante bräuchte bottom:auto.
                    if (container.id === "console" && (corner === "br" || corner === "bl")) {
                        container.style.bottom = "auto";
                    }
                }
            } catch {
                /* ignore */
            }
        };
        restoreSavedSize();

        // Drag-State
        let drag = null;
        const onDown = (event) => {
            event.preventDefault();
            event.stopPropagation();
            const rect = container.getBoundingClientRect();
            drag = {
                startX: event.clientX,
                startY: event.clientY,
                startW: rect.width,
                startH: rect.height,
            };
        };
        const onMove = (event) => {
            if (!drag) return;
            const dx = event.clientX - drag.startX;
            const dy = event.clientY - drag.startY;
            let newW;
            let newH;
            if (corner === "br") {
                // bottom-right: wächst nach rechts (+dx) + unten (+dy)
                newW = drag.startW + dx;
                newH = drag.startH + dy;
            } else if (corner === "bl") {
                // bottom-left: wächst nach links (-dx) + unten (+dy)
                newW = drag.startW - dx;
                newH = drag.startH + dy;
            } else if (corner === "tr") {
                // Welle 6.X.2 V8.15 — top-right: wächst nach rechts (+dx) +
                // OBEN (-dy). Konsole hat bottom-anchor, also vergrößern wir
                // sie nach oben statt nach unten.
                newW = drag.startW + dx;
                newH = drag.startH - dy;
            } else if (corner === "b") {
                // V18.43 — bottom-center: NUR Höhe (+dy), Breite unangetastet (CSS-Rahmen).
                newW = drag.startW;
                newH = drag.startH + dy;
            } else {
                // Fallback (top-left, falls jemals genutzt)
                newW = drag.startW - dx;
                newH = drag.startH - dy;
            }
            // Clamp: Min + Max (Viewport-Abstand). Die Min respektiert den START-Zustand: wer kleiner startet
            // (eingeklappte Konsole 105 px), springt beim ersten Drag nicht auf die harte Min — die gilt nur
            // beim Größer-Ziehen.
            const minW = Math.min(220, drag.startW);
            const minH = Math.min(180, drag.startH);
            const clampedW = Math.max(minW, Math.min(window.innerWidth - 40, newW));
            const clampedH = Math.max(minH, Math.min(window.innerHeight - 140, newH));
            if (!heightOnly) container.style.width = `${clampedW}px`;
            container.style.height = `${clampedH}px`;
            container.style.maxHeight = "none";
            if (container.id === "console") {
                // top-right Konsole behält bottom-anchor + height wächst nach oben.
                // Nur bei br/bl muss bottom auf auto (CSS-Default bleibt sonst).
                if (corner === "br" || corner === "bl") container.style.bottom = "auto";
            }
        };
        const onUp = () => {
            if (!drag) return;
            // Persist
            try {
                const w = heightOnly ? 0 : parseInt(container.style.width, 10) || 0;
                const h = parseInt(container.style.height, 10) || 0;
                if (typeof localStorage !== "undefined") {
                    localStorage.setItem(storageKey, JSON.stringify({ width: w, height: h }));
                }
            } catch {
                /* ignore */
            }
            drag = null;
        };
        handle.addEventListener("mousedown", onDown);
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);

        // Doppelklick → Reset auf Default (CSS-Werte greifen wieder)
        handle.addEventListener("dblclick", (event) => {
            event.preventDefault();
            event.stopPropagation();
            container.style.width = "";
            container.style.height = "";
            container.style.maxHeight = "";
            if (container.id === "console") container.style.bottom = "";
            try {
                if (typeof localStorage !== "undefined") localStorage.removeItem(storageKey);
            } catch {
                /* ignore */
            }
        });
    }

    updateStatusPanel(currentTime) {
        if (!this._statusRefs) return;
        if (currentTime - this._statusRefs.lastTick < 0.4) return;
        this._statusRefs.lastTick = currentTime;
        const r = this._statusRefs;
        this._hudSchreib(r.weather, this.state.weather || "—");
        this._hudSchreib(r.slug, this.state.worldMeta.slug || "—");
        if (this.state.playerMesh) {
            const p = this.state.playerMesh.position;
            this._hudSchreib(r.position, `${p.x.toFixed(1)} ${p.y.toFixed(1)} ${p.z.toFixed(1)}`);
        }
        if (r.fps) {
            // V18.390 — die Trias SYNERGETISCH in die bestehende Status-Bar (FPS · Bauten · Position),
            // statt eines zweiten Panels (Schöpfer-Befund „wieso nicht dort wo wir schon fps/Bauten haben").
            const s = this.state.perfSense;
            let extra = "";
            if (s) {
                const dc = Math.round(s.renderCalls || 0);
                const trisK = Math.round((s.renderTris || 0) / 1000);
                const szenePct = Math.round(this._szeneSkalaWirk() * 100);
                extra = ` · ${dc}dc · ${trisK}k▲ · Szene ${szenePct}%`;
            }
            this._hudSchreib(r.fps, String(this.state.fps || 0) + extra);
        }
        this._hudSchreib(r.creatures, this.state.creatures.length);
        if (r.soul) {
            // ALTLASTEN-NULL: die EINE Auflösungs-Quelle (_getSoulDef) — auch ein
            // getragener Tier-Körper (Custom-Seele bp_koerper_*) zeigt sein Label.
            const def = this._getSoulDef(this.state.player.soul || "human");
            this._hudSchreib(r.soul, (def && def.label) || "—");
        }
        if (r.architectures) {
            const counts = this.countArchitecturesNearPlayer(60);
            this._hudSchreib(r.architectures, `${counts.near} nah / ${counts.total}`);
        }
        // Welle 6.G3 — Tageszeit-Anzeige (zusätzlich zum 10-Hz-Refresh in
        // tickDayNight; diese Schleife läuft 0.4 s und ist Backup für die
        // Fälle wo tickDayNight pausiert ist).
        if (r.time) {
            const t = typeof this.state.timeOfDay === "number" ? this.state.timeOfDay : 0.5;
            this._hudSchreib(r.time, this._timeOfDayLabel(t));
        }
        const e = this.state.player.emotions;
        for (const axis of Object.keys(r.emotions)) {
            const v = Math.max(0, Math.min(1, e[axis] || 0));
            r.emotions[axis].fill.style.width = `${(v * 100).toFixed(0)}%`;
            this._hudSchreib(r.emotions[axis].value, v.toFixed(2));
        }
        this._updateEmotionFeedback();
        // Gesten und Gesetze leben im Hof-Drawer: geschlossen schreibt niemand hinein, das Öffnen rendert sie frisch
        // (`_hofHandleDrawerChange`).
        if (this._uiSchubladeOffen("kreaturen")) {
            this.renderAbilitiesList();
            this.renderWorldRulesList();
        }
    }

    // Emotion-Feedback: färbt das Leisten-WORT in der Farbe der dominanten Emotion (EINE Quelle
    // _emotionState), Intensität → Opazität. Trägt die Stimmung in jeder Kamera.
    _updateEmotionFeedback() {
        const lab = this._emotionLabel;
        if (!lab) return;
        const es = this._emotionState();
        const item = typeof lab.closest === "function" ? lab.closest(".status-item") : null;
        if (es.dominant && es.intensity > 0.2) {
            const css = window.getComputedStyle(document.body).getPropertyValue(`--${es.dominant}`).trim() || "#ffffff";
            if (this._emotionLabelHideTimer) {
                clearTimeout(this._emotionLabelHideTimer);
                this._emotionLabelHideTimer = null;
            }
            if (item) item.style.display = "";
            this._hudSchreib(lab, es.label);
            lab.style.color = css;
            lab.style.opacity = "0.8";
        } else {
            lab.style.opacity = "0";
            // Nach dem 1.4-s-Fade verlässt das Item den Leisten-Flow (display:none) — mit opacity 0 bliebe
            // ein Loch und der Flex-Gap verdoppelte sich um ein unsichtbares Mitglied.
            if (item && item.style.display !== "none" && !this._emotionLabelHideTimer) {
                this._emotionLabelHideTimer = setTimeout(() => {
                    this._emotionLabelHideTimer = null;
                    if (lab.style.opacity === "0") item.style.display = "none";
                }, 1500);
            }
        }
    }

    // V18.53 Hof-Partitur — die Gesten („Der Nexus komponiert") auf denselben Stand wie die Regeln:
    // jede Geste ist eine EINMALIGE Tat (✦), zeigt WANN sie wirkte, ist direkt vergessbar (✕) + die Liste
    // ist gekappt/„leerbar" (Schöpfer-Befund: „kann nicht stoppen/löschen, die Liste wächst aus dem Bild").
    renderAbilitiesList() {
        const r = this._statusRefs;
        if (!r || !r.abilities) return;
        const list = this.state.dsl.abilities;
        const now = performance.now() / 1000;
        const GESTEN_SHOWN = 6;
        const expanded = !!this.state.hofGestenExpanded;
        // Neueste zuerst; default die Top-N, „alle"-Toggle zeigt mehr (wie die Regel-Gruppe).
        const ordered = list.slice().reverse();
        const shown = expanded ? ordered : ordered.slice(0, GESTEN_SHOWN);
        const hidden = ordered.length - shown.length;
        const signature =
            `${list.length}:${expanded ? "E" : "C"}:` +
            shown.map((a) => `${a.name}:${a.source || "?"}:${a.description ? "d" : "_"}`).join("|");
        if (signature === r.abilitiesSignature) return;
        r.abilitiesSignature = signature;
        const container = r.abilities;
        container.innerHTML = "";
        if (list.length === 0) {
            const empty = document.createElement("div");
            empty.className = "ability-empty";
            empty.textContent = "Noch keine Gesten — der Nexus hat noch nichts komponiert.";
            container.appendChild(empty);
            return;
        }
        // Gruppen-Kopf: Anzahl + „leeren" + (bei vielen) der Auf-/Zuklappen-Toggle.
        const headRow = document.createElement("div");
        headRow.className = "worldrule-group-head nexus";
        const lbl = document.createElement("span");
        lbl.textContent =
            `✦ Gesten · ${list.length}` + (expanded || hidden === 0 ? "" : ` (die jüngsten ${shown.length})`);
        headRow.appendChild(lbl);
        const headBtns = document.createElement("span");
        if (ordered.length > GESTEN_SHOWN) {
            const toggle = document.createElement("button");
            toggle.type = "button";
            toggle.className = "worldrule-toggle";
            toggle.textContent = expanded ? "▾ weniger" : `▸ alle ${ordered.length}`;
            toggle.setAttribute("data-toggle-abilities", "1");
            headBtns.appendChild(toggle);
        }
        const clear = document.createElement("button");
        clear.type = "button";
        clear.className = "worldrule-toggle";
        clear.textContent = "leeren";
        clear.setAttribute("data-clear-abilities", "1");
        clear.setAttribute("aria-label", "Alle Nexus-Gesten verwerfen");
        headBtns.appendChild(clear);
        headRow.appendChild(headBtns);
        container.appendChild(headRow);
        const fmtAgo = (sec) => {
            const d = Math.max(0, Math.round(now - sec));
            return d < 60 ? `vor ${d}s` : `vor ${Math.round(d / 60)}m`;
        };
        for (const ability of shown) {
            const row = document.createElement("div");
            const src = ability.source || "unknown";
            row.className = `ability-row source-${src}`;
            const head = document.createElement("div");
            head.className = "ability-head";
            const kind = document.createElement("span");
            kind.className = "ability-kind";
            kind.textContent = "✦ Geste";
            kind.title = "Eine einmalige Tat (kein stehendes Gesetz) — ▶ wirkt sie erneut.";
            const name = document.createElement("span");
            name.className = "name";
            name.textContent = ability.name;
            head.appendChild(kind);
            head.appendChild(name);
            // WANN sie wirkte (Schöpfer-Befund „sehe nicht ob sie feuern") — die Geste ist einmalig, also „vor Xs".
            if (Number.isFinite(ability.createdAt)) {
                const when = document.createElement("span");
                when.className = "rule-status";
                when.textContent = fmtAgo(ability.createdAt);
                head.appendChild(when);
            }
            const run = document.createElement("button");
            run.type = "button";
            run.textContent = "▶";
            run.setAttribute("data-run-ability", ability.name);
            run.setAttribute("aria-label", `Geste ${ability.name} erneut wirken`);
            head.appendChild(run);
            const forget = document.createElement("button");
            forget.type = "button";
            forget.textContent = "✕";
            forget.setAttribute("data-forget-ability", ability.name);
            forget.setAttribute("aria-label", `Geste ${ability.name} vergessen`);
            head.appendChild(forget);
            row.appendChild(head);
            // Beschreibung (Lazy-Compute für Legacy-Saves, dann persistiert).
            if (!ability.description && Array.isArray(ability.program)) {
                try {
                    ability.description = this.describeProgram(ability.program);
                } catch {
                    ability.description = "wirkt auf die Welt";
                }
            }
            if (ability.description) {
                const desc = document.createElement("div");
                desc.className = "ability-desc";
                desc.textContent = ability.description;
                row.appendChild(desc);
            }
            container.appendChild(row);
        }
        if (hidden > 0) {
            const more = document.createElement("div");
            more.className = "worldrule-more";
            more.textContent = `+ ${hidden} ältere Gesten`;
            container.appendChild(more);
        }
    }

    // Gesetze-Sektion: listet state.worldRules im Row-Pattern der Fähigkeiten-UI (kein Parallel-Panel);
    // eine Regel STEHT (kein ▶) → ✕ vergessen (nur Mensch-Regeln; Nexus-Regeln verfallen per ttl).
    // describeProgram macht Regeln lesbar; Signature-Diff hält den Re-Render billig.
    // Persistenz-Status: „pausiert" / „permanent" (ttlSec==null) / „verfällt in ~Ns" (10-s-granular);
    // eigene Methode, damit Signatur + Label sie teilen.
    _worldRuleStatusLabel(rule, now) {
        if (rule.disabled) return "pausiert";
        if (rule.ttlSec == null) return "permanent";
        const rem = Math.max(0, Math.ceil((rule.ttlSec - (now - rule.born)) / 10) * 10);
        return `verfällt in ~${rem}s`;
    }

    // Live-Aktivitäts-Faden eines Gesetzes: „⚡ feuert" (innerhalb threadRecentSec), sonst
    // „⚡ aktiv · N×", „ruht" (nie gefeuert), „pausiert". EINE Quelle für Namen-Span UND Render-Signatur;
    // bounded: „feuert" bleibt stabil während des Feuerns (Frist > everySec), ein Re-Render beim
    // Verstummen.
    _worldRuleActivityLabel(rule, now) {
        if (rule.disabled) return "pausiert";
        const fires = rule.fires || 0;
        if (fires === 0) return "ruht";
        if (now - rule.lastFired <= AnazhRealm.WORLD_RULES.threadRecentSec) return "⚡ feuert";
        return `⚡ aktiv · ${fires}×`;
    }

    // V18.52 Hof-Partitur — EINE Regel-Karte (wiederverwendet in beiden Gruppen). Der gelernte WERT
    // (`rule.value`, V17.43) wird endlich GELESEN: ein Chip an ephemeren Nexus-Regeln (Konsum V17.31).
    _buildWorldRuleRow(rule, now) {
        const src =
            rule.source === "human"
                ? "human"
                : rule.source === "nexus"
                  ? "nexus"
                  : rule.source && rule.source.startsWith("llm")
                    ? "llm"
                    : "unknown";
        const permanent = rule.ttlSec == null; // Mensch-Regel ODER adoptierte (gepinnte) Nexus-Regel
        const mkBtn = (label, attr, aria) => {
            const b = document.createElement("button");
            b.type = "button";
            b.textContent = label;
            b.setAttribute(attr, String(rule.id));
            b.setAttribute("aria-label", aria);
            return b;
        };
        const row = document.createElement("div");
        row.className = `ability-row source-${src}` + (rule.disabled ? " rule-disabled" : "");
        const head = document.createElement("div");
        head.className = "ability-head";
        const name = document.createElement("span");
        const activity = this._worldRuleActivityLabel(rule, now);
        name.className = "name" + (activity === "⚡ feuert" ? " rule-firing" : "");
        name.textContent = activity;
        const source = document.createElement("span");
        source.className = "source";
        source.textContent =
            (src === "human" ? "du" : src === "nexus" ? "Nexus" : src === "llm" ? "Grok" : rule.source) +
            (rule.pinned ? " ★" : "");
        const status = document.createElement("span");
        status.className = "rule-status" + (permanent ? " perma" : "");
        status.textContent = this._worldRuleStatusLabel(rule, now);
        head.appendChild(name);
        head.appendChild(source);
        head.appendChild(status);
        // Der gelernte WERT — nur an ephemeren Experimenten (die permanenten sind bereits adoptiert).
        if (!permanent) {
            const v = rule.value || 0;
            const chip = document.createElement("span");
            chip.className = "rule-value-chip " + (v > 0.05 ? "val-pos" : v < -0.05 ? "val-neg" : "val-neu");
            chip.textContent = (v >= 0 ? "+" : "") + v.toFixed(2);
            chip.title =
                "Gelernter Wert (struktureller δ am Ort der Regel) — die wertvollsten überleben + werden adoptierbar.";
            head.appendChild(chip);
        }
        if (permanent) {
            head.appendChild(mkBtn(rule.pinned ? "★" : "☆", "data-pin-rule", "Favorit"));
            head.appendChild(
                mkBtn(
                    rule.disabled ? "▶" : "⏸",
                    "data-toggle-rule",
                    rule.disabled ? "Gesetz aktivieren" : "Gesetz pausieren"
                )
            );
            head.appendChild(mkBtn("✕", "data-forget-rule", "Gesetz vergessen"));
        } else {
            // V18.53 — ein ephemeres Nexus-Experiment ist DIREKT steuerbar, ohne erst zu pinnen (Schöpfer-Befund
            // „muss zuerst pinnen, um Stopp/Löschen zu nutzen"): 📌 behalten · ⏸ verstummen (das Experiment bleibt,
            // stört aber nicht — respektiert die Welt-Autonomie) · ✕ verwerfen (dein Recht, in JEDEM Modus).
            head.appendChild(mkBtn("📌", "data-pin-rule", "Experiment behalten (wird permanent)"));
            head.appendChild(
                mkBtn(
                    rule.disabled ? "▶" : "⏸",
                    "data-toggle-rule",
                    rule.disabled ? "Experiment aktivieren" : "Experiment verstummen"
                )
            );
            head.appendChild(mkBtn("✕", "data-forget-rule", "Experiment verwerfen"));
        }
        row.appendChild(head);
        const desc = document.createElement("div");
        desc.className = "ability-desc";
        try {
            desc.textContent = this.describeProgram(["rule", rule.cond, rule.effect]);
        } catch {
            desc.textContent = "eine Welt-Regel";
        }
        row.appendChild(desc);
        return row;
    }

    renderWorldRulesList() {
        const r = this._statusRefs;
        if (!r || !r.worldrules) return;
        const now = performance.now() / 1000;
        const mode = typeof this.getGameMode === "function" ? this.getGameMode() : "frieden";
        const all = this.state.worldRules || [];
        // Zwei Gruppen: DEINE Gesetze (Mensch + adoptiert, stabil, oben) ↔ DER NEXUS ERPROBT (ephemer,
        // nach gelerntem WERT sortiert, nur Top-N) — die Experimente begraben nicht die eigenen Regeln.
        const yours = all
            .filter((x) => x.source === "human" || x.pinned)
            .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || a.id - b.id);
        const nexus = all
            .filter((x) => !(x.source === "human" || x.pinned))
            .sort((a, b) => (b.value || 0) - (a.value || 0) || (b.fires || 0) - (a.fires || 0) || a.id - b.id);
        const NEXUS_SHOWN = 5;
        const expanded = !!this.state.hofNexusExpanded;
        const nexusShown = expanded ? nexus : nexus.slice(0, NEXUS_SHOWN);
        const nexusHidden = nexus.length - nexusShown.length;
        // Signatur = die GEZEIGTE Komposition + ihr Live-Puls (re-rendert, wenn sich Reihenfolge/Status/Wert ändert).
        const sigOf = (x) =>
            `${x.id}:${x.pinned ? "p" : "_"}:${x.disabled ? "x" : "_"}:${(x.value || 0).toFixed(1)}:` +
            `${this._worldRuleActivityLabel(x, now)}:${this._worldRuleStatusLabel(x, now)}`;
        const signature = `${mode}|${expanded ? "E" : "C"}|Y:${yours.map(sigOf).join(",")}|N:${nexusShown.map(sigOf).join(",")}|h:${nexusHidden}`;
        if (signature === r.worldrulesSignature) return;
        r.worldrulesSignature = signature;
        const container = r.worldrules;
        container.innerHTML = "";
        if (all.length === 0) {
            const empty = document.createElement("div");
            empty.className = "ability-empty";
            empty.textContent = 'Noch keine Gesetze. Sag z. B. „wann immer es regnet, dann setze wetter sunny".';
            container.appendChild(empty);
            return;
        }
        // Gruppe 1 — DEINE GESETZE (stabil, manipulierbar, oben).
        const yourHead = document.createElement("div");
        yourHead.className = "worldrule-group-head";
        yourHead.textContent = `Deine Gesetze · ${yours.length}`;
        container.appendChild(yourHead);
        if (yours.length === 0) {
            const hint = document.createElement("div");
            hint.className = "ability-empty";
            hint.textContent = "Noch keine eigenen — sprich eine Regel, oder 📌 adoptiere ein Nexus-Experiment.";
            container.appendChild(hint);
        } else {
            for (const rule of yours) container.appendChild(this._buildWorldRuleRow(rule, now));
        }
        // Gruppe 2 — DER NEXUS ERPROBT (ephemer, wert-sortiert, Top-N + Auf-/Zuklappen).
        if (nexus.length > 0) {
            const nexHead = document.createElement("div");
            nexHead.className = "worldrule-group-head nexus";
            const lbl = document.createElement("span");
            lbl.textContent =
                `Der Nexus erprobt · ${nexus.length}` +
                (expanded || nexusHidden === 0 ? "" : ` (die wertvollsten ${nexusShown.length})`);
            nexHead.appendChild(lbl);
            if (nexus.length > NEXUS_SHOWN) {
                const toggle = document.createElement("button");
                toggle.type = "button";
                toggle.className = "worldrule-toggle";
                toggle.textContent = expanded ? "▾ weniger" : `▸ alle ${nexus.length}`;
                toggle.addEventListener("click", () => {
                    this.state.hofNexusExpanded = !expanded;
                    this.renderWorldRulesList();
                });
                nexHead.appendChild(toggle);
            }
            container.appendChild(nexHead);
            for (const rule of nexusShown) container.appendChild(this._buildWorldRuleRow(rule, now));
            if (nexusHidden > 0) {
                const more = document.createElement("div");
                more.className = "worldrule-more";
                more.textContent = `+ ${nexusHidden} weitere mit geringerem Wert`;
                container.appendChild(more);
            }
        }
    }

    // DIE GERÄTE-GRENZEN (G1): was JEDER WebGPURenderer der Seite vom Gerät verlangt (Welt · Feed-/Hof-/Ich-Bühne · Workshop-
    // Preview) — der EINE forceWebGL-Hook und je Stufe die Grenzen des EINEN Adapters der Holz-Wahl (`GERAET_GRENZEN`). Ohne
    // `requiredLimits` gibt WebGPU dem Gerät die Standard-Grenzen (16 Texturen · 16 Sampler · 8 Speicher-Puffer je Stufe), auch
    // wenn der Adapter 48 Texturen trägt: der Boden-Stoff des Fern-Rings (17) sagte ab. Die Bühnen entstehen nach dem Boot und
    // lesen den Adapter synchron; ein Renderer vor der Holz-Wahl bricht laut (jede Münzstelle meldet ihren Fehlschlag als ERROR).
    _rendererGeraet() {
        if (this._adapter === undefined)
            throw new Error("GERÄTE-GRENZEN: ein Renderer vor der Adapter-Frage der Holz-Wahl (`_holzWahl` beim Boot)");
        const a = this._adapter;
        const requiredLimits = {};
        if (a)
            for (const k of AnazhRealm.GERAET_GRENZEN)
                if (Number.isFinite(a.limits[k])) requiredLimits[k] = a.limits[k];
        return { forceWebGL: AnazhRealm._forceWebGL(), requiredLimits };
    }

    // Welle 6.X.4 D2 (Audit 17.05.2026) — Drei Schieber: Master-Volume,
    // Umgebungsgeräusche, Render-Ring-Radius. Lädt persistierte Werte
    // aus localStorage. Master + Umgebung wirken live auf den Master-Bus und
    // den Bus der Klang-Welt. Render-Ring greift im nächsten worldgen-Tick.
    slidersInitDOM() {
        if (typeof document === "undefined") return;
        // Persistierte Werte laden
        if (typeof localStorage !== "undefined") {
            try {
                const mv = parseFloat(localStorage.getItem("anazh.audio.masterVol"));
                if (Number.isFinite(mv) && mv >= 0 && mv <= 1) this.state.symphony.masterVolume = mv;
                const pv = parseFloat(localStorage.getItem("anazh.audio.pingVol"));
                if (Number.isFinite(pv) && pv >= 0 && pv <= 1) this.state.symphony.creaturePingVolume = pv;
                // V8.15 — TTS-Stimme-Volume separat persistiert.
                const vv = parseFloat(localStorage.getItem("anazh.audio.voiceVol"));
                if (Number.isFinite(vv) && vv >= 0 && vv <= 1) this.state.symphony.voiceVolume = vv;
                const rr = parseInt(localStorage.getItem("anazh.world.ringRadius"), 10);
                if (Number.isFinite(rr) && rr >= 1 && rr <= 12) this.state.chunkRingRadius = rr;
            } catch {
                /* ignore */
            }
        }
        // Helper: Ring-Radius zu Format-String (1 → "3×3", 2 → "5×5", …)
        const ringText = (r) => `${r * 2 + 1}×${r * 2 + 1}`;
        // Master Slider
        const ms = document.getElementById("slider-master");
        const msv = document.getElementById("slider-master-val");
        if (ms) {
            ms.value = String(Math.round((this.state.symphony.masterVolume || 1) * 100));
            if (msv) msv.textContent = `${ms.value}%`;
            ms.addEventListener("input", () => {
                const v = parseFloat(ms.value) / 100;
                this.state.symphony.masterVolume = v;
                if (msv) msv.textContent = `${ms.value}%`;
                // Live-Update wenn Audio-Graph läuft (EIN Mischpult: UMWELT.masterBasis, Wirt und Lab)
                if (this.state.symphony.masterGain) {
                    this.state.symphony.masterGain.gain.value = AnazhRealm._umweltGesetz().UMWELT.masterBasis * v;
                }
                if (typeof localStorage !== "undefined") {
                    try {
                        localStorage.setItem("anazh.audio.masterVol", String(v));
                    } catch {
                        /* ignore */
                    }
                }
            });
        }
        // Pings Slider
        const ps = document.getElementById("slider-pings");
        const psv = document.getElementById("slider-pings-val");
        if (ps) {
            ps.value = String(Math.round((this.state.symphony.creaturePingVolume || 1) * 100));
            if (psv) psv.textContent = `${ps.value}%`;
            ps.addEventListener("input", () => {
                const v = parseFloat(ps.value) / 100;
                this.state.symphony.creaturePingVolume = v;
                // Der Regler IST der Bus der Klang-Welt (Wind · Wasser · Glut · Regen · Vögel · Tier-Rufe).
                const sym = this.state.symphony;
                if (sym.enabled && sym.ctx && sym.umwelt)
                    sym.umwelt.bus.gain.setTargetAtTime(v, sym.ctx.currentTime, 0.1);
                if (psv) psv.textContent = `${ps.value}%`;
                if (typeof localStorage !== "undefined") {
                    try {
                        localStorage.setItem("anazh.audio.pingVol", String(v));
                    } catch {
                        /* ignore */
                    }
                }
            });
        }
        // V8.15 — Voice (TTS) Slider
        const vs = document.getElementById("slider-voice");
        const vsv = document.getElementById("slider-voice-val");
        if (vs) {
            vs.value = String(Math.round((this.state.symphony.voiceVolume || 1) * 100));
            if (vsv) vsv.textContent = `${vs.value}%`;
            vs.addEventListener("input", () => {
                const v = parseFloat(vs.value) / 100;
                this.state.symphony.voiceVolume = v;
                if (vsv) vsv.textContent = `${vs.value}%`;
                if (typeof localStorage !== "undefined") {
                    try {
                        localStorage.setItem("anazh.audio.voiceVol", String(v));
                    } catch {
                        /* ignore */
                    }
                }
            });
        }
        // Ring-Radius Slider
        const rs = document.getElementById("slider-ring");
        const rsv = document.getElementById("slider-ring-val");
        // Welle 6.X.4 — der Ring-Radius-Slider treibt chunkRingRadius, den
        // Pruning-Radius (`_pruneDistantVoxelChunks` liest ihn direkt).
        const applyRingRadius = (v) => {
            this.state.chunkRingRadius = v;
            if (rsv) rsv.textContent = ringText(v);
        };
        if (rs) {
            rs.value = String(this.state.chunkRingRadius || 4);
            applyRingRadius(parseInt(rs.value, 10));
            rs.addEventListener("input", () => {
                // V8.40 — Regler-Bereich 1–8; Welle E (E2): erweitert auf 1–12
                // (3×3 … 25×25). Die fernen Ringe 9–12 sind dank der LOD-Pyramide
                // (E1) billig (LOD2/LOD3) → Weitsicht bis ~518 m ohne FPS-Einbruch.
                const v = Math.max(1, Math.min(12, parseInt(rs.value, 10)));
                applyRingRadius(v);
                if (typeof localStorage !== "undefined") {
                    try {
                        localStorage.setItem("anazh.world.ringRadius", String(v));
                    } catch {
                        /* ignore */
                    }
                }
            });
        }

        // Wald-Perf-Regler: jeder setzt ein kanonisches State-Feld, das der EINE Perf-Regler
        // (`_nexusPerfActuate`) bzw. der SSE-LOD-Leser (`_lodPerceptionDistance`) liest — kein
        // Parallel-Regler; persistiert via Snapshot. Die Sichtweite ist der Ring-Slider (chunkRingRadius).
        // (1) Ziel-FPS: PID-Sollwert `perfTargetMs = 1000/fps`.
        const fpsS = document.getElementById("slider-fpstarget");
        const fpsSv = document.getElementById("slider-fpstarget-val");
        if (fpsS) {
            const pt0 = Number.isFinite(this.state.perfTargetMs) ? this.state.perfTargetMs : AnazhRealm.PERF_TARGET_MS;
            const fps0 = Math.max(30, Math.min(60, Math.round(1000 / pt0 / 5) * 5));
            fpsS.value = String(fps0);
            if (fpsSv) fpsSv.textContent = `${fps0} fps`;
            fpsS.addEventListener("input", () => {
                const fps = Math.max(30, Math.min(60, parseInt(fpsS.value, 10) || 60));
                this.state.perfTargetMs = Math.round(1000 / fps);
                if (fpsSv) fpsSv.textContent = `${fps} fps`;
            });
        }
        // (2) DIE SZENEN-SKALA (K50): die interne Auflösung der Szene (50..100 %), die zeitliche Auflösung löst auf die
        // Ausgabe auf; der neue Wert legt die Ziele im nächsten Frame neu an (`_loopRender`).
        const skS = document.getElementById("slider-szeneskala");
        const skSv = document.getElementById("slider-szeneskala-val");
        if (skS) {
            const sk0 = this.state.szeneSkala == null ? AnazhRealm.SZENE_SKALA : this.state.szeneSkala;
            const pct0 = Math.round(sk0 * 100);
            skS.value = String(pct0);
            if (skSv) skSv.textContent = `${pct0} %`;
            skS.addEventListener("input", () => {
                const pct = Math.max(50, Math.min(100, parseInt(skS.value, 10) || 75));
                this.state.szeneSkala = pct / 100;
                if (skSv) skSv.textContent = `${pct} %`;
            });
        }
        // (3) LOD-Referenz (Vorlage `_lodU.uLodRef`): die Screen-Space-Error-Bezugshöhe
        // `state.lodRef` (Subsystem A's EINE Quelle), die der SSE-LOD-Leser LIVE liest.
        const lodS = document.getElementById("slider-lodref");
        const lodSv = document.getElementById("slider-lodref-val");
        if (lodS) {
            const lr0 = Number.isFinite(this.state.lodRef) ? this.state.lodRef : 14;
            const lv0 = Math.max(4, Math.min(30, Math.round(lr0)));
            lodS.value = String(lv0);
            if (lodSv) lodSv.textContent = `${lv0} m`;
            lodS.addEventListener("input", () => {
                const v = Math.max(4, Math.min(30, parseInt(lodS.value, 10) || 14));
                this.state.lodRef = v;
                if (lodSv) lodSv.textContent = `${v} m`;
            });
        }
        // (4) V18.389 (P5) — der Perf-Panel-Toggle: schaltet das saubere Standalone-Panel
        // (default an). Setzt `state.perfPanel` (persistiert) + spiegelt die Sichtbarkeit sofort.
        const panelCb = document.getElementById("perf-panel-toggle");
        if (panelCb) {
            panelCb.checked = this.state.perfPanel !== false;
            panelCb.addEventListener("change", () => {
                this.state.perfPanel = !!panelCb.checked;
                const div = this._ensurePerfPanelDiv();
                if (div) div.style.display = this.state.perfPanel ? "block" : "none";
            });
        }
        // spielgang.K4 — die Untertitel der Klang-Welt (default aus): aus, fällt jede stehende Zeile.
        const utCb = document.getElementById("untertitel-toggle");
        if (utCb) {
            utCb.checked = this.state.untertitel === true;
            utCb.addEventListener("change", () => {
                this.state.untertitel = !!utCb.checked;
                const buch = this.state._untertitel;
                if (!this.state.untertitel && buch)
                    for (const schl of [...buch.offen.keys()]) this._untertitelWeg(schl);
            });
        }
        // V18.472 — der Perf-Export-Button (unter dem Panel-Toggle): lädt den
        // Flugschreiber-Trace (+ Sekunden-Ring) als .json herunter — die Datei,
        // die der Schöpfer im Chat zustellt. EINE Quelle (_flightRecorderBuildTrace).
        const expBtn = document.getElementById("perf-export-btn");
        if (expBtn) {
            expBtn.addEventListener("click", () => {
                const r2 = this._exportPerfTrace();
                const st2 = document.getElementById("perf-export-status");
                if (st2)
                    st2.textContent = r2
                        ? `${r2.name} (${Math.round(r2.bytes / 1024)} kB)`
                        : "noch keine Daten — erst ein paar Sekunden spielen";
            });
        }

        // Welle 6.G3 (V8.24) — Tag-Nacht-Slider + Tageszeit-Slider.
        // Tag-Länge: 1-60 Min. Tageszeit: 0-1000 (skaliert auf 0..1, drei
        // Nachkomma-Stellen-Präzision damit Drag smooth fühlt).
        const dl = document.getElementById("slider-daylength");
        const dlVal = document.getElementById("slider-daylength-val");
        if (dl) {
            // Persistierte Tag-Länge aus localStorage einlesen (Init).
            try {
                if (typeof localStorage !== "undefined") {
                    const stored = localStorage.getItem("anazh.dayLengthMinutes");
                    if (stored) {
                        const v = Math.max(
                            this.constructor.DAY_LENGTH_MIN_MINUTES,
                            Math.min(
                                this.constructor.DAY_LENGTH_MAX_MINUTES,
                                parseInt(stored, 10) || this.constructor.DAY_LENGTH_DEFAULT_MINUTES
                            )
                        );
                        this.state.dayLengthMinutes = v;
                    }
                }
            } catch (e) {
                void e;
            }
            dl.value = String(this.state.dayLengthMinutes || this.constructor.DAY_LENGTH_DEFAULT_MINUTES);
            if (dlVal) dlVal.textContent = `${dl.value} Min`;
            dl.addEventListener("input", () => {
                const v = parseInt(dl.value, 10);
                this.setDayLength(v);
                if (dlVal) dlVal.textContent = `${v} Min`;
            });
        }

        const tod = document.getElementById("slider-timeofday");
        const todVal = document.getElementById("slider-timeofday-val");
        if (tod) {
            // Der Regler zeigt die Welt-Zeit (`_uhrAnzeigen`, im Gang der Uhr) und stellt sie als Hand des Spielers.
            this._tageszeitRegler = { tod, todVal };
            this._uhrAnzeigen(typeof this.state.timeOfDay === "number" ? this.state.timeOfDay : 0.5);
            tod.addEventListener("input", () => {
                this.setTimeOfDay(parseInt(tod.value, 10) / 1000, "regler");
            });
        }

        // V13.9 — Wasser-Cull-Slider (uMinDepth). Range 0..200 → minDepth
        // 0..0.02 (Schritt 0.0001), feinfühlig im dünnen Lineardepth-Bereich.
        const wcS = document.getElementById("slider-watercull");
        const wcVal = document.getElementById("slider-watercull-val");
        if (wcS) {
            const w0 =
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.waterCull)
                    ? this.state.atmosphere.waterCull
                    : 0.0025;
            wcS.value = String(Math.round(w0 * 10000));
            if (wcVal) wcVal.textContent = w0.toFixed(4);
            wcS.addEventListener("input", () => {
                const raw = parseInt(wcS.value, 10) / 10000;
                const v = this.setWaterCull(raw);
                if (wcVal) wcVal.textContent = v.toFixed(4);
            });
        }
        // V18.15 Phase 3 — See-Wellen (uLakeRipple 0..1, Slider ×100).
        const lrS = document.getElementById("slider-lakeripple");
        const lrVal = document.getElementById("slider-lakeripple-val");
        if (lrS) {
            const r0 =
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.waterLakeRipple)
                    ? this.state.atmosphere.waterLakeRipple
                    : 0.2;
            lrS.value = String(Math.round(r0 * 100));
            if (lrVal) lrVal.textContent = r0.toFixed(2);
            lrS.addEventListener("input", () => {
                const v = this.setLakeRipple(parseInt(lrS.value, 10) / 100);
                if (lrVal) lrVal.textContent = v.toFixed(2);
            });
        }
        // V18.14 M1 — Fluss-Schaum-Tiefe (uDepthFoam, m): Schaum nur bis dieser ECHTEN Tiefe.
        const dfS = document.getElementById("slider-waterdepthfoam");
        const dfVal = document.getElementById("slider-waterdepthfoam-val");
        if (dfS) {
            const f0 =
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.waterDepthFoam)
                    ? this.state.atmosphere.waterDepthFoam
                    : 1.2;
            dfS.value = String(Math.round(f0 * 10));
            if (dfVal) dfVal.textContent = f0.toFixed(1) + " m";
            dfS.addEventListener("input", () => {
                const v = this.setWaterDepthFoam(parseInt(dfS.value, 10) / 10);
                if (dfVal) dfVal.textContent = v.toFixed(1) + " m";
            });
        }
        // Kavitäts-AO (0..200 % → aoScale 0..2) + Kanten-Schärfe (0..100 → local-contrast 0..1);
        // Live-Wert im Label.
        const aoS = document.getElementById("slider-cavityao");
        const aoVal = document.getElementById("slider-cavityao-val");
        if (aoS) {
            const a0 =
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.cavityAO)
                    ? this.state.atmosphere.cavityAO
                    : 1.0;
            aoS.value = String(Math.round(a0 * 100));
            if (aoVal) aoVal.textContent = `${Math.round(a0 * 100)} %`;
            aoS.addEventListener("input", () => {
                const pct = parseInt(aoS.value, 10);
                this.setCavityAO(pct / 100);
                if (aoVal) aoVal.textContent = `${pct} %`;
            });
        }
        // Cel-Kontrast (Stufen-Spreizung), Mikro-Struktur (Textur) + Terrain-Nacht-Boden als Live-Regler.
        const mtS = document.getElementById("slider-microtex");
        const mtVal = document.getElementById("slider-microtex-val");
        if (mtS) {
            const m0 =
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.microStrength)
                    ? this.state.atmosphere.microStrength
                    : AnazhRealm.AERIAL.microStrength;
            mtS.value = String(Math.round(m0 * 100));
            if (mtVal) mtVal.textContent = m0.toFixed(2);
            mtS.addEventListener("input", () => {
                const v = parseInt(mtS.value, 10) / 100;
                this.setMicroStrength(v);
                if (mtVal) mtVal.textContent = v.toFixed(2);
            });
        }
        // V18.210 (§1-A2) — der R5-STRUKTUR-BOOST-Slider „Struktur-Tiefe"
        // (Default 1.3, Range 0.5..2.5 via input 50..250, multipliziert das
        // micro-Gewicht für Strukturen — das LEBT, kein V18.65-Knopf-ohne-Loop).
        const stbS = document.getElementById("slider-structureboost");
        const stbVal = document.getElementById("slider-structureboost-val");
        if (stbS) {
            const s0 =
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.r5StructureBoost)
                    ? this.state.atmosphere.r5StructureBoost
                    : AnazhRealm.R5_STRUCTURE_TEXTURE.microBoost;
            stbS.value = String(Math.round(s0 * 100));
            if (stbVal) stbVal.textContent = s0.toFixed(2);
            stbS.addEventListener("input", () => {
                const v = parseInt(stbS.value, 10) / 100;
                this.setStructureBoost(v);
                if (stbVal) stbVal.textContent = v.toFixed(2);
            });
        }
        const esS = document.getElementById("slider-edgesharp");
        const esVal = document.getElementById("slider-edgesharp-val");
        if (esS) {
            const e0 =
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.kantenSchaerfe)
                    ? this.state.atmosphere.kantenSchaerfe
                    : 0;
            esS.value = String(Math.round(e0 * 100));
            if (esVal) esVal.textContent = e0.toFixed(2);
            esS.addEventListener("input", () => {
                const pct = parseInt(esS.value, 10);
                const v = this.setEdgeSharp(pct / 100);
                if (esVal) esVal.textContent = v.toFixed(2);
            });
        }
        const txS = document.getElementById("slider-surftex");
        const txVal = document.getElementById("slider-surftex-val");
        if (txS) {
            const t0 =
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.triplanar)
                    ? this.state.atmosphere.triplanar
                    : 1.0;
            txS.value = String(Math.round(t0 * 100));
            if (txVal) txVal.textContent = `${Math.round(t0 * 100)} %`;
            txS.addEventListener("input", () => {
                const pct = parseInt(txS.value, 10);
                this.setSurfaceTexture(pct / 100);
                if (txVal) txVal.textContent = `${pct} %`;
            });
        }
        const cvS = document.getElementById("slider-colorvar");
        const cvVal = document.getElementById("slider-colorvar-val");
        if (cvS) {
            const c0 =
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.colorVar)
                    ? this.state.atmosphere.colorVar
                    : 1.0;
            cvS.value = String(Math.round(c0 * 100));
            if (cvVal) cvVal.textContent = `${Math.round(c0 * 100)} %`;
            cvS.addEventListener("input", () => {
                const pct = parseInt(cvS.value, 10);
                this.setColorVariation(pct / 100);
                if (cvVal) cvVal.textContent = `${pct} %`;
            });
        }
        // Schatten-Reichweite (Frustum-Halbbreite 80..400 m; kleiner = schärfere Texel) + Schatten-Bias
        // (der Hebel auf das Gesetz `_schattenBias` ×100, 0..3; 1 = das Gesetz). Das Wandern heilt der Light-Space-Snap; diese
        // Regler feilen die Schärfe.
        const srS = document.getElementById("slider-shadowrange");
        const srVal = document.getElementById("slider-shadowrange-val");
        if (srS) {
            const s0 =
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.shadowRange)
                    ? this.state.atmosphere.shadowRange
                    : 300;
            srS.value = String(Math.round(s0));
            if (srVal) srVal.textContent = `${Math.round(s0)} m`;
            srS.addEventListener("input", () => {
                const v = this.setShadowRange(parseInt(srS.value, 10));
                if (srVal) srVal.textContent = `${Math.round(v)} m`;
            });
        }
        const sbS = document.getElementById("slider-shadowbias");
        const sbVal = document.getElementById("slider-shadowbias-val");
        if (sbS) {
            const b0 =
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.shadowBias)
                    ? this.state.atmosphere.shadowBias
                    : 1.0;
            sbS.value = String(Math.round(b0 * 100));
            if (sbVal) sbVal.textContent = b0.toFixed(2);
            sbS.addEventListener("input", () => {
                const v = this.setShadowBias(parseInt(sbS.value, 10) / 100);
                if (sbVal) sbVal.textContent = v.toFixed(2);
            });
        }
    }

    // Begleiter-Stimme-Auswahl aus den SpeechSynthesis-Stimmen: getVoices() lädt async (erst leer),
    // `voiceschanged` füllt nach. Die aktuelle Wahl bleibt erhalten, auch wenn die Stimme noch fehlt.
    _populateCompanionVoiceSelect() {
        if (typeof document === "undefined" || typeof window === "undefined") return;
        if (!("speechSynthesis" in window)) return;
        const sel = document.getElementById("companion-voice");
        if (!sel) return;
        const voices = window.speechSynthesis.getVoices() || [];
        const current = this.state.grok.companionVoice || "";
        sel.textContent = "";
        const def = document.createElement("option");
        def.value = "";
        def.textContent = "Standard (Browser)";
        sel.appendChild(def);
        for (const v of voices) {
            const opt = document.createElement("option");
            opt.value = v.name;
            opt.textContent = `${v.name} (${v.lang})`;
            sel.appendChild(opt);
        }
        sel.value = current;
    }

    // Lädt persistierte Werte aus localStorage und bindet die Inputs an die
    // state-Felder. Name + Voice werden im LLM-System-Prompt bzw. im
    // `companion-say`-Voice-Sync (W11 P4) referenziert.
    identityInitDOM() {
        if (typeof document === "undefined") return;
        // Begleiter-Name: aus localStorage laden, sonst Default „Grok".
        if (typeof localStorage !== "undefined") {
            try {
                const cn = localStorage.getItem("anazh.companion.name");
                if (cn && cn.trim()) this.state.grok.companionName = cn.trim().slice(0, 32);
                const pn = localStorage.getItem("anazh.player.name");
                if (pn && pn.trim()) this.state.player.name = pn.trim().slice(0, 32);
                const cv = localStorage.getItem("anazh.companion.voice");
                if (cv) this.state.grok.companionVoice = cv.slice(0, 80);
            } catch {
                /* ignore */
            }
        }
        const companionInput = document.getElementById("companion-name-input");
        const playerInput = document.getElementById("player-name-input");
        if (companionInput) {
            companionInput.value = this.state.grok.companionName || "Grok";
            companionInput.addEventListener("input", () => {
                const v = (companionInput.value || "").trim().slice(0, 32) || "Grok";
                this.state.grok.companionName = v;
                if (typeof localStorage !== "undefined") {
                    try {
                        localStorage.setItem("anazh.companion.name", v);
                    } catch {
                        /* ignore */
                    }
                }
            });
        }
        if (playerInput) {
            playerInput.value = this.state.player.name || "Schöpfer";
            playerInput.addEventListener("input", () => {
                const v = (playerInput.value || "").trim().slice(0, 32) || "Schöpfer";
                this.state.player.name = v;
                if (typeof localStorage !== "undefined") {
                    try {
                        localStorage.setItem("anazh.player.name", v);
                    } catch {
                        /* ignore */
                    }
                }
            });
        }
        // W11 Phase 4 — Begleiter-Stimme-Auswahl (SpeechSynthesis-Voice).
        // voiceschanged füllt die Liste nach (getVoices ist async; im
        // Headless bleibt sie leer — nur die Default-Option).
        const voiceSel = document.getElementById("companion-voice");
        if (voiceSel && typeof window !== "undefined" && "speechSynthesis" in window) {
            this._populateCompanionVoiceSelect();
            window.speechSynthesis.addEventListener("voiceschanged", () => this._populateCompanionVoiceSelect());
            voiceSel.addEventListener("change", () => {
                const v = (voiceSel.value || "").slice(0, 80);
                this.state.grok.companionVoice = v;
                if (typeof localStorage !== "undefined") {
                    try {
                        localStorage.setItem("anazh.companion.voice", v);
                    } catch {
                        /* ignore */
                    }
                }
            });
        }
    }

    // Welle 6.X.2 B1 (Audit 17.05.2026) + V8.14 Erweiterung — Logbuch-Toggle.
    //
    // **Zwei Schichten** (V8.14):
    // 1. Section-Visibility (`#console-log-section.hidden`): steuert ob das
    //    Logbuch-Section überhaupt im Konsole-Drawer erscheint. Default
    //    sichtbar, Spieler kann es global in Einstellungen ausblenden.
    // 2. Log-Expanded (`#log.hidden`): innerhalb der Section steuert das
    //    Logbuch selbst (das eigentliche Log-Stream). Default eingeklappt
    //    damit Chat im Fokus bleibt. Click auf Konsole-Label expanded.
    //
    // Beide State-Werte synchronisieren über `localStorage`. Der Einstellungen-
    // Toggle steuert „expanded" (sync mit Konsole-Toggle). Die Section bleibt
    // immer sichtbar — Spieler kann sie im DOM finden und expandieren.
    logbookInitDOM() {
        if (typeof document === "undefined") return;
        let expanded = false;
        if (typeof localStorage !== "undefined") {
            const raw = localStorage.getItem("anazh.logbookVisible");
            if (raw === "1" || raw === "true") expanded = true;
        }
        this.state.logbookVisible = expanded;
        const section = document.getElementById("console-log-section");
        const logEl = document.getElementById("log");
        const cb = document.getElementById("logbook-toggle");
        const inlineBtn = document.getElementById("console-log-toggle");
        // Section bleibt sichtbar; nur das Log selbst togglet (V8.14 Vision).
        if (section) section.hidden = false;
        const applyExpanded = (value) => {
            this.state.logbookVisible = !!value;
            if (logEl) logEl.hidden = !value;
            if (inlineBtn) inlineBtn.setAttribute("aria-expanded", value ? "true" : "false");
            if (cb) cb.checked = !!value;
            if (typeof localStorage !== "undefined") {
                try {
                    localStorage.setItem("anazh.logbookVisible", value ? "1" : "0");
                } catch {
                    /* ignore */
                }
            }
        };
        applyExpanded(expanded);
        if (cb) {
            cb.addEventListener("change", () => applyExpanded(!!cb.checked));
        }
        if (inlineBtn) {
            inlineBtn.addEventListener("click", () => {
                applyExpanded(!this.state.logbookVisible);
            });
        }
    }

    // Keybindings-UI: je Aktion Label, aktuelle Taste und Pad-Knopf, je ein „Ändern"-Button → Rebind-Capture (die nächste
    // Taste, Maus-Taste oder der nächste Pad-Knopf bindet, leib.K5); Reset stellt die Defaults beider Schichten her.
    keybindingsInitDOM() {
        if (typeof document === "undefined") return;
        const section = document.getElementById("keybindings-section");
        if (!section) return;
        const list = section.querySelector("#keybindings-list");
        const resetBtn = section.querySelector("#keybindings-reset");
        if (!list) return;
        list.innerHTML = "";
        const aktionen = new Set([...AnazhRealm.KEYBINDING_ACTIONS, ...Object.keys(AnazhRealm.PAD_BELEGUNG)]);
        for (const action of aktionen) {
            const row = document.createElement("div");
            row.className = "keybind-row";
            row.dataset.action = action;
            const label = document.createElement("span");
            label.className = "keybind-label";
            label.textContent = AnazhRealm.KEYBINDING_LABELS[action] || action;
            row.appendChild(label);
            for (const art of ["keybind-rebind", "keybind-rebind keybind-pad"]) {
                const pad = art !== "keybind-rebind";
                if (!pad && !(action in AnazhRealm.DEFAULT_KEYBINDINGS)) continue;
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = art;
                btn.dataset[pad ? "pad" : "action"] = action;
                btn.addEventListener("click", () => {
                    if (this.state.keybindRebind && this.state.keybindRebind.action === action) {
                        this.cancelKeybindRebind();
                    } else {
                        this.beginKeybindRebind(action);
                    }
                });
                row.appendChild(btn);
            }
            list.appendChild(row);
        }
        if (resetBtn) {
            resetBtn.addEventListener("click", () => {
                this.resetKeybindings();
            });
        }
        this._renderKeybindingsUI();
    }

    // Pretty-Format eines Codes für Anzeige im Button. „KeyF" → „F",
    // „Mouse0" → „Linke Maustaste", „Space" → „Leertaste", etc.
    _formatBindingCode(code) {
        if (!code) return "—";
        if (code === "Mouse0") return "Linke Maustaste";
        if (code === "Mouse1") return "Mittlere Maustaste";
        if (code === "Mouse2") return "Rechte Maustaste";
        if (code === "Space") return "Leertaste";
        if (code === "Tab") return "Tab";
        if (code === "Escape") return "Esc";
        if (code.startsWith("Key")) return code.slice(3);
        if (code.startsWith("Digit")) return code.slice(5);
        if (code.startsWith("Arrow"))
            return "↑↓←→".charAt(["Up", "Down", "Left", "Right"].indexOf(code.slice(5))) || code;
        if (/^Pad\d+$/.test(code)) return "Pad " + (AnazhRealm.PAD_KNOPF_NAMEN[+code.slice(3)] || code.slice(3));
        return code;
    }

    _renderKeybindingsUI() {
        if (typeof document === "undefined" || !this.state.keybindings) return;
        const section = document.getElementById("keybindings-section");
        if (!section) return;
        const rb = this.state.keybindRebind;
        for (const btn of section.querySelectorAll("button.keybind-rebind")) {
            const action = btn.dataset.action || btn.dataset.pad;
            if (rb && rb.action === action) {
                btn.textContent = btn.dataset.pad ? "Drücke Knopf…" : "Drücke Taste…";
                btn.classList.add("rebinding");
            } else {
                btn.textContent = this._formatBindingCode(
                    (btn.dataset.pad ? this.state.padBelegung : this.state.keybindings)[action]
                );
                btn.classList.remove("rebinding");
            }
        }
    }

    cameraModeInitDOM() {
        const toggle = document.getElementById("camera-mode-toggle");
        if (!toggle) return;
        const stored = (() => {
            try {
                return localStorage.getItem("anazhRealmCameraMode");
            } catch {
                return null;
            }
        })();
        const initial = stored === "third" ? "third" : "first";
        this.setCameraMode(initial);
        toggle.addEventListener("click", () => {
            this.setCameraMode(this.state.cameraMode === "third" ? "first" : "third");
        });
    }

    playerSoulInitDOM() {
        const select = document.getElementById("player-soul-select");
        if (!select) return;
        this._refreshSoulSelect();
        select.addEventListener("change", () => {
            const v = select.value;
            // V17.74 Welle 1b — ein role:"soul"-Bauplan (noch kein registrierter Soul) → VERKÖRPERN
            // (embodyBlueprint formt ihn, zahlt pfad/frieden); eine Built-in/Custom-Seele → frei tragen.
            const bp = this.state.blueprints && this.state.blueprints[v];
            const isSoulBlueprint =
                bp &&
                bp.role === "soul" &&
                !(this.playerSoulDefs[v] || (this.state.customSouls && this.state.customSouls[v]));
            if (isSoulBlueprint) {
                const result = this.embodyBlueprint(v);
                if (!result.ok) {
                    if (result.reason === "not_enough_material") {
                        const missingStr = Object.entries(result.missing || {})
                            .map(([m, n]) => `${n}× ${m}`)
                            .join(", ");
                        this.log(
                            `Avatar „${bp.label || v}" formen — es fehlt ${missingStr || "Material"} (⚒ Werkstatt).`,
                            "ERROR"
                        );
                    } else {
                        this.log(`Verkörpern fehlgeschlagen: ${result.reason}`, "ERROR");
                    }
                    // V17.75 — der Fehlschlag (z.B. kein Material) → das Select auf die WIRKLICHE Seele
                    // zurücksetzen (sonst zeigt es den Wächter, während der Avatar der alte bleibt — der Bug).
                    select.value = this.state.player.soul;
                } else {
                    this._refreshSoulSelect(); // den neuen customSoul aufnehmen + selektieren
                }
            } else {
                this.applyPlayerSoul(v);
            }
        });
        // Status-Bar mit Default beschriften, falls vorhanden.
        const status = document.getElementById("status-soul");
        if (status) {
            const cur = this._getSoulDef(this.state.player.soul || "human");
            status.textContent = (cur && cur.label) || "—";
        }
        // Equipment-Sektion initial rendern (die Stats zeigt das Spec-Sheet `_ichBuildSpecSheet`).
        if (typeof this.renderPlayerEquipUI === "function") this.renderPlayerEquipUI();
    }

    // Equipment-UI im Ich-Drawer (#player-equip).
    renderPlayerEquipUI() {
        if (typeof document === "undefined") return;
        const container = document.getElementById("player-equip");
        if (!container) return;
        container.innerHTML = "";
        // Nur die Schnell-Trünke (Gebrauch, kein Crafting; leer = unsichtbar): das gehaltene Gerät wechselt
        // über Hotbar/Rezeptbuch (wieldBlueprint), die Rüstung im Slot (_renderInventoryEquip), die
        // Intent-Akte leben in der Werkstatt — kein Parallel-Pfad.
        this._equipAppendConsumablesSection(container);
    }

    // Teilt eigene Baupläne in Rüstung / Waffe / Markier-Kandidat. Kandidat bleibt auch ein schon
    // markierter Bauplan (roleManual) — sonst verschwände er und ließe sich nicht mehr umwidmen.
    _equipPartitionEquipBlueprints() {
        const armorBlueprints = [];
        const weaponBlueprints = [];
        const candidateBlueprints = [];
        for (const name of Object.keys(this.state.blueprints || {})) {
            const bp = this.state.blueprints[name];
            if (!bp) continue;
            // V17.74 Welle 1b — Rüstung wird nach ROLLE gelistet (Built-in-Bibliothek INKLUSIVE) → die
            // GEBRAUCHS-Fläche erkennt eine craftbare Beispiel-Rüstung (ruestung_brustpanzer), nicht nur
            // eigene Baupläne. Andere Built-ins (Strukturen) sind keine Markier-/Tragen-Kandidaten.
            if (bp.role === "armor") armorBlueprints.push(name);
            else if (bp.builtIn) continue;
            else if (bp.role === "weapon") weaponBlueprints.push(name);
            else candidateBlueprints.push(name);
        }
        return { armorBlueprints, weaponBlueprints, candidateBlueprints };
    }

    // Nur die DSL-TABELLEN-Konsumables (kein Bauplan → nicht im Rezeptbuch). Trank-Baupläne
    // (role:consumable) braut + trinkt man im Rezeptbuch (renderRecipeBook, kind=drink) — kein Duplikat.
    _equipAppendConsumablesSection(container) {
        const tableConsumables = Object.keys(this.state.consumables || {});
        if (tableConsumables.length === 0) return;
        const consumableHeader = document.createElement("div");
        consumableHeader.className = "equip-mark-header";
        consumableHeader.textContent = "Schnell-Trünke (Tabelle):";
        container.appendChild(consumableHeader);
        for (const name of tableConsumables) {
            const c = this.state.consumables[name];
            const row = document.createElement("div");
            row.className = "equip-mark-row";
            const label = document.createElement("span");
            label.className = "equip-mark-label";
            label.textContent = `${c.label || name} (${c.durationSeconds} s, Tabelle)`;
            row.appendChild(label);
            const drinkBtn = document.createElement("button");
            drinkBtn.type = "button";
            drinkBtn.textContent = "Trinken";
            drinkBtn.addEventListener("click", () => {
                const result = this.activateConsumable(name);
                if (!result.ok) this.log(`activateConsumable: ${result.reason}`, "ERROR");
            });
            row.appendChild(drinkBtn);
            container.appendChild(row);
        }
    }

    // Welle 6.D Etappe 1.6 — Soul-Select neu befüllen (Built-ins + Custom).
    // Wird sowohl beim Init aufgerufen als auch nach jedem define_soul, damit
    // neue Custom-Seelen ohne Reload im Dropdown erscheinen.
    _refreshSoulSelect() {
        if (typeof document === "undefined") return;
        const select = document.getElementById("player-soul-select");
        if (!select) return;
        const previous = select.value;
        select.innerHTML = "";
        // Die primäre Körper-Sicht ist das STUDIO-BUCH: zuoberst die „Studio-Wesen"-Gruppe (mensch +
        // wolf/fox/bear/deer). Die Alt-Doppel (koerper_*, donorOnly) bleiben als Werte/Aliase funktional
        // (der Tier-Eintrag trägt den koerper_<tier>-Wert, derselbe embody-Pfad), aber ohne eigene Zeile.
        const seen = new Set();
        const addOpt = (parent, value, text, title) => {
            const opt = document.createElement("option");
            opt.value = value;
            opt.textContent = text;
            if (title) opt.title = title;
            parent.appendChild(opt);
            seen.add(value);
            return opt;
        };
        const gStudio = document.createElement("optgroup");
        gStudio.label = "Studio-Wesen";
        // (1) mensch — die gegebene Identität (koerperstudio); die Prägung des Mensch-Rezepts (der Übergabe-Kanal, ws.studioOv)
        // ist SICHTBAR am Eintrag (✦ Studio-Gestalt).
        const ueK = this._studioPraegung(AnazhRealm.KOERPER_HOST_RECIPE);
        addOpt(
            gStudio,
            "human",
            ueK ? "mensch ✦ Studio-Gestalt" : "mensch",
            "koerperstudio — dein Menschen-Körper" + (ueK ? " (trägt die Live-Übergabe aus dem Studio)" : "")
        );
        // (2) die vier Gattungen des tetrapoda-Buchs, mit ihren Studio-Namen. Verkörpert
        // (bp_koerper_<tier> als customSoul) → freier Wechsel; sonst der embody-Wert
        // (koerper_<tier>) mit Kosten-Marker — derselbe change-Handler wie immer.
        const SM = AnazhRealm.TETRAPODA_SOUL_MAP;
        for (const soulKey of Object.keys(SM)) {
            const studioName = SM[soulKey]; // deer · wolf · fox · bear
            const bpName = `koerper_${soulKey}`;
            if (this.state.customSouls && this.state.customSouls[`bp_${bpName}`]) {
                addOpt(
                    gStudio,
                    `bp_${bpName}`,
                    `${studioName} ✦`,
                    `tetrapoda — ${studioName} (verkörpert, freier Wechsel)`
                );
            } else if (this.state.blueprints && this.state.blueprints[bpName]) {
                const opt = addOpt(gStudio, bpName, studioName + " ⚒" + this._makeActCostSuffix(bpName));
                opt.title = this._blueprintCostTooltip(bpName);
            }
        }
        select.appendChild(gStudio);
        for (const key of Object.keys(this.playerSoulDefs)) {
            if (seen.has(key)) continue;
            addOpt(select, key, this.playerSoulDefs[key].label);
        }
        if (this.state.customSouls) {
            for (const key of Object.keys(this.state.customSouls)) {
                if (seen.has(key)) continue;
                addOpt(select, key, this.state.customSouls[key].label + " ✦");
            }
        }
        // Listet auch noch nicht verkörperte role:"soul"-Baupläne (inkl. Built-in-Bibliothek) zum
        // Verkörpern; schon verkörperte (bp_<name> als customSoul) stehen oben — kein Doppel.
        // ⚒ = Bauplan-Avatar. Alt-Doppel (donorOnly) erscheinen hier nicht.
        const blu = this.state.blueprints || {};
        for (const name of Object.keys(blu)) {
            const bp = blu[name];
            if (!bp || bp.role !== "soul" || !Array.isArray(bp.parts) || !bp.parts.length) continue;
            if (seen.has(name) || bp.donorOnly) continue;
            if (this.state.customSouls && this.state.customSouls[`bp_${name}`]) continue; // schon verkörpert
            const opt = addOpt(select, name, (bp.label || name) + " ⚒" + this._makeActCostSuffix(name));
            opt.title = this._blueprintCostTooltip(name);
        }
        const desired = previous || this.state.player.soul || "human";
        // Wenn die zuvor gewählte Option weg ist (z. B. Custom gelöscht),
        // fall back auf die aktuell aktive Seele.
        if ([...select.options].some((o) => o.value === desired)) {
            select.value = desired;
        } else if (this.state.player.soul) {
            select.value = this.state.player.soul;
        }
    }

    // WebGPU-Gate-Screen: NodeMaterials/TSL rendern nur auf WebGPURenderer; ein WebGL2-Fallback wäre
    // ein voller Parallel-Render-Pfad → KEIN Fallback, sondern eine gestaltete Erklärung. Reines DOM
    // (kein innerHTML → CSP-rein), headless-sicher; feuert nur ohne navigator.gpu.
    _showWebGPUGate() {
        if (typeof document === "undefined" || !document.body) return;
        this._ladeschirmWeg(); // das Tor ist die Antwort — der Ladeschirm läge über ihm
        try {
            if (document.getElementById("webgpu-gate")) return;
            const overlay = document.createElement("div");
            overlay.id = "webgpu-gate";
            overlay.style.cssText =
                "position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;" +
                "background:radial-gradient(circle at 50% 28%,#2a1810,#120804 78%);" +
                "font-family:'Georgia','Times New Roman',serif;color:#f0dcc0;padding:24px;box-sizing:border-box;";
            const card = document.createElement("div");
            card.style.cssText =
                "max-width:560px;width:100%;background:#1d120b;border:1px solid #6b4326;border-radius:14px;" +
                "padding:34px 36px;box-shadow:0 18px 60px rgba(0,0,0,.6);line-height:1.55;";
            const title = document.createElement("h1");
            title.textContent = "AnazhRealm erwacht in WebGPU";
            title.style.cssText = "margin:0 0 6px;font-size:24px;color:#ffd9a8;font-weight:600;letter-spacing:.3px;";
            const lead = document.createElement("p");
            lead.textContent =
                "Diese Welt rendert mit WebGPU — der modernen Grafik-Schnittstelle des Webs. " +
                "Dein Browser meldet sie noch nicht. Das ist kein Fehler in der Welt, nur eine Schwelle.";
            lead.style.cssText = "margin:0 0 16px;font-size:16px;color:#e8d2b4;";
            const how = document.createElement("p");
            how.textContent = "So trittst du ein:";
            how.style.cssText = "margin:0 0 8px;font-size:15px;color:#ffce96;font-weight:600;";
            const list = document.createElement("ul");
            list.style.cssText = "margin:0 0 18px;padding-left:20px;font-size:15px;color:#e2cba8;";
            const rows = [
                "Chrome oder Edge ab Version 113 (oder neuer) öffnen.",
                "Safari 18+ auf macOS/iOS — WebGPU ist standardmäßig dabei.",
                "Firefox: about:config → dom.webgpu.enabled auf true setzen.",
            ];
            for (const t of rows) {
                const li = document.createElement("li");
                li.textContent = t;
                li.style.cssText = "margin:4px 0;";
                list.appendChild(li);
            }
            const link = document.createElement("a");
            link.href = "https://caniuse.com/webgpu";
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "WebGPU-Browser-Unterstützung ansehen →";
            link.style.cssText =
                "display:inline-block;color:#ff9a52;text-decoration:none;font-size:14px;border-bottom:1px solid #ff9a52;";
            const foot = document.createElement("p");
            foot.textContent =
                "Sobald dein Browser WebGPU spricht, lädst du diese Seite einfach neu — die Welt ist dann da.";
            foot.style.cssText = "margin:18px 0 0;font-size:13px;color:#b89a78;font-style:italic;";
            card.appendChild(title);
            card.appendChild(lead);
            card.appendChild(how);
            card.appendChild(list);
            card.appendChild(link);
            card.appendChild(foot);
            overlay.appendChild(card);
            document.body.appendChild(overlay);
        } catch (_e) {
            /* DOM nicht verfügbar (sehr alte Browser) — der throw in init() trägt die Meldung */
        }
    }

    // Ist eine Schublade offen? Die DOM-Wahrheit (ein sichtbarer .drawer), nicht ein Merker — der Werkstatt-, Hof- oder
    // Bibliotheks-Drawer gehört der UI, nie der Welt (Welle L, Q9). `name` fragt nach EINER Schublade.
    _uiSchubladeOffen(name) {
        if (typeof document === "undefined" || typeof document.querySelector !== "function") return false;
        return !!document.querySelector(`.drawer[data-drawer${name ? `="${name}"` : ""}]:not([hidden])`);
    }

    // DER EINE HUD-SCHREIBER (K2 Belegung, 21.10.): ein Wert, der sich nicht ändert, berührt das DOM nie. Blink ersetzt
    // bei jedem textContent den Text-Knoten, jedes setAttribute invalidiert auch bei gleichem Wert, und `body:has(…)`
    // prüft jede Mutation — die Takt-Schreiber (Status-Leiste 2,5 Hz, Lebens-HUD und Uhr 10 Hz) trugen so Stil, Layout
    // und Paint in jedes vierte Bild (Radeon, Mess-Wiese stehend). `attr`: ein Attribut-Name, "html" = innerHTML, sonst
    // textContent.
    _hudSchreib(el, wert, attr) {
        if (!el) return;
        const s = String(wert);
        if (attr === "html") {
            if (el.innerHTML !== s) el.innerHTML = s;
        } else if (attr) {
            if (el.getAttribute(attr) !== s) el.setAttribute(attr, s);
        } else if (el.textContent !== s) el.textContent = s;
    }

    // Eine Schublade öffnet: der Zeiger wird frei (die Klicks gehören der Schublade) und ein gehaltenes Mahlen endet.
    _uiZeigerFrei() {
        this.state.verbTafel.gehalten.break = false;
        if (typeof document !== "undefined" && document.pointerLockElement && document.exitPointerLock) {
            try {
                document.exitPointerLock();
            } catch (_e) {
                /* Policy: kein Lock, nichts zu lösen */
            }
        }
    }

    // Liegt der Fokus auf einem bedienbaren Element der UI — Knopf, Verweis, Auswahl, Faltkopf, eine Rolle „button" oder
    // ein Element mit Tab-Platz? Dann gehört ihm Enter. Die Welt (body, die Leinwand) ist es nie.
    _uiBedienFokus(el) {
        if (!el || typeof el.closest !== "function" || typeof document === "undefined") return false;
        if (el === document.body || el === document.documentElement) return false;
        const lw = this.state.renderer && this.state.renderer.domElement;
        if (lw && el === lw) return false;
        return !!el.closest('button, a[href], select, summary, [role="button"], [tabindex]:not([tabindex="-1"])');
    }

    // DAS GESPRÄCH ÖFFNEN (die Chat-Taste, L3): der Zeiger wird frei, jede gehaltene Taste fällt (W lief sonst weiter,
    // während der Spieler tippt), der Fokus liegt im Feld. true, wenn das Feld den Fokus hat.
    _chatOeffnen() {
        if (typeof document === "undefined") return false;
        const ci = document.getElementById("chat-input");
        if (!ci) return false;
        this._uiZeigerFrei();
        this._alleTastenLos();
        // Wer spricht, sieht das Feld: ein mit H ausgeblendetes HUD kommt zurück.
        if (document.body) document.body.classList.remove("hud-hidden");
        ci.focus();
        return document.activeElement === ci;
    }

    // DAS GESPRÄCH SCHLIESSEN (Enter nach dem Senden, Esc): das Feld gibt den Fokus ab — W tippt nie mehr hinein — und der
    // Zeiger kehrt in die Welt, wenn keine Schublade und kein Inventar offen ist (die Taste ist die Geste, die das Spiel
    // für den Zeiger braucht; eine Absage der Seite ist kein Fehler, der Klick fängt ihn wie beim ersten Mal).
    _chatSchliessen() {
        if (typeof document === "undefined") return;
        const ci = document.getElementById("chat-input");
        if (ci && document.activeElement === ci) ci.blur();
        if (this.state.inventoryOpen || this._uiSchubladeOffen() || this._portalOverlay) return;
        const canvas = this.state.renderer && this.state.renderer.domElement;
        if (!canvas || typeof canvas.requestPointerLock !== "function" || document.pointerLockElement === canvas)
            return;
        try {
            const p = canvas.requestPointerLock();
            if (p && typeof p.catch === "function") p.catch(() => {});
        } catch (_e) {
            /* Policy: kein Lock ohne Geste — der nächste Klick fängt den Zeiger */
        }
    }

    // DIE UNTERTITEL (spielgang.K4): EIN Klang-Ereignis, zwei Leser — der Ton und die Zeile. Jeder Chokepoint des
    // Klang-Gesetzes ruft hier in dem Augenblick, in dem er seine Quelle startet (der Ruf `_tierRuf`, der Substanz-Klang
    // `_substanzKlang`, der Schritt `_schrittKlangEreignis`, die Stimmen der Umwelt-Mischung, die Fahrt, die Musik), mit dem
    // Namen aus dem Gesetz; der Satz steht in der EINEN Tafel `UNTERTITEL` (ein Name ohne Satz ist laut, `_bruchMelden`).
    // Dieselbe Zeile (art · name · wer) frischt auf statt zu stapeln, die Richtung kommt aus dem Panorama (‹ links · › rechts).
    // Nur, wenn der Spieler sie gewählt hat (Einstellungen › Untertitel, `state.untertitel`); `state._untertitel` zählt die
    // Zeilen (headless messbar, gate:klang-zensus Ü).
    _untertitel(art, name, wer, pan) {
        return this._untertitelZeile(art, [[name, wer, pan]], `${art}:${name}:${wer || ""}`);
    }

    // Die Stimmen der Klang-Welt: jede, die der Graph des Gesetzes (`umweltGraph`) gerade spielt, steht in der EINEN
    // Umgebungs-Zeile, aufgefrischt mit jeder Mischung, die er anwendet (an einem Wasserfall spielen mehr Stimmen, als
    // Zeilen Platz haben).
    _untertitelStimmen(graph) {
        if (!this.state.untertitel) return;
        const an = graph.zensus().filter((v) => v.an);
        if (an.length)
            this._untertitelZeile(
                "stimme",
                an.map((v) => [v.name, null, v.pan]),
                "stimme"
            );
    }

    // Die EINE Schreib-Stelle der Untertitel: je Teil (Name · wer · Panorama) der Satz der Tafel mit seiner Richtung, die
    // Teile einer Zeile mit „·" verbunden.
    _untertitelZeile(art, teile, schl) {
        const st = this.state;
        if (!st.untertitel || typeof document === "undefined") return false;
        const T = AnazhRealm.UNTERTITEL;
        const saetze = [];
        for (const [name, wer, pan] of teile) {
            const satz = T[art] && T[art][name];
            if (!satz) return void this._bruchMelden(`UNTERTITEL: kein Satz für ${art}:${name}`);
            const links = pan < -T.panSchwelle ? "‹ " : "";
            saetze.push(links + satz.replace("{wer}", wer || "") + (pan > T.panSchwelle ? " ›" : ""));
        }
        const box = document.getElementById("untertitel");
        if (!box) return false;
        const buch = st._untertitel || (st._untertitel = { zeilen: 0, je: {}, offen: new Map() });
        const text = saetze.join(" · ");
        let z = buch.offen.get(schl);
        if (!z) {
            if (buch.offen.size >= T.maxZeilen) this._untertitelWeg(buch.offen.keys().next().value);
            z = { el: document.createElement("div") };
            z.el.className = "untertitel-zeile";
            box.appendChild(z.el);
            buch.offen.set(schl, z);
        }
        this._hudSchreib(z.el, text);
        if (z.el.style.opacity) z.el.style.opacity = "";
        z.bis = performance.now() + T.sek * 1000;
        box.hidden = false;
        buch.zeilen++;
        buch.je[art] = (buch.je[art] || 0) + 1;
        return true;
    }

    _untertitelWeg(schl) {
        const buch = this.state._untertitel;
        const z = buch.offen.get(schl);
        if (z) z.el.remove();
        buch.offen.delete(schl);
        if (!buch.offen.size) document.getElementById("untertitel").hidden = true;
    }

    // Der Ablauf im Takt des Lebens-HUD (10 Hz): eine Zeile, die nicht aufgefrischt wurde, blendet in ihrer letzten
    // halben Sekunde aus und fällt.
    _untertitelTakt() {
        const buch = this.state._untertitel;
        if (!buch || !buch.offen.size) return;
        const jetzt = performance.now();
        for (const [schl, z] of buch.offen) {
            const rest = z.bis - jetzt;
            const deck = rest < 500 ? (rest / 500).toFixed(2) : "";
            if (rest <= 0) this._untertitelWeg(schl);
            else if (z.el.style.opacity !== deck) z.el.style.opacity = deck;
        }
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_werkstatt_hud]);

// ===== ATLAS · Werkstatt/hud — Außen-Konstanten =====
// DIE GERÄTE-GRENZEN (G1): die Grenzen je Shader-Stufe, die jedes Gerät der Seite in der Höhe seines Adapters verlangt
// (`_rendererGeraet` → `requiredLimits`) — die WebGPU-Standards (16 Texturen · 16 Sampler · 8 Speicher-Puffer · 4 Speicher-
// Texturen · 12 Uniform-Puffer) gelten sonst auch auf einem Adapter, der mehr trägt (Radeon 890M: 48 · 16 · 16 · 8 · 12).
AnazhRealm.GERAET_GRENZEN = Object.freeze([
    "maxSampledTexturesPerShaderStage",
    "maxSamplersPerShaderStage",
    "maxStorageBuffersPerShaderStage",
    "maxStorageTexturesPerShaderStage",
    "maxUniformBuffersPerShaderStage",
]);

// Was jede Emotion in der WELT bewirkt — die Legende, die das Aura-Rätsel löst (der
// Schöpfer: "verstehe nicht, welche Farbe welche Emotion"). Aus den echten Welt-Effekten
// (_applyEmotionWorldEffects): der Spieler liest, was sein Gefühl tut, statt Farben zu raten.
AnazhRealm.EMOTION_WIRKT = Object.freeze({
    joy: "wärmt den Himmel golden",
    awe: "zieht magisches Licht heran",
    sorrow: "lässt Regen fallen",
    hope: "klärt den Himmel, erhellt die Wesen",
    peace: "besänftigt + verlangsamt die Wesen",
    chaos: "entfesselt die Wesen, treibt alles an",
});

// DIE UNTERTITEL-TAFEL (spielgang.K4): je Ereignis-Art des Klang-Gesetzes ein Satz je Name — die Stimmen
// (klang:UMWELT.stimmen), der Ruf je Stimmung (klang:UMWELT.tier.rufProMin), der Substanz-Klang je Art (klang SUBSTANZ), der
// Schritt je Stoff-Klasse (Schritt · Landung), die Fahrt (Motor · Rollen) und die Musik; {wer} setzt der Chokepoint ein.
// Die Klang-Linse hält die Tafel vollständig gegen das Gesetz (gate:klang-zensus Ü).
AnazhRealm.UNTERTITEL = Object.freeze({
    stimme: {
        wind: "Wind weht",
        laub: "Laub rauscht",
        ufer: "Wellen am Ufer",
        fluss: "Wasser fließt",
        fall: "Wasserfall rauscht",
        regen: "Regen fällt",
        glut: "Feuer knistert",
        vogel: "Vögel singen",
        grille: "Grillen zirpen",
    },
    ruf: {
        freude: "{wer} ruft freudig",
        ruhe: "{wer} ruft leise",
        trauer: "{wer} klagt",
        furcht: "{wer} schreit ängstlich",
    },
    substanz: {
        treffer: "Treffer: {wer}",
        singen: "Eine Form singt",
        abschied: "Eine Form verklingt",
        wasser: "Wasser gluckert",
        inventar: "Ding klingt",
    },
    schritt: { schritt: "Schritte auf {wer}", landung: "Landung auf {wer}" },
    fahrt: { motor: "Motor brummt", rollen: "Wagen rollt" },
    musik: { lofi: "♪ Musik" },
    panSchwelle: 0.35, // |pan| darüber zeigt die Richtung
    maxZeilen: 4, // so viele Zeilen höchstens; die älteste weicht
    sek: 2.5, // so lange steht eine Zeile nach ihrer letzten Auffrischung
});
