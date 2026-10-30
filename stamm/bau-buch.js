class AnazhRealm_bau_buch {
    // ===== ATLAS · Bau/buch — Bauplan-Buch · Rollen · Präzision · Verbindungen · CRUD =====
    // Mutations-Pfad für eigene Materialien. Whitelist auf MATERIAL_TAG_KEYS,
    // Werte ge-clamp 0..1, Built-in-Überschreiben verboten, Cap 32 eigene.
    // Aufrufer: DSL-Op `define_material` und ggf. spätere UI.
    defineMaterial(name, color, tags) {
        if (typeof name !== "string" || name.length === 0 || name.length > 40) {
            return { ok: false, reason: "invalid_name" };
        }
        const safe = name.replace(/[^a-z0-9_-]/gi, "").slice(0, 40);
        if (!safe) return { ok: false, reason: "invalid_name_after_sanitize" };
        const existing = this.state.materials && this.state.materials[safe];
        if (existing && existing.builtIn) return { ok: false, reason: "cannot_overwrite_builtin" };
        const customCount = Object.values(this.state.materials || {}).filter((m) => !m.builtIn).length;
        if (!existing && customCount >= 32) return { ok: false, reason: "too_many_custom_materials" };
        if (!tags || typeof tags !== "object") return { ok: false, reason: "tags_not_object" };
        const cleanTags = { ...AnazhRealm.MATERIAL_TAG_DEFAULTS };
        for (const key of AnazhRealm.MATERIAL_TAG_KEYS) {
            const v = Number(tags[key]);
            if (Number.isFinite(v)) cleanTags[key] = Math.max(0, Math.min(1, v));
        }
        const cleanColor = Number.isFinite(color) ? (color | 0) & 0xffffff : 0x888888;
        this.state.materials[safe] = {
            name: safe,
            label: safe,
            builtIn: false,
            color: cleanColor,
            tags: cleanTags,
        };
        if (typeof this._renderWorkshopDOM === "function") this._renderWorkshopDOM();
        return { ok: true, name: safe };
    }

    // Default-opChain für neue Parts. Hand_knap mit cap 0.4 — alles ist am
    // Anfang grob. Spieler hebt das Dach durch weitere Ops (feile, polier).
    _defaultPartOpChain() {
        return [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }];
    }

    // Finale Part-Präzision, Min-Regel-Hybrid: precision = min + (max − min) × decay^N,
    // N = chain.length − 1, decay = PRECISION_DECAY (0.7). Der erste Schlag prägt die Form, Sorgfalt holt
    // nur begrenzt auf; N=0 → precision = min. Verbindungs-Last + Compound-Tags bleiben strikt min/max.
    computePartPrecision(part) {
        if (!part || typeof part !== "object") return 0.4;
        if (!Array.isArray(part.opChain) || part.opChain.length === 0) return 0.4;
        let min = 1;
        let max = 0;
        let count = 0;
        for (const op of part.opChain) {
            const cap = Number(op && op.cap);
            if (!Number.isFinite(cap)) continue;
            if (cap < min) min = cap;
            if (cap > max) max = cap;
            count++;
        }
        if (count === 0) return 0.4;
        if (count === 1 || max <= min) return min;
        const decay = AnazhRealm.PRECISION_DECAY;
        const n = count - 1;
        return min + (max - min) * Math.pow(decay, n);
    }

    // Mittlere Präzision eines Compounds (für Welt-Effekt-Schwellen).
    _compoundAvgPrecision(blueprint) {
        if (!blueprint || !Array.isArray(blueprint.parts) || blueprint.parts.length === 0) return 0;
        let sum = 0;
        for (const p of blueprint.parts) sum += this.computePartPrecision(p);
        return sum / blueprint.parts.length;
    }

    // Mittlere Präzision direkt aus einem Parts-Array (wie _compoundAvgPrecision, ohne Bauplan-Wrapper) —
    // für Soul-bodyParts in computePlayerStats. Trägt kein Part eine opChain, gilt das Compound als
    // „geboren" (1.0); über den Bauplan-Pfad geschmiedete Souls tragen echte min-Werte.
    _compoundAvgPrecisionFromParts(parts) {
        if (!Array.isArray(parts) || parts.length === 0) return 1.0;
        const anyHasChain = parts.some((p) => p && Array.isArray(p.opChain) && p.opChain.length > 0);
        if (!anyHasChain) return 1.0;
        let sum = 0;
        for (const p of parts) sum += this.computePartPrecision(p);
        return sum / parts.length;
    }

    // ROLLE-PASSUNG der FORM für eine GEDIENTE Rolle ∈ [min, max] (1.0 = neutral): Resonanz des
    // Produkt-Vektors (inkl. pointedFraction/dichte/härte) gegen die Rollen-Signatur, normiert über den
    // per-Rolle ref; unbekannte Rolle → 1.0. Der Aufrufer übergibt die GEDIENTE Rolle (Hand→held,
    // Slot→armor, Trinken→consumable), nicht die emergente (eine Klinge klassifiziert als architecture).
    // Wirkung = 0.5 + 0.5·Qualität·RoleFit (Qualität = mittlere Part-Präzision, geboren = 1.0).
    _blueprintRoleFit(bp, role) {
        const sig = AnazhRealm.ROLE_SIGNATURES[role];
        if (!sig || !bp) return 1.0;
        const cfg = AnazhRealm.QUALITY_ROLE_FIT;
        const ref = (cfg.refs && cfg.refs[role]) || 3.0;
        const raw = this._blueprintResonance(this._blueprintProductVector(bp), sig);
        const norm = Math.max(0, Math.min(1, raw / ref));
        return cfg.min + (cfg.max - cfg.min) * norm;
    }

    // U3 (resonanz-system §5) — das ROLLEN-SPEKTRUM: die normierte Resonanz (0–1) des Bauplans gegen ALLE
    // Rollen des Registers, sortiert. Der Spieler SIEHT, was sein Werk IST (Waffe 0.9 · Bauwerk 0.4 · …) über
    // die GANZE Resonanz — kein Rezept, ein Kompass. Die Freiheit: er baut einen Punkt, das Spektrum liest ihn.
    _blueprintRoleSpectrum(bp) {
        const v = this._blueprintProductVector(bp);
        const cfg = AnazhRealm.QUALITY_ROLE_FIT;
        const out = [];
        for (const role in AnazhRealm.ROLE_SIGNATURES) {
            const raw = this._blueprintResonance(v, AnazhRealm.ROLE_SIGNATURES[role]);
            const ref = (cfg.refs && cfg.refs[role]) || 3.0;
            out.push({ role, score: Math.max(0, Math.min(1, raw / ref)) });
        }
        out.sort((a, b) => b.score - a.score);
        return out;
    }

    // U3 — der KATALYSATOR-Hinweis: welche Achse drehen, um die Passung für eine Rolle am meisten zu heben —
    // die positive Signatur-Achse mit dem größten UNGENUTZTEN Potenzial (hohe Gewichtung, aktuell schwach).
    // „mehr Schärfe → bessere Klinge". So lernt + dreht der Spieler die Achsen Richtung perfekten Katalysator.
    _blueprintCatalystHint(bp, role) {
        const sig = AnazhRealm.ROLE_SIGNATURES[role];
        if (!sig) return null;
        const v = this._blueprintProductVector(bp);
        let bestAxis = null;
        let bestGap = 0;
        for (const axis in sig) {
            const w = sig[axis];
            if (w <= 0) continue; // nur positive Achsen (Gegen-Achsen sind kein Katalysator-Ziel)
            const axisMax = AnazhRealm.MATERIAL_TAG_KEYS.includes(axis) ? 3 : 1; // Material-Tags bis ~3, Form-Achsen [0,1]
            const gap = w * (1 - Math.min(1, (v[axis] || 0) / axisMax));
            if (gap > bestGap) {
                bestGap = gap;
                bestAxis = axis;
            }
        }
        return bestAxis ? { axis: bestAxis, label: AnazhRealm.AXIS_LABELS[bestAxis] || bestAxis } : null;
    }

    // WARUM-FÜHRUNG: die kleinste Achsen-Drehung zur WUNSCH-Rolle („+0.3 Standfläche → Fahrzeug").
    // deficit = Sieger-Score − Ziel-Score (_blueprintRoleSpectrum-Skala raw/ref); je positiver Ziel-Achse
    // eff = wT/refT − wS/refS, need = deficit/eff; gewählt wird die machbare Achse mit kleinster Drehung
    // (Produkt-Vektor [0..1], headroom-geprüft). KONJUNKTIONS-Achsen (0/1: rideable/livingBody/
    // portalShape/bodyShape) sind eine TAT → der Hinweis kommt aus AXIS_ACTION_HINTS.
    _blueprintRoleGapHint(bp, targetRole) {
        const sigs = AnazhRealm.ROLE_SIGNATURES;
        const sigT = sigs[targetRole];
        if (!sigT) return null;
        const cfg = AnazhRealm.QUALITY_ROLE_FIT;
        const refFor = (role) => (cfg.refs && cfg.refs[role]) || 3.0;
        const v = this._blueprintProductVector(bp);
        // Ψ1 — der Sieger über das EINE argmax-Organ (raw/ref-Skala via refs+refDefault).
        const win = this._resonateArgmax(v, sigs, { refs: cfg.refs, refDefault: 3.0 });
        const winner = win.key;
        const winScore = win.score;
        if (winner === targetRole) return { already: true, targetRole };
        const sigW = sigs[winner];
        const refT = refFor(targetRole);
        const refW = refFor(winner);
        const deficit = winScore - this._blueprintResonance(v, sigT) / refT;
        const actions = AnazhRealm.AXIS_ACTION_HINTS;
        let best = null;
        for (const axis in sigT) {
            const wT = sigT[axis];
            if (wT <= 0) continue;
            const cur = Math.max(0, Math.min(1, v[axis] || 0));
            const headroom = 1 - cur;
            if (headroom <= 0.02) continue;
            const eff = wT / refT - ((sigW && sigW[axis]) || 0) / refW;
            if (eff <= 0.01) continue;
            const need = deficit / eff;
            if (need > headroom + 1e-9) continue;
            if (!best || need < best.need) best = { axis, need };
        }
        if (!best) return { targetRole, winner, infeasible: true };
        const label = AnazhRealm.AXIS_LABELS[best.axis] || best.axis;
        const roleLabel = AnazhRealm.ROLE_LABELS[targetRole] || targetRole;
        const action = actions[best.axis];
        const text = action
            ? `${action} → ${roleLabel}`
            : `+${Math.max(0.05, best.need).toFixed(2)} ${label} → ${roleLabel}`;
        return { targetRole, winner, axis: best.axis, need: best.need, text };
    }

    // WARUM-CHIP: die top-3 Beiträge (v[achse] × gewicht) der gewonnenen Rolle, lesbar formatiert
    // („lebendig 1.0 · greifbar 0.6 · härte −0.5"). Kein zweites Register: liest Produkt-Vektor +
    // ROLE_/FORM_ROLE_SIGNATURES. GapHint zeigt WIE DAHIN, dieser Chip WARUM HIER.
    _blueprintRoleWhy(bp) {
        if (!bp) return null;
        const role = (typeof this._displayRole === "function" && this._displayRole(bp)) || bp.role;
        const sig =
            AnazhRealm.ROLE_SIGNATURES[role] ||
            (AnazhRealm.FORM_ROLE_SIGNATURES && AnazhRealm.FORM_ROLE_SIGNATURES[role]) ||
            null;
        if (!sig) return null;
        const v = this._blueprintProductVector(bp);
        const beitraege = [];
        for (const axis in sig) {
            const contrib = (v[axis] || 0) * sig[axis];
            // Beiträge unter 0.05 erklären nichts (Rauschen als Begründung). Jeder Beitrag trägt seinen
            // GELTUNGSBEREICH (physik = gerechnet · konvention = Welt-Physik · form = Stellvertreter).
            if (Math.abs(contrib) > 0.05)
                beitraege.push({
                    axis,
                    contrib,
                    cls: (AnazhRealm.AXIS_CLASS && AnazhRealm.AXIS_CLASS[axis]) || "form",
                });
        }
        if (!beitraege.length) return null;
        beitraege.sort((a, b) => Math.abs(b.contrib) - Math.abs(a.contrib));
        const top = beitraege.slice(0, 3);
        const clsTag = { physik: "gerechnet", konvention: "Welt-Konvention" };
        const text = top
            .map((p) => {
                const label = (AnazhRealm.AXIS_LABELS && AnazhRealm.AXIS_LABELS[p.axis]) || p.axis;
                const tag = clsTag[p.cls] ? ` (${clsTag[p.cls]})` : ""; // Form bleibt unmarkiert (Übergang)
                // 2 Dezimalen — die Skala ist der ÷3-normierte Vektor (klein, ehrlich).
                return `${label}${tag} ${p.contrib < 0 ? "−" : ""}${Math.abs(p.contrib).toFixed(2)}`;
            })
            .join(" · ");
        return { role, text, beitraege: top };
    }

    // KONJUNKTIONS-RUF: resoniert die Spektrum-Spitze stärker als die zugewiesene Rolle und hält sie nur
    // eine unerfüllte 0/1-TAT-Achse zurück (rideable/livingBody/portalShape…), spricht die Zeile die TAT
    // aus („Fahrzeug ruft: setze einen Sitz-Anker").
    _blueprintConjunctionCall(bp) {
        const spectrum = this._blueprintRoleSpectrum(bp);
        if (!spectrum || !spectrum.length) return null;
        const top = spectrum[0];
        const assigned = typeof this._displayRole === "function" ? this._displayRole(bp) : bp.role;
        if (!top || top.role === assigned || top.score <= 0.05) return null;
        const sigTop = AnazhRealm.ROLE_SIGNATURES[top.role];
        const actions = AnazhRealm.AXIS_ACTION_HINTS;
        if (!sigTop) return null;
        const v = this._blueprintProductVector(bp);
        for (const axis in sigTop) {
            if (sigTop[axis] > 0 && actions[axis] && (v[axis] || 0) === 0) {
                const roleLabel = AnazhRealm.ROLE_LABELS[top.role] || top.role;
                return { role: top.role, axis, text: `${roleLabel} ruft: ${actions[axis]}` };
            }
        }
        return null;
    }

    // DIE EINE GÜTE EINES WERKS ∈ [0, 1] (Welle L, Befund K-D7 — vorher drei Wahrheiten: der Lehren-Faktor des Kerns im
    // Schaden, forgedPrecision in der Werkstoff-Kraft, die Teile-Präzision im Equip-Fold): ein Schmiede-Gerät trägt das
    // Lehren-Urteil des Kerns über Gestalt und Prägung (_schmiedeGueteAnteil), ein geschmiedetes Eigenwerk den
    // eingefrorenen Werk-Stand (forgedPrecision), ein Plan die Präzision seiner Teile. Leser: der Schadens-Faktor
    // (_heldGueteFaktor), die Werkstoff-Kraft (_implementProfileForBlueprint), der Equip-Fold, Rüstung und Konsum.
    computeBlueprintQuality(blueprint) {
        if (!blueprint || !Array.isArray(blueprint.parts)) return 1.0;
        const lehre = this._schmiedeGueteAnteil(blueprint);
        if (lehre !== null) return lehre;
        if (Number.isFinite(blueprint.forgedPrecision)) return blueprint.forgedPrecision;
        return this._compoundAvgPrecisionFromParts(blueprint.parts);
    }

    // KANONISCHER EQUIP-FOLD: wie ein ausgerüstetes Gerät/eine Rüstung seine Substanz in den Stat-Compound
    // des Trägers faltet — computePlayerStats UND computeCreatureStats LESEN diese eine Quelle. Slot-
    // Charakter als Parameter (`slotWeight` HELD/TOOL/ARMOR · `roleKey` held/armor); size-neutral. Mutiert
    // `finalTags`: w = slotWeight·(0.5 + 0.5·Qualität·RoleFit), Qualität = `computeBlueprintQuality`.
    _foldEquippedStatTags(finalTags, bp, slotWeight, roleKey) {
        if (!finalTags || !bp || !Array.isArray(bp.parts)) return;
        const tags = this.computeCompoundTags(bp) || {};
        const w = slotWeight * (0.5 + 0.5 * this.computeBlueprintQuality(bp) * this._blueprintRoleFit(bp, roleKey));
        for (const tag of AnazhRealm.MATERIAL_TAG_KEYS) {
            finalTags[tag] = (finalTags[tag] || 0) + (tags[tag] || 0) * w;
        }
    }

    // KANONISCHE STAT-PIPELINE (Boosts falten · Tags→Stats · Größen-Skalierung): computePlayerStats UND
    // computeCreatureStats lesen diese Quellen; Unterschiede (Boost-Quelle, Größe) sind Parameter.

    // (1) Boosts (Emotion · Welt-Resonanz · Konsum) addieren ihre Tag-Deltas. Die Quelle
    //     (player.boosts ODER creature.userData.boosts) reist als Parameter.
    _applyBoostsToStatTags(finalTags, boosts) {
        if (!finalTags || !Array.isArray(boosts) || boosts.length === 0) return;
        for (const b of boosts) {
            if (!b || !b.tagDelta) continue;
            for (const tag of Object.keys(b.tagDelta)) {
                if (!AnazhRealm.MATERIAL_TAG_KEYS.includes(tag)) continue;
                finalTags[tag] = (finalTags[tag] || 0) + b.tagDelta[tag];
            }
        }
    }

    // (2) Die STAT_FROM_TAGS-Formeln + der Invers-dichte-Floor (V17.90: attackSpeed/speed
    //     nie negativ/null — ein schweres Gerät ist TRÄGE, nicht kaputt). Die EINE Sprache,
    //     EINE Berechnung für Spieler ≡ Kreatur (§1.3).
    _statsFromTags(finalTags) {
        const stats = {};
        for (const stat of Object.keys(AnazhRealm.STAT_FROM_TAGS)) {
            stats[stat] = AnazhRealm.STAT_FROM_TAGS[stat](finalTags);
        }
        if (Number.isFinite(stats.attackSpeed)) stats.attackSpeed = Math.max(0.25, stats.attackSpeed);
        // Der Speed-Floor skaliert mit der LEBENDEN Gesetz-Base (Verhältnis 2/7; ~0.33 m/s
        // Schwerlast-Kriechen, nie 0) — ein fester Floor fröre jede Dial-Differenz ein.
        if (Number.isFinite(stats.speed)) {
            const floorBase = AnazhRealm._bewegungsKoeff("speed").base;
            stats.speed = Math.max((2 / 7) * floorBase, stats.speed);
        }
        return stats;
    }

    // (3) GRÖSSEN-SYMMETRIE: größer = robuster (HP/Stamina/Mana ∝ sizeHpMul), aber langsamer
    //     (speed/attackSpeed/jumpPower ∝ 1/sizeHpMul), gleiche Floors. sizeHpMul (= √Größen-Faktor)
    //     rechnet der Aufrufer (Spieler: soulSize · Kreatur: bodyParts × bodySize^0.5).
    _applySizeMultipliersToStats(stats, sizeHpMul) {
        if (!stats || !Number.isFinite(sizeHpMul) || sizeHpMul <= 0) return;
        const sizeSpeedMul = 1 / sizeHpMul;
        if (Number.isFinite(stats.hpMax)) stats.hpMax = stats.hpMax * sizeHpMul;
        if (Number.isFinite(stats.staminaMax)) stats.staminaMax = stats.staminaMax * sizeHpMul;
        if (Number.isFinite(stats.manaMax)) stats.manaMax = stats.manaMax * sizeHpMul;
        // REALITÄTS-EICHUNG 17.07. — derselbe gesetz-relative Floor wie in
        // _statsFromTags (2/7 der lebenden Base; der feste 2er klemmte unter
        // der Menschen-Base jede Größen-Differenz auf denselben Wert).
        if (Number.isFinite(stats.speed)) {
            const floorBase = AnazhRealm._bewegungsKoeff("speed").base;
            stats.speed = Math.max((2 / 7) * floorBase, stats.speed * sizeSpeedMul);
        }
        if (Number.isFinite(stats.attackSpeed)) stats.attackSpeed = Math.max(0.25, stats.attackSpeed * sizeSpeedMul);
        if (Number.isFinite(stats.jumpPower)) stats.jumpPower = stats.jumpPower * sizeSpeedMul;
    }

    // Werkzeug auf Part anwenden: validiert Tool-Besitz + Material × Op-Klassen-Kompatibilität. Ops werden
    // ANGEHÄNGT (opChain = Geschichte, nicht Auswahl); Built-in-Baupläne bleiben unberührbar.
    applyOpToPart(blueprintName, partIndex, toolName) {
        const bp = this.state.blueprints && this.state.blueprints[blueprintName];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.builtIn) return { ok: false, reason: "cannot_modify_builtin" };
        if (!Array.isArray(bp.parts) || partIndex < 0 || partIndex >= bp.parts.length) {
            return { ok: false, reason: "invalid_part_index" };
        }
        const tool = this.state.tools && this.state.tools[toolName];
        if (!tool) return { ok: false, reason: "tool_unknown" };
        const owned = Array.isArray(this.state.player.tools) && this.state.player.tools.includes(toolName);
        if (!owned) return { ok: false, reason: "tool_not_owned" };
        const part = bp.parts[partIndex];
        const matName = part.material || "stein";
        const compat = AnazhRealm.MATERIAL_OP_COMPATIBILITY[matName];
        // Eigene Materialien sind dem Konzept-Mapping nicht bekannt — wir
        // erlauben dort alle vier Op-Klassen, statt sie zu blockieren. Wer
        // genauer kalibrieren will, definiert das Compat-Profil später.
        if (compat && !compat.includes(tool.opClass)) {
            return { ok: false, reason: "material_op_incompatible" };
        }
        // Stamina-Kosten nur im pfad-Modus: reicht Stamina nicht, wird abgelehnt (warten auf den
        // tickPlayerVitals-Regen) → „beliebig stapeln" ist ausgeschlossen. frieden + schöpfer: reibungsfrei.
        const mode = this.getGameMode ? this.getGameMode() : "frieden";
        // V18.210 (§1-A4) — die Kosten-WÄHLER: phaseChange = MAGIE → Mana,
        // alle anderen Op-Klassen = MÜHE → Stamina. EINE Quelle (`tool.opClass`),
        // keine Hardcode-Whitelist (Tool-Erweiterungen erben das Verhalten).
        const _isMagicOp = tool.opClass === "phaseChange";
        if (mode === "pfad") {
            // Aufwand skaliert mit der Werkzeug-Präzision (cap 0.4 → ×1.1, cap 0.97 → ×0.53); Floor 2, damit eine
            // Op nie gratis wird. Magie zahlt aus Mana (Floor 5), Mühe aus Stamina — gleiche Skalierung.
            const baseCost = _isMagicOp ? AnazhRealm.TOOL_OP_MANA_COST : AnazhRealm.TOOL_OP_STAMINA_COST;
            const floor = _isMagicOp ? 5 : 2;
            const cost = Math.max(floor, Math.round(baseCost * (1.5 - (tool.precisionCap || 0.5))));
            if (_isMagicOp) {
                const mana = (this.state.player && this.state.player.mana) || 0;
                if (!this._canPayMana(cost)) {
                    return { ok: false, reason: "not_enough_mana", manaNeeded: cost, manaHave: mana };
                }
                this._drainMana(cost);
            } else {
                const stamina = (this.state.player && this.state.player.stamina) || 0;
                if (stamina < cost) {
                    return { ok: false, reason: "not_enough_stamina", staminaNeeded: cost, staminaHave: stamina };
                }
                this.state.player.stamina = Math.max(0, stamina - cost);
            }
        }
        // V17.87 — der Edit-Verlauf: VOR der opChain-Mutation den Vor-Zustand schnappen (nach allen
        // Validierungen, damit ein abgelehnter Op-Versuch keinen leeren Undo-Schritt erzeugt).
        this._recordBlueprintEdit(blueprintName);
        if (!Array.isArray(part.opChain)) part.opChain = this._defaultPartOpChain();
        // WERKSTATT ALS PRÄZISIONS-QUELLE: Werkzeug mit Domäne + passende Welt-Werkstatt nah → Cap =
        // max(Werkzeug, Werkstatt-Präzision). Sonst (domain=null/keine Station) der Werkzeug-Cap.
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        const stationPrec =
            tool.domain && pm ? this._nearbyWorkshopStationPrecision(tool.domain, { x: pm.x, y: pm.y, z: pm.z }) : 0;
        const effectiveCap = Math.max(tool.precisionCap || 0, stationPrec);
        part.opChain.push({
            tool: toolName,
            op: tool.opName,
            cap: effectiveCap,
            at: performance.now() / 1000,
        });
        // Welle 9a — emergente Bauplan-Rolle aktualisieren. Wenn das Werkzeug
        // eine Domain trägt (Phase 9b), kann der Bauplan dadurch seine Rolle
        // wechseln (z. B. construction → forging → tool).
        this._refreshBlueprintRoleEmergent(blueprintName);
        // Return-Shape symmetrisch: phaseChange-Ops ziehen MANA → der HUD liest `manaRemaining` neben
        // `staminaRemaining`. _isMagicOp lebt im pfad-Zweig; in frieden/schöpfer bleiben beide Felder gleich.
        return {
            ok: true,
            precision: this.computePartPrecision(part),
            staminaRemaining: this.state.player.stamina,
            manaRemaining: this.state.player.mana,
        };
    }

    // Prozess einer Domäne = opClass + opName des kanonischen Domain-Werkzeugs (die Domain-Tools sind die
    // OP-BIBLIOTHEK der platzierten Werkstätten). EINE Quelle: state.tools.
    _domainProcess(domain) {
        if (!domain) return null;
        for (const t of Object.values(this.state.tools || {})) {
            if (t && t.domain === domain) return { opClass: t.opClass, opName: t.opName, toolName: t.name };
        }
        return null;
    }

    // Die platzierte Werkstatt-Station IST der Prozess: ihre Domäne (emergent aus der Substanz) liefert
    // die Op, ihre Substanz-Präzision den Cap. Modus-Gate: pfad/frieden verlangen die Station platziert +
    // nah (`_isWorkshopStationPlacedNear`), schöpfer nur den Bauplan. Spiegelt applyOpToPart (Validierung
    // → Stamina → Edit-Verlauf → opChain), aber Op + Cap kommen aus der STATION.
    applyWorkshopProcessToPart(blueprintName, partIndex, stationName) {
        const bp = this.state.blueprints && this.state.blueprints[blueprintName];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.builtIn) return { ok: false, reason: "cannot_modify_builtin" };
        if (!Array.isArray(bp.parts) || partIndex < 0 || partIndex >= bp.parts.length) {
            return { ok: false, reason: "invalid_part_index" };
        }
        const station = this.state.blueprints[stationName];
        if (!station || station.role !== "workshop-station") return { ok: false, reason: "not_a_workshop" };
        const domain = this._computeWorkshopDomain(station);
        const proc = this._domainProcess(domain);
        if (!proc) return { ok: false, reason: "no_process_for_domain" };
        const mode = this.getGameMode ? this.getGameMode() : "frieden";
        // Modus-Gate: außerhalb schöpfer muss die Station in der Welt platziert + nah sein (der „wahre Weg").
        if (mode !== "schöpfer" && !this._isWorkshopStationPlacedNear(stationName)) {
            return { ok: false, reason: "workshop_not_placed_near" };
        }
        const part = bp.parts[partIndex];
        const matName = part.material || "stein";
        const compat = AnazhRealm.MATERIAL_OP_COMPATIBILITY[matName];
        if (compat && !compat.includes(proc.opClass)) return { ok: false, reason: "material_op_incompatible" };
        // Stamina/Mana nur im pfad-Modus, skaliert wie bei applyOpToPart mit der Präzision; Magie/Mühe folgt
        // der opClass des Prozesses (phaseChange → Mana, plastic → Stamina) — dasselbe Gate wie applyOpToPart.
        const cap = this._workshopStationPrecision(station);
        const _isMagicOp = proc.opClass === "phaseChange";
        if (mode === "pfad") {
            const baseCost = _isMagicOp ? AnazhRealm.TOOL_OP_MANA_COST : AnazhRealm.TOOL_OP_STAMINA_COST;
            const floor = _isMagicOp ? 5 : 2;
            const cost = Math.max(floor, Math.round(baseCost * (1.5 - cap)));
            if (_isMagicOp) {
                const mana = (this.state.player && this.state.player.mana) || 0;
                if (!this._canPayMana(cost)) {
                    return { ok: false, reason: "not_enough_mana", manaNeeded: cost, manaHave: mana };
                }
                this._drainMana(cost);
            } else {
                const stamina = (this.state.player && this.state.player.stamina) || 0;
                if (stamina < cost) {
                    return { ok: false, reason: "not_enough_stamina", staminaNeeded: cost, staminaHave: stamina };
                }
                this.state.player.stamina = Math.max(0, stamina - cost);
            }
        }
        this._recordBlueprintEdit(blueprintName);
        if (!Array.isArray(part.opChain)) part.opChain = this._defaultPartOpChain();
        // opChain trägt den KANONISCHEN Domain-Werkzeug-Namen (proc.toolName), NICHT den Stations-Namen:
        // `computeBlueprintDomainCounts` löst die Domäne über `state.tools[op.tool].domain` auf. Der Cap kommt
        // aus der Station; `station` notiert nur die Quelle für die Anzeige.
        part.opChain.push({
            tool: proc.toolName,
            op: proc.opName,
            cap,
            station: stationName,
            at: performance.now() / 1000,
        });
        this._refreshBlueprintRoleEmergent(blueprintName);
        // V18.210 (Audit-Heilung #4) — return-Shape Symmetrie zur applyOpToPart:
        // beide Ressourcen-Wahrheiten reisen mit; der UI-Konsument sieht echt,
        // welche der zwei knappen Achsen verbraucht wurde.
        return {
            ok: true,
            precision: this.computePartPrecision(part),
            cap,
            domain,
            staminaRemaining: this.state.player ? this.state.player.stamina : 0,
            manaRemaining: this.state.player ? this.state.player.mana : 0,
        };
    }

    // V17.88 — ist eine Werkstatt-Station dieses Bauplan-NAMENS in der Welt platziert + nah am Spieler?
    // (Spiegel von `_nearbyWorkshopStationPrecision`, aber per Bauplan-Name statt Domäne.)
    _isWorkshopStationPlacedNear(stationName) {
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        if (!pm) return false;
        const radius = AnazhRealm.WORKSHOP_PROXIMITY_M;
        const r2 = radius * radius;
        for (const entry of this.state.architectures || []) {
            if (!entry || entry.type !== stationName || !entry.position) continue;
            const dx = entry.position.x - pm.x;
            const dy = entry.position.y - pm.y;
            const dz = entry.position.z - pm.z;
            if (dx * dx + dy * dy + dz * dz <= r2) return true;
        }
        return false;
    }

    // Werkstatt-Prozesse fürs Menü: in schöpfer ALLE besessenen Werkstatt-Baupläne, sonst nur platzierte +
    // nahe. Jeder Eintrag trägt Station + Domäne-Op + Substanz-Präzisions-Cap („Esse · schmieden 0.93").
    // Die HAND bleibt separat verfügbar (applyOpToPart).
    _workshopProcessesForMenu() {
        const mode = this.getGameMode ? this.getGameMode() : "frieden";
        const out = [];
        const seen = new Set();
        const consider = (stationName) => {
            if (seen.has(stationName)) return;
            const station = this.state.blueprints[stationName];
            if (!station || station.role !== "workshop-station") return;
            const domain = this._computeWorkshopDomain(station);
            const proc = this._domainProcess(domain);
            if (!proc) return;
            seen.add(stationName);
            out.push({
                stationName,
                label: station.label || stationName,
                domain,
                opClass: proc.opClass,
                opName: proc.opName,
                cap: this._workshopStationPrecision(station),
            });
        };
        if (mode === "schöpfer") {
            for (const name of Object.keys(this.state.blueprints || {})) consider(name);
        } else {
            for (const entry of this.state.architectures || []) {
                if (entry && entry.type && this._isWorkshopStationPlacedNear(entry.type)) consider(entry.type);
            }
        }
        return out;
    }

    removePartOp(blueprintName, partIndex) {
        const bp = this.state.blueprints && this.state.blueprints[blueprintName];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.builtIn) return { ok: false, reason: "cannot_modify_builtin" };
        if (!Array.isArray(bp.parts) || partIndex < 0 || partIndex >= bp.parts.length) {
            return { ok: false, reason: "invalid_part_index" };
        }
        const part = bp.parts[partIndex];
        const defLen = this._defaultPartOpChain().length;
        if (!Array.isArray(part.opChain) || part.opChain.length <= defLen) {
            return { ok: false, reason: "nothing_to_remove" }; // schon auf der Default-Op-Kette
        }
        this._recordBlueprintEdit(blueprintName);
        part.opChain.pop();
        this._refreshBlueprintRoleEmergent(blueprintName);
        return { ok: true, precision: this.computePartPrecision(part), opCount: part.opChain.length };
    }

    // UNDO/REDO im Bauplan-Editor: Sitzungs-Geschichte (NICHT persistiert) über ALLE Editor-Akte (Parts,
    // Ops, Verbindungen). Jede Mutation ruft `_recordBlueprintEdit` (schnappt den Vor-Zustand), undo/redo
    // tauschen zwischen den Stapeln. Nur eigene Baupläne (Built-ins sind unveränderlich).
    _blueprintEditHistory(name) {
        if (!this.state.blueprintEditHistory) this.state.blueprintEditHistory = {};
        if (!this.state.blueprintEditHistory[name]) this.state.blueprintEditHistory[name] = { undo: [], redo: [] };
        return this.state.blueprintEditHistory[name];
    }

    // Der editierbare Zustand eines Bauplans (Parts + Verbindungen + Rolle), tief geklont.
    _snapshotBlueprintEdit(name) {
        const bp = (this.state.blueprints && this.state.blueprints[name]) || {};
        return {
            parts: JSON.parse(JSON.stringify(bp.parts || [])),
            connections: bp.connections ? JSON.parse(JSON.stringify(bp.connections)) : undefined,
            role: bp.role,
            roleManual: bp.roleManual,
        };
    }

    // VOR jeder Mutation aufgerufen: schnappt den aktuellen (Vor-Mutations-)Zustand auf den Undo-Stapel,
    // verwirft den Redo-Zweig (ein neuer Edit gabelt die Geschichte). Bounded (max 50 Schritte).
    _recordBlueprintEdit(name) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp || bp.builtIn) return; // Built-ins werden nicht editiert → keine Geschichte
        const hist = this._blueprintEditHistory(name);
        hist.undo.push(this._snapshotBlueprintEdit(name));
        if (hist.undo.length > 50) hist.undo.shift();
        hist.redo.length = 0;
    }

    // Stellt einen Schnappschuss wieder her (Parts + Verbindungen + Rolle direkt — der Schnappschuss ist
    // ein konsistenter Vor-Zustand, kein Re-Emergieren nötig).
    _restoreBlueprintEdit(name, snap) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp || !snap) return;
        bp.parts = JSON.parse(JSON.stringify(snap.parts || []));
        this.state._bpEditTick = (this.state._bpEditTick || 0) + 1; // V18.358 — Recipe-Book-Signatur
        if (snap.connections) bp.connections = JSON.parse(JSON.stringify(snap.connections));
        else delete bp.connections;
        if (snap.role === undefined) delete bp.role;
        else bp.role = snap.role;
        if (snap.roleManual === undefined) delete bp.roleManual;
        else bp.roleManual = snap.roleManual;
    }

    canUndoBlueprintEdit(name) {
        const h = this.state.blueprintEditHistory && this.state.blueprintEditHistory[name];
        return !!(h && h.undo.length);
    }

    canRedoBlueprintEdit(name) {
        const h = this.state.blueprintEditHistory && this.state.blueprintEditHistory[name];
        return !!(h && h.redo.length);
    }

    undoBlueprintEdit(name) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp || bp.builtIn) return { ok: false, reason: "not_editable" };
        const hist = this._blueprintEditHistory(name);
        if (!hist.undo.length) return { ok: false, reason: "nothing_to_undo" };
        hist.redo.push(this._snapshotBlueprintEdit(name)); // der aktuelle Zustand → Redo
        this._restoreBlueprintEdit(name, hist.undo.pop());
        return { ok: true, undoLeft: hist.undo.length, redoLeft: hist.redo.length };
    }

    redoBlueprintEdit(name) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp || bp.builtIn) return { ok: false, reason: "not_editable" };
        const hist = this._blueprintEditHistory(name);
        if (!hist.redo.length) return { ok: false, reason: "nothing_to_redo" };
        hist.undo.push(this._snapshotBlueprintEdit(name)); // der aktuelle Zustand → Undo
        this._restoreBlueprintEdit(name, hist.redo.pop());
        return { ok: true, undoLeft: hist.undo.length, redoLeft: hist.redo.length };
    }

    // ANGEZEIGTE Rolle: ein deklarierter Override (roleManual = Spieler-Intent, oder built-in-Saat-Rolle)
    // gilt; sonst die EMERGENTE (computeBlueprintRole) — sonst zeigte ein rollenloser Bauplan (bp.role
    // undefined) den „Bauwerk"-Default statt seiner wahren Rolle.
    _displayRole(bp) {
        if (!bp) return AnazhRealm.DEFAULT_BLUEPRINT_ROLE;
        if ((bp.roleManual || bp.builtIn) && bp.role) return bp.role;
        return this.computeBlueprintRole(bp);
    }
    // Aktivierte Tags je Part (Form × Material): Werte 0..3 = FORM_TAG_ACTIVATION × MATERIAL_TAG (0..1).
    // Unbekannte Shape (z. B. "blueprint") oder fehlendes Material → leeres Objekt.
    computePartTags(part) {
        if (!part || typeof part !== "object") return {};
        const activation = AnazhRealm.FORM_TAG_ACTIVATION[part.shape];
        if (!activation) return {};
        const matName = part.material || "stein";
        const material = this.state.materials && this.state.materials[matName];
        if (!material || !material.tags) return {};
        const out = {};
        const ceil = AnazhRealm.MATERIAL_TAG_CEIL;
        for (const tag of AnazhRealm.MATERIAL_TAG_KEYS) {
            // Die Klemme am LESER: fremde Substanz behält ihre Magnitude (must-preserve), diese Welt liest nur bis
            // ceil (härte=10⁶ baute sonst eine unzerstörbare Mauer). Für lokale Materialien ([0,1] per
            // defineMaterial) no-op; deckt JEDEN Eintrittsweg, weil ALLE Compound-Konsumenten hier durchlaufen.
            const raw = Math.min(ceil[tag] !== undefined ? ceil[tag] : 2, material.tags[tag] || 0);
            const val = (activation[tag] || 0) * raw;
            if (val > 0) out[tag] = val;
        }
        return out;
    }

    // Aggregation über alle Parts mit MAX statt SUM: SUM ergibt Stat-Matsch (17 Quader = 17× Trägheit).
    // Je Tag-Achse erbt der Compound vom kompetentesten Part.
    computeCompoundTags(blueprint) {
        const out = {};
        if (!blueprint || !Array.isArray(blueprint.parts)) return out;
        for (const part of blueprint.parts) {
            const partTags = this.computePartTags(part);
            for (const tag of Object.keys(partTags)) {
                const v = partTags[tag];
                if (!(tag in out) || v > out[tag]) out[tag] = v;
            }
        }
        // Spezies-Variation additiv DRAUF (SPECIES_TAG_VARIATION, z. B. Tanne brennbar↑) — sonst lesen alle
        // Arten identische holz+laub-Tags. Bedingung ist `_grownSpecies` (Identität), nicht `_isGrown`: so
        // trägt auch der Built-in-Bauplan (baum_eiche/…) seine Variation. Die VARIATIONS-Wand erlaubt nur
        // diese Δ; Built-ins ohne _grownSpecies bleiben bit-identisch.
        if (typeof blueprint._grownSpecies === "string") {
            const variation =
                AnazhRealm.SPECIES_TAG_VARIATION && AnazhRealm.SPECIES_TAG_VARIATION[blueprint._grownSpecies];
            if (variation) {
                for (const axis of Object.keys(variation)) {
                    out[axis] = Math.max(0, (out[axis] || 0) + variation[axis]);
                }
            }
        }
        return out;
    }

    // ### Räumliche Emergenz ###
    // Fünf Prinzipien: (1) Spitze richtet nach außen · (2) Hohlraum enthält · (3) Symmetrieachse trägt
    // Alignment · (4) Kontakt überträgt Tags · (5) Abstände erzeugen Resonanz. (1)+(4) wirken je Part;
    // (2)(3)(5) sind COMPOUND-Bonusse, multiplikativ auf der MAX-Aggregation (verstärken, addieren nicht).

    // Part-AABB in lokalen Compound-Koordinaten: position ± size/2 (Näherung); blueprint-Refs: scale * 1.
    _partBoundingBox(part) {
        if (!part || typeof part !== "object") return null;
        const pos = part.position || { x: 0, y: 0, z: 0 };
        const size = part.size || { x: 1, y: 1, z: 1 };
        const sx = Math.max(0.1, Math.abs(size.x || 1));
        const sy = Math.max(0.1, Math.abs(size.y || sx));
        const sz = Math.max(0.1, Math.abs(size.z || sx));
        return {
            min: { x: pos.x - sx / 2, y: pos.y - sy / 2, z: pos.z - sz / 2 },
            max: { x: pos.x + sx / 2, y: pos.y + sy / 2, z: pos.z + sz / 2 },
            center: { x: pos.x, y: pos.y, z: pos.z },
        };
    }

    // Compound-AABB = Union aller Parts (min/max + Extent je Achse). Ein Part gilt als Spitze, wenn es
    // innerhalb 20 % der Extent am Rand liegt.
    _compoundBoundingBox(blueprint) {
        if (!blueprint || !Array.isArray(blueprint.parts) || blueprint.parts.length === 0) return null;
        let minX = Infinity,
            minY = Infinity,
            minZ = Infinity;
        let maxX = -Infinity,
            maxY = -Infinity,
            maxZ = -Infinity;
        for (const p of blueprint.parts) {
            const bb = this._partBoundingBox(p);
            if (!bb) continue;
            if (bb.min.x < minX) minX = bb.min.x;
            if (bb.min.y < minY) minY = bb.min.y;
            if (bb.min.z < minZ) minZ = bb.min.z;
            if (bb.max.x > maxX) maxX = bb.max.x;
            if (bb.max.y > maxY) maxY = bb.max.y;
            if (bb.max.z > maxZ) maxZ = bb.max.z;
        }
        if (minX === Infinity) return null;
        return {
            min: { x: minX, y: minY, z: minZ },
            max: { x: maxX, y: maxY, z: maxZ },
            extent: { x: maxX - minX, y: maxY - minY, z: maxZ - minZ },
        };
    }

    // Positions-Labels eines Parts: "at_top"/"at_bottom"/"at_outside"/"central" (mehrere möglich).
    // Schwelle 20 % der Compound-Extent — nur echte Rand-Parts, robust gegen Float-Drift.
    _classifyPartPosition(part, compoundBB) {
        const labels = new Set();
        if (!part || !compoundBB) return labels;
        const pos = part.position || { x: 0, y: 0, z: 0 };
        const e = compoundBB.extent;
        // "at_top": nahe maxY innerhalb 20 % der y-Extent
        if (e.y > 0.1 && pos.y >= compoundBB.max.y - e.y * 0.2) labels.add("at_top");
        if (e.y > 0.1 && pos.y <= compoundBB.min.y + e.y * 0.2) labels.add("at_bottom");
        // "at_outside": radial weit vom Zentrum (xz-Distanz > 60 % des
        // Compound-Radius). Mehrere Achsen kombinieren via Pythagoras.
        const centerX = (compoundBB.min.x + compoundBB.max.x) / 2;
        const centerZ = (compoundBB.min.z + compoundBB.max.z) / 2;
        const radialDist = Math.hypot(pos.x - centerX, pos.z - centerZ);
        const compoundRadius = Math.hypot(e.x, e.z) / 2;
        if (compoundRadius > 0.1 && radialDist > compoundRadius * 0.6) labels.add("at_outside");
        if (labels.size === 0) labels.add("central");
        return labels;
    }

    // Prinzip 2: Sphere/Torus, deren AABB das Zentrum eines anderen Parts enthält, formen einen Hohlraum →
    // Container UND Inhalt bekommen Resonanz-Bonus (Glocke + Klöppel). AABB statt echter Hülle — grob,
    // aber die richtige Granularität für die Compound-Frage.
    _findHollowPairs(blueprint) {
        const pairs = [];
        const parts = blueprint.parts || [];
        const partBBs = parts.map((p) => this._partBoundingBox(p));
        const partVolumes = partBBs.map((bb) => {
            if (!bb) return 0;
            return Math.max(0, (bb.max.x - bb.min.x) * (bb.max.y - bb.min.y) * (bb.max.z - bb.min.z));
        });
        for (let i = 0; i < parts.length; i++) {
            const outer = parts[i];
            if (!AnazhRealm.SPATIAL_HOLLOW_SHAPES.has(outer.shape)) continue;
            const outerBB = partBBs[i];
            if (!outerBB) continue;
            for (let j = 0; j < parts.length; j++) {
                if (i === j) continue;
                // Konzeptionelle Asymmetrie: nur das größere Volumen ist
                // Container. Sonst gilt bei zwei konzentrischen Sphären jeder
                // als Container für den anderen (Center-in-BB ist symmetrisch).
                if (partVolumes[i] <= partVolumes[j]) continue;
                const inner = parts[j];
                const innerPos = inner.position || { x: 0, y: 0, z: 0 };
                if (
                    innerPos.x > outerBB.min.x &&
                    innerPos.x < outerBB.max.x &&
                    innerPos.y > outerBB.min.y &&
                    innerPos.y < outerBB.max.y &&
                    innerPos.z > outerBB.min.z &&
                    innerPos.z < outerBB.max.z
                ) {
                    pairs.push({ outer: i, inner: j });
                }
            }
        }
        return pairs;
    }

    // Prinzip 3: Y-Drehsymmetrie — Std-Abweichung der xz-Distanz vom Zentrum ≤ 30 % der xz-Extent →
    // Alignment-Bonus auf magieleitung + stromleitung.
    _hasYAxisSymmetry(blueprint) {
        const parts = blueprint.parts || [];
        if (parts.length < 2) return false;
        const bb = this._compoundBoundingBox(blueprint);
        if (!bb) return false;
        const xzExtent = Math.max(bb.extent.x, bb.extent.z);
        if (xzExtent < 0.5) return true; // sehr dünn → zählt als achssymmetrisch
        const centerX = (bb.min.x + bb.max.x) / 2;
        const centerZ = (bb.min.z + bb.max.z) / 2;
        let maxDist = 0;
        for (const p of parts) {
            const pos = p.position || { x: 0, y: 0, z: 0 };
            const d = Math.hypot(pos.x - centerX, pos.z - centerZ);
            if (d > maxDist) maxDist = d;
        }
        // Wenn die maximale xz-Distanz vom Zentrum klein ist gegenüber der
        // xz-Extent, sind alle Parts auf der Achse — Compound ist „Stab".
        return maxDist <= xzExtent * 0.25;
    }

    // Prinzip 5: ≥ 3 Parts gleicher Shape auf etwa demselben Radius um das Zentrum = Array (Glockenspiel,
    // Kristall-Kreis) → Bonus auf resoniert + magieleitung.
    _hasResonantArray(blueprint) {
        const parts = blueprint.parts || [];
        if (parts.length < 3) return false;
        // Schwerpunkt der Part-Positionen statt BB-Center — BB ist geometrisch
        // verzerrt, wenn die Parts unregelmäßig verteilt sind (eine extreme
        // Position zieht das BB-Center, aber nicht den Schwerpunkt).
        let sumX = 0;
        let sumZ = 0;
        for (const p of parts) {
            const pos = p.position || { x: 0, y: 0, z: 0 };
            sumX += pos.x;
            sumZ += pos.z;
        }
        const centerX = sumX / parts.length;
        const centerZ = sumZ / parts.length;
        const byShape = {};
        for (const p of parts) {
            const pos = p.position || { x: 0, y: 0, z: 0 };
            const dist = Math.hypot(pos.x - centerX, pos.z - centerZ);
            if (dist < 0.1) continue; // zentrale Parts zählen nicht zum Array
            (byShape[p.shape] = byShape[p.shape] || []).push(dist);
        }
        for (const shape of Object.keys(byShape)) {
            const distances = byShape[shape];
            if (distances.length < 3) continue;
            const avg = distances.reduce((a, b) => a + b, 0) / distances.length;
            if (avg < 0.5) continue;
            // Alle Distanzen müssen innerhalb 12 % vom Mittelwert liegen.
            // 15 % war grenzwertig: drei Parts auf grob-ähnlichen Radien aber
            // ohne echte Kreis-Anordnung fielen durch. 12 % filtert das raus.
            const maxDev = distances.reduce((m, d) => Math.max(m, Math.abs(d - avg)), 0);
            if (maxDev <= avg * 0.12) return true;
        }
        return false;
    }

    // Prinzip 4: Parts berühren sich, wenn ihre AABBs überlappen oder < CONTACT_GAP auseinander liegen.
    // AABB statt Mesh-Kollision — die Sekunden-Ticks lesen viele Compound-Parts.
    _partsAreInContact(partA, partB) {
        const a = this._partBoundingBox(partA);
        const b = this._partBoundingBox(partB);
        if (!a || !b) return false;
        const gap = 0.15;
        const dx = Math.max(0, Math.max(a.min.x - b.max.x, b.min.x - a.max.x));
        const dy = Math.max(0, Math.max(a.min.y - b.max.y, b.min.y - a.max.y));
        const dz = Math.max(0, Math.max(a.min.z - b.max.z, b.min.z - a.max.z));
        return dx < gap && dy < gap && dz < gap;
    }

    // DAS GEDÄCHTNIS DER RAUM-TAGS (0710-11): die Rechnung (`_raumTagsRechnen`) prüft je Teil-Paar Kontakt und Hohlraum —
    // O(Teile²), an der Mess-Wiese 0,6–1,1 ms je Bauplan (Haselbusch 112 Teile); die Resonanz der Boosts fragte je Sekunde
    // dieselben Baupläne für jeden nahen Eintrag neu (10 Rufe, 8,3 ms, Spitze 10,3 ms). Je Bauplan-Objekt merkt sich das
    // Gedächtnis die Tags und den SCHLÜSSEL: einen Schnappschuss JEDES Eingangs der Rechnung (`_raumTagSchluessel`: je Teil
    // Form, Stoff, Position, Größe; je benutzter Stoff seine Tags) — gebaut bei jedem Ruf, Wert für Wert verglichen. So sieht
    // das Gedächtnis jeden Schreiber (die Werkstatt-API, Undo/Redo, das Laden, `defineMaterial`, eine direkte Änderung am
    // Teil ohne API), ohne ihn zu kennen; die Tags rechnen nur bei geändertem Schlüssel neu. Der Leser bekommt je Ruf ein
    // eigenes Objekt (wie die Rechnung). Die Wand (gate:raum-tags): der Schlüssel liest jeden Eingang der Rechnung (Proxy-
    // Linse), die Rechnung liest keinen Zustand außer `state.materials`, ihre Tabellen schreibt niemand (AST), und über eine
    // Werkstatt-Sitzung mit Edits urteilt das Gedächtnis byte-gleich wie die Rechnung.
    computeSpatialTags(blueprint) {
        if (!blueprint || !Array.isArray(blueprint.parts) || blueprint.parts.length === 0) {
            return this._raumTagsRechnen(blueprint);
        }
        const gedaechtnis = this._raumTagGedaechtnis || (this._raumTagGedaechtnis = new WeakMap());
        const neu = this._raumTagSchluessel(blueprint, this._raumTagKratz || (this._raumTagKratz = []));
        let m = gedaechtnis.get(blueprint);
        if (m && this._raumTagGleich(m.schluessel, neu)) return Object.assign({}, m.tags);
        const tags = this._raumTagsRechnen(blueprint);
        if (!m) gedaechtnis.set(blueprint, (m = { schluessel: [], tags: null }));
        // der neue Schlüssel wird das Gedächtnis, das alte Array der nächste Kratzplatz
        this._raumTagKratz = m.schluessel;
        m.schluessel = neu;
        m.tags = tags;
        return Object.assign({}, tags);
    }

    // Der Schlüssel der Raum-Tags: jeder Eingang der Rechnung in fester Folge (Flaggen vor den Teil-Stücken, so ist die Folge
    // eindeutig) — die Teile (Form, Stoff, Position, Größe) und je benutztem Stoff (`material || "stein"`) seine Tags.
    _raumTagSchluessel(blueprint, out) {
        out.length = 0;
        const parts = blueprint.parts;
        const n = parts.length;
        out.push(n);
        const stoffe = this._raumTagStoffe || (this._raumTagStoffe = []);
        stoffe.length = 0;
        for (let i = 0; i < n; i++) {
            const p = parts[i];
            if (!p || typeof p !== "object") {
                out.push(0, p);
                continue;
            }
            const pos = p.position;
            const size = p.size;
            out.push(1, p.shape, p.material);
            if (pos) out.push(1, pos.x, pos.y, pos.z);
            else out.push(0);
            if (size) out.push(1, size.x, size.y, size.z);
            else out.push(0);
            const stoff = p.material || "stein";
            if (stoffe.indexOf(stoff) < 0) stoffe.push(stoff);
        }
        const mats = this.state.materials;
        out.push(mats ? 1 : 0);
        if (mats)
            for (const name of stoffe) {
                const mat = mats[name];
                const t = mat ? mat.tags : undefined;
                out.push(name, mat ? 1 : 0, t ? 1 : 0);
                if (t) for (const k of AnazhRealm.MATERIAL_TAG_KEYS) out.push(t[k]);
            }
        return out;
    }

    _raumTagGleich(a, b) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) if (!Object.is(a[i], b[i])) return false;
        return true;
    }

    // Räumliche Tags = computeCompoundTags-Basis + Bonus-Regeln, VOR der MAX-Aggregation je Part (die gedächtnislose
    // Rechnung; Leser fragen `computeSpatialTags`):
    // Prinzip 1: pointed-shape (cone/pyramid/octahedron/helix) at_top/at_outside → Bonus auf härte +
    // magieleitung, skaliert mit der intrinsischen Aktivierung (computePartTags).
    // Prinzip 4: je Tag max(Original, Kontakt × CONTACT_TRANSFER) zwischen berührenden Parts.
    _raumTagsRechnen(blueprint) {
        if (!blueprint || !Array.isArray(blueprint.parts) || blueprint.parts.length === 0) {
            return this.computeCompoundTags(blueprint);
        }
        const bb = this._compoundBoundingBox(blueprint);
        const parts = blueprint.parts;
        const pointed = AnazhRealm.SPATIAL_POINTED_SHAPES;
        const TIP_BONUS = 0.5; // ★+50 % am Rand für pointed-Shapes
        const CONTACT_TRANSFER = 0.6; // 60 % der höheren Tag-Stärke fließt über
        // Schritt 1: pro Part die räumlich-bonusten Tags berechnen
        const augmentedPartTags = parts.map((part) => {
            const baseTags = this.computePartTags(part);
            const labels = this._classifyPartPosition(part, bb);
            const isTip = pointed.has(part.shape) && (labels.has("at_top") || labels.has("at_outside"));
            if (isTip) {
                // Spitze: härte + magieleitung bekommen Bonus aus dem
                // INTRINSISCHEN Wert (kein freier Bonus, sondern Verstärkung).
                if (baseTags["härte"]) baseTags["härte"] = baseTags["härte"] * (1 + TIP_BONUS);
                if (baseTags["magieleitung"]) {
                    baseTags["magieleitung"] = baseTags["magieleitung"] * (1 + TIP_BONUS);
                }
            }
            return baseTags;
        });
        // Prinzip 2: je Hohlraum-Paar bekommen Container UND Inhalt den Resonanz-Bonus EINMAL (auch bei
        // mehreren Inhalten eines Containers).
        const hollowPairs = this._findHollowPairs(blueprint);
        const hollowBoosted = new Set();
        for (const pair of hollowPairs) {
            for (const idx of [pair.outer, pair.inner]) {
                if (hollowBoosted.has(idx)) continue;
                hollowBoosted.add(idx);
                const tags = augmentedPartTags[idx];
                if (tags["resoniert"]) {
                    tags["resoniert"] = tags["resoniert"] * (1 + AnazhRealm.SPATIAL_HOLLOW_BONUS);
                }
            }
        }
        // Schritt 3: Kontakt-Übertragung. Für jedes Paar (i, j) mit Kontakt,
        // gleiche schwächeren Tag-Wert mit CONTACT_TRANSFER × stärkerem Wert an.
        for (let i = 0; i < parts.length; i++) {
            for (let j = i + 1; j < parts.length; j++) {
                if (!this._partsAreInContact(parts[i], parts[j])) continue;
                const a = augmentedPartTags[i];
                const b = augmentedPartTags[j];
                // Welche Tags werden übertragen (Konzept §5.2 Prinzip 4 nennt
                // Wärme, Strom, Magie, Schwingung): nicht alle 10 Tags fließen.
                const transferable = AnazhRealm.SPATIAL_TRANSFERABLE_TAGS;
                for (const tag of transferable) {
                    const valA = a[tag] || 0;
                    const valB = b[tag] || 0;
                    if (valA > valB) {
                        const transferred = valA * CONTACT_TRANSFER;
                        if (transferred > valB) b[tag] = transferred;
                    } else if (valB > valA) {
                        const transferred = valB * CONTACT_TRANSFER;
                        if (transferred > valA) a[tag] = transferred;
                    }
                }
            }
        }
        // Schritt 4: Standard-MAX-Aggregation über die augmentierten Parts.
        const out = {};
        for (const partTags of augmentedPartTags) {
            for (const tag of Object.keys(partTags)) {
                const v = partTags[tag];
                if (!(tag in out) || v > out[tag]) out[tag] = v;
            }
        }
        // Schritt 5: Compound-Bonusse aus Prinzip 3 + 5. Werden NACH der
        // Aggregation angewandt, weil sie Eigenschaften des Compounds als
        // Ganzes sind, nicht einzelner Parts.
        if (this._hasYAxisSymmetry(blueprint)) {
            if (out["magieleitung"]) {
                out["magieleitung"] = out["magieleitung"] * (1 + AnazhRealm.SPATIAL_AXIS_BONUS);
            }
            if (out["stromleitung"]) {
                out["stromleitung"] = out["stromleitung"] * (1 + AnazhRealm.SPATIAL_AXIS_BONUS);
            }
        }
        if (this._hasResonantArray(blueprint)) {
            if (out["resoniert"]) {
                out["resoniert"] = out["resoniert"] * (1 + AnazhRealm.SPATIAL_ARRAY_BONUS);
            }
            if (out["magieleitung"]) {
                out["magieleitung"] = out["magieleitung"] * (1 + AnazhRealm.SPATIAL_ARRAY_BONUS);
            }
        }
        return out;
    }

    // ### Verbindungstypen mit Lastformel ###
    // `blueprint.connections` referenziert zwei Part-Indizes + einen Typ aus CONNECTION_TYPES; die
    // Lastformel verbindet Geometrie + Material + Typ aus den bekannten Tags.

    // Kontaktfläche: AABB-Überschneidung in den ZWEI größeren Dimensionen, multipliziert.
    _partsContactArea(partA, partB) {
        // Die Kontakt-Hülle ist ROTATIONS-BEWUSST (|R|·s): die rotations-blinde _partBoundingBox sah ein
        // liegendes Rad 0.14 statt 0.62 m hoch → es „berührte" nie. _partBoundingBox bleibt für die
        // Spatial-Tag-Leser unverändert (eingefrorene Affinitäts-Baselines).
        const a = this._partWorldAABB(partA);
        const b = this._partWorldAABB(partB);
        if (!a || !b) return 0;
        // Pro Achse signed gap: negativ bei Overlap, positiv bei Trennung.
        const gapX = Math.max(a.min.x - b.max.x, b.min.x - a.max.x);
        const gapY = Math.max(a.min.y - b.max.y, b.min.y - a.max.y);
        const gapZ = Math.max(a.min.z - b.max.z, b.min.z - a.max.z);
        // Ist EINE Achse weiter als TOUCH getrennt, kein Kontakt (additive TOUCH-Faktoren gaben sonst weit
        // entfernten Parts positive Fläche). TOUCH = 0.05 erlaubt bündiges Sitzen.
        const TOUCH = 0.05;
        if (Math.max(gapX, gapY, gapZ) > TOUCH) return 0;
        // Sort aufsteigend: [tiefster Overlap, mittel, dünnster Overlap].
        // Die zwei tieferen Overlaps spannen die Kontaktfläche auf; der
        // dünnste ist die Kontakt-Normale.
        const sorted = [gapX, gapY, gapZ].sort((p, q) => p - q);
        const overlapA = Math.max(0, -sorted[0]);
        const overlapB = Math.max(0, -sorted[1]);
        return overlapA * overlapB;
    }

    // Liefert die Lastfähigkeit einer Verbindung, 0..3 in derselben Skala wie
    // die Tag-Strahler — vergleichbar mit `compound_has_tag`-Werten.
    computeConnectionStrength(connection, blueprint) {
        if (!connection || !blueprint) return 0;
        const type = AnazhRealm.CONNECTION_TYPES[connection.type];
        if (!type) return 0;
        const parts = blueprint.parts || [];
        const a = parts[connection.partA];
        const b = parts[connection.partB];
        if (!a || !b) return 0;
        const materials = this.state.materials || {};
        const matA = materials[a.material || "stein"];
        const matB = materials[b.material || "stein"];
        if (!matA || !matB) return 0;
        let tagSum = 0;
        for (const tag of type.strongTags) {
            tagSum += ((matA.tags[tag] || 0) + (matB.tags[tag] || 0)) / 2;
        }
        const avgTag = tagSum / type.strongTags.length;
        // Kontakt-Fläche normalisiert auf 1.0 (eine 1×1-Box-Begegnung = 1).
        // Größer ≥ 1 gibt vollen Faktor, kleiner skaliert linear.
        const contact = Math.min(1, this._partsContactArea(a, b));
        return type.typeStrength * avgTag * 3 * Math.max(0.1, contact);
    }

    // Validiert eine Connection-Liste (Save/DSL-Eingang): Whitelist CONNECTION_TYPES, Indizes in
    // parts-Range, max 64 je Bauplan. Liefert ein neues Array, mutiert die Eingabe nicht.
    validateBlueprintConnections(connections, partsLength) {
        if (!Array.isArray(connections)) return [];
        const clean = [];
        for (const c of connections.slice(0, AnazhRealm.CONNECTION_MAX_PER_BLUEPRINT)) {
            if (!c || typeof c !== "object") continue;
            const typeDef = AnazhRealm.CONNECTION_TYPES[c.type];
            // Strukturell valide Verbindung mit UNBEKANNTEM Typ wird BEWAHRT (must-preserve: connections sind
            // signierte Substanz, Droppen kippte die Signatur auf „modified"). Die Leser ignorieren sie
            // (computeConnectionStrength → 0, computeMotionRoles nur bekannte Typen, _attachPointFor exakte
            // kinds); Struktur-Müll fällt.
            if (!typeDef) {
                const type = typeof c.type === "string" ? c.type.slice(0, 40) : "";
                if (!type) continue;
                const pA = Number(c.partA);
                const pB = Number(c.partB);
                if (!Number.isInteger(pA) || pA < 0 || pA >= partsLength) continue;
                if (!Number.isInteger(pB) || pA === pB || pB >= partsLength || pB < -1) continue;
                clean.push({ type, partA: pA, partB: pB });
                continue;
            }
            const partA = Number(c.partA);
            if (!Number.isInteger(partA) || partA < 0 || partA >= partsLength) continue;
            // V18.110 — C7: ein ATTACHMENT-Punkt (griff/sitz/trage) sitzt an
            // partA allein — partB ist optional (-1 = die Außenwelt).
            if (typeDef.attachment) {
                const partB = Number.isInteger(Number(c.partB)) ? Number(c.partB) : -1;
                const entry = { type: c.type, partA, partB: partB >= 0 && partB < partsLength ? partB : -1 };
                // M1(b) (V18.156) — der Face-Snap-Anker ist SUBSTANZ und reist
                // (3 finite Zahlen, geklemmt ±64 — Struktur-Müll fällt weiter).
                if (
                    c.anchor &&
                    Number.isFinite(Number(c.anchor.x)) &&
                    Number.isFinite(Number(c.anchor.y)) &&
                    Number.isFinite(Number(c.anchor.z))
                ) {
                    const cl = (v) => Math.max(-64, Math.min(64, Number(v)));
                    entry.anchor = { x: cl(c.anchor.x), y: cl(c.anchor.y), z: cl(c.anchor.z) };
                }
                clean.push(entry);
                continue;
            }
            const partB = Number(c.partB);
            if (!Number.isInteger(partB)) continue;
            if (partA === partB) continue;
            if (partB < 0 || partB >= partsLength) continue;
            const entry = { type: c.type, partA, partB };
            // Die AUTO-Marke (Kontakt-Emergenz) ist Metadatum wie anchor, NICHT im Signatur-Kanon
            // (_canonicalBlueprint liest nur type/partA/partB). Auto-Verbindungen lösen sich beim Trennen (Typ
            // folgt der Substanz); bewusst gewählte bleiben.
            if (c.auto) entry.auto = 1;
            clean.push(entry);
        }
        return clean;
    }

    addConnectionToBlueprint(name, connection) {
        const bp = this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.builtIn) return { ok: false, reason: "cannot_modify_builtin" };
        if (!Array.isArray(bp.connections)) bp.connections = [];
        if (bp.connections.length >= AnazhRealm.CONNECTION_MAX_PER_BLUEPRINT) {
            return { ok: false, reason: "too_many_connections" };
        }
        const valid = this.validateBlueprintConnections([connection], bp.parts.length);
        if (valid.length === 0) return { ok: false, reason: "invalid_connection" };
        this._recordBlueprintEdit(name); // V17.87 — Edit-Verlauf
        bp.connections.push(valid[0]);
        return { ok: true, index: bp.connections.length - 1 };
    }

    removeConnectionFromBlueprint(name, index) {
        const bp = this.state.blueprints[name];
        if (!bp || bp.builtIn) return false;
        if (!Array.isArray(bp.connections) || index < 0 || index >= bp.connections.length) return false;
        this._recordBlueprintEdit(name); // V17.87 — Edit-Verlauf
        bp.connections.splice(index, 1);
        return true;
    }

    // ATTACHMENT-PUNKT — die EINE Quelle für griff (Hand) · sitz (Reiter) · trage (Torso). Explizit =
    // connections-Zeile {type: griff|sitz|trage, partA}; sonst emergiert aus Form × Lage: griff =
    // stiel-artigster Part, sitz = oberste flache Fläche nahe der Mitte, trage = volumen-gewichtetes
    // Masse-Zentrum. Rückgabe BAUPLAN-LOKAL {part, point}; Skala/Orientierung macht der Konsument
    // (_refreshHeldMesh · _tickWornArmorVisual · mountArchitecture).
    _attachPointFor(bp, kind) {
        if (!bp || !Array.isArray(bp.parts) || !bp.parts.length) return { part: null, point: { x: 0, y: 0, z: 0 } };
        const parts = bp.parts;
        // (1) der EXPLIZITE Punkt (Intent schlägt Emergenz).
        if (Array.isArray(bp.connections)) {
            const c = bp.connections.find((cn) => cn && cn.type === kind);
            if (c && parts[c.partA]) {
                const p = parts[c.partA];
                const pos = p.position || { x: 0, y: 0, z: 0 };
                // FACE-SNAP-Anker: ein gesetzter Punkt (Part-Zentrum + anchor, Bauplan-Achsen) gilt wörtlich.
                if (
                    c.anchor &&
                    Number.isFinite(c.anchor.x) &&
                    Number.isFinite(c.anchor.y) &&
                    Number.isFinite(c.anchor.z)
                ) {
                    return {
                        part: c.partA,
                        point: {
                            x: (pos.x || 0) + c.anchor.x,
                            y: (pos.y || 0) + c.anchor.y,
                            z: (pos.z || 0) + c.anchor.z,
                        },
                    };
                }
                const sy = Math.abs((p.size && p.size.y) || 0.3);
                // sitz zeigt auf die OBERSEITE des Parts, griff/trage aufs Zentrum.
                const y = kind === "sitz" ? (pos.y || 0) + sy / 2 : pos.y || 0;
                return { part: c.partA, point: { x: pos.x || 0, y, z: pos.z || 0 } };
            }
        }
        // (2) EMERGENZ aus Form × Lage.
        const dims = (p) => ({
            sx: Math.abs((p.size && p.size.x) || 0.3),
            sy: Math.abs((p.size && p.size.y) || 0.3),
            sz: Math.abs((p.size && p.size.z) || 0.3),
        });
        if (kind === "griff") {
            // der stiel-artigste Part: längste/mittlere Achse maximal, dünn bevorzugt.
            let best = null;
            let bestScore = 0;
            for (let i = 0; i < parts.length; i++) {
                const d = dims(parts[i]);
                const axes = [d.sx, d.sy, d.sz].sort((a, b) => b - a);
                const elong = axes[0] / Math.max(0.01, axes[1]);
                const thin = 1 / Math.max(0.05, axes[2]);
                const score = elong * Math.min(4, thin);
                if (score > bestScore) {
                    bestScore = score;
                    best = i;
                }
            }
            if (best !== null) {
                const pos = parts[best].position || { x: 0, y: 0, z: 0 };
                return { part: best, point: { x: pos.x || 0, y: pos.y || 0, z: pos.z || 0 } };
            }
        }
        if (kind === "sitz") {
            // die oberste FLACHE Fläche nahe der XZ-Mitte (breite Oberseite).
            let best = null;
            let bestScore = -Infinity;
            for (let i = 0; i < parts.length; i++) {
                const d = dims(parts[i]);
                const pos = parts[i].position || { x: 0, y: 0, z: 0 };
                const flat = Math.min(d.sx, d.sz) / Math.max(0.05, d.sy); // breit + niedrig = Sitzfläche
                if (flat < 0.8) continue;
                const top = (pos.y || 0) + d.sy / 2;
                const centerBias = -(Math.abs(pos.x || 0) + Math.abs(pos.z || 0)) * 0.5;
                const score = top + Math.min(2, flat) * 0.3 + centerBias;
                if (score > bestScore) {
                    bestScore = score;
                    best = i;
                }
            }
            if (best !== null) {
                const p = parts[best];
                const pos = p.position || { x: 0, y: 0, z: 0 };
                return {
                    part: best,
                    point: { x: pos.x || 0, y: (pos.y || 0) + dims(p).sy / 2, z: pos.z || 0 },
                };
            }
        }
        // trage (+ Fallback aller Arten): das volumen-gewichtete MASSE-ZENTRUM.
        let vx = 0;
        let vy = 0;
        let vz = 0;
        let vSum = 0;
        for (const p of parts) {
            const d = dims(p);
            const v = Math.max(1e-4, d.sx * d.sy * d.sz);
            const pos = p.position || { x: 0, y: 0, z: 0 };
            vx += (pos.x || 0) * v;
            vy += (pos.y || 0) * v;
            vz += (pos.z || 0) * v;
            vSum += v;
        }
        return { part: null, point: { x: vx / vSum, y: vy / vSum, z: vz / vSum } };
    }

    // ### Maschinen-Rekursivität ###
    // Maschinen sind Compounds: ihre Präzision kommt aus der Präzision ihrer Bauteile (präzises Werkstück
    // ← präzise Drehbank ← mittlere Werkzeuge ← … Faustkeil).

    // Präzisions-Cap eines Bauplans als Werkzeug = Minimum aller Part-Präzisionen (eine schiefe Spindel
    // zieht die ganze Drehbank runter).
    computeBlueprintPrecisionCap(blueprint) {
        if (!blueprint || !Array.isArray(blueprint.parts) || blueprint.parts.length === 0) return 0;
        let min = 1;
        for (const part of blueprint.parts) {
            const p = this.computePartPrecision(part);
            if (p < min) min = p;
        }
        return min;
    }

    // ### Werkzeug-Domains + emergente Bauplan-Rolle ###
    // Die Rolle EMERGIERT aus Material × Form × Werkzeug (Compound-Tags + Werkzeug-Domains).

    // Häufigste Domain über alle opChain-Einträge aller Parts (null ohne domain-Ops); generische Werkzeuge
    // (domain=null) zählen nicht. Gleichstand → Reihenfolge in TOOL_DOMAINS (deterministisch).
    computeBlueprintDomain(blueprint) {
        const counts = this.computeBlueprintDomainCounts(blueprint);
        let best = null;
        let bestCount = 0;
        for (const dom of AnazhRealm.TOOL_DOMAINS) {
            const c = counts[dom] || 0;
            if (c > bestCount) {
                bestCount = c;
                best = dom;
            }
        }
        return best;
    }

    // Domain-Verteilung als Map<domain, count> — für die Werkstatt-UI (welche Domain dominiert, wo
    // emergiert die nächste Rolle).
    computeBlueprintDomainCounts(blueprint) {
        const counts = {};
        if (!blueprint || !Array.isArray(blueprint.parts)) return counts;
        for (const part of blueprint.parts) {
            if (!part || !Array.isArray(part.opChain)) continue;
            for (const op of part.opChain) {
                if (!op || typeof op.tool !== "string") continue;
                const tool = this.state.tools && this.state.tools[op.tool];
                if (!tool) continue;
                const dom = tool.domain;
                if (!dom || typeof dom !== "string") continue;
                if (!AnazhRealm.TOOL_DOMAINS.includes(dom)) continue;
                counts[dom] = (counts[dom] || 0) + 1;
            }
        }
        return counts;
    }

    // Forging-Split: dominante Domain "forging" → "tool", wenn die Compound-Tags die
    // FORGING_TOOL_TAGS-Seite (härte/magieleitung/stromleitung) stärker tragen, sonst "armor"
    // (dichte/zähigkeit/wärmeleitung).
    _computeForgingRole(blueprint) {
        const tags = this.computeCompoundTags(blueprint) || {};
        let toolScore = 0;
        let armorScore = 0;
        for (const t of AnazhRealm.FORGING_TOOL_TAGS) toolScore += tags[t] || 0;
        for (const t of AnazhRealm.FORGING_ARMOR_TAGS) armorScore += tags[t] || 0;
        return toolScore >= armorScore ? "tool" : "armor";
    }

    // Substanz-Rolle: zuerst die Krafting-Geschichte — die dominante opChain-Domain über DOMAIN_TO_ROLE
    // (forging → _computeForgingRole); die bewusste Werkzeug-Wahl ist Intent und hat Vorrang. Sonst die
    // Form/Substanz-RESONANZ (_computeFormRole). Das Portal-ZIEL (portalMeta.world) emergiert nie — es ist
    // autoriert (setBlueprintAsPortal), wie toolMeta/consumableMeta.
    computeBlueprintRole(blueprint) {
        const dom = this.computeBlueprintDomain(blueprint);
        if (dom) {
            const role = AnazhRealm.DOMAIN_TO_ROLE[dom];
            if (role === "forging-split") return this._computeForgingRole(blueprint);
            if (role) return role;
        }
        // R3 (§11.10) — sonst: die intrinsische Form/Substanz als RESONANZ (statt der priority-Prädikat-Kette).
        return this._computeFormRole(blueprint);
    }

    // PRODUKT-VEKTOR: Material-Tags (10) ⊕ räumliche Signatur als numerische Achsen. KONJUNKTIVE Geometrie
    // (Körper = Symmetrie UND Vertikalität UND Glieder) kommt als 0/1-Achse aus den Prädikaten — eine
    // lineare Summe bräche die Konjunktion (ein flaches symmetrisches Dorf läse als Körper).
    _blueprintProductVector(bp) {
        const v = Object.assign({}, this.computeCompoundTags(bp) || {});
        // Material-Tags auf [0..1] normieren (÷ PRODUCT_VECTOR_TAG_NORM): roh liegen sie in [0..3], die
        // Form-Achsen in [0..1] → dichte überstimmte die Form, das Spektrum sättigte. So bestimmen die
        // Signatur-GEWICHTE die Rolle, nicht die Magnitude. Nur hier (Resonanz-Leser) — computeCompoundTags
        // bleibt roh (Spawn-Affinität/Emotion/STAT_FROM_TAGS lesen die Magnitude).
        const norm = AnazhRealm.PRODUCT_VECTOR_TAG_NORM;
        for (const k of AnazhRealm.MATERIAL_TAG_KEYS) {
            v[k] = Math.max(0, Math.min(1, (v[k] || 0) / norm));
        }
        v.bodyShape = this._isBodyShaped(bp) ? 1 : 0;
        v.portalShape = this._isPortalShaped(bp) ? 1 : 0;
        // `livingBody` = Körper-Form UND beseeltes MATERIAL (Konjunktion als 0/1-Achse). Das
        // compound-`lebendig` taugt NICHT: eine box maskiert es (FORM_TAG_ACTIVATION[box][lebendig]=0) → wir
        // lesen das UNMASKIERTE Material-lebendig (MAX über die Parts), und NUR über nicht-vegetative
        // Materialien: holz/laub/kraut/erde leben, sind aber unbeseelt → ein Baum fällt auf architecture.
        let maxMatLebendig = 0;
        const _mats = this.state.materials || {};
        const soulless = AnazhRealm.SOULLESS_SUBSTANCES;
        for (const p of bp.parts || []) {
            if (soulless && soulless.has(p.material)) continue; // Pflanze/Erde: lebt, beseelt nicht
            const ml = (_mats[p.material] && _mats[p.material].tags && _mats[p.material].tags.lebendig) || 0;
            if (ml > maxMatLebendig) maxMatLebendig = ml;
        }
        v.livingBody = v.bodyShape === 1 && maxMatLebendig > 0.3 ? 1 : 0;
        // S10 (kampf-plan §11.10) — die Katalysator-Geometrie: der Anteil spitzer/klingen-Parts (W2). Eine
        // weitere Achse des EINEN Produkt-Vektors (die Rollen-Resonanz ignoriert sie, die Op-Resonanz liest sie).
        v.pointedFraction = this._blueprintPointedFraction(bp);
        // Die räumlichen Form-Achsen (die 5 Prinzipien) als numerische Achsen DESSELBEN Vektors, damit jede
        // Lesart (Rolle/Stat/Affordanz) die volle Form liest. Additiv: nur Signaturen, die sie lesen, zählen.
        const ext = this._compoundVisualExtent(bp);
        const dims = [ext.dx || 0, ext.dy || 0, ext.dz || 0].sort((a, b) => b - a);
        const longest = dims[0] || 0;
        const middle = Math.max(dims[1] || 0, 0.001);
        v.elongation = Math.max(0, Math.min(1, (longest / middle - 1) / 3)); // Nadel/Klinge/Stab vs Klotz
        // hohlraum: wie viel des Hüll-Volumens NICHT mit Part-Masse gefüllt ist (Behälter/Ring vs Vollkörper)
        let partVol = 0;
        for (const p of bp.parts || []) {
            const s = p.size || { x: 1, y: 1, z: 1 };
            partVol += Math.abs((s.x || 1) * (s.y || 1) * (s.z || 1));
        }
        const extVol = (ext.dx || 0) * (ext.dy || 0) * (ext.dz || 0);
        v.hollowness = extVol > 0.001 ? Math.max(0, Math.min(1, 1 - partVol / extVol)) : 0;
        v.axialSymmetry = (this._compoundSymmetry(bp) || {}).ratio || 0; // Symmetrieachse trägt Alignment
        v.spread = this._compoundSpread(bp); // Trag-Basis (Fahrzeug/Bauwerk) vs Säule (Mast/Stab)
        // `rideable` = Konjunktion „deklarierter SITZ (connections) UND _isMoveable (Trag-Basis + Antrieb)":
        // Wagen/Holzross → Fahrzeug, Stein-Stuhl (kein Antrieb) → Bauwerk, Avatar (kein sitz) → Seele.
        // _isMoveable ist die robuste EINE Quelle (Glieder-Zählung wäre fragil: Holzross-Beine = scharnier).
        const hasSitz = Array.isArray(bp.connections) && bp.connections.some((c) => c && c.type === "sitz");
        v.rideable = hasSitz && this._isMoveable(bp) ? 1 : 0;
        // `bulk`: Größe jenseits der Greifbarkeit, (span − 2 m)/6 gekappt — was größer ist als du, trinkst du
        // nicht (Baum 0.83, Trank 0). consumable liest es NEGATIV, architecture POSITIV.
        v.bulk = Math.max(0, Math.min(1, (longest - 2) / 6));
        // ── Physik speist den Leser ──
        // Die gerechnete Physik (_stability …) als Achsen DESSELBEN Vektors, additiv +
        // [0,1]-skalen-konsistent; nur selektiv eingewebte Signaturen lesen sie, der Warum-Chip zitiert sie
        // getrennt von den Konventions-Achsen. Bau-/Edit-Zeit, nicht pro Frame.
        const physStab = this._stability(bp);
        v.stability = physStab.margin; // Ω-Φ2: CoM über Stützpolygon (SSF) — „steht WIRKLICH"
        const physBend = this._bendingStiffness(bp);
        v.stiffness = Math.max(0, Math.min(1, Math.sqrt(physBend.Imin) / Math.max(1e-4, physBend.area))); // Ω-Φ3: Biege-Effizienz
        const physSwing = this._swingDynamics(bp);
        v.balance = Math.max(0, Math.min(1, physSwing.balance / Math.max(0.001, longest))); // Ω-Φ4: Kopflastigkeit rel. Länge
        v.leverage = Math.max(0, Math.min(1, v.balance * v.bulk)); // Ω-Φ4: τ-Potenzial (Kopf weit + massiv)
        const physLoad = this._loadPath(bp);
        v.loadSound = physLoad.intact ? 1 : Math.max(0, 1 - physLoad.floatingFrac); // Ω-Φ5: Lastpfad zum Boden intakt
        v.rollable = this._rollableFraction(bp); // Ω-Φ2/L2: rollt am Boden (nicht „rund")
        return v;
    }

    // DIE HÜLLE DER TEILE (Bauplan-Einheiten): die achsen-parallele Box über die rotations-bewussten Hüllen aller Teile
    // (`_partWorldExtents`) — { x0, x1, y0, y1, z0, z1 } oder null. Leser: die Spanne eines Geräts (`_geraetSpanne`) und die
    // Höhe eines Werks im Wasser (`_fahrzeugGestalt`).
    _teileHuelle(bp) {
        const h = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity, z0: Infinity, z1: -Infinity };
        for (const p of (bp && bp.parts) || []) {
            const e = this._partWorldExtents(p);
            const q = p.position || {};
            const [x, y, z] = [q.x || 0, q.y || 0, q.z || 0];
            h.x0 = Math.min(h.x0, x - e.ex / 2);
            h.x1 = Math.max(h.x1, x + e.ex / 2);
            h.y0 = Math.min(h.y0, y - e.ey / 2);
            h.y1 = Math.max(h.y1, y + e.ey / 2);
            h.z0 = Math.min(h.z0, z - e.ez / 2);
            h.z1 = Math.max(h.z1, z + e.ez / 2);
        }
        return h.x1 > h.x0 ? h : null;
    }

    // ROTATIONS-BEWUSSTE Welt-Hülle eines Parts: konservative AABB |R|·s auf Three.js' EXAKTER Euler-XYZ-
    // Matrix (makeRotationFromEuler-Zeilen), damit sie dem Renderer entspricht. Liefert {ex, ey, ez} =
    // volle Welt-Ausdehnung je Achse.
    _partWorldExtents(p) {
        const s = (p && p.size) || {};
        const sx = Math.abs(Number(s.x) || 0.3);
        const sy = Math.abs(Number(s.y) || 0.3);
        const sz = Math.abs(Number(s.z) || 0.3);
        const rot = p && p.rotation;
        if (!rot || (!rot.x && !rot.y && !rot.z)) return { ex: sx, ey: sy, ez: sz };
        const a = Math.cos(rot.x || 0);
        const b = Math.sin(rot.x || 0);
        const c = Math.cos(rot.y || 0);
        const d = Math.sin(rot.y || 0);
        const e = Math.cos(rot.z || 0);
        const f = Math.sin(rot.z || 0);
        const ae = a * e;
        const af = a * f;
        const be = b * e;
        const bf = b * f;
        // Zeilen von R (Three.js 'XYZ'): Welt-Extent_i = Σ_j |R[i][j]| · s_j.
        const ex = Math.abs(c * e) * sx + Math.abs(c * f) * sy + Math.abs(d) * sz;
        const ey = Math.abs(af + be * d) * sx + Math.abs(ae - bf * d) * sy + Math.abs(b * c) * sz;
        const ez = Math.abs(bf - ae * d) * sx + Math.abs(be + af * d) * sy + Math.abs(a * c) * sz;
        return { ex, ey, ez };
    }

    // §7.1 — die rotations-bewusste Welt-AABB (Kontakt-Wahrheit; min-Floor 0.1
    // je Achse wie _partBoundingBox, damit Mini-Parts greifbar bleiben).
    _partWorldAABB(part) {
        if (!part || typeof part !== "object") return null;
        const pos = part.position || { x: 0, y: 0, z: 0 };
        const ext = this._partWorldExtents(part);
        const hx = Math.max(0.1, ext.ex) / 2;
        const hy = Math.max(0.1, ext.ey) / 2;
        const hz = Math.max(0.1, ext.ez) / 2;
        return {
            min: { x: (pos.x || 0) - hx, y: (pos.y || 0) - hy, z: (pos.z || 0) - hz },
            max: { x: (pos.x || 0) + hx, y: (pos.y || 0) + hy, z: (pos.z || 0) + hz },
        };
    }

    // M3(a)/V18.155 — die vertikale Halb-Ausdehnung eines Parts, ROTATIONS-bewusst:
    // ein liegendes Wagen-Rad (rotation.z=π/2, size 0.62/0.14/0.62) ist vertikal 0.31 hoch.
    // §7.1 (V18.164) — verdichtet auf die EINE Hüllen-Quelle (_partWorldExtents).
    _partVerticalHalfExtent(p) {
        return this._partWorldExtents(p).ey / 2;
    }

    // M3(a)/V18.155 — die UNTERKANTE eines Bauplans (Bauplan-lokal): min über die
    // Parts von (pos.y − vertikale Halb-Ausdehnung). Die Boden-Klärung des Gefährts:
    // entry.y = Terrain − bottomY ⇒ die Rad-Unterkante berührt den Boden.
    _compoundBottomY(bp) {
        if (!bp || !Array.isArray(bp.parts) || !bp.parts.length) return 0;
        let min = Infinity;
        for (const p of bp.parts) {
            const y = ((p && p.position && p.position.y) || 0) - this._partVerticalHalfExtent(p);
            if (y < min) min = y;
        }
        return Number.isFinite(min) ? min : 0;
    }

    // U1 (resonanz-system §2.2) — die Standflächen-Spreizung als 0–1-Achse (Trag-Basis vs Säule): die
    // _isMoveable-Logik extrahiert — wie weit die unteren (Stütz-)Parts in der x-z-Ebene spreizen, relativ
    // zur Compound-Breite. Eine Säule (Stamm-Stapel) ~0; eine Trag-Basis (Räder/Beine/Fundament) spreizt.
    _compoundSpread(bp) {
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length < 2) return 0;
        const support = this._partsBelowMidline(bp, 0.5);
        if (support.length < 2) return 0;
        const bbox = this._compoundBBox(bp);
        if (!bbox) return 0;
        let sMinX = Infinity,
            sMaxX = -Infinity,
            sMinZ = Infinity,
            sMaxZ = -Infinity;
        for (const p of support) {
            const pos = p.position || { x: 0, y: 0, z: 0 };
            const px = pos.x || 0,
                pz = pos.z || 0;
            if (px < sMinX) sMinX = px;
            if (px > sMaxX) sMaxX = px;
            if (pz < sMinZ) sMinZ = pz;
            if (pz > sMaxZ) sMaxZ = pz;
        }
        const compW = Math.max(bbox.max.x - bbox.min.x, bbox.max.z - bbox.min.z, 0.001);
        return Math.max(0, Math.min(1, Math.max(sMaxX - sMinX, sMaxZ - sMinZ) / compW));
    }

    // DIE ZEILE EINES STOFFS (stoffe.K1): der EINE Leser der Stoff-Tafel (`state.materials`, `_defaultMaterials`) — jede Wirkung
    // liest ihre Spalte hier (Dichte, Reibung des Leibs und des Rads, Wärme, Zündung, Schmelze, Klang). Ein eigener Stoff (DSL
    // `define_material`, eine geladene Welt) liest die Zeile seines nächsten Verwandten unter den eingebauten — der kleinste
    // Abstand über die Tag-Achsen (MATERIAL_TAG_KEYS), an seiner Zeile gemerkt (`verwandt`) und je Ruf aus dessen Zeile gelesen.
    // Ohne Zeile oder Verwandten null, laut beim Namen der Folge `folge` (der EINE Melder).
    _stoff(name, folge = "„" + name + "“ hat weder Zeile noch Verwandten in der Stoff-Tafel") {
        const mats = this.state.materials || {};
        const z = mats[name];
        if (!z) {
            this._bruchMelden("STOFF-ZEILE fehlt: " + folge);
            return null;
        }
        if (z.builtIn) return z;
        const von = z.verwandt && mats[z.verwandt];
        if (von && von.builtIn) return von;
        const best = this._stoffVerwandt(z.tags);
        if (!best) {
            this._bruchMelden("STOFF-ZEILE ohne Verwandten: " + folge);
            return null;
        }
        z.verwandt = best.name;
        return best;
    }

    // DER NÄCHSTE VERWANDTE eines Tag-Profils: die eingebaute Zeile mit dem kleinsten Abstand über die Tag-Achsen
    // (MATERIAL_TAG_KEYS) — ein eigener Stoff (`_stoff`) und ein Stoff, der nur Tags trägt (`_stoffOptik`), lesen ihre Zeile.
    _stoffVerwandt(tags) {
        const mats = this.state.materials || {};
        const t = tags || {};
        let best = null,
            bestD = Infinity;
        for (const k of Object.keys(mats)) {
            const b = mats[k];
            if (!b || !b.builtIn) continue;
            let d = 0;
            for (const a of AnazhRealm.MATERIAL_TAG_KEYS) d += ((t[a] || 0) - ((b.tags && b.tags[a]) || 0)) ** 2;
            if (d < bestD) ((bestD = d), (best = b));
        }
        return best;
    }

    // DIE OPTIK EINES STOFFS (material.K5): die Zeile, deren Rauheit und Metall ein Stoff trägt — beim Namen (`_stoff`, ein
    // eigener Stoff die seines Verwandten) oder, trägt der Bau nur Tags, die des nächsten Verwandten (`_stoffVerwandt`).
    // Der gebaute Stoff merkt sich bei ihr (`_stoffOptikMerke`): eine Änderung der Zeile (`rauheit`, `metall`) setzt ihn neu
    // (`_stoffOptikWirkt`) — r184 liest Rauheit und Metall je Bild aus dem Stoff, kein Programm baut neu. Ohne Zeile null.
    _stoffOptik(name, tags) {
        if (name == null && tags == null) return null;
        const z =
            name != null ? this._stoff(name, "der Stoff „" + name + "“ trägt keine Optik") : this._stoffVerwandt(tags);
        return z && Number.isFinite(z.rauheit) ? z : null;
    }
    _stoffOptikMerke(zeile, mat) {
        const L = this._stoffOptikLeser || (this._stoffOptikLeser = new Map());
        if (!L.has(zeile)) L.set(zeile, new Set());
        const ref = new WeakRef(mat);
        L.get(zeile).add(ref);
        mat.addEventListener("dispose", () => L.get(zeile).delete(ref));
    }
    _stoffOptikWirkt(zeile) {
        const z = this.state.materials && this.state.materials[zeile];
        const L = this._stoffOptikLeser && this._stoffOptikLeser.get(zeile);
        if (!z || !L) return 0;
        let n = 0;
        for (const ref of [...L]) {
            const mat = ref.deref();
            if (!mat) {
                L.delete(ref);
                continue;
            }
            mat.roughness = mat.userData.pbrRoughness = z.rauheit;
            mat.metalness = mat.userData.pbrMetalness = z.metall;
            n++;
        }
        return n;
    }

    // DIE DICHTE EINES STOFFS (kg/m³, physik K1): die Spalte rho seiner Zeile. Vorher wog jedes Teil Volumen × die Tag-Achse
    // dichte [0,1] (Holz 0,4 · Stein 0,85 · Eisen 0,9 je Einheit, unbekannt 0,5): Stein wog 2,1 Holz statt 3,7, Eisen 2,25
    // statt 10,9. Ein Teil ohne Zeile wiegt nichts.
    _stoffRho(name) {
        const z = this._stoff(name, "das Teil aus „" + name + "“ wiegt nichts");
        return z ? z.rho : 0;
    }

    // DAS VOLUMEN EINES TEILS (m³ in Bauplan-Einheiten): das Volumen seiner GESTALT — das Mesh, das `_makePartGeometry` für
    // diese Form baut, über den Divergenz-Satz (Σ a · (b × c) / 6 je Dreieck; eine flache Form trägt keins), je Form und Maß
    // gemerkt (eine Zahl je Form, das Netz fällt sofort). Vorher die Box der Größe für jede Form: ein Speichen-Rad wog wie seine volle Scheibe (Wagen-Rad 0,100 statt
    // 0,031 m³), eine Kugel 1,9-fach.
    _teilVolumen(p) {
        if (!p) return 0;
        const memo = this._teilVolumenMemo || (this._teilVolumenMemo = new Map());
        // der Schlüssel ist die Form: alles am Teil außer Lage, Drehung, Stoff, Farbe und Werkzeug-Spur
        const key = JSON.stringify(p, function (k, v) {
            return this === p && AnazhRealm.TEIL_FORM_FREI.includes(k) ? undefined : v;
        });
        let v = memo.get(key);
        if (v === undefined) {
            const geo = this._makePartGeometry(p);
            const pos = geo && geo.attributes && geo.attributes.position;
            v = 0;
            if (pos) {
                const a = pos.array;
                const ix = geo.index ? geo.index.array : null;
                const n = ix ? ix.length : pos.count;
                for (let t = 0; t + 2 < n; t += 3) {
                    const i = 3 * (ix ? ix[t] : t);
                    const j = 3 * (ix ? ix[t + 1] : t + 1);
                    const k = 3 * (ix ? ix[t + 2] : t + 2);
                    v +=
                        (a[i] * (a[j + 1] * a[k + 2] - a[j + 2] * a[k + 1]) -
                            a[i + 1] * (a[j] * a[k + 2] - a[j + 2] * a[k]) +
                            a[i + 2] * (a[j] * a[k + 1] - a[j + 1] * a[k])) /
                        6;
                }
                v = Math.abs(v);
            }
            if (geo && typeof geo.dispose === "function") geo.dispose();
            memo.set(key, v); // je Form EINE Zahl, nie geleert: eine Welt trägt ~1 500 Formen (ein Deckel von 512 baute je Gang 1 450 Netze neu)
        }
        return v;
    }

    // DIE MASSE EINES TEILS (kg): das Volumen seiner Gestalt (`_teilVolumen`, die Bauplan-Einheit ist der Meter) × ρ seiner
    // Stoff-Zeile (`_stoffRho`) — der EINE Leser, über den Schwerpunkt, Schwung-Trägheit, Lastpfad und das Gefährt im Wasser
    // wiegen.
    _teilMasse(p) {
        return this._teilVolumen(p) * this._stoffRho(p.material);
    }

    // ═══ Ω-PHYSIS · Ω-Φ1 — SCHWERPUNKT + MASSE ═══
    // Der EINE Richter für Stabilität · Balance · Hebel: jedes Teil = Punktmasse am Zentrum, gewichtet mit seiner Masse
    // in kg (`_teilMasse`: Volumen × ρ der Stoff-Zeile; die Bauplan-Einheit ist der Meter). Bau-/Edit-Zeit, vom Aufrufer
    // gecacht — nicht pro Frame.
    _compoundCenterOfMass(bp) {
        const out = { com: { x: 0, y: 0, z: 0 }, mass: 0 };
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length === 0) return out;
        let mx = 0,
            my = 0,
            mz = 0,
            mass = 0;
        for (const p of bp.parts) {
            const m = this._teilMasse(p);
            const pos = p.position || { x: 0, y: 0, z: 0 };
            mx += (pos.x || 0) * m;
            my += (pos.y || 0) * m;
            mz += (pos.z || 0) * m;
            mass += m;
        }
        if (mass <= 0) return out;
        out.com.x = mx / mass;
        out.com.y = my / mass;
        out.com.z = mz / mass;
        out.mass = mass;
        return out;
    }

    // ── Ω-PHYSIS · Geometrie-Helfer ──
    // Andrew's monotone chain: konvexe Hülle einer (x,z)-Punktwolke gegen den Uhrzeigersinn, O(n log n);
    // kollineare/Doppelpunkte werden geschluckt.
    _convexHull2D(points) {
        const pts = (points || []).slice().sort((a, b) => a.x - b.x || a.z - b.z);
        const n = pts.length;
        if (n < 3) return pts;
        const cross = (o, a, b) => (a.x - o.x) * (b.z - o.z) - (a.z - o.z) * (b.x - o.x);
        const lower = [];
        for (let i = 0; i < n; i++) {
            while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], pts[i]) <= 0)
                lower.pop();
            lower.push(pts[i]);
        }
        const upper = [];
        for (let i = n - 1; i >= 0; i--) {
            while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], pts[i]) <= 0)
                upper.pop();
            upper.push(pts[i]);
        }
        lower.pop();
        upper.pop();
        return lower.concat(upper);
    }

    // Polygon-Fläche (Schnürsenkel-Formel, Betrag) + Schwerpunkt-im-Polygon-Test
    // + kürzester Abstand zu einer Kante. Die drei Bausteine des Stabilitäts-Richters.
    _polygonArea2D(poly) {
        let a = 0;
        for (let i = 0, n = poly.length; i < n; i++) {
            const p = poly[i],
                q = poly[(i + 1) % n];
            a += p.x * q.z - q.x * p.z;
        }
        return Math.abs(a) / 2;
    }
    _pointInPolygon2D(p, poly) {
        let inside = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            const a = poly[i],
                b = poly[j];
            if (a.z > p.z !== b.z > p.z && p.x < ((b.x - a.x) * (p.z - a.z)) / (b.z - a.z || 1e-9) + a.x)
                inside = !inside;
        }
        return inside;
    }
    _distToPolygonEdge2D(p, poly) {
        let best = Infinity;
        for (let i = 0, n = poly.length; i < n; i++) {
            const a = poly[i],
                b = poly[(i + 1) % n];
            const dx = b.x - a.x,
                dz = b.z - a.z;
            const len2 = dx * dx + dz * dz || 1e-9;
            let t = ((p.x - a.x) * dx + (p.z - a.z) * dz) / len2;
            t = Math.max(0, Math.min(1, t));
            const cx = a.x + t * dx,
                cz = a.z + t * dz;
            const d = Math.hypot(p.x - cx, p.z - cz);
            if (d < best) best = d;
        }
        return best;
    }

    // ═══ Ω-PHYSIS · Ω-Φ2 — STÜTZPOLYGON + STABILITÄT ═══
    // „Steht WIRKLICH" statt „Basis breit" (`_compoundSpread`): sitzt der Schwerpunkt über der konvexen
    // Hülle der Bodenkontakte? (ein breiter kopflastiger Turm kippt). Dasselbe Polygon beurteilt
    // Fahrzeug-Stabilität UND Kreatur-Stand (CoM über dem Fuß-Stützpolygon).
    // `boden` — DAS GESETZTE WERK: sein Grund ist die Höhe `boden` im Plan (beim Setzen 0, das Werkstatt-Gitter und der Grund,
    // auf den das Setzen den Plan stellt; nach einem Fall sein tiefstes Teil); ein Plan, dessen tiefstes Teil über dem
    // Kontakt-Band schwebt, hat keinen Bodenkontakt, ein Teil darunter steckt im Grund. Ohne: die Form an sich (ihr tiefstes
    // Teil trägt — die Achse des Produkt-Vektors).
    _supportPolygon(bp, boden) {
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length === 0) return null;
        let minBottom = Infinity,
            maxTop = -Infinity;
        const aabbs = [];
        for (const p of bp.parts) {
            const a = this._partWorldAABB(p);
            if (!a) continue;
            aabbs.push(a);
            if (a.min.y < minBottom) minBottom = a.min.y;
            if (a.max.y > maxTop) maxTop = a.max.y;
        }
        if (!aabbs.length) return null;
        const totalH = Math.max(0.001, maxTop - minBottom);
        const band = Math.max(0.1, totalH * AnazhRealm.PHYSIS.groundBandFrac);
        const grund = Number.isFinite(boden) ? Math.min(boden, minBottom) : minBottom;
        const pts = [];
        for (const a of aabbs) {
            if (a.min.y > grund + band) continue;
            pts.push({ x: a.min.x, z: a.min.z });
            pts.push({ x: a.max.x, z: a.min.z });
            pts.push({ x: a.max.x, z: a.max.z });
            pts.push({ x: a.min.x, z: a.max.z });
        }
        const hull = this._convexHull2D(pts);
        const area = hull.length >= 3 ? this._polygonArea2D(hull) : 0;
        return { hull, area, contactCount: pts.length / 4, boden: grund, totalH };
    }
    _stability(bp, boden) {
        const com = this._compoundCenterOfMass(bp);
        const poly = this._supportPolygon(bp, boden);
        if (!poly || poly.hull.length < 3 || poly.area < 1e-4) {
            // entartete Basis (ein Punkt/eine Linie — ein einbeiniger Mast) → kippt
            return { inside: false, margin: 0, area: poly ? poly.area : 0, com: com.com, mass: com.mass };
        }
        const p = { x: com.com.x, z: com.com.z };
        const inside = this._pointInPolygon2D(p, poly.hull);
        const dEdge = this._distToPolygonEdge2D(p, poly.hull);
        // Static-Stability-Factor: tan(Kipp-Winkel) = horizontaler Abstand zur Kante / SCHWERPUNKT-HÖHE —
        // breiter flacher Tisch margin≈1, einbeiniger Mast margin≈0.
        const comHeight = Math.max(0.05, com.com.y - poly.boden);
        const margin = inside ? Math.max(0, Math.min(1, dEdge / comHeight)) : 0;
        return { inside, margin, comHeight, area: poly.area, com: com.com, mass: com.mass };
    }

    // ═══ Ω-PHYSIS · Ω-Φ3 — STEIFIGKEIT + VERSAGEN ═══
    // ZWEI Fragen: (a) Biegung — Flächenträgheitsmoment I = Σ A·y² (Material weg von der Achse zählt im
    // QUADRAT; trennt I-Profil von Stab); (b) Versagen — Knicken unter Last (die schlanke Säule unterm
    // Dach kippt nicht, knickt aber).
    _bendingStiffness(bp) {
        const empty = { Ix: 0, Iz: 0, Imin: 0, Imax: 0, anisotropy: 1, area: 0 };
        if (!bp || !Array.isArray(bp.parts) || !bp.parts.length) return empty;
        const items = [];
        let A = 0,
            cx = 0,
            cz = 0;
        for (const p of bp.parts) {
            const ext = this._partWorldExtents(p);
            const a = Math.max(1e-4, (ext.ex || 0) * (ext.ez || 0));
            const pos = p.position || { x: 0, z: 0 };
            items.push({ a, x: pos.x || 0, z: pos.z || 0, ex: ext.ex || 0, ez: ext.ez || 0 });
            A += a;
            cx += a * (pos.x || 0);
            cz += a * (pos.z || 0);
        }
        if (A <= 0) return empty;
        cx /= A;
        cz /= A;
        // I_z = Σ A·(x−cx)² + Eigenanteil A·ex²/12 (Biegung mit Durchbiegung in x);
        // I_x analog in z. Der Parallel-Achsen-Satz: Material weit von der Achse ²-gewichtet.
        let Ix = 0,
            Iz = 0;
        for (const it of items) {
            Iz += it.a * (it.x - cx) * (it.x - cx) + (it.a * it.ex * it.ex) / 12;
            Ix += it.a * (it.z - cz) * (it.z - cz) + (it.a * it.ez * it.ez) / 12;
        }
        const Imin = Math.min(Ix, Iz),
            Imax = Math.max(Ix, Iz);
        return { Ix, Iz, Imin, Imax, anisotropy: Imax / Math.max(1e-6, Imin), area: A };
    }
    // (b) VERSAGEN: knickt eine Ebene schlanker Glieder unter der LAST, die sie trägt? Euler: die kritische Spannung fällt
    // mit dem Quadrat der Schlankheit, σ_krit = σ_ref · (λ_ref / λ)², λ_ref ∝ √(härte) (unter der Bezugs-Last
    // `bucklingRefLoad` knickt die Stein-Säule ab 1:18). Die Last ist das Gewicht über der halben Höhe des Glieds (die
    // Teile darüber und sein eigener oberer Teil), getragen von jedem Glied, das diese Ebene kreuzt — sie knicken, wenn sie
    // die Summe ihrer kritischen Lasten übersteigt: ein Glied ohne Last (ein Zierstab, der Webstuhl-Pfosten) knickt nicht,
    // die überladene Plattform schon; trägt ein gedrungenes Glied oder eine Wand die Ebene mit, knickt sie nie. Grob-Sanitäts-
    // Richter, keine FEA.
    _failsUnderLoad(bp) {
        const out = { buckles: false, maxSlenderness: 0, criticalSlenderness: 0, slenderPart: -1 };
        if (!bp || !Array.isArray(bp.parts) || !bp.parts.length) return out;
        const P = AnazhRealm.PHYSIS;
        const mats = this.state.materials || {};
        const glieder = bp.parts.map((p) => {
            const ext = this._partWorldExtents(p);
            const tags = (mats[p.material] && mats[p.material].tags) || {};
            const s = p.size || { x: 1, y: 1, z: 1 };
            const w = Math.max(0.02, Math.min(ext.ex || 0, ext.ez || 0));
            const wmax = Math.max(0.02, Math.max(ext.ex || 0, ext.ez || 0));
            // ein WAND-/Platten-Glied (eine horizontale Dimension ≫ die andere, > wallBraceRatio) ist keine freie Säule
            const saeule = (ext.ey || 0) >= w * 1.2 && wmax <= w * P.wallBraceRatio;
            const lambdaRef = Math.max(
                P.bucklingSlendernessMin,
                Math.min(
                    P.bucklingSlendernessMax,
                    P.bucklingSlendernessBase * Math.sqrt(Math.max(0.05, tags.härte || 0.5) / 0.5)
                )
            );
            return {
                a: this._partWorldAABB(p),
                saeule,
                lambda: (ext.ey || 0) / w,
                lambdaRef,
                flaeche: Math.max(1e-4, (ext.ex || 0) * (ext.ez || 0)),
                masse:
                    Math.abs((s.x || 1) * (s.y || 1) * (s.z || 1)) *
                    Math.max(0.05, typeof tags.dichte === "number" ? tags.dichte : 0.5),
            };
        });
        for (let i = 0; i < glieder.length; i++) {
            const g = glieder[i];
            if (!g.saeule || !g.a) continue;
            if (g.lambda > out.maxSlenderness) [out.maxSlenderness, out.slenderPart] = [g.lambda, i];
            const y = (g.a.min.y + g.a.max.y) / 2;
            let last = 0;
            let kritisch = 0;
            let gedrungen = false;
            for (const t of glieder) {
                if (!t.a || t.a.max.y <= y) continue;
                last += t.masse * Math.min(1, (t.a.max.y - y) / Math.max(1e-6, t.a.max.y - t.a.min.y));
                if (t.a.min.y >= y) continue;
                if (!t.saeule) gedrungen = true;
                kritisch += P.bucklingRefLoad * (t.lambdaRef / t.lambda) ** 2 * t.flaeche;
            }
            if (gedrungen || last <= kritisch) continue;
            out.buckles = true;
            out.criticalSlenderness = g.lambda * Math.sqrt(kritisch / last); // die Schlankheit, die diese Last noch trüge
        }
        return out;
    }

    // ═══ Ω-PHYSIS · Ω-Φ4 — HEBEL + SCHWUNG-TRÄGHEIT ═══
    // „Balanciert" = gerechneter Balancepunkt relativ zum Griff: kopflastig schlägt hart, aber träge;
    // griffnah schnell, aber leichter.
    _inferGripPoint(bp, com) {
        const bbox = this._compoundBBox(bp);
        const c = (com && com.com) || { x: 0, y: 0, z: 0 };
        if (!bbox) return { x: c.x, y: c.y, z: c.z };
        const span = { x: bbox.max.x - bbox.min.x, y: bbox.max.y - bbox.min.y, z: bbox.max.z - bbox.min.z };
        const axis = span.y >= span.x && span.y >= span.z ? "y" : span.x >= span.z ? "x" : "z";
        const lo = bbox.min[axis],
            hi = bbox.max[axis];
        // der Griff ist das vom CoM ENTFERNTE Ende (das leichte Griff-Ende; der CoM
        // sitzt nah am schweren Kopf).
        const gripCoord = Math.abs(hi - c[axis]) > Math.abs(lo - c[axis]) ? hi : lo;
        const grip = { x: c.x, y: c.y, z: c.z };
        grip[axis] = gripCoord;
        return grip;
    }
    _swingDynamics(bp, gripPoint) {
        const com = this._compoundCenterOfMass(bp);
        const out = {
            balance: 0,
            swingInertia: 0,
            swingSpeed: 0,
            leverage: 0,
            mass: com.mass,
            com: com.com,
            grip: null,
        };
        if (!bp || !Array.isArray(bp.parts) || !bp.parts.length || com.mass <= 0) return out;
        const grip = gripPoint || this._inferGripPoint(bp, com);
        out.grip = grip;
        out.balance = Math.hypot(com.com.x - grip.x, com.com.y - grip.y, com.com.z - grip.z);
        let I = 0;
        for (const p of bp.parts) {
            const m = this._teilMasse(p);
            const pos = p.position || { x: 0, y: 0, z: 0 };
            I += m * ((pos.x - grip.x) ** 2 + (pos.y - grip.y) ** 2 + (pos.z - grip.z) ** 2);
        }
        out.swingInertia = I;
        out.swingSpeed = I > 1e-6 ? 1 / Math.sqrt(I) : 0; // ∝ 1/√I
        out.leverage = out.mass * out.balance; // τ-Potenzial: Kopf-Masse × Hebelarm
        return out;
    }

    // ═══ Ω-PHYSIS · Ω-Φ5 — LASTPFAD + KONNEKTIVITÄT ═══
    // Die Last muss den Boden erreichen: BFS über räumliche Adjazenz (AABB-Berührung) von den
    // Boden-Kontakten; schwebende Teile tragen 0. Eine Klinge mit Lücke schneidet nicht. `boden` wie `_supportPolygon`: am
    // Grund des gesetzten Werks schwebt auch ein einzelnes Teil.
    _loadPath(bp, boden) {
        // `floatingParts` = Indizes der schwebenden Teile (dieselbe `seen[]`-BFS) → die Werkstatt tintet sie
        // als Warnung. Additiv; intact/floatingFrac bleiben unberührt.
        const out = { intact: true, floatingFrac: 0, floatingCount: 0, groundCount: 0, floatingParts: [] };
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length < (Number.isFinite(boden) ? 1 : 2)) return out;
        const n = bp.parts.length;
        // Kosten-Wand: die Adjazenz ist O(n²). Ein sehr großer Bauplan (Baum 75+ Parts)
        // braucht den exakten Lastpfad nicht für die Rollen-Resonanz (er ist eindeutig
        // verbunden) — optimistisch intakt zurück (der Richter bleibt billig, §1).
        if (n > 120) return out;
        const aabb = bp.parts.map((p) => this._partWorldAABB(p));
        let minBottom = Infinity,
            maxTop = -Infinity;
        for (const a of aabb) {
            if (!a) continue;
            if (a.min.y < minBottom) minBottom = a.min.y;
            if (a.max.y > maxTop) maxTop = a.max.y;
        }
        const band = Math.max(0.12, (maxTop - minBottom) * 0.12);
        const adj = Array.from({ length: n }, () => []);
        const e = 0.06;
        const touch = (a, b) =>
            a.min.x <= b.max.x + e &&
            a.max.x >= b.min.x - e &&
            a.min.y <= b.max.y + e &&
            a.max.y >= b.min.y - e &&
            a.min.z <= b.max.z + e &&
            a.max.z >= b.min.z - e;
        for (let i = 0; i < n; i++)
            for (let j = i + 1; j < n; j++) {
                if (aabb[i] && aabb[j] && touch(aabb[i], aabb[j])) {
                    adj[i].push(j);
                    adj[j].push(i);
                }
            }
        const seen = new Array(n).fill(false);
        const q = [];
        for (let i = 0; i < n; i++) {
            if (aabb[i] && aabb[i].min.y <= (Number.isFinite(boden) ? Math.min(boden, minBottom) : minBottom) + band) {
                seen[i] = true;
                q.push(i);
                out.groundCount++;
            }
        }
        while (q.length) {
            const i = q.pop();
            for (const j of adj[i]) if (!seen[j]) ((seen[j] = true), q.push(j));
        }
        let total = 0,
            floating = 0;
        for (let i = 0; i < n; i++) {
            const m = this._teilMasse(bp.parts[i]);
            total += m;
            if (!seen[i]) {
                floating += m;
                out.floatingCount++;
                out.floatingParts.push(i);
            }
        }
        out.floatingFrac = total > 0 ? floating / total : 0;
        out.intact = out.floatingFrac < 0.02;
        return out;
    }
    // Schneide-Kontinuität: die Parts entlang der Längsachse sortiert — sind die
    // aufeinanderfolgenden räumlich verbunden? Eine Lücke (Loch in der Schneide) senkt
    // die Kontinuität → die Klinge schneidet nicht (topologisch geprüft, kraft-begründet).
    _edgeContinuity(bp) {
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length < 2) return 1;
        const bbox = this._compoundBBox(bp);
        if (!bbox) return 1;
        const span = { x: bbox.max.x - bbox.min.x, y: bbox.max.y - bbox.min.y, z: bbox.max.z - bbox.min.z };
        const axis = span.x >= span.y && span.x >= span.z ? "x" : span.y >= span.z ? "y" : "z";
        const aabb = bp.parts.map((p) => this._partWorldAABB(p)).filter(Boolean);
        aabb.sort((a, b) => (a.min[axis] + a.max[axis]) / 2 - (b.min[axis] + b.max[axis]) / 2);
        let bridged = 0;
        const gaps = aabb.length - 1;
        const e = Math.max(0.05, span[axis] * 0.04);
        for (let i = 0; i < gaps; i++) {
            const a = aabb[i],
                b = aabb[i + 1];
            // berühren/überlappen sie entlang der Achse (mit kleiner Toleranz)?
            if (b.min[axis] <= a.max[axis] + e) bridged++;
        }
        return gaps > 0 ? bridged / gaps : 1;
    }
    // ROLL-PHYSIK: Anteil rollender Parts im Boden-Band — „Rad" emergiert aus der Roll-Geometrie am
    // Bodenkontakt, nicht aus Rundheit (ein Kuppel-Dach liegt nicht am Boden). Wagen → hoch, Tempel → 0.
    // `rollen` (optional) nimmt die rollenden Teile auf — das Rollen des gesetzten Werks (`_werkGesetzSetzen`).
    _rollableFraction(bp, rollen) {
        if (!bp || !Array.isArray(bp.parts) || !bp.parts.length) return 0;
        const aabb = bp.parts.map((p) => this._partWorldAABB(p));
        let minB = Infinity,
            maxT = -Infinity;
        for (const a of aabb) {
            if (!a) continue;
            if (a.min.y < minB) minB = a.min.y;
            if (a.max.y > maxT) maxT = a.max.y;
        }
        const band = Math.max(0.15, (maxT - minB) * 0.25);
        let roll = 0,
            ground = 0;
        for (let i = 0; i < bp.parts.length; i++) {
            const p = bp.parts[i],
                a = aabb[i];
            if (!a || a.min.y > minB + band) continue;
            ground++;
            // Kugel rollt immer; Zylinder NUR mit HORIZONTALER Achse — ein vertikaler ist Stamm/Säule (sonst läse
            // ein Baumstamm als Fahrzeug).
            if (
                p.shape === "sphere" ||
                ((p.shape === "cylinder" || p.shape === "spokeWheel") && this._cylinderWorldAxis(p) !== "y")
            ) {
                roll++;
                if (rollen) rollen.push(p);
            }
        }
        return ground > 0 ? Math.min(1, roll / ground) : 0;
    }

    // Größen-Faktor: die MASSE verstärkt die Wucht (MAX-aggregierte Tags sind größen-blind) — mehr
    // Schaden/Rückschlag/Verteidigung, aber TRÄGER. Liest Σ SUBSTANZ-Volumen gegen eine REF (sanfte
    // Potenz, gebounded, ~1.0 typisch), nicht das Hüll-Volumen — sonst bläst Teile-Spreizen die Stärke
    // auf; ein expliziter Hüll-Malus bestrafte mehrteilige Werke (Wagen) doppelt.
    _compoundSizeFactor(bp) {
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length === 0) return 1;
        let vol = 0;
        for (const p of bp.parts) {
            const s = p.size || {};
            vol += Math.abs((s.x || 0.3) * (s.y || 0.3) * (s.z || 0.3));
        }
        vol = Math.max(0.0001, vol);
        const ref = AnazhRealm.SIZE_STAT_REF_SUBSTANCE;
        const exp = AnazhRealm.SIZE_STAT_EXPONENT;
        const f = Math.pow(vol / ref, exp);
        const lo = AnazhRealm.SIZE_STAT_MIN;
        const hi = AnazhRealm.SIZE_STAT_MAX;
        return Math.max(lo, Math.min(hi, f));
    }

    // Intrinsische Rolle = ARGMAX der Resonanz des Produkt-Vektors gegen FORM_ROLE_SIGNATURES
    // (soul/portal/consumable/architecture) — kein first-match-bias. architecture ist eine positive
    // Signatur (dichte+harte Struktur); alles unter dem Floor → architecture.
    _computeFormRole(bp) {
        // Greifbare GERÄTE-Form → Waffe/Werkzeug, nicht Bauwerk: Klinge und Bauwerk sind Substanz-Zwillinge
        // (dicht+hart), nur die FORM trennt sie. Eng: nur spitz UND gestreckt; spitz+kompakt (Kristall-
        // Cluster) bleibt Bauwerk, stumpf+elongiert (Stab/Säule) den Form-Rollen.
        if (this._isGraspableBladeForm(bp)) return this._argmaxImplementRole(bp);
        // Sonst die Form-Rollen — bewusst konservativ (Welt-Strukturen → architecture). Sie lesen denselben
        // NORMALISIERTEN Produkt-Vektor wie Fit/Spektrum; nur die Signatur-GEWICHTE unterscheiden sich je
        // Leser. soul liest `livingBody` (toter Panzer ≠ Seele); portal braucht die Ring-FORM.
        const v = this._blueprintProductVector(bp);
        // Ψ1 — das EINE argmax-Organ liest; unter dem Floor bleibt der Default (architecture).
        return (
            this._resonateArgmax(v, AnazhRealm.FORM_ROLE_SIGNATURES, {
                floor: AnazhRealm.FORM_ROLE_RESONANCE_FLOOR,
            }).key || AnazhRealm.DEFAULT_BLUEPRINT_ROLE
        );
    }

    // U4 — die GERÄTE-Rolle aus der Form: argmax der NORMIERTEN Resonanz (raw/ref, damit die Signatur-Skalen
    // vergleichbar sind) unter weapon/tool — eine scharfe/spitze Klinge → Waffe, ein stumpfes/breites → Werkzeug.
    _argmaxImplementRole(bp) {
        const v = this._blueprintProductVector(bp);
        const cfg = AnazhRealm.QUALITY_ROLE_FIT;
        // Ψ1 — das EINE argmax-Organ auf dem weapon/tool-Subset (keys), raw/ref-normiert.
        return (
            this._resonateArgmax(v, AnazhRealm.ROLE_SIGNATURES, {
                keys: ["weapon", "tool"],
                refs: cfg.refs,
                refDefault: 3.0,
            }).key || "tool"
        );
    }

    // Setzt bp.role emergent; gerufen aus den Mutationen (addPart, updatePart, removePart, applyOpToPart).
    // setBlueprintAsArmor/setBlueprintAsConsumable etc. setzen bp.roleManual = true und sperren den Pfad.
    _refreshBlueprintRoleEmergent(name) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return;
        if (bp.builtIn) return; // Built-ins haben feste Rollen
        if (bp.roleManual) return; // manueller Override respektieren
        bp.role = this.computeBlueprintRole(bp);
    }

    // KATALYSATOR-OP aus der FORM: argmax-Resonanz des Produkt-Vektors gegen OP_CLASS_SIGNATURES
    // (scharf → schneiden, stumpf-dicht → schmieden, magie → wandeln). Formlos → subtractive.
    _computeToolOpFromForm(bp) {
        const fallback = { opClass: "subtractive", opName: AnazhRealm.OP_NAME_BY_CLASS.subtractive };
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length === 0) return fallback;
        const v = this._blueprintProductVector(bp);
        // Ψ1 — das EINE argmax-Organ; floor 0 = die historische `bestScore <= 0 → fallback`-Wand.
        const r = this._resonateArgmax(v, AnazhRealm.OP_CLASS_SIGNATURES, { floor: 0 });
        if (!r.key) return fallback;
        return { opClass: r.key, opName: AnazhRealm.OP_NAME_BY_CLASS[r.key] || "carve" };
    }

    // Werkzeug-Meta: nur eigene Baupläne, whitelisted opClass, sanitized opName; in-place, idempotent.
    // Ohne opClass EMERGIERT die Op aus der Form (`_computeToolOpFromForm`); eine explizite opClass ist
    // der Override (einziger Weg zu additive/Misch-Werkzeugen).
    setBlueprintToolMeta(name, opName, opClass) {
        const bp = this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.builtIn) return { ok: false, reason: "cannot_modify_builtin" };
        let emergent = false;
        if (!opClass) {
            const derived = this._computeToolOpFromForm(bp);
            opClass = derived.opClass;
            if (!opName) opName = derived.opName;
            emergent = true;
        }
        if (!AnazhRealm.TOOL_OP_CLASSES.has(opClass)) {
            return { ok: false, reason: "invalid_op_class" };
        }
        const cleanOpName = String(opName || "").toLowerCase();
        if (!AnazhRealm.TOOL_OP_NAME_PATTERN.test(cleanOpName)) {
            return { ok: false, reason: "invalid_op_name" };
        }
        bp.role = "tool";
        // Welle 9a — manueller Role-Override (siehe setBlueprintAsArmor)
        bp.roleManual = true;
        bp.toolMeta = { opName: cleanOpName, opClass };
        return { ok: true, opName: cleanOpName, opClass, emergent };
    }

    // Registriert einen markierten Bauplan als Werkzeug in state.tools (Name = Bauplan-Name; Starter-Namen
    // sind geschützt). Der Cap ist ein SNAPSHOT der Bauplan-Präzision — nach Edits neu registrieren, damit
    // ein versehentlicher Edit ein besessenes Werkzeug nicht still ändert.
    registerBlueprintAsTool(name) {
        const bp = this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.builtIn) return { ok: false, reason: "cannot_modify_builtin" };
        // Maschinen = Werkzeuge mit role="machine" (+ precisionCap-Bonus); beide brauchen toolMeta (opClass +
        // opName).
        if ((bp.role !== "tool" && bp.role !== "machine") || !bp.toolMeta) {
            return { ok: false, reason: "not_marked_as_tool" };
        }
        const existing = this.state.tools[name];
        if (existing && existing.builtIn) {
            return { ok: false, reason: "starter_name_protected" };
        }
        let precisionCap = this.computeBlueprintPrecisionCap(bp);
        // Maschinen-Bonus: role "machine" hebt den precisionCap leicht über die Min-Regel (eine schiefe
        // Maschine schlägt die Hand gleicher Min-Präzision); gedeckelt auf 1.0.
        if (bp.role === "machine") {
            precisionCap = Math.min(1.0, precisionCap + AnazhRealm.MACHINE_PRECISION_BONUS);
        }
        this.state.tools[name] = {
            name,
            label: bp.label || name,
            opClass: bp.toolMeta.opClass,
            opName: bp.toolMeta.opName,
            precisionCap,
            isStarter: false,
            builtIn: false,
            sourceBlueprint: name,
            isMachine: bp.role === "machine",
        };
        if (!Array.isArray(this.state.player.tools)) this.state.player.tools = [];
        if (!this.state.player.tools.includes(name)) this.state.player.tools.push(name);
        if (typeof this._renderWorkshopDOM === "function") this._renderWorkshopDOM();
        return { ok: true, precisionCap };
    }

    _architectureBuilders() {
        // Builders kommen aus state.blueprints (EINE Quelle für Built-in + User). Seed ist ungenutzt
        // (Built-ins deterministisch), bleibt als Parameter für stabile Aufrufer.
        const map = {};
        const blueprints = this.state.blueprints || {};
        for (const name of Object.keys(blueprints)) {
            const bp = blueprints[name];
            // V18.260 — platzierte Strukturen durch den Render-Merge (wenige Meshes
            // statt ein Mesh pro Part); _buildArchMeshMerged fällt für nested/animate/
            // connections/kleine Baupläne automatisch auf _buildFromBlueprint zurück.
            map[name] = () => this._buildArchMeshMerged(bp);
        }
        return map;
    }

    // === Werkstatt: Bauplan-Editor ===
    // Vier Mutationspfade, alle direkt über `state.blueprints`. Built-ins nie überschreiben — der Editor
    // klont sie; sonst stellt _defaultBlueprints() beim Reload das Original her (Edit verloren).

    createBlueprint(name, label) {
        const cleanName = typeof name === "string" ? name.trim() : "";
        if (!cleanName) {
            this.log("createBlueprint: leerer Name", "ERROR");
            return false;
        }
        if (this.state.blueprints[cleanName]) {
            this.log(`createBlueprint: '${cleanName}' existiert bereits`, "ERROR");
            return false;
        }
        this.state.blueprints[cleanName] = {
            name: cleanName,
            label: typeof label === "string" && label.trim() ? label.trim() : cleanName,
            builtIn: false,
            parts: [],
        };
        this.log(`Bauplan '${cleanName}' angelegt`, "INFO");
        return true;
    }

    cloneBlueprint(sourceName, newName) {
        const source = this.state.blueprints[sourceName];
        if (!source) {
            this.log(`cloneBlueprint: '${sourceName}' nicht gefunden`, "ERROR");
            return false;
        }
        const cleanNew = typeof newName === "string" ? newName.trim() : "";
        if (!cleanNew || this.state.blueprints[cleanNew]) {
            this.log(`cloneBlueprint: Ziel-Name '${cleanNew}' leer oder schon belegt`, "ERROR");
            return false;
        }
        this.state.blueprints[cleanNew] = {
            name: cleanNew,
            label: source.label ? `${source.label} (Kopie)` : cleanNew,
            builtIn: false,
            parts: JSON.parse(JSON.stringify(source.parts || [])),
        };
        // M2 (meister-plan Befund 6/7, GEMESSEN): der Klon erbt die volle SUBSTANZ — connections
        // (Gelenke/Anker) SIND Substanz wie parts. Ohne sie verlor ein geklonter Wagen seine
        // rad-Gelenke + den Sitz (keine rollenden Räder, kein Reiten, keine fahrzeug-Rolle).
        if (Array.isArray(source.connections) && source.connections.length) {
            this.state.blueprints[cleanNew].connections = JSON.parse(JSON.stringify(source.connections));
        }
        // Der Klon erbt `studioGestalt` (reines DATEN-Feld) — sonst trägt ein geklontes Portal wieder den
        // Part-Look statt des Geisttors. `donorOnly` reist BEWUSST NICHT mit (ein Klon soll sichtbar sein).
        if (typeof source.studioGestalt === "string") {
            this.state.blueprints[cleanNew].studioGestalt = source.studioGestalt;
        }
        // Eine DEKLARIERTE Rolle (builtIn oder roleManual) reist als roleManual mit — sonst verliert ein
        // geklonter Brennkolben seine Werkstatt-Station (Chip + _workshopStationGate lesen bp.role).
        // forgedPrecision reist bewusst NICHT (der Plan ist frei kopierbar, das WERK kostet).
        if (source.role && (source.roleManual || source.builtIn)) {
            this.state.blueprints[cleanNew].role = source.role;
            this.state.blueprints[cleanNew].roleManual = true;
        } else {
            // V17.85 — sonst trägt der Klon seine EMERGENTE Rolle (wie jeder Nicht-Built-in nach
            // _refreshBlueprintRoleEmergent). Ohne das bliebe bp.role undefined → der Klon einer
            // rollenlosen Klinge (Spitzhacke) zeigte „Bauwerk" statt der Form-Rolle „Werkzeug".
            this._refreshBlueprintRoleEmergent && this._refreshBlueprintRoleEmergent(cleanNew);
        }
        this.log(`Bauplan '${sourceName}' nach '${cleanNew}' geklont`, "INFO");
        return true;
    }

    deleteBlueprint(name) {
        const bp = this.state.blueprints[name];
        if (!bp) return false;
        if (bp.builtIn) {
            this.log(`deleteBlueprint: '${name}' ist Built-in und kann nicht gelöscht werden`, "ERROR");
            return false;
        }
        delete this.state.blueprints[name];
        // Hotbar-Slots, die diesen Bauplan halten, leeren.
        for (let i = 0; i < 9; i++) {
            if (this.state.hotbar[i] === name) this.state.hotbar[i] = null;
        }
        // War der Bauplan als Werkzeug registriert, fällt das Werkzeug mit — sonst bliebe ein Geist-Tool in
        // state.tools (sourceBlueprint ins Leere), das applyOpToPart ohne Substanz bedient.
        if (this.state.tools) {
            for (const toolName of Object.keys(this.state.tools)) {
                const t = this.state.tools[toolName];
                if (t && !t.builtIn && t.sourceBlueprint === name) {
                    delete this.state.tools[toolName];
                    if (Array.isArray(this.state.player.tools)) {
                        this.state.player.tools = this.state.player.tools.filter((tn) => tn !== toolName);
                    }
                }
            }
        }
        this._renderHotbarDOM();
        this.log(`Bauplan '${name}' gelöscht`, "INFO");
        return true;
    }

    addPartToBlueprint(name, part) {
        const bp = this.state.blueprints[name];
        if (!bp) return false;
        if (bp.builtIn) {
            this.log(`addPart: '${name}' ist Built-in — bitte erst klonen`, "ERROR");
            return false;
        }
        this._recordBlueprintEdit(name); // V17.87 — Edit-Verlauf
        // Default-Werte für ein neues Part, falls nicht alles übergeben wird.
        // Welle 4 Phase 1: Default-Material „stein", Color folgt der Material-
        // Farbe wenn der Caller nichts vorgibt.
        const defaultMaterial = "stein";
        const matColor = (this.state.materials[defaultMaterial] || {}).color || 0x888888;
        const defaultPart = {
            shape: "box",
            color: matColor,
            material: defaultMaterial,
            position: { x: 0, y: 1, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            size: { x: 1, y: 1, z: 1 },
            opChain: this._defaultPartOpChain(),
        };
        bp.parts.push({ ...defaultPart, ...(part || {}) });
        this.state._bpEditTick = (this.state._bpEditTick || 0) + 1; // V18.358 — Recipe-Book-Signatur
        // Welle 9a — emergente Rolle aktualisieren (außer bei manuellem Override)
        this._refreshBlueprintRoleEmergent(name);
        return true;
    }

    removePartFromBlueprint(name, index) {
        const bp = this.state.blueprints[name];
        if (!bp || bp.builtIn) return false;
        if (index < 0 || index >= bp.parts.length) return false;
        this._recordBlueprintEdit(name); // V17.87 — Edit-Verlauf
        bp.parts.splice(index, 1);
        this.state._bpEditTick = (this.state._bpEditTick || 0) + 1; // V18.358 — Recipe-Book-Signatur
        // Connections referenzieren Part-Indizes: berührende Connections fallen, Indizes > index rücken
        // um 1 nach unten — sonst zeigen sie auf falsche/out-of-range Parts.
        if (Array.isArray(bp.connections)) {
            bp.connections = bp.connections
                .filter((c) => c.partA !== index && c.partB !== index)
                .map((c) => {
                    const out = {
                        type: c.type,
                        partA: c.partA > index ? c.partA - 1 : c.partA,
                        partB: c.partB > index ? c.partB - 1 : c.partB,
                    };
                    // Metadaten (anchor …) wandern mit — sonst zerstört ein Part-Löschen die Face-Snap-Anker
                    // aller übrigen Verbindungen.
                    if (c.anchor) out.anchor = c.anchor;
                    if (c.auto) out.auto = 1;
                    return out;
                });
        }
        // Welle 9a — emergente Rolle aktualisieren
        this._refreshBlueprintRoleEmergent(name);
        return true;
    }

    updatePartInBlueprint(name, index, patch) {
        const bp = this.state.blueprints[name];
        if (!bp || bp.builtIn) return false;
        if (index < 0 || index >= bp.parts.length) return false;
        this._recordBlueprintEdit(name); // V17.87 — Edit-Verlauf
        const part = bp.parts[index];
        // Patch ist ein Teil-Objekt; wir mergen rekursiv für position/size/
        // rotation, damit man einzelne Koordinaten verändern kann.
        if (patch.shape) part.shape = patch.shape;
        if (typeof patch.color === "number") part.color = patch.color;
        for (const key of ["position", "size", "rotation"]) {
            if (patch[key]) {
                part[key] = { ...(part[key] || {}), ...patch[key] };
            }
        }
        if (typeof patch.opacity === "number") part.opacity = patch.opacity;
        // Welle 4 Phase 1: Material-Wechsel. Wenn der Caller `recolor: true`
        // mitgibt, wird die Part-Farbe auf die Material-Farbe gezogen — das
        // ist der UI-Pfad beim Material-Dropdown-Change.
        if (typeof patch.material === "string" && this.state.materials[patch.material]) {
            part.material = patch.material;
            if (patch.recolor === true) {
                part.color = this.state.materials[patch.material].color;
            }
        }
        // Welle 9a — emergente Rolle aktualisieren (Shape/Material-Wechsel
        // kann via Compound-Tags die forging-Split-Entscheidung kippen)
        this._refreshBlueprintRoleEmergent(name);
        return true;
    }

    selectBlueprintForEdit(name) {
        const ws = this._ensureWorkshopState();
        if (!this.state.blueprints[name]) {
            this.log(`selectBlueprintForEdit: '${name}' nicht gefunden`, "ERROR");
            return false;
        }
        ws.selectedBlueprint = name;
        // Welle 6.B Phase 1 — Selection zurücksetzen beim Bauplan-Wechsel
        ws.selectedPartIdx = null;
        // W-A1 — genau EIN Selektions-Modus aktiv: die Bauplan-Wahl beendet die Rezept-Sicht.
        ws.selectedRecipe = null;
        this._renderWorkshopDOM();
        // Preview-Mesh neu bauen (falls Preview existiert — defensive für DSL-Pfade
        // die selectBlueprintForEdit aus Headless aufrufen).
        if (typeof this._workshopRebuildPreviewMesh === "function") {
            this._workshopRebuildPreviewMesh();
        }
        // Welle 6.B Phase 2 Bug-Fix — Manipulator-UI sync (Read-only-Banner +
        // Mode-Bar disable) muss bei jedem Bauplan-Wechsel aktualisiert werden.
        if (typeof this._workshopUpdateManipulatorButtons === "function") {
            this._workshopUpdateManipulatorButtons();
        }
        // Bauplan-Wechsel zentriert die CAD-Kamera neu — sonst klebt die alte Orbit-Sicht.
        if (typeof this.resetWorkshopCamera === "function") {
            this.resetWorkshopCamera();
        }
        return true;
    }

    // Ein Studio-Rezept OHNE Katalog-Blueprint (z. B. `gras`) wird anschaubar + regelbar, aber NICHT
    // platzierbar (Katalog-Eintrag ≠ Welt-Platzierung). Die Rezept-Wahl nullt selectedBlueprint.
    selectStudioRecipeForView(recipeId) {
        const ws = this._ensureWorkshopState();
        const f = this._foundry;
        if (!f || !f.recipes || !f.recipes[recipeId]) {
            this.log(`selectStudioRecipeForView: '${recipeId}' nicht im LIVE-Buch`, "ERROR");
            return false;
        }
        ws.selectedRecipe = recipeId;
        ws.selectedBlueprint = null;
        ws.selectedPartIdx = null;
        // ERFINDER-WELLE — die LOD-Wahl ist PRO Auswahl (frische Auswahl = feinste Stufe).
        ws.recipeLod = 0;
        this._renderWorkshopDOM();
        if (typeof this._workshopUpdateManipulatorButtons === "function") {
            this._workshopUpdateManipulatorButtons();
        }
        if (typeof this.resetWorkshopCamera === "function") {
            this.resetWorkshopCamera();
        }
        return true;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_bau_buch]);

