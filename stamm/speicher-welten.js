class AnazhRealm_speicher_welten {
    // ===== ATLAS · Speicher/welten — Snapshot · IndexedDB · Welt-Index · Manifest · Serialisierung =====
    // ### Welt-Identität (Ring 8+ Vorbereitung) ###
    // DIE IDENTITÄT EINER WELT: eine neue worldId (UUID, ohne crypto ein Zufalls-Stempel). Leser: der Boot einer frischen
    // Welt, die Geburt, die Migration, daneben legen, die Fusion und die Tür `_weltBetreten` (eine Welt ohne Id bekommt
    // ihre eigene, nie den Platz der Welt davor).
    static _neueWeltId() {
        try {
            if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
            return "w_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
        } catch {
            return "w_" + Math.random().toString(36).slice(2, 10);
        }
    }

    // DIE VORLAGE des worldMeta: der Zustand der Seite vor jeder Welt (Konstruktor) und der Grund jeder geladenen
    // (`_weltMetaWechsel`). Felder werden schon gesetzt, damit das Save-Schema zukunftsfest bleibt.
    static _weltMetaVorlage() {
        return {
            worldId: null,
            slug: "",
            creator: "local",
            visibility: "private",
            parentWorlds: [],
            bornAt: 0,
            // Terrain-Seed der Welt — die EINE Quelle der Welt-Geometrie (SimplexNoise(seed)). Neue Welten
            // zufällig; die allererste fällt auf "anazh-realm-seed", damit sie ihr Aussehen behält.
            seed: null,
            schemaVersion: "8.0-multiworld-v1",
            // Welt-Beziehungs-Rolle: "solo" (lokal, privat, Default) | "host" (für Multi-User erschaffen) |
            // "guest" (gejoint, Kopie). host/guest starten den Multi-User-Sync automatisch beim Init.
            // Alte Saves mit chunkDeltas werden ignoriert (Welt-Mods leben im Voxel-Feld).
            role: "solo",
            // Ring 11.5: bei "guest" — wohin verbinden wir uns initial?
            // null bei solo/host. Wird beim Join-Pfad gefüllt mit
            // {url, roomId} aus dem Einladungs-Code.
            hostInfo: null,
            // Welt-Beziehungs-Modus (je Welt persistiert): "frieden" (Default: kein HP/Tod/Stamina-Kosten) |
            // "pfad" (HP/Stamina/Tod aktiv; Tod → Anker-Rückkehr + Welt-Trauer sorrow+0.3, awe+0.2) |
            // "schöpfer" (kein Schaden, voller Zugang).
            gameMode: "frieden",
            // Gast-Rechte einer verlinkten Welt: "frieden" (Default: sehen/gehen/sprechen) | "pfad" (bauen/
            // ernten unter Modus-Regeln) | "mitschöpfer" (volle Rechte). Reist im world-snapshot zum Gast.
            guestRights: "frieden",
            // Hausrecht: peerIds = Session-Bann (neue Sitzung → neue peerId → darf wieder rein);
            // vibePassKeys = dauerhafter Bann (vibePass-pubKey, hex). JSON-flache Arrays → verlustfreier
            // Snapshot-Round-Trip.
            banList: { peerIds: [], vibePassKeys: [] },
            // Signierte Welt-Adresse (via setPortalAddress in ein Portal gelegt → Bestätigungs-Karte beim
            // Durchgehen); null bei solo/lokal. { worldId, roomId, broker, label, authorPubKey, sig, signedAt },
            // must-ignore-konform.
            worldAddress: null,
            // Regions-Archipel, Default AUS (eine Welt = ein Raum). true → Mesh-Raum wird worldId:regionKey,
            // Bubbles je REGION_CHUNKS × 43.2 m (345.6 m Kante); Grenzwechsel = leave/join mit Hysterese.
            regionsActive: false,
        };
    }

    // DAS HEIL JEDER WELT (deterministisch, ohne Zufall): ohne Seed ist sie die Eingangs-Welt (identisch für alle —
    // brandneuer Spieler, Legacy-Migration, ein Save ohne Seed; Zufalls-Seeds nur per ausdrücklichem Akt, createNewWorld →
    // _generateFreshWorldMeta), und der Voxel-Boden ist die kanonische, irreversible Form (auch ein explizites
    // `voxelTerrain:false`). Leser: ensureWorldMeta (Boot) und der Restore jeder geladenen Welt.
    static _weltMetaHeil(m) {
        if (typeof m.seed !== "string" || m.seed.length === 0) m.seed = "anazh-realm-seed";
        m.voxelTerrain = true;
        // K16: das Gelände ist das Flussnetz des Gesetzbuchs — der Ein-Massiv-Anker alter Welten fällt (sie ziehen um).
        delete m.macro;
    }

    // DIE WELTGRENZE (Gegenprüfung Runde 2, 10.10.): eine geladene Welt ERSETZT das worldMeta der Seite — die Vorlage,
    // darüber ihr eigenes. Aus der Welt davor reist nur, was `AnazhRealm.WELT_GRENZE.platz` beim Namen nennt (worldId,
    // slug, bornAt), und nur in die Lücken der geladenen — der Speicher-Platz, auf dem sie liegt: beim Boot der Platz der
    // aktiven Welt (ein Save ohne worldId ist die Welt DIESES Platzes; ein migrierter Legacy-Save trägt nur die worldId,
    // ensureWorldMeta heilte slug und bornAt). Eine Welt, die durch eine Tür kommt, trägt ihre Id schon (`_weltBetreten`)
    // — sie landet nie auf dem Platz der Welt davor. Bis 10.10. spreizte der Restore die
    // geladene Welt ÜBER die alte — jedes Feld, das sie nicht trug, blieb das der alten: Erbgut, Anker, Edits, Dorf-Zellen,
    // Ring- und Vorschau-Stempel, Saat, Rolle, Bann-Liste, Adresse, Region, Rechte (gate:weltgrenze, auf 4564852c nach dem
    // Laden 29, nach dem Welt-Tor „Ersetzen" 74, nach dem world-pull 50 Felder der alten Welt). Leser: der Restore jedes
    // Ladens (`_loadStateRestoreWorldMeta`: Boot, „lade zustand") und die Vorlade des Boots (mit dem Platz der aktiven Welt).
    _weltMetaWechsel(eingang, alt = this.state.worldMeta || {}) {
        const neu = Object.assign(AnazhRealm._weltMetaVorlage(), eingang);
        for (const k of AnazhRealm.WELT_GRENZE.platz)
            if (eingang[k] === undefined && alt[k] !== undefined) neu[k] = alt[k];
        return neu;
    }

    ensureWorldMeta() {
        const m = this.state.worldMeta;
        let fresh = false;
        if (!m.worldId) {
            fresh = true;
            m.worldId = AnazhRealm._neueWeltId();
        }
        if (!m.slug) {
            const adjectives = ["still", "weite", "klare", "dunkle", "warme", "leise", "wache"];
            const nouns = ["aue", "feld", "ufer", "saum", "weiher", "halde", "hain"];
            const a = adjectives[Math.floor(Math.random() * adjectives.length)];
            const n = nouns[Math.floor(Math.random() * nouns.length)];
            m.slug = `${a}-${n}`;
        }
        if (!m.bornAt) m.bornAt = Date.now();
        // fresh (kein worldId aus einem Save) → heutige Genese-Version: alle neuen Spieler teilen Seed UND
        // genVersion; eine GELADENE Welt ohne Feld bleibt Legacy (fehlend → 1, _genVersion).
        // Stufen: 1 Legacy · 2 Feuchte · 3 Makro-Geographie · 4 prozedurale Baum-Baupläne · 5 Skeleton-
        // Wuchs aus dem Gesetz (_phytoArt → treeParams) · 6 Mesh-Merge · 7 Tube-Geometrie/Foliage-Cards/Wind ·
        // 8 Palette/Tag-Vektoren/Understory · 9 baum_karst + Busch-Baupläne.
        if (fresh && !Number.isFinite(m.genVersion)) m.genVersion = 9;
        // Seed und Voxel-Boden heilt das EINE Heil jeder Welt (`_weltMetaHeil`, auch jede geladene); Journal-Eintrag nur
        // bei `!fresh` (geladene Welt verdichtet sich), die frische Welt schreibt nur „Ich erwache als <slug>".
        const warVoxel = m.voxelTerrain === true;
        AnazhRealm._weltMetaHeil(m);
        if (!warVoxel && !fresh && typeof this.journalAppend === "function") {
            this.journalAppend("genesis", "Die Welt verdichtet sich zu Voxel-Boden.", {
                worldId: m.worldId,
            });
        }
        if (fresh) {
            this.journalAppend("genesis", `Ich erwache als ${m.slug}.`, { worldId: m.worldId });
            // Ring 8: frische Welt im Index registrieren. Reload-Migration
            // (legacy single-key) ruft ensureWorldMeta nach Pre-Load auf;
            // dort ist worldId schon gesetzt und dieser Pfad bleibt aus.
            this.worldsIndexUpsert({
                worldId: m.worldId,
                slug: m.slug,
                bornAt: m.bornAt,
                lastPlayed: Date.now(),
            });
            try {
                localStorage.setItem("anazhRealmActiveWorld", m.worldId);
            } catch {
                // localStorage voll/blockiert: aktiver Welt-Zeiger bleibt aus,
                // nächster Reload startet wieder fresh. Kein Drama.
            }
        }
    }

    // ### Ring 8 — Multi-Welt-Verwaltung ###
    // localStorage: `anazhRealmWorlds` (Index) · `anazhRealmState_<worldId>` (Snapshot je Welt) ·
    // `anazhRealmActiveWorld` (aktive worldId); Legacy-Key `anazhRealmState` migriert einmalig.
    // Welt-Wechsel ist reload-basiert (saveState → activeWorldSet → reload): ein in-place-Tausch
    // bräuchte tiefen Dispose (Chunks, Physik, Audio, Caches) und leckt State.

    worldStorageKey(worldId) {
        return `anazhRealmState_${worldId}`;
    }

    activeWorldGet() {
        try {
            return localStorage.getItem("anazhRealmActiveWorld") || null;
        } catch {
            return null;
        }
    }

    activeWorldSet(worldId) {
        try {
            if (worldId) localStorage.setItem("anazhRealmActiveWorld", worldId);
            else localStorage.removeItem("anazhRealmActiveWorld");
            return true;
        } catch {
            return false;
        }
    }

    worldsIndexLoad() {
        try {
            const raw = localStorage.getItem("anazhRealmWorlds");
            if (!raw) return [];
            const arr = JSON.parse(raw);
            return Array.isArray(arr) ? arr.filter((e) => e && typeof e.worldId === "string") : [];
        } catch {
            return [];
        }
    }

    worldsIndexSave(arr) {
        try {
            localStorage.setItem("anazhRealmWorlds", JSON.stringify(Array.isArray(arr) ? arr : []));
            return true;
        } catch {
            return false;
        }
    }

    // Idempotent: legt einen Eintrag an oder aktualisiert slug/lastPlayed.
    // Felder bornAt/parentWorlds/visibility nur beim Neu-Anlegen setzen,
    // sonst würde ein Save später ein verändertes bornAt überschreiben.
    worldsIndexUpsert(meta) {
        if (!meta || typeof meta.worldId !== "string") return false;
        const idx = this.worldsIndexLoad();
        const existing = idx.find((e) => e.worldId === meta.worldId);
        if (existing) {
            if (typeof meta.slug === "string" && meta.slug) existing.slug = meta.slug;
            if (Number.isFinite(meta.lastPlayed)) existing.lastPlayed = meta.lastPlayed;
        } else {
            idx.push({
                worldId: meta.worldId,
                slug: meta.slug || "",
                bornAt: Number.isFinite(meta.bornAt) ? meta.bornAt : Date.now(),
                lastPlayed: Number.isFinite(meta.lastPlayed) ? meta.lastPlayed : Date.now(),
            });
        }
        return this.worldsIndexSave(idx);
    }

    worldsIndexRemove(worldId) {
        const idx = this.worldsIndexLoad();
        const filtered = idx.filter((e) => e.worldId !== worldId);
        if (filtered.length === idx.length) return false;
        return this.worldsIndexSave(filtered);
    }

    // Liest die worldMeta der aktiven Welt AUS DEM SAVE ohne vollen loadState() — muss in init() vor
    // ensureWorldMeta laufen, sonst feuert der Frisch-Welt-Pfad (UUID + Genesis-Eintrag) für eine
    // existierende Welt. Rein lesend. DER PLATZ IST DIE IDENTITÄT: liegt auf dem Platz der aktiven Welt ein Save ohne
    // worldId oder ohne worldMeta (ein Legacy-Save, ein Bruchstück, abgelegt vor der Tür `_weltBetreten`), ist er die Welt
    // dieses Platzes. Sie fragt DIESELBE Rettungs-Kette wie loadState (`_weltRettungsKette`: Platz → .bak → IndexedDB) —
    // bis 10.10. las sie nur den Platz, und ensureWorldMeta vergab einer Welt, die korrupt mit gültigem .bak oder nur in
    // IndexedDB lag, eine neue Id samt Aktiv-Zeiger, bevor loadState retten konnte. Findet die Kette nichts, merkt sie den
    // Befund (`_bootLeer`): die frische Welt erwacht LAUT (init).
    _preloadActiveWorldMeta() {
        this._bootLeer = null;
        if (!this.activeWorldGet() && !this._migrateLegacySingleWorld()) {
            this._bootLeer = { id: null, befund: ["kein Aktiv-Zeiger", "kein Legacy-Save"] };
            return false;
        }
        const id = this.activeWorldGet();
        const fund = this._weltRettungsKette(id, this._idbVorlage(id));
        if (!fund.state) {
            this._bootLeer = { id, befund: fund.befund };
            return false;
        }
        const wm = fund.state.worldMeta && typeof fund.state.worldMeta === "object" ? fund.state.worldMeta : {};
        this.state.worldMeta = this._weltMetaWechsel(wm, { ...this.state.worldMeta, worldId: id });
        return true;
    }

    // DIE RETTUNGS-KETTE DES SPEICHERS (EINE, feste Reihenfolge), Leser: die Vorlade des Boots und loadState. Für die Welt
    // `id`: (1) der Platz; ist er lesbar, gewinnt IndexedDB nur, wenn er nachweislich frischer ist (saveState stempelt
    // beide, der Index trägt lastPlayed — wie bisher); (2) fehlt der Platz oder ist er korrupt, der .bak (ein Stand zurück,
    // die Rotation in saveState); (3) sonst IndexedDB. `idb` = {state, at} des Boot-Vorlaufs oder null. Liefert {state,
    // quelle, befund} — state null nur, wenn alle drei leer oder unlesbar sind, der Befund nennt jedes Glied.
    _weltRettungsKette(id, idb) {
        const befund = [];
        const lies = (roh, name) => {
            if (roh == null) {
                befund.push(`${name} leer`);
                return null;
            }
            try {
                const s = JSON.parse(roh);
                if (s && typeof s === "object") return s;
                befund.push(`${name} unlesbar`);
            } catch (e) {
                befund.push(`${name} korrupt (${e.message})`);
            }
            return null;
        };
        let ls = null;
        let bak = null;
        try {
            ls = localStorage.getItem(this.worldStorageKey(id));
            bak = localStorage.getItem(this.worldStorageKey(id) + ".bak");
        } catch (e) {
            befund.push(`localStorage nicht lesbar (${e.message})`);
        }
        const platz = lies(ls, "Platz");
        if (platz) {
            const eintrag = this.worldsIndexLoad().find((w) => w && w.worldId === id);
            const lsAt = eintrag && Number.isFinite(eintrag.lastPlayed) ? eintrag.lastPlayed : 0;
            // IDB gewinnt bei Gleichstand NICHT (saveState schreibt beide im selben Zug; kleiner Takt-Skew soll den
            // Spiegel nicht entthronen) — nur ECHT frischer.
            if (idb && idb.state && idb.at > lsAt + 1500)
                return { state: idb.state, quelle: "IndexedDB (frischer als der Platz)", befund };
            return { state: platz, quelle: "Platz", befund };
        }
        const gerettet = lies(bak, ".bak");
        if (gerettet) return { state: gerettet, quelle: ".bak (ein Stand zurück)", befund };
        if (idb && idb.state) return { state: idb.state, quelle: "IndexedDB", befund };
        befund.push(idb ? `IndexedDB korrupt (${idb.kaputt || "kein Zustand"})` : "IndexedDB leer");
        return { state: null, quelle: null, befund };
    }

    // Der IndexedDB-Stand des Boot-Vorlaufs für die Welt `id` (nur lesen; loadState verbraucht ihn).
    _idbVorlage(id) {
        const pre = this._idbPreloadedState;
        return pre && pre.worldId === id ? pre : null;
    }

    // Einmalige Migration des Single-Keys `anazhRealmState` → worldId, Multi-Key, Index, aktiv;
    // der alte Key wird gelöscht (kein doppelter Pfad). true = migriert.
    _migrateLegacySingleWorld() {
        try {
            const legacy = localStorage.getItem("anazhRealmState");
            if (!legacy) return false;
            const parsed = JSON.parse(legacy);
            if (!parsed || typeof parsed !== "object") return false;
            // worldId entscheiden: Save hat eine, oder wir generieren eine.
            let worldId = parsed.worldMeta && parsed.worldMeta.worldId;
            if (!worldId) {
                worldId = AnazhRealm._neueWeltId();
                parsed.worldMeta = { ...(parsed.worldMeta || {}), worldId };
            }
            // die EINE Ablage (mit Probe); der alte Key fällt erst, wenn die Welt sicher auf ihrem Platz liegt
            const ab = this._weltAblegen(parsed);
            if (!ab.ok) {
                this.log(`Welt-Migration: Ablage fehlgeschlagen (${ab.reason}) — der alte Save bleibt.`, "ERROR");
                return false;
            }
            localStorage.removeItem("anazhRealmState");
            this.log(
                `Welt-Migration: alter Single-Welt-Save → Multi-Welt-Index (worldId=${worldId.slice(0, 8)}…)`,
                "INFO"
            );
            return true;
        } catch (err) {
            this.log(`Welt-Migration fehlgeschlagen: ${err.message}`, "ERROR");
            return false;
        }
    }

    // Generator-Helfer: erzeugt einen frischen worldMeta-Block (UUID + slug
    // + bornAt). Nicht idempotent — jeder Aufruf eine neue ID. Wird von
    // createNewWorld genutzt.
    _generateFreshWorldMeta(slug) {
        const worldId = AnazhRealm._neueWeltId();
        let finalSlug = (slug || "")
            .toString()
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, "");
        if (!finalSlug) {
            const adjectives = ["still", "weite", "klare", "dunkle", "warme", "leise", "wache"];
            const nouns = ["aue", "feld", "ufer", "saum", "weiher", "halde", "hain"];
            const a = adjectives[Math.floor(Math.random() * adjectives.length)];
            const n = nouns[Math.floor(Math.random() * nouns.length)];
            finalSlug = `${a}-${n}`;
        }
        // Slug-Eindeutigkeit: wenn ein Index-Eintrag denselben slug hat,
        // hängen wir `-2`/`-3`/… an, bis frei.
        const usedSlugs = new Set(this.worldsIndexLoad().map((e) => e.slug));
        if (usedSlugs.has(finalSlug)) {
            let n = 2;
            while (usedSlugs.has(`${finalSlug}-${n}`)) n++;
            finalSlug = `${finalSlug}-${n}`;
        }
        // Jede neue Welt bekommt einen eigenen Terrain-Seed (UUID-Fragment + Zufall), in worldMeta
        // persistiert und für die Welt-Lebensdauer konstant.
        const seed = `w-${worldId.replace(/-/g, "").slice(0, 12)}-${Math.random().toString(36).slice(2, 8)}`;
        // Jede NEUE Welt wird mit der heutigen Genese-Version geboren; bestehende Welten (Feld fehlt → 1)
        // behalten ihr Gesicht (Genese ist Welt-Identität). Der Varianten-Pool (variantSeed[]) ist
        // Genese-Konstante: je Art eine Zeile, gepinnt beim ersten Wuchs der Art (_variantSeedsFor).
        const variantSeed = {};
        return { worldId, slug: finalSlug, bornAt: Date.now(), seed, genVersion: 9, variantSeed };
    }

    // Snapshot einer leeren Welt mit gegebenem worldMeta (optional mit Player-Snapshot für „Person
    // übernehmen"). Wird vor dem Reload geschrieben — der Reload-Init findet einen gültigen Per-Welt-Save.
    _buildEmptyWorldSnapshot(worldMeta, inheritPlayer) {
        const alt = this.state.worldMeta || {};
        const snap = {
            // playerPosition:null markiert „Welt VOR ihrem Erst-Spawn": terrainEverGenerated bleibt false,
            // generateTerrainWithParameters fährt den echten Erst-Spawn (offener Punkt + Genesis-Plattform).
            // Nie eine Default-Position setzen — sonst keine Plattform und der Spieler fällt in den Boden.
            playerPosition: null,
            knowledgeBase: [],
            version: this.state.currentVersion || "7.71",
            selfAwareness: { components: [], weaknesses: [] },
            creatures: [],
            creatureEmotions: [],
            terrainSteepness: 1.0,
            terrainBaseHeight: globalThis.__gelaendeCore.GRUND.basis, // der Grund einer frisch geborenen Welt (Kern)
            weather: "sunny",
            // Eine neue Welt ist eigenständig: sie erbt von der alten NUR die Wahl des Schöpfers (die Positiv-Liste
            // `AnazhRealm.WELT_GRENZE.geburt`: visibility, creator), nie ihre Identität — keine parentWorlds (Fusion: Ring
            // 10), keinen Makro-Anker, keine Edits, keine Dorf-Zellen, keine Ring- und Vorschau-Stempel, kein Erbgut. Bis
            // 09.10. spreizte sie das GANZE worldMeta der alten Welt: die neue trug deren Anker und Krater und bekam nie
            // einen Portal-Ring, keine Vorschauen und kein Start-Dorf (deren Stempel standen schon; Playtest Ring 8: geerbte
            // Felder 0, gate:weltgrenze Weg „geburt").
            worldMeta: {
                ...Object.fromEntries(AnazhRealm.WELT_GRENZE.geburt.map((k) => [k, alt[k]])),
                ...worldMeta,
                parentWorlds: [],
                // Der Welt-Strom beginnt neu (`_bauSame`: der Zähler ist das Gedächtnis DIESER Welt).
                bauSame: {},
                // Kein `chunkDeltas`-Feld mehr (Welt-Mods wirken im 3D-Voxel-Feld); das Schema bleibt
                // 10.5-chunk-delta-v1 (kein Bump für eine Feld-Löschung).
                schemaVersion: "10.5-chunk-delta-v1",
                // Welle 6.C2: jede neue Welt startet im frieden-Modus —
                // Erstbegegnung soll nicht hostil sein. Wer pfad/schöpfer
                // will, schaltet bewusst über setze modus oder UI.
                gameMode: "frieden",
            },
            dslAbilities: [],
            dslHistory: [],
            dslPatternMemory: {},
            playerPathBuckets: null,
            // Genesis-Eintrag gleich beim Anlegen mitschreiben (nach dem Reload setzt ensureWorldMeta ihn
            // nicht mehr, worldId steht schon im Save); der „genesis"-Schlüssel in seen verhindert Duplikate.
            worldJournal: {
                entries: [
                    {
                        id: 1,
                        at: Date.now(),
                        tick: 0,
                        type: "genesis",
                        text: `Ich erwache als ${worldMeta.slug}.`,
                        ctx: {
                            worldId: worldMeta.worldId,
                            seed: worldMeta.seed || null,
                            inheritedPlayer: !!inheritPlayer,
                        },
                    },
                ],
                seen: { genesis: true },
            },
            playerEmotions: { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 },
            playerSoul: "human",
            playerTools: [],
            architectures: [],
            blueprints: [],
            tools: [],
            materials: [],
            hotbar: [],
        };
        if (inheritPlayer) {
            // Person-Übernahme: Werkzeug-Besitz + Seele werden mitgenommen,
            // aber Pfad-Buckets, Emotionen, Journal bleiben welt-spezifisch
            // (eine andere Welt = ein neues Gemüt, eine neue Geschichte).
            snap.playerSoul = this.state.player.soul || "human";
            snap.playerTools = Array.isArray(this.state.player.tools) ? [...this.state.player.tools] : [];
            // Eigene (nicht-builtIn) Materialien + Werkzeuge wandern mit — sie gehören dem Spieler-Schöpfer,
            // nicht der Welt. Dieselbe EINE Serialize-Quelle wie buildStateSnapshot.
            snap.materials = Object.values(this.state.materials || {})
                .filter((m) => m && !m.builtIn)
                .map((m) => this._serializeMaterial(m));
            snap.tools = Object.values(this.state.tools || {})
                .filter((t) => t && !t.builtIn)
                .map((t) => this._serializeTool(t));
            // Eigene Baupläne wandern mit (Schöpfer-Wissen); die Hotbar bleibt leer (welt-spezifisch).
            // Nur über _serializeBlueprint — sonst gehen Portal-Rolle + Signatur still verloren.
            snap.blueprints = Object.values(this.state.blueprints || {})
                .filter((bp) => bp && !bp.builtIn)
                .map((bp) => this._serializeBlueprint(bp));
        }
        return snap;
    }

    // Neue Welt anlegen, schreiben, aktiv setzen. reload standardmäßig aus (Tests prüfen die
    // Daten-Schicht); mit `reload` läuft der Welt-Wechsel `_weltWechselNeuLaden` (Sperre, Zeiger, Reload).
    createNewWorld({ slug = null, inheritPlayer = false, reload = false, role = "solo" } = {}) {
        // Aktuelle Welt zuerst sichern, sonst geht der Stand verloren.
        if (this.state.worldMeta && this.state.worldMeta.worldId) {
            try {
                this.saveState();
            } catch (err) {
                this.log(`Save vor New-World fehlgeschlagen: ${err.message}`, "WARN");
            }
        }
        const meta = this._generateFreshWorldMeta(slug);
        const snap = this._buildEmptyWorldSnapshot(meta, inheritPlayer);
        // Ring 11.5: Rolle in worldMeta einsetzen (default "solo"). Bei
        // "host"/"guest" startet Init nach Reload automatisch Multi-User-Sync.
        if (role === "host" || role === "guest") {
            snap.worldMeta.role = role;
        }
        // Voxel ist permanent: das Flag IMMER explizit setzen — nie auf den
        // `_buildEmptyWorldSnapshot`-Spread verlassen (bräche leise bei einer Init-Änderung).
        snap.worldMeta.voxelTerrain = true;
        const ab = this._weltAblegen(snap);
        if (!ab.ok) {
            this.log(`Neue Welt konnte nicht geschrieben werden: ${ab.reason}`, "ERROR");
            return null;
        }
        this.log(
            `Neue Welt erschaffen: ${meta.slug} (${meta.worldId.slice(0, 8)}…, inheritPlayer=${inheritPlayer})`,
            "INFO"
        );
        if (reload) this._weltWechselNeuLaden(meta.worldId);
        return meta.worldId;
    }

    // Wechsel zu einer existierenden Welt. Sichert aktuelle, setzt aktiv,
    // optional Reload. Gibt false zurück, wenn die Ziel-Welt nicht im
    // Speicher existiert (Index-Eintrag ohne Save-Datei wäre ein Bug).
    switchToWorld(worldId, { reload = false } = {}) {
        if (!worldId || typeof worldId !== "string") return false;
        if (worldId === (this.state.worldMeta && this.state.worldMeta.worldId)) {
            // Bereits aktiv, kein Wechsel nötig.
            return true;
        }
        const targetRaw = localStorage.getItem(this.worldStorageKey(worldId));
        if (!targetRaw) {
            this.log(`Welt-Wechsel verweigert: kein Save für ${worldId.slice(0, 8)}…`, "ERROR");
            return false;
        }
        // Aktuelle Welt sichern.
        if (this.state.worldMeta && this.state.worldMeta.worldId) {
            try {
                this.saveState();
            } catch (err) {
                this.log(`Save vor Welt-Wechsel fehlgeschlagen: ${err.message}`, "WARN");
            }
        }
        // Index-lastPlayed der Ziel-Welt aktualisieren.
        const idx = this.worldsIndexLoad();
        const target = idx.find((e) => e.worldId === worldId);
        if (target) {
            target.lastPlayed = Date.now();
            this.worldsIndexSave(idx);
        }
        this.activeWorldSet(worldId);
        this.log(`Welt-Wechsel: aktiv ist nun ${worldId.slice(0, 8)}…`, "INFO");
        if (reload) this._weltWechselNeuLaden(worldId);
        return true;
    }

    // Welt löschen. Aktuelle Welt darf nicht gelöscht werden — der Spieler
    // muss erst wechseln. Save-Datei + Index-Eintrag werden entfernt.
    deleteWorld(worldId) {
        if (!worldId || typeof worldId !== "string") return false;
        if (worldId === (this.state.worldMeta && this.state.worldMeta.worldId)) {
            this.log("Welt-Löschung verweigert: aktive Welt kann nicht gelöscht werden.", "WARN");
            return false;
        }
        try {
            localStorage.removeItem(this.worldStorageKey(worldId));
        } catch {
            // ignorieren — Index trotzdem bereinigen, damit der UI-Picker stimmt.
        }
        // V18.151 (Faden #6) — auch die IndexedDB-Heimat der Welt räumen.
        this._idbDeleteWorld(worldId);
        this.worldsIndexRemove(worldId);
        this.log(`Welt gelöscht: ${worldId.slice(0, 8)}…`, "INFO");
        return true;
    }

    // ### Persistenz ###

    // `_serializeBlueprint` + `_deserializeBlueprint` sind die EINE Quelle des persistenten Bauplan-
    // Feld-Satzes (Snapshot, loadState, Welt-Wechsel) — jede Eigenschaft ist ein Ein-Stellen-Edit.
    // `_carryUnknown`: unbekannte Felder überleben jeden Round-Trip (must-preserve). knownKeys = ALLE
    // explizit behandelten Schlüssel (auch sanitisierte — nie Umgehung einer Wand); Werte als JSON-
    // Klon, Größen-Wand 8 KiB/Feld (Schutz der localStorage-Quota).
    _carryUnknown(src, dst, knownKeys) {
        if (!src || typeof src !== "object" || !dst || typeof dst !== "object") return dst;
        const known = knownKeys instanceof Set ? knownKeys : new Set(knownKeys);
        for (const k of Object.keys(src)) {
            if (known.has(k)) continue;
            try {
                const json = JSON.stringify(src[k]);
                if (typeof json !== "string" || json.length > AnazhRealm.TAILLE_UNKNOWN_FIELD_MAX) continue;
                dst[k] = JSON.parse(json);
            } catch {
                /* nicht-serialisierbar (Zyklus/Funktion) → fällt still */
            }
        }
        return dst;
    }

    // Der EINE Material-Serialize (Snapshot + Welt-Wechsel-Mitnahme): das ganze tags-Objekt (auch
    // fremde/künftige Tag-Achsen) + Unbekanntes via _carryUnknown.
    _serializeMaterial(m) {
        const out = {
            name: m.name,
            label: m.label || m.name,
            color: m.color,
            tags: { ...m.tags },
        };
        this._carryUnknown(m, out, AnazhRealm.MATERIAL_KNOWN_KEYS);
        return out;
    }

    // Ω2 — der EINE Tool-Serialize (gleiche Verdichtung). isMachine + künftige
    // Felder reisen via _carryUnknown (starben vorher im fixen Satz).
    _serializeTool(t) {
        const out = {
            name: t.name,
            label: t.label,
            opClass: t.opClass,
            opName: t.opName,
            precisionCap: t.precisionCap,
            sourceBlueprint: t.sourceBlueprint || null,
        };
        this._carryUnknown(t, out, AnazhRealm.TOOL_KNOWN_KEYS);
        return out;
    }

    // Serialisiert einen Bauplan in ein JSON-taugliches Objekt. Reine
    // Transformation (liest nur bp.*); der Aufrufer filtert die Built-ins
    // (sie entstehen je Init aus _defaultBlueprints()).
    _serializeBlueprint(bp) {
        const out = {
            name: bp.name,
            label: bp.label || bp.name,
            parts: Array.isArray(bp.parts) ? JSON.parse(JSON.stringify(bp.parts)) : [],
            connections: Array.isArray(bp.connections) ? JSON.parse(JSON.stringify(bp.connections)) : [],
        };
        if (bp.role === "tool" && bp.toolMeta) {
            out.role = "tool";
            out.toolMeta = { opName: bp.toolMeta.opName, opClass: bp.toolMeta.opClass };
        }
        // S3-B (kampf-plan §11.7) — die Schmiede-Qualität reist mit: ein geschmiedetes Gerät bleibt
        // geschmiedet (forgedPrecision gesetzt) über den Reload → der Werk-Akt wird nicht beim Laden
        // entwertet, der Gebrauch bleibt frei (sonst müsste man nach jedem Reload neu schmieden/zahlen).
        if (Number.isFinite(bp.forgedPrecision)) out.forgedPrecision = bp.forgedPrecision;
        // Der wear-Stand reist mit (sonst startete jedes geladene Gerät bei wear=1 → Katalysator-Lücke).
        // Nur wenn gesetzt und < 1 — alte Saves ohne wear bleiben klein.
        if (Number.isFinite(bp.wear) && bp.wear < 1) out.wear = Math.max(0, Math.min(1, bp.wear));
        // Die Waffen-Rolle reist mit (sonst verlöre eine geschmiedete Waffe Rolle + Equip-Bindung). Kein
        // Meta — das Profil emergiert aus den Parts.
        if (bp.role === "weapon") {
            out.role = "weapon";
            if (bp.roleManual) out.roleManual = true;
        }
        // Portal-Bauplan: Rolle + portalMeta (das Welt-Ziel) müssen mitreisen, sonst fällt ein geholtes
        // Portal auf die Skelett-Welt zurück und klebt als _isMoveable am Körper. roleManual schützt die
        // Rolle vor der Emergenz.
        if (bp.role === "portal" && bp.portalMeta) {
            out.role = "portal";
            if (bp.roleManual) out.roleManual = true;
            out.portalMeta = {
                world: bp.portalMeta.world,
                label: bp.portalMeta.label,
                dsl: Array.isArray(bp.portalMeta.dsl) ? bp.portalMeta.dsl.slice() : null,
            };
            // KI-Übersetzer Phase 2 — die translatedWorldId muss mitreisen,
            // sonst verlöre ein geholtes Übersetzer-Portal beim Reload sein
            // Szenen-Ziel (V8.59-Lehre).
            if (bp.portalMeta.translatedWorldId) {
                out.portalMeta.translatedWorldId = bp.portalMeta.translatedWorldId;
            }
            // V8.70 — die Vertrauensstufe reist mit, sonst verlöre ein
            // geholtes Untrusted-Portal beim Reload seine null-origin-Sandbox.
            if (bp.portalMeta.trust) out.portalMeta.trust = bp.portalMeta.trust;
            // W17 Phase A — die Multiplayer-Marke reist mit, sonst verlöre
            // ein Multiplayer-Portal beim Reload den Transport-Shim.
            if (bp.portalMeta.multiplayer === true) out.portalMeta.multiplayer = true;
            // W17 Phase B-JS-Compute — der Server-Modus reist mit, sonst
            // verlöre ein js-compute-Portal beim Reload den Compute-Host-Pfad.
            if (bp.portalMeta.serverMode === "js-compute") {
                out.portalMeta.serverMode = "js-compute";
            }
            // W18-B — die Ko-Präsenz-Marke reist mit, sonst verlöre ein
            // Ko-Präsenz-Portal beim Reload die Pose-Injektion (V8.59-Lehre).
            if (bp.portalMeta.coPresence === true) out.portalMeta.coPresence = true;
        }
        // JEDE deklarierte Rolle reist (roleManual = Intent: Werkstatt-Designation · armor · consumable ·
        // soul · vehicle). Fremde Artefakte bleiben gesiebt: _admitForeignArtifact löscht roleManual und
        // re-derived (Ω3) — diese Reise gilt dem EIGENEN Save.
        if (bp.role && bp.roleManual === true) {
            if (!out.role) out.role = bp.role;
            out.roleManual = true;
        }
        // W13 Phase 2 — die Bauplan-Signatur reist mit dem Bauplan (Save,
        // Welt-Tor-Export, Recipe-Import, Fusion). Echtheit prüft
        // verifyBlueprintSignature beim Anzeigen.
        if (bp.signature && bp.authorPubKey) {
            out.signature = bp.signature;
            out.authorPubKey = bp.authorPubKey;
            if (bp.signedHash) out.signedHash = bp.signedHash;
            if (bp.signedAt) out.signedAt = bp.signedAt;
        }
        // Ω2 (taille-spec §1a/§2) — die R4-Herkunftskette reist mit (GEMESSEN
        // Ω0: sie starb im Save — der Rückruf konnte ein gespeichertes Artefakt
        // nur über authorPubKey treffen, nie über ein Ketten-Glied).
        const prov = this._sanitizeProvenance(bp.provenance);
        if (prov.length) out.provenance = prov;
        // Ω3(a) — die gereiste Autor-Behauptung (Metadatum) reist weiter.
        if (typeof bp.roleClaimed === "string" && bp.roleClaimed) out.roleClaimed = bp.roleClaimed;
        // PRÄGUNG-WELT — der Guss-Stempel des Bauplans reist EXPLIZIT (deklariertes
        // System-Feld, nicht via must-preserve): ein geprägtes Gerät bleibt geprägt
        // über den Reload (die Hand liest bp.studioOv — sonst Guss-Verlust beim Laden).
        if (bp.studioOv && typeof bp.studioOv === "object" && !Array.isArray(bp.studioOv)) {
            try {
                out.studioOv = JSON.parse(JSON.stringify(bp.studioOv));
            } catch (_e) {
                /* nicht-serialisierbar → fällt still (fail-closed) */
            }
        }
        // Ω2 — must-preserve: Unbekanntes überlebt den Round-Trip (EINE Quelle).
        this._carryUnknown(bp, out, AnazhRealm.BLUEPRINT_KNOWN_KEYS);
        return out;
    }

    // Baut aus einem serialisierten Bauplan (Save / Welt-Tor / Mesh) den lebenden Eintrag: migriert
    // alte Parts (kein material → „stein", keine opChain → Default-Kette), sanitisiert Verbindungen,
    // portalMeta via _sanitizePortalMeta, prüft die Signatur strukturell. Liefert den Eintrag
    // (builtIn:false) oder null; die Registrierungs-Politik entscheidet der Aufrufer.
    _deserializeBlueprint(data) {
        if (!data || typeof data.name !== "string" || !Array.isArray(data.parts)) return null;
        // Welle 4 Phase 1+3 — Migration alter Parts: kein material → Default
        // „stein", keine opChain → Default-Kette. Sicheres Default, keine
        // Datenverluste.
        const migratedParts = data.parts.map((p) => {
            if (!p || typeof p !== "object") return p;
            const out = { ...p };
            if (typeof out.material !== "string" || !this.state.materials[out.material]) {
                out.material = "stein";
            }
            if (!Array.isArray(out.opChain) || out.opChain.length === 0) {
                out.opChain = this._defaultPartOpChain();
            }
            return out;
        });
        // Welle 5 A — connections sanitisieren beim Load.
        const validConnections = this.validateBlueprintConnections(data.connections || [], migratedParts.length);
        const restored = {
            name: data.name,
            label: data.label || data.name,
            builtIn: false,
            parts: migratedParts,
            connections: validConnections,
        };
        // S3-B — geschmiedet bleibt geschmiedet (Gegenstück zu _serializeBlueprint).
        if (Number.isFinite(data.forgedPrecision)) restored.forgedPrecision = data.forgedPrecision;
        // W5 (V18.192, R-031) — die Abnutzung reist mit; ein fehlendes Feld liest 1 (voll;
        // Migration: ein altes Save bekommt seine Werkzeuge frisch zurück, ehrlich).
        if (Number.isFinite(data.wear) && data.wear >= 0 && data.wear <= 1) restored.wear = data.wear;
        // Welle 5 C — role + toolMeta beim Load wiederherstellen.
        if (
            data.role === "tool" &&
            data.toolMeta &&
            AnazhRealm.TOOL_OP_CLASSES.has(data.toolMeta.opClass) &&
            AnazhRealm.TOOL_OP_NAME_PATTERN.test(String(data.toolMeta.opName || ""))
        ) {
            restored.role = "tool";
            restored.toolMeta = { opName: data.toolMeta.opName, opClass: data.toolMeta.opClass };
        }
        // V17.52 Kampf Phase B — die Waffen-Rolle wiederherstellen (Gegenstück zu
        // _serializeBlueprint). Die Parts tragen das Profil; roleManual schützt
        // die Rolle vor der Emergenz.
        if (data.role === "weapon") {
            restored.role = "weapon";
            if (data.roleManual === true) restored.roleManual = true;
        }
        // portalMeta läuft durch _sanitizePortalMeta (erzwingt einen same-origin worlds/-Pfad) — ein
        // manipulierter Save schmuggelt kein fremdes Origin ins Portal-iframe.
        if (data.role === "portal" && data.portalMeta && typeof data.portalMeta === "object") {
            restored.role = "portal";
            if (data.roleManual === true) restored.roleManual = true;
            restored.portalMeta = this._sanitizePortalMeta(data.portalMeta, restored.label);
        }
        // Gegenstück zur Serialize-Reise: JEDE deklarierte Rolle kehrt zurück, aber nur Register-bekannte
        // (kein Müll-String aus manipulierten Saves). Fremde Artefakte: _admitForeignArtifact löscht
        // roleManual danach (Ω3).
        if (
            !restored.role &&
            typeof data.role === "string" &&
            data.roleManual === true &&
            AnazhRealm.ROLE_SIGNATURES[data.role]
        ) {
            restored.role = data.role;
            restored.roleManual = true;
        }
        // Signatur nur strukturell prüfen (Hex-Form); die echte Verifikation macht
        // verifyBlueprintSignature beim Anzeigen (kaputt/gefälscht → „forged").
        if (
            typeof data.signature === "string" &&
            /^[0-9a-f]{2,256}$/i.test(data.signature) &&
            typeof data.authorPubKey === "string" &&
            /^[0-9a-f]{64}$/i.test(data.authorPubKey)
        ) {
            restored.signature = data.signature;
            restored.authorPubKey = data.authorPubKey;
            if (typeof data.signedHash === "string") restored.signedHash = data.signedHash;
            if (typeof data.signedAt === "number") restored.signedAt = data.signedAt;
        }
        // Herkunftskette wiederherstellen (gesäubert — die Hex-Wand gilt auch dem Save) + must-preserve:
        // _carryUnknown trägt NUR, was nicht im known-Satz steht (Sicherheits-Keys bleiben sanitisiert).
        const prov = this._sanitizeProvenance(data.provenance);
        if (prov.length) restored.provenance = prov;
        // Ω3(a) — die gereiste Autor-Behauptung (Metadatum, string-gewandet).
        if (typeof data.roleClaimed === "string" && data.roleClaimed) restored.roleClaimed = data.roleClaimed;
        // PRÄGUNG-WELT — der Guss-Stempel kehrt zurück (Gegenstück zu _serializeBlueprint):
        // NUR ein non-leeres plain object, tief kopiert + größen-bewacht (dieselbe
        // 8-KiB-Taille-Wand wie _carryUnknown — kein Save-/Peer-Riesenstempel).
        if (data.studioOv && typeof data.studioOv === "object" && !Array.isArray(data.studioOv)) {
            try {
                const json = JSON.stringify(data.studioOv);
                if (json && json.length > 2 && json.length <= AnazhRealm.TAILLE_UNKNOWN_FIELD_MAX) {
                    restored.studioOv = JSON.parse(json);
                }
            } catch (_e) {
                /* nicht-serialisierbar → fällt still (fail-closed) */
            }
        }
        this._carryUnknown(data, restored, AnazhRealm.BLUEPRINT_KNOWN_KEYS);
        return restored;
    }

    buildStateSnapshot() {
        const knowledgeBase = this.state.knowledgeBase.slice(-200);
        return {
            playerPosition: this.state.playerMesh
                ? {
                      x: this.state.playerMesh.position.x,
                      y: this.state.playerMesh.position.y,
                      z: this.state.playerMesh.position.z,
                  }
                : { x: 0, y: 5, z: 0 },
            // DIE BODEN-GENERATION (K16): unter welchem Gelände-Gesetz die Höhen dieses Saves stehen (`_bodenUmzug`).
            bodenGeneration: globalThis.__gelaendeCore.BODEN_GENERATION,
            spielerUeberGrund: this.state.playerMesh ? this._ueberGrund(this.state.playerMesh.position) : undefined,
            knowledgeBase: knowledgeBase,
            version: this.state.currentVersion,
            selfAwareness: this.state.selfAwareness,
            // Volle Komponenten-Persistenz je Kreatur (Name+Soul+Memory+bornAt+position); Specs live aus memory.
            // Tasks + carrying bewusst NICHT persistiert (Gesten leben im Moment, Identität lebt fort).
            // Ein Gefallener liegt nie in state.creatures (er zog beim Tod nach state.leichname) — er reist nie in den
            // Snapshot und erwacht nie beim Reload.
            creatures: this.state.creatures.map((c) => this._serializeCreature(c)).filter((s) => s),
            creatureEmotions: this.state.creatureEmotions,
            terrainSteepness: this.state.terrainSteepness,
            terrainBaseHeight: this.state.terrainBaseHeight,
            weather: this.state.weather,
            // Das Scatter-Promoted-Set persistiert via worldMeta: berührte/gespawnte Cells bleiben über den Reload
            // promoted. Als Array serialisiert (JSON kennt keine Sets); Cap 16k Einträge (~512 KB Worst-Case)
            // deckelt die Snapshot-Größe — ältere fallen.
            worldMeta: (() => {
                const wm = { ...this.state.worldMeta };
                if (this.state.scatterPromoted instanceof Set) {
                    const arr = Array.from(this.state.scatterPromoted);
                    if (arr.length > 16000) arr.splice(0, arr.length - 16000);
                    wm.scatterPromoted = arr;
                }
                return wm;
            })(),
            dslAbilities: this.state.dsl.abilities.slice(-200),
            dslHistory: this.state.dsl.history.slice(-this.state.dsl.historyCap),
            // Stehende Welt-Regeln persistieren NUR mit den definierenden Feldern (cond/effect/everySec/source/
            // ttlSec); die Laufzeit-Akkus (fires/born/_sig/costMsSum) setzt der Restore frisch.
            worldRules: (this.state.worldRules || []).slice(0, AnazhRealm.WORLD_RULES.cap).map((r) => ({
                cond: r.cond,
                effect: r.effect,
                everySec: r.everySec,
                source: r.source,
                ttlSec: r.ttlSec,
                // V17.39 — die Schöpfer-Wahl reist mit: angepinnt (adoptiert/Favorit)
                // + pausiert. Nur wenn gesetzt (saubere Snapshots).
                ...(r.pinned ? { pinned: true } : {}),
                ...(r.disabled ? { disabled: true } : {}),
            })),
            // Gewährte Fähigkeiten überleben den Reload (additives Snapshot-Feld; alte Builds bewahren es als
            // Unbekanntes). Die Quarantäne-Queue reist bewusst NICHT (ein Vorschlag ist Session-Tatsache).
            grantedCapabilities: this.state.grantedCapabilities || {},
            // Schicht 1 — Pattern-Memory + Pfad-Buckets persistieren. Beides
            // ist Welt-Gedächtnis und überlebt Reloads bewusst.
            dslPatternMemory: this.state.dsl.patternMemory || {},
            playerPathBuckets: this.state.player.pathBuckets || null,
            // Welle 1 D — Welt-Journal persistiert. Ohne das Journal hätte
            // jede Session ihre eigene Geschichte; mit ihm wächst die Welt
            // über Reloads hinweg.
            worldJournal: {
                entries: (this.state.worldJournal.entries || []).slice(-this.state.worldJournal.entryCap),
                seen: { ...(this.state.worldJournal.seen || {}) },
            },
            // Ring 3: Player-Emotionen werden mitgespeichert. Cooldown-Timer
            // bleiben absichtlich draußen — sie sind reine Laufzeit-Drosselung,
            // ein Reload soll wieder triggerfähig sein.
            playerEmotions: { ...this.state.player.emotions },
            // Tag-Nacht: timeOfDay läuft nach dem Reload weiter. Die Tag-Länge ist die Wahl des Spielers und lebt bei ihm
            // (localStorage, `setDayLength`): der Kopf trägt sie, weil die Taille v1 den Schlüssel verlangt
            // (spec/golden/v1/snapshot-head.json, MUST weiter produziert), das Laden setzt sie nie (Leben-Schau 2: jeder
            // alte Stand trug den 8-min-Tag und hielte ihn fest).
            // weatherTransition NICHT persistiert (Laufzeit-Artefakt; Reload startet mit stabilem Wetter).
            timeOfDay: typeof this.state.timeOfDay === "number" ? this.state.timeOfDay : 0.5,
            dayLengthMinutes: this.state.dayLengthMinutes,
            // Das Wort des Spielers über das Wetter reist mit (es steht, bis er es freigibt); der Wunsch der Welt nicht.
            wetterWort: this.state.wetterWort || null,
            // ERFINDER-WELLE — die Welt-Klang-Wahl reist (V8.59-Klasse: sonst still zurückgesetzt).
            klangPreset: typeof this.state.klangPreset === "string" ? this.state.klangPreset : null,
            // Die Studio-Übergabe überlebt den Reload (sonst still zurück auf die gefrorenen Kern-Presets).
            // Am Empfänger Taille-gedeckelt (≤ TAILLE_UNKNOWN_FIELD_MAX); der Restore läuft durch DENSELBEN
            // Validator (_studioUebergabeValidate).
            studioUebergabe: (() => {
                const u = this.state.studioUebergabe;
                return u && typeof u === "object"
                    ? {
                          koerper: u.koerper && typeof u.koerper === "object" ? u.koerper : null,
                          kreatur: u.kreatur && typeof u.kreatur === "object" ? u.kreatur : {},
                      }
                    : { koerper: null, kreatur: {} };
            })(),
            // Die vier Perf-Regler reisen im Snapshot (sonst setzt jeder Reload sie still zurück):
            // perfTargetMs · lodRef (Quelle von Subsystem A) · szeneSkala · chunkRingRadius.
            perfTargetMs: Number.isFinite(this.state.perfTargetMs) ? this.state.perfTargetMs : 17,
            lodRef: Number.isFinite(this.state.lodRef) ? this.state.lodRef : 14,
            szeneSkala: Number.isFinite(this.state.szeneSkala) ? this.state.szeneSkala : null,
            chunkRingRadius: Number.isFinite(this.state.chunkRingRadius) ? this.state.chunkRingRadius : 4,
            // V18.389 (P5) — die Sichtbarkeit des sauberen Perf-Panels (default an).
            perfPanel: this.state.perfPanel !== false,
            // V8.28 6.G4.b — Atmosphäre-Slider (Cel-Stufen seit V18.236 und der Fog-Regler seit V18.530 gestrichen).
            // V13.9 — waterCull (uMinDepth) mit dabei.
            atmosphere: {
                waterCull:
                    this.state.atmosphere && Number.isFinite(this.state.atmosphere.waterCull)
                        ? this.state.atmosphere.waterCull
                        : 0.0025,
                // V18.14/.15 — Makro-Kontext-Regler persistieren.
                waterDepthFoam:
                    this.state.atmosphere && Number.isFinite(this.state.atmosphere.waterDepthFoam)
                        ? this.state.atmosphere.waterDepthFoam
                        : 1.2,
                waterLakeRipple:
                    this.state.atmosphere && Number.isFinite(this.state.atmosphere.waterLakeRipple)
                        ? this.state.atmosphere.waterLakeRipple
                        : 0.06,
                // (waterfallSteep V18.111 gefallen — A4)
                // J4-Regler: Kavitäts-AO-Stärke (0..1) + Kanten-Schärfe (Post-FX local-contrast, 0..1).
                cavityAO:
                    this.state.atmosphere && Number.isFinite(this.state.atmosphere.cavityAO)
                        ? this.state.atmosphere.cavityAO
                        : 1.0,
                kantenSchaerfe:
                    this.state.atmosphere && Number.isFinite(this.state.atmosphere.kantenSchaerfe)
                        ? this.state.atmosphere.kantenSchaerfe
                        : 0,
                triplanar:
                    this.state.atmosphere && Number.isFinite(this.state.atmosphere.triplanar)
                        ? this.state.atmosphere.triplanar
                        : 1.0,
                colorVar:
                    this.state.atmosphere && Number.isFinite(this.state.atmosphere.colorVar)
                        ? this.state.atmosphere.colorVar
                        : 1.0,
                // V17.111 R1 — Schatten-Hebel (Reichweite/Bias).
                shadowRange:
                    this.state.atmosphere && Number.isFinite(this.state.atmosphere.shadowRange)
                        ? this.state.atmosphere.shadowRange
                        : 300,
                shadowBias:
                    this.state.atmosphere && Number.isFinite(this.state.atmosphere.shadowBias)
                        ? this.state.atmosphere.shadowBias
                        : 1.0,
                // §7.5/V18.164 (GEMESSENER Riss, V8.59-Klasse): die M7-Regler
                // (V18.160) lebten nur in der Session — Snapshot + Restore
                // trugen sie nicht → jeder Reload setzte sie still zurück.
                microStrength:
                    this.state.atmosphere && Number.isFinite(this.state.atmosphere.microStrength)
                        ? this.state.atmosphere.microStrength
                        : 0.1,
                terrainNightFloor:
                    this.state.atmosphere && Number.isFinite(this.state.atmosphere.terrainNightFloor)
                        ? this.state.atmosphere.terrainNightFloor
                        : AnazhRealm.SUBSTANCE_RESPONSE.nightFloor,
                moonRim:
                    this.state.atmosphere && Number.isFinite(this.state.atmosphere.moonRim)
                        ? this.state.atmosphere.moonRim
                        : AnazhRealm.SUBSTANCE_RESPONSE.moonRim,
                // V18.210 (§1-A2) — der R5-STRUKTUR-BOOST überlebt den Reload
                // (sonst springt der Slider zurück auf 1.3 → V8.59-Klasse,
                // dieselbe Heilung wie microStrength/terrainNightFloor V18.164).
                r5StructureBoost:
                    this.state.atmosphere && Number.isFinite(this.state.atmosphere.r5StructureBoost)
                        ? this.state.atmosphere.r5StructureBoost
                        : (AnazhRealm.R5_STRUCTURE_TEXTURE && AnazhRealm.R5_STRUCTURE_TEXTURE.microBoost) || 1.3,
            },
            // Ring 5: Spieler-Seele (visuelle Form). Beim Load wird sie nach
            // dem playerMesh-Bau angewandt — kein Body-Recreate.
            playerSoul: this.state.player.soul || "human",
            // Welle 6.D Etappe 1.6 — Custom-Seelen persistieren (eigene
            // Charaktere des Schöpfers). Built-ins sind in playerSoulDefs
            // verdrahtet und werden NICHT persistiert.
            customSouls: this.state.customSouls || {},
            // Gewachsene Baupläne (`_grown_*`, _isGrown:true) reisen mit, weil state.architectures sie als `type`
            // referenziert — fehlen sie, schlägt spawnArchitecture beim Restore fehl. Nur die METADATA reist:
            // die `parts` sind pure Funktion von (species, seed) und wachsen beim Restore via `_growTreeBlueprint`
            // nach (~75 Parts/Baum würden die 256-KB-Wand von pinCurrentWorld sprengen).
            grownBlueprints: (() => {
                // NUR von einer Architektur REFERENZIERTE gewachsene Baupläne persistieren. Foliage-Varianten wachsen
                // im nächsten Streaming-Pass deterministisch nach; im Snapshot blähten sie ihn und umgingen beim
                // Restore die 256er-Ring-Deckelung (Inflation über Sessions). Architektur-gehaltene MÜSSEN bleiben,
                // sonst verliert ein platzierter Baum seinen Bauplan.
                const out = {};
                const bps = this.state.blueprints || {};
                for (const k in bps) {
                    if (bps[k] && bps[k]._isGrown && this._isGrownBlueprintReferenced(k)) {
                        out[k] = {
                            label: bps[k].label,
                            _grownSpecies: bps[k]._grownSpecies,
                            _grownSeed: bps[k]._grownSeed,
                        };
                    }
                }
                return out;
            })(),
            // Welle 6.D Etappe 3a — Konsumable-Rezepte persistieren.
            consumables: this.state.consumables || {},
            // Welle 6.D Etappe 3b / V17.57 W2-B — Equipped-Slots persistieren ({held, armor}).
            playerEquipped: (this.state.player && this.state.player.equipped) || {
                held: null,
                armor: null,
            },
            // Welle 4 Phase 3: Werkzeug-Besitz. Starter-Werkzeuge werden bei
            // jedem Init wieder verfügbar, aber Persistenz erlaubt zukünftig
            // eigen-geschmiedete (Welle 6) zu überleben.
            playerTools: Array.isArray(this.state.player.tools) ? [...this.state.player.tools] : [],
            // Ring 6: Bau-Werke. Nur {type, position, seed, scale} — der
            // Mesh wird beim Laden aus dem Seed rekonstruiert (kein Mesh-
            // Snapshot). V2 inkludiert scale für fraktale Sub-Strukturen.
            architectures: (this.state.architectures || []).map((a) => ({
                // Eine string-id ist eine GETEILTE Architektur-Identität (spieler-gebaut + broadcastet): sie muss Save
                // + Snapshot-Transfer überleben, sonst divergieren die Peer-ids und der Abbau-Sync bricht.
                // Numerische ids (Worldgen) sind lokal.
                id: a.id,
                type: a.type,
                position: { x: a.position.x, y: a.position.y, z: a.position.z },
                // die Höhe über dem Boden des Gesetzes: der Boden-Umzug stellt sie auf einem neuen Boden wieder her
                ueberGrund: this._ueberGrund(a.position),
                seed: a.seed,
                scale: Number.isFinite(a.scale) ? a.scale : 1,
                // W-H (V18.179, V8.59-Klasse) — die Pro-Instanz-Yaw überlebt den
                // Reload (sonst rasten geladene Bäume auf Identity zurück → der
                // Klon-Look kehrt wieder). Nur wenn gesetzt (Bauwerke = 0).
                ...(Number.isFinite(a.rotationY) && a.rotationY !== 0 ? { rotationY: a.rotationY } : {}),
                // tintH/S/V sind seed-deterministisch, reisen aber explizit mit: ein durchs Tor gewanderter Bauplan
                // behält seine Färbung auch in einer Welt mit anderer Seed-Berechnung.
                ...(Number.isFinite(a.tintH) ? { tintH: a.tintH } : {}),
                ...(Number.isFinite(a.tintS) ? { tintS: a.tintS } : {}),
                ...(Number.isFinite(a.tintV) ? { tintV: a.tintV } : {}),
                // Ω5 — die Gratis-Geburt überlebt den Reload (sonst wüsche der
                // Save die Marke ab und der pfad erntete doch — GEMESSEN Z2b).
                ...(a.freeBorn === true ? { freeBorn: true } : {}),
                // die Marke des Wurfs überlebt den Reload (sonst sperrte ein geladener Wurf des Felds der Ort-Wahl den Grund)
                ...(a.feldWurf === true ? { feldWurf: true } : {}),
                // PRÄGUNG-WELT — der Guss-Stempel überlebt den Reload (sonst verlöre
                // ein geprägtes Werk beim Restore seinen Charakter, V8.59-Klasse).
                ...(a.studioOv && typeof a.studioOv === "object" ? { studioOv: a.studioOv } : {}),
                // DORF-IN-TERRAIN — der Fundament-Footprint überlebt den Reload (das
                // Podest + die Blocker-Wahrheit leiten die Tiefe live aus dem Feld ab).
                ...(a.fundament && Number.isFinite(a.fundament.ex)
                    ? {
                          fundament: Object.assign(
                              { ex: a.fundament.ex, ez: a.fundament.ez },
                              a.fundament.ox || a.fundament.oz ? { ox: a.fundament.ox, oz: a.fundament.oz } : {}
                          ),
                      }
                    : {}),
                // DORF-ERLEBNIS — die Tür-Zeile überlebt den Reload (die Blocker-
                // Tür-Lücke + der Flügel-Tick leiten alles live daraus ab).
                ...(a.tuer && Number.isFinite(a.tuer.w) ? { tuer: a.tuer } : {}),
                // KAMIN-RAUCH (.105) — Spitze überlebt den Reload (Rauch ⟺ chimney).
                // das Nein (null: kein Kamin) reist mit — sonst baut das Laden das Haus nach, um es zu finden (K69)
                ...(a.chimney && Number.isFinite(a.chimney.x)
                    ? { chimney: a.chimney }
                    : a.chimney === null
                      ? { chimney: null }
                      : {}),
                // Entry-level portalMeta (Halle-Slots): jedes Tor einer Halle trägt eine eigene worldAddress; ohne
                // Persistenz zögen nach dem Reload alle Slots die Bauplan-Default-portalMeta (die Halle wäre tot).
                ...(a.portalMeta && typeof a.portalMeta === "object" ? { portalMeta: a.portalMeta } : {}),
            })),
            // Φ7 (V18.190) — die KURATIONS-MANIFESTE der Welt: signierte
            // Hallen (Welt-Verzeichnisse) reisen im Snapshot mit. JSON-flach
            // (Map → Array), Restore baut die Map zurück.
            portalHalls: Array.from(this.state.portalHalls || new Map()).map(([name, h]) => ({
                name,
                label: h.label,
                entries: h.entries.map((e) => ({ address: { ...e.address }, label: e.label })),
                authorPubKey: h.authorPubKey || null,
                sig: h.sig || null,
                signedAt: h.signedAt || 0,
                signedHash: h.signedHash || null,
                provenance: Array.isArray(h.provenance) ? h.provenance.slice() : [],
            })),
            // Φ6 (V18.191) — die COMPUTE-SPENDE-Schicht reist mit (Hashes,
            // klein — 256 contributions × ~50 B = ~13 KiB Cap). Das Web der
            // Verifizierung wächst mit der Welt.
            computeContributions: Array.from(this.state.computeContributions || new Map()).map(([inputHash, c]) => ({
                inputHash,
                outputHash: c.outputHash,
                providedBy: c.providedBy || null,
                providedAt: c.providedAt || 0,
                sig: c.sig || null,
                status: c.status || "unverified",
            })),
            playtestContributions: (this.state.playtestContributions || []).slice(),
            // Nur eigene Baupläne persistieren (die Built-ins erzeugt _defaultBlueprints() beim Init).
            // Der Feld-Satz lebt in _serializeBlueprint — EINE Quelle für alle drei Snapshot-Pfade.
            blueprints: Object.values(this.state.blueprints || {})
                .filter((bp) => bp && !bp.builtIn)
                .map((bp) => this._serializeBlueprint(bp)),
            // Welle 5 C — eigene Werkzeuge (aus registrierten Bauplänen)
            // persistieren. Starter-Werkzeuge entstehen aus _defaultTools()
            // bei jedem Init, deshalb nur eigene speichern. Ω2: EIN Serialize.
            tools: Object.values(this.state.tools || {})
                .filter((t) => t && !t.builtIn)
                .map((t) => this._serializeTool(t)),
            // Welle 4 Phase 1 — eigene Materialien persistieren. Built-ins
            // kommen aus _defaultMaterials() im Konstruktor zurück; auch hier
            // schreiben wir nur, was der Spieler dazugefügt hat. Ω2: EIN Serialize.
            materials: Object.values(this.state.materials || {})
                .filter((m) => m && !m.builtIn)
                .map((m) => this._serializeMaterial(m)),
            // Ring 6.5 — Hotbar-Belegung. Array von 9 Slots mit Bauplan-Name
            // oder null. Default wird beim Init überschrieben.
            hotbar: Array.isArray(this.state.hotbar) ? this.state.hotbar.slice(0, 9) : [],
            // Welle 6.C1 — Inventar persistiert. 27 Slots, jeweils {blueprintName,
            // count} oder null. Bei Reload defensive Validierung (unbekannte
            // Bauplan-Namen werden zu null, count auf 1..999 geclampt).
            playerInventory: Array.isArray(this.state.player && this.state.player.inventory)
                ? this.state.player.inventory
                      .slice(0, 27)
                      .map((s) => (s ? { blueprintName: s.blueprintName, count: s.count || 1 } : null))
                : [],
        };
    }

    // ===== IndexedDB-Persistenz =====
    // Große Welt-Snapshots leben in IndexedDB (localStorage-Wand ~5 MB je Origin); der winzige Index
    // (anazhRealmWorlds/Active) bleibt synchron in localStorage, das weiter als Spiegel geschrieben wird.
    // Beim LESEN gewinnt der neuere Stand (IDB-Stempel vs. worldsIndex.lastPlayed). Ohne IndexedDB trägt
    // localStorage allein; wirft localStorage QUOTA, trägt IndexedDB allein.

    // Lazy-Open der EINEN DB (Promise gecacht; null = nicht verfügbar).
    _idb() {
        if (this._idbPromise !== undefined) return this._idbPromise;
        if (typeof indexedDB === "undefined") {
            this._idbPromise = Promise.resolve(null);
            return this._idbPromise;
        }
        this._idbPromise = new Promise((resolve) => {
            try {
                const req = indexedDB.open("anazhRealm", 1);
                req.onupgradeneeded = () => {
                    const db = req.result;
                    if (!db.objectStoreNames.contains("worlds")) db.createObjectStore("worlds");
                };
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => resolve(null);
                req.onblocked = () => resolve(null);
            } catch {
                resolve(null);
            }
        });
        return this._idbPromise;
    }

    // Einen Welt-Snapshot (JSON-String) ablegen. {at} stempelt die Frische.
    async _idbPutWorld(worldId, json) {
        const db = await this._idb();
        if (!db || !worldId) return false;
        return new Promise((resolve) => {
            try {
                const tx = db.transaction("worlds", "readwrite");
                tx.objectStore("worlds").put({ at: Date.now(), json }, worldId);
                tx.oncomplete = () => resolve(true);
                tx.onerror = () => resolve(false);
                tx.onabort = () => resolve(false);
            } catch {
                resolve(false);
            }
        });
    }

    async _idbGetWorld(worldId) {
        const db = await this._idb();
        if (!db || !worldId) return null;
        return new Promise((resolve) => {
            try {
                const tx = db.transaction("worlds", "readonly");
                const req = tx.objectStore("worlds").get(worldId);
                req.onsuccess = () => {
                    const r = req.result;
                    resolve(r && typeof r.json === "string" ? r : null);
                };
                req.onerror = () => resolve(null);
            } catch {
                resolve(null);
            }
        });
    }

    async _idbDeleteWorld(worldId) {
        const db = await this._idb();
        if (!db || !worldId) return false;
        return new Promise((resolve) => {
            try {
                const tx = db.transaction("worlds", "readwrite");
                tx.objectStore("worlds").delete(worldId);
                tx.oncomplete = () => resolve(true);
                tx.onerror = () => resolve(false);
            } catch {
                resolve(false);
            }
        });
    }

    // Boot-Vorlauf (init awaitet ihn VOR der Vorlade und vor loadState): den IDB-Stand der aktiven Welt lesen und halten —
    // ob er gewinnt (frischer als der Platz) oder rettet (Platz und .bak leer oder korrupt), entscheidet die EINE
    // Rettungs-Kette `_weltRettungsKette`. Bis 10.10. lief er erst nach ensureWorldMeta: eine Welt, die nur in IndexedDB
    // lag, war da schon durch eine frische ersetzt.
    async _idbPreload() {
        this._idbPreloadedState = null;
        const activeId = this.activeWorldGet();
        if (!activeId) return;
        const rec = await this._idbGetWorld(activeId);
        if (!rec) return;
        try {
            this._idbPreloadedState = { worldId: activeId, state: JSON.parse(rec.json), at: rec.at };
        } catch (e) {
            this._idbPreloadedState = { worldId: activeId, state: null, at: rec.at, kaputt: e.message };
        }
    }

    triggerStateDownload(stateToSave, suggestedName) {
        // Generischer Helper: stößt einen Browser-Download mit dem aktuellen
        // State an. Funktioniert auch auf CDN-Hosts ohne save-server.
        const dataStr =
            "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stateToSave, null, 2));
        const a = document.createElement("a");
        a.setAttribute("href", dataStr);
        const stamp = new Date().toISOString().replace(/[:.]/g, "-");
        const name = suggestedName || `anazhRealmState_${stamp}.json`;
        a.setAttribute("download", name);
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    // ### Fremde Welten empfangen ###
    // Ein Spieler exportiert das signierte Manifest einer Welt, ein anderer importiert es; die Signatur
    // reist mit (docs/taille-spec.md). Das ist die Metadaten-/Provenienz-Schicht der Bibliothek.

    // Built-in-Registry + importierte Welten als EINE Lookup-Quelle.
    _worldEntry(id) {
        const key = String(id || "")
            .trim()
            .toLowerCase();
        return AnazhRealm.WORLD_REGISTRY[key] || (this.state.customWorlds && this.state.customWorlds[key]) || null;
    }

    // Die ganze Bibliothek als Array — Built-ins zuerst, dann Importierte.
    _libraryWorlds() {
        const out = Object.values(AnazhRealm.WORLD_REGISTRY);
        const custom = this.state.customWorlds || {};
        for (const id of Object.keys(custom)) out.push(custom[id]);
        return out;
    }

    // EIN Welt-Lese-Vektor für viele Leser (Spec-Card · Such-Filter · Sortierung · Fokus), Muster wie
    // `_creatureProfile`/`_selfProfile`: Identität · Trust · Multiplayer/Server · DSL · Stufe · Herkunft ·
    // Signatur-Präsenz + Such-Index. Read-only; alle Achsen sind reale customWorlds/WORLD_REGISTRY-Felder.
    _worldProfile(world) {
        const w = world || {};
        const id = String(w.id || "");
        const isImported = !!(this.state.customWorlds && this.state.customWorlds[id]);
        const dsl = Array.isArray(w.dsl) ? w.dsl : [];
        const prof = {
            world: w,
            id,
            label: w.label || id || "?",
            desc: typeof w.desc === "string" ? w.desc : "",
            worldPath: w.world || "",
            dsl,
            hasDsl: dsl.length > 0,
            trust: w.trust === "sandboxed" ? "sandboxed" : "trusted",
            multiplayer: w.multiplayer === true,
            // W18-B — die Welt deklariert das Ko-Präsenz-Protokoll (AnazhRealm
            // injiziert die Augen: ihr seht euch in ihr, obwohl sie selbst
            // keine Mitspieler kennt).
            coPresence: w.coPresence === true,
            serverMode: w.serverMode === "js-compute" ? "js-compute" : "relay",
            imported: isImported,
            translated: isImported && w.translated === true,
            vendored: isImported && w.vendored === true,
            scene: w.scene || null,
            reachable: w.reachable !== false,
            importedAt: Number.isFinite(w.importedAt) ? w.importedAt : 0,
            authorPubKey: typeof w.authorPubKey === "string" ? w.authorPubKey : "",
            signature: typeof w.signature === "string" ? w.signature : "",
        };
        // G8 R4 (M4a) — die Herkunftskette als Lese-Feld: macht „über dich" vs.
        // „von dir" sichtbar (Echtheit ≠ Gutartigkeit). Eine Signatur beweist nur
        // Berührung; die Kette zeigt, WOHER das Werk wirklich stammt.
        prof.provenance = this._provenanceSummary(w);
        prof.tainted = prof.provenance.tainted;
        // Stufe — wie heute (hasDsl → „übersetzt", sonst „ausgestellt"); die Marke „nativ"
        // emergiert erst beim Betreten (W12 P3).
        prof.stage = prof.hasDsl ? "übersetzt" : "ausgestellt";
        prof.stageTitle = prof.hasDsl
            ? "Diese Welt versteht ein DSL-Vokabular (Stufe übersetzt). Beim Betreten kann sie es nativ bestätigen."
            : "Diese Welt ist spielbar, aber stumm gegenüber der DSL.";
        // Herkunfts-Marke — die Klassen-Hooks bleiben (.library-vendored-/translated-/imported-mark, Tests).
        if (prof.vendored) {
            prof.origin = "angedockt";
            prof.originClass = "library-vendored-mark";
            prof.originTitle =
                "Diese Welt dockte über den Auto-Vendor an — ihr Bündel liegt in worlds/, sie läuft sandgesichert (W15 Phase 1).";
        } else if (prof.translated) {
            prof.origin = "KI-übersetzt";
            prof.originClass = "library-translated-mark";
            prof.originTitle =
                "Diese Welt übersetzte der KI-Übersetzer aus einer Beschreibung in ein Portal-Manifest (Phase 1).";
        } else if (prof.imported) {
            prof.origin = "empfangen";
            prof.originClass = "library-imported-mark";
            prof.originTitle = "Diese Welt kam als signiertes Manifest in deine Bibliothek (W14 Phase 3).";
        } else {
            prof.origin = "";
            prof.originClass = "";
            prof.originTitle = "";
        }
        // Such-Index — Name · Vokabular · Trust/Signatur/Netz-Schlagworte (treibt das Bib-D-Filter).
        prof.searchText = [
            prof.label,
            prof.desc,
            dsl.join(" "),
            prof.trust === "sandboxed" ? "sandbox sandboxed" : "vertraut trusted",
            prof.multiplayer ? "multiplayer" : "einzelwelt",
            prof.coPresence ? "ko-präsenz copresence gemeinsam" : "",
            prof.serverMode === "js-compute" ? "js-compute" : "",
            prof.signature ? "signiert signed" : "unsigniert",
            prof.origin,
        ]
            .join(" ")
            .toLowerCase();
        return prof;
    }

    // Lädt die importierten Welten aus dem GLOBALEN localStorage-Schlüssel.
    // Defensiv: jeder Eintrag läuft durch _sanitizeImportedManifest — ein
    // korruptes Manifest wird verworfen, nie ein Wurf.
    _loadCustomWorlds() {
        const out = {};
        try {
            const raw = typeof localStorage !== "undefined" ? localStorage.getItem("anazh.customWorlds") : null;
            if (!raw) return out;
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== "object") return out;
            for (const id of Object.keys(parsed)) {
                const clean = this._sanitizeImportedManifest(parsed[id]);
                // G8 R4 (M4b) — der RÜCKRUF beim Laden: eine Welt mit einem
                // revozierten Schlüssel irgendwo in ihrer Herkunftskette (oder
                // als Signierer) fällt weg — die Infektion ist ausgestoßen.
                if (clean && !this._artifactProvenanceTainted(clean)) out[clean.id] = clean;
            }
        } catch {
            /* korrupte Map → leer, kein Wurf */
        }
        return out;
    }

    _saveCustomWorlds() {
        try {
            if (typeof localStorage !== "undefined") {
                localStorage.setItem("anazh.customWorlds", JSON.stringify(this.state.customWorlds || {}));
            }
        } catch (e) {
            this.log(`customWorlds-Speichern fehlgeschlagen: ${e && e.message}`, "WARN");
        }
    }

    // Säubert ein importiertes Manifest auf eine sichere customWorlds-Form: id op-förmig und NIE eine
    // Built-in-Welt überschreibend; world durch _sanitizePortalMeta (same-origin worlds/-Pfad), dsl durch
    // _sanitizeDslSubset, Signatur hex-geprüft. null bei Unbrauchbarem; `reachable` bleibt erhalten.
    _sanitizeImportedManifest(m) {
        if (!m || typeof m !== "object") return null;
        const id = String(m.id || "")
            .trim()
            .toLowerCase();
        if (!/^[a-z0-9_-]{1,40}$/.test(id)) return null;
        if (AnazhRealm.WORLD_REGISTRY[id]) return null; // kein Built-in-Override
        const meta = this._sanitizePortalMeta(
            { world: m.world, label: m.label, dsl: m.dsl, trust: m.trust },
            typeof m.label === "string" ? m.label : id
        );
        const out = {
            id,
            label: meta.label,
            world: meta.world,
            dsl: meta.dsl ? meta.dsl.slice() : [],
            desc: typeof m.desc === "string" ? m.desc.slice(0, 240) : "",
            reachable: m.reachable === true,
            importedAt: typeof m.importedAt === "number" ? m.importedAt : Date.now(),
            // trust muss den localStorage-Rundlauf überleben, sonst verliert eine vendorte Welt ihre Sandbox.
            // _sanitizePortalMeta whitelistet (Default "trusted", nur "sandboxed" kommt durch).
            trust: meta.trust,
        };
        if (
            typeof m.authorPubKey === "string" &&
            /^[0-9a-f]{64}$/i.test(m.authorPubKey) &&
            typeof m.signature === "string" &&
            /^[0-9a-f]{2,256}$/i.test(m.signature)
        ) {
            out.authorPubKey = m.authorPubKey;
            out.signature = m.signature;
            out.signedHash = typeof m.signedHash === "string" ? m.signedHash : "";
            out.signedAt = typeof m.signedAt === "number" ? m.signedAt : 0;
        }
        // G8 R4 (M4a) — die mitgereiste Herkunftskette bewahren (gesäubert): der
        // Empfänger sieht „Ursprung X · über dich" statt nur deiner Signatur, und
        // der Rückruf (M4b) kann an JEDEM Glied der Kette greifen.
        const chain = this._sanitizeProvenance(m.provenance);
        if (chain.length) out.provenance = chain;
        // KI-Übersetzer Phase 1 — eine übersetzte Welt trägt eine Marke, die
        // den localStorage-Rundlauf überleben muss (sonst verlöre sie nach
        // dem Reload ihren „übersetzt"-Status).
        if (m.translated === true) {
            out.translated = true;
            out.translatedAt = typeof m.translatedAt === "number" ? m.translatedAt : Date.now();
        }
        // KI-Übersetzer Phase 2 — eine aufgebaute Welt trägt ihre deklarative
        // Szene; sie läuft beim Laden erneut durch _sanitizeWorldScene (die
        // Wand gilt auch für den localStorage-Rundlauf).
        if (m.scene && typeof m.scene === "object") {
            out.scene = this._sanitizeWorldScene(m.scene);
        }
        // Vendorte Welt (Bündel in worlds/<id>/) ist IMMER sandgesichert (null-origin): `vendored` erzwingt
        // trust:"sandboxed" — auch ein manipulierter Manifest-Eintrag kann das nicht aufweichen.
        if (m.vendored === true) {
            out.vendored = true;
            out.vendoredAt = typeof m.vendoredAt === "number" ? m.vendoredAt : Date.now();
            out.trust = "sandboxed";
            // W16 Phase 2 — der Content-Hash gibt der Welt eine peer-
            // unabhängige Identität (Welt-Katalog-Dedup). Er muss den
            // localStorage-Rundlauf überleben (V8.59-Lehre).
            if (typeof m.bundleHash === "string" && /^[0-9a-f]{1,64}$/i.test(m.bundleHash)) {
                out.bundleHash = m.bundleHash.toLowerCase();
            }
        }
        // multiplayer + serverMode (relay = Default, Mesh broadcastet · js-compute = ein Peer hostet die
        // autoritative Server-JS) müssen den localStorage-Rundlauf überleben und über aimBlueprintAtWorld ins
        // portalMeta fließen — sonst lädt ein geholtes Portal ohne Transport-Shim bzw. nicht als js-compute.
        out.serverMode = m.serverMode === "js-compute" ? "js-compute" : "relay";
        // Eine js-compute-Welt ist per Natur mehrspielerfähig — die Marke
        // koppelt mit (wie _sanitizePortalMeta es im portalMeta erzwingt).
        if (m.multiplayer === true || out.serverMode === "js-compute") out.multiplayer = true;
        // W18-B — die Ko-Präsenz-Deklaration überlebt den Rundlauf (V8.59):
        // ein geholtes Portal dieser Welt injiziert die Pose-Schicht.
        if (m.coPresence === true) out.coPresence = true;
        // must-preserve (taille-spec §2): Unbekanntes überlebt die Sanitize-Wand als OPAKES Datum;
        // _carryUnknown trägt nur, was nicht in MANIFEST_KNOWN_KEYS steht — die Sicherheits-Felder bleiben
        // sanitisiert.
        this._carryUnknown(m, out, AnazhRealm.MANIFEST_KNOWN_KEYS);
        return out;
    }

    // W14 Phase 3 — eine Welt teilen: ihr signiertes Manifest als Datei
    // exportieren (das §3.3-Manifest, jetzt mit authorPubKey + signature). Die
    // Welt muss signiert sein — ohne Signatur gäbe es keine Provenienz.
    exportWorldManifest(worldId) {
        const key = String(worldId || "")
            .trim()
            .toLowerCase();
        const entry = this._worldEntry(key);
        if (!entry) return { ok: false, reason: "world_unknown" };
        const custom = this.state.customWorlds && this.state.customWorlds[key];
        const sig = custom && custom.signature ? custom : this.state.signedWorlds && this.state.signedWorlds[key];
        if (!sig || !sig.signature || !sig.authorPubKey) return { ok: false, reason: "not_signed" };
        const manifest = {
            schemaVersion: "1.0",
            id: entry.id,
            label: entry.label,
            desc: entry.desc || "",
            world: entry.world,
            dsl: Array.isArray(entry.dsl) ? entry.dsl.slice() : [],
            // W17 — die Multiplayer-Marke reist mit dem geteilten Manifest
            // (Metadaten, nicht signierte Substanz — wie world-Pfad/desc).
            multiplayer: entry.multiplayer === true,
            // W18-B — die Ko-Präsenz-Marke reist mit (Metadaten wie multiplayer).
            coPresence: entry.coPresence === true,
            // W17 P-Vendor — der Server-Modus reist mit dem geteilten Manifest.
            serverMode: entry.serverMode === "js-compute" ? "js-compute" : "relay",
            authorPubKey: sig.authorPubKey,
            signature: sig.signature,
            signedHash: sig.signedHash || "",
            signedAt: sig.signedAt || 0,
            // Die ganze Herkunftskette reist (Ursprung + Überträger): beim Teilen hänge ich mich als Überträger
            // an, wenn ich nicht der Ursprung bin („über dich" vs. „von dir"). Metadaten, nicht Substanz.
            provenance: this._sanitizeProvenance(sig.provenance),
        };
        const myKey = this.state.vibePass && this.state.vibePass.publicKeyHex;
        if (myKey) this._appendProvenance(manifest, myKey);
        this.triggerStateDownload(manifest, `anazh-welt-${entry.id}.json`);
        this.journalAppend("share", `Ich teilte die ${entry.label} — ihr signiertes Manifest ging hinaus.`, {
            world: entry.id,
        });
        return { ok: true, id: entry.id, manifest };
    }

    // Fremdes Welt-Manifest empfangen: säubern, mitgereiste Signatur verifizieren, per fetch prüfen, ob
    // die Welt-Dateien erreichbar sind (sonst browsbar, nicht betretbar), in customWorlds legen.
    async importWorldManifest(parsed) {
        const clean = this._sanitizeImportedManifest(parsed);
        if (!clean) {
            // id-Kollision mit einer Built-in-Welt sauberer melden.
            const rawId = parsed && typeof parsed === "object" ? String(parsed.id || "").toLowerCase() : "";
            if (rawId && AnazhRealm.WORLD_REGISTRY[rawId]) return { ok: false, reason: "id_is_builtin" };
            return { ok: false, reason: "invalid_manifest" };
        }
        // Erreichbarkeit prüfen: lädt der world-Pfad? (same-origin worlds/-Pfad).
        let reachable = false;
        try {
            const res = await fetch(clean.world, { method: "GET" });
            reachable = !!(res && res.ok);
        } catch {
            reachable = false;
        }
        clean.reachable = reachable;
        // Signatur-Status (manifest-getragen).
        let signatureStatus = "unsigned";
        if (clean.signature && clean.authorPubKey) {
            const canonical = this._canonicalManifest(clean);
            if (clean.signedHash && this._fastHash(canonical) !== clean.signedHash) {
                signatureStatus = "modified";
            } else {
                signatureStatus = (await this._vibeVerify(canonical, clean.signature, clean.authorPubKey))
                    ? "valid"
                    : "forged";
            }
        }
        if (!this.state.customWorlds) this.state.customWorlds = {};
        this.state.customWorlds[clean.id] = clean;
        this._saveCustomWorlds();
        this.journalAppend("growth", `Eine fremde Welt fand den Weg in deine Bibliothek: „${clean.label}".`, {
            world: clean.id,
            signature: signatureStatus,
        });
        return { ok: true, id: clean.id, signatureStatus, reachable };
    }

    // ### KI-Übersetzer: fremde Welt → Portal-Manifest ###
    // Der LLM-Output ist DATEN, nie Code: per JSON.parse gelesen (nie eval/Function) und durch
    // _sanitizeImportedManifest gesäubert — dieselbe Wand wie der Manifest-Import.

    // Der System-Prompt des Übersetzers — er weist das LLM an, eine frei
    // beschriebene Welt ins schlanke Portal-Manifest zu übersetzen.
    _buildTranslatorPrompt() {
        return [
            "Du bist der KI-Übersetzer von AnazhRealm — einem Tor zu fremden Vibecode-Welten.",
            "Übersetze eine frei beschriebene fremde Welt (ein Three.js-Projekt, eine Engine,",
            "ein Repo, ein Browser-Spiel) in ein Portal-Manifest, damit AnazhRealm sie in seine",
            "Bibliothek aufnehmen kann.",
            "",
            "Antworte mit GENAU EINEM JSON-Objekt — kein weiterer Text, kein say-Feld, kein",
            "program-Array, keine Erklärung. Genau diese vier Felder:",
            '{ "id": "<slug>", "label": "<Titel>", "desc": "<Text>", "dsl": ["wort", "..."] }',
            "",
            "  id    — nur a-z 0-9 - _, 1-40 Zeichen, aus dem Welt-Namen abgeleitet.",
            "  label — kurzer menschenlesbarer Name.",
            "  desc  — 1-2 Sätze, was die Welt ist (höchstens ~200 Zeichen).",
            "  dsl   — DSL-Vokabular: die Befehle, die die Welt sinnvoll verstehen würde,",
            "          abgeleitet aus ihren Mechaniken (Wetter -> set_weather, Voxel ->",
            "          place_block, Fluid -> inject_fluid, Terrain -> set_terrain_seed).",
            "          Jedes Wort ausschliesslich Kleinbuchstaben und Unterstriche.",
            "",
            "Gib KEINEN world-Pfad an — die Engine-Dateien werden separat vendort.",
            "Vermeide die ids fluid, terrain und skeleton (schon vergeben).",
            "Ist die Beschreibung knapp, rate trotzdem ein stimmiges Manifest.",
        ].join("\n");
    }

    // Manifest aus der rohen LLM-Antwort: <think>-Reasoning + Markdown-Fences entfernen, das erste {…} per
    // JSON.parse lesen (nie eval/Function). Objekt oder null, kein Wurf; spiegelt llmParseResponse.
    _parseManifestResponse(raw) {
        if (typeof raw !== "string" || !raw.trim()) return null;
        let text = raw.trim();
        text = text.replace(/<think(?:ing)?>[\s\S]*?<\/think(?:ing)?>/gi, "").trim();
        const fence = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (fence) text = fence[1].trim();
        const objMatch = text.match(/\{[\s\S]*\}/);
        if (!objMatch) return null;
        try {
            const obj = JSON.parse(objMatch[0]);
            return obj && typeof obj === "object" && !Array.isArray(obj) ? obj : null;
        } catch {
            return null;
        }
    }

    // Frei beschriebene Welt → Portal-Manifest über llmCall (derselbe Transport wie Welt-Grok + Persona),
    // gesäubert per _sanitizeImportedManifest. Liefert nur eine VORSCHAU ({ok, manifest});
    // erst acceptTranslatedManifest trägt sie in die Bibliothek.
    async translateWorldManifest(description) {
        const desc = String(description || "").trim();
        if (desc.length < 12) return { ok: false, reason: "description_too_short" };
        if (desc.length > 4000) return { ok: false, reason: "description_too_long" };
        const parsed = await this.llmCall(desc, this._buildTranslatorPrompt());
        // Ein reiner llmCall-Fehler (kein API-Key, LLM aus, HTTP-Fehler) hat
        // kein raw — direkt durchreichen. Kam eine Antwort, trägt sie raw.
        if (parsed && parsed.error && !parsed.raw) return { ok: false, reason: parsed.error };
        const obj = this._parseManifestResponse((parsed && parsed.raw) || "");
        if (!obj) return { ok: false, reason: "no_manifest_in_response" };
        const clean = this._sanitizeImportedManifest(obj);
        if (!clean) {
            const rawId = typeof obj.id === "string" ? obj.id.trim().toLowerCase() : "";
            if (rawId && AnazhRealm.WORLD_REGISTRY[rawId]) return { ok: false, reason: "id_is_builtin" };
            return { ok: false, reason: "invalid_manifest" };
        }
        return { ok: true, manifest: clean };
    }

    // Übersetztes (ggf. nachjustiertes) Manifest aufnehmen, markiert `translated` + `reachable:false` —
    // ohne Körper ist die Welt browsbar, nicht betretbar (kein totes Portal versprechen).
    acceptTranslatedManifest(manifest) {
        const src = manifest && typeof manifest === "object" ? manifest : {};
        const clean = this._sanitizeImportedManifest(
            Object.assign({}, src, { translated: true, translatedAt: Date.now(), reachable: false })
        );
        if (!clean) {
            const rawId = typeof src.id === "string" ? src.id.trim().toLowerCase() : "";
            if (rawId && AnazhRealm.WORLD_REGISTRY[rawId]) return { ok: false, reason: "id_is_builtin" };
            return { ok: false, reason: "invalid_manifest" };
        }
        if (!this.state.customWorlds) this.state.customWorlds = {};
        this.state.customWorlds[clean.id] = clean;
        this._saveCustomWorlds();
        this.journalAppend("growth", `Der KI-Übersetzer trug eine Welt in deine Bibliothek: „${clean.label}".`, {
            world: clean.id,
        });
        return { ok: true, id: clean.id, label: clean.label };
    }

    // ### KI-Übersetzer: die Welt bekommt einen Körper ###
    // Der LLM übersetzt die Welt in eine deklarative SZENE (Daten, kein Code); der generische Renderer in
    // worlds/translated/ baut jede solche Szene. NIE läuft LLM-Code — nur eine gedeckelte Szene wird
    // gerendert.

    // Säubert eine LLM-Szene auf eine IMMER renderbare Form: Farben strikt #rrggbb, Zahlen geclampt,
    // Listen gedeckelt, Aufzählungen gegen Whitelist, fehlende Felder → Default. Die Sicherheits-Wand: der
    // LLM kann per Konstruktion nur eine harmlose Szene liefern.
    _sanitizeWorldScene(raw) {
        const src = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
        const hex = (v, fallback) => {
            const m = /^#?([0-9a-fA-F]{6})$/.exec(String(v == null ? "" : v).trim());
            return m ? "#" + m[1].toLowerCase() : fallback;
        };
        const num = (v, lo, hi, fb) => {
            const n = Number(v);
            return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : fb;
        };
        const SHAPES = ["box", "sphere", "cone", "cylinder", "torus", "octahedron"];
        const GROUND = ["flat", "hills", "water", "void"];
        const AMBIENT = ["none", "snow", "embers", "motes", "rain"];
        const sky = src.sky && typeof src.sky === "object" ? src.sky : {};
        const ground = src.ground && typeof src.ground === "object" ? src.ground : {};
        const light = src.light && typeof src.light === "object" ? src.light : {};
        const ambient = src.ambient && typeof src.ambient === "object" ? src.ambient : {};
        const objects = [];
        if (Array.isArray(src.objects)) {
            for (const o of src.objects) {
                if (!o || typeof o !== "object") continue;
                objects.push({
                    shape: SHAPES.includes(o.shape) ? o.shape : "box",
                    color: hex(o.color, "#8a6a3a"),
                    count: Math.round(num(o.count, 1, 140, 12)),
                    area: num(o.area, 3, 130, 40),
                    size: num(o.size, 0.2, 14, 2),
                    height: num(o.height, -25, 45, 0),
                    spin: o.spin === true,
                    float: o.float === true,
                });
                if (objects.length >= 14) break;
            }
        }
        const dslEffects = {};
        if (src.dslEffects && typeof src.dslEffects === "object") {
            let n = 0;
            for (const op of Object.keys(src.dslEffects)) {
                if (!/^[a-z_]{1,40}$/.test(op)) continue;
                const e = src.dslEffects[op];
                if (!e || typeof e !== "object") continue;
                const eff = {
                    fogShift: num(e.fogShift, -1, 1, 0),
                    lightShift: num(e.lightShift, -1, 1, 0),
                    burst: Math.round(num(e.burst, 0, 50, 0)),
                };
                const skyHex = hex(e.sky, null);
                if (skyHex) eff.sky = skyHex;
                dslEffects[op] = eff;
                if (++n >= 32) break;
            }
        }
        return {
            sky: { top: hex(sky.top, "#2a3a6a"), bottom: hex(sky.bottom, "#c8b88a") },
            fog: hex(src.fog, "#9aa6c0"),
            ground: {
                color: hex(ground.color, "#3a6a3a"),
                style: GROUND.includes(ground.style) ? ground.style : "flat",
            },
            light: { color: hex(light.color, "#ffe9c8"), intensity: num(light.intensity, 0, 2, 1) },
            objects,
            ambient: {
                kind: AMBIENT.includes(ambient.kind) ? ambient.kind : "motes",
                color: hex(ambient.color, "#ffffff"),
            },
            dslEffects,
        };
    }

    // Der System-Prompt des Szenen-Übersetzers — er weist das LLM an, eine
    // Welt in eine deklarative Szene zu übersetzen (Daten, kein Code).
    _buildSceneTranslatorPrompt() {
        return [
            "Du baust für AnazhRealm die SZENE einer fremden Welt — eine deklarative",
            "Beschreibung, die der generische 3D-Renderer der Bibliothek aufbaut. Das",
            "Manifest (Identität + Vokabular) steht schon; jetzt gib der Welt einen Körper.",
            "",
            "Antworte mit GENAU EINEM JSON-Objekt — kein weiterer Text, keine Erklärung:",
            "{",
            '  "sky":    { "top": "#rrggbb", "bottom": "#rrggbb" },',
            '  "fog":    "#rrggbb",',
            '  "ground": { "color": "#rrggbb", "style": "flat" | "hills" | "water" | "void" },',
            '  "light":  { "color": "#rrggbb", "intensity": 0.0-2.0 },',
            '  "objects": [',
            '    { "shape": "box"|"sphere"|"cone"|"cylinder"|"torus"|"octahedron",',
            '      "color": "#rrggbb", "count": 1-140, "area": 3-130, "size": 0.2-14,',
            '      "height": -25..45, "spin": true|false, "float": true|false }',
            "  ],",
            '  "ambient": { "kind": "none"|"snow"|"embers"|"motes"|"rain", "color": "#rrggbb" },',
            '  "dslEffects": { "<wort>": { "sky": "#rrggbb", "fogShift": -1..1, "lightShift": -1..1, "burst": 0-50 } }',
            "}",
            "",
            "Waehle Farben + Formen, die die beschriebene Welt einfangen — eine Lava-Welt",
            "glueht rot, eine Eis-Welt schimmert blau-weiss, ein Wald ist gruen + dicht.",
            "objects sind verstreute Form-Gruppen (count Stueck, im Radius area um die",
            "Mitte). dslEffects gibt jedem Wort aus dem Vokabular eine sichtbare Wirkung",
            "(sky faerbt den Himmel, fogShift verdichtet/lichtet den Nebel, lightShift",
            "hellt auf/ab, burst wirft Partikel aus). Alle Farben strikt #rrggbb.",
        ].join("\n");
    }

    // KI-Übersetzer Phase 2 — eine übersetzte Welt in eine deklarative Szene
    // übersetzen. Ruft das LLM über llmCall (derselbe Transport), liest die
    // Szene per _parseManifestResponse, säubert sie per _sanitizeWorldScene.
    async translateWorldScene(world) {
        const w = world && typeof world === "object" ? world : {};
        const desc = [
            `Welt: ${w.label || w.id || "unbenannt"}`,
            w.desc ? `Beschreibung: ${w.desc}` : "",
            Array.isArray(w.dsl) && w.dsl.length ? `Vokabular: ${w.dsl.join(", ")}` : "",
        ]
            .filter(Boolean)
            .join("\n");
        if (desc.length < 6) return { ok: false, reason: "world_too_thin" };
        const parsed = await this.llmCall(desc, this._buildSceneTranslatorPrompt());
        if (parsed && parsed.error && !parsed.raw) return { ok: false, reason: parsed.error };
        const obj = this._parseManifestResponse((parsed && parsed.raw) || "");
        if (!obj) return { ok: false, reason: "no_scene_in_response" };
        return { ok: true, scene: this._sanitizeWorldScene(obj) };
    }

    // Einer übersetzten Welt einen Körper geben: Szene generieren, an die customWorlds-Welt heften,
    // betretbar machen (world → der generische Renderer, reachable:true).
    async buildTranslatedWorld(worldId) {
        const key = String(worldId || "")
            .trim()
            .toLowerCase();
        const w = this.state.customWorlds && this.state.customWorlds[key];
        if (!w) return { ok: false, reason: "world_unknown" };
        if (!w.translated) return { ok: false, reason: "not_translated" };
        const res = await this.translateWorldScene(w);
        if (!res.ok) return res;
        w.scene = res.scene;
        w.world = AnazhRealm.PORTAL_TRANSLATED_WORLD;
        w.reachable = true;
        this._saveCustomWorlds();
        this.journalAppend("growth", `Der KI-Übersetzer gab „${w.label}" einen Körper — die Welt ist nun betretbar.`, {
            world: w.id,
        });
        return { ok: true, id: w.id, label: w.label };
    }

    // ### Auto-Vendor-Pfad ###
    // Ein fremdes Welt-Bündel dockt ohne Handarbeit an: der save-server schreibt die Dateien nach
    // worlds/<id>/, die Welt wird ein customWorlds-Eintrag mit trust:"sandboxed" (null-origin).
    // Beim Vendoren läuft NIE fremder Code — nur Dateien werden geschrieben bzw. sandgesichert geladen.

    // Bündel-Dateipfad gesäubert — oder null, wenn er aus worlds/<id>/ ausbrechen könnte ("..", führender
    // Slash, Backslash, Doppelpunkt). Freundliche Vorab-Prüfung; die Wand ist vendorSafeRelPath in
    // save-server.js.
    _vendorSafeRelPath(p) {
        if (typeof p !== "string" || !p || p.length > 200) return null;
        if (p.includes("\0") || p.includes("\\") || p.includes(":")) return null;
        const out = [];
        for (const seg of p.replace(/^\/+/, "").split("/")) {
            if (seg === "" || seg === ".") continue;
            if (seg === "..") return null;
            out.push(seg);
        }
        return out.length ? out.join("/") : null;
    }

    // UTF-8-Byte-Länge eines Strings (TextEncoder ist ein Browser-Global,
    // in der ESLint-Config seit V8.54 freigegeben).
    _vendorByteLength(str) {
        return new TextEncoder().encode(String(str == null ? "" : str)).length;
    }

    // Welt-Bündel clientseitig vorprüfen (rein, kein Netz): {ok, worldId, files} | {ok:false, reason}.
    // Der Server prüft maßgeblich nochmal; dies nennt den Grund schon vor dem POST.
    _vendorSanitizeBundle(worldId, files) {
        const id = String(worldId || "")
            .trim()
            .toLowerCase();
        if (!/^[a-z0-9_-]{1,40}$/.test(id)) return { ok: false, reason: "invalid_world_id" };
        // Built-in-Welt-Verzeichnisse dürfen nicht überschrieben werden —
        // die WORLD_REGISTRY-Welten plus der translated-Renderer.
        const reserved = Object.keys(AnazhRealm.WORLD_REGISTRY).concat(["translated"]);
        if (reserved.indexOf(id) >= 0) return { ok: false, reason: "reserved_world_id" };
        if (!Array.isArray(files) || files.length === 0) return { ok: false, reason: "no_files" };
        const lim = AnazhRealm.VENDOR_LIMITS;
        if (files.length > lim.maxFiles) return { ok: false, reason: "too_many_files" };
        const clean = [];
        let total = 0;
        let hasIndex = false;
        for (const f of files) {
            if (!f || typeof f !== "object" || typeof f.content !== "string") {
                return { ok: false, reason: "bad_file_entry" };
            }
            const rel = this._vendorSafeRelPath(f.path);
            if (!rel) return { ok: false, reason: "bad_file_path" };
            const ext = (rel.split(".").pop() || "").toLowerCase();
            if (lim.allowedExt.indexOf(ext) < 0) return { ok: false, reason: "bad_file_ext" };
            const bytes = this._vendorByteLength(f.content);
            if (bytes > lim.maxFileBytes) return { ok: false, reason: "file_too_large" };
            total += bytes;
            if (total > lim.maxTotalBytes) return { ok: false, reason: "bundle_too_large" };
            if (rel === "index.html") hasIndex = true;
            clean.push({ path: rel, content: f.content });
        }
        // Ein Portal lädt worlds/<id>/index.html — ohne index.html im Wurzel
        // gäbe es kein Tor (W14-P3-Disziplin: nichts versprechen, was nicht da ist).
        if (!hasIndex) return { ok: false, reason: "no_index_html" };
        return { ok: true, worldId: id, files: clean };
    }

    // W15 — der POST an den save-server-Vendor-Endpunkt. Der EINZIGE
    // Netz-Schritt; ein Netzfehler heißt, dass der save-server nicht läuft
    // (Vendoring braucht die lokale Dev-Umgebung).
    async _vendorPostJson(payload) {
        try {
            const res = await fetch("http://localhost:4312/api/vendor-world", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            let data = null;
            try {
                data = await res.json();
            } catch {
                data = null;
            }
            if (!res.ok) return { ok: false, reason: (data && data.error) || `HTTP ${res.status}` };
            return {
                ok: true,
                fileCount: data && data.fileCount,
                totalBytes: data && data.totalBytes,
                branch: data && data.branch,
                // W16 Phase 2 — der save-server liefert den Content-Hash der
                // geschriebenen Welt (er ist die Hash-Autorität).
                bundleHash: data && data.bundleHash,
            };
        } catch {
            return { ok: false, reason: "save_server_unreachable" };
        }
    }

    // Phase 1 — ein hochgeladenes Bündel POSTen. Im Playtest gestubbt (wie llmCall).
    async _vendorPostBundle(worldId, files) {
        return this._vendorPostJson({ worldId, files });
    }

    // Phase 2 — eine Repo-URL POSTen; der save-server holt die Dateien selbst.
    async _vendorPostRepo(worldId, repoUrl) {
        return this._vendorPostJson({ worldId, repoUrl });
    }

    // Vendorte Welt als customWorlds-Eintrag registrieren — BEIDE Pfade (lokales Bündel + GitHub-Fetch)
    // enden hier. trust:"sandboxed" + vendored:true; _sanitizeImportedManifest erzwingt die Sandbox.
    _vendorRegisterWorld(worldId, meta) {
        const m = meta && typeof meta === "object" ? meta : {};
        const entry = this._sanitizeImportedManifest({
            id: worldId,
            label: typeof m.label === "string" && m.label.trim() ? m.label : worldId,
            desc: typeof m.desc === "string" ? m.desc : "",
            world: `worlds/${worldId}/index.html`,
            dsl: Array.isArray(m.dsl) ? m.dsl : [],
            trust: "sandboxed",
            reachable: true,
            vendored: true,
            vendoredAt: Date.now(),
            // W16 Phase 2 — der save-server lieferte den Content-Hash beim
            // Schreiben (BEIDE Vendor-Pfade reichen posted.bundleHash herein).
            bundleHash: typeof m.bundleHash === "string" ? m.bundleHash : "",
            // W17 — eine Multiplayer-Welt deklariert sich mehrspielerfähig:
            // ihr geholtes Portal lädt mit dem Transport-Shim + broadcastet
            // beim Betreten eine Gruppen-Portal-Einladung (W17 Phase C).
            multiplayer: m.multiplayer === true,
            // W18-B — die Ko-Präsenz-Marke: ihr geholtes Portal injiziert
            // die Pose-Schicht (das Mesh wird ihre Multiplayer-Schicht).
            coPresence: m.coPresence === true,
            // W17 P-Vendor — der Server-Modus: js-compute → das geholte Portal
            // wird ein Compute-Host-Portal (V8.79), nicht blosser Relay.
            serverMode: m.serverMode === "js-compute" ? "js-compute" : "relay",
        });
        if (!entry) return { ok: false, reason: "invalid_manifest" };
        if (!this.state.customWorlds) this.state.customWorlds = {};
        this.state.customWorlds[entry.id] = entry;
        this._saveCustomWorlds();
        this.journalAppend("growth", `Eine fremde Welt dockte an deine Bibliothek an: „${entry.label}".`, {
            world: entry.id,
        });
        // Die Bibliothek wuchs: Welt-Katalog neu annoncieren (self-guarded — _p2pBroadcastSoul ruht ohne Mesh)
        // und den eigenen Katalog-Drawer auffrischen, damit Mitspieler die neue Welt als „✓ vorhanden" sehen.
        this._p2pBroadcastSoul();
        this._renderMeshWorldCatalog();
        return { ok: true, id: entry.id, label: entry.label };
    }

    // Lokales Welt-Bündel andocken: prüfen → save-server schreibt nach worlds/<id>/ → customWorlds-Eintrag
    // (trust:"sandboxed"), browsbar UND betretbar. Liefert {ok, id, label} | {ok:false, reason}.
    // Die POST-Antwort {ok:true} beweist das Schreiben — kein fetch-Probe nötig (anders als beim Import).
    async vendorWorldBundle(opts) {
        const o = opts && typeof opts === "object" ? opts : {};
        const san = this._vendorSanitizeBundle(o.worldId, o.files);
        if (!san.ok) return san;
        const posted = await this._vendorPostBundle(san.worldId, san.files);
        if (!posted.ok) return posted;
        const reg = this._vendorRegisterWorld(san.worldId, {
            label: o.label,
            desc: o.desc,
            dsl: o.dsl,
            bundleHash: posted.bundleHash,
            multiplayer: o.multiplayer === true,
            coPresence: o.coPresence === true,
            serverMode: o.serverMode === "js-compute" ? "js-compute" : "relay",
        });
        if (!reg.ok) return reg;
        // W16-Politur — den save-server-Content-Hash mit durchreichen, damit
        // der Mesh-Empfänger das Bündel gegen den Katalog-Hash prüfen kann.
        return {
            ok: true,
            id: reg.id,
            label: reg.label,
            fileCount: posted.fileCount || san.files.length,
            bundleHash: typeof posted.bundleHash === "string" ? posted.bundleHash : "",
        };
    }

    // GitHub-Fetch: der save-server holt die Dateien einer github.com-Repo-URL selbst (Trees-API + Raw-
    // Fetch) nach worlds/<id>/; Schreib-Seite + Registrierung wie beim Bündel-Pfad. Async (Netz).
    async vendorWorldFromRepo(opts) {
        const o = opts && typeof opts === "object" ? opts : {};
        const id = String(o.worldId || "")
            .trim()
            .toLowerCase();
        if (!/^[a-z0-9_-]{1,40}$/.test(id)) return { ok: false, reason: "invalid_world_id" };
        const reserved = Object.keys(AnazhRealm.WORLD_REGISTRY).concat(["translated"]);
        if (reserved.indexOf(id) >= 0) return { ok: false, reason: "reserved_world_id" };
        const repoUrl = String(o.repoUrl || "").trim();
        // Freundliche Vorab-Prüfung — der save-server parst die URL maßgeblich.
        if (!/^https?:\/\/(www\.)?github\.com\/[^/\s]+\/[^/\s]+/i.test(repoUrl)) {
            return { ok: false, reason: "not_a_github_url" };
        }
        const posted = await this._vendorPostRepo(id, repoUrl);
        if (!posted.ok) return posted;
        const reg = this._vendorRegisterWorld(id, {
            label: o.label,
            desc: o.desc,
            dsl: o.dsl,
            bundleHash: posted.bundleHash,
            multiplayer: o.multiplayer === true,
            coPresence: o.coPresence === true,
            serverMode: o.serverMode === "js-compute" ? "js-compute" : "relay",
        });
        if (!reg.ok) return reg;
        return { ok: true, id: reg.id, label: reg.label, fileCount: posted.fileCount, branch: posted.branch };
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_speicher_welten]);

