class AnazhRealm_werkstatt_hof {
    // ===== ATLAS · Werkstatt/hof — Ich- und Hof-Räume · Ausrüstungs-UI · Rezeptbuch · Hof-Bühne =====
    // W-C(a) (R-005) — der PREIS lesbar: die Stat-FOLGE einer Rüstung („+8.1
    // Abwehr · −4.2 Tempo") VOR dem Anlegen. computePlayerStats ist der pure
    // Rechner — equipped.armor wird transient getauscht, gerechnet, exakt
    // restauriert (kein recompute, kein State-Echo).
    _armorStatDeltaText(name) {
        const p = this.state.player;
        if (!p || !name || !this.state.blueprints || !this.state.blueprints[name]) return "";
        const eq = (p.equipped = p.equipped || { held: null, offhand: null, armor: null });
        const prev = eq.armor;
        let before;
        let after;
        try {
            eq.armor = null;
            before = this.computePlayerStats().stats;
            eq.armor = name;
            after = this.computePlayerStats().stats;
        } catch (e) {
            this._bruchMelden("Rüstungs-Vergleich: die Werte des Spielers brechen — " + ((e && e.message) || e));
            return "";
        } finally {
            eq.armor = prev;
        }
        if (!before || !after) return "";
        const parts = [];
        const push = (label, d, digits = 1) => {
            if (Math.abs(d) >= 0.05) parts.push(`${d > 0 ? "+" : "−"}${Math.abs(d).toFixed(digits)} ${label}`);
        };
        push("Abwehr", (after.defense || 0) - (before.defense || 0));
        push("Tempo", (after.speed || 0) - (before.speed || 0));
        push("HP", (after.hpMax || 0) - (before.hpMax || 0), 0);
        return parts.join(" · ");
    }

    // Was du trägst — Gerät in der Hand + Rüstung, sichtbar + klickbar (Klick legt ab). V18.67 Ich-J5:
    // direkt unter dem Viewer (ohne Überschrift), die Rüstung mit eingebautem Wechsel (Select IM Slot, kein
    // „Mehr"-Aufklappen), + die aktiven BOOSTS als Chips (was JETZT wirkt — wie wenn der Nexus feuert).
    _renderInventoryEquip() {
        const host = document.getElementById("inventory-equip");
        if (!host) return;
        host.innerHTML = "";
        const eq = (this.state.player && this.state.player.equipped) || { held: null, armor: null };
        const bps = this.state.blueprints || {};
        // (1) HAUPTHAND — Klick legt ab; gewechselt wird über die Hotbar. Das Feld IST equipped.held;
        // die NEBENHAND lebt am G-Slot neben der Hotbar (eine equipped-Struktur, zwei Slots).
        {
            const bp = eq.held && bps[eq.held];
            const el = document.createElement("div");
            el.className = "equip-slot";
            el.appendChild(this._el("span", { class: "equip-kind", text: "Haupthand" }));
            el.appendChild(
                this._el("span", {
                    class: "equip-name",
                    text: eq.held ? (bp && bp.label) || eq.held : "— leer (Faust) —",
                })
            );
            el.title = eq.held
                ? "Klick → ablegen · Wechseln über die Hotbar · G tauscht mit der Nebenhand"
                : "Die Haupthand — wählen über die Hotbar; G tauscht mit der Nebenhand (Slot links der Hotbar)";
            if (eq.held) {
                el.addEventListener("click", () => {
                    this.equipHeld(null);
                    this._renderInventoryEquip();
                    this.renderRecipeBook();
                });
            }
            host.appendChild(el);
        }
        // (2) Rüstung — Wechsel IM Slot: ein Select über die besessenen Rüstungen (wearArmor, frei wenn
        //     geschmiedet) statt eines versteckten „Mehr"-Dropdowns (Schöpfer „wieso aufklappen").
        {
            const { armorBlueprints } = this._equipPartitionEquipBlueprints();
            const el = document.createElement("div");
            el.className = "equip-slot";
            el.appendChild(this._el("span", { class: "equip-kind", text: "Rüstung" }));
            if (armorBlueprints.length) {
                const sel = document.createElement("select");
                sel.className = "equip-slot-select";
                sel.title = "Rüstung wechseln (frei, wenn schon geschmiedet)";
                sel.appendChild(this._el("option", { value: "", text: "— keine —" }));
                for (const name of armorBlueprints) {
                    const opt = this._el("option", { value: name, text: (bps[name] && bps[name].label) || name });
                    // W-C(a) (R-005) — der PREIS lesbar VOR der Wahl: die Stat-FOLGE
                    // („+8.1 Abwehr · −4.2 Tempo") am Eintrag — der Spieler errät
                    // nicht einmal mehr das Vorzeichen.
                    const delta = this._armorStatDeltaText(name);
                    if (delta) opt.title = delta;
                    if (eq.armor === name) opt.selected = true;
                    sel.appendChild(opt);
                }
                // Die Stat-Folge der GEWÄHLTEN Rüstung als sichtbare Mini-Zeile.
                if (eq.armor) {
                    const d = this._armorStatDeltaText(eq.armor);
                    if (d) el.appendChild(this._el("span", { class: "equip-stat-delta", text: d }));
                }
                sel.addEventListener("change", () => {
                    const res = this.wearArmor(sel.value || null);
                    // W-C(a) — das Mach-Tor SPRICHT am Ort der Geste: der Re-Render
                    // unten stellt das Select auf den ECHTEN Zustand zurück (die
                    // Select-Lüge fällt), DANN erscheint der Hint im frischen Host.
                    this._renderInventoryEquip();
                    this.renderRecipeBook();
                    if (!res.ok) {
                        this._showMachTorHint(document.getElementById("inventory-equip"), res);
                        this.log(`Rüstung: ${this._machTorHint(res)}`, "ERROR");
                    }
                });
                el.appendChild(sel);
            } else {
                el.appendChild(
                    this._el("span", {
                        class: "equip-name",
                        text: eq.armor ? (bps[eq.armor] && bps[eq.armor].label) || eq.armor : "— leer —",
                    })
                );
            }
            host.appendChild(el);
        }
        // (3) Aktive Boosts — was JETZT wirkt: das EINE Band in #ich-boosts-host neben #status-emotions.
        // Fallback: der Equip-Block selbst.
        this._renderEquipBoosts(document.getElementById("ich-boosts-host") || host);
    }

    // Aktive Boosts als Chips aus player.boosts ({source, tagDelta, expiresAt, label}; expiresAt in
    // performance.now()/1000). Der Chip nennt den EFFEKT (stärkste tagDelta-Achse, „+magieleitung 0.4“)
    // und trägt data-expires — tickStatsHud zählt die Restzeit live (textContent, kein Re-Render).
    _renderEquipBoosts(host) {
        if (!host) return;
        // W-C(b) — EIN Band, idempotent: ein vorheriger Render im selben Host
        // wird ersetzt (der Host ist jetzt stehend — #ich-boosts-host).
        const prev = host.querySelector(":scope > .ich-boosts");
        if (prev) prev.remove();
        const boosts = this.state.player && Array.isArray(this.state.player.boosts) ? this.state.player.boosts : [];
        const nowSec = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
        const active = boosts.filter((b) => b && b.expiresAt > nowSec);
        const row = this._el("div", { class: "ich-boosts" });
        if (!active.length) {
            row.appendChild(this._el("span", { class: "ich-boosts-empty", text: "keine aktiven Boosts" }));
        } else {
            for (const b of active) {
                const rest = Math.max(0, Math.round(b.expiresAt - nowSec));
                const effect = this._boostEffectLabel(b);
                const chip = this._el("span", {
                    class: "ich-boost-chip",
                    text: `✺ ${b.label || b.source}${effect ? ` · ${effect}` : ""} (${rest}s)`,
                });
                chip.setAttribute("data-expires", String(b.expiresAt));
                chip.setAttribute("data-base", `✺ ${b.label || b.source}${effect ? ` · ${effect}` : ""}`);
                chip.title = effect ? `Wirkt jetzt: ${effect} — läuft in ${rest}s aus.` : `Läuft in ${rest}s aus.`;
                row.appendChild(chip);
            }
        }
        host.appendChild(row);
    }

    // M5 — die stärkste Wirkungs-Achse eines Boosts, lesbar („+magieleitung 0.4").
    // Liest tagDelta (der echte Boost-Vektor); ohne Achsen bleibt der Name allein.
    _boostEffectLabel(b) {
        const tags = (b && (b.tagDelta || b.tags)) || null;
        if (!tags || typeof tags !== "object") return "";
        let bestK = null;
        let bestV = 0;
        for (const k of Object.keys(tags)) {
            const v = Number(tags[k]) || 0;
            if (Math.abs(v) > Math.abs(bestV)) {
                bestV = v;
                bestK = k;
            }
        }
        if (!bestK || !bestV) return "";
        const label = (AnazhRealm.AXIS_LABELS && AnazhRealm.AXIS_LABELS[bestK]) || bestK;
        return `${bestV > 0 ? "+" : ""}${Math.round(bestV * 100) / 100} ${label}`;
    }

    // Live-Restzeit (~1×/s aus tickStatsHud): nur textContents sichtbarer Chips, kein Re-Render.
    // Ein abgelaufener Chip wird ENTFERNT, nicht umbeschriftet.
    _tickBoostChips() {
        if (typeof document === "undefined") return;
        const chips = document.querySelectorAll(".ich-boost-chip[data-expires]");
        if (!chips.length) return;
        const nowSec = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
        for (const chip of chips) {
            const exp = Number(chip.getAttribute("data-expires"));
            if (!Number.isFinite(exp)) continue;
            const rest = Math.max(0, Math.round(exp - nowSec));
            if (rest <= 0) {
                chip.remove();
                continue;
            }
            const base = chip.getAttribute("data-base") || "✺ Boost";
            const next = `${base} (${rest}s)`;
            this._hudSchreib(chip, next);
        }
    }

    // Rezeptbuch: craftbare Baupläne nach Verwendung gruppiert, je Zeile Kosten + rollen-gerechter
    // Fertigen-Knopf (disabled ohne Material). Signatur = wovon der INHALT abhängt (Bauplan-Namen +
    // Inventar-Materialien + Part-Edit-Tick + Spielmodus + Hotbar (die Reihe des Katalogs, bauen.K1) — `_recipeRow` gibt den Knopf in schöpfer frei; bis 06.10.
    // fehlte der Modus, Befund V-D5: in schöpfer blieb „Es fehlt: 44× holz, 50× laub" gesperrt stehen), NICHT die
    // Slot-Auswahl (`_recipeRow` liest sie nicht) — sonst Voll-Rebuild bei jeder Slot-Wahl.
    _recipeBookSignature() {
        const bps = this.state.blueprints || {};
        const inv = (this.state.player && this.state.player.inventory) || [];
        const have = {};
        for (const slot of inv)
            if (slot && slot.kind === "material" && typeof slot.material === "string")
                have[slot.material] = (have[slot.material] || 0) + (slot.count || 0);
        const matSig = Object.keys(have)
            .sort()
            .map((m) => m + have[m])
            .join(",");
        return (
            Object.keys(bps).join("|") +
            "#" +
            matSig +
            "#" +
            (this.state._bpEditTick || 0) +
            "#" +
            this.getGameMode() +
            "#" +
            (this.state.hotbar || []).join("|")
        );
    }