// ===== ATLAS · Bau/buch — Außen-Konstanten =====
// Die Felder eines Teils, die seine Gestalt nicht formen (`_teilVolumen`: das Volumen gilt je Form und Maß).
AnazhRealm.TEIL_FORM_FREI = Object.freeze(["position", "rotation", "material", "color", "opChain"]);
AnazhRealm._bewegungsKoeff = function (stat) {
    const row = AnazhRealm.Gesetz("koerper:bewegung." + stat, null);
    if (row && Number.isFinite(row.base) && Number.isFinite(row.leicht) && Number.isFinite(row.mag)) return row;
    return AnazhRealm._kernPflichtBruch("koerper:bewegung." + stat);
};
AnazhRealm.STAT_FROM_TAGS = Object.freeze({
    // hpMax/damage/knockback/defense lesen ihre Koeffizienten via _kampfKoeff aus dem Gesetzbuch
    // (fx.kampf): der Lab-Wert IST der Welt-Wert.
    hpMax: (t) => {
        const K = AnazhRealm._kampfKoeff("hpMax");
        return K.base + (t.dichte || 0) * K.dichte + (t.härte || 0) * K.haerte;
    },
    damage: (t) => {
        const K = AnazhRealm._kampfKoeff("damage");
        return K.base + (t.dichte || 0) * K.dichte + (t.härte || 0) * K.haerte;
    },
    // Kampf-Stats emergieren aus der Substanz (Base + Tag·Gewicht): knockback ∝ dichte + härte (Masse
    // stößt zurück); attackSpeed ∝ (1−dichte) + magieleitung → schwere Keule langsam-wuchtig, leichte
    // Klinge schnell.
    knockback: (t) => {
        const K = AnazhRealm._kampfKoeff("knockback");
        return K.base + (t.dichte || 0) * K.dichte + (t.härte || 0) * K.haerte;
    },
    attackSpeed: (t) => 0.8 + (1 - (t.dichte || 0)) * 0.7 + (t.magieleitung || 0) * 0.3,
    // speed/jumpPower/staminaMax lesen ihre Koeffizienten via _bewegungsKoeff aus dem Gesetzbuch
    // (fx.bewegung): der Lab-Wert IST der Welt-Wert.
    speed: (t) => {
        const K = AnazhRealm._bewegungsKoeff("speed");
        return K.base + (1 - (t.dichte || 0)) * K.leicht + (t.magieleitung || 0) * K.mag;
    },
    jumpPower: (t) => {
        const K = AnazhRealm._bewegungsKoeff("jumpPower");
        return K.base + (1 - (t.dichte || 0)) * K.leicht + (t.magieleitung || 0) * K.mag;
    },
    staminaMax: (t) => {
        const K = AnazhRealm._bewegungsKoeff("staminaMax");
        return K.base + (1 - (t.dichte || 0)) * K.leicht + (t.wärmeleitung || 0) * K.mag;
    },
    // Mana = zweite Ausdauer-Achse, aus magieleitung statt (1−dichte): 50 + magieleitung·100 +
    // resoniert·30 (Mensch 50, Drache ~80, Phönix ~119).
    manaMax: (t) => 50 + (t.magieleitung || 0) * 100 + (t.resoniert || 0) * 30,
    precision: (t) => 0.5 + (t.magieleitung || 0) * 0.3 + (t.zähigkeit || 0) * 0.2,
    magicResist: (t) => (t.magieleitung || 0) * 0.4 + (t.resoniert || 0) * 0.3,
    heatResist: (t) => (t.wärmeleitung || 0) * 0.5 - (t.brennbar || 0) * 0.3,
    // defense (physisch) ∝ dichte + härte; ergänzt magicResist/heatResist zum Defense-Trio, base-los
    // (ein weiches Wesen blockt ~0). Konsum: die Rüstung dämpft, dealt = roh² / (roh + defense) (_ruestungDaempft).
    defense: (t) => {
        const K = AnazhRealm._kampfKoeff("defense");
        return K.base + (t.dichte || 0) * K.dichte + (t.härte || 0) * K.haerte;
    },
});

