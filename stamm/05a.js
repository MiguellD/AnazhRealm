class AnazhRealm_Z05a {
    // ===== ATLAS §05 · UI-GRUNDIERUNG — Drawer · Omnibox · Help-Pops · Feed-Spiegel =====
    // Tab-System: ein Tab je Drawer. activeTab-Klasse auf dem Knopf,
    // hidden-Attribut entscheidet welcher Drawer sichtbar slidet.
    // Welle 6.X.4 V8.15 Punkt 15 — öffentliche toggleDrawer-Methode für
    // Keyboard-Shortcuts (M/K/P/B/I). Wenn der Drawer schon offen ist,
    // wird er geschlossen; sonst geöffnet (single-active-pattern).
    toggleDrawer(name) {
        if (typeof document === "undefined") return;
        const drawer = document.querySelector(`.drawer[data-drawer="${name}"]`);
        if (!drawer) return;
        const isOpen = !drawer.hidden;
        if (isOpen) {
            this.closeAllDrawers();
            return;
        }
        // Drawer öffnen — sync Tabs + Drawer-Status
        const tabs = Array.from(document.querySelectorAll("#topbar .tab"));
        const drawers = Array.from(document.querySelectorAll(".drawer[data-drawer]"));
        for (const tab of tabs) {
            const isActive = tab.getAttribute("data-tab") === name;
            tab.classList.toggle("active", isActive);
            tab.setAttribute("aria-selected", isActive ? "true" : "false");
        }
        for (const d of drawers) {
            d.hidden = d.getAttribute("data-drawer") !== name;
        }
        this.state.uiActiveDrawer = name;
        this._uiZeigerFrei(); // die Schublade gehört der Maus (Welle L, V-D2)
        // toggleDrawer ruft den Werkstatt-Lifecycle-Hook (Lazy-Init der 3D-Preview + RAF-Start) —
        // sonst bleiben Drawer-Shortcuts/API-Calls ohne Preview (state.workshop.preview === null).
        if (typeof this._workshopHandleDrawerChange === "function") {
            this._workshopHandleDrawerChange(name);
        }
        if (typeof this._hofHandleDrawerChange === "function") {
            this._hofHandleDrawerChange(name);
        }
        if (typeof this._feedHandleDrawerChange === "function") {
            this._feedHandleDrawerChange(name);
        }
    }

    // closeAllDrawers schließt alle (für Help-Klick + ESC).
    initTopbar() {
        const tabs = Array.from(document.querySelectorAll("#topbar .tab"));
        const drawers = Array.from(document.querySelectorAll(".drawer[data-drawer]"));
        if (tabs.length === 0 || drawers.length === 0) return;

        const openDrawer = (name) => {
            for (const tab of tabs) {
                const isActive = tab.getAttribute("data-tab") === name;
                tab.classList.toggle("active", isActive);
                tab.setAttribute("aria-selected", isActive ? "true" : "false");
            }
            // UI-Putz: der "Ich"-Tab (data-tab="spieler") öffnet das zentrierte Inventar-
            // Overlay (das vereinte Habe + Charakter + Rezeptbuch, wie Minecraft), keinen
            // Seiten-Drawer. Jeder andere Tab schließt das Overlay wieder.
            if (name === "spieler") {
                for (const drawer of drawers) drawer.hidden = true;
                if (typeof this.toggleInventoryOverlay === "function") this.toggleInventoryOverlay(true);
                return;
            }
            if (typeof this.toggleInventoryOverlay === "function" && this.state && this.state.inventoryOpen) {
                this.toggleInventoryOverlay(false);
            }
            for (const drawer of drawers) {
                const isThis = drawer.getAttribute("data-drawer") === name;
                drawer.hidden = !isThis;
            }
            this._uiZeigerFrei(); // die Schublade gehört der Maus (Welle L, V-D2)
            // UI-Putz: die Bibliothek beim Öffnen sofort füllen — die migrierten Welt-
            // Sektionen (Stammbaum/Tagebuch/Andere Welten) + die Welten-Liste.
            if (name === "bibliothek") {
                if (typeof this.updateWorldInfo === "function") this.updateWorldInfo();
                if (typeof this.renderLibraryUI === "function") this.renderLibraryUI();
            }
        };
        for (const tab of tabs) {
            tab.addEventListener("click", () => {
                const name = tab.getAttribute("data-tab");
                if (name) openDrawer(name);
            });
        }
        // Close-Buttons schließen den eigenen Drawer und entaktivieren den Tab.
        for (const closeBtn of document.querySelectorAll("[data-drawer-close]")) {
            closeBtn.addEventListener("click", () => this.closeAllDrawers());
        }
        // ESC schließt offene Drawers → zurück zum Default-Blick: die Welt.
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") this.closeAllDrawers();
        });
        // UI-Putz: kein "Welt"-Tab mehr — der Default-Blick IST die 3D-Welt (kein Drawer
        // offen, kein Tab aktiv = der WOW-Start). state.uiActiveDrawer trackt den aktuellen
        // Tab (null = die Welt), damit Tests + spätere Save-Persistenz darauf greifen können.
        this.state.uiActiveDrawer = null;
        // Tab-Klicks loggen indirekt über uiActiveDrawer. Jeder Tab-Klick informiert die Werkstatt:
        // Preview-Renderer an (Werkstatt offen) oder pausiert (anderer Tab).
        for (const tab of tabs) {
            tab.addEventListener("click", () => {
                const name = tab.getAttribute("data-tab");
                if (name) this.state.uiActiveDrawer = name;
                if (typeof this._workshopHandleDrawerChange === "function") {
                    this._workshopHandleDrawerChange(name);
                }
                if (typeof this._hofHandleDrawerChange === "function") {
                    this._hofHandleDrawerChange(name);
                }
                if (typeof this._feedHandleDrawerChange === "function") {
                    this._feedHandleDrawerChange(name);
                }
            });
        }
        // P12 (UI-Putz §1.5) — der geteilte Overlay-Hebel verdrahtet (einmal, delegiert).
        this._installHelpPopovers();
        // V18.45 — die Omnibox (Ctrl/Cmd+K): der EINE beschwörbare Ort für jede Absicht.
        this._installOmnibox();
    }

    // Overlay-Integrität für ALLE „?"-Popovers: der `.drawer` trägt `transform` + `overflow:hidden`
    // → Containing-Block für position:fixed UND Clip. Darum das Popover bei Hover/Fokus nach
    // `document.body` PORTALIEREN (fixed am Viewport, opak, z-index:9999). Delegiert über document
    // (trifft auch später gerenderte „?"-Punkte). Idempotent.
    _installHelpPopovers() {
        if (typeof document === "undefined" || this._helpPopWired) return;
        this._helpPopWired = true;
        const popFor = (dot) => {
            // Nach dem Portal ist das Popover kein Kind mehr → die Referenz am Dot halten.
            if (dot._helpPop && dot._helpPop.isConnected) return dot._helpPop;
            const pop = dot.querySelector(":scope > .help-pop") || dot._helpPop;
            if (pop) dot._helpPop = pop;
            return pop || null;
        };
        const show = (dot) => {
            const pop = popFor(dot);
            if (!pop) return;
            if (pop.parentElement !== document.body) document.body.appendChild(pop);
            pop.classList.add("help-pop-open");
            // Messen (getBoundingClientRect erzwingt Reflow → echte Maße trotz frisch display:block).
            const r = dot.getBoundingClientRect();
            const pr = pop.getBoundingClientRect();
            const M = 8;
            // dot-right öffnet rechtsbündig zum Punkt, sonst linksbündig — dann am Rand klemmen.
            let left = dot.classList.contains("dot-right") ? r.right - pr.width : r.left;
            left = Math.max(M, Math.min(left, window.innerWidth - pr.width - M));
            // unter dem Punkt; kein Platz → darüber kippen.
            let top = r.bottom + 6;
            if (top + pr.height > window.innerHeight - M) top = Math.max(M, r.top - pr.height - 6);
            pop.style.left = `${Math.round(left)}px`;
            pop.style.top = `${Math.round(top)}px`;
        };
        const hide = (dot) => {
            const pop = dot._helpPop;
            if (pop) pop.classList.remove("help-pop-open");
        };
        document.addEventListener("pointerover", (e) => {
            const t = e.target;
            const dot = t && t.closest && t.closest(".help-dot");
            if (dot) show(dot);
        });
        document.addEventListener("pointerout", (e) => {
            const t = e.target;
            const dot = t && t.closest && t.closest(".help-dot");
            // Beim Verlassen des Punktes (das Popover lebt in body → kein relatedTarget im Punkt).
            if (dot && !(e.relatedTarget && dot.contains(e.relatedTarget))) hide(dot);
        });
        document.addEventListener("focusin", (e) => {
            const t = e.target;
            const dot = t && t.closest && t.closest(".help-dot");
            if (dot) show(dot);
        });
        document.addEventListener("focusout", (e) => {
            const t = e.target;
            const dot = t && t.closest && t.closest(".help-dot");
            if (dot) hide(dot);
        });
    }

    // DIE OMNIBOX (Ctrl/Cmd+K): EIN Ort für jede Absicht. Ruft NUR bestehende Pfade
    // (processChatCommand · selectBlueprintForEdit · Tab-Klick) + liest bestehende Vektoren
    // (chatCommandHelp · state.blueprints · _displayRole). Tags c/b/w/s/t/a/g/p/geh/welt/k,
    // Freitext → Nexus. Idempotent.
    _installOmnibox() {
        if (typeof document === "undefined" || this._omniboxWired) return;
        const overlay = document.getElementById("omnibox-overlay");
        const input = document.getElementById("omnibox-input");
        const list = document.getElementById("omnibox-results");
        if (!overlay || !input || !list) return;
        this._omniboxWired = true;
        this._omniboxState = { results: [], sel: 0 };
        const open = () => {
            overlay.hidden = false;
            input.value = "";
            this._omniboxUpdate("");
            input.focus();
        };
        const close = () => {
            overlay.hidden = true;
        };
        this._omniboxOpen = open;
        this._omniboxClose = close;
        // Globaler Hotkey Ctrl/Cmd+K (toggle). Esc schließt.
        window.addEventListener("keydown", (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
                e.preventDefault();
                overlay.hidden ? open() : close();
            } else if (!overlay.hidden && e.key === "Escape") {
                e.preventDefault();
                close();
            }
        });
        // Klick auf den Hintergrund schließt.
        overlay.addEventListener("mousedown", (e) => {
            if (e.target === overlay) close();
        });
        // V18.47 — der sichtbare Maus-Trigger in der Topbar (Ctrl+K war nur Tastatur). Die GLOBALE Omnibox
        // (Befehle/Räume/Baupläne) bleibt hier; das ICH hat seit V18.65 seine EIGENE Selbst-Suche (#ich-search,
        // treibt Habe + Rezeptbuch) statt eines toten Knopfes auf die globale Omnibox (der war die Nullnummer).
        const trigger = document.getElementById("omnibox-trigger");
        if (trigger) trigger.addEventListener("click", () => (overlay.hidden ? open() : close()));
        input.addEventListener("input", () => this._omniboxUpdate(input.value));
        // Tastatur im Feld: ↑↓ wählen, ⏎ ausführen. stopPropagation schirmt die Spiel-Steuerung ab
        // (sonst liefen WASD beim Tippen). preventDefault nur für die Navigations-Tasten.
        input.addEventListener("keydown", (e) => {
            e.stopPropagation();
            const st = this._omniboxState;
            if (e.key === "ArrowDown") {
                e.preventDefault();
                st.sel = Math.min(st.sel + 1, st.results.length - 1);
                this._omniboxHighlight();
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                st.sel = Math.max(st.sel - 1, 0);
                this._omniboxHighlight();
            } else if (e.key === "Enter") {
                e.preventDefault();
                const r = st.results[st.sel];
                if (r) this._omniboxExecute(r);
            }
        });
    }

    _omniboxUpdate(query) {
        if (typeof document === "undefined") return;
        const list = document.getElementById("omnibox-results");
        if (!list) return;
        const results = this._omniboxSearch(query);
        this._omniboxState.results = results;
        this._omniboxState.sel = 0;
        list.innerHTML = "";
        if (!results.length) {
            list.appendChild(
                this._el("div", {
                    class: "omnibox-empty",
                    text: "Kein Treffer — tippe weiter oder sprich frei zum Nexus.",
                })
            );
            return;
        }
        results.forEach((r, i) => {
            list.appendChild(
                this._el(
                    "div",
                    {
                        class: "omnibox-item" + (i === 0 ? " sel" : ""),
                        role: "option",
                        onClick: () => this._omniboxExecute(r),
                    },
                    this._el("span", { class: "omnibox-kind", text: r.kindLabel }),
                    this._el("span", { class: "omnibox-label", text: r.label }),
                    r.sub ? this._el("span", { class: "omnibox-sub", text: r.sub }) : null
                )
            );
        });
    }

    _omniboxHighlight() {
        if (typeof document === "undefined") return;
        const list = document.getElementById("omnibox-results");
        if (!list) return;
        const items = list.querySelectorAll(".omnibox-item");
        items.forEach((el, i) => el.classList.toggle("sel", i === this._omniboxState.sel));
        const sel = items[this._omniboxState.sel];
        if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: "nearest" });
    }

    _omniboxExecute(r) {
        if (!r) return;
        try {
            if (typeof r.run === "function") r.run();
        } catch (e) {
            this.log(`Omnibox-Fehler: ${e && e.message}`, "ERROR");
        }
        if (this._omniboxClose) this._omniboxClose();
    }

    // Der EINE Such-KERN aller Such-Flächen (keine Privat-Filter daneben): Mehrwort-UND — jedes
    // Query-Wort muss im Heuhaufen vorkommen („eisen klinge" findet die Eisen-Klinge).
    _matchQuery(hay, query) {
        const q = (query || "").trim().toLowerCase();
        if (!q) return true;
        const h = (hay || "").toLowerCase();
        for (const word of q.split(/\s+/)) {
            if (word && !h.includes(word)) return false;
        }
        return true;
    }

    // Der EINE Blueprint-Heuhaufen: Name + Label + Rolle (ID UND deutsches Label — „bauwerk" trifft
    // architecture) + Materialien + die 2 stärksten Tag-Achsen. Jede Bauplan-Such-Fläche liest IHN.
    _blueprintSearchText(bp) {
        if (!bp) return "";
        const parts = Array.isArray(bp.parts) ? bp.parts : [];
        const role = this._displayRole(bp);
        const roleLabel = AnazhRealm.ROLE_LABELS[role] || AnazhRealm.BLUEPRINT_ROLE_LABELS[role] || "";
        const mats = [...new Set(parts.map((p) => p && p.material).filter(Boolean))];
        const tags = this.computeCompoundTags(bp) || {};
        const topTags = Object.entries(tags)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([k]) => (AnazhRealm.AXIS_LABELS && AnazhRealm.AXIS_LABELS[k]) || k);
        return [bp.label || "", bp.name || "", role, roleLabel, mats.join(" "), topTags.join(" ")]
            .join(" ")
            .toLowerCase();
    }

    // Das Herz: parse die Tag-Grammatik, lese die BESTEHENDEN Vektoren, ranke. Liefert
    // [{kindLabel, label, sub, run}]. Reine Lese-Funktion (headless verifizierbar).
    _omniboxSearch(query) {
        const q = (query || "").trim();
        const m = q.match(/^([a-zäöü]+):\s*(.*)$/i);
        const prefix = m ? m[1].toLowerCase() : null;
        const term = (m ? m[2] : q).trim().toLowerCase();
        const out = [];
        const LIMIT = 14;
        const ROLE_PREFIX = {
            w: ["weapon"],
            s: ["armor"],
            t: ["consumable"],
            a: ["soul"],
            g: ["tool", "held", "brecher", "weapon"],
            p: ["portal"],
        };
        const addCommands = (t) => {
            for (const g of this.chatCommandHelp || []) {
                for (const cmd of g.commands || []) {
                    if (out.length >= LIMIT) return;
                    if (!t || cmd.toLowerCase().includes(t))
                        out.push({
                            kindLabel: "Befehl",
                            label: cmd,
                            sub: g.title,
                            run: () => this.processChatCommand(cmd),
                        });
                }
            }
        };
        const addBlueprints = (t, roles) => {
            for (const bp of Object.values(this.state.blueprints || {})) {
                if (out.length >= LIMIT) return;
                if (!bp || !Array.isArray(bp.parts)) continue;
                // KATALOG-SICHT (18.07., M1): die EINE Sicht-Regel — donorOnly
                // UND Render-Varianten (grown_*, *_var1+) treten nie auf.
                if (!this._katalogSichtbar(bp.name, bp)) continue;
                const role = this._displayRole(bp);
                if (roles && !roles.includes(role)) continue;
                // M4 (V18.158) — der EINE Heuhaufen + Kern: Name/Rolle(label)/Material/Tags.
                if (this._matchQuery(this._blueprintSearchText(bp), t)) {
                    const rl = AnazhRealm.ROLE_LABELS[role] || AnazhRealm.BLUEPRINT_ROLE_LABELS[role] || role;
                    out.push({
                        kindLabel: rl,
                        label: bp.label || bp.name,
                        sub: "Bauplan",
                        run: () => {
                            const tab = document.querySelector('[data-tab="werkstatt"]');
                            if (tab) tab.click();
                            if (typeof this.selectBlueprintForEdit === "function") this.selectBlueprintForEdit(bp.name);
                        },
                    });
                }
            }
        };
        // V18.76 — `welt:` surfaced die einzelnen WELTEN (wie `b:` die Baupläne) — die Konsistenz-Lücke
        // vs. den 3 Räumen (bibliothek-plan §D.4): jede Welt liest ihren `_worldProfile`-Such-Index;
        // ein Treffer öffnet die Bibliothek + treibt die Selbst-Suche auf den Namen (der J5-Loop).
        const addWorlds = (t) => {
            for (const w of this._libraryWorlds()) {
                if (out.length >= LIMIT) return;
                const p = this._worldProfile(w);
                if (!this._matchQuery(p.searchText, t)) continue; // M4 — der EINE Kern
                out.push({
                    kindLabel: p.trust === "sandboxed" ? "Sandbox-Welt" : "Welt",
                    label: p.label,
                    sub: p.hasDsl ? p.dsl.slice(0, 3).join(" ") : "Welt",
                    run: () => {
                        const tab = document.querySelector('[data-tab="bibliothek"]');
                        if (tab) tab.click();
                        const search = document.getElementById("library-search");
                        if (search) {
                            search.value = p.label;
                            if (typeof this._applyLibraryFilter === "function") this._applyLibraryFilter();
                        }
                    },
                });
            }
        };
        const ROOMS = [
            ["werkstatt", "werkstatt", "Werkstatt"],
            ["hof", "kreaturen", "Hof"],
            ["kreaturen", "kreaturen", "Hof"],
            ["ich", "spieler", "Ich"],
            ["spieler", "spieler", "Ich"],
            ["bibliothek", "bibliothek", "Bibliothek"],
            ["einstellungen", "einstellungen", "Einstellungen"],
        ];
        const addRooms = (t) => {
            const seen = new Set();
            for (const [key, tabName, label] of ROOMS) {
                if (t && !key.includes(t) && !label.toLowerCase().includes(t)) continue;
                if (seen.has(tabName)) continue;
                seen.add(tabName);
                out.push({
                    kindLabel: "Raum",
                    label,
                    sub: "öffnen",
                    run: () => {
                        const el = document.querySelector(`[data-tab="${tabName}"]`);
                        if (el) el.click();
                    },
                });
            }
        };
        const addCreatureTasks = (t) => {
            const TASKS = [
                ["folge", "alle folgt mir"],
                ["komm", "alle folgt mir"],
                ["warte", "alle warten"],
                ["erkunde", "alle erkundet"],
            ];
            for (const [word, cmd] of TASKS) {
                if (out.length >= LIMIT) return;
                if (!t || word.includes(t))
                    out.push({
                        kindLabel: "Kreatur",
                        label: `Alle Wesen: ${word}`,
                        sub: "Auftrag",
                        run: () => this.processChatCommand(cmd),
                    });
            }
        };
        const nexusFallback = () => {
            if (q)
                out.push({
                    kindLabel: "Nexus",
                    label: `Sprich: „${q}"`,
                    sub: "zum Nexus",
                    run: () => this.processChatCommand(q),
                });
        };

        if (prefix === "c") addCommands(term);
        else if (prefix === "b") addBlueprints(term, null);
        else if (ROLE_PREFIX[prefix]) addBlueprints(term, ROLE_PREFIX[prefix]);
        else if (prefix === "geh") addRooms(term);
        else if (prefix === "k") addCreatureTasks(term);
        else if (prefix === "welt") addWorlds(term);
        else {
            // Freitext: über die Domänen ranken (Befehl → Bauplan → Welt → Raum), dann der Nexus-Pfad.
            addCommands(term);
            addBlueprints(term, null);
            addWorlds(term);
            addRooms(term);
            nexusFallback();
        }
        // Ein präfixierter Query ohne Treffer bietet trotzdem den Nexus an (nichts ist eine Sackgasse).
        if (prefix && out.length === 0) nexusFallback();
        return out.slice(0, LIMIT);
    }

    closeAllDrawers() {
        // Im Werkstatt-Connect-Mode (Source-Part gewählt ODER Popover offen) bricht ESC nur die
        // Connect-Geste ab, nicht den ganzen Drawer.
        const ws = this.state.workshop;
        if (
            ws &&
            this.state.uiActiveDrawer === "werkstatt" &&
            ws.manipulatorMode === "connect" &&
            (ws.connectFirstPartIdx !== null ||
                (typeof document !== "undefined" && document.getElementById("workshop-connect-overlay")))
        ) {
            ws.connectFirstPartIdx = null;
            if (typeof this._workshopCloseConnectPopover === "function") {
                this._workshopCloseConnectPopover();
            }
            if (typeof this._workshopSetSelection === "function") {
                this._workshopSetSelection(null);
            }
            return;
        }
        const tabs = document.querySelectorAll("#topbar .tab");
        for (const tab of tabs) {
            tab.classList.remove("active");
            tab.setAttribute("aria-selected", "false");
        }
        for (const drawer of document.querySelectorAll(".drawer[data-drawer]")) {
            drawer.hidden = true;
        }
        this.state.uiActiveDrawer = null;
        // Welle 6.B Phase 1: Werkstatt-Preview pausieren (Renderer bleibt
        // alloziert für schnelles Re-Open, aber RAF-Loop stoppt).
        if (typeof this._workshopHandleDrawerChange === "function") {
            this._workshopHandleDrawerChange(null);
        }
        if (typeof this._hofHandleDrawerChange === "function") {
            this._hofHandleDrawerChange(null);
        }
        if (typeof this._feedHandleDrawerChange === "function") {
            this._feedHandleDrawerChange(null);
        }
    }

    // Resize-Handles: Konsole „tr" (wächst nach oben, bottom-Anker), Drawer „b" (nur Höhe).
    // Größen persistieren in localStorage (`anazh.resize.<id>`); Doppelklick auf den Griff → Default.
    installResizeHandles() {
        if (typeof document === "undefined") return;
        const consoleEl = document.getElementById("console");
        // V18.83 — die Konsole sitzt jetzt UNTEN-LINKS, bottom-verankert (Game-Konvention).
        // Der „tr"-Griff (oben-rechts) wächst nach OBEN + behält den bottom-Anker — die Historie
        // wächst nach oben aus dem Eingabe-Feld, wie ein echter Chat.
        if (consoleEl) this._installResizeHandle(consoleEl, "tr");
        const drawers = document.querySelectorAll(".drawer[data-drawer]");
        // Die Drawer sind CSS-bounded symmetrisch (left:12;right:12;width:auto) — eine Inline-Breite
        // bräche das. Darum stale Inline-Breite räumen und nur einen HÖHEN-Griff (corner "b") geben.
        drawers.forEach((d) => {
            this._wrapDrawerScroll(d);
            d.style.width = "";
            d.style.maxHeight = "";
            this._installResizeHandle(d, "b");
        });
    }

    // V8.01 — wrappt alle children eines Drawers (außer Header h2, close-button
    // und Resize-Handle) in einen scrollbaren <div class="drawer-scroll">.
    // Idempotent: zweiter Aufruf macht nichts.
    _wrapDrawerScroll(drawer) {
        if (!drawer) return;
        if (drawer.querySelector(":scope > .drawer-scroll")) return;
        const wrapper = document.createElement("div");
        wrapper.className = "drawer-scroll";
        // Sammle alle direkten children, die wir in den Wrapper verschieben:
        // alles außer h2, .drawer-close, .resize-handle (die bleiben am Container).
        const children = Array.from(drawer.children);
        const toMove = children.filter((c) => {
            if (c.tagName === "H2") return false;
            if (c.classList && c.classList.contains("drawer-close")) return false;
            if (c.classList && c.classList.contains("resize-handle")) return false;
            return true;
        });
        toMove.forEach((c) => wrapper.appendChild(c));
        drawer.appendChild(wrapper);
    }

    _installResizeHandle(container, corner) {
        if (!container) return;
        if (container.querySelector(":scope > .resize-handle")) return; // idempotent
        const handle = document.createElement("div");
        handle.className = `resize-handle resize-${corner}`;
        // W-A (V18.165, Korpus R-001): die Konsole wächst nach OBEN (bottom-Anker) —
        // der Griff sagt es jetzt (Titel + sichtbare Ecken-Affordanz im CSS).
        handle.setAttribute(
            "title",
            corner === "tr"
                ? "Größe ziehen (wächst nach oben) · Doppelklick: Standard"
                : "Größe ändern · Doppelklick: Default"
        );
        handle.setAttribute("aria-label", "Größe ändern");
        container.appendChild(handle);

        // Container-ID für Persistence (entweder #id oder data-drawer)
        const cid = container.id || container.getAttribute("data-drawer") || "container";
        const storageKey = `anazh.resize.${cid}`;
        // V18.43 — corner "b" = HÖHEN-only (Drawer): die Breite bleibt beim CSS-Rahmen
        // (left:12;right:12), nur die Höhe ist anpassbar → Symmetrie bleibt.
        const heightOnly = corner === "b";

        // Gespeicherte Größe wiederherstellen
        const restoreSavedSize = () => {
            const raw = typeof localStorage !== "undefined" ? localStorage.getItem(storageKey) : null;
            if (!raw) return;
            try {
                const saved = JSON.parse(raw);
                if (!heightOnly && saved && typeof saved.width === "number" && saved.width > 0) {
                    container.style.width = `${saved.width}px`;
                }
                if (saved && typeof saved.height === "number" && saved.height > 0) {
                    container.style.height = `${saved.height}px`;
                    container.style.maxHeight = "none";
                    // V18.83 — bei „tr" (Konsole, bottom-verankert, wächst nach oben) BLEIBT der
                    // bottom-Anker; nur die alte top-verankerte br/bl-Variante bräuchte bottom:auto.
                    if (container.id === "console" && (corner === "br" || corner === "bl")) {
                        container.style.bottom = "auto";
                    }
                }
            } catch {
                /* ignore */
            }
        };
        restoreSavedSize();

        // Drag-State
        let drag = null;
        const onDown = (event) => {
            event.preventDefault();
            event.stopPropagation();
            const rect = container.getBoundingClientRect();
            drag = {
                startX: event.clientX,
                startY: event.clientY,
                startW: rect.width,
                startH: rect.height,
            };
        };
        const onMove = (event) => {
            if (!drag) return;
            const dx = event.clientX - drag.startX;
            const dy = event.clientY - drag.startY;
            let newW;
            let newH;
            if (corner === "br") {
                // bottom-right: wächst nach rechts (+dx) + unten (+dy)
                newW = drag.startW + dx;
                newH = drag.startH + dy;
            } else if (corner === "bl") {
                // bottom-left: wächst nach links (-dx) + unten (+dy)
                newW = drag.startW - dx;
                newH = drag.startH + dy;
            } else if (corner === "tr") {
                // Welle 6.X.2 V8.15 — top-right: wächst nach rechts (+dx) +
                // OBEN (-dy). Konsole hat bottom-anchor, also vergrößern wir
                // sie nach oben statt nach unten.
                newW = drag.startW + dx;
                newH = drag.startH - dy;
            } else if (corner === "b") {
                // V18.43 — bottom-center: NUR Höhe (+dy), Breite unangetastet (CSS-Rahmen).
                newW = drag.startW;
                newH = drag.startH + dy;
            } else {
                // Fallback (top-left, falls jemals genutzt)
                newW = drag.startW - dx;
                newH = drag.startH - dy;
            }
            // Clamp: Min + Max (Viewport-Abstand). Die Min respektiert den START-Zustand: wer kleiner startet
            // (eingeklappte Konsole 105 px), springt beim ersten Drag nicht auf die harte Min — die gilt nur
            // beim Größer-Ziehen.
            const minW = Math.min(220, drag.startW);
            const minH = Math.min(180, drag.startH);
            const clampedW = Math.max(minW, Math.min(window.innerWidth - 40, newW));
            const clampedH = Math.max(minH, Math.min(window.innerHeight - 140, newH));
            if (!heightOnly) container.style.width = `${clampedW}px`;
            container.style.height = `${clampedH}px`;
            container.style.maxHeight = "none";
            if (container.id === "console") {
                // top-right Konsole behält bottom-anchor + height wächst nach oben.
                // Nur bei br/bl muss bottom auf auto (CSS-Default bleibt sonst).
                if (corner === "br" || corner === "bl") container.style.bottom = "auto";
            }
        };
        const onUp = () => {
            if (!drag) return;
            // Persist
            try {
                const w = heightOnly ? 0 : parseInt(container.style.width, 10) || 0;
                const h = parseInt(container.style.height, 10) || 0;
                if (typeof localStorage !== "undefined") {
                    localStorage.setItem(storageKey, JSON.stringify({ width: w, height: h }));
                }
            } catch {
                /* ignore */
            }
            drag = null;
        };
        handle.addEventListener("mousedown", onDown);
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);

        // Doppelklick → Reset auf Default (CSS-Werte greifen wieder)
        handle.addEventListener("dblclick", (event) => {
            event.preventDefault();
            event.stopPropagation();
            container.style.width = "";
            container.style.height = "";
            container.style.maxHeight = "";
            if (container.id === "console") container.style.bottom = "";
            try {
                if (typeof localStorage !== "undefined") localStorage.removeItem(storageKey);
            } catch {
                /* ignore */
            }
        });
    }

    updateStatusPanel(currentTime) {
        if (!this._statusRefs) return;
        if (currentTime - this._statusRefs.lastTick < 0.4) return;
        this._statusRefs.lastTick = currentTime;
        const r = this._statusRefs;
        if (r.weather) r.weather.textContent = this.state.weather || "—";
        if (r.slug) r.slug.textContent = this.state.worldMeta.slug || "—";
        if (r.position && this.state.playerMesh) {
            const p = this.state.playerMesh.position;
            r.position.textContent = `${p.x.toFixed(1)} ${p.y.toFixed(1)} ${p.z.toFixed(1)}`;
        }
        if (r.fps) {
            // V18.390 — die Trias SYNERGETISCH in die bestehende Status-Bar (FPS · Bauten · Position),
            // statt eines zweiten Panels (Schöpfer-Befund „wieso nicht dort wo wir schon fps/Bauten haben").
            const s = this.state.perfSense;
            let extra = "";
            if (s) {
                const dc = Math.round(s.renderCalls || 0);
                const trisK = Math.round((s.renderTris || 0) / 1000);
                const folResPct = Math.round(
                    (this.state._foliageResScale != null ? this.state._foliageResScale : 1) * 100
                );
                extra = ` · ${dc}dc · ${trisK}k▲ · Laub ${folResPct}%`;
            }
            r.fps.textContent = String(this.state.fps || 0) + extra;
        }
        if (r.creatures) r.creatures.textContent = String(this.state.creatures.length);
        if (r.soul) {
            // ALTLASTEN-NULL: die EINE Auflösungs-Quelle (_getSoulDef) — auch ein
            // getragener Tier-Körper (Custom-Seele bp_koerper_*) zeigt sein Label.
            const def = this._getSoulDef(this.state.player.soul || "human");
            r.soul.textContent = (def && def.label) || "—";
        }
        if (r.architectures) {
            const counts = this.countArchitecturesNearPlayer(60);
            r.architectures.textContent = `${counts.near} nah / ${counts.total}`;
        }
        // Welle 6.G3 — Tageszeit-Anzeige (zusätzlich zum 10-Hz-Refresh in
        // tickDayNight; diese Schleife läuft 0.4 s und ist Backup für die
        // Fälle wo tickDayNight pausiert ist).
        if (r.time) {
            const t = typeof this.state.timeOfDay === "number" ? this.state.timeOfDay : 0.5;
            r.time.textContent = this._timeOfDayLabel(t);
        }
        const e = this.state.player.emotions;
        for (const axis of Object.keys(r.emotions)) {
            const v = Math.max(0, Math.min(1, e[axis] || 0));
            r.emotions[axis].fill.style.width = `${(v * 100).toFixed(0)}%`;
            r.emotions[axis].value.textContent = v.toFixed(2);
        }
        this._updateEmotionFeedback();
        this.renderAbilitiesList();
        this.renderWorldRulesList();
    }

    // Emotion-Feedback: färbt das Leisten-WORT in der Farbe der dominanten Emotion (EINE Quelle
    // _emotionState), Intensität → Opazität. Trägt die Stimmung in jeder Kamera.
    _updateEmotionFeedback() {
        const lab = this._emotionLabel;
        if (!lab) return;
        const es = this._emotionState();
        const item = typeof lab.closest === "function" ? lab.closest(".status-item") : null;
        if (es.dominant && es.intensity > 0.2) {
            const css = window.getComputedStyle(document.body).getPropertyValue(`--${es.dominant}`).trim() || "#ffffff";
            if (this._emotionLabelHideTimer) {
                clearTimeout(this._emotionLabelHideTimer);
                this._emotionLabelHideTimer = null;
            }
            if (item) item.style.display = "";
            lab.textContent = es.label;
            lab.style.color = css;
            lab.style.opacity = "0.8";
        } else {
            lab.style.opacity = "0";
            // Nach dem 1.4-s-Fade verlässt das Item den Leisten-Flow (display:none) — mit opacity 0 bliebe
            // ein Loch und der Flex-Gap verdoppelte sich um ein unsichtbares Mitglied.
            if (item && !this._emotionLabelHideTimer) {
                this._emotionLabelHideTimer = setTimeout(() => {
                    this._emotionLabelHideTimer = null;
                    if (lab.style.opacity === "0") item.style.display = "none";
                }, 1500);
            }
        }
    }

    // V18.53 Hof-Partitur — die Gesten („Der Nexus komponiert") auf denselben Stand wie die Regeln:
    // jede Geste ist eine EINMALIGE Tat (✦), zeigt WANN sie wirkte, ist direkt vergessbar (✕) + die Liste
    // ist gekappt/„leerbar" (Schöpfer-Befund: „kann nicht stoppen/löschen, die Liste wächst aus dem Bild").
    renderAbilitiesList() {
        const r = this._statusRefs;
        if (!r || !r.abilities) return;
        const list = this.state.dsl.abilities;
        const now = performance.now() / 1000;
        const GESTEN_SHOWN = 6;
        const expanded = !!this.state.hofGestenExpanded;
        // Neueste zuerst; default die Top-N, „alle"-Toggle zeigt mehr (wie die Regel-Gruppe).
        const ordered = list.slice().reverse();
        const shown = expanded ? ordered : ordered.slice(0, GESTEN_SHOWN);
        const hidden = ordered.length - shown.length;
        const signature =
            `${list.length}:${expanded ? "E" : "C"}:` +
            shown.map((a) => `${a.name}:${a.source || "?"}:${a.description ? "d" : "_"}`).join("|");
        if (signature === r.abilitiesSignature) return;
        r.abilitiesSignature = signature;
        const container = r.abilities;
        container.innerHTML = "";
        if (list.length === 0) {
            const empty = document.createElement("div");
            empty.className = "ability-empty";
            empty.textContent = "Noch keine Gesten — der Nexus hat noch nichts komponiert.";
            container.appendChild(empty);
            return;
        }
        // Gruppen-Kopf: Anzahl + „leeren" + (bei vielen) der Auf-/Zuklappen-Toggle.
        const headRow = document.createElement("div");
        headRow.className = "worldrule-group-head nexus";
        const lbl = document.createElement("span");
        lbl.textContent =
            `✦ Gesten · ${list.length}` + (expanded || hidden === 0 ? "" : ` (die jüngsten ${shown.length})`);
        headRow.appendChild(lbl);
        const headBtns = document.createElement("span");
        if (ordered.length > GESTEN_SHOWN) {
            const toggle = document.createElement("button");
            toggle.type = "button";
            toggle.className = "worldrule-toggle";
            toggle.textContent = expanded ? "▾ weniger" : `▸ alle ${ordered.length}`;
            toggle.setAttribute("data-toggle-abilities", "1");
            headBtns.appendChild(toggle);
        }
        const clear = document.createElement("button");
        clear.type = "button";
        clear.className = "worldrule-toggle";
        clear.textContent = "leeren";
        clear.setAttribute("data-clear-abilities", "1");
        clear.setAttribute("aria-label", "Alle Nexus-Gesten verwerfen");
        headBtns.appendChild(clear);
        headRow.appendChild(headBtns);
        container.appendChild(headRow);
        const fmtAgo = (sec) => {
            const d = Math.max(0, Math.round(now - sec));
            return d < 60 ? `vor ${d}s` : `vor ${Math.round(d / 60)}m`;
        };
        for (const ability of shown) {
            const row = document.createElement("div");
            const src = ability.source || "unknown";
            row.className = `ability-row source-${src}`;
            const head = document.createElement("div");
            head.className = "ability-head";
            const kind = document.createElement("span");
            kind.className = "ability-kind";
            kind.textContent = "✦ Geste";
            kind.title = "Eine einmalige Tat (kein stehendes Gesetz) — ▶ wirkt sie erneut.";
            const name = document.createElement("span");
            name.className = "name";
            name.textContent = ability.name;
            head.appendChild(kind);
            head.appendChild(name);
            // WANN sie wirkte (Schöpfer-Befund „sehe nicht ob sie feuern") — die Geste ist einmalig, also „vor Xs".
            if (Number.isFinite(ability.createdAt)) {
                const when = document.createElement("span");
                when.className = "rule-status";
                when.textContent = fmtAgo(ability.createdAt);
                head.appendChild(when);
            }
            const run = document.createElement("button");
            run.type = "button";
            run.textContent = "▶";
            run.setAttribute("data-run-ability", ability.name);
            run.setAttribute("aria-label", `Geste ${ability.name} erneut wirken`);
            head.appendChild(run);
            const forget = document.createElement("button");
            forget.type = "button";
            forget.textContent = "✕";
            forget.setAttribute("data-forget-ability", ability.name);
            forget.setAttribute("aria-label", `Geste ${ability.name} vergessen`);
            head.appendChild(forget);
            row.appendChild(head);
            // Beschreibung (Lazy-Compute für Legacy-Saves, dann persistiert).
            if (!ability.description && Array.isArray(ability.program)) {
                try {
                    ability.description = this.describeProgram(ability.program);
                } catch {
                    ability.description = "wirkt auf die Welt";
                }
            }
            if (ability.description) {
                const desc = document.createElement("div");
                desc.className = "ability-desc";
                desc.textContent = ability.description;
                row.appendChild(desc);
            }
            container.appendChild(row);
        }
        if (hidden > 0) {
            const more = document.createElement("div");
            more.className = "worldrule-more";
            more.textContent = `+ ${hidden} ältere Gesten`;
            container.appendChild(more);
        }
    }

    // Gesetze-Sektion: listet state.worldRules im Row-Pattern der Fähigkeiten-UI (kein Parallel-Panel);
    // eine Regel STEHT (kein ▶) → ✕ vergessen (nur Mensch-Regeln; Nexus-Regeln verfallen per ttl).
    // describeProgram macht Regeln lesbar; Signature-Diff hält den Re-Render billig.
    // Persistenz-Status: „pausiert" / „permanent" (ttlSec==null) / „verfällt in ~Ns" (10-s-granular);
    // eigene Methode, damit Signatur + Label sie teilen.
    _worldRuleStatusLabel(rule, now) {
        if (rule.disabled) return "pausiert";
        if (rule.ttlSec == null) return "permanent";
        const rem = Math.max(0, Math.ceil((rule.ttlSec - (now - rule.born)) / 10) * 10);
        return `verfällt in ~${rem}s`;
    }

    // Live-Aktivitäts-Faden eines Gesetzes: „⚡ feuert" (innerhalb threadRecentSec), sonst
    // „⚡ aktiv · N×", „ruht" (nie gefeuert), „pausiert". EINE Quelle für Namen-Span UND Render-Signatur;
    // bounded: „feuert" bleibt stabil während des Feuerns (Frist > everySec), ein Re-Render beim
    // Verstummen.
    _worldRuleActivityLabel(rule, now) {
        if (rule.disabled) return "pausiert";
        const fires = rule.fires || 0;
        if (fires === 0) return "ruht";
        if (now - rule.lastFired <= AnazhRealm.WORLD_RULES.threadRecentSec) return "⚡ feuert";
        return `⚡ aktiv · ${fires}×`;
    }

    // V18.52 Hof-Partitur — EINE Regel-Karte (wiederverwendet in beiden Gruppen). Der gelernte WERT
    // (`rule.value`, V17.43) wird endlich GELESEN: ein Chip an ephemeren Nexus-Regeln (Konsum V17.31).
    _buildWorldRuleRow(rule, now) {
        const src =
            rule.source === "human"
                ? "human"
                : rule.source === "nexus"
                  ? "nexus"
                  : rule.source && rule.source.startsWith("llm")
                    ? "llm"
                    : "unknown";
        const permanent = rule.ttlSec == null; // Mensch-Regel ODER adoptierte (gepinnte) Nexus-Regel
        const mkBtn = (label, attr, aria) => {
            const b = document.createElement("button");
            b.type = "button";
            b.textContent = label;
            b.setAttribute(attr, String(rule.id));
            b.setAttribute("aria-label", aria);
            return b;
        };
        const row = document.createElement("div");
        row.className = `ability-row source-${src}` + (rule.disabled ? " rule-disabled" : "");
        const head = document.createElement("div");
        head.className = "ability-head";
        const name = document.createElement("span");
        const activity = this._worldRuleActivityLabel(rule, now);
        name.className = "name" + (activity === "⚡ feuert" ? " rule-firing" : "");
        name.textContent = activity;
        const source = document.createElement("span");
        source.className = "source";
        source.textContent =
            (src === "human" ? "du" : src === "nexus" ? "Nexus" : src === "llm" ? "Grok" : rule.source) +
            (rule.pinned ? " ★" : "");
        const status = document.createElement("span");
        status.className = "rule-status" + (permanent ? " perma" : "");
        status.textContent = this._worldRuleStatusLabel(rule, now);
        head.appendChild(name);
        head.appendChild(source);
        head.appendChild(status);
        // Der gelernte WERT — nur an ephemeren Experimenten (die permanenten sind bereits adoptiert).
        if (!permanent) {
            const v = rule.value || 0;
            const chip = document.createElement("span");
            chip.className = "rule-value-chip " + (v > 0.05 ? "val-pos" : v < -0.05 ? "val-neg" : "val-neu");
            chip.textContent = (v >= 0 ? "+" : "") + v.toFixed(2);
            chip.title =
                "Gelernter Wert (struktureller δ am Ort der Regel) — die wertvollsten überleben + werden adoptierbar.";
            head.appendChild(chip);
        }
        if (permanent) {
            head.appendChild(mkBtn(rule.pinned ? "★" : "☆", "data-pin-rule", "Favorit"));
            head.appendChild(
                mkBtn(
                    rule.disabled ? "▶" : "⏸",
                    "data-toggle-rule",
                    rule.disabled ? "Gesetz aktivieren" : "Gesetz pausieren"
                )
            );
            head.appendChild(mkBtn("✕", "data-forget-rule", "Gesetz vergessen"));
        } else {
            // V18.53 — ein ephemeres Nexus-Experiment ist DIREKT steuerbar, ohne erst zu pinnen (Schöpfer-Befund
            // „muss zuerst pinnen, um Stopp/Löschen zu nutzen"): 📌 behalten · ⏸ verstummen (das Experiment bleibt,
            // stört aber nicht — respektiert die Welt-Autonomie) · ✕ verwerfen (dein Recht, in JEDEM Modus).
            head.appendChild(mkBtn("📌", "data-pin-rule", "Experiment behalten (wird permanent)"));
            head.appendChild(
                mkBtn(
                    rule.disabled ? "▶" : "⏸",
                    "data-toggle-rule",
                    rule.disabled ? "Experiment aktivieren" : "Experiment verstummen"
                )
            );
            head.appendChild(mkBtn("✕", "data-forget-rule", "Experiment verwerfen"));
        }
        row.appendChild(head);
        const desc = document.createElement("div");
        desc.className = "ability-desc";
        try {
            desc.textContent = this.describeProgram(["rule", rule.cond, rule.effect]);
        } catch {
            desc.textContent = "eine Welt-Regel";
        }
        row.appendChild(desc);
        return row;
    }

    renderWorldRulesList() {
        const r = this._statusRefs;
        if (!r || !r.worldrules) return;
        const now = performance.now() / 1000;
        const mode = typeof this.getGameMode === "function" ? this.getGameMode() : "frieden";
        const all = this.state.worldRules || [];
        // Zwei Gruppen: DEINE Gesetze (Mensch + adoptiert, stabil, oben) ↔ DER NEXUS ERPROBT (ephemer,
        // nach gelerntem WERT sortiert, nur Top-N) — die Experimente begraben nicht die eigenen Regeln.
        const yours = all
            .filter((x) => x.source === "human" || x.pinned)
            .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || a.id - b.id);
        const nexus = all
            .filter((x) => !(x.source === "human" || x.pinned))
            .sort((a, b) => (b.value || 0) - (a.value || 0) || (b.fires || 0) - (a.fires || 0) || a.id - b.id);
        const NEXUS_SHOWN = 5;
        const expanded = !!this.state.hofNexusExpanded;
        const nexusShown = expanded ? nexus : nexus.slice(0, NEXUS_SHOWN);
        const nexusHidden = nexus.length - nexusShown.length;
        // Signatur = die GEZEIGTE Komposition + ihr Live-Puls (re-rendert, wenn sich Reihenfolge/Status/Wert ändert).
        const sigOf = (x) =>
            `${x.id}:${x.pinned ? "p" : "_"}:${x.disabled ? "x" : "_"}:${(x.value || 0).toFixed(1)}:` +
            `${this._worldRuleActivityLabel(x, now)}:${this._worldRuleStatusLabel(x, now)}`;
        const signature = `${mode}|${expanded ? "E" : "C"}|Y:${yours.map(sigOf).join(",")}|N:${nexusShown.map(sigOf).join(",")}|h:${nexusHidden}`;
        if (signature === r.worldrulesSignature) return;
        r.worldrulesSignature = signature;
        const container = r.worldrules;
        container.innerHTML = "";
        if (all.length === 0) {
            const empty = document.createElement("div");
            empty.className = "ability-empty";
            empty.textContent = 'Noch keine Gesetze. Sag z. B. „wann immer es regnet, dann setze wetter sunny".';
            container.appendChild(empty);
            return;
        }
        // Gruppe 1 — DEINE GESETZE (stabil, manipulierbar, oben).
        const yourHead = document.createElement("div");
        yourHead.className = "worldrule-group-head";
        yourHead.textContent = `Deine Gesetze · ${yours.length}`;
        container.appendChild(yourHead);
        if (yours.length === 0) {
            const hint = document.createElement("div");
            hint.className = "ability-empty";
            hint.textContent = "Noch keine eigenen — sprich eine Regel, oder 📌 adoptiere ein Nexus-Experiment.";
            container.appendChild(hint);
        } else {
            for (const rule of yours) container.appendChild(this._buildWorldRuleRow(rule, now));
        }
        // Gruppe 2 — DER NEXUS ERPROBT (ephemer, wert-sortiert, Top-N + Auf-/Zuklappen).
        if (nexus.length > 0) {
            const nexHead = document.createElement("div");
            nexHead.className = "worldrule-group-head nexus";
            const lbl = document.createElement("span");
            lbl.textContent =
                `Der Nexus erprobt · ${nexus.length}` +
                (expanded || nexusHidden === 0 ? "" : ` (die wertvollsten ${nexusShown.length})`);
            nexHead.appendChild(lbl);
            if (nexus.length > NEXUS_SHOWN) {
                const toggle = document.createElement("button");
                toggle.type = "button";
                toggle.className = "worldrule-toggle";
                toggle.textContent = expanded ? "▾ weniger" : `▸ alle ${nexus.length}`;
                toggle.addEventListener("click", () => {
                    this.state.hofNexusExpanded = !expanded;
                    this.renderWorldRulesList();
                });
                nexHead.appendChild(toggle);
            }
            container.appendChild(nexHead);
            for (const rule of nexusShown) container.appendChild(this._buildWorldRuleRow(rule, now));
            if (nexusHidden > 0) {
                const more = document.createElement("div");
                more.className = "worldrule-more";
                more.textContent = `+ ${nexusHidden} weitere mit geringerem Wert`;
                container.appendChild(more);
            }
        }
    }

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

    // ### Welt-Journal ###
    // Geordnete Erinnerungen; ein Auszug fließt in den LLM-System-Prompt, damit er aus der Geschichte
    // erzählt. `seen` hält One-Shot-Schlüssel (z. B. „firstDragon") — jede Erinnerung nur einmal.

    journalAppend(type, text, ctx) {
        const j = this.state.worldJournal;
        if (!j || !Array.isArray(j.entries)) return;
        if (typeof text !== "string" || text.length === 0) return;
        const entry = {
            id: j.entries.length + 1,
            at: Date.now(),
            tick: performance.now() / 1000,
            type: String(type || "note"),
            text: text.slice(0, 240),
        };
        if (ctx && typeof ctx === "object") entry.ctx = ctx;
        j.entries.push(entry);
        if (j.entries.length > (j.entryCap || 200)) {
            j.entries = j.entries.slice(-j.entryCap);
        }
    }

    // Idempotente Variante: nur schreiben, wenn der Schlüssel noch nie
    // gesehen wurde. Für „erstes Mal X"-Erinnerungen.
    journalAppendOnce(key, type, text, ctx) {
        const j = this.state.worldJournal;
        if (!j) return;
        if (!j.seen) j.seen = {};
        if (j.seen[key]) return;
        j.seen[key] = true;
        this.journalAppend(type, text, ctx);
    }

    // Frame-Hook alle 5 s (Throttle-Anker lastSelfAnalysis, Takt wie selfAwarenessAnalyze): schreibt
    // selten, aber bedeutsame Erinnerungen aus dem aktuellen State.
    journalTick(currentTime) {
        const m = this.state.worldMeta;
        if (!m || !m.worldId) return;
        // Erste Kreatur
        if (this.state.creatures.length > 0) {
            this.journalAppendOnce("firstCreature", "creatures", "Die erste Kreatur regte sich.");
        }
        // Erstes Bauwerk
        if (Array.isArray(this.state.architectures) && this.state.architectures.length > 0) {
            const a = this.state.architectures[0];
            this.journalAppendOnce(
                "firstArchitecture",
                "architecture",
                `Das erste Bauwerk entstand: ${a.type || "Struktur"}.`
            );
        }
        // Wetter-Wechsel: aus prevWeather merken, der nicht im Journal-State liegt
        if (this._weatherIsWet()) {
            this.journalAppendOnce("firstRain", "weather", "Der erste Regen begann.");
        }
        // Hochfitness-Programm aus der History — wir wandern beim ersten
        // finalisierten Eintrag mit fitness >= 0.7 in eine Erinnerung.
        const hist = this.state.dsl && this.state.dsl.history;
        if (Array.isArray(hist) && hist.length > 0) {
            const best = hist
                .filter((h) => h && h.finalized && typeof h.fitness === "number" && h.fitness >= 0.7)
                .slice(-1)[0];
            if (best) {
                this.journalAppendOnce(
                    `highFitness:${best.id}`,
                    "growth",
                    `Etwas Wirkungsvolles ist mir gelungen: ${JSON.stringify(best.program).slice(0, 100)} (Fitness ${best.fitness.toFixed(2)}).`,
                    { programId: best.id, fitness: best.fitness }
                );
            }
        }
        // Emotion-Peak: irgendeine Achse > 0.85. One-Shot pro Achse, neu
        // freigegeben wenn die Achse mal unter 0.3 fällt (über seenLow-Map).
        if (!this.state.worldJournal.seenLow) this.state.worldJournal.seenLow = {};
        const e = this.state.player && this.state.player.emotions;
        if (e) {
            for (const axis of Object.keys(e)) {
                const v = e[axis];
                if (v < 0.3 && this.state.worldJournal.seenLow[axis]) {
                    delete this.state.worldJournal.seen[`emotionPeak:${axis}`];
                    this.state.worldJournal.seenLow[axis] = false;
                } else if (v >= 0.85) {
                    this.journalAppendOnce(
                        `emotionPeak:${axis}`,
                        "emotion",
                        `Eine Welle ${axis} (${v.toFixed(2)}) durchzog uns.`,
                        { axis, value: v }
                    );
                    this.state.worldJournal.seenLow[axis] = false;
                } else if (v < 0.3) {
                    this.state.worldJournal.seenLow[axis] = true;
                }
            }
        }
        // currentTime nur für künftige Throttle-Logik; aktuell ist
        // journalAppendOnce der eigentliche Spam-Schutz.
        void currentTime;
    }

    // Liefert einen knappen Auszug für den LLM-System-Prompt (Welle 1 A):
    // die ersten 3 Erinnerungen (Genesis-Anker) + die letzten 7 (jüngstes
    // Erleben). Reicht für Identitäts-Verankerung ohne Token-Bloat.
    journalForPrompt() {
        const j = this.state.worldJournal;
        if (!j || !Array.isArray(j.entries) || j.entries.length === 0) return "";
        const head = j.entries.slice(0, 3);
        const tail = j.entries.slice(-7);
        const seen = new Set();
        const ordered = [];
        for (const e of [...head, ...tail]) {
            if (seen.has(e.id)) continue;
            seen.add(e.id);
            ordered.push(e);
        }
        return ordered.map((e) => `- [${e.type}] ${e.text}`).join("\n");
    }
}
