class AnazhRealm_Z12 {
    // ===== ATLAS §12 · PERSISTENZ/TAILLE — Snapshot · Restore · IndexedDB · Ω-Zwillinge =====
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
                edgeSharp:
                    this.state.atmosphere && Number.isFinite(this.state.atmosphere.edgeSharp)
                        ? this.state.atmosphere.edgeSharp
                        : 0.5,
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
                ...(a.chimney && Number.isFinite(a.chimney.x) ? { chimney: a.chimney } : {}),
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

    // → true, wenn der Stand geschrieben wurde (localStorage oder, bei voller Quota, IndexedDB); false, wenn die Sperre
    // des Welt-Wechsels verweigert — laut, nie still (der Rufer „speichere zustand" sagt es dem Spieler).
    saveState() {
        // DIE SPERRE DES WELT-WECHSELS (`_weltWechselNeuLaden`): die Seite stirbt gleich, ihr Speicher gehört der Ziel-Welt.
        if (this._weltWechselSperre) {
            this.log(
                "Speichern verweigert: die Seite wechselt die Welt (der Reload läuft) — dieser Stand bleibt ungesichert.",
                "WARN"
            );
            return false;
        }
        const stateToSave = this.buildStateSnapshot();
        // Pro Welt eigener Key + lastPlayed im Index. Ohne worldId (nach ensureWorldMeta unmöglich) auf den
        // Legacy-Key zurück, damit nichts still verloren geht.
        const worldId = this.state.worldMeta && this.state.worldMeta.worldId;
        // Snapshot-JSON EINMAL bauen: IndexedDB trägt ihn IMMER (async), localStorage ist schneller Spiegel +
        // Fallback — wirft es QUOTA, hat IndexedDB die Welt schon.
        const json = JSON.stringify(stateToSave);
        if (worldId) {
            this._idbPutWorld(worldId, json).then((ok) => {
                if (!ok && !this._idbWarned) {
                    this._idbWarned = true;
                    this.log("IndexedDB nicht verfügbar — Welten leben allein im localStorage (5-MB-Wand).", "WARN");
                }
            });
        }
        try {
            if (worldId) {
                // Rotierender Backup: den bisherigen guten Stand VOR dem Überschreiben in den `.bak`-Slot retten
                // (ein korrupter Write vernichtet ihn nicht); best-effort — Quota am Backup wird geschluckt.
                try {
                    const prevGood = localStorage.getItem(this.worldStorageKey(worldId));
                    if (prevGood) localStorage.setItem(this.worldStorageKey(worldId) + ".bak", prevGood);
                } catch (_bakErr) {
                    /* Backup ist best-effort — der Haupt-Pfad + IndexedDB tragen die Welt */
                }
                localStorage.setItem(this.worldStorageKey(worldId), json);
                this.worldsIndexUpsert({
                    worldId,
                    slug: this.state.worldMeta.slug || "",
                    bornAt: this.state.worldMeta.bornAt || Date.now(),
                    lastPlayed: Date.now(),
                });
                this.activeWorldSet(worldId);
            } else {
                localStorage.setItem("anazhRealmState", json);
            }
            const lastVersion = this.state.versionHistory[this.state.versionHistory.length - 1];
            if (lastVersion !== this.state.currentVersion) {
                this.state.versionHistory.push(this.state.currentVersion);
            }
            if (this.state.versionHistory.length > this.state.maxVersionHistoryEntries) {
                this.state.versionHistory = this.state.versionHistory.slice(-this.state.maxVersionHistoryEntries);
            }
            localStorage.setItem("anazhRealmVersions", JSON.stringify(this.state.versionHistory));
            this.log("Zustand in localStorage gespeichert", "DEBUG");
        } catch (error) {
            // V18.151 — die QUOTA-Wand fällt weich: IndexedDB trägt die Welt
            // (der Schreiber oben lief schon); ehrlich loggen statt ERROR-Panik.
            this.log(
                `localStorage-Spiegel voll/fehlgeschlagen (${error.message}) — die Welt lebt in IndexedDB weiter.`,
                "WARN"
            );
        }
        return true;
    }

    // Debounced Edit-Save: bündelt die schwere Persistenz (buildStateSnapshot + JSON.stringify +
    // localStorage.setItem) eines Carve-/Place-Bursts in EINEN Save ~1.2 s nach dem letzten Hit.
    // Der Edit liegt sofort in `worldMeta.voxelEdits` (kein Datenverlust); ein anderer saveState schreibt
    // die aktuelle Welt sofort und macht den Timer redundant. Headless feuert der Timer erst im Idle.
    _scheduleEditSave() {
        if (typeof this.saveState !== "function") return;
        if (this._editSaveTimer) clearTimeout(this._editSaveTimer);
        this._editSaveTimer = setTimeout(() => {
            this._editSaveTimer = null;
            this.saveState();
        }, 1200);
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

    // ### Vibe-Pass: die souveräne Avatar-Identität ###
    // Ed25519-Schlüsselpaar, lokal beim ersten Erwachen erzeugt: der öffentliche Schlüssel IST der Avatar,
    // der private signiert Werke. crypto.subtle trägt Ed25519 nativ (kein Vendoring); nur im Secure
    // Context (https/localhost) — sonst degradieren die Methoden anmutig.
}
