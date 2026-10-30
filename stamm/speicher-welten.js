class AnazhRealm_speicher_welten {
    // ===== ATLAS · Speicher/welten — Snapshot · IndexedDB · Welt-Index · Manifest · Serialisierung =====
    // ### Welt-Identität (Ring 8+ Vorbereitung) ###
    // DIE IDENTITÄT EINER WELT: eine neue worldId (UUID, ohne crypto ein Zufalls-Stempel). Leser: der Boot einer frischen
    // Welt, die Geburt, die Migration, daneben legen und die Tür `_weltBetreten` (eine Welt ohne Id bekommt ihre eigene,
    // nie den Platz der Welt davor). Die Fusion würfelt nicht: ihre Id ist eine Funktion der Eltern (`_fusionGenerateIdentity`).
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
            this.journalAppend("genesis", AnazhRealm._datum`Ich erwache als ${m.slug}.`, { worldId: m.worldId });
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
                this._aktivZeiger = m.worldId;
            } catch {
                // localStorage voll/blockiert: aktiver Welt-Zeiger bleibt aus,
                // nächster Reload startet wieder fresh. Kein Drama.
            }
        }
    }

    // ### Ring 8 — Multi-Welt-Verwaltung ###
    // localStorage: `anazhRealmWorlds` (Index) · `anazhRealmState_<worldId>` (Snapshot je Welt) ·
    // `anazhRealmActiveWorld` (aktive worldId); Legacy-Key `anazhRealmState` migriert einmalig.
    // Der Welt-Wechsel tauscht am Ort (`_weltWechsel`: die alte Welt geht ganz, `_weltAbschied`; die neue kommt an wie beim
    // Boot); was die Seite trägt, nennt `AnazhRealm.WELT_GRENZE`.

    worldStorageKey(worldId) {
        return `anazhRealmState_${worldId}`;
    }

    // gelesen ist gemerkt: der Boot liest den Zeiger, und schon der erste Stand des Takts in dieser Welt darf warten (`_standSichern`;
    // ungemerkt ging er je Boot synchron und voll an den Faden: speicher.K2 je Ruf p95 7 ms, Radeon)
    activeWorldGet() {
        try {
            return (this._aktivZeiger = localStorage.getItem("anazhRealmActiveWorld") || null);
        } catch {
            return null;
        }
    }

    // Der Zeiger bewegt sich nie vor der Platte: ein ausstehender Stand des Takts geht vorher an den Faden.
    activeWorldSet(worldId) {
        if (worldId !== this._aktivZeiger) this._standNachholen();
        try {
            if (worldId) localStorage.setItem("anazhRealmActiveWorld", worldId);
            else localStorage.removeItem("anazhRealmActiveWorld");
            this._aktivZeiger = worldId || null; // gemerkt: saveState fragt den localStorage nicht je Stand
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
    // dieses Platzes. Sie fragt DIESELBE Rettungs-Kette wie loadState (`_weltRettungsKette`: IndexedDB ⇄ Abbild → .bak) —
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
    // `id`: (1) IndexedDB, wenn ihr Stempel nicht älter ist als der des Platzes (die Tür und das Verlassen stempeln Platz und
    // IndexedDB gleich, der Index trägt lastPlayed; jeder Stand der lebenden Welt ist jünger); (2) sonst der Platz im
    // localStorage (eine Tür legte die Welt ab, oder IndexedDB fehlt); (3) sonst der .bak der Transaktion (ein Stand zurück).
    // Der localStorage schreibt verzögert (Chromium ≥ 5 s) — nach einem harten Tod ist er oft leer oder älter, IndexedDB nie halb. `idb` = {state, at, bak} des Boot-Vorlaufs oder null.
    // Liefert {state, quelle, befund} — state null nur, wenn alle leer oder unlesbar sind, der Befund nennt jedes Glied; jeder Stand
    // in der Form des Objekts (`_standNormal` beim Lesen: ein Bruch der kompakten Edits ist ein korruptes Glied).
    _weltRettungsKette(id, idb) {
        const befund = [];
        const lies = (roh, name) => {
            if (roh == null) {
                befund.push(`${name} leer`);
                return null;
            }
            try {
                const s = JSON.parse(roh);
                if (s && typeof s === "object") return this._standNormal(s);
                befund.push(`${name} unlesbar`);
            } catch (e) {
                befund.push(`${name} korrupt (${e.message})`);
            }
            return null;
        };
        let ls = null;
        try {
            ls = localStorage.getItem(this.worldStorageKey(id));
        } catch (e) {
            befund.push(`localStorage nicht lesbar (${e.message})`);
        }
        const eintrag = this.worldsIndexLoad().find((w) => w && w.worldId === id);
        const lsAt = eintrag && Number.isFinite(eintrag.lastPlayed) ? eintrag.lastPlayed : 0;
        if (idb && idb.state && (ls == null || idb.at >= lsAt))
            return { state: idb.state, quelle: "IndexedDB", befund };
        if (idb && !idb.state && idb.kaputt !== "leer") befund.push(`IndexedDB korrupt (${idb.kaputt})`);
        const platz = lies(ls, "Platz");
        if (platz) return { state: platz, quelle: "Platz", befund };
        if (idb && idb.state) return { state: idb.state, quelle: "IndexedDB", befund };
        if (idb && idb.bak && idb.bak.state) return { state: idb.bak.state, quelle: ".bak (ein Stand zurück)", befund };
        befund.push(idb ? `.bak ${idb.bak ? idb.bak.kaputt : "leer"}` : "IndexedDB leer");
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
    // übernehmen"). Wird vor dem Wechsel geschrieben — die Ankunft findet einen gültigen Per-Welt-Save.
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
            // Genesis-Eintrag gleich beim Anlegen mitschreiben (nach dem Wechsel setzt ensureWorldMeta ihn
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
    // Daten-Schicht); mit `reload` läuft der Welt-Wechsel `_weltWechsel` (Sperre, Zeiger, Tausch am Ort).
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
        // "host"/"guest" startet die Ankunft automatisch Multi-User-Sync (`_weltAnschluss`).
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
        if (reload) this._weltWechsel(meta.worldId);
        return meta.worldId;
    }

    // Wechsel zu einer existierenden Welt. Sichert aktuelle, setzt aktiv,
    // mit `reload` der Welt-Wechsel (am Ort). Gibt false zurück, wenn die Ziel-Welt nicht im
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
        // lastPlayed ist der Stempel des Platzes (die Rettungs-Kette wählt an ihm) — das Verlassen einer Welt setzt ihn.
        this.activeWorldSet(worldId);
        this.log(`Welt-Wechsel: aktiv ist nun ${worldId.slice(0, 8)}…`, "INFO");
        if (reload) this._weltWechsel(worldId);
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
        // V18.151 (Faden #6) — auch die IndexedDB-Heimat der Welt räumen (der Speicher-Faden, ihr EINER Schreiber).
        this._speicherAuftrag({ op: "loeschen", welt: worldId }, [], false);
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
        const stempel = AnazhRealm._stempelVon(data.studioOv);
        if (stempel) restored.studioOv = stempel;
        this._carryUnknown(data, restored, AnazhRealm.BLUEPRINT_KNOWN_KEYS);
        return restored;
    }

    // Der Stand als Objekt (Export, Fusion, Netz, Download): die Stand-Tafel ganz, `worldMeta.voxelEdits` als Liste.
    buildStateSnapshot() {
        const s = {};
        const K = { bauten: this._standBauten() };
        for (const [k, wert, art] of this._standTafel())
            if (k !== "voxelEdits") s[k] = art && art.liste ? art.liste(K).map(art.glied) : wert(false, K);
        return s;
    }

    // DIE WELT IST EINE FUNKTION, KEIN SACK (speicher.K3, Gebot 7): was Saat und Gesetz setzen (`_ausGesetz`: der Wurf des
    // Felds, die Promotion der Streu), rechnet jeder Boot neu — der Stand trägt Werke, Taten und Leben, nie den Weg. Bis
    // speicher-k3 trug er jeden Wurf: 5 km Wanderung in 30 min hoben 443 auf 16 781 Bauten, den Stand von 0,2 auf 5,2 MB.
    // Gemerkt an der Liste selbst, ihrer Länge und ihrem letzten Eintrag: der Bestand ändert sich nur durch `push` (die Geburt
    // `spawnArchitecture`), `splice` (der Abbau) und eine neue Liste (das Laden) — gleiche drei, gleicher Bestand, und
    // `_ausGesetz` steht vor der Geburt fest (der Filter über ~1 300 Einträge kostete kalt 0,5 ms je Sicherung).
    _standBauten() {
        const a = this.state.architectures || AnazhRealm.STAND_LEER;
        const m = this._standBautenMemo;
        if (m && m.liste === a && m.n === a.length && m.letzter === a[a.length - 1]) return m.bauten;
        // die Geburt hängt an: gleiche Liste, ihr alter letzter Eintrag an seiner Stelle — gefiltert wird nur das neue Ende
        const an = m && m.liste === a && m.n < a.length && a[m.n - 1] === m.letzter;
        this._standBautenMemo = {
            liste: a,
            n: a.length,
            letzter: a[a.length - 1],
            bauten: an ? m.bauten.concat(a.slice(m.n).filter((e) => !e._ausGesetz)) : a.filter((e) => !e._ausGesetz),
        };
        return this._standBautenMemo.bauten;
    }

    // DIE STAND-TAFEL — die EINE Quelle des Feld-Satzes, in der Ordnung des Stands: je Feld [Schlüssel, Wert, Art].
    // `wert(stand, K)`: der Wert des Felds (`stand` = für den Speicher-Faden: die Edits reisen dort als eigener Teil
    // `voxelEdits`, kompakt; `K` der Kontext des Stands, `K.bauten` die Bauten des Stands). Die ART: `marke(K)` sind die Werte,
    // die das Feld bestimmen — gleiche Marke, gleiches JSON, keine Serialisierung (ohne Marke serialisiert jeder Stand das Feld
    // und sendet es, wenn sein JSON sich änderte); eine LISTE (Bauten, Baupläne) reist je Glied: `liste(K)` die Glieder,
    // `glied` serialisiert eines, `marke(g, m, K)` sind seine Werte (`m` sein Gedächtnis). gate:persistence (D) prüft den
    // komponierten Stand gegen die volle Serialisierung.
    _standTafel() {
        if (this._standZeilen) return this._standZeilen;
        const st = () => this.state;
        const zahl = (v, d) => (Number.isFinite(v) ? v : d);
        const atm = (k, d) => (st().atmosphere && Number.isFinite(st().atmosphere[k]) ? st().atmosphere[k] : d);
        const bpRolle = (bp) => {
            const h = st().blueprintEditHistory && st().blueprintEditHistory[bp.name];
            return h && h.undo.length ? h.undo[h.undo.length - 1] : null;
        };
        // die Marke einer Reihe, die nur wächst oder vorn verliert: sie selbst, ihre Länge, ihr jüngstes Glied
        const angehaengt = (f) => ({ marke: () => [f(), f().length, f().at(-1)] });
        const pl = () => st().player;
        return (this._standZeilen = [
            [
                "playerPosition",
                () =>
                    st().playerMesh
                        ? {
                              x: st().playerMesh.position.x,
                              y: st().playerMesh.position.y,
                              z: st().playerMesh.position.z,
                          }
                        : { x: 0, y: 5, z: 0 },
                // der Augenblick: jeder Stand des Takts fragt die Lage selbst (der Besen nie)
                { augenblick: true },
            ],
            // DIE BODEN-GENERATION (K16): unter welchem Gelände-Gesetz die Höhen dieses Saves stehen (`_bodenUmzug`).
            ["bodenGeneration", () => globalThis.__gelaendeCore.BODEN_GENERATION],
            // DIE HERKUNFT: jedes Werk dieses Stands trägt `werk` (seit 22.10.); ohne die Zeile entscheidet das Laden.
            ["herkunft", () => 1],
            [
                "spielerUeberGrund",
                () => (st().playerMesh ? this._ueberGrund(st().playerMesh.position) : undefined),
                // die Quelle: seine Lage und der Boden seiner Nachbarschaft (`_voxelStand`, die Regel je Bau) — eine Grube fern
                // von ihm misst nicht neu (bis speicher-k2-anhang jeder neue Boden der Welt, ~0,2 ms je Sicherung)
                {
                    marke: (K) => {
                        const p = st().playerMesh && st().playerMesh.position;
                        return p
                            ? [p.x, p.y, p.z, this._voxelStand(Math.floor(p.x / K.span), Math.floor(p.z / K.span))]
                            : [null];
                    },
                },
            ],
            ["knowledgeBase", () => st().knowledgeBase.slice(-200), angehaengt(() => st().knowledgeBase)],
            ["version", () => st().currentVersion],
            ["selfAwareness", () => st().selfAwareness],
            // Volle Komponenten-Persistenz je Kreatur (Name+Soul+Memory+bornAt+position); Specs live aus memory.
            // Tasks + carrying bewusst NICHT persistiert (Gesten leben im Moment, Identität lebt fort) — die Bindung an den
            // Spieler (bond + Folgen) ist Identität und reist mit (`_serializeCreature` bindung, halten.K5).
            // Ein Gefallener liegt nie in state.creatures (er zog beim Tod nach state.leichname) — er reist nie in den
            // Snapshot und erwacht nie beim Reload.
            // Je Wesen ein Glied; das Alter wächst mit jedem Bild, darum ohne Marke (der Besen serialisiert jedes je Runde).
            [
                "creatures",
                null,
                {
                    menge: () => [st().creatures, st().creatures.length, st().creatures.at(-1)],
                    liste: () => st().creatures.filter((c) => c && c.userData),
                    marke: () => null,
                    glied: (c) => this._serializeCreature(c),
                },
            ],
            ["creatureEmotions", () => st().creatureEmotions],
            // halten.K4 — die Pfeile, die in Gelände und Bau stecken (`_pfeilStecken`); die im Tier reisen mit dem Tier
            [
                "pfeileStecken",
                () => this._pfeileSteckenAbdruck(),
                angehaengt(() => st().pfeileStecken || AnazhRealm.STAND_LEER),
            ],
            ["terrainSteepness", () => st().terrainSteepness],
            ["terrainBaseHeight", () => st().terrainBaseHeight],
            ["weather", () => st().weather],
            // Die Promotion der Streu ist eine Funktion des Wegs (der Boot promotet neu, wo der Spieler naht) und reist nicht; ein
            // älterer Stand behält seine Liste (`worldMeta.scatterPromoted`, seine promoteten Bäume reisen mit ihm). Der Erdbau
            // eines Orts mit Gedächtnis (`settlementCells`) reist nie: der Ort kehrt aus ihm wieder (`_tickAutoSettlement`).
            [
                "worldMeta",
                (stand) => {
                    const wm = { ...st().worldMeta };
                    const orte = new Set(Object.values(wm.settlementCells || {}).map((c) => c && c.seed >>> 0));
                    if (wm.erdbau && typeof wm.erdbau === "object") {
                        wm.erdbau = { ...wm.erdbau };
                        for (const k in wm.erdbau)
                            if (/^ort:/.test(k) && orte.has(+k.split(":")[1])) delete wm.erdbau[k];
                    }
                    if (stand) delete wm.voxelEdits;
                    return wm;
                },
            ],
            // die Edits im Stand des Speicher-Fadens: kompakt, angehängt (speicher-faden.js) — nur dort ein eigener Teil
            ["voxelEdits", null],
            // der Finalizer schreibt die Fitness an ihren Platz (`finalisiert`): seit affekt.K3 finalisiert er auf der Uhr des
            // Takts auch unter einem Takt der Linse, und der Stand des Fadens verpasste die Fitness (diag-persistence D)
            [
                "dslAbilities",
                () => st().dsl.abilities.slice(-200),
                { marke: () => [...angehaengt(() => st().dsl.abilities).marke(), st().dsl.finalisiert] },
            ],
            [
                "dslHistory",
                () => st().dsl.history.slice(-st().dsl.historyCap),
                {
                    marke: () => [
                        st().dsl.history,
                        st().dsl.history.length,
                        st().dsl.history.at(-1),
                        st().dsl.historyCap,
                        st().dsl.finalisiert,
                    ],
                },
            ],
            // Stehende Welt-Regeln persistieren NUR mit den definierenden Feldern (cond/effect/everySec/source/
            // ttlSec); die Laufzeit-Akkus (fires/born/_sig/costMsSum) setzt der Restore frisch.
            [
                "worldRules",
                () =>
                    (st().worldRules || AnazhRealm.STAND_LEER).slice(0, AnazhRealm.WORLD_RULES.cap).map((r) => ({
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
                // die Regel selbst und die Wahl des Schöpfers (die definierenden Felder schreibt nur ihre Geburt)
                {
                    marke: () => {
                        const w = st().worldRules || AnazhRealm.STAND_LEER;
                        return [w, w.length].concat(...w.map((r) => [r, r.pinned, r.disabled]));
                    },
                },
            ],
            // Gewährte Fähigkeiten überleben den Reload (additives Snapshot-Feld; alte Builds bewahren es als
            // Unbekanntes). Die Quarantäne-Queue reist bewusst NICHT (ein Vorschlag ist Session-Tatsache).
            ["grantedCapabilities", () => st().grantedCapabilities || {}],
            // Schicht 1 — Pattern-Memory + Pfad-Buckets persistieren. Beides
            // ist Welt-Gedächtnis und überlebt Reloads bewusst.
            ["dslPatternMemory", () => st().dsl.patternMemory || {}],
            ["playerPathBuckets", () => pl().pathBuckets || null],
            // Welle 1 D — Welt-Journal persistiert. Ohne das Journal hätte
            // jede Session ihre eigene Geschichte; mit ihm wächst die Welt
            // über Reloads hinweg.
            [
                "worldJournal",
                () => ({
                    entries: (st().worldJournal.entries || []).slice(-st().worldJournal.entryCap),
                    seen: { ...(st().worldJournal.seen || {}) },
                }),
                {
                    marke: () => {
                        const j = st().worldJournal;
                        const e = j.entries || [];
                        return [e, e.length, e.at(-1), j.entryCap, j.seen, Object.keys(j.seen || {}).join("|")];
                    },
                },
            ],
            // Ring 3: Player-Emotionen werden mitgespeichert. Cooldown-Timer
            // bleiben absichtlich draußen — sie sind reine Laufzeit-Drosselung,
            // ein Reload soll wieder triggerfähig sein.
            ["playerEmotions", () => ({ ...pl().emotions })],
            // DIE LEBENSWERTE SIND ZUSTAND (halten.K5, `recomputePlayerStats`): Leben, Ausdauer und Mana als Anteil ihres
            // Maximums (das Maximum rechnet der Leib beim Laden neu, wie `hpAnteil` des Tiers), dazu die Wunde des Tods —
            // vorher heilte jeder Reload (hp 69,6 → 134 von 134, die Wunde 1 → 0). `_loadStateRestoreLeben` liest sie. DIE NAHRUNG
            // reist mit (halten.K5 Staffel 2): was der Leib gegessen hat (`consume:`-Boosts, `activateConsumable`), mit ihrer
            // Restzeit — sie hebt das Maximum, an dem die Anteile hängen; vorher fiel sie im Reload, hpMax mit ihr.
            [
                "playerLeben",
                () => {
                    const pl = st().player;
                    const anteil = (v, max) => (Number.isFinite(v) && max > 0 ? +Math.min(1, v / max).toFixed(4) : 1);
                    const jetzt = performance.now() / 1000;
                    return {
                        hp: anteil(pl.hp, pl.hpMax),
                        ausdauer: anteil(pl.stamina, pl.staminaMax),
                        mana: anteil(pl.mana, pl.manaMax),
                        wunde: +(pl.deathWoundIntensity || 0).toFixed(4),
                        nahrung: (Array.isArray(pl.boosts) ? pl.boosts : [])
                            .filter((b) => b && String(b.source).startsWith("consume:") && b.expiresAt > jetzt)
                            .map((b) => ({
                                quelle: b.source,
                                tags: { ...b.tagDelta },
                                rest: +(b.expiresAt - jetzt).toFixed(2),
                                label: b.label,
                            })),
                    };
                },
            ],
            // Tag-Nacht: timeOfDay läuft nach dem Reload weiter. Die Tag-Länge ist die Wahl des Spielers und lebt bei ihm
            // (localStorage, `setDayLength`): der Kopf trägt sie, weil die Taille v1 den Schlüssel verlangt
            // (spec/golden/v1/snapshot-head.json, MUST weiter produziert), das Laden setzt sie nie (Leben-Schau 2: jeder
            // alte Stand trug den 8-min-Tag und hielte ihn fest).
            // DIE WELT-UHR (feld.K2#2) reist: nach dem Reload laufen Front, Zug, Leben und Brand an ihr weiter (`_weltUhrNimm`);
            // der Übergang des Wetter-Zugs ist ihre Funktion (der erste Takt zieht ihn neu), darum reist weatherTransition nicht.
            ["spielZeit", () => st().spielZeit, { augenblick: true }],
            ["timeOfDay", () => (typeof st().timeOfDay === "number" ? st().timeOfDay : 0.5), { augenblick: true }],
            // DAS JAHR DER WELT (speicher.K4): die Phase der Saison reist — ohne sie begann jede Wiederkehr am Sommer-Anfang
            // (0,375), und der Pegel des Jahrs (`_pegelTafel`: die Schmelze hebt See und Fluss) zeichnete Ufer, Wasser und den
            // Boden der Gruben am Fluss anders als vor dem Speichern (Grube am Bach der Mess-Wiese: der Boden-Chunk 777 → 774
            // Ecken, bild-diff 4,2 %).
            ["seasonPhase", () => (typeof st().seasonPhase === "number" ? st().seasonPhase : null)],
            ["dayLengthMinutes", () => st().dayLengthMinutes],
            // Das Wort des Spielers über das Wetter reist mit (es steht, bis er es freigibt); der Wunsch der Welt nicht.
            ["wetterWort", () => st().wetterWort || null],
            // ERFINDER-WELLE — die Welt-Klang-Wahl reist (V8.59-Klasse: sonst still zurückgesetzt).
            ["klangPreset", () => (typeof st().klangPreset === "string" ? st().klangPreset : null)],
            // DER PRÄGUNGS-SPEICHER (ws.studioOv: die Werke der Studios über den EINEN Übergabe-Kanal und die Werkstatt-Regler)
            // überlebt den Reload — sonst still zurück auf die gefrorenen Kern-Presets. Der Restore läuft durch DENSELBEN Prüfer
            // (`_studioWerkPruefen`, Taille-gedeckelt je Werk). Der Speicher-Faden serialisiert ihn ungeklont (dasselbe JSON).
            [
                "studioOv",
                (stand) => {
                    const ov = (st().workshop && st().workshop.studioOv) || {};
                    return stand ? ov : JSON.parse(JSON.stringify(ov));
                },
            ],
            // Die vier Perf-Regler reisen im Snapshot (sonst setzt jeder Reload sie still zurück):
            // perfTargetMs · lodRef (Quelle von Subsystem A) · szeneSkala · chunkRingRadius.
            ["perfTargetMs", () => zahl(st().perfTargetMs, 17)],
            ["lodRef", () => zahl(st().lodRef, 14)],
            ["szeneSkala", () => zahl(st().szeneSkala, null)],
            ["chunkRingRadius", () => zahl(st().chunkRingRadius, 4)],
            // V18.389 (P5) — die Sichtbarkeit des sauberen Perf-Panels (default an).
            ["perfPanel", () => st().perfPanel !== false],
            ["untertitel", () => st().untertitel === true],
            // V8.28 6.G4.b — Atmosphäre-Slider (Cel-Stufen seit V18.236 und der Fog-Regler seit V18.530 gestrichen).
            // V13.9 — waterCull (uMinDepth); V18.14/.15 — die Makro-Kontext-Regler; J4 — Kavitäts-AO und Kanten-Schärfe;
            // V17.111 R1 — die Schatten-Hebel; §7.5/V18.164 — die M7-Regler (lebten nur in der Session, V8.59-Klasse);
            // V18.210 (§1-A2) — der R5-STRUKTUR-BOOST (sonst springt der Slider zurück auf 1.3).
            [
                "atmosphere",
                () => ({
                    waterCull: atm("waterCull", 0.0025),
                    waterDepthFoam: atm("waterDepthFoam", 1.2),
                    waterLakeRipple: atm("waterLakeRipple", 0.06),
                    cavityAO: atm("cavityAO", 1.0),
                    kantenSchaerfe: atm("kantenSchaerfe", 0),
                    triplanar: atm("triplanar", 1.0),
                    colorVar: atm("colorVar", 1.0),
                    shadowRange: atm("shadowRange", 300),
                    shadowBias: atm("shadowBias", 1.0),
                    microStrength: atm("microStrength", 0.1),
                    r5StructureBoost: atm("r5StructureBoost", AnazhRealm.R5_STRUCTURE_TEXTURE.microBoost),
                }),
            ],
            // Ring 5: Spieler-Seele (visuelle Form). Beim Load wird sie nach
            // dem playerMesh-Bau angewandt — kein Body-Recreate.
            ["playerSoul", () => st().player.soul || "human"],
            // Welle 6.D Etappe 1.6 — Custom-Seelen persistieren (eigene Charaktere des Schöpfers). Built-ins sind in
            // playerSoulDefs verdrahtet und werden NICHT persistiert.
            ["customSouls", () => st().customSouls || {}],
            // Gewachsene Baupläne (`_grown_*`, _isGrown:true) reisen mit, weil state.architectures sie als `type`
            // referenziert — fehlen sie, schlägt spawnArchitecture beim Restore fehl. Nur die METADATA reist:
            // die `parts` sind pure Funktion von (species, seed) und wachsen beim Restore via `_growTreeBlueprint`
            // nach (~75 Parts/Baum würden die 256-KB-Wand von pinCurrentWorld sprengen). NUR von einem Bau DES STANDS
            // referenzierte: Foliage-Varianten wachsen im nächsten Streaming-Pass deterministisch nach; im Snapshot
            // blähten sie ihn und umgingen beim Restore die 256er-Ring-Deckelung (Inflation über Sessions). Gefragt wird je
            // Bau-Art des Stands, in der Ordnung ihres ersten Baus (nie jeder Bauplan der Welt: 0,14 ms je Sicherung).
            [
                "grownBlueprints",
                (stand, K) => {
                    const out = {};
                    const bps = st().blueprints || {};
                    for (const a of K.bauten) {
                        const bp = bps[a.type];
                        if (bp && bp._isGrown && !out[a.type])
                            out[a.type] = {
                                label: bp.label,
                                _grownSpecies: bp._grownSpecies,
                                _grownSeed: bp._grownSeed,
                            };
                    }
                    return out;
                },
                // die Bauten des Stands und die Menge der eigenen Baupläne (ein gewachsener kommt nur hinzu)
                { marke: (K) => [K.listenGen.architectures, K.listenZahl.blueprints], ausListen: true },
            ],
            // Welle 6.D Etappe 3a — Konsumable-Rezepte persistieren.
            ["consumables", () => st().consumables || {}],
            // Welle 6.D Etappe 3b / V17.57 W2-B — Equipped-Slots persistieren ({held, armor}).
            ["playerEquipped", () => (st().player && st().player.equipped) || { held: null, armor: null }],
            // Welle 4 Phase 3: Werkzeug-Besitz. Starter-Werkzeuge werden bei jedem Init wieder verfügbar, aber Persistenz
            // erlaubt eigen-geschmiedeten (Welle 6) zu überleben.
            ["playerTools", () => (Array.isArray(pl().tools) ? [...pl().tools] : [])],
            // Ring 6: Bau-Werke. Nur {type, position, seed, scale} — der Mesh wird beim Laden aus dem Seed rekonstruiert
            // (kein Mesh-Snapshot). Die Marke eines Baus: seine Felder und der Stand des Bodens unter ihm (`_voxelStand`:
            // Edit und Erdbau seiner Nachbarschaft — `ueberGrund` misst den Boden).
            [
                "architectures",
                null,
                {
                    menge: (K) => [K.bauten],
                    liste: (K) => K.bauten,
                    marke: (a, m, K) => {
                        const p = a.position;
                        if (K.bodenNeu || m.boden === undefined)
                            m.boden = this._voxelStand(Math.floor(p.x / K.span), Math.floor(p.z / K.span));
                        return [
                            a.id,
                            a.type,
                            p.x,
                            p.y,
                            p.z,
                            a.seed,
                            a.scale,
                            a.rotationY,
                            a.tintH,
                            a.tintS,
                            a.tintV,
                            a.freeBorn,
                            a.feldWurf,
                            a.werk,
                            a.studioOv,
                            a.fundament,
                            a.tuer,
                            a.chimney,
                            a.portalMeta,
                            m.boden,
                        ];
                    },
                    glied: (a) => ({
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
                        // die Herkunft des Werks überlebt den Reload (sonst räumte das Laden ein Werk des Spielers als Natur)
                        ...(a.werk === true ? { werk: true } : {}),
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
                    }),
                },
            ],
            // Φ7 (V18.190) — die KURATIONS-MANIFESTE der Welt: signierte
            // Hallen (Welt-Verzeichnisse) reisen im Snapshot mit. JSON-flach
            // (Map → Array), Restore baut die Map zurück.
            [
                "portalHalls",
                () =>
                    Array.from(st().portalHalls || AnazhRealm.STAND_LEER).map(([name, h]) => ({
                        name,
                        label: h.label,
                        entries: h.entries.map((e) => ({ address: { ...e.address }, label: e.label })),
                        authorPubKey: h.authorPubKey || null,
                        sig: h.sig || null,
                        signedAt: h.signedAt || 0,
                        signedHash: h.signedHash || null,
                        provenance: Array.isArray(h.provenance) ? h.provenance.slice() : [],
                    })),
                {
                    marke: () => {
                        const m = [st().portalHalls, st().portalHalls ? st().portalHalls.size : 0];
                        for (const h of (st().portalHalls || AnazhRealm.STAND_LEER).values())
                            m.push(h, h.label, h.entries, h.entries.length, h.sig, h.signedAt, h.provenance);
                        return m;
                    },
                },
            ],
            // Φ6 (V18.191) — die COMPUTE-SPENDE-Schicht reist mit (Hashes,
            // klein — 256 contributions × ~50 B = ~13 KiB Cap). Das Web der
            // Verifizierung wächst mit der Welt.
            [
                "computeContributions",
                () =>
                    Array.from(st().computeContributions || AnazhRealm.STAND_LEER).map(([inputHash, c]) => ({
                        inputHash,
                        outputHash: c.outputHash,
                        providedBy: c.providedBy || null,
                        providedAt: c.providedAt || 0,
                        sig: c.sig || null,
                        status: c.status || "unverified",
                    })),
                {
                    marke: () => {
                        const m = [
                            st().computeContributions,
                            st().computeContributions ? st().computeContributions.size : 0,
                        ];
                        for (const c of (st().computeContributions || AnazhRealm.STAND_LEER).values())
                            m.push(c, c.outputHash, c.providedBy, c.providedAt, c.sig, c.status);
                        return m;
                    },
                },
            ],
            [
                "playtestContributions",
                () => (st().playtestContributions || []).slice(),
                angehaengt(() => st().playtestContributions || AnazhRealm.STAND_LEER),
            ],
            // Nur eigene Baupläne persistieren (die Built-ins erzeugt _defaultBlueprints() beim Init). Der Feld-Satz lebt in
            // _serializeBlueprint — EINE Quelle für alle drei Snapshot-Pfade. Die Marke eines Bauplans: jedes eigene Feld
            // (auch das Unbekannte, das `_carryUnknown` trägt), die Länge seiner Teile und Verbindungen, die Felder des
            // Tor-Ziels und der jüngste Schritt seines Edit-Verlaufs (`_recordBlueprintEdit` geht jedem Teile-Edit voraus).
            [
                "blueprints",
                null,
                {
                    liste: () => Object.values(st().blueprints || {}).filter((bp) => bp && !bp.builtIn),
                    // regte sich die Hand, fragt der Stand jeden Bauplan; den Hieb, der am Bauplan zehrt, fegt der Besen
                    alle: (K) => K.geaendert.includes("playerInventory"),
                    marke: (bp) => {
                        const m = Object.values(bp);
                        const pm = bp.portalMeta;
                        m.push(Object.keys(bp).length, bpRolle(bp));
                        if (Array.isArray(bp.parts)) m.push(bp.parts.length);
                        if (Array.isArray(bp.connections)) m.push(bp.connections.length);
                        if (pm && typeof pm === "object") m.push(...Object.values(pm));
                        if (bp.toolMeta && typeof bp.toolMeta === "object") m.push(...Object.values(bp.toolMeta));
                        return m;
                    },
                    glied: (bp) => this._serializeBlueprint(bp),
                },
            ],
            // Welle 5 C — eigene Werkzeuge (aus registrierten Bauplänen) persistieren. Starter-Werkzeuge entstehen aus
            // _defaultTools() bei jedem Init, deshalb nur eigene speichern. Ω2: EIN Serialize.
            [
                "tools",
                () =>
                    Object.values(st().tools || {})
                        .filter((t) => t && !t.builtIn)
                        .map((t) => this._serializeTool(t)),
            ],
            // Welle 4 Phase 1 — eigene Materialien persistieren. Built-ins kommen aus _defaultMaterials() im Konstruktor
            // zurück; auch hier schreiben wir nur, was der Spieler dazugefügt hat. Ω2: EIN Serialize.
            [
                "materials",
                () =>
                    Object.values(st().materials || {})
                        .filter((m) => m && !m.builtIn)
                        .map((m) => this._serializeMaterial(m)),
            ],
            // Ring 6.5 — Hotbar-Belegung. Array von 9 Slots mit Bauplan-Name oder null. Default wird beim Init überschrieben.
            ["hotbar", () => (Array.isArray(st().hotbar) ? st().hotbar.slice(0, 9) : [])],
            // Welle 6.C1 — Inventar persistiert. 27 Slots, jeweils {blueprintName,
            // count}, ein Material-Slot {kind, material, count}, oder null. Bei Reload defensive Validierung (unbekannte
            // Namen werden zu null, count ≥ 1, ganz). Bis 24.10. schrieb der Material-Slot nur {count}: jedes Laden
            // verlor, was Graben, Ernte und Beute gaben (der Korpus, speicher.K5).
            [
                "playerInventory",
                () =>
                    Array.isArray(st().player && st().player.inventory)
                        ? st()
                              .player.inventory.slice(0, 27)
                              .map((s) =>
                                  s
                                      ? s.kind === "material"
                                          ? { kind: "material", material: s.material, count: s.count || 1 }
                                          : { blueprintName: s.blueprintName, count: s.count || 1 }
                                      : null
                              )
                        : [],
                // ein eigenes Feld des Augenblicks: seine Änderung fragt jeden Bauplan (`alle` der Baupläne) und jedes Feld
                { augenblick: true },
            ],
        ]);
    }

    // DIE ÄNDERUNG DES STANDS für den Speicher-Faden (Lehre 24): je Feld der Tafel sein JSON, gesendet nur, wenn es sich
    // änderte (eine Marke erspart den Bau); je Liste die Menge (ihre Ordnung nur, wenn sie sich änderte) und die Glieder, deren
    // JSON sich änderte; die Edits als Anhang (x, y, z, r, Modus) seit dem letzten Stand. `voll`: alles SENDEN (der Faden hält
    // kein Modell dieser Welt) — serialisiert wird auch dann nur, was sich seit dem Gedächtnis änderte (der Besen backt ab dem
    // Boot vor). `takt` (die Sicherung des Takts): die ruhigen Felder und die Glieder hat der Besen im Leerlauf geprüft
    // (`_standFegen`) — gefragt werden der Augenblick, neue Glieder und, wo das Inventar sich regte, alles (ein Akt, der
    // Material zahlt und einen Bauplan ändert, steht ganz im Stand oder gar nicht). → die Nachricht (die Teile als EINE Zeichenkette,
    // speicher-faden.js nennt die Zahl) und die Transfers der Edits.
    _standAenderung(voll, takt) {
        const S = this._speicher;
        const gleich = (a, b) => {
            if (!a || a.length !== b.length) return false;
            for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
            return true;
        };
        const tafel = this._standTafel();
        // DER KONTEXT DES STANDS: die Bauten einmal gefiltert; der Boden (Edits, Erdbau, Welt-Sync — was `_ueberGrund` liest):
        // nur ein neuer Boden fragt den Boden unter jedem Bau
        const wm = this.state.worldMeta || {};
        const boden = [wm.voxelEdits, wm.voxelEdits ? wm.voxelEdits.length : 0, wm.erdbau, this._erdbauStand];
        boden.push(this.state.voxelWorkerStateGen);
        if (voll || !gleich(S.boden, boden)) S.bodenGen = (S.bodenGen || 0) + 1;
        S.boden = boden;
        const K = this._standKontext();
        K.bodenNeu = S.bodenGen !== S.bodenGemessen;
        S.bodenGemessen = S.bodenGen;
        const [stuecke, teile, listenStuecke, listen] = [[], [], [], {}];
        // die Zeilen der Tafel nach Art (gemerkt, bis die Tafel wächst): der Augenblick, der Kopf, die ruhigen Felder
        if (!S.klassen || S.klassen.n !== tafel.length) {
            const C = (S.klassen = { n: tafel.length, augenblick: [], kopf: [], ruhig: [], listen: [], ausListen: [] });
            for (const z of tafel) {
                const a = z[2];
                if (a && a.liste) C.listen.push(z);
                else if (z[1])
                    (!a ? C.kopf : a.augenblick ? C.augenblick : a.ausListen ? C.ausListen : C.ruhig).push(z);
            }
            Object.assign(S, { kopf: null, ordnung: null });
        }
        const C = S.klassen;
        // ein Feld mit eigener Art: gefragt (`fragen`) oder aus dem Gedächtnis, das der Besen fegte — gesendet, was der Faden
        // nicht hält (neu gefragt und anders, gefegt, oder alles bei `voll`)
        const feld = (z, fragen) => {
            const k = z[0];
            let neu = S.gefegt.delete(k) || voll;
            if (fragen || !S.zeilen.has(k)) neu = this._standFrage(z, K) || neu;
            const json = S.zeilen.get(k).json;
            if (!neu || json === undefined) return;
            teile.push(k);
            stuecke.push(json);
        };
        // (1) DER AUGENBLICK DES STANDS (speicher.K2): im Takt fragt der Stand nur die Felder, die jeder Stand trägt (Art
        // `augenblick`: Lage, Uhr, die Hand); jedes ruhige Feld und den Kopf fragt der Besen im Leerlauf reihum (`_standFegen`)
        // wie die Glieder der Listen — bis speicher-zwei fragte jeder Stand die ganze Tafel: je Stand p50 0,325 / max 0,6 ms im
        // Haupt-Faden (headless im Takt des Autosaves, 2 kB Kopf, sonst nichts Neues), seither p50 0,09–0,12 / max 0,26 ms und
        // sein Versand ein eigenes Bild. REGTE SICH DIE HAND (das Inventar), fragt er alles: ein Akt, der Material zahlt, steht
        // ganz im Stand.
        for (const z of C.augenblick) feld(z, true);
        const alles = !takt || voll || K.geaendert.includes("playerInventory");
        // (2) DER KOPF: die Felder ohne Art, je Feld sein Stück JSON (gefragt oder gefegt), EIN Text, EIN Vergleich — neu
        // zusammengesetzt nur, wenn ein Stück sich regte; der Faden setzt ihn als Felder ohne Klammern ein
        if (alles || S.kopf === null || S.kopfNeu) {
            S.kopfNeu = false;
            const kopf = [];
            for (const z of C.kopf) {
                if (alles || !S.kopfStuecke.has(z[0])) this._standFrage(z, K);
                const s = S.kopfStuecke.get(z[0]);
                if (s) kopf.push(s);
            }
            const kopfJson = kopf.join(",");
            if (voll || S.kopf !== kopfJson) {
                S.kopf = kopfJson;
                teile.push("");
                stuecke.push(kopfJson);
            }
        }
        // die ruhigen Felder mit eigener Art (Marke oder eigenes Urteil), die aus keiner Liste folgen
        if (alles || S.gefegt.size) for (const z of C.ruhig) feld(z, alles);
        // (2) die Listen
        for (const z of C.listen) {
            const k = z[0],
                art = z[2];
            const L = this._standListe(k);
            const ganz = !takt || (art.alle && art.alle(K));
            const neu = [];
            // ein Glied geprüft: neu serialisiert, wenn es kein Gedächtnis hat oder seine Marke sich änderte → geändert?
            const pruefe = (g, m) => {
                const marke = art.marke(g, m, K);
                if (m.json !== null && marke && gleich(m.marke, marke)) return false;
                m.marke = marke;
                const json = JSON.stringify(art.glied(g));
                if (json === m.json) return false;
                m.json = json;
                return true;
            };
            const menge = art.menge ? art.menge(K) : L.menge;
            const neueMenge = ganz || !L.glieder || !gleich(L.menge, menge);
            if (voll || neueMenge) {
                const glieder = neueMenge ? art.liste(K) : L.glieder;
                // DER ANHANG: im Takt wächst die Liste meist nur am Ende (die Geburt, `push`) — bei gleichem Anfang fragt der Stand
                // nur das neue Ende, und die Ordnung reist als Anhang. Bis speicher-k2-anhang lief jeder neue Bau über alle Glieder
                // (je Glied das Gedächtnis und der Ordnungs-Vergleich), und die ganze Ordnung ging geklont an den Faden.
                const alt = L.glieder;
                const anhaengen = !voll && !ganz && alt && alt !== glieder && alt.length <= glieder.length;
                let ab = 0;
                if (anhaengen) while (ab < alt.length && glieder[ab] === alt[ab]) ab++;
                if (anhaengen && ab === alt.length) {
                    for (const m of L.gefegt) {
                        neu.push(m.s);
                        listenStuecke.push(m.json);
                    }
                    // ein Glied des Endes ist dem Faden neu: es reist immer (mit dem JSON seines Gedächtnisses, wenn es eins hat)
                    const anhang = glieder.slice(ab).map((g) => {
                        const m = this._standGlied(L, g);
                        if (m.json === null) pruefe(g, m);
                        if (!L.gefegt.has(m)) (neu.push(m.s), listenStuecke.push(m.json));
                        L.ordnung.push(m.s);
                        return m.s;
                    });
                    listen[k] = anhang.length ? { teile: neu, anhang } : { teile: neu };
                } else {
                    const ord = new Array(glieder.length);
                    for (let j = 0; j < glieder.length; j++) {
                        const m = this._standGlied(L, glieder[j]);
                        const geaendert = (ganz || m.json === null) && pruefe(glieder[j], m);
                        if (voll || geaendert || L.gefegt.has(m)) {
                            neu.push(m.s);
                            listenStuecke.push(m.json);
                        }
                        ord[j] = m.s;
                    }
                    listen[k] = { teile: neu };
                    if (voll || !gleich(L.ordnung, ord)) listen[k].ordnung = L.ordnung = ord;
                }
                L.glieder = glieder;
                L.menge = art.menge ? menge : [glieder];
            } else {
                for (const m of L.gefegt) {
                    neu.push(m.s);
                    listenStuecke.push(m.json);
                }
                listen[k] = { teile: neu };
            }
            L.gefegt.clear();
            if (neu.length || listen[k].ordnung) L.gen++;
            K.listenGen[k] = L.gen;
            K.listenZahl[k] = L.glieder.length;
        }
        // (3) die Felder, die aus den Listen folgen
        for (const z of C.ausListen) feld(z, true);
        // (4) die Edits: angehängt seit dem letzten Stand, ganz, wenn ihre Liste neu ist
        let edits = null;
        const eds = wm.voxelEdits || null;
        const zahl = eds ? eds.length : 0;
        const E = S.edits;
        const ganzE = voll || eds !== E.ref || zahl < E.n;
        if (ganzE || E.n < zahl) {
            const ab = ganzE ? 0 : E.n;
            const xyzr = new Float64Array((zahl - ab) * 4);
            const modus = new Uint8Array(zahl - ab);
            for (let i = ab, j = 0; i < zahl; i++, j++) {
                const e = eds[i];
                xyzr[j * 4] = e.x;
                xyzr[j * 4 + 1] = e.y;
                xyzr[j * 4 + 2] = e.z;
                xyzr[j * 4 + 3] = e.r;
                modus[j] = e.mode === "fill" ? 1 : 0;
            }
            edits = { ab, xyzr, modus };
        }
        E.ref = eds;
        E.n = zahl;
        // die Ordnung der Tafel: der Kopf an der Stelle seines ersten Felds, jede Liste, die Edits, jedes eigene Feld mit Wert —
        // neu nur, wo ein Feld seinen Wert gewann oder verlor (`_standFrage`) oder die Tafel wuchs
        const daten = stuecke.concat(listenStuecke).join("\u0001");
        const nachricht = { teile, listen, daten };
        if (voll || !S.ordnung) {
            const ordnung = [];
            let mitKopf = false;
            for (const z of tafel) {
                const k = z[0],
                    art = z[2];
                if (k === "voxelEdits" || (art && art.liste)) ordnung.push(k);
                else if (art) S.zeilen.get(k).json !== undefined && ordnung.push(k);
                else if (!mitKopf) mitKopf = ordnung.push("") > 0;
            }
            nachricht.ordnung = S.ordnung = ordnung;
        }
        const transfer = [];
        if (edits) {
            nachricht.edits = edits;
            transfer.push(edits.xyzr.buffer, edits.modus.buffer);
        }
        return { nachricht, transfer };
    }

    // Der Kontext eines Stands und eines Besen-Schritts: die Bauten des Stands, die Spanne der Chunks, die Generationen der
    // Listen, die Felder, die sich in diesem Stand änderten.
    _standKontext() {
        const r = this;
        return {
            bauten: this._standBauten(),
            bodenNeu: true,
            // die Spanne erst, wenn ein Boden gefragt wird (der Augenblick des Stands fragt keinen)
            get span() {
                if (this._span === undefined) this._span = r._voxelChunkConfig(0).span;
                return this._span;
            },
            listenGen: {},
            listenZahl: {},
            geaendert: [],
        };
    }

    // EIN Feld der Tafel gefragt (der Augenblick des Stands oder der Besen): sein JSON neu, wo es keine Marke hat oder sie sich
    // regte; ein Feld des Kopfs hält sein Stück (`"k":JSON`, leer ohne Wert). → anders als sein Gedächtnis (ein neues immer)?
    _standFrage(z, K) {
        const S = this._speicher;
        const k = z[0],
            wert = z[1],
            art = z[2];
        if (!art) {
            const j = JSON.stringify(wert(true, K));
            const s = j === undefined ? "" : JSON.stringify(k) + ":" + j;
            if (S.kopfStuecke.get(k) === s) return false;
            S.kopfStuecke.set(k, s);
            return (S.kopfNeu = true);
        }
        const alt = S.zeilen.get(k);
        const marke = art.marke ? art.marke(K) : null;
        if (marke && alt && alt.marke && marke.length === alt.marke.length && marke.every((v, j) => v === alt.marke[j]))
            return false;
        const v = wert(true, K);
        const json = v === undefined ? undefined : JSON.stringify(v);
        S.zeilen.set(k, { marke, json });
        if (!alt || (alt.json === undefined) !== (json === undefined)) S.ordnung = null;
        if (alt && alt.json === json) return false;
        if (alt) K.geaendert.push(k);
        return true;
    }

    // Das Gedächtnis einer Liste im Stand (ihre Glieder, Menge, Ordnung, je Glied Seriennummer, Marke und JSON; die gefegten).
    _standListe(k) {
        const S = this._speicher;
        if (!S.listen.has(k))
            S.listen.set(k, {
                glieder: null,
                menge: null,
                ordnung: [],
                memo: new WeakMap(),
                gefegt: new Set(),
                gen: 0,
            });
        return S.listen.get(k);
    }

    _standGlied(L, g) {
        let m = L.memo.get(g);
        if (!m) L.memo.set(g, (m = { s: ++this._speicher.seriell, marke: null, json: null }));
        return m;
    }

    // DER BESEN DES STANDS (Lehre 14: im Leerlauf vorgebacken): in den Leerlauf-Fenstern des Haupt-Fadens prüft er die Glieder
    // der Listen reihum (die Bauten, die Baupläne, die Wesen) und serialisiert die geänderten — der Takt-Stand reicht nur sie
    // weiter. Eine Runde beginnt mit der frischen Menge der Baupläne (ein neuer oder gefallener ohne Inventar-Akt kommt so
    // spätestens eine Runde später); jedes Glied ist einmal je Sicherungs-Abstand dran, ein neues sofort.
    // → die ms, bis wieder ein Glied fällig ist (der Besen schläft so lange).
    _standFegen(frist) {
        const S = this._speicherZustand();
        if (!this.state.worldMeta || !this.state.playerMesh) return 1000;
        const F = S.fege || (S.fege = { reihe: [], i: 0, guthaben: 0, zeit: performance.now(), runde: 0 });
        // das Guthaben: so viele Glieder, dass jedes einmal je Sicherungs-Abstand dran ist (ein neues prüft der Stand selbst)
        const jetzt = performance.now();
        const abstand = 1000 * this.state.saveInterval;
        F.guthaben = Math.min(F.reihe.length + 1, F.guthaben + ((jetzt - F.zeit) * F.reihe.length) / abstand);
        F.zeit = jetzt;
        // nichts fällig, kein Kontext: ein Glied ist alle Abstand/Länge dran, eine Runde ohne Glieder einmal je Abstand (bis
        // speicher-takt lief der Besen in JEDEM Leerlauf-Fenster und baute dort den Kontext samt Bauten-Filter)
        const ruhe = () =>
            F.i < F.reihe.length
                ? Math.max(0, ((1 - F.guthaben) * abstand) / F.reihe.length)
                : F.reihe.length
                  ? 0
                  : Math.max(0, abstand - (performance.now() - F.runde));
        if (ruhe() > 0) return ruhe();
        const K = this._standKontext();
        // JE BILD HÖCHSTENS `fegeMs` (speicher.K2): was fällig bleibt, fegt das nächste Fenster (die Ruhe ist dann 0)
        const bis = performance.now() + AnazhRealm.STAND_TAKT.fegeMs;
        for (
            let n = 0;
            (F.guthaben >= 1 || F.i >= F.reihe.length) &&
            (frist.timeRemaining() > 1 || frist.didTimeout) &&
            (!n++ || performance.now() < bis);
        ) {
            if (F.i >= F.reihe.length) {
                F.reihe = [];
                F.i = 0;
                F.runde = jetzt;
                for (const z of this._standTafel()) {
                    const [k, wert, art] = z;
                    // ein ruhiges Feld ist ein Glied ohne Liste (der Augenblick und was aus den Listen folgt fragt der Stand)
                    if (wert && !(art && (art.ausListen || art.augenblick))) F.reihe.push([null, null, z]);
                    if (!art || !art.liste) continue;
                    const L = this._standListe(k);
                    if (!L.glieder) {
                        L.glieder = art.liste(K);
                        L.menge = art.menge ? art.menge(K) : [L.glieder];
                    } else if (!art.menge) {
                        const frisch = art.liste(K);
                        if (frisch.length !== L.glieder.length || frisch.some((g, j) => g !== L.glieder[j]))
                            L.menge = null;
                    }
                    for (const g of L.glieder) F.reihe.push([L, art, g]);
                }
                if (frist.didTimeout || !F.reihe.length) return ruhe();
            }
            const [L, art, g] = F.reihe[F.i++];
            F.guthaben--;
            if (!L) {
                if (this._standFrage(g, K) && g[2]) S.gefegt.add(g[0]);
            } else {
                const m = this._standGlied(L, g);
                const marke = art.marke(g, m, K);
                const gleich = m.json !== null && marke && marke.length === (m.marke || []).length;
                if (gleich && marke.every((v, j) => v === m.marke[j])) continue;
                m.marke = marke;
                const json = JSON.stringify(art.glied(g));
                if (json !== m.json) ((m.json = json), L.gefegt.add(m));
            }
            if (frist.didTimeout) return ruhe();
        }
        return ruhe();
    }

    // DER SPEICHER-FADEN (speicher-faden.js, Lehre 24): lazy geboren, EIN Faden je Seite; jede Antwort löst die Zusage ihrer
    // Nachricht. Ein verworfener Stand bricht laut (`_bruchMelden`) und lässt das Modell fallen: die nächste Sicherung sendet
    // die Welt ganz. Ohne Platte (null-origin der inneren Welt) sagt es die Seite einmal laut.
    _speicherAuftrag(nachricht, transfer = [], zusage = true, spaeter = false) {
        const S = this._speicherZustand();
        if (!S.faden) {
            S.faden = new Worker(`speicher-faden.js?v=${AnazhRealm.VERSION}`, { name: "speicher" });
            S.faden.onmessage = (e) => {
                const a = e.data;
                const w = S.warten.get(a.n);
                S.warten.delete(a.n);
                if (a.ohnePlatte && !this._speicherOhnePlatte) {
                    this._speicherOhnePlatte = true;
                    this.log(
                        `IndexedDB nicht verfügbar (${a.ohnePlatte}) — der Stand lebt nur bis zum Verlassen der Welt.`,
                        "WARN"
                    );
                }
                if (!a.ok) {
                    if (a.op === "stand") S.welt = null;
                    this._bruchMelden(`SPEICHER: der Faden verwarf ${a.op} — ${a.grund}`);
                }
                if (w) w(a);
            };
        }
        nachricht.n = ++S.n;
        // DER STAND DES BESENS REIST IM NÄCHSTEN FENSTER (`spaeter`, speicher.K2): sein Bild trägt das Zusammensetzen, das
        // nächste den Klon an den Faden (postMessage allein ~0,03–0,05 ms headless); jede Nachricht danach schickt ihn vorher —
        // die Ordnung der Ops bleibt, die Schranke (`_speicherStill`) steht hinter ihm
        S.schicke();
        if (spaeter) return void (S.unterwegs = [Object.assign(nachricht, { leise: true }), transfer]);
        // ohne Zusage (der Stand, die Ablage, das Löschen): niemand wartet, der Faden antwortet nur den Bruch (`leise`); die
        // Schranke (`_speicherStill`) steht hinter jeder früheren Nachricht
        if (!zusage) return S.faden.postMessage(Object.assign(nachricht, { leise: true }), transfer);
        return new Promise((ok) => {
            S.warten.set(nachricht.n, ok);
            S.faden.postMessage(nachricht, transfer);
        });
    }

    // Die Sicherung der lebenden Welt an den Faden: die Änderung seit dem letzten Stand (ganz, wenn der Faden kein Modell
    // dieser Welt hält). DER RUF DES TAKTS (Autosave, Edit-Timer; Lehre 14) merkt nur, DASS ein Stand aussteht — ihn setzt der
    // Besen in seinem nächsten Fenster mit Platz zusammen (`_standNachholen`; er schläft höchstens 1 s, darum weckt ihn der Ruf
    // nicht mehr: clearTimeout und Leerlauf-Auftrag waren das halbe Bild des Rufs), spätestens nach `STAND_TAKT.fristMs`; jeder
    // andere Ruf, die Schranke (`_speicherStill`) und das Verlassen setzen ihn vorher synchron. Bis speicher-takt setzte jeder
    // Ruf den Stand im Takt zusammen: je Ruf p95 5 ms auf der Radeon (speicher.K2, eeaff9d6). PLATTE VOR ZEIGER: aufgeschoben
    // wird nur, wo der Zeiger (`anazhRealmActiveWorld`) schon auf dieser Welt steht — der Stand, nach dem saveState den Zeiger
    // bewegt, geht synchron an den Faden.
    _standSichern(welt, at, takt) {
        const S = this._speicherZustand();
        this._standBesen();
        if (takt && this._aktivZeiger === welt) {
            S.ausstehend = {
                welt,
                bis: (S.ausstehend || { bis: performance.now() + AnazhRealm.STAND_TAKT.fristMs }).bis,
            };
            return;
        }
        S.ausstehend = null;
        this._standSenden(welt, at, takt);
    }

    // Der ausstehende Stand des Takts, jetzt: nur für die Welt, deren Ruf ihn verlangte (die worldId erneut geprüft), nie in
    // eine halb geladene (die Sperre des Ladens verlangt ihn nach dem Laden ganz). DER STEMPEL IST DAS ZUSAMMENSETZEN: der Stand
    // trägt die Welt dieses Augenblicks, also seine Zeit — bis zum Schnitt trug er die des Rufs (bis `fristMs` älter als sein
    // Inhalt; gate:persistence (T) 6 halbe Schreiben in 8 Toden, die Rettungs-Kette verglich `lastPlayed` mit einer Lüge).
    _standNachholen(spaeter = false) {
        const S = this._speicher;
        const a = S && S.ausstehend;
        if (!a) return;
        S.ausstehend = null;
        if (this._ladeSperre) return void (this._ladeSperre.verlangt = true);
        if (this.state.worldMeta && this.state.worldMeta.worldId === a.welt)
            this._standSenden(a.welt, Date.now(), true, spaeter);
    }

    _standSenden(welt, at, takt, spaeter = false) {
        const S = this._speicher;
        // voll: der Faden hält kein Modell dieser Welt — die Gedächtnisse der Seite bleiben, gesendet wird alles
        const voll = S.welt !== welt;
        if (voll) Object.assign(S, { edits: { ref: null, n: 0 }, ordnung: null, kopf: null });
        const { nachricht, transfer } = this._standAenderung(voll, takt);
        Object.assign(nachricht, { op: "stand", welt, at, voll });
        S.welt = welt;
        S.at = at;
        this._speicherAuftrag(nachricht, transfer, false, spaeter);
    }

    // Was die Seite vom Faden weiß: das Modell der Welt (`welt`, das JSON je Feld, die Glieder je Liste, die gesendeten Edits).
    _speicherZustand() {
        return (
            this._speicher ||
            (this._speicher = {
                faden: null,
                n: 0,
                warten: new Map(),
                welt: null,
                at: 0,
                seriell: 0,
                zeilen: new Map(),
                kopfStuecke: new Map(),
                gefegt: new Set(),
                listen: new Map(),
                edits: { ref: null, n: 0 },
                ordnung: null,
                unterwegs: null,
                // der zusammengesetzte Stand des Besens an den Faden (vor jeder anderen Nachricht und im nächsten Fenster)
                schicke() {
                    if (!this.unterwegs) return;
                    const [m, t] = this.unterwegs;
                    this.unterwegs = null;
                    this.faden.postMessage(m, t);
                },
            })
        );
    }

    // Der Besen läuft ab dem Boot in Leerlauf-Fenstern (ohne die API im nächsten Task: ohne Frist) — EINMAL gestartet; er
    // schläft, bis wieder ein Glied fällig ist (höchstens 1 s). Zuerst der ausstehende Stand des Takts: in einem Fenster mit
    // `STAND_TAKT.platzMs` Platz, sonst nach seiner Frist.
    _standBesen() {
        const S = this._speicherZustand();
        if (S.besen) return;
        S.besen = true;
        const lauf = (f) => {
            const [frist, T] = [f || { timeRemaining: () => 0, didTimeout: true }, AnazhRealm.STAND_TAKT];
            // JE BILD EIN SCHRITT (speicher.K2: kein Bild trägt mehr als ~0,1 ms): das Zusammensetzen, der Versand, das Fegen
            if (S.unterwegs) return void (S.schicke(), this._imLeerlauf(lauf, T.fristMs));
            const a = S.ausstehend;
            if (a && (frist.didTimeout || performance.now() >= a.bis || frist.timeRemaining() >= T.platzMs)) {
                this._standNachholen(true);
                if (S.unterwegs) return this._imLeerlauf(lauf, T.fristMs);
            }
            // fällig Gewordenes sammelt sich (`schlafMs`): ein Fenster prüft mehrere Glieder statt eines je Bild
            const ruhe = this._standFegen(frist);
            if (S.ausstehend) return this._imLeerlauf(lauf, Math.max(1, S.ausstehend.bis - performance.now()));
            const ms = ruhe > 0 ? Math.min(Math.max(ruhe, T.schlafMs), 1000) : 0;
            setTimeout(() => this._imLeerlauf(lauf, 1000), ms);
        };
        this._imLeerlauf(lauf, 1000);
    }

    // Die Schranke des Fadens: löst, wenn alles davor Gesendete fest ist (der Welt-Wechsel wartet auf sie).
    _speicherStill() {
        this._standNachholen();
        return this._speicher ? this._speicherAuftrag({ op: "still" }) : Promise.resolve({ ok: true });
    }

    // DAS VERLASSEN DER WELT (`_weltWechsel`): ihr Stand wird ihr Platz im localStorage (die Leser ohne Faden — die
    // Fusion, der Welt-Wechsel, die Rettungs-Kette ohne Platte — finden jede verlassene Welt dort) mit dem Stempel ihres
    // letzten Stands (`lastPlayed`; IndexedDB trägt denselben, die Rettungs-Kette wählt sie).
    async _speicherVerlassen() {
        this._standNachholen();
        const S = this._speicher;
        if (!S || !S.welt) return;
        const a = await this._speicherAuftrag({ op: "abbild", welt: S.welt });
        if (!a.daten) return;
        try {
            localStorage.setItem(this.worldStorageKey(S.welt), new TextDecoder().decode(a.daten));
            this.worldsIndexUpsert({ worldId: S.welt, lastPlayed: S.at });
        } catch (e) {
            this.log(
                `Der Platz der verlassenen Welt ließ sich nicht schreiben (${e.message}) — sie lebt in IndexedDB.`,
                "WARN"
            );
        }
    }

    // Der Stand von der Platte in die Form des Objekts (die Rettungs-Kette, Leser des Platzes): die kompakten Edits des
    // Speicher-Fadens {n, xyzr, modus} zurück nach `worldMeta.voxelEdits` (x, y, z, r Float64 little-endian, Modus-Bit 1 =
    // fill). Ein Stand ohne den Teil (vor dem Speicher-Faden) bleibt, wie er ist.
    _standNormal(s) {
        const k = s && s.voxelEdits;
        if (!k || typeof k !== "object") return s;
        const bytes = (t) => Uint8Array.from(atob(t), (c) => c.charCodeAt(0));
        const d = new DataView(bytes(k.xyzr).buffer);
        const modus = bytes(k.modus);
        if (d.byteLength !== k.n * 32) throw new Error(`voxelEdits: ${d.byteLength} Bytes für ${k.n} Edits`);
        const edits = new Array(k.n);
        for (let i = 0; i < k.n; i++) {
            const f = (j) => d.getFloat64(i * 32 + j * 8, true);
            edits[i] = { x: f(0), y: f(1), z: f(2), r: f(3), mode: modus[i >> 3] & (1 << (i & 7)) ? "fill" : "carve" };
        }
        delete s.voxelEdits;
        if (k.n) s.worldMeta = { ...(s.worldMeta || {}), voxelEdits: edits };
        return s;
    }

    // ===== IndexedDB-Persistenz =====
    // Große Welt-Snapshots leben in IndexedDB (localStorage-Wand ~5 MB je Origin, atomar je Transaktion). Es SCHREIBT allein
    // der Speicher-Faden (`_speicherAuftrag`: stand · ablegen · loeschen); die Seite liest hier beim Boot. Der winzige Index
    // (anazhRealmWorlds/Active) bleibt synchron in localStorage, dazu der Platz jeder abgelegten und verlassenen Welt.
    // Beim LESEN gewinnt IndexedDB, wenn ihr Stempel nicht älter ist (`_weltRettungsKette`).

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

    // Boot-Vorlauf (init awaitet ihn VOR der Vorlade und vor loadState): den IDB-Stand der aktiven Welt lesen und halten —
    // ob er gewinnt (frischer als der Platz) oder rettet (Platz und .bak leer oder korrupt), entscheidet die EINE
    // Rettungs-Kette `_weltRettungsKette`. Bis 10.10. lief er erst nach ensureWorldMeta: eine Welt, die nur in IndexedDB
    // lag, war da schon durch eine frische ersetzt.
    async _idbPreload() {
        this._idbPreloadedState = null;
        const activeId = this.activeWorldGet();
        const idb = activeId && (await this._idbStand(activeId));
        if (idb) this._idbPreloadedState = { worldId: activeId, ...idb };
    }

    // Der IndexedDB-Stand einer Welt in der Form der Rettungs-Kette {state, at, kaputt, bak} — null, wenn IndexedDB sie nicht
    // kennt. Leser: der Boot-Vorlauf und die Weltgrenze (was der nächste Boot lädt).
    async _idbStand(id) {
        const [rec, bak] = await Promise.all([this._idbGetWorld(id), this._idbGetWorld(id + ".bak")]);
        if (!rec && !bak) return null;
        const lies = (r) => {
            if (!r) return { state: null, at: 0, kaputt: "leer" };
            try {
                return { state: this._standNormal(JSON.parse(r.json)), at: r.at };
            } catch (e) {
                return { state: null, at: r.at, kaputt: e.message };
            }
        };
        return { ...lies(rec), bak: lies(bak) };
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
        this.journalAppend(
            "share",
            AnazhRealm._datum`Ich teilte die ${entry.label} — ihr signiertes Manifest ging hinaus.`,
            {
                world: entry.id,
            }
        );
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
        this.journalAppend(
            "growth",
            AnazhRealm._datum`Eine fremde Welt fand den Weg in deine Bibliothek: „${clean.label}".`,
            {
                world: clean.id,
                signature: signatureStatus,
            }
        );
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
        this.journalAppend(
            "growth",
            AnazhRealm._datum`Der KI-Übersetzer trug eine Welt in deine Bibliothek: „${clean.label}".`,
            {
                world: clean.id,
            }
        );
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
        this.journalAppend(
            "growth",
            AnazhRealm._datum`Der KI-Übersetzer gab „${w.label}" einen Körper — die Welt ist nun betretbar.`,
            {
                world: w.id,
            }
        );
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
        this.journalAppend(
            "growth",
            AnazhRealm._datum`Eine fremde Welt dockte an deine Bibliothek an: „${entry.label}".`,
            {
                world: entry.id,
            }
        );
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
//                Plan v2 je Ort samt Höhen und Erdbau (`_ortPlaene`), die Siedlungen der Bewohner (`_bewohnerSiedlungen`),
//                die Lichter: das wache Tor, der Licht-Pool, der die Plätze hält) —
//                sie fallen mit dem worldMeta (`_loadStateRestoreWorldMeta`)
// DER WECHSEL AM ORT (`_weltAbschied`): die Seite bleibt, was init vor der Welt schrieb (`_seite`); dazu beim Namen, weil es
// je nach Gerät vor oder nach der Welt entsteht (swiftshader legt Stoff-Pools und Uniformen erst mit dem ersten Bild an):
//   ankunft      Glieder des Zustands, die init vor der Welt schreibt und doch jede Welt neu setzt: der Leib, sein Modus,
//                das erste Weltbild — sie gehören nie zur Seite
//   seite        Glieder des Zustands, die die Seite tragen: der Renderer und seine Kette, die Bühne (Szene, Kamera, Himmel,
//                Licht, Kaskaden), jede Uniform und jede Karte, die ein bleibendes Programm liest (die Horizont-Karte der
//                Kaskaden, der Leser des Spiegels, die Umgebung des Himmels), die Stoff-Pools, der Voxel-Faden und seine
//                Zähler, die Wahl des Spielers (Tasten, Kamera, Tag-Länge), Begleiter, KI, Klang, Messung, Log, Pass, sein
//                Name, die Werkstatt (ihre Bühne)
//   wirt         Felder am Wirt, die die Seite tragen: die Fäden, ihre Hörer und Generationen, Takt und Messung, das Buch der
//                Brüche, der Tacho, die UI-Räume, jedes Programm und seine Knoten, die Atlanten (Rauschen, Karten samt ihrer
//                Back-Schlange, Laub, Blatt, Tor-Ziele, Tor-Profile), die Vorräte je Gattung (Ofen, Glieder), die Sperre und der
//                Takt des Wechsels
// Was eine Welt in eine dieser Karten malt, malt die neue neu (ihr Abschied leert sie: `_horizontKarteLeeren`).
AnazhRealm.WELT_GRENZE = Object.freeze({
    ankunft: Object.freeze([
        "playerMesh",
        "gameMode",
        "_deferredAvatarSoul",
        "_weltbildDa",
        "_weltbildWarten",
        "_nachlauf",
        "_rundumDa",
    ]),
    seite: Object.freeze([
        "renderer",
        "rendererReady",
        "_deviceLost",
        "_holzProfil",
        "_holzPixelCap",
        "_holzExplizit",
        "_traa",
        "postProcessing",
        "postProcessingFailed",
        "traaNode",
        "_traaR",
        "scenePass",
        "postProcessingUniforms",
        "godrayUniforms",
        "_ausgabeFormat",
        "_ausgabeAusgleich",
        "_ausgabeRundung",
        "_renderScaleApplied",
        "pendingDisposals",
        "scene",
        "camera",
        "skybox",
        "skyboxUniforms",
        "starField",
        "starFieldUniforms",
        "sunMesh",
        "moonMesh",
        "directionalLight",
        "ambientLight",
        "hemiLight",
        "csmNode",
        "luft",
        "atmoUniforms",
        "atmoLut",
        "seasonUniforms",
        "lodUniforms",
        "windUniforms",
        "hydroSurfaceUniforms",
        "weltLicht",
        "spiegelLeser",
        "horizontKarte",
        "_skyPmrem",
        "_skyEnvRT",
        "_foliageMatCache",
        "satzStoffe",
        "voxelWorker",
        "voxelWorkerReady",
        "voxelWorkerNextRequestId",
        "voxelWorkerStateGen",
        "keys",
        "verbTafel",
        "padBelegung",
        "keybindings",
        "keybindRebind",
        "isPointerLocked",
        "cameraMode",
        "cameraThirdDistance",
        "cameraThirdHeight",
        "mouseSensitivity",
        "dayLengthMinutes",
        "grok",
        "llm",
        "symphony",
        "perfRegulator",
        "perfSense",
        "flightRecorder",
        "logBuffer",
        "displayedLogs",
        "errorLog",
        "revokedKeys",
        "signedWorlds",
        "customWorlds",
        "vibePass",
        "workshop",
        "player.name",
    ]),
    wirt: Object.freeze([
        "_speicher",
        "_speicherOhnePlatte",
        "_nebenFaeden",
        "_voxelFadenQuelle",
        "_hydroWelt",
        "_stauHoert",
        "_fernMemoGen",
        "_takt",
        "_gpuLeine",
        "_ltObs",
        "_ltAcc",
        "_uploadBytesAcc",
        "_uploadBuckets",
        "_gpuTsKickMs",
        "_gpuTsPending",
        "_gpuTsLast",
        "_gpuTsAtMs",
        "_pipeLast",
        "_bruchBuch",
        "_kernWandGeprueft",
        "_fahrTachoEl",
        "_uiRooms",
        "_uiDirtyRooms",
        "_uiPulseQueued",
        "_foundryMats",
        "_foundryGraphen",
        "_naesseHimmelK",
        "_leuchtOhne",
        "_leuchtKnoten",
        "_instanzMatrixKnoten",
        "_weltNahtKnoten",
        "_instanzMitteKnoten",
        "_baumWindKnoten",
        "_karteWindU",
        "_kamDurchKnoten",
        "_szeneTiefeKnoten",
        "_szeneTiefeWert",
        "_phantomTintU",
        "_ghostMatCache",
        "_stlWegeMat",
        "_membranGraphen",
        "_kaskadenS",
        "_blendeK",
        "_feldPanoWgslText",
        "_feldPanoPipe",
        "_feldPanoPipeDev",
        "_tiefenAbbildGpu",
        "_spiegelMass",
        "_rauschAtlasCache",
        "_kartenAtlas",
        "_impostorBakeQueue",
        "_foliageAtlasTex",
        "_blattAtlasBild",
        "_torZielAtlas",
        "_torProfile",
        "_karteBuehneSatz",
        "_karteRechnerSatz",
        "_ofenVorratSteht",
        "_gliederAuftraege",
        "_gliedKapseln",
        "_trefferGliedNamen",
        "_weltWechselSperre",
        "_weltTausch",
    ]),
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
        "_bewohnerSiedlungen",
        "_portalLeuchte",
        "_leuchtPool",
    ]),
});
// must-preserve (taille-spec §2): Größen-Wand für unbekannte Felder (ein Riesen-Feld ist ein
// Quota-DoS) + die known-Sätze der Serialize/Restore-Zwillinge; was hier NICHT steht, reist als
// opakes Unbekanntes (_carryUnknown).
AnazhRealm.TAILLE_UNKNOWN_FIELD_MAX = 8192;
// Die leere Reihe der Stand-Tafel (eine Marke vergleicht Identität: nie je Ruf ein neues [])
AnazhRealm.STAND_LEER = Object.freeze([]);
// DER STAND DES TAKTS im Leerlauf (`_standSichern`): spätestens `fristMs` nach dem Ruf, vorher nur in einem Fenster mit `platzMs`;
// der Besen schläft, bis ein Glied fällig ist, mindestens `schlafMs`, und fegt je Fenster höchstens `fegeMs`
AnazhRealm.STAND_TAKT = Object.freeze({ fristMs: 1000, platzMs: 4, schlafMs: 100, fegeMs: 0.05 });
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
    // Das KLINGEN-Labor: 22 Gattungen (Waffen + Werkzeuge), 4 Traditionen, Anschlag-Probe + Prüfstand.
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
        desc: "Das Klingen-Labor: Rückgrat, Schnittprofil und Lehren urteilen die Waffe — 22 Gattungen, 4 Traditionen, Anschlag-Probe und Prüfstand.",
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
