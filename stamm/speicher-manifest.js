class AnazhRealm_speicher_manifest {
    // ===== ATLAS · Speicher/manifest — Fremde Welten empfangen: die Welt-Bibliothek (Register und Importierte) · Manifest-Export und -Import · KI-Übersetzer (Manifest, Szene) · Vendoring =====
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

    // Der EINE Name-Leser der Welten (spielgang.K5): eine eingebaute Welt (WORLD_REGISTRY) zeigt die Zeile ihres Schlüssels
    // (`name` / `desc`) in der Sprache des Spielers; eine empfangene, KI-übersetzte oder angedockte Welt trägt den Inhalt
    // ihres Autors — er bleibt, wie er geschrieben wurde. `label` bleibt die Identität (s. WORLD_REGISTRY).
    _weltName(w) {
        const z = this._weltNameZeile(w);
        return Array.isArray(z) ? this._t(z[0]) : z;
    }
    // derselbe Name als Wert einer Zeile: die eingebaute Welt als Schlüssel (er wechselt mit der Sprache), die fremde als Daten
    _weltNameZeile(w) {
        const eingebaut = w && AnazhRealm.WORLD_REGISTRY[w.id] === w;
        return eingebaut ? [w.name] : (w && (w.label || w.id)) || "?";
    }

    _weltText(w) {
        const eingebaut = w && AnazhRealm.WORLD_REGISTRY[w.id] === w;
        return eingebaut ? this._t(w.desc) : w && typeof w.desc === "string" ? w.desc : "";
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
            label: this._weltName(w),
            desc: this._weltText(w),
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
        prof.stage = this._t(prof.hasDsl ? "bib.stufe.uebersetzt" : "bib.stufe.ausgestellt");
        prof.stageTitle = this._t(prof.hasDsl ? "bib.stufe.uebersetzt-titel" : "bib.stufe.ausgestellt-titel");
        // Herkunfts-Marke — die Klassen-Hooks bleiben (.library-vendored-/translated-/imported-mark, Tests).
        if (prof.vendored) {
            prof.origin = this._t("bib.herkunft.angedockt");
            prof.originClass = "library-vendored-mark";
            prof.originTitle = this._t("bib.herkunft.angedockt-titel");
        } else if (prof.translated) {
            prof.origin = this._t("bib.herkunft.ki-uebersetzt");
            prof.originClass = "library-translated-mark";
            prof.originTitle = this._t("bib.herkunft.ki-uebersetzt-titel");
        } else if (prof.imported) {
            prof.origin = this._t("bib.herkunft.empfangen");
            prof.originClass = "library-imported-mark";
            prof.originTitle = this._t("bib.herkunft.empfangen-titel");
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
            // die Beschreibung reist als Text (Browse-Text, keine Substanz): eine eingebaute in der Sprache des Teilenden
            desc: this._weltText(entry),
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
        this.journalAppend("share", ["journal.geteilt", { welt: this._weltNameZeile(entry) }], {
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
        this.journalAppend("growth", ["journal.welt-fremd", { welt: clean.label }], {
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
        this.journalAppend("growth", ["journal.ki-welt", { welt: clean.label }], {
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
        this.journalAppend("growth", ["journal.ki-koerper", { welt: w.label }], {
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
        this.journalAppend("growth", ["journal.welt-dockt", { welt: entry.label }], {
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
_stammZonen(AnazhRealm, [AnazhRealm_speicher_manifest]);

// ===== ATLAS · Speicher/manifest — Außen-Konstanten =====
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
// DIE NAMEN (spielgang.K5): `label` ist die IDENTITÄT der Welt, kein Anzeige-Text — signierte Substanz
// (`_canonicalManifest`, spec/golden/v1/world-manifest.json), Ziel-Wort von `aimBlueprintAtWorld`, portalMeta in jedem
// Speicher, Mesh-Einladung, Wort-Katalog der Studio-Brücke; sie IST die de-Zeile ihres `name` (ein Getter auf die Tafel —
// bis w5-spielgang-k5 ein deutscher Zwilling der Zeile im Code). Angezeigt wird nur `name` (der Schlüssel der Tafel) und `desc` (der Schlüssel der Beschreibung) — über den EINEN
// Name-Leser `_weltName` / `_weltText`.
AnazhRealm.WORLD_REGISTRY = Object.freeze({
    skeleton: Object.freeze({
        id: "skeleton",
        // die deutsche Daten-Zeile ihres Namens (Speicher, Mesh, Wort-Katalog): gelesen aus der de-Spalte, nie ein Zwilling
        get label() {
            return AnazhRealm.TEXTE.de[this.name];
        },
        name: "welt.katalog.skeleton.name",
        world: AnazhRealm.PORTAL_SKELETON_WORLD,
        dsl: Object.freeze(["skybox_color"]),
        desc: "welt.katalog.skeleton.text",
    }),
    fluid: Object.freeze({
        id: "fluid",
        // die deutsche Daten-Zeile ihres Namens (Speicher, Mesh, Wort-Katalog): gelesen aus der de-Spalte, nie ein Zwilling
        get label() {
            return AnazhRealm.TEXTE.de[this.name];
        },
        name: "welt.katalog.fluid.name",
        world: "worlds/fluid/index.html",
        dsl: Object.freeze(["weather", "skybox_color", "sturm", "ruhe", "set_turbulence"]),
        desc: "welt.katalog.fluid.text",
    }),
    terrain: Object.freeze({
        id: "terrain",
        // die deutsche Daten-Zeile ihres Namens (Speicher, Mesh, Wort-Katalog): gelesen aus der de-Spalte, nie ein Zwilling
        get label() {
            return AnazhRealm.TEXTE.de[this.name];
        },
        name: "welt.katalog.terrain.name",
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
        desc: "welt.katalog.terrain.text",
    }),
    // Das FAHRZEUG-Labor (Rahmen · Gelenke · Lehren · Baukörper · Haut + Probefahrt), dasselbe
    // Vorlagen-Organ wie phytogenesis. DSL = die echten UI-Pfade: Gattungs-Presets + Kultur-Vektoren +
    // probefahrt/werkstatt (Fahr-Modus rein/raus).
    garage: Object.freeze({
        id: "garage",
        // die deutsche Daten-Zeile ihres Namens (Speicher, Mesh, Wort-Katalog): gelesen aus der de-Spalte, nie ein Zwilling
        get label() {
            return AnazhRealm.TEXTE.de[this.name];
        },
        name: "welt.katalog.garage.name",
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
        desc: "welt.katalog.garage.text",
    }),
    // Das TOR-Labor: sieben Ordnungen (Drachentor bis Maurentor), Stich→Schub→Dicke-Lehre, fraktale
    // Tiefe, begehbare Türen (E/R).
    portale: Object.freeze({
        id: "portale",
        // die deutsche Daten-Zeile ihres Namens (Speicher, Mesh, Wort-Katalog): gelesen aus der de-Spalte, nie ein Zwilling
        get label() {
            return AnazhRealm.TEXTE.de[this.name];
        },
        name: "welt.katalog.portale.name",
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
        desc: "welt.katalog.portale.text",
    }),
    // Das KLINGEN-Labor: 22 Gattungen (Waffen + Werkzeuge), 4 Traditionen, Anschlag-Probe + Prüfstand.
    // schmiede-core.js (__schmiedeCore) ist die EINE generative Quelle für Shell UND Foundry. DSL = echte
    // UI-Pfade: Gattungen + Traditionen (Umlaute ASCII-gefaltet: saebel/grossschwert/faellaxt) +
    // anschlagen + stahl.
    schmiede: Object.freeze({
        id: "schmiede",
        // die deutsche Daten-Zeile ihres Namens (Speicher, Mesh, Wort-Katalog): gelesen aus der de-Spalte, nie ein Zwilling
        get label() {
            return AnazhRealm.TEXTE.de[this.name];
        },
        name: "welt.katalog.schmiede.name",
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
        desc: "welt.katalog.schmiede.text",
    }),
    // Das HAUS-Labor: Fachwerkhaus, parametrisch + begehbar — 32 Kultur-Archetypen, Dorf-Modus
    // (Straßengraph, Mauer, Jahresringe). fachwerk-core.js (__fachwerkCore) ist die EINE generative
    // Quelle für Shell UND Foundry, inkl. Dorf-Quelle + exportSettlement. DSL = echte UI-Pfade: die 32
    // Kulturen über #pK (change) + "dorf"/"haus" über #pDorf.
    fachwerk: Object.freeze({
        id: "fachwerk",
        // die deutsche Daten-Zeile ihres Namens (Speicher, Mesh, Wort-Katalog): gelesen aus der de-Spalte, nie ein Zwilling
        get label() {
            return AnazhRealm.TEXTE.de[this.name];
        },
        name: "welt.katalog.fachwerk.name",
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
        desc: "welt.katalog.fachwerk.text",
    }),
    // Das MUSIK-Labor: 22 Genre-Presets aus Kompositions-Gesetzen + sechs DNA-Dials. klang-core.js
    // (__klangCore, meshfrei) ist die EINE Musik-Daten-Quelle (das Host-Lofi liest Tempo + Skala,
    // KLANG_HOST_RECIPE). DSL = die Genre-Buttons (#presets .presetBtn → applyPreset; Wörter =
    // lowercase-Lab-Namen; die Buch-id-Ausnahmen modern-klang/barock-klang gelten nur dem Buch).
    klang: Object.freeze({
        id: "klang",
        // die deutsche Daten-Zeile ihres Namens (Speicher, Mesh, Wort-Katalog): gelesen aus der de-Spalte, nie ein Zwilling
        get label() {
            return AnazhRealm.TEXTE.de[this.name];
        },
        name: "welt.katalog.klang.name",
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
        desc: "welt.katalog.klang.text",
    }),
    // Das MENSCHEN-Labor: Morph-Dials · Haar/Kleidung · acht Bewegungs-/Emotionsprofile · Ninja-Park.
    // koerper-core.js (__koerperCore, meshfrei) ist die EINE Gestalt-/Motion-Daten-Quelle.
    // DSL = #emotions-Buttons (data-e → emo.set) + zufall/zuruecksetzen (btnRandom/btnReset).
    koerperstudio: Object.freeze({
        id: "koerperstudio",
        // die deutsche Daten-Zeile ihres Namens (Speicher, Mesh, Wort-Katalog): gelesen aus der de-Spalte, nie ein Zwilling
        get label() {
            return AnazhRealm.TEXTE.de[this.name];
        },
        name: "welt.katalog.koerperstudio.name",
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
        desc: "welt.katalog.koerperstudio.text",
    }),
    // Das KREATUREN-Labor: Wolf/Fuchs/Bär/Hirsch aus fünf allometrischen Dials, CPG-Gangnetz + sechs
    // Bewegungsprofile. tetrapoda-core.js (__tetrapodaCore, meshfrei) ist die EINE Gestalt-/Motion-
    // Quelle (Erstkonsument `_motionStudioProfile`). DSL = Gattungs-Buttons (#presets, data-p) +
    // Profil-Buttons (#emotions, data-e); Wörter deutsch, ASCII-gefaltet (baer).
    tetrapoda: Object.freeze({
        id: "tetrapoda",
        // die deutsche Daten-Zeile ihres Namens (Speicher, Mesh, Wort-Katalog): gelesen aus der de-Spalte, nie ein Zwilling
        get label() {
            return AnazhRealm.TEXTE.de[this.name];
        },
        name: "welt.katalog.tetrapoda.name",
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
        desc: "welt.katalog.tetrapoda.text",
    }),
    // Die erste UNTRUSTED Welt: fremde 2D-Boids-Engine im null-origin-iframe. trust:"sandboxed" → das
    // Portal entzieht allow-same-origin: voller Lauf drinnen, null Reichweite raus.
    schwarm: Object.freeze({
        id: "schwarm",
        // die deutsche Daten-Zeile ihres Namens (Speicher, Mesh, Wort-Katalog): gelesen aus der de-Spalte, nie ein Zwilling
        get label() {
            return AnazhRealm.TEXTE.de[this.name];
        },
        name: "welt.katalog.schwarm.name",
        world: "worlds/schwarm/index.html",
        dsl: Object.freeze(["sturm", "ruhe", "schwaermen", "skybox_color"]),
        desc: "welt.katalog.schwarm.text",
        trust: "sandboxed",
    }),
    // Ko-Präsenz-Welt: eine fremde single-player-Engine, die das Ko-Präsenz-Protokoll deklariert
    // (peer-join/peer-state/peer-leave); das Mesh liefert die Posen der Gefährten, die Welt rendert sie
    // selbst. Null-origin sandgesichert (das Protokoll quert die volle Wand).
    begegnung: Object.freeze({
        id: "begegnung",
        // die deutsche Daten-Zeile ihres Namens (Speicher, Mesh, Wort-Katalog): gelesen aus der de-Spalte, nie ein Zwilling
        get label() {
            return AnazhRealm.TEXTE.de[this.name];
        },
        name: "welt.katalog.begegnung.name",
        world: "worlds/begegnung/index.html",
        dsl: Object.freeze([]),
        desc: "welt.katalog.begegnung.text",
        trust: "sandboxed",
        coPresence: true,
    }),
});
