class AnazhRealm_werkstatt_bauen {
    // ===== ATLAS · Werkstatt/bauen — Spec-Blatt · Paletten · Rezept-Panel · Kosten-Tore · Bau-Modus · Tastenbelegung =====
    // DER WECKER: ein Wartender (`wer`) hängt `fn(ok)` GENAU EINMAL an eine Zusage (Zug, Buch `f.buchDa` oder Karte) — kein
    // Poll, keine Frist (bis K38 gab je Wartendem auf das Buch ein 20-s-Poll still auf);
    // fragt er im selben Warten erneut, bleibt es der eine Wecker. Seinen Neubau fängt der Wartende selbst LAUT beim Namen
    // (`_stoffBruch`, K22: der Versuch steht dort, wo die Stoff-Wand ihn sieht); jede Zusage trägt je Wartenden eine
    // eigene Kette — ein gerissener Neubau stoppt keinen anderen.
    _foundryWecker(zusage, wer, fn) {
        const hoerer = this._foundryHoerer || (this._foundryHoerer = new WeakMap());
        let w = hoerer.get(zusage);
        if (!w) hoerer.set(zusage, (w = new Set()));
        if (w.has(wer)) return;
        w.add(wer);
        zusage.then(fn);
    }

    // ### Bau-Modus (Phantom-Cursor) ###
    // Die Hotbar wählt den Bauplan; ein halb-transparentes Phantom schwebt bm.phantomDistance (5 m) vor
    // dem Spieler (Yaw-Richtung), F baut dort, ESC verlässt den Modus. Das Phantom ist ein normaler
    // Builder-Group mit transparenten Materialien — kein Sondermodell.

    // Hotbar-Slot 0..8 wählen: leerer Slot → Bau-Modus aus; derselbe aktive Slot erneut → Modus aus
    // (Toggle); sonst Phantom auf den neuen Bauplan.
    selectHotbarSlot(slotIndex) {
        const bm = this.state.buildMode;
        const idx = Math.max(0, Math.min(8, slotIndex | 0));
        const blueprintName = this.state.hotbar[idx];
        // Toggle: gleicher aktiver Slot → Modus aus.
        if (bm.active && bm.slotIndex === idx) {
            this._clearBuildMode();
            this._updateHotbarHighlight();
            return;
        }
        // Leerer Slot: keinen Modus aktivieren (aber Highlight setzen).
        if (!blueprintName || !this.state.blueprints[blueprintName]) {
            this._clearBuildMode();
            bm.slotIndex = idx;
            this._updateHotbarHighlight();
            return;
        }
        // Hotbar-Gate: die Natur des Bauplans (aus Rolle + Form gelesen, kein Hand-Flag) entscheidet — eine
        // PLATZIERBARE Struktur bekommt das Phantom (unten), alles andere (Gerät/Rüstung/Seele/Trank) geht in
        // die Hand/an den Körper. Re-Auswahl des gehaltenen Slots → ablegen.
        if (!this._isPlaceableBlueprint(this.state.blueprints[blueprintName])) {
            this._clearBuildMode(); // kein Phantom
            bm.slotIndex = idx;
            const heldNow = this.state.player && this.state.player.equipped && this.state.player.equipped.held;
            const label = this.state.blueprints[blueprintName].label || blueprintName;
            if (heldNow === blueprintName) {
                this.equipHeld(null); // schon in der Hand → ablegen (Faust)
                this.log(`Abgelegt: ${label}`, "INFO");
            } else {
                // S3-B — der Spieler-Pfad: ein ungeschmiedetes Gerät wird hier GESCHMIEDET (zahlt
                // pfad/frieden), ein geschmiedetes frei in die Hand genommen.
                const result = this.wieldBlueprint(blueprintName);
                if (!result.ok) {
                    // Die Absage des Griffs spricht der Spieler-Kanal (Gegenprüfung 08.10.: sie stand nur im
                    // eingeklappten Log) — derselbe Formatter wie Werkstatt-Knopf und Setzen (`_machTorHint`).
                    this._spielerSagt(`${String(label).split(/\s[·—(]/)[0]}: ${this._machTorHint(result)}`);
                } else {
                    this.log(`In der Hand: ${label} (Slot ${idx + 1})`, "INFO");
                }
            }
            this._updateHotbarHighlight();
            if (typeof this.renderPlayerEquipUI === "function") this.renderPlayerEquipUI();
            return;
        }
        bm.active = true;
        bm.slotIndex = idx;
        bm.blueprintName = blueprintName;
        this._bauPhantomNeu(); // das alte Phantom (Bauplan-Wechsel) weicht
        this._updateBuildModeHud();
        this._updateHotbarHighlight();
        this.log(`Bau-Modus: ${blueprintName} (Slot ${idx + 1})`, "INFO");
    }

    // Das Phantom des Bau-Modus NEU (die Auswahl eines Bauplans und jedes Setzen, das den nächsten Samen zieht): das alte
    // weicht (Ort und Blick gehen über, kein Bild am Ursprung), das neue liest die GETEILTE Merge-Cache der platzierten
    // Struktur (kein Neubau je Teil → kein Auswahl-Hänger); Transparenz/castShadow regelt `_buildPlacementGhost`
    // (gecachter Material-Klon). Die Studio-Gestalt führt, wenn das Studio sie trägt (dieselbe Quelle wie der finale Eintrag).
    _bauPhantomNeu() {
        const bm = this.state.buildMode;
        const alt = bm.phantomMesh;
        if (alt) {
            if (this.state.scene) this.state.scene.remove(alt);
            this._disposeSoulGroup(alt);
        }
        bm.phantomMesh = null;
        bm.phantomStudioPending = null; // B1 — frisches Phantom, kein Alt-Pending
        // der Ort des Phantoms: der des alten, sonst der Blick (die Gestalt eines Baums folgt ihm, `_phantomWerk`)
        const wo = alt ? alt.position : this.state.playerMesh && bm.active ? this._resolvePhantomTarget() : null;
        const phantom = this._buildPlacementGhost(this.state.blueprints[bm.blueprintName], { wo });
        phantom.name = "bau-phantom";
        if (alt) {
            phantom.position.copy(alt.position);
            phantom.rotation.y = alt.rotation.y;
        }
        if (this.state.scene) this.state.scene.add(phantom);
        bm.phantomMesh = phantom;
    }

    // EIN BAUWERK GEHT IN DEN BAU-MODUS, NIE IN DIE HAND (Welle L, Befund V-k11): sein Hotbar-Platz (vorhanden, sonst
    // der erste freie) wird gewählt — das Phantom steht vor dir, RMB oder F setzt es (Werkstatt und Rezeptbuch setzen im
    // selben Akt, `fertigeBlueprint`, bauen.K1). Werkstatt-FERTIGEN legte die Eiche
    // (7,8 × 8,8 × 6,4 m) in die Hand, RMB schüttete dann auf, und keine UI leerte die Hand. Ohne freien Platz: laut.
    // Das Vorab-Tor sitzt HIER, in der Engstelle jedes Wegs in den Bau-Modus (Werkstatt-Knopf, Rezeptbuch, das Werk in
    // der Hand — Gegenprüfung 08.10.: es saß am Aufrufer, der Rechtsklick mit dem Werk in der Hand führte in frieden ohne
    // Material in einen Bau-Modus, der nur ablehnen konnte). Die Hotbar-Taste wählt den Platz selbst: dort nennt das
    // Bau-HUD die fehlenden Zahlen rot, und das Setzen sagt die Absage im Spieler-Kanal.
    _bauModusFuer(name) {
        if (!name || !this.state.blueprints || !this.state.blueprints[name]) return { ok: false, reason: "unknown" };
        const vorab = this._bauVorabTor(name);
        if (!vorab.ok) return vorab;
        const hb = this.state.hotbar || [];
        let idx = hb.indexOf(name);
        if (idx < 0) {
            idx = hb.findIndex((x) => !x);
            if (idx < 0) return { ok: false, reason: "hotbar_voll" }; // der Aufrufer sagt es (`_machTorHint`)
            this.setHotbarSlot(idx, name);
        }
        const bm = this.state.buildMode;
        if (!(bm.active && bm.slotIndex === idx && bm.blueprintName === name)) this.selectHotbarSlot(idx);
        return { ok: !!(bm.active && bm.blueprintName === name), slot: idx, free: !!vorab.free };
    }

    // DAS VORAB-TOR des Bau-Modus (Welle L Folge, L-Werkstatt): FERTIGEN führt nur dann in den Bau-Modus, wenn das Setzen
    // tragen KANN — das Gesetz des Modus: frieden und pfad zahlen Material, frei baut nur schöpfer (S2, Schöpfer-Befund
    // V17.60 „frieden bedeutet nicht gratis, das wäre der Schöpfer-Modus"). Es fragt `checkBuildCost`, ohne zu ziehen;
    // gezogen wird beim Setzen (`confirmBuild`, das EINE Mach-Tor). Befund: in frieden führte FERTIGEN in den Bau-Modus, der
    // Rechtsklick verweigerte, und die Absage stand nur im Log.
    _bauVorabTor(name) {
        if (this.getGameMode() === "schöpfer") return { ok: true, free: true };
        const c = this.checkBuildCost(name);
        return c.ok ? { ok: true } : { ok: false, reason: "not_enough_material", missing: c.missing, cost: c.cost };
    }

    // DAS URTEIL DES SETZENS (Integration V18.536, Auflage 2 der zweiten Werkstatt-Gegenprüfung): was `confirmBuild` am
    // Ort `ziel` ablehnen wird, in seiner Reihenfolge — pfad: der Standort trägt nicht (das Phantom ist instabil); pfad: keine
    // Werkstatt der Domäne in der Nähe (`_workshopStationGate`); ein Natur-Werk: die Natur-Wand (`_naturWand`); frieden und
    // pfad: das Material (`_bauVorabTor`, fragt ohne zu ziehen). Leser: das Phantom (`tickBuildMode` — grün nur, wenn das
    // Setzen trägt) und das Setzen selbst (Standort und Werkstatt; Natur-Wand und Material urteilen dort die Akte, die sie
    // tun). Befund: die Tönung urteilte nur über den Ort — auf dem Hotbar-Weg in frieden ohne Material stand das Phantom
    // grün, das Setzen lehnte ab. Rückgabe { ok, grund: standort | werkstatt | natur | material, … }.
    _setzUrteil(name, ziel, stabil) {
        if (this.getGameMode() === "pfad" && !stabil) return { ok: false, grund: "standort" };
        const station = this._workshopStationGate(name, ziel);
        if (!station.ok) {
            const d = station.neededDomain;
            const domaene = (AnazhRealm.TOOL_DOMAIN_LABELS && AnazhRealm.TOOL_DOMAIN_LABELS[d]) || d;
            return { ok: false, grund: "werkstatt", domaene };
        }
        const wand = this._istNatur({ type: name }) ? this._naturWand(name, ziel, {}) : false;
        if (wand) return { ok: false, grund: "natur", wand };
        const vorab = this._bauVorabTor(name);
        if (!vorab.ok) return Object.assign({ grund: "material" }, vorab);
        return { ok: true, grund: null };
    }

    // Bauplan in einen Hotbar-Slot legen. Persistiert sich automatisch via
    // Save. UI im Spieler-Drawer ruft das auf.
    setHotbarSlot(slotIndex, blueprintName) {
        const idx = Math.max(0, Math.min(8, slotIndex | 0));
        if (blueprintName && !this.state.blueprints[blueprintName]) {
            this.log(`Hotbar-Slot ${idx + 1}: unbekannter Bauplan '${blueprintName}'`, "ERROR");
            return false;
        }
        this.state.hotbar[idx] = blueprintName || null;
        this._renderHotbarDOM();
        // Wenn der aktive Slot geändert wurde, Phantom-Mesh neu bauen.
        if (this.state.buildMode.slotIndex === idx) {
            const wasActive = this.state.buildMode.active;
            this._clearBuildMode();
            if (wasActive && blueprintName) this.selectHotbarSlot(idx);
        }
        return true;
    }

    _clearBuildMode() {
        const bm = this.state.buildMode;
        if (bm.phantomMesh && this.state.scene) {
            this.state.scene.remove(bm.phantomMesh);
            this._disposeSoulGroup(bm.phantomMesh);
        }
        bm.active = false;
        bm.blueprintName = null;
        bm.phantomMesh = null;
        bm.phantomWand = null;
        bm.phantomGrund = null;
        bm.phantomStudioPending = null; // B1 — kein Heil-Swap für einen verlassenen Bauplan
        this._updateBuildModeHud();
    }

    // Bau ausführen: spawnArchitecture an aktueller Phantom-Position.
    // Modus bleibt aktiv für Mehrfach-Bau (ESC verlässt explizit).
    // === Welle 6.H Phase 2C — Material-Konsum beim Bauen (Spiegel zu harvest) ===
    //
    // Vision §1.5 Schöpfer-darf-frei-erschaffen + §10.1 Modus-Symmetrie: harvest
    // ist die Materialien-IN-Quelle, build ist die Materialien-OUT-Senke. In
    // pfad UND frieden quantifiziert (S2, Schöpfer-Befund V17.60: „frieden bedeutet nicht gratis,
    // das wäre der Schöpfer-Modus"), frei nur in schöpfer. Die Kosten emergieren
    // aus blueprint.parts via DERSELBEN Volumen-Formel wie harvestArchitecture
    // (HARVEST_VOLUME_TO_UNITS=4). Eine Konstante, beide Richtungen — bauen
    // einer 2.4³-stein_block kostet ~55 Stein und liefert beim harvest dieselben
    // ~55 zurück. Wertneutral.
    computeBuildCost(blueprintName) {
        const bp = this.state.blueprints && this.state.blueprints[blueprintName];
        if (!bp || !Array.isArray(bp.parts)) return {};
        const cost = {};
        const k = AnazhRealm.HARVEST_VOLUME_TO_UNITS;
        for (const part of bp.parts) {
            if (!part || typeof part.material !== "string") continue;
            const sx = Math.abs((part.size && part.size.x) || 1);
            const sy = Math.abs((part.size && part.size.y) || 1);
            const sz = Math.abs((part.size && part.size.z) || 1);
            const volume = sx * sy * sz;
            const units = Math.max(1, Math.round(volume * k));
            cost[part.material] = (cost[part.material] || 0) + units;
        }
        return cost;
    }

    // Liefert {ok, missing} ohne Mutation. missing zeigt was fehlt (für UI
    // + Chat-Output). Inventar-Summen pro Material gehen über alle Slots
    // (Stacking ist bereits geregelt, aber defensiv summiert).
    checkBuildCost(blueprintName) {
        const cost = this.computeBuildCost(blueprintName);
        const inv = (this.state.player && this.state.player.inventory) || [];
        const have = {};
        for (const slot of inv) {
            if (slot && slot.kind === "material" && typeof slot.material === "string") {
                have[slot.material] = (have[slot.material] || 0) + (slot.count || 0);
            }
        }
        const missing = {};
        for (const [mat, need] of Object.entries(cost)) {
            const has = have[mat] || 0;
            if (has < need) missing[mat] = need - has;
        }
        return { ok: Object.keys(missing).length === 0, cost, have, missing };
    }

    // Tooltip für Bauplan-Slots (Inventar/Hotbar): je Material need + have + ✓/✗ via checkBuildCost.
    _blueprintCostTooltip(blueprintName) {
        const bp = this.state.blueprints && this.state.blueprints[blueprintName];
        const label = (bp && (bp.label || bp.name)) || blueprintName;
        const check = this.checkBuildCost(blueprintName);
        const mats = Object.keys(check.cost);
        if (mats.length === 0) return `${label} — Bau-Kosten: keine`;
        const parts = mats.map((m) => {
            const need = check.cost[m];
            const have = check.have[m] || 0;
            return `${need}× ${m}: hast ${have} ${have >= need ? "✓" : "✗"}`;
        });
        return `${label} — Bau-Kosten: ${parts.join(" · ")}`;
    }

    // Atomar: erst prüfen, dann ALLE Materialien abziehen — fehlt eines, wird nichts abgezogen.
    // Geleerte Slots werden null (selbe Disziplin wie removeFromInventory).
    tryConsumeBuildCost(blueprintName) {
        const check = this.checkBuildCost(blueprintName);
        if (!check.ok) return check;
        const inv = this.state.player.inventory;
        for (const [mat, need] of Object.entries(check.cost)) {
            let remaining = need;
            for (let i = 0; i < inv.length && remaining > 0; i++) {
                const slot = inv[i];
                if (!slot || slot.kind !== "material" || slot.material !== mat) continue;
                const take = Math.min(remaining, slot.count || 0);
                slot.count = (slot.count || 0) - take;
                remaining -= take;
                if (slot.count <= 0) inv[i] = null;
            }
        }
        return check;
    }

    // Das rollen-agnostische MACH-TOR (confirmBuild, tryMousePlace, jeder Werk-Akt): Material läuft
    // durch computeBuildCost und kostet in pfad UND frieden, frei nur in schöpfer. Herkunfts-agnostisch
    // (geteilter Bauplan kostet wie eigener). Liefert {ok, missing} wie checkBuildCost.
    _makeCostGate(blueprintName) {
        const mode = typeof this.getGameMode === "function" ? this.getGameMode() : "frieden";
        if (mode === "schöpfer") return { ok: true, cost: {}, missing: {}, free: true };
        return this.tryConsumeBuildCost(blueprintName);
    }

    // Bauen ist der erste Werk-Akt — auf das generalisierte Mach-Tor umgehängt (verhaltens-gleich
    // bis auf die §11.2-Modus-Heilung: frieden zahlt jetzt auch Material).
    _buildMaterialGate(blueprintName) {
        return this._makeCostGate(blueprintName);
    }

    // === Welt-Werkstatt-Gate ===
    // pfad: ein domain-tragender Bauplan braucht eine Welt-Werkstatt (role="workshop-station",
    // emergente Domäne _computeWorkshopDomain === Bauplan-Domain) in WORKSHOP_PROXIMITY_M; sonst frei.
    // Baupläne ohne Domain und Workshop-Stationen selbst brauchen NIE eine — sonst Henne-Ei (erste Esse).
    _workshopStationGate(blueprintName, atPos) {
        const mode = typeof this.getGameMode === "function" ? this.getGameMode() : "frieden";
        if (mode !== "pfad") return { ok: true, free: true };
        const bp = this.state.blueprints && this.state.blueprints[blueprintName];
        if (!bp) return { ok: true }; // unbekannter Bauplan — anderer Pfad fängt's
        // Workshop-Stationen brauchen keinen Werkstatt-Check
        if (bp.role === "workshop-station") return { ok: true, bootstrap: true };
        const needed = this.computeBlueprintDomain(bp);
        if (!needed) return { ok: true }; // generic Bauplan — kein Check
        // Welt-Werkstatt im Radius suchen
        const radius = AnazhRealm.WORKSHOP_PROXIMITY_M;
        const r2 = radius * radius;
        for (const entry of this.state.architectures || []) {
            const wbp = this.state.blueprints && this.state.blueprints[entry.type];
            if (!wbp || wbp.role !== "workshop-station") continue;
            // S7-B — die bediente Domäne EMERGIERT aus der Substanz (kein hardcoded workshopDomain).
            if (this._computeWorkshopDomain(wbp) !== needed) continue;
            const dx = entry.position.x - atPos.x;
            const dy = entry.position.y - atPos.y;
            const dz = entry.position.z - atPos.z;
            if (dx * dx + dy * dy + dz * dz <= r2) {
                return { ok: true, found: entry.type, domain: needed };
            }
        }
        return { ok: false, neededDomain: needed };
    }

    // Präzisions-Cap einer Werkstatt emergiert aus ihrer SUBSTANZ (Material × Form), nie aus ihrer
    // Crafting-Qualität — sonst zirkulär (eine Basis-Esse cappt ewig auf Basis).
    // Werte browser-justierbar: AnazhRealm.WORKSHOP_PRECISION.
    _workshopStationPrecision(bp) {
        const t = this.computeCompoundTags(bp) || {};
        const cfg = AnazhRealm.WORKSHOP_PRECISION;
        // (1) MASSE: Compound-dichte (form×material) dämpft die Vibration → feiner; form-verstärkt ist hier
        // ehrlich (ein großer Block IST massereicher). Sättigt für ernste Werkstätten bei ~1.
        const solid = Math.min(1, (t.dichte || 0) / cfg.dichteRef);
        // (2) AMBOSS-HÄRTE: ROHE Material-Härte des härtesten Bauteils, NICHT form-verstärkt —
        // ein Kegel-Horn (härte ×3) ist kein härteres Werkzeug als sein Stahl.
        const mats = this.state.materials || {};
        let hard = 0;
        for (const p of bp.parts) {
            const m = mats[p.material];
            if (m && m.tags && (m.tags.härte || 0) > hard) hard = m.tags.härte;
        }
        hard = Math.min(1, hard);
        return Math.max(0, Math.min(cfg.max, cfg.base + cfg.fromDichte * solid + cfg.fromHärte * hard));
    }

    // V17.76 Welle 2 — die beste Präzision, die eine Welt-Werkstatt der gegebenen Domäne in
    // WORKSHOP_PROXIMITY_M bietet (Substanz, S7-B-emergent); 0 wenn keine passende Station nah ist.
    _nearbyWorkshopStationPrecision(domain, atPos) {
        if (!domain || !atPos) return 0;
        const radius = AnazhRealm.WORKSHOP_PROXIMITY_M;
        const r2 = radius * radius;
        let best = 0;
        for (const entry of this.state.architectures || []) {
            const wbp = this.state.blueprints && this.state.blueprints[entry.type];
            if (!wbp || wbp.role !== "workshop-station" || !entry.position) continue;
            if (this._computeWorkshopDomain(wbp) !== domain) continue;
            const dx = entry.position.x - atPos.x;
            const dy = entry.position.y - atPos.y;
            const dz = entry.position.z - atPos.z;
            if (dx * dx + dy * dy + dz * dz > r2) continue;
            const prec = this._workshopStationPrecision(wbp);
            if (prec > best) best = prec;
        }
        return best;
    }