    renderRecipeBook() {
        const host = document.getElementById("inventory-recipes");
        if (!host) return;
        // V18.358 — Skip, wenn der Inhalt unverändert ist (Slot-Auswahl ändert ihn NICHT): vermeidet
        // den O(Baupläne × Parts × checkBuildCost + DOM)-Rebuild bei jeder Inventar-Interaktion.
        const sig = this._recipeBookSignature();
        if (host.childElementCount > 0 && sig === this._recipeBookSig) return;
        this._recipeBookSig = sig;
        host.innerHTML = "";
        const bps = this.state.blueprints || {};
        // V18.162 (Nutzer-Blick) — FAHRZEUGE sind eine eigene Gruppe (der Wagen
        // lag unter „Bauwerk" — die Rolle war da, die Gruppe las nur useKind).
        // Griffbereit zuerst (`_katalogReihe`, bauen.K1): die eigenen Werke und die der Hotbar stehen oben, je mit ihrer Art.
        const griff = [];
        const groups = { hold: [], wear: [], drink: [], vehicle: [], place: [] };
        const groupLabel = {
            griff: "Griffbereit",
            hold: "In die Hand",
            wear: "Rüstung",
            drink: "Trank",
            vehicle: "Fahrzeug",
            place: "Bauwerk",
        };
        for (const name of this._katalogReihe(Object.keys(bps))) {
            const bp = bps[name];
            if (!bp || !Array.isArray(bp.parts) || !bp.parts.length) continue;
            // KATALOG-SICHT (18.07., M1): die EINE Sicht-Regel (donorOnly +
            // Render-Varianten) — je Gattung EIN Studio-Eintrag im Rezeptbuch.
            if (!this._katalogSichtbar(name, bp)) continue;
            const kind = this._blueprintUseKind(bp);
            const slot = kind === "place" && this._displayRole(bp) === "vehicle" ? "vehicle" : kind;
            if (!groups[slot]) continue;
            if (this._katalogRang(name) < (this.state.hotbar || []).length) griff.push([name, slot]);
            else groups[slot].push(name);
        }
        let any = false;
        for (const kind of ["griff", "hold", "wear", "drink", "vehicle", "place"]) {
            const rows = kind === "griff" ? griff : groups[kind].sort().map((n) => [n, kind]);
            if (!rows.length) continue;
            any = true;
            const g = document.createElement("div");
            g.className = "recipe-group";
            g.textContent = groupLabel[kind];
            host.appendChild(g);
            for (const [name, art] of rows) host.appendChild(this._recipeRow(name, art));
        }
        if (!any) {
            const empty = document.createElement("p");
            empty.className = "inventory-hint";
            empty.textContent = "Noch keine craftbaren Baupläne — entwirf eines in der Werkstatt.";
            host.appendChild(empty);
        }
        // V18.65 — den aktuellen Selbst-Such-Filter nach dem Neu-Aufbau wieder anwenden (die Zeilen werden
        // bei jedem Render neu erzeugt; das Such-Feld #ich-search lebt im Header + bleibt).
        this._applyIchFilter();
    }

    // DIE EINE Selbst-Suche: #ich-search filtert das REZEPTBUCH (Nicht-Treffer + leere Gruppen aus) UND
    // dimmt Nicht-Treffer in der HABE; Treffer bleiben klickbar. Kein zweites Suchfeld.
    _applyIchFilter() {
        if (typeof document === "undefined") return;
        const search = document.getElementById("ich-search");
        const q = search ? search.value.trim().toLowerCase() : "";
        // (1) Rezeptbuch filtern (leere Gruppen-Labels verschwinden mit).
        const host = document.getElementById("inventory-recipes");
        if (host) {
            let lastGroup = null;
            let groupHasVisible = false;
            const finishGroup = () => {
                if (lastGroup) lastGroup.style.display = groupHasVisible ? "" : "none";
            };
            for (const node of host.children) {
                if (node.classList.contains("recipe-group")) {
                    finishGroup();
                    lastGroup = node;
                    groupHasVisible = false;
                    continue;
                }
                if (!node.classList.contains("recipe-row")) continue;
                // M4 (V18.158) — der EINE Heuhaufen (data-search trägt Rolle/Material/
                // Tags) + textContent (Kosten-Zeile), durch den EINEN Kern.
                const hay = (node.getAttribute("data-search") || "") + " " + (node.textContent || "");
                const match = this._matchQuery(hay, q);
                node.style.display = match ? "" : "none";
                if (match) groupHasVisible = true;
            }
            finishGroup();
        }
        // (2) Habe dimmen: Nicht-Treffer-Slots ausgrauen (search→Treffer, das Werkstatt-Loop auf die Habe).
        const grid = document.getElementById("inventory-grid");
        if (grid) {
            for (const el of grid.children) {
                if (!q) {
                    el.classList.remove("search-dim");
                    continue;
                }
                const hay = el.getAttribute("data-search") || "";
                el.classList.toggle("search-dim", !this._matchQuery(hay, q)); // M4 — der EINE Kern
            }
        }
    }

    _recipeRow(name, kind) {
        const bp = this.state.blueprints[name];
        const row = document.createElement("div");
        row.className = "recipe-row";
        // M4 (V18.158) — die Zeile trägt den EINEN Blueprint-Heuhaufen (Rolle/Material/
        // Tags) für die Selbst-Suche — dieselbe Treffer-Logik wie Werkstatt + Omnibox.
        row.setAttribute("data-search", this._blueprintSearchText(bp));
        // V18.63 Ich-I (ich-plan §H.5) — die GETEILTE Rollen-Farb-Sprache der Werkstatt (V8.39): die
        // Zeile leuchtet links in der emergenten Rollen-Farbe → ein Blick sagt, was ein Rezept IST,
        // einheitlich Ich ≡ Werkstatt (kein drittes System — dieselbe BLUEPRINT_ROLE_COLORS-Quelle).
        {
            const rRole = (typeof this._displayRole === "function" && this._displayRole(bp)) || bp.role;
            const rColor = AnazhRealm.BLUEPRINT_ROLE_COLORS[rRole];
            if (rColor) row.style.borderLeft = `3px solid ${rColor}`;
            // W-C(h)/R-036 — der WARUM-CHIP an der Rezept-Zeile (Tooltip): die
            // lesbare Emergenz reist an jede Rollen-Anzeige.
            const why = this._blueprintRoleWhy(bp);
            if (why && why.text) row.title = `${AnazhRealm.ROLE_LABELS[why.role] || why.role}, weil: ${why.text}`;
        }
        const info = document.createElement("div");
        info.className = "recipe-info";
        const nm = document.createElement("span");
        nm.className = "recipe-name";
        const label = (bp && bp.label) || name;
        nm.textContent = label;
        info.appendChild(nm);
        const check = this.checkBuildCost(name);
        const cost = document.createElement("span");
        cost.className = "recipe-cost";
        cost.textContent =
            Object.entries(check.cost || {})
                .map(([m, n]) => `${n}× ${m}`)
                .join(" · ") || "frei";
        info.appendChild(cost);
        // Status: erst BAUPLAN (Information — Fertigen kostet Materie) oder schon WERK (forgedPrecision
        // eingefroren) — die Zeile sagt, warum ein Bauplan noch nicht wirkt.
        const status = document.createElement("span");
        status.className = "recipe-status";
        // Ein Bauwerk (place, vehicle) ist nie „Werk ✓": jedes Setzen zahlt (Frieden und Pfad), der Weg ist der Bau-Modus.
        const bauwerk = kind === "place" || kind === "vehicle";
        const isWerk = !bauwerk && Number.isFinite(bp && bp.forgedPrecision);
        status.textContent = isWerk ? "Werk ✓" : "Bauplan";
        status.title = isWerk
            ? "Gefertigt — die Präzision ist eingefroren, der Gebrauch ist frei."
            : bauwerk
              ? "Fertigen setzt das Werk, wohin du blickst — das Setzen zieht das Material (Frieden und Pfad), frei ist nur Schöpfer."
              : "Reine Information — das Fertigen zieht das Material (Frieden und Pfad), dann ist der Gebrauch frei.";
        status.style.opacity = "0.75";
        status.style.fontStyle = "italic";
        // in der Kosten-Zeile (bauen.K1): eine Zeile weniger je Rezept, das Griffbereite steht ganz im Bild
        status.textContent = ` · ${status.textContent}`;
        cost.appendChild(status);
        row.appendChild(info);
        const btn = document.createElement("button");
        btn.type = "button";
        // W-C(e)/R-007 — LABEL == TAT: das Knopf-Wort folgt derselben useKind-
        // Familie wie craftFromRecipe (vehicle = place+Rolle → wird GEFERTIGT,
        // dann platziert; der alte sonst-Zweig log „In die Hand").
        btn.textContent =
            kind === "wear"
                ? "Anlegen"
                : kind === "drink"
                  ? "Brauen + Trinken"
                  : kind === "place" || kind === "vehicle"
                    ? "Fertigen"
                    : "In die Hand";
        if (bauwerk)
            btn.title =
                "Fertigen — das Werk steht, wohin du blickst; trägt der Ort nicht, zielt das Phantom (F setzt).";
        const mode = typeof this.getGameMode === "function" ? this.getGameMode() : "frieden";
        const free = mode === "schöpfer" || isWerk;
        btn.disabled = !free && !check.ok;
        if (btn.disabled) {
            btn.title =
                "Es fehlt: " +
                Object.entries(check.missing || {})
                    .map(([m, n]) => `${n}× ${m}`)
                    .join(", ");
        }
        btn.addEventListener("click", () => {
            const res = this.craftFromRecipe(name);
            if (res && res.ok) {
                this.renderInventoryUI();
            } else if (res && !res.ok) {
                // W-C(a)/R-005 — das Mach-Tor spricht AN DER ZEILE (die Konsole
                // ist zugeklappt — der Log allein erreichte nie jemanden).
                this._showMachTorHint(row, res);
                this._spielerSagt(`${label}: ${this._machTorHint(res)}`);
            }
        });
        row.appendChild(btn);
        return row;
    }