// Werkzeug-Anwendung kostet Stamina: ohne Kosten ließe sich Präzision durch unbegrenzte
// Polier-Schritte hochziehen (0.7^N → max) — Geduld als echte Kosten.
AnazhRealm.TOOL_OP_STAMINA_COST = 10;
// phaseChange-Ops (imbue/soulwork) sind MAGIE → kosten Mana statt Stamina (subtractive/plastic/
// additive = Mühe). Floor 5, Präzisions-Skalierung wie TOOL_OP_STAMINA_COST; schöpfer-Modus frei via
// _drainMana-Mode-Gate.
AnazhRealm.TOOL_OP_MANA_COST = 15;

// Form-begründete Tag-Modulation je Spezies (kleine deklarierte Δ): die Affinitäts-Tag-Wand lässt
// sie NUR in den genannten Achsen-Richtungen passieren, andere Achsen bleiben strict (Δ < 0.05).
// computeCompoundTags mischt sie für gewachsene Baupläne (`_isGrown && _grownSpecies`) additiv drauf
// → Spawn-Affinität, Werkstatt und Audio-Resonanz erkennen die Spezies subtil.
AnazhRealm.SPECIES_TAG_VARIATION = Object.freeze({
    baum_tanne: Object.freeze({ brennbar: 0.1, resoniert: 0.05 }), // harzig, klingt
    baum_kiefer: Object.freeze({ brennbar: 0.1, resoniert: 0.05 }), // harzig, klingt
    baum_buche: Object.freeze({ lebendig: 0.08 }), // saftig
    baum_birke: Object.freeze({ lebendig: 0.1 }), // saftig + zart
    baum_eiche: Object.freeze({ lebendig: 0.05 }), // robust-saftig (subtil)
    baum_erle: Object.freeze({ lebendig: 0.08 }), // wasser-saftig
    // V18.216 (Plan §1 M3 + §3.5) — die neuen Substanz-Vektoren:
    baum_karst: Object.freeze({ dichte: 0.1, lebendig: -0.05 }), // hart, weniger saftig (Klippen-Geste)
    busch_hazel: Object.freeze({ lebendig: 0.08, brennbar: 0.05 }), // saftig + brennbar
    farn_busch: Object.freeze({ lebendig: 0.12, magieleitung: 0.05 }), // sehr saftig, leicht magisch
    blume_gross: Object.freeze({ lebendig: 0.15, magieleitung: 0.1 }), // hoch lebendig + magisch
});