    confirmBuild() {
        const bm = this.state.buildMode;
        if (!bm.active || !bm.blueprintName || !bm.phantomMesh) return false;
        const p = bm.phantomMesh.position;
        const spawnPos = { x: p.x, y: p.y + 0.5, z: p.z };
        const name = bm.blueprintName;
        const bpL = this.state.blueprints[name];
        const label = String((bpL && bpL.label) || name).split(/\s[·—(]/)[0];
        // Jede Absage des Setzens spricht der Spieler-Kanal (`_spielerSagt`, Welle L Folge — Befund: „nicht genug
        // Material" stand nur im eingeklappten Log, der Rechtsklick blieb stumm). Das Urteil ist das des Phantoms
        // (`_setzUrteil`): Standort und Werkstatt sagt es hier, Natur-Wand und Material sagen die Akte unten.
        const urteil = this._setzUrteil(name, spawnPos, bm.phantomOnGround);
        if (urteil.grund === "standort") {
            this._spielerSagt(`${label}: der Standort trägt nicht (rote Markierung) — ziel auf ebenen Boden.`);
            return false;
        }
        if (urteil.grund === "werkstatt") {
            this._spielerSagt(`${label}: du brauchst eine Werkstatt der Domäne „${urteil.domaene}" in der Nähe.`);
            this._renderBuildModeHud && this._renderBuildModeHud();
            return false;
        }
        // Geteilte string-id macht das Bauwerk peer-übergreifend identifizierbar (Abbau-Sync).
        const archId = this._newArchId();
        // Guss-Stempel: ein beim Craft gestempelter Bauplan (bp.studioOv) führt, sonst die gewählte
        // Werkstatt-Prägung (freier Bau: confirmBuild IST der Guss); EINE Quelle `_studioStampFor`.
        // Reist am Eintrag (Snapshot) und im place-DSL (Slot 6). Tiefe Kopie EINMAL + fail-closed VOR dem
        // Guss — sonst wirft ein nicht-serialisierbarer Wert nach Spawn, vor Broadcast (Welt-Spaltung).
        const bmStamp = this._studioStampFor(name);
        // Das Mach-Tor zieht das Material (das Gesetz des Modus: frieden und pfad zahlen, frei baut nur schöpfer — S2,
        // `_makeCostGate`) erst, wenn die Natur-Wand den Ort freigibt: ein Natur-Werk (Baum, Strauch, Fels) setzt wie der
        // Hain der KI durch `_naturSetzen` — die Lichtung der Genesis-Plattform bleibt frei, im Grundriss eines Hauses wächst
        // nichts (Befund: der Werkstatt-Baum stand auf der Lichtung, die der Satz der KI verweigert — zwei Mach-Akte, zwei
        // Urteile —, und der Grundriss räumte ihn beim nächsten Laden still). Eine Absage kostet nie Material.
        // Ω5 — ein im schöpfer-Modus (gate.free) gebautes Werk ist freeBorn: es erntet zu 0 (das Perpetuum-Verbot).
        // Das Werk IST das Phantom (Gegenprüfung 08.10.): sein Same ist der des Phantoms (`_werkSame` mit dem Bau-Modus — der
        // Wurf der Werkstatt, sonst der Same dieses Setzens), seine Drehung die des Phantoms; beides reist zum Mitspieler.
        // Befund: der Standard-Same der Wurzel war Math.random, das Werk stand mit Drehung 0, der Mitspieler bekam den Samen 0.
        const same = this._werkSame(bpL, name, bm);
        const rot = bm.phantomMesh.rotation;
        const dreh = rot && Number.isFinite(rot.y) ? rot.y : 0;
        let gate = null;
        let wand = null;
        const setzen = () => {
            gate = this._buildMaterialGate(name);
            if (!gate.ok) return null;
            return this.spawnArchitecture(name, spawnPos, {
                id: archId,
                seed: same,
                rotationY: dreh,
                freeBorn: gate.free === true,
                studioOv: bmStamp || undefined,
            });
        };
        const steht = this._istNatur({ type: name })
            ? this._naturSetzen(name, spawnPos, {}, setzen, (wo) => (wand = wo))
            : setzen();
        if (wand) {
            this._spielerSagt(`${label}: ${AnazhRealm.NATUR_WAND_GRUND[wand]} — setz es ein paar Schritte weiter.`);
            return false;
        }
        if (gate && !gate.ok) {
            this._spielerSagt(`${label}: ${this._machTorHint(Object.assign({ reason: "not_enough_material" }, gate))}`);
            this._renderBuildModeHud && this._renderBuildModeHud();
            return false;
        }
        if (!steht) {
            if (gate && gate.ok && !gate.free)
                for (const [m, n] of Object.entries(gate.cost || {})) this.addMaterialToInventory(m, n);
            this._spielerSagt(`${label}: hier steht es nicht — der Ort trägt das Werk nicht.`);
            return false;
        }
        if (this.state.p2p && this.state.p2p.enabled && typeof this.p2pBroadcastDsl === "function") {
            const posNode = ["at", spawnPos.x, spawnPos.y, spawnPos.z];
            // Same und Drehung des stehenden Werks — das EINE reisende Programm (`_werkProgramm`, auch der Werk-Code).
            this.p2pBroadcastDsl(this._werkProgramm(bm.blueprintName, posNode, steht.seed, archId, bmStamp, dreh));
        }
        // Das Werk steht: das nächste Setzen zieht seinen eigenen Samen, das Phantom zeigt ihn (ein Wurf der Werkstatt
        // bleibt stehen, wie gewürfelt).
        if (bm.setzSame && bm.setzSame.art === name) {
            bm.setzSame = null;
            this._bauPhantomNeu();
        }
        // Inventar-UI + HUD nach Konsum aktualisieren (pfad).
        if (!gate.free) {
            this.renderInventoryUI && this.renderInventoryUI();
            this._renderBuildModeHud && this._renderBuildModeHud();
            const consumedStr = Object.entries(gate.cost)
                .map(([m, n]) => `${n}× ${m}`)
                .join(", ");
            this.log(`Gebaut: ${label} (verbraucht ${consumedStr}).`, "INFO");
        }
        // V17.30/V17.46 — erschaffen hebt joy + hope, GEFÄRBT von der Substanz des
        // Gebauten (lebendiges Holz ≠ toter Stein) + skaliert mit der Komplexität.
        this._feelAction("build", { blueprint: bm.blueprintName });
        return true;
    }

    // Pro Frame: Phantom-Position aus Kamera-Raycast bestimmen (6.A4),
    // Stabilität visuell anzeigen (6.A5).
    tickBuildMode() {
        const bm = this.state.buildMode;
        if (!bm.active || !bm.phantomMesh || !this.state.playerMesh) return;
        const target = this._resolvePhantomTarget();
        // DAS PHANTOM ZEIGT DIE GESTALT SEINES ORTS (K20): wählt der Ort unter ihm eine andere Gestalt als die gezeigte (ein
        // Baum tritt aus dem Bestand ins Freie — der Solitär), heilt es zu ihr wie der Donor-Ghost, sofort versucht.
        const ud = bm.phantomMesh.userData;
        const bpJetzt = this.state.blueprints && this.state.blueprints[bm.blueprintName];
        if (ud.studioGhost && bpJetzt && ud.studioGestalt !== this._phantomGestalt(bpJetzt, target)) {
            if (bm.phantomStudioPending !== bm.blueprintName) bm._studioGhostRetryAt = 0;
            bm.phantomStudioPending = bm.blueprintName;
        }
        // B1 — der Donor-Ghost HEILT zur Studio-Gestalt, sobald das Asset dockt (fail-soft-
        // Rückweg der Geist-Vorschau; ratenbegrenzt — kein Per-Frame-Flatten-Versuch).
        if (bm.phantomStudioPending === bm.blueprintName && this.state.blueprints) {
            const nowMs = performance.now();
            if (!bm._studioGhostRetryAt || nowMs >= bm._studioGhostRetryAt) {
                bm._studioGhostRetryAt = nowMs + 500;
                const studio = this._buildStudioPlacementGhost(this.state.blueprints[bm.blueprintName], target);
                if (studio) {
                    if (this.state.scene) this.state.scene.remove(bm.phantomMesh);
                    this._disposeSoulGroup(bm.phantomMesh);
                    studio.name = "bau-phantom";
                    bm.phantomMesh = studio;
                    if (this.state.scene) this.state.scene.add(studio);
                }
            }
        }
        bm.phantomMesh.position.set(target.x, target.y, target.z);
        bm.phantomMesh.rotation.y = -this.state.yaw;
        bm.phantomOnGround = target.isStable;
        // Das Phantom sagt vor dem Klick, was das Setzen sagen wird (das EINE Urteil `_setzUrteil`): grün nur, wenn das
        // Setzen trägt; ein Natur-Werk über der Lichtung oder in einem Haus, ein Ort ohne die Werkstatt der Domäne, ein
        // Bauplan ohne Material steht rot, das HUD nennt den Grund.
        const urteil = this._setzUrteil(bm.blueprintName, target, target.isStable);
        const wand = urteil.grund === "natur" ? urteil.wand : false;
        const grund = urteil.grund === "werkstatt" ? "werkstatt:" + urteil.domaene : urteil.grund;
        if (wand !== bm.phantomWand || grund !== bm.phantomGrund) {
            bm.phantomWand = wand;
            bm.phantomGrund = grund;
            this._updateBuildModeHud();
        }
        this._applyPhantomTint(bm.phantomMesh, target.isStable && urteil.ok);
    }

    // Der Strahl des Fadenkreuzes (`_fadenkreuzStrahl`) gegen die Physik-Welt: erster Treffer in 30 m = Phantom-Position
    // (der Pitch steuert die Distanz). Ohne Treffer yaw×distance-Fallback, Phantom „instabil“ (schwebt frei).
    // Stabil = Hit-Normal-Y > 0.5 (begehbar, wie hang.maxSlopeY); nur ein Flag (Verbot beim Aufrufer).
    _resolvePhantomTarget() {
        const bm = this.state.buildMode;
        const p = this.state.playerMesh.position;
        const sf = this.state.scaleFactor || 1;
        // Fallback-Position: vor dem Spieler (die EINE Vorwärts-Richtung, waagrecht).
        const vorn = this._blickVorn(this.state.yaw, 0);
        const fallbackX = p.x + vorn.x * bm.phantomDistance;
        const fallbackY = p.y - 0.5;
        const fallbackZ = p.z + vorn.z * bm.phantomDistance;
        const fallback = { x: fallbackX, y: fallbackY, z: fallbackZ, isStable: false, hit: false };
        // P3 — der Raycast ist feld-nativ (`_runRaycast` → `_fieldRaycast`); nur die Kamera nötig.
        // Der Strahl des Fadenkreuzes (`_fadenkreuzStrahl`, v1-ankunft): ohne Kamera der Ort vor dem Spieler, beide durch
        // die Spieler-Klemme (`_phantomAusserhalb`).
        const F = this._fadenkreuzStrahl();
        if (!F) return this._phantomAusserhalb(fallback);
        const o = F.o;
        const d = F.d;
        const maxDist = 30;
        const rayStart = this.setVec(this.state.tmpVec1, o.x / sf, o.y / sf, o.z / sf);
        const rayEnd = this.setVec(
            this.state.tmpVec2,
            (o.x + d.x * maxDist) / sf,
            (o.y + d.y * maxDist) / sf,
            (o.z + d.z * maxDist) / sf
        );
        const result = this._runRaycast(rayStart, rayEnd, (cb, hit) => {
            if (!hit) return fallback;
            const point = cb.get_m_hitPointWorld();
            const nrm = cb.get_m_hitNormalWorld();
            return {
                x: point.x() * sf,
                y: point.y() * sf,
                z: point.z() * sf,
                isStable: nrm.y() > 0.5,
                hit: true,
            };
        });
        return this._phantomAusserhalb(result);
    }

    // DAS WERK STEHT NIE IM SPIELER (Gegenprüfung 08.10.: nah umhüllte das Phantom eines Baums die Kamera — der Blick nach
    // unten stellte die Eiche 0,4 m neben den Spieler —, und das Setzen stellt das Werk bit-treu an das Phantom, ohne Klemme):
    // der Ort des Phantoms geht durch die EINE Spieler-Klemme der Wurzel (`_structureSpawnPos`: Footprint + Rand nach außen,
    // kleine Werke bleiben, wo der Blick trifft) — mit der Reichweite der Gestalt, die gesetzt wird (`_phantomReichweite`).
    // Am geschobenen Ort steht es auf dem Boden des Gesetzes und trägt, wenn der Boden begehbar ist (Normale-Y > 0,5 wie
    // der Blick-Strahl).
    _phantomAusserhalb(ziel) {
        const bm = this.state.buildMode;
        const weg =
            bm && bm.blueprintName
                ? this._structureSpawnPos(bm.blueprintName, ziel, {
                      state: this.state,
                      reichweite: this._phantomReichweite(),
                  })
                : ziel;
        if (weg === ziel) return ziel;
        const h = (dx, dz) => this.getTerrainHeightAt(weg.x + dx, weg.z + dz);
        const gx = (h(1, 0) - h(-1, 0)) / 2;
        const gz = (h(0, 1) - h(0, -1)) / 2;
        return { x: weg.x, y: h(0, 0), z: weg.z, isStable: 1 / Math.sqrt(1 + gx * gx + gz * gz) > 0.5, hit: true };
    }

    // DIE REICHWEITE DES PHANTOMS (Integration V18.536, Auflage 4 der zweiten Werkstatt-Gegenprüfung): wie weit die Gestalt,
    // die gesetzt wird, waagrecht über ihren Ort reicht. Der Studio-Geist IST die Studio-Gestalt in Weltgröße (seine Teile
    // tragen die Welt-Skala ihrer Art, `_foundryWorldScaleMatrix`, in ihrer Matrix): je Geometrie EINMAL der weiteste
    // Vertex von der Hoch-Achse (WeakMap — Bauplan-Wechsel und Setzen fragen erneut), × die Skala des Teils, + sein
    // Versatz; am Phantom gemerkt. Der Spender-Geist (das Studio lädt noch, Foundry aus) misst die Spender-Teile
    // (`_blueprintFootprintRadius`). Befund: die Klemme maß die Spender-Teile der Eiche (3,01 m), die Krone der Studio-
    // Eiche hing über der Kamera.
    _phantomReichweite() {
        const bm = this.state.buildMode;
        const ph = bm && bm.phantomMesh;
        if (!ph || !bm.blueprintName) return 0;
        if (!ph.userData.studioGhost) return this._blueprintFootprintRadius(bm.blueprintName);
        if (Number.isFinite(ph.userData.reichweite)) return ph.userData.reichweite;
        const memo = this._geomReichweite || (this._geomReichweite = new WeakMap());
        let r = 0;
        for (const teil of ph.children) {
            const pos = teil.geometry && teil.geometry.attributes ? teil.geometry.attributes.position : null;
            if (!pos) continue;
            let rg = memo.get(teil.geometry);
            if (rg === undefined) {
                let q = 0;
                for (let i = 0; i < pos.count; i++) {
                    const x = pos.getX(i);
                    const z = pos.getZ(i);
                    if (x * x + z * z > q) q = x * x + z * z;
                }
                rg = Math.sqrt(q);
                memo.set(teil.geometry, rg);
            }
            const s = Math.max(Math.abs(teil.scale.x), Math.abs(teil.scale.z));
            r = Math.max(r, Math.hypot(teil.position.x, teil.position.z) + rg * s);
        }
        ph.userData.reichweite = r;
        return r;
    }

    // Tint 30 % grün (0x88ff88), wenn das Setzen trägt (stabiler Kontakt und `_setzUrteil`), sonst rot (0xff8888) — dort,
    // wo der Stoff seine Farbe liest: ein
    // Studio-Stoff (colorNode) über den EINEN Tönungs-Uniform (`_phantomTint`, im Geist-Stoff verdrahtet), ein Stoff ohne
    // colorNode (der Spender-Geist) über `material.color` — Original-Farbe EINMAL je Mesh cachen (sonst Drift).
    _applyPhantomTint(phantom, isStable) {
        if (!phantom) return;
        const targetColor = isStable ? 0x88ff88 : 0xff8888;
        if (this._phantomTintU) this._phantomTintU.value.set(targetColor);
        const tr = (targetColor >> 16) & 0xff;
        const tg = (targetColor >> 8) & 0xff;
        const tb = targetColor & 0xff;
        phantom.traverse((node) => {
            if (node.material && node.material.color && !node.material.colorNode) {
                if (node.userData._origColor === undefined) {
                    node.userData._origColor = node.material.color.getHex();
                }
                const orig = node.userData._origColor;
                const r = (((orig >> 16) & 0xff) * 0.7 + tr * 0.3) | 0;
                const g = (((orig >> 8) & 0xff) * 0.7 + tg * 0.3) | 0;
                const b = ((orig & 0xff) * 0.7 + tb * 0.3) | 0;
                node.material.color.setRGB(r / 255, g / 255, b / 255);
            }
        });
    }

    // === Maus-Aktionen (abbauen + platzieren) ===
    // LMB → tryMouseBreak: Architektur am Kamera-Raycast entfernen, sonst Loch ins Terrain
    // (modify_terrain -1 m, Radius 1.5 m). RMB → tryMousePlace: spawnArchitecture am Phantom.
    // pfad zieht Stamina (_aktionAusdauer), zu wenig → verweigert; frieden/schöpfer frei. Rebindbar.
    // Pick nur gegen sichtbare (in-range gecullte) Meshes — das ist die natürliche Reichweite.
    _pickArchitectureAtCrosshair() {
        if (!this.state.scene || !Array.isArray(this.state.architectures)) return null;
        const F = this._fadenkreuzStrahl();
        if (!F) return null;
        const meshes = [];
        const entryByMesh = new Map();
        for (const e of this.state.architectures) {
            if (!e || !e.mesh) continue;
            e.mesh.traverse((node) => {
                if (node.isMesh) {
                    meshes.push(node);
                    entryByMesh.set(node, e);
                }
            });
        }
        // Instanzierte Architekturen mit-raycasten: InstancedMesh-Treffer → g.slotEntry[instanceId].
        if (this.state.archInstanceGroups) {
            for (const g of this.state.archInstanceGroups.values()) {
                if (g.mesh && g.mesh.count > 0) meshes.push(g.mesh);
            }
        }
        if (!meshes.length) return null;
        if (!this._tmpRaycaster) this._tmpRaycaster = new THREE.Raycaster();
        this._tmpRaycaster.set(F.o, F.d);
        this._tmpRaycaster.far = 30;
        const intersects = this._tmpRaycaster.intersectObjects(meshes, false);
        // getroffen wird, was das Bild zeigt: Laub in der Nah-Kugel des Ich-Auges ist durchsichtig (`_durchsichtSteht`)
        const hit = intersects.find((h) => this._durchsichtSteht(h));
        if (!hit) return null;
        // Instanced-Treffer: instanceId → Eintrag via slotEntry (Streu trägt null).
        if (hit.object && hit.object.isInstancedMesh && typeof hit.instanceId === "number") {
            const key = hit.object.userData && hit.object.userData.archInstanceKey;
            const g = key && this.state.archInstanceGroups ? this.state.archInstanceGroups.get(key) : null;
            const entry = g ? g.slotEntry[hit.instanceId] : null;
            return entry ? { entry, point: hit.point } : null;
        }
        let node = hit.object;
        while (node && !entryByMesh.has(node)) node = node.parent;
        const entry = node ? entryByMesh.get(node) : null;
        return entry ? { entry, point: hit.point } : null;
    }

    // === harvestArchitecture — die Hylomorphismus-Wurzel ===
    // EINE Funktion für Spieler-LMB und Kreatur-gather: die Architektur zerfällt in ihre Materialien,
    // volumen-basiert je Part: units = max(1, round(size.x·size.y·size.z · HARVEST_VOLUME_TO_UNITS)).
    // Liefert die Material-Map ({holz: 3, laub: 1}) und entfernt den Eintrag (_cullArchitectureMesh);
    // der Aufrufer entscheidet wohin (Inventar bzw. creature.userData.carrying).
    harvestArchitecture(entry, harvester = "player", yieldMult = 1) {
        // Das GERITTENE Gefährt ist unerntbar — sonst erntet ein gather-Sammler den Wagen unter dem
        // Reiter weg (Auto-Dismount aus dem Nichts).
        if (entry && this.state.player && entry.id === this.state.player.mountedArch) {
            return null;
        }
        if (!entry) return null;
        const bp = this.state.blueprints && this.state.blueprints[entry.type];
        const materials = {};
        let totalParts = 0;
        // Ω5 (taille-spec §5) — die HERKUNFT entscheidet den Ertrag: ein
        // freeBorn-Werk (schöpfer baute gratis) erntet zu 0 — das Perpetuum-
        // Verbot als lebende Regel (die GEMESSENE Modus-Wäsche schließt).
        const freeBorn = entry.freeBorn === true;
        if (bp && Array.isArray(bp.parts) && !freeBorn) {
            const k = AnazhRealm.HARVEST_VOLUME_TO_UNITS;
            const volByMat = {};
            for (const part of bp.parts) {
                if (!part || typeof part.material !== "string") continue;
                const sx = Math.abs((part.size && part.size.x) || 1);
                const sy = Math.abs((part.size && part.size.y) || 1);
                const sz = Math.abs((part.size && part.size.z) || 1);
                const volume = sx * sy * sz;
                // Ertrag skaliert mit der Tauglichkeit (yieldMult, Floor in _harvestFitness): richtiges Werkzeug voll,
                // falsches wenig/nichts. yieldMult=1 (Kreatur-gather/Welt-Tod) = min 1 Einheit/Part.
                const units = Math.max(yieldMult >= 0.999 ? 1 : 0, Math.round(volume * k * yieldMult));
                materials[part.material] = (materials[part.material] || 0) + units;
                volByMat[part.material] = (volByMat[part.material] || 0) + volume;
                totalParts++;
            }
            // ERTRAGS-SOCKEL: bei yieldMult > 0 gibt jedes vorhandene Material mindestens 1 Einheit — sonst
            // rundet jedes dünne Grammatik-Segment (~0.01 m³) auf 0 und die Faust fällt die Eiche ohne Holz.
            // Greift nur, wo alles auf 0 rundet (kein Voll-Ertrags-Drift).
            if (yieldMult > 0) {
                for (const mat in volByMat) {
                    if (volByMat[mat] > 0 && !(materials[mat] > 0)) materials[mat] = 1;
                }
            }
        }
        const blueprintName = entry.type;
        const removed = this.removeArchitecture(entry);
        if (!removed) return null;
        // DIE TAT BLEIBT (feld.K4): ein gefällter Baum ist eine Tat der Welt am Ort — Narbe im Feld, Stumpf in der Nah-Streu, und
        // der Wald pflanzt ihn nicht neu, bis sie heilt (`_tatSchreiben`); von Spieler-Hand gewertet wie jede Tat (`_handTat`)
        const p = entry.position;
        if (/baum/.test(entry._lodSpecies || blueprintName) && this._istNatur(entry)) {
            const faellen = () =>
                this._tatSchreiben("faellen", p.x, p.z, {
                    s: Number.isFinite(entry.scale) ? +entry.scale.toFixed(2) : 1,
                });
            if (harvester === "player") this._handTat("faellen", p, faellen);
            else faellen();
        }
        // ein anderer Wurf des Gesetzes (Fels, Busch, Glut, Bau eines Orts) bleibt abgebaut: der Boot wirft ihn neu, die Tat
        // sperrt ihn (`_tatSperrt`, speicher.K3)
        else if (entry._ausGesetz) this._tatSchreiben("abbauen", p.x, p.z);
        // Nur der Spieler fühlt die Ernte (joy + hope, skaliert mit dem Ertrag); Kreaturen nicht.
        if (harvester === "player") {
            const mag =
                bp && Array.isArray(bp.parts) ? this._substanceMagnitude(bp) * (0.4 + 0.6 * yieldMult) : undefined;
            const harvestOpts = { blueprint: blueprintName };
            if (mag !== undefined) harvestOpts.magnitude = mag;
            this._feelAction("harvest", harvestOpts);
        }
        // Bäume sind von Anfang an echte, fällbare Welt-Dinge; beim Ernten eines _isGrown-Bauplans ergänzt
        // das Journal die Welt-Genese-Herkunft („Birke, gewachsen aus Welt-Seed (Region 5,-2)“).
        // Materialien tragen keine Provenienz (tag-getrieben) — das Tagebuch ist ihr Ort.
        let grownProvenance = null;
        if (bp && bp._isGrown && bp._grownSpecies) {
            grownProvenance = {
                bornFrom: "world-genesis",
                species: bp._grownSpecies,
                seed: bp._grownSeed || null,
            };
        }
        if (typeof this.journalAppend === "function" && totalParts > 0) {
            const matSummary = Object.entries(materials)
                .map(([m, n]) => `${n}× ${m}`)
                .join(", ");
            const journalDetails = {
                blueprint: blueprintName,
                materials,
                harvester,
            };
            // V18.212 — Ω-H: die Welt-Genese-Spur wandert in den Journal-
            // Eintrag. „aus Welt-Genese bei (Region X, Y)" lesbar.
            let werk = blueprintName;
            if (grownProvenance) {
                journalDetails.provenance = grownProvenance;
                werk = String(grownProvenance.species || "")
                    .replace(/^baum_/, "")
                    .replace(/^./, (c) => c.toUpperCase());
            }
            this.journalAppend(
                "growth",
                grownProvenance
                    ? AnazhRealm._datum`${harvester} erntete „${werk}" (aus Welt-Genese gewachsen) → ${matSummary}.`
                    : AnazhRealm._datum`${harvester} erntete „${werk}" → ${matSummary}.`,
                journalDetails
            );
        }
        const result = { materials, blueprint: blueprintName, parts: totalParts };
        if (grownProvenance) result.provenance = grownProvenance;
        return result;
    }

    // `still`: der Abbau ohne Stimme (das Verblassen am Horizont, `_evictArchitecture`) — kein Ping, kein Journal; alles, was
    // die Welt für den Bau hält, fällt gleich.
    removeArchitecture(entry, { still = false } = {}) {
        if (!entry) return false;
        const idx = this.state.architectures.indexOf(entry);
        if (idx < 0) return false;
        // der Grundriss eines Baus fällt mit ihm — am Ort (`_grundrissFaellt`)
        const fp = this._grundrissVon(entry);
        if (fp) {
            const p = entry.position;
            const r = fp.lichtung || Math.hypot(fp.ex, fp.ez) + Math.hypot(fp.ox, fp.oz) + 2;
            this._grundrissFaellt(p.x - r, p.z - r, p.x + r, p.z + r);
        }
        this._erdbauGrundFaellt(entry); // und sein Grund (S4): der Boden schließt sich, der Keller füllt sich
        this._archZiegelTod(entry); // die Ziegel-Fernstufe stirbt mit dem Eintrag
        // Blocker-Index beim Remove pflegen (früher Out ohne solide Parts via entry.blockerAABBs); vorher
        // merken, ob es ein Blocker war — danach dirty markieren (das Wasser bekommt den Pfad zurück).
        // Eine Pflanze stempelte nie (`_stempelSpanne`): ihr Abbau gibt keiner Zelle etwas zurück.
        const wasBlocker = !!entry.blockerAABBs && entry.blockerAABBs.some((a) => !a.stempelfrei);
        // Footprint-bboxes VOR dem Index-Remove einfrieren (danach sind sie weg); Voxel-Chunks im Footprint
        // werden dirty → das Cell-Feld baut ohne Architektur-Stempel, Wasser-Cells nehmen den Platz zurück.
        const blockerFootprints = wasBlocker
            ? entry.blockerAABBs
                  .filter((a) => !a.stempelfrei)
                  .map((a) => ({
                      cx: (a.minX + a.maxX) * 0.5,
                      cz: (a.minZ + a.maxZ) * 0.5,
                      r: Math.max(a.maxX - a.minX, a.maxZ - a.minZ) * 0.5,
                  }))
            : null;
        // Ein Damm ist nur, wessen Stempel eine WASSER-Zelle überschrieb (`entry._stempelNass`, gesetzt vom Zell-Stempel, wann
        // immer ein Chunk mit ihm entstand — derselbe Ort und dieselben Zellen, die der Automat rechnet; stand nie ein Chunk
        // unter ihm, gibt es kein gestautes Wasser zu wecken) — der Abbau eines Baums oder Hauses am Ufer weckt ihn nicht.
        const damm = wasBlocker && entry._stempelNass === true;
        // Ohne Hydro-Recompute: betroffene Voxel-Chunks remeshen (der Eintrag ist schon aus
        // state.architectures raus), Wasser-Cells nehmen den Platz zurück.
        entry.blockerAABBs = null;
        if (wasBlocker) {
            for (const fp of blockerFootprints) {
                // V9.86 Perf-2 ext. — `skirt=0` analog zu spawnArchitecture:
                // beim Remove läuft die identische Cell-Stempel-Logik, kein
                // Density-Effekt → keine Skirt-Nachbarn-Naht.
                this._remeshVoxelChunksAround(fp.cx, fp.cz, fp.r, 0);
            }
            // V9.75 — Spiegel zum Spawn-Trigger: das Wasser kehrt zurück (klingt nur, wo Wasser ist).
            if (!still) this._playWaterReactionPing(blockerFootprints);
            // Ein abgebauter DAMM lässt seinen Stausee ablaufen: Kappen/Stau-Felder verwerfen + CA wecken
            // (Gravitation ist kappen-frei; die Empfänger-Kappe sinkt lazy zurück).
            if (damm) for (const fp of blockerFootprints) this._invalidateWaterCapsAround(fp.cx, fp.cz, fp.r);
        }
        // Resonierende Strukturen verstummen beim Abbau mit abklingendem Sinus; stumme bleiben still.
        if (!still) this._playArchitectureFarewellPing(entry);
        this._cullArchitectureMesh(entry);
        this._trittFlaecheLoesen(entry);
        this.state.architectures.splice(idx, 1);
        this._blockerAustritt(entry);
        this._cullWecken(entry, "weg");
        this._weltRegt(); // die Bau-Menge regt sich: die Stand-Wache weckt die Fege-Takte
        if (this._fahrLos) this._fahrLos.delete(entry); // ein abgebauter Wagen fällt nicht weiter (`_fahrNachlauf`)
        this._kronenStreuWeg("a:" + entry.id); // ein gefällter Baum nimmt seine Krone aus der Karte
        this._werkGesetzAus(entry); // ein Werk im Takt des Gesetzes (Sturz, Rollen, Schale) verlässt ihn
        if (!still && typeof this.journalAppend === "function") {
            this.journalAppend("loss", AnazhRealm._datum`Eine ${entry.type}-Struktur wurde abgebaut.`, {
                type: entry.type,
                id: entry.id,
            });
        }
        // DER ABBAU SPEICHERT GEBÜNDELT (K69): der Eintrag ist sofort aus `state.architectures` (kein Verlust im Spiel), die
        // schwere Persistenz (Snapshot mit der Höhe über Grund JEDES Baus, JSON, Platte) bündelt der EINE Edit-Save. Bis K69
        // speicherte jeder Abbau die ganze Welt synchron: räumt ein Dorf beim Nähern seinen Grund (`_naturRaeumen`, die Flächen
        // seiner Wege und Häuser), lagen 82 volle Saves in wenigen Frames (Null-Renderer, Dorfweg gehend); je Save 40 ms
        // (gate:stand-takt Phase O, Mess-Wiese: 5 Abbauten Σ 200 ms).
        if (typeof this._scheduleEditSave === "function") this._scheduleEditSave();
        return true;
    }

    // Wasser strömt zurück (Abbau) oder um den Damm (Bau) — nur wo Wasser IST: liegt ein Punkt eines Fußabdrucks
    // ({cx, cz, r}: Mitte und Rand in vier Richtungen) im Wasser (`_nassAt`), antwortet ein Chor aus MINNAERT-Blasen auf
    // Oszillatoren (klang:SUBSTANZ.wasser, die Blasen wachsen über das Ereignis). Ein Stein auf trockenem Land bleibt
    // stumm — bis 06.10. hauchte jeder Bau und Abbau eines Blockers Wasser, auch fern jedes Ufers. Stumm ohne Symphonie.
    _playWaterReactionPing(fussabdruecke) {
        const R = [
            [0, 0],
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
        ];
        const nass = (fussabdruecke || []).some((f) =>
            R.some(([ux, uz]) => this._nassAt(f.cx + ux * f.r, f.cz + uz * f.r))
        );
        if (nass) this._substanzKlang("wasser", null);
    }

    // Eine resonierende Form verklingt beim Abbau (klang:SUBSTANZ.abschied — Tonhöhe aus der Resonanz, Glissando nach
    // unten). Schwelle resonance_mild, damit auch leise singende Strukturen einen Abschied bekommen; stumme bleiben still.
    _playArchitectureFarewellPing(entry) {
        if (!entry || !entry.type || !this.state.symphony.enabled) return;
        const bp = this.state.blueprints && this.state.blueprints[entry.type];
        if (!bp) return;
        const tags = this.computeCompoundTags(bp);
        const resonance = (tags && tags.resoniert) || 0;
        if (resonance < AnazhRealm.WORLD_EFFECT_THRESHOLDS.resonance_mild) return;
        this._substanzKlang("abschied", tags);
    }

    // Pfad analog _resolvePhantomTarget, aber ohne Phantom-Logik. Liefert den ersten Treffer auf dem Strahl des
    // Fadenkreuzes (`_fadenkreuzStrahl`) — für tryMouseBreak, wenn keine Architektur getroffen wurde (Terrain-Loch-Pfad),
    // Graben, Aufschütten und das Blick-Ziel des Pfeils.
    _raycastWorldHit(maxDist = 30) {
        const sf = this.state.scaleFactor || 1;
        const fallback = { hit: false, x: 0, y: 0, z: 0 };
        // P3 — feld-nativer Raycast (`_runRaycast` → `_fieldRaycast`); nur die Kamera nötig.
        const F = this._fadenkreuzStrahl();
        if (!F) return fallback;
        const o = F.o;
        const d = F.d;
        const rayStart = this.setVec(this.state.tmpVec1, o.x / sf, o.y / sf, o.z / sf);
        const rayEnd = this.setVec(
            this.state.tmpVec2,
            (o.x + d.x * maxDist) / sf,
            (o.y + d.y * maxDist) / sf,
            (o.z + d.z * maxDist) / sf
        );
        return this._runRaycast(rayStart, rayEnd, (cb, hit) => {
            if (!hit) return fallback;
            const p = cb.get_m_hitPointWorld();
            return { hit: true, x: p.x() * sf, y: p.y() * sf, z: p.z() * sf };
        });
    }

    // ZENSUS 17.07. — die Ausdauer-Kosten der Maus-Arm-Aktion wohnen im
    // koerperstudio-Gesetzbuch (fx.bewegung.aktionAusdauer, _aktionAusdauer
    // fail-closed: Kern-Pflicht, der Konstanten-Zwilling ist gefallen).
    _mouseActionStaminaGate() {
        const mode = typeof this.getGameMode === "function" ? this.getGameMode() : "frieden";
        if (mode !== "pfad") return { ok: true, mode };
        const cost = this._mausAusdauer();
        const have = (this.state.player && this.state.player.stamina) || 0;
        // die Zahlen der Absage gehen an den Spieler (eine Nachkommastelle), das Urteil fällt auf den genauen Werten
        return have >= cost
            ? { ok: true, mode, cost }
            : { ok: false, mode, cost: +cost.toFixed(1), have: +have.toFixed(1) };
    }

    _consumeMouseStamina() {
        const mode = typeof this.getGameMode === "function" ? this.getGameMode() : "frieden";
        if (mode !== "pfad") return;
        const cost = this._mausAusdauer();
        const have = (this.state.player && this.state.player.stamina) || 0;
        this.state.player.stamina = Math.max(0, have - cost);
    }

    // DIE AUSDAUER EINER MAUS-ARM-AKTION (Welle LF 09.10., Posten 8 / K-L2): der Arm bewegt sich samt Gerät — die Kosten des
    // Gesetzbuchs (koerper fx.bewegung.aktionAusdauer: die leere Hand) wachsen mit der geschwungenen Masse,
    // (m_Arm + m_Gerät) / m_Arm; m_Arm = koerper LEIB.armAnteil × die EINE Leib-Masse des Spielers (_leibMasse), m_Gerät = die
    // Masse des Geräts (`_geraetMasze`: die Messung der Schmiede, ein Eigenwerk seine Gestalt × ρ der Stoff-Zeile in der
    // wahren Größe der Hand — physik K1; vorher zehrte ein Eigenwerk wie die leere Hand). Vorher 5 je Hieb für Dolch und
    // Vorschlaghammer gleich (Leben-Schau 07.10.).
    _mausAusdauer() {
        const basis = AnazhRealm._aktionAusdauer();
        const km = this._geraetMasze(this._heldImplementBlueprint());
        const mG = km && km.masseKg > 0 ? km.masseKg : 0;
        if (!mG) return basis;
        const anteil = AnazhRealm.Gesetz("koerper:LEIB.armAnteil", null);
        if (!(anteil > 0)) return AnazhRealm._kernPflichtBruch("koerper:LEIB.armAnteil");
        const mArm = anteil * this._leibMasse(this.state.playerMesh);
        return (basis * (mArm + mG)) / mArm;
    }

    // === Welle 6.C3 — Keybindings (Datenmodell + Persistenz) ===
    // Zwei Schichten derselben Aktionen: die Tastatur und Maus (`state.keybindings`, "anazh.keybindings") und das Gamepad
    // (`state.padBelegung`, "anazh.padbelegung", Codes „Pad<n>" — auch für eine DSL-Fähigkeit, leib.K5).
    _loadKeybindings(pad) {
        const defaults = { ...(pad ? AnazhRealm.PAD_BELEGUNG : AnazhRealm.DEFAULT_KEYBINDINGS) };
        if (typeof localStorage === "undefined") return defaults;
        try {
            const raw = localStorage.getItem(pad ? "anazh.padbelegung" : "anazh.keybindings");
            if (!raw) return defaults;
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== "object") return defaults;
            for (const action of pad ? Object.keys(parsed) : AnazhRealm.KEYBINDING_ACTIONS) {
                if (
                    typeof parsed[action] === "string" &&
                    parsed[action].length > 0 &&
                    (!pad || /^Pad\d+$/.test(parsed[action]))
                ) {
                    defaults[action] = parsed[action];
                }
            }
        } catch {
            /* corrupt JSON → defaults */
        }
        return defaults;
    }

