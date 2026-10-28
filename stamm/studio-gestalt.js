class AnazhRealm_studio_gestalt {
    // ===== ATLAS · Studio/gestalt — Foundry-Gestalt · Gruppen · Bibliothek · Bereitschaft =====
    // DER GEFÜHLTE BAUM DER GESTALT (K20): zeichnet das Studio einen Baum oder Strauch (Rezept-Art tree/shrub), wächst sein
    // gefühlter Leib aus DERSELBEN Gestalt wie das Bild — die Gestalt des Eintrags (`_foundryGestaltFor`, V synchron aus dem
    // Kern wie beim Fels), die Prägung des Orts samt Besteller (`_foundryGestaltOv`: der Solitär trägt FREISTAND), das
    // Skelett, wie der Worker es baut (`_growTreeBlueprintRich` mit `gestalt`, L0). Gemerkt je Art, Gestalt und Prägung (je
    // Art höchstens V+1 Gestalten). Rückgabe: die Teile · false = kein Studio-Baum (der Bauplan ist das Bild) · null = die
    // Gestalt wartet auf ihren Ort (`entry._huelleWartet`; `_foundryGestaltFor` setzt die Hülle, sobald sie steht).
    _baumGestaltTeile(entry) {
        if (!entry || typeof entry.type !== "string" || !this._foundryEnabled()) return false;
        const tc = typeof globalThis !== "undefined" ? globalThis.__terrainCore : null;
        const tab = tc && tc.PHYTO_PRESETS;
        if (!tab) return false;
        const preset = this._foundryPresetForEntry(entry);
        const rec = preset ? tab[preset] : null;
        if (!rec || (rec.kind !== "tree" && rec.kind !== "shrub")) return false;
        entry._huelleWartet = false; // die eigene Frage löst die Hülle nicht erneut aus
        entry._huelleG = null;
        const g = this._foundryGestaltFor(entry, preset, AnazhRealm._studioGestaltenKern(preset));
        if (!Number.isInteger(g)) {
            entry._huelleWartet = true;
            return null;
        }
        entry._huelleG = g;
        const ov = this._foundryGestaltOv(preset, g, entry.studioOv);
        const k = preset + "|" + g + "|" + (ov ? JSON.stringify(ov) : "");
        if (!this._baumGestaltMerk) this._baumGestaltMerk = new Map();
        let teile = this._baumGestaltMerk.get(k);
        if (teile === undefined) {
            // der Welt-Name, unter dem die Art ihre Rezept-Zeile trägt (wie `_foundryPresetForEntry` sie fand)
            const art = [entry._lodSpecies, entry.type, (entry.type.match(/^grown_(baum_[a-z]+)/) || [])[1]].find(
                (s) => typeof s === "string" && this._foundryPresetFor(s) === preset
            );
            teile = art ? this._growTreeBlueprintRich(art, null, { lod: 0, gestalt: { g, ov } }) : null;
            this._lastTreeSkeleton = null;
            if (!Array.isArray(teile) || !teile.length)
                return AnazhRealm._kernPflichtBruch("terrain:skelettDerGestalt(" + k + ")");
            this._baumGestaltMerk.set(k, teile);
        }
        return teile;
    }

    // Ein Wartender der Streu-Scheibe meldet seine Zusage (der Zug eines Körpers, das Buch, die Karte, der Wald-Plan) — nur,
    // solange eine Region streut (`_streuSammler`); jeder andere Leser fragt wie bisher. Die Zusage trägt den Rang ihres
    // nächsten wartenden Lesers in der Region (`_foundryRang`/`_foundryNaeher` — derselbe Datensatz wie in der Pumpe): der Ort
    // der Zelle (`_streuZelleOrt`), ohne Zelle 0 (die Region selbst, im Bild). Der Wecker fragt mit ihm das Bild der Ankunft.
    _streuWartetAuf(zusage) {
        const s = this._streuSammler;
        if (!s || !zusage || typeof zusage.then !== "function") return;
        const wo = this._streuZelleOrt || 0;
        const rang = s.get(zusage);
        if (rang) this._foundryNaeher(rang, wo);
        else s.set(zusage, this._foundryRang(wo));
        this._streuZusagen = (this._streuZusagen | 0) + 1;
    }
    // DIE EINE PIPE: die EINE Reply-Mesh → THREE-Konversion (Pflanzen-Gruppen-Bau UND Kreatur-Ofen rufen
    // sie); null bei kaputtem Eintrag. `stage` (optional) = { lod, preset } trägt die Stufen-/SSE-Stempel
    // für die Dither-Blende, NUR unter dem foundryCrossfade-Gate; ohne `stage` Stempel 0 = ungemaskt.
    // Liest GENAU die Attribute aus FOUNDRY_LESEN (die Konsum-Wand der Transport-Schale) — sonst nichts.
    _foundryBuildMesh(m, baum) {
        if (!m || !m.position || !m.position.array) return null;
        // Defensiv: ein absurd grosser Puffer (>200k Verts/Teil) ist ein Transfer-Glitch
        // (kein echter Vorlagen-Baum hat das — LOD0 ~110k GESAMT) -> Teil ueberspringen.
        if (m.position.array.length > 600000) return null;
        const T = THREE;
        const geo = new T.BufferGeometry();
        geo.setAttribute("position", new T.BufferAttribute(m.position.array, 3));
        if (m.normal && m.normal.array) geo.setAttribute("normal", new T.BufferAttribute(m.normal.array, 3));
        const vcount = m.position.array.length / 3;
        if (m.color && m.color.array && m.color.array.length >= vcount * 3)
            geo.setAttribute(
                "color",
                new T.BufferAttribute(m.color.array, m.color.itemSize && m.color.itemSize <= 3 ? m.color.itemSize : 3)
            );
        else {
            // WebGPU-STRIKT: colorNode = attribute("color") verlangt das Attribut IMMER (sonst schwarz/Crash) →
            // fehlt die Vorlagen-Farbe, ein kind-Default (bark braun, laub grün). Zweit-Kern-Meshes (kind
            // "unknown") füllen mit ihrer Material-Farbe (m.mat.color, r128-linear); Pflanzen-kinds unberührt.
            // DIESELBE Regel füllt die Faltung des Budget-Gesetzes (phyto-core `budgetFuellFarbe`).
            const def = globalThis.__phytoCore.budgetFuellFarbe(m.kind, m.mat);
            const carr = new Float32Array(vcount * 3);
            for (let v = 0; v < vcount; v++) {
                carr[v * 3] = def[0];
                carr[v * 3 + 1] = def[1];
                carr[v * 3 + 2] = def[2];
            }
            geo.setAttribute("color", new T.BufferAttribute(carr, 3));
        }
        if (m.uv && m.uv.array) geo.setAttribute("uv", new T.BufferAttribute(m.uv.array, 2));
        // Das Schalen-Fell (V18.497) trägt seine Wurzel (Bind-Punkt der Haar-Maske) und die Schalen-Daten.
        for (const nm of ["aWurzel", "aSchale"])
            if (m[nm] && m[nm].array) geo.setAttribute(nm, new T.BufferAttribute(m[nm].array, m[nm].itemSize || 3));
        // Der Schatten-Teil (S3) trägt je Vertex, ob er deckt (Rinde 1) oder die Atlas-Alpha schneidet (Karte 0).
        if (m.aDeckt && m.aDeckt.array) geo.setAttribute("aDeckt", new T.BufferAttribute(m.aDeckt.array, 1));
        if (m.index) geo.setIndex(new T.BufferAttribute(AnazhRealm._indexSchmal(m.index, vcount), 1));
        if (!m.normal || !m.normal.array) geo.computeVertexNormals();
        // Attribut-Wand: unter foundryCrossfade lesen die geteilten foundry-Materialien aH0/aH0L/aLodLevel —
        // jeder Direkt-Konsument dieser Konversion (Kreatur-Ofen …) braucht sie, sonst warnt three je
        // RenderObject. Der Null-Stempel macht „0 = ungemaskt" physisch wahr (Bild gleich); der Gruppen-Bau
        // überschreibt mit echten Stufen-Werten.
        if (this.state && this.state.foundryCrossfade === true) {
            const _z = new Float32Array(vcount);
            geo.setAttribute("aLodLevel", new T.BufferAttribute(_z, 1));
            geo.setAttribute("aH0", new T.BufferAttribute(new Float32Array(vcount), 1));
            geo.setAttribute("aH0L", new T.BufferAttribute(new Float32Array(vcount), 1));
        }
        // Die Haut-Hülle reist geskinnt: trägt der Eintrag skinIndex/skinWeight, wird er ein SkinnedMesh
        // (Bindung in _ofenAssembleAsset, wenn die Bones stehen). skinIndex Float32 → Uint16 (WebGPU-strikt).
        let mesh;
        if (m.skinIndex && m.skinIndex.array && m.skinWeight && m.skinWeight.array) {
            const si = new Uint16Array(m.skinIndex.array.length);
            for (let v = 0; v < si.length; v++) si[v] = m.skinIndex.array[v];
            geo.setAttribute("skinIndex", new T.Uint16BufferAttribute(si, m.skinIndex.itemSize || 4));
            geo.setAttribute("skinWeight", AnazhRealm._hautGewicht(m.skinWeight.array, m.skinWeight.itemSize || 4));
            mesh = new T.SkinnedMesh(geo, this._foundryTreeMaterial(m.kind || "bark", m.mat || null));
        } else {
            mesh = new T.Mesh(geo, this._foundryTreeMaterial(m.kind || "bark", m.mat || null, false, baum || null));
        }
        mesh.castShadow = AnazhRealm._teilWirft(m);
        mesh.receiveShadow = true;
        // Die Look-Klasse steht am Mesh (das Fell-Bildschirm-Gesetz liest sie: Strähnen schweigen unter ½ px).
        if (globalThis.__phytoCore.budgetLook(m.kind)) mesh.userData.__klasse = m.kind;
        // DIE SIPPE (phyto-core `budgetSippe`, die EINE Verschmelz-Regel): Flatten und Ofen gruppieren nach ihr, das
        // Budget-Gesetz zählt mit ihr — null (Flügel, Haut) verschmilzt nie.
        mesh.userData.__sippe = globalThis.__phytoCore.budgetSippe(m);
        // V18.465 — das Tür-Scharnier reist ans Mesh (Umschlag out.tuer, additiv):
        // der Flatten hebt es aufs Leaf, die Instanz-Gruppe trägt es, der
        // Membran-Tick dreht die Flügel um die Hinge-Achse.
        if (m.tuer && typeof m.tuer.seite === "number") mesh.userData.__tuer = m.tuer;
        // WELLE L (Q13 F-D8) — das RAD reist ans Mesh (Umschlag out.rad, additiv): die Gestalt der Ecke 0 nabenrelativ,
        // `raeder` nennt jede Ecke — der Flatten setzt es je Ecke als Instanz, der Ritt dreht und lenkt sie.
        if (m.rad && Array.isArray(m.rad.raeder) && m.rad.raeder.length) mesh.userData.__rad = m.rad;
        // DER SCHATTEN-TEIL (S3, Umschlag out.teil, additiv): die Baum-L1 liefert ihren Wurf als eigenes Teil
        // (`teil: "schatten"`, Attribut aDeckt) — der Flatten legt es als Schatten-Zwilling in die Kaskaden.
        if (typeof m.teil === "string") mesh.userData.__teil = m.teil;
        return mesh;
    }
    // Die Welt-Höhe einer Foundry-Gruppe: y-Ausdehnung ihrer Vorlage × Preset-Welt-Skala (mindestens 0,1 m) — der
    // aH0-Stempel und das Höhen-Buch lesen DIESE Zahl. DIE SICHTHÖHE EINES BAUMS (K20): ohne den Hub seines Schafts (Beipack
    // `__mass`, phyto-core schaftHub) — die Stufen vereinfachen die Krone, und die wuchs in der Form-Höhe; die ganze Höhe
    // samt Schaft hielt jede Stufe weiter (Mess-Wiese 82 → 89 Befehle, die Tannen-L1 bis 67 statt 36 m). Ein Baum ohne
    // sein Maß ist ein KERN-PFLICHT-Bruch, nie die Höhe samt Schaft.
    _foundryGruppenHoehe(group, preset) {
        // gewachsen ist, was das Skelett-Gesetz baut (Rezept-Art Baum oder Strauch) — nicht jede Karten-Art (Wagen, Tor)
        const rec = preset && this._foundry && this._foundry.recipes ? this._foundry.recipes[preset] : null;
        let hub = 0;
        if (rec && (rec.kind === "tree" || rec.kind === "shrub")) {
            const m = group._mass;
            if (!m || !Number.isFinite(m.schaftHub))
                return AnazhRealm._kernPflichtBruch("phyto:__mass (" + preset + ")");
            hub = m.schaftHub;
            // die Krone reist mit jedem gewachsenen Körper (D10, das Kronen-Buch): ohne sie ist die Brücke alt
            const k = group._krone;
            if (!k || !(k.teile instanceof Float32Array) || (k.teile.length && !Array.isArray(k.farbe)))
                return AnazhRealm._kernPflichtBruch("phyto:__krone (" + preset + ")");
        }
        let minY = Infinity,
            maxY = -Infinity;
        for (const ch of group.children) {
            const pa = ch.geometry && ch.geometry.attributes.position ? ch.geometry.attributes.position.array : null;
            if (!pa) continue;
            for (let i = 1; i < pa.length; i += 3) {
                if (pa[i] < minY) minY = pa[i];
                if (pa[i] > maxY) maxY = pa[i];
            }
        }
        const wsM = preset ? this._foundryWorldScaleMatrix(preset) : null;
        const ws = wsM && wsM.elements ? wsM.elements[0] || 1 : 1;
        return maxY > minY ? Math.max(0.1, (maxY - minY - hub) * ws) : 0.1;
    }
    _foundryBuildGroup(meshes, stage) {
        if (!Array.isArray(meshes) || !meshes.length) return null;
        const T = THREE;
        let group = null;
        // die Wind-Daten der Art (K19): Rinde und Laub ihrer Gestalt tragen sie im Stoff (`_baumWindStoff`)
        const baum = stage && stage.preset ? this._baumWindDaten(stage.preset, meshes) : null;
        try {
            group = new T.Group();
            for (let qi = 0; qi < meshes.length; qi++) {
                const m = meshes[qi];
                // Beipack (`{ kind: "__…" }`, das Skelett der Kreatur) ist kein Mesh — der Ofen liest es vor dem Bau.
                // DIE EINE BEIPACK-KARTE (`FOUNDRY_BEIPACK`): jede Hülle des Gesetzbuchs hängt unter ihrem Namen an der
                // Gruppe — `__huelle` (Welle L: die Kollision der gezeigten Stufe), `__fern` (S3: die Fernform der Stufe 3,
                // der Welt-March liest sie über `_huelleVon`); der Flat reicht beide weiter.
                if (m && typeof m.kind === "string" && m.kind.startsWith("__")) {
                    const feld = AnazhRealm.FOUNDRY_BEIPACK[m.kind];
                    if (feld && m.huelle && typeof m.huelle === "object") group[feld] = m.huelle;
                    continue;
                }
                const mesh = this._foundryBuildMesh(m, baum);
                if (!mesh) continue;
                mesh.userData.__quelle = qi; // der Platz des Teils in der Lieferung (der Satz-Faden rechnet aus ihr)
                group.add(mesh);
            }
        } catch (_e) {
            throw this._stoffBruch("die Gruppe der Foundry-Lieferung", _e);
        }
        // DIE HÖHE EINES BAUM-KÖRPERS (Template-Höhe × Preset-Welt-Skala) — eine Eigenschaft des Körpers, auch ohne
        // Masken-Stempel: das Höhen-Buch (_foundryCacheSet) hält sie über jede Cache-Räumung.
        if (group && group.children.length && stage && stage.preset && this._foundryPresetIsTree(stage.preset))
            group._hoehe = this._foundryGruppenHoehe(group, stage.preset);
        if (group && group.children.length && this.state && this.state.foundryCrossfade === true) {
            // Stufen-/SSE-Stempel (das Attribut-Vokabular der Studio-Blende): aLodLevel = 1 (L0) · 2 (L1) · 3 (die
            // einzige Nah-Stufe einer Art ohne L0) · 0 (ungemaskt: Nicht-Baum-Kinds, wie das Studio-`vLod>0.5`-Gate);
            // aH0 = Welt-Sichthöhe der Gruppe (_foundryGruppenHoehe); aH0L = Blatt-Sichthöhe (Laub gekappt auf
            // LOD_DISTANCES.leafVisCap, Rinde aH0L == aH0). VOR der ersten Zeichnung stempeln (der Knoten-Bau liest
            // das Attribut-Layout).
            try {
                const _lodS = stage && Number.isFinite(stage.lod) ? stage.lod | 0 : null;
                const _isTree = !!(
                    stage &&
                    stage.preset &&
                    typeof this._foundryPresetIsTree === "function" &&
                    this._foundryPresetIsTree(stage.preset)
                );
                // Die L1-Maske blendet aus der L0 EIN — nur wo die Art eine L0 deklariert (kindStages). Eine Art ohne
                // L0 (bis Welle 6 der Strauch, [1, 2]) trägt nah die volle Gestalt in der L1, sie blendet nie ein
                // (gemessen 04.10., Werkbank, Mess-Wiese: ein Strauch auf 8,9 m zu 66 % durchsichtig, die L0-Hälfte der
                // Blende fehlte), aber im L1/L2-Band zum Billboard AUS (Stufe 3) — ungemaskt stand sie dort doppelt mit
                // dem Billboard und sprang am Bandende weg. Seit Welle 6 trägt der Strauch die Kette wie der Baum.
                // Dieselbe Regel von der anderen Seite: die L0 weicht der L1 (1) nur, wo die Art eine L1 deklariert; sonst
                // ist sie die einzige Nah-Stufe (3) und weicht nur der Karte, die jede Karten-Art trägt (KIND_POLICY.impostor,
                // `_foundryFlattenFor` baut sie vor der Stufen-Klammer). Wagen und Tore (kindStages [0]) trugen Stempel 1 und
                // dithern ab 8 m zu einer L1, die es nicht gibt — gemessen 06.10. (echte GPU, nur die Gestalt im Bild,
                // Leuchtdichte gegen die ungemaskte): GT bei 9,6 m 0,69, bei 12-45 m 0,08-0,15 — der eigene Wagen der
                // Verfolger-Kamera ein Geist, jeder geparkte Wagen und jedes Tor zwischen 12 m und dem Karten-Band fort.
                const _hat = (s) => this._foundryDeclaredStage(stage.preset, s) === s;
                const _aLodVal = !_isTree ? 0 : _lodS === 0 ? (_hat(1) ? 1 : 3) : _lodS === 1 ? (_hat(0) ? 2 : 3) : 0;
                const _h0 = this._foundryGruppenHoehe(group, stage && stage.preset);
                const _D = AnazhRealm.LOD_DISTANCES;
                const _capL = _D.leafVisCap;
                for (const ch of group.children) {
                    const _n = ch.geometry.attributes.position.count;
                    const _fk = ch.material && ch.material.userData ? ch.material.userData.foundryKind : null;
                    const _isFol = _fk === "foliage" || _fk === "foliageTex" || _fk === "grass";
                    const _h0L = _isFol ? Math.min(_h0, _capL) : _h0;
                    ch.geometry.setAttribute(
                        "aLodLevel",
                        new T.BufferAttribute(new Float32Array(_n).fill(_aLodVal), 1)
                    );
                    ch.geometry.setAttribute("aH0", new T.BufferAttribute(new Float32Array(_n).fill(_h0), 1));
                    ch.geometry.setAttribute("aH0L", new T.BufferAttribute(new Float32Array(_n).fill(_h0L), 1));
                }
            } catch (_eS) {
                // LAUT (K22): ohne Stempel liest der Blenden-Stoff aLodLevel 0 (ungemaskt), der Baum stünde doppelt mit
                // seiner Karte — der Bau bricht beim Namen, nie still ohne Stempel
                throw this._stoffBruch(
                    "die Stufen-Stempel aLodLevel · aH0 · aH0L (" + ((stage && stage.preset) || "?") + ")",
                    _eS
                );
            }
        }
        if (group && group.children.length) {
            // V4(B) — die Bilanz-Zahl (gebaute Foundry-Baum-Geometrien) für die Leck-Linse
            // (gegen `_geomDisposedCount`). Lazy-init, kein state.X-Feld.
            const _f = this._foundry;
            if (_f) _f._geomBuiltCount = (_f._geomBuiltCount || 0) + (group.children ? group.children.length : 0);
            return group;
        }
        return null;
    }
    // FOUNDRY-WARM — wartet auf ready+Buch (get-book Ingest). Spawn-Pfade (Dorf/Fahrzeug)
    // rufen ihn, statt bei kaltem Worker still null zu liefern.
    async _foundryAwaitBook(timeoutMs) {
        this._ensureAssetFoundry();
        const f = this._foundry;
        if (!f) return { ok: false, reason: "foundry_aus" };
        const budget = Number.isFinite(timeoutMs) ? timeoutMs : 45000;
        const t0 = performance.now();
        // das EREIGNIS des Buchs (`buchDa`), nie eine Uhr-Schleife; die Frist ist die Geduld des Rufers, ihr Ende meldet
        // er laut (FOUNDRY KALT am Dorf-Spawn)
        let frist = 0;
        await Promise.race([f.buchDa, new Promise((r) => (frist = setTimeout(r, budget)))]);
        clearTimeout(frist);
        if (f.ready && f.recipes && f.recipeCount > 0)
            return { ok: true, ms: Math.round(performance.now() - t0), recipeCount: f.recipeCount };
        return {
            ok: false,
            reason: "foundry_kalt",
            ready: !!f.ready,
            recipes: !!(f.recipes && f.recipeCount),
            vorrat: f._vorrat || false,
        };
    }
    // Studio-Arten mit KIND_POLICY.prefix (fahrzeug_/haus_/tor_/klinge_…): brauchen
    // das Buch — ohne Auto-Register gibt es keinen Blueprint → Spawn wäre tot/still.
    _foundryNeedsBookForType(type) {
        if (typeof type !== "string" || !type) return false;
        const KP = AnazhRealm.KIND_POLICY;
        for (const k in KP) {
            if (!Object.prototype.hasOwnProperty.call(KP, k)) continue;
            const pol = KP[k];
            if (!pol || !pol.prefix) continue;
            if (type.startsWith(pol.prefix) && pol.builtIn === false) return true;
        }
        return false;
    }
    _foundryLibrarySpec() {
        // Der Vorrat wärmt GENE, keine Körper ohne Leser: Boden-Arten ihre deklarierten Stufen je Gestalt; Karten-Arten
        // (Bäume, Strauch) wärmt er nicht — ihre Karte bestellt ihr Leser, L0/L1 lädt nah auf Abruf (_foundryFlattenFor +
        // _foundryLodForEntry). Der Vorrat läuft neben der Welt: kein Leser des ersten Frames wartet auf ihn (K30).
        return {
            species: [
                "eiche",
                "fichte",
                "tanne",
                "birke",
                "weide",
                "mammut",
                "findling",
                "basalt",
                "kristalle",
                "blume",
                "strauch",
                // 08.07. — DAS GRAS DOCKT AN (Schöpfer „zum hundertsten Mal: nicht dieselben
                // Gräser"): das echte Studio-gras-Asset in die Bibliothek — die EINE Halm-
                // Geometrie (N7.4: der Alt-Tuft-Bauer ist geschnitten); der Prefetch wärmt sie.
                "gras",
                // Auch Kiesel-Teppich (kiesel→geroell) + zacken/sediment vorwärmen — sonst läuft jede Streu-Zelle in
                // die Defer-Runde (Asset kalt → warten auf Refill) und der Unterwuchs erscheint erst nach ~60 s.
                "geroell",
                "zacken",
                "sediment",
            ],
            // Die Samen je Art sind ihre Gestalten 1..V (Studio-Budget `lod.budget.gestalten`, `_foundryGestalten`) —
            // genau die Körper, die `_foundryVariantFor` wählt; kein eigenes Samen-Literal.
            // FOUNDRY-WARM (Spawn-tot-Heilung): Garage-Fahrzeuge + Siedlung brauchen
            // warmes Buch/build-asset — sonst stirbt In-Welt-Spawn (fahrzeug_*/dorf)
            // als stilles Nichts. Wenige Seeds, lod 0 (vehicle kindStages = [0]). Sie wärmen NUR die Platte
            // (`_foundryVorrat`): vor dem ersten Spawn liest niemand ihre Körper.
            critical: {
                species: ["gt", "supersport", "limousine", "kompakt_fwd", "suv"],
                seeds: [1, 7],
                lods: [0],
            },
        };
    }
    async _foundryPrefetchLibrary() {
        const f = this._foundry;
        if (!f || !f.ready || f._vorrat) return;
        // DER VORRAT NACH DEM ERSTEN BILD (K30): bis der Ladeschirm weicht (`_weltbildDa`), gehört der Worker den Lesern des
        // ersten Frames — nahe Bäume, die Streu in Reichweite, die Karten der fernen Bäume. Bis K30 stellte sich der Vorrat
        // beim Worker-Start vor sie (je Boden-Art jede Gestalt, 10 Wagen, die Siedlungs-Probe), die Streu wartete in seiner
        // Schlange mit. Sein Merker `f._vorrat` nennt die PHASE (`VORRAT_PHASE`), nie nur „an": der Merker `_prefetching`
        // stand ab dem Worker-Start auf true, und die Kalt-Zeile las „Vorrat läuft", solange er auf das Bild wartete
        // (Radeon 8–44 s, die erste Bestellung bei 45 s). Der Null-Renderer setzt das Weltbild beim Renderer-Bau, dort
        // bestellt er sofort; false = durch (warm). Er wartet auf das EREIGNIS des Bildes (`_weltbildKommt`), nie auf die Uhr
        // (die Stoff-Wand: ein Bau, der in einer Schleife auf die Uhr wartet, ist ein Uhr-Deckel — die Integration von K30
        // auf K22-3 pollte `_weltbildDa` alle 200 ms).
        const PH = AnazhRealm.VORRAT_PHASE;
        f._vorrat = PH.wartet;
        await this._weltbildKommt();
        f._vorrat = PH.bestellt;
        const spec = this._foundryLibrarySpec();
        // Die Stufen je Art (kindStages) und die Gestalten-Budgets kommen mit dem Studio-Buch: der Vorrat wartet auf sein
        // EREIGNIS (`buchDa`), nie auf die Uhr. Bis K22 (Nachbesserung 4) wartete er 2 s und wärmte danach ohne Rezepte
        // (FOUNDRY WARM: fünf kritische Presets fehlen, kein Boden-Vorrat); die Regionen bauen erst nach dem Vorrat.
        await f.buchDa;
        // Paralleler Saug: ALLE Anfragen feuern SOFORT (der Worker arbeitet seine serielle Queue Rücken an
        // Rücken ab) statt await je Asset (Worker idle zwischen Antworten). Post kostet den Main-Frame nichts.
        const jobs = [];
        for (const sp of spec.species) {
            // Karten-Arten (Bäume, Strauch: KIND_POLICY impostor) wärmen KEINE Geometrie — ihre Fernstufe IST die Karte
            // (`_foundryFlattenFor` lenkt lod ≥ 2 auf sie), L0/L1 lädt nah auf Abruf. Bis V18.526 bestellte der Vorrat
            // je Art L2-Geometrie, die kein Leser las (headless 56 Aufträge, ~38 MB je Boot).
            if (this._foundryPresetIsTree(sp)) continue;
            // Boden-Arten wärmen EXAKT ihre deklarierten Stufen (kindStages — Gras [1,2], Blume [0,2], Fels [0]; ohne Daten
            // [2,0]) → der nahe Streu-Pass findet seine Stufe warm.
            const _lods = this._foundryKindStages(sp) || [2, 0];
            const _V = this._foundryGestalten(sp);
            if (!_V) this.log(`FOUNDRY VORRAT: ${sp} ohne Gestalten-Budget im Buch — kein Vorrat`, "WARN");
            for (let sd = 1; sd <= _V; sd++) {
                for (const lod of _lods) {
                    const key = this._foundryKoerperKey(sp, sd, lod);
                    if (f.cache.has(key)) continue;
                    // der EINE Zug je Körper-Schlüssel (`_foundryZug`): ein Leser, der den Körper im Flug des Vorrats braucht,
                    // hängt sich an, statt ihn ein zweites Mal zu bestellen (bis 15.10. bestellte der Vorrat am Zug vorbei;
                    // gate:v1-pfad V-D3 Vorrat); ein Ablauf cacht nie null, die Art bleibt auf Abruf nachfragbar.
                    jobs.push(
                        this._foundryZug(key, sp, sd, lod).catch((e) =>
                            this._stoffBruch("die Bibliothek (Vorab-Bau " + key + ")", e)
                        )
                    );
                }
            }
        }
        // Keine Karte im Vorrat: die Karte bestellt ihr Leser (`_foundryBuildImpostorFlat`, mit Bedarf-Stempel nah zuerst) —
        // bis K30 bestellte der Vorrat je Baum-Art jede Gestalt (11 Karten nach der Buchgröße), und das erste Weltbild wartete
        // auf jede (die Karten-Schlange).
        await Promise.all(jobs);
        // FOUNDRY-WARM — kritische Studio-Arten (Garage) + Siedlungs-Kanal: In-Welt-Spawn
        // von fahrzeug_*/dorf trifft warmes Memo statt kalt-404. Fail-closed: leerer
        // Settlement-Probe → lautes ERROR (kein stilles „Dorf tot").
        const crit = spec.critical || { species: [], seeds: [7], lods: [0] };
        const critJobs = [];
        for (const sp of crit.species || []) {
            if (!(f.recipes && f.recipes[sp])) {
                this.log(`FOUNDRY WARM: kritisches Preset „${sp}" fehlt im Buch`, "ERROR");
                continue;
            }
            for (const sd of crit.seeds || [7]) {
                for (const lod of crit.lods || [0]) {
                    if (f.cache.has(this._foundryKoerperKey(sp, sd, lod))) continue;
                    critJobs.push(
                        this._foundryVorrat(sp, sd, lod)
                            .then((warm) => {
                                if (!warm)
                                    this.log(
                                        `FOUNDRY WARM: Vorrat(${sp}|${sd}|lod${lod}) ohne Antwort — Spawn riskiert kalt-404`,
                                        "ERROR"
                                    );
                            })
                            .catch((e) => {
                                this.log(`FOUNDRY WARM: Vorrat(${sp}) warf (${e && e.message})`, "ERROR");
                            })
                    );
                }
            }
        }
        await Promise.all(critJobs);
        try {
            const plan = await this._foundryRequestSettlement({ seed: 7, nH: 4 });
            f._settlementWarm = !!(plan && Array.isArray(plan.slots) && plan.slots.length);
            if (!f._settlementWarm) {
                this.log("FOUNDRY WARM: export-settlement Probe LEER — Dorf-Spawn bleibt fail-closed laut", "ERROR");
            } else {
                this.log(`FOUNDRY WARM: Settlement-Kanal bereit (${plan.slots.length} Probe-Slots)`, "INFO");
            }
        } catch (e) {
            f._settlementWarm = false;
            this.log(`FOUNDRY WARM: Settlement-Probe warf (${e && e.message})`, "ERROR");
        }
        f._warmCritical = true;
        f._vorrat = false;
        // Die Bibliothek steht jetzt — cold-gebliebene Foundry-Baum-Eintraege (waehrend des
        // Prefetch gespawnt) AKTIV neu bauen, statt auf den budget-gedrosselten Culling-Tick zu
        // hoffen (unter Last baut der NICHTS -> die Baeume blieben cold).
        this._foundryRewarmColdTrees();
    }
    // DOCK-PEEK (nicht-triggernd): ist das Studio-Asset für den AKTUELLEN LOD dieses Eintrags gedockt
    // (Cache/Atlas-Zelle)? Rein lesend, löst KEINEN Bake aus (anders als `_foundryFlattenFor`) → der
    // Rewarm entscheidet vor dem Platzieren: gedockt → billige Instance, sonst Bake-Anfrage (limitiert).
    // Die LOD-Wahl spiegelt `_rebuildArchitectureMesh`/`_foundryFlattenFor` (kalt → Distanz-LOD).
    _foundryEntryReady(entry, preset) {
        const cold = !entry.instanced && !entry.mesh;
        const lod = cold
            ? this._foundryLodForEntry(entry)
            : Number.isFinite(entry._lodLevel)
              ? entry._lodLevel
              : this._foundryLodForEntry(entry);
        return this._foundryStufeBereit(entry, preset, lod);
    }
    // Platziert `_rebuildArchitectureMesh` diesen KALTEN Eintrag jetzt — ist seine Wunsch-Stufe gedockt oder, bei einem
    // Baum, seine Karte als Brücke? Dann ist das Platzieren ein Slot, kein Bau (tickArchitectureCulling).
    _foundryPlatzBereit(entry, preset) {
        if (this._foundryEntryReady(entry, preset)) return true;
        return (
            this._foundryPresetIsTree(preset) &&
            this._foundryLodForEntry(entry) < 2 &&
            this._foundryStufeBereit(entry, preset, 2)
        );
    }
    // Der Dock-Peek EINER Stufe (rein lesend, kein Bake): liegt Stufe `lod` dieses Eintrags gedockt bereit? Der
    // Eintrags-Peek oben fragt seine Wunsch-Stufe, die Brücke (`_rebuildArchitectureMesh`) die Karte.
    _foundryStufeBereit(entry, preset, lod) {
        const f = this._foundry;
        if (!f || !preset) return false;
        const variant = this._foundryGestaltFor(entry, preset);
        if (variant == null) return false;
        if (!Number.isFinite(lod) || lod < 0) lod = 0;
        if (lod > 2) lod = 2;
        // Baum-Fernstufe = die Karte (die Zelle im EINEN Atlas), nicht die Cache-Geometrie. Gestempelt: „gedockt"
        // erst, wenn SEINE ov-Karte gebacken ist (sonst baut der Rewarm die geprägte Geometrie).
        if (lod >= 2 && this._foundryPresetIsTree(preset)) {
            const key = "fimp:" + this._foundryKartenKey(preset, variant, this._artifactStudioOv(entry));
            const z = this._kartenAtlas ? this._kartenAtlas.zellen.get(key) : null;
            // T1 BLOB-TOD-Spiegel: mit echtem Renderer ist „gedockt" erst die GEBACKENE Schicht — bis dahin liefert der
            // Flatten für die Baum-Fernstufe nichts (`_foundryBuildImpostorFlat` → false), nie Geometrie. Bis 04.10. fiel
            // der Peek hier auf den L2-Geometrie-Schlüssel durch und sagte „gedockt", wo nichts kam: die Nah-Linse nannte
            // 172 Takte lang „gedockt, noch nicht platziert".
            const rendP = this.state && this.state.renderer;
            const echt = !!(rendP && !rendP._isHeadlessNull);
            return !!(z && !z.gescheitert && z.frame && (z.gebacken || !echt));
        }
        // Der Peek ruft die EINE Stufen-Klammer des Flattens (`_foundryServierStufe`) — sonst fragt er einen Key ab,
        // den der Flatten nie baut (falsch „kalt"). Bis 04.10. klemmte er nur Bäume: ein Fels (kindStages [0]) in 40 m
        // fragte L2, der Flatten servierte L0 — der Peek sah „lädt", die Platzierung lief über das Bau-Budget.
        lod = this._foundryServierStufe(preset, lod);
        // PRÄGUNG-WELT — der Dock-Peek spiegelt den Flatten-Schlüssel: ein gestempelter
        // Eintrag ist erst „gedockt", wenn SEIN Unikat (|ov:-Key) im Cache liegt — sonst
        // urteilte der Rewarm „ready" über das falsche (ungeprägte) Asset.
        const key = this._foundryKoerperKey(preset, variant, lod, this._artifactStudioOv(entry));
        return f.cache.has(key) && f.cache.get(key) != null;
    }
    // `menge`: die Einträge, die er fragt — der Cull reicht seine wachen (`_cullWache`: jeder Kalte und Klassische der
    // Mesh-Zone wacht), sonst der Bestand.
    _foundryRewarmColdTrees(menge) {
        // Regime-Quelle = `_foundryEnabled`: Foundry aus → Rewarm ist No-op (sonst läuft er im Gate-Hook-
        // Fenster mit, Burst über dem Cull-Budget). `!f || !f.ready` unten deckt jeden foundry-losen Zustand.
        // Rückgabe: die Zahl der Kandidaten (kalt oder vor dem Studio platziert) — die Stand-Wache des Culling-Takts hält
        // sich wach, solange einer wartet; ein Platzieren regt die Welt.
        if (!this._foundryEnabled()) return 0;
        // Die Foundry wartet aufs Terrain: baute in DIESEM Frame ein Terrain-Chunk, konvergiert sie nicht
        // (terrain-first wie der scatterDeco-Job) — der Boot-/Streaming-Fill bleibt leicht.
        // Ohne Urteil (der Bau wartet) bleibt der Cull-Gang wach: 1 Wartender, bis die Terrain-zuerst-Regel den Scan trägt.
        if (this._dekoWartet()) return 1;
        const f = this._foundry;
        if (!f || !f.ready) return 0; // erst wenn das Studio antwortet (sonst wuerde jeder Eintrag verhungern)
        const archs = menge || this.state.architectures;
        if (!archs) return 0;
        const pm = this.state.playerMesh ? this.state.playerMesh.position : null;
        const rad = this.state.architectureCullingRadius || 200;
        const radiusSq = rad * rad;
        // Zwei Budgets, nie 0: gedockte Assets sind billige WebGPU-Instances → placeBudget (gesund
        // FOUNDRY_PLACE_PER_TICK, über Budget 1); nicht gedockte lösen Bakes aus → bakeBudget (limitiert).
        // Eine harte overBudget-Wand verhungert die Aktivierung auf schwacher HW — progressiv konvergiert
        // die Welt immer zum Foundry-Wald, unter Last nur langsamer.
        const overBudget = this.state._frameOverBudget;
        let placeBudget = overBudget ? 1 : AnazhRealm.FOUNDRY_PLACE_PER_TICK;
        // Backen auch über Budget (2/Tick): der Bake läuft OFF-THREAD im Worker, die Anfrage ist ein billiger
        // postMessage; nur das Platzieren bleibt placeBudget-begrenzt. Ein 0-Throttle ließe die nahen
        // LOD0/1-Bäume unter Last nie backen (kahle Nähe).
        let bakeBudget = overBudget ? 2 : AnazhRealm.FOUNDRY_BAKE_REQ_PER_TICK;
        // NAH ZUERST (Lehre 16): die Budgets gehen an die nächsten Kandidaten, nie in Listen-Reihenfolge an ferne
        // Altbauten (Befund 30.09.: die Mesh-Zone konvergierte vom Listenanfang her, der Baum vor der Kamera wartete).
        const kand = this._rewarmKand || (this._rewarmKand = []);
        kand.length = 0;
        // Die billigen Filter zuerst (Lehre 25: der Scan läuft je Frame über JEDEN Eintrag): schon foundry-platziert,
        // dann die Distanz, erst dann die Preset-Auflösung (sie baut je Ruf ihre Namens-Tafel) — eingeschwungen fragt
        // der Scan nur noch die Ungeplatzten der Mesh-Zone (gemessen 05.10., echte GPU, Mess-Wiese, 1563 Einträge:
        // 1563 → 87 Auflösungen je Scan).
        for (const entry of archs) {
            if (!entry) continue;
            if (!(!entry.instanced && !entry.mesh) && entry.instFoundry) continue; // schon foundry-platziert
            let d2 = 0;
            if (pm) {
                const dx = entry.position.x - pm.x;
                const dz = entry.position.z - pm.z;
                d2 = dx * dx + dz * dz;
                if (d2 > radiusSq) continue;
            }
            // Die Eignung liest die BASIS-Art (`_foundryPresetForEntry` — `entry._lodSpecies`), NICHT
            // `entry.type` (das bei Wald-Varianten `grown_..._v` ist, im Preset-Map NICHT steht).
            if (!this._foundryPresetForEntry(entry)) continue;
            entry._rewarmD2 = d2;
            kand.push(entry);
        }
        kand.sort((a, b) => a._rewarmD2 - b._rewarmD2);
        for (const entry of kand) {
            if (placeBudget <= 0 && bakeBudget <= 0) break;
            const preset = this._foundryPresetForEntry(entry);
            const cold = !entry.instanced && !entry.mesh;
            const classic = !cold && !entry.instFoundry;
            const ready = this._foundryEntryReady(entry, preset);
            if (ready) {
                // GEDOCKT → billiger deterministischer WebGPU-Instance (viele/Tick im Leerlauf).
                if (placeBudget <= 0) continue;
                if (classic) {
                    if (entry.instanced) this._archInstanceRemove(entry);
                    else if (entry.mesh) this._cullArchitectureMesh(entry);
                }
                this._rebuildArchitectureMesh(entry);
                this._bauRegt(); // die Gestalt dockte an: Stufen-Wahl und Cull gehen
                placeBudget--;
            } else if (cold) {
                // NICHT gedockt → EINE Studio-Bake-Anfrage anstoßen (der Eintrag bleibt kalt, bis das
                // Asset andockt → dann platziert ihn der nächste Rewarm billig). Streng limitiert.
                if (bakeBudget <= 0) continue;
                this._rebuildArchitectureMesh(entry); // löst _foundryFlattenFor → _foundryRequest aus
                bakeBudget--;
            }
            // classic + nicht ready: der klassische Look bleibt sichtbar, bis das Asset andockt (kein Pop).
        }
        return kand.length;
    }
    // `_foundryFlattenFor` (unten): Eintrag → Instancing-Leaves aus der echten Vorlagen-Geometrie, je
    // Art:Gestalt:LOD:Teil ein leafKey im BESTEHENDEN HISM; null solange das Asset lädt (Tick baut nach).
    // DIE GESTALT eines Samens (V18.527): eine von V Gestalten je Art, V aus dem Studio-Budget
    // (`PORTAL_RENDER_CONFIG.lod.budget.gestalten` über das Buch — eiche/fichte/birke/tanne 2 · weide/mammut/strauch 1 ·
    // '*' 16; seit W8 zählt jeder Zweit-Kern die Gestalten SEINER Rezepte selbst, gemergt am Ingest — seit S3 nur
    // verschiedene Individuen: Haus 16 · Fahrzeug 8 (je Lack eine) · Tor/Klinge/Körper/Tier 1, seed-invariant; die
    // Gestalten-Wand in gate:asset-contract), dieselben Zahlen, mit denen der Studio-Wald pflanzt. Die Wahl liest die HOHEN Hash-Bits (h·V / 2³²): das
    // alte `h % 16` hing an den unteren Bits, die im Baum-Raster periodisch laufen — dieselbe Gestalt 16 Zellen weiter
    // mit 0,339 statt 1/16 (ein Klon-Gitter mit 54 m Periode). Ohne Buch null: der Aufrufer deferriert, nie eine
    // geratene Zahl. Gleicher Same = gleicher Baum, scale/yaw/tint je Instanz.
    // `Vk` (optional): die Gestalten-Zahl aus dem Kern (`_studioGestaltenKern`) — der Blocker eines Fels-Werks wählt seine
    // Gestalt synchron am Spawn, das Bild mit der Zahl des Buchs (für die Fels-Arten dieselbe; gate:kollision-bild misst es).
    _foundryVariantFor(seed, preset, Vk) {
        const V = Number.isInteger(Vk) && Vk >= 1 ? Vk : this._foundryGestalten(preset);
        if (!V) {
            // Buch kalt: die streuende Region wartet auf es (ein offenes Buch ohne Gestalten-Zeile ist keine Zusage)
            const f = this._foundry;
            if (f && !(f.ready && f.recipes)) this._streuWartetAuf(f.buchDa);
            return null;
        }
        const h = Math.imul(seed >>> 0 || 0, 2654435761) >>> 0; // Knuth-Mix
        return 1 + Math.floor((h * V) / 4294967296);
    }
    // DIE GESTALT DES ORTS (K20, nordstern §4.5: „die Gestalt folgt dem Ort, nicht der Art allein"): eine Baum-Art mit V ≥ 2
    // Bestand-Gestalten (budget.gestalten) trägt DAZU ihren Solitär als Gestalt T = V+1 (phyto-core `solitaerGestalt`,
    // gebaut mit FREISTAND_OV — growSkeleton: kein Schaft-Hub, der gedrungene Stamm); der Bestand behält 1..V (kein Klon).
    // Der EINE Leser je Worker-Naht (`_foundryRequest`, `_foundryBakeImpostorRequest`): jeder Körper und jede Karte der
    // Gestalt T ist der Solitär — auch unter der Prägung eines Bestellers (`ov`, die Regler der Werkstatt, die Wald-
    // Overrides): die Prägung des Orts tritt DAZU, sie ersetzt sie nie (ein geprägter Solitär wuchs sonst als Bestand).
    // Rückgabe: die vereinte Prägung, null ohne jede (ein leeres ov ist keine).
    _foundryGestaltOv(preset, gestalt, ov) {
        let hat = ov && typeof ov === "object" && Object.keys(ov).length ? ov : null;
        // Der Same eines Studio-Werks (`__gestalt`, der Übergabe-Kanal) wählt die Gestalt (`_foundryGestaltFor`) und reist als
        // seed — nie im ov zum Kern.
        if (hat && "__gestalt" in hat) {
            hat = Object.assign({}, hat);
            delete hat.__gestalt;
            if (!Object.keys(hat).length) hat = null;
        }
        const T = this._foundryGestalten(preset);
        if (!(T >= 2 && gestalt === T && AnazhRealm._solitaerVon(preset, T - 1) === T)) return hat;
        return hat ? Object.assign({}, hat, AnazhRealm.FREISTAND_OV) : AnazhRealm.FREISTAND_OV;
    }
    // DIE GESTALT EINES EINTRAGS (K20), der EINE Leser: ein Baum mit Lage fragt die Gestalt seines Orts (`_ortGestaltSame`),
    // sein Same bleibt; null = sie wartet (wie auf ein kaltes Buch). Ein Datensatz ohne Lage trägt den Samen seines Orts schon.
    // `Vk` (optional) reicht die Gestalten-Zahl des Kerns durch (der gefühlte Baum fragt synchron, `_baumGestaltTeile`). Die
    // Hülle folgt der Gestalt: wartete sie oder wechselte die Gestalt des Orts, fühlt der Baum neu (`_populateBlockerAABBs`).
    _foundryGestaltFor(entry, preset, Vk) {
        // DAS WERK EINES STUDIOS trägt seinen Samen im Stempel (`studioOv.__gestalt`, der Übergabe-Kanal): es steht in der
        // Gestalt, die die Bühne zeigte — vor dem Ort und dem Samen des Setzens.
        const werk = entry && entry.studioOv && entry.studioOv.__gestalt;
        if (Number.isInteger(werk) && werk >= 0) return werk;
        const p = entry && entry.position;
        if (!p) return this._foundryVariantFor(entry ? entry.seed : 0, preset, Vk);
        const krone = AnazhRealm.FOREST.crown[entry._lodSpecies || entry.type];
        const same = this._ortGestaltSame(p.x, p.z, krone > 0 ? krone * (entry.scale || 1) : 0, entry.seed, preset);
        const g = same === null ? null : this._foundryVariantFor(same, preset, Vk);
        if (Number.isInteger(g) && (entry._huelleWartet || (entry._huelleG != null && entry._huelleG !== g)))
            this._populateBlockerAABBs(entry);
        return g;
    }
    // Die Gestalten-Zahl einer Art, wie der Wirt sie bedient: die Bestand-Gestalten der Budget-Zeile (sonst '*'), dazu der
    // Solitär einer Baum-Art (`_solitaerVon`: Gestalt V+1); 0 = Buch kalt. Der Vorrat wärmt 1..T, je Gestalt EINE Karte.
    _foundryGestalten(preset) {
        const cfg = AnazhRealm._studioRenderConfig;
        const G = cfg && cfg.lod && cfg.lod.budget ? cfg.lod.budget.gestalten : null;
        if (!G) return 0;
        const V = Number.isInteger(G[preset]) && G[preset] >= 1 ? G[preset] : G["*"];
        if (!(Number.isInteger(V) && V >= 1)) return 0;
        return AnazhRealm._solitaerVon(preset, V) || V;
    }
    // Foundry-Cache = LRU: ein Treffer wandert nach hinten, beim Überlauf fällt die älteste Gestalt. Eine
    // Räumung zerstört nie einen sichtbaren Baum (Dispose nur ohne lebende Instanz-Gruppe, s.
    // _foundryCacheEvict); ein wieder benötigter Variant wird neu angefragt (build-dedup).
    _foundryCacheGet(key) {
        const f = this._foundry;
        if (!f || !f.cache.has(key)) return undefined;
        const v = f.cache.get(key);
        f.cache.delete(key);
        f.cache.set(key, v); // LRU-Berührung: ans Ende (jüngste)
        return v;
    }
    // Eintrags-Gewicht: Byte-Längen der Kind-Geometrien (Attribute + Index), EINMAL beim Einfügen.
    // Nicht-Gruppen wiegen 0 (für sie wacht FOUNDRY_CACHE_CAP). Flach wie `_disposeFoundryGroupGeom`.
    _foundryGroupBytes(g) {
        if (!g || !Array.isArray(g.children)) return 0;
        let bytes = 0;
        for (const ch of g.children) {
            const geo = ch && ch.geometry;
            if (!geo) continue;
            const attrs = geo.attributes || {};
            for (const k in attrs) {
                const a = attrs[k];
                if (a && a.array && Number.isFinite(a.array.byteLength)) bytes += a.array.byteLength;
            }
            const idx = geo.index;
            if (idx && idx.array && Number.isFinite(idx.array.byteLength)) bytes += idx.array.byteLength;
        }
        return bytes;
    }
    _foundryCacheSet(key, v) {
        const f = this._foundry;
        if (!f) return;
        // V4(B) — der Ref-Zähler startet bei 0 (keine lebende InstancedMesh-Gruppe hält die
        // Geometrie dieser Cache-Gruppe, bis _archInstanceGroupFor sie referenziert).
        if (v && v._liveRefs === undefined) v._liveRefs = 0;
        // Gewichts-Bilanz am EINEN Chokepoint: Überschreiben bucht das alte Gewicht aus, das neue ein
        // (`_cacheBytes`-Stempel), die Eviction bucht jede Räumung aus. `f.cacheBytes` = die kanonische Summe.
        if (!Number.isFinite(f.cacheBytes)) f.cacheBytes = 0;
        const prev = f.cache.get(key);
        if (prev && Number.isFinite(prev._cacheBytes)) f.cacheBytes -= prev._cacheBytes;
        if (v && typeof v === "object" && !Number.isFinite(v._cacheBytes)) v._cacheBytes = this._foundryGroupBytes(v);
        if (v && Number.isFinite(v._cacheBytes)) f.cacheBytes += v._cacheBytes;
        f.cache.set(key, v);
        // DAS HÖHEN-BUCH: die Höhe eines Baum-Körpers je Körper-Schlüssel — deterministisch (gleicher Schlüssel =
        // gleiche Geometrie), wenige Bytes, nie geräumt: die LRU vergisst die Geometrie, nie die Höhe.
        if (v && v._hoehe > 0) (f.hoehen || (f.hoehen = new Map())).set(key, v._hoehe);
        // DAS KRONEN-BUCH (D10): die gezeichnete Krone eines Baum-Körpers (Beipack `__krone`) je Körper-Schlüssel — wie die
        // Höhe deterministisch und klein (höchstens 288 Laub-Teile), nie geräumt; der Leser ist `_foundryBaumKrone`.
        if (v && v._krone) (f.kronen || (f.kronen = new Map())).set(key, v._krone);
        f.ankunft = (f.ankunft | 0) + 1; // die Ankunfts-Generation: Wartende im Nah-Zweig fragen erst danach wieder
        const CAP = AnazhRealm.FOUNDRY_CACHE_CAP;
        const BYTES = AnazhRealm.FOUNDRY_CACHE_BYTES || Infinity;
        while (f.cache.size > CAP || f.cacheBytes > BYTES) {
            const oldest = f.cache.keys().next().value;
            if (oldest === key) break; // nie den gerade gesetzten räumen (ein Über-Budget-Solo-Eintrag bleibt — weiche Wand)
            this._foundryCacheEvict(oldest);
        }
        this._foundryRuheDeckel(key);
    }
    // DER RUHE-DECKEL (profiband K5, Gebot 7): ein Körper, den keine Senke zeichnet (`_liveRefs` 0), wuchs mit der bereisten
    // Welt bis an den Gewichts-Deckel (Gang 6 min: 110 untätige = 146,5 MB neben 40,6 MB lebenden). Die ältesten Untätigen
    // fallen, bis ihr Gewicht unter FOUNDRY_RUHE_BYTES steht — die jüngsten (eben gewärmt, eben verlassen) bleiben; `schone`
    // ist der eben gesetzte Schlüssel. Gerufen beim Setzen und im Takt nach jeder Rückgabe (`_foundryLoslassen`).
    _foundryRuheDeckel(schone) {
        const f = this._foundry;
        f.ruheOffen = false;
        let ruhe = 0;
        for (const v of f.cache.values()) if (v && !(v._liveRefs > 0)) ruhe += v._cacheBytes || 0;
        for (const [k, v] of f.cache) {
            if (ruhe <= AnazhRealm.FOUNDRY_RUHE_BYTES) break;
            if (k === schone || !v || v._liveRefs > 0) continue;
            ruhe -= v._cacheBytes || 0;
            this._foundryCacheEvict(k);
        }
    }
    // DIE EINE RÜCKGABE einer Cache-Gruppe durch ihren Halter (Senke, Leib, Schatten-Stellvertreter): war sie WÄHREND des
    // Haltens geräumt (`_evicted`), fällt ihre Geometrie mit dem letzten Halter (nie mitten im Leben, nie geleakt); wird sie
    // untätig, wiegt der nächste Takt sie gegen den Ruhe-Deckel (nie im selben Ruf — ein Umbau holt sie gleich wieder).
    _foundryLoslassen(src) {
        if (!src) return;
        src._liveRefs = Math.max(0, (src._liveRefs || 0) - 1);
        if (src._liveRefs > 0) return;
        if (src._evicted) this._disposeFoundryGroupGeom(src);
        else if (this._foundry) this._foundry.ruheOffen = true;
    }
    // DIE EINE RÄUMUNGS-NAHT — jede Räumung (LRU-Überlauf UND präge-Flush) geht hier durch, nie rohes
    // f.cache.delete: (a) Dispose nur ohne lebende InstancedMesh-Gruppe (_liveRefs 0), sonst `_evicted`-
    // Marke für den letzten _disposeArchInstanceGroup; (b) cacheBytes ausbuchen; (c) Inventur lruEvicted
    // (gate:asset-inventory); (d) Key verlässt die requested-Dedup-Wache — sonst fragt ihn keine
    // On-demand-Wache je neu an (permanent null bis Reload).
    _foundryCacheEvict(key) {
        const f = this._foundry;
        if (!f || !f.cache || !f.cache.has(key)) return false;
        const og = f.cache.get(key);
        f.cache.delete(key);
        if (og && Number.isFinite(og._cacheBytes) && Number.isFinite(f.cacheBytes)) f.cacheBytes -= og._cacheBytes;
        if (!f.lruEvicted) f.lruEvicted = new Set();
        f.lruEvicted.add(key);
        if (f.requested) f.requested.delete(key);
        if (og) {
            if ((og._liveRefs || 0) > 0) og._evicted = true;
            else this._disposeFoundryGroupGeom(og);
        }
        return true;
    }
    // Geteilte Foundry-Geometrie EINMAL freigeben (jede LRU-Räumung, sonst Leck). NUR
    // Geometrie — das Material ist per kind geteilt → NIE. Idempotent via `_geomDisposed`; der Zähler
    // bilanziert gegen `_geomBuiltCount` (die Leck-Linse).
    _disposeFoundryGroupGeom(g) {
        if (!g || !g.children || g._geomDisposed) return;
        for (const ch of g.children) {
            if (ch.geometry && typeof ch.geometry.dispose === "function") ch.geometry.dispose();
        }
        // die verschmolzenen Flat-Geometrien gehören der Gruppe (_foundryFlatVerschmelzen)
        const fl = g._foundryFlat;
        if (fl && Array.isArray(fl.leaves))
            for (const lf of fl.leaves) {
                // DAS EIGENTUM DES LEAFS: ein Leaf gehört der Gruppe, aus der es gebaut ist (`_srcGroup`). Die L0 trägt die
                // Zwillings-Leaves ihrer Wurf-Stufe — DIESELBEN Objekte (`_foundryFlattenFor`) —, deren Geometrie fällt mit
                // der Wurf-Stufe, nie mit der L0. Befund (Gegenprüfung S3 R2): der L0-Kehraus gab die gestempelte Gestalt
                // des Schatten-Teils der lebenden L1 frei (r184 zerstört dann die GPU-Puffer des Wurfs und lädt sie neu).
                if (lf._srcGroup !== g) continue;
                if (lf._eigen && lf.geom && typeof lf.geom.dispose === "function") lf.geom.dispose();
                // die L0-gestempelte Zwillings-Gestalt teilt die Puffer dieses Leafs — sie fällt mit ihm
                if (lf._schattenGeom) {
                    lf._schattenGeom.dispose();
                    lf._schattenGeom = null;
                }
            }
        g._geomDisposed = true;
        const f = this._foundry;
        if (f) f._geomDisposedCount = (f._geomDisposedCount || 0) + g.children.length;
        // Der Schatten-Stellvertreter gibt seine gepinnte L1-Quelle zurück.
        const q = g._schattenQuelle;
        if (q) {
            g._schattenQuelle = null;
            this._foundryLoslassen(q);
        }
    }
    // Die Gestalt, mit der ein Schatten-Zwilling wirft: die Geometrie der Wurf-Stufe (Baum: die L1), gestempelt als
    // Nah-Stufe ohne Einblende (aLodLevel 3: wirft voll, wo die L0 ODER die L1 gezeichnet wird, und blendet nur im
    // L1→L2-Band zur Karte aus — die Karte wirft nicht). Dieselben Puffer, derselbe Stoff, kein Programm mehr; EIN
    // Zwilling je Gestalt und Teil, gleich welche Stufe ihn ruft (`_foundryFlattenFor`: die L0 und die L1 tragen
    // dieselben Zwillings-Leaves, eine Gruppe je Pass). Die Gestalt gehört dem Leaf, das sie trägt, und fällt mit ihm
    // (`_disposeFoundryGroupGeom`). Ohne Stempel (Blende aus) die Geometrie selbst. Der Schatten-Teil (S3, `teil:
    // "schatten"`) ist ein eigenes Gitter: der Zwilling zeichnet ihn ganz — der drawRange-Vorsatz (W6) ist gefallen.
    _foundrySchattenGeom(lf) {
        const g = lf && lf.geom;
        if (!g || !g.attributes || !g.attributes.aLodLevel) return g;
        // Eine ungemaskte Gestalt (Stempel 0: Haus, Ausstattung — die Stufe 3 wirft in jeder Ferne) bleibt ungemaskt: der
        // Zwilling trägt ihre Geometrie selbst, kein Stempel 3 (der blendete im L1→L2-Band der Bäume aus)
        if (g.attributes.aLodLevel.count > 0 && g.attributes.aLodLevel.array[0] === 0) return g;
        if (lf._schattenGeom) return lf._schattenGeom;
        const z = new THREE.BufferGeometry();
        for (const k in g.attributes) z.setAttribute(k, g.attributes[k]);
        z.setAttribute(
            "aLodLevel",
            new THREE.BufferAttribute(new Float32Array(g.attributes.aLodLevel.count).fill(3), 1)
        );
        if (g.index) z.setIndex(g.index);
        z.drawRange.start = g.drawRange.start;
        z.drawRange.count = g.drawRange.count;
        if (g.boundingSphere) z.boundingSphere = g.boundingSphere.clone();
        if (g.boundingBox) z.boundingBox = g.boundingBox.clone();
        lf._schattenGeom = z;
        return z;
    }
    // DIE EINE STUFEN-KLAMMER der Geometrie-Stufen (`_foundryDeclaredStage`, Vertrags-Daten `PORTAL_RENDER_CONFIG.lod.kindStages`,
    // live) für JEDE Art, baumartig oder nicht: die GRÖSSTE deklarierte Stufe ≤ der Distanz-Wahl, sonst die kleinste —
    // nie eine Stufe, die das Studio nicht vorsieht. Ein BEKANNTES Rezept ohne kindStages-Eintrag (eine Zweit-Kern-Art,
    // neue Domäne vor ihrem Merge) gilt als [0] — nur die feine Stufe, der Wirt gradet selbst (L1=L0, L2=Auto-Impostor).
    // Ohne Config gibt es keine Stufe: der Wurf-Leser (`_foundryBudgetZeile`) bricht KERN-PFLICHT (die Fallback-Karte
    // FOUNDRY_KIND_LOD fiel 05.10. — Buch und Config docken in EINER Nachricht). Leser: der Flatten und sein Dock-Peek.
    _foundryServierStufe(preset, lod) {
        lod = this._foundryDeclaredStage(preset, lod);
        if (!this._foundryPresetIsTree(preset) && !this._foundryKindStages(preset)) {
            const f = this._foundry;
            if (f && f.recipes && f.recipes[preset]) lod = 0;
        }
        return lod;
    }
    _foundryFlattenFor(entry, preset, lodOverride) {
        const f = this._ensureAssetFoundry();
        if (!f) return null;
        const variant = this._foundryGestaltFor(entry, preset);
        if (variant == null) return null; // Buch kalt: wie ein ladendes Asset (der Tick baut nach)
        // DIE EINE LOD-AUTORITÄT: die Distanz-LOD (`_tickArchitectureLOD` → `entry._lodLevel`) FÜHRT, die
        // Foundry serviert genau diese Stufe; `lodOverride` reicht sie herein (sonst Distanz-Schätzung).
        // DER WURF- UND FERN-RUF (S3 haus): nennt `lodOverride` eine NUR-WURF-Stufe (B2 Stufe 3), baut der Flatten genau
        // sie — die Klammer 0..2 und die Stufen-Klammer gelten nur dem Distanz-Wunsch (vorher klemmte der Wurf-Ruf der L2
        // auf die L2 selbst und rief sich ohne Ende).
        let lod = Number.isFinite(lodOverride) ? lodOverride : this._foundryLodForEntry(entry);
        if (!(Number.isFinite(lodOverride) && this._foundryNurWurf(preset, lodOverride))) {
            if (lod < 0) lod = 0;
            if (lod > 2) lod = 2;
            // L2 für BÄUME = das Studio-Billboard (bakeImpostorAtlas), nie die schwere L2-Geometrie (~15k Verts ×
            // Fernwald = Overdraw); Fels/Kristall/Blume bleiben L2-Geometrie. Der fimp-Key trägt den ov-Hash: ein
            // gestempelter Eintrag zieht seine EIGENE Karte, bis dahin geprägte Geometrie (nie die ungeprägte).
            if (lod >= 2 && this._foundryPresetIsTree(preset)) return this._foundryBuildImpostorFlat(entry, preset);
            // DIE EINE STUFEN-KLAMMER (`_foundryDeclaredStage`, Vertrags-Daten `PORTAL_RENDER_CONFIG.lod.kindStages`,
            // live) für JEDE Art, baumartig oder nicht: die GRÖSSTE deklarierte Stufe ≤ der Distanz-Wahl, sonst die
            // kleinste — nie eine Stufe, die das Studio nicht vorsieht. Befund 02.10. (Werkbank, Mess-Wiese): der
            // Strauch (shrub [1,2]) galt als baumartig, der Baum-Zweig klemmte nur Ein-Stufen-Arten — nahe Büsche
            // standen mit L0 (112k Dreiecke je Busch statt 45k, 25 s Worker-Bau einer nie deklarierten Stufe).
            lod = this._foundryServierStufe(preset, lod);
        }
        // Gestempelter Welt-Eintrag (entry.studioOv) baut sein Unikat: der ov-Hash trennt Cache-Key UND (via
        // leafKey) den Gruppen-Key — geprägt und ungeprägt vergiften sich nie. Der Request reicht ov als
        // 4. Arg. Ohne Stempel: der Körper-Schlüssel ohne ov.
        const entryOv = this._artifactStudioOv(entry);
        const key = this._foundryKoerperKey(preset, variant, lod, entryOv);
        const group = this._foundryCacheGet(key);
        if (group === undefined) {
            // der Rang: der Ort des Eintrags, sonst der Rang seines Bestellers (`wo`, die Streu-Zelle, R1) — ohne beides Vorrat
            this._foundryZug(key, preset, variant, lod, entryOv, entry.position || entry.wo, {
                // Wirft die Stufe mit einer ANDEREN Gestalt (Budget `schatten`: der L0-Baum wirft seine L1), reist diese
                // im selben Zug davor — sonst stellte sie sich erst nach der Ankunft ans Ende der Worker-Schlange, und die
                // Stufe wartete doppelt.
                vor: () => {
                    if (entryOv) return;
                    const _wurf = this._foundryBudgetZeile(preset, lod).schatten;
                    if (_wurf !== false && _wurf !== lod) this._foundryFlattenFor(entry, preset, _wurf);
                },
                nach: (ok) => {
                    if (ok) this._scatterRefillPending = true; // ein Studio-Asset kam an → deferrierte Fern-Regionen neu streamen
                    this._foundryRewarmColdTrees(); // das eben geladene Asset → wartende Einträge bauen
                },
            });
            return null;
        }
        // null (Anfrage fehlgeschlagen) ODER leere Geometrie (z.B. Kristall-Merge gab nichts) ->
        // `false` = „Foundry kann das nicht", der Aufrufer faellt auf den AnazhRealm-Pfad zurueck.
        if (group === null || !group.children || !group.children.length) return false;
        if (!group._foundryFlat) {
            // DER SCHATTEN-STELLVERTRETER: ein Baum zeichnet nah seine L0-Gestalt und wirft den Schatten seiner
            // L1-Stufe — die L0-Teile casten nicht, die L1-Teile reisen als Schatten-Zwilling (`shadowTwin`,
            // SHADOW_TWIN_LAYER: nur die Kaskaden-Kameras sehen sie) im SELBEN Flat, als Nah-Stufe gestempelt
            // (`_foundrySchattenGeom`: Stempel 3, derselbe Stoff, kein Programm mehr); Entfernen, Stufen-
            // Wechsel und Bundles tragen ihn wie jedes Leaf. Befund 02.10. (Werkbank, Mess-Wiese): eine L0-Eiche warf 155k
            // Dreiecke in JEDE der zwei Kaskaden, ihre L1 trägt 11k. Ein Flat ist erst fertig, wenn seine Teile
            // stehen: lädt L1 noch, wartet L0 (die Bibliothek wärmt L1). WER wirft, sagt das Studio-Budget (B2c
            // `schatten` je Art × Stufe, `_foundryBudgetZeile`): die eigene Stufe wirft selbst, eine andere reist als
            // Zwilling, false wirft nicht — nie ein Stufen-Literal im Host.
            // DER EINE WERFER JE GESTALT (W6, 05.10.): wirft eine Stufe selbst UND ist sie der Zwilling einer anderen
            // (Baum: die L0 wirft die L1), wirft sie über DIESELBEN Zwillings-Leaves wie die andere — EINE Instanz-Gruppe
            // je Gestalt und Teil in jeder Kaskade, gleich ob der Baum nah (L0) oder mittel (L1) steht. Befund (Mess-
            // Wiese, werkbank zaehlen 05.10.): k0 zeichnete je Baum-Gestalt zwei Gruppen derselben L1-Geometrie (die
            // L1 selbst und den Zwilling ihrer L0) — f:tanne:L1 8 Befehle in k0 bei 4 im Hauptbild.
            const wurf = this._foundryBudgetZeile(preset, lod).schatten;
            const zwillingsQuelle = wurf === lod && this._foundryWurfQuelle(preset, lod);
            let schatten = null;
            if (wurf !== false && wurf !== lod) {
                const fw = this._foundryFlattenFor(entry, preset, wurf);
                if (fw === null) return null;
                if (fw && fw.instanceable && fw.lod === wurf && Array.isArray(fw.leaves) && fw.leaves.length)
                    schatten = fw;
            }
            // DIE KOSTEN-REGEL (`_wurfVonBilligerer`, N5): ist die Wurf-Stufe eine NUR-WURF-Stufe, wirft ihr Zwilling nur,
            // wo er weniger Dreiecke trägt als die werfenden Teile dieser Stufe — sonst wirft die Stufe selbst. Der Flat
            // trägt die Kosten (`wurfKosten`: eigen · zwilling · von = die werfende Stufe).
            let wurfKosten = null;
            if (schatten && this._foundryNurWurf(preset, wurf)) {
                let eigen = 0;
                let zwilling = 0;
                for (const c of group.children) {
                    if (!c.geometry || !c.material || c.castShadow === false) continue;
                    const rad = c.userData && c.userData.__rad;
                    const mal = rad && Array.isArray(rad.raeder) && rad.raeder.length ? rad.raeder.length : 1;
                    eigen += AnazhRealm._geomDreiecke(c.geometry) * mal;
                }
                for (const lf of schatten.leaves)
                    if (lf.shadowTwin && lf.castShadow !== false) zwilling += AnazhRealm._geomDreiecke(lf.geom);
                const von = AnazhRealm._wurfVonBilligerer(eigen, zwilling);
                wurfKosten = { eigen, zwilling, von: von === "zwilling" ? wurf : lod };
                if (von !== "zwilling") schatten = null;
            }
            // EINE Sichthöhe je Baum über alle Stufen (vor dem Flat: die Instanz-Fassaden lesen die Vorlage). Ohne
            // bekannte Höhe der Höhen-Stufe wartet die Stufe (nie mit eigenem Stempel).
            if (this._foundryPresetIsTree(preset) && lod !== this._foundryHoehenStufe(preset)) {
                const hz = this._foundryBaumHoehe(preset, entry);
                if (hz == null) return null;
                this._foundryStufenHoeheAngleichen(group, hz);
            }
            const leaves = [];
            // Template→Welt-Übersetzung: das Studio platziert mit `SCALE[sp] · tr.s · 0.82` (eiche 4.16 · fichte
            // 4.85 · …) — ohne sie bleibt der Baum ein Zwerg, der strauch ein Riese. Sie lebt HIER (localMatrix
            // der Flat-Leaves), jede Platzierung (Wald · Scatter · Understory · L2) erbt sie; der Impostor-Rahmen
            // bleibt TEMPLATE-LOKAL (der Studio-Bäcker framet ungescalt, ein Scale sprengte den Atlas).
            const I = this._foundryWorldScaleMatrix(preset);
            // Schatten: die Stufe wirft ihre eigene Gestalt genau dann, wenn das Budget sie nennt (B2c: Baum L0 → L1-
            // Zwilling, L1 selbst, Karte nie; Strauch/Blume/Fels selbst; Gras nie). Der `leaf.castShadow`-Override
            // gewinnt gegen `_archGroupCastsShadow` (das `_lodN` im Namen liest; Foundry-Einträge tragen ihr LOD im
            // leafKey). Deckungsgleiche Werfer verdunkeln nicht doppelt (Tiefen-Test).
            const castsShadow = (wurf === lod && !zwillingsQuelle) || (wurfKosten !== null && wurfKosten.von === lod);
            for (let p = 0; p < group.children.length; p++) {
                const child = group.children[p];
                if (!child.geometry || !child.material) continue;
                leaves.push({
                    geom: child.geometry,
                    mat: child.material,
                    localMatrix: I,
                    // V18.465 — Tür-Flügel-Meshes tragen ihr Scharnier (Template-Raum).
                    tuer: child.userData && child.userData.__tuer ? child.userData.__tuer : undefined,
                    // Welle L (Q13 F-D8) — das Rad der Ecke 0 (nabenrelativ); unten je Ecke als Instanz gesetzt
                    rad: child.userData && child.userData.__rad ? child.userData.__rad : undefined,
                    sippe: child.userData ? child.userData.__sippe || null : null, // die Verschmelz-Regel des Gesetzes
                    // der Schatten-Teil (S3: `teil: "schatten"`) — der Flatten legt ihn als Zwilling in die Kaskaden
                    teil:
                        child.userData && typeof child.userData.__teil === "string" ? child.userData.__teil : undefined,
                    leafKey: "f:" + key + ":" + p,
                    // die Teile der Lieferung, die das Leaf trägt (der Flatten verschmilzt sie hintereinander) — der Satz-Faden
                    // rechnet den Block eines Slots aus genau ihnen (`_bauSatzFadenBestellen`, phyto-core `satzTeilBloecke`)
                    quelle: Number.isInteger(child.userData.__quelle) ? [child.userData.__quelle] : null,
                    stufe: lod, // die Stufe des Leafs — der Rang seiner Gruppe im Bündel (`_buendelKinderReihe`)
                    // V4(B) — die Rück-Referenz auf die Cache-Gruppe, damit _archInstanceGroupFor
                    // beim Neubau der InstancedMesh-Gruppe den Ref-Zähler dieser Gruppe hebt.
                    _srcGroup: group,
                    // DAS WURF-RECHT DES TEILS: eine Lichtquelle, ein durchsichtiger Stoff, die Fell-Schale werfen nie
                    // (`_foundryBuildMesh` stempelt es ans Mesh) — es gilt der Stufe selbst UND ihrem Zwilling.
                    teilWirft: child.castShadow !== false,
                    // die Stufe wirft (Budget), wenn sie nicht über ihren Zwilling wirft
                    castShadow: castsShadow && child.castShadow !== false,
                });
            }
            this._foundryFlatVerschmelzen(group, leaves);
            this._foundryFluegelInstanz(group, leaves);
            // DIE RÄDER (Welle L, Q13 F-D8): ein Rad-Leaf (die Teile der Ecke 0, nabenrelativ, je Dreh-Klasse
            // verschmolzen) steht je Ecke als EIGENE Instanz derselben Gruppe (derselbe leafKey): Ruhe-Lage =
            // Welt-Skala · Nabe(Ecke) · Drehung π für die Gegenseite. Der Ritt schreibt ihre Matrix je Schritt neu
            // (`_archInstanceUpdate`: Rolle, Lenk-Einschlag, ungefedert) — die geteilte Geometrie bleibt unberührt.
            for (let i = leaves.length - 1; i >= 0; i--) {
                const lf = leaves[i];
                if (!lf.rad) continue;
                const ecken = lf.rad.raeder.map((rd, ecke) => {
                    const m4 = new THREE.Matrix4().makeRotationY(rd.dreh || 0);
                    m4.setPosition(rd.hx, rd.hy, rd.hz);
                    return Object.assign({}, lf, {
                        localMatrix: new THREE.Matrix4().multiplyMatrices(I, m4),
                        rad: {
                            ecke,
                            dreht: !!lf.rad.dreht,
                            front: !!rd.front,
                            hx: rd.hx,
                            hy: rd.hy,
                            hz: rd.hz,
                            dreh: rd.dreh || 0,
                            welt: I, // die Welt-Skala der Vorlage (geteilt)
                        },
                        _eigen: ecke === 0 ? lf._eigen : false, // die verschmolzene Geometrie gehört EINER Ecke
                    });
                });
                leaves.splice(i, 1, ...ecken);
            }
            if (zwillingsQuelle) {
                // Nennt die Stufe einen WURF-TEIL (B2c `wurf.teil`, S3 — das EINE Wurf-Gesetz E1: Baum-L1 `teil: "schatten"`),
                // wirft NUR dieses Teil: es ist selbst der Zwilling (SHADOW_TWIN_LAYER, Stempel 3 über `_foundrySchattenGeom`),
                // im Hauptbild zeichnet es nie, jedes andere Teil wirft nicht. Fehlt das Teil, ist das ein Vertragsbruch
                // (KERN-PFLICHT), nie still die ganze Stufe. Ohne Wurf-Zeile (Strauch) wirft jedes Teil ganz als Zwilling.
                // DER WÄHLER IST FAIL-CLOSED (Gegenprüfung S3): eine Zeile `wurf` nennt ihr Teil beim Namen — ohne ihn träfe
                // der Vergleich jedes Leaf ohne Teil (undefined === undefined), die ganze Stufe würfe still als Zwilling.
                const wurf = this._foundryBudgetZeile(preset, lod).wurf;
                const wurfTeil = wurf ? wurf.teil : null;
                if (wurf && !(typeof wurfTeil === "string" && wurfTeil))
                    AnazhRealm._kernPflichtBruch(
                        "phyto:lod.budget." + preset + "[" + lod + "].wurf.teil (kein Teil-Name)"
                    );
                const n = leaves.length;
                if (wurf) {
                    let hat = false;
                    for (let i = 0; i < n; i++) {
                        const lf = leaves[i];
                        if (lf.teil !== wurfTeil) continue;
                        hat = true;
                        const z = Object.assign({}, lf, {
                            leafKey: lf.leafKey + "#S",
                            castShadow: lf.teilWirft,
                            shadowTwin: true,
                            _schattenGeom: null,
                        });
                        z.geom = this._foundrySchattenGeom(z); // die gestempelte Gestalt gehört diesem Leaf (der Kehraus)
                        leaves[i] = z;
                    }
                    if (!hat)
                        AnazhRealm._kernPflichtBruch(
                            "phyto:lod.budget." + preset + "[" + lod + "].wurf (kein Teil " + wurfTeil + ")"
                        );
                } else
                    for (let i = 0; i < n; i++) {
                        const lf = leaves[i];
                        leaves.push(
                            Object.assign({}, lf, {
                                leafKey: lf.leafKey + "#S",
                                geom: this._foundrySchattenGeom(lf),
                                // der Zwilling wirft nach dem Wurf-Recht des Teils, nie nach `lf.castShadow` (das ist bei
                                // einer Zwillings-Quelle false: Sträucher würfen still keinen Schatten)
                                castShadow: lf.teilWirft,
                                shadowTwin: true,
                                _eigen: false, // die Geometrie gehört dem Teil, nie dem Zwilling
                                _schattenGeom: null,
                            })
                        );
                    }
            }
            if (schatten && leaves.length) {
                // Die Zwillings-Leaves der Wurf-Stufe, DIESELBEN Objekte (EIN Werfer je Gestalt); die Cache-Gruppe der
                // Wurf-Stufe bleibt gepinnt, solange dieser Flat lebt (`_disposeFoundryGroupGeom` gibt sie zurück).
                for (const lf of schatten.leaves) if (lf.shadowTwin) leaves.push(lf);
                const quelle = schatten.leaves[0]._srcGroup;
                if (quelle) {
                    quelle._liveRefs = (quelle._liveRefs || 0) + 1;
                    group._schattenQuelle = quelle;
                }
            }
            group._foundryFlat = leaves.length
                ? {
                      instanceable: true,
                      reason: "foundry",
                      foundry: true,
                      lod,
                      leaves,
                      // der Körper des Flats (`_foundryKoerperKey`): der Satz-Faden baut ihn nach (`_bauSatzFadenBestellen`)
                      koerper: { preset, seed: variant, lod, ov: entryOv, key },
                      huelle: group._huelle || null,
                      fern: group._fern || null,
                      wurfKosten,
                  }
                : false;
        }
        return group._foundryFlat;
    }
    // DIE FLÜGEL-INSTANZ (1310-4, OMEN): porta-core baut Vorder- und Hinterflügel einer Seite mit DERSELBEN Funktion
    // (`makeLeaf(seite, ±zFace)`); gebacken liegen sie bit-gleich um 2·zFace versetzt (Lage und Normalen, gemessen an allen
    // sieben Genesis-Toren), und doch zeichnete jeder Flügel × Stoff eine eigene Gruppe (40 am Ring, CPU-Takt p95 −0,8 ms in
    // EINER Sitzung ohne sie). Wiederholt ein Flügel einen früheren gleichen Stoffs und Wurf-Rechts nur verschoben
    // (`_geoVerschoben`), zeichnet er dessen Geometrie als weitere Instanz derselben Gruppe: sein Leaf trägt die Verschiebung
    // in `localMatrix` und in `tuer.basis` — der Schwenk-Träger dreht um SEIN Scharnier und setzt die Gestalt dann an ihren
    // Platz (`_tickTorFluegel`). Die Drehung bleibt in der Instanz-Matrix: ein Schwung kostet je Flügel eine Matrix, nie die
    // Ecken (die Drehung in der Geometrie kostete beim Gehen am Ring +2,9 ms CPU-Takt p95 und fiel). Links und rechts sind
    // Spiegel mit eigener Teilung — sie bleiben zwei Gestalten.
    _foundryFluegelInstanz(group, leaves) {
        const vorlagen = [];
        for (let i = 0; i < leaves.length; i++) {
            const lf = leaves[i];
            if (!lf.tuer || lf.rad || lf.teil) continue;
            let treffer = null;
            for (const v of vorlagen) {
                if (v.mat !== lf.mat || v.castShadow !== lf.castShadow || v.teilWirft !== lf.teilWirft) continue;
                const d = AnazhRealm._geoVerschoben(v.geom, lf.geom);
                if (d) {
                    treffer = { v, d };
                    break;
                }
            }
            if (!treffer) {
                vorlagen.push(lf);
                continue;
            }
            const basis = new THREE.Matrix4().makeTranslation(treffer.d[0], treffer.d[1], treffer.d[2]);
            leaves[i] = Object.assign({}, lf, {
                geom: treffer.v.geom,
                leafKey: treffer.v.leafKey,
                localMatrix: new THREE.Matrix4().multiplyMatrices(lf.localMatrix, basis),
                tuer: Object.assign({}, lf.tuer, { basis }),
                _eigen: false, // die Geometrie gehört der Vorlage
            });
        }
    }
    // Ist b dieselbe Geometrie wie a, nur verschoben? Die Regel ist die des Budget-Gesetzes (phyto-core `budgetGestaltVersatz`:
    // derselbe Index, jede Spur gleich, die Lage um EINEN Vektor versetzt) — so zählt das Gesetz, was der Wirt zeichnet
    // (gate:sippen-wirt). Der Wirt legt nur die Gestalt der Puffer davor (gleiche Attribut-Namen und Spurbreiten, kein
    // verschränkter Puffer, derselbe Zeichen-Bereich). Gibt den Vektor oder null.
    static _geoVerschoben(a, b) {
        const pa = a.attributes.position;
        const pb = b.attributes.position;
        if (a === b || !pa || !pb || pa.isInterleavedBufferAttribute || pb.isInterleavedBufferAttribute) return null;
        if (pa.itemSize !== 3 || pb.itemSize !== 3 || pa.count !== pb.count) return null;
        if (a.drawRange.start !== b.drawRange.start || a.drawRange.count !== b.drawRange.count) return null;
        const namen = Object.keys(a.attributes)
            .filter((k) => k !== "position")
            .sort();
        if (namen.length + 1 !== Object.keys(b.attributes).length) return null;
        for (const k of namen) {
            const x = a.attributes[k];
            const y = b.attributes[k];
            if (!y || x.isInterleavedBufferAttribute || y.isInterleavedBufferAttribute || x.itemSize !== y.itemSize)
                return null;
        }
        const sicht = (g) => ({
            pos: g.attributes.position.array,
            idx: g.index ? g.index.array : null,
            spuren: namen.map((k) => g.attributes[k].array),
        });
        return globalThis.__phytoCore.budgetGestaltVersatz(sicht(a), sicht(b));
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_studio_gestalt]);

