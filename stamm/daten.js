class AnazhRealm_daten {
    // ===== ATLAS · Daten — frozen Welt-Daten · Kreaturen-Tafeln · Wetter-Tafeln · Gelände-Konstanten =====
    // === Kreaturen-Aufträge ===
    // Mutation NUR über `assignCreatureTask` — wer userData.task direkt setzt, muss
    // `_refreshCreatureTaskAura` selbst rufen. Kreatur-Befehle stehen in NON_BROADCASTABLE_OPS:
    // „die nächste Kreatur“ meinte beim Empfänger eine andere.

    // ### Welt-Lebendigkeit ###
    // Welle 6.G3 — Wetter-Tint, zusammen mit Tag-Nacht-Tint kombiniert (Multiply-Blend). Er ist die SONNE der Wetter-Zeile
    // (WEATHER_FIELD ← phyto-core WX_GESETZ): der Himmel trägt sie selbst (skyMul = sun), das Richtlicht dieselbe Rechnung wie
    // das Labor (lightMul = WX_LICHT.sockel + WX_LICHT.sonne · sun). K2: hier stand die alte Sonnen-Spalte als zweite Tafel
    // (skyMul 1,0/0,55/0,42) — der Sturm des Gesetzes (0,15) erreichte den Himmel nie.
    static get WEATHER_TINTS() {
        const F = AnazhRealm.WEATHER_FIELD;
        const L = globalThis.__phytoCore.WX_LICHT;
        if (!L || ![L.sockel, L.sonne].every(Number.isFinite))
            throw new Error("phyto-core fehlt: WX_LICHT (das Wetter-Licht der Welt)");
        const zeile = (f) => Object.freeze({ skyMul: f.sun, lightMul: L.sockel + L.sonne * f.sun });
        return this._einmal(
            "WEATHER_TINTS",
            Object.freeze(Object.fromEntries(Object.keys(F).map((w) => [w, zeile(F[w])])))
        );
    }
    // Wetter = INTENSITÄTS-ACHSE, kein Binär-Paar: jeder wetter-abhängige Skalar lerpt über sie
    // (`_weatherBlendedValue`); ein neues Wort = EIN Tabellen-Eintrag, alle Leser erben es. stormy
    // extrapoliert über rainy — [0,1]-Shader clampen lokal. Nässe-Frage nur über `_weatherIsWet`.
    // Die Bedeckung des Himmels liest die Achse (cloudCover = 0,12 + 0,78 · I): Nebel 0,47, bewölkt 0,74; nass erst ab 1.
    static get WEATHER_INTENSITY() {
        return this._einmal(
            "WEATHER_INTENSITY",
            Object.freeze({ sunny: 0, foggy: 0.45, cloudy: 0.8, rainy: 1, stormy: 1.35 })
        );
    }
    // DIE WORTE DER WELT sind die Zeilen des Wetter-Gesetzes (phyto-core WX_GESETZ, wetter.K1): sunny = klar · cloudy =
    // bewoelkt · foggy = nebel · rainy = regen · stormy = sturm — alle fünf Zeilen, die das Labor kennt. Leser: WEATHER_FIELD,
    // die Front am Ort (`_wetterAmOrt` liest die Zeile des Kerns und spricht ihr Wort, `WETTER_WORT`).
    static get WETTER_ZEILE() {
        return this._einmal(
            "WETTER_ZEILE",
            Object.freeze({ sunny: "klar", cloudy: "bewoelkt", foggy: "nebel", rainy: "regen", stormy: "sturm" })
        );
    }
    static get WETTER_WORT() {
        const Z = AnazhRealm.WETTER_ZEILE;
        return this._einmal("WETTER_WORT", Object.freeze(Object.fromEntries(Object.keys(Z).map((w) => [Z[w], w]))));
    }
    // Wetter als 5-Kanal-Feld {fog,sun,grey,wind,rain} je Wort; der EINE LOOK-Leser `_weatherFieldFor(w)`
    // interpoliert transition-aware (wie `_weatherBlendedValue`). grey entsättigt NUR das Licht, nie den
    // Himmel; wind = Böen-Amplitude; fog multipliziert fogMult; rain/sun Reserve.
    // `_weatherBlendedValue` bleibt für die Nicht-LOOK-Skalare. Die Zahlen SIND das Wetter-Gesetz des Kerns (phyto-core
    // WX_GESETZ, je Wort seine Zeile `WETTER_ZEILE`, das Labor liest dieselbe Tafel) — fail-closed, kein Zahlen-Zwilling (K2:
    // der Sturm hatte hier Sonne 0,42 gegen 0,15 im Gesetz).
    static get WEATHER_FIELD() {
        const WX = globalThis.__phytoCore.WX_GESETZ;
        const zeile = (w) => {
            const r = WX[w];
            if (!r || ![r.fog, r.sun, r.grey, r.wind, r.rain].every(Number.isFinite))
                throw new Error("phyto-core fehlt: WX_GESETZ." + w + " (das Wetter-Feld der Welt)");
            return Object.freeze({ fog: r.fog, sun: r.sun, grey: r.grey, wind: r.wind, rain: r.rain });
        };
        const Z = AnazhRealm.WETTER_ZEILE;
        return this._einmal(
            "WEATHER_FIELD",
            Object.freeze(Object.fromEntries(Object.keys(Z).map((w) => [w, zeile(Z[w])])))
        );
    }
    // V6 — grey→Licht-Entsättigung: der grey-Kanal zieht das RICHTLICHT so weit
    // Richtung neutral-grau (Luminanz-erhaltend). ~0.7 → stormy dämpft die
    // Licht-Sättigung deutlich, ohne die Farbe ganz zu töten. Der HIMMEL bleibt.
    static get WEATHER_GREY_K() {
        return 0.7;
    }
    // V6 — Wind-Amplitude: uWindStrength = field.wind · AMP. stormy (wind 1.0)
    // → 0.55 (kräftige Böe), sunny (wind 0.06) → 0.033 (ruhig). Browser-tunbar.
    static get WEATHER_WIND_AMP() {
        return 0.55;
    }
    // DIE WANDERNDE BÖE — EINE Quelle für Auge und Ohr: gust = sin(omega·t − k·dot(xz, windDir))·amp + mitte
    // (λ = 2π/k ≈ 164 m, Periode 2π/omega ≈ 15,7 s). `_windSwayOffset` (Gras/Streu/Laub im Shader) und `_windAt`
    // (der EINE Wind am Ort: Wasser, Regen, Tuch, Rauch, Wagen, Ohr, Nase) lesen dieselben Zahlen.
    static get WIND_BOE() {
        return globalThis.__phytoCore.WIND_GESETZ.boe; // die Zahlen leben im Wind-Gesetz des Kerns (K19) — das Labor liest sie dort
    }
    static get WEATHER_TRANSITION_DURATION_MS() {
        return 45000; // 45 s — sanft, nicht zu lang
    }
    static get DAY_LENGTH_MIN_MINUTES() {
        return 1; // Slider-Minimum
    }
    static get DAY_LENGTH_MAX_MINUTES() {
        return 60; // Slider-Maximum
    }
    // DER TAG TRÄGT EINE SZENE (Leben-Schau 2, 09.10.): eine frische Welt beginnt am Mittag (0,5), die Sonne geht bei 0,75
    // unter — von der Ankunft bis zum Sonnenuntergang vergeht ein Viertel des Tags. Die Szenen der Schau dauerten 9–12,3 min
    // (aus den Zeitstempeln der Bilder: A-5 Dorf und Haus 11 min, A-7 Bauen 9 min, C-9 Rudel 12,3 min); eine Szene ist 15 min.
    // Mit dem alten Tag von 8 min war es nach 2 min Abend und nach 3–6 min Nacht (3 von 3 Spuren, jede stellte selbst auf 60).
    static get TAG_SZENE_MINUTEN() {
        return 15;
    }
    static get DAY_LENGTH_DEFAULT_MINUTES() {
        return AnazhRealm.TAG_SZENE_MINUTEN * 4; // 60 min: Mittag bis Sonnenuntergang = eine Szene
    }
    // DER TAKT DES WETTER-ZUGS: das Wetter steht so lange, bevor der Zug das nächste Wort zieht (mit dem 45-s-Übergang steht
    // es ~75 s). Leser: der Zug (`_loopWeatherAndGrowth`) — und damit jeder Wunsch der Welt, den nur der Zug erfüllt.
    static get WETTER_ZUG_SEK() {
        return 120;
    }
    // D3 (gigant-plan §5 — G4-3): die natürliche Lebens-Spanne eines Wesens.
    // Jenseits davon kehrt es zur Erde zurück (der Tod nährt das lebendig-Feld)
    // — natürlicher Umschlag statt ewiger Wesen. ~35 min Echtzeit.
    static get FAUNA_MAX_AGE_MS() {
        return 35 * 60 * 1000;
    }
    // δ WIRD WÄHRUNG — das WIRK-BUDGET des Nexus: eine Tat kostet ∝ Substanz (computeBuildCost), das
    // Budget regeneriert aus bewährter Schöpfung (Outcome-Fitness > 0.5) + Idle-Tropf → Spam verarmt
    // sich selbst (kein Rate-Limit). Materie kostet in pfad+frieden, frei nur in schöpfer.
    // start/max/regen sind vorläufige Größen.
    static get NEXUS_WIRK() {
        return this._einmal(
            "NEXUS_WIRK",
            Object.freeze({
                start: 60,
                max: 150,
                regenPerValue: 30, // pro finalisiertem Outcome: (fitness−0.5)·30
                idleRegenPer5s: 2, // der Tropf (in _loopSelfAnalysis, 5-s-Takt)
                ruleRegisterCost: 6,
                costCap: 80,
            })
        );
    }

    // Hydrosphären-Atlas: das Drainage-Netz rechnet über eine feste Region um den Ursprung (Flow-
    // Accumulation braucht eine endliche Wasserscheide); cell 16 m → 128² Zellen im Perf-Budget.
    static get HYDROSPHERE() {
        return this._einmal(
            "HYDROSPHERE",
            Object.freeze({
                regionSize: globalThis.__gelaendeCore.GRUND.kachel, // Region-Kantenlänge in m (um den Welt-Ursprung; der Grund des Kerns)
                cell: 16, // Zell-Größe in m → dim = regionSize / cell = 128
                fillEpsilon: 0.01, // Priority-Flood-ε: definiertes Gefälle je Zelle
                minLakeCells: 6, // ein See ist ≥ 6 Zellen — kleinere Füll-Senken
                // sind Mikro-Pits (Drainage gefüllt, aber kein gelisteter See)
                // DIE BREITE (K16) ist das Gesetz des Kerns (gelaende-core `flussBreite`, `FLUSS_BREITE`): der Mäander misst seine
                // Wellenlänge daran, jeder Fluss-Punkt trägt sie (`width`).
                // Gegen die ECHTE Voxel-Surface getunt (steilstes Fluss-Segment ~0.5): Wasserfall = Lauf steiler
                // als 0.4 UND in Summe ≥ 6 m Absturz (`_hydroExtractWaterfalls` verschmilzt Kaskaden per run-merge).
                waterfallSlope: 0.4, // Δy/Δhoriz, ab dem ein Fluss-Segment steil zählt
                waterfallMinDrop: 6, // Mindest-Gesamtdrop in m für einen Wasserfall
                maxRiverPoints: 800, // Sicherheits-Cap je Fluss-Polylinie
                // V9.43-d — der Carve: `_terrainDensityAt` senkt die Dichte im
                // Fluss-Kanal + in See-Senken, der Chunk-Mesher produziert echte
                // Rinnen + gemuldete Becken. Bett-Tiefe ∝ Fluss-Breite.
                carveBedMin: 1.4, // m — Mindest-Tiefe eines Fluss-Betts
                carveBedK: 0.16, // m je m Fluss-Breite — breitere Flüsse schneiden tiefer
                // DER KANAL IN DER AUE (K16): die Bett-Tiefe ist höchstens kanalTiefe — die Aue des Gelände-Gesetzes ist das
                // Hochwasser-Bett, der Kanal liegt in ihr, nie als Graben unter ihr (am 30-m-Raster: keine Senke > 1 m).
                kanalTiefe: 0.8,
                // DER FLUSS-SPIEGEL (Welle L, Q7-Gestalt): der Spiegel liegt um diesen Anteil der Bett-Tiefe unter dem
                // tiefsten Ufer seines Querschnitts (und so tief unter der Kanal-Krone); das Bett liegt um den Rest darunter.
                spiegelFreibord: 0.25,
                // DIE BANK (Gegenprüfung 07.10.): vom Flachboden steigt die Bank mit dieser Neigung (tan 35°, unter dem Geröll
                // des Boden-Gesetzes ab ≈ 37°) bis zur KRONE auf Spiegel + Freibord · Tiefe; jenseits der Krone schneidet der
                // Kanal höheres Gelände mit einer Böschung und hält tieferes mit einem Damm, beide mit derselben Neigung, die mit
                // dem Abstand von der Krone um bankKruemmung je m zunimmt (ein Tal: flach am Wasser, steiler den Hang hinauf),
                // bis bankWeite hinter der Krone; die Kanten (Fuß, Krone, Saum ins Gelände) runden über bankRundung (weiches
                // Minimum der Dichten). Bis 8f09227d lag die Krone nach 0,6 der Bank-Rampe (≈ 61°), und dahinter glitt eine
                // Wand ins Gelände (bis ≈ 73°: Fels-Rauten an 19 von 46 Bank-Profilen der Mess-Wiese).
                bankNeigung: 0.7,
                bankKruemmung: 0.04, // je m hinter der Krone
                bankWeite: 24, // m hinter der Krone
                bankRundung: 0.6, // m
                // DIE DAMM-KRONE (Gegenprüfung 07.10., Runde 4): hält der Kanal tieferes Gelände mit einem Damm, trägt der Damm
                // eine Krone, die das 1,8-m-Gitter trägt — dammBreite hinter der Krone des Kanals eben auf Spiegel + max(Freibord ·
                // Tiefe, dammFreibord), erst dahinter fällt er mit der Neigung der Bank. Die Breite reicht, so weit das Wasser-Sheet
                // hinter der Krone auf dem Spiegel liegt (die äußere Ecke einer Spalte, die an der Krone flutet: 1,8 m · √2), das
                // Freibord über den Fehler der gezeichneten Fläche. Bis zur Gegenprüfung war der Damm eine Schneide (Breite 0, beim
                // Rinnsal 7 cm über dem Spiegel): das Mesh trug ihn nicht (an der Krone des Bachs der Mess-Wiese lag der gezeichnete
                // Boden in 68 von 152 Profilen unter dem Spiegel, p50 0,28 m), und das Wasser lief über ihn ins tiefere Gelände.
                dammBreite: 2.6, // m hinter der Krone des Kanals
                dammFreibord: 0.2, // m über dem Spiegel, mindestens
                // DIE QUELLE (W-F5): jede beginnt als Rinnsal mit quellBett Meter Bett (Wasser höchstens 2,3 m breit und 0,37 m
                // tief) und weitet sich stromab um quellWeitung je Meter Lauf (m/m), bis sie die Breite ihres Einzugsgebiets trägt
                // — Breite und Tiefe wachsen aus dem Gesetz, nichts bricht aus dem Nichts.
                quellBett: 1.2,
                quellWeitung: 0.25,
                carveLakeBedDepth: 8, // m — der See-Boden liegt ~so weit unter dem Spiegel
                carveBucketSize: 32, // m — Kantenlänge einer Fluss-Index-Bucket-Zelle
            })
        );
    }

    static get CREATURE_TASKS() {
        return this._einmal(
            "CREATURE_TASKS",
            Object.freeze(["wander", "follow_player", "wait", "gather", "build", "drink"])
        );
    }
    static get CREATURE_TASK_AURA_HUE() {
        return this._einmal(
            "CREATURE_TASK_AURA_HUE",
            Object.freeze({
                wander: null, // keine Aura — Default ist stumm
                follow_player: 120, // grünlich, "ich bin dabei"
                wait: 40, // bernsteinfarben, "ich harre"
                gather: 200, // cyan, "ich suche"
                build: 280, // violett, "ich erschaffe"
                drink: 210, // azur, "ich nähre mich am Wasser" (V11.0-d.3)
            })
        );
    }
    // drink-Konstanten: die Getter bleiben die Chokepoints, die ZAHLEN wohnen im tetrapoda-Gesetzbuch
    // (VERHALTEN.aufgaben, fail-closed via _verhaltenGesetz).
    static get CREATURE_DRINK_HALT_DIST() {
        return AnazhRealm._verhaltenGesetz().aufgaben.trinkHaltM; // m — am Wasser-Punkt angekommen, beginne Pause
    }
    static get CREATURE_DRINK_DURATION_S() {
        return AnazhRealm._verhaltenGesetz().aufgaben.trinkDauerS; // s — Pausen-Dauer am Ufer (Trink-Geste sichtbar)
    }
    static get CREATURE_DRINK_SEARCH_RADIUS() {
        return AnazhRealm._verhaltenGesetz().aufgaben.trinkSuchM; // m — max Suchradius für nächsten Wasser-Punkt
    }
    static get CREATURE_DRINK_SPEED() {
        return AnazhRealm._verhaltenGesetz().aufgaben.trinkTempo; // m/s — gleich wie gather, sichtbares Bewegen
    }
    // Welle 6.H Phase 2B.1 — gather-spezifische Konstanten. SCHLUSS-WELLE
    // 17.07.: die Zahlen wohnen im tetrapoda-Gesetzbuch (VERHALTEN.aufgaben).
    static get CREATURE_GATHER_HALT_DIST() {
        return AnazhRealm._verhaltenGesetz().aufgaben.gatherHaltM; // m — bei dieser Distanz erntet die Kreatur
    }
    static get CREATURE_GATHER_SPEED() {
        return AnazhRealm._verhaltenGesetz().aufgaben.gatherTempo; // m/s — langsamer als follow, Sammeln bleibt sichtbar
    }
    static get CREATURE_MEMORY_CAP() {
        return 200; // Erinnerungen pro Kreatur — Phase 2D.1 (V7.86): von 30 → 200 für persistente Identitäten mit Geschichte. Cap bleibt FIFO bei Überlauf. 50 Kreaturen × 200 Einträge × ~100 Byte = ~1 MB im Save-Worst-Case; in Praxis viel weniger weil Failures + alte Einträge selten sind.
    }
    // Welle 6.H Phase 2B.5 — Zwei-Phasen-gather Konstanten. SCHLUSS-WELLE
    // 17.07.: die Zahlen wohnen im tetrapoda-Gesetzbuch (VERHALTEN.aufgaben).
    static get CREATURE_HANDOVER_DIST() {
        return AnazhRealm._verhaltenGesetz().aufgaben.uebergabeM; // m — bei dieser Distanz übergibt die Kreatur die Ernte
    }
    static get CREATURE_FOLLOW_DISTANCE() {
        return AnazhRealm._verhaltenGesetz().aufgaben.followHaltM; // m — Standard-Halte-Abstand für follow_player
    }
    static get CREATURE_FOLLOW_MAX_SPEED() {
        return AnazhRealm._verhaltenGesetz().aufgaben.followTempo; // m/s — schneller als wander, Folgen bleibt sichtbar
    }
    // build-Konstanten (Umkehrung zu gather: Spieler = Material-Quelle, Welt = Bauplan-Senke):
    // take (zum Spieler) → build (weg bis Bau-Distanz) → spawn (am Kreatur-Ort).
    static get CREATURE_BUILD_PLACEMENT_DIST() {
        return AnazhRealm._verhaltenGesetz().aufgaben.bauAbstandM; // m — wie weit vom Spieler entfernt die Kreatur baut
    }
    static get CREATURE_BUILD_SPEED() {
        return AnazhRealm._verhaltenGesetz().aufgaben.bauTempo; // m/s — analog gather, sichtbar-aktiv aber ohne Hetze
    }
    // === Proaktive Sprache ===
    // Event-getriebener Chat-Output (Level-Up, Boost, Material-Mangel …) aus pre-baked Phrasen je
    // Event × Soul-Profil, kein LLM je Event (Flood bei vielen Kreaturen). Throttle 60 s je Kreatur + 8 s
    // global; Verletzung → silent drop (keine Queue, sonst Lawine). ${material}/${blueprint}/${level}/
    // ${label} werden vorab ersetzt.
    static get CREATURE_PROACTIVE_GAP_PER_CREATURE() {
        return 60; // s — Mindest-Abstand zwischen zwei Aussagen DERSELBEN Kreatur
    }
    static get CREATURE_PROACTIVE_GAP_GLOBAL() {
        return 8; // s — Mindest-Abstand zwischen ALLEN Kreatur-Aussagen
    }
    static get CREATURE_PROACTIVE_PHRASES() {
        // [eventType][soulName] → Array von Phrase-Templates.
        // soulName "default" wirkt als Fallback wenn ein neuer Soul-Typ
        // hinzukommt ohne spezifische Phrasen.
        return this._einmal(
            "CREATURE_PROACTIVE_PHRASES",
            Object.freeze({
                level_up_gather: {
                    wesen: Object.freeze([
                        "Mein Boden trägt ${material} jetzt fester. Stufe ${level}.",
                        "Ich kenne ${material} tiefer. Stufe ${level} in mir.",
                        "${material} wird zu meinem Hand-Wissen — Stufe ${level}.",
                    ]),
                    default: Object.freeze(["Ich werde besser im Sammeln von ${material}. Stufe ${level}."]),
                },
                level_up_build: {
                    wesen: Object.freeze([
                        "Ich baue ${blueprint} jetzt mit ruhigerer Hand. Stufe ${level}.",
                        "${blueprint} wird Teil meines Wesens — Stufe ${level}.",
                    ]),
                    default: Object.freeze(["Ich verstehe ${blueprint} jetzt tiefer. Stufe ${level}."]),
                },
                boost_received: {
                    wesen: Object.freeze([
                        "${label} setzt sich warm in mein Innerstes.",
                        "Ich fühle ${label} durch meine Glieder gehen.",
                    ]),
                    default: Object.freeze(["Der Trank ${label} wirkt in mir."]),
                },
                no_material_found: {
                    wesen: Object.freeze([
                        "${material} ist nirgends in Reichweite.",
                        "Ich finde kein ${material}. Soll ich anderes suchen?",
                    ]),
                    default: Object.freeze(["Ich finde kein ${material} mehr."]),
                },
                no_inventory_for_build: {
                    wesen: Object.freeze([
                        "Du hast kein Material für ${blueprint} bei dir.",
                        "Mir fehlt für ${blueprint} der Stoff aus deiner Hand.",
                    ]),
                    default: Object.freeze(["Mir fehlt Material für ${blueprint}."]),
                },
            })
        );
    }
    // === Kreatur-DSL-Vorschläge (Sandbox) ===
    // Whitelist: atmosphärisch + Terrain — KEIN player_*, KEIN define_*, kein Bauplan-Löschen;
    // voxel_carve/voxel_fill bewusst erlaubt. chain erlaubt; der Validator walkt die AST rekursiv
    // gegen die Whitelist.
    static get CREATURE_PROPOSED_OPS() {
        return this._einmal(
            "CREATURE_PROPOSED_OPS",
            Object.freeze(
                new Set([
                    "weather",
                    "skybox_color",
                    "creatures_emotion",
                    "creatures_color",
                    "spawn_creature",
                    "spawn_blueprint",
                    "spawn_village",
                    "spawn_temple",
                    "spawn_waterfall",
                    "spawn_tree",
                    "spawn_island",
                    "spawn_ufo",
                    "spawn_fractal",
                    "set_visible",
                    "voxel_carve",
                    "voxel_fill",
                    "chain",
                    "say", // narrative-only Op (existing) bleibt erlaubt
                ])
            )
        );
    }
    // Throttle für die LLM-Vertiefung seltener Events (L5, neue Top-Spec) gegen API-Bursts; die
    // pre-baked Phrasen bleiben der Default.
    static get CREATURE_LLM_RARE_EVENT_GAP() {
        return 600; // s — 10 Min global
    }

    // Spezialisierung: je THRESHOLD erfolgreiche Aktionen ein Level, gedeckelt bei MAX_LEVEL;
    // SPEED_BONUS moduliert die Tick-Geschwindigkeit.
    static get CREATURE_SPECIALIZATION_LEVEL_THRESHOLD() {
        return 3; // Erfolge pro Level — nach 3 Holz-Ernten Level 1, nach 6 Level 2
    }
    static get CREATURE_SPECIALIZATION_MAX_LEVEL() {
        return 5; // Cap — nach 15 Erfolgen ist Level 5 erreicht (Meisterschaft)
    }
    static get CREATURE_SPECIALIZATION_SPEED_BONUS_PER_LEVEL() {
        return 0.15; // L5 = +75 % Geschwindigkeit (3.0 → 5.25 m/s)
    }

    // === Wasser-Substanz: die Voxel-Cell-Zustände ===
    // Eine Cell ist LUFT (begehbar), WASSER (Spieler schwimmt, der Iso-Mesher baut hier die Boundary)
    // oder FEST (Land/Architektur/Voxel-Fill) — EINE Sprache mit dem Voxel-Terrain.
    static get CELL_STATE() {
        return this._einmal("CELL_STATE", Object.freeze({ AIR: 0, WATER: 1, SOLID: 2 }));
    }

    // Die AQUIFER-Regel des Zell-Gesetzes: eine Zelle tiefer als so viele Meter unter der Makro-Fläche und über dem
    // Wassertisch bleibt trocken (ein Oberflächen-See flutet die Höhlen darunter nicht). Leser: der Zell-Bau
    // (`_buildVoxelChunkWaterCells`, Worker-Spiegel `buildWaterCells` bit-identisch) und die Decke am Körper (`_koerperWasser`).
    static get AQUIFER_TIEFE_M() {
        return 18;
    }

    // DIE AQUIFER-REGEL als EINE Rechnung (Zell-Bau, Worker-Spiegel `aquiferTrocken`, die Decke am Körper): eine Zelle ist
    // trockene Höhle, wenn sie tiefer als AQUIFER_TIEFE_M unter der Makro-Fläche und über dem Wassertisch liegt UND Fels über
    // ihr steht (`unterFels`). Unter offenem Himmel (eine Schlucht) ist eine Zelle nie Höhle: bis zur Gegenprüfung 07.10.
    // (Runde 3) trocknete die Regel jeden Fluss, der sich tiefer als 18 m unter die Makro-Fläche schneidet (Quelle der Kachel
    // −664/−2264: Spiegel 90,38 über dem Schlucht-Boden 86,32, der Körper trocken, das Sheet hing schräg über der Schlucht).
    static _aquiferTrocken(cy, makroY, tischY, unterFels) {
        return unterFels && cy < makroY - AnazhRealm.AQUIFER_TIEFE_M && cy > tischY;
    }

    // Welle C — der Schwarz-Floor für Flach-Farb-Strukturen (Eigen-Leuchten in
    // der Materialfarbe, hebt Stein/Eisen nachts über Schwarz). Browser-justierbar.
    static get STRUCTURE_EMISSIVE() {
        return this._einmal("STRUCTURE_EMISSIVE", Object.freeze({ intensity: 0.07 }));
    }

    // Manifold-Dual-Contouring-Schärfe-Regler. MÜSSEN bit-identisch zum `voxel-worker.js`-Mirror sein
    // (Worker- und Main-Chunks brauchen koinzidente Boundary-Vertices). DC_LAMBDA: QEF→Mass-Point-
    // Regularisierung (klein=scharf). DC_SHARP_MOVE2: ab welcher Verschiebung² ein Vertex „Feature" ist
    // (der feature-bewusste Laplacian verschont ihn).
    static get DC_LAMBDA() {
        return 0.1;
    }
    static get DC_SHARP_MOVE2() {
        return 0.04;
    }

    // Kavitäts-AO zeichnet Surface-Nets-Facetten-Kanten als Treppen-/Trapez-Linien nach → Strength
    // gedämpft; die triplanar-Textur trägt die Tiefe.
    static get TERRAIN_AO() {
        return this._einmal("TERRAIN_AO", Object.freeze({ strength: 0.4, cap: 0.18 }));
    }

    // Eingefrorener 2.5D-Lichtungs-Wert (der eine Tuning-Hebel). NUR die Shading-Normale (Material-
    // normalNode + AO in _buildToonNodeMaterial), NIE die Geometrie. Der Schatten-Versatz liest dieselbe End-Normale:
    // r184 schiebt die Probe um `normalWorld` × normalBias, und `normalWorld` IST die Normale dieses normalNode (setupNormal) —
    // bei 1,0 zeigt der Versatz (`_schattenBias`, 0,5 Texel) auch am Hang senkrecht nach oben, nie entlang der Fläche.
    static get TERRAIN_NORMAL_FLATTEN() {
        return 1.0;
    }

    // Die Boden-Karte (`_bodenKarteAusMesh`) teilt den Voxel-Schritt in so viele Gitter-Abstände (LOD 0: 1,8 m / 4 =
    // 0,45 m) — fein genug, dass die bilineare Lesung der Dreiecks-Fläche auf ≤ 2 cm folgt (Median).
    static get BODEN_KARTE_TEILUNG() {
        return 4;
    }

    // DIE NAH-WIESE (V18.508): nah am Auge wächst die Wiese aus dem Studio-Gras (Foundry „gras", Stufen
    // aus `kindStages.grass`), jenseits trägt die Boden-Funktion. Kosten an den SCHIRM gebunden (Gebot 7):
    // ein Kachel-Ring um die Kamera, nie je Chunk; gezeichnet wird je Büschel, was das Auge sieht (der Sicht-Satz
    // `_nahWieseSicht`, EINE Senke je Vorlage × Stufe × Teil). `stufe1` = Radius der feinen Stufe (L1) um das Auge, je
    // Büschel, `stufe1Rand` = ihr Austritt dahinter (Hysterese), `radius` = Ende der Büschel, `rand` = Ausdünnungs-Band
    // davor (ein Büschel zeigt sich, solange seine Würfel-Ordnung unter dem Anteil seiner Distanz liegt), `kachel` =
    // Kachel-Kante (Bau- und Grob-Cull-Einheit). Raster, Dichte-Gesetz und Skala kommen aus dem Studio
    // (understory.grassStep · groundCover.grass · placement.scale.gras). `reich` = die Weite eines Büschels je Skala 1 (m,
    // die weiteste Halm-Spitze um seinen Fuß, waagrecht): sein Kreis vor dem Grund der Häuser (`erdbauGrund`, S4). Gemessen
    // 19.10. an der GEZEICHNETEN Vorlage (Geometrie × lokale Matrix des Teils, beide Vorlagen, L1/L2) 0,606–0,683 m, dazu der
    // Hub im Sturm (WIND_GESETZ 0,035 m); die 0,17 vom 17.10. lasen das Studio-Gras ohne die Matrix — ein Büschel 0,4 m vor der
    // Wand steckte seine Halme durch sie in den Anbau (gate:haus-welt W9 misst die Weite an der Vorlage).
    static get NAH_WIESE() {
        return this._einmal(
            "NAH_WIESE",
            Object.freeze({
                kachel: 6,
                stufe1: 5,
                stufe1Rand: 0.5,
                radius: 14,
                rand: 4,
                kachelnJeTakt: 1,
                reich: 0.72,
            })
        );
    }

    // DIE BODEN-PALETTE (`_bodenFarbeAt`, linear wie das Vertex-Attribut): die Studio-Palette PORTAL_GROUND
    // (foundry-core, synchron über den Terrain-Namensraum) nach dem FARB-GESETZ — jedes Hex ist eine sRGB-
    // ABSICHT, die Albedo sein linearer Wert. Bis V18.530 trug die Welt ihren eigenen Zwilling (stone · earth ·
    // dampEarth …) mit Absichts-Werten ROH als linear (Stein 0,42/0,44/0,49 statt 0,15, Sand 0,87 statt 0,58);
    // der Chunk-Stoff multiplizierte die Vertex-Farbe ein zweites Mal (Albedo = Farbe², ein zufälliges Gamma 2
    // für den Boden, das die Wiese MEADOW_GREEN·Farbe nur halb so hell ließ). Einmal je Sitzung dekodiert;
    // der Voxel-Worker bekommt DIESELBEN Zahlen im Init-Schnappschuss (`bodenPalette`), kein Spiegel. Ohne die
    // Palette bricht der Boden laut (Kern-Pflicht).
    static get BODEN_FARBE() {
        const PG =
            AnazhRealm.Gesetz("terrain:PORTAL_GROUND", null) || AnazhRealm._kernPflichtBruch("terrain:PORTAL_GROUND");
        const out = {};
        for (const k of Object.keys(PG)) out[k] = Object.freeze(AnazhRealm._srgbHexLinear(PG[k]));
        return this._einmal("BODEN_FARBE", Object.freeze(out));
    }

    // Das FARB-GESETZ als EINE Rechnung: ein sRGB-Hex (die Absicht des Farbwählers) → [r, g, b] linear (die
    // sRGB-Übertragungs-Funktion IEC 61966-2-1). Rein, ohne THREE (die Palette steht vor dem Renderer).
    static _srgbHexLinear(hex) {
        const dek = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
        return [dek(((hex >> 16) & 255) / 255), dek(((hex >> 8) & 255) / 255), dek((hex & 255) / 255)];
    }

    // DER WIESEN-GRUND (K53, EINE Quelle): wo der Boden grün ist (die Wiesen-Wache `gruenSchwelle`: g − (r+b)/2), deckt ihn
    // das Gras — aus der Ferne das MITTEL des Halms, das Integral der Halm-Farbe (h ∈ [0, 1]: mix(Wurzel, Spitze, h) ·
    // (0,65 + 0,35 h)) = 0,383 · Wurzel + 0,442 · Spitze, Y 0,17 wie das Studio-Gras der Nah-Wiese; die karge Stelle (Fleck
    // λ 7,7 m, `rauschM`) zeigt mehr Grund: Gewicht 0,5 … 1 der Wache. Das Gesetz rechnet ihn (`_bodenFarbeAt`, der Worker
    // `attachFieldColors` mit diesem Schnappschuss), nie das Fragment: bis K53 mischte ihn nur der Boden-Stoff (V18.346), der
    // Feld-Pass und das Panorama zeigten den nackten Grund (`mead`, aus 45 m eine oliv-gelbe Steppe).
    static get WIESEN_GRUND() {
        const mg = AnazhRealm.MEADOW_GREEN;
        const sp = AnazhRealm.GRAS_SPITZE;
        return this._einmal(
            "WIESEN_GRUND",
            Object.freeze({
                farbe: Object.freeze([0, 1, 2].map((i) => 0.383 * mg[i] + 0.442 * sp[i])),
                schwelle: AnazhRealm.TERRAIN_GEOLOGY.gruenSchwelle,
                rauschM: 1 / 0.13,
            })
        );
    }

    // Das Wiesen-Grün: EINE Quelle für die Halm-WURZEL (der Fuß-Ton des Boden-Reliefs) UND den Wiesen-
    // Grund (`WIESEN_GRUND`) → der Halm wächst nahtlos aus dem Boden. Die Halm-Spitze
    // bleibt heller; die lush/dry-instanceColor moduliert Halm und Boden ko-variant. Es IST der Wiesen-Grund
    // der Boden-Palette (`mead`), dieselbe Farbe wie der Vertex der Wiese.
    static get MEADOW_GREEN() {
        return AnazhRealm.BODEN_FARBE.mead;
    }

    // Die Gras-SPITZE: der Sommer-Grasakzent des Studios (SAISON_GESETZ, Sommer-Stütze `ac` 0x6f9a3a) nach dem
    // FARB-GESETZ linear, aufgehellt um die Zahl des Studio-Grases (terrain:GRAS_SPITZE_HELL, emitGrass: `vegFarbe(
    // seasonAccent) × 1,08` — linear, 0,172/0,349/0,046). EINE Quelle für die Halm-Spitze des Nah-Grases und die Halme
    // der Boden-Wiese (`_terrainGeologyAlbedo`). Bis 06.10. hellte der Stamm in sRGB auf (0,187/0,383/0,049, ein Zwilling
    // der Studio-Formel mit eigener Rechnung).
    static get GRAS_SPITZE() {
        const ac = AnazhRealm._saisonGesetz().stuetzen[1].ac;
        if (!Number.isFinite(ac)) AnazhRealm._kernPflichtBruch("terrain:SAISON_GESETZ.stuetzen[1].ac");
        const hell = AnazhRealm.Gesetz("terrain:GRAS_SPITZE_HELL", null);
        if (!Number.isFinite(hell)) AnazhRealm._kernPflichtBruch("terrain:GRAS_SPITZE_HELL");
        return this._einmal("GRAS_SPITZE", Object.freeze(AnazhRealm._srgbHexLinear(ac).map((v) => v * hell)));
    }

    // Per-Fragment-Multi-Klassen-Geologie: die Klassen emergieren aus der Welt-Wahrheit — steile Hänge
    // tragen keine lockere Erde (sie rutscht) → Fels bricht durch. `_steep = 1 − normalWorld.y`: 0 flach,
    // 0.29 ≈ 45°, 0.5 = 60°, 1 senkrecht. Das Profil ist konservativ (nur echte Hänge versteinern).
    static get TERRAIN_GEOLOGY() {
        // Fels- und Moos-Tint SIND die Boden-Palette (rock · wet). Die Schwellen sind linear (der Vertex trägt
        // seit dem Farb-Gesetz die Albedo): `gruenSchwelle` ist die EINE Wiesen-Wache (g − (r+b)/2), die das
        // Boden-Fragment UND der Grün-Kanal der Boden-Karte lesen (Wiese 0,066, Streu und Fels < 0).
        const P = AnazhRealm.BODEN_FARBE;
        return this._einmal(
            "TERRAIN_GEOLOGY",
            Object.freeze({
                rockLo: 0.42, // ab dieser Steile (≈55°) beginnt der Fels
                rockHi: 0.7, // ab hier (≈73°) voll Fels (die Klippe/der Grat)
                // DER SCHUTT liegt, wo das Schicht-Gesetz den Schutthang legt (gelaende-core `hoehe(…, aus).schutt`: der Abschnitt
                // Schutthang der Treppe × Stil), nie nach der Steile der Masche — `schutt` sein Gewicht im Vertex (`_felsStoff`, an
                // `aSchutt` weitergereicht, der Detail-Term legt sein Korn auf). Das Gesetz fragt der Chunk nur, wo ein Vertex unter
                // dem Himmel steiler als `schuttKandidat` (≈ 23°) steht, auf einem Gitter der Kante `schuttGitter` (m, 3 Netz-Schritte;
                // das Band ist 16,7 m breit). Bis zur Nachbesserung 2 lag er ab 28° auf jedem Hang (Steile 0,117 … 0,171).
                schuttKandidat: 0.08,
                schuttGitter: 5.4,
                schutt: 0.85,
                mossTint: P.wet, // das Moos des Bodens ist der nasse Grund der Palette
                gruenSchwelle: 0.04, // die Wiesen-Wache: smoothstep(0, gruenSchwelle, g − (r+b)/2)
                mossDampLo: 0.05, // unter dieser linearen Luminanz = „feucht/Niederung" (nasser Grund 0,042)
                mossDampHi: 0.09, //   (Wiese 0,10, beschattete Streu 0,086 — die Feuchte lebt im Vertex)
                mossMax: 0.6, // Deckel der Moos-Übernahme (kein uniformer Teppich)
                roughBase: 0.94, // V18.386 — Portal-Terrain-Roughness (`_terMat` 0.94, matter Boden). Der Substanz-Kern
                //                  variiert sie ums Korn (Erhebung rau, Mulde glänzt), Moos wird matter,
                //                  feuchte kahle Niederung glänzt → das Licht fängt den Boden lebendig
                //                  statt eines toten uniformen Sheens unterm Sky-IBL.
            })
        );
    }

    // Terrain-Mikro-Relief (Bump): ein Noise-Höhengradient kippt die geflattete Normale fein → der Boden
    // fängt Licht als Mikro-Struktur. NUR die PBR-Lichtung liest diese Normale (die Substanz-Response
    // liest die Geometrie-normalWorld → kein Schatten-/AO-Konflikt). LOD-gegated (nur nah).
    static get TERRAIN_BUMP() {
        return this._einmal(
            "TERRAIN_BUMP",
            Object.freeze({
                freq: 1.1, // Mikro-Relief-Frequenz (~0.9 m Feature-Größe — Klumpen/Kiesel)
                freq2: 2.7, // zweite Oktave (feineres Korn obendrauf)
                // DIE OKTAVEN AM SCHIRM (material.K2, `_mikroRelief`): drei Oktaven folgen der Pixelgröße — die feinste trägt
                // `mikroPx` × |fwidth| je Periode (|fwidth| ist 1,4–1,7 Pixel der Szene: 1 legt sie an den Nyquist der Ausgabe, die TAAU
                // sammelt die welt-feste Oktave über den Jitter), nie feiner als `mikroMinM` (Schluff und Feinsand);
                // jede trägt die Neigung `mikro` (gleiche Steigung je Oktave: das 1/f²-Spektrum natürlicher Bilder, Field 1987).
                mikroPx: 1,
                mikroMinM: 0.0005,
                mikro: 0.15,
                mikroHoehe: 0.75, // die Höhe der nächst gröberen Oktave je feinerer (`_mikroRelief`: das Spektrum β ≈ 1,2)
                kavitaet: 0.7, // die Kavität je Höhe (`_mikroStoff`, aoNode): das Himmels-Licht der Mulde und der Erhebung
                korn: 1.0, // das Korn je Höhe (`_mikroStoff`, colorNode): die Albedo der Mulde dunkler, der Erhebung heller, mittelfrei
                // Kipp-Stärke subtil halten: da TERRAIN_NORMAL_FLATTEN=1.0 voll flacht, ist der Bump die EINZIGE
                // Normal-Variation — zu stark (0.42 = 23°) gibt bimodales dot(N,L) = bolde Hell/Dunkel-Trapeze pro
                // Makro-Facette. 0.24 = 13° moduliert echtes Mikro-Relief; das Albedo-Korn trägt die feine Textur.
                strength: 0.24, // Kipp-Stärke der Normale (subtil — 13° statt 23°; der Haupt-Balance-Knopf)
                strength2: 0.1, // Stärke der zweiten Oktave
                // Die EINE Mikro-Detail-LOD-Quelle: Distanz-Fade von Bump UND feinem Korn; Terrain (`_lod`) und
                // Werke/Strukturen/Rinde (`_substanceCharacter`) lesen dieselben Schwellen.
                lodNear: 14, // Bump: voll bis 14 m
                // Weite Fade-Rampe (14→95 m): auf flachem Boden steigt die Distanz monoton mit Screen-Y — eine
                // scharfe Detail-Blende projiziert als horizontale Kontrastlinie auf feste Schirm-Höhe.
                lodFar: 95, // Bump: weicher Auslauf bis 95 m (breite Rampe → kein scharfer Screen-Y-Streifen)
                fineNear: 30, // feines Korn: voll bis 30 m
                fineFar: 160, // feines Korn: weiter Auslauf (Rampe statt Kante)
            })
        );
    }

    // DAS RAUSCH-GESETZ (Welle G, der Boden-Stoff): das EINE Gradienten-Rauschen der Boden- und Substanz-Stoffe. Es ist
    // das Perlin-Rauschen von MaterialX (three r184 `mx_noise_float`: die Gradienten-Menge nach `h & 15` aus dem Jenkins-
    // lookup3-Hash, die Fünftgrad-Blende, die Skala 0,982) — nur der Hash wird nicht mehr je Fragment und Ecke gerechnet
    // (8 Ecken × ~40 Ganzzahl-Operationen je Aufruf), er liegt EINMAL im Rausch-Atlas (`_rauschAtlas`). `P` Gitter-Zellen
    // je Kante (die Ebene wiederholt sich nach P Zellen); die dritte Achse liegt im selben Atlas, je Schicht um `schraeg`
    // versetzt — das Maximum des kürzesten 3D-Periodenvektors für P = 256 (43 Zellen). Das Gesetz lebt im Gelände-Kern
    // (gelaende-core `RAUSCH`, `rauschGitter`, `rauschRaum`: derselbe Wert auf der CPU) — Vertex und Pixel lesen EIN Rauschen.
    static get RAUSCH_GESETZ() {
        const GK = globalThis.__gelaendeCore;
        if (!GK || !GK.RAUSCH || typeof GK.rauschGitter !== "function") AnazhRealm._kernPflichtBruch("gelaende:RAUSCH");
        return GK.RAUSCH;
    }

    // Die Bytes des Rausch-Atlas (rein, ohne THREE): je Gitter-Punkt (i, j) der Gradient von MaterialX (gelaende-core
    // `rauschGitter`) — der Hash
    // `mx_hash_int(i, j, 0)` (Jenkins lookup3, bit-genau wie das vendored WGSL) und die Achsen-Regel `mx_gradient_float`
    // (u = h < 8 ? x : y; v = h < 4 ? y : h ∈ {12, 14} ? x : z; Vorzeichen aus Bit 0 und 1) —, GEPACKT je Komponente: das
    // Texel (3i + c, j) trägt die Komponente c der vier Ecken (i, j) · (i+1, j) · (i, j+1) · (i+1, j+1) als RGBA8 unorm
    // (−1 · 0 · +1 = 0 · 127 · 254, der Leser rechnet v · 255/127 − 1). So liest eine Gitter-Zelle EINE Komponente ihrer vier
    // Ecken mit einem Texel. Nie snorm: r184 legt jede Daten-Textur auch als Render-Ziel an, rgba8snorm ist das nur mit dem
    // Feature texture-formats-tier1 — swiftshader fehlt es (Invalid TextureView im Boot, gate:analog-nah).
    static _rauschAtlasDaten() {
        const P = AnazhRealm.RAUSCH_GESETZ.P;
        const g = globalThis.__gelaendeCore.rauschGitter();
        const out = new Uint8Array(3 * P * P * 4);
        for (let j = 0; j < P; j++)
            for (let i = 0; i < P; i++) {
                const i1 = (i + 1) % P;
                const j1 = (j + 1) % P;
                const ecken = [j * P + i, j * P + i1, j1 * P + i, j1 * P + i1];
                for (let c = 0; c < 3; c++) {
                    const o = (j * 3 * P + 3 * i + c) * 4;
                    for (let e = 0; e < 4; e++) out[o + e] = 127 * (g[ecken[e] * 3 + c] + 1);
                }
            }
        return out;
    }

    // Die geteilte Aerial-Perspektive (`_applySubstanceResponse`) rufen ALLE opaken Ebenen post-lighting;
    // ihre EINE Quelle ist das Top-Level-Assignment `AnazhRealm.AERIAL = ...` am Dateiende. NIE einen
    // `static get AERIAL()` daneben — ein Getter ohne Setter schluckt das Assignment lautlos.

    // Das Antwort-PROFIL je Ebene (Gewichte 0..1, der Unterschied der Ebenen ist DATEN): micro (Mikro-Tiefe/AO, ein
    // Faktor auf dem Licht) · emissiv (das Glimmen der Substanz). `defaults` = Familien-Profile; mit Substanz-Tags
    // emergiert das Profil via _substanceResponseProfile. Kein Profil trägt Licht: das additive Band (Rim, Nacht-Boden,
    // Mond-Rim) fiel mit F6 — das Licht ist die EINE Licht-Kette.
    static get SUBSTANCE_RESPONSE() {
        return this._einmal(
            "SUBSTANCE_RESPONSE",
            Object.freeze({
                defaults: Object.freeze({
                    // Terrain/Inseln/Mantel (vertexColors): Albedo-Quelle bleibt das
                    // per-Vertex-color-Attribut; micro/AO trägt ihr eigener
                    // triplanar-colorNode (darum hier 0).
                    feld: Object.freeze({ micro: 0, emissiv: 0 }),
                    // Flach-Farb-Werke (Bauten/Deko/Kreaturen/Avatare)
                    werk: Object.freeze({ micro: 1, emissiv: 1 }),
                    frei: Object.freeze({}),
                }),
            })
        );
    }

    // DIE KONSTANTE EINMAL (K2 Belegung): jeder Konstanten-Getter münzte je Zugriff sein Objekt neu — HYDROSPHERE allein trug
    // 13,5 % der Allokation an der Mess-Wiese (je Feld-Probe 30 Felder eingefroren; 12 MB/s, ein Scavenge je ~0,25 s außerhalb
    // des Takts). Der erste Zugriff legt den Wert als Feld auf die Klasse, jeder weitere liest das Feld.
    static _einmal(name, wert) {
        Object.defineProperty(this, name, { value: wert, configurable: true });
        return wert;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_daten]);
