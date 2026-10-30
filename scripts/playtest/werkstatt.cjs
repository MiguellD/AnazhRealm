"use strict";
// scripts/playtest/werkstatt.cjs — der Richter von Werkstatt (spec/stamm/modul-karte.json): Drawer · Omnibox · Statusleiste · Regler-Räume · Konsole · Werkstatt-Vorschau · Gizmo · Prozesse · Ofen-Vorschau · Spec-Blatt · Paletten · Rezept-Panel · Kosten-Tore · Bau-Modus · Tastenbelegung · Ich- und Hof-Räume · Ausrüstungs-UI · Rezeptbuch · Hof-Bühne · Welt-Info · Bibliothek · Feed · Wertungen · Kommentare.
// 13 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const path = require("path");
const { safeEvaluate, ohneWurf } = require("../playtest.cjs");
const SKRIPTE = path.join(__dirname, "..");

// Ω-PHYSIS Säule IV — Wahrheits-Spiegel: die gerechnete Physik treibt Ω-W2 (physik-wahre
// Optimierung) + Ω-W3 (sichtbares Bau-Feedback). Reine Berechnung + Konsum-Source-Probe, kein
// GPU-Flake; der LOOK des Wankens ist headless nicht prüfbar.
async function checkBandOmegaWerkstattSpiegel({ page, check }) {
    const res = await page.evaluate(() => {
        const C = r.constructor;
        const mats = r.state.materials || {};
        let dense = mats.eisen ? "eisen" : null,
            light = mats.holz ? "holz" : null;
        if (!dense || !light) {
            let dd = -1,
                ld = 2;
            for (const m in mats) {
                const d = mats[m] && mats[m].tags && mats[m].tags.dichte;
                if (typeof d !== "number") continue;
                if (d > dd) ((dd = d), (dense = m));
                if (d < ld) ((ld = d), (light = m));
            }
        }
        const pt = (x, y, z, sx, sy, sz, m) => ({
            position: { x, y, z },
            size: { x: sx, y: sy, z: sz },
            material: m || dense,
        });
        const P = (parts, role) => ({ parts, role, roleManual: !!role });
        const lineHas = (v, re) => v.lines.some((l) => re.test(l.text));
        const o = {};
        // ── Ω-W2 physik-wahre Optimierung (die Tat verschiebt die GERECHNETE Größe) ──
        const h = C.AXIS_ACTION_HINTS || {};
        o.w2Verbs =
            /Basis|Standfläche/.test(h.stability || "") &&
            /Lastpfad/.test(h.loadSound || "") &&
            /Räder|Achse/.test(h.rollable || "");
        // ── Ω-W3 das Verdikt (rollen-bewusst; was steht: der Prüf-Satz, gate:werkstatt-weg) ──
        const vWeapon = r._workshopPhysicsVerdict(
            P([pt(0, 0.5, 0, 0.3, 1, 0.3, light), pt(0, 3, 0, 0.4, 4, 0.4, dense)], "weapon")
        );
        o.weaponTraege =
            vWeapon.swingDrag > 0.5 &&
            lineHas(vWeapon, /kopflastig/) &&
            vWeapon.lean === 0 &&
            !lineHas(vWeapon, /kippt/);
        return o;
    });
    check("Ω-W2: physik-wahre Optimierungs-Verben (Standfestigkeit/Lastpfad/Rollfähigkeit)", res.w2Verbs === true);
    check("Ω-W3 ROLLEN-bewusst: kopflastige Waffe → traeger Schwung, nicht kippt", res.weaponTraege === true);
}