// ===== ATLAS · Speicher/welten — Außen-Konstanten =====
// R5-Struktur-Textur: Boost auf das micro-Gewicht der WERK-Profile (Bauwerke, Deko, Kreaturen,
// Avatare) — Strukturen tragen mehr Mikro-Tiefe als das Terrain. LIVE-Quelle ist
// `state.atmoUniforms.r5StructureBoost` (setStructureBoost); `microBoost` ist Default + Fallback.
AnazhRealm.R5_STRUCTURE_TEXTURE = Object.freeze({
    // Multiplier auf das micro-Gewicht im werk-Profil. 1.0 = neutraler
    // Default; >1 verstärkt Mikro-Tiefe in Bauten; <1 dämpft sie. Range
    // [0.5, 2.0] sinnvoll; der Slider erlaubt [0.5, 2.5].
    microBoost: 1.3,
});
// DIE WELTGRENZE: was beim Wechsel der Welt aus der alten reist — beim Namen, sonst nichts (gate:weltgrenze).
//   geburt       die Wahl des Schöpfers, die eine neue Welt erbt (`_buildEmptyWorldSnapshot`)
//   platz        der Speicher-Platz der Seite, nur in die Lücken einer geladenen Welt (`_weltMetaWechsel`)
//   gedaechtnis  die Gedächtnisse der Seite, die welt-eigene Felder spiegeln (Erbgut, Anker, Ring, Vorschau, Dorf-Zug, der
//                Plan v2 je Ort samt Höhen und Erdbau (`_ortPlaene`),
//                die Lichter: das wache Tor, der Licht-Pool, der die Plätze hält) —
//                sie fallen mit dem worldMeta (`_loadStateRestoreWorldMeta`)
AnazhRealm.WELT_GRENZE = Object.freeze({
    geburt: Object.freeze(["visibility", "creator"]),
    platz: Object.freeze(["worldId", "slug", "bornAt"]),
    gedaechtnis: Object.freeze([
        "_erbgutCache",
        "_genesisRingFertig",
        "_portalPreviewFertig",
        "_portalPreviewAwaiting",
        "_autoSettlementQueue",
        "_autoSettlementRejected",
        "_autoSettlementStartHopeless",
        "_stlWegeKeys",
        "_ortPlaene",
        "_portalLeuchte",
        "_leuchtPool",
    ]),
});
// must-preserve (taille-spec §2): Größen-Wand für unbekannte Felder (ein Riesen-Feld ist ein
// Quota-DoS) + die known-Sätze der Serialize/Restore-Zwillinge; was hier NICHT steht, reist als
// opakes Unbekanntes (_carryUnknown).
AnazhRealm.TAILLE_UNKNOWN_FIELD_MAX = 8192;
AnazhRealm.BLUEPRINT_KNOWN_KEYS = Object.freeze([
    "name",
    "label",
    "builtIn",
    "parts",
    "connections",
    "role",
    "roleClaimed",
    "roleManual",
    "toolMeta",
    "portalMeta",
    "forgedPrecision",
    "signature",
    "authorPubKey",
    "signedHash",
    "signedAt",
    "signatureStatus",
    "provenance",
    // wear ist BEKANNT: _serializeBlueprint entscheidet selbst (wear < 1 reist, === 1 entfällt) — sonst
    // reichte _carryUnknown wear=1 blind durch.
    "wear",
    // PRÄGUNG-WELT — der Guss-Stempel (studioOv) ist BEKANNTES System-Feld:
    // der Serialize/Restore-Zwilling behandelt ihn explizit (Taille-Wand),
    // _carryUnknown darf ihn nie blind doppelt tragen.
    "studioOv",
]);
AnazhRealm.MATERIAL_KNOWN_KEYS = Object.freeze(["name", "label", "builtIn", "color", "tags"]);
AnazhRealm.TOOL_KNOWN_KEYS = Object.freeze([
    "name",
    "label",
    "builtIn",
    "isStarter",
    "opClass",
    "opName",
    "precisionCap",
    "sourceBlueprint",
    "domain",
]);
AnazhRealm.MANIFEST_KNOWN_KEYS = Object.freeze([
    "schemaVersion",
    "id",
    "label",
    "world",
    "dsl",
    "desc",
    "reachable",
    "importedAt",
    "trust",
    "authorPubKey",
    "signature",
    "signedHash",
    "signedAt",
    "provenance",
    "translated",
    "translatedAt",
    "scene",
    "vendored",
    "vendoredAt",
    "bundleHash",
    "serverMode",
    "multiplayer",
    // W18-B — die Ko-Präsenz-Deklaration (additives Minor-Wachstum, Ω6:
    // alte Builds bewahren sie als Unbekanntes, neue erkennen sie).
    "coPresence",
]);
// KI-Übersetzer Phase 2 — der generische Renderer, der eine deklarative
// Szene aufbaut. Jede aufgebaute übersetzte Welt zeigt hierauf; ihre
// individuelle Szene reist im enter-Handshake (po.translatedWorldId).
AnazhRealm.PORTAL_TRANSLATED_WORLD = "worlds/translated/index.html";

