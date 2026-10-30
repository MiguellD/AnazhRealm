class AnazhRealm_werkstatt_sozial {
    // ===== ATLAS · Werkstatt/sozial — Welt-Info · Bibliothek · Feed · Wertungen · Kommentare =====
    // ### Welt-Tor ###
    // Welt-Info im Welt-Drawer: Identität, Alter, Erinnerungen. Export = Save-Snapshot mit slug im
    // Dateinamen; Import = File-Picker für jeden gültigen Snapshot.

    initWorldInfoUI() {
        // Die Welt-Verwaltung lebt im Welt-Manager (Bibliothek); die Einstellungen tragen nur Präferenzen.
        // „Neue Welt" öffnet _openNewWorldDialog; die Liste anderer Welten rendert updateWorldInfo.
        const newBtn = document.getElementById("world-new");
        if (newBtn) {
            newBtn.addEventListener("click", () => this._openNewWorldDialog());
        }
        // TEILEN in EINER Geste: die Welt als Code (`teileWelt`), dieselbe Zeile wie das Werk der Werkstatt
        const teilen = document.getElementById("world-teilen");
        if (teilen) this._teilenZeile(teilen, "welt", () => this.teileWelt());
        this.updateWorldInfo();
    }

    // Welt-Erstellungs-Dialog (native <dialog>) mit drei Pfaden:
    //   1) Allein → private Welt (createNewWorld)
    //   2) Host → createNewWorld mit role="host", Auto-Start P2P nach dem Wechsel, Host-Banner (den Code gibt `teileWelt`)
    //   3) Joinen → der Welt-Code (`empfangeWerk` → `_weltBeitritt`: world-request → world-snapshot → _importGuestWorld → Wechsel)
    _openNewWorldDialog() {
        const dialog = document.getElementById("new-world-dialog");
        if (!dialog || typeof dialog.showModal !== "function") {
            // Fallback wenn <dialog> nicht supported (alte Browser, headless?)
            this._openNewWorldDialogLegacy();
            return;
        }
        const slugInput = document.getElementById("new-world-slug");
        const modeRadios = dialog.querySelectorAll('input[name="new-world-mode"]');
        const roleFieldset = dialog.querySelector(".new-world-role");
        const roleRadios = dialog.querySelectorAll('input[name="new-world-role"]');
        const joinRow = document.getElementById("new-world-join-row");
        const inviteInput = document.getElementById("new-world-invite");
        const inheritInput = document.getElementById("new-world-inherit");
        const statusEl = document.getElementById("new-world-status");
        const cancelBtn = document.getElementById("new-world-cancel");
        const confirmBtn = document.getElementById("new-world-confirm");

        // Reset state bei jedem Öffnen
        slugInput.value = "";
        inviteInput.value = "";
        inheritInput.checked = false;
        statusEl.textContent = "";
        confirmBtn.disabled = false;
        // Mode default auf solo
        for (const r of modeRadios) r.checked = r.value === "solo";
        for (const r of roleRadios) r.checked = r.value === "host";
        roleFieldset.hidden = true;
        joinRow.hidden = true;

        const updateConditionals = () => {
            const mode = dialog.querySelector('input[name="new-world-mode"]:checked').value;
            const role = dialog.querySelector('input[name="new-world-role"]:checked').value;
            roleFieldset.hidden = mode !== "multi";
            joinRow.hidden = !(mode === "multi" && role === "join");
        };
        for (const r of modeRadios) r.addEventListener("change", updateConditionals);
        for (const r of roleRadios) r.addEventListener("change", updateConditionals);

        const cleanup = () => {
            // Listener entfernen verhindert doppelte Bindings bei Re-Open
            for (const r of modeRadios) r.removeEventListener("change", updateConditionals);
            for (const r of roleRadios) r.removeEventListener("change", updateConditionals);
            cancelBtn.removeEventListener("click", onCancel);
            confirmBtn.removeEventListener("click", onConfirm);
        };

        const onCancel = () => {
            cleanup();
            dialog.close();
        };

        const onConfirm = async () => {
            const mode = dialog.querySelector('input[name="new-world-mode"]:checked').value;
            const slug = slugInput.value.trim();
            const inherit = !!inheritInput.checked;
            // V9.35 Phase 5c.2.c.2 — Voxel ist permanent; die V9.23-Heightfield-
            // Opt-out-Checkbox ist entfallen, `voxelTerrain` ist immer true.
            confirmBtn.disabled = true;
            statusEl.textContent = "";

            if (mode === "solo") {
                const id = this.createNewWorld({
                    slug: slug || null,
                    inheritPlayer: inherit,
                    reload: true,
                    role: "solo",
                });
                if (!id) statusEl.textContent = "Welt konnte nicht erschaffen werden — siehe Konsole.";
                cleanup();
                if (id) dialog.close();
                else confirmBtn.disabled = false;
                return;
            }

            const role = dialog.querySelector('input[name="new-world-role"]:checked').value;
            if (role === "host") {
                const id = this.createNewWorld({
                    slug: slug || null,
                    inheritPlayer: inherit,
                    reload: true,
                    role: "host",
                });
                if (!id) {
                    statusEl.textContent = "Welt konnte nicht erschaffen werden.";
                    confirmBtn.disabled = false;
                    return;
                }
                cleanup();
                dialog.close();
                return;
            }

            // role === "join"
            const code = inviteInput.value.trim();
            if (!code) {
                statusEl.textContent = "Bitte Einladungs-Code eingeben.";
                confirmBtn.disabled = false;
                return;
            }
            statusEl.textContent = "Verbinde mit Host…";
            const result = await this.empfangeWerk(code, { slugHint: slug || null });
            if (!result.ok) {
                statusEl.textContent = `${AnazhRealm.WERK_CODE.grund[result.grund.split(":")[0]]} (${result.grund})`;
                confirmBtn.disabled = false;
                return;
            }
            statusEl.textContent = "Welt empfangen — lade…";
            cleanup();
            dialog.close();
            // (die Tür lädt in die Gast-Welt: `_weltBeitritt` → `_importGuestWorld` → `_weltBetreten`)
        };

        cancelBtn.addEventListener("click", onCancel);
        confirmBtn.addEventListener("click", onConfirm);
        try {
            dialog.showModal();
        } catch {
            // Fallback bei modal-Konflikten
            this._openNewWorldDialogLegacy();
        }
    }

    // Legacy-Fallback (prompt/confirm) für Umgebungen ohne <dialog>-Support
    // oder bei UI-Fehlern. Ring 8 Original-Pfad.
    _openNewWorldDialogLegacy() {
        let slugRaw = "";
        try {
            slugRaw = window.prompt("Wie soll die neue Welt heißen? (leer = automatisch)", "") || "";
        } catch {
            slugRaw = "";
        }
        const slug = slugRaw.trim();
        let inherit = false;
        try {
            inherit = window.confirm(
                "Bisherige Person übernehmen?\n\n" +
                    "OK: deine Werkzeuge, Seele, eigene Materialien + Baupläne wandern mit.\n" +
                    "Abbrechen: frische Person in der neuen Welt."
            );
        } catch {
            inherit = false;
        }
        const newId = this.createNewWorld({ slug: slug || null, inheritPlayer: inherit, reload: true });
        if (!newId) {
            try {
                window.alert("Neue Welt konnte nicht erschaffen werden. Siehe Konsole.");
            } catch {
                /* headless */
            }
        }
    }

    updateWorldInfo() {
        // updateWorldInfo ist der EINE Refresh-Takt für ALLE Welt-Anzeigen (Insel · Stammbaum · Tagebuch ·
        // Picker · Multiplayer-Banner). Der #world-info-Teil läuft nur, falls das Element existiert — kein
        // early-return, sonst verschluckt er die Bibliothek-Renders.
        const info = document.getElementById("world-info");
        if (info) {
            const m = this.state.worldMeta || {};
            const ageDays = m.bornAt ? Math.floor((Date.now() - m.bornAt) / 86400000) : 0;
            const parents = Array.isArray(m.parentWorlds) ? m.parentWorlds.length : 0;
            const idShort = (m.worldId || "?").slice(0, 8);
            const archCount = (this.state.architectures || []).length;
            const bpCount = Object.keys(this.state.blueprints || {}).length;
            const journalCount = (this.state.worldJournal && this.state.worldJournal.entries.length) || 0;
            info.innerHTML = "";
            const line1 = document.createElement("div");
            line1.textContent = `Name: ${m.slug || "(noch namenlos)"}  |  ID: ${idShort}…`;
            const line2 = document.createElement("div");
            line2.textContent = `Alter: ${ageDays} Tag${ageDays === 1 ? "" : "e"}  |  Eltern-Welten: ${parents}`;
            const line3 = document.createElement("div");
            line3.textContent = `Inventar: ${archCount} Bauwerke, ${bpCount} Baupläne, ${journalCount} Erinnerungen`;
            info.appendChild(line1);
            info.appendChild(line2);
            info.appendChild(line3);
        }
        this._renderActiveWorldIsland();
        this.renderWorldJournal();
        this._renderWorldPicker();
        this._renderWorldLineage();
        this._renderHostBanner();
        this._renderGuestBanner();
    }

    // Host-Banner, nur bei worldMeta.role === "host": der Stand des Raums. Den Code trägt die EINE Geste (`teileWelt`, die
    // Teilen-Zeile der Bibliothek) — signiert, im Format jedes geteilten Werks.
    _renderHostBanner() {
        const banner = document.getElementById("world-host-banner");
        if (!banner) return;
        const p2p = this.state.p2p || {};
        banner.hidden = !(this.state.worldMeta && this.state.worldMeta.role === "host");
        const peerCount = (p2p.peers && p2p.peers.size) || 0;
        banner.innerHTML = banner.hidden
            ? ""
            : `<strong>Du hostest diese Welt.</strong> Status: ${p2p.connected ? "Bereit für Mitspieler" : "Verbinde…"}${
                  peerCount > 0 ? ` (${peerCount} verbunden)` : ""
              } — den Code gibt „Teilen" in der Bibliothek.`;
    }

    // Ring 11.5: Guest-Banner. Sichtbar wenn worldMeta.role === "guest".
    // Zeigt die Host-Verbindungs-Info als Orientierung.
    _renderGuestBanner() {
        const banner = document.getElementById("world-guest-banner");
        if (!banner) return;
        const role = this.state.worldMeta && this.state.worldMeta.role;
        if (role !== "guest") {
            banner.hidden = true;
            banner.innerHTML = "";
            return;
        }
        const hostInfo = this.state.worldMeta.hostInfo || {};
        const connected = this.state.p2p && this.state.p2p.connected;
        const peerCount = (this.state.p2p && this.state.p2p.peers && this.state.p2p.peers.size) || 0;
        banner.hidden = false;
        banner.innerHTML = "";
        const line1 = document.createElement("div");
        line1.innerHTML = `<strong>Du bist Gast in dieser Welt.</strong> Status: ${
            connected ? "Verbunden" : "Verbinde…"
        }${peerCount > 0 ? ` (${peerCount} im Raum)` : ""}`;
        const line2 = document.createElement("div");
        line2.style.marginTop = "0.35em";
        line2.style.fontSize = "0.88em";
        const url = hostInfo.url || "?";
        const room = hostInfo.roomId ? hostInfo.roomId.slice(0, 8) + "…" : "?";
        line2.textContent = `Host: ${url} · Raum: ${room}`;
        banner.appendChild(line1);
        banner.appendChild(line2);
    }

    // Welt-Picker: die anderen Welten im Index (die aktive ausgeblendet), je Eintrag slug + Alter +
    // „wechseln"/„löschen".
    _renderWorldPicker() {
        const list = document.getElementById("world-picker-list");
        if (!list) return;
        const idx = this.worldsIndexLoad();
        const activeId = (this.state.worldMeta && this.state.worldMeta.worldId) || null;
        const others = idx.filter((e) => e.worldId !== activeId);
        list.innerHTML = "";
        if (others.length === 0) {
            list.textContent = "Nur diese eine Welt im Speicher.";
            return;
        }
        // Frisch sortieren: zuletzt gespielt zuerst.
        others.sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0));
        for (const entry of others) {
            const row = document.createElement("div");
            row.className = "world-picker-row";
            row.style.cssText =
                "display:flex; align-items:center; gap:0.5em; margin:0.3em 0; padding:0.3em 0; border-bottom:1px solid var(--brass-faint, rgba(160,120,60,0.18));";
            const label = document.createElement("div");
            label.style.cssText = "flex:1; min-width:0;";
            const ageDays = entry.bornAt ? Math.floor((Date.now() - entry.bornAt) / 86400000) : 0;
            label.textContent = `${entry.slug || "(namenlos)"} — ${ageDays}d, ID ${entry.worldId.slice(0, 8)}…`;
            const switchBtn = document.createElement("button");
            switchBtn.type = "button";
            switchBtn.textContent = "wechseln";
            switchBtn.addEventListener("click", () => {
                this.switchToWorld(entry.worldId, { reload: true });
            });
            const recipesBtn = document.createElement("button");
            recipesBtn.type = "button";
            recipesBtn.textContent = "Rezepte holen";
            recipesBtn.title = "Baupläne + Materialien + Werkzeuge aus dieser Welt in die aktive importieren";
            recipesBtn.addEventListener("click", () => {
                let confirmed = false;
                try {
                    confirmed = window.confirm(
                        `Rezepte aus „${entry.slug}" in deine aktuelle Welt importieren? Konflikte bekommen -import-Suffix.`
                    );
                } catch {
                    confirmed = true;
                }
                if (!confirmed) return;
                const result = this.importRecipesFromWorld(entry.worldId);
                const chatOutput = document.getElementById("chat-output");
                if (chatOutput) {
                    const line = document.createElement("div");
                    if (result.ok) {
                        const c = result.counts;
                        line.textContent = `Aus „${entry.slug}" empfangen: ${c.blueprints} Baupläne, ${c.materials} Materialien, ${c.tools} Werkzeuge.`;
                    } else {
                        line.textContent = `Rezept-Import fehlgeschlagen: ${result.reason}`;
                    }
                    chatOutput.appendChild(line);
                    chatOutput.scrollTop = chatOutput.scrollHeight;
                }
            });
            const delBtn = document.createElement("button");
            delBtn.type = "button";
            delBtn.textContent = "löschen";
            delBtn.addEventListener("click", () => {
                let confirmed = false;
                try {
                    confirmed = window.confirm(
                        `Welt „${entry.slug}" wirklich löschen? Das kann nicht rückgängig gemacht werden.`
                    );
                } catch {
                    confirmed = true;
                }
                if (confirmed) {
                    this.deleteWorld(entry.worldId);
                    this._renderWorldPicker();
                }
            });
            row.appendChild(label);
            row.appendChild(switchBtn);
            row.appendChild(recipesBtn);
            row.appendChild(delBtn);
            list.appendChild(row);
        }
    }

    // Gescrolltes Tagebuch im Welt-Drawer: alle Erinnerungen, jüngste oben.
    // Wird jeweils komplett neu gerendert; bei entryCap = 200 ist DOM-Cost
    // gering. Aufruf-Takt = `updateWorldInfo` (5s im Game-Loop).
    renderWorldJournal() {
        const list = document.getElementById("world-journal-list");
        const countEl = document.getElementById("world-journal-count");
        if (!list) return;
        const entries = (this.state.worldJournal && this.state.worldJournal.entries) || [];
        if (countEl) {
            countEl.textContent =
                entries.length === 0
                    ? "Keine Erinnerungen"
                    : `${entries.length} Erinnerung${entries.length === 1 ? "" : "en"}`;
        }
        // Cache-Signatur: Anzahl + jüngster Eintrag (Inhalt + Zeit). Wenn
        // unverändert, DOM nicht anrühren — der Aufruf läuft alle 5s.
        const lastEntry = entries.length > 0 ? entries[entries.length - 1] : null;
        const signature = entries.length + ":" + (lastEntry ? `${lastEntry.id}:${lastEntry.at}` : "0");
        if (list.dataset.signature === signature) return;
        list.dataset.signature = signature;
        list.innerHTML = "";
        if (entries.length === 0) {
            const empty = document.createElement("div");
            empty.className = "journal-empty";
            empty.textContent = "Noch keine Erinnerungen geschrieben.";
            list.appendChild(empty);
            return;
        }
        const now = Date.now();
        // Jüngste zuerst — das Tagebuch liest sich rückwärts wie ein
        // Logbuch. Erste Genesis bleibt aber durch Scrollen erreichbar.
        for (let i = entries.length - 1; i >= 0; i--) {
            const e = entries[i];
            const row = document.createElement("div");
            row.className = "journal-entry";
            const type = document.createElement("span");
            type.className = "journal-type";
            type.textContent = e.type || "note";
            const age = document.createElement("span");
            age.className = "journal-age";
            age.textContent = this._formatJournalAge(now - (e.at || now));
            const text = document.createElement("span");
            text.textContent = e.text || "";
            row.appendChild(type);
            row.appendChild(age);
            row.appendChild(text);
            list.appendChild(row);
        }
    }

    _formatJournalAge(deltaMs) {
        if (!Number.isFinite(deltaMs) || deltaMs < 0) return "";
        const s = Math.floor(deltaMs / 1000);
        if (s < 30) return "eben";
        if (s < 60) return `vor ${s}s`;
        const m = Math.floor(s / 60);
        if (m < 60) return `vor ${m}m`;
        const h = Math.floor(m / 60);
        if (h < 24) return `vor ${h}h`;
        const d = Math.floor(h / 24);
        return `vor ${d}t`;
    }

    isSaveServerHost() {
        const href = typeof window !== "undefined" ? window.location.href : "";
        return /^https?:\/\/(127\.0\.0\.1|localhost):4312\//.test(href);
    }

    async saveToProjectFolder(options = {}) {
        // Drei Pfade:
        //   - lokaler save-server → POST /api/save-state (der Speicher-Faden setzt den Stand zusammen und sendet ihn)
        //   - anderswo + fallbackToDownload=true → Browser-Download
        //   - anderswo + fallbackToDownload=false (Auto-Save) → still aussteigen
        const { fallbackToDownload = true } = options;

        if (!this.isSaveServerHost()) {
            if (fallbackToDownload) {
                this.triggerStateDownload(this.buildStateSnapshot());
                this.log("Zustand als Datei heruntergeladen (kein lokaler save-server erreichbar)");
                return "download";
            }
            this.log("Auto-Save übersprungen (kein lokaler save-server)", "DEBUG");
            return false;
        }

        try {
            if (this.saveState() === false) throw new Error("der Stand ist gesperrt");
            const welt = this.state.worldMeta.worldId;
            const result = await this._speicherAuftrag({
                op: "server",
                welt,
                url: "http://localhost:4312/api/save-state",
            });
            if (!result.ok) throw new Error(result.grund);
            this.log(`Zustand direkt im Spielordner gespeichert: ${result.pfad || "anazhRealmState.json"}`);
            return "server";
        } catch (error) {
            if (!fallbackToDownload) {
                this.log(`Direktes Speichern im Spielordner fehlgeschlagen (${error.message})`, "ERROR");
                return false;
            }
            this.triggerStateDownload(this.buildStateSnapshot());
            this.log(
                `Direktes Speichern im Spielordner fehlgeschlagen (${error.message}). Download-Fallback gestartet`,
                "ERROR"
            );
            return "download";
        }
    }

    // V18.176 — `_refreshIchIfOpen` ist jetzt ein ALIAS auf den EINEN Puls
    // (die 8 Aufrufer bleiben heil; die Logik lebt in `_uiDirty`).
    _refreshIchIfOpen() {
        this._uiDirty("ich");
    }

    // === Feed: public Welten · Rezepte · Wesen scrollen + BEWERTEN ===
    // EIN Feed-Item-Modell, viele Quellen — jedes Item liest seinen Vektor (_worldProfile / _recipeProfile
    // / _creatureProfile); Bewerten ist lokal. `renderLibraryUI` ist der Feed-Renderer: #library-list
    // bleibt der Strom (Test-Hook), Welt-Items tragen `.library-card`, Rezept/Wesen-Items `.feed-card`.
    // Importierte Welten ohne erreichbare Dateien sind browsbar, nicht betretbar.
    renderLibraryUI() {
        if (typeof document === "undefined") return;
        const list = document.getElementById("library-list");
        if (!list) return;
        list.innerHTML = "";
        let items = this._feedItems();
        // V18.74 — sort-by-rating: „Bestbewertet" reiht die höchst-gewerteten Items nach oben (stabil).
        if (this.state.feedSort === "rating")
            items = items
                .map((it, i) => [it, i])
                .sort(
                    (a, b) =>
                        (b[0].ratingScore || b[0].rating || 0) - (a[0].ratingScore || a[0].rating || 0) || a[1] - b[1]
                )
                .map((p) => p[0]);
        // F4 Stufe 5 (V18.147) — „Für dich": die persönliche Reihung aus den
        // GEBAUTEN sozialen Signalen (stabil; die Summe ist LESBAR, kein
        // Black-Box-Algorithmus — _feedForYouScore trägt die Gewichte).
        else if (this.state.feedSort === "fuerdich")
            items = items
                .map((it, i) => [it, this._feedForYouScore(it), i])
                .sort((a, b) => b[1] - a[1] || a[2] - b[2])
                .map((p) => p[0]);
        for (const item of items) list.appendChild(this._feedItemCard(item));
        this._renderFeedKindChips();
        this._renderFeedSort();
        this._renderFeedTrends();
        this._renderActiveWorldIsland();
        this._applyLibraryFilter();
    }

    // „Für dich"-Score als lesbare Summe gebauter sozialer Signale (kein Server, keine Black-Box):
    // FOLGEN +4 · Gemeinschafts-Ø vertrauens-gewichtet (volle Kraft erst ab ~3 Zeugnissen) ·
    // eigenes MERKEN +2 · eigenes URTEIL ×0.5 · Kommentar-Puls (gedeckelt).
    _feedForYouScore(it) {
        let s = 0;
        if (it.author && this._feedFollowed(it.author)) s += 4;
        const agg = this._feedRatingAgg(it.id);
        if (agg.count > 0) s += agg.avg * Math.min(1, agg.count / 3);
        if (this._feedBookmarked(it.id)) s += 2;
        const own = this._feedRating(it.id);
        if (own > 0) s += own * 0.5;
        s += Math.min(1.5, this._feedComments(it.id).length * 0.3);
        return s;
    }

    // V18.74 — die Sortier-Chips (Neueste | ✦ Für dich | Bestbewertet) im Kuratieren-Rail; treiben den Strom.
    _renderFeedSort() {
        if (typeof document === "undefined") return;
        const host = document.getElementById("feed-sort");
        if (!host) return;
        host.innerHTML = "";
        const active =
            this.state.feedSort === "rating" ? "rating" : this.state.feedSort === "fuerdich" ? "fuerdich" : "neueste";
        for (const [k, label] of [
            ["neueste", "Neueste"],
            ["fuerdich", "✦ Für dich"],
            ["rating", "★ Bewertung"],
        ]) {
            const chip = this._el("button", {
                class: "feed-kind-chip" + (k === active ? " active" : ""),
                type: "button",
                text: label,
                title:
                    k === "fuerdich"
                        ? "Deine persönliche Reihung: Gefolgte zuerst, dann Gemeinschafts-Wertung, Gemerktes, dein Urteil, Gespräch — eine lesbare Summe, keine Black-Box."
                        : undefined,
            });
            chip.addEventListener("click", () => {
                this.state.feedSort = k === "rating" ? "rating" : k === "fuerdich" ? "fuerdich" : "neueste";
                this.renderLibraryUI();
            });
            host.appendChild(chip);
        }
    }

    // „Diese Welt"-Eiland: Identität der AKTIVEN Welt (Name + Marke + Trust + knapper Bestand). Stammbaum
    // + Tagebuch füllen die bestehenden Renderer (_renderWorldLineage + renderWorldJournal) in
    // #world-lineage/#world-journal — kein Parallel-Pfad.
    _renderActiveWorldIsland() {
        if (typeof document === "undefined") return;
        const host = document.getElementById("feed-active-ident");
        if (host) {
            const m = this.state.worldMeta || {};
            const name = m.slug || "(noch namenlos)";
            const archCount = (this.state.architectures || []).length;
            const bpCount = Object.keys(this.state.blueprints || {}).length;
            const creatureCount = (this.state.creatures || []).length;
            host.innerHTML = "";
            host.appendChild(
                this._el(
                    "div",
                    { class: "spec-header" },
                    this._el(
                        "div",
                        { class: "spec-id" },
                        this._el("span", { class: "spec-name lib-card-name", text: name }),
                        this._el("span", { class: "feed-self-badge", text: "Diese Welt" })
                    ),
                    this._el("span", {
                        class: "lib-trust-seal trust-trusted",
                        text: "✓ deine",
                        title: "Deine eigene Welt — du gestaltest + teilst sie souverän (Vibe-Pass).",
                    })
                )
            );
            host.appendChild(
                this._el("div", {
                    class: "feed-self-stats",
                    text: `${archCount} Bauwerke · ${bpCount} Baupläne · ${creatureCount} Wesen`,
                })
            );
        }
        // die Provenienz-Samen füllen die bestehenden Renderer (jetzt im Eiland-Kontext).
        if (typeof this._renderWorldLineage === "function") this._renderWorldLineage();
        if (typeof this.renderWorldJournal === "function") this.renderWorldJournal();
    }

    // Bib-D + Feed (das Ich-§J5-Loop) — die Selbst-Suche UND der Kind-Filter TREIBEN den Feed-Strom:
    // tippen filtert über den Item-Such-Index, die Kind-Chips über `data-kind`. Kein toter Knopf (V18.65).
    _applyLibraryFilter() {
        if (typeof document === "undefined") return;
        const list = document.getElementById("library-list");
        if (!list) return;
        const input = document.getElementById("library-search");
        const q = (input && input.value ? input.value : "").trim().toLowerCase();
        const kind = this.state.feedKind || "alle";
        // Die Identitäts-Seite ist EIN gefilterter Feed: ein gesetzter Autor-Filter (Klick auf den
        // Fingerprint) zeigt alle public Werke EINES pubkeys (data-author).
        const author = this.state._libraryAuthorFilter || null;
        let shown = 0;
        for (const card of list.querySelectorAll(".library-card, .feed-card")) {
            const hay = card.dataset.search || "";
            const kindOk =
                kind === "alle" ||
                (kind === "gemerkt"
                    ? card.dataset.bookmarked === "1"
                    : kind === "gefolgt"
                      ? card.dataset.followed === "1"
                      : card.dataset.kind === kind);
            const authorOk = !author || card.dataset.author === author;
            const match = kindOk && authorOk && this._matchQuery(hay, q); // M4 — der EINE Kern
            card.style.display = match ? "" : "none";
            if (match) shown++;
        }
        // M8 — der Identitäts-KOPF (sichtbar nur bei gesetztem Autor-Filter):
        // „Werke von <fp> (N) · ✕ alle zeigen" — der ✕ löst den Filter.
        let banner = list.querySelector(".library-author-banner");
        if (author) {
            if (!banner) {
                banner = this._el("div", { class: "library-author-banner" });
                list.prepend(banner);
            }
            banner.textContent = "";
            banner.appendChild(
                this._el("span", { text: `👤 Werke von ${this._vibeFingerprint(author)} — ${shown} im Feed ` })
            );
            const clear = this._el("button", { class: "library-author-clear", text: "✕ alle zeigen" });
            clear.type = "button";
            clear.addEventListener("click", () => {
                this.state._libraryAuthorFilter = null;
                this._applyLibraryFilter();
            });
            banner.appendChild(clear);
        } else if (banner) {
            banner.remove();
        }
        let empty = list.querySelector(".library-empty");
        if (shown === 0 && (q || kind !== "alle")) {
            if (!empty) {
                empty = this._el("div", { class: "library-empty" });
                list.appendChild(empty);
            }
            empty.textContent = q ? `Nichts passt zu „${q}".` : "Nichts in dieser Kategorie.";
            empty.style.display = "";
        } else if (empty) {
            empty.style.display = "none";
        }
    }

    // Das WERTEN — die lokale Bewertung (das dritte Verb des Feldes), persistent im globalen
    // localStorage (wie customWorlds). 0–5 Sterne; Klick auf den aktuellen Wert löscht (Toggle).
    _loadFeedRatings() {
        try {
            const raw = typeof localStorage !== "undefined" ? localStorage.getItem("anazh.feedRatings") : null;
            const parsed = raw ? JSON.parse(raw) : null;
            return parsed && typeof parsed === "object" ? parsed : {};
        } catch {
            return {};
        }
    }
    _saveFeedRatings() {
        try {
            if (typeof localStorage !== "undefined")
                localStorage.setItem("anazh.feedRatings", JSON.stringify(this.state.feedRatings || {}));
        } catch (e) {
            this.log(`feedRatings-Speichern fehlgeschlagen: ${e && e.message}`, "WARN");
        }
    }
    _feedRating(id) {
        if (!this.state.feedRatings) this.state.feedRatings = this._loadFeedRatings();
        const v = this.state.feedRatings[id];
        return Number.isFinite(v) ? v : 0;
    }
    _setFeedRating(id, stars) {
        if (!this.state.feedRatings) this.state.feedRatings = this._loadFeedRatings();
        const s = Math.max(0, Math.min(5, Math.round(stars)));
        this.state.feedRatings[id] = this.state.feedRatings[id] === s ? 0 : s; // Toggle — kein erzwungenes Werten
        this._saveFeedRatings();
        // F4 (V18.134) — die eigene Wertung wird ein signiertes ZEUGNIS
        // (fire-and-forget: signieren ist async; ohne Vibe-Pass bleibt die
        // Wertung lokal wie bisher — kein Zwang zur Identitaet).
        this._socialSignOwnRating(id, this.state.feedRatings[id]);
        return this.state.feedRatings[id];
    }

    // F4 Stufe 2 (V18.135) — LESEZEICHEN: das eigene Merken (lokal-global wie
    // die Wertungen — anazh.feedBookmarks, NIE im Welt-Snapshot; Lesezeichen
    // sind privat, sie reisen NICHT uebers Mesh — das Folgen/Teilen ist die
    // spaetere Stufe). Ein 🔖-Toggle pro Karte + der „Gemerkt"-Kind-Chip.
    _loadFeedBookmarks() {
        try {
            const raw = typeof localStorage !== "undefined" ? localStorage.getItem("anazh.feedBookmarks") : null;
            const obj = raw ? JSON.parse(raw) : {};
            return obj && typeof obj === "object" ? obj : {};
        } catch {
            return {};
        }
    }

    _saveFeedBookmarks() {
        try {
            if (typeof localStorage !== "undefined")
                localStorage.setItem("anazh.feedBookmarks", JSON.stringify(this.state.feedBookmarks || {}));
        } catch (e) {
            this.log(`feedBookmarks-Speichern fehlgeschlagen: ${e && e.message}`, "WARN");
        }
    }

    _feedBookmarked(id) {
        if (!this.state.feedBookmarks) this.state.feedBookmarks = this._loadFeedBookmarks();
        return this.state.feedBookmarks[id] === true;
    }

    _toggleFeedBookmark(id) {
        if (!this.state.feedBookmarks) this.state.feedBookmarks = this._loadFeedBookmarks();
        if (this.state.feedBookmarks[id]) delete this.state.feedBookmarks[id];
        else this.state.feedBookmarks[id] = true;
        this._saveFeedBookmarks();
        return this.state.feedBookmarks[id] === true;
    }

    // F4 Stufe 3 (V18.142) — FOLGEN: das Merken einer IDENTITÄT (ed25519-
    // pubkey — die Vibe-Pass-Sprache; Karten ohne Autor [Wesen/unsignierte]
    // tragen keinen Knopf). Speicher lokal-global wie die Lesezeichen
    // (anazh.feedFollows, NIE im Welt-Snapshot); die Folge-Liste selbst ist
    // PRIVAT — was reist, sind die Werke der Gefolgten (Katalog/Zeugnisse).
    // KONSUM: der „Gefolgt"-Kind-Chip filtert die Werke gefolgter Autoren,
    // das Folgen schreibt witness ins Journal (die ruhende Saat blüht an).
    _loadFeedFollows() {
        try {
            const raw = typeof localStorage !== "undefined" ? localStorage.getItem("anazh.feedFollows") : null;
            const obj = raw ? JSON.parse(raw) : {};
            return obj && typeof obj === "object" ? obj : {};
        } catch {
            return {};
        }
    }

    _saveFeedFollows() {
        try {
            if (typeof localStorage !== "undefined")
                localStorage.setItem("anazh.feedFollows", JSON.stringify(this.state.feedFollows || {}));
        } catch (e) {
            this.log(`feedFollows-Speichern fehlgeschlagen: ${e && e.message}`, "WARN");
        }
    }

    _feedFollowed(pub) {
        if (!pub) return false;
        if (!this.state.feedFollows) this.state.feedFollows = this._loadFeedFollows();
        return this.state.feedFollows[String(pub).toLowerCase()] === true;
    }

    _toggleFeedFollow(pub) {
        const key = String(pub || "").toLowerCase();
        if (!/^[0-9a-f]{64}$/.test(key)) return false;
        if (!this.state.feedFollows) this.state.feedFollows = this._loadFeedFollows();
        const on = !this.state.feedFollows[key];
        if (on) this.state.feedFollows[key] = true;
        else delete this.state.feedFollows[key];
        this._saveFeedFollows();
        if (on && typeof this.journalAppend === "function") {
            this.journalAppend(
                "witness",
                AnazhRealm._datum`Ich folge nun ${this._vibeFingerprint(key)} — seine Werke begleiten mich.`,
                {
                    follow: key,
                }
            );
        }
        return on;
    }

    // ===== F4 Stufe 1 (V18.134) — die soziale Bewertungs-Aggregation =========
    // Doku an AnazhRealm.SOCIAL. Das Zeugnis-Kanonische ist STABIL (jede
    // Aenderung braechte alle Signaturen — Vertrags-Disziplin wie signWorld).
    _socialCanonical(r) {
        return `rating|${r.id}|${r.s}|${r.t}|${r.pub}`;
    }

    _loadSocialRatings() {
        try {
            const raw = typeof localStorage !== "undefined" ? localStorage.getItem("anazh.socialRatings") : null;
            const arr = raw ? JSON.parse(raw) : [];
            const m = new Map();
            if (Array.isArray(arr)) for (const r of arr) if (r && r.id && r.pub) m.set(`${r.id}|${r.pub}`, r);
            return m;
        } catch {
            return new Map();
        }
    }

    _saveSocialRatings() {
        try {
            if (typeof localStorage === "undefined") return;
            const arr = [...(this.state.socialRatings || new Map()).values()];
            localStorage.setItem("anazh.socialRatings", JSON.stringify(arr));
        } catch (e) {
            this.log(`socialRatings-Speichern fehlgeschlagen: ${e && e.message}`, "WARN");
        }
    }

    _socialRatings() {
        if (!this.state.socialRatings) this.state.socialRatings = this._loadSocialRatings();
        return this.state.socialRatings;
    }

    // LWW-Store: neuestes t pro (Ziel, Schluessel) gewinnt; Cap verdraengt das
    // aelteste Zeugnis (bounded — die §5-Wand). true = gespeichert.
    _socialStoreRating(r) {
        const m = this._socialRatings();
        const key = `${r.id}|${r.pub}`;
        const old = m.get(key);
        if (old && old.t >= r.t) return false; // LWW — Aelteres faellt
        m.set(key, r);
        const cap = AnazhRealm.SOCIAL.maxStore;
        if (m.size > cap) {
            let oldestK = null;
            let oldestT = Infinity;
            for (const [k, v] of m) {
                if (v.t < oldestT) {
                    oldestT = v.t;
                    oldestK = k;
                }
            }
            if (oldestK) m.delete(oldestK);
        }
        this._saveSocialRatings();
        return true;
    }

    // Die AGGREGATION (der Feed-Leser): Ø + Anzahl ueber alle nicht-revozierten
    // Zeugnisse eines Ziels (s=0 = zurueckgezogene Wertung zaehlt nicht).
    // R4-KONSUM: ein revozierter Schluessel faellt aus der Wertungs-Wahrheit.
    _feedRatingAgg(id) {
        const m = this._socialRatings();
        let sum = 0;
        let count = 0;
        for (const r of m.values()) {
            if (r.id !== id || !(r.s > 0)) continue;
            if (typeof this._isKeyRevoked === "function" && this._isKeyRevoked(r.pub)) continue;
            sum += r.s;
            count++;
        }
        return { avg: count ? sum / count : 0, count };
    }

    // Die EIGENE Wertung signieren + speichern + (wenn das Mesh lebt)
    // annoncieren. Ohne Vibe-Pass still lokal (kein Identitaets-Zwang).
    async _socialSignOwnRating(id, s) {
        const vp = this.state.vibePass;
        if (!vp || !vp.ready || !vp.publicKeyHex) return null;
        const r = { id, s: Math.max(0, Math.min(5, Math.round(s))), t: Date.now(), pub: vp.publicKeyHex };
        const sig = await this._vibeSign(this._socialCanonical(r));
        if (!sig) return null;
        r.sig = sig;
        this._socialStoreRating(r);
        if (this.state.p2p && this.state.p2p.enabled && typeof this.p2pSend === "function") {
            this.p2pSend({ type: "social-rating", r });
        }
        return r;
    }

    // Empfang (kanal-exklusiv, R1-gegated am Aufrufer): Form pruefen →
    // Rueckruf pruefen → Signatur VERIFIZIEREN → LWW-Store. Async (subtle).
    async _socialRatingReceive(peerId, r) {
        if (!r || typeof r !== "object") return false;
        const s = r.s;
        const okShape =
            typeof r.id === "string" &&
            r.id.length > 0 &&
            r.id.length <= 200 &&
            Number.isInteger(s) &&
            s >= 0 &&
            s <= 5 &&
            Number.isFinite(r.t) &&
            typeof r.pub === "string" &&
            /^[0-9a-f]{64}$/i.test(r.pub) &&
            typeof r.sig === "string";
        if (!okShape) return false;
        if (typeof this._isKeyRevoked === "function" && this._isKeyRevoked(r.pub)) return false;
        const ok = await this._vibeVerify(this._socialCanonical(r), r.sig, r.pub);
        if (!ok) return false;
        return this._socialStoreRating({ id: r.id, s, t: r.t, pub: r.pub.toLowerCase(), sig: r.sig });
    }

    // Die ANSCHLUSS-ANNONCE: die eigenen neuesten Zeugnisse als EIN Batch an
    // einen frisch verbundenen Peer (das Soul/Vibe-Muster am channel.onopen).
    _socialAnnounceBatch() {
        const vp = this.state.vibePass;
        if (!vp || !vp.ready || !vp.publicKeyHex) return null;
        const own = [...this._socialRatings().values()]
            .filter((r) => r.pub === vp.publicKeyHex && r.sig)
            .sort((a, b) => b.t - a.t)
            .slice(0, AnazhRealm.SOCIAL.maxBatch);
        if (!own.length) return null;
        return { type: "social-ratings", list: own };
    }

    // ===== Kommentare: signierte Text-Zeugnisse =====
    // Substrat wie die Wertungen (Vibe-Pass-Signatur · kanal-exklusiv · R1-Rate · Rückruf siebt · bounded
    // Store), aber APPEND-ONLY statt LWW (Schlüssel id|pub|t dedupt). Text reist als DATEN, gerendert NUR
    // als textContent (XSS-Wand). x steht am ENDE des Kanonischen, damit der Text "|" enthalten darf.
    _socialCommentCanonical(c) {
        return `comment|${c.id}|${c.t}|${c.pub}|${c.x}`;
    }

    _loadSocialComments() {
        try {
            const raw = typeof localStorage !== "undefined" ? localStorage.getItem("anazh.socialComments") : null;
            const arr = raw ? JSON.parse(raw) : [];
            const m = new Map();
            if (Array.isArray(arr))
                for (const c of arr)
                    if (c && c.id && c.pub && Number.isFinite(c.t)) m.set(`${c.id}|${c.pub}|${c.t}`, c);
            return m;
        } catch {
            return new Map();
        }
    }

    _saveSocialComments() {
        try {
            if (typeof localStorage === "undefined") return;
            const arr = [...(this.state.socialComments || new Map()).values()];
            localStorage.setItem("anazh.socialComments", JSON.stringify(arr));
        } catch (e) {
            this.log(`socialComments-Speichern fehlgeschlagen: ${e && e.message}`, "WARN");
        }
    }

    _socialCommentsMap() {
        if (!this.state.socialComments) this.state.socialComments = this._loadSocialComments();
        return this.state.socialComments;
    }

    _socialStoreComment(c) {
        const m = this._socialCommentsMap();
        const key = `${c.id}|${c.pub}|${c.t}`;
        if (m.has(key)) return false; // dedupe — Einzelstueck
        m.set(key, c);
        const cap = AnazhRealm.SOCIAL.maxComments;
        if (m.size > cap) {
            let oldestK = null;
            let oldestT = Infinity;
            for (const [k, v] of m) {
                if (v.t < oldestT) {
                    oldestT = v.t;
                    oldestK = k;
                }
            }
            if (oldestK) m.delete(oldestK);
        }
        this._saveSocialComments();
        return true;
    }

    // Der Feed-Leser: die Kommentare eines Ziels, aelteste zuerst; revozierte
    // Schluessel fallen (R4-KONSUM — der Rueckruf wirkt auch dem Wort).
    _feedComments(id) {
        const out = [];
        for (const c of this._socialCommentsMap().values()) {
            if (c.id !== id) continue;
            if (typeof this._isKeyRevoked === "function" && this._isKeyRevoked(c.pub)) continue;
            out.push(c);
        }
        out.sort((a, b) => a.t - b.t);
        return out;
    }

    // Den EIGENEN Kommentar signieren + speichern + annoncieren + bezeugen
    // (journal share — die ruhende Saat blueht: ein Wort an die Gemeinschaft).
    async _socialSignOwnComment(id, text) {
        const vp = this.state.vibePass;
        if (!vp || !vp.ready || !vp.publicKeyHex) return null;
        const x = String(text || "")
            .trim()
            .slice(0, AnazhRealm.SOCIAL.maxCommentLen);
        if (!x) return null;
        const c = { id, x, t: Date.now(), pub: vp.publicKeyHex };
        const sig = await this._vibeSign(this._socialCommentCanonical(c));
        if (!sig) return null;
        c.sig = sig;
        this._socialStoreComment(c);
        if (this.state.p2p && this.state.p2p.enabled && typeof this.p2pSend === "function") {
            this.p2pSend({ type: "social-comment", c });
        }
        if (typeof this.journalAppend === "function") {
            this.journalAppend(
                "share",
                AnazhRealm._datum`Ich liess ein Wort bei „${id}" zurueck: „${x.slice(0, 60)}"`,
                {
                    comment: id,
                }
            );
        }
        return c;
    }

    // Empfang (kanal-exklusiv, R1-gegated am Aufrufer): Form-Wand → Rueckruf
    // → Signatur VERIFIZIEREN → Store. Async (subtle).
    async _socialCommentReceive(peerId, c) {
        if (!c || typeof c !== "object") return false;
        const okShape =
            typeof c.id === "string" &&
            c.id.length > 0 &&
            c.id.length <= 200 &&
            typeof c.x === "string" &&
            c.x.length > 0 &&
            c.x.length <= AnazhRealm.SOCIAL.maxCommentLen &&
            Number.isFinite(c.t) &&
            typeof c.pub === "string" &&
            /^[0-9a-f]{64}$/i.test(c.pub) &&
            typeof c.sig === "string";
        if (!okShape) return false;
        if (typeof this._isKeyRevoked === "function" && this._isKeyRevoked(c.pub)) return false;
        const ok = await this._vibeVerify(this._socialCommentCanonical(c), c.sig, c.pub);
        if (!ok) return false;
        return this._socialStoreComment({ id: c.id, x: c.x, t: c.t, pub: c.pub.toLowerCase(), sig: c.sig });
    }

    // Die Anschluss-Annonce (das Rating-Muster): die eigenen neuesten Worte.
    _socialCommentsBatch() {
        const vp = this.state.vibePass;
        if (!vp || !vp.ready || !vp.publicKeyHex) return null;
        const own = [...this._socialCommentsMap().values()]
            .filter((c) => c.pub === vp.publicKeyHex && c.sig)
            .sort((a, b) => b.t - a.t)
            .slice(0, AnazhRealm.SOCIAL.maxCommentBatch);
        if (!own.length) return null;
        return { type: "social-comments", list: own };
    }

    // Ein Bauplan-Lese-Vektor (das _worldProfile/_creatureProfile-Muster auf ein Rezept). KONSUM-ehrlich.
    _recipeProfile(bp) {
        let tags = {};
        try {
            tags = this.computeCompoundTags(bp) || {};
        } catch {
            /* tags optional */
        }
        const topTags = Object.entries(tags)
            .filter(([, v]) => Number.isFinite(v) && v > 0.05)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([k]) => k);
        const role = typeof this._displayRole === "function" ? this._displayRole(bp) : bp.role || "";
        const colors = AnazhRealm.BLUEPRINT_ROLE_COLORS;
        return {
            bp,
            name: bp.name,
            label: bp.label || bp.name,
            builtIn: !!bp.builtIn,
            role,
            roleColor: colors[role] || null,
            topTags,
            searchText: [bp.label || bp.name, role, topTags.join(" "), "rezept bauplan"].join(" ").toLowerCase(),
        };
    }

    // Der EINE Feed-Strom: Welten + Rezepte + Wesen, jedes Item liest seinen Vektor + seine Wertung.
    _feedItems() {
        const items = [];
        for (const w of this._libraryWorlds()) {
            const p = this._worldProfile(w);
            items.push({ kind: "world", id: "world:" + p.id, label: p.label, prof: p, search: p.searchText });
        }
        for (const bp of Object.values(this.state.blueprints || {})) {
            // W-A1 (Donor-Abschied) — donorOnly-Spender treten auch im Bibliotheks-Feed nicht auf.
            if (!bp || bp.instanced || bp.role === "portal" || bp.donorOnly) continue; // Portale = Welten; instanced = Worldgen-Litter
            const p = this._recipeProfile(bp);
            items.push({ kind: "recipe", id: "recipe:" + bp.name, label: p.label, prof: p, search: p.searchText });
        }
        for (const c of this.state.creatures || []) {
            const p = this._creatureProfile(c);
            items.push({
                kind: "creature",
                id: "creature:" + (p.id || p.name),
                label: p.name,
                prof: p,
                search: (p.name + " " + p.soulLabel + " " + p.moodLabel + " wesen kreatur").toLowerCase(),
            });
        }
        for (const it of items) {
            it.rating = this._feedRating(it.id);
            // F4 (V18.134) — die Gemeinschafts-Wertung in den Strom (Sort-Quelle).
            const agg = this._feedRatingAgg(it.id);
            it.ratingScore = agg.count > 0 ? agg.avg : it.rating || 0;
            // F4 Stufe 3 (V18.142) — die AUTOR-Identität (signierte Welten/
            // Rezepte tragen sie; Wesen nicht) speist Folgen-Toggle + Filter.
            const author =
                it.kind === "world"
                    ? it.prof.authorPubKey
                    : it.kind === "recipe" && it.prof.bp
                      ? it.prof.bp.authorPubKey
                      : "";
            it.author = typeof author === "string" && /^[0-9a-f]{64}$/i.test(author) ? author.toLowerCase() : "";
        }
        return items;
    }

    // Eine Feed-Karte — dispatcht nach Art; Welt = die Welt-Spec-Card (reuse), Rezept/Wesen kompakt.
    // Jede Karte trägt die Bewertung (das WERTEN) + die Art-Marken (data-kind, für den Kind-Filter).
    _feedItemCard(item) {
        let card;
        if (item.kind === "world") card = this._libraryBuildCard(item.prof.world);
        else if (item.kind === "recipe") card = this._feedRecipeCard(item);
        else card = this._feedCreatureCard(item);
        card.dataset.kind = item.kind;
        if (!card.dataset.search) card.dataset.search = item.search || "";
        // F4 Stufe 2 (V18.135) — der Gemerkt-Filter liest das dataset.
        card.dataset.bookmarked = this._feedBookmarked(item.id) ? "1" : "";
        // F4 Stufe 3 (V18.142) — der Gefolgt-Filter liest Autor + Folge-Stand.
        card.dataset.author = item.author || "";
        card.dataset.followed = item.author && this._feedFollowed(item.author) ? "1" : "";
        card.insertBefore(this._feedCover(item), card.firstChild); // die Vorschau (ein simples Cover-Bild) oben
        card.appendChild(this._feedRatingBar(item));
        // V18.75 — Klick auf den Karten-Körper (nicht auf einen Akt/Stern) stellt das echte 3D-Modell in
        // den geteilten Vorschau-Bereich links (das Hof-Bühnen-Muster — EIN Renderer, das Fokussierte tritt auf).
        card.addEventListener("click", (e) => {
            if (e.target.closest("button") || e.target.closest(".feed-rating") || e.target.closest("a")) return;
            this._feedFocus(item, card);
        });
        if (item.id === this.state.feedFocusId) card.classList.add("is-previewing");
        return card;
    }

    // V18.74 — eine simple VORSCHAU ("quasi ein Bild") pro Karte: ein farbiges Cover-Band, deterministisch
    // aus der Identität (kein schwerer 3D-Render). Rezepte tragen die Rollen-Farbe, Welten/Wesen einen
    // stabilen Farbton aus dem Identitäts-Hash + ein Art-Glyph. Gibt dem Feed visuelle Variation.
    _feedHueFrom(str) {
        let h = 2166136261;
        const s = String(str || "");
        for (let i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return (h >>> 0) % 360;
    }
    _feedCover(item) {
        const glyphMap = {
            architecture: "⌂",
            tool: "⚒",
            weapon: "⚔",
            armor: "⛨",
            consumable: "⚗",
            soul: "✦",
            machine: "⚙",
            portal: "◎",
        };
        let base, glyph, label;
        if (item.kind === "recipe") {
            const colors = AnazhRealm.BLUEPRINT_ROLE_COLORS;
            base = colors[item.prof.role] || `hsl(${this._feedHueFrom(item.id)}, 45%, 42%)`;
            glyph = glyphMap[item.prof.role] || "⬢";
            label = "Rezept";
        } else if (item.kind === "creature") {
            base = `hsl(${this._feedHueFrom(item.prof.soul || item.id)}, 42%, 46%)`;
            glyph = "✦";
            label = "Wesen";
        } else {
            base = `hsl(${this._feedHueFrom(item.id)}, 46%, 42%)`;
            glyph = "◈";
            label = "Welt";
        }
        const cover = this._el(
            "div",
            { class: "feed-cover feed-cover-" + item.kind },
            this._el("span", { class: "feed-cover-glyph", text: glyph }),
            this._el("span", { class: "feed-cover-label", text: label })
        );
        cover.style.background = `linear-gradient(135deg, ${base}, rgba(10, 6, 2, 0.8))`;
        return cover;
    }

    // === Geteilte 3D-Vorschau des Feeds ===
    // EINE WebGPU-Bühne (ein Renderer je Karte killt die GPU): Klick auf eine Rezept-/Wesen-Karte → ihr
    // echtes Modell (`_buildFromBlueprint` / `_buildCreatureGroup`) dreht sich. Welten → nur der Hinweis.
    _feedFocus(item, card) {
        if (typeof document === "undefined") return;
        const list = document.getElementById("library-list");
        if (list) for (const c of list.querySelectorAll(".is-previewing")) c.classList.remove("is-previewing");
        if (card) card.classList.add("is-previewing");
        this.state.feedFocusId = item ? item.id : null;
        this._feedEnsurePreview();
        this._feedPreviewShow(item);
    }
    _feedEnsurePreview() {
        if (typeof document === "undefined" || typeof THREE === "undefined") return null;
        if (this.state.feedPreview) return this.state.feedPreview;
        const canvas = document.getElementById("feed-preview-canvas");
        if (!canvas) return null;
        const w = 244;
        const h = 184;
        const renderer = this._buehneRenderer(canvas, w, h, 0x14110a, "Feed-Vorschau", () => {
            stage.rendererReady = true;
            if (stage.active) this._feedPreviewStartRAF();
        });
        if (!renderer) return null;
        const scene = new THREE.Scene();
        scene.add(new THREE.AmbientLight(0xffffff, 0.65));
        const key = new THREE.DirectionalLight(0xffe8c2, 0.95);
        key.position.set(4, 6, 5);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0x88aaff, 0.4);
        fill.position.set(-4, -1, -3);
        scene.add(fill);
        const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 200);
        camera.position.set(0, 0.12, 4.2);
        camera.lookAt(0, 0, 0);
        const stage = {
            canvas,
            renderer,
            scene,
            camera,
            pivot: null,
            key: null,
            yaw: 0.5,
            rafId: null,
            active: false,
            rendererReady: false,
        };
        this.state.feedPreview = stage;
        return stage;
    }
    _feedPreviewShow(item) {
        const stage = this.state.feedPreview;
        if (!stage) return;
        const key = item ? item.id : null;
        if (stage.key === key) return;
        if (stage.pivot) {
            stage.scene.remove(stage.pivot);
            this._disposeSoulGroup(stage.pivot);
            stage.pivot = null;
        }
        stage.key = key;
        const hint = document.getElementById("feed-preview-hint");
        let group = null;
        try {
            if (item && item.kind === "recipe") group = this._buildFromBlueprint(item.prof.bp, 0);
            else if (item && item.kind === "creature") group = this._buildCreatureGroup(item.prof.soul);
        } catch (_e) {
            throw this._stoffBruch("die Vorschau im Feed", _e);
        }
        if (!group || !group.children || !group.children.length) {
            if (hint) {
                hint.textContent =
                    item && item.kind === "world"
                        ? "Welten sind eine ganze Szene — betritt sie durch das Tor."
                        : "Klick eine Rezept- oder Wesen-Karte für die 3D-Vorschau.";
                hint.hidden = false;
            }
            return;
        }
        if (hint) hint.hidden = true;
        const box = new THREE.Box3().setFromObject(group);
        const center = box.getCenter(new THREE.Vector3());
        const dim = box.getSize(new THREE.Vector3());
        group.position.sub(center);
        const maxDim = Math.max(dim.x, dim.y, dim.z) || 1;
        group.scale.setScalar(2.6 / maxDim);
        const pivot = new THREE.Group();
        pivot.add(group);
        stage.scene.add(pivot);
        stage.pivot = pivot;
    }
    _feedPreviewStartRAF() {
        const stage = this.state.feedPreview;
        if (!stage || stage.rafId !== null || !stage.rendererReady) return;
        const tick = () => {
            const s = this.state.feedPreview;
            if (!s || !s.active) {
                if (s) s.rafId = null;
                return;
            }
            if (s.pivot) {
                s.yaw += 0.008;
                s.pivot.rotation.y = s.yaw;
            }
            if (s.rendererReady) {
                this._buehneRender(s.renderer, s.scene, s.camera, "Feed-Vorschau");
            }
            s.rafId = requestAnimationFrame(tick);
        };
        stage.rafId = requestAnimationFrame(tick);
    }
    _feedPreviewStopRAF() {
        const stage = this.state.feedPreview;
        if (stage && stage.rafId !== null) {
            cancelAnimationFrame(stage.rafId);
            stage.rafId = null;
        }
    }
    // Tab-Wechsel-Hook (Zwilling zu `_hofHandleDrawerChange`): die Vorschau-Bühne lebt nur bei offener Bibliothek.
    _feedHandleDrawerChange(name) {
        const stage = this.state.feedPreview;
        if (name === "bibliothek") {
            const s = this._feedEnsurePreview();
            if (!s) return;
            s.active = true;
            // das zuletzt fokussierte Item wieder auftreten lassen (Restore über Re-Open).
            if (this.state.feedFocusId) {
                const it = this._feedItems().find((x) => x.id === this.state.feedFocusId);
                if (it) this._feedPreviewShow(it);
            }
            this._feedPreviewStartRAF();
        } else if (stage) {
            stage.active = false;
            this._feedPreviewStopRAF();
        }
    }

    _feedRecipeCard(item) {
        const p = item.prof;
        const roleChip = this._el("span", { class: "feed-role-chip", text: p.role || "Rezept" });
        if (p.roleColor) {
            roleChip.style.borderColor = p.roleColor;
            roleChip.style.color = p.roleColor;
        }
        // W-C(h)/R-036 — der WARUM-CHIP an der Bibliotheks-Karte (Tooltip am
        // Rollen-Chip): dieselbe lesbare Emergenz wie Werkstatt + Rezeptbuch.
        {
            const why = p.bp && this._blueprintRoleWhy(p.bp);
            if (why && why.text) roleChip.title = `${AnazhRealm.ROLE_LABELS[why.role] || why.role}, weil: ${why.text}`;
        }
        const header = this._el(
            "div",
            { class: "spec-header" },
            this._el("div", { class: "spec-id" }, this._el("span", { class: "spec-name", text: p.label }), roleChip),
            this._el("span", { class: "feed-kind-badge kind-recipe", text: "Rezept" })
        );
        const body = this._el(
            "div",
            { class: "feed-card-body" },
            this._el(
                "div",
                { class: "spec-stat-strip" },
                ...(p.topTags.length
                    ? p.topTags.map((k) => this._el("span", { class: "spec-stat-chip", text: k }))
                    : [this._el("span", { class: "spec-empty", text: "schlichte Materie" })])
            )
        );
        const openBtn = this._el("button", {
            class: "library-get",
            type: "button",
            text: "In die Werkstatt",
            title: "Den Bauplan in der Werkstatt öffnen + verfeinern.",
        });
        openBtn.addEventListener("click", () => {
            if (typeof this.selectBlueprintForEdit === "function") this.selectBlueprintForEdit(p.name);
            if (typeof this.toggleDrawer === "function") this.toggleDrawer("werkstatt");
        });
        const footer = this._el(
            "div",
            { class: "spec-footer lib-spec-footer" },
            this._el("div", { class: "lib-card-acts" }, openBtn)
        );
        return this._el("div", { class: "feed-card lib-spec-sheet spec-sheet feed-recipe" }, header, body, footer);
    }

    _feedCreatureCard(item) {
        const p = item.prof;
        const header = this._el(
            "div",
            { class: "spec-header" },
            this._el(
                "div",
                { class: "spec-id" },
                this._el("span", { class: "spec-name soul-" + p.soul, text: p.name }),
                this._el("span", { class: "spec-soul-label", text: p.soulLabel })
            ),
            this._el("span", { class: "feed-kind-badge kind-creature", text: "Wesen" })
        );
        const body = this._el(
            "div",
            { class: "feed-card-body" },
            this._el("span", {
                class: "creature-mood " + (p.emotion === "sad" ? "mood-sad" : "mood-happy"),
                text: (p.emotion === "sad" ? "☹ " : "☺ ") + p.moodLabel,
            })
        );
        const visitBtn = this._el("button", {
            class: "library-get",
            type: "button",
            text: "Zum Hof",
            title: p.name + " im Hof aufsuchen.",
        });
        visitBtn.addEventListener("click", () => {
            this.state.hofFocusId = p.id;
            if (typeof this.toggleDrawer === "function") this.toggleDrawer("kreaturen");
            if (typeof this._hofRefreshFocus === "function") this._hofRefreshFocus();
        });
        const footer = this._el(
            "div",
            { class: "spec-footer lib-spec-footer" },
            this._el("div", { class: "lib-card-acts" }, visitBtn)
        );
        return this._el("div", { class: "feed-card lib-spec-sheet spec-sheet feed-creature" }, header, body, footer);
    }

    // Das WERTEN-Steuerelement — 5 Sterne, klickbar (lokal). Re-Klick aktualisiert NUR diese Sterne
    // (kein Feed-Rebuild) + frischt die „Bestbewertet"-Liste rechts.
    _feedRatingBar(item) {
        const bar = this._el("div", { class: "feed-rating", title: "Bewerten — deine Wertung (lokal gespeichert)" });
        const stars = [];
        const paint = (val) => {
            for (let i = 0; i < 5; i++) stars[i].textContent = i < val ? "★" : "☆";
            bar.dataset.rating = String(val);
        };
        for (let i = 0; i < 5; i++) {
            const star = this._el("span", { class: "feed-star", text: "☆" });
            star.addEventListener("click", (e) => {
                e.stopPropagation();
                paint(this._setFeedRating(item.id, i + 1));
                this._renderFeedTrends();
            });
            stars.push(star);
            bar.appendChild(star);
        }
        paint(item.rating || 0);
        // F4 (V18.134) — die GEMEINSCHAFTS-Wertung (Mesh-Aggregation) neben den
        // eigenen Sternen: "Ø 4.2 (3)" — nur wenn Zeugnisse da sind (kein
        // UI-Rauschen in der Einzelwelt, die V18.77-Abweichungs-Disziplin).
        const agg = typeof this._feedRatingAgg === "function" ? this._feedRatingAgg(item.id) : null;
        if (agg && agg.count > 0) {
            bar.appendChild(
                this._el("span", {
                    class: "feed-rating-agg",
                    text: ` Ø ${agg.avg.toFixed(1)} (${agg.count})`,
                    title: "Gemeinschafts-Wertung (signierte Zeugnisse uebers Mesh)",
                })
            );
        }
        // Der Kommentar-Zähler toggelt das Wort-Panel der Karte (signierte Worte + eigene Eingabe). Text NUR
        // als textContent (XSS-Wand); ohne Vibe-Pass ruht die Eingabe.
        const cCount = this._feedComments(item.id).length;
        const talk = this._el("span", {
            class: "feed-talk",
            text: `💬 ${cCount || ""}`.trim(),
            title: "Worte der Gemeinschaft — lesen + eines zuruecklassen (signiert).",
        });
        talk.style.cursor = "pointer";
        talk.addEventListener("click", (e) => {
            e.stopPropagation();
            const card = talk.closest(".library-card, .feed-card");
            if (!card) return;
            let panel = card.querySelector(".feed-comments");
            if (panel) {
                panel.remove();
                return;
            }
            panel = this._el("div", { class: "feed-comments" });
            this._renderFeedCommentsPanel(panel, item, talk);
            card.appendChild(panel);
        });
        bar.appendChild(talk);
        // F4 Stufe 2 (V18.135) — das LESEZEICHEN (privat, lokal): merken ohne
        // werten. Der Toggle pflegt das Karten-dataset → der „Gemerkt"-Chip
        // filtert live (kein Feed-Rebuild — die V18.65-Loop-Disziplin).
        const mark = this._el("span", {
            class: "feed-bookmark" + (this._feedBookmarked(item.id) ? " active" : ""),
            text: this._feedBookmarked(item.id) ? "🔖" : "📑",
            title: "Lesezeichen — merken (privat, lokal)",
        });
        mark.addEventListener("click", (e) => {
            e.stopPropagation();
            const on = this._toggleFeedBookmark(item.id);
            mark.textContent = on ? "🔖" : "📑";
            mark.classList.toggle("active", on);
            const card = mark.closest(".library-card, .feed-card");
            if (card) card.dataset.bookmarked = on ? "1" : "";
            this._renderFeedKindChips();
            this._applyLibraryFilter();
        });
        bar.appendChild(mark);
        // FOLGEN: Identitäts-Toggle nur auf Karten MIT Autor, nie auf eigenen Werken. Der Klick pflegt ALLE
        // Karten desselben Autors live (data-author), dazu Chips + Filter.
        const myKey = this.state.vibePass && this.state.vibePass.publicKeyHex;
        // M8 (V18.161) — der 👤-IDENTITÄTS-Chip: ein Klick zeigt ALLE Werke
        // dieses Schöpfers (der Autor-Filter — die Identitäts-Seite als Feed).
        if (item.author) {
            const ident = this._el("span", {
                class: "feed-ident",
                text: `👤 ${this._vibeFingerprint(item.author)}`,
                title: "Alle Werke dieses Schöpfers zeigen (Identitäts-Seite).",
            });
            ident.style.cursor = "pointer";
            ident.addEventListener("click", (e) => {
                e.stopPropagation();
                this.state._libraryAuthorFilter = item.author;
                this._applyLibraryFilter();
            });
            bar.appendChild(ident);
        }
        if (item.author && item.author !== myKey) {
            const followed = this._feedFollowed(item.author);
            const follow = this._el("span", {
                class: "feed-follow" + (followed ? " active" : ""),
                text: followed ? "✓ folge" : "➕ folgen",
                title: `Dem Schöpfer ${this._vibeFingerprint(item.author)} folgen — seine Werke im „Gefolgt"-Filter.`,
            });
            follow.style.cursor = "pointer";
            follow.style.marginLeft = "6px";
            follow.addEventListener("click", (e) => {
                e.stopPropagation();
                const on = this._toggleFeedFollow(item.author);
                const list = document.getElementById("library-list");
                if (list) {
                    for (const c of list.querySelectorAll(`[data-author="${item.author}"]`)) {
                        c.dataset.followed = on ? "1" : "";
                        const f = c.querySelector(".feed-follow");
                        if (f) {
                            f.textContent = on ? "✓ folge" : "➕ folgen";
                            f.classList.toggle("active", on);
                        }
                    }
                }
                this._renderFeedKindChips();
                this._applyLibraryFilter();
            });
            bar.appendChild(follow);
        }
        return bar;
    }

    // Wort-Panel einer Karte: die jüngsten Kommentare (Fingerprint + Text, NUR textContent — XSS-Wand) +
    // die eigene Eingabe (Enter/➤ sendet; ohne Vibe-Pass ruht sie sichtbar).
    _renderFeedCommentsPanel(panel, item, talkEl) {
        panel.innerHTML = "";
        const list = this._feedComments(item.id);
        const shown = list.slice(-AnazhRealm.SOCIAL.maxCommentsShown);
        const myKey = this.state.vibePass && this.state.vibePass.publicKeyHex;
        if (!shown.length) {
            panel.appendChild(
                this._el("div", { class: "feed-comment-empty", text: "Noch kein Wort — sei das erste." })
            );
        }
        for (const c of shown) {
            const row = this._el("div", { class: "feed-comment-row" });
            const who = this._el("span", {
                class: "feed-comment-who",
                text: c.pub === myKey ? "du" : this._vibeFingerprint(c.pub),
                title: "ed25519:" + c.pub,
            });
            const text = this._el("span", { class: "feed-comment-text" });
            text.textContent = c.x; // NUR textContent — nie HTML aus dem Mesh
            row.appendChild(who);
            row.appendChild(text);
            panel.appendChild(row);
        }
        const ready = !!(this.state.vibePass && this.state.vibePass.ready);
        const inputRow = this._el("div", { class: "feed-comment-input" });
        const input = this._el("input", {
            type: "text",
            placeholder: ready ? "Ein Wort zuruecklassen …" : "Vibe-Pass noetig (Einstellungen → Identitaet)",
            maxlength: String(AnazhRealm.SOCIAL.maxCommentLen),
        });
        input.disabled = !ready;
        const send = this._el("button", { type: "button", text: "➤", title: "Senden (signiert mit deinem Vibe-Pass)" });
        send.disabled = !ready;
        const submit = async () => {
            const v = input.value.trim();
            if (!v) return;
            input.disabled = true;
            const c = await this._socialSignOwnComment(item.id, v);
            input.disabled = !ready;
            input.value = "";
            if (c) {
                this._renderFeedCommentsPanel(panel, item, talkEl);
                if (talkEl) talkEl.textContent = `💬 ${this._feedComments(item.id).length}`;
            }
        };
        input.addEventListener("click", (e) => e.stopPropagation());
        input.addEventListener("keydown", (e) => {
            e.stopPropagation();
            if (e.key === "Enter") submit();
        });
        send.addEventListener("click", (e) => {
            e.stopPropagation();
            submit();
        });
        inputRow.appendChild(input);
        inputRow.appendChild(send);
        panel.appendChild(inputRow);
    }

    _renderFeedKindChips() {
        if (typeof document === "undefined") return;
        const host = document.getElementById("feed-kinds");
        if (!host) return;
        host.innerHTML = "";
        const counts = { world: 0, recipe: 0, creature: 0 };
        for (const it of this._feedItems()) counts[it.kind]++;
        const total = counts.world + counts.recipe + counts.creature;
        const active = this.state.feedKind || "alle";
        let marked = 0;
        let followed = 0;
        for (const it of this._feedItems()) {
            if (this._feedBookmarked(it.id)) marked++;
            if (it.author && this._feedFollowed(it.author)) followed++;
        }
        const kinds = [
            ["alle", "Alle", total],
            ["world", "Welten", counts.world],
            ["recipe", "Rezepte", counts.recipe],
            ["creature", "Wesen", counts.creature],
            ["gemerkt", "🔖 Gemerkt", marked], // F4 Stufe 2 (V18.135)
            ["gefolgt", "👤 Gefolgt", followed], // F4 Stufe 3 (V18.142)
        ];
        for (const [k, label, n] of kinds) {
            const chip = this._el("button", {
                class: "feed-kind-chip" + (k === active ? " active" : ""),
                type: "button",
                text: `${label} · ${n}`,
            });
            chip.addEventListener("click", () => {
                this.state.feedKind = k;
                this._renderFeedKindChips();
                this._applyLibraryFilter();
            });
            host.appendChild(chip);
        }
    }

    // „Bestbewertet" (rechts) — die lokal höchst-gewerteten Items (das WERTEN sichtbar zurück).
    _renderFeedTrends() {
        if (typeof document === "undefined") return;
        const host = document.getElementById("feed-trends");
        if (!host) return;
        host.innerHTML = "";
        // V18.136 (Reflexions-Audit) — die Rail liest die GEMEINSCHAFT (V18.134-
        // Aggregation; eigene Sterne als Fallback) — vorher blieben mesh-
        // gewertete Items unsichtbar, bis man SELBST wertete (Konsum-Riss).
        const top = this._feedItems()
            .map((it) => {
                const agg = this._feedRatingAgg(it.id);
                return { it, score: agg.count > 0 ? agg.avg : it.rating || 0, count: agg.count };
            })
            .filter((x) => x.score > 0)
            .sort((a, b) => b.score - a.score || b.count - a.count)
            .slice(0, 5);
        if (!top.length) {
            host.appendChild(
                this._el("div", {
                    class: "drawer-hint",
                    text: "Noch nichts bewertet — vergib Sterne, deine Favoriten erscheinen hier.",
                })
            );
            return;
        }
        for (const { it, score, count } of top)
            host.appendChild(
                this._el(
                    "div",
                    { class: "feed-trend-row" },
                    this._el("span", {
                        class: "feed-trend-stars",
                        text: "★".repeat(Math.max(1, Math.round(score))) + (count > 1 ? ` (${count})` : ""),
                    }),
                    this._el("span", { class: "feed-trend-label", text: it.label })
                )
            );
    }

    // Bibliothek-Karte = Welt-Spec-Card im geteilten `.spec-*`-Design: HEADER (Name + Stufe + Herkunft |
    // Trust-Siegel) → BODY (DSL-Chips | Multiplayer/Server + Signatur) → FOOTER (BETRETEN + Signieren/
    // Teilen). Liest den EINEN `_worldProfile`-Vektor. Die Struktur-Marken (.library-card/.library-*-mark/
    // .library-get/-build/-rebuild/.library-sig-*) bleiben — Tests hängen daran.
    _libraryBuildCard(w) {
        const prof = this._worldProfile(w);
        const card = this._el("div", {
            class:
                "library-card lib-spec-sheet spec-sheet" +
                (prof.vendored
                    ? " library-card-vendored"
                    : prof.translated
                      ? " library-card-translated"
                      : prof.imported
                        ? " library-card-imported"
                        : ""),
            data: { worldId: prof.id, search: prof.searchText },
        });
        // Signatur-Siegel (Body) + Signieren/Teilen (Footer) teilen EINE async Verifikation.
        const sigSeal = this._el("span", { class: "lib-sig-seal", text: "prüfe …" });
        const sigBtn = this._el("button", {
            class: "library-sig-btn",
            type: "button",
            text: "Signieren",
            disabled: true,
        });
        const exportBtn = this._el("button", {
            class: "library-sig-btn library-export-btn",
            type: "button",
            text: "Teilen…",
            disabled: true,
        });
        card.appendChild(this._libraryCardHeader(prof));
        if (prof.desc) card.appendChild(this._el("div", { class: "lib-card-desc", text: prof.desc }));
        card.appendChild(this._libraryCardBody(prof, sigSeal));
        card.appendChild(this._libraryCardFooter(prof, sigBtn, exportBtn));
        this._libraryWireSig(prof, sigSeal, sigBtn, exportBtn);
        return card;
    }

    // HEADER — Identität (Name + Stufe + Herkunfts-/Multiplayer-Marke) | TRUST-Siegel rechts
    // (die wichtigste Eigenschaft einer FREMDEN Welt — wie die Qualität die Werkstatt führt, §G.2).
    _libraryCardHeader(prof) {
        const idZone = this._el(
            "div",
            { class: "spec-id" },
            this._el("span", { class: "spec-name lib-card-name", text: prof.label }),
            this._el("span", {
                class: "lib-stage" + (prof.hasDsl ? "" : " stage-ausgestellt"),
                text: prof.stage,
                title: prof.stageTitle,
            })
        );
        if (prof.origin)
            idZone.appendChild(
                this._el("span", { class: prof.originClass, text: prof.origin, title: prof.originTitle })
            );
        if (prof.multiplayer) {
            const jsCompute = prof.serverMode === "js-compute";
            idZone.appendChild(
                this._el("span", {
                    class: "library-mp-mark",
                    text: jsCompute ? "Multiplayer · JS-Compute" : "Multiplayer",
                    title: jsCompute
                        ? "Eine Gruppe taucht gemeinsam ein; ein Peer wird Compute-Host für die autoritative Server-JS (W17 — B-JS-Compute)."
                        : "Eine Gruppe kann gemeinsam durch das Tor dieser Welt eintreten (W17 — Gruppen-Portal).",
                })
            );
        }
        // W18-B — die Ko-Präsenz-Abweichung signalisieren (wie Multiplayer):
        // ihr seht euch in dieser Welt, obwohl sie selbst keine Mitspieler kennt.
        if (prof.coPresence) {
            idZone.appendChild(
                this._el("span", {
                    class: "library-mp-mark",
                    text: "Ko-Präsenz",
                    title: "Ihr seht euch in dieser Welt — AnazhRealm trägt die Posen übers Mesh, die Welt rendert die Gefährten (W18-B).",
                })
            );
        }
        const trusted = prof.trust === "trusted";
        const trustZone = this._el(
            "div",
            {
                class: "spec-quality lib-trust",
                title: trusted
                    ? "Vertraute Welt — eine Built-in- oder eigene Welt; sie läuft im selben Kontext."
                    : "Sandgesichert — eine fremde, ungeprüfte Welt läuft null-origin (kann AnazhRealm nicht berühren). Irreversibel.",
            },
            this._el("span", { class: "spec-q-label", text: "Vertrauen" }),
            this._el("span", {
                class: "lib-trust-seal " + (trusted ? "trust-trusted" : "trust-sandboxed"),
                text: trusted ? "✓ vertraut" : "⛨ Sandbox",
            })
        );
        return this._el("div", { class: "spec-header" }, idZone, trustZone);
    }

    // BODY — EINE kompakte Meta-Zeile (V18.77): das DSL-Vokabular (die „Natur" der Welt) + die
    // Multiplayer-Abweichung + das async Signatur-Siegel. Profi-leicht (Feed-Card), kein Datenblatt.
    _libraryCardBody(prof, sigSeal) {
        // V18.77 — Profi-Lightening: EINE kompakte Meta-Zeile statt zwei beschrifteter Spalten. Die
        // „VOKABULAR"/„NETZ & VERTRAUEN"-Form-Labels machten die Karte zum Datenblatt; ein Feed-Card
        // zeigt nur die Signale, die zählen (DSL-Vokabular · nur Multiplayer-Abweichung · Signatur subtil).
        const meta = this._el("div", { class: "lib-card-meta" });
        if (prof.hasDsl)
            for (const op of prof.dsl) meta.appendChild(this._el("span", { class: "library-dsl-word", text: op }));
        else meta.appendChild(this._el("span", { class: "spec-empty", text: "kein DSL-Vokabular" }));
        // Einzelwelt ist der Default → nicht zeigen (Profi: nur die Abweichung signalisieren).
        if (prof.multiplayer)
            meta.appendChild(
                this._el("span", {
                    class: "lib-net-badge",
                    text: prof.serverMode === "js-compute" ? "Multiplayer · JS-Compute" : "Multiplayer",
                })
            );
        // W18-B — die Ko-Präsenz-Abweichung (ihr seht euch drinnen).
        if (prof.coPresence) meta.appendChild(this._el("span", { class: "lib-net-badge", text: "Ko-Präsenz" }));
        meta.appendChild(sigSeal);
        return this._el("div", { class: "spec-body lib-card-body" }, meta);
    }

    // FOOTER — der prominente BETRETEN-Akt (Portal holen / Welt aufbauen / neu aufbauen) + Status,
    // darunter die Signatur-Akte (Signieren / Teilen). Die Akt-Methoden + Klassen bleiben (Tests):
    // .library-get (Betreten), .library-build (aufbauen), .library-rebuild (neu), .library-sig-*.
    _libraryCardFooter(prof, sigBtn, exportBtn) {
        const worldId = prof.id;
        const needsScene = prof.translated && !prof.scene;
        const isTranslatedWithScene = prof.translated && !!prof.scene;
        const unreachable = prof.imported && prof.reachable === false;
        const status = this._el("span", { class: "library-status" });
        const acts = this._el("div", { class: "lib-card-acts" });
        if (needsScene) {
            const buildBtn = this._el("button", {
                class: "library-get library-build",
                type: "button",
                text: "Welt aufbauen",
                title: "Die KI gibt dieser übersetzten Welt eine deklarative Szene — danach führt ihr Portal hindurch.",
            });
            buildBtn.addEventListener("click", () => this._runWorldBuild(worldId, buildBtn, status));
            acts.appendChild(buildBtn);
        } else if (unreachable) {
            const getBtn = this._el("button", {
                class: "library-get",
                type: "button",
                text: "Betreten",
                disabled: true,
                title: "Die Welt-Dateien sind nicht verfügbar — nur das Manifest kam an.",
            });
            status.textContent = "Welt-Dateien nicht verfügbar";
            status.className = "library-status library-unreachable";
            acts.appendChild(getBtn);
        } else {
            const getBtn = this._el("button", {
                class: "library-get",
                type: "button",
                text: "Betreten",
                title: "Portal holen — legt ein Tor ins Inventar; platziere es über die Hotbar + geh per E-Taste hindurch.",
            });
            getBtn.addEventListener("click", () => {
                const res = this.obtainPortalForWorld(worldId);
                if (res.ok) {
                    status.textContent = `✓ „${res.label}" liegt im Inventar`;
                    this.log(`Bibliothek: Portal zur ${res.label} ins Inventar gelegt.`, "INFO");
                } else {
                    status.textContent = res.reason === "inventory_full" ? "Inventar voll" : "konnte nicht holen";
                    this.log(`obtainPortalForWorld: ${res.reason}`, "ERROR");
                }
            });
            acts.appendChild(getBtn);
            // Eine aufgebaute übersetzte Welt darf neu aufgebaut werden — frische Szene, selbe Identität.
            if (isTranslatedWithScene) {
                const rebuildBtn = this._el("button", {
                    class: "library-sig-btn library-rebuild",
                    type: "button",
                    text: "neu aufbauen",
                    title: "Die KI baut eine neue Szene für diese Welt.",
                });
                rebuildBtn.addEventListener("click", () => this._runWorldBuild(worldId, rebuildBtn, status));
                acts.appendChild(rebuildBtn);
            }
        }
        acts.appendChild(status);
        const sigRow = this._el("div", { class: "library-sig-row" });
        if (!prof.imported) sigRow.appendChild(sigBtn);
        sigRow.appendChild(exportBtn);
        return this._el("div", { class: "spec-footer lib-spec-footer" }, acts, sigRow);
    }

    // Die EINE async Signatur-Verifikation (verifyWorldSignature) — beschreibt das Body-Siegel +
    // schaltet die Footer-Knöpfe. Built-in/eigene signiert der Spieler (signWorld); importierte
    // tragen die Autor-Signatur schon. „Teilen" exportiert das signierte Manifest (W14 P3).
    _libraryWireSig(prof, seal, sigBtn, exportBtn) {
        const worldId = prof.id;
        const refresh = () => {
            const vpReady = !!(this.state.vibePass && this.state.vibePass.ready);
            this.verifyWorldSignature(worldId).then((st) => {
                const myKey = this.state.vibePass && this.state.vibePass.publicKeyHex;
                const custom = this.state.customWorlds && this.state.customWorlds[worldId];
                const sig =
                    custom && custom.signature ? custom : this.state.signedWorlds && this.state.signedWorlds[worldId];
                if (st === "valid") {
                    const who =
                        sig && sig.authorPubKey === myKey ? "dir" : this._vibeFingerprint(sig && sig.authorPubKey);
                    seal.textContent = `✓ signiert von ${who}`;
                    seal.className = "lib-sig-seal sig-valid";
                    if (sig) seal.title = "ed25519:" + sig.authorPubKey;
                    sigBtn.textContent = "Neu signieren";
                } else if (st === "modified") {
                    seal.textContent = "geändert — neu signieren";
                    seal.className = "lib-sig-seal sig-modified";
                    sigBtn.textContent = "Neu signieren";
                } else if (st === "forged") {
                    seal.textContent = "⚠ Signatur ungültig";
                    seal.className = "lib-sig-seal sig-forged";
                    sigBtn.textContent = "Neu signieren";
                } else {
                    seal.textContent = "nicht signiert";
                    seal.className = "lib-sig-seal sig-unsigned";
                    sigBtn.textContent = "Signieren";
                }
                exportBtn.disabled = st === "unsigned";
                sigBtn.disabled = prof.imported || !vpReady;
                if (!prof.imported && !vpReady) sigBtn.title = "Vibe-Pass nicht bereit — siehe Spieler-Drawer.";
            });
        };
        sigBtn.addEventListener("click", async () => {
            sigBtn.disabled = true;
            const res = await this.signWorld(worldId);
            if (res.ok) this.log(`Bibliothek: ${prof.label} mit dem Vibe-Pass signiert.`, "INFO");
            else this.log(`signWorld: ${res.reason}`, "ERROR");
            refresh();
        });
        exportBtn.addEventListener("click", () => {
            const res = this.exportWorldManifest(worldId);
            if (res.ok) this.log(`Bibliothek: Manifest der ${prof.label} exportiert.`, "INFO");
            else this.log(`exportWorldManifest: ${res.reason}`, "ERROR");
        });
        refresh();
    }

    // W14 Phase 1 — Bibliothek-Drawer aufsetzen. Phase 3: der „Welt
    // empfangen"-Knopf verkabelt einen versteckten Datei-Picker (analog
    // Vibe-Pass-Import).
    libraryInitDOM() {
        if (typeof document === "undefined") return;
        const importBtn = document.getElementById("library-import");
        if (importBtn && importBtn.dataset.libWired !== "1") {
            importBtn.dataset.libWired = "1";
            importBtn.addEventListener("click", () => {
                const input = document.getElementById("library-import-input");
                if (input) {
                    input.value = "";
                    input.click();
                }
            });
        }
        const fileInput = document.getElementById("library-import-input");
        if (fileInput && fileInput.dataset.libWired !== "1") {
            fileInput.dataset.libWired = "1";
            fileInput.addEventListener("change", (e) => {
                const f = e.target && e.target.files && e.target.files[0];
                if (f) this._handleWorldManifestFile(f);
            });
        }
        // Bib-D — die Selbst-Suche treibt das Karten-Raster (J5-Loop, der Loop WIRKT).
        const search = document.getElementById("library-search");
        if (search && search.dataset.libWired !== "1") {
            search.dataset.libWired = "1";
            search.addEventListener("input", () => this._applyLibraryFilter());
        }
        // V18.72/.73 — die fremde-Welt-Werkzeuge (rechts in der Schöpfen-Zone) als Akkordeon: eines
        // öffnen schliesst die Geschwister (EIN Fokus statt Wall-of-Forms; die Werkstatt-/Hof-Verdichtung).
        const feedTools = document.querySelectorAll(".feed-schoepfen .feed-tool");
        feedTools.forEach((d) => {
            if (d.dataset.accWired === "1") return;
            d.dataset.accWired = "1";
            d.addEventListener("toggle", () => {
                if (d.open)
                    feedTools.forEach((o) => {
                        if (o !== d) o.open = false;
                    });
            });
        });
        // V18.73 — die Feed-Tabs (Für dich | Aus dem Mesh): der Welt-Katalog (Peer-Welten) lebt im
        // Hauptthread als zweite Feed-Quelle (X-Muster), nicht in einem Seiten-Tool.
        const feedTabs = document.querySelectorAll(".feed-tabs .feed-tab");
        feedTabs.forEach((b) => {
            if (b.dataset.tabWired === "1") return;
            b.dataset.tabWired = "1";
            b.addEventListener("click", () => this._setFeedTab(b.dataset.feedTab));
        });
        this.renderLibraryUI();
    }

    // V18.73 — der Feed-Tab-Wechsel (Für dich = der Strom · Aus dem Mesh = der Peer-Welt-Katalog).
    // Die Welt-Katalog-Quelle ist jetzt eine Feed-Quelle im Hauptthread (X-Muster Public/Following).
    _setFeedTab(tab) {
        if (typeof document === "undefined") return;
        const which = tab === "mesh" ? "mesh" : "foryou";
        for (const b of document.querySelectorAll(".feed-tabs .feed-tab"))
            b.classList.toggle("active", b.dataset.feedTab === which);
        const foryou = document.getElementById("feed-foryou-panel");
        const mesh = document.getElementById("feed-mesh-panel");
        if (foryou) foryou.hidden = which !== "foryou";
        if (mesh) mesh.hidden = which !== "mesh";
        // der Mesh-Katalog rendert frisch beim Öffnen (er lebt vom Mesh-Zustand, nicht vom Feed).
        if (which === "mesh" && typeof this._renderMeshWorldCatalog === "function") this._renderMeshWorldCatalog();
    }

    // W14 Phase 3 — eine Welt-Manifest-Datei einlesen → importWorldManifest.
    _handleWorldManifestFile(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            let parsed = null;
            try {
                parsed = JSON.parse(reader.result);
            } catch (e) {
                this.log(`Welt-Import fehlgeschlagen (${file.name}): ${e && e.message}`, "ERROR");
                return;
            }
            // Der EINE „Welt empfangen"-Eingang erkennt die Datei-Art an der Form: State-Snapshot (trägt
            // `worldMeta`) → Welt-Tor (ersetzen · daneben · verschmelzen); sonst fremdes Welt-Manifest → andocken.
            if (parsed && typeof parsed === "object" && parsed.worldMeta && typeof parsed.worldMeta === "object") {
                this._openWeltTorDialog(parsed, file);
                return;
            }
            this.importWorldManifest(parsed).then((res) => {
                if (res.ok) {
                    const sigNote =
                        res.signatureStatus === "valid"
                            ? "signiert"
                            : res.signatureStatus === "unsigned"
                              ? "unsigniert"
                              : "Signatur " + res.signatureStatus;
                    this.log(
                        `Bibliothek: Welt „${res.id}" empfangen (${sigNote}` +
                            (res.reachable ? "" : ", Dateien nicht verfügbar") +
                            ").",
                        "INFO"
                    );
                    this.renderLibraryUI();
                } else {
                    this.log(`importWorldManifest: ${res.reason}`, "ERROR");
                }
            });
        };
        reader.onerror = () => this.log(`FileReader-Fehler bei ${file.name}`, "ERROR");
        reader.readAsText(file);
    }

    // ===== KI-Übersetzer — UI =====
    // Der Spieler beschreibt eine fremde Welt, die KI übersetzt sie in ein Manifest, der Spieler prüft und
    // nimmt auf — der Review-Schritt ist die Wand vor der Bibliothek.
    translatorInitDOM() {
        if (typeof document === "undefined") return;
        const runBtn = document.getElementById("translator-run");
        if (runBtn && runBtn.dataset.wired !== "1") {
            runBtn.dataset.wired = "1";
            runBtn.addEventListener("click", () => this._runTranslator());
        }
    }

    // Reason-Code → menschenlesbarer Hinweis (V7.98-Disziplin: dem Spieler
    // einen klaren Weg nach vorn zeigen, nicht einen rohen Fehler-Code).
    _translatorReasonText(reason) {
        const map = {
            description_too_short: "Beschreibe die Welt etwas ausführlicher (ein paar Worte mindestens).",
            description_too_long: "Die Beschreibung ist zu lang — fasse dich kürzer (max. 4000 Zeichen).",
            "LLM nicht aktiv": "Keine KI aktiv — schalte sie im Einstellungen-Drawer ein.",
            "API-Key fehlt": "Der KI fehlt ein API-Key — siehe Einstellungen-Drawer.",
            no_manifest_in_response:
                "Die KI lieferte kein verwertbares Manifest. Versuch es nochmal oder beschreibe die Welt klarer.",
            id_is_builtin: "Die KI wählte eine schon vergebene Welt-id — versuch es nochmal.",
            invalid_manifest: "Das übersetzte Manifest war unbrauchbar — versuch es nochmal.",
            no_scene_in_response: "Die KI lieferte keine verwertbare Szene. Versuch es nochmal.",
            world_too_thin: "Diese Welt hat zu wenig Substanz — übersetze sie zuerst ausführlicher.",
            not_translated: "Nur KI-übersetzte Welten lassen sich aufbauen.",
            world_unknown: "Diese Welt ist nicht in der Bibliothek.",
        };
        return map[reason] || `Übersetzung fehlgeschlagen: ${reason}`;
    }

    // Den Übersetzer laufen lassen (Knopf-Handler).
    async _runTranslator() {
        if (typeof document === "undefined") return;
        const input = document.getElementById("translator-input");
        const status = document.getElementById("translator-status");
        const review = document.getElementById("translator-review");
        const runBtn = document.getElementById("translator-run");
        if (!input || !status) return;
        if (review) {
            review.hidden = true;
            review.innerHTML = "";
        }
        status.textContent = "Die KI übersetzt …";
        status.className = "translator-status";
        if (runBtn) runBtn.disabled = true;
        let res;
        try {
            res = await this.translateWorldManifest(input.value || "");
        } catch (e) {
            res = { ok: false, reason: (e && e.message) || "Fehler" };
        }
        if (runBtn) runBtn.disabled = false;
        if (res && res.ok) {
            status.textContent = "";
            this._renderTranslatorReview(res.manifest);
        } else {
            status.textContent = this._translatorReasonText(res ? res.reason : "Fehler");
            status.className = "translator-status translator-status-error";
        }
    }

    // Ein beschriftetes Feld für die Übersetzer-Vorschau.
    _translatorField(label, el) {
        const wrap = document.createElement("div");
        wrap.className = "translator-field";
        const lab = document.createElement("div");
        lab.className = "translator-field-label";
        lab.textContent = label;
        wrap.appendChild(lab);
        wrap.appendChild(el);
        return wrap;
    }

    // Den KI-Vorschlag zum Prüfen rendern: id (fest), Name + Beschreibung
    // (editierbar), DSL-Vokabular (Chips). „Aufnehmen" committet das (ggf.
    // nachjustierte) Manifest, „Verwerfen" verwirft es.
    _renderTranslatorReview(manifest) {
        if (typeof document === "undefined") return;
        const review = document.getElementById("translator-review");
        if (!review) return;
        review.innerHTML = "";
        review.hidden = false;

        const title = document.createElement("div");
        title.className = "translator-review-title";
        title.textContent = "KI-Vorschlag — prüfen und aufnehmen";
        review.appendChild(title);

        const idRow = document.createElement("div");
        idRow.className = "translator-field-id";
        idRow.textContent = "id: " + manifest.id;
        review.appendChild(idRow);

        const labelInput = document.createElement("input");
        labelInput.type = "text";
        labelInput.className = "translator-edit";
        labelInput.maxLength = 60;
        labelInput.value = manifest.label || "";
        review.appendChild(this._translatorField("Name", labelInput));

        const descInput = document.createElement("textarea");
        descInput.className = "translator-edit translator-edit-desc";
        descInput.rows = 2;
        descInput.maxLength = 240;
        descInput.value = manifest.desc || "";
        review.appendChild(this._translatorField("Beschreibung", descInput));

        const dslWrap = document.createElement("div");
        dslWrap.className = "library-dsl";
        const dsl = Array.isArray(manifest.dsl) ? manifest.dsl : [];
        if (dsl.length) {
            for (const op of dsl) {
                const chip = document.createElement("span");
                chip.className = "library-dsl-word";
                chip.textContent = op;
                dslWrap.appendChild(chip);
            }
        } else {
            const none = document.createElement("span");
            none.className = "library-dsl-empty";
            none.textContent = "kein DSL-Vokabular";
            dslWrap.appendChild(none);
        }
        review.appendChild(this._translatorField("DSL-Vokabular", dslWrap));

        const actions = document.createElement("div");
        actions.className = "actions";
        const acceptBtn = document.createElement("button");
        acceptBtn.type = "button";
        acceptBtn.textContent = "In Bibliothek aufnehmen";
        acceptBtn.addEventListener("click", () => {
            const edited = Object.assign({}, manifest, {
                label: labelInput.value,
                desc: descInput.value,
            });
            const res = this.acceptTranslatedManifest(edited);
            const status = document.getElementById("translator-status");
            if (res.ok) {
                if (status) {
                    status.textContent = `✓ „${res.label}" steht jetzt in deiner Bibliothek.`;
                    status.className = "translator-status";
                }
                review.hidden = true;
                review.innerHTML = "";
                const inp = document.getElementById("translator-input");
                if (inp) inp.value = "";
                this.renderLibraryUI();
                this.log(`KI-Übersetzer: „${res.label}" in die Bibliothek aufgenommen.`, "INFO");
            } else if (status) {
                status.textContent = this._translatorReasonText(res.reason);
                status.className = "translator-status translator-status-error";
            }
        });
        const discardBtn = document.createElement("button");
        discardBtn.type = "button";
        discardBtn.textContent = "Verwerfen";
        discardBtn.addEventListener("click", () => {
            review.hidden = true;
            review.innerHTML = "";
        });
        actions.appendChild(acceptBtn);
        actions.appendChild(discardBtn);
        review.appendChild(actions);
    }

    // KI-Übersetzer Phase 2 — den Welt-Aufbau auslösen (Knopf-Handler der
    // Bibliothek-Karte). Generiert die deklarative Szene und macht die Welt
    // betretbar; danach rendert renderLibraryUI die Karte neu.
    async _runWorldBuild(worldId, btn, statusEl) {
        if (btn) btn.disabled = true;
        if (statusEl) {
            statusEl.textContent = "Die KI baut die Welt …";
            statusEl.className = "library-status";
        }
        let res;
        try {
            res = await this.buildTranslatedWorld(worldId);
        } catch (e) {
            res = { ok: false, reason: (e && e.message) || "Fehler" };
        }
        if (res && res.ok) {
            this.log(`KI-Übersetzer: „${res.label}" hat einen Körper — die Welt ist betretbar.`, "INFO");
            this.renderLibraryUI();
        } else {
            if (btn) btn.disabled = false;
            if (statusEl) {
                statusEl.textContent = this._translatorReasonText(res ? res.reason : "Fehler");
                statusEl.className = "library-status library-unreachable";
            }
        }
    }

    // ===== Auto-Vendor — UI =====
    // Der Spieler wählt den Ordner einer fremden Welt + nennt id/Name; der save-server schreibt nach
    // worlds/<id>/, die Welt wird ein sandgesicherter Bibliothek-Eintrag.

    // Reason-Code → menschenlesbarer Hinweis (wie _translatorReasonText).
    _vendorReasonText(reason) {
        const map = {
            invalid_world_id: "Die Welt-id darf nur a-z, 0-9, - und _ enthalten (1-40 Zeichen).",
            reserved_world_id: "Diese id gehört einer Built-in-Welt — wähle eine andere.",
            no_files: "Es wurden keine Dateien gewählt.",
            too_many_files: "Der Ordner enthält zu viele Dateien für ein Welt-Bündel.",
            bad_file_entry: "Eine Datei im Bündel ist unbrauchbar.",
            bad_file_path: "Ein Datei-Pfad ist unsicher (kein Verzeichnis-Aufstieg, kein absoluter Pfad).",
            bad_file_ext: "Eine Datei hat eine nicht erlaubte Endung (nur Text: html/js/css/json/…).",
            file_too_large: "Eine Datei ist zu groß fürs Vendoring.",
            bundle_too_large: "Das Welt-Bündel ist insgesamt zu groß.",
            no_index_html: "Dem Bündel fehlt eine index.html im Wurzel-Ordner (der Welt-Eingang).",
            save_server_unreachable:
                "Der lokale save-server ist nicht erreichbar — Vendoring braucht die Dev-Umgebung (npm start).",
            invalid_manifest: "Das Welt-Manifest war unbrauchbar.",
            not_a_github_url: "Das ist keine github.com-Repo-URL — z. B. https://github.com/owner/repo.",
        };
        return map[reason] || `Andocken fehlgeschlagen: ${reason}`;
    }

    // Picked File-Objekte → [{path, content}]. webkitdirectory liefert
    // "<ordner>/<pfad>" — die erste Stufe (der Ordnername) fällt weg. Nur
    // Text-Endungen, kein node_modules / .git / versteckte Pfade.
    _vendorReadFiles(fileList) {
        const lim = AnazhRealm.VENDOR_LIMITS;
        const wanted = [];
        for (const f of fileList) {
            let rel = f.webkitRelativePath || f.name || "";
            const slash = rel.indexOf("/");
            if (slash >= 0 && f.webkitRelativePath) rel = rel.slice(slash + 1);
            if (!rel) continue;
            if (/(^|\/)(node_modules|\.git)(\/|$)/.test(rel) || /(^|\/)\./.test(rel)) continue;
            const ext = (rel.split(".").pop() || "").toLowerCase();
            if (lim.allowedExt.indexOf(ext) < 0) continue;
            wanted.push({ file: f, rel });
            if (wanted.length > lim.maxFiles) break;
        }
        return Promise.all(
            wanted.map(
                (w) =>
                    new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve({ path: w.rel, content: String(reader.result || "") });
                        reader.onerror = () => resolve(null);
                        reader.readAsText(w.file);
                    })
            )
        ).then((arr) => arr.filter(Boolean));
    }

    // Zeigt nach dem Ordner-Wählen, wie viele verwertbare Dateien drin sind.
    _vendorRenderPicked() {
        if (typeof document === "undefined") return;
        const fileInput = document.getElementById("vendor-files");
        const status = document.getElementById("vendor-status");
        if (!fileInput || !status) return;
        const lim = AnazhRealm.VENDOR_LIMITS;
        let n = 0;
        for (const f of fileInput.files || []) {
            const rel = f.webkitRelativePath || f.name || "";
            if (/(^|\/)(node_modules|\.git)(\/|$)/.test(rel) || /(^|\/)\./.test(rel)) continue;
            if (lim.allowedExt.indexOf((rel.split(".").pop() || "").toLowerCase()) >= 0) n++;
        }
        status.className = "vendor-status";
        status.textContent = n ? `${n} verwertbare Datei(en) gewählt — id + Name eingeben, dann Andocken.` : "";
    }

    // Den Auto-Vendor laufen lassen (Knopf-Handler).
    async _runVendorDock() {
        if (typeof document === "undefined") return;
        const idEl = document.getElementById("vendor-id");
        const labelEl = document.getElementById("vendor-label");
        const descEl = document.getElementById("vendor-desc");
        const dslEl = document.getElementById("vendor-dsl");
        const fileInput = document.getElementById("vendor-files");
        const status = document.getElementById("vendor-status");
        const dockBtn = document.getElementById("vendor-dock");
        if (!idEl || !status) return;
        status.className = "vendor-status";
        const picked = fileInput && fileInput.files ? Array.from(fileInput.files) : [];
        if (!picked.length) {
            status.textContent = "Wähle zuerst den Ordner einer Welt.";
            status.className = "vendor-status vendor-status-error";
            return;
        }
        status.textContent = "Lese die Dateien …";
        if (dockBtn) dockBtn.disabled = true;
        let files = null;
        try {
            files = await this._vendorReadFiles(picked);
        } catch {
            files = null;
        }
        if (!files || !files.length) {
            status.textContent = "Keine verwertbaren Text-Dateien im Ordner gefunden.";
            status.className = "vendor-status vendor-status-error";
            if (dockBtn) dockBtn.disabled = false;
            return;
        }
        status.textContent = "Die Welt dockt an …";
        const dsl = String(dslEl ? dslEl.value : "")
            .split(/[\s,]+/)
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);
        let res;
        try {
            const mpEl = document.getElementById("vendor-multiplayer");
            const jsEl = document.getElementById("vendor-js-compute");
            res = await this.vendorWorldBundle({
                worldId: idEl.value,
                label: labelEl ? labelEl.value : "",
                desc: descEl ? descEl.value : "",
                dsl,
                // Eine JS-Compute-Welt ist per Natur mehrspielerfähig.
                multiplayer: !!((mpEl && mpEl.checked) || (jsEl && jsEl.checked)),
                serverMode: jsEl && jsEl.checked ? "js-compute" : "relay",
                files,
            });
        } catch (e) {
            res = { ok: false, reason: (e && e.message) || "Fehler" };
        }
        if (dockBtn) dockBtn.disabled = false;
        if (res && res.ok) {
            status.textContent = `✓ „${res.label}" ist angedockt (${res.fileCount} Dateien) — siehe „Welten" unten.`;
            this.renderLibraryUI();
            this.log(`Auto-Vendor: Welt „${res.id}" angedockt.`, "INFO");
        } else {
            status.textContent = this._vendorReasonText(res ? res.reason : "Fehler");
            status.className = "vendor-status vendor-status-error";
        }
    }

    // W15 Phase 2 — den GitHub-Fetch laufen lassen (Knopf-Handler). Teilt
    // sich die id/Name/Beschreibung/DSL-Felder mit dem Bündel-Pfad.
    async _runVendorRepoDock() {
        if (typeof document === "undefined") return;
        const idEl = document.getElementById("vendor-id");
        const labelEl = document.getElementById("vendor-label");
        const descEl = document.getElementById("vendor-desc");
        const dslEl = document.getElementById("vendor-dsl");
        const repoEl = document.getElementById("vendor-repo");
        const status = document.getElementById("vendor-status");
        const btn = document.getElementById("vendor-repo-dock");
        if (!idEl || !status) return;
        status.className = "vendor-status";
        const repoUrl = String(repoEl ? repoEl.value : "").trim();
        if (!repoUrl) {
            status.textContent = "Gib eine GitHub-Repo-URL an.";
            status.className = "vendor-status vendor-status-error";
            return;
        }
        status.textContent = "Hole das Repo von GitHub …";
        if (btn) btn.disabled = true;
        const dsl = String(dslEl ? dslEl.value : "")
            .split(/[\s,]+/)
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);
        let res;
        try {
            const mpEl = document.getElementById("vendor-multiplayer");
            const jsEl = document.getElementById("vendor-js-compute");
            res = await this.vendorWorldFromRepo({
                worldId: idEl.value,
                repoUrl,
                label: labelEl ? labelEl.value : "",
                desc: descEl ? descEl.value : "",
                dsl,
                // Eine JS-Compute-Welt ist per Natur mehrspielerfähig.
                multiplayer: !!((mpEl && mpEl.checked) || (jsEl && jsEl.checked)),
                serverMode: jsEl && jsEl.checked ? "js-compute" : "relay",
            });
        } catch (e) {
            res = { ok: false, reason: (e && e.message) || "Fehler" };
        }
        if (btn) btn.disabled = false;
        if (res && res.ok) {
            status.textContent = `✓ „${res.label}" aus GitHub geholt (${res.fileCount} Dateien) — siehe „Welten" unten.`;
            this.renderLibraryUI();
            this.log(`Auto-Vendor: Welt „${res.id}" aus GitHub angedockt.`, "INFO");
        } else {
            status.textContent = this._vendorReasonText(res ? res.reason : "Fehler");
            status.className = "vendor-status vendor-status-error";
        }
    }

    // W15 — die „Welt andocken"-Sektion verkabeln: der Ordner-Picker + der
    // Andocken-Knopf (Phase 1) + der GitHub-Holen-Knopf (Phase 2).
    vendorInitDOM() {
        if (typeof document === "undefined") return;
        const pickBtn = document.getElementById("vendor-pick");
        const fileInput = document.getElementById("vendor-files");
        if (pickBtn && fileInput && pickBtn.dataset.wired !== "1") {
            pickBtn.dataset.wired = "1";
            pickBtn.addEventListener("click", () => {
                fileInput.value = "";
                fileInput.click();
            });
            fileInput.addEventListener("change", () => this._vendorRenderPicked());
        }
        const dockBtn = document.getElementById("vendor-dock");
        if (dockBtn && dockBtn.dataset.wired !== "1") {
            dockBtn.dataset.wired = "1";
            dockBtn.addEventListener("click", () => this._runVendorDock());
        }
        const repoBtn = document.getElementById("vendor-repo-dock");
        if (repoBtn && repoBtn.dataset.wired !== "1") {
            repoBtn.dataset.wired = "1";
            repoBtn.addEventListener("click", () => this._runVendorRepoDock());
        }
    }

    // DSL-Manifest säubern: nur op-förmige Strings (klein + Unterstrich, ≤40 Zeichen), max 64 — für das
    // portalMeta-Manifest (Stufe „übersetzt") und das native ready-Manifest (Stufe „nativ"). null, wenn
    // nichts Gültiges bleibt — eine Sub-Welt kann kein garbage-Op deklarieren.
    _sanitizeDslSubset(arr) {
        if (!Array.isArray(arr)) return null;
        const ops = arr.filter((op) => typeof op === "string" && /^[a-z_]{1,40}$/.test(op));
        return ops.length ? ops.slice(0, 64) : null;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_werkstatt_sozial]);