    _saveKeybindings() {
        if (typeof localStorage === "undefined" || !this.state.keybindings) return;
        try {
            localStorage.setItem("anazh.keybindings", JSON.stringify(this.state.keybindings));
            localStorage.setItem("anazh.padbelegung", JSON.stringify(this.state.padBelegung));
        } catch {
            /* quota / private-mode */
        }
    }

    setKeybinding(action, code) {
        if (typeof code !== "string" || code.length === 0) return false;
        const pad = /^Pad\d+$/.test(code);
        const B = pad ? this.state.padBelegung : this.state.keybindings;
        // das Pad bindet JEDE Aktion (auch Gespräch und Schubladen, ohne Standard-Knopf) und jede DSL-Fähigkeit
        const frei =
            pad && (AnazhRealm.KEYBINDING_ACTIONS.includes(action) || Object.hasOwn(this.state.abilities, action));
        if (!action || !B || !(action in B || frei)) return false;
        // Konflikt-Schutz per Swap: belegt der Code schon eine andere Aktion, bekommt diese das alte
        // Binding — keine toten Bindings, keine unbelegten Aktionen (eine Fähigkeit ohne altes Binding fällt).
        const oldCode = B[action];
        for (const k of Object.keys(B)) {
            if (k !== action && B[k] === code) {
                if (oldCode) B[k] = oldCode;
                else delete B[k];
            }
        }
        B[action] = code;
        this._saveKeybindings();
        if (typeof this._renderKeybindingsUI === "function") this._renderKeybindingsUI();
        if (typeof this._updateBuildModeHud === "function") this._updateBuildModeHud();
        return true;
    }

    resetKeybindings() {
        this.state.keybindings = { ...AnazhRealm.DEFAULT_KEYBINDINGS };
        this.state.padBelegung = { ...AnazhRealm.PAD_BELEGUNG };
        this._saveKeybindings();
        if (typeof this._renderKeybindingsUI === "function") this._renderKeybindingsUI();
        if (typeof this._updateBuildModeHud === "function") this._updateBuildModeHud();
        return true;
    }

    _eventToBindingCode(event) {
        if (!event) return null;
        // MouseEvent: button 0=LMB, 1=Middle, 2=RMB.
        if (event.type === "mousedown" || event.type === "mouseup" || event.type === "click") {
            if (typeof event.button === "number") return "Mouse" + event.button;
            return null;
        }
        // KeyboardEvent: event.code ist Layout-unabhängig (Empfohlen ggü.
        // event.key, das z. B. „F" auf F-Taste aber „f" auf deutscher
        // Tastatur liefert; event.code ist immer „KeyF").
        if (typeof event.code === "string" && event.code.length > 0) return event.code;
        return null;
    }

    _actionForBindingCode(code) {
        if (!code || !this.state.keybindings) return null;
        for (const action of AnazhRealm.KEYBINDING_ACTIONS) {
            if (this.state.keybindings[action] === code) return action;
        }
        return null;
    }

    beginKeybindRebind(action) {
        const aktionen = [...AnazhRealm.KEYBINDING_ACTIONS, ...Object.keys(AnazhRealm.PAD_BELEGUNG)];
        if (!action || !this.state.keybindings || !aktionen.includes(action)) return false;
        this.state.keybindRebind = { action, startedAt: performance.now() };
        if (typeof this._renderKeybindingsUI === "function") this._renderKeybindingsUI();
        return true;
    }

    _completeKeybindRebind(code) {
        const rb = this.state.keybindRebind;
        if (!rb || !rb.action) return false;
        this.state.keybindRebind = null;
        if (code === "Escape") {
            if (typeof this._renderKeybindingsUI === "function") this._renderKeybindingsUI();
            return false;
        }
        return this.setKeybinding(rb.action, code);
    }

    cancelKeybindRebind() {
        this.state.keybindRebind = null;
        if (typeof this._renderKeybindingsUI === "function") this._renderKeybindingsUI();
    }