// Min-Regel-Hybrid-Decay (Formel s. computePartPrecision): ein 4-Schritt-Chain liefert ~59 % der
// Höchst-Präzision, reine Hand-Arbeit (1 Schritt) bleibt bei min — Sorgfalt belohnt, nicht beliebig.
AnazhRealm.PRECISION_DECAY = 0.7;
// V17.90 (resonanz-system §2) — die Aktivierungs-Decke: computeCompoundTags gibt MAX(aktivierung[0..3] ·
// materialTag[0..1]); ÷3 normalisiert die Material-Tags des Produkt-Vektors auf [0..1] (= dieselbe Skala wie
// die Form-Achsen) → die FORM konkurriert mit dem MATERIAL in der Resonanz (heilt die Spektrum-Sättigung).
AnazhRealm.PRODUCT_VECTOR_TAG_NORM = 3;
// Ω-PHYSIS (wahrerbauplan §4) — die Tunables des Physik-Schiedsrichters. Der
// Richter ist ein GROB-Sanitäts-Richter (§1-Geltungsbereich), kein FEA-Simulator:
// diese Schwellen kalibrieren die groben Verstöße (Kippen, Knicken). browser-justierbar.
AnazhRealm.PHYSIS = {
    groundBandFrac: 0.15, // Ω-Φ2: das untere Höhen-Band, das als Bodenkontakt zählt
    bucklingSlendernessBase: 16, // Ω-Φ3-b: krit. Schlankheit (height/width) bei härte 0.5 unter der Bezugs-Last
    bucklingRefLoad: 8, //          die Bezugs-Last je Fläche: acht Meter Stoff der dichte 1 über dem Glied (die Meister-Esse braucht 6,4)
    bucklingSlendernessMin: 8, //          Boden (ein weiches Material knickt früher)
    bucklingSlendernessMax: 28, //          Decke (ein hartes Material trägt schlanker)
    wallBraceRatio: 4, // Ω-Φ3-b: ab dieser Breite:Dicke ist ein Glied eine WAND (verstrebt), keine Säule
};
// Stat-Klemme am LESER (taille-spec §3): je Achse die lokale Trag-Decke = max(Built-in-Materialien
// 1.0, Geburts-Clamp [0,1]) × Headroom 2. Fremde Substanz darüber ist nicht kaputt — sie ist hier
// nur so stark, wie diese Welt trägt.
AnazhRealm.MATERIAL_TAG_CEIL = Object.freeze(
    AnazhRealm.MATERIAL_TAG_KEYS.reduce((acc, key) => {
        acc[key] = 2;
        return acc;
    }, {})
);
// Welle 5 B — räumliche Emergenz. Welche Formen wirken als „Spitzen" (Prinzip
// 1: Spitze richtet). Helix ist drin, weil ihr Ende eine Schraubspitze ist —
// nicht so scharf wie ein Kegel, aber funktional gerichtet.
AnazhRealm.SPATIAL_POINTED_SHAPES = Object.freeze(
    new Set(["cone", "pyramid", "octahedron", "helix", "bladeProfile", "pickHead"])
);
// Kontakt überträgt Wärme, Strom, Magie, Schwingung. lebendig nicht (Leben ist nicht kontagiös),
// brennbar nicht (Feuer-Ausbreitung wäre ein eigener Pfad).
AnazhRealm.SPATIAL_TRANSFERABLE_TAGS = Object.freeze(["wärmeleitung", "stromleitung", "magieleitung", "resoniert"]);
// Welche Formen bilden einen Hohlraum (Prinzip 2: Hohlraum enthält). Sphere
// (Glocke, Kristallkugel) und Torus (Ring, Singing Bowl) sind die zwei
// natürlichen Container — beide haben ein klares Innen-vs-Außen.
AnazhRealm.SPATIAL_HOLLOW_SHAPES = Object.freeze(new Set(["sphere", "torus"]));