// ===== ATLAS · Werkstatt/sozial — Außen-Konstanten =====
// SOCIAL — signierte Bewertungs-Zeugnisse übers Mesh: {id, s, t, pub, sig}, sig = ed25519(canonical)
// mit der Vibe-Pass-Identität (unfälschbar); LWW (neuestes t je (id, pub)) macht sie CRDT-tauglich.
// Kanal-exklusiv (DataChannel, nicht WS-injizierbar), R1-rate-gegated, revozierte Schlüssel fallen
// aus der Aggregation. Global in localStorage (anazh.socialRatings), NIE im Welt-Snapshot.
// FORAGE (unten) — Klein-Vegetation ist pflückbar: reach = Arm-Länge (kürzer als der Abbau-Ray), die Ernte eine Tat
// der Welt (`worldMeta.taten`, feld.K4); der Index ist stabil
// (deterministisches per-Chunk-RNG, Geerntetes → Skala 0, nie umnummeriert).
// CA_STAU (unten) — Stau-Regel des Wasser-Automaten: ein Spieler-Werk über dem Ruhe-Spiegel öffnet
// die Kappe LOKAL; ein bounded Spill-Scan (Priority-Flood) liefert je Spalte den Halte-Pegel
// (billigster Ausweg über Krone/Ufer/Fensterrand). Ein Pfeiler staut so nicht, ein Damm bis zur
// Krone; ohne Spieler-Werk ist die Kappe bit-identisch. REACH weiter = größere Stauseen.
AnazhRealm.SOCIAL = Object.freeze({
    maxStore: 600, // Zeugnisse gesamt (LWW-dedupe; aelteste t fallen)
    maxBatch: 32, // Zeugnisse pro Mesh-Batch (Anschluss-Annonce)
    ratePerSec: 12, // R1-Empfangs-Deckel pro Peer
    // F4 Stufe 4 (V18.143) — KOMMENTARE (signierte Text-Zeugnisse, append-only).
    maxComments: 400, // Kommentare gesamt (aelteste t fallen — bounded, §5-Wand)
    maxCommentLen: 240, // Zeichen pro Kommentar (die Journal-Laenge)
    maxCommentBatch: 16, // Kommentare pro Anschluss-Annonce
    maxCommentsShown: 8, // juengste je Karte sichtbar (das Panel bleibt leicht)
});