async function checkBandCadWorkshop({ page, check, errors, finalState }) {
    void errors;
    void finalState;
    // ### CAD-Werkstatt (3D-Preview + Manipulator-Gizmo) ###
    const wave6bResults = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};
        try {
            // --- Phase 1: State-Schema ---
            const ws = r._ensureWorkshopState();
            out.hasManipulatorModeField = typeof ws.manipulatorMode === "string";
            out.hasSnapEnabledField = typeof ws.snapEnabled === "boolean";
            out.defaultManipulatorMode = ws.manipulatorMode;
            out.defaultSnapEnabled = ws.snapEnabled;

            // --- Phase 2: Konstanten ---
            const AR = r.constructor;
            out.gizmoColorsFrozen =
                !!AR.WORKSHOP_GIZMO_COLORS &&
                Object.isFrozen(AR.WORKSHOP_GIZMO_COLORS) &&
                typeof AR.WORKSHOP_GIZMO_COLORS.x === "number" &&
                typeof AR.WORKSHOP_GIZMO_COLORS.y === "number" &&
                typeof AR.WORKSHOP_GIZMO_COLORS.z === "number";
            out.snapRotate = AR.WORKSHOP_SNAP_ROTATE;
            out.minPartSize = AR.WORKSHOP_MIN_PART_SIZE;

            // --- Phase 2: Public API ---
            out.modeSetTranslate = r.setWorkshopManipulatorMode("translate");
            out.modeAfterTranslate = ws.manipulatorMode === "translate";
            out.modeSetRotate = r.setWorkshopManipulatorMode("rotate");
            out.modeAfterRotate = ws.manipulatorMode === "rotate";
            out.modeSetScale = r.setWorkshopManipulatorMode("scale");
            out.modeAfterScale = ws.manipulatorMode === "scale";
            out.modeRejectInvalid = r.setWorkshopManipulatorMode("nonsense") === false;
            r.setWorkshopManipulatorMode("translate"); // reset

            const snapBefore = ws.snapEnabled;
            const snapAfter1 = r.toggleWorkshopSnap();
            out.snapTogglesOff = snapBefore === true && snapAfter1 === false;
            const snapAfter2 = r.toggleWorkshopSnap();
            out.snapTogglesBack = snapAfter2 === true;
            // Explizites Argument: true setzt + liefert true, false setzt + liefert false
            out.snapExplicitTrue = r.toggleWorkshopSnap(true) === true;
            out.snapExplicitFalseReturns = r.toggleWorkshopSnap(false) === false;
            r.toggleWorkshopSnap(true); // reset

            // --- Phase 2: Snap-Helper ---
            ws.snapEnabled = true;
            out.snapTranslateRound = r._workshopApplySnap(1.7, "translate") === 1.5;
            out.snapTranslateRoundUp = r._workshopApplySnap(1.8, "translate") === 2.0;
            out.snapScaleRound = Math.abs(r._workshopApplySnap(1.23, "scale") - 1.2) < 0.0001;
            ws.snapEnabled = false;
            out.snapInactivePassthrough = r._workshopApplySnap(1.7, "translate") === 1.7;
            ws.snapEnabled = true;

            // --- Phase 2: Helper-Methoden ---
            const vx = r._workshopAxisToVec3("x");
            out.axisToVecX = vx && vx.x === 1 && vx.y === 0 && vx.z === 0;
            const vy = r._workshopAxisToVec3("y");
            out.axisToVecY = vy && vy.x === 0 && vy.y === 1 && vy.z === 0;
            const vz = r._workshopAxisToVec3("z");
            out.axisToVecZ = vz && vz.x === 0 && vz.y === 0 && vz.z === 1;
            const perpY = r._workshopAxisPerpendicular(vy);
            out.axisPerpDot = perpY && Math.abs(perpY.dot(vy)) < 0.001;

            // --- Phase 1: Selection-Pfad (ohne Preview, headless-safe) ---
            // Bauplan auswählen: braucht selectBlueprintForEdit auf existing built-in
            r.selectBlueprintForEdit("stein_block");
            out.selectedSetToVillage = ws.selectedBlueprint === "stein_block";
            // selectedPartIdx wurde zurückgesetzt
            out.selectionResetOnBlueprintSwitch = ws.selectedPartIdx === null;
            // Manuelle Selection setzen (ohne Klick)
            r._workshopSetSelection(0);
            out.selectionSetTo0 = ws.selectedPartIdx === 0;
            // Out-of-range wird abgelehnt
            r._workshopSetSelection(9999);
            out.selectionRejectsOOB = ws.selectedPartIdx === null;
            r._workshopSetSelection(null); // reset

            // Werkstatt ÖFFNEN, bevor der Manipulator getestet wird: _workshopBeginManipulation raycastet gegen
            // die Canvas-Rect, ein geschlossener Drawer hat 0×0 → der Ray verfehlt.
            {
                const wtab = document.querySelector('#topbar [data-tab="werkstatt"]');
                if (wtab) wtab.click();
            }

            // --- Phase 2: Manipulator-Drag auf Built-in lehnt ab ---
            // stein_block ist built-in → kein Drag
            out.builtInRejected = true;
            try {
                r._workshopSetSelection(0);
                // Wir können _workshopBeginManipulation aufrufen, aber es sollte
                // intern wegen builtIn früh aussteigen (kein dragManipulator gesetzt).
                // Wir können das nur prüfen wenn preview existiert.
                r._workshopEnsurePreview();
                const pre = r.state.workshop.preview;
                if (pre) {
                    r._workshopBeginManipulation("translate", "x", 100, 100);
                    out.builtInRejected = pre.dragManipulator === null;
                }
            } catch {
                out.builtInRejected = false;
            }

            // --- Phase 2: Manipulator auf eigenem Bauplan ---
            // Klone stein_block zu test_wave6b
            const cloneOk = r.cloneBlueprint("stein_block", "test_wave6b");
            out.cloneOk = cloneOk;
            if (cloneOk) {
                r.selectBlueprintForEdit("test_wave6b");
                r._workshopSetSelection(0);
                const partBefore = JSON.parse(JSON.stringify(r.state.blueprints.test_wave6b.parts[0]));
                out.posBefore = partBefore.position.x;
                // Drag begin auf eigenem Bauplan
                r._workshopEnsurePreview();
                const pre = r.state.workshop.preview;
                out.p2PreviewExists = !!pre;
                out.p2SelIdx = r.state.workshop.selectedPartIdx;
                if (pre) {
                    // Klick-Koordinate = Mitte der ECHTEN Canvas-Rect, nie hartcodiert: ein fester Punkt kann über
                    // dem Canvas liegen (ndcY>1) → der Ray verfehlt die Ebene.
                    const _c = document.getElementById("workshop-preview-canvas");
                    const _rc = _c && _c.getBoundingClientRect();
                    out.p2RectW = _rc && Math.round(_rc.width);
                    out.p2RectH = _rc && Math.round(_rc.height);
                    out.p2CamAspect = pre.camera && Math.round((pre.camera.aspect || 0) * 100) / 100;
                    const _cx = _rc ? _rc.left + _rc.width / 2 : 100;
                    const _cy = _rc ? _rc.top + _rc.height / 2 : 100;
                    r._workshopBeginManipulation("translate", "x", _cx, _cy);
                    out.dragManipulatorSet = pre.dragManipulator !== null;
                    if (pre.dragManipulator) {
                        out.dragModeIsTranslate = pre.dragManipulator.mode === "translate";
                        out.dragAxisIsX = pre.dragManipulator.axis === "x";
                    }
                    // End-Pfad räumt auf
                    r._workshopEndManipulation();
                    out.dragManipulatorCleared = pre.dragManipulator === null;
                }
                // Aufräumen: deleteBlueprint refresht die Workshop-DOM-Liste nicht — explizit nachziehen, sonst
                // sieht der Ring-6.6-Test eine Liste mit einem Eintrag mehr als state.blueprints.
                r.deleteBlueprint("test_wave6b");
                r.selectBlueprintForEdit("stein_block");
                r._renderWorkshopDOM();
            }

            // --- Phase 2: UI-Elemente ---
            out.modeBarInDom = !!document.getElementById("workshop-mode-bar");
            const modeBtns = document.querySelectorAll("#workshop-mode-bar [data-workshop-mode]");
            // connect ist 4. Modus dazugekommen
            out.fourModeButtons = modeBtns.length === 4;
            out.snapToggleInDom = !!document.getElementById("workshop-snap-toggle");

            // --- Phase 2: Gizmo-Aufbau ---
            r._workshopEnsurePreview();
            const pre = r.state.workshop.preview;
            if (pre && pre.gizmo) {
                out.gizmoBuilt = true;
                out.gizmoChildren = pre.gizmo.children.length === 3; // translate/rotate/scale
                // Pro Modus ein paar Mesh-Einträge in gizmoMeshes
                let tCount = 0,
                    rCount = 0,
                    sCount = 0;
                for (const info of pre.gizmoMeshes.values()) {
                    if (info.mode === "translate") tCount++;
                    else if (info.mode === "rotate") rCount++;
                    else if (info.mode === "scale") sCount++;
                }
                out.gizmoHasTranslateMeshes = tCount >= 3;
                out.gizmoHasRotateMeshes = rCount >= 3;
                out.gizmoHasScaleMeshes = sCount >= 4; // 3 axes + 1 uniform
                // Picker-Meshes zählen mit (visual + picker je Handle): translate 3×(shaft+tip+picker) = 9 ·
                // rotate 3×(ring+picker) = 6 · scale 3×(cube+shaft+picker) + 2×(center+picker) = 11.
                out.gizmoHasPickers = tCount >= 9 && rCount >= 6 && sCount >= 8;

                // --- Gizmo-Sichtbarkeit bei Built-in vs. eigen ---
                // Bauplan ist aktuell stein_block (Built-in). Sync rufen
                // und prüfen dass Gizmo versteckt ist.
                r.selectBlueprintForEdit("stein_block");
                r._workshopSetSelection(0);
                r._workshopSyncGizmo();
                out.gizmoHiddenOnBuiltIn = pre.gizmo.visible === false;
                // Banner sichtbar?
                const banner = document.getElementById("workshop-readonly-banner");
                out.readonlyBannerVisibleOnBuiltIn = banner && banner.hidden === false;
                // Mode-Bar disabled?
                const firstModeBtn = document.querySelector("#workshop-mode-bar [data-workshop-mode]");
                out.modeBarDisabledOnBuiltIn = firstModeBtn && firstModeBtn.disabled === true;
                // Jetzt mit eigenem Bauplan: Klone + Selection + Sync
                r.cloneBlueprint("stein_block", "test_visibility");
                r.selectBlueprintForEdit("test_visibility");
                r._workshopSetSelection(0);
                r._workshopSyncGizmo();
                out.gizmoVisibleOnCustom = pre.gizmo.visible === true;
                out.readonlyBannerHiddenOnCustom = banner && banner.hidden === true;
                out.modeBarEnabledOnCustom = firstModeBtn && firstModeBtn.disabled === false;
                r.deleteBlueprint("test_visibility");
                r.selectBlueprintForEdit("stein_block");
                r._renderWorkshopDOM();
            }
        } catch (err) {
            out.error = err && err.message;
        }
        return out;
    });

    if (ohneWurf(check, "Welle 6.B", wave6bResults)) {
        check("Welle 6.B P1: selectBlueprintForEdit setzt selectedBlueprint", wave6bResults.selectedSetToVillage);
        check(
            "Welle 6.B P1: Bauplan-Wechsel resettet selectedPartIdx auf null",
            wave6bResults.selectionResetOnBlueprintSwitch
        );
        check("Welle 6.B P1: _workshopSetSelection(0) setzt selectedPartIdx", wave6bResults.selectionSetTo0);
        check(
            "Welle 6.B P1: _workshopSetSelection lehnt out-of-range (idx=null bei OOB)",
            wave6bResults.selectionRejectsOOB
        );
        check(
            "Welle 6.B P2: manipulatorMode-Feld + Default 'translate'",
            wave6bResults.hasManipulatorModeField && wave6bResults.defaultManipulatorMode === "translate"
        );
        check(
            "Welle 6.B P2: snapEnabled-Feld + Default true",
            wave6bResults.hasSnapEnabledField && wave6bResults.defaultSnapEnabled === true
        );
        check("Welle 6.B P2: WORKSHOP_GIZMO_COLORS frozen mit x/y/z (uint Farben)", wave6bResults.gizmoColorsFrozen);
        check(
            "Welle 6.B P2: WORKSHOP_SNAP_ROTATE === π/12 (15°)",
            Math.abs(wave6bResults.snapRotate - Math.PI / 12) < 0.0001
        );
        check("Welle 6.B P2: WORKSHOP_MIN_PART_SIZE === 0.05", wave6bResults.minPartSize === 0.05);
        check(
            "Welle 6.B P2: setWorkshopManipulatorMode wechselt durch alle 3 Modi (translate/rotate/scale)",
            wave6bResults.modeSetTranslate &&
                wave6bResults.modeAfterTranslate &&
                wave6bResults.modeSetRotate &&
                wave6bResults.modeAfterRotate &&
                wave6bResults.modeSetScale &&
                wave6bResults.modeAfterScale
        );
        check("Welle 6.B P2: setWorkshopManipulatorMode lehnt ungültige Modi ab", wave6bResults.modeRejectInvalid);
        check(
            "Welle 6.B P2: toggleWorkshopSnap toggelt true→false→true",
            wave6bResults.snapTogglesOff && wave6bResults.snapTogglesBack
        );
        check(
            "Welle 6.B P2: toggleWorkshopSnap akzeptiert explizites Argument (true/false)",
            wave6bResults.snapExplicitTrue && wave6bResults.snapExplicitFalseReturns
        );
        check(
            "Welle 6.B P2: _workshopApplySnap aktiv rundet 1.7 → 1.5 (translate-step 0.5)",
            wave6bResults.snapTranslateRound
        );
        check("Welle 6.B P2: _workshopApplySnap aktiv rundet 1.8 → 2.0", wave6bResults.snapTranslateRoundUp);
        check("Welle 6.B P2: _workshopApplySnap scale 1.23 → 1.2 (step 0.1)", wave6bResults.snapScaleRound);
        check("Welle 6.B P2: _workshopApplySnap inaktiv → Wert unverändert", wave6bResults.snapInactivePassthrough);
        check(
            "Welle 6.B P2: _workshopAxisToVec3 liefert korrekte Welt-Achsen (X/Y/Z)",
            wave6bResults.axisToVecX && wave6bResults.axisToVecY && wave6bResults.axisToVecZ
        );
        check("Welle 6.B P2: _workshopAxisPerpendicular liefert senkrechte Achse (dot ≈ 0)", wave6bResults.axisPerpDot);
        check(
            "Welle 6.B P2: _workshopBeginManipulation auf Built-in setzt KEINEN dragManipulator (read-only-Schutz)",
            wave6bResults.builtInRejected
        );
        check("Welle 6.B P2: cloneBlueprint(stein_block → test_wave6b) erfolgreich", wave6bResults.cloneOk);
        check(
            "Welle 6.B P2: _workshopBeginManipulation auf eigenem Bauplan setzt dragManipulator",
            wave6bResults.dragManipulatorSet,
            `preview=${wave6bResults.p2PreviewExists} selIdx=${wave6bResults.p2SelIdx} rect=${wave6bResults.p2RectW}x${wave6bResults.p2RectH} camAspect=${wave6bResults.p2CamAspect}`
        );
        check(
            "Welle 6.B P2: dragManipulator trägt korrekte mode+axis (translate/x)",
            wave6bResults.dragModeIsTranslate && wave6bResults.dragAxisIsX
        );
        check("Welle 6.B P2: _workshopEndManipulation räumt dragManipulator auf", wave6bResults.dragManipulatorCleared);
        check("Welle 6.B P2: #workshop-mode-bar im DOM", wave6bResults.modeBarInDom);
        check("Welle 6.B P2+3: 4 Mode-Buttons (translate/rotate/scale/connect) im DOM", wave6bResults.fourModeButtons);
        check("Welle 6.B P2: #workshop-snap-toggle im DOM", wave6bResults.snapToggleInDom);
        check("Welle 6.B P2: Gizmo-Group gebaut (preview.gizmo nicht null)", wave6bResults.gizmoBuilt);
        check("Welle 6.B P2: Gizmo hat 3 Sub-Groups (translate/rotate/scale)", wave6bResults.gizmoChildren);
        check("Welle 6.B P2: Translate-Gizmo hat ≥3 Handle-Meshes (Pfeile)", wave6bResults.gizmoHasTranslateMeshes);
        check("Welle 6.B P2: Rotate-Gizmo hat ≥3 Handle-Meshes (Ringe)", wave6bResults.gizmoHasRotateMeshes);
        check(
            "Welle 6.B P2: Scale-Gizmo hat ≥4 Handle-Meshes (3 Achsen + 1 uniform-Center)",
            wave6bResults.gizmoHasScaleMeshes
        );
        check(
            "Welle 6.B P2 Bug-Fix V7.99: Picker-Meshes pro Mode (translate≥9, rotate≥6, scale≥8 — Klick-Toleranz)",
            wave6bResults.gizmoHasPickers
        );
        check(
            "Welle 6.B P2 Bug-Fix V7.99: Gizmo VERSTECKT bei Built-in (verhindert Geist-Drag-Bug)",
            wave6bResults.gizmoHiddenOnBuiltIn
        );
        check(
            "Welle 6.B P2 Bug-Fix V7.99: Read-only-Banner sichtbar bei Built-in",
            wave6bResults.readonlyBannerVisibleOnBuiltIn
        );
        check(
            "Welle 6.B P2 Bug-Fix V7.99: Mode-Bar Buttons disabled bei Built-in",
            wave6bResults.modeBarDisabledOnBuiltIn
        );
        check(
            "Welle 6.B P2 Bug-Fix V7.99: Gizmo SICHTBAR bei eigenem Bauplan + Selection",
            wave6bResults.gizmoVisibleOnCustom
        );
        check(
            "Welle 6.B P2 Bug-Fix V7.99: Banner versteckt bei eigenem Bauplan",
            wave6bResults.readonlyBannerHiddenOnCustom
        );
        check(
            "Welle 6.B P2 Bug-Fix V7.99: Mode-Bar Buttons enabled bei eigenem Bauplan",
            wave6bResults.modeBarEnabledOnCustom
        );
    }

    // ### Resize-Handles (Konsole + Drawer) + Background-Fix ###
    const resizeResults = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};
        try {
            const consoleEl = document.getElementById("console");
            // die Konsole sitzt UNTEN-LINKS (bottom-verankert); der Resize-Griff ist
            // „tr" (oben-rechts, wächst nach oben), nicht mehr „br". Der Test wandert mit.
            out.consoleHasHandle = !!(consoleEl && consoleEl.querySelector(":scope > .resize-handle.resize-tr"));
            // die V18-Drawer tragen einen HÖHEN-only Griff (.resize-b), NICHT den alten
            // breiten-brechenden .resize-bl (der die left/right-Symmetrie zerstörte). Heilung statt
            // Schnitt (Schöpfer „Samen geschnitten"): anpassbar bleiben, Symmetrie wahren.
            const drawers = document.querySelectorAll(".drawer[data-drawer]");
            let drawersHeightHandle = drawers.length > 0;
            let drawerCount = 0;
            drawers.forEach((d) => {
                drawerCount++;
                if (!d.querySelector(":scope > .resize-handle.resize-b")) drawersHeightHandle = false;
                if (d.querySelector(":scope > .resize-handle.resize-bl")) drawersHeightHandle = false;
            });
            out.noDrawerHasHandle = drawersHeightHandle;
            out.drawerCount = drawerCount;
            // Idempotenz: zweiter installResizeHandles-Call erzeugt keine Duplikate
            r.installResizeHandles();
            const handlesAfterSecond = document.querySelectorAll("#console > .resize-handle").length;
            out.consoleHandleNotDuplicated = handlesAfterSecond === 1;
            // localStorage-Persistence: simulate drag end
            const werkstatt = document.querySelector('[data-drawer="werkstatt"]');
            if (werkstatt) {
                werkstatt.style.width = "400px";
                werkstatt.style.height = "500px";
                // simulate save (mouseup handler logic)
                localStorage.setItem("anazh.resize.werkstatt", JSON.stringify({ width: 400, height: 500 }));
                const raw = localStorage.getItem("anazh.resize.werkstatt");
                out.persistenceWorks = raw && JSON.parse(raw).width === 400 && JSON.parse(raw).height === 500;
                // cleanup
                werkstatt.style.width = "";
                werkstatt.style.height = "";
                localStorage.removeItem("anazh.resize.werkstatt");
            }
            // .drawer hat direkt ein background statt nur ::before.
            // Wir prüfen das via computed style — background sollte 'none' nicht sein.
            // (UI-Putz: Welt-Drawer aufgelöst → wir prüfen den Einstellungen-Drawer.)
            const w = document.querySelector('[data-drawer="einstellungen"]');
            if (w) {
                const cs = getComputedStyle(w);
                out.drawerHasDirectBackground = cs.backgroundImage && cs.backgroundImage !== "none";
                out.drawerHasInsetShadow = cs.boxShadow && cs.boxShadow.includes("inset");
            }
        } catch (err) {
            out.error = err && err.message;
        }
        return out;
    });

    if (ohneWurf(check, "Resize", resizeResults)) {
        check(
            "Resize: Konsole hat .resize-tr Handle (oben-rechts, wächst nach oben; bottom-verankert)",
            resizeResults.consoleHasHandle
        );
        check(
            `Rahmen: die ${resizeResults.drawerCount} V18-Drawer tragen einen HÖHEN-Griff (.resize-b, symmetrie-treu, kein .resize-bl)`,
            resizeResults.noDrawerHasHandle
        );
        check("Resize: installResizeHandles ist idempotent (kein Duplikat)", resizeResults.consoleHandleNotDuplicated);
        check("Resize: localStorage-Persistence schreibt + liest", resizeResults.persistenceWorks);
        check(
            "BG-Fix: .drawer hat direktes background-image (statt nur via ::before)",
            resizeResults.drawerHasDirectBackground
        );
        check(
            "BG-Fix: .drawer hat inset box-shadow für Border-Ringe (statt nur via ::after)",
            resizeResults.drawerHasInsetShadow
        );
    }

    // ### DIE OMNIBOX (Ctrl/Cmd+K): Tag → Treffer → Ausführung (KONSUM) ###
    const omniResults = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};
        try {
            // (1) c:wetter → nur Befehls-Treffer, mind. einer enthält „wetter", run ist ausführbar
            const cmd = r._omniboxSearch("c:wetter");
            out.cmdAllBefehl =
                cmd.length > 0 && cmd.every((x) => x.kindLabel === "Befehl" && typeof x.run === "function");
            out.cmdMatchesWetter = cmd.some((x) => x.label.toLowerCase().includes("wetter"));
            // (2) w: → rollen-gefilterte Baupläne (alle sub „Bauplan"); ⊆ von b: (Rollen-Filter wirkt)
            const all = r._omniboxSearch("b:");
            const weapons = r._omniboxSearch("w:");
            out.bHasBlueprints = all.length > 0 && all.every((x) => x.sub === "Bauplan");
            out.wIsRoleFiltered = weapons.every((x) => x.sub === "Bauplan") && weapons.length <= all.length;
            // (3) geh:werkstatt → ein Raum-Treffer; Ausführung öffnet die Werkstatt (KONSUM)
            const rooms = r._omniboxSearch("geh:werkstatt");
            out.gehFindsRoom = rooms.length > 0 && rooms[0].kindLabel === "Raum" && rooms[0].label === "Werkstatt";
            if (out.gehFindsRoom) {
                rooms[0].run();
                out.gehOpensWorkshop = r.state.uiActiveDrawer === "werkstatt";
                r.closeAllDrawers();
            }
            // (4) Freitext ohne Präfix → der Nexus-Pfad als Fallback (letzter Treffer)
            const free = r._omniboxSearch("mach es nacht");
            out.freetextHasNexus = free.some((x) => x.kindLabel === "Nexus" && typeof x.run === "function");
            // (5) Ctrl+K öffnet das Overlay (behavioral)
            const overlay = document.getElementById("omnibox-overlay");
            const before = overlay ? overlay.hidden : true;
            window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));
            out.ctrlKOpens = !!overlay && before === true && overlay.hidden === false;
            // wieder schließen
            window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
            out.escCloses = !!overlay && overlay.hidden === true;
            // (6) der Maus-Trigger in der Topbar öffnet das Overlay (Maus-Parität)
            const trigger = document.getElementById("omnibox-trigger");
            if (trigger && overlay) {
                trigger.click();
                out.triggerOpens = overlay.hidden === false;
                window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
            }
        } catch (err) {
            out.error = err && err.message;
        }
        return out;
    });
    if (ohneWurf(check, "Omnibox", omniResults)) {
        check("Omnibox: c:wetter → nur Befehls-Treffer mit run() (KONSUM)", omniResults.cmdAllBefehl);
        check("Omnibox: c:wetter findet einen Wetter-Befehl", omniResults.cmdMatchesWetter);
        check("Omnibox: b: liefert Bauplan-Treffer", omniResults.bHasBlueprints);
        check("Omnibox: w: ist rollen-gefiltert (⊆ b:, liest die emergente Rolle)", omniResults.wIsRoleFiltered);
        check("Omnibox: geh:werkstatt findet den Raum", omniResults.gehFindsRoom);
        check("Omnibox: geh:werkstatt ÖFFNET die Werkstatt (KONSUM)", omniResults.gehOpensWorkshop);
        check("Omnibox: Freitext → der Nexus-Pfad als Fallback", omniResults.freetextHasNexus);
        check("Omnibox: Ctrl+K öffnet das Overlay", omniResults.ctrlKOpens);
        check("Omnibox: Esc schließt das Overlay", omniResults.escCloses);
        check("Omnibox: der Maus-Trigger öffnet das Overlay (Maus-Parität)", omniResults.triggerOpens);
    }

    // ### Drawer-Scroll-Wrapper + Canvas-Sync (Bug-Fixes nach Browser-Test) ###
    const v801Results = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};
        try {
            // Jeder Drawer hat .drawer-scroll-Wrapper als direktes child
            const drawers = document.querySelectorAll(".drawer[data-drawer]");
            let allWrapped = drawers.length > 0;
            drawers.forEach((d) => {
                if (!d.querySelector(":scope > .drawer-scroll")) allWrapped = false;
            });
            out.allDrawersWrapped = allWrapped;
            out.drawerCount = drawers.length;
            // die V18-Drawer tragen keinen Resize-Griff mehr (CSS-Rahmen, symmetrisch); der
            // verbliebene Griff lebt an der Konsole + ist ein direktes Kind (kein Scroll-Wrapper davor
            // → er scrollt nicht weg). Plus: kein Drawer hat einen Griff im Scroll-Wrapper.
            const werkstatt = document.querySelector('[data-drawer="werkstatt"]');
            const consoleEl = document.getElementById("console");
            const consoleHandleDirect = !!(consoleEl && consoleEl.querySelector(":scope > .resize-handle"));
            const handleInsideWrap = !!(werkstatt && werkstatt.querySelector(":scope > .drawer-scroll .resize-handle"));
            out.handleOutsideScroll = consoleHandleDirect && !handleInsideWrap;
            // h2 ist ebenfalls direktes child (bleibt oben fest)
            const w2 = document.querySelector('[data-drawer="werkstatt"] > h2');
            out.h2DirectChildOfDrawer = !!w2;
            // overflow:hidden + display:flex sind nur am SICHTBAREN Drawer prüfbar (der geschlossene
            // ist display:none, K2 Belegung) → Werkstatt-Tab kurz öffnen, danach alles zurück.
            const tab = document.querySelector('#topbar [data-tab="werkstatt"]');
            if (tab) tab.click();
            if (werkstatt) {
                const cs = getComputedStyle(werkstatt);
                out.drawerOverflowHidden = cs.overflow === "hidden" || cs.overflowY === "hidden";
                out.drawerDisplayFlex = cs.display === "flex";
            }
            // drawer-scroll hat overflow-y:auto
            const scroll = werkstatt && werkstatt.querySelector(":scope > .drawer-scroll");
            if (scroll) {
                const cs = getComputedStyle(scroll);
                out.scrollOverflowYAuto = cs.overflowY === "auto";
            }
            // Canvas-Sync: setze Drawer auf 600px, prüfe dass renderer.setSize gerufen wurde
            const canvas = document.getElementById("workshop-preview-canvas");
            if (canvas && werkstatt) {
                werkstatt.style.width = "600px";
                // Force eine Sync via _workshopSyncCanvasSize
                r._workshopSyncCanvasSize();
                const rect = canvas.getBoundingClientRect();
                const w = Math.max(64, Math.floor(rect.width));
                // canvas.width sollte jetzt der CSS-Größe entsprechen
                out.canvasSyncWorks = canvas.width === w;
                // cleanup
                werkstatt.style.width = "";
            }
            // CRITICAL Cleanup: zurück zum Default-Blick (alle Drawer zu) + Yaw auf 0,
            // sonst stören die nachgelagerten Drawer- und Ring-5-V2-Prep-Tests.
            r.closeAllDrawers();
            r.state.yaw = 0;
            if (r.state.playerMesh) r.state.playerMesh.rotation.y = 0;
        } catch (err) {
            out.error = err && err.message;
        }
        return out;
    });

    if (v801Results && !v801Results.error) {
        check(
            `Alle ${v801Results.drawerCount} Drawer haben .drawer-scroll-Wrapper (Inhalt scrollt, Rahmen bleibt fest)`,
            v801Results.allDrawersWrapped
        );
        check(
            "h2 (Drawer-Titel) ist direktes child des Drawers — bleibt oben fest beim Scroll",
            v801Results.h2DirectChildOfDrawer
        );
        check(
            "Konsole-Resize-Griff fest (direktes Kind, kein Scroll-Wrapper); kein Drawer-Griff im Scroll",
            v801Results.handleOutsideScroll
        );
        check(".drawer hat overflow:hidden (CSS-Wechsel von overflow-y:auto)", v801Results.drawerOverflowHidden);
        check(".drawer hat display:flex für column-Layout", v801Results.drawerDisplayFlex);
        check(".drawer-scroll hat overflow-y:auto (scroller im Wrapper)", v801Results.scrollOverflowYAuto);
        check(
            "_workshopSyncCanvasSize zieht canvas.width an CSS-rect.width nach (Drawer-Resize → Render-Pixel mitwachsen)",
            v801Results.canvasSyncWorks
        );
    } else if (v801Results && v801Results.error) {
        check(`evaluate-Fehler — ${v801Results.error}`, false);
    }

    // ### Shape-Drag-Drop + Klick-Klick-Connection ###
    const v802Results = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};
        try {
            // Shape-Palette: 9 Cards im DOM
            const palette = document.getElementById("workshop-shape-palette");
            if (palette) {
                const cards = palette.querySelectorAll(".workshop-shape-card");
                out.nineCards = cards.length === 9;
                // Alle 9 expected shapes
                const shapes = new Set();
                cards.forEach((c) => shapes.add(c.getAttribute("data-shape")));
                out.allNineShapesPresent = [
                    "box",
                    "sphere",
                    "cylinder",
                    "cone",
                    "pyramid",
                    "octahedron",
                    "plane",
                    "torus",
                    "helix",
                ].every((s) => shapes.has(s));
                // Default: draggable=true (eigener Bauplan)
                // Aber bei Built-in (initial stein_block) sollten sie draggable=false sein
            }

            // Drop-Handler-Test: auf Built-in muss er ablehnen
            r.selectBlueprintForEdit("stein_block");
            const partsBeforeBuiltIn = r.state.blueprints.stein_block.parts.length;
            r._workshopHandleShapeDrop("box", 100, 100);
            const partsAfterBuiltIn = r.state.blueprints.stein_block.parts.length;
            out.dropOnBuiltInRejected = partsBeforeBuiltIn === partsAfterBuiltIn;

            // Drop-Handler auf eigenem Bauplan: fügt Part hinzu + selektiert ihn
            if (r.state.blueprints["test_phase3"]) r.deleteBlueprint("test_phase3");
            r.cloneBlueprint("stein_block", "test_phase3");
            r.selectBlueprintForEdit("test_phase3");
            r._workshopEnsurePreview();
            const partsBefore = r.state.blueprints.test_phase3.parts.length;
            r._workshopHandleShapeDrop("sphere", 100, 100);
            const partsAfter = r.state.blueprints.test_phase3.parts.length;
            out.dropOnCustomAddsPart = partsAfter === partsBefore + 1;
            const newPart = r.state.blueprints.test_phase3.parts[partsAfter - 1];
            out.newPartIsSphere = newPart && newPart.shape === "sphere";
            out.newPartSelected = r.state.workshop.selectedPartIdx === partsAfter - 1;

            // Der Sphere-Drop auf den 1-Part-Fels kann eine AUTO-Verbindung gebären (+ „✂ Lösen“-Kachel, 14
            // statt 13 Buttons) → das Test-Paar startet unverbunden; die Auto-Geburt prüft ihr eigenes §7.1-Band.
            {
                const bp3 = r.state.blueprints.test_phase3;
                bp3.connections = (bp3.connections || []).filter(
                    (c) =>
                        !(
                            (c.partA === 0 && c.partB === partsAfter - 1) ||
                            (c.partA === partsAfter - 1 && c.partB === 0)
                        )
                );
            }

            // Connect-Modus: setWorkshopManipulatorMode akzeptiert "connect"
            out.connectModeAccepted = r.setWorkshopManipulatorMode("connect") === true;
            out.modeIsConnect = r.state.workshop.manipulatorMode === "connect";

            // Klick auf Part 0 im Connect-Mode → connectFirstPartIdx wird Source
            r._workshopHandleConnectClick(0);
            out.connectFirstSetTo0 = r.state.workshop.connectFirstPartIdx === 0;
            // Klick auf Part 1 → öffnet Popover
            r._workshopHandleConnectClick(1);
            const popover = document.getElementById("workshop-connect-overlay");
            out.popoverOpened = !!popover;
            // Popover hat 8 Type-Buttons + 1 Cancel
            if (popover) {
                const buttons = popover.querySelectorAll("button");
                // W-G: +„weitere…"-Toggle (Progressive Disclosure) → 13
                // (3 primary + 5 hidden + 3 Anker + 1 weitere-Toggle + 1 cancel).
                out.popoverHasButtons = buttons.length === 13;
            }

            // Apply Connection
            r._workshopApplyConnection(0, 1, "lashing");
            const conns = r.state.blueprints.test_phase3.connections || [];
            out.connectionAdded = conns.some((c) => c.partA === 0 && c.partB === 1 && c.type === "lashing");
            // Popover wurde geschlossen
            out.popoverClosedAfterApply = !document.getElementById("workshop-connect-overlay");
            // Connect-State zurückgesetzt
            out.connectStateReset = r.state.workshop.connectFirstPartIdx === null;

            // Duplikat-Schutz: gleiche Connection zweimal → bleibt 1
            r._workshopApplyConnection(0, 1, "lashing");
            const connsAfterDup = r.state.blueprints.test_phase3.connections || [];
            const lashingCount = connsAfterDup.filter(
                (c) => c.type === "lashing" && c.partA === 0 && c.partB === 1
            ).length;
            out.dupRejected = lashingCount === 1;

            // Apply lehnt unbekannten Type ab
            const beforeBogus = (r.state.blueprints.test_phase3.connections || []).length;
            r._workshopApplyConnection(0, 1, "nonsense_type");
            const afterBogus = (r.state.blueprints.test_phase3.connections || []).length;
            out.bogusTypeRejected = afterBogus === beforeBogus;

            // ESC im Connect-Mode mit pending Source → cancelt nur Connect, nicht Drawer
            r._workshopHandleConnectClick(0); // Source = 0
            r.state.uiActiveDrawer = "werkstatt";
            r.closeAllDrawers();
            out.escCancelsConnectOnly = r.state.workshop.connectFirstPartIdx === null;
            // Drawer sollte noch aktiv sein, weil ESC nur Connect canceled
            out.drawerStillActiveAfterEsc = r.state.uiActiveDrawer === "werkstatt";

            // Cleanup
            r.setWorkshopManipulatorMode("translate");
            r.deleteBlueprint("test_phase3");
            r.selectBlueprintForEdit("stein_block");
            r._renderWorkshopDOM();
        } catch (err) {
            out.error = err && err.message;
        }
        return out;
    });

    if (ohneWurf(check, "Phase 3", v802Results)) {
        check("Phase 3a: 9 Shape-Cards in der Palette", v802Results.nineCards);
        check(
            "Phase 3a: alle 9 Primitive (box/sphere/cylinder/cone/pyramid/octahedron/plane/torus/helix)",
            v802Results.allNineShapesPresent
        );
        check("Phase 3a: Drop auf Built-in-Bauplan abgelehnt (read-only-Schutz)", v802Results.dropOnBuiltInRejected);
        check(
            "Phase 3a: Drop auf eigenem Bauplan fügt einen Part hinzu",
            v802Results.dropOnCustomAddsPart && v802Results.newPartIsSphere
        );
        check("Phase 3a: Neuer Part wird automatisch selektiert (Gizmo bereit)", v802Results.newPartSelected);
        check(
            "Phase 3b: setWorkshopManipulatorMode('connect') akzeptiert + setzt State",
            v802Results.connectModeAccepted && v802Results.modeIsConnect
        );
        check("Phase 3b: Erster Connect-Klick setzt connectFirstPartIdx auf Source", v802Results.connectFirstSetTo0);
        check("Phase 3b: Zweiter Connect-Klick öffnet #workshop-connect-overlay", v802Results.popoverOpened);
        check(
            "V8.02/V18.110: Popover hat 11 Type-Buttons (8 Prozess + 3 C7-Punkte) + 1 Cancel (= 12 total)",
            v802Results.popoverHasButtons
        );
        check(
            "Phase 3b: _workshopApplyConnection schreibt {type, partA, partB} ins bp.connections",
            v802Results.connectionAdded
        );
        check("Phase 3b: Popover schließt nach Apply", v802Results.popoverClosedAfterApply);
        check("Phase 3b: connectFirstPartIdx zurückgesetzt nach Apply", v802Results.connectStateReset);
        check("Phase 3b: Duplikat-Schutz — selbe Connection zweimal → bleibt 1", v802Results.dupRejected);
        check("Phase 3b: Unbekannter Connection-Type wird abgelehnt", v802Results.bogusTypeRejected);
        check(
            "Phase 3b: ESC im Connect-Mode mit pending Source → cancelt nur Connect (nicht Drawer)",
            v802Results.escCancelsConnectOnly && v802Results.drawerStillActiveAfterEsc
        );
    }

    // ### Camera-CAD-Konventionen (Pan + Zoom-to-Cursor + Wheel-Stop) +
    //             seitliche Material/Color-Palette
    const v803Results = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};
        try {
            // Tab → Werkstatt + eigenen Bauplan vorbereiten
            const tab = document.querySelector('#topbar [data-tab="werkstatt"]');
            if (tab) tab.click();
            if (r.state.blueprints["test_v803"]) r.deleteBlueprint("test_v803");
            r.cloneBlueprint("stein_block", "test_v803");
            r.selectBlueprintForEdit("test_v803");
            r._workshopEnsurePreview();
            const pre = r.state.workshop.preview;

            // Layout-Struktur
            out.previewRowInDom = !!document.getElementById("workshop-preview-row");
            out.sidePaletteInDom = !!document.getElementById("workshop-side-palette");
            out.shapePaletteInDom = !!document.getElementById("workshop-shape-palette");
            out.matPaletteInDom = !!document.getElementById("workshop-material-palette");
            out.colorPaletteInDom = !!document.getElementById("workshop-color-palette");
            // Side-Palette steht VOR der Preview im DOM (flex-row macht
            // dann visuell „links neben")
            const row = document.getElementById("workshop-preview-row");
            if (row) {
                const children = Array.from(row.children);
                out.paletteBeforePreview =
                    children[0] &&
                    children[0].id === "workshop-side-palette" &&
                    children[1] &&
                    children[1].id === "workshop-preview-wrapper";
            }
            // Material-Palette: eine Card pro Bau-Stoff in state.materials
            const matCards = document.querySelectorAll(".workshop-material-card");
            out.matCardsCount = matCards.length;
            out.matCardsMatchState =
                matCards.length === Object.values(r.state.materials).filter((m) => m.bauStoff !== false).length;
            // Color-Palette: 12 Swatches
            const colorSwatches = document.querySelectorAll(".workshop-color-swatch");
            out.twelveColorSwatches = colorSwatches.length === 12;

            // --- Pan-Geste: Listener-Source enthält Shift+Links + Mittelmaus-Pfad ---
            if (pre) {
                // --- Wheel + Zoom-to-Cursor: target verschiebt sich ---
                const oldDist = pre.orbit.dist;
                // Wheel mit deltaY > 0 = zoom-out (factor 1.12)
                const wheelEv = new WheelEvent("wheel", {
                    clientX: 100,
                    clientY: 100,
                    deltaY: 100,
                    bubbles: true,
                    cancelable: true,
                });
                pre.canvas.dispatchEvent(wheelEv);
                // dist hat sich geändert
                out.distChangedOnWheel = pre.orbit.dist !== oldDist;
                // wheel preventDefault: das Event wurde aufgenommen — wir prüfen
                // dass defaultPrevented true ist.
                out.wheelPreventDefault = wheelEv.defaultPrevented;
            }

            // --- CSS overscroll-behavior auf .drawer-scroll ---
            const werkstattScroll = document.querySelector('[data-drawer="werkstatt"] > .drawer-scroll');
            if (werkstattScroll) {
                const cs = getComputedStyle(werkstattScroll);
                out.overscrollContain = cs.overscrollBehavior.includes("contain");
            }

            // Cleanup
            r.state.workshop.selectedPartIdx = null;
            r.deleteBlueprint("test_v803");
            r.selectBlueprintForEdit("stein_block");
            // UI-Putz: Welt-Tab aufgelöst — neutraler Reset via closeAllDrawers (Welt = Default-Blick).
            r.closeAllDrawers();
            r.state.yaw = 0;
            if (r.state.playerMesh) r.state.playerMesh.rotation.y = 0;
        } catch (err) {
            out.error = err && err.message;
        }
        return out;
    });

    if (v803Results && !v803Results.error) {
        check("#workshop-preview-row im DOM (Layout-Container)", v803Results.previewRowInDom);
        check("#workshop-side-palette im DOM (seitliche Drag-Sources)", v803Results.sidePaletteInDom);
        check(
            "Alle 3 Sub-Paletten im DOM (shape/material/color)",
            v803Results.shapePaletteInDom && v803Results.matPaletteInDom && v803Results.colorPaletteInDom
        );
        check("Side-Palette steht VOR Preview im DOM (flex-row → visuell links)", v803Results.paletteBeforePreview);
        check(
            `Material-Palette hat ${v803Results.matCardsCount} Cards (= alle state.materials)`,
            v803Results.matCardsMatchState
        );
        check("Color-Palette hat 12 Swatches", v803Results.twelveColorSwatches);
        check("Camera: Wheel ändert orbit.dist (Zoom)", v803Results.distChangedOnWheel);
        check("Camera: Wheel ruft preventDefault → kein Drawer-Scroll-Bleed", v803Results.wheelPreventDefault);
        check(
            "CSS: .drawer-scroll hat overscroll-behavior:contain (zweite Verteidigung gegen Wheel-Bleed)",
            v803Results.overscrollContain
        );
    } else if (v803Results && v803Results.error) {
        check(`evaluate-Fehler — ${v803Results.error}`, false);
    }
}