AnazhRealm.SPATIAL_HOLLOW_BONUS = 0.3; // +30 % auf resoniert für beide Parts
AnazhRealm.SPATIAL_AXIS_BONUS = 0.3; // +30 % auf magieleitung + stromleitung
AnazhRealm.SPATIAL_ARRAY_BONUS = 0.4; // +40 % auf resoniert + magieleitung
AnazhRealm.CONNECTION_MAX_PER_BLUEPRINT = 64;
// Material × Op-Klassen-Kompatibilität. Eigene Materialien (define_material) gelten in
// applyOpToPart als „alle vier erlaubt".
AnazhRealm.MATERIAL_OP_COMPATIBILITY = Object.freeze({
    stein: Object.freeze(["subtractive"]),
    holz: Object.freeze(["subtractive", "additive"]),
    eisen: Object.freeze(["subtractive", "plastic", "additive", "phaseChange"]),
    bronze: Object.freeze(["subtractive", "plastic", "additive", "phaseChange"]),
    quarz: Object.freeze(["subtractive", "phaseChange"]),
    leder: Object.freeze(["subtractive", "plastic", "additive"]),
});

// === Werkzeug-Domains + emergente Bauplan-Rolle ===
// Die Rolle eines Bauplans EMERGIERT aus den verwendeten Werkzeugen (wie Compound-Tags aus Material
// × Form). Built-in-Werkzeuge sind generisch (domain=null) und beeinflussen die Rolle nicht.
AnazhRealm.TOOL_DOMAINS = Object.freeze([
    "construction", // Architekturen, Welt-Bauten
    "forging", // Werkzeuge + Rüstungen aus Metall/Stein (Tag-split)
    "alchemy", // Konsumables, Tränke, Tinkturen
    "textile", // Rüstungen aus Stoff/Leder/Pflanzlich
    "soulwork", // Seelen-Avatare, rituelle Wesen
    "mechanism", // Maschinen, komplexe Werkzeug-Bauten
]);