    _updateBuildModeHud() {
        if (typeof document === "undefined") return;
        const hud = document.getElementById("build-mode-hud");
        if (!hud) return;
        const bm = this.state.buildMode;
        if (bm.active && bm.blueprintName) {
            const bp = this.state.blueprints[bm.blueprintName];
            // das Label wird Text, nie Markup (die Zeile ist innerHTML; ein Bauplan kann aus fremder Hand stammen — Welt-Import)
            const label = String(bp && bp.label ? bp.label : bm.blueprintName).replace(
                /[<>&"]/g,
                (c) => `&#${c.charCodeAt(0)};`
            );
            // HUD spiegelt die aktuellen Keybindings („B bauen“ statt „RMB bauen“);
            // Fallback DEFAULT_KEYBINDINGS, falls state.keybindings noch fehlt.
            const kb = this.state.keybindings || AnazhRealm.DEFAULT_KEYBINDINGS;
            const fmt = (code) => this._formatBindingCode(code);
            // Material-Kosten + Verfügbarkeit in pfad UND frieden (beide zahlen); schöpfer baut frei, ohne
            // Zahlen. Fehlendes rot getintet, Ausreichendes brass-warm.
            const mode = typeof this.getGameMode === "function" ? this.getGameMode() : "frieden";
            let costLine = "";
            if ((mode === "pfad" || mode === "frieden") && typeof this.checkBuildCost === "function") {
                const check = this.checkBuildCost(bm.blueprintName);
                const parts = Object.entries(check.cost).map(([m, n]) => {
                    const have = check.have[m] || 0;
                    const ok = have >= n;
                    const color = ok ? "#d4a373" : "#e57b6c";
                    return `<span style="color:${color}">${n}× ${m} (${have})</span>`;
                });
                if (parts.length > 0) {
                    costLine = ` · ${parts.join(", ")}`;
                }
            } else if (mode === "schöpfer") {
                costLine = ` · <span style="color:#a8c8ff">Schöpfer: frei</span>`;
            }
            // Das Urteil am Phantom (`tickBuildMode` → `_setzUrteil`): der Grund, warum das Setzen hier ablehnt (die Natur-
            // Wand, die fehlende Werkstatt, der Standort; fehlendes Material steht rot in der Kosten-Zeile).
            const rotLine = (t) => ` · <span style="color:#e57b6c">${t}</span>`;
            const grund = bm.phantomGrund || "";
            const wandLine = bm.phantomWand
                ? rotLine(`${AnazhRealm.NATUR_WAND_GRUND[bm.phantomWand]} — weiter weg setzen`)
                : grund.startsWith("werkstatt:")
                  ? rotLine(`du brauchst eine Werkstatt der Domäne „${grund.slice(10)}" in der Nähe`)
                  : grund === "standort"
                    ? rotLine("der Standort trägt nicht — ziel auf ebenen Boden")
                    : "";
            hud.innerHTML =
                `Bau: ${label} — ${fmt(kb.confirmBuild)}/${fmt(kb.place)} bauen, ` +
                `${fmt(kb.cancelBuild)} verlassen, 1-9 Slot, ${fmt(kb.break)} abbauen${costLine}${wandLine}`;
            hud.hidden = false;
        } else {
            hud.hidden = true;
            hud.textContent = "";
        }
    }

    // Alias damit Aufrufer beide Namen nutzen können (interne Konsistenz —
    // setGameMode/setKeybinding rufen _updateBuildModeHud, confirmBuild ruft
    // _renderBuildModeHud; beide zeigen auf denselben Render-Pfad).
    _renderBuildModeHud() {
        this._updateBuildModeHud();
    }

    // Hotbar-DOM neu rendern: 9 Slots mit Label + Slot-Nummer. Wird beim
    // Init aufgerufen und nach jeder setHotbarSlot-Mutation.
    _renderHotbarDOM() {
        if (typeof document === "undefined") return;
        const bar = document.getElementById("hotbar");
        if (bar) this._renderHotbarInto(bar);
        this._updateHotbarHighlight();
        this._renderHotbarConfigDOM();
    }

    // V18.59 — EINE Hotbar-Render-Quelle (verdichte V9.82), zwei Mounts: der HUD `#hotbar` + die VISUELLE
    // Hotbar im Ich-Overlay (`#hotbar-config`, früher clunky Dropdowns). Beide tragen dieselben `.hotbar-slot`s
    // mit dem Klick-Fluss (Item gewählt → Slot zuweisen, sonst Bau-Modus) + Drag&Drop.
    _renderHotbarInto(bar) {
        bar.innerHTML = "";
        // V18.109 — E8: der OFF-HAND-Slot NEBEN der Hotbar (Minecraft-Modell).
        // Zeigt equipped.offhand, Klick = Hand-Tausch (derselbe Akt wie Key G).
        {
            const eq = this.state.player && this.state.player.equipped;
            const offName = eq && eq.offhand;
            const slot = document.createElement("button");
            slot.type = "button";
            slot.className = "hotbar-slot hotbar-offhand";
            slot.setAttribute("data-slot", "offhand");
            const num = document.createElement("span");
            num.className = "num";
            num.textContent = this._formatBindingCode
                ? this._formatBindingCode(
                      (this.state.keybindings || AnazhRealm.DEFAULT_KEYBINDINGS).swapHands || "KeyG"
                  )
                : "G";
            const label = document.createElement("span");
            label.className = "label";
            if (offName && this.state.blueprints[offName]) {
                label.textContent = this.state.blueprints[offName].label || offName;
                slot.classList.add("filled");
                slot.title = "Off-Hand — tauschen (G)";
            } else {
                label.textContent = "—";
                slot.title = "Off-Hand leer — G tauscht die Hände";
            }
            slot.appendChild(num);
            slot.appendChild(label);
            slot.addEventListener("click", () => this.swapHands());
            bar.appendChild(slot);
        }
        for (let i = 0; i < 9; i++) {
            const name = this.state.hotbar[i];
            const slot = document.createElement("button");
            slot.type = "button";
            slot.className = "hotbar-slot";
            slot.setAttribute("data-slot", String(i));
            const num = document.createElement("span");
            num.className = "num";
            num.textContent = String(i + 1);
            const label = document.createElement("span");
            label.className = "label";
            if (name && this.state.blueprints[name]) {
                const bp = this.state.blueprints[name];
                label.textContent = bp.label || name;
                slot.classList.add("filled");
                slot.title = this._blueprintCostTooltip(name);
            } else {
                label.textContent = "—";
            }
            slot.appendChild(num);
            slot.appendChild(label);
            slot.addEventListener("click", () => {
                if (this.state.inventorySelected) {
                    this.tryAssignFromInventoryToHotbar(i);
                } else {
                    this.selectHotbarSlot(i);
                }
            });
            slot.draggable = !!name;
            slot.addEventListener("dragstart", (ev) => this._onSlotDragStart(ev, "hot", i));
            slot.addEventListener("dragend", (ev) => this._onSlotDragEnd(ev));
            slot.addEventListener("dragover", (ev) => this._onSlotDragOver(ev));
            slot.addEventListener("dragleave", (ev) => this._onSlotDragLeave(ev));
            slot.addEventListener("drop", (ev) => this._onSlotDrop(ev, "hot", i));
            bar.appendChild(slot);
        }
    }

    // === Inventar-Overlay Render + UI-Wiring ===
    // Tag-Resonanz aus computeCompoundTags(bp): je Slot CSS-Klasse `tag-<axis>` ab Tag-Wert > 0.5
    // (dichte > 0.7), Klassen stacken. Hover spielt einen Audio-Ping mit dem dominanten Tag.
    renderInventoryUI() {
        if (typeof document === "undefined") return;
        const grid = document.getElementById("inventory-grid");
        if (!grid) return;
        grid.innerHTML = "";
        const inv = (this.state.player && this.state.player.inventory) || [];
        const selectedName = this.state.inventorySelected;
        for (let i = 0; i < inv.length; i++) {
            const slot = inv[i];
            const el = document.createElement("button");
            el.type = "button";
            el.className = "inventory-slot";
            el.setAttribute("data-inv-slot", String(i));
            if (!slot) {
                el.classList.add("empty");
                el.setAttribute("aria-label", `Slot ${i + 1} leer`);
                // Leerer Inventar-Slot: nicht draggable, aber Drop-Target
                // (anderer Bauplan kann hier abgelegt werden).
                el.addEventListener("dragover", (ev) => this._onSlotDragOver(ev));
                el.addEventListener("dragleave", (ev) => this._onSlotDragLeave(ev));
                el.addEventListener("drop", (ev) => this._onSlotDrop(ev, "inv", i));
                grid.appendChild(el);
                continue;
            }
            // Welle 6.H P2B.5 — Material-Slot vs. Bauplan-Slot.
            // Material-Slot zeigt Material-Name + Count, mit Material-Farbe als
            // Hintergrund-Tint und Tag-Klassen aus state.materials[name].tags.
            const isMaterialSlot = slot.kind === "material" && typeof slot.material === "string";
            const matDef = isMaterialSlot && this.state.materials && this.state.materials[slot.material];
            const bp = !isMaterialSlot && this.state.blueprints && this.state.blueprints[slot.blueprintName];
            // Fixes Glyphen-Symbol je Grundmaterial (Slot-Art auf einen Blick); Bauplan-Slots bleiben Text —
            // emergente Compounds haben kein fixes Symbol.
            const MATERIAL_GLYPHS = {
                stein: "◼",
                holz: "║",
                eisen: "◆",
                bronze: "◈",
                quarz: "❖",
                leder: "◗",
                knochen: "⌘",
                fleisch: "⬣",
                federn: "✷",
                schuppen: "⬢",
                glut: "✺",
                laub: "❀",
                kraut: "✿",
                essenz: "✧",
            };
            if (isMaterialSlot) {
                const glyph = document.createElement("span");
                glyph.className = "slot-glyph";
                glyph.setAttribute("aria-hidden", "true");
                glyph.textContent = MATERIAL_GLYPHS[slot.material] || "◌";
                if (matDef && Number.isFinite(matDef.color)) {
                    const hex = matDef.color;
                    const r = (hex >> 16) & 0xff;
                    const g = (hex >> 8) & 0xff;
                    const b = hex & 0xff;
                    glyph.style.color = `rgb(${Math.min(255, r + 60)},${Math.min(255, g + 60)},${Math.min(255, b + 60)})`;
                }
                el.appendChild(glyph);
            }
            const label = document.createElement("span");
            label.className = "slot-label";
            if (isMaterialSlot) {
                label.textContent = matDef && matDef.label ? matDef.label : slot.material;
                el.classList.add("material-slot");
                if (matDef && Number.isFinite(matDef.color)) {
                    // Material-Farbe als sanfter Hintergrund-Tint.
                    const hex = matDef.color;
                    const r = (hex >> 16) & 0xff;
                    const g = (hex >> 8) & 0xff;
                    const b = hex & 0xff;
                    el.style.boxShadow = `inset 0 0 14px rgba(${r},${g},${b},0.35)`;
                }
            } else {
                label.textContent = bp ? bp.label || slot.blueprintName : slot.blueprintName;
            }
            el.appendChild(label);
            if (slot.count > 1) {
                const count = document.createElement("span");
                count.className = "slot-count";
                count.textContent = String(slot.count);
                el.appendChild(count);
            }
            // Tag-Magic: dominante Achsen als CSS-Klasse + ARIA-Label.
            // Material-Slot nutzt material.tags direkt; Bauplan-Slot rechnet
            // computeCompoundTags aus den Parts.
            if (isMaterialSlot && matDef && matDef.tags) {
                const t = matDef.tags;
                if ((t.resoniert || 0) >= 0.5) el.classList.add("tag-resoniert");
                if ((t.brennbar || 0) >= 0.5) el.classList.add("tag-brennend");
                if ((t.magieleitung || 0) >= 0.5) el.classList.add("tag-magieleitung");
                if ((t.lebendig || 0) >= 0.5) el.classList.add("tag-lebendig");
                if ((t.dichte || 0) >= 0.7) el.classList.add("tag-dichte");
                el.setAttribute(
                    "aria-label",
                    `${label.textContent}${slot.count > 1 ? ` ×${slot.count}` : ""} (Rohmaterial)`
                );
                el.addEventListener("mouseenter", () => {
                    this.playInventoryHoverPing(t);
                });
            } else if (bp && typeof this.computeCompoundTags === "function") {
                const tags = this.computeCompoundTags(bp) || {};
                const activeTags = [];
                if ((tags.resoniert || 0) >= 0.5) {
                    el.classList.add("tag-resoniert");
                    activeTags.push("resoniert");
                }
                if ((tags.brennbar || 0) >= 0.5) {
                    el.classList.add("tag-brennend");
                    activeTags.push("brennbar");
                }
                if ((tags.magieleitung || 0) >= 0.5) {
                    el.classList.add("tag-magieleitung");
                    activeTags.push("magieleitung");
                }
                if ((tags.lebendig || 0) >= 0.5) {
                    el.classList.add("tag-lebendig");
                    activeTags.push("lebendig");
                }
                if ((tags.dichte || 0) >= 0.7) {
                    el.classList.add("tag-dichte");
                    activeTags.push("dichte");
                }
                el.setAttribute(
                    "aria-label",
                    `${label.textContent}${slot.count > 1 ? ` ×${slot.count}` : ""}${activeTags.length ? ` (Tags: ${activeTags.join(", ")})` : ""}`
                );
                // Audio-Ping bei Hover wenn signifikante Tag-Resonanz.
                el.addEventListener("mouseenter", () => {
                    this.playInventoryHoverPing(tags);
                });
            } else {
                el.setAttribute("aria-label", `${label.textContent}${slot.count > 1 ? ` ×${slot.count}` : ""}`);
            }
            // V8.38 — Bauplan-Slot: Material-Bedarf als Hover-Tooltip, damit
            // der Schöpfer direkt sieht, ob er die Materialien im Inventar hat.
            if (bp) el.title = this._blueprintCostTooltip(slot.blueprintName);
            if (selectedName && slot.blueprintName === selectedName) {
                el.classList.add("selected");
            }
            // V18.65 — der Such-Heuhaufen für die EINE Selbst-Suche (#ich-search dimmt Nicht-Treffer-Slots):
            // Name + Material/Bauplan-Name + emergente Rolle → „stein"/„panzer"/„bauwerk" surft die Habe.
            {
                let hay = label.textContent || "";
                if (isMaterialSlot) hay += " " + (slot.material || "") + " rohmaterial";
                // M4 (V18.158) — der EINE Blueprint-Heuhaufen (vorher die ROHE role-id:
                // „bauwerk" traf architecture NIE; jetzt Rolle deutsch + Material + Tags).
                else if (bp) hay += " " + this._blueprintSearchText(bp);
                el.setAttribute("data-search", hay.toLowerCase());
            }
            el.addEventListener("click", () => this.selectInventorySlot(i));
            // Drag-Source: gefüllter Inventar-Slot kann gegriffen werden.
            el.draggable = true;
            el.addEventListener("dragstart", (ev) => this._onSlotDragStart(ev, "inv", i));
            el.addEventListener("dragend", (ev) => this._onSlotDragEnd(ev));
            // Drop-Target: jeder Inventar-Slot (auch leerer) kann Quelle aufnehmen.
            el.addEventListener("dragover", (ev) => this._onSlotDragOver(ev));
            el.addEventListener("dragleave", (ev) => this._onSlotDragLeave(ev));
            el.addEventListener("drop", (ev) => this._onSlotDrop(ev, "inv", i));
            grid.appendChild(el);
        }
        // Selected-Anzeige unten
        const sel = document.getElementById("inventory-selected");
        if (sel) {
            const nameEl = sel.querySelector(".name");
            if (nameEl) {
                if (selectedName) {
                    const bp = this.state.blueprints && this.state.blueprints[selectedName];
                    nameEl.textContent = bp ? bp.label || selectedName : selectedName;
                } else {
                    nameEl.textContent = "—";
                }
            }
        }
        // Ich/Inventar (UI-Putz): was du trägst + das Rezeptbuch mit-aktualisieren.
        this._renderInventoryEquip();
        this.renderRecipeBook();
    }

    // EIN Mach-Tor-Formatter: das Tor antwortet strukturiert ({reason, missing, cost, neededDomain}),
    // EINE Stimme formt den Hint; _showMachTorHint zeigt ihn am Ort der Geste (nicht nur im Log).
    _machTorHint(result) {
        if (!result || result.ok) return "";
        if (result.reason === "not_enough_material") {
            const miss = Object.entries(result.missing || {})
                .map(([m, n]) => `${n}× ${m}`)
                .join(" · ");
            // das Gesetz des Modus beim Namen (S2): frieden und pfad zahlen Material, frei ist nur schöpfer
            return `fehlt ${miss || "Material"} — sammeln oder abbauen (Frieden und Pfad zahlen Material, frei ist nur Schöpfer)`;
        }
        if (result.reason === "hotbar_voll") return "die Hotbar ist voll — leere einen Platz, dann bauen";
        if (result.reason === "no_workshop_station") {
            const label =
                typeof this._stationLabelForDomain === "function"
                    ? this._stationLabelForDomain(result.neededDomain)
                    : result.neededDomain || "Werkstatt";
            return `braucht ⚒ ${label} in der Nähe (pfad-Modus)`;
        }
        return result.reason ? `fehlgeschlagen: ${result.reason}` : "fehlgeschlagen";
    }

    // Hint INLINE am Ort der Geste: .mach-tor-hint-Zeile im host (ersetzt die alte — idempotent),
    // nach 4 s Fade + Entfernen. Dient jedem Tor-Konsumenten.
    _showMachTorHint(host, result) {
        if (!host || typeof document === "undefined") return;
        const text = this._machTorHint(result);
        if (!text) return;
        const old = host.querySelector(":scope > .mach-tor-hint");
        if (old) old.remove();
        const line = document.createElement("div");
        line.className = "mach-tor-hint";
        line.textContent = `⚒ ${text}`;
        host.appendChild(line);
        setTimeout(() => {
            line.classList.add("fade");
            setTimeout(() => line.remove(), 900);
        }, 4000);
    }

    // Header: die IDENTITÄT — Rolle (prominenter Chip) + die Fähigkeiten (Form-Lesart + Affordanzen),
    // rechts die Qualität als Stern-Rating. „Was ist es + wie gut".
    _specRenderHeader(panel, bp) {
        const role = this._displayRole(bp);
        const roleLabel = AnazhRealm.ROLE_LABELS[role] || AnazhRealm.BLUEPRINT_ROLE_LABELS[role] || role;
        const roleColor = AnazhRealm.BLUEPRINT_ROLE_COLORS[role];
        const roleChip = this._el("span", { class: "role-chip spec-role-chip", text: roleLabel });
        if (roleColor) {
            roleChip.style.borderColor = roleColor;
            roleChip.style.boxShadow = `0 0 8px ${roleColor}`;
        }
        // Der emergent-vs-manuell-Indikator (Glow/✋) — die Rolle ist Welt-Antwort (emergent) oder
        // Schöpfer-Geste (manuell). Wertvolle Info, am Chip erhalten (V8.16/V8.17-Saat).
        roleChip.classList.add(bp.roleManual ? "role-manual" : "role-emergent");
        roleChip.title = bp.roleManual
            ? "Manuell gesetzt — überschreibt die emergente Rolle (zurücksetzen via Markier-Sektion)."
            : "✨ Emergent aus der ganzen Substanz: Form × Material × Handwerk → die Rolle.";
        // Ω3(a) (taille-spec §3) — eine ABWEICHENDE fremde Behauptung wird
        // SICHTBAR (Echtheit ≠ Gutartigkeit): „behauptet: X" neben der lokal
        // emergierten Rolle; der lokale Intent-Override bleibt die Geste.
        let claimChip = null;
        if (bp.roleClaimed && bp.roleClaimed !== role) {
            const claimLabel =
                AnazhRealm.ROLE_LABELS[bp.roleClaimed] ||
                AnazhRealm.BLUEPRINT_ROLE_LABELS[bp.roleClaimed] ||
                bp.roleClaimed;
            claimChip = this._el("span", { class: "role-chip spec-role-claimed", text: `behauptet: ${claimLabel}` });
            claimChip.style.opacity = "0.65";
            claimChip.title =
                "Die Autor-Behauptung des importierten Plans — hier zählt, was die Substanz trägt (Empfänger-Gesetz). Übernehmen: die Markier-Geste.";
        }
        const caps = this._blueprintCapabilityHints(bp) || [];
        const aff = this.computeBlueprintAffordances(bp) || {};
        const affLabels = Object.keys(aff).map((k) => AnazhRealm.AFFORDANCE_LABELS[k] || k);
        const capChips = [...caps, ...affLabels].map((c) =>
            this._el("span", { class: "affordance-chip spec-cap-chip", text: "✦ " + c })
        );
        const q = this._compoundAvgPrecision(bp);
        const idZone = claimChip
            ? this._el("div", { class: "spec-id" }, roleChip, claimChip, ...capChips)
            : this._el("div", { class: "spec-id" }, roleChip, ...capChips);
        let qualZone = null;
        if (q > 0) {
            const q5 = Math.max(0, Math.min(5, Math.round(q * 5)));
            qualZone = this._el(
                "div",
                {
                    class: "spec-quality",
                    title: "Qualität = mittlere Part-Präzision · skaliert die Wirkung des Werks (feiner → stärker).",
                },
                this._el("span", { class: "spec-q-label", text: "Qualität" }),
                this._el("span", { class: "spec-q-stars", text: "★".repeat(q5) + "☆".repeat(5 - q5) }),
                this._el("span", { class: "spec-q-val", text: q.toFixed(2) })
            );
        }
        panel.appendChild(this._el("div", { class: "spec-header" }, idZone, qualZone));
    }

    // Body: der BAUPLAN-FINGERABDRUCK in zwei Spalten — MATERIAL-PROFIL (die Compound-Tags als Balken,
    // 0..3 mit Stufen-Farbe) | ROLLEN-RESONANZ (das _blueprintRoleSpectrum als Balken, 0..1) + die
    // FÄHIGKEITS-WERTE (aus _blueprintAbilityStats, Chip-Streifen).
    _specRenderBody(panel, bp) {
        const T = AnazhRealm.WORLD_EFFECT_THRESHOLDS;
        const mild = T.resonance_mild;
        const strong = T.resonance_strong;
        const sig = T.resonance_signature;
        const lvlFor = (v) => (v >= sig ? "lvl-3" : v >= strong ? "lvl-2" : v >= mild ? "lvl-1" : "lvl-0");
        const tags = this.computeCompoundTags(bp) || {};
        const tagEntries = AnazhRealm.MATERIAL_TAG_KEYS.map((k) => ({ k, v: tags[k] || 0 }))
            .filter((e) => e.v > 0.1)
            .sort((a, b) => b.v - a.v)
            .slice(0, 6);
        const tagBars = tagEntries.map((e) =>
            this._specBar(
                e.k,
                e.v / 3,
                e.v.toFixed(2),
                lvlFor(e.v),
                `${e.k}: ${e.v.toFixed(2)} (Material-Resonanz, 0–3)`
            )
        );
        const leftCol = this._el(
            "div",
            { class: "spec-col" },
            this._el("div", { class: "spec-col-head", text: "Material-Profil" }),
            tagBars.length ? tagBars : this._el("span", { class: "spec-empty", text: "noch keine Substanz" })
        );

        const spectrum = (this._blueprintRoleSpectrum(bp) || []).slice(0, 4);
        // §7.3(b) (V18.164) — die WARUM-Führung: jede Nicht-Sieger-Zeile trägt im
        // Tooltip den Weg DAHIN (Achsen-Differenz zur Wunsch-Rolle); die erste
        // Verfolger-Zeile zeigt ihn sichtbar (die Lehrer-Geste, eine Zeile).
        const gapHints = spectrum.map((s, i) => (i === 0 ? null : this._blueprintRoleGapHint(bp, s.role)));
        const resBars = spectrum.map((s, i) =>
            this._specBar(
                AnazhRealm.ROLE_LABELS[s.role] || s.role,
                s.score,
                s.score.toFixed(2),
                i === 0 ? "res-top" : "res",
                `Resonanz als ${AnazhRealm.ROLE_LABELS[s.role] || s.role}: ${s.score.toFixed(2)} (0–1)` +
                    (gapHints[i] && gapHints[i].text ? `\nWeg dahin: ${gapHints[i].text}` : "")
            )
        );
        const rightChildren = [this._el("div", { class: "spec-col-head", text: "Rollen-Resonanz" }), ...resBars];
        // W-C(h)/R-036 — der WARUM-CHIP: WARUM die Rolle GEWANN (top-3 Beiträge),
        // direkt über dem GapHint (WIE DAHIN) — zusammen die volle Lehrer-Geste.
        const why = this._blueprintRoleWhy(bp);
        if (why && why.text) {
            rightChildren.push(
                this._el("div", {
                    class: "spec-gap-hint spec-why-line",
                    text: `✓ ${AnazhRealm.ROLE_LABELS[why.role] || why.role}, weil: ${why.text}`,
                    title: "Lesbare Emergenz: die drei stärksten Achsen-Beiträge (Produkt-Vektor × Signatur-Gewicht) der gewonnenen Rolle.",
                })
            );
        }
        // Der KONJUNKTIONS-RUF hat Vorrang (die direkteste Tat: „Fahrzeug ruft:
        // setze einen Sitz-Anker"), sonst der erste machbare Achsen-Hinweis.
        const konjRuf = this._blueprintConjunctionCall(bp);
        const firstHint = konjRuf || gapHints.find((h) => h && h.text);
        if (firstHint && firstHint.text) {
            rightChildren.push(
                this._el("div", {
                    class: "spec-gap-hint",
                    text: `↗ ${firstHint.text}`,
                    title: "Die Lehrer-Geste: welche Achsen-Drehung (oder Tat) diese Rolle zum Sieg führt — aus den Signaturen abgeleitet, dieselbe Skala wie die Balken.",
                })
            );
        }
        const ab = this._blueprintAbilityStats(bp);
        if (ab && ab.stats && ab.stats.length) {
            const statChips = ab.stats.map(([name, v]) =>
                this._el(
                    "span",
                    { class: "spec-stat-chip" },
                    this._el("span", { class: "spec-stat-name", text: name }),
                    this._el("span", { class: "spec-stat-val", text: v.toFixed(1) })
                )
            );
            statChips.push(
                this._el("span", {
                    class: "spec-stat-chip spec-stat-fit",
                    text: `Eignung ${ab.fit.toFixed(2)}×`,
                    title: "Form-Passung zur Rolle: Material × Form × Handwerk → die Werte steigen/sinken mit Form + Material.",
                })
            );
            rightChildren.push(this._el("div", { class: "spec-col-head spec-col-head-sub", text: "Fähigkeits-Werte" }));
            rightChildren.push(this._el("div", { class: "spec-stat-strip" }, ...statChips));
        }
        // Die BEWEGUNGS-Rollen des Werks (computeMotionRoles) — dieselbe Resonanz, die Kreaturen + Avatare
        // animiert; die Werkstatt LIEST sie nur. MIT bp.connections wie die Animation (C1-Gelenke,
        // tickArchitectures) — sonst zeigt der Readout nie das Gelenk, das sich wirklich bewegt.
        const motionRoles = this.computeMotionRoles(bp.parts, bp.connections);
        if (motionRoles) {
            const counts = {};
            for (const r of motionRoles) if (r) counts[r.role] = (counts[r.role] || 0) + 1;
            const mlbl = {
                bein: "Bein (Gang)",
                arm: "Arm (Schwung)",
                fluegel: "Flügel (Schlag)",
                schwanz: "Schwanz (Welle)",
                kopf: "Kopf (Nicken)",
                rad: "Rad an Achse (rollt)",
                tuer: "Tür/Schwenk (Scharnier-Achse)",
                wirbel: "Wirbel-Kette (Welle)",
                scharnier: "Scharnier (schwingt am Anker)",
                segel: "Segel/Tuch (flattert)",
            };
            const mtxt = Object.keys(counts)
                .map((k) => `${counts[k]}× ${mlbl[k] || k}`)
                .join(" · ");
            if (mtxt) {
                rightChildren.push(
                    this._el("div", { class: "spec-col-head spec-col-head-sub", text: "Bewegung (Motion-Resonanz)" })
                );
                rightChildren.push(
                    this._el("div", {
                        class: "spec-motion-line",
                        text: mtxt,
                        title: "Die Bewegungs-Rollen emergieren aus Form × Lage × Spiegelung — und aus den VERBINDUNGEN: ein Gelenk (Rad/Tür/Wirbel/Scharnier) entsteht am Anker zwischen zwei verbundenen Teilen. Als Seele getragen oder als Bau erwacht bewegt sich das Werk genau so.",
                    })
                );
            }
        }
        // Die GERECHNETE Physik in Worten: kippt/wackelig/steht (CoM über Stützpolygon), schwebendes Teil
        // (Lastpfad), knickt (Versagen), kopflastig (Schwung) — als „gerechnet“ markiert; die Vorschau
        // lässt das Instabile zudem wanken.
        const verdict = this._workshopPhysicsVerdict(bp);
        if (verdict && verdict.lines && verdict.lines.length) {
            rightChildren.push(
                this._el("div", { class: "spec-col-head spec-col-head-sub", text: "Physik-Spiegel (gerechnet)" })
            );
            for (const ln of verdict.lines) {
                rightChildren.push(
                    this._el("div", {
                        class: `spec-physis-line spec-physis-${ln.sev}`,
                        text: `${ln.sev === "warn" ? "⚠" : "✓"} ${ln.text}`,
                        title: "Der Wahrheits-Spiegel: die in Säule I gerechnete Physik (Schwerpunkt · Stützpolygon · Lastpfad · Knicken · Schwung) — ein Richter außerhalb des Systems, kein erfundener Wert. Ein instabiles Werk wankt zudem sichtbar in der 3D-Vorschau.",
                    })
                );
            }
        }
        // Werkstatt-Station: WIE fein sie fertigt (emergiert aus ihrer Substanz) — lernbar (V17.77-Saat).
        if (bp.role === "workshop-station") {
            const prec = this._workshopStationPrecision(bp);
            const dom = this._computeWorkshopDomain(bp);
            rightChildren.push(
                this._el("div", { class: "spec-col-head spec-col-head-sub", text: "Werkstatt-Präzision" })
            );
            rightChildren.push(
                this._el(
                    "div",
                    { class: "spec-stat-strip" },
                    this._el(
                        "span",
                        {
                            class: "spec-stat-chip",
                            title: "Wie fein diese Werkstatt fertigt — dichteres, härteres Material → feinere Toleranzen. Eine bessere Werkstatt hebt den Präzisions-Cap deiner Werke.",
                        },
                        this._el("span", {
                            class: "spec-stat-val workshop-precision-text",
                            text: prec.toFixed(2) + (dom ? ` · ${dom}` : ""),
                        })
                    )
                )
            );
        }
        const rightCol = this._el("div", { class: "spec-col" }, ...rightChildren);
        panel.appendChild(this._el("div", { class: "spec-body" }, leftCol, rightCol));
    }

    // Footer: der PREIS (Bau-Kosten) + für eigene Baupläne der WACHSTUMS-Hinweis (actionable, italic).
    _specRenderFooter(panel, bp) {
        const children = [];
        const cost = this.computeBuildCost(bp.name);
        const costMats = Object.keys(cost);
        if (costMats.length) {
            children.push(
                this._el(
                    "div",
                    {
                        class: "spec-cost",
                        title: "Material, das der Bau verbraucht (pfad/frieden; schöpfer baut frei).",
                    },
                    this._el("span", { class: "spec-cost-label", text: "Bau-Kosten" }),
                    this._el("span", {
                        class: "spec-cost-val",
                        text: costMats.map((m) => `${cost[m]}× ${m}`).join("  ·  "),
                    })
                )
            );
        }
        if (!bp.builtIn) {
            const g = this._blueprintGrowthHint(bp);
            if (g && g.text) {
                children.push(
                    this._el(
                        "div",
                        { class: `spec-growth${g.manual ? " manual-override" : ""}` },
                        this._el("span", { class: "spec-growth-label", text: "Wachstum" }),
                        this._el("span", { class: "spec-growth-text", text: g.text })
                    )
                );
            }
        }
        if (children.length) panel.appendChild(this._el("div", { class: "spec-footer" }, ...children));
    }

    // Der Wachstums-Hinweis (aus dem alten DomainAnalysis extrahiert): WIE die Rolle emergiert + wohin
    // sie sich verschieben liesse — das actionable Wissen. Liest die Werkzeug-Domain-Verteilung.
    _blueprintGrowthHint(bp) {
        const domCounts = this.computeBlueprintDomainCounts(bp);
        const totalOps = Object.values(domCounts).reduce((a, b) => a + b, 0);
        const dominantDomain = this.computeBlueprintDomain(bp);
        const emergentRole = this.computeBlueprintRole(bp);
        const emergentLabel = AnazhRealm.BLUEPRINT_ROLE_LABELS[emergentRole] || emergentRole;
        if (totalOps === 0) {
            if (emergentRole !== AnazhRealm.DEFAULT_BLUEPRINT_ROLE)
                return {
                    text: `Rolle „${emergentLabel}" emergiert direkt aus der Substanz (Form/Material).`,
                    manual: false,
                };
            return {
                text: "Default: Bauwerk. Wende ein Werkzeug an, forme einen symmetrischen Körper, oder nutze lebendige Substanz — die Rolle emergiert.",
                manual: false,
            };
        }
        if (bp.roleManual)
            return {
                text: `Manuell gesetzt. Emergent wäre „${emergentLabel}" aus Domain „${dominantDomain || "—"}".`,
                manual: true,
            };
        const nextDom = AnazhRealm.TOOL_DOMAINS.filter(
            (d) => d !== dominantDomain && (domCounts[d] || 0) >= (domCounts[dominantDomain] || 0) - 1
        )[0];
        if (nextDom)
            return {
                text: `Rolle aus „${dominantDomain}" (Mehrheit). Eine weitere „${nextDom}"-Anwendung könnte das verschieben.`,
                manual: false,
            };
        return {
            text: `Rolle aus „${dominantDomain}" (Mehrheit, stabil). Weitere Anwendungen vertiefen.`,
            manual: false,
        };
    }

    // LIVE Fähigkeits-Werte aus Material × Form × Handwerk — dieselbe Formel wie der Ausrüstungs-Beitrag:
    // STAT_FROM_TAGS × (0.5 + 0.5·Qualität·RoleFit). Material → Tags, Form → Rollen-Passung,
    // Handwerk → Präzision (angezeigt als „Qualität“).
    _blueprintAbilityStats(bp) {
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length === 0) return null;
        const role = this._displayRole(bp);
        const servedRole =
            role === "armor" ? "armor" : role === "soul" ? "soul" : role === "consumable" ? "consumable" : "held";
        const raw = this.computeCompoundTags(bp) || {};
        // Zwei Tag-Sets: tagsHi (Ceiling 2.5) für die SCHWEREN Stats (Schaden/Rückschlag/Verteidigung/HP —
        // entkappt zeigt sich die echte Material-Spanne, Eisen ≫ Holz); tagsLo (Ceiling 1.0) für die
        // INVERS-dichte Stats (Tempo/Bewegung = 0.8 + (1−dichte)·…) — ungekappt würde dichte>1 sie NEGATIV.
        const tagsHi = {};
        const tagsLo = {};
        for (const k of AnazhRealm.MATERIAL_TAG_KEYS) {
            const v0 = Math.max(0, raw[k] || 0);
            tagsHi[k] = Math.min(2.5, v0);
            tagsLo[k] = Math.min(1, v0);
        }
        const q = this.computeBlueprintQuality(bp);
        const fit = this._blueprintRoleFit(bp, servedRole);
        const mul = 0.5 + 0.5 * q * fit;
        // size = 1: der Größen-Faktor ist nicht im kanonischen Equip-Fold (`_foldEquippedStatTags`) — der
        // Readout zieht mit, sonst lügt die Anzeige. Die dir/sf-Mechanik bleibt als Saat liegen.
        const size = 1;
        const S = AnazhRealm.STAT_FROM_TAGS;
        const INV = AnazhRealm.INVERSE_DICHTE_STATS;
        // dir: +1 = schwer (Größe verstärkt), −1 = agil (Größe bremst), 0 = neutral.
        const val = (stat, dir = 0) => {
            const sf = dir > 0 ? size : dir < 0 ? 1 / size : 1;
            const t = INV[stat] ? tagsLo : tagsHi;
            return Math.max(0, S[stat](t) * mul * sf);
        };
        let stats = null;
        if (role === "armor") {
            stats = [
                ["Verteidigung", val("defense", 1)],
                ["Magie-Resist", val("magicResist")],
                ["Hitze-Resist", val("heatResist")],
            ];
        } else if (role === "soul") {
            stats = [
                ["HP", val("hpMax")],
                ["Bewegung", val("speed")],
                ["Schaden", val("damage")],
            ];
        } else if (role === "tool" || role === "weapon" || role === "held" || role === "brecher") {
            stats = [
                ["Schaden", val("damage", 1)],
                ["Rückschlag", val("knockback", 1)],
                // KAMPF-GEFÜHL — Tempo = Schwünge/s aus der EINEN Schwung-Dauer-Quelle
                // (∝ 1/√I, _swingDynamics): die Zahl, die der Kampf wirklich lebt (die
                // attackSpeed-Tag-Ablesung war eine Parallel-Wahrheit — gefallen).
                ["Tempo", 1 / this._swingDauerFuerBlueprint(bp)],
            ];
        } else {
            return null; // architecture/station/portal/vehicle/consumable → keine Ausrüstungs-Werte
        }
        return { role, servedRole, fit, mul, size, stats };
    }

