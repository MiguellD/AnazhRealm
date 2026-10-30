class AnazhRealm_werkstatt_vorschau {
    // ===== ATLAS · Werkstatt/vorschau — Werkstatt-Vorschau · Gizmo · Prozesse · Ofen-Vorschau =====
    // V9.44-e — der Werkstatt-DOM-Builder ist ein Orchestrator. Vor V9.44-e
    // war _renderWorkshopDOM eine ~644-Zeilen-Funktion mit 159 DOM-Operationen.
    // Jetzt: neun in-sich-geschlossene Sektionen als `_workshopRender<X>`-
    // Sub-Methoden (das erprobte `_workshopRenderStatsPanel`-Muster, weiter
    // geschnitten). Jede Sektion baut ihren DOM-Teilbaum + hängt ihn an;
    // sie teilen nur `list`/`editor`/`ws`/`selected` — die Methoden-Parameter.
    // V17.91 — die Werkstatt ist 3D-zentrisch: der alte einklappbare Detail-Editor (#workshop-editor mit
    // Dropdown-Tabellen) ist ENTFERNT. Editieren geschieht im 3D (Form/Material/Farbe ziehen · Gizmo ·
    // „Part entfernen" · Prozess-Karte aus der rechten Palette ziehen), der READOUT lebt im intuitiven
    // #workshop-stats-panel (Rolle/Fähigkeit/Werte/Resonanz/FERTIGEN, via _workshopRenderTail →
    // _workshopRenderStatsPanel), die Editor-Akte (Undo/Redo/Löschen/Klonen/Neu) in der Top-Leiste. Dieser
    // Render macht nur noch: die Bauplan-Liste, den Top-Leisten-Zustand, + den Tail (Stats/Palette/Preview/Hotbar).
    _renderWorkshopDOM() {
        if (typeof document === "undefined") return;
        const list = document.getElementById("workshop-list");
        if (!list) return;
        const ws = this._ensureWorkshopState();
        this._workshopRenderBlueprintList(list, ws);
        const selected = this.state.blueprints[ws.selectedBlueprint];
        this._workshopUpdateTopBarState(selected);
        if (!selected) {
            // W-A1 — REZEPT-AUSWAHL (Studio-Rezepte-Sektion): eigener Tail — Vorschau
            // durch die EINE Studio-Quelle + generische B4-Regler + Rezept-Steckbrief.
            // KEIN Hotbar-/Platzier-/Fertigen-Fluss (Katalog-Eintrag != Welt-Platzierung).
            if (ws.selectedRecipe) this._workshopRenderRecipeTail(ws);
            return;
        }
        this._workshopRenderTail(selected);
    }

    // DIE BIBLIOTHEK DER WERKSTATT (Studio-Vertrag B8): die Liste ist der EINE Stammbaum (`_stammbaum`) — oben GRIFFBEREIT (die
    // eigenen Werke und die der Hotbar in ihrer Reihe, `_katalogReihe`, bauen.K1: der erste Klick wählt), darunter je Studio
    // seine Bereiche und je Bereich seine Teile, wie die Gesetzbücher sie nennen, dann die Werkstatt, das Ultiversum und die
    // Werke des Wirts ohne Gesetzbuch. Jeder sichtbare Bauplan steht EINMAL als Bauplan-Zeile (`workshop-list-row`; im Baum ein
    // Verweis, wenn er oben griffbereit steht), ein Teil ohne sichtbaren Bauplan (Werk-Verb, verborgener Träger, ohne Ziel) als
    // Rezept-Zeile (`workshop-studio-recipe-row`: anschaubar, regelbar). Ein Klick wählt (Vorschau · Regler · Kosten), der Griff
    // ⤓ legt das Teil in die Welt (`_stammbaumGriff`), ein Kopf klappt seinen Ast (`ws.stammbaumZu`); die Suche liest Zeile, Pfad
    // und Gesetz (`data-such`, `_applyWorkshopFilter`). Bis 30.10. war die Liste flach, und ein Werk der Ausstattung stand
    // zweimal (sein Bauplan und sein Rezept).
    _workshopRenderBlueprintList(list, ws) {
        const baum = this._stammbaum();
        const bps = this.state.blueprints;
        const zu = ws.stammbaumZu || (ws.stammbaumZu = new Set());
        list.innerHTML = "";
        const hb = (this.state.hotbar || []).length;
        // griffbereit ist ein sichtbares Ziel des Baums (die Reihe des Spielers bleibt die seines Katalogs)
        const griff = this._katalogReihe(
            Object.keys(bps).filter(
                (n) => baum.zielVon.has(n) && baum.zielVon.get(n).sichtbar && this._katalogRang(n) < hb
            )
        );
        const oben = new Set(griff);
        const kopf = (ebene, id, text, zahl, pfad) => {
            const h = document.createElement("div");
            h.className = "workshop-list-section stammbaum-" + ebene + (zu.has(id) ? " zu" : "");
            h.setAttribute("data-knoten", id);
            h.setAttribute("data-pfad", pfad);
            h.textContent = text || "⚠ ohne Namen";
            const n = document.createElement("span");
            n.className = "stammbaum-zahl";
            n.textContent = String(zahl);
            h.appendChild(n);
            h.addEventListener("click", () => {
                if (zu.has(id)) zu.delete(id);
                else zu.add(id);
                this._workshopRenderBlueprintList(list, ws);
            });
            return h;
        };
        if (griff.length) {
            list.appendChild(kopf("studio", "griffbereit", "Griffbereit", griff.length, ""));
            for (const n of griff)
                list.appendChild(this._stammbaumZeile(baum.zielVon.get(n), ws, "griffbereit", false, ["Griffbereit"]));
        }
        for (const w of baum.wurzeln) {
            const zahl = w.kinder.reduce((s, b) => s + b.kinder.length, 0);
            list.appendChild(kopf("studio", w.id, w.lab, zahl, ""));
            for (const b of w.kinder) {
                list.appendChild(kopf("bereich", b.id, b.lab, b.kinder.length, w.id));
                for (const t of b.kinder)
                    list.appendChild(
                        this._stammbaumZeile(t, ws, w.id + "|" + b.id, t.sichtbar && oben.has(t.ziel), [w.lab, b.lab])
                    );
            }
        }
        this._applyWorkshopFilter();
    }

    // Die Zeile EINES Teils der Bibliothek: sein Name (der Kopf; der ganze steht im Titel und in der Suche), die Marke (Studio ·
    // fest · eigen · Rezept · Wesen · Prägung, ⚠ ohne Buch), der Griff ⤓ (nur mit Ziel) und als Titel sein Gesetz (Datei · Anker)
    // und sein Leser. `verweis`: der Bauplan steht schon griffbereit; `pfadLab`: die Namen seines Pfads (Studio, Bereich) für
    // die Suche.
    _stammbaumZeile(t, ws, pfad, verweis, pfadLab) {
        const bp = t.sichtbar ? this.state.blueprints[t.ziel] : null;
        const row = document.createElement("div");
        if (verweis) {
            row.className = "stammbaum-verweis";
            row.setAttribute("data-verweis", t.ziel);
        } else if (bp) {
            row.className = "workshop-list-row" + (t.ziel === ws.selectedBlueprint ? " selected" : "");
            row.setAttribute("data-blueprint", t.ziel);
        } else {
            row.className = "workshop-studio-recipe-row" + (t.rezept === ws.selectedRecipe ? " selected" : "");
            row.setAttribute("data-recipe", t.rezept);
        }
        row.setAttribute("data-knoten", t.id);
        row.setAttribute("data-pfad", pfad);
        // V8.39 — Farb-Sprache: die Bauplan-Zeile leuchtet links in der Rollen-Farbe → ein Blick sagt, was jeder Bauplan IST.
        if (bp) {
            const rColor = AnazhRealm.BLUEPRINT_ROLE_COLORS[bp.role || AnazhRealm.DEFAULT_BLUEPRINT_ROLE];
            if (rColor) row.style.borderLeft = `3px solid ${rColor}`;
        }
        const nameSpan = document.createElement("span");
        nameSpan.className = "name";
        nameSpan.textContent = String(t.lab).split(t.rezept ? /\s[·—(]/ : /\s[—(]/)[0];
        const badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = t.waise
            ? "⚠ ohne Buch"
            : t.werk === "wesen"
              ? "Wesen"
              : t.werk === "praegung"
                ? "Prägung"
                : !bp
                  ? "Rezept"
                  : bp.builtIn
                    ? "fest"
                    : t.rezept
                      ? "Studio"
                      : "eigen";
        row.appendChild(nameSpan);
        row.appendChild(badge);
        const q = t.quelle || {};
        const gesetz = q.datei ? `${q.datei} · ${q.anker}` : t.eigen ? "dein Werk" : "der Wirt";
        row.title = `${t.lab} — Gesetz: ${gesetz} · Leser: ${t.konsum || "keiner (tot)"}${t.ziel ? "" : " · kein Griff: nur anschaubar"}`;
        const rec = t.rezept && this._foundry && this._foundry.recipes ? this._foundry.recipes[t.rezept] : null;
        const ort = rec && rec.fx && rec.fx.place ? [rec.fx.place.mode, rec.fx.place.siteTag] : [];
        row.setAttribute(
            "data-such",
            [t.lab, t.rezept, t.ziel, t.art, t.konsum, t.werk, ...ort, ...pfadLab].filter(Boolean).join(" ")
        );
        if (t.ziel) {
            const g = document.createElement("button");
            g.type = "button";
            g.className = "stammbaum-griff";
            g.textContent = "⤓";
            g.title = `${t.lab} in die Welt legen — ein Griff (${t.werk === "praegung" ? "prägt die Welt" : t.werk === "wesen" ? "ein Wesen erscheint" : "das Werk steht, wohin du blickst"})`;
            g.addEventListener("click", (e) => {
                e.stopPropagation();
                this._stammbaumGriff(t);
            });
            row.appendChild(g);
        }
        row.addEventListener("click", () => {
            if (bp) this.selectBlueprintForEdit(t.ziel);
            else this.selectStudioRecipeForView(t.rezept);
            this._workshopClosePicker();
        });
        return row;
    }

    // DER GRIFF DER BIBLIOTHEK: ein Klick legt das Teil in die Welt, über den EINEN Weg seines Ziels — ein Bauplan über das
    // Fertigen des Spielers (`fertigeBlueprint`: rollen-gerecht, das Werk steht, wohin er blickt, das Material nach dem Gesetz des
    // Modus), ein Werk-Verb über den Satz der KI (`spawn_studio`: derselbe Stempel `_studioStampFor`; ein Wesen erscheint vor dem
    // Spieler, eine Prägung trifft ihren Leser). Ein Teil ohne Ziel hat keinen Griff.
    _stammbaumGriff(t) {
        if (!t || !t.ziel) return { ok: false, reason: "kein_ziel" };
        if (t.werk) {
            // das Urteil des Programms, nie ein behauptetes: steht weniger, als gewollt war, oder wirkte es nicht, spricht der
            // Ergebnis-Satz (`_ergebnisSatz`) bzw. die Absage (`_dslAbsageSatz`) — wie nach jedem Satz im Chat
            const res = this.dslRun(["spawn_studio", t.ziel, ["at_player_forward", 4], 1], { source: "human" });
            const weicht = this._ergebnisSatz(res.log);
            if (weicht || !res.ok) this._spielerSagt(weicht ? weicht.satz : this._dslAbsageSatz(res.log));
            return { ok: res.ok && !weicht, werk: t.werk, log: res.log };
        }
        const res = this.fertigeBlueprint(t.ziel);
        if (!res.ok) this._spielerSagt(`${String(t.lab).split(/\s[·—(]/)[0]}: ${this._machTorHint(res)}`);
        return res;
    }

    // Die Suche der Bibliothek (search-not-scroll, wie Hof-Befehle + Rezeptbuch): blendet Nicht-Treffer aus, ein Kopf steht,
    // solange sein Ast einen Treffer trägt; ohne Suche verbirgt ein zugeklappter Kopf seinen Ast (`ws.stammbaumZu`).
    _applyWorkshopFilter() {
        if (typeof document === "undefined") return;
        const list = document.getElementById("workshop-list");
        const search = document.getElementById("workshop-search");
        if (!list || !search) return;
        const q = search.value.trim().toLowerCase();
        const zu = this._ensureWorkshopState().stammbaumZu || new Set();
        const koepfe = [];
        const trifft = new Set();
        for (const row of list.children) {
            const pfad = (row.getAttribute("data-pfad") || "").split("|").filter(Boolean);
            if (row.classList.contains("workshop-list-section")) {
                koepfe.push([row, row.getAttribute("data-knoten")]);
                row.style.display = q || !pfad.some((id) => zu.has(id)) ? "" : "none";
                continue;
            }
            if (!q) {
                row.style.display = pfad.some((id) => zu.has(id)) ? "none" : "";
                continue;
            }
            // M4 (V18.158) — die EINE Such-Sprache: der geteilte Blueprint-Heuhaufen + _matchQuery — „Bauwerk" trifft die Rolle,
            // „eisen" das Material, „Härte" die Tag-Achse; dazu der Pfad und das Gesetz des Teils (Studio, Bereich, Ort).
            const bp = this.state.blueprints[row.getAttribute("data-blueprint") || row.getAttribute("data-verweis")];
            const hay =
                (row.textContent || "") +
                " " +
                (row.getAttribute("data-such") || "") +
                " " +
                (bp ? this._blueprintSearchText(bp) : "");
            const ja = this._matchQuery(hay, q);
            row.style.display = ja ? "" : "none";
            if (ja) for (const id of pfad) trifft.add(id);
        }
        if (q) for (const [k, id] of koepfe) k.style.display = trifft.has(id) ? "" : "none";
    }

    _workshopRenderTail(selected) {
        // Hotbar-Config und alle Phantom-Mesh updaten, falls der aktive
        // Bauplan editiert wurde.
        this._renderHotbarConfigDOM();
        this._renderHotbarDOM();
        // Phantom in Bau-Modus neu rendern, falls er den editierten Bauplan zeigt
        const bm = this.state.buildMode;
        if (bm.active && bm.blueprintName === selected.name) {
            const idx = bm.slotIndex;
            this._clearBuildMode();
            if (idx >= 0 && this.state.hotbar[idx] === selected.name) this.selectHotbarSlot(idx);
        }
        // Welle 6.B Phase 1 — Preview-Mesh synchron halten mit DOM.
        // Defensive: Methode kann fehlen wenn (sehr selten) Welle 6.B noch
        // nicht geladen ist.
        if (typeof this._workshopRebuildPreviewMesh === "function") {
            this._workshopRebuildPreviewMesh();
        }
        // DAS NEUE KLEID — DER REZEPT-REGLER: bei einem gewachsenen Baum die Studio-Regler +
        // den Saat-Würfel zeigen (sonst ausblenden). Beweist die Pipeline live.
        if (typeof this._workshopRenderRecipePanel === "function") {
            this._workshopRenderRecipePanel(selected);
        }
        // V8.05 — Stats-Panel + Tool-Palette aktualisieren (Tool-Palette
        // hängt am Spieler-Inventar, das beim DSL-Pfad mutieren kann).
        if (typeof this._workshopRenderStatsPanel === "function") {
            this._workshopRenderStatsPanel();
        }
        if (typeof this._workshopRenderToolPalette === "function") {
            this._workshopRenderToolPalette();
        }
    }

    // === CAD-Werkstatt 3D-Preview ===
    // Lazy-init beim Drawer-Open: eigene Scene + Camera + Renderer + RAF-Loop; rendert den gewählten
    // Bauplan über _buildFromBlueprint (EINE Render-Pipeline für alle Compounds).
    // Klick → Raycast → selectedPartIdx → Highlight in Liste + Mesh-Tint; Gizmos für Move/Rotate/Scale.

    // Lazy-init: ruft beim ersten Drawer-Open Renderer + Scene + Camera +
    // Listener auf. Idempotent — zweiter Aufruf liefert dieselbe Instanz.
    _workshopEnsurePreview() {
        if (typeof document === "undefined" || typeof THREE === "undefined") return null;
        const ws = this._ensureWorkshopState();
        if (ws.preview) return ws.preview;
        const canvas = document.getElementById("workshop-preview-canvas");
        if (!canvas) return null;

        // Derselbe WebGPURenderer wie die Haupt-Welt (eigenes Canvas, async init() + rendererReady-Gate):
        // _buildFromBlueprint baut NodeMaterials, die NUR auf WebGPURenderer rendern — WebGL bliebe leer. Das init()
        // gibt das Gate frei und zeichnet das erste Frame, sobald die GPU steht.
        const renderer = this._buehneRenderer(canvas, 320, 320, 0x1a140a, "Workshop-Preview", () => {
            preview.rendererReady = true;
            preview.dirty = true;
            if (preview.active) this._workshopRender();
        });
        if (!renderer) return null;

        const scene = new THREE.Scene();
        const amb = new THREE.AmbientLight(0xffffff, 0.55);
        scene.add(amb);
        const key = new THREE.DirectionalLight(0xffe8c2, 0.85);
        key.position.set(4, 6, 5);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0x88aaff, 0.35);
        fill.position.set(-4, -2, -3);
        scene.add(fill);

        // 1-Einheit-Raster + Achsenkreuz machen Maße lesbar. Feste Szenen-Kinder —
        // _workshopRebuildPreviewMesh disposed nur currentMesh. raycast = no-op: nie Auswahl/Gizmo stören.
        const grid = new THREE.GridHelper(12, 12, 0x7a5a34, 0x3a2e1c);
        grid.material.opacity = 0.55;
        grid.material.transparent = true;
        grid.raycast = () => {};
        scene.add(grid);
        const axes = new THREE.AxesHelper(2.5);
        axes.raycast = () => {};
        scene.add(axes);

        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);

        const preview = {
            canvas,
            renderer,
            scene,
            camera,
            gridHelper: grid,
            axesHelper: axes,
            currentMesh: null,
            // K05 — der Rahmen der Gestalt: Box3, Hüllkugel-Radius R, auto (folgt dem Canvas, bis der Spieler zoomt).
            rahmen: null,
            partMeshes: new Map(), // sub-Mesh → partIdx
            origColors: new Map(), // sub-Mesh → original color (uint)
            orbit: {
                yaw: 0.6,
                pitch: 0.32,
                dist: 6.0,
                target: new THREE.Vector3(0, 0, 0),
            },
            raycaster: new THREE.Raycaster(),
            drag: null,
            rafId: null,
            dirty: true,
            active: false,
            // V17.19 (Heilung) — WebGPURenderer.init() ist async; bis ready
            // überspringt _workshopRender den render()-Call (sonst leeres
            // Frame). Die init().then()-Kette unten setzt das Flag + dirty.
            rendererReady: false,
            listenersInstalled: false,
            // Manipulator-Gizmo: Group mit Sub-Groups translate/rotate/scale, je Achse Handle-Meshes;
            // gizmoMeshes = Reverse-Map Mesh → {mode, axis}; dragManipulator = laufender Drag (≠ orbit-drag).
            gizmo: null,
            gizmoMeshes: new Map(),
            dragManipulator: null,
            hoveredAxis: null,
            // V8.01 — ResizeObserver für Canvas. Bei Drawer-Resize ändert sich
            // die CSS-Größe; internal renderer-Pixel-Dimensionen müssen
            // mitgezogen werden, sonst wird das Bild stretched/blurry.
            resizeObserver: null,
        };
        ws.preview = preview;
        this._workshopInstallPreviewListeners();
        this._workshopBuildGizmo();
        this._workshopInstallUIListeners();
        this._workshopInstallCanvasResizeObserver();
        this._workshopUpdateManipulatorButtons();
        this._workshopRebuildPreviewMesh();
        return preview;
    }

    // Mode-Bar-Klicks + W/E/R/G-Tasten; idempotent. Tasten nur bei offenem Werkstatt-Drawer, ohne
    // Pointer-Lock (nicht im WASD-Modus) und ohne fokussiertes Input-Feld.
    _workshopInstallUIListeners() {
        if (typeof document === "undefined") return;
        const ws = this._ensureWorkshopState();
        if (ws._uiListenersInstalled) return;
        ws._uiListenersInstalled = true;
        const modeBar = document.getElementById("workshop-mode-bar");
        if (modeBar) {
            modeBar.querySelectorAll("[data-workshop-mode]").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const mode = btn.getAttribute("data-workshop-mode");
                    if (mode) this.setWorkshopManipulatorMode(mode);
                });
            });
        }
        const snapBtn = document.getElementById("workshop-snap-toggle");
        if (snapBtn) {
            snapBtn.addEventListener("click", () => this.toggleWorkshopSnap());
        }
        document.addEventListener("keydown", (event) => {
            // Nur aktiv wenn Werkstatt-Drawer offen
            if (this.state.uiActiveDrawer !== "werkstatt") return;
            // Nicht stören wenn Spieler in Pointer-Lock (Game-Movement) ist
            if (typeof document !== "undefined" && document.pointerLockElement) return;
            // Nicht stören wenn Input-Feld fokussiert
            const active = document.activeElement;
            if (
                active &&
                (active.tagName === "INPUT" ||
                    active.tagName === "TEXTAREA" ||
                    active.tagName === "SELECT" ||
                    active.isContentEditable)
            )
                return;
            // Nicht stören während Keybinding-Rebind (6.C3)
            if (this.state.keybindRebind) return;
            const key = (event.key || "").toLowerCase();
            if (key === "w") {
                this.setWorkshopManipulatorMode("translate");
                event.preventDefault();
            } else if (key === "e") {
                this.setWorkshopManipulatorMode("rotate");
                event.preventDefault();
            } else if (key === "r") {
                this.setWorkshopManipulatorMode("scale");
                event.preventDefault();
            } else if (key === "c") {
                this.setWorkshopManipulatorMode("connect");
                event.preventDefault();
            } else if (key === "g") {
                this.toggleWorkshopSnap();
                event.preventDefault();
            } else if (key === "h" || key === "home") {
                // H = „Home“: CAD-Kamera zurück auf das Bauplan-Center (falls der Orbit-Target wegwanderte).
                this.resetWorkshopCamera();
                event.preventDefault();
            }
        });
        // Welle 6.X.2 V8.14 — Reset-Button neben Snap (Shortcut H).
        const resetBtn = document.getElementById("workshop-camera-reset");
        if (resetBtn) {
            resetBtn.addEventListener("click", () => this.resetWorkshopCamera());
        }
        // W-G (V18.177, §8.4(c)) — die Gelenk-Probe (idempotent verdrahtet).
        const probeBtn = document.getElementById("workshop-probe-btn");
        if (probeBtn && !probeBtn.dataset.wired) {
            probeBtn.dataset.wired = "1";
            probeBtn.addEventListener("click", () => this._workshopProbeJoints());
        }
        // V8.02 Phase 3a — Shape-Palette HTML5-Drag-Sources + Canvas-Drop-Target
        this._workshopInstallShapeDragDrop();
        // V8.05 — Del-Button-Handler (idempotent)
        this._workshopInstallDeleteButton();
        // V8.06 — Klonen + Neuer Bauplan direkt in der Mode-Bar
        this._workshopInstallActionButtons();
    }

    // ResizeObserver: das Renderer-Pixelmaß folgt der CSS-Größe des Canvas (Drawer-Resize).
    // Camera-Aspect bleibt 1:1 (aspect-ratio-CSS am Canvas).
    _workshopInstallCanvasResizeObserver() {
        const ws = this._ensureWorkshopState();
        if (!ws.preview || ws.preview.resizeObserver) return;
        if (typeof ResizeObserver === "undefined") return;
        const p = ws.preview;
        const observer = new ResizeObserver(() => {
            this._workshopSyncCanvasSize();
        });
        observer.observe(p.canvas);
        // Auch den Drawer beobachten — manchmal feuert canvas-Observer nicht
        // sofort beim Container-Resize, der Drawer aber schon.
        const werkstattDrawer = document.querySelector('[data-drawer="werkstatt"]');
        if (werkstattDrawer) observer.observe(werkstattDrawer);
        p.resizeObserver = observer;
        // Initial einmal explizit syncen
        this._workshopSyncCanvasSize();
    }

    // Tab-Wechsel-Hook: aktiv wenn Werkstatt-Drawer offen, sonst pausiert.
    _workshopHandleDrawerChange(activeName) {
        const ws = this._ensureWorkshopState();
        const liste = typeof document !== "undefined" && document.getElementById("workshop-list");
        if (activeName === "werkstatt" && liste) {
            // DIE WAHL ZUERST (bauen.K1): die Werkstatt öffnet mit der aufgeklappten Bauplan-Liste, oben, in der Reihe des
            // Katalogs (`_katalogReihe`) — der erste Klick wählt. Befund 22.10. (echte Eingaben): die Liste brauchte einen
            // Klick auf die Suche, Haus, GT und das eigene Werk lagen 2–7 Mausrad-Rasten tief.
            this._workshopRenderBlueprintList(liste, ws);
            liste.closest(".workshop-picker").classList.add("open");
            liste.scrollTop = 0;
        }
        if (activeName === "werkstatt") {
            // Legacy-Größen einmalig räumen — der Werkstatt-Rahmen kommt rein aus CSS.
            this._workshopApplyDefaultSizeOnce();
            const preview = this._workshopEnsurePreview();
            if (!preview) return;
            preview.active = true;
            preview.dirty = true;
            this._workshopStartRAF();
        } else if (ws.preview) {
            ws.preview.active = false;
            this._workshopStopRAF();
        }
    }

    // Die Werkstatt folgt der EINEN CSS-Rahmen-Sprache der Drawer (left/right 12, width:auto,
    // max-height calc(100vh−134px)). RÄUMT Legacy-Inline-Größe + gespeicherte Resize-Größe (Migration),
    // statt sie zu setzen — Inline-Maße überschrieben sonst den Rahmen.
    _workshopApplyDefaultSizeOnce() {
        if (typeof document === "undefined") return;
        try {
            const werkstatt = document.querySelector('[data-drawer="werkstatt"]');
            if (werkstatt) {
                werkstatt.style.width = "";
                werkstatt.style.height = "";
                werkstatt.style.maxHeight = "";
            }
            if (typeof localStorage !== "undefined") {
                localStorage.removeItem("anazh.resize.werkstatt");
                localStorage.removeItem("anazh.workshop.defaultApplied");
            }
        } catch {
            /* ignore */
        }
    }

    _workshopStartRAF() {
        const ws = this._ensureWorkshopState();
        if (!ws.preview || ws.preview.rafId !== null) return;
        // V8.01 — beim Start des RAF defensive Canvas-Sync, falls der Drawer
        // zwischen Frames per Resize verändert wurde.
        this._workshopSyncCanvasSize();
        ws.preview.dirty = true;
        const tick = () => {
            const p = ws.preview;
            if (!p || !p.active) {
                if (p) p.rafId = null;
                return;
            }
            // Sync canvas-size jeden Frame (günstig: nur diff-Check + setSize
            // bei realer Änderung). Sorgt dafür, dass Resize-Handle-Drag live
            // bis ins Pixel-Rendering durchgreift.
            this._workshopSyncCanvasSize();
            // W-G (V18.177, §8.4(c) — R-015): die GELENK-PROBE wackelt die
            // erkannten Motion-Rollen für ~2 s (bauen → SEHEN was sich bewegt).
            // Phase rampt rein/raus (sin-Hüllkurve) → sanftes Anlaufen + Ruhe.
            if (p.probe) {
                const now = performance.now();
                const dt = now - p.probe.start;
                if (dt >= p.probe.dur || !p.currentMesh || !p.probe.roles) {
                    // Auslaufen: in die Ruhe-Pose zurück (moving=false), dann lösen.
                    if (p.currentMesh && p.probe.roles)
                        this._animateCompoundMotion(p.currentMesh, p.probe.roles, now / 1000, 0, false);
                    p.probe = null;
                    p.dirty = true;
                } else {
                    const env = Math.sin(Math.min(1, dt / p.probe.dur) * Math.PI); // 0→1→0
                    const phase = (dt / 1000) * 3.0;
                    this._animateCompoundMotion(p.currentMesh, p.probe.roles, now / 1000, phase * env, true);
                    p.dirty = true;
                }
            }
            // Die gerechnete Physik WANKT sichtbar: ein instabiles Werk (CoM nah/über der Kipp-Kante) teetert
            // um die Ruhe-Pose, Amplitude ∝ Instabilität, in Kipp-Richtung; ein stehendes ruht.
            // Liest das build-Zeit-gecachte Verdikt (kein Frame-Rechnen).
            const vd = p.physicsVerdict;
            if (p.currentMesh) {
                const restX = p._restRotX || 0,
                    restZ = p._restRotZ || 0;
                if (vd && vd.lean > 0.01 && !p.probe) {
                    const t = performance.now() / 1000;
                    const amp = vd.lean * AnazhRealm.WORKSHOP_LEAN_AMP; // bis ~9° bei voll instabil
                    const osc = Math.sin(t * 2.6) * amp; // langsames Teetern
                    p.currentMesh.rotation.z = restZ - osc * (vd.leanDir.x || 0);
                    p.currentMesh.rotation.x = restX + osc * (vd.leanDir.z || 0);
                    p._leanWasApplied = true;
                    p.dirty = true;
                } else if (p._leanWasApplied) {
                    p.currentMesh.rotation.x = restX;
                    p.currentMesh.rotation.z = restZ;
                    p._leanWasApplied = false;
                    p.dirty = true;
                }
            }
            if (p.dirty || p.drag || p.dragManipulator) {
                this._workshopRender();
                p.dirty = false;
            }
            p.rafId = requestAnimationFrame(tick);
        };
        ws.preview.rafId = requestAnimationFrame(tick);
    }

    // W-G (V18.177, §8.4(c) — R-015 „bauen → SEHEN was sich bewegt"): startet
    // die Gelenk-Probe — die computeMotionRoles-Wahrheit 2 s in der Vorschau
    // animiert. Liest die EXISTIERENDE Motion-Wahrheit (kein neues System).
    _workshopProbeJoints() {
        const ws = this._ensureWorkshopState();
        if (!ws.preview || !ws.preview.currentMesh) return false;
        const bp = this.state.blueprints[ws.selectedBlueprint];
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length < 2) {
            this.log("Gelenk-Probe: dieser Bauplan hat keine beweglichen Gelenke.", "INFO");
            return false;
        }
        const roles = this.computeMotionRoles(bp.parts, bp.connections);
        if (!roles || !roles.some((r) => r && (r.joint || r.role))) {
            this.log("Gelenk-Probe: keine Gelenke erkannt (Teile verbinden → Gelenke emergieren).", "INFO");
            return false;
        }
        ws.preview.probe = { start: performance.now(), dur: 2200, roles };
        ws.preview.active = true;
        ws.preview.dirty = true;
        this._workshopStartRAF();
        return true;
    }

    _workshopStopRAF() {
        const ws = this._ensureWorkshopState();
        if (ws.preview && ws.preview.rafId !== null) {
            cancelAnimationFrame(ws.preview.rafId);
            ws.preview.rafId = null;
        }
    }

    // ═══ Ω-PHYSIS · SÄULE IV · Ω-W3 — DER WAHRHEITS-SPIEGEL (Physik → sichtbar) ═══
    // Liest NUR die Säule-I-Funktionen (_stability/_loadPath/_failsUnderLoad/_swingDynamics/
    // _edgeContinuity), kein erfundener Richter. STEHENDES Werk → Standfestigkeit, GEHALTENES →
    // Schwung + Schneide; jedes → Lastpfad (ein schwebendes Teil ist immer falsch).
    // Bau-/Edit-Zeit gerechnet und gecacht — der RAF-Tick liest nur den Cache.
    // `boden`: der Grund im Plan (Werkstatt und Setzen: y = 0; nach einem Fall sein tiefstes Teil, `_werkGesetzSetzen`).
    _workshopPhysicsVerdict(bp, boden = 0) {
        const out = { lean: 0, leanDir: { x: 0, z: 0 }, floatingParts: [], buckles: false, swingDrag: 0, lines: [] };
        if (!bp || !Array.isArray(bp.parts) || !bp.parts.length) return out;
        const role = (typeof this._displayRole === "function" && this._displayRole(bp)) || bp.role || "";
        const standing =
            role === "architecture" ||
            role === "vehicle" ||
            role === "machine" ||
            role === "workshop-station" ||
            role === "soul" ||
            role === "portal";
        const wielded = role === "held" || role === "weapon" || role === "tool" || role === "brecher";
        // Ω-Φ5 Lastpfad — universell (ein schwebendes Teil trägt nichts, egal die Rolle); was steht, steht auf dem Grund des
        // Plans (y = 0, das Gitter und der Boden der Welt), was man hält, hängt am eigenen Zusammenhalt.
        const lp = this._loadPath(bp, standing ? boden : undefined);
        out.floatingParts = Array.isArray(lp.floatingParts) ? lp.floatingParts.slice() : [];
        if (out.floatingParts.length) {
            out.lines.push({
                sev: "warn",
                text: `${out.floatingParts.length}× schwebendes Teil — der Lastpfad zum Boden ist gebrochen`,
            });
        }
        // Ω-Φ2 Stabilität — für STEHENDE Werke (kippt → wankt). Ein Schwert „kippt" nicht.
        if (standing) {
            const stab = this._stability(bp, boden);
            if (!stab.inside) {
                out.lean = 1;
                out.lines.push({ sev: "warn", text: "kippt — der Schwerpunkt liegt außerhalb der Standfläche" });
            } else if (stab.margin < 0.25) {
                out.lean = Math.max(0, Math.min(1, 1 - stab.margin / 0.25)); // nahe der Kipp-Kante
                out.lines.push({ sev: "warn", text: "wackelig — der Schwerpunkt sitzt nah an der Kipp-Kante" });
            } else {
                out.lines.push({ sev: "ok", text: "steht — der Schwerpunkt sitzt sicher über der Standfläche" });
            }
            // Kipp-Richtung: vom Stützpolygon-Schwerpunkt zum CoM.xz (dorthin überhängt das Gewicht).
            const poly = this._supportPolygon(bp, boden);
            if (poly && poly.hull && poly.hull.length && stab.com) {
                let cx = 0,
                    cz = 0;
                for (const h of poly.hull) ((cx += h.x), (cz += h.z));
                cx /= poly.hull.length;
                cz /= poly.hull.length;
                const dx = stab.com.x - cx,
                    dz = stab.com.z - cz;
                const len = Math.hypot(dx, dz) || 1;
                out.leanDir = { x: dx / len, z: dz / len };
            }
            // Ω-Φ3-b Knicken — knickt ein schlankes tragendes Glied unter der Last?
            const fail = this._failsUnderLoad(bp);
            if (fail.buckles) {
                out.buckles = true;
                out.lines.push({ sev: "warn", text: "zu schlank — ein tragendes Glied knickt unter der Last" });
            }
        }
        // Ω-Φ4 Schwung — für GEHALTENE Werke (kopflastig → träge).
        if (wielded) {
            const sw = this._swingDynamics(bp);
            const bbox = this._compoundBBox(bp);
            const span = bbox ? Math.max(bbox.max.x - bbox.min.x, bbox.max.y - bbox.min.y, bbox.max.z - bbox.min.z) : 1;
            const balanceFrac = Math.max(0, Math.min(1, sw.balance / Math.max(0.1, span)));
            out.swingDrag = balanceFrac;
            if (balanceFrac > 0.5)
                out.lines.push({
                    sev: "warn",
                    text: "kopflastig — die Masse sitzt weit vom Griff, der Schwung ist träge",
                });
            else if (sw.mass > 0)
                out.lines.push({ sev: "ok", text: "griffnah balanciert — schnelle, leichte Führung" });
            // Klinge/Brecher: eine durchgehende Schneide?
            if (role === "weapon" || role === "brecher") {
                const edge = this._edgeContinuity(bp);
                if (edge < 0.999)
                    out.lines.push({
                        sev: "warn",
                        text: "die Schneide hat eine Lücke — sie schneidet nicht durchgehend",
                    });
            }
        }
        return out;
    }

    // Vorschau eines gewachsenen Baums über den WELT-Render-Pfad (`_buildTreeSkeletonLeaves`:
    // Tube-Rinde + Blatt-Klingen aus phyto-core) statt Parts-Blobs. Geometrie FRISCH (disposen sicher).
    _workshopBuildSkeletonPreviewGroup(bp) {
        if (typeof THREE === "undefined") return null;
        let leavesObj = null;
        try {
            leavesObj = this._buildTreeSkeletonLeaves(bp);
        } catch (_e) {
            throw this._stoffBruch("das Blatt-Skelett der Werkstatt-Vorschau", _e);
        }
        if (!leavesObj || !Array.isArray(leavesObj.leaves) || !leavesObj.leaves.length) return null;
        // Eigenes Vorschau-Material (opak, Vertex-Farbe) statt der Welt-Materialien — die lesen
        // Tag/Nacht-Uniforms und rendern in der Preview-Szene SCHWARZ.
        const mat = this._workshopPreviewFoliageMat();
        const group = new THREE.Group();
        for (const lf of leavesObj.leaves) {
            if (!lf || !lf.geom) continue;
            // Den SCHATTEN-ZWILLING überspringen: er ist in der Welt kamera-UNSICHTBAR (liegt auf
            // SHADOW_TWIN_LAYER, castet nur Schatten) — eine opake Voll-Kronen-Hülle, die in der
            // Vorschau (kein Layer-Cull) den ganzen Baum als grünen Blob verdecken würde (gemessen).
            if (lf.shadowTwin) continue;
            const m = new THREE.Mesh(lf.geom, mat || lf.mat);
            if (lf.localMatrix) m.applyMatrix4(lf.localMatrix);
            m.frustumCulled = false;
            m.userData.sharedMat = true; // das gecachte Vorschau-Material NICHT disposen
            group.add(m);
        }
        return group.children.length ? group : null;
    }

    // Das EINE gecachte Vorschau-Material für die Skelett-Geometrie (opakes PBR-NodeMaterial, Albedo
    // aus der Vertex-Farbe). attribute("color") ist auf WebGPU strikt — die Skelett-Builder setzen
    // die Farbe immer. DoubleSide (Blatt/Tube dünn/gewickelt, wie die Welt).
    _workshopPreviewFoliageMat() {
        if (this._wsPreviewFoliageMat) return this._wsPreviewFoliageMat;
        const mat = new THREE.MeshStandardNodeMaterial({ side: THREE.DoubleSide, roughness: 0.82, metalness: 0 });
        mat.colorNode = THREE.TSL.vec4(THREE.TSL.attribute("color", "vec3"), 1.0);
        this._leuchtStoff(mat, null); // jeder beleuchtete Stoff trägt den Licht-Pool (K11)
        this._wsPreviewFoliageMat = mat;
        return mat;
    }

    // DER SAME DER VORSCHAU (bauen.K1, Vorschau = Phantom = Werk): ein Bauwerk zeigt den Samen seines NÄCHSTEN Setzens — den des
    // Bau-Modus (`_werkSame` mit `buildMode`), den FERTIGEN und das Phantom stellen —, ein Gerät den seiner Art (die Hand
    // liest ihn). So bestellt die Wahl einer Zeile die L0 genau des Werks, das FERTIGEN setzt, und die Kosten-Leiste zählt es.
    // Befund 27.10. (diag-werkstatt-weg --bild, Konsum-Probe am Null-Renderer): Vorschau und Kosten-Leiste bauten den Samen des
    // Namens (L0–L3 einer Gestalt, die nie stand) vor der L0 des gesetzten Hauses in der Schlange — FERTIGEN → L0 kalt 4 751 ms.
    _vorschauSame(bp, name) {
        return this._werkSame(bp, name, bp && this._isPlaceableBlueprint(bp) ? this.state.buildMode : null);
    }

    // Kann die Foundry den Bauplan servieren, kommt die Vorschau aus der EINMAL gezogenen, GECACHTEN
    // Studio-Geometrie (geteilt, nie dupliziert); noch nicht gezogen → einmal anfragen, bei Ankunft
    // neu bauen. Sonst klassischer Pfad.
    _workshopFoundryPreviewGroup(bpName) {
        // Der Boot-Chokepoint prüft selbst (`_ensureAssetFoundry()` gibt foundry-aus null).
        // Vorschau == Welt: `_foundryPresetForEntry` streift den `_var0`-Suffix der Formations-
        // Repräsentanten ab wie die Welt — der exakte `_foundryPresetFor` verfehlte ihn (Part-Nachbau).
        const preset =
            typeof this._foundryPresetForEntry === "function" ? this._foundryPresetForEntry({ type: bpName }) : null;
        if (!preset) return null;
        const f = this._ensureAssetFoundry();
        if (!f) return null;
        // Würfel + LOD-Knöpfe schreiben Samen + Stufe in den Bauplan (`bp._grownSeed`/`_rockSeedBase`/
        // `_crystalSeedBase` · `bp._recipeLod`); die Studio-Vorschau LIEST sie (neuer Wurf = andere
        // Variante). Der Same des Werks (`_vorschauSame`) — derselbe, den das Phantom zeigt und das Setzen stellt.
        const bp = this.state.blueprints ? this.state.blueprints[bpName] : null;
        const seedNum = this._vorschauSame(bp, bpName);
        // DIE WAHL IST DER WILLE (bauen.K1): ein Bauwerk bestellt mit der Vorschau den Welt-Körper seines nächsten Setzens über
        // den EINEN Weg der Welt (`_foundryFlattenFor`: die Wurf-Stufe und L0 im selben Zug) — FERTIGEN findet ihn im Cache.
        // Befund 27.10. (Konsum-Probe): die Haus-L0 lag beim Setzen im Cache, die Senken warteten auf die Wurf-Stufe L3, die
        // erst das Setzen bestellte, hinter den Aufträgen der Kosten-Leiste (1 006–4 302 ms).
        if (bp && f.ready && f.recipes && this._isPlaceableBlueprint(bp))
            this._foundryFlattenFor(Object.assign(this._phantomWerk(bp, null), { wo: 0 }), preset, 0);
        // W-A1 — die Varianten-Wahl (`_foundryVariantFor`) lebt jetzt in der EINEN
        // Studio-Quelle `_workshopStudioPreviewFrom` (seedNum reist als Parameter).
        let lod = bp && Number.isFinite(bp._recipeLod) ? bp._recipeLod | 0 : 0;
        if (lod < 0) lod = 0;
        if (lod > 2) lod = 2;
        // W-A1 — die B4-Regler-Overrides dieser Auswahl (ws.studioOv[preset], null wenn leer).
        const ov = this._workshopStudioOvFor(preset);
        // W-A1 — EHRLICHES INTERIM: bootet der Worker noch oder fehlt das Buch, haengt die EINE Quelle die Vorschau an
        // die Buch-Zusage + gibt "pending" (KEIN Grammatik-Interim fuer foundry-aufloesbare
        // Auswahl mehr — die Buehne bleibt leer, der Status sagt „Studio-Asset lädt…").
        if (!f.ready || !f.recipes) return this._workshopStudioPreviewFrom(preset, seedNum, lod, ov);
        // L2 eines BAUMS ist in der Welt der 8-Winkel-Impostor (`_foundryFlattenFor` →
        // `_foundryBuildImpostorFlat`) — die Vorschau MUSS dasselbe zeigen. Die Impostor-Geometrie ist
        // camera-facing und liest Rotation/Skala aus der INSTANZ-Matrix → als 1-Instanz-InstancedMesh
        // bauen (identity, weiß = kein Tint), nie als plain Mesh. Fels/Kristall/Blume: L2-Geometrie.
        if (lod === 2 && typeof this._foundryPresetIsTree === "function" && this._foundryPresetIsTree(preset)) {
            // DER WARTENDE DER KARTE (K38-N2): die Vorschau steht beim Spieler (Rang 0) und hängt sich an die EINE Zusage,
            // auf die die Karte wartet — das Buch, den Zug ihrer Höhen-Stufe (Rahmen + Sichthöhe) oder ihren Bake —, und
            // baut bei Ankunft neu. Bis hierher gab sie „pending" ohne Wecker (die Karte kam, die Vorschau schlief) bzw.
            // zeigte vor dem Bake die L2-Geometrie und wechselte nie zur Karte der Welt.
            let zusage = null;
            const flat = this._foundryBuildImpostorFlat({ seed: seedNum }, preset, {
                wo: 0,
                wecke: (z) => (zusage = z),
            });
            if (flat && Array.isArray(flat.leaves) && flat.leaves.length) {
                const Ti = THREE;
                const outImp = new Ti.Group();
                for (const lf of flat.leaves) {
                    if (!lf.geom || !lf.mat) continue;
                    // Die Karte liest Schicht und Rahmen je Instanz: dieselbe Fassade + derselbe Stempel wie die Welt.
                    const inst = AnazhRealm._instanzMesh(this._lodInstanceFacade(lf.geom, 1), lf.mat, 1);
                    this._lodSlotStamp({ mesh: inst }, 0, 1, false, lf);
                    // PARITÄT: die Template→Welt-Scale reist in der leaf.localMatrix — die Vorschau
                    // zeigt das Billboard in WELT-Größe (Vorschau == Welt), nicht template-lokal.
                    const lm = lf.localMatrix ? lf.localMatrix.clone() : new Ti.Matrix4();
                    inst.setMatrixAt(0, lm);
                    inst.instanceMatrix.needsUpdate = true;
                    // DER RAHMEN DER KARTE (K38-N2): die Instanz trägt die Box ihrer Karte — Halbbreite und Höhe des Rahmens
                    // (template-lokal, ab der Stammbasis) × die Template→Welt-Matrix. Das Einheits-Quad allein misst auf
                    // der Stammachse 1 m (Breite und Höhe reisen erst im Shader, `aKarte`): die Vorschau rahmte den Stamm.
                    const [hw, hh] = lf.rahmen;
                    inst.boundingBox = new Ti.Box3(
                        new Ti.Vector3(-hw, 0, -hw),
                        new Ti.Vector3(hw, hh, hw)
                    ).applyMatrix4(lm);
                    inst.boundingSphere = inst.boundingBox.getBoundingSphere(new Ti.Sphere());
                    if (typeof inst.setColorAt === "function") {
                        inst.setColorAt(0, new Ti.Color(1, 1, 1));
                        if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
                    }
                    inst.castShadow = false;
                    inst.receiveShadow = false;
                    inst.frustumCulled = false;
                    inst.userData.sharedGeom = true;
                    inst.userData.sharedMat = true;
                    inst.userData.foundryPreview = true;
                    outImp.add(inst);
                }
                if (outImp.children.length) return outImp;
            }
            if (zusage) {
                this._foundryWecker(zusage, "werkstatt", () => {
                    try {
                        this._workshopRebuildPreviewMesh();
                    } catch (_e) {
                        this._stoffBruch("die Werkstatt-Vorschau (Neubau nach der Karte)", _e);
                    }
                });
                return "pending";
            }
            // ohne Zusage kann die Foundry keine Karte (die Zelle scheiterte) → auf die L2-Geometrie unten zurückfallen.
        }
        // W-A1 (Gesetz #0) — der Rest laeuft durch DIE EINE Vorschau-Quelle (Bauplan- UND
        // Rezept-Auswahl teilen sie; ov-Vorschauen laufen cache-frei durch den Regler-Kanal).
        return this._workshopStudioPreviewFrom(preset, seedNum, lod, ov);
    }

    // DER EINE STUDIO-STEMPEL eines Platzier-Akts (Werkstatt-Bau UND Co-Schöpfer): bp.studioOv (Craft)
    // führt, sonst die gewählte Werkstatt-Prägung seines Presets. Tief kopiert + fail-closed:
    // nicht serialisierbar → „kein Stempel“ (nie eine gespaltene Welt). Die Regler eines Programms (`ov`, das fünfte Argument
    // von spawn_studio, KI K2) treten über die Prägung, geklemmt am Vertrag der Art (`_reglerKlemme`, jede Klemme in
    // `befund.geklemmt`); ein Regler ohne Zeile seiner Art, ein Wert ohne Zahl oder ein ov ohne Objekt schließt: false,
    // `befund.fremd` nennt ihn, `befund.kennt` die Regler der Art — nie halb geprägt.
    _studioStampFor(blueprintName, ov, befund = {}) {
        const bp = this.state.blueprints && this.state.blueprints[blueprintName];
        const preset =
            typeof this._foundryPresetForEntry === "function"
                ? this._foundryPresetForEntry({ type: blueprintName })
                : null;
        let stamp = this._artifactStudioOv(bp) || (preset ? this._workshopStudioOvFor(preset) : null);
        if (stamp) {
            try {
                stamp = JSON.parse(JSON.stringify(stamp));
            } catch (_e) {
                stamp = null;
            }
        }
        if (ov == null) return stamp || null;
        const f = this._foundry;
        const rec = preset && f && f.recipes ? f.recipes[preset] : null;
        const zeilen = (rec && f.paramsByKind && f.paramsByKind[rec.kind]) || [];
        const k =
            typeof ov === "object" && !Array.isArray(ov)
                ? this._reglerKlemme(zeilen, ov)
                : { werte: {}, geklemmt: [], fremd: [JSON.stringify(ov)] };
        Object.assign(befund, { geklemmt: k.geklemmt, fremd: k.fremd, kennt: zeilen.map((d) => d.id) });
        if (k.fremd.length) return false;
        return Object.keys(k.werte).length ? Object.assign(stamp || {}, k.werte) : stamp || null;
    }

    // DIE KLEMME DES VERTRAGS (Studio-Vertrag B4): Werte {id: Zahl} gegen die Zeilen PARAMS_BY_KIND ihrer Art — jede Zahl auf
    // [min, max], eine Zeile mit ganzem Schritt auf die ganze Zahl; was sie ändert, steht in `geklemmt` ({id, von, auf}), was
    // keine Zeile oder keine endliche Zahl trägt, in `fremd`. Ob das Fremde fällt (must-ignore: die Übergabe eines Studios,
    // `_studioWerkPruefen`) oder den Akt schließt (fail-closed: das Programm, `_studioStampFor`), sagt der Leser.
    _reglerKlemme(zeilen, werte) {
        const aus = { werte: {}, geklemmt: [], fremd: [] };
        for (const id of Object.keys(werte)) {
            const d = zeilen.find((z) => z && z.id === id);
            const v = werte[id];
            if (!d || typeof v !== "number" || !Number.isFinite(v)) {
                aus.fremd.push(id);
                continue;
            }
            const w = Math.min(d.max ?? Infinity, Math.max(d.min ?? -Infinity, d.step >= 1 ? Math.round(v) : v));
            if (w !== v) aus.geklemmt.push({ id, von: v, auf: w });
            aus.werte[id] = w;
        }
        return aus;
    }

    _workshopStudioOvFor(presetId) {
        const ws = this.state.workshop;
        const ov = ws && ws.studioOv ? ws.studioOv[presetId] : null;
        return ov && typeof ov === "object" && Object.keys(ov).length ? ov : null;
    }
    // DIE PRÄGUNG EINES REZEPTS als Werte (ws.studioOv ohne den Samen `__gestalt`): der Leser der Guss-Dials (Mensch, Gattung)
    // und des Welt-Klangs; null ohne eine. Ein gesetztes Werk liest den Stempel samt Samen (`_studioStampFor`).
    _studioPraegung(presetId) {
        const ov = this._workshopStudioOvFor(presetId);
        const out = {};
        for (const k in ov || {}) if (k !== "__gestalt") out[k] = ov[k];
        return Object.keys(out).length ? out : null;
    }

    // Die Seele einer Gattung (TETRAPODA_SOUL_MAP Seele → Rezept, rückwärts gelesen): der exakte Schlüssel zuerst (wolf-Rezept
    // → wolf-Seele), sonst die erste gemappte Seele (deer → wesen); null ohne eine. Leser: der Ofen der Werkstatt und das Werk
    // der Gattung aus einem Programm (`_dslSpawnStudioItems`) — dieselbe Seele für denselben Guss.
    _gattungsSeele(preset) {
        const SM = AnazhRealm.TETRAPODA_SOUL_MAP;
        if (SM[preset] === preset && AnazhRealm.CREATURE_SOULS[preset]) return preset;
        for (const k in SM) if (SM[k] === preset && AnazhRealm.CREATURE_SOULS[k]) return k;
        return null;
    }

    // DIE EINE STUDIO-VORSCHAU-QUELLE (_workshopStudioPreviewFrom) für Bauplan- UND Rezept-Auswahl,
    // DREI-WERTIG: Group · "pending" (Asset/Worker/ov-Bau unterwegs) · false (Foundry kann es nicht
    // → klassischer Pfad). ov-Vorschau cache-FREI — sie vergiftet NIE den Welt-Cache.
    // Der Host-OFEN für die Arten mit Werk-Verb (KIND_POLICY `werk`: koerper · kreatur · klang exportieren kein Mesh): Guss
    // via bauTier (die Gattung, "wesen") bzw. bauMensch (die Prägung des Körpers), sonst endlose request→null-Schleife.
    // Rückgabe Group · false (eine Prägung ohne Körper, der Klang: kein 3D) · undefined (keine Ofen-Domäne → Foundry-Pfad).
    // Memo je Schlüssel = EIN lebender Guss, der dem Ofen gehört; der Wechsel entsorgt ihn über `_disposeSoulGroup` (das
    // Einzelstück fällt, geteilte Vorlagen bleiben).
    _workshopOvenPreview(rec, preset, ov, lod) {
        const kind = rec && rec.kind;
        const werk = kind && AnazhRealm.KIND_POLICY[kind] ? AnazhRealm.KIND_POLICY[kind].werk : null;
        if (!werk) return undefined;
        if (werk !== "wesen" && preset !== AnazhRealm.KOERPER_HOST_RECIPE) return false;
        // Die LOD-Wahl (ws.recipeLod, aus den kindStages-Vertragsdaten) reist bis in den Ofen-Guss: er
        // trägt nah + fern aus DERSELBEN Pipe, die Wahl toggelt sie — wie die Welt am Distanz-Band.
        const lodN = Number.isFinite(lod) ? Math.max(0, lod | 0) : 0;
        const key = kind + "|" + preset + "|" + lodN + "|" + (ov ? JSON.stringify(ov) : "");
        const memo = this._wsOvenMemo;
        if (memo && memo.key === key && memo.group) return memo.group;
        if (memo && memo.group) this._disposeSoulGroup(memo.group);
        this._wsOvenMemo = null;
        let group = null;
        if (werk === "wesen") {
            const soulKey = this._gattungsSeele(preset);
            if (soulKey) group = this._buildCreatureGroup(soulKey, { dialsOv: ov || null, eigen: true });
        } else group = this._buildHumanGroup(ov || undefined, { eigen: true });
        if (!group || !group.children) return false;
        // Die LOD-Wahl der Vorschau schaltet die Stufe am EINEN Schalter der Gelenk-Gestalt (Tier und Mensch): L0 = die
        // feine, L1 = die gelenkige Grobstufe aus DERSELBEN Pipe (jede Gelenk-Gestalt trägt beide, fail-closed im Bau; der
        // magentafarbene Not-Körper eines kalten Kerns ist keine).
        if (group.userData._gelenk) this._gelenkStufe(group, lodN >= 1 ? Infinity : 0);
        // Der Guss gehört dem Ofen (`eigen`): ein Regler-Einzelstück trägt keine Geteilt-Markierung, eine Vorlage aus dem
        // Memo ihre eigene — `_disposeSoulGroup` entsorgt beim Wechsel genau das Einzelstück. Die Bauplan-Vorschau rührt
        // die Gestalt des Ofens nie an (`_workshopRebuildPreviewMesh`).
        this._wsOvenMemo = { key, group };
        return group;
    }

    _workshopStudioPreviewFrom(preset, seedNum, lod, ov) {
        const f = this._ensureAssetFoundry();
        if (!f) return null;
        const rebuild = () => {
            try {
                this._workshopRebuildPreviewMesh();
            } catch (_e) {
                this._stoffBruch("die Werkstatt-Vorschau (Studio-Neubau)", _e);
            }
        };
        if (!f.ready || !f.recipes) {
            // Foundry bootet / Buch kalt → die Vorschau hängt sich an die EINE Buch-Zusage und baut bei Ankunft EINMAL neu.
            this._foundryWecker(f.buchDa, "werkstatt", rebuild);
            return "pending";
        }
        // ERFINDER-WELLE — die Ofen-Domaenen (koerper/kreatur/klang) ZUERST: der Host baeckt
        // ihre Gestalt selbst; der Foundry-Worker kennt sie nicht (MESHFREI per Vertrag).
        const ovenRec = f.recipes ? f.recipes[preset] : null;
        if (ovenRec && typeof ovenRec.kind === "string") {
            // der Ofen gießt aus den Werten der Prägung (ohne den Samen eines Studio-Werks — der Guss ist seed-invariant)
            const oven = this._workshopOvenPreview(ovenRec, preset, ov ? this._studioPraegung(preset) : null, lod);
            if (oven !== undefined) return oven;
        }
        // die Gestalt des Werks: ein Studio-Werk trägt seinen Samen im Stempel, sonst folgt sie dem Samen der Auswahl
        const variant = this._foundryGestaltFor({ seed: seedNum, studioOv: ov }, preset);
        if (variant == null) return "pending"; // Buch ohne Gestalten-Budget: die Vorschau wartet
        if (ov) {
            // DER REGLER-KANAL: ov-Bau ohne jede Cache-Beruehrung (kein f.cache, kein IDB) — der Memo-Schlüssel ist
            // das volle ov (eine Vorschau ist ein Unikat).
            const key = this._foundryKoerperKey(preset, variant, lod) + "|" + JSON.stringify(ov);
            const memo = this._wsStudioOvMemo;
            if (!memo || memo.key !== key) {
                // Auswahl-/ov-Wechsel: das alte Memo faellt, seine EIGENE Geometrie wird frei.
                if (memo && memo.group && memo.group !== "pending") this._disposeFoundryGroupGeom(memo.group);
                const fresh = { key, group: "pending" };
                this._wsStudioOvMemo = fresh;
                this._foundryRequest(preset, variant, lod, ov, 0).then((meshes) => {
                    // Wechselte die Auswahl waehrend des Baus, verfaellt das Ergebnis (rohe
                    // Arrays, kein GPU-Leak — die Naht `_foundryBuildGroup` laeuft nur fuer
                    // das LEBENDE Memo).
                    if (this._wsStudioOvMemo !== fresh) return;
                    fresh.group = meshes && meshes.length ? this._foundryBuildGroup(meshes, { lod, preset }) : null;
                    rebuild();
                });
                return "pending";
            }
            if (memo.group === "pending") return "pending";
            if (!memo.group || !memo.group.children || !memo.group.children.length) return false;
            return this._workshopWrapFoundryGroup(memo.group);
        }
        const key = this._foundryKoerperKey(preset, variant, lod); // Same + LOD aus der Auswahl = echte Pipeline-Daten
        const group = this._foundryCacheGet(key);
        if (group === undefined) {
            // Noch nicht im Cache → der EINE Zug des Schlüssels (zog ihn schon die Welt oder die Hand, hängt sich die Vorschau
            // an und hebt seinen Rang auf die Nähe 0); bei Ankunft baut sie neu, nach Ablauf fragt der Neubau frisch an.
            this._foundryWecker(this._foundryZug(key, preset, variant, lod, null, 0), "werkstatt", rebuild);
            return "pending";
        }
        if (group === null || !group.children || !group.children.length) return false;
        return this._workshopWrapFoundryGroup(group);
    }

    // W-A1 — die Vorschau-Huelle um eine Foundry-Gruppe: geteilte Geometrie/Materialien
    // (sharedGeom/sharedMat → der Vorschau-Dispose laesst sie stehen; kein Klon der
    // ~170k-Geometrie je Auswahl-Wechsel = billig + kein Studio-Asset-Verlust).
    _workshopWrapFoundryGroup(group) {
        const T = THREE;
        const out = new T.Group();
        for (const ch of group.children) {
            if (!ch.geometry || !ch.material) continue;
            const mesh = new T.Mesh(ch.geometry, ch.material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.userData.sharedGeom = true;
            mesh.userData.sharedMat = true;
            mesh.userData.foundryPreview = true;
            out.add(mesh);
        }
        return out.children.length ? out : null;
    }
    _workshopRebuildPreviewMesh() {
        const ws = this._ensureWorkshopState();
        if (!ws.preview) return;
        const p = ws.preview;
        // Alten Mesh disposen (geometrien + materialien tief) — nur die EIGENEN Teile der Bauplan-Vorschau: die Gestalt des
        // Ofens gehört dem Ofen (`_wsOvenMemo`, er entsorgt sie beim Wechsel über `_disposeSoulGroup`).
        const ofenGuss = !!this._wsOvenMemo && this._wsOvenMemo.group === p.currentMesh;
        if (p.currentMesh) {
            p.scene.remove(p.currentMesh);
            if (!ofenGuss)
                p.currentMesh.traverse((obj) => {
                    // V8.38 — auch isLine disposen (Verbindungs-Linien), sonst
                    // leaken ihre Geometrie + Material bei jedem Bauplan-Edit.
                    if (obj.isMesh || obj.isLine) {
                        // Dispose deferred (WebGPU Submit-Race). Geteilte Studio-Geometrie (sharedGeom) NIE disposen —
                        // sonst zerstört ein Bauplan-Wechsel das Asset für die ganze Welt.
                        if (obj.geometry && !(obj.userData && obj.userData.sharedGeom))
                            this._queueDispose(obj.geometry);
                        // DAS NEUE KLEID — die Skelett-Vorschau nutzt die GETEILTEN Welt-Materialien
                        // (_sharedFoliageMaterial); die dürfen NIE disposed werden (sonst bricht die
                        // Welt-Krone). Nur eigene Part-Materialien freigeben.
                        if (obj.material && !(obj.userData && obj.userData.sharedMat)) {
                            if (Array.isArray(obj.material)) obj.material.forEach((m) => this._queueDispose(m));
                            else this._queueDispose(obj.material);
                        }
                    }
                });
            p.currentMesh = null;
        }
        p.partMeshes.clear();
        p.origColors.clear();

        const bp = this.state.blueprints[ws.selectedBlueprint];
        if (!bp || !Array.isArray(bp.parts)) {
            // W-A1 — REZEPT-AUSWAHL (kein Bauplan, aber ein Studio-Rezept gewaehlt):
            // die Vorschau baut durch DIE EINE Studio-Quelle (anschaubar + regelbar).
            if (!bp && ws.selectedRecipe) {
                this._workshopRebuildRecipePreview(ws, p);
                return;
            }
            p.dirty = true;
            return;
        }
        // Vorschau-Kaskade: (1) Studio-Asset der Foundry (gezogen, gecacht, geteilt; kommt es später, baut
        // _workshopFoundryPreviewGroup neu) · (2) gewachsener Baum über den Welt-Skelett-Pfad
        // (_workshopBuildSkeletonPreviewGroup) · (3) Parts über _buildFromBlueprint.
        let group = this._workshopFoundryPreviewGroup(ws.selectedBlueprint);
        // "pending" (Preset bekannt, Asset zieht noch) → LEERE Bühne + Status, KEIN Part-Bau des Donors
        // (die Gestalt wäre eine Lüge); bei Ankunft baut rebuild() um. false → klassischer Pfad;
        // Grammatik-only-Blueprints (preset null) behalten den Part-Pfad.
        if (group === "pending") {
            this._wsStudioPending = true;
            this._workshopStudioStatusSync();
            p.physicsVerdict = null;
            p.dirty = true;
            return;
        }
        this._wsStudioPending = false;
        this._workshopStudioStatusSync();
        if (group === false) group = null;
        if (!group && bp._skeleton && Array.isArray(bp._skeleton.branches) && bp._skeleton.branches.length > 0) {
            group = this._workshopBuildSkeletonPreviewGroup(bp);
        }
        if (!group) {
            group = this._buildFromBlueprint(bp, 0, undefined, { connectionLines: true });
        }
        // Top-level-Children ↔ bp.parts 1:1 (Reihenfolge): je Part ein Mesh oder eine Sub-Group (fraktale
        // blueprint-Refs). Nur Mesh-Children sind selektierbar; ein fraktaler Ref als Ganzes via Sub-Mesh-Hit.
        let idx = 0;
        for (const child of group.children) {
            // Verbindungs-Linien/-Marker und Sattel-Optik (isAttachmentVisual) sind keine Parts: überspringen
            // (sonst selektierbar + getintet). Sie liegen am Ende — continue ohne idx++ hält die Indizes 1:1.
            if (child.userData && (child.userData.isConnectionLine || child.userData.isAttachmentVisual)) continue;
            child.userData.partIdx = idx;
            if (child.isMesh) {
                p.partMeshes.set(child, idx);
                const col = child.material && child.material.color ? child.material.color.getHex() : 0xffffff;
                p.origColors.set(child, col);
            } else if (child.children && child.children.length > 0) {
                // Fraktale Sub-Group: jeder Innen-Mesh-Hit zählt als Hit auf den Part.
                child.traverse((sub) => {
                    if (sub.isMesh) {
                        p.partMeshes.set(sub, idx);
                        const col = sub.material && sub.material.color ? sub.material.color.getHex() : 0xffffff;
                        p.origColors.set(sub, col);
                    }
                });
            }
            idx++;
        }
        p.currentMesh = group;
        p.scene.add(group);
        // Ω-W3 (wahrerbauplan §7) — die gerechnete Physik beim BAU gecacht (§1, nicht
        // pro Frame); der RAF-Tick liest sie fürs Wanken, _workshopRender für den
        // Schwebe-Marker. Die Ruhe-Pose merken (das Wanken oszilliert um sie).
        p.physicsVerdict = this._workshopPhysicsVerdict(bp);
        p._restRotX = group.rotation.x;
        p._restRotZ = group.rotation.z;
        p._leanWasApplied = false;

        // Auto-center: Kamera-Target auf Bauplan-Center, Distanz aus Diagonale
        this._workshopCenterPreviewOn(group, p);
        p.dirty = true;
    }

    // W-A1 — das Auto-Center der Vorschau-Kamera (aus _workshopRebuildPreviewMesh gehoben,
    // V9.56-i: Bauplan- UND Rezept-Vorschau teilen es — eine Quelle). K05 (WS-01) — DER RAHMEN AUS DEM KAMERAWINKEL:
    // der Abstand ist gelöst, nicht geschätzt (`_workshopRahmen`); der 3-m-Mindestabstand fiel (ein Messer füllte 0,059
    // der Bildkante). Nah- und Fern-Ebene folgen dem Radius R der Hüllkugel, der Zoom lebt in [0,5·R; 30·R].
    _workshopCenterPreviewOn(group, p) {
        const bbox = new THREE.Box3().setFromObject(group);
        if (bbox.isEmpty()) return;
        bbox.getCenter(p.orbit.target);
        const R = bbox.getSize(new THREE.Vector3()).length() / 2;
        if (!(R > 0)) return;
        // near ≤ R/10: der Zoom-Boden 0,5·R bleibt ≥ 4·near; far trägt den Zoom-Deckel 30·R samt Gestalt.
        p.camera.near = Math.min(0.1, R / 10);
        p.camera.far = Math.max(200, 32 * R);
        p.camera.updateProjectionMatrix();
        // Gerahmt wird bei frischer Wahl (resetWorkshopCamera nullt _distInitialized) — ein Teil-Edit behält den Abstand.
        if (!p._distInitialized) {
            p.rahmen = { box: bbox, R, auto: true };
            this._workshopSyncCanvasSize(); // das Seitenverhältnis des Canvas, bevor der Rahmen es liest
            p.orbit.dist = this._workshopRahmen(p);
            p._distInitialized = true;
        } else if (p.rahmen) {
            p.rahmen.box = bbox;
            p.rahmen.R = R;
        }
    }

    // K05 (WS-01) — der Abstand, bei dem die projizierte Box3 der Gestalt aus dem Orbit-Winkel und dem Seitenverhältnis
    // des Canvas 0,7 der Bildkante füllt (größere Kante je Bildkante, NDC, auf das Bild geklemmt — das Maß von
    // gate:v1-pfad V-D3). Das Maß fällt monoton mit dem Abstand: Bisektion zwischen der Ebene vor der nächsten Ecke
    // (≥ 4·near, ≥ 0,5·R) und dem Zoom-Deckel 30·R. Eine flache Klinge rahmt an ihrer Bild-Länge, nicht an der Hüllkugel.
    _workshopRahmen(p) {
        const { box, R } = p.rahmen;
        const cam = p.camera;
        const cosP = Math.cos(p.orbit.pitch);
        const blick = new THREE.Vector3(
            cosP * Math.cos(p.orbit.yaw),
            Math.sin(p.orbit.pitch),
            cosP * Math.sin(p.orbit.yaw)
        );
        const ax = new THREE.Vector3(),
            ay = new THREE.Vector3(),
            az = new THREE.Vector3();
        new THREE.Matrix4().lookAt(blick, new THREE.Vector3(), cam.up).extractBasis(ax, ay, az);
        const mitte = box.getCenter(new THREE.Vector3());
        const v = new THREE.Vector3();
        const ecken = [];
        for (const x of [box.min.x, box.max.x])
            for (const y of [box.min.y, box.max.y])
                for (const z of [box.min.z, box.max.z]) {
                    v.set(x, y, z).sub(mitte);
                    ecken.push([v.dot(ax), v.dot(ay), v.dot(az)]);
                }
        const tv = Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2);
        const th = tv * cam.aspect;
        const kl = (q) => Math.max(-1, Math.min(1, q));
        const fuell = (d) => {
            let x0 = 1,
                x1 = -1,
                y0 = 1,
                y1 = -1;
            for (const [ex, ey, ez] of ecken) {
                const w = d - ez;
                const nx = ex / (w * th),
                    ny = ey / (w * tv);
                if (nx < x0) x0 = nx;
                if (nx > x1) x1 = nx;
                if (ny < y0) y0 = ny;
                if (ny > y1) y1 = ny;
            }
            return Math.max((kl(x1) - kl(x0)) / 2, (kl(y1) - kl(y0)) / 2);
        };
        const ZIEL = 0.7;
        let vorn = -Infinity;
        for (const e of ecken) if (e[2] > vorn) vorn = e[2];
        let lo = Math.max(4 * cam.near, 0.5 * R, vorn + cam.near);
        let hi = 30 * R;
        if (lo >= hi || fuell(lo) <= ZIEL) return Math.min(lo, hi);
        if (fuell(hi) > ZIEL) return hi;
        for (let i = 0; i < 40; i++) {
            const mid = (lo + hi) / 2;
            if (fuell(mid) > ZIEL) lo = mid;
            else hi = mid;
        }
        return hi;
    }

    // Rezept-Vorschau: Seed aus der Rezept-Id gehasht, LOD aus ws.recipeLod, ov aus den Reglern — durch
    // DIE EINE Studio-Quelle. "pending" = leere Bühne + Status; false/null = ehrlich leer (KEIN Nachbau).
    _workshopRebuildRecipePreview(ws, p) {
        const preset = ws.selectedRecipe;
        const f = this._foundry;
        const rec = f && f.recipes ? f.recipes[preset] : null;
        if (!rec) {
            p.dirty = true;
            return;
        }
        const seedNum = this._werkSame(null, preset); // der Same eines Rezepts ohne Bauplan: seine id
        const ov = this._workshopStudioOvFor(preset);
        // ERFINDER-WELLE — die Rezept-Vorschau ehrt die LOD-Wahl (ws.recipeLod, generisch
        // aus kindStages — z. B. haus L0/L1/L2); Default 0 = byte-alt.
        const rLod = Number.isFinite(ws.recipeLod) ? Math.max(0, Math.min(2, ws.recipeLod | 0)) : 0;
        const group = this._workshopStudioPreviewFrom(preset, seedNum, rLod, ov);
        this._wsStudioPending = group === "pending";
        this._workshopStudioStatusSync();
        p.physicsVerdict = null;
        if (!group || group === "pending" || group === false) {
            p.dirty = true;
            return;
        }
        p.currentMesh = group;
        p.scene.add(group);
        p._restRotX = group.rotation.x;
        p._restRotZ = group.rotation.z;
        p._leanWasApplied = false;
        this._workshopCenterPreviewOn(group, p);
        p.dirty = true;
    }

    // W-A1 — der REZEPT-TAIL (von _renderWorkshopDOM bei selectedRecipe gerufen): Vorschau +
    // generische B4-Regler + Rezept-Steckbrief. Bewusst OHNE Hotbar-/Fertigen-/Platzier-Fluss.
    _workshopRenderRecipeTail(ws) {
        if (typeof this._workshopRebuildPreviewMesh === "function") {
            this._workshopRebuildPreviewMesh();
        }
        if (typeof this._workshopRenderRecipePanel === "function") {
            this._workshopRenderRecipePanel(null);
        }
        this._workshopRenderRecipeStats(ws.selectedRecipe);
    }

    // W-A1 — der Rezept-Steckbrief im bestehenden Stats-Element (nur anschaubar/regelbar).
    _workshopRenderRecipeStats(presetId) {
        if (typeof document === "undefined") return;
        const panel = document.getElementById("workshop-stats-panel");
        if (!panel) return;
        const az = document.getElementById("workshop-action-zone");
        panel.innerHTML = "";
        if (az) az.innerHTML = "";
        const f = this._foundry;
        const rec = f && f.recipes ? f.recipes[presetId] : null;
        if (!rec) return;
        const head = document.createElement("div");
        head.className = "workshop-recipe-stats-head";
        head.textContent = (rec.lab || presetId) + " · Studio-Rezept (" + (rec.kind || "?") + ")";
        panel.appendChild(head);
        const hint = document.createElement("div");
        hint.className = "workshop-recipe-stats-hint";
        hint.textContent =
            "Ein Eintrag des LIVE-Rezeptbuchs — anschaubar + regelbar (Studio-Regler links), nicht platzierbar. Das Welt-Verhalten bestimmt allein place.mode des Rezepts.";
        panel.appendChild(hint);
        // Klang-Rezept: kein 3D, sein Verb ist HÖREN. „Als Welt-Klang setzen“ wählt das Genre für den EINEN
        // Lofi-Konsumenten (state.klangPreset, persistiert; Tempo/Skala ab dem nächsten Akkord live) und
        // spielt sofort einen Akkord als Feedback.
        if (rec.kind === "klang") {
            const kRow = document.createElement("div");
            kRow.className = "workshop-recipe-btns";
            const cur = this.state.klangPreset || AnazhRealm.KLANG_HOST_RECIPE;
            const kBtn = document.createElement("button");
            kBtn.type = "button";
            kBtn.className = "workshop-recipe-dice";
            kBtn.textContent = cur === presetId ? "♪ Welt-Klang (aktiv)" : "♪ Als Welt-Klang setzen";
            kBtn.title =
                "Der Lofi-Strom der Welt folgt diesem Genre (Tempo + Skala aus dem Genesis-Rezept) — ab dem nächsten Akkord.";
            kBtn.addEventListener("click", () => {
                this.state.klangPreset = presetId;
                this.saveState && this.saveState();
                const bpm = rec.fx && rec.fx.klang && rec.fx.klang.bpm;
                this.log(`Welt-Klang: ${rec.lab || presetId}${bpm ? ` (${bpm} bpm)` : ""}`, "INFO");
                // Sofort hoerbar: ein Akkord des neuen Genres (fail-soft, Audio ggf. aus).
                try {
                    if (this.state.symphony && this.state.symphony.enabled && this._lofiPlayChord) {
                        this._lofiPlayChord(this._lofiChordFromDegree ? this._lofiChordFromDegree(0) : [0, 4, 7]);
                    }
                } catch (_e) {}
                this._workshopRenderRecipeStats(presetId);
            });
            kRow.appendChild(kBtn);
            panel.appendChild(kRow);
        }
        this._workshopStudioStatusSync();
    }

    // DER EINE Status-Sync („Studio-Asset lädt…“) aus `_wsStudioPending` (runtime-only) ins Stats-
    // Element; gerufen von rebuild (pending-Wechsel) UND vom Stats-Renderer (nach innerHTML-Wipe).
    _workshopStudioStatusSync() {
        if (typeof document === "undefined") return;
        const panel = document.getElementById("workshop-stats-panel");
        if (!panel) return;
        let el = document.getElementById("workshop-studio-status");
        if (this._wsStudioPending) {
            if (!el) {
                el = document.createElement("div");
                el.id = "workshop-studio-status";
                el.className = "workshop-studio-status";
                panel.prepend(el);
            }
            el.textContent = "Studio-Asset lädt…";
        } else if (el) {
            el.remove();
        }
    }

    // Canvas-Größen-Sync: CSS-Pixel-Größe lesen, renderer + camera anpassen. Aus RAF-Tick UND
    // ResizeObserver gerufen — der Observer feuert headless nicht zuverlässig.
    _workshopSyncCanvasSize() {
        const ws = this._ensureWorkshopState();
        if (!ws.preview || !ws.preview.canvas) return;
        const p = ws.preview;
        const rect = p.canvas.getBoundingClientRect();
        const w = Math.max(64, Math.floor(rect.width));
        const h = Math.max(64, Math.floor(rect.height));
        if (p.canvas.width !== w || p.canvas.height !== h) {
            p.renderer.setSize(w, h, false);
            // V8.38 — der Preview-Canvas ist nicht mehr 1:1 (CSS aspect-ratio
            // 5/3, damit das Stats-Panel ohne Scrollen sichtbar bleibt) → die
            // Kamera muss das Seitenverhältnis übernehmen, sonst staucht das Bild.
            if (p.camera) {
                p.camera.aspect = w / h;
                p.camera.updateProjectionMatrix();
            }
            // K05 — bis der Spieler zoomt, folgt der Rahmen dem Canvas (das Seitenverhältnis gehört zum Kamerawinkel).
            if (p.rahmen && p.rahmen.auto) p.orbit.dist = this._workshopRahmen(p);
            p.dirty = true;
        }
    }

    // Render ein einzelnes Frame: Kamera aus orbit-Werten, Selection-Tint
    // anwenden, dann renderer.render.
    _workshopRender() {
        const ws = this._ensureWorkshopState();
        if (!ws.preview) return;
        const p = ws.preview;
        // V8.01 — defensive Sync: prüft ob CSS-Canvas-Größe sich seit dem
        // letzten Frame geändert hat, passt renderer entsprechend an.
        this._workshopSyncCanvasSize();
        // Kamera-Pose berechnen
        const cosP = Math.cos(p.orbit.pitch);
        p.camera.position.set(
            p.orbit.target.x + p.orbit.dist * cosP * Math.cos(p.orbit.yaw),
            p.orbit.target.y + p.orbit.dist * Math.sin(p.orbit.pitch),
            p.orbit.target.z + p.orbit.dist * cosP * Math.sin(p.orbit.yaw)
        );
        p.camera.lookAt(p.orbit.target);
        // Selection-Tint: violett-Mischung 50:50 mit Original-Farbe.
        // Alle anderen Parts zurück auf Original (idempotent).
        const selIdx = ws.selectedPartIdx;
        // Ω-W3 (wahrerbauplan §7) — die SCHWEBENDEN Teile (Lastpfad gebrochen) werden
        // sichtbar warn-rot getintet: der gerechnete Lastpfad-Bruch (Ω-Φ5) wird Anblick.
        // Die Auswahl-Tönung hat Vorrang (der Spieler arbeitet daran).
        const fp = p.physicsVerdict && p.physicsVerdict.floatingParts;
        const floatSet = fp && fp.length ? new Set(fp) : null;
        for (const [mesh, idx] of p.partMeshes) {
            const orig = p.origColors.get(mesh);
            if (typeof orig !== "number") continue;
            if (!mesh.material || !mesh.material.color) continue;
            if (idx === selIdx) {
                const r1 = (orig >> 16) & 0xff;
                const g1 = (orig >> 8) & 0xff;
                const b1 = orig & 0xff;
                const r2 = 0xb0,
                    g2 = 0x6a,
                    b2 = 0xd9;
                const rB = Math.round(r1 * 0.5 + r2 * 0.5);
                const gB = Math.round(g1 * 0.5 + g2 * 0.5);
                const bB = Math.round(b1 * 0.5 + b2 * 0.5);
                mesh.material.color.setHex((rB << 16) | (gB << 8) | bB);
            } else if (floatSet && floatSet.has(idx)) {
                const r1 = (orig >> 16) & 0xff,
                    g1 = (orig >> 8) & 0xff,
                    b1 = orig & 0xff;
                const rB = Math.round(r1 * 0.4 + 0xff * 0.6);
                const gB = Math.round(g1 * 0.4 + 0x46 * 0.6);
                const bB = Math.round(b1 * 0.4 + 0x32 * 0.6);
                mesh.material.color.setHex((rB << 16) | (gB << 8) | bB);
            } else {
                mesh.material.color.setHex(orig);
            }
        }
        // Welle 6.B Phase 2 — Gizmo synchronisieren (Position + Distance-
        // Scale + Mode-Visibility) VOR dem Render.
        this._workshopSyncGizmo();
        // Erst nach WebGPURenderer.init() rendern (rendererReady, wie das Haupt-Loop-Gate); ein Render-Fehler bricht in
        // `_buehneRender` laut beim Namen.
        if (!p.rendererReady) return;
        this._buehneRender(p.renderer, p.scene, p.camera, "Werkstatt-Vorschau");
    }

    // DIE WAHL JEDES NEBEN-RENDERERS (Werkstatt-Vorschau, Feed-, Hof-, Ich-Bühne): dieselbe EINE Frage wie die Welt
    // (`_nullRendererGewaehlt`) — unter dem Null-Renderer zeichnet die Seite nichts, auch keine Bühne. Bis 25.10. baute jede
    // Bühne ihren WebGPURenderer selbst: in der Werkstatt-Weg-Linse (Null-Renderer, swiftshader) kompilierte jede Vorschau
    // 10–70 s im GPU-Prozess, der Compositor stand, rAF und jede Animation froren, das Warten der Linse riss (0 von 4
    // Läufen unter Last grün). Stencil aus wie die Haupt-Welt (V10.0-j.b: kein Pure-Depth-stencilLoadOp-Crash); `bereit`
    // folgt dem init() (das Gate der Bühne); null, wenn der Renderer nicht entsteht.
    _buehneRenderer(canvas, w, h, klar, wer, bereit) {
        let renderer;
        try {
            renderer = this._nullRendererGewaehlt()
                ? this._makeHeadlessRenderer(canvas)
                : new THREE.WebGPURenderer({ canvas, antialias: true, ...this._rendererGeraet() });
            renderer.stencil = false;
            renderer.setSize(w, h, false);
            renderer.setPixelRatio(window.devicePixelRatio || 1);
            renderer.setClearColor(klar, 1);
            renderer
                .init()
                .then(bereit)
                .catch((err) => this.log(`${wer} init: ${err && err.message}`, "ERROR"));
        } catch (err) {
            this.log(`${wer}: WebGPU-Renderer fehlgeschlagen (${err && err.message})`, "ERROR");
            return null;
        }
        return renderer;
    }

    // DIE BÜHNE ZEIGT IHR WERK GANZ (Welle L, Befund V-D3): ein Neben-Renderer (Werkstatt-Vorschau, Feed-, Hof-,
    // Ich-Bühne) zeichnet EIN Werk in EINER Stufe aus seiner eigenen Kamera. Die LOD-Maske misst vom Welt-Auge
    // (`uLodAuge`, je Frame aus der Haupt-Kamera) und gehört der Welt: die Vorschau-Eiche im Ursprung lag vom Auge
    // auf der Plattform 36 m weit, jenseits ihrer L0-Kante — 29 Meshes mit 21 108 Dreiecken in der Szene, 0 im Bild.
    // Um den Bühnen-Render steht die Maske aus (uLodMaskOn 0; der geteilte renderGroup-Satz lädt je render() neu),
    // danach zurück auf den Welt-Stand. Jeder Neben-Renderer zeichnet NUR hier. r184s render() ist SYNCHRON (es gibt
    // kein Versprechen, dessen catch einen Fehler sähe — vier `.catch(… "INFO")` der Bühnen fingen nie etwas): ein
    // Render-Fehler der Bühne bricht hier laut beim Namen (`wer`), und ihr Takt steht.
    _buehneRender(renderer, scene, camera, wer) {
        const lu = this.state.lodUniforms;
        const an = lu && lu.uLodMaskOn ? lu.uLodMaskOn.value : null;
        if (an !== null) lu.uLodMaskOn.value = 0;
        try {
            renderer.render(scene, camera);
        } catch (e) {
            throw this._stoffBruch("die " + wer + " (Bühnen-Render)", e);
        } finally {
            if (an !== null) lu.uLodMaskOn.value = an;
        }
    }

    // Maus-Listener der Preview-Canvas, Drag-Pfade in Priorität: (1) Gizmo-Handle → Manipulator (kein
    // Orbit) · (2) Mittelmaus/Shift+Links → Pan in der Kamera-Ebene · (3) leerer Links-Klick → Orbit,
    // kurzer Klick → Selection · (4) Wheel → Zoom-zum-Cursor. Wheel mit stopPropagation (sonst scrollt
    // der Drawer mit); CSS overscroll-behavior:contain als zweite Linie.
    _workshopInstallPreviewListeners() {
        const ws = this._ensureWorkshopState();
        if (!ws.preview || ws.preview.listenersInstalled) return;
        const p = ws.preview;
        const onDown = (event) => {
            event.preventDefault();
            // (1) Gizmo-Hit? Pure Manipulator-Drag, kein Orbit, keine Selection.
            const gizmoHit = this._workshopRaycastGizmo(event.clientX, event.clientY);
            if (gizmoHit) {
                this._workshopBeginManipulation(gizmoHit.mode, gizmoHit.axis, event.clientX, event.clientY);
                return;
            }
            // (2) Pan-Geste: Mittelmaus (button=1) ODER Shift+Links.
            const isPan = event.button === 1 || (event.button === 0 && event.shiftKey);
            // (3) Normaler Drag: Orbit / Selection
            p.drag = {
                startX: event.clientX,
                startY: event.clientY,
                startTime: typeof performance !== "undefined" ? performance.now() : Date.now(),
                startYaw: p.orbit.yaw,
                startPitch: p.orbit.pitch,
                startTarget: p.orbit.target.clone(),
                moved: false,
                button: event.button,
                mode: isPan ? "pan" : "orbit",
            };
        };
        const onMove = (event) => {
            // (1) Manipulator-Drag aktiv? Dann nur Manipulator anwenden.
            if (p.dragManipulator) {
                this._workshopApplyManipulation(event.clientX, event.clientY);
                return;
            }
            // (2) Orbit/Pan-Drag aktiv?
            if (!p.drag) return;
            const dx = event.clientX - p.drag.startX;
            const dy = event.clientY - p.drag.startY;
            if (!p.drag.moved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
                p.drag.moved = true;
            }
            if (!p.drag.moved) return;
            if (p.drag.mode === "pan") {
                // Pan in der Kamera-Ebene (Right/Up aus der Kamera-Matrix); Delta-Pixel × dist / canvas.height —
                // die Sensitivität folgt dem Zoom.
                const rect = p.canvas.getBoundingClientRect();
                const pixelToWorld = p.orbit.dist / Math.max(1, rect.height);
                const camRight = new THREE.Vector3().setFromMatrixColumn(p.camera.matrix, 0);
                const camUp = new THREE.Vector3().setFromMatrixColumn(p.camera.matrix, 1);
                // dx > 0 = Maus nach rechts → target nach links (Welt "folgt" der Maus)
                p.orbit.target
                    .copy(p.drag.startTarget)
                    .addScaledVector(camRight, -dx * pixelToWorld)
                    .addScaledVector(camUp, dy * pixelToWorld);
                p.dirty = true;
            } else if (p.drag.button === 0) {
                // Orbit (links-Drag): yaw aus horizontaler, pitch aus vertikaler Maus-Bewegung
                p.orbit.yaw = p.drag.startYaw - dx * 0.01;
                p.orbit.pitch = Math.max(-1.4, Math.min(1.4, p.drag.startPitch + dy * 0.01));
                p.dirty = true;
            }
        };
        const onUp = (event) => {
            if (p.dragManipulator) {
                this._workshopEndManipulation();
                return;
            }
            if (!p.drag) return;
            const now = typeof performance !== "undefined" ? performance.now() : Date.now();
            const wasClick = !p.drag.moved && now - p.drag.startTime < 300;
            if (wasClick && p.drag.button === 0 && !p.drag.mode.includes("pan")) {
                this._workshopRaycastSelection(event.clientX, event.clientY);
            }
            p.drag = null;
        };
        const onWheel = (event) => {
            event.preventDefault();
            // V8.03: stopPropagation damit Drawer-Scroll-Wrapper das Wheel
            // NICHT mitfängt — sonst zoomt nicht der Canvas, sondern der Drawer.
            event.stopPropagation();
            const factor = event.deltaY > 0 ? 1.12 : 0.89;
            const oldDist = p.orbit.dist;
            // K05 — der Zoom lebt in [0,5·R; 30·R] der Gestalt (vorher absolut 1,5–60 m: ein Messer blieb ein Punkt);
            // ohne Gestalt gibt es nichts zu zoomen. Der Spieler-Zoom beendet das Mitgehen des Rahmens mit dem Canvas.
            const R = p.rahmen ? p.rahmen.R : 0;
            if (!(R > 0)) return;
            p.rahmen.auto = false;
            const newDist = Math.max(0.5 * R, 4 * p.camera.near, Math.min(30 * R, oldDist * factor));
            const actualFactor = newDist / oldDist;
            // Zoom-zum-Cursor: Welt-Punkt unter dem Cursor (Schnitt mit der Ebene y = target.y), target anteilig
            // dorthin schieben. Trifft der Ray die Ebene nicht (Top-Down), bleibt der dist-Zoom.
            const worldPoint = this._workshopWorldPointAtCursor(event.clientX, event.clientY);
            if (worldPoint) {
                // target wandert anteilig auf worldPoint zu beim Reinzoomen
                // (actualFactor < 1) bzw. davon weg beim Rauszoomen (>1).
                const t = 1 - actualFactor;
                p.orbit.target.addScaledVector(worldPoint.sub(p.orbit.target), t);
            }
            p.orbit.dist = newDist;
            p.dirty = true;
        };
        p.canvas.addEventListener("mousedown", onDown);
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        // capture:true damit der Drawer-Scroll-Container das Wheel NICHT vor
        // uns sieht (zweite Verteidigung neben overscroll-behavior).
        p.canvas.addEventListener("wheel", onWheel, { passive: false, capture: true });
        p.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
        p.listenersInstalled = true;
    }

    // Helper: Welt-Punkt unter dem Cursor (horizontale Ebene durch target.y).
    // Liefert null wenn der Ray die Ebene nicht trifft (z. B. parallele Sicht).
    _workshopWorldPointAtCursor(clientX, clientY) {
        const ws = this._ensureWorkshopState();
        if (!ws.preview) return null;
        const p = ws.preview;
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -p.orbit.target.y);
        return this._workshopRaycastPlane(clientX, clientY, plane);
    }

    // Raycast gegen Gizmo-Handles. Liefert {mode, axis} bei Hit, sonst null.
    // Wird nur ausgewertet wenn Gizmo sichtbar ist (Selection vorhanden + Mode-
    // Sub-Group aktiv).
    _workshopRaycastGizmo(clientX, clientY) {
        const ws = this._ensureWorkshopState();
        if (!ws.preview || !ws.preview.gizmo || !ws.preview.gizmo.visible) return null;
        const p = ws.preview;
        const bp = this.state.blueprints[ws.selectedBlueprint];
        if (!bp || bp.builtIn) return null; // Built-ins haben kein nutzbares Gizmo
        const rect = p.canvas.getBoundingClientRect();
        // V18.37 — robust gegen ein 0×0-Layout-Rect (versteckter Drawer) → Backing-Store-Fallback.
        const rw = rect.width || p.canvas.width || 1;
        const rh = rect.height || p.canvas.height || 1;
        const ndcX = ((clientX - rect.left) / rw) * 2 - 1;
        const ndcY = -((clientY - rect.top) / rh) * 2 + 1;
        // V18.37 — die Kamera-Matrizen aktualisieren, BEVOR der Ray gebaut wird: bei pausiertem
        // Preview-RAF (Drawer geschlossen) ist matrixWorld sonst stale → falscher/paralleler Ray.
        p.camera.updateMatrixWorld();
        p.raycaster.setFromCamera({ x: ndcX, y: ndcY }, p.camera);
        // Nur die Meshes der aktiven Mode-Sub-Group raycasten
        const mode = ws.manipulatorMode;
        const candidates = [];
        for (const [mesh, info] of p.gizmoMeshes) {
            if (info.mode === mode) candidates.push(mesh);
        }
        if (candidates.length === 0) return null;
        const hits = p.raycaster.intersectObjects(candidates, false);
        if (hits.length === 0) return null;
        const info = p.gizmoMeshes.get(hits[0].object);
        return info ? { mode: info.mode, axis: info.axis } : null;
    }

    // Raycast: Bildschirm-Koordinaten → NDC → Three.js-Raycaster → erstes
    // getroffenes Sub-Mesh → partIdx via partMeshes-Map.
    _workshopRaycastSelection(clientX, clientY) {
        const ws = this._ensureWorkshopState();
        if (!ws.preview || !ws.preview.currentMesh) return;
        const p = ws.preview;
        const rect = p.canvas.getBoundingClientRect();
        // V18.37 — robust gegen ein 0×0-Layout-Rect (versteckter Drawer) → Backing-Store-Fallback.
        const rw = rect.width || p.canvas.width || 1;
        const rh = rect.height || p.canvas.height || 1;
        const ndcX = ((clientX - rect.left) / rw) * 2 - 1;
        const ndcY = -((clientY - rect.top) / rh) * 2 + 1;
        // V18.37 — die Kamera-Matrizen aktualisieren, BEVOR der Ray gebaut wird: bei pausiertem
        // Preview-RAF (Drawer geschlossen) ist matrixWorld sonst stale → falscher/paralleler Ray.
        p.camera.updateMatrixWorld();
        p.raycaster.setFromCamera({ x: ndcX, y: ndcY }, p.camera);
        const meshes = Array.from(p.partMeshes.keys());
        if (meshes.length === 0) return;
        const hits = p.raycaster.intersectObjects(meshes, false);
        let hitIdx = null;
        if (hits.length > 0) {
            const hitMesh = hits[0].object;
            const idx = p.partMeshes.get(hitMesh);
            if (typeof idx === "number") hitIdx = idx;
        }
        // M1(b) (V18.156) — der ANKER-FACE-PICK hat höchsten Vorrang: nach der
        // Anker-Kachel wählt DIESER Klick die Stelle auf dem Part (Face-Snap).
        if (ws.anchorPick) {
            this._workshopHandleAnchorPick(hits.length > 0 ? hits[0] : null, hitIdx);
            return;
        }
        // V8.02 Phase 3b — Connect-Modus hat Vorrang über Selection-Update.
        // Klick auf Part im Connect-Modus → zählt als Connect-Schritt (Source
        // oder Target), nicht als normaler Selection-Wechsel.
        if (ws.manipulatorMode === "connect") {
            this._workshopHandleConnectClick(hitIdx);
            return;
        }
        if (hitIdx !== null) {
            this._workshopSetSelection(hitIdx);
        } else {
            this._workshopSetSelection(null);
        }
    }

    // Mutations-Pfad: setzt selectedPartIdx + triggert Re-Render des DOM
    // (Part-Row-Highlight) + Re-Render der Preview (Mesh-Tint).
    _workshopSetSelection(idx) {
        const ws = this._ensureWorkshopState();
        // Validierung: idx muss null oder gültig sein
        if (idx !== null) {
            const bp = this.state.blueprints[ws.selectedBlueprint];
            if (!bp || !Array.isArray(bp.parts) || idx < 0 || idx >= bp.parts.length) {
                idx = null;
            }
        }
        if (ws.selectedPartIdx === idx) return;
        ws.selectedPartIdx = idx;
        if (ws.preview) ws.preview.dirty = true;
        // V17.91 — die Selektion lebt im 3D (Mesh-Highlight via preview.dirty) + im „Part entfernen"-Knopf-
        // Status; der alte Part-Row-Listen-Refresh entfiel mit dem Detail-Editor.
        if (typeof document !== "undefined" && typeof this._workshopUpdateManipulatorButtons === "function") {
            this._workshopUpdateManipulatorButtons();
        }
    }

    // === Manipulator-Gizmo + Drag ===
    // translate (Pfeile) · rotate (Ringe) · scale (Würfel); Achse greifen → Part-Mutation in
    // Welt-Achsen. Snap: translate 0.5, rotate 15°, scale 0.1. W/E/R = Modus, G = Snap. Eigene
    // 1D-Achsen-Projektion über eine Drag-Plane (TransformControls/examples/jsm ist nicht im Bundle).

    // Konstanten für Gizmo-Aufbau. Farben sind kontrastreich gegen den
    // dunklen Preview-Hintergrund (#1a140a). Achsen-Konvention: X=rot,
    // Y=grün, Z=blau (Standard 3D-Editor + Three.js AxesHelper).
    static get WORKSHOP_GIZMO_COLORS() {
        return this._einmal(
            "WORKSHOP_GIZMO_COLORS",
            Object.freeze({ x: 0xff5566, y: 0x66dd77, z: 0x5599ff, center: 0xffe066 })
        );
    }
    static get WORKSHOP_SNAP_TRANSLATE() {
        return 0.5;
    }
    static get WORKSHOP_SNAP_ROTATE() {
        return Math.PI / 12;
    } // 15°
    static get WORKSHOP_SNAP_SCALE() {
        return 0.1;
    }
    static get WORKSHOP_MIN_PART_SIZE() {
        return 0.05;
    }

    // Baut die Gizmo-Hierarchie EINMAL (Sub-Groups translate/rotate/scale, je drei Achs-Handles);
    // Position, Skala und Sichtbarkeit setzt _workshopSyncGizmo.
    _workshopBuildGizmo() {
        const ws = this._ensureWorkshopState();
        if (!ws.preview) return;
        const p = ws.preview;
        if (p.gizmo) return; // idempotent

        const COLORS = AnazhRealm.WORKSHOP_GIZMO_COLORS;
        const matFor = (color) =>
            new THREE.MeshBasicMaterial({
                color,
                depthTest: false,
                depthWrite: false,
                transparent: true,
                opacity: 0.95,
                side: THREE.DoubleSide,
            });

        const root = new THREE.Group();
        root.renderOrder = 999;
        root.visible = false; // versteckt bis Selection da ist

        // Picker-Material: unsichtbar, aber raycast-trefferbar (großzügige Hit-Boxen um schlanke Visuals).
        // colorWrite:false — auch bei depthTest:false kein Beitrag zu Farbe/Depth.
        const matPicker = () =>
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                visible: false,
                depthTest: false,
                depthWrite: false,
                transparent: true,
                opacity: 0,
            });

        // --- Translate-Gizmo: drei Achs-Pfeile mit großzügigen Pickern ---
        const tGroup = new THREE.Group();
        tGroup.name = "translate";
        const buildArrow = (color, axis) => {
            const grp = new THREE.Group();
            const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 12), matFor(color));
            shaft.position.y = 0.45;
            const tip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.26, 16), matFor(color));
            tip.position.y = 0.93;
            // Picker: viel dicker (radius 0.14), umschließt Schaft + Spitze
            const picker = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.1, 8), matPicker());
            picker.position.y = 0.55;
            grp.add(shaft);
            grp.add(tip);
            grp.add(picker);
            // Achsen-Rotation: Cylinder ist default Y-up, also Y-Pfeil OK.
            if (axis === "x") grp.rotation.z = -Math.PI / 2;
            else if (axis === "z") grp.rotation.x = Math.PI / 2;
            const info = { mode: "translate", axis };
            grp.userData.gizmo = info;
            shaft.userData.gizmo = info;
            tip.userData.gizmo = info;
            picker.userData.gizmo = info;
            p.gizmoMeshes.set(shaft, info);
            p.gizmoMeshes.set(tip, info);
            p.gizmoMeshes.set(picker, info);
            tGroup.add(grp);
            return grp;
        };
        buildArrow(COLORS.x, "x");
        buildArrow(COLORS.y, "y");
        buildArrow(COLORS.z, "z");
        root.add(tGroup);

        // --- Rotate-Gizmo: drei Torus-Ringe mit großzügigen Pickern ---
        const rGroup = new THREE.Group();
        rGroup.name = "rotate";
        const buildRing = (color, axis) => {
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.03, 8, 48), matFor(color));
            // Picker: Torus mit deutlich dickerem Tube-Radius (0.09)
            const picker = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.09, 6, 32), matPicker());
            if (axis === "x") {
                ring.rotation.y = Math.PI / 2;
                picker.rotation.y = Math.PI / 2;
            } else if (axis === "y") {
                ring.rotation.x = Math.PI / 2;
                picker.rotation.x = Math.PI / 2;
            }
            // Z: Default-Lage des Torus (in xy-Ebene)
            const info = { mode: "rotate", axis };
            ring.userData.gizmo = info;
            picker.userData.gizmo = info;
            p.gizmoMeshes.set(ring, info);
            p.gizmoMeshes.set(picker, info);
            rGroup.add(ring);
            rGroup.add(picker);
        };
        buildRing(COLORS.x, "x");
        buildRing(COLORS.y, "y");
        buildRing(COLORS.z, "z");
        root.add(rGroup);

        // --- Scale-Gizmo: drei Achs-Würfel + Zentral-Würfel mit Pickern ---
        const sGroup = new THREE.Group();
        sGroup.name = "scale";
        const buildCube = (color, axis) => {
            const cube = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.15), matFor(color));
            const picker = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.26), matPicker());
            if (axis === "x") {
                cube.position.x = 0.7;
                picker.position.x = 0.7;
            } else if (axis === "y") {
                cube.position.y = 0.7;
                picker.position.y = 0.7;
            } else if (axis === "z") {
                cube.position.z = 0.7;
                picker.position.z = 0.7;
            }
            // Schaft als dünner Cylinder vom Center bis zum Würfel (Visual-Anker)
            const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.7, 8), matFor(color));
            shaft.position.set(0, 0.35, 0);
            if (axis === "x") {
                shaft.rotation.z = -Math.PI / 2;
                shaft.position.set(0.35, 0, 0);
            } else if (axis === "z") {
                shaft.rotation.x = Math.PI / 2;
                shaft.position.set(0, 0, 0.35);
            }
            const info = { mode: "scale", axis };
            cube.userData.gizmo = info;
            shaft.userData.gizmo = info;
            picker.userData.gizmo = info;
            p.gizmoMeshes.set(cube, info);
            p.gizmoMeshes.set(shaft, info);
            p.gizmoMeshes.set(picker, info);
            sGroup.add(cube);
            sGroup.add(shaft);
            sGroup.add(picker);
        };
        buildCube(COLORS.x, "x");
        buildCube(COLORS.y, "y");
        buildCube(COLORS.z, "z");
        // Zentral-Würfel = uniform-scale (axis === "uniform")
        const center = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), matFor(COLORS.center));
        const centerPicker = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), matPicker());
        const uniformInfo = { mode: "scale", axis: "uniform" };
        center.userData.gizmo = uniformInfo;
        centerPicker.userData.gizmo = uniformInfo;
        p.gizmoMeshes.set(center, uniformInfo);
        p.gizmoMeshes.set(centerPicker, uniformInfo);
        sGroup.add(center);
        sGroup.add(centerPicker);
        root.add(sGroup);

        p.scene.add(root);
        p.gizmo = root;
    }

    // Sync vor jedem Render: Position auf selected part (oder hide wenn keine
    // Selection), Distance-Scale damit Gizmo konstant ~10% Canvas-Höhe bleibt,
    // Sub-Group-Sichtbarkeit aus manipulatorMode.
    _workshopSyncGizmo() {
        const ws = this._ensureWorkshopState();
        if (!ws.preview || !ws.preview.gizmo) return;
        const p = ws.preview;
        const bp = this.state.blueprints[ws.selectedBlueprint];
        const idx = ws.selectedPartIdx;
        if (!bp || idx === null || idx < 0 || idx >= bp.parts.length) {
            p.gizmo.visible = false;
            return;
        }
        // Built-in-Baupläne sind read-only → Gizmo VERSTECKEN, nicht zeigen und intern ablehnen (sonst
        // fällt der Griff unsichtbar auf Orbit durch).
        if (bp.builtIn) {
            p.gizmo.visible = false;
            return;
        }
        const part = bp.parts[idx];
        if (!part || !part.position) {
            p.gizmo.visible = false;
            return;
        }
        p.gizmo.visible = true;
        p.gizmo.position.set(part.position.x || 0, part.position.y || 0, part.position.z || 0);
        // Distance-Scale: die Griffe halten ihre Schirm-Größe (∝ Abstand); der 0,4-m-Boden fiel mit dem 3-m-Rahmen (K05).
        const s = p.orbit.dist * 0.18;
        p.gizmo.scale.setScalar(s);
        // Sub-Group-Visibility nach Mode
        const mode = ws.manipulatorMode;
        for (const child of p.gizmo.children) {
            child.visible = child.name === mode;
        }
    }

    // Drag-Start auf einem Gizmo-Handle. Capture initial Part-State + 3D-
    // Maus-Position (auf der Drag-Plane). Setzt dragManipulator-State.
    _workshopBeginManipulation(mode, axis, clientX, clientY) {
        const ws = this._ensureWorkshopState();
        if (!ws.preview) return;
        const p = ws.preview;
        // Canvas-Größe + Aspect VOR dem Raycast syncen — wird manipuliert, bevor der RAF gesynct hat, ist
        // camera.aspect sonst stale und der Ray verfehlt die Ebene. Idempotent.
        this._workshopSyncCanvasSize();
        const idx = ws.selectedPartIdx;
        if (idx === null) return;
        const bp = this.state.blueprints[ws.selectedBlueprint];
        if (!bp || bp.builtIn) return; // Built-ins read-only
        const part = bp.parts[idx];
        if (!part) return;

        // Snapshot des Part-State vor Drag (für inkrementelle Anwendung)
        const startPart = {
            position: { x: part.position.x || 0, y: part.position.y || 0, z: part.position.z || 0 },
            rotation: {
                x: (part.rotation && part.rotation.x) || 0,
                y: (part.rotation && part.rotation.y) || 0,
                z: (part.rotation && part.rotation.z) || 0,
            },
            size: {
                x: (part.size && part.size.x) || 1,
                y: (part.size && part.size.y) || 1,
                z: (part.size && part.size.z) || 1,
            },
        };

        // Drag-Plane: für translate + scale ist Pivot = Part-Position, Normale
        // wird kameranah gewählt (siehe _workshopAxisDragPlaneNormal). Für
        // rotate ist Pivot = Part-Position, Normale = die rotierte Achse.
        const pivot = new THREE.Vector3(startPart.position.x, startPart.position.y, startPart.position.z);
        const axisVec = this._workshopAxisToVec3(axis);
        let planeNormal;
        if (mode === "rotate") {
            planeNormal = axisVec.clone(); // Rotation passiert IN der Ebene senkrecht zur Achse
        } else {
            planeNormal = this._workshopAxisDragPlaneNormal(axisVec, p.camera);
        }
        const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, pivot);

        const startIntersect = this._workshopRaycastPlane(clientX, clientY, plane);
        if (!startIntersect) return; // Kamera-Ray parallel zur Ebene — selten

        // Für rotate: Start-Winkel um Pivot
        let startAngle = 0;
        if (mode === "rotate") {
            const v = startIntersect.clone().sub(pivot);
            // Project on plane perpendicular to axisVec → use two reference axes
            const refU = this._workshopAxisPerpendicular(axisVec);
            const refV = axisVec.clone().cross(refU).normalize();
            startAngle = Math.atan2(v.dot(refV), v.dot(refU));
        }

        // Kontakt-Schnappschuss VOR dem Drag: die Auto-Verbindung am Drag-Ende zählt nur ÜBERGÄNGE — ein
        // ruhender Kontakt (z. B. nach „✂ Lösen“) bleibt still. Die ganze Geste ist EIN Undo-Schritt.
        this._recordBlueprintEdit(bp.name);
        p.dragManipulator = {
            mode,
            axis,
            startPart,
            pivot,
            axisVec,
            plane,
            startIntersect,
            startAngle,
            startClientX: clientX,
            startClientY: clientY,
            touchesBefore: this._workshopTouchesOf(bp, idx),
        };
    }

    // Drag-Frame: berechne Delta entlang Achse + wende auf Part an.
    // Live-Mesh-Update OHNE Rebuild (Geometrie bleibt, mesh.position/scale
    // werden direkt gesetzt). Volle Rebuild kommt im End-Pfad.
    _workshopApplyManipulation(clientX, clientY) {
        const ws = this._ensureWorkshopState();
        if (!ws.preview || !ws.preview.dragManipulator) return;
        const p = ws.preview;
        const m = p.dragManipulator;
        const bp = this.state.blueprints[ws.selectedBlueprint];
        if (!bp) return;
        const part = bp.parts[ws.selectedPartIdx];
        if (!part) return;
        const intersect = this._workshopRaycastPlane(clientX, clientY, m.plane);
        if (!intersect) return;

        if (m.mode === "translate") {
            const delta = intersect.clone().sub(m.startIntersect);
            const along = delta.dot(m.axisVec); // signed Welt-Einheiten entlang Achse
            let newVal = m.startPart.position[m.axis] + along;
            newVal = this._workshopApplySnap(newVal, "translate");
            part.position[m.axis] = newVal;
        } else if (m.mode === "rotate") {
            const v = intersect.clone().sub(m.pivot);
            const refU = this._workshopAxisPerpendicular(m.axisVec);
            const refV = m.axisVec.clone().cross(refU).normalize();
            const curAngle = Math.atan2(v.dot(refV), v.dot(refU));
            let delta = curAngle - m.startAngle;
            // Winkel-Normalisierung (kein 360°-Sprung)
            while (delta > Math.PI) delta -= 2 * Math.PI;
            while (delta < -Math.PI) delta += 2 * Math.PI;
            let newVal = m.startPart.rotation[m.axis] + delta;
            newVal = this._workshopApplySnap(newVal, "rotate");
            part.rotation[m.axis] = newVal;
        } else if (m.mode === "scale") {
            if (m.axis === "uniform") {
                // Center-Würfel: Delta entlang der Bildschirm-Y-Achse als
                // intuitive Scale-Geste (hoch=größer, runter=kleiner).
                const dy = m.startClientY - clientY;
                const factor = Math.max(0.05, 1 + dy * 0.01);
                for (const ax of ["x", "y", "z"]) {
                    let v = m.startPart.size[ax] * factor;
                    v = Math.max(AnazhRealm.WORKSHOP_MIN_PART_SIZE, v);
                    v = this._workshopApplySnap(v, "scale");
                    part.size[ax] = v;
                }
            } else {
                const delta = intersect.clone().sub(m.startIntersect);
                const along = delta.dot(m.axisVec);
                let v = m.startPart.size[m.axis] + along;
                v = Math.max(AnazhRealm.WORKSHOP_MIN_PART_SIZE, v);
                v = this._workshopApplySnap(v, "scale");
                part.size[m.axis] = v;
            }
        }

        // Live-Mesh-Update: für translate + rotate genügt mesh.position/rotation
        // setzen. Für scale müssen wir die Geometrie skalieren (relativ zum
        // start), weil _makePartGeometry die size in die Geometrie baked.
        const sub = this._workshopFindMeshForPartIdx(ws.selectedPartIdx);
        if (sub) {
            if (part.position) sub.position.set(part.position.x, part.position.y, part.position.z);
            if (part.rotation) sub.rotation.set(part.rotation.x, part.rotation.y, part.rotation.z);
            if (m.mode === "scale") {
                // Approximation: mesh.scale relativ zu Start-Size.
                const sx = part.size.x / m.startPart.size.x;
                const sy = part.size.y / m.startPart.size.y;
                const sz = part.size.z / m.startPart.size.z;
                sub.scale.set(sx, sy, sz);
            }
        }
        p.dirty = true;
    }

    // Drag-Ende: voller Rebuild für saubere Geometrie + DOM-Inputs syncen.
    _workshopEndManipulation() {
        const ws = this._ensureWorkshopState();
        if (!ws.preview || !ws.preview.dragManipulator) return;
        const m = ws.preview.dragManipulator;
        ws.preview.dragManipulator = null;
        // AUTO-VERBINDUNG: berührt das bewegte Part jetzt ein anderes (vorher nicht), entsteht die
        // Verbindung; Getrenntes löst auto-Geborenes. Gilt für translate/rotate/scale.
        const bp = this.state.blueprints[ws.selectedBlueprint];
        if (bp && !bp.builtIn && ws.selectedPartIdx !== null) {
            this._workshopLogAutoConnect(this._workshopAutoConnect(bp, ws.selectedPartIdx, m.touchesBefore));
        }
        // Mesh + Number-Inputs sind möglicherweise out-of-sync (Live-Update war
        // approximativ). Volle Rebuild + DOM-Render: kostet einmalig, lohnt sich.
        this._renderWorkshopDOM();
    }

    // Snap-Helper: rundet Wert auf nächstes Snap-Multiple je Mode.
    _workshopApplySnap(value, mode) {
        const ws = this._ensureWorkshopState();
        if (!ws.snapEnabled) return value;
        let step;
        if (mode === "translate") step = AnazhRealm.WORKSHOP_SNAP_TRANSLATE;
        else if (mode === "rotate") step = AnazhRealm.WORKSHOP_SNAP_ROTATE;
        else if (mode === "scale") step = AnazhRealm.WORKSHOP_SNAP_SCALE;
        else return value;
        return Math.round(value / step) * step;
    }

    // Helper: Achs-Name → Welt-Vektor
    _workshopAxisToVec3(axis) {
        if (axis === "x") return new THREE.Vector3(1, 0, 0);
        if (axis === "y") return new THREE.Vector3(0, 1, 0);
        if (axis === "z") return new THREE.Vector3(0, 0, 1);
        return new THREE.Vector3(1, 0, 0);
    }

    // Helper: irgendeine Achse senkrecht zur gegebenen (für Rotation-Polar-Koord)
    _workshopAxisPerpendicular(axisVec) {
        // Y-Achse als Default-Ref, außer wenn axis ≈ Y → Z nehmen.
        const ref = Math.abs(axisVec.y) > 0.9 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0);
        return ref
            .clone()
            .sub(axisVec.clone().multiplyScalar(ref.dot(axisVec)))
            .normalize();
    }

    // Helper: gute Drag-Plane-Normale für eine Welt-Achse. Wir nehmen die
    // Camera-Forward-Komponente, die senkrecht zur Achse liegt — so steht die
    // Drag-Ebene am steilsten zur Camera und Maus-Bewegung mapped natürlich.
    _workshopAxisDragPlaneNormal(axisVec, camera) {
        const camForward = new THREE.Vector3();
        camera.getWorldDirection(camForward);
        // Projektion auf Ebene senkrecht zur Achse
        const proj = camForward.clone().sub(axisVec.clone().multiplyScalar(camForward.dot(axisVec)));
        if (proj.lengthSq() < 0.001) {
            // Camera schaut direkt entlang der Achse — degeneriert. Fallback.
            return Math.abs(axisVec.y) > 0.9 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0);
        }
        return proj.normalize();
    }

    // Helper: Raycast in NDC → Plane-Intersect (3D).
    _workshopRaycastPlane(clientX, clientY, plane) {
        const ws = this._ensureWorkshopState();
        if (!ws.preview) return null;
        const p = ws.preview;
        const rect = p.canvas.getBoundingClientRect();
        // V18.37 — robust gegen ein 0×0-Layout-Rect (versteckter Drawer) → Backing-Store-Fallback.
        const rw = rect.width || p.canvas.width || 1;
        const rh = rect.height || p.canvas.height || 1;
        const ndcX = ((clientX - rect.left) / rw) * 2 - 1;
        const ndcY = -((clientY - rect.top) / rh) * 2 + 1;
        // V18.37 — die Kamera-Matrizen aktualisieren, BEVOR der Ray gebaut wird: bei pausiertem
        // Preview-RAF (Drawer geschlossen) ist matrixWorld sonst stale → falscher/paralleler Ray.
        p.camera.updateMatrixWorld();
        p.raycaster.setFromCamera({ x: ndcX, y: ndcY }, p.camera);
        const target = new THREE.Vector3();
        const hit = p.raycaster.ray.intersectPlane(plane, target);
        return hit;
    }

    // Helper: finde Sub-Mesh für gegebene partIdx (reverse-lookup in partMeshes-Map).
    _workshopFindMeshForPartIdx(idx) {
        const ws = this._ensureWorkshopState();
        if (!ws.preview) return null;
        for (const [mesh, i] of ws.preview.partMeshes) {
            if (i === idx) return mesh;
        }
        return null;
    }

    // Public: Mode wechseln (translate/rotate/scale/connect).
    setWorkshopManipulatorMode(mode) {
        if (!["translate", "rotate", "scale", "connect"].includes(mode)) return false;
        const ws = this._ensureWorkshopState();
        if (ws.manipulatorMode === mode) return true;
        ws.manipulatorMode = mode;
        // Beim Modus-Wechsel: Connect-Pending-State + Popover schließen.
        ws.connectFirstPartIdx = null;
        this._workshopCloseConnectPopover();
        if (ws.preview) ws.preview.dirty = true;
        this._workshopUpdateManipulatorButtons();
        return true;
    }

    // Public: Snap-Toggle.
    toggleWorkshopSnap(enabled) {
        const ws = this._ensureWorkshopState();
        ws.snapEnabled = typeof enabled === "boolean" ? enabled : !ws.snapEnabled;
        this._workshopUpdateManipulatorButtons();
        return ws.snapEnabled;
    }

    // CAD-Kamera zurück: orbit.target = BBox-Center, dist = der Rahmen aus dem Kamerawinkel (`_workshopRahmen`).
    // Shortcut H.
    resetWorkshopCamera() {
        // H tut EXAKT dasselbe wie ein Bauplan-Wechsel: Mesh frisch + Kamera zentriert (Edits bleiben in
        // bp.parts). _distInitialized zurücksetzen — sonst behält der Rebuild den alten Zoom.
        const p = this.state.workshop && this.state.workshop.preview;
        if (!p) return;
        // Yaw/Pitch zurück auf neutrale Werkstatt-Sicht (PI/4 schräg, 0.3 oben) — VOR dem Rebuild: der Rahmen
        // rechnet aus diesem Winkel (K05).
        p.orbit.yaw = Math.PI / 4;
        p.orbit.pitch = 0.3;
        // Reset dist-Flag → Rebuild rahmt die Gestalt neu.
        p._distInitialized = false;
        if (typeof this._workshopRebuildPreviewMesh === "function") {
            this._workshopRebuildPreviewMesh();
        }
        p.dirty = true;
        this.log("CAD-Kamera zentriert", "INFO");
    }

    // UI-Sync: Modus-Buttons + Snap-Toggle in der Werkstatt.
    _workshopUpdateManipulatorButtons() {
        if (typeof document === "undefined") return;
        const ws = this._ensureWorkshopState();
        const modeBar = document.getElementById("workshop-mode-bar");
        if (modeBar) {
            const buttons = modeBar.querySelectorAll("[data-workshop-mode]");
            buttons.forEach((btn) => {
                const mode = btn.getAttribute("data-workshop-mode");
                btn.classList.toggle("active", mode === ws.manipulatorMode);
            });
        }
        const snapBtn = document.getElementById("workshop-snap-toggle");
        if (snapBtn) {
            snapBtn.classList.toggle("active", ws.snapEnabled);
            snapBtn.textContent = ws.snapEnabled ? "Snap" : "frei";
        }
        // Read-only-Banner: sichtbar bei Built-in-Bauplan, sonst versteckt.
        // Plus Mode-Bar disable wenn Built-in (visuell + klick-wirkungslos).
        const banner = document.getElementById("workshop-readonly-banner");
        const bp = this.state.blueprints[ws.selectedBlueprint];
        const isBuiltIn = bp && bp.builtIn === true;
        if (banner) banner.hidden = !isBuiltIn;
        if (modeBar) {
            // Bei built-in nur Mode-Buttons + Snap-Toggle deaktivieren; Klonen/Neu bleiben aktiv (sie brauchen
            // keinen schreibfähigen Kontext).
            const editableBtns = modeBar.querySelectorAll("[data-workshop-mode], #workshop-snap-toggle");
            editableBtns.forEach((btn) => {
                btn.disabled = isBuiltIn;
                btn.style.opacity = isBuiltIn ? "0.45" : "";
            });
            // Action-Buttons (Klonen, Neu) immer enabled
            const actionBtns = modeBar.querySelectorAll(".workshop-action-btn");
            actionBtns.forEach((btn) => {
                btn.disabled = false;
                btn.style.opacity = "";
            });
        }
        // V8.02 Phase 3a — Shape-Palette ebenfalls disable bei Built-in
        const palette = document.getElementById("workshop-shape-palette");
        if (palette) {
            const cards = palette.querySelectorAll(".workshop-shape-card");
            cards.forEach((card) => {
                if (isBuiltIn) {
                    card.setAttribute("draggable", "false");
                    card.style.opacity = "0.4";
                    card.style.cursor = "not-allowed";
                } else {
                    card.setAttribute("draggable", "true");
                    card.style.opacity = "";
                    card.style.cursor = "";
                }
            });
        }
        // V8.05 — Del-Button: enabled nur wenn ein Part selektiert + bp eigen
        const delBtn = document.getElementById("workshop-delete-selected-part");
        if (delBtn) {
            const hasSel =
                !isBuiltIn &&
                ws.selectedPartIdx !== null &&
                ws.selectedPartIdx !== undefined &&
                bp &&
                Array.isArray(bp.parts) &&
                ws.selectedPartIdx < bp.parts.length;
            delBtn.disabled = !hasSel;
        }
    }

    // V8.05 — Stats-Panel rendert die emergenten Compound-Tags + Rolle
    // + Affordances direkt unter dem Canvas. Spieler sieht beim Bauen
    // sofort was räumlich + tag-mäßig passiert.
    _workshopRenderStatsPanel() {
        if (typeof document === "undefined") return;
        const panel = document.getElementById("workshop-stats-panel");
        if (!panel) return;
        const az = document.getElementById("workshop-action-zone");
        const ws = this._ensureWorkshopState();
        const bp = this.state.blueprints[ws.selectedBlueprint];
        panel.innerHTML = "";
        if (az) az.innerHTML = "";
        if (!bp) return;
        // SPEC-SHEET mit Hierarchie: Identität (Header) → Bauplan-FINGERABDRUCK (Material-Profil +
        // Rollen-Resonanz als Balken aus compound-tags/_blueprintRoleSpectrum) → Preis/Wachstum (Footer).
        this._specRenderHeader(panel, bp); // Identität: Rolle + Fähigkeit · Qualität
        this._specRenderBody(panel, bp); // 2 Spalten: Material-Profil (Tags) | Rollen-Resonanz + Werte
        this._specRenderFooter(panel, bp); // Preis + (eigene) Wachstum
        // Die MACH-ZONE ist EIN „Werk“-Block: Heading → Signatur (versiegeln) → FERTIGEN. Heading + Signatur
        // für jeden EIGENEN Bauplan; FERTIGEN nur, wenn die Rolle einen Mach-Akt trägt (Station/Portal
        // werden gebaut, nicht gefertigt).
        const machZone = az || panel;
        const role = this._displayRole(bp);
        // M2 — vehicle gehört zur place-Familie: FERTIGEN führt es wie jedes Bauwerk in den Bau-Modus (Phantom +
        // confirmBuild, Welle L Folge).
        const canMake = !(role === "workshop-station" || role === "portal" || (role === "soul" && bp.builtIn));
        if (canMake || !bp.builtIn) {
            this._workshopAppendWerkHeading(machZone);
            if (!bp.builtIn) this._workshopAppendSignatureRow(machZone, bp, ws);
            if (canMake) this._workshopAppendFertigenRow(machZone, bp);
            this._teilenZeile(machZone, "werk", () => this.teileWerk(bp.name));
            // M5 (V18.157, Befund 17) — das UMWIDMEN gehört der WERKSTATT.
            if (!bp.builtIn) this._workshopAppendUmwidmenRow(machZone, bp);
        }
        // W-A1 — der innerHTML-Wipe oben nahm auch die Status-Zeile mit: neu synchronisieren
        // (die EINE Quelle `_workshopStudioStatusSync`, ehrliches Interim „Studio-Asset lädt…").
        this._workshopStudioStatusSync();
    }

    // Die Rolle fixt der PROZESS (applyOp/Station); hier nur die drei NICHT-emergenten Intent-Akte:
    // Portal-ZIEL · Werkstatt-DESIGNATION (Forge und Bauwerk sind Substanz-Zwillinge, der Zweck trennt)
    // · ✨ Emergent-Reset. Jede Geste trägt ihren Warum-Satz und re-rendert.
    // setBlueprintAsArmor/AsConsumable bleiben als DSL/Chat-Gesten.
    _workshopAppendUmwidmenRow(zone, bp) {
        if (!zone || !bp || bp.builtIn || typeof document === "undefined") return;
        const row = document.createElement("div");
        row.className = "stat-row workshop-umwidmen-row";
        const label = document.createElement("span");
        label.className = "stat-label";
        label.textContent = "Intent";
        label.title =
            "Die ROLLE fixt der Prozess (Werkzeug auf den Part ziehen). Hier leben nur die drei Akte, die KEIN Prozess ableiten kann: Ziel, Zweck, Loslassen.";
        row.appendChild(label);
        const acts = document.createElement("span");
        acts.className = "workshop-umwidmen-acts";
        const refresh = () => this._renderWorkshopDOM();
        const mkBtn = (text, title, fn) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "workshop-umwidmen-btn";
            btn.textContent = text;
            btn.title = title;
            btn.addEventListener("click", () => {
                const res = fn();
                if (res && res.ok === false) this.log(`Intent: ${res.reason}`, "ERROR");
                refresh();
            });
            acts.appendChild(btn);
            return btn;
        };
        // Portal: Ziel-Welt wählen + richten (W12 — der spieler-erreichbare Pfad).
        const portalSel = document.createElement("select");
        portalSel.className = "equip-portal-select";
        for (const wid of Object.keys(AnazhRealm.WORLD_REGISTRY)) {
            const wOpt = document.createElement("option");
            wOpt.value = wid;
            wOpt.textContent = AnazhRealm.WORLD_REGISTRY[wid].label;
            portalSel.appendChild(wOpt);
        }
        mkBtn(
            "Portal →",
            "Das ZIEL ist Wille, keine Substanz: auf die gewählte Welt richten — das Werk wird ein Tor.",
            () => this.aimBlueprintAtWorld(bp.name, portalSel.value)
        );
        acts.appendChild(portalSel);
        mkBtn(
            "⚒ Station",
            "Der ZWECK ist Wille: dieses Bauwerk DIENT als Werkstatt (Esse/Brennkolben-Zwilling) — die bediente Domäne emergiert aus seiner Substanz.",
            () => this.setBlueprintAsWorkshopStation(bp.name)
        );
        mkBtn("✨ Emergent", "LOSLASSEN: Markierung lösen — die Rolle emergiert wieder aus der Substanz.", () =>
            this.resetBlueprintRole(bp.name)
        );
        row.appendChild(acts);
        zone.appendChild(row);
    }

    // Step 1 — das „Werk"-Heading der Mach-Zone: ein echtes Heading (Cinzel), nicht der
    // winzige stat-label, der vorher in der FERTIGEN-Zeile saß (§A-1: kein stat-label fürs
    // Heading). Es überschreibt den Signatur+FERTIGEN-Block als EINE Werk-Einheit.
    _workshopAppendWerkHeading(zone) {
        if (!zone || typeof document === "undefined") return;
        const h = document.createElement("div");
        h.className = "workshop-werk-heading";
        h.textContent = "Werk";
        zone.appendChild(h);
    }

    // DER EINE FLUSS: FERTIGEN steht als Abschluss in der Stats-Tabelle (wo die Rolle kristallisiert),
    // nicht als paralleler ⚒-Knopf. Rollen-bewusst über fertigeBlueprint/embodyBlueprint; in pfad zeigt
    // der Knopf, welche Werkstatt (Esse/Brennkolben) nah sein muss.
    _workshopAppendFertigenRow(panel, bp) {
        // V17.85 — die EMERGENTE/deklarierte Rolle (rollenlose Klinge → „tool", nicht der „architecture"-
        // Default) bestimmt den FERTIGEN-Akt: eine Spitzhacke wird „geschmiedet (in die Hand)", nicht
        // als Bauwerk behandelt — der Mach-Verb folgt der angezeigten Rolle.
        const role = this._displayRole(bp);
        // Station und Portal werden über ihren eigenen Akt gesetzt, eine geborene (built-in) Seele wird nicht geformt. Das
        // Fahrzeug ist ein Bauwerk wie jedes (M2: Phantom + confirmBuild) — FERTIGEN setzt es, wohin der Spieler blickt (Welle
        // L Folge: die Werkstatt hatte für den GT keinen Weg in die Welt; bauen.K1: das Setzen im selben Akt).
        if (role === "workshop-station" || role === "portal") return;
        if (role === "soul" && bp.builtIn) return;
        const isSoul = role === "soul";
        // Ein Bauwerk wird gebaut (fertigeBlueprint → Bau-Modus, Welle L V-k11), ein Gerät geht in die Hand.
        const bauwerk = role !== "armor" && !isSoul && role !== "consumable" && this._isPlaceableBlueprint(bp);
        const verb =
            role === "armor"
                ? "Rüstung weben (tragen)"
                : isSoul
                  ? "Körper formen (verkörpern)"
                  : role === "consumable"
                    ? "Trank brauen (trinken)"
                    : bauwerk
                      ? "Bauen (das Werk steht, wohin du blickst)"
                      : "Gerät schmieden (in die Hand)";
        const row = document.createElement("div");
        row.className = "stat-row workshop-fertigen-row";
        // Step 1 — kein „Werk"-stat-label mehr: das _workshopAppendWerkHeading darüber trägt
        // den Titel der Mach-Zone (§A-1, keine Doublette).
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "workshop-fertigen";
        btn.textContent = "⚒ FERTIGEN";
        btn.title = `${verb} — das reale Werk herstellen: zieht Material (pfad/frieden, frei in schöpfer), friert die Präzision ein, rüstet/wirkt. Re-fertigbar.`;
        btn.addEventListener("click", () => {
            const res = isSoul ? this.embodyBlueprint(bp.name) : this.fertigeBlueprint(bp.name);
            // embodyBlueprint lässt `free` weg, wenn es den freien Verkörpern-Pfad nahm (schon geformt
            // oder schöpfer) → das werten wir als frei.
            const wasFree = res.free === true || (isSoul && res.ok && res.free === undefined);
            if (res.ok) {
                this.log(`Gefertigt: „${bp.label || bp.name}" — ${verb}${wasFree ? " (frei)" : ""}.`, "INFO");
                this._renderWorkshopDOM();
            } else {
                // W-C(a)/R-005 — das Mach-Tor spricht AN DER FERTIGEN-Zeile (derselbe EINE Formatter wie Rüstungs-Slot
                // + Rezeptbuch) und im Spieler-Kanal (Welle L Folge: das Log ist eingeklappt).
                this._showMachTorHint(row, res);
                this._spielerSagt(`${String(bp.label || bp.name).split(/\s[·—(]/)[0]}: ${this._machTorHint(res)}`);
            }
        });
        row.appendChild(btn);
        // die Maschine-in-der-Welt sichtbar (Lebenszyklus + Gate-Status): ist die nötige Werkstatt nah?
        const station = this._makeStationGate(bp.name);
        const hint = document.createElement("span");
        hint.className = "workshop-fertigen-station";
        if (station.ok && station.found) {
            hint.textContent = `⚙ ${this._stationLabelForDomain(station.domain)} nah`;
            hint.title = "Die passende Welt-Werkstatt ist in der Nähe — du kannst hier fertigen.";
        } else if (!station.ok) {
            hint.textContent = `⚙ braucht ${this._stationLabelForDomain(station.neededDomain)}`;
            hint.classList.add("workshop-fertigen-station-missing");
            hint.title = "Im pfad-Modus braucht dieses Werk die passende Welt-Werkstatt in der Nähe.";
        }
        if (hint.textContent) row.appendChild(hint);
        panel.appendChild(row);
    }

    // Das Label der Welt-Werkstatt, die eine Domäne bedient (Esse/Brennkolben/…) — für die
    // FERTIGEN-Station-Hinweise. Fällt auf das Domänen-Label zurück, wenn kein Bauplan passt.
    _stationLabelForDomain(domain) {
        if (!domain) return "Werkstatt";
        for (const b of Object.values(this.state.blueprints || {})) {
            if (b && b.role === "workshop-station" && this._computeWorkshopDomain(b) === domain)
                return b.label || b.name;
        }
        return (AnazhRealm.TOOL_DOMAIN_LABELS && AnazhRealm.TOOL_DOMAIN_LABELS[domain]) || domain;
    }

    // V18.44 — DAS PROFI-SPEC-SHEET (Header/Body/Footer + ein Balken-Primitiv). Liest das BESTEHENDE
    // Vektor-System (computeCompoundTags · _blueprintRoleSpectrum · _blueprintAbilityStats) als gestaltete
    // Daten-Viz — kein neuer Datenpfad, eine synergetische Lesart (Konsum-Disziplin V17.31).
    _specBar(label, frac, valText, levelClass, title) {
        const f = Math.max(0, Math.min(1, frac || 0));
        return this._el(
            "div",
            { class: "spec-bar", title: title || null },
            this._el("span", { class: "spec-bar-label", text: label }),
            this._el(
                "span",
                { class: "spec-bar-track" },
                this._el("span", {
                    class: `spec-bar-fill ${levelClass || ""}`,
                    style: { width: `${Math.round(f * 100)}%` },
                })
            ),
            this._el("span", { class: "spec-bar-val", text: valText })
        );
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_werkstatt_vorschau]);

// ===== ATLAS · Werkstatt/vorschau — Außen-Konstanten =====
// Max. Wank-Amplitude (rad, ~9°) eines voll instabilen Werks in der Werkstatt-Vorschau; der
// Mechanismus (Physik → sichtbares Teetern) ist headless beweisbar, der Wert augen-justiert.
AnazhRealm.WORKSHOP_LEAN_AMP = 0.16;
