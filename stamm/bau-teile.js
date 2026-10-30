class AnazhRealm_bau_teile {
    // ===== ATLAS · Bau/teile — Teil-Geometrie · Varianten-Bauer · Affordanz · Validierung =====
    // ### Welle 2 B/C — Bauplan-Validierung + Schöpfungs-Pfad ###
    // Whitelist für erlaubte Shapes. blueprint ist neu (fraktale Referenz).
    // Was hier nicht steht, wird abgelehnt — kein arbitrary geometry-Import.

    validateBlueprintParts(parts) {
        const allowed = new Set([
            "box",
            "sphere",
            "cylinder",
            "cone",
            "pyramid",
            "octahedron",
            "plane",
            "torus",
            "helix",
            "limb",
            "crystalPoint",
            "latheProfile",
            "plateShell",
            "spokeWheel",
            "pickHead",
            "flutedColumn",
            "bladeProfile",
            "gableTriangle",
            "blueprint",
        ]);
        if (!Array.isArray(parts) || parts.length === 0) return { ok: false, reason: "no_parts" };
        if (parts.length > 32) return { ok: false, reason: "too_many_parts" };
        const clean = [];
        for (const p of parts) {
            if (!p || typeof p !== "object" || typeof p.shape !== "string") {
                return { ok: false, reason: "part_missing_shape" };
            }
            if (!allowed.has(p.shape)) return { ok: false, reason: `shape_not_allowed:${p.shape}` };
            const sanitized = { shape: p.shape };
            if (p.shape === "blueprint") {
                if (typeof p.refName !== "string" || !p.refName.match(/^[a-z0-9_-]{1,40}$/i)) {
                    return { ok: false, reason: "invalid_refName" };
                }
                // Selbst-Referenz verbieten (würde nach Cycle-Check eh nichts
                // tun, aber explizit ablehnen ist klarer).
                sanitized.refName = p.refName;
            }
            if (typeof p.color === "number") sanitized.color = p.color | 0;
            if (Number.isFinite(p.opacity) && p.opacity > 0 && p.opacity <= 1) sanitized.opacity = p.opacity;
            // Welle 4 Phase 1 — Material-Referenz. Muss auf eine registrierte
            // Material-Definition zeigen; unbekannter Name fällt still auf
            // den Default „stein" zurück (statt den ganzen Bauplan abzulehnen).
            if (typeof p.material === "string") {
                const matName = p.material.replace(/[^a-z0-9_-]/gi, "").slice(0, 40);
                if (matName && this.state.materials && this.state.materials[matName]) {
                    sanitized.material = matName;
                }
            }
            // Welle 4 Phase 3 — opChain validieren. Nur bekannte Tools, Cap
            // ge-clamp 0..1, „at" ge-clamp ≥0. Cap 32 Ops pro Part, damit
            // ein bösartiger Snapshot keine Riesen-Historie schiebt.
            if (Array.isArray(p.opChain)) {
                const cleanOps = [];
                for (const op of p.opChain.slice(0, 32)) {
                    if (!op || typeof op !== "object") continue;
                    const tool = typeof op.tool === "string" ? op.tool.replace(/[^a-z0-9_-]/gi, "").slice(0, 40) : null;
                    const opName = typeof op.op === "string" ? op.op.replace(/[^a-z0-9_-]/gi, "").slice(0, 40) : null;
                    const cap = Number(op.cap);
                    if (!Number.isFinite(cap)) continue;
                    cleanOps.push({
                        tool: tool || "hände",
                        op: opName || "hand_knap",
                        cap: Math.max(0, Math.min(1, cap)),
                        at: Number.isFinite(op.at) ? Math.max(0, op.at) : 0,
                    });
                }
                if (cleanOps.length > 0) sanitized.opChain = cleanOps;
            }
            const clampVec = (v) => {
                if (!v || typeof v !== "object") return null;
                const out = {};
                ["x", "y", "z"].forEach((k) => {
                    const n = Number(v[k]);
                    if (Number.isFinite(n)) out[k] = Math.max(-50, Math.min(50, n));
                });
                return Object.keys(out).length > 0 ? out : null;
            };
            const pos = clampVec(p.position);
            const rot = clampVec(p.rotation);
            const size = clampVec(p.size);
            if (pos) sanitized.position = pos;
            if (rot) sanitized.rotation = rot;
            if (size) sanitized.size = size;
            if (typeof p.scale === "number" && p.scale > 0 && p.scale <= 5) sanitized.scale = p.scale;
            if (p.animate === "water_wave") sanitized.animate = "water_wave";
            // Ω-B1 (wahrerbauplan §6) — die flutedColumn-Grammatik-Felder bewahren (geklemmt),
            // damit die Werkstatt/DSL eine klassische Säule mit Entasis + Kanneluren bauen kann.
            if (p.shape === "flutedColumn") {
                if (Number.isFinite(p.flutes)) sanitized.flutes = Math.max(0, Math.min(40, p.flutes | 0));
                if (Number.isFinite(p.fluteDepth)) sanitized.fluteDepth = Math.max(0, Math.min(0.3, p.fluteDepth));
                if (Number.isFinite(p.entasis)) sanitized.entasis = Math.max(0, Math.min(0.3, p.entasis));
                if (Number.isFinite(p.heightSegments))
                    sanitized.heightSegments = Math.max(2, Math.min(20, p.heightSegments | 0));
                if (Number.isFinite(p.segments)) sanitized.segments = Math.max(6, Math.min(48, p.segments | 0));
            }
            // F4 (wahrerwuchs §11) — die crystalPoint-Grammatik-Felder (Prisma-Facetten +
            // Termination), damit Werkstatt/DSL einen echten Kristall bauen kann.
            if (p.shape === "crystalPoint") {
                if (Number.isFinite(p.facets)) sanitized.facets = Math.max(3, Math.min(12, p.facets | 0));
                if (Number.isFinite(p.termFrac)) sanitized.termFrac = Math.max(0.05, Math.min(0.9, p.termFrac));
            }
            // F2/F5 (wahrerwuchs §11) — die Detail-Grammatik-Felder (Gefäß-Profil · Platten-
            // Wölbung · Speichen-Zahl · Pickel-Krümmung), damit Werkstatt/DSL sie bauen kann.
            if (p.shape === "latheProfile" && Array.isArray(p.profile)) {
                const prof = p.profile
                    .slice(0, 24)
                    .filter((q) => Array.isArray(q) && q.length >= 2)
                    .map((q) => [Math.max(0, Math.min(1, +q[0] || 0)), Math.max(0, Math.min(1, +q[1] || 0))]);
                if (prof.length >= 2) sanitized.profile = prof;
            }
            if (p.shape === "plateShell" && Number.isFinite(p.wrap))
                sanitized.wrap = Math.max(0.4, Math.min(3.0, p.wrap));
            if (p.shape === "spokeWheel" && Number.isFinite(p.spokes))
                sanitized.spokes = Math.max(4, Math.min(16, p.spokes | 0));
            if (p.shape === "pickHead" && Number.isFinite(p.curve))
                sanitized.curve = Math.max(0, Math.min(0.6, p.curve));
            // Ω-B2 (wahrerbauplan §6) — die bladeProfile-Grammatik-Felder (Oakeshott: distale
            // Verjüngung + Hohlkehle), damit die Werkstatt/DSL eine echte Klinge bauen kann.
            if (p.shape === "bladeProfile") {
                if (Number.isFinite(p.tipWidth)) sanitized.tipWidth = Math.max(0.04, Math.min(1, p.tipWidth));
                if (Number.isFinite(p.fuller)) sanitized.fuller = Math.max(0, Math.min(0.85, p.fuller));
                if (Number.isFinite(p.heightSegments))
                    sanitized.heightSegments = Math.max(6, Math.min(40, p.heightSegments | 0));
            }
            clean.push(sanitized);
        }
        return { ok: true, parts: clean };
    }

    createOrUpdateBlueprintFromDsl(name, parts) {
        if (typeof name !== "string" || name.length === 0 || name.length > 40) {
            return { ok: false, reason: "invalid_name", name };
        }
        const safe = name.replace(/[^a-z0-9_-]/gi, "").slice(0, 40);
        if (!safe) return { ok: false, reason: "invalid_name_after_sanitize", name };
        const existing = this.state.blueprints && this.state.blueprints[safe];
        if (existing && existing.builtIn) return { ok: false, reason: "cannot_overwrite_builtin", name: safe };
        // Cycle-Check: jeder blueprint-Part muss auf einen existierenden
        // Bauplan zeigen UND der neue Bauplan darf nicht (direkt/indirekt)
        // auf sich selbst zeigen.
        for (const p of parts) {
            if (p.shape === "blueprint") {
                if (p.refName === safe) return { ok: false, reason: "self_reference", name: safe };
                if (!this.state.blueprints[p.refName]) {
                    return { ok: false, reason: `ref_unknown:${p.refName}`, name: safe };
                }
            }
        }
        this.state.blueprints[safe] = {
            name: safe,
            label: safe,
            builtIn: false,
            parts,
        };
        // Werkstatt-Liste neu rendern, damit der neue Bauplan sofort sichtbar
        // wird. Idempotent — bei undefiniertem DOM no-op.
        if (typeof this._renderWorkshopDOM === "function") this._renderWorkshopDOM();
        return { ok: true, name: safe };
    }

    // Helfer für die DSL-Sandbox-Checks in define_ability.
    dslEstimateDepth(program) {
        if (!Array.isArray(program)) return 0;
        let max = 1;
        for (let i = 1; i < program.length; i++) {
            const child = program[i];
            if (Array.isArray(child)) {
                const d = 1 + this.dslEstimateDepth(child);
                if (d > max) max = d;
            }
        }
        return max;
    }

    dslContainsOp(program, opName) {
        if (!Array.isArray(program)) return false;
        if (program[0] === opName) return true;
        for (let i = 1; i < program.length; i++) {
            if (this.dslContainsOp(program[i], opName)) return true;
        }
        return false;
    }

    // === Compound-Tag-Affordances ===
    // Welt-Lese-Funktion: Tag+Form-Signatur eines Bauplans → Verhaltens-Flags. Keine Tabelle, kein
    // Bauplan-Namen-Lookup — Compound × räumliche Konfiguration entscheidet.

    // Liefert {moveable?, magnifying?, focusing?, ...}; beim Spawn als entry.affordances gespeichert.
    // Welt-Reaktionen konsultieren dieses Profil statt einer hardcoded Bauplan-Liste.
    // DIE TAGS EINMAL JE URTEIL (B3c): `tags` (optional) sind die Compound-Tags dieses Bauplans (`computeCompoundTags`), vom
    // Aufrufer EINMAL gerechnet und an jeden Tester gereicht — bis B3c rechnete jeder Tester sie neu und die Stärke das ganze
    // Urteil noch einmal (je Spawn bis zu 12×, ein Baum 8–10×; Urteil und Stärke zusammen vor dem ersten Weltbild
    // 0,64 s im Haupt-Faden, davon der Wald 0,63 s — Radeon kalt, je Probe einmal gezählt).
    computeBlueprintAffordances(bp, tags) {
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length === 0) return {};
        // Ein Portal IST ein Tor: einzige Affordance "betreten". Die Rolle schließt räumliche Affordances
        // aus — sonst träfe der welt_portal-Ring zufällig _isMoveable und klebte per Mount am Spieler.
        if (bp.role === "portal") return { isPortal: true };
        const t = tags || this.computeCompoundTags(bp);
        const out = {};
        if (this._isMoveable(bp, t)) out.moveable = true;
        if (this._isMagnifying(bp, t)) out.magnifying = true;
        if (this._isFocusing(bp, t)) out.focusing = true;
        if (this._isRadiating(bp, t)) out.radiating = true;
        if (this._isBroadcasting(bp, t)) out.broadcasting = true;
        if (this._isBalancing(bp, t)) out.balancing = true;
        if (this._isLifting(bp, t)) out.lifting = true;
        if (this._isSittable(bp)) out.sitzbar = true;
        return out;
    }

    // STÄRKE einer Affordance (0.2..1.0): der Schwellwert in computeBlueprintAffordances ist das Gate,
    // die Stärke skaliert darüber mit der Substanz — Tag-Überschuss (0.4..1.0) × Qualität (0.5..1.0).
    // Leser: _tickRadiatingAffordances + das broadcasting-Relais; eingefroren als
    // entry.affordanceStrength.
    // `aff` und `t` (optional): das Urteil und die Tags, die der Aufrufer schon hält (`spawnArchitecture`).
    computeAffordanceStrength(bp, aff, t) {
        if (!aff) aff = this.computeBlueprintAffordances(bp, t);
        const out = {};
        const keys = Object.keys(aff);
        if (keys.length === 0) return out;
        const tags = t || this.computeCompoundTags(bp) || {};
        const quality = Math.max(0, Math.min(1, this.computeBlueprintQuality(bp)));
        const precF = 0.5 + 0.5 * quality; // §6.3 — min-Faktor 0.5
        const clamp01 = (v) => Math.max(0, Math.min(1, v));
        // Wie weit ein Tag seinen Schwellwert übersteigt → 0.4..1.0.
        const overScale = (val, min) => 0.4 + 0.6 * clamp01((val - min) / (3 - min));
        if (aff.radiating) {
            const T = AnazhRealm.AFFORDANCE_THRESHOLDS.radiating;
            out.radiating = clamp01(overScale(tags.resoniert || 0, T.resoniertMin) * precF);
        }
        if (aff.broadcasting) {
            const T = AnazhRealm.AFFORDANCE_THRESHOLDS.broadcasting;
            const leit = Math.max(tags.stromleitung || 0, tags.magieleitung || 0);
            out.broadcasting = clamp01(overScale(leit, T.leitfaehigMin) * precF);
        }
        if (aff.balancing) {
            const T = AnazhRealm.AFFORDANCE_THRESHOLDS.balancing;
            out.balancing = clamp01(overScale(tags.dichte || 0, T.dichteMin) * precF);
        }
        if (aff.lifting) {
            const T = AnazhRealm.AFFORDANCE_THRESHOLDS.lifting;
            out.lifting = clamp01(overScale(tags.magieleitung || 0, T.magieMin) * precF);
        }
        return out;
    }

    // ----- Räumliche Helper (Form-agnostisch) -----

    // Compound-BBox aus Parts-Positionen. Liefert {min:{x,y,z}, max:{x,y,z}}.
    // Vision-relevant: alle „unten/oben/Achse"-Fragen werden RELATIV zur
    // bbox beantwortet, nicht via absolute Y-Werte.
    _compoundBBox(bp) {
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length === 0) return null;
        const min = { x: Infinity, y: Infinity, z: Infinity };
        const max = { x: -Infinity, y: -Infinity, z: -Infinity };
        for (const p of bp.parts) {
            const pos = p.position || { x: 0, y: 0, z: 0 };
            if (pos.x < min.x) min.x = pos.x;
            if (pos.y < min.y) min.y = pos.y;
            if (pos.z < min.z) min.z = pos.z;
            if (pos.x > max.x) max.x = pos.x;
            if (pos.y > max.y) max.y = pos.y;
            if (pos.z > max.z) max.z = pos.z;
        }
        return { min, max };
    }

    // Parts in der unteren Hälfte der Compound-bbox (relativ zur Bauplan-Geometrie, nicht zur Welt) —
    // keine absolute Y-Schwelle.
    _partsBelowMidline(bp, factor) {
        const bbox = this._compoundBBox(bp);
        if (!bbox) return [];
        const f = typeof factor === "number" ? factor : 0.5;
        const cutoff = bbox.min.y + (bbox.max.y - bbox.min.y) * f;
        return bp.parts.filter((p) => {
            const y = (p.position && p.position.y) || 0;
            return y <= cutoff;
        });
    }

    // Axiale Ausrichtung: {axis: "x"|"y"|"z", alignmentRatio: 0..1, count: N} — wie viele Parts liegen
    // entlang einer dominanten Achse (Teleskop = Parts auf einer Linie, egal welche Shapes).
    _axialAlignment(bp) {
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length < 2) {
            return { axis: null, alignmentRatio: 0, count: 0 };
        }
        const bbox = this._compoundBBox(bp);
        const span = {
            x: bbox.max.x - bbox.min.x,
            y: bbox.max.y - bbox.min.y,
            z: bbox.max.z - bbox.min.z,
        };
        // Dominante Achse = jene mit größter Spannweite
        let dominantAxis = "x";
        if (span.y > span.x && span.y > span.z) dominantAxis = "y";
        else if (span.z > span.x && span.z > span.y) dominantAxis = "z";
        // „Auf der Achse" = Abweichung in den beiden ANDEREN Achsen ≤ 25 % der jeweiligen Spannweite
        // (min. 0.2 absolut für sehr kleine Compounds).
        const otherAxes = ["x", "y", "z"].filter((a) => a !== dominantAxis);
        const centers = {};
        for (const a of otherAxes) centers[a] = (bbox.min[a] + bbox.max[a]) / 2;
        const tolerances = {};
        for (const a of otherAxes) tolerances[a] = Math.max(0.2, span[a] * 0.25);
        let onAxis = 0;
        for (const p of bp.parts) {
            const pos = p.position || { x: 0, y: 0, z: 0 };
            let aligned = true;
            for (const a of otherAxes) {
                if (Math.abs(pos[a] - centers[a]) > tolerances[a]) {
                    aligned = false;
                    break;
                }
            }
            if (aligned) onAxis++;
        }
        return {
            axis: dominantAxis,
            alignmentRatio: onAxis / bp.parts.length,
            count: onAxis,
        };
    }

    // ----- Affordance-Tester (Form-agnostisch, Tag-Sprache + räumlich) -----

    // moveable (Fahrzeug-Signatur), keine Form-Whitelist:
    // 1. ≥2 Stütz-Parts in der unteren bbox-Hälfte, 2. die SPREIZEN horizontal (keine vertikale Säule —
    // sonst läse ein hoher Baum mit magieleitendem Laub als Reittier), 3. dichte über Schwelle,
    // 4. Antrieb: magieleitung ODER stromleitung über Schwelle.
    _isMoveable(bp, t) {
        // Ein GEWACHSENER Baum/Busch (_grownSpecies) ist verwurzelt, nie Fahrzeug: gesetz-wahre Kronen
        // spreizen die tiefen Äste über die supportSpreadMin-Schwelle (0.35), die Heuristik allein reicht
        // nicht. Der Marker ist die definitive Wahrheit (Fahrzeuge tragen ihn nie).
        if (bp && bp._grownSpecies) return false;
        const T = AnazhRealm.AFFORDANCE_THRESHOLDS.moveable;
        const support = this._partsBelowMidline(bp, T.midlineFactor);
        if (support.length < T.minSupportParts) return false;
        // Horizontale Spreizung der Stütz-Parts: die quer-Ausdehnung (x/z) ihrer
        // Mittelpunkte relativ zur Compound-Breite. Eine Säule (Stamm-Stapel)
        // hat ~0 Spreizung; eine Trag-Basis (Räder/Beine) spreizt sich.
        const bbox = this._compoundBBox(bp);
        if (bbox) {
            let sMinX = Infinity,
                sMaxX = -Infinity,
                sMinZ = Infinity,
                sMaxZ = -Infinity;
            for (const p of support) {
                const pos = p.position || { x: 0, y: 0, z: 0 };
                const px = pos.x || 0;
                const pz = pos.z || 0;
                if (px < sMinX) sMinX = px;
                if (px > sMaxX) sMaxX = px;
                if (pz < sMinZ) sMinZ = pz;
                if (pz > sMaxZ) sMaxZ = pz;
            }
            const compW = Math.max(bbox.max.x - bbox.min.x, bbox.max.z - bbox.min.z, 0.001);
            const spread = Math.max(sMaxX - sMinX, sMaxZ - sMinZ) / compW;
            if (spread < T.supportSpreadMin) return false; // schmale Säule (Baum) → kein Fahrzeug
        }
        const tags = t || this.computeCompoundTags(bp) || {};
        if ((tags.dichte || 0) < T.dichteMin) return false;
        const antrieb = Math.max(tags.magieleitung || 0, tags.stromleitung || 0);
        return antrieb >= T.antriebTagMin;
    }

    // magnifying (Teleskop-Signatur), keine Form-Whitelist: transparent über Schwelle, ≥60 % der Parts
    // auf einer Achse, mindestens 2 Parts darauf.
    _isMagnifying(bp, t) {
        const T = AnazhRealm.AFFORDANCE_THRESHOLDS.magnifying;
        const tags = t || this.computeCompoundTags(bp) || {};
        if ((tags.transparent || 0) < T.transparentMin) return false;
        const align = this._axialAlignment(bp);
        return align.alignmentRatio >= T.axialAlignmentMin && align.count >= T.minAxialParts;
    }

    // focusing — brennfähiges Compound (Brennglas-Signatur).
    // Reine Tag-Sprache: transparent + wärmeleitung. Form irrelevant —
    // jede Geometrie die diese Tag-Kombination trägt kann Licht bündeln.
    _isFocusing(bp, t) {
        const T = AnazhRealm.AFFORDANCE_THRESHOLDS.focusing;
        const tags = t || this.computeCompoundTags(bp) || {};
        return (tags.transparent || 0) >= T.transparentMin && (tags.wärmeleitung || 0) >= T.wärmeMin;
    }

    // radiating, keine Form-Whitelist: resoniert über Schwelle · radiale Spreizung (alignmentRatio unter
    // radialMax — eine Linie strahlt gerichtet) · ≥ minParts. Hoher resoniert speist zugleich die
    // Symphonie (_lofiNearResonantArchitecture) ohne Extra-Code.
    _isRadiating(bp, t) {
        const T = AnazhRealm.AFFORDANCE_THRESHOLDS.radiating;
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length < T.minParts) return false;
        const tags = t || this.computeCompoundTags(bp) || {};
        if ((tags.resoniert || 0) < T.resoniertMin) return false;
        const align = this._axialAlignment(bp);
        return align.alignmentRatio < T.radialMax;
    }

    // broadcasting (Relais-Mast), keine Form-Whitelist: axis "y" + alignmentRatio ≥ alignMin ·
    // stromleitung ODER magieleitung über Schwelle · ≥ minParts. Kein eigener Tick: der Mast VERSTÄRKT
    // die Reichweite eines nahen radiating-Strahlers (siehe _tickRadiatingAffordances).
    _isBroadcasting(bp, t) {
        const T = AnazhRealm.AFFORDANCE_THRESHOLDS.broadcasting;
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length < T.minParts) return false;
        const align = this._axialAlignment(bp);
        if (align.axis !== "y" || align.alignmentRatio < T.alignMin) return false;
        const tags = t || this.computeCompoundTags(bp) || {};
        const leit = Math.max(tags.stromleitung || 0, tags.magieleitung || 0);
        return leit >= T.leitfaehigMin;
    }

    // balancing (gründet den Ort), keine Form-Whitelist: horizontale Spannweite ≥ vertikale ·
    // ≥ bottomHeavyMin der Parts in der unteren bbox-Hälfte · dichte ≥ dichteMin (1.5) · ≥ minParts.
    _isBalancing(bp, t) {
        const T = AnazhRealm.AFFORDANCE_THRESHOLDS.balancing;
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length < T.minParts) return false;
        const bbox = this._compoundBBox(bp);
        if (!bbox) return false;
        const spanY = bbox.max.y - bbox.min.y;
        const spanXZ = Math.max(bbox.max.x - bbox.min.x, bbox.max.z - bbox.min.z);
        if (spanXZ < spanY * T.wideMin) return false; // breiter als hoch
        const below = this._partsBelowMidline(bp, 0.5).length;
        if (below / bp.parts.length < T.bottomHeavyMin) return false;
        const tags = t || this.computeCompoundTags(bp) || {};
        return (tags.dichte || 0) >= T.dichteMin;
    }

    // lifting (Auftriebs-Bereich), keine Form-Whitelist: magieleitung ≥ magieMin (1.5) ·
    // dichte ≤ dichteMax (1.0, das Komplement zu balancing) · ≥ minParts. Magie trägt kein Gewicht.
    _isLifting(bp, t) {
        const T = AnazhRealm.AFFORDANCE_THRESHOLDS.lifting;
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length < T.minParts) return false;
        const tags = t || this.computeCompoundTags(bp) || {};
        if ((tags.magieleitung || 0) < T.magieMin) return false;
        return (tags.dichte || 0) <= T.dichteMax;
    }

    // sitzbar (das Sitz-Gesetz, bauen.K5), keine Form-Whitelist: der Sitz des Bauplans (`_attachPointFor` „sitz" — derselbe,
    // auf dem der Leib sitzt, `_sitzOrt`) liegt auf Sitzhöhe über dem Fuß des Werks, ist tief genug für ein Gesäß und steht auf
    // ≥ 2 Stützen vom Boden bis unter ihn; das ganze Werk bleibt möbelhoch (ein Haus mit Sockel, ein Podest sind kein Sitz).
    // Die Bank des Zimmermanns wie ein Hocker aus Grundformen: wer an ihm E drückt, sitzt (`toggleMountAtPlayer`).
    _isSittable(bp) {
        const T = AnazhRealm.AFFORDANCE_THRESHOLDS.sitzbar;
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length < T.minParts) return false;
        const sitz = this._attachPointFor(bp, "sitz");
        if (sitz.part === null) return false;
        const spanne = (p) => {
            const y = (p.position && p.position.y) || 0;
            const h = Math.abs((p.size && p.size.y) || 0.3) / 2;
            return [y - h, y + h];
        };
        let fuss = Infinity;
        let kopf = -Infinity;
        for (const p of bp.parts) {
            const [y0, y1] = spanne(p);
            fuss = Math.min(fuss, y0);
            kopf = Math.max(kopf, y1);
        }
        const hoehe = sitz.point.y - fuss;
        const s = bp.parts[sitz.part].size || {};
        if (hoehe < T.hoeheMin || hoehe > T.hoeheMax || kopf - fuss > T.moebelMax) return false;
        if (Math.min(Math.abs(s.x || 0), Math.abs(s.z || 0)) < T.tiefeMin) return false;
        let stuetzen = 0;
        for (let i = 0; i < bp.parts.length; i++) {
            const [y0, y1] = spanne(bp.parts[i]);
            if (i !== sitz.part && y0 <= fuss + T.bodenTol && y1 >= sitz.point.y - T.stuetzSpalt) stuetzen++;
        }
        return stuetzen >= T.minStuetzen;
    }

    // ----- Welle 11 ext. — intrinsische Substanz-Signale für die Rolle -----

    // Bilaterale Symmetrie: {ratio, limbPairs}. ratio = Anteil Parts mit Spiegel-Partner (auf der
    // Mittelachse ist ein Part sein eigener Spiegel); limbPairs = Off-Achsen-Spiegel-Paare (= Glieder).
    // Ein Turm hat ratio 1.0, aber 0 limbPairs.
    _compoundSymmetry(bp) {
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length < 2) return { ratio: 0, limbPairs: 0 };
        const bbox = this._compoundBBox(bp);
        const T = AnazhRealm.SUBSTANCE_ROLE_THRESHOLDS.body;
        const centerX = (bbox.min.x + bbox.max.x) / 2;
        const spanX = bbox.max.x - bbox.min.x;
        const spanY = bbox.max.y - bbox.min.y;
        const spanZ = bbox.max.z - bbox.min.z;
        const tol = Math.max(0.25, Math.max(spanX, spanY, spanZ) * T.mirrorTol);
        const offAxisCut = Math.max(0.2, spanX * T.offAxisMin);
        const parts = bp.parts;
        const usedAsPartner = new Set();
        let matched = 0;
        let limbPairs = 0;
        for (let i = 0; i < parts.length; i++) {
            const p = parts[i].position || { x: 0, y: 0, z: 0 };
            const offAxis = Math.abs(p.x - centerX) > offAxisCut;
            const mx = 2 * centerX - p.x; // gespiegelte x-Position
            // Best-match statt first-match: sonst spiegelt ein Arm nahe am Torso auf den TORSO statt auf den
            // Partner-Arm → limbPairs=0. `found` bleibt identisch, nur die Paar-Zuordnung wird ehrlich.
            let found = false;
            let bestJ = -1;
            let bestD = Infinity;
            for (let j = 0; j < parts.length; j++) {
                if (j === i) continue;
                const q = parts[j].position || { x: 0, y: 0, z: 0 };
                const dx = Math.abs(q.x - mx);
                const dy = Math.abs(q.y - p.y);
                const dz = Math.abs(q.z - p.z);
                if (dx <= tol && dy <= tol && dz <= tol) {
                    found = true;
                    const d = dx + dy + dz;
                    if (d < bestD) {
                        bestD = d;
                        bestJ = j;
                    }
                }
            }
            // …und ein GLIED ist GESTRECKT (längste ≥ 2× kürzeste Achse): gespiegelte BLOBS (Kronen-Kugeln ±x
            // am Stamm) sind keine Glieder — sonst macht best-match die Eiche zur Seele.
            const sI = parts[i].size || {};
            const ax = [Math.abs(sI.x || 0.3), Math.abs(sI.y || 0.3), Math.abs(sI.z || 0.3)].sort((u, w) => w - u);
            const limbish = ax[0] / Math.max(0.05, ax[2]) >= 2;
            if (found && offAxis && limbish && i < bestJ && !usedAsPartner.has(bestJ)) {
                limbPairs++;
                usedAsPartner.add(bestJ);
            }
            // Ein Part auf der Mittelachse ist sein eigener Spiegel.
            if (!found && !offAxis) found = true;
            if (found) matched++;
        }
        return { ratio: matched / parts.length, limbPairs };
    }

    // body (Seelen-Signatur): bilateral symmetrisch mit Glieder-Paaren + mehrteilig. Räumliche
    // Konfiguration entscheidet, keine Form-Whitelist.
    _isBodyShaped(bp) {
        if (!bp || !Array.isArray(bp.parts)) return false;
        const T = AnazhRealm.SUBSTANCE_ROLE_THRESHOLDS.body;
        if (bp.parts.length < T.minParts) return false;
        // Vertikalität: ein Körper "steht" — die Y-Ausdehnung ist ein
        // spürbarer Anteil der horizontalen. Ein flaches, breit gestreutes
        // Dorf fällt hier raus, obwohl es bilateral symmetrisch ist.
        const bbox = this._compoundBBox(bp);
        const spanY = bbox.max.y - bbox.min.y;
        const horiz = Math.max(bbox.max.x - bbox.min.x, bbox.max.z - bbox.min.z);
        if (spanY < horiz * T.verticalMin) return false;
        // Ein Körper trägt LEBENDIGE Masse in der Mitte: das lebendig-gewichtete Volumen muss eine
        // Minimal-Masse erreichen UND sein Schwerpunkt in der Y-Mitte liegen — sonst wäre ein Stein-Tempel
        // mit symmetrischen Säulen ein Körper. (Die Asymmetrie-Wand fängt dagegen Baum-Profile.)
        if (Number.isFinite(T.livingMassMin) && Number.isFinite(T.livingCenterMinY)) {
            let liveMass = 0;
            let liveMassY = 0;
            for (const part of bp.parts) {
                if (!part || !part.material) continue;
                const mat = this.state && this.state.materials ? this.state.materials[part.material] : null;
                const lebendig = mat && mat.tags ? +mat.tags.lebendig || 0 : 0;
                if (lebendig <= 0) continue;
                // Volumen-Surrogat über die Größe (size.x*y*z; fallback 1).
                const sx = part.size && Number.isFinite(part.size.x) ? part.size.x : 1;
                const sy = part.size && Number.isFinite(part.size.y) ? part.size.y : 1;
                const sz = part.size && Number.isFinite(part.size.z) ? part.size.z : 1;
                const vol = Math.max(0, sx * sy * sz);
                const py = part.position && Number.isFinite(part.position.y) ? part.position.y : 0;
                liveMass += vol * lebendig;
                liveMassY += vol * lebendig * py;
            }
            if (liveMass < T.livingMassMin) return false;
            // Normalisiere auf [0,1] relativ zur bbox-Y-Spanne.
            const liveCenterY = liveMassY / liveMass;
            const yNorm = spanY > 1e-6 ? (liveCenterY - bbox.min.y) / spanY : 0.5;
            if (yNorm < T.livingCenterMinY || yNorm > T.livingCenterMaxY) return false;
        }
        const sym = this._compoundSymmetry(bp);
        return sym.ratio >= T.symmetryMin && sym.limbPairs >= T.minLimbPairs;
    }

    // food — Nahrungs-Signatur: lebendig + weich. Reine Tag-Sprache aus den
    // bestehenden 10 Tags (kein 11. Tag — Heilige Lektion). Ein Fleisch- oder
    // Frucht-Compound ist essbar, ein Holz- oder Stein-Compound nicht.
    _isFoodLike(bp) {
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length === 0) return false;
        const T = AnazhRealm.SUBSTANCE_ROLE_THRESHOLDS.food;
        const tags = this.computeCompoundTags(bp) || {};
        return (tags.lebendig || 0) >= T.lebendigMin && (tags.härte || 0) <= T.härteMax;
    }

    // portal (Tor-Signatur) aus zwei Signalen: FORM — ein Torus (die einzige Ring-Form mit Öffnung),
    // groß genug zum Durchschreiten; MATERIAL — hohe magieleitung (Quarz-Ring ja, Stein/Eisen nein).
    // Das Ziel emergiert NICHT, es ist autorierte portalMeta (setBlueprintAsPortal).
    // Die Durchgangs-Schwelle emergiert aus der Ausdehnung des aktuellen Avatars (Soul-bodyParts).
    _avatarPassageSize() {
        const soulName = (this.state.player && this.state.player.soul) || "human";
        let parts = null;
        const def = this.playerSoulDefs && this.playerSoulDefs[soulName];
        if (def && Array.isArray(def.bodyParts)) parts = def.bodyParts;
        if (!parts) {
            const custom = this.state.customSouls && this.state.customSouls[soulName];
            if (custom && Array.isArray(custom.bodyParts)) parts = custom.bodyParts;
        }
        if (!parts || !parts.length) return 1.7; // Fallback — Menschen-Höhe
        const lo = { x: Infinity, y: Infinity, z: Infinity };
        const hi = { x: -Infinity, y: -Infinity, z: -Infinity };
        for (const p of parts) {
            const pos = p.position || { x: 0, y: 0, z: 0 };
            const sz = p.size || { x: 1, y: 1, z: 1 };
            for (const ax of ["x", "y", "z"]) {
                const c = pos[ax] || 0;
                const h = (sz[ax] || 1) / 2;
                if (c - h < lo[ax]) lo[ax] = c - h;
                if (c + h > hi[ax]) hi[ax] = c + h;
            }
        }
        const span = Math.max(hi.x - lo.x, hi.y - lo.y, hi.z - lo.z);
        return Number.isFinite(span) && span > 0.5 ? span : 1.7;
    }

    _isPortalShaped(bp) {
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length === 0) return false;
        const T = AnazhRealm.SUBSTANCE_ROLE_THRESHOLDS.portal;
        // begehbar = der Ring ist groß genug, dass der Reisende hindurchpasst
        // — die Schwelle emergiert aus der Avatar-Größe, keine feste Zahl.
        const minRing = this._avatarPassageSize();
        const hasRing = bp.parts.some((p) => p.shape === "torus" && ((p.size && p.size.x) || 1) >= minRing);
        if (!hasRing) return false;
        const tags = this.computeCompoundTags(bp) || {};
        return (tags.magieleitung || 0) >= T.magieleitungMin;
    }

    // Resonanz-Kern: ein Produkt ist ein Vektor, jede Ablesung Σ tag[achse]·gewicht gegen eine
    // Rollen-/Domänen-Signatur (verallgemeinertes spawnAffinityForBlueprint). Gewichte dürfen NEGATIV
    // sein (Invers-Achsen: „weich" = niedrige härte). Liest den GANZEN Vektor, nie ein einzelnes Tag.
    _blueprintResonance(tags, signature) {
        if (!tags || !signature) return 0;
        let score = 0;
        for (const axis in signature) score += (tags[axis] || 0) * signature[axis];
        return score;
    }

    // Das EINE Argmax-Organ über Signaturen (Form-Rolle, Werkstatt-Domäne, Werkzeug-Op, Temperament …):
    // Resonanz gegen jede Signatur (_blueprintResonance), optional pro Key normalisiert (refs +
    // refDefault, raw/ref) und auf keys beschränkt. Gewinner nur STRIKT über floor, Iterations-Ordnung
    // der Tabelle (bit-gleich zu den früheren Inline-Stellen); sonst → { key: null, score: floor }.
    _resonateArgmax(vektor, tabelle, opts = {}) {
        const floor = opts.floor !== undefined ? opts.floor : -Infinity;
        const refs = opts.refs || null;
        const refDefault = Number.isFinite(opts.refDefault) ? opts.refDefault : 0;
        const keys = opts.keys || Object.keys(tabelle || {});
        let key = null;
        let score = floor;
        for (const k of keys) {
            const sig = tabelle[k];
            if (!sig) continue;
            let s = this._blueprintResonance(vektor, sig);
            if (refs || refDefault) s /= (refs && refs[k]) || refDefault || 1;
            if (s > score) {
                score = s;
                key = k;
            }
        }
        return { key, score };
    }

    // Werkstatt-Domäne = ARGMAX der Resonanz des vollen Tag-Vektors gegen WORKSHOP_DOMAIN_SIGNATURES
    // (an den 5 Built-ins gemessen); unter dem Floor → null (eine bloße Struktur ist keine Werkstatt).
    // Nur für Werkstatt-Strukturen — ob es eine ist, entscheidet die Rollen-Resonanz.
    _computeWorkshopDomain(bp) {
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length === 0) return null;
        const t = this.computeCompoundTags(bp) || {};
        // Ψ1 — das EINE argmax-Organ liest (bit-gleiche Verdichtung des Inline-Loops).
        return this._resonateArgmax(t, AnazhRealm.WORKSHOP_DOMAIN_SIGNATURES, {
            floor: AnazhRealm.WORKSHOP_DOMAIN_RESONANCE_FLOOR,
        }).key;
    }

    // ----- Welt-Reaktion: moveable (Spieler steigt ein, Compound folgt) -----

    // Findet die nächste Architektur mit gegebener Affordance im Radius.
    // Liefert null wenn nichts in Reichweite. Wird für die E-Taste (Mount)
    // und für andere Spieler-Gesten genutzt.
    // Gefragt wird die Nähe des Spielers (K54: der Portal-Takt fragt je Frame — nie den Bestand der Welt).
    _findNearestAffordanceEntry(affordanceKey, radiusM) {
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        if (!pm) return null;
        const r2 = radiusM * radiusM;
        let best = null;
        let bestD2 = r2;
        const nah = this._affordanzNah || (this._affordanzNah = []);
        nah.length = 0;
        this._blockerUmPlatz(pm.x, pm.z, radiusM + 1e-6, nah, affordanceKey);
        for (const entry of nah) {
            const dx = entry.position.x - pm.x;
            const dy = entry.position.y - pm.y;
            const dz = entry.position.z - pm.z;
            const d2 = dx * dx + dy * dy + dz * dz;
            if (d2 <= bestD2) {
                bestD2 = d2;
                best = entry;
            }
        }
        return best;
    }

    // ### Ring 6 – architectureTemplates V1 ###
    //
    // Drei DSL-Primitives, die je einen THREE.Group aus Three.js-Primitives
    // bauen: Dorf (Hütten + Lagerplatz), Tempel (Pfeiler + Dach + Altar),
    // Wasserfall (Vertex-animierte Wasser-Plane + Becken). Jede Struktur
    // bekommt einen Seed; Save persistiert nur {type, position, seed} und
    // der Mesh wird beim Laden aus dem Seed neu gebaut — keine Mesh-Daten
    // im JSON, kleine Save-Dateien.
    //
    // Strukturen sind global (nicht pro-Chunk parented). Sie überleben
    // Chunk-Prune und liegen in `state.architectures`. FIFO-Cap (30) gegen
    // Mesh-Spam wenn der Nexus mehrmals hintereinander baut.
    //
    // Pro-Frame-Animation (z. B. fließendes Wasser) läuft via
    // `tickArchitectures(t)` — jede Struktur darf eine `userData.animate`-
    // Funktion mitbringen, die der Tick aufruft. Statische Strukturen
    // (Hütten, Tempel) brauchen das nicht.

    // === Bauplan-Datenschicht ===
    // Ein Bauplan ist eine flache JSON-Liste von Primitiv-Parts, _buildFromBlueprint rendert sie zur
    // THREE.Group: { name, label, builtIn, parts: [...] }. Part = { shape, color: 0xRRGGBB, position,
    // rotation? (Radiant), size (je Primitiv interpretiert), opacity? (< 1 = transparent),
    // animate? (Marker für tickArchitectures, z. B. "water_wave") }.

    _makePartGeometry(part) {
        const sx = (part.size && part.size.x) || 1;
        const sy = (part.size && part.size.y) || sx;
        const sz = (part.size && part.size.z) || sx;
        const segments = part.segments || 12;
        switch (part.shape) {
            case "sphere":
                return new THREE.SphereGeometry(sx / 2, segments, Math.max(4, Math.floor(segments * 0.6)));
            case "cylinder":
                return new THREE.CylinderGeometry(sx / 2, sz / 2, sy, segments);
            case "cone":
                return new THREE.ConeGeometry(sx / 2, sy, segments);
            case "pyramid":
                // Vier-seitige Pyramide = Kegel mit 4 Segmenten
                return new THREE.ConeGeometry(sx / 2, sy, 4);
            case "octahedron":
                return new THREE.OctahedronGeometry(sx / 2, 0);
            case "plane":
                // Plane: optional segmentiert für Vertex-Animation. Default
                // 1×1, für animate="water_wave" lieber 6×18.
                if (part.animate === "water_wave") {
                    return new THREE.PlaneGeometry(sx, sy, 6, 18);
                }
                return new THREE.PlaneGeometry(sx, sy);
            case "torus":
                return new THREE.TorusGeometry(sx / 2, Math.max(0.05, sx / 6), 8, segments);
            case "helix": {
                // Helix als TubeGeometry über eine parametrische Kurve: size.x = Wendel-Durchmesser, size.y =
                // Gesamt-Länge, size.z = Windungen; Tube-Radius ∝ sx/12, mindestens 0.05.
                const helixRadius = Math.max(0.05, sx / 2);
                const helixLength = Math.max(0.1, sy);
                const turns = Math.max(0.5, Math.min(20, sz || 3));
                const tubeRadius = Math.max(0.05, sx / 12);
                const curve = new THREE.Curve();
                curve.getPoint = function (t, optionalTarget) {
                    const target = optionalTarget || new THREE.Vector3();
                    const angle = t * turns * Math.PI * 2;
                    return target.set(
                        Math.cos(angle) * helixRadius,
                        (t - 0.5) * helixLength,
                        Math.sin(angle) * helixRadius
                    );
                };
                const tubularSegments = Math.max(20, Math.floor(turns * 16));
                return new THREE.TubeGeometry(curve, tubularSegments, tubeRadius, 6, false);
            }
            case "limb": {
                // Glied/Knochen als verjüngte KAPSEL aus EINER Lathe-Geometrie: untere Halbkugel (rb) → konischer
                // Schaft → obere Halbkugel (rt). size.x = unterer ⌀, size.y = Länge, size.z = oberer ⌀
                // (dick an der Hüfte, schmal am Knöchel).
                const rb = Math.max(0.005, sx / 2);
                const rt = Math.max(0.005, sz / 2);
                const L = Math.max(0.04, sy);
                const capB = Math.min(rb, L * 0.48);
                const capT = Math.min(rt, L * 0.48);
                const yBot = -L / 2,
                    yTop = L / 2;
                const NB = 5;
                const pts = [];
                for (let i = 0; i <= NB; i++) {
                    const a = (i / NB) * (Math.PI / 2);
                    pts.push(new THREE.Vector2(Math.sin(a) * rb, yBot + capB - Math.cos(a) * capB));
                }
                pts.push(new THREE.Vector2(rt, yTop - capT)); // Schaft-Verjüngung
                for (let i = 1; i <= NB; i++) {
                    const a = (i / NB) * (Math.PI / 2);
                    pts.push(new THREE.Vector2(Math.cos(a) * rt, yTop - capT + Math.sin(a) * capT));
                }
                return new THREE.LatheGeometry(pts, Math.max(6, Math.min(20, segments)));
            }
            case "crystalPoint": {
                // Quarz-Kristall = n-seitiges PRISMA mit pyramidaler Termination, nie eine Kugel; EINE Geometrie,
                // deterministisch. size.x/z = Prisma-⌀ (darf elliptisch sein), size.y = Länge;
                // part.facets = n (6 = Quarz), part.termFrac = Anteil der Spitze.
                const n = Math.max(3, Math.min(12, part.facets | 0 || 6));
                const rX = Math.max(0.01, sx / 2);
                const rZ = Math.max(0.01, sz / 2);
                const L = Math.max(0.05, sy);
                const termFrac = Number.isFinite(part.termFrac) ? Math.max(0.05, Math.min(0.9, part.termFrac)) : 0.32;
                // Prisma aus der geteilten Quelle (phyto-core `pushCrystal`): M-seitig + Schulter (Radius 0.9) +
                // Apex. Der shape-String bleibt EXAKT `crystalPoint` → Tags frozen. Ohne __phytoCore: Inline-Pfad.
                {
                    const core = typeof globalThis !== "undefined" && globalThis.__phytoCore;
                    if (core && typeof core.buildCrystalPointGeometry === "function") {
                        const g = core.buildCrystalPointGeometry(THREE, {
                            facets: n,
                            rX,
                            rZ,
                            length: L,
                            termFrac,
                        });
                        if (g) return g;
                    }
                }
                const yBot = -L / 2,
                    yTop = L / 2,
                    yShoulder = yTop - termFrac * L;
                const verts = [];
                const idx = [];
                // Ring 0 (Boden) + Ring 1 (Schulter), dann Apex + Boden-Zentrum.
                for (const yy of [yBot, yShoulder]) {
                    for (let i = 0; i < n; i++) {
                        const a = (i / n) * Math.PI * 2;
                        verts.push(Math.cos(a) * rX, yy, Math.sin(a) * rZ);
                    }
                }
                const apex = verts.length / 3;
                verts.push(0, yTop, 0);
                const botC = verts.length / 3;
                verts.push(0, yBot, 0);
                for (let i = 0; i < n; i++) {
                    const a = i,
                        b = (i + 1) % n,
                        a2 = n + i,
                        b2 = n + ((i + 1) % n);
                    idx.push(a, a2, b, b, a2, b2); // Prisma-Wand (Quad)
                    idx.push(apex, a2, b2); // Termination (Dreieck → Spitze)
                    idx.push(botC, b, i); // Boden-Kappe
                }
                const g = new THREE.BufferGeometry();
                g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
                g.setIndex(idx);
                g.computeVertexNormals();
                return g;
            }
            case "latheProfile": {
                // Lathe-Gefäß (Phiole · Vase · Urne · Goblet · Becken · Baluster): die Silhouette (Bauch · Schulter ·
                // Hals · Lippe) emergiert aus part.profile = [[radiusFrac, heightFrac], …] (0..1).
                // size.x = max ⌀, size.y = Höhe.
                const prof =
                    Array.isArray(part.profile) && part.profile.length >= 2
                        ? part.profile
                        : [
                              [0.5, 0],
                              [0.5, 1],
                          ];
                const rMax = Math.max(0.01, sx / 2);
                const H = Math.max(0.05, sy);
                const lpts = prof.map(
                    (p) => new THREE.Vector2(Math.max(0.0008, (p[0] || 0) * rMax), ((p[1] || 0) - 0.5) * H)
                );
                return new THREE.LatheGeometry(lpts, Math.max(8, Math.min(28, part.segments || 16)));
            }
            case "plateShell": {
                // Gewölbte Platte als Zylinder-Sektion (Brustplatte folgt dem Torso, Pauldron der Schulter, Fauld
                // als Lamelle). size.x = Sehne, size.y = Höhe, size.z = Wölbungs-Tiefe; part.wrap = Bogen (rad).
                const W = Math.max(0.05, sx);
                const Hs = Math.max(0.04, sy);
                const bulge = Math.max(0.02, sz);
                const wrap = Number.isFinite(part.wrap) ? Math.max(0.4, Math.min(3.0, part.wrap)) : 2.0;
                const R = W / 2 / Math.sin(wrap / 2);
                const th = Math.max(0.012, bulge * 0.35);
                const seg = Math.max(6, Math.min(28, part.segments || 12));
                const verts = [];
                const idx = [];
                // 4 Ringe: außen-unten, außen-oben, innen-unten, innen-oben (je seg+1 Punkte).
                const ring = (rad, top) => {
                    for (let i = 0; i <= seg; i++) {
                        const th2 = -wrap / 2 + (i / seg) * wrap;
                        verts.push(Math.sin(th2) * rad, top ? Hs / 2 : -Hs / 2, Math.cos(th2) * rad - (R - bulge));
                    }
                };
                ring(R, false);
                ring(R, true);
                ring(R - th, false);
                ring(R - th, true);
                const N = seg + 1;
                const OU = 0,
                    OO = N,
                    IU = 2 * N,
                    IO = 3 * N;
                for (let i = 0; i < seg; i++) {
                    // Außenfläche (sieht nach vorn) + Innenfläche (umgekehrt) + obere/untere Kante.
                    idx.push(OU + i, OO + i, OU + i + 1, OU + i + 1, OO + i, OO + i + 1);
                    idx.push(IU + i, IU + i + 1, IO + i, IU + i + 1, IO + i + 1, IO + i);
                    idx.push(OO + i, IO + i, OO + i + 1, OO + i + 1, IO + i, IO + i + 1); // Oberkante
                    idx.push(OU + i, OU + i + 1, IU + i, OU + i + 1, IU + i + 1, IU + i); // Unterkante
                }
                // die zwei seitlichen Kanten (Bogen-Enden) schließen.
                idx.push(OU, IU, OO, OO, IU, IO);
                idx.push(OU + seg, OO + seg, IU + seg, OO + seg, IO + seg, IU + seg);
                const g = new THREE.BufferGeometry();
                g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
                g.setIndex(idx);
                g.computeVertexNormals();
                return g;
            }
            case "spokeWheel": {
                // Speichen-Rad: Nabe + N radiale Speichen + Felgen-Ring statt voller Scheibe. Achse = lokal Y (wie
                // der ersetzte cylinder → dieselbe z-Rotation stellt es auf). size.x = size.z = ⌀, size.y = Breite;
                // part.spokes = N.
                const Rw = Math.max(0.05, sx / 2);
                const wid = Math.max(0.03, sy);
                const nsp = Math.max(4, Math.min(16, part.spokes | 0 || 8));
                const rimW = Rw * 0.16; // Felgen-Dicke
                const hubR = Rw * 0.2;
                const verts = [];
                const idx = [];
                const NS = 24; // Ring-Auflösung
                const pushRing = (rad, y) => {
                    const base = verts.length / 3;
                    for (let i = 0; i < NS; i++) {
                        const a = (i / NS) * Math.PI * 2;
                        verts.push(Math.cos(a) * rad, y, Math.sin(a) * rad);
                    }
                    return base;
                };
                // FELGE: ein rechteckiger Torus (außen Ro, innen Ri) über beide Breiten-Seiten.
                const Ro = Rw,
                    Ri = Rw - rimW;
                const roT = pushRing(Ro, wid / 2),
                    roB = pushRing(Ro, -wid / 2),
                    riT = pushRing(Ri, wid / 2),
                    riB = pushRing(Ri, -wid / 2);
                const band = (a, b) => {
                    for (let i = 0; i < NS; i++) {
                        const j = (i + 1) % NS;
                        idx.push(a + i, a + j, b + i, a + j, b + j, b + i);
                    }
                };
                band(roT, roB); // Außen-Lauffläche
                band(riB, riT); // Innen (umgekehrt)
                band(riT, roT); // Oberkante (Innen→Außen)
                band(roB, riB); // Unterkante
                // NABE: ein kleiner Zylinder in der Mitte.
                const huT = pushRing(hubR, wid / 2),
                    huB = pushRing(hubR, -wid / 2);
                band(huB, huT);
                const cT = verts.length / 3;
                verts.push(0, wid / 2, 0);
                const cB = verts.length / 3;
                verts.push(0, -wid / 2, 0);
                for (let i = 0; i < NS; i++) {
                    const j = (i + 1) % NS;
                    idx.push(cT, huT + i, huT + j);
                    idx.push(cB, huB + j, huB + i);
                }
                // SPEICHEN: N dünne Balken von der Nabe zur Felge (als schmale Quads in der Rad-Ebene).
                for (let s = 0; s < nsp; s++) {
                    const a = (s / nsp) * Math.PI * 2;
                    const ca = Math.cos(a),
                        sa = Math.sin(a);
                    const pa = a + Math.PI / 2;
                    const cp = Math.cos(pa) * rimW * 0.35,
                        sp = Math.sin(pa) * rimW * 0.35;
                    const b = verts.length / 3;
                    verts.push(ca * hubR + cp, wid * 0.18, sa * hubR + sp);
                    verts.push(ca * hubR - cp, wid * 0.18, sa * hubR - sp);
                    verts.push(ca * Ri + cp, wid * 0.18, sa * Ri + sp);
                    verts.push(ca * Ri - cp, wid * 0.18, sa * Ri - sp);
                    verts.push(ca * hubR + cp, -wid * 0.18, sa * hubR + sp);
                    verts.push(ca * hubR - cp, -wid * 0.18, sa * hubR - sp);
                    verts.push(ca * Ri + cp, -wid * 0.18, sa * Ri + sp);
                    verts.push(ca * Ri - cp, -wid * 0.18, sa * Ri - sp);
                    // Top-Fläche + Bottom-Fläche der Speiche (sichtbar von der Seite).
                    idx.push(b, b + 2, b + 1, b + 1, b + 2, b + 3);
                    idx.push(b + 4, b + 5, b + 6, b + 5, b + 7, b + 6);
                }
                const g = new THREE.BufferGeometry();
                g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
                g.setIndex(idx);
                g.computeVertexNormals();
                return g;
            }
            case "pickHead": {
                // Gebogener Spitzhacken-Kopf: Spitze auf der einen, flacher Adze auf der anderen Seite, beide vom Auge
                // ausschwingend, entlang X. size.x = Spannweite, size.y = Höhe (Auge), size.z = Dicke;
                // part.curve = Krümmung.
                const span = Math.max(0.1, sx);
                const eyeH = Math.max(0.05, sy);
                const thick = Math.max(0.03, sz);
                const curve = Number.isFinite(part.curve) ? Math.max(0, Math.min(0.6, part.curve)) : 0.28;
                const NSEG = 8;
                const verts = [];
                const idx = [];
                // ein verjüngter, gebogener Arm von t=0 (Auge) nach t=1 (Spitze), in der XY-Ebene,
                // Dicke in Z. zwei Arme: pick (+x, spitz) + adze (−x, stumpf breit).
                const arm = (dir, tipFrac, taper, reach) => {
                    const base = verts.length / 3;
                    for (let j = 0; j <= NSEG; j++) {
                        const t = j / NSEG;
                        const x = dir * (span / 2) * reach * t;
                        const droop = -curve * span * 0.32 * t * t; // schwingt leicht nach unten
                        const hw = (eyeH / 2) * (1 - (1 - taper) * t); // Höhe verjüngt
                        const hz = (thick / 2) * (1 - (1 - tipFrac) * t); // Dicke verjüngt → Schneide
                        verts.push(x, droop + hw, hz, x, droop + hw, -hz, x, droop - hw, hz, x, droop - hw, -hz);
                    }
                    for (let j = 0; j < NSEG; j++) {
                        const a = base + j * 4;
                        const b = base + (j + 1) * 4;
                        // 4 Längs-Flächen (oben/unten/vorn/hinten) der Arm-„Röhre".
                        idx.push(a, b, a + 1, a + 1, b, b + 1); // oben
                        idx.push(a + 2, a + 3, b + 2, a + 3, b + 3, b + 2); // unten
                        idx.push(a, a + 2, b, b, a + 2, b + 2); // +z
                        idx.push(a + 1, b + 1, a + 3, a + 3, b + 1, b + 3); // −z
                    }
                };
                arm(1, 0.04, 0.06, 1.15); // pick: lang + verjüngt zur scharfen Spitze
                arm(-1, 0.7, 0.7, 0.55); // adze: kurz + stumpf-breit (Brecher)
                const g = new THREE.BufferGeometry();
                g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
                g.setIndex(idx);
                g.computeVertexNormals();
                return g;
            }
            case "noiserock": {
                // Noiserock: Ikosaeder, Vertices radial per SimplexNoise verschoben (Facetten/Brüche); härte →
                // Angularität. Fixe Noise-Seed → alle Peers teilen die Form (render-only). NON-indexed: die
                // Verschiebung als f(POSITION) hält geteilte Kanten verschweißt; danach flache Facetten-Normalen.
                // Detail skaliert mit der Größe: < 0.7 m det 0 (20 Flächen — Tausende Kiesel wären sonst der größte
                // Dreiecks-Posten), ≥ 0.7 m det 1. Explizites `noiseDetail` bleibt Override.
                const _maxDim = Math.max(sx, sy, sz);
                const det = Number.isFinite(part.noiseDetail)
                    ? Math.max(0, Math.min(3, part.noiseDetail | 0))
                    : _maxDim < 0.7
                      ? 0
                      : 1;
                const matDef = part.material && this.state.materials ? this.state.materials[part.material] : null;
                const haerte = matDef && matDef.tags && Number.isFinite(+matDef.tags.härte) ? +matDef.tags.härte : 0.5;
                if (!this._archRockNoise) this._archRockNoise = new SimplexNoise("anazh-arch-rock");
                // Stein aus der geteilten Quelle (phyto-core `buildBoulder`, Zingg/Wadell): mehr-oktavige Brüche +
                // Sediment-Bänke + Facetten; härte treibt die Angularität; deterministisch (fixe noise3 + seed aus
                // den Maßen). shape bleibt `noiserock` → Tags frozen. Nur für det ≥ 1 (≥ 0.7 m) — ein Kiesel
                // (det 0) bleibt auf dem billigen 20-Flächen-Pfad.
                const core = typeof globalThis !== "undefined" && globalThis.__phytoCore;
                if (det >= 1 && core && typeof core.buildBoulderGeometry === "function") {
                    const noise3 = (x, y, z) => this._archRockNoise.noise3D(x, y, z);
                    let hs =
                        (Math.round(sx * 97) * 131 + Math.round(sy * 89) * 71 + Math.round(sz * 83) * 53) &
                            0x7fffffff || 1;
                    const seq = () => {
                        hs = (hs * 1664525 + 1013904223) & 0x7fffffff;
                        return hs / 0x7fffffff;
                    };
                    // Die Gestalt aus phyto-core, der Stoff aus dem Fels-Gesetz (unten, K17). part.color (Strata + Fuß-Moos
                    // aus _rockVariant) ist der Basis-Ton. Tag-neutral (nur das color-Attribut). Das Material liest die
                    // Vertex-Farbe (matOpts.vertexColorAlbedo).
                    const _rockBase = Number.isFinite(part.color) ? part.color : 0x8a8278;
                    // Werkstatt-Regler: `part.rockDials` (Rundheit/Rauheit/Streckung/Schichtung) / `part.rockSeed`
                    // überschreiben die Geologie live über dieselbe buildBoulderGeometry-Quelle; ohne Override das
                    // härte-abgeleitete Default.
                    const _rk = part.rockDials || null;
                    const g = core.buildBoulderGeometry(
                        THREE,
                        noise3,
                        {
                            size: 1,
                            elong: _rk && Number.isFinite(_rk.elong) ? _rk.elong : 0.2 + 0.2 * (1 - haerte),
                            sph: _rk && Number.isFinite(_rk.sph) ? _rk.sph : 0.62,
                            round:
                                _rk && Number.isFinite(_rk.round)
                                    ? _rk.round
                                    : Math.max(0.05, Math.min(0.9, 0.62 - 0.5 * haerte)),
                            rough: _rk && Number.isFinite(_rk.rough) ? _rk.rough : 0.34 + 0.4 * haerte,
                            strat: _rk && Number.isFinite(_rk.strat) ? _rk.strat : 0.12,
                            // LOD-Override (Werkstatt-Regler): gröbere Regeneration = weniger Detail.
                            detail: Math.max(1, det + 2 - (Number.isFinite(part.rockLod) ? part.rockLod : 0)),
                            seed: Number.isFinite(part.rockSeed) ? (part.rockSeed % 9973) + 1 : (hs % 9973) + 1,
                        },
                        seq
                    );
                    if (g) {
                        g.scale(0.5 * sx, 0.5 * sy, 0.5 * sz);
                        g.computeVertexNormals();
                        // DER STOFF ist das Fels-Gesetz (K17, gelaende-core `felsNetz`): der Basis-Ton (part.color) ist
                        // eine sRGB-Absicht (FARB-GESETZ), die dunkle Lage und die helle Bank leitet das Gesetz ab.
                        const GK = globalThis.__gelaendeCore;
                        const n = g.attributes.position.count;
                        const C = new Float32Array(n * 3);
                        GK.felsNetz(
                            GK.felsBasis(AnazhRealm._srgbHexLinear(_rockBase)),
                            g.attributes.position.array,
                            g.attributes.normal.array,
                            g.index ? g.index.array : null,
                            n,
                            { himmel: 1, feucht: 0.3 },
                            C
                        );
                        g.setAttribute("color", new THREE.Float32BufferAttribute(C, 3));
                        return g;
                    }
                }
                // Fallback (kein phyto-core): die alte ein-oktavige Noise-Kugel.
                const strength = Number.isFinite(part.noiseStrength) ? part.noiseStrength : 0.16 + 0.18 * (1 - haerte);
                const freq = 1.5 + haerte * 2.2;
                const g = new THREE.IcosahedronGeometry(0.5, det);
                const ap = g.attributes.position;
                for (let i = 0; i < ap.count; i++) {
                    const vx = ap.getX(i);
                    const vy = ap.getY(i);
                    const vz = ap.getZ(i);
                    const n = this._archRockNoise.noise3D(vx * freq + 11.2, vy * freq - 7.4, vz * freq + 3.1);
                    const d = 1 + n * strength;
                    ap.setXYZ(i, vx * d * sx, vy * d * sy, vz * d * sz);
                }
                ap.needsUpdate = true;
                g.computeVertexNormals();
                return g;
            }
            case "flutedColumn": {
                // Klassische Säule als EINE Mesh: Entasis (konvexe Verjüngung nach oben) und Kanneluren (N konkave
                // Rillen mit scharfen Graten) ECHT in der Geometrie, nicht als N Groove-Parts. Parametrisch
                // (dorisch 20 / ionisch 24 Rillen), deterministisch.
                const bottomR = Math.max(0.02, sx / 2); // size.x = unterer Durchmesser D
                const topR = Math.max(0.02, sz / 2); // size.z = oberer ⌀ (Verjüngung)
                const H = Math.max(0.1, sy); // size.y = Schaft-Höhe
                const flutes = Math.max(0, Math.min(40, part.flutes | 0 || 0));
                const fluteDepth = Number.isFinite(part.fluteDepth)
                    ? Math.max(0, Math.min(0.3, part.fluteDepth))
                    : 0.05;
                const entasis = Number.isFinite(part.entasis) ? Math.max(0, Math.min(0.3, part.entasis)) : 0.04;
                const radial = flutes > 0 ? Math.max(24, flutes * 3) : Math.max(10, segments);
                const rings = Math.max(2, Math.min(20, part.heightSegments || 6));
                const radAtT = (t) => {
                    const lin = bottomR + (topR - bottomR) * t; // lineare Verjüngung
                    return lin + entasis * bottomR * Math.sin(Math.PI * t); // konvexe Wölbung (max bei t=0.5)
                };
                const fluteAt = (theta) => {
                    if (flutes <= 0) return 1;
                    // konkave Mulde je Rille (0.5−0.5·cos = glatte Rinne; an den Graten voll-radial)
                    return 1 - fluteDepth * (0.5 - 0.5 * Math.cos(theta * flutes));
                };
                const verts = [];
                const idx = [];
                for (let j = 0; j <= rings; j++) {
                    const t = j / rings;
                    const y = (t - 0.5) * H;
                    const r0 = radAtT(t);
                    for (let i = 0; i < radial; i++) {
                        const theta = (i / radial) * Math.PI * 2;
                        const r = r0 * fluteAt(theta);
                        verts.push(Math.cos(theta) * r, y, Math.sin(theta) * r);
                    }
                }
                for (let j = 0; j < rings; j++) {
                    for (let i = 0; i < radial; i++) {
                        const a = j * radial + i;
                        const b = j * radial + ((i + 1) % radial);
                        const c = (j + 1) * radial + i;
                        const d = (j + 1) * radial + ((i + 1) % radial);
                        idx.push(a, c, b, b, c, d);
                    }
                }
                // Deckel oben + unten (Fächer) — die Schnitt-Flächen auf Stylobat / unter Kapitell
                const baseCenter = verts.length / 3;
                verts.push(0, -H / 2, 0);
                const topCenter = verts.length / 3;
                verts.push(0, H / 2, 0);
                const topRing = rings * radial;
                for (let i = 0; i < radial; i++) {
                    const i1 = (i + 1) % radial;
                    idx.push(baseCenter, i1, i);
                    idx.push(topCenter, topRing + i, topRing + i1);
                }
                const g = new THREE.BufferGeometry();
                g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
                g.setIndex(idx);
                g.computeVertexNormals();
                return g;
            }
            case "bladeProfile": {
                // Klinge als EINE Mesh: distale Verjüngung, Hohlkehle (Masse an der neutralen Achse entfernt:
                // leichter bei gleicher Steifigkeit), linsenförmiger Querschnitt zu den Schneiden. Die Formel
                // (klingenProfil) wohnt in schmiede-core — der Stamm delegiert fail-closed (kalter Kern → Wurf,
                // nie ein Nachbau; index.html lädt den Kern vor dem Stamm).
                const core = (typeof globalThis !== "undefined" && globalThis.__schmiedeCore) || null;
                if (!core || typeof core.klingenProfil !== "function")
                    throw new Error("bladeProfile braucht das Gesetzbuch schmiede-core (klingenProfil)");
                const spec = {
                    baseHalfW: Math.max(0.01, sx / 2), // size.x = Klingen-Breite an der Parier
                    maxThick: Math.max(0.01, sz), // size.z = max Dicke (Mittelgrat)
                    tipWidth: part.tipWidth,
                    fuller: part.fuller,
                };
                const L = Math.max(0.1, sy); // size.y = Klingen-Länge
                const wseg = 8;
                const hseg = Math.max(6, Math.min(40, part.heightSegments || 14));
                const W1 = wseg + 1;
                const verts = [];
                const idx = [];
                const ring = (zSign) => {
                    for (let j = 0; j <= hseg; j++) {
                        const t = j / hseg;
                        const y = (t - 0.5) * L;
                        for (let k = 0; k <= wseg; k++) {
                            const w = (k / wseg - 0.5) * 2;
                            const p = core.klingenProfil(spec, t, w);
                            verts.push(p.w, y, (zSign * p.h) / 2);
                        }
                    }
                };
                ring(1); // FRONT
                const backBase = verts.length / 3;
                ring(-1); // BACK
                for (let j = 0; j < hseg; j++)
                    for (let k = 0; k < wseg; k++) {
                        const a = j * W1 + k,
                            b = j * W1 + k + 1,
                            c = (j + 1) * W1 + k,
                            d = (j + 1) * W1 + k + 1;
                        idx.push(a, c, b, b, c, d); // FRONT (+z)
                        const a2 = backBase + a,
                            b2 = backBase + b,
                            c2 = backBase + c,
                            d2 = backBase + d;
                        idx.push(a2, b2, c2, b2, d2, c2); // BACK (−z, umgekehrt)
                    }
                for (let k = 0; k < wseg; k++) {
                    // Basis-Kappe (j=0) zwischen Front + Back
                    idx.push(k, k + 1, backBase + k, k + 1, backBase + k + 1, backBase + k);
                }
                const g = new THREE.BufferGeometry();
                g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
                g.setIndex(idx);
                g.computeVertexNormals();
                return g;
            }
            case "gableTriangle": {
                // Ω-B1 (wahrerbauplan §6) — das TYMPANON: ein flaches dreieckiges Giebelfeld
                // (Basis unten, Spitze am First) als dünnes Prisma — schließt den Giebel
                // vorne/hinten (kein offenes Dach). size: x=Basis-Breite, y=Höhe, z=Dicke.
                const w = Math.max(0.02, sx),
                    hh = Math.max(0.02, sy),
                    tt = Math.max(0.01, sz);
                const v = [
                    -w / 2,
                    -hh / 2,
                    tt / 2,
                    w / 2,
                    -hh / 2,
                    tt / 2,
                    0,
                    hh / 2,
                    tt / 2, // Front
                    -w / 2,
                    -hh / 2,
                    -tt / 2,
                    w / 2,
                    -hh / 2,
                    -tt / 2,
                    0,
                    hh / 2,
                    -tt / 2, // Rück
                ];
                const tri = [0, 1, 2, 5, 4, 3, 0, 3, 1, 1, 3, 4, 1, 4, 2, 2, 4, 5, 2, 5, 0, 0, 5, 3];
                const g = new THREE.BufferGeometry();
                g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
                g.setIndex(tri);
                g.computeVertexNormals();
                return g;
            }
            case "box":
            default:
                return new THREE.BoxGeometry(sx, sy, sz);
        }
    }

    // ═══ DIE ARCHITEKTUR-GRAMMATIK ═══
    // Kein Spiel-Pfad ruft sie mehr (Tempel kommen aus den fachwerk-Kulturen); sie bleibt als
    // Physik-Richter-Saat für die diag-genom-Gates. Aus der ORDNUNG (dorisch/ionisch) folgt alles:
    // Schlankheit (dorisch 1:7), Entasis + Kanneluren, Kapitell, Gebälk, Giebel — die Säulen schließen
    // den Lastpfad und knicken nicht. Reine Daten; peripteral, columnsFront/Side parametrisch.
    _buildClassicalTemple(orderName, opts) {
        const O =
            (AnazhRealm.CLASSICAL_ORDERS && AnazhRealm.CLASSICAL_ORDERS[orderName]) ||
            AnazhRealm.CLASSICAL_ORDERS.dorisch;
        opts = opts || {};
        const D = opts.columnDiameter || 0.85; // unterer Säulen-Durchmesser = das Modul
        const colsFront = Math.max(2, opts.columnsFront || O.columnsFront || 6); // hexastyle
        const colsSide = Math.max(2, opts.columnsSide || 2 * (O.columnsFront || 6) - 3); // dorische Tiefen-Regel
        const shaftH = D * O.slenderness; // Schaft-Höhe = Schlankheit × D (dorisch 1:7)
        const axis = D * O.intercolumniation; // Achs-Abstand der Säulen
        const mat = "stein";
        // Stein-Paletten-Override (Marmor/Sandstein/Granit/Basalt, aus dem Seed gewürfelt): Material bleibt
        // "stein" (Affinität unberührt), nur die Farben wechseln. Default = Ordnungs-Marmor.
        const PAL = opts.palette || null;
        const marble = (PAL && PAL.marble) || O.marble;
        const cap = (PAL && PAL.cap) || O.capitalColor || 0xe4ddca;
        const friezeCol = (PAL && PAL.frieze) || 0xd7cfba;
        const trigCol2 = (PAL && PAL.trig) || 0xc9c1ac;
        const parts = [];
        const frontW = (colsFront - 1) * axis; // Achs-Spanne in X
        const sideD = (colsSide - 1) * axis; // Achs-Spanne in Z
        const halfX = frontW / 2;
        const halfZ = sideD / 2;
        const box = (color, x, y, z, sx, sy, sz) =>
            parts.push({ shape: "box", material: mat, color, position: { x, y, z }, size: { x: sx, y: sy, z: sz } });

        // (1) STYLOBAT/KREPIS — 3 gestufte rechteckige Stufen (abnehmend nach oben).
        const stepColor = (PAL && PAL.step) || 0xcfc8b4;
        const steps = [
            { m: 3.2, y: 0.2, h: 0.4 },
            { m: 2.4, y: 0.55, h: 0.35 },
            { m: 1.7, y: 0.85, h: 0.3 }, // die oberste = der Stylobat, auf dem die Säulen stehen
        ];
        for (const s of steps) box(stepColor, 0, s.y, 0, frontW + s.m * D + 2 * D, s.h, sideD + s.m * D + 2 * D);
        const stylTop = 1.0; // Oberkante Stylobat = Säulen-Fuß

        // (2) PERISTYL — die Säulen am Rechteck-Rand (peripteral). Jede: optional Basis
        // (ionisch), flutedColumn-SCHAFT (Entasis + Kanneluren), Echinus-Flare + Abakus.
        const baseH = O.hasBase ? D * 0.28 : 0;
        const echH = D * 0.26;
        const abH = D * 0.16;
        const abW = D * 1.18;
        const shaftTopR = (D * O.topRatio) / 2;
        const colTopY = stylTop + baseH + shaftH + echH + abH;
        const isPerimeter = (fx, fz) => fx === 0 || fx === colsFront - 1 || fz === 0 || fz === colsSide - 1;
        for (let fx = 0; fx < colsFront; fx++) {
            for (let fz = 0; fz < colsSide; fz++) {
                if (!isPerimeter(fx, fz)) continue;
                const px = (fx - (colsFront - 1) / 2) * axis;
                const pz = (fz - (colsSide - 1) / 2) * axis;
                let y = stylTop;
                if (O.hasBase) {
                    box(marble, px, y + baseH / 2, pz, D * 1.15, baseH, D * 1.15); // Profil-Basis (ionisch)
                    y += baseH;
                }
                parts.push({
                    shape: "flutedColumn",
                    material: mat,
                    color: marble,
                    position: { x: px, y: y + shaftH / 2, z: pz },
                    size: { x: D, y: shaftH, z: D * O.topRatio }, // Entasis: oberer ⌀ < unterer
                    flutes: O.flutes,
                    fluteDepth: O.fluteDepth,
                    entasis: O.entasis,
                    heightSegments: 6,
                });
                y += shaftH;
                // Echinus: ein nach oben aufweitender Flare (Kissen) — unterer ⌀ = Schaft-Top,
                // oberer ⌀ = Richtung Abakus. cylinder nimmt top=sx/2, bottom=sz/2 → sx>sz = Flare.
                parts.push({
                    shape: "cylinder",
                    material: mat,
                    color: cap,
                    position: { x: px, y: y + echH / 2, z: pz },
                    size: { x: D * 1.02, y: echH, z: shaftTopR * 2 },
                    segments: 14,
                });
                y += echH;
                box(cap, px, y + abH / 2, pz, abW, abH, abW); // Abakus (quadratische Deckplatte)
            }
        }

        // (3) GEBÄLK — der EINE Ring aus 4 Balken je Schicht (Architrav · Fries · Gesims).
        const archH = D * 0.85;
        const friezeH = D * 0.8;
        const cornH = D * 0.36;
        const ringX = frontW + 1.6 * D; // Außenmaß des Gebälks in X
        const ringZ = sideD + 1.6 * D;
        const beamW = D * 0.7;
        const ringRow = (color, yc, h, ext) => {
            const ex = ext || 0;
            box(color, 0, yc, halfZ + beamW / 2 + ex, frontW + 2 * D + 2 * ex, h, beamW); // vorne (+Z)
            box(color, 0, yc, -(halfZ + beamW / 2 + ex), frontW + 2 * D + 2 * ex, h, beamW); // hinten
            box(color, halfX + beamW / 2 + ex, yc, 0, beamW, h, sideD + 2 * D); // rechts (+X)
            box(color, -(halfX + beamW / 2 + ex), yc, 0, beamW, h, sideD + 2 * D); // links
        };
        const archY = colTopY + archH / 2;
        ringRow(marble, archY, archH); // Architrav
        const friezeY = colTopY + archH + friezeH / 2;
        ringRow(friezeCol, friezeY, friezeH); // Fries (Grundband)
        const cornY = colTopY + archH + friezeH + cornH / 2;
        ringRow(cap, cornY, cornH, D * 0.35); // Gesims (Überstand)

        // (3b) TRIGLYPHEN — die dorische Fries-Signatur: an JEDER Säule + JEDER Joch-Mitte
        // ein Triglyph (vorstehender Block) auf der Vorder-/Rück-Front (die Giebel-Fronten).
        const trigW = D * 0.34;
        const trigD = D * 0.16;
        const trigCol = trigCol2;
        const trigZ = halfZ + beamW + trigD / 2;
        const trigPositions = [];
        for (let k = 0; k < colsFront; k++) trigPositions.push((k - (colsFront - 1) / 2) * axis); // über den Säulen
        for (let k = 0; k < colsFront - 1; k++) trigPositions.push((k - (colsFront - 1) / 2) * axis + axis / 2); // über den Jochen
        for (const tx of trigPositions) {
            box(trigCol, tx, friezeY, trigZ, trigW, friezeH * 0.92, trigD);
            box(trigCol, tx, friezeY, -trigZ, trigW, friezeH * 0.92, trigD);
        }

        // (4) GIEBEL — Satteldach: zwei geneigte Flächen treffen sich am First (längs Z) → dreieckige
        // Pediment-Silhouette an den Schmalseiten; das Dach ruht auf dem Gesims (Lastpfad geschlossen).
        const eaveY = cornY + cornH / 2;
        const roofRise = ringX * 0.16; // Giebel-Höhe ≈ Spannweite/6 (flacher griechischer Giebel ~17°)
        const eaveX = ringX / 2 + 0.4 * D; // X der Traufe (mit Überstand)
        const slopeLen = Math.hypot(eaveX, roofRise);
        const pitch = Math.atan2(roofRise, eaveX);
        const roofThick = D * 0.22;
        const roofZ = ringZ + 0.8 * D;
        for (const sgn of [-1, 1]) {
            // Jede Dach-Fläche läuft von der Traufe (außen ±X, tief) zum First (x=0, hoch): Rotation
            // `−sgn·pitch` — `sgn·pitch` ergäbe einen Schmetterling statt Giebel.
            parts.push({
                shape: "box",
                material: mat,
                color: cap,
                position: { x: (sgn * eaveX) / 2, y: eaveY + roofRise / 2, z: 0 },
                size: { x: slopeLen, y: roofThick, z: roofZ },
                rotation: { x: 0, y: 0, z: -sgn * pitch },
            });
        }
        box(cap, 0, eaveY + roofRise + roofThick * 0.3, 0, D * 0.5, roofThick * 1.2, roofZ); // First-Balken
        // TYMPANON — das dreieckige Giebelfeld schließt den Giebel vorne + hinten (kein offenes Dach).
        for (const sgnZ of [-1, 1]) {
            parts.push({
                shape: "gableTriangle",
                material: mat,
                color: trigCol2,
                position: { x: 0, y: eaveY + roofRise / 2, z: sgnZ * (ringZ / 2 + 0.05 * D) },
                size: { x: eaveX * 1.9, y: roofRise, z: roofThick * 0.9 },
            });
        }

        // (5) CELLA (Naos) — der innere Raum: 4 Wände innerhalb des Peristyls, auf dem
        // Stylobat bis unters Gebälk. Die FRONT-Wand (+Z) trägt den EINGANG — eine TÜR
        // (Lücke + Sturz), durch die man den Tempel betritt (der „Eingang", Schöpfer-Wunsch).
        const cellaX = frontW - 1.4 * D;
        const cellaZ = sideD - 1.4 * D;
        const cellaH = shaftH + echH + abH;
        const cellaYc = stylTop + cellaH / 2;
        const wallT = D * 0.4;
        const wallC = (PAL && PAL.wall) || 0xc4bda8;
        const cellaFrontZ = cellaZ / 2;
        const doorW = Math.min(cellaX * 0.5, 1.7 * D); // Tür-Breite
        const doorH = cellaH * 0.72; // Tür-Höhe
        const sideW = (cellaX - doorW) / 2; // je ein Wand-Pfeiler links + rechts der Tür
        box(wallC, -(doorW / 2 + sideW / 2), cellaYc, cellaFrontZ, sideW, cellaH, wallT); // Pfeiler links
        box(wallC, doorW / 2 + sideW / 2, cellaYc, cellaFrontZ, sideW, cellaH, wallT); // Pfeiler rechts
        box(wallC, 0, stylTop + (doorH + cellaH) / 2, cellaFrontZ, doorW, cellaH - doorH, wallT); // Sturz über der Tür
        box(wallC, 0, cellaYc, -cellaZ / 2, cellaX, cellaH, wallT); // Rück-Wand (geschlossen)
        box(wallC, cellaX / 2, cellaYc, 0, wallT, cellaH, cellaZ - wallT); // Seiten-Wand +X
        box(wallC, -cellaX / 2, cellaYc, 0, wallT, cellaH, cellaZ - wallT); // Seiten-Wand −X

        // (6) ALTAR + KRISTALL — im Cella-Inneren, auf dem Boden (Lastpfad intakt: der
        // Kristall sitzt auf dem Altar, schwebt NICHT — der Tempel ist strukturell ehrlich).
        box(0x8a7a9a, 0, stylTop + 0.35, 0, 1.5, 0.7, 1.5); // Altar-Sockel
        box(0x6a4a8a, 0, stylTop + 0.95, 0, 1.0, 0.6, 1.0); // Altar
        parts.push({
            shape: "octahedron",
            material: "quarz",
            color: 0xd9a3ff,
            position: { x: 0, y: stylTop + 1.6, z: 0 },
            size: { x: 0.8, y: 1.0, z: 0.8 },
        });
        return parts;
    }

    // ═══ DER GETEILTE GENOM-ROLLER ═══
    // EINE Quelle für deterministisches Achsen-Würfeln aller _<genre>Variant, UNSIGNED (`h >>> n` lebt
    // NUR hier). Jede Achse ist ein eigener FNV-Stream (namespace|seed|name) → eine neue Achse re-rollt
    // nie eine andere. `.seq(name)` = sequentieller xorshift32-Sub-Strom für Wuchs-Schleifen.
    _rollGenome(seed, namespace) {
        const base = (namespace == null ? "g" : String(namespace)) + "|" + (seed == null ? "anazh" : String(seed));
        const hashStr = (str) => {
            let h = 2166136261;
            for (let i = 0; i < str.length; i++) {
                h ^= str.charCodeAt(i);
                h = Math.imul(h, 16777619);
            }
            return h >>> 0; // UNSIGNED — die EINE Vorzeichen-Wand
        };
        const axis = (name) => hashStr(base + "|" + String(name)) / 4294967296; // [0,1)
        return {
            seed: seed,
            namespace: namespace,
            axis: axis,
            // lo + axis·(hi−lo) → kontinuierlich [lo, hi)
            range: (name, lo, hi) => lo + axis(name) * (hi - lo),
            // ganzzahlig, INKLUSIV [lo..hi]
            int: (name, lo, hi) => lo + Math.floor(axis(name) * (hi - lo + 1)),
            // ein Element der Liste (UNSIGNED → kein neg.-Index-Leak)
            pick: (name, list) =>
                list && list.length ? list[Math.floor(axis(name) * list.length) % list.length] : undefined,
            chance: (name, p) => axis(name) < p,
            // sequentieller Sub-Strom für Wuchs-Schleifen: deterministisch, eigener
            // Strom je name (unabhängig von den Achsen UND voneinander). xorshift32.
            seq: (name) => {
                let h = hashStr(base + "#" + String(name)) || 1;
                return () => {
                    h ^= h << 13;
                    h >>>= 0;
                    h ^= h >> 17;
                    h ^= h << 5;
                    h >>>= 0;
                    return h / 4294967296;
                };
            },
        };
    }

    // ═══ DAS FELS-GENOM ═══
    // Form-Klasse (Brocken · Stapel · Nadel · Geröll), Größe, Verwitterung, Detail über den geteilten
    // Roller. Tag-neutral (nur `noiserock` + `stein` → Affinität wie stein_block). Der Fels steht, der
    // Stapel-Lastpfad schließt, die Nadel knickt nicht (diag-genom); Stapel bleibt achsen-parallel
    // (exakter AABB-Lastpfad).
    _rockVariant(seed) {
        const g = this._rollGenome(seed, "rock");
        const parts = [];
        // Sediment-Schichtung: die noiserock-Farbe folgt der Welt-Höhe (Strata-Bänder); ein feuchter Fels
        // (mossy) trägt am Fuß Flechten. Nur Farbe → Tags bleiben == stein_block.
        const mossy = g.chance("mossy", 0.4);
        const SEDIMENT = [0x6f6b62, 0x787262, 0x837c6e, 0x6a6258, 0x726c60, 0x7d7568];
        const blendCol = (a, b, t) => {
            t = Math.max(0, Math.min(1, t));
            const ar = (a >> 16) & 0xff,
                ag = (a >> 8) & 0xff,
                ab = a & 0xff;
            const br = (b >> 16) & 0xff,
                bg = (b >> 8) & 0xff,
                bb = b & 0xff;
            return (
                ((Math.round(ar + (br - ar) * t) & 0xff) << 16) |
                ((Math.round(ag + (bg - ag) * t) & 0xff) << 8) |
                (Math.round(ab + (bb - ab) * t) & 0xff)
            );
        };
        const rock = (x, y, z, sx, sy, sz, str, det, rot) => {
            let col = SEDIMENT[Math.abs(Math.floor(y * 1.7)) % SEDIMENT.length]; // Strata aus der Höhe
            if (mossy && y < 1.2) col = blendCol(col, 0x4a5a36, 0.5 * (1 - y / 1.2)); // Moos am Fuß
            parts.push({
                shape: "noiserock",
                material: "stein",
                color: col,
                position: { x, y, z },
                size: { x: sx, y: sy, z: sz },
                noiseStrength: str,
                noiseDetail: det,
                ...(rot ? { rotation: rot } : {}),
            });
        };
        const form = g.pick("form", ["brocken", "brocken", "stapel", "nadel", "geroell"]);
        this._lastLandmarkForm = form; // T-FULLSTACK: die Form reist zur Platzierung (field-meaningful)
        const weather = g.range("weather", 0.12, 0.4); // Verwitterung (scharf↔gerundet)
        const det = g.int("detail", 1, 2);
        if (form === "brocken") {
            // ein gedrungener Felsbrocken (breite Basis, tief → kippt nie); optional ein Begleiter.
            const r = g.range("brockenR", 0.7, 2.6);
            rock(0, r * 0.5, 0, r * 1.4, r * 0.95, r * 1.3, weather, det);
            if (g.chance("companion", 0.55)) {
                const r2 = r * g.range("c2", 0.3, 0.55);
                rock(r * 0.85, r2 * 0.5, r * 0.4, r2 * 1.3, r2 * 0.9, r2 * 1.2, weather, det, {
                    x: 0.15,
                    y: g.axis("cy") * 6.283,
                    z: 0.1,
                });
            }
        } else if (form === "stapel") {
            // ein verwitterter Stapel/Cairn: N achsen-parallele Blöcke, jeder auf dem
            // darunter (überlappend → Lastpfad schließt), nach oben schmaler, kleiner
            // Versatz (Schwerpunkt bleibt über der Basis → steht, Ω-Φ2).
            const n = g.int("stackN", 3, 5);
            let r = g.range("stapelR", 0.65, 1.25);
            let y = 0;
            for (let i = 0; i < n; i++) {
                const bw = r * 1.6;
                const bh = r * 0.9;
                y += bh * 0.5;
                rock(
                    (g.axis("ox" + i) - 0.5) * r * 0.3,
                    y,
                    (g.axis("oz" + i) - 0.5) * r * 0.3,
                    bw,
                    bh,
                    bw * 0.92,
                    weather,
                    det
                );
                y += bh * 0.42; // den nächsten Block leicht überlappen (Lastpfad-Berührung)
                r *= 0.8;
            }
        } else if (form === "nadel") {
            // eine verjüngte Fels-NADEL/Spire mit BREITEM Fuß (steht + knickt nicht).
            const h = g.range("nadelH", 3, 7.5);
            const baseR = h * 0.16; // breite Basis → Schwerpunkt stabil + niedrige Schlankheit
            const segs = 4;
            let y = 0;
            for (let i = 0; i < segs; i++) {
                const t = i / segs;
                const rr = baseR * (1 - t * 0.62);
                const segH = h / segs;
                rock(0, y + segH * 0.5, 0, rr * 2, segH, rr * 2, weather, det);
                y += segH;
            }
        } else {
            // Geröll-Streu (Scree): N kleine Felsen, jeder auf dem Boden (alle boden-
            // verankert → Lastpfad intakt; die gemeinsame Hülle trägt den Schwerpunkt).
            const n = g.int("screeN", 4, 7);
            for (let i = 0; i < n; i++) {
                const rr = g.range("r" + i, 0.18, 0.55);
                const ang = g.axis("a" + i) * 6.283;
                const dist = g.range("d" + i, 0, 1.1);
                rock(
                    Math.cos(ang) * dist,
                    rr * 0.45,
                    Math.sin(ang) * dist,
                    rr * 1.2,
                    rr * 0.85,
                    rr * 1.1,
                    weather,
                    det,
                    {
                        x: g.axis("rx" + i) * 0.4,
                        y: g.axis("ry" + i) * 6.283,
                        z: g.axis("rz" + i) * 0.4,
                    }
                );
            }
        }
        return parts;
    }

    // ═══ DAS KRISTALL-GENOM ═══
    // Habitus (Einzel-Spitze · Cluster · Geode · Säulen-Druse) · Größe · Facetten. Nur `quarz` + die
    // kristall_geode-Formen → tag-frozen zu kristall_geode. Eine breite quarz-Matrix trägt die Spitzen.
    _crystalVariant(seed) {
        const g = this._rollGenome(seed, "crystal");
        const parts = [];
        // Quarz-Bett (flache Matrix, trägt Tags + Schwerpunkt) + N facettierte `crystalPoint`-Spitzen. Achsen:
        // Habitus · Größe · Facetten · Spitzen-Zahl · Glanz (emissiv aus magieleitung). crystalPoint aktiviert
        // wie octahedron → Compound == kristall_geode. Breite ∝ Höhe hält den Knick-Richter.
        const glow = g.range("glow", 0.7, 1.7);
        const facets = g.int("facets", 6, 8); // n des Prismas (Quarz hexagonal, manche 8)
        const term = g.range("term", 0.26, 0.44);
        const sizeMul = g.range("size", 0.7, 1.8);
        const baseR = g.range("baseR", 0.5, 0.95) * sizeMul;
        const bed = (x, y, z, sx, sy, sz) =>
            parts.push({
                shape: "sphere",
                material: "quarz",
                color: 0x86bccf,
                opacity: 0.78,
                emissiveBoost: glow * 0.6,
                position: { x, y, z },
                size: { x: sx, y: sy, z: sz },
            });
        const point = (x, y, z, h, aspect, rot) => {
            const w = h * aspect; // die Schlankheit gebunden → knickt nicht (Ω-Φ3-b)
            parts.push({
                shape: "crystalPoint",
                material: "quarz",
                color: 0x9fd6e8,
                opacity: 0.86,
                emissiveBoost: glow,
                facets,
                termFrac: term,
                position: { x, y, z },
                size: { x: w, y: h, z: w },
                ...(rot ? { rotation: rot } : {}),
            });
        };
        const habitus = g.pick("habitus", ["einzel", "cluster", "geode", "druse"]);
        this._lastLandmarkForm = habitus; // T-FULLSTACK: die Habitus-Form reist zur Platzierung
        // das BETT — ein KLEINER, tief-sitzender quarz-Matrix-Nub (trägt nur die Tags + den
        // Fuß; sphere nutzt nur size.x → es ist IMMER rund, darum KLEIN halten, sonst dominiert
        // ein Ball [§11-Befund]). Die SPITZEN dominieren die Silhouette + wurzeln im Nub (Ω-Φ5).
        bed(0, baseR * 0.16, 0, baseR * 0.95, baseR * 0.6, baseR * 0.95);
        if (habitus === "einzel") {
            // EIN großer dominanter Quarz (ein „Kristall-Zepter") + tight wurzelnde Begleiter.
            const h = g.range("h", 2.1, 3.6) * sizeMul;
            point(0, baseR * 0.2 + h * 0.46, 0, h, g.range("asp", 0.3, 0.4), {
                x: g.range("tlt", -0.1, 0.1),
                y: g.axis("ry") * 6.283,
                z: g.range("tlt2", -0.1, 0.1),
            });
            const m = g.int("comp", 2, 3);
            for (let i = 0; i < m; i++) {
                const a = g.axis("a" + i) * 6.283;
                const d = baseR * g.range("d" + i, 0.2, 0.46);
                const hh = g.range("hh" + i, 0.9, 1.8) * sizeMul;
                point(Math.cos(a) * d, baseR * 0.2 + hh * 0.44, Math.sin(a) * d, hh, g.range("as" + i, 0.3, 0.42), {
                    x: Math.cos(a) * 0.35,
                    y: a,
                    z: Math.sin(a) * 0.35,
                });
            }
        } else if (habitus === "cluster") {
            const n = g.int("pts", 5, 9);
            for (let i = 0; i < n; i++) {
                const a = g.axis("a" + i) * 6.283;
                const d = g.range("d" + i, 0, baseR * 0.5);
                const hh = g.range("hh" + i, 1.0, 2.6) * sizeMul;
                point(Math.cos(a) * d, baseR * 0.18 + hh * 0.44, Math.sin(a) * d, hh, g.range("as" + i, 0.3, 0.4), {
                    x: Math.cos(a) * g.range("t" + i, 0.1, 0.4),
                    y: a,
                    z: Math.sin(a) * g.range("t2" + i, 0.1, 0.4),
                });
            }
        } else if (habitus === "geode") {
            const r = g.range("r", 0.8, 1.5) * sizeMul;
            bed(0, r * 0.18, 0, r * 1.1, r * 0.55, r * 1.1); // ein etwas breiterer Matrix-Boden
            const n = g.int("pts", 7, 11);
            for (let i = 0; i < n; i++) {
                const a = (i / n) * 6.283 + g.axis("j" + i) * 0.4;
                const hh = g.range("hh" + i, 0.55, 1.15) * r;
                const tilt = g.range("tl" + i, 0.35, 0.8);
                point(
                    Math.cos(a) * r * 0.42,
                    r * 0.3 + hh * 0.32,
                    Math.sin(a) * r * 0.42,
                    hh,
                    g.range("as" + i, 0.32, 0.42),
                    {
                        x: Math.sin(a) * -tilt,
                        y: a,
                        z: Math.cos(a) * tilt,
                    }
                );
            }
        } else {
            // druse: eine Säule aus Spitzen, nach oben schmaler (steht, knickt nicht).
            const n = g.int("pts", 4, 7);
            let y = baseR * 0.3;
            for (let i = 0; i < n; i++) {
                const hh = (1.1 - i * 0.1) * baseR * g.range("k", 1.4, 2.2);
                point(
                    (g.axis("ox" + i) - 0.5) * baseR * 0.5,
                    y + hh * 0.4,
                    (g.axis("oz" + i) - 0.5) * baseR * 0.5,
                    Math.max(0.18, hh),
                    g.range("as" + i, 0.32, 0.42),
                    {
                        x: g.range("rx" + i, -0.22, 0.22),
                        y: g.axis("ry" + i) * 6.283,
                        z: g.range("rz" + i, -0.22, 0.22),
                    }
                );
                y += hh * 0.3;
            }
        }
        return parts;
    }

    // ═══ DIE ESSE ALS FORGE ═══
    // Die Funktion diktiert die Teile: Feuerbox + Kohlen-Bett (`latheProfile`, emissiv) + Haube auf zwei
    // Pfeilern + Schornstein + Amboss (eisen + Horn auf Holz-Stumpf) + Blasebalg. Die Domäne bleibt
    // forging (_computeWorkshopDomain). opts.master = die Eisen-Meister-Esse.
    _buildForgeParts(opts) {
        opts = opts || {};
        const bodyMat = opts.master ? "eisen" : "stein";
        // Der Amboss-Werkstoff trägt die Steigerung: Basis-Esse BRONZE, Meister-Esse EISEN — ohne eisen
        // bleibt die Compound-dichte (Quelle von _workshopStationPrecision) unter der Meister-Esse.
        const anvilMat = opts.master ? "eisen" : "bronze";
        const anvilCol = opts.master ? 0x9aa0a6 : 0xb08d57;
        const stoneCol = opts.master ? 0x8a8f96 : 0x6a6258;
        const P = [];
        const add = (shape, material, x, y, z, sx, sy, sz, extra) =>
            P.push({ shape, material, position: { x, y, z }, size: { x: sx, y: sy, z: sz }, ...(extra || {}) });
        // (1) Feuerbox — der breite Herd (steht).
        add("box", bodyMat, 0, 0.55, 0, 2.0, 1.1, 1.6, { color: stoneCol });
        // (2) Kohlen-Bett — die glühende Glut (latheProfile-Schale, emissiv).
        add("latheProfile", "glut", 0, 1.18, 0, 1.4, 0.5, 1.2, {
            color: 0xff7a2a,
            opacity: 0.88,
            emissiveBoost: opts.master ? 1.7 : 1.5,
            profile: [
                [0, 0],
                [0.85, 0.05],
                [1.0, 0.35],
                [0.8, 0.6],
                [0, 0.66],
            ],
        });
        // (3) Esse-Haube auf zwei Hinter-Pfeilern (das Feuer bleibt vorn offen) + Schornstein.
        for (const sx of [-1, 1]) add("box", bodyMat, sx * 0.82, 1.7, -0.6, 0.24, 1.7, 0.24, { color: stoneCol });
        add("cone", bodyMat, 0, 2.85, -0.45, 1.9, 1.3, 1.5, { color: stoneCol });
        add("cylinder", bodyMat, 0, 3.8, -0.45, 0.55, 1.1, 0.55, { segments: 10, color: stoneCol });
        // (4) Amboss — eisen-Block + Horn auf einem Holz-Stumpf, neben dem Herd.
        add("cylinder", "holz", 1.55, 0.45, 0.6, 0.55, 0.9, 0.55, { segments: 8, color: 0x6e4a28 });
        add("box", anvilMat, 1.55, 1.05, 0.6, 0.5, 0.32, 1.0, { color: anvilCol });
        add("cone", anvilMat, 1.55, 1.05, 1.32, 0.32, 0.7, 0.32, {
            rotation: { x: Math.PI / 2, y: 0, z: 0 },
            color: anvilCol,
        });
        // (5) Blasebalg — ein Holz-Keil an der Herd-Seite (die Luft-Pumpe).
        add("box", "holz", -1.15, 0.8, 0, 0.5, 0.6, 1.1, { color: 0x6e4a28 });
        return P;
    }

    // ═══ DAS BAUWERK-GENOM ═══
    // Funktionale Bauten (Werkstätten · Portale · Rüstung · Trank · Fahrzeug) werden PARAMETRISIERT,
    // nie neu erfunden — die Funktion bleibt lesbar. Basis-verankert (der tiefste Boden bleibt am Ort →
    // kein Schweben nach dem Skalieren); index-basierte connections reisen mit (Part-Reihenfolge fest).
    _stationVariant(parts, seed) {
        if (!Array.isArray(parts) || !parts.length) return parts;
        const g = this._rollGenome(seed, "station");
        // Drei Achsen auf der bestehenden Parts-Liste: (1) GRÖSSE (Gesamt-Skala) · (2) PROPORTION
        // (nicht-uniform x/y/z, so beschränkt, dass Funktion + Stand halten) · (3) DETAIL-DICHTE (0–3
        // Ornamente, geklont aus einem bestehenden Teil gleicher Form+Material → tag-frozen, an die Bbox
        // skaliert) · dazu PALETTE (Farb-Tönung).
        const base = g.range("scale", 0.85, 1.35);
        const propX = g.range("propX", 0.85, 1.2);
        const propY = g.range("propY", 0.8, 1.25);
        const propZ = g.range("propZ", 0.85, 1.2);
        const sx = base * propX,
            sy = base * propY,
            sz = base * propZ;
        const tr = g.range("tintR", 0.84, 1.12),
            tg = g.range("tintG", 0.84, 1.12),
            tb = g.range("tintB", 0.84, 1.12);
        const clampB = (v) => Math.max(0, Math.min(255, Math.round(v)));
        const tint = (c) =>
            typeof c === "number"
                ? (clampB(((c >> 16) & 0xff) * tr) << 16) |
                  (clampB(((c >> 8) & 0xff) * tg) << 8) |
                  clampB((c & 0xff) * tb)
                : c;
        const lowBottom = (arr) => {
            let m = Infinity;
            for (const p of arr) {
                const py = (p.position && p.position.y) || 0;
                const syy = (p.size && p.size.y) || 0.3;
                if (py - syy / 2 < m) m = py - syy / 2;
            }
            return m;
        };
        const before = lowBottom(parts);
        const out = parts.map((p) => {
            const np = { ...p };
            if (p.size) np.size = { x: (p.size.x || 0.3) * sx, y: (p.size.y || 0.3) * sy, z: (p.size.z || 0.3) * sz };
            if (p.position)
                np.position = {
                    x: (p.position.x || 0) * sx,
                    y: (p.position.y || 0) * sy,
                    z: (p.position.z || 0) * sz,
                };
            if (typeof p.color === "number") np.color = tint(p.color);
            return np;
        });
        // ── DETAIL-DICHTE: Ornamente aus einem Klon-Teil (Form+Material gewahrt → tag-frozen) ──
        const detail = g.int("detail", 0, 3);
        if (detail > 0) {
            // Bbox des skalierten Kerns (für die Ornament-Platzierung am oberen Rand).
            let minX = Infinity,
                maxX = -Infinity,
                minZ = Infinity,
                maxZ = -Infinity,
                maxY = -Infinity;
            for (const p of out) {
                const px = (p.position && p.position.x) || 0,
                    py = (p.position && p.position.y) || 0,
                    pz = (p.position && p.position.z) || 0;
                const hx = ((p.size && p.size.x) || 0.3) / 2,
                    hy = ((p.size && p.size.y) || 0.3) / 2,
                    hz = ((p.size && p.size.z) || 0.3) / 2;
                if (px - hx < minX) minX = px - hx;
                if (px + hx > maxX) maxX = px + hx;
                if (pz - hz < minZ) minZ = pz - hz;
                if (pz + hz > maxZ) maxZ = pz + hz;
                if (py + hy > maxY) maxY = py + hy;
            }
            // Klon-Vorlage: das Teil mit dem KLEINSTEN Volumen (ein Detail, kein Tragwerk) —
            // sein shape+material wird übernommen → die Compound-Tags bleiben bit-identisch.
            let tmpl = out[0],
                tmplVol = Infinity;
            for (const p of out) {
                const v = ((p.size && p.size.x) || 0.3) * ((p.size && p.size.y) || 0.3) * ((p.size && p.size.z) || 0.3);
                if (v < tmplVol) {
                    tmplVol = v;
                    tmpl = p;
                }
            }
            const studS = Math.max(0.12, Math.min(maxX - minX, maxZ - minZ) * 0.14);
            // an den 4 oberen Ecken (innerhalb des Stützpolygons → kippt nicht), `detail` Stück.
            const corners = [
                [minX + studS, maxZ - studS],
                [maxX - studS, maxZ - studS],
                [minX + studS, minZ + studS],
                [maxX - studS, minZ + studS],
            ];
            for (let d = 0; d < detail; d++) {
                const [ox, oz] = corners[d % 4];
                // Den LOKALEN Scheitel an dieser Ecke finden (höchstes Teil, dessen Grundfläche die Ecke enthält) —
                // sonst schwebt der Stud bei hohen Strukturen über dem Schornstein.
                let localTop = -Infinity;
                for (const p of out) {
                    const px = (p.position && p.position.x) || 0,
                        pz = (p.position && p.position.z) || 0;
                    const hx = ((p.size && p.size.x) || 0.3) / 2,
                        hz = ((p.size && p.size.z) || 0.3) / 2,
                        hy = ((p.size && p.size.y) || 0.3) / 2,
                        py = (p.position && p.position.y) || 0;
                    if (ox >= px - hx && ox <= px + hx && oz >= pz - hz && oz <= pz + hz && py + hy > localTop)
                        localTop = py + hy;
                }
                if (!Number.isFinite(localTop)) continue; // nichts an dieser Ecke → kein Schweben
                out.push({
                    ...tmpl,
                    position: { x: ox, y: localTop - studS * 0.4, z: oz },
                    size: { x: studS, y: studS, z: studS },
                    ...(typeof tmpl.color === "number" ? { color: tint(tmpl.color) } : {}),
                });
            }
        }
        const shift = before - lowBottom(out); // den Boden re-verankern (kein Schweben)
        if (Math.abs(shift) > 1e-9) for (const p of out) if (p.position) p.position.y += shift;
        return out;
    }

    // ═══ DAS RÜSTUNGS-GENOM ═══
    // Gesten-/Bibliothek-gespawnt (nie scatter) → Material frei. Achsen: Brustplatten-Größe
    // (chestW/chestH) · Artikulation (Pauldron-Größe/-Spreizung, optional Gorget) · Werkstoff
    // (eisen/bronze → role bleibt armor). Bilateral symmetrisch; getragen → kein Stand-Richter.
    _armorVariant(seed) {
        const g = this._rollGenome(seed, "armor");
        const parts = [];
        const plateMat = g.pick("plateMat", ["eisen", "eisen", "bronze"]);
        const trimMat = plateMat === "eisen" ? "bronze" : "eisen";
        const chestW = g.range("chestW", 0.9, 1.35); // Platten-Breite (Sehne)
        const chestH = g.range("chestH", 1.0, 1.45); // Platten-Höhe
        const pauld = g.range("pauldron", 0.36, 0.62); // Schulter-Kappen-Größe
        const wrap = g.range("wrap", 1.7, 2.3); // wie eng der Brustpanzer umschließt
        const cY = 1.05;
        const spread = chestW * 0.52;
        // Gewölbte Platten (`plateShell`): Brustplatte + Pauldron-Paar + Fauld-Lamellen + Gurt + opt. Gorget.
        // (1) Brustplatte — gewölbt, Bauch nach vorn.
        parts.push({
            shape: "plateShell",
            material: plateMat,
            position: { x: 0, y: cY, z: 0 },
            size: { x: chestW, y: chestH, z: 0.42 },
            wrap,
        });
        // (2) Pauldrons — gewölbte Schulter-Kappen (Spiegel-Paar, nach außen geneigt).
        for (const sgn of [-1, 1])
            parts.push({
                shape: "plateShell",
                material: plateMat,
                position: { x: sgn * spread, y: cY + chestH * 0.4, z: 0.02 },
                size: { x: pauld, y: pauld * 0.8, z: pauld * 0.7 },
                wrap: 2.6,
                rotation: { x: 0, y: 0, z: sgn * 0.6 },
            });
        // (3) FAULD — artikulierte Lamellen-Schürze (2-3 horizontale Streifen unter der Brust).
        const lam = g.int("lam", 2, 3);
        for (let i = 0; i < lam; i++)
            parts.push({
                shape: "plateShell",
                material: plateMat,
                position: { x: 0, y: cY - chestH * 0.5 - i * 0.16, z: 0 },
                size: { x: chestW * (0.95 - i * 0.08), y: 0.15, z: 0.4 },
                wrap: wrap * 1.05,
            });
        // (4) Gurt-Zier (Material-Kontrast).
        parts.push({
            shape: "plateShell",
            material: trimMat,
            position: { x: 0, y: cY - chestH * 0.44, z: 0 },
            size: { x: chestW * 1.02, y: 0.12, z: 0.44 },
            wrap,
        });
        // (5) optional Gorget (Hals-Schutz).
        if (g.chance("gorget", 0.5))
            parts.push({
                shape: "plateShell",
                material: plateMat,
                position: { x: 0, y: cY + chestH * 0.55, z: 0.02 },
                size: { x: chestW * 0.5, y: 0.28, z: 0.36 },
                wrap: 2.4,
            });
        return parts;
    }

    // ═══ DAS TRANK-GENOM ═══
    // Phiolen-Proportion · Hals-Höhe · Glasur-Farbe (die Wirkung: heil/mana/blut/…). Materialien bleiben
    // weich (leder/kraut/holz) → role consumable robust.
    _potionVariant(seed) {
        const g = this._rollGenome(seed, "potion");
        const parts = [];
        const bodyW = g.range("bodyW", 0.4, 0.6); // Phiole-Breite
        const bodyH = g.range("bodyH", 0.55, 0.95); // Phiole-Höhe (schmal-hoch ↔ breit-gedrungen)
        const belly = g.range("belly", 0.82, 1.05); // Bauch-Fülle
        // Glasur-Farbe aus der Wirkung (eine kleine Trank-Palette: heil/mana/blut/gift/arkan).
        const glaze = g.pick("glaze", [0x4e9a3c, 0x3c8ad8, 0xd84e6e, 0xd8b43c, 0x9a4ed8]);
        const bodyY = bodyH * 0.5;
        // F2 (§11): eine geformte APOTHEKER-PHIOLE (`latheProfile`: Bauch · Schulter · Hals ·
        // Lippe) aus klarem Glas, durch das die Wirkungs-Flüssigkeit (Glasur-Farbe) sichtbar
        // ist + ein Korken. Liest als Trank, nicht als Ball+Zylinder (§11-Befund).
        const phial = [
            [0, 0],
            [0.5 * belly, 0.05],
            [0.58 * belly, 0.3],
            [0.5, 0.48],
            [0.28, 0.62],
            [0.24, 0.82],
            [0.32, 0.9],
            [0.26, 0.97],
            [0, 0.99],
        ];
        // Flasche (leder = das „Glas", klar) — die längliche Achse (size.y) ist die Höhe.
        parts.push({
            shape: "latheProfile",
            material: "leder",
            opacity: 0.42,
            color: 0xcfe6f0,
            position: { x: 0, y: bodyY, z: 0 },
            size: { x: bodyW, y: bodyH, z: bodyW },
            profile: phial,
        });
        // Flüssigkeit (kraut, Glasur-Farbe) — füllt den Bauch bis zu einem Meniskus.
        const liq = [
            [0, 0],
            [0.45 * belly, 0.05],
            [0.52 * belly, 0.28],
            [0.42, 0.46],
            [0.22, 0.56],
            [0, 0.59],
        ];
        parts.push({
            shape: "latheProfile",
            material: "kraut",
            color: glaze,
            opacity: 0.85,
            position: { x: 0, y: bodyY, z: 0 },
            size: { x: bodyW * 0.92, y: bodyH, z: bodyW * 0.92 },
            profile: liq,
        });
        // Korken (holz) auf dem Hals.
        parts.push({
            shape: "cylinder",
            material: "holz",
            color: 0x6e4a28,
            position: { x: 0, y: bodyY + bodyH * 0.49, z: 0 },
            size: { x: 0.14, y: 0.11, z: 0.14 },
            segments: 8,
        });
        return parts;
    }

    // ═══ DIE PARAMETRISCHE KLINGE ═══
    // Kein Spiel-Pfad ruft sie mehr (Klingen kommen aus den schmiede-core-Rezepten, Substanz aus
    // KIND_SUBSTANCE); sie bleibt Physik-Richter-Saat für die Balance-Gates (diag-genom). Oakeshott-Typ:
    // Knauf · Griff · Parier · Klinge mit Hohlkehle. Die BALANCE folgt aus der Massen-Verteilung der
    // Teile — gerechnet, nie gesetzt. Klinge eisen, Griff leder/holz.
    _buildBladedWeapon(typeName, opts) {
        const T =
            (AnazhRealm.OAKESHOTT_TYPES && AnazhRealm.OAKESHOTT_TYPES[typeName]) || AnazhRealm.OAKESHOTT_TYPES.XII;
        opts = opts || {};
        const parts = [];
        const gripLen = opts.gripLen || T.gripLen || 0.34;
        const pommelR = opts.pommelR || T.pommelR || 0.13; // der KONTERGEWICHT-Knauf (Balance!)
        const guardW = opts.guardW || T.guardW || 0.46; // die Parierstange (Kreuz)
        const bladeLen = opts.bladeLen || T.bladeLen;
        const bladeW = opts.bladeBaseW || T.bladeBaseW;
        const bladeThick = opts.bladeThick || T.thick;
        const steel = opts.bladeMaterial || "eisen";
        const gripMat = opts.gripMaterial || "leder";
        // (1) KNAUF (Pommel) — das Kontergewicht ganz unten; seine Masse balanciert die Klinge.
        // Oktaeder (facettiert) — zählt als spitze/klingen-Form (mit der bladeProfile-Klinge
        // hält das den pointedFraction hoch genug, dass das Werk als KLINGE liest, V17.86).
        parts.push({
            shape: "octahedron",
            material: steel,
            color: 0x9aa0a6,
            position: { x: 0, y: pommelR, z: 0 },
            size: { x: pommelR * 2, y: pommelR * 2, z: pommelR * 2 },
        });
        // (2) GRIFF — von über dem Knauf bis zur Parierstange.
        const gripY0 = pommelR * 2;
        parts.push({
            shape: "cylinder",
            material: gripMat,
            color: 0x4a3526,
            position: { x: 0, y: gripY0 + gripLen / 2, z: 0 },
            size: { x: 0.07, y: gripLen, z: 0.07 },
            segments: 8,
        });
        // (3) PARIER als Oktaeder (Kreuz mit Quillon-Spitzen): zählt als spitze Form, damit das Schwert
        // pointedFraction 0.75 trägt → cutPower > minePower (es schneidet, statt zu brechen).
        const guardY = gripY0 + gripLen;
        parts.push({
            shape: "octahedron",
            material: steel,
            color: 0x9aa0a6,
            position: { x: 0, y: guardY + 0.04, z: 0 },
            size: { x: guardW, y: 0.1, z: 0.16 },
        });
        // (4) KLINGE — der bladeProfile-Mesh: distale Verjüngung + Hohlkehle aus dem Oakeshott-Typ.
        const bladeY0 = guardY + 0.08;
        parts.push({
            shape: "bladeProfile",
            material: steel,
            color: 0xc7ccd2,
            position: { x: 0, y: bladeY0 + bladeLen / 2, z: 0 },
            size: { x: bladeW, y: bladeLen, z: bladeThick },
            tipWidth: T.tipWidth,
            fuller: T.fuller,
            heightSegments: 16,
        });
        return parts;
    }

    // Einen Bauplan in eine THREE.Group rendern; Materialien je Part. Ein Part mit
    // `animate: "water_wave"` bekommt die Wasser-Animation automatisch.
    _buildFromBlueprint(blueprint, depth, visited, opts) {
        // Fraktale Verschachtelung: shape:"blueprint" bettet via refName einen anderen Bauplan als
        // Sub-Group ein. Cycle-Guard über visited, Tiefe ≤ MAX_BLUEPRINT_DEPTH (4).
        const MAX_BLUEPRINT_DEPTH = 4;
        const d = depth || 0;
        const seen = visited || new Set();
        const group = new THREE.Group();
        if (!blueprint || !Array.isArray(blueprint.parts)) {
            group.userData.kind = blueprint ? blueprint.name : "empty";
            return group;
        }
        if (d > MAX_BLUEPRINT_DEPTH) {
            group.userData.kind = `${blueprint.name}_depthCapped`;
            return group;
        }
        // Cycle-Guard: ein Bauplan kann sich nicht selbst (direkt/indirekt)
        // enthalten — sonst Endlos-Rekursion. visited bleibt eine Pfad-Liste,
        // sodass Geschwister-Verwendungen erlaubt sind.
        if (seen.has(blueprint.name)) {
            group.userData.kind = `${blueprint.name}_cycle`;
            return group;
        }
        seen.add(blueprint.name);
        const materials = [];
        const waveTargets = [];
        for (const part of blueprint.parts) {
            if (part.shape === "blueprint" && typeof part.refName === "string") {
                const ref = this.state.blueprints && this.state.blueprints[part.refName];
                if (!ref) continue;
                const sub = this._buildFromBlueprint(ref, d + 1, seen);
                const pos = part.position || { x: 0, y: 0, z: 0 };
                sub.position.set(pos.x || 0, pos.y || 0, pos.z || 0);
                if (part.rotation) {
                    sub.rotation.set(part.rotation.x || 0, part.rotation.y || 0, part.rotation.z || 0);
                }
                const s = part.scale;
                if (typeof s === "number" && s > 0) {
                    sub.scale.setScalar(s);
                } else if (s && typeof s === "object") {
                    sub.scale.set(s.x || 1, s.y || 1, s.z || 1);
                }
                group.add(sub);
                continue;
            }
            const geom = this._makePartGeometry(part);
            // Farbe: explizites part.color (Werkstatt-Wahl) vor der Material-Farbe, sonst Weiß. Präzision
            // moduliert die Helligkeit (0.6 + 0.4·precision) — roh gebaut wirkt matt, poliert voll.
            let baseColor = typeof part.color === "number" ? part.color : null;
            const partMatDef =
                typeof part.material === "string" && this.state.materials ? this.state.materials[part.material] : null;
            if (baseColor === null && partMatDef && typeof partMatDef.color === "number") {
                baseColor = partMatDef.color;
            }
            if (baseColor === null) baseColor = 0xffffff;
            const precision = this.computePartPrecision(part);
            const brightness = 0.6 + 0.4 * Math.max(0, Math.min(1, precision));
            const r8 = (baseColor >> 16) & 0xff;
            const g8 = (baseColor >> 8) & 0xff;
            const b8 = baseColor & 0xff;
            const tintedColor =
                ((Math.round(r8 * brightness) & 0xff) << 16) |
                ((Math.round(g8 * brightness) & 0xff) << 8) |
                (Math.round(b8 * brightness) & 0xff);
            const matOpts = { color: tintedColor };
            // W-E (§8.3) — die Antenne IST die Substanz: das Material-Tag-Profil
            // reist in den Material-Bau (Glut glimmt, Eisen spiegelt, Holz wärmt).
            if (partMatDef && partMatDef.tags) matOpts.tags = partMatDef.tags;
            if (partMatDef) matOpts.stoff = part.material; // die Optik der Zeile (material.K5, `_stoffOptik`)
            // Trägt die Part-Geometrie ein `color`-Attribut (der Fels-Stoff, gelaende-core `felsNetz`), liest das Material die
            // Vertex-Farbe als Albedo (`vertexColorAlbedo` in _buildPbrNodeMaterial, ohne Terrain-Geologie-
            // Overlay). Rein geometrie-getrieben; Parts ohne color-Attribut unverändert.
            if (geom && geom.attributes && geom.attributes.color) {
                matOpts.vertexColors = true;
                matOpts.vertexColorAlbedo = true;
            }
            // T3 — der per-Teil GLANZ-Boost (Kristall/Glut-Genom): skaliert den tag-getragenen
            // Emissiv-Glimmen je Variante (tag-neutral; das SEIN bleibt der Material-Tag).
            if (Number.isFinite(part.emissiveBoost)) matOpts.emissiveBoost = part.emissiveBoost;
            if (Number.isFinite(part.opacity) && part.opacity < 1) {
                matOpts.transparent = true;
                matOpts.opacity = part.opacity;
            }
            // Architektur-Part-Material über den EINEN Helfer _buildToonNodeMaterial (immer PBR: roughness/
            // metalness aus den Tags).
            const mat = this._buildToonNodeMaterial(matOpts);
            materials.push(mat);
            const mesh = new THREE.Mesh(geom, mat);
            const pos = part.position || { x: 0, y: 0, z: 0 };
            mesh.position.set(pos.x || 0, pos.y || 0, pos.z || 0);
            if (part.rotation) {
                mesh.rotation.set(part.rotation.x || 0, part.rotation.y || 0, part.rotation.z || 0);
            }
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            group.add(mesh);
            if (part.animate === "water_wave") waveTargets.push(mesh);
        }
        seen.delete(blueprint.name);
        group.userData.kind = blueprint.name;
        group.userData.materials = materials;
        // Wasser-Animations-Hook: alle Wasser-Planes Sinus-wellen lassen.
        // baseY je Mesh cachen damit die Welle relativ zur Ausgangsposition
        // schwingt statt absolut zur 0.
        if (waveTargets.length > 0) {
            const captured = waveTargets.map((mesh) => {
                const positions = mesh.geometry.attributes.position;
                const baseY = new Float32Array(positions.count);
                for (let i = 0; i < positions.count; i++) baseY[i] = positions.getY(i);
                return { mesh, positions, baseY };
            });
            group.userData.animate = (t) => {
                for (const cap of captured) {
                    for (let i = 0; i < cap.positions.count; i++) {
                        const y = cap.baseY[i];
                        const wave = Math.sin(t * 4.5 + y * 1.5) * 0.12;
                        cap.positions.setZ(i, wave);
                    }
                    cap.positions.needsUpdate = true;
                }
            };
        }
        // Verbindungs-Linien nur am Top-Level (sonst doppelt bei Fraktal-Bauplänen). Farbe/Opacity folgen der
        // Lastformel (stark grün, ok goldgelb, schwach rot). Werkstatt-Werkzeug, kein Welt-Schmuck: nur mit
        // opts.connectionLines — depthTest:false zeichnete sonst über jedes gespawnte Werk.
        if (
            opts &&
            opts.connectionLines === true &&
            !depth &&
            Array.isArray(blueprint.connections) &&
            blueprint.connections.length > 0
        ) {
            this._addConnectionLines(group, blueprint);
        }
        // Ein EXPLIZIT gesetzter sitz-Anker trägt eine Sattel-Andeutung als Teil des Werks (Welt UND
        // Werkstatt); Linien/Marker/Ghost bleiben opts-bestellt. Top-Level only; children[i]↔parts[i] bleibt
        // heil (Anhang am ENDE, vom Preview-Mapping übersprungen).
        if (!depth && Array.isArray(blueprint.connections)) {
            const sitzConn = blueprint.connections.find(
                (c) => c && c.type === "sitz" && blueprint.parts && blueprint.parts[c.partA]
            );
            if (sitzConn) {
                const seat = this._buildSeatVisual(blueprint);
                if (seat) group.add(seat);
            }
        }
        return group;
    }

    // Sattel am sitz-Anker: Leder-Kissen + Pommel, reiter-skaliert (nicht mit dem Gefährt). Position =
    // exakt der _attachPointFor-Punkt, den auch der Reiter konsumiert.
    _buildSeatVisual(blueprint) {
        const ap = this._attachPointFor(blueprint, "sitz");
        if (!ap || !ap.point) return null;
        const grp = new THREE.Group();
        const leather = this._buildToonNodeMaterial({ color: 0x6b4a2f });
        const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.09, 0.46), leather);
        cushion.position.y = 0.045;
        grp.add(cushion);
        const pommel = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.1), leather);
        pommel.position.set(0, 0.1, 0.2);
        grp.add(pommel);
        grp.position.set(ap.point.x, ap.point.y, ap.point.z);
        grp.userData.isAttachmentVisual = true;
        grp.userData.connectionType = "sitz";
        return grp;
    }

    // Probesitzen in der Werkstatt: durchscheinender Reiter-Ghost in der _applySeatPose-Haltung am
    // sitz-Anker (opts-bestellt wie Linien/Marker) — zeigt Höhe + Richtung ohne Aufsteigen.
    _buildSeatGhost(point) {
        const grp = new THREE.Group();
        const mat = new THREE.MeshBasicMaterial({
            color: 0x9fd8ff,
            transparent: true,
            opacity: 0.3,
            depthWrite: false,
        });
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.5, 0.2), mat);
        torso.position.y = 0.62;
        grp.add(torso);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), mat);
        head.position.y = 1.0;
        grp.add(head);
        for (const side of [-1, 1]) {
            const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.12, 0.42), mat);
            thigh.position.set(side * 0.11, 0.32, 0.16);
            grp.add(thigh);
            const shin = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.36, 0.11), mat);
            shin.position.set(side * 0.11, 0.1, 0.34);
            grp.add(shin);
            const arm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.36, 0.09), mat);
            arm.position.set(side * 0.24, 0.62, 0.1);
            arm.rotation.x = -0.45;
            grp.add(arm);
        }
        grp.position.set(point.x, point.y, point.z);
        grp.userData.isConnectionLine = true; // Ablese-Werkzeug: vom Preview-Part-Mapping übersprungen
        grp.userData.isSeatGhost = true;
        return grp;
    }

    // Welle 6.F1 — Verbindungs-Linien an einen Bauplan-Group anhängen.
    _addConnectionLines(group, blueprint) {
        const conns = blueprint.connections || [];
        const parts = blueprint.parts || [];
        for (const c of conns) {
            const a = parts[c.partA];
            // Anker-Punkte (attachment, partB=-1) zeigen im Viewer einen violetten Mini-Oktaeder am exakten
            // Face-Snap-Punkt (Default = _attachPointFor, derselbe Punkt, den Hand/Reiter/Torso konsumieren).
            const typeDef = AnazhRealm.CONNECTION_TYPES[c.type];
            if (typeDef && typeDef.attachment) {
                if (!a) continue;
                const pa = a.position || { x: 0, y: 0, z: 0 };
                let px = pa.x || 0;
                let py = pa.y || 0;
                let pz = pa.z || 0;
                if (c.anchor && Number.isFinite(c.anchor.x) && Number.isFinite(c.anchor.y)) {
                    px += c.anchor.x;
                    py += c.anchor.y;
                    pz += c.anchor.z || 0;
                } else if (c.type === "sitz") {
                    py += Math.abs((a.size && a.size.y) || 0.3) / 2;
                }
                const anchorMarker = new THREE.Mesh(
                    new THREE.OctahedronGeometry(0.14, 0),
                    new THREE.MeshBasicMaterial({
                        color: 0xb06ad9,
                        transparent: true,
                        opacity: 0.95,
                        depthTest: false,
                    })
                );
                anchorMarker.position.set(px, py, pz);
                anchorMarker.renderOrder = 1000;
                anchorMarker.userData.isConnectionLine = true;
                anchorMarker.userData.connectionType = c.type;
                anchorMarker.userData.isAnchorPoint = true;
                group.add(anchorMarker);
                // Am sitz-Anker sitzt der Reiter-Ghost (Werkstatt-only, opts-bestellt).
                if (c.type === "sitz") {
                    group.add(this._buildSeatGhost({ x: px, y: py, z: pz }));
                }
                continue;
            }
            const b = parts[c.partB];
            if (!a || !b) continue;
            const pa = a.position || { x: 0, y: 0, z: 0 };
            const pb = b.position || { x: 0, y: 0, z: 0 };
            const strength = this.computeConnectionStrength(c, blueprint);
            const color = this._connectionColor(strength);
            // Die Linie verläuft zwischen Part-Zentren und steckt bei überlappenden Parts im Mesh — darum
            // depthTest:false + hoher renderOrder; der Mittelpunkt-Marker zeigt die Verbindung auch bei
            // voller Überlappung.
            const geom = new THREE.BufferGeometry();
            geom.setAttribute(
                "position",
                new THREE.Float32BufferAttribute([pa.x || 0, pa.y || 0, pa.z || 0, pb.x || 0, pb.y || 0, pb.z || 0], 3)
            );
            const mat = new THREE.LineBasicMaterial({
                color,
                transparent: true,
                opacity: 0.9,
                depthTest: false,
            });
            const line = new THREE.Line(geom, mat);
            line.renderOrder = 999;
            line.userData.isConnectionLine = true;
            line.userData.connectionStrength = strength;
            line.userData.connectionType = c.type;
            group.add(line);
            // Mittelpunkt-Marker — ein kleiner Oktaeder in der Lastfarbe.
            const marker = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.28, 0),
                new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.92, depthTest: false })
            );
            marker.position.set(
                ((pa.x || 0) + (pb.x || 0)) / 2,
                ((pa.y || 0) + (pb.y || 0)) / 2,
                ((pa.z || 0) + (pb.z || 0)) / 2
            );
            marker.renderOrder = 1000;
            marker.userData.isConnectionLine = true;
            marker.userData.connectionStrength = strength;
            marker.userData.connectionType = c.type;
            group.add(marker);
        }
        // Achsen-Geister: jedes erkannte Gelenk (computeMotionRoles) zeigt seine Dreh-Achse als Linie durch
        // den Anker. Nur im Viewer (opts.connectionLines), depthTest:false; try/catch — ohne Motion-Rollen
        // bleibt die Optik heil.
        try {
            const roles =
                Array.isArray(parts) && parts.length >= 2
                    ? this.computeMotionRoles(parts, blueprint.connections)
                    : null;
            if (roles) {
                const AXIS_VEC = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
                const ROLE_COL = { rad: 0x5fa7ff, tuer: 0x66ff88, wirbel: 0xffaa44, scharnier: 0xffe066 };
                for (let i = 0; i < roles.length; i++) {
                    const rl = roles[i];
                    if (!rl || !rl.joint || !rl.axis) continue;
                    const anc = rl.anchor || (parts[i] && parts[i].position) || { x: 0, y: 0, z: 0 };
                    const pSize = parts[i] && parts[i].size ? parts[i].size : { x: 1, y: 1, z: 1 };
                    const half = Math.max(0.5, (Math.max(pSize.x, pSize.y, pSize.z) || 1) * 0.85);
                    const v = AXIS_VEC[rl.axis] || AXIS_VEC.y;
                    const aGeom = new THREE.BufferGeometry();
                    aGeom.setAttribute(
                        "position",
                        new THREE.Float32BufferAttribute(
                            [
                                (anc.x || 0) - v[0] * half,
                                (anc.y || 0) - v[1] * half,
                                (anc.z || 0) - v[2] * half,
                                (anc.x || 0) + v[0] * half,
                                (anc.y || 0) + v[1] * half,
                                (anc.z || 0) + v[2] * half,
                            ],
                            3
                        )
                    );
                    const aCol = ROLE_COL[rl.role] || 0xb06ad9;
                    const aLine = new THREE.Line(
                        aGeom,
                        new THREE.LineBasicMaterial({ color: aCol, transparent: true, opacity: 0.95, depthTest: false })
                    );
                    aLine.renderOrder = 1001;
                    aLine.userData.isConnectionLine = true;
                    aLine.userData.isJointAxis = true;
                    aLine.userData.jointRole = rl.role;
                    aLine.userData.jointAxis = rl.axis;
                    aLine.userData.jointTeach = this._jointTeachLine(rl.role, rl.axis);
                    group.add(aLine);
                    // Pfeil-Spitze (kleiner Kegel) am +Ende der Achse → Richtung lesbar.
                    const tip = new THREE.Mesh(
                        new THREE.ConeGeometry(0.1, 0.26, 8),
                        new THREE.MeshBasicMaterial({ color: aCol, transparent: true, opacity: 0.95, depthTest: false })
                    );
                    tip.position.set(
                        (anc.x || 0) + v[0] * half,
                        (anc.y || 0) + v[1] * half,
                        (anc.z || 0) + v[2] * half
                    );
                    // Kegel zeigt per Default +Y; auf die Achse drehen.
                    if (rl.axis === "x") tip.rotation.z = -Math.PI / 2;
                    else if (rl.axis === "z") tip.rotation.x = Math.PI / 2;
                    tip.renderOrder = 1001;
                    tip.userData.isConnectionLine = true;
                    tip.userData.isJointAxis = true;
                    group.add(tip);
                }
            }
        } catch (_e) {
            throw this._stoffBruch("die Gelenk-Achsen der Verbindungslinien", _e);
        }
    }

    // Welle 6.F1+F2 — Farb-Mapping aus Verbindungs-Stärke (0..3-Skala der
    // computeConnectionStrength-Lastformel). <0.7 = Brech-Risiko (rot),
    // 0.7..1.5 = ok (goldgelb), ≥1.5 = stark (grün).
    _connectionColor(strength) {
        if (strength < 0.7) return 0xff5555;
        if (strength < 1.5) return 0xffcc44;
        return 0x66ff88;
    }

    // ═══ DAS WERK GEHORCHT DEM GESETZ IN DER WELT (Meisterkarte Bauen K3) ═══
    // Beim Setzen (die Wurzel `spawnArchitecture`: Bau-Modus, Satz, KI, Mitspieler, Reload) urteilt die EINE Statik —
    // `_workshopPhysicsVerdict`, dieselbe, die die Werkstatt zeigt, am Grund des Plans — über jedes Werk, dessen Form seine
    // Teile sind: was kippt, knickt oder Teile schweben lässt, stürzt in Ereignis-Zeit (`_tickWerkGesetz`) und bricht; was den
    // Grund nirgends berührt, fällt, landet und wird neu geurteilt (`boden`: sein tiefstes Teil). Der Spieler hört den Grund in
    // den Worten der Werkstatt. Was nur auf Rollen steht (`_rollableFraction` 1; ein Fahrzeug fährt nach seinem
    // Gesetz), rollt den Hang hinab; eine Mulde der Form (`_gefaessFassung`) fängt Regen und hält ihn. Ein Studio-Werk trägt
    // seine Form aus dem Gesetzbuch (seine Teile sind Spender-Substanz), Natur wurzelt. Befund: das Urteil fiel nur in der
    // Werkstatt — in der Welt stand der überlange Kragarm, die Brücke ohne Pfeiler schwebte.
    _werkGesetzSetzen(entry, bp, boden = 0) {
        if (
            !(Array.isArray(bp.parts) && bp.parts.length) ||
            this._istNatur(entry) ||
            this._foundryPresetForEntry(entry) ||
            typeof bp.studioGestalt === "string" ||
            this._foundryNeedsBookForType(entry.type)
        )
            return;
        const v = this._workshopPhysicsVerdict(bp, boden);
        const faellt = v.floatingParts.length === bp.parts.length;
        const grund = faellt
            ? "faellt"
            : v.floatingParts.length
              ? "schwebt"
              : v.lean >= 1
                ? "kippt"
                : v.buckles
                  ? "knickt"
                  : null;
        const name = String(bp.label || entry.type).split(/\s[·—(]/)[0];
        const g = { pose: { q: new THREE.Quaternion(), um: { x: 0, y: 0, z: 0 }, sinken: 0 } };
        if (grund) {
            const text = v.lines.find((l) => l.sev === "warn" && (grund !== "knickt" || /knickt/.test(l.text))).text;
            g.sturz = { grund, name, text, t: 0, w: 0, theta: 0, boden };
            if (faellt || grund === "schwebt") {
                // was schwebt, fällt, bis sein tiefstes Stück den Grund erreicht
                const unten = v.floatingParts.map((i) => this._partWorldAABB(bp.parts[i]).min.y);
                g.sturz.hoehe = Math.max(0, Math.min(...unten) - boden);
            } else {
                // um die Kante der Standfläche, über die der Schwerpunkt hängt (knickt: das Glied gibt nach, ein Hauch)
                const d = Math.hypot(v.leanDir.x, v.leanDir.z) > 1e-6 ? v.leanDir : { x: 1, z: 0 };
                const poly = this._supportPolygon(bp, boden);
                const kante = poly.hull.reduce((a, h) => (h.x * d.x + h.z * d.z > a.x * d.x + a.z * d.z ? h : a));
                const com = this._compoundCenterOfMass(bp).com;
                const ueber = (com.x - kante.x) * d.x + (com.z - kante.z) * d.z;
                Object.assign(g.sturz, {
                    achse: new THREE.Vector3(d.z, 0, -d.x),
                    hebel: Math.max(0.3, Math.hypot(ueber, com.y - poly.boden)),
                    phi0: Math.max(grund === "knickt" ? 0.08 : 0.01, Math.atan2(ueber, com.y - poly.boden)),
                });
                g.pose.um = { x: kante.x, y: poly.boden, z: kante.z };
            }
            this._spielerSagt(`${name}: ${text} — ${faellt ? "es fällt" : "es stürzt ein"}.`);
        } else {
            const rollen = [];
            if (!(entry.affordances && entry.affordances.moveable) && this._rollableFraction(bp, rollen) >= 1) {
                const achsen = new Set(
                    rollen.filter((p) => p.shape !== "sphere").map((p) => this._cylinderWorldAxis(p))
                );
                const boxen = rollen.map((p) => this._partWorldAABB(p));
                const r = Math.max(...boxen.map((a) => (a.max.y - a.min.y) / 2));
                if (achsen.size <= 1) g.roll = { achse: achsen.size ? [...achsen][0] : null, r, v: 0, stempel: null };
                const n = boxen.length;
                const mitte = (k) => boxen.reduce((s, a) => s + a.min[k] + a.max[k], 0) / (2 * n);
                g.pose.um = { x: mitte("x"), y: mitte("y"), z: mitte("z") };
            }
            g.gefaess = this._gefaessFassung(bp);
        }
        if (!g.sturz && !g.roll && !g.gefaess) return;
        entry._gesetz = g;
        (this._werkGesetzImTakt || (this._werkGesetzImTakt = new Set())).add(entry);
    }

    // Der Takt des Gesetzes (aus `tickAffordances`, Ereignis-Zeit `dt`): nur die Werke, die es trägt. Die Schwere ist die der
    // Welt (`state.gravity`, ein Wort des Spielers ändert sie).
    _tickWerkGesetz(dt) {
        const B = this._werkGesetzImTakt;
        if (!B || !B.size) return;
        const schwere = Number.isFinite(this.state.gravity) ? Math.max(0, -this.state.gravity) : 9.81;
        const wf = this._weatherFieldFor(this.state.weather);
        for (const e of B) {
            const g = e._gesetz;
            if (g.sturz) this._werkSturzSchritt(e, g, schwere, dt);
            else {
                if (g.roll) this._werkRollSchritt(e, g, schwere, dt);
                if (g.gefaess) this._gefaessSchritt(e, g.gefaess, wf, dt);
            }
        }
    }

    // Das Werk stürzt: es kippt um die Kante (φ'' = g/L · sin φ, φ der Winkel des Schwerpunkts über der Kante) oder fällt frei
    // (½ g t²), bis es liegt — dann bricht es (der Abbau ohne Stimme, die Zerstörung nennt sich im Journal). Was ganz fiel,
    // landet: sein tiefstes Teil ist der Grund, die Blocker ziehen mit, das Gesetz urteilt neu.
    _werkSturzSchritt(e, g, schwere, dt) {
        const s = g.sturz;
        const frei = s.grund === "faellt" || s.grund === "schwebt";
        s.t += dt;
        if (frei) g.pose.sinken = Math.min(s.hoehe, 0.5 * schwere * s.t * s.t);
        else {
            s.w += (schwere / s.hebel) * Math.sin(s.phi0 + s.theta) * dt;
            s.theta = Math.min(Math.PI / 2, s.theta + s.w * dt);
            g.pose.q.setFromAxisAngle(s.achse, s.theta);
        }
        this._werkPoseZeigen(e);
        if (frei ? g.pose.sinken < s.hoehe : s.theta < Math.PI / 2) return;
        const bp = this.state.blueprints && this.state.blueprints[e.type];
        if (s.grund === "faellt" && bp) {
            this._werkGesetzAus(e);
            delete e._gesetz;
            e.position.y -= s.hoehe;
            this._blockerBewegt(e);
            if (e.blockerAABBs) this._populateBlockerAABBs(e);
            this._werkGesetzSetzen(e, bp, s.boden + s.hoehe);
            return this._werkPoseZeigen(e);
        }
        this.removeArchitecture(e, { still: true });
        this.journalAppend("loss", AnazhRealm._datum`${s.name} stürzte ein: ${s.text}.`, {
            type: e.type,
            id: e.id,
            grund: s.grund,
        });
    }

    // Das Werk rollt: der Hang treibt es längs seiner Roll-Richtung (quer zur Achse; die Kugel die Falllinie hinab) mit
    // g · sin θ · k (k: was rollt statt dreht — Walze 2/3, Kugel 5/7), der Rollwiderstand des Fahr-Gesetzes (vehicle:FAHR
    // .rollDecel) hält es; es ruht, wo der Hang den Widerstand nicht überwindet, und bleibt am Wasser liegen. Der Boden ist der
    // unter dem Werk (`_werkBoden`), die Drehung um die Achse folgt dem Weg (φ = s / r).
    _werkRollSchritt(e, g, schwere, dt) {
        const R = g.roll;
        const boden = this._werkBoden(e);
        const { x, z } = e.position;
        const gx = boden(x + 0.5, z) - boden(x - 0.5, z);
        const gz = boden(x, z + 0.5) - boden(x, z - 0.5);
        const ry = Number.isFinite(e.rotationY) ? e.rotationY : 0;
        const [c, sn] = [Math.cos(ry), Math.sin(ry)];
        let pd = R.achse === "x" ? { x: 0, z: 1 } : R.achse === "z" ? { x: 1, z: 0 } : null;
        if (!pd) {
            const n = Math.hypot(gx, gz);
            if (!(n > 1e-6)) return;
            pd = { x: (-gx * c + gz * sn) / n, z: (-gx * sn - gz * c) / n };
        }
        const d = { x: pd.x * c + pd.z * sn, z: -pd.x * sn + pd.z * c };
        const steig = gx * d.x + gz * d.z;
        const kos = 1 / Math.sqrt(1 + steig * steig);
        const hang = -schwere * steig * kos * (R.achse ? 2 / 3 : 5 / 7);
        const halt = AnazhRealm._fahrSchrittGesetz().vc.FAHR.rollDecel * kos;
        if (R.v === 0 && Math.abs(hang) <= halt) return;
        R.v += hang * dt;
        R.v -= Math.sign(R.v) * Math.min(Math.abs(R.v), halt * dt);
        const nx = x + d.x * R.v * dt;
        const nz = z + d.z * R.v * dt;
        const ny = boden(nx, nz);
        if (!Number.isFinite(ny) || this._nassAt(nx, nz)) R.v = 0;
        if (R.v === 0) return;
        Object.assign(e.position, { x: nx, y: ny + 0.5, z: nz });
        const dq = this._werkPoseTmpQ || (this._werkPoseTmpQ = new THREE.Quaternion());
        const ax = (this._werkPoseTmpV || (this._werkPoseTmpV = new THREE.Vector3())).set(pd.z, 0, -pd.x);
        g.pose.q.premultiply(dq.setFromAxisAngle(ax, (R.v * dt) / R.r));
        this._blockerBewegt(e);
        if (e.blockerAABBs && !(R.stempel && Math.hypot(R.stempel.x - nx, R.stempel.z - nz) < 0.5)) {
            this._populateBlockerAABBs(e);
            R.stempel = { x: nx, z: nz };
        }
        this._werkPoseZeigen(e);
    }

    // DIE POSE DES WERKS (Sturz, Rollen): die Drehung `q` um den Punkt `um` und das Sinken, im Rahmen des Plans — nach
    // T · R_y · S der Instanz-Matrix (`_archEntryWorldMatrix`, der EINE Weg jedes Bilds des Werks).
    _werkPoseMal(entry, m) {
        const P = entry._gesetz.pose;
        const t = (this._werkPoseTmpM || (this._werkPoseTmpM = new THREE.Matrix4())).makeRotationFromQuaternion(P.q);
        const [e, u] = [t.elements, P.um];
        e[12] = u.x - (e[0] * u.x + e[4] * u.y + e[8] * u.z);
        e[13] = u.y - (e[1] * u.x + e[5] * u.y + e[9] * u.z) - P.sinken;
        e[14] = u.z - (e[2] * u.x + e[6] * u.y + e[10] * u.z);
        m.multiply(t);
    }
    _werkPoseZeigen(e) {
        if (e.mesh) this._werkWeltMatrix(e).decompose(e.mesh.position, e.mesh.quaternion, e.mesh.scale);
        else if (e.instanced) this._archInstanceUpdate(e);
        if (e._gesetz && e._gesetz.gefaess) this._gefaessWasserZeigen(e, e._gesetz.gefaess);
    }
    _werkWeltMatrix(e) {
        return this._archEntryWorldMatrix(e, this._werkPoseTmpW || (this._werkPoseTmpW = new THREE.Matrix4()));
    }
    // Der Abbau nimmt das Werk aus dem Takt des Gesetzes, sein Wasser mit.
    _werkGesetzAus(entry) {
        if (!entry._gesetz || !this._werkGesetzImTakt) return;
        this._werkGesetzImTakt.delete(entry);
        if (entry._gesetz.gefaess) this._gefaessLeeren(entry._gesetz.gefaess);
    }
    _gefaessLeeren(F) {
        if (F.mesh && this.state.scene) this.state.scene.remove(F.mesh);
        F.mesh = null;
    }

    // DIE MULDE DER FORM: die Teile als Zellen (je Achse ≤ 24, ihre Welt-Hüllen), von außen geflutet — Wasser läuft über
    // jede Seite und den Grund aus, nie nach oben (Prioritäts-Flut: je Zelle die niedrigste Schicht, über die sie ausläuft);
    // was darunter liegt, hält Wasser, was den Himmel sieht, fängt Regen. Eine Schale mit Loch, eine Platte, ein Turm fassen
    // nichts. → null oder { volumen (m³), flaeche (m², die offene Mulde), boden, rand (m im Plan), mitte, breite, tiefe }.
    _gefaessFassung(bp) {
        const boxen = bp.parts.map((p) => this._partWorldAABB(p)).filter(Boolean);
        const lo = { x: Infinity, y: Infinity, z: Infinity };
        const hi = { x: -Infinity, y: -Infinity, z: -Infinity };
        for (const a of boxen)
            for (const k of ["x", "y", "z"]) [lo[k], hi[k]] = [Math.min(lo[k], a.min[k]), Math.max(hi[k], a.max[k])];
        const c = Math.max(0.05, Math.max(hi.x - lo.x, hi.y - lo.y, hi.z - lo.z) / 24);
        const [nx, ny, nz] = ["x", "y", "z"].map((k) => Math.ceil((hi[k] - lo[k]) / c) + 2);
        const id = (i, j, k) => (j * nz + k) * nx + i;
        const fest = new Uint8Array(nx * ny * nz);
        const zellen = (a, k, n) => [
            Math.max(0, Math.ceil((a.min[k] - lo[k]) / c + 0.5)),
            Math.min(n - 1, Math.floor((a.max[k] - lo[k]) / c + 0.5)),
        ];
        for (const a of boxen) {
            const [[i0, i1], [j0, j1], [k0, k1]] = [zellen(a, "x", nx), zellen(a, "y", ny), zellen(a, "z", nz)];
            for (let j = j0; j <= j1; j++)
                for (let k = k0; k <= k1; k++) for (let i = i0; i <= i1; i++) fest[id(i, j, k)] = 1;
        }
        const aus = new Int16Array(fest.length).fill(32767);
        const eimer = Array.from({ length: ny }, () => []);
        for (let j = 0; j < ny; j++)
            for (let k = 0; k < nz; k++)
                for (let i = 0; i < nx; i++)
                    if ((j === 0 || i === 0 || k === 0 || i === nx - 1 || k === nz - 1) && !fest[id(i, j, k)])
                        ((aus[id(i, j, k)] = j), eimer[j].push(id(i, j, k)));
        for (let L = 0; L < ny; L++)
            for (let q = eimer[L]; q.length;) {
                const n = q.pop();
                if (aus[n] < L) continue;
                const [i, k, j] = [n % nx, Math.floor(n / nx) % nz, Math.floor(n / (nx * nz))];
                for (const [a, b, d] of [
                    [i - 1, j, k],
                    [i + 1, j, k],
                    [i, j - 1, k],
                    [i, j + 1, k],
                    [i, j, k - 1],
                    [i, j, k + 1],
                ]) {
                    if (a < 0 || b < 0 || d < 0 || a >= nx || b >= ny || d >= nz) continue;
                    const m = id(a, b, d);
                    const Lm = Math.max(L, b);
                    if (!fest[m] && Lm < aus[m]) ((aus[m] = Lm), eimer[Lm].push(m));
                }
            }
        let [zahl, offen, unten, rand] = [0, 0, Infinity, 0];
        const xz = { x0: Infinity, x1: -Infinity, z0: Infinity, z1: -Infinity };
        for (let k = 0; k < nz; k++)
            for (let i = 0; i < nx; i++) {
                let himmel = true;
                for (let j = ny - 1; j >= 0; j--) {
                    const n = id(i, j, k);
                    if (fest[n]) himmel = false;
                    else if (aus[n] > j && aus[n] < 32767) {
                        if (himmel) ((offen += 1), (himmel = false));
                        zahl++;
                        [unten, rand] = [Math.min(unten, j), Math.max(rand, aus[n])];
                        [xz.x0, xz.x1, xz.z0, xz.z1] = [
                            Math.min(xz.x0, i),
                            Math.max(xz.x1, i),
                            Math.min(xz.z0, k),
                            Math.max(xz.z1, k),
                        ];
                    }
                }
            }
        if (!offen) return null;
        const y = (j) => lo.y + (j - 1) * c;
        return {
            volumen: zahl * c * c * c,
            flaeche: offen * c * c,
            boden: y(unten),
            rand: y(rand),
            mitte: { x: lo.x + ((xz.x0 + xz.x1) / 2 - 0.5) * c, z: lo.z + ((xz.z0 + xz.z1) / 2 - 0.5) * c },
            breite: (xz.x1 - xz.x0 + 1) * c,
            tiefe: (xz.z1 - xz.z0 + 1) * c,
            wasser: 0,
            mesh: null,
        };
    }

    // Die Schale im Wetter: Regen füllt sie über ihre offene Mulde (GEFAESS.regenMproS × rain des Wetter-Felds), die Sonne
    // verdunstet sie (GEFAESS.verdunstenMproS × sun); was sie fasst, hält sie — sie läuft nur über.
    _gefaessSchritt(e, F, wf, dt) {
        const G = AnazhRealm.GEFAESS;
        const alt = F.wasser;
        F.wasser = Math.max(
            0,
            Math.min(F.volumen, alt + (wf.rain * G.regenMproS - wf.sun * G.verdunstenMproS) * F.flaeche * dt)
        );
        if (F.wasser !== alt) this._gefaessWasserZeigen(e, F);
    }
    // Der Spiegel in der Schale: eine Fläche über der Mulde auf der Höhe ihres Wassers, im Stoff des Wasser-Gesetzes (die
    // Farbe der flachen Schicht, Beer-Lambert exp(−wK · flach), `terrain:WASSER_GESETZ`); leer ist sie fort.
    _gefaessWasserZeigen(e, F) {
        if (!(F.wasser > 0) || !this.state.scene) return this._gefaessLeeren(F);
        if (!F.mesh) {
            if (!this._gefaessStoff) {
                const WG =
                    AnazhRealm.Gesetz("terrain:WASSER_GESETZ", null) ||
                    AnazhRealm._kernPflichtBruch("terrain:WASSER_GESETZ");
                const f = WG.wK.map((k) => Math.exp(-k * WG.flach));
                this._gefaessStoff = new THREE.MeshStandardNodeMaterial({
                    roughness: 0.06,
                    metalness: 0,
                    transparent: true,
                    opacity: WG.alpha[1],
                });
                this._gefaessStoff.color.setRGB(f[0], f[1], f[2], THREE.LinearSRGBColorSpace);
                this._leuchtStoff(this._gefaessStoff, null);
            }
            // EINE Fläche (1 × 1) für jede Schale, ihre Maße trägt die Matrix — nichts je Schale zu entsorgen
            const flaeche =
                this._gefaessFlaeche || (this._gefaessFlaeche = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2));
            F.mesh = new THREE.Mesh(flaeche, this._gefaessStoff);
            F.mesh.name = "gefaess-wasser";
            F.mesh.matrixAutoUpdate = false;
            F.mesh.userData.sharedMat = true;
            this.state.scene.add(F.mesh);
        }
        const hoehe = F.boden + (F.wasser / F.volumen) * (F.rand - F.boden);
        const T = (this._werkPoseTmpN || (this._werkPoseTmpN = new THREE.Matrix4())).makeScale(F.breite, 1, F.tiefe);
        T.setPosition(F.mitte.x, hoehe, F.mitte.z);
        F.mesh.matrix.multiplyMatrices(this._werkWeltMatrix(e), T);
        F.mesh.matrixWorldNeedsUpdate = true;
    }

    // VISUELLE Spanne (positions ± size); _compoundBBox (positions-only) unterschätzt z. B. einen 8 m
    // hohen Wasserfall. Für den greifbar-vs-groß-Schalter; O(parts), ignoriert Rotation.
    _compoundVisualExtent(bp) {
        if (!bp || !Array.isArray(bp.parts) || !bp.parts.length) return { dx: 0, dy: 0, dz: 0 };
        let minX = Infinity,
            minY = Infinity,
            minZ = Infinity,
            maxX = -Infinity,
            maxY = -Infinity,
            maxZ = -Infinity;
        for (const p of bp.parts) {
            const pos = p.position || { x: 0, y: 0, z: 0 };
            const sz = p.size || { x: 1, y: 1, z: 1 };
            const hx = Math.abs(sz.x || 1) / 2,
                hy = Math.abs(sz.y || 1) / 2,
                hz = Math.abs(sz.z || 1) / 2;
            const px = pos.x || 0,
                py = pos.y || 0,
                pz = pos.z || 0;
            if (px - hx < minX) minX = px - hx;
            if (px + hx > maxX) maxX = px + hx;
            if (py - hy < minY) minY = py - hy;
            if (py + hy > maxY) maxY = py + hy;
            if (pz - hz < minZ) minZ = pz - hz;
            if (pz + hz > maxZ) maxZ = pz + hz;
        }
        return { dx: maxX - minX, dy: maxY - minY, dz: maxZ - minZ };
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_bau_teile]);