    // Bauplan-Signatur (Vibe-Pass, ed25519, async geprüft); Built-ins tragen keine (erst klonen).
    // Einen veralteten .then-Lauf fängt der Namens-Wächter `ws.selectedBlueprint !== bpName`.
    _workshopAppendSignatureRow(panel, bp, ws) {
        const sigRow = document.createElement("div");
        sigRow.className = "stat-row workshop-sig-row";
        const sigLab = document.createElement("span");
        sigLab.className = "stat-label";
        sigLab.textContent = "Signatur";
        sigRow.appendChild(sigLab);
        const sigStatus = document.createElement("span");
        sigStatus.className = "workshop-sig-status";
        sigStatus.textContent = "prüfe …";
        sigRow.appendChild(sigStatus);
        const sigBtn = document.createElement("button");
        sigBtn.type = "button";
        sigBtn.className = "workshop-sig-btn";
        sigBtn.textContent = "Signieren";
        sigBtn.disabled = true;
        sigBtn.addEventListener("click", async () => {
            sigBtn.disabled = true;
            const res = await this.signBlueprint(bp.name);
            if (!res.ok) this.log(`Signieren fehlgeschlagen: ${res.reason}`, "ERROR");
            this._workshopRenderStatsPanel();
        });
        sigRow.appendChild(sigBtn);
        panel.appendChild(sigRow);
        const vpReady = !!(this.state.vibePass && this.state.vibePass.ready);
        const bpName = bp.name;
        this.verifyBlueprintSignature(bp).then((status) => {
            if (ws.selectedBlueprint !== bpName) return;
            const myKey = this.state.vibePass && this.state.vibePass.publicKeyHex;
            if (status === "valid") {
                const who = bp.authorPubKey === myKey ? "dein Vibe-Pass" : this._vibeFingerprint(bp.authorPubKey);
                sigStatus.textContent = `✓ signiert · ${who}`;
                sigStatus.className = "workshop-sig-status sig-valid";
                sigStatus.title = "ed25519:" + bp.authorPubKey;
                sigBtn.textContent = "Neu signieren";
            } else if (status === "modified") {
                sigStatus.textContent = "geändert seit der Signatur — neu signieren";
                sigStatus.className = "workshop-sig-status sig-modified";
                sigBtn.textContent = "Neu signieren";
            } else if (status === "forged") {
                sigStatus.textContent = `⚠ ungültig — passt nicht zu ${this._vibeFingerprint(bp.authorPubKey)}`;
                sigStatus.className = "workshop-sig-status sig-forged";
                sigStatus.title = "ed25519:" + bp.authorPubKey;
                sigBtn.textContent = "Neu signieren";
            } else {
                sigStatus.textContent = "nicht signiert";
                sigStatus.className = "workshop-sig-status sig-unsigned";
                sigBtn.textContent = "Signieren";
            }
            sigBtn.disabled = !vpReady;
            if (!vpReady) sigBtn.title = "Vibe-Pass nicht bereit — siehe Spieler-Drawer.";
        });
    }

    // TEILEN in EINER Geste: der Knopf ruft die Geste des Senders (`teile`: `teileWerk` oder `teileWelt` — Signatur → Code);
    // der Code steht in der Zeile und geht in die Zwischenablage — der Empfänger gibt ihn in den Chat (`empfangeWerk`).
    // `art` ("werk" | "welt") benennt Knopf und Zeile (data-teilen).
    _teilenZeile(zone, art, teile) {
        const row = document.createElement("div");
        row.className = "stat-row teilen-row";
        const btn = document.createElement("button");
        btn.type = "button";
        btn.dataset.teilen = art;
        btn.textContent = "Teilen";
        const out = document.createElement("code");
        out.dataset.teilen = art;
        out.style.wordBreak = "break-all";
        btn.addEventListener("click", async () => {
            btn.disabled = true;
            const res = await teile();
            btn.disabled = false;
            out.textContent = res.ok ? res.code : `Teilen fehlgeschlagen: ${res.grund}`;
            if (res.ok && navigator.clipboard) navigator.clipboard.writeText(res.code).catch(() => {});
        });
        row.append(btn, out);
        zone.appendChild(row);
    }

    // V8.06 — Klonen + Neuer Bauplan + (V17.91) Undo/Redo/Löschen direkt in der Mode-Bar. Idempotent.
    _workshopInstallActionButtons() {
        if (typeof document === "undefined") return;
        const ws = this._ensureWorkshopState();
        if (ws._actionBtnsInstalled) return;
        ws._actionBtnsInstalled = true;
        const cloneBtn = document.getElementById("workshop-clone-btn");
        const newBtn = document.getElementById("workshop-new-btn");
        if (cloneBtn) {
            cloneBtn.addEventListener("click", () => {
                const wsLocal = this._ensureWorkshopState();
                const selected = this.state.blueprints[wsLocal.selectedBlueprint];
                if (!selected) return;
                const newName = window.prompt("Name für die Kopie?", `${selected.name}-kopie`);
                if (!newName) return;
                if (this.cloneBlueprint(selected.name, newName)) {
                    this.selectBlueprintForEdit(newName);
                }
            });
        }
        if (newBtn) {
            newBtn.addEventListener("click", () => {
                const name = window.prompt("Name des neuen Bauplans?");
                if (!name) return;
                if (this.createBlueprint(name, name)) this.selectBlueprintForEdit(name);
            });
        }
        // Undo/Redo + Löschen in der Top-Leiste; den disabled-Zustand pflegt _workshopUpdateTopBarState.
        const undoBtn = document.getElementById("workshop-undo-btn");
        const redoBtn = document.getElementById("workshop-redo-btn");
        const delBlueprintBtn = document.getElementById("workshop-delete-blueprint-btn");
        if (undoBtn) {
            undoBtn.addEventListener("click", () => {
                const sel = this._ensureWorkshopState().selectedBlueprint;
                const r = this.undoBlueprintEdit(sel);
                if (!r.ok) this.log(`Rückgängig: ${r.reason}`, "INFO");
                this._renderWorkshopDOM();
            });
        }
        if (redoBtn) {
            redoBtn.addEventListener("click", () => {
                const sel = this._ensureWorkshopState().selectedBlueprint;
                const r = this.redoBlueprintEdit(sel);
                if (!r.ok) this.log(`Wiederholen: ${r.reason}`, "INFO");
                this._renderWorkshopDOM();
            });
        }
        if (delBlueprintBtn) {
            delBlueprintBtn.addEventListener("click", () => {
                const selected = this.state.blueprints[this._ensureWorkshopState().selectedBlueprint];
                if (!selected || selected.builtIn) return;
                if (!window.confirm(`Bauplan '${selected.name}' wirklich löschen?`)) return;
                this.deleteBlueprint(selected.name);
                const remaining = Object.keys(this.state.blueprints);
                if (remaining.length > 0) this.selectBlueprintForEdit(remaining[0]);
                else this._renderWorkshopDOM();
            });
        }
    }

    // V17.91 — der disabled-Zustand der Top-Leisten-Akte (Undo/Redo/Löschen) pro Render: nur eigene Baupläne
    // sind editier-/löschbar, Undo/Redo nur wenn der Editier-Verlauf etwas hergibt.
    _workshopUpdateTopBarState(selected) {
        if (typeof document === "undefined") return;
        const undoBtn = document.getElementById("workshop-undo-btn");
        const redoBtn = document.getElementById("workshop-redo-btn");
        const delBtn = document.getElementById("workshop-delete-blueprint-btn");
        const editable = !!(selected && !selected.builtIn);
        if (undoBtn) undoBtn.disabled = !(editable && this.canUndoBlueprintEdit(selected.name));
        if (redoBtn) redoBtn.disabled = !(editable && this.canRedoBlueprintEdit(selected.name));
        if (delBtn) delBtn.disabled = !editable;
    }

    // V8.05 — Del-Button-Handler. Entfernt den selektierten Part.
    _workshopInstallDeleteButton() {
        if (typeof document === "undefined") return;
        const ws = this._ensureWorkshopState();
        if (ws._deleteBtnInstalled) return;
        ws._deleteBtnInstalled = true;
        const btn = document.getElementById("workshop-delete-selected-part");
        if (!btn) return;
        btn.addEventListener("click", () => {
            const wsLocal = this._ensureWorkshopState();
            const idx = wsLocal.selectedPartIdx;
            if (idx === null || idx === undefined) return;
            const bp = this.state.blueprints[wsLocal.selectedBlueprint];
            if (!bp || bp.builtIn) return;
            this.removePartFromBlueprint(bp.name, idx);
            wsLocal.selectedPartIdx = null;
            this._renderWorkshopDOM();
        });
    }

    // === Shape-Palette HTML5-Drag-Drop ===
    // Shape-Cards sind draggable; eigener MIME-Marker `application/x-anazh-shape` (kein Konflikt mit
    // dem Inventar-Drag). Drop auf die Preview-Canvas hängt einen neuen Part an und selektiert ihn.
    _workshopInstallShapeDragDrop() {
        if (typeof document === "undefined") return;
        const ws = this._ensureWorkshopState();
        if (ws._shapeDnDInstalled) return;
        ws._shapeDnDInstalled = true;

        // V8.03 — Material- und Farb-Palette zusätzlich rendern.
        // V8.05 — Werkzeug-Palette als dritte Sub-Palette (Werkzeug-Drag-Drop
        // auf Part wendet die Op an wie applyOpToPart).
        this._workshopRenderMaterialPalette();
        this._workshopRenderColorPalette();
        this._workshopRenderToolPalette();

        const shapePalette = document.getElementById("workshop-shape-palette");
        const matPalette = document.getElementById("workshop-material-palette");
        const colorPalette = document.getElementById("workshop-color-palette");
        const toolPalette = document.getElementById("workshop-tool-palette");
        const canvas = document.getElementById("workshop-preview-canvas");
        if (!canvas) return;

        // Universal-Drag-Helper: EINE Drag-Source je Card-Container per Event-Delegation (Marker = MIME-Typ,
        // Data via getAttribute). Delegation ist Pflicht: die Werkzeug-Palette wird bei jedem Refresh neu
        // gerendert — Pro-Karte-Listener gingen dabei verloren.
        const installDragSource = (container, cardSelector, dataAttr, marker) => {
            if (!container) return;
            container.addEventListener("dragstart", (event) => {
                const card = event.target && event.target.closest ? event.target.closest(cardSelector) : null;
                if (!card) return;
                const data = card.getAttribute(dataAttr);
                if (!data) return;
                const bp = this.state.blueprints[this._ensureWorkshopState().selectedBlueprint];
                if (!bp || bp.builtIn) {
                    event.preventDefault();
                    return;
                }
                event.dataTransfer.setData(marker, data);
                event.dataTransfer.effectAllowed = "copy";
                card.classList.add("dragging");
            });
            container.addEventListener("dragend", (event) => {
                const card = event.target && event.target.closest ? event.target.closest(cardSelector) : null;
                if (card) card.classList.remove("dragging");
            });
        };
        installDragSource(shapePalette, ".workshop-shape-card", "data-shape", "application/x-anazh-shape");
        installDragSource(matPalette, ".workshop-material-card", "data-material", "application/x-anazh-material");
        installDragSource(colorPalette, ".workshop-color-swatch", "data-color", "application/x-anazh-color");
        installDragSource(toolPalette, ".workshop-tool-card", "data-tool", "application/x-anazh-tool");

        // Drop-Target: Canvas. Akzeptiert alle vier Marker.
        const acceptedMarkers = [
            "application/x-anazh-shape",
            "application/x-anazh-material",
            "application/x-anazh-color",
            "application/x-anazh-tool",
        ];
        canvas.addEventListener("dragover", (event) => {
            const ourDrag = acceptedMarkers.some((m) => event.dataTransfer.types.includes(m));
            if (!ourDrag) return;
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
            canvas.classList.add("drop-target");
        });
        canvas.addEventListener("dragleave", () => {
            canvas.classList.remove("drop-target");
        });
        canvas.addEventListener("drop", (event) => {
            canvas.classList.remove("drop-target");
            const shape = event.dataTransfer.getData("application/x-anazh-shape");
            const material = event.dataTransfer.getData("application/x-anazh-material");
            const color = event.dataTransfer.getData("application/x-anazh-color");
            const tool = event.dataTransfer.getData("application/x-anazh-tool");
            if (!shape && !material && !color && !tool) return;
            event.preventDefault();
            if (shape) {
                this._workshopHandleShapeDrop(shape);
            } else if (material) {
                this._workshopHandleMaterialDrop(material, event.clientX, event.clientY);
            } else if (color) {
                this._workshopHandleColorDrop(color, event.clientX, event.clientY);
            } else if (tool) {
                this._workshopHandleToolDrop(tool, event.clientX, event.clientY);
            }
        });
    }

    // Werkzeug-Palette: eine Card je besessenem state.tools-Eintrag (Marker data-tool);
    // Drop auf einen Part ruft applyOpToPart.
    _workshopRenderToolPalette() {
        if (typeof document === "undefined") return;
        const palette = document.getElementById("workshop-tool-palette");
        if (!palette) return;
        palette.innerHTML = "";
        const owned = Array.isArray(this.state.player && this.state.player.tools) ? this.state.player.tools : [];
        const tools = this.state.tools || {};
        for (const name of owned) {
            const t = tools[name];
            if (!t) continue;
            const card = document.createElement("div");
            card.className = "workshop-tool-card";
            card.setAttribute("draggable", "true");
            card.setAttribute("data-tool", name);
            const domLabel =
                t.domain && AnazhRealm.TOOL_DOMAIN_LABELS
                    ? AnazhRealm.TOOL_DOMAIN_LABELS[t.domain] || t.domain
                    : "generisch";
            card.setAttribute(
                "title",
                `${t.label || name} · ${t.opName} (${t.opClass}) · ${domLabel} · auf Part ziehen wendet Op an`
            );
            // Domain-Dot (V9b-Style). V8.37 — eigener Tooltip (Schöpfer-
            // Browser-Test fragte „was sind die farbigen Punkte?"): der Punkt
            // markiert die Werkzeug-Domäne, gleiche Farbe = gleiche Domäne.
            if (t.domain && AnazhRealm.TOOL_DOMAIN_COLORS && AnazhRealm.TOOL_DOMAIN_COLORS[t.domain]) {
                const dot = document.createElement("span");
                dot.className = "workshop-tool-domain-dot";
                dot.style.background = AnazhRealm.TOOL_DOMAIN_COLORS[t.domain];
                dot.title = `Domäne: ${domLabel} — Werkzeuge derselben Domäne teilen die Punkt-Farbe.`;
                card.appendChild(dot);
            }
            const nameEl = document.createElement("span");
            nameEl.textContent = t.label || name;
            card.appendChild(nameEl);
            const precEl = document.createElement("span");
            precEl.className = "tool-prec";
            precEl.textContent = (t.precisionCap || 0).toFixed(2);
            card.appendChild(precEl);
            palette.appendChild(card);
        }
        // Werkstatt-PROZESSE als ziehbare Karten: auf einen Part gezogen fixt der Prozess die Rolle.
        // data-tool="station:<name>" → applyWorkshopProcessToPart. schöpfer: alle besessenen Werkstätten,
        // sonst die platzierten + nahen.
        const verbs = AnazhRealm.OP_VERB_LABELS;
        for (const proc of this._workshopProcessesForMenu()) {
            const card = document.createElement("div");
            card.className = "workshop-tool-card workshop-station-card";
            card.setAttribute("draggable", "true");
            card.setAttribute("data-tool", `station:${proc.stationName}`);
            const verb = verbs[proc.opName] || proc.opName;
            card.setAttribute(
                "title",
                `${proc.label} · ${verb} (${proc.cap.toFixed(2)}) · Werkstatt-Prozess — auf einen Part im 3D ziehen fixt die Rolle`
            );
            const color = AnazhRealm.TOOL_DOMAIN_COLORS && AnazhRealm.TOOL_DOMAIN_COLORS[proc.domain];
            if (color) {
                const dot = document.createElement("span");
                dot.className = "workshop-tool-domain-dot";
                dot.style.background = color;
                dot.title = `Domäne: ${(AnazhRealm.TOOL_DOMAIN_LABELS && AnazhRealm.TOOL_DOMAIN_LABELS[proc.domain]) || proc.domain}`;
                card.appendChild(dot);
            }
            const nameEl = document.createElement("span");
            nameEl.textContent = proc.label;
            card.appendChild(nameEl);
            const precEl = document.createElement("span");
            precEl.className = "tool-prec";
            precEl.textContent = proc.cap.toFixed(2);
            card.appendChild(precEl);
            palette.appendChild(card);
        }
    }

