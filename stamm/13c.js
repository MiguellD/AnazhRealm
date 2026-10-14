class AnazhRealm_Z13c {
    // ===== ATLAS §13c · IDENTITÄT/WELTEN/SOZIAL — Block Dienst =====
    _uiDirty(raum) {
        if (typeof document === "undefined") return;
        const reg = this._uiRoomRegistry();
        if (!reg[raum]) return;
        (this._uiDirtyRooms || (this._uiDirtyRooms = new Set())).add(raum);
        if (this._uiPulseQueued) return;
        this._uiPulseQueued = true;
        const run = () => {
            this._uiPulseQueued = false;
            const dirty = this._uiDirtyRooms || new Set();
            this._uiDirtyRooms = new Set();
            for (const r of dirty) {
                const room = reg[r];
                if (!room) continue;
                if (room.isOpen && !room.isOpen()) continue;
                try {
                    room.render();
                } catch (_e) {
                    this.log(`UI-PULS: der Raum ${r} zeichnete nicht — ${(_e && _e.message) || _e}`, "ERROR");
                }
            }
        };
        if (typeof requestAnimationFrame === "function") requestAnimationFrame(run);
        else run();
    }

    // V18.176 — `_refreshIchIfOpen` ist jetzt ein ALIAS auf den EINEN Puls
    // (die 8 Aufrufer bleiben heil; die Logik lebt in `_uiDirty`).
    _refreshIchIfOpen() {
        this._uiDirty("ich");
    }

    // V17.57 W2-B — equipTool/equipWeapon sind jetzt ALIASE auf equipHeld (ein Slot, kein
    // Schloss). Die DSL-Ops, der Chat, die Persistenz-Restore + das Abnehmen routen darüber —
    // so bleibt die ganze bestehende API heil, während das Modell sich vereint.
    equipTool(name) {
        return this.equipHeld(name);
    }
    equipWeapon(name) {
        return this.equipHeld(name);
    }

    // Hand-Tausch: EIN Akt tauscht Haupt- ↔ Off-Hand; die Haupt-Hand läuft durch den EINEN equipHeld-Pfad
    // (Stats + Hand-Mesh), die Off-Hand ist reiner Bereitschafts-Slot (kein Schmiede-Gate).
    // Konsumenten: Key G (DEFAULT_KEYBINDINGS.swapHands) + Off-Hand-Slot neben der Hotbar.
    swapHands() {
        const p = this.state.player;
        if (!p) return { ok: false, reason: "no_player" };
        const eq = (p.equipped = p.equipped || { held: null, offhand: null, armor: null });
        const main = eq.held || null;
        const off = eq.offhand || null;
        if (!main && !off) return { ok: false, reason: "both_empty" };
        // tote Off-Hand (Bauplan inzwischen gelöscht) → fällt, statt zu duplizieren.
        if (off && !(this.state.blueprints && this.state.blueprints[off])) {
            eq.offhand = null;
            return { ok: false, reason: "offhand_unknown" };
        }
        eq.offhand = main;
        this.equipHeld(off); // null → leert die Haupt-Hand sauber (Stats + Mesh)
        if (typeof this._renderHotbarDOM === "function") this._renderHotbarDOM();
        return { ok: true, held: eq.held || null, offhand: eq.offhand || null };
    }

    // Das gehaltene Gerät SICHTBAR in der Hand über _buildFromBlueprint (kein Parallel-Pfad): ein Mesh am
    // Arm/Flügel des Avatars (schwingt über die Transform-Kette mit — kein per-Frame-Update), sonst an der
    // Körper-Wurzel. Liest state.player.equipped.held + state.playerMesh; gerufen aus equipHeld +
    // applyPlayerSoul (re-attach an den neuen Körper). Optik/Pose/Skala: AnazhRealm.HELD_MESH.
    _refreshHeldMesh() {
        const pm = this.state.playerMesh;
        if (!pm) return;
        // Vorhandenes Hand-Mesh DIESES Körpers abräumen (Equip-Wechsel). Beim Körper-Wechsel disposed
        // applyPlayerSoul den alten Körper samt heldMesh-Kind; der neue hat noch keins.
        const prev = pm.userData && pm.userData.heldMesh;
        if (prev) {
            if (prev.parent) prev.parent.remove(prev);
            this._disposeSoulGroup(prev);
            pm.userData.heldMesh = null;
        }
        // V18.109 — E8: auch das Off-Hand-Mesh räumen (derselbe Lifecycle).
        const prevOff = pm.userData && pm.userData.offhandMesh;
        if (prevOff) {
            if (prevOff.parent) prevOff.parent.remove(prevOff);
            this._disposeSoulGroup(prevOff);
            pm.userData.offhandMesh = null;
        }
        const eq = this.state.player && this.state.player.equipped;
        const parts = pm.userData && pm.userData.parts;
        const cfg = AnazhRealm.HELD_MESH;
        // EIN Bau-Helfer für beide Hände (Spiegel: links negiert die x-Offsets).
        const buildHand = (bpName, side) => {
            const bp = this.state.blueprints && this.state.blueprints[bpName];
            if (!bp || !Array.isArray(bp.parts) || !bp.parts.length) return null;
            // Studio-Gestalt in der Hand: löst der EINE Preset-Resolver den Bauplan auf (klinge_<id> → LIVE-Buch)
            // UND ist die Foundry-Gruppe warm, tragen Wrapper um die GETEILTE Studio-Geometrie die Optik; die
            // Parts bleiben unsichtbare Substanz-Wahrheit (Tags · Ω-PHYSIS · wield). "pending" → der Part-Bau
            // trägt sichtbar als Interim (die Hand ist nie leer); null → Part-Pfad byte-alt.
            const studio = this._heldFoundryGroup(bpName);
            const isStudio = !!(studio && studio !== "pending");
            const mesh = isStudio ? studio : this._buildFromBlueprint({ name: `held_${bpName}`, parts: bp.parts });
            // das Gerät in der Hand ist keine Haut: die Ich-Regel (_applyEgoSicht) lässt es sichtbar
            mesh.userData._gehalten = true;
            // Der Erst-Zeig-Stall (die V18.367-Klasse) fällt an der Erst-Zeichnung (`_configureRenderer`): die Hand
            // zeichnet ab dem Frame, in dem ihr Stoff gebaut und ihre Pipeline steht.
            // Anker: der Arm/Flügel der Seite (schwingt mit dem Walk-Cycle) wenn die Seele ihn
            // benennt, sonst die Körper-Wurzel (Custom-/Flug-Seelen).
            const anchor =
                (parts && (side === "left" ? parts.leftArm || parts.leftWing : parts.rightArm || parts.rightWing)) ||
                pm;
            // DIE WAHRE GRÖSSE (W5 Gegenstände): das Gerät erbt die Welt-Skala seines Ankers — der Studio-Mensch steht
            // als Baum in Studio-Einheiten unter einer 0,283-Gruppe, sein Handgelenk misst 0,26–0,28 Welt je Einheit.
            // Bis W5 skalierte die Hand im Anker-Raum: das Langschwert (Gesetzbuch 1,228 m) schrumpfte auf 0,62 Einheiten
            // × 0,27 = 0,17 m, ein Spielzeug im Faustinneren. Jetzt rechnet die Hand in WELT-Metern: die Studio-Gestalt
            // trägt ihre Gesetzbuch-Länge (die Schmiede baut in Metern — Masse, Balance und Reichweite rechnen damit),
            // ein Part-Bau seine Werkzeug-Spanne `targetSpanM`; der Anker-Faktor wird herausgeteilt.
            let ankerSkala = 1;
            try {
                anchor.updateWorldMatrix(true, false);
                const ws = anchor.getWorldScale(new THREE.Vector3());
                const m = (Math.abs(ws.x) + Math.abs(ws.y) + Math.abs(ws.z)) / 3;
                if (Number.isFinite(m) && m > 1e-4) ankerSkala = m;
            } catch (_e) {
                /* Anker ohne Welt-Matrix — Welt = Anker-Raum */
            }
            // die ECHTE Geometrie-Spanne (positions + sizes + rotation), robust auch bei Ein-Part-Geräten
            // (anders als _compoundBBox, positions-only).
            try {
                mesh.updateMatrixWorld(true);
                const box = new THREE.Box3().setFromObject(mesh);
                if (box && Number.isFinite(box.min.x) && Number.isFinite(box.max.x)) {
                    const span = Math.max(box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z);
                    if (span > 1e-4) {
                        const welt = isStudio
                            ? 1
                            : Math.max(cfg.minScale, Math.min(cfg.maxScale, cfg.targetSpanM / span));
                        mesh.scale.setScalar(welt / ankerSkala);
                    }
                }
            } catch (_e) {
                /* headless/degeneriert — Skala 1 lassen, die Optik ist ohnehin der Browser */
            }
            const sx = side === "left" ? -1 : 1;
            // V18.110 — C7: der GRIFF-Punkt liegt in der Hand — das Mesh wird so
            // verschoben, dass der griffigste Part (bzw. der explizite griff-
            // Punkt) am Hand-Anker sitzt, nicht der Bauplan-Ursprung.
            const ms = mesh.scale && Number.isFinite(mesh.scale.x) ? mesh.scale.x : 1;
            // DIE FAUST (W5): ein Studio-Gerät im Handgelenk des Studio-Menschen (die Rig-Gelenke, `_buildHumanGroup`)
            // liegt, wie eine Hand greift — der Griff quer zum Unterarm durch die Faust, das Blatt zur Daumenseite und
            // `neigung` unter die Waagrechte (der entspannte Arm), die Schneide (Klinge) bzw. der Kopf (Axt, Hammer,
            // Spaten) in der Schwung-Ebene nach unten; der Bogen liegt mit seiner Länge im Griff. Die Gelenk-Achsen des
            // Handgelenks: −y zu den Fingern, +z nach vorn (Daumenseite), x quer. Vorher stand die Klinge mit 0,5 rad
            // Kipp den Unterarm hinauf (ein Handgelenk, um 160° überstreckt) — Messname: Haltung, Hand-Griff-Versatz.
            const rig = pm.userData && pm.userData.rig;
            const faust =
                isStudio &&
                !!rig &&
                ((rig.armR && anchor === rig.armR.wrist) || (rig.armL && anchor === rig.armL.wrist));
            if (faust) {
                // DIE HAND-MITTE kommt aus der Hand selbst (Ofen-Beipack: der Schwerpunkt der Hand-Haut im Hand-Raum) —
                // vorher eine Welt-Konstante der Hand vor Welle 5 (0,107 m fingerwärts); die neue Hand (kleiner, höher)
                // ließ den Griff 0,072 m neben ihr (gate:nervensystem-schmiede H-F). Ohne Mitte keine Faust: LAUT.
                const hm = rig.handMitte && rig.handMitte[anchor.name];
                if (!hm) {
                    this.log("FAUST: die Hand trägt keine Hand-Mitte (Ofen-Beipack handMitte) — kein Griff.", "ERROR");
                    return null;
                }
                const fo = { x: hm[0], y: hm[1], z: hm[2] };
                const art = mesh.userData && mesh.userData.heldArt;
                // Der Bogen steht rechtwinklig zum Unterarm (gestreckter Bogen-Arm: der Bogen senkrecht zum Pfeil), eine
                // Klinge oder ein Schaft `neigung` unter der Waagrechten des hängenden Arms.
                const ng = art === "bogen" ? 0 : cfg.neigung;
                const c = Math.cos(ng),
                    s = Math.sin(ng);
                const griff = new THREE.Vector3(0, -s, c); // die Griff-Achse: vorn, `neigung` hinab
                const oben = new THREE.Vector3(0, c, s); // quer dazu in der Schwung-Ebene, oben
                const quer = new THREE.Vector3(1, 0, 0);
                const B = new THREE.Matrix4();
                // Spalten = Bild der Template-Achsen X · Y · Z (rechtshändig).
                if (art === "bogen")
                    B.makeBasis(oben, griff, quer); // Länge Y im Griff, Sehne nach oben
                else if (art === "klinge")
                    B.makeBasis(griff, oben, quer.clone().negate()); // Klinge X, Schneiden-Ebene XY
                else B.makeBasis(griff, quer.clone().negate(), oben.clone().negate()); // Kopf +Z nach unten
                mesh.quaternion.setFromRotationMatrix(B);
                const gpT =
                    art === "bogen"
                        ? new THREE.Vector3(0, 0, 0)
                        : new THREE.Vector3((mesh.userData && mesh.userData.heldGripX) || 0, 0, 0);
                gpT.multiplyScalar(ms).applyQuaternion(mesh.quaternion);
                mesh.position.set(fo.x - gpT.x, fo.y - gpT.y, fo.z - gpT.z);
                anchor.add(mesh);
                return mesh;
            }
            const off = anchor === pm ? cfg.rootOffset : cfg.handOffset;
            // Der Griff der Studio-Gestalt kommt als DATEN (heldGripX aus dem LIVE-Buch). Template-Achse ist X
            // (Griff bei 0, Klinge nach +X) → rotation.z += π/2 (Euler XYZ: Z wirkt zuerst) stellt sie in die
            // Hand-Konvention (lange Achse +Y, Griff unten); (gripX,0,0) liegt danach bei (0,gripX,0) — dieselbe
            // Versatz-Formel wie der Part-Pfad (_attachPointFor), tilt bewusst nicht eingerechnet.
            const gp = isStudio
                ? { x: 0, y: (mesh.userData && mesh.userData.heldGripX) || 0, z: 0 }
                : this._attachPointFor(bp, "griff").point;
            const axisRot = isStudio && mesh.userData && mesh.userData.heldAxis === "x" ? Math.PI / 2 : 0;
            mesh.position.set(off.x * sx - gp.x * ms, off.y - gp.y * ms, off.z - gp.z * ms);
            mesh.rotation.set(cfg.tilt.x, cfg.tilt.y * sx, cfg.tilt.z * sx + axisRot);
            anchor.add(mesh);
            return mesh;
        };
        if (eq && eq.held) pm.userData.heldMesh = buildHand(eq.held, "right");
        if (eq && eq.offhand) pm.userData.offhandMesh = buildHand(eq.offhand, "left");
    }

    // Die EINE Quelle der gehaltenen Studio-Gruppe, drei-wertig wie _workshopStudioPreviewFrom:
    // THREE.Group (Wrapper via _workshopWrapFoundryGroup) · "pending" (Part-Bau bleibt sichtbar) · null
    // (Part-Pfad byte-alt). Cache-Schlüssel == Werkstatt/Welt (`_foundryKoerperKey`, Stufe 0) → ein Werkstatt-
    // Asset dient der Hand instant. Miss → GENAU EINE Anfrage + EIN _refreshHeldMesh bei Ankunft. Der
    // Wrapper zählt _liveRefs (LRU disposed nie Gehaltenes); _disposeSoulGroup gibt den Ref zurück.
    _heldFoundryGroup(bpName) {
        const preset =
            typeof this._foundryPresetForEntry === "function" ? this._foundryPresetForEntry({ type: bpName }) : null;
        const f = this._ensureAssetFoundry(); // der Chokepoint prüft das Regime selbst (N7.4-Muster)
        if (!f) return null;
        if (!f.ready || !f.recipes) {
            // Worker bootet / Buch kalt: EIN Warte-Poll (Guard f._heldWaiting, das
            // _workshopWaiting-Muster) baut die Hand GENAU EINMAL neu, sobald das Buch
            // steht — bis dahin trägt der Part-Bau (die Hand ist nie leer).
            if (!f._heldWaiting) {
                f._heldWaiting = true;
                const t0 = performance.now();
                const poll = () => {
                    if (f.ready && f.recipes) {
                        f._heldWaiting = false;
                        try {
                            this._refreshHeldMesh();
                        } catch (_e) {
                            this._stoffBruch("die Hand (Neubau nach dem Buch)", _e);
                        }
                    } else if (performance.now() - t0 < 20000) setTimeout(poll, 150);
                    else f._heldWaiting = false;
                };
                setTimeout(poll, 150);
            }
            return preset ? "pending" : null;
        }
        if (!preset) return null;
        // Same → Variante EXAKT wie die Werkstatt-Vorschau (W-A1) → derselbe Cache-Schlüssel (der EINE `_werkSame`).
        const bp = this.state.blueprints ? this.state.blueprints[bpName] : null;
        const variant = this._foundryVariantFor(this._werkSame(bp, bpName), preset);
        if (variant == null) return "pending"; // Buch ohne Gestalten-Budget: die Hand wartet (der Part-Bau trägt)
        // Der beim Guss gestempelte Charakter (bp.studioOv) reist in den Hand-Bau: der ov-Hash trennt den
        // Cache-Schlüssel (ungeprägt bleibt byte-alt), das ov geht als 4. Arg an _foundryRequest.
        const heldOv = this._artifactStudioOv(bp);
        // Stufe 0 — die Hand ist NAH (kindStages.weapon == [0]; für mehrstufige Arten ist 0 die reiche Stufe).
        const key = this._foundryKoerperKey(preset, variant, 0, heldOv);
        const group = this._foundryCacheGet(key);
        if (group === undefined) {
            if (!f.requested) f.requested = new Set();
            if (!f.requested.has(key)) {
                f.requested.add(key);
                this._foundryRequest(preset, variant, 0, heldOv || undefined, 0).then((meshes) => {
                    if (meshes) {
                        this._foundryCacheSet(key, this._foundryBuildGroup(meshes, { lod: 0, preset }));
                        try {
                            this._refreshHeldMesh(); // Ankunft → die Hand einmal neu (Cache-Treffer, kein Loop)
                        } catch (_e) {
                            this._stoffBruch("die Hand (Neubau nach der Lieferung)", _e);
                        }
                    } else {
                        f.requested.delete(key); // Timeout: nicht dauerhaft doomen — der nächste Equip fragt neu
                    }
                });
            } else if (!f._heldCacheWait) {
                // Schlüssel schon UNTERWEGS (die requested-Wache dedupt global, der fremde Callback kennt die Hand
                // nicht): ein begrenzter Poll (EIN Guard, 45 s = Worker-Timeout) baut die Hand GENAU EINMAL neu,
                // sobald der Cache trägt; starb die fremde Anfrage, fragt der Neubau selbst frisch an.
                f._heldCacheWait = key;
                const tw0 = performance.now();
                const cachePoll = () => {
                    const arrived = f.cache && f.cache.has(key);
                    if (arrived || !f.requested.has(key)) {
                        f._heldCacheWait = null;
                        try {
                            this._refreshHeldMesh();
                        } catch (_e) {
                            this._stoffBruch("die Hand (Neubau nach dem Cache)", _e);
                        }
                    } else if (performance.now() - tw0 < 45000) setTimeout(cachePoll, 150);
                    else f._heldCacheWait = null;
                };
                setTimeout(cachePoll, 150);
            }
            return "pending";
        }
        if (group === null || !group.children || !group.children.length) return null;
        const wrap = this._workshopWrapFoundryGroup(group); // EINE Wrapper-Quelle (W-A1)
        if (!wrap) return null;
        wrap.userData.foundryHeld = true;
        wrap.userData.heldPreset = preset;
        // V4(B)-Ref: die Hand hält die Quell-Geometrie lebendig — die LRU räumt sie erst
        // nach der Rückgabe (_disposeSoulGroup) wirklich frei.
        group._liveRefs = (group._liveRefs || 0) + 1;
        wrap.userData.foundrySrcGroup = group;
        // Griff + Achse als DATEN: die KIND_POLICY-Zeile deklariert die Template-Handachse (weapon: handAxis
        // "x"), das LIVE-Buch die Griff-Mitte (`fx.held.gripX`, im Kern aus stations(P) wie buildInstance).
        // Kein Dial-Raten im Wirt; Fallback ohne held-Feld: die Klingen-Formel s.griff/2, sonst 0.
        const rec = f.recipes[preset];
        const pol = rec && rec.kind ? AnazhRealm.KIND_POLICY[rec.kind] : null;
        const ax = !!(pol && pol.handAxis === "x");
        wrap.userData.heldAxis = ax ? "x" : "y";
        // Die Werk-Art als DATEN (fx.task.art aus dem LIVE-Buch: klinge · keil · graben · pick · bogen): die Faust legt
        // danach die Schneide bzw. den Kopf in die Schwung-Ebene und den Bogen längs in den Griff (`_refreshHeldMesh`).
        wrap.userData.heldArt = (rec && rec.fx && rec.fx.task && rec.fx.task.art) || null;
        const held = rec && rec.fx && rec.fx.held;
        const s = rec && rec.s;
        wrap.userData.heldGripX =
            held && Number.isFinite(held.gripX) ? held.gripX : ax && s && Number.isFinite(s.griff) ? s.griff * 0.5 : 0;
        return wrap;
    }

    // ── PRÄGUNG-WELT (Linse gate:praegung-welt) ──
    // Die Prägung REIST MIT DEM ARTEFAKT: beim Guss (_forgeMaterialAndFreeze · schöpfer-wield ·
    // confirmBuild) wird state.workshop.studioOv als `studioOv` auf Bauplan bzw. Welt-Eintrag gestempelt.
    // Die Welt-Chokepoints (_foundryFlattenFor · _heldFoundryGroup) lesen NUR den Stempel, nie den Kanal —
    // späteres präge ändert Bestehendes nicht. Reist im Snapshot + im place-DSL (spawn_blueprint Slot 6).

    // Der EINE deterministische ov-Hash: JSON-stabil (Schlüssel rekursiv sortiert) → FNV-1a 32 bit → hex +
    // Längen-Zweitdiskriminator (gegen stille 32-bit-Kollisionen). Trennt Cache-/Request-/Batch-Schlüssel
    // (leafKey) geprägter von ungeprägten Instanzen, in beide Richtungen. Bewusst OHNE "{" (die Cache-
    // Reinheits-Probe prüft „kein JSON-Key im Cache"). WeakMap-Memo je Objekt (Inhalt per Guss gefroren).
    _studioOvHash(ov) {
        if (!this._studioOvHashMemo) this._studioOvHashMemo = new WeakMap();
        const memo = this._studioOvHashMemo.get(ov);
        if (memo !== undefined) return memo;
        const stable = (v) => {
            if (v === null || typeof v !== "object") return JSON.stringify(v);
            if (Array.isArray(v)) return "[" + v.map(stable).join(",") + "]";
            return (
                "{" +
                Object.keys(v)
                    .sort()
                    .map((k) => JSON.stringify(k) + ":" + stable(v[k]))
                    .join(",") +
                "}"
            );
        };
        const s = stable(ov);
        let h = 0x811c9dc5;
        for (let i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 0x01000193);
        }
        const out = (h >>> 0).toString(16) + "." + s.length;
        this._studioOvHashMemo.set(ov, out);
        return out;
    }

    // Der EINE Lese-Punkt des Artefakt-Stempels (Bauplan ODER Welt-Eintrag): liefert
    // ein non-leeres plain object oder null (fail-closed gegen Müll-Formen — ein
    // manipulierter Save/Peer kann hier keinen Nicht-Objekt-Stempel einschleusen).
    _artifactStudioOv(obj) {
        const ov = obj ? obj.studioOv : null;
        if (!ov || typeof ov !== "object" || Array.isArray(ov)) return null;
        return Object.keys(ov).length ? ov : null;
    }

    // STEMPEL-Chokepoint des Gusses: friert die Werkstatt-Prägung (_workshopStudioOvFor) als
    // bp.studioOv ein (tiefe JSON-Kopie). Neuer Guss ohne Prägung räumt den Alt-Stempel; Nicht-Studio-
    // Baupläne bleiben byte-unberührt. __-Schlüssel (z. B. __tradition) reisen unangetastet mit.
    _stampStudioOv(bp, name) {
        if (!bp) return;
        const preset =
            typeof this._foundryPresetForEntry === "function"
                ? this._foundryPresetForEntry({ type: name || bp.name })
                : null;
        if (!preset) return;
        const ov = typeof this._workshopStudioOvFor === "function" ? this._workshopStudioOvFor(preset) : null;
        let gestempelt = false;
        if (ov) {
            try {
                const json = JSON.stringify(ov);
                // Dieselbe 8-KiB-Taille-Wand wie _deserializeBlueprint: ein Riesen-Kanal stempelt gar nicht erst —
                // sonst lebte er live und würde beim Reload still gewaschen.
                if (json && json.length <= AnazhRealm.TAILLE_UNKNOWN_FIELD_MAX) {
                    bp.studioOv = JSON.parse(json);
                    gestempelt = true;
                }
            } catch (_e) {
                /* nicht-serialisierbar → kein Stempel (fail-closed) */
            }
        }
        if (!gestempelt && bp.studioOv !== undefined) delete bp.studioOv;
    }

    // Werkstatt-Gate am Mach-Akt: ein domain-tragender Bauplan (forging → Esse, alchemy → Brennkolben)
    // verlangt im pfad-Modus die passende Welt-Werkstatt in WORKSHOP_PROXIMITY_M; domain-los oder
    // frieden/schöpfer überspringt (wie das Build-Gate); ohne Spieler-Position kein Check. Der WERK-KERN
    // _forgeMaterialAndFreeze zahlt + friert `forgedPrecision` ein; ausrüsten macht der Aufrufer.
    _makeStationGate(name) {
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        if (!pm) return { ok: true };
        return this._workshopStationGate(name, { x: pm.x, y: pm.y, z: pm.z });
    }

    _forgeMaterialAndFreeze(name) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        const station = this._makeStationGate(name);
        if (!station.ok) {
            return { ok: false, reason: "no_workshop_station", neededDomain: station.neededDomain };
        }
        const gate = this._makeCostGate(name);
        if (!gate.ok) {
            return { ok: false, reason: "not_enough_material", missing: gate.missing || {}, cost: gate.cost || {} };
        }
        bp.forgedPrecision = this._compoundAvgPrecisionFromParts(bp.parts);
        // PRÄGUNG-WELT — der Guss stempelt: die JETZT aktive Werkstatt-Prägung friert
        // als bp.studioOv ein (der EINE Werk-Kern deckt schmieden/weben/fertigen).
        this._stampStudioOv(bp, name);
        // Frisch geschmiedet startet mit voller wear (REPAIR_TARGET_WEAR); Hiebe zehren sie, bei Erschöpfung
        // braucht es den Repair-Akt.
        bp.wear = AnazhRealm.REPAIR_TARGET_WEAR;
        if (typeof this._feelAction === "function") this._feelAction("create", { blueprint: name });
        return { ok: true, free: !!gate.free, forgedPrecision: bp.forgedPrecision };
    }

    // W5 (V18.192) — der EINE Lese-Punkt für wear (Migration-tolerant): ein
    // Bauplan ohne wear-Feld liest 1 (voll — alte Welten verlieren NICHTS,
    // jede Erst-Welt fängt voll an). Der Schreib-Pfad nutzt `_clampWear`.
    _blueprintWear(bp) {
        if (!bp || typeof bp !== "object") return 1;
        const w = Number(bp.wear);
        if (!Number.isFinite(w)) return 1;
        return Math.max(0, Math.min(1, w));
    }

    // W5 — clamp + write. Wenn wear ≤ 0, gilt das Gerät als verbraucht (der
    // Hieb wird verweigert, der Spieler bekommt den Repair-Aufruf).
    _setBlueprintWear(bp, value) {
        if (!bp) return 0;
        bp.wear = Math.max(0, Math.min(1, Number(value) || 0));
        return bp.wear;
    }

    // Verschleiß je Hieb = WEAR_PER_STRIKE_BASE × FLOOR / clamp(härte, FLOOR, CEIL)
    // (WEAR_HARDNESS_FLOOR · WEAR_HARDNESS_CEIL): harte Materialien zehren langsamer; CEIL klemmt
    // unrealistisch harte (sonst unzerstörbar), FLOOR deckelt den Verschleiß weicher Materialien.
    _wearPerStrike(bp) {
        const tags = bp && typeof this.computeCompoundTags === "function" ? this.computeCompoundTags(bp) : null;
        const haerte = tags && typeof tags["härte"] === "number" ? tags["härte"] : 0.5;
        const floor = AnazhRealm.WEAR_HARDNESS_FLOOR;
        const ceil = AnazhRealm.WEAR_HARDNESS_CEIL;
        const norm = Math.max(floor, Math.min(ceil, haerte));
        // Härte normiert zu Verschleiß-Skalierung: floor → 1.0×, ceil → 1/3.
        const scale = floor / norm;
        return AnazhRealm.WEAR_PER_STRIKE_BASE * scale;
    }

    // wear-Faktor auf den Treffer-Schaden des gehaltenen Geräts, linear: wear=0 → WEAR_STAT_FLOOR (0.3, nie 0 —
    // ein abgenutztes Werkzeug wirkt noch), wear=1 → 1.0. Der EINE Leser: _kampfKraft (Welle L, K-D6 — Klinge und Pfeil).
    _wearStatFactor(bp) {
        const w = this._blueprintWear(bp);
        const floor = AnazhRealm.WEAR_STAT_FLOOR;
        return floor + (1 - floor) * w;
    }

    // REPAIR-Akt für das gehaltene Gerät (kein DSL-Op, nur UI/API-Geste). Kosten = Voll-Bau-Kosten ×
    // REPAIR_COST_FRACTION × (1 − wear); schöpfer frei (Ledger-Fakt ohne Inventar-Abzug).
    // Liefert {ok, before, after, cost} oder Fehler-Reason.
    repairHeldDevice() {
        const heldName = this.state.player && this.state.player.equipped ? this.state.player.equipped.held : null;
        if (!heldName) return { ok: false, reason: "no_held_device" };
        const bp = this.state.blueprints && this.state.blueprints[heldName];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        const before = this._blueprintWear(bp);
        if (before >= AnazhRealm.REPAIR_TARGET_WEAR - 0.001) {
            return { ok: false, reason: "already_full", wear: before };
        }
        // Schaden-Anteil (1 - wear) bestimmt den Material-Bedarf — eine
        // 50%-Abnutzung zahlt 25 % vom Voll-Bau (= 0.5 × REPAIR_FRACTION),
        // eine kaputte 47.5 % (= 0.95 × REPAIR_FRACTION).
        const damageFraction = AnazhRealm.REPAIR_TARGET_WEAR - before;
        const repairScale = AnazhRealm.REPAIR_COST_FRACTION * damageFraction;
        // Voll-Kosten holen — `computeBuildCost` liefert die Material-Tabelle.
        const fullCost = typeof this.computeBuildCost === "function" ? this.computeBuildCost(bp) || {} : {};
        const repairCost = {};
        for (const [mat, units] of Object.entries(fullCost)) {
            if (typeof units !== "number" || units <= 0) continue;
            const need = Math.max(1, Math.round(units * repairScale));
            repairCost[mat] = need;
        }
        // Modus: schöpfer = frei (kein Material-Zug), pfad/frieden = ehrlich zahlen.
        const mode = typeof this.getGameMode === "function" ? this.getGameMode() : "frieden";
        const free = mode === "schöpfer";
        if (!free) {
            // Bestand prüfen (alle Materialien gleichzeitig — atomar).
            const inv = (this.state.player && this.state.player.inventory) || {};
            const missing = {};
            for (const [mat, need] of Object.entries(repairCost)) {
                const have = inv[mat] || 0;
                if (have < need) missing[mat] = need - have;
            }
            if (Object.keys(missing).length > 0) {
                return { ok: false, reason: "not_enough_material", missing, cost: repairCost };
            }
            // Zahlen.
            for (const [mat, need] of Object.entries(repairCost)) {
                inv[mat] = (inv[mat] || 0) - need;
                if (inv[mat] <= 0) delete inv[mat];
            }
        }
        const after = this._setBlueprintWear(bp, AnazhRealm.REPAIR_TARGET_WEAR);
        if (typeof this.recomputePlayerStats === "function") this.recomputePlayerStats();
        if (typeof this._refreshIchIfOpen === "function") this._refreshIchIfOpen();
        if (typeof this._feelAction === "function") this._feelAction("repair", { blueprint: heldName });
        this.log(
            `Werkzeug repariert: „${bp.label || heldName}" → ${Math.round(after * 100)} % wear${
                free
                    ? " (schöpfer-frei)"
                    : ` · ${Object.entries(repairCost)
                          .map(([m, n]) => `${n}× ${m}`)
                          .join(", ")}`
            }.`,
            "INFO"
        );
        if (typeof this.saveState === "function") this.saveState();
        return { ok: true, before, after, cost: repairCost, free };
    }

    // S3 (kampf-plan §11.7, §10-F3) — das Gerät SCHMIEDEN: der WERK-Kern (Material + Präzision-Snapshot +
    // Affekt) + das gehaltene Gerät AUSRÜSTEN (equipHeld). Der Spiegel von „bauen" für gehaltene Geräte.
    // (equipHeld bleibt der freie GEBRAUCH; das Kosten-Tor sitzt hier im WERK-Akt.)
    forgeBlueprint(name) {
        const make = this._forgeMaterialAndFreeze(name);
        if (!make.ok) return make;
        const eq = this.equipHeld(name);
        return { ok: true, equipped: eq.equipped, free: make.free, forgedPrecision: make.forgedPrecision };
    }

    // „In die Hand nehmen": UNgeschmiedet in pfad/frieden → erst SCHMIEDEN (Material zahlen + Präzision
    // einfrieren); geschmiedet (forgedPrecision, reist im Snapshot) oder schöpfer → frei ausrüsten.
    // equipHeld bleibt das freie Low-Level-Primitiv (Restore/DSL/Chat/Aliase).
    wieldBlueprint(name) {
        if (!name) return this.equipHeld(null);
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return this.equipHeld(name); // unbekannt → equipHeld liefert die saubere Ablehnung
        const mode = typeof this.getGameMode === "function" ? this.getGameMode() : "frieden";
        if (Number.isFinite(bp.forgedPrecision) || mode === "schöpfer") {
            // Im schöpfer-Modus gibt es keinen Schmiede-Akt: der Griff zu einem UNgeschmiedeten Gerät IST sein
            // Guss → hier stempeln; ein geschmiedetes bleibt unangetastet.
            if (!Number.isFinite(bp.forgedPrecision) && mode === "schöpfer") this._stampStudioOv(bp, name);
            return this.equipHeld(name);
        }
        return this.forgeBlueprint(name);
    }

    // S4 (kampf-plan §11.7) — Rüstung SCHMIEDEN/WEBEN: derselbe WERK-Kern wie das Gerät, nur in den
    // armor-Slot ausgerüstet. Verlangt einen als Rüstung markierten Bauplan (role:"armor" — die Schutz-
    // Lesart, gesetzt via setBlueprintAsArmor); dann zahlt der Akt Material + friert die Präzision ein.
    forgeArmor(name) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.role !== "armor") return { ok: false, reason: "not_marked_as_armor" };
        const make = this._forgeMaterialAndFreeze(name);
        if (!make.ok) return make;
        const eq = this.equipArmor(name);
        return { ok: true, equipped: eq.equipped, free: make.free, forgedPrecision: make.forgedPrecision };
    }

    // „Rüstung anlegen" (Spiegel von wieldBlueprint): UNgemacht in pfad/frieden → erst schmieden/weben
    // (zahlt + friert ein); gemacht (forgedPrecision) oder schöpfer → frei tragen. equipArmor bleibt das
    // freie Low-Level-Primitiv (Restore/DSL/Chat).
    wearArmor(name) {
        if (!name) return this.equipArmor(null);
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return this.equipArmor(name);
        const mode = typeof this.getGameMode === "function" ? this.getGameMode() : "frieden";
        if (Number.isFinite(bp.forgedPrecision) || mode === "schöpfer") return this.equipArmor(name);
        return this.forgeArmor(name);
    }

    // Trank BRAUEN: die Zutaten (Material-Kosten des Konsumable-Bauplans, z. B. `laub`) laufen durchs
    // Mach-Tor (pfad/frieden zahlen, schöpfer frei), DANN wirkt activateConsumable — kein Gratis-Boost.
    // activateConsumable bleibt das freie Low-Level-Primitiv (DSL/Chat/Tabellen-Tränke).
    brewConsumable(name) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp || bp.role !== "consumable") return { ok: false, reason: "not_a_consumable" };
        const station = this._makeStationGate(name);
        if (!station.ok) {
            return { ok: false, reason: "no_workshop_station", neededDomain: station.neededDomain };
        }
        const gate = this._makeCostGate(name);
        if (!gate.ok) {
            return { ok: false, reason: "not_enough_material", missing: gate.missing || {}, cost: gate.cost || {} };
        }
        const res = this.activateConsumable(name);
        return { ok: !!res.ok, reason: res.reason, free: !!gate.free };
    }

    // S4/S5/S6 (kampf-plan §11.5) — der EINE „Fertigen"-Akt der Werkstatt: routet nach der Rolle in den
    // richtigen Werk-Verb (Rüstung → weben, Seele → Körper formen, Trank → brauen, sonst → Gerät schmieden).
    // Der Keim der EINEN Werkstatt-Gebärmutter (§11.5) — ein Akt, rollen-gerecht.
    fertigeBlueprint(name) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (bp && bp.role === "armor") return this.forgeArmor(name);
        if (bp && bp.role === "soul") return this.forgeAvatar(name);
        if (bp && bp.role === "consumable") return this.brewConsumable(name);
        // Ein Bauwerk wird gebaut, nicht gehalten (Welle L, V-k11): der Bau-Modus übernimmt (confirmBuild zahlt beim
        // Setzen); Schublade und Inventar schließen, damit das Phantom in der Welt steht. Der EINE Weg jedes Bauwerks —
        // Werkstatt-FERTIGEN und Rezeptbuch („Bauen") rufen ihn (Welle L Folge: das Rezeptbuch zahlte beim Fertigen UND
        // beim Setzen und legte das Werk ins Inventar). Kann das Setzen nicht tragen (`_bauVorabTor` in der Engstelle
        // `_bauModusFuer`: das Gesetz des Modus), sagt FERTIGEN es, statt in einen Bau-Modus zu führen, der nur abgelehnt
        // werden kann.
        if (bp && this._isPlaceableBlueprint(bp)) {
            const res = this._bauModusFuer(name);
            if (res.ok) {
                this.closeAllDrawers();
                if (this.state.inventoryOpen) this.toggleInventoryOverlay(false);
            }
            return res.ok ? { ok: true, bauModus: true, slot: res.slot, free: !!res.free } : res;
        }
        return this.forgeBlueprint(name);
    }

    // Rüstung ausrüsten. Akzeptiert null/leer für „abnehmen". Blueprint muss
    // mit role:"armor" markiert sein (via setBlueprintAsArmor). (Rüstung bleibt ein
    // eigener GETRAGENER Slot — sie ist nicht „in der Hand".)
    equipArmor(name) {
        if (!this.state.player) return { ok: false, reason: "no_player" };
        if (!name) {
            this.state.player.equipped = this.state.player.equipped || { held: null, armor: null };
            this.state.player.equipped.armor = null;
            this.recomputePlayerStats();
            this._refreshIchIfOpen(); // M5 — Equip-Feedback ist instant
            return { ok: true, equipped: null };
        }
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.role !== "armor") return { ok: false, reason: "not_marked_as_armor" };
        this.state.player.equipped = this.state.player.equipped || { held: null, armor: null };
        this.state.player.equipped.armor = name;
        this.recomputePlayerStats();
        this._refreshIchIfOpen(); // M5 — Equip-Feedback ist instant
        return { ok: true, equipped: name };
    }

    // Welle 6.D Etappe 3a — Konsumable definieren. Validiert tagBonus (nur
    // MATERIAL_TAG_KEYS, ge-clamp ±1), duration (0.5..600 s), Cap 32 eigene.
    createOrUpdateConsumable(name, tagBonus, durationSeconds, label) {
        if (typeof name !== "string" || name.length === 0 || name.length > 40) {
            return { ok: false, reason: "invalid_name" };
        }
        const safe = name.replace(/[^a-z0-9_-]/gi, "").slice(0, 40);
        if (!safe) return { ok: false, reason: "invalid_name_after_sanitize" };
        const cleanedBonus = {};
        if (tagBonus && typeof tagBonus === "object") {
            for (const tag of AnazhRealm.MATERIAL_TAG_KEYS) {
                const v = Number(tagBonus[tag]);
                if (Number.isFinite(v) && v !== 0) cleanedBonus[tag] = Math.max(-1, Math.min(1, v));
            }
        }
        if (Object.keys(cleanedBonus).length === 0) return { ok: false, reason: "no_tag_bonus" };
        const dur = Math.max(0.5, Math.min(600, Number(durationSeconds) || 30));
        if (!this.state.consumables) this.state.consumables = {};
        const existing = this.state.consumables[safe];
        const count = Object.keys(this.state.consumables).length;
        if (!existing && count >= 32) return { ok: false, reason: "too_many_consumables" };
        this.state.consumables[safe] = {
            name: safe,
            label: typeof label === "string" ? label.slice(0, 60) : safe.replace(/_/g, " "),
            tagBonus: cleanedBonus,
            durationSeconds: dur,
            createdAt: performance.now() / 1000,
        };
        return { ok: true, name: safe };
    }

    // Bauplan als Konsumabel markieren: die Wirkung emergiert aus der Komposition —
    // tagBonus = computeCompoundTags × scale (z. B. Wasser-Part + Pflanze-Part), keine Wert-Tabelle.
    setBlueprintAsConsumable(name, durationSeconds, label, scale) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.builtIn) return { ok: false, reason: "cannot_modify_builtin" };
        const dur = Math.max(0.5, Math.min(600, Number(durationSeconds) || 30));
        const sc = Math.max(0.02, Math.min(1, Number(scale) || 0.2));
        bp.role = "consumable";
        // Welle 9a — manueller Role-Override (siehe setBlueprintAsArmor)
        bp.roleManual = true;
        bp.consumableMeta = {
            durationSeconds: dur,
            scale: sc,
            label: typeof label === "string" ? label.slice(0, 60) : bp.label || name,
        };
        return { ok: true, name };
    }

    // Bauplan als Welt-Portal: die Tor-Natur emergiert aus der Substanz (_isPortalShaped); diese Methode
    // bindet das ZIEL (portalMeta.world) und erzwingt die Rolle (roleManual = true), wie
    // setBlueprintAsConsumable/-Armor. Beim Betreten lädt die Welt im sandboxed iframe.
    setBlueprintAsPortal(name, portalMeta) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.builtIn) return { ok: false, reason: "cannot_modify_builtin" };
        bp.role = "portal";
        // manuellen Override merken (siehe setBlueprintAsArmor)
        bp.roleManual = true;
        bp.portalMeta = this._sanitizePortalMeta(portalMeta, bp.label || name);
        // Stehende Einträge nachziehen: Affordances werden beim Spawn eingefroren — ein schon platziertes Tor
        // bliebe sonst bis zum Reload tot. Dieselbe EINE Quelle (computeBlueprintAffordances) je Eintrag.
        const arches = this.state.architectures;
        if (Array.isArray(arches)) {
            for (const entry of arches) {
                if (entry && entry.type === name) {
                    entry.affordances = this.computeBlueprintAffordances(bp);
                    this._blockerNetzSetzen(entry); // das Verzeichnis der Affordanzen
                }
            }
        }
        return { ok: true, name };
    }

    // Eigenen Bauplan auf eine registrierte Welt richten (per id oder Label): die Welt-Registry liefert
    // Pfad + Manifest, setBlueprintAsPortal verdrahtet — jeder Magie-Ring wird ein gezieltes Tor.
    aimBlueprintAtWorld(blueprintName, worldId) {
        const key = String(worldId || "")
            .trim()
            .toLowerCase();
        // W14 Phase 3 — Built-in-Registry UND importierte Welten als Ziel.
        let entry = this._worldEntry(key);
        if (!entry) {
            entry = this._libraryWorlds().find((w) => w.label.toLowerCase() === key);
        }
        if (!entry) return { ok: false, reason: "world_unknown" };
        const meta = {
            world: entry.world,
            label: entry.label,
            dsl: entry.dsl.slice(),
        };
        // V8.70 — die Vertrauensstufe der Welt mitgeben (sandboxed → das
        // Portal-iframe wird null-origin: eine echte fremde Engine läuft
        // voll, kann AnazhRealm aber nicht berühren).
        if (entry.trust) meta.trust = entry.trust;
        // KI-Übersetzer Phase 2 — eine aufgebaute übersetzte Welt teilt sich
        // den generischen Renderer worlds/translated/; die translatedWorldId
        // sagt ihm beim enter-Handshake, welche Szene er aufbauen soll.
        const custom = this.state.customWorlds && this.state.customWorlds[entry.id];
        if (custom && custom.translated) meta.translatedWorldId = entry.id;
        // multiplayer-Marke → das Portal lädt mit dem Transport-Shim und lädt beim Betreten die Gruppe ein;
        // `serverMode:"js-compute"` → ein Peer wird Compute-Host der autoritativen Server-JS.
        if (entry.multiplayer === true) meta.multiplayer = true;
        if (entry.serverMode === "js-compute") meta.serverMode = "js-compute";
        // W18-B — deklariert die Welt das Ko-Präsenz-Protokoll, trägt ihr
        // Portal die Marke: das Mesh wird ihre Multiplayer-Schicht.
        if (entry.coPresence === true) meta.coPresence = true;
        return this.setBlueprintAsPortal(blueprintName, meta);
    }

    // ===== Bibliothek =====
    // Die WORLD_REGISTRY als spieler-erreichbarer Ort: ein Klick legt einen Portal-Bauplan ins Inventar,
    // der Spieler platziert ihn und geht hindurch.

    // Portal-Bauplan für eine registrierte Welt: einmal pro Welt wird der Magie-Ring welt_portal nach
    // portal_<id> geklont (cloneBlueprint: nur Substanz, builtIn:false) und via aimBlueprintAtWorld
    // gerichtet; danach nur noch ins Inventar (addToInventory stackt) — eine Welt, ein Portal-Bauplan.
    obtainPortalForWorld(worldId) {
        const key = String(worldId || "")
            .trim()
            .toLowerCase();
        // W14 Phase 3 — Built-in-Registry UND importierte Welten.
        const entry = this._worldEntry(key);
        if (!entry) return { ok: false, reason: "world_unknown" };
        // Eine importierte Welt ohne erreichbare Dateien ergäbe ein Portal
        // ins Leere — kein Bauplan, ehrlicher Befund (der KI-Übersetzer
        // müsste die Welt-Dateien erst vendorn).
        if (this.state.customWorlds && this.state.customWorlds[key] && entry.reachable === false) {
            return { ok: false, reason: "world_unreachable" };
        }
        const bpName = `portal_${entry.id}`;
        // Bauplan einmal anlegen (Klon des portal-förmigen Magie-Rings).
        const justCloned = !this.state.blueprints || !this.state.blueprints[bpName];
        if (justCloned) {
            if (!this.cloneBlueprint("welt_portal", bpName)) {
                return { ok: false, reason: "clone_failed" };
            }
            this.state.blueprints[bpName].label = `Portal: ${entry.label}`;
        }
        // Immer (neu) ausrichten: danach trägt der Bauplan garantiert role "portal" + frisches portalMeta —
        // auch ein Portal, das seine Ausrichtung verlor, heilt so.
        const aim = this.aimBlueprintAtWorld(bpName, entry.id);
        if (!aim.ok) {
            if (justCloned) delete this.state.blueprints[bpName];
            return { ok: false, reason: aim.reason };
        }
        if (!this.addToInventory(bpName, 1)) {
            return { ok: false, reason: "inventory_full" };
        }
        // Die erste Entdeckung jeder Welt ist eine Erinnerung wert;
        // journalAppendOnce verhindert ein Fluten bei wiederholtem Holen.
        this.journalAppendOnce(
            `portalObtained:${entry.id}`,
            "growth",
            `Ein Tor zur ${entry.label} fand den Weg in deine Sammlung.`,
            { world: entry.id }
        );
        this.saveState();
        return { ok: true, blueprint: bpName, label: entry.label };
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
            this.journalAppend("witness", `Ich folge nun ${this._vibeFingerprint(key)} — seine Werke begleiten mich.`, {
                follow: key,
            });
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
            this.journalAppend("share", `Ich liess ein Wort bei „${id}" zurueck: „${x.slice(0, 60)}"`, {
                comment: id,
            });
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
        const colors = AnazhRealm.BLUEPRINT_ROLE_COLORS || {};
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
            const colors = AnazhRealm.BLUEPRINT_ROLE_COLORS || {};
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
        canvas.width = w;
        canvas.height = h;
        let renderer;
        try {
            renderer = new THREE.WebGPURenderer({ canvas, antialias: true, forceWebGL: AnazhRealm._forceWebGL() });
        } catch (err) {
            this.log(`Feed-Vorschau: WebGPU-Renderer fehlgeschlagen (${err && err.message})`, "ERROR");
            return null;
        }
        renderer.stencil = false; // wie die Hof-Bühne (V10.0-j.b)
        renderer.setSize(w, h, false);
        renderer.setPixelRatio(window.devicePixelRatio || 1);
        renderer.setClearColor(0x14110a, 1);
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
        try {
            renderer
                .init()
                .then(() => {
                    stage.rendererReady = true;
                    if (stage.active) this._feedPreviewStartRAF();
                })
                .catch((err) => this.log(`Feed-Vorschau init: ${err && err.message}`, "ERROR"));
        } catch (err) {
            this.log(`Feed-Vorschau init-Start: ${err && err.message}`, "ERROR");
        }
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