// ===== ATLAS · Bau/teile — Außen-Konstanten =====
// ═══ DIE KLASSISCHEN ORDNUNGEN ═══
// Kodifizierte Tempel-Proportionen: WÄHLT man die Ordnung, folgt alles daraus (Schlankheit ·
// Kanneluren · Kapitell · Gebälk); `_buildClassicalTemple` leitet den Tempel ab.
// ionisch = Parameter-Tausch (schlanker, Basis, 24 Rillen).
AnazhRealm.CLASSICAL_ORDERS = Object.freeze({
    dorisch: Object.freeze({
        slenderness: 7, // Schaft-Höhe : unterer Durchmesser (dorisch 1:7-8 — die stärkste Ordnung)
        topRatio: 0.82, // oberer ⌀ / unterer ⌀ (die Verjüngung nach oben)
        entasis: 0.05, // konvexe Schaft-Wölbung (gegen die optische Täuschung — DAS dorische Detail)
        flutes: 20, // Kanneluren (dorisch 20, an scharfen Graten getroffen)
        fluteDepth: 0.05,
        hasBase: false, // dorisch: KEINE Basis — der Schaft steht direkt auf dem Stylobat
        intercolumniation: 2.25, // Achs-Abstand in Durchmessern
        columnsFront: 6, // hexastyle (die ikonische Front)
        marble: 0xddd6c4,
        capitalColor: 0xe4ddca,
    }),
    ionisch: Object.freeze({
        slenderness: 9, // schlanker (1:9)
        topRatio: 0.84,
        entasis: 0.035,
        flutes: 24, // ionisch 24, durch flache Stege getrennt
        fluteDepth: 0.06,
        hasBase: true, // ionisch: Profil-Basis
        intercolumniation: 2.4,
        columnsFront: 6,
        marble: 0xe6e0d2,
        capitalColor: 0xeae3d4,
    }),
});
// ═══ DIE OAKESHOTT-TYPOLOGIE ═══
// Gemessene Klingen-Referenz (Querschnitt · Länge · Hohlkehle · distale Verjüngung, Längen in m);
// `_buildBladedWeapon` leitet die Klinge ab, die Balance folgt aus den Massen. Die EINE Quelle ist
// schmiede-core.OAKESHOTT_TYPES (Getter-Delegat, fail-closed: kalter Kern → null, nie ein Nachbau).
Object.defineProperty(AnazhRealm, "OAKESHOTT_TYPES", {
    get() {
        const core = (typeof globalThis !== "undefined" && globalThis.__schmiedeCore) || null;
        return (core && core.OAKESHOTT_TYPES) || null;
    },
});