    // Tool-Drop: Part per Raycast finden, applyOpToPart rufen; Tags + Rolle + Affordances rechnet
    // dessen Hook _refreshBlueprintRoleEmergent neu.
    _workshopHandleToolDrop(toolName, clientX, clientY) {
        const ws = this._ensureWorkshopState();
        const bp = this.state.blueprints[ws.selectedBlueprint];
        if (!bp) return;
        // V8.19 Schöpfer-Bug — Built-in-Bauplan: gib klare Anleitung statt
        // silent-fail. Spieler musste vorher rätseln warum nichts passiert.
        if (bp.builtIn) {
            this.log(
                `Built-in-Bauplan „${bp.label || bp.name}" — klicke „Klonen" in der Mode-Bar um eine editierbare Kopie zu erstellen.`,
                "WARNING"
            );
            return;
        }
        // V17.91 — eine WERKSTATT-PROZESS-Karte (data-tool="station:<name>") auf einen Part ziehen wendet den
        // Prozess der platzierten/besessenen Werkstatt an (fixt die Rolle) — der intuitive Drag-Ersatz für den
        // entfernten per-Part-Dropdown. Routet auf applyWorkshopProcessToPart (Modus-Gate + Stamina darin).
        if (typeof toolName === "string" && toolName.startsWith("station:")) {
            const stationName = toolName.slice("station:".length);
            const idx = this._workshopRaycastPartIdxAt(clientX, clientY);
            if (idx === null) {
                this.log("Prozess auf einen Part im 3D-Mesh ziehen (Treffer-Punkt war daneben).", "INFO");
                return;
            }
            const r = this.applyWorkshopProcessToPart(bp.name, idx, stationName);
            if (r && r.ok) {
                this._renderWorkshopDOM();
                this._workshopSetSelection(idx);
                const st = this.state.blueprints[stationName];
                this.log(
                    `Prozess „${(st && st.label) || stationName}" angewandt auf Part ${idx} (Präzision ${(r.precision || 0).toFixed(2)}).`,
                    "INFO"
                );
            } else {
                const reason = (r && r.reason) || "unknown";
                if (reason === "workshop_not_placed_near") {
                    this.log(
                        "Diese Werkstatt ist nicht in der Nähe — platziere sie näher (oder schöpfer-Modus).",
                        "WARNING"
                    );
                } else if (reason === "not_enough_stamina") {
                    this.log("Nicht genug Stamina für diesen Prozess (frieden/schöpfer ist reibungsfrei).", "WARNING");
                } else {
                    this.log(`Prozess fehlgeschlagen: ${reason}`, "ERROR");
                }
            }
            return;
        }
        const tool = this.state.tools && this.state.tools[toolName];
        if (!tool) {
            this.log(`Werkzeug „${toolName}" nicht bekannt`, "ERROR");
            return;
        }
        const idx = this._workshopRaycastPartIdxAt(clientX, clientY);
        if (idx === null) {
            this.log("Werkzeug auf einen Part im 3D-Mesh ziehen (Treffer-Punkt war daneben).", "INFO");
            return;
        }
        const result = this.applyOpToPart(bp.name, idx, toolName);
        if (result && result.ok) {
            this._renderWorkshopDOM();
            this._workshopSetSelection(idx);
            this.log(
                `Werkzeug „${tool.label || toolName}" angewandt auf Part ${idx} (Präzision ${result.precision.toFixed(2)})`,
                "INFO"
            );
        } else {
            // V8.19 — bessere Fehlermeldungen pro reason. Schöpfer-Test
            // zeigte „werkzeuge gehen nicht" → unklar warum. Jetzt sagt
            // der Log exakt was fehlt.
            const reason = (result && result.reason) || "unknown";
            const part = bp.parts && bp.parts[idx];
            if (reason === "tool_not_owned") {
                this.log(
                    `Werkzeug „${tool.label || toolName}" nicht im Besitz. Erstelle es im Spieler-Drawer (Werkzeug ausrüsten).`,
                    "WARNING"
                );
            } else if (reason === "material_op_incompatible") {
                const compat = AnazhRealm.MATERIAL_OP_COMPATIBILITY[part?.material];
                this.log(
                    `Material „${part?.material}" akzeptiert nicht Op-Klasse „${tool.opClass}". Kompatibel: ${(compat || []).join(", ") || "(keine)"}. ` +
                        `Stein → subtractive (Feuerstein, Feile), Eisen → alles, Holz → subtractive+additive.`,
                    "WARNING"
                );
            } else if (reason === "insufficient_stamina") {
                this.log(
                    "Nicht genug Stamina (10 nötig). Wechsel zu frieden/schöpfer für kostenlose Werkzeug-Anwendung.",
                    "WARNING"
                );
            } else {
                this.log(`Werkzeug-Anwendung fehlgeschlagen: ${reason}`, "ERROR");
            }
        }
    }

    // Material-Palette aus state.materials: je Material eine Card (Swatch + Name + Glyph wie die
    // Inventar-Slots), Marker data-material.
    _workshopRenderMaterialPalette() {
        if (typeof document === "undefined") return;
        const palette = document.getElementById("workshop-material-palette");
        if (!palette) return;
        palette.innerHTML = "";
        const materials = this.state.materials || {};
        const GLYPHS = {
            stein: "◼",
            holz: "║",
            eisen: "◆",
            bronze: "◈",
            quarz: "❖",
            leder: "◗",
            knochen: "⌘",
            fleisch: "⬣",
            federn: "✷",
            schuppen: "⬢",
            glut: "✺",
            laub: "❀",
            kraut: "✿",
            essenz: "✧",
        };
        for (const name of Object.keys(materials)) {
            const mat = materials[name];
            if (mat.bauStoff === false) continue; // ein Stoff der Körper, kein Bau-Stoff (_defaultMaterials)
            const card = document.createElement("div");
            card.className = "workshop-material-card";
            card.setAttribute("draggable", "true");
            card.setAttribute("data-material", name);
            card.setAttribute("title", `${mat.label || name} → auf Part ziehen wechselt Material`);
            const c = typeof mat.color === "number" ? mat.color : 0x888888;
            const colorHex = `#${c.toString(16).padStart(6, "0")}`;
            // V8.19 — Glyph in der Material-Farbe VOR dem Label (statt
            // separater Farb-Kreis + Glyph-rechts). Spieler sieht das
            // Material-Symbol direkt eingefärbt — kein doppelter Marker mehr.
            if (GLYPHS[name]) {
                const glyph = document.createElement("span");
                glyph.className = "mat-glyph";
                glyph.setAttribute("aria-hidden", "true");
                glyph.textContent = GLYPHS[name];
                glyph.style.color = colorHex;
                card.appendChild(glyph);
            } else {
                // Eigene Materialien ohne Glyph → fallback ein gefüllter Kreis
                // in Material-Farbe, damit kein leerer Slot entsteht.
                const swatch = document.createElement("span");
                swatch.className = "mat-swatch";
                swatch.style.background = colorHex;
                card.appendChild(swatch);
            }
            const label = document.createElement("span");
            label.textContent = mat.label || name;
            card.appendChild(label);
            palette.appendChild(card);
        }
    }

    // V8.03 — Farb-Palette als 12 Quick-Pick-Swatches. Drag-Source-Marker =
    // data-color (hex-String ohne #).
    _workshopRenderColorPalette() {
        if (typeof document === "undefined") return;
        const palette = document.getElementById("workshop-color-palette");
        if (!palette) return;
        palette.innerHTML = "";
        // 12 Standard-Schöpfer-Farben: Erd-/Steintöne + Akzente
        const colors = [
            "#3a2818", // tiefes Erdbraun
            "#7a5530", // Holzbraun
            "#b08648", // Bronze
            "#d4b076", // Sand
            "#e8d4a8", // Pergament
            "#8a8a8a", // Stein-Grau
            "#c0c0c8", // Quarz
            "#5a8a5e", // Laub
            "#3a6890", // Wasser
            "#c44830", // Glut
            "#e8c850", // Gold
            "#a878b8", // Magie-Violett
        ];
        for (const hex of colors) {
            const swatch = document.createElement("div");
            swatch.className = "workshop-color-swatch";
            swatch.setAttribute("draggable", "true");
            swatch.setAttribute("data-color", hex.slice(1));
            swatch.setAttribute("title", `${hex} → auf Part ziehen wechselt Farbe`);
            swatch.style.background = hex;
            palette.appendChild(swatch);
        }
    }

    // REZEPT-REGLER für BAUM · FELS · KRISTALL: Studio-Regler + SAAT-WÜRFEL speisen live die EINE
    // phyto-core-Quelle (treeParams → growSkeleton · buildBoulderGeometry · buildCrystalPointGeometry)
    // → die Vorschau folgt. Ohne Rezept-Kern (Bauwerk/Werkzeug) versteckt.
    _workshopRecipeKind(bp) {
        if (!bp || !Array.isArray(bp.parts) || !bp.parts.length) return null;
        const species = bp._grownSpecies;
        if (species && String(species).startsWith("baum_") && this._phytoArt(species)) return "tree";
        let rock = false,
            crystal = false;
        for (const p of bp.parts) {
            if (!p) continue;
            if (p.shape === "crystalPoint") crystal = true;
            else if (p.shape === "noiserock") rock = true;
        }
        if (crystal) return "crystal";
        if (rock) return "rock";
        return null;
    }

    _workshopRenderRecipePanel(bp) {
        if (typeof document === "undefined") return;
        const panel = document.getElementById("workshop-recipe-panel");
        if (!panel) return;
        const kind = this._workshopRecipeKind(bp);
        if (!kind) {
            // Generische Regler: Auswahl (Bauplan ODER Studio-Rezept) → LIVE-Buch-Rezept mit PARAMS-Tabelle
            // (f.paramsByKind) → Slider aus den DATEN. Sonst Panel versteckt.
            if (this._workshopRenderStudioParams(panel, bp)) return;
            panel.hidden = true;
            panel.innerHTML = "";
            return;
        }
        panel.hidden = false;
        panel.innerHTML = "";
        const head = document.createElement("h4");
        head.className = "workshop-recipe-head";
        head.textContent =
            "Rezept (Studio-Regler · " + (kind === "tree" ? "Baum" : kind === "rock" ? "Fels" : "Kristall") + ")";
        panel.appendChild(head);
        const spec = this._workshopRecipeSpec(bp, kind);
        // DIE HÜLLE (K41, worlds/huelle/huelle.js): DERSELBE Regler-Generator wie in den Studio-Shells — die Dials des
        // Rezept-Kerns in der PARAMS-Form (key → id, hint → law als Titel), jeder Zug wirkt sofort auf den Satz.
        const dialWerte = Object.assign({}, spec.cur);
        AnazhHuelle.regler(
            panel,
            spec.dials.map((d) => ({
                id: d.key,
                lab: d.label,
                min: d.min,
                max: d.max,
                step: d.step,
                def: d.min,
                law: d.hint,
            })),
            {
                werte: dialWerte,
                leeren: false,
                gruppen: false,
                gesetze: false,
                zuruecksetzen: false,
                klassen: { zeile: "workshop-recipe-row", wert: "workshop-recipe-val" },
                format: (z, v) => (z.step >= 1 ? String(Math.round(v)) : (+v).toFixed(2)),
                bei: () => {
                    spec.cur = Object.assign({}, spec.cur, dialWerte); // weitere Regler bauen auf dem aktualisierten Satz auf
                    spec.apply(spec.cur);
                },
            }
        );
        // LOD-Wahl (wie im Studio „gröbere Regeneration"): L0 fein · L1 mittel · L2 grob. Regeneriert
        // den Bauplan durch die Pipeline auf der gewählten Stufe → beweist, dass die LOD-Stufen durch
        // DIESELBE Quelle fliessen (Baum: Blätter → Karten → Impostor · Fels: Detail-Stufe).
        if (spec.hasLod) {
            const lodHead = document.createElement("div");
            lodHead.className = "workshop-recipe-sub";
            lodHead.textContent = "LOD (gröbere Regeneration)";
            panel.appendChild(lodHead);
            const lodRow = document.createElement("div");
            lodRow.className = "workshop-recipe-btns workshop-recipe-lod";
            const curLod = Number.isFinite(bp._recipeLod) ? bp._recipeLod : 0;
            [
                ["L0 fein", 0],
                ["L1 mittel", 1],
                ["L2 grob", 2],
            ].forEach(([lab, lv]) => {
                const b = document.createElement("button");
                b.type = "button";
                b.className = "workshop-recipe-lod-btn" + (lv === curLod ? " active" : "");
                b.textContent = lab;
                b.title = "Regeneriere auf LOD-Stufe " + lv + " durch die Pipeline";
                b.addEventListener("click", () => {
                    bp._recipeLod = lv;
                    spec.apply(spec.cur);
                    this._workshopRenderRecipePanel(bp);
                });
                lodRow.appendChild(b);
            });
            panel.appendChild(lodRow);
        }
        const btnRow = document.createElement("div");
        btnRow.className = "workshop-recipe-btns";
        const dice = document.createElement("button");
        dice.type = "button";
        dice.className = "workshop-recipe-dice";
        dice.textContent = "🎲 Neue Saat";
        dice.title = "Wirf eine andere Variante (gleiches Rezept, anderer Same) — wie im Studio";
        dice.addEventListener("click", () => spec.dice());
        btnRow.appendChild(dice);
        const reset = document.createElement("button");
        reset.type = "button";
        reset.className = "workshop-recipe-reset";
        reset.textContent = "↺ Vorlage";
        reset.title = "Regler + Same auf das Vorlagen-Rezept zurücksetzen";
        reset.addEventListener("click", () => {
            spec.reset();
            this._workshopRenderRecipePanel(bp); // Regler-Positionen zurückstellen
        });
        btnRow.appendChild(reset);
        panel.appendChild(btnRow);
    }

    // Generische Regler aus der PARAMS-Tabelle des Kerns (f.paramsByKind[kind]: id/lab/min/max/step/
    // def/law/grp; grp = Zwischentitel). Werte in ws.studioOv[presetId]; onChange debounced (~180 ms)
    // → Rebuild über den cache-freien Regler-Kanal; „Zurücksetzen“ leert ov. Kein UI-Hardcode je Domäne.
    // true = gerendert (Panel bleibt sichtbar), false = keine PARAMS für diese Auswahl.
    _workshopRenderStudioParams(panel, bp) {
        const ws = this._ensureWorkshopState();
        const f = this._foundry;
        if (!f || !f.recipes || !f.paramsByKind) return false;
        // Aufloesung: der EXPLIZIT gereichte Bauplan fuehrt (der Panel-Renderer bekommt ihn);
        // ohne Bauplan traegt die Rezept-Auswahl (Studio-Rezepte-Sektion).
        const preset = bp
            ? typeof this._foundryPresetForEntry === "function" && bp.name
                ? this._foundryPresetForEntry({ type: bp.name })
                : null
            : ws.selectedRecipe || null;
        const rec = preset ? f.recipes[preset] : null;
        const params = rec && typeof rec.kind === "string" ? f.paramsByKind[rec.kind] : null;
        // LOD-Stufen sind DATEN (kindStages): hat die Art mehr als eine Stufe (haus/baum [0,1,2]), gibt es
        // eine generische LOD-Wahl — auch ohne PARAMS, für Rezept- UND Bauplan-Auswahl. Sie reist als
        // ws.recipeLod bzw. bp._recipeLod in DIESELBE Vorschau-Quelle (kein kind-Literal-if).
        const _cfgLodW = AnazhRealm._studioRenderConfig && AnazhRealm._studioRenderConfig.lod;
        // (eine NUR-WURF-Stufe wird nie gezeigt — die Wahl bietet sie nicht an)
        const stages =
            rec && _cfgLodW && _cfgLodW.kindStages && Array.isArray(_cfgLodW.kindStages[rec.kind])
                ? _cfgLodW.kindStages[rec.kind].filter((st) => !AnazhRealm._budgetNurWurf(rec.kind, st))
                : null;
        const hasParams = Array.isArray(params) && params.length > 0;
        const hasStages = !!(stages && stages.length > 1);
        if (!hasParams && !hasStages) return false;
        panel.hidden = false;
        panel.innerHTML = "";
        const head = document.createElement("h4");
        head.className = "workshop-recipe-head";
        head.textContent = "Studio-Regler · " + (rec.lab || preset);
        panel.appendChild(head);
        // DIE HÜLLE (K41, worlds/huelle/huelle.js): DERSELBE Regler-Generator wie in den Studio-Shells (kein Zwilling).
        // Startwert-Kette: ov-Override → Rezept-Dial (rec.s) → def → min; jeder Zug schreibt seine Achse sofort in
        // ws.studioOv[preset], die Vorschau baut, wenn die Hand ruht (Entprellung 180 ms der Hülle).
        if (hasParams)
            AnazhHuelle.regler(panel, params, {
                werte: Object.assign({}, ws.studioOv[preset] || {}),
                start: (d) => (rec.s && typeof rec.s[d.id] === "number" ? rec.s[d.id] : null),
                leeren: false,
                gesetze: false,
                zuruecksetzen: false,
                ruheMs: 180,
                klassen: {
                    zeile: "workshop-recipe-row workshop-studio-param-row",
                    wert: "workshop-recipe-val",
                    gruppe: "workshop-recipe-sub",
                },
                format: (z, v) => (z.step >= 1 ? String(Math.round(v)) : (+v).toFixed(2)),
                bei: (id, v) => {
                    if (!ws.studioOv[preset]) ws.studioOv[preset] = {};
                    ws.studioOv[preset][id] = v;
                },
                nachRuhe: () => {
                    if (typeof this._workshopRebuildPreviewMesh === "function") this._workshopRebuildPreviewMesh();
                    if (this._wsKostenMessen) this._wsKostenMessen();
                },
            });
        const btnRow = document.createElement("div");
        btnRow.className = "workshop-recipe-btns";
        // ERFINDER-WELLE — die generische LOD-Wahl AUS den kindStages-Daten (haus 0/1/2 …):
        // nur ehrlich getragene Stufen erscheinen; die Wahl reist als ws.recipeLod in die
        // EINE Vorschau-Quelle (Vorschau == Welt-Stufe, kein Fake-Grading).
        if (hasStages) {
            const lodHead = document.createElement("div");
            lodHead.className = "workshop-recipe-sub";
            lodHead.textContent = "LOD-Stufe (aus den Vertrags-Daten)";
            panel.appendChild(lodHead);
            const lodRow = document.createElement("div");
            lodRow.className = "workshop-recipe-btns workshop-recipe-lod";
            const curLod = bp
                ? Number.isFinite(bp._recipeLod)
                    ? bp._recipeLod
                    : 0
                : Number.isFinite(ws.recipeLod)
                  ? ws.recipeLod
                  : 0;
            const lodLabels = { 0: "L0 fein", 1: "L1 mittel", 2: "L2 fern" };
            for (const lv of stages) {
                const b = document.createElement("button");
                b.type = "button";
                b.className = "workshop-recipe-lod-btn" + (lv === curLod ? " active" : "");
                b.textContent = lodLabels[lv] || "L" + lv;
                b.title = "Vorschau auf der ehrlichen Vertrags-Stufe " + lv;
                b.addEventListener("click", () => {
                    if (bp) bp._recipeLod = lv;
                    else ws.recipeLod = lv;
                    if (typeof this._workshopRebuildPreviewMesh === "function") this._workshopRebuildPreviewMesh();
                    this._workshopRenderStudioParams(panel, bp);
                });
                lodRow.appendChild(b);
            }
            panel.appendChild(lodRow);
        }
        // DIE KOSTEN-LEISTE (studios.K5): je Stufe der Art ihre Kosten gegen die Budget-Zeile (B2c), gezählt am Welt-Werk
        this._wsKostenMessen =
            _cfgLodW && _cfgLodW.budget && _cfgLodW.budget[rec.kind]
                ? this._workshopKostenLeiste(panel, preset, rec.kind, bp ? ws.selectedBlueprint : null)
                : null;
        if (hasParams) {
            const reset = document.createElement("button");
            reset.type = "button";
            reset.className = "workshop-recipe-reset";
            reset.textContent = "↺ Zurücksetzen";
            reset.title = "Alle Regler auf das Rezept zuruecksetzen (ov leeren)";
            reset.addEventListener("click", () => {
                delete ws.studioOv[preset];
                this._workshopRenderStudioParams(panel);
                if (typeof this._workshopRebuildPreviewMesh === "function") this._workshopRebuildPreviewMesh();
            });
            btnRow.appendChild(reset);
        }
        panel.appendChild(btnRow);
        return true;
    }

    // DIE KOSTEN-LEISTE DER WERKSTATT (studios.K5): der Baustein der Hülle (`AnazhHuelle.kosten`, wie in den Studio-Shells) je
    // Stufe der Art (kindStages) — Dreiecke, Stoffe und Wurf des Welt-Werks, das die Foundry für Same und Regler der Vorschau
    // baut, gegen die Budget-Zeile (B2c); kein kind-Literal. Rückgabe: der Mess-Lauf (die Regler-Ruhe ruft ihn neu), ein
    // späterer Lauf macht den früheren stumm.
    _workshopKostenLeiste(panel, preset, kind, bpName) {
        const L = AnazhRealm._studioRenderConfig.lod;
        const stufen = (L.kindStages && L.kindStages[kind]) || [0];
        const K = AnazhHuelle.kosten(panel, {
            budget: L.budget[kind],
            stufen,
            quelle: "gezählt am Welt-Werk der Foundry (Same und Regler der Vorschau)",
        });
        const messen = () => {
            const lauf = (this._wsKostenLauf = (this._wsKostenLauf || 0) + 1);
            const bp = bpName ? this.state.blueprints[bpName] : null;
            const gestalt = this._foundryVariantFor(this._vorschauSame(bp, bpName || preset), preset);
            if (gestalt == null) return;
            const ov = this._workshopStudioOvFor(preset);
            for (const s of stufen)
                this._foundryRequest(preset, gestalt, s, ov, 0).then((meshes) => {
                    if (this._wsKostenLauf === lauf) K.setzen(s, AnazhRealm._foundryKosten(meshes));
                });
        };
        messen();
        return messen;
    }

    // Die Dial-Spezifikation + aktuellen Werte + apply/dice/reset je Art. EINE Struktur, drei Rezept-
    // Kerne — der Panel-Renderer bleibt art-neutral.
    _workshopRecipeSpec(bp, kind) {
        if (kind === "tree") {
            const cur = bp._recipeDials || this._treeRecipeDials(bp._grownSpecies);
            return {
                cur: Object.assign({}, cur),
                dials: [
                    {
                        key: "api",
                        label: "Apikaldominanz",
                        min: 0,
                        max: 1,
                        step: 0.01,
                        hint: "Nadel-Kegel (1) ↔ Laub (0)",
                    },
                    {
                        key: "slim",
                        label: "Schlankheit",
                        min: 0,
                        max: 1,
                        step: 0.01,
                        hint: "gedrungen (0) ↔ schlank (1)",
                    },
                    {
                        key: "trop",
                        label: "Gravitropismus",
                        min: -0.3,
                        max: 1,
                        step: 0.01,
                        hint: "aufrecht (−) ↔ hängend (+)",
                    },
                    { key: "delta", label: "da-Vinci-Δ", min: 1.9, max: 2.9, step: 0.01, hint: "Astdicke-Erhalt" },
                    { key: "leaf", label: "Blattdichte", min: 0, max: 1, step: 0.01, hint: "kahl (0) ↔ voll (1)" },
                ],
                hasLod: true,
                apply: (nd) => {
                    nd.conifer = nd.api >= 0.72;
                    this._workshopRegrowRecipe(bp, nd, bp._grownSeed || `${bp._grownSpecies}-studio`);
                },
                // Der Würfel zieht aus dem Welt-Strom (`_bauSame`, Γ5 — wie Fels und Kristall unten): jeder Wurf ein neues
                // Individuum, das Vorschau, Phantom und Werk teilen (`_werkSame`), nie Math.random.
                dice: () =>
                    this._workshopRegrowRecipe(
                        bp,
                        bp._recipeDials || this._treeRecipeDials(bp._grownSpecies),
                        `${bp._grownSpecies}-studio-${this._bauSame("wuerfel:baum").toString(36)}`
                    ),
                reset: () => {
                    delete bp._recipeDials;
                    this._workshopRegrowRecipe(
                        bp,
                        this._treeRecipeDials(bp._grownSpecies),
                        `${bp._grownSpecies}-studio`
                    );
                },
            };
        }
        if (kind === "rock") {
            const cur = bp._rockRecipe || { round: 0.4, rough: 0.5, elong: 0.25, strat: 0.12 };
            return {
                cur: Object.assign({}, cur),
                dials: [
                    { key: "round", label: "Rundheit", min: 0.05, max: 0.9, step: 0.01, hint: "kantig ↔ gerundet" },
                    { key: "rough", label: "Rauheit", min: 0.05, max: 1, step: 0.01, hint: "glatt ↔ bruchig" },
                    { key: "elong", label: "Streckung", min: 0.05, max: 0.8, step: 0.01, hint: "gedrungen ↔ länglich" },
                    { key: "strat", label: "Schichtung", min: 0, max: 0.5, step: 0.01, hint: "massiv ↔ sedimentär" },
                ],
                hasLod: true,
                apply: (nd) => this._workshopRegrowRock(bp, nd, bp._rockSeedBase),
                dice: () =>
                    this._workshopRegrowRock(bp, bp._rockRecipe || cur, (this._bauSame("wuerfel:fels") % 1e8) + 1),
                reset: () => this._workshopRegrowRock(bp, null, null),
            };
        }
        // crystal
        const first = bp.parts.find((p) => p && p.shape === "crystalPoint") || {};
        const cur = bp._crystalRecipe || {
            facets: Number.isFinite(first.facets) ? first.facets : 6,
            termFrac: Number.isFinite(first.termFrac) ? first.termFrac : 0.32,
        };
        return {
            cur: Object.assign({}, cur),
            dials: [
                { key: "facets", label: "Facetten", min: 3, max: 12, step: 1, hint: "Prisma-Seiten (Quarz = 6)" },
                {
                    key: "termFrac",
                    label: "Spitze",
                    min: 0.05,
                    max: 0.9,
                    step: 0.01,
                    hint: "kurze ↔ lange Termination",
                },
            ],
            apply: (nd) => this._workshopRegrowCrystal(bp, nd, bp._crystalSeedBase),
            dice: () =>
                this._workshopRegrowCrystal(
                    bp,
                    bp._crystalRecipe || cur,
                    (this._bauSame("wuerfel:kristall") % 1e8) + 1
                ),
            reset: () => this._workshopRegrowCrystal(bp, null, null),
        };
    }