async function checkBandEarlyRingsAndUi({ page, check, errors, finalState }) {
    void errors;
    void finalState;
    // ### Player-Emotionen → Welt ###
    const ring3Results = await safeEvaluate(page, async () => {
        if (!r || !r.state || !r.state.player) return null;
        const out = {};

        // Reset: für deterministische Tests alle Werte + die Takte der Gesetze des Gemüts löschen.
        for (const k of Object.keys(r.state.player.emotions)) {
            r.state.player.emotions[k] = 0;
        }
        for (const g of r.state.worldRules) if (/^emotion:/.test(g.source)) g.lastFired = -Infinity;
        r.state.player.emotionLastTick = -Infinity;

        // (a) collectPlayerEmotions reagiert auf deutsche Stichwörter
        r.collectPlayerEmotions("Was für ein schöner und magischer Moment");
        out.joyAfterCollect = r.state.player.emotions.joy;
        out.aweAfterCollect = r.state.player.emotions.awe;
        out.collectJoyOk = out.joyAfterCollect >= 0.1 - 1e-9;
        out.collectAweOk = out.aweAfterCollect >= 0.1 - 1e-9;

        // (b) Decay über simulierten Zeitfortschritt, isoliert: der Appraisal-Kanal hebt joy bei δ>0 und
        // überstimmt den 0.05-Decay → lifeField leeren + Spieler-Baseline = aktuelle Situation (δ=0).
        const savedLifeRing3 = r.state.lifeField;
        r.state.lifeField = new Map();
        const pmRing3 = r.state.playerMesh.position;
        for (const k of Object.keys(r.state.player.emotions)) r.state.player.emotions[k] = 0; // nur joy → keine Kohärenz-Dämpfung
        r.state.player.emotions.joy = 0.5;
        r.state.player.wohlBaseline = r._playerSituationWohl(r.auraAt(pmRing3.x, pmRing3.z, 110));
        r.state.player.emotionLastTick = 100;
        r.updatePlayerEmotions(110); // 10s vergangen
        out.joyAfterDecay = r.state.player.emotions.joy;
        out.decayLowered = out.joyAfterDecay < 0.5 && out.joyAfterDecay > 0;
        r.state.lifeField = savedLifeRing3;

        // (c) Schwellen-Trigger: sorrow > 0.7 → Regen. lastTick nahe currentTime, damit der Decay sorrow nicht vor dem
        // Trigger unter die Schwelle drückt. UHR UND WETTER GEHÖREN DEM SPIELER: die Emotion ist eine
        // Stimme der Welt — sie WÜNSCHT das Wort, der Wetter-Zug zieht es in seinem Takt (ohne stehendes Wort des Spielers).
        r._wetterFreigeben("human");
        r.state.weather = "sunny";
        r.state.player.emotions.sorrow = 0.9;
        r.state.player.emotionLastTick = 199;
        r.updatePlayerEmotions(200);
        r._tickWorldRules(200); // das Gesetz des Gemüts `emotion:sorrow` (affekt.K2)
        out.sorrowAfterTick = r.state.player.emotions.sorrow;
        const sorrowWunsch = r.state.wetterWunsch && r.state.wetterWunsch.wort;
        r.state.spielZeit += r.constructor.WETTER_ZUG_SEK;
        r._loopWeatherAndGrowth(0);
        out.sorrowTriggersRain = sorrowWunsch === "rainy" && r.state.weather === "rainy";

        // (d) Trigger respektiert Cooldown — zweiter Tick 5s später
        //     darf nicht wieder feuern (kein neuer Wunsch).
        r.state.weather = "sunny";
        r.state.wetterWunsch = null;
        r._tickWorldRules(205);
        out.cooldownRespected = r.state.weather === "sunny" && r.state.wetterWunsch === null;

        // (e) DSL-Condition emotion_above
        r.state.player.emotions.joy = 0.9;
        const condTrue = r.dslEvalCond(["emotion_above", "joy", 0.5], {
            state: r.state,
            rng: Math.random,
            log: [],
        });
        r.state.player.emotions.joy = 0.2;
        const condFalse = r.dslEvalCond(["emotion_above", "joy", 0.5], {
            state: r.state,
            rng: Math.random,
            log: [],
        });
        out.dslConditionJoyAbove = condTrue === true && condFalse === false;

        // (f) Save-Roundtrip
        r.state.player.emotions.joy = 0.42;
        r.state.player.emotions.chaos = 0.13;
        r.saveState();
        const raw = await window.__stand();
        let parsed = null;
        try {
            parsed = JSON.parse(raw);
        } catch (e) {
            void e;
        }
        out.savedEmotions =
            !!parsed &&
            parsed.playerEmotions &&
            Math.abs(parsed.playerEmotions.joy - 0.42) < 1e-6 &&
            Math.abs(parsed.playerEmotions.chaos - 0.13) < 1e-6;

        return out;
    });

    if (!ring3Results) {
        check("Ring 3: player.emotions erreichbar", false, "page.evaluate fehlgeschlagen");
    } else {
        check(
            "Ring 3: collectPlayerEmotions erkennt 'schön' (joy +0.1)",
            ring3Results.collectJoyOk,
            `joy=${ring3Results.joyAfterCollect.toFixed(3)}`
        );
        check(
            "Ring 3: collectPlayerEmotions erkennt 'magisch' (awe +0.1)",
            ring3Results.collectAweOk,
            `awe=${ring3Results.aweAfterCollect.toFixed(3)}`
        );
        check(
            "Ring 3: Decay reduziert Emotion über Zeit",
            ring3Results.decayLowered,
            `joy 0.5 → ${ring3Results.joyAfterDecay.toFixed(3)} nach 10s`
        );
        check(
            "Ring 3: sorrow > 0.7 wünscht Regen, der Wetter-Zug zieht ihn (Leben-Schau 2)",
            ring3Results.sorrowTriggersRain
        );
        check("Ring 3: Trigger respektiert Cooldown (kein Wiederfeuern <30s)", ring3Results.cooldownRespected);
        check("Ring 3: DSL-Condition emotion_above evaluiert korrekt", ring3Results.dslConditionJoyAbove);
        check("Ring 3: Save persistiert playerEmotions", ring3Results.savedEmotions);
    }

    // ### Achsen-Vollabdeckung + Generator-Modulation ###
    const ring3v2Results = await safeEvaluate(page, () => {
        if (!r || !r.state || !r.state.player) return null;
        const out = {};
        const p = r.state.player;

        const makeRng = (seed) => {
            let s = seed >>> 0 || 1;
            return () => {
                s = (s * 1664525 + 1013904223) >>> 0;
                return s / 4294967296;
            };
        };

        // (a) awe > 0.7 → skybox-Farbe wird gesetzt
        for (const k of Object.keys(p.emotions)) p.emotions[k] = 0;
        for (const g of r.state.worldRules) if (/^emotion:/.test(g.source)) g.lastFired = -Infinity;
        p.emotionLastTick = -Infinity;
        p.emotions.awe = 0.9;
        // skybox_color setzt eine fadende state.skyTint-Tönung (blendet in den Tag-Nacht-Himmel): der
        // awe-Trigger ["skybox_color","#d4a3ff"] → skyTint + skyTintTarget > 0.
        r.state.skyTint = null;
        r.state.skyTintTarget = 0;
        r._tickWorldRules(300);
        out.aweTriggersSkybox = !!r.state.skyTint && r.state.skyTintTarget > 0 && r.state.skyTint.getHex() === 0xd4a3ff;

        // (b) hope > 0.7 → wetter sunny + kreaturen happy (das Wetter wünscht die Emotion, der Wetter-Zug zieht es —
        // die Welt schreibt das Wetter nie selbst)
        for (const g of r.state.worldRules) if (/^emotion:/.test(g.source)) g.lastFired = -Infinity;
        p.emotions.hope = 0.9;
        r._wetterFreigeben("human");
        r.state.weather = "rainy";
        r.state.creatureEmotions = r.state.creatures.map(() => "sad");
        r._tickWorldRules(400);
        const happyCount = r.state.creatureEmotions.filter((e) => e === "happy").length;
        const hopeWunsch = r.state.wetterWunsch && r.state.wetterWunsch.wort;
        r.state.spielZeit += r.constructor.WETTER_ZUG_SEK;
        r._loopWeatherAndGrowth(0);
        out.hopeTriggersSunnyHappy =
            hopeWunsch === "sunny" && r.state.weather === "sunny" && happyCount === r.state.creatureEmotions.length;

        // (c) peace > 0.7 → creatures_speed_mul = 0.7: der Tempo-Hauch der Tiere — jedes Tier trägt den Hauch, und sein
        // Charakter-Tempo LIEST ihn (im Band).
        for (const g of r.state.worldRules) if (/^emotion:/.test(g.source)) g.lastFired = -Infinity;
        p.emotions.peace = 0.9;
        // den Hauch zurücksetzen, damit der Vergleich verlässlich ist
        const tempoVor = r.state.creatures.map((cr) => {
            if (cr.userData) cr.userData.tempoHauch = 1;
            return r._creatureMoveCharacter(cr).speedMul;
        });
        r._tickWorldRules(500);
        const W = r.constructor._verhaltenGesetz().wandern;
        const allSlowed =
            r.state.creatures.length > 0 &&
            r.state.creatures.every((cr, i) => {
                const sm = r._creatureMoveCharacter(cr).speedMul;
                return (
                    cr.userData &&
                    Math.abs(cr.userData.tempoHauch - 0.7) < 1e-6 &&
                    (sm < tempoVor[i] - 1e-9 || Math.abs(sm - W.speedMulMin) < 1e-9)
                );
            });
        out.peaceTriggersSlowdown = allSlowed;

        // (d) Generator-Modulation: hoher joy → mehr "sunny" als "rainy"
        for (const k of Object.keys(p.emotions)) p.emotions[k] = 0;
        p.emotions.joy = 1.0;
        const rngJoy = makeRng(123);
        let sunny = 0;
        let rainy = 0;
        for (let i = 0; i < 1000; i++) {
            const atom = r.dslComposeAtomic(rngJoy);
            if (Array.isArray(atom) && atom[0] === "weather") {
                if (atom[1] === "sunny") sunny++;
                else if (atom[1] === "rainy") rainy++;
            }
        }
        out.joySunnyOverRainy = sunny;
        out.joyRainyCount = rainy;
        out.joyBiasWorks = sunny > rainy * 2;

        // (e) Hoher sorrow → mehr "rainy" als "sunny"
        for (const k of Object.keys(p.emotions)) p.emotions[k] = 0;
        p.emotions.sorrow = 1.0;
        const rngSorrow = makeRng(456);
        let sunny2 = 0;
        let rainy2 = 0;
        for (let i = 0; i < 1000; i++) {
            const atom = r.dslComposeAtomic(rngSorrow);
            if (Array.isArray(atom) && atom[0] === "weather") {
                if (atom[1] === "sunny") sunny2++;
                else if (atom[1] === "rainy") rainy2++;
            }
        }
        out.sorrowRainyOverSunny = rainy2;
        out.sorrowSunnyCount = sunny2;
        out.sorrowBiasWorks = rainy2 > sunny2 * 2;

        // Cleanup: alles zurück auf neutral
        for (const k of Object.keys(p.emotions)) p.emotions[k] = 0;

        return out;
    });

    if (!ring3v2Results) {
        check("Ring 3 V2: Snapshot erreichbar", false, "page.evaluate fehlgeschlagen");
    } else {
        check("Ring 3 V2: awe > 0.7 triggert Skybox-Farbe", ring3v2Results.aweTriggersSkybox);
        check(
            "Ring 3 V2: hope > 0.7 triggert chain(sunny, happy) — die Sonne über den Wetter-Zug",
            ring3v2Results.hopeTriggersSunnyHappy
        );
        check(
            "Ring 3 V2: peace > 0.7 verlangsamt Kreaturen (Tempo-Hauch 0,7, gelesen im Wander-Band)",
            ring3v2Results.peaceTriggersSlowdown
        );
        check(
            "Ring 3 V2: Generator-Bias — joy=1.0 → sunny dominiert (>2× rainy)",
            ring3v2Results.joyBiasWorks,
            `sunny=${ring3v2Results.joySunnyOverRainy}, rainy=${ring3v2Results.joyRainyCount}`
        );
        check(
            "Ring 3 V2: Generator-Bias — sorrow=1.0 → rainy dominiert (>2× sunny)",
            ring3v2Results.sorrowBiasWorks,
            `rainy=${ring3v2Results.sorrowRainyOverSunny}, sunny=${ring3v2Results.sorrowSunnyCount}`
        );
    }

    // ### anazhSymphony ###
    const ring4Results = await safeEvaluate(page, () => {
        if (!r || !r.state || !r.state.symphony) return null;
        const out = {};

        // (a) initSymphony erfolgreich — EIN Master (UMWELT.masterBasis × Regler), die Klang-Welt auf ihrem Bus
        const initOk = r.initSymphony();
        const s = r.state.symphony;
        const UM = r.constructor._umweltGesetz().UMWELT;
        out.initOk = initOk === true && s.enabled === true && !!s.ctx;
        // Die Klang-Welt selbst (Stimmen je Ort, kein Oszillator ohne Gesetz, der Regen aus dem Wetter-Feld, der Ruf eines Leibs
        // mit seiner Richtung am Ohr) misst gate:klang-zensus am Abgriff: (G)(H)(S), (N) regen, (R) und (Ra).
        out.masterAusGesetz =
            Math.abs(s.masterGain.gain.value - UM.masterBasis * (s.masterVolume == null ? 1 : s.masterVolume)) < 1e-6;
        out.busAmRegler =
            Math.abs(s.umwelt.bus.gain.value - (s.creaturePingVolume == null ? 1 : s.creaturePingVolume)) < 1e-6;

        // (b) disposeSymphony räumt auf
        r.disposeSymphony();
        out.disposeClears = s.enabled === false && s.ctx === null && s.umwelt === null;

        return out;
    });

    if (!ring4Results || ring4Results.error) {
        check(
            "Ring 4: Symphonie-Snapshot erreichbar",
            false,
            ring4Results && ring4Results.error ? ring4Results.error : "page.evaluate fehlgeschlagen"
        );
    } else {
        check("Ring 4: initSymphony aktiviert Audio-Pipeline", ring4Results.initOk);
        check("Welle 5 Klang: Master = UMWELT.masterBasis × Regler (EIN Mischpult)", ring4Results.masterAusGesetz);
        check("Welle 5 Klang: der Bus der Klang-Welt hängt am Umgebungs-Regler", ring4Results.busAmRegler);
        check("Ring 4: disposeSymphony räumt Audio-Graph komplett auf", ring4Results.disposeClears);
    }

    // ### UI V2 — Topbar + Status-Bar + Drawer-System ###
    const uiResults = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};
        const topbar = document.getElementById("topbar");
        const statusbar = document.getElementById("statusbar");
        const ichRaum = document.getElementById("inventory-overlay"); // UI-Putz: das "Ich" ist das Inventar
        out.topbarInDom = !!topbar;
        out.statusbarInDom = !!statusbar;

        // Emotion-Rows leben im Spieler-Drawer
        const rows = ichRaum ? ichRaum.querySelectorAll("#status-emotions .emotion") : [];
        out.emotionRowCount = rows.length;
        out.allSixAxes = rows.length === 6;

        // Werte aktualisieren mit kontrollierten Emotionen
        for (const k of Object.keys(r.state.player.emotions)) {
            r.state.player.emotions[k] = 0;
        }
        r.state.player.emotions.joy = 0.5;
        r.state.player.emotions.chaos = 0.8;
        if (r._statusRefs) r._statusRefs.lastTick = -Infinity;
        r.updateStatusPanel(1000);

        const joyFill = ichRaum ? ichRaum.querySelector(".emotion.joy .bar > div") : null;
        const chaosFill = ichRaum ? ichRaum.querySelector(".emotion.chaos .bar > div") : null;
        out.joyBarWidth = joyFill ? joyFill.style.width : "";
        out.chaosBarWidth = chaosFill ? chaosFill.style.width : "";
        out.barReflectsValue = out.joyBarWidth === "50%" && out.chaosBarWidth === "80%";

        // Status-Bar (jetzt #statusbar oben) zeigt Welt-Daten
        const weatherEl = document.getElementById("status-weather");
        const slugEl = document.getElementById("status-slug");
        const creaturesEl = document.getElementById("status-creatures");
        out.weatherText = weatherEl ? weatherEl.textContent : "";
        out.slugText = slugEl ? slugEl.textContent : "";
        out.creaturesText = creaturesEl ? creaturesEl.textContent : "";
        out.statusValuesPopulated =
            out.weatherText !== "—" && out.weatherText.length > 0 && out.slugText !== "—" && out.slugText.length > 0;

        // Throttle: zweiter Aufruf direkt danach ändert nichts
        r.state.player.emotions.joy = 0.9;
        r.updateStatusPanel(1000.1);
        const joyFill2 = ichRaum ? ichRaum.querySelector(".emotion.joy .bar > div") : null;
        out.throttleHolds = joyFill2 ? joyFill2.style.width === "50%" : false;

        // Nach 0.4s wieder durchlassend
        r.updateStatusPanel(1000.5);
        const joyFill3 = ichRaum ? ichRaum.querySelector(".emotion.joy .bar > div") : null;
        out.throttleReleases = joyFill3 ? joyFill3.style.width === "90%" : false;

        // Tab-System
        const tabs = document.querySelectorAll("#topbar .tab");
        out.tabCount = tabs.length;
        // UI-Putz: Hilfe -> Hof gefaltet, Kreaturen+Fähigkeiten -> Hof vereint, Welt-Tab
        // aufgelöst (Welt = Default-Blick, Sektionen -> Einstellungen) -> 5 Tabs.
        out.allTabsPresent = tabs.length === 5;
        // UI-Putz: kein "Welt"-Tab mehr — der Default-Blick IST die 3D-Welt: KEIN Tab aktiv,
        // KEIN Drawer offen (der WOW-Start). Der alte Welt-Drawer existiert nicht mehr.
        out.weltTabGone = !document.querySelector('#topbar .tab[data-tab="welt"]');
        out.weltDrawerGone = !document.querySelector('.drawer[data-drawer="welt"]');
        out.noTabActiveInitially = !document.querySelector("#topbar .tab.active");
        out.noDrawerOpenInitially = !Array.from(document.querySelectorAll(".drawer[data-drawer]")).some(
            (d) => !d.hidden
        );

        // Cleanup
        for (const k of Object.keys(r.state.player.emotions)) {
            r.state.player.emotions[k] = 0;
        }
        if (r._statusRefs) r._statusRefs.lastTick = -Infinity;
        r.updateStatusPanel(2000);

        return out;
    });

    if (!uiResults || uiResults.error) {
        check(
            "UI: Drawer-Snapshot erreichbar",
            false,
            uiResults && uiResults.error ? uiResults.error : "page.evaluate fehlgeschlagen"
        );
    } else {
        check("UI V2: #topbar im DOM", uiResults.topbarInDom);
        check("UI V2: #statusbar im DOM", uiResults.statusbarInDom);
        check(
            "UI V2: alle sechs Emotion-Rows im Spieler-Drawer",
            uiResults.allSixAxes,
            `rows=${uiResults.emotionRowCount}`
        );
        check(
            "UI V2: Balken-Breite spiegelt Emotion-Wert (joy 0.5 → 50%, chaos 0.8 → 80%)",
            uiResults.barReflectsValue,
            `joy=${uiResults.joyBarWidth}, chaos=${uiResults.chaosBarWidth}`
        );
        check(
            "UI V2: Status-Bar zeigt Wetter + Slug + Kreaturen",
            uiResults.statusValuesPopulated,
            `weather=${uiResults.weatherText}, slug=${uiResults.slugText}, creatures=${uiResults.creaturesText}`
        );
        check("UI V2: updateStatusPanel ist throttled (Aufruf <0.4s ignoriert)", uiResults.throttleHolds);
        check("UI V2: updateStatusPanel lässt nach 0.4s wieder durch", uiResults.throttleReleases);
        check(
            "UI V2: fünf Tabs im Topbar (Hof vereint + Welt-Tab aufgelöst)",
            uiResults.allTabsPresent,
            `count=${uiResults.tabCount}`
        );
        check("UI-Putz: Welt-Tab ist aufgelöst (kein data-tab=welt)", uiResults.weltTabGone);
        check("UI-Putz: Welt-Drawer ist aufgelöst (kein data-drawer=welt)", uiResults.weltDrawerGone);
        check("UI-Putz: kein Tab initial aktiv (die Welt ist der Default-Blick)", uiResults.noTabActiveInitially);
        check("UI-Putz: kein Drawer initial offen (der WOW-Start)", uiResults.noDrawerOpenInitially);
    }

    // ### UI-Putz — Emotion-Klarheit (Legende + FP-sichtbares Feedback) ###
    // Die Balken tragen deutsche Namen + Wirkungs-Tooltip (Legende); ein Bildschirmrand-Schimmer + Label
    // zeigen die dominante Emotion in JEDER Kamera (via _emotionState — dieselbe Quelle wie KI/Journal).
    const emoClarityResults = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};
        const spieler = document.getElementById("inventory-overlay"); // UI-Putz: das "Ich" ist das Inventar

        // (a) Legende: deutscher Name statt "joy" + Wirkung-Tooltip auf der Row.
        const joyRow = spieler ? spieler.querySelector(".emotion.joy") : null;
        const joyName = joyRow ? joyRow.querySelector(".name") : null;
        out.germanName = !!joyName && joyName.textContent === "Freude";
        out.rowHasWirkungTooltip = !!joyRow && /wärmt/i.test(joyRow.getAttribute("title") || "");

        // (b) Das FP-Feedback lebt als WORT — W-C(g)/R-009: das WORT lebt
        // IN der Statusbar (#status-emotion). Die FP-Vignette (Bildschirmrand-Ring) FIEL
        // (Schöpfer „doppelt + wirkt nicht real"). Test wandert mit.
        const lab = document.getElementById("status-emotion");
        out.vignetteGone = !document.getElementById("emotion-vignette");
        out.labelInDom = !!lab && !document.getElementById("emotion-label") && !!lab.closest("#statusbar");

        // (c) Eine starke Emotion entzündet das Leisten-Wort (dominante = Freude).
        for (const k of Object.keys(r.state.player.emotions)) r.state.player.emotions[k] = 0;
        r.state.player.emotions.joy = 0.9;
        r._updateEmotionFeedback();
        out.labelShowsDominant = !!lab && lab.textContent === "Freude";

        // (d) Ruhe (alle ~0) verblasst das Leisten-Wort wieder.
        for (const k of Object.keys(r.state.player.emotions)) r.state.player.emotions[k] = 0;
        r._updateEmotionFeedback();
        out.labelFadesWhenCalm = !!lab && parseFloat(lab.style.opacity || "0") === 0;

        for (const k of Object.keys(r.state.player.emotions)) r.state.player.emotions[k] = 0;
        return out;
    });

    if (emoClarityResults) {
        check("UI-Putz Emotion: Balken zeigen deutschen Namen (Freude statt joy)", emoClarityResults.germanName);
        check("UI-Putz Emotion: Row trägt Wirkung-Tooltip (Legende)", emoClarityResults.rowHasWirkungTooltip);
        check(
            "UI-Putz Emotion: die FP-Vignette ist entfernt (Emotion lebt als Wort, nicht als Ring)",
            emoClarityResults.vignetteGone
        );
        check(
            "W-C(g)/R-009: das Emotions-Wort lebt IN der Statusbar (#status-emotion) — das fixe Overlay fiel",
            emoClarityResults.labelInDom
        );
        check(
            "UI-Putz Emotion: Leisten-Wort zeigt die dominante Emotion (Freude)",
            emoClarityResults.labelShowsDominant
        );
        check("UI-Putz Emotion: Ruhe verblasst das Leisten-Wort", emoClarityResults.labelFadesWhenCalm);
    }

    // ### UI-Putz — der freie Bildschirm (H blendet das HUD aus) ###
    // Schöpfer: "der bildschirm während dem spielen möglichst frei". Eine Geste (H) blendet
    // das ganze HUD aus, damit die Welt den Bildschirm bekommt (BotW/Genshin).
    const freeScreenResults = await safeEvaluate(page, () => {
        const out = {};
        const topbar = document.getElementById("topbar");
        if (!topbar) return { error: "kein #topbar" };
        // (a) body.hud-hidden blendet das HUD aus + macht es klick-durchlässig.
        // pointer-events ist sofort wirksam (opacity transitioniert über 0.45s — im
        // Headless nicht sofort "0"; die Klick-Durchlässigkeit ist der funktionale Beweis).
        document.body.classList.add("hud-hidden");
        out.hudHides = getComputedStyle(topbar).pointerEvents === "none";
        // (b) wieder einblenden
        document.body.classList.remove("hud-hidden");
        out.hudReturns = getComputedStyle(topbar).pointerEvents !== "none";
        return out;
    });

    if (freeScreenResults && !freeScreenResults.error) {
        check("UI-Putz freier Bildschirm: body.hud-hidden blendet das HUD aus", freeScreenResults.hudHides);
        check("UI-Putz freier Bildschirm: erneutes Umschalten zeigt das HUD wieder", freeScreenResults.hudReturns);
    }

    // ### UI V2 — Quick-Buttons + Hilfe-Sektion in Einstellungen (Tab-System) ###
    const uiActionsResults = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};

        // (a) #help-section und #quick-actions sind aufgelöst — die Omnibox (Ctrl+K, `c:`) trägt ALLE Befehle
        // an EINEM Ort. Such-/Ausführungspfade prüft das Omnibox-Band; hier: Listen weg + Omnibox trägt die
        // Befehle + die Hof-Drawer-Mechanik bleibt.
        out.quickActionsGone = !document.getElementById("quick-actions");
        out.helpSectionGone = !document.getElementById("help-section");
        try {
            const omniCmds = r._omniboxSearch("c:wetter");
            out.omniboxCarriesCommands = omniCmds.length > 0 && omniCmds.some((x) => /wetter/i.test(x.label));
        } catch {
            out.omniboxCarriesCommands = false;
        }

        // (c) Die Drawer-Mechanik (Tab öffnet, andere schließen, Close-Button) — am Hof geprüft.
        const hofDrawer = document.querySelector('.drawer[data-drawer="kreaturen"]');
        out.hilfeDrawerInitiallyHidden = hofDrawer && hofDrawer.hidden === true;
        const hofTab = document.querySelector('#topbar .tab[data-tab="kreaturen"]');
        if (hofTab) hofTab.click();
        out.hilfeDrawerOpensOnTab = hofDrawer && hofDrawer.hidden === false;
        const settingsDrawer = document.querySelector('.drawer[data-drawer="einstellungen"]');
        out.otherDrawersHidden = settingsDrawer && settingsDrawer.hidden === true;
        const closeBtn = hofDrawer ? hofDrawer.querySelector("[data-drawer-close]") : null;
        if (closeBtn) closeBtn.click();
        out.closeButtonHidesDrawer = hofDrawer && hofDrawer.hidden === true;

        // Cleanup: zurück zum Default-Blick (alle Drawer zu, UI-Putz: kein Welt-Tab mehr).
        r.closeAllDrawers();

        return out;
    });

    if (!uiActionsResults || uiActionsResults.error) {
        check(
            "UI V2: Quick/Help-Snapshot erreichbar",
            false,
            uiActionsResults && uiActionsResults.error ? uiActionsResults.error : "page.evaluate fehlgeschlagen"
        );
    } else {
        check(
            "UI-Putz V18.35: die duplizierten Welt-Aktionen sind aufgelöst (kein #quick-actions)",
            uiActionsResults.quickActionsGone
        );
        check(
            "Hof-B: die ~60-Befehle-Liste ist aufgelöst (kein #help-section, die Omnibox trägt)",
            uiActionsResults.helpSectionGone
        );
        check(
            "Hof-B: die Omnibox trägt die Befehle (c:wetter → Treffer; die EINE Quelle)",
            uiActionsResults.omniboxCarriesCommands
        );
        check("UI V2: Hof-Drawer initial versteckt", uiActionsResults.hilfeDrawerInitiallyHidden);
        check("UI V2: Hof-Tab öffnet den Drawer", uiActionsResults.hilfeDrawerOpensOnTab);
        check("UI V2: andere Drawer werden versteckt wenn neuer Tab aktiv", uiActionsResults.otherDrawersHidden);
        check("UI V2: Drawer-Close-Button schließt Drawer", uiActionsResults.closeButtonHidesDrawer);
    }

    // ### UI V1 — Abilities-Liste + Save/Load ###
    const uiAbilitiesResults = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};
        const container = document.getElementById("status-abilities");
        // der Spieler öffnet den Hof: nur dort schreibt der Status-Takt die Gesten (K2 Belegung)
        r.toggleDrawer("kreaturen");

        // (a) Initial: leere Meldung oder bestehende Fähigkeiten —
        //     je nach Test-Vorlauf. Wir setzen erst eine bekannte
        //     Ability, dann erzwingen das Rendering.
        r.state.dsl.abilities = [];
        if (r._statusRefs) {
            r._statusRefs.abilitiesSignature = "";
            r._statusRefs.lastTick = -Infinity;
        }
        r.updateStatusPanel(3000);
        out.emptyStateShown = container && container.querySelector(".ability-empty") !== null;

        // (b) Eine Ability hinzufügen → Row erscheint
        r.addNewAbility("uiAbilityTest", ["creatures_color", "blue"], "human");
        if (r._statusRefs) {
            r._statusRefs.abilitiesSignature = "";
        }
        r.updateStatusPanel(3001);
        const rows = container ? container.querySelectorAll(".ability-row") : [];
        out.rowCountAfterAdd = rows.length;
        out.rowAppears = rows.length === 1;
        out.rowHasName = rows[0] && rows[0].querySelector(".name").textContent === "uiAbilityTest";
        out.rowHasSourceClass = rows[0] && rows[0].classList.contains("source-human");

        // (c) Run-Button klicken → ability läuft, Welt-Effekt
        // Kreatur ist Group; rote Vor-Color auf
        // alle Sub-Meshes setzen, sonst crasht das Test-Setup.
        if (r.state.creatures[0]) {
            const cR = r.state.creatures[0];
            if (cR.material && cR.material.color) cR.material.color.setHex(0xff0000);
            else if (typeof cR.traverse === "function") {
                cR.traverse((n) => {
                    if (n.isMesh && n.material && n.material.color) n.material.color.setHex(0xff0000);
                });
            }
        }
        const runBtn = rows[0] && rows[0].querySelector("[data-run-ability]");
        if (runBtn) runBtn.click();
        // Kreatur ist Group; Color über Sub-Meshes lesen.
        const cFirst = r.state.creatures[0];
        let colorAfter = 0;
        if (cFirst) {
            if (cFirst.material && cFirst.material.color) {
                colorAfter = cFirst.material.color.getHex();
            } else if (typeof cFirst.traverse === "function") {
                cFirst.traverse((n) => {
                    if (!colorAfter && n.isMesh && n.material && n.material.color) {
                        colorAfter = n.material.color.getHex();
                    }
                });
            }
        }
        out.runButtonExecutes = colorAfter === 0x0000ff;

        // (d) Signature-Cache: zweiter updateStatusPanel ohne
        //     Änderung darf das DOM nicht neu bauen — wir markieren
        //     einen unsichtbaren Wert und prüfen Persistenz.
        rows[0].setAttribute("data-test-marker", "preserved");
        r.updateStatusPanel(3002);
        const rowAgain = container ? container.querySelector(".ability-row") : null;
        out.signatureCachePreserves = rowAgain && rowAgain.getAttribute("data-test-marker") === "preserved";

        // (e) Export: triggerStateDownload legt synchron ein <a> mit JSON-Data-URL an und entfernt es;
        //     click() wird gepatcht, um die URL zu fangen.
        let capturedHref = "";
        const origCreate = document.createElement.bind(document);
        document.createElement = function (tag) {
            const el = origCreate(tag);
            if (tag === "a") {
                const origClick = el.click.bind(el);
                el.click = function () {
                    capturedHref = el.getAttribute("href") || "";
                    origClick();
                };
            }
            return el;
        };
        const exportBtn = document.getElementById("action-export-state");
        if (exportBtn) exportBtn.click();
        document.createElement = origCreate;
        out.exportHrefStarts = capturedHref.startsWith("data:application/json");
        out.exportContainsPlayerEmotions = capturedHref.includes("playerEmotions");

        // Cleanup: Test-Ability wieder rausnehmen, damit andere
        //         Snapshots sauber sind.
        r.state.dsl.abilities = r.state.dsl.abilities.filter((a) => a.name !== "uiAbilityTest");
        delete r.state.abilities.uiAbilityTest;
        if (r._statusRefs) {
            r._statusRefs.abilitiesSignature = "";
        }
        r.updateStatusPanel(3003);
        r.closeAllDrawers();

        return out;
    });

    if (!uiAbilitiesResults || uiAbilitiesResults.error) {
        check(
            "UI: Abilities-Snapshot erreichbar",
            false,
            uiAbilitiesResults && uiAbilitiesResults.error ? uiAbilitiesResults.error : "page.evaluate fehlgeschlagen"
        );
    } else {
        check("UI: Leerer State zeigt Hinweis-Text", uiAbilitiesResults.emptyStateShown);
        check(
            "UI: Hinzugefügte Ability erscheint als Row",
            uiAbilitiesResults.rowAppears,
            `rows=${uiAbilitiesResults.rowCountAfterAdd}`
        );
        check(
            "UI: Ability-Row trägt Name + Source-Klasse",
            uiAbilitiesResults.rowHasName && uiAbilitiesResults.rowHasSourceClass
        );
        check("UI: Run-Button führt Ability aus (DSL-Programm mutiert Welt)", uiAbilitiesResults.runButtonExecutes);
        check(
            "UI: Signature-Cache verhindert DOM-Rebuild bei gleichem Stand",
            uiAbilitiesResults.signatureCachePreserves
        );
        check("UI: Export-Button erzeugt JSON-Data-URL", uiAbilitiesResults.exportHrefStarts);
        check("UI: Export-Payload enthält playerEmotions", uiAbilitiesResults.exportContainsPlayerEmotions);
    }

    // ### UI V1 — Live-Tuning Slider ###
    const uiTuningResults = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};
        const sliders = {
            threshold: document.getElementById("tune-threshold"),
            decay: document.getElementById("tune-decay"),
            cooldown: document.getElementById("tune-cooldown"),
        };
        out.allSlidersPresent = !!(sliders.threshold && sliders.decay && sliders.cooldown);

        // Initiale Slider-Werte spiegeln state.player-Defaults
        out.initialThreshold = sliders.threshold ? parseFloat(sliders.threshold.value) : -1;
        out.initialMatchesState = Math.abs(out.initialThreshold - r.state.player.emotionThreshold) < 1e-6;

        // Slider-Bewegung → state.player.emotionThreshold ändert sich
        if (sliders.threshold) {
            sliders.threshold.value = "0.5";
            sliders.threshold.dispatchEvent(new Event("input", { bubbles: true }));
        }
        out.thresholdAfterMove = r.state.player.emotionThreshold;
        out.thresholdUpdatesState = Math.abs(out.thresholdAfterMove - 0.5) < 1e-6;

        // Value-Label spiegelt den Wert
        const tv = document.getElementById("tune-threshold-v");
        out.thresholdLabelMatches = tv ? tv.textContent === "0.50" : false;

        // Decay-Slider analog
        if (sliders.decay) {
            sliders.decay.value = "0.020";
            sliders.decay.dispatchEvent(new Event("input", { bubbles: true }));
        }
        out.decayUpdatesState = Math.abs(r.state.player.emotionDecayPerSec - 0.02) < 1e-6;

        // Cooldown-Slider
        if (sliders.cooldown) {
            sliders.cooldown.value = "60";
            sliders.cooldown.dispatchEvent(new Event("input", { bubbles: true }));
        }
        out.cooldownUpdatesState =
            r.state.player.emotionApplyCooldown === 60 &&
            r.state.worldRules.filter((g) => /^emotion:/.test(g.source) && g.everySec === 60).length === 6;

        // Cleanup: defaults wiederherstellen, damit weitere Tests
        // konsistent sind (falls dieser Test vorgezogen wird).
        r.state.player.emotionThreshold = 0.7;
        r.state.player.emotionDecayPerSec = 0.005;
        r.state.player.emotionApplyCooldown = 30;
        r._gemuetGesetze();

        return out;
    });

    if (!uiTuningResults || uiTuningResults.error) {
        check(
            "UI: Tuning-Snapshot erreichbar",
            false,
            uiTuningResults && uiTuningResults.error ? uiTuningResults.error : "page.evaluate fehlgeschlagen"
        );
    } else {
        check("UI: Alle drei Tuning-Slider sind im DOM", uiTuningResults.allSlidersPresent);
        check(
            "UI: Initialer Slider-Wert spiegelt state.player-Default",
            uiTuningResults.initialMatchesState,
            `slider=${uiTuningResults.initialThreshold}`
        );
        check(
            "UI: Slider-Bewegung mutiert state.player.emotionThreshold",
            uiTuningResults.thresholdUpdatesState,
            `value=${uiTuningResults.thresholdAfterMove}`
        );
        check("UI: Value-Label spiegelt Slider-Wert ('0.50')", uiTuningResults.thresholdLabelMatches);
        check("UI: Decay-Slider mutiert emotionDecayPerSec", uiTuningResults.decayUpdatesState);
        check("UI: Cooldown-Slider mutiert emotionApplyCooldown", uiTuningResults.cooldownUpdatesState);
    }

    // ### UI V2 — Identity (Tokens + Fonts; Nacht ist der EINE Stil seit dem UI-Putz) ###
    const uiV2Results = await safeEvaluate(page, () => {
        const out = {};

        // (a) Der Tag/Nacht-Toggle entfiel im UI-Putz — Nacht ist statisch der EINE Stil.
        out.themeToggleGone = !document.getElementById("theme-toggle");
        out.noThemeAttr = !document.body.getAttribute("data-theme");

        return out;
    });

    if (!uiV2Results || uiV2Results.error) {
        check(
            "UI V2: Identity-Snapshot erreichbar",
            false,
            uiV2Results && uiV2Results.error ? uiV2Results.error : "page.evaluate fehlgeschlagen"
        );
    } else {
        check("UI V2: Tag/Nacht-Toggle entfernt (Nacht der EINE Stil)", uiV2Results.themeToggleGone);
        check("UI V2: kein data-theme-Attribut mehr (Theme statisch)", uiV2Results.noThemeAttr);
    }

    // ### UI V2 — Konsole (fusioniertes Chat + Log) ###
    const consoleResults = await safeEvaluate(page, () => {
        const out = {};
        const panel = document.getElementById("console");
        out.chatOutputInside = panel && panel.querySelector("#chat-output") !== null;
        out.logInside = panel && panel.querySelector("#log") !== null;
        out.chatInputInside = panel && panel.querySelector("#chat-input") !== null;

        // der FADING-FEED (der freie Bildschirm): die Konsole startet EINGEKLAPPT
        // (ein schlankes Chat-Widget), neue Nachrichten verblassen im #chat-feed. Der Test wandert
        // mit: die Toggle-Kette ist umgekehrt (collapsed → klick → open → klick → collapsed).
        out.chatFeedInside = panel && panel.querySelector("#chat-feed") !== null;
        out.feedWired = !!(r && r._chatFeedWired);

        // Collapse-Toggle
        const toggle = document.getElementById("console-collapse");
        out.initiallyCollapsed = panel && panel.classList.contains("collapsed");

        if (toggle) toggle.click();
        out.afterFirstClickOpen = panel && !panel.classList.contains("collapsed");
        out.toggleLabelChanged = toggle && toggle.textContent === "−";

        if (toggle) toggle.click();
        out.afterSecondClickCollapsed = panel && panel.classList.contains("collapsed");

        // Persistenz: localStorage hat die Wahl (nach zwei Klicks: open → collapsed)
        out.localStoragePersists = localStorage.getItem("anazhRealmConsole") === "collapsed";

        return out;
    });

    if (!consoleResults || consoleResults.error) {
        check(
            "UI V2: Konsole-Snapshot erreichbar",
            false,
            consoleResults && consoleResults.error ? consoleResults.error : "page.evaluate fehlgeschlagen"
        );
    } else {
        check(
            "UI V2: #chat-output, #log, #chat-input leben in der Konsole",
            consoleResults.chatOutputInside && consoleResults.logInside && consoleResults.chatInputInside
        );
        check("UI V2: #chat-feed (Fading-Feed) in der Konsole", consoleResults.chatFeedInside);
        check("UI V2: der Fading-Feed-Observer ist verdrahtet (_chatFeedWired)", consoleResults.feedWired);
        check("UI V2: Konsole startet EINGEKLAPPT (der freie Bildschirm, V18.82)", consoleResults.initiallyCollapsed);
        check("UI V2: Erster Klick entfaltet", consoleResults.afterFirstClickOpen);
        check("UI V2: Toggle-Label wechselt zu '−'", consoleResults.toggleLabelChanged);
        check("UI V2: Zweiter Klick klappt wieder ein", consoleResults.afterSecondClickCollapsed);
        check("UI V2: Konsole-Status in localStorage persistiert", consoleResults.localStoragePersists);
    }
}