// Dominante Domain → Bauplan-Rolle. Forging ist ein Sonderfall: die
// Rolle (tool vs armor) entscheidet sich erst aus den Compound-Tags
// — eine harte Klinge wird Werkzeug, eine dichte Platte wird Rüstung.
AnazhRealm.DOMAIN_TO_ROLE = Object.freeze({
    construction: "architecture",
    forging: "forging-split", // Sentinel, computeBlueprintRole handled das
    alchemy: "consumable",
    textile: "armor",
    soulwork: "soul",
    mechanism: "machine",
});

// Forging-Split: welche Compound-Tags ziehen den Bauplan zur tool-Seite (scharf, leitend) bzw. zur
// armor-Seite (dicht, zäh) — die Tag-Sprache entscheidet, kein Schalter. magieleitung zählt zu tool
// (Stäbe, Phylakte).
AnazhRealm.FORGING_TOOL_TAGS = Object.freeze(["härte", "magieleitung", "stromleitung"]);
AnazhRealm.FORGING_ARMOR_TAGS = Object.freeze(["dichte", "zähigkeit", "wärmeleitung"]);

// Default-Rolle, wenn keine Domain dominiert (alle generic + leere Chain): Welt-Architektur.
AnazhRealm.DEFAULT_BLUEPRINT_ROLE = "architecture";
// Größen/Masse-Stat-Faktor (_compoundSizeFactor): Σ-SUBSTANZ-Volumen der Parts gegen diese Referenz
// (~0.06 m³ = typisches Hand-Werk → ~1.0), sanfte Potenz, gebounded — nie das Hüll-Volumen
// (Auseinanderzieh-Exploit). Massiger → mächtiger + träger.
AnazhRealm.SIZE_STAT_REF_SUBSTANCE = 0.06;
AnazhRealm.SIZE_STAT_EXPONENT = 0.15;
AnazhRealm.SIZE_STAT_MIN = 0.75;
AnazhRealm.SIZE_STAT_MAX = 1.6;