// === Compound-Tag-Affordances ===
// Die Welt leitet Verhaltens-Flags emergent aus Material × räumlicher Verteilung ab — KEINE
// Form-Whitelists, keine Bauplan-Namen-Tabelle:
//   moveable   — Stütz-Konfiguration (≥2 Parts in der unteren bbox-Hälfte) + dichte (Trägheit)
//                + Antriebs-Tag (magieleitung oder stromleitung)
//   magnifying — transparent ≥ Schwelle + Parts entlang einer Achse (axialer Aufbau)
//   focusing   — transparent + wärmeleitung (reine Tag-Sprache)
AnazhRealm.AFFORDANCE_THRESHOLDS = Object.freeze({
    moveable: Object.freeze({
        minSupportParts: 2, // ≥2 Parts in unterer bbox-Hälfte
        midlineFactor: 0.5, // unten = unter bbox-Mitte (relativ!)
        supportSpreadMin: 0.35, // V17.11 — Stütz-Parts spreizen ≥35 % der Breite
        //   (Trag-Basis: Räder/Beine quer) — eine schmale Säule (Baum-Stamm-
        //   Stapel, Spreizung ~0) ist KEIN Fahrzeug. Emergent, kein Form-Flag.
        dichteMin: 0.3, // Compound muss Trägheit haben
        antriebTagMin: 0.3, // magieleitung ODER stromleitung
    }),
    magnifying: Object.freeze({
        transparentMin: 0.5, // Compound transparent-Tag
        axialAlignmentMin: 0.6, // ≥60 % der Parts auf einer Linie
        minAxialParts: 2, // mind. 2 Parts für eine Achse
    }),
    focusing: Object.freeze({
        transparentMin: 0.5,
        wärmeMin: 0.3,
    }),
    // radiating: resoniert über Schwelle + radiale Spreizung (Parts nicht auf einer Achse). resoniertMin
    // = WORLD_EFFECT_THRESHOLDS.resonance_strong (1.5), dieselbe Schwelle, ab der die Symphonie
    // verdichtet — ein Stein-Dorf (~0.6) strahlt nicht, eine Quarz-Form (~1.8) schon.
    radiating: Object.freeze({
        minParts: 3, // ein Einzelteil hat keine Spreizung
        resoniertMin: 1.5, // das Compound schwingt STARK — es strahlt
        radialMax: 0.6, // axiale alignmentRatio UNTER 0.6 → radial, kein Mast
    }),
    // broadcasting: leitfähiger, aufrechter Mast (Relais) — axial entlang y + Leitfähigkeit.
    // Komplementär zu radiating: radialMax 0.6 ↔ alignMin 0.6 trennt radial von axial sauber.
    broadcasting: Object.freeze({
        minParts: 3, // ein Mast braucht mehrere Parts
        alignMin: 0.6, // ≥60 % der Parts auf der (vertikalen) Achse
        leitfaehigMin: 0.4, // stromleitung ODER magieleitung — es trägt ein Signal
    }),
    // W10 ext. — balancing: ein breites, bodenlastiges, schweres Compound
    // (Fundament). Breite Basis + tiefer Schwerpunkt + genuin schwer.
    balancing: Object.freeze({
        minParts: 3,
        wideMin: 1.0, // horizontale Spannweite ≥ vertikale (breiter als hoch)
        bottomHeavyMin: 0.6, // ≥60 % der Parts in der unteren bbox-Hälfte
        dichteMin: 1.5, // genuin schwer (= resonance_strong-Niveau, kein Gate-Tief)
    }),
    // W10 ext. — lifting: ein magie-geladenes, leichtes Compound (Auftriebs-
    // Feld). Stark magie-geladen + genuin leicht — das Komplement zu
    // balancing (dichteMax 1.0 ↔ balancing.dichteMin 1.5).
    lifting: Object.freeze({
        minParts: 3,
        magieMin: 1.5, // stark magie-geladen — es trägt die Hebe-Energie
        dichteMax: 1.0, // genuin leicht — Magie hebt kein Gewicht
    }),
    // bauen.K5 — sitzbar: die Sitzfläche 0,38–0,52 m über dem Fuß (die Norm des Sitzens, DIN EN 581-2: 0,40–0,48 m), ≥ 0,3 m
    // tief, auf ≥ 2 Stützen, die vom Boden bis ≤ 0,1 m unter sie reichen; das Werk ≤ 1,2 m hoch (ein Möbel).
    sitzbar: Object.freeze({
        minParts: 3,
        hoeheMin: 0.38,
        hoeheMax: 0.52,
        tiefeMin: 0.3,
        moebelMax: 1.2,
        minStuetzen: 2,
        bodenTol: 0.05,
        stuetzSpalt: 0.1,
    }),
});