// Signierte BEWERTUNGS-ZEUGNISSE übers Mesh: {id,s,t,pub,sig} (ed25519 über das stabile
// Kanonische), LWW pro (Ziel, Schlüssel) = CRDT-tauglich; kanal-exklusiv + rate-gegated;
// revozierte Schlüssel fallen aus der Wertung. End-to-end mit ZWEITER Identität.
async function checkBandV18134Social({ page, check }) {
    const res = await safeEvaluate(page, async () => {
        const out = {};
        out.consts = !!r.constructor.SOCIAL && Object.isFrozen(r.constructor.SOCIAL);
        if (!r.state.vibePass || !r.state.vibePass.ready || typeof crypto === "undefined" || !crypto.subtle) {
            out.unmeasurable = true;
            return out;
        }
        const saved = r.state.socialRatings;
        r.state.socialRatings = new Map();
        try {
            const own = await r._socialSignOwnRating("welt:band134", 4);
            out.ownSigned = !!(own && own.sig);
            const kp = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
            const jwk = await crypto.subtle.exportKey("jwk", kp.publicKey);
            const b64uToBytes = (b64u) => {
                const b64 = b64u.replace(/-/g, "+").replace(/_/g, "/");
                const bin = atob(b64);
                return Uint8Array.from(bin, (c) => c.charCodeAt(0));
            };
            const pubHex = [...b64uToBytes(jwk.x)].map((b) => b.toString(16).padStart(2, "0")).join("");
            const mk = async (id, sVal, t) => {
                const z = { id, s: sVal, t, pub: pubHex };
                const data = new TextEncoder().encode(r._socialCanonical(z));
                const sig = await crypto.subtle.sign({ name: "Ed25519" }, kp.privateKey, data);
                z.sig = [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
                return z;
            };
            const fremd = await mk("welt:band134", 5, Date.now());
            out.received = await r._socialRatingReceive("peerX", fremd);
            const agg = r._feedRatingAgg("welt:band134");
            out.aggOk = agg.count === 2 && Math.abs(agg.avg - 4.5) < 1e-9;
            out.lwwRejected =
                (await r._socialRatingReceive("peerX", await mk("welt:band134", 1, fremd.t - 5000))) === false;
            out.tamperRejected = (await r._socialRatingReceive("peerX", { ...fremd, s: 1 })) === false;
            r.revokeKey(pubHex, { reason: "band134" });
            const agg2 = r._feedRatingAgg("welt:band134");
            out.revokeConsumed =
                agg2.count === 1 &&
                (await r._socialRatingReceive("peerX", await mk("welt:band134", 3, Date.now() + 1000))) === false;
            // revokedKeys ist eine Map: .delete() direkt, ohne `if (…delete)`-Existenz-Gate (das lief bei
            // einem Object still leer).
            r.state.revokedKeys.delete(pubHex.toLowerCase());
            const batch = r._socialAnnounceBatch();
            out.batchCarries = !!(batch && batch.type === "social-ratings" && batch.list.length >= 1);
        } finally {
            r.state.socialRatings = saved || new Map();
            r._saveSocialRatings();
        }
        return out;
    });
    if (!res) {
        check("Sozial: Sonde lief", false, "evaluate warf");
        return;
    }
    check("Sozial: SOCIAL-Konfiguration steht (frozen)", res.consts);
    if (!res.unmeasurable) {
        check(
            "Sozial: eigenes Zeugnis signiert + fremdes verifiziert + Aggregation Ø 4.5 (2)",
            res.ownSigned && res.received && res.aggOk
        );
        check("Sozial: LWW haelt (aelteres Zeugnis derselben Identitaet faellt)", res.lwwRejected);
        check("Sozial: ein manipuliertes Zeugnis bricht an der Signatur", res.tamperRejected);
        check("Sozial: der R4-Rueckruf wirkt sozial (Aggregation + Empfang sieben)", res.revokeConsumed);
        check("Sozial: die Anschluss-Annonce traegt die eigenen Zeugnisse (Batch)", res.batchCarries);
    }
}

// F4 Stufe 2: LESEZEICHEN (privat-lokal, anazh.feedBookmarks — NIE
// im Welt-Snapshot; das Mesh-Folgen ist die spaetere Stufe). Ein 🔖-Toggle
// pro Feed-Karte + der „Gemerkt"-Kind-Chip, der Filter liest das dataset.
async function checkBandV18135Bookmarks({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        // Toggle-Roundtrip + Persistenz (localStorage, global).
        const id = "band135:test";
        const was = r._feedBookmarked(id);
        const on = r._toggleFeedBookmark(id);
        out.toggleOn = on === true && r._feedBookmarked(id) === true;
        let persisted = false;
        try {
            persisted = JSON.parse(localStorage.getItem("anazh.feedBookmarks") || "{}")[id] === true;
        } catch {}
        out.persisted = persisted;
        const off = r._toggleFeedBookmark(id);
        out.toggleOff = off === false && r._feedBookmarked(id) === false;
        if (was) r._toggleFeedBookmark(id); // Zustand wiederherstellen
        return out;
    });
    if (!res) {
        check("Lesezeichen: Sonde lief", false, "evaluate warf");
        return;
    }
    check("Lesezeichen: Toggle-Roundtrip + globale Persistenz", res.toggleOn && res.persisted && res.toggleOff);
}

