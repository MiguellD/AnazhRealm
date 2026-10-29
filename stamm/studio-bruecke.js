class AnazhRealm_studio_bruecke {
    // ===== ATLAS · Studio/bruecke — Foundry-Brücke · Bücher · Aufträge · Uhren · Vorrat =====
    // ==================== ASSET-FOUNDRY: die Vorlage pflanzt ihre echten Bäume ====================
    // Der Studio-Generator (die Kerne + die Foundry-Brücke foundry-bruecke.js, K42) läuft als Worker und liefert
    // seine echten Baum-Instanzen (buildInstance, eigenes LOD) als Geometrie-Puffer; AnazhRealm baut daraus
    // Meshes — kein Nachbau. Ein Edit am Kern oder an der Brücke ändert die Bäume hier, ein Edit am Labor nie.
    _foundryEnabled() {
        // Studio-Asset AUSLESEN + PLATZIEREN, nie nachbauen. Der Geometrie-Motor läuft als WORKER (die Brücke
        // startet ohne Renderer → kein zweiter GPU-Kontext), auch headless — die EINE aktive Quelle.
        // Kein Grammatik-Render-Fallback: ein noch nicht gebackenes Asset heißt kurz KEIN Mesh. Richter
        // (`_growTreeBlueprintRich`) + Understory-Grammatik (`_growTreeBlueprintForSpawn`) bleiben.
        // Nur ohne Worker (exotische Einbettung) → Alt-Pfad.
        if (typeof Worker === "undefined") return false;
        // TEST-HOOK: Gate-Bänder, die die Grammatik-MECHANIK isoliert prüfen (Richter, LOD-Bauplan, Scatter-
        // Promotion, Understory), schalten die Foundry aus; die Foundry als Quelle beweisen
        // fluss/deadlock/parity/contract.
        if (typeof window !== "undefined" && window.__anazhGateNoFoundry) return false;
        return true;
    }
    // `vorWelt` (B3a): die Geburt mit der Seite (`init`, vor dem Laden der Welt) — das Buch wartet, bis der Wirt steht
    // (`_foundryWirtSteht`); jede spätere Geburt findet ihn stehend.
    _ensureAssetFoundry(vorWelt) {
        if (!this._foundryEnabled()) return null;
        if (this._foundry) return this._foundry;
        const f = {
            wirt: !vorWelt, // der Wirt steht: das Buch darf in die Welt (Baupläne, Hotbar, Leib — nach dem Spielstand)
            buch: null, // das Buch, das vor dem Wirt kam
            blattAtlas: false, // die Fracht des EINEN Blatt-Atlas ist da (`_foundryBlattAtlas`)
            nachAtlas: [], // Laub-Körper, die auf ihn warten (`_foundryAntwort`)
            worker: null, // P3a: der Studio-Generator als Web-Worker (Geometrie/Daten, kein DOM)
            bootUrl: null,
            ready: false,
            platte: false, // die Transport-Schale führt die Platte (gesetzt beim Worker-Boot)
            pending: new Map(),
            reqSeq: 1,
            cache: new Map(),
            retry: [],
            _vorrat: false, // die Phase des Vorrats (`VORRAT_PHASE`); false = steht nicht an oder ist durch (warm)
            recipes: null,
            // DAS BUCH IST EIN EREIGNIS (K22, Nachbesserung 4): wer auf das Studio-Buch wartet (der Vorrat, der Dorf-Spawn,
            // die Portal-Vorschau, die Werkstatt-Vorschau, die Hand), wartet auf `buchDa` — `_foundryIngestBook` erfüllt es. Bis hierher wartete der Vorrat
            // 2 s auf die Uhr und wärmte danach ohne Rezepte (FOUNDRY WARM: fünf kritische Presets fehlen im Buch).
            buchDa: null,
            buchKam: null,
            // V4(B) — die Leck-Linse: gebaute vs. deferred-freigegebene Foundry-Geometrien (die
            // Schnitte heben sie ohnehin lazy via `|| 0`; hier explizit für die Auffindbarkeit).
            _geomBuiltCount: 0,
            _geomDisposedCount: 0,
        };
        f.buchDa = new Promise((r) => (f.buchKam = r));
        this._foundry = f;
        try {
            // Studio-Generator als WORKER (self.__PHYTO_FOUNDRY_WORKER=true; die Brücke startet ohne Renderer). DER FADEN
            // KOMMT MIT DER SEITE (B3a): er liest das Kern-Manifest selbst (`_foundryStart`) — bis B3a holte es der Haupt-Faden
            // vor der Geburt, und die Antwort wartete, bis der volle Haupt-Faden sie las (Radeon kalt geboren bei 2,17 s statt
            // mit init bei 1,04 s). Die Platte: aus unter dem Null-Renderer (gate-deterministisch) und ohne IndexedDB/WebCrypto;
            // die Wahl des Renderers fällt vor ihm (`_nullRendererGewaehlt`).
            f.platte =
                typeof indexedDB !== "undefined" &&
                typeof crypto !== "undefined" &&
                !!crypto.subtle &&
                !this._nullRendererGewaehlt();
            // DER WIRT DER KARTE (pipeline.K4 Stufe 2): die Karte zeichnet der Welt-Renderer — ihr Gesetz neben dem ihrer Art
            // sind der Stamm und die Engine (r184 aus der Import-Karte); die Schale stempelt jede Karte der Platte mit ihnen
            const karte = typeof document !== "undefined" && document.querySelector('script[type="importmap"]');
            const start = {
                v: "?v=" + AnazhRealm.VERSION,
                base: typeof window !== "undefined" && window.location ? window.location.href : "",
                lesen: AnazhRealm.FOUNDRY_LESEN,
                format: AnazhRealm.FOUNDRY_PLATTE_FORMAT,
                platte: f.platte,
                wirt: karte
                    ? [...document.querySelectorAll("script[src]")]
                          .map((s) => s.src)
                          .filter((u) => /\/stamm\//.test(u))
                          .concat(
                              Object.values(JSON.parse(karte.textContent).imports || {}).map(
                                  (u) => new URL(u, location.href).href
                              )
                          )
                    : [],
            };
            const boot =
                "(function " +
                AnazhRealm._foundryStart.toString() +
                ")(" +
                JSON.stringify(start) +
                ",function " +
                AnazhRealm._foundrySchale.toString() +
                ");"; // die Brücke startet sich selbst (Foundry-Modus, Kanal-Hörer, ready)
            f.bootUrl = URL.createObjectURL(new Blob([boot], { type: "text/javascript" }));
            // DER FADEN WARTET NIE AUF DEN HAUPT-FADEN (K60-2, B3a): die Buch-Frage reist IN der Geburt — der Faden
            // heißt „buch" und antwortet, sobald sein Studio steht (die Brücke, Worker-Start). Eine Nachricht vor dem
            // Ende seines Start-Skripts reicht Chrome erst weiter, wenn der Haupt-Faden die Meldung „Skript gelaufen"
            // liest: bis B3a ruhte der Buch-Faden so 0,73–1,26 s (Radeon kalt). die Helfer kommen mit ihm
            // (`_foundryHelfer`).
            const worker = new Worker(f.bootUrl, { name: "buch" });
            f.worker = worker;
            this._foundryHelfer(f);
            // Ein Boot-/Laufzeit-Fehler des Studio-Fadens bricht LAUT (K22): ohne Faden kein Studio-Mesh, und es
            // gibt keinen Alt-Pfad (`_foundryEnabled`: ein nicht gebackenes Asset heißt KEIN Mesh)
            worker.onerror = (ev) =>
                this._stoffBruch("der Foundry-Faden fällt — " + ((ev && ev.message) || "Boot-/Laufzeit-Fehler"));
            worker.onmessage = (ev) => {
                const m = ev.data;
                if (!m || typeof m !== "object") return;
                if (m.type === "ready" && m.world === "terrain") {
                    f.ready = true; // der Stand-Stempel liest die Antwort selbst (`_standStempel`)
                    // EIN Umschlag: das komplette Studio-Buch (Rezepte + B4-Tabellen + Welt-Palette + Wahrnehmung)
                    // ist mit der Geburt gefragt, DANN die Assets vorwärmen. Der Vorrat wartet ohne Frist auf das
                    // Buch (`f.buchDa`): fällt die Anfrage, bricht sie LAUT beim Namen (K22).
                    this._foundryPrefetchLibrary();
                    // DIE EINE PIPE: die Gattungs-Templates off-thread vorwärmen —
                    // Welt-Spawns treffen dann nur noch das Memo (Clone, kein Freeze). Er wartet auf das erste
                    // Bild (K60) wie der Vorrat der Bibliothek; ein Bruch seines Gusses meldet sich laut.
                    this._ofenPrefetchKreaturen().catch((e) => this._stoffBruch("der Ofen-Vorrat", e));
                } else if (m.type === "book") {
                    // das Buch geht in die Welt, sobald der Wirt steht (nach dem Spielstand, `_foundryWirtSteht`)
                    if (f.wirt) this._foundryIngestBook(m);
                    else f.buch = m;
                } else if (m.type === "blatt-atlas") this._foundryBlattAtlas(f, m);
                else this._foundryAntwort(f, m);
                this._foundryPumpe(f); // ein Platz im Worker wurde frei → der nächste Wartende (nah zuerst)
            };
        } catch (_e) {
            this._stoffBruch("die Foundry bootet nicht", _e);
        }
        return f;
    }
    // Die Antwort eines Studio-Fadens löst ihren Auftrag ein: Körper (asset), Siedlung (settlement), Slot (slot), die Frage
    // der Karte an die Platte (karte; sie backt seit S2 im Welt-Renderer, `_karteWeltBacken`) — EINE pending-Map, die reqIds
    // sind disjunkt.
    _foundryAntwort(f, m) {
        if (m.type === "asset") {
            // Das Budget-Gesetz am Studio-Ausgang (W8) meldet einen Bruch LAUT — nie still.
            if (Array.isArray(m.budgetBruch) && m.budgetBruch.length)
                this.log("BUDGET-BRUCH " + m.presetId + " L" + m.lod + ": " + JSON.stringify(m.budgetBruch), "ERROR");
            this._foundryLiefer(f, m.bau ? "werk" : m.platte ? "platte" : "leer", "koerper", m.liefer);
            const p = f.pending.get(m.reqId);
            if (p) {
                f.pending.delete(m.reqId);
                const meshes = m.meshes || [];
                // EIN AUFTRAG WARTET NUR AUF DAS, WAS ER BRAUCHT (B3a): ein Körper mit Laub-Karte oder Wurf liest den EINEN
                // Blatt-Atlas (`_foundryTreeMaterial` → `_blattAtlasProbe`); kam er vor dessen Fracht, geht er mit ihr in
                // die Welt (`_foundryBlattAtlas`) — nie malt der Haupt-Faden den Atlas selbst. Sein Platz im Faden ist frei.
                if (!f.blattAtlas && meshes.some((x) => x && (x.kind === "foliageTex" || x.kind === "schatten")))
                    f.nachAtlas.push(() => p(meshes));
                else p(meshes);
            }
        } else if (m.type === "settlement" || m.type === "slot" || m.type === "karte") {
            // N5.7 (W-A5b) — der Settlement-Kanal: die Slot-DATEN einer Siedlung (fachwerk exportSettlement, generisch
            // über die Zweit-Kern-Schleife der Brücke, der Dorf-Export der Platte); der Slot-Plan-Kanal (bauen.K2): das
            // gesetzte Haus als Slot; die Karte: die ganze Antwort (ihre Bytes oder null, die Liefer-Marke)
            if (m.type === "settlement")
                this._foundryLiefer(f, m.platte ? "platte" : m.bau ? "werk" : "leer", "dorf-export", m.liefer);
            const ps = f.pending.get(m.reqId);
            if (ps) {
                f.pending.delete(m.reqId);
                ps(m.type === "karte" ? m : (m.type === "slot" ? m.slot : m.plan) || null);
            }
        }
        // die Antwort ist das Ereignis der Fristen: die Uhr des nächsten ihres Fadens läuft an (`_foundryUhren`)
        this._foundryUhren(f);
    }
    // DIE LIEFER-MARKE (pipeline.K4) am EINEN Weg jeder Lieferung: der Auftrag eines Körpers (`_foundryAuftrag`), wie seine
    // Antwort kam (`_foundryAntwort`: von der Platte · im Werk gebaut — die Schale stempelt `bau` an jeden Studio-Lauf · leer),
    // der Guss des Haupt-Fadens (`_ofenBudget`) — die Körper oben (Stufe 1); je Art (`je`: koerper · blatt-atlas · dorf-export ·
    // karte, die Karte backt im Haupt-Faden) dieselben Wege und die ms ihres Erzeugers im Haupt-Faden, je Lieferung mit
    // Platten-Schlüssel ihr Rest, ihr Weg und die Kerne, die sie liest (`liste`, die Schale nennt sie: Stufe 2). Der Leser:
    // diag-boot-stage --kalt (die Liefer-Zeilen).
    _foundryLiefer(f, wie, art, liefer, ms) {
        const L =
            f &&
            (f.lieferung || (f.lieferung = { auftrag: 0, platte: 0, werk: 0, leer: 0, haupt: 0, je: {}, liste: [] }));
        if (!L) return;
        if (!art || art === "koerper") L[wie]++;
        const J = art && (L.je[art] || (L.je[art] = { platte: 0, werk: 0, haupt: 0, leer: 0, ms: 0 }));
        if (J && wie) J[wie]++;
        if (J) J.ms += ms || 0;
        if (liefer) L.liste.push([art, liefer.rest, wie, liefer.kerne.join(",")]);
    }
    // DER EINE BLATT-ATLAS (S7, B3a): seine Fracht kommt NACH dem Buch — der Buch-Faden malt, mippt und kodiert ihn, während
    // die Welt schon bestellt (bis B3a war er die Vorbedingung des ganzen Buchs: Radeon kalt 1,81 s Malen + 0,98 s Fracht vor
    // jedem Auftrag); per Transfer, `_ensureFoliageClusterAtlas` lädt ihn, ohne im Haupt-Faden zu malen. Die Laub-Körper, die
    // vor ihm kamen, gehen jetzt in die Welt.
    _foundryBlattAtlas(f, m) {
        const a = m.blattAtlas;
        if (f.blattAtlas) return; // ein zweites Bild trägt nichts Neues
        this._foundryLiefer(f, m.platte ? "platte" : "werk", "blatt-atlas", m.liefer);
        if (!a || !a.rgba || !Array.isArray(a.rgba.mips) || !a.rgba.mips.length)
            throw this._stoffBruch("der Blatt-Atlas kam ohne Bild (blatt-atlas)");
        this._blattAtlasBild = a;
        f.blattAtlas = true;
        for (const los of f.nachAtlas.splice(0)) los();
    }
    // DER WIRT STEHT (B3a): der Faden kommt mit der Seite (`init`), das Buch geht erst nach dem Spielstand in die Welt — seine
    // Baupläne, die Hotbar und der Leib lesen den geladenen Stand, wie zuvor, als der Wirt es erst hier erfragte.
    _foundryWirtSteht() {
        const f = this._foundry;
        if (!f || f.wirt) return;
        f.wirt = true;
        const m = f.buch;
        f.buch = null;
        if (m) this._foundryIngestBook(m);
    }
    // Wie viele Werk-Fäden: einer je vier Kerne, höchstens FOUNDRY_WERK_FAEDEN — die Kerne
    // allein entscheiden, nie der Renderer.
    _foundryFaedenZahl() {
        const kerne =
            typeof navigator !== "undefined" && Number.isFinite(navigator.hardwareConcurrency)
                ? navigator.hardwareConcurrency
                : 4;
        return Math.max(1, Math.min(AnazhRealm.FOUNDRY_WERK_FAEDEN, Math.floor(kerne / 4)));
    }
    // DIE WERK-FÄDEN (K60): das Werk baut jeden Körper in EINEM Faden — Radeon kalt bis zum ersten Bild hielt er 19 s Arbeit
    // (Bäume, Bauten, das Dorf), während 20 der 24 Kerne der Maschine ruhten. Jetzt bauen neben ihm Helfer aus DEMSELBEN
    // Boot-Blob (dieselbe Schale, dieselbe Platte, dasselbe Studio); die EINE Schlange
    // speist sie (`_foundryPumpe`). Ihre Zahl folgt der Maschine: ein Werk-Faden je vier Kerne, höchstens
    // FOUNDRY_WERK_FAEDEN (das Werk zählt mit). Die Kerne allein entscheiden, nie der Renderer: bis zur Prüfung K60-1 baute
    // unter dem Null-Renderer das Werk allein — kein Tor fuhr die Mehrbahn-Pumpe (gate:fluss W6 gibt der Seite 16 Kerne).
    _foundryHelfer(f) {
        if (f.helfer || !f.bootUrl) return;
        f.helfer = [];
        const n = this._foundryFaedenZahl();
        for (let k = 1; k < n; k++) {
            const w = new Worker(f.bootUrl, { name: "werk" });
            const h = { k, w, bereit: false };
            // ein Boot-/Laufzeit-Fehler eines Helfers bricht LAUT (K22) wie der des Werks
            w.onerror = (ev) =>
                this._stoffBruch(`der Werk-Faden ${k} fällt — ` + ((ev && ev.message) || "Boot-/Laufzeit-Fehler"));
            w.onmessage = (ev) => {
                const m = ev.data;
                if (!m || typeof m !== "object") return;
                if (m.type === "ready" && m.world === "terrain") h.bereit = true;
                else this._foundryAntwort(f, m);
                this._foundryPumpe(f);
            };
            f.helfer.push(h);
        }
    }
    // DER EINE INGEST-CHOKEPOINT für das Studio-Buch (Kanal "get-book" → Reply "book"): das Rezeptbuch
    // (PRESETS: Regler s + fx) wird die EINE Quelle, der Blueprint liest daraus statt Hardcodes. Feste
    // Reihenfolge: Rezepte→Blueprint/AutoRegister · Welt-Palette→Farben · Wahrnehmung→LOD/Fog/Placement.
    // must-ignore: fehlt ein Teilfeld, bleibt dieser Teil byte-alt.
    _foundryIngestBook(m) {
        if (!m || typeof m !== "object") return;
        this._foundryIngestRecipes(m.book, m.paramsByKind, m.kindPolicy);
        this._foundryIngestWorldParams(m.worldParams);
        this._foundryIngestRenderConfig(m.renderConfig);
        this._foundryIngestSiedlung(m.siedlung);
        // der Kopf der Ankunfts-Kette zuerst (`_buchKoepfe`: der Leib) — vor jedem Baum; das Start-Dorf wartet auf `buchDa`
        this._buchKoepfe();
        // (Die Fracht des EINEN Blatt-Atlas reist nach dem Buch, `_foundryBlattAtlas`.)
        // das Ereignis für jeden, der auf das Buch wartet (`buchDa`); ein Buch ohne Rezepte bricht laut, die Wartenden
        // sehen es (der Vorrat: FOUNDRY WARM je kritischem Preset, der Dorf-Spawn: FOUNDRY KALT)
        if (!m.book || typeof m.book !== "object") this._stoffBruch("das Studio-Buch kam ohne Rezepte (get-book)");
        if (this._foundry && this._foundry.buchKam) this._foundry.buchKam();
        // Der Katalog steht: die Hotbar urteilt über ihre Namen und legt, wenn sie leer ist, den Start-Gurt.
        this._hotbarNachBuch();
        // die Häuser, die vor dem Buch gesetzt wurden (der Reload mit kaltem Buch), legen ihren Grund, jetzt ist ihr Plan lesbar
        for (const e of this.state.architectures || []) this._hausGrundSetzen(e);
        // (Die Stamm-Hüllen brauchen das Buch nicht mehr: die Welt-Skala liest vor ihm DIESELBE Tafel aus dem Kern —
        // `_baumHuellenNachBuch` fiel mit dem Hand-Spiegel, Leben-Schau 2.)
    }

    // DER START-GURT (Leben-Schau 07.10., L7): je Studio-Art EIN platzierbares Werk, in der Reihenfolge des Katalogs
    // (`_katalogSichtbar` — dieselbe Sicht wie Werkstatt und Rezeptbuch; die Art ist der kind des Studio-Rezepts). Heute:
    // Eiche · GT · Drachentor · ein Fachwerkhaus. Vorher Felsblock · Wasserfall · Damm (Alt-Baupläne, der Felsblock ein
    // Alt-Doppel, im Katalog versteckt). Null bei kaltem Buch.
    _startGurt() {
        const f = this._foundry;
        if (!f || !f.recipes) return null;
        const bps = this.state.blueprints || {};
        const arten = new Set();
        const gurt = [];
        for (const name of Object.keys(bps)) {
            if (!this._katalogSichtbar(name, bps[name]) || !this._isPlaceableBlueprint(bps[name])) continue;
            const preset = this._foundryPresetFor(name);
            const rec = preset ? f.recipes[preset] : null;
            if (!rec || typeof rec.kind !== "string" || arten.has(rec.kind)) continue;
            arten.add(rec.kind);
            gurt.push(name);
        }
        return gurt;
    }

    // Nach der Buch-Ankunft: ein Name ohne Bauplan fällt aus der Hotbar (laut), und eine ganz leere Hotbar bekommt den
    // Start-Gurt — ein neuer Spieler wie einer, dessen Gurt leer gespeichert wurde.
    _hotbarNachBuch() {
        const hb = this.state.hotbar;
        if (!Array.isArray(hb)) return;
        for (let i = 0; i < hb.length; i++) {
            if (hb[i] && !this.state.blueprints[hb[i]]) {
                this.log(`Hotbar-Slot ${i + 1}: „${hb[i]}" hat keinen Bauplan im Buch — der Platz wird frei.`, "WARN");
                hb[i] = null;
            }
        }
        // ein Studio-Name, der vor dem Buch ohne Bauplan stand, bekommt sein Phantom-Vorbacken zurück
        if (this._prebakedBlueprints) for (const n of hb) if (n) this._prebakedBlueprints.delete(n);
        if (hb.some(Boolean)) return this._renderHotbarDOM();
        const gurt = this._startGurt() || [];
        for (let i = 0; i < gurt.length && i < hb.length; i++) hb[i] = gurt[i];
        this._renderHotbarDOM();
    }
    // Siedlungs-Gesetz aus dem Buch (fachwerk-core SIEDLUNG, Feld `siedlung`): wo und wie viele Dörfer.
    // Ganz oder gar nicht: EIN nicht-finites Feld → kein Gesetz (`_siedlungGesetz` → null, kein Dorf — nie ein Ersatz).
    // Jeder Siedlungs-Urteils-Pfad läuft erst nach Buch-Ankunft (`_autoSettlementChannelLive`/Export) — Rezepte und
    // Gesetz kommen im selben Buch (`_foundryIngestBook`).
    _foundryIngestSiedlung(s) {
        if (
            s &&
            typeof s === "object" &&
            Number.isFinite(s.cellM) &&
            Number.isFinite(s.rarity) &&
            Number.isFinite(s.nHMin) &&
            Number.isFinite(s.nHSpan) &&
            // DAS RANG-GESETZ (siedlung.K2): je Stufe ein Raster und die kleinste Größe, die Reichweite eines Orts
            Array.isArray(s.rang) &&
            s.rang.every((r) => r && r.zellen >= 1 && Number.isInteger(r.zellen) && r.nH >= 1) &&
            s.reichM &&
            Number.isFinite(s.reichM.kern) &&
            Number.isFinite(s.reichM.jeWurzel)
        ) {
            AnazhRealm._siedlungGesetzMemo = s;
        }
    }
    _foundryIngestRecipes(book, paramsByKind, kindPolicy) {
        const f = this._foundry;
        if (!f || !book || typeof book !== "object") return;
        f.recipes = book;
        // B4-Regler-Tabellen der Kerne je kind (id/lab/min/max/step/def/law/grp): die Werkstatt rendert ihre
        // Slider daraus. must-ignore: Alt-Brücke ohne Feld → {} (keine Studio-Regler).
        f.paramsByKind = paramsByKind && typeof paramsByKind === "object" ? paramsByKind : {};
        // Der Blueprint WIRD das Rezeptbuch: je Studio-Preset ein Rezept-Eintrag im foundry-State,
        // den der Generierungs-Pfad (_foundryRequest -> Studio buildInstance) + die kuenftige
        // in-process-Ableitung lesen. Kein Abbild in Code — die Daten leben im State, vom Studio gespeist.
        let n = 0;
        for (const id in book) {
            if (Object.prototype.hasOwnProperty.call(book, id)) n++;
        }
        f.recipeCount = n;
        // AUTO-BLUEPRINT: jedes kind:"tree"-Preset ohne AnazhRealm-Spezies registriert sich als
        // `baum_<preset>` — Identität (Name·Tags·_grownSpecies) geklont von baum_eiche (der Physik-Richter
        // urteilt sie als Baum), der RENDER kommt ganz aus dem Studio (`_foundryPresetFor`, alle drei LODs,
        // Werkstatt-Regler aus dem Rezept). Der Wald streut sie über `_forestExtraSpecies`. Idempotent. Davor die Wirts-Zeilen
        // der Arten, die ihr Buch mitbringt (B7, `_kindPolicyVereinen`): eine neue Art braucht keine Zeile im Wirt.
        AnazhRealm._kindPolicyVereinen(kindPolicy, (text, stufe) => this.log(text, stufe));
        this._foundryAutoRegisterSpecies(book);
        // Avatar zieht nach: baute der Boot den Rig-Avatar vor der Buch-Ankunft, trägt er die Konstanten-
        // Gestalt (`_koerperDials === null`). Jetzt EINMAL über den Seelen-Chokepoint applyPlayerSoul neu
        // gießen (Position/Physik/Held reisen mit; der Stempel wird non-null → idempotent).
        try {
            const pmU = this.state.playerMesh && this.state.playerMesh.userData;
            if (pmU && pmU._koerperDials === null && this._koerperStudioDials()) {
                this.applyPlayerSoul(this.state.player.soul || "human");
            }
        } catch (_e) {
            this._stoffBruch("der Avatar (Körper-Studio-Gestalt)", _e);
        }
    }
    _foundryAutoRegisterSpecies(book) {
        const bps = this.state && this.state.blueprints;
        if (!bps || !book) return 0;
        // DER EINE Register-Chokepoint läuft die KIND_POLICY-Tabelle (Tabelle vor if): eine neue Domäne ist
        // eine Policy-Zeile + Donor (oder die Substanz ihrer Buch-Zeile, B7), kein Zweig. Fail-closed je kind (kein Donor →
        // Klasse übersprungen).
        // `grown` trägt die Pflanzen-Identität (`_grownSpecies` = der load-bearing Name, clone.name bleibt
        // Donor), sonst clone.name; `builtIn` nur wenn die Policy es definiert. Unbekannter kind: must-ignore.
        const KP = AnazhRealm.KIND_POLICY;
        let registered = 0;
        for (const id in book) {
            if (!Object.prototype.hasOwnProperty.call(book, id)) continue;
            const rec = book[id];
            const pol = rec && KP[rec.kind];
            if (!pol) continue;
            // N4.4 — eine RENDER-ONLY-Policy-Zeile (nur `impostor`, kein prefix/donor — heute
            // shrub) registriert KEINEN Blueprint: fail-closed ueberspringen, BEVOR ein
            // undefined-Praefix einen Namen formen koennte.
            if (!pol.prefix || !(pol.donor || pol.substanz)) continue;
            const name = pol.prefix + id;
            if (bps[name]) {
                // Heilung persistierter Alt-Klone: ein früher registrierter Auto-Blueprint erbte donorOnly über den
                // JSON-Klon (picker-unsichtbar) — beim Ingest entfernen (die eine Klon-Sichtbarkeits-Regel).
                if (bps[name]._foundryAutoSpecies && bps[name].donorOnly) delete bps[name].donorOnly;
                // Heilung persistierter Alt-Blueprints: trägt ein Auto-Blueprint seine Rezept-Identität nur im Namen,
                // verliert ein Klon/Umbenennen sie → `studioGestalt` nachstempeln (dieselbe Daten-Zeile wie unten).
                if (bps[name]._foundryAutoSpecies && typeof bps[name].studioGestalt !== "string") {
                    bps[name].studioGestalt = id;
                }
                // Heilung persistierter Alt-Klone: die role-Zeile der Policy (gate → "portal") nachstempeln, damit
                // ein altes tor_* zum Welt-Tor wird (Affordances stehender Einträge ziehen Spawn/setBlueprintAsPortal
                // nach).
                if (bps[name]._foundryAutoSpecies && pol.role && !bps[name].role) {
                    bps[name].role = pol.role;
                    bps[name].roleManual = true;
                }
                continue; // existiert (historische Arten + schon registrierte)
            }
            // Donor-Auflösung: ein LEBENDER Blueprint (tree → baum_eiche) ODER die eingefrorene Substanz-Zeile
            // (KIND_SUBSTANCE); donorTool (Policy-Daten): ein fx.tool-Rezept zieht die Werkzeug-Substanz.
            const dKey = pol.donorTool && rec.fx && rec.fx.tool ? pol.donorTool : pol.donor;
            const donor =
                pol.substanz || bps[dKey] || (AnazhRealm.KIND_SUBSTANCE && AnazhRealm.KIND_SUBSTANCE[dKey]) || null;
            if (!donor || !Array.isArray(donor.parts)) continue; // fail-closed je kind (Blueprint UND Tabelle leer)
            const clone = JSON.parse(JSON.stringify(donor));
            // DIE EINE Klon-Sichtbarkeits-Regel (wie cloneBlueprint, gate:trias B10): ein Klon ist SICHTBAR —
            // `donorOnly` reist NIE mit (sonst fällt jeder Auto-Blueprint still aus allen Pickern).
            delete clone.donorOnly;
            clone.label = rec.lab || rec.label || id.charAt(0).toUpperCase() + id.slice(1);
            if (pol.grown) clone._grownSpecies = name;
            else clone.name = name;
            if (pol.builtIn !== undefined) clone.builtIn = pol.builtIn;
            clone._foundryAutoSpecies = id; // die Herkunfts-Marke (Diag/Provenienz)
            // Rezept-Identität als DATEN-Feld, nicht nur im Namen: `studioGestalt` liest der EINE Resolver
            // (`_foundryPresetForEntry`), `cloneBlueprint` erbt es → jeder Klon/Umbenennung behält die Gestalt.
            clone.studioGestalt = id;
            // V18.464 — die role-DATEN-Zeile der Policy stempeln (gate → "portal"):
            // jedes registrierte Studio-Tor ist ab Geburt ein Welt-Tor.
            if (pol.role) {
                clone.role = pol.role;
                clone.roleManual = true;
            }
            bps[name] = clone;
            registered++;
        }
        if (registered > 0) {
            // Neue Arten in FRISCHE Zellen: den Dart-Memo (vor Rezept-Ankunft gecacht) einmal leeren — gepflanzte
            // Chunks bleiben (kein Churn). Deterministisch je (Seed, Rezept-Satz).
            this._forestDartMemo = null;
            this._forestExtraCache = null; // die Auto-Arten-Liste neu ableiten (gleiche Buch-Identität möglich)
            this.log(`Nervensystem: ${registered} neue Studio-Art(en) automatisch registriert.`, "INFO");
        }
        return registered;
    }
    // DIE WIRTS-ZEILE EINER ART REIST IM BUCH (Studio-Vertrag B7, studios.K5): der Wirt kennt eine Art nicht beim Namen —
    // ihr Gesetzbuch bringt die Zeile (`KIND_POLICY` des Kerns, die Brücke reicht sie mit der Kern-id als `kindPolicy`), der
    // EINE Ingest vereint sie mit den Wirts-Zeilen zu `AnazhRealm.KIND_POLICY`, und jeder Leser (Register, Werkstatt,
    // Wort-Katalog, Präfix-Auflösung) liest dieselbe Tafel. Disjunkt: eine Art mit Wirts-Zeile behält sie (die Verben des
    // Wirts, synchron vor dem Buch — Lockstep), die Buch-Zeile fällt laut. Fail-closed je Zeile (G4.2, laut): Art-Name,
    // Präfix `[a-z][a-z0-9]*_` (frei, nicht schon vergeben) und die Substanz (label, parts mit shape · material · position
    // · size) — eine kaputte Zeile registriert nichts, nie halb. Nur prefix und substanz reisen, jedes andere Feld ist
    // must-ignore. Rückgabe: die Zahl der vereinten Zeilen.
    static _kindPolicyVereinen(buch, log) {
        if (!buch || typeof buch !== "object") return 0;
        const KP = AnazhRealm.KIND_POLICY;
        const vergeben = new Set(Object.values(KP).map((z) => !z.kern && z.prefix));
        const v3 = (v, pos) => !!v && ["x", "y", "z"].every((a) => Number.isFinite(v[a]) && (!pos || v[a] > 0));
        const teil = (p) =>
            !!p && typeof p.shape === "string" && typeof p.material === "string" && v3(p.position) && v3(p.size, 1);
        const neu = {};
        for (const kind of Object.keys(buch).sort()) {
            const z = buch[kind] || {};
            const s = z.substanz || {};
            const wo = `Die Wirts-Zeile der Art „${kind}" (Gesetzbuch ${z.kern || "?"})`;
            if (KP[kind] && !KP[kind].kern) {
                log(`${wo} fällt: die Art trägt eine Wirts-Zeile, sie führt.`, "WARN");
                continue;
            }
            const fehler = [
                ["der Art-Name", /^[a-z][a-z0-9_]*$/.test(kind)],
                [
                    `das Präfix „${z.prefix}" (Form [a-z][a-z0-9]*_, frei)`,
                    /^[a-z][a-z0-9]*_$/.test(z.prefix) && !vergeben.has(z.prefix),
                ],
                [
                    "die Substanz (label, parts: shape · material · position · size)",
                    typeof s.label === "string" && Array.isArray(s.parts) && s.parts.length > 0 && s.parts.every(teil),
                ],
            ].find(([, gut]) => !gut);
            if (fehler) {
                log(`${wo} fällt (fail-closed): ${fehler[0]}.`, "ERROR");
                continue;
            }
            vergeben.add(z.prefix);
            const substanz = JSON.parse(JSON.stringify({ label: s.label, parts: s.parts }));
            neu[kind] = Object.freeze({
                prefix: z.prefix,
                substanz,
                kern: z.kern || null,
                grown: false,
                builtIn: false,
                placeExtra: null,
            });
        }
        const n = Object.keys(neu).length;
        if (n) AnazhRealm.KIND_POLICY = Object.freeze(Object.assign({}, KP, neu));
        return n;
    }
    // Studio-Welt-Parameter (der Buch-Umschlag): die Atmosphäre-Anker. Die Boden-Palette reist NICHT hier — sie
    // liegt synchron im Terrain-Namensraum (`AnazhRealm.BODEN_FARBE`), der Voxel-Worker braucht sie vor dem ersten Chunk.
    _foundryIngestWorldParams(params) {
        if (!params || typeof params !== "object") return;
        this.state.studioWorldParams = params;
        // DIE ATMOSPHAERE-ANKER (Mittag): Himmel-Top + Sonnenfarbe als HEX → der Himmel-Top ist der Nenner der Tönung
        // (`_dayNightComputeTint`, S7: EINE Farbe, keine Tafel nach der Uhr). Fallback = die Vorlage 0x6a9ed0.
        const sk = params.sky || {};
        const sky = {};
        if (typeof sk.top === "number") sky.top = sk.top;
        if (typeof sk.sun === "number") sky.sun = sk.sun;
        AnazhRealm._studioSky = Object.keys(sky).length ? sky : null;
    }
    // Wahrnehmungs-Kanal: Studio-PORTAL_RENDER_CONFIG ist die EINE Quelle für Sichtweite/LOD-Bänder/Dichte.
    // LOD-Fades/Hysterese → mutables LOD_DISTANCES (CPU-/Shader-Leser ziehen live nach) + state.lodRef;
    // Sichtweite/Dichte/Understory → statisches `AnazhRealm._studioRenderConfig` (Fallback = alter Wert).
    _foundryIngestRenderConfig(config) {
        if (!config || typeof config !== "object") return;
        this.state.studioRenderConfig = config;
        AnazhRealm._studioRenderConfig = config; // der Stand-Stempel liest die Wahrnehmung selbst (`_standStempel`)
        // LOD-Distanzen/Fades in die EINE LOD-Quelle (LOD_DISTANCES ist jetzt mutable — die Defaults
        // matchen die Vorlage schon; hier folgt AnazhRealm einem LIVE-Edit des Config-Blocks).
        const L = config.lod;
        const D = AnazhRealm.LOD_DISTANCES;
        if (L && typeof L === "object") {
            // Die Schwellen der Stufen legt das Gesetz des Schirms (`_stufenSchirm`, lod.K5) aus dem Fehler des Baus; d0/d1 des
            // Buchs sind die Distanzen des Labors. Bänder, Hysterese und Referenz-Höhe liest die Welt aus dem Buch.
            if (Number.isFinite(L.fade)) D.fade = L.fade;
            if (Number.isFinite(L.fade0)) D.fade0 = L.fade0;
            if (Number.isFinite(L.hyst)) D.hysteresis = L.hyst;
            if (Number.isFinite(L.ref)) {
                D.lodRef = L.ref;
                // leafVisCap NIE an ref koppeln: die Blatt-Kappe ist die eigene Zeile lod.blattKappe (24 m), LOD_DISTANCES
                // liest sie beim Laden. state.lodRef ist die LIVE-Spiegel-Quelle (CPU-Membership + Shader-
                // uLodRef, in _loopRender gespiegelt).
                if (this.state) this.state.lodRef = L.ref;
            }
        }
        // DER MERGE-CHOKEPOINT: die Blöcke der Zweit-Kerne — Stufen (N7.5), Budget je Art (B2c) und Gestalten je Rezept
        // (W8) — fallen NUR hier in die EINEN Karten `lod.kindStages` / `lod.budget` / `lod.budget.gestalten`,
        // disjunkt, first-wins (foundry-core führt), unbekannte Felder must-ignore (phyto-core `kerneVereinen` —
        // dieselbe Funktion liest die Wand auf dem Umschlag). Der Clamp-Leser (_foundryFlattenFor) und die Gestalten-
        // Wahl (_foundryGestalten: ein Haus, ein Tor, eine Klinge zählt seine Gestalten aus SEINEM Gesetzbuch) sehen ihn.
        globalThis.__phytoCore.kerneVereinen(config);
    }
    // Das Rezept eines Presets (aus dem Studio-Buch) — die EINE Rezept-Quelle fuer den Blueprint.
    _foundryRecipeFor(preset) {
        const f = this._foundry;
        return f && f.recipes ? f.recipes[preset] || null : null;
    }
    // DER START DES STUDIO-FADENS (B3a): läuft als Quelltext im Faden (der Boot-Blob, `_ensureAssetFoundry`) und greift auf
    // nichts außerhalb seines Rumpfs zu. Er liest das Kern-Manifest selbst (synchron: im Faden wartet niemand darauf; ALLES
    // aus cores.manifest.json, EINE Quelle, ?v= Pflicht), stellt die Transport-Schale VOR das Studio (ihr Kanal-Hörer steht
    // zuerst) und lädt die lib der Kerne (three r128 + die Geometrie-Helfer, keine Labor-Szene) → die Kerne in Manifest-Folge
    // (phyto- VOR foundry-core) → die Brücke ZULETZT (K42: keine Labor-Shell im Faden); importScripts braucht ABSOLUTE URLs
    // (die Blob-URL hat keine Basis). Die Platte stempelt jede Lieferung mit dem Gesetz-SHA ihrer Kerne: je Kern seine
    // Quellen (scripts · lib · bruecke — die Brücke trägt `__extractAssetMesh`, `bakeImpostorAtlas`), nie die Labor-Shell;
    // die Basis ist der Kern der Brücke. Ein Manifest ohne Kern bricht laut (`worker.onerror`).
    static _foundryStart(b, schale) {
        const W = globalThis;
        const url = (p) => new URL(p + b.v, b.base).href;
        const x = new W.XMLHttpRequest();
        x.open("GET", url("cores.manifest.json"), false);
        x.send();
        const manifest = JSON.parse(x.responseText);
        if (!Array.isArray(manifest) || !manifest.length)
            throw new Error("STOFF: die Foundry bootet nicht — das Kern-Manifest trägt keinen Kern");
        const liste = (feld, kerne = manifest) => {
            const out = [];
            for (const core of kerne)
                for (const s of [].concat((core && core[feld]) || [])) if (typeof s === "string" && s) out.push(url(s));
            return out;
        };
        const kerne = manifest.map((c) => ({
            id: c.id || c.ns,
            ns: c.ns || null,
            basis: !!c.bruecke,
            urls: ["scripts", "lib", "bruecke"].flatMap((feld) => liste(feld, [c])),
        }));
        schale({ lesen: b.lesen, format: b.format, platte: b.platte, kerne, wirt: b.wirt || [] });
        W.__PHYTO_FOUNDRY_WORKER = true;
        W.__anazhCores = manifest; // die Brücke liest die ns-Kerne generisch (vor den importScripts)
        W.importScripts(...liste("lib").concat(liste("scripts"), liste("bruecke"))); // die Brücke startet sich selbst
    }
    // ==================== DIE TRANSPORT-SCHALE: der Host-Teil des Foundry-Kanals IM Worker ====================
    // Befund 02.10. (Fluss-Linse, Mess-Wiese, Holz voll): beim Boot liefen 262 Studio-Assets = 404 MB durch den
    // HAUPT-Thread — strukturierter Klon beim Empfang (Σ 600 ms, max 76 ms je Antwort), IDB-Put-Serialisierung
    // (Σ 3,7 s, max 207 ms) und IDB-Gets hinter den Schreib-Transaktionen (Median 3,3 s, max 60 s); 32 % der
    // Bytes (aWind · aCenter · aType) las niemand. Die Schale läuft im Worker VOR den Studio-Skripten (der
    // Boot-Blob stellt ihren Quelltext voran, `_ensureAssetFoundry`) und trägt den ganzen Transport:
    //   PLATTE        Get · Put je Lieferung unter dem GESETZ-SHA ihrer Kerne (pipeline.K4 Stufe 2): je Kern SHA-256 über
    //                 seine Quellen (`cfg.kerne`). Eine Lieferung liest die Basis (den Kern der Brücke), jeden Kern, dessen
    //                 Tafel sie trägt (PRESETS, exportSettlement), und jeden Kern, den ein gelesener beim Namen (ns) nennt
    //                 — ihr Schlüssel trägt deren SHA vor dem Rest (`f<FOUNDRY_PLATTE_FORMAT>|<kern>:<sha>,…~<rest>`): ein
    //                 geänderter Kern baut nur seine Leser neu (bis 28.10. leerte jeder Kern-Edit die ganze Platte). Weicht
    //                 `__stamp` (alle Kern-SHA) ab, fegt das Öffnen die Schlüssel, deren SHA kein Kern mehr trägt. Der
    //                 Haupt-Thread fasst die Platte nie an (Store `anazhFoundryAssets/assets`).
    //   KONSUM-WAND   nur die Attribute, die `_foundryBuildMesh` liest (FOUNDRY_LESEN), reisen und liegen auf Platte.
    //   VERENGUNG     Index Uint32 → Uint16, wo das Teil ≤ 65 536 Vertices trägt.
    //   TRANSFER      jede Asset-/Karten-/Pixel-Antwort reist zero-copy (die Puffer sind frisch je Antwort).
    //   SAISON-NAGEL  jeder Körper und jede Karte erreicht das Studio als Sommer (das Jahr färbt der Host).
    // DIE LIEFERUNGEN gehen alle durch DIESE Schale: ein `build-asset` mit `platte` (Rest `_foundryKoerperKey`:
    // `<preset>|<gestalt>|<lod>[|ov:…]`) fragt erst die Platte; ein Miss geht an das Studio (byte-unberührt), dessen Antwort
    // die Schale abfängt, verschlankt, schreibt und überträgt — so auch der Dorf-Export (`export-settlement`, Rest = SHA seiner
    // Frage) und der EINE Blatt-Atlas (der Buch-Faden fragt ihn nach dem Buch selbst). Die Karte backt der Welt-Renderer:
    // `karte` fragt die Platte (Treffer = ihre Bytes, Miss = null), `karte-ablage` legt die gebackene ab; ihr Wert trägt dazu
    // den Stempel des Wirts (`cfg.wirt`: Stamm und Engine, VERSION maskiert). Jede Antwort nennt die Kerne, die sie liest
    // (`lesen`, die Liefer-Marke). `vorrat` wärmt nur die Platte (leere Antwort). `nurPlatte` (der Ship-Hook
    // `__anazhLiveBake === false`) baut nie: Miss = leere Antwort. Diese Funktion läuft als
    // Quelltext im Worker — sie greift auf nichts außerhalb ihres eigenen Rumpfs zu.
    static _foundrySchale(cfg) {
        const W = globalThis; // der Worker-Scope (self)
        const LESEN = new Set(cfg.lesen);
        const roh = W.postMessage.bind(W);
        const schreibAuftrag = new Map(); // reqId (der Atlas: "blatt-atlas") → die Lieferung des Studio-Baus, der gerade läuft
        // DIE PLATTE HÄLT KEINEN FADEN. Die Studio-Fäden (Werk und Helfer, `_foundryHelfer`) teilen EINE IndexedDB. Ein
        // synchroner Studio-Lauf, gerufen aus dem Lese-Erfolg, hält dessen Transaktion bis zu seinem Ende offen — und jede
        // Transaktion des anderen Fadens wartet dahinter (gemessen 05.10., gate:arch-feld Erst-Boot: fünf L1-Körper des
        // Werks, in Takt 3 gesendet, kamen in Takt 746–753, einen Takt nach dem kalten Karten-Bake des Bäckers, der seine
        // Karten-Lese-Transaktion 742 Takte offen hielt). Darum läuft ein Studio-Auftrag erst, wenn DIESER Faden keine
        // Transaktion offen hat (`offen`), in Ankunfts-Reihenfolge — die Arbeits-Uhr des Hosts bleibt FIFO je Faden.
        let offen = 0,
            laeuft = false;
        const bauten = [];
        const los = () => {
            while (!laeuft && offen === 0 && bauten.length) {
                laeuft = true;
                try {
                    bauten.shift()();
                } catch (e) {
                    // laut wie vorher (das Fehler-Ereignis des Workers), und die Schlange dahinter läuft weiter
                    setTimeout(() => {
                        throw e;
                    });
                } finally {
                    laeuft = false;
                }
            }
        };
        const tx = (d, art) => {
            const t = d.transaction("assets", art);
            offen++;
            let zu = false;
            const ende = () => {
                if (zu) return;
                zu = true;
                offen--;
                los();
            };
            t.addEventListener("complete", ende);
            t.addEventListener("abort", ende);
            return t;
        };
        // DAS GESETZ DER PLATTE: je Kern sein SHA (16 Hex) und die Kerne, die seine Quellen beim Namen nennen. Die Kerne einer
        // Lieferung (`huelle`, sortiert): die Basis, ihre Eigner und, was ein gelesener Kern nennt; `eigner` sind die Kerne,
        // deren Tafel die Art trägt.
        const hex = (s) =>
            crypto.subtle
                .digest("SHA-256", new TextEncoder().encode(s))
                .then((b) => Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, "0")).join(""));
        const text = (u) => fetch(u).then((r) => r.text());
        const kerne = cfg.kerne || [];
        let G = null;
        const huelle = (eigner) => {
            const ids = new Set(eigner);
            for (const k of kerne) if (k.basis) ids.add(k.id);
            for (const id of ids) for (const j of G.nennt.get(id) || []) ids.add(j);
            return [...ids].sort();
        };
        const stempelVon = (ids) => "f" + cfg.format + "|" + ids.map((id) => id + ":" + G.sha.get(id)).join(",");
        const schluessel = (l) => stempelVon(huelle(l.eigner)) + "~" + l.rest;
        const liest = (l) => (G && l ? { kerne: huelle(l.eigner), rest: l.rest } : undefined);
        const eigner = (traegt) =>
            kerne.filter((k) => k.ns && W[k.ns] && typeof W[k.ns] === "object" && traegt(W[k.ns])).map((k) => k.id);
        const artVon = (pid) => eigner((n) => !!n.PRESETS && Object.prototype.hasOwnProperty.call(n.PRESETS, pid));
        let db = null;
        let dbTot = !cfg.platte || typeof indexedDB === "undefined";
        const platte = dbTot
            ? Promise.resolve(null)
            : Promise.all(kerne.map((k) => Promise.all(k.urls.map(text)).then((t) => t.join("\n"))))
                  .then((quellen) =>
                      Promise.all(quellen.map(hex)).then((sha) => {
                          const nennt = (i) => kerne.filter((j) => j.ns && j !== kerne[i] && quellen[i].includes(j.ns));
                          G = {
                              sha: new Map(kerne.map((k, i) => [k.id, sha[i].slice(0, 16)])),
                              nennt: new Map(kerne.map((k, i) => [k.id, nennt(i).map((j) => j.id)])),
                          };
                          const stempel = stempelVon(kerne.map((k) => k.id));
                          const gilt = new Set(stempel.slice(stempel.indexOf("|") + 1).split(","));
                          return new Promise((resolve) => {
                              const req = indexedDB.open("anazhFoundryAssets", 1);
                              req.onupgradeneeded = () => req.result.createObjectStore("assets");
                              req.onerror = () => resolve(null);
                              req.onsuccess = () => {
                                  const d = req.result;
                                  const t = tx(d, "readwrite");
                                  const st = t.objectStore("assets");
                                  const g = st.get("__stamp");
                                  g.onsuccess = () => {
                                      if (g.result === stempel) return;
                                      // ein Kern oder das Format wechselte: es fällt NUR, wessen Gesetz kein Kern mehr trägt
                                      st.put(stempel, "__stamp");
                                      st.openKeyCursor().onsuccess = (e) => {
                                          const c = e.target.result;
                                          if (!c) return;
                                          const k = String(c.key);
                                          const kopf = k.slice(0, Math.max(0, k.indexOf("~"))).split("|");
                                          const traegt =
                                              kopf[0] === "f" + cfg.format &&
                                              !!kopf[1] &&
                                              kopf[1].split(",").every((x) => gilt.has(x));
                                          if (k !== "__stamp" && !traegt) st.delete(c.primaryKey);
                                          c.continue();
                                      };
                                  };
                                  t.oncomplete = () => resolve(d);
                                  t.onerror = () => resolve(null);
                              };
                          });
                      })
                  )
                  .catch(() => null)
                  .then((d) => {
                      db = d;
                      if (!d) dbTot = true;
                      return d;
                  });
        // Der Platten-Wert einer Lieferung `l` ({eigner, rest}) — oder null.
        const lies = (l) =>
            platte.then((d) =>
                d
                    ? new Promise((resolve) => {
                          try {
                              const g = tx(d, "readonly").objectStore("assets").get(schluessel(l));
                              g.onsuccess = () => resolve(g.result && typeof g.result === "object" ? g.result : null);
                              g.onerror = () => resolve(null);
                          } catch (_e) {
                              resolve(null);
                          }
                      })
                    : null
            );
        const schreib = (l, wert) => {
            if (!db || dbTot) return;
            try {
                const t = tx(db, "readwrite");
                t.objectStore("assets").put(wert, schluessel(l)).onerror = () => {
                    dbTot = true; // Quota/Fehler → nur noch Studio, nie still halb
                };
                // Der Put schließt, ohne dass dieser Faden seinen Erfolg erst abholt (er fällt mitten in einen Studio-
                // Lauf): der nächste Lauf wartet nur einen Ereignis-Umlauf, nie die Schreib-Zeit.
                if (typeof t.commit === "function") t.commit();
            } catch (_e) {
                dbTot = true;
            }
        };
        // Liegt die Lieferung auf der Platte? (count statt get: der Vorrat fragt nur, nie die Bytes)
        const hat = (l) =>
            platte.then((d) =>
                d
                    ? new Promise((resolve) => {
                          try {
                              const c = tx(d, "readonly").objectStore("assets").count(schluessel(l));
                              c.onsuccess = () => resolve(c.result > 0);
                              c.onerror = () => resolve(false);
                          } catch (_e) {
                              resolve(false);
                          }
                      })
                    : false
            );
        const schlank = (meshes) => {
            for (const m of meshes) {
                if (!m || typeof m !== "object") continue;
                for (const k of Object.keys(m)) {
                    const a = m[k];
                    if (a && a.array && ArrayBuffer.isView(a.array) && !LESEN.has(k)) delete m[k];
                }
                if (m.index instanceof Uint32Array && m.position && m.position.array.length / 3 <= 65536)
                    m.index = Uint16Array.from(m.index);
            }
            return meshes;
        };
        const puffer = (meshes) => {
            const set = new Set();
            for (const m of meshes) {
                if (!m || typeof m !== "object") continue;
                for (const k of Object.keys(m)) {
                    const a = m[k];
                    if (a && a.array && ArrayBuffer.isView(a.array)) set.add(a.array.buffer);
                }
                if (m.index && ArrayBuffer.isView(m.index)) set.add(m.index.buffer);
            }
            return Array.from(set);
        };
        const fracht = (fr) =>
            Array.from(new Set(fr.rgba.mips.concat(fr.bc ? fr.bc.mips : []).map((s) => s.data.buffer)));
        const antwort = (m, meshes, vonPlatte, l) =>
            roh(
                {
                    type: "asset",
                    world: "terrain",
                    cv: 1,
                    reqId: m.reqId,
                    presetId: m.presetId,
                    seed: m.seed,
                    lod: m.lod | 0,
                    meshes,
                    platte: vonPlatte,
                    liefer: liest(l),
                },
                puffer(meshes)
            );
        W.postMessage = function (msg, a, b) {
            const auftrag = msg && schreibAuftrag.get(msg.type === "blatt-atlas" ? msg.type : msg.reqId);
            if (auftrag) schreibAuftrag.delete(msg.type === "blatt-atlas" ? msg.type : msg.reqId);
            if (msg && msg.type === "asset" && Array.isArray(msg.meshes)) {
                msg.bau = true; // das Bau-Ereignis im Werk (die Liefer-Marke): nur ein Studio-Lauf antwortet hier
                schlank(msg.meshes);
                if (auftrag !== undefined) {
                    msg.liefer = liest(auftrag);
                    // Put VOR dem Transfer (die Serialisierung läuft hier im Worker; danach sind die Puffer weg).
                    if (msg.meshes.length) schreib(auftrag, { meshes: msg.meshes });
                    // Der Vorrat: der Körper liegt jetzt auf der Platte — zum Haupt-Thread reist er nicht (kein Leser).
                    if (auftrag.vorrat) return roh(Object.assign({}, msg, { meshes: [], vorrat: true }));
                }
                return roh(msg, puffer(msg.meshes));
            }
            // Das Bild des EINEN Blatt-Atlas (es reist nach dem Buch, B3a): die Schale macht es im Worker zur FRACHT
            // (`__phytoCore.blattAtlasFracht`: BC3 ab Stufe 0 für den Wirt mit BC (K20), rgba ab Stufe 1 ohne), legt sie auf
            // die Platte und reicht sie per Transfer, nie als Klon — der Haupt-Thread kodiert nichts.
            if (msg && msg.type === "blatt-atlas" && msg.blattAtlas && Array.isArray(msg.blattAtlas.mips)) {
                const fr = W.__phytoCore.blattAtlasFracht(msg.blattAtlas, true);
                if (fr && auftrag) schreib(auftrag, fr);
                return roh(
                    Object.assign({}, msg, { blattAtlas: fr, bau: true, liefer: liest(auftrag) }),
                    fr ? fracht(fr) : []
                );
            }
            // Der Plan des Dorfs (der Dorf-Export, reine Daten): auf die Platte, wenn das Studio einen trug
            if (msg && msg.type === "settlement") {
                if (auftrag && msg.plan) schreib(auftrag, { plan: msg.plan });
                return roh(Object.assign({}, msg, { bau: true, liefer: liest(auftrag) }));
            }
            return roh(msg, a, b);
        };
        // DER EINE BLATT-ATLAS: der Buch-Faden fragt ihn nach dem Buch selbst (B3a, vor jedem Körper seiner Schlange) — von
        // der Platte, sonst malt ihn das Studio (Kanal `blatt-atlas`) und die Schale legt seine Fracht ab.
        if (W.name === "buch") {
            const l = { eigner: [], rest: "blatt-atlas" };
            lies(l).then((wert) => {
                if (wert && wert.rgba)
                    return roh(
                        { type: "blatt-atlas", world: "terrain", blattAtlas: wert, platte: true, liefer: liest(l) },
                        fracht(wert)
                    );
                schreibAuftrag.set("blatt-atlas", l);
                bauten.push(() => W.onmessage({ data: { type: "blatt-atlas" } }));
                los();
            });
        }
        // DIE KARTE: ihr Wert trägt den Stempel des Wirts (die Quellen des Welt-Renderers, VERSION maskiert: ein Versions-
        // Sprung allein baut keine Karte neu); ohne ihn gibt es keine Karte auf der Platte.
        let wirt = null;
        const wirtSha = () =>
            wirt ||
            (wirt = Promise.all((cfg.wirt || []).map(text))
                .then((t) => (t.length ? hex(t.map((s) => s.replace(/VERSION = "[^"]*"/g, "")).join("\n")) : null))
                .catch(() => null));
        const karte = (m) => {
            const l = { eigner: artVon(m.presetId), rest: m.platte };
            if (m.type === "karte-ablage")
                return platte.then(
                    (d) => d && m.karte && wirtSha().then((w) => w && schreib(l, Object.assign({ w }, m.karte)))
                );
            return lies(l)
                .then((wert) => wert && wirtSha().then((w) => (w && wert.w === w ? wert : null)))
                .then((wert) =>
                    roh(
                        {
                            type: "karte",
                            world: "terrain",
                            reqId: m.reqId,
                            karte: wert ? { bytes: wert.bytes, frame: wert.frame } : null,
                            platte: !!wert,
                            liefer: liest(l),
                        },
                        wert ? [wert.bytes.buffer] : []
                    )
                );
        };
        // Der Kanal-Hörer steht VOR dem `onmessage` des Studios (registriert beim Import) — er sieht jede
        // Nachricht zuerst und hält jeden Auftrag einer Lieferung an. DER SAISON-NAGEL (V18.527): jeder Bau ist
        // Golden-Sommer — das Studio sieht season "summer", gleich was der Auftrag trägt; das Jahr färbt der Host
        // (uSeasonMul). So kann kein Saison-Rest im Studio (setSeasonColors) einen Körper oder die Platte färben.
        W.addEventListener("message", (ev) => {
            const m = ev.data;
            if (!m || !/^(build-asset|export-settlement|karte|karte-ablage)$/.test(m.type)) return;
            ev.stopImmediatePropagation();
            if (m.type === "karte" || m.type === "karte-ablage") return karte(m);
            const weiter = Object.assign({}, m, { season: "summer" });
            delete weiter.platte;
            delete weiter.nurPlatte;
            const studio = () => {
                bauten.push(() => {
                    if (typeof W.onmessage === "function") W.onmessage({ data: weiter });
                });
                los();
            };
            if (m.type === "export-settlement") {
                // DER DORF-EXPORT: sein Rest ist der SHA seiner Frage (Plan-Daten und Höhen-Raster), seine Eigner die Kerne
                // mit exportSettlement
                if (dbTot) return studio();
                const frage = JSON.stringify(m.dp, (k, v) => (ArrayBuffer.isView(v) ? Array.from(v) : v));
                return hex(String(frage)).then((h) => {
                    const l = {
                        eigner: eigner((n) => typeof n.exportSettlement === "function"),
                        rest: "stl|" + h.slice(0, 32),
                    };
                    return lies(l).then((wert) => {
                        if (wert && wert.plan)
                            return roh({
                                type: "settlement",
                                world: "terrain",
                                reqId: m.reqId,
                                plan: wert.plan,
                                platte: true,
                                liefer: liest(l),
                            });
                        schreibAuftrag.set(m.reqId, l);
                        studio();
                    });
                });
            }
            if (typeof m.platte !== "string") return studio();
            const l = { eigner: artVon(m.presetId), rest: m.platte };
            if (m.vorrat) {
                // DER VORRAT wärmt nur die Platte: liegt der Körper schon dort — oder gibt es keine Platte (nichts zu
                // wärmen) —, antwortet die Schale leer ohne Bau; sonst baut das Studio, die Schale schreibt.
                return hat(l).then((da) => {
                    if (da || dbTot) return antwort(m, [], da, l);
                    schreibAuftrag.set(m.reqId, Object.assign({ vorrat: true }, l));
                    studio();
                });
            }
            lies(l).then((wert) => {
                const hit = wert && Array.isArray(wert.meshes) ? wert.meshes : null;
                if (hit) return antwort(m, hit, true, l);
                if (m.nurPlatte) return antwort(m, [], false, l);
                schreibAuftrag.set(m.reqId, l);
                studio();
            });
        });
    }

    // DIE KÖRPER-IDENTITÄT (V18.527): ein Foundry-Körper ist (Art, Gestalt, Stufe) und — geprägt — sein ov-Hash.
    // Keine Saison: jeder Körper ist Golden-Sommer gebacken (die Transport-Schale nagelt season "summer"), das Jahr
    // trägt die Uniform `uSeasonMul` (`_tickSeason`). Cache-Schlüssel, Platten-Schlüssel und leafKey-Stamm sind
    // DIESER eine String — ein Saison-Wechsel baut nichts neu.
    _foundryKoerperKey(preset, gestalt, lod, ov) {
        return preset + "|" + gestalt + "|" + lod + (ov ? "|ov:" + this._studioOvHash(ov) : "");
    }
    // Die Karte eines (Art, Gestalt[, ov]): Record-Schlüssel "fimp:" + dieser String.
    _foundryKartenKey(preset, gestalt, ov) {
        return preset + "|" + gestalt + (ov ? "|ov:" + this._studioOvHash(ov) : "");
    }
    // `wo` = der Rang in der Worker-Schlange (`_foundryAuftrag`): die Position des Bestellers ({x,z}, d² wird beim
    // Senden frisch gemessen) · eine Zahl (d², 0 = sofort: Hand, Werkstatt) · nichts = Vorrat (Bibliothek, Ofen, Bäcker) — oder
    // sein Rang-Datensatz (`_foundryRang`). Das Versprechen trägt den Datensatz (`.rang`): der Zug hebt ihn (`_foundryNaeher`).
    _foundryRequest(presetId, seed, lod, ov, wo) {
        const rang = this._foundryRang(wo);
        wo = rang.wo;
        const f = this._foundry;
        if (!f) return Promise.resolve(null);
        // Die Gestalt des Orts (K20): die Solitär-Gestalt einer Baum-Art reist mit ihrer Prägung (`_foundryGestaltOv`).
        ov = this._foundryGestaltOv(presetId, seed, ov);
        // Regler-Kanal: ein nicht-leeres ov formt den Körper; sein Hash trennt den Schlüssel (geprägt und ungeprägt
        // vergiften sich nie). Die Werkstatt-Vorschau (wo === 0) umgeht die Platte KOMPLETT — ein Unikat je Regler-Stand.
        const hasOv = !!(ov && typeof ov === "object" && Object.keys(ov).length);
        // Ship-Pfad-Hook (spec/pack/v0/CONTRACT.md): `window.__anazhLiveBake === false` → NUR die Platte (die
        // Transport-Schale baut nie, Miss = null). Default: Platte zuerst, Studio beim Miss (beides im Worker).
        const nurPlatte = typeof window !== "undefined" && window.__anazhLiveBake === false;
        // Der Platten-Schlüssel reist mit JEDEM Welt-Körper — ob eine Platte lebt, entscheidet die Schale (cfg.platte,
        // Quota). Ein geprägter Körper (Ofen-Mensch, Tier mit Reglern, gestempelter Eintrag) trägt seinen ov-Hash und
        // trifft beim nächsten Boot die Platte; nur die Werkstatt-Vorschau und die Hand (wo === 0 mit ov) sind Unikate.
        const platte = hasOv && wo === 0 ? null : this._foundryKoerperKey(presetId, seed, lod, hasOv ? ov : null);
        if (nurPlatte && !platte) return Promise.resolve(null);
        if (!f.ready || !f.worker) {
            // Fail-LAUT: das kalte Buch benennt den null-Pfad mit einem ratenbegrenzten Konsolen-Wort (max
            // 1×/10 s); das Verhalten bleibt (Aufrufer deferrieren + heilen beim Ingest).
            const now = Date.now();
            if (!this._foundryKaltWarnAt || now - this._foundryKaltWarnAt > 10000) {
                this._foundryKaltWarnAt = now;
                this.log(`FOUNDRY KALT: build-asset(${presetId}) ohne Buch/Worker → null (heilt beim Ingest)`, "WARN");
            }
            return Promise.resolve(null);
        }
        // DER INGEST-TAKT: jedes Ergebnis passiert _foundryIngestTakt; der Loop-Tick gibt je Frame nur wenige frei —
        // sonst laufen Burst-Konversionen (_foundryBuildGroup) als Microtasks in EINER LongTask. Misses und headless
        // passieren sofort; Konsumenten tragen null-bis-fertig.
        const auftrag = this._foundryWorkerRequest(presetId, seed, lod, hasOv ? ov : null, platte, nurPlatte, rang)
            .then((meshes) => (nurPlatte && !(meshes && meshes.length) ? null : meshes))
            .then((ergebnis) => this._foundryIngestTakt(ergebnis, rang));
        auftrag.rang = rang;
        return auftrag;
    }
    // DER EINE RANG-DATENSATZ je Auftrag bzw. Zug (B5): `wo` = der Ort des nächsten Lesers ({x,z}, eine Zahl d² oder nichts =
    // Vorrat), `kopf` = der Kopf einer Ankunfts-Kette (`_buchKoepfe`: die Bahn ohne Arbeit, `_foundryPumpe`). DERSELBE Datensatz
    // wartet in der Schlange (`_foundryAuftrag`), reist im Flug mit und wartet am Wächter (`_foundryIngestTakt`) — `_foundryNaeher`
    // hebt ihn, wo der Zug gerade steht, die EINE Wahl (`_foundryWahl`) liest ihn. Befund des B4-Prüfers: die Freigabe las das
    // `wo` aus dem Closure von `_foundryRequest`, ein naher Leser, der sich an einen fernen Zug hängte, blieb am Wächter hinten.
    _foundryRang(wo, kopf) {
        return wo && wo.rangSatz === true ? wo : { rangSatz: true, wo, kopf: kopf === true };
    }
    // DAS BILD DER ANKUNFT (B-Blick, die EINE Frage): liegt der Leser (`wo`: Ort, Zahl d² mit Blick-Schlüssel oder ein
    // Rang-Datensatz) im Bild der Ankunft — was die Ankunfts-Kamera sieht (`_foundryAuftragD2` trägt vor dem Bild den Blick,
    // `_blickRang`), danach liegt alles darin? DIESE Menge rangiert vorn und nur sie hält das erste Weltbild. Leser: die Pumpe
    // (`_foundryPumpe`), der Wecker der Streu (`_streuWeckerSpannen`, `_streuZelleWartet`) und der Ring unter dem Ladeschirm
    // (`_tickVoxelChunkStreaming`). Mit Radius `r` (ein Stück Welt: ein Chunk) fragt sie den Blick mit seinem Rand wie die Terme.
    _rangImBild(wo, r) {
        const w = this._foundryRang(wo).wo;
        if (r > 0 && w) return !!this.state._weltbildDa || this._imErstenBlick(w.x, w.z, r);
        return this._rangImErstenBlick(this._foundryAuftragD2(w));
    }
    // DER EINE ZUG je Körper-Schlüssel: die Dedup-Wache `f.requested` wusste, DASS ein Schlüssel unterwegs war, nie WER auf
    // ihn wartet — den Rückruf trug nur der erste Besteller. Die Werkstatt-Vorschau hinter dem Zug der Welt wartete darum
    // für immer (Zweig-CI 38453848494: „keine Vorschau-Gestalt" nach 90 s, der Körper lag längst im Cache), die Hand trug
    // dafür ihren eigenen 45-s-Poll. Jetzt hält `f.zuege` je Schlüssel im Flug EINE Zusage: der erste Besteller stellt den
    // Auftrag, jeder spätere hängt sich an (`_foundryWecker`) und hebt den Rang auf seine Nähe (`_foundryNaeher`). Die
    // Zusage löst mit true, wenn der Körper im Cache liegt, mit false nach Ablauf (die Wache gibt den Schlüssel frei, der
    // nächste Leser fragt neu). `erst` gilt nur dem ersten Besteller: `vor` läuft vor dem Auftrag (der Wurf-Körper reist
    // im selben Zug davor), `nach(ok)` nach der Ankunft.
    _foundryZug(key, preset, variant, lod, ov, wo, erst) {
        const f = this._foundry;
        if (!f) return Promise.resolve(false);
        const zuege = f.zuege || (f.zuege = new Map());
        const da = zuege.get(key);
        if (da) {
            if (wo != null && da.rang) this._foundryNaeher(da.rang, wo); // ohne Ort kein Rang (Lehre 17: null ist nie 0)
            this._streuWartetAuf(da);
            return da;
        }
        if (!f.requested) f.requested = new Set();
        f.requested.add(key);
        if (erst && erst.vor) erst.vor();
        const auftrag = this._foundryRequest(preset, variant, lod, ov || undefined, wo);
        const zug = auftrag.then((meshes) => {
            if (zuege.get(key) === zug) zuege.delete(key);
            if (meshes) {
                this._foundryCacheSet(key, this._foundryBuildGroup(meshes, { lod, preset }));
                return true;
            }
            f.requested.delete(key); // Ablauf/Fehler: nie null cachen (das doomte die Art) — der nächste Leser fragt neu
            f.ankunft = (f.ankunft | 0) + 1; // auch das Ende ohne Körper ist eine Antwort: wer auf sie schläft, fragt neu
            return false;
        });
        zug.rang = auftrag.rang;
        zuege.set(key, zug);
        if (erst && erst.nach) zug.then(erst.nach);
        this._streuWartetAuf(zug); // die streuende Region wartet auf diesen Zug (K60-2)
        return zug;
    }
    // Der Takt-Wächter: hält ein Request-Ergebnis zurück, bis der Loop-Tick es
    // freigibt (die Konversion des Aufrufers folgt als Microtask im selben Frame). `rang` = der Rang-Datensatz des Auftrags
    // (`_foundryRang`, derselbe wie in der Worker-Schlange): die Freigabe wählt mit der EINEN Wahl der Pumpe (`_foundryWahl`).
    _foundryIngestTakt(x, rang) {
        if (x == null) return Promise.resolve(x); // Miss/Timeout: sofort — nulls stauen nie
        const r = this.state.renderer;
        if (!r || r._isHeadlessNull) return Promise.resolve(x); // headless byte-schnell (Gates)
        const q = this._foundryIngestQueue || (this._foundryIngestQueue = []);
        this._foundryIngestMaxQ = Math.max(this._foundryIngestMaxQ || 0, q.length + 1); // Linse
        return new Promise((res) =>
            q.push({ frei: () => res(x), rang: this._foundryRang(rang), t: performance.now() })
        );
    }
    // DIE EINE WAHL der Foundry (Worker-Schlange `_foundryPumpe`, Freigabe `_tickFoundryIngest`): nah zuerst nach dem EINEN
    // Rang (`_foundryAuftragD2`, vor dem ersten Weltbild der Blick zuerst), unter Gleichen FIFO, nie verhungert — wartet der
    // Älteste (der erste, der `darf`) länger als FOUNDRY_ALTER_MS, geht er jedes zweite Mal (`halter.warteZug`), die Nahen
    // bleiben vorn. Index, −1 wenn keiner darf. Bis B4-n1 ging die Freigabe FIFO (die Vorlagen des Leibs warteten hinter
    // 13–24 Baum-Ergebnissen des Boden-Rings, Radeon kalt Leib 5,9 -> 7,1 s), danach in einer zweiten Wahl mit eigener
    // Hunger-Regel (der Älteste immer zuerst); gate:takt T5 + T6 fahren Pumpe UND Freigabe.
    _foundryWahl(q, halter, darf) {
        let i = 0;
        if (darf) while (i < q.length && !darf(q[i])) i++;
        if (i >= q.length) return -1;
        if (performance.now() - q[i].t > AnazhRealm.FOUNDRY_ALTER_MS && (halter.warteZug = !halter.warteZug)) return i;
        let best = this._foundryAuftragD2(q[i].rang.wo);
        for (let k = i + 1; k < q.length; k++) {
            if (darf && !darf(q[k])) continue;
            const d2 = this._foundryAuftragD2(q[k].rang.wo);
            if (d2 < best) {
                best = d2;
                i = k;
            }
        }
        return i;
    }
    // Freigabe-Tick (EIN Aufruf je Frame), sekunden-normalisiert: n = round(INGEST_RATE_PER_S·dt),
    // gedeckelt durch INGEST_BURST_CAP — die Welt lädt mit der Wanduhr, nicht mit der Framerate. Über
    // Budget halbe Rate (der Stau schrumpft immer, kein LongTask). Ohne dt (Gate/Test): 3 unter / 1 über
    // Budget (gate:leistungs-vertrag).
    _tickFoundryIngest(dtSec) {
        // eine Rückgabe im letzten Takt (`_foundryLoslassen`): der Ruhe-Deckel wiegt, was untätig wurde
        if (this._foundry && this._foundry.ruheOffen) this._foundryRuheDeckel();
        const q = this._foundryIngestQueue;
        if (!q || !q.length) return;
        let n;
        if (!Number.isFinite(dtSec)) {
            n = this.state._frameOverBudget ? 1 : 3; // Gate/Test-Pfad: byte-alte Frame-Semantik
        } else {
            const rate = this.state._frameOverBudget
                ? AnazhRealm.INGEST_RATE_PER_S * 0.5
                : AnazhRealm.INGEST_RATE_PER_S;
            const dt = Math.min(0.25, Math.max(0.001, dtSec));
            n = Math.max(1, Math.min(AnazhRealm.INGEST_BURST_CAP, Math.round(rate * dt)));
        }
        for (let i = 0; i < n && q.length; i++) {
            const { frei } = q.splice(this._foundryWahl(q, q), 1)[0];
            this._foundryIngestFrei = (this._foundryIngestFrei || 0) + 1; // Linse (freigegeben gesamt)
            // die Freigabe erfüllt nur ein Versprechen (`res(x)` wirft nie); der Bau des Aufrufers läuft danach in SEINER
            // Kette, deren Fang laut bricht (K22: kein toter catch um die Freigabe)
            frei();
        }
    }
    // DIE EINE FOUNDRY-FRIST: der Worker arbeitet seine Aufträge FIFO ab — die Uhr eines Auftrags läuft erst,
    // wenn kein FRÜHER gesendeter mehr offen ist (vorher wartet er in der Schlange, nicht im Bau). Befund
    // 01.10.: die Uhr ab Senden ließ Impostor-Karten in der belebten Welt ablaufen, bevor der Worker sie
    // anfasste (strauch|16: 45 s Ablauf im Betrieb, 0,6 s bei freiem Worker) — drei Abläufe, und die Art
    // stand terminal ohne Fernstufe. Nie verklemmt: der älteste offene Auftrag hat immer eine laufende Uhr. FIFO gilt
    // je FADEN (`_foundryBahn`): ein Auftrag eines Helfers hält die Uhr eines Körpers im Werk nie an, und umgekehrt.
    // DER ABGELAUFENE BLEIBT IM FADEN: der Besteller bekommt null (seine Wiederhol-Disziplin läuft), aber der Worker baut
    // ihn weiter — als GEIST hält er seinen Platz und die Uhr der Späteren seines Fadens an, bis seine späte Antwort kommt
    // (höchstens GEIST_FACHE × die Frist, dann fällt er: nie verklemmt). Bis 05.10. startete die Uhr des Wiederholers,
    // während der Faden den Abgelaufenen noch baute (gate:arch-feld, CPU-Raster unter Fremdlast: Weide und Eiche je 3
    // Versuche, die Karte der fernen Eiche kam in Takt 3281; der dritte Ablauf macht eine Zelle für immer gescheitert).
    // DIE UHR STARTET AM EREIGNIS (K38-N2): ein Auftrag meldet seine Frist an (`f.fristen`), `_foundryUhren` stellt sie,
    // sobald kein früherer seines Fadens offen ist — beim Anmelden, nach jeder Antwort und beim Fall eines Geistes. Bis
    // K38-N2 fragte je Auftrag im Flug ein 1-s-Poll, ob er schon der älteste sei (die Uhr lief bis 1 s zu spät an).
    _foundryFrist(f, reqId, dauerMs, beiAblauf) {
        const fristen = f.fristen || (f.fristen = new Map());
        fristen.set(reqId, { dauerMs, beiAblauf, uhr: null });
        this._foundryUhren(f);
    }
    _foundryUhren(f) {
        const fristen = f.fristen;
        if (!fristen || !fristen.size) return;
        // die Nummer steht am Ende (die Bahn eines Werk-Helfers trägt ihren Faden davor, `_foundryPumpe`)
        const nr = (id) => {
            const m = /(\d+)$/.exec(String(id));
            return m ? Number(m[1]) : NaN;
        };
        for (const [reqId, fr] of fristen) {
            if (!f.pending.has(reqId)) {
                // beantwortet: die Uhr fällt mit
                if (fr.uhr !== null) clearTimeout(fr.uhr);
                fristen.delete(reqId);
                continue;
            }
            if (fr.uhr !== null) continue;
            const meine = nr(reqId);
            const bahn = this._foundryBahn(reqId);
            let vorMir = false;
            for (const k of f.pending.keys()) {
                if (nr(k) < meine && this._foundryBahn(k) === bahn) {
                    vorMir = true;
                    break;
                }
            }
            if (!vorMir) fr.uhr = setTimeout(() => this._foundryAblauf(f, reqId), fr.dauerMs);
        }
    }
    _foundryAblauf(f, reqId) {
        const fr = f.fristen && f.fristen.get(reqId);
        if (!fr) return;
        f.fristen.delete(reqId);
        if (!f.pending.has(reqId)) return; // beantwortet im selben Takt
        const geist = () => {};
        f.pending.set(reqId, geist); // die späte Antwort löst den Geist ein (`_foundryAntwort`)
        setTimeout(() => {
            if (f.pending.get(reqId) === geist) {
                f.pending.delete(reqId);
                this._foundryPumpe(f);
                this._foundryUhren(f); // der Geist fällt: die Uhr des nächsten seines Fadens läuft an
            }
        }, fr.dauerMs * AnazhRealm.FOUNDRY_GEIST_FACH);
        fr.beiAblauf();
    }
    _foundryWorkerRequest(presetId, seed, lod, ov, platte, nurPlatte, wo) {
        const f = this._foundry;
        if (!f || !f.ready || !f.worker) return Promise.resolve(null);
        // W-A1 — msg.ov reist NUR, wenn wirklich Overrides da sind (die Bruecke reicht ov ausschliesslich an
        // Zweit-Kern-buildInstance durch). `platte` (der Schlüssel) und `nurPlatte` liest die Transport-Schale
        // und nimmt sie heraus, bevor das Studio die Anfrage sieht; die Saison setzt NUR die Schale (Sommer).
        const msg = { type: "build-asset", presetId, seed, lod };
        if (ov && typeof ov === "object" && Object.keys(ov).length) msg.ov = ov;
        if (platte) msg.platte = platte;
        if (nurPlatte) msg.nurPlatte = true;
        // 45 s ARBEITS-Zeit (die EINE Frist, `_foundryFrist`): ein Koniferen-lod0-Asset hat ~170k Verts; die
        // Wartezeit in der Schlange zählt nicht mit. fail-LAUT (V18.462): das Timeout ist vom kalten Buch
        // unterscheidbar — der Aufrufer sieht sonst beide als null.
        return this._foundryAuftrag(
            f,
            "r",
            msg,
            wo,
            45000,
            `FOUNDRY TIMEOUT: build-asset(${presetId}) nach 45 s Arbeit ohne Reply → null`
        );
    }
    // DER VORRAT AUF DER PLATTE (V18.527): ein Körper, den noch kein Leser braucht (Garage-Fahrzeuge vor dem ersten Spawn),
    // wärmt NUR die Platte — die Transport-Schale baut, schreibt und antwortet leer; der Haupt-Thread baut keine Gruppe
    // ohne Leser (bis V18.526 lief jeder Vorrats-Körper je Boot durch `_foundryBuildGroup`). Liegt er schon auf der Platte
    // oder gibt es keine (Null-Renderer, Quota), antwortet die Schale sofort leer. true = gewärmt, null = Timeout.
    _foundryVorrat(presetId, seed, lod) {
        const f = this._foundry;
        if (!f || !f.ready || !f.worker) return Promise.resolve(null);
        const msg = {
            type: "build-asset",
            presetId,
            seed,
            lod,
            platte: this._foundryKoerperKey(presetId, seed, lod),
            vorrat: true,
        };
        return this._foundryAuftrag(
            f,
            "r",
            msg,
            null,
            45000,
            `FOUNDRY TIMEOUT: Vorrat(${presetId}) nach 45 s Arbeit ohne Reply → null`
        ).then((m) => (m ? true : null));
    }
    // DIE EINE WORKER-SCHLANGE: der Foundry-Worker arbeitet FIFO, ein Bau dauert 0,1–25 s. Vorher ging jede Anfrage
    // sofort per postMessage hinein — eine nahe Eiche-L0 wartete hinter JEDEM früher gestellten Vorrats- und
    // Fernauftrag (gemessen 03.10.: beim Boot 241 Aufträge im Worker, die nahe Eiche-L0 kam nach 9,0 s, die Tanne nach
    // 9,4 s; gate:arch-feld: 17 offene Aufträge, Eiche in 10 m und Haus in 27 m 800 Takte ohne Mesh). Jetzt hält der
    // Host die Schlange: höchstens FOUNDRY_IM_FLUG Aufträge je Studio-Faden (Werk · Helfer, `_foundryPumpe`; so viele,
    // dass er ohne Rundlauf-Lücke arbeitet:
    // der Vorrat läuft so schnell leer wie FIFO), der nächste geht NAH zuerst (d² zum Spieler,
    // beim Senden frisch gemessen; Vorrat = ∞, unter Gleichen FIFO) — und nie verhungert: ist der älteste Wartende
    // älter als FOUNDRY_ALTER_MS, wechselt die Wahl ab (der Älteste, dann der Nächste). Die Request-Nummer entsteht
    // beim SENDEN: die EINE Frist (`_foundryFrist`) bleibt eine Arbeits-Uhr in Worker-Reihenfolge.
    _foundryAuftrag(f, praefix, msg, wo, fristMs, ablaufWort) {
        if (msg.type === "build-asset") this._foundryLiefer(f, "auftrag");
        return new Promise((resolve) => {
            const q = f.warte || (f.warte = []);
            q.push({ praefix, msg, rang: this._foundryRang(wo), fristMs, ablaufWort, resolve, t: performance.now() });
            this._foundryPumpe(f);
        });
    }
    _foundryAuftragD2(wo) {
        // eine Zahl trägt den Blick-Schlüssel ihres Lesers (`_blickRang`, die Karte) — wie beim Ort gilt er nur vor dem Bild
        if (typeof wo === "number") {
            const A = AnazhRealm.ERSTER_BLICK.ausserD2;
            return !Number.isFinite(wo) ? Infinity : this.state._weltbildDa && wo >= A ? wo - A : wo;
        }
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        if (!wo || !pm || !Number.isFinite(wo.x) || !Number.isFinite(wo.z)) return Infinity;
        const dx = wo.x - pm.x,
            dz = wo.z - pm.z;
        // DER BLICK ZUERST (B3d): bis das erste Weltbild steht, ist der Rang (im Blick, d²) — `_blickRang`
        return dx * dx + dz * dz + this._blickRang(wo.x, wo.z);
    }
    // Die BAHN eines Auftrags (Präfix der Request-Nummer): ein Werk-Helfer (`_foundryHelfer`) trägt seinen Faden in der
    // Nummer (`w<k>_<n>`): seine Bahn ist "werk<k>", sonst das Werk.
    _foundryBahn(reqIdOderMsg) {
        const h = typeof reqIdOderMsg === "string" ? /w(\d+)_\d+$/.exec(reqIdOderMsg) : null;
        return h ? "werk" + h[1] : "werk";
    }
    // Die Pumpe speist die Fäden aus der EINEN Schlange: je Faden höchstens FOUNDRY_IM_FLUG im Flug, die Wahl unter den
    // Wartenden ist die EINE Wahl (`_foundryWahl`: nah zuerst, nie verhungert). Ein Auftrag geht in die Bahn mit den meisten freien Plätzen
    // (das Werk und jeder bereite Helfer, `_foundryHelfer`; unter Gleichen das Werk).
    // DER BILD-RANG DER BAHN (B5): nach dem Buch malt das Werk den Blatt-Atlas (bis seine Fracht ankommt, `f.blattAtlas`) — es
    // ist belegt, auch ohne Auftrag im Flug. Ein Kopf der Ankunft (`rang.kopf`: der Leib, das Start-Dorf) geht in eine Bahn ohne
    // Arbeit, und keiner stellt sich hinter ihn, solange eine Bahn ohne Kopf Platz hat. Befund B5 (OMEN 18.10., GTX kalt): die
    // Leib-Stufe wartete im Werk hinter dem Atlas, hinter dem Dorf-Export (3,4–5,4 s) wartete jeder Auftrag seiner Bahn.
    _foundryPumpe(f) {
        const q = f && f.warte;
        if (!q || !f.worker) return;
        const werke = [{ bahn: "werk", ziel: f.worker, k: 0 }];
        for (const h of f.helfer || []) if (h.bereit) werke.push({ bahn: "werk" + h.k, ziel: h.w, k: h.k });
        let frei = 0,
            bahn = null;
        // DER BLICK ZUERST (B3d): vor dem ersten Weltbild geht ein Auftrag außer Blick (sein Rang, `_blickRang`) nur in eine
        // LEERE Bahn — der Faden arbeitet seine Nachrichten nacheinander ab, und jeder Auftrag im Blick wartete hinter bis zu
        // FOUNDRY_IM_FLUG außer Blick (Radeon kalt am Kopf 1aebfc6e: 0 wartend, bis 33 im Werk, die Bauten im Blick bis 18 s)
        let leer = null;
        const darf = (a) =>
            a.rang.kopf
                ? !!(leer || bahn)
                : !!bahn && (frei === AnazhRealm.FOUNDRY_IM_FLUG || this._rangImBild(a.rang));
        const koepfe = f.koepfe || (f.koepfe = new Set());
        while (q.length) {
            const im = new Map();
            const mitKopf = new Set();
            for (const k of f.pending.keys()) {
                const b = this._foundryBahn(k);
                im.set(b, (im.get(b) || 0) + 1);
                if (koepfe.has(k)) mitKopf.add(b);
            }
            for (const k of koepfe) if (!f.pending.has(k)) koepfe.delete(k);
            if (f.recipes && !f.blattAtlas) im.set("werk", (im.get("werk") || 0) + 1); // das Werk malt den Atlas
            frei = 0;
            bahn = null;
            leer = null;
            for (const w of werke) {
                const n = im.get(w.bahn) || 0;
                if (!n && !leer) leer = w;
                const fr = AnazhRealm.FOUNDRY_IM_FLUG - n;
                if (!mitKopf.has(w.bahn) && fr > frei) {
                    frei = fr;
                    bahn = w;
                }
            }
            if (!bahn && !leer) return; // kein Faden mit Platz
            const i = this._foundryWahl(q, f, darf);
            if (i < 0) return; // kein Wartender, der in die freiste Bahn darf
            const a = q.splice(i, 1)[0];
            const ziel = a.rang.kopf ? leer || bahn : bahn;
            const reqId = a.praefix + (ziel.k ? "w" + ziel.k + "_" : "") + f.reqSeq++;
            f.pending.set(reqId, a.resolve);
            if (a.rang.kopf) koepfe.add(reqId);
            try {
                ziel.ziel.postMessage(Object.assign({ reqId }, a.msg));
            } catch (_e) {
                f.pending.delete(reqId);
                a.resolve(null);
                continue;
            }
            this._foundryFrist(f, reqId, a.fristMs, () => {
                this.log(a.ablaufWort, "WARN");
                a.resolve(null);
                this._foundryPumpe(f);
            });
        }
    }
    // Ein Besteller, dessen Schlüssel schon unterwegs ist (der Boot-Vorrat oder ein ferner Leser fragte ihn zuerst), hebt den
    // Rang-Datensatz des Zugs auf seine Nähe — wo der Zug gerade steht: wartend, im Flug, am Wächter (`_foundryRang`).
    _foundryNaeher(rang, wo) {
        if (this._foundryAuftragD2(wo) < this._foundryAuftragD2(rang.wo)) rang.wo = wo;
    }
    // Die Foundry-Art einer Grammatik-Spezies (Bäume, Sträucher …): ihre Fernstufe ist die Karte, die die Welt aus der L1
    // derselben Art bäckt (`_karteWeltBacken`).
    _foundryPresetFor(species) {
        const map = {
            // Baeume
            baum_eiche: "eiche",
            baum_fichte: "fichte",
            baum_tanne: "tanne",
            baum_birke: "birke",
            baum_weide: "weide",
            baum_mammut: "mammut",
            baum_kiefer: "fichte",
            // Wald-Nischen (_forestCellDarts) auf Vorlagen-Arten: baum_erle → weide. Buche und Karst-Baum sind seit 04.10.
            // eigene Studio-Arten (die Aliase auf Mammut und belaubte Eiche fielen), die Mammut-Nische des Wald-Generators
            // heißt baum_mammut. Stehendes Totholz hat in der Welt keinen Erzeuger (der Alias baum_totholz → eiche fiel
            // 05.10. mit der Grammatik-Art); die Studio-Art totholz pflanzt der Labor-Wald.
            baum_erle: "weide",
            baum_buche: "buche",
            baum_karst: "karst",
            // Restliche Wald-Nischen (`_scatterSpeciesForLayer`) auf die nächste Studio-Art: Zypresse (schlanke
            // Konifere) → tanne, Palme (Einzelstamm mit Krone) → weide.
            baum_zypresse: "tanne",
            baum_palme: "weide",
            // Fels: ALLE 6 Vorlagen-Stein-Rezepte (emitRock), nach Charakter verteilt — vorher
            // fielen sediment/zacken/geroell durch (nur findling/basalt genutzt = Rueckzug).
            // findling = runder Findling:
            noiserock: "findling",
            findling: "findling",
            // basalt = Saeulen:
            stein_block: "basalt",
            stein: "basalt",
            // sediment = Schichtfels (geschichtet):
            fels: "sediment",
            fels_var: "sediment",
            schichtfels: "sediment",
            sediment: "sediment",
            // zacken = Felszacken (schroffe Tuerme/Boegen):
            felsturm: "zacken",
            felszacken: "zacken",
            felsbogen: "zacken",
            zacken: "zacken",
            // geroell = Geroellhalde (Schutt/Talus/Kiesel):
            geroell: "geroell",
            talus: "geroell",
            felsbrocken: "geroell",
            kiesel: "geroell",
            // Kristall (emitCrystals)
            kristall_geode: "kristalle",
            geode: "kristalle",
            kristall: "kristalle",
            kristalle: "kristalle",
            kristall_var: "kristalle",
            // Blume (emitFlower) + Strauch — die Bodenflora der Streu-Regionen (blume_gross); die Arten-Namen des gefallenen
            // Klein-Vegetations-Zwillings (Tulpe · Klee · Mohn) fielen mit ihm (Waldboden 04.10.).
            blume_gross: "blume",
            blume: "blume",
            // Straeucher -> Vorlagen-strauch (LOD haelt die Perf: lod2 ~16k Verts; die Distanz-
            // LOD-Wahl gibt dem fernen Busch die leichte Stufe, instanziert).
            busch_hazel: "strauch",
            busch: "strauch",
            // Das Kraut-Stratum feuchter Senken (`_scatterSpeciesForLayer` moisture>0.55) ist der Studio-Farn (Waldboden
            // 04.10., integriert 05.10.): der Alias auf den Strauch fiel wie Buche, Karst-Baum und Totholz.
            farn_busch: "farn",
        };
        if (map[species]) return map[species];
        // Generische Regel hinter der Tabelle: `baum_<preset>`/`<preset>` mit Preset im LIVE-Rezeptbuch
        // (`f.recipes`) löst ohne Tabellen-Edit auf; die Tabelle trägt nur historische Namen (baum_kiefer …).
        const f = this._foundry;
        if (f && f.recipes && typeof species === "string") {
            // N1 (M8): der Praefix-Strip laeuft ueber die KIND_POLICY-Tabelle — jede Domaene
            // loest `<prefix><id>` ueber das LIVE-Buch (praefix-freie Built-ins bleiben
            // unberuehrt: "wagen" steht in keinem Buch -> null -> ihr Part-Pfad haelt).
            let bare = species;
            const KP = AnazhRealm.KIND_POLICY;
            for (const k in KP) {
                const px = KP[k].prefix;
                if (px && species.startsWith(px)) {
                    bare = species.slice(px.length);
                    break;
                }
            }
            if (Object.prototype.hasOwnProperty.call(f.recipes, bare)) return bare;
        }
        return null;
    }
    // DER WORT-KATALOG (Welle L Folge, L-Wortschatz): ein Wort des Co-Schöpfers („eiche", „birken", „fachwerkhaus",
    // „häuser", „wagen") löst über den EINEN Rezept-Katalog auf — die Studio-Arten des Buchs, ihre Bauplan-Träger, das
    // Art-Gesetz (`KIND_POLICY`) und die Studios (`WORLD_REGISTRY`) —, nie über eine Hand-Liste (die Brücke STUDIO_WORT
    // kannte neun Wörter, „bau mir ein fachwerkhaus" war unbekannt). Gefragt werden das Wort, seine Stämme (-en/-n/-e/-s/-er,
    // der Plural-Umlaut: Häuser → Haus) und als Kompositum der Anfang eines Werk-Namens („fels" → Felsformation, ≥ 4
    // Buchstaben, das erste in Katalog-Reihenfolge). null = unbekannt (kein Raten).
    _studioBlueprintForWord(word) {
        if (typeof word !== "string" || !word.trim()) return null;
        const K = this._studioWortKatalog();
        const w = AnazhRealm._wortFalten(word);
        const kandidaten = [w];
        for (const suf of ["en", "n", "e", "s", "er"])
            if (w.length > suf.length + 2 && w.endsWith(suf)) kandidaten.push(w.slice(0, -suf.length));
        for (const k of kandidaten.slice()) {
            const ohne = k.replace(/aeu/g, "au").replace(/ae/g, "a").replace(/oe/g, "o").replace(/ue/g, "u");
            if (ohne !== k) kandidaten.push(ohne);
        }
        for (const stufe of K.stufen) for (const t of kandidaten) if (stufe.has(t)) return stufe.get(t);
        for (const t of kandidaten) {
            if (t.length < 4) continue;
            for (const s of [1, 3])
                for (const [name, ziel] of K.stufen[s]) if (name.length > t.length && name.startsWith(t)) return ziel;
        }
        return null;
    }

    // Der Katalog der Wörter, gestuft (die frühere Stufe gewinnt; in einer Stufe das erste in Katalog-Reihenfolge, ein
    // Art- oder Studio-Wort mit zwei Arten fällt als mehrdeutig weg):
    //   (1) Bauplan-Namen, die Rezept-ids mit ihrem Träger, der Name hinter einem Art-Präfix (`baum_eiche` → „eiche", auch
    //       bei kaltem Buch);
    //   (2) die Namen der Werke: das Kopf-Wort des Rezept-`lab` und des Träger-Labels (vor „·"/„—": „Feuerstelle",
    //       „Ziehbrunnen", „Alemannisch", „Kristall-Geode");
    //   (3) die Art-Wörter des Art-Gesetzes: der Präfix-Stamm („baum", „haus", „fahrzeug") und der Stamm des Spenders,
    //       der kein eigener Bauplan ist („fahrzeug_wagen" → „wagen") → das erste Werk der Art;
    //   (4) die Studio-Namen, deren Kompositum-Kopf ein Art-Wort ist („Fachwerkhaus" → das erste Haus).
    // Der Träger eines Rezepts: eine Art MIT Präfix nur über ihr Präfix — ein Tor-Wort fällt nie auf das welt_-Portal
    // derselben Gestalt (ein echtes Tor mit Trigger, kein Bauwerk); sonst der Bauplan, der seine Gestalt trägt (die
    // Ausstattung: feuerstelle → glutbrunnen), sonst der erste Bauplan seiner Studio-Art (`_foundryPresetForEntry`: der
    // Fels). Eine Art mit Werk-Verb (KIND_POLICY `werk`: die Gattung, der Körper, der Klang) hat keinen Bauplan — ihr Rezept
    // ist sein eigenes Werk-Ziel (KI K2: vorher war „Wolf", „Lofi", „Mensch" kein Wort der Welt). Gemerkt je Buch und
    // Bauplan-Zahl. { stufen: [Map Wort → Werk-Ziel] ×4, artVon: Werk-Ziel → Art, woerter }.
    _studioWortKatalog() {
        const bps = this.state.blueprints || {};
        const f = this._foundry;
        const recipes = f && f.recipes ? f.recipes : {};
        const ids = Object.keys(recipes);
        const namen = Object.keys(bps).sort();
        const alt = this._wortKatalogMerker;
        if (alt && alt.recipes === recipes && alt.nRez === ids.length && alt.nBp === namen.length) return alt;
        const KP = AnazhRealm.KIND_POLICY;
        const falte = AnazhRealm._wortFalten;
        const kopf = (label) =>
            String(label || "")
                .split(/\s[·—(]|\s-\s/)[0]
                .split(/[^A-Za-zÄÖÜäöüß]+/)
                .filter((x) => x.length >= 3)
                .map(falte);
        const istTor = (n) => !bps[n] || bps[n].role === "portal";
        const label = (t) => (bps[t] ? bps[t].label : recipes[t] && recipes[t].lab);
        const nachArt = {};
        for (const n of namen) {
            if (istTor(n) || bps[n]._foundryAutoSpecies) continue;
            const pr = this._foundryPresetForEntry({ type: n });
            if (pr && !nachArt[pr]) nachArt[pr] = n;
        }
        const traeger = {};
        const artVon = {};
        for (const id of ids) {
            const rec = recipes[id];
            const pol = rec && KP[rec.kind];
            let t = null;
            if (pol && pol.prefix) t = bps[pol.prefix + id] ? pol.prefix + id : null;
            else if (pol && pol.werk) t = id;
            else if (rec)
                t =
                    namen.find((n) => !istTor(n) && bps[n].studioGestalt === id && !bps[n]._foundryAutoSpecies) ||
                    nachArt[id] ||
                    null;
            if (!t) continue;
            traeger[id] = t;
            if (!artVon[t]) artVon[t] = rec.kind;
        }
        const stufen = [new Map(), new Map(), new Map(), new Map()];
        const setze = (s, wort, ziel) => {
            if (wort && ziel && !stufen[s].has(wort)) stufen[s].set(wort, ziel);
        };
        // Die sagbaren Wörter (Prompt und Absage): [Wort, Nennung] — Art- und Studio-Wörter zuerst, dann die Werke.
        const gross = (w) => w.charAt(0).toUpperCase() + w.slice(1);
        const nennWoerter = [];
        const werkWoerter = [];
        // (1)
        for (const n of namen) setze(0, n, n);
        for (const id of ids)
            if (traeger[id]) {
                setze(0, falte(id), traeger[id]);
                const lab = String(label(traeger[id]) || id).split(/\s[·—(]/)[0];
                werkWoerter.push([falte(id), lab]);
            }
        for (const k of Object.keys(KP)) {
            const px = KP[k].prefix;
            if (!px) continue;
            for (const n of namen)
                if (n.startsWith(px) && !istTor(n)) {
                    setze(0, n.slice(px.length), n);
                    if (!artVon[n]) artVon[n] = k;
                }
        }
        // (2)
        for (const id of ids) {
            const t = traeger[id];
            if (t) for (const w of [...kopf(recipes[id].lab), ...kopf(label(t))]) setze(1, w, t);
        }
        // (3) und (4): ein Wort, das zwei Arten benennt, fällt (Spender „tor_basis"/„haus_basis" → „basis").
        const eindeutig = (s, paare) => {
            const arten = new Map();
            for (const [w, t] of paare) {
                if (!arten.has(w)) arten.set(w, new Set());
                arten.get(w).add(artVon[t]);
            }
            for (const [w, t] of paare)
                if (arten.get(w).size === 1 && !stufen[s].has(w)) {
                    setze(s, w, t);
                    nennWoerter.push([w, gross(w)]);
                }
        };
        const erstes = {};
        for (const id of ids) if (traeger[id] && !erstes[recipes[id].kind]) erstes[recipes[id].kind] = traeger[id];
        const artPaare = [];
        for (const k of Object.keys(KP)) {
            const px = KP[k].prefix;
            const ziel = erstes[k] || (px ? namen.find((n) => n.startsWith(px) && !istTor(n)) : null);
            if (!ziel) continue;
            if (px) artPaare.push([px.replace(/_+$/, ""), ziel]);
            const sp = KP[k].donor;
            if (typeof sp === "string" && !bps[sp]) artPaare.push([sp.split("_").pop(), ziel]);
        }
        eindeutig(2, artPaare);
        // (4) Ein Studio-Name, dessen Kopf (der letzte Teil des Kompositums) ein Art-Wort ist, ist ein Werk dieser Art:
        // „Fachwerkhaus" ist ein Haus. „Anatomie", „Porta", „Phytogenesis" benennen keine Art und bleiben stumm.
        const studioPaare = [];
        for (const wdef of Object.values(AnazhRealm.WORLD_REGISTRY))
            for (const w of kopf(wdef && wdef.label))
                for (const [art, ziel] of stufen[2])
                    if (w.length > art.length && w.endsWith(art)) studioPaare.push([w, ziel]);
        eindeutig(3, studioPaare);
        const woerter = [...nennWoerter, ...werkWoerter];
        this._wortKatalogMerker = { recipes, nRez: ids.length, nBp: namen.length, stufen, artVon, woerter };
        return this._wortKatalogMerker;
    }

    // Die lebenden Wörter, gruppiert je Art (KI-Prompt und die Absage eines unbekannten Worts): aus dem EINEN Wort-Katalog —
    // nie ein Wort, das die Welt nicht bauen kann. `nennen` = wie der Spieler sie liest („Fachwerkhaus", „Eiche"), sonst
    // die Wörter des Programms („fachwerkhaus", „eiche") samt den Reglern der Art aus dem Vertrag (PARAMS_BY_KIND, wie das
    // Buch sie bringt: id Name min–max — dieselben Zeilen klemmt der Stempel, KI K2).
    _studioWordsForPrompt(nennen = false) {
        const PBK = (this._foundry && this._foundry.paramsByKind) || {};
        const { GRUPPE, gruppen: paare } = this._studioWortGruppen();
        const gruppen = {};
        for (const [art, ps] of Object.entries(paare))
            gruppen[art] = [...new Set(ps.map(([w, nennung]) => (nennen ? nennung : w)))];
        const kappe = nennen ? 5 : 8;
        const regler = (a) =>
            !nennen && Array.isArray(PBK[a]) && PBK[a].length
                ? ` (Regler: ${PBK[a].map((d) => `"${d.id}" ${d.min}–${d.max} ${d.lab}`).join(", ")})`
                : "";
        return Object.keys(GRUPPE)
            .filter((a) => gruppen[a] && gruppen[a].length)
            .map(
                (a) =>
                    `${GRUPPE[a]}: ${gruppen[a].slice(0, kappe).join(", ")}${gruppen[a].length > kappe ? " …" : ""}${regler(a)}`
            )
            .join(" · ");
    }

    // Die lebenden Wörter je benannter Art aus dem EINEN Wort-Katalog: { GRUPPE: {art: Name}, gruppen: {art: [[wort, nennung], …]} }
    // — der Prompt nennt sie, die Antwort-Form der Welt-KI (`_kiAntwortSchema`) erlaubt GENAU sie, je Art mit ihren Reglern.
    _studioWortGruppen() {
        const K = this._studioWortKatalog();
        const GRUPPE = {
            tree: "Bäume",
            rock: "Stein",
            haus: "Häuser",
            gate: "Tore",
            vehicle: "Fahrzeuge",
            ausstattung: "Ausstattung",
            weapon: "Klingen",
            flower: "Blumen",
            grass: "Gras",
            kreatur: "Tiere",
            koerper: "Gestalt des Spielers",
            klang: "Musik der Welt",
        };
        // eine Art, deren Wirts-Zeile ihr Gesetzbuch bringt (B7, `_kindPolicyVereinen`), heißt, wie das Buch sie nennt —
        // ohne sie fiel jedes Wort einer neuen Art still aus dem Prompt (studios.K5: die KI kannte das neunte Buch nie)
        const KP = AnazhRealm.KIND_POLICY;
        for (const a of Object.keys(KP)) if (KP[a].kern && !GRUPPE[a]) GRUPPE[a] = KP[a].substanz.label;
        const gruppen = {};
        for (const [w, nennung] of K.woerter) {
            const ziel = this._studioBlueprintForWord(w);
            const art = ziel && K.artVon[ziel];
            if (GRUPPE[art]) (gruppen[art] = gruppen[art] || []).push([w, nennung]);
        }
        // `ziele`: JEDES Wort, das der Katalog genau auflöst (alle Stufen, die frühere gewinnt — „hirsch" ist sagbar über
        // das Werk), je Art seines Werk-Ziels
        const ziele = {};
        const gesehen = new Set();
        for (const stufe of K.stufen)
            for (const [w, ziel] of stufe) {
                if (gesehen.has(w)) continue;
                gesehen.add(w);
                const art = K.artVon[ziel];
                if (GRUPPE[art]) (ziele[art] = ziele[art] || []).push(w);
            }
        return { GRUPPE, gruppen, ziele };
    }

    // Das Werk-Verb eines Werk-Ziels (`_studioBlueprintForWord`): "wesen" · "praegung" (KIND_POLICY `werk` der Art eines
    // Rezepts ohne Bauplan) oder null — ein Bauplan wird gebaut oder wächst.
    _studioWerkVerb(name) {
        if (this.state.blueprints && this.state.blueprints[name]) return null;
        const rec = this._foundry && this._foundry.recipes ? this._foundry.recipes[name] : null;
        const pol = rec && AnazhRealm.KIND_POLICY[rec.kind];
        return (pol && pol.werk) || null;
    }

    // Der Pflanz-Abstand je Bauplan: Bäume/Stein eng (ein Hain), Häuser/Tore/Fahrzeuge
    // mit Luft (Kind aus dem Rezeptbuch über das Preset).
    _studioSpawnAbstand(name) {
        const f = this._foundry;
        // der EINE Entry-Resolver (studioGestalt eingeschlossen: die Ausstattung löst über ihren Bauplan auf)
        const preset = this._foundryPresetForEntry({ type: name });
        const rec = preset && f && f.recipes ? f.recipes[preset] : null;
        const kind = rec ? rec.kind : name.startsWith("baum_") ? "tree" : null;
        if (kind === "haus" || kind === "gate" || kind === "vehicle") return 9;
        if (kind === "ausstattung") return 4;
        return 2.5;
    }

    // Foundry-Preset EINES Eintrags — die EINE Auflösung für den Platzier-Pfad. Gewachsene Bäume (Typ
    // `grown_<art>_v<idx>`, nicht im Map) lösen über `entry._lodSpecies` (= `baum_eiche` …); Fels/
    // Kristall/Blume ohne LOD-Spezies über den direkten Typ.
    _foundryPresetForEntry(entry) {
        if (!entry) return null;
        if (typeof entry._lodSpecies === "string") {
            const p = this._foundryPresetFor(entry._lodSpecies);
            if (p) return p;
        }
        if (typeof entry.type === "string") {
            const p = this._foundryPresetFor(entry.type);
            if (p) return p;
            // Fallback: grown-Präfix + Variante/LOD abstreifen (`grown_baum_eiche_v0[_lodN]` → `baum_eiche`),
            // sonst verfehlt der Preset-Map-Lookup den Eintrag und die Foundry serviert nichts.
            const m = entry.type.match(/^grown_(baum_[a-z]+)/);
            if (m) {
                const gp = this._foundryPresetFor(m[1]);
                if (gp) return gp;
            }
            // Formations-Varianten (`kristall_var7`/`fels_var3`) verfehlen den exakten Lookup → Suffix abstreifen:
            // Kristall → das EINE Rezept `kristalle`; Fels nach Form-Klasse (brocken→findling · geroell→geroell ·
            // nadel→zacken · stapel→sediment, sonst sediment); Instanz-Variation: `_foundryVariantFor(seed, preset)`.
            const vm = entry.type.match(/^(kristall|fels)_var\d+$/);
            if (vm) {
                if (vm[1] === "kristall") return "kristalle";
                const bp = this.state.blueprints && this.state.blueprints[entry.type];
                const fc = bp && bp._formClass;
                return (
                    { brocken: "findling", geroell: "geroell", nadel: "zacken", stapel: "sediment" }[fc] || "sediment"
                );
            }
            // Gestalt-Wechsel als DATEN: trägt der Bauplan eine `studioGestalt`-Zeile (welt_portal → "geisttor")
            // und steht sie im LIVE-Buch, serviert das Studio die Render-Schicht; die Parts bleiben unsichtbare
            // Substanz (Tags · blockerAABBs · Portal-Trigger). Generisch, kein welt_-Literal. Unbekannte Gestalt/
            // Foundry aus → null → Part-Pfad; kaltes Buch → null, und der Eintrag wartet kalt (`_rebuildArchitectureMesh`).
            if (typeof this._foundryEnabled === "function" && this._foundryEnabled()) {
                const gbp = this.state.blueprints && this.state.blueprints[entry.type];
                if (gbp && typeof gbp.studioGestalt === "string") {
                    const gf = this._foundry;
                    if (gf && gf.recipes && Object.prototype.hasOwnProperty.call(gf.recipes, gbp.studioGestalt)) {
                        return gbp.studioGestalt;
                    }
                }
            }
        }
        return null;
    }
    // DER VERTRAG EINES FREMDEN STEMPELS (teilen-sicher): ein studioOv aus fremder Hand (Code, Mitspieler) trägt nur, was der
    // Kern seiner Art als Regler ausweist — jede Zeile von PARAMS_BY_KIND[kind] als Zahl in ihrem Band [min, max], dazu die
    // Charakter-Achse (`KIND_CHARAKTER`) als genau EINE Zeile ihrer Tafel. Die Kerne lesen ov per Object.assign(P, ov): ein
    // Schlüssel außerhalb schriebe ein inneres Bau-Feld. null = trägt; sonst der Grund beim Namen (regler:<id> · band:<id> ·
    // buch, kaltes Buch). Leser: spawn_blueprint (Slot 6, die Engstelle fremder Stempel) und `empfangeWerk` vor jedem Schreiben.
    _ovVertrag(name, ov) {
        if (ov == null) return null;
        if (typeof ov !== "object" || Array.isArray(ov)) return "regler:form";
        const f = this._foundry;
        if (!f || !f.ready || !f.recipes || !f.paramsByKind) return "buch";
        const preset = this._foundryPresetForEntry({ type: name });
        const kind = preset && f.recipes[preset] ? f.recipes[preset].kind : null;
        const zeilen = new Map(((kind && f.paramsByKind[kind]) || []).map((z) => [z.id, z]));
        const wort = (k) =>
            String(k)
                .replace(/[^\w.-]/g, "?")
                .slice(0, 32);
        const rest = [];
        for (const k of Object.keys(ov)) {
            const z = zeilen.get(k);
            const v = ov[k];
            if (!z) rest.push(k);
            else if (typeof v !== "number" || !Number.isFinite(v) || v < z.min || v > z.max) return "band:" + wort(k);
        }
        if (!rest.length) return null;
        const achse = kind && AnazhRealm.KIND_CHARAKTER[kind];
        const tafel = achse && globalThis[achse.ns] ? globalThis[achse.ns][achse.tabelle] : null;
        const soll = tafel ? Object.keys(tafel).map((n) => achse.ov(n, tafel)) : [];
        const traegt = (s) => Object.keys(s).length === rest.length && rest.every((k) => k in s && ov[k] === s[k]);
        if (soll.some(traegt)) return null;
        // benannt wird der Schlüssel, den keine Zeile der Achse kennt, sonst der erste (eine Zeile, die die Tafel nicht trägt)
        return "regler:" + wort(rest.find((k) => !soll.some((s) => k in s)) || rest[0]);
    }
    // Impostort das Preset (Fernstufe = Billboard statt L2-Geometrie)? Daten in zwei Schichten: (a) das
    // Studio klassifiziert (`PRESETS[id].kind` via `f.recipes`), (b) KIND_POLICY-Zeile `impostor: true`
    // sagt, welche kind-Klasse (tree, shrub, gate, vehicle; sonst fail-closed keine Karte). Vor dem Ingest
    // Fallback auf die bekannten Baum-Presets (die Liste wächst bewusst nicht).
    _foundryPresetIsTree(preset) {
        const f = this._foundry;
        const rec = f && f.recipes && f.recipes[preset];
        if (rec && typeof rec.kind === "string") {
            const pol = AnazhRealm.KIND_POLICY[rec.kind];
            return !!(pol && pol.impostor === true);
        }
        return (
            preset === "eiche" ||
            preset === "fichte" ||
            preset === "tanne" ||
            preset === "birke" ||
            preset === "weide" ||
            preset === "mammut" ||
            preset === "strauch"
        );
    }
    // Stufen-Klammer je Art (`PORTAL_RENDER_CONFIG.lod.kindStages`): größte deklarierte Stufe ≤ Wunsch,
    // sonst die kleinste; ohne Deklaration der Wunsch (wie die Distanz-Klammer in _foundryFlattenFor).
    // Die deklarierten Stufen einer Art (kindStages ihres Rezept-kinds) oder null.
    _foundryKindStages(preset) {
        const f = this._foundry;
        const rec = f && f.recipes ? f.recipes[preset] : null;
        const cfg = AnazhRealm._studioRenderConfig && AnazhRealm._studioRenderConfig.lod;
        const st = rec && cfg && cfg.kindStages ? cfg.kindStages[rec.kind] : null;
        return Array.isArray(st) && st.length ? st : null;
    }
    // Eine NUR-WURF-Stufe (B2 Stufe 3, S3 haus: `nurWurf`) wird nie gezeigt — sie wirft für die Art (B2c `schatten`) und
    // trägt die Fernform. Die Klammer überspringt sie: kein Distanz-Wunsch serviert sie als Anzeige.
    _foundryDeclaredStage(preset, wish) {
        const st = this._foundryKindStages(preset);
        if (!st) return wish;
        let sv = null;
        for (let i = 0; i < st.length; i++) {
            if (this._foundryNurWurf(preset, st[i])) continue;
            if (sv === null || st[i] <= wish) sv = st[i];
        }
        return sv === null ? AnazhRealm._kernPflichtBruch("phyto:lod.kindStages (" + preset + ": nur nurWurf)") : sv;
    }
    // Die NUR-WURF-Stufe einer Art mit Fernform "huelle" — sie trägt die Liste (`__fern`). Fehlt sie, bricht die Art.
    _foundryFernStufe(preset) {
        const st = this._foundryKindStages(preset) || [];
        for (const s of st) if (this._foundryNurWurf(preset, s)) return s;
        return AnazhRealm._kernPflichtBruch("phyto:lod.budget (" + preset + ": fernform huelle ohne nurWurf-Stufe)");
    }
    // Ist die Stufe einer Art eine NUR-WURF-Stufe (B2c `lod.budget[kind][stufe].nurWurf`)? Der EINE Leser.
    _foundryNurWurf(preset, stufe) {
        const f = this._foundry;
        const rec = f && f.recipes ? f.recipes[preset] : null;
        return rec ? AnazhRealm._budgetNurWurf(rec.kind, stufe) : false;
    }
    static _budgetNurWurf(kind, stufe) {
        const L = AnazhRealm._studioRenderConfig && AnazhRealm._studioRenderConfig.lod;
        const art = L && L.budget ? L.budget[kind] : null;
        return !!(art && art[stufe] && art[stufe].nurWurf === true);
    }
    // DAS BUDGET je Art × Stufe (Studio-Vertrag B2c, `PORTAL_RENDER_CONFIG.lod.budget`, live): der EINE Host-Leser des
    // Wurfs. `schatten` = die Stufe, deren Gestalt wirft (die eigene, eine andere = Schatten-Zwilling, false = keine).
    // Fail-closed (KERN-PFLICHT): ein Buch ohne Budget, eine Art ohne Budget, eine Budget-Art ohne die gelieferte
    // Stufe, ein Wurf auf eine nicht gelieferte Stufe. Seit W8 trägt JEDE Art mit Gestalt ihr Budget (foundry-core und
    // die sechs Zweit-Kerne, gemergt am Ingest) — die Wirt-Stufen-Tafel für Arten ohne Zeile ist gefallen.
    _foundryBudgetZeile(preset, stufe) {
        const f = this._foundry;
        const rec = f && f.recipes ? f.recipes[preset] : null;
        const L = AnazhRealm._studioRenderConfig && AnazhRealm._studioRenderConfig.lod;
        if (!rec || !L || !L.budget) return AnazhRealm._kernPflichtBruch("phyto:lod.budget (" + preset + ")");
        const art = L.budget[rec.kind];
        if (!art) return AnazhRealm._kernPflichtBruch("phyto:lod.budget." + rec.kind);
        const z = art[stufe];
        const w = z ? z.schatten : undefined;
        // Ein Zwilling (w ≠ stufe) muss selbst werfen — sonst kreiste der Zwillings-Zug (B2c-Validator: dieselbe Regel).
        if (!(w === false || (Number.isInteger(w) && art[w] && (w === stufe || art[w].schatten === w))))
            return AnazhRealm._kernPflichtBruch("phyto:lod.budget." + rec.kind + "[" + stufe + "].schatten");
        return z;
    }
    // DIE STUFEN-GRENZEN EINER GEBAUTEN ART aus dem Gesetz des Schirms (lod.K5, `_wechselAbstand`): je gezeigter Stufe der
    // Abstand (Meter × Welt-Skala des Eintrags), an dem ihr Kanten-Versatz zur L0 das Soll trägt, höchstens ihr Haushalt; die
    // Hysterese des Buchs (B2c `hyst`, sonst LOD_SCHIRM.hyst) — der LOD-Takt wählt nach IHNEN (`_stufeNachGrenzen`), Haus, Tor
    // und Ausstattung am selben Gesetz (bis w3v-lod: das Tor nach `ab` seines Buchs, das Haus nach den rohen Baum-Distanzen).
    // → { erste, grenzen: [{ stufe, ab }], h } oder null: eine Karten-Art (KIND_POLICY `impostor`: Baum, Strauch, Wagen) wechselt,
    // wo ihre Maske blendet — an den Schwellen der Bäume (`_stufenSchirm`, der Wagen in rohen Metern, Sichthöhe 0); eine eigene
    // Zeile wäre ein Zwilling der Maske (der Wagen auf L1 ab 3,1 m, seine Maske zeigte die L0 bis 12 m). Am Eintrag gemerkt, je
    // Schirm (die Art eines Eintrags wechselt nie).
    _archStufenGrenzen(entry) {
        const zeilen = this._schirm().hoehe;
        if (entry._stufenGrenzen !== undefined && entry._stufenGrenzenZeilen === zeilen) return entry._stufenGrenzen;
        const preset = this._foundryEnabled() ? this._foundryPresetForEntry(entry) : null;
        const f = this._foundry;
        const rec = preset && f && f.recipes ? f.recipes[preset] : null;
        if (!rec) return null; // das Buch lädt: noch kein Urteil, der nächste Takt fragt neu
        const L = AnazhRealm._studioRenderConfig && AnazhRealm._studioRenderConfig.lod;
        const art = L && L.budget ? L.budget[rec.kind] : null;
        const st = this._foundryKindStages(preset) || [];
        const grenzen = [];
        const karte = AnazhRealm.KIND_POLICY[rec.kind];
        for (const s of karte && karte.impostor === true ? [] : st.slice(1)) {
            if (art && art[s] && art[s].nurWurf === true) continue;
            const ab = this._wechselAbstand(rec.kind, s, 1);
            if (ab != null) grenzen.push({ stufe: s, ab });
        }
        entry._stufenGrenzenZeilen = zeilen;
        const h = art && Number.isFinite(art.hyst) ? art.hyst : AnazhRealm.LOD_SCHIRM.hyst;
        entry._stufenGrenzen = grenzen.length ? { erste: st[0], grenzen, h } : null;
        return entry._stufenGrenzen;
    }
    // Ist die Stufe der Zwilling einer anderen Stufe ihrer Art (B2c `schatten`: Baum L0 → L1)? Dann wirft sie über die
    // Zwillings-Leaves (`_foundryFlattenFor`: EIN Werfer je Gestalt), nie über ihre Teile.
    _foundryWurfQuelle(preset, lod) {
        const st = this._foundryKindStages(preset);
        if (!st) return false;
        for (const s of st) if (s !== lod && this._foundryBudgetZeile(preset, s).schatten === lod) return true;
        return false;
    }
    // DIE FERNFORM einer Art (B2c `lod.budget[kind].fernform`): "karte" · "gesetz" · "boden" · "huelle" — was die Art
    // jenseits der Nah-Grenze IST (`_streuFernBahn`). Der Zellen-Chokepoint (`_scatterMaterializeCell`) liest sie VOR jedem
    // Mesh-Zug. Fail-closed: eine gestreute Art ohne gültige Fernform ist ein KERN-PFLICHT-Bruch, nie ein stilles L0.
    // "huelle" (S3, N5): die Liste der Stufe 3 des Gesetzbuchs (Beipack `__fern`, der Leser `_huelleVon`) — der gesetzte Bau
    // zeichnet sie im Welt-March (`_archFoundryZiegel`); ein Leser, der sie nicht trägt, bricht (KERN-PFLICHT).
    _foundryFernForm(preset) {
        const f = this._foundry;
        const rec = f && f.recipes ? f.recipes[preset] : null;
        const L = AnazhRealm._studioRenderConfig && AnazhRealm._studioRenderConfig.lod;
        const art = rec && L && L.budget ? L.budget[rec.kind] : null;
        const fern = art ? art.fernform : null;
        if (fern === "gesetz" || fern === "boden" || fern === "karte" || fern === "huelle") return fern;
        return AnazhRealm._kernPflichtBruch("phyto:lod.budget." + (rec ? rec.kind : preset) + ".fernform");
    }
    // DIE EINE HÜLLEN-FORM (docs/studio-vertrag.md N5, S3): `{ stufe, teile: [{ art: "box" | "keil" | "kapsel", c, h | a, b,
    // r, first ("+x" · "-x" · "+z" · "-z", der Keil), walm (0..1), farbe (linear), rolle: "fest" | "sicht" | "wurf" | "beide" }] }`,
    // asset-lokal. Der EINE Leser: die Teile EINER Rolle — "fest" die Kollision, "sicht" das Fernbild, "beide" zählt für
    // beide; "wurf" liest hier niemand (das Teil wirft nur: die NUR-WURF-Stufe ist die ganze Liste, das Tor 1110-9) —, fail-closed geprüft (eine kaputte Hülle ist ein KERN-PFLICHT-Bruch mit Quelle, nie still leer). null: keine
    // Hülle.
    static _huelleVon(h, rolle, quelle) {
        if (!h) return null;
        const bruch = (was) => AnazhRealm._kernPflichtBruch((quelle || "huelle") + " (Hüllen-Form: " + was + ")");
        if (!Array.isArray(h.teile)) return bruch("teile");
        const v3 = (v) =>
            Array.isArray(v) &&
            v.length === 3 &&
            Number.isFinite(v[0]) &&
            Number.isFinite(v[1]) &&
            Number.isFinite(v[2]);
        const out = [];
        for (const t of h.teile) {
            if (!t || !(t.rolle === "fest" || t.rolle === "sicht" || t.rolle === "wurf" || t.rolle === "beide"))
                return bruch("rolle");
            if (t.art === "box" || t.art === "keil") {
                if (!v3(t.c) || !v3(t.h)) return bruch(t.art + " c/h");
                if (t.art === "keil" && AnazhRealm.HUELLE_KEIL_TYP[t.first] == null) return bruch("keil first");
                if (t.walm != null && !(t.walm >= 0 && t.walm <= 1)) return bruch("keil walm");
            } else if (t.art === "kapsel") {
                if (!v3(t.a) || !v3(t.b) || !(t.r > 0)) return bruch("kapsel a/b/r");
            } else return bruch("art " + t.art);
            if (t.rolle !== rolle && t.rolle !== "beide") continue;
            if (rolle === "sicht" && !v3(t.farbe)) return bruch("farbe");
            out.push(t);
        }
        return out;
    }
    // Die Teile einer Hülle als Welt-March-Defs (`_weltKapselHolen`): Kasten, Keil (Typ 2..5 = First +z · −z · +x · −x, der
    // Walm im Bruchteil), Kapsel — die Farbe linear wie jedes Mesh.
    static _huelleMarchDefs(teile) {
        const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
        const F = (a) => ({ r: a[0], g: a[1], b: a[2] });
        return teile.map((t) =>
            t.art === "kapsel"
                ? { a: V(t.a), b: V(t.b), r: t.r, farbe: F(t.farbe) }
                : t.art === "keil"
                  ? {
                        prism: true,
                        keilTyp: AnazhRealm.HUELLE_KEIL_TYP[t.first],
                        walm: t.walm || 0,
                        c: V(t.c),
                        h: V(t.h),
                        farbe: F(t.farbe),
                    }
                  : { box: true, c: V(t.c), h: V(t.h), farbe: F(t.farbe) }
        );
    }
    // DIE EINE NAH-GRENZE der Streu-Fernform (Schöpfer-Wort 30.09.: „AAA nah, nicht Kapseln"): die Fernform einer Art
    // (gesetz · boden) gilt mit Fern-Wunsch erst ab `ANALOG_NAH_M` — diesseits trägt ihr Studio-Mesh (die Stufen-Klammer
    // serviert die Art, Fels sein L0, die Blume ihre L2, Gras seine Stufe). null = die Mesh-Bahn, auch für "karte" (Baum, Strauch).
    // Leser: der Zellen-Chokepoint (`_scatterMaterializeCell`), der Bahnwechsel des LOD-Ticks und die Gestalt-Gleichheit
    // — EINE Grenze für Tier, Bau und Streu, kein zweites Maß (W1 las bis 05.10. Welt-d1 + Hysterese, 29,4 m).
    _streuFernBahn(preset, lod, dist) {
        if (!(lod >= 2) || !(dist >= AnazhRealm.ANALOG_NAH_M)) return null;
        const fern = this._foundryFernForm(preset);
        return fern === "karte" ? null : fern;
    }

    // Die ZELLE einer (Art, Gestalt[, ov]) im EINEN Karten-Atlas (`_impostorAtlas`): null = die Geometrie für den
    // Rahmen lädt (Null-Renderer), false = gescheitert (der Aufrufer serviert Geometrie), sonst die Zelle. Mit echtem
    // Renderer entsteht sie rahmenlos und reiht ihren Bake sofort ein — Rahmen und Pixel liefert die Schicht; keine
    // Körper-Stufe wird für die Karte gezogen. `wer` (optional, K38-N2): ein Wartender { wo, wecke(zusage) } — er bekommt
    // den Zug der Rahmen-Stufe und stellt ihn in seinen Rang.
    _foundryEnsureImpostorRecord(preset, variant, ov, wer) {
        const at = this._impostorAtlas();
        if (!at) return null;
        // BÄCKER-OV (V18.478) — ein GEPRÄGTES Entry (ov) trägt seine eigene Zelle: Schlüssel und Bake tragen den
        // ov-Hash (die EINE _studioOvHash-Quelle). Keine Saison: die Karte ist Golden-Sommer, das Jahr färbt der Stoff.
        const ovK = ov && typeof ov === "object" ? ov : null;
        const key = "fimp:" + this._foundryKartenKey(preset, variant, ovK);
        const da = at.zellen.get(key);
        if (da) return da.gescheitert ? false : da;
        const rendR = this.state && this.state.renderer;
        if (rendR && !rendR._isHeadlessNull) {
            this._scatterRefillPending = true;
            return this._impostorZelleNeu(at, key, preset, variant, ovK);
        }
        // Der Null-Renderer bäckt nie: der Rahmen der Zelle kommt aus der L1-Geometrie (fehlt sie: EINMAL anfordern)
        // bzw. der deklarierten Stufe der Art (Tor gate=[0] aus L0) — Höhe box.max.y (Anker Stammbasis), Breite der
        // radiale Vertex-Scan, Formel in phyto-core (__phytoCore.scanRadialXZ / impostorFrame, wie der Studio-Bäcker).
        const bakeLod = this._foundryDeclaredStage(preset, 1);
        const gkey = this._foundryKoerperKey(preset, variant, bakeLod, ovK);
        const group = this._foundryCacheGet(gkey);
        if (group === undefined) {
            if (!this._ensureAssetFoundry()) return null;
            const zug = this._foundryZug(gkey, preset, variant, bakeLod, ov, wer ? wer.wo : undefined, {
                nach: (ok) => {
                    if (ok) {
                        this._scatterRefillPending = true;
                        // Im Ankunfts-Moment die Zelle anlegen (Cache-Hit → Rahmen) — sonst entsteht sie erst beim
                        // nächsten zufälligen Leser.
                        this._foundryEnsureImpostorRecord(preset, variant, ov || undefined);
                    }
                    this._foundryRewarmColdTrees();
                },
            });
            if (wer) wer.wecke(zug);
            return null; // die Geometrie lädt (der Aufrufer lässt L2 kalt)
        }
        const z = this._impostorZelleNeu(at, key, preset, variant, ovK);
        if (group === null || !group.children || !group.children.some((c) => c.geometry && c.material)) {
            this._karteEndet(z, false); // Foundry kann das nicht → Aufrufer nimmt Geometrie
            return false;
        }
        const box = new THREE.Box3().setFromObject(group);
        let rad2 = 0.25;
        const core = globalThis.__phytoCore;
        group.traverse((o) => {
            if (o.isMesh && o.geometry && o.geometry.attributes && o.geometry.attributes.position)
                rad2 = core.scanRadialXZ(o.geometry.attributes.position.array, rad2);
        });
        z.frame = core.impostorFrame(Math.max(1, box.max.y), Math.sqrt(rad2));
        this._scatterRefillPending = true;
        return z;
    }
    // L2 — die Studio-Karte als HISM-Flat: das Einheits-Quad des Atlas mit dem EINEN Karten-Material, Schicht und
    // Rahmen der Zelle reisen je Instanz. Gecacht auf der Zelle. null solange der Rahmen lädt, false bei Fehler oder —
    // mit echtem Renderer — bis die Schicht gebacken ist (der Aufrufer serviert Geometrie, die Stufen-Klammer).
    // `wer` (optional, K38-N2): ein Wartender { wo, wecke(zusage) } — die Werkstatt-Vorschau. Liefert die Karte noch nichts,
    // bekommt er die EINE Zusage, auf die sie wartet (das Buch, der Zug ihrer Höhen-Stufe, ihr Bake), und `wo` ist sein
    // Rang in Schlange und Karten-Takt; ohne Zusage kann die Karte nicht kommen. Die Welt ruft ohne `wer` (ihr Tick baut nach).
    _foundryBuildImpostorFlat(entry, preset, wer) {
        const variant = this._foundryGestaltFor(entry, preset);
        if (variant == null) {
            if (wer && this._foundry) wer.wecke(this._foundry.buchDa);
            return null; // Buch kalt — L2 kalt, der Tick baut nach
        }
        // Ein geprägtes Entry zieht seine ov-Zelle; ist sie noch nicht da (null), fällt der Pfad auf GEOMETRIE (nie
        // kalt, nie die ungeprägte Karte). Ungeprägt: ovE null.
        const ovE = this._artifactStudioOv(entry);
        const z = this._foundryEnsureImpostorRecord(preset, variant, ovE || undefined, ovE ? undefined : wer);
        if (z === null) return ovE ? false : null; // geprägt+backend → Geometrie · sonst L2 kalt
        if (!z) return false;
        // Bedarf-Stempel für den Karten-Takt (nah zuerst): die kleinste Distanz² eines wartenden Lesers zum Spieler — der
        // Eintrag an seinem Ort, der Wartende in seinem Rang (`_foundryAuftragD2`, ohne Ort ∞).
        if (!z.gebacken) {
            const d2 = this._foundryAuftragD2(wer ? wer.wo : entry && (entry.position || entry.wo));
            if (!(z._bedarfD2 <= d2)) z._bedarfD2 = d2;
        }
        // Mit echtem Renderer trägt die Karte erst gebacken: bis dahin liefert der Flatten für die Baum-Fernstufe NICHTS
        // (false), nie Geometrie — nah trägt die Wunsch-Stufe, fern wartet der Baum (ein Karten-Ding hat keinen Satz).
        // Headless/Null-Renderer trägt der Rahmen aus der L1-Geometrie (dort bäckt nie einer).
        const rendB = this.state && this.state.renderer;
        if (!z.gebacken && rendB && !rendB._isHeadlessNull) {
            if (wer) wer.wecke(z.ende);
            this._streuWartetAuf(z.ende); // die streuende Region wartet auf ihre Karte (K60-2)
            return false;
        }
        if (z._flat) return z._flat;
        // Die Karte blendet nach DERSELBEN Sichthöhe wie ihre 3D-Stufen (das Studio: die Karten-Instanz trägt bh, die
        // Sichthöhe des echten Baums): die Höhe der Höhen-Stufe aus dem Höhen-Buch, je Slot × Instanz-Skala gestempelt
        // (|aKarte.w|) — nie die Rahmen-Höhe des Bakes (sie wich bis ~2 % + Bake-Rand ab). Unbekannt: die Karte wartet.
        const hz = this._foundryBaumHoehe(preset, entry, wer);
        if (hz == null) return null;
        // PARITÄT: der Rahmen ist TEMPLATE-lokal → dieselbe Template→Welt-Übersetzung wie die 3D-Stufen
        // (localMatrix), sonst wäre der ferne Baum ⅓ so groß wie sein nahes Pendant (LOD-Pop beim Übergang).
        const leaf = this._impostorLeaf(z, this._foundryWorldScaleMatrix(preset), hz);
        if (!leaf) return false;
        z._flat = { instanceable: true, reason: "foundry-impostor", foundry: true, lod: 2, leaves: [leaf] };
        return z._flat;
    }
    // ═══ DER FLÄCHEN-SPLAT (die EINE Splat-Wurzel aller drei Bäcker) ═══
    // Rastert DREIECKE statt Vertices (ein Vertex-Splat lässt die meisten Oberflächen-Voxel leer → Matsch
    // im March): je Dreieck ~2 Proben je Voxel-Fläche (goldene 2D-Folge, kein Math.random), Farbe
    // barycentrisch; das Proben-Budget skaliert proportional über die Gesamt-Fläche. Indexlose Soups =
    // (i, i+1, i+2); Riesen-Meshes tasten im Schritt ab und wichten hoch. randArt: "klemm" (Default) |
    // "skip" (Teil-Box-Bakes: Proben außerhalb fallen).
    _feldFlaechenSplat(daten, d, bbMin, sx, sy, sz, geo, col, mc, m, sollProben, randArt) {
        const pos = geo && geo.attributes && geo.attributes.position;
        if (!pos || pos.count < 3) return;
        const idx = geo.index || null;
        const triN = Math.floor((idx ? idx.count : pos.count) / 3);
        if (triN < 1) return;
        const A = this._ffsA || (this._ffsA = new THREE.Vector3());
        const B = this._ffsB || (this._ffsB = new THREE.Vector3());
        const C = this._ffsC || (this._ffsC = new THREE.Vector3());
        const kx = d / sx;
        const ky = d / sy;
        const kz = d / sz;
        const schrittT = triN > 40000 ? Math.ceil(triN / 40000) : 1;
        // Pass 1: Gesamt-Fläche in Voxel² (der Proportional-Faktor braucht sie).
        let gesamtFl = 0;
        for (let t = 0; t < triN; t += schrittT) {
            const i0 = idx ? idx.getX(t * 3) : t * 3;
            const i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1;
            const i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
            A.fromBufferAttribute(pos, i0);
            B.fromBufferAttribute(pos, i1);
            C.fromBufferAttribute(pos, i2);
            if (m) {
                A.applyMatrix4(m);
                B.applyMatrix4(m);
                C.applyMatrix4(m);
            }
            const ux = (B.x - A.x) * kx;
            const uy = (B.y - A.y) * ky;
            const uz = (B.z - A.z) * kz;
            const wx = (C.x - A.x) * kx;
            const wy = (C.y - A.y) * ky;
            const wz = (C.z - A.z) * kz;
            const cxp = uy * wz - uz * wy;
            const cyp = uz * wx - ux * wz;
            const czp = ux * wy - uy * wx;
            gesamtFl += Math.sqrt(cxp * cxp + cyp * cyp + czp * czp) * 0.5 * schrittT;
        }
        if (!(gesamtFl > 0)) return;
        const f = Math.min(2.5, (sollProben || d * d * 24) / gesamtFl);
        // Pass 2: säen.
        for (let t = 0; t < triN; t += schrittT) {
            const i0 = idx ? idx.getX(t * 3) : t * 3;
            const i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1;
            const i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
            A.fromBufferAttribute(pos, i0);
            B.fromBufferAttribute(pos, i1);
            C.fromBufferAttribute(pos, i2);
            if (m) {
                A.applyMatrix4(m);
                B.applyMatrix4(m);
                C.applyMatrix4(m);
            }
            const ax = (A.x - bbMin.x) * kx;
            const ay = (A.y - bbMin.y) * ky;
            const az = (A.z - bbMin.z) * kz;
            const bx = (B.x - bbMin.x) * kx;
            const by = (B.y - bbMin.y) * ky;
            const bz = (B.z - bbMin.z) * kz;
            const cx = (C.x - bbMin.x) * kx;
            const cy = (C.y - bbMin.y) * ky;
            const cz = (C.z - bbMin.z) * kz;
            const ux = bx - ax;
            const uy = by - ay;
            const uz = bz - az;
            const wx = cx - ax;
            const wy = cy - ay;
            const wz = cz - az;
            const cxp = uy * wz - uz * wy;
            const cyp = uz * wx - ux * wz;
            const czp = ux * wy - uy * wx;
            const fl = Math.sqrt(cxp * cxp + cyp * cyp + czp * czp) * 0.5 * schrittT;
            const n = Math.min(128, Math.max(1, Math.round(fl * f)));
            let c0r = 0.55,
                c0g = 0.5,
                c0b = 0.45,
                c1r = 0.55,
                c1g = 0.5,
                c1b = 0.45,
                c2r = 0.55,
                c2g = 0.5,
                c2b = 0.45;
            if (col) {
                c0r = col.getX(i0);
                c0g = col.getY(i0);
                c0b = col.getZ(i0);
                c1r = col.getX(i1);
                c1g = col.getY(i1);
                c1b = col.getZ(i1);
                c2r = col.getX(i2);
                c2g = col.getY(i2);
                c2b = col.getZ(i2);
            } else if (mc) {
                c0r = c1r = c2r = mc.r;
                c0g = c1g = c2g = mc.g;
                c0b = c1b = c2b = mc.b;
            }
            for (let s2 = 0; s2 < n; s2++) {
                let u = ((s2 + 0.5) * 0.7548776662) % 1;
                let w2 = ((s2 + 0.5) * 0.5698402909) % 1;
                if (u + w2 > 1) {
                    u = 1 - u;
                    w2 = 1 - w2;
                }
                const q0 = 1 - u - w2;
                const px = ax * q0 + bx * u + cx * w2;
                const py = ay * q0 + by * u + cy * w2;
                const pz = az * q0 + bz * u + cz * w2;
                if (randArt === "skip" && (px < 0 || px >= d || py < 0 || py >= d || pz < 0 || pz >= d)) continue;
                const vx = Math.min(d - 1, Math.max(0, px | 0));
                const vy = Math.min(d - 1, Math.max(0, py | 0));
                const vz = Math.min(d - 1, Math.max(0, pz | 0));
                const oI = (vz * d * d + vy * d + vx) * 4;
                // Gekoppelte Akkumulation: rgb UND alpha wachsen im selben 90er-Schritt und stoppen zusammen am
                // Alpha-Deckel → rgb/alpha ist auf jeder Füllstufe exakt die Albedo (sonst sättigt rgb gegen Weiß).
                if (daten[oI + 3] < 255) {
                    daten[oI] = Math.min(255, daten[oI] + (c0r * q0 + c1r * u + c2r * w2) * 90);
                    daten[oI + 1] = Math.min(255, daten[oI + 1] + (c0g * q0 + c1g * u + c2g * w2) * 90);
                    daten[oI + 2] = Math.min(255, daten[oI + 2] + (c0b * q0 + c1b * u + c2b * w2) * 90);
                    daten[oI + 3] = Math.min(255, daten[oI + 3] + 90);
                }
            }
        }
    }

    // Die WELT-PLATZIERUNGS-MATRIX eines Eintrags aus seiner Transform allein
    // (position mit −0.5-baseY wie _rebuildArchitectureMesh · rotationY · scale)
    // — so kann eine DEDUP-Instanz platziert werden, OHNE ihr Mesh zu bauen.
    _archWeltMatrix(entry) {
        const p = entry.position || { x: 0, y: 0, z: 0 };
        const baseY = Number.isFinite(p.y) ? p.y - 0.5 : 0;
        const s = Number.isFinite(entry.scale) ? entry.scale : 1;
        const q = new THREE.Quaternion().setFromAxisAngle(
            this._archUp || (this._archUp = new THREE.Vector3(0, 1, 0)),
            entry.rotationY || 0
        );
        return new THREE.Matrix4().compose(new THREE.Vector3(p.x || 0, baseY, p.z || 0), q, new THREE.Vector3(s, s, s));
    }

    // ═══ DIE ARCH-BAHN: Bau = BOX-SATZ ═══
    // Key `aarch:type:variant` (mit studioOv `…:ov:<hash>`, ohne ov byte-alt), Dedup über gleiche Vorlage.
    // Payload = die Hülle des Gesetzbuchs (Studio-Dinge mit fernform "huelle", `_archFoundryZiegel`), sonst _archBoxFit
    // (bis 24 AABB-Boxen im Vorlagen-Raum).
    // Voxel-Bricks fail-closed; das Mesh ist nur unsichtbarer Interaktions-Körper. Bake getaktet.
    _archZiegelFern(entry) {
        const st = this.state;
        if (st.renderer && st.renderer._isHeadlessNull) return false;
        // Ein Karten-Ding hat keinen Satz: fern IST es seine Karte (`_archKartenPreset`, B2c `fernform`).
        if (this._archKartenPreset(entry)) {
            this._archZiegelTod(entry);
            return false;
        }
        if (entry._ziegelSlot) {
            // Der Slot zeichnet, außer in der Mesh-Zone über dem stehenden Mesh — dieselbe Regel wie der Culling-Tick.
            // Vorher schaltete dieser Ruf jeden Takt AN und der Culling-Tick gleich wieder AUS (je Takt jede Seite der
            // Mesh-Zone schmutzig) — der Schwund begann so jeden Takt von vorn und endete nie (gemessen 04.10.: 197
            // Sätze dauerhaft „schwindend").
            this._weltFeldAktiv(entry._ziegelSlot, !(entry._ziegelNah && this._archIsRendered(entry)));
            return false;
        }
        if (entry._ziegelGebacken) return false; // endgültig aufgegeben (8 Versuche / Erschöpfung)
        const wm = this._weltMarchEnsure();
        const ov =
            entry.studioOv && typeof entry.studioOv === "object" && !Array.isArray(entry.studioOv)
                ? entry.studioOv
                : null;
        const ovH = ov ? `:ov:${this._studioOvHash(ov)}` : "";
        // Foundry-Naht: ein gesetztes Studio-Ding ohne Karte (Fels, Kristall) passt aus der Foundry-Flat, NIE aus
        // einem temporär gebauten Async-Mesh (leer → nach 8 Versuchen ausgebrannt → für immer unsichtbar). „Lädt
        // noch" verbrennt weder Versuch noch Bake-Takt.
        const fPreset = this._archFoundryPreset(entry);
        if (fPreset) return this._archFoundryZiegel(entry, fPreset, ovH);
        const key = `aarch:${entry.type}:${entry._lodVariantIndex || 0}${ovH}`;
        if (!(wm && wm.kapselCache.has(key)) && !this._weltBakeErlaubt(this._archZiegelD2(entry))) return false; // Fit-Takt
        const M = this._archWeltMatrix(entry);
        let fitWar = "hit";
        const einblenden = entry._ziegelNah === undefined; // fern entstanden (nie in der Mesh-Zone): die Geburt blendet ein
        const handle = this._weltKapselSpawn(
            key,
            M,
            () => {
                // Ein Bau ohne Studio-Vorlage (der Grammatik-Bau): die Vorlage EINMAL bauen + LOKAL passen (relativ zu M⁻¹).
                // Das Studio-Haus trägt seine Fernform selbst (die Hülle des Gesetzbuchs, oben `_archFoundryZiegel`).
                const hatte = this._archIsRendered(entry);
                if (!hatte) this._rebuildArchitectureMesh(entry); // temporärer Bau NUR für den Erst-Fit
                const inv = M.clone().invert();
                const defs = entry.mesh ? this._archBoxFit(entry.mesh, inv) : null;
                if (!hatte && this._archIsRendered(entry)) this._cullArchitectureMesh(entry);
                fitWar = defs && defs.length ? "gepasst" : "leer";
                return defs;
            },
            einblenden
        );
        if (handle) {
            entry._ziegelGebacken = true; // genau EIN Eintrag je Bau
            entry._ziegelSlot = handle;
            return true;
        }
        if (fitWar === "leer") {
            // ASYNC-Foundry: der temporäre Bau war beim ersten Tick noch leer —
            // begrenzt wiederversuchen statt den Einmal-Schuss verbrennen.
            entry._ziegelVersuche = (entry._ziegelVersuche || 0) + 1;
            if (entry._ziegelVersuche >= 8) entry._ziegelGebacken = true;
            return true;
        }
        entry._ziegelGebacken = true; // Erschöpfung (Kapsel-Liste voll) — kein Rückweg
        return true;
    }

    // Welche Foundry-Vorlage trägt diesen gesetzten Bau? null = kein Studio-Ding (S3 haus: auch das Haus ist eines — seine
    // Fernform ist die Hülle des Gesetzbuchs, `_archFoundryZiegel`). Ohne Rezeptbuch zählt die Vorlage trotzdem: der Eintrag wartet
    // auf die Flat (nie Rückfall auf einen Temporär-Mesh-Fit). Die Vorlage liest der EINE Leser
    // `_foundryPresetForEntry` (Basis-Art `_lodSpecies`, grown-Präfix): `entry.type` allein verfehlte die
    // Wald-Varianten (`grown_busch_hazel_v2`) — sie fielen in den Temporär-Bau-Fit, der für Foundry-
    // INSTANZEN nie passt (kein entry.mesh): je Versuch Slots belegen + freigeben, die Region-Bundles nahmen
    // in allen Pässen neu auf (gemessen 04.10., echte GPU, Mess-Wiese: Hasel bei 125 m, 9 Bau/Cull in 4 s).
    _archFoundryPreset(entry) {
        const typ = entry && typeof entry.type === "string" ? entry.type : "";
        if (!typ || !this._foundryEnabled()) return null;
        return this._foundryPresetForEntry(entry) || null;
    }

    // Ist dieser gesetzte Eintrag ein KARTEN-DING — ist seine Fernform die Studio-Karte? Die EINE Quelle ist das
    // Gesetzbuch (B2c `lod.budget[kind].fernform`, der Leser `_foundryFernForm`): "karte" tragen Baum und Strauch;
    // Tor und Fahrzeug tragen "gesetz" (porta-core, vehicle-core: jenseits der Nah-Grenze der Box-Satz) — bis zur
    // Integration 05.10. las diese Frage KIND_POLICY.impostor (kalt eine feste Namensliste), und Tor wie Fahrzeug
    // verschwanden jenseits des Karten-Horizonts. Ein Karten-Ding trägt fern seine Karte und nie einen Analog-Satz
    // (`tickArchitectureCulling`, `_archZiegelFern`). Das Preset oder null; ohne Buch kein Urteil (null).
    // Der Culling-Scan fragt JEDEN Eintrag je Frame: die Antwort steht am Eintrag, gültig solange Typ und Buch dieselben
    // sind (das Buch wechselt einmal, kalt → geladen; der Typ nur auf dem Grammatik-Stufen-Weg) — transient, nie im
    // Snapshot.
    _archKartenPreset(entry) {
        if (!this._foundryEnabled()) return null;
        const buch = (this._foundry && this._foundry.recipes) || null;
        if (!buch) return null;
        if (entry._kartenBuch === buch && entry._kartenTyp === entry.type) return entry._kartenPreset;
        const preset = this._foundryPresetForEntry(entry);
        // Eine Art ohne Budget-Zeile (Klang) trägt keine Fernform — kein Karten-Ding; jede mit Budget fragt den Leser
        // (fail-closed: ein Budget ohne Fernform bricht laut).
        const rec = preset ? buch[preset] : null;
        const L = AnazhRealm._studioRenderConfig && AnazhRealm._studioRenderConfig.lod;
        const mitBudget = !!(rec && L && L.budget && L.budget[rec.kind]);
        entry._kartenPreset = mitBudget && this._foundryFernForm(preset) === "karte" ? preset : null;
        entry._kartenBuch = buch;
        entry._kartenTyp = entry.type;
        return entry._kartenPreset;
    }

    // DER KARTEN-HORIZONT eines Karten-Dings (m): jedes zieht seinen eigenen Rand in [outerM − Saum, outerM] aus seinem
    // Samen — der gesetzte Wald dünnt über den Saum aus, kein Ring poppt, und keine Karte dithert. Befund Integration
    // 05.10.: der Horizont-Schwund der Welle (eine Distanz-Blende 352–384 m in der Karten-Maske, für JEDE Karte des
    // Atlas) ließ jeden Baum, der im Band STAND, dauerhaft halb durchsichtig — am Grat der Mess-Wiese Geister, und die
    // ganze Streu dort mit. Die Streu hat ihren eigenen Rand (`_scatterRegion`, outerM ab dem Erzeugungs-Ort).
    _archKartenHorizont(entry) {
        const u = this._pcg2d(entry.seed >>> 0, AnazhRealm.KARTEN_HORIZONT_SALZ) / 4294967296;
        return AnazhRealm.SCATTER.outerM - AnazhRealm.KARTEN_HORIZONT_SAUM_M * u;
    }

    // Foundry-Fit eines gesetzten Studio-Dings ohne Karte (Fels, Kristall): der Box-Satz (_archBoxFit) über eine
    // transiente Gruppe aus den Flat-Leaves (nie in der Szene). Karten-Dinge erreichen ihn nie (`_archZiegelFern`).
    // Flat lädt noch → warten OHNE Versuch/Bake-Takt; `false` → aufgegeben. Gestempelt (ovH): eigener Satz.
    // DIE FERNFORM "huelle" (S3, N5): der Satz IST die Liste der NUR-WURF-Stufe des Gesetzbuchs (Beipack `__fern`, der Leser
    // `_huelleVon`) — kein Fit im Wirt; fehlt die Liste, bricht die Art (KERN-PFLICHT), nie ein Box-Fit-Rückfall.
    _archFoundryZiegel(entry, preset, ovH) {
        const wm = this._weltMarchEnsure();
        if (!wm) return false;
        const variant = this._foundryGestaltFor(entry, preset);
        if (variant == null) return false; // Buch kalt — der nächste Tick fragt wieder, nichts verbrannt
        const huelle = this._foundryFernForm(preset) === "huelle";
        const stufe = huelle ? this._foundryFernStufe(preset) : 1;
        const key = `aarch:${entry.type}:f${variant}${ovH}`;
        let bf = null;
        if (!wm.kapselCache.has(key)) {
            bf = this._foundryFlattenFor(entry, preset, stufe);
            if (bf === false) {
                entry._ziegelGebacken = true;
                return true;
            }
            if (!bf || !bf.instanceable || !Array.isArray(bf.leaves) || !bf.leaves.length || bf.lod === 2) return false; // lädt noch — der nächste Tick fragt wieder, nichts verbrannt
            if (huelle && !bf.fern)
                return AnazhRealm._kernPflichtBruch("fachwerk:__fern (" + preset + ", Stufe " + stufe + ")");
            // DER FIT-TAKT ZÄHLT FITS (sk5-haus, Gebot 7): die Hülle ist die Liste des Gesetzbuchs, kein Fit im Wirt — sie
            // kostet, was ein Treffer kostet, und wartet nie am Takt. Bis sk5-haus wartete das erste Haus des kleinen Dorfs
            // (nH 12, Hülle in 234 m, Flat vorgebacken) hinter den näheren Fits der Streu auf die zweite Fenster-Hälfte
            // (GTX 562 ms; am Dorf antwortete der Takt 49 ja / 1 210 nein).
            if (!huelle && !this._weltBakeErlaubt(this._archZiegelD2(entry))) return false; // Fit-Takt (Treffer sind frei)
        }
        const einblenden = entry._ziegelNah === undefined; // fern entstanden (nie in der Mesh-Zone): die Geburt blendet ein
        const handle = this._weltKapselSpawn(
            key,
            this._archWeltMatrix(entry),
            () => {
                if (huelle)
                    return AnazhRealm._huelleMarchDefs(
                        AnazhRealm._huelleVon(bf.fern, "sicht", "fachwerk:__fern (" + preset + ")")
                    );
                const g = new THREE.Group();
                for (const lf of bf.leaves) {
                    if (!lf || !lf.geom) continue;
                    const m = new THREE.Mesh(lf.geom, lf.mat);
                    m.matrixAutoUpdate = false;
                    if (lf.localMatrix) m.matrix.copy(lf.localMatrix);
                    g.add(m);
                }
                return this._archBoxFit(g, new THREE.Matrix4());
            },
            einblenden
        );
        if (handle) {
            entry._ziegelGebacken = true;
            entry._ziegelSlot = handle;
            return true;
        }
        // Fit leer ODER Kapsel-Liste voll: begrenzt wiederversuchen (die Flat war da).
        entry._ziegelVersuche = (entry._ziegelVersuche || 0) + 1;
        if (entry._ziegelVersuche >= 8) entry._ziegelGebacken = true;
        return true;
    }

    // DER BOX-FIT: je Kind-Mesh eine Box (lokale AABB im Vorlagen-Raum) mit
    // Material-/Vertex-Mittel-Farbe; Instanz-Kinder fassen ihre ganze
    // Population in EINE Box (erste Ordnung). Die 24 größten tragen.
    _archBoxFit(gruppe, wurzelInv) {
        if (!gruppe || typeof THREE === "undefined") return null;
        gruppe.updateMatrixWorld(true);
        const v = this._abfV || (this._abfV = new THREE.Vector3());
        const mL = new THREE.Matrix4();
        const mI = new THREE.Matrix4();
        const kand = [];
        gruppe.traverse((o) => {
            if (!o.isMesh && !o.isInstancedMesh) return;
            const g = o.geometry;
            const pos = g && g.attributes && g.attributes.position;
            if (!pos || !pos.count) return;
            const col = g.attributes.color || null;
            const mc = !col && o.material && o.material.color ? o.material.color : null;
            const bb = new THREE.Box3();
            bb.makeEmpty();
            let fr = 0,
                fg = 0,
                fb = 0,
                fn = 0;
            const schritt = pos.count > 2000 ? Math.ceil(pos.count / 2000) : 1;
            const proj = (m) => {
                for (let i = 0; i < pos.count; i += schritt) {
                    bb.expandByPoint(v.fromBufferAttribute(pos, i).applyMatrix4(m));
                    if (col) {
                        fr += col.getX(i);
                        fg += col.getY(i);
                        fb += col.getZ(i);
                        fn++;
                    } else if (mc) {
                        fr += mc.r;
                        fg += mc.g;
                        fb += mc.b;
                        fn++;
                    }
                }
            };
            if (o.isInstancedMesh) {
                const n = Math.max(1, o.count | 0);
                for (let k2 = 0; k2 < n; k2++) {
                    o.getMatrixAt(k2, mI);
                    mI.premultiply(o.matrixWorld).premultiply(wurzelInv);
                    proj(mI);
                }
            } else {
                mL.multiplyMatrices(wurzelInv, o.matrixWorld);
                proj(mL);
            }
            if (bb.isEmpty()) return;
            const c = bb.getCenter(new THREE.Vector3());
            const h = bb.getSize(new THREE.Vector3()).multiplyScalar(0.5);
            kand.push({
                box: true,
                c,
                h,
                farbe: fn ? { r: fr / fn, g: fg / fn, b: fb / fn } : null,
                vol: Math.max(1e-6, h.x) * Math.max(1e-6, h.y) * Math.max(1e-6, h.z),
            });
        });
        if (!kand.length) return null;
        kand.sort((p2, q2) => q2.vol - p2.vol);
        return kand.slice(0, 24);
    }

    // Das Feld stirbt mit seinem Eintrag (der Slot wird frei — kein Atlas-Leck).
    _archZiegelTod(entry) {
        if (!entry) return;
        if (!entry._ziegelSlot) return;
        this._weltFeldFrei(entry._ziegelSlot);
        entry._ziegelSlot = null;
    }

    // (Die Oktanten-Zerlegung der Voxel-Ära fiel mit dem Schöpfer-Wort
    // „analog!" — der Bau ist sein Box-Satz, _archBoxFit ist die Naht.)

    // Gestalt-Kapsel-Fit der Gesetz-Streu (Fels, Blume): je Teil eine Kapsel im Vorlagen-Raum (größte Ausdehnung =
    // Achse, Neben-Halbachsen = Radius, Material-/Vertex-Farbe), kompakte Teile als Ellipsoid; die 6 volumen-größten
    // Teile tragen die Gestalt. (Der Baum-Satz aus Grammatik-Kegeln und Kronen-Lappen fiel 05.10.: ein Baum ist fern
    // seine Karte, `_archKartenPreset`.)
    _gestaltKapselFit(teile) {
        const v = this._bkfV || (this._bkfV = new THREE.Vector3());
        const kand = [];
        for (const lf of teile) {
            if (!lf || !lf.geom || !lf.geom.attributes || !lf.geom.attributes.position) continue;
            const pos = lf.geom.attributes.position;
            const col = lf.geom.attributes.color || null;
            const mc = !col && lf.mat && lf.mat.color ? lf.mat.color : null;
            const bb = new THREE.Box3();
            bb.makeEmpty();
            let fr = 0,
                fg = 0,
                fb = 0,
                fn = 0;
            const schritt = pos.count > 2000 ? Math.ceil(pos.count / 2000) : 1;
            for (let i = 0; i < pos.count; i += schritt) {
                v.fromBufferAttribute(pos, i);
                if (lf.localMatrix) v.applyMatrix4(lf.localMatrix);
                bb.expandByPoint(v);
                if (col) {
                    fr += col.getX(i);
                    fg += col.getY(i);
                    fb += col.getZ(i);
                    fn++;
                } else if (mc) {
                    fr += mc.r;
                    fg += mc.g;
                    fb += mc.b;
                    fn++;
                }
            }
            if (bb.isEmpty()) continue;
            const c = bb.getCenter(new THREE.Vector3());
            const h = bb.getSize(new THREE.Vector3()).multiplyScalar(0.5);
            const farbe = fn ? { r: fr / fn, g: fg / fn, b: fb / fn } : null;
            const vol = h.x * h.y * h.z;
            const hmin = Math.min(h.x, h.y, h.z);
            const hmax = Math.max(h.x, h.y, h.z);
            // Kompakt (ein Stein, ein Blütenkopf): Ellipsoid statt AABB-Kapsel
            if (hmin > 1e-6 && hmax / hmin <= 2.2) {
                kand.push({
                    ellipsoid: true,
                    c,
                    h: new THREE.Vector3(Math.max(0.01, h.x), Math.max(0.01, h.y), Math.max(0.01, h.z)),
                    farbe,
                    vol,
                });
                continue;
            }
            let ax = "x";
            if (h.y > h[ax]) ax = "y";
            if (h.z > h[ax]) ax = "z";
            const nb = ["x", "y", "z"].filter((kk) => kk !== ax);
            const r = Math.max(0.02, (h[nb[0]] + h[nb[1]]) * 0.5);
            const lang = Math.max(0, h[ax] - r);
            const a = c.clone();
            a[ax] -= lang;
            const b = c.clone();
            b[ax] += lang;
            kand.push({
                a,
                b,
                r,
                farbe,
                vol,
            });
        }
        if (!kand.length) return null;
        kand.sort((p, q) => q.vol - p.vol);
        return kand.slice(0, 6);
    }

    // (Der GLIED-BÄCKER der Voxel-Ära fiel mit dem Schöpfer-Wort „analog!" —
    // die Kreatur-Glieder sind Kapsel-GESETZE, _gliedKapselFit ist die Naht.)

    // DIE GLIEDER DER GESTALT — EINE Quelle für Fern-Bild UND Treffer (Welle L 06.10.): jedes Mesh gehört seinem
    // nächsten artikulierten Anker (die Gruppen, die _animateTierBaum rotiert; die Tier-Haut zerfällt je dominantem
    // Bone), Mini-Gruppen verschmelzen in den Eltern-Anker, Deckel 12 je Tier. Die Grobstufe (`_gelenk.fern`) zählt NIE
    // (Doppel-Körper). Liefert { gruppen: Map(Anker → {meshes, verts}), wurzel, gattung } oder null.
    _kreaturGliederGruppen(cr) {
        const tb = cr.userData && cr.userData._tierBaum;
        const anker = new Set();
        if (tb && tb.teile) for (const k in tb.teile) if (tb.teile[k] && tb.teile[k].isObject3D) anker.add(tb.teile[k]);
        const wurzel = (tb && tb.wrap) || cr;
        anker.add(wurzel);
        const gruppen = new Map();
        const ankerVon = (start) => {
            let a = start;
            while (a && a !== cr && !anker.has(a)) a = a.parent;
            return a && anker.has(a) ? a : wurzel;
        };
        const zuGruppe = (schluessel, o, n) => {
            let g = gruppen.get(schluessel);
            if (!g) gruppen.set(schluessel, (g = { meshes: [], verts: 0 }));
            g.meshes.push(o);
            g.verts += n;
        };
        // jede Lage der Zerlegung liest die RUHE der Gestalt (`_gestaltRuhe`), nie den laufenden Rahmen des Tiers
        const ruhe = this._gestaltRuhe(cr);
        cr.traverse((o) => {
            if (!o.isMesh || !o.geometry || !o.geometry.attributes || !o.geometry.attributes.position) return;
            const grob = cr.userData._gelenk ? cr.userData._gelenk.fern : null;
            for (let p = o; grob && p && p !== cr; p = p.parent) if (p === grob) return; // die Grobstufe wäre der Doppel-Körper
            // Das Fell ist kein Leib (K28): die Glieder (Treffer, Biss, Fern-Bild) passen auf Haut und starre Teile — die
            // Schalen und Strähnen über ihnen trügen ihre Länge in jedes Volumen (der Biss reichte um das Kopf-Fell weiter).
            const kl = o.userData && o.userData.__klasse;
            if (typeof kl === "string" && (kl === "fellSchale" || kl.indexOf("straehne") === 0)) return;
            // Die Tier-Haut (V18.497) ist EIN SkinnedMesh über alle Glieder: je Vertex zählt der dominante
            // Bone (skinIndex[0] trägt das größte Gewicht) — die Haut zerfällt in Glied-Stücke, deren
            // matrixWorld (Bone · boneInverse · bindMatrix) den Bind-Raum starr an die LAUFENDE Pose hängt.
            const si = o.isSkinnedMesh && o.skeleton ? o.geometry.attributes.skinIndex : null;
            if (si) {
                const pa = o.geometry.attributes.position;
                // Die Farbe reist mit dem Stück: die Tier-Haut trägt ihre Albedo als Vertex-Farbe (Material weiß,
                // colorNode) — ein Stück nur aus Positionen fiel im Fit auf das Material-Weiß (gemessen 04.10. an
                // der Mess-Wiese: alle Glieder von Fuchs, Reh und Bär 255,255,255 — die weiße Wurst am Boden).
                const ca = o.geometry.attributes.color || null;
                const proBone = new Map();
                for (let i = 0; i < pa.count; i++) {
                    const b = si.getX(i);
                    let l = proBone.get(b);
                    if (!l) proBone.set(b, (l = []));
                    l.push(i);
                }
                for (const [b, liste] of proBone) {
                    const bone = o.skeleton.bones[b];
                    const inv = o.skeleton.boneInverses[b];
                    if (!bone || !inv) continue;
                    const arr = new Float32Array(liste.length * 3);
                    const farr = ca ? new Float32Array(liste.length * 3) : null;
                    for (let n = 0; n < liste.length; n++) {
                        arr[n * 3] = pa.getX(liste[n]);
                        arr[n * 3 + 1] = pa.getY(liste[n]);
                        arr[n * 3 + 2] = pa.getZ(liste[n]);
                        if (farr) {
                            farr[n * 3] = ca.getX(liste[n]);
                            farr[n * 3 + 1] = ca.getY(liste[n]);
                            farr[n * 3 + 2] = ca.getZ(liste[n]);
                        }
                    }
                    const attribute = { position: new THREE.BufferAttribute(arr, 3) };
                    if (farr) attribute.color = new THREE.BufferAttribute(farr, 3);
                    const stueck = {
                        geometry: { attributes: attribute },
                        material: o.material,
                        matrixWorld: new THREE.Matrix4().multiplyMatrices(ruhe(bone), inv).multiply(o.bindMatrix),
                    };
                    zuGruppe(ankerVon(bone), stueck, liste.length);
                }
                return;
            }
            zuGruppe(
                ankerVon(o.parent),
                { geometry: o.geometry, material: o.material, matrixWorld: ruhe(o) },
                o.geometry.attributes.position.count
            );
        });
        if (gruppen.size === 0) return null;
        const zielVon = (a) => {
            let p = a === wurzel ? null : a.parent;
            while (p && p !== cr && !anker.has(p)) p = p.parent;
            return p && p !== cr && anker.has(p) ? p : wurzel;
        };
        const merge = (von, nach) => {
            const g = gruppen.get(von);
            let z = gruppen.get(nach);
            if (!z) gruppen.set(nach, (z = { meshes: [], verts: 0 }));
            z.meshes.push(...g.meshes);
            z.verts += g.verts;
            gruppen.delete(von);
        };
        for (const [a, g] of [...gruppen]) if (a !== wurzel && g.verts < 300 && gruppen.has(a)) merge(a, zielVon(a));
        while (gruppen.size > 12) {
            let kleinster = null;
            for (const [a, g] of gruppen)
                if (a !== wurzel && (!kleinster || g.verts < gruppen.get(kleinster).verts)) kleinster = a;
            if (!kleinster) break;
            merge(kleinster, zielVon(kleinster));
        }
        for (const [a, g] of gruppen) g.ruhe = ruhe(a);
        return { gruppen, wurzel, gattung: this._kreaturGattung(cr) };
    }

    // DIE RUHE DER GESTALT (K07): die Welt-Matrix jedes Knotens der Gestalt, wie die Gattung RUHT — jedes benannte Glied in
    // der Lage seiner Vorlage (der Ofen-Guss, den nie ein Gang bewegt: `_tierBaum.ruhe`), der Leib im Ursprung mit Größe 1,
    // alles andere in seiner eigenen Lage. Zerlegung und Kapsel-Passung (Treffer-Volumen, Fern-Bild) lesen sie, nie den
    // laufenden Rahmen: vorher passte der Fit am ERSTEN Tier seiner Gattung, wo und wie es gerade stand — mitten im Schritt
    // (verschmolzene Glieder trugen ihren Winkel, der Rumpf des Wolfs 0,18 Lab-Einheiten), an seiner Welt-Lage, in seiner
    // Größe —, und welches Tier zuerst kam, entschied die Bake-Uhr (performance.now). Der Biss liest diese Kapseln
    // (_kreaturMaul): der Jagd-Kreislauf schwankte bei gleichem Code von Lauf zu Lauf (gate:kreatur-takt gestalt). Die
    // laufende Pose bleibt unberührt — die Ruhe wird gerechnet, nie gestellt.
    _gestaltRuhe(cr) {
        const tb = cr.userData && cr.userData._tierBaum;
        const R = tb ? tb.ruhe : null;
        if (tb && !R) throw new Error("Gestalt ohne Ruhe: _tierBaum.ruhe fehlt (der EINE Bau ist _buildCreatureGroup)");
        const memo = new Map();
        const eins = new THREE.Matrix4();
        const welt = (n) => {
            if (!n || n === cr) return eins;
            let m = memo.get(n);
            if (m) return m;
            const v = R && n.name && tb.teile[n.name] === n && R[n.name] ? R[n.name] : n;
            m = new THREE.Matrix4().compose(v.position, v.quaternion, v.scale).premultiply(welt(n.parent));
            memo.set(n, m);
            return m;
        };
        return welt;
    }

    // DIE GATTUNG eines Tiers — Dedup Gattung×Glied (PFLICHT-OFFEN A): EINE kanonische Quelle für Fern-Satz, Treffer-
    // Volumen und Glied-Vorrat (_gliederBestellen) — gattung/recipe/preset, sonst TETRAPODA_SOUL_MAP[soul], sonst soul.
    _kreaturGattung(cr) {
        const ud = (cr && cr.userData) || {};
        const soul = ud.soul || "wesen";
        return (
            ud.gattung ||
            ud.recipe ||
            ud.preset ||
            (AnazhRealm.TETRAPODA_SOUL_MAP && AnazhRealm.TETRAPODA_SOUL_MAP[soul]) ||
            soul
        );
    }

    // Die Glied-Kapsel im Anker-Raum, EINMAL je Gattung × Glied gepasst (der Schlüssel des Fern-Satzes): das Fern-Bild
    // (_kreaturGliederBacken) und das Treffer-Volumen (_kreaturTrefferGlieder) lesen DIESELBE Passung — die Gruppe der
    // Zerlegung (_kreaturGliederGruppen) trägt ihre Stücke und ihren Anker in der Ruhe der Gestalt (`_gestaltRuhe`).
    _gliedKapselMemo(key, gruppe) {
        const memo = this._gliedKapseln || (this._gliedKapseln = new Map());
        if (memo.has(key)) return memo.get(key);
        const k = this._gliedKapselFit(gruppe.meshes, new THREE.Matrix4().copy(gruppe.ruhe).invert());
        memo.set(key, k);
        return k;
    }

    // Der Fern-Satz einer Kreatur: je Glied EINE Kapsel im Welt-March (Ganz oder gar nicht: reicht der Atlas nicht,
    // fällt das ganze Tier). Die Glieder liest er aus dem EINEN Namen-Memo der Gattung (`_gattungGlieder`): nur der Vorrat
    // zerlegt die Gestalt, einmal je Gattung — vorher zerlegte jeder Leib seine Haut neu (am Messort stadt jeder Bewohner,
    // der in den Fern-Kreis trat: `_kreaturGliederGruppen` 1,75 ms je Takt ab p95, Radeon echt).
    _kreaturGliederBacken(cr, einblenden) {
        const namen = this._gattungGlieder(cr);
        if (!namen) return null;
        // Analog-Import: das Glied wird KAPSEL (Achse + Radius + Farbe aus dem Skelett-Raum, ~32 Byte statt
        // 128 KB Brick), DEDUP je Gattung + Glied; jede Instanz posiert sie per eigener Knochen-Matrix. Der
        // March digitalisiert am Schirm; Voxel-Glieder-Bricks gibt es nicht mehr (kein Parallelpfad).
        const tb = cr.userData._tierBaum;
        const glieder = [];
        for (const nm of namen) {
            const a = nm.name ? tb && tb.teile && tb.teile[nm.name] : (tb && tb.wrap) || cr;
            if (!a) {
                for (const gl of glieder) this._weltFeldFrei(gl.handle);
                return null;
            }
            a.updateMatrixWorld(true);
            const key = nm.key;
            const handle = this._weltKapselSpawn(key, a.matrixWorld, () => this._gliedKapseln.get(key), einblenden);
            if (!handle) {
                for (const gl of glieder) this._weltFeldFrei(gl.handle);
                return null; // Erschöpfung: ganz oder gar nicht — kein halber Wolf
            }
            glieder.push({ teil: a, name: nm.name, handle });
        }
        return glieder.length ? glieder : null;
    }

    // DIE GLIEDER EINER GATTUNG (das EINE Namen-Memo `_trefferGliedNamen`, Fern-Satz und Treffer lesen es): je Glied der
    // Name seines Ankers ("" = die Wurzel) und der Schlüssel seiner Kapsel; jedes Tier löst nur die Namen an SEINEN Teilen
    // auf. Der Takt LIEST nur (Lehre 14): die Geburt hat den Vorrat bestellt (`spawnCreatureAt`); ist die Gattung noch kalt,
    // bestellt der Ruf ihn, zählt sich (`_gliederKalt`) und bekommt null — der Leib trägt bis dahin seinen Satz. Bis dorf-takt-z13
    // zerlegte der erste Leser die Gestalt im Takt: ein Fuchs, den das Bestands-Gesetz fern gebar, kostete die GTX im Dorf
    // `_gattungGlieder` 0,07–0,10 ms je Takt ab p95 (der Zug 13 hob den CPU-Takt 4,72 → 4,97 ms).
    _gattungGlieder(cr) {
        const namen = this._trefferGliedNamen && this._trefferGliedNamen.get(this._kreaturGattung(cr));
        if (namen) return namen;
        this._gliederKalt = (this._gliederKalt | 0) + 1;
        this._gliederBestellen(cr);
        return null;
    }

    // DER BAU DER GLIEDER (nur der Glied-Vorrat ruft ihn): die Zerlegung des Leibs (`_kreaturGliederGruppen`) und je Glied die
    // Passung (`_gliedKapselMemo`) — die Ruhe der Gestalt macht sie unabhängig davon, welches Tier zuerst kam. null: keine
    // Gestalt (nie gemerkt — ein Leib ohne Teile wird beim nächsten kalten Ruf neu bestellt).
    _gattungGliederBacken(cr) {
        const gattung = this._kreaturGattung(cr);
        const memo = this._trefferGliedNamen || (this._trefferGliedNamen = new Map());
        if (memo.has(gattung)) return memo.get(gattung);
        const G = this._kreaturGliederGruppen(cr);
        if (!G) return null;
        const namen = [];
        for (const [a, g] of G.gruppen) {
            const key = `kapsel:${G.gattung}:${a.name || "wurzel"}`;
            this._gliedKapselMemo(key, g);
            namen.push({ name: a === G.wurzel ? "" : a.name, key });
        }
        memo.set(gattung, namen);
        return namen;
    }

    // DER GLIED-VORRAT (Lehre 14 und 25): eine kalte Gattung wird im LEERLAUF des Haupt-Fadens gebaut (`_imLeerlauf`), EINE je
    // Fenster, die dem Spieler nächste zuerst, nie im Takt. `leib` ist ein Tier der Gattung oder der Name einer Seele — dann
    // baut der Vorrat einen Probe-Leib aus dem EINEN Bau (`_buildCreatureGroup`) und gibt ihn zurück. Der Ofen-Vorrat bestellt
    // so jede Gattung des Lebensraums, bevor ein Tier entsteht (`_ofenPrefetchKreaturen`); jede Geburt bestellt ihre Gattung
    // (`spawnCreatureAt` — lange bevor das Tier in Hieb-Reichweite kommt), jeder kalte Ruf eines Lesers den Rest.
    // Liefert das Versprechen der Glied-Namen.
    _gliederBestellen(leib) {
        const g = typeof leib === "string" ? AnazhRealm.TETRAPODA_SOUL_MAP[leib] : this._kreaturGattung(leib);
        const memo = this._trefferGliedNamen;
        if (memo && memo.has(g)) return Promise.resolve(memo.get(g));
        const Q = this._gliederAuftraege || (this._gliederAuftraege = new Map());
        let a = Q.get(g);
        if (!a) {
            Q.set(g, (a = { leib }));
            a.da = new Promise((fertig) => (a.fertig = fertig));
            if (Q.size === 1) this._imLeerlauf(() => this._gliederVorratTick(), 1000);
        }
        return a.da;
    }
    _gliederVorratTick() {
        const Q = this._gliederAuftraege;
        let [g, a, naechst] = [null, null, Infinity];
        for (const [k, x] of Q) {
            const d2 = typeof x.leib === "string" ? Infinity : this._spielerD2(x.leib.position.x, x.leib.position.z);
            if (!a || d2 < naechst) [g, a, naechst] = [k, x, d2];
        }
        if (!a) return;
        Q.delete(g);
        const seele = typeof a.leib === "string";
        let probe = null;
        try {
            // ohne Gestalt (der Bau meldet es laut, fail-closed) gibt es nichts zu zerlegen
            if (seele && (probe = this._buildCreatureGroup(a.leib)))
                Object.assign(probe.userData, { soul: a.leib, gattung: g });
            const leib = seele ? probe : a.leib;
            a.fertig(leib ? this._gattungGliederBacken(leib) : null);
        } finally {
            if (probe) this._disposeSoulGroup(probe);
            if (Q.size) this._imLeerlauf(() => this._gliederVorratTick(), 1000);
        }
    }

    // DAS TREFFER-VOLUMEN eines Tiers (Welle L 06.10., Befund K-D3): seine Glieder-Kapseln — dieselbe Passung wie
    // das Fern-Bild (_gliedKapselMemo), jede mit der Zone ihres Glieds (tetrapoda trefferZone). Die senkrechte Säule
    // 0,1 L…1,4 L war gattungs- und höhenblind (Hirsch L 0,64 flach 1 Treffer aus 10, hangab 2 aus 8). Die Glied-Liste
    // je Gattung entsteht EINMAL im Glied-Vorrat (`_gliederBestellen`, im Leerlauf, bestellt mit der Geburt); jedes Tier löst
    // nur die Namen an SEINEN Teilen auf. Ein Ruf gegen eine noch kalte Gattung bricht LAUT (`_bruchMelden`), nie still: bis
    // treffer-kalt übersprang jeder Leser das Tier, es war bis zur Frist des Leerlaufs unverwundbar und biss nicht. Die
    // laufende Pose trägt jeder Test über die Welt-Matrix des Ankers.
    _kreaturTrefferGlieder(cr) {
        const u = cr && cr.userData;
        if (!u) return null;
        // wer die Glieder eines RUHENDEN Leibs bekommt (K59), bekommt sie frisch: seine Wurzel hält den Szenen-Gang aus dem
        // Skelett, die Anker-Matrizen stünden sonst, wo die Ruhe begann (jeder Leser — Biss, Maul, Treffer, Tod)
        if (u._ruht === true) this._leibMatrix(cr);
        if (u._trefferGlieder !== undefined) return u._trefferGlieder;
        // KERN-PFLICHT (Welle L): ohne tetrapoda trefferZone gibt es kein Treffer-Volumen — ein lauter BRUCH wie im
        // Treffer-Urteil (_kampfUrteil), nie ein still je Tier gespeichertes null (jedes Wesen wäre unverwundbar).
        const tc = globalThis.__tetrapodaCore;
        if (!tc || typeof tc.trefferZone !== "function") AnazhRealm._kernPflichtBruch("tetrapoda:trefferZone");
        const tb = u._tierBaum;
        if (!tb) return (u._trefferGlieder = null); // kein Studio-Leib (nur _buildCreatureGroup baut einen): keine Gestalt
        const namen = this._gattungGlieder(cr);
        if (!namen) {
            this._bruchMelden(
                `TREFFER: die Gattung „${this._kreaturGattung(cr)}“ ist kalt — der Leib ist nicht treffbar`
            );
            return null; // bestellt, nie je Tier gespeichert
        }
        const liste = [];
        for (const nm of namen) {
            const anker = this._gliedAnker(cr, nm.name);
            const k = this._gliedKapseln && this._gliedKapseln.get(nm.key);
            if (!anker || !k) continue;
            liste.push({ anker, teil: nm.name, a: k.a, b: k.b, r: k.r, zone: tc.trefferZone(nm.name || "wolf") });
        }
        u._trefferGlieder = liste.length ? liste : null;
        return u._trefferGlieder;
    }

    // Der Anker eines Glieds der Gestalt: das benannte Teil des Studio-Leibs, die Wurzel ("") die Hülle. Der Treffer
    // (_kreaturTrefferGlieder) und der steckende Pfeil (_pfeilInsTier) fragen hier; null ohne Studio-Leib oder Teil.
    _gliedAnker(cr, teil) {
        const tb = cr && cr.userData && cr.userData._tierBaum;
        if (!tb) return null;
        return teil ? (tb.teile && tb.teile[teil]) || null : tb.wrap || cr;
    }

    // DAS GROB-TOR DES TREFFERS (Integration Welle L, Gesetz #0): kann eine Strecke, die waagrecht höchstens `spanne` um
    // (x, z) liegt, das Tier überhaupt erreichen? Es liest den EINEN Leib des Tiers (_kreaturLeib.reichweite — dieselbe
    // Größe, mit der das Tier gegen Hüllen und Wagen löst), nie ein eigenes Körpermaß; Klinge und Pfeil fragen HIER, bevor
    // die Gestalt (_kreaturGliedTreffer) richtet. Vorher schätzte jeder Treffer-Pfad den Leib selbst als 2 × Skala — ein
    // dritter Leib neben dem kreatur-Leib und der Gestalt.
    _trefferErreichbar(cr, x, z, spanne) {
        const leib = this._kreaturLeib(cr, 0, this._trefferLeib || (this._trefferLeib = {}));
        const r = spanne + leib.reichweite;
        const dx = cr.position.x - x;
        const dz = cr.position.z - z;
        return dx * dx + dz * dz <= r * r;
    }

    // DER TREFFER gegen die Gestalt: kleinste Distanz einer Strecke (die Klinge, der Pfeil-Flug) zu jeder Glied-Kapsel
    // des Tiers. Trifft sie (Abstand ≤ Strecken-Radius + Glied-Radius), liefert er das tiefste Glied: seine Zone
    // (der Rumpf teilt sich am Kopf — die Hälfte zum Kopf ist Brust, die andere Bauch) und den Strecken-Parameter s
    // des Kontakts (der Hebel der Klinge, der Ort im Flug) und `ein`, den Strecken-Parameter, an dem sie in dieses Glied
    // eintritt (der Strahl des Fadenkreuzes: der Punkt auf der Haut, _pickCreatureAtCrosshair), dazu `anker` und `teil` des
    // Glieds (der Pfeil steckt dort, _pfeilStecken). null = vorbei.
    // `flaeche` (Welle LF, Posten 2): ein Punkt der Haut (das Ziel unter dem Fadenkreuz) gehört dem Glied, auf dessen Fläche er
    // liegt — die Wahl nach |Abstand − Glied-Radius|, nie nach der Tiefe (die dicke Rumpf-Kapsel reicht in den Hals: der Kopf
    // eines Hirschs wäre Bauch).
    _kreaturGliedTreffer(cr, ax, ay, az, bx, by, bz, radius, flaeche = false) {
        const gl = this._kreaturTrefferGlieder(cr);
        if (!gl) return null;
        this._leibMatrix(cr);
        const v = this._trefferVek || (this._trefferVek = [new THREE.Vector3(), new THREE.Vector3()]);
        let best = null;
        let bestTiefe = Infinity;
        const lang = Math.hypot(bx - ax, by - ay, bz - az);
        for (const g of gl) {
            const pa = v[0].copy(g.a).applyMatrix4(g.anker.matrixWorld);
            const pb = v[1].copy(g.b).applyMatrix4(g.anker.matrixWorld);
            const rg = g.r * g.anker.matrixWorld.getMaxScaleOnAxis();
            const rr = radius + rg;
            const d2 = this._segSegDistSq(ax, ay, az, bx, by, bz, pa.x, pa.y, pa.z, pb.x, pb.y, pb.z);
            if (d2 > rr * rr) continue;
            const tiefe = flaeche ? Math.abs(Math.sqrt(d2) - rg) : Math.sqrt(d2) - rr;
            if (tiefe >= bestTiefe) continue;
            bestTiefe = tiefe;
            const st = this._segSegST;
            let zone = g.zone;
            if (zone === "rumpf") {
                // Brust oder Bauch: der Kontakt auf der Rumpf-Achse, gemessen am Kopf (die Hälfte zum Kopf ist Brust).
                const kopf = cr.userData._tierBaum.teile && cr.userData._tierBaum.teile.headGroup;
                let brust = true;
                if (kopf) {
                    const k = this._trefferKopf || (this._trefferKopf = new THREE.Vector3());
                    kopf.getWorldPosition(k);
                    const t = st.t;
                    const cx = pa.x + (pb.x - pa.x) * t,
                        cy = pa.y + (pb.y - pa.y) * t,
                        cz = pa.z + (pb.z - pa.z) * t;
                    const mx = (pa.x + pb.x) / 2,
                        my = (pa.y + pb.y) / 2,
                        mz = (pa.z + pb.z) / 2;
                    brust =
                        (cx - k.x) * (cx - k.x) + (cy - k.y) * (cy - k.y) + (cz - k.z) * (cz - k.z) <=
                        (mx - k.x) * (mx - k.x) + (my - k.y) * (my - k.y) + (mz - k.z) * (mz - k.z);
                }
                zone = brust ? "brust" : "bauch";
            }
            const ein = lang > 1e-9 ? Math.max(0, st.s - Math.sqrt(Math.max(0, rr * rr - d2)) / lang) : 0;
            best = { zone, s: st.s, ein, anker: g.anker, teil: g.teil };
        }
        return best;
    }

    // Kapsel-Fit: Glied-Meshes im Knochen-LOKALEN Raum → EINE Kapsel entlang der größten Ausdehnung
    // (Radius = Mittel der Neben-Halbachsen), Farbe = Mittel der Vertex-/Material-Farben je Teil, nach Fläche
    // gewogen. Mehr Kapseln je Glied wären eine Verfeinerung DERSELBEN Bahn, nie ein neues System.
    _gliedKapselFit(meshes, wurzelInv) {
        if (!meshes || !meshes.length || typeof THREE === "undefined") return null;
        const v = new THREE.Vector3();
        const mL = new THREE.Matrix4();
        const bb = new THREE.Box3();
        const bbT = new THREE.Box3();
        const gr = new THREE.Vector3();
        bb.makeEmpty();
        // Die Farbe ist das Mittel, das man von fern SIEHT: je Teil sein Vertex-Mittel, gewogen mit der Hüll-Fläche des
        // Teils — nicht je Vertex (Augäpfel und Zähne tragen viele Vertices auf wenig Fläche; das Reh-Haupt lag
        // vertex-gemittelt bei 86,70,58 statt am Fell).
        let fr = 0,
            fg = 0,
            fb = 0,
            fw = 0;
        for (const o of meshes) {
            mL.multiplyMatrices(wurzelInv, o.matrixWorld);
            const pos = o.geometry.attributes.position;
            const col = o.geometry.attributes.color || null;
            const mc = !col && o.material && o.material.color ? o.material.color : null;
            const schritt = pos.count > 4000 ? Math.ceil(pos.count / 4000) : 1;
            bbT.makeEmpty();
            let tr = 0,
                tg = 0,
                tb = 0,
                tn = 0;
            for (let i = 0; i < pos.count; i += schritt) {
                v.fromBufferAttribute(pos, i).applyMatrix4(mL);
                bb.expandByPoint(v);
                bbT.expandByPoint(v);
                if (col) {
                    tr += col.getX(i);
                    tg += col.getY(i);
                    tb += col.getZ(i);
                    tn++;
                } else if (mc) {
                    tr += mc.r;
                    tg += mc.g;
                    tb += mc.b;
                    tn++;
                }
            }
            if (!tn || bbT.isEmpty()) continue;
            bbT.getSize(gr);
            const flaeche = Math.max(1e-6, 2 * (gr.x * gr.y + gr.y * gr.z + gr.z * gr.x));
            fr += (tr / tn) * flaeche;
            fg += (tg / tn) * flaeche;
            fb += (tb / tn) * flaeche;
            fw += flaeche;
        }
        if (bb.isEmpty()) return null;
        const c = bb.getCenter(new THREE.Vector3());
        const h = bb.getSize(new THREE.Vector3()).multiplyScalar(0.5);
        let ax = "x";
        if (h.y > h[ax]) ax = "y";
        if (h.z > h[ax]) ax = "z";
        const nb = ["x", "y", "z"].filter((kk) => kk !== ax);
        const r = Math.max(0.01, (h[nb[0]] + h[nb[1]]) * 0.5);
        const lang = Math.max(0, h[ax] - r);
        const a = c.clone();
        a[ax] -= lang;
        const b = c.clone();
        b[ax] += lang;
        return { a, b, r, farbe: fw > 0 ? { r: fr / fw, g: fg / fw, b: fb / fw } : null };
    }

    // Das per-Ziegel-March-Material ist GEFALLEN (DER EINE WELT-MARCH): der
    // Feld-Pass marcht ALLE Felder aus Atlas+Liste in EINEM Draw — ein
    // Material je Ziegel wäre der Zwilling, den wir abgeschafft haben.

    // DER STOFF-WERT (1310-18): ein Wert, der je Stoff variiert, reist als Verweis auf den Stoff des ZEICHNENDEN OBJEKTS
    // (`material.<pfad>`, je Objekt in dessen Bindegruppe geschrieben), nie als Konstante im Graphen — Stoffe gleicher
    // Signatur teilen so EIN Programm. Der Verweis geht über das Objekt, nicht über den zeichnenden Stoff: der r184-
    // Schattenpass zeichnet mit seinem EIGENEN Stoff (die Knoten des Werfers hängen darin, Lehre 26), das Objekt trägt den
    // Werfer-Stoff in jedem Pass. Der Wert steht beim Bau fest — die Observer-Diät sieht keine spätere Änderung.
    _stoffWert(TSL, pfad, typ) {
        return TSL.reference("material." + pfad, typ || "float");
    }

    // `wiegen` (true, optional): der Stoff einer weichen Boden-Art der Nah-Streu — er wiegt im EINEN Wind mit der Höhe über
    // der Wurzel in Metern aus dem Satz-Attribut `aWiege` (`_satzBlock`), also für jede Studio-Skala derselbe Stoff.
    // `mp.satzRegler` (true): der EINE Satz-Stoff des Bau-Satzes (`_satzStoff`, K43-2) — Rauheit, Metall und Deckkraft liest er
    // je Ecke aus `aRegler`, das Emissiv × Glut-Stärke aus `aGlut` (`_satzBlock`); `mp` trägt diese Regler dann nicht.
    // `krone` (true, optional; K68-N1): das Klingen-Laub gehört zu einer Krone (Baum, Strauch: foundry-core `emitTreeRezept`
    // legt die Normale der Krone darüber), auch ohne `baum` — der wiegende Stoff der Nah-Streu erbt sie vom Stoff der Art
    // (`userData.krone`); die Karte (foliageTex) ist immer Krone.
    _foundryTreeMaterial(kind, mp, wiegen, baum, krone) {
        const satz = !!(mp && mp.satzRegler === true);
        if (!this._foundryMats) this._foundryMats = {};
        const T = THREE;
        const TSL = T.TSL;
        // Material-Regler: reist `mp` mit (roughness/metalness/flatShading/env/side/Glut), baut AnazhRealm EXAKT
        // dieses Material; ohne `mp` die Baum-Defaults — die Zahlen und die Look-Familie (FELL_LOOK/HAUT_LOOK/HAAR_LOOK,
        // der Ton-Anker mp.color steht im Key) liest der Wirt aus DERSELBEN Quelle wie der Schlüssel (phyto-core
        // `budgetRegler`); Laub/Gras sind immer beidseitig.
        const R = globalThis.__phytoCore.budgetRegler(kind, mp);
        const isBark = R.rinde;
        const rough = R.r,
            metal = R.mt,
            flat = R.fl,
            env = R.env,
            sideDouble = R.doppelt,
            emis = R.em,
            emisI = R.emI,
            klasseLook = R.look;
        // Build-Zeit-Gate der Studio-Dither-Blende (Default an; Maske + CPU-Doppel-Mitgliedschaft schalten
        // zusammen am foundryCrossfade-Flag). Das Flag steht im Key: ein Live-Toggle trifft nur NEU gebaute
        // Gruppen; Material und Attribut-Stempel (`_foundryBuildGroup`) entstehen im selben Pass → konsistent. Der wiegende
        // Stoff der Nah-Streu blendet nie (ihr Stufen-Wechsel ist die Armlänge, ihre Stempel tragen 0): sein Satz trägt
        // keine Stempel (`STREU_SATZ_ATTR`).
        const xfade = !!(this.state && this.state.foundryCrossfade === true) && wiegen !== true;
        // DER SCHLÜSSEL IST DIE EINE MATERIAL-IDENTITÄT (phyto-core `budgetStoff`, W8): Art · Regler · SEITE · Gewebe ·
        // Glut · Fell-/Haut-Ton — dieselbe, mit der das Budget-Gesetz am Studio-Ausgang Stoffe zählt und faltet (die
        // Seite fehlte: ein beidseitiger Stoff teilte das Material eines einseitigen gleicher Regler, first-wins).
        // Dazu die Wirts-Zustände, die kein Studio-Stoff sind: die Dither-Blende und das Wiegen der Nah-Streu.
        // DIE KRONE (K68-N1): Karte immer, Klinge am Baum und Strauch — sie lichtet flip-frei (`_laubStoffNormale`)
        const _krone = kind === "foliageTex" || (kind === "foliage" && (!!baum || krone === true));
        const key =
            globalThis.__phytoCore.budgetStoff(kind, mp) +
            (xfade ? "|xf" : "") +
            (wiegen === true ? "|wiegt" : "") +
            (baum ? "|wind:" + baum.ht.toFixed(2) + "/" + baum.delta.toFixed(4) + "/" + baum.an : "") +
            (satz === true ? "|satz" : "") +
            (_krone ? "|krone" : "");
        if (this._foundryMats[key]) return this._foundryMats[key];
        let mat;
        // HAUT-VOLLENDUNG (19.07.): die Lab-Haut trägt CLEARCOAT (matSkin
        // 0.12/0.6) — skin/haut minten als Physical-Material (der Standard
        // trägt keinen Lack); die Zahlen kommen NUR aus dem Kern-Gesetz.
        const _hautL =
            (kind === "skin" || kind === "haut") && typeof globalThis !== "undefined" && globalThis.__koerperCore
                ? globalThis.__koerperCore.HAUT_LOOK
                : null;
        // DER KLARLACK (W5 Gegenstände): die Haut des Körperstudios (HAUT_LOOK) ODER der Stoff selbst (Fahrzeug-Lack,
        // Klingen-Stahl — `budgetRegler` cc/ccr aus dem Gesetzbuch); ohne Klarlack der Standard. Gemessen (Integration W5,
        // echte GPU, Ausgabe-Pfad, Gesicht auf 0,75 m): die Haut hebt sich im Median 41,3 -> 42,9 (+4 %, zwei gleiche
        // Schüsse 0,2 auseinander); er trägt nur die Menschen-Haut (skin/haut — kein Tier-Stoff), keinen Befehl mehr.
        const ccSoll =
            _hautL && Number.isFinite(_hautL.clearcoat)
                ? {
                      cc: _hautL.clearcoat,
                      ccr: Number.isFinite(_hautL.clearcoatRoughness) ? _hautL.clearcoatRoughness : 0.5,
                  }
                : R.cc > 0
                  ? { cc: R.cc, ccr: R.ccr }
                  : null;
        // Die Physical-Klasse lebt in der Node-Bibliothek des Renderers (r184 — die Bootstrap-Brücke reicht sie nicht als
        // THREE-Symbol: die Probe `typeof T.MeshPhysicalNodeMaterial` fiel IMMER auf den Standard, die Haut trug nie ihren
        // Klarlack). Der Null-Renderer zeichnet nichts und trägt keine Bibliothek — gefragt wird die Bibliothek selbst, nie
        // die Flagge (eine Linse lüftet `_isHeadlessNull` am Null-Renderer, gate:leistungs-vertrag: die Lieferung brach).
        const rendM = this.state && this.state.renderer;
        const MatK =
            ccSoll && rendM && rendM.library
                ? rendM.library.getMaterialNodeClass("MeshPhysicalMaterial")
                : T.MeshStandardNodeMaterial;
        mat = new MatK({
            roughness: rough,
            metalness: metal,
            flatShading: flat,
            side: sideDouble ? T.DoubleSide : T.FrontSide,
        });
        if (MatK !== T.MeshStandardNodeMaterial) {
            mat.clearcoat = ccSoll.cc;
            mat.clearcoatRoughness = ccSoll.ccr;
        }
        // DIE DURCHSICHT (W5): ein durchsichtiger Stoff (Scheibe, Fenster, Glimm-Scheibe) zeichnet transparent mit der
        // Deckkraft seines Gesetzbuchs und schreibt keine Tiefe (was hinter ihm liegt, bleibt sichtbar); einen Schatten
        // wirft er nicht (`_foundryBuildMesh`: das Licht geht durch ihn). Eine dünne Scheibe zeichnet beide
        // Seiten in EINEM Zug: r184 zieht einen doppelseitig-transparenten Stoff sonst zweimal (Rück-, dann Vorderseite)
        // — gemessen +1 Befehl je Wagen über den Budget-Deckel vehicle draws 12.
        if (R.op < 1) {
            mat.transparent = true;
            mat.opacity = R.op;
            mat.depthWrite = false;
            mat.forceSinglePass = true;
        }
        if (env !== 1) mat.envMapIntensity = env;
        if (emis) {
            mat.emissive = new T.Color(emis[0], emis[1], emis[2]);
            mat.emissiveIntensity = emisI;
        }
        // Tint-Kontinuität L0/L1↔L2: das Studio tintet NUR das Laub, multiplikativ, aus dem Positions-Hash
        // (foundry-core.js) — gleich über alle Stufen, sonst springt die Kronenfarbe beim Stufen-Wechsel. Das
        // Flag lässt `_scatterInstanceAdd` denselben Tint auf die 3D-Krone legen; Rinde bleibt untintet. Nur
        // das Flag, NIE attribute("instanceColor") — der native InstanceNode-Auto-Multiply trägt ihn.
        if (kind === "foliage" || kind === "foliageTex") mat.userData.useInstanceTint = true;
        if (_krone) mat.userData.krone = true;
        // DIE WERTE JE STOFF (1310-18): was nur diesen Stoff unterscheidet (das Leucht-Maß, der Ton-Anker der Strähnen-Achse),
        // liest der Graph als Stoff-Wert (`_stoffWert`), nie als eingefaltete Konstante — sonst trüge jeder Stoff seinen
        // eigenen Graphen und r184 baute je Stoff ein Programm.
        const _tonA = mp && Array.isArray(mp.color) && mp.color.length === 3 ? mp.color : null;
        mat.userData.stoffWerte = {
            leucht: mp && typeof mp.leucht === "number" && mp.leucht > 0 ? mp.leucht : 0,
            tonL: _tonA ? Math.max(1e-4, 0.2126 * _tonA[0] + 0.7152 * _tonA[1] + 0.0722 * _tonA[2]) : 1,
        };
        // Vorlagen-Farben leben als VERTEX-COLORS: auf WebGPU/NodeMaterial MUSS colorNode = attribute("color")
        // sie lesen — `vertexColors:true` wirkt hier NICHT (sonst weißes Laub, schwarze Koniferen).
        // `_foundryBuildGroup` garantiert das color-Attribut.
        const vcol = TSL.attribute("color", "vec3");
        // DAS LEUCHT-GESETZ (Architektur-Welle 05.10.): ein Stoff, dessen Gesetzbuch `leucht` stempelt (fachwerk
        // `feuer`: Glut, Flamme, Herdfeuer), leuchtet in seiner Vertex-Farbe × leucht — heiße Mitte, kühler Rand,
        // gelbe Flammen-Wurzel, rote Spitze — statt einer Farbe für jede Fläche (das Labor webt dasselbe in r128).
        if (mp && typeof mp.leucht === "number" && mp.leucht > 0)
            mat.emissiveNode = vcol.mul(this._stoffWert(TSL, "userData.stoffWerte.leucht"));
        // DIE SAISON IST EINE FARBE (V18.527): Laub und Gras sind Golden-Sommer gebacken — ihre Albedo × uSeasonMul
        // (das Studio-Gesetz: der Laub-Shader multipliziert mix(1, uSeasonMul, vSeasW), vSeasW = 1 auf Laub und
        // Blüte). Rinde, Fels, Kristall bleiben ungetönt.
        const _suF =
            kind === "foliage" || kind === "foliageTex" || kind === "grass" ? this._ensureSeasonUniforms() : null;
        const laubFarbe0 = _suF && _suF.uSeasonMul ? vcol.mul(_suF.uSeasonMul) : vcol;
        // DIE BLATT-UNTERSEITE (phyto-core BLATT_UNTERSEITE, 05.10.): die gesehene Fläche nach unten gewandt → die hellere,
        // mattere Unterseite (`_laubUnterseite`, K68-N1: die Fläche, nie die Licht-Normale). Laub und Blüte, nie Gras.
        const laubFarbe =
            kind === "foliage" || kind === "foliageTex" ? this._laubUnterseite(TSL, laubFarbe0) : laubFarbe0;
        // DIE NORMALE DER KRONE (K68-N1): die Studio-Krone (foundry-core `emitTreeRezept`: jede Karte, jede Klinge und Nadel
        // eines Baums und Strauchs) trägt die Normale der Krone und lichtet flip-frei (`_laubStoffNormale`). Die Karte
        // (foliageTex) ist immer Krone; das Klingen-Laub (foliage) ist es am Baum und Strauch (`_krone`: die Wind-Daten der
        // Art oder der Stoff, von dem die Nah-Streu erbt) — Farn, Blüte, Schilf und Gestrüpp tragen ihre eigene Fläche, deren
        // Wicklung frei ist: sie lesen die Seite (r184 faceDirection), sonst läge jeder zweite Wedel im Dunkel.
        if (_krone) this._laubStoffNormale(TSL, mat);
        if (isBark) {
            // KEIN Normal-Override auf Vegetations-Stämmen: r184-NodeMaterial-Tangenten (UV-Derivate) kippen auf
            // gestreckten Tube-UVs die Normale → der Stamm liest schwarz. Die Rinde lebt über Albedo (Studio-
            // Vertex-Farben) + Roughness 0.93. Ihr Spiegel der Studio-Rinden-Normale (`_foundryBarkNormalTexture`) hatte
            // keinen Leser und fiel mit K60-2; die Normale lebt im Studio (foundry-core `makeBarkNormal`).
            mat.colorNode = TSL.vec4(vcol, 1.0);
        } else if (kind === "foliageTex") {
            // Blatt-Atlas: Alpha schneidet die Blattform aus (kein solides Quad), RGB × Vertex-Farbe (die
            // Vorlagen-Blattfarbe faerbt den Atlas). Es ist DER EINE Atlas, auf den die Studio-Karten routen
            // (phyto-core `bakeLeafAtlasBild`): Zelle 0 Baum-Zweig (`BLATT_ATLAS_BREIT`), 1 Weiden-Zweig (Trauer-Strähne,
            // `BLATT_ATLAS_WEIDE`), 2 Großblatt-Zweig (Strauch, `BLATT_ATLAS_GROSS`), 3 Nadel-Zweiglein (`BLATT_ATLAS_NADEL`) — dieselbe Textur wie
            // der Grammatik-Pfad (`_ensureFoliageClusterAtlas`), keine zweite.
            const atl = this._blattAtlasProbe(TSL);
            if (atl) {
                // Die Blattform schneidet die ALPHA von colorNode aus, nie `opacityNode`: der r184-Schattenpass
                // liest colorNode.a · map.a · maskShadowNode (`Renderer._getShadowNodes`), opacityNode nie — die
                // Nadel-Karten warfen volle Rechtecke. Die Atlas-Farbe: der EINE Leser (`_blattAtlasProbe`); die Deckung
                // trägt den Versatz des Laubs (A3, `_laubVersatz`), Bild und Schatten schneiden an der Zahl des Stoffs.
                mat.colorNode = TSL.vec4(atl.rgb.mul(laubFarbe), atl.a);
                mat.alphaTest = mp && typeof mp.alphaTest === "number" && mp.alphaTest > 0 ? mp.alphaTest : 0.5;
                mat.transparent = false;
            } else {
                // Nur headless (kein document): kein Stoff zeichnet — mit document liefert der Atlas oder bricht.
                mat.colorNode = TSL.vec4(laubFarbe, 1.0);
            }
        } else if (kind === "schatten") {
            // DER SCHATTEN-STOFF (S3, das EINE Wurf-Gesetz E1): der Schatten-Teil einer Stufe zeichnet nur in den Kaskaden
            // (SHADOW_TWIN_LAYER) — seine Alpha ist max(aDeckt, Atlas-Alpha): das Gerüst deckt ganz (aDeckt 1), die Karte
            // schneidet ihre Blattform aus dem EINEN Atlas (aDeckt 0). Die Alpha lebt in colorNode, nie in opacityNode:
            // der r184-Schattenpass liest colorNode.a · map.a · maskShadowNode (Lehre 26). EIN Programm für jeden
            // statischen Wurf (Baum-Teil, die Haus-Stufe 3 mit aDeckt 1).
            const atl = this._blattAtlasProbe(TSL);
            const deckt = TSL.attribute("aDeckt", "float");
            mat.colorNode = TSL.vec4(TSL.vec3(0.0), atl ? TSL.max(deckt, atl.a) : deckt);
            mat.alphaTest = 0.5;
            mat.transparent = false;
        } else if (klasseLook) {
            // Haut + Fell: Shader-Gesetze der Labs (koerperstudio matSkin: SSS-Fresnel-Saum · tetrapoda matFur:
            // Fell-Rim + Gold-Sheen + Spitzen-Rim/-Spec) reisen als DATEN (FELL_LOOK/HAUT_LOOK/HAAR_LOOK, Kern-
            // Zahlen = die EINZIGE Quelle) und werden hier als emissive-Additive gewoben (wie das Lab-GLSL).
            // Strähnen-Achse: der Bäcker trägt sie als Farbverlauf (__streuGeo: Wurzel = Ton×0.12); die Luminanz-
            // Ratio zum Ton-Anker (mp.color) gewinnt vStrandY zurück. Ohne Kern-LOOK/TSL-Symbole: byte-alt.
            mat.colorNode = TSL.vec4(vcol, 1.0);
            try {
                const tkC = typeof globalThis !== "undefined" ? globalThis.__tetrapodaCore : null;
                const kkC = typeof globalThis !== "undefined" ? globalThis.__koerperCore : null;
                const schale = kind === "fellSchale";
                const strand = kind === "hair" || kind.indexOf("straehne") === 0 || schale;
                const L =
                    kind === "skin" || kind === "haut"
                        ? kkC && kkC.HAUT_LOOK
                        : kind === "hair"
                          ? kkC && kkC.HAAR_LOOK
                          : kind === "fell"
                            ? tkC && tkC.FELL_LOOK && tkC.FELL_LOOK.koerper
                            : tkC && tkC.FELL_LOOK && tkC.FELL_LOOK.straehne;
                if (L) {
                    const ndv = TSL.normalView.normalize().dot(TSL.positionViewDirection).clamp(-1.0, 1.0);
                    const rim = TSL.float(1.0).sub(ndv.abs()).clamp(0.0, 1.0);
                    let add = null;
                    const term = (farbe, knoten) => {
                        const t = TSL.vec3(farbe[0], farbe[1], farbe[2]).mul(knoten);
                        add = add ? add.add(t) : t;
                    };
                    if (strand) {
                        // der Ton-Anker (seine Luminanz) ist ein Stoff-Wert: jeder Fell-/Haar-Ton zeichnet im Programm seiner Art
                        const tonL = _tonA ? this._stoffWert(TSL, "userData.stoffWerte.tonL") : null;
                        const wA = Number.isFinite(L.wurzelAnker) ? L.wurzelAnker : 0.12;
                        // DAS SCHALEN-FELL (V18.497): die Schale t (aSchale.x) IST die Strähnen-Achse. Die Haar-
                        // Maske liest die Wurzel (aWurzel, Bind-Raum — sie läuft mit jeder Pose mit): das Raster
                        // folgt der Gesetz-Dichte (aSchale.z = √Median Strähnen je Fläche), je Zelle eine Locke
                        // mit gewürfeltem Zentrum, deren Radius mit der lokalen Dichte (aSchale.y) wächst und zur
                        // Spitze zuläuft; sie endet bei 55–100 % der Fell-Länge. Die inneren zwei Schalen decken
                        // (Unterwolle), wo das Gesetz Fell trägt. Farbe Wurzel → Spitze = Ton × FELL_SCHALE.
                        const aS = schale ? TSL.attribute("aSchale", "vec3") : null;
                        if (schale) {
                            // Die Zahlen des Rasters sind DATEN des Gesetzbuchs (tetrapoda FELL_SCHALE, K45) — das Labor
                            // liest dieselben (worlds/tetrapoda, GLSL); fehlen sie, bricht der Stoff laut (_stoffBruch).
                            const FS = tkC.FELL_SCHALE;
                            const t = aS.x;
                            const p = TSL.attribute("aWurzel", "vec3").mul(aS.z);
                            const zelle = TSL.floor(p);
                            const hA = FS.hashA,
                                hB = FS.hashB;
                            const h1 = TSL.fract(TSL.sin(zelle.dot(TSL.vec3(hA[0], hA[1], hA[2]))).mul(hA[3]));
                            const h2 = TSL.fract(TSL.sin(zelle.dot(TSL.vec3(hB[0], hB[1], hB[2]))).mul(hB[3]));
                            const mitte = TSL.vec3(h1, h2, TSL.fract(h1.add(h2).mul(FS.hashC)))
                                .sub(0.5)
                                .mul(FS.mitte);
                            // der Strich: die Locke längs des Kamms (Lage − Wurzel quer zur Normale) gestreckt, flächentreu
                            const q = TSL.fract(p).sub(0.5).sub(mitte);
                            const kv = TSL.positionGeometry.sub(TSL.attribute("aWurzel", "vec3"));
                            const kq = kv.sub(TSL.normalGeometry.mul(kv.dot(TSL.normalGeometry)));
                            const ql = q.dot(kq.div(kq.length().max(1e-6)));
                            const dist = q.dot(q).sub(ql.mul(ql)).mul(FS.strich).add(ql.mul(ql).div(FS.strich)).sqrt();
                            const radius = aS.y
                                .sqrt()
                                .mul(FS.radius)
                                .mul(TSL.float(1.0).sub(t.mul(FS.zulauf)));
                            const haar = TSL.step(dist, radius).mul(TSL.step(t, h1.mul(FS.endeSpanne).add(FS.ende)));
                            const wolle = TSL.step(t, FS.wolle).mul(TSL.step(FS.wolleAb, aS.y));
                            // Der Ausschnitt lebt in colorNode.a wie jeder Ausschnitt (Lehre 26: der r184-Schattenpass liest
                            // colorNode.a, nie opacityNode) — kein Stoff schneidet über opacityNode, auch keiner, der heute
                            // nicht wirft. Die Kopf-Schalen (K28) tragen dasselbe Raster: Leib und Kopf EIN Stoff.
                            mat.alphaTest = 0.5;
                            mat.colorNode = TSL.vec4(
                                vcol.mul(TSL.mix(TSL.float(FS.wurzel), TSL.float(FS.spitze), t)),
                                TSL.max(haar, wolle)
                            );
                        }
                        const sT = schale
                            ? aS.x
                            : tonL !== null
                              ? vcol
                                    .dot(TSL.vec3(0.2126, 0.7152, 0.0722))
                                    .div(tonL)
                                    .sub(wA)
                                    .div(Math.max(1e-3, 1 - wA))
                                    .clamp(0.0, 1.0)
                              : TSL.float(1.0);
                        if (Number.isFinite(L.tipRimPow) && Array.isArray(L.tipRimFarbe))
                            term(L.tipRimFarbe, rim.pow(L.tipRimPow).mul(sT));
                        if (Number.isFinite(L.specPow) && Array.isArray(L.specFarbe))
                            term(L.specFarbe, ndv.max(0.0).pow(L.specPow).mul(sT).mul(L.specAmt));
                    } else {
                        if (Number.isFinite(L.sssPow) && Array.isArray(L.sssFarbe))
                            term(L.sssFarbe, rim.pow(L.sssPow).mul(L.sssAmt));
                        if (Number.isFinite(L.rimPow) && Array.isArray(L.rimFarbe))
                            term(L.rimFarbe, rim.pow(L.rimPow).mul(L.rimAmt));
                        if (Number.isFinite(L.sheenPow) && Array.isArray(L.sheenFarbe))
                            term(L.sheenFarbe, ndv.max(0.0).pow(L.sheenPow).mul(L.sheenAmt));
                        // microFur-Sparkle (matFur: hash-Raster, Schwelle, Rim³): das Bäcker-Merge trägt kein garantiertes
                        // uv — das Raster des Bind-Raums (positionGeometry × dichte) ersetzt es; es klebt an der
                        // geskinnten Haut (V18.497), statt über die bewegten Beine zu schwimmen.
                        const mf = L.microFur;
                        if (mf && Array.isArray(mf.farbe)) {
                            const cell = TSL.floor(TSL.positionGeometry.xz.mul(mf.dichte));
                            const hsh = TSL.fract(TSL.sin(cell.dot(TSL.vec2(12.9898, 78.233))).mul(43758.5453));
                            term(mf.farbe, rim.pow(3.0).mul(TSL.step(mf.schwelle, hsh)).mul(mf.amt));
                        }
                    }
                    if (add) mat.emissiveNode = add;
                    // Wrap-Licht des Lab-Fells: ·(0.5 + 0.5·max(NdotV,0)) NACH allen Additiven — die matFur-Ordnung
                    // (outputNode multipliziert den fertigen Output inkl. emissive-Terme).
                    if (Number.isFinite(L.wrap)) {
                        const w = ndv
                            .max(0.0)
                            .mul(L.wrap)
                            .add(1.0 - L.wrap);
                        mat.outputNode = TSL.vec4(TSL.output.rgb.mul(w), TSL.output.a);
                    }
                    // Atem-Noise-Displacement der Labs (matFur/matSkin: snoise(pos·freq + t·k)·amp; hier mx_noise, gleiche
                    // Rausch-Klasse) auf fell und skin. Die Tier-Haut (fell) ist seit V18.497 geskinnt: r184
                    // setupPosition fährt das Skinning VOR dem positionNode (Vendor gelesen) — sie atmet gebogen.
                    // Die haut-Hülle des Menschen bleibt still.
                    const at = L.atem;
                    if (at && (kind === "fell" || kind === "skin")) {
                        mat.positionNode = TSL.positionLocal.add(
                            TSL.normalLocal.mul(
                                TSL.mx_noise_float(TSL.positionLocal.mul(at.freq).add(TSL.time.mul(at.t))).mul(at.amp)
                            )
                        );
                    }
                }
            } catch (_eL) {
                throw this._stoffBruch("die Look-Addition (Haut · Fell · Haar)", _eL);
            }
        } else if (mp && mp.webe) {
            // Stoff-Webung (Studio-getCloth): feine Mikro-Struktur moduliert die Stoff-Farbe (Strick grob, Denim/
            // Baumwolle fein, Leder/Gummi glatt-marmoriert) — additiv, nur wenn die Gesetz-Zeile Webung trägt. Frequenz und
            // Tiefe sind die EINE Webungs-Tafel des Kerns (koerper-core WEBE, das Labor liest dieselbe), fail-closed (K2).
            const webe = AnazhRealm.Gesetz("koerper:WEBE." + mp.webe);
            if (!Array.isArray(webe)) throw this._stoffBruch("die Webung " + mp.webe + " fehlt in koerper:WEBE");
            const [wf, wa] = webe;
            const wn = TSL.mx_noise_float(TSL.positionLocal.mul(wf)).mul(wa).add(1.0);
            mat.colorNode = TSL.vec4(vcol.mul(wn), 1.0);
        } else {
            // Fels/Kristall/Blume/Laub: die Vertex-Farbe (Laub/Gras × uSeasonMul), die Regler (rough/metal/flat/
            // env) sind schon oben aus `mp` gesetzt → Kristall glaenzt facettiert, Fels bleibt matt.
            mat.colorNode = TSL.vec4(laubFarbe, 1.0);
        }
        // DIE REGLER JE ECKE (K43-2, der EINE Satz-Stoff): Rauheit · Metall · Deckkraft aus `aRegler`, das Emissiv × Glut-Stärke
        // aus `aGlut` — vor der Blende (sie multipliziert die Deckung) und vor dem Leucht-Gesetz (es addiert den Licht-Pool
        // auf das Emissiv; ein Stoff des Leucht-Gesetzes `leucht` behält sein Emissiv aus der Farbe).
        if (satz === true) {
            const rg = TSL.attribute("aRegler", "vec3");
            mat.roughnessNode = rg.x;
            mat.metalnessNode = rg.y;
            // die Deckkraft lebt in colorNode.a wie jeder Ausschnitt (Lehre 26: nie opacityNode), die Marke 0,5 trägt nichts bei
            if (R.op < 1) {
                mat.opacity = 1;
                mat.colorNode = TSL.vec4(mat.colorNode.rgb, mat.colorNode.a.mul(rg.z));
            }
            if (!(mp && typeof mp.leucht === "number" && mp.leucht > 0))
                mat.emissiveNode = TSL.attribute("aGlut", "vec3");
            mat.userData = mat.userData || {};
            mat.userData.satzSchluessel = key;
        }
        // DAS MIKRO-RELIEF DER FACETTE (material.K2, `_mikroGestalt`): der facettierte Studio-Stein (Fels, Kristall: kind
        // „unknown" mit flatShading) kippt seine Facetten in den Oktaven am Schirm, gewogen mit seiner Rauheit (glatt ≤ 0,3 nichts,
        // matt ≥ 0,6 ganz) — im Satz die Rauheit je Ecke, sonst die des Stoffs
        if (flat && kind === "unknown") {
            const rauh = satz ? TSL.attribute("aRegler", "vec3").x : TSL.float(rough);
            this._mikroGestalt(TSL, mat, true, TSL.smoothstep(0.3, 0.6, rauh));
        }
        // Studio-Dither-Blende auf den Foundry-3D-Stufen: Fade-out L0 + Fade-in L1 (Laub überlappend, Rinde
        // exakte Partition); die Maske faltet in die Alpha (TSL statt discard, alphaTest cullt). Formeln = die
        // EINE Quelle `__phytoCore.lodCrossfadeMask` (via `_lodCrossfadeMaskNode`); xfade aus = Material
        // unverändert. Die Klassen-Look-Familie (Kreatur/Mensch, aLodLevel=0 → Maske = Identität) bleibt
        // maskenfrei — sonst nur tote Attribut-Reads + Warnungen auf ungestempelten Geometrien.
        if (xfade && !klasseLook) {
            const _keepX = this._lodCrossfadeMaskNode(TSL, {
                foliage: kind === "foliage" || kind === "foliageTex" || kind === "grass",
            });
            {
                // DER KANAL der Maske: der r184-Schattenpass liest colorNode.a, nie opacityNode — nur eine Maske in der
                // Farbe gilt auch dort. Die Instanz-Wahl liest Marke und Kanal (`_instanzFensterGilt`): ein Fenster
                // ohne die Maske des Passes schnitte ein Loch.
                let kanal = null;
                if (mat.opacityNode) {
                    mat.opacityNode = mat.opacityNode.mul(_keepX);
                    kanal = "deckung";
                } else if (mat.colorNode && mat.colorNode.rgb !== undefined && mat.colorNode.a !== undefined) {
                    mat.colorNode = TSL.vec4(mat.colorNode.rgb, mat.colorNode.a.mul(_keepX));
                    kanal = "farbe";
                } else
                    throw this._blendeBruch(
                        `der Stoff „${kind}" trägt keinen Kanal für die Maske (Deckung oder Farbe mit Alpha)`
                    );
                // die Schwelle trennt die Maske (0 | 1), nie die Deckkraft des Stoffs: eine Scheibe (Deckkraft 0,42 < 0,5)
                // fiel bis K11 ganz unter die Schwelle — kein Fenster, keine Wagen-Scheibe zeichnete, das Fenster-Licht
                // der Nacht (`_leuchtStoff`) blieb unsichtbar
                // (der Satz-Stoff liest die Deckkraft je Ecke: seine Schwelle liegt unter jeder Deckkraft eines Stoffs, 1/255)
                if (!(mat.alphaTest > 0)) mat.alphaTest = satz === true && R.op < 1 ? 1 / 255 : 0.5 * R.op;
                mat.userData = mat.userData || {};
                mat.userData.foundryCrossfade = true;
                mat.userData.foundryCrossfadeKanal = kanal;
            }
        }
        // DIE DURCHSICHT: jeder Pflanzen-Stoff (Rinde · Stiel · Laub · Blatt-Karte; nie Gras, nie die Klassen-Look-Familie
        // der Kreaturen und Menschen) wird zwischen Auge und Spieler und in der Nah-Kugel um das Auge durchsichtig
        // (`_kameraDurchsichtNode` seiner Art: der wiegende Stoff der Nah-Streu ist Boden, sonst Rinde oder Laub) — im
        // maskNode, den nur der Bild-Pass liest; der Schatten-Pass liest seinen eigenen maskShadowNode (immer behalten).
        if (!klasseLook && (isBark || kind === "foliage" || kind === "foliageTex")) {
            const _durch = this._kameraDurchsichtNode(TSL, wiegen === true ? "boden" : isBark ? "rinde" : "laub");
            mat.maskNode = _durch;
            mat.maskShadowNode = TSL.bool(true);
        }
        // Die Nah-Wiese wiegt (V18.508): das Studio-Gras liest dieselbe Böen-Welle wie die Streu
        // (`_windSwayOffset`, Gleichtakt) mit der Halm-Höhe in Metern (Vorlage × Studio-Skala `gras`), und
        // der Spieler biegt die Halme (uBend). Gemessen W7 (WGSL der Senke): r184 rechnet den Versatz VOR der
        // Instanzierung — Phase und Biegung lesen den Vorlagen-Raum, der Versatz dreht und skaliert mit der Instanz.
        if (kind === "grass") {
            if (!this.state.windUniforms && typeof this._grassInstanceMat === "function") this._grassInstanceMat();
            const _sk = this._foundryWorldScaleMatrix("gras").elements[0];
            const _sway = this._windSwayOffset(TSL, { ampX: 1.5, hoehe: TSL.positionGeometry.y.mul(_sk) });
            mat.positionNode = TSL.positionLocal.add(_sway);
        } else if (wiegen === true) {
            // DIE NAH-STREU WIEGT (Integration 05.10.): die weichen Boden-Arten (Farn · Schilf · Gestrüpp · Blume)
            // lesen dieselbe Böen-Welle wie Gras und Baum aus der EINEN Quelle (`_windSwayOffset`: uWindTime ·
            // uWindDir · Böe · uBend) mit der Höhe über der Wurzel in Metern (Vorlage × Welt-Skala der Pflanze — der
            // Satz trägt sie je Vertex als `aWiege`, seine Positionen liegen in Welt-Lage: Phase und Biegung lesen die
            // Welt, der Versatz liegt in Welt-Richtung). Jeder Teil einer Pflanze trägt denselben Versatz — Rute und
            // Laub, Stiel und Blüte bleiben verbunden; der Charakter (ampX 1,2) ist der des gefallenen
            // Klein-Vegetations-Zwillings.
            if (!this.state.windUniforms) this._grassInstanceMat();
            const _sway = this._windSwayOffset(TSL, { ampX: 1.2, hoehe: TSL.attribute("aWiege", "float") });
            mat.positionNode = TSL.positionLocal.add(_sway);
        }
        // EIN GRAPH JE SIGNATUR (1310-18): r184 schlüsselt ein Programm nach der IDENTITÄT seiner Knoten (der Knoten-Schlüssel
        // endet in `customCacheKey` = Knoten-id) — frisch gebaute Knoten hießen ein Programm je Stoff (1310-17: 43 Foundry-Stoffe,
        // 43 Bauten). Die Signatur nennt jede Eingabe, an der der Bau oben verzweigt (Art · Rinde · Look-Klasse · Leucht · Gewebe
        // · Ton-Anker der Strähne · Blende · Wiegen); der erste Stoff einer Signatur legt ihre Knoten ab, jeder weitere zeichnet
        // mit DENSELBEN Knoten — die Werte je Stoff liest der Graph als Stoff-Wert, die Regler (Rauheit, Metall, Leuchtfarbe,
        // Deckkraft, Schwelle) liest r184 als Stoff-Referenz. Weichen die belegten Knoten-Plätze ab, fehlt der Signatur eine
        // Eingabe: das bricht laut beim Namen, nie still mit fremdem Graphen. Der Satz-Stoff (K43-2) ist eine Eingabe: er liest
        // Rauheit und Metall je Ecke (`aRegler`), das Emissiv aus `aGlut` und, durchsichtig, die Deckkraft in colorNode.a.
        const _plaetze = [
            "colorNode",
            "emissiveNode",
            "opacityNode",
            "outputNode",
            "positionNode",
            "maskNode",
            "maskShadowNode",
            "roughnessNode",
            "metalnessNode",
        ];
        const _sig = [
            kind,
            isBark ? "rinde" : "",
            klasseLook ? "look" : "",
            mat.userData.stoffWerte.leucht > 0 ? "leucht" : "",
            mp && mp.webe && !isBark && !klasseLook && kind !== "foliageTex" && kind !== "schatten"
                ? "webe:" + mp.webe
                : "",
            _tonA && klasseLook ? "ton" : "",
            xfade ? "xf" : "",
            wiegen === true ? "wiegt" : "",
            satz === true ? (R.op < 1 ? "satz:durch" : "satz") : "",
        ].join("|");
        if (!this._foundryGraphen) this._foundryGraphen = new Map();
        const _graph = this._foundryGraphen.get(_sig);
        if (!_graph) {
            const g = {};
            for (const p of _plaetze) g[p] = mat[p] || null;
            this._foundryGraphen.set(_sig, g);
        } else {
            const ab = _plaetze.filter((p) => !mat[p] !== !_graph[p]);
            if (ab.length)
                throw this._stoffBruch(
                    `der geteilte Graph „${_sig}"`,
                    new Error(
                        "die Signatur verfehlt eine Eingabe des Baus — abweichende Knoten-Plätze: " + ab.join(" · ")
                    )
                );
            for (const p of _plaetze) mat[p] = _graph[p];
        }
        mat.userData.foundrySignatur = _sig;
        mat.userData.foundryKind = kind; // die Art vor dem Leuchten: die Nässe liest ihre Poren (`_naesseImStoff`)
        // das Leuchtquellen-Gesetz: der Licht-Pool und der Zeitplan des Gesetzbuchs (`mp.licht`) im Leuchten (K11)
        this._leuchtStoff(mat, mp);
        mat.userData.foundryMp = mp || null; // die Regler reisen mit: die Nah-Streu baut denselben Stoff wiegend
        // Kein stiller Rückfall: ein Stoff, der nicht baut, wirft laut (bis K11 fing ein Fang jeden Fehler und baute einen
        // Standard-Stoff ohne Knoten — ohne Pool, ohne Maske, ohne Wind).
        this._foundryMats[key] = mat;
        // der Wurf-Teil (kind "schatten") trägt denselben Wind wie das Bild seiner Stufe; der Wurf eines Baus steht (an 0)
        if (xfade && !wiegen && (isBark || kind === "foliage" || kind === "foliageTex" || kind === "schatten"))
            this._baumWindStoff(mat, kind, baum);
        if (kind === "foliage" || kind === "foliageTex") this._laubLichtStoff(mat, kind === "foliageTex");
        return mat;
    }
    // DAS WURF-RECHT EINES GELIEFERTEN TEILS (der EINE Leser: `_foundryBuildMesh`; gate:regler-wirkt liest ihn aus der
    // Quelle). Die Fell-Schalen werfen keinen Schatten (die Haut darunter wirft ihn — sechs Schalen wären sechs Ränder).
    // Eine LICHTQUELLE wirft nie (Seh-Klasse glut, vom Gesetzbuch gestempelt: Glutbett und Flamme der Feuerstelle, das
    // Herdfeuer, die Leucht-Linien der Tore) — dieselbe Regel wie `_archTeilLeuchtet` für die Wirts-Teile. Ein
    // DURCHSICHTIGER Stoff (Scheibe, Fenster, Brunnen-Wasser; Deckkraft < 1 aus dem Gesetzbuch) wirft auch keinen: das
    // Licht geht durch ihn, und r184 zieht einen doppelseitig-durchsichtigen Werfer im Schattenpass zweimal (der
    // Schatten-Stoff trägt kein forceSinglePass) — gemessen am GT k0 9 -> 7 Befehle, am Brunnen 2 -> 1 (Integration W5).
    static _teilWirft(m) {
        return (
            m.kind !== "fellSchale" &&
            !(m.mat && m.mat.seh === "glut") &&
            !(m.mat && typeof m.mat.opacity === "number" && m.mat.opacity < 1)
        );
    }
    // DIE KOSTEN-REGEL DES WURFS (1110-9, docs/studio-vertrag.md N5): geworfen wird von der billigeren Stufe — wirft eine
    // gezeigte Stufe über ihre NUR-WURF-Stufe, nimmt der Wirt deren Zwilling nur, wo er WENIGER Dreiecke in die Kaskaden
    // trägt als die werfenden Teile der Stufe selbst; sonst wirft die Stufe selbst. `eigen` und `zwilling` = Dreiecke der
    // werfenden Teile (`_teilWirft`). Gemessen am Regler-Rand: kathedrale orders=9 trägt eine Stufe 3 von 20 308 gegen eine
    // werfende L0 von 16 652 — der Zwilling wäre dort teurer als das, was er ersetzt (gate:regler-wirkt WURF).
    static _wurfVonBilligerer(eigen, zwilling) {
        return zwilling < eigen ? "zwilling" : "selbst";
    }
    // Die Kosten einer Foundry-Antwort (die Kosten-Leiste der Werkstatt): Dreiecke, Stoffe (je Material-Datensatz), Teile und
    // Werfer (`_teilWirft`) — gezählt an den Teilen mit Gestalt, nie an einem Pseudo-Eintrag.
    static _foundryKosten(meshes) {
        const teile = (meshes || []).filter((m) => m && m.position && m.position.array);
        const stoffe = new Set(teile.map((m) => m.kind + "|" + JSON.stringify(m.mat || null)));
        let tris = 0;
        for (const m of teile) tris += Math.floor((m.index ? m.index.length : m.position.array.length / 3) / 3);
        const werfer = teile.filter((m) => AnazhRealm._teilWirft(m)).length;
        return { tris, stoffe: stoffe.size, meshes: teile.length, werfer };
    }
    // Die Dreiecke einer Geometrie (indiziert oder nicht).
    static _geomDreiecke(g) {
        if (!g || !g.attributes || !g.attributes.position) return 0;
        return Math.floor((g.index ? g.index.count : g.attributes.position.count) / 3);
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_studio_bruecke]);

// ===== ATLAS · Studio/bruecke — Außen-Konstanten =====
// Die Wirts-Zeilen der Arten mit Wirts-Verben (synchron vor dem Buch, Lockstep); jede andere Art bringt ihre Zeile im Buch
// (B7) — der Ingest vereint beide hier (`_kindPolicyVereinen`).
AnazhRealm.KIND_POLICY = Object.freeze({
    tree: Object.freeze({ prefix: "baum_", donor: "baum_eiche", grown: true, placeExtra: "forest", impostor: true }),
    // Render-only-Zeile: shrub trägt bewusst kein prefix/donor (Auto-Register überspringt sie
    // fail-closed, keine Wald-Nische) — sie steuert NUR die Impostor-Politik.
    shrub: Object.freeze({ impostor: true }),
    // Fahrzeug-Fernstufe: ein GEPARKTES Fahrzeug wird fern zum 8-Winkel-Billboard (dieselbe Bäckerei wie
    // Baum/Tor; vehicle-core B2 weist L1/L2 dem Wirt zu). Ein GERITTENES erreicht den Impostor nie:
    // `_tickMountedMovement` pinnt entry.position auf den Spieler → die Distanz-Autorität
    // (`_foundryLodForEntry`/`_tickArchitectureLOD`) urteilt ≈ 0 → L0. Crossfade: `_updateFoundryLodBand`.
    vehicle: Object.freeze({
        prefix: "fahrzeug_",
        donor: "fahrzeug_wagen",
        grown: false,
        builtIn: false,
        placeExtra: null,
        impostor: true,
    }),
    // Tor-Domäne (porta-core, kind:"gate"): Platzierung als Rezept-Daten (fx.place mode "site" +
    // siteTag "tor") → placeExtra null. role: "portal" — ein platziertes tor_<rezept> IST ab Geburt ein
    // Welt-Tor (isPortal-Affordance, E-Betreten, Default-Ziel Skelett-Welt; `richte portal …` zielt um).
    // KEINE Karte (K43): das Tor trägt seine Stufen-Kette im Gesetzbuch (porta-core L0 → L1, die Grenzen `ab` im Kern) und
    // jenseits der Nah-Grenze seine Fernform "huelle" — vorher galt es über `impostor: true` als baumartig (Wahrnehmungs-
    // Distanz, Dither-Masken des Baums, die Karte ab 26 m) und zeigte die L0 bis 26 m.
    gate: Object.freeze({
        prefix: "tor_",
        donor: "tor_basis",
        grown: false,
        builtIn: false,
        placeExtra: null,
        role: "portal",
    }),
    // Waffen-/Werkzeug-Domäne (schmiede-core, kind:"weapon", 22 Gattungen): fx.place mode "hand" →
    // placeExtra null; Donor = Substanz-Datenblock (Tags · Ω-PHYSIS · wield), die Gestalt aus dem
    // Appear-Pfad. handAxis: das Lab baut entlang +X — der Hand-Konsument (_heldFoundryGroup/buildHand)
    // mappt Template-X auf lange Achse +Y, Griff unten; ohne handAxis unrotiert. donorTool: Rezepte mit
    // fx.tool klonen KIND_SUBSTANCE.geraet_spitzhacke → Rolle/Wield/Abbau urteilen als Werkzeug.
    weapon: Object.freeze({
        prefix: "klinge_",
        donor: "geraet_schwert",
        donorTool: "geraet_spitzhacke",
        grown: false,
        builtIn: false,
        placeExtra: null,
        handAxis: "x",
    }),
    // Haus-Domäne (fachwerk-core, kind:"haus", 32 Kultur-Archetypen): fx.place mode "settlement" +
    // siteTag "haus" über den Settlement-Kanal (exportSettlement → spawnSettlement) → placeExtra null.
    // Donor = begehbarer Substanz-Datenblock (blockerAABBs mit TÜR-LÜCKE); kindStages.haus = [0,1,2] —
    // alle drei serviert: L1 ist seit V18.500 die FLÄCHEN-STUFE des Studios (17–33 % von L0, höchstens 31k).
    haus: Object.freeze({
        prefix: "haus_",
        donor: "haus_basis",
        grown: false,
        builtIn: false,
        placeExtra: null,
    }),
    // Die Pflanzen mit Reglern (KI K2, phyto-core PARAMS_BY_KIND flower · grass): ein Natur-Bauplan je Rezept aus der Kraut-
    // Substanz (ein Halm aus `kraut`, weicher Stoff unter BLOCKER_DENSITY_MIN: kein Blocker, man geht hindurch; das Bild
    // zeichnet das Studio), gesetzt durch die Natur-Wand wie der Hain; die Streu und die Nah-Wiese bleiben ohne Eintrag.
    // Vorher war „Blume" kein Wort der Welt und neun Regler-Zeilen für kein Programm erreichbar.
    ...Object.fromEntries(
        [
            ["flower", "blume_"],
            ["grass", "gras_"],
        ].map(([art, prefix]) => [
            art,
            Object.freeze({
                prefix,
                substanz: {
                    label: "Kraut",
                    parts: [
                        {
                            shape: "cylinder",
                            material: "kraut",
                            position: { x: 0, y: 0.3, z: 0 },
                            size: { x: 0.05, y: 0.6, z: 0.05 },
                        },
                    ],
                },
                grown: false,
                builtIn: false,
                placeExtra: null,
            }),
        ])
    ),
    // DIE ARTEN OHNE BAUPLAN (KI K2): ihr Werk steht nicht als Bau — `werk` ist ihr Wirts-Verb, kein prefix (kein Auto-Bauplan).
    // "wesen": die Gattung erscheint als Kreatur, der Stempel ist ihr Guss (`spawnCreatureAt` dialsOv); "praegung": der Körper
    // des Spielers und der Klang der Welt lesen die Prägung des Rezepts (`_praegungSetzen`, der EINE Übergabe-Empfang). Leser:
    // der Wort-Katalog (das Rezept ist sein eigenes Werk-Ziel), spawn_studio und der Ofen der Werkstatt-Vorschau.
    kreatur: Object.freeze({ werk: "wesen" }),
    koerper: Object.freeze({ werk: "praegung" }),
    klang: Object.freeze({ werk: "praegung" }),
});
AnazhRealm.KNUTH_INVERS = 244002641;
// Die Faltung eines Worts für den Wort-Katalog (`_studioWortKatalog`): klein, Umlaute ausgeschrieben, ß → ss, Leer- und
// Bindestriche → „_" (die Form der Bauplan-Namen und Rezept-ids).
AnazhRealm._wortFalten = function (wort) {
    return String(wort == null ? "" : wort)
        .trim()
        .toLowerCase()
        .replace(/ä/g, "ae")
        .replace(/ö/g, "oe")
        .replace(/ü/g, "ue")
        .replace(/ß/g, "ss")
        .replace(/[\s-]+/g, "_");
};
// Sekunden-normalisierter Ingest-Takt: Ziel ist eine RATE je echter Sekunde — jeder Frame gibt
// `rate·dt` Konversionen frei, gedeckelt durch INGEST_BURST_CAP (Schutz gegen LongTasks). So lädt
// die Welt mit der Wanduhr statt mit der Framerate (fix pro Frame hieß bei 8 fps nur 8–24/s).
// Über Budget = halbe Rate; der Stau schrumpft immer.
// DIE KONSUM-WAND des Foundry-Kanals (V18.511): GENAU die Vertex-Attribute, die `_foundryBuildMesh` liest — die
// Transport-Schale (`_foundrySchale`) streicht im Worker jedes andere VOR Kopie, Platte und Transfer (aWind · aCenter ·
// aType reisten 32 % der Bytes ohne Leser). Ein neuer Leser in `_foundryBuildMesh` = ein Name hier (gate:fluss prüft
// beide Seiten gegeneinander).
AnazhRealm.FOUNDRY_LESEN = [
    "position",
    "normal",
    "color",
    "uv",
    "aWurzel",
    "aSchale",
    "aDeckt",
    "skinIndex",
    "skinWeight",
];
// Das Transport-Format der Platte (reist als `|f<n>` im Stempel): 2 = Konsum-Wand + Uint16-Index (V18.511); 3 =
// saisonfreie Körper-Schlüssel `<preset>|<gestalt>|<lod>[|ov:…]`, Karten `karte|…` mit `{ payload }` (V18.527). Ein
// geändertes Format leert den Asset-Cache von selbst (wie ein Studio-Edit) — die alte Saison-Platte fällt einmal.
AnazhRealm.FOUNDRY_PLATTE_FORMAT = 3;
AnazhRealm.INGEST_RATE_PER_S = 180; // Ziel-Freigaben je echter Sekunde (= 60 fps × 3 → healthy-fps byte-alt)
AnazhRealm.INGEST_BURST_CAP = 8; // max Freigaben je EINZELFRAME (Anti-LongTask-Deckel; bei 8 fps = 64/s statt 8/s)
// Der Horizont-Saum (m): über so viele Meter vor `SCATTER.outerM` liegen die Ränder der Karten-Dinge, je Eintrag aus
// seinem Samen (Salz: der Hash-Kanal des Saums, `_pcg2d`) — der Wald dünnt aus, jeder Baum steht ganz oder gar nicht.
AnazhRealm.KARTEN_HORIZONT_SAUM_M = 32;
AnazhRealm.KARTEN_HORIZONT_SALZ = 0x4b48;
// DIE EINE WORKER-SCHLANGE (`_foundryAuftrag`): Aufträge gleichzeitig im Worker und das Alter, ab dem der Älteste jede
// zweite Wahl bekommt. Jeder Nachschub braucht einen Haupt-Thread-Rundlauf; kleine Aufträge (Platte, Fels, Klinge) sind
// schneller als er — gemessen 03.10. (Boot-Vorrat leer · nahe Eiche/Tanne-L0): FIFO 12,4 s · 9,0/9,4 s; im Flug 2:
// 20,4 s · 0,4/0,9 s; 4: 15,2 s; 8: 13,2 s; 12: 12,3 s · 0,9/1,4 s — zwölf halten den Worker ohne Lücke beschäftigt.
AnazhRealm.FOUNDRY_IM_FLUG = 12;
AnazhRealm.FOUNDRY_ALTER_MS = 6000;
// Die Werk-Fäden (`_foundryHelfer`, K60): höchstens so viele Fäden bauen Körper (das Werk zählt mit), einer je vier Kerne.
AnazhRealm.FOUNDRY_WERK_FAEDEN = 4;
// Wie lange ein abgelaufener Auftrag als Geist seinen Faden hält (× seine Frist, `_foundryFrist`): auf CPU-Raster unter
// Fremdlast lief ein Karten-Bake über zwei Fristen (gate:arch-feld 05.10.: die Weide dreimal gesendet in ~1000 Takten) —
// vier tragen ihn, ein toter Auftrag fällt.
AnazhRealm.FOUNDRY_GEIST_FACH = 4;