// Substanz-Rolle: Schwellen für body (Seele aus Körper-Symmetrie) + food (Nahrung aus lebendig +
// weich). Bewusst KEIN 11. Material-Tag — Nahrung emergiert aus den bestehenden Tags.
AnazhRealm.SUBSTANCE_ROLE_THRESHOLDS = Object.freeze({
    body: Object.freeze({
        minParts: 3, // ein Körper hat mehrere Teile
        symmetryMin: 0.78, // Anteil Parts mit Spiegel-Partner (bilateral)
        minLimbPairs: 1, // ≥1 echtes Off-Achsen-Spiegel-Paar (Glieder)
        offAxisMin: 0.18, // |x − Zentrum| / spanX ab dem ein Part "Glied" ist
        mirrorTol: 0.35, // Spiegel-Such-Toleranz, relativ zur Compound-Größe
        verticalMin: 0.45, // Y-Spanne ≥ 45 % der horizontalen — ein Körper
        // "steht"; ein flaches Dorf (Hütten in der xz-Ebene) fällt raus.
        // Lebendige Masse in der Mitte: livingMassMin = Σ(vol·lebendig) > 0.02; livingCenterMinY/MaxY
        // klemmt den Y-Schwerpunkt der lebendigen Masse relativ zur Positions-BBox auf [0.25, 0.80]
        // (ein Körper liegt bei ~0.75; Pilz-Krone > 0.80 und Bodenflora < 0.25 fallen raus).
        livingMassMin: 0.02,
        livingCenterMinY: 0.25,
        livingCenterMaxY: 0.8,
    }),
    food: Object.freeze({
        lebendigMin: 0.6, // klar lebendig (Fleisch, Laub, Frucht)
        härteMax: 0.5, // weich genug zum Essen
    }),
    // Tor-Signatur: die begehbare Größe misst _avatarPassageSize an der Ausdehnung des Reisenden
    // (Drachen-Tor > Menschen-Tor). magieleitungMin: ein Tor leitet Magie — Stein-/Eisen-Ring bleibt
    // darunter, Quarz-Ring darüber.
    portal: Object.freeze({
        magieleitungMin: 1.3,
    }),
});