// Vendor-Limits: MÜSSEN mit save-server.js (VENDOR_MAX_*) übereinstimmen — der Server ist die
// maßgebliche Wand, _vendorSanitizeBundle nur die freundliche Vorab-Prüfung.
AnazhRealm.VENDOR_LIMITS = Object.freeze({
    maxFiles: 64,
    maxFileBytes: 4 * 1024 * 1024,
    maxTotalBytes: 12 * 1024 * 1024,
    allowedExt: Object.freeze(["html", "htm", "js", "mjs", "css", "json", "txt", "md", "glsl"]),
});

// Farb-Sprache: jede Rolle eine feste Farbe (Rollen-Chip + Werkstatt-Zeile) — Bauwerk Stein-Erdgrau,
// Werkzeug Schmiede-Rot, Rüstung Stahl-Blau, Konsumable Violett, Seele Cyan, Maschine Bronze,
// Portal Tor-Grün.
AnazhRealm.BLUEPRINT_ROLE_COLORS = Object.freeze({
    architecture: "#9a9088",
    tool: "#c44830",
    armor: "#7d96b8",
    consumable: "#a878b8",
    soul: "#88e1e1",
    machine: "#b08648",
    portal: "#43c98a",
    vehicle: "#c98a43", // M2 — Wagen-Ocker (Reise/Leder)
    "workshop-station": "#cc6b35", // M2 — Essen-Glut (die Designation sichtbar)
});