    // Cache leeren + Vorschau neu bauen (KEIN Panel-Neubau → der Slider-Drag behält seinen Fokus).
    _workshopInvalidateAndRebuild(bp) {
        if (this.state.archFlattenCache && this.state.archFlattenCache.delete)
            this.state.archFlattenCache.delete(bp.name);
        if (this.state.archMergedGeomCache && this.state.archMergedGeomCache.delete)
            this.state.archMergedGeomCache.delete(bp.name);
        if (typeof this._workshopRebuildPreviewMesh === "function") this._workshopRebuildPreviewMesh();
    }

    // BAUM-Regrow: die Dials + Same durch die EINE Pipeline (`_growTreeBlueprintRich` → treeParams →
    // growSkeleton) → neue parts + skeleton in den Bauplan schreiben + Vorschau neu bauen.
    _workshopRegrowRecipe(bp, dials, seedStr) {
        const species = bp && bp._grownSpecies;
        if (!species || !this._phytoArt(species)) return;
        const lod = Number.isFinite(bp._recipeLod) ? bp._recipeLod : 0;
        let parts = null;
        try {
            parts = this._growTreeBlueprintRich(species, seedStr, { recipeDials: dials, lod });
        } catch (e) {
            if (typeof this.log === "function") this.log("Rezept-Regrow fehlgeschlagen: " + (e && e.message), "WARN");
            return;
        }
        if (!Array.isArray(parts) || parts.length < 2) return;
        const skeleton =
            this._lastTreeSkeleton && Array.isArray(this._lastTreeSkeleton.branches) ? this._lastTreeSkeleton : null;
        this._lastTreeSkeleton = null;
        bp.parts = parts;
        bp._skeleton = skeleton;
        bp._recipeDials = dials;
        bp._grownSeed = seedStr;
        this._workshopInvalidateAndRebuild(bp);
    }

    // FELS-Regrow: schreibt die Geologie-Dials + Same als Override auf JEDE noiserock-Part (die
    // geteilte `buildBoulderGeometry` liest sie). null = Reset (Overrides entfernen → haerte-Default).
    _workshopRegrowRock(bp, dials, seedBase) {
        if (!bp || !Array.isArray(bp.parts)) return;
        const reset = !dials;
        const lod = Number.isFinite(bp._recipeLod) ? bp._recipeLod : 0;
        let idx = 0;
        for (const p of bp.parts) {
            if (!p || p.shape !== "noiserock") continue;
            if (reset) {
                delete p.rockDials;
                delete p.rockSeed;
                delete p.rockLod;
            } else {
                p.rockDials = { round: dials.round, rough: dials.rough, elong: dials.elong, strat: dials.strat };
                if (Number.isFinite(seedBase)) p.rockSeed = (seedBase + idx * 7919) >>> 0;
                p.rockLod = lod;
            }
            idx++;
        }
        if (reset) {
            delete bp._rockRecipe;
            delete bp._rockSeedBase;
        } else {
            bp._rockRecipe = Object.assign({}, dials);
            if (Number.isFinite(seedBase)) bp._rockSeedBase = seedBase;
        }
        this._workshopInvalidateAndRebuild(bp);
    }

    // KRISTALL-Regrow: schreibt Facetten/Termination auf JEDE crystalPoint-Part (die geteilte
    // `buildCrystalPointGeometry` liest sie schon). Der Same jittert je Part → ein Kristall-CLUSTER
    // variiert (nicht alle identisch). null = Reset (die beim ersten Edit gesicherten Originale).
    _workshopRegrowCrystal(bp, dials, seedBase) {
        if (!bp || !Array.isArray(bp.parts)) return;
        if (!dials) {
            if (bp._crystalOrig) {
                let i = 0;
                for (const p of bp.parts) {
                    if (!p || p.shape !== "crystalPoint") continue;
                    const o = bp._crystalOrig[i++];
                    if (o) {
                        p.facets = o.facets;
                        p.termFrac = o.termFrac;
                    }
                }
            }
            delete bp._crystalRecipe;
            delete bp._crystalSeedBase;
            this._workshopInvalidateAndRebuild(bp);
            return;
        }
        if (!bp._crystalOrig) {
            bp._crystalOrig = bp.parts
                .filter((p) => p && p.shape === "crystalPoint")
                .map((p) => ({ facets: p.facets, termFrac: p.termFrac }));
        }
        let idx = 0;
        for (const p of bp.parts) {
            if (!p || p.shape !== "crystalPoint") continue;
            let fac = Math.round(dials.facets),
                term = dials.termFrac;
            if (Number.isFinite(seedBase)) {
                const h = (seedBase + idx * 2654435761) >>> 0;
                fac = Math.max(3, Math.min(12, Math.round(dials.facets) + ((h % 3) - 1)));
                term = Math.max(0.05, Math.min(0.9, dials.termFrac + (((h >>> 8) % 100) / 100 - 0.5) * 0.2));
            }
            p.facets = fac;
            p.termFrac = term;
            idx++;
        }
        bp._crystalRecipe = { facets: Math.round(dials.facets), termFrac: dials.termFrac };
        if (Number.isFinite(seedBase)) bp._crystalSeedBase = seedBase;
        this._workshopInvalidateAndRebuild(bp);
    }

    // V8.03 — Material-Drop: identifiziert den getroffenen Part via Raycaster
    // und wechselt sein Material (+ rekonsistente Farbe).
    _workshopHandleMaterialDrop(material, clientX, clientY) {
        const ws = this._ensureWorkshopState();
        const bp = this.state.blueprints[ws.selectedBlueprint];
        if (!bp || bp.builtIn) return;
        if (!this.state.materials[material]) {
            this.log(`Workshop-MaterialDrop: unbekanntes Material '${material}'`, "INFO");
            return;
        }
        const idx = this._workshopRaycastPartIdxAt(clientX, clientY);
        if (idx === null) {
            this.log("Workshop-MaterialDrop: kein Part getroffen — drop direkt auf einen Part", "INFO");
            return;
        }
        this.updatePartInBlueprint(bp.name, idx, { material, recolor: true });
        // §7.1 (V18.164) — AUTO-Verbindungen folgen der Substanz: ein Material-
        // Wechsel kann den argmax-Typ kippen (Holz→Eisen: Binden → Schweißen).
        // prevTouches = aktueller Kontakt → keine Neu-Anlage, nur Typ-Nachführung.
        this._workshopLogAutoConnect(this._workshopAutoConnect(bp, idx, this._workshopTouchesOf(bp, idx)));
        this._renderWorkshopDOM();
        this._workshopSetSelection(idx);
        this.log(`Workshop: Material '${material}' auf Part ${idx} gesetzt`, "INFO");
    }

    // V8.03 — Color-Drop: wechselt Farbe des getroffenen Parts (Material bleibt).
    _workshopHandleColorDrop(hexString, clientX, clientY) {
        const ws = this._ensureWorkshopState();
        const bp = this.state.blueprints[ws.selectedBlueprint];
        if (!bp || bp.builtIn) return;
        const colorNum = parseInt(hexString, 16);
        if (!Number.isFinite(colorNum)) return;
        const idx = this._workshopRaycastPartIdxAt(clientX, clientY);
        if (idx === null) {
            this.log("Workshop-ColorDrop: kein Part getroffen — drop direkt auf einen Part", "INFO");
            return;
        }
        this.updatePartInBlueprint(bp.name, idx, { color: colorNum });
        this._renderWorkshopDOM();
        this._workshopSetSelection(idx);
        this.log(`Workshop: Farbe #${hexString} auf Part ${idx} gesetzt`, "INFO");
    }

    // Helper: Welche Part-Idx liegt unter dem Cursor (oder null)?
    _workshopRaycastPartIdxAt(clientX, clientY) {
        const ws = this._ensureWorkshopState();
        if (!ws.preview || !ws.preview.currentMesh) return null;
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
        if (meshes.length === 0) return null;
        const hits = p.raycaster.intersectObjects(meshes, false);
        if (hits.length === 0) return null;
        const idx = p.partMeshes.get(hits[0].object);
        return typeof idx === "number" ? idx : null;
    }

    // Drop-Handler: berechnet Welt-Position aus Bildschirm-Koordinaten via
    // Raycaster gegen eine y=0-Ebene (oder y=0.5 bei snap), fügt einen
    // neuen Part am Bauplan an + selektiert ihn automatisch.
    _workshopHandleShapeDrop(shape) {
        const ws = this._ensureWorkshopState();
        const bp = this.state.blueprints[ws.selectedBlueprint];
        if (!bp || bp.builtIn) {
            this.log("Workshop-Drop auf Built-in-Bauplan abgelehnt — bitte erst klonen", "INFO");
            return;
        }
        // Neue Parts landen IMMER im Ursprung (0,0,0) — ein Raycast der Drop-Koordinate landete bei
        // schräger Kamera unvorhersehbar; vom Ursprung verschiebt der Move-Manipulator kontrolliert.
        const dropPos = { x: 0, y: 0, z: 0 };
        // Default-Material: erstes existing Material auf bp (für Konsistenz),
        // fallback "stein".
        let mat = "stein";
        if (bp.parts && bp.parts.length > 0 && bp.parts[0].material) {
            mat = bp.parts[0].material;
        }
        const matColor = (this.state.materials[mat] || {}).color || 0x888888;
        const newPart = {
            shape,
            material: mat,
            color: matColor,
            position: dropPos,
            rotation: { x: 0, y: 0, z: 0 },
            size: { x: 1, y: 1, z: 1 },
        };
        this.addPartToBlueprint(bp.name, newPart);
        const newIdx = bp.parts.length - 1;
        // Ein neues Part in Kontakt (der Ursprung überlappt meist das erste) ist sofort verbunden;
        // weggezogen löst sich die Auto-Verbindung, am Zielort entsteht die neue.
        this._workshopLogAutoConnect(this._workshopAutoConnect(bp, newIdx, new Set()));
        // UI refresh + neuen Part auto-selektieren
        this._renderWorkshopDOM();
        this._workshopSetSelection(newIdx);
        this.log(
            `Workshop: ${shape}-Part hinzugefügt bei (${dropPos.x.toFixed(2)}, ${dropPos.y.toFixed(2)}, ${dropPos.z.toFixed(2)})`,
            "INFO"
        );
    }

    // === Klick-Klick-Connection-Erzeugung ===
    // Connect-Modus: erster Klick = Source, zweiter = Target → Popover mit den Connection-Types; die
    // Wahl schreibt `bp.connections.push({type, partA, partB})`. ESC bricht ab.

    // Behandelt einen Klick im Canvas wenn Modus "connect" ist.
    // Wird aus _workshopRaycastSelection aufgerufen (Connect-Pfad hat
    // Vorrang über Selection-Update).
    _workshopHandleConnectClick(partIdx) {
        const ws = this._ensureWorkshopState();
        const bp = this.state.blueprints[ws.selectedBlueprint];
        if (!bp || bp.builtIn) return;
        if (partIdx === null || partIdx < 0 || partIdx >= bp.parts.length) {
            // Klick ins Leere → Connect-Geste zurücksetzen + Popover schließen
            ws.connectFirstPartIdx = null;
            this._workshopCloseConnectPopover();
            this._workshopSetSelection(null);
            return;
        }
        if (ws.connectFirstPartIdx === null) {
            // Erster Klick: Source merken + visuelles Highlight via Selection
            ws.connectFirstPartIdx = partIdx;
            this._workshopSetSelection(partIdx);
            return;
        }
        if (ws.connectFirstPartIdx === partIdx) {
            // Selber Part nochmal geklickt → Geste zurücksetzen
            ws.connectFirstPartIdx = null;
            this._workshopSetSelection(null);
            return;
        }
        // Zweiter Klick auf ein anderes Part: existiert schon eine Verbindung A↔B → LÖSEN (Toggle). V17.91 —
        // das Entfernen wandert aus dem entfernten Editor-Listen-✕ ins 3D: zwei verbundene Parts erneut
        // anklicken löst die Verbindung. Sonst das Type-Popover zum ANLEGEN öffnen (wie gehabt).
        const a = ws.connectFirstPartIdx;
        const existingIdx = (bp.connections || []).findIndex(
            (c) => (c.partA === a && c.partB === partIdx) || (c.partA === partIdx && c.partB === a)
        );
        // Der Dialog öffnet IMMER (auch auf verbundenen Parts); „✂ Lösen“ ist eine sichtbare Kachel darin
        // — ein stiller Sofort-Löse-Toggle machte die Anker-Kacheln unerreichbar.
        this._workshopOpenConnectPopover(a, partIdx, existingIdx);
    }

    // SUBSTANZ-VORSCHLAG: argmax über computeConnectionStrength (typeStrength × strongTags-Resonanz
    // beider Materialien × Kontakt) — die Stärke-Funktion IST die Tabelle, kein zweites Mapping
    // (Eisen+Eisen → Schweißen, Holz+Holz → Binden). Liefert auch ALLE Stärken (Balken je Kachel).
    _suggestConnectionType(bp, partA, partB) {
        const types = AnazhRealm.CONNECTION_TYPES;
        const strengths = {};
        let best = null;
        let bestS = -Infinity;
        for (const typeName of Object.keys(types)) {
            if (types[typeName].attachment) continue;
            const s = this.computeConnectionStrength({ type: typeName, partA, partB }, bp);
            strengths[typeName] = s;
            if (s > bestS) {
                bestS = s;
                best = typeName;
            }
        }
        return { type: best, strength: bestS, strengths };
    }

    // Struktur-Typen nach Substanz-Stärke geordnet (die _suggestConnectionType-strengths, keine zweite
    // Wahrheit): die `prim` stärksten (default 3) prominent, der Rest hinter „weitere…“.
    _connectionTypesByStrength(bp, partA, partB, prim = 3) {
        const sug = this._suggestConnectionType(bp, partA, partB);
        const ordered = Object.keys(sug.strengths).sort((u, v) => sug.strengths[v] - sug.strengths[u]);
        return {
            primary: ordered.slice(0, prim),
            more: ordered.slice(prim),
            strengths: sug.strengths,
            suggested: sug.type,
        };
    }

    // LEHR-SATZ eines Gelenks: computeMotionRoles ({role, axis}) in Menschen-Sprache — EINE Quelle für
    // Dialog-Hinweis UND Achsen-Label im Viewer. Pure (headless-testbar).
    _jointTeachLine(role, axis) {
        const achse = axis === "x" ? "Querachse" : axis === "z" ? "Längsachse" : "Hochachse";
        switch (role) {
            case "rad":
                return `Rad — rollt um die ${achse}`;
            case "tuer":
                return "Tür — schwenkt um die Hochachse am Anker";
            case "wirbel":
                return "Wirbel-Glied — schlängelt in der Kette";
            case "scharnier":
                return `Scharnier — schwingt am Anker um die ${achse}`;
            case "bein":
                return "Bein — schreitet im Takt";
            case "arm":
                return "Arm — schwingt gegen die Beine";
            case "segel":
                return "Segel — bläht sich im Wind";
            default:
                return null;
        }
    }

    // Welche Parts BERÜHRT dieses? Die EINE Kontakt-Wahrheit (_partsContactArea > 0, wie die Lastformel):
    // bündiges Sitzen (gap ≤ TOUCH) zählt, ein bloßer Ecken-Punkt (Fläche 0) nicht.
    _workshopTouchesOf(bp, partIdx) {
        const touches = new Set();
        const parts = (bp && bp.parts) || [];
        const part = parts[partIdx];
        if (!part) return touches;
        for (let j = 0; j < parts.length; j++) {
            if (j === partIdx) continue;
            if (this._partsContactArea(part, parts[j]) > 0) touches.add(j);
        }
        return touches;
    }

    // AUTO-VERBINDUNG beim Platzieren/Verschieben (Berühren = verbunden): Typ = _suggestConnectionType-
    // argmax (Material-Paar). Nur ÜBERGÄNGE zählen: neu-berührt → verbinden · getrennt → NUR auto-
    // geborene lösen (bewusste Kachel-Wahl bleibt) · ruhender Kontakt unangetastet („✂ Lösen“ gilt).
    // Eine Auto-Verbindung wandert beim Material-Wechsel auf den neuen argmax (Kontakt ist ein gemeinsamer
    // Faktor aller Typen). Rückgabe {created, removed, retyped} für den EINEN Log-Satz des Aufrufers.
    _workshopAutoConnect(bp, partIdx, prevTouches) {
        const out = { created: [], removed: [], retyped: [] };
        if (!bp || bp.builtIn || !Array.isArray(bp.parts) || !bp.parts[partIdx]) return out;
        if (!Array.isArray(bp.connections)) bp.connections = [];
        const touching = this._workshopTouchesOf(bp, partIdx);
        const unconnected = new Set(touching);
        // (1) Bestehende Paar-Verbindungen dieses Parts: getrennte AUTO lösen,
        // berührte AUTO dem Substanz-argmax nachführen (Anker partB=-1 bleiben
        // außen — sie sind Punkte zur Außenwelt, keine Paare).
        for (let i = bp.connections.length - 1; i >= 0; i--) {
            const c = bp.connections[i];
            if (!c) continue;
            const def = AnazhRealm.CONNECTION_TYPES[c.type];
            if (def && def.attachment) continue;
            const other = c.partA === partIdx ? c.partB : c.partB === partIdx ? c.partA : null;
            if (other === null || other < 0) continue;
            if (touching.has(other)) {
                unconnected.delete(other); // Paar trägt schon — kein Neu-Anlegen
                if (c.auto) {
                    const sug = this._suggestConnectionType(bp, c.partA, c.partB);
                    if (sug.type && sug.type !== c.type) {
                        out.retyped.push({ other, from: c.type, to: sug.type });
                        c.type = sug.type;
                    }
                }
            } else if (c.auto) {
                bp.connections.splice(i, 1);
                out.removed.push(other);
            }
        }
        // (2) NEU in Kontakt getretene Paare verbinden (Transition, nicht Zustand).
        for (const j of unconnected) {
            if (prevTouches && prevTouches.has(j)) continue; // ruhender Kontakt: Lösen geehrt
            if (bp.connections.length >= AnazhRealm.CONNECTION_MAX_PER_BLUEPRINT) break;
            const sug = this._suggestConnectionType(bp, partIdx, j);
            if (!sug.type || !(sug.strength > 0)) continue;
            bp.connections.push({ type: sug.type, partA: partIdx, partB: j, auto: 1 });
            out.created.push({ other: j, type: sug.type });
        }
        return out;
    }

    // §7.1 — der EINE Log-Satz einer Auto-Verbindungs-Geste (leise: nur wenn
    // etwas geschah; der Spieler lernt das Substrat ohne Textwand).
    _workshopLogAutoConnect(result) {
        if (!result) return;
        const label = (t) => {
            const def = AnazhRealm.CONNECTION_TYPES[t];
            return def ? (def.label || t).split(" (")[0] : t;
        };
        const parts = [];
        if (result.created.length) {
            parts.push(`⚡ verbunden: ${result.created.map((c) => `${label(c.type)} ↔ Part ${c.other}`).join(" · ")}`);
        }
        if (result.retyped.length) {
            parts.push(`Typ folgt der Substanz: ${result.retyped.map((r) => label(r.to)).join(" · ")}`);
        }
        if (result.removed.length) {
            parts.push(`getrennt → gelöst: Part ${result.removed.join(", ")}`);
        }
        if (parts.length) {
            this.log(`Auto-Verbindung — ${parts.join(" — ")} (Kachel-Dialog ändert/löst).`, "INFO");
        }
    }