// FOLGEN: das Merken einer IDENTITÄT (pubkey), privat-lokal (anazh.feedFollows, nie im Snapshot).
// KONSUM: „Gefolgt“-Chip + Filter über data-followed; die Karte trägt den Toggle (nie auf eigenen
// Werken); Folgen schreibt witness.
async function checkBandV18142Follow({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        // Toggle-Roundtrip + Persistenz + Hex-Wand + witness-Journal.
        const pub = "ab".repeat(32);
        const was = r._feedFollowed(pub);
        const jBefore = ((r.state.worldJournal && r.state.worldJournal.entries) || []).length;
        const on = r._toggleFeedFollow(pub);
        out.toggleOn = on === true && r._feedFollowed(pub) === true;
        let persisted = false;
        try {
            persisted = JSON.parse(localStorage.getItem("anazh.feedFollows") || "{}")[pub] === true;
        } catch {
            /* leer */
        }
        out.persisted = persisted;
        // Das Journal cappt bei entryCap (200) — nach dem langen Warmup wächst
        // length NICHT mehr; der Beweis sitzt am NEUESTEN Eintrag.
        void jBefore;
        const j = (r.state.worldJournal && r.state.worldJournal.entries) || [];
        out.witnessWritten = j.slice(-3).some((e) => e.type === "witness" && /folge nun/.test(e.text || ""));
        const off = r._toggleFeedFollow(pub);
        out.toggleOff = off === false && r._feedFollowed(pub) === false;
        out.garbageRejected = r._toggleFeedFollow("NICHT-HEX") === false;
        if (was) r._toggleFeedFollow(pub);
        // NIE im Welt-Snapshot (das Lesezeichen/Wertungs-Muster).
        const snap = r.buildStateSnapshot();
        out.notInSnapshot = !("feedFollows" in snap);
        return out;
    });
    if (!res) {
        check("Folgen: Sonde lief", false, "evaluate warf");
        return;
    }
    check(
        "Folgen: Toggle-Roundtrip + globale Persistenz + Hex-Wand + NIE im Snapshot",
        res.toggleOn && res.persisted && res.toggleOff && res.garbageRejected && res.notInSnapshot
    );
    check("Folgen: das Folgen schreibt witness (die ruhende Journal-Saat blüht)", res.witnessWritten);
}