    // Der EINE Crafting-Aktions-Pfad aus dem Rezeptbuch — rollen-gerecht (Use-Kind):
    // Gerät → in die Hand (wieldBlueprint, schmiedet mit Material+Station-Gate), Rüstung →
    // schmieden + anlegen, Trank → brauen + trinken, Bauwerk → der Bau-Modus (`fertigeBlueprint`, derselbe Weg wie
    // Werkstatt-FERTIGEN; Welle L Folge: das Rezeptbuch zog das Material beim Fertigen UND beim Setzen und legte das Werk
    // ins Inventar, von wo es nur über Inventar-Slot, Hotbar-Slot und Taste in die Welt kam).
    craftFromRecipe(name) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        const kind = this._blueprintUseKind(bp);
        if (kind === "wear") {
            const made = this._forgeMaterialAndFreeze(name);
            if (!made.ok) return made;
            return this.equipArmor(name);
        }
        // Trank: brauen + TRINKEN in EINEM Akt (brewConsumable zieht die Zutaten und wirkt sofort).
        if (kind === "drink") {
            return this.brewConsumable(name);
        }
        if (kind === "place") return this.fertigeBlueprint(name);
        // hold (Gerät/Waffe) + Default: schmieden (mit Gate) + in die Hand nehmen.
        return this.wieldBlueprint(name);
    }

    // Slot-Klick im Inventar: wählt den Bauplan aus. Nächster Hotbar-Slot-
    // Klick weist ihn dort zu. Doppelklick auf bereits-gewähltem Slot hebt
    // die Wahl wieder auf.
    selectInventorySlot(slotIndex) {
        const inv = (this.state.player && this.state.player.inventory) || [];
        const slot = inv[slotIndex];
        if (!slot) return;
        if (this.state.inventorySelected === slot.blueprintName) {
            this.state.inventorySelected = null;
        } else {
            this.state.inventorySelected = slot.blueprintName;
        }
        this.renderInventoryUI();
    }

    // Hook im Hotbar-Click-Pfad (_renderHotbarDOM-Listener): ein ausgewählter Inventar-Bauplan wird
    // im geklickten Hotbar-Slot (oder per Zahl-Taste) abgelegt.
    tryAssignFromInventoryToHotbar(hotbarIndex) {
        if (!this.state.inventorySelected) return false;
        const idx = Math.max(0, Math.min(8, Number(hotbarIndex) | 0));
        if (!Array.isArray(this.state.hotbar)) this.state.hotbar = new Array(9).fill(null);
        this.state.hotbar[idx] = this.state.inventorySelected;
        this.state.inventorySelected = null;
        this.renderInventoryUI();
        if (typeof this._renderHotbarDOM === "function") this._renderHotbarDOM();
        try {
            this.saveState();
        } catch {
            /* save-Fehler nicht hart blockend */
        }
        return true;
    }

    toggleInventoryOverlay(force) {
        if (typeof document === "undefined") return;
        const el = document.getElementById("inventory-overlay");
        if (!el) return;
        const open = typeof force === "boolean" ? force : el.hasAttribute("hidden");
        if (open) {
            el.removeAttribute("hidden");
            this.state.inventoryOpen = true;
            document.body.classList.add("inventory-open");
            this.renderInventoryUI();
            // das Rezeptbuch öffnet oben, wo das Griffbereite steht (bauen.K1)
            const rezepte = document.getElementById("inventory-recipes");
            if (rezepte) rezepte.scrollTop = 0;
            // V18.57 Ich-Bogen — die Selbst-Bühne + das Spec-Sheet (das Werkstatt-/Hof-Muster auf das Selbst).
            if (typeof this._ichHandleOverlay === "function") this._ichHandleOverlay(true);
            // === UX-Konvention wie Minecraft / jedes Survival-Spiel ===
            // Inventar offen → Pointer-Lock lösen: HTML5-Drag&Drop braucht absolute Maus-Koordinaten, der Lock
            // liefert nur Deltas → dragstart feuert sonst nicht zuverlässig.
            try {
                if (document.pointerLockElement) document.exitPointerLock();
            } catch {
                /* defensive */
            }
            // KEINE keys-Clear — Minecraft-Konvention: WASD bleibt aktiv,
            // Spieler bewegt sich auch mit offenem Inventar weiter. Nur
            // die Maus-Look-Steuerung ist über exitPointerLock gesperrt.
        } else {
            el.setAttribute("hidden", "");
            this.state.inventoryOpen = false;
            document.body.classList.remove("inventory-open");
            this.state.inventorySelected = null;
            if (typeof this._ichHandleOverlay === "function") this._ichHandleOverlay(false);
            // Bewusst KEIN re-lock — Spieler klickt Canvas um wieder
            // in Blick-Steuerung zu gehen (Minecraft-Konvention).
        }
    }

    // Kreaturen-Drawer-UI: Spawn mit Form-Wahl + Liste der lebenden Kreaturen (Name, Form, Task).
    creatureDrawerInitDOM() {
        if (typeof document === "undefined") return;
        const drawer = document.querySelector('[data-drawer="kreaturen"]');
        if (!drawer) return;
        // Aufträge laufen INLINE am gewählten Wesen („Auftrag ▾“ in _renderCreatureListUI →
        // assignCreatureTask); hier nur der Spawn. data-creature-spawn-Buttons lesen den Form-Dropdown:
        // „“ (Zufällig) = Zufall je Kreatur, sonst tragen alle N diese Seele.
        const select = drawer.querySelector("#creature-soul-select");
        drawer.querySelectorAll("[data-creature-spawn]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const count = Math.max(1, Math.min(50, parseInt(btn.getAttribute("data-creature-spawn"), 10) || 1));
                const soulName = select ? select.value : "";
                const chosen = soulName && AnazhRealm.CREATURE_SOUL_NAMES.includes(soulName) ? soulName : null;
                // Spawn ohne clear (state.creatures bleibt + N neue dazu); der Ort im Ring 5–15 m um den Spieler zieht
                // aus dem Fauna-Strom des Hofs (Γ5) — ein Tier ist Welt-Substanz, auch wenn eine Hand es ruft.
                const rng = this._faunaRng("hof");
                for (let i = 0; i < count; i++) {
                    const p = this.state.playerMesh ? this.state.playerMesh.position : { x: 0, y: 5, z: 0 };
                    const ang = rng() * Math.PI * 2;
                    const r = 5 + rng() * 10;
                    this.spawnCreatureAt(p.x + Math.cos(ang) * r, p.y + 1, p.z + Math.sin(ang) * r, "happy", chosen);
                }
                this._renderCreatureListUI();
            });
        });
        this._renderCreatureListUI();
    }

    // DER EINE Wesen-Lese-Vektor aller Hof-Leser (Spec-Card, Sektionen, Sortierung, Stimmungs-Glyphen):
    // EIN Profil, viele Leser (wie `_blueprintProductVector`), statt N Lookups im Render.
    // Jedes Feld liest einen gemessenen Vektor; reaktiv, nicht persistiert.
    _creatureProfile(creature) {
        const ud = (creature && creature.userData) || {};
        const prof = {
            creature,
            id: ud.netId || ud.name || null, // STABILE Identität (§G.6) — nie der splice-fragile Array-Index
            name: ud.name || "?",
            soul: typeof ud.soul === "string" ? ud.soul : "",
            soulLabel:
                (ud.soul && AnazhRealm.CREATURE_SOULS[ud.soul] && AnazhRealm.CREATURE_SOULS[ud.soul].label) || "—",
            bond: Number.isFinite(ud.bond) ? ud.bond : 0,
            equipped: ud.equipped || {},
            boosts: Array.isArray(ud.boosts) ? ud.boosts : [],
            tags: {},
            stats: null,
            hp: null,
            hpMax: null,
            specs: [],
            specCount: 0,
            memory: [],
            memoryCount: 0,
            task: null,
            taskName: "—",
            taskArgs: {},
            emotion: "happy", // BINÄR (gemessen) — happy/sad, wetter-/task-getrieben
            wariness: 0, // KONTINUIERLICH (gemessen) — Scheu/Mut aus player.emotions + tags + bond + mode
            moodLabel: "",
            section: "",
        };
        try {
            prof.tags = this.computeCreatureCompoundTags(creature) || {};
        } catch {
            /* tags optional */
        }
        try {
            const cs = this.computeCreatureStats(creature).stats;
            prof.stats = cs;
            prof.hpMax = cs.hpMax;
            prof.hp = Number.isFinite(ud.hp) ? ud.hp : cs.hpMax;
        } catch (e) {
            this._bruchMelden("Kreatur-Profil: die Werte brechen — " + ((e && e.message) || e));
        }
        try {
            if (typeof this._creatureTopSpecializations === "function") {
                // ALLE Spezialisierungen einmal holen → specs (Top-3) + die GESAMT-Zahl (für „+N weitere"-Overflow).
                const allSpecs = this._creatureTopSpecializations(creature, 99) || [];
                prof.specs = allSpecs.slice(0, 3);
                prof.specCount = allSpecs.length;
            }
        } catch {
            /* specs optional */
        }
        // Die GESCHICHTE (V18.56) — die erinnerten Taten des Wesens (ud.memory, cap CREATURE_MEMORY_CAP):
        // die Spec-Card liest die jüngste Tat + die Gesamtzahl (so wird das Wachsen der Geschichte sichtbar,
        // graceful gekappt — kein Overflow). Reaktiv, read-only (kein neuer Datenpfad, Konsum V17.31).
        prof.memory = Array.isArray(ud.memory) ? ud.memory : [];
        prof.memoryCount = prof.memory.length;
        try {
            const task = this._getCreatureTask(creature);
            if (task) {
                prof.task = task;
                prof.taskName = task.name || "—";
                prof.taskArgs = task.args || {};
            }
        } catch {
            /* task optional */
        }
        // Stimmung: das BINÄRE Feld (gemessen) — der Index ist der EINZIGE Ort, an dem wir ihn brauchen.
        const idx = (this.state.creatures || []).indexOf(creature);
        if (idx >= 0 && Array.isArray(this.state.creatureEmotions))
            prof.emotion = this.state.creatureEmotions[idx] || "happy";
        // Die REICHERE, gemessene zweite Lesart (§G.2) — kontinuierliches Scheu/Mut.
        try {
            if (typeof this._creatureWariness === "function") prof.wariness = this._creatureWariness(creature) || 0;
        } catch {
            /* wariness optional */
        }
        // Mood-Label aus beiden Quellen (froh/trübe × neugierig/wachsam/scheu) — ehrlich geerdet.
        const w = prof.wariness;
        const temper = w > 0.5 ? "scheu" : w > 0.15 ? "wachsam" : prof.bond > 0.4 ? "vertraut" : "neugierig";
        prof.moodLabel = (prof.emotion === "sad" ? "trübe" : "froh") + " · " + temper;
        // V18.107 — D4-VOLL: das SEELEN-Temperament (stabil, aus der Substanz) wird
        // sichtbar — die Hof-Karte zeigt, WER das Wesen IST (nicht nur wie es sich
        // gerade fühlt). Vision-Mechanik sichtbar (V9.95-c-Disziplin).
        try {
            prof.temperament = this._creatureTemperament(creature);
            if (prof.temperament && prof.temperament !== temper) prof.moodLabel += ` · ${prof.temperament}`;
        } catch {
            /* temperament optional */
        }
        // D1 (gigant-plan §5 — G4-1b): der 6-Achsen-Vektor bekommt seine SICHTBARE
        // Fläche — die dominante Emotion + Intensität via `_emotionState` (DERSELBE
        // Leser wie das Ich-Porträt — eine Sprache; der benannte Passagier-Rest fällt).
        const vec = creature.userData && creature.userData.emotions;
        if (vec && typeof this._emotionState === "function") {
            const es = this._emotionState(vec);
            if (es && es.dominant && es.intensity > 0.12) {
                prof.emotionState = es;
                prof.moodLabel += ` · ${es.dominant} ${(es.intensity * 100) | 0}%`;
            }
            // W-B — der VOLLE 6-Achsen-Vektor reist mit (Kopie): die Hof-Karte
            // zeigt das Innenleben als Fenster, nicht mehr nur das Destillat.
            prof.emotions = { ...vec };
        }
        // Sektion (§D.2/§F) — Seele + dominante Spezialisierung, für das Gruppen-Dirigat.
        const topSpec = prof.specs[0];
        prof.section = prof.soul || (topSpec ? topSpec.kind : "wesen");
        return prof;
    }

    // Hof-D (hof-plan §D.1/§G.5) — der Fokus-Toggle: ein Klick auf die Zeile FOKUSSIERT das Wesen
    // (wie der Bauplan-Fokus in der Werkstatt) → es tritt auf die BÜHNE + seine Spec-Card liest darunter.
    // Die Selektion hängt an der STABILEN Identität (`prof.id` = netId/name, §G.6), NIE am Array-Index.
    _toggleHofFocus(id) {
        this.state.hofFocusId = this.state.hofFocusId === id ? null : id;
        this._renderCreatureListUI();
    }

    // V18.54 Hof-Bühne (das Werkstatt-Viewer-Pendant) — eine eigene kleine 3D-Szene, die das fokussierte
    // Wesen groß + langsam rotierend zeigt (der STAR des Hofes, dunkle Bühne wie der Werkstatt-Viewer).
    // Lazy WebGPURenderer (dasselbe Muster wie `_workshopEnsurePreview`, aber schlank: kein Gizmo/Orbit/Grid).
    _hofEnsureStage() {
        if (typeof document === "undefined" || typeof THREE === "undefined") return null;
        if (this.state.hofStage) return this.state.hofStage;
        const canvas = document.getElementById("hof-stage-canvas");
        if (!canvas) return null;
        // dunkle, violett-getönte Bühne (der Nexus/Seelen-Ton)
        const renderer = this._buehneRenderer(canvas, 360, 360, 0x171019, "Hof-Bühne", () => {
            stage.rendererReady = true;
            if (stage.active) this._hofStartRAF();
        });
        if (!renderer) return null;
        const scene = new THREE.Scene();
        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const key = new THREE.DirectionalLight(0xffe8c2, 0.95);
        key.position.set(4, 6, 5);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0x88aaff, 0.4);
        fill.position.set(-4, -1, -3);
        scene.add(fill);
        const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
        camera.position.set(0, 0.12, 4.2);
        camera.lookAt(0, 0, 0);
        const stage = {
            canvas,
            renderer,
            scene,
            camera,
            pivot: null,
            soul: null,
            yaw: 0.5,
            rafId: null,
            active: false,
            rendererReady: false,
        };
        this.state.hofStage = stage;
        return stage;
    }

    // Das Wesen auf die Bühne stellen (gebaut aus der Seele, zentriert + auf Bühnen-Höhe skaliert).
    // Cache per Seele — die meisten Wesen teilen sprite/wesen/geist → die Bühne baut selten neu.
    _hofStageShow(soulName) {
        // Die 3D-Bühne wird NUR beim Hof-Öffnen gebaut (_hofHandleDrawerChange) — hier nur aktualisieren,
        // wenn sie existiert (so kostet das List-Rendern außerhalb des Hofes keinen GPU-Renderer).
        const stage = this.state.hofStage;
        if (!stage) return;
        if (stage.pivot && stage.soul === soulName) return; // schon auf der Bühne
        if (stage.pivot) {
            stage.scene.remove(stage.pivot);
            this._disposeSoulGroup(stage.pivot);
            stage.pivot = null;
        }
        stage.soul = soulName || null;
        if (!soulName) return;
        const group = this._buildCreatureGroup(soulName);
        if (!group) return;
        const box = new THREE.Box3().setFromObject(group);
        const center = box.getCenter(new THREE.Vector3());
        const dim = box.getSize(new THREE.Vector3());
        group.position.sub(center); // an den Ursprung zentrieren
        const maxDim = Math.max(dim.x, dim.y, dim.z) || 1;
        group.scale.setScalar(3.0 / maxDim); // auf eine konstante Bühnen-Größe
        const pivot = new THREE.Group();
        pivot.add(group);
        stage.scene.add(pivot);
        stage.pivot = pivot;
        stage.dirty = true;
    }

    _hofStartRAF() {
        const stage = this.state.hofStage;
        if (!stage || stage.rafId !== null || !stage.rendererReady) return;
        const tick = () => {
            const s = this.state.hofStage;
            if (!s || !s.active) {
                if (s) s.rafId = null;
                return;
            }
            if (s.pivot) {
                s.yaw += 0.008; // sanfte Rotation — bezaubernd, nicht hektisch
                s.pivot.rotation.y = s.yaw;
            }
            if (s.rendererReady) {
                this._buehneRender(s.renderer, s.scene, s.camera, "Hof-Bühne");
            }
            s.rafId = requestAnimationFrame(tick);
        };
        stage.rafId = requestAnimationFrame(tick);
    }

    _hofStopRAF() {
        const stage = this.state.hofStage;
        if (stage && stage.rafId !== null) {
            cancelAnimationFrame(stage.rafId);
            stage.rafId = null;
        }
    }

    // Tab-Wechsel-Hook (Zwilling zu `_workshopHandleDrawerChange`): die Bühne lebt nur, wenn der Hof offen ist.
    _hofHandleDrawerChange(name) {
        const stage = this.state.hofStage;
        if (name === "kreaturen") {
            // On-Open-Render: die Listen werden beim Öffnen SYNCHRON frisch gerendert — Gesten und Gesetze schreibt
            // der Status-Takt nur bei offenem Hof (`updateStatusPanel`, K2 Belegung). Bewusst ohne typeof-Guard — die
            // Grep-Wand zählt nur die geguardete Mechanik-Signatur.
            this._renderCreatureListUI();
            this.renderAbilitiesList();
            this.renderWorldRulesList();
            const s = this._hofEnsureStage();
            if (!s) return;
            s.active = true;
            this._hofRefreshFocus();
            if (typeof this._renderHofChronik === "function") this._renderHofChronik();
            this._hofStartRAF();
        } else if (stage) {
            stage.active = false;
            this._hofStopRAF();
        }
    }

    // Das fokussierte (oder erste) Wesen ermitteln → auf die Bühne + seine Spec-Card unter die Bühne.
    _hofRefreshFocus() {
        const creatures = this.state.creatures || [];
        let creature = null;
        if (this.state.hofFocusId)
            creature = creatures.find((c) => this._creatureProfile(c).id === this.state.hofFocusId) || null;
        if (!creature) creature = creatures[0] || null;
        this._hofStageShow(creature ? this._creatureProfile(creature).soul : null);
        this._hofRenderFocusPanel(creature);
    }

    // Die Spec-Card des fokussierten Wesens UNTER/NEBEN der Bühne (Werkstatt-DNA: Bühne + Spec-Sheet).
    _hofRenderFocusPanel(creature) {
        if (typeof document === "undefined") return;
        const host = document.getElementById("hof-stage-spec");
        if (!host) return;
        host.innerHTML = "";
        if (!creature) {
            host.appendChild(
                this._el("div", {
                    class: "hof-stage-empty",
                    text: "Wähle ein Wesen aus dem Orchester — es tritt hier auf die Bühne.",
                })
            );
            return;
        }
        host.appendChild(this._hofBuildSpecSheet(this._creatureProfile(creature)));
    }

    _natureLevelClass(val) {
        return val >= 2.25 ? "lvl-3" : val >= 1.5 ? "lvl-2" : val >= 0.75 ? "lvl-1" : "lvl-0";
    }

    // WESEN-SPEC-SHEET im Werkstatt-Design (`_specRenderHeader/Body/Footer`, dieselben `.spec-*`-Klassen):
    // HEADER Identität | Bindung → BODY NATUR compound-tags | WERTE (HP, Stat-Chips, Wachstum) →
    // FOOTER Habe + Verabschieden. Liest NUR `prof` (der EINE Vektor).
    _hofBuildSpecSheet(prof) {
        // HEADER — Identität: Name (seelen-gefärbt) + Seele-Label + Stimmung-Chip | Bindung als Qualitäts-Pendant.
        const idZone = this._el(
            "div",
            { class: "spec-id" },
            this._el("span", { class: "spec-name soul-" + prof.soul, text: prof.name }),
            this._el("span", { class: "spec-soul-label", text: prof.soulLabel }),
            this._el("span", {
                class: "creature-mood " + (prof.emotion === "sad" ? "mood-sad" : "mood-happy"),
                text: (prof.emotion === "sad" ? "☹ " : "☺ ") + prof.moodLabel,
            })
        );
        const bond = Math.max(0, Math.min(1, prof.bond || 0));
        const b5 = Math.round(bond * 5);
        const qualZone = this._el(
            "div",
            {
                class: "spec-quality",
                title: "Bindung — die Beziehung wächst, während das Wesen folgt + nah bleibt (gewichtet Contagion + Verlust).",
            },
            this._el("span", { class: "spec-q-label", text: "Bindung" }),
            this._el("span", { class: "spec-q-stars", text: "★".repeat(b5) + "☆".repeat(5 - b5) }),
            this._el("span", { class: "spec-q-val", text: bond.toFixed(2) })
        );
        const header = this._el("div", { class: "spec-header" }, idZone, qualZone);

        // BODY — links WERTE (das, was ein lebendes Wesen INTERESSANT macht: HP/Schaden/Tempo … als Balken,
        // PRIMÄR), rechts NATUR (die Substanz, aus der die Werte EMERGIEREN — sekundär). Schöpfer-Befund:
        // „bei der Kreatur ist Damage etc. interessanter als Resonanz" — die Capabilities führen, die Tags folgen.
        const fracLvl = (f) => (f > 0.66 ? "lvl-2" : f > 0.33 ? "lvl-1" : "lvl-0");
        const werteChildren = [this._el("div", { class: "spec-col-head", text: "Werte" })];
        if (prof.stats) {
            const cs = prof.stats;
            const hpFrac = prof.hpMax > 0 ? prof.hp / prof.hpMax : 0;
            werteChildren.push(
                this._specBar(
                    "HP",
                    hpFrac,
                    `${Math.round(prof.hp)}/${Math.round(prof.hpMax)}`,
                    fracLvl(hpFrac),
                    "Lebenspunkte (lebend/max)"
                )
            );
            // Die Kombat-/Aktions-Werte als Balken — der Anteil füllt gegen eine GEMESSENE Referenz (die
            // Formel-Decke aus STAT_FROM_TAGS, weiche Skala), die echte Zahl steht im Label (ehrlich, V17.31).
            const statBars = [
                ["Schaden", cs.damage, 25, "Schaden pro Schlag (härte+dichte)"],
                ["Tempo", cs.speed, 14, "Bewegungstempo (leicht+magieleitung)"],
                ["Ausdauer", cs.staminaMax, 200, "max. Ausdauer (leicht+wärmeleitung)"],
                ["Abwehr", cs.defense, 14, "physische Abwehr (dichte+härte)"],
                ["Präzision", cs.precision, 1, "Präzision (magieleitung+zähigkeit)"],
            ];
            for (const [label, v, ref, title] of statBars) {
                if (!Number.isFinite(v)) continue;
                werteChildren.push(
                    this._specBar(label, v / ref, v.toFixed(1), fracLvl(v / ref), `${title}: ${v.toFixed(2)}`)
                );
            }
            // Elementar-Resists als kompakter Chip-Streifen (klein, sekundär).
            const fmt = (n) => (Number.isFinite(n) ? n.toFixed(2) : "—");
            werteChildren.push(
                this._el(
                    "div",
                    { class: "spec-stat-strip" },
                    this._el(
                        "span",
                        { class: "spec-stat-chip", title: "Magie-Resistenz" },
                        this._el("span", { class: "spec-stat-name", text: "MR" }),
                        this._el("span", { class: "spec-stat-val", text: fmt(cs.magicResist) })
                    ),
                    this._el(
                        "span",
                        { class: "spec-stat-chip", title: "Hitze-Resistenz" },
                        this._el("span", { class: "spec-stat-name", text: "HR" }),
                        this._el("span", { class: "spec-stat-val", text: fmt(cs.heatResist) })
                    )
                )
            );
        } else {
            werteChildren.push(this._el("span", { class: "spec-empty", text: "Werte werden berechnet …" }));
        }
        const leftCol = this._el("div", { class: "spec-col" }, ...werteChildren);

        // W-B (R-002, meister-plan §8.2) — die EMOTION an der STELLE der Natur:
        // die 6 Achsen als intuitive Balken (wie HP), gebaut vom EINEN Renderer
        // (_buildEmotionRows — dieselbe Sprache wie das Ich, statisch pro Render).
        const rightChildren = [this._el("div", { class: "spec-col-head", text: "Gefühl" })];
        if (prof.emotions) {
            const built = this._buildEmotionRows(prof.emotions);
            const rowsHost = this._el("div", { class: "hof-emotion-rows" });
            for (const row of built.rows) rowsHost.appendChild(row);
            rightChildren.push(rowsHost);
        } else {
            rightChildren.push(this._el("span", { class: "spec-empty", text: "noch kein Innenleben" }));
        }
        // NATUR (Werkstatt-Wissen, sekundär) — die Compound-Tags wandern in ein
        // einklappbares <details>: einen Klick entfernt, prägt die Karte nicht mehr.
        const tagEntries = Object.entries(prof.tags || {})
            .filter(([, v]) => Number.isFinite(v) && v > 0.05)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        const natBars = tagEntries.map(([k, v]) =>
            this._specBar(
                k,
                v / 3,
                v.toFixed(2),
                this._natureLevelClass(v),
                `${k}: ${v.toFixed(2)} (Natur, 0–3 — speist die Werte)`
            )
        );
        if (natBars.length) {
            const natDetails = document.createElement("details");
            natDetails.className = "spec-nature-details";
            const natSum = document.createElement("summary");
            natSum.textContent = "Substanz — speist die Werte";
            natSum.title = "Die Compound-Tags (Natur, 0–3), aus denen die Werte emergieren — Werkstatt-Wissen.";
            natDetails.appendChild(natSum);
            for (const b of natBars) natDetails.appendChild(b);
            rightChildren.push(natDetails);
        }
        const rightCol = this._el("div", { class: "spec-col" }, ...rightChildren);
        const body = this._el("div", { class: "spec-body" }, leftCol, rightCol);

        // WACHSTUM & GESCHICHTE (volle Breite) — das Wesen LERNT + ERINNERT (Schöpfer-Befund „wie füllen sich die
        // Felder, overflow wenn Charaktere Geschichten speichern?"): die Top-3 Skills als Fortschritt + „+N weitere"
        // (Overflow gekappt) + die jüngste Tat aus ud.memory + die Gesamtzahl der Erinnerungen (graceful, kein Overflow).
        const threshold = AnazhRealm.CREATURE_SPECIALIZATION_LEVEL_THRESHOLD;
        const maxLevel = AnazhRealm.CREATURE_SPECIALIZATION_MAX_LEVEL;
        const growChildren = [this._el("div", { class: "spec-col-head", text: "Wachstum & Geschichte" })];
        const grow = (prof.specs || []).slice(0, 3).map((s) => {
            const atMax = s.level >= maxLevel;
            const into = s.count - s.level * threshold;
            return this._specBar(
                `${s.kind === "gather" ? "Sammler" : "Bauer"}·${s.key}`,
                atMax ? 1 : Math.max(0, Math.min(1, into / threshold)),
                atMax ? `L${s.level} ✦` : `L${s.level} · ${into}/${threshold}`,
                atMax ? "lvl-3" : "lvl-2",
                `${s.count} Erfolge — ${atMax ? "Meisterschaft" : "auf dem Weg zu L" + (s.level + 1)}`
            );
        });
        if (grow.length) {
            growChildren.push(...grow);
            if (prof.specCount > grow.length)
                growChildren.push(
                    this._el("div", {
                        class: "spec-grow-more",
                        text: `+ ${prof.specCount - grow.length} weitere Fertigkeiten`,
                    })
                );
        }
        // Die jüngste Tat (Geschichte) — formatiert + die Gesamtzahl der Erinnerungen.
        const deed = this._creatureLatestDeed(prof);
        if (deed)
            growChildren.push(
                this._el(
                    "div",
                    {
                        class: "spec-deed",
                        title: `${prof.memoryCount} Erinnerungen (gekappt auf das Lebens-Gedächtnis)`,
                    },
                    this._el("span", { class: "spec-deed-label", text: "Geschichte" }),
                    this._el("span", { class: "spec-deed-text", text: deed })
                )
            );
        else if (!grow.length)
            growChildren.push(this._el("span", { class: "spec-empty", text: "noch keine Geschichte" }));
        const growth = this._el("div", { class: "spec-growth-zone" }, ...growChildren);

        // FOOTER — die HABE (Werkzeug/Rüstung/Boosts) als Chips + der würdevolle Abschied.
        const footChildren = [];
        const habe = [];
        if (prof.equipped && prof.equipped.tool) habe.push("⚒ " + prof.equipped.tool);
        if (prof.equipped && prof.equipped.armor) habe.push("⛨ " + prof.equipped.armor);
        for (const b of prof.boosts || []) if (b && (b.label || b.source)) habe.push("✺ " + (b.label || b.source));
        if (habe.length)
            footChildren.push(
                this._el(
                    "span",
                    { class: "spec-habe" },
                    ...habe.map((h) => this._el("span", { class: "spec-stat-chip", text: h }))
                )
            );
        footChildren.push(
            this._el("button", {
                class: "spec-dismiss",
                type: "button",
                text: "✕ Verabschieden",
                title: `${prof.name} aus der Welt verabschieden`,
                on: {
                    click: (e) => {
                        e.stopPropagation();
                        if (prof.creature && typeof this.removeCreature === "function") {
                            this.removeCreature(prof.creature);
                            this.state.creatures = (this.state.creatures || []).filter((c) => c !== prof.creature);
                            if (this.state.hofFocusId === prof.id) this.state.hofFocusId = null;
                            this._renderCreatureListUI();
                        }
                    },
                },
            })
        );
        const footer = this._el("div", { class: "spec-footer hof-spec-footer" }, ...footChildren);
        // GEMÜT als prominenter Balken unter dem Header (HP-Muster): die dominante Achse FÄRBT (--joy/--awe
        // wie das Ich), die Intensität FÜLLT. Unter 12 % setzt _creatureProfile kein emotionState → der
        // Balken ruht (kein Deko-Rauschen).
        const es = prof.emotionState;
        let emotionRow = null;
        if (es && es.dominant) {
            const fill = document.createElement("div");
            fill.style.width = `${Math.round(Math.max(0, Math.min(1, es.intensity)) * 100)}%`;
            fill.style.background = `var(--${es.dominant}, #c69ad9)`;
            fill.style.boxShadow = "0 0 4px currentColor";
            const bar = this._el("span", { class: "bar" });
            bar.appendChild(fill);
            emotionRow = this._el(
                "div",
                {
                    class: `emotion hof-emotion-bar ${es.dominant}`,
                    title: `Dominante Emotion: ${(AnazhRealm.EMOTION_LABEL && AnazhRealm.EMOTION_LABEL[es.dominant]) || es.dominant} — Intensität ${(es.intensity * 100) | 0} % (färbt Verhalten + Contagion).`,
                },
                this._el("span", {
                    class: "name",
                    text: (AnazhRealm.EMOTION_LABEL && AnazhRealm.EMOTION_LABEL[es.dominant]) || es.dominant,
                }),
                bar,
                this._el("span", { class: "value", text: `${(es.intensity * 100) | 0}%` })
            );
        }
        return emotionRow
            ? this._el("div", { class: "spec-sheet hof-spec-sheet" }, header, emotionRow, body, growth, footer)
            : this._el("div", { class: "spec-sheet hof-spec-sheet" }, header, body, growth, footer);
    }

    // V18.56 — die jüngste Tat eines Wesens, menschen-lesbar (aus ud.memory). Macht die wachsende GESCHICHTE
    // sichtbar (Schöpfer-Befund), graceful + gekappt. Liest nur `prof.memory` (read-only, Konsum V17.31).
    _creatureLatestDeed(prof) {
        const mem = prof.memory || [];
        if (!mem.length) return "";
        const e = mem[mem.length - 1];
        if (!e || !e.type) return "";
        // die Tat in den Worten der EINEN Tafel (ERINNERUNG_SATZ, wie der Persona-Prompt)
        const satz = AnazhRealm.ERINNERUNG_SATZ[e.type];
        const what = satz ? satz(e.content || {}).replace(/[⁦-⁩]/g, "") : String(e.type).replace(/_/g, " ");
        // relative Zeit (at = Date.now())
        let ago = "";
        if (Number.isFinite(e.at)) {
            const s = Math.max(0, Math.round((Date.now() - e.at) / 1000));
            ago =
                s < 60
                    ? ` · vor ${s}s`
                    : s < 3600
                      ? ` · vor ${Math.round(s / 60)}m`
                      : ` · vor ${Math.round(s / 3600)}h`;
        }
        return `${what}${ago}`;
    }

    // === V18.57 Ich-Bogen — das Selbst-Porträt (das Werkstatt-/Hof-Muster auf den Spieler, ich-plan) ===

    // Ich-A0 (ich-plan §G.1) — EIN Spieler-Lese-Vektor, viele Leser (das `_creatureProfile`-Muster auf das
    // Selbst). Bündelt die GEMESSENEN reichsten Vektoren des Spiels: Seele · Werte (equip-gefaltet) · Natur ·
    // die 6-Achsen-EMOTION + Mood-EMA · Habe · die Reise (worldJournal). Read-only (Konsum V17.31).
    _selfProfile() {
        const p = this.state.player || {};
        const soul = p.soul || "human";
        const custom = this.state.customSouls && this.state.customSouls[soul];
        const builtin = this.playerSoulDefs[soul];
        const def = custom || builtin || null;
        const stats = p.stats || null;
        return {
            soul,
            soulLabel: (custom && custom.label) || (builtin && builtin.label) || soul,
            name: typeof p.name === "string" && p.name.trim() ? p.name.trim().slice(0, 48) : "Du",
            mode: typeof this.getGameMode === "function" ? this.getGameMode() : "frieden",
            stats,
            tags: p.statTags || {},
            emotions: p.emotions || {},
            mood: p.mood || {},
            hp: Number.isFinite(p.hp) ? p.hp : stats ? stats.hpMax : 0,
            hpMax: Number.isFinite(p.hpMax) ? p.hpMax : stats ? stats.hpMax : 0,
            equipped: p.equipped || {},
            boosts: Array.isArray(p.boosts) ? p.boosts : [],
            bodyParts: (def && def.bodyParts) || [],
            // V18.61 Ich-F (H.1) — KEIN journal mehr: die Chronik der Welt ist die Welt-Stimme (Hof),
            // nicht das Selbst; _renderHofChronik liest worldJournal direkt (kein Passagier-Feld hier).
        };
    }

    // Ich-A (ich-plan §D.2) — das SELBST-SPEC-SHEET im GETEILTEN Werkstatt-/Hof-Design (`.spec-*`): HEADER
    // (Name + Seele + Modus | Vigor-Sterne) → BODY (WERTE führen, equip-gefaltet | NATUR sekundär) → FOOTER
    // (Habe). Die EMOTION lebt als eigene live-Zone darunter; die Chronik/Reise wanderte in den Hof (V18.61, H.1).
    _ichBuildSpecSheet(prof) {
        const fracLvl = (f) => (f > 0.66 ? "lvl-2" : f > 0.33 ? "lvl-1" : "lvl-0");
        // HEADER — Identität: Name (seelen-gefärbt) + Seele + Modus-Chip | Vigor (HP-Anteil) als Sterne.
        const idZone = this._el(
            "div",
            { class: "spec-id" },
            this._el("span", { class: "spec-name soul-" + prof.soul, text: prof.name }),
            this._el("span", { class: "spec-soul-label", text: prof.soulLabel }),
            this._el("span", { class: "ich-mode-chip mode-" + prof.mode, text: prof.mode })
        );
        const vigor = prof.hpMax > 0 ? Math.max(0, Math.min(1, prof.hp / prof.hpMax)) : 0;
        const v5 = Math.round(vigor * 5);
        const qualZone = this._el(
            "div",
            { class: "spec-quality", title: "Verfassung — dein Lebensanteil (HP / max)." },
            this._el("span", { class: "spec-q-label", text: "Verfassung" }),
            this._el("span", { class: "spec-q-stars", text: "★".repeat(v5) + "☆".repeat(5 - v5) }),
            this._el("span", { class: "spec-q-val", text: `${Math.round(prof.hp)}/${Math.round(prof.hpMax)}` })
        );
        const header = this._el("div", { class: "spec-header" }, idZone, qualZone);

        // BODY — WERTE führen (links, equip-gefaltet, Balken) | NATUR sekundär (rechts, Compound-Tags).
        const werteChildren = [this._el("div", { class: "spec-col-head", text: "Werte" })];
        if (prof.stats) {
            const cs = prof.stats;
            const hpFrac = prof.hpMax > 0 ? prof.hp / prof.hpMax : 0;
            werteChildren.push(
                this._specBar(
                    "HP",
                    hpFrac,
                    `${Math.round(prof.hp)}/${Math.round(prof.hpMax)}`,
                    fracLvl(hpFrac),
                    "Lebenskraft (lebend/max)"
                )
            );
            const statBars = [
                ["Schaden", cs.damage, 25, "Schaden pro Schlag (härte+dichte, + Werkzeug)"],
                ["Tempo", cs.speed, 14, "Lauf-Tempo (leicht+magieleitung)"],
                ["Ausdauer", cs.staminaMax, 200, "max. Ausdauer"],
                ["Abwehr", cs.defense, 14, "physische Abwehr (dichte+härte, + Rüstung)"],
                ["Präzision", cs.precision, 1, "Präzision (magieleitung+zähigkeit)"],
            ];
            for (const [label, val, ref, title] of statBars) {
                if (!Number.isFinite(val)) continue;
                werteChildren.push(
                    this._specBar(label, val / ref, val.toFixed(1), fracLvl(val / ref), `${title}: ${val.toFixed(2)}`)
                );
            }
            const fmt = (n) => (Number.isFinite(n) ? n.toFixed(2) : "—");
            werteChildren.push(
                this._el(
                    "div",
                    { class: "spec-stat-strip" },
                    this._el(
                        "span",
                        { class: "spec-stat-chip", title: "Magie-Resistenz" },
                        this._el("span", { class: "spec-stat-name", text: "MR" }),
                        this._el("span", { class: "spec-stat-val", text: fmt(cs.magicResist) })
                    ),
                    this._el(
                        "span",
                        { class: "spec-stat-chip", title: "Hitze-Resistenz" },
                        this._el("span", { class: "spec-stat-name", text: "HR" }),
                        this._el("span", { class: "spec-stat-val", text: fmt(cs.heatResist) })
                    )
                )
            );
        } else {
            werteChildren.push(
                this._el("span", { class: "spec-empty", text: "Werte werden berechnet, wenn die Seele steht." })
            );
        }
        const leftCol = this._el("div", { class: "spec-col" }, ...werteChildren);

        const tagEntries = Object.entries(prof.tags || {})
            .filter(([, v]) => Number.isFinite(v) && v > 0.05)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);
        const natBars = tagEntries.map(([k, v]) =>
            this._specBar(
                k,
                v / 3,
                v.toFixed(2),
                this._natureLevelClass(v),
                `${k}: ${v.toFixed(2)} (Natur, 0–3 — speist die Werte)`
            )
        );
        const rightCol = this._el(
            "div",
            { class: "spec-col" },
            this._el("div", { class: "spec-col-head", text: "Natur" }),
            ...(natBars.length ? natBars : [this._el("span", { class: "spec-empty", text: "noch keine Substanz" })])
        );
        const body = this._el("div", { class: "spec-body" }, leftCol, rightCol);

        // FOOTER — die getragene Habe (Werkzeug/Rüstung) als Chips; Boosts leben im EINEN Band
        // (#ich-boosts-host). Das Chip-Glyph steht bewusst nicht hier — die Source-Probe sucht es.
        const habe = [];
        if (prof.equipped.tool) habe.push("⚒ " + prof.equipped.tool);
        if (prof.equipped.armor) habe.push("⛨ " + prof.equipped.armor);
        const footer = this._el(
            "div",
            { class: "spec-footer hof-spec-footer" },
            habe.length
                ? this._el(
                      "span",
                      { class: "spec-habe" },
                      ...habe.map((h) => this._el("span", { class: "spec-stat-chip", text: h }))
                  )
                : this._el("span", { class: "spec-empty", text: "nichts getragen" })
        );
        return this._el("div", { class: "spec-sheet hof-spec-sheet" }, header, body, footer);
    }

    // V18.61 Ich-F (ich-plan §H.1) — die CHRONIK gehört in den HOF (die Welt-Stimme/der Nexus erzählt, nicht
    // das Selbst): das worldJournal lebt jetzt in der Partitur des Hofes, nicht im Ich. Newest first, gekappt + „+N".
    _renderHofChronik() {
        if (typeof document === "undefined") return;
        const host = document.getElementById("hof-chronik");
        if (!host) return;
        host.innerHTML = "";
        const all =
            this.state.worldJournal && Array.isArray(this.state.worldJournal.entries)
                ? this.state.worldJournal.entries
                : [];
        const entries = all.slice(-6).reverse();
        if (!entries.length) {
            host.appendChild(this._el("span", { class: "ability-empty", text: "Die Welt hat noch nichts erlebt." }));
            return;
        }
        const now = Date.now();
        for (const e of entries) {
            let ago = "";
            if (Number.isFinite(e.at)) {
                const s = Math.max(0, Math.round((now - e.at) / 1000));
                ago = s < 60 ? `vor ${s}s` : s < 3600 ? `vor ${Math.round(s / 60)}m` : `vor ${Math.round(s / 3600)}h`;
            }
            host.appendChild(
                this._el(
                    "div",
                    { class: "chronik-row" },
                    this._el("span", { class: "chronik-text", text: e.text || "—" }),
                    this._el("span", { class: "chronik-when", text: ago })
                )
            );
        }
        if (all.length > entries.length)
            host.appendChild(
                this._el("div", { class: "chronik-more", text: `+ ${all.length - entries.length} ältere Einträge` })
            );
    }

    // Rendert das Selbst-Spec-Sheet in seinen Mount (die EMOTION lebt live in #status-emotions, wird NICHT hier
    // gewiped — der per-Frame-updateStatusPanel hält sie aktuell). Die CHRONIK lebt seit V18.61 im Hof (§H.1).
    _ichRenderSpecSheet() {
        if (typeof document === "undefined") return;
        const specMount = document.getElementById("ich-stage-spec");
        if (!specMount) return;
        specMount.innerHTML = "";
        specMount.appendChild(this._ichBuildSpecSheet(this._selfProfile()));
    }

    // Ich-C (ich-plan §D.1) — die SELBST-BÜHNE (der Avatar-3D-Star, Zwilling zur Hof-Bühne V18.54).
    _ichEnsureStage() {
        if (typeof document === "undefined" || typeof THREE === "undefined") return null;
        if (this.state.ichStage) return this.state.ichStage;
        const canvas = document.getElementById("ich-stage-canvas");
        if (!canvas) return null;
        const renderer = this._buehneRenderer(canvas, 360, 360, 0x171019, "Ich-Bühne", () => {
            stage.rendererReady = true;
            if (stage.active) this._ichStartRAF();
        });
        if (!renderer) return null;
        const scene = new THREE.Scene();
        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const key = new THREE.DirectionalLight(0xffe8c2, 0.95);
        key.position.set(4, 6, 5);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0x88aaff, 0.4);
        fill.position.set(-4, -1, -3);
        scene.add(fill);
        const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
        camera.position.set(0, 0.12, 4.2);
        camera.lookAt(0, 0, 0);
        const stage = {
            canvas,
            renderer,
            scene,
            camera,
            pivot: null,
            soul: null,
            yaw: 0.5,
            rafId: null,
            active: false,
            rendererReady: false,
        };
        this.state.ichStage = stage;
        return stage;
    }

    _ichStageShow(soul) {
        const stage = this.state.ichStage;
        if (!stage) return;
        if (stage.pivot && stage.soul === soul) return;
        if (stage.pivot) {
            stage.scene.remove(stage.pivot);
            this._disposeSoulGroup(stage.pivot);
            stage.pivot = null;
        }
        stage.soul = soul || null;
        if (!soul) return;
        // Labor = Welt: die Bühne zeigt den Leib, den die Welt der Seele baut — die EINE Leib-Wahl (`_leibDerSeele`; der
        // Wolf ist der Studio-Baum der Welt-Kreatur, nie der Block aus seinen Bauplan-Teilen).
        const group = this._leibDerSeele(soul, this._getSoulDef(soul), `self_${soul}`);
        if (!group) return;
        const box = new THREE.Box3().setFromObject(group);
        const center = box.getCenter(new THREE.Vector3());
        const dim = box.getSize(new THREE.Vector3());
        group.position.sub(center);
        const maxDim = Math.max(dim.x, dim.y, dim.z) || 1;
        // V18.67 Ich-J5 — der Viewer ist INFO (kein Star): den Avatar mit Rand framen (2.4 statt 3.0),
        // damit er als Porträt sitzt + nicht den ganzen kleinen Viewer füllt.
        group.scale.setScalar(2.4 / maxDim);
        const pivot = new THREE.Group();
        pivot.add(group);
        stage.scene.add(pivot);
        stage.pivot = pivot;
    }

    _ichStartRAF() {
        const stage = this.state.ichStage;
        if (!stage || stage.rafId !== null || !stage.rendererReady) return;
        const tick = () => {
            const s = this.state.ichStage;
            if (!s || !s.active) {
                if (s) s.rafId = null;
                return;
            }
            if (s.pivot) {
                s.yaw += 0.008;
                s.pivot.rotation.y = s.yaw;
            }
            if (s.rendererReady) {
                this._buehneRender(s.renderer, s.scene, s.camera, "Ich-Bühne");
            }
            s.rafId = requestAnimationFrame(tick);
        };
        stage.rafId = requestAnimationFrame(tick);
    }

    _ichStopRAF() {
        const stage = this.state.ichStage;
        if (stage && stage.rafId !== null) {
            cancelAnimationFrame(stage.rafId);
            stage.rafId = null;
        }
    }

    // Overlay-Hook (Zwilling zu _hofHandleDrawerChange): die Bühne + das Spec-Sheet leben nur bei offenem Ich.
    _ichHandleOverlay(open) {
        if (open) {
            // frische Werte (equip-gefaltet) — recompute setzt player.stats + statTags, die das Spec-Sheet liest.
            if (typeof this.recomputePlayerStats === "function") this.recomputePlayerStats();
            this._ichRenderSpecSheet();
            const stage = this._ichEnsureStage();
            if (stage) {
                stage.active = true;
                this._ichStageShow((this.state.player && this.state.player.soul) || "human");
                this._ichStartRAF();
            }
        } else if (this.state.ichStage) {
            this.state.ichStage.active = false;
            this._ichStopRAF();
        }
    }

    // Ich-G — die Bühne + das Spec-Sheet auf den AKTUELLEN Körper aktualisieren (nach einem Seelen-Wechsel).
    _ichRefreshStage() {
        this._ichRenderSpecSheet();
        if (this.state.ichStage) this._ichStageShow((this.state.player && this.state.player.soul) || "human");
    }

    // Hof-F (hof-plan §D.2) — die freundlichen Sektions-Labels (Seele + Spezialisierung).
    static get HOF_SECTION_LABELS() {
        return this._einmal("HOF_SECTION_LABELS", {
            wesen: "Hirsche",
            wolf: "Wölfe",
            fuchs: "Füchse",
            baer: "Bären",
            gather: "Sammler",
            build: "Bauer",
        });
    }

    // Hof-F (hof-plan §D.2/§G.4) — die Sektions-Leiste (Gruppen-Dirigat): Chips aus den LEBENDEN Profilen
    // (Seele/Spezialisierung) + die Befehlsleiste, die zur GANZEN Sektion spricht (DENSELBE assignTaskTo…).
    _renderHofSections() {
        if (typeof document === "undefined") return;
        const host = document.getElementById("hof-sections");
        if (!host) return;
        host.innerHTML = "";
        const creatures = this.state.creatures || [];
        const labels = AnazhRealm.HOF_SECTION_LABELS;
        const counts = new Map();
        for (const c of creatures) {
            const sec = this._creatureProfile(c).section;
            counts.set(sec, (counts.get(sec) || 0) + 1);
        }
        const active = this.state.hofSection || "alle";
        const chips = [["alle", "Alle", creatures.length]];
        for (const [sec, n] of counts) chips.push([sec, labels[sec] || sec, n]);
        for (const [sec, label, n] of chips) {
            host.appendChild(
                this._el(
                    "button",
                    {
                        class: "hof-section-chip" + (sec === active ? " active" : ""),
                        type: "button",
                        on: {
                            click: () => {
                                this.state.hofSection = sec;
                                this._renderCreatureListUI();
                            },
                        },
                    },
                    this._el("span", { text: label }),
                    this._el("span", { class: "hof-section-count", text: String(n) })
                )
            );
        }
        // Die Befehlsleiste — nur wenn eine echte Sektion gewählt ist (zur GANZEN Sektion sprechen).
        const cmdHost = document.getElementById("hof-section-cmd");
        if (!cmdHost) return;
        cmdHost.innerHTML = "";
        if (active === "alle") {
            cmdHost.hidden = true;
            return;
        }
        cmdHost.hidden = false;
        cmdHost.appendChild(
            this._el("span", { class: "hof-section-cmd-label", text: `Alle ${labels[active] || active}:` })
        );
        for (const [lbl, task] of [
            ["Folge", "follow_player"],
            ["Warte", "wait"],
            ["Streift", "wander"],
        ]) {
            cmdHost.appendChild(
                this._el("button", {
                    class: "creature-action-btn",
                    type: "button",
                    text: lbl,
                    on: {
                        click: () => {
                            this.assignTaskToAllCreatures(task, {}, (c) => this._creatureProfile(c).section === active);
                            this._renderCreatureListUI();
                        },
                    },
                })
            );
        }
    }

    _renderCreatureListUI() {
        if (typeof document === "undefined") return;
        const list = document.getElementById("creature-list");
        if (!list) return;
        list.innerHTML = "";
        this._renderHofSections();
        const allCreatures = this.state.creatures || [];
        // Hof-E/§G.9 — der einladende Leer-Zustand (das Spawnen als Held des leeren Hofes).
        if (allCreatures.length === 0) {
            this.state.hofSection = "alle";
            list.appendChild(
                this._el("div", {
                    class: "hof-empty",
                    text: "Dein Hof ist still. ✦ Rufe dein erstes Wesen — wähle eine Form unten und drücke +1.",
                })
            );
            this._hofRefreshFocus(); // leere Bühne + einladender Platzhalter
            return;
        }
        // Hof-F — die Sektion filtert, welche Wesen die Liste zeigt (das Dirigat zur Gruppe).
        const active = this.state.hofSection || "alle";
        const labels = AnazhRealm.HOF_SECTION_LABELS;
        const creatures =
            active === "alle" ? allCreatures : allCreatures.filter((c) => this._creatureProfile(c).section === active);
        if (creatures.length === 0) {
            list.appendChild(
                this._el("div", {
                    class: "hof-empty",
                    text: `Keine „${labels[active] || active}" mehr im Hof. Wähle „Alle" oben.`,
                })
            );
            this._hofRefreshFocus();
            return;
        }
        for (const c of creatures) {
            const ud = c.userData || {};
            // Hof-D0 (hof-plan §G.1) — EIN Profil, viele Leser. Statt N Inline-Lookups (Stats/Soul/
            // Specs/Task) liest die Zeile den EINEN `_creatureProfile`-Vektor (Verdichtung V9.82 + KONSUM
            // V17.31 — die Spec-Card, die Sektionen + die Sortierung teilen denselben Vektor in Hof-D/F).
            const prof = this._creatureProfile(c);
            // Welle 6.H Phase 2F.1 — Stats als Hover-Tooltip auf der Row (jetzt aus dem Profil-Vektor).
            let rowTitle = "";
            if (prof.stats) {
                const cs = prof.stats;
                const fmt = (n) => (Number.isFinite(n) ? n.toFixed(1) : "—");
                rowTitle =
                    `HP ${fmt(prof.hp)}/${fmt(prof.hpMax)} · DMG ${fmt(cs.damage)} · SPD ${fmt(cs.speed)} · ` +
                    `JMP ${fmt(cs.jumpPower)} · STA ${fmt(cs.staminaMax)} · ` +
                    `PRC ${fmt(cs.precision)} · MR ${fmt(cs.magicResist)} · HR ${fmt(cs.heatResist)} · ` +
                    `Stimmung ${prof.moodLabel}`;
            }
            // Welle 6.H Phase 2E V1.1 — Soul-Klasse für farbige Identität (cyan=Sprite-
            // Magie, brass=Wesen-erdig, grün=Geist-ätherisch).
            const soulForClass = prof.soul.length > 0 ? ` soul-${prof.soul}` : "";
            const nameEl = this._el("span", { class: "creature-name" + soulForClass, text: prof.name });
            const soulEl = this._el("span", { class: "creature-soul", text: prof.soulLabel });
            // Welle 6.H Phase 2D — Spezialisierungs-Pills (Top-2 aus dem Profil): „Sammler·material·L3".
            const specs = prof.specs.slice(0, 2);
            const specsWrap =
                specs.length > 0
                    ? this._el(
                          "span",
                          { class: "creature-specs" },
                          specs.map((s) =>
                              this._el("span", {
                                  class: `creature-spec creature-spec-${s.kind}`,
                                  text: `${s.kind === "gather" ? "Sammler" : "Bauer"}·${s.key}·L${s.level}`,
                                  title: `${s.count} Erfolge`,
                              })
                          )
                      )
                    : null;
            // Welle 6.H Phase 2F.2 — Equipped-Pills (Werkzeug + Rüstung wenn ausgerüstet, aus dem Profil).
            const equipped = prof.equipped;
            const equippedWrap =
                equipped.tool || equipped.armor
                    ? this._el(
                          "span",
                          { class: "creature-equipped" },
                          equipped.tool
                              ? this._el("span", {
                                    class: "creature-equip creature-equip-tool",
                                    text: `⚒ ${equipped.tool}`,
                                    title: `Werkzeug: ${equipped.tool}`,
                                })
                              : null,
                          equipped.armor
                              ? this._el("span", {
                                    class: "creature-equip creature-equip-armor",
                                    text: `⛨ ${equipped.armor}`,
                                    title: `Rüstung: ${equipped.armor}`,
                                })
                              : null
                      )
                    : null;
            // Welle 6.H Phase 2F.3 — Boost-Pills (aktive Konsumable-Boosts + Restzeit, tagDelta im Tooltip).
            const boostList = prof.boosts;
            let boostsWrap = null;
            if (Array.isArray(boostList) && boostList.length > 0) {
                const nowSec = performance.now() / 1000;
                const pills = [];
                for (const b of boostList) {
                    if (!b || !b.tagDelta) continue;
                    const remaining = Math.max(0, Math.round(b.expiresAt - nowSec));
                    const detail = Object.entries(b.tagDelta)
                        .map(([t, v]) => `${t}+${v.toFixed(2)}`)
                        .join(", ");
                    pills.push(
                        this._el("span", {
                            class: "creature-boost",
                            text: `✺ ${b.label || b.source}·${remaining}s`,
                            title: `${b.source} → ${detail}`,
                        })
                    );
                }
                if (pills.length > 0) boostsWrap = this._el("span", { class: "creature-boosts" }, pills);
            }
            const taskName = prof.taskName;
            const taskArgs = prof.taskArgs;
            const TASK_LABELS = {
                follow_player: "folgt",
                wait: "wartet",
                wander: "streift",
                gather: taskArgs.material ? `sammelt ${taskArgs.material}` : "sammelt",
                build: taskArgs.blueprint ? `baut ${taskArgs.blueprint}` : "baut",
                drink: "trinkt am Ufer",
            };
            const taskEl = this._el("span", { class: `creature-task ${taskName}`, text: TASK_LABELS[taskName] || "—" });
            // Hof-D (hof-plan §D.1/§G.2) — die STIMMUNG als Glyph, immer sichtbar (kompakt). Ehrlich geerdet:
            // froh/trübe (BINÄR `creatureEmotions`) × Temperament (neugierig/wachsam/scheu/vertraut aus
            // `_creatureWariness`+`bond`). Die Resonanz des Wesens auf das Feld + die Bindung (der wahre Norden).
            const moodSad = prof.emotion === "sad";
            const moodEl = this._el("span", {
                class: "creature-mood" + (moodSad ? " mood-sad" : " mood-happy"),
                text: (moodSad ? "☹ " : "☺ ") + prof.moodLabel,
                title: `Stimmung: ${prof.moodLabel} — die Resonanz des Wesens auf das Feld + die Bindung`,
            });
            // ALLE Befehle leben INLINE am Wesen: die drei arg-freien Kern-Tasks als Knöpfe, die arg-basierten
            // (Sammle Material / Baue Bauplan) als EIN „Auftrag ▾“-Select für GENAU dieses Wesen.
            const TASK_BTNS = [
                ["Folge", "follow_player"],
                ["Warte", "wait"],
                ["Streift", "wander"],
            ];
            const GATHER_MATS = [
                "holz",
                "stein",
                "quarz",
                "laub",
                "eisen",
                "bronze",
                "leder",
                "glut",
                "knochen",
                "fleisch",
                "federn",
                "schuppen",
            ];
            const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
            // W-A1/AUSLÖSCHUNG — donorOnly-Spender (heute keine Built-ins mehr; Alt-Saves) treten
            // in keinem nutzer-sichtbaren Picker auf (auch nicht im Baue-Auftrag-Select).
            const bpNames = Object.keys(this.state.blueprints || {})
                .filter((n) => this._katalogSichtbar(n))
                .sort();
            const orderSelect = this._el(
                "select",
                {
                    class: "creature-order-select",
                    "aria-label": `Auftrag für ${ud.name || "Wesen"}`,
                    title: `${ud.name || "Wesen"}: Sammle ein Material oder Baue einen Bauplan`,
                    onChange: (e) => {
                        e.stopPropagation();
                        const v = e.target.value;
                        if (!v) return;
                        const sep = v.indexOf(":");
                        const kind = v.slice(0, sep);
                        const arg = v.slice(sep + 1);
                        if (typeof this.assignCreatureTask === "function") {
                            if (kind === "gather") this.assignCreatureTask(c, "gather", { material: arg });
                            else if (kind === "build") this.assignCreatureTask(c, "build", { blueprint: arg });
                        }
                        this._renderCreatureListUI();
                    },
                },
                this._el("option", { value: "", text: "⚒ Auftrag…" }),
                this._el(
                    "optgroup",
                    { label: "Sammle" },
                    GATHER_MATS.map((m) => this._el("option", { value: `gather:${m}`, text: cap(m) }))
                ),
                bpNames.length
                    ? this._el(
                          "optgroup",
                          { label: "Baue" },
                          bpNames.map((n) =>
                              this._el("option", { value: `build:${n}`, text: this.state.blueprints[n].label || n })
                          )
                      )
                    : null
            );
            const actionsEl = this._el(
                "span",
                { class: "creature-actions-inline" },
                TASK_BTNS.map(([label, task]) =>
                    this._el("button", {
                        type: "button",
                        class: "creature-action-btn" + (taskName === task ? " active" : ""),
                        text: label,
                        "data-task": task,
                        title: `${ud.name || "Wesen"}: ${label}`,
                        onClick: (e) => {
                            e.stopPropagation();
                            if (typeof this.assignCreatureTask === "function") this.assignCreatureTask(c, task);
                            this._renderCreatureListUI();
                        },
                    })
                ),
                orderSelect
            );
            // Hof-D (§G.5/§G.6) — die Zeile ist der schlanke PICKER (Werkstatt-DNA: die Liste wählt, die BÜHNE
            // zeigt). Ein Klick FOKUSSIERT das Wesen → es tritt auf die Bühne + die Spec-Card liest DARUNTER
            // (`_hofRefreshFocus`), nicht mehr inline in der Zeile. Die `.focused`-Markierung zeigt die Wahl.
            const focused = !!this.state.hofFocusId && prof.id === this.state.hofFocusId;
            const rowMain = this._el(
                "div",
                {
                    class: "creature-row-main" + (focused ? " focused" : ""),
                    title: "Klick: Wesen auf die Bühne holen",
                    on: {
                        click: () => this._toggleHofFocus(prof.id),
                    },
                },
                this._el("span", { class: "creature-focus-caret", text: focused ? "◆" : "▸" }),
                nameEl,
                soulEl,
                moodEl,
                specsWrap,
                equippedWrap,
                boostsWrap,
                taskEl,
                actionsEl
            );
            if (rowTitle) rowMain.title = rowTitle;
            const row = this._el("div", { class: "creature-row" + (focused ? " focused" : "") }, rowMain);
            list.appendChild(row);
        }
        // Die Bühne + die Spec-Card unter ihr spiegeln das fokussierte (oder erste) Wesen.
        this._hofRefreshFocus();
    }

    inventoryInitDOM() {
        if (typeof document === "undefined") return;
        // Inventar-Toggle (Default Tab, Capture-Phase → vor allen anderen), liest keybindings.inventory.
        // Rebind-Capture hat Vorfahrt — sonst öffnet ein Tab beim Rebinden das Inventar.
        window.addEventListener(
            "keydown",
            (event) => {
                if (this.state.keybindRebind) return; // Rebind-Listener im main keydown übernimmt
                const code = this._eventToBindingCode(event);
                if (this._actionForBindingCode(code) !== "inventory") return;
                event.preventDefault();
                event.stopPropagation();
                const active = document.activeElement;
                if (active && typeof active.blur === "function" && active !== document.body) {
                    try {
                        active.blur();
                    } catch {
                        /* defensive */
                    }
                }
                this._verbTaste("inventory", true); // der EINE Auslöser (das Pad öffnet es ebenso)
            },
            true
        );
        // Initiales Render (leeres Inventar = leere Slots).
        this.renderInventoryUI();
    }

    // === Drag&Drop Inventar ↔ Hotbar ===
    // HTML5-Drag&Drop: Inv→Inv und Hot→Hot tauschen, Inv→Hot und Hot→Inv verschieben (siehe unten).
    // state.drag = {kind, index, name} hält die Quelle (in-Window, kein setData/JSON — robust gegen
    // leere dataTransfer). Der Click-Weg (selectInventorySlot → tryAssign) bleibt für Touch/Keyboard.
    _onSlotDragStart(event, kind, index) {
        const name =
            kind === "inv"
                ? this.state.player.inventory[index] && this.state.player.inventory[index].blueprintName
                : this.state.hotbar[index];
        if (!name) {
            event.preventDefault();
            return;
        }
        this.state.drag = { kind, index, name };
        // dataTransfer muss gesetzt sein, sonst gilt in Firefox kein drag.
        // Wir setzen einen harmlosen Marker; der echte Source-State lebt
        // in state.drag.
        try {
            event.dataTransfer.setData("text/plain", name);
            event.dataTransfer.effectAllowed = "move";
        } catch {
            /* defensive */
        }
        // Source-Slot visuell markieren.
        if (event.currentTarget && event.currentTarget.classList) {
            event.currentTarget.classList.add("dragging");
        }
    }

    _onSlotDragOver(event) {
        // Drop nur erlauben, wenn ein Drag aktiv ist — sonst zurück zur
        // Browser-Default-Behandlung (selektiert evtl. Text, harmlos).
        if (!this.state.drag) return;
        event.preventDefault();
        try {
            event.dataTransfer.dropEffect = "move";
        } catch {
            /* defensive */
        }
        // Target-Slot kurz hervorheben.
        const el = event.currentTarget;
        if (el && el.classList) el.classList.add("drop-target");
    }

    _onSlotDragLeave(event) {
        const el = event.currentTarget;
        if (el && el.classList) el.classList.remove("drop-target");
    }

    _onSlotDrop(event, targetKind, targetIndex) {
        event.preventDefault();
        const src = this.state.drag;
        // state.drag IMMER räumen — egal welcher Pfad genommen wird.
        // Sonst bliebt eine Drag-Session in state hängen, wenn der User
        // auf Source-Slot droppt (no-op-Pfad) oder ohne Source droppt.
        this.state.drag = null;
        // Visual aufräumen.
        document.querySelectorAll(".inventory-slot.drop-target, .hotbar-slot.drop-target").forEach((el) => {
            el.classList.remove("drop-target");
        });
        if (!src) return;
        // Kein-Op wenn Source == Target.
        if (src.kind === targetKind && src.index === targetIndex) return;

        if (src.kind === "inv" && targetKind === "inv") {
            // Inventory ↔ Inventory: Slots tauschen (Bauplan-Name + Count).
            const a = this.state.player.inventory[src.index];
            const b = this.state.player.inventory[targetIndex];
            this.state.player.inventory[src.index] = b;
            this.state.player.inventory[targetIndex] = a;
        } else if (src.kind === "inv" && targetKind === "hot") {
            // Inventar → Hotbar = MOVE: der Inv-Slot wird IMMER null (egal count).
            // Hot leer → Hot = src.name · gleicher Name → Hot bleibt · anderer Name → Swap
            // (Inv = {oldHotName, 1}, Hot = src.name).
            const oldHotName = this.state.hotbar[targetIndex];
            if (!oldHotName) {
                this.state.hotbar[targetIndex] = src.name;
                this.state.player.inventory[src.index] = null;
            } else if (oldHotName === src.name) {
                // Hot zeigt schon den Bauplan: Inv-Slot trotzdem leeren
                // (Move-Semantik konsequent — Source wird konsumiert).
                this.state.player.inventory[src.index] = null;
            } else {
                // Anderer Bauplan im Hot: Swap (Hotbar trägt nur Namen,
                // also Inv-Slot bekommt {oldHotName, 1}; ggf. überschüssige
                // Inv-Stack-Counts vom Source werden konsumiert).
                this.state.player.inventory[src.index] = { blueprintName: oldHotName, count: 1 };
                this.state.hotbar[targetIndex] = src.name;
            }
        } else if (src.kind === "hot" && targetKind === "hot") {
            // Hotbar ↔ Hotbar: Slots tauschen.
            const a = this.state.hotbar[src.index];
            const b = this.state.hotbar[targetIndex];
            this.state.hotbar[src.index] = b;
            this.state.hotbar[targetIndex] = a;
        } else if (src.kind === "hot" && targetKind === "inv") {
            // Hotbar → Inventar = echtes MOVE (analog addToInventory): Inv leer → {name, 1}, Hot null ·
            // gleicher Bauplan → count += 1, Hot null · anderer Bauplan → no-op (ein Swap verlöre den
            // Inv-Count, weil die Hotbar nur Namen trägt).
            const targetSlot = this.state.player.inventory[targetIndex];
            if (!targetSlot) {
                this.state.player.inventory[targetIndex] = { blueprintName: src.name, count: 1 };
                this.state.hotbar[src.index] = null;
            } else if (targetSlot.blueprintName === src.name) {
                targetSlot.count = (targetSlot.count || 1) + 1;
                this.state.hotbar[src.index] = null;
            }
            // else: anderer Bauplan im Ziel → drop schlägt fehl, beide
            // Slots bleiben unverändert (keine Daten gehen verloren).
        }

        // state.drag wurde schon oben (vor allen Pfaden) genullt.
        this.renderInventoryUI();
        this._renderHotbarDOM();
        try {
            this.saveState();
        } catch {
            /* save-Fehler nicht hart blockend */
        }
    }

    _onSlotDragEnd(event) {
        this.state.drag = null;
        // Source-Slot zurücksetzen + alle Drop-Targets aufräumen.
        if (event && event.currentTarget && event.currentTarget.classList) {
            event.currentTarget.classList.remove("dragging");
        }
        document.querySelectorAll(".dragging").forEach((el) => el.classList.remove("dragging"));
        document.querySelectorAll(".drop-target").forEach((el) => el.classList.remove("drop-target"));
    }

    _updateHotbarHighlight() {
        if (typeof document === "undefined") return;
        const slots = document.querySelectorAll("#hotbar .hotbar-slot");
        const bm = this.state.buildMode;
        // V17.74 — der ausgewählte Slot ist hervorgehoben: entweder der aktive Bau-Modus-Slot
        // (Platzier-Phantom) ODER der Slot, dessen Bauplan gerade in der Hand ist (Hotbar-Gate).
        const held = this.state.player && this.state.player.equipped && this.state.player.equipped.held;
        // V18.109 — E8: data-slot ist die Wahrheit (der Off-Hand-Slot steht als
        // erstes Kind — der forEach-INDEX wäre um 1 verschoben).
        slots.forEach((slot) => {
            const ds = slot.getAttribute("data-slot");
            const i = parseInt(ds, 10);
            if (!Number.isFinite(i)) {
                slot.classList.toggle("active", false);
                return;
            }
            const isBuild = bm.active && bm.slotIndex === i;
            const isHeld = !!held && this.state.hotbar[i] === held;
            slot.classList.toggle("active", isBuild || isHeld);
        });
    }

    // Hotbar-Belegung als VISUELLE 9-Slot-Reihe (Item klicken → Hotbar-Slot klicken weist zu).
    // Aufruf beim Drawer-Öffnen oder Init — idempotent.
    _renderHotbarConfigDOM() {
        if (typeof document === "undefined") return;
        const container = document.getElementById("hotbar-config");
        if (!container) return;
        this._renderHotbarInto(container);
    }

    // Werkstatt-State: selectedBlueprint, selectedPartIdx (Highlight), preview (lazy, runtime-only,
    // NICHT persistiert), manipulatorMode + snapEnabled (Session; Defaults translate + snap an).
    _ensureWorkshopState() {
        if (!this.state.workshop) {
            // AUSLÖSCHUNGS-WELLE: der Werkstatt-Erst-Default ist ein LEBENDER
            // Bauplan (die Eiche, der kanonische Schaustück-Baum) — der alte
            // "village"-Default fiel mit dem gleichnamigen Bauplan.
            this.state.workshop = { selectedBlueprint: "baum_eiche" };
        }
        if (typeof this.state.workshop.selectedPartIdx === "undefined") {
            this.state.workshop.selectedPartIdx = null;
        }
        if (typeof this.state.workshop.preview === "undefined") {
            this.state.workshop.preview = null;
        }
        // V8.02 Phase 3b — "connect" als 4. Modus für Klick-Klick-
        // Connection-Erzeugung (zwei Parts klicken → Connection-Type-Popover).
        const validModes = ["translate", "rotate", "scale", "connect"];
        if (!validModes.includes(this.state.workshop.manipulatorMode)) {
            this.state.workshop.manipulatorMode = "translate";
        }
        if (!this.state.workshop.connectFirstPartIdx && this.state.workshop.connectFirstPartIdx !== 0) {
            this.state.workshop.connectFirstPartIdx = null;
        }
        if (typeof this.state.workshop.snapEnabled !== "boolean") {
            this.state.workshop.snapEnabled = true;
        }
        // selectedRecipe = zweiter Selektions-Modus neben selectedBlueprint (genau EINER aktiv — die Setter
        // nullen den anderen). studioOv trägt Regler-Overrides je Preset (reine Daten; die ov-Vorschau
        // reist NIE in den Welt-Cache).
        if (typeof this.state.workshop.selectedRecipe === "undefined") {
            this.state.workshop.selectedRecipe = null;
        }
        if (!this.state.workshop.studioOv || typeof this.state.workshop.studioOv !== "object") {
            this.state.workshop.studioOv = {};
        }
        // ERFINDER-WELLE — die LOD-Wahl der Rezept-Auswahl (generisch aus kindStages).
        if (!Number.isFinite(this.state.workshop.recipeLod)) {
            this.state.workshop.recipeLod = 0;
        }
        return this.state.workshop;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_werkstatt_hof]);

// ===== ATLAS · Werkstatt/hof — Außen-Konstanten =====
// Menschen-lesbare Namen der Achsen — der fusionierte Readout (`_emotionState`)
// gibt sie an die KI/das Journal/die UI als REICHEN Zustand statt sechs Zahlen.
AnazhRealm.EMOTION_LABEL = Object.freeze({
    joy: "Freude",
    awe: "Ehrfurcht",
    sorrow: "Trauer",
    hope: "Hoffnung",
    peace: "Frieden",
    chaos: "Aufruhr",
});
