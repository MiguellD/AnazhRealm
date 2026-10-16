class AnazhRealm_Z23b {
    // ===== ATLAS §23b · WERKSTATT — ab _specRenderHeader =====
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

    // Hilfsmethode für UI/Tests: zählt Architekturen in Spieler-Nähe.
    countArchitecturesNearPlayer(radius = 60) {
        const playerPos = this.state.playerMesh ? this.state.playerMesh.position : null;
        if (!playerPos) return { near: 0, total: this.state.architectures.length };
        const radiusSq = radius * radius;
        let near = 0;
        for (const entry of this.state.architectures) {
            const dx = entry.position.x - playerPos.x;
            const dz = entry.position.z - playerPos.z;
            if (dx * dx + dz * dz <= radiusSq) near++;
        }
        return { near, total: this.state.architectures.length };
    }

    // Ring 5 V2 Vorbereitung — Kamera-Modus (Erst-/Dritte-Person).
    // DIE KAMERA-FÜHRUNG (K16b, der Anschluss eines Studios an die Welt-Engine): `fn(camera, t, spielerPos)` setzt je Frame
    // die Kamera statt der Spieler-Kamera (`_loopCamera`); null gibt sie dem Spieler zurück. Leser: das Gelände-Studio
    // (Makro-Flug, langsamer Orbit; „Augenhöhe" = null).
    kameraFuehren(fn) {
        this._kameraFuehrung = typeof fn === "function" ? fn : null;
    }

    setCameraMode(mode) {
        const next = mode === "third" ? "third" : "first";
        this.state.cameraMode = next;
        this._applyEgoSicht(); // T7 — der Modus-Schalter trägt die Sicht-Regel sofort (EINE Naht)
        const toggle = typeof document !== "undefined" ? document.getElementById("camera-mode-toggle") : null;
        if (toggle) {
            toggle.setAttribute("aria-pressed", next === "third" ? "true" : "false");
            toggle.textContent = next === "third" ? "Sicht: 3rd" : "Sicht: 1st";
        }
        try {
            localStorage.setItem("anazhRealmCameraMode", next);
        } catch {
            // Persistenz nicht hart erforderlich; pro-Session reicht.
        }
        this.log(`Kamera-Modus: ${next}`, "INFO");
    }

    // === Spielmodi (frieden / pfad / schöpfer) ===
    // frieden — Welt umarmt (kein HP/Tod/Stamina-Kosten) · pfad — verhandelt (HP/Stamina/Tod aktiv) ·
    // schöpfer — gehorcht (kein Schaden, voller Zugang). Persistiert in worldMeta.gameMode (pro Welt),
    // gespiegelt nach state.gameMode für Gate-Reads. setGameMode ist der EINZIGE Mutations-Pfad
    // (beide + UI-Latches + Status-Bar + Save).
    static get GAME_MODES() {
        return Object.freeze(["frieden", "pfad", "schöpfer"]);
    }

    setGameMode(mode) {
        const canonical = AnazhRealm.GAME_MODES.includes(mode) ? mode : "frieden";
        if (!this.state.worldMeta) this.state.worldMeta = {};
        this.state.worldMeta.gameMode = canonical;
        this.state.gameMode = canonical;
        // HP bei frieden→pfad-Wechsel NICHT zurücksetzen: der Spieler
        // bringt seinen Zustand mit (Vision: Welt-Beziehung ändert sich,
        // nicht der Spieler).
        this._renderGameModeUI();
        // Welle 6.H Phase 2C — Bau-HUD muss bei Modus-Wechsel mit: aus
        // pfad raus → Kosten-Zeile verschwindet; in pfad rein → Kosten-Zeile
        // erscheint. Defensiv (Test-Edge-Cases vor Init).
        if (typeof this._updateBuildModeHud === "function") this._updateBuildModeHud();
        try {
            this.saveState();
        } catch {
            // saveState-Fehler nicht hart blockend — Modus lebt in state.
        }
        if (typeof this.log === "function") {
            const labels = { frieden: "Frieden", pfad: "Pfad", schöpfer: "Schöpfer" };
            this.log(`Welt-Beziehung: ${labels[canonical] || canonical}`, "INFO");
        }
        return canonical;
    }

    // Aktueller Modus mit Migration: ohne worldMeta.gameMode (alte Saves) → frieden. Bei Inkonsistenz
    // gewinnt worldMeta (Persistenz-Quelle); state.gameMode spiegelt.
    getGameMode() {
        const stored = this.state.worldMeta && this.state.worldMeta.gameMode;
        const canonical = AnazhRealm.GAME_MODES.includes(stored) ? stored : "frieden";
        // state.gameMode-Spiegelung repariert (Cache nach Migration).
        if (this.state.gameMode !== canonical) this.state.gameMode = canonical;
        return canonical;
    }

    // UI-Render-Pfad: aktualisiert Radio + Status-Bar nach Mode-Wechsel.
    // Idempotent — kann ohne State-Wechsel aufgerufen werden.
    _renderGameModeUI() {
        if (typeof document === "undefined") return;
        const mode = this.getGameMode();
        // Radio-Buttons in Einstellungen-Drawer
        const radios = document.querySelectorAll('input[name="game-mode-radio"]');
        radios.forEach((r) => {
            r.checked = r.value === mode;
        });
        // Status-Bar-Item
        const statusItem = document.getElementById("status-mode");
        if (statusItem) {
            const labels = { frieden: "frieden", pfad: "pfad", schöpfer: "schöpfer" };
            statusItem.textContent = labels[mode] || mode;
        }
    }

    gameModeInitDOM() {
        if (typeof document === "undefined") return;
        const radios = document.querySelectorAll('input[name="game-mode-radio"]');
        radios.forEach((r) => {
            r.addEventListener("change", () => {
                if (r.checked) this.setGameMode(r.value);
            });
        });
        this._renderGameModeUI();
    }

    // Welle 6.H Phase 2E V2 — Proaktive-Sprache-Toggle. localStorage als
    // Wahrheit (überlebt Reload + Welt-Wechsel); state-Spiegel für Runtime-
    // Checks. Default ON (das Leben der Welt soll sichtbar sein).
    creatureSpeechInitDOM() {
        if (typeof document === "undefined") return;
        // Initial-Wert aus localStorage, sonst true.
        let enabled = true;
        if (typeof localStorage !== "undefined") {
            const raw = localStorage.getItem("anazh.creatureProactiveSpeech");
            if (raw === "0" || raw === "false") enabled = false;
        }
        this.state.creatureProactiveSpeechEnabled = enabled;
        const cb = document.getElementById("creature-speech-toggle");
        if (cb) {
            cb.checked = enabled;
            cb.addEventListener("change", () => {
                this.state.creatureProactiveSpeechEnabled = !!cb.checked;
                if (typeof localStorage !== "undefined") {
                    try {
                        localStorage.setItem("anazh.creatureProactiveSpeech", cb.checked ? "1" : "0");
                    } catch {
                        /* quota / private mode → silent */
                    }
                }
                this.log(cb.checked ? "Kreaturen-Stimmen aktiv" : "Kreaturen-Stimmen ruhen", "INFO");
            });
        }
    }

    // Einstellungen-Sektionen faltbar, generisch: der <h3> jeder <section> toggelt .collapsed (CSS blendet
    // den Rest aus). Falt-Zustand als Map in localStorage; Default alle offen. Idempotent — schon
    // verdrahtete Header (.collapsible-header) werden übersprungen.
    _initCollapsibleSettings() {
        // V17.37 D-2 — generisch: dasselbe Falt-Muster für die Einstellungen UND den HOF
        // (UI-Putz: Kreaturen + Fähigkeiten + Gesetze + Befehle vereint — der Ort, an dem
        // die Kommunikation zusammentrifft; einklappbare Sektionen halten ihn übersichtlich).
        this._initCollapsibleDrawer("einstellungen", "anazh.settings.collapsed");
        this._initCollapsibleDrawer("kreaturen", "anazh.hof.collapsed");
        // V18.34 — dasselbe EINE Falt-System auch im Ich/Inventar (kein zweites — V9.82):
        // die Sektionen tragen h4-Header; „Mehr: Wechseln & Markieren" ist default-collapsed
        // (der intuitive Pfad ist Was-du-trägst + Rezeptbuch; die Dropdowns sind die Tiefe).
        this._initCollapsibleSections("#inventory-overlay", "anazh.ich.collapsed", "h4");
    }

    _initCollapsibleDrawer(drawerName, storageKey) {
        // Dünner Wrapper auf den generischen Pfad — ein Drawer, h3-Header (V18.34: das EINE
        // Falt-System; das Inventar nutzt denselben Pfad mit #inventory-overlay + h4).
        this._initCollapsibleSections(`.drawer[data-drawer="${drawerName}"]`, storageKey, "h3");
    }

    _initCollapsibleSections(rootSelector, storageKey, headerSel = "h3") {
        if (typeof document === "undefined") return;
        const drawer = document.querySelector(rootSelector);
        if (!drawer) return;
        let stored = {};
        try {
            stored = JSON.parse(localStorage.getItem(storageKey) || "{}") || {};
        } catch {
            stored = {};
        }
        const sections = drawer.querySelectorAll("section.section, section.settings-section");
        sections.forEach((sec, i) => {
            const header = sec.querySelector(headerSel);
            if (!header || header.classList.contains("collapsible-header")) return;
            const key = sec.id || `${rootSelector}-sec-${i}`;
            header.classList.add("collapsible-header");
            header.setAttribute("role", "button");
            header.setAttribute("tabindex", "0");
            // Default-collapsed (z.B. das Entwickler-Render-Tuning): zu, solange der
            // Spieler nichts anderes wählte (kein localStorage-Eintrag für diese Sektion).
            const collapsed = key in stored ? stored[key] : sec.classList.contains("default-collapsed");
            if (collapsed) sec.classList.add("collapsed");
            const toggle = () => {
                sec.classList.toggle("collapsed");
                stored[key] = sec.classList.contains("collapsed");
                try {
                    localStorage.setItem(storageKey, JSON.stringify(stored));
                } catch {
                    /* quota / private mode → silent */
                }
            };
            // V18.80 — ein Klick/Tasten-Druck auf ein „?"-Help-Dot IM Header faltet NICHT (es
            // zeigt nur den P12-Hinweis; der Hinweis lebt jetzt im Header statt als Textwand).
            const onHelpDot = (event) => !!(event.target && event.target.closest && event.target.closest(".help-dot"));
            header.addEventListener("click", (event) => {
                if (onHelpDot(event)) return;
                toggle();
            });
            header.addEventListener("keydown", (event) => {
                if (onHelpDot(event)) return;
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    toggle();
                }
            });
        });
    }

    // Stats-HUD über der Hotbar: SVG-Bars für HP + Stamina; Hover zeigt die langsamen Stats im Tooltip.
    // Refresh im Game-Loop, gedrosselt auf ~10 Hz.
    tickStatsHud(currentTime) {
        if (typeof document === "undefined") return;
        const last = this.state._statsHudLastTick || 0;
        if (currentTime - last < 0.1) return; // 10 Hz Throttle
        this.state._statsHudLastTick = currentTime;
        const hpFill = document.getElementById("stats-hud-hp-fill");
        const hpText = document.getElementById("stats-hud-hp-text");
        const stamFill = document.getElementById("stats-hud-stam-fill");
        const stamText = document.getElementById("stats-hud-stam-text");
        if (!hpFill || !hpText || !stamFill || !stamText) return;
        // hp/hpMax setzt erst recomputePlayerStats — rendert das HUD davor, gilt stats.hpMax für beide
        // (voll statt Schock-Anzeige 0/100 beim Boot).
        const p = this.state.player || {};
        const computedStats = p.stats || {};
        const fallbackHpMax = computedStats.hpMax || 100;
        const fallbackStamMax = computedStats.staminaMax || 100;
        const hp = Math.max(0, Math.round(typeof p.hp === "number" ? p.hp : fallbackHpMax));
        const hpMax = Math.max(1, Math.round(typeof p.hpMax === "number" ? p.hpMax : fallbackHpMax));
        const stam = Math.max(0, Math.round(typeof p.stamina === "number" ? p.stamina : fallbackStamMax));
        const stamMax = Math.max(1, Math.round(typeof p.staminaMax === "number" ? p.staminaMax : fallbackStamMax));
        const hpRatio = Math.max(0, Math.min(1, hp / hpMax));
        const stamRatio = Math.max(0, Math.min(1, stam / stamMax));
        // Welle 6.X.4 B3 V8.14 — neue Bar-Breite 166 (von 158), zusätzlicher
        // Glow-Strip oben drauf folgt derselben Breite.
        hpFill.setAttribute("width", String(166 * hpRatio));
        const hpGlow = document.getElementById("stats-hud-hp-glow");
        if (hpGlow) hpGlow.setAttribute("width", String(166 * hpRatio));
        stamFill.setAttribute("width", String(166 * stamRatio));
        const stamGlow = document.getElementById("stats-hud-stam-glow");
        if (stamGlow) stamGlow.setAttribute("width", String(166 * stamRatio));
        hpText.textContent = `${hp}/${hpMax}`;
        stamText.textContent = `${stam}/${stamMax}`;
        // Mana-Row: Welt-Gesten kosten in pfad Mana (derselbe Kosten-Walker wie das Nexus-Wirk-Budget);
        // dritte Row derselben Familie (eine Quelle, eine Throttle), NUR in pfad sichtbar.
        const manaRow = document.getElementById("stats-hud-mana-row");
        if (manaRow) {
            const isPfad = typeof this.getGameMode === "function" && this.getGameMode() === "pfad";
            manaRow.hidden = !isPfad;
            if (isPfad) {
                const manaMax = Math.max(1, Math.round(typeof p.manaMax === "number" ? p.manaMax : 40));
                const mana = Math.max(0, Math.round(typeof p.mana === "number" ? p.mana : manaMax));
                const manaRatio = Math.max(0, Math.min(1, mana / manaMax));
                const manaFill = document.getElementById("stats-hud-mana-fill");
                if (manaFill) manaFill.setAttribute("width", String(166 * manaRatio));
                const manaGlow = document.getElementById("stats-hud-mana-glow");
                if (manaGlow) manaGlow.setAttribute("width", String(166 * manaRatio));
                const manaText = document.getElementById("stats-hud-mana-text");
                if (manaText) manaText.textContent = `${mana}/${manaMax}`;
            }
        }
        // V8.14 — HP-niedrig-Pulse: bei < 30 % bekommt der HUD eine
        // pulsierende rote Aura via CSS-Animation. Über 30 % wieder ruhig.
        const hud = document.getElementById("stats-hud");
        if (hud) {
            if (hpRatio < 0.3) hud.classList.add("stats-hud-low");
            else hud.classList.remove("stats-hud-low");
        }
        // Tooltip alle 1 s aktualisieren (slow stats ändern sich selten —
        // nur bei Soul/Equipped/Boost-Wechsel). Throttle damit Hover keine
        // permanenten Re-Builds triggert.
        const ttLast = this.state._statsHudTooltipLastTick || 0;
        if (currentTime - ttLast < 1.0) return;
        this.state._statsHudTooltipLastTick = currentTime;
        // M5 (V18.157, Befund 15) — die Boost-Chips zählen LIVE (im selben 1-s-Takt).
        this._tickBoostChips();
        const tooltip = document.getElementById("stats-hud-tooltip");
        if (!tooltip) return;
        const stats = (this.state.player && this.state.player.stats) || null;
        if (!stats) {
            tooltip.textContent = "Stats nicht initialisiert";
            return;
        }
        const lines = [
            `Schaden       ${(stats.damage || 0).toFixed(1)}`,
            `Rückschlag    ${(stats.knockback || 0).toFixed(1)}`,
            // KAMPF-GEFÜHL — das Tempo liest die EINE Schwung-Quelle (Schwünge/s =
            // 1/Dauer ∝ 1/√I des Gehaltenen), nicht mehr die attackSpeed-Tag-Parallel-
            // Wahrheit (die als Kreatur-Profil weiterlebt — ihr Körper ist ihre Substanz).
            `Angriffstempo ${(1 / this._playerSwingDauer()).toFixed(2)}/s`,
            `Geschwindigk. ${(stats.speed || 0).toFixed(2)}`,
            `Sprungkraft   ${(stats.jumpPower || 0).toFixed(2)}`,
            `Präzision     ${(stats.precision || 0).toFixed(2)}`,
            `Verteidigung  ${(stats.defense || 0).toFixed(1)}`,
            `Magie-Resist  ${(stats.magicResist || 0).toFixed(2)}`,
            `Hitze-Resist  ${(stats.heatResist || 0).toFixed(2)}`,
        ];
        // Plus equipped + boosts kurz
        const eq = (this.state.player && this.state.player.equipped) || {};
        if (eq.tool) lines.push(`Werkzeug      ${eq.tool}`);
        if (eq.weapon) lines.push(`Waffe         ${eq.weapon}`);
        if (eq.armor) lines.push(`Rüstung       ${eq.armor}`);
        const boosts = (this.state.player && this.state.player.boosts) || [];
        const now = performance.now() / 1000;
        const activeBoosts = boosts.filter((b) => b.expiresAt > now);
        if (activeBoosts.length > 0) {
            lines.push(`Boosts        ${activeBoosts.length}`);
        }
        // <br>-getrennt damit das Tooltip schmal bleibt
        tooltip.innerHTML = lines.join("<br>");
    }

    // ### Atmosphäre-Wurzel-Helper ###
    // Jede Atmosphäre-Schicht emergiert aus dem System, nicht aus Tabellen. Methoden mit dem
    // ATMOSPHERE-Marker prüft audit-strict (Atmosphäre-Hardcode-Audit: if-Type-Maps, Magic-Hz).

    // [ATMOSPHERE] Affinity-Pick: der Kandidat, dessen Compound-Tags am stärksten mit dem Welt-Feld an
    // (x, z) resonieren — Dot-Product über lebendig/dichte/glut/magieleitung, plus noise-Anteil (sonst
    // immer dieselbe Soul je Region). Liefert {pick, scoreMap} (Tests prüfen die Diskrimination).
    _affinityPickFromCandidates(candidates, fieldAtPos, noise = 0.15, rng = this._faunaRng()) {
        if (!Array.isArray(candidates) || candidates.length === 0) {
            return { pick: null, scoreMap: {} };
        }
        if (!fieldAtPos || typeof fieldAtPos !== "object") {
            // Ohne Welt-Feld kein Affinity-Pick → erster Kandidat
            return { pick: candidates[0], scoreMap: {} };
        }
        const axes = ["lebendig", "dichte", "glut", "magieleitung"];
        let bestPick = null;
        let bestScore = -Infinity;
        const scoreMap = {};
        for (const cand of candidates) {
            const tags = cand.tags || {};
            let score = 0;
            for (const ax of axes) {
                const fieldVal = fieldAtPos[ax] || 0;
                const tagVal = tags[ax] || 0;
                score += fieldVal * tagVal;
            }
            // Noise: kleine Streuung, damit nicht jeder Spawn identisch ist — aus dem Strom des Aufrufers (Γ5)
            score += (rng() - 0.5) * noise;
            scoreMap[cand.name || cand.id || "(unnamed)"] = score;
            if (score > bestScore) {
                bestScore = score;
                bestPick = cand;
            }
        }
        return { pick: bestPick, scoreMap };
    }

    // [ATMOSPHERE] Emotion-Modulator (pure): wendet die sechs Emotions-Achsen einer modSpec an
    // ({ joy: +0.1, awe: ×1.5, … }): Präfix '×' bzw. `mul` multipliziert, '+' bzw. `add` addiert
    // (Default additiv).
    _emotionModulate(baseValue, modSpec, emotions) {
        if (typeof baseValue !== "number" || !Number.isFinite(baseValue)) return baseValue;
        const e = emotions || (this.state.player && this.state.player.emotions) || {};
        const axes = ["joy", "awe", "sorrow", "hope", "peace", "chaos"];
        let result = baseValue;
        for (const ax of axes) {
            if (!modSpec || modSpec[ax] === undefined || modSpec[ax] === null) continue;
            const eVal = Math.max(0, Math.min(1, e[ax] || 0));
            const m = modSpec[ax];
            if (typeof m === "number") {
                result += m * eVal; // Additiv-Default
            } else if (m && typeof m === "object") {
                if (typeof m.mul === "number") result *= 1 + (m.mul - 1) * eVal;
                if (typeof m.add === "number") result += m.add * eVal;
            }
        }
        return result;
    }

    // ### Welt-Lebendigkeit ###
    // a) Tag-Nacht-Zyklus (state.timeOfDay 0..1, Lights + Skybox folgen) · b) Wetter-Übergänge (Skybox
    // + Symphonie cross-faden 45 s) · c) Fauna-Lifecycle (Geburten < TARGET, Tod > MAX mit Trauer).

    // ### 6.G3.a — Tag-Nacht-Zyklus ###
}