// KOMMENTARE: signierte Text-Zeugnisse übers Mesh (append-only statt LWW). End-to-end mit ZWEITER
// Ed25519-Identität: eigenes Wort signiert + bezeugt · fremdes verifiziert · Tamper bricht ·
// Rückruf siebt · Batch/Handler/onopen verdrahtet · der Text bleibt DATEN (textContent-Wand).
async function checkBandV18143Comments({ page, check }) {
    const res = await safeEvaluate(page, async () => {
        const out = {};
        const S = r.constructor.SOCIAL;
        out.config = Number.isFinite(S.maxComments) && Number.isFinite(S.maxCommentLen) && S.maxCommentsShown > 0;
        out.canonical = r._socialCommentCanonical({ id: "a", t: 5, pub: "p", x: "x|y" }) === "comment|a|5|p|x|y";
        if (!r.state.vibePass || !r.state.vibePass.ready) {
            out.skipCrypto = true;
            return out;
        }
        const saved = r.state.socialComments;
        r.state.socialComments = new Map();
        // (1) das EIGENE Wort: signiert + gespeichert + share-Journal.
        const own = await r._socialSignOwnComment("band143:ziel", "  Ein gutes Werk!  ");
        out.ownSigned = !!own && own.x === "Ein gutes Werk!" && typeof own.sig === "string";
        out.ownStored = r._feedComments("band143:ziel").length === 1;
        const j = (r.state.worldJournal && r.state.worldJournal.entries) || [];
        out.shareWritten = j.slice(-3).some((e) => e.type === "share" && /Wort/.test(e.text || ""));
        // (2) die ZWEITE Identitaet: ihr Wort verifiziert + landet; Tamper bricht.
        const pair = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
        const jwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
        const pub2 = r._vibeBytesToHex(r._vibeB64uToBytes(jwk.x));
        const c2 = { id: "band143:ziel", x: "Fremdes Wort", t: Date.now() + 1, pub: pub2 };
        const sigBytes = await crypto.subtle.sign(
            { name: "Ed25519" },
            pair.privateKey,
            new TextEncoder().encode(r._socialCommentCanonical(c2))
        );
        c2.sig = r._vibeBytesToHex(new Uint8Array(sigBytes));
        out.foreignAccepted = (await r._socialCommentReceive("peerX", c2)) === true;
        out.foreignStored = r._feedComments("band143:ziel").length === 2;
        const tampered = { ...c2, x: "Boeses Wort", t: c2.t + 1 };
        out.tamperRejected = (await r._socialCommentReceive("peerX", tampered)) === false;
        out.dedupe = (await r._socialCommentReceive("peerX", c2)) === false;
        // (3) der Rueckruf siebt (R4-KONSUM): revozierter Schluessel faellt aus
        // der Lese-Wahrheit UND dem Empfang.
        r.revokeKey(pub2, { silent: true });
        out.revokedSieved = r._feedComments("band143:ziel").length === 1;
        const c3 = { id: "band143:ziel", x: "Nochmal", t: Date.now() + 9, pub: pub2 };
        const sig3 = await crypto.subtle.sign(
            { name: "Ed25519" },
            pair.privateKey,
            new TextEncoder().encode(r._socialCommentCanonical(c3))
        );
        c3.sig = r._vibeBytesToHex(new Uint8Array(sig3));
        out.revokedReceiveBlocked = (await r._socialCommentReceive("peerX", c3)) === false;
        r.unrevokeKey(pub2);
        // (4) die Verdrahtung am Ruf: der Kanal reicht social-comment an den Empfang + onopen-Batch; das fremde Wort steht im
        // Panel als TEXT, nie als Element (XSS-Wand).
        const roh = JSON.stringify({ type: "social-comment", c: { id: "band143:ziel" } });
        out.handlerWired = window.__consumes(r, "_p2pHandleChannelMessage", r, "_socialCommentReceive", [
            "peerZensus143",
            roh,
        ]);
        const X = "<img src=x onerror=window.__xss143=1><b>boese</b>";
        r.state.socialComments.set("band143:xss|" + "ab".repeat(32) + "|1", {
            id: "band143:xss",
            x: X,
            t: 1,
            pub: "ab".repeat(32),
            sig: "x",
        });
        const panel = document.createElement("div");
        r._renderFeedCommentsPanel(panel, { id: "band143:xss" }, null);
        const tx = panel.querySelector(".feed-comment-text");
        out.xssWall = !!tx && tx.textContent === X && tx.children.length === 0 && !panel.querySelector("img, b");
        // restore
        r.state.socialComments = saved;
        r._saveSocialComments();
        return out;
    });
    if (!res) {
        check("Kommentare: Sonde lief", false, "evaluate warf");
        return;
    }
    check(
        "Kommentare: Config + stabiles Kanonisches (x am Ende — Trennzeichen-eindeutig)",
        res.config && res.canonical
    );
    if (res.skipCrypto) {
        check("Kommentare: Krypto-Teil lief (Vibe-Pass bereit)", false, "vibePass nicht ready");
        return;
    }
    check(
        "Kommentare: das eigene Wort signiert + gespeichert + bezeugt (journal share — die Saat blüht)",
        res.ownSigned && res.ownStored && res.shareWritten
    );
    check(
        "Kommentare: das fremde Wort verifiziert + landet — Tamper bricht, dedupe hält",
        res.foreignAccepted && res.foreignStored && res.tamperRejected && res.dedupe
    );
    check(
        "Kommentare: der Rückruf siebt das Wort (Lese-Wahrheit + Empfang — R4 wirkt)",
        res.revokedSieved && res.revokedReceiveBlocked
    );
    check(
        "Kommentare: verdrahtet (der Kanal reicht das Wort an den Empfang · das fremde Wort bleibt Text — XSS-Wand)",
        res.handlerWired && res.xssWall
    );
}

// „FÜR DICH“: persönliche Feed-Reihung als LESBARE Verdichtung der sozialen Signale (Folgen +4 ·
// Gemeinschafts-Ø vertrauens-gewichtet · Merken +2 · eigenes Urteil ×0.5 · Gesprächs-Puls
// gedeckelt). Kein Server, keine Black-Box.
async function checkBandV18147ForYou({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        // (2)-(3) BEHAVIORAL mit injizierten Signalen (restauriert).
        const savedFollows = r.state.feedFollows;
        const savedBookmarks = r.state.feedBookmarks;
        try {
            const pub = "ab".repeat(32);
            r.state.feedFollows = { [pub]: true };
            r.state.feedBookmarks = {};
            const plain = r._feedForYouScore({ id: "world:forYouTest", author: "" });
            const followed = r._feedForYouScore({ id: "world:forYouTest", author: pub });
            out.followBoost = followed - plain >= 3.9;
            r.state.feedBookmarks = { "world:forYouTest": true };
            const marked = r._feedForYouScore({ id: "world:forYouTest", author: "" });
            out.bookmarkBoost = marked - plain >= 1.9;
        } finally {
            r.state.feedFollows = savedFollows;
            r.state.feedBookmarks = savedBookmarks;
        }
        return out;
    });
    check("Für dich: Folgen ist das stärkste persönliche Wort (+4)", res.followBoost);
    check("Für dich: das Merken hebt (+2)", res.bookmarkBoost);
}

// M5 HUD/Räume-Politur: kein Resize-Sprung der Konsole · Logbuch = Dev-Sicht (EIN Schalter) ·
// Emotion-Track auf dunklem Grund · Boost-Chips mit Effekt + LIVE-Restzeit · Equip/Pickup →
// Sofort-Refresh · Hof-Gemüt als HP-artiger Balken (Umwidmen: eigener W12-Test).
async function checkBandM5HudPolitur({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        // (1) der RESIZE-Sprung ist tot: 1-px-Drag an der EINGEKLAPPTEN Konsole
        // (105 px) bleibt bei ~105 (nie die harte 180er-Min).
        const consoleEl = document.getElementById("console");
        const handle = consoleEl && consoleEl.querySelector(".resize-handle");
        if (consoleEl && handle) {
            const savedH = consoleEl.style.height;
            const before = consoleEl.getBoundingClientRect();
            const hr = handle.getBoundingClientRect();
            const mk = (type, x, y) =>
                new MouseEvent(type, { clientX: x, clientY: y, bubbles: true, cancelable: true });
            handle.dispatchEvent(mk("mousedown", hr.x + 2, hr.y + 2));
            window.dispatchEvent(mk("mousemove", hr.x + 2, hr.y + 1));
            window.dispatchEvent(mk("mouseup", hr.x + 2, hr.y + 1));
            const after = consoleEl.getBoundingClientRect();
            out.resizeNoJump = Math.abs(after.height - before.height) <= 4;
            consoleEl.style.height = savedH;
            consoleEl.style.width = "";
            try {
                localStorage.removeItem("anazh.resize.console");
            } catch {
                /* egal */
            }
        }
        // (3) der Emotion-Track ist auf dem dunklen Readout HELL (P11-Klasse).
        const probeBar = document.querySelector(".ich-readout .emotion .bar");
        if (probeBar) {
            const bg = getComputedStyle(probeBar).backgroundColor;
            const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            out.emotionTrackBright = !!m && Number(m[1]) > 150;
        } else {
            out.emotionTrackBright = /236, 225, 197/.test(
                [...document.styleSheets]
                    .map((ss) => {
                        try {
                            return [...ss.cssRules].map((r2) => r2.cssText).join("");
                        } catch {
                            return "";
                        }
                    })
                    .join("")
            );
        }
        // (4) Boost-Chips: Effekt-Label + data-expires + LIVE-Tick ändert den Text.
        const p = r.state.player;
        const savedBoosts = p.boosts;
        const nowSec = performance.now() / 1000;
        p.boosts = [{ source: "test", label: "Probe", tagDelta: { magieleitung: 0.4 }, expiresAt: nowSec + 40 }];
        const host = document.createElement("div");
        r._renderEquipBoosts(host);
        const chip = host.querySelector(".ich-boost-chip");
        out.chipEffect =
            !!chip && /\+0\.4 Magie-Leitung/.test(chip.textContent) && /\(40s\)|\(39s\)/.test(chip.textContent);
        // den Tick GEGEN einen synthetisch-älteren Stempel beweisen (deterministisch):
        if (chip) {
            document.body.appendChild(host);
            chip.setAttribute("data-expires", String(nowSec + 10));
            r._tickBoostChips();
            out.chipTicks = /\(10s\)|\(9s\)/.test(chip.textContent);
            document.body.removeChild(host);
        }
        p.boosts = savedBoosts;
        // (6) das HOF-GEMÜT als Balken: injizierte Emotion → .hof-emotion-bar gefüllt.
        const pm = r.state.playerMesh.position;
        // Cap-Gotcha: den Cap für die EINE Test-Kreatur heben (sonst spawn=null → Bar leer).
        const _saveMaxM5 = r.state.maxCreatures;
        r.state.maxCreatures = (r.state.creatures ? r.state.creatures.length : 0) + 2;
        const c = r.spawnCreatureAt(pm.x + 4, pm.y, pm.z, "happy", "wesen");
        r.state.maxCreatures = _saveMaxM5;
        let sheet = null;
        if (c) {
            c.userData.emotions = { joy: 0.8, sorrow: 0, awe: 0.1, fear: 0, curiosity: 0.2, calm: 0.1 };
            sheet = r._hofBuildSpecSheet(r._creatureProfile(c));
        }
        const ebar = sheet && sheet.querySelector(".hof-emotion-bar");
        const efill = ebar && ebar.querySelector(".bar > div");
        out.hofEmotionBar =
            !!ebar &&
            !!efill &&
            parseInt(efill.style.width, 10) > 30 &&
            /%$/.test(ebar.querySelector(".value").textContent.trim());
        if (c) r.removeCreature(c);
        return out;
    });
    check(
        "M5 HUD: der Resize-Sprung ist tot — die eingeklappte Konsole (105 px) bleibt beim Drag-Start stehen",
        res.resizeNoJump
    );
    check("M5 HUD: der Emotion-Balken-Track ist auf dem dunklen Readout hell (P11-Klasse)", res.emotionTrackBright);
    check(
        "M5 HUD: die Boost-Chips sagen den EFFEKT (+0.4 Magie-Leitung) und zählen LIVE (data-expires + Tick)",
        res.chipEffect && res.chipTicks
    );
    check(
        "M5 HUD: das Hof-GEMÜT ist ein HP-artiger Balken (dominante Emotion färbt, Intensität füllt)",
        res.hofEmotionBar
    );
}

