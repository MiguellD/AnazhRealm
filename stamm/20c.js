class AnazhRealm_Z20c {
    // ===== ATLAS §20c · SPAWN-ÖKOLOGIE — ab _laubLichtStoff =====
    // DAS LAUB-LICHT IM STOFF (K19): jeder Laub-Stoff der Welt (Foundry-Laub und Blatt-Karte, das Grammatik-Laub) rechnet je
    // direktem Licht den EINEN Laub-Licht-Term (phyto-core `laubDurchlass`, hier über der TSL-Algebra) in seiner Lichtung —
    // das Lichtmodell des Standard-Stoffs (r184 PhysicalLightingModel), dessen `direct` nach der Physik des Stoffs den
    // Durchlass der Rückseite addiert: `lightColor` trägt den Schatten der Kaskade, die Normierung ist die Lambert-Antwort der
    // Vorderseite (diffuseColor/π ausgeschrieben — ein Fn-Aufruf ohne Layout baute seinen Rumpf erst im Compiler). Kein
    // Szenen-Licht, kein zweiter Stoff: das Laub bleibt EIN Programm je Stoff. `nadel`: true — die Blatt-Karte erkennt die
    // Nadel an ihrer Atlas-Zelle (u ≥ LAUB_LICHT.nadelAbU); false — Klinge und Blatt-Geometrie sind Laub; eine Funktion — die
    // ferne Karte liest die Nadel ihrer Schicht (`_karteNadel`), der Knoten entsteht je Programm-Bau.
    _laubLichtStoff(mat, nadel) {
        if (!mat || mat.isNodeMaterial !== true) throw new Error("_laubLichtStoff: kein Knoten-Stoff");
        const T = THREE.TSL;
        const K = AnazhRealm._laubLichtModell();
        const ab = globalThis.__phytoCore.LAUB_LICHT.nadelAbU;
        const art = typeof nadel === "function" ? "karte" : nadel === true ? "atlas" : "laub";
        mat.setupLightingModel = () =>
            new K(
                art === "karte"
                    ? nadel()
                    : art === "atlas"
                      ? T.select(T.attribute("uv", "vec2").x.greaterThanEqual(ab), T.float(1), T.float(0))
                      : T.float(0)
            );
        const schluessel = mat.customProgramCacheKey;
        const at = art === "karte" ? this._impostorAtlas() : null;
        mat.customProgramCacheKey = function () {
            return (
                schluessel.call(this) +
                (art === "laub" ? "|laubLicht" : "|laubLicht:" + art) +
                (at && at.nadelU ? ":" + at.nadelU.array.length : "")
            );
        };
        mat.userData = mat.userData || {};
        mat.userData.laubLicht = art;
        return mat;
    }

    // DIE NADEL DER KARTE (K19): je Atlas-Schicht 1 für die Nadel-Art (der Phänotyp der Zelle, K24), sonst 0 — EINE
    // Uniform-Reihe für jede Karte jeder Art. Wächst der Atlas über die Reihe, wächst sie mit (verdoppelnd) und die Karte baut
    // ihr Programm neu (die Länge steht im Programm-Schlüssel); ohne Wachsen kostet sie nichts.
    _karteNadel(T, z) {
        const at = this._impostorAtlas();
        const tab = globalThis.__terrainCore && globalThis.__terrainCore.PHYTO_PRESETS;
        if (!tab) return AnazhRealm._kernPflichtBruch("terrain:PHYTO_PRESETS");
        let n = at.nadelU ? at.nadelU.array.length : 0;
        if (n < Math.max(at.n, 1)) {
            const alt = at.nadelU ? at.nadelU.array : [];
            while (n < Math.max(at.n, 1)) n = Math.max(32, n * 2);
            const a = new Array(n).fill(0);
            for (let i = 0; i < alt.length; i++) a[i] = alt[i];
            at.nadelU = (T || THREE.TSL).uniformArray(a, "float");
            if (at.mat) at.mat.needsUpdate = true;
        }
        if (z) {
            const rec = tab[z.preset];
            // Die Nadel-Art ist der Phänotyp der Art (K24: phyto-core artPhaenotyp, dieselbe Quelle wie der Baum).
            const pc = globalThis.__phytoCore;
            at.nadelU.array[z.idx] =
                rec && rec.s && (rec.kind === "tree" || rec.kind === "shrub") && pc.artPhaenotyp(rec.s, rec).conifer
                    ? 1
                    : 0;
        }
        return at.nadelU;
    }

    // Das Lichtmodell des Laubs (K19): die Klasse ist die des Standard-Stoffs selbst (sein `setupLightingModel` liefert sie
    // — die Bootstrap-Brücke reicht sie nicht als THREE-Symbol), erweitert um den Durchlass.
    static _laubLichtModell() {
        if (AnazhRealm._laubLichtK) return AnazhRealm._laubLichtK;
        const T = THREE.TSL;
        const Basis = THREE.MeshStandardNodeMaterial.prototype.setupLightingModel.call(null).constructor;
        const A = AnazhRealm._windTsl(T);
        const durchlass = globalThis.__phytoCore.laubDurchlass;
        class LaubLicht extends Basis {
            constructor(nadel) {
                super();
                this.nadel = nadel;
            }
            direct(e, builder) {
                super.direct(e, builder);
                const L = e.lightDirection;
                const f = durchlass(A, T.normalView.dot(L), T.positionViewDirection.dot(L).negate(), this.nadel);
                e.reflectedLight.directDiffuse.addAssign(
                    e.lightColor
                        .mul(f)
                        .mul(T.diffuseColor.rgb)
                        .mul(1 / Math.PI)
                );
            }
        }
        AnazhRealm._laubLichtK = LaubLicht;
        return LaubLicht;
    }

    // Die Schlankheit der Karte (K19): EINE Uniform, das Mittel von δ über die Arten, deren Gestalt geliefert ist
    // (`_baumWindDaten` misst sie, phyto-core `windSchlankheit`) — die Karte zeichnet jede Art aus EINEM Stoff und kennt
    // ihre Art nur als Atlas-Schicht. Vor der ersten Gestalt ist δ 0 (f0 0: die Karte neigt sich mit der Böe, ohne Pendel).
    _karteWindDelta() {
        if (!this._karteWindU) this._karteWindU = THREE.TSL.uniform(0);
        return this._karteWindU;
    }

    // DIE WIND-DATEN EINER ART (K19) für den Stoff ihrer Gruppe, gemessen an der GELIEFERTEN Gestalt: die Vorlagen-Höhe
    // (die Wurzel liegt bei y = 0 — ζ = y / ht), die Schlankheit δ = D(Brusthöhe) / ht des Stamm-Strangs (phyto-core
    // `windSchlankheit` mit der Welt-Skala der Art) und ob sie im Wind steht (Baum und Strauch; der liegende Stamm, der
    // Stumpf, Fels und Bau stehen still). Bis K19 kam δ aus dem Buch-Phänotyp — das Totholz (gebrochene Krone) schwang
    // 42 % zu langsam.
    _baumWindDaten(preset, meshes) {
        const rec = this._foundryRecipeFor(preset);
        if (!rec || rec.panel !== "plant") return null;
        const an = rec.kind === "tree" || rec.kind === "shrub" ? 1 : 0;
        if (!an) return null;
        let top = 0,
            rinde = null;
        for (const m of meshes || []) {
            const pa = m && m.position && m.position.array;
            if (!pa) continue;
            if (!rinde && m.kind === "bark") rinde = pa;
            for (let i = 1; i < pa.length; i += 3) if (pa[i] > top) top = pa[i];
        }
        if (!(top > 0)) return null;
        const skala = this._foundryWorldScaleMatrix(preset).elements[5];
        const delta = globalThis.__phytoCore.windSchlankheit(rinde, top, skala);
        if (!(delta > 0)) throw new Error("_baumWindDaten: " + preset + " liefert keinen Stamm-Ring für den Wind");
        if (!this._windDeltaJeArt) this._windDeltaJeArt = new Map();
        if (!this._windDeltaJeArt.has(preset)) {
            this._windDeltaJeArt.set(preset, delta);
            let s = 0;
            for (const d of this._windDeltaJeArt.values()) s += d;
            this._karteWindDelta().value = s / this._windDeltaJeArt.size;
        }
        return { ht: top, delta, an };
    }

    // Die TSL-Algebra des Wind-Terms (phyto-core `windAusschlag`) — Rinde, Laub und Karte der Welt rechnen über ihr.
    static _windTsl(T) {
        return {
            k: (n) => T.float(n),
            add: (a, b) => a.add(b),
            mul: (a, b) => a.mul(b),
            min: (a, b) => T.min(a, b),
            max: (a, b) => T.max(a, b),
            pow: (a, b) => T.pow(a, b),
            sin: (a) => T.sin(a),
            sqrt: (a) => T.sqrt(a),
        };
    }

    // DER WIND IM PFLANZEN-STOFF (K19): Rinde und Laub jeder Foundry-Pflanze tragen den EINEN Wind-Term (phyto-core
    // `windAusschlag`, hier über der TSL-Algebra) — Stamm, Ast und Blatt je mit ihrer Frequenz, die Last aus der Wind-Zeile
    // des Wetters (U = uWindStrength / WEATHER_WIND_AMP, dieselbe Zeile, die das Wasser kräuselt), die Böe aus WIND_BOE
    // (Gras, Streu und Ohr lesen sie), die Richtung uWindDir. Je Baum: die Höhe H aus seinem Instanz-Stempel aH0 (die
    // Sichthöhe der Stufen-Blende, Vorlage × Instanz-Skala), f0 = kF · δ / H. Die Art-Größen (ht, δ, an) sind ein Stoff-Wert
    // (`userData.windArt`, `_stoffWert`): jede Art zeichnet ihren eigenen Stoff mit DEMSELBEN Knoten — EIN Graph für Laub, einer
    // für Rinde, Wurf und Bau (1310-18; bis dahin eine frische Uniform je Stoff, für r184 ein Programm je Art). r184 rechnet den
    // positionNode NACH der Instanzierung — positionLocal ist instanziert (Welt-Meter), positionGeometry die Vorlage.
    // Der WURF (kind "schatten": der Wurf-Teil der Foundry-L1, der Zwilling des Werkstatt-Baums) schwingt mit Stamm und
    // Ast wie sein Bild — der r184-Schattenpass zeichnet mit dem positionNode des Stoffs (Lehre 26). Das Blatt-Flattern
    // trägt er nicht: sein Hub (WIND_GESETZ.blatt.hub 0,035 m im Sturm) liegt unter dem Kaskaden-Texel (wurf 0,17 m).
    // Jeder Wurf zeichnet aus EINEM Programm (der eines Baus mit an 0).
    _baumWindStoff(mat, kind, baum) {
        if (!mat || mat.isNodeMaterial !== true || mat.positionNode) return;
        if (!this.state.windUniforms) this._grassInstanceMat();
        const laub = kind === "foliage" || kind === "foliageTex";
        // ohne Wind-Daten (Stumpf, liegender Stamm, Fels) steht der Stoff still (an 0) und teilt doch das Programm der Bäume
        mat.userData.windArt = new THREE.Vector3(baum ? baum.ht : 1, baum ? baum.delta : 0, baum ? baum.an : 0);
        mat.userData.baumWind = baum ? { ht: baum.ht, delta: baum.delta, an: baum.an } : null;
        if (!this._baumWindKnoten) this._baumWindKnoten = {};
        const da = this._baumWindKnoten[laub ? "laub" : "ast"];
        if (da) {
            mat.positionNode = da;
            return;
        }
        const T = THREE.TSL;
        const wu = this._ensureWindCoupling(T);
        const WG = globalThis.__phytoCore.WIND_GESETZ;
        const B = AnazhRealm.WIND_BOE;
        const uB = this._stoffWert(T, "userData.windArt", "vec3");
        const A = AnazhRealm._windTsl(T);
        const pG = T.positionGeometry;
        const pW = T.positionWorld;
        const ht = uB.x.max(1e-3);
        const H = T.attribute("aH0", "float").max(0.5);
        const ort = pW.x.mul(wu.uWindDir.x).add(pW.z.mul(wu.uWindDir.y));
        const g = T.sin(wu.uWindTime.mul(B.omega).sub(ort.mul(B.k)))
            .mul(B.amp)
            .add(B.mitte);
        const e = {
            t: wu.uWindTime,
            U: wu.uWindStrength.div(AnazhRealm.WEATHER_WIND_AMP),
            g,
            f0: uB.y.mul(WG.kF).div(H),
            H,
            zeta: pG.y.div(ht),
            rho: T.length(pG.xz).div(ht),
            phi: ort.mul(-B.k),
            psi: pG.x.mul(1.7).add(pG.y.mul(0.9)).add(pG.z.mul(1.3)).div(ht).mul(6.2832),
        };
        const w = globalThis.__phytoCore.windAusschlag(A, e, laub);
        const quer = w.quer.mul(uB.z);
        let off = T.vec3(wu.uWindDir.x.mul(quer), w.hoch.mul(uB.z), wu.uWindDir.y.mul(quer));
        if (laub) off = off.add(T.normalize(T.normalLocal).mul(w.flattern.mul(uB.z)));
        mat.positionNode = this._baumWindKnoten[laub ? "laub" : "ast"] = T.positionLocal.add(off);
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
    // aH0-Stempel und das Höhen-Buch lesen DIESE Zahl.
    _foundryGruppenHoehe(group, preset) {
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
        return maxY > minY ? Math.max(0.1, (maxY - minY) * ws) : 0.1;
    }
    _foundryBuildGroup(meshes, stage) {
        if (!Array.isArray(meshes) || !meshes.length) return null;
        const T = THREE;
        let group = null;
        // die Wind-Daten der Art (K19): Rinde und Laub ihrer Gestalt tragen sie im Stoff (`_baumWindStoff`)
        const baum = stage && stage.preset ? this._baumWindDaten(stage.preset, meshes) : null;
        try {
            group = new T.Group();
            for (const m of meshes) {
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
                if (mesh) group.add(mesh);
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
                const _capL = _D && Number.isFinite(_D.leafVisCap) ? _D.leafVisCap : 24;
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
        const KP = AnazhRealm.KIND_POLICY || {};
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
                    jobs.push(
                        this._foundryRequest(sp, sd, lod)
                            .then((meshes) => {
                                // Nur bei ECHTER Antwort cachen. Ein Timeout (meshes null) NICHT null
                                // cachen -> die Art bleibt on-demand nachfragbar.
                                if (meshes)
                                    this._foundryCacheSet(key, this._foundryBuildGroup(meshes, { lod, preset: sp }));
                            })
                            .catch((e) => this._stoffBruch("die Bibliothek (Vorab-Bau " + key + ")", e))
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
        const variant = this._foundryVariantFor(entry.seed, preset);
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
    _foundryRewarmColdTrees() {
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
        const archs = this.state.architectures;
        if (!Array.isArray(archs)) return 0;
        const pm = this.state.playerMesh ? this.state.playerMesh.position : null;
        const rad = this.state.architectureCullingRadius || 200;
        const radiusSq = rad * rad;
        // Zwei Budgets, nie 0: gedockte Assets sind billige WebGPU-Instances → placeBudget (gesund
        // FOUNDRY_PLACE_PER_TICK, über Budget 1); nicht gedockte lösen Bakes aus → bakeBudget (limitiert).
        // Eine harte overBudget-Wand verhungert die Aktivierung auf schwacher HW — progressiv konvergiert
        // die Welt immer zum Foundry-Wald, unter Last nur langsamer.
        const overBudget = this.state._frameOverBudget;
        let placeBudget = overBudget ? 1 : AnazhRealm.FOUNDRY_PLACE_PER_TICK || 48;
        // Backen auch über Budget (2/Tick): der Bake läuft OFF-THREAD im Worker, die Anfrage ist ein billiger
        // postMessage; nur das Platzieren bleibt placeBudget-begrenzt. Ein 0-Throttle ließe die nahen
        // LOD0/1-Bäume unter Last nie backen (kahle Nähe).
        let bakeBudget = overBudget ? 2 : AnazhRealm.FOUNDRY_BAKE_REQ_PER_TICK || 3;
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
        if (!V) return null;
        const h = Math.imul(seed >>> 0 || 0, 2654435761) >>> 0; // Knuth-Mix
        return 1 + Math.floor((h * V) / 4294967296);
    }
    // Die Gestalten-Zahl einer Art (die Budget-Zeile, sonst '*'); 0 = Buch kalt. Der Vorrat wärmt 1..V.
    _foundryGestalten(preset) {
        const cfg = AnazhRealm._studioRenderConfig;
        const G = cfg && cfg.lod && cfg.lod.budget ? cfg.lod.budget.gestalten : null;
        if (!G) return 0;
        const V = Number.isInteger(G[preset]) && G[preset] >= 1 ? G[preset] : G["*"];
        return Number.isInteger(V) && V >= 1 ? V : 0;
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
        f.ankunft = (f.ankunft | 0) + 1; // die Ankunfts-Generation: Wartende im Nah-Zweig fragen erst danach wieder
        const CAP = AnazhRealm.FOUNDRY_CACHE_CAP;
        const BYTES = AnazhRealm.FOUNDRY_CACHE_BYTES || Infinity;
        while (f.cache.size > CAP || f.cacheBytes > BYTES) {
            const oldest = f.cache.keys().next().value;
            if (oldest === key) break; // nie den gerade gesetzten räumen (ein Über-Budget-Solo-Eintrag bleibt — weiche Wand)
            this._foundryCacheEvict(oldest);
        }
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
            q._liveRefs = Math.max(0, (q._liveRefs || 0) - 1);
            if (q._evicted && !(q._liveRefs > 0)) this._disposeFoundryGroupGeom(q);
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
        const variant = this._foundryVariantFor(entry.seed, preset);
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
            if (!f.requested) f.requested = new Set();
            if (!f.requested.has(key)) {
                f.requested.add(key);
                // Wirft die Stufe mit einer ANDEREN Gestalt (Budget `schatten`: der L0-Baum wirft seine L1), reist diese
                // im selben Zug — sonst stellte sie sich erst nach der Ankunft ans Ende der Worker-Schlange, und die
                // Stufe wartete doppelt.
                if (!entryOv) {
                    const _wurf = this._foundryBudgetZeile(preset, lod).schatten;
                    if (_wurf !== false && _wurf !== lod) this._foundryFlattenFor(entry, preset, _wurf);
                }
                this._foundryRequest(preset, variant, lod, entryOv || undefined, entry.position).then((meshes) => {
                    if (meshes) {
                        this._foundryCacheSet(key, this._foundryBuildGroup(meshes, { lod, preset }));
                        this._scatterRefillPending = true; // ein Studio-Asset kam an → deferrierte Fern-Regionen neu streamen
                    } else {
                        // Timeout/Fehler: NICHT null cachen (das doomt die Art dauerhaft zu
                        // Grammatik) -> aus der requested-Wache loesen -> naechster Tick fragt neu.
                        f.requested.delete(key);
                    }
                    this._foundryRewarmColdTrees(); // das eben geladene Asset -> wartende Eintraege bauen
                });
            } else if (!entryOv) this._foundryNaeher(f, preset, variant, lod, entry.position);
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
                      huelle: group._huelle || null,
                      fern: group._fern || null,
                      wurfKosten,
                  }
                : false;
        }
        return group._foundryFlat;
    }
    // DIE INSTANZ-MATRIX OHNE KAPAZITÄT IM SHADER — der EINE Bau jeder InstancedMesh der Welt: r184 legt
    // instanceMatrix bis 64 KB als UNIFORM-Array `array<mat4x4f, N>` in den Vertex-Shader (InstanceNode) —
    // jede Kapazität (Büschel je Nah-Wiesen-Kachel, Gruppen-Wachstum 16 → 32 → …) wurde ein eigenes Programm
    // und eine eigene Pipeline, kompiliert beim Laufen. Gemessen 02.10. an der Mess-Wiese: 756 Vertex-
    // Programme auf 60 Fragment-Programme. Der Storage-Puffer ist laufzeit-dimensioniert (`array<mat4x4f>`):
    // EIN Programm je Material × Attribut-Form, gleich wie viele Instanzen.
    // DER ZEICHNER (1410-1): die Senke bleibt für die Welt eine InstancedMesh (Slots, `count`, Raycast, Wurf, Bündel) — gezeichnet
    // wird sie von ihrem Zeichner (`_instanzZeichner`), einem Mesh über einer InstancedBufferGeometry. r184 hängt an den
    // Programm-Schlüssel jeder InstancedMesh ihre uuid (`isInstancedMesh || count > 1`): jede Senke baute ihr eigenes Programm,
    // auch bei EINEM geteilten Graphen (1310-18: 51 Bauten an der Ankunft). Der Zeichner trägt keinen der beiden Terme; seine
    // Instanz-Zahl ist `instanceCount` der Geometrie, die Matrizen liest EIN geteilter Knoten (`_senkenKnoten`) je Zeichen-Objekt.
    static _instanzMesh(geom, mat, cap) {
        const m = new THREE.InstancedMesh(geom, mat, cap);
        if (typeof THREE.StorageInstancedBufferAttribute === "function")
            m.instanceMatrix = new THREE.StorageInstancedBufferAttribute(m.instanceMatrix.array, 16);
        AnazhRealm._instanzZeichner(m);
        return m;
    }
    // Die Senke projiziert r184 als GRUPPE (`_projectObject`: eine Gruppe zeichnet nicht, ihre Kinder schon) — sie zeichnet nur
    // über ihr Kind, den Zeichner. Die Gänge der Welt (`traverse`) sehen ihn nicht: er ist r184s Werkzeug, nicht ein Teil der
    // Welt (Zählungen, Kehraus und Linsen lesen die Senke, wie bisher).
    static _instanzZeichner(m) {
        const Z = AnazhRealm._instanzZeichnerKlasse();
        const z = new Z(m);
        m.isGroup = true;
        m.add(z);
        m.__zeichner = z;
        m.traverse = function (cb) {
            cb(this);
            for (const c of this.children) if (c !== z) c.traverse(cb);
        };
        m.traverseVisible = function (cb) {
            if (this.visible === false) return;
            cb(this);
            for (const c of this.children) if (c !== z) c.traverseVisible(cb);
        };
        return z;
    }
    // Der Zeichner einer Senke: Stoff, Wurf, Schichten, Hülle, Welt-Matrix und `userData` sind die der Senke (gelesen, nie
    // kopiert); seine Geometrie ist eine Fassade über der Geometrie der Senke — dieselben Attribut-Objekte, dazu die Instanz-
    // Farbe (`instanzFarbe`) und die Marke `aInstanzSenke`. Die Marke liest kein Shader (sie belegt keinen Vertex-Puffer); sie
    // trennt im Geometrie-Schlüssel den Zeichner von einem Mesh mit gleichen Attributen und gleichem Stoff (dessen Programm
    // instanziert nicht). Jeder Zugriff auf die Geometrie gleicht die Fassade mit der Quelle ab (ein Wachsen der Instanz-
    // Fassade tauscht Attribut-Objekte; r184 folgt über `needsGeometryUpdate`).
    static _instanzZeichnerKlasse() {
        if (AnazhRealm.__instanzZeichnerK) return AnazhRealm.__instanzZeichnerK;
        const T = THREE;
        const MARKE = new T.BufferAttribute(new Float32Array(1), 1);
        class InstanzZeichner extends T.Mesh {
            constructor(senke) {
                super(new T.InstancedBufferGeometry(), senke.material);
                const fassade = this.geometry;
                fassade.setAttribute("aInstanzSenke", MARKE);
                this.__instanzQuelle = senke;
                this.isInstanzZeichner = true;
                this.name = "instanz-zeichner";
                this._q = { geo: null, attr: null, index: null, farbe: undefined };
                const durch = (k) => ({
                    get: () => senke[k],
                    set: (v) => {
                        senke[k] = v;
                    },
                    configurable: true,
                });
                for (const k of [
                    "material",
                    "castShadow",
                    "receiveShadow",
                    "frustumCulled",
                    "renderOrder",
                    "userData",
                    "layers",
                ]) {
                    delete this[k];
                    Object.defineProperty(this, k, durch(k));
                }
                delete this.matrixWorld;
                delete this.geometry;
                Object.defineProperties(this, {
                    matrixWorld: { get: () => senke.matrixWorld, set: () => {}, configurable: true },
                    instanceColor: { get: () => senke.instanceColor, configurable: true },
                    boundingSphere: {
                        get: () => {
                            if (senke.boundingSphere === null) senke.computeBoundingSphere();
                            return senke.boundingSphere;
                        },
                        set: () => {},
                        configurable: true,
                    },
                    geometry: { get: () => this._fassade(fassade), set: () => {}, configurable: true },
                });
                this.matrixAutoUpdate = false;
                this.matrixWorldAutoUpdate = false;
            }
            _fassade(f) {
                const s = this.__instanzQuelle;
                const g = s.geometry;
                const q = this._q;
                const a = g.attributes;
                let anders = q.geo !== g || q.index !== g.index || q.farbe !== s.instanceColor;
                if (!anders) {
                    let n = 0;
                    for (const k in a) {
                        n++;
                        if (q.attr[k] !== a[k]) {
                            anders = true;
                            break;
                        }
                    }
                    if (n !== q.n) anders = true;
                }
                if (anders) {
                    for (const k of Object.keys(f.attributes))
                        if (k !== "aInstanzSenke" && !(k in a)) delete f.attributes[k];
                    let n = 0;
                    for (const k in a) {
                        f.attributes[k] = a[k];
                        n++;
                    }
                    if (s.instanceColor) f.attributes.instanzFarbe = s.instanceColor;
                    else delete f.attributes.instanzFarbe;
                    f.index = g.index;
                    f.groups = g.groups;
                    f.boundingBox = g.boundingBox;
                    f.boundingSphere = g.boundingSphere;
                    q.geo = g;
                    q.index = g.index;
                    q.farbe = s.instanceColor;
                    q.attr = Object.assign({}, a);
                    q.n = n;
                }
                f.drawRange.start = g.drawRange.start;
                f.drawRange.count = g.drawRange.count;
                f.instanceCount = s.count;
                return f;
            }
            computeBoundingSphere() {
                this.__instanzQuelle.computeBoundingSphere();
            }
            raycast() {}
            updateMatrixWorld() {}
            updateWorldMatrix() {}
        }
        AnazhRealm.__instanzZeichnerK = InstanzZeichner;
        return InstanzZeichner;
    }
    // DER EINE INSTANZ-KNOTEN DER SENKEN (1410-1): je Zeichen-Objekt die Matrix seiner Senke (Speicher-Puffer `instanzMatrix`,
    // `array<mat4x4f>` laufzeit-dimensioniert) am Index der Instanz — r184s InstanceNode, nur dass der Puffer je Objekt gelesen
    // wird statt im Graphen gebunden: der Knoten stellt seinen Wert je Objekt (Takt object, vor den Bindungen des Draws), und
    // r184 merkt je Bindung ihr Attribut und baut die Bindegruppe beim Wechsel neu (`Bindings._update`). Lage und Normale wie
    // r184 (`positionLocal` · `transformNormal`), die Instanz-Farbe als `vInstanceColor` (r184s Farb-Pfad liest sie), die
    // Matrix am Builder für den Ursprung der Instanz (`_instanzMitteNode`).
    static _senkenKnoten() {
        if (AnazhRealm.__senkenKnoten) return AnazhRealm.__senkenKnoten;
        const T = THREE.TSL;
        // die Klasse reicht die Bootstrap-Brücke nicht als THREE-Symbol: sie ist der Prototyp eines `storage`-Knotens
        const SB =
            THREE.StorageBufferNode ||
            (T.storage
                ? Object.getPrototypeOf(
                      T.storage(new THREE.StorageInstancedBufferAttribute(new Float32Array(16), 16), "mat4", 0)
                  ).constructor
                : null);
        const N = THREE.InstanceNode ? Object.getPrototypeOf(THREE.InstanceNode) : null;
        if (typeof SB !== "function" || !N || !T.transformNormal || !T.varyingProperty || !T.instanceIndex) {
            const text =
                "DIE SENKE: r184 StorageBufferNode · Node · transformNormal · varyingProperty fehlen (Vendor-Drift)";
            throw new Error(text);
        }
        const quelle = (o) => (o && o.__instanzQuelle ? o.__instanzQuelle.instanceMatrix : null);
        class SenkenMatrizen extends SB {
            constructor() {
                super(new THREE.StorageInstancedBufferAttribute(new Float32Array(16), 16), "mat4", 0);
                this.updateType = "object";
                this.setName("instanzMatrix");
            }
            setup(builder) {
                const im = quelle(builder.object);
                if (im) this.value = im;
                return super.setup(builder);
            }
            update(frame) {
                const im = quelle(frame.object);
                if (im) this.value = im;
            }
        }
        const matrix = new SenkenMatrizen().toReadOnly().element(T.instanceIndex);
        class SenkenInstanz extends N {
            constructor() {
                super("void");
            }
            setup(builder) {
                T.positionLocal.assign(matrix.mul(T.positionLocal).xyz);
                if (builder.hasGeometryAttribute("normal"))
                    T.normalLocal.assign(T.transformNormal(T.normalLocal, matrix));
                if (builder.geometry && builder.geometry.attributes && builder.geometry.attributes.instanzFarbe)
                    T.varyingProperty("vec3", "vInstanceColor").assign(T.attribute("instanzFarbe", "vec3"));
                builder.__anazhInstanzMatrix = matrix;
                return null;
            }
        }
        AnazhRealm.__senkenKnoten = { matrix, instanz: new SenkenInstanz() };
        return AnazhRealm.__senkenKnoten;
    }
    // DER GPU-ABSCHIED — der EINE Weg, auf dem eine Geometrie-Kopie die GPU verlässt. r184 trägt jedes hochgeladene
    // Attribut STARK in sein Register (`renderer.info.memoryMap`) und gibt es nur auf zwei Wegen frei: `_attributes.delete`
    // oder das `dispose`-Ereignis einer Geometrie — dieses nur für die Attribute des ERSTEN Render-Objekts, das sie zeichnete.
    // `InstancedMesh.dispose()` gibt nichts frei (r184 hört auf kein Objekt-Ereignis), die Basis-Attribute einer Foundry-
    // Gestalt, die eine Instanz-Fassade zeichnet, kennt r184 nur über die Fassade. Befund 05.10. (Radeon 890M, Mess-Wiese,
    // drei Schleifen à 1,2 km, Puffer-Linse `werkbank puffer`): 131 MB Geometrie-Puffer auf der GPU, davon 60,7 MB im Bild —
    // 55,6 MB hielt nur der Foundry-Cache (Gestalten ohne lebende Gruppe), 14,7 MB nur r184s Register (der alte Boden-Satz nach
    // dem Wachsen 11,4 MB, 1 530 Instanz-Matrizen gefallener Nah-Wiesen-Kacheln und Gruppen). Das Attribut selbst bleibt
    // (die CPU-Kopie im Cache); zeichnet es wieder ein Objekt, lädt r184 es neu hoch (die Version steigt). Verschränkte fallen nie
    // einzeln (r184 zerstört den geteilten Puffer und vergisst ihn nicht — das nächste Zeichnen läse einen toten Puffer).
    _gpuAbschied(attr) {
        const rend = this.state.renderer;
        if (!attr || attr.isInterleavedBufferAttribute || !rend || !rend._attributes || !rend.info) return false;
        if (!rend.info.memoryMap.has(attr)) return false;
        rend._attributes.delete(attr);
        // Die Version steigt: zeichnet ein altes Render-Objekt das Attribut wieder, sieht der Beobachter (r184 equals,
        // die Observer-Diät) die Änderung und lädt es hoch — ohne sie fände sein Draw keinen Puffer.
        attr.needsUpdate = true;
        return true;
    }
    // DER ABSCHIED EINER INSTANZ-SENKE — das Gegenstück zu `_instanzMesh`: ihre EIGENEN Instanz-Puffer (die Matrizen als
    // Speicher-Puffer, die Farben) verlassen die GPU. Der Speicher-Puffer fällt NUR hier: seine Bindegruppe hält ihn, und
    // r184 baut sie nur bei einem neuen Attribut-OBJEKT neu (`Bindings._update`), nie bei einem neu hochgeladenen Puffer —
    // eine Senke, die weiterlebt, darf ihn nie verlieren. Der Aufrufer hat sie aus Graph und Bündel genommen; Geometrie und
    // Stoff gehören ihm (geteilt).
    _instanzAbschied(mesh) {
        if (!mesh) return;
        this._gpuAbschied(mesh.instanceMatrix);
        this._gpuAbschied(mesh.instanceColor);
        // Die Render-Objekte der Senke (`_renderObjektRegister`) lösen sich: von Stoff und Geometrie (ihr dispose-Ereignis
        // hielt sie), ihr Knoten-Zustand aus r184s `nodeBuilderCache` (je Instanz-Senke unter ihrer uuid gecacht — er hält
        // über den InstancedMeshNode die Senke selbst; nach drei Wander-Schleifen 3 713 Zustände für 226 lebende Senken),
        // ihre eigenen Bindegruppen aus der Layout-Zählung. Dann nimmt der Collector sie samt Uniform-Puffern. Die Pipeline
        // bleibt im Cache, wie bisher (r184s eigenes `dispose` gäbe mit dem letzten Render-Objekt einer Familie auch sie frei —
        // die nächste Senke derselben Familie kompilierte neu); geteilte Gruppen gehören allen.
        AnazhRealm._renderObjekteLoesen(mesh);
        // gezeichnet hat ihr Zeichner (1410-1): seine Render-Objekte lösen sich ebenso
        if (mesh.__zeichner) AnazhRealm._renderObjekteLoesen(mesh.__zeichner);
        mesh.dispose();
    }
    // DIE LÖSUNG DER RENDER-OBJEKTE eines Objekts, das den Graphen für immer verlässt (`_instanzAbschied`, `_disposeSoulGroup`)
    // — in JEDEM Renderer, der es zeichnete (das Register ist eine Hülle der Klasse; `ro.renderer`). r184 hängt jedes Render-
    // Objekt an das dispose-Ereignis seines STOFFS (vendor/three.webgpu.min.js `this.material.addEventListener("dispose",
    // this.onMaterialDispose)`) und löst es selbst nur, wenn der Stoff fällt — ein geteilter Stoff fällt nie. Befund
    // (Frost-Nachbesserung 4, Radeon): jeder Regler-Wert der Werkstatt hängte 8 Hörer an die 8 geteilten Foundry-Stoffe,
    // +3,2–4,7 MB JS je Wert. Die Lösung nimmt die Hörer ab (Stoff und Geometrie) und die eigenen Bindegruppen; die Pipeline
    // bleibt im Cache, geteilte Gruppen gehören allen.
    // DER KNOTEN-BAU gehört seinem SCHLÜSSEL, nicht dem Objekt (Frost-Nachbesserung 5): r184 cacht ihn je
    // `initialCacheKey` (6:378979) und wirft ihn aus dem Cache, wenn sein letzter Nutzer geht (`Nodes.delete`, 6:380856).
    // Ein Leib aus geteilten Stoffen teilt den Schlüssel mit der Seele, die nach ihm kommt — die Lösung des Wolfs warf
    // den Knoten-Bau, den der Mensch eben noch hatte, und jede Rückkehr kompilierte neu (Radeon, 10 Seelenwechsel bei
    // offenem Tab: Welt +178 Pipelines / +175 Shader-Module, Ich-Bühne +18, Hof +53). Er fällt nur, wo der Schlüssel das
    // Objekt selbst trägt — r184 schreibt die uuid hinein bei Instanz-Senke, count > 1 oder Morph (6:209550): dort hält der
    // Zustand das Objekt und kann keinem anderen dienen.
    static _renderObjekteLoesen(obj) {
        const ros = obj && obj.__renderObjekte;
        if (!ros) return;
        obj.__renderObjekte = null;
        for (const ro of ros) {
            const rend = ro.renderer;
            const o = ro.object;
            if (ro.material) ro.material.removeEventListener("dispose", ro.onMaterialDispose);
            if (ro.geometry) ro.geometry.removeEventListener("dispose", ro.onGeometryDispose);
            // Auch ein BatchedMesh trägt Objekteigenes im Schlüssel (die uuid seiner Matrizen- und Farb-Textur, 6:209537) —
            // kommt je eins in den Stamm (heute 0), gehört `o.isBatchedMesh === true` in diese Bedingung.
            const eigenerSchluessel =
                !!o && (o.isInstancedMesh === true || o.count > 1 || Array.isArray(o.morphTargetInfluences));
            if (eigenerSchluessel && rend && rend._nodes) rend._nodes.delete(ro);
            if (rend && rend._bindings && ro._bindings)
                for (const bg of ro._bindings) {
                    const b0 = bg.bindings && bg.bindings[0];
                    if (b0 && b0.groupNode && b0.groupNode.shared === true) continue;
                    rend.backend.deleteBindGroupData(bg);
                    rend._bindings.delete(bg);
                    // r184 merkt jede Bindegruppe an jeder Textur, die sie liest (`bindGroups`, für den Neubau bei
                    // einem Textur-Wechsel) und vergisst sie nie: eine geteilte Textur (Karten-Atlas, Schatten-Karte)
                    // hielt so die Bindegruppe — und mit ihr die Uniform-Puffer — jeder je gezeichneten Senke.
                    for (const b of bg.bindings || [])
                        if (b.isSampledTexture && b.texture && rend._textures.has(b.texture)) {
                            const td = rend._textures.get(b.texture);
                            if (td.bindGroups) td.bindGroups.delete(bg);
                        }
                }
        }
    }
    // DAS RENDER-OBJEKT-REGISTER: r184 baut je (Objekt × Stoff × Pass-Kontext) ein Render-Objekt mit eigenen Uniform-Puffern
    // (`bindingBuffer…_object` · `_render`) und hängt es an das `dispose`-Ereignis seines STOFFS und seiner GEOMETRIE — ein
    // geteilter Stoff hielt so jedes Render-Objekt jeder je gezeichneten Senke für immer, der Collector nahm keins (Mess-Wiese
    // nach drei Wander-Schleifen: 7 481 Uniform-Puffer, 2,6 MB, keiner vom GC frei). Das Register merkt je Objekt seine
    // Render-Objekte: der Abschied einer Senke (`_instanzAbschied`) löst sie, der Kehraus liest aus ihnen, was das Objekt
    // WIRKLICH zeichnet — auch Attribute, die kein `geometry.attributes` trägt (r184s InstanceNode zeichnet die Instanz-
    // Farbe aus einem EIGENEN Attribut über `instanceColor.array`).
    // Das Register sitzt an der KLASSE der Render-Objekt-Verwaltung (Frost-Nachbesserung 4): jeder Renderer der Seite (Welt,
    // Werkstatt, Ich-, Hof-, Feed-Bühne) meldet seine Render-Objekte am Objekt an — die Bühnen zeichnen Gestalten aus Welt-
    // Vorlagen mit geteilten Stoffen, ihre Render-Objekte hingen sonst für immer an diesen Stoffen.
    _renderObjektRegister(renderer) {
        const inst = renderer && renderer._objects;
        const objs = inst && Object.getPrototypeOf(inst);
        if (!objs || objs.__anazhRegister || typeof objs.createRenderObject !== "function") return;
        objs.__anazhRegister = true;
        const roh = objs.createRenderObject;
        objs.createRenderObject = function (...a) {
            const ro = roh.apply(this, a);
            const o = ro && ro.object;
            if (!o) return ro;
            const liste = o.__renderObjekte || (o.__renderObjekte = []);
            liste.push(ro);
            // r184 löst ein Render-Objekt selbst (ein neuer Schlüssel, ein entsorgter Stoff): es verlässt das Register.
            const roDispose = ro.onDispose;
            ro.onDispose = () => {
                const l = o.__renderObjekte;
                const i = l ? l.indexOf(ro) : -1;
                if (i >= 0) l.splice(i, 1);
                roDispose();
            };
            return ro;
        };
        // DER GEOMETRIE-HALTER FÄLLT: r184 hängt an jede gezeichnete Geometrie EINEN dispose-Hörer, der das ERSTE Render-
        // Objekt einfängt (`initGeometry`, gehalten in der Map `_geometryDisposeListeners`) — eine Fassade, die nie entsorgt
        // wird, hielt so ihre erste Senke samt Render-Objekt, Knoten-Zustand und Uniform-Puffern für immer (Heap-Halter-
        // Suche 06.10.: zehn abgeschiedene Gruppen, alle zehn über diesen Hörer am Leben). Und sein Entsorgen löschte die
        // Attribute DIESES Render-Objekts — auch Basis-Attribute, die eine Fassade mit lebenden Gruppen teilt. Die Residenz
        // trägt der Kehraus (`_gpuKehraus`: was kein Objekt des Graphen zeichnet, verlässt die GPU); der Hörer fällt, nur
        // die Geometrie-Zählung des Infos bleibt ehrlich.
        const geos = renderer._geometries;
        if (geos && typeof geos.initGeometry === "function" && geos._geometryDisposeListeners) {
            const init = geos.initGeometry;
            geos.initGeometry = function (ro) {
                init.call(this, ro);
                const g = ro.geometry;
                const hoerer = this._geometryDisposeListeners.get(g);
                if (!hoerer) return;
                g.removeEventListener("dispose", hoerer);
                this._geometryDisposeListeners.delete(g);
                const info = this.info;
                const zaehlung = () => {
                    info.memory.geometries--;
                    g.removeEventListener("dispose", zaehlung);
                };
                g.addEventListener("dispose", zaehlung);
            };
        }
    }
    // DER SCHMALE INDEX (W7): r184 weitet beim Anlegen JEDES nicht-normierte 8-/16-bit-Attribut auf 32 bit (die Vertex-
    // Formate ohne x1/x3-Form) — auch den Index, den der Draw selbst als uint16 binden könnte (`setIndexBuffer` wählt das
    // Format nach dem Array-Typ): jeder 16-bit-Index lag doppelt auf der GPU, und die Foundry lieferte ihn ohnehin als
    // Uint32. Befund (echte GPU, Mess-Wiese, Puffer-Linse): 113 von 114 Index-Puffern hätten 16 bit gereicht, 2,8 MB zu viel
    // — der Spieler allein 0,9 MB. Der EINE Weg jedes Index auf die GPU (`createIndexAttribute`) legt einen Uint16-Index
    // ungeweitet an: das Weiten fragt `normalized` (für einen Index bedeutungslos), die Hülle setzt es nur für das Anlegen.
    // Ein 16-bit-Index, der danach teilweise neu schreibt, bräche an der 4-Byte-Ausrichtung von writeBuffer — die Sätze
    // (die einzigen Index-Schreiber) tragen Uint32 (gate:vendor-anker pinnt beide Vendor-Stellen).
    //
    // DAS BACKEND-GESETZ (Frost 07.10.): die Hüllen des WebGPU-Backends sitzen an der KLASSE, nie an einer Instanz. Die
    // Seite trägt fünf WebGPU-Renderer (Welt · Werkstatt · Ich-, Hof-, Feed-Bühne), und sie TEILEN Geometrie (die Mensch-
    // Vorlage `sharedGeom`, die Studio-Gestalten). r184 schreibt beim Anlegen die geweitete Form in das GETEILTE Attribut
    // zurück (`createAttribute`: `array = new Uint32Array(array)`), und der Draw bindet das Index-Format nach dem Array-Typ.
    // Befund (echte GPU, Radeon 890M, main V18.534): die Hülle lag nur an der Welt-Instanz; Tab öffnete die Ich-Bühne, ihr
    // Backend weitete die Mensch-Indizes, die Welt band acht Mensch-Meshes als uint32 auf 16-bit-Puffern („Index range …
    // does not fit", 1 760 Meldungen in Sekunden), jeder Render-Kontext der Welt wurde verworfen — das Bild stand, die Uhr
    // lief. Gerufen direkt nach dem Bau des Welt-Renderers (vor jedem init, vor jedem Attribut): jedes Backend der Seite
    // erbt (1) den schmalen Index und das Index-Maximum, gebucht am EINEN Weg jedes Index auf die GPU (Anlegen ganz,
    // Nachschreiben nur die geschriebenen Bereiche — die Sätze schreiben je Pass), (2) die Index-Wache am Draw (ein
    // Vergleich), (3) die GPU-Wache an seinem Device und an der Konsolen-Funktion von three.
    _backendGesetz(renderer) {
        const be = renderer && renderer.backend;
        if (!be || be.isWebGPUBackend !== true) return;
        const P = Object.getPrototypeOf(be);
        if (!P || P.__anazhGesetz === true) return;
        P.__anazhGesetz = true;
        const realm = this;
        const anlegen = P.createIndexAttribute;
        P.createIndexAttribute = function (attr) {
            const schmal = !!attr && attr.array instanceof Uint16Array && attr.normalized === false;
            if (schmal) attr.normalized = true;
            let aus;
            try {
                aus = anlegen.call(this, attr);
            } finally {
                if (schmal) attr.normalized = false;
            }
            const d = this.get(attr);
            // die Puffer-Größe einmal gelesen (GPUBuffer.size ist ein Binding-Aufruf — je Draw kostete er ~0,3 µs)
            d.__indexBytes = d.buffer ? d.buffer.size : 0;
            AnazhRealm._indexMaxBuchen(d, attr.array, null);
            return aus;
        };
        const nachschreiben = P.updateAttribute;
        P.updateAttribute = function (attr) {
            const d = this.get(attr);
            if (d.__indexMax !== undefined) AnazhRealm._indexMaxBuchen(d, attr.array, attr.updateRanges);
            return nachschreiben.call(this, attr);
        };
        const zeichnen = P.draw;
        P.draw = function (ro, info) {
            const idx = ro.getIndex();
            if (idx !== null) realm._indexWacheDraw(this, ro, idx);
            return zeichnen.call(this, ro, info);
        };
        const init = P.init;
        P.init = async function (r) {
            const aus = await init.call(this, r);
            realm._gpuWacheAn(this.device, (r && r.domElement && r.domElement.id) || "welt");
            return aus;
        };
        this._gpuWacheKonsole();
    }
    // DIE INDEX-WACHE (Frost 07.10.) — am Draw jedes Backends, je gezeichneter Geometrie: das Format, das der Draw bindet
    // (der Array-Typ), passt in den Puffer, der auf der GPU liegt, und kein gezeichneter Index greift über die Vertex-Zahl.
    // Ein Bruch steht beim NAMEN im Log (Objekt-Pfad · Geometrie · Zahlen · Backend), einmal je Geometrie und Art, gezählt
    // in `_indexWache` — vor der Device-Meldung, die nur „Index range … does not fit" kennt. Kosten: je Draw ein Vergleich
    // gegen das am Anlegen/Nachschreiben gebuchte Maximum (`_indexMaxBuchen`); den gezeichneten Bereich liest sie nur im
    // Verdacht (Maximum ≥ Vertex-Zahl — ein Satz trägt Luft hinter seinem Hochwasser), einmal je Version und Bereich.
    _indexWacheDraw(be, ro, idx) {
        const d = be.get(idx);
        const bytes = d.__indexBytes;
        if (!(bytes > 0)) return;
        const arr = idx.array;
        let art = null,
            detail = null;
        if (arr.byteLength > bytes) {
            art = "format";
            detail = `${idx.count} × ${arr.constructor.name} = ${arr.byteLength} B gebunden, der Puffer trägt ${bytes} B`;
        } else {
            const pos = ro.geometry.attributes.position;
            if (!pos || !(d.__indexMax >= pos.count)) return;
            const p = ro.getDrawParameters();
            if (p === null) return;
            const schluessel = idx.version + ":" + p.firstVertex + ":" + p.vertexCount + ":" + pos.count;
            if (!d.__wacheBereich || d.__wacheBereich.schluessel !== schluessel) {
                let m = 0;
                const bis = Math.min(arr.length, p.firstVertex + p.vertexCount);
                for (let i = p.firstVertex; i < bis; i++) if (arr[i] > m && arr[i] !== 4294967295) m = arr[i];
                d.__wacheBereich = { schluessel, max: m };
            }
            if (d.__wacheBereich.max < pos.count) return;
            art = "bereich";
            detail = `Index ${d.__wacheBereich.max} ≥ ${pos.count} Vertices im gezeichneten Bereich`;
        }
        const W = this._indexWache || (this._indexWache = { n: 0, brueche: [] });
        W.n++;
        const geo = ro.geometry.id;
        if (W.brueche.length >= 24 || W.brueche.some((b) => b.geometrie === geo && b.art === art)) return;
        const teile = [];
        for (let o = ro.object; o && teile.length < 7; o = o.parent) teile.unshift(o.name || o.type);
        const objekt = teile.join("/");
        const backend = (be.renderer && be.renderer.domElement && be.renderer.domElement.id) || "welt";
        W.brueche.push({ art, objekt, geometrie: geo, detail, backend });
        this.log(`INDEX-WACHE (${art}, ${backend}): ${objekt} · Geometrie ${geo} — ${detail}`, "ERROR");
    }
    // DIE GPU-WACHE (Frost 07.10.) — kein WebGPU-Validierungsfehler bleibt still. Zwei Wege führen eine Validierung aus der
    // GPU: (1) `uncapturederror` je Device (jedes Backend der Seite, nach seinem init) und (2) r184s eigene Fehler-Bereiche —
    // der async Pipeline-Bau hält `pushErrorScope` über ein await offen, jede Validierung dazwischen (auch ein fremder Draw)
    // landet dort, wird als THREE-Konsolenzeile gemeldet und markiert DIESE Pipeline für immer als kaputt (`error`, ihr Stoff
    // zeichnet nie wieder). Beide melden an `_gpuWacheMeldung`: beim Namen ins Log (die ersten 12 verschiedenen ganz, danach
    // die Zahl bei jeder Zehner-Potenz), gezählt in `_gpuWache`. Ein verworfener Befehlspuffer ist ein verlorenes Bild.
    _gpuWacheAn(device, name) {
        if (!device || device.__anazhWache === true || typeof device.addEventListener !== "function") return;
        device.__anazhWache = true;
        device.addEventListener("uncapturederror", (ev) =>
            this._gpuWacheMeldung(name, String((ev && ev.error && ev.error.message) || (ev && ev.error) || "?"))
        );
    }
    _gpuWacheKonsole() {
        if (typeof THREE === "undefined" || typeof THREE.setConsoleFunction !== "function") return;
        const vorher = typeof THREE.getConsoleFunction === "function" ? THREE.getConsoleFunction() : null;
        if (vorher && vorher.__anazhWache === true) return;
        const route = (art, msg, ...rest) => {
            if ((art === "error" || art === "warn") && AnazhRealm.GPU_VALIDIERUNG_RE.test(String(msg)))
                this._gpuWacheMeldung("three", String(msg).replace(/^THREE\./, ""));
            if (vorher) return vorher(art, msg, ...rest);
            const aus = console[art] || console.log;
            if (rest[0] && rest[0].isStackTrace) aus(rest[0].getError(msg));
            else aus(msg, ...rest);
        };
        route.__anazhWache = true;
        THREE.setConsoleFunction(route);
    }
    _gpuWacheMeldung(quelle, msg) {
        const W = this._gpuWache || (this._gpuWache = { n: 0, meldungen: [] });
        W.n++;
        const kopf = msg.split("\n")[0].slice(0, 200);
        if (W.meldungen.length < 12 && !W.meldungen.some((m) => m.kopf === kopf)) {
            W.meldungen.push({ quelle, kopf, n: W.n });
            this.log(`GPU-VALIDIERUNG (${quelle}, #${W.n}): ${msg.slice(0, 600)}`, "ERROR");
        } else if (Number.isInteger(Math.log10(W.n)))
            this.log(`GPU-VALIDIERUNG: ${W.n} Meldungen (zuletzt ${quelle}: ${kopf})`, "ERROR");
    }
    // Die Handschrift einer Dawn-Validierung (Kontext-Zeile „ - While …", ein ungültiges Objekt, ein Bereich, der nicht passt).
    static get GPU_VALIDIERUNG_RE() {
        return /\n\s*-\s*While |\[Invalid [A-Za-z]+|does not fit in|GPUValidationError/;
    }
    // Die schmalen Formen eines Assets (W7, Kosten ins Asset): ein Index über ≤ 65 535 Vertices trägt 16 bit (das Backend-
    // Gesetz hält ihn so auf der GPU), ein Haut-Gewicht 16 bit normiert (unorm16x4 statt float32x4 — 2 statt 4 B je Komponente;
    // der Shader liest dasselbe vec4, die Abweichung ≤ 1/131 070 je Gewicht).
    // Das Index-Maximum am Weg auf die GPU (Frost 07.10., `_backendGesetz`): das Anlegen und ein Voll-Schreiben lesen das
    // ganze Array, ein Teil-Schreiben nur seine Bereiche (die obere Schranke wächst, wie die Daten auf der GPU wachsen) —
    // die Kosten folgen den geschriebenen Bytes, nie der Puffer-Größe. 0xFFFFFFFF ist der Neustart-Index, kein Vertex.
    static _indexMaxBuchen(d, arr, bereiche) {
        const teil = !!bereiche && bereiche.length > 0 && d.__indexMax !== undefined;
        const n = arr.length;
        let m = teil ? d.__indexMax : 0;
        if (teil)
            for (let k = 0; k < bereiche.length; k++) {
                const b = Math.min(n, bereiche[k].start + bereiche[k].count);
                for (let i = Math.max(0, bereiche[k].start); i < b; i++) {
                    const v = arr[i];
                    if (v > m && v !== 4294967295) m = v;
                }
            }
        else
            for (let i = 0; i < n; i++) {
                const v = arr[i];
                if (v > m && v !== 4294967295) m = v;
            }
        d.__indexMax = m;
    }
    static _indexSchmal(arr, nVertices) {
        return nVertices <= 65535 && !(arr instanceof Uint16Array) ? Uint16Array.from(arr) : arr;
    }
    static _hautGewicht(arr, itemSize) {
        const w = new Uint16Array(arr.length);
        for (let i = 0; i < arr.length; i++) w[i] = Math.round(Math.min(1, Math.max(0, arr[i])) * 65535);
        return new THREE.BufferAttribute(w, itemSize || 4, true);
    }
    // DIE INSTANZ-ZAHL — der EINE Schreiber von `count` jeder Instanz-Senke (Instanz-Gruppen · Fundament · Zaun ·
    // Nah-Wiese · Nah-Streu): jede Senke ist DICHT ([0, n) lebt, ein freier Slot existiert nicht), und eine leere ist
    // unsichtbar — sie betritt keinen Pass (kein Render-Objekt, kein Bundle-Platz, kein Schatten-Werfer).
    static _instanzZahl(mesh, n) {
        mesh.count = n;
        mesh.visible = n > 0;
    }
    // DAS VERSCHMELZEN: die Foundry liefert Teile je Kind — Geröll 16 Steine EINES Materials, ein Fahrzeug ~700
    // Teile auf 40 Materialien. Jedes Teil war ein eigenes Leaf = eine eigene Instanz-Gruppe = ein Draw je Pass
    // und Region. Teile gleichen Materials und gleicher Attribut-Form liegen im selben Template-Raum (localMatrix
    // je Flat geteilt) → EINE Geometrie, ein Leaf. Tür-Flügel bleiben eigene Leaves (eigene Scharnier-Matrix; gleiche Gestalten
    // teilen ihre Geometrie als Instanz, `_foundryFluegelInstanz`), schwere
    // Teile (Baum-L0 — Konifere ~143k je Teil —, über phyto-core `BUDGET_GESETZ.verschmelzVerts` zusammen) auch —
    // die Kopie verdoppelte ihren Speicher für einen Draw. WAS verschmilzt, sagt das Budget-Gesetz: die Sippe des Teils
    // (phyto-core `budgetSippe`, am Mesh gestempelt) — dieselbe Regel, mit der es die Draws zählt (`budgetSippen`);
    // keine eigene Signatur im Wirt. Die Material-Identität steht dabei: zwei Materialien teilen nie eine Geometrie.
    // Die verschmolzene Geometrie gehört der Cache-Gruppe (`_eigen`): ihr Dispose und ihre Bytes laufen mit.
    _foundryFlatVerschmelzen(group, leaves) {
        const sippen = new Map();
        for (let i = 0; i < leaves.length; i++) {
            const lf = leaves[i];
            const k = lf.sippe ? lf.sippe + "|" + lf.mat.uuid : null;
            if (!k) continue;
            if (!sippen.has(k)) sippen.set(k, []);
            sippen.get(k).push(i);
        }
        const weg = new Set();
        let bytes = 0;
        for (const idx of sippen.values()) {
            if (idx.length < 2) continue;
            let n = 0;
            for (const i of idx) n += leaves[i].geom.attributes.position.count;
            if (n > globalThis.__phytoCore.BUDGET_GESETZ.verschmelzVerts) continue;
            const geo = AnazhRealm._geoVerbinden(idx.map((i) => leaves[i].geom));
            if (!geo) continue;
            const erst = leaves[idx[0]];
            leaves[idx[0]] = Object.assign({}, erst, { geom: geo, _eigen: true });
            for (let j = 1; j < idx.length; j++) weg.add(idx[j]);
            for (const k in geo.attributes) bytes += geo.attributes[k].array.byteLength;
            if (geo.index) bytes += geo.index.array.byteLength;
        }
        if (!weg.size) return;
        for (let i = leaves.length - 1; i >= 0; i--) if (weg.has(i)) leaves.splice(i, 1);
        // die Bytes der eigenen Geometrie buchen (die Räumung zieht group._cacheBytes wieder ab)
        const f = this._foundry;
        if (Number.isFinite(group._cacheBytes)) {
            group._cacheBytes += bytes;
            if (f && Number.isFinite(f.cacheBytes)) f.cacheBytes += bytes;
        }
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

    // Hängt Geometrien GLEICHER Attribut-Form aneinander (derselbe Raum, keine Transformation): jedes
    // Attribut wird kopiert, der Index versetzt (Uint32 ab 65 536 Vertices). Null bei abweichender Form.
    static _geoVerbinden(geoms) {
        const g0 = geoms[0];
        const namen = Object.keys(g0.attributes);
        const indiziert = !!g0.index;
        let nV = 0,
            nI = 0;
        for (const g of geoms) {
            if (!!g.index !== indiziert || Object.keys(g.attributes).length !== namen.length) return null;
            for (const k of namen) {
                const a = g.attributes[k],
                    b = g0.attributes[k];
                if (!a || a.isInterleavedBufferAttribute || a.itemSize !== b.itemSize) return null;
                if (a.normalized !== b.normalized || a.array.constructor !== b.array.constructor) return null;
            }
            nV += g.attributes.position.count;
            if (indiziert) nI += g.index.count;
        }
        const out = new THREE.BufferGeometry();
        for (const k of namen) {
            const b = g0.attributes[k];
            const arr = new b.array.constructor(nV * b.itemSize);
            let o = 0;
            for (const g of geoms) {
                const a = g.attributes[k];
                arr.set(a.array.subarray(0, a.count * a.itemSize), o);
                o += a.count * a.itemSize;
            }
            out.setAttribute(k, new THREE.BufferAttribute(arr, b.itemSize, b.normalized));
        }
        if (indiziert) {
            const idx = nV > 65535 ? new Uint32Array(nI) : new Uint16Array(nI);
            const basen = [];
            let o = 0,
                basis = 0;
            for (const g of geoms) {
                basen.push(basis);
                basis += g.attributes.position.count;
            }
            for (let j = 0; j < geoms.length; j++) {
                const ia = geoms[j].index.array;
                for (let i = 0; i < geoms[j].index.count; i++) idx[o++] = ia[i] + basen[j];
            }
            out.setIndex(new THREE.BufferAttribute(idx, 1));
        }
        out.computeBoundingBox();
        out.computeBoundingSphere();
        return out;
    }
    // Die EINE Template→Welt-Scale-Quelle (Studio `SCALE[sp]·tr.s·0.82`): gecachte Scale-Matrix für die
    // Flat-Leaves. Bäume tragen den 0.82-Wald-Mul, strauch/blume/Fels/Kristall die reinen Tabellen-Werte,
    // Unbekanntes → Identität. Read-only → ein Cache je Faktor. Leser: das Bild (`_foundryFlattenFor`, die Karte) UND die
    // Kollision (`_studioWeltSkala`) — beide in derselben Skala.
    _foundryWorldScaleMatrix(preset) {
        if (!this._foundryScaleMats) this._foundryScaleMats = new Map();
        // Die LIVE-Quelle führt: `PORTAL_RENDER_CONFIG.placement` (foundry-core.js via get-render-config)
        // trägt die Welt-Skala je Preset — Studio-Edit oder neues Preset folgt ohne Code (gate:nervensystem).
        // Vor dem Buch liest sie DIESELBE Tafel synchron aus dem Kern (`__terrainCore.PORTAL_RENDER_CONFIG`) — der
        // Hand-Spiegel STUDIO_WORLD_SCALE fiel (er trug nur die Bäume: ein Fels kollidierte bis zum Buch in
        // Vorlagen-Größe, Leben-Schau 2). Understory (Vorlagen-scale < 1) trägt den 0.82-Mul NICHT; ein Preset ohne
        // scale-Zeile → 1.
        const rc = AnazhRealm._studioRenderConfig;
        const live = rc && rc.placement && rc.placement.scale ? rc.placement : AnazhRealm._studioPlatzKern();
        const T = live.scale;
        const treeMul = live.treeScaleMul;
        const base = T && Object.prototype.hasOwnProperty.call(T, preset) ? T[preset] : 1;
        const k = base === 1 ? 1 : base < 1 ? base : base * treeMul;
        let m = this._foundryScaleMats.get(k);
        if (!m) {
            m = new THREE.Matrix4();
            if (k !== 1) m.makeScale(k, k, k);
            this._foundryScaleMats.set(k, m);
        }
        return m;
    }
    // Distanz-LOD (die Vorlagen-LODs 0/1/2): nah = voll (LOD 0 < 25 m), mittel = LOD 1, fern = LOD 2.
    // Perf-bewusst — die meisten Wald-Baeume sind mittel -> das leichte LOD 1.
    _foundryLodForEntry(entry) {
        const p = this._lodAuge(); // vom Auge der Maske (K36), wie der LOD-Tick
        if (!p || !entry || !entry.position) return 1;
        const d = Math.hypot(entry.position.x - p.x, entry.position.z - p.z);
        // DIE EINE STUFEN-WAHL: der Kalt-Schätzer fragt dieselbe Wahl wie der LOD-Tick — Wahrnehmungs-Distanz aus der
        // Sichthöhe (`_lodTreeVisHeight`, 0 = roh für Nicht-Bäume), ohne Hysterese-Zustand. Vorher las er nur die rohe
        // Distanz: die Rampe setzte einen großen Baum in 40 m auf die Karte (dithernd, grau), und der LOD-Tick holte
        // ihn erst Takte später auf L1 (5 Wechsel je Takt, 04.10. an der Mess-Wiese 191 Plätze im ersten Takt).
        return this._chooseLODForDistance(d, undefined, this._lodTreeVisHeight(entry));
    }
    // ==================== JAHRESZEIT (Vorlagen-Phaenologie) ====================
    _seasonName(phase) {
        const p = ((phase % 1) + 1) % 1;
        if (p < 0.25) return "spring";
        if (p < 0.5) return "summer";
        if (p < 0.75) return "autumn";
        return "winter";
    }
    // Die EINE Saison-Tönungs-Uniform, lazy (TSL muss geladen sein): die Nah-Wiese (`_grassInstanceMat`), das
    // Foundry-Laub/-Gras (`_foundryTreeMaterial`) und die Karte (Impostor-Stoff) lesen `uSeasonMul` als Albedo-
    // Multiplikator, `_tickSeason` fährt sie aus `state.seasonPhase` (kein Rebuild). Abgeleitet, nicht im Snapshot
    // (audit-strict-Whitelist).
    _ensureSeasonUniforms() {
        if (this.state.seasonUniforms) return this.state.seasonUniforms;
        const TSL = THREE.TSL;
        this.state.seasonUniforms = { uSeasonMul: TSL.uniform(new THREE.Color(1, 1, 1)) };
        // UNIFORM-HEIMAT (Review-Riss F1, 19.07.): _tickSeason mutiert je Frame,
        // das Gras-Material ist diät-behandelt — ohne renderGroup fröre jeder
        // per-Objekt-Klon auf dem Stand seines letzten Refresh ein (Patchwork).
        this._uniformHeimatTeilen(this.state.seasonUniforms);
        return this.state.seasonUniforms;
    }

    // uSeasonMul nach dem STUDIO-GESETZ (phytogenesis.js updateWorld, SAISON_GESETZ in foundry-core): die Saison-
    // Tönung linear zwischen den vier Stützstellen (Studio-t: 0 Frühling · .25 Sommer · .5 Herbst · .75 Winter), je
    // Kanal clamp(tönung / bau, mulMin, mulMax) — in den Paletten-Werten (roh /255), wie das Studio mit r128-Farben
    // rechnet. Die Welt-Phase zählt die Saison-MITTEN (Sommer 0,375) → t = phase − 0,125; Sommer ist ×1. Rein (ohne
    // TSL), schreibt in `out` (r/g/b); das Gate ruft es GPU-frei.
    _saisonMul(phase, out) {
        const SG = AnazhRealm._saisonGesetz();
        const t = (((phase - 0.125) % 1) + 1) % 1;
        const f = t * 4;
        const i = Math.floor(f) % 4;
        const j = (i + 1) % 4;
        const k = f - Math.floor(f);
        const a = SG.stuetzen[i].ti;
        const b = SG.stuetzen[j].ti;
        const kanal = (hex, s) => ((hex >> s) & 255) / 255;
        const mul = (s) => {
            const v = (kanal(a, s) + (kanal(b, s) - kanal(a, s)) * k) / Math.max(kanal(SG.bau, s), 1e-3);
            return v < SG.mulMin ? SG.mulMin : v > SG.mulMax ? SG.mulMax : v;
        };
        out.r = mul(16);
        out.g = mul(8);
        out.b = mul(0);
        return out;
    }

    // Die langsame Jahres-Uhr: treibt seasonPhase und leitet den Saison-Namen ab. DIE SAISON IST EINE FARBE (V18.527):
    // jeder Foundry-Körper und jede Karte ist Golden-Sommer gebacken (die Transport-Schale nagelt season "summer"),
    // das Jahr trägt die EINE Uniform `uSeasonMul` — Laub, Gras und Karte multiplizieren ihre Albedo damit (die Karte
    // zu SAISON_GESETZ.kartenGewicht). Kein Neubau, kein Schlüssel-Wechsel: die 36 Sommer↔Winter-Golden-Paare
    // unterscheiden sich nur in der Laubfarbe (foliage.color), das Studio färbt sein Jahr genauso.
    _tickSeason(currentTime) {
        const st = this.state;
        if (typeof st.seasonPhase !== "number") st.seasonPhase = 0.375;
        // Nur der DRIFT wartet auf die Bühne (die Tönung läuft immer). `_lastSeasonTime` bleibt bis zur Bühne null →
        // der erste Tick startet mit dt=0 (kein Zeit-Sprung).
        if (st.autoSeason !== false && this._buehneSteht()) {
            const now = currentTime || 0;
            if (this._lastSeasonTime == null) this._lastSeasonTime = now;
            const dt = Math.min(0.2, Math.max(0, (now - this._lastSeasonTime) / 1000));
            this._lastSeasonTime = now;
            const yearSec = st.seasonYearSeconds > 0 ? st.seasonYearSeconds : 2400;
            st.seasonPhase = (st.seasonPhase + dt / yearSec) % 1;
        }
        const su = this._ensureSeasonUniforms();
        if (su && su.uSeasonMul && su.uSeasonMul.value) this._saisonMul(st.seasonPhase, su.uSeasonMul.value);
        st.season = this._seasonName(st.seasonPhase);
    }
    // Explizit setzen (Chat/DSL): "fruehling/sommer/herbst/winter" — die Phase springt auf die Saison-Mitte, die
    // Tönung folgt im nächsten Tick (kein Neubau).
    setSeason(name) {
        const map = {
            fruehling: "spring",
            frühling: "spring",
            spring: "spring",
            sommer: "summer",
            summer: "summer",
            herbst: "autumn",
            autumn: "autumn",
            winter: "winter",
        };
        const key = map[String(name || "").toLowerCase()];
        if (!key) return false;
        const phaseFor = { spring: 0.125, summer: 0.375, autumn: 0.625, winter: 0.875 };
        this.state.seasonPhase = phaseFor[key];
        this.state.season = key;
        return true;
    }
    // ==================== WETTER: sichtbarer Regen ====================
    // AnazhRealm hat state.weather (sunny/rainy/stormy) schon fuer Himmel/Wind/Naesse — hier der
    // sichtbare Niederschlag: eine Punktwolke, die dem Spieler folgt + faellt, bei rainy/stormy.
    // DER REGEN (Welle L, W-R1/W-kD5): EIN Gesetz für Labor und Welt (foundry-core REGEN_GESETZ) — fallende Schlieren in
    // einem Kasten um das Auge, der Wind treibt und neigt sie, die Deckung folgt der Regen-Stärke des Wetters. Gezeichnet
    // als EIN instanziertes Sprite (PointsNodeMaterial: je Schliere ein Quad Breite × Länge in Welt-Maß; die Lage rechnet
    // der Vertex aus Saat + Zeit, kein CPU-Umlauf je Frame). Bis V18.531 eine Punktwolke — WebGPU zeichnet Punkte ein
    // Pixel groß: im Sturm lag kein Tropfen im Bild, senkrecht bei jedem Wind, und das Labor zeichnete andere Zahlen.
    _ensureRainSystem() {
        if (this._rainSystem) return this._rainSystem;
        if (!this.state.scene || typeof THREE === "undefined") return null;
        const RG =
            AnazhRealm.Gesetz("terrain:REGEN_GESETZ", null) || AnazhRealm._kernPflichtBruch("terrain:REGEN_GESETZ");
        const T = THREE.TSL;
        const N = RG.anzahl;
        // Die Saat je Schliere (Lage im Kasten 0..1, Länge) aus einem festen Strom — das Bild ist reproduzierbar.
        const saat = new Float32Array(N * 4);
        let h = 2166136261 >>> 0;
        const zufall = () => {
            h ^= h << 13;
            h >>>= 0;
            h ^= h >>> 17;
            h ^= h << 5;
            h >>>= 0;
            return h / 4294967296;
        };
        for (let i = 0; i < N; i++) {
            saat[i * 4] = zufall();
            saat[i * 4 + 1] = zufall();
            saat[i * 4 + 2] = zufall();
            saat[i * 4 + 3] = RG.laenge[0] + zufall() * RG.laenge[1];
        }
        const s4 = T.instancedBufferAttribute(new THREE.InstancedBufferAttribute(saat, 4));
        const uZeit = T.uniform(0);
        const uDrift = T.uniform(new THREE.Vector2(0, 0));
        const uWinkel = T.uniform(0);
        const R = RG.raum;
        // Fallen (y) und Treiben (xz), je Achse in den Kasten um das Auge zurückgefaltet.
        const x = T.fract(s4.x.add(uDrift.x.mul(uZeit).div(R[0])))
            .sub(0.5)
            .mul(R[0]);
        const y = T.fract(s4.y.sub(uZeit.mul(RG.fall).div(R[1])))
            .sub(0.5)
            .mul(R[1]);
        const z = T.fract(s4.z.add(uDrift.y.mul(uZeit).div(R[2])))
            .sub(0.5)
            .mul(R[2]);
        // Das Maß im Bild: r184 teilt die Sprite-Größe durch die Tiefe, ohne die Brennweite — `uProj` (Projektion [1][1])
        // macht Breite und Länge zu Welt-Metern. Eine Schliere schmaler als `minPixel` zeichnet `minPixel` breit und deckt
        // anteilig (die Pixel-Deckung): fern wird der Regen ein Schleier, nah eine Schliere; am Auge und an den Kasten-
        // Rändern blendet er aus (kein Schnitt, wo der Kasten faltet).
        const uProj = T.uniform(1);
        const tiefe = T.positionView.z.negate().max(0.05);
        const pixelM = tiefe.mul(2).div(uProj.mul(T.viewportSize.y));
        const breiteM = pixelM.mul(RG.minPixel).max(RG.breite);
        const rand = T.length(T.vec2(x, z)).div(R[0] * 0.5);
        const blende = T.varying(
            T.min(T.float(RG.breite).div(breiteM), 1)
                .mul(T.smoothstep(0.4, 2.0, tiefe))
                .mul(T.float(1).sub(T.smoothstep(0.7, 1.0, rand)))
        );
        const mat = new THREE.PointsNodeMaterial({ color: RG.farbe, transparent: true, depthWrite: false, opacity: 0 });
        mat.positionNode = T.vec3(x, y, z);
        mat.sizeNode = T.vec2(breiteM, s4.w).mul(uProj);
        mat.opacityNode = T.materialOpacity.mul(blende);
        mat.rotationNode = uWinkel;
        mat.sizeAttenuation = true;
        const mesh = new THREE.Sprite(mat);
        AnazhRealm._instanzZahl(mesh, N);
        mesh.frustumCulled = false;
        mesh.renderOrder = 5;
        // H3 (gate:asset-inventory) — IDENTITÄTS-STEMPEL: der Regen ist Wetter-Substanz (sichtbar, solange das Wetter
        // regnet; folgt dem Auge).
        mesh.userData.inventar = "wetter-regen";
        mesh.visible = false;
        this.state.scene.add(mesh);
        this._rainSystem = { mesh, uZeit, uDrift, uWinkel, uProj, RG };
        return this._rainSystem;
    }
    _tickRain(currentTime) {
        const st = this.state;
        const wf = this._weatherFieldFor(st.weather);
        if (!(wf.rain > 0.01)) {
            if (this._rainSystem && this._rainSystem.mesh) this._rainSystem.mesh.visible = false;
            return;
        }
        const sys = this._ensureRainSystem();
        if (!sys || !sys.mesh) return;
        const RG = sys.RG;
        sys.mesh.visible = true;
        const cam = st.camera;
        if (cam) sys.mesh.position.copy(cam.position);
        sys.mesh.material.opacity = Math.min(RG.deckung, wf.rain * RG.deckung);
        // Die Uhr der Schlieren (s), auf eine Stunde gefaltet (float-Genauigkeit im Vertex).
        const t = ((currentTime || 0) / 1000) % 3600;
        sys.uZeit.value = t;
        const wd = this._windDirAt(t);
        const v = RG.drift * Math.max(wf.wind, 0.1);
        sys.uDrift.value.set(wd.x * v, wd.z * v);
        // Die Neigung im Bild: der Drift-Anteil quer zur Blickrichtung gegen das Fallen (Bild-Rechts = Spalte 0 der Kamera).
        if (cam) {
            const m = cam.matrixWorld.elements;
            sys.uWinkel.value = Math.atan2(wd.x * v * m[0] + wd.z * v * m[2], RG.fall);
            sys.uProj.value = cam.projectionMatrix.elements[5];
        }
    }
}