// Maschinen-Bonus: ein als Werkzeug registrierter Bauplan mit role="machine" hebt die min-Präzision
// der Parts (Maschine präziser als Handarbeit), gedeckelt auf 1.0.
AnazhRealm.MACHINE_PRECISION_BONUS = 0.05;

// SOULLESS_SUBSTANCES — lebendig, aber unbeseelt: Pflanze + Erde leben, tragen aber keine Seele.
// `_blueprintProductVector.livingBody` liest `lebendig` nur über Materialien AUSSERHALB dieser Menge
// → ein reiner holz+laub-Baum fällt emergent auf architecture, ein Wesen behält die Seele.
// FORM_ROLE_SIGNATURES (unten) — Rolle als Resonanz des vollen Produkt-Vektors (Tags ⊕
// bodyShape/portalShape): computeBlueprintRole = opChain-Domäne (Vorrang), sonst ARGMAX dieser
// Signaturen (`_computeFormRole`); setBlueprintAs* bleibt Override (roleManual). Konjunktive
// Geometrie lebt im Feature (0/1), die Disjunktion im argmax. architecture ist POSITIV (dicht,
// hart) — ein Stein-Tempel mit Körper-Geometrie wird Bauwerk; soul liest `livingBody`, portal
// `portalShape`, vehicle rideable (sitz ∧ moveable); `bulk` hält große Bäume aus consumable.
// Floor → architecture; Baseline eingefroren (checkBandV1768).
AnazhRealm.SOULLESS_SUBSTANCES = Object.freeze(new Set(["holz", "laub", "kraut", "erde"]));
AnazhRealm.FORM_ROLE_SIGNATURES = Object.freeze({
    soul: Object.freeze({ livingBody: 1.4, lebendig: 0.4 }),
    portal: Object.freeze({ portalShape: 1.6 }),
    vehicle: Object.freeze({ rideable: 1.8, spread: 0.3 }),
    // Gegen-Achse spread: ein Trank hat keine Trag-Basis (Wagen 1.0, Holzross 0.77, Trank 0) — ein
    // toter Holz-Kasten ohne Sitz wird Bauwerk statt Trank.
    consumable: Object.freeze({ lebendig: 1.5, härte: -0.5, bulk: -0.8, spread: -0.6 }),
    architecture: Object.freeze({ dichte: 1.0, härte: 0.6, bulk: 0.3 }),
});
// Der Floor auf die NORMALISIERTE Skala gesenkt (A1: Material-Tags jetzt [0..1] statt [0..3] → die rohen
// Resonanzen fielen ~3× → der alte 0.5-Floor schluckte z.B. den Trank in den architecture-Default).
AnazhRealm.FORM_ROLE_RESONANCE_FLOOR = 0.35;

