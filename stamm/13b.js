class AnazhRealm_Z13b {
    // ===== ATLAS §13b · IDENTITÄT/WELTEN/SOZIAL — Block Werkstatt =====
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
        this.updateWorldInfo();
    }

    // Welt-Erstellungs-Dialog (native <dialog>) mit drei Pfaden:
    //   1) Allein → private Welt (createNewWorld)
    //   2) Host → createNewWorld mit role="host", Auto-Start P2P nach Reload, Banner mit Einladungs-Code
    //   3) Joinen → joinWorldFromCode (world-request → world-snapshot → _importGuestWorld → Reload)
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
            const result = await this.joinWorldFromCode(code, { slugHint: slug || null });
            if (!result.ok) {
                const reason = {
                    invalid_code: "Einladungs-Code ist ungültig. Erwartet: anazh://host:port/raumId",
                    timeout: "Timeout — Host antwortet nicht. Läuft der signaling-server beim Host?",
                    ws_error: "Verbindung gescheitert — IP + Port + Firewall prüfen.",
                    ws_throw: "WebSocket konnte nicht geöffnet werden.",
                    import_failed: "Welt-Snapshot konnte nicht importiert werden.",
                    no_websocket: "Dieser Browser unterstützt WebSocket nicht.",
                };
                statusEl.textContent = reason[result.reason] || `Fehler: ${result.reason}`;
                confirmBtn.disabled = false;
                return;
            }
            statusEl.textContent = "Welt empfangen — lade…";
            cleanup();
            dialog.close();
            // (die Tür lädt in die Gast-Welt: `joinWorldFromCode` → `_importGuestWorld` → `_weltBetreten`)
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

    // Host-Banner, nur bei worldMeta.role === "host": zeigt den Einladungs-Code. URL aus den LAN-Adressen
    // der welcome-Message des signaling-servers; Fallback: aktuelle p2p.url.
    _renderHostBanner() {
        const banner = document.getElementById("world-host-banner");
        if (!banner) return;
        const role = this.state.worldMeta && this.state.worldMeta.role;
        if (role !== "host") {
            banner.hidden = true;
            banner.innerHTML = "";
            return;
        }
        const worldId = this.state.worldMeta.worldId;
        if (!worldId) {
            banner.hidden = true;
            return;
        }
        // Bevorzuge LAN-Adresse, wenn vorhanden — sonst was im URL-Feld steht.
        const lanAddrs = (this.state.p2p && this.state.p2p.lanAddresses) || [];
        let inviteUrl;
        if (lanAddrs.length > 0) {
            inviteUrl = `ws://${lanAddrs[0]}`;
        } else {
            inviteUrl = (this.state.p2p && this.state.p2p.url) || AnazhRealm.P2P_DEFAULT_WS_URL;
        }
        const code = this.makeInvitationCode(inviteUrl, worldId) || "(Code-Erzeugung fehlgeschlagen)";
        const connected = this.state.p2p && this.state.p2p.connected;
        const peerCount = (this.state.p2p && this.state.p2p.peers && this.state.p2p.peers.size) || 0;
        banner.hidden = false;
        banner.innerHTML = "";
        const line1 = document.createElement("div");
        line1.innerHTML = `<strong>Du hostest diese Welt.</strong> Status: ${
            connected ? "Bereit für Mitspieler" : "Verbinde…"
        }${peerCount > 0 ? ` (${peerCount} verbunden)` : ""}`;
        const line2 = document.createElement("div");
        line2.style.marginTop = "0.35em";
        line2.textContent = "Einladungs-Code für Mitspieler:";
        const codeRow = document.createElement("div");
        codeRow.style.marginTop = "0.3em";
        codeRow.style.display = "flex";
        codeRow.style.alignItems = "center";
        codeRow.style.flexWrap = "wrap";
        codeRow.style.gap = "0.4em";
        const codeEl = document.createElement("code");
        codeEl.textContent = code;
        codeRow.appendChild(codeEl);
        const copyBtn = document.createElement("button");
        copyBtn.type = "button";
        copyBtn.className = "invite-copy-btn";
        copyBtn.textContent = "kopieren";
        copyBtn.addEventListener("click", () => {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(code).then(
                    () => {
                        copyBtn.textContent = "kopiert!";
                        setTimeout(() => (copyBtn.textContent = "kopieren"), 1500);
                    },
                    () => {
                        copyBtn.textContent = "Code: " + code;
                    }
                );
            } else {
                copyBtn.textContent = "Code: " + code;
            }
        });
        codeRow.appendChild(copyBtn);
        banner.appendChild(line1);
        banner.appendChild(line2);
        banner.appendChild(codeRow);
        if (lanAddrs.length === 0) {
            const hint = document.createElement("div");
            hint.style.marginTop = "0.4em";
            hint.style.fontSize = "0.85em";
            hint.style.opacity = "0.8";
            hint.textContent =
                "Hinweis: Server hat noch keine LAN-Adresse zurückgemeldet. Der Code zeigt deine eingestellte URL — falls 127.0.0.1, müssen Mitspieler die Lan-IP manuell ersetzen.";
            banner.appendChild(hint);
        }
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
        //   - lokaler save-server → POST /api/save-state
        //   - anderswo + fallbackToDownload=true → Browser-Download
        //   - anderswo + fallbackToDownload=false (Auto-Save) → still aussteigen
        const { fallbackToDownload = true } = options;
        const stateToSave = this.buildStateSnapshot();

        if (!this.isSaveServerHost()) {
            if (fallbackToDownload) {
                this.triggerStateDownload(stateToSave);
                this.log("Zustand als Datei heruntergeladen (kein lokaler save-server erreichbar)");
                return "download";
            }
            this.log("Auto-Save übersprungen (kein lokaler save-server)", "DEBUG");
            return false;
        }

        try {
            const response = await fetch("http://localhost:4312/api/save-state", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fileName: "anazhRealmState.json",
                    state: stateToSave,
                }),
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const result = await response.json();
            this.log(`Zustand direkt im Spielordner gespeichert: ${result.path || "anazhRealmState.json"}`);
            return "server";
        } catch (error) {
            if (!fallbackToDownload) {
                this.log(`Direktes Speichern im Spielordner fehlgeschlagen (${error.message})`, "ERROR");
                return false;
            }
            this.triggerStateDownload(stateToSave);
            this.log(
                `Direktes Speichern im Spielordner fehlgeschlagen (${error.message}). Download-Fallback gestartet`,
                "ERROR"
            );
            return "download";
        }
    }

    // Lädt einen Zustand IN DIE SEITE (ohne Argument: den Platz der aktiven Welt). Er legt nichts im Speicher ab — eine
    // andere Welt betritt den Speicher nur durch die Tür `_weltBetreten` (bis 10.10. spiegelte loadState jeden fremden
    // Zustand roh in den Speicher, ohne worldId auf den Platz der Welt der Seite).
    loadState(externalState = null) {
        let state = externalState;
        if (!state) {
            state = this._loadStateLoadFromStorage();
            if (!state) return false;
        }
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
        return true;
    }

    // Der Zustand der aktiven Welt aus dem Speicher — durch DIE Rettungs-Kette `_weltRettungsKette` (Platz → .bak →
    // IndexedDB des Boot-Vorlaufs, der hier verbraucht wird; Welt-Guard: nur für DIESELBE Welt). Ohne Aktiv-Zeiger der
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
        if (fund.quelle !== "Platz")
            this.log(
                `Welt aus ${fund.quelle} geladen${fund.befund.length ? ` (${fund.befund.join(", ")})` : ""}.`,
                fund.quelle.startsWith("IndexedDB (frischer") ? "INFO" : "WARN"
            );
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
        // Welt-Wechsel ist eine WELT-IDENTITÄTS-GRENZE: lazy-cached Worldgen-Caches MÜSSEN zurück, sonst trägt
        // die neue Welt alte Welt-Stempel (P2P-Drift). _growTreeNoise hängt an worldSeed (rebuild lazy),
        // _growTreeRing trägt alte Bauplan-Keys; grown_*-Baupläne räumt _loadStateRestoreGrownBlueprints.
        // Same-World-Reload ist sicher (gleicher Seed → Noise bit-identisch).
        this._growTreeNoise = null;
        this._growTreeRing = [];
        // Der soul-keyed Scent-sizeFactor-Cache wird am Welt-Wechsel geleert: eine andere Welt kann
        // CREATURE_SOULS-Custom-Definitionen austauschen.
        if (this._scentSizeBySoul) this._scentSizeBySoul.clear();
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
        if (state.worldMeta && typeof state.worldMeta === "object") {
            // DIE WELTGRENZE: die geladene Welt ersetzt das worldMeta ganz (`_weltMetaWechsel`), das EINE Heil jeder Welt
            // heilt sie (Seed, Voxel-Boden), und die Gedächtnisse der Seite, die welt-eigene Felder spiegeln
            // (`AnazhRealm.WELT_GRENZE.gedaechtnis`: Erbgut-Merker, Ring, Vorschau, Dorf-Zug), fallen mit ihm — der
            // Heiß-Pfad liest den Erbgut-Merker direkt.
            this.state.worldMeta = this._weltMetaWechsel(state.worldMeta);
            AnazhRealm._weltMetaHeil(this.state.worldMeta);
            for (const k of AnazhRealm.WELT_GRENZE.gedaechtnis) this[k] = null;
        } else {
            // Ein Zustand ohne worldMeta ist keine Welt (ein Bruchstück: Baupläne, Hotbar, Seele) — er quert keine Grenze,
            // die Welt der Seite bleibt sie selbst.
            this.log("Save-Migration: kein worldMeta gefunden — die Welt der Seite bleibt", "INFO");
        }
        // V18.221 — die SCATTER-PROMOTED-Set aus dem worldMeta-Array wiederherstellen.
        // worldMeta.scatterPromoted wandert via Array, hier re-bilden wir das Set.
        // Backward-kompat: alte Welten ohne Feld → leeres Set.
        if (this.state.worldMeta && Array.isArray(this.state.worldMeta.scatterPromoted)) {
            this.state.scatterPromoted = new Set(this.state.worldMeta.scatterPromoted);
            // worldMeta.scatterPromoted entfernen (es lebt jetzt in state.scatterPromoted
            // als Set; die nächste buildStateSnapshot serialisiert neu).
            delete this.state.worldMeta.scatterPromoted;
        } else {
            this.state.scatterPromoted = new Set();
        }
        // Scatter-Counters + Lookup-Buffer beim Welt-Wechsel resetten; sie bauen sich beim Stream neu.
        // Nicht persistiert (Session-Tatsache, kein Welt-Erbgut).
        this.state.scatterCounters = { tree: 0, under: 0, stone: 0 };
        this.state.scatterLookup = new Map();
        // V18.219 — den Region-Bake-Cache beim Welt-Wechsel leeren (Region-
        // gebackene Felder sind welt-bound; eine neue Welt sampelt neu).
        if (this.state.bakedRegionFields) this.state.bakedRegionFields.clear();
        this._bakedRegionRing = [];
        // V18.218.1 — den LOD-Cursor zurücksetzen (rolling pointer; welt-bound).
        this._archLODCursor = 0;
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
        // Studio-Übergabe VOR playerSoul restaurieren (der Seelen-Guss liest _koerperStudioDials); jeder Wert
        // läuft durch DENSELBEN fail-closed-Validator wie der Empfang. Ohne Feld byte-alt (koerper null,
        // kreatur {}); Müll fällt still.
        if (state.studioUebergabe && typeof state.studioUebergabe === "object") {
            const su = state.studioUebergabe;
            const ziel =
                this.state.studioUebergabe && typeof this.state.studioUebergabe === "object"
                    ? this.state.studioUebergabe
                    : (this.state.studioUebergabe = { koerper: null, kreatur: {} });
            const k =
                su.koerper && typeof su.koerper === "object"
                    ? this._studioUebergabeValidate("koerper", su.koerper)
                    : null;
            if (k) ziel.koerper = { s: k.s, gestalt: k.gestalt };
            if (su.kreatur && typeof su.kreatur === "object" && !Array.isArray(su.kreatur)) {
                for (const g of Object.keys(su.kreatur)) {
                    const e = su.kreatur[g];
                    const c =
                        e && typeof e === "object"
                            ? this._studioUebergabeValidate("kreatur", { gattung: g, s: e.s })
                            : null;
                    if (c) ziel.kreatur[c.gattung] = { s: c.s };
                }
            }
        }
        if (typeof state.playerSoul === "string") {
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
            // J4-Regler (cavityAO · edgeSharp · triplanar · colorVar; Default = unverändert) geclampt über die
            // Setter; existieren die Uniforms noch nicht, liest `_ensure*` sie beim Bau.
            const ao = Number(state.atmosphere.cavityAO);
            if (Number.isFinite(ao)) this.setCavityAO(Math.max(0, Math.min(2, ao)));
            const es = Number(state.atmosphere.edgeSharp);
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
            // Ein exakter 0.12-Wert (nightFloor/moonRim) ist der alte, in jeden Save gebackene DEFAULT, keine
            // Wahl → er wandert aufs Band-Default (SUBSTANCE_RESPONSE); jede andere Zahl bleibt.
            const _bandNf = AnazhRealm.SUBSTANCE_RESPONSE.nightFloor;
            const _bandMr = AnazhRealm.SUBSTANCE_RESPONSE.moonRim;
            const nf = Number(state.atmosphere.terrainNightFloor);
            if (Number.isFinite(nf)) this.setTerrainNightFloor(Math.abs(nf - 0.12) < 1e-9 ? _bandNf : nf);
            const mr = Number(state.atmosphere.moonRim);
            if (Number.isFinite(mr)) this.setTerrainMoonRim(Math.abs(mr - 0.12) < 1e-9 ? _bandMr : mr);
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

    // Die Höhe eines gespeicherten Orts über dem Boden des Gesetzes (cm-genau; undefined ohne Boden).
    _ueberGrund(p) {
        const g = p ? this._voxelSurfaceY(p.x, p.z) : NaN;
        return Number.isFinite(g) && Number.isFinite(p.y) ? Math.round((p.y - g) * 100) / 100 : undefined;
    }

    // DER BODEN-UMZUG (K16, Schöpfer-Entscheid §5.4): ein Save einer anderen Boden-Generation (vor K16: keine) schrieb seine
    // Höhen auf einen Boden, den es nicht mehr gibt (Basis → K16 im Umkreis ±500 m: |Δh| p50 37,7 m). Jeder Bau und der
    // Spieler stehen nach dem Laden auf dem Boden des Gesetzes in ihrer Höhe über Grund — `ueberGrund` des Saves, sonst die
    // Fuß-Höhe, auf der jeder Bau und jeder Spieler gesetzt wird (`PLAYER_FOOT_OFFSET`). Liefert die neuen Höhen je Bau-Index
    // (null: derselbe Boden) und nennt die Zahl (`state.bodenUmzug`, Log): wie viele Bauten sich bewegen, um wie viel.
    _bodenUmzug(state) {
        const gen = globalThis.__gelaendeCore.BODEN_GENERATION;
        if (!state || state.bodenGeneration === gen) return null;
        const fuss = AnazhRealm.PLAYER_FOOT_OFFSET;
        const hoehen = new Map();
        const dh = [];
        const liste = Array.isArray(state.architectures) ? state.architectures : [];
        // DIE ALTEN ORTE ZUERST (K10): der Erdbau des alten Bodens fällt (seine Höhen standen auf einem Gelände, das es nicht
        // mehr gibt), die Häuser jedes Orts legen ihre Platten auf den neuen Boden in ihrer Höhe über Grund — erst danach fallen
        // die Höhen aller Bauten, auf dem geerdeten Grund (vorher stand der Baum am Rand eines Orts bis 2,28 m neben seinem Boden).
        const wmU = this.state.worldMeta;
        if (wmU && wmU.erdbau) {
            delete wmU.erdbau;
            this._erdbauStand = (this._erdbauStand || 0) + 1;
        }
        const geerdet = this._erdbauAltOrte(liste, (a) => {
            const p = a.position;
            const g = Number.isFinite(p.x) && Number.isFinite(p.z) ? this._voxelSurfaceY(p.x, p.z) : NaN;
            return g + (Number.isFinite(a.ueberGrund) ? a.ueberGrund : fuss);
        });
        for (let i = 0; i < liste.length; i++) {
            const a = liste[i];
            const p = a && a.position;
            if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.z)) continue;
            const g = this._voxelSurfaceY(p.x, p.z);
            if (!Number.isFinite(g)) continue;
            const y = g + (Number.isFinite(a.ueberGrund) ? a.ueberGrund : fuss);
            hoehen.set(i, y);
            dh.push(Number.isFinite(p.y) ? Math.abs(y - p.y) : 0);
        }
        let spieler = null;
        const pm = this.state.playerMesh;
        if (pm && state.playerPosition) {
            const g = this._voxelSurfaceY(pm.position.x, pm.position.z);
            if (Number.isFinite(g)) {
                const y = g + (Number.isFinite(state.spielerUeberGrund) ? state.spielerUeberGrund : fuss);
                spieler = Math.round((y - pm.position.y) * 100) / 100;
                pm.position.y = y;
            }
        }
        dh.sort((p, q) => p - q);
        const q = (f) =>
            dh.length ? Math.round(dh[Math.min(dh.length - 1, Math.floor(f * dh.length))] * 100) / 100 : 0;
        const bericht = {
            von: Number.isFinite(state.bodenGeneration) ? state.bodenGeneration : 0,
            nach: gen,
            bauten: dh.length,
            bewegt: dh.filter((d) => d > 0.05).length,
            geerdet,
            dhP50: q(0.5),
            dhMax: q(1),
            spieler,
        };
        this.state.bodenUmzug = bericht;
        this.log(
            `BODEN-UMZUG: ${bericht.bewegt} von ${bericht.bauten} Bauten stehen auf dem Boden der Generation ${gen} ` +
                `(|Δh| p50 ${bericht.dhP50} m, max ${bericht.dhMax} m), der Spieler ${spieler} m`,
            "INFO"
        );
        return hoehen;
    }

    _loadStateRestoreArchitectures(state, umzug) {
        if (!Array.isArray(state.architectures) || !this.state.scene) return;
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
            if (!a || typeof a.type !== "string" || !a.position) continue;
            // DER BAUPLAN-UMZUG: ein gefallener Bauplan steht als sein Erbe wieder auf (glut_var* → glutbrunnen).
            const typ = AnazhRealm.BAUPLAN_UMZUG[a.type] || a.type;
            // DER BODEN-UMZUG: auf einem neuen Boden steht der Bau in seiner Höhe über Grund (`_bodenUmzug`)
            const ort = umzug && umzug.has(i) ? { x: a.position.x, y: umzug.get(i), z: a.position.z } : a.position;
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
        this.log(`Architekturen geladen: ${state.architectures.length}`);
    }

    // Ring 6.5 Hotbar (9 Slots, ungültige Bauplan-Refs → null), Welle 6.C1
    // Inventar (27 Slots, count clampt [1, 999]), Welle 4 P3 Werkzeug-Besitz
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
                if (s && typeof s.blueprintName === "string" && this.state.blueprints[s.blueprintName]) {
                    const cnt = Math.max(1, Math.min(999, Number(s.count) || 1));
                    inv[i] = { blueprintName: s.blueprintName, count: cnt };
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
        const now = performance.now() / 1000;
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
    }

    // Pfad-Buckets (defensiver Merge, fremde Keys ignoriert), Welt-Journal (entries + seen mit entryCap),
    // Legacy-Fähigkeiten (restoreAbility mappt drei historische Nexus-Namen auf ihre DSL-Äquivalente).
    _loadStateRestoreMiscState(state) {
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

    // DIE TÜR (Ring 8: ein Welt-Wechsel ist ein Reload): eine andere Welt betritt die Seite — das Welt-Tor „Ersetzen", der
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
    //   3. SPERRE, ZEIGER, RELOAD (`_weltWechselNeuLaden`): die neue Welt erwacht in einer frischen Seite.
    // Die Seite lädt sie nie in sich (die alte Welt lebte darin weiter: Tiere, Chunks, Worker, Wasser). `meta` legt Felder
    // ins worldMeta (der Gast: role, hostInfo, slug); `neuLaden:false` legt nur ab (daneben legen, Tests), `aktiv:false`
    // lässt dann auch den Aktiv-Zeiger (daneben legen). → {ok, worldId|reason}
    _weltBetreten(snapshot, meta = null, { neuLaden = true, aktiv = true, zeugnisA = null, p2pAuto = null } = {}) {
        if (!snapshot || typeof snapshot !== "object") return { ok: false, reason: "kein Snapshot" };
        if (!this._weltWechselSperre && this.state.worldMeta && this.state.worldMeta.worldId) {
            if (zeugnisA) this.journalAppendOnce(zeugnisA.key, zeugnisA.type || "portal", zeugnisA.text);
            this.saveState();
        }
        const wm = snapshot.worldMeta && typeof snapshot.worldMeta === "object" ? snapshot.worldMeta : {};
        const welt = { ...snapshot, worldMeta: { ...wm, ...(meta || {}) } };
        if (typeof welt.worldMeta.worldId !== "string" || !welt.worldMeta.worldId)
            welt.worldMeta.worldId = AnazhRealm._neueWeltId();
        const ab = this._weltAblegen(welt, { aktiv: aktiv || neuLaden });
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
        if (neuLaden) this._weltWechselNeuLaden(ab.worldId);
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
            localStorage.setItem(this.worldStorageKey(worldId), json);
            if (localStorage.getItem(this.worldStorageKey(worldId)) !== json)
                return { ok: false, reason: "der Speicher trägt andere Bytes" };
            this.worldsIndexUpsert({
                worldId,
                slug: m.slug || "",
                bornAt: m.bornAt || Date.now(),
                lastPlayed: Date.now(),
            });
            if (aktiv && !this.activeWorldSet(worldId))
                return { ok: false, reason: "der Aktiv-Zeiger ließ sich nicht setzen" };
            return { ok: true, worldId };
        } catch (e) {
            return { ok: false, reason: String((e && e.message) || e) };
        }
    }

    // DER WELT-WECHSEL IST EIN RELOAD — UND BIS DIE SEITE STIRBT, SCHREIBT SIE NICHTS MEHR (Gegenprüfung Runde 3, 10.10.):
    // zwischen `location.reload()` und dem Tod der Seite lief sie weiter, und jeder saveState (Loop-Autosave, Edit-Timer,
    // Dorf-Rückruf, Settlement-Export) schrieb die lebende Seite unter den Namen der Ziel-Welt (6 698 Bytes mit dem Tier der
    // alten im Platz der neuen) oder setzte den Aktiv-Zeiger auf die alte zurück (der Beitritt durchs Adress-Portal und die
    // „Neue Welt" verschwanden still). DIE EINE SPERRE: der Edit-Timer fällt, `saveState` — jeder Speicher-Weg der lebenden
    // Welt geht durch ihn — verweigert, der Zeiger zeigt auf die Ziel-Welt. Rufer: jeder Welt-Wechsel (Neue Welt, Wechsel,
    // daneben-und-springen, Fusion, die Tür `_weltBetreten`, der Beitritt per Einladung und Adress-Portal).
    _weltWechselNeuLaden(zielId) {
        this._weltWechselSperre = true;
        if (this._editSaveTimer) {
            clearTimeout(this._editSaveTimer);
            this._editSaveTimer = null;
        }
        if (zielId) this.activeWorldSet(zielId);
        if (typeof window !== "undefined" && window.location && typeof window.location.reload === "function")
            window.location.reload();
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
            this.journalAppend("witness", `Eine andere Welt „${result.slug}" liegt nun neben mir.`);
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
        AnazhRealm._zeugnisEintragen(cloned, `Ich wurde als „${slug}" neben einer fremden Welt empfangen.`, {
            fromWorldId: originalId,
            asWorldId: newWorldId,
            asSlug: slug,
        });
        // durch DIE TÜR: die Welt der Seite sichert sich, die fremde liegt mit Probe unter ihrer neuen Id; mit `reload` der
        // Welt-Wechsel (Zeiger, Sperre, Reload), sonst bleibt die aktive Welt.
        const ab = this._weltBetreten(cloned, null, { neuLaden: reload, aktiv: reload });
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
        const tagDefaults = AnazhRealm.MATERIAL_TAG_DEFAULTS || {};
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
            `Ich habe Rezepte aus „${sourceSlug}" empfangen: ${addedBPs.length} Baupläne, ${addedMats.length} Materialien, ${addedTools.length} Werkzeuge.`,
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
        // letzten Autosave fiele sonst hinter die Sperre des Welt-Wechsels (und ist sie ein Elternteil, liest die Fusion
        // so ihren jetzigen Stand).
        if (reload && this.state.worldMeta && this.state.worldMeta.worldId) this.saveState();
        const rawA = localStorage.getItem(this.worldStorageKey(idA));
        const rawB = localStorage.getItem(this.worldStorageKey(idB));
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

        const identity = this._fusionGenerateIdentity(saveA, saveB, slug);
        const inventory = this._fusionMergeInventory(saveA, saveB);
        const mergedEmotions = this._fusionMergeEmotions(saveA, saveB, strategy);
        const mergedHistory = this._fusionMergeDslHistory(saveA, saveB, strategy);
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
                visibility: "private",
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

        const ab = this._weltAblegen(snap, { aktiv: false });
        if (!ab.ok) return { ok: false, reason: `Speicher voll: ${ab.reason}` };
        this.log(
            `Welt-Fusion: ${identity.slugA} ⊕ ${identity.slugB} → ${identity.finalSlug} (Strategie ${strategy}, ID ${identity.newWorldId.slice(0, 8)}…)`,
            "INFO"
        );

        if (reload) this._weltWechselNeuLaden(identity.newWorldId);
        return {
            ok: true,
            worldId: identity.newWorldId,
            slug: identity.finalSlug,
            parentWorlds: [idA, idB],
            strategy,
        };
    }

    // Neue Identität: UUID + Slugs + Seed + Geburts-Timestamp. crypto.randomUUID
    // ist die bevorzugte Quelle (echter Zufall); Fallback ist Math.random.
    _fusionGenerateIdentity(saveA, saveB, slugHint) {
        const newWorldId = AnazhRealm._neueWeltId();
        const slugA = (saveA.worldMeta && saveA.worldMeta.slug) || "welt-a";
        const slugB = (saveB.worldMeta && saveB.worldMeta.slug) || "welt-b";
        const finalSlug = this._generateFusionSlug(slugA, slugB, slugHint);
        const newSeed = `w-fusion-${newWorldId.replace(/-/g, "").slice(0, 12)}-${Math.random().toString(36).slice(2, 8)}`;
        const bornAt = Date.now();
        return { newWorldId, slugA, slugB, finalSlug, newSeed, bornAt };
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
    // interleaved (Münzwurf pro Iteration) + Cap 500; sonst je 250 jüngste
    // konkateniert.
    _fusionMergeDslHistory(saveA, saveB, strategy) {
        const histA = Array.isArray(saveA.dslHistory) ? saveA.dslHistory : [];
        const histB = Array.isArray(saveB.dslHistory) ? saveB.dslHistory : [];
        if (strategy === "random-mix") {
            const aSlice = histA.slice(-250);
            const bSlice = histB.slice(-250);
            const combined = [];
            const max = Math.max(aSlice.length, bSlice.length);
            for (let i = 0; i < max; i++) {
                if (Math.random() < 0.5) {
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

    // ### Spieler-Seele: animierte Multi-Mesh-Körper ###
    // Je Seele eine THREE.Group aus Primitives (kein eval, kein Asset-Load). Ammo-Body bleibt die 0.5er
    // Half-Extent-Box (Visual ~1.7 > Hitbox, gewollt); `player_soul` bleibt aus `dslComposeAtomic`.
    // Vertrag `animate(group, t, walkPhase, isMoving, …)`: t in s (Idle); walkPhase in rad wächst nur in
    // Bewegung (Glieder frieren beim Stopp ein, statt zu springen); isMoving schaltet Walk ↔ Idle.
    get playerSoulDefs() {
        if (this._playerSoulDefsCache) return this._playerSoulDefsCache;
        // Seele = Bauplan aus Körper-Teilen (Form × Material) wie jede Struktur: Compound-Tags via
        // `computeCompoundTags` (MAX-Aggregation), kein hardcodetes `tags`-Profil. Drei Built-in-Seelen sind
        // Start-Charaktere; eigene über die DSL-Op `define_soul(name, bodyParts)`.
        this._playerSoulDefsCache = {
            human: {
                label: "Mensch",
                color: 0xff0000,
                build: () => this._buildHumanGroup(),
                // Die Emotionen reisen in den Rig: MOTION_RIG_MAP (sad/joy/fear/fight aus dem koerper-Gesetzbuch)
                // feuert im Spielpfad; neutral bleibt byte-alt (mp === mref → Delta 0).
                animate: (g, t, ph, mv, uw, _em, gait) => this._animateHuman(g, t, ph, mv, uw, _em, gait),
                // Positionierte bodyParts SPIEGELN die Hand-Visuals (build()) mit EXAKT denselben (Form,Material)-
                // Paaren — Tags sind MAX über Form×Material und positionsblind → Stat-Parität per Konstruktion.
                // So holt die Werkstatt den echten Körper und die Motion-Resonanz erkennt Glieder; build()+animate
                // bleiben das getragene Built-in-Visual.
                bodyParts: [
                    {
                        shape: "box",
                        material: "fleisch",
                        size: { x: 0.6, y: 0.7, z: 0.3 },
                        position: { x: 0, y: 0.45, z: 0 },
                        label: "Torso",
                    },
                    {
                        shape: "sphere",
                        material: "knochen",
                        size: { x: 0.38, y: 0.38, z: 0.38 },
                        position: { x: 0, y: 1.0, z: 0 },
                        label: "Kopf",
                    },
                    {
                        shape: "cylinder",
                        material: "fleisch",
                        size: { x: 0.16, y: 0.7, z: 0.16 },
                        position: { x: 0.42, y: 0.5, z: 0 },
                        label: "Arm rechts",
                    },
                    {
                        shape: "cylinder",
                        material: "fleisch",
                        size: { x: 0.16, y: 0.7, z: 0.16 },
                        position: { x: -0.42, y: 0.5, z: 0 },
                        label: "Arm links",
                    },
                    {
                        shape: "cylinder",
                        material: "knochen",
                        size: { x: 0.18, y: 0.8, z: 0.18 },
                        position: { x: 0.17, y: -0.05, z: 0 },
                        label: "Bein rechts",
                    },
                    {
                        shape: "cylinder",
                        material: "knochen",
                        size: { x: 0.18, y: 0.8, z: 0.18 },
                        position: { x: -0.17, y: -0.05, z: 0 },
                        label: "Bein links",
                    },
                ],
            },
        };
        return this._playerSoulDefsCache;
    }

    // Compound-Tags der Seele wie `computeCompoundTags(blueprint)`: je Body-Part `computePartTags`
    // (Form × Material), dann MAX über alle Teile. Leere `bodyParts` → leere Tags.
    computeSoulCompoundTags(soulDef) {
        if (!soulDef || !Array.isArray(soulDef.bodyParts) || soulDef.bodyParts.length === 0) {
            return {};
        }
        return this.computeCompoundTags({ parts: soulDef.bodyParts });
    }

    // addPlayerBoost({source, tagDelta, durationSeconds, label}). Sources: "emotion:<axis>" +
    // "world:resonance" (auto via tickPlayerBoosts) · "consume:<name>" (DSL-Op `apply_boost`).
    // Gleiche source verlängert expiresAt statt eines zweiten Eintrags.
    addPlayerBoost(spec) {
        if (!spec || typeof spec !== "object") return false;
        const source = String(spec.source || "").slice(0, 60);
        if (!source) return false;
        const tagDelta = {};
        const inputDelta = spec.tagDelta || {};
        for (const tag of AnazhRealm.MATERIAL_TAG_KEYS) {
            const v = Number(inputDelta[tag]);
            if (Number.isFinite(v) && v !== 0) tagDelta[tag] = Math.max(-1, Math.min(1, v));
        }
        if (Object.keys(tagDelta).length === 0) return false;
        const duration = Math.max(0.5, Math.min(600, Number(spec.durationSeconds) || 30));
        const now = performance.now() / 1000;
        const expiresAt = now + duration;
        const label = String(spec.label || source).slice(0, 80);
        if (!Array.isArray(this.state.player.boosts)) this.state.player.boosts = [];
        const existing = this.state.player.boosts.find((b) => b.source === source);
        if (existing) {
            existing.expiresAt = expiresAt;
            existing.tagDelta = tagDelta;
            existing.label = label;
        } else {
            this.state.player.boosts.push({ source, tagDelta, expiresAt, label });
        }
        this.recomputePlayerStats();
        return true;
    }

    // 1×/s aus dem Game-Loop: (1) Abgelaufene entfernen, (2) Emotions-Achsen >0.7 → Tag-Delta,
    // (3) nahe Signature-Struktur → Resonanz-Bonus. Bei Änderung EINMAL `recomputePlayerStats`.
    tickPlayerBoosts(currentTime) {
        if (!this.state.player) return;
        if (currentTime - (this.state.player.boostLastTick || -Infinity) < 1.0) return;
        this.state.player.boostLastTick = currentTime;
        const now = performance.now() / 1000;
        let changed = false;
        if (!Array.isArray(this.state.player.boosts)) this.state.player.boosts = [];

        // (1) Ablauf
        const kept = this.state.player.boosts.filter((b) => b.expiresAt > now);
        if (kept.length !== this.state.player.boosts.length) {
            this.state.player.boosts = kept;
            changed = true;
        }

        // (2) Emotion-Trigger
        const emotions = this.state.player.emotions || {};
        const threshold = this.state.player.emotionThreshold || 0.7;
        const lastTrig = this.state.player.boostLastTriggered || {};
        for (const axis of Object.keys(AnazhRealm.BOOST_EMOTION_TAG)) {
            const value = Number(emotions[axis]) || 0;
            const source = `emotion:${axis}`;
            const active = this.state.player.boosts.find((b) => b.source === source);
            if (value >= threshold && !active) {
                // Refract-Pause: nach Ablauf 60 s warten, bevor wir neu auslösen
                const lastEnded = lastTrig[source] || -Infinity;
                if (now - lastEnded < AnazhRealm.BOOST_EMOTION_REFRACT) continue;
                const def = AnazhRealm.BOOST_EMOTION_TAG[axis];
                this.state.player.boosts.push({
                    source,
                    tagDelta: { [def.tag]: def.delta },
                    expiresAt: now + AnazhRealm.BOOST_EMOTION_DURATION,
                    label: def.label,
                });
                changed = true;
            } else if (!active && lastTrig[source] === undefined) {
                // Initial-Mark für Refract — sonst würde lastEnded = -Infinity und
                // sofort wieder triggern können. Mark only on first see.
                lastTrig[source] = -Infinity;
            }
        }
        // Refract-Stempel setzen für gerade abgelaufene Boosts
        for (const b of kept) {
            if (b.expiresAt <= now && b.source.startsWith("emotion:")) {
                lastTrig[b.source] = now;
            }
        }

        // (3) Welt-Resonanz: in der Nähe einer Architektur mit
        // computeSpatialTags.resoniert >= WORLD_EFFECT_THRESHOLDS.resonance_signature.
        const playerPos = this.state.playerMesh ? this.state.playerMesh.position : null;
        let resonant = false;
        if (playerPos && Array.isArray(this.state.architectures)) {
            const T = AnazhRealm.WORLD_EFFECT_THRESHOLDS;
            const radiusSq = AnazhRealm.BOOST_RESONANCE_RADIUS * AnazhRealm.BOOST_RESONANCE_RADIUS;
            // die Plätze um den Spieler (`_blockerUmPlatz`, in der Ordnung des Bestands) — vorher jeder Eintrag je Sekunde
            const nahe = this._boostNahe || (this._boostNahe = []);
            nahe.length = 0;
            this._blockerUmPlatz(playerPos.x, playerPos.z, AnazhRealm.BOOST_RESONANCE_RADIUS + 1e-6, nahe);
            for (const entry of nahe) {
                if (!entry || !entry.position) continue;
                const dx = entry.position.x - playerPos.x;
                const dz = entry.position.z - playerPos.z;
                if (dx * dx + dz * dz > radiusSq) continue;
                const bp = this.state.blueprints && this.state.blueprints[entry.type];
                if (!bp) continue;
                const sTags = this.computeSpatialTags ? this.computeSpatialTags(bp) : this.computeCompoundTags(bp);
                if ((sTags.resoniert || 0) >= T.resonance_signature) {
                    resonant = true;
                    break;
                }
            }
        }
        const activeRes = this.state.player.boosts.find((b) => b.source === "world:resonance");
        if (resonant) {
            // Refresh-while-in-range: jede Sekunde 3 s in die Zukunft setzen.
            if (activeRes) {
                activeRes.expiresAt = now + 3;
            } else {
                this.state.player.boosts.push({
                    source: "world:resonance",
                    tagDelta: { resoniert: AnazhRealm.BOOST_RESONANCE_DELTA },
                    expiresAt: now + 3,
                    label: AnazhRealm.BOOST_RESONANCE_LABEL,
                });
                changed = true;
            }
        }

        if (changed) {
            this.recomputePlayerStats();
        }
        // UI 1×/s refreshen, damit die Boost-Restzeit sichtbar tickt — auch
        // wenn sich an Boost-Bestand selbst nichts geändert hat (Counter läuft).
    }

    // Welle 6.D Etappe 3a — Schaden zufügen. Quellen: DSL-Op `damage`,
    // zukünftige Welt-Hazards (6.G), feindliche Kreaturen (6.H). HP-Reduktion
    // wird durch heatResist (für Feuer/Hitze-Quellen) gedämpft.
    damagePlayer(amount, source) {
        if (!this.state.player || typeof amount !== "number" || !Number.isFinite(amount)) return false;
        const value = Math.max(0, Math.min(1000, amount));
        if (value === 0) return false;
        // Modus-Gate: in frieden und schöpfer wird Schaden stumm verworfen (kein Log-Spam); hp und
        // Todes-Pfad bleiben unangefasst.
        const mode = this.getGameMode ? this.getGameMode() : "frieden";
        if (mode !== "pfad") return false;
        // Respawn-Gnade: kein doppelter Tod (Spieler ist
        // unverwundbar während der Heilungs-Phase, das ist Teil der Mythos).
        const now = performance.now() / 1000;
        if ((this.state.player.respawnGraceUntil || -Infinity) > now) return false;
        // Resistenz: feuer/hitze-Quellen werden durch heatResist gedämpft.
        const stats = this.state.player.stats || {};
        let scaled = value;
        if (typeof source === "string" && /heat|fire|feuer|hitze|flame|glut/i.test(source)) {
            const resist = Math.max(0, Math.min(0.9, stats.heatResist || 0));
            scaled = value * (1 - resist);
        }
        // Kreatur-Schläge (jagd/gegenwehr) dämpft die Rüstung — DASSELBE Gesetz wie bei den Wesen (_ruestungDaempft).
        // Andere Quellen (Fall/Hitze/Welt) bleiben ungedämpft.
        const creatureStrike = source === "jagd" || source === "gegenwehr";
        if (creatureStrike) scaled = this._ruestungDaempft(scaled, stats.defense);
        const hpBefore = Number(this.state.player.hp) || 0;
        const hp = Math.max(0, hpBefore - scaled);
        this.state.player.hp = hp;
        // V17.30 — Schaden/Gefahr hebt sorrow + chaos (akut; die chronische
        // Wund-Dread trägt der ZUSTAND-Kanal in updatePlayerEmotions).
        this._feelAction("damage");
        // Furcht: gejagt + niedrige HP → der damage-Affekt wächst, je tiefer die HP sinken
        // (sorrow+chaos via ACTION_TO_EMOTION.threatened).
        if (creatureStrike) {
            const hpFrac = stats.hpMax > 0 ? hp / stats.hpMax : 1;
            if (hpFrac < AnazhRealm._verhaltenGesetz().jagd.fearHpFrac) {
                this._feelAction("threatened", { magnitude: 1 + (1 - hpFrac) });
            }
        }
        this.log(
            `Schaden ${scaled.toFixed(1)} (${source || "unbekannt"}) → HP ${hp.toFixed(0)}/${stats.hpMax || 0}`,
            "INFO"
        );
        if (hp <= 0) this._playerDeathRespawn(source);
        return true;
    }

    // Tod feld-nativ: HP=0 → _depositLife merkt den Ort, der Körper bleibt DERSELBE (Identität), Rückkehr
    // am Genesis-Anker; deathWoundIntensity trägt die Wunde als Stat-Penalty, respawnGraceUntil verhindert
    // Ping-Pong-Tod. Deterministisch.
    _playerDeathRespawn(source) {
        const now = performance.now() / 1000;
        if ((this.state.player.respawnGraceUntil || -Infinity) > now) return;
        this.state.player.respawnGraceUntil = now + (AnazhRealm.RESPAWN_GRACE_SEC || 8);
        // Welt-Trauer: zwei Achsen schwingen mit — Tod ist Verlust + Rückkehr.
        if (this.state.player.emotions) {
            this.state.player.emotions.sorrow = Math.min(1, (this.state.player.emotions.sorrow || 0) + 0.3);
            this.state.player.emotions.awe = Math.min(1, (this.state.player.emotions.awe || 0) + 0.2);
        }
        this.state.player.deathWoundIntensity = 1.0;
        // Der Tod steigt ab — am Ort, wie dismountArchitecture: der Körper kehrt am Anker wieder, das Gefährt bleibt,
        // wo er fiel (Leben-Prüfung V-k8: der Sattel riss den Wagen 85 m mit, er stand unter der Plattform).
        if (this.state.player.mountedArch !== null && this.state.player.mountedArch !== undefined) {
            this.dismountArchitecture();
        }
        // Das dritte Verb: der Todesort trägt eine Lebens-Spur ins Feld.
        const pm = this.state.playerMesh;
        if (pm && pm.position && typeof this._depositLife === "function") {
            this._depositLife(pm.position.x, pm.position.z);
        }
        // Rückkehr am Genesis-Anker (die Start-Plattform, `_genesisPlattform` — die EINE Quelle des Genesis-Orts); ohne
        // Anker der offene Spawn-Spot.
        const anchor = this._genesisPlattform();
        let ax = 0;
        let az = 0;
        let ay = null;
        if (anchor) {
            ax = anchor.position.x;
            az = anchor.position.z;
            ay = anchor.position.y + 2.2;
        } else if (typeof this._findOpenSpawnSpot === "function") {
            const spot = this._findOpenSpawnSpot();
            ax = spot.x;
            az = spot.z;
        }
        const surf = this.getTerrainHeightAt(ax, az);
        const safeY = Math.max(Number.isFinite(surf) ? surf + 2.0 : 2.0, ay || -Infinity);
        if (pm) {
            pm.position.set(ax, safeY, az);
            if (this.state.playerVel) this.state.playerVel.setValue(0, 0, 0);
            this.state._fieldVy = 0;
        }
        // Die Lebenswerte kehren voll zurück (das Maximum der verwundeten Gestalt) — die WUNDE (Stat-Penalty,
        // 10-min-Regen) trägt die Erinnerung, nicht ein HP-Malus.
        this.recomputePlayerStats({ voll: true });
        this.journalAppend("loss", `Der Körper fiel ${source ? `(${source}) ` : ""}— am Ursprung kehrt er wieder.`, {
            source: source || null,
            at: now,
        });
        this.log(`Tod (${source || "unbekannt"}) → Rückkehr am Anker (${ax.toFixed(0)}, ${az.toFixed(0)})`, "INFO");
    }

    // 1×/s Vitals-Tick: Wunden-Regen (10 min Erinnerung), Stamina-Regen,
    // Mana-Regen (magieleitungs-gehoben). ALTLASTEN-NULL: der Phönix-Timer ist
    // gefallen — der Tod lebt in _playerDeathRespawn, die Vitals hier.
    tickPlayerVitals(currentTime) {
        if (!this.state.player) return;
        if (currentTime - (this.state.player.deathLastTick || -Infinity) < 1.0) return;
        const dt = Math.max(0.1, Math.min(10, currentTime - this.state.player.deathLastTick));
        this.state.player.deathLastTick = currentTime;
        // Welle 6.D Etappe 3a+ — Wunde regenerieren UNABHÄNGIG von der
        // Respawn-Rückkehr. Die Stat-Wunde bleibt 10 min als Erinnerung.
        const woundIntensity = this.state.player.deathWoundIntensity || 0;
        if (woundIntensity > 0) {
            const regenRate = 1 / (this.state.player.deathWoundRegenSeconds || 600);
            this.state.player.deathWoundIntensity = Math.max(0, woundIntensity - regenRate * dt);
            this.recomputePlayerStats(); // Stat-Penalty sinkt sichtbar
        }
        // Welle 6.D Etappe 3a+ — Stamina-Regen (immer, nicht nur in Wandlung).
        // Linear bis staminaMax. Verbraucht durch applyOpToPart u. a.
        const staMax = this.state.player.staminaMax || 100;
        const sta = this.state.player.stamina || 0;
        // SCHWIMM-HEIMAT — unter Wasser ruht der Regen (die Züge zehren, das
        // Wasser gibt nichts zurück); an Land byte-alt. EIN Regen-Chokepoint.
        if (sta < staMax && !this.state.playerUnderwater) {
            const rate = AnazhRealm.STAMINA_REGEN_PER_SEC || 5;
            this.state.player.stamina = Math.min(staMax, sta + rate * dt);
        }
        // Mana-Regen symmetrisch zu Stamina: Base 3/s (Stamina 5/s — Mana ist mächtiger); Magieleitung im
        // Spieler-Compound hebt die Rate.
        const manaMax = this.state.player.manaMax || 0;
        const mana = this.state.player.mana || 0;
        if (manaMax > 0 && mana < manaMax) {
            const magBoost =
                (this.state.player.stats &&
                    this.state.player.stats.tags &&
                    this.state.player.stats.tags.magieleitung) ||
                0;
            const manaRate = (AnazhRealm.MANA_REGEN_PER_SEC || 3) * (1 + magBoost);
            this.state.player.mana = Math.min(manaMax, mana + manaRate * dt);
        }
    }

    // Welle 6.D Etappe 1.6 — Seele auflösen: erst Built-in, dann Custom.
    // Single-Pfad für alle Lese-Stellen (computePlayerStats, applyPlayerSoul,
    // renderPlayerStatsUI). Gibt null zurück wenn unbekannt.
    _getSoulDef(name) {
        if (!name) return null;
        if (this.playerSoulDefs[name]) return this.playerSoulDefs[name];
        if (this.state.customSouls && this.state.customSouls[name]) return this.state.customSouls[name];
        return null;
    }

    // Benannte Anker einer Compound-Seele (Built-ins, Customs, Peers): `userData.parts` (head ·
    // left/rightArm · left/rightWing · left/rightLeg) aus `computeMotionRoles`. Konsumenten: Kopf-Hide in
    // 1st-Person + Hand-Anker (`_refreshHeldMesh`: leftArm||leftWing). side +1 = px>0 = rechts;
    // kein Treffer → parts leer (die Hand fällt auf die Körper-Wurzel).
    _stampSoulPartRefs(group, bodyParts) {
        if (!group || !group.userData || !Array.isArray(bodyParts) || !Array.isArray(group.children)) return;
        const roles = this.computeMotionRoles(bodyParts);
        if (!roles) return;
        const parts = {};
        const SLOT = { kopf: "head", arm: "Arm", fluegel: "Wing", bein: "Leg" };
        for (let i = 0; i < roles.length && i < group.children.length; i++) {
            const r = roles[i];
            if (!r || !SLOT[r.role]) continue;
            const child = group.children[i];
            if (!child) continue;
            if (r.role === "kopf") {
                if (!parts.head) parts.head = child;
                continue;
            }
            const key = (r.side < 0 ? "left" : "right") + SLOT[r.role];
            if (!parts[key]) parts[key] = child;
        }
        if (Object.keys(parts).length) group.userData.parts = parts;
    }

    // Klont die bodyParts der Quell-Seele als voll editierbare Custom-Seele.
    cloneSoulToCustom(sourceName, newName) {
        const source = this._getSoulDef(sourceName);
        if (!source || !Array.isArray(source.bodyParts)) {
            return { ok: false, reason: "source_unknown" };
        }
        // Deep-Copy der bodyParts, damit Edits an der Kopie das Original
        // (besonders Built-ins!) nicht berühren.
        const cloned = source.bodyParts.map((p) => JSON.parse(JSON.stringify(p)));
        return this.createOrUpdateSoulFromDsl(newName, cloned);
    }

    // Eine Custom-Seele löschen. Wenn der Spieler aktuell diese Seele trägt,
    // schalten wir zurück auf "human" (Default-Seele).
    deleteCustomSoul(name) {
        if (!this.state.customSouls || !this.state.customSouls[name]) {
            return { ok: false, reason: "not_found" };
        }
        delete this.state.customSouls[name];
        if (this.state.player.soul === name) {
            this.applyPlayerSoul("human");
        }
        if (typeof this._refreshSoulSelect === "function") this._refreshSoulSelect();
        return { ok: true };
    }

    // Ein Body-Part an eine bestehende Custom-Seele anhängen. Wenn der
    // Spieler aktuell diese Seele trägt, werden Mesh + Stats neu gebaut.
    addPartToCustomSoul(soulName, part) {
        const soul = this.state.customSouls && this.state.customSouls[soulName];
        if (!soul) return { ok: false, reason: "soul_not_found" };
        const newParts = soul.bodyParts.concat([part]);
        const valid = this.validateBlueprintParts(newParts);
        if (!valid.ok) return { ok: false, reason: valid.reason };
        soul.bodyParts = valid.parts;
        this._refreshIfWornSoul(soulName);
        return { ok: true };
    }

    // Ein Body-Part einer Custom-Seele bearbeiten. `patch` enthält die Felder,
    // die überschrieben werden sollen (shape/material/position/size).
    updatePartInCustomSoul(soulName, idx, patch) {
        const soul = this.state.customSouls && this.state.customSouls[soulName];
        if (!soul) return { ok: false, reason: "soul_not_found" };
        if (idx < 0 || idx >= soul.bodyParts.length) return { ok: false, reason: "index_out_of_range" };
        const next = soul.bodyParts.slice();
        next[idx] = { ...next[idx], ...patch };
        const valid = this.validateBlueprintParts(next);
        if (!valid.ok) return { ok: false, reason: valid.reason };
        soul.bodyParts = valid.parts;
        this._refreshIfWornSoul(soulName);
        return { ok: true };
    }

    // Ein Body-Part entfernen. Wenn das letzte Part entfernt würde, ablehnen
    // (eine Seele braucht mindestens einen Körper-Teil).
    removePartFromCustomSoul(soulName, idx) {
        const soul = this.state.customSouls && this.state.customSouls[soulName];
        if (!soul) return { ok: false, reason: "soul_not_found" };
        if (soul.bodyParts.length <= 1) return { ok: false, reason: "would_be_empty" };
        if (idx < 0 || idx >= soul.bodyParts.length) return { ok: false, reason: "index_out_of_range" };
        soul.bodyParts = soul.bodyParts.slice(0, idx).concat(soul.bodyParts.slice(idx + 1));
        this._refreshIfWornSoul(soulName);
        return { ok: true };
    }

    // Wenn der Spieler die geänderte Seele aktuell trägt: Mesh + Stats
    // refreshen. Sonst nur stille Daten-Mutation.
    _refreshIfWornSoul(soulName) {
        if (this.state.player.soul === soulName) {
            // applyPlayerSoul re-baut Mesh + ruft recomputePlayerStats.
            this.applyPlayerSoul(soulName);
        }
    }

    // Rüstung am Avatar: die getragene armor als Kind-Gruppe der Soul-Group über denselben
    // `_buildFromBlueprint`-Pfad. Lazy: rebuild NUR beim Wechsel (equipped.armor !== _wornArmor).
    // Die Gruppe hängt am ENDE der children, sonst bricht der Motion-Vertrag (roles[i]↔kids[i]).
    _tickWornArmorVisual() {
        const pm = this.state.playerMesh;
        const p = this.state.player;
        if (!pm || !p) return;
        const worn = (p.equipped && p.equipped.armor) || null;
        if (pm.userData._wornArmor === worn) return;
        if (pm.userData._wornArmorMesh) {
            pm.remove(pm.userData._wornArmorMesh);
            pm.userData._wornArmorMesh = null;
        }
        pm.userData._wornArmor = worn;
        if (!worn) return;
        const bp = this.state.blueprints && this.state.blueprints[worn];
        if (!bp || bp.role !== "armor" || typeof this._buildFromBlueprint !== "function") return;
        try {
            const g = this._buildFromBlueprint(bp, 0, new Set());
            if (!g) return;
            const ext = typeof this._compoundVisualExtent === "function" ? this._compoundVisualExtent(bp) : null;
            // Generischer FIT für JEDEN Bauplan: Träger-Torso-Hülle (1.15 m hoch · ~0.95 m breit) ÷ Werk-Hülle,
            // Höhe UND Breite deckeln. Das Hüllen-Feld heißt `dy`, nicht `ext.y`.
            let sc = 0.96;
            if (ext) {
                const dy = Math.max(0.01, ext.dy || 0);
                const dw = Math.max(0.01, ext.dx || 0, ext.dz || 0);
                sc = Math.max(0.25, Math.min(3, Math.min(1.15 / dy, 0.95 / dw)));
            }
            g.scale.setScalar(sc);
            // Den TRAGE-Punkt (Masse-Zentrum bzw. expliziter trage-Punkt) auf den Torso-Anker (0, 0.18, 0) legen,
            // nicht den Bauplan-Ursprung — ein um y≈1.1 designter Brustpanzer landete sonst auf Kopfhöhe.
            const ap = this._attachPointFor(bp, "trage");
            g.position.set(-ap.point.x * sc, 0.18 - ap.point.y * sc, -ap.point.z * sc);
            g.userData._wornArmorVisual = true;
            g.traverse((o) => {
                o.castShadow = false;
                o.receiveShadow = false;
            });
            pm.add(g);
            pm.userData._wornArmorMesh = g;
        } catch (_e) {
            this._stoffBruch("die Rüstungs-Optik " + worn, _e);
        }
    }

    // Welle 6.D Etappe 3b — Bauplan als Rüstung markieren. Analog zu
    // `set_tool_meta`/`register_tool`: ein eigener Bauplan kann mit
    // role:"armor" markiert werden, danach equipbar via `equipArmor`.
    setBlueprintAsArmor(name) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.builtIn) return { ok: false, reason: "cannot_modify_builtin" };
        bp.role = "armor";
        // Welle 9a — manuellen Override merken damit emergente Berechnung
        // diesen Bauplan in Ruhe lässt
        bp.roleManual = true;
        return { ok: true, name };
    }

    // M5 (V18.157) — die Markierung LÖSEN: roleManual fällt, die Rolle EMERGIERT
    // wieder aus der Substanz. Macht den Rollen-Chip-Tooltip („zurücksetzen via
    // Markier-Sektion") WAHR — die alte Sektion hatte nie einen Reset (toter Verweis).
    resetBlueprintRole(name) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.builtIn) return { ok: false, reason: "cannot_modify_builtin" };
        delete bp.roleManual;
        delete bp.role;
        this._refreshBlueprintRoleEmergent(name);
        return { ok: true, name, role: bp.role };
    }

    // Bauplan als WELT-WERKSTATT markieren: die Werkstatt-Natur ist Intent, kein Substanz-Signal (Esse und
    // dichtes Bauwerk sind Substanz-Zwillinge) — die Designation ist Geste, die bediente DOMÄNE emergiert
    // (`_computeWorkshopDomain`). Spiegel von setBlueprintAsArmor; nur eigene Baupläne.
    setBlueprintAsWorkshopStation(name) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.builtIn) return { ok: false, reason: "cannot_modify_builtin" };
        bp.role = "workshop-station";
        bp.roleManual = true;
        return { ok: true, name, domain: this._computeWorkshopDomain(bp) };
    }

    // Bauplan als Waffe markieren (Spiegel von setBlueprintAsArmor): role:"weapon" + roleManual, die
    // Emergenz lässt die Rolle in Ruhe. Das Kampf-Profil (damage/knockback/attackSpeed) emergiert beim
    // Ausrüsten aus den Compound-Tags.
    setBlueprintAsWeapon(name) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.builtIn) return { ok: false, reason: "cannot_modify_builtin" };
        bp.role = "weapon";
        bp.roleManual = true;
        return { ok: true, name };
    }

    // EIN gehaltenes Gerät: equipHeld nimmt JEDEN Bauplan (kein Rollen-Schloss); sein form-bewusstes
    // Profil bestimmt, was es kann. recomputePlayerStats faltet seine Tags mit HELD_STAT_WEIGHT; Abbauen
    // und Angriff lesen DASSELBE Gerät.
    equipHeld(name) {
        if (!this.state.player) return { ok: false, reason: "no_player" };
        const eq = (this.state.player.equipped = this.state.player.equipped || { held: null, armor: null });
        if (!name) {
            eq.held = null;
            this.recomputePlayerStats();
            this._refreshHeldMesh(); // S9 — die Hand-Optik leeren
            this._refreshIchIfOpen(); // M5 — Equip-Feedback ist instant
            return { ok: true, equipped: null };
        }
        // den Bauplan auflösen: ein direkter Bauplan ODER ein gecraftetes Werkzeug (name == Bauplan
        // bzw. über sourceBlueprint). builtIn-Crafting-Tools (hammer/feile, kein Bauplan) → abgelehnt
        // (sie sind die Werkstatt-Schicht, kein Welt-Gerät).
        let bpName = name;
        if (!(this.state.blueprints && this.state.blueprints[name])) {
            const tool = this.state.tools && this.state.tools[name];
            bpName = tool && tool.sourceBlueprint ? tool.sourceBlueprint : null;
        }
        if (!bpName || !this.state.blueprints[bpName]) return { ok: false, reason: "blueprint_unknown" };
        eq.held = bpName;
        this.recomputePlayerStats();
        this._refreshHeldMesh(); // S9 — das Gerät in der Hand sichtbar machen
        this._refreshIchIfOpen(); // M5 — Equip-Feedback ist instant
        return { ok: true, equipped: bpName };
    }

    // ===== UI-Puls: ein dirty(raum) → eine Render-Insel =====
    // Mechanik-Pfade melden nur `_uiDirty(raum)`; EIN rAF-gebündelter Puls rendert jede schmutzige Insel
    // GENAU EINMAL pro Frame (Set dedupt → kein Doppel-Render, kein vergessener Pfad). `isOpen` (optional)
    // skippt die Insel bei geschlossenem Raum; ohne rendert sie IMMER (verstecktes Drawer-DOM bleibt
    // frisch). Jede Insel läuft in try/catch — ein Wurf killt nicht den Puls der anderen.
    _uiRoomRegistry() {
        if (this._uiRooms) return this._uiRooms;
        const overlayOpen = () => {
            const o = typeof document !== "undefined" && document.getElementById("inventory-overlay");
            return !!o && o.style.display !== "none" && o.getAttribute("aria-hidden") !== "true";
        };
        const drawerOpen = (n) => {
            const d = typeof document !== "undefined" && document.querySelector(`.drawer[data-drawer="${n}"]`);
            return !!d && !d.hidden;
        };
        this._uiRooms = {
            // Ich: skip-when-closed (M5-verifiziert — der Open-Pfad rendert frisch).
            ich: { render: () => this.renderInventoryUI && this.renderInventoryUI(), isOpen: overlayOpen },
            // Hof: skip-when-closed (der V18.176-On-Open-Render im Drawer-Hook
            // macht das Öffnen selbst-genügsam → das hidden-DOM darf ruhen).
            hof: {
                render: () => this._renderCreatureListUI && this._renderCreatureListUI(),
                isOpen: () => drawerOpen("kreaturen"),
            },
        };
        return this._uiRooms;
    }
}