    // Connection-Popover: ZWEI Gruppen Glyph-Kacheln — „VERBINDEN“ (Struktur-Typen: Glyph + Kurzwort +
    // echte Substanz-Stärke als Balken, die stärkste leuchtet) und „ANKER“ (Griff/Sitz/Trage — Klick
    // startet den Face-Snap-Pick). Hover = Detail (title); Klick schreibt die Connection + UI-Refresh.
    _workshopOpenConnectPopover(partA, partB, existingIdx = -1) {
        if (typeof document === "undefined") return;
        this._workshopCloseConnectPopover(); // idempotent
        const ws = this._ensureWorkshopState();
        const canvas = document.getElementById("workshop-preview-canvas");
        if (!canvas) return;
        const wrapper = document.getElementById("workshop-preview-wrapper");
        if (!wrapper) return;
        const bp = this.state.blueprints[ws.selectedBlueprint];
        const overlay = document.createElement("div");
        overlay.id = "workshop-connect-overlay";
        const title = document.createElement("div");
        title.className = "conn-title";
        const existing = existingIdx >= 0 && bp && bp.connections ? bp.connections[existingIdx] : null;
        const existingDef = existing && AnazhRealm.CONNECTION_TYPES[existing.type];
        title.textContent = existing
            ? `Part ${partA} ↔ ${partB} — verbunden: ${existingDef ? existingDef.label.split(" (")[0] : existing.type}` +
              // §7.1 — auto-geboren sichtbar: eine Kachel-Wahl macht sie BEWUSST
              // (bleibt dann auch bei Trennung + darf Tür/Wirbel-Gelenke gebären).
              (existing.auto ? " (auto — aus Berührung)" : "")
            : `Verbindung: Part ${partA} → Part ${partB}`;
        overlay.appendChild(title);
        const types = AnazhRealm.CONNECTION_TYPES;
        const suggestion = bp ? this._suggestConnectionType(bp, partA, partB) : null;
        const shortLabel = (def) => (def.label || "").split(" (")[0];
        const mkGroup = (labelText) => {
            const lab = document.createElement("div");
            lab.className = "conn-group-label";
            lab.textContent = labelText;
            overlay.appendChild(lab);
            const grid = document.createElement("div");
            grid.className = "conn-grid";
            overlay.appendChild(grid);
            return grid;
        };
        // Gruppe 1 — VERBINDEN: Kacheln nach Substanz-Stärke geordnet, die `prim` stärksten prominent,
        // der Rest hinter „weitere…“.
        const connectGrid = mkGroup("Verbinden — wie die Teile halten");
        const ranked = bp
            ? this._connectionTypesByStrength(bp, partA, partB)
            : { primary: [], more: [], strengths: {} };
        const mkTile = (typeName) => {
            const def = types[typeName];
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "conn-tile";
            btn.setAttribute("data-conn-type", typeName);
            const s = suggestion ? suggestion.strengths[typeName] || 0 : 0;
            if (suggestion && typeName === suggestion.type && suggestion.strength > 0) {
                btn.classList.add("suggested");
                btn.setAttribute("data-suggested", "1");
            }
            const glyph = document.createElement("span");
            glyph.className = "conn-glyph";
            glyph.textContent = def.glyph || "·";
            const name = document.createElement("span");
            name.className = "conn-name";
            name.textContent = shortLabel(def);
            const bar = document.createElement("span");
            bar.className = "conn-strength";
            const fill = document.createElement("span");
            fill.className = "conn-strength-fill";
            fill.style.width = `${Math.round(Math.max(0, Math.min(1, s / 3)) * 100)}%`;
            bar.appendChild(fill);
            btn.appendChild(glyph);
            btn.appendChild(name);
            btn.appendChild(bar);
            btn.title =
                `${def.label} — ${def.description}\n` +
                `Substanz-Stärke dieses Paars: ${s.toFixed(2)} / 3` +
                (def.strongTags.length ? ` · stark in: ${def.strongTags.join(", ")}` : "") +
                (suggestion && typeName === suggestion.type ? "\n✓ passt zur Substanz (Vorschlag)" : "");
            btn.addEventListener("click", () => {
                this._workshopApplyConnection(partA, partB, typeName);
            });
            return btn;
        };
        for (const typeName of ranked.primary) connectGrid.appendChild(mkTile(typeName));
        if (ranked.more.length) {
            const moreGrid = document.createElement("div");
            // NUR `conn-more-grid` (kein `conn-grid`) — ein SUB-Grid der
            // Verbinden-Gruppe, kein dritter Top-Level-Block; die `.conn-grid`-
            // Zählung (2 Gruppen) bleibt unberührt (V9.56-i).
            moreGrid.className = "conn-more-grid";
            moreGrid.hidden = true;
            const moreBtn = document.createElement("button");
            moreBtn.type = "button";
            moreBtn.className = "conn-more-toggle";
            moreBtn.textContent = `weitere… (${ranked.more.length})`;
            moreBtn.setAttribute("aria-expanded", "false");
            moreBtn.addEventListener("click", () => {
                moreGrid.hidden = !moreGrid.hidden;
                moreBtn.setAttribute("aria-expanded", moreGrid.hidden ? "false" : "true");
                moreBtn.textContent = moreGrid.hidden ? `weitere… (${ranked.more.length})` : "weniger…";
            });
            for (const typeName of ranked.more) moreGrid.appendChild(mkTile(typeName));
            connectGrid.appendChild(moreBtn);
            overlay.appendChild(moreGrid);
        }
        // LEHR-SATZ: welches Gelenk diese Verbindung gebiert + wie es sich dreht (computeMotionRoles,
        // EINE Quelle mit den Achsen-Geistern im Viewer). Nur wenn ein Gelenk emergiert.
        if (bp && Array.isArray(bp.parts)) {
            try {
                const probe = {
                    ...bp,
                    connections: [...(bp.connections || []), { type: suggestion && suggestion.type, partA, partB }],
                };
                const roles = this.computeMotionRoles(probe.parts, probe.connections);
                const movIdx = roles ? roles.findIndex((r, i) => r && r.joint && (i === partA || i === partB)) : -1;
                const teach = movIdx >= 0 ? this._jointTeachLine(roles[movIdx].role, roles[movIdx].axis) : null;
                if (teach) {
                    const tline = document.createElement("div");
                    tline.className = "conn-teach";
                    tline.textContent = `⚙ ${teach}`;
                    overlay.appendChild(tline);
                }
            } catch (_e) {
                /* Lehr-Satz ist Beigabe — nie ein Dialog-Bruch */
            }
        }
        // Gruppe 2 — ANKER (Punkte für die Außenwelt): Klick startet den Face-Snap.
        const anchorGrid = mkGroup("Anker — Punkt für die Außenwelt (Fläche wählen)");
        for (const typeName of Object.keys(types)) {
            const def = types[typeName];
            if (!def.attachment) continue;
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "conn-tile conn-anchor";
            btn.setAttribute("data-conn-type", typeName);
            const glyph = document.createElement("span");
            glyph.className = "conn-glyph";
            glyph.textContent = def.glyph || "·";
            const name = document.createElement("span");
            name.className = "conn-name";
            name.textContent = shortLabel(def);
            btn.appendChild(glyph);
            btn.appendChild(name);
            btn.title = `${def.label} — ${def.description}\nKlick, dann die STELLE auf Part ${partA} wählen — der Punkt rastet auf Mitte/Kante/Ecke.`;
            btn.addEventListener("click", () => {
                this._workshopBeginAnchorPick(typeName, partA);
            });
            anchorGrid.appendChild(btn);
        }
        // NUTZER-BLICK (V18.162) — „✂ Lösen" als SICHTBARE Kachel (statt des
        // stillen Sofort-Toggles): nur wenn die Parts schon verbunden sind.
        if (existing) {
            const loese = document.createElement("button");
            loese.type = "button";
            loese.className = "conn-tile conn-loesen";
            loese.setAttribute("data-conn-type", "__loesen");
            const lg = document.createElement("span");
            lg.className = "conn-glyph";
            lg.textContent = "✂";
            const ln = document.createElement("span");
            ln.className = "conn-name";
            ln.textContent = "Lösen";
            loese.appendChild(lg);
            loese.appendChild(ln);
            loese.title = "Die bestehende Verbindung zwischen diesen Parts trennen.";
            loese.addEventListener("click", () => {
                this.removeConnectionFromBlueprint(bp.name, existingIdx);
                ws.connectFirstPartIdx = null;
                this._workshopCloseConnectPopover();
                this._workshopSetSelection(null);
                this._renderWorkshopDOM();
                this.log(`Verbindung Part ${partA} ↔ ${partB} gelöst.`, "INFO");
            });
            overlay.appendChild(loese);
        }
        const cancelBtn = document.createElement("button");
        cancelBtn.type = "button";
        cancelBtn.className = "cancel";
        cancelBtn.textContent = "Abbrechen (ESC)";
        cancelBtn.addEventListener("click", () => {
            ws.connectFirstPartIdx = null;
            this._workshopCloseConnectPopover();
            this._workshopSetSelection(null);
        });
        overlay.appendChild(cancelBtn);
        // Position: zentriert über dem Canvas
        wrapper.style.position = "relative";
        wrapper.appendChild(overlay);
        // Center berechnen relativ zum Wrapper
        const cRect = canvas.getBoundingClientRect();
        const wRect = wrapper.getBoundingClientRect();
        const top = cRect.top - wRect.top + cRect.height / 2 - overlay.offsetHeight / 2;
        const left = cRect.left - wRect.left + cRect.width / 2 - overlay.offsetWidth / 2;
        overlay.style.top = `${Math.max(8, top)}px`;
        overlay.style.left = `${Math.max(8, left)}px`;
    }

    _workshopCloseConnectPopover() {
        if (typeof document === "undefined") return;
        const overlay = document.getElementById("workshop-connect-overlay");
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }

    // ANKER-FACE-PICK: die Anker-Kachel startet den Modus, der NÄCHSTE Klick auf einen Part wählt die
    // Stelle; sie rastet 3×3 je Fläche (_workshopSnapAnchor).
    _workshopBeginAnchorPick(typeName, partIdx) {
        const ws = this._ensureWorkshopState();
        ws.anchorPick = { type: typeName, partIdx };
        ws.connectFirstPartIdx = null;
        this._workshopCloseConnectPopover();
        const def = AnazhRealm.CONNECTION_TYPES[typeName];
        this.log(
            `Anker „${(def && def.label) || typeName}": klicke die STELLE auf dem gewünschten Part — der Punkt rastet auf Mitte/Kante/Ecke. (Klick ins Leere bricht ab.)`,
            "INFO"
        );
    }

    // Face-Pick-Klick: Hit aus _workshopRaycastSelection (kein zweiter Raycast), snappen, schreiben:
    // {type, partA, partB:-1, anchor}; anchor ist BAUPLAN-lokal relativ zum Part-ZENTRUM (so liest
    // ihn _attachPointFor direkt).
    _workshopHandleAnchorPick(hit, hitIdx) {
        const ws = this._ensureWorkshopState();
        const pick = ws.anchorPick;
        ws.anchorPick = null;
        const bp = this.state.blueprints[ws.selectedBlueprint];
        if (!pick || !bp || bp.builtIn) return;
        // Der Pick-Klick IST die Wahl: der Anker landet auf dem geklickten Part, nicht auf dem Dialog-partA.
        if (!hit || hitIdx === null || hitIdx === undefined || !bp.parts[hitIdx]) {
            this.log("Anker: kein Part getroffen — abgebrochen.", "INFO");
            this._workshopSetSelection(null);
            return;
        }
        pick.partIdx = hitIdx;
        const part = bp.parts[pick.partIdx];
        if (!part) return;
        // Welt → COMPOUND-lokal (worldToLocal des Compound-Group nimmt alle
        // Preview-Transforms heraus), minus Part-Zentrum = der rohe Anker.
        const root = ws.preview && ws.preview.currentMesh;
        const local = root ? root.worldToLocal(hit.point.clone()) : hit.point.clone();
        const pos = part.position || { x: 0, y: 0, z: 0 };
        const raw = { x: local.x - (pos.x || 0), y: local.y - (pos.y || 0), z: local.z - (pos.z || 0) };
        const anchor = this._workshopSnapAnchor(raw, part.size || {});
        if (!Array.isArray(bp.connections)) bp.connections = [];
        // EIN Anker pro Typ+Part (ein zweiter Pick ersetzt den alten Punkt).
        bp.connections = bp.connections.filter((c) => !(c && c.type === pick.type && c.partA === pick.partIdx));
        bp.connections.push({ type: pick.type, partA: pick.partIdx, partB: -1, anchor });
        this.log(
            `Anker „${pick.type}" auf Part ${pick.partIdx} gesetzt: (${anchor.x.toFixed(2)}, ${anchor.y.toFixed(2)}, ${anchor.z.toFixed(2)}) — gerastet.`,
            "INFO"
        );
        this._workshopSetSelection(null);
        this._renderWorkshopDOM();
    }

    // 3×3-FACE-SNAP (pure): die dominante Achse des rohen Punkts (relativ zu den Halb-Ausdehnungen) ist
    // die Flächen-Normale → auf ±half; die zwei Tangenten rasten auf {−half, 0, +half}
    // (Mitte · Kanten-Mitte · Ecke = 9 Punkte je Fläche).
    _workshopSnapAnchor(raw, size) {
        const hx = Math.abs(Number(size.x) || 0.3) / 2;
        const hy = Math.abs(Number(size.y) || 0.3) / 2;
        const hz = Math.abs(Number(size.z) || 0.3) / 2;
        const rx = Math.abs(raw.x) / Math.max(1e-4, hx);
        const ry = Math.abs(raw.y) / Math.max(1e-4, hy);
        const rz = Math.abs(raw.z) / Math.max(1e-4, hz);
        const snapT = (v, half) => (v > half * 0.34 ? half : v < -half * 0.34 ? -half : 0);
        const r3 = (v) => Math.round(v * 1e3) / 1e3;
        let a;
        if (rx >= ry && rx >= rz) {
            a = { x: Math.sign(raw.x || 1) * hx, y: snapT(raw.y, hy), z: snapT(raw.z, hz) };
        } else if (ry >= rx && ry >= rz) {
            a = { x: snapT(raw.x, hx), y: Math.sign(raw.y || 1) * hy, z: snapT(raw.z, hz) };
        } else {
            a = { x: snapT(raw.x, hx), y: snapT(raw.y, hy), z: Math.sign(raw.z || 1) * hz };
        }
        return { x: r3(a.x), y: r3(a.y), z: r3(a.z) };
    }

    // Schreibt die Connection ins Blueprint + UI-Refresh + Reset.
    _workshopApplyConnection(partA, partB, typeName) {
        const ws = this._ensureWorkshopState();
        const bp = this.state.blueprints[ws.selectedBlueprint];
        if (!bp || bp.builtIn) return;
        if (!AnazhRealm.CONNECTION_TYPES[typeName]) return;
        if (!Array.isArray(bp.connections)) bp.connections = [];
        // NUTZER-BLICK (V18.162) — EIN Paar trägt EINE Verbindung: ein Kachel-
        // Klick auf schon verbundene Parts ERSETZT den Typ (vorher: stiller
        // Skip bei gleichem Typ + stille DOPPEL-Verbindung bei anderem Typ).
        const oldIdx = bp.connections.findIndex(
            (c) => (c.partA === partA && c.partB === partB) || (c.partA === partB && c.partB === partA)
        );
        if (oldIdx >= 0) bp.connections.splice(oldIdx, 1);
        bp.connections.push({ type: typeName, partA, partB });
        this.log(`Workshop: Verbindung ${typeName} zwischen Part ${partA} und Part ${partB}`, "INFO");
        ws.connectFirstPartIdx = null;
        this._workshopCloseConnectPopover();
        this._workshopSetSelection(null);
        this._renderWorkshopDOM();
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_werkstatt_bauen]);

// ===== ATLAS · Werkstatt/bauen — Außen-Konstanten =====
// Aktions-Ausdauer: die Kosten der Maus-Arm-Aktion (Hieb/Abbau/Platzieren) aus
// fx.bewegung.aktionAusdauer. Fail-closed (Kern-Pflicht).
AnazhRealm._aktionAusdauer = function () {
    const a = AnazhRealm.Gesetz("koerper:bewegung.aktionAusdauer", null);
    if (Number.isFinite(a)) return a;
    return AnazhRealm._kernPflichtBruch("koerper:bewegung.aktionAusdauer");
};

// Default-Keybindings (Aktion → Code): KeyboardEvent.code (layout-unabhängig, "KeyF"),
// "Mouse0/1/2" für Maus-Buttons; Rebinds persistiert in localStorage "anazh.keybindings".
// WASD und 1-9 bleiben hardcoded.
AnazhRealm.DEFAULT_KEYBINDINGS = Object.freeze({
    break: "Mouse0",
    place: "Mouse2",
    confirmBuild: "KeyF",
    inventory: "Tab",
    cancelBuild: "Escape",
    jump: "Space",
    // Drawer + Camera-Toggle sind rebindbare Aktionen (via _actionForBindingCode). Die Welt ist der
    // Default-Blick — kein drawerWelt.
    drawerKreaturen: "KeyK",
    drawerSpieler: "KeyP",
    drawerWerkstatt: "KeyB",
    drawerEinstellungen: "KeyI",
    cameraToggle: "KeyV",
    // V18.109 — E8: der Hand-Tausch (Minecraft-Geste; F ist confirmBuild → G).
    swapHands: "KeyG",
    // Das Gespräch (Leben-Schau 07.10., L3): Enter öffnet den Chat, Enter im Feld sendet und gibt die Welt zurück.
    chat: "Enter",
});
AnazhRealm.KEYBINDING_ACTIONS = Object.freeze(Object.keys(AnazhRealm.DEFAULT_KEYBINDINGS));

// HARVEST_VOLUME_TO_UNITS — Volumen→Material-Einheiten für harvestArchitecture: k=4 →
// 1×1×1-Box = 4 Einheiten, 0.5³ → 1 (min 1).
// CREATURE_NAME_POOL (unten) — jede Kreatur bekommt beim Spawn einen Namen: Identität hängt am
// Namen, nicht am Index.
AnazhRealm.HARVEST_VOLUME_TO_UNITS = 4;
// Verbindungstypen: je Typ `typeStrength` (Basis-Belastbarkeit 0..1) + `strongTags` (welche
// Material-Eigenschaften tragen — Hafting will härte+dichte, Lashing zähigkeit).
//   strength = typeStrength × avg(strongTags von Material A + B) × min(1, kontaktfläche)
// 0..3-Skala wie die Tag-Strahler; unter ~0.7 ist die Verbindung sichtbar fragil.
AnazhRealm.CONNECTION_TYPES = Object.freeze({
    // V18.110 — C7: intuitive deutsche Labels (S-Befund „die aktuellen
    // Benennungen sind unintuitiv, das Fundament passt") — die KEYS bleiben
    // (Persistenz/DSL), nur die Spieler-Sprache wird klar.
    hafting: Object.freeze({
        glyph: "⊕",
        label: "Stecken (Stiel in Loch)",
        description: "Stiel in Loch — Reibschluss",
        strongTags: Object.freeze(["härte", "dichte"]),
        typeStrength: 0.8,
    }),
    lashing: Object.freeze({
        glyph: "∾",
        label: "Binden (Umwicklung)",
        description: "Umwicklung — Zugfest",
        strongTags: Object.freeze(["zähigkeit"]),
        typeStrength: 0.6,
    }),
    pinning: Object.freeze({
        glyph: "⌖",
        label: "Stiften (Bolzen)",
        description: "Stift durch Loch — Scherung",
        strongTags: Object.freeze(["härte"]),
        typeStrength: 0.75,
    }),
    welding: Object.freeze({
        glyph: "✶",
        label: "Schweißen",
        description: "Atomar verschmolzen",
        strongTags: Object.freeze(["härte", "wärmeleitung"]),
        typeStrength: 0.95,
    }),
    gluing: Object.freeze({
        glyph: "≣",
        label: "Kleben",
        description: "Adhäsion — Schubfest",
        strongTags: Object.freeze(["zähigkeit"]),
        typeStrength: 0.55,
    }),
    masonry: Object.freeze({
        glyph: "⊞",
        label: "Mauern",
        description: "Druckschluss + Mörtel",
        strongTags: Object.freeze(["dichte"]),
        typeStrength: 0.7,
    }),
    sewing: Object.freeze({
        glyph: "✕",
        label: "Nähen",
        description: "Garn durch Material",
        strongTags: Object.freeze(["zähigkeit"]),
        typeStrength: 0.5,
    }),
    magic_bind: Object.freeze({
        glyph: "✦",
        label: "Magisch",
        description: "Tag-Resonanz",
        strongTags: Object.freeze(["magieleitung", "resoniert"]),
        typeStrength: 0.85,
    }),
    // ATTACHMENT-PUNKTE (GRIFF/SITZ/TRAGE): ein Punkt am Bauplan für die Außenwelt (Hand des Trägers,
    // Körper des Reiters, Torso unterm Panzer). partB optional (-1 = nur partA); `attachment: true` hält
    // sie aus der Statik (computeConnectionStrength) und den Gelenken (computeMotionRoles). Ohne
    // expliziten Punkt emergiert er per Form-Resonanz (_attachPointFor); der explizite ist der Override.
    griff: Object.freeze({
        glyph: "⊢",
        label: "Griff (hier greift die Hand)",
        description: "Attachment-Punkt: die Hand des Trägers",
        strongTags: Object.freeze([]),
        typeStrength: 0,
        attachment: true,
    }),
    sitz: Object.freeze({
        glyph: "⊓",
        label: "Sitz (hier sitzt der Reiter)",
        description: "Attachment-Punkt: der Körper des Reiters",
        strongTags: Object.freeze([]),
        typeStrength: 0,
        attachment: true,
    }),
    trage: Object.freeze({
        glyph: "◈",
        label: "Trage (liegt am Körper an)",
        description: "Attachment-Punkt: der Torso unterm Getragenen",
        strongTags: Object.freeze([]),
        typeStrength: 0,
        attachment: true,
    }),
});

// V17.89 — die deutschen Verben der Op-Namen (für das Prozess-Menü + die Werkzeuge-Box). Eine Quelle.
AnazhRealm.OP_VERB_LABELS = Object.freeze({
    hand_knap: "behauen",
    forge_shape: "schmieden",
    brew: "brauen",
    weave: "weben",
    imbue: "beseelen",
    turn: "drehen",
});

// Deutsche Labels für die Welt-Anzeige. Werkstatt-Status zeigt diese
// statt der englischen Rolle-IDs.
AnazhRealm.BLUEPRINT_ROLE_LABELS = Object.freeze({
    architecture: "Bauwerk",
    tool: "Werkzeug",
    armor: "Rüstung",
    weapon: "Waffe",
    consumable: "Konsumable",
    soul: "Seele",
    machine: "Maschine",
    portal: "Portal",
    vehicle: "Fahrzeug", // M2
    "workshop-station": "Werkstatt",
});

// Werkzeug-Domain-Labels (deutsch) für UI-Anzeige. null = generic
// (zeigt keinen Domain-Indikator).
AnazhRealm.TOOL_DOMAIN_LABELS = Object.freeze({
    construction: "Konstruktion",
    forging: "Schmiede",
    alchemy: "Alchemie",
    textile: "Weberei",
    soulwork: "Seelenkunst",
    mechanism: "Mechanik",
});

// Domain-Farben für visuelle Wiedererkennung der Werkstatt-Zugehörigkeit.
AnazhRealm.TOOL_DOMAIN_COLORS = Object.freeze({
    construction: "#9aaeb8", // Stein-Grau-Blau
    forging: "#c44830", // Glut-Rot
    alchemy: "#a878b8", // Magie-Violett
    textile: "#d4b076", // Sand-Beige
    soulwork: "#88e1e1", // Geist-Cyan
    mechanism: "#b08648", // Bronze
});

// Welt-Werkstatt-Radius (m): der Spieler muss so nah an einer Architektur mit passender EMERGENTER
// Domäne stehen (vom Spawn-Punkt des neuen Bauplans), sonst lehnt confirmBuild im pfad-Modus ab.
// 32 m (2 Chunk-Breiten) deckt eine Basis — „in der Nähe" meint das Werkstatt-Areal. Gilt für die
// Prozess-Erkennung UND das Schmiede-Tor.
AnazhRealm.WORKSHOP_PROXIMITY_M = 32;
// V17.90 — die INVERS-dichte Stats (0.8 + (1−dichte)·…): ihr Tag-Input MUSS auf [0,1] gekappt bleiben, sonst
// macht dichte>1 sie negativ. Der Werte-Readout liest sie aus dem tagsLo-Set (die schweren Stats aus tagsHi).
AnazhRealm.INVERSE_DICHTE_STATS = Object.freeze({ attackSpeed: true, speed: true, jumpPower: true, staminaMax: true });
// V17.76 Welle 2 — die Präzisions-Kapazität einer Werkstatt-Station aus ihrer SUBSTANZ (Material × Form):
// base (eine schlichte Werkstatt) + dichte/härte (eine dichte, harte Esse hält feinere Toleranzen), gedeckelt.
// So emergiert „bessere Esse → höherer Cap" aus den Materialien (kein Crafting-Zirkel). Browser-justierbar.
AnazhRealm.WORKSHOP_PRECISION = Object.freeze({
    base: 0.5,
    fromDichte: 0.28,
    fromHärte: 0.2,
    dichteRef: 2.7,
    max: 0.98,
});
// U3 (resonanz-system §5) — die Labels für den Katalysator-Readout (das Rollen-Spektrum + die Achse zum
// perfekten Katalysator). Deutsch, browser-justierbar.
AnazhRealm.ROLE_LABELS = Object.freeze({
    held: "Gerät",
    weapon: "Waffe",
    tool: "Werkzeug",
    brecher: "Brecher",
    armor: "Rüstung",
    consumable: "Trank",
    soul: "Seele",
    portal: "Tor",
    vehicle: "Fahrzeug",
    machine: "Maschine",
    "workshop-station": "Werkstatt",
    architecture: "Bauwerk",
});

// Deutsche Affordance-Labels für UI-Anzeige.
AnazhRealm.AFFORDANCE_LABELS = Object.freeze({
    moveable: "fahrbar",
    magnifying: "vergrößernd",
    focusing: "bündelnd",
    radiating: "strahlend",
    broadcasting: "sendend",
    balancing: "gründend",
    lifting: "hebend",
    sitzbar: "sitzbar",
});

AnazhRealm.WORLD_EFFECT_THRESHOLDS = Object.freeze({
    resonance_mild: 0.7,
    resonance_strong: 1.5,
    resonance_signature: 2.5,
    magic_strong: 1.5,
    precision_high: 0.8,
});