// DAS EINE ROLLEN-SIGNATUR-REGISTER: jede Rolle als VOLLE Signatur über alle Achsen (10
// Material-Tags ⊕ Form-Achsen) — die EINE Wahrheit „was ist eine gute X" für alle Leser
// (Rolle-Passung, Klassifikation, Katalysator-Readout). _blueprintResonance liest den vollen
// Produkt-Vektor; negative Gewichte = Gegen-Achsen (Klinge NICHT zäh, Trank NICHT hart, Gerät
// NICHT hohl).
AnazhRealm.ROLE_SIGNATURES = Object.freeze({
    // GERÄTE (gehaltenes Implement): held = der generische Slot (scharf ODER schwer, hart, gestreckt, nicht hohl).
    held: Object.freeze({
        pointedFraction: 1.2,
        härte: 0.8,
        dichte: 0.5,
        elongation: 0.6,
        zähigkeit: 0.2,
        hollowness: -0.3,
    }),
    // V17.90 — der lebendig-Distinguisher trennt Waffe/Werkzeug bei sonst gleicher Spitz-Form: ein WERKZEUG hat
    // einen organischen GRIFF (Holzstiel → lebendig+), eine WAFFE ist totes Metall (lebendig−). So liest ein
    // Pickel mit Holzstiel „Werkzeug", ein reines Metall-Schwert „Waffe".
    weapon: Object.freeze({
        pointedFraction: 1.5,
        härte: 1.0,
        elongation: 0.8,
        dichte: 0.7,
        zähigkeit: -0.5,
        lebendig: -0.5,
    }),
    tool: Object.freeze({
        pointedFraction: 1.1,
        härte: 0.9,
        elongation: 0.5,
        dichte: 0.2,
        zähigkeit: 0.4,
        lebendig: 0.5,
    }),
    brecher: Object.freeze({ dichte: 1.3, härte: 0.6, zähigkeit: 0.4, pointedFraction: -0.8 }),
    // RÜSTUNG: dicht, hart, zäh, leicht hohl (Polster), nicht spitz, mit Standfläche.
    armor: Object.freeze({
        dichte: 1.0,
        härte: 0.9,
        zähigkeit: 0.4,
        hollowness: 0.2,
        spread: 0.2,
        pointedFraction: -0.4,
    }),
    // TRANK: lebendig, transparent, resonant, hohl (Behälter), weich. Die Gegen-Achsen (keine Masse,
    // keine Trag-Basis) spiegeln FORM_ROLE_SIGNATURES — eine Wahrheit, alle Leser.
    consumable: Object.freeze({
        lebendig: 1.5,
        transparent: 0.4,
        resoniert: 0.3,
        hollowness: 0.3,
        härte: -0.6,
        bulk: -0.8,
        spread: -0.6,
    }),
    // SEELE: ein LEBENDIGER Körper (livingBody = Körper-Form UND lebendig, V17.90 — ein toter Körper-Panzer
    // ist KEINE Seele) + lebendig-Gradient + Symmetrie/Resonanz für die Feinheit.
    soul: Object.freeze({ livingBody: 1.8, lebendig: 0.6, axialSymmetry: 0.4, bodyShape: 0.3, resoniert: 0.2 }),
    // PORTAL: Ring-Form, magie-leitend, transparent, resonant.
    portal: Object.freeze({ portalShape: 2.0, magieleitung: 1.0, transparent: 0.5, resoniert: 0.4 }),
    // FAHRZEUG: Trag-Basis, zäh, gestreckt, angetrieben (magie/strom), tot, mittel-dicht; + rideable
    // (sitz ∧ moveable) = die Fahrzeug-Essenz. Die gerechnete Fahr-Physik führt: `stability` (CoM über
    // dem Rad-Stützpolygon) + `rollable`; `spread` gesenkt → ein kopflastiges Schein-Fahrzeug liest
    // schwächer.
    vehicle: Object.freeze({
        rideable: 1.0,
        stability: 0.7,
        rollable: 0.7,
        spread: 0.8,
        zähigkeit: 1.0,
        elongation: 0.4,
        magieleitung: 0.4,
        stromleitung: 0.4,
        dichte: 0.2,
        lebendig: -0.4,
    }),
    // MASCHINE: leitend, warm, dicht, standfest.
    machine: Object.freeze({ stromleitung: 1.4, wärmeleitung: 0.5, dichte: 0.6, spread: 0.5 }),
    // WERKSTATT: solide Substanz (Präzision) + Standfläche; die Domäne emergiert separat (R1).
    "workshop-station": Object.freeze({ dichte: 1.0, härte: 0.7, spread: 0.3 }),
    // BAUWERK: massiv, hart, standfest, nicht spitz. Standfest wird gerechnet: `stability` (CoM über
    // Stützpolygon) + `loadSound` (Lastpfad zum Boden intakt), nicht aus `spread` geraten.
    architecture: Object.freeze({
        dichte: 1.2,
        härte: 0.7,
        stability: 0.5,
        loadSound: 0.5,
        spread: 0.25,
        pointedFraction: -0.6,
    }),
});
// Passung ∈ [min, max] (1.0 = neutral): gut geformt → max (Buff), form-fremd → min (Nerf). Der ref
// je Rolle normalisiert ≈ die Resonanz des perfekten Katalysators (Material-Tags auf [0..1]) →
// Archetyp ~1.0, typisches Werk ~0.5–0.7 (das Spektrum spreizt).
AnazhRealm.QUALITY_ROLE_FIT = Object.freeze({
    min: 0.8,
    max: 1.2,
    refs: Object.freeze({
        held: 2.6,
        weapon: 2.8,
        tool: 2.6,
        brecher: 2.3,
        armor: 2.4,
        consumable: 1.1,
        soul: 2.3,
        portal: 2.3,
        vehicle: 3.4,
        machine: 3.2,
        "workshop-station": 2.7,
        architecture: 2.5,
    }),
});
AnazhRealm.AXIS_LABELS = Object.freeze({
    pointedFraction: "Schärfe",
    elongation: "Streckung",
    härte: "Härte",
    dichte: "Dichte",
    zähigkeit: "Zähigkeit",
    hollowness: "Hohlraum",
    axialSymmetry: "Symmetrie",
    spread: "Standfläche",
    lebendig: "Lebendigkeit",
    transparent: "Transparenz",
    resoniert: "Resonanz",
    magieleitung: "Magie-Leitung",
    stromleitung: "Strom-Leitung",
    wärmeleitung: "Wärme-Leitung",
    brennbar: "Brennbarkeit",
    bodyShape: "Körper-Form",
    portalShape: "Tor-Form",
    // Ω-L1 (wahrerbauplan §5) — die GERECHNETEN Physik-Achsen (Säule I).
    stability: "Standfestigkeit",
    stiffness: "Steifigkeit",
    balance: "Balance",
    leverage: "Hebelwucht",
    loadSound: "Lastpfad",
    rollable: "Rollfähigkeit",
});
// Geltungsbereich jeder Achse (Warum-Chip + Werkstatt): „physik" = gerechnete Wahrheit mit externem
// Richter (darf Wahrheit behaupten); „konvention" = AnazhRealms erfundene, konsistente Welt-Physik
// (behauptet nur Konsistenz); „form" = geometrischer Stellvertreter.
AnazhRealm.AXIS_CLASS = Object.freeze({
    // PHYSIKALISCH — Material-Eigenschaften mit echtem Richter
    härte: "physik",
    dichte: "physik",
    zähigkeit: "physik",
    wärmeleitung: "physik",
    stromleitung: "physik",
    transparent: "physik",
    brennbar: "physik",
    // PHYSIKALISCH — gerechnete Größen (Säule I, Ω-Φ1..Φ5)
    stability: "physik",
    stiffness: "physik",
    balance: "physik",
    leverage: "physik",
    loadSound: "physik",
    rollable: "physik",
    // KONVENTION — AnazhRealms erfundene Welt-Physik (kein physikalischer Richter)
    magieleitung: "konvention",
    resoniert: "konvention",
    lebendig: "konvention",
    // FORM — geometrische Stellvertreter (Übergangs-Fallback, §5 Ω-L1)
    pointedFraction: "form",
    elongation: "form",
    hollowness: "form",
    axialSymmetry: "form",
    spread: "form",
    bodyShape: "form",
    portalShape: "form",
    livingBody: "form",
    rideable: "form",
    bulk: "form",
});
// §7.3(b) (V18.164) — KONJUNKTIONS-Achsen (0/1) sind TATEN, keine Zahlen: die
// WARUM-Führung (_blueprintRoleGapHint) spricht sie als deutsche Handlung aus.
AnazhRealm.AXIS_ACTION_HINTS = Object.freeze({
    rideable: "setze einen Sitz-Anker (Fahrzeug = Sitz + Antrieb)",
    livingBody: "nutze lebendiges Material am Körper",
    bodyShape: "forme einen Körper (symmetrisch · vertikal · Glieder)",
    portalShape: "forme einen Ring in Reisenden-Größe",
    // Die gerechneten Physik-Achsen bekommen ihr physik-wahres Verb: der Hinweis zitiert das Gesetz
    // (die Tat verschiebt die gerechnete Größe messbar in die versprochene Richtung).
    stability: "verbreitere die Basis (Schwerpunkt sicher über der Standfläche)",
    loadSound: "schließe den Lastpfad zum Boden (kein schwebendes Teil)",
    rollable: "setze runde Räder an den Boden (rollt um eine freie Achse)",
    stiffness: "lege Material weg von der Biegeachse (Hohlrohr/I-Profil statt Vollstab)",
    balance: "verlagere die Masse zum Griff (näher balanciert → schnellere Führung)",
    leverage: "rücke die Kopfmasse nach vorn (längerer Hebel → mehr Wucht)",
});

// Katalysator-Op aus der Form: opClass = argmax-Resonanz des Produkt-Vektors (Tags ⊕
// pointedFraction). subtractive = scharfe/spitze Klinge (pointedFraction dominiert); plastic =
// stumpfe, dichte Masse (Hammer); phaseChange = magie-leitender Stab (magie schlägt sogar die Spitze
// einer Helix). additive ist form-mehrdeutig (Mörser ≈ Hammer) → schwache Residual-Signatur
// (weich/zäh/lebendig), reine Misch-Absicht bleibt Hand-Override. Material-Gewichte sind auf die
// [0..1]-Tag-Skala angehoben (sonst schlüge pointedFraction sie). Wächter: checkBandV1771.
AnazhRealm.OP_CLASS_SIGNATURES = Object.freeze({
    subtractive: Object.freeze({ pointedFraction: 2.3, härte: 0.2 }),
    plastic: Object.freeze({ dichte: 1.8, härte: 0.5 }),
    phaseChange: Object.freeze({ magieleitung: 3.0 }),
    additive: Object.freeze({ zähigkeit: 1.5, lebendig: 1.5, härte: -1.0 }),
});
// Der Standard-opName je opClass (die opChain-„Geschichte"; die opClass treibt die Material-Kompatibilität).
AnazhRealm.OP_NAME_BY_CLASS = Object.freeze({
    subtractive: "carve",
    plastic: "forge",
    phaseChange: "imbue",
    additive: "mix",
});
// Form-Tag-Aktivierungs-Matrix: 0 = Form schließt das Tag aus, 1 = schwach, 2 = stark,
// 3 = Signatur. Aktivierte Tag-Stärke = MATRIX × Material-Tag (0..1) → pro Part 0..3.
AnazhRealm.FORM_TAG_ACTIVATION = Object.freeze({
    box: Object.freeze({
        härte: 1,
        dichte: 3,
        zähigkeit: 1,
        wärmeleitung: 1,
        stromleitung: 1,
        magieleitung: 0,
        transparent: 1,
        brennbar: 1,
        resoniert: 0,
        lebendig: 0,
    }),
    // F2 (wahrerwuchs §11) — eine gewölbte Platte IST ein solides Panel → Aktivierung == box.
    plateShell: Object.freeze({
        härte: 1,
        dichte: 3,
        zähigkeit: 1,
        wärmeleitung: 1,
        stromleitung: 1,
        magieleitung: 0,
        transparent: 1,
        brennbar: 1,
        resoniert: 0,
        lebendig: 0,
    }),
    // F2 (wahrerwuchs §11) — ein revolviertes Gefäß IST eine gerundete Hohl-Form → == sphere.
    latheProfile: Object.freeze({
        härte: 0,
        dichte: 3,
        zähigkeit: 0,
        wärmeleitung: 1,
        stromleitung: 1,
        magieleitung: 2,
        transparent: 3,
        brennbar: 0,
        resoniert: 3,
        lebendig: 1,
    }),
    // F5 (wahrerwuchs §11) — ein Speichen-Rad IST eine Zylinder-Scheibe → Aktivierung == cylinder.
    spokeWheel: Object.freeze({
        härte: 1,
        dichte: 2,
        zähigkeit: 2,
        wärmeleitung: 3,
        stromleitung: 3,
        magieleitung: 2,
        transparent: 2,
        brennbar: 1,
        resoniert: 2,
        lebendig: 2,
    }),
    // F2 (wahrerwuchs §11) — ein Spitzhacken-Kopf IST eine spitze Schneide → Aktivierung == cone.
    pickHead: Object.freeze({
        härte: 3,
        dichte: 1,
        zähigkeit: 0,
        wärmeleitung: 2,
        stromleitung: 2,
        magieleitung: 2,
        transparent: 2,
        brennbar: 1,
        resoniert: 1,
        lebendig: 0,
    }),
    // V18.227 (Ω-OPSIS Säule VI) — der prozedurale Fels ist eine dichte Masse wie
    // ein Block: dieselbe Aktivierung wie `box` → stein_block (box → noiserock)
    // bleibt TAG-NEUTRAL (die V17.16-Affinitäts-Wand hält, die Baseline unberührt).
    noiserock: Object.freeze({
        härte: 1,
        dichte: 3,
        zähigkeit: 1,
        wärmeleitung: 1,
        stromleitung: 1,
        magieleitung: 0,
        transparent: 1,
        brennbar: 1,
        resoniert: 0,
        lebendig: 0,
    }),
    sphere: Object.freeze({
        härte: 0,
        dichte: 3,
        zähigkeit: 0,
        wärmeleitung: 1,
        stromleitung: 1,
        magieleitung: 2,
        transparent: 3,
        brennbar: 0,
        resoniert: 3,
        lebendig: 1,
    }),
    cylinder: Object.freeze({
        härte: 1,
        dichte: 2,
        zähigkeit: 2,
        wärmeleitung: 3,
        stromleitung: 3,
        magieleitung: 2,
        transparent: 2,
        brennbar: 1,
        resoniert: 2,
        lebendig: 2,
    }),
    // `limb` = verjüngter Kapsel-Knochen (Glied/Hals/Schwanz); morphologisch ein Zylinder → Aktivierung
    // BIT-IDENTISCH zu `cylinder`. So bleibt jedes aus Gliedern gebaute Wesen tag-neutral gegen die alte
    // Zylinder-Form (Affinitäts-Tag-Wand).
    limb: Object.freeze({
        härte: 1,
        dichte: 2,
        zähigkeit: 2,
        wärmeleitung: 3,
        stromleitung: 3,
        magieleitung: 2,
        transparent: 2,
        brennbar: 1,
        resoniert: 2,
        lebendig: 2,
    }),
    cone: Object.freeze({
        härte: 3,
        dichte: 1,
        zähigkeit: 0,
        wärmeleitung: 2,
        stromleitung: 2,
        magieleitung: 2,
        transparent: 2,
        brennbar: 1,
        resoniert: 1,
        lebendig: 0,
    }),
    pyramid: Object.freeze({
        härte: 2,
        dichte: 2,
        zähigkeit: 0,
        wärmeleitung: 1,
        stromleitung: 1,
        magieleitung: 3,
        transparent: 1,
        brennbar: 1,
        resoniert: 2,
        lebendig: 0,
    }),
    octahedron: Object.freeze({
        härte: 3,
        dichte: 2,
        zähigkeit: 0,
        wärmeleitung: 2,
        stromleitung: 1,
        magieleitung: 3,
        transparent: 3,
        brennbar: 0,
        resoniert: 2,
        lebendig: 0,
    }),
    // `crystalPoint` = facettiertes Prisma mit pyramidaler Termination — Aktivierung BIT-IDENTISCH zu
    // `octahedron`, damit ein daraus gebauter Kristall tag-neutral gegen die alte
    // sphere+octahedron-Druse bleibt (kristall_geode frozen).
    crystalPoint: Object.freeze({
        härte: 3,
        dichte: 2,
        zähigkeit: 0,
        wärmeleitung: 2,
        stromleitung: 1,
        magieleitung: 3,
        transparent: 3,
        brennbar: 0,
        resoniert: 2,
        lebendig: 0,
    }),
    plane: Object.freeze({
        härte: 1,
        dichte: 1,
        zähigkeit: 3,
        wärmeleitung: 2,
        stromleitung: 2,
        magieleitung: 1,
        transparent: 3,
        brennbar: 3,
        resoniert: 2,
        lebendig: 2,
    }),
    torus: Object.freeze({
        härte: 1,
        dichte: 1,
        zähigkeit: 2,
        wärmeleitung: 2,
        stromleitung: 3,
        magieleitung: 3,
        transparent: 1,
        brennbar: 1,
        resoniert: 3,
        lebendig: 1,
    }),
    helix: Object.freeze({
        härte: 0,
        dichte: 0,
        zähigkeit: 3,
        wärmeleitung: 2,
        stromleitung: 3,
        magieleitung: 3,
        transparent: 0,
        brennbar: 2,
        resoniert: 2,
        lebendig: 2,
    }),
});
