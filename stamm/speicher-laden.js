class AnazhRealm_speicher_laden {
    // ===== ATLAS · Speicher/laden — loadState-Kette · Welt-Tor · Fusion · Bibliothek =====
    // Lädt einen Zustand IN DIE SEITE (ohne Argument: den Platz der aktiven Welt). Er legt nichts im Speicher ab — eine
    // andere Welt betritt den Speicher nur durch die Tür `_weltBetreten` (bis 10.10. spiegelte loadState jeden fremden
    // Zustand roh in den Speicher, ohne worldId auf den Platz der Welt der Seite).
    loadState(externalState = null) {
        let state = externalState;
        if (!state) {
            state = this._loadStateLoadFromStorage();
            if (!state) return false;
        }
        // DIE SPERRE DES LADENS (speicher.K1): bis der letzte Restore lief, ist die Welt halb — jeder Schreiber, der in ihr
        // ruft (die Stoff-Setter der Seele riefen neunmal vor den Bauten), wartet; danach schreibt EIN Stand die ganze (im nächsten Leerlauf).
        const sperre = (this._ladeSperre = { verlangt: false });
        try {
            this._loadStateRestorePlayerPosition(state);
            this._loadStateRestoreBasicState(state);
            this._loadStateRestoreWorldMeta(state);
            this._loadStateRestoreSoulAndAtmosphere(state);
            this._loadStateRestoreConsumablesAndEquipped(state);
            this._loadStateRestoreCraftingInventory(state);
            // Gewachsene Baupläne MÜSSEN VOR `_loadStateRestoreArchitectures` in state.blueprints landen, sonst
            // läuft spawnArchitecture in einen unbekannten Type-Builder (jeder grown_*-Baum wäre verloren).
            this._loadStateRestoreGrownBlueprints(state);
            // nach der Welt (Saat, Erbgut, Gesetz) und vor den Bauten: ein Save eines alten Bodens zieht um
            this._loadStateRestoreArchitectures(state, this._bodenUmzug(state));
            this._loadStateRestoreHotbarAndInventory(state);
            this._loadStateRestoreEmotionsAndDsl(state);
            this._loadStateRestoreWorldRules(state);
            this._loadStateRestoreMiscState(state);
            this._loadStateRestoreLeben(state);
            // Portal-Hallen zurückbauen: jede läuft durch _admitForeignPortalHall — auch Selbst-Imports sind
            // „fremd" (die R4-Wand kann einen Eintrag nach Rückruf fallen lassen). Stellt die Map-Form her.
            if (Array.isArray(state.portalHalls)) {
                for (const raw of state.portalHalls) {
                    const admitted = this._admitForeignPortalHall(raw);
                    if (admitted) this.state.portalHalls.set(admitted.name, admitted);
                }
            }
            // Φ6 (V18.191) — Compute-Spende-Pool restaurieren. Compute-Contributions
            // laufen durch _admitForeignComputeContribution (R4-Wand auch auf
            // Self-Imports — ein zwischen Sessions revozierter Anbieter fällt).
            if (Array.isArray(state.computeContributions)) {
                for (const raw of state.computeContributions) {
                    const admitted = this._admitForeignComputeContribution(raw);
                    if (admitted) {
                        // Status aus Snapshot zurück (verified/forged überlebt — die
                        // Stichproben-Wahrheit ist deterministisch, sie bleibt wahr).
                        if (raw.status === "verified" || raw.status === "forged") admitted.status = raw.status;
                        this.state.computeContributions.set(admitted.inputHash, admitted);
                    }
                }
            }
            // Playtest-Spenden: einfache Array-Wiederherstellung mit Sieb (recordPlaytestRun
            // bricht die Sig-Wand — beim Restore vertrauen wir der lokalen Signatur, die
            // sie initial passierte; ein revozierter Anbieter wird trotzdem ausgesiebt).
            if (Array.isArray(state.playtestContributions)) {
                this.state.playtestContributions = state.playtestContributions
                    .filter((e) => {
                        if (!e || !e.commit) return false;
                        if (e.providedBy && this.state.revokedKeys && this.state.revokedKeys.has(e.providedBy)) {
                            return false;
                        }
                        return true;
                    })
                    .slice(-64);
            }
            this.log(externalState ? "Zustand aus Datei geladen" : "Zustand geladen");
            if (!externalState) this._loadStateRestoreVersionHistory();
        } finally {
            this._ladeSperre = null;
        }
        // die Lade-Sicherung im nächsten Leerlauf-Fenster (Takt): der Boot trägt sie nicht, der Besen hat bis dahin vorgebacken —
        // stirbt die Seite davor, liegt der geladene Stand noch ganz auf der Platte
        if (sperre.verlangt) this._imLeerlauf(() => this.saveState(true), 2000);
        return true;
    }

    // DIE GRUNDSTELLUNG OHNE NEULADEN (w4-grundstellung; der Schöpfer 29.10.: „Die Welt ist in wenigen Sekunden geladen — das
    // Prüftheater hat ein Ende"). Ohne `grund` nimmt sie den Grund der laufenden Welt: ihren Stand (das Speicher-Gesetz,
    // `buildStateSnapshot`) und je Zeile der GRUND_TAFEL den Augenblick, den der Stand nicht trägt. Mit `grund` (sein JSON) spielt
    // sie ihn in DIESELBE Welt zurück: das Wort jeder Zeile, dann der Stand (`_standRueckspielen`). Ring, Fern-Ring, Streu, Kronen, Leib und Shader bleiben warm — bis dahin
    // stellte die Mess-Sitzung jede Grundstellung mit Neuladen her, und die nächste Probe baute ihren Ring neu (Radeon 29.10.:
    // ~45 s je Probe). → { ok, grund, abdruck, anders, neu }: der Grund als JSON (nur beim Nehmen), der Abdruck der Welt danach
    // (`_grundAbdruck`), die Größen, die vom Grund abweichen (leer: die Welt steht im Grund), und was neu fiel.
    _grundstellung(grund = null) {
        const ziel = grund ? JSON.parse(grund) : null;
        let neu = null;
        if (ziel) {
            for (const [k, , setze] of AnazhRealm.GRUND_TAFEL) setze.call(this, ziel.augenblick[k]);
            const r = this._standRueckspielen(ziel.stand);
            if (!r.ok) return r;
            neu = r.neu;
        }
        const jetzt = { stand: this.buildStateSnapshot(), augenblick: {} };
        for (const [k, lies] of AnazhRealm.GRUND_TAFEL) jetzt.augenblick[k] = lies.call(this);
        const abdruck = AnazhRealm._grundAbdruck(jetzt);
        const soll = ziel ? AnazhRealm._grundAbdruck(ziel) : abdruck;
        const anders = Object.keys({ ...soll, ...abdruck }).filter((k) => soll[k] !== abdruck[k]);
        return { ok: true, grund: ziel ? null : JSON.stringify(jetzt), abdruck, anders, neu };
    }

    // DAS RÜCKSPIELEN EINES STANDS IN DIESELBE WELT (w4-grundstellung): der Stand durch die EINE Lade-Kette (`loadState`) an Ort
    // und Stelle (`_ladeOrt`) — Saat, Gesetz und ihre Caches bleiben, ein gleiches worldMeta quert keine Grenze, der Leib gießt nur
    // bei einer anderen Seele neu. Was sich änderte, fällt neu, nur das: die Glieder der Säcke (Baupläne, Stoffe, Werkzeuge — ein
    // fremdes fällt, ein anderes kehrt durch die Kette wieder), jeder Edit, der kam oder fiel, über seine Reichweite
    // (`_editWirkt`; der Faden bekommt die ganze Liste), jedes Werk, das fehlt, kam oder anders steht (`removeArchitecture`,
    // `_bauAusStand`), die Wesen aus dem Stand (`spawnCreatures`, wie beim Boot). Die Würfe des Gesetzes (`_ausGesetz`) folgen dem
    // Ort, nie dem Grund: der Strom wirft sie, wohin der Spieler kommt (speicher.K3). Eine andere Welt kommt so nie herein (die Tür
    // `_weltBetreten`). → { ok, neu: { edits, bauten, wesen }, grund? }
    _standRueckspielen(stand) {
        const wm = this.state.worldMeta;
        const id = stand && stand.worldMeta && stand.worldMeta.worldId;
        if (!wm || !id || id !== wm.worldId)
            return {
                ok: false,
                grund: `eine andere Welt (${id || "ohne worldId"}) kehrt nie an Ort und Stelle zurück`,
            };
        const J = AnazhRealm._grundJson;
        const S = JSON.parse(JSON.stringify(stand)); // die Lade-Kette hält, was sie bekommt — der Grund bleibt unberührt
        const jetzt = this.buildStateSnapshot();
        const vorher = Array.isArray(wm.voxelEdits) ? wm.voxelEdits : [];
        for (const k of ["blueprints", "materials", "tools"]) {
            const live = new Map((jetzt[k] || []).map((e) => [e.name, J(e)]));
            const soll = new Set((S[k] || []).map((e) => e && e.name));
            for (const n of live.keys()) if (!soll.has(n)) delete this.state[k][n];
            S[k] = (S[k] || []).filter((e) => !e || live.get(e.name) !== J(e));
        }
        this._ladeOrt = { weltGleich: J({ ...S.worldMeta, voxelEdits: null }) === J({ ...wm, voxelEdits: null }) };
        try {
            this.loadState(S);
        } finally {
            this._ladeOrt = null;
        }
        if (J(jetzt.playerTools) !== J(S.playerTools)) this.state.player.tools = [...S.playerTools];
        // DIE TAG-LÄNGE des Grunds: der Stand trägt sie, die Lade-Kette setzt sie nie (die Wahl des Spielers, siehe „Tag-Länge“ in
        // `_loadStateRestoreBasicState`) — an Ort und Stelle kehrt sie zurück. Radeon 30.10. (mess-session): licht.K5#1 fiel am Deckel
        // mitten im Wetter-Zug (`st.dayLengthMinutes = 1e9`, das Zurück erst im finally), die Grundstellung meldete `dayLengthMinutes`
        // abweichend, die Welt der Sitzung trug nicht mehr: 81 von 101 Stationen danach ungemessen
        if (Number.isFinite(S.dayLengthMinutes)) this.state.dayLengthMinutes = S.dayLengthMinutes;
        const nach = Array.isArray(S.worldMeta.voxelEdits) ? S.worldMeta.voxelEdits : [];
        if (S.worldMeta.voxelEdits) this.state.worldMeta.voxelEdits = nach;
        else delete this.state.worldMeta.voxelEdits;
        const zahl = (L) => L.reduce((m, e) => m.set(J(e), (m.get(J(e)) || 0) + 1), new Map());
        const [A, B] = [zahl(vorher), zahl(nach)];
        const edits = [...new Set([...A.keys(), ...B.keys()])].filter((k) => A.get(k) !== B.get(k));
        for (const k of edits) this._editWirkt(JSON.parse(k), false);
        if (edits.length)
            this._voxelZustandPost({ type: "state-update", delta: { voxelEdits: this._snapshotVoxelEdits() } });
        // DAS WERK: je Id das Glied des Stands
        const werk = new Map((S.architectures || []).map((a) => [String(a.id), a]));
        const liveWerk = new Map((jetzt.architectures || []).map((a) => [String(a.id), J(a)]));
        let n = 0;
        for (const e of this.state.architectures.slice()) {
            const k = String(e.id);
            if (e._ausGesetz || (werk.has(k) && J(werk.get(k)) === liveWerk.get(k))) continue;
            this.removeArchitecture(e, { still: true });
            n++;
        }
        const da = new Set(this.state.architectures.map((e) => String(e.id)));
        for (const [k, a] of werk) if (!da.has(k) && this._bauAusStand(a, S, null)) n++;
        // DIE WESEN kehren aus dem Stand wieder (ihr Alter wächst mit jedem Bild: gleich sind sie nur unberührt)
        const wesen = J(jetzt.creatures) !== J(S.creatures);
        const headless = this.state.renderer && this.state.renderer._isHeadlessNull;
        // ein Grund ohne Wesen (vor dem Wurf des Boots) lässt keine: `spawnCreatures` ohne Stand würfelte neue
        if (wesen && this.state._pendingCreatureSnapshots)
            this._syncBauen(headless ? "naht" : null, () => this.spawnCreatures());
        else if (wesen) this.clearCreatures();
        this.state._pendingCreatureSnapshots = null;
        return { ok: true, neu: { edits: edits.length, bauten: n, wesen: wesen ? this.state.creatures.length : 0 } };
    }

    // JSON mit geordneten Schlüsseln: gleiche Werte, gleiche Bytes (die Lade-Kette legt Objekte in ihrer eigenen Reihe an).
    static _grundJson(v) {
        const ordne = (k, w) =>
            w && w.constructor === Object
                ? Object.fromEntries(Object.entries(w).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
                : w;
        return JSON.stringify(v === undefined ? null : v, ordne);
    }

    // DER ABDRUCK eines Grunds ({ stand, augenblick }): je Größe ihr JSON — der Stand je Feld (das worldMeta je eigenem Feld
    // `worldMeta.<k>`), der Augenblick je Zeile (`augenblick.<k>`); gleiche Abdrücke, gleiche Welt.
    // Zwei Größen trägt er in ihrer Form, nie in ihrer Zahl: die Welt-Uhr läuft (`spielZeit`, `_weltUhrNimm` geht nie zurück —
    // feld.K2#2; zwischen zwei Proben läuft sie ohnehin), und der Verband eines Wesens heißt nach seinem ersten Glied im Stand
    // (die Wiederkehr vergibt neue netIds, `_restoreCreatureFromSnapshot` — bei jedem Laden).
    static _grundAbdruck(g) {
        const J = AnazhRealm._grundJson;
        const a = {};
        for (const [k, v] of Object.entries(g.stand))
            if (k === "worldMeta" && v) for (const [m, w] of Object.entries(v)) a["worldMeta." + m] = J(w);
            else a[k] = J(v);
        const vb = new Map();
        const wesen = (g.stand.creatures || []).map((c) =>
            c && c.verband != null
                ? { ...c, verband: vb.get(c.verband) || vb.set(c.verband, "v" + vb.size).get(c.verband) }
                : c
        );
        [a.creatures, a.spielZeit] = [J(wesen), "läuft"];
        for (const [k, v] of Object.entries(g.augenblick)) a["augenblick." + k] = J(v);
        return a;
    }

    // Der Zustand der aktiven Welt aus dem Speicher — durch DIE Rettungs-Kette `_weltRettungsKette` (IndexedDB des
    // Boot-Vorlaufs ⇄ Abbild → .bak; der Vorlauf wird hier verbraucht; Welt-Guard: nur für DIESELBE Welt). Ohne Aktiv-Zeiger der
    // Legacy-Single-Key. null, wenn nichts lesbar ist — dann sagt das Log, was die Kette fand.
    _loadStateLoadFromStorage() {
        const activeId = this.activeWorldGet();
        if (!activeId) {
            const legacy = localStorage.getItem("anazhRealmState");
            if (!legacy) return null;
            try {
                return JSON.parse(legacy);
            } catch (e) {
                this.log(`Legacy-Speicherstand korrupt (${e.message}).`, "ERROR");
                return null;
            }
        }
        const idb = this._idbVorlage(activeId);
        this._idbPreloadedState = null;
        const fund = this._weltRettungsKette(activeId, idb);
        if (!fund.state) {
            // Eine frische Welt hat noch keinen Stand (die Vorlade sagte es schon laut); ERROR nur, wenn etwas da war, das
            // sich nicht lesen ließ.
            const kaputt = fund.befund.some((b) => /korrupt|unlesbar|nicht lesbar/.test(b));
            this.log(
                `Die Welt ${activeId} ließ sich nicht laden: ${fund.befund.join(", ")}.`,
                kaputt ? "ERROR" : "DEBUG"
            );
            return null;
        }
        // laut nur die Rettung: ein korruptes Glied oder der .bak (ein atomarer Schreiber hinterlässt keins von beiden)
        if (fund.quelle.startsWith(".bak") || fund.befund.some((b) => /korrupt|unlesbar/.test(b)))
            this.log(`Welt aus ${fund.quelle} geladen (${fund.befund.join(", ")}).`, "WARN");
        return fund.state;
    }

    // terrainEverGenerated=true NUR, wenn der Save eine ECHTE Spieler-Position trägt. playerPosition:null
    // ist eine Welt VOR ihrem Erst-Spawn (leerer createNewWorld-/Fusions-Snapshot): das Flag bleibt false,
    // damit generateTerrainWithParameters den Erst-Spawn fährt (offener Punkt + Genesis-Plattform) —
    // sonst fällt der Spieler blind auf (0,0) (`diag-genesis-spawn.cjs`).
    _loadStateRestorePlayerPosition(state) {
        if (!state.playerPosition) {
            this.log("Welt vor Erst-Spawn (Save ohne playerPosition) — der Genesis-Spawn übernimmt");
            return;
        }
        const playerPosition = state.playerPosition;
        const safeX = Number.isFinite(playerPosition.x) ? playerPosition.x : 0;
        const safeY = Number.isFinite(playerPosition.y) ? playerPosition.y : 5;
        const safeZ = Number.isFinite(playerPosition.z) ? playerPosition.z : 0;
        this.state.terrainEverGenerated = true;
        if (!this.state.playerMesh) return;
        this.state.playerMesh.position.set(safeX, safeY, safeZ);
        this.state.playerMesh.visible = true;
        // Feld-nativ: Velocity nullen + vertikalen Feld-Zustand zurück (kein Ammo-Body).
        if (this.state.playerVel) this.state.playerVel.setValue(0, 0, 0);
        this.state._fieldVy = 0;
        this.log(`Spielerposition geladen: (${safeX}, ${safeY}, ${safeZ})`);
    }

    // knowledgeBase, selfAwareness, creatureEmotions, Kreaturen-Stash, Terrain-Parameter, Wetter + Skybox.
    // `_pendingCreatureSnapshots` stasht die vollen Snapshots (soul+name) für spawnCreatures() im
    // generateNewWorld-Pfad; Legacy-Saves (nur {position}) fallen auf Default-Spawn (hasName+hasSoul).
    _loadStateRestoreBasicState(state) {
        this.state.knowledgeBase = state.knowledgeBase || [];
        this.state.selfAwareness = state.selfAwareness || { components: [], weaknesses: [] };
        this.state.creatureEmotions = state.creatureEmotions || [];
        const incoming = Array.isArray(state.creatures) ? state.creatures : [];
        const looksLikeFullSnapshots =
            incoming.length > 0 &&
            incoming[0] &&
            typeof incoming[0] === "object" &&
            typeof incoming[0].soul === "string";
        this.state._pendingCreatureSnapshots = looksLikeFullSnapshots ? incoming : null;
        this.state.terrainSteepness = state.terrainSteepness || 1.0;
        this.state.terrainBaseHeight = state.terrainBaseHeight || 0.0;
        this.state.weather = state.weather || "sunny";
        this.state.wetterWort =
            typeof state.wetterWort === "string" && state.wetterWort in AnazhRealm.WEATHER_INTENSITY
                ? state.wetterWort
                : null;
        this.state.wetterWunsch = null;
        if (this.state.skybox) this.updateSkyboxWeather();
    }

    // Die Weltgrenze jedes Ladens: das worldMeta der geladenen Welt ersetzt das der Seite (`_weltMetaWechsel`); ein
    // altes `worldMeta.chunkDeltas` wird still ignoriert.
    _loadStateRestoreWorldMeta(state) {
        // DIESELBE WELT AN ORT UND STELLE (`_standRueckspielen`): Saat und Gesetz bleiben, ihre Caches (Kronen, Streu, Fern-Ring,
        // Bau-Geometrien, Zähler der Streu) bleiben warm; ein gleiches worldMeta quert keine Grenze, ein anderes die unten
        const ort = this._ladeOrt;
        if (ort && ort.weltGleich) return;
        if (!ort) {
            // Welt-Wechsel ist eine WELT-IDENTITÄTS-GRENZE: lazy-cached Worldgen-Caches MÜSSEN zurück, sonst trägt
            // die neue Welt alte Welt-Stempel (P2P-Drift). _growTreeNoise hängt an worldSeed (rebuild lazy),
            // _growTreeRing trägt alte Bauplan-Keys; grown_*-Baupläne räumt _loadStateRestoreGrownBlueprints.
            // Same-World-Reload ist sicher (gleicher Seed → Noise bit-identisch).
            this._growTreeNoise = null;
            this._growTreeRing = [];
            // V18.222 — Canopy-Chunks disposen (welt-spezifisch); _tickCanopyStreaming
            // baut den 3×3-Ring der neuen Welt lazy nach.
            if (typeof this._canopyDisposeAllChunks === "function") this._canopyDisposeAllChunks();
            // V18.224 — Scatter-Regionen disposen (welt-spezifisch, an worldSeed +
            // gebackene Felder gebunden). _tickScatterStreaming re-streut die neue
            // Welt lazy. Die promoteten Cells (echte Bäume) reisen via Snapshot.
            if (typeof this._disposeAllScatterRegions === "function") this._disposeAllScatterRegions();
            // STUFE 2 (das-feld-zeichnet §2) — der Fern-Ring trägt die Höhen der ALTEN
            // Welt (das EINE Gesetz liest den Welt-Seed): am Welt-Identitäts-Wechsel
            // entsorgen; der Tick baut die neue Welt lazy + budgetiert nach.
            if (typeof this._fernRingDispose === "function") this._fernRingDispose();
            // Merged Geometries sind welt-spezifisch (Keys `grown_<species>_<hash>`): beim Welt-Wechsel disposen,
            // lazy-rebuild im nächsten `_archFlattenBlueprint`. Materials NICHT hier disposen — sie sind im
            // archFlattenCache geteilt; das macht der archInstanceGroups-Disposer.
            if (this.state.archMergedGeomCache) {
                for (const entry of this.state.archMergedGeomCache.values()) {
                    if (entry && Array.isArray(entry.leaves)) {
                        for (const leaf of entry.leaves) {
                            if (leaf && leaf.geom && typeof leaf.geom.dispose === "function") leaf.geom.dispose();
                        }
                    }
                }
                this.state.archMergedGeomCache.clear();
            }
        }
        if (state.worldMeta && typeof state.worldMeta === "object") {
            // DIE WELTGRENZE: die geladene Welt ersetzt das worldMeta ganz (`_weltMetaWechsel`), das EINE Heil jeder Welt
            // heilt sie (Seed, Voxel-Boden), und die Gedächtnisse der Seite, die welt-eigene Felder spiegeln
            // (`AnazhRealm.WELT_GRENZE.gedaechtnis`: Erbgut-Merker, Ring, Vorschau, Dorf-Zug), fallen mit ihm — der
            // Heiß-Pfad liest den Erbgut-Merker direkt.
            this.state.worldMeta = this._weltMetaWechsel(state.worldMeta);
            AnazhRealm._weltMetaHeil(this.state.worldMeta);
            this._bewohnerFortAlle(); // die Leiber der Bewohner gehen vor ihrem Gedächtnis (`_bewohnerSiedlungen`)
            for (const k of AnazhRealm.WELT_GRENZE.gedaechtnis) this[k] = null;
        } else {
            // Ein Zustand ohne worldMeta ist keine Welt (ein Bruchstück: Baupläne, Hotbar, Seele) — er quert keine Grenze,
            // die Welt der Seite bleibt sie selbst.
            this.log("Save-Migration: kein worldMeta gefunden — die Welt der Seite bleibt", "INFO");
        }
        // Die Promotion der Streu rechnet der Weg neu (speicher.K3); ein älterer Stand trägt seine Liste
        // (`worldMeta.scatterPromoted`) mit den Bäumen, die sie promotete — sie bleibt im worldMeta und reist weiter.
        const promoviert = this.state.worldMeta && this.state.worldMeta.scatterPromoted;
        this.state.scatterPromoted = new Set(Array.isArray(promoviert) ? promoviert : []);
        // Scatter-Counters + Lookup-Buffer beim Welt-Wechsel resetten; sie bauen sich beim Stream neu.
        // Nicht persistiert (Session-Tatsache, kein Welt-Erbgut).
        if (!ort) {
            this.state.scatterCounters = { tree: 0, under: 0, stone: 0 };
            this.state.scatterLookup = new Map();
            // V18.218.1 — den LOD-Cursor zurücksetzen (rolling pointer; welt-bound).
            this._archLODCursor = 0;
        }
        // Migration: das Legacy-"private" wird zur kanonischen 4-Stufen-Form "privat"; unbekannte Werte
        // (Müll/Zukunft) fallen still auf den sicheren Default "privat".
        const wm = this.state.worldMeta;
        if (wm) {
            const vis = this._normalizeWorldVisibility(wm.visibility);
            wm.visibility = vis || "privat";
            const gr = this._normalizeGuestRights(wm.guestRights);
            wm.guestRights = gr || "frieden";
            // banList strukturell heilen — ein Snapshot mit Müll bekommt
            // saubere Arrays (keine Verlust-Heilung: kein Wert weg, nur Form).
            if (!wm.banList || typeof wm.banList !== "object") {
                wm.banList = { peerIds: [], vibePassKeys: [] };
            } else {
                if (!Array.isArray(wm.banList.peerIds)) wm.banList.peerIds = [];
                if (!Array.isArray(wm.banList.vibePassKeys)) wm.banList.vibePassKeys = [];
            }
        }
    }

    // Spieler-Seele + Custom-Seelen + Tag-Nacht + Atmosphäre. REIHENFOLGE: Custom-Seelen ZUERST (sonst
    // lehnt applyPlayerSoul eine gespeicherte Custom-Seele als „unbekannt" ab), dann playerSoul, dann
    // timeOfDay/dayLength/atmosphere, dann _applyDayNightToScene (Lights + Skybox sofort).
    _loadStateRestoreSoulAndAtmosphere(state) {
        if (state.customSouls && typeof state.customSouls === "object") {
            const restored = {};
            for (const key of Object.keys(state.customSouls)) {
                const entry = state.customSouls[key];
                if (!entry || !Array.isArray(entry.bodyParts)) continue;
                if (this.playerSoulDefs[key]) continue; // Built-in geschützt
                const valid = this.validateBlueprintParts(entry.bodyParts);
                if (!valid.ok) continue;
                restored[key] = {
                    name: key,
                    label: typeof entry.label === "string" ? entry.label : key,
                    bodyParts: valid.parts,
                    createdAt: Number(entry.createdAt) || 0,
                };
            }
            this.state.customSouls = restored;
        }
        // DER PRÄGUNGS-SPEICHER VOR playerSoul restaurieren (der Seelen-Guss liest _koerperStudioDials): jede Prägung läuft durch
        // DENSELBEN fail-closed-Prüfer wie der Übergabe-Kanal (`_studioWerkPruefen`, die Art aus dem Rezept). Müll fällt still.
        if (state.studioOv && typeof state.studioOv === "object" && !Array.isArray(state.studioOv)) {
            const ziel = (this._ensureWorkshopState().studioOv = {});
            for (const preset of Object.keys(state.studioOv)) {
                const e = state.studioOv[preset];
                const p = e && typeof e === "object" ? this._studioWerkPruefen(null, preset, e, e.__gestalt) : null;
                if (p && Object.keys(p).length) ziel[preset] = p;
            }
        }
        // an Ort und Stelle gießt nur eine andere Seele den Leib neu (`_standRueckspielen`)
        if (typeof state.playerSoul === "string" && !(this._ladeOrt && state.playerSoul === this.state.player.soul)) {
            const known =
                this.playerSoulDefs[state.playerSoul] ||
                (this.state.customSouls && this.state.customSouls[state.playerSoul]);
            if (known) {
                // Läuft der Boot-Defer (`_deferredAvatarSoul`), aktualisiert der Restore nur die WAHL — der EINE
                // Loop-Defer baut den Avatar (sonst zwei volle Körper-Builds + Dispose auf dem Boot).
                // Headless setzt den Defer nie (baut synchron) → dieser Zweig ist dort tot.
                if (this.state._deferredAvatarSoul) {
                    this.state._deferredAvatarSoul = state.playerSoul;
                    this.state.player.soul = state.playerSoul;
                } else {
                    this.applyPlayerSoul(state.playerSoul);
                }
            }
        }
        if (typeof state.timeOfDay === "number" && state.timeOfDay >= 0 && state.timeOfDay <= 1) {
            this._uhrSetzen(state.timeOfDay, "laden");
        }
        this._weltUhrNimm(state.spielZeit); // die Welt-Uhr des Stands (feld.K2#2)
        // das Jahr des Stands (speicher.K4): Tönung, Schneegrenze und Pegel folgen ihm im nächsten Takt der Saison (`_tickSeason`)
        if (typeof state.seasonPhase === "number" && state.seasonPhase >= 0 && state.seasonPhase < 1)
            this.state.seasonPhase = state.seasonPhase;
        // DER LEBENSZYKLUS ZÄHLT AB DER UHR DES STANDS (halten.K5): seine Marke (`faunaLifecycle.lastTick`) ist eine Lesung der
        // Welt-Uhr und reist nicht; an der gereisten Uhr fand die Null der Sitzung den letzten Takt so alt wie den Stand, und das
        // erste Bild der Wiederkehr zählte das Intervall, das die Welt des Stands schon gezählt hatte, ein zweites Mal (607d0c73:
        // der gebundene Fuchs starb im ersten Bild am Hunger, Alter 10 s). Die Tiere des Stands kehren jetzt wieder, ihr Takt mit.
        this.state.faunaLifecycle.lastTick = this.state.spielZeit;
        // `state.dayLengthMinutes` des Stands setzt der Restore NIE: die Tag-Länge ist die Wahl des Spielers (localStorage,
        // `setDayLength`) — der Kopf trägt sie nur für die Taille v1 (Leben-Schau 2, gate:wetter-wache (T)).
        // ERFINDER-WELLE — die Welt-Klang-Wahl (Genre-Id; der Konsument `_klangStudioPreset`
        // prueft LIVE gegen das Buch — ein stale Name faellt dort fail-soft aufs Host-Rezept).
        if (typeof state.klangPreset === "string" && state.klangPreset.length <= 64) {
            this.state.klangPreset = state.klangPreset;
        }
        // V18.387 (DAS NEUE KLEID — DIE LEISTUNGSREGLER): die vier Perf-Regler überleben den
        // Reload (V8.59-Klasse — sonst setzt jeder Welt-Wechsel sie still auf Default zurück).
        // Jeder Wert geclampt auf seinen Slider-Bereich; die Slider-DOM liest den State beim Init.
        {
            const pt = Number(state.perfTargetMs);
            if (Number.isFinite(pt)) this.state.perfTargetMs = Math.max(16, Math.min(34, pt)); // Ziel-FPS 30..60 → 33..16 ms
            const lr = Number(state.lodRef);
            if (Number.isFinite(lr)) this.state.lodRef = Math.max(4, Math.min(30, lr));
            // die Szenen-Skala (K50) — das alte Feld `foliageResCeiling` trug den Regler ohne Leser und fällt
            const sk = state.szeneSkala == null ? NaN : Number(state.szeneSkala);
            if (Number.isFinite(sk)) this.state.szeneSkala = Math.max(AnazhRealm.SZENE_SKALA_MIN, Math.min(1, sk));
            const rr = Number(state.chunkRingRadius);
            if (Number.isFinite(rr)) this.state.chunkRingRadius = Math.max(1, Math.min(12, rr));
            // V18.389 (P5) — die Perf-Panel-Sichtbarkeit überlebt den Reload (nur ein expliziter
            // Boolean übersteuert; fehlt das Feld [Alt-Snapshot], bleibt der Default an).
            if (typeof state.perfPanel === "boolean") this.state.perfPanel = state.perfPanel;
            if (typeof state.untertitel === "boolean") this.state.untertitel = state.untertitel;
        }
        if (state.atmosphere && typeof state.atmosphere === "object") {
            if (!this.state.atmosphere) this.state.atmosphere = { waterCull: 0.0025 };
            const wc = Number(state.atmosphere.waterCull);
            if (Number.isFinite(wc)) this.state.atmosphere.waterCull = Math.max(0.0, Math.min(0.05, wc));
            const lr = Number(state.atmosphere.waterLakeRipple);
            if (Number.isFinite(lr)) this.setLakeRipple(Math.max(0.0, Math.min(1.0, lr)));
            // V18.14 M1/M3 — die Makro-Kontext-Regler (vor dem Hydrosphäre-Mesh-Bau setzen,
            // (waterfallSteep-Restore V18.111 gefallen — A4)
            const df = Number(state.atmosphere.waterDepthFoam);
            if (Number.isFinite(df)) this.state.atmosphere.waterDepthFoam = Math.max(0.1, Math.min(6.0, df));
            // J4-Regler (cavityAO · kantenSchaerfe · triplanar · colorVar; Default = unverändert) geclampt über die
            // Setter; existieren die Uniforms noch nicht, liest `_ensure*` sie beim Bau.
            const ao = Number(state.atmosphere.cavityAO);
            if (Number.isFinite(ao)) this.setCavityAO(Math.max(0, Math.min(2, ao)));
            // die Kanten-Schärfe liest nur den Schlüssel der Foto-Kette (F1): das alte `edgeSharp` trug den Default 0,46 jedes Spielstands
            const es = Number(state.atmosphere.kantenSchaerfe);
            if (Number.isFinite(es)) this.setEdgeSharp(Math.max(0, Math.min(1, es)));
            const tri = Number(state.atmosphere.triplanar);
            if (Number.isFinite(tri)) this.setSurfaceTexture(Math.max(0, Math.min(4, tri)));
            const cv = Number(state.atmosphere.colorVar);
            if (Number.isFinite(cv)) this.setColorVariation(Math.max(0, Math.min(2, cv)));
            // (V18.106 — B3: terrainFlatten-Restore gefallen — gebacken in die Geometrie.)
            const sr = Number(state.atmosphere.shadowRange);
            if (Number.isFinite(sr)) this.setShadowRange(Math.max(80, Math.min(400, sr)));
            const sb = Number(state.atmosphere.shadowBias);
            if (Number.isFinite(sb)) this.setShadowBias(Math.max(0, Math.min(3, sb)));
            // §7.5/V18.164 — die M7-Regler überleben den Reload (Riss geheilt:
            // sie reisten weder im Snapshot noch hier). Setter clampen + pushen
            // an die Uniforms (oder _ensureAtmoUniforms liest sie beim Bau).
            const ms = Number(state.atmosphere.microStrength);
            if (Number.isFinite(ms)) this.setMicroStrength(ms);
            // V18.210 (§1-A2) — R5-Struktur-Boost (Settings-Slider „Struktur-Tiefe")
            // persistiert über den Reload (sonst rauscht der Slider beim Welt-Wechsel).
            const sb5 = Number(state.atmosphere.r5StructureBoost);
            if (Number.isFinite(sb5)) this.setStructureBoost(sb5);
        }
        if (typeof this._applyDayNightToScene === "function") {
            this._applyDayNightToScene();
        }
    }

    // Welle 6.D Etappe 3a/3b — Konsumables defensiv über createOrUpdateConsumable
    // (das tagBonus + duration prüft); Equipped-Slots defensiv über equipTool/
    // equipArmor (falls Tool/Armor weg ist, still fehlschlagen — Slot leer).
    _loadStateRestoreConsumablesAndEquipped(state) {
        if (state.consumables && typeof state.consumables === "object") {
            this.state.consumables = {};
            for (const key of Object.keys(state.consumables)) {
                const c = state.consumables[key];
                if (!c) continue;
                this.createOrUpdateConsumable(key, c.tagBonus, c.durationSeconds, c.label);
            }
        }
        if (state.playerEquipped && typeof state.playerEquipped === "object") {
            const pe = state.playerEquipped;
            // V17.57 W2-B — ein „held"-Slot; Alt-Saves (tool/weapon) wandern darauf (Waffe
            // bevorzugt, sonst Werkzeug — beide routen via equipHeld auf denselben Slot).
            if (pe.held) this.equipHeld(pe.held);
            else if (pe.weapon) this.equipHeld(pe.weapon);
            else if (pe.tool) this.equipHeld(pe.tool);
            if (pe.armor) this.equipArmor(pe.armor);
            // V18.109 — E8: die Off-Hand reist im selben playerEquipped-Objekt.
            if (pe.offhand && this.state.blueprints && this.state.blueprints[pe.offhand] && this.state.player) {
                this.state.player.equipped = this.state.player.equipped || { held: null, offhand: null, armor: null };
                this.state.player.equipped.offhand = pe.offhand;
                if (typeof this._refreshHeldMesh === "function") this._refreshHeldMesh();
            }
        }
    }

    // DIE LEBENSWERTE (halten.K5, `buildStateSnapshot` playerLeben): nach Seele und Gerät, die das Maximum setzen, die Wunde
    // des Tods und die Nahrung mit ihrer Restzeit (über `addPlayerBoost`, die EINE Boost-Tür), dann Leben, Ausdauer und Mana
    // als Anteil des neu gerechneten Maximums. Ein Stand ohne sie lädt voll.
    _loadStateRestoreLeben(state) {
        const L = state.playerLeben;
        const pl = this.state.player;
        if (!L || typeof L !== "object" || !pl) return;
        const anteil = (v, leer) => (Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : leer);
        pl.deathWoundIntensity = anteil(L.wunde, 0);
        for (const n of Array.isArray(L.nahrung) ? L.nahrung : [])
            if (n && String(n.quelle).startsWith("consume:") && n.rest > 0)
                this.addPlayerBoost({ source: n.quelle, tagDelta: n.tags, durationSeconds: n.rest, label: n.label });
        this.recomputePlayerStats();
        pl.hp = anteil(L.hp, 1) * pl.hpMax;
        pl.stamina = anteil(L.ausdauer, 1) * pl.staminaMax;
        pl.mana = anteil(L.mana, 1) * pl.manaMax;
    }

    // Crafting-Inventar — REIHENFOLGE: Materialien ZUERST (Part-Material-Referenzen in
    // validateBlueprintParts), dann Baupläne (Architekturen brauchen sie als Builder), dann Tools
    // (sourceBlueprint braucht den Bauplan). Der Bauplan-Feld-Satz lebt in `_deserializeBlueprint`.
    _loadStateRestoreCraftingInventory(state) {
        if (Array.isArray(state.materials)) {
            let restoredMats = 0;
            for (const m of state.materials) {
                if (!m || typeof m.name !== "string") continue;
                if (this.state.materials[m.name] && this.state.materials[m.name].builtIn) continue;
                const r = this.defineMaterial(m.name, m.color, m.tags || {});
                if (r.ok) {
                    restoredMats++;
                    // Substanz-Treue (taille-spec §2/§6): defineMaterial ist die [0,1]-Wand der lokalen Schöpfung, der
                    // RESTORE bewahrt die gespeicherte Substanz exakt — label, exakte Tag-Magnituden (die Klemme sitzt
                    // am LESER) inkl. fremder/künftiger Tag-Achsen + Unbekanntes.
                    const entry = this.state.materials[r.name];
                    if (typeof m.label === "string" && m.label) entry.label = m.label;
                    if (m.tags && typeof m.tags === "object") {
                        for (const k of Object.keys(m.tags)) {
                            const v = Number(m.tags[k]);
                            if (Number.isFinite(v)) entry.tags[k] = v;
                        }
                    }
                    this._carryUnknown(m, entry, AnazhRealm.MATERIAL_KNOWN_KEYS);
                }
            }
            this.log(`Materialien geladen: ${restoredMats} eigene`);
        }
        if (Array.isArray(state.blueprints)) {
            for (const bp of state.blueprints) {
                if (!bp || typeof bp.name !== "string") continue;
                if (this.state.blueprints[bp.name] && this.state.blueprints[bp.name].builtIn) continue;
                const restored = this._deserializeBlueprint(bp);
                if (restored) this.state.blueprints[restored.name] = restored;
            }
            this.log(`Baupläne geladen: ${state.blueprints.length} eigene`);
            // Role-Cache-Migration: Welten mit genVersion < 2 erben `bp.role: 'soul'` für Eichen, die die
            // livingCenterY-Wand heute als architecture klassifiziert (Krone oben, yNorm > 0.7) → alle emergenten
            // Rollen (roleManual=false) neu ableiten. roleManual=true (Portal-Ziel, Werkstatt) bleibt heilig.
            const genV = this.state.worldMeta && Number(this.state.worldMeta.genVersion);
            const needsRoleMigration = !Number.isFinite(genV) || genV < 2;
            if (needsRoleMigration && typeof this.computeBlueprintRole === "function") {
                let migrated = 0;
                for (const name of Object.keys(this.state.blueprints || {})) {
                    const bpEntry = this.state.blueprints[name];
                    if (!bpEntry || bpEntry.builtIn) continue;
                    if (bpEntry.roleManual) continue;
                    const oldRole = bpEntry.role;
                    const newRole = this.computeBlueprintRole(bpEntry);
                    if (newRole && oldRole !== newRole) {
                        bpEntry.role = newRole;
                        migrated++;
                    }
                }
                if (migrated > 0)
                    this.log(`Λ.1 Role-Migration: ${migrated} Bauplan-Rollen re-derived (genVersion < 2)`);
            }
        }
        if (Array.isArray(state.tools)) {
            let restoredTools = 0;
            for (const t of state.tools) {
                if (!t || typeof t.name !== "string") continue;
                if (this.state.tools[t.name] && this.state.tools[t.name].builtIn) continue;
                if (!AnazhRealm.TOOL_OP_CLASSES.has(t.opClass)) continue;
                if (!AnazhRealm.TOOL_OP_NAME_PATTERN.test(String(t.opName || ""))) continue;
                const cap = Number(t.precisionCap);
                this.state.tools[t.name] = {
                    name: t.name,
                    label: t.label || t.name,
                    opClass: t.opClass,
                    opName: t.opName,
                    precisionCap: Number.isFinite(cap) ? Math.max(0, Math.min(1, cap)) : 0.4,
                    isStarter: false,
                    builtIn: false,
                    sourceBlueprint: typeof t.sourceBlueprint === "string" ? t.sourceBlueprint : null,
                };
                // Ω2 — must-preserve NACH der opClass/opName-Wand (isMachine +
                // künftige Felder überleben den Reload; die Wand bleibt).
                this._carryUnknown(t, this.state.tools[t.name], AnazhRealm.TOOL_KNOWN_KEYS);
                if (!this.state.player.tools.includes(t.name)) this.state.player.tools.push(t.name);
                restoredTools++;
            }
            if (restoredTools > 0) this.log(`Eigene Werkzeuge geladen: ${restoredTools}`);
        }
    }

    // Gewachsene Baupläne aus dem Snapshot in state.blueprints + _growTreeRing, BEVOR die Architekturen
    // restored werden. Fehlt das Feld (alter Snapshot), re-generiert der nächste Streaming-Pass sie
    // deterministisch aus dem Welt-Seed.
    _loadStateRestoreGrownBlueprints(state) {
        if (!state || !state.grownBlueprints || typeof state.grownBlueprints !== "object") return;
        if (!this.state.blueprints) return;
        if (!this._growTreeRing) this._growTreeRing = [];
        let restored = 0;
        for (const key of Object.keys(state.grownBlueprints)) {
            const entry = state.grownBlueprints[key];
            if (!entry || !entry._grownSpecies || !entry._grownSeed) continue;
            // Robustheit gegen Built-in-Schatten: kein Wiederherstellen, wenn
            // der Key bereits als echter Built-in verdrahtet ist (sehr selten,
            // aber strukturell sauber — der Built-in gewinnt).
            if (this.state.blueprints[key] && !this.state.blueprints[key]._isGrown) continue;
            // Alte Snapshots tragen `entry.parts` → direkt nutzen; neue tragen NUR Metadata → re-wachsen via
            // `_growTreeBlueprint` (deterministisch: f(seed) ist das Erbgut).
            let parts = Array.isArray(entry.parts) ? entry.parts : null;
            if (!parts || parts.length < 4) {
                if (typeof this._growTreeBlueprint === "function") {
                    try {
                        parts = this._growTreeBlueprint(entry._grownSpecies, entry._grownSeed);
                    } catch (_e) {
                        parts = null;
                    }
                }
            }
            if (!Array.isArray(parts) || parts.length < 4) continue;
            const speciesLabel = String(entry._grownSpecies || "Baum")
                .replace(/^baum_/, "")
                .replace(/^./, (c) => c.toUpperCase());
            // `_isMerged` (gen ≥ 6) und `_skeleton` (gen ≥ 7) folgen aus der WELT-genVersion, nicht aus dem
            // Snapshot; gen < 6 baut Per-Part. `_growTreeBlueprint` setzt `_lastTreeSkeleton` als Side-Effect —
            // hier nach bp._skeleton übernommen.
            const genVRestore = typeof this._genVersion === "function" ? this._genVersion() : 1;
            const isMergedRestore = genVRestore >= 6;
            const skelRestore =
                genVRestore >= 7 && this._lastTreeSkeleton && Array.isArray(this._lastTreeSkeleton.branches)
                    ? this._lastTreeSkeleton
                    : null;
            // _variantIndex + _lodLevel MÜSSEN beim Restore mit — ohne sie setzt spawnArchitecture die
            // _lod*-Felder nicht und LOD-Switch + Promotion brechen. Aus dem KEY geparst (`grown_<species>_v<idx>`
            // / `..._lod<n>`): der Key trägt die Identität, keine eigene Persistenz nötig.
            const vMatch = /_v(\d+)(?:_lod(\d+))?$/.exec(key);
            const variantIndexRestore = vMatch ? parseInt(vMatch[1], 10) : null;
            const lodLevelRestore = vMatch && vMatch[2] != null ? parseInt(vMatch[2], 10) : 0;
            this.state.blueprints[key] = {
                name: key,
                label: typeof entry.label === "string" ? entry.label : `${speciesLabel} (gewachsen)`,
                builtIn: true,
                _isGrown: true,
                _grownSpecies: entry._grownSpecies || "baum_eiche",
                _grownSeed: entry._grownSeed || "",
                _isMerged: isMergedRestore,
                _skeleton: skelRestore,
                instanced: true,
                parts: parts,
            };
            if (Number.isFinite(variantIndexRestore)) {
                this.state.blueprints[key]._variantIndex = variantIndexRestore;
                this.state.blueprints[key]._lodLevel = lodLevelRestore;
            }
            // Skeleton übernommen → Side-Channel räumen (defensive).
            if (skelRestore) this._lastTreeSkeleton = null;
            if (this._growTreeRing.indexOf(key) === -1) this._growTreeRing.push(key);
            restored++;
        }
        if (restored > 0 && typeof this.log === "function") {
            this.log(`Γ7: ${restored} gewachsene Bauplane aus dem Save wiederhergestellt`, "DBG");
        }
    }

    // Die Höhe eines gespeicherten Orts über dem Boden des Gesetzes (cm-genau; undefined ohne Boden). Ein Haus auf seinem
    // EIGENEN Grund (S4, die Mitte auf dem Eintrag) misst den Boden unter dem Erdbau (`hoehe` ohne seinen Term), auf dem der
    // Boden-Umzug es wieder setzt, nie den Keller, den sein Grund gräbt — bis 24.10. schrieb ein Save nach dem Grund die Tiefe
    // des Kellers (2,26 m, ein Save davor 0; der Korpus, speicher.K5), und der Umzug stellte das Haus um sie über den Boden.
    _ueberGrund(p) {
        const G = globalThis.__gelaendeCore;
        const E = p ? this._erdbauLage() : null;
        const Z = G.ERDBAU.zelleM;
        const je = E ? E.grundZellen.get((Math.floor(p.x / Z) + 32768) * 65536 + (Math.floor(p.z / Z) + 32768)) : null;
        const eigen = (je || []).some(
            (i) => Math.abs(E.gruende[i].cx - p.x) < 0.05 && Math.abs(E.gruende[i].cz - p.z) < 0.05
        );
        const roh =
            eigen && (this._gelaendeRoh || (this._gelaendeRoh = Object.create(this._gelaende(), { erdbau: {} })));
        const g = !p ? NaN : roh ? G.hoehe(roh, p.x, p.z, true) : this._voxelSurfaceY(p.x, p.z);
        return Number.isFinite(g) && Number.isFinite(p.y) ? Math.round((p.y - g) * 100) / 100 : undefined;
    }

    _loadStateRestoreArchitectures(state, umzug) {
        // an Ort und Stelle (`_standRueckspielen`) bauen die Bauten nur neu, wenn ihr Bestand vom Grund abweicht (GRUND_TAFEL `bauten`)
        if (!Array.isArray(state.architectures) || !this.state.scene || this._ladeOrt) return;
        for (const old of this.state.architectures) {
            // V12.0-perf.c.2 — instancierte Einträge mit-cullen (Slots frei),
            // nicht nur die mit old.mesh (klassisch).
            if (old.mesh || old.instanced) {
                this._cullArchitectureMesh(old);
            }
            this._kronenStreuWeg("a:" + old.id); // der Respawn trägt die Krone neu ein (neue id)
        }
        // Saubere Tafel: alle Instancing-Gruppen abbauen (instanceMatrix-
        // Buffer frei; geteilte Geom/Mat im Flatten-Cache bleiben). Die
        // Respawn-Schleife baut sie lazy neu.
        this._archDisposeAllInstanceGroups();
        this.state.architectures = [];
        this._weltRegt(); // die Bau-Menge regt sich: die Stand-Wache weckt die Fege-Takte
        // Das neue Array ist ein neuer Bestand: die Nachbarschaft der Blocker (`_blockerNetz`) baut sich bei der nächsten Frage
        // aus ihm. `spawnArchitecture` setzt `entry.blockerAABBs` direkt (V9.65-Pro-Part-Logik bleibt).
        for (let i = 0; i < state.architectures.length; i++) {
            const a = state.architectures[i];
            // DER BODEN-UMZUG: auf einem neuen Boden steht der Bau in seiner Höhe über Grund (`_bodenUmzug`)
            if (a && a.position) this._bauAusStand(a, state, umzug && umzug.has(i) ? umzug.get(i) : null);
        }
        // DIE ALTEN ORTE ZIEHEN UM (K10 × Entscheid §5.4): jedes Haus eines Orts steht auf seinem Erdbau
        const geerdet = this._erdbauAltOrte(this.state.architectures, (e) => e.position.y);
        if (geerdet) this.log(`Erdbau: ${geerdet} Häuser eines älteren Stands auf ihren Grund geerdet.`, "INFO");
        // DER GRUNDRISS RÄUMT AUCH IM SAVE (Welle L): ein älterer Stand trägt Natur, die vor dem Dorf in seine Häuser
        // wuchs (der Wurf kam vor dem Haus), und Bäume über der Genesis-Scheibe — jeder Bau mit Grundriss (Haus, Lichtung)
        // räumt nach dem Laden, wie beim Gründen.
        let geraeumt = 0;
        for (const e of this.state.architectures.slice())
            if (this._grundrissVon(e)) geraeumt += this._grundrissRaeumen(e);
        if (geraeumt)
            this.log(`Grundriss: ${geraeumt} Natur-Stücke aus Häusern und Lichtung geräumt (älterer Stand).`, "INFO");
        this._worldgenBuildVoxelChunkCache(); // das Gesetz wirft neu, was der Stand nicht trägt (speicher.K3)
        this.log(`Architekturen geladen: ${state.architectures.length}`);
    }

    // EIN Bau des Stands steht wieder auf (die Lade-Kette `_loadStateRestoreArchitectures`, das Rückspielen `_standRueckspielen`):
    // `state` der Stand (seine Herkunft), `umzugY` die Höhe auf einem neuen Boden oder null. → der Eintrag oder null
    _bauAusStand(a, state, umzugY) {
        if (!a || typeof a.type !== "string" || !a.position) return null;
        // DER BAUPLAN-UMZUG: ein gefallener Bauplan steht als sein Erbe wieder auf (glut_var* → glutbrunnen).
        const typ = AnazhRealm.BAUPLAN_UMZUG[a.type] || a.type;
        const ort = umzugY != null ? { x: a.position.x, y: umzugY, z: a.position.z } : a.position;
        const entry = this.spawnArchitecture(typ, ort, {
            seed: a.seed,
            scale: a.scale,
            id: a.id,
            // W-H (V18.179) — die Pro-Instanz-Yaw reist durch den Reload mit.
            rotationY: Number.isFinite(a.rotationY) ? a.rotationY : 0,
            // V18.181-merge-Λ Sub 3d — Λ.2 (clever-gauss): die expliziten
            // Tint-Werte reisen mit (Welt-Identität). spawnArchitecture
            // priorisiert opts.tintH/S/V vor seed-Berechnung.
            tintH: a.tintH,
            tintS: a.tintS,
            tintV: a.tintV,
            // M6 — der Restore ist PRÄZISE (die Architektur stand, wo sie stand;
            // numerische Worldgen-ids fielen sonst durch den string-id-Opt-out).
            precise: true,
            // Ω5 — die Gratis-Geburt reist durch den Reload mit.
            freeBorn: a.freeBorn === true,
            // die Marke des Wurfs des Felds reist durch den Reload mit (`_weichtDemBau`)
            feldWurf: a.feldWurf === true,
            // die Herkunft des Werks reist durch den Reload mit (`_weichtDemBau`); ein Stand ohne die Zeile `herkunft` (vor
            // 22.10.) trug keine Marke — der Satz des Spielers setzte Zahlen-ids, und die Lichtung räumte sein Werk nach Stoff
            // (der Korpus, speicher.K5: der Stein-Block von V18.546.53 fiel). Dort ist Werk, was weder das Feld warf noch
            // nach Art Natur ist.
            werk: a.werk === true || (state.herkunft !== 1 && a.feldWurf !== true && !this._naturArt({ type: typ })),
            // PRÄGUNG-WELT — der Guss-Stempel reist durch den Reload mit
            // (spawnArchitecture ist der EINE Sanitize-Chokepoint).
            studioOv: a.studioOv,
            // DORF-IN-TERRAIN — der Fundament-Footprint reist durch den Reload
            // mit (derselbe EINE Sanitize-Chokepoint klemmt ihn).
            fundament: a.fundament,
            // DORF-ERLEBNIS — die Tür-Zeile reist durch den Reload mit.
            tuer: a.tuer,
            // KAMIN-RAUCH (.105) — Spitze reist durch den Reload mit.
            chimney: a.chimney,
        });
        // Φ7 (V18.190) — entry-level portalMeta nachhängen (Halle-Slots
        // tragen je eigene worldAddress; ohne diesen Schritt würden alle
        // Slot-Tore die Bauplan-default-Adresse zeigen).
        if (entry && a.portalMeta && typeof a.portalMeta === "object") {
            entry.portalMeta = a.portalMeta;
        }
        return entry;
    }

    // Ring 6.5 Hotbar (9 Slots, ungültige Bauplan-Refs → null), Welle 6.C1
    // Inventar (27 Slots, count ≥ 1, ganz), Welle 4 P3 Werkzeug-Besitz
    // (Starter bleiben, eigene zugefügt via Set-Union).
    _loadStateRestoreHotbarAndInventory(state) {
        if (Array.isArray(state.hotbar)) {
            const restored = [];
            // Ein Studio-Werk (haus_/fahrzeug_/tor_ …) hat seinen Bauplan erst mit dem Buch: bei kaltem Buch bleibt der
            // Name stehen, `_hotbarNachBuch` urteilt nach der Ankunft (sonst verlor jeder Reload die Werke des Gurts).
            const buchKalt = !(this._foundry && this._foundry.recipes);
            for (let i = 0; i < 9; i++) {
                const name = state.hotbar[i];
                if (
                    typeof name === "string" &&
                    (this.state.blueprints[name] ||
                        (buchKalt && this._foundryEnabled() && this._foundryNeedsBookForType(name)))
                ) {
                    restored.push(name);
                } else {
                    restored.push(null);
                }
            }
            this.state.hotbar = restored;
            this._renderHotbarDOM();
        }
        if (Array.isArray(state.playerInventory)) {
            const inv = new Array(27).fill(null);
            for (let i = 0; i < Math.min(27, state.playerInventory.length); i++) {
                const s = state.playerInventory[i];
                // die Zahl, die der Stapel trug (bis 24.10. kappte das Laden bei 999: ein Stapel aus dem Graben verlor den Rest)
                const cnt = Math.max(1, Math.floor(Number(s && s.count)) || 1);
                if (s && typeof s.blueprintName === "string" && this.state.blueprints[s.blueprintName]) {
                    inv[i] = { blueprintName: s.blueprintName, count: cnt };
                } else if (s && s.kind === "material" && this.state.materials[s.material]) {
                    inv[i] = { kind: "material", material: s.material, count: cnt };
                }
            }
            if (this.state.player) this.state.player.inventory = inv;
            this.log(`Inventar geladen: ${inv.filter(Boolean).length} Slots belegt`);
        }
        if (Array.isArray(state.playerTools)) {
            const valid = state.playerTools.filter((n) => typeof n === "string" && this.state.tools[n]);
            const set = new Set([...(this.state.player.tools || []), ...valid]);
            this.state.player.tools = Array.from(set);
        }
    }

    // Ring 3 Emotionen (nur bekannte Achsen, [0,1]-Clamp), Phase 4 DSL-Abilities
    // (Programm + Wrapper für „Führe Fähigkeit aus"), DSL-History (-historyCap),
    // Schicht 1 Pattern-Memory (per-Keyword Cap 8).
    _loadStateRestoreEmotionsAndDsl(state) {
        if (state.playerEmotions && typeof state.playerEmotions === "object") {
            for (const axis of Object.keys(this.state.player.emotions)) {
                const v = Number(state.playerEmotions[axis]);
                if (Number.isFinite(v)) {
                    this.state.player.emotions[axis] = Math.max(0, Math.min(1, v));
                }
            }
        }
        if (Array.isArray(state.dslAbilities)) {
            this.state.dsl.abilities = state.dslAbilities;
            for (const a of state.dslAbilities) {
                if (a && typeof a.name === "string" && Array.isArray(a.program)) {
                    this.state.abilities[a.name] = () => this.dslRun(a.program, { source: `ability:${a.name}` });
                }
            }
            this.log(`DSL-Abilities geladen: ${state.dslAbilities.length}`);
        }
        if (Array.isArray(state.dslHistory)) {
            this.state.dsl.history = state.dslHistory.slice(-this.state.dsl.historyCap);
        }
        if (state.dslPatternMemory && typeof state.dslPatternMemory === "object") {
            this.state.dsl.patternMemory = {};
            for (const [kw, list] of Object.entries(state.dslPatternMemory)) {
                if (!Array.isArray(list)) continue;
                this.state.dsl.patternMemory[kw] = list
                    .filter((e) => e && Array.isArray(e.program) && typeof e.fitness === "number")
                    .slice(0, this.state.dsl.patternMemoryCapPerKey || 8);
            }
        }
    }

    // Welt-Regeln wiederherstellen: jede FRISCH registriert (born=jetzt, fires=0, _sig neu), das
    // ttl-Fenster einer Nexus-Regel startet neu. Dedup über die Signatur (wie _registerWorldRule) + Cap.
    // Mutiert `state.worldRules` feldweise (kein Wholesale-Replace); ohne Feld bleibt das leere [].
    _loadStateRestoreWorldRules(state) {
        if (!Array.isArray(state.worldRules)) return;
        const cfg = AnazhRealm.WORLD_RULES;
        const now = this._taktUhr();
        const restored = [];
        for (const s of state.worldRules) {
            if (
                !s ||
                !Array.isArray(s.cond) ||
                s.cond.length === 0 ||
                !Array.isArray(s.effect) ||
                s.effect.length === 0
            )
                continue;
            if (restored.length >= cfg.cap) break;
            const source = typeof s.source === "string" ? s.source : "unknown";
            const everySec = this.dslClamp(s.everySec, cfg.minEverySec, 600) || cfg.defaultEverySec;
            const ttlSec = Number.isFinite(Number(s.ttlSec)) && Number(s.ttlSec) > 0 ? Number(s.ttlSec) : null;
            const sig = source + "|" + JSON.stringify(s.cond) + "|" + JSON.stringify(s.effect);
            if (restored.some((r) => r._sig === sig)) continue;
            restored.push({
                id: this.state.dsl.nextRuleId++,
                cond: s.cond,
                effect: s.effect,
                everySec,
                lastFired: -Infinity,
                fires: 0,
                source,
                ttlSec,
                born: now,
                _sig: sig,
                costMsSum: 0,
                errors: 0,
                fitness: 0,
                // V17.39 — die Schöpfer-Wahl überlebt den Reload (Favorit/adoptiert
                // + pausiert). Ein angepinntes Gesetz ist permanent (ttlSec oben
                // wäre dann ohnehin null) + von der Eviction geschützt.
                pinned: s.pinned === true,
                disabled: s.disabled === true,
            });
        }
        this.state.worldRules = restored;
        this._gemuetGesetze(); // die Gesetze des Gemüts stehen in jeder Welt, auch in einem Stand von vor affekt.K2
    }

    // Pfad-Buckets (defensiver Merge, fremde Keys ignoriert), Welt-Journal (entries + seen mit entryCap),
    // Legacy-Fähigkeiten (restoreAbility mappt drei historische Nexus-Namen auf ihre DSL-Äquivalente).
    _loadStateRestoreMiscState(state) {
        // halten.K4 — die steckenden Pfeile der Welt ersetzen die der Seite (`_pfeileSteckenLaden`, gedeckelt, endlich)
        this._pfeileSteckenLaden(state.pfeileStecken);
        // R6 (V18.152) — gewährte Fähigkeiten wiederherstellen, durch die
        // HEUTIGE Wand (Empfänger-Gesetz: auch Restauriertes prüft die
        // Regel-Wand + die Broadcast-Wand; Name id-förmig; bounded).
        if (state.grantedCapabilities && typeof state.grantedCapabilities === "object") {
            const out = {};
            let n = 0;
            for (const key of Object.keys(state.grantedCapabilities)) {
                if (n >= AnazhRealm.CAPABILITY_PROPOSAL_MAX) break;
                const c = state.grantedCapabilities[key];
                const name = String(key).trim().toLowerCase();
                if (!/^[a-z0-9_-]{1,32}$/.test(name)) continue;
                if (!c || !this._isRuleEffectAllowed(c.dsl)) continue;
                if (this._dslContainsAnyOp(c.dsl, AnazhRealm.NON_BROADCASTABLE_OPS)) continue;
                out[name] = {
                    name,
                    desc: typeof c.desc === "string" ? c.desc.slice(0, 120) : "",
                    dsl: JSON.parse(JSON.stringify(c.dsl)),
                    fromLabel: typeof c.fromLabel === "string" ? c.fromLabel.slice(0, 60) : "?",
                    fromWorldId: typeof c.fromWorldId === "string" ? c.fromWorldId.slice(0, 40) : "",
                    authorPubKey:
                        typeof c.authorPubKey === "string" && /^[0-9a-f]{64}$/i.test(c.authorPubKey)
                            ? c.authorPubKey.toLowerCase()
                            : "",
                    at: Number(c.at) || 0,
                    grantedAt: Number(c.grantedAt) || 0,
                };
                n++;
            }
            this.state.grantedCapabilities = out;
        }
        if (state.playerPathBuckets && typeof state.playerPathBuckets === "object") {
            const target = this.state.player.pathBuckets;
            for (const group of Object.keys(target)) {
                const src = state.playerPathBuckets[group];
                if (!src || typeof src !== "object") continue;
                for (const k of Object.keys(target[group])) {
                    if (typeof src[k] === "number") target[group][k] = src[k];
                }
            }
        }
        if (state.worldJournal && typeof state.worldJournal === "object") {
            const j = state.worldJournal;
            if (Array.isArray(j.entries)) {
                this.state.worldJournal.entries = j.entries
                    .filter((e) => e && typeof e.text === "string")
                    .slice(-this.state.worldJournal.entryCap);
            }
            if (j.seen && typeof j.seen === "object") {
                this.state.worldJournal.seen = { ...j.seen };
            }
        }
        if (Array.isArray(state.abilities)) {
            let restored = 0;
            state.abilities.forEach((name) => {
                if (this.state.abilities[name]) return;
                if (this.restoreAbility(name)) restored++;
            });
            if (restored > 0) this.log(`Legacy-Fähigkeiten migriert: ${restored}`);
        }
    }

    // DIE TÜR (Ring 8; seit tore-k5-tuer tauscht die Seite am Ort): eine andere Welt betritt die Seite — das Welt-Tor „Ersetzen", der
    // Snapshot eines Mitspielers (WS-Snapshot eines Resyncs, world-pull) und der Beitritt (Einladung, Adress-Portal:
    // `_importGuestWorld`). EINE Stelle, in dieser Folge:
    //   0. SICHERN: die Welt der Seite ist noch ganz sie selbst — ihr Zeugnis (`zeugnisA`, das Adress-Portal) und ihr
    //      Fortschritt seit dem letzten Autosave landen unter IHRER Id, bevor die neue Welt abgelegt wird (bis 10.10. fielen
    //      bei Ersetzen, world-pull und Einladung bis zu 10 s weg).
    //   1. IDENTITÄT: trägt sie keine worldId (ein Legacy-Save vor Ring 8, ein Minimal-Snapshot `{worldMeta:{}}`), bekommt sie
    //      ihre eigene (`_neueWeltId`) — nie den Platz der Welt davor. Bis 10.10. lag sie roh unter deren Id, und der Boot
    //      vergab vor dem Lesen des Platzes eine neue: beide Welten waren fort (Gegenprüfung Runde 3).
    //   2. ABLAGE: sie liegt, wie sie kam, unter ihrer Id (`_weltAblegen`, mit Probe) — misslingt das (Quota), bleibt die
    //      Seite in ihrer Welt und sagt es laut; kein Reload in einen alten Stand. `p2pAuto` (der Gast): danach die
    //      Auto-Verbindung zum Host.
    //   3. SPERRE, ZEIGER, WECHSEL AM ORT (`_weltWechsel`): die alte Welt geht ganz (`_weltAbschied`), die neue kommt an wie
    //      beim Boot — nie lädt die Seite sie über die alte (die lebte darin weiter: Tiere, Chunks, Worker, Wasser).
    // `meta` legt Felder ins worldMeta (der Gast: role, hostInfo, slug); `wechseln:false` legt nur ab (daneben legen, Tests),
    // `aktiv:false` lässt dann auch den Aktiv-Zeiger (daneben legen). → {ok, worldId|reason}
    _weltBetreten(snapshot, meta = null, { wechseln = true, aktiv = true, zeugnisA = null, p2pAuto = null } = {}) {
        if (!snapshot || typeof snapshot !== "object") return { ok: false, reason: "kein Snapshot" };
        if (!this._weltWechselSperre && this.state.worldMeta && this.state.worldMeta.worldId) {
            if (zeugnisA)
                this.journalAppendOnce(zeugnisA.key, zeugnisA.type || "portal", AnazhRealm._datum(zeugnisA.text));
            this.saveState();
        }
        const wm = snapshot.worldMeta && typeof snapshot.worldMeta === "object" ? snapshot.worldMeta : {};
        const welt = { ...snapshot, worldMeta: { ...wm, ...(meta || {}) } };
        // jede Erinnerung der fremden Welt ist Datum (`_erinnerungFuerKi`): ihr Stempel `d` fällt, wer ihn auch schrieb
        const wj = welt.worldJournal;
        if (wj && Array.isArray(wj.entries))
            welt.worldJournal = {
                ...wj,
                entries: wj.entries.map((e) => (e && typeof e === "object" ? { ...e, d: 0 } : e)),
            };
        if (typeof welt.worldMeta.worldId !== "string" || !welt.worldMeta.worldId)
            welt.worldMeta.worldId = AnazhRealm._neueWeltId();
        const ab = this._weltAblegen(welt, { aktiv: aktiv || wechseln });
        if (!ab.ok) {
            this.log(`Die Welt konnte nicht abgelegt werden (${ab.reason}) — die Seite bleibt in ihrer Welt.`, "ERROR");
            return ab;
        }
        if (p2pAuto) {
            try {
                localStorage.setItem("anazh.p2p.enabled", "true");
                localStorage.setItem("anazh.p2p.url", p2pAuto);
                localStorage.setItem("anazh.p2p.room", ""); // default = worldId = sync room
            } catch (e) {
                this.log(`Die Auto-Verbindung zum Host ließ sich nicht merken: ${e.message}`, "WARN");
            }
        }
        if (wechseln) this._weltWechsel(ab.worldId);
        return ab;
    }

    // DIE ABLAGE einer ganzen Welt, wie sie kam, unter IHRER Id (Per-Welt-Key + Index, mit `aktiv` der Aktiv-Zeiger), mit
    // Probe: der Speicher trägt danach genau diese Bytes. Ohne worldId legt sie nichts ab (die Tür vergibt sie). Der EINE
    // Schreiber neben saveState (der die lebende Welt schreibt): die Tür, die Geburt, daneben legen, die Fusion, die
    // Legacy-Migration. → {ok, worldId|reason}
    _weltAblegen(welt, { aktiv = true } = {}) {
        const m = welt && welt.worldMeta;
        const worldId = m && typeof m.worldId === "string" ? m.worldId : "";
        if (!worldId) return { ok: false, reason: "keine worldId" };
        try {
            const json = JSON.stringify(welt);
            const at = Date.now(); // EIN Stempel für den Platz und den atomaren Stand in IndexedDB (der Speicher-Faden schreibt)
            // DIE REIHENFOLGE: der Platz mit Probe, dann die Platte, zuletzt Index und Zeiger — wirft der Platz (Quota), erreicht
            // die Welt weder IndexedDB noch den Zeiger (bis speicher-gate schrieb der Faden sie vor der Probe: eine gescheiterte
            // Ablage lag als Waise in IndexedDB, unter der Id einer lebenden Welt über deren Stand)
            localStorage.setItem(this.worldStorageKey(worldId), json);
            if (localStorage.getItem(this.worldStorageKey(worldId)) !== json)
                return { ok: false, reason: "der Speicher trägt andere Bytes" };
            this._speicherAuftrag({ op: "ablegen", welt: worldId, at, json }, [], false);
            if (this._speicher && this._speicher.welt === worldId) this._speicher.welt = null; // der Faden hält ihr Modell nicht mehr
            this.worldsIndexUpsert({
                worldId,
                slug: m.slug || "",
                bornAt: m.bornAt || at,
                lastPlayed: at,
            });
            if (aktiv && !this.activeWorldSet(worldId))
                return { ok: false, reason: "der Aktiv-Zeiger ließ sich nicht setzen" };
            return { ok: true, worldId };
        } catch (e) {
            return { ok: false, reason: String((e && e.message) || e) };
        }
    }

    // DER WELT-WECHSEL AM ORT (Karte tore-k5-tuer): die Seite bleibt, die Welt tauscht — Renderer, Programme, Buch und Fäden
    // bleiben warm; bis hierhin lud jeder Wechsel die Seite neu und zahlte ihren Zweit-Boot (GTX 12,0 s, Pflicht-Offen B).
    // DIE EINE SPERRE (Gegenprüfung Runde 3, 10.10.): bis die alte Welt gegangen ist, schreibt die Seite nichts — der Edit-Timer
    // fällt, `saveState` (jeder Speicher-Weg der lebenden Welt geht durch ihn) verweigert, der Zeiger zeigt auf die Ziel-Welt;
    // im Fenster des Reloads schrieb die lebende Seite unter den Namen der Ziel-Welt (6 698 Bytes mit dem Tier der alten im
    // Platz der neuen) oder setzte den Zeiger zurück. Der Takt ruht (`_weltTausch`), der Ladeschirm steht. Der Tausch wartet auf
    // den Speicher-Faden (alles Gesendete fest, die verlassene Welt liegt als Platz, `_speicherVerlassen`), dann geht die alte
    // (`_weltAbschied`) und die Ziel-Welt kommt an wie beim Boot (`_weltAmOrt`). Sein Versprechen ist das Erwachen (`erwacht`,
    // die Welt-Warte jeder Linse). Bricht er, sagt es der EINE Melder, und die Seite lädt neu (die Ziel-Welt liegt unter dem
    // Zeiger). Rufer: jeder Welt-Wechsel (Neue Welt, Wechsel, daneben-und-springen, Fusion, die Tür `_weltBetreten`, der
    // Beitritt per Einladung und Adress-Portal).
    _weltWechsel(zielId) {
        this._weltWechselSperre = true;
        this._weltTausch = true;
        if (this._editSaveTimer) {
            clearTimeout(this._editSaveTimer);
            this._editSaveTimer = null;
        }
        if (zielId) this.activeWorldSet(zielId);
        const schirm = typeof document !== "undefined" && document.getElementById("ladeschirm");
        if (schirm) {
            schirm.hidden = false;
            schirm.classList.remove("weg");
        }
        this._ladeschirmStand("die Welt wechselt");
        const tausch = this._speicherVerlassen()
            .then(() => this._speicherStill())
            .catch((e) => this.log(`Der Speicher-Faden schloss die verlassene Welt nicht ab (${e.message}).`, "ERROR"))
            .then(() => this._weltAmOrt());
        this.erwacht = tausch.then(
            () => true,
            (e) => {
                const wo = String((e && e.stack) || "").split("\n")[1] || "";
                this._bruchMelden(
                    `WELT-WECHSEL: der Tausch am Ort brach (${(e && e.message) || e} ${wo.trim()}) — die Seite lädt neu`
                );
                if (typeof window !== "undefined" && window.location && typeof window.location.reload === "function")
                    window.location.reload();
                return false;
            }
        );
        return tausch;
    }

    // DIE ZIEL-WELT KOMMT AN (`_weltWechsel`): die alte geht (`_weltAbschied`), dann dieselben Glieder wie beim Boot (init) —
    // die Vorlade, die Ankunft (Leib, Stand, Buch, Gelände), der Anschluss; die Seite dazwischen (Welt-Info, Werkstatt) liest
    // die neue Welt. Der Null-Renderer zeigt kein Bild, auf das der Ladeschirm warten könnte: er weicht sofort, wie beim Boot.
    async _weltAmOrt() {
        // hatte die alte Welt ihr erstes Bild, sind die Vorräte der Seite über ihre Wartenden hinaus — ihre Aufträge im Flug fallen
        // mit dem Abschied, sie beginnen neu (`_foundryVorraete`); vorher reisen ihre Wartenden (`_weltAbschied`)
        const nachBild = !!this.state._weltbildDa;
        this._weltAbschied();
        if (nachBild) this._foundryVorraete();
        this._applyHolzProfil(this.state._holzProfil); // die Wahl des Geräts deckelt jede Welt (init: vor ihrem Stand)
        if (this.state.renderer._isHeadlessNull) this._weltbildSteht();
        this.p2pLoadPersisted();
        const verbunden = await this._weltVorlauf();
        this.updateWorldInfo();
        this._renderWorkshopDOM();
        this._updateBuildModeHud();
        this._weltWechselSperre = false;
        // das Start-Dorf der neuen Welt wartet am Buch wie beim Boot (init, B5): das Buch steht schon, sein Wecker läuft im selben
        // Augenblick der Ankunft wie dort (nach dem Stand, vor dem Gelände)
        this._startDorfAmBuch();
        await this._weltAnkunft();
        this._weltAnschluss(verbunden);
        this._weltTausch = false;
    }

    // DER ABSCHIED DER WELT AM ORT: was die Welt in die Seite legte, fällt — wie bei einem Reload, nur ohne die Seite. Ihre
    // Leitung schließt, was sie außerhalb der Szene auf der GPU hält, geht über seine Abschiede (Chunks und ihre Zellen im
    // Faden, Ring und Feld-Pass, Dach, Streu, Wasser), jede ihrer Gestalten verlässt die Szene (Senken und Render-Objekte lösen
    // sich, die Puffer nimmt der Kehraus). Die Wartenden der alten Welt an Foundry und Fäden verfallen (ihre Antworten finden
    // niemanden; die Pipeline bleibt im Cache), das Buch geht neu in die Welt (`_foundryWirtSteht`). Der Zustand wird frisch wie
    // bei der Geburt, die Seite reist (`_seite`, `WELT_GRENZE.seite`), jedes Feld am Wirt, das die Welt anlegte, fällt
    // (`WELT_GRENZE.wirt` bleibt), ihre Gedächtnisse auch. DER PROTOTYP TRÄGT NIE STAND: ein Feld dort überlebte jeden Abschied
    // unter dem Namen, der hier fällt, und die nächste Welt läse es — der Zensus der Prüfbühne weckte den Getter `dslPositions`
    // mit dem Prototyp als `this`, sein Speicher `_dslPositionsCache` rief nach dem Tausch `far_player` auf einem Zustand, den es
    // nicht gibt (Selbsttest blind). Trägt er Stand, bricht der Tausch beim Namen, bevor die alte Welt geht.
    _weltAbschied() {
        const P = AnazhRealm.prototype;
        const stand = Object.getOwnPropertyNames(P).filter((k) => {
            const d = Object.getOwnPropertyDescriptor(P, k);
            return "value" in d && typeof d.value !== "function";
        });
        if (stand.length) throw new Error(`der Prototyp trägt Stand (${stand.join(", ")})`);
        const alt = this.state;
        const G = AnazhRealm.WELT_GRENZE;
        const S = this._seite;
        this.shutdownP2PSync();
        for (const key of alt.voxelChunks ? [...alt.voxelChunks.keys()] : []) this._disposeVoxelChunk(key);
        this._fernRingDispose();
        this._canopyDisposeAllChunks();
        this._disposeAllScatterRegions();
        this._disposeHydrosphereMeshes();
        this._disposeFarWaterSheet();
        for (const o of [...alt.scene.children]) {
            if (S.szene.has(o)) continue;
            alt.scene.remove(o);
            const glieder = []; // erst gesammelt: ein Abschied (die Arena) nimmt Kinder aus dem Baum, den er geht
            o.traverse((x) => glieder.push(x));
            for (const x of glieder) x.isInstancedMesh ? this._instanzAbschied(x) : AnazhRealm._renderObjekteLoesen(x);
        }
        const f = this._foundry;
        if (f) {
            for (const k of f.pending.keys()) f.pending.set(k, () => {});
            Object.assign(f, {
                warte: [],
                zuege: new Map(),
                requested: new Set(),
                nachAtlas: [],
                wirt: false,
                buch: f.buchRoh,
            });
        }
        for (const n of this._nebenFaeden ? this._nebenFaeden.values() : []) n.pending = new Map();
        const neu = new AnazhRealm().state;
        const reist = new Set([...S.zustand, ...G.seite]);
        for (const k of reist) {
            const [a, b] = k.split(".");
            if (b) neu[a][b] = alt[a][b];
            else if (k in alt) neu[k] = alt[k];
        }
        if (neu.voxelWorker) neu.voxelWorkerPending = new Map();
        if (neu.workshop)
            Object.assign(neu.workshop, { studioOv: {}, selectedBlueprint: "baum_eiche", selectedRecipe: null });
        // DIE WARTENDEN DES ERSTEN BILDS REISEN (`_weltbildKommt`): die Vorräte der Seite (Bibliothek, Ofen und Glieder, die
        // Tor-Ziele) warten auf das erste Bild der SEITE — kam es in der alten Welt nicht mehr, ist es das der Ziel-Welt. Sonst
        // warteten sie auf einen Zustand, den es nicht mehr gibt: nach einem Tausch vor dem ersten Bild stand der Ofen-Vorrat nie
        // (`_ofenVorratSteht`, und ohne ihn gebiert `_kreaturenBereit` kein Tier), Radeon 30.10.
        if (!alt._weltbildDa && alt._weltbildWarten) neu._weltbildWarten = alt._weltbildWarten;
        const bleibtFeld = (k) => S.felder.has(k) || G.wirt.includes(k);
        // DIE KARTEN DER WELT (Texturen und Ziele in ihren Gliedern: Spiegel, March, Wege, Kronen) verlassen die GPU, wenn kein
        // bleibendes Glied sie trägt (der Kehraus nimmt nur Puffer)
        const karten = (v, aus, tiefe = 0) => {
            if (!v || typeof v !== "object" || tiefe > 4 || v.isObject3D || v.isMaterial || ArrayBuffer.isView(v))
                return;
            if (v.isTexture || v.isRenderTarget) return void aus.add(v);
            for (const x of v instanceof Map || v instanceof Set ? v.values() : Object.values(v))
                karten(x, aus, tiefe + 1);
        };
        const [bleibt, faellt] = [new Set(), new Set()];
        for (const k of Object.keys(alt)) karten(alt[k], reist.has(k) ? bleibt : faellt);
        for (const k of Object.keys(this)) if (k !== "state") karten(this[k], bleibtFeld(k) ? bleibt : faellt);
        for (const t of faellt) if (!bleibt.has(t)) this._queueDispose(t);
        this.state = neu;
        for (const k of Object.keys(this)) if (!bleibtFeld(k)) delete this[k];
        for (const k of G.gedaechtnis) this[k] = null;
        if (this._takt) this._gameLoopTick = this._takt; // was eine Linse am Takt hängte, fällt mit der Welt
    }

    // Globaler localStorage-Key `anazhRealmVersions` (versionsHistory ist nicht
    // per-Welt). Wird nur bei localStorage-Load gerufen, nicht bei externem
    // Import.
    _loadStateRestoreVersionHistory() {
        const savedVersions = localStorage.getItem("anazhRealmVersions");
        if (savedVersions) {
            this.state.versionHistory = JSON.parse(savedVersions);
        }
    }

    openStateFilePicker() {
        // Verwendet das versteckte <input type="file"> in index.html.
        const input = document.getElementById("state-file-input");
        if (!input) {
            this.log("File-Input #state-file-input fehlt – index.html prüfen", "ERROR");
            return;
        }
        input.value = ""; // erlaubt Re-Upload derselben Datei
        input.click();
    }

    handleStateFile(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const parsed = JSON.parse(reader.result);
                if (typeof parsed !== "object" || parsed === null) {
                    throw new Error("JSON-Wurzel muss ein Objekt sein");
                }
                // Import läuft durch das Welt-Tor: den geparsten Snapshot in state.pendingImport merken, Dialog zeigen
                // (ersetzen · daneben legen · fusionieren). Schließen verwirft den Import.
                this._openWeltTorDialog(parsed, file);
            } catch (e) {
                this.log(`Import fehlgeschlagen (${file.name}): ${e.message}`, "ERROR");
                const chatOutput = document.getElementById("chat-output");
                if (chatOutput) {
                    const line = document.createElement("div");
                    line.textContent = `Import fehlgeschlagen: ${e.message}`;
                    chatOutput.appendChild(line);
                    chatOutput.scrollTop = chatOutput.scrollHeight;
                }
            }
        };
        reader.onerror = () => {
            this.log(`FileReader-Fehler beim Lesen von ${file.name}`, "ERROR");
        };
        reader.readAsText(file);
    }

    // ### Welt-Tor (Drei-Wahl-Import-Dialog) ###
    // Die eingehende Datei liegt in `state.pendingImport`; Schließen ohne Wahl verwirft. Ersetzen ·
    // Daneben legen (NEUE worldId mit parentWorlds-Spur, beide Welten im Index) · Fusionieren.

    initWeltTorUI() {
        const dialog = document.getElementById("world-tor-dialog");
        if (!dialog) return;
        const replaceBtn = document.getElementById("world-tor-replace");
        const besideBtn = document.getElementById("world-tor-beside");
        const fuseBtn = document.getElementById("world-tor-fuse");
        const cancelBtn = document.getElementById("world-tor-cancel");
        if (replaceBtn) replaceBtn.addEventListener("click", () => this._weltTorImportReplace());
        if (besideBtn) besideBtn.addEventListener("click", () => this._weltTorImportBeside());
        if (fuseBtn) fuseBtn.addEventListener("click", () => this._weltTorImportFuse());
        if (cancelBtn) cancelBtn.addEventListener("click", () => this._closeWeltTorDialog());
        // Esc-Key schließt den Dialog (native <dialog>-Verhalten) — wir
        // verwerfen den pendingImport explizit, damit kein verwaister
        // Snapshot zurückbleibt.
        dialog.addEventListener("close", () => {
            this.state.pendingImport = null;
        });
    }

    _openWeltTorDialog(parsed, file) {
        // EIN PLAN DES GELÄNDE-STUDIOS klopft an wie eine Welt: die Tür macht aus ihm die Welt, die er beschreibt
        // (`_weltAusPlan`), dann wählt der Spieler wie bei jeder Datei. Ein Plan, den dieser Build nicht liest, fällt
        // benannt (fail-closed, nie still Wildnis).
        if (parsed && parsed.art === globalThis.__gelaendeCore.PLAN_ART) {
            try {
                parsed = this._weltAusPlan(parsed);
            } catch (e) {
                const grund = String((e && e.message) || e);
                this.log(grund, "ERROR");
                const chatOutput = typeof document !== "undefined" ? document.getElementById("chat-output") : null;
                if (chatOutput) {
                    const line = document.createElement("div");
                    line.textContent = grund;
                    chatOutput.appendChild(line);
                    chatOutput.scrollTop = chatOutput.scrollHeight;
                }
                return;
            }
        }
        this.state.pendingImport = { parsed, fileName: (file && file.name) || "unbekannt" };
        const dialog = document.getElementById("world-tor-dialog");
        const summary = document.getElementById("world-tor-summary");
        if (summary) {
            const m = parsed.worldMeta || {};
            const slug = m.slug || "(namenlos)";
            const ageDays = m.bornAt ? Math.floor((Date.now() - m.bornAt) / 86400000) : 0;
            const idShort = (m.worldId || "?").slice(0, 8);
            const bp = Array.isArray(parsed.blueprints) ? parsed.blueprints.length : 0;
            const arch = Array.isArray(parsed.architectures) ? parsed.architectures.length : 0;
            const journal =
                parsed.worldJournal && Array.isArray(parsed.worldJournal.entries)
                    ? parsed.worldJournal.entries.length
                    : 0;
            summary.textContent = `„${slug}" (ID ${idShort}…, ${ageDays} Tag${ageDays === 1 ? "" : "e"} alt, ${arch} Bauwerke, ${bp} eigene Baupläne, ${journal} Erinnerungen) klopft an dein Tor. Wie willst du sie empfangen?`;
        }
        if (dialog && typeof dialog.showModal === "function") {
            try {
                dialog.showModal();
            } catch {
                // Bereits offen — kein Drama, der State ist bereits gesetzt.
            }
        } else if (dialog) {
            dialog.setAttribute("open", "open");
        }
    }

    _closeWeltTorDialog() {
        const dialog = document.getElementById("world-tor-dialog");
        if (dialog && typeof dialog.close === "function") {
            try {
                dialog.close();
            } catch {
                // ignore
            }
        } else if (dialog) {
            dialog.removeAttribute("open");
        }
        this.state.pendingImport = null;
    }

    _weltTorImportReplace() {
        const pending = this.state.pendingImport;
        if (!pending || !pending.parsed) {
            this._closeWeltTorDialog();
            return;
        }
        const parsed = pending.parsed;
        const fileName = pending.fileName;
        const chatOutput = document.getElementById("chat-output");
        const erbgutNein = AnazhRealm._erbgutEinlass(parsed);
        if (erbgutNein) {
            if (chatOutput) {
                const line = document.createElement("div");
                line.textContent = `Ersetzen abgelehnt: ${erbgutNein}`;
                chatOutput.appendChild(line);
                chatOutput.scrollTop = chatOutput.scrollHeight;
            }
            this._closeWeltTorDialog();
            return;
        }
        // Die Datei wird die Welt der Seite — durch DIE TÜR `_weltBetreten` (Identität, Ablage mit Probe, Sperre, Reload);
        // das Zeugnis des Ersetzens reist in ihrem Journal. Bis 10.10. lud die Seite sie in sich und blieb in der alten
        // Welt: ihre Tiere, Chunks, Worker und Wasser trugen die neue, und jeder Autosave schrieb diese Mischung unter deren
        // Namen (gate:weltgrenze Weg „ersetzen": 74 Felder der alten Welt im Speicher der neuen, darunter ihr Erbgut und ein
        // Tier); eine Datei ohne worldId landete roh auf dem Platz der alten Welt, und beide waren fort.
        const neu = JSON.parse(JSON.stringify(parsed));
        AnazhRealm._zeugnisEintragen(neu, "Eine fremde Welt hat mich ersetzt.");
        this._closeWeltTorDialog();
        const r = this._weltBetreten(neu);
        if (chatOutput) {
            const line = document.createElement("div");
            line.textContent = r.ok
                ? `Datei ${fileName} importiert — die Welt erwacht neu.`
                : `Ersetzen fehlgeschlagen: ${fileName} ließ sich nicht ablegen (${r.reason}) — du bleibst in deiner Welt.`;
            chatOutput.appendChild(line);
            chatOutput.scrollTop = chatOutput.scrollHeight;
        }
    }

    _weltTorImportBeside() {
        const pending = this.state.pendingImport;
        if (!pending || !pending.parsed) {
            this._closeWeltTorDialog();
            return;
        }
        const parsed = pending.parsed;
        const fileName = pending.fileName;
        const result = this.importWorldBeside(parsed);
        const chatOutput = document.getElementById("chat-output");
        if (chatOutput) {
            const line = document.createElement("div");
            if (result.ok) {
                line.textContent = `Datei ${fileName} liegt nun als „${result.slug}" neben dir (ID ${result.worldId.slice(0, 8)}…).`;
            } else {
                line.textContent = `Daneben legen fehlgeschlagen: ${result.reason}`;
            }
            chatOutput.appendChild(line);
            chatOutput.scrollTop = chatOutput.scrollHeight;
        }
        if (result.ok) {
            this.journalAppend("witness", AnazhRealm._datum`Eine andere Welt „${result.slug}" liegt nun neben mir.`);
            this.updateWorldInfo();
        }
        this._closeWeltTorDialog();
    }

    _weltTorImportFuse() {
        // Fusionieren: die Welt erst still „daneben legen" (damit sie eine worldId im Index hat), dann den
        // Fusions-Dialog mit ihr als Eltern-B-Vorauswahl öffnen.
        const pending = this.state.pendingImport;
        if (!pending || !pending.parsed) {
            this._closeWeltTorDialog();
            return;
        }
        const result = this.importWorldBeside(pending.parsed);
        this._closeWeltTorDialog();
        if (result.ok) {
            this.updateWorldInfo();
            this._openWorldFusionDialog({ preselectB: result.worldId });
        } else {
            const chatOutput = document.getElementById("chat-output");
            if (chatOutput) {
                const line = document.createElement("div");
                line.textContent = `Fusion-Vorbereitung fehlgeschlagen: ${result.reason}`;
                chatOutput.appendChild(line);
                chatOutput.scrollTop = chatOutput.scrollHeight;
            }
        }
    }

    // ### Fusion-UI ###
    //   - initWorldFusionUI()        einmaliges Wiring beim init()
    //   - _openWorldFusionDialog()   füllt Dropdown + zeigt Dialog
    //   - _confirmWorldFusion()      liest Form-Werte, ruft fuseWorlds(reload:true)

    initWorldFusionUI() {
        const openBtn = document.getElementById("world-fuse-open");
        if (openBtn) openBtn.addEventListener("click", () => this._openWorldFusionDialog());
        const cancelBtn = document.getElementById("world-fusion-cancel");
        if (cancelBtn) cancelBtn.addEventListener("click", () => this._closeWorldFusionDialog());
        const confirmBtn = document.getElementById("world-fusion-confirm");
        if (confirmBtn) confirmBtn.addEventListener("click", () => this._confirmWorldFusion());
    }

    _openWorldFusionDialog({ preselectB = null } = {}) {
        const dialog = document.getElementById("world-fusion-dialog");
        if (!dialog) return;
        const parentALabel = document.getElementById("world-fusion-parent-a-label");
        const parentBSelect = document.getElementById("world-fusion-parent-b");
        const slugInput = document.getElementById("world-fusion-slug");
        const activeId = this.state.worldMeta && this.state.worldMeta.worldId;
        const activeSlug = (this.state.worldMeta && this.state.worldMeta.slug) || "(diese Welt)";
        if (parentALabel) parentALabel.textContent = activeSlug;
        if (parentBSelect) {
            parentBSelect.innerHTML = "";
            const others = this.worldsIndexLoad().filter((e) => e.worldId !== activeId);
            if (others.length === 0) {
                const opt = document.createElement("option");
                opt.value = "";
                opt.textContent = "— keine andere Welt im Speicher —";
                opt.disabled = true;
                parentBSelect.appendChild(opt);
            } else {
                others.sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0));
                for (const e of others) {
                    const opt = document.createElement("option");
                    opt.value = e.worldId;
                    opt.textContent = `${e.slug || "(namenlos)"} — ID ${e.worldId.slice(0, 8)}…`;
                    if (preselectB && e.worldId === preselectB) opt.selected = true;
                    parentBSelect.appendChild(opt);
                }
            }
        }
        if (slugInput) slugInput.value = "";
        // Strategie auf Default „sequence"
        const seqRadio = document.querySelector('input[name="fusion-strategy"][value="sequence"]');
        if (seqRadio) seqRadio.checked = true;
        if (typeof dialog.showModal === "function") {
            try {
                dialog.showModal();
            } catch {
                /* bereits offen */
            }
        } else {
            dialog.setAttribute("open", "open");
        }
    }

    _closeWorldFusionDialog() {
        const dialog = document.getElementById("world-fusion-dialog");
        if (!dialog) return;
        if (typeof dialog.close === "function") {
            try {
                dialog.close();
            } catch {
                /* ignore */
            }
        } else {
            dialog.removeAttribute("open");
        }
    }

    _confirmWorldFusion() {
        const parentBSelect = document.getElementById("world-fusion-parent-b");
        const slugInput = document.getElementById("world-fusion-slug");
        const strategyRadio = document.querySelector('input[name="fusion-strategy"]:checked');
        const activeId = this.state.worldMeta && this.state.worldMeta.worldId;
        const parentBId = parentBSelect && parentBSelect.value;
        const strategy = (strategyRadio && strategyRadio.value) || "sequence";
        const slug = (slugInput && slugInput.value.trim()) || null;
        const chatOutput = document.getElementById("chat-output");
        const speak = (text) => {
            if (chatOutput) {
                const line = document.createElement("div");
                line.textContent = text;
                chatOutput.appendChild(line);
                chatOutput.scrollTop = chatOutput.scrollHeight;
            }
        };
        if (!activeId) {
            speak("Fusion verweigert: aktive Welt fehlt.");
            return;
        }
        if (!parentBId) {
            speak("Fusion verweigert: keine zweite Welt gewählt.");
            return;
        }
        const result = this.fuseWorlds(activeId, parentBId, strategy, { slug, reload: true });
        if (!result.ok) {
            speak(`Fusion fehlgeschlagen: ${result.reason}`);
            this._closeWorldFusionDialog();
        }
        // Bei reload:true erreicht uns der Folge-Code nicht — der Browser
        // navigiert zur neuen Welt. Bei Test-Aufrufen ohne reload macht der
        // direkte Aufruf von fuseWorlds() die Arbeit.
    }

    // Stammbaum im Welt-Drawer rendern: Eltern-Welt-Liste mit Klick-Wechsel.
    _renderWorldLineage() {
        const list = document.getElementById("world-lineage");
        if (!list) return;
        const parents = Array.isArray(this.state.worldMeta && this.state.worldMeta.parentWorlds)
            ? this.state.worldMeta.parentWorlds
            : [];
        list.innerHTML = "";
        if (parents.length === 0) {
            list.textContent = "Diese Welt ist eigenständig — keine Eltern-Welten.";
            return;
        }
        const strategy = (this.state.worldMeta && this.state.worldMeta.fusionStrategy) || null;
        if (strategy) {
            const head = document.createElement("div");
            head.style.cssText = "margin-bottom:0.4em; opacity:0.78; font-style:italic;";
            head.textContent = `Fusion-Strategie: ${strategy}`;
            list.appendChild(head);
        }
        const idx = this.worldsIndexLoad();
        for (const parentId of parents) {
            const row = document.createElement("div");
            row.className = "lineage-entry";
            const entry = idx.find((e) => e.worldId === parentId);
            if (entry) {
                const link = document.createElement("button");
                link.type = "button";
                link.className = "lineage-link";
                link.textContent = entry.slug || "(namenlos)";
                link.addEventListener("click", () => this.switchToWorld(parentId, { reload: true }));
                row.appendChild(link);
                const meta = document.createElement("span");
                meta.style.cssText = "opacity:0.7; font-size:0.85em;";
                meta.textContent = `— ID ${parentId.slice(0, 8)}…`;
                row.appendChild(meta);
            } else {
                row.textContent = `(verloren) — ID ${parentId.slice(0, 8)}…`;
                row.style.opacity = "0.6";
            }
            list.appendChild(row);
        }
    }

    // DAS ZEUGNIS DES EMPFANGS im Journal eines Snapshots, bevor er Welt wird (das Welt-Tor: daneben, ersetzen). Ohne
    // Journal (Legacy/Minimal-Snapshot) wird der Behälter angelegt — sonst fiele der Eintrag still weg.
    static _zeugnisEintragen(snap, text, ctx) {
        if (!snap.worldJournal || typeof snap.worldJournal !== "object") {
            snap.worldJournal = { entries: [], seen: {} };
        }
        if (!Array.isArray(snap.worldJournal.entries)) {
            snap.worldJournal.entries = [];
        }
        if (!snap.worldJournal.seen || typeof snap.worldJournal.seen !== "object") {
            snap.worldJournal.seen = {};
        }
        text = String(text).replace(/[⁦-⁩]/g, ""); // der Spieler liest rein, `d: 0` macht ihn Datum
        const eintrag = { id: snap.worldJournal.entries.length + 1, at: Date.now(), tick: 0, type: "witness", text };
        if (ctx) eintrag.ctx = ctx;
        snap.worldJournal.entries.push(eintrag);
    }

    // Importierte Welt bekommt eine NEUE worldId (sonst überschriebe sie eine gleichnamige), behält Seed +
    // Inhalt, trägt die Original-ID in `parentWorlds`. Slug-Kollision → `-2`/`-3`/… wie createNewWorld.
    // Die aktive Welt bleibt; `reload` springt direkt in die importierte.
    // DIE WELT AUS EINEM PLAN (K16b): der Export des Gelände-Studios (`{ art: "gelaende-plan", v, saat, regler }`) wird die
    // Welt, die er beschreibt — eine frisch geborene Welt (wie „Neue Welt", vor ihrem Erst-Spawn) mit der Saat des Plans
    // und seinen Reglern im Erbgut (`planErbgut`), auf dem Grund des Kerns (`GRUND`). Die Welt erfindet nichts:
    // ihre Höhe ist `hoehe` an genau der Lage, die das Studio rechnete (`planLage`) — Studio = Welt byte-gleich
    // (gate:worker-dichte --studio). Wirft mit dem Grund, wenn der Plan nicht gelesen werden kann. Leser: die Welt-Tür
    // (`_openWeltTorDialog`) und das Studio („Welt bauen").
    _weltAusPlan(roh) {
        const G = globalThis.__gelaendeCore;
        const plan = G.planNormal(roh);
        const meta = this._generateFreshWorldMeta("gelaende");
        // der Varianten-Pool wächst je Art aus dieser Saat (`_variantSeedsFor`, K24) — die Meta trägt ihn leer
        meta.seed = plan.saat;
        const snap = this._buildEmptyWorldSnapshot(meta, false);
        snap.worldMeta.erbgut = G.planErbgut(plan);
        snap.worldMeta.voxelTerrain = true;
        return snap;
    }

    importWorldBeside(parsed, { reload = false } = {}) {
        if (!parsed || typeof parsed !== "object") {
            return { ok: false, reason: "kein gültiger Snapshot" };
        }
        const erbgutNein = AnazhRealm._erbgutEinlass(parsed);
        if (erbgutNein) return { ok: false, reason: erbgutNein };
        const originalMeta = parsed.worldMeta || {};
        const originalId = typeof originalMeta.worldId === "string" ? originalMeta.worldId : null;
        const originalSlug = (originalMeta.slug || "import")
            .toString()
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, "");
        // Slug-Eindeutigkeit gegen den lokalen Index.
        const usedSlugs = new Set(this.worldsIndexLoad().map((e) => e.slug));
        let slug = originalSlug || "import";
        if (usedSlugs.has(slug)) {
            let n = 2;
            while (usedSlugs.has(`${slug}-${n}`)) n++;
            slug = `${slug}-${n}`;
        }
        // Frische worldId — sonst würde ein lokal existierender Eintrag mit
        // identischer ID stillschweigend überschrieben.
        const newWorldId = AnazhRealm._neueWeltId();
        const bornAt = Date.now();
        // Importierter Snapshot wird tief geklont, dann mit neuer Identität
        // überschrieben. parentWorlds erbt jegliche bestehenden Eltern +
        // die Original-ID, damit der Stammbaum für Ring 10 ablesbar bleibt.
        const cloned = JSON.parse(JSON.stringify(parsed));
        const existingParents = Array.isArray(originalMeta.parentWorlds) ? [...originalMeta.parentWorlds] : [];
        const newParents = originalId ? [...existingParents, originalId] : existingParents;
        cloned.worldMeta = {
            ...originalMeta,
            worldId: newWorldId,
            slug,
            bornAt,
            parentWorlds: newParents,
            schemaVersion: "9.0-tor-v1",
        };
        // Der Import hält seinen Empfang als Witness-Eintrag mit Provenienz fest.
        AnazhRealm._zeugnisEintragen(
            cloned,
            AnazhRealm._datum`Ich wurde als „${slug}" neben einer fremden Welt empfangen.`,
            {
                fromWorldId: originalId,
                asWorldId: newWorldId,
                asSlug: slug,
            }
        );
        // durch DIE TÜR: die Welt der Seite sichert sich, die fremde liegt mit Probe unter ihrer neuen Id; mit `reload` der
        // Welt-Wechsel (Zeiger, Sperre, Reload), sonst bleibt die aktive Welt.
        const ab = this._weltBetreten(cloned, null, { wechseln: reload, aktiv: reload });
        if (!ab.ok) return { ok: false, reason: `Speicher voll: ${ab.reason}` };
        this.log(
            `Welt „${slug}" als ${newWorldId.slice(0, 8)}… neben uns gelegt (Parent: ${originalId || "keine"})`,
            "INFO"
        );
        return { ok: true, worldId: newWorldId, slug, parentWorlds: newParents };
    }

    // ### Welt-Fusion ###
    // Zwei Welten → eine dritte mit `parentWorlds = [idA, idB]`. Strategien: "sequence" (History A dann B,
    // Emotionen aus A) · "random-mix" (History 50:50 interleaved, Emotionen gemittelt) · "tag-merge"
    // (History wie sequence, Emotionen max). Inventar immer als Union (B-Kollision → `-fusion`);
    // Architekturen + Kreaturen starten leer; Journal = Genesis + top-3 je Elternteil mit Source-Marker.

    static FUSION_STRATEGIES = Object.freeze(["sequence", "random-mix", "tag-merge"]);

    // Fusions-Slug aus beiden Eltern-Slugs („aue-mein-x-hain"); Kollision → `-fusion`, `-fusion-2` …
    _generateFusionSlug(slugA, slugB, userOverride) {
        const usedSlugs = new Set(this.worldsIndexLoad().map((e) => e.slug));
        const fallback = `${slugA || "welt"}-x-${slugB || "welt"}`.replace(/[^a-z0-9_-]/gi, "").toLowerCase();
        let base = (userOverride || fallback).toLowerCase().replace(/[^a-z0-9_-]/g, "");
        if (!base) base = "fusion";
        let slug = base;
        if (usedSlugs.has(slug)) {
            // Erst -fusion versuchen, dann -fusion-2 etc.
            const withFusion = `${base}-fusion`;
            if (!usedSlugs.has(withFusion)) {
                slug = withFusion;
            } else {
                let n = 2;
                while (usedSlugs.has(`${withFusion}-${n}`)) n++;
                slug = `${withFusion}-${n}`;
            }
        }
        return slug;
    }

    // Union zweier Name→Objekt-Maps (Materialien/Werkzeuge/Baupläne): A bleibt, kollidierende B-Namen →
    // `<name>-fusion` (`-fusion-2` …); Built-ins ausgelassen (entstehen aus _default*). `renameMap`
    // sammelt die B-Umbenennungen, damit der Aufrufer Querverweise (sourceBlueprint, refName) mitzieht.
    _mergeOwnNamedItems(arrA, arrB, renameMap = null) {
        const out = [];
        const seen = new Set();
        const ownA = Array.isArray(arrA) ? arrA.filter((x) => x && !x.builtIn) : [];
        const ownB = Array.isArray(arrB) ? arrB.filter((x) => x && !x.builtIn) : [];
        for (const item of ownA) {
            if (!item.name || seen.has(item.name)) continue;
            seen.add(item.name);
            out.push(item);
        }
        for (const item of ownB) {
            if (!item.name) continue;
            let name = item.name;
            if (seen.has(name)) {
                name = `${item.name}-fusion`;
                let n = 2;
                while (seen.has(name)) name = `${item.name}-fusion-${n++}`;
            }
            seen.add(name);
            if (renameMap && name !== item.name) {
                renameMap[item.name] = name;
            }
            out.push({ ...item, name });
        }
        return out;
    }

    // Wendet die B-Umbenennungen aus `renameMap` auf eingebettete Querverweise an
    // (Werkzeug.sourceBlueprint, part.refName) — sonst zeigt ein B-Werkzeug auf den alten Namen. Mutiert
    // nur B-Anteile (ab Index sourceAStart); A behält seine Namen.
    _rewireBlueprintRefs(mergedBlueprints, mergedTools, bpRenameMap) {
        if (!bpRenameMap || Object.keys(bpRenameMap).length === 0) return;
        // Cross-Refs in mergedBlueprints (fraktale Baupläne mit refName)
        for (const bp of mergedBlueprints) {
            if (!bp || !Array.isArray(bp.parts)) continue;
            for (const part of bp.parts) {
                if (part && typeof part.refName === "string" && bpRenameMap[part.refName]) {
                    part.refName = bpRenameMap[part.refName];
                }
            }
        }
        // Werkzeug-zu-Bauplan-Bindung (sourceBlueprint)
        for (const tool of mergedTools) {
            if (tool && typeof tool.sourceBlueprint === "string" && bpRenameMap[tool.sourceBlueprint]) {
                tool.sourceBlueprint = bpRenameMap[tool.sourceBlueprint];
            }
        }
    }

    // Top-K Erinnerungen: Genesis-Eintrag + die jüngsten K-1 übrigen, je mit Source-Marker im ctx.
    _selectFusionJournalEntries(journal, source, K = 4) {
        if (!journal || !Array.isArray(journal.entries)) return [];
        const entries = journal.entries;
        const genesis = entries.find((e) => e && e.type === "genesis");
        const recent = entries.filter((e) => e && e.type !== "genesis").slice(-(K - (genesis ? 1 : 0)));
        const picks = genesis ? [genesis, ...recent] : recent.slice(-K);
        return picks.map((e) => ({
            ...e,
            ctx: { ...(e.ctx || {}), _fusionSource: source },
        }));
    }

    // Der EINE Import-Eingang für fremde Bauplan-Artefakte (importRecipesFromWorld + künftige), Wände in
    // fester Reihenfolge: (1) R4-Rückruf-Sieb am Eingang; (2) _deserializeBlueprint (Parts-Migration,
    // connections, portalMeta-Sanitize, carry) — nie roher {...bp}-Spread; (3) gereiste Rolle →
    // roleClaimed, fremdes roleManual fällt, lokale role emergiert; (4) Herkunft wächst nur bei echter
    // Kette, Signatur-Status async gestempelt (nur Anzeige). Liefert Bauplan oder null.
    _admitForeignArtifact(rawBp) {
        if (!rawBp || typeof rawBp !== "object") return null;
        if (this._artifactProvenanceTainted(rawBp)) return null;
        const restored = this._deserializeBlueprint(rawBp);
        if (!restored) return null;
        const claimed =
            typeof restored.roleClaimed === "string" && restored.roleClaimed
                ? restored.roleClaimed
                : typeof rawBp.role === "string"
                  ? rawBp.role
                  : "";
        delete restored.roleManual;
        if (claimed) restored.roleClaimed = claimed;
        restored.role = this.computeBlueprintRole(restored);
        const myKey = this.state.vibePass && this.state.vibePass.publicKeyHex;
        if (myKey && Array.isArray(restored.provenance) && restored.provenance.length) {
            this._appendProvenance(restored, myKey);
        }
        if (restored.signature) {
            this.verifyBlueprintSignature(restored)
                .then((st) => {
                    restored.signatureStatus = st;
                })
                .catch(() => {});
        }
        return restored;
    }

    importRecipesFromWorld(sourceWorldId) {
        if (!sourceWorldId || typeof sourceWorldId !== "string") {
            return { ok: false, reason: "keine Quell-Welt-ID" };
        }
        if (sourceWorldId === (this.state.worldMeta && this.state.worldMeta.worldId)) {
            return { ok: false, reason: "Quelle = aktive Welt" };
        }
        const raw = localStorage.getItem(this.worldStorageKey(sourceWorldId));
        if (!raw) return { ok: false, reason: "Quelle nicht im Speicher" };
        let sourceSave;
        try {
            sourceSave = JSON.parse(raw);
        } catch (e) {
            return { ok: false, reason: `Quell-Save ungültig: ${e.message}` };
        }

        // Quell-Inventar tief klonen, sonst würden Mutationen in der aktiven
        // Welt zurück in das Quell-Save bluten.
        const sourceBPs = Array.isArray(sourceSave.blueprints) ? JSON.parse(JSON.stringify(sourceSave.blueprints)) : [];
        const sourceMats = Array.isArray(sourceSave.materials) ? JSON.parse(JSON.stringify(sourceSave.materials)) : [];
        const sourceTools = Array.isArray(sourceSave.tools) ? JSON.parse(JSON.stringify(sourceSave.tools)) : [];

        // Vorhandene Namen in der aktiven Welt sammeln (inkl. Built-ins,
        // damit ein importierter "village" auch zu "village-import" wird).
        const existingBPNames = new Set(Object.keys(this.state.blueprints || {}));
        const existingMatNames = new Set(Object.keys(this.state.materials || {}));
        const existingToolNames = new Set(Object.keys(this.state.tools || {}));

        const renameMap = {};
        const addedBPs = [];
        const addedMats = [];
        const addedTools = [];

        const resolveName = (origName, taken) => {
            if (!taken.has(origName)) return origName;
            let candidate = `${origName}-import`;
            let n = 2;
            while (taken.has(candidate)) candidate = `${origName}-import-${n++}`;
            return candidate;
        };

        // Materialien ZUERST anwenden: _deserializeBlueprint migriert unbekannte Material-Namen auf „stein" —
        // die fremden Definitionen müssen vorher im state stehen (sonst Substanz-Verlust). Fehlende Tag-Felder
        // mit Defaults auffüllen; Magnituden bleiben EXAKT (die Klemme sitzt am Leser, computePartTags).
        const tagDefaults = AnazhRealm.MATERIAL_TAG_DEFAULTS;
        for (const m of sourceMats) {
            if (!m || typeof m.name !== "string" || m.builtIn) continue;
            const newName = resolveName(m.name, existingMatNames);
            existingMatNames.add(newName);
            addedMats.push({ ...m, name: newName, builtIn: false });
        }
        for (const m of addedMats) {
            this.state.materials[m.name] = {
                ...m,
                tags: { ...tagDefaults, ...(m.tags || {}) },
            };
        }

        for (const bp of sourceBPs) {
            if (!bp || typeof bp.name !== "string" || bp.builtIn) continue;
            // Ω3(c) — der EINE Eingang: Rückruf-Sieb + Restore-Wand +
            // Behauptung/Wahrheit + Herkunft (statt des rohen {...bp}-Spreads).
            const admitted = this._admitForeignArtifact(bp);
            if (!admitted) continue;
            const newName = resolveName(bp.name, existingBPNames);
            existingBPNames.add(newName);
            if (newName !== bp.name) renameMap[bp.name] = newName;
            admitted.name = newName;
            addedBPs.push(admitted);
        }
        for (const t of sourceTools) {
            if (!t || typeof t.name !== "string" || t.builtIn) continue;
            // Ω3 — dieselbe Wand wie der Save-Restore: opClass/opName sind
            // whitelisted (der rohe Spread ließ vorher alles durch).
            if (!AnazhRealm.TOOL_OP_CLASSES.has(t.opClass)) continue;
            if (!AnazhRealm.TOOL_OP_NAME_PATTERN.test(String(t.opName || ""))) continue;
            const newName = resolveName(t.name, existingToolNames);
            existingToolNames.add(newName);
            addedTools.push({ ...t, name: newName, builtIn: false });
        }

        // Cascade-Rewire: Werkzeug.sourceBlueprint + fractal.refName folgen
        // den Bauplan-Umbenennungen. Selbe Logik wie Fusion — kein Drift.
        this._rewireBlueprintRefs(addedBPs, addedTools, renameMap);

        // Anwenden auf state (Materialien stehen schon — siehe oben).
        for (const bp of addedBPs) {
            this.state.blueprints[bp.name] = bp;
        }
        for (const t of addedTools) {
            this.state.tools[t.name] = t;
        }

        const sourceMeta = sourceSave.worldMeta || {};
        const sourceSlug = sourceMeta.slug || "(unbenannt)";
        const total = addedBPs.length + addedMats.length + addedTools.length;
        this.journalAppend(
            "witness",
            AnazhRealm._datum`Ich habe Rezepte aus „${sourceSlug}" empfangen: ${addedBPs.length} Baupläne, ${addedMats.length} Materialien, ${addedTools.length} Werkzeuge.`,
            {
                fromWorldId: sourceWorldId,
                fromSlug: sourceSlug,
                counts: { blueprints: addedBPs.length, materials: addedMats.length, tools: addedTools.length },
                renameMap: { ...renameMap },
            }
        );

        // Save + Re-Render
        try {
            this.saveState();
        } catch (err) {
            this.log(`Save nach Recipe-Import fehlgeschlagen: ${err.message}`, "WARN");
        }
        if (typeof this._renderWorkshopDOM === "function") this._renderWorkshopDOM();
        this.updateWorldInfo();

        this.log(
            `Rezepte aus ${sourceSlug} importiert: ${total} (Baupläne ${addedBPs.length}, Materialien ${addedMats.length}, Werkzeuge ${addedTools.length})`,
            "INFO"
        );
        return {
            ok: true,
            counts: { blueprints: addedBPs.length, materials: addedMats.length, tools: addedTools.length },
            renameMap,
        };
    }

    fuseWorlds(idA, idB, strategy, { slug = null, reload = false } = {}) {
        if (!idA || !idB || idA === idB) {
            return { ok: false, reason: "zwei verschiedene Eltern-IDs nötig" };
        }
        if (!AnazhRealm.FUSION_STRATEGIES.includes(strategy)) {
            return { ok: false, reason: `unbekannte Strategie: ${strategy}` };
        }
        // Führt die Fusion in die neue Welt (reload), sichert sich die Welt der Seite zuerst — ihr Fortschritt seit dem
        // letzten Autosave fiele sonst hinter die Sperre des Welt-Wechsels. Die lebende Welt liegt nicht auf ihrem Platz (der
        // Speicher-Faden schreibt sie nach IndexedDB): ist sie ein Elternteil, ist ihr Stand der der Seite.
        const hier = this.state.worldMeta && this.state.worldMeta.worldId;
        if (reload && hier) this.saveState();
        const roh = (id) =>
            id === hier ? JSON.stringify(this.buildStateSnapshot()) : localStorage.getItem(this.worldStorageKey(id));
        const rawA = roh(idA);
        const rawB = roh(idB);
        if (!rawA || !rawB) {
            return { ok: false, reason: "Eltern-Welt nicht im Speicher" };
        }
        let saveA, saveB;
        try {
            saveA = JSON.parse(rawA);
            saveB = JSON.parse(rawB);
        } catch (err) {
            return { ok: false, reason: `Parent-Save ungültig: ${err.message}` };
        }

        const identity = this._fusionGenerateIdentity(saveA, saveB, rawA, rawB, strategy, slug);
        const inventory = this._fusionMergeInventory(saveA, saveB);
        const mergedEmotions = this._fusionMergeEmotions(saveA, saveB, strategy);
        const mergedHistory = this._fusionMergeDslHistory(saveA, saveB, strategy, identity.muenze);
        const mergedPatternMemory = this._fusionMergePatternMemory(saveA, saveB);
        const mergedAbilities = this._fusionMergeAbilities(saveA, saveB);
        const mergedWorldRules = this._fusionMergeWorldRules(saveA, saveB);
        const mergedPathBuckets = this._fusionMergePathBuckets(saveA, saveB);
        const fusedEntries = this._fusionBuildJournalEntries(saveA, saveB, idA, idB, identity, strategy);

        // Terrain-Parameter mitteln, Wetter aus A.
        const steepness =
            ((Number.isFinite(saveA.terrainSteepness) ? saveA.terrainSteepness : 1.0) +
                (Number.isFinite(saveB.terrainSteepness) ? saveB.terrainSteepness : 1.0)) /
            2;
        const baseHeight =
            ((Number.isFinite(saveA.terrainBaseHeight) ? saveA.terrainBaseHeight : 0.0) +
                (Number.isFinite(saveB.terrainBaseHeight) ? saveB.terrainBaseHeight : 0.0)) /
            2;
        const weather = saveA.weather || saveB.weather || "sunny";

        const snap = {
            // V18.95 — null wie im leeren createNewWorld-Snapshot: die
            // Fusions-Welt ist VOR ihrem Erst-Spawn → der Reload fährt den
            // Genesis-Spawn (offener Punkt + Plattform) auf dem NEUEN Terrain.
            playerPosition: null,
            knowledgeBase: [
                ...((Array.isArray(saveA.knowledgeBase) && saveA.knowledgeBase.slice(-100)) || []),
                ...((Array.isArray(saveB.knowledgeBase) && saveB.knowledgeBase.slice(-100)) || []),
            ].slice(-200),
            version: this.state.currentVersion || "7.71",
            selfAwareness: { components: [], weaknesses: [] },
            creatures: [],
            creatureEmotions: [],
            terrainSteepness: steepness,
            terrainBaseHeight: baseHeight,
            weather,
            worldMeta: {
                worldId: identity.newWorldId,
                slug: identity.finalSlug,
                creator: "local",
                visibility: "privat",
                parentWorlds: [idA, idB],
                bornAt: identity.bornAt,
                seed: identity.newSeed,
                fusionStrategy: strategy,
                schemaVersion: "10.0-fusion-v1",
                // Γ1/Γ4 (genese-plan) — die Fusion gebiert NEUES Terrain (newSeed):
                // kein Gesicht zu bewahren → die heutige Genese-Version (V18.179: 3).
                genVersion: 3,
            },
            dslAbilities: mergedAbilities,
            dslHistory: mergedHistory,
            // Die fusionierte Welt trägt die Union beider Regel-Sätze (Dedup über die Signatur).
            worldRules: mergedWorldRules,
            dslPatternMemory: mergedPatternMemory,
            playerPathBuckets: mergedPathBuckets,
            worldJournal: { entries: fusedEntries, seen: { genesis: true } },
            playerEmotions: mergedEmotions,
            playerSoul: saveA.playerSoul || "human",
            playerTools: inventory.playerToolsUnion,
            architectures: [],
            blueprints: inventory.mergedBlueprints,
            tools: inventory.mergedTools,
            materials: inventory.mergedMaterials,
            hotbar: Array.isArray(saveA.hotbar) ? saveA.hotbar.slice(0, 9) : [],
        };

        // dieselbe Fusion lebt schon (gleiche Eltern-Bytes, gleiche Strategie → dieselbe Id): sie IST diese Welt, ihr Leben seither
        // fällt nicht unter eine frische Geburt
        const da = localStorage.getItem(this.worldStorageKey(identity.newWorldId)) !== null;
        const ab = da ? { ok: true } : this._weltAblegen(snap, { aktiv: false });
        if (!ab.ok) return { ok: false, reason: `Speicher voll: ${ab.reason}` };
        this.log(
            `Welt-Fusion: ${identity.slugA} ⊕ ${identity.slugB} → ${identity.finalSlug} (Strategie ${strategy}, ID ${identity.newWorldId.slice(0, 8)}…)`,
            "INFO"
        );

        if (reload) this._weltWechsel(identity.newWorldId);
        return {
            ok: true,
            worldId: identity.newWorldId,
            slug: identity.finalSlug,
            parentWorlds: [idA, idB],
            strategy,
        };
    }

    // DIE FUSION IST EINE FUNKTION IHRER EINGABEN (ultiversum K2): Id, Saat und Münzwurf ziehen die Ströme (`_streamRng`)
    // EINES Schlüssels aus Strategie und den Bytes beider Eltern — gerichtet (A ist die Welt der Seite: ihre History zuerst,
    // ihr Wetter, ihre Seele), auf jedem Gerät und in jedem Lauf dieselbe Welt; die Geburt ist der jüngste Moment der Eltern
    // (ihre Geburt, ihr letzter Journal-Eintrag), nie die Wanduhr. Bis 27.10. würfelten randomUUID, Math.random und Date.now.
    _fusionGenerateIdentity(saveA, saveB, rawA, rawB, strategy, slugHint) {
        const schluessel = `fusion:${strategy}:${this._fastHash(rawA)}${rawA.length}:${this._fastHash(rawB)}${rawB.length}`;
        const id = this._streamRng(schluessel + "-identitaet");
        const hex = () => ((id() * 4294967296) >>> 0).toString(16).padStart(8, "0");
        const h = hex() + hex() + hex() + hex();
        const newWorldId = `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
        const slugA = (saveA.worldMeta && saveA.worldMeta.slug) || "welt-a";
        const slugB = (saveB.worldMeta && saveB.worldMeta.slug) || "welt-b";
        const finalSlug = this._generateFusionSlug(slugA, slugB, slugHint);
        const newSeed = `w-fusion-${h.slice(0, 12)}-${hex().slice(0, 6)}`;
        const momente = [saveA, saveB].flatMap((s) => [
            s.worldMeta && s.worldMeta.bornAt,
            ...((s.worldJournal && Array.isArray(s.worldJournal.entries) && s.worldJournal.entries) || []).map(
                (e) => e && e.at
            ),
        ]);
        const bornAt = Math.max(0, ...momente.filter(Number.isFinite));
        return {
            newWorldId,
            slugA,
            slugB,
            finalSlug,
            newSeed,
            bornAt,
            muenze: this._streamRng(schluessel + "-muenze"),
        };
    }

    // Inventar-Union, gleich für alle Strategien. Tiefe Kopie via JSON (Mutationen dürfen nicht in die
    // Eltern-Saves bluten); `bpRenameMap` trackt Umbenennungen für das Rewiring der Querverweise.
    _fusionMergeInventory(saveA, saveB) {
        const blueprintsCloneA = saveA.blueprints ? JSON.parse(JSON.stringify(saveA.blueprints)) : [];
        const blueprintsCloneB = saveB.blueprints ? JSON.parse(JSON.stringify(saveB.blueprints)) : [];
        const materialsCloneA = saveA.materials ? JSON.parse(JSON.stringify(saveA.materials)) : [];
        const materialsCloneB = saveB.materials ? JSON.parse(JSON.stringify(saveB.materials)) : [];
        const toolsCloneA = saveA.tools ? JSON.parse(JSON.stringify(saveA.tools)) : [];
        const toolsCloneB = saveB.tools ? JSON.parse(JSON.stringify(saveB.tools)) : [];
        const bpRenameMap = {};
        const mergedBlueprints = this._mergeOwnNamedItems(blueprintsCloneA, blueprintsCloneB, bpRenameMap);
        const mergedMaterials = this._mergeOwnNamedItems(materialsCloneA, materialsCloneB);
        const mergedTools = this._mergeOwnNamedItems(toolsCloneA, toolsCloneB);
        this._rewireBlueprintRefs(mergedBlueprints, mergedTools, bpRenameMap);
        // Player-Werkzeug-Liste: Union der besessenen Namen (Starter sind
        // sowieso wieder beim Init verfügbar; nur eigene tragen Namen).
        const playerToolsUnion = Array.from(
            new Set([
                ...((Array.isArray(saveA.playerTools) && saveA.playerTools) || []),
                ...((Array.isArray(saveB.playerTools) && saveB.playerTools) || []),
            ])
        );
        return { mergedBlueprints, mergedMaterials, mergedTools, playerToolsUnion };
    }

    // Emotionen — strategie-abhängig: tag-merge nimmt max, random-mix mittelt,
    // sequence behält A's (die aktive Welt).
    _fusionMergeEmotions(saveA, saveB, strategy) {
        const emotKeys = ["joy", "awe", "sorrow", "hope", "peace", "chaos"];
        const emotA = (saveA.playerEmotions && typeof saveA.playerEmotions === "object" && saveA.playerEmotions) || {};
        const emotB = (saveB.playerEmotions && typeof saveB.playerEmotions === "object" && saveB.playerEmotions) || {};
        const mergedEmotions = {};
        for (const k of emotKeys) {
            const va = Number.isFinite(emotA[k]) ? emotA[k] : 0;
            const vb = Number.isFinite(emotB[k]) ? emotB[k] : 0;
            if (strategy === "tag-merge") mergedEmotions[k] = Math.max(va, vb);
            else if (strategy === "random-mix") mergedEmotions[k] = (va + vb) / 2;
            else mergedEmotions[k] = va;
        }
        return mergedEmotions;
    }

    // DSL-History — pro Strategie eine andere Komposition. random-mix
    // interleaved (Münzwurf pro Iteration aus dem Strom der Fusion) + Cap 500; sonst je 250 jüngste
    // konkateniert.
    _fusionMergeDslHistory(saveA, saveB, strategy, muenze) {
        const histA = Array.isArray(saveA.dslHistory) ? saveA.dslHistory : [];
        const histB = Array.isArray(saveB.dslHistory) ? saveB.dslHistory : [];
        if (strategy === "random-mix") {
            const aSlice = histA.slice(-250);
            const bSlice = histB.slice(-250);
            const combined = [];
            const max = Math.max(aSlice.length, bSlice.length);
            for (let i = 0; i < max; i++) {
                if (muenze() < 0.5) {
                    if (i < aSlice.length) combined.push(aSlice[i]);
                    if (i < bSlice.length) combined.push(bSlice[i]);
                } else {
                    if (i < bSlice.length) combined.push(bSlice[i]);
                    if (i < aSlice.length) combined.push(aSlice[i]);
                }
            }
            return combined.slice(-500);
        }
        return [...histA.slice(-250), ...histB.slice(-250)];
    }

    // Pattern-Memory — pro Keyword Listen verschmelzen, höchste Fitness zuerst,
    // Cap pro Keyword bei 8.
    _fusionMergePatternMemory(saveA, saveB) {
        const pmA =
            (saveA.dslPatternMemory && typeof saveA.dslPatternMemory === "object" && saveA.dslPatternMemory) || {};
        const pmB =
            (saveB.dslPatternMemory && typeof saveB.dslPatternMemory === "object" && saveB.dslPatternMemory) || {};
        const mergedPatternMemory = {};
        const pmKeys = new Set([...Object.keys(pmA), ...Object.keys(pmB)]);
        for (const k of pmKeys) {
            const merged = [...(pmA[k] || []), ...(pmB[k] || [])];
            merged.sort((x, y) => (y.fitness || 0) - (x.fitness || 0));
            mergedPatternMemory[k] = merged.slice(0, 8);
        }
        return mergedPatternMemory;
    }

    // DSL-Abilities — Union per Name (A gewinnt bei Kollision).
    _fusionMergeAbilities(saveA, saveB) {
        const abilA = Array.isArray(saveA.dslAbilities) ? saveA.dslAbilities : [];
        const abilB = Array.isArray(saveB.dslAbilities) ? saveB.dslAbilities : [];
        const seen = new Set();
        const mergedAbilities = [];
        for (const list of [abilA, abilB]) {
            for (const a of list) {
                if (!a || typeof a.name !== "string") continue;
                if (seen.has(a.name)) continue;
                seen.add(a.name);
                mergedAbilities.push(a);
            }
        }
        return mergedAbilities;
    }

    // Regel-Sätze vereinigen: Union + Dedup über die Signatur Quelle|cond|effect (wie _registerWorldRule),
    // nur die definierenden Felder (Laufzeit-Akkus setzt der Restore), Cap.
    _fusionMergeWorldRules(saveA, saveB) {
        const rulesA = Array.isArray(saveA.worldRules) ? saveA.worldRules : [];
        const rulesB = Array.isArray(saveB.worldRules) ? saveB.worldRules : [];
        const seen = new Set();
        const merged = [];
        const cap = AnazhRealm.WORLD_RULES.cap;
        for (const list of [rulesA, rulesB]) {
            for (const r of list) {
                if (!r || !Array.isArray(r.cond) || !Array.isArray(r.effect)) continue;
                const source = typeof r.source === "string" ? r.source : "unknown";
                const sig = source + "|" + JSON.stringify(r.cond) + "|" + JSON.stringify(r.effect);
                if (seen.has(sig)) continue;
                seen.add(sig);
                merged.push({ cond: r.cond, effect: r.effect, everySec: r.everySec, source, ttlSec: r.ttlSec });
                if (merged.length >= cap) return merged;
            }
        }
        return merged;
    }

    // Pfad-Buckets — Mittelung pro Achse (oder einseitiger Wert wenn nur eine
    // Welt etwas hat). Gibt `null` zurück, wenn keine Welt Buckets hat.
    _fusionMergePathBuckets(saveA, saveB) {
        if (!saveA.playerPathBuckets && !saveB.playerPathBuckets) return null;
        const pbA = saveA.playerPathBuckets || {};
        const pbB = saveB.playerPathBuckets || {};
        const allKeys = new Set([...Object.keys(pbA), ...Object.keys(pbB)]);
        const mergedPathBuckets = {};
        for (const k of allKeys) {
            const a = pbA[k];
            const b = pbB[k];
            if (typeof a === "number" && typeof b === "number") mergedPathBuckets[k] = (a + b) / 2;
            else if (typeof a === "number") mergedPathBuckets[k] = a;
            else if (typeof b === "number") mergedPathBuckets[k] = b;
        }
        return mergedPathBuckets;
    }

    // Genesis-Eintrag (id=1) + top-Erinnerungen je Elternteil (je 4). IDs
    // werden am Ende neu durchnumeriert.
    _fusionBuildJournalEntries(saveA, saveB, idA, idB, identity, strategy) {
        const genesisEntry = {
            id: 1,
            at: identity.bornAt,
            tick: 0,
            type: "genesis",
            text: `Ich erwache aus „${identity.slugA}" und „${identity.slugB}".`,
            ctx: {
                worldId: identity.newWorldId,
                seed: identity.newSeed,
                parentA: idA,
                parentB: idB,
                strategy,
            },
        };
        const journalA = this._selectFusionJournalEntries(saveA.worldJournal, idA, 4);
        const journalB = this._selectFusionJournalEntries(saveB.worldJournal, idB, 4);
        return [genesisEntry, ...journalA, ...journalB].map((e, i) => ({ ...e, id: i + 1 }));
    }

    loadVersion(version) {
        this.log(`Lade Version ${version} – Platzhalter für Versionsmanagement`);
    }

    // ### Initialisierung ###
    symphonyInitDOM() {
        // Toggle-Button koppelt User-Geste an AudioContext-Start (Browser-
        // Autoplay-Policy). Beim ersten Klick: initSymphony(); danach
        // ein/aus über masterGain.
        const toggle = document.getElementById("anazh-symphony-toggle");
        if (!toggle) return;
        toggle.addEventListener("click", () => {
            const s = this.state.symphony;
            if (!s.enabled) {
                const ok = this.initSymphony();
                if (ok) {
                    toggle.setAttribute("aria-pressed", "true");
                    toggle.textContent = "Klang: an";
                }
                return;
            }
            const currentlyOn = toggle.getAttribute("aria-pressed") === "true";
            const targetGain = currentlyOn ? 0 : 0.35;
            s.masterGain.gain.setValueAtTime(targetGain, s.ctx.currentTime);
            toggle.setAttribute("aria-pressed", currentlyOn ? "false" : "true");
            toggle.textContent = currentlyOn ? "Klang: aus" : "Klang: an";
        });
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_speicher_laden]);

// ===== ATLAS · Speicher/laden — Außen-Konstanten =====
// DER BAUPLAN-UMZUG — gefallene Baupläne, deren Einträge in gespeicherten Welten stehen, und ihr Erbe: der Restore
// (`_loadStateRestoreArchitectures`) liest ihn, bevor er spawnt. Die sechs Glut-Formationen (`glut_var0..5`, das
// Glut-Genom bis 05.10.) leben als die EINE Feuerstelle weiter (`glutbrunnen`, Gestalt aus dem Gesetzbuch).
AnazhRealm.BAUPLAN_UMZUG = Object.freeze({
    glut_var0: "glutbrunnen",
    glut_var1: "glutbrunnen",
    glut_var2: "glutbrunnen",
    glut_var3: "glutbrunnen",
    glut_var4: "glutbrunnen",
    glut_var5: "glutbrunnen",
});
// DIE GRUND-TAFEL (w4-grundstellung): je Größe, die der Stand nicht trägt und eine Probe der Mess-Sitzung ändert, ihr Name, ihr
// Leser und ihr Wort zurück (`_grundstellung`: jedes Wort vor dem Stand) — der Ritt (der Spieler steigt aus, ehe der Stand ihn
// stellt), die Sicht und der Blick des Spielers, die Nässe der Welt und der Übergang des Wetters (der Stand trägt das Wort,
// `_loadStateRestoreBasicState`), die Zellen des Brands (nicht persistiert, die Asche reist als Tat). Der Stand trägt Uhr,
// Welt-Uhr, Saison, Wetter-Wort, Spieler-Ort, Wesen, Werke und Edits.
AnazhRealm.GRUND_TAFEL = Object.freeze([
    [
        "ritt",
        function () {
            const m = this.state.player && this.state.player.mountedArch;
            return m ? String(m.id) : null;
        },
        function (v) {
            if (v === null && this.state.player.mountedArch) this.dismountArchitecture();
        },
    ],
    [
        "sicht",
        function () {
            return this.state.cameraMode;
        },
        function (v) {
            if (v !== this.state.cameraMode) this.setCameraMode(v);
        },
    ],
    [
        "blick",
        function () {
            return [this.state.yaw, this.state.pitch];
        },
        function (v) {
            [this.state.yaw, this.state.pitch] = v;
        },
    ],
    [
        "naesse",
        function () {
            return [this.state.naesse, this.state.weatherTransition || null];
        },
        function (v) {
            [this.state.naesse, this.state.weatherTransition] = v;
        },
    ],
    [
        "brand",
        function () {
            return [...(this.state.brandFeld || new Map()).keys()].sort();
        },
        function (v) {
            const bf = this.state.brandFeld;
            if (v.length || !bf) return;
            bf.clear();
            [bf.glutBlock, this._brandRest, this._brandBett] = [null, null, null];
        },
    ],
]);
// Welle 5 C — Maschinen-Rekursivität. Vier Op-Klassen aus Konzept §3.1,
// als Whitelist für eigene Tool-Baupläne. Spieler kann nur diese vier
// vergeben — sonst kollidieren neue Op-Klassen mit MATERIAL_OP_COMPATIBILITY.
AnazhRealm.TOOL_OP_CLASSES = Object.freeze(new Set(["subtractive", "plastic", "additive", "phaseChange"]));
// Op-Name-Whitelist (a-z, -_, max 24 Zeichen) — verhindert injection in
// state.tools-Keys. Pure Sanitisierung, keine semantische Wertung.
AnazhRealm.TOOL_OP_NAME_PATTERN = /^[a-z0-9_-]{1,24}$/;