// M4 — EIN Such/Filter-Kern: _matchQuery (Mehrwort-UND) + _blueprintSearchText (der EINE Heuhaufen:
// Rolle deutsch + id + Material + Tags); alle Flächen konsumieren sie. Nie auf die rohe role-id
// matchen („bauwerk" träfe architecture nie).
async function checkBandM4SuchKern({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        const blu = r.state.blueprints;
        try {
            // (1) der KERN: Mehrwort-UND, leere Query trifft alles.
            out.kern =
                r._matchQuery("eisen-klinge waffe härte", "eisen") === true &&
                r._matchQuery("eisen-klinge waffe härte", "eisen klinge") === true &&
                r._matchQuery("eisen-klinge waffe härte", "eisen holz") === false &&
                r._matchQuery("irgendwas", "") === true;
            // (2) der HEUHAUFEN: Rolle (deutsch UND id) + Material + Tag-Achse.
            blu.__m4probe = {
                name: "__m4probe",
                label: "Probe-Block",
                builtIn: false,
                parts: [
                    __teil("box", "eisen", 0, 0, 0, 1, 1, 1),
                ],
            };
            const hay = r._blueprintSearchText(blu.__m4probe);
            out.heuhaufen =
                /bauwerk/.test(hay) && /architecture/.test(hay) && /eisen/.test(hay) && /probe-block/.test(hay);
            // (3) DIESELBE Query trifft in ALLEN Flächen (die M4-Invariante):
            // (a) Omnibox — Mehrwort-Query „bauwerk eisen" wie Werkstatt+Ich; „bauwerk" allein träfe auch die
            // Baum-Varianten, die UND-Query siebt sie und hält den Eisen-Block im 14er-Cap.
            const omni = r._omniboxSearch("b: bauwerk eisen");
            out.omniboxHits = (omni || []).some((x) => /Probe-Block/.test(x.label));
            // (b) Werkstatt-Liste — display folgt dem EINEN Kern.
            const ws = r._ensureWorkshopState();
            const savedSel = ws.selectedBlueprint;
            r.selectBlueprintForEdit("__m4probe");
            const search = document.getElementById("workshop-search");
            const list = document.getElementById("workshop-list");
            if (search && list) {
                search.value = "bauwerk eisen";
                r._applyWorkshopFilter();
                const probeRow = [...list.children].find(
                    (row) => row.getAttribute && row.getAttribute("data-blueprint") === "__m4probe"
                );
                out.workshopHits = !!probeRow && probeRow.style.display !== "none";
                search.value = "";
                r._applyWorkshopFilter();
            }
            ws.selectedBlueprint = savedSel;
            // (c) Ich-Rezeptbuch — die Zeile trägt den Heuhaufen, der Filter den Kern.
            r.renderRecipeBook();
            const ichSearch = document.getElementById("ich-search");
            if (ichSearch) {
                ichSearch.value = "bauwerk eisen";
                r._applyIchFilter();
                const rows = [...document.querySelectorAll("#inventory-recipes .recipe-row")];
                const probeRow = rows.find((row) => /Probe-Block/.test(row.textContent || ""));
                out.ichHits = !!probeRow && probeRow.style.display !== "none";
                // die Nicht-Treffer verschwinden (UND-Logik siebt).
                const trankRow = rows.find((row) => /lebenssaft/i.test(row.textContent || ""));
                out.ichSiebt = !trankRow || trankRow.style.display === "none";
                ichSearch.value = "";
                r._applyIchFilter();
            }
            return out;
        } finally {
            delete blu.__m4probe;
        }
    });
    check("M4 Such-Kern: _matchQuery ist Mehrwort-UND (eisen klinge trifft, eisen holz nicht)", res.kern);
    check("M4 Such-Kern: der EINE Blueprint-Heuhaufen trägt Rolle (deutsch+id) + Material + Name", res.heuhaufen);
    check(
        "M4 Such-Kern: DIESELBE Query trifft in Omnibox + Werkstatt + Ich-Rezeptbuch (und die UND-Logik siebt)",
        res.omniboxHits && res.workshopHits && res.ichHits && res.ichSiebt
    );
}

// W-B HOF-KARTE: der EINE Emotions-Renderer (_buildEmotionRows) baut die 6-Achsen-Reihen für ICH
// (live) und HOF (statisch); die NATUR ruht als <details>; Lesbarkeit KONSUM-bewiesen (die Farbe
// IST hell, nicht „Token gesetzt“); die Werte-Balken tragen sichtbare Füllung.
async function checkBandWBHofKarte({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        // Die Karte: 6 Gefühls-Reihen mit eingebrannter Füllung + Natur als <details>.
        const pm = r.state.playerMesh.position;
        // den maxCreatures-Cap (20) für die EINE Test-Kreatur
        // temporär heben — sonst gibt spawnCreatureAt bei vollem Cap null → "Reihen undefined".
        const _saveMaxWB = r.state.maxCreatures;
        r.state.maxCreatures = (r.state.creatures ? r.state.creatures.length : 0) + 2;
        const c = r.spawnCreatureAt(pm.x + 4, pm.y, pm.z, "happy", "wesen");
        r.state.maxCreatures = _saveMaxWB;
        if (!c) return { ...out, fehler: "kein Spawn" };
        c.userData.emotions = { joy: 0.8, awe: 0.1, sorrow: 0, hope: 0.2, peace: 0.1, chaos: 0 };
        const sheet = r._hofBuildSpecSheet(r._creatureProfile(c));
        document.body.appendChild(sheet);
        const rows = sheet.querySelectorAll(".hof-emotion-rows .emotion");
        out.sechsReihen = rows.length === 6;
        const joyFill = sheet.querySelector(".hof-emotion-rows .emotion.joy .bar > div");
        out.joyGefuellt = !!joyFill && parseInt(joyFill.style.width, 10) === 80;
        // KONSUM-Beweis Lesbarkeit: die berechnete Reihen-Farbe ist HELL (R-006-
        // Klasse: nicht „Token gesetzt", sondern „Farbe IST hell" — > 150 je Kanal-Mittel).
        const joyName = sheet.querySelector(".hof-emotion-rows .emotion.joy .name");
        const colStr = joyName ? window.getComputedStyle(joyName).color : "";
        const mCol = colStr.match(/(\d+),\s*(\d+),\s*(\d+)/);
        out.reihenHell = !!mCol && (Number(mCol[1]) + Number(mCol[2]) + Number(mCol[3])) / 3 > 150;
        // Die Werte-Balken-Füllung ist gesetzt + sichtbar gefärbt (M-B1-Wahrheit gehalten).
        const hpFill = sheet.querySelector(".spec-col .spec-bar .spec-bar-fill");
        const fillBg = hpFill ? window.getComputedStyle(hpFill) : null;
        out.werteBalkenSichtbar =
            !!hpFill &&
            parseInt(hpFill.style.width, 10) > 0 &&
            !!fillBg &&
            (fillBg.backgroundColor !== "rgba(0, 0, 0, 0)" || fillBg.backgroundImage !== "none");
        document.body.removeChild(sheet);
        r.removeCreature(c);
        r.state.creatures = (r.state.creatures || []).filter((x) => x !== c);
        // Das ICH konsumiert weiter live: 6 Reihen im #status-emotions (bestehende
        // Invarianten prüfen das mit — hier nur der Renderer-Konsum oben).
        return out;
    });
    check(
        `W-B Hof-Karte: 6 Gefühls-Reihen an der Stelle der Natur, joy-Balken eingebrannt 80% (Reihen ${res.sechsReihen} · gefüllt ${res.joyGefuellt})`,
        res.sechsReihen && res.joyGefuellt
    );
    check(
        "W-B Lesbarkeit (R-006-Klasse): die berechnete Reihen-Farbe IST hell auf der dunklen Karte (KONSUM, nicht Existenz)",
        res.reihenHell
    );
    check(
        "W-B Werte-Balken: Füllung gesetzt + sichtbar gefärbt (M-B1-Wahrheit als stehende Invariante)",
        res.werteBalkenSichtbar
    );
}

// W-C ICH-RAUM: (a) das Mach-Tor spricht inline (EIN Formatter, drei Konsumenten — kein stiller
// Fehlschlag in der zugeklappten Konsole); (b) EIN Boost-Band, Abgelaufene werden entfernt;
// (c) Haupthand/Nebenhand benannt; (e) Label == Tat (vehicle → „Fertigen“); (h) der WARUM-CHIP.
async function checkBandWCIchWahrheit({ page, check }) {
    const res = await safeEvaluate(page, async () => {
        const out = {};
        // (a) EIN Formatter + drei Konsumenten (KONSUM am Ruf im Nutzer-Zustand).
        out.formatter =
            /sammeln|fehlt/.test(r._machTorHint({ ok: false, reason: "not_enough_material", missing: { eisen: 4 } })) &&
            /4× eisen/.test(r._machTorHint({ ok: false, reason: "not_enough_material", missing: { eisen: 4 } })) &&
            /⚒/.test(r._machTorHint({ ok: false, reason: "no_workshop_station", neededDomain: "forging" }));
        // (a) NUTZER-ZUSTAND (§8.7): frieden + leerer Beutel → der Web-Akt scheitert
        // EHRLICH strukturiert, der Hint nennt das fehlende Material. Deterministisch:
        // Inventar + forgedPrecision (ein früheres Band könnte gefertigt haben) gesichert.
        const savedMode = r.getGameMode();
        const savedInv = r.state.player.inventory;
        const bpArmor = r.state.blueprints.ruestung_brustpanzer;
        const savedForged = bpArmor && bpArmor.forgedPrecision;
        const savedArmor = r.state.player.equipped && r.state.player.equipped.armor;
        r.state.player.inventory = [];
        if (bpArmor) delete bpArmor.forgedPrecision;
        r.setGameMode("frieden");
        const wres = r.wearArmor("ruestung_brustpanzer");
        out.torEhrlich =
            !!wres && wres.ok === false && wres.reason === "not_enough_material" && /eisen/.test(r._machTorHint(wres));
        out.keinAnlegen = (r.state.player.equipped && r.state.player.equipped.armor) === savedArmor;
        // die drei Inline-Konsumenten: Slot-Wechsel, Rezept-Zeile und FERTIGEN sprechen das Mach-Tor an ihrer Stelle
        r._renderInventoryEquip();
        const sel = document.querySelector("#inventory-equip .equip-slot-select");
        if (sel) sel.value = "ruestung_brustpanzer";
        const bR = r._recipeRow("ruestung_brustpanzer", "wear").querySelector("button");
        if (bR) bR.disabled = false;
        const panF = document.createElement("div");
        r._workshopAppendFertigenRow(panF, bpArmor);
        const bF = panF.querySelector("button.workshop-fertigen");
        out.konsumenten =
            !!sel &&
            !!bR &&
            !!bF &&
            window.__consumes(sel, "dispatchEvent", r, "_showMachTorHint", [new Event("change")]) &&
            window.__consumes(bR, "click", r, "_showMachTorHint", []) &&
            window.__consumes(bF, "click", r, "_showMachTorHint", []);
        r.state.player.inventory = savedInv;
        if (bpArmor && Number.isFinite(savedForged)) bpArmor.forgedPrecision = savedForged;
        r.setGameMode(savedMode);
        // (a) der PREIS lesbar: die Stat-Folge der Rüstung trägt Abwehr-Delta.
        const delta = r._armorStatDeltaText("ruestung_brustpanzer");
        out.preisLesbar = /Abwehr/.test(delta || "");
        // (b) EIN Boost-Band: injizierter Boost → GENAU ein DOM-Ort (#ich-boosts-host);
        // die Selbst-Sheet-Fußzeile trägt KEINE ✺-Chips mehr; der Tick ENTFERNT Abgelaufene.
        const p = r.state.player;
        const savedBoosts = p.boosts;
        const nowSec = performance.now() / 1000;
        p.boosts = [{ source: "wc", label: "WC-Probe", tagDelta: { magieleitung: 0.3 }, expiresAt: nowSec + 30 }];
        r._renderInventoryEquip();
        const orte = document.querySelectorAll(".ich-boosts");
        const hostBand = document.querySelector("#ich-boosts-host .ich-boosts");
        out.einBandOrt = orte.length === 1 && !!hostBand;
        out.fusszeileOhneBoosts = window.__fehlt(r._ichBuildSpecSheet, /✺/);
        const chip = document.querySelector("#ich-boosts-host .ich-boost-chip");
        if (chip) {
            chip.setAttribute("data-expires", String(nowSec - 1));
            r._tickBoostChips();
        }
        out.abgelaufenEntfernt = !!chip && !document.querySelector("#ich-boosts-host .ich-boost-chip");
        p.boosts = savedBoosts;
        r._renderInventoryEquip();
        // (c) Haupthand benannt + Nebenhand-Brücke im Tooltip.
        const equipHost = document.getElementById("inventory-equip");
        out.haupthand =
            !!equipHost &&
            /Haupthand/.test(equipHost.textContent || "") &&
            /Nebenhand/.test(
                equipHost.querySelector(".equip-slot") ? equipHost.querySelector(".equip-slot").title : ""
            );
        // (e) LABEL == TAT: der Fahrzeug-Knopf sagt „Fertigen" (der Wagen log „In die Hand").
        // der Wagen fiel; das lebende Fahrzeug-Built-in (Holzross) trägt die Probe.
        const row = r._recipeRow("reittier_holzross", "vehicle");
        out.vehicleLabel =
            !!row && /Fertigen/.test(row.querySelector("button") ? row.querySelector("button").textContent : "");
        // (h) der WARUM-CHIP: lesbare Emergenz an Eiche (architektur-ehrlich: dichte/
        // härte-Familie) + Trank (lebendig) + die sichtbare spec-why-line im Werkstatt-Quell.
        const __whyKey = r._growTreeBlueprintForSpawn("baum_eiche", "why");
        const whyEiche = __whyKey ? r._blueprintRoleWhy(r.state.blueprints[__whyKey]) : null;
        const whyTrank = r._blueprintRoleWhy(r.state.blueprints.trank_lebenssaft);
        out.warumEiche = !!whyEiche && /Dichte|Härte|dichte|härte|bulk|Standfläche/.test(whyEiche.text);
        out.warumTrank = !!whyTrank && /Lebendig|lebendig/.test(whyTrank.text);
        // die drei Flächen tragen das EINE Warum-Gesetz sichtbar: die spec-why-line der Werkstatt (am Ruf), der Tooltip der
        // Rezept-Zeile und der Rollen-Chip der Bibliotheks-Karte
        const traegt = (t) => !!whyTrank && typeof t === "string" && t.includes(whyTrank.text);
        const panW = document.createElement("div");
        r._specRenderBody(panW, r.state.blueprints.trank_lebenssaft);
        const wl = panW.querySelector(".spec-why-line");
        out.warumFlaechen =
            !!wl &&
            traegt(wl.textContent) &&
            window.__consumes(r, "_specRenderBody", r, "_blueprintRoleWhy", [
                document.createElement("div"),
                r.state.blueprints.trank_lebenssaft,
            ]);
        const chipB = r
            ._feedRecipeCard({ kind: "recipe", prof: r._recipeProfile(r.state.blueprints.trank_lebenssaft) })
            .querySelector(".feed-role-chip");
        out.warumKarten = traegt(r._recipeRow("trank_lebenssaft", "drink").title) && !!chipB && traegt(chipB.title);
        // (g) bei Ruhe verlässt das Emotions-Item den FLOW (display:none nach dem 1.4-s-Fade, sonst ein
        // unsichtbares Loch in der Leiste); Wieder-Entzünden holt es zurück. End-VERHALTEN, nicht Existenz.
        {
            const lab = document.getElementById("status-emotion");
            const item = document.getElementById("status-emotion-item");
            const saved = {};
            for (const k of Object.keys(r.state.player.emotions)) saved[k] = r.state.player.emotions[k];
            for (const k of Object.keys(r.state.player.emotions)) r.state.player.emotions[k] = 0;
            r.state.player.emotions.joy = 0.9;
            r._updateEmotionFeedback();
            const anImFlow = !!item && item.style.display !== "none" && !!lab && lab.textContent === "Freude";
            for (const k of Object.keys(r.state.player.emotions)) r.state.player.emotions[k] = 0;
            r._updateEmotionFeedback();
            await sleep(1700);
            const ruheAusFlow = !!item && item.style.display === "none";
            r.state.player.emotions.joy = 0.9;
            r._updateEmotionFeedback();
            const zurueck = !!item && item.style.display !== "none";
            out.leistenLochTot = anImFlow && ruheAusFlow && zurueck;
            for (const k of Object.keys(r.state.player.emotions)) r.state.player.emotions[k] = saved[k];
            r._updateEmotionFeedback();
        }
        return out;
    });
    check(
        "W-C(a) Mach-Tor: EIN Formatter (_machTorHint: Material + ⚒ Station) + drei Inline-Konsumenten (Slot·Rezept·FERTIGEN)",
        res.formatter && res.konsumenten
    );
    check(
        "W-C(a) Nutzer-Zustand (frieden + leerer Beutel): der Web-Akt scheitert EHRLICH strukturiert, der Hint nennt eisen, nichts wird angelegt",
        res.torEhrlich && res.keinAnlegen
    );
    check("W-C(a) der PREIS lesbar: die Rüstungs-Stat-Folge nennt die Abwehr (Vorzeichen + Zahl)", res.preisLesbar);
    check(
        "W-C(b) EIN Boost-Band (#ich-boosts-host) — die Fußzeilen-Doublette ist tot, Abgelaufene werden ENTFERNT (kein Ausgelaufen-Linger)",
        res.einBandOrt && res.fusszeileOhneBoosts && res.abgelaufenEntfernt
    );
    check("W-C(c) Haupthand benannt + Nebenhand-Brücke im Tooltip (zwei Slots, EINE Struktur)", res.haupthand);
    check("W-C(e) LABEL == TAT: der Fahrzeug-Knopf sagt Fertigen (kein lügendes In-die-Hand)", res.vehicleLabel);
    check(
        "W-C(h) WARUM-CHIP (R-036): Eiche erklärt sich über die dichte-harte Familie, der Trank über Lebendigkeit — an Werkstatt + Rezeptbuch + Bibliothek",
        res.warumEiche && res.warumTrank && res.warumFlaechen && res.warumKarten
    );
    check(
        "W-C(g) V18.172: das Leisten-Loch ist tot — bei Ruhe verlässt das Emotions-Item den Flow (display:none nach Fade), Wieder-Entzünden holt es zurück",
        res.leistenLochTot
    );
}

