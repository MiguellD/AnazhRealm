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
    // aus `kindStages.grass`). Kosten an den SCHIRM gebunden (Gebot 7): ein Kachel-Ring um das Auge, nie je Chunk;
    // gezeichnet wird je Büschel, was das Auge sieht (der Sicht-Satz `_nahWieseSicht`, EINE Senke je Vorlage × Stufe ×
    // Teil). `stufe1` = Radius der feinen Stufe (L1) um das Auge, je Büschel, `stufe1Rand` = ihr Austritt dahinter
    // (Hysterese), `radius` = die Übergabe: bis hier legt der Sicht-Satz jedes Büschel, dahinter zeichnet DIE FERNE
    // dieselben Büschel weiter, `vorlauf` = so weit vor der Übergabe steht jede Kachel schon (kein Büschel tritt in den Kreis,
    // bevor seine Kachel steht), `kachel` = Kachel-Kante (Bau- und Grob-Cull-Einheit). Raster, Dichte-Gesetz und Skala kommen
    // aus dem Studio (understory.grassStep · groundCover.grass · placement.scale.gras). Die Weite eines Büschels (sein Kreis
    // vor dem Grund der Häuser, `erdbauGrund`, S4) ist keine Zahl hier: sie ist die der GEZEICHNETEN Vorlagen
    // (`nahWiese.reich`, `_tickNahWiese`; gate:haus-welt W9 misst sie an derselben Vorlage).
    // DIE FERNE (`fern`, w4-gras-saum, w4-gras-l2): bis 31.10. endete die Wiese bei `radius` (ein Ausdünnungs-Band 12–16 m,
    // dahinter der flache Boden — im Third eine Naht, beim Gehen wanderte die Kante mit). Jetzt zeichnen dieselben Büschel
    // (dieselbe Zelle, derselbe Wurf, die Studio-Stufe L2) weiter bis `bis`, nach dem EINEN Gesetz `_wieseFern`: die ganze
    // Gestalt des Büschels streckt sich waagrecht um s = (d/radius)^`streck`, höchstens `streckMax` (Mitten UND Halme, die Ähren
    // nur verschoben; Höhe bleibt, die Füße folgen der Ebene des Hangs) — ein Büschel trägt die Fläche von s² Zellen —, und die
    // Anzahl folgt dem Ziel der Deckung: Anzahl × s = 1 bis `voll` (die Wiese der Nähe, an der Übergabe stetig), dahinter
    // (voll/d)^`fall`; ein Büschel steht, solange seine Ordnung o darunter liegt, im Band `rand` (relativ) sinkt es in den
    // Boden statt zu springen, vor `bis` über `saum`. Die Kosten hängen am Schirm, nie an der Weite der Welt (Lehre 25).
    // Bis w4-gras-l2 fiel die Anzahl mit (radius/d)^4 und nur die Mitten rückten (höchstens 2,5×, die Füße √): an der
    // Mess-Wiese Third LAI 14–30 m 0,36 · 30–80 m 0,02 · 80–200 m 0 (Radeon), der Boden jenseits 30 m frei. Im Modell der
    // Station (Messung w4-gras-l2: flache Wiese, Wurf 0,85, Third 2,43 m, Blick −9,4°, 1920 × 1080, die Vorlagen der Brücke,
    // dieses Gesetz) vorher 14–30 m LAI 0,51 · 30–80 m 77 % Grund · 80–200 m 100 % Grund bei 27k Dreiecken der Ferne, jetzt
    // 1,86 · 0,22 % · 4,5 % bei 65k (Blick-Keil + 11°; die Zeile nahWieseFern 60k), Ego 1,87 · 0,02 % · 1,3 %. `streckMax` 14
    // hält die Gestalt (7,4 m Radius) auf dem Boden: an der Ebene des Hangs p90 0,07 m bei 30 m, 0,11–0,29 m bei 50–200 m
    // (Gesetz, Mess-Wiese, im Blick der Station; waagrecht 0,5–1,0 m).
    // `bis` liegt am Ring der Chunks (Radius 4 × 43,2 m: jenseits trägt keine Boden-Karte, `_bodenKommtNie`) — dahinter ist
    // das Gras nach dem Studio der Boden (foundry-core `fernform` „boden"). `kachel` = die Kachel der Ferne (vier Kacheln der
    // Nähe), `vorlauf` = so weit näher, als sie gebaut ist, trägt eine Kachel der Ferne ihre Büschel schon.
    static get NAH_WIESE() {
        return this._einmal(
            "NAH_WIESE",
            Object.freeze({
                kachel: 6,
                stufe1: 5,
                stufe1Rand: 0.5,
                radius: 14,
                vorlauf: 2.5,
                kachelnJeTakt: 1,
                fern: Object.freeze({
                    kachel: 12,
                    bis: 200,
                    saum: 20,
                    voll: 21,
                    fall: 1.5,
                    streck: 3,
                    streckMax: 14,
                    rand: 0.2,
                    vorlauf: 8,
                    kachelnJeTakt: 4,
                }),
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

    // DIE SPRACHE DES SPIELERS (spielgang.K5): die EINE Tafel jeder UI-Zeile — je Schlüssel eine Spalte je Sprache (de · en).
    // Gelesen nur über den EINEN Leser `_t` (Dienst); `{name}` ist ein Wert des Aufrufers. Die Linse `diag-sprache` hält sie
    // dicht: jede Zeile trägt jede Sprache, jeder Schlüssel des Stamms und von index.html steht hier, kein Wort-Text einer
    // UI-Senke geht an ihr vorbei.
    static get TEXTE() {
        const S = ["de", "en"];
        // SPRACH-ZEILEN AUF
        // prettier-ignore
        const Z = {
            "bau.birke": ["Birke", "Birch"],
            "bau.brennkolben": ["Brennkolben", "Alembic"],
            "bau.brustpanzer": ["Brustpanzer", "Breastplate"],
            "bau.buche": ["Buche", "Beech"],
            "bau.damm": ["Damm", "Dam"],
            "bau.drehbank": ["Drehbank", "Lathe"],
            "bau.eiche": ["Eiche", "Oak"],
            "bau.erle": ["Erle", "Alder"],
            "bau.esse": ["Esse", "Forge"],
            "bau.fass": ["Fass", "Barrel"],
            "bau.felsblock": ["Felsblock", "Rock block"],
            "bau.felsbogen": ["Felsbogen", "Rock arch"],
            "bau.felsbrocken": ["Felsbrocken", "Boulder"],
            "bau.felsformation": ["Felsformation", "Rock formation"],
            "bau.felsturm": ["Felsturm", "Rock spire"],
            "bau.feuerstelle": ["Feuerstelle", "Campfire"],
            "bau.gefallener-stamm": ["Gefallener Stamm", "Fallen log"],
            "bau.kiefer": ["Kiefer", "Pine"],
            "bau.kiesel": ["Kiesel", "Pebbles"],
            "bau.kiste": ["Kiste", "Crate"],
            "bau.kristall-formation": ["Kristall-Formation", "Crystal formation"],
            "bau.kristall-geode": ["Kristall-Geode", "Crystal geode"],
            "bau.laterne": ["Laterne", "Lantern"],
            "bau.lebenssaft": ["Lebenssaft", "Lifeblood"],
            "bau.mammutbaum": ["Mammutbaum", "Sequoia"],
            "bau.marktstand": ["Marktstand", "Market stall"],
            "bau.meister-esse": ["Meister-Esse (Eisen)", "Master forge (iron)"],
            "bau.pferd": ["Pferd", "Horse"],
            "bau.seelenstein-altar": ["Seelenstein-Altar", "Soulstone altar"],
            "bau.tanne": ["Tanne", "Fir"],
            "bau.wandlaterne": ["Wandlaterne", "Wall lantern"],
            "bau.wasserfall": ["Wasserfall", "Waterfall"],
            "bau.webstuhl": ["Webstuhl", "Loom"],
            "bau.welt-portal": ["Welt-Portal", "World portal"],
            "bau.ziehbrunnen": ["Ziehbrunnen", "Draw well"],
            "bauen.abbrechen-esc": ["Abbrechen (ESC)", "Cancel (ESC)"],
            "bauen.anker-titel": ["{name} — {beschreibung}\nKlick, dann die STELLE auf Part {part} wählen — der Punkt rastet auf Mitte/Kante/Ecke.", "{name} — {beschreibung}\nClick, then pick the SPOT on part {part} — the point snaps to centre/edge/corner."],
            "bauen.aria-rohmaterial": ["{name} (Rohmaterial)", "{name} (raw material)"],
            "bauen.aria-tags": ["{name} (Tags: {tags})", "{name} (tags: {tags})"],
            "bauen.art-baum": ["Baum", "Tree"],
            "bauen.art-fels": ["Fels", "Rock"],
            "bauen.art-kristall": ["Kristall", "Crystal"],
            "bauen.bar-material": ["{tag}: {wert} (Material-Resonanz, 0–3)", "{tag}: {wert} (material resonance, 0–3)"],
            "bauen.bar-resonanz": ["Resonanz als {rolle}: {wert} (0–1)", "Resonance as {rolle}: {wert} (0–1)"],
            "bauen.bar-resonanz-weg": ["Resonanz als {rolle}: {wert} (0–1)\nWeg dahin: {weg}", "Resonance as {rolle}: {wert} (0–1)\nHow to get there: {weg}"],
            "bauen.bau-kosten": ["Bau-Kosten", "Build cost"],
            "bauen.bau-kosten-titel": ["Material, das der Bau verbraucht (pfad/frieden; schöpfer baut frei).", "Material the build consumes (path/peace; creator builds free)."],
            "bauen.behauptet": ["behauptet: {rolle}", "claims: {rolle}"],
            "bauen.behauptet-titel": ["Die Autor-Behauptung des importierten Plans — hier zählt, was die Substanz trägt (Empfänger-Gesetz). Übernehmen: die Markier-Geste.", "The author's claim of the imported plan — here, what the substance carries is what counts (recipient's law). To adopt it: the marking gesture."],
            "bauen.bewegung": ["Bewegung (Motion-Resonanz)", "Movement (motion resonance)"],
            "bauen.bewegung-arm": ["Arm (Schwung)", "Arm (swing)"],
            "bauen.bewegung-bein": ["Bein (Gang)", "Leg (gait)"],
            "bauen.bewegung-fluegel": ["Flügel (Schlag)", "Wing (beat)"],
            "bauen.bewegung-kopf": ["Kopf (Nicken)", "Head (nod)"],
            "bauen.bewegung-rad": ["Rad an Achse (rollt)", "Wheel on axle (rolls)"],
            "bauen.bewegung-scharnier": ["Scharnier (schwingt am Anker)", "Hinge (swings at the anchor)"],
            "bauen.bewegung-schwanz": ["Schwanz (Welle)", "Tail (wave)"],
            "bauen.bewegung-segel": ["Segel/Tuch (flattert)", "Sail/cloth (flutters)"],
            "bauen.bewegung-titel": ["Die Bewegungs-Rollen emergieren aus Form × Lage × Spiegelung — und aus den VERBINDUNGEN: ein Gelenk (Rad/Tür/Wirbel/Scharnier) entsteht am Anker zwischen zwei verbundenen Teilen. Als Seele getragen oder als Bau erwacht bewegt sich das Werk genau so.", "The movement roles emerge from form × position × mirroring — and from the CONNECTIONS: a joint (wheel/door/vertebra/hinge) forms at the anchor between two connected parts. Carried as a soul or awakened as a build, the work moves exactly like this."],
            "bauen.bewegung-tuer": ["Tür/Schwenk (Scharnier-Achse)", "Door/swing (hinge axis)"],
            "bauen.bewegung-wirbel": ["Wirbel-Kette (Welle)", "Vertebra chain (wave)"],
            "bauen.confirm-loeschen": ["Bauplan '{name}' wirklich löschen?", "Really delete blueprint '{name}'?"],
            "bauen.dein-vibe-pass": ["dein Vibe-Pass", "your Vibe Pass"],
            "bauen.domaene": ["Domäne: {domaene}", "Domain: {domaene}"],
            "bauen.domaene-punkt": ["Domäne: {domaene} — Werkzeuge derselben Domäne teilen die Punkt-Farbe.", "Domain: {domaene} — tools of the same domain share the dot colour."],
            "bauen.eignung": ["Eignung {fit}×", "Fit {fit}×"],
            "bauen.eignung-titel": ["Form-Passung zur Rolle: Material × Form × Handwerk → die Werte steigen/sinken mit Form + Material.", "How well the form suits the role: material × form × craft → the values rise/fall with form + material."],
            "bauen.faehigkeits-werte": ["Fähigkeits-Werte", "Ability values"],
            "bauen.farbe-titel": ["{farbe} → auf Part ziehen wechselt Farbe", "{farbe} → drag onto a part to change its colour"],
            "bauen.generisch": ["generisch", "generic"],
            "bauen.gruppe-anker": ["Anker — Punkt für die Außenwelt (Fläche wählen)", "Anchor — a point for the outside world (pick a face)"],
            "bauen.gruppe-verbinden": ["Verbinden — wie die Teile halten", "Connect — how the parts hold together"],
            "bauen.hud": ["Bau: {label} — {bestaetigen}/{setzen} bauen, {verlassen} verlassen, 1-9 Slot, {abbauen} abbauen", "Build: {label} — {bestaetigen}/{setzen} build, {verlassen} exit, 1-9 slot, {abbauen} dismantle"],
            "bauen.hud-natur-wand": ["{grund} — weiter weg setzen", "{grund} — place it further away"],
            "bauen.hud-schoepfer-frei": ["Schöpfer: frei", "Creator: free"],
            "bauen.hud-standort": ["der Standort trägt nicht — ziel auf ebenen Boden", "the ground here won't hold it — aim for level ground"],
            "bauen.hud-werkstatt": ["du brauchst eine Werkstatt der Domäne „{domaene}\" in der Nähe", "you need a workshop of the “{domaene}” domain nearby"],
            "bauen.kachel-stark-in": [" · stark in: {tags}", " · strong in: {tags}"],
            "bauen.kachel-titel": ["{name} — {beschreibung}\nSubstanz-Stärke dieses Paars: {staerke} / 3", "{name} — {beschreibung}\nSubstance strength of this pair: {staerke} / 3"],
            "bauen.kachel-vorschlag": ["\n✓ passt zur Substanz (Vorschlag)", "\n✓ suits the substance (suggestion)"],
            "bauen.label-grund": ["{label}: {grund}", "{label}: {grund}"],
            "bauen.lehrer-titel": ["Die Lehrer-Geste: welche Achsen-Drehung (oder Tat) diese Rolle zum Sieg führt — aus den Signaturen abgeleitet, dieselbe Skala wie die Balken.", "The teacher's gesture: which axis shift (or deed) leads this role to victory — derived from the signatures, same scale as the bars."],
            "bauen.lod-fein": ["L0 fein", "L0 fine"],
            "bauen.lod-fern": ["L2 fern", "L2 far"],
            "bauen.lod-grob": ["L2 grob", "L2 coarse"],
            "bauen.lod-mittel": ["L1 mittel", "L1 medium"],
            "bauen.lod-regeneration": ["LOD (gröbere Regeneration)", "LOD (coarser regeneration)"],
            "bauen.lod-regeneriere": ["Regeneriere auf LOD-Stufe {stufe} durch die Pipeline", "Regenerate at LOD level {stufe} through the pipeline"],
            "bauen.lod-stufe-vertrag": ["LOD-Stufe (aus den Vertrags-Daten)", "LOD level (from the contract data)"],
            "bauen.lod-vorschau": ["Vorschau auf der ehrlichen Vertrags-Stufe {stufe}", "Preview at the honest contract level {stufe}"],
            "bauen.loesen": ["Lösen", "Detach"],
            "bauen.loesen-titel": ["Die bestehende Verbindung zwischen diesen Parts trennen.", "Sever the existing connection between these parts."],
            "bauen.material-karte-titel": ["{name} → auf Part ziehen wechselt Material", "{name} → drag onto a part to change its material"],
            "bauen.material-profil": ["Material-Profil", "Material profile"],
            "bauen.neu-signieren": ["Neu signieren", "Sign again"],
            "bauen.neue-saat": ["🎲 Neue Saat", "🎲 New seed"],
            "bauen.neue-saat-titel": ["Wirf eine andere Variante (gleiches Rezept, anderer Same) — wie im Studio", "Roll another variant (same recipe, different seed) — just like in the studio"],
            "bauen.nicht-signiert": ["nicht signiert", "not signed"],
            "bauen.noch-keine-substanz": ["noch keine Substanz", "no substance yet"],
            "bauen.offhand-leer": ["Off-Hand leer — G tauscht die Hände", "Off-hand empty — G swaps hands"],
            "bauen.offhand-tauschen": ["Off-Hand — tauschen (G)", "Off-hand — swap (G)"],
            "bauen.physik-spiegel": ["Physik-Spiegel (gerechnet)", "Physics mirror (computed)"],
            "bauen.physik-titel": ["Der Wahrheits-Spiegel: die in Säule I gerechnete Physik (Schwerpunkt · Stützpolygon · Lastpfad · Knicken · Schwung) — ein Richter außerhalb des Systems, kein erfundener Wert. Ein instabiles Werk wankt zudem sichtbar in der 3D-Vorschau.", "The mirror of truth: the physics computed in Pillar I (centre of mass · support polygon · load path · buckling · momentum) — a judge outside the system, no invented value. An unstable work also visibly wobbles in the 3D preview."],
            "bauen.prompt-kopie": ["Name für die Kopie?", "Name for the copy?"],
            "bauen.prompt-neu": ["Name des neuen Bauplans?", "Name of the new blueprint?"],
            "bauen.prozess-titel": ["{name} · {verb} ({cap}) · Werkstatt-Prozess — auf einen Part im 3D ziehen fixt die Rolle", "{name} · {verb} ({cap}) · workshop process — drag onto a part in 3D to fix its role"],
            "bauen.qualitaet": ["Qualität", "Quality"],
            "bauen.qualitaet-titel": ["Qualität = mittlere Part-Präzision · skaliert die Wirkung des Werks (feiner → stärker).", "Quality = average part precision · scales the work's effect (finer → stronger)."],
            "bauen.rezept-kopf": ["Rezept (Studio-Regler · {art})", "Recipe (studio dials · {art})"],
            "bauen.rolle-emergent": ["✨ Emergent aus der ganzen Substanz: Form × Material × Handwerk → die Rolle.", "✨ Emergent from the whole substance: form × material × craft → the role."],
            "bauen.rolle-manuell": ["Manuell gesetzt — überschreibt die emergente Rolle (zurücksetzen via Markier-Sektion).", "Set by hand — overrides the emergent role (reset via the marking section)."],
            "bauen.rollen-resonanz": ["Rollen-Resonanz", "Role resonance"],
            "bauen.sagt-natur-wand": ["{label}: {grund} — setz es ein paar Schritte weiter.", "{label}: {grund} — place it a few steps further on."],
            "bauen.sagt-ort-traegt-nicht": ["{label}: hier steht es nicht — der Ort trägt das Werk nicht.", "{label}: it won't stand here — this spot can't carry the work."],
            "bauen.sagt-standort": ["{label}: der Standort trägt nicht (rote Markierung) — ziel auf ebenen Boden.", "{label}: the ground here won't hold it (red marker) — aim for level ground."],
            "bauen.sagt-werkstatt": ["{label}: du brauchst eine Werkstatt der Domäne „{domaene}\" in der Nähe.", "{label}: you need a workshop of the “{domaene}” domain nearby."],
            "bauen.signatur": ["Signatur", "Signature"],
            "bauen.signatur-geaendert": ["geändert seit der Signatur — neu signieren", "changed since signing — sign again"],
            "bauen.signatur-pruefe": ["prüfe …", "checking …"],
            "bauen.signatur-schluessel": ["ed25519:{schluessel}", "ed25519:{schluessel}"],
            "bauen.signatur-ungueltig": ["⚠ ungültig — passt nicht zu {wer}", "⚠ invalid — does not match {wer}"],
            "bauen.signieren": ["Signieren", "Sign"],
            "bauen.signiert": ["✓ signiert · {wer}", "✓ signed · {wer}"],
            "bauen.slot-leer": ["Slot {nr} leer", "Slot {nr} empty"],
            "bauen.studio-regler-kopf": ["Studio-Regler · {rezept}", "Studio dials · {rezept}"],
            "bauen.teilen": ["Teilen", "Share"],
            "bauen.teilen-fehl": ["Teilen fehlgeschlagen: {grund}", "Sharing failed: {grund}"],
            "bauen.verbindung": ["Verbindung: Part {a} → Part {b}", "Connection: part {a} → part {b}"],
            "bauen.verbunden": ["Part {a} ↔ {b} — verbunden: {art}", "Part {a} ↔ {b} — connected: {art}"],
            "bauen.verbunden-auto": ["Part {a} ↔ {b} — verbunden: {art} (auto — aus Berührung)", "Part {a} ↔ {b} — connected: {art} (auto — from contact)"],
            "bauen.vibe-pass-nicht-bereit": ["Vibe-Pass nicht bereit — siehe Spieler-Drawer.", "Vibe Pass not ready — see the player drawer."],
            "bauen.vorlage": ["↺ Vorlage", "↺ Template"],
            "bauen.vorlage-titel": ["Regler + Same auf das Vorlagen-Rezept zurücksetzen", "Reset dials + seed to the template recipe"],
            "bauen.wachstum": ["Wachstum", "Growth"],
            "bauen.warum": ["✓ {rolle}, weil: {grund}", "✓ {rolle}, because: {grund}"],
            "bauen.warum-titel": ["Lesbare Emergenz: die drei stärksten Achsen-Beiträge (Produkt-Vektor × Signatur-Gewicht) der gewonnenen Rolle.", "Readable emergence: the three strongest axis contributions (product vector × signature weight) to the winning role."],
            "bauen.weitere": ["weitere… ({n})", "more… ({n})"],
            "bauen.weniger": ["weniger…", "less…"],
            "bauen.werkstatt-praezision": ["Werkstatt-Präzision", "Workshop precision"],
            "bauen.werkstatt-praezision-titel": ["Wie fein diese Werkstatt fertigt — dichteres, härteres Material → feinere Toleranzen. Eine bessere Werkstatt hebt den Präzisions-Cap deiner Werke.", "How finely this workshop crafts — denser, harder material → finer tolerances. A better workshop raises the precision cap of your works."],
            "bauen.werkzeug-titel": ["{name} · {op} ({klasse}) · {domaene} · auf Part ziehen wendet Op an", "{name} · {op} ({klasse}) · {domaene} · drag onto a part to apply the op"],
            "bauen.zuruecksetzen": ["↺ Zurücksetzen", "↺ Reset"],
            "bauen.zuruecksetzen-titel": ["Alle Regler auf das Rezept zuruecksetzen (ov leeren)", "Reset all dials to the recipe (clear ov)"],
            "bib.herkunft.angedockt": ["angedockt", "docked"],
            "bib.herkunft.angedockt-titel": ["Diese Welt dockte über den Auto-Vendor an — ihr Bündel liegt in worlds/, sie läuft sandgesichert (W15 Phase 1).", "This world docked via the auto-vendor — its bundle lives in worlds/, and it runs sandboxed (W15 phase 1)."],
            "bib.herkunft.empfangen": ["empfangen", "received"],
            "bib.herkunft.empfangen-titel": ["Diese Welt kam als signiertes Manifest in deine Bibliothek (W14 Phase 3).", "This world arrived in your library as a signed manifest (W14 phase 3)."],
            "bib.herkunft.ki-uebersetzt": ["KI-übersetzt", "AI-translated"],
            "bib.herkunft.ki-uebersetzt-titel": ["Diese Welt übersetzte der KI-Übersetzer aus einer Beschreibung in ein Portal-Manifest (Phase 1).", "The AI translator turned this world from a description into a portal manifest (phase 1)."],
            "bib.journal.architecture": ["Bauwerk", "Building"],
            "bib.journal.creatures": ["Wesen", "Creatures"],
            "bib.journal.emotion": ["Gefühl", "Emotion"],
            "bib.journal.genesis": ["Genesis", "Genesis"],
            "bib.journal.growth": ["Wachstum", "Growth"],
            "bib.journal.loss": ["Verlust", "Loss"],
            "bib.journal.note": ["Notiz", "Note"],
            "bib.journal.portal": ["Portal", "Portal"],
            "bib.journal.reach": ["Reichweite", "Reach"],
            "bib.journal.relationship": ["Beziehung", "Relationship"],
            "bib.journal.ritual": ["Ritual", "Ritual"],
            "bib.journal.rule": ["Regel", "Rule"],
            "bib.journal.share": ["Teilen", "Sharing"],
            "bib.journal.weakness": ["Schwäche", "Weakness"],
            "bib.journal.weather": ["Wetter", "Weather"],
            "bib.journal.witness": ["Zeugnis", "Witness"],
            "bib.stufe.ausgestellt": ["ausgestellt", "exhibited"],
            "bib.stufe.ausgestellt-titel": ["Diese Welt ist spielbar, aber stumm gegenüber der DSL.", "This world is playable, but silent to the DSL."],
            "bib.stufe.uebersetzt": ["übersetzt", "translated"],
            "bib.stufe.uebersetzt-titel": ["Diese Welt versteht ein DSL-Vokabular (Stufe übersetzt). Beim Betreten kann sie es nativ bestätigen.", "This world understands a DSL vocabulary (stage: translated). On entering, it can confirm it natively."],
            "chat.absage.erschoepft": ["Die Welt ist für den Moment erschöpft — versuch es gleich noch einmal.", "The world is exhausted for the moment — try again shortly."],
            "chat.absage.nicht-ganz": ["Die Welt hat den Satz nicht ganz umgesetzt.", "The world didn't fully carry out that sentence."],
            "chat.absage.passt-nicht": ["Etwas an dem Satz passt nicht zur Welt.", "Something in that sentence doesn't fit the world."],
            "chat.absage.unbekannt": ["Das kennt die Welt (noch) nicht.", "The world doesn't know that (yet)."],
            "chat.absage.zerbrochen": ["Dabei ist etwas zerbrochen — das Logbuch nennt es.", "Something broke along the way — the log names it."],
            "chat.befehl.debug.an": ["Debug-Logs aktiviert", "Debug logs enabled"],
            "chat.befehl.debug.aus": ["Debug-Logs deaktiviert", "Debug logs disabled"],
            "chat.befehl.dorf.gruendung": ["Siedlung wird gegründet (Settlement-Export läuft) …", "Founding the settlement (settlement export running) …"],
            "chat.befehl.dorf.keine-epoche": ["Keine Epoche „{epoche}\" — es gibt {epochen}.", "No era “{epoche}” — there are: {epochen}."],
            "chat.befehl.dorf.keine-epoche-kern": ["Keine Epoche „{epoche}\" — es gibt keine (Kern fehlt).", "No era “{epoche}” — there are none (core missing)."],
            "chat.befehl.faehigkeit.ausgefuehrt": ["Fähigkeit '{name}' ausgeführt", "Ability '{name}' performed"],
            "chat.befehl.faehigkeit.gelernt": ["Fähigkeit '{name}' gelernt: {beschreibung}", "Ability '{name}' learned: {beschreibung}"],
            "chat.befehl.faehigkeit.gewaehr-aus": ["Die Gewähr blieb aus.", "The grant was not given."],
            "chat.befehl.faehigkeit.gewaehrt": ["Fähigkeit „{name}\" gewährt — „wirke {name}\" führt sie aus.", "Ability “{name}” granted — “wirke {name}” casts it."],
            "chat.befehl.faehigkeit.gewirkt": ["Fähigkeit „{name}\" gewirkt.", "Ability “{name}” cast."],
            "chat.befehl.faehigkeit.nicht-gefunden": ["Fähigkeit '{name}' nicht gefunden. Lerne sie mit 'Lerne Fähigkeit <Name> <Beschreibung>'", "Ability '{name}' not found. Learn it with 'Lerne Fähigkeit <name> <description>'"],
            "chat.befehl.faehigkeit.nicht-gereicht": ["Keine Welt hat diese Fähigkeit gereicht.", "No world has offered this ability."],
            "chat.befehl.faehigkeit.nicht-gewaehrt": ["Diese Fähigkeit wurde (noch) nicht gewährt.", "This ability hasn't been granted (yet)."],
            "chat.befehl.faehigkeit.nicht-wirkbar": ["Die Fähigkeit ließ sich nicht wirken.", "The ability couldn't be cast."],
            "chat.befehl.faehigkeit.revoziert": ["Verweigert — die Herkunft dieser Fähigkeit ist revoziert.", "Refused — this ability's origin has been revoked."],
            "chat.befehl.faehigkeit.ruht": ["Diese Fähigkeit ruht — ihre Herkunft wurde revoziert.", "This ability lies dormant — its origin was revoked."],
            "chat.befehl.heim.gezogen": ["Du bist heimgezogen — deine Heimat-Welt ist wieder die Basis.", "You've moved home — your home world is your base again."],
            "chat.befehl.heim.schon-daheim": ["Du wohnst nirgendwo fremd — du bist schon daheim.", "You don't live anywhere else — you're already home."],
            "chat.befehl.klang.buch-kalt": ["Das Klang-Buch ist noch kalt — gleich nochmal versuchen.", "The sound book is still cold — try again in a moment."],
            "chat.befehl.klang.fuehrt": ["Klang: das Lofi-Pad führt jetzt „{genre}\" — {bpm} BPM · {skala} · {harmonie}/{rhythmus}.", "Sound: the lofi pad now plays “{genre}” — {bpm} BPM · {skala} · {harmonie}/{rhythmus}."],
            "chat.befehl.klang.heimat": ["Klang: zurück zur Heimat-Stimme (Host-Lofi).", "Sound: back to the home voice (host lofi)."],
            "chat.befehl.klang.kein-genre": ["Kein Klang-Genre „{wahl}\". Das Studio kennt: {genres} — oder „spiele heimat\".", "No sound genre “{wahl}”. The studio knows: {genres} — or “spiele heimat”."],
            "chat.befehl.physik.optimiert": ["Physik optimiert", "Physics optimized"],
            "chat.befehl.physik.tunneling": ["Physik-Tunneling behoben: CCD angepasst", "Physics tunneling fixed: CCD adjusted"],
            "chat.befehl.praege.buch-fehlt": ["Das {achse}-Gesetzbuch ist nicht geladen.", "The {achse} law book isn't loaded."],
            "chat.befehl.praege.gepraegt": ["Geprägt: „{rezept}\" trägt fortan die {achse} „{zeile}\".", "Forged: “{rezept}” now carries the {achse} “{zeile}”."],
            "chat.befehl.praege.kein-rezept": ["Kein Studio-Rezept „{gattung}\" im Buch.", "No studio recipe “{gattung}” in the book."],
            "chat.befehl.praege.keine-achse": ["„{rezept}\" ({art}) trägt keine Charakter-Achse.", "“{rezept}” ({art}) has no character axis."],
            "chat.befehl.praege.zeilen": ["Die {achse} des Studios: {zeilen}.", "The studio's {achse} options: {zeilen}."],
            "chat.befehl.symphonie.aktiviert": ["Anazh-Symphonie aktiviert — die Welt klingt (und die Kreaturen beleben sich).", "Anazh Symphony activated — the world sings (and the creatures come alive)."],
            "chat.befehl.symphonie.ohne-klang": ["Anazh-Symphonie: Belebung aktiv; Klang konnte nicht starten (kein Audio-Kontext).", "Anazh Symphony: creatures enlivened; sound couldn't start (no audio context)."],
            "chat.befehl.version.aktiviert": ["Version {version} aktiviert", "Version {version} activated"],
            "chat.befehl.version.nicht-gefunden": ["Version {version} nicht gefunden", "Version {version} not found"],
            "chat.befehl.welt.aktiv-nicht-loeschbar": ["Die aktive Welt kann nicht gelöscht werden. Wechsle erst zu einer anderen.", "The active world can't be deleted. Switch to another one first."],
            "chat.befehl.welt.erschaffen-mit-person": ["Neue Welt erschaffen (lade neu, Person übernommen…)", "New world created (reloading, character carried over…)"],
            "chat.befehl.welt.erschaffen-neue-person": ["Neue Welt erschaffen (lade neu, Person neu…)", "New world created (reloading, new character…)"],
            "chat.befehl.welt.geloescht": ["Welt „{slug}\" gelöscht.", "World “{slug}” deleted."],
            "chat.befehl.welt.generiert": ["Neue Welt generiert", "New world generated"],
            "chat.befehl.welt.nicht-erschaffen": ["Neue Welt konnte nicht erschaffen werden — siehe Log.", "The new world couldn't be created — see the log."],
            "chat.befehl.welt.nicht-gefunden": ["Welt „{slug}\" nicht gefunden.", "World “{slug}” not found."],
            "chat.befehl.welt.nicht-gefunden-liste": ["Welt „{slug}\" nicht gefunden. Befehl „liste welten\" zeigt verfügbare.", "World “{slug}” not found. The command “liste welten” shows what’s available."],
            "chat.befehl.welt.wechsel-verweigert": ["Welt-Wechsel verweigert (siehe Log).", "World switch refused (see log)."],
            "chat.befehl.welt.wechsle": ["Wechsle zu {slug}…", "Switching to {slug}…"],
            "chat.befehl.welten.kopf": ["Welten im Speicher ({n}):", "Worlds in storage ({n}):"],
            "chat.befehl.welten.nur-eine": ["Nur diese eine Welt im Speicher.", "Only this one world in storage."],
            "chat.befehl.welten.zeile": ["  {slug} — {tage}d alt, ID {id}…", "  {slug} — {tage}d old, ID {id}…"],
            "chat.befehl.welten.zeile-aktiv": ["★ {slug} — {tage}d alt, ID {id}…", "★ {slug} — {tage}d old, ID {id}…"],
            "chat.befehl.wohnen.heimat": ["Du bist in deiner Heimat-Welt — wohnen kannst du nur in einer Portal-Welt.", "You're in your home world — you can only settle in a portal world."],
            "chat.befehl.wohnen.hier": ["Du wohnst jetzt hier — der nächste Aufbruch bringt dich hierher zurück.", "You live here now — your next departure brings you back here."],
            "chat.befehl.wohnen.nicht-bibliothek": ["Diese Welt ist nicht in deiner Bibliothek — hier kannst du nicht wohnen.", "This world isn't in your library — you can't live here."],
            "chat.befehl.zustand.datei-picker": ["Datei-Picker geöffnet – wähle eine anazhRealmState.json", "File picker open – choose an anazhRealmState.json"],
            "chat.befehl.zustand.geladen": ["Zustand aus localStorage geladen", "State loaded from localStorage"],
            "chat.befehl.zustand.gespeichert-download": ["Zustand gespeichert (Browser-Download + localStorage)", "State saved (browser download + localStorage)"],
            "chat.befehl.zustand.gespeichert-lokal": ["Zustand gespeichert (nur localStorage)", "State saved (localStorage only)"],
            "chat.befehl.zustand.gespeichert-ordner": ["Zustand gespeichert (direkt im Spielordner + localStorage)", "State saved (straight to the game folder + localStorage)"],
            "chat.befehl.zustand.nicht-gespeichert": ["Nicht gespeichert: die Seite wechselt gerade die Welt.", "Not saved: the page is switching worlds right now."],
            "chat.fehler.befehl": ["(Befehl-Fehler: {fehler})", "(Command error: {fehler})"],
            "chat.fehler.begleiter": ["({name}-Fehler: {fehler})", "({name} error: {fehler})"],
            "chat.fehler.kreatur": ["(Kreatur-Fehler: {fehler})", "(Creature error: {fehler})"],
            "chat.fehler.system": ["(System-Befehl-Fehler: {fehler})", "(System command error: {fehler})"],
            "chat.gesetz.aufgestellt": ["Gesetz aufgestellt — {tat}.", "Law set — {tat}."],
            "chat.gesetz.nicht-aufgestellt": ["Die Regel ließ sich nicht aufstellen (siehe Log).", "The rule couldn't be set (see log)."],
            "chat.gesetze.eins-vergessen": ["{n} deiner Gesetz vergessen.", "{n} of your laws forgotten."],
            "chat.gesetze.keine-eigenen": ["Du hattest keine eigenen Gesetze.", "You had no laws of your own."],
            "chat.gesetze.vergessen": ["{n} deiner Gesetze vergessen.", "{n} of your laws forgotten."],
            "chat.ki-vorschlag": ["KI-Vorschlag: {vorschlag}", "AI suggestion: {vorschlag}"],
            "chat.ki-vorschlag.faehigkeit": ["Möchtest du eine neue Fähigkeit lernen? Beispiel: 'Lerne Fähigkeit farbwechsel Ändere Farbe von Kreaturen zu blau'", "Want to learn a new ability? Example: 'Lerne Fähigkeit farbwechsel Ändere Farbe von Kreaturen zu blau'"],
            "chat.ki-vorschlag.kreaturen": ["Möchtest du mehr Kreaturen spawnen? Beispiel: 'Spawne Kreaturen 10'", "Want to spawn more creatures? Example: 'Spawne Kreaturen 10'"],
            "chat.ki-vorschlag.physik": ["Soll ich die Physik weiter optimieren? Sage 'Entwickle Physik'", "Shall I tune the physics further? Say 'Entwickle Physik'"],
            "chat.ki-vorschlag.sternenhimmel": ["Wie wäre es mit einem neuen Sternenhimmel? Beispiel: 'Ändere Sternenhimmel red'", "How about a new starry sky? Example: 'Ändere Sternenhimmel red'"],
            "chat.ki-vorschlag.steuerung": ["Soll ich die Spielsteuerung erweitern? Beispiel: 'Implementiere Spielsteuerung'", "Shall I extend the game controls? Example: 'Implementiere Spielsteuerung'"],
            "chat.ki-vorschlag.terrain": ["Soll ich das Terrain flacher machen? Beispiel: 'Setze Terrain Steilheit 0.5'", "Shall I make the terrain flatter? Example: 'Setze Terrain Steilheit 0.5'"],
            "chat.ki-vorschlag.welt": ["Möchtest du eine neue Welt erschaffen? Beispiel: 'Erschaffe Welt forest'", "Want to create a new world? Example: 'Erschaffe Welt forest'"],
            "chat.mana.erschoepft": ["Zu erschöpft für diese Geste (Mana {mana}/{kosten} nötig).", "Too exhausted for this gesture ({mana}/{kosten} mana needed)."],
            "chat.ort.kein-ort": ["kein Ort", "no place"],
            "chat.ort.kein-wasser": ["{satz} — am Wasser wächst hier nichts. Geh näher an ein Ufer.", "{satz} — nothing grows by the water here. Move closer to a shore."],
            "chat.ort.nichts-geschah": ["{satz} — nichts geschah.", "{satz} — nothing happened."],
            "chat.portal.kein-befehl": ["(Im Portal — „{befehl}\" ist kein DSL-Befehl für diese Welt.)", "(Inside the portal — “{befehl}” is not a DSL command for this world.)"],
            "chat.regeln.der-nexus": ["der Nexus", "the Nexus"],
            "chat.regeln.eine": ["{n} Welt-Regel:", "{n} world rule:"],
            "chat.regeln.keine": ["Noch keine Welt-Regeln. Sag z. B. „{vorlage}\".", "No world rules yet. Try saying “{vorlage}”."],
            "chat.regeln.viele": ["{n} Welt-Regeln:", "{n} world rules:"],
            "chat.regeln.zeile": ["• {regel} (von {wer})", "• {regel} (by {wer})"],
            "chat.unbekannt": ["Unbekannter Befehl — sag „hilfe\", dann zeigt dir die Welt, was sie versteht.", "Unknown command — say “hilfe” and the world will show you what it understands."],
            "chat.vorschlag.oder": ["{absage} Oder meintest du: '{vorschlag}'?", "{absage} Or did you mean: '{vorschlag}'?"],
            "chat.vorschlag.unbekannt": ["Unbekannter Befehl. Meintest du: '{vorschlag}'? („hilfe\" zeigt, was die Welt versteht.)", "Unknown command. Did you mean: '{vorschlag}'? (“hilfe” shows what the world understands.)"],
            "gefuehl.aufruhr": ["Aufruhr", "Turmoil"],
            "gefuehl.aufruhr-wirkt": ["entfesselt die Wesen, treibt alles an", "unleashes the creatures, drives everything on"],
            "gefuehl.ehrfurcht": ["Ehrfurcht", "Awe"],
            "gefuehl.ehrfurcht-wirkt": ["zieht magisches Licht heran", "draws in magical light"],
            "gefuehl.freude": ["Freude", "Joy"],
            "gefuehl.freude-wirkt": ["wärmt den Himmel golden", "warms the sky to gold"],
            "gefuehl.frieden": ["Frieden", "Peace"],
            "gefuehl.frieden-wirkt": ["besänftigt + verlangsamt die Wesen", "soothes + slows the creatures"],
            "gefuehl.hoffnung": ["Hoffnung", "Hope"],
            "gefuehl.hoffnung-wirkt": ["klärt den Himmel, erhellt die Wesen", "clears the sky, brightens the creatures"],
            "gefuehl.leer": ["leer", "empty"],
            "gefuehl.ruhig": ["ruhig", "calm"],
            "gefuehl.trauer": ["Trauer", "Sorrow"],
            "gefuehl.trauer-wirkt": ["lässt Regen fallen", "lets the rain fall"],
            "gefuehl.zwiespalt": ["Zwiespalt ({eins} und {zwei})", "Torn ({eins} and {zwei})"],
            "hof.abwehr": ["Abwehr", "Defense"],
            "hof.abwehr-titel-ich": ["physische Abwehr (dichte+härte, + Rüstung)", "physical defense (density+hardness, + armor)"],
            "hof.abwehr-titel-wesen": ["physische Abwehr (dichte+härte)", "physical defense (density+hardness)"],
            "hof.aeltere-eintraege": ["+ {n} ältere Einträge", "+ {n} older entries"],
            "hof.alle": ["Alle", "All"],
            "hof.alle-sektion": ["Alle {sektion}:", "All {sektion}:"],
            "hof.anlegen": ["Anlegen", "Equip"],
            "hof.auftrag": ["⚒ Auftrag…", "⚒ Task…"],
            "hof.auftrag-fuer": ["Auftrag für {name}", "Task for {name}"],
            "hof.auftrag-titel": ["{name}: Sammle ein Material oder Baue einen Bauplan", "{name}: Gather a material or build a blueprint"],
            "hof.ausdauer": ["Ausdauer", "Stamina"],
            "hof.ausdauer-titel-ich": ["max. Ausdauer", "max. stamina"],
            "hof.ausdauer-titel-wesen": ["max. Ausdauer (leicht+wärmeleitung)", "max. stamina (lightness+heat conduction)"],
            "hof.baue": ["Baue", "Build"],
            "hof.bauer": ["Bauer", "Builder"],
            "hof.bauplan": ["Bauplan", "Blueprint"],
            "hof.bauwerk": ["Bauwerk", "Structure"],
            "hof.bindung": ["Bindung", "Bond"],
            "hof.bindung-titel": ["Bindung — die Beziehung wächst, während das Wesen folgt + nah bleibt (gewichtet Contagion + Verlust).", "Bond — the relationship grows while the creature follows + stays close (weights contagion + loss)."],
            "hof.boost-basis": ["✺ Boost", "✺ Boost"],
            "hof.boost-laeuft": ["Läuft in {rest}s aus.", "Ends in {rest}s."],
            "hof.boost-wirkt": ["Wirkt jetzt: {effekt} — läuft in {rest}s aus.", "Active now: {effekt} — ends in {rest}s."],
            "hof.brauen-trinken": ["Brauen + Trinken", "Brew + Drink"],
            "hof.buehne-leer": ["Wähle ein Wesen aus dem Orchester — es tritt hier auf die Bühne.", "Choose a creature from the orchestra — it steps onto the stage here."],
            "hof.chronik-leer": ["Die Welt hat noch nichts erlebt.", "The world has lived through nothing yet."],
            "hof.du": ["Du", "You"],
            "hof.emotion-titel": ["Dominante Emotion: {emotion} — Intensität {prozent} % (färbt Verhalten + Contagion).", "Dominant emotion: {emotion} — intensity {prozent} % (colors behavior + contagion)."],
            "hof.erfolge": ["{n} Erfolge", "{n} successes"],
            "hof.erfolge-meister": ["{n} Erfolge — Meisterschaft", "{n} successes — mastery"],
            "hof.erfolge-weg": ["{n} Erfolge — auf dem Weg zu L{level}", "{n} successes — on the way to L{level}"],
            "hof.erinnerungen": ["{n} Erinnerungen (gekappt auf das Lebens-Gedächtnis)", "{n} memories (capped to its lifetime memory)"],
            "hof.es-fehlt": ["Es fehlt: {liste}", "Missing: {liste}"],
            "hof.fahrzeug": ["Fahrzeug", "Vehicle"],
            "hof.fertigen": ["Fertigen", "Craft"],
            "hof.fertigen-titel": ["Fertigen — das Werk steht, wohin du blickst; trägt der Ort nicht, zielt das Phantom (F setzt).", "Craft — the work stands where you look; if the spot can't hold it, the phantom aims (F places)."],
            "hof.folge": ["Folge", "Follow"],
            "hof.frei": ["frei", "free"],
            "hof.gefuehl": ["Gefühl", "Feeling"],
            "hof.geschichte": ["Geschichte", "History"],
            "hof.griffbereit": ["Griffbereit", "At hand"],
            "hof.haupthand": ["Haupthand", "Main hand"],
            "hof.haupthand-ablegen": ["Klick → ablegen · Wechseln über die Hotbar · G tauscht mit der Nebenhand", "Click → put away · Switch via the hotbar · G swaps with the off hand"],
            "hof.haupthand-titel": ["Die Haupthand — wählen über die Hotbar; G tauscht mit der Nebenhand (Slot links der Hotbar)", "The main hand — choose via the hotbar; G swaps with the off hand (slot left of the hotbar)"],
            "hof.hitze-resistenz": ["Hitze-Resistenz", "Heat resistance"],
            "hof.hof-leer": ["Dein Hof ist still. ✦ Rufe dein erstes Wesen — wähle eine Form unten und drücke +1.", "Your court is quiet. ✦ Call your first creature — pick a form below and press +1."],
            "hof.hp": ["HP", "HP"],
            "hof.hp-titel-ich": ["Lebenskraft (lebend/max)", "Vitality (current/max)"],
            "hof.hp-titel-wesen": ["Lebenspunkte (lebend/max)", "Hit points (current/max)"],
            "hof.hr": ["HR", "HR"],
            "hof.in-die-hand": ["In die Hand", "Take in hand"],
            "hof.kein-innenleben": ["noch kein Innenleben", "no inner life yet"],
            "hof.keine-boosts": ["keine aktiven Boosts", "no active boosts"],
            "hof.keine-geschichte": ["noch keine Geschichte", "no history yet"],
            "hof.keine-substanz": ["noch keine Substanz", "no substance yet"],
            "hof.keine-wahl": ["— keine —", "— none —"],
            "hof.klick-buehne": ["Klick: Wesen auf die Bühne holen", "Click: bring the creature onto the stage"],
            "hof.leer": ["— leer —", "— empty —"],
            "hof.leer-faust": ["— leer (Faust) —", "— empty (fist) —"],
            "hof.magie-resistenz": ["Magie-Resistenz", "Magic resistance"],
            "hof.mr": ["MR", "MR"],
            "hof.natur": ["Natur", "Nature"],
            "hof.natur-titel": ["{tag}: {wert} (Natur, 0–3 — speist die Werte)", "{tag}: {wert} (nature, 0–3 — feeds the stats)"],
            "hof.nichts-getragen": ["nichts getragen", "nothing equipped"],
            "hof.praezision": ["Präzision", "Precision"],
            "hof.praezision-titel": ["Präzision (magieleitung+zähigkeit)", "Precision (magic conduction+toughness)"],
            "hof.rezepte-leer": ["Noch keine craftbaren Baupläne — entwirf eines in der Werkstatt.", "No craftable blueprints yet — design one in the Workshop."],
            "hof.rolle-weil": ["{rolle}, weil: {grund}", "{rolle}, because: {grund}"],
            "hof.ruestung": ["Rüstung", "Armor"],
            "hof.ruestung-titel": ["Rüstung: {name}", "Armor: {name}"],
            "hof.ruestung-wechseln": ["Rüstung wechseln (frei, wenn schon geschmiedet)", "Change armor (free once forged)"],
            "hof.sammle": ["Sammle", "Gather"],
            "hof.sammler": ["Sammler", "Gatherer"],
            "hof.schaden": ["Schaden", "Damage"],
            "hof.schaden-titel-ich": ["Schaden pro Schlag (härte+dichte, + Werkzeug)", "Damage per hit (hardness+density, + tool)"],
            "hof.schaden-titel-wesen": ["Schaden pro Schlag (härte+dichte)", "Damage per hit (hardness+density)"],
            "hof.sektion-baer": ["Bären", "Bears"],
            "hof.sektion-fuchs": ["Füchse", "Foxes"],
            "hof.sektion-leer": ["Keine „{sektion}\" mehr im Hof. Wähle „Alle\" oben.", "No more “{sektion}” in the court. Choose “All” above."],
            "hof.sektion-wesen": ["Hirsche", "Deer"],
            "hof.sektion-wolf": ["Wölfe", "Wolves"],
            "hof.status-bauplan": ["Reine Information — das Fertigen zieht das Material (Frieden und Pfad), dann ist der Gebrauch frei.", "Pure information — crafting draws the material (Peace and Path), then using it is free."],
            "hof.status-bauwerk": ["Fertigen setzt das Werk, wohin du blickst — das Setzen zieht das Material (Frieden und Pfad), frei ist nur Schöpfer.", "Crafting places the work where you look — placing draws the material (Peace and Path); only Creator is free."],
            "hof.status-werk": ["Gefertigt — die Präzision ist eingefroren, der Gebrauch ist frei.", "Crafted — its precision is locked in, using it is free."],
            "hof.stimmung-titel": ["Stimmung: {stimmung} — die Resonanz des Wesens auf das Feld + die Bindung", "Mood: {stimmung} — the creature's resonance with the field + the bond"],
            "hof.streift": ["Streift", "Roam"],
            "hof.substanz": ["Substanz — speist die Werte", "Substance — feeds the stats"],
            "hof.substanz-titel": ["Die Compound-Tags (Natur, 0–3), aus denen die Werte emergieren — Werkstatt-Wissen.", "The compound tags (nature, 0–3) the stats emerge from — Workshop knowledge."],
            "hof.task-baut": ["baut", "building"],
            "hof.task-baut-bauplan": ["baut {bauplan}", "building {bauplan}"],
            "hof.task-folgt": ["folgt", "following"],
            "hof.task-sammelt": ["sammelt", "gathering"],
            "hof.task-sammelt-material": ["sammelt {material}", "gathering {material}"],
            "hof.task-streift": ["streift", "roaming"],
            "hof.task-trinkt": ["trinkt am Ufer", "drinking at the shore"],
            "hof.task-wartet": ["wartet", "waiting"],
            "hof.tempo": ["Tempo", "Speed"],
            "hof.tempo-titel-ich": ["Lauf-Tempo (leicht+magieleitung)", "Running speed (lightness+magic conduction)"],
            "hof.tempo-titel-wesen": ["Bewegungstempo (leicht+magieleitung)", "Movement speed (lightness+magic conduction)"],
            "hof.trank": ["Trank", "Potion"],
            "hof.verabschieden": ["✕ Verabschieden", "✕ Farewell"],
            "hof.verabschieden-titel": ["{name} aus der Welt verabschieden", "Bid {name} farewell from the world"],
            "hof.verfassung": ["Verfassung", "Condition"],
            "hof.verfassung-titel": ["Verfassung — dein Lebensanteil (HP / max).", "Condition — your share of life (HP / max)."],
            "hof.vor-h": ["vor {n}h", "{n}h ago"],
            "hof.vor-m": ["vor {n}m", "{n}m ago"],
            "hof.vor-s": ["vor {n}s", "{n}s ago"],
            "hof.wachstum": ["Wachstum & Geschichte", "Growth & History"],
            "hof.warte": ["Warte", "Wait"],
            "hof.weitere-fertigkeiten": ["+ {n} weitere Fertigkeiten", "+ {n} more skills"],
            "hof.werk": ["Werk ✓", "Crafted ✓"],
            "hof.werkzeug-titel": ["Werkzeug: {name}", "Tool: {name}"],
            "hof.werte": ["Werte", "Stats"],
            "hof.werte-berechnet": ["Werte werden berechnet …", "Calculating stats …"],
            "hof.werte-seele": ["Werte werden berechnet, wenn die Seele steht.", "Stats are calculated once the soul is set."],
            "hof.wesen": ["Wesen", "Creature"],
            "hof.wesen-zeile-titel": ["HP {hp}/{hpMax} · DMG {dmg} · SPD {spd} · JMP {jmp} · STA {sta} · PRC {prc} · MR {mr} · HR {hr} · Stimmung {stimmung}", "HP {hp}/{hpMax} · DMG {dmg} · SPD {spd} · JMP {jmp} · STA {sta} · PRC {prc} · MR {mr} · HR {hr} · Mood {stimmung}"],
            "hud.aeltere-gesten": ["+ {n} ältere Gesten", "+ {n} older gestures"],
            "hud.aktiv": ["⚡ aktiv · {n}×", "⚡ active · {n}×"],
            "hud.alle-n": ["▸ alle {n}", "▸ all {n}"],
            "hud.alle-wesen": ["Alle Wesen: {wort}", "All creatures: {wort}"],
            "hud.auftrag": ["Auftrag", "Task"],
            "hud.bauten-nah": ["{nah} nah / {gesamt}", "{nah} near / {gesamt}"],
            "hud.befehl": ["Befehl", "Command"],
            "hud.deine-gesetze": ["Deine Gesetze · {n}", "Your laws · {n}"],
            "hud.druecke-knopf": ["Drücke Knopf…", "Press a button…"],
            "hud.druecke-taste": ["Drücke Taste…", "Press a key…"],
            "hud.experiment-aktivieren": ["Experiment aktivieren", "Activate experiment"],
            "hud.experiment-behalten": ["Experiment behalten (wird permanent)", "Keep experiment (becomes permanent)"],
            "hud.experiment-verstummen": ["Experiment verstummen", "Silence experiment"],
            "hud.experiment-verwerfen": ["Experiment verwerfen", "Discard experiment"],
            "hud.favorit": ["Favorit", "Favorite"],
            "hud.feuert": ["⚡ feuert", "⚡ firing"],
            "hud.gate-chrome": ["Chrome oder Edge ab Version 113 (oder neuer) öffnen.", "Open Chrome or Edge version 113 (or newer)."],
            "hud.gate-firefox": ["Firefox: about:config → dom.webgpu.enabled auf true setzen.", "Firefox: about:config → set dom.webgpu.enabled to true."],
            "hud.gate-fuss": ["Sobald dein Browser WebGPU spricht, lädst du diese Seite einfach neu — die Welt ist dann da.", "Once your browser speaks WebGPU, just reload this page — the world will be there."],
            "hud.gate-lead": ["Diese Welt rendert mit WebGPU — der modernen Grafik-Schnittstelle des Webs. Dein Browser meldet sie noch nicht. Das ist kein Fehler in der Welt, nur eine Schwelle.", "This world renders with WebGPU — the web's modern graphics interface. Your browser doesn't report it yet. That's no flaw in the world, just a threshold."],
            "hud.gate-link": ["WebGPU-Browser-Unterstützung ansehen →", "See WebGPU browser support →"],
            "hud.gate-safari": ["Safari 18+ auf macOS/iOS — WebGPU ist standardmäßig dabei.", "Safari 18+ on macOS/iOS — WebGPU is on by default."],
            "hud.gate-titel": ["AnazhRealm erwacht in WebGPU", "AnazhRealm awakens in WebGPU"],
            "hud.gate-wie": ["So trittst du ein:", "How to step inside:"],
            "hud.gesetz-aktivieren": ["Gesetz aktivieren", "Activate law"],
            "hud.gesetz-pausieren": ["Gesetz pausieren", "Pause law"],
            "hud.gesetz-vergessen": ["Gesetz vergessen", "Forget law"],
            "hud.gesetze-eigene-leer": ["Noch keine eigenen — sprich eine Regel, oder 📌 adoptiere ein Nexus-Experiment.", "None of your own yet — speak a rule, or 📌 adopt a Nexus experiment."],
            "hud.gesetze-leer": ["Noch keine Gesetze. Sag z. B. „{vorlage}\".", "No laws yet. Try saying “{vorlage}”."],
            "hud.geste": ["✦ Geste", "✦ Gesture"],
            "hud.geste-titel": ["Eine einmalige Tat (kein stehendes Gesetz) — ▶ wirkt sie erneut.", "A one-time deed (not a standing law) — ▶ casts it again."],
            "hud.geste-vergessen": ["Geste {name} vergessen", "Forget gesture {name}"],
            "hud.geste-wirken": ["Geste {name} erneut wirken", "Cast gesture {name} again"],
            "hud.gesten-kopf": ["✦ Gesten · {n}", "✦ Gestures · {n}"],
            "hud.gesten-kopf-juengste": ["✦ Gesten · {n} (die jüngsten {gezeigt})", "✦ Gestures · {n} (the latest {gezeigt})"],
            "hud.gesten-leer": ["Noch keine Gesten — der Nexus hat noch nichts komponiert.", "No gestures yet — the Nexus hasn't composed anything."],
            "hud.gesten-verwerfen": ["Alle Nexus-Gesten verwerfen", "Discard all Nexus gestures"],
            "hud.groesse-aendern": ["Größe ändern", "Resize"],
            "hud.groesse-default": ["Größe ändern · Doppelklick: Default", "Resize · Double-click: default"],
            "hud.groesse-ziehen": ["Größe ziehen (wächst nach oben) · Doppelklick: Standard", "Drag to resize (grows upward) · Double-click: default"],
            "hud.grok": ["Grok", "Grok"],
            "hud.konsole-einklappen": ["Konsole einklappen", "Collapse console"],
            "hud.konsole-entfalten": ["Konsole entfalten", "Expand console"],
            "hud.kreatur": ["Kreatur", "Creature"],
            "hud.leeren": ["leeren", "clear"],
            "hud.leertaste": ["Leertaste", "Space"],
            "hud.maus-links": ["Linke Maustaste", "Left mouse button"],
            "hud.maus-mitte": ["Mittlere Maustaste", "Middle mouse button"],
            "hud.maus-rechts": ["Rechte Maustaste", "Right mouse button"],
            "hud.mensch": ["mensch", "human"],
            "hud.mensch-gestalt": ["mensch ✦ Studio-Gestalt", "human ✦ studio shape"],
            "hud.mensch-titel": ["koerperstudio — dein Menschen-Körper", "koerperstudio — your human body"],
            "hud.mensch-titel-uebergabe": ["koerperstudio — dein Menschen-Körper (trägt die Live-Übergabe aus dem Studio)", "koerperstudio — your human body (carries the live handoff from the studio)"],
            "hud.minuten": ["{n} Min", "{n} min"],
            "hud.nexus": ["Nexus", "Nexus"],
            "hud.nexus-erprobt": ["Der Nexus erprobt · {n}", "The Nexus is testing · {n}"],
            "hud.nexus-erprobt-wertvollste": ["Der Nexus erprobt · {n} (die wertvollsten {gezeigt})", "The Nexus is testing · {n} (the most valuable {gezeigt})"],
            "hud.oeffnen": ["öffnen", "open"],
            "hud.omnibox-leer": ["Kein Treffer — tippe weiter oder sprich frei zum Nexus.", "No match — keep typing or speak freely to the Nexus."],
            "hud.pausiert": ["pausiert", "paused"],
            "hud.perf-datei": ["{name} ({kb} kB)", "{name} ({kb} kB)"],
            "hud.perf-extra": [" · {dc}dc · {tris}k▲ · Szene {szene}%", " · {dc}dc · {tris}k▲ · Scene {szene}%"],
            "hud.perf-keine-daten": ["noch keine Daten — erst ein paar Sekunden spielen", "no data yet — play for a few seconds first"],
            "hud.permanent": ["permanent", "permanent"],
            "hud.raum": ["Raum", "Room"],
            "hud.raum-bibliothek": ["Bibliothek", "Library"],
            "hud.raum-einstellungen": ["Einstellungen", "Settings"],
            "hud.raum-hof": ["Hof", "Court"],
            "hud.raum-ich": ["Ich", "Self"],
            "hud.raum-werkstatt": ["Werkstatt", "Workshop"],
            "hud.ruht": ["ruht", "resting"],
            "hud.sandbox-welt": ["Sandbox-Welt", "Sandbox world"],
            "hud.schnell-truenke": ["Schnell-Trünke (Tabelle):", "Quick potions (table):"],
            "hud.sprich": ["Sprich: „{satz}\"", "Say: “{satz}”"],
            "hud.stimme-an": ["Stimme: an", "Voice: on"],
            "hud.stimme-aus": ["Stimme: aus", "Voice: off"],
            "hud.stimme-standard": ["Standard (Browser)", "Default (browser)"],
            "hud.studio-wesen": ["Studio-Wesen", "Studio creatures"],
            "hud.tetrapoda-titel": ["tetrapoda — {name} (verkörpert, freier Wechsel)", "tetrapoda — {name} (embodied, switch freely)"],
            "hud.trinken": ["Trinken", "Drink"],
            "hud.trunk-zeile": ["{name} ({sekunden} s, Tabelle)", "{name} ({sekunden} s, table)"],
            "hud.verfaellt": ["verfällt in ~{n}s", "expires in ~{n}s"],
            "hud.weitere-geringer": ["+ {n} weitere mit geringerem Wert", "+ {n} more of lower value"],
            "hud.welt": ["Welt", "World"],
            "hud.welt-regel": ["eine Welt-Regel", "a world rule"],
            "hud.weniger": ["▾ weniger", "▾ less"],
            "hud.wert-titel": ["Gelernter Wert (struktureller δ am Ort der Regel) — die wertvollsten überleben + werden adoptierbar.", "Learned value (structural δ where the rule acts) — the most valuable survive + become adoptable."],
            "hud.zum-nexus": ["zum Nexus", "to the Nexus"],
            "kern.fps": ["FPS: {fps}", "FPS: {fps}"],
            "kern.lade-erwachen-fehl": ["die Welt konnte nicht erwachen: {grund}", "the world could not awaken: {grund}"],
            "kern.lade-gpu-stumm": ["die Grafikkarte antwortet seit 25 s nicht — versuche ?holz=kienspan", "the graphics card has not answered for 25 s — try ?holz=kienspan"],
            "kern.lade-gpu-verweigert": ["die Grafikkarte verweigert die Welt: {grund}", "the graphics card refuses the world: {grund}"],
            "kern.perf-blackbox": ["BLACKBOX schlimmster {ms} ms (GPU-Lücke {luecke} · CPU {cpu}) · {frames}F → anazhRealmPerf.json", "BLACKBOX worst {ms} ms (GPU gap {luecke} · CPU {cpu}) · {frames}F → anazhRealmPerf.json"],
            "kern.perf-chunk": ["chunk SYNC {sync}/f ({syncms} ms)  worker {worker}/f  q{q}", "chunk SYNC {sync}/f ({syncms} ms)  worker {worker}/f  q{q}"],
            "kern.perf-export": ["Export: Einstellungen → Leistung → „Perf-Daten exportieren\"", "Export: Settings → Performance → “Export perf data”"],
            "kern.perf-fps-leer": ["— fps", "— fps"],
            "kern.perf-frame": ["frame  ø {mittel}  max {max} / soll {soll} ms", "frame  ø {mittel}  max {max} / target {soll} ms"],
            "kern.perf-gpu-echt": ["GPU    {ms} ms (echt: timestamp-query)", "GPU    {ms} ms (real: timestamp-query)"],
            "kern.perf-gpu-proxy": ["GPU    {ms} ms (proxy: frame−ΣCPU)", "GPU    {ms} ms (proxy: frame−ΣCPU)"],
            "kern.perf-hud": ["HUD  {fps} fps · Szene {szene}% · {dc}dc · {tris}k▲", "HUD  {fps} fps · Scene {szene}% · {dc}dc · {tris}k▲"],
            "kern.perf-kopf": ["PERF-SENSE (der Nexus misst seine Last)", "PERF-SENSE (the Nexus measures its load)"],
            "kern.perf-kosten": ["kosten/kreatur {ms} ms · chunks {chunks} arch {arch} coll {coll}", "cost/creature {ms} ms · chunks {chunks} arch {arch} coll {coll}"],
            "kern.perf-phase": [" {phase}:{ms}ms", " {phase}:{ms}ms"],
            "kern.perf-pos": ["POS  {pos}  (x,y,z)", "POS  {pos}  (x,y,z)"],
            "kern.perf-regel": ["REGEL  loadScale {skala}  δ {delta} ms", "RULE   loadScale {skala}  δ {delta} ms"],
            "kern.perf-ring": ["max-Frame je Sekunde → {n}s", "max frame per second → {n}s"],
            "kern.perf-rload": ["RLOAD  {dc} draw-calls · {tris}M tris  (max {dcmax} / {trismax}M)", "RLOAD  {dc} draw calls · {tris}M tris  (max {dcmax} / {trismax}M)"],
            "kern.perf-spike": ["SPIKE  schlimmster {phase} {ms} ms · frame-max {max} ms", "SPIKE  worst {phase} {ms} ms · frame max {max} ms"],
            "kern.perf-stellgr": ["stellgr  streamBudget {stream} ms  waterBudget {water} ms", "levers  streamBudget {stream} ms  waterBudget {water} ms"],
            "kern.perf-szene": ["Szene", "Scene"],
            "kern.perf-verteilung": ["ms-Verteilung", "ms distribution"],
            "kern.perf-worst": ["⚠ {frame}ms (GPU {gpu} [{quelle}] · CPU {cpu}{top} · {dc}dc)", "⚠ {frame}ms (GPU {gpu} [{quelle}] · CPU {cpu}{top} · {dc}dc)"],
            "kern.seitentitel": ["Anazh Realm {version} – Das Ultiversum", "Anazh Realm {version} – The Ultiverse"],
            "kern.sicht-first": ["Sicht: 1st", "View: 1st"],
            "kern.sicht-third": ["Sicht: 3rd", "View: 3rd"],
            "kern.stat-angriffstempo": ["Angriffstempo {wert}/s", "Attack speed  {wert}/s"],
            "kern.stat-boosts": ["Boosts        {wert}", "Boosts        {wert}"],
            "kern.stat-geschwindigkeit": ["Geschwindigk. {wert}", "Speed         {wert}"],
            "kern.stat-hitze-resist": ["Hitze-Resist  {wert}", "Heat resist   {wert}"],
            "kern.stat-magie-resist": ["Magie-Resist  {wert}", "Magic resist  {wert}"],
            "kern.stat-praezision": ["Präzision     {wert}", "Precision     {wert}"],
            "kern.stat-rueckschlag": ["Rückschlag    {wert}", "Knockback     {wert}"],
            "kern.stat-ruestung": ["Rüstung       {wert}", "Armor         {wert}"],
            "kern.stat-schaden": ["Schaden       {wert}", "Damage        {wert}"],
            "kern.stat-sprungkraft": ["Sprungkraft   {wert}", "Jump power    {wert}"],
            "kern.stat-verteidigung": ["Verteidigung  {wert}", "Defense       {wert}"],
            "kern.stat-waffe": ["Waffe         {wert}", "Weapon        {wert}"],
            "kern.stat-werkzeug": ["Werkzeug      {wert}", "Tool          {wert}"],
            "kern.stats-leer": ["Stats nicht initialisiert", "Stats not ready yet"],
            "llm.anthropic.fable": ["Fable 5.1 — das Stärkste (teuer)", "Fable 5.1 — the strongest (expensive)"],
            "llm.anthropic.haiku": ["Haiku 4.5 — schnell", "Haiku 4.5 — fast"],
            "llm.anthropic.hinweis": ["Key holen: console.anthropic.com → Settings → API Keys — Format sk-ant-…", "Get a key: console.anthropic.com → Settings → API Keys — format sk-ant-…"],
            "llm.anthropic.name": ["Claude (Anthropic, kostet)", "Claude (Anthropic, paid)"],
            "llm.anthropic.opus": ["Opus 5.5 — klügste", "Opus 5.5 — smartest"],
            "llm.anthropic.sonnet": ["Sonnet 5.5 — ausgewogen", "Sonnet 5.5 — balanced"],
            "llm.google.flash-20": ["2.0 Flash — älter, evtl. nicht im Free-Tier", "2.0 Flash — older, may not be in the free tier"],
            "llm.google.flash-25": ["2.5 Flash — gratis, empfohlen", "2.5 Flash — free, recommended"],
            "llm.google.flash-lite-20": ["2.0 Flash Lite — älter", "2.0 Flash Lite — older"],
            "llm.google.hinweis": ["Gratis-Key holen: aistudio.google.com/apikey — Format AIzaSy…", "Get a free key: aistudio.google.com/apikey — format AIzaSy…"],
            "llm.google.name": ["Gemini (Google, gratis-Tier)", "Gemini (Google, free tier)"],
            "llm.google.pro-25": ["2.5 Pro — klüger, niedrigeres Limit", "2.5 Pro — smarter, lower limit"],
            "llm.ollama.gemma2": ["Gemma 2 — lokal", "Gemma 2 — local"],
            "llm.ollama.gpt-oss": ["GPT-OSS 20B — ollama.com Cloud", "GPT-OSS 20B — ollama.com cloud"],
            "llm.ollama.hinweis": ["Lokal: `ollama serve` auf localhost:11434. Gehostet: eigene URL + optional Bearer-Token (für ollama.com Turbo, Reverse-Proxy mit Auth, Cloud-Hoster).", "Local: `ollama serve` on localhost:11434. Hosted: your own URL + optional bearer token (for ollama.com Turbo, a reverse proxy with auth, cloud hosts)."],
            "llm.ollama.kimi-cloud": ["Kimi K2.6 Cloud — ollama.com", "Kimi K2.6 Cloud — ollama.com"],
            "llm.ollama.llama31": ["Llama 3.1 8B — solide, lokal", "Llama 3.1 8B — solid, local"],
            "llm.ollama.llama32": ["Llama 3.2 — leicht, lokal", "Llama 3.2 — light, local"],
            "llm.ollama.mistral": ["Mistral 7B — lokal", "Mistral 7B — local"],
            "llm.ollama.name": ["Ollama (lokal oder gehostet)", "Ollama (local or hosted)"],
            "llm.ollama.phi3": ["Phi 3 — sehr leicht, lokal", "Phi 3 — very light, local"],
            "llm.ollama.qwen25": ["Qwen 2.5 — lokal", "Qwen 2.5 — local"],
            "llm.ollama.qwen3": ["Qwen 3 — lokal", "Qwen 3 — local"],
            "llm.ollama.qwen35-cloud": ["Qwen 3.5 Cloud — ollama.com", "Qwen 3.5 Cloud — ollama.com"],
            "llm.openrouter.deepseek": ["DeepSeek R1 — gratis", "DeepSeek R1 — free"],
            "llm.openrouter.gemini": ["Gemini 2.0 Flash exp — gratis", "Gemini 2.0 Flash exp — free"],
            "llm.openrouter.hinweis": ["Gratis-Key holen: openrouter.ai/keys — Format sk-or-v1-… (NICHT der Google/Anthropic-Key)", "Get a free key: openrouter.ai/keys — format sk-or-v1-… (NOT the Google/Anthropic key)"],
            "llm.openrouter.llama": ["Llama 3.3 70B — gratis", "Llama 3.3 70B — free"],
            "llm.openrouter.mistral": ["Mistral Small 3.1 — gratis", "Mistral Small 3.1 — free"],
            "llm.openrouter.name": ["OpenRouter (Multi-Modell, einige :free)", "OpenRouter (multi-model, some :free)"],
            "modus.frieden": ["frieden", "peace"],
            "modus.pfad": ["pfad", "path"],
            "modus.schoepfer": ["schöpfer", "creator"],
            "nexus.abgelehnt": [" (abgelehnt)", " (declined)"],
            "nexus.ablehnen": ["Ablehnen", "Decline"],
            "nexus.ausfuehren": ["Ausführen", "Execute"],
            "nexus.denkt-nach": ["{name} denkt nach…", "{name} is thinking…"],
            "nexus.gesetz-auf": ["({name} stellt ein Gesetz auf — sieh es in den Fähigkeiten unter Gesetze.)", "({name} sets up a law — find it under Laws in your abilities.)"],
            "nexus.keine-stimme": ["({name} hört dich, aber keine Stimme öffnet sich. Aktiviere die LLM-Stimme.)", "({name} hears you, but no voice opens up. Enable the LLM voice.)"],
            "nexus.niemand": ["(Niemand namens „{name}\" hört zu.)", "(No one named “{name}” is listening.)"],
            "nexus.proxy.lokal": ["Cloud über save-server-Proxy (für lokales Ollama nicht nötig)", "Cloud via save-server proxy (not needed for local Ollama)"],
            "nexus.sammelt-sich": ["({name} sammelt sich…)", "({name} gathers their thoughts…)"],
            "nexus.sandbox": ["Sandbox", "sandbox"],
            "nexus.schlaegt-vor": ["{name} schlägt vor: {summary}  ", "{name} suggests: {summary}  "],
            "nexus.schluessel.erst-speichern": ["Bitte erst Schlüssel speichern.", "Please save a key first."],
            "nexus.schluessel.ollama": ["API-Key (optional, nur für gehostete Setups)", "API key (optional, only for hosted setups)"],
            "nexus.schluessel.praefix": ["Achtung — der Schlüssel beginnt nicht mit \"{praefix}\". Sicher, dass das der richtige Provider ist?", "Heads up — the key doesn't start with \"{praefix}\". Sure this is the right provider?"],
            "nexus.schweigt": ["({name} schweigt: {fehler})", "({name} is silent: {fehler})"],
            "nexus.status.aktiv": ["Aktiv: {provider} ({modell}).", "Active: {provider} ({modell})."],
            "nexus.status.bereit": ["{provider}: bereit, inaktiv.", "{provider}: ready, inactive."],
            "nexus.status.denkt": ["{name} denkt…", "{name} is thinking…"],
            "nexus.status.fehler": ["Fehler ({provider}): {fehler}", "Error ({provider}): {fehler}"],
            "nexus.status.schluessel-fehlt": ["{provider}: Schlüssel fehlt.", "{provider}: key missing."],
            "nexus.status.unbekannt": ["Unbekannter Provider: {provider}", "Unknown provider: {provider}"],
            "nexus.vorschlag": ["({name}-Vorschlag: {satz})", "({name}'s suggestion: {satz})"],
            "nexus.vorschlag-abgelehnt": ["({name}-Vorschlag abgelehnt: {satz})", "({name}'s suggestion declined: {satz})"],
            "nexus.vorschlag-ausgefuehrt": ["({name}'s Vorschlag ausgeführt: {summary}{zusatz})", "({name}'s suggestion executed: {summary}{zusatz})"],
            "nexus.vorschlag-auto-ausgefuehrt": ["({name}'s Vorschlag auto-ausgeführt: {summary}{zusatz})", "({name}'s suggestion auto-executed: {summary}{zusatz})"],
            "nexus.vorschlag-fehlgeschlagen": ["({name}'s Vorschlag fehlgeschlagen: {grund})", "({name}'s suggestion failed: {grund})"],
            "nexus.vorschlag-verworfen": ["({name}'s Vorschlag verworfen: {grund})", "({name}'s suggestion discarded: {grund})"],
            "nexus.welt-veraendert": ["(Welt verändert: {name} {tat}.)", "(World changed: {name} {tat}.)"],
            "nexus.wetter-haelt": [" — das Wetter hält dein Wort ({wort})", " — the weather keeps your word ({wort})"],
            "nexus.wetter-halt": ["Halt", "hold"],
            "nexus.wetter-zieht": [" — der Wetter-Zug zieht {wort} als Nächstes", " — the weather front brings {wort} next"],
            "p2p.deaktivieren": ["Deaktivieren", "Deactivate"],
            "p2p.katalog.holen": ["Holen", "Fetch"],
            "p2p.katalog.id-hash": ["id: {id} · Hash {hash}…", "id: {id} · hash {hash}…"],
            "p2p.katalog.leer": ["Kein Mitspieler hat eine Welt zu teilen — vendorte Welten erscheinen, sobald ein Mitspieler im Mesh-Raum eine hat.", "No fellow player has a world to share — vendored worlds appear as soon as someone in the mesh room has one."],
            "p2p.katalog.peer": ["{name} · {id}", "{name} · {id}"],
            "p2p.katalog.vorhanden": ["✓ vorhanden", "✓ in library"],
            "p2p.knoten.ein-raum": ["Knoten: {peers} online in {rooms} Raum", "Nodes: {peers} online in {rooms} room"],
            "p2p.knoten.raeume": ["Knoten: {peers} online in {rooms} Räumen", "Nodes: {peers} online in {rooms} rooms"],
            "p2p.lobby.beitreten": ["Beitreten", "Join"],
            "p2p.lobby.erst-verbinden": ["Lobby: erst Multi-User verbinden.", "Lobby: connect multi-user first."],
            "p2p.lobby.leer": ["Keine öffentlichen Räume — „Lobby durchsuchen“ klicken.", "No public rooms — click “Browse lobby”."],
            "p2p.lobby.raum": ["{name} · {n} Spieler", "{name} · {n} players"],
            "p2p.marke.js-compute.titel": ["Eine Gruppe taucht gemeinsam ein; ein Peer wird Compute-Host für die autoritative Server-JS.", "A group dives in together; one peer becomes the compute host for the authoritative server JS."],
            "p2p.marke.ko-praesenz.titel": ["Ihr seht euch in dieser Welt — AnazhRealm trägt die Posen übers Mesh, die Welt rendert die Gefährten.", "You see each other in this world — AnazhRealm carries the poses over the mesh, the world renders your companions."],
            "p2p.marke.multiplayer.titel": ["Eine Gruppe kann gemeinsam durch das Tor dieser Welt eintreten.", "A group can step through this world's gate together."],
            "p2p.mitspieler": ["Mitspieler", "Fellow player"],
            "p2p.raum-id": ["Raum-ID: {room}", "Room ID: {room}"],
            "p2p.resync.frage": ["Welt vom Host neu holen? Deine aktuelle Welt wird durch die des Hosts ersetzt.", "Fetch the world from the host again? Your current world will be replaced by the host's."],
            "p2p.resync.grund.kein-host": ["Kein Host im Raum gefunden.", "No host found in the room."],
            "p2p.resync.grund.kein-kanal": ["Kein offener Kanal zum Host.", "No open channel to the host."],
            "p2p.resync.grund.kein-mesh": ["Mesh steht noch nicht.", "The mesh isn't up yet."],
            "p2p.resync.grund.senden": ["Anfrage konnte nicht gesendet werden.", "The request couldn't be sent."],
            "p2p.resync.nicht": ["Resync nicht möglich: {reason}", "Resync not possible: {reason}"],
            "p2p.status.fehler": ["Fehler: {fehler}", "Error: {fehler}"],
            "p2p.status.mesh": [" · Mesh p2p", " · mesh p2p"],
            "p2p.status.relay": [" · Server-Relay", " · server relay"],
            "p2p.status.stimme-geteilt": [" · Stimme geteilt", " · voice shared"],
            "p2p.status.stimme-nutzbar": [" · geteilte Stimme nutzbar", " · shared voice available"],
            "p2p.status.transfer": ["Welt-Transfer: {erhalten}/{gesamt} Stücke …", "World transfer: {erhalten}/{gesamt} pieces …"],
            "p2p.status.verbunden": ["Verbunden (Raum {room}, {n} Mitspieler{transport}{voice}).", "Connected (room {room}, {n} players{transport}{voice})."],
            "p2p.stimme.braucht-llm": ["Stimme teilen braucht ein aktives eigenes LLM.", "Sharing your voice needs your own active LLM."],
            "p2p.stimme.denkt": ["Geteilte Stimme denkt nach…", "Shared voice is thinking…"],
            "p2p.stimme.geteilt": ["Stimme geteilt ✓", "Voice shared ✓"],
            "p2p.stimme.grund.beschaeftigt": ["Geteilte Stimme gerade beschäftigt — kurze Pause.", "Shared voice is busy right now — take a short pause."],
            "p2p.stimme.grund.leer": ["Leere Anfrage.", "Empty request."],
            "p2p.stimme.grund.teilt-nicht": ["Der Peer teilt seine Stimme nicht mehr.", "The peer no longer shares their voice."],
            "p2p.stimme.keine": ["(Keine geteilte Stimme verfügbar.)", "(No shared voice available.)"],
            "p2p.stimme.klammer": ["(Geteilte Stimme: {text})", "(Shared voice: {text})"],
            "p2p.stimme.sagt": ["Geteilte Stimme: {text}", "Shared voice: {text}"],
            "p2p.stimme.schweigt": ["(Geteilte Stimme schweigt — Zeitüberschreitung.)", "(Shared voice is silent — timed out.)"],
            "p2p.stimme.unerreichbar": ["(Geteilte Stimme nicht erreichbar.)", "(Shared voice unreachable.)"],
            "p2p.stimme.welt-veraendert": ["(Welt verändert: {programm})", "(World changed: {programm})"],
            "p2p.welt.frage": ["Frage „{welt}\" beim Mitspieler an …", "Asking the player for “{welt}” …"],
            "p2p.welt.geholt": ["✓ „{welt}\" über das Mesh geholt — siehe „Welten\" unten.", "✓ Fetched “{welt}” over the mesh — see “Worlds” below."],
            "p2p.welt.grund.hash": ["Das empfangene Bündel stimmt nicht mit dem Katalog überein — verworfen.", "The received bundle doesn't match the catalog — discarded."],
            "p2p.welt.grund.kein-kanal": ["Zu diesem Mitspieler steht keine Mesh-Verbindung.", "There's no mesh connection to this player."],
            "p2p.welt.grund.kein-peer": ["Dieser Mitspieler ist nicht mehr verbunden.", "This player is no longer connected."],
            "p2p.welt.grund.nicht-gefunden": ["Dieser Mitspieler hat diese Welt nicht.", "This player doesn't have that world."],
            "p2p.welt.grund.nicht-lieferbar": ["Der Mitspieler konnte die Welt nicht liefern.", "The player couldn't deliver the world."],
            "p2p.welt.grund.schon-da": ["Diese Welt hast du schon in deiner Bibliothek.", "This world is already in your library."],
            "p2p.welt.grund.senden": ["Die Anfrage konnte nicht gesendet werden.", "The request couldn't be sent."],
            "p2p.welt.grund.sonst": ["Konnte die Welt nicht über das Mesh holen ({grund}).", "Couldn't fetch the world over the mesh ({grund})."],
            "p2p.welt.grund.ungueltige-id": ["Ungültige Welt-id (a-z 0-9 - _, 1-40 Zeichen).", "Invalid world id (a-z 0-9 - _, 1-40 characters)."],
            "p2p.welt.grund.zeit": ["Zeitüberschreitung — der Mitspieler antwortete nicht. Versuch es erneut.", "Timed out — the player didn't answer. Try again."],
            "pass.bibliothek.diese-welt": ["diese Welt", "this world"],
            "pass.bibliothek.eintrag": ["{art} „{quelle}\"", "{art} “{quelle}”"],
            "pass.bibliothek.fork": ["Fork von {code}", "Fork of {code}"],
            "pass.erweckt": ["Erweckt am {datum}", "Awakened on {datum}"],
            "pass.geste.adresse.was": ["Welt-Adresse „{name}\" signieren", "Sign world address “{name}”"],
            "pass.geste.adresse.wem": ["jeden, der durchs Portal kommt", "everyone who comes through the portal"],
            "pass.geste.bauplan.was": ["Bauplan „{name}\" signieren", "Sign blueprint “{name}”"],
            "pass.geste.bauplan.wem": ["jeden, der ihn empfängt", "everyone who receives it"],
            "pass.geste.bibliothek.was": ["{was} in die Bibliothek legen", "Place {was} in the library"],
            "pass.geste.buergt": ["deine Signatur bürgt dafür", "your signature vouches for it"],
            "pass.geste.code.wem": ["jeden mit dem Code", "everyone with the code"],
            "pass.geste.compute.was": ["Compute-Resultat ({hash}…) bürgen", "Vouch for compute result ({hash}…)"],
            "pass.geste.compute.wem": ["jeden, der den Spec re-rechnet", "everyone who recomputes the spec"],
            "pass.geste.compute.wert": ["Ergebnis-Hash {hash}…", "Result hash {hash}…"],
            "pass.geste.dir-selbst": ["dir selbst", "yourself"],
            "pass.geste.halle.was": ["Portal-Halle „{name}\" signieren ({n} Adressen)", "Sign portal hall “{name}” ({n} addresses)"],
            "pass.geste.halle.wem": ["jeden, der die Halle empfängt", "everyone who receives the hall"],
            "pass.geste.halle.wert": ["deine Signatur bürgt für diese Kuration", "your signature vouches for this curation"],
            "pass.geste.identitaet.was": ["Identität (Vibe-Pass) wiederherstellen", "Restore identity (Vibe Pass)"],
            "pass.geste.identitaet.wem": ["dir selbst — sichere die alte zuerst", "yourself — back up the old one first"],
            "pass.geste.identitaet.wert": ["deine aktuelle Identität wird ERSETZT", "your current identity will be REPLACED"],
            "pass.geste.karte": ["Souveräne Handlung — sie berührt deine Identität/Autorität:\n\nWAS:  {was}\nWERT: {wert}\nWEM:  {wem}\n\nDiese Handlung kann KEINE Welt und KEIN Assistent für dich auslösen.\nNur du, jetzt. Fortfahren?", "Sovereign action — it touches your identity/authority:\n\nWHAT:  {was}\nVALUE: {wert}\nTO:    {wem}\n\nNO world and NO assistant can trigger this action for you.\nOnly you, right now. Continue?"],
            "pass.geste.playtest.was": ["Playtest-Lauf bürgen (commit {commit}…)", "Vouch for playtest run (commit {commit}…)"],
            "pass.geste.playtest.wem": ["die Gesundheit des Ultiversums", "the health of the Ultiverse"],
            "pass.geste.playtest.wert": ["Resultat „{resultat}\", {n} Invarianten", "Result “{resultat}”, {n} invariants"],
            "pass.geste.welt.was": ["Welt „{name}\" signieren", "Sign world “{name}”"],
            "pass.geste.welt.wem": ["jeden, der sie empfängt", "everyone who receives it"],
            "pass.geste.werk.was": ["Werk „{name}\" teilen", "Share work “{name}”"],
            "pass.ruht": ["Vibe-Pass ruht — öffne die Welt über https oder localhost.", "Vibe Pass is resting — open the world via https or localhost."],
            "pass.schluessel-id": ["ed25519:{hex}", "ed25519:{hex}"],
            "pass.welt.trete-bei": ["Geteilte Welt „{welt}\" (von {autor}) — trete bei …", "Shared world “{welt}” (by {autor}) — joining …"],
            "pass.werk.abgewiesen": ["Geteiltes Werk abgewiesen: {grund} ({code}).", "Shared work rejected: {grund} ({code})."],
            "pass.werk.steht": ["Geteiltes Werk steht: {werk} (von {autor}).", "Shared work placed: {werk} (by {autor})."],
            "pass.wird-erzeugt": ["Der Vibe-Pass wird erzeugt …", "Creating your Vibe Pass …"],
            "portal.betreten": ["E — Portal betreten: {label}", "E — enter portal: {label}"],
            "portal.einladung": ["{wer} öffnete ein Tor nach „{welt}\"", "{wer} opened a gate to “{welt}”"],
            "portal.geste.faehigkeit.was": ["Fähigkeit „{key}\" gewähren (von „{von}\")", "Grant ability “{key}” (from “{von}”)"],
            "portal.geste.faehigkeit.wem": ["deiner Welt", "your world"],
            "portal.hinweis.esc-heimat": ["Esc — zurück zur Heimat-Welt", "Esc — back to your home world"],
            "portal.hinweis.esc-konsole": ["Esc — Heimkehr · Konsole — Befehle an diese Welt", "Esc — return home · Console — commands for this world"],
            "portal.hinweis.esc-wohnen": ["Esc — kurz heim (du wohnst hier · „ziehe heim\" beendet das Wohnen)", "Esc — quick trip home (you live here · “ziehe heim” ends your stay)"],
            "portal.hinweis.tasten": ["deine Tasten wirken (WASD · Pfeile)", "your keys work here (WASD · arrows)"],
            "portal.mitkommen": ["Mitkommen", "Come along"],
            "portal.reise.anonym": ["anonym", "anonymous"],
            "portal.reise.gueltig": ["Signatur GÜLTIG (verifiziert)", "Signature VALID (verified)"],
            "portal.reise.karte": ["Portal-Reise zur Welt „{welt}\":\n\nBROKER:  {broker}\nRAUM:    {raum}\nAUTOR:   {autor}\nSTATUS:  {status}\n\nHindurchgehen?", "Portal journey to the world “{welt}”:\n\nBROKER:  {broker}\nROOM:    {raum}\nAUTHOR:  {autor}\nSTATUS:  {status}\n\nStep through?"],
            "portal.reise.karte-verweigert": ["Portal-Reise zur Welt „{welt}\":\n\nBROKER:  {broker}\nRAUM:    {raum}\nAUTOR:   {autor}\nSTATUS:  {status}\n\nDiese Adresse trägt eine kaputte Signatur — Reise wird verweigert.", "Portal journey to the world “{welt}”:\n\nBROKER:  {broker}\nROOM:    {raum}\nAUTHOR:  {autor}\nSTATUS:  {status}\n\nThis address carries a broken signature — the journey is refused."],
            "portal.reise.ungueltig": ["Signatur UNGÜLTIG — Warnung, das Portal könnte lügen", "Signature INVALID — warning, the portal may be lying"],
            "portal.reise.unsigniert": ["unsigniert (anonyme Adresse)", "unsigned (anonymous address)"],
            "portal.server-kontext": ["Server-Kontext", "Server context"],
            "portal.signatur-ungueltig": ["⚠ Signatur dieser Welt ungültig", "⚠ This world's signature is invalid"],
            "portal.signiert.von-dir": ["✓ signiert von dir", "✓ signed by you"],
            "portal.stufe.einzelwelt": ["Einzelwelt — jeder reist in seiner eigenen Instanz", "Solo world — everyone travels in their own instance"],
            "portal.stufe.ko-praesenz": ["Ko-Präsenz — ihr seht euch in dieser Welt", "Co-presence — you see each other in this world"],
            "portal.stufe.multiplayer": ["Multiplayer — die Welt verbindet euch übers Mesh", "Multiplayer — the world connects you over the mesh"],
            "portal.welt": ["Portal-Welt", "Portal world"],
            "rede.eins-gruss": ["Ich bin Eins. Diese Welt ist still — bis du sprichst. Sag, was werden soll.", "I am One. This world is silent — until you speak. Say what shall be."],
            "rede.fps-wert": ["{fps} fps", "{fps} fps"],
            "rede.kein-stand": ["Kein gespeicherter Stand ({befund}) — eine neue Welt erwacht.", "No saved state ({befund}) — a new world awakens."],
            "rede.welt-fehlt": ["Die Welt {welt} ließ sich nicht finden ({befund}) — eine neue Welt erwacht.", "The world {welt} could not be found ({befund}) — a new world awakens."],
            "sozial.alle-werke-titel": ["Alle Werke dieses Schöpfers zeigen (Identitäts-Seite).", "Show all works by this creator (identity page)."],
            "sozial.alle-zeigen": ["✕ alle zeigen", "✕ show all"],
            "sozial.alter.eben": ["eben", "just now"],
            "sozial.alter.min": ["vor {n}m", "{n}m ago"],
            "sozial.alter.sek": ["vor {n}s", "{n}s ago"],
            "sozial.alter.std": ["vor {n}h", "{n}h ago"],
            "sozial.alter.tag": ["vor {n}t", "{n}d ago"],
            "sozial.art.alle": ["Alle", "All"],
            "sozial.art.gefolgt": ["👤 Gefolgt", "👤 Following"],
            "sozial.art.gemerkt": ["🔖 Gemerkt", "🔖 Saved"],
            "sozial.art.rezept": ["Rezept", "Recipe"],
            "sozial.art.rezepte": ["Rezepte", "Recipes"],
            "sozial.art.welt": ["Welt", "World"],
            "sozial.art.welten": ["Welten", "Worlds"],
            "sozial.art.wesen": ["Wesen", "Creature"],
            "sozial.bereit-mitspieler": ["Bereit für Mitspieler", "Ready for players"],
            "sozial.betreten": ["Betreten", "Enter"],
            "sozial.betreten-titel": ["Portal holen — legt ein Tor ins Inventar; platziere es über die Hotbar + geh per E-Taste hindurch.", "Get a portal — puts a gate in your inventory; place it from the hotbar + press E to walk through."],
            "sozial.bewerten-titel": ["Bewerten — deine Wertung (lokal gespeichert)", "Rate — your rating (saved locally)"],
            "sozial.dateien-fehlen": ["Welt-Dateien nicht verfügbar", "World files unavailable"],
            "sozial.dateien-fehlen-titel": ["Die Welt-Dateien sind nicht verfügbar — nur das Manifest kam an.", "The world files aren't available — only the manifest arrived."],
            "sozial.deine": ["✓ deine", "✓ yours"],
            "sozial.deine-titel": ["Deine eigene Welt — du gestaltest + teilst sie souverän (Vibe-Pass).", "Your own world — you shape + share it on your own terms (Vibe Pass)."],
            "sozial.diese-welt": ["Diese Welt", "This world"],
            "sozial.dir": ["dir", "you"],
            "sozial.dock.angedockt": ["✓ „{welt}\" ist angedockt ({n} Dateien) — siehe „Welten\" unten.", "✓ “{welt}” is docked ({n} files) — see “Worlds” below."],
            "sozial.dock.buendel-gross": ["Das Welt-Bündel ist insgesamt zu groß.", "The world bundle is too large overall."],
            "sozial.dock.datei-gross": ["Eine Datei ist zu groß fürs Vendoring.", "A file is too large for vendoring."],
            "sozial.dock.datei-unbrauchbar": ["Eine Datei im Bündel ist unbrauchbar.", "A file in the bundle is unusable."],
            "sozial.dock.dockt": ["Die Welt dockt an …", "The world is docking …"],
            "sozial.dock.endung": ["Eine Datei hat eine nicht erlaubte Endung (nur Text: html/js/css/json/…).", "A file has a disallowed extension (text only: html/js/css/json/…)."],
            "sozial.dock.fehl": ["Andocken fehlgeschlagen: {grund}", "Docking failed: {grund}"],
            "sozial.dock.gewaehlt": ["{n} verwertbare Datei(en) gewählt — id + Name eingeben, dann Andocken.", "{n} usable file(s) chosen — enter id + name, then Dock."],
            "sozial.dock.github-geholt": ["✓ „{welt}\" aus GitHub geholt ({n} Dateien) — siehe „Welten\" unten.", "✓ “{welt}” fetched from GitHub ({n} files) — see “Worlds” below."],
            "sozial.dock.hole-repo": ["Hole das Repo von GitHub …", "Fetching the repo from GitHub …"],
            "sozial.dock.id-reserviert": ["Diese id gehört einer Built-in-Welt — wähle eine andere.", "This id belongs to a built-in world — pick another."],
            "sozial.dock.id-ungueltig": ["Die Welt-id darf nur a-z, 0-9, - und _ enthalten (1-40 Zeichen).", "The world id may only contain a-z, 0-9, - and _ (1-40 characters)."],
            "sozial.dock.kein-github": ["Das ist keine github.com-Repo-URL — z. B. https://github.com/owner/repo.", "That's not a github.com repo URL — e.g. https://github.com/owner/repo."],
            "sozial.dock.kein-index": ["Dem Bündel fehlt eine index.html im Wurzel-Ordner (der Welt-Eingang).", "The bundle is missing an index.html in its root folder (the world's entrance)."],
            "sozial.dock.keine-dateien": ["Es wurden keine Dateien gewählt.", "No files were chosen."],
            "sozial.dock.keine-text": ["Keine verwertbaren Text-Dateien im Ordner gefunden.", "No usable text files found in the folder."],
            "sozial.dock.lese": ["Lese die Dateien …", "Reading the files …"],
            "sozial.dock.manifest": ["Das Welt-Manifest war unbrauchbar.", "The world manifest was unusable."],
            "sozial.dock.ordner-zuerst": ["Wähle zuerst den Ordner einer Welt.", "Choose a world's folder first."],
            "sozial.dock.pfad-unsicher": ["Ein Datei-Pfad ist unsicher (kein Verzeichnis-Aufstieg, kein absoluter Pfad).", "A file path is unsafe (no climbing out of the folder, no absolute paths)."],
            "sozial.dock.repo-fehlt": ["Gib eine GitHub-Repo-URL an.", "Enter a GitHub repo URL."],
            "sozial.dock.server-fehlt": ["Der lokale save-server ist nicht erreichbar — Vendoring braucht die Dev-Umgebung (npm start).", "The local save-server is unreachable — vendoring needs the dev environment (npm start)."],
            "sozial.dock.zu-viele": ["Der Ordner enthält zu viele Dateien für ein Welt-Bündel.", "The folder holds too many files for a world bundle."],
            "sozial.du": ["du", "you"],
            "sozial.ed25519": ["ed25519:{schluessel}", "ed25519:{schluessel}"],
            "sozial.eiland-bestand": ["{bauwerke} Bauwerke · {bauplaene} Baupläne · {wesen} Wesen", "{bauwerke} structures · {bauplaene} blueprints · {wesen} creatures"],
            "sozial.einladung-fehlt": ["Bitte Einladungs-Code eingeben.", "Please enter an invite code."],
            "sozial.fehler": ["Fehler", "Error"],
            "sozial.feld.beschreibung": ["Beschreibung", "Description"],
            "sozial.feld.dsl": ["DSL-Vokabular", "DSL vocabulary"],
            "sozial.feld.name": ["Name", "Name"],
            "sozial.folge": ["✓ folge", "✓ following"],
            "sozial.folgen": ["➕ folgen", "➕ follow"],
            "sozial.folgen-titel": ["Dem Schöpfer {wer} folgen — seine Werke im „Gefolgt\"-Filter.", "Follow the creator {wer} — their works appear in the “Following” filter."],
            "sozial.gast-banner": ["<strong>Du bist Gast in dieser Welt.</strong> Status: {status}{raum}", "<strong>You're a guest in this world.</strong> Status: {status}{raum}"],
            "sozial.geaendert": ["geändert — neu signieren", "changed — re-sign"],
            "sozial.gemeinschaft-wertung-titel": ["Gemeinschafts-Wertung (signierte Zeugnisse uebers Mesh)", "Community rating (signed testimonies over the mesh)"],
            "sozial.host-banner": ["<strong>Du hostest diese Welt.</strong> Status: {status}{verbunden} — den Code gibt „Teilen\" in der Bibliothek.", "<strong>You're hosting this world.</strong> Status: {status}{verbunden} — “Share” in the Library gives you the code."],
            "sozial.host-raum": ["Host: {url} · Raum: {raum}", "Host: {url} · Room: {raum}"],
            "sozial.id": ["id: {id}", "id: {id}"],
            "sozial.im-hof-aufsuchen": ["{name} im Hof aufsuchen.", "Visit {name} in the Yard."],
            "sozial.im-inventar": ["✓ „{welt}\" liegt im Inventar", "✓ “{welt}” is in your inventory"],
            "sozial.in-die-werkstatt": ["In die Werkstatt", "Open in Workshop"],
            "sozial.in-die-werkstatt-titel": ["Den Bauplan in der Werkstatt öffnen + verfeinern.", "Open the blueprint in the Workshop + refine it."],
            "sozial.inventar-voll": ["Inventar voll", "Inventory full"],
            "sozial.kein-dsl": ["kein DSL-Vokabular", "no DSL vocabulary"],
            "sozial.kein-wort": ["Noch kein Wort — sei das erste.", "No words yet — be the first."],
            "sozial.keine-erinnerungen": ["Keine Erinnerungen", "No memories"],
            "sozial.ki.api-key": ["Der KI fehlt ein API-Key — siehe Einstellungen-Drawer.", "The AI is missing an API key — see the Settings drawer."],
            "sozial.ki.aufgenommen": ["✓ „{welt}\" steht jetzt in deiner Bibliothek.", "✓ “{welt}” is now in your Library."],
            "sozial.ki.aufnehmen": ["In Bibliothek aufnehmen", "Add to Library"],
            "sozial.ki.baut": ["Die KI baut die Welt …", "The AI is building the world …"],
            "sozial.ki.fehl": ["Übersetzung fehlgeschlagen: {grund}", "Translation failed: {grund}"],
            "sozial.ki.id-vergeben": ["Die KI wählte eine schon vergebene Welt-id — versuch es nochmal.", "The AI picked a world id that's already taken — try again."],
            "sozial.ki.kein-manifest": ["Die KI lieferte kein verwertbares Manifest. Versuch es nochmal oder beschreibe die Welt klarer.", "The AI returned no usable manifest. Try again or describe the world more clearly."],
            "sozial.ki.keine-szene": ["Die KI lieferte keine verwertbare Szene. Versuch es nochmal.", "The AI returned no usable scene. Try again."],
            "sozial.ki.llm-aus": ["Keine KI aktiv — schalte sie im Einstellungen-Drawer ein.", "No AI active — turn it on in the Settings drawer."],
            "sozial.ki.manifest-unbrauchbar": ["Das übersetzte Manifest war unbrauchbar — versuch es nochmal.", "The translated manifest was unusable — try again."],
            "sozial.ki.nicht-uebersetzt": ["Nur KI-übersetzte Welten lassen sich aufbauen.", "Only AI-translated worlds can be built."],
            "sozial.ki.uebersetzt": ["Die KI übersetzt …", "The AI is translating …"],
            "sozial.ki.unbekannt": ["Diese Welt ist nicht in der Bibliothek.", "This world isn't in the Library."],
            "sozial.ki.vorschlag": ["KI-Vorschlag — prüfen und aufnehmen", "AI proposal — review and add"],
            "sozial.ki.zu-duenn": ["Diese Welt hat zu wenig Substanz — übersetze sie zuerst ausführlicher.", "This world has too little substance — translate it in more detail first."],
            "sozial.ki.zu-kurz": ["Beschreibe die Welt etwas ausführlicher (ein paar Worte mindestens).", "Describe the world in a bit more detail (a few words at least)."],
            "sozial.ki.zu-lang": ["Die Beschreibung ist zu lang — fasse dich kürzer (max. 4000 Zeichen).", "The description is too long — keep it shorter (max. 4000 characters)."],
            "sozial.ko-praesenz": ["Ko-Präsenz", "Co-presence"],
            "sozial.ko-praesenz-titel": ["Ihr seht euch in dieser Welt — AnazhRealm trägt die Posen übers Mesh, die Welt rendert die Gefährten (W18-B).", "You see each other in this world — Anazh Realm carries your poses over the mesh, the world renders your companions (W18-B)."],
            "sozial.lesezeichen-titel": ["Lesezeichen — merken (privat, lokal)", "Bookmark — keep it (private, local)"],
            "sozial.loeschen": ["löschen", "delete"],
            "sozial.mp": ["Multiplayer", "Multiplayer"],
            "sozial.mp-js": ["Multiplayer · JS-Compute", "Multiplayer · JS Compute"],
            "sozial.mp-js-titel": ["Eine Gruppe taucht gemeinsam ein; ein Peer wird Compute-Host für die autoritative Server-JS (W17 — B-JS-Compute).", "A group dives in together; one peer becomes the compute host for the authoritative server JS (W17 — B-JS-Compute)."],
            "sozial.mp-titel": ["Eine Gruppe kann gemeinsam durch das Tor dieser Welt eintreten (W17 — Gruppen-Portal).", "A group can step through this world's gate together (W17 — group portal)."],
            "sozial.n-erinnerung": ["{n} Erinnerung", "{n} memory"],
            "sozial.n-erinnerungen": ["{n} Erinnerungen", "{n} memories"],
            "sozial.n-im-raum": [" ({n} im Raum)", " ({n} in the room)"],
            "sozial.n-verbunden": [" ({n} verbunden)", " ({n} connected)"],
            "sozial.namenlos": ["(namenlos)", "(unnamed)"],
            "sozial.neu-aufbauen": ["neu aufbauen", "rebuild"],
            "sozial.neu-aufbauen-titel": ["Die KI baut eine neue Szene für diese Welt.", "The AI builds a new scene for this world."],
            "sozial.neu-signieren": ["Neu signieren", "Re-sign"],
            "sozial.nicht-holen": ["konnte nicht holen", "couldn't fetch"],
            "sozial.nicht-signiert": ["nicht signiert", "not signed"],
            "sozial.nichts-kategorie": ["Nichts in dieser Kategorie.", "Nothing in this category."],
            "sozial.nichts-passt": ["Nichts passt zu „{suche}\".", "Nothing matches “{suche}”."],
            "sozial.noch-namenlos": ["(noch namenlos)", "(still unnamed)"],
            "sozial.noch-nichts-bewertet": ["Noch nichts bewertet — vergib Sterne, deine Favoriten erscheinen hier.", "Nothing rated yet — give some stars and your favorites show up here."],
            "sozial.nur-eine-welt": ["Nur diese eine Welt im Speicher.", "Only this one world is saved."],
            "sozial.picker-zeile": ["{name} — {tage}d, ID {id}…", "{name} — {tage}d, ID {id}…"],
            "sozial.pruefe": ["prüfe …", "checking …"],
            "sozial.rezept-import-fehl": ["Rezept-Import fehlgeschlagen: {grund}", "Recipe import failed: {grund}"],
            "sozial.rezepte-empfangen": ["Aus „{welt}\" empfangen: {bauplaene} Baupläne, {materialien} Materialien, {werkzeuge} Werkzeuge.", "Received from “{welt}”: {bauplaene} blueprints, {materialien} materials, {werkzeuge} tools."],
            "sozial.rezepte-holen": ["Rezepte holen", "Fetch recipes"],
            "sozial.rezepte-holen-titel": ["Baupläne + Materialien + Werkzeuge aus dieser Welt in die aktive importieren", "Import blueprints + materials + tools from this world into the active one"],
            "sozial.rezepte-import-frage": ["Rezepte aus „{welt}\" in deine aktuelle Welt importieren? Konflikte bekommen -import-Suffix.", "Import recipes from “{welt}” into your current world? Conflicts get an -import suffix."],
            "sozial.rolle-weil": ["{rolle}, weil: {grund}", "{rolle}, because: {grund}"],
            "sozial.sandbox": ["⛨ Sandbox", "⛨ Sandbox"],
            "sozial.sandbox-titel": ["Sandgesichert — eine fremde, ungeprüfte Welt läuft null-origin (kann AnazhRealm nicht berühren). Irreversibel.", "Sandboxed — a foreign, unverified world runs null-origin (it can't touch Anazh Realm). Irreversible."],
            "sozial.schlichte-materie": ["schlichte Materie", "plain matter"],
            "sozial.senden-titel": ["Senden (signiert mit deinem Vibe-Pass)", "Send (signed with your Vibe Pass)"],
            "sozial.signatur-ungueltig": ["⚠ Signatur ungültig", "⚠ Invalid signature"],
            "sozial.signieren": ["Signieren", "Sign"],
            "sozial.signiert-von": ["✓ signiert von {wer}", "✓ signed by {wer}"],
            "sozial.sort.bewertung": ["★ Bewertung", "★ Rating"],
            "sozial.sort.fuer-dich": ["✦ Für dich", "✦ For you"],
            "sozial.sort.fuer-dich-titel": ["Deine persönliche Reihung: Gefolgte zuerst, dann Gemeinschafts-Wertung, Gemerktes, dein Urteil, Gespräch — eine lesbare Summe, keine Black-Box.", "Your personal ranking: creators you follow first, then community rating, bookmarks, your own verdict, conversation — a readable sum, no black box."],
            "sozial.sort.neueste": ["Neueste", "Newest"],
            "sozial.tagebuch-leer": ["Noch keine Erinnerungen geschrieben.", "No memories written yet."],
            "sozial.teilen": ["Teilen…", "Share…"],
            "sozial.verbinde": ["Verbinde…", "Connecting…"],
            "sozial.verbinde-host": ["Verbinde mit Host…", "Connecting to host…"],
            "sozial.verbunden": ["Verbunden", "Connected"],
            "sozial.vertrauen": ["Vertrauen", "Trust"],
            "sozial.vertraut": ["✓ vertraut", "✓ trusted"],
            "sozial.vertraut-titel": ["Vertraute Welt — eine Built-in- oder eigene Welt; sie läuft im selben Kontext.", "Trusted world — a built-in or your own world; it runs in the same context."],
            "sozial.verwerfen": ["Verwerfen", "Discard"],
            "sozial.vibe-pass-nicht-bereit": ["Vibe-Pass nicht bereit — siehe Spieler-Drawer.", "Vibe Pass not ready — see the player drawer."],
            "sozial.vibe-pass-noetig": ["Vibe-Pass noetig (Einstellungen → Identitaet)", "Vibe Pass needed (Settings → Identity)"],
            "sozial.vorschau-hinweis": ["Klick eine Rezept- oder Wesen-Karte für die 3D-Vorschau.", "Click a recipe or creature card for the 3D preview."],
            "sozial.vorschau-welt": ["Welten sind eine ganze Szene — betritt sie durch das Tor.", "Worlds are a whole scene — enter them through the gate."],
            "sozial.wechseln": ["wechseln", "switch"],
            "sozial.welt-aufbauen": ["Welt aufbauen", "Build world"],
            "sozial.welt-aufbauen-titel": ["Die KI gibt dieser übersetzten Welt eine deklarative Szene — danach führt ihr Portal hindurch.", "The AI gives this translated world a declarative scene — then its portal leads inside."],
            "sozial.welt-empfangen-lade": ["Welt empfangen — lade…", "World received — loading…"],
            "sozial.welt-info.alter": ["Alter: {tage} Tage  |  Eltern-Welten: {eltern}", "Age: {tage} days  |  Parent worlds: {eltern}"],
            "sozial.welt-info.alter-eins": ["Alter: {tage} Tag  |  Eltern-Welten: {eltern}", "Age: {tage} day  |  Parent worlds: {eltern}"],
            "sozial.welt-info.inventar": ["Inventar: {bauwerke} Bauwerke, {bauplaene} Baupläne, {erinnerungen} Erinnerungen", "Inventory: {bauwerke} structures, {bauplaene} blueprints, {erinnerungen} memories"],
            "sozial.welt-info.name": ["Name: {name}  |  ID: {id}…", "Name: {name}  |  ID: {id}…"],
            "sozial.welt-loeschen-frage": ["Welt „{welt}\" wirklich löschen? Das kann nicht rückgängig gemacht werden.", "Really delete the world “{welt}”? This can't be undone."],
            "sozial.welt-nicht-erschaffen": ["Welt konnte nicht erschaffen werden.", "The world couldn't be created."],
            "sozial.welt-nicht-erschaffen-konsole": ["Welt konnte nicht erschaffen werden — siehe Konsole.", "The world couldn't be created — see the console."],
            "sozial.werke-von": ["👤 Werke von {wer} — {n} im Feed ", "👤 Works by {wer} — {n} in the feed "],
            "sozial.wort-zuruecklassen": ["Ein Wort zuruecklassen …", "Leave a word …"],
            "sozial.worte-titel": ["Worte der Gemeinschaft — lesen + eines zuruecklassen (signiert).", "Words from the community — read + leave one (signed)."],
            "sozial.zum-hof": ["Zum Hof", "Visit the Yard"],
            "speicher.befund.bak": [".bak {fehler}", ".bak {fehler}"],
            "speicher.befund.kein-legacy": ["kein Legacy-Save", "no legacy save"],
            "speicher.befund.kein-zeiger": ["kein Aktiv-Zeiger", "no active pointer"],
            "speicher.befund.korrupt": ["{glied} korrupt ({fehler})", "{glied} corrupt ({fehler})"],
            "speicher.befund.leer": ["{glied} leer", "{glied} empty"],
            "speicher.befund.nicht-lesbar": ["{glied} nicht lesbar ({fehler})", "{glied} not readable ({fehler})"],
            "speicher.befund.platz": ["Platz", "Slot"],
            "speicher.befund.unlesbar": ["{glied} unlesbar", "{glied} unreadable"],
            "speicher.daneben-fehl": ["Daneben legen fehlgeschlagen: {grund}", "Placing beside failed: {grund}"],
            "speicher.daneben-ok": ["Datei {datei} liegt nun als „{slug}\" neben dir (ID {id}…).", "File {datei} now rests beside you as “{slug}” (ID {id}…)."],
            "speicher.diese-welt": ["(diese Welt)", "(this world)"],
            "speicher.eltern-id": ["— ID {id}…", "— ID {id}…"],
            "speicher.eltern-verloren": ["(verloren) — ID {id}…", "(lost) — ID {id}…"],
            "speicher.ersetzen-abgelehnt": ["Ersetzen abgelehnt: {grund}", "Replace refused: {grund}"],
            "speicher.ersetzen-fehl": ["Ersetzen fehlgeschlagen: {datei} ließ sich nicht ablegen ({grund}) — du bleibst in deiner Welt.", "Replace failed: {datei} could not be stored ({grund}) — you stay in your world."],
            "speicher.ersetzen-ok": ["Datei {datei} importiert — die Welt erwacht neu.", "File {datei} imported — the world awakens anew."],
            "speicher.fusion-strategie": ["Fusion-Strategie: {strategie}", "Fusion strategy: {strategie}"],
            "speicher.fusion-vorbereitung-fehl": ["Fusion-Vorbereitung fehlgeschlagen: {grund}", "Fusion preparation failed: {grund}"],
            "speicher.import-fehl": ["Import fehlgeschlagen: {grund}", "Import failed: {grund}"],
            "speicher.keine-andere-welt": ["— keine andere Welt im Speicher —", "— no other world in storage —"],
            "speicher.keine-eltern": ["Diese Welt ist eigenständig — keine Eltern-Welten.", "This world stands on its own — no parent worlds."],
            "speicher.klang-an": ["Klang: an", "Sound: on"],
            "speicher.klang-aus": ["Klang: aus", "Sound: off"],
            "speicher.namenlos": ["(namenlos)", "(nameless)"],
            "speicher.tor-anklopfen": ["„{slug}\" (ID {id}…, {tage} Tage alt, {bauwerke} Bauwerke, {plaene} eigene Baupläne, {erinnerungen} Erinnerungen) klopft an dein Tor. Wie willst du sie empfangen?", "“{slug}” (ID {id}…, {tage} days old, {bauwerke} structures, {plaene} own blueprints, {erinnerungen} memories) is knocking at your gate. How will you receive it?"],
            "speicher.tor-anklopfen-1": ["„{slug}\" (ID {id}…, {tage} Tag alt, {bauwerke} Bauwerke, {plaene} eigene Baupläne, {erinnerungen} Erinnerungen) klopft an dein Tor. Wie willst du sie empfangen?", "“{slug}” (ID {id}…, {tage} day old, {bauwerke} structures, {plaene} own blueprints, {erinnerungen} memories) is knocking at your gate. How will you receive it?"],
            "speicher.unbekannt": ["unbekannt", "unknown"],
            "speicher.welt-option": ["{slug} — ID {id}…", "{slug} — ID {id}…"],
            "speicher.welt-wechselt": ["die Welt wechselt", "the world is changing"],
            "stoff.blech": ["Blech", "Sheet metal"],
            "stoff.bronze": ["Bronze", "Bronze"],
            "stoff.eis": ["Eis", "Ice"],
            "stoff.eisen": ["Eisen", "Iron"],
            "stoff.erde": ["Erde", "Earth"],
            "stoff.essenz": ["Essenz", "Essence"],
            "stoff.federn": ["Federn", "Feathers"],
            "stoff.fleisch": ["Fleisch", "Flesh"],
            "stoff.glut": ["Glut", "Embers"],
            "stoff.gras": ["Gras", "Grass"],
            "stoff.holz": ["Holz", "Wood"],
            "stoff.knochen": ["Knochen", "Bone"],
            "stoff.kraut": ["Kraut", "Herbs"],
            "stoff.laub": ["Laub", "Leaves"],
            "stoff.leder": ["Leder", "Leather"],
            "stoff.leib": ["Leib", "Body"],
            "stoff.menge": ["{n}× {stoff}", "{n}× {stoff}"],
            "stoff.quarz": ["Quarz", "Quartz"],
            "stoff.schuppen": ["Schuppen", "Scales"],
            "stoff.stahl": ["Stahl", "Steel"],
            "stoff.stein": ["Stein", "Stone"],
            "stoff.wasser": ["Wasser", "Water"],
            "taste.abbauen": ["Abbauen (Architektur / Terrain)", "Break (architecture / terrain)"],
            "taste.alt-links": ["AltLeft", "Left Alt"],
            "taste.alt-rechts": ["AltRight", "Right Alt"],
            "taste.aufsitzen": ["Aufsitzen/Absitzen · Sitzen · Portal betreten", "Mount/dismount · Sit · Enter portal"],
            "taste.backquote": ["Backquote", "`"],
            "taste.backslash": ["Backslash", "\\"],
            "taste.backspace": ["Backspace", "Backspace"],
            "taste.bau-verlassen": ["Bau-Modus verlassen", "Leave build mode"],
            "taste.bauen-bestaetigen": ["Bauen bestätigen", "Confirm build"],
            "taste.bild-ab": ["PageDown", "Page Down"],
            "taste.bild-auf": ["PageUp", "Page Up"],
            "taste.capslock": ["CapsLock", "Caps Lock"],
            "taste.druck": ["PrintScreen", "Print Screen"],
            "taste.einfuegen": ["Insert", "Insert"],
            "taste.einstellungen-drawer": ["Einstellungen-Drawer öffnen", "Open settings drawer"],
            "taste.ende": ["End", "End"],
            "taste.enter": ["Enter", "Enter"],
            "taste.entfernen": ["Delete", "Delete"],
            "taste.esc": ["Esc", "Esc"],
            "taste.fernglas": ["Fernglas (halten)", "Spyglass (hold)"],
            "taste.gespraech": ["Gespräch öffnen (sprich mit der Welt)", "Open conversation (speak with the world)"],
            "taste.gleich": ["Equal", "="],
            "taste.hand-tauschen": ["Hand tauschen (Off-Hand)", "Swap hands (off-hand)"],
            "taste.handbremse": ["Handbremse (Fahrt)", "Handbrake (driving)"],
            "taste.hof": ["Hof öffnen (Kreaturen · Nexus · Befehle)", "Open the court (creatures · Nexus · commands)"],
            "taste.hud": ["HUD aus/ein", "HUD off/on"],
            "taste.intl-backslash": ["IntlBackslash", "Intl \\"],
            "taste.inventar": ["Inventar öffnen", "Open inventory"],
            "taste.kamera": ["Kamera: 1st/3rd-Person", "Camera: 1st/3rd person"],
            "taste.klammer-auf": ["BracketLeft", "["],
            "taste.klammer-zu": ["BracketRight", "]"],
            "taste.komma": ["Comma", ","],
            "taste.kontextmenue": ["ContextMenu", "Menu"],
            "taste.meta-links": ["MetaLeft", "Left Cmd/Win"],
            "taste.meta-rechts": ["MetaRight", "Right Cmd/Win"],
            "taste.minus": ["Minus", "-"],
            "taste.num-durch": ["NumpadDivide", "Numpad /"],
            "taste.num-enter": ["NumpadEnter", "Numpad Enter"],
            "taste.num-gleich": ["NumpadEqual", "Numpad ="],
            "taste.num-komma": ["NumpadDecimal", "Numpad ."],
            "taste.num-mal": ["NumpadMultiply", "Numpad *"],
            "taste.num-minus": ["NumpadSubtract", "Numpad -"],
            "taste.num-plus": ["NumpadAdd", "Numpad +"],
            "taste.num-trenner": ["NumpadComma", "Numpad ,"],
            "taste.num-ziffer": ["Numpad{ziffer}", "Numpad {ziffer}"],
            "taste.numlock": ["NumLock", "Num Lock"],
            "taste.pad-a": ["Pad A", "Pad A"],
            "taste.pad-b": ["Pad B", "Pad B"],
            "taste.pad-hoch": ["Pad ↑", "Pad ↑"],
            "taste.pad-home": ["Pad Home", "Pad Home"],
            "taste.pad-l3": ["Pad L3", "Pad L3"],
            "taste.pad-lb": ["Pad LB", "Pad LB"],
            "taste.pad-links": ["Pad ←", "Pad ←"],
            "taste.pad-lt": ["Pad LT", "Pad LT"],
            "taste.pad-nummer": ["Pad {nummer}", "Pad {nummer}"],
            "taste.pad-r3": ["Pad R3", "Pad R3"],
            "taste.pad-rb": ["Pad RB", "Pad RB"],
            "taste.pad-rechts": ["Pad →", "Pad →"],
            "taste.pad-rt": ["Pad RT", "Pad RT"],
            "taste.pad-runter": ["Pad ↓", "Pad ↓"],
            "taste.pad-start": ["Pad Start", "Pad Start"],
            "taste.pad-x": ["Pad X", "Pad X"],
            "taste.pad-y": ["Pad Y", "Pad Y"],
            "taste.pad-zurueck": ["Pad Zurück", "Pad Back"],
            "taste.pause": ["Pause", "Pause"],
            "taste.platzieren": ["Platzieren (Bau-Modus)", "Place (build mode)"],
            "taste.pos1": ["Home", "Home"],
            "taste.punkt": ["Period", "."],
            "taste.quote": ["Quote", "'"],
            "taste.rutschen": ["Rutschen", "Slide"],
            "taste.scrolllock": ["ScrollLock", "Scroll Lock"],
            "taste.semikolon": ["Semicolon", ";"],
            "taste.shift-links": ["ShiftLeft", "Left Shift"],
            "taste.shift-rechts": ["ShiftRight", "Right Shift"],
            "taste.slash": ["Slash", "/"],
            "taste.slot-vor": ["Nächster Hotbar-Slot", "Next hotbar slot"],
            "taste.slot-zurueck": ["Voriger Hotbar-Slot", "Previous hotbar slot"],
            "taste.spieler-drawer": ["Spieler-Drawer öffnen", "Open player drawer"],
            "taste.springen": ["Springen", "Jump"],
            "taste.sprinten": ["Sprinten (unter Wasser: tauchen)", "Sprint (underwater: dive)"],
            "taste.strg-links": ["ControlLeft", "Left Ctrl"],
            "taste.strg-rechts": ["ControlRight", "Right Ctrl"],
            "taste.tab": ["Tab", "Tab"],
            "taste.werkstatt-drawer": ["Werkstatt-Drawer öffnen", "Open workshop drawer"],
            "ui.1-spielmodus": ["1 · Spielmodus", "1 · Game mode"],
            "ui.2-5d-lichtung": ["2.5D-Lichtung", "2.5D lighting"],
            "ui.2-steuerung": ["2 · Steuerung", "2 · Controls"],
            "ui.3-ton-sicht": ["3 · Ton & Sicht", "3 · Sound & View"],
            "ui.3d-vorschau": ["3D-Vorschau", "3D preview"],
            "ui.4-identitaet-begleiter": ["4 · Identität & Begleiter", "4 · Identity & Companion"],
            "ui.5-erweitert-render-feinschliff": ["5 · Erweitert · Render-Feinschliff", "5 · Advanced · Render fine-tuning"],
            "ui.59-fps": ["59 fps", "59 fps"],
            "ui.8-min": ["8 Min", "8 min"],
            "ui.ab-welcher-baumhoehe-der-detail": ["= ab welcher Baumhöhe der Detail-Wechsel greift (grösser = Bäume behalten Detail länger). Die", "= the tree height at which the detail switch kicks in (larger = trees keep detail longer). The"],
            "ui.ab-welcher-intensitaet-eine-emotion": ["= ab welcher Intensität eine Emotion kippt.", "= the intensity at which an emotion tips."],
            "ui.abbrechen": ["Abbrechen", "Cancel"],
            "ui.absicht-eingeben": ["Absicht eingeben", "Enter intent"],
            "ui.aktive-raum-id-in-die": ["Aktive Raum-ID in die Zwischenablage kopieren", "Copy active room ID to clipboard"],
            "ui.aktiviere-wenn-cloud-setup-mit": ["Aktiviere wenn Cloud-Setup mit CORS-Fehler scheitert (typisch bei", "Enable if a cloud setup fails with a CORS error (typical for"],
            "ui.aktivieren": ["Aktivieren", "Activate"],
            "ui.aktuellen-bauplan-klonen": ["Aktuellen Bauplan klonen", "Clone current blueprint"],
            "ui.aktuellen-bauplan-loeschen-nur-eigene": ["Aktuellen Bauplan löschen (nur eigene)", "Delete current blueprint (own only)"],
            "ui.alle-wesen-in-der-welt": ["Alle Wesen in der Welt:", "All beings in the world:"],
            "ui.allein": ["Allein", "Alone"],
            "ui.alles-suche-befehle-bauplaene-raeume": ["Alles-Suche · Befehle · Baupläne · Räume (Strg/Cmd+K)", "Search everything · Commands · Blueprints · Rooms (Ctrl/Cmd+K)"],
            "ui.anazh-realm": ["Anazh Realm", "Anazh Realm"],
            "ui.anazh-realm-v18-271-0": ["Anazh Realm v18.271.0 – Das Ultiversum", "Anazh Realm v18.271.0 – The Ultiverse"],
            "ui.anazh-werk": ["anazh-werk:…", "anazh-werk:…"],
            "ui.andere-welt": ["⊕ Andere Welt:", "⊕ Other world:"],
            "ui.andocken": ["Andocken", "Dock"],
            "ui.api-chat": ["/api/chat", "/api/chat"],
            "ui.api-key": ["API-Key", "API key"],
            "ui.auf-einen-part-im-3d": ["Auf einen Part im 3D ziehen → wendet die Op an. Bearbeitet Material, hebt Präzision, schärft die Rolle (forging→Werkzeug, alchemy→Trank). Hand = 0.40, Polierscheibe = 0.97 — die schwächste Op deckelt die Compound-Präzision.", "Drag onto a part in 3D → applies the op. Works the material, raises precision, sharpens the role (forging→tool, alchemy→potion). Hand = 0.40, polishing wheel = 0.97 — the weakest op caps the compound precision."],
            "ui.auftraege": ["Aufträge", "Quests"],
            "ui.aus-dem-mesh": ["Aus dem Mesh", "From the mesh"],
            "ui.aus-github-holen": ["Aus GitHub holen", "Fetch from GitHub"],
            "ui.automatisch-aus-eltern": ["automatisch aus Eltern", "automatic from parents"],
            "ui.baer-schwer-ruhig": ["Bär (schwer · ruhig)", "Bear (heavy · calm)"],
            "ui.bauplan-hotbar": ["Bauplan-Hotbar", "Blueprint hotbar"],
            "ui.bauten": ["Bauten", "Builds"],
            "ui.begleiter": ["Begleiter", "Companion"],
            "ui.begleiter-avatar": ["Begleiter + Avatar", "Companion + avatar"],
            "ui.begleiter-stimme-llm": ["Begleiter-Stimme (LLM)", "Companion voice (LLM)"],
            "ui.beide-nutzen-die-selbe-adresse": ["). Beide nutzen die SELBE Adresse + Raum-ID. Welt gemeinsam: einer teilt sie (Bibliothek), der andere empfängt sie — dann sind beide in derselben worldId.", "). Both use the SAME address + room ID. Shared world: one shares it (Library), the other receives it — then both are in the same worldId."],
            "ui.benannte-gesten-wirkt-sie-einmal": ["Benannte Gesten — ▶ wirkt sie einmal. Mensch + KI an EINEM Pult (Ko-Dirigent).", "Named gestures — ▶ casts one once. Human + AI at ONE desk (co-conductor)."],
            "ui.beschreibe-eine-fremde-vibecode-welt": ["Beschreibe eine fremde Vibecode-Welt — die KI macht ein Portal-Manifest. Browsbar, noch nicht betretbar (Engine-Dateien folgen). Braucht eine aktive KI (Einstellungen).", "Describe a foreign vibecode world — the AI makes a portal manifest. Browsable, not yet enterable (engine files to follow). Needs an active AI (Settings)."],
            "ui.bestbewertet": ["Bestbewertet", "Top rated"],
            "ui.bibliothek": ["Bibliothek", "Library"],
            "ui.bibliothek-panel": ["Bibliothek-Panel", "Library panel"],
            "ui.bibliothek-teil-studio-bereich": ["Bibliothek: Teil · Studio · Bereich …", "Library: Part · Studio · Area …"],
            "ui.bibliothek-von-alexandria": ["Bibliothek von Alexandria", "Library of Alexandria"],
            "ui.bisherige-person-uebernehmen-seele-werkz": ["Bisherige Person übernehmen (Seele + Werkzeuge + eigene Materialien/Baupläne)", "Carry over current persona (soul + tools + own materials/blueprints)"],
            "ui.blendet-duennes-ufer-wandwasser-pro": ["blendet dünnes Ufer-/Wandwasser pro Pixel aus (tiefes bleibt).", "fades out thin shore/wall water per pixel (deep water stays)."],
            "ui.braucht-laufenden": ["— braucht laufenden", "— needs a running"],
            "ui.buehne-das-fokussierte-wesen": ["Bühne — das fokussierte Wesen", "Stage — the focused being"],
            "ui.buehne-dein-avatar": ["Bühne — dein Avatar", "Stage — your avatar"],
            "ui.cel-licht": ["Cel & Licht", "Cel & Light"],
            "ui.cel-stufen": ["Cel-Stufen", "Cel steps"],
            "ui.cerebras": ["Cerebras", "Cerebras"],
            "ui.chat": ["Chat", "Chat"],
            "ui.chronik-der-welt": ["Chronik der Welt", "Chronicle of the World"],
            "ui.cloud-ueber-save-server-proxy": ["Cloud über save-server-Proxy (löst CORS)", "Cloud via save-server proxy (solves CORS)"],
            "ui.connect": ["Connect", "Connect"],
            "ui.cooldown": ["Cooldown", "Cooldown"],
            "ui.cooldown-s": ["Cooldown (s)", "Cooldown (s)"],
            "ui.cors-freundliche-provider-die-ohne": [". CORS-freundliche Provider die ohne Proxy laufen:", ". CORS-friendly providers that work without a proxy:"],
            "ui.daneben-legen": ["Daneben legen", "Place alongside"],
            "ui.das-gelaende-der-neuen-welt": ["das Gelände der neuen Welt gestalten", "shape the terrain of the new world"],
            "ui.das-orchester": ["Das Orchester", "The Orchestra"],
            "ui.das-ultiversum": ["— Das Ultiversum", "— The Ultiverse"],
            "ui.decay-s": ["Decay/s", "Decay/s"],
            "ui.dein-ich": ["Dein Ich", "Your Self"],
            "ui.dein-ich-durchsuchen": ["Dein Ich durchsuchen", "Search your Self"],
            "ui.deine-llm-stimme-fuer-mitspieler": ["Deine LLM-Stimme für Mitspieler ohne eigenen Schlüssel freigeben", "Share your LLM voice with fellow players who have no key of their own"],
            "ui.den-feed-durchsuchen": ["Den Feed durchsuchen", "Search the feed"],
            "ui.der-hof": ["Der Hof", "The Court"],
            "ui.der-nexus-komponiert": ["Der Nexus komponiert", "The Nexus composes"],
            "ui.diagnose-logs-sind-standardmaessig-verst": ["Diagnose-Logs sind standardmäßig versteckt, damit der Chat im Vordergrund bleibt. Für Entwickler-Sicht aktivieren.", "Diagnostic logs are hidden by default so the chat stays in front. Enable for the developer view."],
            "ui.die-bibliothek-der-teile-studio": ["Die Bibliothek der Teile (Studio → Bereich → Teil) wählen oder durchsuchen", "Pick or search the parts library (Studio → Area → Part)"],
            "ui.die-datei-wird-deine-aktive": ["Die Datei wird deine aktive Welt. Deine jetzige Welt bleibt gesichert im Welt-Index — nur eine Datei mit derselben Welt-Id ersetzt sie.", "The file becomes your active world. Your current world stays saved in the world index — only a file with the same world ID replaces it."],
            "ui.die-partitur": ["Die Partitur", "The Score"],
            "ui.die-reise-des-reichs-was": ["Die Reise des Reichs — was geschah + erschaffen wurde. Die Welt erinnert.", "The realm’s journey — what happened + was created. The world remembers."],
            "ui.die-stehenden-gesetze-die-das": ["Die stehenden Gesetze, die das ganze Feld formen — „wann immer X, dann Y\". Sie feuern von selbst. Im Chat/der Omnibox: „wann immer es regnet, dann setze wetter sunny\".", "The standing laws that shape the whole field — “whenever X, then Y”. They fire on their own. In chat/the omnibox: “whenever it rains, then set weather sunny”."],
            "ui.die-welt-erwacht": ["Die Welt erwacht …", "The world awakens …"],
            "ui.diese-welt": ["Diese Welt:", "This world:"],
            "ui.diese-welt-ist-eigenstaendig-keine": ["Diese Welt ist eigenständig — keine Eltern-Welten.", "This world stands on its own — no parent worlds."],
            "ui.diese-welt-verschmilzt-mit-einer": ["Diese Welt verschmilzt mit einer anderen zu einer dritten — beide werden Eltern, eine neue Identität entsteht.", "This world merges with another into a third — both become parents, a new identity is born."],
            "ui.diesen-raum-in-der-lobby": ["Diesen Raum in der Lobby zeigen", "Show this room in the lobby"],
            "ui.drehen-e": ["Drehen (E)", "Rotate (E)"],
            "ui.dsl-geschichten-gemischt-emotionen-gemit": ["DSL-Geschichten gemischt, Emotionen gemittelt. Die Fusion ist ein vermischtes Echo beider.", "DSL stories shuffled, emotions averaged. The fusion is a blended echo of both."],
            "ui.dsl-geschichten-hintereinander-emotionen": ["DSL-Geschichten hintereinander, Emotionen aus dieser Welt. Die Fusion bewahrt diese Welt überlagert.", "DSL stories in sequence, emotions from this world. The fusion keeps this world on top."],
            "ui.dsl-vokabular-kommagetrennt-optional": ["DSL-Vokabular, kommagetrennt (optional)", "DSL vocabulary, comma-separated (optional)"],
            "ui.du": ["Du", "You"],
            "ui.durchsuche-item-material-rezept": ["Durchsuche … (Item, Material, Rezept)", "Search … (item, material, recipe)"],
            "ui.ein-ed25519-schluesselpaar-lokal-erzeugt": ["Ein ed25519-Schlüsselpaar, lokal erzeugt — deine unverfälschbare Identität. Damit signierst du deine Werke; andere prüfen, dass sie wirklich von dir stammen. Kein Coin, keine Kette — nur Echtheit. Sichere ihn: ohne Schlüssel ist die Identität verloren.", "An ed25519 key pair, generated locally — your unforgeable identity. With it you sign your works; others verify they truly come from you. No coin, no chain — just authenticity. Back it up: without the key, the identity is lost."],
            "ui.ein-neues-wesen-rufen": ["✦ Ein neues Wesen rufen", "✦ Call a new being"],
            "ui.eine-fremde-geschlossene-welt-aus": ["Eine fremde, geschlossene Welt aus einem Ordner ODER GitHub-Repo. Läuft sandgesichert (null-origin) — die fremde Engine kann AnazhRealm nicht berühren. Braucht npm start.", "A foreign, closed world from a folder OR GitHub repo. Runs sandboxed (null-origin) — the foreign engine cannot touch AnazhRealm. Needs npm start."],
            "ui.eine-neue-welt-erwacht-waehle": ["Eine neue Welt erwacht — wähle ihre Beziehungs-Form.", "A new world awakens — choose its form of relation."],
            "ui.eine-private-welt-nur-fuer": ["— eine private Welt nur für dich", "— a private world just for you"],
            "ui.eine-welt-datei-einlesen-ein": ["Eine Welt-Datei einlesen — ein AnazhRealm-Snapshot (öffnet das Welt-Tor: ersetzen · daneben · verschmelzen) ODER ein fremdes Welt-Manifest (andocken). Der Typ wird automatisch erkannt.", "Load a world file — an AnazhRealm snapshot (opens the World Gate: replace · alongside · merge) OR a foreign world manifest (dock). The type is detected automatically."],
            "ui.eingebaut-zum-bearbeiten-klonen": ["Eingebaut — zum Bearbeiten klonen", "Built-in — clone to edit"],
            "ui.einladungs-code": ["Einladungs-Code:", "Invite code:"],
            "ui.einstellungen": ["Einstellungen", "Settings"],
            "ui.einstellungen-panel": ["Einstellungen-Panel", "Settings panel"],
            "ui.emotion": ["Emotion", "Emotion"],
            "ui.emotion-tuning": ["Emotion-Tuning", "Emotion tuning"],
            "ui.emotionen-max-aggregiert-vereinigung-sta": ["Emotionen max-aggregiert (Vereinigung statt Mittelung) — die neue Welt ist von beider Intensität geprägt.", "Emotions max-aggregated (union instead of average) — the new world carries the intensity of both."],
            "ui.empfangen": ["Empfangen", "Receive"],
            "ui.endpoint": ["Endpoint", "Endpoint"],
            "ui.endpoint-kann-eine-basis-url": ["Endpoint kann eine Basis-URL sein (z.B.", "Endpoint can be a base URL (e.g."],
            "ui.entdecke-betritt-die-welten-des": ["Entdecke + betritt die Welten des Ultiversums, schöpfe + teile die eigenen — souverän über deinen Vibe-Pass, peer-to-peer durchs Mesh. Kein Konzern dazwischen.", "Discover + enter the worlds of the Ultiverse, create + share your own — sovereign through your Vibe Pass, peer-to-peer across the mesh. No corporation in between."],
            "ui.erschaffen": ["Erschaffen", "Create"],
            "ui.ersetzen": ["Ersetzen", "Replace"],
            "ui.farb-palette": ["Farb-Palette", "Color palette"],
            "ui.farb-variation": ["Farb-Variation", "Color variation"],
            "ui.farben": ["Farben", "Colors"],
            "ui.fels-boden-maserung": ["= Fels-/Boden-Maserung.", "= rock/ground grain."],
            "ui.filter": ["Filter", "Filter"],
            "ui.fluss-schaum-tiefe": ["Fluss-Schaum (Tiefe)", "River foam (depth)"],
            "ui.fog-distanz": ["Fog-Distanz", "Fog distance"],
            "ui.form-palette": ["Form-Palette", "Shape palette"],
            "ui.formen": ["Formen", "Shapes"],
            "ui.formen-die-licht-abstufung-wenig": ["formen die Licht-Abstufung (wenig = harte gemalte Linien wie Studio-Ghibli, viele = weicher Verlauf).", "shape the light banding (few = hard painted lines like Studio Ghibli, many = soft gradient)."],
            "ui.fps": ["FPS", "FPS"],
            "ui.fremde-welt-einbinden": ["Fremde Welt einbinden", "Bring in a foreign world"],
            "ui.fremde-welt-manifest": ["fremde Welt → Manifest", "foreign world → manifest"],
            "ui.fremdes-buendel-bibliothek": ["fremdes Bündel → Bibliothek", "foreign bundle → library"],
            "ui.frieden": ["frieden", "peace"],
            "ui.fuchs-flink-listig": ["Fuchs (flink · listig)", "Fox (nimble · cunning)"],
            "ui.fuer-dich": ["Für dich", "For you"],
            "ui.fuer-entwickler": ["(für Entwickler)", "(for developers)"],
            "ui.fuer-openai-kompatible-cloud-hoster": ["für OpenAI-kompatible Cloud-Hoster).", "for OpenAI-compatible cloud hosts)."],
            "ui.fusionieren": ["Fusionieren", "Fuse"],
            "ui.gehorcht-voller-zugang-kein-schaden": ["gehorcht — voller Zugang, kein Schaden", "obeys — full access, no damage"],
            "ui.gelaende-studio": ["Gelände-Studio …", "Terrain Studio …"],
            "ui.gelenk-probe": ["▶ Gelenk-Probe", "▶ Joint test"],
            "ui.gelenk-probe-wackelt-die-erkannten": ["Gelenk-Probe — wackelt die erkannten Gelenke 2 s in der Vorschau (bauen → SEHEN, was sich bewegt)", "Joint test — wiggles the detected joints for 2 s in the preview (build → SEE what moves)"],
            "ui.gemini": ["Gemini", "Gemini"],
            "ui.gewaehlt": ["gewählt:", "chosen:"],
            "ui.grid-snap-g": ["Grid-Snap (G)", "Grid snap (G)"],
            "ui.grok": ["Grok", "Grok"],
            "ui.groq": ["Groq", "Groq"],
            "ui.h-hud-zeigen": ["H — HUD zeigen", "H — show HUD"],
            "ui.hauptansichten": ["Hauptansichten", "Main views"],
            "ui.hebel-auf-das-gesetz-des": ["Hebel auf das Gesetz des Schatten-Bias (je Kaskade aus ihrer Texel-Kante; 1 = das Gesetz)", "Lever on the law of shadow bias (per cascade from its texel edge; 1 = the law)"],
            "ui.helix": ["Helix", "Helix"],
            "ui.hilfe": ["Hilfe", "Help"],
            "ui.hirsch-sanft-wiese": ["Hirsch (sanft · Wiese)", "Deer (gentle · meadow)"],
            "ui.hof": ["Hof", "Court"],
            "ui.host": ["Host", "Host"],
            "ui.hotbar": ["Hotbar", "Hotbar"],
            "ui.hover-zeigt-alle-stats": ["Hover zeigt alle Stats", "Hover to see all stats"],
            "ui.http-localhost-11434": ["http://localhost:11434", "http://localhost:11434"],
            "ui.http-localhost-11434-oder-https": ["http://localhost:11434  oder  https://ollama.com/api/chat", "http://localhost:11434  or  https://ollama.com/api/chat"],
            "ui.https-api-groq-com-openai": ["https://api.groq.com/openai/v1/chat/completions", "https://api.groq.com/openai/v1/chat/completions"],
            "ui.https-ollama-com-api-chat": ["https://ollama.com/api/chat", "https://ollama.com/api/chat"],
            "ui.https-provider-v1-chat-completions": ["https://provider/v1/chat/completions", "https://provider/v1/chat/completions"],
            "ui.ich": ["Ich", "Self"],
            "ui.ich-erschaffe-die-welt-lade": ["— ich erschaffe die Welt + lade andere ein", "— I create the world + invite others"],
            "ui.ich-komme-zu-einem-host": ["— ich komme zu einem Host", "— I join a host"],
            "ui.importierte-welt-bekommt-eine-neue": ["Importierte Welt bekommt eine neue Identität neben deiner aktuellen.", "The imported world gets a new identity next to your current one."],
            "ui.importierte-welt-wird-zuerst-daneben": ["Importierte Welt wird zuerst daneben gelegt, dann öffnet sich der Fusions-Dialog mit ihr als Eltern-B.", "The imported world is first placed alongside, then the fusion dialog opens with it as parent B."],
            "ui.inaktiv": ["Inaktiv.", "Inactive."],
            "ui.ist-der-haupt-hebel-gegen": ["ist der Haupt-Hebel gegen die Facetten-Rauten (blendet die Beleuchtungs-Normale nach oben; 100 % = flach wie 2.5D).", "is the main lever against the facet diamonds (blends the lighting normal upward; 100 % = flat like 2.5D)."],
            "ui.ist-der-sicht-ring-oben": ["ist der Sicht-Ring oben.", "is the view ring above."],
            "ui.ist-die-halbbreite-des-schatten": ["ist die Halbbreite des Schatten-Frustums in Metern (kleiner = schärfere Texel an steilen Wänden, aber kleinere Fläche um dich).", "is the half-width of the shadow frustum in meters (smaller = sharper texels on steep walls, but a smaller area around you)."],
            "ui.ist-die-obergrenze-unter-der": ["ist die Obergrenze, unter der der Regler das Laub reduziert rendert.", "is the ceiling below which the governor renders foliage reduced."],
            "ui.joinen": ["Joinen", "Join"],
            "ui.js-compute-welt-ein-peer": ["JS-Compute-Welt (ein Peer wird Compute-Host — impliziert Multiplayer)", "JS compute world (one peer becomes compute host — implies multiplayer)"],
            "ui.kamera-auf-bauplan-zentrieren-h": ["Kamera auf Bauplan zentrieren (H)", "Center camera on blueprint (H)"],
            "ui.kamera-modus": ["Kamera-Modus", "Camera mode"],
            "ui.kanten-schaerfe": ["Kanten-Schärfe", "Edge sharpness"],
            "ui.kavitaets-ao": ["Kavitäts-AO", "Cavity AO"],
            "ui.kegel": ["Kegel", "Cone"],
            "ui.klang-aus": ["Klang: aus", "Sound: off"],
            "ui.klick-aendern-und-druecke-dann": ["Klick „Ändern\" und drücke dann die gewünschte Taste oder Maustaste. Esc bricht ab. WASD und 1-9 sind Konvention und bleiben fest. „Abbauen\" entfernt Architekturen am Fadenkreuz — trifft keine, wird ein Loch ins Terrain gegraben.", "Click “Change” and then press the key or mouse button you want. Esc cancels. WASD and 1-9 are convention and stay fixed. “Dig” removes architecture at the crosshair — if it hits none, a hole is dug into the terrain."],
            "ui.klick-eine-rezept-oder-wesen": ["Klick eine Rezept- oder Wesen-Karte für die 3D-Vorschau.", "Click a recipe or being card for the 3D preview."],
            "ui.klick-part-waehlen-drag-auf": ["Klick: Part wählen · Drag auf Achse: bewegen · Drag ins Leere: orbit · Shift+Drag oder Mittelmaus: pan · Rad: zoom zum Cursor · W/E/R/C: Modus · G: einrasten", "Click: select part · Drag on axis: move · Drag on empty: orbit · Shift+Drag or middle mouse: pan · Wheel: zoom to cursor · W/E/R/C: mode · G: snap"],
            "ui.klonen": ["Klonen", "Clone"],
            "ui.km-h": ["km/h", "km/h"],
            "ui.knoten-verbinden-fuer-die-online": ["Knoten: — (verbinden für die Online-Zahl)", "Nodes: — (connect for the online count)"],
            "ui.koerper": ["Körper", "Body"],
            "ui.konsole": ["Konsole", "Console"],
            "ui.konsole-einklappen": ["Konsole einklappen", "Collapse console"],
            "ui.kopieren": ["kopieren", "copy"],
            "ui.kreatur-seele-waehlen": ["Kreatur-Seele wählen", "Choose creature soul"],
            "ui.kreaturen": ["Kreaturen", "Creatures"],
            "ui.kreaturen-panel": ["Kreaturen-Panel", "Creatures panel"],
            "ui.kreaturen-sprechen-von-selbst-bei": ["Kreaturen sprechen von selbst bei wichtigen Ereignissen — Level-Up, Trank-Wirkung, fehlendes Material. Sanft gedrosselt (60 s/Wesen, 8 s gesamt), damit der Chat ruhig bleibt.", "Creatures speak up on their own at key moments — level-up, potion effect, missing material. Gently throttled (60 s/being, 8 s overall) so the chat stays calm."],
            "ui.kreaturen-stimmen": ["Kreaturen-Stimmen", "Creature voices"],
            "ui.kugel": ["Kugel", "Sphere"],
            "ui.kurze-beschreibung-optional": ["kurze Beschreibung (optional)", "short description (optional)"],
            "ui.laub-aufloesung": ["Laub-Auflösung", "Foliage resolution"],
            "ui.lautstaerke-sicht-weite": ["Lautstärke + Sicht-Weite", "Volume + view distance"],
            "ui.lebenskraft-ausdauer": ["Lebenskraft + Ausdauer", "Vitality + Stamina"],
            "ui.leer-aktive-welt": ["(leer = aktive Welt)", "(empty = active world)"],
            "ui.leer-automatisch": ["(leer = automatisch)", "(empty = automatic)"],
            "ui.leistung-wald": ["Leistung (Wald)", "Performance (forest)"],
            "ui.lobby-durchsuchen": ["Lobby durchsuchen", "Browse lobby"],
            "ui.localhost-4312-api-proxy-llm": ["localhost:4312/api/proxy/llm", "localhost:4312/api/proxy/llm"],
            "ui.lod-referenz": ["LOD-Referenz", "LOD reference"],
            "ui.loeschen": ["Löschen", "Delete"],
            "ui.logbuch": ["Logbuch", "Logbook"],
            "ui.logbuch-ein-ausklappen": ["Logbuch ein-/ausklappen", "Expand/collapse logbook"],
            "ui.logbuch-sichtbar": ["Logbuch sichtbar", "Logbook visible"],
            "ui.mach-aktion": ["Mach-Aktion", "Make action"],
            "ui.manipulator-modus": ["Manipulator-Modus", "Manipulator mode"],
            "ui.master": ["Master", "Master"],
            "ui.master-gilt-fuer-die-ganze": ["Master gilt für die ganze Welt-Klangschicht. Umgebungsgeräusche (die Klang-Welt: Wind, Laub, Wasser, Glut, Regen, Vögel, Grillen, Tier-Rufe) haben einen eigenen Anteil (mute mit 0). Render-Ring 1 = 3×3 Chunks, 12 = volle Weite.", "Master applies to the whole world sound layer. Ambient sounds (the sound world: wind, leaves, water, embers, rain, birds, crickets, animal calls) have their own share (mute with 0). Render ring 1 = 3×3 chunks, 12 = full distance."],
            "ui.material-palette": ["Material-Palette", "Material palette"],
            "ui.material-werkzeug-farb-palette": ["Material-/Werkzeug-/Farb-Palette", "Material/tool/color palette"],
            "ui.materialien": ["Materialien", "Materials"],
            "ui.mikro-struktur": ["Mikro-Struktur", "Micro structure"],
            "ui.mit-anderen": ["Mit anderen", "With others"],
            "ui.modell": ["Modell", "Model"],
            "ui.modus": ["Modus", "Mode"],
            "ui.move": ["Move", "Move"],
            "ui.multi-user-sync": ["Multi-User Sync", "Multi-User Sync"],
            "ui.multiplayer-welt-eine-gruppe-tritt": ["Multiplayer-Welt (eine Gruppe tritt gemeinsam durch ein Tor)", "Multiplayer world (a group steps through a gate together)"],
            "ui.nach-art-filtern": ["Nach Art filtern", "Filter by kind"],
            "ui.name": ["Name:", "Name:"],
            "ui.name-der-welt": ["Name der Welt", "Name of the world"],
            "ui.neu": ["Neu", "New"],
            "ui.neue-welt": ["Neue Welt", "New world"],
            "ui.neuer-leerer-bauplan": ["Neuer leerer Bauplan", "New empty blueprint"],
            "ui.neuer-slug-optional": ["Neuer Slug (optional):", "New slug (optional):"],
            "ui.npm-run-dev": ["npm run dev", "npm run dev"],
            "ui.npm-run-signaling": ["npm run signaling", "npm run signaling"],
            "ui.nur-diese-eine-welt-im": ["Nur diese eine Welt im Speicher.", "Only this one world in storage."],
            "ui.oberflaechen-textur": ["Oberflächen-Textur", "Surface texture"],
            "ui.oder": ["oder", "or"],
            "ui.oder-github-url-https-github": ["oder GitHub-URL: https://github.com/owner/repo", "or GitHub URL: https://github.com/owner/repo"],
            "ui.oeffentliche-lobby": ["Öffentliche Lobby", "Public lobby"],
            "ui.ok": ["OK", "OK"],
            "ui.oktaeder": ["Oktaeder", "Octahedron"],
            "ui.ollama-com": ["ollama.com", "ollama.com"],
            "ui.ollama-list": ["ollama list", "ollama list"],
            "ui.omnibox-alles-suche": ["Omnibox — Alles-Suche", "Omnibox — search everything"],
            "ui.openrouter": ["OpenRouter", "OpenRouter"],
            "ui.optional-gib-dem-begleiter-eine": ["Optional: gib dem Begleiter eine echte Stimme. Vier Provider — drei mit Gratis-Tiers, Ollama lokal (kein Key) oder gehostet (eigene URL + optional Bearer-Token). Schlüssel liegen nur im localStorage dieses Browsers; jeder Vorschlag geht durch die DSL-Sandbox.", "Optional: give your companion a real voice. Four providers — three with free tiers, Ollama local (no key) or hosted (own URL + optional bearer token). Keys live only in this browser’s localStorage; every suggestion goes through the DSL sandbox."],
            "ui.ordner-waehlen": ["Ordner wählen…", "Choose folder…"],
            "ui.part-entfernen": ["✖ Part entfernen", "✖ Remove part"],
            "ui.pause-zwischen-zwei-ausloesern-derselben": ["= Pause zwischen zwei Auslösern derselben Emotion.", "= pause between two triggers of the same emotion."],
            "ui.perf-daten-exportieren-json": ["Perf-Daten exportieren (.json)", "Export perf data (.json)"],
            "ui.perf-panel-sichtbar-fps-verlauf": ["Perf-Panel sichtbar (fps · Verlauf · Draw-Calls · Stocker)", "Perf panel visible (fps · history · draw calls · stutters)"],
            "ui.pfad": ["pfad", "path"],
            "ui.pixel-blinde-tuning-regler-gemeinsam": ["Pixel-blinde Tuning-Regler — gemeinsam justiert mit dem Schöpfer-Auge im Browser. Vier Bänder: Cel & Licht · Wasser · Schatten · Emotion-Tuning. Jedes Band trägt sein eigenes „?\".", "Pixel-blind tuning sliders — tuned together with the creator’s eye in the browser. Four bands: Cel & Light · Water · Shadow · Emotion tuning. Each band carries its own “?”."],
            "ui.plane": ["Plane", "Plane"],
            "ui.position": ["Position", "Position"],
            "ui.position-welt-aktionen-mit-anderen": ["Position + Welt-Aktionen mit anderen Spielern teilen. Braucht den signaling-server (", "Share position + world actions with other players. Needs the signaling server ("],
            "ui.post-fx-unsharp": ["= Post-FX-Unsharp.", "= post-FX unsharp."],
            "ui.proaktive-sprache-aktiv": ["Proaktive Sprache aktiv", "Proactive speech on"],
            "ui.provider": ["Provider", "Provider"],
            "ui.pyramide": ["Pyramide", "Pyramid"],
            "ui.raum-id": ["Raum-ID", "Room ID"],
            "ui.raum-name-fuer-die-lobby": ["Raum-Name für die Lobby", "Room name for the lobby"],
            "ui.render-feinschliff": ["Render-Feinschliff", "Render fine-tuning"],
            "ui.request-laeuft-ueber": ["). Request läuft über", "). Requests go through"],
            "ui.rezept-regler": ["Rezept-Regler", "Recipe sliders"],
            "ui.rolle": ["Rolle", "Role"],
            "ui.rotate": ["Rotate", "Rotate"],
            "ui.rueckgaengig": ["↶ Rückgängig", "↶ Undo"],
            "ui.rueckgaengig-strg-z-den-letzten": ["Rückgängig (Strg+Z) — den letzten Editor-Schritt zurücknehmen", "Undo (Ctrl+Z) — revert the last editor step"],
            "ui.scale": ["Scale", "Scale"],
            "ui.schatten": ["Schatten", "Shadow"],
            "ui.schatten-bias": ["Schatten-Bias", "Shadow bias"],
            "ui.schatten-bias-2": ["Schatten-Bias ×", "Shadow bias ×"],
            "ui.schatten-reichweite": ["Schatten-Reichweite", "Shadow range"],
            "ui.schliessen": ["Schließen", "Close"],
            "ui.schoepfen-andocken": ["✦ Schöpfen & Andocken", "✦ Create & Dock"],
            "ui.schoepfer": ["schöpfer", "creator"],
            "ui.schoepfer-2": ["Schöpfer", "Creator"],
            "ui.schwelle": ["Schwelle", "Threshold"],
            "ui.see-wellen": ["See-Wellen", "Lake waves"],
            "ui.seele": ["Seele", "Soul"],
            "ui.sektionen": ["Sektionen", "Sections"],
            "ui.selektierten-part-entfernen-entf": ["Selektierten Part entfernen (Entf)", "Remove selected part (Del)"],
            "ui.sequenz": ["Sequenz", "Sequence"],
            "ui.sichern-die-pass-datei-exportieren": ["Sichern = die Pass-Datei exportieren; am neuen PC importieren. Der Pass IST der Schlüssel: wer die Datei hat, ist du (wie ein Bitcoin-Key) — sicher verwahren. Das System verhindert Fälschung (signieren ohne Key unmöglich), nicht die Kopie der eigenen Datei.", "Back up = export the pass file; import it on the new PC. The pass IS the key: whoever has the file is you (like a Bitcoin key) — keep it safe. The system prevents forgery (signing without the key is impossible), not copying your own file."],
            "ui.sicht-1st": ["Sicht: 1st", "View: 1st"],
            "ui.sicht-ring": ["Sicht-Ring", "View ring"],
            "ui.sichtbar": ["Sichtbar", "Visible"],
            "ui.sichtweite": ["Sichtweite", "view distance"],
            "ui.signaling-url": ["Signaling-URL", "Signaling URL"],
            "ui.skalieren-r": ["Skalieren (R)", "Scale (R)"],
            "ui.snap": ["Snap", "Snap"],
            "ui.sortieren": ["Sortieren", "Sort"],
            "ui.sortierung": ["Sortierung", "Sort order"],
            "ui.souveraene-identitaet": ["(souveräne Identität)", "(sovereign identity)"],
            "ui.speichern": ["Speichern", "Save"],
            "ui.spieler-seele-waehlen": ["Spieler-Seele wählen", "Choose player soul"],
            "ui.sprache": ["Sprache", "Language"],
            "ui.sprache-de": ["Deutsch", "Deutsch"],
            "ui.sprache-en": ["English", "English"],
            "ui.sprich-und-die-welt-antwortet": ["sprich, und die Welt antwortet …", "speak, and the world answers …"],
            "ui.stammbaum": ["Stammbaum", "Family tree"],
            "ui.standard-browser": ["Standard (Browser)", "Default (browser)"],
            "ui.standard-wiederherstellen": ["Standard wiederherstellen", "Restore defaults"],
            "ui.stats-laden": ["Stats laden …", "Loading stats …"],
            "ui.steuerung-der-3d-vorschau": ["Steuerung der 3D-Vorschau", "3D preview controls"],
            "ui.stimme": ["Stimme", "Voice"],
            "ui.stimme-aus": ["Stimme: aus", "Voice: off"],
            "ui.stimme-teilen": ["Stimme teilen", "Share voice"],
            "ui.strategie": ["Strategie", "Strategy"],
            "ui.streut-die-biom-farbe": ["streut die Biom-Farbe.", "scatters the biome color."],
            "ui.struktur-tiefe": ["Struktur-Tiefe", "Structure depth"],
            "ui.suche": ["⌕ Suche", "⌕ Search"],
            "ui.suche-oeffnen-strg-k": ["Suche öffnen (Strg+K)", "Open search (Ctrl+K)"],
            "ui.suchen-welten-rezepte-wesen-vokabular": ["⌕ Suchen — Welten · Rezepte · Wesen · Vokabular", "⌕ Search — worlds · recipes · beings · vocabulary"],
            "ui.symbiose-zu-mehrt": ["— Symbiose zu mehrt", "— symbiosis, together"],
            "ui.szene-aufloesung": ["Szene-Auflösung", "Scene resolution"],
            "ui.tacho": ["Tacho", "Speedometer"],
            "ui.tag-laenge": ["Tag-Länge", "Day length"],
            "ui.tag-nacht-zyklus": ["Tag-Nacht-Zyklus", "Day-night cycle"],
            "ui.tag-verschmelzung": ["Tag-Verschmelzung", "Tag merge"],
            "ui.tagebuch": ["Tagebuch", "Journal"],
            "ui.tageszeit": ["Tageszeit", "Time of day"],
            "ui.tastenbelegung": ["Tastenbelegung", "Key bindings"],
            "ui.tippe-eine-absicht-c-befehl": ["Tippe eine Absicht …  c: Befehl · b: Bauplan · w: Waffe · geh: Raum · sonst sprich zum Nexus", "Type an intent …  c: command · b: blueprint · w: weapon · go: room · else speak to the Nexus"],
            "ui.together-ai": ["Together AI", "Together AI"],
            "ui.torus": ["Torus", "Torus"],
            "ui.trag-den-modell-namen-ein": ["Trag den Modell-Namen ein wie er bei dir verfügbar ist. Lokal:", "Enter the model name as it is available to you. Local:"],
            "ui.uebersetzen": ["Übersetzen", "Translate"],
            "ui.ufer-schaerfe": ["Ufer-Schärfe", "Shore sharpness"],
            "ui.umarmt-kein-hp-kein-tod": ["umarmt — kein HP, kein Tod, keine Stamina", "embraces — no HP, no death, no stamina"],
            "ui.umgebungsgeraeusche": ["Umgebungsgeräusche", "Ambient sounds"],
            "ui.untertitel": ["Untertitel", "Subtitles"],
            "ui.untertitel-jede-stimme-und-jeder": ["Untertitel (jede Stimme und jeder Ruf der Klang-Welt als Zeile, mit Richtung)", "Subtitles (every voice and every call of the sound world as a line, with direction)"],
            "ui.verbergen": ["Verbergen", "Hide"],
            "ui.verbinden-c": ["Verbinden (C)", "Connect (C)"],
            "ui.vergessen": ["Vergessen", "Forget"],
            "ui.verhandelt-hp-stamina-tod-wandlung": ["verhandelt — HP, Stamina, Tod-Wandlung", "negotiates — HP, stamina, death-transformation"],
            "ui.verschieben-w": ["Verschieben (W)", "Move (W)"],
            "ui.verschiebt-den-schatten-entlang-der": ["verschiebt den Schatten entlang der Normale (zu klein → Acne-Streifen, zu gross → der Schatten löst sich vom Fuss).", "shifts the shadow along the normal (too small → acne stripes, too large → the shadow detaches from the foot)."],
            "ui.verschmelzen": ["Verschmelzen", "Merge"],
            "ui.vibe-pass": ["Vibe-Pass", "Vibe Pass"],
            "ui.vibe-pass-sichern": ["Vibe-Pass sichern…", "Back up Vibe Pass…"],
            "ui.vorschau": ["Vorschau", "Preview"],
            "ui.w7-phase-4": ["(W7 Phase 4)", "(W7 phase 4)"],
            "ui.waehle-deinen-koerper-einen-neuen": ["Wähle deinen Körper. Einen neuen formst du in der Werkstatt („Körper holen", "Choose your body. Shape a new one in the Workshop (“Get body"],
            "ui.waehle-ein-wesen-aus-der": ["Wähle ein Wesen aus der Liste — es tritt auf die Bühne, seine volle Natur/Werte/Wachstum lesen darunter. Befiehl ihm inline; wähle eine Sektion, um zur ganzen Gruppe zu sprechen.", "Pick a being from the list — it steps onto the stage, with its full nature/values/growth below. Command it inline; pick a section to speak to the whole group."],
            "ui.waehlen-ausfuehren-esc-schliessen": ["↑↓ wählen · ⏎ ausführen · Esc schließen", "↑↓ select · ⏎ run · Esc close"],
            "ui.waehlt-scharf-60-mehr-bild": ["wählt scharf (60, mehr Bild) ↔ flüssig (30, das System darf schwerer laden); der Perf-Regler pendelt darauf ein, indem er die Render-Auflösung + das Laub nachgeben lässt.", "chooses sharp (60, more image) ↔ smooth (30, the system may load heavier); the perf governor settles on it by letting render resolution + foliage give way."],
            "ui.was-ich-habe": ["Was ich habe", "What I have"],
            "ui.was-ich-machen-kann": ["Was ich machen kann", "What I can make"],
            "ui.wasser": ["Wasser", "Water"],
            "ui.wasser-cull": ["Wasser-Cull", "Water cull"],
            "ui.wasser-tiefe": ["Wasser-Tiefe", "Water depth"],
            "ui.welt": ["Welt", "World"],
            "ui.welt-andocken": ["Welt andocken", "Dock world"],
            "ui.welt-beziehung": ["Welt-Beziehung", "Relation to the world"],
            "ui.welt-datei-exportieren": ["⬇ Welt-Datei exportieren", "⬇ Export world file"],
            "ui.welt-des-hosts-ueber-das": ["Welt des Hosts über das Mesh neu holen", "Re-fetch the host’s world over the mesh"],
            "ui.welt-fusion": ["Welt-Fusion", "World Fusion"],
            "ui.welt-id-a-z-0": ["welt-id (a-z 0-9 - _)", "world-id (a-z 0-9 - _)"],
            "ui.welt-tor": ["Welt-Tor", "World Gate"],
            "ui.welt-uebersetzen": ["Welt übersetzen", "Translate world"],
            "ui.welt-vom-host-neu-holen": ["Welt vom Host neu holen", "Re-fetch world from host"],
            "ui.welten-deiner-mitspieler-im-selben": ["Welten deiner Mitspieler im selben Mesh-Raum — peer-to-peer holen, kein GitHub nötig. „✓ vorhanden\" heißt: du hast sie schon. Braucht eine stehende Mesh-Verbindung (Multi-User).", "Worlds of your fellow players in the same mesh room — fetched peer-to-peer, no GitHub needed. “✓ present” means you already have it. Needs a live mesh connection (multi-user)."],
            "ui.wer-ich-bin": ["Wer ich bin", "Who I am"],
            "ui.werkstatt": ["Werkstatt", "Workshop"],
            "ui.werkstatt-panel": ["Werkstatt-Panel", "Workshop panel"],
            "ui.werkstatt-zahlen-ein-ausblenden-fps": ["Werkstatt-Zahlen ein-/ausblenden (FPS · Kreaturen · Aufträge · Seele · Bauten · Position)", "Show/hide workshop stats (FPS · Creatures · Quests · Soul · Builds · Position)"],
            "ui.werkzeug-palette": ["Werkzeug-Palette", "Tool palette"],
            "ui.werkzeuge": ["Werkzeuge", "Tools"],
            "ui.werkzeuge-erklaert": ["Werkzeuge erklärt", "Tools explained"],
            "ui.wetter": ["Wetter", "Weather"],
            "ui.wie-du-die-welt-wertest": ["Wie du die Welt WERTEST — färbt den Bildschirmrand.", "How you VALUE the world — tints the screen edge."],
            "ui.wie-heisst-deine-welt-stimme": ["Wie heißt deine Welt-Stimme, wie heißt du? Werden im LLM-System-Prompt referenziert. Default „Grok\" (aus den vier Testamenten) und „Schöpfer\" (Mensch=Null=Schöpfer).", "What is your world voice called, and what are you called? Referenced in the LLM system prompt. Default “Grok” (from the four testaments) and “Creator” (Human=Null=Creator)."],
            "ui.wie-schmal-die-uferlinie-einblendet": ["= wie schmal die Uferlinie einblendet,", "= how narrowly the shoreline fades in,"],
            "ui.wie-schnell-atmet-die-welt": ["Wie schnell atmet die Welt? Ein voller Zyklus von Mitternacht über Mittag zurück. 8 Min schnell-spürbar, 60 Min für ein realistisches Welt-Gefühl. Die Tageszeit steht in der Status-Bar.", "How fast does the world breathe? One full cycle from midnight through noon and back. 8 min to feel it quickly, 60 min for a realistic world feel. The time of day shows in the status bar."],
            "ui.wie-schnell-es-ins-dunkle": ["= wie schnell es ins Dunkle kippt. See-Wellen, Fluss-Schaum, Wasserfall-Steilheit und Auslauf-Übergang feilen die Form.", "= how fast it tips into darkness. Lake waves, river foam, waterfall steepness and outflow transition refine the shape."],
            "ui.wie-schnell-sie-verblasst": ["= wie schnell sie verblasst.", "= how fast it fades."],
            "ui.wiederherstellen": ["Wiederherstellen…", "Restore…"],
            "ui.wiederholen": ["↷ Wiederholen", "↷ Redo"],
            "ui.wiederholen-strg-y-den-zurueckgenommenen": ["Wiederholen (Strg+Y) — den zurückgenommenen Schritt wiederherstellen", "Redo (Ctrl+Y) — restore the reverted step"],
            "ui.wird-angehaengt-oder-eine-vollstaendige": ["wird angehängt) oder eine vollständige URL inklusive Pfad (", "is appended) or a full URL including path ("],
            "ui.wo-der-welt-dunst-beginnt": ["= wo der Welt-Dunst beginnt.", "= where the world haze begins."],
            "ui.wolf-jaeger-wach": ["Wolf (Jäger · wach)", "Wolf (hunter · alert)"],
            "ui.wuerfel": ["Würfel", "Cube"],
            "ui.z-b-eine-voxel-sandbox": ["z. B.: Eine Voxel-Sandbox mit Tag-Nacht-Zyklus, Wetter und Block-Bauen…", "e.g.: A voxel sandbox with day-night cycle, weather and block building…"],
            "ui.z-b-llama3-2-qwen3": ["z.B. llama3.2, qwen3, gpt-oss:20b", "e.g. llama3.2, qwen3, gpt-oss:20b"],
            "ui.zeichnet-facetten-kanten-als-kontakt": ["zeichnet Facetten-Kanten als Kontakt-Schatten.", "draws facet edges as contact shadows."],
            "ui.zeigt-deine-modelle-cloud-hoster": ["zeigt deine Modelle. Cloud-Hoster: prüfe deren Modell-Liste.", "shows your models. Cloud hosts: check their model list."],
            "ui.zeit": ["Zeit", "Time"],
            "ui.zentrieren": ["Zentrieren", "Center"],
            "ui.ziel-fps": ["Ziel-FPS", "Target FPS"],
            "ui.ziel-fps-scharf-fluessig": ["Ziel-FPS (scharf ↔ flüssig)", "Target FPS (sharp ↔ smooth)"],
            "ui.zufaellig": ["Zufällig", "Random"],
            "ui.zufalls-mix": ["Zufalls-Mix", "Random mix"],
            "ui.zylinder": ["Zylinder", "Cylinder"],
            "vorschau.badge.eigen": ["eigen", "yours"],
            "vorschau.badge.fest": ["fest", "built-in"],
            "vorschau.badge.praegung": ["Prägung", "Imprint"],
            "vorschau.badge.studio": ["Studio", "Studio"],
            "vorschau.fertigen": ["⚒ FERTIGEN", "⚒ CRAFT"],
            "vorschau.fertigen.titel": ["{verb} — das reale Werk herstellen: zieht Material (pfad/frieden, frei in schöpfer), friert die Präzision ein, rüstet/wirkt. Re-fertigbar.", "{verb} — make the real work: draws material (pfad/frieden, free in schöpfer), freezes the precision, equips/takes effect. Can be re-crafted."],
            "vorschau.gesetz.dein-werk": ["dein Werk", "your work"],
            "vorschau.gesetz.der-wirt": ["der Wirt", "the host"],
            "vorschau.griff.praegung": ["{lab} in die Welt legen — ein Griff (prägt die Welt)", "Place {lab} in the world — one grip (imprints the world)"],
            "vorschau.griff.werk": ["{lab} in die Welt legen — ein Griff (das Werk steht, wohin du blickst)", "Place {lab} in the world — one grip (the work stands where you look)"],
            "vorschau.griff.wesen": ["{lab} in die Welt legen — ein Griff (ein Wesen erscheint)", "Place {lab} in the world — one grip (a creature appears)"],
            "vorschau.intent": ["Intent", "Intent"],
            "vorschau.intent.emergent": ["✨ Emergent", "✨ Emergent"],
            "vorschau.intent.emergent.titel": ["LOSLASSEN: Markierung lösen — die Rolle emergiert wieder aus der Substanz.", "RELEASE: clear the marking — the role emerges from the substance again."],
            "vorschau.intent.portal": ["Portal →", "Portal →"],
            "vorschau.intent.portal.titel": ["Das ZIEL ist Wille, keine Substanz: auf die gewählte Welt richten — das Werk wird ein Tor.", "The TARGET is will, not substance: aim at the chosen world — the work becomes a gate."],
            "vorschau.intent.station": ["⚒ Station", "⚒ Station"],
            "vorschau.intent.station.titel": ["Der ZWECK ist Wille: dieses Bauwerk DIENT als Werkstatt (Esse/Brennkolben-Zwilling) — die bediente Domäne emergiert aus seiner Substanz.", "The PURPOSE is will: this building SERVES as a workshop (forge/alembic twin) — the domain it serves emerges from its substance."],
            "vorschau.intent.titel": ["Die ROLLE fixt der Prozess (Werkzeug auf den Part ziehen). Hier leben nur die drei Akte, die KEIN Prozess ableiten kann: Ziel, Zweck, Loslassen.", "The process fixes the ROLE (drag a tool onto the part). Only the three acts NO process can derive live here: target, purpose, release."],
            "vorschau.klang.aktiv": ["♪ Welt-Klang (aktiv)", "♪ World sound (active)"],
            "vorschau.klang.setzen": ["♪ Als Welt-Klang setzen", "♪ Set as world sound"],
            "vorschau.klang.titel": ["Der Lofi-Strom der Welt folgt diesem Genre (Tempo + Skala aus dem Genesis-Rezept) — ab dem nächsten Akkord.", "The world's lofi stream follows this genre (tempo + scale from the Genesis recipe) — from the next chord on."],
            "vorschau.knoten-titel": ["{lab} — Gesetz: {gesetz} · Leser: {leser}", "{lab} — Law: {gesetz} · Reader: {leser}"],
            "vorschau.knoten-titel.ohne-griff": ["{lab} — Gesetz: {gesetz} · Leser: {leser} · kein Griff: nur anschaubar", "{lab} — Law: {gesetz} · Reader: {leser} · no grip: view only"],
            "vorschau.leser.keiner": ["keiner (tot)", "none (dead)"],
            "vorschau.ohne-buch": ["⚠ ohne Buch", "⚠ no book"],
            "vorschau.ohne-namen": ["⚠ ohne Namen", "⚠ unnamed"],
            "vorschau.physik.griffnah": ["griffnah balanciert — schnelle, leichte Führung", "balanced near the grip — quick, light handling"],
            "vorschau.physik.kippt": ["kippt — der Schwerpunkt liegt außerhalb der Standfläche", "tips over — the center of mass lies outside the footprint"],
            "vorschau.physik.kopflastig": ["kopflastig — die Masse sitzt weit vom Griff, der Schwung ist träge", "top-heavy — the mass sits far from the grip, the swing is sluggish"],
            "vorschau.physik.schneide-luecke": ["die Schneide hat eine Lücke — sie schneidet nicht durchgehend", "the edge has a gap — it doesn't cut all the way"],
            "vorschau.physik.schwebt": ["{n}× schwebendes Teil — der Lastpfad zum Boden ist gebrochen", "{n}× floating part — the load path to the ground is broken"],
            "vorschau.physik.steht": ["steht — der Schwerpunkt sitzt sicher über der Standfläche", "stands — the center of mass sits safely over the footprint"],
            "vorschau.physik.wackelig": ["wackelig — der Schwerpunkt sitzt nah an der Kipp-Kante", "wobbly — the center of mass sits close to the tipping edge"],
            "vorschau.rezept-hinweis": ["Ein Eintrag des LIVE-Rezeptbuchs — anschaubar + regelbar (Studio-Regler links), nicht platzierbar. Das Welt-Verhalten bestimmt allein place.mode des Rezepts.", "An entry from the LIVE recipe book — viewable + tunable (studio sliders on the left), not placeable. The recipe's place.mode alone decides how it behaves in the world."],
            "vorschau.rezept-kopf": ["{lab} · Studio-Rezept ({art})", "{lab} · Studio recipe ({art})"],
            "vorschau.station.braucht": ["⚙ braucht {station}", "⚙ needs {station}"],
            "vorschau.station.braucht.titel": ["Im pfad-Modus braucht dieses Werk die passende Welt-Werkstatt in der Nähe.", "In pfad mode this work needs the matching world workshop nearby."],
            "vorschau.station.nah": ["⚙ {station} nah", "⚙ {station} nearby"],
            "vorschau.station.nah.titel": ["Die passende Welt-Werkstatt ist in der Nähe — du kannst hier fertigen.", "The matching world workshop is nearby — you can craft here."],
            "vorschau.studio-laedt": ["Studio-Asset lädt…", "Studio asset loading…"],
            "vorschau.verb.bauen": ["Bauen (das Werk steht, wohin du blickst)", "Build (the work stands where you look)"],
            "vorschau.verb.geraet": ["Gerät schmieden (in die Hand)", "Forge a tool (into your hand)"],
            "vorschau.verb.koerper": ["Körper formen (verkörpern)", "Shape a body (embody)"],
            "vorschau.verb.ruestung": ["Rüstung weben (tragen)", "Weave armor (wear)"],
            "vorschau.verb.trank": ["Trank brauen (trinken)", "Brew a potion (drink)"],
            "vorschau.werk": ["Werk", "Work"],
            "welt.brennpunkt-glimmt": ["„{ding}\" glimmt im Brennpunkt von „{linse}\" — rück es aus dem Licht, sonst fängt es Feuer.", "“{ding}” is smouldering in the focus of “{linse}” — move it out of the light before it catches fire."],
            "welt.deine-faust": ["Deine Faust", "Your fist"],
            "welt.katalog.begegnung.name": ["Begegnungs-Feld", "Field of Encounters"],
            "welt.katalog.begegnung.text": ["Ein stilles Lichter-Feld — eine fremde single-player Engine, in der ihr euch trotzdem seht: AnazhRealm injiziert die Ko-Präsenz übers Mesh.", "A quiet field of lights — a foreign single-player engine in which you still see each other: AnazhRealm brings in co-presence over the mesh."],
            "welt.katalog.fachwerk.name": ["Fachwerkhaus — parametrisch, begehbar", "Timber-Frame House — parametric, walkable"],
            "welt.katalog.fachwerk.text": ["Das Haus-Labor: parametrisches Fachwerk, tragwerk-ehrlich und begehbar — 32 Kulturen, Dorf-Modus mit gewachsenen Siedlungen.", "The house lab: parametric timber framing, structurally honest and walkable — 32 cultures, village mode with grown settlements."],
            "welt.katalog.fluid.name": ["Strom-Welt", "Flow World"],
            "welt.katalog.fluid.text": ["Ein Stable-Fluids-Solver: Tinte strömt, Stürme wirbeln. Eine fremde Engine mit eigener Three.js.", "A Stable Fluids solver: ink flows, storms swirl. A foreign engine with its own Three.js."],
            "welt.katalog.garage.name": ["Anatomie · Fahrzeug", "Anatomy · Vehicle"],
            "welt.katalog.garage.text": ["Das Fahrzeug-Labor: Skelett, Soll-Maße und Lehren urteilen die Karosserie — fünf Gattungen, fünf Kulturen, fahrbare Probefahrt mit Reifenspuren.", "The vehicle lab: skeleton, target dimensions and principles judge the bodywork — five classes, five cultures, a drivable test run with tyre tracks."],
            "welt.katalog.klang.name": ["Genesis — Generatives Musiksystem", "Genesis — Generative Music System"],
            "welt.katalog.klang.text": ["Das Klang-Labor: 22 Genres aus Kompositions-Gesetzen und DNA-Dials — dieselbe Quelle, aus der das Host-Lofi Tempo und Skala liest.", "The sound lab: 22 genres from laws of composition and DNA dials — the same source the host lo-fi reads its tempo and scale from."],
            "welt.katalog.koerperstudio.name": ["Da Vinci Studio — Lebendiger Mensch", "Da Vinci Studio — Living Human"],
            "welt.katalog.koerperstudio.text": ["Das Menschen-Labor: der lebendige Körper aus Morph-Dials, Bewegungsprofilen und Ninja-Park — die Quelle der Avatar-Gestalt-Daten.", "The human lab: the living body from morph dials, motion profiles and a ninja park — the source of the avatar's shape data."],
            "welt.katalog.portale.name": ["Porta — Ordnungen & fraktale Tiefe", "Porta — Orders & Fractal Depth"],
            "welt.katalog.portale.text": ["Das Tor-Labor: sieben Portal-Ordnungen aus der Stich-Schub-Dicke-Lehre, fraktal vertieft, mit öffnenden Türen.", "The gate lab: seven portal orders from the rise-thrust-thickness principle, fractally deepened, with opening doors."],
            "welt.katalog.schmiede.name": ["Anatomie · Klinge", "Anatomy · Blade"],
            "welt.katalog.schmiede.text": ["Das Klingen-Labor: Rückgrat, Schnittprofil und Lehren urteilen die Waffe — 22 Gattungen, 4 Traditionen, Anschlag-Probe und Prüfstand.", "The blade lab: spine, cutting profile and principles judge the weapon — 22 types, 4 traditions, strike test and test bench."],
            "welt.katalog.schwarm.name": ["Schwarm-Welt", "Swarm World"],
            "welt.katalog.schwarm.text": ["Ein 2D-Schwarm aus hunderten Wesen — eine fremde Engine, die null-origin sandgesichert läuft, ohne AnazhRealm je zu berühren.", "A 2D swarm of hundreds of beings — a foreign engine that runs sandboxed at null origin, without ever touching AnazhRealm."],
            "welt.katalog.skeleton.name": ["Skelett-Welt", "Skeleton World"],
            "welt.katalog.skeleton.text": ["Die ätherische Leere, an der das Portal-Protokoll geboren wurde — ein pulsierender Tor-Ring im Void.", "The ethereal void where the portal protocol was born — a pulsing gate ring in the void."],
            "welt.katalog.terrain.name": ["Phytogenesis & Lithos", "Phytogenesis & Lithos"],
            "welt.katalog.terrain.text": ["Das Morphologie-Labor: Bäume, Blumen und Felsen wachsen aus Gesetzen — mit begehbarem Wald, Tag/Nacht, Wetter und Jahreszeiten.", "The morphology lab: trees, flowers and rocks grow from laws — with a walkable forest, day/night, weather and seasons."],
            "welt.katalog.tetrapoda.name": ["Tetrapoda — Evolution Lab", "Tetrapoda — Evolution Lab"],
            "welt.katalog.tetrapoda.text": ["Das Kreaturen-Labor: Vierbeiner aus allometrischen Gesetzen — Gattungs-Dials, CPG-Gang und Bewegungsprofile als Daten-Quelle.", "The creature lab: quadrupeds from allometric laws — genus dials, CPG gait and motion profiles as a data source."],
            "welt.keine-kreatur": ["(Keine Kreatur in der Nähe.)", "(No creature nearby.)"],
            "welt.kern-fehlt-banner": ["⚠ KERN FEHLT (Gesetzbuch lädt nicht auf dem Main-Thread): {kerne} — jeder Gesetz-Leser bricht laut (KERN-PFLICHT), es gibt keine Ersatz-Welt", "⚠ CORE MISSING (law book does not load on the main thread): {kerne} — every law reader fails loudly (CORE DUTY), there is no stand-in world"],
            "welt.setzen-ausdauer": ["Setzen: zu wenig Ausdauer ({hat}/{kostet}) — kurz verschnaufen.", "Place: not enough stamina ({hat}/{kostet}) — catch your breath."],
            "welt.sonne-entzuendete": ["Die Sonne entzündete durch „{linse}\" „{ding}\".", "The sun, focused through “{linse}”, set “{ding}” alight."],
            "welt.sonne-entzuendete-weit": ["Die Sonne entzündete durch „{linse}\" „{ding}\" ({m} m von dir).", "The sun, focused through “{linse}”, set “{ding}” alight ({m} m from you)."],
            "welt.zu-weit": ["Zu weit: {was} reicht {reichweite} m — das Ziel steht {abstand} m vor deiner Schulter.", "Too far: {was} reaches {reichweite} m — the target is {abstand} m from your shoulder."],
            "werk.achse.balance": ["Balance", "Balance"],
            "werk.achse.brennbarkeit": ["Brennbarkeit", "Flammability"],
            "werk.achse.dichte": ["Dichte", "Density"],
            "werk.achse.haerte": ["Härte", "Hardness"],
            "werk.achse.hebelwucht": ["Hebelwucht", "Leverage"],
            "werk.achse.hohlraum": ["Hohlraum", "Hollowness"],
            "werk.achse.koerper-form": ["Körper-Form", "Body shape"],
            "werk.achse.lastpfad": ["Lastpfad", "Load path"],
            "werk.achse.lebendigkeit": ["Lebendigkeit", "Liveliness"],
            "werk.achse.magie-leitung": ["Magie-Leitung", "Magic conduction"],
            "werk.achse.resonanz": ["Resonanz", "Resonance"],
            "werk.achse.rollfaehigkeit": ["Rollfähigkeit", "Rollability"],
            "werk.achse.schaerfe": ["Schärfe", "Sharpness"],
            "werk.achse.standfestigkeit": ["Standfestigkeit", "Stability"],
            "werk.achse.standflaeche": ["Standfläche", "Footprint"],
            "werk.achse.steifigkeit": ["Steifigkeit", "Stiffness"],
            "werk.achse.streckung": ["Streckung", "Elongation"],
            "werk.achse.strom-leitung": ["Strom-Leitung", "Electrical conduction"],
            "werk.achse.symmetrie": ["Symmetrie", "Symmetry"],
            "werk.achse.tor-form": ["Tor-Form", "Gate shape"],
            "werk.achse.transparenz": ["Transparenz", "Transparency"],
            "werk.achse.waerme-leitung": ["Wärme-Leitung", "Heat conduction"],
            "werk.achse.zaehigkeit": ["Zähigkeit", "Toughness"],
            "werk.affordanz.balancing": ["gründend", "grounding"],
            "werk.affordanz.broadcasting": ["sendend", "broadcasting"],
            "werk.affordanz.focusing": ["bündelnd", "focusing"],
            "werk.affordanz.lifting": ["hebend", "lifting"],
            "werk.affordanz.magnifying": ["vergrößernd", "magnifying"],
            "werk.affordanz.moveable": ["fahrbar", "drivable"],
            "werk.affordanz.radiating": ["strahlend", "radiant"],
            "werk.affordanz.sitzbar": ["sitzbar", "seatable"],
            "werk.baum.eigene-werke": ["Eigene Werke", "Your works"],
            "werk.baum.ohne-gesetzbuch": ["Ohne Gesetzbuch", "Without a lawbook"],
            "werk.baum.tore": ["Tore in die Welten", "Gates to the worlds"],
            "werk.baum.ultiversum": ["Ultiversum", "Ultiverse"],
            "werk.baum.werkstatt": ["Werkstatt", "Workshop"],
            "werk.beitrag": ["{achse} {wert}", "{achse} {wert}"],
            "werk.beitrag.gerechnet": ["{achse} (gerechnet) {wert}", "{achse} (computed) {wert}"],
            "werk.beitrag.konvention": ["{achse} (Welt-Konvention) {wert}", "{achse} (world convention) {wert}"],
            "werk.domaene.alchemy": ["Alchemie", "Alchemy"],
            "werk.domaene.construction": ["Konstruktion", "Construction"],
            "werk.domaene.forging": ["Schmiede", "Forging"],
            "werk.domaene.mechanism": ["Mechanik", "Mechanics"],
            "werk.domaene.soulwork": ["Seelenkunst", "Soulcraft"],
            "werk.domaene.textile": ["Weberei", "Weaving"],
            "werk.faehigkeit.brecher": ["Brecher — wuchtet Fels/Hartes, schneidet kaum", "Breaker — smashes rock and hard things, barely cuts"],
            "werk.faehigkeit.geraet": ["Gerät — ausgewogen (schneiden + wuchten)", "Implement — balanced (cutting + smashing)"],
            "werk.faehigkeit.klinge": ["Klinge — schneidet Weiches (Holz/Pflanzen), schwach an Fels", "Blade — cuts soft things (wood/plants), weak on rock"],
            "werk.faehigkeit.schutz": ["Schutz (Rüstung) ~{wert}", "Protection (armor) ~{wert}"],
            "werk.faehigkeit.tor": ["Tor (Portal)", "Gate (portal)"],
            "werk.faehigkeit.wesen": ["Wesen (Seele/Avatar)", "Creature (soul/avatar)"],
            "werk.faehigkeit.wirkung": ["Wirkung (Trank/Nahrung)", "Effect (potion/food)"],
            "werk.fehlt-suffix": [" · ✗ fehlt {liste}", " · ✗ missing {liste}"],
            "werk.kosten-hast": ["{menge}: hast {hast} {zeichen}", "{menge}: have {hast} {zeichen}"],
            "werk.kosten-keine": ["{name} — Bau-Kosten: keine", "{name} — build cost: none"],
            "werk.kosten-titel": ["{name} — Bau-Kosten: {liste}", "{name} — build cost: {liste}"],
            "werk.leser.praegung": ["praegung", "imprint"],
            "werk.leser.streu": ["streu", "scatter"],
            "werk.leser.welt": ["welt", "world"],
            "werk.leser.werk": ["werk", "work"],
            "werk.leser.wesen": ["wesen", "creature"],
            "werk.op-klasse.additive": ["additive", "additive"],
            "werk.op-klasse.phase-change": ["phaseChange", "phase change"],
            "werk.op-klasse.plastic": ["plastic", "plastic"],
            "werk.op-klasse.subtractive": ["subtractive", "subtractive"],
            "werk.physik.knickt": ["zu schlank — ein tragendes Glied knickt unter der Last", "too slender — a load-bearing member buckles under the load"],
            "werk.rolle.architecture": ["Bauwerk", "Structure"],
            "werk.rolle.armor": ["Rüstung", "Armor"],
            "werk.rolle.brecher": ["Brecher", "Breaker"],
            "werk.rolle.held": ["Gerät", "Implement"],
            "werk.rolle.konsumable": ["Konsumable", "Consumable"],
            "werk.rolle.machine": ["Maschine", "Machine"],
            "werk.rolle.portal": ["Portal", "Portal"],
            "werk.rolle.soul": ["Seele", "Soul"],
            "werk.rolle.tool": ["Werkzeug", "Tool"],
            "werk.rolle.tor": ["Tor", "Gate"],
            "werk.rolle.trank": ["Trank", "Potion"],
            "werk.rolle.vehicle": ["Fahrzeug", "Vehicle"],
            "werk.rolle.weapon": ["Waffe", "Weapon"],
            "werk.rolle.workshop-station": ["Werkstatt", "Workshop"],
            "werk.ruft": ["{rolle} ruft: {tat}", "{rolle} calls: {tat}"],
            "werk.tat.balance": ["verlagere die Masse zum Griff (näher balanciert → schnellere Führung)", "shift the mass toward the grip (better balanced → quicker handling)"],
            "werk.tat.body-shape": ["forme einen Körper (symmetrisch · vertikal · Glieder)", "shape a body (symmetric · upright · limbs)"],
            "werk.tat.leverage": ["rücke die Kopfmasse nach vorn (längerer Hebel → mehr Wucht)", "move the head mass forward (longer lever → more impact)"],
            "werk.tat.living-body": ["nutze lebendiges Material am Körper", "use living material on the body"],
            "werk.tat.load-sound": ["schließe den Lastpfad zum Boden (kein schwebendes Teil)", "close the load path to the ground (no floating part)"],
            "werk.tat.portal-shape": ["forme einen Ring in Reisenden-Größe", "shape a ring a traveler can pass through"],
            "werk.tat.rideable": ["setze einen Sitz-Anker (Fahrzeug = Sitz + Antrieb)", "set a seat anchor (vehicle = seat + drive)"],
            "werk.tat.rollable": ["setze runde Räder an den Boden (rollt um eine freie Achse)", "put round wheels on the ground (rolls about a free axle)"],
            "werk.tat.stability": ["verbreitere die Basis (Schwerpunkt sicher über der Standfläche)", "widen the base (center of mass safely over the footprint)"],
            "werk.tat.stiffness": ["lege Material weg von der Biegeachse (Hohlrohr/I-Profil statt Vollstab)", "move material away from the bending axis (hollow tube/I-beam instead of a solid bar)"],
            "werk.tor.braucht-werkstatt": ["braucht ⚒ {werkstatt} in der Nähe (pfad-Modus)", "needs ⚒ {werkstatt} nearby (path mode)"],
            "werk.tor.fehlgeschlagen": ["fehlgeschlagen", "failed"],
            "werk.tor.fehlgeschlagen-grund": ["fehlgeschlagen: {grund}", "failed: {grund}"],
            "werk.tor.fehlt": ["fehlt {liste} — sammeln oder abbauen (Frieden und Pfad zahlen Material, frei ist nur Schöpfer)", "missing {liste} — gather or mine (Peace and Path pay material; only Creator is free)"],
            "werk.tor.hotbar-voll": ["die Hotbar ist voll — leere einen Platz, dann bauen", "the hotbar is full — clear a slot, then build"],
            "werk.tor.material": ["Material", "material"],
            "werk.verb.behauen": ["behauen", "hew"],
            "werk.verb.beseelen": ["beseelen", "ensoul"],
            "werk.verb.brauen": ["brauen", "brew"],
            "werk.verb.drehen": ["drehen", "turn"],
            "werk.verb.schmieden": ["schmieden", "forge"],
            "werk.verb.weben": ["weben", "weave"],
            "werk.wachstum.default": ["Default: Bauwerk. Wende ein Werkzeug an, forme einen symmetrischen Körper, oder nutze lebendige Substanz — die Rolle emergiert.", "Default: structure. Apply a tool, shape a symmetric body, or use living substance — the role emerges."],
            "werk.wachstum.manuell": ["Manuell gesetzt. Emergent wäre „{rolle}\" aus Domain „{domaene}\".", "Set by hand. Emergent would be “{rolle}” from domain “{domaene}”."],
            "werk.wachstum.naechste": ["Rolle aus „{domaene}\" (Mehrheit). Eine weitere „{naechste}\"-Anwendung könnte das verschieben.", "Role from “{domaene}” (majority). One more “{naechste}” application could shift it."],
            "werk.wachstum.stabil": ["Rolle aus „{domaene}\" (Mehrheit, stabil). Weitere Anwendungen vertiefen.", "Role from “{domaene}” (majority, stable). Further applications deepen it."],
            "werk.wachstum.substanz": ["Rolle „{rolle}\" emergiert direkt aus der Substanz (Form/Material).", "Role “{rolle}” emerges directly from the substance (shape/material)."],
            "werk.weg.achse": ["+{n} {achse} → {rolle}", "+{n} {achse} → {rolle}"],
            "werk.weg.tat": ["{tat} → {rolle}", "{tat} → {rolle}"],
            "werk.werkzeug.drehbank-meissel": ["Drehbank-Meißel", "Lathe chisel"],
            "werk.werkzeug.haende": ["Hände", "Hands"],
            "werk.werkzeug.moerser": ["Mörser & Stößel", "Mortar & pestle"],
            "werk.werkzeug.ritueller-stab": ["Ritueller Stab", "Ritual staff"],
            "werk.werkzeug.schmiede-hammer": ["Schmiede-Hammer", "Forge hammer"],
            "werk.werkzeug.webstuhl-schiffchen": ["Webstuhl-Schiffchen", "Loom shuttle"],
            "werk.wert.bewegung": ["Bewegung", "Movement"],
            "werk.wert.hitze-resist": ["Hitze-Resist", "Heat resist"],
            "werk.wert.hp": ["HP", "HP"],
            "werk.wert.magie-resist": ["Magie-Resist", "Magic resist"],
            "werk.wert.rueckschlag": ["Rückschlag", "Knockback"],
            "werk.wert.schaden": ["Schaden", "Damage"],
            "werk.wert.tempo": ["Tempo", "Speed"],
            "werk.wert.verteidigung": ["Verteidigung", "Defense"],
            "wesen.baer": ["Bär", "Bear"],
            "wesen.fuchs": ["Fuchs", "Fox"],
            "wesen.hirsch": ["Hirsch", "Deer"],
            "wesen.koerper": ["{name} (Körper)", "{name} (body)"],
            "wesen.mensch": ["Mensch", "Human"],
            "wesen.teil.arm-links": ["Arm links", "Left arm"],
            "wesen.teil.arm-rechts": ["Arm rechts", "Right arm"],
            "wesen.teil.bein-links": ["Bein links", "Left leg"],
            "wesen.teil.bein-rechts": ["Bein rechts", "Right leg"],
            "wesen.teil.kopf": ["Kopf", "Head"],
            "wesen.teil.torso": ["Torso", "Torso"],
            "wesen.wolf": ["Wolf", "Wolf"],
        };
        // SPRACH-ZEILEN ZU
        const tafel = Object.fromEntries(S.map((sp) => [sp, {}]));
        for (const k in Z) {
            if (!Array.isArray(Z[k]) || Z[k].length !== S.length || !Z[k].every((t) => typeof t === "string"))
                throw new Error(`SPRACHE: die Zeile „${k}“ trägt nicht jede Sprache`);
            S.forEach((sp, i) => (tafel[sp][k] = Z[k][i]));
        }
        return this._einmal("TEXTE", Object.freeze(Object.fromEntries(S.map((sp) => [sp, Object.freeze(tafel[sp])]))));
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