// ===== ATLAS · Studio/gestalt — Außen-Konstanten =====
// Foundry-Cache-LRU-Deckel: max distinkte Körper (`_foundryKoerperKey`: Art|Gestalt|LOD[|ov]) im Speicher. Ein BOOT
// räumt nie (V18.527): bei 256 räumte die LRU im Boot 162 Einträge (headless, 16 Gestalten je Art) — die Räumung löschte
// `requested`, die Neu-Anfrage traf die eben geschriebene Platte. Mit den Budget-Gestalten hält ein Boot ~230 Körper;
// 512 lässt das Doppelte Luft. Den Speicher deckelt FOUNDRY_CACHE_BYTES (das Gewicht), dieser Deckel die Zahl.
AnazhRealm.FOUNDRY_CACHE_CAP = 512;
// Foundry-Cache-GEWICHTS-DECKEL: `_foundryCacheSet` bilanziert die typed-array-Bytes je Eintrag
// (`_cacheBytes`) und räumt LRU, bis Byte-Budget UND Entries-Cap stehen (ein Eintrags-Zähler ist
// byte-blind: Haus-L0 ≈ 7–8 MB, Blume wenige KB). Die Kappe MUSS über dem Ring-Working-Set liegen
// (~351 MB @ Ring 4) — darunter fallen gewärmte Assets vor dem Konsum (gate:foundry-crossfade).
// Räumung graziös (re-anfragbar; _liveRefs: nie ein sichtbarer Baum).
AnazhRealm.FOUNDRY_CACHE_BYTES = 512 * 1024 * 1024;
// Der RUHE-DECKEL: das Gewicht der Körper ohne lebende Senke (`_liveRefs` 0), das der Cache hält (`_foundryCacheSet`).
AnazhRealm.FOUNDRY_RUHE_BYTES = 64 * 1024 * 1024;
// Proaktiver Dock, zwei Kosten: ein GEDOCKTES Asset (schon im Cache) ist ein billiger
// WebGPU-Instance → viele je Idle-Tick; ein nicht gedocktes löst einen Studio-Bake aus (das iframe
// ist EIN Thread) → streng limitiert, damit die Bake-Schlange nicht flutet.
AnazhRealm.FOUNDRY_PLACE_PER_TICK = 48; // gedockte Assets (billiger Instance) je Frame im Leerlauf
AnazhRealm.FOUNDRY_BAKE_REQ_PER_TICK = 3; // NEUE Studio-Bake-Anfragen je Frame (Ein-Thread-Schlange schonen)
// Die Gestalten-Zahl einer Art aus dem Kern (`PORTAL_RENDER_CONFIG.lod.budget.gestalten`, synchron): die Budget-Zeile der
// Art, sonst '*' — dieselbe Regel wie `_foundryGestalten` am Buch (das Buch mischt die Zeilen der Zweit-Kerne hinzu, die
// Fels-Arten tragen nur die Zeilen dieses Kerns). Leser: der Fels-Blocker (`_felsBlockerParts`).
AnazhRealm._studioGestaltenKern = function (preset) {
    const tc = typeof globalThis !== "undefined" ? globalThis.__terrainCore : null;
    const rc = tc ? tc.PORTAL_RENDER_CONFIG : null;
    const G = rc && rc.lod && rc.lod.budget ? rc.lod.budget.gestalten : null;
    if (!G) return AnazhRealm._kernPflichtBruch("terrain:PORTAL_RENDER_CONFIG.lod.budget.gestalten");
    const V = Number.isInteger(G[preset]) && G[preset] >= 1 ? G[preset] : G["*"];
    if (!(Number.isInteger(V) && V >= 1)) return AnazhRealm._kernPflichtBruch("terrain:lod.budget.gestalten['*']");
    return AnazhRealm._solitaerVon(preset, V) || V;
};
// Die Gestalt des Solitärs einer Art mit V Bestand-Gestalten (K20, phyto-core `solitaerGestalt`: V+1 für eine Baum-Art mit
// V ≥ FREISTAND.ab), 0 = die Art trägt keinen. Leser: `_foundryGestalten`, `_studioGestaltenKern`, `_foundryGestaltOv`,
// `_foundryGestaltSame`.
AnazhRealm._solitaerVon = function (preset, V) {
    const tc = typeof globalThis !== "undefined" ? globalThis.__terrainCore : null;
    const rec = tc && tc.PHYTO_PRESETS ? tc.PHYTO_PRESETS[preset] : null;
    if (!rec || rec.kind !== "tree") return 0;
    const PC = globalThis.__phytoCore;
    if (!PC || typeof PC.solitaerGestalt !== "function") return AnazhRealm._kernPflichtBruch("phyto:solitaerGestalt");
    return PC.solitaerGestalt(rec.kind, V);
};
// DER SOLITÄR (K20): die Prägung der Gestalt V einer Baum-Art (`_foundryGestaltOv`) — phyto-core growSkeleton liest
// `P.freistand`. Und das Inverse des Knuth-Faktors 2654435761 mod 2^32 (`_foundryGestaltSame`: der Same zum Eimer).
AnazhRealm.FREISTAND_OV = Object.freeze({ freistand: 1 });
// DIE EINE BEIPACK-KARTE der Foundry-Antwort (`_foundryBuildGroup`): Beipack-Name → das Feld der Gruppe (der Flat reicht es
// als `huelle` · `fern` weiter). `__huelle` (Welle L) die Kollision der gezeigten Stufe, `__fern` (S3) die Fernform der Stufe 3
// — beide in der EINEN Hüllen-Form (docs/studio-vertrag.md N5, der Leser `_huelleVon`); `__mass` (K20) der Hub des Schafts,
// `__krone` (D10) die gezeichnete Krone eines Baums oder Strauchs (das Kronen-Buch, `_foundryBaumKrone`).
AnazhRealm.FOUNDRY_BEIPACK = Object.freeze({
    __huelle: "_huelle",
    __fern: "_fern",
    __mass: "_mass",
    __krone: "_krone",
});
// DIE PHASEN DES VORRATS (`_foundryPrefetchLibrary`, Merker `f._vorrat`): er wartet auf das erste Weltbild, dann bestellt er;
// durch ist er false. Jeder Leser (Kalt-Zeile, Warm-Anker, gate:ankunft) nennt die Phase, nie nur „an".
AnazhRealm.VORRAT_PHASE = Object.freeze({ wartet: "wartet auf das erste Bild", bestellt: "bestellt" });