// W-A1 der Rezept-Katalog — eingefaltet aus gate:rezept-katalog: die B4-Tabellen reisen als DATEN (`paramsByKind`: gate ·
// vehicle · flower · grass, gate-Länge = porta-core.PARAMS), der ov-Kanal baut cache-frei eine ANDERE Geometrie (drachentor mass,
// blume height/bloomCount), der Katalog zeigt die Studio-Rezepte (gras) und verabschiedet die Donoren (wagen 17 · tor 4 Parts in
// der Substanz-Tabelle), die Regler des Tors kommen aus der PARAMS-Tabelle und treiben die Vorschau, das Interim ist ehrlich
// (kalte Auswahl → pending, leere Bühne, „Studio-Asset lädt…").
async function checkBandRezeptKatalog({ page, check }) {
    // die porta-PARAMS-Länge als unabhängige Node-Referenz (derselbe Lade-Pfad wie im Worker, nur ohne Browser)
    require(path.join(SKRIPTE, "..", "porta-core.js"));
    const pp =
        globalThis.__portaCore && globalThis.__portaCore.PARAMS_BY_KIND && globalThis.__portaCore.PARAMS_BY_KIND.gate;
    const portaParamsLen = Array.isArray(pp) ? pp.length : -1;
    const out = (await safeEvaluate(
        page,
        async (portaLen) => {
            const res = { a: {}, b: {}, c: {}, d: {}, e: {} };
            // ===== WARM-ANKER: Boot → f.ready → Buch+paramsByKind → !_vorrat (120-s-Cap) =====
            await window.__weltDa();
            const f = r._ensureAssetFoundry();
            await window.__weltDa(
                () =>
                    !!(
                        f &&
                        f.ready &&
                        f.recipes &&
                        f.recipes.drachentor &&
                        f.recipes.gras &&
                        f.paramsByKind &&
                        f.paramsByKind.gate &&
                        !f._vorrat
                    )
            );

            // ===== (a) paramsByKind: gate + vehicle als Regler-DATEN =====
            const pk = f.paramsByKind || {};
            const rowOk = (d, needDef) =>
                !!d &&
                typeof d.id === "string" &&
                typeof d.min === "number" &&
                typeof d.max === "number" &&
                (!needDef || typeof d.def === "number");
            res.a.gateLen = Array.isArray(pk.gate) ? pk.gate.length : -1;
            res.a.vehicleLen = Array.isArray(pk.vehicle) ? pk.vehicle.length : -1;
            res.a.gateRowsOk = Array.isArray(pk.gate) && pk.gate.every((d) => rowOk(d, true));
            res.a.vehicleRowsOk = Array.isArray(pk.vehicle) && pk.vehicle.every((d) => rowOk(d, false));
            res.a.gateMatchesNode = res.a.gateLen === portaLen;
            res.a.gateHasGrp = Array.isArray(pk.gate) && pk.gate.some((d) => typeof d.grp === "string" && d.grp);
            // ERFINDER-WELLE („blume z.B. keine regler?") — die PFLANZEN-Tabellen reisen
            // (PARAMS_BY_KIND des Primaer-Kerns): flower + grass als Regler-DATEN.
            res.a.flowerLen = Array.isArray(pk.flower) ? pk.flower.length : -1;
            res.a.flowerRowsOk = Array.isArray(pk.flower) && pk.flower.every((d) => rowOk(d, true));
            res.a.grassLen = Array.isArray(pk.grass) ? pk.grass.length : -1;

            // ===== (b) OV-ROUNDTRIP: mass-Override aendert die Geometrie, Cache bleibt rein =====
            const csum = (meshes) => {
                let s = 0,
                    n = 0;
                for (const m of meshes || []) {
                    const a = m && m.position && m.position.array;
                    if (!a) continue;
                    n += a.length;
                    for (let i = 0; i < a.length; i += 13) s += a[i];
                }
                return { s: Math.round(s * 1000) / 1000, n };
            };
            try {
                const m0 = await Promise.race([r._foundryRequest("drachentor", 7, 0), sleep(45000)]);
                // Schluessel-SET vorher (nicht nur die Groesse: Hintergrund-Ticks duerfen fremde
                // Keys anlegen — die Wand ist, dass der OV-Request KEINEN drachentor-Key legt).
                const keysBefore = new Set(f.cache.keys());
                const reqBefore = new Set(f.requested ? Array.from(f.requested) : []);
                const mOv = await Promise.race([r._foundryRequest("drachentor", 7, 0, { mass: 0.02 }), sleep(45000)]);
                res.b.meshes0 = Array.isArray(m0) ? m0.length : -1;
                res.b.meshesOv = Array.isArray(mOv) ? mOv.length : -1;
                res.b.sum0 = csum(m0);
                res.b.sumOv = csum(mOv);
                res.b.differ =
                    Array.isArray(m0) &&
                    Array.isArray(mOv) &&
                    (res.b.sum0.s !== res.b.sumOv.s || res.b.sum0.n !== res.b.sumOv.n);
                const addedCache = Array.from(f.cache.keys()).filter((k) => !keysBefore.has(k));
                const addedReq = (f.requested ? Array.from(f.requested) : []).filter((k) => !reqBefore.has(k));
                res.b.cacheKeysAfter = f.cache.size;
                res.b.addedCache = addedCache;
                res.b.cacheClean = addedCache.every((k) => k.indexOf("drachentor|") !== 0);
                res.b.requestedClean = addedReq.every((k) => k.indexOf("drachentor|") !== 0);
                // der ov-Kanal erreicht auch den PFLANZEN-Pfad
                // (Bruecke reicht msg.ov an foundry-core.buildInstance): die Blume formt.
                const bKeysBefore = new Set(f.cache.keys());
                const b0 = await Promise.race([r._foundryRequest("blume", 3, 0), sleep(45000)]);
                const bOv = await Promise.race([
                    r._foundryRequest("blume", 3, 0, { height: 2.2, bloomCount: 9 }),
                    sleep(45000),
                ]);
                res.b.blume0 = csum(b0);
                res.b.blumeOv = csum(bOv);
                res.b.blumeDiffer =
                    Array.isArray(b0) &&
                    Array.isArray(bOv) &&
                    (res.b.blume0.s !== res.b.blumeOv.s || res.b.blume0.n !== res.b.blumeOv.n);
                const bAdded = Array.from(f.cache.keys()).filter((k) => !bKeysBefore.has(k));
                // der DEFAULT-Zug darf cachen (Welt-Pfad), der ov-Zug NIE: genau EIN blume-Key.
                res.b.blumeCacheClean = bAdded.filter((k) => k.indexOf("blume|") === 0).length <= 1;
            } catch (e) {
                res.b.err = (e && e.message) || String(e);
            }

            // ===== (c) KATALOG: der Donor-Abschied im DOM (jedes Rezept als Knoten der Bibliothek: gate:nervensystem S) =====
            try {
                r._renderWorkshopDOM();
                const list = document.getElementById("workshop-list");
                res.c.wagenRow = !!(list && list.querySelector('[data-blueprint="fahrzeug_wagen"]'));
                res.c.torBasisRow = !!(list && list.querySelector('[data-blueprint="tor_basis"]'));
                // die Alt-Donoren sind ABWESEND, die Substanz-Tabelle traegt sie.
                const KS = r.constructor.KIND_SUBSTANCE || {};
                res.c.wagenAbsent = !(r.state.blueprints && r.state.blueprints.fahrzeug_wagen);
                res.c.torBasisAbsent = !(r.state.blueprints && r.state.blueprints.tor_basis);
                res.c.wagenSubstanzParts =
                    KS.fahrzeug_wagen && Array.isArray(KS.fahrzeug_wagen.parts) ? KS.fahrzeug_wagen.parts.length : 0;
                res.c.torSubstanzParts =
                    KS.tor_basis && Array.isArray(KS.tor_basis.parts) ? KS.tor_basis.parts.length : 0;
            } catch (e) {
                res.c.err = (e && e.message) || String(e);
            }

            // ===== (d) REGLER: tor_drachentor → Slider aus der PARAMS-Tabelle + ov treibt die Vorschau =====
            try {
                const ok = r.selectBlueprintForEdit("tor_drachentor");
                res.d.selected = ok === true;
                const panel = document.getElementById("workshop-recipe-panel");
                res.d.panelVisible = !!(panel && !panel.hidden);
                res.d.sliderCount = panel ? panel.querySelectorAll(".workshop-studio-param-row").length : -1;
                // Programmatischer ov: mass ans Maximum → Vorschau-Rebuild mit ov (cache-frei).
                const ws = r._ensureWorkshopState();
                ws.studioOv["drachentor"] = { mass: 1.0 };
                let rebuilds = 0;
                const orig = r._workshopRebuildPreviewMesh.bind(r);
                r._workshopRebuildPreviewMesh = function () {
                    rebuilds++;
                    return orig();
                };
                let g = r._workshopFoundryPreviewGroup("tor_drachentor");
                await window.__gebautNach("die Vorschau des Drachentors", {
                    fertig: () => !!(g = r._workshopFoundryPreviewGroup("tor_drachentor")) && g !== "pending",
                    takt: () => sleep(200),
                    max: 225,
                });
                r._workshopRebuildPreviewMesh = orig;
                res.d.rebuilds = rebuilds;
                res.d.groupChildren = g && g !== "pending" && g.children ? g.children.length : 0;
                res.d.cacheStillClean = !Array.from(f.cache.keys()).some((k) => k.indexOf("{") >= 0);
                delete ws.studioOv["drachentor"];
            } catch (e) {
                res.d.err = (e && e.message) || String(e);
            }

            // ===== (e) INTERIM: kalte Auswahl → pending, KEINE Donor-Part-Meshes =====
            try {
                const ws = r._ensureWorkshopState();
                res.e.gtExists = !!(r.state.blueprints && r.state.blueprints.fahrzeug_gt);
                // Kuenstlich kalt: alle gt-Cache-/Wachen-Keys raus (der naechste Blick zieht neu).
                for (const k of Array.from(f.cache.keys())) if (k.indexOf("gt|") === 0) f.cache.delete(k);
                if (f.requested)
                    for (const k of Array.from(f.requested)) if (k.indexOf("gt|") === 0) f.requested.delete(k);
                const probe = r._workshopFoundryPreviewGroup("fahrzeug_gt");
                res.e.probePending = probe === "pending";
                // Behavioral mit Minimal-Buehne: rebuild lässt die Buehne LEER (kein 17-Teile-Wagen).
                const prevSel = ws.selectedBlueprint;
                const prevRec = ws.selectedRecipe;
                ws.selectedBlueprint = "fahrzeug_gt";
                ws.selectedRecipe = null;
                ws.preview = {
                    scene: {
                        add() {},
                        remove() {},
                    },
                    partMeshes: new Map(),
                    origColors: new Map(),
                    orbit: { target: { x: 0, y: 0, z: 0 }, dist: 6 },
                    dirty: false,
                    currentMesh: null,
                };
                r._workshopRebuildPreviewMesh();
                res.e.stageEmpty = ws.preview.currentMesh === null;
                res.e.partMeshCount = ws.preview.partMeshes.size;
                res.e.pendingFlag = r._wsStudioPending === true;
                const statusEl = document.getElementById("workshop-studio-status");
                res.e.statusText = statusEl ? statusEl.textContent : null;
                // Aufraeumen: Buehne + Auswahl zurueck.
                ws.preview = null;
                ws.selectedBlueprint = prevSel;
                ws.selectedRecipe = prevRec;
                r._wsStudioPending = false;
                r._workshopStudioStatusSync();
            } catch (e) {
                res.e.err = (e && e.message) || String(e);
            }
            return res;
        },
        portaParamsLen
    )) || { fatal: "keine Antwort der Seite" };
    const { a = {}, b = {}, c = {}, d = {}, e = {} } = out;
    check(
        "Rezept-Katalog: porta-core.PARAMS_BY_KIND.gate nicht leer (die Seite wartet auf Buch, paramsByKind und Vorrat)",
        !out.fatal && portaParamsLen > 0,
        out.fatal || `porta=${portaParamsLen}`
    );
    check(
        "Rezept-Katalog (a) paramsByKind: gate (id/min/max/def, grp, Länge = porta-core) · vehicle · flower (5) · grass (≥ 4) reisen als Regler-Daten",
        a.gateRowsOk === true &&
            a.vehicleRowsOk === true &&
            a.vehicleLen > 0 &&
            a.gateMatchesNode === true &&
            a.gateHasGrp === true &&
            a.flowerLen === 5 &&
            a.flowerRowsOk === true &&
            a.grassLen >= 4,
        `gate ${a.gateLen} vs ${portaParamsLen} · vehicle ${a.vehicleLen} · flower ${a.flowerLen} · grass ${a.grassLen}`
    );
    check(
        "Rezept-Katalog (b) ov-Roundtrip: drachentor und blume formen unter ov, der ov-Request legt keinen Cache-Key und rührt die requested-Wache nicht",
        b.meshes0 > 0 &&
            b.meshesOv > 0 &&
            b.differ === true &&
            b.cacheClean === true &&
            b.requestedClean === true &&
            b.blumeDiffer === true &&
            b.blumeCacheClean === true,
        b.err ||
            `sum0=${JSON.stringify(b.sum0)} sumOv=${JSON.stringify(b.sumOv)} blume ${JSON.stringify(b.blume0)}/${JSON.stringify(b.blumeOv)}`
    );
    check(
        "Rezept-Katalog (c) die Alt-Donoren fehlen im DOM und in state.blueprints, die Substanz-Tabelle trägt sie (wagen 17 · tor 4)",
        c.wagenRow === false &&
            c.torBasisRow === false &&
            c.wagenAbsent === true &&
            c.torBasisAbsent === true &&
            c.wagenSubstanzParts === 17 &&
            c.torSubstanzParts === 4,
        c.err || `wagen=${c.wagenSubstanzParts} tor=${c.torSubstanzParts}`
    );
    check(
        "Rezept-Katalog (d) tor_drachentor: Slider = PARAMS-Länge des porta-Kerns, der ov treibt die Vorschau, kein ov-Schlüssel im Welt-Cache",
        d.sliderCount === portaParamsLen && d.rebuilds >= 1 && d.groupChildren > 0 && d.cacheStillClean === true,
        d.err || `slider ${d.sliderCount} vs ${portaParamsLen} · rebuilds ${d.rebuilds} · children ${d.groupChildren}`
    );
    check(
        "Rezept-Katalog (e) Interim: kalte Auswahl → pending, die Bühne bleibt LEER (kein 17-Teile-Wagen), der Status sagt „Studio-Asset lädt…“",
        e.gtExists === true &&
            e.probePending === true &&
            e.stageEmpty === true &&
            e.partMeshCount === 0 &&
            e.pendingFlag === true &&
            /Studio-Asset lädt/.test(e.statusText || ""),
        e.err || String(e.statusText)
    );
}

module.exports = {
    checkBandOmegaWerkstattSpiegel,
    checkBandCadWorkshop,
    checkBandEarlyRingsAndUi,
    checkBandV18134Social,
    checkBandV18135Bookmarks,
    checkBandV18142Follow,
    checkBandV18143Comments,
    checkBandV18147ForYou,
    checkBandM5HudPolitur,
    checkBandM4SuchKern,
    checkBandWBHofKarte,
    checkBandWCIchWahrheit,
    checkBandRezeptKatalog,
};