// Werkstatt-Domäne als Resonanz-Signaturen: je Domäne ein Vektor über die Material-Tags (negative
// Gewichte = Invers-Achsen); _computeWorkshopDomain nimmt das ARGMAX (`_blueprintResonance`), null
// unter dem Floor (trennt Werkstatt von bloßer Struktur). alchemy = durchsichtiges Gefäß · mechanism
// = strom-/wärme-leitender Apparat · soulwork = magie-leitender Kanal · forging = dichte, hitze-
// tragende Masse · textile = weicher, zäh-lebendiger Rahmen. Baseline eingefroren (checkBandV1767).
AnazhRealm.WORKSHOP_DOMAIN_SIGNATURES = Object.freeze({
    alchemy: Object.freeze({ transparent: 1.0 }),
    mechanism: Object.freeze({ stromleitung: 1.0, wärmeleitung: 0.2 }),
    soulwork: Object.freeze({ magieleitung: 1.0, resoniert: 0.2 }),
    forging: Object.freeze({ dichte: 1.0, wärmeleitung: 0.3 }),
    textile: Object.freeze({ zähigkeit: 1.0, lebendig: 1.0, härte: -1.0 }),
});
AnazhRealm.WORKSHOP_DOMAIN_RESONANCE_FLOOR = 2.0;
// DIE SCHALE IM WETTER (`_gefaessSchritt`): Regen füllt die offene Mulde um regenMproS × rain des Wetter-Felds (m Wasser je
// Sekunde, die Zeit des Spiels: ein Regen-Zug füllt eine Schale), die Sonne verdunstet ein Zehntel davon × sun.
AnazhRealm.GEFAESS = Object.freeze({ regenMproS: 0.005, verdunstenMproS: 0.0005 });