// Die Welt-Registry: die EINE Quelle, welche Sub-Welten es gibt, je mit Pfad + DSL-Manifest (welche
// Wörter die Welt versteht) + Kurzbeschreibung (Bibliothek-Tab). Built-in-Portale beziehen ihr
// portalMeta hieraus; aimBlueprintAtWorld richtet eigene Magie-Ringe auf einen Eintrag.
AnazhRealm.WORLD_REGISTRY = Object.freeze({
    skeleton: Object.freeze({
        id: "skeleton",
        label: "Skelett-Welt",
        world: AnazhRealm.PORTAL_SKELETON_WORLD,
        dsl: Object.freeze(["skybox_color"]),
        desc: "Die ätherische Leere, an der das Portal-Protokoll geboren wurde — ein pulsierender Tor-Ring im Void.",
    }),
    fluid: Object.freeze({
        id: "fluid",
        label: "Strom-Welt",
        world: "worlds/fluid/index.html",
        dsl: Object.freeze(["weather", "skybox_color", "sturm", "ruhe", "set_turbulence"]),
        desc: "Ein Stable-Fluids-Solver: Tinte strömt, Stürme wirbeln. Eine fremde Engine mit eigener Three.js.",
    }),
    terrain: Object.freeze({
        id: "terrain",
        label: "Phytogenesis & Lithos",
        world: "worlds/terrain/index.html",
        // Das Morphologie-Labor (phytogenesis). Die id "terrain" bleibt — load-bearing für
        // Saves/Bauplan/Tests (stabile Identität, variable Gestalt). DSL: Presets + wald/neu +
        // Wetter/Jahreszeit/Tageszeit (den Himmel führt dort das Tag/Nacht-System).
        dsl: Object.freeze([
            "eiche",
            "fichte",
            "birke",
            "weide",
            "mammut",
            "tanne",
            "strauch",
            "blume",
            "gras",
            "findling",
            "basalt",
            "sediment",
            "zacken",
            "geroell",
            "kristalle",
            "wald",
            "neu",
            "klar",
            "bewoelkt",
            "nebel",
            "sturm",
            "fruehling",
            "sommer",
            "herbst",
            "winter",
            "tag",
            "nacht",
        ]),
        desc: "Das Morphologie-Labor: Bäume, Blumen und Felsen wachsen aus Gesetzen — mit begehbarem Wald, Tag/Nacht, Wetter und Jahreszeiten.",
    }),
    // Das FAHRZEUG-Labor (Rahmen · Gelenke · Lehren · Baukörper · Haut + Probefahrt), dasselbe
    // Vorlagen-Organ wie phytogenesis. DSL = die echten UI-Pfade: Gattungs-Presets + Kultur-Vektoren +
    // probefahrt/werkstatt (Fahr-Modus rein/raus).
    garage: Object.freeze({
        id: "garage",
        label: "Anatomie · Fahrzeug",
        world: "worlds/garage/index.html",
        dsl: Object.freeze([
            "gt",
            "supersport",
            "limousine",
            "kompakt-fwd",
            "suv",
            "cavallo",
            "toro",
            "stern",
            "vorsprung",
            "monolith",
            "probefahrt",
            "werkstatt",
        ]),
        desc: "Das Fahrzeug-Labor: Skelett, Soll-Maße und Lehren urteilen die Karosserie — fünf Gattungen, fünf Kulturen, fahrbare Probefahrt mit Reifenspuren.",
    }),
    // Das TOR-Labor: sieben Ordnungen (Drachentor bis Maurentor), Stich→Schub→Dicke-Lehre, fraktale
    // Tiefe, begehbare Türen (E/R).
    portale: Object.freeze({
        id: "portale",
        label: "Porta — Ordnungen & fraktale Tiefe",
        world: "worlds/portale/index.html",
        dsl: Object.freeze([
            "drachentor",
            "kathedrale",
            "maschine",
            "geisttor",
            "verkalkt",
            "ruine",
            "maurentor",
            "zufall",
        ]),
        desc: "Das Tor-Labor: sieben Portal-Ordnungen aus der Stich-Schub-Dicke-Lehre, fraktal vertieft, mit öffnenden Türen.",
    }),
    // Das KLINGEN-Labor: 21 Gattungen (Waffen + Werkzeuge), 4 Traditionen, Anschlag-Probe + Prüfstand.
    // schmiede-core.js (__schmiedeCore) ist die EINE generative Quelle für Shell UND Foundry. DSL = echte
    // UI-Pfade: Gattungen + Traditionen (Umlaute ASCII-gefaltet: saebel/grossschwert/faellaxt) +
    // anschlagen + stahl.
    schmiede: Object.freeze({
        id: "schmiede",
        label: "Anatomie · Klinge",
        world: "worlds/schmiede/index.html",
        dsl: Object.freeze([
            "langschwert",
            "saebel",
            "degen",
            "grossschwert",
            "dolch",
            "messer",
            "langbogen",
            "kriegsbogen",
            "reiterbogen",
            "recurvebogen",
            "streitkolben",
            "kriegsaxt",
            "kriegshammer",
            "keule",
            "faellaxt",
            "spaltmaul",
            "vorschlaghammer",
            "beil",
            "spitzhacke",
            "spaten",
            "schaufel",
            "frank",
            "nihon",
            "pars",
            "urvolk",
            "anschlagen",
            "stahl",
        ]),
        desc: "Das Klingen-Labor: Rückgrat, Schnittprofil und Lehren urteilen die Waffe — 21 Gattungen, 4 Traditionen, Anschlag-Probe und Prüfstand.",
    }),
    // Das HAUS-Labor: Fachwerkhaus, parametrisch + begehbar — 32 Kultur-Archetypen, Dorf-Modus
    // (Straßengraph, Mauer, Jahresringe). fachwerk-core.js (__fachwerkCore) ist die EINE generative
    // Quelle für Shell UND Foundry, inkl. Dorf-Quelle + exportSettlement. DSL = echte UI-Pfade: die 32
    // Kulturen über #pK (change) + "dorf"/"haus" über #pDorf.
    fachwerk: Object.freeze({
        id: "fachwerk",
        label: "Fachwerkhaus — parametrisch, begehbar",
        world: "worlds/fachwerk/index.html",
        dsl: Object.freeze([
            "alemannisch",
            "fraenkisch",
            "niedersaechsisch",
            "mittelalterlich",
            "holzhuette",
            "franzoesisch",
            "italienisch",
            "modern",
            "volle_moderne",
            "hochhaus",
            "roemisch",
            "tudor",
            "alpenchalet",
            "hollaendisch",
            "hanseatisch",
            "georgian",
            "viktorianisch",
            "griechisch",
            "spanisch",
            "andalusisch",
            "provenzalisch",
            "pueblo",
            "marokkanisch",
            "skandinavisch",
            "norwegisch",
            "russisch",
            "schwarzwald",
            "japanisch",
            "gotisch",
            "barock",
            "renaissance",
            "chinesisch",
            "dorf",
            "haus",
        ]),
        desc: "Das Haus-Labor: parametrisches Fachwerk, tragwerk-ehrlich und begehbar — 32 Kulturen, Dorf-Modus mit gewachsenen Siedlungen.",
    }),
    // Das MUSIK-Labor: 22 Genre-Presets aus Kompositions-Gesetzen + sechs DNA-Dials. klang-core.js
    // (__klangCore, meshfrei) ist die EINE Musik-Daten-Quelle (das Host-Lofi liest Tempo + Skala,
    // KLANG_HOST_RECIPE). DSL = die Genre-Buttons (#presets .presetBtn → applyPreset; Wörter =
    // lowercase-Lab-Namen; die Buch-id-Ausnahmen modern-klang/barock-klang gelten nur dem Buch).
    klang: Object.freeze({
        id: "klang",
        label: "Genesis — Generatives Musiksystem",
        world: "worlds/klang/index.html",
        dsl: Object.freeze([
            "blues",
            "bebop",
            "cooljazz",
            "freejazz",
            "boombap",
            "trap",
            "techno",
            "dnb",
            "reggae",
            "ambient",
            "barock",
            "minimal",
            "lofi",
            "modern",
            "bossa",
            "vibes",
            "funk",
            "latin",
            "dub",
            "synthwave",
            "cinematic",
            "rock",
        ]),
        desc: "Das Klang-Labor: 22 Genres aus Kompositions-Gesetzen und DNA-Dials — dieselbe Quelle, aus der das Host-Lofi Tempo und Skala liest.",
    }),
    // Das MENSCHEN-Labor: Morph-Dials · Haar/Kleidung · acht Bewegungs-/Emotionsprofile · Ninja-Park.
    // koerper-core.js (__koerperCore, meshfrei) ist die EINE Gestalt-/Motion-Daten-Quelle.
    // DSL = #emotions-Buttons (data-e → emo.set) + zufall/zuruecksetzen (btnRandom/btnReset).
    koerperstudio: Object.freeze({
        id: "koerperstudio",
        label: "Da Vinci Studio — Lebendiger Mensch",
        world: "worlds/koerperstudio/index.html",
        dsl: Object.freeze([
            "entspannt",
            "freude",
            "trauer",
            "wut",
            "angst",
            "rennen",
            "kampf",
            "showcase",
            "zufall",
            "zuruecksetzen",
        ]),
        desc: "Das Menschen-Labor: der lebendige Körper aus Morph-Dials, Bewegungsprofilen und Ninja-Park — die Quelle der Avatar-Gestalt-Daten.",
    }),
    // Das KREATUREN-Labor: Wolf/Fuchs/Bär/Hirsch aus fünf allometrischen Dials, CPG-Gangnetz + sechs
    // Bewegungsprofile. tetrapoda-core.js (__tetrapodaCore, meshfrei) ist die EINE Gestalt-/Motion-
    // Quelle (Erstkonsument `_motionStudioProfile`). DSL = Gattungs-Buttons (#presets, data-p) +
    // Profil-Buttons (#emotions, data-e); Wörter deutsch, ASCII-gefaltet (baer).
    tetrapoda: Object.freeze({
        id: "tetrapoda",
        label: "Tetrapoda — Evolution Lab",
        world: "worlds/tetrapoda/index.html",
        dsl: Object.freeze([
            "wolf",
            "fuchs",
            "baer",
            "hirsch",
            "entspannt",
            "freude",
            "jagd",
            "flucht",
            "wachsam",
            "showcase",
        ]),
        desc: "Das Kreaturen-Labor: Vierbeiner aus allometrischen Gesetzen — Gattungs-Dials, CPG-Gang und Bewegungsprofile als Daten-Quelle.",
    }),
    // Die erste UNTRUSTED Welt: fremde 2D-Boids-Engine im null-origin-iframe. trust:"sandboxed" → das
    // Portal entzieht allow-same-origin: voller Lauf drinnen, null Reichweite raus.
    schwarm: Object.freeze({
        id: "schwarm",
        label: "Schwarm-Welt",
        world: "worlds/schwarm/index.html",
        dsl: Object.freeze(["sturm", "ruhe", "schwaermen", "skybox_color"]),
        desc: "Ein 2D-Schwarm aus hunderten Wesen — eine fremde Engine, die null-origin sandgesichert läuft, ohne AnazhRealm je zu berühren.",
        trust: "sandboxed",
    }),
    // Ko-Präsenz-Welt: eine fremde single-player-Engine, die das Ko-Präsenz-Protokoll deklariert
    // (peer-join/peer-state/peer-leave); das Mesh liefert die Posen der Gefährten, die Welt rendert sie
    // selbst. Null-origin sandgesichert (das Protokoll quert die volle Wand).
    begegnung: Object.freeze({
        id: "begegnung",
        label: "Begegnungs-Feld",
        world: "worlds/begegnung/index.html",
        dsl: Object.freeze([]),
        desc: "Ein stilles Lichter-Feld — eine fremde single-player Engine, in der ihr euch trotzdem seht: AnazhRealm injiziert die Ko-Präsenz übers Mesh.",
        trust: "sandboxed",
        coPresence: true,
    }),
});
